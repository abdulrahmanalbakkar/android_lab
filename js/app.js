/* Android Lab core: routing, lesson pages, quizzes, challenges, spaced review, search, glossary.
   To add a topic: create tracks/<id>.js that calls Lab.addTrack({...}) (see tracks/kotlin.js)
   and add one <script> tag for it in index.html. Nothing in this file needs to change. */
const Lab = (() => {
  const tracks = [];
  const DAY = 864e5;
  // ponytail: Leitner boxes, days until the next review per box. Swap for SM-2 if intervals need per-learner tuning.
  const BOX_DAYS = [0, 1, 3, 7, 21, 60];

  function schedule(card, correct, now) {
    const box = correct ? Math.min((card ? card.box : 0) + 1, BOX_DAYS.length - 1) : 1;
    return { box, due: now + BOX_DAYS[box] * DAY };
  }

  // ponytail: progress lives in this browser only. Move to a backend when accounts exist.
  const KEY = 'android-lab:v1';
  let state = { done: {}, cards: {}, level: 'all' };
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) state = { done: s.done || {}, cards: s.cards || {}, level: s.level || 'all' }; } catch (e) { /* storage blocked: run without saving */ } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* same */ } }

  // ---------- tiny DOM helpers, also used by track files ----------
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(2)) if (kid != null && kid !== false) el.append(kid);
    return el;
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function swap(slot, text) {
    const old = slot.firstElementChild;
    if (old) { old.classList.add('fly-out'); setTimeout(() => old.remove(), 400); }
    slot.append(h('span', { class: 'chip drop-in' }, text));
  }

  // ponytail: regex highlighter for short Kotlin snippets. Load Prism if lessons ever need full grammar.
  const TOKEN = /(@\w+)|(\/\/.*)|("(?:[^"\\\n]|\\.)*")|\b(val|var|fun|if|else|when|is|in|return|class|data|sealed|object|interface|null|true|false|this|it|suspend|override|private|for|while|as|by|companion|lateinit|try|catch|throw|const|import|enum|abstract|open|internal|inline|out)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Z]\w*)\b|\b([a-z]\w*)(?=\s*[({])/g;
  const CLS = ['t-f', 't-c', 't-s', 't-k', 't-n', 't-t', 't-f'];
  function hl(src) {
    const esc = String(src).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc.replace(TOKEN, (m, ...g) => `<span class="${CLS[g.slice(0, 7).findIndex(x => x !== undefined)]}">${m}</span>`);
  }
  const code = src => h('pre', { class: 'code' }, h('code', { html: hl(src) }));

  // ---------- data ----------
  const key = (t, l) => `${t.id}.${l.id}`;
  function allCards() {
    const out = [];
    for (const t of tracks) for (const l of t.lessons) l.quiz.forEach((q, i) => out.push({ id: `${key(t, l)}.${i}`, q, t, l }));
    return out;
  }
  const dueCards = (now = Date.now()) => allCards().filter(c => state.cards[c.id] && state.cards[c.id].due <= now);
  const nextLesson = t => t.lessons.find(l => !state.done[key(t, l)]) || t.lessons[0];

  // ---------- views ----------
  let flashTimer;
  function render() {
    clearInterval(flashTimer);
    const route = decodeURIComponent(location.hash.slice(1));
    let view;
    if (route === 'review') view = reviewView();
    else if (route === 'glossary') view = glossaryView();
    else {
      const [tid, lid] = route.split('.');
      const t = tracks.find(x => x.id === tid);
      const l = t && t.lessons.find(x => x.id === lid);
      view = l ? lessonView(t, l) : homeView();
    }
    document.getElementById('app').replaceChildren(view);
    updateNav(route);
    window.scrollTo(0, 0);
  }

  function updateNav(route) {
    const due = dueCards().length;
    const b = document.getElementById('due-badge');
    b.textContent = due; b.hidden = !due;
    const here = route === 'review' || route === 'glossary' ? '#' + route : '#home';
    document.querySelectorAll('.top nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === here));
  }

  function homeView() {
    const due = dueCards().length;
    const pins = tracks.flatMap(t => t.lessons.map(l => ({ t, l })));
    let i = 0;
    const text = h('p', { class: 'flash-text' }), from = h('span'), count = h('span');
    const card = h('a', { class: 'flash-card', href: '#home' }, h('div', { class: 'flash-top' }, from, count), text, h('span', { class: 'flash-hint' }, 'Open lesson →'));
    const show = () => {
      const { t, l } = pins[i];
      text.textContent = l.remember; from.textContent = `${t.title} · ${l.title}`;
      count.textContent = `${i + 1}/${pins.length}`; card.href = '#' + key(t, l);
    };
    if (pins.length) show();
    if (pins.length > 1) flashTimer = setInterval(() => { i = (i + 1) % pins.length; replay(card, 'turn'); setTimeout(show, 300); }, 4500);

    const t0 = tracks[0];
    const started = t0 && t0.lessons.some(l => state.done[key(t0, l)]);
    const go = t0 && h('a', { class: due ? 'btn' : 'btn primary', href: '#' + key(t0, nextLesson(t0)) }, `${started ? 'Continue' : 'Start'}: ${nextLesson(t0).title}`);
    const wrap = h('div', { class: 'wrap' },
      h('section', { class: 'hero' },
        h('div', { class: 'hero-copy' },
          h('p', { class: 'eyebrow' }, 'Kotlin · Android · Compose · Flow · Architecture · Testing · Push · KMP'),
          h('h1', {}, 'Watch the concept move. ', h('span', { class: 'hl' }, 'Then make it stick.')),
          h('p', { class: 'lede' }, 'Every lesson has a live demo you can poke, one rule to pin in your head, and a short quiz. The quiz questions come back on a spaced schedule, right around when you would start to forget them.'),
          h('div', { class: 'actions' }, due ? h('a', { class: 'btn primary', href: '#review' }, `Review ${due} due card${due > 1 ? 's' : ''}`) : null, go)),
        h('div', { class: 'flash', 'aria-label': 'Rules from each lesson' }, card)));
    wrap.append(levelFilter(wrap), ...tracks.map(trackView));
    return wrap;
  }

  const LEVELS = ['beginner', 'intermediate', 'advanced'];
  const levelBadge = l => l.level && h('span', { class: `lvl lvl-${l.level}` }, l.level);

  function levelFilter(wrap) {
    wrap.dataset.level = state.level;
    const chips = ['all', ...LEVELS].map(v => h('button', { class: 'lvl-chip', 'aria-pressed': state.level === v, onclick() {
      state.level = v; save(); wrap.dataset.level = v;
      chips.forEach(c => c.setAttribute('aria-pressed', c === this));
    } }, v === 'all' ? 'All levels' : v));
    return h('div', { class: 'lvl-filter', role: 'group', 'aria-label': 'Filter lessons by level' }, chips);
  }

  function trackView(t) {
    const done = t.lessons.filter(l => state.done[key(t, l)]).length;
    return h('section', { class: 'track-card' },
      h('div', { class: 'track-head' },
        h('div', {}, h('p', { class: 'eyebrow' }, `Track · ${t.lessons.length} lessons`), h('h2', {}, t.title), h('p', { class: 'muted-text' }, t.description)),
        h('div', { class: 'progress' },
          h('span', { class: 'progress-num' }, `${done} of ${t.lessons.length} done`),
          h('div', { class: 'meter' }, h('span', { style: `width:${(done / t.lessons.length) * 100}%` })))),
      h('ol', { class: 'path' }, t.lessons.map(l =>
        h('li', { class: state.done[key(t, l)] ? 'done' : null, 'data-level': l.level || null },
          h('a', { href: '#' + key(t, l) }, h('span', {}, l.title, h('small', {}, l.tagline), levelBadge(l)))))));
  }

  function questionView(q, id, onAnswer, record = true) {
    const why = h('p', { class: 'why', hidden: true });
    const box = h('div', { class: 'q' }, h('p', { class: 'q-text', html: q.q }));
    const opts = q.options.map((o, j) => h('button', { class: 'opt', html: o, onclick() {
      if (box.dataset.answered) return;
      box.dataset.answered = '1';
      const ok = j === q.a;
      opts[j].classList.add(ok ? 'right' : 'wrong');
      opts[q.a].classList.add('right');
      why.innerHTML = `<b>${ok ? 'Right.' : 'Not quite.'}</b> ${q.why || ''}`;
      why.hidden = false;
      if (record) { state.cards[id] = schedule(state.cards[id], ok, Date.now()); save(); }
      onAnswer(ok);
    } }));
    box.append(h('div', { class: 'opts' }, opts), why);
    return box;
  }

  function lessonView(t, l) {
    const idx = t.lessons.indexOf(l);
    const prev = t.lessons[idx - 1], next = t.lessons[idx + 1];
    const items = t.lessons.map(x => h('li', { class: [x === l && 'cur', state.done[key(t, x)] && 'done'].filter(Boolean).join(' ') || null },
      h('a', { href: '#' + key(t, x), 'aria-current': x === l ? 'page' : null }, x.title)));
    const viz = h('div', { class: 'viz' });
    const resetViz = () => { viz.replaceChildren(); l.visual(viz); };

    let left = l.quiz.length;
    const quiz = h('section', { class: 'quiz' },
      h('h2', {}, 'Check yourself'),
      h('p', { class: 'muted-text' }, 'These questions come back in Review: tomorrow, then after 3, 7, 21 and 60 days while you keep getting them right.'),
      l.quiz.map((q, i) => questionView(q, `${key(t, l)}.${i}`, () => {
        if (--left) return;
        state.done[key(t, l)] = true; save();
        items[idx].classList.add('done');
        quiz.append(h('div', { class: 'done-note drop-in' }, 'Lesson complete.',
          next ? h('a', { class: 'btn primary small', href: '#' + key(t, next) }, `Next: ${next.title} →`) : h('a', { class: 'btn small', href: '#home' }, 'Back to lessons')));
      })));

    const page = h('div', { class: 'wrap lesson-page' },
      h('nav', { class: 'side', 'aria-label': `${t.title} lessons` }, h('a', { class: 'side-track', href: '#home' }, t.title), h('ol', {}, items)),
      h('article', { class: 'lesson' },
        h('header', { class: 'lesson-head' },
          h('p', { class: 'eyebrow lesson-eyebrow' }, `${t.title} · Lesson ${idx + 1} of ${t.lessons.length}`, levelBadge(l)),
          h('h1', {}, l.title),
          h('p', { class: 'lede' }, l.tagline)),
        h('div', { class: 'prose', html: l.body }),
        h('section', { class: 'bench', 'aria-label': 'Interactive demo' },
          h('div', { class: 'bench-head' }, h('span', { class: 'bench-label' }, 'Try it'), h('button', { class: 'btn small', onclick: resetViz }, 'Reset')),
          viz),
        code(l.code),
        h('aside', { class: 'pin' }, h('span', { class: 'pin-label' }, 'Pin this'), h('p', {}, l.remember)),
        l.challenges && l.challenges.length ? h('section', { class: 'quiz' }, h('h2', {}, 'Practice'), l.challenges.map(challengeView)) : null,
        l.terms && l.terms.length ? h('section', { class: 'terms' }, h('h2', {}, 'Terms'), h('dl', {}, l.terms.map(x => [h('dt', {}, x.term), h('dd', {}, x.def)]))) : null,
        quiz,
        h('nav', { class: 'pager', 'aria-label': 'Lesson navigation' },
          prev && h('a', { href: '#' + key(t, prev) }, h('small', {}, '← Previous'), prev.title),
          next && h('a', { class: 'next', href: '#' + key(t, next) }, h('small', {}, 'Next →'), next.title))));
    l.visual(viz);
    return page;
  }

  // ---------- challenges ----------
  // { type: 'blank', prompt, code: 'val x = [[val|var]] 1', why }  — [[a|b]] is a blank; any listed answer counts.
  // { type: 'bug', prompt, code, bug: <0-based line>, fix: 'corrected line', why }  — learner taps the broken line.
  const norm = s => s.replace(/\s+/g, ' ').trim();
  function challengeView(c) {
    const box = h('div', { class: 'q chal' }, h('p', { class: 'eyebrow' }, c.type === 'bug' ? 'Spot the bug' : 'Fill in the blanks'), h('p', { class: 'q-text', html: c.prompt }));
    const why = h('p', { class: 'why', hidden: true });
    if (c.type === 'bug') {
      let tries = 0, solved = false;
      const lines = c.code.split('\n').map((ln, i) => h('button', { class: 'chal-line', html: hl(ln) || ' ', onclick() {
        if (solved) return;
        if (i === c.bug) {
          solved = true; this.classList.add('right');
          this.after(h('div', { class: 'chal-line fixed drop-in', html: hl(c.fix) }));
          why.innerHTML = `<b>${tries ? 'Found it.' : 'Right away.'}</b> ${c.why || ''}`; why.hidden = false;
        } else {
          tries++; replay(this, 'shake'); this.classList.add('wrong');
          if (tries >= 2) lines[c.bug].classList.add('hint');
        }
      } }));
      box.append(h('div', { class: 'chal-code' }, lines), why);
      return box;
    }
    const inputs = [];
    const pre = h('pre', { class: 'code chal-code' });
    c.code.split(/(\[\[[^\]]*\]\])/).forEach(part => {
      const m = part.match(/^\[\[(.*)\]\]$/);
      if (!m) { pre.append(h('span', { html: hl(part) })); return; }
      const answers = m[1].split('|');
      const inp = h('input', { class: 'blank', 'aria-label': `Blank ${inputs.length + 1}`, spellcheck: 'false', autocomplete: 'off', size: Math.max(3, ...answers.map(a => a.length)) });
      inp.answers = answers; inputs.push(inp); pre.append(inp);
    });
    const check = () => {
      let ok = 0;
      inputs.forEach(i => { const good = i.answers.some(a => norm(a) === norm(i.value)); i.classList.toggle('right', good); i.classList.toggle('wrong', !good); ok += good; });
      why.innerHTML = ok === inputs.length ? `<b>All correct.</b> ${c.why || ''}` : `<b>${ok} of ${inputs.length} correct.</b> Fix the red ones or show the answer.`;
      why.hidden = false;
      if (ok !== inputs.length) replay(pre, 'shake');
    };
    pre.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    box.append(pre, h('div', { class: 'actions' },
      h('button', { class: 'btn primary small', onclick: check }, 'Check'),
      h('button', { class: 'btn small', onclick() { inputs.forEach(i => { i.value = i.answers[0]; }); check(); } }, 'Show answer')), why);
    return box;
  }

  // ---------- glossary + search ----------
  function allTerms() {
    const out = [];
    for (const t of tracks) for (const l of t.lessons) for (const x of l.terms || []) out.push({ ...x, t, l });
    return out.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
  }
  function glossaryView() {
    const terms = allTerms();
    const groups = {};
    for (const x of terms) { const k = /[a-z]/i.test(x.term[0]) ? x.term[0].toUpperCase() : '#'; (groups[k] = groups[k] || []).push(x); }
    return h('div', { class: 'wrap review glossary' },
      h('div', { class: 'lesson-head' }, h('p', { class: 'eyebrow' }, `Glossary · ${terms.length} terms`), h('h1', {}, 'Every term, one line each'),
        h('p', { class: 'lede' }, 'Each term links back to the lesson that explains it. Use the search box at the top to jump straight to one.')),
      h('nav', { class: 'az', 'aria-label': 'Jump to letter' }, Object.keys(groups).map(k => h('a', { href: '#glossary', onclick(e) { e.preventDefault(); document.getElementById('g-' + k).scrollIntoView({ behavior: 'smooth' }); } }, k))),
      Object.entries(groups).map(([k, xs]) => h('section', { class: 'g-group', id: 'g-' + k }, h('h2', {}, k),
        h('dl', {}, xs.map(x => [h('dt', {}, x.term), h('dd', {}, x.def, ' ', h('a', { href: '#' + key(x.t, x.l) }, `${x.t.title} · ${x.l.title} →`))])))));
  }

  // ponytail: linear scan over ~100 lessons/terms per keystroke. Fine until thousands; then build an inverted index.
  function search(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const hits = [];
    const score = (title, rest) => {
      const T = title.toLowerCase(), all = (title + ' ' + rest).toLowerCase();
      if (!words.every(w => all.includes(w))) return 0;
      return words.filter(w => T.includes(w)).length * 3 + (T.startsWith(words[0]) ? 2 : 0) + 1;
    };
    for (const t of tracks) for (const l of t.lessons) {
      const s = score(l.title, `${t.title} ${l.tagline} ${l.remember} ${(l.terms || []).map(x => x.term).join(' ')}`);
      if (s) hits.push({ s: s + 1, href: '#' + key(t, l), title: l.title, sub: `Lesson · ${t.title}` });
    }
    for (const x of allTerms()) {
      const s = score(x.term, x.def);
      if (s) hits.push({ s, href: '#' + key(x.t, x.l), title: x.term, sub: x.def });
    }
    return hits.sort((a, b) => b.s - a.s).slice(0, 8);
  }
  function setupSearch() {
    const input = document.getElementById('search');
    const list = document.getElementById('search-results');
    if (!input) return;
    let active = 0, hits = [];
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); };
    const paint = () => {
      list.replaceChildren(...(hits.length ? hits.map((x, i) => h('a', { href: x.href, class: i === active ? 'on' : null, role: 'option', onclick: () => { input.value = ''; close(); } }, h('b', {}, x.title), h('small', {}, x.sub)))
        : [h('p', { class: 'muted-text' }, 'No matches. Try a shorter word.')]));
      list.hidden = !input.value.trim(); input.setAttribute('aria-expanded', String(!list.hidden));
    };
    input.addEventListener('input', () => { hits = search(input.value); active = 0; paint(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % Math.max(hits.length, 1); paint(); }
      else if (e.key === 'Enter' && hits[active]) { location.hash = hits[active].href; input.value = ''; close(); input.blur(); }
      else if (e.key === 'Escape') { input.value = ''; close(); }
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
    addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); input.focus(); } });
  }

  function reviewView() {
    const queue = dueCards().sort(() => Math.random() - 0.5);
    const seen = new Set();
    const total = queue.length;
    const title = h('h1', {}, total ? `${total} card${total > 1 ? 's' : ''} due` : 'Nothing due right now');
    const slot = h('div', { class: 'quiz' });
    function show() {
      slot.replaceChildren();
      if (!queue.length) {
        const upcoming = Object.values(state.cards).map(c => c.due).filter(d => d > Date.now());
        const days = upcoming.length ? Math.max(1, Math.round((Math.min(...upcoming) - Date.now()) / DAY)) : 0;
        slot.append(h('div', { class: 'empty' },
          h('p', {}, !Object.keys(state.cards).length
            ? 'Answer the quiz at the end of any lesson. Its questions show up here when they are due.'
            : `${total ? 'Done for now. ' : ''}The next card comes back in ${days} day${days > 1 ? 's' : ''}.`),
          h('a', { class: 'btn primary', href: '#home' }, 'Back to lessons')));
        return;
      }
      const c = queue.shift();
      const first = !seen.has(c.id); seen.add(c.id);
      slot.append(h('p', { class: 'eyebrow' }, `${c.t.title} · ${c.l.title} · ${queue.length} left after this`),
        questionView(c.q, c.id, ok => {
          if (!ok) queue.push(c); // missed cards return at the end of this session too
          slot.append(h('div', { class: 'actions' },
            h('button', { class: 'btn primary', onclick: show }, queue.length ? 'Next card' : 'Finish'),
            h('a', { class: 'btn', href: '#' + key(c.t, c.l) }, 'Reopen lesson')));
        }, first));
    }
    show();
    return h('div', { class: 'wrap review' }, h('div', { class: 'lesson-head' }, h('p', { class: 'eyebrow' }, 'Spaced review'), title), slot);
  }

  function start() { load(); setupSearch(); addEventListener('hashchange', render); render(); }

  // A track may carry its own demo styles as a CSS string in t.css.
  function addTrack(t) { tracks.push(t); if (t.css && typeof document !== 'undefined') document.head.append(h('style', {}, t.css)); }

  return { addTrack, start, schedule, h, sleep, hl, code, replay, swap };
})();

if (typeof module !== 'undefined') module.exports = Lab;
else document.addEventListener('DOMContentLoaded', Lab.start);
