(function () {
  const evidence = [
    { owner: 2, name: 'Torn train ticket', desc: 'Leo found it by the side door. It shows that Alex planned to leave after seven.', pos: '0% 0%' },
    { owner: 0, name: 'Wet umbrella', desc: 'Anna found it inside the library after Alex disappeared.', pos: '100% 0%' },
    { owner: 0, name: 'Library card', desc: 'Anna’s record shows that Alex used it at 6:20 p.m.', pos: '0% 100%' },
    { owner: 0, name: 'Dark-red lipstick', desc: 'Anna keeps it in her handbag and wore it at the school concert.', sheet: 'assets/evidence-items-anna.png', pos: '0% 0%' },
    { owner: 0, name: 'Reading glasses', desc: 'She uses them when she checks names and times in library records.', sheet: 'assets/evidence-items-anna.png', pos: '100% 0%' },
    { owner: 0, name: 'Fountain pen', desc: 'Anna uses it to write short notes in the library log.', sheet: 'assets/evidence-items-anna.png', pos: '0% 100%' },
    { owner: 0, name: 'Flower bookmark', desc: 'Alex gave it to Anna last spring.', sheet: 'assets/evidence-items-anna.png', pos: '100% 100%' },
    { owner: 1, name: 'Key number 17', desc: 'It was issued to Mark and opens the old archive room in the science wing.', pos: '100% 100%' },
    { owner: 1, name: 'Café receipt', desc: 'It belongs to Mark and records a purchase across town at 6:10 p.m.', receipt: true },
    { owner: 1, name: 'Work gloves', desc: 'There is fresh grey dust from the old science wing on them.', sheet: 'assets/evidence-items-mark.png', pos: '0% 0%' },
    { owner: 1, name: 'Pocket watch', desc: 'Mark carries it every day, but tonight it stopped at 6:05.', sheet: 'assets/evidence-items-mark.png', pos: '100% 0%' },
    { owner: 1, name: 'Screwdriver', desc: 'It belongs to the caretaker’s toolbox and has a worn wooden handle.', sheet: 'assets/evidence-items-mark.png', pos: '0% 100%' },
    { owner: 1, name: 'Matchbox', desc: 'The guard found it in the pocket of Mark’s work jacket.', sheet: 'assets/evidence-items-mark.png', pos: '100% 100%' },
    { owner: 2, name: 'Metal flashlight', desc: 'Leo used it to inspect the dark east corridor.', sheet: 'assets/evidence-items-leo.png', pos: '0% 0%' },
    { owner: 2, name: 'Small thermos', desc: 'It contains the strong black coffee Leo drinks on night duty.', sheet: 'assets/evidence-items-leo.png', pos: '100% 0%' },
    { owner: 2, name: 'Pocket notebook', desc: 'Leo writes door checks and unusual noises in it.', sheet: 'assets/evidence-items-leo.png', pos: '0% 100%' },
    { owner: 2, name: 'Old photograph', desc: 'A family photograph that Leo keeps beside the guard’s desk.', sheet: 'assets/evidence-items-leo.png', pos: '100% 100%' }
  ];

  const witnesses = [
    {
      name: 'Anna Reed', role: 'LIBRARIAN', image: 'assets/evidence-witness-anna.png',
      full: 'I scanned his library card at 6:20. He asked for a book about the old science wing.'
    },
    {
      name: 'Mark Bell', role: 'CARETAKER', image: 'assets/evidence-witness-mark.png',
      full: 'I was at the school from six o’clock and never left. I did not go near the old archive room.'
    },
    {
      name: 'Leo Grant', role: 'SECURITY GUARD', image: 'assets/evidence-witness-leo.png',
      full: 'At 6:37, I heard the side door open. Then I saw Mark walk toward the old science wing.'
    }
  ];

  const testimonyTasks = [
    { witness: 0, text: 'I ____ his library card at 6:20.', answer: 'scanned', words: ['scanned', 'heard', 'opened', 'left'] },
    { witness: 0, text: 'He ____ for a book about the old science wing.', answer: 'asked', words: ['asked', 'took', 'gave', 'found'] },
    { witness: 1, text: 'I was at the school from six o’clock and never ____.', answer: 'left', words: ['left', 'went', 'came', 'stayed'] },
    { witness: 1, text: 'I did not ____ near the old archive room.', answer: 'go', words: ['go', 'went', 'gone', 'going'] },
    { witness: 2, text: 'At 6:37, I ____ the side door open.', answer: 'heard', words: ['heard', 'saw', 'took', 'wrote'] },
    { witness: 2, text: 'Then I ____ Mark walk toward the old science wing.', answer: 'saw', words: ['saw', 'heard', 'left', 'found'] }
  ];

  const dossierNotes = [
    { title: 'Анна Рид', role: 'Библиотекарь' },
    { title: 'Марк Белл', role: 'Завхоз' },
    { title: 'Лео Грант', role: 'Охранник' }
  ];

  let host, closeFn, s;
  const shuffle = a => [...a].sort(() => Math.random() - .5);
  const esc = value => { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; };

  function start(el, onClose) {
    host = el;
    closeFn = onClose;
    s = { stage: 0, dossier: null, selectedEvidence: null, selectedDescription: null, matched: new Set(), statement: 0, chosenWord: '', deductionStep: 0, deductionUnlocked: 0, clueSelection: new Set(), feedback: '', kind: '' };
    render();
  }

  function header() {
    const titles = ['ГЛАВА 3 · ФИНАЛ РАССЛЕДОВАНИЯ', 'ГЛАВА 3 · ДОСЬЕ', 'ГЛАВА 3 · ПОКАЗАНИЯ', 'ГЛАВА 3 · ВЫВОД', 'ДЕЛО ЗАВЕРШЕНО'];
    const activePerson = s.stage === 1 && s.dossier !== null ? witnesses[s.dossier] : null;
    const stageLabel = activePerson ? `<span class="er-active-witness"><img src="${activePerson.image}" alt=""><b>ГЛАВА 3 · ДОСЬЕ</b><em>${esc(activePerson.name)}</em></span>` : `<span>${titles[s.stage]}</span>`;
    return `<header class="er-head"><div><b>THE EVIDENCE ROOM</b><small>CASE No. 001 · ALEX CARTER</small></div>${stageLabel}</header>`;
  }

  function render() {
    const body = s.stage === 0 ? intro() : s.stage === 1 ? matchStage() : s.stage === 2 ? statementStage() : s.stage === 3 ? liarStage() : complete();
    host.innerHTML = `<div class="evidence-game">${header()}${body}</div>`;
    host.onclick = click;
  }

  function intro() {
    return `<main class="er-intro"><div><p>CASE No. 001 · ALEX CARTER</p><h2>Алекс не добрался до вокзала</h2><span>Улики из школьного архива привели обратно в школу. Здесь оставались три человека: библиотекарь Анна Рид, завхоз Марк Белл и охранник Лео Грант. Каждый рассказал свою версию вечера — но одна противоречит найденным предметам.</span><div class="case-task"><b>Твоя задача</b><span>Изучи материалы, восстанови показания свидетелей и найди противоречие.</span></div><button data-action="begin">ОТКРЫТЬ ДОСЬЕ СВИДЕТЕЛЕЙ</button></div></main>`;
  }

  function matchStage() {
    if (s.dossier === null) return dossierDesk();
    const person = witnesses[s.dossier];
    const phoneMessage = window.SignalIntercept?.getEvidence?.()[s.dossier];
    const items = evidence.map((item, index) => ({ ...item, index })).filter(item => item.owner === s.dossier);
    const done = items.every(item => s.matched.has(item.index));
    return `<main class="er-stage er-match er-dossier-open"><div class="dossier-content"><div class="dossier-toolbar"><button class="dossier-back" data-action="back-dossiers">← ВСЕ СВИДЕТЕЛИ</button><span>Сопоставлено: <b>${items.filter(item => s.matched.has(item.index)).length} / ${items.length}</b></span></div><section class="er-copy"><h3>Материалы свидетеля</h3><span>Сопоставь предметы, сообщение из телефона Алекса и последующее показание.</span></section>${phoneMessage?.found?`<article class="phone-record"><img src="${phoneMessage.image}" alt="${esc(person.name)}"><div><small>СООБЩЕНИЕ ИЗ ТЕЛЕФОНА АЛЕКСА</small><q>${esc(phoneMessage.text)}</q><b>${esc(phoneMessage.note)}</b></div></article>`:'<article class="phone-record missing"><div><small>СООБЩЕНИЕ ИЗ ТЕЛЕФОНА АЛЕКСА</small><b>Голосовое ещё не восстановлено</b></div></article>'}<div class="dossier-workspace"><div class="evidence-grid dossier-evidence">${items.map(item => `<button class="evidence-card ${s.selectedEvidence === item.index ? 'selected' : ''} ${s.matched.has(item.index) ? 'matched' : ''}" data-evidence="${item.index}"><i class="${item.receipt ? 'receipt' : ''}" style="${itemStyle(item)}"></i><b>${esc(item.name)}</b></button>`).join('')}</div><div class="description-list dossier-descriptions">${descriptionsFor(s.dossier).map(item => `<button data-description="${item.index}" class="${s.selectedDescription === item.index ? 'selected' : ''} ${s.matched.has(item.index) ? 'matched' : ''}">${esc(item.desc)}</button>`).join('')}</div></div>${done ? '<button class="er-confirm" data-action="back-dossiers">ДОСЬЕ ИЗУЧЕНО</button>' : ''}${feedback()}</div></main>`;
  }

  function itemStyle(item) {
    return `${item.sheet ? `background-image:url('${item.sheet}');background-size:200% 200%;` : ''}${item.pos ? `background-position:${item.pos};` : ''}`;
  }

  function dossierDesk() {
    const allDone = witnesses.every((_, i) => dossierDone(i));
    return `<main class="er-stage er-dossier-desk"><section class="er-copy"><h2>Кого изучить первым?</h2></section><div class="dossier-grid">${witnesses.map((person, i) => `<button class="dossier-person ${dossierDone(i) ? 'reviewed' : ''}" data-dossier="${i}"><img src="${person.image}" alt="${esc(person.name)}"><span><small>${person.role}</small><b>${esc(person.name)}</b><em>${esc(dossierNotes[i].role)}</em>${dossierDone(i) ? '<i>✓</i>' : ''}</span></button>`).join('')}</div><p class="dossier-progress">Изучено досье: ${witnesses.filter((_, i) => dossierDone(i)).length} / 3</p>${allDone ? '<button class="er-confirm" data-action="to-statements">ПЕРЕЙТИ К ПОКАЗАНИЯМ</button>' : ''}${feedback()}</main>`;
  }

  function dossierDone(owner) { return evidence.filter(item => item.owner === owner).every(item => s.matched.has(evidence.indexOf(item))); }

  function descriptionsFor(owner) {
    if (!s.descriptionOrder) s.descriptionOrder = {};
    if (!s.descriptionOrder[owner]) s.descriptionOrder[owner] = shuffle(evidence.map((item, index) => ({ ...item, index })).filter(item => item.owner === owner));
    return s.descriptionOrder[owner];
  }

  function statementStage() {
    const task = testimonyTasks[s.statement], witness = witnesses[task.witness];
    return `<main class="er-stage er-statement"><section class="er-copy"><h2>Показания свидетелей</h2><span>Восстанови связную версию событий. Следи за временем, местом и формами глаголов.</span></section><div class="witness-record"><img src="${witness.image}" alt="${esc(witness.name)}"><div class="witness-file"><small>${witness.role} · ФРАЗА ${s.statement + 1} / ${testimonyTasks.length}</small><h3>${esc(witness.name)}</h3><p>${esc(task.text).replace('____', `<mark>${s.chosenWord || '____'}</mark>`)}</p></div></div><div class="word-pieces">${wordOrder(task).map(word => `<button data-word="${word}" class="${s.chosenWord === word ? 'selected' : ''}">${word}</button>`).join('')}</div><button class="er-confirm" data-action="check-word">ПРОВЕРИТЬ ПОКАЗАНИЕ</button>${feedback()}</main>`;
  }

  function wordOrder(witness) {
    if (!s.wordOrder || s.wordOrderTask !== s.statement) { s.wordOrder = shuffle(witness.words); s.wordOrderTask = s.statement; }
    return s.wordOrder;
  }

  function liarStage() {
    return `<main class="er-stage er-liar"><div class="deduction-progress"><i class="done">1</i><span></span><i class="${s.deductionUnlocked > 0 ? 'done' : ''}">2</i><span></span><i class="${s.deductionUnlocked > 1 ? 'done' : ''}">3</i></div>${deductionContent()}${deductionNavigation()}${feedback()}</main>`;
  }

  function deductionNavigation() {
    const back = s.deductionStep > 0 ? '<button data-action="deduction-back">НАЗАД</button>' : '';
    const next = s.deductionStep < s.deductionUnlocked ? '<button data-action="deduction-next">ДАЛЕЕ</button>' : '';
    return back || next ? `<nav class="deduction-navigation">${back}${next}</nav>` : '';
  }

  function deductionContent() {
    if (s.deductionStep === 0) return `<div class="deduction-panel"><h3>Whose statement contradicts the evidence?</h3><p>Сравни показания с найденными предметами и выбери того, чья версия не выдерживает проверки.</p><div class="suspect-grid">${witnesses.map((witness, i) => `<button class="suspect-card" data-suspect="${i}"><img src="${witness.image}" alt="${esc(witness.name)}"><span><small>${witness.role}</small><b>${esc(witness.name)}</b><q>${esc(witness.full)}</q></span></button>`).join('')}</div></div>`;
    if (s.deductionStep === 1) {
      const clues = [
        ['receipt', 'Café receipt', 'It proves that Mark left the school.'],
        ['key', 'Key number 17', 'It gives Mark access to the old archive room.'],
        ['gloves', 'Dusty work gloves', 'Their dust came from the old science wing.'],
        ['lipstick', 'Dark-red lipstick', 'It belongs to Anna.']
      ];
      return `<div class="deduction-panel"><h3>Which two objects connect Mark to the archive?</h3><p>Выбери две улики, которые связывают Марка со старой архивной комнатой.</p><div class="clue-options">${clues.map(clue => `<button data-clue="${clue[0]}" class="${s.clueSelection.has(clue[0]) ? 'selected' : ''}"><b>${clue[1]}</b><span>${clue[2]}</span></button>`).join('')}</div><button class="er-confirm" data-action="check-clues">ПРОВЕРИТЬ УЛИКИ</button></div>`;
    }
    return `<div class="deduction-panel"><h3>Where should the detective search?</h3><p>Укажи место, к которому одновременно ведут ключ №17, пыль со старого крыла и маршрут Алекса.</p><div class="place-options"><button data-place="library">In the library</button><button data-place="archive">In the old archive room</button><button data-place="station">At the railway station</button></div></div>`;
  }

  function feedback() { return `<p class="er-feedback ${s.kind}">${esc(s.feedback)}</p>`; }

  function click(event) {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.evidence !== undefined) {
      const index = +button.dataset.evidence;
      if (s.matched.has(index)) return;
      if (s.selectedDescription !== null) { matchPair(index, s.selectedDescription); return; }
      s.selectedEvidence = s.selectedEvidence === index ? null : index;
      s.feedback = '';
      render(); return;
    }
    if (button.dataset.description !== undefined) {
      const index = +button.dataset.description;
      if (s.matched.has(index)) return;
      if (s.selectedEvidence !== null) { matchPair(s.selectedEvidence, index); return; }
      s.selectedDescription = s.selectedDescription === index ? null : index;
      s.feedback = '';
      render(); return;
    }
    if (button.dataset.dossier !== undefined) { s.dossier = +button.dataset.dossier; clearPairSelection(); s.feedback = ''; render(); return; }
    if (button.dataset.word !== undefined) { s.chosenWord = s.chosenWord === button.dataset.word ? '' : button.dataset.word; s.feedback = ''; render(); return; }
    if (button.dataset.suspect !== undefined) { checkLiar(+button.dataset.suspect); return; }
    if (button.dataset.clue !== undefined) { const clue = button.dataset.clue; s.clueSelection.has(clue) ? s.clueSelection.delete(clue) : s.clueSelection.add(clue); s.feedback = ''; render(); return; }
    if (button.dataset.place !== undefined) { checkPlace(button.dataset.place); return; }
    const action = button.dataset.action;
    if (action === 'begin') { s.stage = 1; render(); }
    else if (action === 'back-dossiers') { s.dossier = null; clearPairSelection(); s.feedback = ''; render(); }
    else if (action === 'to-statements') { s.stage = 2; s.feedback = ''; render(); }
    else if (action === 'check-word') checkWord();
    else if (action === 'check-clues') checkClues();
    else if (action === 'deduction-back') { s.deductionStep = Math.max(0, s.deductionStep - 1); s.feedback = ''; render(); }
    else if (action === 'deduction-next') { s.deductionStep = Math.min(s.deductionUnlocked, s.deductionStep + 1); s.feedback = ''; render(); }
    else if (action === 'restart') start(host, closeFn);
    else if (action === 'close') closeFn();
  }

  function clearPairSelection() { s.selectedEvidence = null; s.selectedDescription = null; }

  function matchPair(evidenceIndex, descriptionIndex) {
    if (s.matched.has(evidenceIndex) || s.matched.has(descriptionIndex)) return;
    if (evidenceIndex === descriptionIndex) {
      s.matched.add(evidenceIndex); clearPairSelection();
      s.feedback = '';
      s.kind = '';
      render();
    } else {
      clearPairSelection();
      message('Это не одна пара. Прочитай описание ещё раз и попробуй другое сочетание.', 'bad');
    }
  }

  function checkWord() {
    const task = testimonyTasks[s.statement];
    if (!s.chosenWord) { message('Сначала выбери слово.', 'bad'); return; }
    if (s.chosenWord === task.answer) {
      message('Показание восстановлено.', 'good');
      setTimeout(() => { s.statement++; s.chosenWord = ''; s.feedback = ''; if (s.statement >= testimonyTasks.length) s.stage = 3; render(); }, 550);
    } else message('Слово не подходит к этой фразе. Выбери другое.', 'bad');
  }

  function checkLiar(index) {
    if (index !== 1) {
      const hints = index === 0 ? 'Запись библиотеки подтверждает слова Анны: карточку использовали в 6:20.' : 'Время открытия двери совпадает с показанием Лео: 6:37.';
      message(hints, 'bad'); return;
    }
    s.deductionUnlocked = Math.max(s.deductionUnlocked, 1); s.deductionStep = 1; s.feedback = ''; render();
  }

  function checkClues() {
    if (s.clueSelection.size !== 2) { message('Выбери ровно две улики.', 'bad'); return; }
    if (s.clueSelection.has('key') && s.clueSelection.has('gloves')) {
      s.deductionUnlocked = Math.max(s.deductionUnlocked, 2); s.deductionStep = 2; s.feedback = ''; render();
    } else message('Эти предметы не доказывают, что Марк был у старой архивной комнаты.', 'bad');
  }

  function checkPlace(place) {
    if (place !== 'archive') { message('Улики ведут в другое место. Вспомни ключ №17 и пыль на перчатках.', 'bad'); return; }
    s.stage = 4;
    localStorage.setItem('evidenceRoomComplete', 'yes');
    window.dispatchEvent(new Event('evidence-room-complete'));
    render();
  }

  function message(text, kind) { s.feedback = text; s.kind = kind; render(); }

  function complete() {
    const name = (localStorage.getItem('detectiveName') || '').trim();
    return `<main class="er-complete"><strong>ДЕЛО ЗАВЕРШЕНО</strong><h2>Алекс найден,<br>${name ? `детектив ${esc(name)}` : 'детектив'}!</h2><span><b>Mark lied about his movements.</b><br>The receipt exposed the lie. Key number 17 and the dusty gloves led to the old archive room.</span><p class="er-conclusion">Алекса нашли в запертой архивной комнате. Билет оказался ложным следом: он собирался уехать, но встреча у комнаты 17 изменила его планы.</p><div><button data-action="restart">ПРОЙТИ ЕЩЁ РАЗ</button><button data-action="close">ВЕРНУТЬСЯ К ДЕЛАМ</button></div></main>`;
  }

  window.EvidenceRoom = { start };
})();
