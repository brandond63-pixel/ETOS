$ErrorActionPreference = 'Stop'
$port = 8080
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)

function Get-ContentType([string]$path) {
    switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
        '.html' { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.webmanifest' { 'application/manifest+json; charset=utf-8' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif'  { 'image/gif' }
        '.svg'  { 'image/svg+xml' }
        '.ico'  { 'image/x-icon' }
        '.wav'  { 'audio/wav' }
        '.mp3'  { 'audio/mpeg' }
        '.ogg'  { 'audio/ogg' }
        '.woff' { 'font/woff' }
        '.woff2'{ 'font/woff2' }
        default { 'application/octet-stream' }
    }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
try {
    $listener.Start()
} catch {
    Write-Host "Port $port is already in use." -ForegroundColor Red
    Write-Host "Close any other ETOS server window and try again."
    exit 1
}

$url = "http://localhost:$port/"
Write-Host ""
Write-Host "ETOS LOCAL DEVELOPMENT SERVER" -ForegroundColor Green
Write-Host "--------------------------------"
Write-Host "ETOS is available at $url"
Write-Host "Keep this window open while testing."
Write-Host "Close this window or press Ctrl+C to stop ETOS."
Write-Host ""

Start-Process $url

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
            }

            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2) { continue }
            $method = $parts[0]
            $rawPath = $parts[1].Split('?')[0]
            $decodedPath = [System.Uri]::UnescapeDataString($rawPath).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($decodedPath)) { $decodedPath = 'index.html' }

            $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $decodedPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
            $isInsideRoot = $candidate.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)

            if (-not $isInsideRoot -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('404 - File not found')
                $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($candidate)
            $contentType = Get-ContentType $candidate
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-store, no-cache, must-revalidate`r`nPragma: no-cache`r`nExpires: 0`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne 'HEAD') { $stream.Write($bytes, 0, $bytes.Length) }
        } catch {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Yellow
        } finally {
            if ($stream) { $stream.Dispose() }
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
