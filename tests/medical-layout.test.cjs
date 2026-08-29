const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../css/themes/medical.css'), 'utf8');
function extract(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.notEqual(start, -1);
  return source.slice(start, source.indexOf('\n  function ', start + 1));
}
const context = vm.createContext({ state:{}, medicalSection:'overview', medicalContainmentRecord:'01', medicalAction:null,
  medicalMediaMessage:'', medicalMediaView:null, medicalGenomicOverlayOpen:true,
  medicalSectionContent:()=>'', renderMedicalInjectorPort:()=>'<button data-medical-injector-open>INJECTOR</button>',
  renderMedicalMediaOverlay:()=>'', renderMedicalInjectorOverlay:()=>'', renderMedicalAuthorization:()=>'' });
const api = vm.runInContext(['ensureMedicalState','renderMedical','renderMedicalDataPort','medicalDataLedState','medicalImage','renderHostileSpecimen','renderContainment','renderGenomicAnalysis','renderMedicalSanitizedRecord'].map(extract).join('\n')+'\n({ensureMedicalState,renderMedical,renderHostileSpecimen,renderContainment,renderGenomicAnalysis})',context);
test('nav attention follows existing unread, reviewed, and sanitized state',()=>{
  const medical=api.ensureMedicalState();
  medical.genomicReviewed=false;medical.dataSanitized=false;
  assert.match(api.renderMedical(),/has-unread/);
  medical.genomicReviewed=true;assert.doesNotMatch(api.renderMedical(),/has-unread/);
  medical.genomicReviewed=false;medical.dataSanitized=true;
  assert.doesNotMatch(api.renderMedical(),/has-unread/);
  medical.dataSanitized=false;
});
test('containment context is empty while both hardware ports and vial controls remain',()=>{
  context.medicalSection='containment';
  const before=JSON.stringify(context.state),html=api.renderMedical();
  assert.doesNotMatch(html,/OPEN RELEASE CONTROLS|CONTEXT ACTION|NO ACTION REQUIRED/);
  assert.match(html,/<div class="medical-context-action"><\/div>/);
  assert.match(html,/data-medical-data-module/);assert.match(html,/data-medical-injector-open/);
  for(const id of ['01','02','03']){
    context.medicalContainmentRecord=id;
    assert.match(api.renderContainment(),new RegExp(`data-medical-release="${id}">AUTHORIZE VIAL RELEASE`));
    assert.match(api.renderContainment(),/data-medical-release-all>AUTHORIZE ALL VIALS FOR RELEASE/);
  }
  assert.equal(JSON.stringify(context.state),before);
});
test('hostile copy tightened without changing remaining findings',()=>{
  const html=api.renderHostileSpecimen();
  assert.match(html,/Exterior carapace resists mechanical sectioning\./);
  assert.match(html,/Gross anatomy demonstrates extensive restructuring and aggressive morphology\./);
  assert.match(html,/Ongoing biological abnormalities recorded throughout containment\./);
  assert.match(html,/ORIGIN CLASSIFICATION: UNRESOLVED/);
});
test('primary genomic findings and original result structure remain intact',()=>{
  api.ensureMedicalState().genomicReviewed=true;
  const html=api.renderGenomicAnalysis();
  assert.match(html,/PRIMARY MATCH: NF-06/);assert.match(html,/SEQUENCE CORRELATION: 98\.7%/);
  assert.equal((html.match(/class="genomic-result"/g)||[]).length,1);
});
test('nav border is geometry-neutral and reuses existing pulse with reduced-motion support',()=>{
  const alert=css.match(/\.medical-primary-nav button\.has-unread:after\{([^}]+)\}/)[1];
  assert.match(alert,/position:absolute/);assert.match(alert,/inset:-1px -1px -1px -3px/);
  assert.match(alert,/border:1px solid/);assert.match(alert,/background:transparent/);
  assert.match(alert,/animation:medicalPulse 3\.8s ease-in-out infinite/);
  assert.doesNotMatch(alert,/width:6px|height:6px/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.medical-primary-nav button\.has-unread:after/);
});
test('readability changes are landscape-scoped and advisory columns are equal and centered',()=>{
  assert.match(css,/@media \(orientation:landscape\) and \(min-width:768px\) and \(max-width:1366px\)/);
  assert.match(css,/\[data-medical-module="specimen"\][^{]+\{font-size:13px;line-height:1\.3\}/);
  assert.match(css,/\.medical-media-advisory\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/\.medical-media-advisory>span\{[^}]*justify-content:center;text-align:center/);
});
