'use strict';
/* ===== 1. CONFIG ===== */
const KEY = 'ielts-pro-studio:v1';
// Put a lawfully usable audio URL here to enable the listening player. Empty = audio unavailable.
const AUDIO_SRC = '';
const ROUTES = ['Dashboard','Listening','Reading','Writing','Speaking','Vocabulary','Grammar','Mock Test','Progress','Settings'];
const INTERVALS = [1, 2, 4, 8, 16];

/* ===== 2. ORIGINAL CONTENT ===== */
const TFNG = ['True','False','Not Given'];
const READING = {
  title: 'Urban beekeeping (Academic, short practice set)',
  passage: [
    'Over the past decade, several cities have encouraged residents to keep bees on rooftops and in community gardens. Supporters argue that urban hives help pollination in parks and allotments, while giving people a closer connection to food production. Critics worry that too many managed colonies may compete with wild pollinators for limited flowers.',
    'A recent survey of one city\'s hives found that the honey had a more varied flavour than rural honey, probably because gardens contain many different plants. However, the survey did not count wild bees, so its authors avoided drawing conclusions about competition.'],
  items: [
    {t:'tfng', q:'Supporters say urban hives can help pollination in parks.', a:'True', why:'Paragraph 1 gives this as the supporters\' argument.'},
    {t:'tfng', q:'The survey found urban honey tastes better than rural honey.', a:'Not Given', why:'The text says "more varied", not "better". Taste preference is never mentioned.'},
    {t:'tfng', q:'The survey counted wild bees.', a:'False', why:'Paragraph 2 says the survey did not count wild bees, which contradicts the statement.'},
    {t:'mcq', q:'Why was urban honey more varied?', o:['Gardens contain many plants','Cities have more bees','Rural hives are smaller'], a:'Gardens contain many plants', why:'The text links variety to the range of plants in gardens.'},
    {t:'text', q:'Critics fear colonies may compete for limited ______.', a:'flowers', why:'Paragraph 1: competition with wild pollinators for limited flowers.'}]
};
const GRAMMAR = [
  {t:'mcq', q:'If I ___ more time, I would travel more.', o:['have','had','will have'], a:'had', why:'Second conditional (unreal present) uses past simple in the if-clause.'},
  {t:'mcq', q:'Each of the students ___ a laptop.', o:['have','has','are having'], a:'has', why:'"Each" takes a singular verb.'},
  {t:'mcq', q:'She is interested ___ architecture.', o:['at','in','on'], a:'in', why:'The fixed collocation is "interested in".'},
  {t:'mcq', q:'The report ___ yesterday by the committee.', o:['was published','published','is publishing'], a:'was published', why:'Past passive: was + past participle.'},
  {t:'mcq', q:'She gave me ___ useful advice.', o:['an','a','some'], a:'some', why:'"Advice" is uncountable, so it cannot take a/an.'},
  {t:'text', q:'I have lived here ___ 2019. (one word)', a:'since', why:'"Since" marks a starting point with present perfect.'}];
const LISTENING_SIM = {
  script: 'Receptionist: Welcome to Harbour Language Centre. Evening classes start on Monday the ninth, at six thirty. The course fee is two hundred and forty pounds. Please bring photo identification.',
  items: [
    {t:'text', q:'Classes start on Monday the ______.', a:'ninth', why:'Stated in the second sentence.'},
    {t:'text', q:'The course fee in pounds is ______.', a:'240', why:'"Two hundred and forty" = 240.'},
    {t:'mcq', q:'Students must bring:', o:['Photo identification','A laptop','Payment receipt'], a:'Photo identification', why:'Final sentence.'}]
};
const VOCAB = [
 ['mitigate','to make something less severe','Planting trees can mitigate urban heat.','verb','Environment'],
 ['sustainable','able to continue without long-term damage','Sustainable farming protects soil.','adj','Environment'],
 ['urbanisation','growth of towns and cities','Rapid urbanisation increased housing demand.','noun','Society'],
 ['inevitable','certain to happen','Some delay was inevitable.','adj','General'],
 ['curriculum','subjects taught in a school','The curriculum now includes coding.','noun','Education'],
 ['literacy','ability to read and write','Adult literacy programmes are expanding.','noun','Education'],
 ['hinder','to make progress difficult','Poor transport hinders access to jobs.','verb','Society'],
 ['alleviate','to reduce pain or a problem','Subsidies alleviate poverty.','verb','Society'],
 ['substantial','large in amount or importance','There was a substantial rise in prices.','adj','Work'],
 ['outweigh','to be greater than','The benefits outweigh the costs.','verb','General'],
 ['fluctuate','to change frequently','Prices fluctuate through the year.','verb','Work'],
 ['renewable','naturally replaced over time','Wind is a renewable energy source.','adj','Environment']
].map(([w,m,e,p,t])=>({w,m,e,p,t}));
const S1 = ['Do you work or study?','What do you like about your hometown?','How do you usually spend weekends?','Do you prefer mornings or evenings? Why?'];
const CUE = {topic:'Describe a place where you like to study or read.', pts:['Where it is','How often you go there','What you do there','Why you like it']};
const S3 = ['How have places for studying changed in recent years?','Should schools teach independent learning? Why or why not?'];
const WRITING = {
  t1a:{label:'Academic Task 1',min:150,mins:20,prompt:'The table (describe it in your own data) is not supplied in this version. Practise with any chart you have: summarise main features and make comparisons.',tip:'Overview + key features; do not give opinions.'},
  t1g:{label:'General Task 1 (letter)',min:150,mins:20,prompt:'You recently moved to a new flat and your neighbour\'s music is loud at night. Write a letter to the neighbour. Explain the problem, say how it affects you, and suggest a solution.',tip:'Choose a suitable tone; cover all three bullet points.'},
  t2:{label:'Task 2 (essay)',min:250,mins:40,prompt:'Some people think cities should limit car use to reduce pollution. Others believe this is unfair. Discuss both views and give your opinion.',tip:'Clear position, developed paragraphs, linking, accurate varied grammar.'}
};
const CHECK = ['I answered every part of the task','My position/overview is clear','Each paragraph has one main idea','I used linking words naturally','I checked spelling, articles and verb forms'];

/* ===== 3. STORAGE ===== */
const defaults = () => ({v:1, name:'', target:7, history:[], vocab:{}, drafts:{}, plan:{mins:60}});
function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.v === 1 && Array.isArray(d.history) && d.vocab && typeof d.vocab === 'object' && d.drafts && typeof d.drafts === 'object') return {...defaults(), ...d};
  } catch (e) { /* missing/corrupt/blocked: fall back */ }
  return defaults();
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { toast('Could not save (storage full or blocked). Export your data from Settings.'); return false; }
}

/* ===== 4. STATE ===== */
let state = loadState();
let timers = [], media = null, route = 'Dashboard';

/* ===== 5/6. UI HELPERS ===== */
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v; else e.setAttribute(k, v);
  }
  kids.flat().forEach(c => e.append(c instanceof Node ? c : document.createTextNode(String(c))));
  return e;
}
const $ = s => document.querySelector(s);
const today = () => new Date().toISOString().slice(0, 10);
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove('on'), 3000); }
function announce(msg) { $('#live').textContent = msg; }
function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function countdown(secs, out, done) {
  let left = secs; out.textContent = fmt(left);
  const id = setInterval(() => { left--; out.textContent = fmt(Math.max(left, 0)); if (left <= 0) { clearInterval(id); done && done(); } }, 1000);
  timers.push(id); return id;
}
function cleanup() { timers.forEach(clearInterval); timers = []; if (media) { media.stop(); media = null; } }
function logSession(module, score, total, extra) {
  state.history.push({date: today(), module, score, total, ...extra}); persist();
}
function streak() {
  const days = new Set(state.history.map(x => x.date)); let n = 0; const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function go(r) {
  if (media && !confirm('Leave this activity? Unsaved answers will be lost.')) return;
  cleanup(); route = r; $('#title').textContent = r;
  $('#streak').textContent = 'Streak: ' + streak() + ' day' + (streak() === 1 ? '' : 's');
  document.querySelectorAll('#nav button[data-r]').forEach(b => b.toggleAttribute('aria-current', b.dataset.r === r) || b.removeAttribute('aria-current'));
  document.querySelectorAll('#nav button[data-r]').forEach(b => b.dataset.r === r ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  const m = $('#main'); m.replaceChildren(VIEWS[r]()); m.focus(); window.scrollTo(0, 0);
}

/* ===== Shared quiz engine (Reading, Grammar, Listening text simulation, Mock) ===== */
function quiz(module, title, items, intro) {
  const box = h('div', {}); let submitted = false;
  const form = h('form', {}); const inputs = [];
  items.forEach((it, i) => {
    const q = h('div', {class: 'q'}, h('strong', {}, (i + 1) + '. ' + it.q));
    if (it.t === 'text') {
      const inp = h('input', {type: 'text', 'aria-label': 'Answer ' + (i + 1), autocomplete: 'off'}); q.append(h('div', {}, inp)); inputs.push(() => inp.value);
    } else {
      const opts = it.t === 'tfng' ? TFNG : it.o; const name = module + i;
      opts.forEach(o => { const r = h('input', {type: 'radio', name, value: o}); q.append(h('label', {}, r, ' ' + o)); });
      inputs.push(() => (form.querySelector('input[name="' + name + '"]:checked') || {}).value || '');
    }
    q.append(h('div', {class: 'fb', 'aria-live': 'polite'})); form.append(q);
  });
  const btn = h('button', {class: 'b', type: 'submit'}, 'Submit answers');
  form.addEventListener('submit', e => {
    e.preventDefault(); if (submitted) return;
    const blanks = inputs.filter(g => !g().trim()).length;
    if (blanks && !confirm(blanks + ' question(s) unanswered. Submit anyway?')) return;
    submitted = true; btn.disabled = true; let score = 0;
    items.forEach((it, i) => {
      const ans = inputs[i]().trim().toLowerCase(), ok = ans === it.a.toLowerCase(); if (ok) score++;
      const fb = form.querySelectorAll('.fb')[i];
      fb.append(h('span', {class: ok ? 'ok' : 'bad'}, ok ? 'Correct. ' : (ans ? 'Incorrect. ' : 'Unanswered. ') + 'Answer: ' + it.a + '. '), it.why);
    });
    logSession(module, score, items.length); announce('Score ' + score + ' of ' + items.length);
    box.prepend(h('div', {class: 'card'}, h('h2', {}, 'Raw score: ' + score + ' / ' + items.length),
      h('p', {class: 'mute'}, 'Raw score only. This is not an official IELTS band.')));
    window.scrollTo(0, 0);
  });
  form.append(btn);
  box.append(h('div', {class: 'card'}, h('h2', {}, title), intro || '', form));
  return box;
}

/* ===== VIEWS ===== */
const VIEWS = {
  Dashboard() {
    const w = h('div', {}); const hs = state.history;
    const sel = h('select', {id: 'tb', 'aria-label': 'Target band', onchange: e => { state.target = +e.target.value; persist(); toast('Target saved'); }},
      [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(b => h('option', {value: b, ...(b === state.target ? {selected: ''} : {})}, b)));
    const due = Object.values(state.vocab).filter(v => v.due <= today()).length;
    w.append(h('div', {class: 'card'}, h('h2', {}, 'Welcome' + (state.name ? ', ' + state.name : '')), h('label', {}, 'Target band: ', sel)));
    if (!hs.length) {
      w.append(h('div', {class: 'card'}, h('h3', {}, 'No practice yet'), h('p', {}, 'Complete a reading set to start tracking your progress.'), h('button', {class: 'b', onclick: () => go('Reading')}, 'Start reading practice')));
    } else {
      const mods = ['Listening', 'Reading', 'Grammar', 'Writing', 'Speaking'];
      w.append(h('div', {class: 'grid'}, h('div', {class: 'card'}, h('div', {class: 'stat'}, hs.length), 'Sessions completed'),
        ...mods.map(m => h('div', {class: 'card'}, h('div', {class: 'stat'}, hs.filter(x => x.module === m).length), m + ' sessions'))));
      const sc = hs.filter(x => x.total); const rec = {};
      sc.forEach(x => { (rec[x.module] = rec[x.module] || []).push(x.score / x.total); });
      const weak = Object.entries(rec).map(([m, a]) => [m, a.reduce((s, v) => s + v, 0) / a.length]).sort((a, b) => a[1] - b[1])[0];
      w.append(h('div', {class: 'card'}, h('h3', {}, 'Recommended next'), weak ? 'Your lowest average accuracy is in ' + weak[0] + ' (' + Math.round(weak[1] * 100) + '%). Practise it next.' : 'Try a scored activity to get recommendations.'));
      w.append(h('div', {class: 'card'}, h('h3', {}, 'Recent practice'), ...hs.slice(-5).reverse().map(x => h('div', {}, x.date + ' - ' + x.module + (x.total ? ': ' + x.score + '/' + x.total : '')))));
    }
    w.append(h('div', {class: 'card'}, h('h3', {}, 'Vocabulary due today'), due + ' word(s). ', h('button', {class: 'b alt', onclick: () => go('Vocabulary')}, 'Review words')));
    return w;
  },
  Listening() {
    const w = h('div', {});
    const aud = AUDIO_SRC ? h('audio', {controls: '', src: AUDIO_SRC}) : h('p', {class: 'bad'}, 'Audio unavailable: no recording is configured (AUDIO_SRC in app.js is empty).');
    w.append(h('div', {class: 'card'}, h('h2', {}, 'Listening'), aud));
    w.append(quiz('Listening', 'Text-based listening simulation (NOT a real audio test)', LISTENING_SIM.items,
      h('div', {}, h('p', {class: 'mute'}, 'Read the script, then answer. Results here do not count as a genuine listening test.'), h('p', {class: 'passage'}, LISTENING_SIM.script))));
    return w;
  },
  Reading() {
    return quiz('Reading', READING.title, READING.items, h('div', {class: 'passage'}, READING.passage.map(p => h('p', {}, p))));
  },
  Grammar() { return quiz('Grammar', 'Grammar Lab: mixed practice', GRAMMAR); },
  'Mock Test'() {
    return h('div', {class: 'card'}, h('h2', {}, 'Mock test'), h('p', {}, 'This version includes short practice sets only, not a full-length 2h45 mock. Choose a practice set:'),
      h('button', {class: 'b', onclick: () => $('#main').replaceChildren(quiz('Reading', 'Partial mock: Reading', READING.items, h('div', {class: 'passage'}, READING.passage.map(p => h('p', {}, p)))))}, 'Reading (partial)'),
      h('button', {class: 'b', onclick: () => $('#main').replaceChildren(quiz('Grammar', 'Practice set: Grammar', GRAMMAR))}, 'Grammar set'));
  },
  Writing() {
    const w = h('div', {}); let key = 't2';
    const area = h('textarea', {id: 'wr', 'aria-label': 'Your response'}), cnt = h('p', {class: 'mute', 'aria-live': 'polite'}), tm = h('span', {class: 'timer'}, '--:--');
    const info = h('div', {}), sel = h('select', {'aria-label': 'Task', onchange: e => { key = e.target.value; load(); }},
      Object.entries(WRITING).map(([k, v]) => h('option', {value: k}, v.label)));
    function count() { const n = (area.value.trim().match(/\S+/g) || []).length; const m = WRITING[key].min;
      cnt.textContent = n + ' words. Recommended minimum: ' + m + (n < m ? ' (below minimum; you can still submit)' : ''); return n; }
    function load() { const t = WRITING[key]; info.replaceChildren(h('p', {}, t.prompt), h('p', {class: 'mute'}, 'Planning tip: ' + t.tip));
      area.value = state.drafts[key] || ''; count(); }
    area.addEventListener('input', count);
    const chk = h('div', {class: 'card'}, h('h3', {}, 'Self-assessment (no automatic scoring)'), CHECK.map(c => h('label', {}, h('input', {type: 'checkbox'}), ' ' + c, h('br'))),
      h('p', {class: 'mute'}, 'Criteria: Task Response/Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy. A teacher or validated rater is needed for a real band.'));
    w.append(h('div', {class: 'card'}, h('label', {}, 'Task: ', sel), info, area, cnt,
      h('div', {}, tm, ' '),
      h('button', {class: 'b alt', onclick: () => { timers.forEach(clearInterval); countdown(WRITING[key].mins * 60, tm, () => toast('Time is up')); }}, 'Start timer'),
      h('button', {class: 'b', onclick: () => { state.drafts[key] = area.value; if (persist()) toast('Draft saved'); }}, 'Save draft'),
      h('button', {class: 'b alt', onclick: () => navigator.clipboard ? navigator.clipboard.writeText(area.value).then(() => toast('Copied'), () => toast('Copy failed')) : toast('Copy not supported')}, 'Copy'),
      h('button', {class: 'b alt', onclick: () => { if (confirm('Clear this draft?')) { area.value = ''; delete state.drafts[key]; persist(); count(); } }}, 'Clear'),
      h('button', {class: 'b', onclick: () => { const n = count(); if (!confirm('Submit this response? (' + n + ' words)')) return; logSession('Writing', 0, 0, {words: n, task: key}); toast('Logged. Now complete the checklist below.'); }}, 'Submit')));
    w.append(chk); load(); return w;
  },
  Speaking() {
    const w = h('div', {}); let i = 0;
    const q = h('p', {class: 'stat'}, S1[0]), tm = h('span', {class: 'timer'}, '--:--'), notes = h('textarea', {'aria-label': 'Notes', style: 'min-height:90px'});
    w.append(h('div', {class: 'card'}, h('h2', {}, 'Part 1'), q,
      h('button', {class: 'b', onclick: () => { i = (i + 1) % S1.length; q.textContent = S1[i]; }}, 'Next question')));
    w.append(h('div', {class: 'card'}, h('h2', {}, 'Part 2: cue card'), h('p', {}, CUE.topic), h('ul', {}, CUE.pts.map(p => h('li', {}, p))), notes, tm, ' ',
      h('button', {class: 'b alt', onclick: () => { timers.forEach(clearInterval); countdown(60, tm, () => { toast('Prep over: speak now'); countdown(120, tm, () => toast('Time is up')); }); }}, 'Start 1 min prep, then 2 min talk'),
      h('button', {class: 'b alt', onclick: () => { timers.forEach(clearInterval); tm.textContent = '--:--'; }}, 'Stop timers')));
    w.append(h('div', {class: 'card'}, h('h2', {}, 'Part 3'), h('ul', {}, S3.map(s => h('li', {}, s)))));
    w.append(recorder());
    w.append(h('div', {class: 'card'}, h('button', {class: 'b', onclick: () => { logSession('Speaking', 0, 0); toast('Session logged'); }}, 'Finish session'),
      h('p', {class: 'mute'}, 'Reflect: Did I extend answers? Did I avoid long pauses? Did I use varied vocabulary? No automatic scoring is provided.')));
    return w;
  },
  Vocabulary() {
    const w = h('div', {}), list = h('div', {}); let q = '';
    const search = h('input', {type: 'text', 'aria-label': 'Search words', placeholder: 'Search', oninput: e => { q = e.target.value.toLowerCase(); draw(); }});
    function entry(v) { const s = state.vocab[v.w] || {}; return h('div', {class: 'q'}, h('strong', {}, v.w), ' (' + v.p + ', ' + v.t + ') ' + v.m, h('div', {class: 'mute'}, v.e), 
      h('button', {class: 'b alt', onclick: () => { state.vocab[v.w] = {...s, due: s.due || today(), box: s.box || 0, fav: !s.fav}; persist(); draw(); }}, s.fav ? 'Saved ★' : 'Save word')); }
    function draw() { list.replaceChildren(...VOCAB.filter(v => !q || (v.w + v.t + v.m).toLowerCase().includes(q)).sort((a, b) => a.w.localeCompare(b.w)).map(entry)); }
    const fc = h('div', {class: 'card'});
    function flash() {
      const dueW = VOCAB.filter(v => { const s = state.vocab[v.w]; return !s || s.due <= today(); });
      if (!dueW.length) { fc.replaceChildren(h('h2', {}, 'Flashcards'), 'Nothing due today.'); return; }
      const v = dueW[0], back = h('p', {style: 'display:none'}, v.m + ' / ' + v.e), rate = h('div', {style: 'display:none'},
        [['Hard', 0], ['Good', 1], ['Easy', 2]].map(([l, d]) => h('button', {class: 'b alt', onclick: () => {
          const s = state.vocab[v.w] || {box: 0}; const box = Math.max(0, Math.min(4, (s.box || 0) + d - (d === 0 ? 1 : 0)));
          const dt = new Date(); dt.setDate(dt.getDate() + INTERVALS[box]); state.vocab[v.w] = {...s, box, due: dt.toISOString().slice(0, 10)}; persist(); flash(); } }, l)));
      fc.replaceChildren(h('h2', {}, 'Flashcards (' + dueW.length + ' due)'), h('p', {class: 'stat'}, v.w), back,
        h('button', {class: 'b', onclick: e => { back.style.display = rate.style.display = 'block'; e.target.remove(); }}, 'Reveal meaning'), rate);
    }
    w.append(fc, h('div', {class: 'card'}, h('h2', {}, 'Word list'), search, list)); flash(); draw(); return w;
  },
  Progress() {
    const hs = state.history.filter(x => x.total);
    if (!state.history.length) return h('div', {class: 'card'}, h('h2', {}, 'No data yet'), 'Finish a practice session to see charts.');
    const bars = h('div', {class: 'bars', role: 'img', 'aria-label': 'Accuracy of last scored sessions'}, hs.slice(-12).map(x => h('i', {style: 'height:' + Math.max(4, Math.round(x.score / x.total * 100)) + '%', title: x.module})));
    const words = state.history.filter(x => x.words);
    return h('div', {}, h('div', {class: 'card'}, h('h2', {}, 'Accuracy, last scored sessions'), hs.length ? bars : 'No scored sessions yet.',
      h('p', {class: 'mute'}, 'Quiz accuracy is a practice signal, not an official band.')),
      h('div', {class: 'card'}, h('h3', {}, 'Writing word counts'), words.length ? words.map(x => x.date + ': ' + x.words + ' words').join('; ') : 'None yet.'),
      h('div', {class: 'card'}, h('h3', {}, 'History'), ...state.history.slice().reverse().slice(0, 20).map(x => h('div', {}, x.date + ' - ' + x.module + (x.total ? ' ' + x.score + '/' + x.total : '')))));
  },
  Settings() {
    const name = h('input', {type: 'text', value: state.name, 'aria-label': 'Your name', maxlength: 40, onchange: e => { state.name = e.target.value.trim(); persist(); toast('Saved'); }});
    const imp = h('input', {type: 'file', accept: 'application/json', 'aria-label': 'Import progress file', onchange: e => {
      const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { const d = JSON.parse(r.result); if (d.v !== 1 || !Array.isArray(d.history) || typeof d.vocab !== 'object' || typeof d.drafts !== 'object') throw 0;
        state = {...defaults(), ...d}; persist(); toast('Imported'); go('Dashboard'); } catch (x) { toast('Invalid file: nothing changed'); } };
      r.readAsText(f); }});
    return h('div', {class: 'card'}, h('h2', {}, 'Settings'), h('label', {}, 'Name: ', name), h('p', {class: 'mute'}, 'Data is stored only in this browser. It is not secure, synced or tamper-proof.'),
      h('button', {class: 'b', onclick: () => { const a = h('a', {href: URL.createObjectURL(new Blob([JSON.stringify(state)], {type: 'application/json'})), download: 'ielts-progress.json'}); a.click(); URL.revokeObjectURL(a.href); }}, 'Export progress'),
      h('div', {}, 'Import: ', imp),
      h('button', {class: 'b alt', onclick: () => { if (confirm('Delete ALL progress? This cannot be undone.')) { state = defaults(); persist(); toast('Progress reset'); go('Dashboard'); } }}, 'Reset all progress'));
  }
};

/* ===== 15. RECORDING (local only, user-initiated) ===== */
function recorder() {
  const c = h('div', {class: 'card'}, h('h2', {}, 'Practice recording (stays on this device)')), st = h('p', {class: 'mute', 'aria-live': 'polite'}, 'Not recording.'), out = h('div', {});
  if (!navigator.mediaDevices || !window.MediaRecorder) { c.append('Recording is not supported in this browser. Use the timers and self-review instead.'); return c; }
  const start = h('button', {class: 'b'}, 'Start recording'), stop = h('button', {class: 'b alt', disabled: ''}, 'Stop');
  start.onclick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true}); const chunks = [], rec = new MediaRecorder(stream);
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); media = null; start.disabled = false; stop.disabled = true; st.className = 'mute'; st.textContent = 'Not recording.';
        if (!chunks.length) { out.textContent = 'Recording was empty. Try again.'; return; }
        const url = URL.createObjectURL(new Blob(chunks)); out.replaceChildren(h('audio', {controls: '', src: url}), h('button', {class: 'b alt', onclick: () => { URL.revokeObjectURL(url); out.replaceChildren(); toast('Recording discarded'); }}, 'Discard')); };
      rec.start(); media = rec; start.disabled = true; stop.disabled = false; st.className = 'rec'; st.textContent = '● Recording now';
    } catch (e) { st.textContent = e.name === 'NotAllowedError' ? 'Microphone permission denied. Allow it in browser settings or practise without recording.' : 'Could not start recording.'; }
  };
  stop.onclick = () => media && media.stop();
  c.append(st, start, stop, out); return c;
}

/* ===== 16/17. INIT ===== */
function init() {
  const nav = $('#nav'); nav.append(h('div', {class: 'brand'}, 'IELTS Pro Studio'));
  ROUTES.forEach(r => nav.append(h('button', {'data-r': r, onclick: () => go(r)}, r)));
  window.addEventListener('beforeunload', e => { if (media) { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('error', () => toast('Something went wrong. Reload the page.'));
  go('Dashboard');
}
init();
