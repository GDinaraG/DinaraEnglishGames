const cases=[
 {level:'ДОСЬЕ',file:'CASE No. 001',title:'Alex Carter',desc:'Познакомься с Алексом и узнай, почему его исчезновение нельзя оставить без ответа.',action:'ОТКРЫТЬ ДОСЬЕ',img:'assets/missing-student/alex-carter.png',type:'profile'},
 {level:'ГЛАВА 1',file:'',title:'The Night Archive',desc:'Проникни в архив, избегай патруля и найди следы Алекса в запертых шкафах.',action:'НАЧАТЬ РАССЛЕДОВАНИЕ',img:'assets/school.png',type:'verbcase'},
 {level:'ГЛАВА 2',file:'',title:'The Last Messages',desc:'Исследуй найденный в архиве телефон Алекса и восстанови повреждённые голосовые сообщения.',action:'ИЗУЧИТЬ ТЕЛЕФОН',img:'assets/signal-intercept/alex-phone-case-v1.png',type:'signal'},
 {level:'ГЛАВА 3',file:'',title:'The Evidence Room',desc:'Сопоставь найденные факты и установи, кто скрывает правду об исчезновении Алекса.',action:'РАСКРЫТЬ ДЕЛО',img:'assets/evidence-room-room.png',type:'evidence'}];
const alexCaseHead=document.querySelector('.alex-case-head');
if(alexCaseHead)alexCaseHead.outerHTML=`<div class="alex-case-hero"><div class="alex-case-hero-copy"><span>CASE No. 001 · ACTIVE</span><h2>The Missing Student</h2><p>Алекс Картер не вернулся домой после занятий.</p><div class="alex-case-rule" aria-hidden="true"><i></i><b>SCHOOL ARCHIVE</b><i></i></div></div><button class="case-reset" id="caseReset" type="button">СБРОСИТЬ ПРОГРЕСС</button></div>`;
const grid=document.querySelector('#caseGrid'),modal=document.querySelector('#modal'),gameBody=document.querySelector('#gameBody');
const caseMusicToggle=document.querySelector('#caseMusicToggle'),caseMusic=new Audio('assets/audio/clockwork-investigation.mp3');
let caseMusicEnabled=localStorage.getItem('caseMusicEnabled')!=='false';
caseMusic.loop=true;caseMusic.volume=.28;
function updateCaseMusicButton(){if(!caseMusicToggle)return;caseMusicToggle.setAttribute('aria-pressed',String(caseMusicEnabled));caseMusicToggle.setAttribute('aria-label',caseMusicEnabled?'Отключить музыку':'Включить музыку');caseMusicToggle.classList.toggle('off',!caseMusicEnabled);caseMusicToggle.querySelector('.music-note').classList.toggle('muted',!caseMusicEnabled);caseMusicToggle.title=caseMusicEnabled?'Отключить музыку':'Включить музыку'}
function playCaseMusic(){if(caseMusicEnabled&&!modal.classList.contains('active')&&!document.hidden)caseMusic.play().catch(()=>{})}
function pauseCaseMusic(){caseMusic.pause()}
caseMusicToggle.onclick=e=>{e.stopPropagation();caseMusicEnabled=!caseMusicEnabled;localStorage.setItem('caseMusicEnabled',String(caseMusicEnabled));updateCaseMusicButton();caseMusicEnabled?playCaseMusic():pauseCaseMusic()};
updateCaseMusicButton();playCaseMusic();
const unlockCaseMusic=()=>{playCaseMusic();document.removeEventListener('pointerdown',unlockCaseMusic);document.removeEventListener('keydown',unlockCaseMusic)};
document.addEventListener('pointerdown',unlockCaseMusic);document.addEventListener('keydown',unlockCaseMusic);
document.addEventListener('visibilitychange',()=>document.hidden?pauseCaseMusic():playCaseMusic());
function renderCases(){grid.innerHTML=cases.map((c,i)=>{const done=c.type==='signal'?localStorage.getItem('signalInterceptComplete')==='yes':c.type==='evidence'?localStorage.getItem('evidenceRoomComplete')==='yes':c.type==='verbcase'&&localStorage.getItem('missingStudentComplete')==='yes',profile=c.type==='profile';return `<article class="dossier ${profile?'profile-card':''} ${done?'complete':''} ${c.locked?'locked':''}" ${c.locked?'aria-disabled="true"':`tabindex="0" data-open="${i}"`}><span class="tab">${c.level}</span>${c.file?`<span class="file-no">${c.file}</span>`:''}<div class="case-inner"><div class="photo"><img src="${c.img}" alt="${profile?'Портрет Алекса Картера':`Иллюстрация дела ${c.title}`}"></div><div class="case-copy"><h3>${c.title}</h3><p>${c.desc}</p></div></div>${profile?'':`<span class="mark">${c.locked?'ACCESS<br>DENIED':`CASE<br>${done?'COMPLETE':'ACTIVE'}`}</span>`}<button class="open-case" ${c.locked?'disabled':''}>${c.locked?'ДОСТУП ЗАКРЫТ':done?'ПРОЙТИ ЕЩЁ РАЗ':c.action}</button></article>`}).join('')}
renderCases();
const homeEvidenceGrid=document.querySelector('#homeEvidenceGrid'),evidenceProgress=document.querySelector('#evidenceProgress'),materialsModal=document.querySelector('#materialsModal');
function evidenceState(){return window.MissingStudent?.getEvidence?.()||{count:0,total:8,items:[]}}
function renderHomeEvidence(){const data=evidenceState();evidenceProgress.textContent=`${data.count} / ${data.total}`;homeEvidenceGrid.innerHTML=Array.from({length:data.total},(_,i)=>{const item=data.items[i],found=i<data.count,x=(i%4)*33.333,y=Math.floor(i/4)*100;return `<button class="home-evidence ${found?'found':'locked'} item-${i}" ${found?`data-home-evidence="${i}" aria-label="Открыть улику: ${escapeHtml(item.title)}"`:'disabled aria-label="Улика еще не найдена"'} style="--evidence-x:${x}%;--evidence-y:${y}%"><i></i><span>${String(i+1).padStart(2,'0')}</span><b>${found?escapeHtml(item.title):'НЕ НАЙДЕНО'}</b></button>`}).join('')}
function renderPhoneEvidence(){let block=document.querySelector('#phoneEvidenceBlock');if(!block){block=document.createElement('div');block.id='phoneEvidenceBlock';block.className='phone-materials';homeEvidenceGrid.after(block)}const items=window.SignalIntercept?.getEvidence?.()||[];const found=items.filter(x=>x.found).length;block.innerHTML=`<div class="phone-materials-head"><div><span>ТЕЛЕФОН АЛЕКСА</span><h3>Сохранённые голосовые</h3></div><strong>${found} / 3</strong></div><div class="phone-materials-grid">${items.map((x,i)=>`<button class="phone-material ${x.found?'found':'locked'}" ${x.found?`data-phone-evidence="${i}"`:'disabled'}><i style="background-image:url('${x.image}')!important;background-size:cover!important;background-position:center top!important"></i><span>${String(i+1).padStart(2,'0')}</span><b>${x.found?escapeHtml(x.title):'НЕ ВОССТАНОВЛЕНО'}</b></button>`).join('')}</div>`}
function openHomeEvidence(index){const data=evidenceState(),item=data.items[index];if(!item||index>=data.count)return;document.querySelector('#materialTag').textContent=item.tag;document.querySelector('#materialTitle').textContent=item.title;document.querySelector('#materialText').textContent=item.text;document.querySelector('#materialConclusion').textContent=item.conclusion;const image=document.querySelector('#materialImage');image.className=`material-image item-${index}`;image.style.backgroundPosition=`${(index%4)*33.333}% ${Math.floor(index/4)*100}%`;materialsModal.classList.add('active');materialsModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function openPhoneEvidence(index){const item=window.SignalIntercept?.getEvidence?.()[index];if(!item?.found)return;document.querySelector('#materialTag').textContent='ТЕЛЕФОН АЛЕКСА · ГОЛОСОВОЕ СООБЩЕНИЕ';document.querySelector('#materialTitle').textContent=item.title;document.querySelector('#materialText').textContent=`“${item.text}”`;document.querySelector('#materialConclusion').textContent=item.note;const image=document.querySelector('#materialImage');image.className='material-image phone-contact';image.style.backgroundImage=`url('${item.image}')`;image.style.backgroundSize='cover';image.style.backgroundPosition='center 25%';materialsModal.classList.add('active');materialsModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeHomeEvidence(){materialsModal.classList.remove('active');materialsModal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.querySelector('#caseMaterials').onclick=e=>{const archive=e.target.closest('[data-home-evidence]');if(archive)openHomeEvidence(+archive.dataset.homeEvidence)};document.querySelectorAll('[data-material-close]').forEach(x=>x.onclick=closeHomeEvidence);window.addEventListener('missing-student-evidence-updated',renderHomeEvidence);window.addEventListener('keydown',e=>{if(e.key==='Escape'&&materialsModal.classList.contains('active'))closeHomeEvidence()});renderHomeEvidence();
const caseReset=document.querySelector('#caseReset');let caseResetTimer=null;
caseReset.onclick=()=>{if(!caseReset.classList.contains('confirm')){caseReset.classList.add('confirm');caseReset.textContent='НАЖМИ ЕЩЁ РАЗ ДЛЯ СБРОСА';clearTimeout(caseResetTimer);caseResetTimer=setTimeout(()=>{caseReset.classList.remove('confirm');caseReset.textContent='СБРОСИТЬ ПРОГРЕСС'},4000);return}clearTimeout(caseResetTimer);['missingStudentEvidenceCount','missingStudentLevel1Complete','missingStudentLevel2Complete','missingStudentLevel3Complete','missingStudentComplete','alexPhoneMessages','alexPhoneRepairs','alexPhoneEvidenceCount','signalInterceptComplete','evidenceRoomComplete'].forEach(key=>localStorage.removeItem(key));caseReset.classList.remove('confirm');caseReset.textContent='СБРОСИТЬ ПРОГРЕСС';closeHomeEvidence();renderCases();renderHomeEvidence();document.querySelector('#phoneEvidenceBlock')?.remove();showToast('Прогресс дела Алекса сброшен')};
const carousel=document.querySelector('.case-carousel');
document.querySelector('.case-arrow.prev').onclick=()=>grid.scrollBy({left:-grid.clientWidth*.82,behavior:'smooth'});
document.querySelector('.case-arrow.next').onclick=()=>grid.scrollBy({left:grid.clientWidth*.82,behavior:'smooth'});
let caseDrag=null,blockCaseClick=false;
grid.addEventListener('pointerdown',e=>{if(e.button!==0)return;caseDrag={x:e.clientX,left:grid.scrollLeft,moved:false,id:e.pointerId,card:e.target.closest('.dossier[data-open]'),launchButton:e.target.closest('.open-case')};grid.setPointerCapture(e.pointerId)});
grid.addEventListener('pointermove',e=>{if(!caseDrag||e.pointerId!==caseDrag.id)return;const distance=e.clientX-caseDrag.x;if(Math.abs(distance)>5){caseDrag.moved=true;grid.classList.add('dragging')}grid.scrollLeft=caseDrag.left-distance});
function finishCaseDrag(e){if(!caseDrag||e.pointerId!==caseDrag.id)return;const drag=caseDrag,mobile=matchMedia('(max-width:700px)').matches;blockCaseClick=true;caseDrag=null;grid.classList.remove('dragging');if(grid.hasPointerCapture(e.pointerId))grid.releasePointerCapture(e.pointerId);if(!drag.moved&&drag.card&&(!mobile||drag.launchButton))openGame(+drag.card.dataset.open);setTimeout(()=>{blockCaseClick=false},0)}
grid.addEventListener('pointerup',finishCaseDrag);grid.addEventListener('pointercancel',finishCaseDrag);
grid.addEventListener('click',e=>{if(blockCaseClick){e.preventDefault();e.stopPropagation()}},true);
function caseIndex(type){return cases.findIndex(c=>c.type===type)}
function completeCaseCard(type){const card=grid.querySelector(`.dossier[data-open="${caseIndex(type)}"]`);if(!card)return;card.classList.add('complete');card.querySelector('.mark').innerHTML='CASE<br>COMPLETE';card.querySelector('.open-case').textContent='ПРОЙТИ ЕЩЁ РАЗ'}
window.addEventListener('evidence-room-complete',()=>completeCaseCard('evidence'));
window.addEventListener('signal-intercept-complete',()=>completeCaseCard('signal'));
window.addEventListener('missing-student-complete',()=>completeCaseCard('verbcase'));
window.addEventListener('open-evidence-room',()=>openGame(caseIndex('evidence')));
const login=document.querySelector('.login'),nameModal=document.querySelector('#nameModal'),nameInput=document.querySelector('#detectiveName');
function escapeHtml(s){const x=document.createElement('span');x.textContent=s;return x.innerHTML}function avatarSrc(value=localStorage.getItem('detectiveAvatar')){return value==='male'?'assets/detective-avatar-male.png':'assets/detective-avatar.png'}function setDetective(name){if(name){login.classList.add('detective');login.title='Изменить имя или аватар';login.setAttribute('aria-label','Изменить имя или аватар');login.innerHTML=`<img src="${avatarSrc()}" alt=""><span>Детектив ${escapeHtml(name)}</span>`}}function openName(){nameModal.classList.add('active');nameInput.value=localStorage.getItem('detectiveName')||'';const avatar=localStorage.getItem('detectiveAvatar')||'female',choice=document.querySelector(`[name="detectiveAvatar"][value="${avatar}"]`);if(choice)choice.checked=true;setTimeout(()=>nameInput.focus(),30)}function closeName(){nameModal.classList.remove('active')}
setDetective(localStorage.getItem('detectiveName'));login.onclick=openName;document.querySelector('#nameForm').onsubmit=e=>{e.preventDefault();const n=nameInput.value.trim().replace(/\s+/g,' '),avatar=document.querySelector('[name="detectiveAvatar"]:checked')?.value||'female';if(n){localStorage.setItem('detectiveName',n);localStorage.setItem('detectiveAvatar',avatar);setDetective(n);closeName();showToast(`Добро пожаловать, детектив ${n}`)}};document.querySelectorAll('[data-name-close]').forEach(x=>x.onclick=closeName);
document.addEventListener('click',e=>{const scroll=e.target.closest('[data-scroll-cases]');if(scroll){document.querySelector('#cases')?.scrollIntoView({behavior:'smooth',block:'start'});return}const op=e.target.closest('[data-open]'),mobile=matchMedia('(max-width:700px)').matches;if(op&&(!mobile||e.target.closest('.open-case')))openGame(+op.dataset.open);if(e.target.closest('[data-close]'))closeGame(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(nameModal.classList.contains('active'))closeName();else if(modal.classList.contains('active'))closeGame(true)}if(e.key==='Enter'&&e.target.matches('.dossier'))openGame(+e.target.dataset.open)});
function openGame(i){pauseCaseMusic();const c=cases[i];const special=['profile','evidence','signal','verbcase'].includes(c.type);document.querySelector('#gameLevel').textContent=special?'':`${c.file} / ${c.level}`;document.querySelector('#progress').textContent=special?'':'ДЕЛО ОТКРЫТО';gameBody.innerHTML=c.type==='profile'?alexProfile():c.type==='find'?findGame(c):c.type==='cipher'?cipherGame(c):'';modal.classList.add('active');document.body.style.overflow='hidden';modal.querySelector('.game').classList.toggle('heist-modal',false);modal.querySelector('.game').classList.toggle('profile-modal',c.type==='profile');modal.querySelector('.game').classList.toggle('evidence-modal',c.type==='evidence');modal.querySelector('.game').classList.toggle('signal-modal',c.type==='signal');modal.querySelector('.game').classList.toggle('missing-modal',c.type==='verbcase');if(c.type==='profile'){gameBody.querySelector('[data-profile-continue]').onclick=()=>{stopProfileSounds();openGame(caseIndex('verbcase'))};startProfileTyping()}else if(c.type==='evidence')EvidenceRoom.start(gameBody,()=>closeGame(false));else if(c.type==='signal')SignalIntercept.start(gameBody,()=>closeGame(false));else if(c.type==='verbcase')MissingStudent.start(gameBody,()=>closeGame(false));else bindSimple(c.type)}
function alexProfile(){return `<article class="alex-profile"><section class="alex-profile-photo"><span>CASE No. 001</span><img src="assets/missing-student/alex-carter.png" alt="Алекс Картер"><img class="profile-stamp-tool" src="assets/case-file/stamp-tool-v2.png" alt=""><b>MISSING</b></section><section class="alex-profile-copy"><p class="alex-profile-label">НЕЗАВЕРШЁННОЕ ДЕЛО</p><h2>Alex Carter</h2><p class="alex-profile-age">18 лет · участник Secret English Club</p><blockquote><span data-type>Алекс Картер был одним из нас.</span></blockquote><div class="alex-profile-story"><p><span data-type>Три дня назад он сообщил, что обнаружил в школьном архиве нечто странное. Обещал рассказать всё после занятий, но на встречу не пришёл.</span></p><p><span data-type>В тот же вечер Алекс исчез. Последний подтверждённый след ведёт в школьную библиотеку.</span></p></div><p class="alex-profile-hook"><span data-type>Его расследование осталось незавершённым. Теперь это твоё дело.</span></p><button type="button" data-profile-continue>ПРИСТУПИТЬ К ПОИСКАМ</button></section></article>`}
const profileTypingSound=new Audio('assets/audio/case-file/typewriter-continuous.mp3'),profileReturnSound=new Audio('assets/audio/case-file/typewriter-return.wav'),profileStampSound=new Audio('assets/audio/case-file/stamp-source.mp3');profileTypingSound.loop=true;profileTypingSound.volume=.12;
function playProfileSfx(kind){try{if(kind==='return'){profileReturnSound.pause();profileReturnSound.currentTime=0;profileReturnSound.volume=.18;profileReturnSound.play().catch(()=>{})}else{profileStampSound.pause();profileStampSound.currentTime=0;profileStampSound.volume=.38;profileStampSound.play().catch(()=>{});setTimeout(()=>profileStampSound.pause(),360)}}catch{}}
let profileTypingRun=0;
function stopProfileSounds(){profileTypingRun++;profileTypingSound.pause();profileReturnSound.pause();profileStampSound.pause()}
function startProfileTyping(){const run=++profileTypingRun,panel=gameBody.querySelector('.alex-profile-copy'),nodes=[...panel.querySelectorAll('[data-type]')],button=panel.querySelector('[data-profile-continue]'),texts=nodes.map(node=>node.textContent);let skipped=false;nodes.forEach(node=>{node.textContent='';node.classList.remove('typing')});button.disabled=true;setTimeout(()=>{if(run===profileTypingRun&&modal.classList.contains('active'))playProfileSfx('stamp')},650);const finish=()=>{if(skipped||run!==profileTypingRun)return;skipped=true;stopProfileSounds();nodes.forEach((node,i)=>{node.textContent=texts[i];node.classList.remove('typing')});button.disabled=false;button.classList.add('ready')};panel.addEventListener('click',e=>{if(!skipped&&!e.target.closest('button'))finish()},{once:true});(async()=>{for(let n=0;n<nodes.length&&!skipped&&run===profileTypingRun;n++){const node=nodes[n],text=texts[n];node.classList.add('typing');profileTypingSound.play().catch(()=>{});for(let i=0;i<text.length&&!skipped&&run===profileTypingRun;i++){node.textContent+=text[i];await new Promise(resolve=>setTimeout(resolve,/[.!?]/.test(text[i])?130:30))}if(run!==profileTypingRun)return;profileTypingSound.pause();node.classList.remove('typing');if(!skipped){playProfileSfx('return');await new Promise(resolve=>setTimeout(resolve,340))}}if(!skipped&&run===profileTypingRun)finish()})()}
function closeGame(ask,confirmed=false){const missingActive=document.querySelector('.ms-layout,.ms-platform-layout');if(missingActive&&!confirmed&&window.MissingStudent?.requestClose){MissingStudent.requestClose(()=>closeGame(false,true));return}stopProfileSounds();clearVictorDialogue();backstageRun++;if(window.MissingStudent)MissingStudent.stop();if(window.SignalIntercept)SignalIntercept.stop();modal.classList.remove('active');document.body.style.overflow='';gameBody.innerHTML='';playCaseMusic()}
function findGame(c){return `<h2>${c.title}</h2><p class="intro">Осмотри место исчезновения. Найди 3 активные точки.</p><div class="clue-scene" style="background-image:url('${c.img}')"><button class="clue" style="left:44%;top:77%" data-clue="notebook"></button><button class="clue" style="left:79%;top:39%" data-clue="locker"></button><button class="clue" style="left:17%;top:28%" data-clue="window"></button></div><div class="clue-list"><span class="chip">Найдено: <b id="found">0</b>/3</span></div><p class="feedback" id="feedback">Улики слегка пульсируют.</p>`}
function cipherGame(c){return `<h2>${c.title}</h2><p class="intro">Шифр: △ = TRUST, ○ = NO, □ = ONE. Как переводится «△ ○ □»?</p><div class="clue-scene" style="background-image:url('${c.img}')"></div><div class="choice-grid"><button data-answer="bad">Доверься всем</button><button data-answer="good">Не доверяй никому</button><button data-answer="bad">Никто не верит</button></div><p class="feedback" id="feedback">Выбери точный перевод.</p>`}
function bindSimple(type){if(type==='find'){let n=0;document.querySelectorAll('.clue').forEach(b=>b.onclick=()=>{if(!b.classList.contains('found')){b.classList.add('found');document.querySelector('#found').textContent=++n;if(n===3)win('Все улики найдены!')}})}if(type==='cipher')document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>b.dataset.answer==='good'?win('Послание расшифровано!'):document.querySelector('#feedback').textContent='Эта версия неверна.')}
function win(msg){document.querySelector('#feedback').textContent=msg;document.querySelector('#progress').textContent='ДЕЛО РАСКРЫТО ✓';showToast('+100 очков детектива')}function showToast(t){const x=document.querySelector('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2300)}

const theatreCase = document.querySelector('.case-collection-next');
if (theatreCase) {
  theatreCase.className = 'case-collection theatre-case';
  theatreCase.setAttribute('aria-label', 'Дело номер 002: The Last Performance');
  theatreCase.innerHTML = `<div class="theatre-case-hero"><div class="theatre-case-copy"><span>CASE No. 002 · NEW</span><h2>The Last Performance</h2><p>Рукопись исчезла до последнего занавеса.</p><div class="theatre-rule" aria-hidden="true"><i></i><b>THEATRE ARCHIVE</b><i></i></div></div></div><div class="theatre-case-body"><div class="theatre-case-intro"><span>НОВОЕ РАССЛЕДОВАНИЕ</span><h3>На сцене осталась только подделка</h3><p>Театр опустел, занавес закрыт, но кто-то всё ещё играет свою роль.</p></div><div class="theatre-chapters"><article><img src="assets/case-002/empty-stage.png" alt="Пустая сцена старого театра"><div><small>ГЛАВА I</small><h4>The Empty Stage</h4><span>СЦЕНА</span></div></article><article><img src="assets/case-002/backstage.png" alt="Закулисье старого театра"><div><small>ГЛАВА II</small><h4>Behind the Curtain</h4><span>ЗАКУЛИСЬЕ</span></div></article><article><img src="assets/case-002/fly-loft.png" alt="Технические галереи над сценой"><div><small>ГЛАВА III</small><h4>Above the Stage</h4><span>КОЛОСНИКИ</span></div></article></div><div class="theatre-case-footer"><span>ДОСЬЕ ФОРМИРУЕТСЯ</span><strong>OPEN CASE</strong></div></div>`;
  theatreCase.insertAdjacentHTML('beforeend', `<section class="theatre-materials"><div class="theatre-materials-head"><div><span>CASE No. 002</span><h3>Улики по делу</h3></div><strong data-theatre-evidence-progress>0 / 3</strong></div><div class="theatre-evidence-grid" data-theatre-evidence-grid></div></section>`);
  renderTheatreEvidence();
  theatreCase.addEventListener('click',e=>{const clue=e.target.closest('[data-theatre-evidence]');if(clue)openTheatreEvidence(+clue.dataset.theatreEvidence)});
  const openingChapter = theatreCase.querySelector('.theatre-chapters article');
  openingChapter.classList.add('theatre-chapter-open');
  openingChapter.tabIndex = 0;
  openingChapter.setAttribute('role', 'button');
  openingChapter.setAttribute('aria-label', 'Открыть главу The Empty Stage');
  openingChapter.addEventListener('click', openTheatrePrologue);
  openingChapter.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTheatrePrologue(); } });
  const backstageChapter=theatreCase.querySelectorAll('.theatre-chapters article')[1];
  backstageChapter.tabIndex=0;
  backstageChapter.setAttribute('role','button');
  backstageChapter.setAttribute('aria-label','Открыть главу Behind the Curtain');
  const launchBackstage=()=>openTheatreBackstage();
  backstageChapter.addEventListener('click',launchBackstage);
  backstageChapter.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();launchBackstage()}});
  const flyLoftChapter=theatreCase.querySelectorAll('.theatre-chapters article')[2];
  flyLoftChapter?.classList.add('theatre-chapter-open');
  if(flyLoftChapter){flyLoftChapter.tabIndex=0;flyLoftChapter.setAttribute('role','button');flyLoftChapter.setAttribute('aria-label','Открыть главу Above the Stage');flyLoftChapter.addEventListener('click',openThomasChapter);flyLoftChapter.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openThomasChapter()}})}
}

function renderTheatreEvidence(){
  if(!theatreCase)return;
  const found=localStorage.getItem('theatrePageEvidence')==='yes',backstageFound=localStorage.getItem('theatreBackstageEvidence')==='yes',progress=theatreCase.querySelector('[data-theatre-evidence-progress]'),grid=theatreCase.querySelector('[data-theatre-evidence-grid]');
  if(!progress||!grid)return;
  const backstageChapter=theatreCase.querySelectorAll('.theatre-chapters article')[1];
  backstageChapter?.classList.add('theatre-chapter-open');
  backstageChapter?.classList.remove('theatre-chapter-locked');
  if(backstageChapter)backstageChapter.setAttribute('aria-disabled','false');
  progress.textContent=`${(found?1:0)+(backstageFound?1:0)} / 3`;
  grid.innerHTML=`<button class="theatre-evidence-slot ${found?'found':'locked'}" ${found?'data-theatre-evidence="1" aria-label="Рассмотреть вырванную страницу"':'disabled'}><i style="background-image:url('assets/case-002/torn-script-page.png')"></i><span>01</span><b>${found?'Вырванная страница':'НЕ НАЙДЕНО'}</b></button><button class="theatre-evidence-slot ${backstageFound?'found':'locked'}" ${backstageFound?'data-theatre-evidence="2" aria-label="Рассмотреть журнал мастер-пропуска"':'disabled'}><i style="background-image:url('assets/case-002/master-pass-register.png')"></i><span>02</span><b>${backstageFound?'Журнал мастер-пропуска':'НЕ НАЙДЕНО'}</b></button><button class="theatre-evidence-slot locked" disabled><i></i><span>03</span><b>НЕ НАЙДЕНО</b></button>`;
}
function theatrePageMarkup(buttonLabel='ЗАКРЫТЬ'){
  return `<div class="theatre-page-evidence"><div class="theatre-page-photo"><img src="assets/case-002/torn-script-page.png" alt="Вырванная страница оригинальной пьесы"><div class="theatre-page-copy"><small>ACT III · SCENE FOUR</small><p><b>ELIZA:</b> You cannot own a story simply because you were the first to put your name on it.</p><p class="stage-direction">During the blackout, the figure in the red coat crosses behind the curtain.</p><em>Final revision. M. S.<br>14 October 1998.</em></div></div><div class="theatre-page-notes"><span>УЛИКА 01 · ОРИГИНАЛ</span><h2>Вырванная страница</h2><p>В подделке эта же реплика звучит иначе:</p><blockquote>“A story belongs to the one brave enough to bring it to the stage.”</blockquote><small>WRITTEN AND DIRECTED BY VICTOR HALE</small><div><b>ВЫВОД ДЕТЕКТИВА</b><strong>Подменили не только бумагу. Кто-то изменил смысл сцены и удалил инициалы M. S. Человек в красном ушёл за занавес.</strong></div><button type="button" data-theatre-page-action>${buttonLabel}</button></div></div>`;
}
function theatrePassMarkup(buttonLabel='ЗАКРЫТЬ'){
  return `<div class="theatre-pass-evidence"><div class="theatre-pass-photo"><img src="assets/case-002/master-pass-register.png" alt="Механический журнал доступа и ключ с инициалами V.H."><div class="pass-log-print"><span>18:43</span><b>MASTER PASS</b><em>FLY GALLERY · V.H.</em></div></div><div class="theatre-pass-notes"><span>УЛИКА 02 · ЗАКУЛИСЬЕ</span><h2>Журнал мастер-пропуска</h2><p>Во время отключения света механизм зарегистрировал мастер-пропуск Виктора.</p><div><b>ВЫВОД ДЕТЕКТИВА</b><strong>Пропуск Виктора был в закулисье в 18:43. Но журнал не показывает, кто им воспользовался.</strong></div><button type="button" data-theatre-page-action>${buttonLabel}</button></div></div>`;
}
function openTheatreEvidence(id=1){
  let viewer=document.querySelector('#theatreEvidenceViewer');
  if(!viewer){viewer=document.createElement('div');viewer.id='theatreEvidenceViewer';viewer.className='theatre-evidence-viewer';viewer.innerHTML=`<div class="theatre-evidence-backdrop" data-theatre-view-close></div><article></article>`;document.body.append(viewer);viewer.addEventListener('click',e=>{if(e.target.closest('[data-theatre-view-close],[data-theatre-page-action]')){viewer.classList.remove('active');document.body.style.overflow=''}})}
  viewer.querySelector('article').innerHTML=`${id===2?theatrePassMarkup():theatrePageMarkup()}<button class="theatre-view-close" type="button" data-theatre-view-close aria-label="Закрыть">×</button>`;
  viewer.classList.add('active');document.body.style.overflow='hidden';
}

const thomasEvidence=[
  {id:'original',title:'Страница M. S.',image:'assets/case-002/torn-script-page.png'},
  {id:'forgery',title:'Поддельная страница',image:'assets/case-002/replacement-manuscript.png'},
  {id:'note',title:'Записка Эвелин',image:'assets/case-002/evelyn-red-coat-note.png'},
  {id:'pass',title:'Мастер-пропуск',image:'assets/case-002/master-pass-register.png'},
  {id:'scarf',title:'Красный шарф',image:'assets/case-002/mannequin-black-red-scarf.png'}
];
let thomasSelectedEvidence='';
const THOMAS_API_URL='https://bot-1787827995-6644-dinarag.bothost.tech/api/thomas';
function openThomasChapter(){
  pauseCaseMusic();spotlightCleanup();document.querySelector('#gameLevel').textContent='ГЛАВА III · ABOVE THE STAGE';document.querySelector('#progress').textContent='';modal.classList.add('active');modal.querySelector('.game').className='game theatre-thomas-modal';document.body.style.overflow='hidden';
  renderThomasAscent();
}
function renderThomasAscent(){
  gameBody.innerHTML=`<section class="thomas-ascent"><div class="thomas-ascent-copy"><small>ГЛАВА III · ABOVE THE STAGE</small><h2>Над сценой ещё горит свет</h2><p>Из колосников доносится щелчок лебёдки. Кто-то остался наверху.</p><button type="button" data-thomas-climb>ПОДНЯТЬСЯ</button></div><i class="thomas-ascent-light" aria-hidden="true"></i></section>`;
  gameBody.querySelector('[data-thomas-climb]').addEventListener('click',renderThomasArrival,{once:true});
}
function renderThomasArrival(){
  gameBody.innerHTML=`<section class="thomas-arrival"><img src="assets/case-002/thomas-mercer.png" alt="Незнакомый работник театра стоит у пульта колосников"><aside><img src="${avatarSrc()}" alt=""><div><small>МЫСЛЬ ДЕТЕКТИВА</small><p>У механизма стоит незнакомый работник театра. Возможно, он видел, что произошло наверху.</p><button type="button" data-thomas-approach>ПОДОЙТИ</button></div></aside></section>`;
  const scene=gameBody.querySelector('.thomas-arrival');
  requestAnimationFrame(()=>requestAnimationFrame(()=>scene.classList.add('spotted')));
  gameBody.querySelector('[data-thomas-approach]').addEventListener('click',()=>renderThomasPrelude(0),{once:true});
}
const thomasPrelude=[
  {name:'НЕЗНАКОМЕЦ',line:'Good evening. Please be careful. This gallery is not open to visitors.',choices:[
    {text:'Good evening. I am investigating the stolen manuscript.',reply:'I heard that a page was missing. I did not expect a detective to come up here.'},
    {text:'Good evening. I only need to ask a few questions.',reply:'You may ask. I cannot promise that I will have every answer.'}
  ]},
  {name:'НЕЗНАКОМЕЦ',line:'',choices:[
    {text:'Let us start with your name.',reply:'Thomas Mercer. I keep the stage machinery in order. I have done so for thirty years.'},
    {text:'You know this theatre well. Who are you?',reply:'Long enough to hear when a machine, or a person, is not telling the truth. Thomas Mercer.'}
  ]},
  {name:'THOMAS MERCER',line:'',choices:[
    {text:'Were you here during the blackout?',reply:'I was. I stayed near the winches, but the darkness made every sound difficult to place.'},
    {text:'Did you notice anything unusual that night?',reply:'The ropes moved after the power failed. No one had called for a scene change.'}
  ]},
  {name:'THOMAS MERCER',line:'',final:true}
];
function renderThomasPrelude(index,reply=''){
  const node=thomasPrelude[index];
  const spoken=reply||node.line;
  gameBody.innerHTML=`<section class="thomas-prelude"><img src="assets/case-002/thomas-mercer.png" alt="Томас Мерсер"><div class="thomas-prelude-dialogue"><article><small>${node.name}</small><p>${spoken}</p></article>${node.final?`<aside><img src="${avatarSrc()}" alt=""><div><small>МЫСЛЬ ДЕТЕКТИВА</small><p>Томас осторожничает. Похоже, правильная улика поможет его разговорить.</p><button type="button" data-thomas-interview>РАЗГОВОРИТЬ ТОМАСА</button></div></aside>`:`<div class="thomas-prelude-choices">${node.choices.map((choice,i)=>`<button type="button" data-thomas-reply="${i}"><img src="${avatarSrc()}" alt=""><span>${choice.text}</span></button>`).join('')}</div>`}</div></section>`;
  gameBody.querySelectorAll('[data-thomas-reply]').forEach(button=>button.addEventListener('click',()=>{const choice=node.choices[Number(button.dataset.thomasReply)];renderThomasPrelude(index+1,choice.reply)},{once:true}));
  gameBody.querySelector('[data-thomas-interview]')?.addEventListener('click',renderThomasInterview,{once:true});
}
function renderThomasInterview(){
  thomasSelectedEvidence='';
  const availableThomasEvidence=thomasEvidence.filter(item=>item.id==='original'&&localStorage.getItem('theatrePageEvidence')==='yes'||item.id==='pass'&&localStorage.getItem('theatreBackstageEvidence')==='yes');
  gameBody.innerHTML=`<section class="thomas-interview"><div class="thomas-stage"><img src="assets/case-002/thomas-mercer.png" alt="Томас Мерсер"><span>THOMAS MERCER</span><small>CHIEF STAGE TECHNICIAN</small></div><main class="thomas-dialogue"><header><div><small>РАЗГОВОР</small><h2>Добейся доступа к механизму</h2></div><span class="thomas-status"><i></i>НАСТОРОЖЕН</span></header><div class="thomas-messages" data-thomas-messages><article class="thomas-message npc"><b>THOMAS MERCER</b><p>I have kept this theatre running for thirty years. Tell me why you are here.</p></article></div><form class="thomas-composer" data-thomas-form><div class="thomas-attachment" data-thomas-attachment hidden></div><textarea aria-label="Написать Томасу по-английски" placeholder="Напиши ответ по-английски..." rows="1"></textarea><button type="submit">ОТПРАВИТЬ</button></form></main><aside class="thomas-caseboard"><section class="thomas-mood"><small>ОТНОШЕНИЕ ТОМАСА</small><strong>НАСТОРОЖЕН</strong><div><i></i><i></i><i></i><i></i></div><p>Сначала покажи, что твоим вопросам можно доверять.</p></section><section class="thomas-goals"><small>ЦЕЛИ РАЗГОВОРА</small><ol><li><i></i><span>Заслужить доверие</span></li><li><i></i><span>Установить, кто такая M. S.</span></li><li><i></i><span>Получить доступ к механизму</span></li></ol></section><section class="thomas-evidence"><small>УЛИКИ ИЗ ДЕЛА</small><div>${availableThomasEvidence.length?availableThomasEvidence.map(item=>`<button type="button" data-thomas-evidence="${item.id}" title="${item.title}"><i style="background-image:url('${item.image}')"></i><span>${item.title}</span></button>`).join(''):'<p class="thomas-no-evidence">Улик пока нет.</p>'}</div></section><section class="thomas-facts"><small>УСТАНОВЛЕНО</small><p>Новые факты появятся здесь во время разговора.</p></section></aside></section>`;
  const form=gameBody.querySelector('[data-thomas-form]'),attachment=form.querySelector('[data-thomas-attachment]'),textarea=form.querySelector('textarea'),submit=form.querySelector('button[type="submit"]'),messagesPanel=gameBody.querySelector('[data-thomas-messages]');
  const thomasHistory=[{role:'assistant',content:'I have kept this theatre running for thirty years. Tell me why you are here.'}];
  const addThomasMessage=(role,text,state='')=>{const article=document.createElement('article');article.className=`thomas-message ${role==='assistant'?'npc':'detective'} ${state}`.trim();const label=document.createElement('b');label.textContent=role==='assistant'?'THOMAS MERCER':'DETECTIVE';const copy=document.createElement('p');copy.textContent=text;article.append(label,copy);messagesPanel.append(article);messagesPanel.scrollTo({top:messagesPanel.scrollHeight,behavior:'smooth'});return article};
  gameBody.querySelectorAll('[data-thomas-evidence]').forEach(button=>button.addEventListener('click',()=>{gameBody.querySelectorAll('[data-thomas-evidence]').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');thomasSelectedEvidence=button.dataset.thomasEvidence;const evidence=availableThomasEvidence.find(x=>x.id===thomasSelectedEvidence);attachment.hidden=false;attachment.innerHTML=`<span style="background-image:url('${evidence.image}')"></span><b>${evidence.title}</b><button type="button" aria-label="Убрать улику">×</button>`;attachment.querySelector('button').addEventListener('click',()=>{thomasSelectedEvidence='';attachment.hidden=true;button.classList.remove('selected')})}));
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const text=textarea.value.trim();
    if(!text||submit.disabled)return;
    const evidence=availableThomasEvidence.find(item=>item.id===thomasSelectedEvidence);
    addThomasMessage('user',text);
    thomasHistory.push({role:'user',content:text});
    textarea.value='';textarea.disabled=true;submit.disabled=true;submit.textContent='...';
    const waiting=addThomasMessage('assistant','Thomas is thinking...','waiting');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
    try{
      const response=await fetch(THOMAS_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:thomasHistory,evidence:evidence?`${evidence.title}. This item was found during the investigation.`:''}),signal:controller.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.reply)throw new Error(data.error||`HTTP ${response.status}`);
      waiting.remove();addThomasMessage('assistant',data.reply);thomasHistory.push({role:'assistant',content:data.reply});
      if(evidence){thomasSelectedEvidence='';attachment.hidden=true;gameBody.querySelectorAll('[data-thomas-evidence]').forEach(button=>button.classList.remove('selected'))}
    }catch(error){
      waiting.remove();addThomasMessage('assistant',error.name==='AbortError'?'I need a moment. Please ask me again.':'I cannot answer just now. Please try again.','error');
      thomasHistory.pop();
    }finally{
      clearTimeout(timeout);textarea.disabled=false;submit.disabled=false;submit.textContent='ОТПРАВИТЬ';textarea.focus();
    }
  });
}

const backstageRoute=[
  {bg:'backstage-entrance-v2.png',pos:'center',instruction:'Walk past the wardrobe and take the central passage.',choices:[['WARDROBE',18,54],['CENTRAL PASSAGE',51,55],['SERVICE STAIRS',82,52]],correct:1,wrong:['The wardrobe is beside you, but the note says to walk past it.','','The note does not mention the stairs.']},
  {bg:'backstage-entrance-v2.png',pos:'56% center',instruction:'Do not go upstairs. Turn left after the painted city.',choices:[['LEFT OF THE SCENERY',39,53],['STRAIGHT AHEAD',58,50],['UPSTAIRS',82,45]],correct:0,wrong:['','The painted city marks the turn.','The first words say: Do not go upstairs.']},
  {bg:'prop-junction.png',pos:'center',instruction:'Cross the prop room and stop beside the tall mirror.',choices:[['TALL MIRROR',16,50],['PAINTED FOREST',51,50],['RIGHT CORRIDOR',85,48]],correct:0,wrong:['','The instruction says to stop beside the mirror.','The corridor comes later.'],trace:0},
  {bg:'prop-junction.png',pos:'18% center',instruction:'From the mirror, walk towards the old clock.',choices:[['BACK TO THE CURTAIN',17,51],['PAINTED FLATS',51,49],['OLD CLOCK',70,43]],correct:2,wrong:['The route continues deeper backstage.','The clock is visible beyond the scenery.','']},
  {bg:'prop-junction.png',pos:'68% center',instruction:'Take the corridor to the right of the clock.',choices:[['LEFT PASSAGE',42,49],['RIGHT CORRIDOR',86,48],['CENTRAL FLOOR',59,63]],correct:1,wrong:['The direction says right, not left.','','The note points to a corridor.']},
  {bg:'backstage-entrance-v2.png',pos:'76% center',instruction:'Go up the narrow stairs beside the pulley.',choices:[['WARDROBE PASSAGE',20,53],['DARK CORRIDOR',54,50],['NARROW STAIRS',83,46]],correct:2,wrong:['The wardrobe is now behind you.','Look for the pulley beside the stairs.',''],trace:1},
  {bg:'fly-gallery-v2.png',pos:'28% center',instruction:'At the top, turn left before the wall clock.',choices:[['LEFT BEFORE THE CLOCK',18,48],['ACROSS THE GALLERY',72,49],['DOWN THE STAIRS',27,58]],correct:0,wrong:['','The gallery comes after the turn.','You have just reached the top.']},
  {bg:'fly-gallery-v2.png',pos:'center',instruction:'Walk across the gallery, keeping the ropes on your left.',choices:[['LEFT STAIRS',19,52],['ACROSS THE GALLERY',74,50],['BETWEEN THE ROPES',48,48]],correct:1,wrong:['The instruction says across the gallery.','','Keep the ropes on your left, do not walk through them.']},
  {bg:'fly-gallery-v2.png',pos:'68% center',instruction:'Go down one level at the rope room.',choices:[['CONTINUE AHEAD',78,47],['GO DOWN ONE LEVEL',30,54],['GO UP',19,35]],correct:1,wrong:['The route changes level here.','','The instruction says down.'],trace:2},
  {bg:'fly-gallery-v2.png',pos:'42% center',instruction:'Enter the small room opposite the prompt desk.',choices:[['PROMPT DESK',34,54],['SMALL ROOM',69,49],['MAIN STAGE',49,72]],correct:1,wrong:['The room is opposite the desk.','','The route stays backstage.']}
];
const backstageTraces=[
  {kind:'thread',title:'Красная нить',text:'Нить зацепилась за край декорации. Такая же ткань была на длинном красном пальто.',button:'ПРОДОЛЖИТЬ ПУТЬ'},
  {kind:'paint',title:'Свежая краска',text:'На перилах остался свежий след. Кто-то держался за них во время отключения света.',button:'ПОДНЯТЬСЯ ВЫШЕ'},
  {kind:'page',title:'Обрывок страницы',text:'Край бумаги совпадает с вырванной страницей. Рукопись действительно пронесли через галерею.',button:'ИДТИ ДАЛЬШЕ'}
];
let backstageStep=0,backstageTraceResume=0,backstageRun=0;
function openTheatreBackstage(){
  pauseCaseMusic();clearVictorDialogue();spotlightCleanup();backstageRun++;backstageStep=0;backstageRoomIndex=0;document.querySelector('#gameLevel').textContent='';document.querySelector('#progress').textContent='';modal.classList.add('active');modal.querySelector('.game').className='game theatre-backstage-modal';document.body.style.overflow='hidden';
  gameBody.innerHTML=`<section class="backstage-camera-guide"><header><small>ГЛАВА II · BEHIND THE CURTAIN</small><h2>Камера покажет, что изменилось</h2></header><div class="camera-guide-cards"><article><div class="guide-archive"></div><span>1</span><h3>Смотри на архив</h3><p>Серая фотография показывает закулисье до отключения света.</p></article><article><div class="guide-lens"><i></i></div><span>2</span><h3>Двигай объектив</h3><p>Внутри объектива видно, как то же место выглядит сейчас.</p></article><article><div class="guide-report"><i></i><b>The trunk is near the stairs.</b></div><span>3</span><h3>Фиксируй противоречие</h3><p>Сфотографируй изменение и исправь ложную запись в журнале.</p></article></div><button type="button" data-backstage-start>НАЧАТЬ ФОТОРЕКОНСТРУКЦИЮ</button></section>`;
  gameBody.querySelector('[data-backstage-start]').addEventListener('click',renderBackstageCamera);
}

const backstageRooms=[
  {name:'ГАРДЕРОБНЫЙ КОРИДОР',archive:'backstage-entrance-v2.png',current:'backstage-room1-current.png',exit:{x:50,y:47,label:'ПРОЙТИ В РЕКВИЗИТОРСКУЮ'},differences:[
    {id:'coat',x:22,y:55,title:'Пустая вешалка',before:'The empty hanger is ',wrong:'above',after:' the wardrobe.',answer:'in'},
    {id:'trunk',x:80,y:75,title:'Сундук у лестницы',before:'The trunk is ',wrong:'behind',after:' the stairs.',answer:'near'},
    {id:'rope',x:68,y:76,title:'Верёвка под лестницей',before:'The rope is ',wrong:'on',after:' the stairs.',answer:'under'},
    {id:'handprint',x:33.5,y:52.5,title:'След на колонне',before:'The handprint is ',wrong:'behind',after:' the pillar.',answer:'on'}
  ]},
  {name:'РЕКВИЗИТОРСКАЯ',archive:'prop-junction.png',current:'prop-room-current-v2.png',exit:{x:87,y:48,label:'ПРОЙТИ К КОЛОСНИКАМ'},differences:[
    {id:'mask',x:28,y:55,title:'Серебряная маска',before:'The silver mask is ',wrong:'behind',after:' the trunks.',answer:'between'},
    {id:'bust',x:39,y:49,title:'Мраморный бюст',before:'The marble bust is to the ',wrong:'right',after:' of the lamp.',answer:'left'},
    {id:'case',x:20,y:79,title:'Чёрный футляр',before:'The black case is ',wrong:'behind',after:' the mirror.',answer:'in front of'},
    {id:'canvas',x:73,y:67,title:'Свёрнутый холст',before:'The rolled canvas is ',wrong:'under',after:' the clock.',answer:'beside',answers:['beside','next to','in front of']}
  ]},
  {name:'ВЕРХНЯЯ ГАЛЕРЕЯ',archive:'fly-gallery-v2.png',current:'fly-gallery-current.png',exit:{x:86,y:38,label:'ВОЙТИ В КОСТЮМЕРНУЮ'},differences:[
    {id:'page',x:6,y:31,title:'Страница над лампой',before:'The torn page is ',wrong:'below',after:' the lamp.',answer:'above'},
    {id:'scarf',x:12,y:38,title:'Шарф под часами',before:'The red scarf is ',wrong:'above',after:' the clock.',answer:'below',answers:['below','under']},
    {id:'key',x:27,y:86,title:'Ключ напротив лестницы',before:'The brass key is ',wrong:'next to',after:' the stairs.',answer:'opposite'},
    {id:'notebook',x:89,y:67,title:'Блокнот у перил',before:'The black notebook is ',wrong:'under',after:' the railing post.',answer:'next to'}
  ]}
];
let backstageRoomIndex=0,backstagePhotos=new Set(),backstagePending=null;
function renderBackstageCamera(){
  const room=backstageRooms[backstageRoomIndex],backstageDifferences=room.differences;
  backstagePhotos=new Set();backstagePending=null;
  gameBody.innerHTML=`<section class="backstage-camera" style="--archive:url('assets/case-002/${room.archive}');--current:url('assets/case-002/${room.current}')"><div class="camera-hud"><div><small>КОМНАТА ${backstageRoomIndex+1} ИЗ 3 · ${room.name}</small><strong>НАЙДЕНО <b data-camera-count>0</b> / ${backstageDifferences.length}</strong></div><p>Серая сцена хранит прошлое. Объектив показывает настоящее.</p></div><div class="camera-scene" data-camera-scene><div class="camera-archive" aria-hidden="true"></div><div class="camera-current" aria-hidden="true"></div><div class="camera-lens" aria-hidden="true"><i></i></div><div class="camera-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>${backstageDifferences.map(d=>`<button type="button" class="camera-difference" style="--x:${d.x}%;--y:${d.y}%" data-difference="${d.id}" aria-label="Сфотографировать изменение"></button>`).join('')}<p class="camera-hint" data-camera-hint>Найди четыре изменения через объектив.</p><div class="camera-flash" aria-hidden="true"></div></div><aside class="camera-caption" data-camera-caption aria-live="polite"></aside></section>`;
  const scene=gameBody.querySelector('[data-camera-scene]'),hint=scene.querySelector('[data-camera-hint]'),lens=scene.querySelector('.camera-lens');let focusedId='';
  const targetPoint=(d,rect)=>{const imageRatio=1672/941,sceneRatio=rect.width/rect.height;let width,height,left,top;if(sceneRatio>imageRatio){width=rect.width;height=width/imageRatio;left=0;top=(rect.height-height)/2}else{height=rect.height;width=height*imageRatio;top=0;left=(rect.width-width)/2}return{x:left+width*d.x/100,y:top+height*d.y/100}};
  const syncTargets=()=>{if(!scene.isConnected)return;const rect=scene.getBoundingClientRect();backstageDifferences.forEach(d=>{const point=targetPoint(d,rect),button=scene.querySelector(`[data-difference="${d.id}"]`);if(button){button.style.left=`${point.x}px`;button.style.top=`${point.y}px`}})};syncTargets();const targetObserver=new ResizeObserver(()=>{if(scene.isConnected)syncTargets();else targetObserver.disconnect()});targetObserver.observe(scene);
  const moveLens=e=>{const point=e.touches?.[0]||e,rect=scene.getBoundingClientRect(),x=Math.max(0,Math.min(rect.width,point.clientX-rect.left)),y=Math.max(0,Math.min(rect.height,point.clientY-rect.top));scene.style.setProperty('--lens-x',`${x}px`);scene.style.setProperty('--lens-y',`${y}px`);const nearest=backstageDifferences.find(d=>{if(backstagePhotos.has(d.id))return false;const target=targetPoint(d,rect);return Math.hypot(x-target.x,y-target.y)<95});const next=nearest?.id||'';if(next!==focusedId){focusedId=next;lens.classList.toggle('focused',!!next);scene.classList.toggle('camera-focused',!!next)}};
  scene.addEventListener('pointermove',moveLens);scene.addEventListener('pointerdown',moveLens);scene.addEventListener('touchmove',moveLens,{passive:true});
  scene.addEventListener('click',e=>{const capturedId=focusedId;if(!capturedId){hint.textContent='Здесь всё совпадает с архивом.';hint.classList.add('miss');setTimeout(()=>{if(hint.isConnected){hint.textContent='Найди четыре изменения через объектив.';hint.classList.remove('miss')}},900);return}e.stopPropagation();captureBackstageDifference(capturedId)});
}
function captureBackstageDifference(id){
  if(backstagePhotos.has(id)||backstagePending)return;const difference=backstageRooms[backstageRoomIndex].differences.find(d=>d.id===id);if(!difference)return;
  backstagePending=id;const scene=gameBody.querySelector('.camera-scene'),button=scene.querySelector(`[data-difference="${id}"]`);button.classList.add('targeted');scene.querySelector('.camera-flash').classList.remove('snap');void scene.offsetWidth;scene.querySelector('.camera-flash').classList.add('snap');showBackstageCaption(difference,false);
}
function showBackstageCaption(difference,complete){
  const panel=gameBody.querySelector('[data-camera-caption]');
  const sentence=`${difference.before}<mark class="${complete?'right':'wrong-word'}">${complete?difference.answer:difference.wrong}</mark>${difference.after}`;
  panel.innerHTML=`<button type="button" class="caption-close" aria-label="Закрыть">×</button><small>PHOTO EVIDENCE</small>${complete?`<span class="camera-record-label">ЗАПИСЬ ИСПРАВЛЕНА</span><p class="camera-correct-record">${sentence}</p><button type="button" class="caption-confirm">ЗАКРЫТЬ</button>`:`<span class="camera-record-label">В ЖУРНАЛЕ ОШИБКА</span><p class="camera-task-sentence">${sentence}</p><input autocomplete="off" spellcheck="false" aria-label="Верный английский предлог"><button type="button" class="caption-confirm">ИСПРАВИТЬ ЗАПИСЬ</button><em></em>`}`;
  panel.classList.add('visible');const field=panel.querySelector('input');let wrongAttempts=0;if(field)setTimeout(()=>field.focus(),120);
  const close=()=>{panel.classList.remove('visible');if(!complete){gameBody.querySelector(`[data-difference="${difference.id}"]`)?.classList.remove('targeted');backstagePending=null}};
  panel.querySelector('.caption-close').addEventListener('click',close);
  panel.querySelector('.caption-confirm').addEventListener('click',()=>{if(complete){panel.classList.remove('visible');return}const normalize=text=>text.trim().toLowerCase().replace(/[.!?,;:]+$/g,'').replace(/\s+/g,' '),value=normalize(field.value),validAnswers=(difference.answers||[difference.answer]).map(normalize),fullAnswers=validAnswers.map(answer=>normalize(`${difference.before}${answer}${difference.after}`));if(!validAnswers.includes(value)&&!fullAnswers.includes(value)){wrongAttempts++;field.classList.remove('wrong');void field.offsetWidth;field.classList.add('wrong');const task=panel.querySelector('.camera-task-sentence'),wrongWord=task.querySelector('.wrong-word');if(wrongAttempts>=3&&!wrongWord.classList.contains('hint-revealed')){wrongWord.dataset.correction=difference.answer;wrongWord.classList.add('hint-revealed');task.classList.add('has-correction');panel.querySelector('em').textContent=''}else if(wrongAttempts<3)panel.querySelector('em').textContent='Сравни положение предмета на снимке.';return}const accepted=validAnswers.includes(value)?value:difference.answer;panel.querySelector('.camera-task-sentence').innerHTML=`${difference.before}<mark class="right">${accepted}</mark>${difference.after}`;field.disabled=true;panel.querySelector('.caption-confirm').disabled=true;setTimeout(()=>{saveBackstagePhoto(difference);panel.classList.remove('visible')},700)});
}
function saveBackstagePhoto(difference){
  backstagePhotos.add(difference.id);backstagePending=null;const target=gameBody.querySelector(`[data-difference="${difference.id}"]`);target?.classList.remove('targeted');target?.classList.add('captured');gameBody.querySelector('[data-camera-count]').textContent=backstagePhotos.size;
  if(backstagePhotos.size===backstageRooms[backstageRoomIndex].differences.length)setTimeout(renderBackstageRoomExit,650);
}
function openCapturedDifference(id){const difference=backstageRooms[backstageRoomIndex].differences.find(d=>d.id===id);if(difference)showBackstageCaption(difference,true)}
function renderBackstageRoomExit(){
  const room=backstageRooms[backstageRoomIndex];
  gameBody.innerHTML=`<section class="backstage-room-exit" style="--room:url('assets/case-002/${room.current}')"><div class="room-exit-thought"><img src="${avatarSrc()}" alt=""><p>${backstageRoomIndex===0?'След ведёт дальше, в реквизиторскую.':backstageRoomIndex===1?'Надо проверить, что изменилось наверху.': 'За этой дверью горит свет. Там кто-то есть.'}</p></div><button type="button" class="room-exit-door" style="--x:${room.exit.x}%;--y:${room.exit.y}%" data-room-exit><span>${room.exit.label}</span></button></section>`;
  gameBody.querySelector('[data-room-exit]').addEventListener('click',e=>{e.currentTarget.disabled=true;gameBody.querySelector('.backstage-room-exit').classList.add('leaving');setTimeout(()=>{if(backstageRoomIndex<backstageRooms.length-1){backstageRoomIndex++;renderBackstageCamera()}else renderEvelynEncounter()},650)});
}

const evelynDialogue=[
  {speaker:'EVELYN SHAW',text:'Stop. Who are you?',choices:[
    {text:'Good evening. I am investigating the missing theatre play. Are you Evelyn Shaw?',next:1},
    {text:'Good evening. I found changes in three backstage rooms. Did you make them?',next:2}
  ]},
  {speaker:'EVELYN SHAW',text:'Yes. I am the costume supervisor. I did not change those rooms.',next:3},
  {speaker:'EVELYN SHAW',text:'No. I found the changes when I returned. My name is Evelyn Shaw.',next:3},
  {speaker:'EVELYN SHAW',text:'You are looking for the same thing I am.',choices:[
    {text:'What brought you back after rehearsal?',next:4},
    {text:'What did you notice first?',next:5}
  ]},
  {speaker:'EVELYN SHAW',text:'Someone left a note under this door. It said, "Check the red coat."',next:6},
  {speaker:'EVELYN SHAW',text:'The red coat was missing from its usual place. Then I saw that the costume list had changed.',next:6},
  {speaker:'EVELYN SHAW',text:'The red scarf was added to the list after rehearsal. It was never part of the final scene.',choices:[
    {text:'Do you still have the note?',next:7},
    {text:'Who could change the costume list?',next:8}
  ]},
  {speaker:'EVELYN SHAW',text:'Yes. There is no name on it, only those four words.',end:true},
  {speaker:'EVELYN SHAW',text:'The list stays in my desk. Victor and the stage manager also have keys to this room.',end:true}
];
function renderEvelynEncounter(){
  gameBody.innerHTML=`<section class="evelyn-room"><img class="evelyn-character" src="assets/case-002/evelyn-shaw.png" alt="Женщина в театральной костюмерной"><aside class="evelyn-thought"><img src="${avatarSrc()}" alt=""><p>В костюмерной кто-то есть. Она что-то ищет среди костюмов.</p><button type="button" data-evelyn-approach>ПОДОЙТИ</button></aside><div class="evelyn-conversation" aria-live="polite"></div></section>`;
  gameBody.querySelector('[data-evelyn-approach]').addEventListener('click',()=>{const scene=gameBody.querySelector('.evelyn-room');scene.classList.add('speaking');renderEvelynDialogue(0)});
}
function renderEvelynDialogue(index){
  const node=evelynDialogue[index],panel=gameBody.querySelector('.evelyn-conversation');if(!node||!panel)return;
  panel.innerHTML=`<div class="evelyn-bubble"><small>${node.speaker}</small><p>${node.text}</p></div>${node.choices?`<div class="evelyn-choices">${node.choices.map((choice,i)=>`<button type="button" data-evelyn-choice="${i}"><img src="${avatarSrc()}" alt=""><span>${choice.text}</span></button>`).join('')}</div>`:node.end?`<div class="evelyn-clue"><small>МЫСЛЬ ДЕТЕКТИВА</small><p>Кто оставил Эвелин записку и зачем направил её к красному пальто?</p><button type="button" data-evelyn-finish>СОХРАНИТЬ НАБЛЮДЕНИЕ</button></div>`:`<button type="button" class="evelyn-next" data-evelyn-next>ПРОДОЛЖИТЬ</button>`}`;
  panel.querySelectorAll('[data-evelyn-choice]').forEach(button=>button.addEventListener('click',()=>{const choice=node.choices[+button.dataset.evelynChoice];button.closest('.evelyn-choices').classList.add('chosen');setTimeout(()=>renderEvelynDialogue(choice.next),180)}));
  panel.querySelector('[data-evelyn-next]')?.addEventListener('click',()=>renderEvelynDialogue(node.next));
  panel.querySelector('[data-evelyn-finish]')?.addEventListener('click',()=>{localStorage.setItem('theatreEvelynMet','yes');renderBackstageEvelynConclusion()});
}
function renderBackstageEvelynConclusion(){
  gameBody.innerHTML=`<section class="evelyn-conclusion"><div><img src="assets/case-002/evelyn-shaw.png" alt="Эвелин Шоу"><article><small>НОВЫЙ СВИДЕТЕЛЬ · EVELYN SHAW</small><h2>Костюмный след подменили</h2><p>После репетиции кто-то изменил список костюмов и оставил Эвелин записку с просьбой проверить красное пальто. Красный шарф не принадлежал финальной сцене.</p><button type="button" data-evelyn-close>ВЕРНУТЬСЯ К ДЕЛУ</button></article></div></section>`;
  gameBody.querySelector('[data-evelyn-close]').addEventListener('click',()=>closeGame(false));
}
function renderBackstageRoute(){
  const run=backstageRun,node=backstageRoute[backstageStep],knots=backstageRoute.map((_,i)=>`<i class="${i<backstageStep?'passed':i===backstageStep?'current':''}"></i>`).join('');
  gameBody.innerHTML=`<section class="backstage-route" style="--route-bg:url('assets/case-002/${node.bg}');--route-pos:${node.pos}"><header><div class="backstage-route-thread">${knots}</div><p>${node.instruction}</p></header><div class="backstage-route-feedback" aria-live="polite"></div><div class="backstage-route-choices">${node.choices.map((choice,i)=>`<button type="button" style="--x:${choice[1]}%;--y:${choice[2]}%" data-route-choice="${i}"><span>${choice[0]}</span></button>`).join('')}</div></section>`;
  const scene=gameBody.querySelector('.backstage-route'),feedback=scene.querySelector('.backstage-route-feedback');
  scene.querySelectorAll('[data-route-choice]').forEach(button=>button.addEventListener('click',()=>{
    if(scene.classList.contains('locked'))return;const pick=+button.dataset.routeChoice;
    if(pick!==node.correct){scene.classList.add('locked','wrong-route');button.classList.add('wrong');feedback.textContent=node.wrong[pick]||'This route does not match the note.';setTimeout(()=>{if(run!==backstageRun||!scene.isConnected)return;scene.classList.remove('locked','wrong-route');button.classList.remove('wrong');feedback.textContent=''},1700);return}
    scene.classList.add('locked','right-route');button.classList.add('right');const next=backstageStep+1;
    setTimeout(()=>{if(run!==backstageRun)return;if(Number.isInteger(node.trace)){backstageTraceResume=next;renderBackstageTrace(node.trace)}else if(next>=backstageRoute.length)renderBackstageFinalRoom();else{backstageStep=next;renderBackstageRoute()}},700);
  }));
}
function renderBackstageTrace(index){
  const trace=backstageTraces[index];
  gameBody.innerHTML=`<section class="backstage-trace trace-${trace.kind}"><div class="backstage-trace-photo"><i></i></div><article><small>СЛЕД НА МАРШРУТЕ</small><h2>${trace.title}</h2><p>${trace.text}</p><button type="button" data-trace-continue>${trace.button}</button></article></section>`;
  gameBody.querySelector('[data-trace-continue]').addEventListener('click',()=>{backstageStep=backstageTraceResume;renderBackstageRoute()});
}
function renderBackstageFinalRoom(){
  gameBody.innerHTML=`<section class="backstage-final-room"><header><small>СТАРАЯ ТЕХНИЧЕСКАЯ КОМНАТА</small><p>Осмотри то, к чему прикасались недавно.</p></header><button type="button" class="final-room-clue logbook" data-final-clue="logbook" aria-label="Осмотреть раскрытый журнал"><i></i></button><button type="button" class="final-room-clue compartment" data-final-clue="compartment" aria-label="Осмотреть пустой футляр"><i></i></button><button type="button" class="final-room-clue register" data-final-clue="register" aria-label="Осмотреть механизм доступа"><i></i></button><aside class="final-room-note"><p></p><button type="button">ПРОДОЛЖИТЬ</button></aside></section>`;
  const scene=gameBody.querySelector('.backstage-final-room'),note=scene.querySelector('.final-room-note'),found=new Set(),texts={logbook:'Последняя запись сделана перед отключением света. После 18:40 журнал не заполняли.',compartment:'В бархатном отделении лежала рукопись. На ткани остался свежий прямоугольный след.',register:'Лента механизма не пуста. На ней сохранилось время последнего прохода.'};
  scene.querySelectorAll('[data-final-clue]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.finalClue;found.add(id);button.classList.add('found');note.querySelector('p').textContent=texts[id];note.classList.add('visible');note.querySelector('button').textContent=found.size===3?'РАЗВЕРНУТЬ ЛЕНТУ':'ПРОДОЛЖИТЬ'}));
  note.querySelector('button').addEventListener('click',()=>{note.classList.remove('visible');if(found.size===3)setTimeout(renderBackstageEvidence,250)});
}
function renderBackstageEvidence(){
  gameBody.innerHTML=`<section class="backstage-evidence-result">${theatrePassMarkup('ДОБАВИТЬ К УЛИКАМ')}</section>`;
  gameBody.querySelector('[data-theatre-page-action]').addEventListener('click',()=>{localStorage.setItem('theatreBackstageEvidence','yes');renderTheatreEvidence();closeGame(false);setTimeout(()=>theatreCase?.querySelector('.theatre-materials')?.scrollIntoView({behavior:'smooth',block:'center'}),100)});
}

let theatrePrologueStep = 0;
function openTheatrePrologue() {
  pauseCaseMusic();
  clearVictorDialogue();
  theatrePrologueStep = 0;
  document.querySelector('#gameLevel').textContent = '';
  document.querySelector('#progress').textContent = '';
  modal.classList.add('active');
  modal.querySelector('.game').className = 'game theatre-prologue-modal';
  document.body.style.overflow = 'hidden';
  renderTheatrePrologue();
}
function renderTheatrePrologue() {
  const scenes = [
    `<section class="theatre-prologue-scene theatre-victor"><button class="victor-approach" type="button" aria-label="Подойти к незнакомцу"><span class="victor-idle" role="img" aria-label="Незнакомец стоит у входа в театр"></span></button><aside class="detective-first-thought"><img src="${avatarSrc()}" alt=""><p>У входа кто-то ждёт. Похоже, мне стоит с ним поговорить.</p><button type="button" data-approach-victor>ПОДОЙТИ</button></aside><div class="victor-conversation" aria-live="polite"><div class="victor-dialogue-log" data-victor-log></div><div class="victor-choices" data-victor-choices></div></div></section>`,
    `<section class="theatre-prologue-scene theatre-auditorium" data-flashlight><div class="flashlight-darkness"></div><div class="prologue-whisper">Осмотрись</div><button class="scene-clue" style="--clue-x:12%;--clue-y:38%" data-x=".12" data-y=".38" data-thought="Аварийные лампы ещё горят. Отключение было недолгим." type="button" aria-label="Осмотреть аварийную лампу"></button><button class="scene-clue" style="--clue-x:50%;--clue-y:76%" data-x=".50" data-y=".76" data-thought="Все ушли к выходу. Но на дорожке видны следы в обратную сторону." type="button" aria-label="Осмотреть проход"></button><button class="scene-clue" style="--clue-x:66%;--clue-y:31%" data-x=".66" data-y=".31" data-thought="Занавес закрыли после отключения. Кто-то оставался возле сцены." type="button" aria-label="Осмотреть занавес"></button><aside class="scene-thought" aria-live="polite"><p></p><button type="button" aria-label="Закрыть мысль">ПРОДОЛЖИТЬ</button></aside><button class="manuscript-hotspot" type="button" aria-label="Осмотреть футляр"><span>E</span><b>ОСМОТРЕТЬ</b></button></section>`,
    `<section class="theatre-prologue-scene theatre-fake-page"><div class="fake-page-photo"><img src="assets/case-002/replacement-manuscript.png" alt="Перепечатанная страница пьесы в футляре"><article class="fake-page-copy"><small>ACT III · SCENE FOUR</small><p><b>ELIZA:</b> A story belongs to the one brave enough to bring it to the stage.</p><p class="script-direction">Six figures cross the stage:</p><ol><li>a blue dress, a silver mask, no gloves</li><li>a tan coat, brown gloves, a black top hat</li><li>a black coat, an ivory scarf, no hat</li><li>a short red jacket, black gloves, a black case</li><li>a long blue coat, black gloves, a black case</li><li>a long red coat, black gloves, no hat, a black case</li></ol><p><b>ELIZA:</b> The last figure leaves before the lights return.</p><em>REVISED COPY · VICTOR HALE<br>PRINTED 18:41</em></article></div><div class="evidence-reveal"><small>НАДПИСЬ НА ФУТЛЯРЕ: ORIGINAL · 1998</small><p>Внутри лежит копия, напечатанная сегодня в 18:41.</p><strong>Оригинал подменили.</strong><button type="button" data-prologue-next>ПРОДОЛЖИТЬ ОСМОТР</button></div></section>`,
    `<section class="theatre-prologue-scene theatre-blackout" data-flashlight><div class="flashlight-darkness"></div><div class="curtain-movement"></div><div class="prologue-whisper final">У сцены слышен шум механизма.</div><button type="button" class="begin-investigation" data-prologue-finish>ПОДОЙТИ К СЦЕНЕ</button></section>`
  ];
  gameBody.innerHTML = scenes[theatrePrologueStep];
  if(theatrePrologueStep===0){
    const beginConversation=()=>{const scene=gameBody.querySelector('.theatre-victor');if(!scene||scene.classList.contains('approached'))return;scene.classList.add('approached');victorLater(startVictorDialogue,700)};
    gameBody.querySelector('[data-approach-victor]')?.addEventListener('click',beginConversation);
    gameBody.querySelector('.victor-approach')?.addEventListener('click',beginConversation);
  }
  gameBody.querySelector('[data-prologue-next]')?.addEventListener('click', () => { theatrePrologueStep++; renderTheatrePrologue(); });
  gameBody.querySelector('.manuscript-hotspot')?.addEventListener('click', () => { theatrePrologueStep = 2; renderTheatrePrologue(); });
  gameBody.querySelector('[data-prologue-finish]')?.addEventListener('click', e => {
    e.currentTarget.disabled = true;
    e.currentTarget.textContent = 'ПОДХОЖУ...';
    window.setTimeout(startTheatreStageGame, 450);
  });
  const flashlightScene = gameBody.querySelector('[data-flashlight]');
  if (flashlightScene) {
    const hotspot = flashlightScene.querySelector('.manuscript-hotspot');
    const clues = [...flashlightScene.querySelectorAll('.scene-clue')], thought = flashlightScene.querySelector('.scene-thought');
    let discoveryTimer = 0, inspected = 0;
    const revealHotspot = () => {
      if (!hotspot || inspected < 3 || hotspot.classList.contains('discovered')) return;
      hotspot.classList.add('discovered');
      flashlightScene.querySelector('.prologue-whisper')?.classList.add('discovered');
    };
    clues.forEach(clue => clue.addEventListener('click', () => {
      if (!clue.classList.contains('inspected')) { clue.classList.add('inspected'); inspected++; }
      if (thought) { thought.querySelector('p').textContent = clue.dataset.thought; thought.classList.add('visible'); }
      if (inspected >= 3) flashlightScene.querySelector('.prologue-whisper').textContent = 'Взгляни возле сцены.';
    }));
    thought?.querySelector('button')?.addEventListener('click', () => thought.classList.remove('visible'));
    const moveLight = (x, y) => {
      const r = flashlightScene.getBoundingClientRect(), localX = x-r.left, localY = y-r.top;
      flashlightScene.style.setProperty('--light-x', `${localX}px`);
      flashlightScene.style.setProperty('--light-y', `${localY}px`);
      clues.forEach(clue => {
        const distance = Math.hypot(localX-r.width*+clue.dataset.x, localY-r.height*+clue.dataset.y);
        clue.classList.toggle('illuminated', distance < Math.min(r.width,r.height)*.16);
      });
      if (!hotspot || hotspot.classList.contains('discovered') || inspected < 3) return;
      const distance = Math.hypot(localX-r.width*.5, localY-r.height*.47);
      if (distance < Math.min(r.width,r.height)*.16) {
        if (!discoveryTimer) discoveryTimer = window.setTimeout(revealHotspot, 420);
      } else if (discoveryTimer) {
        clearTimeout(discoveryTimer);
        discoveryTimer = 0;
      }
    };
    flashlightScene.addEventListener('pointermove', e => moveLight(e.clientX, e.clientY));
    flashlightScene.addEventListener('pointerdown', e => moveLight(e.clientX, e.clientY));
  }
}
function clearVictorDialogue(){(window.__victorTimers||[]).forEach(clearTimeout);window.__victorTimers=[]}
function victorLater(fn,delay){const timer=setTimeout(fn,delay);(window.__victorTimers||(window.__victorTimers=[])).push(timer);return timer}
function startVictorDialogue(){
  clearVictorDialogue();
  const conversation=gameBody.querySelector('.victor-conversation'),log=gameBody.querySelector('[data-victor-log]'),choices=gameBody.querySelector('[data-victor-choices]');if(!conversation||!log||!choices)return;
  const detective=localStorage.getItem('detectiveName')||'Detective',detectiveAvatar=avatarSrc(),state={victorKnown:false};
  const showChoices=options=>{choices.innerHTML='';options.forEach(option=>{const button=document.createElement('button');button.type='button';button.className='detective-choice';button.innerHTML=`<img src="${detectiveAvatar}" alt=""><span></span>`;button.querySelector('span').textContent=option.text;button.addEventListener('click',()=>{choices.innerHTML='';option.run()},{once:true});choices.append(button)})};
  const typeVictor=(text,next,delay=0,revealName=false)=>victorLater(()=>{conversation.classList.add('visible');log.replaceChildren();choices.replaceChildren();const bubble=document.createElement('div'),label=document.createElement('small'),line=document.createElement('span');bubble.className='victor-bubble victor';label.textContent=state.victorKnown?'VICTOR HALE':'STRANGER';bubble.append(label,line);log.append(bubble);let i=0;const type=()=>{if(!bubble.isConnected)return;line.textContent=text.slice(0,++i);if(i<text.length)victorLater(type,28);else{if(revealName){state.victorKnown=true;label.textContent='VICTOR HALE'}if(next){const continueButton=document.createElement('button');continueButton.type='button';continueButton.className='dialogue-continue';continueButton.textContent='ПРОДОЛЖИТЬ';continueButton.addEventListener('click',()=>{choices.replaceChildren();next()},{once:true});choices.append(continueButton)}}};type()},delay);
  const finalExchange=()=>typeVictor('Tomorrow is opening night. By morning, the theatre will be full of people again.',()=>showChoices([
    {text:'Why not wait until morning?',run:()=>typeVictor('Because any trace left tonight may disappear. I would rather know the facts first.',finish)},
    {text:'Why did you not call the police?',run:()=>typeVictor('There is no broken lock and no clear suspect. They would stop the rehearsal and question everyone.',finish)}
  ]));
  const finish=()=>typeVictor('The doors are open. Look around and tell me what you notice.',()=>{choices.replaceChildren();const scene=gameBody.querySelector('.theatre-victor');scene.classList.add('entry-ready');const enter=document.createElement('button');enter.type='button';enter.className='victor-theatre-door';enter.setAttribute('aria-label','Войти через двери театра');enter.innerHTML='<i aria-hidden="true"></i>';enter.addEventListener('click',()=>{theatrePrologueStep=1;renderTheatrePrologue()},{once:true});scene.append(enter)});
  const manuscriptExchange=()=>typeVictor('The page was in a locked case near the stage. After the blackout, the page was gone and a new copy was inside.',()=>showChoices([
    {text:'Who knew about the locked case?',run:()=>typeVictor('Evelyn Shaw worked with the costumes. Daniel Crow controlled the lights. Both were near the stage. I told very few people, but theatres have few secrets.',finalExchange)},
    {text:'Was anything else stolen?',run:()=>typeVictor('Nothing obvious. Whoever opened the case closed it again and left the copy in the same place.',finalExchange)}
  ]));
  typeVictor('Good evening. You are the detective, I hope.',()=>showChoices([
    {text:'Good evening. Did you call me here?',run:()=>typeVictor('Yes. I am Victor Hale, the theatre director. A page from the original theatre script is missing.',manuscriptExchange,0,true)},
    {text:'Good evening. I was told you needed a detective.',run:()=>typeVictor('I do. I am Victor Hale, the theatre director. Someone took a page from the original theatre script tonight.',manuscriptExchange,0,true)}
  ]),700);
}
document.addEventListener('click', e => { if (e.target.closest('[data-open]')) modal.querySelector('.game')?.classList.remove('theatre-prologue-modal'); });

const spotlightRounds=[
  {target:'blueDress',text:'Find the mannequin wearing a blue dress, a silver mask and no gloves.'},
  {target:'tanHat',text:'Find the mannequin wearing a tan coat, brown gloves and a black top hat.'},
  {target:'blackIvory',text:'Find the mannequin wearing a black coat and an ivory scarf, but no hat.'},
  {target:'redShort',text:'Find the mannequin wearing a short red jacket, black gloves and carrying a black case.'},
  {target:'blueCase',text:'Find the mannequin wearing a long blue coat, black gloves and carrying a black case.'},
  {target:'redTarget',text:'Find the mannequin wearing a long red coat, black gloves, no hat and carrying a black case.'}
];
const spotlightActors={
  redTarget:{src:'assets/case-002/mannequin-red-target.png',alt:'Манекен в красном пальто, чёрных перчатках и с футляром',wrong:''},
  redBare:{src:'assets/case-002/mannequin-red-bare.png',alt:'Манекен в красном пальто без перчаток',wrong:'The coat is red, but the mannequin is not wearing gloves.'},
  redHat:{src:'assets/case-002/mannequin-red-hat.png',alt:'Манекен в красном пальто и цилиндре',wrong:'The coat and gloves match, but the mannequin is wearing a hat.'},
  blueCase:{src:'assets/case-002/mannequin-blue-case.png',alt:'Манекен в синем пальто с футляром',wrong:'The gloves and case match, but the coat is blue.'},
  blackRedScarf:{src:'assets/case-002/mannequin-black-red-scarf.png',alt:'Манекен в чёрном пальто и красном шарфе',wrong:'The gloves and case match, but the coat is black.'},
  blackIvory:{src:'assets/case-002/mannequin-black-ivory.png',alt:'Манекен в чёрном пальто и светлом шарфе',wrong:'This mannequin is wearing a black coat.'},
  blueDress:{src:'assets/case-002/mannequin-blue-dress.png',alt:'Манекен в синем платье',wrong:'This mannequin is wearing a blue dress, not a coat.'},
  blackDress:{src:'assets/case-002/mannequin-black-dress.png',alt:'Манекен в чёрном платье',wrong:'This mannequin is wearing a dress, not a red coat.'}
  ,greenCase:{src:'assets/case-002/mannequin-green-case.png',alt:'Манекен в зелёном пальто с футляром',wrong:'The gloves and case match, but the coat is green.'}
  ,tanHat:{src:'assets/case-002/mannequin-tan-hat.png',alt:'Манекен в светло-коричневом пальто и цилиндре',wrong:'This mannequin is wearing a tan coat and a hat.'}
  ,redShort:{src:'assets/case-002/mannequin-red-short.png',alt:'Манекен в коротком красном пиджаке',wrong:'The colour matches, but this is a short jacket, not a long coat.'}
  ,redWhiteGloves:{src:'assets/case-002/mannequin-red-white-gloves.png',alt:'Манекен в красном пальто и светлых перчатках',wrong:'The coat and case match, but the gloves are not black.'}
};
let spotlightRound=0,spotlightCleanup=()=>{};
function startTheatreStageGame(){spotlightRound=0;renderWardrobeIntro()}
function renderWardrobeIntro(){
  gameBody.innerHTML=`<section class="wardrobe-intro"><div><small>КОСТЮМНЫЙ МЕХАНИЗМ</small><h2>Найди костюмы со страницы</h2><p>Механизм подаёт манекены по одному.</p><blockquote>Сверяй каждый костюм с английским описанием из пьесы.</blockquote><button type="button" data-start-hunt>НАЧАТЬ ПОИСК</button></div></section>`;
  gameBody.querySelector('[data-start-hunt]').addEventListener('click',renderHuntCountdown);
}
function renderHuntCountdown(){
  spotlightCleanup();
  gameBody.innerHTML=`<section class="hunt-countdown"><div class="countdown-light"><span>3</span></div></section>`;
  const number=gameBody.querySelector('.countdown-light span'),values=['3','2','1'];let index=0,cancelled=false,timer;
  const next=()=>{if(cancelled)return;if(index>=values.length){renderSpotlightRound();return}number.textContent=values[index++];number.classList.remove('strike');void number.offsetWidth;number.classList.add('strike');timer=setTimeout(next,900)};
  next();
  spotlightCleanup=()=>{cancelled=true;clearTimeout(timer)};
}
function renderSpotlightRound(){
  spotlightCleanup();
  const round=spotlightRounds[spotlightRound];
  if(!round){renderSpotlightDiscovery();return}
  const ids=Object.keys(spotlightActors),cast=ids.map(id=>`<button class="hunt-actor actor-${id}" data-actor="${id}" type="button" tabindex="-1"><img src="${spotlightActors[id].src}" alt="${spotlightActors[id].alt}"></button>`).join('');
  gameBody.innerHTML=`<section class="spotlight-hunt"><header class="hunt-brief"><h2>${round.text}</h2></header><div class="hunt-stage" data-hunt-stage>${cast}<div class="hunt-darkness"></div><div class="hunt-beam"></div><div class="hunt-feedback" aria-live="polite"></div></div></section>`;
  const stage=gameBody.querySelector('[data-hunt-stage]'),actors=[...stage.querySelectorAll('.hunt-actor')],feedback=stage.querySelector('.hunt-feedback');
  let lightX=stage.clientWidth*.5,lightY=stage.clientHeight*.55,last=performance.now(),finished=false,lightActive=false,motionElapsed=0,currentCycle=-1,currentActor=null,recent=[],passesSinceTarget=0,targetGap=2+Math.floor(Math.random()*3),pausedUntil=0;
  const chooseActor=()=>{let id;if(passesSinceTarget>=targetGap){id=round.target;passesSinceTarget=0;targetGap=3+Math.floor(Math.random()*3)}else{const small='redShort',base=ids.filter(candidate=>candidate!==round.target&&!recent.includes(candidate)&&candidate!==small),pool=Math.random()<.12?[...base,small]:base;id=pool[Math.floor(Math.random()*pool.length)]||ids.find(candidate=>candidate!==round.target);passesSinceTarget++}recent=[id,...recent].slice(0,3);return actors.find(actor=>actor.dataset.actor===id)};
  const moveLight=(clientX,clientY)=>{const r=stage.getBoundingClientRect();lightX=Math.max(0,Math.min(r.width,clientX-r.left));lightY=Math.max(0,Math.min(r.height,clientY-r.top));stage.style.setProperty('--hunt-x',`${lightX}px`);stage.style.setProperty('--hunt-y',`${lightY}px`)};
  const updateLight=e=>{lightActive=true;stage.classList.add('light-active');moveLight(e.clientX,e.clientY)};
  stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||lightActive)updateLight(e)});
  stage.addEventListener('pointerdown',e=>{updateLight(e);const s=stage.getBoundingClientRect(),litActor=actors.find(a=>{if(a.style.visibility!=='visible')return false;const r=a.getBoundingClientRect(),cx=r.left-s.left+r.width/2,cy=r.top-s.top+r.height*.46;return Math.hypot(lightX-cx,lightY-cy)<Math.min(185,s.width*.14)});if(!litActor||finished)return;litActor.classList.add('in-light');if(litActor.dataset.actor===round.target){finished=true;litActor.classList.add('caught');feedback.textContent='The costume matches the description.';setTimeout(()=>{if(spotlightRound===spotlightRounds.length-1)renderMannequinSearch();else{spotlightRound++;renderSpotlightRound()}},1450)}else{pausedUntil=performance.now()+2200;feedback.textContent=spotlightActors[litActor.dataset.actor]?.wrong||'This costume does not match the description.';stage.classList.add('wrong-catch');setTimeout(()=>{stage.classList.remove('wrong-catch');feedback.textContent=''},2100)}});
  const tick=now=>{
    if(!stage.isConnected||finished)return;
    const dt=Math.min(40,now-last);last=now;if(now>=pausedUntil)motionElapsed+=dt;const s=stage.getBoundingClientRect(),slotMs=5700,travelMs=5200,cycle=Math.floor(motionElapsed/slotMs),progress=(motionElapsed%slotMs)/travelMs;
    if(cycle!==currentCycle){currentCycle=cycle;currentActor=chooseActor();actors.forEach(actor=>{actor.style.visibility='hidden';actor.classList.remove('in-light')})}
    actors.forEach(actor=>{const visible=actor===currentActor&&progress<=1,x=-s.width*.1+progress*s.width*1.2;actor.style.left=`${x}px`;actor.style.visibility=visible?'visible':'hidden';const r=actor.getBoundingClientRect(),cx=r.left-s.left+r.width/2,cy=r.top-s.top+r.height*.46,lit=visible&&lightActive&&Math.hypot(lightX-cx,lightY-cy)<Math.min(185,s.width*.14);actor.classList.toggle('in-light',lit)});
    requestAnimationFrame(tick)
  };
  requestAnimationFrame(tick);
  spotlightCleanup=()=>{finished=true};
}
function renderMannequinSearch(){
  spotlightCleanup();
  gameBody.innerHTML=`<section class="mannequin-search"><div class="mannequin-search-light"></div><div class="mannequin-search-figure"><img src="assets/case-002/mannequin-red-target.png" alt="Манекен в длинном красном пальто"><button type="button" class="hidden-page-hotspot" data-hidden-page aria-label="Осмотреть край бумаги в подоле"><i></i></button></div><p class="mannequin-search-thought">Из подола выглядывает край бумаги.</p></section>`;
  const scene=gameBody.querySelector('.mannequin-search'),paper=scene.querySelector('[data-hidden-page]'),thought=scene.querySelector('.mannequin-search-thought');
  paper.addEventListener('click',()=>{if(scene.classList.contains('page-found'))return;scene.classList.add('page-found');thought.textContent='В подкладке зашит сложенный лист.';setTimeout(renderSpotlightDiscovery,1150)});
}
function renderSpotlightDiscovery(){
  spotlightCleanup();
  gameBody.innerHTML=`<section class="spotlight-result theatre-page-result">${theatrePageMarkup('ПОЛОЖИТЬ В МАТЕРИАЛЫ ДЕЛА')}</section>`;
  gameBody.querySelector('[data-theatre-page-action]').addEventListener('click',()=>{localStorage.setItem('theatrePageEvidence','yes');renderTheatreEvidence();closeGame(false);setTimeout(()=>theatreCase?.querySelector('.theatre-materials')?.scrollIntoView({behavior:'smooth',block:'center'}),100)});
}
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))spotlightCleanup()});
