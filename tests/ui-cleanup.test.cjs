const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const constants = source.split(/\r?\n/).filter(line=>/^  const (VERSION|DISPLAY_VERSION|EDEM_PASSCODE|DIRECTIVE_ACCESS_CODE|WARDEN_PIN|SANITIZATION_ACCESS_CODE|MEDICAL_RELEASE_PASSWORD|AUDIT_TOKEN_PASSCODE|MAINTENANCE_ACCESS_CODE) =/.test(line)).join('\n');
function extract(name){const start=source.indexOf(`  function ${name}(`);return source.slice(start,source.indexOf('\n  }',start)+4);}
test('all UI version fields use the shared display-only version without changing the build',()=>{
  const values=vm.runInNewContext(constants+'\n({VERSION,DISPLAY_VERSION})');
  assert.equal(values.VERSION,fs.readFileSync(path.join(root,'VERSION'),'utf8').trim());
  assert.equal(values.DISPLAY_VERSION,'v'+values.VERSION.replace(/-dev$/,''));
  assert.equal((html.match(/data-version-label/g)||[]).length,4);
  assert.doesNotMatch(html,/>[^<]*\d+\.\d+\.\d+-dev/);
  assert.match(source,/versionOut\.textContent=DISPLAY_VERSION/);
  assert.match(source,/querySelectorAll\('\[data-version-label\]'\)/);
});
test('Edem footer text is empty; branding and unprotected personal navigation remain',()=>{
  assert.match(source,/edem: \{[^\n]+interface:''/);
  assert.doesNotMatch(source,/AMBER CRT INTERFACE/);
  assert.match(source,/ETOS PERSONAL WORKSTATION/);
  assert.match(html,/<span id="interface-label">/);
  const render=extract('renderEdem');
  assert.doesNotMatch(render,/password|passcode|authorization/i);
});
for(const value of ['0718','51895','718','']){
  test(`Edem biosignal validation ${value==='0718'?'accepts new code':'rejects nonmatching code '+JSON.stringify(value)}`,()=>{
    const input={value,focus(){}},error={textContent:''};
    const context=vm.createContext({document:{getElementById:()=>input,querySelector:()=>error},playAudio(){},renderTerminal(){},executiveAuthorized:false,biosignalUnlocked:false,directiveUnlocked:false,facilityOverlay:'biosignal',facilityView:'organization'});
    vm.runInContext(constants+extract('authorizeBiosignal')+'\nauthorizeBiosignal();',context);
    assert.equal(context.biosignalUnlocked,value==='0718');
    if(value!=='0718')assert.equal(error.textContent,'AUTHORIZATION DENIED');
  });
  test(`Edem Medbay validation handles ${JSON.stringify(value)}`,()=>{
    let handler;
    const input={value},result={textContent:''};
    const context=vm.createContext({root:{addEventListener:(_,fn)=>{handler=fn;},querySelector:s=>s==='[data-medbay-password]'?input:result},systems:{querySelector:()=>null},playAudio(){},saveFacilitySystemState(){},updateFacilityDiagnostic(){},facilitySystemState:{medbayUnlocked:false}});
    const listener=source.split(/\r?\n/).find(line=>line.includes("root.addEventListener('click',event=>{const targetButton="));
    vm.runInContext(constants+'\n'+listener,context);
    handler({target:{closest:s=>s==='[data-medbay-unlock]'?{}:null}});
    assert.equal(context.facilitySystemState.medbayUnlocked,value==='0718');
    if(value!=='0718')assert.match(result.textContent,/CREDENTIALS REJECTED/);
  });
}
test('unrelated credentials are unchanged and Edem fields use four digits',()=>{
  const values=vm.runInNewContext(constants+'\n({WARDEN_PIN,DIRECTIVE_ACCESS_CODE,SANITIZATION_ACCESS_CODE,MEDICAL_RELEASE_PASSWORD,AUDIT_TOKEN_PASSCODE,MAINTENANCE_ACCESS_CODE})');
  assert.deepEqual(JSON.parse(JSON.stringify(values)),{WARDEN_PIN:'8722',DIRECTIVE_ACCESS_CODE:'51895',SANITIZATION_ACCESS_CODE:'010387',MEDICAL_RELEASE_PASSWORD:'0718',AUDIT_TOKEN_PASSCODE:'HBADT872',MAINTENANCE_ACCESS_CODE:'12345'});
  assert.match(source,/id="biosignal-access-code"[^>]+maxlength="4"/);
  assert.match(source,/maxlength="4" data-medbay-password/);
  assert.match(extract('authorizeDirective'),/input.value === DIRECTIVE_ACCESS_CODE/);
});
