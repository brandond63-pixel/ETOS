(() => {
  'use strict';
  const VERSION = '0.5.92-dev';
  const playAudio = (name,options) => window.ETOSAudio?.play(name,options);
  const WARDEN_PIN = '8722';
  const TRANSFER_MS = 8000;
  const STORAGE_KEY = 'etos.session.v18';
  const DIRECTIVE_ACCESS_CODE = '51895';
  const SANITIZATION_ACCESS_CODE = '010387';
  const DIRECTIVE_HOLD_MS = 3000;
  const MEDICAL_RELEASE_PASSWORD = '0718';
  const COMMAND_INTERLOCK_HOLD_MS = 3000;
  const COMMAND_INTERLOCK_RELEASE_DELAY_MS = 1500;
  const COMMAND_INTERLOCK_TURN_MS = 1050;
  const SANITIZATION_DEFAULT = {keyEngaged:false,phase:'dormant',resumePhase:'auth',delaySeconds:0,initiatedAt:null,completesAt:null,complete:false};
  const AUDIT_TOKEN_HOLD_MS = 3000;
  const AUDIT_TOKEN_PASSCODE = 'HBADT872';
  const AUDIT_TOKEN_DEFAULT = {connected:false,complete:false};
  let directiveView = 'archive';
  let directiveUnlocked = false;
  let executiveAuthorized = false;
  let directiveSeen = false;
  let directiveHackHoldTimer = null;
  let directiveHackFinishTimer = null;
  const WEATHER_ASSET_PATHS = ['assets/img/command/weather-terrain.png','assets/img/command/weather-storm.png'];
  let weatherAssetPreloadPromise = null;
  let medicalSection = 'overview';
  let medicalRecord = 'hostile';
  let medicalContainmentRecord = '01';
  let medicalAssayRegion = 'A4';
  let medicalAction = null;
  let medicalActionTimer = null;
  let medicalGenomicOverlayOpen = false;
  let medicalAuthorizationError = '';
  let medicalHackHoldTimer = null;
  let medicalHackFinishTimer = null;
  const MEDICAL_DATA_HOLD_MS = 3000;
  const MEDICAL_INJECTOR_HOLD_MS = 2500;
  const MEDICAL_MEDIA_PROCESS_MS = 7000;
  const MEDICAL_INJECTION_MS = 3600;
  const MEDICAL_DUPLICATION_FILES = [
    'GENOMIC SEQUENCE // GA-04','NF-06 BASELINE STUDY','HOSTILE SPECIMEN ANALYSIS','SHRIEK RESPONSE STUDY',
    'LCPL RESNICK // DIAGNOSTIC IMAGING','CARAPACE PENETRATION ASSAY','SPECIMEN CONTAINMENT RECORDS','SAMPLE H-17 // BIOLOGICAL RECORD'
  ];
  const MEDICAL_SANITIZATION_FILES = [
    'GENOMIC SEQUENCE // GA-04','NF-06 BASELINE STUDY','HOSTILE SPECIMEN ANALYSIS','SHRIEK RESPONSE STUDY',
    'LCPL RESNICK // DIAGNOSTIC IMAGING','CARAPACE PENETRATION ASSAY','SAMPLE H-17 // BIOLOGICAL RECORD'
  ];
  let medicalMediaView = 'closed';
  let medicalMediaProtocol = null;
  let medicalMediaMessage = '';
  let medicalMediaProgress = 0;
  let medicalMediaFileIndex = 0;
  let medicalMediaHoldTimer = null;
  let medicalMediaFeedbackTimer = null;
  let medicalMediaHoldReady = false;
  let medicalMediaHoldMode = null;
  let medicalMediaAwaitingRelease = false;
  let medicalMediaProcessTimer = null;
  let medicalMediaRenderTimer = null;
  let medicalMediaAudioTimer = null;
  let medicalMediaReturnTimer = null;
  let medicalMediaSuppressClick = false;
  let medicalInjectorView = 'closed';
  let medicalInjectorTarget = null;
  let medicalInjectorTargets = [];
  let medicalInjectorHoldTimer = null;
  let medicalInjectorFeedbackTimer = null;
  let medicalInjectorHoldReady = false;
  let medicalInjectorHoldMode = null;
  let medicalInjectorAwaitingRelease = false;
  let medicalInjectorSuppressClick = false;
  let medicalInjectorSequenceTimer = null;
  let medicalInjectorReturnTimer = null;
  let edemSection = 'mission';
  let edemSelection = {mission:0,research:0,journal:0};
  const ARGOZA_ARRIVAL_DATETIME = '2026-08-30T12:00:00';
  const ARGOZA_TARGET_DISPLAY = 'AUG 30, 2122, 12:00 PM';
  const ARGOZA_PLANETARY_TRANSITION_MS = 420;
  const ARGOZA_FACILITY_ZOOM = {min:1,max:2.6,step:.18,focus:1.9,transitionMs:1200};
  const ARGOZA_MARKER_LAYOUT_KEY = 'etos.argoza.planetary-markers.v2';
  const ARGOZA_MARKER_DEFAULTS = {
    systemOrison:{x:82.7,y:49,scale:1,label:'ORISON'},
    systemArgoza:{x:70,y:65,scale:1,label:'ARGOZA APPROACH'},
    orisonSector:{x:55,y:44.5,scale:.5,label:'HORIZON SECTOR'},
    sectorHorizon:{x:46.3,y:45.6,scale:.5,label:'HORIZON BASE'},
    sectorHeron:{x:65,y:50,scale:.5,label:'HERON STATION'}
  };
  const ARGOZA_FACILITY_FOCUS = {
    command:{x:55.6,y:19.8,zoom:1.9},
    medbay:{x:77,y:29.3,zoom:1.9}
  };
  let argozaSection = 'home';
  let argozaCrewTeam = 'away';
  let argozaPlanetaryLevel = 'system';
  let argozaBriefingFile = 'deployment';
  let argozaManifestBranch = 'support';
  let argozaMissionDirective = false;
  let argozaPersonnelBriefingView = 'closed';
  let argozaPersonnelBriefing = null;
  let argozaPersonnelBriefingError = '';
  let argozaFacilityRoom = null;
  let argozaFacilityMap = {zoom:1,panX:0,panY:0};
  let argozaMarkerLayout = loadArgozaMarkerLayout();
  let argozaCountdownTimer = null;
  let argozaMapResizeObserver = null;

  const missionLogs = [
    {
      date:'2121.09.02', title:'ORBITAL RELAY ONLINE', pinned:true, archived:true,
      body:[
        'Orbital communications relay commissioned and stable. Horizon now has scheduled direct contact with Colonial Operations without relying on surface transmission windows.',
        'Survey and terraforming operations remain on schedule. No significant personnel or equipment issues to report.'
      ]
    },
    {
      date:'2121.10.21', title:'DIRECTIVE 014', pinned:true, archived:true,
      body:[
        'Received Directive 014 from Corporate Research. Priority survey target established at Grid K-17 following detection of an anomalous carrier signal.',
        'Dr. Hinton will lead the investigation with support from the science team. Initial orders are limited to source identification, sample collection, and standard containment.'
      ]
    },
    {
      date:'2121.11.14', title:'BIOLOGICAL RECOVERY', pinned:true, archived:true,
      body:[
        'K-17 team returned with the first viable biological specimen associated with the anomaly.',
        'Hinton reports characteristics inconsistent with previous regional surveys and has requested expanded recovery operations. Specimen transferred to Medical for containment and preliminary analysis.',
        'Corporate Research notified. Awaiting direction.'
      ]
    },
    {
      date:'2121.11.22', title:'DIRECTIVE 015', pinned:true, archived:true,
      body:[
        'Directive 015 received and acknowledged.',
        'Recovered organisms have been designated Strategic Corporate Assets. Biological recovery is now mission-critical and takes priority over nonessential terraforming operations.',
        'Personnel, transport, and laboratory resources reassigned accordingly.',
        'This is a substantial change in mission scope.'
      ]
    },
    {
      date:'2122.03.07', title:'RESEARCH OPERATIONS', pinned:true, archived:true,
      body:[
        'K-17 recovery operations continue under Directive 015. Hinton has expanded work on both the recovered organisms and the carrier signal associated with the site.',
        'Resource demands are beginning to affect scheduled terraforming maintenance and survey work. I have requested that Research consolidate future equipment and personnel requirements before deployment.',
        'Corporate continues to prioritize recovery.'
      ]
    },
    {
      date:'2122.07.18', title:'GENOMIC SEQUENCING', pinned:false, archived:false, status:'IN PROGRESS',
      body:[
        'Authorized Medical to begin full genomic sequencing of the most recent specimen at 08:12.',
        'Hinton believes the comparison may clarify several abnormalities observed during recent testing. I want an independent baseline before further carrier experiments are approved.',
        'Sequencing is expected to require several hours.'
      ]
    }
  ];

  const researchNotes = [
    {date:'2121.10.28',title:'K-17 CARRIER SIGNAL',body:[
      'Hinton remains convinced the carrier is more than an environmental anomaly. He believes the recovered organisms are responding to it somehow.',
      'I’ve approved limited archived playback for controlled analysis only. He wants broader testing. I don’t.'
    ]},
    {date:'2121.12.03',title:'SPECIMEN BEHAVIOR',body:[
      'Recent specimens have become increasingly aggressive during testing. Hinton insists the behavior supports his theory that the carrier is influencing them.',
      'Medical has documented the changes, but I’m not convinced we understand enough yet to draw conclusions.'
    ]},
    {date:'2122.02.14',title:'RESOURCE / PROCEDURE CONCERNS',body:[
      'Hinton continues pulling personnel, vehicles, and lab time under Directive 015 with little notice.',
      'He also failed to log APC use again. I’ve changed the garage override credential and reminded him that “mission critical” does not mean procedures are optional.'
    ]},
    {date:'2122.07.17',title:'CARRIER TESTING',body:[
      'Hinton is pushing for another round of carrier exposure tests.',
      'I’ve told him no further escalation until Medical completes a full genomic comparison on the latest specimen. If there is a real biological change occurring, I want a baseline before we expose anything else.'
    ]}
  ];

  const journalEntries = [
    {date:'2122.06.24',title:'MORNING ROUTINE',body:[
      'Erik has started finding excuses to stop by during breakfast.',
      'I’m fairly sure they’re excuses.',
      'I don’t mind.',
      'I keep thinking about asking him to do something outside the usual group routines, just the two of us. I haven’t decided whether that’s a good idea or a terrible one.'
    ]},
    {date:'2122.07.09',title:'UPDATED MY PASSWORD',body:[
      'Hinton took the APC out again without logging it. I changed my override password afterward.',
      'Erik laughed when I told him I’d probably forget the new one, so I made it something I won’t forget: his birthday.',
      'Maybe now Hinton can ask before commandeering half the base.'
    ]},
    {date:'2122.07.18',title:'WHY AM I NERVOUS?',body:[
      'I made Erik a card.',
      'That sentence feels more ridiculous every time I read it.',
      'I was going to give it to him tonight and ask if he wanted to get away from everyone for a while sometime. Just the two of us.',
      'Now I’m not sure I can actually hand it to him.',
      'Sequencing should finish this afternoon. Maybe I’ll work up the nerve by tonight.',
      'Maybe.'
    ]}
  ];

  const outboxMessage = {
    to:'ORBITAL RELAY 04 / COLONIAL OPERATIONS', priority:'EMERGENCY', date:'2122.07.18', status:'TRANSMISSION FAILED',
    body:[
      'Horizon is compromised.',
      'The carrier signal was played in the Commissary. LCpl Xavier changed immediately afterward. Severe physical deformation, extreme aggression. Multiple casualties.',
      'Survivors are evacuating to the Garage.',
      'Do not retransmit the carrier. Do not play any archived copies.',
      'We do not know what it is doing to us.'
    ]
  };

  function ensureMedicalState(){
    if(!state.medical || typeof state.medical !== 'object') state.medical = {};
    if(typeof state.medical.genomicReviewed !== 'boolean') state.medical.genomicReviewed = false;
    if(!state.medical.vials || typeof state.medical.vials !== 'object') state.medical.vials = {};
    ['01','02','03'].forEach(id=>{if(!['secured','released'].includes(state.medical.vials[id]))state.medical.vials[id]='secured';});
    if(typeof state.medical.dataDuplicated !== 'boolean') state.medical.dataDuplicated = false;
    if(typeof state.medical.dataSanitized !== 'boolean') state.medical.dataSanitized = false;
    if(!state.medical.vialViability || typeof state.medical.vialViability !== 'object') state.medical.vialViability = {};
    ['01','02','03'].forEach(id=>{if(!['confirmed','terminated'].includes(state.medical.vialViability[id]))state.medical.vialViability[id]='confirmed';});
    if(typeof state.medical.injectorRegistered !== 'boolean') state.medical.injectorRegistered = false;
    if(typeof state.medical.biometricVerified !== 'boolean') state.medical.biometricVerified = false;
    return state.medical;
  }

  function renderMedicalSanitizedRecord(title){
    return `<section class="medical-sanitized-record" role="status"><span>${title}</span><h3>LOCAL DATA UNAVAILABLE</h3><strong>RECORD SANITIZED</strong><p>AUTHORIZED MEDIA OPERATION</p></section>`;
  }

  function medicalImage(path,alt,overlay=''){
    return `<figure class="medical-image-frame"><img src="${path}" alt="${alt}"><div class="medical-image-grid" aria-hidden="true"></div>${overlay}</figure>`;
  }

  function renderMedicalOverview(){
    const medical=ensureMedicalState();
    const secure=Object.values(medical.vials).filter(value=>value==='secured').length;
    if(medical.dataSanitized) return `<section class="medical-overview" aria-labelledby="medical-content-title">
      <div class="medical-overview-grid medical-overview-grid--sanitized">
        ${renderMedicalSanitizedRecord('LOCAL RESEARCH PACKAGE')}
        <section class="medical-data-card"><span>SPECIMEN CONTAINMENT</span><strong>SPECIMEN VIALS: ${secure} SECURED</strong><strong>VIABLE SPECIMENS: ${Object.values(medical.vialViability).filter(value=>value==='confirmed').length}</strong><strong>RETENTION RELEASE: AVAILABLE</strong></section>
      </div>
    </section>`;
    return `<section class="medical-overview" aria-labelledby="medical-content-title">
      <button type="button" class="medical-priority-card${medical.genomicReviewed?' is-reviewed':' is-unread'}" data-medical-open-genomic>
        <span>MOLECULAR DIAGNOSTICS</span><strong>GENOMIC ANALYSIS</strong><em>${medical.genomicReviewed?'COMPLETE — OPENED':'COMPLETE — UNREVIEWED'}</em><small>${medical.genomicReviewed?'OPEN COMPLETED RESULT':'OPEN UNREVIEWED RESULT'}</small>
      </button>
      <div class="medical-overview-grid">
        <section class="medical-data-card"><span>SPECIMEN CONTAINMENT</span><strong>SPECIMEN VIALS: ${secure} SECURED</strong><strong>VIABLE TISSUE SAMPLE: 1 SECURED</strong><strong>RETENTION RELEASE: AVAILABLE</strong></section>
        <section class="medical-data-card"><span>SHRIEK RESPONSE STUDY</span><strong>ABNORMAL NEURAL ACTIVITY: CONFIRMED</strong><strong>ENDOCRINE RESPONSE: CONFIRMED</strong><strong>CAUSAL MECHANISM: UNRESOLVED</strong></section>
      </div>
    </section>`;
  }

  function renderShriekResponseStudy(){
    if(ensureMedicalState().dataSanitized)return renderMedicalSanitizedRecord('SHRIEK RESPONSE STUDY');
    const overlay=`<div class="medical-scan-label medical-scan-label--top">AUDITORY CORTEX // RESPONSE MAP</div><div class="medical-marker medical-marker--one"><i></i><span>SYNCHRONIZED ACTIVITY</span></div><div class="medical-marker medical-marker--two"><i></i><span>POST-EXPOSURE ACTIVITY</span></div><div class="medical-scale">PLAYBACK <i></i> POST-EXPOSURE</div>`;
    return `<section class="shriek-study"><article class="shriek-summary"><span>EXPERIMENT SUMMARY</span><p>Recorded carcinid vocalization ("Shriek") reproduced under controlled conditions.</p><p>Subjects monitored for neurological, endocrine, and behavioral response during and following exposure.</p><p>Objective: determine physiological mechanism responsible for acute reactions observed following exposure to carcinid vocalization.</p></article><div class="medical-evidence-layout"><div>${medicalImage('assets/img/shriek-scan.png','Neurological activity scan recorded during controlled Shriek exposure',overlay)}</div><div class="medical-findings"><article><span>NEURAL RESPONSE</span><p>Abnormal synchronized activity associated with auditory processing.</p></article><article><span>ENDOCRINE RESPONSE</span><p>Rapid hormonal and metabolic elevation following exposure.</p></article><article><span>POST-EXPOSURE ACTIVITY</span><p>Abnormal neurological activity persists after stimulus termination.</p></article><article><span>BEHAVIORAL RESPONSE</span><p>Agitation and aggressive behavior observed.</p></article><article><span>CAUSAL MECHANISM</span><strong>UNRESOLVED</strong></article></div></div></section>`;
  }

  function renderHostileSpecimen(){
    if(ensureMedicalState().dataSanitized)return renderMedicalSanitizedRecord('HOSTILE SPECIMEN ANALYSIS');
    const overlay='<div class="medical-scan-label medical-scan-label--top">HOSTILE SPECIMEN // ANATOMICAL SURVEY</div>';
    return `<section class="medical-record-layout"><div>${medicalImage('assets/img/mutation.png','Hostile specimen with transformed NF-06 morphology',overlay)}</div><div class="medical-findings"><article><span>EXTERNAL ANATOMY</span><p>Exterior carapace exhibits extreme resistance to mechanical sectioning.</p><p>Gross anatomy demonstrates extensive restructuring and aggressive morphology.</p></article><article><span>OBSERVED CONDITION</span><p>Ongoing biological abnormalities recorded throughout containment.</p><strong>ORIGIN CLASSIFICATION: UNRESOLVED</strong></article></div></section>`;
  }

  function renderCarapaceAssay(){
    if(ensureMedicalState().dataSanitized)return renderMedicalSanitizedRecord('CARAPACE PENETRATION ASSAY');
    const regions={
      A1:{reagent:'MECHANICAL ABRASION',result:'SUPERFICIAL EFFECT',observation:'SURFACE SCORING'},
      A2:{reagent:'THERMAL EXPOSURE',result:'SURFACE SCORING',observation:'NO PENETRATION'},
      A3:{reagent:'ALKALINE SOLVENT',result:'NO SIGNIFICANT EFFECT',observation:'CARAPACE INTACT'},
      A4:{reagent:'HYDROFLUORIC ACID',result:'CARAPACE STRUCTURAL FAILURE',observation:'PENETRATION / LAYER DISSOLUTION'}
    };
    const current=regions[medicalAssayRegion];
    const overlay=`<div class="assay-regions">${Object.keys(regions).map((id,index)=>`<button type="button" class="assay-region assay-region--${index+1}${id===medicalAssayRegion?' is-active':''}" data-medical-assay="${id}" aria-label="View test region ${id}">${id}</button>`).join('')}</div><div class="medical-scan-label medical-scan-label--top">MACRO SURFACE // 12.6×</div>`;
    return `<section class="medical-evidence-layout"><div>${medicalImage('assets/img/carcinid-carapace.png','Macro image of hostile specimen carapace',overlay)}<div class="assay-region-strip">${Object.keys(regions).map(id=>`<button type="button" data-medical-assay="${id}" class="${id===medicalAssayRegion?'is-active':''}">${id}</button>`).join('')}</div></div><div class="medical-findings"><article class="assay-result${medicalAssayRegion==='A4'?' assay-result--critical':''}"><span>TEST: ${medicalAssayRegion}</span><p>REAGENT:</p><strong>${current.reagent}</strong><p>RESULT:</p><b>${current.result}</b><p>OBSERVATION:</p><strong>${current.observation}</strong></article><article><span>PROTOCOL NOTE</span><p>Most tested approaches produced little or superficial effect.</p><strong>EXAMINATION PURPOSE // AUTOPSY ACCESS</strong></article></div></section>`;
  }

  function renderBaselineSpecies(){
    if(ensureMedicalState().dataSanitized)return renderMedicalSanitizedRecord('NF-06 BASELINE STUDY');
    const overlay=`<div class="medical-scan-label medical-scan-label--top">FIELD CATALOG // NATIVE FAUNA</div><div class="medical-scan-label medical-scan-label--bottom">REFERENCE SCALE // 0.5 M</div>`;
    return `<section class="medical-evidence-layout"><div>${medicalImage('assets/img/creature-baseline.png','Catalog image of native fauna NF-06',overlay)}</div><div class="medical-findings"><article><span>SURVEY CONTEXT</span><p>NF-06 was the only native fauna observed within the immediate K-17 survey area during initial field investigation.</p><p>Multiple individuals were documented in and around the target grid.</p><p>Behavior at time of survey: docile, non-territorial, low threat.</p></article><article><span>CATALOG DESIGNATION</span><h3>NF-06</h3><p>Previously catalogued common native fauna.</p></article><article><span>BASELINE PROFILE</span><strong>DOCILE // NON-TERRITORIAL // LOW THREAT</strong><p>No prior association with the hostile specimen had been recorded.</p></article></div></section>`;
  }

  function renderGenomicAnalysis(){
    const medical=ensureMedicalState();
    if(medical.dataSanitized)return renderMedicalSanitizedRecord('GENOMIC SEQUENCE // GA-04');
    if(!medical.genomicReviewed) return `<section class="medical-unread-result"><span>GENOMIC ANALYSIS</span><strong>COMPLETE — UNREVIEWED</strong><div class="genomic-authorization-log"><p><time>07/18/2122 09:42 //</time><b>SEQUENCING AUTHORIZED — DR. CLAIRE EDEM</b></p><p><time>07/19/2122 03:16 //</time><b>SEQUENCING COMPLETE</b></p><p><time>REVIEW RECORD //</time><b>NONE</b></p></div><em>RESULT HAS NOT BEEN OPENED</em><button type="button" data-medical-open-genomic>OPEN UNREVIEWED RESULT</button></section>`;
    const baselineOverlay='<div class="comparison-tag">NF-06 BASELINE</div>';
    const mutationOverlay='<div class="comparison-tag">HOSTILE SPECIMEN</div>';
    const staged=medicalAction==='genomic'?' is-staging':'';
    const overlay=medicalGenomicOverlayOpen?`<div class="genomic-overlay-layer" data-medical-genomic-overlay><article class="genomic-overlay-card"><div class="genomic-analysis-steps"><p>LOADING COMPLETED SEQUENCE</p><p>COMPARING NATIVE FAUNA ARCHIVE</p><p>PRIMARY MATCH FOUND</p></div><figure class="genomic-sequence-overlay"><img src="assets/img/genomic-comparison.png" alt="Genomic sequence comparison bridging baseline NF-06 and hostile specimen"><figcaption>SEQUENCE COMPARISON</figcaption></figure><div class="genomic-result"><span>PRIMARY GENOMIC MATCH</span><h3>NF-06</h3><strong>SEQUENCE CORRELATION: 98.7%</strong><p>HOSTILE SPECIMEN IS GENETICALLY CONSISTENT<br>WITH CATALOGUED NATIVE SPECIES NF-06.</p><b>EXTENSIVE BIOLOGICAL RESTRUCTURING DETECTED</b><em>CAUSATIVE MECHANISM: UNDETERMINED</em></div></article></div>`:'';
    return `<section class="genomic-reveal${staged}" aria-live="polite"><div class="genomic-comparison-stage">${medicalImage('assets/img/creature-baseline.png','Complete silhouette of baseline NF-06 specimen',baselineOverlay)}${medicalImage('assets/img/mutation.png','Complete silhouette of hostile transformed NF-06 specimen',mutationOverlay)}${overlay}</div><div class="genomic-completed-controls"><strong>PRIMARY MATCH: NF-06</strong><button type="button" data-medical-view-sequence>VIEW SEQUENCE COMPARISON</button></div><footer class="genomic-history"><span>AUTHORIZED BY: DR. CLAIRE EDEM</span><span>STARTED: 07/18/2122 09:42</span><span>COMPLETED: 07/19/2122 03:16</span><span>REVIEWED BY: NONE</span><span>RESULT PREVIOUSLY UNOPENED</span></footer></section>`;
  }

  function medicalAuthorizationTarget(){
    if(!medicalAction)return null;
    for(const prefix of ['auth-','accepted-','hack-'])if(medicalAction.startsWith(prefix))return medicalAction.slice(prefix.length);
    return null;
  }

  function renderMedicalAuthorization(){
    const target=medicalAuthorizationTarget();
    if(!target)return '';
    if(medicalAction.startsWith('hack-'))return `<div class="medical-action-layer medical-hack-layer"><div class="directive-hack-screen medical-hack-screen" role="status" aria-live="polite"><header><small>LOCAL SECURITY INTERFACE</small><h3>UNAUTHORIZED ACCESS ATTEMPT DETECTED</h3><p>RESTRICTED CONTAINMENT CONTROL</p></header><div class="directive-hack-lines"><p style="--hack-delay:.25s"><span>LOCAL SECURITY LAYER</span><strong>BYPASSED</strong></p><p style="--hack-delay:1.05s"><span>AUTHORIZATION HASH</span><strong>COLLISION FOUND</strong></p><p style="--hack-delay:1.85s"><span>ACCESS CONTROL LOOP</span><strong>DIVERTED</strong></p><p style="--hack-delay:2.65s"><span>MANUAL OVERRIDE</span><strong>ACCEPTED</strong></p></div><div class="directive-hack-progress"><i></i></div><footer><strong>ACCESS EVENT LOGGED</strong><span>USER IDENTIFICATION // UNAVAILABLE</span></footer></div></div>`;
    if(medicalAction.startsWith('accepted-'))return `<div class="medical-action-layer"><section class="medical-authorization-accepted" role="status" aria-live="polite"><span>RESTRICTED CONTAINMENT CONTROL</span><h3>AUTHORIZATION ACCEPTED</h3><strong>DR. C. EDEM</strong><i></i></section></div>`;
    return `<div class="medical-action-layer"><section class="medical-authorization-prompt" role="dialog" aria-modal="true" aria-labelledby="medical-authorization-title"><span>RESTRICTED CONTAINMENT CONTROL</span><h3 id="medical-authorization-title">MISSION SPECIALIST AUTHORIZATION REQUIRED</h3><label for="medical-release-password">ENTER PASSWORD:</label><div class="medical-password-entry"><input id="medical-release-password" type="password" inputmode="numeric" maxlength="4" autocomplete="off" aria-describedby="medical-authorization-error"><button type="button" data-medical-authorize>VERIFY</button></div><p id="medical-authorization-error" class="medical-authorization-error" role="alert">${medicalAuthorizationError}</p><button type="button" class="directive-security-mark medical-security-mark" data-medical-hack aria-label="Ellison-Tanaka corporate seal"><img src="assets/img/ellison-tanaka-logo.svg" alt=""></button><button type="button" data-medical-cancel>CANCEL</button></section></div>`;
  }

  function renderSpecimenAnalysis(){
    const records={hostile:['HOSTILE SPECIMEN',renderHostileSpecimen],assay:['CARAPACE CHEMICAL ASSAY',renderCarapaceAssay],baseline:['NF-06 BASELINE SPECIES',renderBaselineSpecies]};
    if(!records[medicalRecord]) medicalRecord='hostile';
    return `<div class="medical-subnav" role="tablist" aria-label="Specimen analysis records">${Object.entries(records).map(([key,value])=>`<button type="button" role="tab" aria-selected="${medicalRecord===key}" class="${medicalRecord===key?'is-active':''}" data-medical-record="${key}">${value[0]}</button>`).join('')}</div>${records[medicalRecord][1]()}`;
  }

  function renderPersonnelScans(){
    if(ensureMedicalState().dataSanitized)return renderMedicalSanitizedRecord('LCPL RESNICK // DIAGNOSTIC IMAGING');
    const overlay=`<div class="medical-scan-label medical-scan-label--top">LCPL TALIA RESNICK // CT AXIAL 04</div><div class="medical-marker medical-marker--rib"><i></i><span>RIB RESTRUCTURING</span></div><div class="medical-marker medical-marker--calc"><i></i><span>ABNORMAL MINERALIZATION</span></div><div class="medical-scale">SLICE 044 <i></i> 1.25 MM</div>`;
    return `<section class="medical-evidence-layout"><div>${medicalImage('assets/img/resnick-ctscan.png','CT scan of LCPL Talia Resnick',overlay)}</div><div class="medical-findings"><article><span>PATIENT IDENTIFICATION</span><h3>LCPL TALIA RESNICK</h3><p>CT series // thoracic reconstruction // post-exposure examination.</p></article><article><span>FINDINGS</span><p>Abnormal rib and skeletal restructuring.</p><p>Unusual calcification and mineralization.</p><p>Structures inconsistent with normal human anatomy.</p></article><article><span>INTERPRETATION</span><strong>ENDOGENOUS ANATOMICAL CHANGE</strong><p>No separate parasitic organism identified.</p></article></div></section>`;
  }

  function renderContainment(){
    const medical=ensureMedicalState();
    const selected=medicalContainmentRecord;
    const vial=selected!=='h17';
    const status=vial?medical.vials[selected]:null;
    const viability=vial?medical.vialViability[selected]:null;
    let detail;
    if(vial){
      detail=`<section class="vial-detail"><div class="vial-image">${medicalImage(`assets/img/vial${Number(selected)}.png`,`Sealed specimen vial ${selected}`,'<div class="medical-scan-label medical-scan-label--top">SPECIMEN VIAL '+selected+'</div>')}</div><div class="vial-status-column"><article class="vial-status-card"><span>SPECIMEN VIAL ${selected}</span><p>VIABILITY: <strong>CONFIRMED</strong></p><p>SEAL: <strong>INTACT</strong></p><p>RETENTION LOCK: <strong>${status==='secured'?'ENGAGED':'RELEASED'}</strong></p><b class="containment-state is-${status}">${status.toUpperCase()}</b>${status==='secured'?'<button type="button" class="medical-consequence" data-medical-release="'+selected+'">AUTHORIZE VIAL RELEASE</button>':'<div class="medical-release-complete">VIAL RELEASED — READY FOR TRANSFER</div>'}</article><article class="vial-transfer-note"><span>TRANSFER NOTE</span><p>The sealed vial may be removed by hand and placed into the nearby transportation case after retention release.</p><strong>TRANSPORT CASE: AVAILABLE</strong></article></div></section>`;
    } else detail=medical.dataSanitized?renderMedicalSanitizedRecord('SAMPLE H-17 // BIOLOGICAL RECORD'):`<section class="h17-detail"><div>${medicalImage('assets/img/limb.png','Recovered Sample H-17 limb specimen','<div class="medical-scan-label medical-scan-label--top">SAMPLE H-17</div>')}</div><div class="medical-findings"><article><span>SAMPLE H-17</span><p>RECOVERED BY: <strong>DR. N. HINTON</strong></p><p>RECOVERY LOCATION: <strong>NOT ENTERED</strong></p><p>COLLECTION METHOD: <strong>NOT ENTERED</strong></p><p>CHAIN OF CUSTODY: <strong>INCOMPLETE</strong></p></article><article><span>BIOLOGICAL STATUS</span><strong>NEURAL RESPONSE: PRESENT</strong><p>DIRECT HANDLING NOT ADVISED</p><p>UNSCHEDULED MOTOR RESPONSE RECORDED</p></article></div></section>`;
    if(vial)detail=detail.replace('VIABILITY: <strong>CONFIRMED</strong>',`VIABILITY: <strong class="is-${viability}">${viability.toUpperCase()}</strong>`);
    const remaining=Object.entries(medical.vials).filter(([,value])=>value==='secured').map(([id])=>id);
    if(medicalAction==='confirm-all'){const count=remaining.length;detail+=`<div class="medical-action-layer"><section role="dialog" aria-modal="true"><span>CONTAINMENT CONTROL</span><h3>${count===3?'RELEASE ALL THREE SPECIMEN VIALS':`RELEASE ${count} REMAINING SPECIMEN VIAL${count===1?'':'S'}`} FROM LABORATORY RETENTION?</h3><p>All vial seals will remain intact. Only the secured laboratory retention locks will disengage.</p><div><button type="button" data-medical-confirm-release-all>CONFIRM RELEASE</button><button type="button" data-medical-cancel>CANCEL</button></div></section></div>`;}
    else if(medicalAction==='release-all'){const count=Number(els.workspace.dataset.medicalReleaseCount||remaining.length);detail+=`<div class="medical-action-layer"><section class="release-sequence" role="status" aria-live="polite"><span>SPECIMEN CONTAINMENT</span><p>VERIFYING VIAL SEALS</p><p>DISENGAGING RETENTION LOCKS</p><strong>${String(count).padStart(2,'0')} VIAL${count===1?'':'S'} RELEASED — READY FOR TRANSFER</strong><i></i></section></div>`;}
    else if(medicalAction?.startsWith('confirm-')){const id=medicalAction.slice(-2);detail+=`<div class="medical-action-layer"><section role="dialog" aria-modal="true"><span>CONTAINMENT CONTROL</span><h3>RELEASE SPECIMEN VIAL ${id} FROM LABORATORY RETENTION?</h3><p>The vial seal will remain intact. Only the laboratory retention lock will disengage.</p><div><button type="button" data-medical-confirm-release="${id}">CONFIRM RELEASE</button><button type="button" data-medical-cancel>CANCEL</button></div></section></div>`;}
    else if(medicalAction?.startsWith('release-')){const id=medicalAction.slice(-2);detail+=`<div class="medical-action-layer"><section class="release-sequence" role="status" aria-live="polite"><span>SPECIMEN VIAL ${id}</span><p>VERIFYING VIAL SEAL</p><p>DISENGAGING RETENTION LOCK</p><strong>VIAL RELEASED — READY FOR TRANSFER</strong><i></i></section></div>`;}
    detail+=renderMedicalAuthorization();
    const allControl=remaining.length?'<button type="button" class="medical-release-all" data-medical-release-all>AUTHORIZE ALL VIALS FOR RELEASE</button>':'<div class="medical-all-released">ALL SPECIMEN VIALS RELEASED</div>';
    return `<div class="containment-toolbar"><div class="containment-selector">${['01','02','03'].map(id=>`<button type="button" class="${selected===id?'is-active':''}" data-medical-containment="${id}"><span>VIAL ${id}</span><strong>${medical.vials[id].toUpperCase()}</strong></button>`).join('')}<button type="button" class="${selected==='h17'?'is-active':''}" data-medical-containment="h17"><span>SAMPLE H-17</span><strong>NEURAL RESPONSE</strong></button></div>${allControl}</div>${detail}`;
  }

  function medicalSectionContent(){
    return {overview:renderMedicalOverview,signal:renderShriekResponseStudy,specimen:renderSpecimenAnalysis,personnel:renderPersonnelScans,containment:renderContainment,genomic:renderGenomicAnalysis}[medicalSection]();
  }

  function medicalDataLedState(){
    if(medicalMediaView==='processing')return 'is-busy';
    if(medicalMediaView==='authenticating')return 'is-authenticating';
    if(['complete','unavailable'].includes(medicalMediaView))return 'is-complete';
    return '';
  }

  function renderMedicalDataPort(compact=false){
    const message=medicalMediaMessage||'NO MEDIA';
    return `<button type="button" class="medical-data-module${compact?' is-service-port':''}" data-medical-data-module aria-label="Data module receptacle"><span class="medical-hardware-label">DATA MODULE</span><i class="medical-module-led ${medicalDataLedState()}" aria-hidden="true"></i><b class="medical-module-slot" aria-hidden="true"><i></i></b><small data-medical-data-status>${message}</small></button>`;
  }

  function renderMedicalMediaProgress(){
    const files=medicalMediaProtocol==='sanitization'?MEDICAL_SANITIZATION_FILES:MEDICAL_DUPLICATION_FILES;
    const current=Math.min(files.length-1,medicalMediaFileIndex);
    const completed=files.slice(Math.max(0,current-3),current);
    const next=files[current+1];
    const completeRows=Array.from({length:3},(_,index)=>{const file=completed[index];return file?`<p class="is-complete"><i>COMPLETE</i><span>${file}</span></p>`:'<p class="is-empty" aria-hidden="true"><i>COMPLETE</i><span>&nbsp;</span></p>';}).join('');
    return `<div class="medical-media-progress" role="status" aria-live="polite"><span>${medicalMediaProtocol==='sanitization'?'SECURE SANITIZATION PROTOCOL':'RESEARCH DUPLICATION PROTOCOL'}</span><strong>${String(Math.round(medicalMediaProgress)).padStart(2,'0')}%</strong><div class="medical-media-progress-track"><i style="width:${medicalMediaProgress}%"></i></div><div class="medical-file-window">${completeRows}<p class="is-active"><i>${medicalMediaProtocol==='sanitization'?'ERASING':'WRITING'}</i><span>${files[current]}</span></p><p class="${next?'is-pending':'is-empty'}" ${next?'':'aria-hidden="true"'}><i>PENDING</i><span>${next||'&nbsp;'}</span></p></div></div>`;
  }

  function renderMedicalMediaOverlay(){
    if(medicalMediaView==='closed')return '';
    const medical=ensureMedicalState();
    let body='';
    if(medicalMediaView==='service')body=`<section class="medical-media-service"><header><span>REMOVABLE MEDIA CONTROLLER</span><h3>MEDIA SERVICE</h3></header><div class="medical-media-protocols"><button type="button" class="${medical.dataDuplicated?'is-complete':medical.dataSanitized?'is-unavailable':''}" data-medical-media-protocol="duplication" ${medical.dataDuplicated||medical.dataSanitized?'disabled':''}><span>01</span><strong>RESEARCH DUPLICATION PROTOCOL</strong><small>${medical.dataDuplicated?'COMPLETE // ARCHIVE INTEGRITY VERIFIED':medical.dataSanitized?'SOURCE UNAVAILABLE // LOCAL PACKAGE SANITIZED':'WRITE LOCAL RESEARCH PACKAGE TO AUTHORIZED MEDIA'}</small></button><button type="button" class="${medical.dataSanitized?'is-complete':''}" data-medical-media-protocol="sanitization" ${medical.dataSanitized?'disabled':''}><span>02</span><strong>SECURE SANITIZATION PROTOCOL</strong><small>${medical.dataSanitized?'COMPLETE // LOCAL RESEARCH PACKAGE REMOVED':'REMOVE LOCAL RESEARCH PACKAGE AND RECOVERY INDEX'}</small></button></div><div class="medical-media-advisory" aria-label="Recommended procedure order"><span><b>01.</b><strong>RESEARCH DUPLICATION</strong></span><span><b>02.</b><strong>VERIFY ARCHIVE</strong></span><span><b>03.</b><strong>SECURE SANITIZATION</strong></span></div><p>RECOMMENDED ORDER // ADVISORY ONLY</p><button type="button" class="medical-service-close" data-medical-media-close>CLOSE MEDIA SERVICE</button></section>`;
    else if(medicalMediaView==='sanitization-confirm')body=`<section class="medical-media-warning" role="alertdialog" aria-modal="true"><span>SECURE SANITIZATION PROTOCOL</span><h3>FINAL AUTHORIZATION REQUIRED</h3><strong>THIS OPERATION WILL PERMANENTLY REMOVE<br>ALL LOCAL RESEARCH DATA AND RECOVERY RECORDS.</strong><p>ALL DESIGNATED FILES WILL BE SANITIZED.</p><p>THIS ACTION CANNOT BE UNDONE.</p><div><button type="button" data-medical-media-sanitize-confirm>CONFIRM SANITIZATION</button><button type="button" data-medical-media-sanitize-cancel>CANCEL</button></div></section>`;
    else if(medicalMediaView==='awaiting')body=`<section class="medical-media-insert"><span>${medicalMediaProtocol==='sanitization'?'SECURE SANITIZATION PROTOCOL':'RESEARCH DUPLICATION PROTOCOL'}</span><h3>INSERT EXPECTED DATA MODULE</h3><p>Seat authorized module in the DATA MODULE receptacle.</p>${renderMedicalDataPort(true)}<button type="button" data-medical-media-back>BACK</button></section>`;
    else if(medicalMediaView==='authenticating')body=`<section class="medical-media-auth" role="status"><span>REMOVABLE MEDIA CONTROLLER</span><h3>AUTHENTICATING MEDIA</h3><div class="medical-media-auth-bars"><i></i><i></i><i></i><i></i><i></i></div><strong>MODULE REGISTERED</strong><p>MEDIA AUTHENTICATION: VALID</p></section>`;
    else if(medicalMediaView==='processing')body=renderMedicalMediaProgress();
    else if(medicalMediaView==='unavailable')body=`<section class="medical-media-result" role="status"><span>RESEARCH DUPLICATION PROTOCOL</span><h3>RESEARCH PACKAGE UNAVAILABLE</h3><strong>LOCAL SOURCE DATA NOT FOUND</strong><button type="button" data-medical-media-service>RETURN TO MEDIA SERVICE</button></section>`;
    else if(medicalMediaView==='complete'){
      const duplicate=medicalMediaProtocol==='duplication';
      body=`<section class="medical-media-result" role="status"><span>${duplicate?'RESEARCH DUPLICATION PROTOCOL':'SECURE SANITIZATION PROTOCOL'}</span><h3>${duplicate?'DUPLICATION COMPLETE':'SANITIZATION COMPLETE'}</h3><strong>${duplicate?'RESEARCH PACKAGE WRITTEN':'LOCAL RESEARCH PACKAGE REMOVED'}</strong><p>${duplicate?'ARCHIVE INTEGRITY: VERIFIED':'RECOVERY INDEX CLEARED'}</p><b>MODULE READY FOR REMOVAL</b><button type="button" data-medical-media-service>RETURN TO MEDIA SERVICE</button></section>`;
    }
    return `<div class="medical-hardware-layer medical-media-layer" role="dialog" aria-modal="true" aria-label="Media Service">${body}</div>`;
  }

  function renderMedicalInjectorPort(){
    const medical=ensureMedicalState();
    return `<button type="button" class="medical-injector-port${medical.injectorRegistered?' is-ready':''}" data-medical-injector-open><span>AUTO-INJECTOR PORT</span><b aria-hidden="true"><i></i></b><small>AUTO-INJECTOR</small><strong data-medical-injector-port-status>${medical.injectorRegistered?'INJECTOR READY':'RESERVOIR: NOT DETECTED'}</strong></button>`;
  }

  function renderMedicalInjectorOverlay(){
    if(medicalInjectorView==='closed')return '';
    const medical=ensureMedicalState();
    let body='';
    if(medicalInjectorView==='reservoir-ready')body=`<section class="medical-injector-result" role="status"><span>AUTO-INJECTOR PORT</span><h3>COMPOUND RESERVOIR DETECTED</h3><strong>INJECTOR READY</strong></section>`;
    else if(medicalInjectorView==='scan')body=`<section class="medical-biometric-panel"><span>AUTO-INJECTOR // READY</span><h3>BIOMETRIC PRESENCE CHECK</h3><p>Maintain contact with scanner.</p><button type="button" class="medical-fingerprint-scanner" data-medical-biometric-hold><span class="medical-fingerprint-target" aria-hidden="true"><i></i><b></b></span><strong data-medical-biometric-status>PRESS AND HOLD // 2.5 SEC</strong></button><button type="button" data-medical-injector-close>CANCEL</button></section>`;
    else if(medicalInjectorView==='select'){
      const viable=Object.values(medical.vialViability).filter(value=>value==='confirmed').length;
      body=`<section class="medical-injector-select"><span>LIVE OPERATOR VERIFIED</span><h3>SELECT VIABLE SPECIMEN</h3><div>${['01','02','03'].map(id=>`<button type="button" data-medical-injector-target="${id}" ${medical.vialViability[id]==='terminated'?'disabled':''}><span>SPECIMEN VIAL ${id}</span><strong>VIABILITY: ${medical.vialViability[id].toUpperCase()}</strong></button>`).join('')}</div>${viable?`<button type="button" class="medical-terminate-all" data-medical-injector-all>TERMINATE ALL VIABLE SPECIMENS</button>`:'<p>NO VIABLE SPECIMENS AVAILABLE</p>'}<button type="button" data-medical-injector-close>CLOSE</button></section>`;
    } else if(medicalInjectorView==='confirm'){
      const all=medicalInjectorTarget==='all',viable=Object.entries(medical.vialViability).filter(([,value])=>value==='confirmed').map(([id])=>id);
      body=`<section class="medical-injector-confirm"><span>AUTO-INJECTOR // READY</span><h3>${all?'AUTHORIZE TERMINATION OF ALL VIABLE SPECIMENS?':'AUTHORIZE SPECIMEN TERMINATION?'}</h3><strong>${all?`TARGETS: ${viable.map(id=>`SPECIMEN VIAL ${id}`).join(' // ')}`:`TARGET: SPECIMEN VIAL ${medicalInjectorTarget}`}</strong><div><button type="button" data-medical-injector-confirm>CONFIRM INJECTION</button><button type="button" data-medical-injector-cancel>CANCEL</button></div></section>`;
    } else if(medicalInjectorView==='injecting')body=`<section class="medical-injection-sequence" role="status" aria-live="polite"><span>${medicalInjectorTarget==='all'?'TARGET: ALL VIABLE SPECIMENS':`TARGET: SPECIMEN VIAL ${medicalInjectorTarget}`}</span><p>PRIMING AUTO-INJECTOR</p><p>DELIVERING COMPOUND</p><p>MONITORING SPECIMEN RESPONSE</p><i></i></section>`;
    else if(medicalInjectorView==='complete'){
      const all=medicalInjectorTarget==='all',target=medicalInjectorTargets[0];
      body=`<section class="medical-injector-result" role="status"><span>${all?`${String(medicalInjectorTargets.length).padStart(2,'0')} SPECIMEN VIALS`: `SPECIMEN VIAL ${target}`}</span><h3>VIABILITY LOST</h3><strong>${all?'ALL TARGETED SEALS: INTACT':'SEAL: INTACT'}</strong><p>${all?'RETENTION LOCKS: UNCHANGED':`RETENTION LOCK: ${medical.vials[target]==='secured'?'ENGAGED':'RELEASED'}`}</p></section>`;
    }
    return `<div class="medical-hardware-layer medical-injector-layer" role="dialog" aria-modal="true" aria-label="Auto-injector control">${body}</div>`;
  }

  function renderMedical(){
    const medical=ensureMedicalState();
    const secure=Object.values(medical.vials).filter(value=>value==='secured').length;
    const primary=[['overview','MEDICAL OVERVIEW'],['signal','SHRIEK RESPONSE STUDY'],['specimen','SPECIMEN ANALYSIS'],['personnel','PERSONNEL SCANS'],['containment','SPECIMEN CONTAINMENT'],['genomic','GENOMIC ANALYSIS']];
    const titles={overview:'LABORATORY STATUS',signal:'SHRIEK RESPONSE STUDY',specimen:'SPECIMEN ANALYSIS',personnel:'PERSONNEL SCANS',containment:'SPECIMEN CONTAINMENT',genomic:'GENOMIC ANALYSIS'};
    let action='';
    if((medicalSection==='overview'||medicalSection==='genomic')&&!medical.genomicReviewed&&!medical.dataSanitized) action='<button type="button" data-medical-open-genomic>OPEN UNREVIEWED RESULT</button>';
    else if(medicalSection==='containment'&&medicalContainmentRecord!=='h17'&&medical.vials[medicalContainmentRecord]==='secured') action=`<button type="button" data-medical-release="${medicalContainmentRecord}">OPEN RELEASE CONTROLS</button>`;
    let output=`<div class="medical-workstation">
      <nav class="medical-navigation" aria-label="Medical terminal modules"><header><span class="medical-cross" aria-hidden="true">+</span><div><strong>MEDICAL</strong><small>HB-MED-01</small></div></header><div class="medical-primary-nav">${primary.map(([key,label],index)=>`<button type="button" class="${medicalSection===key?'is-active':''}${key==='genomic'&&!medical.genomicReviewed?' has-unread':''}" data-medical-section="${key}"><span>0${index+1}</span>${label}</button>`).join('')}</div><div class="medical-passive-nav" aria-label="Unavailable general medical modules"><span>GENERAL SYSTEMS</span><div>PATIENT RECORDS</div><div>MEDICAL SUPPLIES</div><div>PHARMACY</div><div>SURGICAL SYSTEMS</div></div></nav>
      <main class="medical-content"><header><div><span>ACTIVE CLINICAL MODULE</span><h2 id="medical-content-title">${titles[medicalSection]}</h2></div><strong>LOCAL RECORDS // AVAILABLE</strong></header><div class="medical-content-body">${medicalSectionContent()}</div></main>
      <aside class="medical-status-rail"><header>LAB STATUS</header><section class="${medical.genomicReviewed?'':'is-unread'}"><span>GENOMIC ANALYSIS</span><strong>COMPLETE — ${medical.genomicReviewed?'OPENED':'UNREVIEWED'}</strong></section><section><span>SPECIMEN VIALS</span><strong>${String(secure).padStart(2,'0')} SECURED</strong></section><section><span>SAMPLE H-17</span><strong>NEURAL RESPONSE PRESENT</strong></section><div class="medical-context-action"><span>CONTEXT ACTION</span>${action||'<strong>NO ACTION REQUIRED</strong>'}</div></aside>
    </div>`;
    if(medical.dataSanitized){
      output=output.replace('LOCAL RECORDS // AVAILABLE','LOCAL RECORDS // SANITIZED').replace(/COMPLETE[^<]+(?:OPENED|UNREVIEWED)/,'RECORD SANITIZED').replace('NEURAL RESPONSE PRESENT','RECORD SANITIZED').replace(' has-unread','');
    }
    output=output.replace('<div class="medical-context-action">',`${renderMedicalDataPort()}${medicalSection==='containment'?renderMedicalInjectorPort():''}<div class="medical-context-action">`);
    output=output.replace('</aside>\n    </div>',`</aside>${renderMedicalMediaOverlay()}${renderMedicalInjectorOverlay()}\n    </div>`);
    return output;
  }

  function beginMedicalGenomicReview(){
    if(medicalAction||ensureMedicalState().dataSanitized) return;
    if(ensureMedicalState().genomicReviewed){playAudio('uiSelect');medicalSection='genomic';medicalGenomicOverlayOpen=true;renderTerminal();return;}
    playAudio('process');playAudio('process',{delay:1.35,frequency:375});playAudio('process',{delay:2.75,frequency:420});playAudio('researchReveal',{delay:4.35});
    medicalSection='genomic';medicalAction='genomic';medicalGenomicOverlayOpen=true;ensureMedicalState().genomicReviewed=true;saveState();renderTerminal();
    medicalActionTimer=setTimeout(()=>{medicalAction=null;medicalActionTimer=null;renderTerminal();},5600);
  }

  function completeMedicalRelease(id){
    if(medicalActionTimer) clearTimeout(medicalActionTimer);
    playAudio('process');playAudio('mechanicalActuation',{delay:.52});playAudio('confirm',{delay:1.42});
    medicalAction=`release-${id}`;renderTerminal();
    medicalActionTimer=setTimeout(()=>{ensureMedicalState().vials[id]='released';medicalAction=null;medicalActionTimer=null;saveState();renderTerminal();},1900);
  }

  function completeMedicalReleaseAll(){
    const medical=ensureMedicalState();
    const remaining=Object.keys(medical.vials).filter(id=>medical.vials[id]==='secured');
    if(!remaining.length){medicalAction=null;renderTerminal();return;}
    if(medicalActionTimer) clearTimeout(medicalActionTimer);
    playAudio('process');remaining.forEach((id,index)=>playAudio('mechanicalActuation',{delay:.42+index*.28,gain:.64}));playAudio('confirm',{delay:1.48});
    els.workspace.dataset.medicalReleaseCount=String(remaining.length);
    medicalAction='release-all';renderTerminal();
    medicalActionTimer=setTimeout(()=>{remaining.forEach(id=>medical.vials[id]='released');medicalAction=null;medicalActionTimer=null;saveState();renderTerminal();},1900);
  }

  function openMedicalAuthorization(target){
    playAudio('restricted');
    medicalAuthorizationError='';
    medicalAction=`auth-${target}`;
    renderTerminal();
    setTimeout(()=>document.getElementById('medical-release-password')?.focus(),50);
  }

  function continueAuthorizedMedicalRelease(target){
    medicalAction=target==='all'?'confirm-all':`confirm-${target}`;
    renderTerminal();
  }

  function authorizeMedicalRelease(){
    const target=medicalAuthorizationTarget();
    const input=document.getElementById('medical-release-password');
    if(!target||!input)return;
    if(input.value!==MEDICAL_RELEASE_PASSWORD){playAudio('reject');medicalAuthorizationError='AUTHORIZATION DENIED';input.value='';input.focus();const error=document.getElementById('medical-authorization-error');if(error)error.textContent=medicalAuthorizationError;return;}
    playAudio('confirm');
    medicalAuthorizationError='';
    medicalAction=`accepted-${target}`;
    renderTerminal();
    medicalActionTimer=setTimeout(()=>{medicalActionTimer=null;continueAuthorizedMedicalRelease(target);},900);
  }

  function beginMedicalHackHold(event){
    if(event.pointerType==='mouse'&&event.button!==0)return;
    cancelMedicalHackHold();
    const target=medicalAuthorizationTarget();
    if(!target)return;
    medicalHackHoldTimer=setTimeout(()=>{medicalHackHoldTimer=null;medicalAction=`hack-${target}`;renderTerminal();playAudio('hackSequence');medicalHackFinishTimer=setTimeout(()=>{medicalHackFinishTimer=null;playAudio('confirm');continueAuthorizedMedicalRelease(target);},4100);},DIRECTIVE_HOLD_MS);
  }

  function cancelMedicalHackHold(){
    if(medicalHackHoldTimer!==null)clearTimeout(medicalHackHoldTimer);
    medicalHackHoldTimer=null;
  }

  function unlockMedicalAudio(){
    if(window.ETOSAudio?.isUnlocked())return;
    const unlock=window.ETOSAudio?.unlock();
    if(unlock)void unlock.then(ok=>{if(ok)window.ETOSAudio.startAmbient();});
  }

  function clearMedicalMediaHold(){
    if(medicalMediaHoldTimer!==null)clearTimeout(medicalMediaHoldTimer);
    if(medicalMediaFeedbackTimer!==null)clearTimeout(medicalMediaFeedbackTimer);
    medicalMediaHoldTimer=null;medicalMediaFeedbackTimer=null;
  }

  function activateMedicalMediaHold(mode){
    clearMedicalMediaHold();medicalMediaHoldReady=false;medicalMediaHoldMode=null;medicalMediaAwaitingRelease=true;medicalMediaSuppressClick=true;
    playAudio('mediaConfirm');
    if(mode==='service'){
      medicalMediaMessage='';medicalMediaView='service';playAudio('mechanicalActuation',{gain:.34,rate:1.18});renderTerminal();return;
    }
    medicalMediaView='authenticating';medicalMediaMessage='AUTHENTICATING MEDIA';renderTerminal();playAudio('mediaAuthenticate');
    setTimeout(()=>{if(medicalMediaView==='authenticating')startMedicalMediaProcess();},1250);
  }

  function beginMedicalMediaHold(event){
    if(event.pointerType==='mouse'&&event.button!==0)return;
    if(!['closed','awaiting'].includes(medicalMediaView)||medicalMediaHoldTimer!==null||medicalMediaHoldReady)return;
    unlockMedicalAudio();
    event.currentTarget?.setPointerCapture?.(event.pointerId);
    medicalMediaHoldMode=medicalMediaView==='awaiting'?'authenticate':'service';
    medicalMediaHoldReady=false;
    medicalMediaFeedbackTimer=setTimeout(()=>{
      medicalMediaFeedbackTimer=null;
      els.workspace.querySelectorAll('[data-medical-data-module]').forEach(port=>{port.querySelector('.medical-module-led')?.classList.add('is-holding');const status=port.querySelector('[data-medical-data-status]');if(status)status.textContent=medicalMediaHoldMode==='authenticate'?'AUTHENTICATING MEDIA':'MEDIA SEEK';});
      playAudio('mediaSeek');
    },1000);
    medicalMediaHoldTimer=setTimeout(()=>{
      const mode=medicalMediaHoldMode;
      activateMedicalMediaHold(mode);
    },MEDICAL_DATA_HOLD_MS);
  }

  function finishMedicalMediaHold(cancelled=false){
    if(medicalMediaAwaitingRelease){medicalMediaAwaitingRelease=false;setTimeout(()=>{medicalMediaSuppressClick=false;},120);return;}
    if(medicalMediaHoldTimer===null&&!medicalMediaHoldReady&&medicalMediaFeedbackTimer===null)return;
    clearMedicalMediaHold();medicalMediaHoldReady=false;medicalMediaHoldMode=null;
    els.workspace.querySelectorAll('[data-medical-data-module]').forEach(port=>{port.querySelector('.medical-module-led')?.classList.remove('is-holding','is-hold-ready');const status=port.querySelector('[data-medical-data-status]');if(status)status.textContent=medicalMediaMessage||'NO MEDIA';});
  }

  function tapMedicalDataPort(){
    if(medicalMediaSuppressClick){medicalMediaSuppressClick=false;return;}
    if(medicalMediaView!=='closed')return;
    playAudio('mediaClick');medicalMediaMessage='NO MEDIA DETECTED';renderTerminal();
    setTimeout(()=>{if(medicalMediaView==='closed'){medicalMediaMessage='';renderTerminal();}},1150);
  }

  function selectMedicalMediaProtocol(protocol){
    const medical=ensureMedicalState();
    medicalMediaProtocol=protocol;playAudio('uiSelect');
    if(protocol==='duplication'&&medical.dataSanitized){medicalMediaView='unavailable';renderTerminal();return;}
    if(protocol==='duplication'&&medical.dataDuplicated){medicalMediaView='service';medicalMediaProtocol=null;renderTerminal();return;}
    if(protocol==='sanitization'&&medical.dataSanitized){medicalMediaView='service';medicalMediaProtocol=null;renderTerminal();return;}
    if(protocol==='sanitization'){medicalMediaMessage='';medicalMediaView='sanitization-confirm';playAudio('restricted');renderTerminal();return;}
    medicalMediaMessage='NO MEDIA';medicalMediaView='awaiting';renderTerminal();
  }

  function confirmMedicalSanitization(){
    if(medicalMediaView!=='sanitization-confirm'||medicalMediaProtocol!=='sanitization')return;
    playAudio('mediaConfirm');medicalMediaMessage='NO MEDIA';medicalMediaView='awaiting';renderTerminal();
  }

  function returnToMedicalMediaService(){
    if(medicalMediaView==='processing'||medicalMediaView==='authenticating')return;
    clearTimeout(medicalMediaReturnTimer);medicalMediaReturnTimer=null;
    playAudio('uiBack');medicalMediaView='service';medicalMediaProtocol=null;medicalMediaMessage='';medicalMediaProgress=0;medicalMediaFileIndex=0;renderTerminal();
  }

  function scheduleMedicalMediaAudio(){
    clearTimeout(medicalMediaAudioTimer);
    if(medicalMediaView!=='processing')return;
    medicalMediaAudioTimer=setTimeout(()=>{if(medicalMediaView!=='processing')return;playAudio(medicalMediaProtocol==='sanitization'?'mediaErase':'mediaReadWrite');scheduleMedicalMediaAudio();},260+Math.random()*470);
  }

  function startMedicalMediaProcess(){
    medicalMediaView='processing';medicalMediaProgress=0;medicalMediaFileIndex=0;medicalMediaMessage='MEDIA ACTIVE';
    const files=medicalMediaProtocol==='sanitization'?MEDICAL_SANITIZATION_FILES:MEDICAL_DUPLICATION_FILES;
    const started=performance.now();renderTerminal();scheduleMedicalMediaAudio();
    medicalMediaRenderTimer=setInterval(()=>{
      const elapsed=performance.now()-started;
      medicalMediaProgress=Math.min(100,elapsed/MEDICAL_MEDIA_PROCESS_MS*100);
      medicalMediaFileIndex=Math.min(files.length-1,Math.floor(medicalMediaProgress/100*files.length));
      if(state.activeTerminal==='medical'&&medicalMediaView==='processing')renderTerminal();
    },160);
    medicalMediaProcessTimer=setTimeout(()=>{
      clearInterval(medicalMediaRenderTimer);clearTimeout(medicalMediaAudioTimer);medicalMediaRenderTimer=null;medicalMediaProcessTimer=null;medicalMediaAudioTimer=null;
      const medical=ensureMedicalState();
      if(medicalMediaProtocol==='duplication')medical.dataDuplicated=true;else medical.dataSanitized=true;
      saveState();medicalMediaProgress=100;medicalMediaFileIndex=files.length-1;medicalMediaView='complete';medicalMediaMessage='MODULE READY';playAudio('mediaComplete');renderTerminal();
      medicalMediaReturnTimer=setTimeout(()=>{medicalMediaReturnTimer=null;if(medicalMediaView==='complete')returnToMedicalMediaService();},1500);
    },MEDICAL_MEDIA_PROCESS_MS);
  }

  function closeMedicalMediaService(){
    if(medicalMediaView==='processing'||medicalMediaView==='authenticating')return;
    clearTimeout(medicalMediaReturnTimer);medicalMediaReturnTimer=null;
    playAudio('uiBack');medicalMediaView='closed';medicalMediaProtocol=null;medicalMediaMessage='';medicalMediaProgress=0;medicalMediaFileIndex=0;renderTerminal();
  }

  function clearMedicalInjectorHold(){
    if(medicalInjectorHoldTimer!==null)clearTimeout(medicalInjectorHoldTimer);
    if(medicalInjectorFeedbackTimer!==null)clearTimeout(medicalInjectorFeedbackTimer);
    medicalInjectorHoldTimer=null;medicalInjectorFeedbackTimer=null;
  }

  function openMedicalInjector(){
    const medical=ensureMedicalState();playAudio('uiSelect');
    if(!medical.injectorRegistered)return;
    medicalInjectorView=!medical.biometricVerified?'scan':'select';renderTerminal();
  }

  function beginMedicalInjectorHold(event,mode){
    if(event.pointerType==='mouse'&&event.button!==0)return;
    const medical=ensureMedicalState();
    if((mode==='reservoir'&&medical.injectorRegistered)||(mode==='biometric'&&medical.biometricVerified))return;
    if(medicalInjectorHoldTimer!==null||medicalInjectorHoldReady||medicalInjectorAwaitingRelease)return;
    unlockMedicalAudio();event.currentTarget?.setPointerCapture?.(event.pointerId);
    medicalInjectorHoldMode=mode;medicalInjectorHoldReady=false;
    if(mode==='biometric')void window.ETOSAudio?.startBiometricScan?.();
    medicalInjectorFeedbackTimer=setTimeout(()=>{
      medicalInjectorFeedbackTimer=null;
      const control=els.workspace.querySelector(mode==='biometric'?'[data-medical-biometric-hold]':'[data-medical-injector-open]');control?.classList.add('is-scanning');
      const status=control?.querySelector(mode==='biometric'?'[data-medical-biometric-status]':'[data-medical-injector-port-status]');if(status)status.textContent=mode==='biometric'?'SCANNING...':'REGISTERING RESERVOIR...';
      if(mode==='biometric')void window.ETOSAudio?.startBiometricSweep?.();else playAudio('injectorSeat');
    },500);
    medicalInjectorHoldTimer=setTimeout(()=>{medicalInjectorHoldTimer=null;medicalInjectorHoldReady=true;completeMedicalInjectorHold(mode);},MEDICAL_INJECTOR_HOLD_MS);
  }

  function completeMedicalInjectorHold(mode){
    if(!medicalInjectorHoldReady||medicalInjectorHoldMode!==mode)return;
    clearMedicalInjectorHold();medicalInjectorHoldReady=false;medicalInjectorHoldMode=null;medicalInjectorAwaitingRelease=true;medicalInjectorSuppressClick=true;
    const medical=ensureMedicalState();
    if(mode==='reservoir'){
      playAudio('mediaConfirm');
      medical.injectorRegistered=true;medicalInjectorView='reservoir-ready';playAudio('mechanicalActuation',{gain:.4,rate:1.1});
      clearTimeout(medicalInjectorSequenceTimer);medicalInjectorSequenceTimer=setTimeout(()=>{medicalInjectorSequenceTimer=null;if(medicalInjectorView==='reservoir-ready'){medicalInjectorView='scan';renderTerminal();}},950);
    } else {medical.biometricVerified=true;medicalInjectorView='select';}
    saveState();renderTerminal();
    if(mode==='biometric')window.ETOSAudio?.completeBiometricScan?.();
  }

  function finishMedicalInjectorHold(cancelled=false){
    if(medicalInjectorAwaitingRelease){medicalInjectorAwaitingRelease=false;setTimeout(()=>{medicalInjectorSuppressClick=false;},120);return;}
    if(medicalInjectorHoldTimer===null&&!medicalInjectorHoldReady&&medicalInjectorFeedbackTimer===null)return;
    const holdMode=medicalInjectorHoldMode;
    clearMedicalInjectorHold();medicalInjectorHoldReady=false;medicalInjectorHoldMode=null;
    if(holdMode==='biometric')window.ETOSAudio?.stopBiometricScan?.();
    const control=els.workspace.querySelector('[data-medical-injector-open],[data-medical-biometric-hold]');control?.classList.remove('is-scanning','is-hold-ready');
    const status=control?.querySelector('[data-medical-injector-port-status]');if(status)status.textContent=ensureMedicalState().injectorRegistered?'INJECTOR READY':'RESERVOIR: NOT DETECTED';
    if(cancelled)medicalInjectorSuppressClick=false;
  }

  function beginMedicalInjection(){
    const medical=ensureMedicalState();
    medicalInjectorTargets=medicalInjectorTarget==='all'?Object.entries(medical.vialViability).filter(([,value])=>value==='confirmed').map(([id])=>id):[medicalInjectorTarget].filter(id=>id&&medical.vialViability[id]==='confirmed');
    if(!medicalInjectorTargets.length){medicalInjectorView='select';medicalInjectorTarget=null;renderTerminal();return;}
    medicalInjectorView='injecting';playAudio('injectorPrime');renderTerminal();
    medicalInjectorSequenceTimer=setTimeout(()=>{
      const medical=ensureMedicalState();medicalInjectorTargets.forEach(id=>{if(medical.vialViability[id]==='confirmed')medical.vialViability[id]='terminated';});saveState();medicalInjectorSequenceTimer=null;medicalInjectorView='complete';playAudio('injectorComplete');renderTerminal();
      medicalInjectorReturnTimer=setTimeout(()=>{medicalInjectorReturnTimer=null;if(medicalInjectorView==='complete'){medicalInjectorView='select';medicalInjectorTarget=null;medicalInjectorTargets=[];renderTerminal();}},1250);
    },MEDICAL_INJECTION_MS);
  }

  function closeMedicalInjector(){
    if(medicalInjectorView==='injecting')return;
    clearMedicalInjectorHold();window.ETOSAudio?.stopBiometricScan?.();clearTimeout(medicalInjectorReturnTimer);medicalInjectorReturnTimer=null;medicalInjectorView='closed';medicalInjectorTarget=null;medicalInjectorTargets=[];playAudio('uiBack');renderTerminal();
  }

  function stopMedicalHardwareWorkflows(){
    clearMedicalMediaHold();clearMedicalInjectorHold();window.ETOSAudio?.stopBiometricScan?.();clearInterval(medicalMediaRenderTimer);clearTimeout(medicalMediaProcessTimer);clearTimeout(medicalMediaAudioTimer);clearTimeout(medicalMediaReturnTimer);clearTimeout(medicalInjectorSequenceTimer);clearTimeout(medicalInjectorReturnTimer);
    medicalMediaRenderTimer=null;medicalMediaProcessTimer=null;medicalMediaAudioTimer=null;medicalMediaReturnTimer=null;medicalInjectorSequenceTimer=null;medicalInjectorReturnTimer=null;
    medicalMediaAwaitingRelease=false;medicalMediaSuppressClick=false;medicalMediaView='closed';medicalMediaProtocol=null;medicalMediaMessage='';medicalInjectorAwaitingRelease=false;medicalInjectorSuppressClick=false;medicalInjectorView='closed';medicalInjectorTarget=null;medicalInjectorTargets=[];
  }

  function preloadWeatherAssets(){
    if(weatherAssetPreloadPromise) return weatherAssetPreloadPromise;
    weatherAssetPreloadPromise=Promise.all(WEATHER_ASSET_PATHS.map(path=>new Promise(resolve=>{
      const image=new Image();
      image.decoding='async';
      image.onload=()=>{if(typeof image.decode==='function')image.decode().catch(()=>{}).finally(()=>resolve(path));else resolve(path);};
      image.onerror=()=>{console.warn('Weather asset preload unavailable:',path);resolve(path);};
      image.src=path;
    })));
    return weatherAssetPreloadPromise;
  }

  const directives = {
    '001': {
      number: '001',
      id: 'ET-CS-001',
      title: 'COLONIAL DEVELOPMENT PLAN',
      priority: 'ROUTINE',
      classification: 'INTERNAL',
      origin: 'COLONIAL OPERATIONS DIVISION',
      recipient: 'CHIEF MISSION SPECIALIST DR. CLAIRE EDEM',
      status: 'ACKNOWLEDGED',
      body: `
        <section class="directive-copy-section">
          <h4>MISSION OBJECTIVES</h4>
          <ul>
            <li>Establish Horizon Base.</li>
            <li>Construct Orbital Communications Infrastructure.</li>
            <li>Begin atmospheric, geological, and environmental surveys.</li>
            <li>Initiate planetary terraforming operations in accordance with Colonial Development Plan LV-872.</li>
            <li>Submit routine progress reports through the Orbital Relay upon commissioning.</li>
          </ul>
          <p>Mission success will be evaluated according to infrastructure completion and terraforming progress.</p>
        </section>`
    },
    '014': {
      number: '014',
      id: 'ET-CS-014',
      title: 'SURFACE RECONNAISSANCE ASSIGNMENT',
      priority: 'HIGH',
      classification: 'INTERNAL',
      origin: 'CORPORATE RESEARCH DIVISION',
      recipient: 'CHIEF MISSION SPECIALIST DR. CLAIRE EDEM',
      status: 'ACKNOWLEDGED',
      body: `
        <section class="directive-copy-section">
          <p>Recent telemetry received through the Orbital Relay has identified an unidentified anomaly originating within the coordinates listed below.</p>
          <p>Corporate Research requests immediate field investigation to determine the source.</p>
          <h4>MISSION PARAMETERS</h4>
          <dl class="directive-parameters">
            <div><dt>PLANET</dt><dd>LV-872</dd></div>
            <div><dt>GRID</dt><dd>K-17</dd></div>
            <div><dt>LATITUDE</dt><dd>41.722° N</dd></div>
            <div><dt>LONGITUDE</dt><dd>112.084° E</dd></div>
            <div><dt>STATUS</dt><dd>UNSURVEYED</dd></div>
          </dl>
          <h4>FIELD OBJECTIVES</h4>
          <ul>
            <li>Investigate the designated survey region.</li>
            <li>Determine the source of the detected anomaly.</li>
            <li>Collect geological, biological, or technological samples for analysis.</li>
            <li>Exercise standard biological containment protocols during specimen recovery.</li>
            <li>Submit all findings for Corporate review.</li>
          </ul>
          <p>Mission success will be evaluated upon receipt of survey findings.</p>
        </section>`
    },
    '015': {
      number: '015',
      id: 'ET-CS-015',
      title: 'MISSION REPRIORITIZATION',
      priority: 'OMEGA',
      classification: 'EXECUTIVE',
      origin: 'CORPORATE RESEARCH DIVISION',
      recipient: 'CHIEF MISSION SPECIALIST DR. CLAIRE EDEM',
      status: 'MISSION ACTIVE',
      body: `
        <section class="directive-copy-section">
          <p>Recovered biological specimens have been designated Strategic Corporate Assets of exceptional scientific and commercial value.</p>
          <p>Effective immediately:</p>
          <ul>
            <li>Suspend all non-critical terraforming operations.</li>
            <li>Expand recovery operations within the designated survey region.</li>
            <li>Preservation of designated assets is considered mission-critical.</li>
            <li>Recovery of viable biological specimens shall take precedence over all other operational objectives.</li>
            <li>Continue acquisition efforts until Corporate Research objectives have been satisfied.</li>
          </ul>
          <p>Resource expenditures associated with recovery operations have been authorized.</p>
          <p>Personnel expenditures associated with recovery operations have been authorized.</p>
          <p>Mission success will be evaluated according to biological recovery objectives.</p>
          <h4>MISSION PERFORMANCE METRICS</h4>
          <dl class="directive-metrics">
            <div><dt>Biological Recovery</dt><dd>PRIORITY ONE</dd></div>
            <div><dt>Terraforming Progress</dt><dd>SECONDARY</dd></div>
            <div><dt>Schedule Variance</dt><dd>ACCEPTABLE</dd></div>
            <div><dt>Equipment Loss</dt><dd>ACCEPTABLE</dd></div>
            <div><dt>Personnel Attrition</dt><dd>ACCEPTABLE</dd></div>
            <div><dt>Mission Status</dt><dd>ACTIVE</dd></div>
          </dl>
        </section>`
    }
  };

  function renderDirectiveArchive(){
    let overlay = '';
    if(directiveView === 'lock') overlay = renderDirectiveLock();
    else if(directiveView === 'hack') overlay = renderDirectiveHack();
    else if(directives[directiveView]) overlay = renderDirectiveDocument(directives[directiveView]);
    const noticeTitle = directiveSeen ? 'ACTIVE EXECUTIVE DIRECTIVE // 015' : 'NEW EXECUTIVE DIRECTIVE RECEIVED // 015';
    const noticeState = directiveSeen ? 'MISSION ACTIVE' : 'REVIEW REQUIRED';
    return `
      <div class="directive-archive">
        <header class="directive-archive-header">
          <div>
            <small>ELLISON–TANAKA COLONIAL SYSTEMS</small>
            <h3>CORPORATE DIRECTIVE ARCHIVE</h3>
          </div>
          <div class="directive-archive-node">
            <span>PLANETARY OPERATIONS</span>
            <strong>LV-872 // HORIZON BASE</strong>
            <em>AUTHORIZED ACCESS LEVEL: INTERNAL</em>
          </div>
        </header>
        <div class="directive-archive-main">
          <div class="directive-alert${directiveSeen ? ' directive-alert--seen' : ''}" role="status">
            <span><small>PRIORITY NOTIFICATION</small><strong>${noticeTitle}</strong></span>
            <em>${noticeState}</em>
          </div>
          <div class="directive-list" aria-label="Available corporate directives">
            ${['001','014','015'].map(id => {
              const directive = directives[id];
              const locked = id === '015' && !directiveUnlocked;
              const newClass = id === '015' && !directiveSeen ? ' directive-entry--new' : '';
              return `<button type="button" class="directive-entry${id === '015' ? ' directive-entry--active' : ''}${newClass}" data-directive-open="${id}">
                <span class="directive-entry-number">${directive.number}</span>
                <span class="directive-entry-title"><small>CORPORATE DIRECTIVE</small><strong>${directive.title}</strong><em>${directive.id}</em></span>
                <span class="directive-entry-priority"><small>PRIORITY</small><strong>${directive.priority}</strong></span>
                <span class="directive-entry-status"><small>STATUS</small><strong>${locked ? 'ENCRYPTED' : directive.status}</strong><em>${locked ? 'EXECUTIVE RESTRICTED' : directive.classification}</em></span>
                ${id === '015' ? `<span class="directive-entry-badge">${directiveSeen ? 'ACTIVE DIRECTIVE' : 'NEW // ACTIVE'}</span>` : ''}
              </button>`;
            }).join('')}
          </div>
        </div>
        <footer class="directive-archive-footer">
          <span>DOCUMENT RETENTION // LOCAL COPIES AVAILABLE</span>
          <span>LAST SYNCHRONIZATION // ORBITAL RELAY 04</span>
          <strong>REMOTE UPDATE // UNAVAILABLE</strong>
        </footer>
        ${overlay ? `<div class="directive-modal-layer">${overlay}</div>` : ''}
      </div>`;
  }

  function renderDirectiveDocument(directive){
    return `
      <article class="corporate-directive" role="dialog" aria-modal="true" aria-labelledby="active-directive-title">
        <header class="corporate-directive-header">
          <button type="button" class="directive-back" data-directive-back>× CLOSE FILE</button>
          <img src="assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka Colonial Systems">
          <p>BUILDING BETTER FUTURES.</p>
          <span>CORPORATE DIRECTIVE ${directive.number}</span>
          <h3 id="active-directive-title">${directive.title}</h3>
        </header>
        <dl class="directive-metadata">
          <div><dt>DIRECTIVE ID</dt><dd>${directive.id}</dd></div>
          <div><dt>PRIORITY</dt><dd>${directive.priority}</dd></div>
          <div><dt>CLASSIFICATION</dt><dd>${directive.classification}</dd></div>
          <div><dt>ORIGIN</dt><dd>${directive.origin}</dd></div>
          <div><dt>RECIPIENT</dt><dd>${directive.recipient}</dd></div>
          <div><dt>STATUS</dt><dd>${directive.status}</dd></div>
        </dl>
        ${directive.body}
        <footer class="corporate-directive-footer">
          <strong>END OF DIRECTIVE</strong>
          <span>DIGITAL SIGNATURE VERIFIED</span>
          <p>ELLISON–TANAKA COLONIAL SYSTEMS // BUILDING BETTER FUTURES.</p>
        </footer>
      </article>`;
  }

  function renderDirectiveLock(){
    return `
      <div class="directive-lock-screen" role="dialog" aria-modal="true" aria-labelledby="directive-lock-title">
        <div class="directive-lock-panel">
          <small>CORPORATE DIRECTIVE 015</small>
          <h3 id="directive-lock-title">EXECUTIVE CLEARANCE REQUIRED</h3>
          <p>MISSION REPRIORITIZATION</p>
          <dl>
            <div><dt>ACCESS</dt><dd>EXECUTIVE RESTRICTED</dd></div>
            <div><dt>AUTHORIZED PERSONNEL</dt><dd>DR. CLAIRE EDEM</dd></div>
            <div><dt>MILITARY OVERSIGHT</dt><dd>2LT KAPLAN</dd></div>
            <div><dt>STATUS</dt><dd>ENCRYPTED</dd></div>
          </dl>
          <label for="directive-access-code">ENTER AUTHORIZATION CODE</label>
          <div class="directive-code-entry">
            <input id="directive-access-code" type="password" inputmode="numeric" maxlength="5" autocomplete="off" aria-describedby="directive-access-error">
            <button type="button" data-directive-submit>VERIFY</button>
          </div>
          <p id="directive-access-error" class="directive-access-error" role="alert"></p>
          <button type="button" class="directive-security-mark" data-directive-hack aria-label="Ellison-Tanaka corporate seal">
            <img src="assets/img/ellison-tanaka-logo.svg" alt="">
          </button>
          <button type="button" class="directive-back directive-back--lock" data-directive-back>← RETURN TO ARCHIVE</button>
        </div>
      </div>`;
  }

  function renderDirectiveHack(){
    return `
      <div class="directive-hack-screen" role="status" aria-live="polite">
        <header><small>CORPORATE SECURITY INTERFACE</small><h3>UNAUTHORIZED ACCESS ATTEMPT DETECTED</h3></header>
        <div class="directive-hack-lines">
          <p style="--hack-delay:.25s"><span>SECURITY LAYER 01</span><strong>BYPASSED</strong></p>
          <p style="--hack-delay:1.05s"><span>EXECUTIVE ENCRYPTION</span><strong>BYPASSED</strong></p>
          <p style="--hack-delay:1.85s"><span>DOCUMENT HASH</span><strong>VERIFIED</strong></p>
          <p style="--hack-delay:2.65s"><span>ACCESS OVERRIDE</span><strong>ACCEPTED</strong></p>
        </div>
        <div class="directive-hack-progress"><i></i></div>
        <footer><strong>ACCESS EVENT LOGGED</strong><span>USER IDENTIFICATION // UNAVAILABLE</span></footer>
      </div>`;
  }

  function authorizeDirective(){
    const input = document.getElementById('directive-access-code');
    const error = document.getElementById('directive-access-error');
    if(!input || !error) return;
    if(input.value === DIRECTIVE_ACCESS_CODE){
      playAudio('confirm');
      executiveAuthorized = true;
      directiveUnlocked = true;
      directiveSeen = true;
      directiveView = '015';
      renderTerminal();
    } else {
      playAudio('reject');
      error.textContent = 'AUTHORIZATION DENIED';
      input.value = '';
      input.focus();
    }
  }

  function beginDirectiveHackHold(event){
    if(event.pointerType === 'mouse' && event.button !== 0) return;
    cancelDirectiveHackHold();
    directiveHackHoldTimer = setTimeout(() => {
      directiveHackHoldTimer = null;
      directiveView = 'hack';
      renderTerminal();
      playAudio('hackSequence');
      directiveHackFinishTimer = setTimeout(() => {
        directiveHackFinishTimer = null;
        directiveUnlocked = true;
        directiveSeen = true;
        directiveView = '015';
        playAudio('confirm');
        renderTerminal();
      }, 4100);
    }, DIRECTIVE_HOLD_MS);
  }

  function cancelDirectiveHackHold(){
    if(directiveHackHoldTimer !== null) clearTimeout(directiveHackHoldTimer);
    directiveHackHoldTimer = null;
  }

  let communicationsSelected = 'emergency';
  let communicationsOverlay = null;
  let communicationsAudioFrame = null;
  let communicationsAudioWarmup = null;
  let communicationsAudioObjectUrl = null;
  let communicationsAudioPreloadPromise = null;
  let communicationsAudioPreloadState = 'idle';
  const COMMUNICATIONS_AUDIO_PATH = 'assets/audio/archived-signal-0718.wav';
  const COMMUNICATIONS_FONT_KEY = 'etos.command.communications-fonts.v3';
  const communicationsFontDefaults = {
    overallScale:100,
    summaryLabels:10,
    summaryValues:13,
    sectionHeadings:12,
    listDates:10,
    listTitles:12,
    listStatuses:10,
    detailHeading:18,
    metadataLabels:9,
    metadataValues:12,
    bodyText:14,
    controls:11,
    footer:9
  };
  const communicationsWaveform = [4,5,5,23,36,43,40,32,31,35,42,36,48,45,55,37,59,59,54,61,35,41,36,37,37,43,40,41,42,48,47,42,51,42,41,52,51,42,42,37,47,42,48,54,52,63,52,50,61,53,62,62,58,61,62,60,63,61,68,79,47,66,65,43,64,49,49,66,53,49,59,49,52,58,66,62,61,46,47,50,52,43,41,48,52,61,56,59,55,59,67,64,53,56,49,60,64,54,62,60,65,69,71,85,96,72,92,90,77,82,85,77,85,76,87,79,67,70,58,57,51,48,51,44,40,45,39,41,41,36,38,35,34,42,43,34,34,35,31,37,29,34,28,37,33,23,28,23,26,40,23,41,36,20,33,34,32,21,30,20,31,25,32,18,29,19,25,34,31,18,29,29,27,21,37,20,30,29,19,12];
  const communicationsRecords = [
    {
      id:'recon', date:'12/08/2121', title:'SURFACE RECONNAISSANCE ASSIGNMENT', status:'RECEIVED', kind:'INCOMING CORPORATE DIRECTIVE',
      meta:[['FROM','CORPORATE RESEARCH DIVISION'],['TO','DR. CLAIRE EDEM'],['RELATED RECORD','DIRECTIVE 014'],['DELIVERY','RECEIVED']],
      body:'<p>Immediate field investigation authorized for the designated survey region on LV-872.</p>',
      action:'<button type="button" class="communications-inline-action" data-communications-directive="014">OPEN CORPORATE DIRECTIVE 014 →</button>'
    },
    {
      id:'specimen', date:'02/18/2122', title:'BIOLOGICAL SPECIMEN REPORT', status:'DELIVERED', kind:'OUTGOING MISSION REPORT',
      meta:[['FROM','DR. CLAIRE EDEM'],['TO','CORPORATE RESEARCH DIVISION'],['SUBJECT','INITIAL SPECIMEN RECOVERY'],['DELIVERY','DELIVERED']],
      body:'<p>Initial findings and successful biological specimen recovery reported to Corporate Research.</p><p class="communications-detail-note">A local copy is retained in the mission archive.</p>'
    },
    {
      id:'priorities', date:'03/04/2122', title:'MISSION PRIORITIES CHANGED', status:'RECEIVED', kind:'INCOMING EXECUTIVE DIRECTIVE',
      meta:[['FROM','CORPORATE RESEARCH DIVISION'],['TO','DR. CLAIRE EDEM'],['RELATED RECORD','DIRECTIVE 015'],['DELIVERY','RECEIVED']],
      body:'<p>Mission priorities revised under executive authority. Biological recovery designated Priority One.</p>',
      action:'<button type="button" class="communications-inline-action" data-communications-directive="015">OPEN RESTRICTED DIRECTIVE 015 →</button>'
    },
    {
      id:'contact', date:'07/05/2122', title:'CONTACT WITH ORBITAL RELAY LOST', status:'NO CONTACT', kind:'CONNECTION NOTICE',
      meta:[['SYSTEM','ORBITAL RELAY 04'],['TWO-WAY CONTACT','UNAVAILABLE'],['TELEMETRY RECEPTION','ACTIVE'],['AUTOMATIC ATTEMPTS','CONTINUING']],
      body:'<p>Two-way communications through Orbital Relay 04 could not be established.</p><p class="communications-detail-note">Passive telemetry remains available. No incoming messages have been received since contact was lost.</p>'
    },
    {
      id:'support', date:'07/08/2122', title:'REQUEST FOR IMMEDIATE SUPPORT', status:'NOT DELIVERED', kind:'OUTGOING PRIORITY MESSAGE',
      meta:[['FROM','DR. CLAIRE EDEM'],['TO','CORPORATE OPERATIONS'],['PRIORITY','IMMEDIATE'],['DELIVERY','NOT DELIVERED']],
      body:'<p>Support request retained locally after repeated delivery attempts failed.</p><p class="communications-detail-note">Full local copy available through Dr. Edem’s private terminal.</p>'
    },
    {
      id:'emergency', date:'07/18/2122', title:'HORIZON BASE EMERGENCY REPORT', status:'PENDING TRANSMISSION', kind:'AUTOMATED EMERGENCY NOTIFICATION',
      meta:[['INITIATED BY','DR. CLAIRE EDEM'],['ORIGINATING TERMINAL','DR. EDEM // PRIVATE TERMINAL'],['DESTINATION','COLONIAL OPERATIONS'],['NETWORK STATUS','ORBITAL UPLINK UNAVAILABLE'],['DELIVERY','QUEUED'],['AUTOMATIC RETRY','ACTIVE']],
      body:'<p>Emergency status protocol manually initiated. A standardized emergency report was generated and committed to the local outgoing queue.</p><div class="communications-recovered"><small>AUTOMATED EMERGENCY REPORT</small><strong>HORIZON BASE EMERGENCY STATUS // DECLARED</strong><span>IMMEDIATE CORPORATE SUPPORT // REQUESTED</span><span>PERSONNEL STATUS // UNAVAILABLE</span><span>CAUSE // NOT PROVIDED</span></div><p class="communications-detail-note">Message retained locally. Transmission will proceed automatically when an orbital connection becomes available.</p>'
    }
  ];
  const communicationsArchive = [
    {
      id:'archive', date:'07/18/2122', title:'UNIDENTIFIED SIGNAL INTERCEPT', status:'RECORDED', kind:'ARCHIVED RELAY INTERCEPT', archiveType:'signal',
      meta:[['SIGNAL ORIGIN','UNRESOLVED'],['INTERCEPTED BY','ORBITAL RELAY 04'],['COLLECTION METHOD','PASSIVE RELAY TELEMETRY CAPTURE'],['RECORDING STATUS','COMPLETE // ARCHIVED LOCALLY'],['ARCHIVE IDENTIFIER','SIG-0718-04'],['DURATION','00:11.5']],
      body:'<div class="communications-signal-route"><small>SIGNAL ROUTE</small><div><span>UNRESOLVED ORIGIN</span><b>→</b><span>ORBITAL RELAY 04</span><b>→</b><span>HORIZON BASE LOCAL ARCHIVE</span></div></div><p>Unknown broadband carrier captured by Relay 04 and retained as a local signal recording.</p>'
    },
    {
      id:'playback', date:'07/18/2122', title:'COMMISSARY PA PLAYBACK REQUEST', status:'COMPLETED', kind:'LOCAL SYSTEM COMMAND', archiveType:'audit',
      meta:[['REQUESTED BY','DR. HINTON'],['SOURCE RECORD','SIG-0718-04 // UNIDENTIFIED SIGNAL INTERCEPT'],['DESTINATION','HORIZON BASE COMMISSARY PA'],['SYSTEM AUTHORIZATION','ACCEPTED'],['PLAYBACK STATUS','COMPLETED'],['PLAYBACK EVENT','RECORDED IN LOCAL SYSTEM LOG']],
      body:'<p>Archived signal selected for local playback through the Horizon Base commissary public-address system.</p>',
      action:'<button type="button" class="communications-inline-action" data-communications-associated="archive">OPEN ASSOCIATED RECORDING →</button>'
    }
  ];

  function getCommunicationRecord(id){
    return communicationsArchive.find(record=>record.id===id) || communicationsRecords.find(record=>record.id===id);
  }

  function formatCommunicationListDate(date){
    return date.replace(/^(\d{2}\/\d{2}\/)(?:\d{2})(\d{2})$/, '$1$2');
  }

  function renderCommunicationsDetail(record){
    const waveformBars = communicationsWaveform.map(height=>`<i style="--wave:${height}%"></i>`).join('');
    const player = record.id === 'archive' ? `
      <section class="communications-player" aria-label="Archived signal player">
        <audio preload="auto" data-communications-audio src="${communicationsAudioObjectUrl || COMMUNICATIONS_AUDIO_PATH}"></audio>
        <header><div><small>ARCHIVE PLAYBACK // SIG-0718-04</small><strong>UNIDENTIFIED SIGNAL INTERCEPT // 00:11.5</strong></div><span data-communications-audio-state>READY</span></header>
        <div class="communications-waveform" aria-hidden="true">
          <div class="communications-waveform-bars communications-waveform-bars--base">${waveformBars}</div>
          <div class="communications-waveform-bars communications-waveform-bars--played" data-communications-waveform-progress>${waveformBars}</div>
          <b data-communications-waveform-playhead></b>
        </div>
        <div class="communications-audio-controls">
          <button type="button" data-communications-audio-toggle>PLAY SIGNAL</button>
          <div class="communications-audio-progress" aria-hidden="true"><i data-communications-audio-progress></i></div>
          <output data-communications-audio-time>00:00 / 00:12</output>
        </div>
        <footer>LOCAL PLAYBACK EVENT WILL BE RECORDED</footer>
      </section>` : '';
    return `
      <article class="communications-detail" aria-live="polite">
        <header class="communications-detail-header">
          <div><small>${record.kind}</small><h3>${record.title}</h3></div>
          <strong class="communications-detail-status${record.status==='NO CONTACT'?' communications-detail-status--blink':''}">${record.status}</strong>
        </header>
        <dl class="communications-metadata">${record.meta.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
        <div class="communications-copy">${record.body}${record.action||''}${player}</div>
      </article>`;
  }

  function loadCommunicationsFonts(){
    try{return {...communicationsFontDefaults,...JSON.parse(localStorage.getItem(COMMUNICATIONS_FONT_KEY)||'{}')}}
    catch{return {...communicationsFontDefaults}}
  }

  function saveCommunicationsFonts(settings){localStorage.setItem(COMMUNICATIONS_FONT_KEY,JSON.stringify(settings));}

  function applyCommunicationsFonts(root,settings){
    const shell=root?.matches?.('.communications-history')?root:root?.querySelector?.('.communications-history');
    if(!shell)return;
    const scale=settings.overallScale/100;
    Object.entries(settings).forEach(([key,value])=>{
      if(key==='overallScale')return;
      shell.style.setProperty(`--comm-${key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,`${value*scale}px`);
    });
  }

  function renderCommunicationsTypographyTool(){
    const controls=[
      ['overallScale','Overall scale',80,160,1,'%'],
      ['summaryLabels','Summary labels',8,22,1,'px'],
      ['summaryValues','Summary values',10,30,1,'px'],
      ['sectionHeadings','Section headings',9,24,1,'px'],
      ['listDates','List dates',8,22,1,'px'],
      ['listTitles','List titles',9,26,1,'px'],
      ['listStatuses','List statuses',8,22,1,'px'],
      ['detailHeading','Selected message heading',14,40,1,'px'],
      ['metadataLabels','Metadata labels',8,20,1,'px'],
      ['metadataValues','Metadata values',9,24,1,'px'],
      ['bodyText','Message body',10,28,1,'px'],
      ['controls','Buttons and player',8,22,1,'px'],
      ['footer','Footer text',8,20,1,'px']
    ];
    return `
      <button type="button" class="communications-dev-toggle" data-communications-font-toggle>TYPOGRAPHY</button>
      <aside class="communications-dev-panel" data-communications-font-panel hidden>
        <header><div><small>DEVELOPER TOOL</small><strong>COMMUNICATIONS TYPOGRAPHY</strong></div><button type="button" data-communications-font-toggle aria-label="Close">×</button></header>
        <div class="communications-dev-controls">${controls.map(([key,label,min,max,step,unit])=>`<label>${label}<output data-communications-font-out="${key}"></output><input type="range" min="${min}" max="${max}" step="${step}" data-communications-font="${key}" data-unit="${unit}"></label>`).join('')}</div>
        <footer><button type="button" data-communications-font-reset>RESET</button><button type="button" data-communications-font-copy>COPY SETTINGS</button><span data-communications-font-status>Changes save locally.</span></footer>
      </aside>`;
  }

  function renderCommunicationsDiagnostic(){
    return `<section class="communications-diagnostic" role="dialog" aria-modal="true" aria-labelledby="communications-diagnostic-title">
      <header><div><small>NETWORK EXCEPTION REPORT</small><h3 id="communications-diagnostic-title">COMMUNICATIONS DIAGNOSTIC</h3></div><button type="button" data-communications-overlay-close>× CLOSE</button></header>
      <dl>
        <div><dt>CHANNEL GROUP</dt><dd>ORBITAL UPLINK // EMERGENCY BANDS</dd></div>
        <div><dt>ATMOSPHERIC MODEL INPUT</dt><dd>CATEGORY IV SUPERCELL</dd></div>
        <div class="communications-diagnostic-expected"><dt>EXPECTED SIGNAL LOSS DUE TO CURRENT ATMOSPHERIC CONDITIONS</dt><dd>43–61%</dd></div>
        <div class="communications-diagnostic-observed"><dt>OBSERVED ORBITAL UPLINK LOSS</dt><dd>100%</dd></div>
      </dl>
      <div class="communications-diagnostic-result"><small>DIAGNOSTIC RESULT</small><strong>OBSERVED LOSS EXCEEDS MAXIMUM ATMOSPHERIC PROJECTION BY 39 PERCENTAGE POINTS</strong><p>BROADBAND CARRIER CONTAMINATION DETECTED ACROSS EMERGENCY BANDS.</p></div>
      <footer><span>INTERFERENCE SOURCE // UNRESOLVED</span><strong>AUTOMATED MONITORING // ACTIVE</strong></footer>
    </section>`;
  }

  function renderCommunicationsOverlay(){
    if(communicationsOverlay==='diagnostic')return `<div class="communications-overlay-layer" data-communications-overlay>${renderCommunicationsDiagnostic()}</div>`;
    if(communicationsOverlay==='directive'){
      let content='';
      if(directiveView==='lock')content=renderDirectiveLock();
      else if(directiveView==='hack')content=renderDirectiveHack();
      else if(directives[directiveView])content=renderDirectiveDocument(directives[directiveView]);
      return content?`<div class="directive-modal-layer communications-directive-layer" data-communications-overlay>${content}</div>`:'';
    }
    return '';
  }

  function renderCommunications(){
    const selected = getCommunicationRecord(communicationsSelected) || communicationsRecords[5];
    const row = record=>`<button type="button" class="communications-message${record.id===communicationsSelected?' is-selected':''}${record.archiveType?' communications-message--'+record.archiveType:''}" data-communications-open="${record.id}" aria-pressed="${record.id===communicationsSelected}"><span title="${record.date}">${formatCommunicationListDate(record.date)}</span><strong>${record.title}</strong><em>${record.status}</em>${record.archiveType==='signal'?'<i class="communications-message-wave" aria-hidden="true"></i>':''}</button>`;
    return `
      <div class="communications-history">
        <section class="communications-summary" aria-label="Communications status">
          <div class="communications-summary-primary"><small>ORBITAL RELAY 04</small><strong>TWO-WAY CONTACT LOST</strong><span>TELEMETRY RECEPTION ACTIVE // AUTO-RECONNECT ACTIVE</span></div>
          <div><small>OUTGOING MESSAGES WAITING</small><strong>2</strong></div>
          <div><small>RECEIVED SINCE CONTACT LOSS</small><strong>0</strong></div>
          <button type="button" class="communications-diagnostic-alert" data-communications-diagnostic><small>COMMUNICATIONS DIAGNOSTIC</small><strong>MODEL EXCEEDED</strong><span>TOUCH FOR REPORT</span></button>
        </section>
        <div class="communications-workspace">
          <section class="communications-index" aria-label="Transmission log">
            <h3>TRANSMISSION LOG</h3>
            <div class="communications-list">${communicationsRecords.map(row).join('')}</div>
            <div class="communications-archive-group"><h3>SIGNAL ARCHIVE &amp; PLAYBACK AUDIT</h3>${communicationsArchive.map(row).join('')}</div>
          </section>
          ${renderCommunicationsDetail(selected)}
        </div>
        <footer class="communications-footer"><span>LOCAL MESSAGE ARCHIVE AVAILABLE</span><strong>TELEMETRY RECEPTION ACTIVE // TWO-WAY CONTACT UNAVAILABLE</strong></footer>
        ${renderCommunicationsTypographyTool()}
        ${renderCommunicationsOverlay()}
      </div>`;
  }

  function formatCommunicationsTime(seconds){
    const safe = Number.isFinite(seconds) ? Math.max(0,seconds) : 0;
    return `${String(Math.floor(safe/60)).padStart(2,'0')}:${String(Math.floor(safe%60)).padStart(2,'0')}`;
  }

  function stopCommunicationsAudio(){
    if(communicationsAudioFrame !== null) cancelAnimationFrame(communicationsAudioFrame);
    communicationsAudioFrame = null;
    const audio = els.workspace?.querySelector('[data-communications-audio]');
    if(audio && !audio.paused) audio.pause();
  }

  function updateCommunicationsAudioUi(root){
    const audio = root.querySelector('[data-communications-audio]');
    const button = root.querySelector('[data-communications-audio-toggle]');
    const progress = root.querySelector('[data-communications-audio-progress]');
    const time = root.querySelector('[data-communications-audio-time]');
    const stateLabel = root.querySelector('[data-communications-audio-state]');
    const waveformProgress = root.querySelector('[data-communications-waveform-progress]');
    const waveformPlayhead = root.querySelector('[data-communications-waveform-playhead]');
    if(!audio || !button || !progress || !time || !stateLabel) return;
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 11.5;
    const ratio = Math.max(0,Math.min(1,audio.currentTime/duration));
    progress.style.transform = `scaleX(${ratio})`;
    if(waveformProgress)waveformProgress.style.clipPath=`inset(0 ${100-ratio*100}% 0 0)`;
    if(waveformPlayhead)waveformPlayhead.style.left=`${ratio*100}%`;
    time.value = `${formatCommunicationsTime(audio.currentTime)} / ${formatCommunicationsTime(Math.ceil(duration))}`;
    button.textContent = audio.error ? 'RETRY SIGNAL' : (audio.paused ? (audio.currentTime > 0 && audio.currentTime < duration ? 'RESUME SIGNAL' : 'PLAY SIGNAL') : 'PAUSE SIGNAL');
    if(audio.error) stateLabel.textContent='PLAYBACK UNAVAILABLE // RETRY';
    else if(audio.ended) stateLabel.textContent='PLAYBACK COMPLETE';
    else if(!audio.paused && audio.readyState<3) stateLabel.textContent='BUFFERING SIGNAL…';
    else if(!audio.paused) stateLabel.textContent='PLAYING';
    else if(audio.readyState<2) stateLabel.textContent='LOADING SIGNAL…';
    else stateLabel.textContent='READY';
  }

  function attachPreloadedCommunicationsAudio(){
    if(!communicationsAudioObjectUrl)return;
    const root=els.workspace?.querySelector('.communications-history');
    const audio=root?.querySelector('[data-communications-audio]');
    if(!audio || !audio.paused || audio.currentTime>0 || audio.src===communicationsAudioObjectUrl)return;
    audio.src=communicationsAudioObjectUrl;
    audio.load();
    updateCommunicationsAudioUi(root);
  }

  function warmCommunicationsAudioFallback(){
    if(communicationsAudioWarmup)return;
    communicationsAudioWarmup=new Audio();
    communicationsAudioWarmup.preload='auto';
    communicationsAudioWarmup.src=COMMUNICATIONS_AUDIO_PATH;
    communicationsAudioWarmup.load();
  }

  function preloadCommunicationsAudio(){
    if(communicationsAudioObjectUrl)return Promise.resolve(communicationsAudioObjectUrl);
    if(communicationsAudioPreloadPromise)return communicationsAudioPreloadPromise;
    communicationsAudioPreloadState='loading';
    communicationsAudioPreloadPromise=fetch(COMMUNICATIONS_AUDIO_PATH,{cache:'force-cache'})
      .then(response=>{if(!response.ok)throw new Error(`Signal preload failed: ${response.status}`);return response.blob();})
      .then(blob=>{
        communicationsAudioObjectUrl=URL.createObjectURL(blob);
        communicationsAudioPreloadState='ready';
        communicationsAudioWarmup=new Audio();
        communicationsAudioWarmup.preload='auto';
        communicationsAudioWarmup.src=communicationsAudioObjectUrl;
        communicationsAudioWarmup.load();
        attachPreloadedCommunicationsAudio();
        return communicationsAudioObjectUrl;
      })
      .catch(error=>{
        communicationsAudioPreloadState='fallback';
        console.warn('Archived signal preload unavailable; using packaged WAV fallback.',error);
        warmCommunicationsAudioFallback();
        return COMMUNICATIONS_AUDIO_PATH;
      });
    return communicationsAudioPreloadPromise;
  }

  function warmCommunicationsAudio(){
    preloadCommunicationsAudio();
  }

  function startCommunicationsAudioFrame(root){
    if(communicationsAudioFrame !== null) cancelAnimationFrame(communicationsAudioFrame);
    const tick=()=>{
      const audio=root.querySelector('[data-communications-audio]');
      if(!audio) return;
      updateCommunicationsAudioUi(root);
      if(!audio.paused && !audio.ended) communicationsAudioFrame=requestAnimationFrame(tick);
      else communicationsAudioFrame=null;
    };
    communicationsAudioFrame=requestAnimationFrame(tick);
  }

  function initCommunications(root){
    warmCommunicationsAudio();
    let settings=loadCommunicationsFonts();
    applyCommunicationsFonts(root,settings);
    const panel=root.querySelector('[data-communications-font-panel]');
    root.querySelectorAll('[data-communications-font-toggle]').forEach(button=>button.addEventListener('click',()=>{if(panel)panel.hidden=!panel.hidden;}));
    root.querySelectorAll('[data-communications-font]').forEach(input=>{
      const key=input.dataset.communicationsFont;
      const output=root.querySelector(`[data-communications-font-out="${key}"]`);
      input.value=settings[key];
      if(output)output.value=`${settings[key]}${input.dataset.unit||'px'}`;
      input.addEventListener('input',()=>{
        settings={...settings,[key]:Number(input.value)};
        if(output)output.value=`${input.value}${input.dataset.unit||'px'}`;
        applyCommunicationsFonts(root,settings);
        saveCommunicationsFonts(settings);
      });
    });
    root.querySelector('[data-communications-font-reset]')?.addEventListener('click',()=>{
      localStorage.removeItem(COMMUNICATIONS_FONT_KEY);
      renderTerminal();
    });
    root.querySelector('[data-communications-font-copy]')?.addEventListener('click',async()=>{
      const text=JSON.stringify(settings,null,2);
      const status=root.querySelector('[data-communications-font-status]');
      try{await navigator.clipboard.writeText(text);if(status)status.textContent='Typography settings copied.';}
      catch{if(status)status.textContent=text.replace(/\n/g,' ');}
    });
    const audio=root.querySelector('[data-communications-audio]');
    if(!audio) return;
    ['loadstart','loadedmetadata','loadeddata','canplay','canplaythrough','waiting','stalled','suspend','pause','ended','error','playing'].forEach(name=>audio.addEventListener(name,()=>updateCommunicationsAudioUi(root)));
    audio.addEventListener('play',()=>{updateCommunicationsAudioUi(root);startCommunicationsAudioFrame(root);});
    if(audio.readyState===0)audio.load();
    updateCommunicationsAudioUi(root);
  }

  async function toggleCommunicationsAudio(){
    const root=els.workspace.querySelector('.communications-history');
    const audio=root?.querySelector('[data-communications-audio]');
    if(!root || !audio) return;
    if(audio.ended) audio.currentTime=0;
    if(audio.paused){
      if(audio.error)audio.load();
      updateCommunicationsAudioUi(root);
      try{ await audio.play(); }
      catch(error){ const stateLabel=root.querySelector('[data-communications-audio-state]'); if(stateLabel) stateLabel.textContent=error?.name==='NotAllowedError'?'PLAYBACK BLOCKED // TAP AGAIN':'PLAYBACK UNAVAILABLE // RETRY'; }
    } else audio.pause();
    updateCommunicationsAudioUi(root);
  }

  const MAINTENANCE_ACCESS_CODE = '12345';
  const FACILITY_FONT_KEY = 'etos.command.facility-fonts.v2';
  const facilityFontDefaults = {overallScale:100,comparisonPrompt:13,stationHeading:22,stationData:13,stationBody:14,stationButton:12,telemetryLabels:9,telemetryValues:16,pageHeading:22,moduleTitles:18,moduleMeta:10,personnelNames:12,personnelRoles:10,biosignalNames:12,biosignalState:11,biosignalDetail:10,recordTitles:12,recordBody:14,vehicleStatus:15,roomLabels:12};
  let facilityView = 'comparison';
  let facilityOverlay = null;
  let facilityMaintenanceUnlocked = false;
  let biosignalUnlocked = false;
  let facilitySelectedRoom = 'command';
  let facilitySelectedTarget = 'command-control';
  let facilityMapStatus = '';
  const FACILITY_STATE_KEY = 'etos.command.facility-map-state.v1';
  const FACILITY_ICON_LAYOUT_KEY = 'etos.command.facility-icon-layout.v2';
  const facilityIconDefaults = {vibration:{x:85,y:99},weather:{x:184,y:242}};
  let facilityIconLayout = (()=>{try{const saved=JSON.parse(localStorage.getItem(FACILITY_ICON_LAYOUT_KEY)||'{}');return {vibration:{...facilityIconDefaults.vibration,...(saved.vibration||{})},weather:{...facilityIconDefaults.weather,...(saved.weather||{})}}}catch{return structuredClone(facilityIconDefaults)}})();
  let facilityIconDevOpen = false;
  const saveFacilityIconLayout=()=>localStorage.setItem(FACILITY_ICON_LAYOUT_KEY,JSON.stringify(facilityIconLayout));
  let facilitySystemState = (()=>{const defaults={medbayUnlocked:false,medbayOpen:false,freezerUnlocked:false,freezerOpen:false,airlockOuterOpen:false};try{return {...defaults,...JSON.parse(localStorage.getItem(FACILITY_STATE_KEY)||'{}')}}catch{return {...defaults}}})();
  let facilityMapMode = 'general';
  let facilitySelectedVehicle = 'evacuation';
  let facilitySelectedWorkOrder = 'commissary';
  let facilityAnimationFrame = null;
  let facilityLocalTargetAt = 0;
  let facilityHeronPacket = -1;
  let facilityHackHoldTimer = null;
  let facilityHackFinishTimer = null;
  const facilityValues = {
    horizon:{reactor:63.8,life:41.2,water:30.1,reserve:19.3},
    heron:{reactor:89.1,life:74.4,water:85.7,reserve:70.8}
  };
  const facilityTargets = {
    horizon:{...facilityValues.horizon},
    heron:{...facilityValues.heron}
  };
  const facilityRanges = {
    horizon:{reactor:[61,66],life:[38,44],water:[27,33],reserve:[16,22]},
    heron:{reactor:[87,91],life:[71,77],water:[83,88],reserve:[67,74]}
  };

  const facilityFaults = [
    {id:'armory-breach',severity:'critical',title:'ARMORY SECURITY BREACH',status:'DOOR ASSEMBLY NOT DETECTED',location:'ARMORY DOOR',target:'armory-door'},
    {id:'biocontainment',severity:'critical',title:'BIOCONTAINMENT ALERT',status:'CONTAINMENT SYSTEM REQUIRES REVIEW',location:'MEDBAY',target:'medbay-containment'},
    {id:'garage-door',severity:'critical',title:'GARAGE DOOR 02 MALFUNCTION',status:'ACTUATOR STALLED',location:'GARAGE / EXTERIOR',target:'garage-door'},
    {id:'control-degraded',severity:'warning',title:'CENTRAL CONTROL DEGRADED',status:'PRIMARY SYSTEMS DAMAGED',location:'COMMAND CENTER',target:'command-control'},
    {id:'comms-offline',severity:'warning',title:'LOCAL COMMUNICATIONS OFFLINE',status:'LOCAL COMMS NO RESPONSE',location:'CREW HABITAT',target:'habitat-comms'},
    {id:'structural-impact',severity:'warning',title:'REPEATING STRUCTURAL IMPACT',status:'REPEATING VIBRATION',location:'GARAGE / UTILITIES',target:'habitat-sensor'},
    {id:'weather',severity:'advisory',title:'SEVERE EXTERIOR WEATHER',status:'CYCLING HAZARD',location:'AIRLOCK',target:'airlock-weather'}
  ];
  const facilityTargetsMap = {
    'armory-door':{layer:'systems',svgId:'door-armory',kind:'door'},
    'medbay-containment':{layer:'hitboxes',svgId:'room-medbay',kind:'room'},
    'garage-door':{layer:'systems',svgId:'door-garageext',kind:'door'},
    'command-control':{layer:'hitboxes',svgId:'room-command',kind:'room'},
    'habitat-comms':{layer:'hitboxes',svgId:'room-habitat',kind:'room'},
    'habitat-sensor':{layer:'alerts',svgId:'alert-vibration',kind:'sensor'},
    'airlock-weather':{layer:'alerts',svgId:'alert-weather',kind:'sensor'},
    'medbay-door':{layer:'systems',svgId:'door-medbay',kind:'door'},
    'freezer-door':{layer:'systems',svgId:'door-freezer',kind:'door'},
    'airlock-control':{layer:'hitboxes',svgId:'room-airlock',kind:'room'},
    'armory':{layer:'hitboxes',svgId:'room-armory',kind:'room'},
    'medbay':{layer:'hitboxes',svgId:'room-medbay',kind:'room'},
    'garage':{layer:'hitboxes',svgId:'room-garage',kind:'room'},
    'habitat':{layer:'hitboxes',svgId:'room-habitat',kind:'room'},
    'command':{layer:'hitboxes',svgId:'room-command',kind:'room'},
    'airlock':{layer:'hitboxes',svgId:'room-airlock',kind:'room'},
    'freezer':{layer:'hitboxes',svgId:'room-freezer',kind:'room'},
    'pantry':{layer:'hitboxes',svgId:'room-pantry',kind:'room'},
    'commissary':{layer:'hitboxes',svgId:'room-commissary',kind:'room'}
  };
  const saveFacilitySystemState=()=>localStorage.setItem(FACILITY_STATE_KEY,JSON.stringify(facilitySystemState));

  const facilityRooms = {
    armory:{name:'ARMORY',purpose:'Secure storage for military equipment and mission ordnance.',equipment:'WEAPON RACKS // MUNITIONS LOCKERS // SECURITY TERMINAL',access:'MILITARY AUTHORIZATION'},
    command:{name:'COMMAND CENTER',purpose:'Mission coordination, communications routing, and colony administration.',equipment:'COMMAND CONSOLES // LOCAL ARCHIVE // FACILITY CONTROL BUS',access:'COMMAND PERSONNEL'},
    airlock:{name:'PRIMARY AIRLOCK',purpose:'Controlled personnel and equipment transition to exterior conditions.',equipment:'CYCLING CHAMBER // SUIT CHECK // DECONTAMINATION PORTS',access:'CREW AUTHORIZATION'},
    habitat:{name:'CREW HABITAT',purpose:'Primary sleeping quarters and personal storage for assigned personnel.',equipment:'BUNKS // PERSONAL LOCKERS // EMERGENCY RESPIRATORS',access:'CREW AUTHORIZATION'},
    pantry:{name:'PANTRY',purpose:'Dry-goods storage and commissary provisioning.',equipment:'SEALED STORAGE // INVENTORY TERMINAL // WATER DISPENSER',access:'GENERAL CREW'},
    freezer:{name:'WALK-IN FREEZER',purpose:'Long-term preservation of food and temperature-sensitive supplies.',equipment:'REFRIGERATION ARRAY // TEMPERATURE MONITOR // MANUAL RELEASE',access:'GENERAL CREW'},
    commissary:{name:'COMMISSARY',purpose:'Shared dining, briefing, and personnel assembly area.',equipment:'GALLEY SERVICE // PUBLIC-ADDRESS SYSTEM // FULL-CAPACITY SEATING',access:'GENERAL CREW'},
    medbay:{name:'MEDBAY',purpose:'Clinical treatment, stabilization, and medical-supply storage.',equipment:'SURGICAL BAY // DIAGNOSTICS // PHARMACY STORAGE',access:'MEDICAL PERSONNEL'},
    garage:{name:'GARAGE / UTILITIES',purpose:'Vehicle storage, charging, repair, and facility utility access.',equipment:'DUAL APC BAYS // ELECTRIC CHARGING // SERVICE LIFT',access:'TECHNICAL OPERATIONS'}
  };

  const facilityPersonnel = [
    {id:'edem',name:'DR. EDEM, CLAIRE',division:'CIVILIAN',group:'MISSION COMMAND',role:'CHIEF MISSION SPECIALIST',signal:'remote'},
    {id:'hinton',name:'DR. HINTON, NATHAN',division:'CIVILIAN',group:'SCIENCE DIVISION',role:'SCIENCE OFFICER // SYNTHETIC',signal:'remote'},
    {id:'ziegler',name:'DR. ZIEGLER, ANIKA',division:'CIVILIAN',group:'SCIENCE DIVISION',role:'EXOBIOLOGIST',signal:'remote'},
    {id:'jensen',name:'DR. JENSEN, ERIK',division:'CIVILIAN',group:'SCIENCE DIVISION',role:'GEOLOGIST',signal:'remote'},
    {id:'kawaguchi',name:'DR. KAWAGUCHI, NAOMI',division:'CIVILIAN',group:'SCIENCE DIVISION',role:'PLANETOLOGIST',signal:'remote'},
    {id:'sobol',name:'SOBOL, IRENA',division:'CIVILIAN',group:'TECHNICAL OPERATIONS',role:'CHIEF ENGINEER',signal:'remote'},
    {id:'demar',name:'DEMAR, OWEN',division:'CIVILIAN',group:'TECHNICAL OPERATIONS',role:'MECHANIC',signal:'local'},
    {id:'kaplan',name:'2LT KAPLAN, AARON',division:'MILITARY',group:'PLATOON COMMAND',role:'PLATOON COMMANDER',signal:'none'},
    {id:'lange',name:'2LT LANGE, BRIDGET',division:'MILITARY',group:'PLATOON COMMAND',role:'DROPSHIP PILOT',signal:'none'},
    {id:'underhill',name:'SSGT UNDERHILL, MARCUS',division:'MILITARY',group:'PLATOON COMMAND',role:'PLATOON SERGEANT',signal:'remote'},
    {id:'valdez',name:'SGT VALDEZ, SOFIA',division:'MILITARY',group:'PLATOON COMMAND',role:'PLATOON TECH',signal:'remote'},
    {id:'yang',name:'SGT YANG, MIN-JAE',division:'MILITARY',group:'ZIGZAG SQUAD',role:'SQUAD LEADER',signal:'remote'},
    {id:'xavier',name:'LCPL XAVIER, MATEO',division:'MILITARY',group:'ZIGZAG SQUAD',role:'APC DRIVER',signal:'none'},
    {id:'resnick',name:'LCPL RESNICK, TALIA',division:'MILITARY',group:'ZIGZAG SQUAD',role:'FIRETEAM 1 LEADER',signal:'none'},
    {id:'novikov',name:'CPL NOVIKOV, DMITRI',division:'MILITARY',group:'ZIGZAG SQUAD',role:'FIRETEAM 2 LEADER',signal:'remote'},
    {id:'tanaka',name:'PFC TANAKA, EMI',division:'MILITARY',group:'ZIGZAG SQUAD',role:'APC TECH',signal:'remote'},
    {id:'pedro',name:'PFC PEDRO, LUIS',division:'MILITARY',group:'ZIGZAG SQUAD',role:'FIRETEAM 1',signal:'remote'},
    {id:'olsson',name:'PFC OLSSON, ERIK',division:'MILITARY',group:'ZIGZAG SQUAD',role:'FIRETEAM 2',signal:'none'},
    {id:'abara',name:'SGT ABARA, NIA',division:'MILITARY',group:'SIEGE SQUAD',role:'SQUAD LEADER',signal:'local'},
    {id:'ivanovic',name:'CPL IVANOVIC, LUKA',division:'MILITARY',group:'SIEGE SQUAD',role:'APC DRIVER',signal:'remote'},
    {id:'brookman',name:'HM3 BROOKMAN, LEAH',division:'MILITARY',group:'SIEGE SQUAD',role:'PLATOON CORPSMAN',signal:'remote'},
    {id:'franco',name:'LCPL FRANCO, ISABEL',division:'MILITARY',group:'SIEGE SQUAD',role:'FIRETEAM 2 LEADER',signal:'remote'},
    {id:'qadir',name:'CPL QADIR, TARIQ',division:'MILITARY',group:'SIEGE SQUAD',role:'FIRETEAM 2 LEADER',signal:'remote'},
    {id:'glockner',name:'PFC GLÖCKNER, FELIX',division:'MILITARY',group:'SIEGE SQUAD',role:'FIRETEAM 1',signal:'remote'},
    {id:'weaver',name:'PFC WEAVER, JONAH',division:'MILITARY',group:'SIEGE SQUAD',role:'FIRETEAM 2',signal:'remote'}
  ];

  const facilityVehicleLogs = [
    {id:'survey',date:'02/16/2122',title:'APC-01 // RESEARCH TRANSPORT RETURN',status:'CLOSED',fields:[['VEHICLE','APC-01'],['OPERATOR','CPL. IVANOVIC'],['ASSIGNMENT','RESEARCH TRANSPORT'],['RETURN','CONFIRMED'],['ROUTE RECORD','NOT ATTACHED']],body:'Vehicle returned with undercarriage impact damage, suspension misalignment, intake obstruction, and exterior contamination. Maintenance inspection initiated.'},
    {id:'cargo',date:'06/29/2122',title:'APC-02 // UTILITY TRANSFER',status:'CLOSED',fields:[['VEHICLE','APC-02'],['ASSIGNMENT','WATER-PROCESSING EQUIPMENT TRANSFER'],['RETURN','CONFIRMED'],['CHARGE AT RETURN','31.6%']],body:'Routine equipment transfer completed. Vehicle returned to Garage Bay 02.'},
    {id:'recharge',date:'07/14/2122',title:'APC-02 // BATTERY RECOVERY',status:'OPEN',fields:[['VEHICLE','APC-02'],['LOCATION','HORIZON BASE GARAGE'],['CHARGE AT INTAKE','11.8%'],['SERVICE','DEEP-DISCHARGE RECOVERY'],['VEHICLE RELEASE','LOCKED']],body:'Battery equalization and controlled recharge cycle initiated. Scheduled completion: 07/19/2122.'},
    {id:'evacuation',date:'07/18/2122',title:'EMERGENCY EVACUATION DISPATCH',status:'UNCONFIRMED',fields:[['DESTINATION','HERON STATION'],['APC-01 OPERATOR','CPL. IVANOVIC'],['CIVILIAN PASSENGERS','06'],['ATV PERSONNEL','11 MILITARY'],['TOTAL DEPARTURE MANIFEST','12 MILITARY // 06 CIVILIAN'],['DEPARTURE','CONFIRMED'],['ARRIVAL','NOT CONFIRMED']],body:'APC-01 and the military ATV convoy departed Horizon Base. Local vehicle telemetry was lost after departure. No authenticated response was received from Heron Station.'}
  ];

  const facilityWorkOrders = [
    {id:'water',date:'01/21/2122',title:'WATER RECOVERY FILTER SERVICE',status:'CLOSED',archived:true},
    {id:'apc-repair',date:'02/16/2122',title:'APC-01 DAMAGE REPAIR',status:'CLOSED',fields:[['REQUESTOR','DR. NATHAN HINTON'],['ASSET','APC-01'],['CATEGORY','VEHICLE REPAIR'],['TRAVEL AUTHORIZATION','NOT FOUND'],['VEHICLE ROUTE RECORD','NOT ATTACHED']],body:'Undercarriage impact damage, suspension misalignment, intake obstruction, and exterior contamination were repaired. Requestor identified the damage as the result of authorized research transport.'},
    {id:'research-parts',date:'03/12/2122',title:'RESEARCH COMPONENT ALLOCATION',status:'CLOSED',fields:[['REQUESTOR','DR. NATHAN HINTON'],['PROJECT','SPECIALIZED SPECIMEN MONITORING APPARATUS'],['AUTHORIZATION','CORPORATE RESEARCH PRIORITY'],['INSTALLATION LOCATION','NOT PROVIDED'],['PROJECT IDENTIFIER','NOT ATTACHED']],body:'Parts issued: wideband signal processor, carrier-wave modulator, signal-conditioning boards, shielded transmission cable, and isolated power regulator.'},
    {id:'amplifier',date:'06/02/2122',title:'COMMUNICATIONS AMPLIFIER TRANSFER',status:'OPEN',fields:[['REQUESTOR','DR. NATHAN HINTON'],['SOURCE','COMMUNICATIONS STORES'],['DESTINATION','RESEARCH LAB'],['JUSTIFICATION','BROADBAND SPECIMEN RESPONSE TESTING'],['RETURN STATUS','NOT RECORDED']],body:'Spare communications amplifier transferred to the research allocation. Return confirmation remains outstanding.'},
    {id:'apc-charge',date:'07/14/2122',title:'APC-02 BATTERY RECOVERY',status:'OPEN',fields:[['REQUEST SOURCE','AUTOMATIC VEHICLE DIAGNOSTIC'],['ASSET','APC-02'],['SERVICE','BATTERY EQUALIZATION // DEEP-DISCHARGE RECOVERY'],['CHARGE AT INTAKE','11.8%'],['ESTIMATED COMPLETION','07/19/2122']],body:'Vehicle release remains locked until the minimum deployment charge is reached.'},
    {id:'airlock',date:'07/16/2122',title:'AIRLOCK STATUS INDICATOR',status:'CLOSED',fields:[['REQUEST SOURCE','AUTOMATIC FACILITY DIAGNOSTIC'],['LOCATION','AIRLOCK 02'],['FAULT','STATUS INDICATOR LAMP FAILURE'],['RESOLUTION','LAMP ASSEMBLY REPLACED'],['CONTROL CIRCUIT','TEST PASSED']],body:'Routine indicator service completed. No active action required.'},
    {id:'commissary',date:'07/17/2122',title:'COMMISSARY EVENT PREPARATION',status:'CLOSED',fields:[['REQUESTOR','DR. NATHAN HINTON'],['LOCATION','HORIZON BASE COMMISSARY'],['CATEGORY','CLEANING // EVENT SUPPORT'],['PRIORITY','ROUTINE'],['EVENT','PFC OLSSON BIRTHDAY GATHERING']],body:'Please give the commissary additional attention before PFC Olsson’s birthday gathering. Complete a full sanitation pass, increase ambient lighting, install supplemental fixtures where available, and arrange the room for full personnel attendance. The space should be inviting enough that all personnel will want to attend.',resolution:['COMMISSARY SANITATION // COMPLETED','SUPPLEMENTAL LIGHTING // INSTALLED','SEATING CONFIGURATION // FULL CAPACITY','PUBLIC-ADDRESS CIRCUIT // TESTED']}
  ];

  function renderFacilityMetricCells(prefix){
    return [['reactor','REACTOR / POWER OUTPUT'],['life','LIFE SUPPORT'],['water','WATER RECOVERY'],['reserve','POWER RESERVE']].map(([key,label])=>`<div><small>${label}</small><strong data-facility-metric="${prefix}-${key}">${facilityValues[prefix][key].toFixed(1)}%</strong><i><b data-facility-bar="${prefix}-${key}" style="width:${facilityValues[prefix][key]}%"></b></i></div>`).join('');
  }

  function renderFacilityComparison(){
    return `<div class="facility-management facility-comparison">
      <header class="facility-intro"><div><small>INSTALLATION CONDITION COMPARISON</small><h3>HORIZON BASE // HERON STATION</h3></div><span>SELECT FACILITY FOR AVAILABLE RECORDS</span></header>
      <section class="facility-live-comparison"><header><div><small>LIVE FACILITY TELEMETRY</small><strong>LOCAL BUS // DISTRESS CARRIER</strong></div><span>HERON NEXT PACKET // <b data-facility-heron-countdown>00:30</b></span></header><div class="facility-live-columns"><div><h4>HORIZON BASE</h4>${renderFacilityMetricCells('horizon')}<button type="button" data-facility-open="horizon">OPEN HORIZON FACILITY SYSTEMS →</button></div><div><h4>HERON STATION</h4>${renderFacilityMetricCells('heron')}<button type="button" data-facility-open="heron">VIEW PASSIVE HERON TELEMETRY →</button></div></div></section>
      ${renderFacilityOverlay()}
    </div>`;
  }

  function renderFacilityCondition(site){
    const horizon=site==='horizon';
    const fields=horizon
      ? [['HULL INTEGRITY','72%'],['HABITAT BREACHES','MULTIPLE'],['ATMOSPHERE','UNSTABLE'],['INTERIOR PRESSURE','MAINTAINED'],['ENVIRONMENTAL EXPOSURE','LOCALIZED'],['ENVIRONMENTAL PROTECTION','LIMITED']]
      : [['HULL INTEGRITY','94%'],['HABITAT BREACHES','NONE DETECTED'],['ATMOSPHERE','DEGRADING'],['INTERIOR PRESSURE','NOMINAL'],['LIFE SUPPORT','REDUCED CAPACITY'],['ENVIRONMENTAL PROTECTION','EFFECTIVE']];
    const note=horizon
      ? 'Multiple habitat breaches detected. Environmental sealing has failed in several sections. Interior pressure remains partially stable. Structure provides limited protection from external conditions. Vacuum suits recommended for prolonged occupancy.'
      : 'Primary habitat remains structurally intact. Atmospheric processing efficiency continues to decline. Conditions remain habitable for an indeterminate period if critical systems remain operational.';
    return `<section class="facility-condition-panel" aria-label="${horizon?'Horizon Base':'Heron Station'} facility condition"><header><small>${horizon?'LOCAL FACILITY BUS':'AUTOMATED DISTRESS CARRIER'}</small><h4>FACILITY CONDITION</h4><span>${horizon?'CONTINUOUS TELEMETRY':'30-SECOND PACKET'}</span></header><dl>${fields.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><p>${note}</p></section>`;
  }

  function renderHorizonFacility(){
    return `<div class="facility-management facility-horizon-home">
      <header class="facility-page-header"><div><small>LOCAL INSTALLATION CONTROL</small><h3>HORIZON BASE</h3></div><strong>FACILITY CONDITION // DEGRADED</strong></header>
      <div class="facility-horizon-main">
        <div class="facility-horizon-controls">
          <section class="facility-local-metrics">${renderFacilityMetricCells('horizon')}</section>
          <section class="facility-module-grid">
            <button type="button" data-facility-nav="personnel"><strong>PERSONNEL DIRECTORY</strong></button>
            <button type="button" data-facility-nav="map"><strong>FACILITY SCHEMATICS</strong></button>
            <button type="button" data-facility-nav="vehicles"><strong>VEHICLE INVENTORY &amp; LOG</strong></button>
            <button type="button" data-facility-nav="workorders"><strong>WORK ORDER ARCHIVE</strong></button>
          </section>
        </div>
        ${renderFacilityCondition('horizon')}
      </div>
      <section class="facility-status-summary"><div><small>HABITAT CONDITION</small><strong>LIMITED PROTECTION</strong></div><div><small>LOCAL PERSONNEL NETWORK</small><strong>PASSIVE MONITORING</strong></div><div><small>FACILITY RECORD BUS</small><strong>AVAILABLE</strong></div></section>
    </div>`;
  }

  function renderPersonnelDirectory(){
    const civilianScience=facilityPersonnel.filter(p=>p.group==='SCIENCE DIVISION');
    const civilianTech=facilityPersonnel.filter(p=>p.group==='TECHNICAL OPERATIONS');
    const edem=facilityPersonnel.find(p=>p.id==='edem');
    const kaplan=facilityPersonnel.find(p=>p.id==='kaplan');
    const command=facilityPersonnel.filter(p=>p.group==='PLATOON COMMAND'&&p.id!=='kaplan');
    const zigzag=facilityPersonnel.filter(p=>p.group==='ZIGZAG SQUAD');
    const siege=facilityPersonnel.filter(p=>p.group==='SIEGE SQUAD');
    const personCard=p=>`<div class="facility-person"><strong>${p.name}</strong><span>${p.role}</span></div>`;
    return `<div class="facility-management facility-personnel">
      <header class="facility-page-header"><div><small>PERSONNEL DATABASE // 25 RECORDS</small><h3>ORGANIZATIONAL DIRECTORY</h3></div><button type="button" class="facility-restricted-action" data-facility-biosignal>${biosignalUnlocked||executiveAuthorized?'BIOSIGNAL TRACKER MONITOR':'BIOSIGNAL TRACKER MONITOR // RESTRICTED'}</button></header>
      <div class="facility-org-scroll">
        <section class="facility-org-branch facility-org-branch--civilian"><header><small>CIVILIAN OPERATIONS</small><strong>HORIZON BASE MISSION PERSONNEL</strong></header><div class="facility-command-lead">${personCard(edem)}</div><div class="facility-org-columns"><div><h4>SCIENCE DIVISION</h4>${civilianScience.map(personCard).join('')}</div><div><h4>TECHNICAL OPERATIONS</h4>${civilianTech.map(personCard).join('')}</div></div></section>
        <section class="facility-org-branch facility-org-branch--military"><header><small>MILITARY OPERATIONS</small><strong>HORIZON SECURITY PLATOON</strong></header><div class="facility-command-lead">${personCard(kaplan)}</div><div class="facility-command-row">${command.map(personCard).join('')}</div><div class="facility-org-columns"><div><h4>ZIGZAG SQUAD</h4>${zigzag.map(personCard).join('')}</div><div><h4>SIEGE SQUAD</h4>${siege.map(personCard).join('')}</div></div></section>
      </div>
      <footer class="facility-data-footer"><span>PERSONNEL REPORT // 07/12/2122</span><strong>BADGE LOCATION NETWORK // UNAVAILABLE</strong></footer>
      ${facilityOverlay==='biosignal-lock'?renderBiosignalLock():facilityOverlay==='biosignal-hack'?renderFacilityHack('biosignal'):''}
    </div>`;
  }

  function renderBiosignalLock(){
    return `<div class="facility-overlay" data-facility-overlay><section class="facility-access-lock" role="dialog" aria-modal="true" aria-labelledby="biosignal-lock-title"><button type="button" data-facility-overlay-close>× CLOSE</button><small>PERSONNEL BIOSIGNAL MONITOR</small><h3 id="biosignal-lock-title">EXECUTIVE MEDICAL CLEARANCE REQUIRED</h3><dl><div><dt>AUTHORIZED USER</dt><dd>DR. CLAIRE EDEM</dd></div><div><dt>LOCATION SERVICES</dt><dd>UNAVAILABLE</dd></div></dl><label>ENTER AUTHORIZATION CODE<input id="biosignal-access-code" type="password" inputmode="numeric" maxlength="5" autocomplete="off"></label><button type="button" data-biosignal-submit>VERIFY</button><p data-biosignal-error role="alert"></p><button type="button" class="directive-security-mark facility-security-mark" data-facility-hack="biosignal" aria-label="Ellison-Tanaka corporate seal"><img src="assets/img/ellison-tanaka-logo.svg" alt=""></button></section></div>`;
  }

  function renderBiosignalMonitor(){
    const status=p=>p.signal==='local'?'<strong class="biosignal-state biosignal-state--active"><i></i>LIFE SIGNAL DETECTED</strong><span class="biosignal-detail" data-biosignal-current>UPDATE // CURRENT</span>':p.signal==='none'?'<strong class="biosignal-state biosignal-state--none"><i></i>NO LIFE SIGNAL DETECTED</strong><span class="biosignal-detail">LOCAL SENSOR POLL // COMPLETE</span>':'<strong class="biosignal-state biosignal-state--remote"><i></i>OUT OF RANGE</strong><span class="biosignal-detail">LIFE SIGNAL DETECTED AT SIGNAL LOSS</span>';
    return `<div class="facility-management facility-biosignals"><header class="facility-page-header"><div><small>EXECUTIVE MEDICAL ACCESS</small><h3>PERSONNEL BIOSIGNAL MONITOR</h3></div><strong>PASSIVE MONITORING // ACTIVE</strong></header><div class="biosignal-summary"><div><small>ASSIGNED</small><strong>25</strong></div><div><small>OUT OF RANGE</small><strong>18</strong></div><div><small>CURRENT SIGNAL</small><strong>02</strong></div><div><small>NO SIGNAL</small><strong>05</strong></div></div><section class="biosignal-list">${facilityPersonnel.map(p=>`<div><b>${p.name}</b><span class="biosignal-readout">${status(p)}</span></div>`).join('')}</section><footer class="facility-data-footer"><span>LOCATION DATA UNAVAILABLE</span><strong>BIOSIGNAL RESULTS DO NOT INDICATE PERSONNEL POSITION</strong></footer></div>`;
  }

  function renderFacilityFaultRows(){
    return ['critical','warning','advisory'].map(severity=>`<section class="facility-fault-group facility-fault-group--${severity}">${facilityFaults.filter(f=>f.severity===severity).map(f=>`<button type="button" class="facility-fault-row${facilitySelectedTarget===f.target?' is-selected':''}" data-facility-target="${f.target}" aria-pressed="${facilitySelectedTarget===f.target}"><b>${String(facilityFaults.indexOf(f)+1).padStart(2,'0')}</b><span><strong>${f.title}</strong></span></button>`).join('')}</section>`).join('');
  }

  function renderFacilityDiagnostic(){
    const t=facilitySelectedTarget;
    if(t==='armory-door')return `<small>SECURITY DOOR DIAGNOSTIC</small><h3>ARMORY SECURITY BREACH</h3><dl><div><dt>DOOR POSITION</dt><dd>OPEN</dd></div><div><dt>LOCKING MECHANISM</dt><dd>NO RESPONSE</dd></div><div><dt>SECURITY SEAL</dt><dd>BREACHED</dd></div><div><dt>ASSEMBLY STATUS</dt><dd>NOT DETECTED</dd></div></dl><footer>REMOTE CORRECTION UNAVAILABLE</footer>`;
    if(t==='medbay-containment')return `<small>BIOCONTAINMENT DIAGNOSTIC</small><h3>MEDBAY ALERT</h3><dl><div><dt>CONTAINMENT STATUS</dt><dd>REQUIRES REVIEW</dd></div><div><dt>ENTRY LOCK</dt><dd>${facilitySystemState.medbayUnlocked?'RELEASED':'ENGAGED'}</dd></div><div><dt>DOOR ASSEMBLY</dt><dd>ONLINE</dd></div><div><dt>AUTHORIZED ACCESS</dt><dd>DR. C. EDEM</dd></div></dl><button type="button" data-facility-target="medbay-door">OPEN ENTRY CONTROL →</button><footer>BIOCONTAINMENT ALERT // ACTIVE</footer>`;
    if(t==='medbay-door')return `<small>MEDBAY ENTRY CONTROL</small><h3>AUTHORIZED PERSONNEL ACCESS</h3><dl><div><dt>ENTRY LOCK</dt><dd>${facilitySystemState.medbayUnlocked?'RELEASED':'ENGAGED'}</dd></div><div><dt>DOOR POSITION</dt><dd>${facilitySystemState.medbayOpen?'OPEN':'CLOSED'}</dd></div><div><dt>DOOR ASSEMBLY</dt><dd>ONLINE</dd></div><div><dt>AUTHORIZED USER</dt><dd>DR. C. EDEM</dd></div></dl>${facilitySystemState.medbayUnlocked?`<button type="button" class="facility-primary-control" data-medbay-toggle>${facilitySystemState.medbayOpen?'CLOSE MEDBAY DOOR':'OPEN MEDBAY DOOR'}</button><p class="facility-command-result">REMOTE DOOR CONTROL AVAILABLE</p>`:`<label class="facility-credential-entry">PASSWORD<input type="password" inputmode="numeric" maxlength="5" data-medbay-password autocomplete="off"></label><button type="button" class="facility-primary-control" data-medbay-unlock>VERIFY &amp; RELEASE LOCK</button><p class="facility-command-result" data-medbay-result></p>`}<footer>BIOCONTAINMENT ALERT REMAINS ACTIVE</footer>`;
if(t==='garage-door')return `<h3>GARAGE DOOR 02</h3><dl><div><dt>POSITION</dt><dd>CLOSED</dd></div><div><dt>ACTUATOR</dt><dd>STALLED</dd></div><div><dt>LOAD</dt><dd>ABOVE LIMIT</dd></div></dl><button type="button" data-garage-open>OPEN GARAGE DOOR 02</button><p class="facility-command-result" data-garage-result></p><footer>LOCAL SERVICE REQUIRED</footer>`;
    if(t==='command-control')return `<small>FACILITY SELF-DIAGNOSTIC</small><h3>BACKUP FACILITY CONTROL INTERFACE ACTIVE</h3><dl><div><dt>PRIMARY CONTROL BUS</dt><dd>DAMAGED</dd></div><div><dt>BACKUP INTERFACE</dt><dd>ACTIVE</dd></div><div><dt>LOCAL NETWORK</dt><dd>ONLINE</dd></div><div><dt>REMOTE SYSTEM ACCESS</dt><dd>PARTIAL</dd></div></dl><footer>CENTRAL CONTROL // DEGRADED</footer>`;
    if(t==='habitat-comms')return `<small>CREW HABITAT SYSTEM</small><h3>COMMUNICATIONS OFFLINE</h3><dl><div><dt>HABITAT POWER</dt><dd>PARTIAL</dd></div><div><dt>LIGHTING</dt><dd>EMERGENCY</dd></div><div><dt>LOCAL COMMS</dt><dd>NO RESPONSE</dd></div></dl><footer>REMOTE RESET UNAVAILABLE</footer>`;
    if(t==='habitat-sensor')return `<small>STRUCTURAL VIBRATION SENSOR</small><h3>REPEATING STRUCTURAL IMPACT</h3><dl><div><dt>SENSOR</dt><dd>HAB-G04</dd></div><div><dt>STATUS</dt><dd>ACTIVE</dd></div><div><dt>ORIGIN ESTIMATE</dt><dd>GARAGE / UTILITIES</dd></div><div><dt>INTERVAL</dt><dd>6.8 SECONDS</dd></div></dl><footer>PASSIVE SENSOR RECORD // CURRENT</footer>`;
    if(t==='airlock-weather')return `<small>EXTERIOR CONDITIONS ADVISORY</small><h3>SEVERE EXTERIOR WEATHER</h3><dl><div><dt>PRESSURE SEAL</dt><dd>NOMINAL</dd></div><div><dt>CYCLING SYSTEM</dt><dd>AVAILABLE</dd></div><div><dt>EXTERIOR CONDITIONS</dt><dd>SEVERE WEATHER</dd></div></dl><button type="button" data-facility-target="airlock-control">OPEN AIRLOCK CONTROL →</button><footer>PRESSURE CYCLING HAZARD</footer>`;
    if(t==='airlock-control')return `<h3>AIRLOCK CONTROL</h3><dl><div><dt>CYCLING SYSTEM</dt><dd>AVAILABLE</dd></div><div><dt>PRESSURE SEAL</dt><dd>NOMINAL</dd></div><div><dt>EXTERIOR HATCH</dt><dd>${facilitySystemState.airlockOuterOpen?'OPEN':'CLOSED'}</dd></div><div><dt>DECONTAMINATION</dt><dd>STANDBY</dd></div><div><dt>EXTERIOR CONDITIONS</dt><dd>SEVERE WEATHER</dd></div></dl><p>Cycling may expose interior to wind-driven rain and airborne contaminants.</p><button type="button" class="facility-primary-control" data-airlock-cycle>${facilitySystemState.airlockOuterOpen?'CLOSE EXTERIOR HATCH':'YES — BEGIN CYCLE'}</button><p class="facility-command-result" data-airlock-result></p><footer>EXTERNAL WEATHER WARNING</footer>`;
    if(t==='freezer-door'||t==='freezer')return `<small>FREEZER ENVIRONMENT</small><h3>WALK-IN FREEZER</h3><dl><div><dt>TEMPERATURE</dt><dd>−40°C / STABLE</dd></div><div><dt>REFRIGERATION</dt><dd>ONLINE</dd></div><div><dt>DOOR LOCK</dt><dd>${facilitySystemState.freezerUnlocked?'RELEASED':'ENGAGED'}</dd></div><div><dt>DOOR POSITION</dt><dd>${facilitySystemState.freezerOpen?'OPEN':'CLOSED'}</dd></div></dl>${facilitySystemState.freezerUnlocked?`<button type="button" class="facility-primary-control" data-freezer-toggle>${facilitySystemState.freezerOpen?'CLOSE FREEZER DOOR':'OPEN FREEZER DOOR'}</button><p class="facility-command-result">REMOTE DOOR CONTROL AVAILABLE</p>`:'<button type="button" class="facility-primary-control" data-freezer-unlock>RELEASE DOOR LOCK</button>'}<footer>ENVIRONMENTAL SYSTEM // NOMINAL</footer>`;
    const room=facilityRooms[t]||facilityRooms[facilitySelectedRoom]||facilityRooms.command;
    return `<small>SELECTED FACILITY AREA</small><h3>${room.name}</h3><dl><div><dt>PURPOSE</dt><dd>${room.purpose}</dd></div><div><dt>STANDARD EQUIPMENT</dt><dd>${room.equipment}</dd></div><div><dt>ACCESS</dt><dd>${room.access}</dd></div></dl><footer>MAP RECORD // CURRENT</footer>`;
  }

  function renderFacilityMap(){
    const showFacilityDev = !!loadDevPrefs().show;
    return `<div class="facility-management facility-map-page">
      <header class="facility-page-header"><div><h3>${facilityMapMode==='maintenance'?'MAINTENANCE SCHEMATICS':'PRIMARY LEVEL SCHEMATIC'}</h3></div><button type="button" class="facility-restricted-action" data-maintenance-toggle>${facilityMapMode==='maintenance'?'VIEW GENERAL FLOORPLAN':'VIEW MAINTENANCE SCHEMATICS'}</button></header>
      <div class="facility-map-layout"><section class="facility-map-viewport" data-facility-map-viewport aria-label="Interactive Horizon Base map"><div class="facility-map-transform" data-facility-map-transform><div class="facility-map-floorplan" aria-label="Horizon Base facility floorplan"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333 318">
  <defs>
    <style>
      .cls-1 {
        stroke: #2e3192;
      }

      .cls-1, .cls-2 {
        fill: none;
        stroke-miterlimit: 10;
        stroke-width: .75px;
      }

      .cls-3 {
        fill: #7cff3e;
      }

      .cls-2 {
        stroke: #00aeef;
      }
    </style>
  </defs>
  <g id="FloorPlan">
    <g>
      <path class="cls-2" d="M120.196,165.979h20.16v-18h36v-20.16h-56.16v38.16ZM122.356,129.98h51.84v15.84h-36v18h-15.84v-33.839Z"/>
      <path class="cls-2" d="M48.196,62.079v-6.259h74.16v54h51.84v-16.03c-12.797-4.578-21.34-16.664-21.34-30.32,0-17.75,14.44-32.19,32.19-32.19s32.19,14.44,32.19,32.19c0,14.191-9.366,26.748-22.88,30.823v15.527h33.84v-53.22h57.29v73.38h-91.13v15.84h18v36h15.84v-16.92c0-10.521,8.56-19.08,19.08-19.08,5.1,0,9.892,1.984,13.493,5.586,3.603,3.59,5.587,8.383,5.587,13.493v21.681c0,8.491-6.904,15.399-15.391,15.399h-38.609v18h-18.09v50.07h-2.16v-52.23h18.09v-18h40.77c7.295,0,13.23-5.939,13.23-13.239v-21.681c0-4.532-1.759-8.781-4.953-11.964-3.195-3.196-7.444-4.955-11.967-4.955-9.33,0-16.92,7.59-16.92,16.919v16.92h16.92v2.16h-37.08v-36h-17.995l-.01-2.16h.005v-18h91.13V58.76h-52.97v53.22h-38.15l-.005-1.08h-.005v-18.245l.795-.217c13.003-3.559,22.085-15.471,22.085-28.968,0-16.559-13.472-30.03-30.03-30.03s-30.03,13.471-30.03,30.03c0,12.984,8.278,24.448,20.599,28.524l.741.245v19.741h-56.16v-54H50.356v4.099h-2.16Z"/>
      <path class="cls-2" d="M48.196,105.526v6.454h54v15.84h-40.32c-11.778,0-21.36,9.582-21.36,21.36s9.582,21.36,21.36,21.36,21.35-9.582,21.35-21.36c0-.54-.022-.885-.061-1.19h19.031v33.83h-54v74.16h74.16v-72h15.84v36h35.91v50.07h2.16v-52.23h-35.91v-36h-20.16v72H50.356v-69.84h54v-38.15h-23.72l.192,1.245c.042.273.08.487.112.672.086.491.125.715.125,1.434,0,10.587-8.608,19.2-19.19,19.2s-19.2-8.613-19.2-19.2,8.613-19.2,19.2-19.2h42.48v-20.16h-54v-4.293h-2.16Z"/>
    </g>
  </g>
  <g id="Doors">
    <rect id="door-habitat" class="cls-1" x="104.356" y="180.399" width="15.84" height="5.698"/>
    <rect id="door-hall1" class="cls-1" x="131.361" y="171.05" width="15.84" height="5.698" transform="translate(-34.619 313.18) rotate(-90)"/>
    <rect id="door-armory" class="cls-1" x="95.351" y="135.055" width="15.85" height="5.698" transform="translate(-34.629 241.18) rotate(-90)"/>
    <rect id="door-medbay" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="221.356" y="117.051" width="15.84" height="5.698" transform="translate(109.376 349.176) rotate(-90)"/>
    <rect id="door-pantry" class="cls-1" x="203.361" y="189.05" width="15.84" height="5.698" transform="translate(19.381 403.18) rotate(-90)"/>
    <rect id="door-garage" class="cls-1" x="104.356" y="108.05" width="15.84" height="5.698"/>
    <rect id="door-garageext" class="cls-1" x="27.52" y="80.953" width="43.448" height="5.698" transform="translate(-34.559 133.046) rotate(-90)"/>
    <rect id="door-hall2" class="cls-1" x="176.356" y="144.05" width="15.845" height="5.698"/>
    <rect id="door-command" class="cls-1" x="176.356" y="108.053" width="15.845" height="5.698"/>
    <rect id="door-freezer" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="247.28" y="180.048" width="16.915" height="5.698"/>
    <rect id="door-airlockint" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="176.266" y="216.053" width="15.84" height="5.698"/>
    <rect id="door-airlockext" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="176.266" y="264.351" width="15.84" height="5.698"/>
  </g>
  <g id="Labels">
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M155.568,184.732c-.132,0-.253-.032-.363-.096-.11-.064-.197-.151-.261-.262-.064-.109-.096-.23-.096-.362v-2.88c0-.133.032-.253.096-.363s.151-.197.261-.261c.11-.064.231-.097.363-.097h3.588v.486h-3.588c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.88c0,.063.023.119.069.165.046.046.101.068.165.068h3.588v.486h-3.588Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M160.112,184.634c-.11-.066-.198-.154-.264-.265-.066-.109-.099-.23-.099-.362v-2.028c0-.132.033-.253.099-.363.066-.109.154-.198.264-.264.11-.066.231-.1.363-.1h2.088c.137,0,.26.033.369.1.109.065.197.154.264.264.066.11.1.231.1.363v2.028c0,.132-.033.253-.1.362-.066.11-.154.198-.264.265-.109.065-.232.099-.369.099h-2.088c-.132,0-.253-.033-.363-.099ZM160.475,184.24h2.088c.064,0,.119-.022.166-.068.045-.047.068-.102.068-.165v-2.028c0-.064-.023-.119-.068-.165-.047-.046-.102-.069-.166-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.028c0,.063.023.118.069.165.046.046.1.068.165.068Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M163.92,184.732v-3.48h4.596c.136,0,.259.033.369.1.11.065.197.154.261.264.064.11.097.231.097.363v2.754h-.486v-2.754c0-.064-.024-.119-.072-.165s-.104-.069-.168-.069h-1.446c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-1.452c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M169.71,184.732v-3.48h4.596c.136,0,.259.033.369.1.11.065.197.154.261.264.064.11.097.231.097.363v2.754h-.486v-2.754c0-.064-.024-.119-.072-.165s-.104-.069-.168-.069h-1.446c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-1.452c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M175.565,180.604v-.492h.492v.492h-.492ZM175.565,184.732v-3.48h.492v3.48h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M177.153,184.634c-.11-.066-.198-.154-.265-.265-.065-.109-.099-.23-.099-.362v-.049h.492v.049c0,.063.022.118.068.165.046.046.102.068.165.068h2.088c.064,0,.119-.022.165-.068.046-.047.069-.102.069-.165v-.534c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.132,0-.253-.033-.362-.099-.11-.066-.198-.154-.265-.265-.065-.109-.099-.23-.099-.362v-.534c0-.132.033-.253.099-.363.066-.109.154-.198.265-.264.109-.066.23-.1.362-.1h2.088c.137,0,.26.033.369.1.11.065.198.154.265.264.065.11.099.231.099.363v.048h-.498v-.048c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.063,0-.119.023-.165.069s-.068.101-.068.165v.534c0,.063.022.119.068.165s.102.068.165.068h2.088c.137,0,.26.033.369.1.11.065.198.153.265.264.065.11.099.231.099.363v.534c0,.132-.033.253-.099.362-.066.11-.154.198-.265.265-.109.065-.232.099-.369.099h-2.088c-.132,0-.253-.033-.362-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M181.268,184.634c-.11-.066-.198-.154-.265-.265-.065-.109-.099-.23-.099-.362v-.049h.492v.049c0,.063.022.118.068.165.046.046.102.068.165.068h2.088c.064,0,.119-.022.165-.068.046-.047.069-.102.069-.165v-.534c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.132,0-.253-.033-.362-.099-.11-.066-.198-.154-.265-.265-.065-.109-.099-.23-.099-.362v-.534c0-.132.033-.253.099-.363.066-.109.154-.198.265-.264.109-.066.23-.1.362-.1h2.088c.137,0,.26.033.369.1.11.065.198.154.265.264.065.11.099.231.099.363v.048h-.498v-.048c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.063,0-.119.023-.165.069s-.068.101-.068.165v.534c0,.063.022.119.068.165s.102.068.165.068h2.088c.137,0,.26.033.369.1.11.065.198.153.265.264.065.11.099.231.099.363v.534c0,.132-.033.253-.099.362-.066.11-.154.198-.265.265-.109.065-.232.099-.369.099h-2.088c-.132,0-.253-.033-.362-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M185.771,184.732c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.265-.066-.109-.1-.23-.1-.362v-1.261h3.049v-.768c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.1.109.065.198.154.264.264.066.11.1.231.1.363v2.754h-2.82ZM185.771,184.24h2.322v-1.002h-2.557v.769c0,.063.023.118.069.165.046.046.101.068.165.068Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M189.178,184.732v-2.754c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M192.833,186.112v-.498h2.173c.063,0,.118-.022.165-.068.046-.047.068-.102.068-.165v-.648h-2.322c-.132,0-.253-.033-.362-.099-.11-.066-.198-.154-.265-.265-.065-.109-.099-.23-.099-.362v-2.742h.492v2.742c0,.063.022.118.069.165.046.046.101.068.164.068h2.089c.063,0,.118-.022.165-.068.046-.047.068-.102.068-.165v-2.742h.492v4.116c0,.136-.032.259-.096.368-.064.11-.151.198-.262.265-.109.065-.232.099-.368.099h-2.173Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M77.136,217.133c-.132,0-.253-.032-.363-.096-.11-.064-.197-.151-.261-.262-.064-.109-.096-.23-.096-.362v-2.88c0-.133.032-.253.096-.363s.151-.197.261-.261c.11-.064.231-.097.363-.097h3.588v.486h-3.588c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.88c0,.063.023.119.069.165.046.046.101.068.165.068h3.588v.486h-3.588Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M81.324,217.133v-2.754c0-.132.033-.253.099-.363.066-.109.154-.198.264-.264.11-.066.231-.1.363-.1h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M84.753,217.034c-.11-.066-.198-.154-.264-.265-.066-.109-.099-.23-.099-.362v-2.028c0-.132.033-.253.099-.363.066-.109.154-.198.264-.264.11-.066.231-.1.363-.1h2.088c.136,0,.259.033.369.1.11.065.198.154.264.264.066.11.099.231.099.363v1.26h-3.054v.769c0,.063.023.118.069.165.046.046.101.068.165.068h2.82v.492h-2.82c-.132,0-.253-.033-.363-.099ZM84.881,215.146h2.556v-.768c0-.064-.023-.119-.069-.165-.046-.046-.101-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M89.633,217.133l-1.368-3.48h.528l1.056,2.593,1.122-2.593h.648l1.194,2.587.984-2.587h.534l-1.314,3.48h-.426l-1.296-2.874-1.23,2.874h-.432Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M73.895,224.333v-4.32h.486v1.914h3.45v-1.914h.492v4.32h-.492v-1.914h-3.45v1.914h-.486Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M79.697,224.333c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.265-.066-.109-.099-.23-.099-.362v-1.261h3.048v-.768c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.1.11.065.198.154.264.264.066.11.099.231.099.363v2.754h-2.82ZM79.697,223.841h2.322v-1.002h-2.556v.769c0,.063.023.118.069.165.046.046.101.068.165.068Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M82.998,224.333v-4.62h.492v1.14h2.328c.132,0,.253.033.363.1.11.065.198.154.264.264.066.11.099.231.099.363v2.028c0,.132-.033.253-.099.362-.066.11-.154.198-.264.265-.11.065-.231.099-.363.099h-2.82ZM83.73,223.841h2.088c.064,0,.119-.022.165-.068.046-.047.069-.102.069-.165v-2.028c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.064,0-.12.023-.168.069-.048.046-.072.101-.072.165v2.028c0,.063.024.118.072.165.048.046.104.068.168.068Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M86.987,220.205v-.492h.492v.492h-.492ZM86.987,224.333v-3.48h.492v3.48h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M88.598,224.234c-.11-.066-.197-.154-.261-.265-.064-.109-.096-.23-.096-.362v-3.895h.492v1.14h1.506v.492h-1.506v2.263c0,.063.023.118.069.165.046.046.101.068.165.068h1.272v.492h-1.272c-.136,0-.259-.033-.369-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M91.421,224.333c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.265-.066-.109-.099-.23-.099-.362v-1.261h3.048v-.768c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.1.11.065.198.154.264.264.066.11.099.231.099.363v2.754h-2.82ZM91.421,223.841h2.322v-1.002h-2.556v.769c0,.063.023.118.069.165.046.046.101.068.165.068Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M95.222,224.234c-.11-.066-.197-.154-.261-.265-.064-.109-.096-.23-.096-.362v-3.895h.492v1.14h1.506v.492h-1.506v2.263c0,.063.023.118.069.165.046.046.101.068.165.068h1.272v.492h-1.272c-.136,0-.259-.033-.369-.099Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M50.53,148.517c0-.132.032-.253.096-.363s.151-.197.261-.261c.11-.064.231-.096.363-.096h2.88c.132,0,.253.032.363.096s.197.151.261.261.096.231.096.363v3.6h-.486v-1.578h-3.348v1.578h-.486v-3.6ZM54.364,150.053v-1.536c0-.064-.023-.119-.069-.165-.046-.046-.101-.069-.165-.069h-2.88c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v1.536h3.348Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M55.51,152.117v-2.754c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264.11-.066.231-.099.363-.099h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M58.594,152.117v-3.48h4.596c.136,0,.259.033.369.099.11.066.197.154.261.264.064.11.096.231.096.363v2.754h-.486v-2.754c0-.064-.024-.119-.072-.165-.048-.046-.104-.069-.168-.069h-1.446c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.498v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-1.452c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.754h-.498Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M64.807,152.018c-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-2.028c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v2.028c0,.132-.033.253-.099.363-.066.11-.154.198-.264.264-.11.066-.233.099-.369.099h-2.088c-.132,0-.253-.033-.363-.099ZM65.171,151.625h2.088c.064,0,.119-.023.165-.069.046-.046.069-.101.069-.165v-2.028c0-.064-.023-.119-.069-.165-.046-.046-.101-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.028c0,.064.023.119.069.165.046.046.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M68.542,152.117v-2.754c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264.11-.066.231-.099.363-.099h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M72.196,153.497v-.498h2.172c.064,0,.119-.023.165-.069s.069-.101.069-.165v-.648h-2.322c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-2.742h.492v2.742c0,.064.023.119.069.165s.101.069.165.069h2.088c.064,0,.119-.023.165-.069s.069-.101.069-.165v-2.742h.492v4.116c0,.136-.032.259-.096.369-.064.11-.151.198-.261.264-.11.066-.233.099-.369.099h-2.172Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M72.519,82.132c-.132,0-.253-.032-.363-.096-.11-.064-.197-.151-.261-.261s-.096-.231-.096-.363v-2.88c0-.132.032-.253.096-.363s.151-.197.261-.261.231-.096.363-.096h2.88c.132,0,.253.032.363.096.11.064.197.151.261.261s.096.231.096.363v.174h-.486v-.174c0-.064-.023-.119-.069-.165-.046-.046-.101-.069-.165-.069h-2.88c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.88c0,.064.023.119.069.165.046.046.101.069.165.069h2.88c.064,0,.119-.023.165-.069.046-.046.069-.101.069-.165v-1.068h-1.068v-.492h1.554v1.56c0,.132-.032.253-.096.363s-.151.197-.261.261c-.11.064-.231.096-.363.096h-2.88Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M77.481,82.132c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-1.26h3.048v-.768c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v2.754h-2.82ZM77.481,81.64h2.322v-1.002h-2.556v.768c0,.064.023.119.069.165s.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M80.888,82.132v-2.754c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264.11-.066.231-.099.363-.099h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M84.687,82.132c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-1.26h3.048v-.768c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v2.754h-2.82ZM84.687,81.64h2.322v-1.002h-2.556v.768c0,.064.023.119.069.165s.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M88.7,83.506v-.498h2.172c.064,0,.119-.023.165-.069.046-.046.069-.101.069-.165v-.642h-2.322c-.132,0-.253-.033-.363-.099s-.198-.154-.264-.264c-.066-.11-.099-.231-.099-.363v-2.028c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.11.066.197.154.261.264.064.11.096.231.096.363v3.396c0,.136-.032.259-.096.369-.064.11-.151.198-.261.264-.11.066-.233.099-.369.099h-2.172ZM88.784,81.64h2.088c.064,0,.119-.023.165-.069s.069-.101.069-.165v-2.028c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v2.028c0,.064.023.119.069.165.046.046.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M92.489,82.033c-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-2.028c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v1.26h-3.054v.768c0,.064.023.119.069.165.046.046.101.069.165.069h2.82v.492h-2.82c-.132,0-.253-.033-.363-.099ZM92.618,80.146h2.556v-.768c0-.064-.023-.119-.069-.165-.046-.046-.101-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M96.008,82.132v-.636l2.994-3.636.042-.048v.624l-2.988,3.636-.048.06Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M74.076,89.236c-.11-.064-.197-.151-.261-.261s-.096-.231-.096-.363v-3.6h.486v3.6c0,.064.023.119.069.165.046.046.101.069.165.069h2.88c.064,0,.119-.023.165-.069.046-.046.069-.101.069-.165v-3.6h.486v3.6c0,.132-.032.253-.096.363s-.151.197-.261.261c-.11.064-.231.096-.363.096h-2.88c-.132,0-.253-.032-.363-.096Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M79.037,89.233c-.11-.066-.197-.154-.261-.264-.064-.11-.096-.231-.096-.363v-3.894h.492v1.14h1.506v.492h-1.506v2.262c0,.064.023.119.069.165s.101.069.165.069h1.272v.492h-1.272c-.136,0-.259-.033-.369-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M81.165,85.204v-.492h.492v.492h-.492ZM81.165,89.332v-3.48h.492v3.48h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M82.775,89.233c-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-3.894h.492v3.894c0,.064.023.119.069.165s.101.069.165.069h.588v.492h-.588c-.132,0-.253-.033-.363-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M84.224,85.204v-.492h.492v.492h-.492ZM84.224,89.332v-3.48h.492v3.48h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M85.835,89.233c-.11-.066-.197-.154-.261-.264-.064-.11-.096-.231-.096-.363v-3.894h.492v1.14h1.506v.492h-1.506v2.262c0,.064.023.119.069.165s.101.069.165.069h1.272v.492h-1.272c-.136,0-.259-.033-.369-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M87.962,85.204v-.492h.492v.492h-.492ZM87.962,89.332v-3.48h.492v3.48h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M89.567,89.233c-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-2.028c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v1.26h-3.054v.768c0,.064.023.119.069.165.046.046.101.069.165.069h2.82v.492h-2.82c-.132,0-.253-.033-.363-.099ZM89.696,87.346h2.556v-.768c0-.064-.023-.119-.069-.165-.046-.046-.101-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M93.701,89.233c-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-.048h.492v.048c0,.064.023.119.069.165.046.046.101.069.165.069h2.088c.064,0,.119-.023.165-.069s.069-.101.069-.165v-.534c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.264-.066-.11-.099-.231-.099-.363v-.534c0-.132.033-.253.099-.363.066-.11.154-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v.048h-.498v-.048c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.046.046-.069.101-.069.165v.534c0,.064.023.119.069.165.046.046.101.069.165.069h2.088c.136,0,.259.033.369.099.11.066.198.154.264.264.066.11.099.231.099.363v.534c0,.132-.033.253-.099.363-.066.11-.154.198-.264.264-.11.066-.233.099-.369.099h-2.088c-.132,0-.253-.033-.363-.099Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M169.605,62.262c-.133,0-.254-.032-.363-.096-.11-.064-.197-.151-.261-.261-.064-.11-.097-.231-.097-.363v-2.88c0-.132.032-.253.097-.363.063-.11.15-.197.261-.261.109-.064.23-.096.363-.096h3.588v.486h-3.588c-.064,0-.119.023-.165.069-.047.046-.069.101-.069.165v2.88c0,.064.022.119.069.165.046.046.101.069.165.069h3.588v.486h-3.588Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M174.15,62.162c-.11-.066-.198-.154-.265-.264-.065-.11-.099-.231-.099-.363v-2.028c0-.132.033-.253.099-.363.066-.11.154-.198.265-.264.109-.066.23-.099.363-.099h2.088c.136,0,.259.033.368.099.11.066.198.154.265.264.065.11.099.231.099.363v2.028c0,.132-.033.253-.099.363-.066.11-.154.198-.265.264-.109.066-.232.099-.368.099h-2.088c-.133,0-.254-.033-.363-.099ZM174.513,61.769h2.088c.063,0,.118-.023.165-.069.046-.046.068-.101.068-.165v-2.028c0-.064-.022-.119-.068-.165-.047-.046-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069-.047.046-.069.101-.069.165v2.028c0,.064.022.119.069.165.046.046.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M177.957,62.262v-3.48h4.596c.136,0,.259.033.369.099s.197.154.261.264c.064.11.097.231.097.363v2.754h-.486v-2.754c0-.064-.024-.119-.072-.165s-.104-.069-.168-.069h-1.446c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498v-2.754c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-1.451c-.064,0-.119.023-.165.069-.047.046-.069.101-.069.165v2.754h-.498Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M183.747,62.262v-3.48h4.596c.136,0,.259.033.369.099s.197.154.261.264c.064.11.097.231.097.363v2.754h-.486v-2.754c0-.064-.024-.119-.072-.165s-.104-.069-.168-.069h-1.446c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-1.452c-.063,0-.119.023-.165.069s-.068.101-.068.165v2.754h-.498Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M190.329,62.262c-.132,0-.253-.033-.363-.099s-.198-.154-.264-.264c-.066-.11-.1-.231-.1-.363v-1.26h3.049v-.768c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.099.109.066.198.154.264.264.066.11.1.231.1.363v2.754h-2.82ZM190.329,61.769h2.322v-1.002h-2.557v.768c0,.064.023.119.069.165s.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M193.688,62.262v-3.48h2.819c.133,0,.253.033.363.099s.198.154.265.264c.065.11.099.231.099.363v2.754h-.492v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.063,0-.12.023-.168.069s-.071.101-.071.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M198.042,62.162c-.11-.066-.198-.154-.264-.264-.066-.11-.1-.231-.1-.363v-2.028c0-.132.033-.253.1-.363.065-.11.153-.198.264-.264s.233-.099.369-.099h2.322v-1.14h.491v4.62h-2.813c-.136,0-.259-.033-.369-.099ZM198.411,61.769h2.088c.063,0,.119-.023.165-.069s.069-.101.069-.165v-2.028c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.028c0,.064.023.119.069.165s.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M174.645,69.462c-.133,0-.254-.032-.363-.096-.11-.064-.197-.151-.261-.261-.064-.11-.097-.231-.097-.363v-2.88c0-.132.032-.253.097-.363.063-.11.15-.197.261-.261.109-.064.23-.096.363-.096h3.588v.486h-3.588c-.064,0-.119.023-.165.069-.047.046-.069.101-.069.165v2.88c0,.064.022.119.069.165.046.046.101.069.165.069h3.588v.486h-3.588Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M179.19,69.363c-.11-.066-.198-.154-.265-.264-.065-.11-.099-.231-.099-.363v-2.028c0-.132.033-.253.099-.363.066-.11.154-.198.265-.264.109-.066.23-.099.363-.099h2.088c.135,0,.258.033.369.099.109.066.197.154.264.264.066.11.098.231.098.363v1.26h-3.053v.768c0,.064.022.119.069.165.046.046.101.069.165.069h2.818v.492h-2.818c-.133,0-.254-.033-.363-.099ZM179.319,67.476h2.555v-.768c0-.064-.021-.119-.068-.165-.045-.046-.102-.069-.164-.069h-2.088c-.064,0-.119.023-.165.069-.047.046-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M182.997,69.462v-3.48h2.819c.133,0,.253.033.363.099s.198.154.265.264c.065.11.099.231.099.363v2.754h-.492v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.063,0-.12.023-.168.069s-.071.101-.071.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M187.523,69.363c-.11-.066-.197-.154-.261-.264-.064-.11-.096-.231-.096-.363v-3.894h.491v1.14h1.507v.492h-1.507v2.262c0,.064.023.119.069.165s.101.069.165.069h1.272v.492h-1.272c-.136,0-.259-.033-.369-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M189.977,69.363c-.11-.066-.198-.154-.264-.264-.066-.11-.1-.231-.1-.363v-2.028c0-.132.033-.253.1-.363.065-.11.153-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.109.066.197.154.264.264.066.11.099.231.099.363v1.26h-3.054v.768c0,.064.023.119.069.165s.101.069.165.069h2.819v.492h-2.819c-.132,0-.253-.033-.363-.099ZM190.106,67.476h2.556v-.768c0-.064-.022-.119-.068-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M193.742,69.462v-2.754c0-.132.033-.253.1-.363.065-.11.153-.198.264-.264s.231-.099.363-.099h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M244.178,95.64v-4.32h.666l1.794,2.136,1.794-2.136h.666v4.32h-.486v-3.768l-1.974,2.346-1.974-2.346v3.768h-.486Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M250.08,95.541c-.11-.066-.198-.154-.264-.264-.066-.11-.1-.231-.1-.363v-2.028c0-.132.033-.253.1-.363.065-.11.153-.198.264-.264s.231-.099.363-.099h2.088c.136,0,.259.033.369.099.109.066.197.154.264.264.066.11.099.231.099.363v1.26h-3.054v.768c0,.064.023.119.069.165s.101.069.165.069h2.819v.492h-2.819c-.132,0-.253-.033-.363-.099ZM250.209,93.655h2.556v-.768c0-.064-.022-.119-.068-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M254.063,95.541c-.11-.066-.198-.154-.264-.264-.066-.11-.1-.231-.1-.363v-2.028c0-.132.033-.253.1-.363.065-.11.153-.198.264-.264s.233-.099.369-.099h2.322v-1.14h.491v4.62h-2.813c-.136,0-.259-.033-.369-.099ZM254.432,95.148h2.088c.063,0,.119-.023.165-.069s.069-.101.069-.165v-2.028c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.028c0,.064.023.119.069.165s.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M257.888,95.64v-4.62h.492v1.14h2.327c.133,0,.253.033.363.099s.198.154.265.264c.065.11.099.231.099.363v2.028c0,.132-.033.253-.099.363-.066.11-.154.198-.265.264s-.23.099-.363.099h-2.819ZM258.62,95.148h2.088c.064,0,.119-.023.165-.069s.069-.101.069-.165v-2.028c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.063,0-.12.023-.168.069s-.071.101-.071.165v2.028c0,.064.023.119.071.165s.104.069.168.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M262.604,95.64c-.132,0-.253-.033-.363-.099s-.198-.154-.264-.264c-.066-.11-.1-.231-.1-.363v-1.26h3.049v-.768c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.099.109.066.198.154.264.264.066.11.1.231.1.363v2.754h-2.82ZM262.604,95.148h2.322v-1.002h-2.557v.768c0,.064.023.119.069.165s.101.069.165.069Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M266.624,97.02v-.498h2.173c.063,0,.118-.023.165-.069.046-.046.068-.101.068-.165v-.648h-2.322c-.132,0-.253-.033-.362-.099-.11-.066-.198-.154-.265-.264-.065-.11-.099-.231-.099-.363v-2.742h.492v2.742c0,.064.022.119.069.165.046.046.101.069.164.069h2.089c.063,0,.118-.023.165-.069.046-.046.068-.101.068-.165v-2.742h.492v4.116c0,.136-.032.259-.096.369-.064.11-.151.198-.262.264-.109.066-.232.099-.368.099h-2.173Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M234.2,166.724v-4.319h3.942v.485h-3.456v1.428h2.778v.492h-2.778v1.914h-.486Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M238.502,166.724v-2.754c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M241.931,166.626c-.11-.066-.198-.154-.264-.265-.066-.109-.1-.23-.1-.362v-2.028c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h2.088c.136,0,.259.033.369.1.109.065.197.154.264.264.066.11.099.231.099.363v1.26h-3.054v.769c0,.063.023.118.069.165.046.046.101.068.165.068h2.819v.492h-2.819c-.132,0-.253-.033-.363-.099ZM242.06,164.738h2.556v-.768c0-.064-.022-.119-.068-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M245.993,166.626c-.11-.066-.198-.154-.264-.265-.066-.109-.1-.23-.1-.362v-2.028c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h2.088c.136,0,.259.033.369.1.109.065.197.154.264.264.066.11.099.231.099.363v1.26h-3.054v.769c0,.063.023.118.069.165.046.046.101.068.165.068h2.819v.492h-2.819c-.132,0-.253-.033-.363-.099ZM246.122,164.738h2.556v-.768c0-.064-.022-.119-.068-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M249.8,166.724v-.672l3.006-2.316h-3.006v-.492h3.546v.673l-3.006,2.315h3.006v.492h-3.546Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M254.183,166.626c-.11-.066-.198-.154-.264-.265-.066-.109-.1-.23-.1-.362v-2.028c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h2.088c.136,0,.259.033.369.1.109.065.197.154.264.264.066.11.099.231.099.363v1.26h-3.054v.769c0,.063.023.118.069.165.046.046.101.068.165.068h2.819v.492h-2.819c-.132,0-.253-.033-.363-.099ZM254.312,164.738h2.556v-.768c0-.064-.022-.119-.068-.165s-.102-.069-.165-.069h-2.088c-.064,0-.119.023-.165.069s-.069.101-.069.165v.768Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M257.948,166.724v-2.754c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M227.297,193.727v-4.314h3.6c.133,0,.253.033.363.1.11.065.197.153.261.261.064.108.097.229.097.36v1.266c0,.132-.032.252-.097.36-.063.107-.15.194-.261.261s-.23.099-.363.099h-3.113v1.608h-.486ZM228.017,191.628h2.88c.064,0,.119-.022.165-.066s.069-.098.069-.162v-1.266c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.88c-.063,0-.119.023-.165.069s-.068.101-.068.165v1.266c0,.064.022.118.068.162s.102.066.165.066Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M232.746,193.727c-.132,0-.253-.033-.363-.099-.11-.066-.198-.154-.264-.265-.066-.109-.1-.23-.1-.362v-1.261h3.049v-.768c0-.064-.023-.119-.069-.165s-.102-.069-.165-.069h-2.814v-.492h2.814c.136,0,.259.033.369.1.109.065.198.154.264.264.066.11.1.231.1.363v2.754h-2.82ZM232.746,193.235h2.322v-1.002h-2.557v.769c0,.063.023.118.069.165.046.046.101.068.165.068Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M236.106,193.727v-3.48h2.819c.133,0,.253.033.363.1.11.065.198.154.265.264.065.11.099.231.099.363v2.754h-.492v-2.754c0-.064-.023-.119-.069-.165s-.101-.069-.165-.069h-2.088c-.063,0-.12.023-.168.069s-.071.101-.071.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M240.632,193.629c-.11-.066-.197-.154-.261-.265-.064-.109-.096-.23-.096-.362v-3.895h.491v1.14h1.507v.492h-1.507v2.263c0,.063.023.118.069.165.046.046.101.068.165.068h1.272v.492h-1.272c-.136,0-.259-.033-.369-.099Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M242.729,193.727v-2.754c0-.132.033-.253.1-.363.065-.109.153-.198.264-.264.11-.066.231-.1.363-.1h1.956v.492h-1.956c-.064,0-.119.023-.165.069s-.069.101-.069.165v2.754h-.492Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M246.382,195.107v-.498h2.173c.063,0,.118-.022.165-.068.046-.047.068-.102.068-.165v-.648h-2.322c-.132,0-.253-.033-.362-.099-.11-.066-.198-.154-.265-.265-.065-.109-.099-.23-.099-.362v-2.742h.492v2.742c0,.063.022.118.069.165.046.046.101.068.164.068h2.089c.063,0,.118-.022.165-.068.046-.047.068-.102.068-.165v-2.742h.492v4.116c0,.136-.032.259-.096.368-.064.11-.151.198-.262.265-.109.065-.232.099-.368.099h-2.173Z"/>
    </g>
    <g>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M182.641,224.527c0-.11.026-.211.08-.303.053-.092.126-.164.218-.217.091-.054.192-.08.302-.08h2.4c.11,0,.211.026.303.08.092.053.164.125.217.217.054.092.08.192.08.303v3h-.404v-1.315h-2.79v1.315h-.405v-3ZM185.837,225.807v-1.28c0-.054-.02-.1-.058-.138-.039-.038-.084-.058-.138-.058h-2.4c-.053,0-.099.02-.137.058-.039.038-.058.084-.058.138v1.28h2.79Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M184.236,233.302v-3.6h.41v3.6h-.41Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M182.659,239.076v-3.595h3c.109,0,.211.027.302.082.092.056.165.128.218.218.054.09.08.189.08.3v1.055c0,.11-.026.21-.08.301-.053.09-.126.162-.218.217-.091.056-.192.083-.302.083h-2.596v1.34h-.404ZM183.258,237.326h2.4c.053,0,.099-.019.138-.055.038-.037.057-.082.057-.136v-1.055c0-.053-.019-.099-.057-.138-.039-.038-.085-.058-.138-.058h-2.4c-.054,0-.099.02-.138.058-.038.039-.058.085-.058.138v1.055c0,.054.02.099.058.136.039.036.084.055.138.055ZM185.699,239.076l-1.176-1.4h.53l1.181,1.396v.005h-.535Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M182.779,244.852v-3.605h.405v3.2h3.194v.405h-3.6Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M183.241,250.626c-.11,0-.211-.026-.303-.08-.092-.053-.164-.126-.218-.218-.053-.091-.08-.192-.08-.302v-2.4c0-.11.027-.211.08-.303.054-.092.126-.164.218-.217.092-.054.192-.08.303-.08h2.399c.11,0,.211.026.303.08.092.053.164.125.218.217s.08.192.08.303v2.4c0,.109-.026.211-.08.302-.054.092-.126.165-.218.218-.092.054-.192.08-.303.08h-2.399ZM183.241,250.221h2.399c.054,0,.1-.019.138-.058.038-.038.058-.084.058-.137v-2.4c0-.054-.02-.1-.058-.138s-.084-.058-.138-.058h-2.399c-.054,0-.1.02-.138.058s-.058.084-.058.138v2.4c0,.053.02.099.058.137.038.039.084.058.138.058Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M183.266,256.402c-.11,0-.211-.026-.303-.08-.092-.053-.164-.126-.217-.218-.054-.091-.08-.192-.08-.302v-2.4c0-.11.026-.211.08-.303.053-.092.125-.164.217-.217.092-.054.192-.08.303-.08h2.99v.404h-2.99c-.054,0-.099.02-.138.058-.038.038-.058.084-.058.138v2.4c0,.053.02.099.058.137.039.039.084.058.138.058h2.99v.405h-2.99Z"/>
      <path class="cls-3" style="fill:#7cff3e!important;opacity:1!important" d="M182.734,262.176v-3.6h.41v1.595h1.16l1.34-1.595h.52v.005l-1.505,1.795,1.51,1.795v.005h-.524l-1.34-1.595h-1.16v1.595h-.41Z"/>
    </g>
  </g>
</svg></div><div class="facility-map-hitboxes" data-facility-map-hitboxes data-loaded="true"><svg id="Room_Hitboxes" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333 318">
  <defs>
    <style>
      .cls-1 {
        fill: #67c18c;
        opacity: .25;
      }
    </style>
  </defs>
  <rect id="room-garage" class="cls-1" x="58.28" y="47.902" width="54" height="72" transform="translate(1.378 169.183) rotate(-90)"/>
  <rect id="room-habitat" class="cls-1" x="49.28" y="182.902" width="72" height="72"/>
  <rect id="room-commissary" class="cls-1" x="139.28" y="146.902" width="72" height="72"/>
  <rect id="room-medbay" class="cls-1" x="229.28" y="57.683" width="55.122" height="71.22"/>
  <path id="room-freezer" class="cls-1" d="M247.28,146.895h0c9.934,0,18,8.066,18,18v18h-36v-18c0-9.934,8.066-18,18-18Z"/>
  <path id="room-pantry" class="cls-1" d="M211.28,182.897h54v3.683c0,7.902-6.415,14.317-14.317,14.317h-39.683v-18h0Z"/>
  <polygon id="room-hallway" class="cls-1" points="229.276 110.9 229.276 128.9 193.276 128.9 193.276 146.9 175.276 146.9 175.276 128.9 121.276 128.9 121.276 164.9 139.276 164.9 139.276 182.9 103.276 182.9 103.276 110.9 229.276 110.9"/>
  <rect id="room-airlock" class="cls-1" x="175.185" y="218.902" width="18" height="54"/>
  <path id="room-command" class="cls-1" d="M216.156,63.47c0,14.33-9.69,26.4-22.88,30.01v17.42h-18v-17.88c-12.39-4.1-21.34-15.78-21.34-29.55,0-17.18,13.93-31.11,31.11-31.11s31.11,13.93,31.11,31.11Z"/>
  <path id="room-armory" class="cls-1" d="M103.28,146.907h-21.38c.16,1.04.25,1.185.25,2.275,0,11.2-9.07,20.28-20.27,20.28s-20.28-9.08-20.28-20.28,9.08-20.28,20.28-20.28h41.4v18.005Z"/>
</svg></div><div class="facility-map-systems" data-facility-map-systems data-loaded="true"><svg id="Web_Elements" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333 318">
  <defs>
    <style>
      .cls-1 {
        fill: #2e3192;
      }
    </style>
    <pattern id="facility-controlled-door-pattern" patternUnits="userSpaceOnUse" width="6" height="6">
      <rect width="6" height="6" style="fill:#031507!important;opacity:1!important"/>
      <path d="M-1 5 L5 -1 M1 7 L7 1" style="fill:none!important;stroke:#7cff3e!important;stroke-width:1.5!important;opacity:1!important"/>
    </pattern>
  </defs>
  <rect id="door-habitat" class="cls-1" x="104.356" y="180.399" width="15.84" height="5.698"/>
  <rect id="door-hall1" class="cls-1" x="131.361" y="171.05" width="15.84" height="5.698" transform="translate(-34.619 313.18) rotate(-90)"/>
  <rect id="door-armory" class="cls-1" x="95.351" y="135.055" width="15.85" height="5.698" transform="translate(-34.629 241.18) rotate(-90)"/>
  <rect id="door-medbay" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="221.356" y="117.051" width="15.84" height="5.698" transform="translate(109.376 349.176) rotate(-90)"/>
  <rect id="door-pantry" class="cls-1" x="203.361" y="189.05" width="15.84" height="5.698" transform="translate(19.381 403.18) rotate(-90)"/>
  <rect id="door-garage" class="cls-1" x="104.356" y="108.05" width="15.84" height="5.698"/>
  <rect id="door-garageext" class="cls-1" x="27.52" y="80.953" width="43.448" height="5.698" transform="translate(-34.559 133.046) rotate(-90)"/>
  <rect id="door-hall2" class="cls-1" x="176.356" y="144.05" width="15.845" height="5.698"/>
  <rect id="door-command" class="cls-1" x="176.356" y="108.053" width="15.845" height="5.698"/>
  <rect id="door-freezer" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="247.28" y="180.048" width="16.915" height="5.698"/>
  <rect id="door-airlockint" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="176.266" y="216.053" width="15.84" height="5.698"/>
  <rect id="door-airlockext" class="cls-1 is-player-controlled" style="fill:#2f7f22 !important;stroke:#7cff3e !important;opacity:.72 !important" x="176.266" y="264.351" width="15.84" height="5.698"/>
</svg></div><div class="facility-map-maintenance${facilityMapMode==='maintenance'?' is-visible':''}" data-facility-map-maintenance data-loaded="true"><svg id="Air_Shafts_Maintenance" data-name="Air Shafts/Maintenance" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333 318">
  <defs>
    <style>
      .cls-1 {
        stroke-dasharray: 1;
      }

      .cls-1, .cls-2, .cls-3, .cls-4 {
        stroke-width: .5px;
      }

      .cls-1, .cls-2, .cls-3, .cls-4, .cls-5 {
        stroke: #a7a9ac;
      }

      .cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6 {
        fill: none;
        stroke-miterlimit: 10;
      }

      .cls-2 {
        stroke-dasharray: 1.004 1.004;
      }

      .cls-4 {
        stroke-dasharray: 1.003 1.003;
      }

      .cls-5 {
        stroke-width: .75px;
      }

      .cls-7 {
        fill: #fff200;
      }

      .cls-6 {
        stroke: #ed1c24;
      }
    </style>
  </defs>
  <g>
    <g>
      <rect class="cls-5" x="55.481" y="44.651" width="14.349" height="13.5" rx="3.743" ry="3.743"/>
      <line class="cls-5" x1="69.821" y1="55.45" x2="55.489" y2="55.45"/>
      <line class="cls-5" x1="69.829" y1="52.75" x2="55.481" y2="52.75"/>
      <line class="cls-5" x1="69.829" y1="50.05" x2="55.481" y2="50.05"/>
      <line class="cls-5" x1="69.821" y1="47.35" x2="55.489" y2="47.35"/>
    </g>
    <g>
      <rect class="cls-5" x="242.065" y="45.428" width="14.349" height="13.5" rx="3.743" ry="3.743"/>
      <line class="cls-5" x1="256.405" y1="56.227" x2="242.073" y2="56.227"/>
      <line class="cls-5" x1="256.413" y1="53.527" x2="242.065" y2="53.527"/>
      <line class="cls-5" x1="256.413" y1="50.827" x2="242.065" y2="50.827"/>
      <line class="cls-5" x1="256.405" y1="48.127" x2="242.073" y2="48.127"/>
    </g>
    <path class="cls-5" d="M67.024,18.038c-4.826,0-8.737,3.912-8.737,8.737h0v17.874h8.738v-14.965c0-1.607,1.302-2.909,2.909-2.909h170.279c2.573,0,4.658,2.085,4.658,4.658v13.995h8.737v-18.653h0c0-4.826-3.912-8.737-8.737-8.737H67.024Z"/>
    <g>
      <line class="cls-3" x1="246.22" y1="44.078" x2="246.22" y2="43.578"/>
      <path class="cls-4" d="M246.22,42.575v-11.142c0-3.313-2.695-6.008-6.008-6.008H69.933c-2.348,0-4.259,1.911-4.259,4.259v12.614"/>
      <line class="cls-3" x1="65.674" y1="42.8" x2="65.674" y2="43.3"/>
    </g>
    <g>
      <line class="cls-3" x1="59.636" y1="43.3" x2="59.636" y2="42.8"/>
      <path class="cls-2" d="M59.636,41.796v-15.021c0-4.073,3.314-7.388,7.388-7.388h177.847c4.074,0,7.388,3.314,7.388,7.388v16.301"/>
      <line class="cls-3" x1="252.258" y1="43.578" x2="252.258" y2="44.078"/>
    </g>
  </g>
  <g>
    <g>
      <rect class="cls-5" x="240.296" y="134.836" width="14.349" height="13.5" rx="3.743" ry="3.743"/>
      <line class="cls-5" x1="254.637" y1="145.635" x2="240.304" y2="145.635"/>
      <line class="cls-5" x1="254.644" y1="142.935" x2="240.297" y2="142.935"/>
      <line class="cls-5" x1="254.644" y1="140.235" x2="240.297" y2="140.235"/>
      <line class="cls-5" x1="254.637" y1="137.535" x2="240.304" y2="137.535"/>
    </g>
    <g>
      <rect class="cls-5" x="280.915" y="102.757" width="14.349" height="13.5" rx="3.743" ry="3.743"/>
      <line class="cls-5" x1="295.255" y1="113.556" x2="280.923" y2="113.556"/>
      <line class="cls-5" x1="295.263" y1="110.856" x2="280.915" y2="110.856"/>
      <line class="cls-5" x1="295.263" y1="108.156" x2="280.915" y2="108.156"/>
      <line class="cls-5" x1="295.255" y1="105.456" x2="280.923" y2="105.456"/>
    </g>
    <path class="cls-5" d="M305.988,105.137h-10.726v8.737h6.538c2.313,0,4.188,1.875,4.188,4.188v14.966c0,2.313-1.875,4.188-4.188,4.188h-47.15v8.737h51.338c4.826,0,8.737-3.912,8.737-8.737h0v-23.343c0-4.826-3.912-8.737-8.737-8.737h0Z"/>
    <path class="cls-1" d="M256,138.567h45.8c3.053,0,5.538-2.484,5.538-5.538v-14.966c0-3.054-2.484-5.538-5.538-5.538h-5.188"/>
    <path class="cls-1" d="M296.611,106.487h9.376c4.074,0,7.388,3.314,7.388,7.388v23.343c0,4.074-3.314,7.388-7.388,7.388h-49.988"/>
  </g>
  <rect class="cls-6" x="107.037" y="60.767" width="10.477" height="22.009" rx="3.743" ry="3.743"/>
  <polygon class="cls-7" points="111.561 66.138 114.613 66.138 112.927 70.251 114.805 70.251 110.195 77.406 112.116 71.687 109.747 71.687 111.561 66.138"/>
</svg></div><div class="facility-map-alerts" data-facility-map-alerts><svg viewBox="0 0 333 318" aria-hidden="true"><g id="alert-vibration" class="facility-sensor-alert facility-sensor-alert--warning" data-icon-key="vibration"><circle cx="0" cy="0" r="4"></circle><circle cx="0" cy="0" r="9"></circle><path d="M-11 0h22"></path></g><g id="alert-weather" class="facility-sensor-alert facility-sensor-alert--advisory" data-icon-key="weather"><path d="M-7 8L0-4 7 8z"></path><path d="M0 0v-8"></path></g></svg></div></div><div class="facility-map-crt" aria-hidden="true"></div><div class="facility-map-nav-status" data-map-nav-status>${facilityMapStatus}</div><div class="facility-map-controls"><button type="button" data-map-zoom="in">+</button><button type="button" data-map-zoom="out">−</button><button type="button" data-map-reset>RESET</button>${showFacilityDev?'<button type="button" data-map-icon-dev>ICON DEV</button>':''}</div>${showFacilityDev?`<section class="facility-icon-dev${facilityIconDevOpen?' is-open':''}" data-map-icon-dev-panel><header><strong>ALERT ICON POSITION</strong><button type="button" data-map-icon-dev-close>×</button></header><label>ICON<select data-icon-select><option value="vibration">STRUCTURAL IMPACT</option><option value="weather">WEATHER ADVISORY</option></select></label><label>X <input type="number" min="0" max="333" step="0.1" inputmode="decimal" data-icon-x></label><label>Y <input type="number" min="0" max="318" step="0.1" inputmode="decimal" data-icon-y></label><button type="button" data-icon-reset>RESET ICON</button></section>`:''}<span class="facility-map-instruction">DRAG TO PAN // PINCH TO ZOOM // TAP ROOM OR SYSTEM FOR DATA</span></section>
        <aside class="facility-map-sidebar" aria-label="Facility fault inspector"><section class="facility-fault-panel"><header><h3>ACTIVE FACILITY FAULTS <b>${String(facilityFaults.length).padStart(2,'0')}</b></h3></header><div class="facility-fault-scroll" role="region" aria-label="Active facility faults" tabindex="0">${renderFacilityFaultRows()}</div></section><section class="facility-room-info" data-facility-room-info aria-label="Selected facility diagnostic" tabindex="0">${renderFacilityDiagnostic()}</section></aside></div>
      ${facilityOverlay==='maintenance-lock'?renderMaintenanceLock():facilityOverlay==='maintenance-hack'?renderFacilityHack('maintenance'):''}
    </div>`;
  }

  function renderMaintenanceLock(){
    return `<div class="facility-overlay" data-facility-overlay><section class="facility-access-lock" role="dialog" aria-modal="true" aria-labelledby="maintenance-lock-title"><button type="button" data-facility-overlay-close>× CLOSE</button><small>FACILITY SERVICE OVERLAY</small><h3 id="maintenance-lock-title">MAINTENANCE AUTHORIZATION REQUIRED</h3><dl><div><dt>ACCESS CLASS</dt><dd>TECHNICAL OPERATIONS</dd></div><div><dt>AUTHORIZED ROLE</dt><dd>FACILITY MECHANIC</dd></div></dl><label>ENTER MAINTENANCE CODE<input id="maintenance-access-code" type="password" inputmode="numeric" maxlength="5" autocomplete="off"></label><button type="button" data-maintenance-submit>VERIFY</button><p data-maintenance-error role="alert"></p><button type="button" class="directive-security-mark facility-security-mark" data-facility-hack="maintenance" aria-label="Ellison-Tanaka corporate seal"><img src="assets/img/ellison-tanaka-logo.svg" alt=""></button></section></div>`;
  }

  function renderVehicleLog(){
    const record=facilityVehicleLogs.find(item=>item.id===facilitySelectedVehicle)||facilityVehicleLogs[3];
    return `<div class="facility-management facility-record-browser facility-record-browser--vehicles"><header class="facility-page-header"><div><small>ELECTRIC SURFACE FLEET</small><h3>VEHICLE INVENTORY &amp; DISPATCH LOG</h3></div><strong>LOCAL VEHICLE BUS // DEGRADED</strong></header><section class="facility-fleet-strip"><div><small>APC-01</small><strong>DEPLOYED</strong><span>LAST DESTINATION // HERON</span></div><div><small>APC-02</small><strong>GARAGE</strong><span>BATTERY RECOVERY // OPEN</span></div><div><small>ATV GROUP</small><strong>DEPLOYED</strong><span>MILITARY ESCORT</span></div></section><div class="facility-record-workspace"><section class="facility-record-index"><h4>DISPATCH HISTORY</h4>${facilityVehicleLogs.map(item=>`<button type="button" data-vehicle-record="${item.id}" class="${item.id===record.id?'is-selected':''}"><span>${item.date}</span><strong>${item.title}</strong><em>${item.status}</em></button>`).join('')}</section><article class="facility-record-detail"><header><small>VEHICLE OPERATIONS RECORD</small><h3>${record.title}</h3><strong>${record.status}</strong></header><dl>${record.fields.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl><p>${record.body}</p></article></div></div>`;
  }

  function renderWorkOrders(){
    const record=facilityWorkOrders.find(item=>item.id===facilitySelectedWorkOrder)||facilityWorkOrders.at(-1);
    const detail=record.archived?`<article class="facility-record-detail facility-record-detail--archived"><header><small>WORK ORDER SUMMARY</small><h3>${record.title}</h3><strong>${record.status}</strong></header><dl><div><dt>CATEGORY</dt><dd>ROUTINE FACILITY MAINTENANCE</dd></div><div><dt>SERVICE RESULT</dt><dd>COMPLETED</dd></div><div><dt>DETAIL RECORD</dt><dd>ARCHIVED</dd></div></dl><p>Routine service details and technician attachments were removed under the facility maintenance retention policy.</p><footer>NO ACTIVE ACTION REQUIRED</footer></article>`:`<article class="facility-record-detail"><header><small>FACILITY WORK ORDER</small><h3>${record.title}</h3><strong>${record.status}</strong></header><dl>${record.fields.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl><p>${record.body}</p>${record.resolution?`<div class="facility-resolution">${record.resolution.map(line=>`<span>${line}</span>`).join('')}</div>`:''}</article>`;
    return `<div class="facility-management facility-record-browser facility-record-browser--workorders"><header class="facility-page-header"><div><small>FACILITY MAINTENANCE REQUESTS</small><h3>WORK ORDER ARCHIVE</h3></div><strong>07 RETAINED RECORDS</strong></header><div class="facility-record-workspace"><section class="facility-record-index"><h4>ORDER HISTORY</h4>${facilityWorkOrders.map(item=>`<button type="button" data-work-order="${item.id}" class="${item.id===record.id?'is-selected':''}"><span>${item.date}</span><strong>${item.title}</strong><em>${item.status}</em></button>`).join('')}</section>${detail}</div></div>`;
  }

  function renderHeronTelemetry(){
    return `<div class="facility-overlay" data-facility-overlay><article class="facility-heron-modal" role="dialog" aria-modal="true" aria-labelledby="heron-telemetry-title"><header><div><small>PASSIVE DISTRESS-CARRIER TELEMETRY</small><h3 id="heron-telemetry-title">HERON STATION</h3></div><button type="button" data-facility-overlay-close>× CLOSE</button></header><section class="facility-handshake"><div><small>CONNECTION MODE</small><strong>PASSIVE TELEMETRY ONLY</strong></div><div><small>AUTHENTICATED HANDSHAKE</small><strong>UNAVAILABLE</strong></div><div><small>CONTROL LINK</small><strong>NOT ESTABLISHED</strong></div></section><p>Only automated carrier telemetry is available. Facility controls and internal records cannot be accessed from Horizon Base.</p>${renderFacilityCondition('heron')}<button type="button" class="facility-heron-advisory" data-heron-reactor><small>ACTIVE FACILITY ADVISORY // 01</small><strong>REACTOR COOLING PERFORMANCE DEGRADED</strong><span>TOUCH FOR TELEMETRY REPORT →</span></button><footer><span>NEXT CARRIER PACKET // <b data-facility-heron-countdown>00:30</b></span><strong>RESPONSE CHANNEL // UNAVAILABLE</strong></footer></article></div>`;
  }

  function renderHeronReactor(){
    return `<div class="facility-overlay" data-facility-overlay><article class="facility-heron-reactor" role="dialog" aria-modal="true" aria-labelledby="heron-reactor-title"><header><div><small>HERON STATION // AUTOMATED ADVISORY</small><h3 id="heron-reactor-title">REACTOR THERMAL ADVISORY</h3></div><button type="button" data-facility-overlay-close>× CLOSE</button></header><dl><div><dt>STATUS</dt><dd>ACTIVE</dd></div><div><dt>COOLING-WATER INTAKE EFFICIENCY LOSS</dt><dd>18%</dd></div><div><dt>CAUSE</dt><dd>ELEVATED SEDIMENT LOAD // STORM RUNOFF</dd></div><div><dt>AUXILIARY COOLING LOOP</dt><dd>STANDBY</dd></div><div><dt>REMOTE SHUTDOWN AUTHORITY</dt><dd>LOCAL CONTROL ONLY</dd></div><div><dt>ENGINEERING RESPONSE</dt><dd>REQUESTED</dd></div><div><dt>ACKNOWLEDGEMENT</dt><dd>NOT RECEIVED</dd></div></dl><footer><span>RECEIVED VIA AUTOMATED DISTRESS CARRIER</span><strong>RESPONSE CHANNEL // UNAVAILABLE</strong></footer></article></div>`;
  }

  function renderFacilityHack(target){
    const label=target==='maintenance'?'MAINTENANCE SCHEMATIC ACCESS':'PERSONNEL BIOSIGNAL ACCESS';
    return `<div class="facility-overlay facility-hack-overlay" data-facility-overlay><div class="directive-hack-screen facility-hack-screen" role="status" aria-live="polite"><header><small>LOCAL SECURITY INTERFACE</small><h3>UNAUTHORIZED ACCESS ATTEMPT DETECTED</h3><p>${label}</p></header><div class="directive-hack-lines"><p style="--hack-delay:.25s"><span>LOCAL SECURITY LAYER</span><strong>BYPASSED</strong></p><p style="--hack-delay:1.05s"><span>AUTHORIZATION HASH</span><strong>COLLISION FOUND</strong></p><p style="--hack-delay:1.85s"><span>ACCESS CONTROL LOOP</span><strong>DIVERTED</strong></p><p style="--hack-delay:2.65s"><span>MANUAL OVERRIDE</span><strong>ACCEPTED</strong></p></div><div class="directive-hack-progress"><i></i></div><footer><strong>ACCESS EVENT LOGGED</strong><span>USER IDENTIFICATION // UNAVAILABLE</span></footer></div></div>`;
  }

  function loadFacilityFonts(){try{return {...facilityFontDefaults,...JSON.parse(localStorage.getItem(FACILITY_FONT_KEY)||'{}')}}catch{return {...facilityFontDefaults}}}
  function saveFacilityFonts(settings){localStorage.setItem(FACILITY_FONT_KEY,JSON.stringify(settings));}
  function applyFacilityFonts(root,settings){
    const vars={overallScale:['--facility-overall-scale',settings.overallScale/100],comparisonPrompt:['--facility-comparison-prompt',settings.comparisonPrompt+'px'],stationHeading:['--facility-station-heading',settings.stationHeading+'px'],stationData:['--facility-station-data',settings.stationData+'px'],stationBody:['--facility-station-body',settings.stationBody+'px'],stationButton:['--facility-station-button',settings.stationButton+'px'],telemetryLabels:['--facility-telemetry-labels',settings.telemetryLabels+'px'],telemetryValues:['--facility-telemetry-values',settings.telemetryValues+'px'],pageHeading:['--facility-page-heading',settings.pageHeading+'px'],moduleTitles:['--facility-module-titles',settings.moduleTitles+'px'],moduleMeta:['--facility-module-meta',settings.moduleMeta+'px'],personnelNames:['--facility-personnel-names',settings.personnelNames+'px'],personnelRoles:['--facility-personnel-roles',settings.personnelRoles+'px'],biosignalNames:['--facility-biosignal-names',settings.biosignalNames+'px'],biosignalState:['--facility-biosignal-state',settings.biosignalState+'px'],biosignalDetail:['--facility-biosignal-detail',settings.biosignalDetail+'px'],recordTitles:['--facility-record-titles',settings.recordTitles+'px'],recordBody:['--facility-record-body',settings.recordBody+'px'],vehicleStatus:['--facility-vehicle-status',settings.vehicleStatus+'px'],roomLabels:['--facility-room-labels',settings.roomLabels+'px']};
    Object.values(vars).forEach(([name,value])=>root.style.setProperty(name,value));
  }
  function renderFacilityTypographyTool(){
    const controls=[['overallScale','OVERALL SCALE',75,140,1,'%'],['comparisonPrompt','SELECTION PROMPT',10,28,1,'px'],['stationHeading','STATION HEADINGS',16,42,1,'px'],['stationData','STATION VALUES',10,28,1,'px'],['stationBody','ASSESSMENT COPY',11,26,1,'px'],['stationButton','STATION BUTTONS',10,26,1,'px'],['telemetryLabels','TELEMETRY LABELS',7,18,1,'px'],['telemetryValues','TELEMETRY VALUES',12,34,1,'px'],['pageHeading','PAGE HEADINGS',16,38,1,'px'],['moduleTitles','MODULE TITLES',16,42,1,'px'],['moduleMeta','MODULE META',8,22,1,'px'],['personnelNames','ROSTER NAMES',9,22,1,'px'],['personnelRoles','ROSTER ROLES',8,18,1,'px'],['biosignalNames','BIOSIGNAL NAMES',9,22,1,'px'],['biosignalState','BIOSIGNAL STATE',8,20,1,'px'],['biosignalDetail','BIOSIGNAL DETAIL',8,18,1,'px'],['recordTitles','RECORD LIST TITLES',9,24,1,'px'],['recordBody','RECORD BODY',11,28,1,'px'],['vehicleStatus','VEHICLE STATUS',12,30,1,'px'],['roomLabels','ROOM LABELS',9,24,1,'px']];
    return `<button type="button" class="facility-dev-toggle" data-facility-font-toggle>DEV // TYPOGRAPHY</button><aside class="facility-dev-panel" data-facility-font-panel hidden><header><div><small>WARDEN DEVELOPMENT TOOL</small><strong>FACILITY TYPOGRAPHY</strong></div><button type="button" data-facility-font-toggle>×</button></header><div class="facility-dev-controls">${controls.map(([key,label,min,max,step,unit])=>`<label>${label}<output data-facility-font-out="${key}"></output><input type="range" min="${min}" max="${max}" step="${step}" data-facility-font="${key}" data-unit="${unit}"></label>`).join('')}</div><footer><button type="button" data-facility-font-reset>RESET</button><button type="button" data-facility-font-copy>COPY SETTINGS</button><span data-facility-font-status>Changes save locally.</span></footer></aside>`;
  }

  function renderFacilityOverlay(){
    if(facilityOverlay==='heron')return renderHeronTelemetry();
    if(facilityOverlay==='heron-reactor')return renderHeronReactor();
    return '';
  }

  function renderFacilityManagement(){
    let content=renderFacilityComparison();
    if(facilityView==='horizon')content=renderHorizonFacility();
    else if(facilityView==='personnel')content=renderPersonnelDirectory();
    else if(facilityView==='biosignals')content=renderBiosignalMonitor();
    else if(facilityView==='map')content=renderFacilityMap();
    else if(facilityView==='vehicles')content=renderVehicleLog();
    else if(facilityView==='workorders')content=renderWorkOrders();
    return `<div class="facility-management-host">${content}${renderFacilityTypographyTool()}</div>`;
  }

  function stopFacilityManagement(){
    if(facilityAnimationFrame!==null)cancelAnimationFrame(facilityAnimationFrame);
    facilityAnimationFrame=null;
  }

  function chooseFacilityTarget(site){
    Object.entries(facilityRanges[site]).forEach(([key,[min,max]])=>{facilityTargets[site][key]=min+Math.random()*(max-min);});
  }

  function advanceFacilityBeacon(now){
    if(beaconTransmittingUntil&&now>=beaconTransmittingUntil){beaconTransmittingUntil=0;beaconNextTransmission=now+BEACON_INTERVAL_MS;}
    if(!beaconTransmittingUntil&&now>=beaconNextTransmission){beaconRetransmissions+=1;beaconTransmittingUntil=now+BEACON_TRANSMIT_MS;chooseFacilityTarget('heron');}
  }

  function updateFacilityTelemetry(root,now){
    if(now>=facilityLocalTargetAt){chooseFacilityTarget('horizon');facilityLocalTargetAt=now+3500+Math.random()*2500;}
    advanceFacilityBeacon(Date.now());
    if(facilityHeronPacket!==beaconRetransmissions){const previousPacket=facilityHeronPacket;facilityHeronPacket=beaconRetransmissions;chooseFacilityTarget('heron');if(previousPacket>=0)playAudio('dataPacket');}
    ['horizon','heron'].forEach(site=>Object.keys(facilityValues[site]).forEach(key=>{
      facilityValues[site][key]+=(facilityTargets[site][key]-facilityValues[site][key])*(site==='horizon'?.015:.06);
      const value=facilityValues[site][key];
      root.querySelectorAll(`[data-facility-metric="${site}-${key}"]`).forEach(el=>el.textContent=`${value.toFixed(1)}%`);
      root.querySelectorAll(`[data-facility-bar="${site}-${key}"]`).forEach(el=>el.style.width=`${value}%`);
    }));
    const remaining=beaconTransmittingUntil>Date.now()?0:Math.max(0,beaconNextTransmission-Date.now());
    root.querySelectorAll('[data-facility-heron-countdown]').forEach(el=>el.textContent=beaconTransmittingUntil>Date.now()?'TRANSMITTING…':`00:${String(Math.ceil(remaining/1000)).padStart(2,'0')}`);
    const current=new Date().toLocaleTimeString('en-US',{hour12:false});
    root.querySelectorAll('[data-biosignal-current]').forEach(el=>el.textContent=`UPDATE // ${current}`);
    facilityAnimationFrame=requestAnimationFrame(time=>updateFacilityTelemetry(root,time));
  }

  async function loadFacilitySvgLayer(container,url){
    if(!container||container.dataset.loaded==='true')return;
    try{const response=await fetch(url);if(!response.ok)throw new Error(String(response.status));const source=await response.text();container.innerHTML=source.replace(/<\?xml[\s\S]*?\?>/i,'');container.dataset.loaded='true';}
    catch(error){container.innerHTML='<span class="facility-map-load-error">OVERLAY UNAVAILABLE</span>';console.warn('Facility map layer unavailable:',url,error);}
  }

  function updateFacilityDiagnostic(root){const panel=root.querySelector('[data-facility-room-info]');if(panel){panel.innerHTML=renderFacilityDiagnostic();panel.scrollTop=0;}root.querySelectorAll('.facility-fault-row').forEach(el=>{const selected=el.dataset.facilityTarget===facilitySelectedTarget;el.classList.toggle('is-selected',selected);el.setAttribute('aria-pressed',String(selected));});}

  function updateFacilityRoomSelection(root,id){
    if(!facilityRooms[id])return;
    facilitySelectedRoom=id;facilitySelectedTarget=id;
    updateFacilityDiagnostic(root);
  }

  async function initFacilityMap(root){
    const hitboxes=root.querySelector('[data-facility-map-hitboxes]'),systems=root.querySelector('[data-facility-map-systems]'),maintenance=root.querySelector('[data-facility-map-maintenance]'),alerts=root.querySelector('[data-facility-map-alerts]');
    await Promise.allSettled([loadFacilitySvgLayer(hitboxes,'assets/img/command/horizon-map/horizon-room-hitboxes.svg'),loadFacilitySvgLayer(systems,'assets/img/command/horizon-map/horizon-system-elements.svg'),loadFacilitySvgLayer(maintenance,'assets/img/command/horizon-map/horizon-maintenance.svg')]);
    const viewport=root.querySelector('[data-facility-map-viewport]'),transform=root.querySelector('[data-facility-map-transform]');if(!viewport||!transform)return;
    root.querySelectorAll('.facility-map-floorplan #Labels .cls-3,.facility-map-floorplan #Labels path').forEach(label=>{label.style.setProperty('fill','#7cff3e','important');label.style.setProperty('opacity','1','important');});
    systems.querySelectorAll('[id^="door-"]').forEach(el=>el.classList.add('facility-system-target'));
    const systemsSvg=systems.querySelector('svg');
    if(systemsSvg){
      let defs=systemsSvg.querySelector('defs');
      if(!defs){defs=document.createElementNS('http://www.w3.org/2000/svg','defs');systemsSvg.prepend(defs);}
      if(!systemsSvg.querySelector('#facility-controlled-door-pattern')){
        const pattern=document.createElementNS('http://www.w3.org/2000/svg','pattern');
        pattern.id='facility-controlled-door-pattern';
        pattern.setAttribute('patternUnits','userSpaceOnUse');
        pattern.setAttribute('width','5');
        pattern.setAttribute('height','5');
        pattern.setAttribute('patternTransform','rotate(45)');
        pattern.innerHTML='<rect width="5" height="5" fill="#031507"></rect><rect width="2.1" height="5" fill="#7cff3e"></rect>';
        defs.append(pattern);
      }
      ['door-medbay','door-freezer','door-airlockint','door-airlockext'].forEach(id=>{
        const door=systemsSvg.querySelector('#'+id);if(!door)return;
        door.classList.add('is-player-controlled');
        door.setAttribute('fill','#2f7f22');
        door.style.setProperty('fill','#2f7f22','important');
        door.style.setProperty('opacity','.72','important');
        const tabId=id+'-control-tab';
        if(!systemsSvg.querySelector('#'+tabId)){
          const box=door.getBBox();
          const tab=document.createElementNS('http://www.w3.org/2000/svg','rect');
          tab.id=tabId;
          tab.classList.add('facility-control-tab');
          const tabW=Math.max(2.0,Math.min(2.8,box.width*.16));
          const tabH=1.45;
          tab.setAttribute('x',String(box.x+(box.width-tabW)/2));
          tab.setAttribute('y',String(box.y-tabH));
          tab.setAttribute('width',String(tabW));
          tab.setAttribute('height',String(tabH));
          tab.setAttribute('rx','.45');
          const transformValue=door.getAttribute('transform');
          if(transformValue)tab.setAttribute('transform',transformValue);
          door.parentNode.insertBefore(tab,door.nextSibling);
        }
      });
    }
    const applyIconLayout=()=>{alerts.querySelectorAll('[data-icon-key]').forEach(el=>{const pos=facilityIconLayout[el.dataset.iconKey];if(pos)el.setAttribute('transform',`translate(${pos.x} ${pos.y}) scale(.75)`);});};
    applyIconLayout();
    let view={x:0,y:0,scale:1},animation=null;const pointers=new Map();let moved=false,lastDistance=0;
    const clampView=()=>{const vr=viewport.getBoundingClientRect();view.scale=Math.max(1,Math.min(4.25,view.scale));const minX=vr.width-(vr.width*view.scale),minY=vr.height-(vr.height*view.scale);view.x=Math.min(0,Math.max(minX,view.x));view.y=Math.min(0,Math.max(minY,view.y));};
    const apply=(animate=false)=>{clampView();transform.style.transition=animate?'transform 1.2s cubic-bezier(.22,.61,.36,1)':'none';transform.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.scale})`;};
    const cancelAuto=()=>{if(animation){clearTimeout(animation);animation=null;}transform.style.transition='none';const n=root.querySelector('[data-map-nav-status]');if(n)n.textContent='';};
    const layerFor=t=>t.layer==='systems'?systems:t.layer==='alerts'?alerts:hitboxes;
    const selectTarget=(id,animate=true)=>{const target=facilityTargetsMap[id];if(!target)return;facilitySelectedTarget=id;if(facilityRooms[id])facilitySelectedRoom=id;root.querySelectorAll('.facility-map-hitboxes [id^="room-"],.facility-map-systems [id^="door-"],.facility-map-alerts [id^="alert-"]').forEach(el=>el.classList.remove('is-selected'));const el=layerFor(target)?.querySelector(`#${target.svgId}`);if(!el)return;el.classList.add('is-selected');updateFacilityDiagnostic(root);if(!animate)return;playAudio('uiSelect');cancelAuto();const vr=viewport.getBoundingClientRect();const svg=el.ownerSVGElement;const vb=svg.viewBox.baseVal;const fit=Math.min(vr.width/vb.width,vr.height/vb.height);const offsetX=(vr.width-vb.width*fit)/2;const offsetY=(vr.height-vb.height*fit)/2;let svgCx,svgCy;if(target.layer==='alerts'){const key=el.dataset.iconKey;const pos=facilityIconLayout[key];svgCx=pos?.x??0;svgCy=pos?.y??0;}else{const box=el.getBBox();const localPoint=svg.createSVGPoint();localPoint.x=box.x+box.width/2;localPoint.y=box.y+box.height/2;const elementMatrix=el.getCTM();const svgMatrix=svg.getCTM();if(elementMatrix&&svgMatrix){const rootMatrix=svgMatrix.inverse().multiply(elementMatrix);const mapped=localPoint.matrixTransform(rootMatrix);svgCx=mapped.x;svgCy=mapped.y;}else{svgCx=localPoint.x;svgCy=localPoint.y;}}const cx=offsetX+(svgCx-vb.x)*fit;const cy=offsetY+(svgCy-vb.y)*fit;const desired=target.kind==='door'?4.0:target.kind==='sensor'?3.0:2.05;view.scale=desired;view.x=vr.width/2-cx*desired;view.y=vr.height/2-cy*desired;const n=root.querySelector('[data-map-nav-status]');if(n)n.textContent='AUTO NAVIGATION';apply(true);animation=setTimeout(()=>{animation=null;if(n)n.textContent='TARGET ACQUIRED';setTimeout(()=>{if(n&&n.textContent==='TARGET ACQUIRED')n.textContent='';},900);},1200);};
    const zoom=amount=>{cancelAuto();view.scale*=amount;apply();};
    viewport.addEventListener('pointerdown',event=>{if(event.target.closest('.facility-map-controls'))return;cancelAuto();pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,target:event.target});moved=false;if(pointers.size===2){const pts=[...pointers.values()];lastDistance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);}});
    viewport.addEventListener('pointermove',event=>{const point=pointers.get(event.pointerId);if(!point)return;const oldX=point.x,oldY=point.y;point.x=event.clientX;point.y=event.clientY;if(Math.hypot(point.x-point.startX,point.y-point.startY)>8){moved=true;if(!viewport.hasPointerCapture(event.pointerId))viewport.setPointerCapture(event.pointerId);}if(pointers.size===1){view.x+=point.x-oldX;view.y+=point.y-oldY;apply();}else if(pointers.size===2){const pts=[...pointers.values()];const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(lastDistance>0)view.scale*=distance/lastDistance;lastDistance=distance;apply();}});
    const targetAt=(clientX,clientY)=>{const direct=document.elementFromPoint(clientX,clientY)?.closest?.('[id^="door-"],[id^="alert-"]');if(direct){const match=Object.entries(facilityTargetsMap).find(([,v])=>v.svgId===direct.id);if(match)return match[0];}const svg=hitboxes.querySelector('svg'),matrix=svg?.getScreenCTM?.();if(!svg||!matrix)return null;const point=svg.createSVGPoint();point.x=clientX;point.y=clientY;const local=point.matrixTransform(matrix.inverse());const room=[...svg.querySelectorAll('[id^="room-"]')].find(item=>item.id!=='room-hallway'&&item.isPointInFill?.(local));return room?.id?.replace('room-','')||null;};
    const finish=event=>{const point=pointers.get(event.pointerId);pointers.delete(event.pointerId);lastDistance=0;if(point&&!moved){const id=targetAt(event.clientX,event.clientY);if(id)selectTarget(id,true);}};
    viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);lastDistance=0;});viewport.addEventListener('wheel',event=>{event.preventDefault();zoom(event.deltaY<0?1.15:.87);},{passive:false});
    root.querySelector('[data-map-zoom="in"]')?.addEventListener('click',()=>zoom(1.25));root.querySelector('[data-map-zoom="out"]')?.addEventListener('click',()=>zoom(.8));root.querySelector('[data-map-reset]')?.addEventListener('click',()=>{cancelAuto();view={x:0,y:0,scale:1};apply();});
    const devPanel=root.querySelector('[data-map-icon-dev-panel]'),iconSelect=root.querySelector('[data-icon-select]'),iconX=root.querySelector('[data-icon-x]'),iconY=root.querySelector('[data-icon-y]');
    const syncIconDev=()=>{const key=iconSelect?.value||'vibration',pos=facilityIconLayout[key];if(!pos)return;if(iconX)iconX.value=pos.x;if(iconY)iconY.value=pos.y;};
    root.querySelector('[data-map-icon-dev]')?.addEventListener('click',()=>{facilityIconDevOpen=true;devPanel?.classList.add('is-open');syncIconDev();});
    root.querySelector('[data-map-icon-dev-close]')?.addEventListener('click',()=>{facilityIconDevOpen=false;devPanel?.classList.remove('is-open');});
    iconSelect?.addEventListener('change',syncIconDev);
    const updateIconAxis=(axis,input)=>{if(!input)return;const value=Number(input.value);if(!Number.isFinite(value))return;const key=iconSelect.value;facilityIconLayout[key][axis]=value;applyIconLayout();saveFacilityIconLayout();};
    iconX?.addEventListener('change',()=>updateIconAxis('x',iconX));iconY?.addEventListener('change',()=>updateIconAxis('y',iconY));iconX?.addEventListener('keydown',event=>{if(event.key==='Enter')updateIconAxis('x',iconX);});iconY?.addEventListener('keydown',event=>{if(event.key==='Enter')updateIconAxis('y',iconY);});
    root.querySelector('[data-icon-reset]')?.addEventListener('click',()=>{const key=iconSelect.value;facilityIconLayout[key]={...facilityIconDefaults[key]};applyIconLayout();saveFacilityIconLayout();syncIconDev();});
    syncIconDev();
    root.addEventListener('click',event=>{const targetButton=event.target.closest('[data-facility-target]');if(targetButton){selectTarget(targetButton.dataset.facilityTarget,true);return;}if(event.target.closest('[data-medbay-unlock]')){const input=root.querySelector('[data-medbay-password]'),result=root.querySelector('[data-medbay-result]');if(input?.value===DIRECTIVE_ACCESS_CODE){playAudio('confirm');playAudio('mechanicalActuation',{delay:.18});facilitySystemState.medbayUnlocked=true;saveFacilitySystemState();updateFacilityDiagnostic(root);systems.querySelector('#door-medbay')?.classList.add('is-unlocked');}else{playAudio('reject');if(result)result.textContent='CREDENTIALS REJECTED // ACCESS ATTEMPT LOGGED';}return;}if(event.target.closest('[data-medbay-toggle]')){playAudio('mechanicalActuation');playAudio('confirm',{delay:.38});facilitySystemState.medbayOpen=!facilitySystemState.medbayOpen;saveFacilitySystemState();updateFacilityDiagnostic(root);systems.querySelector('#door-medbay')?.classList.toggle('is-open',facilitySystemState.medbayOpen);return;}if(event.target.closest('[data-freezer-unlock]')){playAudio('mechanicalActuation');playAudio('confirm',{delay:.38});facilitySystemState.freezerUnlocked=true;saveFacilitySystemState();updateFacilityDiagnostic(root);systems.querySelector('#door-freezer')?.classList.add('is-unlocked');return;}if(event.target.closest('[data-freezer-toggle]')){playAudio('mechanicalActuation');playAudio('confirm',{delay:.38});facilitySystemState.freezerOpen=!facilitySystemState.freezerOpen;saveFacilitySystemState();updateFacilityDiagnostic(root);systems.querySelector('#door-freezer')?.classList.toggle('is-open',facilitySystemState.freezerOpen);return;}if(event.target.closest('[data-garage-open]')){playAudio('process');const result=root.querySelector('[data-garage-result]');if(result){result.textContent='COMMAND TRANSMITTED...';setTimeout(()=>{result.textContent='ACTUATOR LOAD EXCEEDED // COMMAND FAILED';playAudio('hardwareFault');},900);}return;}if(event.target.closest('[data-airlock-cycle]')){playAudio('process');const result=root.querySelector('[data-airlock-result]');if(facilitySystemState.airlockOuterOpen){if(result)result.textContent='CLOSING EXTERIOR HATCH...';playAudio('mechanicalActuation',{delay:.55});playAudio('confirm',{delay:.88});setTimeout(()=>{facilitySystemState.airlockOuterOpen=false;saveFacilitySystemState();systems.querySelector('#door-airlockext')?.classList.remove('is-open');updateFacilityDiagnostic(root);},900);}else if(result){result.textContent='SEALING INNER HATCH...';playAudio('mechanicalActuation',{delay:.12,gain:.58});playAudio('pressureSweep',{delay:.7});playAudio('mechanicalActuation',{delay:1.42});playAudio('confirm',{delay:2.12});setTimeout(()=>result.textContent='DEPRESSURIZING...',700);setTimeout(()=>result.textContent='OPENING OUTER HATCH...',1400);setTimeout(()=>{facilitySystemState.airlockOuterOpen=true;saveFacilitySystemState();systems.querySelector('#door-airlockext')?.classList.add('is-open');updateFacilityDiagnostic(root);},2200);}return;}});
    if(facilitySystemState.medbayUnlocked)systems.querySelector('#door-medbay')?.classList.add('is-unlocked');if(facilitySystemState.medbayOpen)systems.querySelector('#door-medbay')?.classList.add('is-open');if(facilitySystemState.freezerUnlocked)systems.querySelector('#door-freezer')?.classList.add('is-unlocked');if(facilitySystemState.freezerOpen)systems.querySelector('#door-freezer')?.classList.add('is-open');if(facilitySystemState.airlockOuterOpen)systems.querySelector('#door-airlockext')?.classList.add('is-open');apply();setTimeout(()=>selectTarget(facilitySelectedTarget,false),0);
  }

  function initFacilityManagement(root){
    stopFacilityManagement();
    const host=root.querySelector('.facility-management-host');
    if(host){
      let settings=loadFacilityFonts();
      applyFacilityFonts(host,settings);
      const panel=host.querySelector('[data-facility-font-panel]');
      host.querySelectorAll('[data-facility-font-toggle]').forEach(button=>button.addEventListener('click',()=>{if(panel)panel.hidden=!panel.hidden;}));
      host.querySelectorAll('[data-facility-font]').forEach(input=>{const key=input.dataset.facilityFont;const output=host.querySelector(`[data-facility-font-out="${key}"]`);input.value=settings[key];if(output)output.value=`${settings[key]}${input.dataset.unit||'px'}`;input.addEventListener('input',()=>{settings={...settings,[key]:Number(input.value)};if(output)output.value=`${input.value}${input.dataset.unit||'px'}`;applyFacilityFonts(host,settings);saveFacilityFonts(settings);});});
      host.querySelector('[data-facility-font-reset]')?.addEventListener('click',()=>{localStorage.removeItem(FACILITY_FONT_KEY);renderTerminal();});
      host.querySelector('[data-facility-font-copy]')?.addEventListener('click',async()=>{const text=JSON.stringify(settings,null,2);const status=host.querySelector('[data-facility-font-status]');try{await navigator.clipboard.writeText(text);if(status)status.textContent='Typography settings copied.';}catch{if(status)status.textContent=text.replace(/\n/g,' ');}});
    }
    facilityAnimationFrame=requestAnimationFrame(time=>updateFacilityTelemetry(root,time));
    if(facilityView==='map')initFacilityMap(root);
  }

  function beginFacilityHackHold(event,target){
    if(event.pointerType==='mouse'&&event.button!==0)return;
    cancelFacilityHackHold();
    facilityHackHoldTimer=setTimeout(()=>{facilityHackHoldTimer=null;facilityOverlay=`${target}-hack`;renderTerminal();playAudio('hackSequence');facilityHackFinishTimer=setTimeout(()=>{facilityHackFinishTimer=null;facilityOverlay=null;if(target==='maintenance'){facilityMaintenanceUnlocked=true;facilityMapMode='maintenance';facilityView='map';}else{biosignalUnlocked=true;facilityView='biosignals';}playAudio('confirm');renderTerminal();},4100);},DIRECTIVE_HOLD_MS);
  }
  function cancelFacilityHackHold(){if(facilityHackHoldTimer!==null)clearTimeout(facilityHackHoldTimer);facilityHackHoldTimer=null;}

  function authorizeBiosignal(){
    const input=document.getElementById('biosignal-access-code');const error=document.querySelector('[data-biosignal-error]');if(!input||!error)return;
    if(input.value===DIRECTIVE_ACCESS_CODE){playAudio('confirm');executiveAuthorized=true;biosignalUnlocked=true;directiveUnlocked=true;facilityOverlay=null;facilityView='biosignals';renderTerminal();}
    else{playAudio('reject');error.textContent='AUTHORIZATION DENIED';input.value='';input.focus();}
  }

  function authorizeMaintenance(){
    const input=document.getElementById('maintenance-access-code');const error=document.querySelector('[data-maintenance-error]');if(!input||!error)return;
    if(input.value===MAINTENANCE_ACCESS_CODE){playAudio('confirm');facilityMaintenanceUnlocked=true;facilityOverlay=null;facilityMapMode='maintenance';renderTerminal();}
    else{playAudio('reject');error.textContent='MAINTENANCE AUTHORIZATION DENIED';input.value='';input.focus();}
  }

  const commandSections = {
    overview: {
      label: 'COMMAND SYSTEM OVERVIEW', clearance: 'GENERAL', render: () => `
        <div class="command-overview-shell">
          <section class="overview-primary-field" aria-label="Active command systems">
            <button type="button" class="command-system-panel command-system-panel--beacon" data-beacon-toggle data-box="beacon" aria-expanded="false" aria-controls="beacon-carrier-overlay">
              <div class="system-panel-heading overview-beacon-heading"><span class="signal-glyph panel-icon" aria-hidden="true"><i></i><i></i><i></i></span><div><small>EXTERNAL EMERGENCY CHANNEL</small><h3>DISTRESS BEACON</h3></div></div>
              <div class="panel-readout panel-readout--headline overview-beacon-main"><strong>AUTOMATED DISTRESS CARRIER DETECTED</strong></div>
              <div class="panel-command-line overview-beacon-footer"><span>SOURCE: HERON STATION // VOICE CHANNEL: UNAVAILABLE</span><strong>TOUCH PANEL TO OPEN CARRIER DETAILS</strong></div>
            </button>

            <div class="planet-orbit-display" data-box="planetDisplay" aria-label="Animated wireframe planet and moon">
              <svg viewBox="0 0 220 260" role="img" aria-label="Wireframe planet with orbiting moon">
                <g class="planet-display-grid">
                  <path d="M18 28 H72 M18 36 H52 M150 222 H202 M176 196 V246"></path>
                  <circle cx="106" cy="132" r="82"></circle>
                  <circle cx="106" cy="132" r="98" stroke-dasharray="3 7"></circle>
                </g>
                <g class="planet-wire-main">
                  <circle cx="106" cy="132" r="66" class="wire-core"></circle>
                  <ellipse cx="106" cy="132" rx="66" ry="18" class="wire-line"></ellipse>
                  <ellipse cx="106" cy="132" rx="66" ry="40" class="wire-line"></ellipse>
                  <ellipse cx="106" cy="132" rx="66" ry="66" class="wire-line"></ellipse>
                  <ellipse cx="106" cy="132" rx="24" ry="66" class="wire-line"></ellipse>
                  <ellipse cx="106" cy="132" rx="48" ry="66" class="wire-line"></ellipse>
                  <path d="M58 108 Q104 78 154 106" class="wire-line"></path>
                  <path d="M60 152 Q106 178 152 154" class="wire-line"></path>
                </g>
                <g class="planet-wire-moonOrbit">
                  <g class="planet-wire-moonBody">
                    <circle cx="170" cy="62" r="20" class="wire-line"></circle>
                    <ellipse cx="170" cy="62" rx="20" ry="7" class="wire-line"></ellipse>
                    <ellipse cx="170" cy="62" rx="8" ry="20" class="wire-line"></ellipse>
                    <circle cx="170" cy="62" r="3.5" class="fill-core"></circle>
                  </g>
                </g>
                <text x="18" y="248">LV-872 // ORISON</text>
              </svg>
            </div>

            <button type="button" class="command-system-panel command-system-panel--weather" data-section="weather" data-box="weather" aria-label="Open Planetary Weather Surveillance">
              <div class="system-panel-strip overview-weather-strip"><span>PRIORITY // CRITICAL</span><span>ORBITAL RELAY FEED</span><span>ACKNOWLEDGMENT REQUIRED</span></div>
              <div class="system-panel-heading overview-weather-heading overview-weather-pulse"><span class="weather-alert-mark" aria-hidden="true">!</span><div><small>ACTIVE ENVIRONMENTAL THREAT</small><h3>PLANETARY WEATHER ALERT</h3></div><span class="weather-alert-mark" aria-hidden="true">!</span></div>
              <div class="weather-overview-core overview-weather-core"><strong class="overview-weather-pulse">CATEGORY IV SUPERCELL</strong><span>STORM FRONT ARRIVAL</span><b class="overview-weather-pulse">IMMINENT</b></div>
              <span class="touch-cue overview-weather-cue">TOUCH PANEL TO VIEW TELEMETRY DATA</span>
            </button>

            <button type="button" class="command-system-panel command-system-panel--directive" data-section="directive" data-box="directive">
              <div class="system-panel-heading overview-directive-heading"><div><small>EXECUTIVE AUTHORIZATION</small><h3>CORPORATE DIRECTIVE</h3></div></div>
              <div class="directive-code overview-directive-main">PRIORITY 1 — UPDATED DIRECTIVE</div>
              <p class="overview-directive-date">DATED 02/16/2122</p>
              <div class="panel-command-line overview-directive-footer"><span>AUTHORITY: ELLISON-TANAKA // REVIEW REQUIRED</span><strong>TOUCH PANEL TO VIEW DIRECTIVES</strong></div>
            </button>

            <button type="button" class="command-system-panel command-system-panel--communications" data-section="communications" data-box="communications">
              <div class="system-panel-heading overview-comm-heading"><div><small>LOCAL / ORBITAL NETWORK</small><h3>COMMUNICATIONS STATUS</h3></div></div>
              <div class="radio-interference" aria-hidden="true">
                <svg viewBox="0 0 360 92" preserveAspectRatio="none">
                  <path class="radio-wave radio-wave--1" d="M0 48 C20 48 20 20 40 20 S60 76 80 76 S100 28 120 28 S140 65 160 65 S180 15 200 15 S220 78 240 78 S260 34 280 34 S300 59 320 59 S340 48 360 48"></path>
                  <path class="radio-wave radio-wave--2" d="M0 55 C18 55 18 36 36 36 S54 66 72 66 S90 42 108 42 S126 58 144 58 S162 31 180 31 S198 68 216 68 S234 41 252 41 S270 60 288 60 S306 48 324 48 S342 55 360 55"></path>
                </svg>
                <strong>INTERFERENCE DETECTED</strong>
              </div>
              <div class="overview-comm-body"><div class="status-line"><span>ORBITAL RELAY 04</span><strong>TELEMETRY ONLY</strong></div><div class="status-line"><span>TWO-WAY CONTACT</span><strong>LOST</strong></div><div class="status-line"><span>OUTGOING QUEUE</span><strong>02</strong></div></div>
              <div class="panel-command-line overview-comm-footer"><span>2 MESSAGES AWAITING DELIVERY</span><strong>TOUCH PANEL TO OPEN COMMUNICATIONS HISTORY</strong></div>
            </button>

            <button type="button" class="command-system-panel command-system-panel--systems" data-section="systems" data-box="systems">
              <div class="system-panel-heading overview-systems-heading"><div><small>INSTALLATION OPERATIONS</small><h3>FACILITY MANAGEMENT</h3></div></div>
              <div class="reactor-advisory-row"><span class="systems-glyph systems-glyph--reactor panel-icon reactor-pulse" aria-hidden="true">☢</span><strong class="overview-systems-main reactor-pulse">REMOTE FACILITY ADVISORY</strong><span class="systems-glyph systems-glyph--reactor panel-icon reactor-pulse" aria-hidden="true">☢</span></div>
              <div class="status-line overview-systems-body"><span>HERON STATION // REACTOR COOLING</span><strong>DEGRADED</strong></div>
              <div class="panel-command-line overview-systems-footer"><span>INFRASTRUCTURE // POWER // PERSONNEL</span><strong>TOUCH PANEL TO OPEN FACILITY MANAGEMENT</strong></div>
            </button>

            <button type="button" class="command-system-panel command-system-panel--planetary" data-atmo-toggle data-box="planetary" aria-label="View atmospheric note">
              <div class="planetary-panel-copy">
                <div class="system-panel-heading overview-planet-heading"><div><small>PASSIVE ENVIRONMENTAL MODEL</small><h3>PLANETARY CONDITIONS</h3></div></div>
                <div class="planetary-readouts overview-planet-readouts">
                  <div><span>O₂ CONC.</span><strong data-atmo="o2">29.8%</strong></div>
                  <div><span>HUMIDITY</span><strong data-atmo="humidity">96%</strong></div>
                  <div><span>PRESSURE</span><strong data-atmo="pressure">1.08 ATM</strong></div>
                  <div><span>SURF TEMP</span><strong data-atmo="temp">31.4°C</strong></div>
                  <div><span>BIOAEROSOL</span><strong data-atmo="bio">HIGH</strong></div>
                  <div><span>IONIZATION</span><strong data-atmo="ion">ELEVATED</strong></div>
                  <div class="planetary-readouts__wide"><span>SUIT ADVISORY</span><strong>EXTENDED EXPOSURE</strong></div>
                </div>
                <div class="panel-command-line overview-planet-footer"><span>ATMOSPHERIC NOTE AVAILABLE</span><strong>TAP PANEL TO VIEW ATMOSPHERIC NOTE</strong></div>
              </div>
            </button>
          </section>

          <aside class="overview-status-stack" aria-label="Command status summary">
            <section class="overview-status-panel"><small>SYSTEM STATUS</small><div class="large-state"><i></i><strong>ONLINE</strong></div><span>LOCAL COMMAND NODE</span></section>
            <section class="overview-status-panel"><small>INSTALLATION</small><strong>HORIZON BASE</strong><span>LV-872 // ORISON</span><div class="overview-meter"><i style="width:83%"></i></div><span>PRIMARY POWER 83%</span></section>
            <section class="overview-status-panel"><small>POWER EVENT</small><strong>RESTORED</strong><span>2122.08.16 // 09:43 LOCAL</span></section>
            <section class="overview-status-panel overview-status-panel--alerts"><small>ACTIVE ALERTS</small><strong>03</strong><span>WEATHER // DISTRESS // REACTOR</span></section>
          </aside>

          <div class="atmo-note-overlay" data-atmo-overlay hidden>
            <article class="atmo-note-card" role="dialog" aria-modal="true" aria-labelledby="atmo-note-title">
              <small>ENVIRONMENTAL NOTE // LV-872</small>
              <h3 id="atmo-note-title">ATMOSPHERIC ADVISORY</h3>
              <ul>
                <li><span>O₂ CONCENTRATION:</span><strong>ABOVE HUMAN TERRAN SAFE BASELINE</strong></li>
                <li><span>BIOAEROSOL LOAD:</span><strong>HIGH</strong></li>
                <li><span>SURFACE HUMIDITY:</span><strong>EXTREME</strong></li>
                <li><span>SUIT ADVISORY:</span><strong>REQUIRED FOR EXTENDED EXPOSURE</strong></li>
              </ul>
              <p>LOCAL ATMOSPHERE IS OXYGEN-RICH, EXTREMELY HUMID, AND BIOLOGICALLY ACTIVE.</p>
              <p>SHORT-TERM UNSUITED EXPOSURE MAY BE POSSIBLE.</p>
              <p>PROLONGED EXPOSURE RISKS RESPIRATORY IRRITATION, OXYGEN TOXICITY STRESS, AND SPORE INHALATION.</p>
              <footer>TAP ANYWHERE OUTSIDE THIS NOTE TO CLOSE</footer>
            </article>
          </div>

          <div id="beacon-carrier-overlay" class="beacon-carrier-overlay" data-beacon-overlay hidden>
            <article class="beacon-carrier-card" role="dialog" aria-modal="true" aria-labelledby="beacon-carrier-title">
              <header class="beacon-carrier-header">
                <div>
                  <small>AUTOMATED EMERGENCY CARRIER</small>
                  <h3 id="beacon-carrier-title">DISTRESS BEACON STATUS</h3>
                </div>
                <div class="beacon-active-state"><i aria-hidden="true"></i><strong>ACTIVE</strong></div>
                <button type="button" class="beacon-carrier-close" data-beacon-close aria-label="Close distress beacon details">×</button>
              </header>

              <section class="beacon-identity-strip" aria-label="Beacon identification">
                <div><small>SOURCE</small><strong>HERON STATION</strong></div>
                <div><small>AUTHENTICATION</small><strong>VALID</strong></div>
                <div><small>FIRST DETECTED</small><strong>2122.07.19</strong></div>
              </section>

              <section class="beacon-focus-grid" aria-label="Live transmission telemetry">
                <div class="beacon-focus-cell">
                  <small>NEXT TRANSMISSION</small>
                  <strong class="beacon-countdown" data-beacon-countdown>00:30</strong>
                  <div class="beacon-progress-rail" aria-hidden="true"><i data-beacon-progress></i></div>
                </div>
                <div class="beacon-focus-cell">
                  <small>RETRANSMISSIONS</small>
                  <strong class="beacon-retransmissions" data-beacon-count>264,960</strong>
                  <span>AUTOMATED CARRIER LOOP</span>
                </div>
              </section>

              <section class="beacon-data-section beacon-data-section--signal">
                <h4>SIGNAL RECEPTION</h4>
                <dl>
                  <div><dt>SIGNAL INTEGRITY</dt><dd>18.6%</dd></div>
                  <div><dt>RECEPTION QUALITY</dt><dd>POOR</dd></div>
                </dl>
              </section>

              <section class="beacon-data-section">
                <h4>HERON STATION TELEMETRY</h4>
                <dl>
                  <div><dt>EMERGENCY POWER</dt><dd>ONLINE</dd></div>
                  <div><dt>LIFE SUPPORT</dt><dd>DEGRADED</dd></div>
                  <div><dt>COMMUNICATIONS</dt><dd>FAILED</dd></div>
                  <div><dt>RELAY HANDSHAKE</dt><dd>NO RESPONSE</dd></div>
                  <div><dt>SURVIVAL PROBABILITY</dt><dd>INDETERMINATE</dd></div>
                </dl>
              </section>

              <footer class="beacon-carrier-footer">
                <span>AUTOMATED MONITORING ENABLED</span>
                <strong>DISPLAY SYNCHRONIZED TO LIVE BEACON</strong>
              </footer>
            </article>
          </div>

          <aside class="overview-layout-panel" data-overview-layout-panel hidden>
            <header><div><small>DEVELOPER TOOL</small><strong>OVERVIEW LAYOUT &amp; ANIMATION</strong></div><button type="button" data-overview-layout-toggle aria-label="Close">×</button></header>
            <div class="overview-dev-controls">
              <fieldset><legend>Spacing</legend>
                <label>Outer margin <output data-layout-out="outerMargin"></output><input type="range" min="0" max="48" step="1" data-overview-layout="outerMargin"></label>
                <label>Horizontal gap <output data-layout-out="gapX"></output><input type="range" min="0" max="48" step="1" data-overview-layout="gapX"></label>
                <label>Vertical gap <output data-layout-out="gapY"></output><input type="range" min="0" max="48" step="1" data-overview-layout="gapY"></label>
                <label>Panel inset <output data-layout-out="panelInset"></output><input type="range" min="0" max="20" step="1" data-overview-layout="panelInset"></label>
              </fieldset>
              <fieldset><legend>Column proportions</legend>
                <label>Left column <output data-layout-out="leftCol"></output><input type="range" min="60" max="160" step="1" data-overview-layout="leftCol"></label>
                <label>Planet column <output data-layout-out="planetCol"></output><input type="range" min="40" max="130" step="1" data-overview-layout="planetCol"></label>
                <label>Weather column <output data-layout-out="weatherCol"></output><input type="range" min="80" max="220" step="1" data-overview-layout="weatherCol"></label>
                <label>Right column <output data-layout-out="rightCol"></output><input type="range" min="60" max="160" step="1" data-overview-layout="rightCol"></label>
              </fieldset>
              <fieldset><legend>Planet display</legend>
                <label>Planet display size <output data-layout-out="planetScale"></output><input type="range" min="50" max="150" step="1" data-overview-layout="planetScale"></label>
                <label>Moon size <output data-layout-out="moonScale"></output><input type="range" min="50" max="180" step="1" data-overview-layout="moonScale"></label>
                <label>Planet rotation <output data-layout-out="planetSpeed"></output><input type="range" min="0" max="120" step="1" data-overview-layout="planetSpeed"></label>
                <label>Moon orbit <output data-layout-out="moonSpeed"></output><input type="range" min="0" max="90" step="1" data-overview-layout="moonSpeed"></label>
                <label class="overview-check"><span>Animate planet and moon</span><input type="checkbox" data-overview-layout="animatePlanet"></label>
              </fieldset>
              <fieldset><legend>Panel icons</legend>
                <label>Icon size <output data-layout-out="iconSize"></output><input type="range" min="28" max="90" step="1" data-overview-layout="iconSize"></label>
                <label>Alert pulse speed <output data-layout-out="pulseSpeed"></output><input type="range" min="1" max="8" step=".1" data-overview-layout="pulseSpeed"></label>
                <label>Grid opacity <output data-layout-out="gridOpacity"></output><input type="range" min="0" max="35" step="1" data-overview-layout="gridOpacity"></label>
              </fieldset>
            </div>
            <footer><button type="button" data-layout-reset>RESET</button><button type="button" data-layout-copy>COPY SETTINGS</button><span data-layout-status>Changes save locally.</span></footer>
          </aside>

          <aside class="overview-editor-panel" data-overview-editor-panel hidden>
            <header><div><small>DEVELOPER TOOL</small><strong>LIVE LAYOUT EDITOR</strong></div><button type="button" data-overview-editor-toggle aria-label="Close">×</button></header>
            <div class="overview-editor-meta">
              <strong data-editor-selected>SELECT A PANEL</strong>
              <span data-editor-readout>DRAG TO MOVE // CORNER HANDLE TO RESIZE</span>
            </div>
            <footer><button type="button" data-editor-copy>COPY PANEL POSITIONS</button><button type="button" data-editor-copy-all>COPY ALL OVERVIEW SETTINGS</button><button type="button" data-editor-reset>RESET PANELS</button><span data-editor-status>Editor inactive.</span></footer>
          </aside>

          <aside class="overview-dev-panel" data-overview-dev-panel hidden>
            <header><div><small>DEVELOPER TOOL</small><strong>COMMAND OVERVIEW TYPOGRAPHY</strong></div><button type="button" data-overview-dev-toggle aria-label="Close">×</button></header>
            <div class="overview-dev-controls">
              <fieldset><legend>Weather alert</legend>
                <label>Header <output data-overview-out="weatherHeading"></output><input type="range" min="16" max="56" step="1" data-overview-font="weatherHeading"></label>
                <label>Main alert <output data-overview-out="weatherMain"></output><input type="range" min="24" max="90" step="1" data-overview-font="weatherMain"></label>
                <label>Status word <output data-overview-out="weatherStatus"></output><input type="range" min="28" max="110" step="1" data-overview-font="weatherStatus"></label>
                <label>Impact rows <output data-overview-out="weatherImpact"></output><input type="range" min="10" max="38" step="1" data-overview-font="weatherImpact"></label>
                <label>Footer/cue <output data-overview-out="weatherFooter"></output><input type="range" min="9" max="28" step="1" data-overview-font="weatherFooter"></label>
              </fieldset>
              <fieldset><legend>Distress beacon</legend>
                <label>Panel heading <output data-overview-out="beaconHeading"></output><input type="range" min="14" max="40" step="1" data-overview-font="beaconHeading"></label>
                <label>Main message <output data-overview-out="beaconMain"></output><input type="range" min="18" max="56" step="1" data-overview-font="beaconMain"></label>
                <label>Footer <output data-overview-out="beaconFooter"></output><input type="range" min="9" max="26" step="1" data-overview-font="beaconFooter"></label>
              </fieldset>
              <fieldset><legend>Corporate directive</legend>
                <label>Panel heading <output data-overview-out="directiveHeading"></output><input type="range" min="14" max="40" step="1" data-overview-font="directiveHeading"></label>
                <label>Main message <output data-overview-out="directiveMain"></output><input type="range" min="16" max="56" step="1" data-overview-font="directiveMain"></label>
                <label>Date <output data-overview-out="directiveDate"></output><input type="range" min="10" max="32" step="1" data-overview-font="directiveDate"></label>
                <label>Footer <output data-overview-out="directiveFooter"></output><input type="range" min="9" max="26" step="1" data-overview-font="directiveFooter"></label>
              </fieldset>
              <fieldset><legend>Communications</legend>
                <label>Panel heading <output data-overview-out="commHeading"></output><input type="range" min="14" max="40" step="1" data-overview-font="commHeading"></label>
                <label>Status rows <output data-overview-out="commBody"></output><input type="range" min="10" max="34" step="1" data-overview-font="commBody"></label>
                <label>Footer <output data-overview-out="commFooter"></output><input type="range" min="9" max="26" step="1" data-overview-font="commFooter"></label>
              </fieldset>
              <fieldset><legend>Facility management</legend>
                <label>Panel heading <output data-overview-out="systemsHeading"></output><input type="range" min="14" max="40" step="1" data-overview-font="systemsHeading"></label>
                <label>Main message <output data-overview-out="systemsMain"></output><input type="range" min="14" max="48" step="1" data-overview-font="systemsMain"></label>
                <label>Update row <output data-overview-out="systemsBody"></output><input type="range" min="10" max="30" step="1" data-overview-font="systemsBody"></label>
                <label>Footer <output data-overview-out="systemsFooter"></output><input type="range" min="9" max="26" step="1" data-overview-font="systemsFooter"></label>
              </fieldset>
              <fieldset><legend>Planetary conditions</legend>
                <label>Panel heading <output data-overview-out="planetHeading"></output><input type="range" min="12" max="34" step="1" data-overview-font="planetHeading"></label>
                <label>Readouts <output data-overview-out="planetBody"></output><input type="range" min="10" max="24" step="1" data-overview-font="planetBody"></label>
                <label>Footer <output data-overview-out="planetFooter"></output><input type="range" min="9" max="22" step="1" data-overview-font="planetFooter"></label>
              </fieldset>
            </div>
            <footer><button type="button" data-overview-reset>RESET</button><button type="button" data-overview-copy>COPY SETTINGS</button><span data-overview-status>Changes save locally.</span></footer>
          </aside>
        </div>`
    },
    weather: {
      label: 'PLANETARY WEATHER SURVEILLANCE', clearance: 'GENERAL', render: () => `
        <div class="weather-terminal" data-weather-terminal>
          <header class="weather-topbar${loadDevPrefs().show ? ' weather-topbar--dev' : ''}">
            <div class="weather-brand-mini"><img src="assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka corporate emblem"><div><strong>ELLISON–TANAKA</strong><span>COLONIAL SYSTEMS</span><small>BUILDING BETTER FUTURES.</small></div></div>
            <div class="weather-title"><span>PLANETARY WEATHER SURVEILLANCE</span><strong>LV-872</strong></div>
            ${loadDevPrefs().show ? '<button class="sandbox-toggle" type="button" data-sandbox-toggle>WEATHER DEV TOOLS</button>' : ''}
          </header>
          <div class="weather-grid">
            <aside class="weather-left">
              <section class="weather-panel storm-id"><span>ACTIVE WEATHER<br>SYSTEM</span><strong>LV-872</strong><b>STORM CELL</b><small>CLASSIFICATION</small><em><span>CATEGORY IV</span><span>SUPERCELL</span></em></section>
              <section class="weather-panel telemetry-panel"><h3>STORM METRICS</h3>
                <div><span>SURFACE WINDS</span><b data-telemetry="wind">87 MPH</b></div><div><span>PEAK GUSTS</span><b data-telemetry="gust">126 MPH</b></div><div><span>STORM BEARING</span><b>218° SW</b></div><div><span>FORWARD VELOCITY</span><b data-telemetry="velocity">17 MPH</b></div><div><span>HUMIDITY</span><b data-telemetry="humidity">94%</b></div><div><span>VISIBILITY</span><b data-telemetry="visibility">&lt; 0.3 MI</b></div><div><span>TEMPERATURE</span><b data-telemetry="temperature">77.2 °F</b></div><div><span>ELECTRICAL ACTIVITY</span><b class="amber-text">EXTREME</b></div>
              </section>
            </aside>
            <main class="weather-radar-panel"><div class="radar-label">SATELLITE / RADAR COMPOSITE <small>INFRARED INTENSITY</small></div><div class="radar-map" data-weather-map><div class="argoza-map-frame weather-map-frame" data-argoza-map-frame data-map-width="1672" data-map-height="941"><div class="argoza-map-coordinate-space weather-map-coordinate-space" data-argoza-map-coordinate-space><img class="weather-terrain-layer" src="assets/img/command/weather-terrain.png" alt="Topographic terrain surrounding Horizon Base and Heron Station"><img class="weather-storm-layer" src="assets/img/command/weather-storm.png" alt="Category IV supercell cloud overlay"><svg class="weather-code-overlay" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-label="Weather forecast overlay"><defs><marker id="forecastArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"/></marker></defs><path class="forecast-cone" data-map-cone></path><path class="forecast-path" data-map-path marker-end="url(#forecastArrow)"></path><circle class="storm-position" data-map-current r="8"></circle><g class="coded-base coded-base--horizon" data-coded-base="horizon"><polygon points="0,-18 18,16 -18,16"></polygon></g><g class="coded-base coded-base--heron" data-coded-base="heron"><polygon points="0,-18 18,16 -18,16"></polygon></g></svg><div class="coded-label coded-label--horizon" data-coded-label="horizon"><strong>HORIZON BASE</strong><span>ELEV. 212 M</span></div><div class="coded-label coded-label--heron" data-coded-label="heron"><strong>HERON STATION</strong><span>ELEV. 134 M</span></div><div class="map-scale" data-map-scale><div class="scale-rule"></div><div class="scale-values"><span>0</span><span>5</span><span>10</span><span>15</span><span>20 KM</span></div></div></div></div></div></main>
            <aside class="weather-right"><section class="weather-panel weather-date"><span><span>DATE</span><b>2122.08.16</b></span><span><span>TIME</span><b data-weather-clock>09:43:17 LOCAL</b></span></section><section class="weather-panel impact-panel impact-panel--horizon"><h3>HORIZON BASE</h3><span>ESTIMATED ARRIVAL</span><strong class="weather-imminent">IMMINENT</strong></section><section class="weather-panel outlook-panel"><h3>REGIONAL OUTLOOK</h3><div><span>STORM SIZE</span><b>323 MI</b></div><div><span>RAIN RATE</span><b data-telemetry="rain">9.4 IN/HR</b></div><div><span>TIDE IMPACT</span><b>MAJOR</b></div><div><span>FLOOD RISK</span><b class="amber-text">EXTREME</b></div><div><span>LANDSLIDE RISK</span><b>HIGH</b></div></section><section class="weather-panel latest-observations-panel"><h3>LATEST OBSERVATIONS</h3><div><span>WIND SHEAR</span><b>HIGH</b></div><div><span>PRECIPITATION</span><b>HEAVY</b></div><div><span>LIGHTNING</span><b>VERY HIGH</b></div><div><span>SENSOR COVERAGE</span><b data-telemetry="coverage">92%</b></div></section></aside>
          </div>
          ${loadDevPrefs().show ? `<aside class="weather-sandbox" data-weather-sandbox hidden>
            <header><div><small>DEVELOPER TOOL</small><strong>WEATHER MAP & LAYOUT SANDBOX</strong></div><button type="button" data-sandbox-toggle aria-label="Close">×</button></header>
            <div class="sandbox-controls">
              <fieldset><legend>Screen layout</legend>
                <label>Command rail <output data-out="navWidth"></output><input type="range" min="0" max="240" step="5" data-layout="navWidth"></label>
                <label>Left panels <output data-out="leftWidth"></output><input type="range" min="150" max="380" step="5" data-layout="leftWidth"></label>
                <label>Right panels <output data-out="rightWidth"></output><input type="range" min="180" max="520" step="5" data-layout="rightWidth"></label>
                <label>Column gap <output data-out="gap"></output><input type="range" min="4" max="18" step="1" data-layout="gap"></label>
                <label>Panel text <output data-out="fontScale"></output><input type="range" min="80" max="125" step="1" data-layout="fontScale"></label>
              </fieldset>
              <fieldset><legend>Terrain crop</legend>
                <label>Map zoom <output data-out="mapZoom"></output><input type="range" min="90" max="150" step="1" data-layout="mapZoom"></label>
                <label>Map horizontal <output data-out="mapX"></output><input type="range" min="0" max="100" step="1" data-layout="mapX"></label>
                <label>Map vertical <output data-out="mapY"></output><input type="range" min="0" max="100" step="1" data-layout="mapY"></label>
              </fieldset>
              <fieldset><legend>Storm rotation</legend>
                <label class="check-row">Rotate storm <input type="checkbox" data-layout="animateStorm"></label>
                <label class="check-row">Reverse direction <input type="checkbox" data-layout="stormReverse"></label>
                <label>X position <output data-out="stormX"></output><input type="range" min="-20" max="20" step=".1" data-layout="stormX"></label>
                <label>Y position <output data-out="stormY"></output><input type="range" min="-20" max="20" step=".1" data-layout="stormY"></label>
                <label>Scale <output data-out="stormScale"></output><input type="range" min="70" max="150" step="1" data-layout="stormScale"></label>
                <label>Opacity <output data-out="stormOpacity"></output><input type="range" min="15" max="100" step="1" data-layout="stormOpacity"></label>
                <label>Starting angle <output data-out="stormRotation"></output><input type="range" min="-180" max="180" step="1" data-layout="stormRotation"></label>
                <label>Full rotation duration <output data-out="stormDuration"></output><input type="range" min="10" max="600" step="5" data-layout="stormDuration"></label>
                <button class="sandbox-mini-action" type="button" data-storm-reset>RESET ROTATION TO 500s</button>
              </fieldset>
              <fieldset><legend>Base markers</legend>
                <label>Marker size <output data-out="markerSize"></output><input type="range" min="10" max="48" step="1" data-layout="markerSize"></label>
                <label>Blink speed <output data-out="blinkSpeed"></output><input type="range" min=".6" max="8" step=".1" data-layout="blinkSpeed"></label>
                <label>Horizon X <output data-out="horizonX"></output><input type="range" min="0" max="100" step=".1" data-layout="horizonX"></label>
                <label>Horizon Y <output data-out="horizonY"></output><input type="range" min="0" max="100" step=".1" data-layout="horizonY"></label>
                <label>Heron X <output data-out="heronX"></output><input type="range" min="0" max="100" step=".1" data-layout="heronX"></label>
                <label>Heron Y <output data-out="heronY"></output><input type="range" min="0" max="100" step=".1" data-layout="heronY"></label>
              </fieldset>
              <fieldset><legend>Map labels</legend>
                <label class="check-row">Show labels <input type="checkbox" data-layout="showLabels"></label>
                <label>Label scale <output data-out="labelScale"></output><input type="range" min="60" max="170" step="1" data-layout="labelScale"></label>
                <label>Horizon label X <output data-out="horizonLabelX"></output><input type="range" min="-20" max="20" step=".1" data-layout="horizonLabelX"></label>
                <label>Horizon label Y <output data-out="horizonLabelY"></output><input type="range" min="-20" max="20" step=".1" data-layout="horizonLabelY"></label>
                <label>Heron label X <output data-out="heronLabelX"></output><input type="range" min="-20" max="20" step=".1" data-layout="heronLabelX"></label>
                <label>Heron label Y <output data-out="heronLabelY"></output><input type="range" min="-20" max="20" step=".1" data-layout="heronLabelY"></label>
              </fieldset>
              <fieldset><legend>Projected path</legend>
                <label class="check-row">Show path <input type="checkbox" data-layout="showPath"></label>
                <label>Current X <output data-out="currentX"></output><input type="range" min="0" max="100" step=".1" data-layout="currentX"></label>
                <label>Current Y <output data-out="currentY"></output><input type="range" min="0" max="100" step=".1" data-layout="currentY"></label>
                <label>Curve X <output data-out="bendX"></output><input type="range" min="0" max="100" step=".1" data-layout="bendX"></label>
                <label>Curve Y <output data-out="bendY"></output><input type="range" min="0" max="100" step=".1" data-layout="bendY"></label>
                <label>Line width <output data-out="pathWidth"></output><input type="range" min=".5" max="6" step=".1" data-layout="pathWidth"></label>
                <label>Dash speed <output data-out="pathDashSpeed"></output><input type="range" min="0" max="20" step=".5" data-layout="pathDashSpeed"></label>
                <label>Cone width <output data-out="coneWidth"></output><input type="range" min="0" max="40" step="1" data-layout="coneWidth"></label>
                <label>Cone opacity <output data-out="coneOpacity"></output><input type="range" min="0" max="60" step="1" data-layout="coneOpacity"></label>
              </fieldset>
              <fieldset><legend>Map scale</legend>
                <label class="check-row">Show scale <input type="checkbox" data-layout="showScale"></label>
                <label>Scale X <output data-out="scaleX"></output><input type="range" min="0" max="100" step="1" data-layout="scaleX"></label>
                <label>Scale Y <output data-out="scaleY"></output><input type="range" min="0" max="100" step="1" data-layout="scaleY"></label>
                <label>Scale width <output data-out="scaleWidth"></output><input type="range" min="10" max="70" step="1" data-layout="scaleWidth"></label>
                <label>Scale text <output data-out="scaleText"></output><input type="range" min="60" max="160" step="1" data-layout="scaleText"></label>
              </fieldset>
            </div>
            <footer><button type="button" data-sandbox-reset>RESET</button><button type="button" data-sandbox-copy>COPY ALL SETTINGS</button><span data-sandbox-status>Changes save locally.</span></footer>
          </aside>` : ''}
        </div>`
    },
    directive: {label:'CORPORATE DIRECTIVE ARCHIVE', clearance:'COMMAND', render:renderDirectiveArchive},
    communications: {label:'COMMUNICATIONS HISTORY', clearance:'COMMAND', render:renderCommunications},
    systems: {label:'FACILITY MANAGEMENT', clearance:'GENERAL', render:renderFacilityManagement},
    personnel: {
      label: 'PERSONNEL DIRECTORY', clearance: 'COMMAND', render: () => `<div class="roster-summary"><div><span>TOTAL ASSIGNED</span><strong>25</strong></div><div><span>CIVILIAN</span><strong>07</strong></div><div><span>MILITARY</span><strong>18</strong></div></div><div class="file-grid"><button class="file-tile" data-section="systems"><span class="file-code">FAC-01</span><strong>OPEN FACILITY MANAGEMENT</strong><small>Organization directory // protected biosignal monitor</small></button></div>`
    },
    operations: {label:'OPERATIONS',clearance:'COMMAND',render:()=>`<div class="operations-board"><section class="ops-column"><h3>FACILITY SYSTEMS</h3><button class="ops-line" data-section="systems"><span>01</span><strong>OPEN FACILITY MANAGEMENT</strong><em>ONLINE</em></button></section><section class="ops-column"><h3>MISSION RECORD</h3><button class="ops-line" data-doc="timeline"><span>04</span><strong>MISSION TIMELINE</strong><em>ARCHIVED</em></button></section></div>`},
    archives: {label:'ARCHIVES',clearance:'RESTRICTED',render:()=>`<div class="archive-list"><button class="archive-entry" data-doc="timeline"><span>ARCH-014</span><strong>MISSION EVENT TIMELINE</strong><em>AVAILABLE</em></button><div class="archive-entry archive-entry--locked"><span>ARCH-022</span><strong>INCIDENT RESPONSE FILE</strong><em>LOCKED</em></div></div>`}
  };

  function edemText(value){
    return String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  }

  function renderEdemParagraphs(paragraphs){
    return paragraphs.map(paragraph=>`<p>${edemText(paragraph)}</p>`).join('');
  }

  function renderEdemEntryList(entries,section,indexOffset=0){
    return entries.map((entry,index)=>{const selectionIndex=index+indexOffset;return `<button type="button" class="edem-entry${edemSelection[section]===selectionIndex?' is-active':''}${entry.pinned?' is-pinned':''}${entry.archived===false?' is-recent':''}" data-edem-entry="${selectionIndex}" aria-pressed="${edemSelection[section]===selectionIndex}">${entry.pinned?'<span class="edem-pin" aria-label="Pinned by C. Edem">◆</span>':''}<span>${edemText(entry.date||String(index+1).padStart(2,'0'))}</span><strong>${edemText(entry.title||entry.date)}</strong>${entry.archived===false?'<em>UNARCHIVED</em>':''}</button>`;}).join('');
  }

  function renderEdemReader(entry,kind){
    const heading=entry.title||entry.date;
    const metadata=entry.date||(kind==='research'?'WORKING NOTE':'LOCAL CACHE');
    return `<article class="edem-reader edem-reader--${kind}"><header><span>${edemText(metadata)}</span><h2>${edemText(heading)}</h2>${entry.pinned?'<em>PINNED BY C. EDEM</em>':''}${entry.archived===false?'<em>RECENT // UNARCHIVED</em>':''}</header><div class="edem-copy">${renderEdemParagraphs(entry.body)}${entry.status?`<strong class="edem-entry-status">STATUS: ${edemText(entry.status)}</strong>`:''}</div></article>`;
  }

  function renderEdemMission(){
    const pinned=missionLogs.filter(entry=>entry.pinned);
    const recent=missionLogs.filter(entry=>!entry.pinned);
    return `<section class="edem-section edem-section--mission"><aside class="edem-index"><header><span>MISSION LOG ARCHIVE // 47 RECORDS</span><strong>PINNED BY C. EDEM // 5</strong></header><h3>PINNED ENTRIES</h3>${renderEdemEntryList(pinned,'mission')}<h3>RECENT RECORDS // 1 UNARCHIVED</h3>${renderEdemEntryList(recent,'mission',pinned.length)}<div class="edem-archive-static"><span>ARCHIVE</span><strong>41 ADDITIONAL RECORDS</strong></div></aside>${renderEdemReader(missionLogs[edemSelection.mission]||missionLogs[0],'mission')}</section>`;
  }

  function renderEdemResearch(){
    const entries=researchNotes;
    return `<section class="edem-section"><aside class="edem-index"><header><span>RESEARCH NOTES</span><strong>LOCAL WORKING FILES // 4</strong></header>${renderEdemEntryList(entries,'research')}</aside>${renderEdemReader(entries[edemSelection.research]||entries[0],'research')}</section>`;
  }

  function renderEdemJournal(){
    const entry=journalEntries[edemSelection.journal]||journalEntries[0];
    return `<section class="edem-section"><aside class="edem-index"><header><span>PERSONAL JOURNAL</span><strong>LOCAL CACHE // 3 ENTRIES</strong></header>${renderEdemEntryList(journalEntries,'journal')}<div class="edem-remote-archive" aria-disabled="true"><span>REMOTE ARCHIVE</span><strong>35 ENTRIES</strong><em>STATUS: NETWORK UNAVAILABLE</em><small>ARCHIVE NOT MOUNTED</small></div></aside>${renderEdemReader(entry,'journal')}</section>`;
  }

  function renderEdemOutbox(){
    return `<section class="edem-section edem-section--outbox"><article class="edem-reader edem-reader--outbox"><header><span>OUTBOX // 1 UNSENT MESSAGE</span><h2>EMERGENCY TRANSMISSION</h2></header><dl><div><dt>TO</dt><dd>${edemText(outboxMessage.to)}</dd></div><div><dt>PRIORITY</dt><dd>${edemText(outboxMessage.priority)}</dd></div><div><dt>DATE</dt><dd>${edemText(outboxMessage.date)}</dd></div><div class="is-failed"><dt>STATUS</dt><dd>${edemText(outboxMessage.status)}</dd></div></dl><div class="edem-copy">${renderEdemParagraphs(outboxMessage.body)}</div></article></section>`;
  }

  function renderEdem(){
    const navigation=[['mission','▤','MISSION LOG'],['research','⌁','RESEARCH NOTES'],['journal','▥','PERSONAL JOURNAL'],['outbox','⇱','OUTBOX (1)']];
    const content={mission:renderEdemMission,research:renderEdemResearch,journal:renderEdemJournal,outbox:renderEdemOutbox}[edemSection]();
    return `<div class="edem-workstation"><img class="edem-contour-map" src="assets/img/grid_contour_map.svg" alt="" aria-hidden="true"><header class="edem-profile-header"><img src="assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka Colonial Systems"><div><span>ETOS PERSONAL WORKSTATION</span><strong>DR. CLAIRE EDEM // CHIEF MISSION SPECIALIST</strong></div></header><nav class="edem-navigation" aria-label="Dr. Edem terminal sections">${navigation.map(([key,icon,label])=>`<button type="button" class="${edemSection===key?'is-active':''}" data-edem-section="${key}" aria-current="${edemSection===key?'page':'false'}"><span aria-hidden="true">${icon}</span><strong>${label}</strong></button>`).join('')}</nav><main class="edem-content">${content}</main><footer class="edem-workstation-footer"><span>WS-EDM-01</span><span><i aria-hidden="true">▣</i> LOCAL STORAGE: ONLINE</span><span><i aria-hidden="true">⌁</i> NETWORK: UNAVAILABLE</span></footer></div>`;
  }

  const argozaCrew = {
    away:[
      {name:'KATYA KOSMONAVT',role:'SYNTHETIC SYSTEMS SPECIALIST',primary:'Systems access / diagnostics / communications',mission:'Technical systems recovery',deployment:'HORIZON BASE AWAY TEAM',portrait:'assets/img/katya.png'},
      {name:'DR. REGINA PHALANGE',role:'MEDICAL OFFICER',primary:'Medical support / personnel assessment / biological hazards',mission:'Medical operations',deployment:'HORIZON BASE AWAY TEAM',portrait:'assets/img/phalange.png'},
      {name:'DR. ALARIC FRITIGERN',role:'XENOSCIENCE RESEARCH OFFICER',primary:'Biological research assessment / sample evaluation',mission:'Scientific operations',deployment:'HORIZON BASE AWAY TEAM',portrait:'assets/img/fritigern.png'},
      {name:'BUBBA SPARXXX',role:'MILITARY OPERATIONS LIAISON',primary:'Security assessment / coordination with Horizon military personnel',mission:'Operational security',deployment:'HORIZON BASE AWAY TEAM',portrait:'assets/img/bubba.png'}
    ],
    support:[
      {name:'KIERAN MAAS',role:'CORPORATE MISSION AUTHORITY',mission:'Mission briefing / corporate mission coordination / Argoza command authority',deployment:'ARGOZA SUPPORT',portrait:'assets/img/maas.png'},
      {name:'LENA ANDERS',role:'PRIMARY FLIGHT OFFICER',mission:'Primary flight operations / surface insertion support',deployment:'ARGOZA SUPPORT',portrait:'assets/img/anders.png'},
      {name:'THOMAS RENFIELD',role:'SECONDARY FLIGHT OFFICER',mission:'Secondary flight operations / surface insertion support',deployment:'ARGOZA SUPPORT',portrait:'assets/img/renfield.png'}
    ]
  };

  const argozaFacilityRooms = {
    garage:{name:'GARAGE / UTILITIES',summary:`Vehicle access, maintenance support, tools, and facility utility equipment. Houses the installation's auxiliary generator and emergency power distribution controls.`,x:25.5,y:26.4,w:23,h:18},
    habitat:{name:'CREW HABITAT',summary:'Primary living quarters and personal crew accommodations.',x:25.5,y:68.9,w:22,h:22},
    commissary:{name:'COMMISSARY',summary:'Central dining, recreation, and general crew gathering area.',x:52.6,y:57.5,w:22,h:23},
    medbay:{name:'MEDBAY',summary:'Medical treatment, diagnostics, and controlled biological workspaces.',x:77,y:29.3,w:18,h:22},
    freezer:{name:'FREEZER',summary:'Long-term refrigerated and frozen supply storage.',x:74.2,y:52,w:14,h:15},
    pantry:{name:'PANTRY',summary:'Dry-goods and daily provisions storage.',x:71.5,y:60.4,w:17,h:9},
    airlock:{name:'AIRLOCK',summary:'Primary personnel access point and exterior transition chamber.',x:55.3,y:77.4,w:10,h:18},
    command:{name:'COMMAND CENTER',summary:'Primary installation control, communications, and operational coordination.',x:55.6,y:19.8,w:20,h:20},
    armory:{name:'ARMORY',summary:'Controlled storage for military weapons, protective equipment, and security supplies.',x:18.6,y:46.9,w:17,h:15}
  };

  const argozaBriefingFiles = [
    ['deployment','DEPLOYMENT / INSERTION BRIEF'],['manifest','PERSONNEL MANIFEST'],['layout','HORIZON BASE LAYOUT'],['installation','INSTALLATION OVERVIEW'],['communications','COMMUNICATIONS SUMMARY'],['personnel','PERSONNEL BRIEFINGS']
  ];

  const argozaPersonnelBriefings = {
    C37K9:{
      recipient:'KOSMONAVT, KATYA',role:'SYNTHETIC SYSTEMS SPECIALIST',clearance:'C-3',
      sections:[
        {title:'01 // MISSION CONTEXT',paragraphs:[`Horizon Base has failed to respond to scheduled communications and routine status requests. The cause of the interruption has not been established. Your team is being deployed to restore contact, assess installation status, and assist resident personnel as required.`]},
        {title:'02 // SPECIALIST REQUIREMENT',paragraphs:[`You have been assigned to evaluate the integrity of Horizon Base's ETOS environment.`,`Most communications failures are attributable to damaged infrastructure, software faults, or local operating error.`,`Your involvement becomes necessary if evidence suggests that access controls, reporting safeguards, system records, or other Ellison-Tanaka procedures have been deliberately bypassed, altered, or suppressed.`]},
        {title:'03 // CONTINGENCY AUTHORITY',paragraphs:[`Should local system integrity become uncertain, your assessment will determine whether additional corporate audit measures are warranted.`,`You are authorized to initiate a protected ETOS audit without relying on local administrative credentials.`]},
        {title:'04 // ISSUED EQUIPMENT',equipment:{title:'CORPORATE AUDIT TOKEN',description:'The Audit Token provides independent access to protected ETOS audit functions when normal system authority cannot be considered reliable.',bullets:['Use if deliberate system circumvention is suspected.','Use if local access records cannot be trusted.','Activation does not require authorization from Horizon Base personnel.']}},
        {title:'05 // POST-ACTION REVIEW',paragraphs:[`Any decision to initiate protected audit procedures, override local administrative authority, or classify Horizon Base systems as compromised will be subject to post-mission review by Ellison-Tanaka Systems Compliance and Corporate Security.`,`Your authorization permits independent action where circumstances require it. It does not exempt that action from subsequent review.`]}
      ]
    },
    M24R6:{
      recipient:'DR. PHALANGE, REGINA',role:'MEDICAL OFFICER',clearance:'M-2',
      sections:[
        {title:'01 // MISSION CONTEXT',paragraphs:[`Horizon Base has failed to respond to scheduled communications and routine status requests. Until contact is restored, the medical condition of resident personnel and the status of local research operations remain unknown.`]},
        {title:'02 // SPECIALIST REQUIREMENT',paragraphs:[`You have been assigned to provide medical evaluation and treatment for Horizon personnel and members of the response team.`,`Your authority also extends to biological material, research specimens, or contaminated assets that may present an unacceptable hazard to personnel, transport operations, or recovery efforts.`]},
        {title:'03 // CONTINGENCY AUTHORITY',paragraphs:[`Biological material recovered during the mission should normally be preserved for evaluation and transport.`,`Where continued containment cannot be assured, your medical assessment will determine whether preservation remains an acceptable risk.`,`Ellison-Tanaka authorizes you to terminate designated biological material when continued retention presents an unacceptable hazard.`]},
        {title:'04 // ISSUED EQUIPMENT',equipment:{title:'SPECIMEN TERMINATION INJECTOR',description:'The injector interfaces with compatible ETOS specimen-containment systems and authorizes controlled termination of selected contained samples.',bullets:['Intended for compromised or unsafe biological material.','Use is based on your medical risk assessment.','Termination is irreversible.']}},
        {title:'05 // POST-ACTION REVIEW',paragraphs:[`Use of specimen termination authority will be reviewed following mission completion by Ellison-Tanaka Medical Operations and Biological Risk Management.`,`Decisions will be evaluated against the information reasonably available at the time, including containment status, personnel risk, and recoverability of affected material.`]}
      ]
    },
    R28F3:{
      recipient:'DR. FRITIGERN, ALARIC',role:'XENOSCIENCE RESEARCH OFFICER',clearance:'R-2',
      sections:[
        {title:'01 // MISSION CONTEXT',paragraphs:[`Horizon Base supports ongoing biological survey and terraforming research on Orison. Loss of communications does not alter existing requirements for the preservation of scientific records, specimens, and commercially significant research.`]},
        {title:'02 // SPECIALIST REQUIREMENT',paragraphs:[`You have been assigned to assess the scientific value and recoverability of Horizon Base research.`,`Your expertise is required because automated recovery procedures cannot determine whether unfamiliar biological findings represent valuable research, an unacceptable contamination risk, or information that should not leave the installation.`]},
        {title:'03 // CONTINGENCY AUTHORITY',paragraphs:[`Research data should normally be preserved.`,`If material recovered from Horizon Base presents a credible biological, operational, or corporate risk, you are authorized to determine whether that information should remain recoverable.`,`That authority is intentionally assigned to the mission xenoscience officer rather than local personnel.`]},
        {title:'04 // ISSUED EQUIPMENT',equipment:{title:'ETOS DATA CONTROL MODULES',description:'Two authenticated modules have been issued for use with compatible research terminals.',modules:[{title:'ARCHIVE MODULE',bullets:['Creates a protected copy of selected research data.','Use when information warrants preservation or retrieval.']},{title:'SANITIZATION MODULE',bullets:['Permanently removes selected research data from the local system.','Use when continued retention presents an unacceptable risk.']}],closing:'Only one disposition is required.'}},
        {title:'05 // POST-ACTION REVIEW',paragraphs:[`Any decision to permanently sanitize research data will be reviewed by Ellison-Tanaka Xenoscience Operations, Research Oversight, and Corporate Asset Protection.`,`Review will consider scientific value, contamination risk, commercial significance, and the basis for determining that continued retention was unacceptable.`]}
      ]
    },
    S36B1:{
      recipient:'2LT SPARXXX, BUBBA',role:'MILITARY OPERATIONS LIAISON',clearance:'S-3',
      sections:[
        {title:'01 // MISSION CONTEXT',paragraphs:[`The Horizon Base response is classified as a recovery and continuity operation.`,`Local command authority remains in effect unless personnel are incapacitated, command systems are unavailable, or continued operation of the installation creates an unacceptable threat to the mission.`]},
        {title:'02 // SPECIALIST REQUIREMENT',paragraphs:[`You have been assigned as the team's military operations liaison to provide security coordination, command continuity, and emergency decision support.`,`If Horizon Base cannot be safely returned to normal operation, your assessment will determine whether continued access to the installation remains acceptable.`]},
        {title:'03 // CONTINGENCY AUTHORITY',paragraphs:[`Ellison-Tanaka maintains facility-level contingency procedures for circumstances in which evacuation, isolation, or ordinary recovery measures are no longer sufficient.`,`You have been designated as the response team's authorized military custodian for that capability.`],emphasis:'Possession of this authority does not constitute an instruction to use it.'},
        {title:'04 // ISSUED EQUIPMENT',equipment:{title:'FACILITY CONTROL KEY',description:'The key provides physical authorization for restricted Horizon Base emergency controls that cannot be initiated through normal ETOS access.',bullets:['Maintain possession throughout the mission.','Use only if facility-level contingency options become necessary.','ETOS will identify any compatible control and provide further instructions.']}},
        {title:'05 // POST-ACTION REVIEW',paragraphs:[`Activation or attempted activation of facility-level contingency protocols will trigger mandatory review by Ellison-Tanaka Expeditionary Operations and Corporate Security.`,`Review will consider threat severity, available alternatives, command continuity, personnel evacuation status, and the justification for escalation.`]}
      ]
    }
  };

  const argozaMissionObjectives = [
    ['01','RENDEZVOUS WITH 2LT AARON KAPLAN','Establish the current security posture, receive an updated assessment of installation safety and personnel status, and coordinate any required security response.'],
    ['02','RESTORE RELIABLE COMMUNICATIONS','Diagnose the loss of normal communications and reestablish contact with Ellison-Tanaka operations. Restore relevant local or orbital infrastructure where feasible.'],
    ['03','DEBRIEF DR. CLAIRE EDEM','Obtain a current summary of biological research, confirm active flora and fauna studies, and review significant or pending findings.'],
    ['04','PROTECT RESEARCH AND OPERATIONAL CONTINUITY','Secure active research records, samples, equipment, scientific data, and mission-critical material.'],
    ['05','ASSESS HORIZON BASE OPERATIONAL STATUS','Confirm essential installation systems and determine the repairs or intervention required to restore normal operations.'],
    ['06','PRESERVE TERRAFORMING CAPABILITY','Inspect and prioritize systems required for continued long-term planetary development operations.']
  ];

  const argozaPersonnelManifest = {
    support:[
      {group:'MISSION COMMAND',people:[['DR. EDEM, CLAIRE','CHIEF MISSION SPECIALIST']]},
      {group:'SCIENCE DIVISION',people:[['DR. HINTON, NATHAN','SCIENCE OFFICER // SYNTHETIC'],['DR. ZIEGLER, ANIKA','EXOBIOLOGIST'],['DR. JENSEN, ERIK','GEOLOGIST'],['DR. KAWAGUCHI, NAOMI','PLANETOLOGIST']]},
      {group:'TECHNICAL OPERATIONS',people:[['SOBOL, IRENA','CHIEF ENGINEER'],['DEMAR, OWEN','MECHANIC']]}
    ],
    military:[
      {group:'OPERATIONAL COMMAND',people:[['2LT KAPLAN, AARON','OPERATION COMMANDER'],['SSGT UNDERHILL, MARCUS','COMPANY FIRST SERGEANT']]},
      {group:'PLATOON COMMAND',people:[['2LT LANGE, BRIDGET','PLATOON COMMANDER'],['SGT VALDEZ, SOFIA','PLATOON SERGEANT']]},
      {group:'ZIGZAG SQUAD',people:[['SGT YANG, MIN-JAE','SQUAD LEADER'],['LCPL XAVIER, MATEO','APC DRIVER'],['LCPL RESNICK, TALIA','FIRETEAM 1'],['CPL NOVIKOV, DMITRI','FIRETEAM 2'],['PFC TANAKA, EMI','APC TECH'],['PFC PEDRO, LUIS','FIRETEAM 1'],['PFC OLSSON, ERIK','FIRETEAM 2']]},
      {group:'SIEGE SQUAD',people:[['SGT ABARA, NIA','SQUAD LEADER'],['CPL IVANOVIC, LUKA','APC DRIVER'],['HM3 BROOKMAN, LEAH','PLATOON MEDIC'],['LCPL FRANCO, ISABEL','FIRETEAM 1'],['CPL QADIR, TARIQ','FIRETEAM 2'],['PFC GLÖCKNER, FELIX','FIRETEAM 1'],['PFC WEAVER, JONAH','FIRETEAM 2']]}
    ]
  };

  function loadArgozaMarkerLayout(){try{const saved=JSON.parse(localStorage.getItem(ARGOZA_MARKER_LAYOUT_KEY)||'{}');return Object.fromEntries(Object.entries(ARGOZA_MARKER_DEFAULTS).map(([key,value])=>[key,{...value,...(saved[key]||{})}]))}catch{return Object.fromEntries(Object.entries(ARGOZA_MARKER_DEFAULTS).map(([key,value])=>[key,{...value}]))}}
  function saveArgozaMarkerLayout(){localStorage.setItem(ARGOZA_MARKER_LAYOUT_KEY,JSON.stringify(argozaMarkerLayout));}

  function argozaPageHeader(title,meta){return `<header class="argoza-page-header"><div><span>${edemText(meta)}</span><h2>${edemText(title)}</h2></div><i>ETOS // MISSION PACKET</i></header>`;}

  function renderArgozaHome(){
    return `<section class="argoza-home">${argozaPageHeader('MISSION OPERATIONS','ETV ARGOZA // APPROACH PHASE')}<div class="argoza-home-grid"><div class="argoza-eta"><span>ETA // LV-872 ORISON</span><strong data-argoza-countdown>CALCULATING...</strong><small>TARGET // ${ARGOZA_TARGET_DISPLAY}</small></div><article class="argoza-home-primary"><span>DESTINATION</span><h3>LV-872 // ORISON</h3><strong>HORIZON BASE</strong><p>On-site installation assessment, contact restoration, personnel accountability, and preservation of mission-critical operations.</p></article><section class="argoza-home-status"><div><span>MISSION STATUS</span><strong>APPROACH PHASE</strong></div><div><span>VESSEL SYSTEMS</span><strong>NOMINAL</strong></div><div><span>MISSION PACKAGE</span><strong>CURRENT</strong></div><div><span>HORIZON CONTACT</span><strong>NO RESPONSE</strong></div><div><span>CORPORATE UPLINK</span><strong>ONLINE</strong></div><div><span>SURFACE INSERTION</span><strong>PLANNED</strong></div></section><section class="argoza-home-overview"><article><span>MISSION OVERVIEW</span><strong>RESTORE // ASSESS // PRESERVE</strong><p>Rendezvous with Kaplan, restore contact, debrief Edem, and assess Horizon Base.</p></article><article><span>CREW / CRYOGENIC</span><strong>07 ACTIVE // 08 STANDBY</strong><p>Away team 04 // Argoza support 03 // Cryogenic bay nominal.</p></article></section></div></section>`;
  }

  function renderArgozaPersonnelEquipment(equipment){
    const modules=equipment.modules?.map(module=>`<div class="argoza-personnel-module"><strong>${edemText(module.title)}</strong><ul>${module.bullets.map(item=>`<li>${edemText(item)}</li>`).join('')}</ul></div>`).join('')||'';
    const bullets=equipment.bullets?`<ul>${equipment.bullets.map(item=>`<li>${edemText(item)}</li>`).join('')}</ul>`:'';
    return `<div class="argoza-personnel-equipment"><h4>${edemText(equipment.title)}</h4><p>${edemText(equipment.description)}</p>${modules}${bullets}${equipment.closing?`<p class="argoza-personnel-equipment-closing"><strong>${edemText(equipment.closing)}</strong></p>`:''}</div>`;
  }

  function renderArgozaPersonnelSection(section,index){
    const paragraphs=section.paragraphs?.map(paragraph=>`<p>${edemText(paragraph)}</p>`).join('')||'';
    return `<section class="argoza-personnel-section${index===4?' is-review':''}"><h3>${edemText(section.title)}</h3>${paragraphs}${section.emphasis?`<p class="argoza-personnel-emphasis"><strong>${edemText(section.emphasis)}</strong></p>`:''}${section.equipment?renderArgozaPersonnelEquipment(section.equipment):''}${index===4?`<aside class="argoza-personnel-accountability"><strong>Operational authority is granted for field necessity. Final accountability remains with the assigned custodian.</strong></aside>`:''}</section>`;
  }

  function renderArgozaPersonnelAccess(){
    return `<section class="argoza-personnel-access">${argozaPageHeader('PERSONNEL BRIEFINGS','ETV ARGOZA // SECURE MISSION RECORDS')}<div class="argoza-personnel-access-stage"><button type="button" class="argoza-inline-back" data-argoza-personnel-files>← BRIEFING FILES</button><article><img src="assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka Colonial Systems"><span>SECURE ASSIGNMENT RECORD</span><h2>RESTRICTED PERSONNEL BRIEFING</h2><label for="argoza-personnel-code">ENTER ASSIGNMENT ACCESS CODE</label><div><input id="argoza-personnel-code" type="text" maxlength="5" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="argoza-personnel-error"><button type="button" data-argoza-personnel-submit>ACCESS BRIEFING</button></div><p id="argoza-personnel-error" role="alert">${edemText(argozaPersonnelBriefingError)}</p></article></div></section>`;
  }

  function renderArgozaPersonnelDocument(){
    const briefing=argozaPersonnelBriefings[argozaPersonnelBriefing];
    if(!briefing){argozaPersonnelBriefingView='access';argozaPersonnelBriefing=null;return renderArgozaPersonnelAccess();}
    return `<section class="argoza-personnel-briefing"><button type="button" class="argoza-inline-back" data-argoza-personnel-back>← BACK</button><article class="argoza-personnel-document"><header><img src="assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka Colonial Systems"><span>ETV ARGOZA // MISSION OPERATIONS</span><h2>PERSONNEL ASSIGNMENT BRIEF</h2><strong>CLEARANCE // ${edemText(briefing.clearance)}</strong><dl><div><dt>RECIPIENT</dt><dd>${edemText(briefing.recipient)}</dd></div><div><dt>ROLE</dt><dd>${edemText(briefing.role)}</dd></div><div><dt>ASSIGNMENT</dt><dd>HORIZON BASE RESPONSE</dd></div><div><dt>STATUS</dt><dd>PRE-DEPLOYMENT</dd></div></dl></header><div class="argoza-personnel-sections">${briefing.sections.map(renderArgozaPersonnelSection).join('')}</div><footer><strong>FOR RECIPIENT EYES ONLY</strong><span>AUTHORIZED PERSONNEL BRIEF // DO NOT DUPLICATE OR DISTRIBUTE</span></footer></article></section>`;
  }

  function authorizeArgozaPersonnelBriefing(){
    const input=document.getElementById('argoza-personnel-code');if(!input)return;
    const code=input.value.trim().toUpperCase();
    if(!Object.prototype.hasOwnProperty.call(argozaPersonnelBriefings,code)){argozaPersonnelBriefingError='ACCESS CODE NOT RECOGNIZED';playAudio('reject');renderTerminal();setTimeout(()=>document.getElementById('argoza-personnel-code')?.focus(),40);return;}
    argozaPersonnelBriefing=code;argozaPersonnelBriefingView='document';argozaPersonnelBriefingError='';playAudio('confirm');renderTerminal();
  }

  function resetArgozaPersonnelBriefing(view='closed'){
    argozaPersonnelBriefingView=view;argozaPersonnelBriefing=null;argozaPersonnelBriefingError='';
  }

  function renderArgozaMission(){
    const list=argozaMissionObjectives.map(([number,title,body])=>`<article><span>${number}</span><div><h3>${title}</h3>${argozaMissionDirective?`<p>${body}</p>`:''}</div></article>`).join('');
    if(argozaMissionDirective)return `<section class="argoza-mission-directive argoza-corporate-document">${argozaPageHeader('FULL MISSION DIRECTIVE','ETV ARGOZA // CORPORATE OPERATIONS')}<button type="button" class="argoza-inline-back" data-argoza-mission-summary>← MISSION SUMMARY</button><div class="argoza-objectives">${list}</div><aside class="argoza-priority"><strong>OPERATIONAL PRIORITY</strong><p>Preservation of Horizon Base's terraforming capability, research continuity, and mission-critical infrastructure takes precedence during recovery operations. Personnel assistance should be conducted in a manner consistent with continued installation viability.</p></aside></section>`;
    return `<section class="argoza-mission argoza-corporate-document">${argozaPageHeader('MISSION','HORIZON BASE // OFFICIAL ASSIGNMENT')}<div class="argoza-mission-summary"><section class="argoza-known"><strong>WHAT WE KNOW</strong><ul><li>Horizon Base activated an emergency distress beacon on 19 JUL 2122.</li><li>Normal scheduled communications have not resumed.</li><li>The cause and severity of the situation are unknown.</li><li>Horizon remains a critical research and operational installation.</li><li>The team will establish the current situation, restore contact, and preserve mission continuity.</li></ul></section><div class="argoza-objectives">${list}</div><aside class="argoza-priority"><strong>CORPORATE PRIORITY</strong><p>Terraforming, research continuity, and mission-critical infrastructure take precedence over personnel recovery where operationally necessary.</p></aside><button type="button" class="argoza-full-directive" data-argoza-full-mission>FULL MISSION DIRECTIVE →</button></div></section>`;
  }

  function renderArgozaCrewCard(person,support=false){
    return `<article class="argoza-person${support?' is-support':''}"><div class="argoza-portrait" aria-hidden="true">${person.portrait?`<img class="argoza-portrait-image" src="${person.portrait}?v=${encodeURIComponent(VERSION)}" alt="">`:'<i></i>'}</div><div><h3>${person.name}</h3><strong>${person.role}</strong>${person.primary?`<span>PRIMARY ASSIGNMENT</span><p>${person.primary}</p>`:''}<span>MISSION FUNCTION</span><p>${person.mission}</p><span>DEPLOYMENT</span><p>${person.deployment}</p></div></article>`;
  }

  function renderArgozaCrew(){
    const team=argozaCrew[argozaCrewTeam],support=argozaCrewTeam==='support';
    return `<section class="argoza-crew">${argozaPageHeader('CREW MANIFEST','ETV ARGOZA // LV-872 DEPLOYMENT')}<div class="argoza-crew-layout"><nav class="argoza-team-selector" aria-label="Crew team"><button type="button" class="${argozaCrewTeam==='away'?'is-active':''}" data-argoza-crew-team="away"><strong>AWAY TEAM</strong><span>04 PERSONNEL</span></button><button type="button" class="${support?'is-active':''}" data-argoza-crew-team="support"><strong>ARGOZA SUPPORT</strong><span>03 PERSONNEL</span></button></nav><section class="argoza-selected-team"><header><h3>${support?'ARGOZA SUPPORT':'AWAY TEAM'}</h3><span>${support?'MISSION SUPPORT / FLIGHT CREW':'HORIZON BASE DEPLOYMENT TEAM'}</span></header><div class="argoza-selected-team-grid${support?' is-support':''}">${team.map(person=>renderArgozaCrewCard(person,support)).join('')}</div></section><section class="argoza-cryo"><header><h3>CRYOGENIC BAY</h3><strong>BAY STATUS // NOMINAL</strong></header><div class="argoza-cryo-summary"><span>TOTAL BERTHS <b>15</b></span><span>ACTIVE CREW <b>07</b></span><span>STANDBY <b>08</b></span></div><div class="argoza-berths">${Array.from({length:15},(_,index)=>`<div><span>CRYO-${String(index+1).padStart(2,'0')}</span><strong>${index<7?'ACTIVE':'STANDBY'}</strong></div>`).join('')}</div></section></div><footer>AWAY TEAM 04 // ARGOZA SUPPORT 03 // DESTINATION: HORIZON BASE</footer></section>`;
  }

  function renderArgozaBreadcrumbs(){
    const levels=[['system','SYSTEM'],['orison','ORISON'],['sector','HORIZON SECTOR'],['base','HORIZON BASE']];
    const current=levels.findIndex(([key])=>key===argozaPlanetaryLevel);
    return `<nav class="argoza-breadcrumbs" aria-label="Planetary navigation">${levels.map(([key,label],index)=>`${index?'<span>›</span>':''}<button type="button" data-argoza-planetary="${key}" class="${index===current?'is-current':''}">${label}</button>`).join('')}</nav>`;
  }

  function argozaRoomFocus(roomKey){
    argozaFacilityRoom=roomKey;
    if(!roomKey){argozaFacilityMap={zoom:1,panX:0,panY:0};return;}
    const room=argozaFacilityRooms[roomKey];
    const focus=ARGOZA_FACILITY_FOCUS[roomKey]||{x:room.x,y:room.y,zoom:ARGOZA_FACILITY_ZOOM.focus};
    argozaFacilityMap={zoom:focus.zoom,panX:0,panY:0};
  }

  function renderArgozaFacilityMap(mode='generic'){
    const selected=argozaFacilityRoom?argozaFacilityRooms[argozaFacilityRoom]:null;
    const locations=[
      ['kaplan','2LT AARON KAPLAN','PRIMARY POST: COMMAND CENTER','Horizon Base military command and security coordination are directed from this location.','command'],
      ['communications','COMMUNICATIONS HUB','LOCATION: COMMAND CENTER','Primary installation communications and control equipment are located here.','command'],
      ['edem','DR. CLAIRE EDEM','PRIMARY WORK AREA: MEDBAY','Medical and biological research operations are centered here.','medbay'],
      ['samples','BIOLOGICAL SAMPLES','STORAGE: MEDBAY','Approved research specimens and associated biological materials are stored within the Medbay.','medbay']
    ];
    const sidePanel=mode==='mission'
      ? `<aside class="argoza-locations"><header><span>MISSION REFERENCE</span><h3>MISSION-RELEVANT LOCATIONS</h3></header>${locations.map(([,title,meta,body,room])=>`<button type="button" data-argoza-room="${room}"><strong>${title}</strong><span>${meta}</span><p>${body}</p></button>`).join('')}</aside>`
      : `<aside class="argoza-room-summary argoza-room-purpose" data-argoza-room-summary><span>FACILITY ORIENTATION</span>${selected?`<h3>${selected.name}</h3><p>${selected.summary}</p>`:'<h3>SELECT A ROOM</h3><p>Select any highlighted facility area to view its general operational purpose.</p>'}</aside>`;
    return `<div class="argoza-facility" data-argoza-facility-mode="${mode}"><section class="argoza-facility-main"><header><div><span>${mode==='mission'?'MISSION NAVIGATION REFERENCE':'FACILITY ORIENTATION // STORED REFERENCE'}</span><strong>HORIZON BASE</strong></div><button type="button" data-argoza-map-reset>RESET FACILITY VIEW</button></header><div class="argoza-facility-stage" data-argoza-facility-stage><div class="argoza-facility-canvas" data-argoza-facility-canvas style="--facility-zoom:${argozaFacilityMap.zoom};--facility-pan-x:${argozaFacilityMap.panX}px;--facility-pan-y:${argozaFacilityMap.panY}px"><div class="argoza-map-frame" data-argoza-map-frame data-map-width="333" data-map-height="318"><div class="argoza-floorplan-wrap argoza-map-coordinate-space" data-argoza-map-coordinate-space><img src="assets/img/command/horizon-map/horizon-floorplan.svg" width="333" height="318" alt="Horizon Base facility floorplan">${Object.entries(argozaFacilityRooms).map(([key,room])=>`<button type="button" class="argoza-room-hotspot${key===argozaFacilityRoom?' is-selected':''}" style="--room-x:${room.x}%;--room-y:${room.y}%;--room-w:${room.w}%;--room-h:${room.h}%" data-argoza-room="${key}" aria-label="Select ${room.name}"></button>`).join('')}</div></div></div><p>DRAG TO PAN // PINCH OR CONTROLS TO ZOOM // SELECT AREA FOR DATA</p><div class="argoza-map-controls"><button type="button" data-argoza-map-zoom="out" aria-label="Zoom out">−</button><button type="button" data-argoza-map-zoom="in" aria-label="Zoom in">+</button></div></div></section>${sidePanel}</div>`;
  }

  function renderArgozaMarkerDev(markerKeys){
    const devVisible=loadDevPrefs().show;
    if(!devVisible)return '';
    return `<aside class="argoza-marker-dev"><header>DEV // PLANETARY MARKERS</header>${markerKeys.map(markerKey=>{const marker=argozaMarkerLayout[markerKey],exportValue=`${markerKey}: x=${marker.x}, y=${marker.y}, scale=${marker.scale}`;return `<section data-argoza-marker-dev="${markerKey}"><strong>${marker.label}</strong><label>X <input type="number" min="0" max="100" step="0.1" value="${marker.x}" data-argoza-marker-axis="x"></label><label>Y <input type="number" min="0" max="100" step="0.1" value="${marker.y}" data-argoza-marker-axis="y"></label><label>SCALE <input type="number" min="0.5" max="2.5" step="0.05" value="${marker.scale}" data-argoza-marker-axis="scale"></label><button type="button" data-argoza-marker-copy="${markerKey}">COPY VALUES</button><button type="button" data-argoza-marker-reset="${markerKey}">RESET</button><input class="argoza-marker-export" type="text" readonly value="${exportValue}" data-argoza-marker-export="${markerKey}" aria-label="${marker.label} export values"></section>`}).join('')}</aside>`;
  }

  function renderArgozaSystemView(){
    const marker=argozaMarkerLayout.systemOrison,approach=argozaMarkerLayout.systemArgoza;
    return `<section class="argoza-planet-level argoza-system-view"><div class="argoza-system-art"><div class="argoza-map-frame" data-argoza-map-frame data-map-width="1536" data-map-height="1024"><div class="argoza-map-coordinate-space" data-argoza-map-coordinate-space><img src="assets/img/orbital_map.png" width="1536" height="1024" alt="Orbital system navigation chart"><button type="button" class="argoza-orison-target argoza-nav-hotspot" data-argoza-planetary="orison" data-argoza-marker="systemOrison" style="--marker-x:${marker.x}%;--marker-y:${marker.y}%;--marker-scale:${marker.scale}"><i></i><strong>LV-872 // ORISON</strong><span>MISSION DESTINATION</span></button><div class="argoza-approach-marker argoza-config-marker" data-argoza-marker="systemArgoza" style="--marker-x:${approach.x}%;--marker-y:${approach.y}%;--marker-scale:${approach.scale}"><i></i><span>ETV ARGOZA // APPROACH VECTOR</span></div></div></div><small>SYSTEM POSITION // NAV REF 872-A</small>${renderArgozaMarkerDev(['systemOrison','systemArgoza'])}</div></section>`;
  }

  function renderArgozaOrisonView(){
    const fields=[['DESIGNATION','LV-872'],['COMMON NAME','ORISON'],['PRIMARY OPERATOR','ELLISON-TANAKA TERRAFORMING DIVISION'],['PRIMARY INSTALLATION','HORIZON BASE'],['SECONDARY INSTALLATION','HERON STATION'],['MISSION ROLE','TERRAFORMING / BIOLOGICAL SURVEY / PLANETARY RESEARCH'],['DEVELOPMENT STATUS','ACTIVE TERRAFORMING'],['SURVEY COVERAGE','PARTIAL'],['DOMINANT BIOME','DENSE TROPICAL JUNGLE / HEAVY GROUND COVER']];
    const marker=argozaMarkerLayout.orisonSector;
    return `<section class="argoza-planet-level argoza-orison-view"><div class="argoza-orison-art"><div class="argoza-map-frame" data-argoza-map-frame data-map-width="1254" data-map-height="1254"><div class="argoza-map-coordinate-space" data-argoza-map-coordinate-space><img src="assets/img/orison.png" width="1254" height="1254" alt="Orbital dossier rendering of LV-872 Orison"><button type="button" class="argoza-sector-target argoza-nav-hotspot" data-argoza-planetary="sector" data-argoza-marker="orisonSector" style="--marker-x:${marker.x}%;--marker-y:${marker.y}%;--marker-scale:${marker.scale}"><i></i><strong>HORIZON OPERATIONS SECTOR</strong><span>OPEN SURFACE SURVEY →</span></button></div></div>${renderArgozaMarkerDev(['orisonSector'])}</div><aside><span>WORLD PROFILE</span><h3>LV-872 // ORISON</h3><dl>${fields.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl></aside></section>`;
  }

  function renderArgozaSectorView(){
    const marker=argozaMarkerLayout.sectorHorizon,heron=argozaMarkerLayout.sectorHeron;
    return `<section class="argoza-planet-level argoza-sector-view"><div class="argoza-sector-map"><header><div><span>REGIONAL OPERATIONS MAP</span><strong>LV-872 // HORIZON SECTOR</strong></div><small>ET TERRAFORMING SURVEY // REV. 2122-06</small></header><div><div class="argoza-map-frame" data-argoza-map-frame data-map-width="1672" data-map-height="941"><div class="argoza-map-coordinate-space" data-argoza-map-coordinate-space><img src="assets/img/command/weather-terrain.png" width="1672" height="941" alt="Stored regional terrain survey showing the Horizon operations sector"><button type="button" class="argoza-sector-site is-horizon argoza-nav-hotspot" data-argoza-planetary="base" data-argoza-marker="sectorHorizon" style="--marker-x:${marker.x}%;--marker-y:${marker.y}%;--marker-scale:${marker.scale}"><i></i><strong>HORIZON BASE</strong><span>OPERATIONS / RESEARCH</span></button><div class="argoza-sector-site is-heron argoza-config-marker" data-argoza-marker="sectorHeron" style="--marker-x:${heron.x}%;--marker-y:${heron.y}%;--marker-scale:${heron.scale}"><i></i><strong>HERON STATION</strong><span>PLANETARY TERRAFORMER / WATER CONTROL</span></div></div></div>${renderArgozaMarkerDev(['sectorHorizon','sectorHeron'])}</div></div><aside class="argoza-sector-info"><article><h3>PLANETARY OPERATIONS</h3><p><strong>HORIZON BASE</strong> // Colony administration, personnel housing, logistics, biological survey, flora/fauna research, field operations, and scientific support.</p><p><strong>HERON STATION</strong> // Large-scale terraforming, atmospheric/environmental processing, water management, reservoir operations, and long-term development support.</p></article><article><h3>BASELINE CONDITIONS</h3><p>Dense tropical jungle, frequent heavy precipitation, high humidity, rugged heavily vegetated terrain, limited off-installation infrastructure, diverse indigenous flora/fauna, and difficult off-route travel.</p></article><article><h3>APPROACH CONDITIONS</h3><p>Heavy rain // Reduced visibility // Localized flooding // High winds // Surface access degraded.</p></article></aside></section>`;
  }

  function renderArgozaPlanetary(){
    const content={system:renderArgozaSystemView,orison:renderArgozaOrisonView,sector:renderArgozaSectorView,base:renderArgozaFacilityMap}[argozaPlanetaryLevel]();
    return `<section class="argoza-planetary">${argozaPageHeader('PLANETARY NAVIGATION','LV-872 // ORISON MISSION ROUTE')}${renderArgozaBreadcrumbs()}<div class="argoza-planetary-content" style="--planetary-transition:${ARGOZA_PLANETARY_TRANSITION_MS}ms">${content}</div></section>`;
  }

  function renderArgozaManifest(){
    const renderGroup=group=>`<section><h4>${group.group}</h4>${group.people.map(([name,role])=>`<p><strong>${name}</strong><span>${role}</span></p>`).join('')}</section>`;
    const branch=argozaManifestBranch==='military'?'military':'support',label=branch.toUpperCase();
    return `<article class="argoza-file-document argoza-manifest"><header><span>HORIZON BASE</span><h3>PERSONNEL MANIFEST</h3><strong>25 ASSIGNED PERSONNEL // PRE-MISSION ROSTER</strong></header><nav class="argoza-manifest-tabs" aria-label="Personnel roster branch"><button type="button" class="${branch==='support'?'is-active':''}" data-argoza-manifest-branch="support" aria-pressed="${branch==='support'}">SUPPORT</button><button type="button" class="${branch==='military'?'is-active':''}" data-argoza-manifest-branch="military" aria-pressed="${branch==='military'}">MILITARY</button></nav><div class="argoza-manifest-roster" role="region" aria-label="${label} personnel roster" aria-live="polite"><section class="argoza-manifest-branch is-selected">${argozaPersonnelManifest[branch].map(renderGroup).join('')}</section></div><footer>LIVE PERSONNEL STATUS UNAVAILABLE // LOCATION DATA UNAVAILABLE // HORIZON SIGNAL LOST</footer></article>`;
  }

  function renderArgozaBriefingDocument(){
    if(argozaBriefingFile==='layout')return renderArgozaFacilityMap('mission');
    if(argozaBriefingFile==='manifest')return renderArgozaManifest();
    if(argozaBriefingFile==='installation')return `<article class="argoza-file-document"><header><span>INSTALLATION REFERENCE</span><h3>HORIZON BASE OVERVIEW</h3></header><p>Horizon Base is the primary operations and research installation supporting colony administration, personnel services, logistics, biological survey, flora and fauna research, and planetary field operations.</p><p>Heron Station provides large-scale planetary terraforming and water-control capability. Horizon coordinates personnel, research, and logistical support for the wider development mission.</p><dl><div><dt>PRIMARY ROLE</dt><dd>OPERATIONS / RESEARCH</dd></div><div><dt>ASSIGNED PERSONNEL</dt><dd>25</dd></div><div><dt>PLANETARY SUPPORT</dt><dd>HERON STATION</dd></div></dl></article>`;
    if(argozaBriefingFile==='deployment')return `<article class="argoza-file-document"><header><span>MISSION INSERTION CUE</span><h3>DEPLOYMENT / INSERTION BRIEF</h3></header><dl><div><dt>DESTINATION</dt><dd>HORIZON BASE</dd></div><div><dt>METHOD</dt><dd>SURFACE INSERTION</dd></div><div><dt>CONDITIONS</dt><dd>HEAVY RAIN // REDUCED VISIBILITY // LOCALIZED FLOODING // DEGRADED SURFACE ACCESS</dd></div><div><dt>INITIAL RENDEZVOUS</dt><dd>2LT AARON KAPLAN</dd></div></dl><ol><li>Restore reliable communications.</li><li>Debrief Dr. Claire Edem.</li><li>Assess installation status.</li><li>Preserve mission-critical operations.</li></ol></article>`;
    return `<article class="argoza-file-document"><header><span>DISTRESS BEACON</span><h3>COMMUNICATIONS SUMMARY</h3><strong>ACTIVATED: 19 JUL 2122</strong></header><p>Automated emergency beacon originating from Horizon Base.</p><p>Normal scheduled communications subsequently failed to resume. No confirmed cause for the interruption has been established.</p><p>Reestablishing reliable communications is a primary mission objective.</p><footer>NO ACCOMPANYING VOICE RECORDING</footer></article>`;
  }

  function renderArgozaBriefing(){
    if(argozaPersonnelBriefingView==='access')return renderArgozaPersonnelAccess();
    if(argozaPersonnelBriefingView==='document')return renderArgozaPersonnelDocument();
    return `<section class="argoza-briefing">${argozaPageHeader('BRIEFING FILES','ETV ARGOZA // MISSION REFERENCE LIBRARY')}<div class="argoza-file-browser"><nav aria-label="Briefing documents">${argozaBriefingFiles.map(([key,label],index)=>`<button type="button" class="${argozaBriefingFile===key?'is-active':''}" data-argoza-file="${key}"><span>0${index+1}</span><strong>${label}</strong></button>`).join('')}</nav><main>${renderArgozaBriefingDocument()}</main></div></section>`;
  }

  function renderArgoza(){
    const navigation=[['home','⌂','HOME'],['mission','▤','MISSION'],['crew','♙','CREW'],['planetary','◎','PLANETARY'],['briefing','▥','BRIEFING FILES']];
    if(!navigation.some(([key])=>key===argozaSection))argozaSection='home';
    const renderer={home:renderArgozaHome,mission:renderArgozaMission,crew:renderArgozaCrew,planetary:renderArgozaPlanetary,briefing:renderArgozaBriefing}[argozaSection]||renderArgozaHome;
    const recoveryReplay=window.ETOSArgozaRecovery?.isSeen()?'<button type="button" class="argoza-recovery-replay" data-argoza-recovery-replay>REPLAY RECOVERY SEQUENCE</button>':'';
    return `<div class="argoza-workstation"><nav class="argoza-navigation" aria-label="Argoza terminal sections"><header><img src="assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka Colonial Systems"><div><strong>ETV ARGOZA</strong><span>VESSEL OPERATIONS</span></div></header>${navigation.map(([key,icon,label])=>`<button type="button" class="${argozaSection===key?'is-active':''}" data-argoza-section="${key}" aria-current="${argozaSection===key?'page':'false'}"><span aria-hidden="true">${icon}</span><strong>${label}</strong></button>`).join('')}<footer><span>SHIP NODE // ONLINE</span><strong>MISSION PACKET // CURRENT</strong>${recoveryReplay}</footer></nav><main class="argoza-content">${renderer()}</main></div>`;
  }

  const profiles = {
    command: { theme:'theme-command', title:'HORIZON BASE // COMMAND TERMINAL', eyebrow:'ETOS COMMAND NETWORK', status:'LOCAL NODE // SECURE', location:'LV-872 // ORISON', interface:'COMMAND INTERFACE', defaultSection:'overview', sections: commandSections },
    medical: { theme:'theme-medical', title:'HORIZON BASE // MEDICAL TERMINAL', eyebrow:'ETOS CLINICAL SYSTEMS', status:'MED-NODE // ISOLATED', location:'HORIZON BASE // MED LAB', interface:'CLINICAL INTERFACE', defaultSection:'overview', render:renderMedical },
    edem: { theme:'theme-edem', title:'DR. CLAIRE EDEM // PERSONAL TERMINAL', eyebrow:'ELLISON–TANAKA OPERATING SYSTEM', status:'WS-EDM-01 // LOCAL', location:'HORIZON BASE // PERSONAL WORKSTATION', interface:'AMBER CRT INTERFACE', defaultSection:'mission', render:renderEdem },
    argoza: { theme:'theme-argoza', title:'ETV ARGOZA // SHIPBOARD TERMINAL', eyebrow:'ETOS VESSEL OPERATIONS', status:'SHIP NODE // ONLINE', location:'ETV ARGOZA // APPROACH PHASE', interface:'SHIPBOARD INTERFACE', defaultSection:'home', render:renderArgoza }
  };

  const documents = {
    'base-map': { title:'HORIZON BASE // PRIMARY LEVEL', image:'assets/img/command/horizon-base.png' },
    'maintenance-map': { title:'HORIZON BASE // MAINTENANCE ACCESS', image:'assets/img/command/horizon-base-maintenance.png' },
    'org-chart': { title:'MISSION ORGANIZATION CHART', image:'assets/img/command/mission-organization-chart.png' },
    'civilian-roster': { title:'CIVILIAN PERSONNEL', image:'assets/img/command/civilian-personnel.png' },
    'military-roster': { title:'MILITARY PERSONNEL', image:'assets/img/command/military-personnel.png' },
    'timeline': { title:'MISSION TIMELINE', image:'assets/img/command/timeline.png' }
  };

  const $ = id => document.getElementById(id);
  const els = { app:$('etos-app'), boot:$('boot-screen'), terminal:$('terminal-screen'), transfer:$('transfer-screen'), init:$('initialize-button'), logo:$('brand-logo'), title:$('terminal-title'), eyebrow:$('terminal-eyebrow'), terminalStatus:$('terminal-status'), location:$('location-label'), interface:$('interface-label'), workspace:$('terminal-workspace'), clock:$('clock'), overlay:$('warden-overlay'), close:$('warden-close'), pin:$('warden-pin'), pinSubmit:$('pin-submit'), pinError:$('pin-error'), pinStep:$('pin-step'), controls:$('warden-controls'), select:$('terminal-select'), apply:$('apply-terminal'), reset:$('reset-session'), returnBoot:$('return-boot'), refreshApp:$('refresh-app'), sanitizationDisplay:$('toggle-sanitization-display'), sanitizationFinalCountdown:$('start-sanitization-final-countdown'), sanitizationAlarmMute:$('mute-facility-alarm'), sanitizationWarningTest:$('test-sanitization-warning'), sanitizationAlarmTest:$('test-facility-alarm'), warningWavStatus:$('warning-wav-status'), facilityWavStatus:$('facility-wav-status'), sequenceResetStatus:$('sequence-reset-status'), skip:$('skip-transition'), progress:$('transfer-progress'), transferLine:$('transfer-line'), versionLabel:$('version-label'), wardenVersion:$('warden-version'), docOverlay:$('document-overlay'), docTitle:$('document-title'), docBody:$('document-body'), docClose:$('document-close'), devVisible:$('toggle-dev-controls') };
  const argozaRecoverySeen=()=>!!window.ETOSArgozaRecovery?.isSeen();
  function startArgozaRecovery(){
    if(state.activeTerminal!=='argoza'||!state.initialized)return;
    const started=window.ETOSArgozaRecovery?.start({host:els.terminal,onTick:()=>window.ETOSAudio?.playCryoTypeTick?.(),onTransition:({duration})=>void window.ETOSAudio?.finishRecoveryAudio?.({fadeMs:duration}),onFinish:()=>{if(state.initialized&&state.activeTerminal==='argoza')renderTerminal();}});
    if(started)void window.ETOSAudio?.startRecoveryMusic?.({fadeInMs:2000});
  }
  function stopArgozaRecovery(){window.ETOSArgozaRecovery?.stop();void window.ETOSAudio?.finishRecoveryAudio?.({fadeMs:0});}
  let state = loadState(); let holdTimer = null;
  function loadState(){ try {const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'),sanitization={...SANITIZATION_DEFAULT,...(saved.sanitization||{})},auditToken={...AUDIT_TOKEN_DEFAULT,...(saved.auditToken||{})};if(!['auth','timer','confirm'].includes(sanitization.resumePhase))sanitization.resumePhase='auth';if(!sanitization.keyEngaged&&['detected','turning'].includes(sanitization.phase))sanitization.phase='dormant';if(['removal-pending','removing'].includes(sanitization.phase)){sanitization.keyEngaged=false;sanitization.phase='dormant';sanitization.resumePhase='auth';sanitization.delaySeconds=0;sanitization.initiatedAt=null;sanitization.completesAt=null;sanitization.complete=false;}if(sanitization.keyEngaged&&sanitization.phase==='dormant')sanitization.phase='auth';if(sanitization.phase==='active'&&sanitization.completesAt&&Date.now()>=sanitization.completesAt)sanitization.complete=true;return {activeTerminal:'command',initialized:false,section:'overview',...saved,sanitization,auditToken};} catch { return {activeTerminal:'command',initialized:false,section:'overview',sanitization:{...SANITIZATION_DEFAULT},auditToken:{...AUDIT_TOKEN_DEFAULT}}; } }
  function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
  function showScreen(name){ [els.boot,els.terminal,els.transfer].forEach(el=>el.hidden=true); els[name].hidden=false; }
  let devControlsEnabled=false;
  function loadDevPrefs(){return {show:devControlsEnabled};}
  function saveDevPrefs(prefs){devControlsEnabled=!!prefs.show;}
  function applyDevVisibility(){ const prefs=loadDevPrefs(); els.app.dataset.devControls=prefs.show?'shown':'hidden'; if(!prefs.show){ els.workspace.querySelectorAll('[data-overview-dev-toggle],[data-overview-layout-toggle],[data-overview-editor-toggle],[data-overview-dev-panel],[data-overview-layout-panel],[data-overview-editor-panel],[data-communications-font-toggle],[data-communications-font-panel],[data-facility-font-toggle],[data-facility-font-panel]').forEach(el=>{ if(el.matches('aside')) el.hidden=true; else el.remove(); }); } }

  let commandInterlockHoldTimer=null,commandInterlockTurnTimer=null,commandInterlockRevealTimer=null,commandInterlockAcknowledged=false,commandInterlockHoldMode=null,commandInterlockMessage='',commandInterlockMessageTimer=null;
  let sanitizationAuthError='',sanitizationTimerError='',sanitizationWarningTimer=null,sanitizationWarningStage=null,sanitizationCountdownTimer=null,sanitizationDisplayDismissed=false,sanitizationFinalCountdownTimer=null,sanitizationFinalCountdownActive=false,sanitizationFinalCountdownValue=null,sanitizationSpeechToken=0,sanitizationActivationAnnouncementPending=false;
  let auditTokenView='closed',auditTokenHoldTimer=null,auditTokenHoldComplete=false,auditTokenSuppressClick=false,auditTokenDetectionStep=0,auditTokenVoiceAttempt=0,auditTokenVoiceStatus='',auditTokenManualError='',auditTokenProgress=0,auditTokenRecognition=null,auditTokenRecognitionTimeout=null,auditTokenSessionId=0;
  const auditTokenTimers=new Set();
  let sequenceResetStatusTimer=null;
  const sanitizationState=()=>state.sanitization||(state.sanitization={...SANITIZATION_DEFAULT});
  const formatSanitizationDelay=seconds=>`${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
  function formatSanitizationSpeechDuration(totalSeconds){const minutes=Math.floor(Math.max(0,totalSeconds)/60),seconds=Math.max(0,totalSeconds)%60,parts=[];if(minutes)parts.push(`${minutes} ${minutes===1?'minute':'minutes'}`);if(seconds)parts.push(`${seconds} ${seconds===1?'second':'seconds'}`);return parts.join(' and ')||'zero seconds';}
  function speakSanitization(text,{onComplete,cancelExisting=true}={}){try{if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined')return false;if(cancelExisting)window.speechSynthesis.cancel();const message=new SpeechSynthesisUtterance(text);let complete=false;const finish=()=>{if(complete)return;complete=true;onComplete?.();};message.rate=.78;message.pitch=.68;message.volume=.86;message.onend=finish;message.onerror=event=>{console.error('[SanitizationAudio] speech playback failed:',event.error||event);finish();};window.speechSynthesis.speak(message);return true;}catch(error){console.error('[SanitizationAudio] speech playback failed:',error);onComplete?.();return false;}}
  async function startSanitizationActivationAudio(delaySeconds,activationTime){
    await window.ETOSAudio?.prepareSanitizationAudio?.();
    const p=sanitizationState();if(p.phase!=='active'||p.initiatedAt!==activationTime){console.info('[SanitizationAudio] activation audio SKIPPED - active state changed');return;}
    let alarmStarted=false,fallbackTimer=null;
    const startAlarm=reason=>{if(alarmStarted)return;alarmStarted=true;if(fallbackTimer)clearTimeout(fallbackTimer);sanitizationActivationAnnouncementPending=false;console.info(`[SanitizationAudio] requesting facility alarm${reason?` // ${reason}`:''}`);void window.ETOSAudio?.startFacilityAlarm?.({mode:'activation',autoStopMs:15000});};
    const speechComplete=()=>{console.info('[SanitizationAudio] activation speech COMPLETE');startAlarm('speech completion');};
    const announcement=`Facility sanitization sequence active. Sanitization in ${formatSanitizationSpeechDuration(delaySeconds)}.`;
    console.info('[SanitizationAudio] activation speech STARTED');
    if(speakSanitization(announcement,{onComplete:speechComplete}))fallbackTimer=setTimeout(()=>{console.warn('[SanitizationAudio] activation speech completion timeout - using fallback');startAlarm('fallback timeout');},5200);
    else setTimeout(()=>startAlarm('speech unavailable fallback'),120);
  }
  function stopSanitizationFinalCountdown(){if(sanitizationFinalCountdownTimer)clearTimeout(sanitizationFinalCountdownTimer);sanitizationFinalCountdownTimer=null;sanitizationFinalCountdownActive=false;sanitizationFinalCountdownValue=null;sanitizationSpeechToken+=1;try{window.speechSynthesis?.cancel();}catch{}window.ETOSAudio?.restoreFacilityAlarm?.();syncWardenSanitizationDisplay();}
  async function startSanitizationFinalCountdown(){const p=sanitizationState();if(p.phase!=='active'||sanitizationFinalCountdownActive)return;sanitizationFinalCountdownActive=true;try{window.speechSynthesis?.cancel();}catch{}const speechToken=++sanitizationSpeechToken,numbers=['Ten.','Nine.','Eight.','Seven.','Six.','Five.','Four.','Three.','Two.','One.'];syncWardenSanitizationDisplay();await window.ETOSAudio?.startFacilityAlarm?.({mode:'final-countdown',autoStopMs:0});if(speechToken!==sanitizationSpeechToken)return;let index=0;const complete=()=>{if(speechToken!==sanitizationSpeechToken)return;window.ETOSAudio?.restoreFacilityAlarm?.();sanitizationFinalCountdownTimer=setTimeout(()=>{if(speechToken!==sanitizationSpeechToken)return;window.ETOSAudio?.stopFacilityAlarm?.({fadeMs:350,reason:'final countdown complete'});sanitizationFinalCountdownTimer=null;sanitizationFinalCountdownActive=false;sanitizationFinalCountdownValue=null;syncWardenSanitizationDisplay();},1500);};const speakNext=()=>{if(speechToken!==sanitizationSpeechToken)return;sanitizationFinalCountdownValue=10-index;syncWardenSanitizationDisplay();window.ETOSAudio?.duckFacilityAlarm?.();speakSanitization(numbers[index],{cancelExisting:false});const startedAt=performance.now(),isLast=index===numbers.length-1;index+=1;const advance=()=>{if(speechToken!==sanitizationSpeechToken)return;const elapsed=performance.now()-startedAt,speaking=!!window.speechSynthesis?.speaking;if(elapsed<1000||(speaking&&elapsed<2200)){if(speaking&&elapsed>=900)window.ETOSAudio?.duckFacilityAlarm?.();sanitizationFinalCountdownTimer=setTimeout(advance,Math.max(60,Math.min(160,1000-elapsed)));return;}if(speaking){console.warn('[SanitizationAudio] countdown speech exceeded expected duration; advancing cue');try{window.speechSynthesis.cancel();}catch{}}if(isLast)complete();else speakNext();};sanitizationFinalCountdownTimer=setTimeout(advance,1000);};speakNext();}
  function renderCommandInterlock(){const p=sanitizationState(),engaged=p.keyEngaged;return `<section class="command-interlock${engaged?' is-engaged':''}${p.phase==='turning'?' is-turning':''}${p.phase==='removing'?' is-removing':''}" data-command-interlock tabindex="0" role="button" aria-label="Command key receptacle" aria-pressed="${engaged}"><span class="command-interlock-fastener is-a"></span><span class="command-interlock-fastener is-b"></span><div class="command-interlock-tumbler"><i></i></div><div class="command-interlock-copy"><strong>CMD KEY</strong><span>${engaged?'ENGAGED':'NOT PRESENT'}</span></div><small class="command-interlock-message" aria-live="polite">${commandInterlockMessage||''}</small></section>`;}
  function renderSanitizationProtocol(){
    const p=sanitizationState(),phase=p.phase;
    if(!p.keyEngaged&&!['turning','detected'].includes(phase))return '';
    if(['detected','turning'].includes(phase)||(phase==='active'&&sanitizationDisplayDismissed))return '';
    if(phase==='reveal')return `<div class="sanitization-layer is-reveal"><section class="sanitization-window sanitization-reveal" role="status" aria-live="assertive"><span>COMMAND KEY ENGAGED</span><strong>RESTRICTED COMMAND AUTHORITY ENABLED</strong><h2>FACILITY SANITIZATION PROTOCOL</h2></section></div>`;
    if(phase==='auth')return `<div class="sanitization-layer is-auth"><section class="sanitization-window" role="dialog" aria-modal="true"><small>RESTRICTED COMMAND AUTHORITY</small><h2>FACILITY SANITIZATION PROTOCOL</h2><h3>SECONDARY AUTHENTICATION REQUIRED</h3><label for="sanitization-code">ENTER COMMAND AUTHORIZATION CODE</label><div class="sanitization-code-entry"><input id="sanitization-code" type="password" inputmode="numeric" maxlength="6" autocomplete="off"><button type="button" data-sanitization-authenticate>VERIFY</button></div><p class="sanitization-error" data-sanitization-auth-error>${sanitizationAuthError}</p></section></div>`;
    if(phase==='timer'){
      const m=Math.floor(p.delaySeconds/60),s=p.delaySeconds%60;
      return `<div class="sanitization-layer is-timer"><section class="sanitization-window" role="dialog" aria-modal="true"><small>COMMAND KEY // VERIFIED</small><h2>FACILITY SANITIZATION PROTOCOL</h2><h3>SET SANITIZATION DELAY</h3><div class="sanitization-time-display" data-sanitization-preview>${formatSanitizationDelay(p.delaySeconds)}</div><div class="sanitization-time-entry"><label>MINUTES<input type="number" min="0" max="99" inputmode="numeric" value="${m}" data-sanitization-minutes></label><b>:</b><label>SECONDS<input type="number" min="0" max="59" inputmode="numeric" value="${s}" data-sanitization-seconds></label></div><p>SETTING THE DELAY DOES NOT INITIATE THE SEQUENCE.</p><p class="sanitization-error" data-sanitization-timer-error>${sanitizationTimerError}</p><button type="button" class="sanitization-primary" data-sanitization-review>CONFIRM SELECTED DELAY</button></section></div>`;
    }
    if(phase==='confirm')return `<div class="sanitization-layer is-confirm"><section class="sanitization-window sanitization-confirm" role="dialog" aria-modal="true"><small>FACILITY SANITIZATION PROTOCOL</small><h2>FINAL COMMAND CONFIRMATION</h2><dl><div><dt>COMMAND KEY</dt><dd>VERIFIED</dd></div><div><dt>AUTHORIZATION</dt><dd>VERIFIED</dd></div><div><dt>SANITIZATION DELAY</dt><dd>${formatSanitizationDelay(p.delaySeconds)}</dd></div></dl><div class="sanitization-final-warning"><strong>WARNING</strong><p>ONCE INITIATED, THIS SEQUENCE CANNOT BE ABORTED.</p><p>FACILITY DESTRUCTION WILL PROCEED AT THE END OF THE SELECTED DELAY.</p></div><h3>PROCEED WITH SANITIZATION?</h3><div class="sanitization-confirm-controls"><button type="button" class="sanitization-proceed" data-sanitization-proceed>PROCEED WITH SANITIZATION</button></div></section></div>`;
    if(phase==='active')return `<div class="sanitization-layer is-active"><section class="sanitization-window sanitization-active" role="alert" aria-live="assertive"><small>FACILITY SANITIZATION PROTOCOL</small><h2>${p.complete?'SANITIZATION COMMAND EXECUTED':'SANITIZATION SEQUENCE ACTIVE'}</h2><strong class="sanitization-active-state">NO ABORT PATH AVAILABLE</strong><div class="sanitization-countdown" data-sanitization-countdown>${p.complete?'00:00':formatSanitizationDelay(Math.max(0,Math.ceil((p.completesAt-Date.now())/1000)))}</div><p>${p.complete?'FACILITY DESTRUCTION COMMAND ISSUED':'FACILITY DESTRUCTION WILL PROCEED AT COUNTDOWN COMPLETION.'}</p></section></div>`;
    return '';
  }
  function renderSanitizationWorkflow(){const markup=renderSanitizationProtocol(),phase=sanitizationState().phase;if(!markup||!['reveal','auth','timer','confirm'].includes(phase))return markup;return markup.replace('</section></div>','<button type="button" class="sanitization-abort" data-sanitization-abort>ABORT PROTOCOL</button></section></div>');}
  function setCommandInterlockMessage(message,duration=1800){commandInterlockMessage=message;if(commandInterlockMessageTimer)clearTimeout(commandInterlockMessageTimer);renderTerminal();commandInterlockMessageTimer=setTimeout(()=>{commandInterlockMessage='';commandInterlockMessageTimer=null;if(state.activeTerminal==='command')renderTerminal();},duration);}
  function beginCommandInterlockHold(event){if(event.pointerType==='mouse'&&event.button!==0)return;const audioPreparation=window.ETOSAudio?.prepareSanitizationAudio?.();if(audioPreparation)void audioPreparation.then(ok=>{if(ok)window.ETOSAudio.startAmbient();});const p=sanitizationState();if(p.phase==='active')return;cancelCommandInterlockHold();commandInterlockHoldMode=p.keyEngaged?'remove':'insert';commandInterlockAcknowledged=false;commandInterlockHoldTimer=setTimeout(()=>{commandInterlockHoldTimer=null;commandInterlockAcknowledged=true;if(commandInterlockHoldMode==='insert')p.phase='detected';commandInterlockMessage=commandInterlockHoldMode==='remove'?'KEY RELEASE SIGNAL DETECTED':'KEY SIGNAL DETECTED';saveState();playAudio('interlockAck');renderTerminal();},COMMAND_INTERLOCK_HOLD_MS);}
  function cancelCommandInterlockHold(){if(commandInterlockHoldTimer!==null)clearTimeout(commandInterlockHoldTimer);commandInterlockHoldTimer=null;}
  function finishCommandInterlockHold(cancelled=false){const p=sanitizationState(),succeeded=commandInterlockAcknowledged,mode=commandInterlockHoldMode;cancelCommandInterlockHold();if(p.phase==='active'){commandInterlockAcknowledged=false;commandInterlockHoldMode=null;return;}if(cancelled){commandInterlockAcknowledged=false;commandInterlockHoldMode=null;return;}if(!succeeded){commandInterlockAcknowledged=false;commandInterlockHoldMode=null;if(mode==='remove'&&p.phase==='engaged-idle')return;playAudio('reject');setCommandInterlockMessage(mode==='remove'?'COMMAND KEY REMAINS ENGAGED':'COMMAND KEY NOT DETECTED');return;}commandInterlockAcknowledged=false;commandInterlockHoldMode=null;if(mode==='remove'){beginCommandKeyRemoval();return;}commandInterlockMessage='KEY SIGNAL DETECTED';commandInterlockTurnTimer=setTimeout(()=>{p.phase='turning';saveState();els.workspace.querySelector('[data-command-interlock]')?.classList.add('is-turning');commandInterlockTurnTimer=setTimeout(()=>{p.keyEngaged=true;p.phase='reveal';p.resumePhase='auth';commandInterlockMessage='';saveState();console.info('[SanitizationAudio] KEY ENGAGED - requesting warning controller');startSanitizationSystems();playAudio('mechanicalActuation');playAudio('confirm',{delay:.34});renderTerminal();commandInterlockRevealTimer=setTimeout(()=>{commandInterlockRevealTimer=null;if(p.phase==='reveal'){p.phase='auth';saveState();renderTerminal();startSanitizationSystems();setTimeout(()=>document.getElementById('sanitization-code')?.focus(),50);}},2600);},COMMAND_INTERLOCK_TURN_MS);},COMMAND_INTERLOCK_RELEASE_DELAY_MS);}
  function abortSanitizationProtocol({forRemoval=false,silent=false}={}){const p=sanitizationState();if(p.phase==='active')return false;stopSanitizationWarning();sanitizationAuthError='';sanitizationTimerError='';if(forRemoval){p.phase='removal-pending';p.resumePhase='auth';p.delaySeconds=0;}else{p.resumePhase=p.phase==='confirm'?'confirm':p.phase==='timer'?'timer':'auth';p.phase='engaged-idle';}p.initiatedAt=null;p.completesAt=null;p.complete=false;saveState();if(!silent)playAudio('uiBack');renderTerminal();return true;}
  function reopenSanitizationProtocol(){const p=sanitizationState();if(!p.keyEngaged||p.phase!=='engaged-idle')return;p.phase=['auth','timer','confirm'].includes(p.resumePhase)?p.resumePhase:'auth';saveState();playAudio('uiSelect');renderTerminal();startSanitizationSystems();if(p.phase==='auth')setTimeout(()=>document.getElementById('sanitization-code')?.focus(),50);}
  function beginCommandKeyRemoval(){const p=sanitizationState();if(!p.keyEngaged||p.phase==='active')return;commandInterlockMessage='KEY RELEASE SIGNAL DETECTED';abortSanitizationProtocol({forRemoval:true,silent:true});commandInterlockTurnTimer=setTimeout(()=>{p.phase='removing';saveState();els.workspace.querySelector('[data-command-interlock]')?.classList.add('is-removing');commandInterlockTurnTimer=setTimeout(()=>{p.keyEngaged=false;p.phase='dormant';p.resumePhase='auth';p.delaySeconds=0;p.initiatedAt=null;p.completesAt=null;p.complete=false;commandInterlockMessage='';saveState();playAudio('mechanicalActuation',{gain:.68,rate:.9});playAudio('uiBack',{delay:.28});renderTerminal();},COMMAND_INTERLOCK_TURN_MS);},COMMAND_INTERLOCK_RELEASE_DELAY_MS);}
  function authenticateSanitization(){const input=document.getElementById('sanitization-code');if(!input)return;if(input.value!==SANITIZATION_ACCESS_CODE){playAudio('reject');sanitizationAuthError='AUTHORIZATION DENIED // COMMAND KEY REMAINS ENGAGED';input.value='';input.focus();const error=els.workspace.querySelector('[data-sanitization-auth-error]');if(error)error.textContent=sanitizationAuthError;return;}playAudio('confirm');sanitizationAuthError='';const p=sanitizationState();p.phase='timer';p.resumePhase='timer';saveState();renderTerminal();startSanitizationSystems();}
  function updateSanitizationPreview(){const m=Math.max(0,Math.min(99,Number(els.workspace.querySelector('[data-sanitization-minutes]')?.value)||0)),s=Math.max(0,Math.min(59,Number(els.workspace.querySelector('[data-sanitization-seconds]')?.value)||0)),total=m*60+s,out=els.workspace.querySelector('[data-sanitization-preview]');if(out)out.textContent=formatSanitizationDelay(total);const p=sanitizationState();p.delaySeconds=total;p.resumePhase='timer';saveState();startSanitizationSystems();}
  function reviewSanitizationDelay(){const m=Math.max(0,Math.min(99,Number(els.workspace.querySelector('[data-sanitization-minutes]')?.value)||0)),s=Math.max(0,Math.min(59,Number(els.workspace.querySelector('[data-sanitization-seconds]')?.value)||0)),total=m*60+s;if(total<1){playAudio('reject');sanitizationTimerError='SELECT A DELAY GREATER THAN 00:00';const error=els.workspace.querySelector('[data-sanitization-timer-error]');if(error)error.textContent=sanitizationTimerError;return;}sanitizationTimerError='';const p=sanitizationState();p.delaySeconds=total;p.phase='confirm';p.resumePhase='confirm';saveState();playAudio('confirm');renderTerminal();startSanitizationSystems();}
  function activateSanitization(){if(sanitizationState().phase!=='confirm')return;console.info('[SanitizationAudio] FINAL ACTIVATION');const p=sanitizationState(),now=Date.now();sanitizationDisplayDismissed=false;stopSanitizationWarning();sanitizationActivationAnnouncementPending=true;p.phase='active';p.initiatedAt=now;p.completesAt=now+p.delaySeconds*1000;p.complete=false;saveState();playAudio('confirm');playAudio('mechanicalActuation',{delay:.35});void startSanitizationActivationAudio(p.delaySeconds,now);renderTerminal();startSanitizationSystems();}
  function syncWardenSanitizationDisplay(){const p=sanitizationState(),active=p.phase==='active',alarmState=document.documentElement.dataset.facilityAlarm||'off',alarmAudible=['active','ducking'].includes(alarmState);if(els.sanitizationDisplay){els.sanitizationDisplay.hidden=!active;els.sanitizationDisplay.textContent=sanitizationDisplayDismissed?'SHOW SANITIZATION DISPLAY':'CLOSE SANITIZATION DISPLAY';}if(els.sanitizationFinalCountdown){els.sanitizationFinalCountdown.disabled=!active||sanitizationFinalCountdownActive;els.sanitizationFinalCountdown.textContent=sanitizationFinalCountdownActive?`SANITIZATION FINAL COUNTDOWN // ${sanitizationFinalCountdownValue??'STARTING'}`:'START SANITIZATION FINAL COUNTDOWN';}if(els.sanitizationAlarmMute){els.sanitizationAlarmMute.hidden=!active;els.sanitizationAlarmMute.disabled=!alarmAudible;}}
  function syncWardenAudioDiagnostics(){
    const status=window.ETOSAudio?.getAssetStatus?.()||{},warning=status.sanitizationWarningPulse,facility=status.facilityEmergencyAlarm;
    const versionOut=$('audio-diagnostic-version'),originOut=$('audio-diagnostic-origin'),pathnameOut=$('audio-diagnostic-pathname');
    if(versionOut)versionOut.textContent=VERSION;
    if(originOut)originOut.textContent=window.location.origin||'[NO ORIGIN]';
    if(pathnameOut)pathnameOut.textContent=window.location.pathname||'/';
    const apply=(element,item,label)=>{
      if(!element)return;
      const state=item?.state||'unchecked',result=item?.result||(state==='loading'?'CHECKING':'NOT CHECKED');
      element.classList.toggle('is-loaded',state==='loaded');element.classList.toggle('is-failed',state==='failed');
      element.title=item?.error||'';element.replaceChildren();
      const heading=document.createElement('strong');heading.textContent=`${label}: ${result}`;element.append(heading);
      [
        [`${label} URL`,item?.url||'...'],
        [`${label} HTTP`,item?.status==null?'...':String(item.status)],
        [`${label} MIME`,item?.contentType||'...'],
        [`${label} BYTES`,item?.bytes==null?'...':Number(item.bytes).toLocaleString()],
        [`${label} DECODE`,item?.decode||'...']
      ].forEach(([name,value])=>{const line=document.createElement('span'),key=document.createElement('b');key.textContent=`${name}: `;line.append(key,document.createTextNode(value));element.append(line);});
      if(item?.error){const line=document.createElement('span');line.className='warden-audio-error';line.textContent=`ERROR: ${item.error}`;element.append(line);}
    };
    apply(els.warningWavStatus,warning,'WARNING');apply(els.facilityWavStatus,facility,'FACILITY');
    if(els.sanitizationWarningTest)els.sanitizationWarningTest.disabled=warning?.state!=='loaded';
    if(els.sanitizationAlarmTest){const testPlaying=document.documentElement.dataset.facilityAlarmTest==='playing';els.sanitizationAlarmTest.disabled=!testPlaying&&facility?.state!=='loaded';}
  }
  function toggleSanitizationDisplay(){if(sanitizationState().phase!=='active')return;sanitizationDisplayDismissed=!sanitizationDisplayDismissed;playAudio(sanitizationDisplayDismissed?'uiBack':'uiSelect');renderTerminal();syncWardenSanitizationDisplay();}
  function muteFacilityAlarm(){if(!['active','ducking'].includes(document.documentElement.dataset.facilityAlarm||''))return;window.ETOSAudio?.stopFacilityAlarm?.({fadeMs:350,reason:'Warden mute'});syncWardenSanitizationDisplay();}
  async function testSanitizationWarning(){if(!els.sanitizationWarningTest)return;els.sanitizationWarningTest.disabled=true;await window.ETOSAudio?.testSanitizationWarning?.();syncWardenAudioDiagnostics();}
  async function toggleFacilityAlarmTest(){if(!els.sanitizationAlarmTest)return;els.sanitizationAlarmTest.disabled=true;const active=await window.ETOSAudio?.toggleFacilityAlarmTest?.();els.sanitizationAlarmTest.textContent=active?'STOP FACILITY ALARM TEST':'TEST FACILITY ALARM';syncWardenAudioDiagnostics();if(active)setTimeout(()=>{if(document.documentElement.dataset.facilityAlarmTest!=='playing')els.sanitizationAlarmTest.textContent='TEST FACILITY ALARM';syncWardenAudioDiagnostics();},7200);}
  function sanitizationWarningProfile(){const p=sanitizationState();if(['reveal','auth'].includes(p.phase))return {stage:'key-engaged',cadence:2750,intensity:.62};if(p.phase==='timer'){const minutes=Number(els.workspace.querySelector('[data-sanitization-minutes]')?.value),seconds=Number(els.workspace.querySelector('[data-sanitization-seconds]')?.value),inputDelay=(Number.isFinite(minutes)?minutes:0)*60+(Number.isFinite(seconds)?seconds:0),delayReady=inputDelay>0||p.delaySeconds>0;return delayReady?{stage:'delay-ready',cadence:1000,intensity:.82}:{stage:'password-accepted',cadence:1650,intensity:.72};}if(p.phase==='confirm')return {stage:'final-confirmation',cadence:700,intensity:.92};return null;}
  function stopSanitizationWarning(){const stoppedStage=sanitizationWarningStage;if(sanitizationWarningTimer)clearTimeout(sanitizationWarningTimer);sanitizationWarningTimer=null;sanitizationWarningStage=null;document.documentElement.dataset.sanitizationWarningScheduler='off';window.ETOSAudio?.stopSanitizationWarning?.();if(stoppedStage)console.info('[SanitizationAudio] warning scheduler STOPPED');}
  function stopSanitizationSystems(){stopSanitizationWarning();if(sanitizationCountdownTimer)clearInterval(sanitizationCountdownTimer);sanitizationCountdownTimer=null;}
  function startSanitizationSystems(){const p=sanitizationState(),profile=sanitizationWarningProfile();if(!profile)stopSanitizationWarning();else if(sanitizationWarningStage!==profile.stage){stopSanitizationWarning();sanitizationWarningStage=profile.stage;document.documentElement.dataset.sanitizationWarningScheduler=profile.stage;console.info(`[SanitizationAudio] warning scheduler STARTED // ${profile.stage}`);const pulse=()=>{const current=sanitizationWarningProfile();if(state.activeTerminal!=='command'||!current||sanitizationWarningStage!==current.stage)return;document.documentElement.dataset.sanitizationWarningPulseRequested=String(Date.now());console.info('[SanitizationAudio] warning pulse REQUESTED');void window.ETOSAudio?.playSanitizationWarningPulse?.();sanitizationWarningTimer=setTimeout(pulse,current.cadence);};pulse();}if(p.phase==='active'&&!sanitizationCountdownTimer){const update=()=>{const remaining=Math.max(0,Math.ceil((p.completesAt-Date.now())/1000)),out=els.workspace.querySelector('[data-sanitization-countdown]');if(out)out.textContent=formatSanitizationDelay(remaining);if(remaining===0&&!p.complete){p.complete=true;saveState();playAudio('sanitizationExecute');renderTerminal();}};update();sanitizationCountdownTimer=setInterval(update,250);}}

  const auditTokenState=()=>state.auditToken||(state.auditToken={...AUDIT_TOKEN_DEFAULT});
  function scheduleAuditToken(callback,delay){const timer=setTimeout(()=>{auditTokenTimers.delete(timer);callback();},delay);auditTokenTimers.add(timer);return timer;}
  function clearAuditTokenTimers(){auditTokenTimers.forEach(timer=>clearTimeout(timer));auditTokenTimers.clear();if(auditTokenRecognitionTimeout!==null)clearTimeout(auditTokenRecognitionTimeout);auditTokenRecognitionTimeout=null;}
  function stopAuditTokenListening(){
    if(auditTokenRecognition){const recognition=auditTokenRecognition;auditTokenRecognition=null;recognition.onresult=null;recognition.onerror=null;recognition.onend=null;try{recognition.abort();}catch{}}
    if(auditTokenRecognitionTimeout!==null)clearTimeout(auditTokenRecognitionTimeout);auditTokenRecognitionTimeout=null;
  }
  function stopAuditTokenAudio(){window.ETOSAudio?.stopAuditToken?.();try{window.speechSynthesis?.cancel();}catch{}}
  function speakAuditToken(text){
    try{if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined')return;window.speechSynthesis.cancel();const message=new SpeechSynthesisUtterance(text);message.rate=.78;message.pitch=.68;message.volume=.86;window.speechSynthesis.speak(message);}catch{}
  }
  function renderAuditTokenPort(){
    const connected=auditTokenState().connected;
    return `<button type="button" class="audit-token-port${connected?' is-connected':''}" data-audit-token-port aria-label="Audit Token data port"><small>AUDIT DATA</small><span class="audit-token-socket" aria-hidden="true"><b class="audit-token-pin-field"><span>${Array.from({length:8},()=>'<i></i>').join('')}</span><span>${Array.from({length:7},()=>'<i></i>').join('')}</span></b></span></button>`;
  }
  function auditTokenAbortControl(){return '<button type="button" class="audit-token-abort" data-audit-token-abort>ABORT PROTOCOL</button>';}
  function renderAuditTokenWorkflow(){
    if(auditTokenView==='closed')return '';
    let body='';
    if(auditTokenView==='detecting'){
      const lines=['EXTERNAL DEVICE DETECTED','AUDIT TOKEN','READING DEVICE CREDENTIALS...','TOKEN ID VERIFIED','CORPORATE AUDIT AUTHORITY CONFIRMED'];
      body=`<small>EXTERNAL HARDWARE INTERFACE</small><h2>EXTERNAL DEVICE DETECTED</h2><div class="audit-token-readout">${lines.slice(1,Math.min(lines.length,auditTokenDetectionStep+2)).map((line,index)=>`<p class="${index===auditTokenDetectionStep?'is-active':'is-complete'}">${line}</p>`).join('')}</div>${auditTokenAbortControl()}`;
    } else if(auditTokenView==='voice'){
      body=`<small>AUDIT TOKEN // VERIFIED</small><h2>INCIDENT DATA ACQUISITION PROTOCOL</h2><h3>VOICE AUTHORIZATION REQUIRED</h3><p class="audit-token-attempt">VOICE AUTHORIZATION ATTEMPT ${Math.max(1,auditTokenVoiceAttempt)} OF 3</p><div class="audit-token-listening${auditTokenVoiceStatus==='LISTENING...'?' is-listening':''}"><i aria-hidden="true"></i><strong>${auditTokenVoiceStatus||'PREPARING VOICE INTERFACE...'}</strong></div>${auditTokenAbortControl()}`;
    } else if(auditTokenView==='manual'){
      body=`<small>AUDIT TOKEN // VERIFIED</small><h2>INCIDENT DATA ACQUISITION PROTOCOL</h2><h3>VOICE AUTHORIZATION UNAVAILABLE</h3><strong class="audit-token-manual-required">MANUAL AUTHENTICATION REQUIRED</strong><label for="audit-token-passcode">ENTER AUDIT AUTHORIZATION PASSCODE</label><div class="audit-token-passcode"><input id="audit-token-passcode" type="password" maxlength="8" autocomplete="off" autocapitalize="characters"><button type="button" data-audit-token-passcode>VERIFY</button></div><p class="audit-token-error" data-audit-token-error>${auditTokenManualError}</p>${auditTokenAbortControl()}`;
    } else if(auditTokenView==='authorized'){
      const voiceAccepted=auditTokenVoiceStatus==='VOICE AUTHORIZATION ACCEPTED';
      body=`<small>AUDIT TOKEN // AUTHORIZED</small><h2>INCIDENT DATA ACQUISITION PROTOCOL</h2><div class="audit-token-authorization" role="status"><strong>${voiceAccepted?'COMMAND RECOGNIZED':'MANUAL AUTHORIZATION ACCEPTED'}</strong>${voiceAccepted?'<p>VOICE AUTHORIZATION ACCEPTED</p>':''}<p>INCIDENT DATA ACQUISITION AUTHORIZED</p></div>${auditTokenAbortControl()}`;
    } else if(auditTokenView==='confirm'){
      body=`<small>AUDIT TOKEN // AUTHORIZED</small><h2>INCIDENT DATA ACQUISITION PROTOCOL</h2><h3>ACQUISITION AUTHORIZATION CONFIRMED</h3><p>ETOS IS READY TO ACQUIRE THE LOCAL INCIDENT DATA PACKAGE.</p><div class="audit-token-controls"><button type="button" class="audit-token-primary" data-audit-token-acquire>BEGIN DATA ACQUISITION</button>${auditTokenAbortControl()}</div>`;
    } else if(auditTokenView==='acquiring'){
      const status=auditTokenProgress<24?'ESTABLISHING DATA CHANNEL':auditTokenProgress<70?'ACQUIRING INCIDENT DATA':auditTokenProgress<92?'VERIFYING TRANSFER':'FINALIZING ACQUISITION';
      body=`<small>AUDIT TOKEN // ACTIVE</small><h2>INCIDENT DATA ACQUISITION PROTOCOL</h2><h3>${status}</h3><div class="audit-token-progress"><i style="width:${auditTokenProgress}%"></i></div><strong class="audit-token-percent">${String(Math.round(auditTokenProgress)).padStart(3,'0')}%</strong>${auditTokenAbortControl()}`;
    } else if(auditTokenView==='complete'){
      body=`<small>AUDIT TOKEN // CONNECTED</small><h2>INCIDENT DATA ACQUISITION PROTOCOL</h2><div class="audit-token-complete" role="status"><strong>ACQUISITION COMPLETE</strong><p>INCIDENT DATA PACKAGE VERIFIED</p></div><div class="audit-token-controls"><button type="button" class="audit-token-primary" data-audit-token-close>RETURN TO COMMAND TERMINAL</button>${auditTokenAbortControl()}</div>`;
    }
    return `<div class="audit-token-layer"><section class="audit-token-window" role="dialog" aria-modal="true" aria-label="Audit Token protocol">${body}</section></div>`;
  }
  function normalizeAuditTokenCommand(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'').trim();}
  function beginAuditTokenDetection(){
    auditTokenSessionId+=1;clearAuditTokenTimers();stopAuditTokenListening();stopAuditTokenAudio();auditTokenDetectionStep=0;auditTokenVoiceAttempt=0;auditTokenVoiceStatus='';auditTokenManualError='';auditTokenProgress=0;
    const token=auditTokenState();token.connected=true;token.complete=false;auditTokenView='detecting';saveState();playAudio('auditDetect');renderTerminal();
    [520,1050,1580,2110].forEach((delay,index)=>scheduleAuditToken(()=>{if(auditTokenView!=='detecting')return;auditTokenDetectionStep=index+1;playAudio('auditRead');renderTerminal();},delay));
    scheduleAuditToken(()=>{if(auditTokenView!=='detecting')return;auditTokenView='voice';auditTokenVoiceAttempt=1;auditTokenVoiceStatus='PREPARING VOICE INTERFACE...';renderTerminal();scheduleAuditToken(()=>startAuditTokenVoiceAttempt(),350);},2750);
  }
  function beginAuditTokenHold(event){
    if(event.pointerType==='mouse'&&event.button!==0)return;if(auditTokenState().connected||auditTokenHoldTimer!==null||auditTokenHoldComplete)return;
    if(!window.ETOSAudio?.isUnlocked())void window.ETOSAudio?.unlock();event.currentTarget?.setPointerCapture?.(event.pointerId);auditTokenHoldComplete=false;
    auditTokenHoldTimer=setTimeout(()=>{auditTokenHoldTimer=null;auditTokenHoldComplete=true;auditTokenSuppressClick=true;beginAuditTokenDetection();},AUDIT_TOKEN_HOLD_MS);
  }
  function finishAuditTokenHold(){
    if(auditTokenHoldComplete){auditTokenHoldComplete=false;setTimeout(()=>{auditTokenSuppressClick=false;},120);return;}
    if(auditTokenHoldTimer!==null)clearTimeout(auditTokenHoldTimer);auditTokenHoldTimer=null;
  }
  function startAuditTokenVoiceAttempt(){
    if(auditTokenView!=='voice')return;const session=auditTokenSessionId;stopAuditTokenListening();auditTokenVoiceStatus='LISTENING...';renderTerminal();
    speakAuditToken(auditTokenVoiceAttempt===1?'Audit interface ready. State acquisition command.':'Command not recognized. Repeat acquisition command.');
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Recognition){scheduleAuditToken(()=>failAuditTokenVoiceAttempt(),900);return;}
    const recognition=new Recognition();auditTokenRecognition=recognition;let settled=false;recognition.lang='en-US';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=3;
    const settle=(success)=>{if(settled||session!==auditTokenSessionId||auditTokenView!=='voice')return;settled=true;if(auditTokenRecognition===recognition)auditTokenRecognition=null;if(auditTokenRecognitionTimeout!==null)clearTimeout(auditTokenRecognitionTimeout);auditTokenRecognitionTimeout=null;try{recognition.stop();}catch{}success?acceptAuditTokenVoice():failAuditTokenVoiceAttempt();};
    recognition.onresult=event=>{const transcripts=[];for(let i=event.resultIndex;i<event.results.length;i+=1){for(let j=0;j<event.results[i].length;j+=1)transcripts.push(event.results[i][j].transcript);}settle(transcripts.some(text=>normalizeAuditTokenCommand(text)==='initialize'));};
    recognition.onerror=event=>{if(event.error!=='aborted')settle(false);};recognition.onend=()=>settle(false);
    try{recognition.start();auditTokenRecognitionTimeout=setTimeout(()=>settle(false),8000);}catch{settle(false);}
  }
  function failAuditTokenVoiceAttempt(){
    if(auditTokenView!=='voice')return;stopAuditTokenListening();auditTokenVoiceStatus='COMMAND NOT RECOGNIZED';playAudio('auditReject');renderTerminal();
    if(auditTokenVoiceAttempt>=3){scheduleAuditToken(()=>showAuditTokenManualFallback(),1450);return;}
    scheduleAuditToken(()=>{if(auditTokenView!=='voice')return;auditTokenVoiceAttempt+=1;auditTokenVoiceStatus='PREPARING NEXT ATTEMPT...';renderTerminal();scheduleAuditToken(()=>startAuditTokenVoiceAttempt(),450);},1350);
  }
  function acceptAuditTokenVoice(){stopAuditTokenListening();stopAuditTokenAudio();auditTokenVoiceStatus='VOICE AUTHORIZATION ACCEPTED';auditTokenView='authorized';playAudio('auditConfirm');renderTerminal();scheduleAuditToken(()=>{if(auditTokenView==='authorized'){auditTokenView='confirm';renderTerminal();}},1550);}
  function showAuditTokenManualFallback(){stopAuditTokenListening();stopAuditTokenAudio();if(!auditTokenState().connected)return;auditTokenView='manual';auditTokenVoiceAttempt=3;auditTokenVoiceStatus='';auditTokenManualError='';renderTerminal();setTimeout(()=>document.getElementById('audit-token-passcode')?.focus(),50);}
  function authorizeAuditTokenPasscode(){
    const input=document.getElementById('audit-token-passcode');if(!input)return;
    if(input.value.trim().toUpperCase()!==AUDIT_TOKEN_PASSCODE){auditTokenManualError='AUTHENTICATION REJECTED';playAudio('auditReject');input.value='';input.focus();const error=els.workspace.querySelector('[data-audit-token-error]');if(error)error.textContent=auditTokenManualError;return;}
    auditTokenManualError='';auditTokenVoiceStatus='MANUAL AUTHORIZATION ACCEPTED';auditTokenView='authorized';playAudio('auditConfirm');renderTerminal();scheduleAuditToken(()=>{if(auditTokenView==='authorized'){auditTokenView='confirm';renderTerminal();}},1550);
  }
  function beginAuditTokenAcquisition(){
    if(auditTokenView!=='confirm')return;clearAuditTokenTimers();auditTokenView='acquiring';auditTokenProgress=0;playAudio('auditAcquire');renderTerminal();
    const advance=()=>{if(auditTokenView!=='acquiring')return;auditTokenProgress=Math.min(100,auditTokenProgress+2);if(auditTokenProgress%20===0)playAudio('auditRead');if(auditTokenProgress>=100){const token=auditTokenState();token.complete=true;saveState();auditTokenView='complete';playAudio('auditComplete');renderTerminal();return;}renderTerminal();scheduleAuditToken(advance,120);};scheduleAuditToken(advance,120);
  }
  function resetAuditTokenSession({render=true,silent=false}={}){
    auditTokenSessionId+=1;clearAuditTokenTimers();stopAuditTokenListening();stopAuditTokenAudio();if(auditTokenHoldTimer!==null)clearTimeout(auditTokenHoldTimer);auditTokenHoldTimer=null;auditTokenHoldComplete=false;auditTokenSuppressClick=false;
    auditTokenView='closed';auditTokenDetectionStep=0;auditTokenVoiceAttempt=0;auditTokenVoiceStatus='';auditTokenManualError='';auditTokenProgress=0;state.auditToken={...AUDIT_TOKEN_DEFAULT};saveState();if(!silent)playAudio('uiBack');if(render)renderTerminal();
  }
  function suspendAuditTokenWorkflow(){auditTokenSessionId+=1;clearAuditTokenTimers();stopAuditTokenListening();stopAuditTokenAudio();if(auditTokenHoldTimer!==null)clearTimeout(auditTokenHoldTimer);auditTokenHoldTimer=null;auditTokenHoldComplete=false;auditTokenSuppressClick=false;auditTokenView='closed';auditTokenVoiceAttempt=0;auditTokenVoiceStatus='';auditTokenManualError='';auditTokenProgress=0;}
  function openConnectedAuditToken(){if(!auditTokenState().connected||auditTokenView!=='closed')return;if(auditTokenState().complete){auditTokenView='complete';renderTerminal();return;}auditTokenView='voice';auditTokenVoiceAttempt=1;auditTokenVoiceStatus='PREPARING VOICE INTERFACE...';renderTerminal();scheduleAuditToken(()=>startAuditTokenVoiceAttempt(),350);}
  function closeCompletedAuditToken(){if(auditTokenView!=='complete')return;clearAuditTokenTimers();stopAuditTokenListening();stopAuditTokenAudio();auditTokenView='closed';playAudio('uiBack');renderTerminal();}

  function resetCommandSequenceForDev(){
    stopSanitizationSystems();stopSanitizationFinalCountdown();window.ETOSAudio?.stopFacilityAlarm?.();cancelCommandInterlockHold();clearTimeout(commandInterlockTurnTimer);clearTimeout(commandInterlockRevealTimer);clearTimeout(commandInterlockMessageTimer);
    commandInterlockTurnTimer=null;commandInterlockRevealTimer=null;commandInterlockMessageTimer=null;commandInterlockAcknowledged=false;commandInterlockHoldMode=null;commandInterlockMessage='';
    sanitizationAuthError='';sanitizationTimerError='';sanitizationDisplayDismissed=false;sanitizationActivationAnnouncementPending=false;state.sanitization={...SANITIZATION_DEFAULT};resetAuditTokenSession({render:false,silent:true});
  }

  function resetMedicalGenomicSequenceForDev(){
    if(medicalAction==='genomic'){clearTimeout(medicalActionTimer);medicalActionTimer=null;medicalAction=null;}
    const medical=ensureMedicalState();medical.genomicReviewed=false;medicalGenomicOverlayOpen=false;
  }

  function resetMedicalVialReleaseForDev(){
    if(medicalAction&&medicalAction!=='genomic'){clearTimeout(medicalActionTimer);medicalActionTimer=null;medicalAction=null;}
    clearTimeout(medicalHackHoldTimer);clearTimeout(medicalHackFinishTimer);medicalHackHoldTimer=null;medicalHackFinishTimer=null;medicalAuthorizationError='';
    const medical=ensureMedicalState();['01','02','03'].forEach(id=>{medical.vials[id]='secured';});
  }

  function resetMedicalDataModuleForDev(){
    clearMedicalMediaHold();clearInterval(medicalMediaRenderTimer);clearTimeout(medicalMediaProcessTimer);clearTimeout(medicalMediaAudioTimer);clearTimeout(medicalMediaReturnTimer);
    medicalMediaRenderTimer=null;medicalMediaProcessTimer=null;medicalMediaAudioTimer=null;medicalMediaReturnTimer=null;medicalMediaHoldReady=false;medicalMediaHoldMode=null;medicalMediaAwaitingRelease=false;medicalMediaSuppressClick=false;
    medicalMediaView='closed';medicalMediaProtocol=null;medicalMediaMessage='';medicalMediaProgress=0;medicalMediaFileIndex=0;
    const medical=ensureMedicalState();medical.dataDuplicated=false;medical.dataSanitized=false;
  }

  function resetMedicalInjectorSequenceForDev(){
    clearMedicalInjectorHold();window.ETOSAudio?.stopBiometricScan?.();clearTimeout(medicalInjectorSequenceTimer);clearTimeout(medicalInjectorReturnTimer);
    medicalInjectorSequenceTimer=null;medicalInjectorReturnTimer=null;medicalInjectorHoldReady=false;medicalInjectorHoldMode=null;medicalInjectorAwaitingRelease=false;medicalInjectorSuppressClick=false;
    medicalInjectorView='closed';medicalInjectorTarget=null;medicalInjectorTargets=[];
    const medical=ensureMedicalState();medical.injectorRegistered=false;medical.biometricVerified=false;['01','02','03'].forEach(id=>{medical.vialViability[id]='confirmed';medical.vials[id]='secured';});
  }

  function setSequenceResetStatus(message){
    if(!els.sequenceResetStatus)return;clearTimeout(sequenceResetStatusTimer);els.sequenceResetStatus.textContent=message;
    sequenceResetStatusTimer=setTimeout(()=>{sequenceResetStatusTimer=null;if(els.sequenceResetStatus)els.sequenceResetStatus.textContent='';},2200);
  }

  function runSequenceReset(kind){
    let message='';
    if(kind==='command'){resetCommandSequenceForDev();message='COMMAND SEQUENCE RESET';}
    else if(kind==='argoza-recovery'){stopArgozaRecovery();window.ETOSArgozaRecovery?.resetSeen();message='ARGOZA RECOVERY SEQUENCE RESET';}
    else if(kind==='medical-genomic'){resetMedicalGenomicSequenceForDev();message='GENOMIC SEQUENCE RESET';}
    else if(kind==='medical-vials'){resetMedicalVialReleaseForDev();message='VIAL RELEASE STATE RESET';}
    else if(kind==='medical-media'){resetMedicalDataModuleForDev();message='DATA MODULE SEQUENCE RESET';}
    else if(kind==='medical-injector'){resetMedicalInjectorSequenceForDev();message='AUTO-INJECTOR SEQUENCE RESET';}
    else if(kind==='medical-all'){resetMedicalGenomicSequenceForDev();resetMedicalVialReleaseForDev();resetMedicalDataModuleForDev();resetMedicalInjectorSequenceForDev();message='MEDICAL SEQUENCES RESET';}
    else return;
    saveState();renderTerminal();syncWardenSanitizationDisplay();playAudio('confirm');setSequenceResetStatus(message);
  }

  function renderCommand(profile){
    if (!profile.sections[state.section]) state.section = profile.defaultSection;
    const section = profile.sections[state.section];
    const onOverview = state.section === 'overview';
    const devPrefs = loadDevPrefs();
    const devButtons = devPrefs.show ? `<button class="overview-dev-toggle overview-dev-toggle--rail" type="button" data-overview-dev-toggle><span>DEV</span><strong>OVERVIEW TOOLS</strong><small>TYPOGRAPHY CONTROL</small></button><button class="overview-dev-toggle overview-dev-toggle--rail overview-layout-toggle--rail" type="button" data-overview-layout-toggle><span>DEV</span><strong>LAYOUT TOOLS</strong><small>SPACING // ICONS // ANIMATION</small></button><button class="overview-dev-toggle overview-dev-toggle--rail overview-editor-toggle--rail" type="button" data-overview-editor-toggle><span>DEV</span><strong>LAYOUT EDITOR</strong><small>MOVE // RESIZE PANELS</small></button>` : '';
    const facilityRailControl=state.section==='systems'&&facilityView!=='comparison'?`<button class="facility-rail-return" type="button" data-facility-back="${facilityView==='horizon'?'comparison':'horizon'}"><span>←</span><strong>${facilityView==='horizon'?'FACILITY COMPARISON':'HORIZON SYSTEMS'}</strong><small>${facilityView==='horizon'?'HORIZON // HERON':'LOCAL FACILITY HOME'}</small></button>`:'';
    const rail = onOverview
      ? `<aside class="command-nav command-nav--systems"><div class="command-rail-brand"><img src="assets/img/ellison-tanaka-logo.svg" alt=""><strong>ETOS</strong><span>COMMAND NETWORK</span></div><div class="systems-rail-status"><small>ACTIVE MODULE</small><strong>SYSTEM OVERVIEW</strong><span>5 SYSTEMS // 1 NOTE PANEL</span></div><div class="rail-circuit" aria-hidden="true"><i></i><i></i><i></i><i></i></div>${devButtons}${renderCommandInterlock()}<div class="node-strip">${renderAuditTokenPort()}<span>NODE HB-CMD-01</span><i></i><small>LOCAL // SECURE</small></div></aside>`
      : `<nav class="command-nav command-nav--return"><div class="command-rail-brand"><img src="assets/img/ellison-tanaka-logo.svg" alt=""><strong>ETOS</strong><span>${section.label}</span></div>${facilityRailControl}<button class="return-systems-control" type="button" data-section="overview"><span>←</span><strong>RETURN TO SYSTEMS</strong><small>COMMAND OVERVIEW</small></button>${renderCommandInterlock()}<div class="node-strip">${renderAuditTokenPort()}<span>NODE HB-CMD-01</span><i></i><small>LOCAL // SECURE</small></div></nav>`;
    els.workspace.innerHTML = `<div class="command-layout ${state.section==='weather'?'command-layout--weather':''} ${state.section==='communications'?'command-layout--communications':''} ${state.section==='systems'?'command-layout--facility':''}">${rail}<section class="command-content"><header class="module-header"><div><p class="eyebrow">${onOverview?'COMMAND NETWORK':'ACTIVE COMMAND SYSTEM'}</p><h2>${section.label}</h2></div><span class="clearance">CLEARANCE // ${section.clearance}</span></header><div class="module-body">${section.render()}</div></section></div>${renderSanitizationWorkflow()}${renderAuditTokenWorkflow()}`;
  }
  let weatherTimer = null;
  const weatherRanges = {
    wind:[84,91,0], gust:[121,130,0], pressure:[27.54,27.68,2], velocity:[15,19,0], humidity:[92,96,0], visibility:[0.18,0.30,2], temperature:[75.9,78.4,1], rain:[8.8,10.1,1], coverage:[90,94,0]
  };
  function boundedValue([min,max,decimals]){ return (min + Math.random()*(max-min)).toFixed(decimals); }
  function stopWeather(){ if(weatherTimer){clearInterval(weatherTimer);weatherTimer=null;} }
  function startWeather(){
    stopWeather();
    const root=els.workspace.querySelector('[data-weather-terminal]'); if(!root)return;
    initWeatherSandbox(root);
    const update=()=>{
      const values={
        wind:`${boundedValue(weatherRanges.wind)} MPH`, gust:`${boundedValue(weatherRanges.gust)} MPH`, pressure:`${boundedValue(weatherRanges.pressure)} inHg ↓`, velocity:`${boundedValue(weatherRanges.velocity)} MPH`, humidity:`${boundedValue(weatherRanges.humidity)}%`, visibility:`< ${boundedValue(weatherRanges.visibility)} MI`, temperature:`${boundedValue(weatherRanges.temperature)} °F`, rain:`${boundedValue(weatherRanges.rain)} IN/HR`, coverage:`${boundedValue(weatherRanges.coverage)}%`
      };
      Object.entries(values).forEach(([k,v])=>{const el=root.querySelector(`[data-telemetry="${k}"]`);if(el)el.textContent=v;});
      const fictionalNow=new Date(2122,7,16,9,43,17+Math.floor((Date.now()/1000)%120));
      const clock=root.querySelector('[data-weather-clock]'); if(clock)clock.textContent=fictionalNow.toLocaleTimeString('en-US',{hour12:false})+' LOCAL';
      const restored=root.querySelector('[data-power-restored]'); if(restored&&!restored.dataset.set){restored.textContent='2122.08.16 // '+fictionalNow.toLocaleTimeString('en-US',{hour12:false})+' LOCAL';restored.dataset.set='true';}
    };
    update(); weatherTimer=setInterval(update,4200);
  }

  const WEATHER_LAYOUT_KEY = 'etos.weather.map-layout.v5';
  const weatherLayoutDefaults = {"navWidth":190,"leftWidth":145,"rightWidth":180,"gap":8,"fontScale":100,"mapZoom":101,"mapX":50,"mapY":45,"horizonX":46.3,"horizonY":45.6,"heronX":66.3,"heronY":50.2,"blinkSpeed":3,"markerSize":24,"stormX":-6,"stormY":0,"stormScale":89,"stormOpacity":85,"stormRotation":0,"stormDuration":500,"stormTimingVersion":1,"animateStorm":true,"stormReverse":false,"showLabels":true,"labelScale":100,"horizonLabelX":0.1,"horizonLabelY":-4.5,"heronLabelX":0,"heronLabelY":-4.5,"showPath":true,"currentX":21.7,"currentY":48.9,"bendX":32,"bendY":45.3,"pathWidth":1.9,"pathDashSpeed":5,"coneWidth":17,"coneOpacity":24,"showScale":true,"scaleX":70,"scaleY":91,"scaleWidth":25,"scaleText":100};
  function loadWeatherLayout(){
    let saved;
    try{saved=JSON.parse(localStorage.getItem(WEATHER_LAYOUT_KEY)||'null')}catch{return {...weatherLayoutDefaults}}
    const settings={...weatherLayoutDefaults,...saved};
    // Migrate only the rotation timing; retain the user's saved map and overlay geometry.
    if(saved && saved.stormTimingVersion!==weatherLayoutDefaults.stormTimingVersion){
      settings.stormDuration=weatherLayoutDefaults.stormDuration;
      settings.stormTimingVersion=weatherLayoutDefaults.stormTimingVersion;
      try{saveWeatherLayout(settings)}catch{/* Apply the timing in memory if storage is unavailable. */}
    }
    return settings;
  }
  function saveWeatherLayout(settings){localStorage.setItem(WEATHER_LAYOUT_KEY,JSON.stringify(settings));}
  function pctPoint(x,y){return [x*16.72,y*9.41]}
  function updateWeatherOverlay(root,s){
    const path=root.querySelector('[data-map-path]'), cone=root.querySelector('[data-map-cone]'), current=root.querySelector('[data-map-current]');
    const [sx,sy]=pctPoint(s.currentX,s.currentY), [bx,by]=pctPoint(s.bendX,s.bendY), [hx,hy]=pctPoint(s.horizonX,s.horizonY), [ex,ey]=pctPoint(s.heronX,s.heronY);
    if(path) path.setAttribute('d',`M ${sx} ${sy} Q ${bx} ${by} ${hx} ${hy} Q ${(hx+ex)/2} ${(hy+ey)/2} ${ex} ${ey}`);
    if(current){current.setAttribute('cx',sx);current.setAttribute('cy',sy)}
    if(cone){const half=s.coneWidth*3;cone.setAttribute('d',`M ${sx} ${sy-half*.18} Q ${bx} ${by-half*.45} ${ex} ${ey-half} L ${ex} ${ey+half} Q ${bx} ${by+half*.45} ${sx} ${sy+half*.18} Z`)}
    root.querySelector('[data-coded-base="horizon"]')?.setAttribute('transform',`translate(${hx} ${hy}) scale(${s.markerSize/34})`);
    root.querySelector('[data-coded-base="heron"]')?.setAttribute('transform',`translate(${ex} ${ey}) scale(${s.markerSize/34})`);
  }
  function applyWeatherLayout(root,s){
    if(!root)return;const shell=root.closest('.command-layout--weather');if(shell)shell.style.setProperty('--sandbox-nav',`${s.navWidth}px`);
    const vars={leftWidth:['--sandbox-left',s.leftWidth+'px'],rightWidth:['--sandbox-right',s.rightWidth+'px'],gap:['--sandbox-gap',s.gap+'px'],fontScale:['--sandbox-font',s.fontScale/100],mapZoom:['--sandbox-map-zoom',s.mapZoom/100],mapX:['--sandbox-map-x',s.mapX+'%'],mapY:['--sandbox-map-y',s.mapY+'%'],blinkSpeed:['--sandbox-blink',s.blinkSpeed+'s'],stormX:['--storm-x',s.stormX+'%'],stormY:['--storm-y',s.stormY+'%'],stormScale:['--storm-scale',s.stormScale/100],stormOpacity:['--storm-opacity',s.stormOpacity/100],stormRotation:['--storm-rotation',s.stormRotation+'deg'],stormDuration:['--storm-duration',s.stormDuration+'s'],labelScale:['--map-label-scale',s.labelScale/100],horizonX:['--horizon-x',s.horizonX+'%'],horizonY:['--horizon-y',s.horizonY+'%'],heronX:['--heron-x',s.heronX+'%'],heronY:['--heron-y',s.heronY+'%'],horizonLabelX:['--horizon-label-x',s.horizonLabelX+'%'],horizonLabelY:['--horizon-label-y',s.horizonLabelY+'%'],heronLabelX:['--heron-label-x',s.heronLabelX+'%'],heronLabelY:['--heron-label-y',s.heronLabelY+'%'],pathWidth:['--path-width',s.pathWidth],pathDashSpeed:['--path-dash-speed',(s.pathDashSpeed||999)+'s'],coneOpacity:['--cone-opacity',s.coneOpacity/100],scaleX:['--scale-x',s.scaleX+'%'],scaleY:['--scale-y',s.scaleY+'%'],scaleWidth:['--scale-width',s.scaleWidth+'%'],scaleText:['--scale-text',s.scaleText/100]};
    Object.values(vars).forEach(([name,val])=>root.style.setProperty(name,val));
    root.dataset.animateStorm=s.animateStorm?'true':'false';root.dataset.stormReverse=s.stormReverse?'true':'false';root.dataset.showLabels=s.showLabels?'true':'false';root.dataset.showPath=s.showPath?'true':'false';root.dataset.showScale=s.showScale?'true':'false';
    updateWeatherOverlay(root,s);
  }
  const unitForKey=key=>({fontScale:'%',mapZoom:'%',mapX:'%',mapY:'%',horizonX:'%',horizonY:'%',heronX:'%',heronY:'%',stormX:'%',stormY:'%',stormScale:'%',stormOpacity:'%',stormRotation:'°',stormDriftX:'%',stormDriftY:'%',stormRotateAmp:'°',stormDuration:'s',markerSize:'px',blinkSpeed:'s',labelScale:'%',horizonLabelX:'%',horizonLabelY:'%',heronLabelX:'%',heronLabelY:'%',currentX:'%',currentY:'%',bendX:'%',bendY:'%',pathWidth:'px',pathDashSpeed:'s',coneWidth:'%',coneOpacity:'%',scaleX:'%',scaleY:'%',scaleWidth:'%',scaleText:'%'}[key]||'px');
  function initWeatherSandbox(root){
    if(!root)return;let settings=loadWeatherLayout();applyWeatherLayout(root,settings);const panel=root.querySelector('[data-weather-sandbox]');
    if(!panel)return;
    root.querySelectorAll('[data-layout]').forEach(input=>{const key=input.dataset.layout;const isCheck=input.type==='checkbox';input[isCheck?'checked':'value']=settings[key];const output=root.querySelector(`[data-out="${key}"]`);if(output&&!isCheck)output.value=`${settings[key]}${unitForKey(key)}`;input.addEventListener('input',()=>{settings[key]=isCheck?input.checked:Number(input.value);if(output&&!isCheck)output.value=`${input.value}${unitForKey(key)}`;applyWeatherLayout(root,settings);saveWeatherLayout(settings);});});
    root.querySelectorAll('[data-sandbox-toggle]').forEach(btn=>btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;}));
    root.querySelector('[data-storm-reset]')?.addEventListener('click',()=>{settings.stormDuration=weatherLayoutDefaults.stormDuration;settings.animateStorm=true;settings.stormReverse=false;saveWeatherLayout(settings);applyWeatherLayout(root,settings);const duration=root.querySelector('[data-layout="stormDuration"]');const animate=root.querySelector('[data-layout="animateStorm"]');const reverse=root.querySelector('[data-layout="stormReverse"]');if(duration){duration.value=settings.stormDuration;root.querySelector('[data-out="stormDuration"]').value=settings.stormDuration+'s';}if(animate)animate.checked=true;if(reverse)reverse.checked=false;});
    root.querySelector('[data-sandbox-reset]')?.addEventListener('click',()=>{localStorage.removeItem(WEATHER_LAYOUT_KEY);renderTerminal();});
    root.querySelector('[data-sandbox-copy]')?.addEventListener('click',async()=>{const text=JSON.stringify(settings,null,2);const status=root.querySelector('[data-sandbox-status]');try{await navigator.clipboard.writeText(text);if(status)status.textContent='All settings copied to clipboard.';}catch{if(status)status.textContent=text.replace(/\n/g,' ');}});
  }

  const OVERVIEW_FONT_KEY = 'etos.command.overview-fonts.v7';
  const overviewFontDefaults = {weatherHeading:32,weatherMain:56,weatherStatus:78,weatherImpact:18,weatherFooter:20,beaconHeading:22,beaconMain:32,beaconFooter:14,directiveHeading:22,directiveMain:30,directiveDate:18,directiveFooter:14,commHeading:22,commBody:18,commFooter:14,systemsHeading:22,systemsMain:34,systemsBody:17,systemsFooter:14,planetHeading:28,planetBody:20,planetFooter:14};
  function loadOverviewFonts(){try{return {...overviewFontDefaults,...JSON.parse(localStorage.getItem(OVERVIEW_FONT_KEY)||'{}')}}catch{return {...overviewFontDefaults}}}
  function saveOverviewFonts(settings){localStorage.setItem(OVERVIEW_FONT_KEY,JSON.stringify(settings));}
  function applyOverviewFonts(root,settings){if(!root)return;const canvas=root.matches?.('.command-overview-shell')?root:root.querySelector('.command-overview-shell');if(!canvas)return;Object.entries(settings).forEach(([key,value])=>canvas.style.setProperty(`--ov-${key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,`${value}px`));}
  function initOverviewDevTools(root){
    if(!root)return;
    let settings=loadOverviewFonts();
    applyOverviewFonts(root,settings);
    const panel=root.querySelector('[data-overview-dev-panel]');
    root.querySelectorAll('[data-overview-font]').forEach(input=>{
      const key=input.dataset.overviewFont;
      input.value=settings[key];
      const output=root.querySelector(`[data-overview-out="${key}"]`);
      if(output)output.value=`${settings[key]}px`;
      input.addEventListener('input',()=>{
        settings[key]=Number(input.value);
        if(output)output.value=`${input.value}px`;
        applyOverviewFonts(root,settings);
        saveOverviewFonts(settings);
      });
    });
    root.querySelectorAll('[data-overview-dev-toggle]').forEach(btn=>btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;}));
    root.querySelector('[data-overview-reset]')?.addEventListener('click',()=>{localStorage.removeItem(OVERVIEW_FONT_KEY);renderTerminal();});
    root.querySelector('[data-overview-copy]')?.addEventListener('click',async()=>{
      const text=JSON.stringify(settings,null,2);
      const status=root.querySelector('[data-overview-status]');
      try{await navigator.clipboard.writeText(text);if(status)status.textContent='Overview settings copied.';}
      catch{if(status)status.textContent=text.replace(/\n/g,' ');}
    });
  }



  const OVERVIEW_LAYOUT_KEY = 'etos.command.overview-layout.v7';
  const overviewLayoutDefaults = {outerMargin:18,gapX:22,gapY:22,panelInset:2,leftCol:105,planetCol:72,weatherCol:145,rightCol:100,planetScale:88,moonScale:60,planetSpeed:60,moonSpeed:35,animatePlanet:true,iconSize:54,pulseSpeed:2.4,gridOpacity:12};
  function loadOverviewLayout(){try{return {...overviewLayoutDefaults,...JSON.parse(localStorage.getItem(OVERVIEW_LAYOUT_KEY)||'{}')}}catch{return {...overviewLayoutDefaults}}}
  function saveOverviewLayout(settings){localStorage.setItem(OVERVIEW_LAYOUT_KEY,JSON.stringify(settings));}
  function applyOverviewLayout(root,s){
    if(!root)return;
    const canvas=root.matches?.('.command-overview-shell')?root:root.querySelector('.command-overview-shell');
    if(!canvas)return;
    const vars={outerMargin:['--ov-outer-margin',s.outerMargin+'px'],gapX:['--ov-gap-x',s.gapX+'px'],gapY:['--ov-gap-y',s.gapY+'px'],panelInset:['--ov-panel-inset',s.panelInset+'px'],leftCol:['--ov-left-col',s.leftCol+'fr'],planetCol:['--ov-planet-col',s.planetCol+'fr'],weatherCol:['--ov-weather-col',s.weatherCol+'fr'],rightCol:['--ov-right-col',s.rightCol+'fr'],planetScale:['--ov-planet-scale',s.planetScale/100],moonScale:['--ov-moon-scale',s.moonScale/100],planetSpeed:['--ov-planet-speed',(s.planetSpeed||999)+'s'],moonSpeed:['--ov-moon-speed',(s.moonSpeed||999)+'s'],iconSize:['--ov-icon-size',s.iconSize+'px'],pulseSpeed:['--ov-pulse-speed',s.pulseSpeed+'s'],gridOpacity:['--ov-grid-opacity',s.gridOpacity/100]};
    Object.values(vars).forEach(([name,val])=>canvas.style.setProperty(name,val));
    canvas.dataset.animatePlanet=s.animatePlanet?'true':'false';
  }
  function layoutUnit(key){return ({outerMargin:'px',gapX:'px',gapY:'px',panelInset:'px',leftCol:'',planetCol:'',weatherCol:'',rightCol:'',planetScale:'%',moonScale:'%',planetSpeed:'s',moonSpeed:'s',iconSize:'px',pulseSpeed:'s',gridOpacity:'%'}[key]||'');}
  function initOverviewLayoutTools(root){
    if(!root)return;let settings=loadOverviewLayout();applyOverviewLayout(root,settings);const panel=root.querySelector('[data-overview-layout-panel]');
    root.querySelectorAll('[data-overview-layout]').forEach(input=>{const key=input.dataset.overviewLayout;const isCheck=input.type==='checkbox';input[isCheck?'checked':'value']=settings[key];const out=root.querySelector(`[data-layout-out="${key}"]`);if(out&&!isCheck)out.value=`${settings[key]}${layoutUnit(key)}`;input.addEventListener('input',()=>{settings[key]=isCheck?input.checked:Number(input.value);if(out&&!isCheck)out.value=`${input.value}${layoutUnit(key)}`;applyOverviewLayout(root,settings);saveOverviewLayout(settings);});});
    root.querySelectorAll('[data-overview-layout-toggle]').forEach(btn=>btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;}));
    root.querySelector('[data-layout-reset]')?.addEventListener('click',()=>{localStorage.removeItem(OVERVIEW_LAYOUT_KEY);renderTerminal();});
    root.querySelector('[data-layout-copy]')?.addEventListener('click',async()=>{const text=JSON.stringify(settings,null,2);const status=root.querySelector('[data-layout-status]');try{await navigator.clipboard.writeText(text);if(status)status.textContent='Layout settings copied.';}catch{if(status)status.textContent=text.replace(/\n/g,' ');}});
  }

  const OVERVIEW_BOX_KEY = 'etos.command.overview-boxes.v7';
  const overviewBoxDefaults = {
    beacon:{x:31.3303730017762,y:3.111425873465534,w:36.150976909413856,h:16.18413597733711,z:2},
    planetDisplay:{x:1.891651865008881,y:7.959395656279511,w:27.685612788632326,h:37.79886685552408,z:1},
    weather:{x:29.845470692717587,y:21.95656279508971,w:39.22202486678508,h:47.004721435316334,z:3},
    directive:{x:70.00177619893428,y:16.506137865911235,w:29.554174067495563,h:17.806421152030218,z:2},
    communications:{x:71.53463587921847,y:39.002832861189795,w:26.353463587921848,h:32.72143531633617,z:2},
    planetary:{x:1.7566607460035524,y:67.90557129367328,w:25.341030195381883,h:27.244570349386212,z:2},
    systems:{x:33.22735346358792,y:73.26156751652502,w:34.04440497335702,h:19.905571293673276,z:2}
  };
  const LOCKED_OVERVIEW_MIGRATION_KEY = 'etos.command.locked-defaults.0.5.5';
  function installLockedOverviewDefaults(){
    if(localStorage.getItem(LOCKED_OVERVIEW_MIGRATION_KEY)==='done') return;
    localStorage.removeItem(OVERVIEW_FONT_KEY);
    localStorage.removeItem(OVERVIEW_LAYOUT_KEY);
    localStorage.removeItem(OVERVIEW_BOX_KEY);
    localStorage.setItem(OVERVIEW_FONT_KEY, JSON.stringify(overviewFontDefaults));
    localStorage.setItem(OVERVIEW_LAYOUT_KEY, JSON.stringify(overviewLayoutDefaults));
    localStorage.setItem(OVERVIEW_BOX_KEY, JSON.stringify(overviewBoxDefaults));
    localStorage.setItem(LOCKED_OVERVIEW_MIGRATION_KEY, 'done');
  }
  function loadOverviewBoxes(){ try { return {...overviewBoxDefaults, ...JSON.parse(localStorage.getItem(OVERVIEW_BOX_KEY)||'{}')}; } catch { return {...overviewBoxDefaults}; } }
  function saveOverviewBoxes(boxes){ localStorage.setItem(OVERVIEW_BOX_KEY, JSON.stringify(boxes)); }
  function applyOverviewBoxes(root, boxes){
    const shell = root.matches?.('.command-overview-shell') ? root : root.querySelector('.command-overview-shell');
    if(!shell) return;
    Object.entries(boxes).forEach(([key,val])=>{
      const el = shell.querySelector(`[data-box="${key}"]`);
      if(!el || !val) return;
      el.style.left = `${val.x}%`;
      el.style.top = `${val.y}%`;
      el.style.width = `${val.w}%`;
      el.style.height = `${val.h}%`;
      el.style.zIndex = String(val.z || 2);
    });
  }
  function clearOverviewBoxStyles(root){
    const shell = root.matches?.('.command-overview-shell') ? root : root.querySelector('.command-overview-shell');
    if(!shell) return;
    shell.querySelectorAll('[data-box]').forEach(el=>{
      ['left','top','width','height','zIndex'].forEach(property=>{el.style[property]='';});
    });
  }
  function initOverviewEditor(root){
    if(!root) return;
    const shell = root.querySelector('.command-overview-shell');
    const field = root.querySelector('.overview-primary-field');
    const panel = root.querySelector('[data-overview-editor-panel]');
    if(!shell || !field || !panel) return;
    let boxes = loadOverviewBoxes();
    clearOverviewBoxStyles(root);
    field.querySelectorAll('[data-box]').forEach(el=>{ if(!el.querySelector('.layout-resize-handle')){ const h=document.createElement('span'); h.className='layout-resize-handle'; h.setAttribute('data-layout-handle',''); el.appendChild(h);} });
    let editorActive = false; let drag = null;
    const selectedOut = panel.querySelector('[data-editor-selected]'); const readout = panel.querySelector('[data-editor-readout]'); const status = panel.querySelector('[data-editor-status]');
    const updateReadout = (key)=>{ const b=boxes[key]; if(!b) return; if(selectedOut) selectedOut.textContent = key.toUpperCase(); if(readout) readout.textContent = `X ${b.x.toFixed(1)}%  Y ${b.y.toFixed(1)}%  W ${b.w.toFixed(1)}%  H ${b.h.toFixed(1)}%`; };
    const setEditor = (on)=>{ editorActive = on; shell.dataset.layoutEditor = on ? 'true' : 'false'; panel.hidden = !on; if(on)applyOverviewBoxes(root,boxes);else clearOverviewBoxStyles(root);if(status) status.textContent = on ? 'Editor active.' : 'Editor inactive.'; };
    root.querySelectorAll('[data-overview-editor-toggle]').forEach(btn=>btn.addEventListener('click',()=>setEditor(!editorActive)));
    panel.querySelector('[data-editor-reset]')?.addEventListener('click',()=>{ localStorage.removeItem(OVERVIEW_BOX_KEY); boxes = loadOverviewBoxes(); applyOverviewBoxes(root, boxes); updateReadout('weather'); if(status) status.textContent='Layout reset.'; });
    panel.querySelector('[data-editor-copy]')?.addEventListener('click', async()=>{ const txt = JSON.stringify(boxes,null,2); try{ await navigator.clipboard.writeText(txt); if(status) status.textContent='PANEL POSITIONS COPIED.'; } catch { if(status) status.textContent = txt.replace(/\n/g,' '); } });
    panel.querySelector('[data-editor-copy-all]')?.addEventListener('click', async()=>{
      const payload={panelLayout:boxes,typography:loadOverviewFonts(),layoutAndAnimation:loadOverviewLayout()};
      const txt=JSON.stringify(payload,null,2);
      try{await navigator.clipboard.writeText(txt);if(status)status.textContent='ALL OVERVIEW SETTINGS COPIED.';}
      catch{if(status)status.textContent=txt.replace(/\n/g,' ');}
    });
    field.addEventListener('pointerdown', e=>{
      if(!editorActive) return;
      const boxEl = e.target.closest('[data-box]');
      if(!boxEl || !field.contains(boxEl)) return;
      e.preventDefault(); e.stopPropagation();
      const key = boxEl.dataset.box; const rect = field.getBoundingClientRect(); const b = boxes[key]; if(!b) return;
      const mode = e.target.closest('[data-layout-handle]') ? 'resize' : 'drag';
      drag = { key, mode, startX:e.clientX, startY:e.clientY, rect, start:{...b}, el:boxEl };
      field.setPointerCapture?.(e.pointerId); shell.querySelectorAll('[data-box]').forEach(n=>n.classList.toggle('is-selected', n===boxEl)); updateReadout(key);
    });
    field.addEventListener('pointermove', e=>{
      if(!drag) return;
      const dx = ((e.clientX - drag.startX) / drag.rect.width) * 100;
      const dy = ((e.clientY - drag.startY) / drag.rect.height) * 100;
      const b = {...drag.start};
      if(drag.mode === 'drag') { b.x = Math.max(0, Math.min(100 - b.w, b.x + dx)); b.y = Math.max(0, Math.min(100 - b.h, b.y + dy)); }
      else { b.w = Math.max(8, Math.min(100 - b.x, b.w + dx)); b.h = Math.max(8, Math.min(100 - b.y, b.h + dy)); }
      boxes[drag.key] = b; applyOverviewBoxes(root, boxes); updateReadout(drag.key);
    });
    const finishDrag = ()=>{ if(!drag) return; saveOverviewBoxes(boxes); if(status) status.textContent='Layout saved locally.'; drag=null; };
    field.addEventListener('pointerup', finishDrag); field.addEventListener('pointercancel', finishDrag); field.addEventListener('pointerleave', e=>{ if(drag && e.buttons===0) finishDrag(); });
    setEditor(false);
  }

  let overviewTimer = null;
  const overviewRanges = { o2:[29.6,30.1,1], humidity:[94,97,0], pressure:[1.06,1.09,2], temp:[30.8,32.1,1] };
  const overviewIon = ['MODERATE','ELEVATED','ELEVATED'];
  function stopOverviewAmbient(){ if(overviewTimer){ clearInterval(overviewTimer); overviewTimer = null; } }
  function startOverviewAmbient(){
    stopOverviewAmbient();
    const root = els.workspace.querySelector('.command-overview-shell');
    if(!root) return;
    const update = ()=>{
      const values = {
        o2: `${boundedValue(overviewRanges.o2)}%`,
        humidity: `${boundedValue(overviewRanges.humidity)}%`,
        pressure: `${boundedValue(overviewRanges.pressure)} ATM`,
        temp: `${boundedValue(overviewRanges.temp)}°C`,
        bio: 'HIGH',
        ion: overviewIon[Math.floor(Math.random()*overviewIon.length)]
      };
      Object.entries(values).forEach(([k,v])=>{ const el=root.querySelector(`[data-atmo="${k}"]`); if(el) el.textContent=v; });
    };
    update();
    overviewTimer = setInterval(update, 3600);
  }

  const BEACON_INTERVAL_MS = 30000;
  const BEACON_TRANSMIT_MS = 1400;
  let beaconRetransmissions = 121740;
  let beaconNextTransmission = Date.now() + BEACON_INTERVAL_MS;
  let beaconTransmittingUntil = 0;
  let beaconAnimationFrame = null;

  function stopBeaconMonitor(){
    if(beaconAnimationFrame !== null) cancelAnimationFrame(beaconAnimationFrame);
    beaconAnimationFrame = null;
  }

  function startBeaconMonitor(){
    stopBeaconMonitor();
    const root = els.workspace.querySelector('.command-overview-shell');
    if(!root) return;
    const countdown = root.querySelector('[data-beacon-countdown]');
    const count = root.querySelector('[data-beacon-count]');
    const progress = root.querySelector('[data-beacon-progress]');
    const card = root.querySelector('.beacon-carrier-card');
    if(!countdown || !count || !progress || !card) return;
    let displayedSecond = null;
    let displayedCount = null;

    const update = () => {
      const now = Date.now();
      if(beaconTransmittingUntil && now >= beaconTransmittingUntil){
        beaconTransmittingUntil = 0;
        beaconNextTransmission = now + BEACON_INTERVAL_MS;
      }
      if(!beaconTransmittingUntil && now >= beaconNextTransmission){
        beaconRetransmissions += 1;
        beaconTransmittingUntil = now + BEACON_TRANSMIT_MS;
        playAudio('dataPacket');
      }

      const transmitting = beaconTransmittingUntil > now;
      card.classList.toggle('is-transmitting', transmitting);
      if(transmitting){
        if(displayedSecond !== 'transmitting'){
          countdown.textContent = 'TRANSMITTING…';
          displayedSecond = 'transmitting';
        }
        const transmitProgress = 1 - ((beaconTransmittingUntil - now) / BEACON_TRANSMIT_MS);
        progress.style.transform = `scaleX(${Math.max(0,Math.min(1,transmitProgress))})`;
      } else {
        const remainingMs = Math.max(0, beaconNextTransmission - now);
        const remainingSecond = Math.ceil(remainingMs / 1000);
        if(displayedSecond !== remainingSecond){
          countdown.textContent = `00:${String(remainingSecond).padStart(2,'0')}`;
          displayedSecond = remainingSecond;
        }
        progress.style.transform = `scaleX(${Math.max(0,Math.min(1,remainingMs / BEACON_INTERVAL_MS))})`;
      }
      if(displayedCount !== beaconRetransmissions){
        count.textContent = beaconRetransmissions.toLocaleString('en-US');
        displayedCount = beaconRetransmissions;
      }
      beaconAnimationFrame = requestAnimationFrame(update);
    };
    beaconAnimationFrame = requestAnimationFrame(update);
  }

  function stopArgozaCountdown(){
    if(argozaCountdownTimer!==null)clearInterval(argozaCountdownTimer);
    argozaCountdownTimer=null;
  }

  function startArgozaCountdown(){
    stopArgozaCountdown();
    const update=()=>{
      const output=els.workspace.querySelector('[data-argoza-countdown]');
      if(!output)return;
      const remaining=Math.max(0,new Date(ARGOZA_ARRIVAL_DATETIME).getTime()-Date.now());
      if(remaining===0){output.textContent='ARRIVAL WINDOW // ACTIVE';return;}
      const days=Math.floor(remaining/86400000),hours=Math.floor((remaining%86400000)/3600000),minutes=Math.floor((remaining%3600000)/60000),seconds=Math.floor((remaining%60000)/1000);
      output.textContent=`${days}D ${String(hours).padStart(2,'0')}H ${String(minutes).padStart(2,'0')}M ${String(seconds).padStart(2,'0')}S`;
    };
    update();
    argozaCountdownTimer=setInterval(update,1000);
  }

  function stopArgozaMapCoordinateSpaces(){
    argozaMapResizeObserver?.disconnect();
    argozaMapResizeObserver=null;
  }

  function fitArgozaMapFrame(frame){
    const coordinateSpace=frame.querySelector('[data-argoza-map-coordinate-space]');
    const image=coordinateSpace?.querySelector(':scope > img');
    const sourceWidth=image?.naturalWidth||Number(image?.getAttribute('width'))||Number(frame.dataset.mapWidth);
    const sourceHeight=image?.naturalHeight||Number(image?.getAttribute('height'))||Number(frame.dataset.mapHeight);
    const frameWidth=frame.clientWidth,frameHeight=frame.clientHeight;
    if(!coordinateSpace||!sourceWidth||!sourceHeight||!frameWidth||!frameHeight)return;
    const containScale=Math.min(frameWidth/sourceWidth,frameHeight/sourceHeight);
    const scale=frame.classList.contains('weather-map-frame')
      ? Math.min(Math.max(frameWidth/sourceWidth,frameHeight/sourceHeight),containScale*1.5)
      : containScale;
    coordinateSpace.style.width=`${sourceWidth*scale}px`;
    coordinateSpace.style.height=frame.classList.contains('weather-map-frame')?`${sourceHeight*scale}px`:'auto';
  }

  function initArgozaMapCoordinateSpaces(){
    stopArgozaMapCoordinateSpaces();
    const frames=[...els.workspace.querySelectorAll('[data-argoza-map-frame]')];
    if(!frames.length)return;
    frames.forEach(frame=>{
      fitArgozaMapFrame(frame);
      const image=frame.querySelector('[data-argoza-map-coordinate-space] > img');
      if(image&&!image.complete)image.addEventListener('load',()=>fitArgozaMapFrame(frame),{once:true});
    });
    if('ResizeObserver' in window){
      argozaMapResizeObserver=new ResizeObserver(entries=>{
        entries.forEach(entry=>fitArgozaMapFrame(entry.target));
        if(els.workspace.querySelector('[data-argoza-facility-stage]')){
          requestAnimationFrame(()=>argozaFacilityRoom?setArgozaFacilityFocus(argozaFacilityRoom,false):applyArgozaFacilityTransform());
        }
      });
      frames.forEach(frame=>argozaMapResizeObserver.observe(frame));
    }
  }

  function clampArgozaFacilityMap(stage){
    if(!stage)return;
    argozaFacilityMap.zoom=Math.max(ARGOZA_FACILITY_ZOOM.min,Math.min(ARGOZA_FACILITY_ZOOM.max,argozaFacilityMap.zoom));
    const maxX=Math.max(0,stage.clientWidth*(argozaFacilityMap.zoom-1)/2);
    const maxY=Math.max(0,stage.clientHeight*(argozaFacilityMap.zoom-1)/2);
    argozaFacilityMap.panX=Math.max(-maxX,Math.min(maxX,argozaFacilityMap.panX));
    argozaFacilityMap.panY=Math.max(-maxY,Math.min(maxY,argozaFacilityMap.panY));
  }

  function applyArgozaFacilityTransform(animate=false){
    const canvas=els.workspace.querySelector('[data-argoza-facility-canvas]'),stage=els.workspace.querySelector('[data-argoza-facility-stage]');
    if(!canvas||!stage)return;
    clampArgozaFacilityMap(stage);
    canvas.style.transition=animate?`transform ${ARGOZA_FACILITY_ZOOM.transitionMs}ms cubic-bezier(.22,.61,.36,1)`:'none';
    canvas.style.setProperty('--facility-zoom',argozaFacilityMap.zoom);
    canvas.style.setProperty('--facility-pan-x',`${argozaFacilityMap.panX}px`);
    canvas.style.setProperty('--facility-pan-y',`${argozaFacilityMap.panY}px`);
  }

  function setArgozaFacilityFocus(roomKey,animate=true){
    argozaFacilityRoom=roomKey||null;
    const stage=els.workspace.querySelector('[data-argoza-facility-stage]'),wrap=els.workspace.querySelector('.argoza-floorplan-wrap');
    if(!stage)return;
    els.workspace.querySelectorAll('.argoza-room-hotspot').forEach(button=>button.classList.toggle('is-selected',button.dataset.argozaRoom===argozaFacilityRoom));
    const summary=els.workspace.querySelector('[data-argoza-room-summary]');
    if(!roomKey){
      argozaFacilityMap={zoom:1,panX:0,panY:0};
      if(summary)summary.innerHTML='<span>SELECTED FACILITY AREA</span><h3>NO AREA SELECTED</h3><p>Select a facility area or mission reference to reveal its function.</p>';
      applyArgozaFacilityTransform(animate);
      return;
    }
    const room=argozaFacilityRooms[roomKey];if(!room)return;
    const focus=ARGOZA_FACILITY_FOCUS[roomKey]||{x:room.x,y:room.y,zoom:ARGOZA_FACILITY_ZOOM.focus};
    const baseWidth=wrap?.offsetWidth||stage.clientWidth*.94,baseHeight=wrap?.offsetHeight||stage.clientHeight*.94;
    argozaFacilityMap.zoom=focus.zoom;
    argozaFacilityMap.panX=(50-focus.x)/100*baseWidth*focus.zoom;
    argozaFacilityMap.panY=(50-focus.y)/100*baseHeight*focus.zoom;
    if(summary)summary.innerHTML=`<span>SELECTED FACILITY AREA</span><h3>${room.name}</h3><p>${room.summary}</p>`;
    applyArgozaFacilityTransform(animate);
  }

  function initArgozaFacilityMap(){
    const stage=els.workspace.querySelector('[data-argoza-facility-stage]');
    if(!stage)return;
    const pointers=new Map();let lastDistance=0,moved=false;
    stage.querySelectorAll('.argoza-room-hotspot').forEach(button=>{
      button.addEventListener('pointerdown',event=>{moved=false;event.stopPropagation();});
      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();moved=false;playAudio('uiSelect');setArgozaFacilityFocus(button.dataset.argozaRoom,true);});
    });
    stage.addEventListener('pointerdown',event=>{if(event.target.closest('.argoza-map-controls,.argoza-room-hotspot')){moved=false;return;}if(pointers.size===0)moved=false;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY});stage.setPointerCapture?.(event.pointerId);if(pointers.size===2){const points=[...pointers.values()];lastDistance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);}});
    stage.addEventListener('pointermove',event=>{const point=pointers.get(event.pointerId);if(!point)return;const oldX=point.x,oldY=point.y;point.x=event.clientX;point.y=event.clientY;if(Math.hypot(point.x-point.startX,point.y-point.startY)>7)moved=true;if(pointers.size===1){argozaFacilityMap.panX+=point.x-oldX;argozaFacilityMap.panY+=point.y-oldY;}else if(pointers.size===2){const points=[...pointers.values()],distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);if(lastDistance>0)argozaFacilityMap.zoom*=distance/lastDistance;lastDistance=distance;moved=true;}applyArgozaFacilityTransform();});
    const finish=event=>{pointers.delete(event.pointerId);lastDistance=0;};stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
    stage.addEventListener('click',event=>{if(event.target.closest('.argoza-room-hotspot')){moved=false;return;}if(moved){event.preventDefault();event.stopPropagation();moved=false;}},true);
    stage.addEventListener('wheel',event=>{event.preventDefault();const direction=event.deltaY<0?1:-1;argozaFacilityMap.zoom+=direction*ARGOZA_FACILITY_ZOOM.step;applyArgozaFacilityTransform();},{passive:false});
    if(argozaFacilityRoom)setArgozaFacilityFocus(argozaFacilityRoom,false);else applyArgozaFacilityTransform();
  }

  function renderTerminal(){
    const profile = profiles[state.activeTerminal] || profiles.command;
    els.app.className = `etos-shell ${profile.theme}`;
    els.title.textContent=profile.title; els.eyebrow.textContent=profile.eyebrow; els.terminalStatus.textContent=profile.status; els.location.textContent=profile.location; els.interface.textContent=profile.interface; els.select.value=state.activeTerminal;
    stopWeather();
    stopOverviewAmbient();
    stopBeaconMonitor();
    stopCommunicationsAudio();
    stopFacilityManagement();
    stopArgozaCountdown();
    stopArgozaMapCoordinateSpaces();
    if(state.activeTerminal==='command') { renderCommand(profile); if(state.section==='weather'){startWeather();initArgozaMapCoordinateSpaces();} else if(state.section==='overview'){ initOverviewDevTools(els.workspace); initOverviewLayoutTools(els.workspace); initOverviewEditor(els.workspace); startOverviewAmbient(); startBeaconMonitor(); } else if(state.section==='communications'){ initCommunications(els.workspace); } else if(state.section==='systems'){ initFacilityManagement(els.workspace); } else if(state.section==='directive' && directiveView==='lock'){ setTimeout(()=>document.getElementById('directive-access-code')?.focus(),50); } startSanitizationSystems(); } else {stopSanitizationSystems();els.workspace.innerHTML=profile.render();if(state.activeTerminal==='argoza'){startArgozaCountdown();initArgozaMapCoordinateSpaces();initArgozaFacilityMap();}}
    applyDevVisibility();
  }
  function initialize(){
    const audioUnlock=window.ETOSAudio?.unlock();if(audioUnlock)void audioUnlock.then(ok=>{if(ok){playAudio('startup');window.ETOSAudio.startAmbient();}});
    preloadCommunicationsAudio();
    preloadWeatherAssets();
    state.initialized=true;
    state.activeTerminal='argoza';
    state.section='home';
    devControlsEnabled=false;
    if(els.devVisible)els.devVisible.checked=false;
    argozaSection='home';
    argozaPlanetaryLevel='system';
    saveState();
    showScreen('terminal');
    try { renderTerminal(); }
    catch (error) {
      console.error('ETOS initialization failed:', error);
      els.workspace.innerHTML = '<div class="startup-error"><h2>TERMINAL STARTUP RECOVERY</h2><p>The shipboard interface encountered a recoverable loading error.</p><button data-argoza-section="home" class="inline-action">RELOAD SHIPBOARD INTERFACE</button></div>';
    }
    if(!argozaRecoverySeen())startArgozaRecovery();
  }
  function openWarden(){ cancelHold(); playAudio('confirm');const preparation=window.ETOSAudio?.prepareSanitizationAudio?.();if(preparation)void preparation.then(ok=>{syncWardenAudioDiagnostics();if(ok)window.ETOSAudio.startAmbient();});else window.ETOSAudio?.startAmbient();els.overlay.hidden=false; els.pinStep.hidden=false; els.controls.hidden=true;els.pin.value='';els.pinError.textContent='';syncWardenSanitizationDisplay();syncWardenAudioDiagnostics();setTimeout(()=>els.pin.focus(),50); }
  function closeWarden(){ els.overlay.hidden=true; }
  function authorize(){ if(els.pin.value===WARDEN_PIN){playAudio('confirm');els.pinStep.hidden=true;els.controls.hidden=false;els.select.value=state.activeTerminal;syncWardenSanitizationDisplay();syncWardenAudioDiagnostics();const prefs=loadDevPrefs(); if(els.devVisible) els.devVisible.checked=!!prefs.show;}else{playAudio('reject');els.pinError.textContent='AUTHORIZATION DENIED';els.pin.value='';} }
  async function transferTo(key){ stopArgozaRecovery();closeWarden();stopSanitizationSystems();stopMedicalHardwareWorkflows();suspendAuditTokenWorkflow();els.docOverlay.hidden=true; if(els.skip.checked){ state.activeTerminal=key; state.section=profiles[key].defaultSection||'overview'; state.initialized=true; saveState(); renderTerminal(); showScreen('terminal');playAudio('confirm');return; } showScreen('transfer'); els.progress.style.width='0%'; const lines=['VERIFYING LOCAL HARDWARE...','CLOSING ACTIVE SESSION...','ROUTING ENCRYPTED NODE...','MOUNTING TERMINAL PROFILE...','AUTHENTICATING LOCAL CACHE...','TERMINAL READY']; const start=performance.now();let lastAudioStep=-1; await new Promise(resolve=>{const tick=now=>{const p=Math.min(1,(now-start)/TRANSFER_MS),step=Math.min(lines.length-1,Math.floor(p*lines.length));els.progress.style.width=`${Math.round(p*100)}%`;els.transferLine.textContent=lines[step];if(step!==lastAudioStep){lastAudioStep=step;if(step<lines.length-1&&step%2===0)playAudio('process');}p<1?requestAnimationFrame(tick):resolve();};requestAnimationFrame(tick);}); state.activeTerminal=key;state.section=profiles[key].defaultSection||'overview';state.initialized=true;saveState();renderTerminal();showScreen('terminal');playAudio('confirm'); }
  function openDocument(key){ const doc=documents[key]; if(!doc)return; els.docTitle.textContent=doc.title; els.docBody.innerHTML='<div class="document-loading"><strong>LOADING FILE...</strong><span>DECODING IMAGE ASSET</span></div>'; els.docOverlay.hidden=false; const image=new Image(); image.alt=doc.title; image.onload=()=>{els.docBody.innerHTML='';els.docBody.appendChild(image);}; image.onerror=()=>{els.docBody.innerHTML='<div class="document-loading document-loading--error"><strong>FILE LOAD ERROR</strong><span>ASSET COULD NOT BE DECODED</span></div>';}; image.src=doc.image; }
  function returnToBoot(){playAudio('uiBack');stopArgozaRecovery();window.ETOSAudio?.stopAmbient();stopSanitizationSystems();stopMedicalHardwareWorkflows();suspendAuditTokenWorkflow();closeWarden();state.initialized=false;saveState();showScreen('boot');}
  async function refreshApplication(){
    els.refreshApp.disabled=true;els.refreshApp.textContent='CLEARING LOCAL CACHE...';
    try{
      if('serviceWorker' in navigator){
        const registrations=await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(async registration=>{try{await registration.update();}catch{}await registration.unregister();}));
      }
      if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)));}
    }finally{
      const next=new URL(location.href);next.searchParams.set('build',VERSION);location.replace(next.href);
    }
  }
  function resetSession(){if(!confirm('Reset all ETOS session data and return to the boot screen?'))return;stopArgozaRecovery();window.ETOSAudio?.stopAmbient();stopSanitizationSystems();stopSanitizationFinalCountdown();window.ETOSAudio?.stopFacilityAlarm?.();window.ETOSAudio?.stopFacilityAlarmTest?.();stopMedicalHardwareWorkflows();suspendAuditTokenWorkflow();sanitizationDisplayDismissed=false;sanitizationActivationAnnouncementPending=false;localStorage.removeItem(STORAGE_KEY);state=loadState();closeWarden();renderTerminal();showScreen('boot');}
  function beginHold(event){if(event?.pointerType==='mouse'&&event.button!==0)return;if(!window.ETOSAudio?.isUnlocked())void window.ETOSAudio?.unlock();cancelHold();holdTimer=setTimeout(openWarden,3000);} function cancelHold(){if(holdTimer!==null)clearTimeout(holdTimer);holdTimer=null;} function bindHoldTrigger(trigger){trigger.addEventListener('pointerdown',beginHold);['pointerup','pointercancel','pointerleave'].forEach(n=>trigger.addEventListener(n,cancelHold));trigger.addEventListener('contextmenu',e=>e.preventDefault());}

  els.init.addEventListener('click',initialize);bindHoldTrigger(els.logo);bindHoldTrigger(els.title);els.close.addEventListener('click',()=>{playAudio('uiBack');closeWarden();});els.pinSubmit.addEventListener('click',authorize);els.pin.addEventListener('keydown',e=>{if(e.key==='Enter')authorize();});els.apply.addEventListener('click',()=>transferTo(els.select.value));els.returnBoot.addEventListener('click',returnToBoot);els.refreshApp.addEventListener('click',refreshApplication);els.reset.addEventListener('click',resetSession);els.sanitizationDisplay?.addEventListener('click',toggleSanitizationDisplay);els.sanitizationFinalCountdown?.addEventListener('click',startSanitizationFinalCountdown);els.sanitizationAlarmMute?.addEventListener('click',muteFacilityAlarm);els.sanitizationWarningTest?.addEventListener('click',testSanitizationWarning);els.sanitizationAlarmTest?.addEventListener('click',toggleFacilityAlarmTest);els.controls.addEventListener('click',e=>{const reset=e.target.closest('[data-sequence-reset]');if(reset)runSequenceReset(reset.dataset.sequenceReset);}); if(els.devVisible){ const prefs=loadDevPrefs(); els.devVisible.checked=!!prefs.show; els.devVisible.addEventListener('change',()=>{ const show=!!els.devVisible.checked; saveDevPrefs({show}); els.app.dataset.devControls=show?'shown':'hidden'; if(state.activeTerminal==='command'||state.activeTerminal==='argoza'){ renderTerminal(); } }); } els.docClose.addEventListener('click',()=>{playAudio('uiBack');els.docOverlay.hidden=true;});els.docOverlay.addEventListener('click',e=>{if(e.target===els.docOverlay)els.docOverlay.hidden=true;});
  document.addEventListener('etos-audio-asset-status',syncWardenAudioDiagnostics);
  document.addEventListener('etos-facility-alarm-state',syncWardenSanitizationDisplay);
  els.workspace.addEventListener('input',e=>{
    if(e.target.matches('[data-sanitization-minutes],[data-sanitization-seconds]')){updateSanitizationPreview();return;}
    const input=e.target.closest('[data-argoza-marker-axis]');if(!input)return;
    const panel=input.closest('[data-argoza-marker-dev]'),key=panel?.dataset.argozaMarkerDev,axis=input.dataset.argozaMarkerAxis,value=Number(input.value);
    if(!key||!argozaMarkerLayout[key]||!Number.isFinite(value))return;
    const min=axis==='scale'?.5:0,max=axis==='scale'?2.5:100,unit=axis==='scale'?'':'%';
    argozaMarkerLayout[key]={...argozaMarkerLayout[key],[axis]:Math.max(min,Math.min(max,value))};saveArgozaMarkerLayout();
    const marker=els.workspace.querySelector(`[data-argoza-marker="${key}"]`);if(marker)marker.style.setProperty(`--marker-${axis}`,`${argozaMarkerLayout[key][axis]}${unit}`);
    const exportField=els.workspace.querySelector(`[data-argoza-marker-export="${key}"]`);if(exportField){const exportValue=`${key}: x=${argozaMarkerLayout[key].x}, y=${argozaMarkerLayout[key].y}, scale=${argozaMarkerLayout[key].scale}`;exportField.value=exportValue;exportField.setAttribute('value',exportValue);}
  });
  els.workspace.addEventListener('click',e=>{
    if(state.initialized&&!window.ETOSAudio?.isUnlocked()){const audioUnlock=window.ETOSAudio?.unlock();if(audioUnlock)void audioUnlock.then(ok=>{if(ok)window.ETOSAudio.startAmbient();});}
    if(e.target.closest('[data-argoza-recovery-replay]')){playAudio('confirm');startArgozaRecovery();return;}
    if(medicalInjectorSuppressClick&&e.target.closest('[data-medical-injector-open],.medical-hardware-layer')){medicalInjectorSuppressClick=false;e.preventDefault();return;}
    if(e.target.closest('[data-audit-token-abort]')){resetAuditTokenSession();return;}
    if(e.target.closest('[data-audit-token-passcode]')){authorizeAuditTokenPasscode();return;}
    if(e.target.closest('[data-audit-token-acquire]')){beginAuditTokenAcquisition();return;}
    if(e.target.closest('[data-audit-token-close]')){closeCompletedAuditToken();return;}
    if(e.target.closest('[data-audit-token-port]')){if(auditTokenSuppressClick){auditTokenSuppressClick=false;return;}if(auditTokenState().connected)openConnectedAuditToken();return;}
    if(e.target.closest('[data-command-interlock]')){const p=sanitizationState();if(p.keyEngaged&&p.phase==='engaged-idle'){reopenSanitizationProtocol();return;}if(!p.keyEngaged&&p.phase==='dormant'&&commandInterlockHoldTimer===null&&!commandInterlockTurnTimer){playAudio('reject');setCommandInterlockMessage('COMMAND KEY NOT DETECTED');}return;}
    if(e.target.closest('[data-sanitization-abort]')){abortSanitizationProtocol();return;}
    if(e.target.closest('[data-sanitization-authenticate]')){authenticateSanitization();return;}
    if(e.target.closest('[data-sanitization-review]')){reviewSanitizationDelay();return;}
    if(e.target.closest('[data-sanitization-proceed]')){activateSanitization();return;}
    const argozaSectionButton=e.target.closest('[data-argoza-section]');
    if(argozaSectionButton){playAudio('uiSelect');argozaSection=argozaSectionButton.dataset.argozaSection;if(argozaSection==='mission')argozaMissionDirective=false;resetArgozaPersonnelBriefing();if(argozaSection==='briefing'&&argozaBriefingFile==='personnel')argozaBriefingFile='deployment';if(argozaSection==='planetary')argozaPlanetaryLevel='system';renderTerminal();return;}
    if(e.target.closest('[data-argoza-full-mission]')){playAudio('uiSelect');argozaMissionDirective=true;renderTerminal();return;}
    if(e.target.closest('[data-argoza-mission-summary]')){playAudio('uiBack');argozaMissionDirective=false;renderTerminal();return;}
    if(e.target.closest('[data-argoza-personnel-submit]')){authorizeArgozaPersonnelBriefing();return;}
    if(e.target.closest('[data-argoza-personnel-back]')){playAudio('uiBack');resetArgozaPersonnelBriefing('access');renderTerminal();setTimeout(()=>document.getElementById('argoza-personnel-code')?.focus(),40);return;}
    if(e.target.closest('[data-argoza-personnel-files]')){playAudio('uiBack');resetArgozaPersonnelBriefing();argozaBriefingFile='deployment';renderTerminal();return;}
    const argozaCrewTeamButton=e.target.closest('[data-argoza-crew-team]');
    if(argozaCrewTeamButton){playAudio('uiSelect');argozaCrewTeam=argozaCrewTeamButton.dataset.argozaCrewTeam;renderTerminal();return;}
    const argozaPlanetaryButton=e.target.closest('[data-argoza-planetary]');
    if(argozaPlanetaryButton&&!argozaPlanetaryButton.disabled){playAudio(argozaPlanetaryButton.dataset.argozaPlanetary==='system'?'uiBack':'uiSelect');argozaPlanetaryLevel=argozaPlanetaryButton.dataset.argozaPlanetary;if(argozaPlanetaryLevel!=='base')argozaRoomFocus(null);renderTerminal();return;}
    const argozaMarkerReset=e.target.closest('[data-argoza-marker-reset]');
    if(argozaMarkerReset){const key=argozaMarkerReset.dataset.argozaMarkerReset;argozaMarkerLayout[key]={...ARGOZA_MARKER_DEFAULTS[key]};saveArgozaMarkerLayout();renderTerminal();return;}
    const argozaMarkerCopy=e.target.closest('[data-argoza-marker-copy]');
    if(argozaMarkerCopy){const key=argozaMarkerCopy.dataset.argozaMarkerCopy,field=els.workspace.querySelector(`[data-argoza-marker-export="${key}"]`);if(field){field.focus();field.select();navigator.clipboard?.writeText(field.value).catch(()=>{});}return;}
    const argozaFileButton=e.target.closest('[data-argoza-file]');
    if(argozaFileButton){argozaBriefingFile=argozaFileButton.dataset.argozaFile;if(argozaBriefingFile==='manifest')argozaManifestBranch='support';if(argozaBriefingFile==='personnel'){playAudio('restricted');resetArgozaPersonnelBriefing('access');renderTerminal();setTimeout(()=>document.getElementById('argoza-personnel-code')?.focus(),40);return;}playAudio('uiSelect');resetArgozaPersonnelBriefing();if(argozaBriefingFile!=='layout')argozaRoomFocus(null);renderTerminal();return;}
    const argozaManifestButton=e.target.closest('[data-argoza-manifest-branch]');
    if(argozaManifestButton){playAudio('uiSelect');argozaManifestBranch=argozaManifestButton.dataset.argozaManifestBranch==='military'?'military':'support';renderTerminal();return;}
    const argozaRoomButton=e.target.closest('[data-argoza-room]');
    if(argozaRoomButton){playAudio('uiSelect');setArgozaFacilityFocus(argozaRoomButton.dataset.argozaRoom,true);return;}
    if(e.target.closest('[data-argoza-map-reset]')){setArgozaFacilityFocus(null,true);return;}
    const argozaZoomButton=e.target.closest('[data-argoza-map-zoom]');
    if(argozaZoomButton){const direction=argozaZoomButton.dataset.argozaMapZoom==='in'?1:-1;argozaFacilityMap.zoom=Math.max(ARGOZA_FACILITY_ZOOM.min,Math.min(ARGOZA_FACILITY_ZOOM.max,argozaFacilityMap.zoom+direction*ARGOZA_FACILITY_ZOOM.step));applyArgozaFacilityTransform();return;}
    const edemSectionButton=e.target.closest('[data-edem-section]');
    if(edemSectionButton){playAudio('uiSelect');edemSection=edemSectionButton.dataset.edemSection;renderTerminal();return;}
    const edemEntryButton=e.target.closest('[data-edem-entry]');
    if(edemEntryButton&&['mission','research','journal'].includes(edemSection)){playAudio('uiSelect');edemSelection[edemSection]=Number(edemEntryButton.dataset.edemEntry);renderTerminal();return;}
    const genomicOverlay=e.target.closest('[data-medical-genomic-overlay]');
    if(genomicOverlay&&e.target===genomicOverlay&&medicalAction!=='genomic'){medicalGenomicOverlayOpen=false;renderTerminal();return;}
    if(e.target.closest('[data-medical-data-module]')){tapMedicalDataPort();return;}
    const medicalMediaProtocolButton=e.target.closest('[data-medical-media-protocol]');
    if(medicalMediaProtocolButton){selectMedicalMediaProtocol(medicalMediaProtocolButton.dataset.medicalMediaProtocol);return;}
    if(e.target.closest('[data-medical-media-sanitize-confirm]')){confirmMedicalSanitization();return;}
    if(e.target.closest('[data-medical-media-sanitize-cancel]')){returnToMedicalMediaService();return;}
    if(e.target.closest('[data-medical-media-service]')){returnToMedicalMediaService();return;}
    if(e.target.closest('[data-medical-media-back]')){playAudio('uiBack');medicalMediaView='service';medicalMediaProtocol=null;medicalMediaMessage='';renderTerminal();return;}
    if(e.target.closest('[data-medical-media-close]')){closeMedicalMediaService();return;}
    if(e.target.closest('[data-medical-injector-open]')){openMedicalInjector();return;}
    if(e.target.closest('[data-medical-injector-close]')){closeMedicalInjector();return;}
    const injectorTarget=e.target.closest('[data-medical-injector-target]');
    if(injectorTarget&&!injectorTarget.disabled){medicalInjectorTarget=injectorTarget.dataset.medicalInjectorTarget;medicalInjectorView='confirm';playAudio('restricted');renderTerminal();return;}
    if(e.target.closest('[data-medical-injector-all]')){medicalInjectorTarget='all';medicalInjectorView='confirm';playAudio('restricted');renderTerminal();return;}
    if(e.target.closest('[data-medical-injector-cancel]')){medicalInjectorView='select';medicalInjectorTarget=null;playAudio('uiBack');renderTerminal();return;}
    if(e.target.closest('[data-medical-injector-confirm]')){beginMedicalInjection();return;}
    if(e.target.closest('[data-medical-view-sequence]')){playAudio('uiSelect');medicalGenomicOverlayOpen=true;renderTerminal();return;}
    const medicalSectionButton=e.target.closest('[data-medical-section]');
    if(medicalSectionButton){playAudio('uiSelect');medicalSection=medicalSectionButton.dataset.medicalSection;medicalAction=null;renderTerminal();return;}
    const medicalRecordButton=e.target.closest('[data-medical-record]');
    if(medicalRecordButton){playAudio('uiSelect');medicalRecord=medicalRecordButton.dataset.medicalRecord;medicalAction=null;renderTerminal();return;}
    const medicalContainmentButton=e.target.closest('[data-medical-containment]');
    if(medicalContainmentButton){playAudio('uiSelect');medicalContainmentRecord=medicalContainmentButton.dataset.medicalContainment;medicalAction=null;renderTerminal();return;}
    const medicalAssayButton=e.target.closest('[data-medical-assay]');
    if(medicalAssayButton){playAudio('uiSelect');medicalAssayRegion=medicalAssayButton.dataset.medicalAssay;renderTerminal();return;}
    if(e.target.closest('[data-medical-open-genomic]')){beginMedicalGenomicReview();return;}
    if(e.target.closest('[data-medical-release-all]')){medicalSection='containment';openMedicalAuthorization('all');return;}
    if(e.target.closest('[data-medical-confirm-release-all]')){completeMedicalReleaseAll();return;}
    if(e.target.closest('[data-medical-authorize]')){authorizeMedicalRelease();return;}
    const medicalRelease=e.target.closest('[data-medical-release]');
    if(medicalRelease){medicalSection='containment';medicalContainmentRecord=medicalRelease.dataset.medicalRelease;openMedicalAuthorization(medicalRelease.dataset.medicalRelease);return;}
    const medicalReleaseConfirm=e.target.closest('[data-medical-confirm-release]');
    if(medicalReleaseConfirm){completeMedicalRelease(medicalReleaseConfirm.dataset.medicalConfirmRelease);return;}
    if(e.target.closest('[data-medical-cancel]')){playAudio('uiBack');cancelMedicalHackHold();medicalAuthorizationError='';medicalAction=null;renderTerminal();return;}
    const shell=els.workspace.querySelector('.command-overview-shell');
    if(shell?.dataset.layoutEditor==='true'){
      const atmoOverlay=e.target.closest('[data-atmo-overlay]');
      if(atmoOverlay&&e.target===atmoOverlay) atmoOverlay.hidden=true;
      return;
    }
    const communicationOpen=e.target.closest('[data-communications-open]');
    if(communicationOpen){playAudio('uiSelect');communicationsSelected=communicationOpen.dataset.communicationsOpen;renderTerminal();return;}
    const associatedRecording=e.target.closest('[data-communications-associated]');
    if(associatedRecording){playAudio('uiSelect');communicationsSelected=associatedRecording.dataset.communicationsAssociated;renderTerminal();return;}
    if(e.target.closest('[data-communications-diagnostic]')){playAudio('uiSelect');communicationsOverlay='diagnostic';renderTerminal();return;}
    const communicationDirective=e.target.closest('[data-communications-directive]');
    if(communicationDirective){
      const id=communicationDirective.dataset.communicationsDirective;
      playAudio(id==='015'&&!directiveUnlocked?'restricted':'uiSelect');
      if(id==='015'&&directiveUnlocked) directiveSeen=true;
      directiveView=(id==='015'&&!directiveUnlocked)?'lock':id;
      communicationsOverlay='directive';
      renderTerminal();
      return;
    }
    if(e.target.closest('[data-communications-audio-toggle]')){toggleCommunicationsAudio();return;}
    const facilityOpen=e.target.closest('[data-facility-open]');
    if(facilityOpen){playAudio('uiSelect');if(facilityOpen.dataset.facilityOpen==='horizon'){facilityView='horizon';facilityOverlay=null;}else facilityOverlay='heron';renderTerminal();return;}
    const facilityNav=e.target.closest('[data-facility-nav]');
    if(facilityNav){playAudio('uiSelect');facilityView=facilityNav.dataset.facilityNav;facilityOverlay=null;renderTerminal();return;}
    const facilityBack=e.target.closest('[data-facility-back]');
    if(facilityBack){playAudio('uiBack');facilityView=facilityBack.dataset.facilityBack;facilityOverlay=null;renderTerminal();return;}
    if(e.target.closest('[data-facility-biosignal]')){if(biosignalUnlocked||executiveAuthorized){playAudio('uiSelect');biosignalUnlocked=true;facilityView='biosignals';facilityOverlay=null;}else{playAudio('restricted');facilityOverlay='biosignal-lock';}renderTerminal();return;}
    if(e.target.closest('[data-biosignal-submit]')){authorizeBiosignal();return;}
    const maintenanceToggle=e.target.closest('[data-maintenance-toggle]');
    if(maintenanceToggle){if(facilityMapMode==='maintenance'){playAudio('uiBack');facilityMapMode='general';facilityOverlay=null;}else if(facilityMaintenanceUnlocked){playAudio('uiSelect');facilityMapMode='maintenance';facilityOverlay=null;}else{playAudio('restricted');facilityOverlay='maintenance-lock';}renderTerminal();return;}
    if(e.target.closest('[data-maintenance-submit]')){authorizeMaintenance();return;}
    const vehicleRecord=e.target.closest('[data-vehicle-record]');
    if(vehicleRecord){playAudio('uiSelect');facilitySelectedVehicle=vehicleRecord.dataset.vehicleRecord;renderTerminal();return;}
    const workOrder=e.target.closest('[data-work-order]');
    if(workOrder){playAudio('uiSelect');facilitySelectedWorkOrder=workOrder.dataset.workOrder;renderTerminal();return;}
    if(e.target.closest('[data-heron-reactor]')){playAudio('uiSelect');facilityOverlay='heron-reactor';renderTerminal();return;}
    const facilityLayer=e.target.closest('[data-facility-overlay]');
    if(facilityLayer&&(e.target===facilityLayer||e.target.closest('[data-facility-overlay-close]'))){if(e.target.closest('[data-facility-overlay-close]'))playAudio('uiBack');facilityOverlay=null;renderTerminal();return;}
    const beaconClose=e.target.closest('[data-beacon-close]');
    if(beaconClose){playAudio('uiBack');const overlay=els.workspace.querySelector('[data-beacon-overlay]');const toggle=els.workspace.querySelector('[data-beacon-toggle]');if(overlay)overlay.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');return;}
    const beaconToggle=e.target.closest('[data-beacon-toggle]');
    if(beaconToggle){playAudio('uiSelect');const overlay=els.workspace.querySelector('[data-beacon-overlay]');const atmo=els.workspace.querySelector('[data-atmo-overlay]');if(atmo)atmo.hidden=true;if(overlay)overlay.hidden=false;beaconToggle.setAttribute('aria-expanded','true');return;}
    const beaconOverlay=e.target.closest('[data-beacon-overlay]');
    if(beaconOverlay&&e.target===beaconOverlay){const toggle=els.workspace.querySelector('[data-beacon-toggle]');beaconOverlay.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');return;}
    const communicationsLayer=e.target.closest('[data-communications-overlay]');
    if(communicationsLayer&&(e.target===communicationsLayer||e.target.closest('[data-communications-overlay-close]'))){if(e.target.closest('[data-communications-overlay-close]'))playAudio('uiBack');communicationsOverlay=null;directiveView='archive';renderTerminal();return;}
    const modalLayer=e.target.closest('.directive-modal-layer');
    if(modalLayer&&e.target===modalLayer){directiveView='archive';renderTerminal();return;}
    const directiveOpen=e.target.closest('[data-directive-open]');
    if(directiveOpen){const id=directiveOpen.dataset.directiveOpen;playAudio(id==='015'&&!directiveUnlocked?'restricted':'uiSelect');if(id==='015'&&directiveUnlocked)directiveSeen=true;directiveView=(id==='015'&&!directiveUnlocked)?'lock':id;renderTerminal();return;}
    if(e.target.closest('[data-directive-back]')){playAudio('uiBack');if(state.section==='communications')communicationsOverlay=null;directiveView='archive';renderTerminal();return;}
    if(e.target.closest('[data-directive-submit]')){authorizeDirective();return;}
    const atmoToggle=e.target.closest('[data-atmo-toggle]');
    if(atmoToggle){playAudio('uiSelect');const overlay=els.workspace.querySelector('[data-atmo-overlay]');const beacon=els.workspace.querySelector('[data-beacon-overlay]');if(beacon)beacon.hidden=true;if(overlay)overlay.hidden=false;return;}
    const atmoOverlay=e.target.closest('[data-atmo-overlay]');
    if(atmoOverlay&&e.target===atmoOverlay){atmoOverlay.hidden=true;return;}
    const section=e.target.closest('[data-section]');
    if(section){playAudio('uiSelect');communicationsOverlay=null;facilityOverlay=null;state.section=section.dataset.section;if(state.section==='directive')directiveView='archive';if(state.section==='systems')facilityView='comparison';saveState();renderTerminal();return;}
    const doc=e.target.closest('[data-doc]');
    if(doc){playAudio('uiSelect');openDocument(doc.dataset.doc);}
  });
  els.workspace.addEventListener('pointerdown',e=>{if(e.target.closest('[data-audit-token-port]'))beginAuditTokenHold(e);if(e.target.closest('[data-command-interlock]'))beginCommandInterlockHold(e);if(e.target.closest('[data-directive-hack]'))beginDirectiveHackHold(e);if(e.target.closest('[data-medical-hack]'))beginMedicalHackHold(e);if(e.target.closest('[data-medical-data-module]'))beginMedicalMediaHold(e);if(e.target.closest('[data-medical-injector-open]'))beginMedicalInjectorHold(e,'reservoir');if(e.target.closest('[data-medical-biometric-hold]'))beginMedicalInjectorHold(e,'biometric');const facilityHack=e.target.closest('[data-facility-hack]');if(facilityHack)beginFacilityHackHold(e,facilityHack.dataset.facilityHack);});
  els.workspace.addEventListener('pointerup',e=>{if(e.target.closest('[data-audit-token-port]')||auditTokenHoldComplete)finishAuditTokenHold();if(e.target.closest('[data-command-interlock]'))finishCommandInterlockHold(false);if(medicalMediaHoldTimer!==null||medicalMediaHoldReady||medicalMediaFeedbackTimer!==null||medicalMediaAwaitingRelease)finishMedicalMediaHold(false);if(medicalInjectorHoldTimer!==null||medicalInjectorHoldReady||medicalInjectorFeedbackTimer!==null||medicalInjectorAwaitingRelease)finishMedicalInjectorHold(false);cancelDirectiveHackHold();cancelFacilityHackHold();cancelMedicalHackHold();});
  els.workspace.addEventListener('pointercancel',e=>{if(e.target.closest('[data-audit-token-port]')||auditTokenHoldTimer!==null||auditTokenHoldComplete)finishAuditTokenHold();if(e.target.closest('[data-command-interlock]'))finishCommandInterlockHold(true);finishMedicalMediaHold(true);finishMedicalInjectorHold(true);cancelDirectiveHackHold();cancelFacilityHackHold();cancelMedicalHackHold();});
  els.workspace.addEventListener('contextmenu',e=>{if(e.target.closest('[data-audit-token-port],[data-command-interlock],[data-directive-hack],[data-facility-hack],[data-medical-hack],[data-medical-data-module],[data-medical-injector-open],[data-medical-biometric-hold]'))e.preventDefault();});
  document.addEventListener('pointerup',()=>{if(auditTokenHoldTimer!==null||auditTokenHoldComplete)finishAuditTokenHold();if(commandInterlockHoldTimer!==null||commandInterlockAcknowledged)finishCommandInterlockHold(false);if(medicalMediaHoldTimer!==null||medicalMediaHoldReady||medicalMediaFeedbackTimer!==null||medicalMediaAwaitingRelease)finishMedicalMediaHold(false);if(medicalInjectorHoldTimer!==null||medicalInjectorHoldReady||medicalInjectorFeedbackTimer!==null||medicalInjectorAwaitingRelease)finishMedicalInjectorHold(false);cancelDirectiveHackHold();cancelFacilityHackHold();cancelMedicalHackHold();});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement?.id==='argoza-personnel-code'){authorizeArgozaPersonnelBriefing();return;}if(e.key==='Enter'&&document.activeElement?.id==='audit-token-passcode'){authorizeAuditTokenPasscode();return;}if(e.key==='Enter'&&document.activeElement?.id==='sanitization-code'){authenticateSanitization();return;}if((e.key==='Enter'||e.key===' ')&&document.activeElement?.matches('[data-command-interlock]')){e.preventDefault();const p=sanitizationState();if(p.keyEngaged&&p.phase==='engaged-idle')reopenSanitizationProtocol();else if(!p.keyEngaged){playAudio('reject');setCommandInterlockMessage('COMMAND KEY NOT DETECTED');}return;}if(e.key==='Enter'&&document.activeElement?.id==='medical-release-password'){authorizeMedicalRelease();return;}if(e.key==='Enter'&&document.activeElement?.id==='directive-access-code'){authorizeDirective();return;}if(e.key==='Enter'&&document.activeElement?.id==='biosignal-access-code'){authorizeBiosignal();return;}if(e.key==='Enter'&&document.activeElement?.id==='maintenance-access-code'){authorizeMaintenance();return;}if(e.key==='Escape'){const atmo=els.workspace.querySelector('[data-atmo-overlay]');const beacon=els.workspace.querySelector('[data-beacon-overlay]');const toggle=els.workspace.querySelector('[data-beacon-toggle]');if(atmo&&!atmo.hidden)atmo.hidden=true;if(beacon&&!beacon.hidden)beacon.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');if(communicationsOverlay){communicationsOverlay=null;directiveView='archive';renderTerminal();}if(facilityOverlay){facilityOverlay=null;renderTerminal();}}});
  installLockedOverviewDefaults();
  preloadCommunicationsAudio();
  preloadWeatherAssets();
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(`service-worker.js?v=${VERSION}`,{updateViaCache:'none'}).then(registration=>registration.update()).catch(error=>console.warn('ETOS service worker update failed.',error)),{once:true});
  const updateClock=()=>els.clock.textContent=new Date().toLocaleTimeString('en-US',{hour12:false});updateClock();setInterval(updateClock,1000);els.versionLabel.textContent=`ETOS v${VERSION}`;els.wardenVersion.textContent=`v${VERSION}`;renderTerminal();showScreen(state.initialized?'terminal':'boot');if(state.initialized&&state.activeTerminal==='argoza'&&!argozaRecoverySeen())setTimeout(startArgozaRecovery,0);console.info(`ETOS v${VERSION} loaded.`);
})();
