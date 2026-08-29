// Local-only interaction QA. The production route never receives these helper controls.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.wav':'audio/wav', '.mp3':'audio/mpeg', '.json':'application/json' };
const fixture = `document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.createElement('aside');
  panel.style.cssText='position:fixed;bottom:0;left:0;z-index:200;background:#222;color:white;font:10px monospace;display:flex;gap:3px';
  const add=(label,action)=>{const button=document.createElement('button');button.textContent=label;button.onclick=action;panel.append(button);};
  add('QA Hold Warden',()=>{const target=document.getElementById('terminal-title');target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:81,pointerType:'touch',button:0}));setTimeout(()=>target.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:81,pointerType:'touch',button:0})),3100);});
  add('QA Hold Countdown Exit',()=>{const target=document.getElementById('countdown-screen'),rect=target.getBoundingClientRect(),init={bubbles:true,pointerId:82,pointerType:'touch',button:0,clientX:rect.left+8,clientY:rect.top+8};target.dispatchEvent(new PointerEvent('pointerdown',init));setTimeout(()=>target.dispatchEvent(new PointerEvent('pointerup',init)),4100);});
  document.body.append(panel);
});`;
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__countdown-test__/'){
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head><base href="/"><script>'+fixture+'</script>');
    res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html);return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(8083,'127.0.0.1',()=>console.log('Countdown UI QA: http://localhost:8083/__countdown-test__/'));
