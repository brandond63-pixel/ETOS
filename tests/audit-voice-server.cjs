// Local-only UI test server. Only /__audit-test__/ injects simulated browser APIs.
// The normal application and deployed files never load these mocks.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.wav':'audio/wav', '.mp3':'audio/mpeg', '.json':'application/json' };
http.createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__audit-test__/') {
    const html = fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>', '<head><base href="/"><script src="/tests/fixtures/audit-voice-mocks.js"></script>');
    res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'}); res.end(html); return;
  }
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(8080,'127.0.0.1',()=>console.log('Audit UI test server: http://localhost:8080/__audit-test__/'));
