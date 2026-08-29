// Local-only layout QA. Production pages never load the simulated hold controls.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.wav':'audio/wav', '.mp3':'audio/mpeg', '.json':'application/json' };
const fixture = `document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.createElement('aside');
  panel.style.cssText='position:fixed;bottom:0;left:0;z-index:200;background:#222;color:white;font:11px monospace;display:flex;gap:4px';
  for(const [label,selector] of [['QA Hold Warden','#terminal-title'],['QA Hold Data Module','[data-medical-data-module]']]){
    const button=document.createElement('button');button.textContent=label;
    button.onclick=()=>{
      const target=document.querySelector(selector);if(!target)return;
      const rect=target.getBoundingClientRect(),hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
      if(!target.contains(hit))throw Error('QA hold target blocked');
      // Synthetic pointers cannot obtain browser capture; bypass only this test ID.
      const workspace=document.getElementById('terminal-workspace'),capture=workspace.setPointerCapture;
      workspace.setPointerCapture=function(id){if(id!==77)capture.call(this,id);};
      try{target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:77,pointerType:'touch',button:0}));}
      finally{workspace.setPointerCapture=capture;}
      setTimeout(()=>target.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:77,pointerType:'touch',button:0})),3100);
    };
    panel.append(button);
  }
  document.body.append(panel);
});`;
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__medical-test__/'){
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head><base href="/"><script>'+fixture+'</script>');
    res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html);return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(8082,'127.0.0.1',()=>console.log('Medical layout QA: http://localhost:8082/__medical-test__/'));
