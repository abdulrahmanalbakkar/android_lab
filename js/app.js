/* Android Lab core: routing, the subway map, track and lesson pages, quizzes, challenges, spaced review, search, glossary.
   To add a topic: create tracks/<id>.js that calls Lab.addTrack({...}) (see tracks/kotlin.js)
   and add one <script> tag for it in index.html. Nothing in this file needs to change.
   Optional track fields: group ('Foundations' | 'Building apps' | 'Going deeper' | 'Shipping'),
   requires (array of track ids, a soft "recommended first"), hue (0-360, overrides the line color). */
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
  let state = { done: {}, cards: {}, level: 'all', last: null, hide: {} };
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) state = { done: s.done || {}, cards: s.cards || {}, level: s.level || 'all', last: s.last || null, hide: s.hide || {} };
    } catch (e) { /* storage blocked: run without saving */ }
  }
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
  const doneCount = t => t.lessons.filter(l => state.done[key(t, l)]).length;
  const trackById = id => tracks.find(x => x.id === id);
  // Requires pointing at a track that isn't loaded are ignored.
  const reqs = t => (Array.isArray(t.requires) ? t.requires : []).map(trackById).filter(x => x && x !== t);
  const missing = t => reqs(t).filter(r => !doneCount(r));
  const RESERVED = ['home', 'review', 'glossary'];

  // Line colors: curated hues (OKLCH degrees) spaced so neighbours differ; lightness/chroma come from theme tokens.
  const HUES = [300, 150, 250, 45, 195, 350, 95, 270, 20, 170, 325, 125, 225, 70, 285, 5, 140, 210];
  const hue = t => (typeof t.hue === 'number' ? t.hue : HUES[Math.max(0, tracks.indexOf(t)) % HUES.length]);
  const GROUPS = ['Foundations', 'Building apps', 'Going deeper', 'Shipping'];
  function grouped() {
    const map = new Map(GROUPS.map(g => [g, []]));
    for (const t of tracks) { const g = t.group || 'More'; if (!map.has(g)) map.set(g, []); map.get(g).push(t); }
    return [...map].filter(([, ts]) => ts.length);
  }
  const andList = xs => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
  const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- views ----------
  let flashTimer;
  let here = {}; // { t, l } of the current page, used by shortcuts and the reading bar
  function render() {
    clearInterval(flashTimer);
    const route = decodeURIComponent(location.hash.slice(1));
    let view; here = {};
    if (route === 'review') view = reviewView();
    else if (route === 'glossary') view = glossaryView();
    else {
      const [tid, lid] = route.split('.');
      const t = !RESERVED.includes(tid) && trackById(tid);
      const l = t && lid != null && t.lessons.find(x => x.id === lid);
      if (l) { here = { t, l }; view = lessonView(t, l); }
      else if (t && lid == null) { here = { t }; view = trackView(t); }
      else view = homeView();
    }
    document.getElementById('app').replaceChildren(view);
    document.title = [here.l && here.l.title, here.t && here.t.title, route === 'review' && 'Review', route === 'glossary' && 'Glossary', 'Android Lab'].filter(Boolean).join(' · ');
    updateNav(route);
    window.scrollTo(0, 0);
    paintReadbar();
  }

  function updateNav(route) {
    const due = dueCards().length;
    const b = document.getElementById('due-badge');
    if (b) { b.textContent = due; b.hidden = !due; }
    const cur = route === 'review' || route === 'glossary' ? '#' + route : '#home';
    document.querySelectorAll('.top nav a').forEach(a => {
      const on = a.getAttribute('href') === cur;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function crumbs(parts) {
    return h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, h('ol', {}, parts.map(([label, href], i) =>
      h('li', {}, href && i < parts.length - 1 ? h('a', { href }, label) : h('span', { 'aria-current': 'page' }, label)))));
  }

  function homeView() {
    const pins = tracks.flatMap(t => t.lessons.map(l => ({ t, l })));
    let i = 0;
    const text = h('p', { class: 'flash-text' }), from = h('span'), count = h('span');
    const card = h('a', { class: 'flash-card', href: '#home' }, h('div', { class: 'flash-top' }, h('span', { class: 'flash-label' }, 'Pin this'), count), text, h('span', { class: 'flash-hint' }, from, ' →'));
    const show = () => {
      const { t, l } = pins[i];
      text.textContent = l.remember; from.textContent = `${t.title} · ${l.title}`;
      count.textContent = `${i + 1}/${pins.length}`; card.href = '#' + key(t, l);
    };
    if (pins.length) show();
    if (pins.length > 1) flashTimer = setInterval(() => { i = (i + 1) % pins.length; replay(card, 'turn'); setTimeout(show, 300); }, 4500);

    const lessons = pins.length;
    return h('div', { class: 'wrap home' },
      h('section', { class: 'hero' },
        h('div', { class: 'hero-copy' },
          h('h1', {}, 'Android Lab'),
          h('p', { class: 'lede' }, 'Learn Kotlin and Android one live demo at a time, then keep it with spaced review.'),
          h('p', { class: 'hero-meta' }, `${tracks.length} lines · ${lessons} stations`)),
        h('div', { class: 'flash', 'aria-label': 'Rules from each lesson' }, card)),
      mapView());
  }

  // ---------- subway map ----------
  function mapView() {
    let i = 0;
    return h('section', { class: 'metro', 'aria-labelledby': 'map-h' },
      h('div', { class: 'metro-head' },
        h('h2', { id: 'map-h' }, 'The map'),
        h('ul', { class: 'mlegend', 'aria-label': 'Legend' },
          h('li', {}, h('span', { class: 'mdot done', 'aria-hidden': 'true' }), 'Done'),
          h('li', {}, h('span', { class: 'mdot', 'aria-hidden': 'true' }), 'Not started'),
          h('li', {}, h('span', { class: 'mdot here', 'aria-hidden': 'true' }), 'You are here'),
          h('li', {}, h('span', { class: 'xring', 'aria-hidden': 'true' }), 'Transfer'))),
      grouped().map(([g, ts]) => h('section', { class: 'mgroup', 'aria-label': g },
        h('h3', { class: 'mgroup-h' }, g),
        h('ol', { class: 'mlines' }, ts.map(t => lineRow(t, i++))))));
  }

  function lineRow(t, i) {
    const miss = missing(t), rs = reqs(t), done = doneCount(t), n = t.lessons.length;
    return h('li', { class: 'mline' + (miss.length ? ' soft' : ''), style: `--hue:${hue(t)};--i:${i}` },
      h('div', { class: 'mline-head' },
        h('a', { class: 'mpill', href: '#' + t.id }, t.title),
        h('span', { class: 'mcount', 'aria-label': `${done} of ${n} done` }, `${done}/${n}`),
        rs.length ? h('p', { class: 'xfers' + (miss.length ? ' mnote' : '') },
          h('span', { class: 'xfers-label' }, miss.length ? 'Recommended after' : 'Transfer from'),
          rs.map(r => h('span', { class: 'xchip', style: `--hue:${hue(r)}` }, h('span', { class: 'xring', 'aria-hidden': 'true' }), r.title))) : null),
      h('ol', { class: 'mrail', 'aria-label': `${t.title} stations` }, t.lessons.map((l, j) => {
        const k = key(t, l), d = state.done[k], at = state.last === k;
        const side = j < n / 3 ? 'tip-l' : j >= (n * 2) / 3 ? 'tip-r' : null;
        return h('li', { class: ['mstop', d && 'done', at && 'here'].filter(Boolean).join(' '), style: `--j:${j}` },
          h('a', { href: '#' + k, class: side, 'data-tip': l.title, 'aria-label': `${j + 1}. ${l.title}${d ? ', done' : ''}${at ? ', you are here' : ''}` },
            h('span', { class: ['mdot', d && 'done', at && 'here'].filter(Boolean).join(' ') })));
      })));
  }

  function softNote(t, onClose) {
    const miss = missing(t);
    if (!miss.length) return null;
    const links = [];
    miss.forEach((r, i) => { if (i) links.push(i === miss.length - 1 ? ' and ' : ', '); links.push(h('a', { href: '#' + r.id, style: `--hue:${hue(r)}`, class: 'xlink' }, h('span', { class: 'xring', 'aria-hidden': 'true' }), r.title)); });
    const note = h('div', { class: 'soft-note', role: 'note' },
      h('p', {}, h('b', {}, 'Recommended first: '), links, h('span', { class: 'muted-text' }, '. Everything here still works without it.')),
      onClose ? h('button', { class: 'btn small ghost', 'aria-label': 'Dismiss recommendation', onclick() { onClose(); note.remove(); } }, 'Dismiss') : null);
    return note;
  }

  const LEVELS = ['beginner', 'intermediate', 'advanced'];
  const levelBadge = l => l.level && h('span', { class: `lvl lvl-${l.level}` }, l.level);

  function levelFilter(wrap, lessons, onChange) {
    wrap.dataset.level = state.level;
    const count = v => v === 'all' ? lessons.length : lessons.filter(l => l.level === v).length;
    const chips = ['all', ...LEVELS].map(v => h('button', { class: 'lvl-chip', 'aria-pressed': String(state.level === v), onclick() {
      state.level = v; save(); wrap.dataset.level = v;
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === this)));
      if (onChange) onChange();
    } }, v === 'all' ? 'All' : v, h('span', { class: 'lvl-n' }, count(v))));
    return h('div', { class: 'lvl-filter', role: 'group', 'aria-label': 'Filter lessons by level' }, chips);
  }

  function progressBar(done, n) {
    return h('div', { class: 'progress' },
      h('span', { class: 'progress-num' }, `${done} of ${n} done`),
      h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': n, 'aria-valuenow': done, 'aria-label': 'Track progress' },
        h('span', { style: `width:${n ? (done / n) * 100 : 0}%` })));
  }

  function trackView(t) {
    const n = t.lessons.length, done = doneCount(t), nxt = nextLesson(t);
    const wrap = h('div', { class: 'wrap track-page', style: `--hue:${hue(t)}` });
    const empty = h('p', { class: 'muted-text tline-empty', hidden: true }, 'No lessons at this level in this track.');
    const syncEmpty = () => { empty.hidden = state.level === 'all' || t.lessons.some(l => l.level === state.level); };
    const label = !nxt ? null : done === n ? `Start again: ${nxt.title}` : `${done ? 'Continue' : 'Start'}: ${nxt.title}`;
    wrap.append(
      crumbs([['Map', '#home'], [t.title]]),
      h('header', { class: 'lesson-head track-head' },
        h('p', { class: 'eyebrow' }, h('span', { class: 'line-swatch', 'aria-hidden': 'true' }), `${t.group || 'Track'} · ${n} lessons`),
        h('h1', {}, t.title),
        h('p', { class: 'lede' }, t.description),
        progressBar(done, n),
        softNote(t),
        nxt ? h('div', { class: 'actions' }, h('a', { class: 'btn primary', href: '#' + key(t, nxt) }, label, ' →')) : null),
      h('section', { class: 'track-lessons', 'aria-label': 'Lessons' },
        levelFilter(wrap, t.lessons, syncEmpty),
        h('ol', { class: 'tline' }, t.lessons.map((l, j) => {
          const k = key(t, l), d = state.done[k], at = state.last === k;
          return h('li', { class: [d && 'done', at && 'here'].filter(Boolean).join(' ') || null, 'data-level': l.level || null },
            h('a', { href: '#' + k },
              h('span', { class: ['mdot', d && 'done', at && 'here'].filter(Boolean).join(' '), 'aria-hidden': 'true' }),
              h('span', { class: 'tbody' },
                h('span', { class: 'tnum' }, `${String(j + 1).padStart(2, '0')}${d ? ' · done' : ''}${at ? ' · you are here' : ''}`),
                h('b', {}, l.title),
                h('small', {}, l.tagline)),
              levelBadge(l)));
        })),
        empty));
    syncEmpty();
    return wrap;
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
    state.last = key(t, l); save();
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
          next ? h('a', { class: 'btn primary small', href: '#' + key(t, next) }, `Next: ${next.title} →`) : h('a', { class: 'btn small', href: '#' + t.id }, `Back to ${t.title}`)));
      })));

    const bench = h('section', { class: 'bench', 'aria-label': 'Interactive demo' },
      h('div', { class: 'bench-head' }, h('span', { class: 'bench-label' }, 'Try it'), h('button', { class: 'btn small', onclick: resetViz }, 'Reset')),
      viz);
    const snippet = code(l.code);
    const pin = h('aside', { class: 'pin' }, h('span', { class: 'pin-label' }, 'Pin this'), h('p', {}, l.remember));
    const practice = l.challenges && l.challenges.length ? h('section', { class: 'quiz' }, h('h2', {}, 'Practice'), l.challenges.map(challengeView)) : null;
    const terms = l.terms && l.terms.length ? h('section', { class: 'terms' }, h('h2', {}, 'Terms'), h('dl', {}, l.terms.map(x => [h('dt', {}, x.term), h('dd', {}, x.def)]))) : null;
    const sections = [['Demo', bench], ['Code', snippet], ['Pin', pin], ['Practice', practice], ['Terms', terms], ['Check yourself', quiz]].filter(([, el]) => el);
    const toc = h('nav', { class: 'toc', 'aria-label': 'On this page' }, h('span', { class: 'toc-label' }, 'On this page'),
      sections.map(([label, el]) => h('button', { type: 'button', onclick() {
        el.setAttribute('tabindex', '-1');
        el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
      } }, label)));

    const page = h('div', { class: 'wrap lesson-page', style: `--hue:${hue(t)}` },
      h('nav', { class: 'side', 'aria-label': `${t.title} lessons` }, h('a', { class: 'side-track', href: '#' + t.id }, h('span', { class: 'line-swatch', 'aria-hidden': 'true' }), t.title), h('ol', {}, items)),
      h('article', { class: 'lesson' },
        crumbs([['Map', '#home'], [t.title, '#' + t.id], [l.title]]),
        state.hide[t.id] ? null : softNote(t, () => { state.hide[t.id] = true; save(); }),
        h('header', { class: 'lesson-head' },
          h('p', { class: 'eyebrow lesson-eyebrow' }, `Lesson ${idx + 1} of ${t.lessons.length}`, levelBadge(l)),
          h('h1', {}, l.title),
          h('p', { class: 'lede' }, l.tagline)),
        toc,
        h('div', { class: 'prose', html: l.body }),
        bench, snippet, pin, practice, terms, quiz,
        h('nav', { class: 'pager', 'aria-label': 'Lesson navigation' },
          prev && h('a', { href: '#' + key(t, prev) }, h('small', {}, '← Previous'), prev.title),
          next && h('a', { class: 'next', href: '#' + key(t, next) }, h('small', {}, 'Next →'), next.title))));
    l.visual(viz);
    return page;
  }

  // Thin bar under the header: how far down the lesson you are, in the track's color.
  function paintReadbar() {
    const bar = document.getElementById('readbar');
    if (!bar) return;
    bar.hidden = !here.l;
    if (!here.l) return;
    bar.style.setProperty('--hue', hue(here.t));
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.firstElementChild.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
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
        h('p', { class: 'lede' }, 'Each term links back to the lesson that explains it. Press / to search for one.')),
      h('nav', { class: 'az', 'aria-label': 'Jump to letter' }, Object.keys(groups).map(k => h('a', { href: '#glossary', onclick(e) { e.preventDefault(); document.getElementById('g-' + k).scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' }); } }, k))),
      Object.entries(groups).map(([k, xs]) => h('section', { class: 'g-group', id: 'g-' + k }, h('h2', {}, k),
        h('dl', {}, xs.map(x => [h('dt', {}, x.term), h('dd', {}, x.def, ' ', h('a', { href: '#' + key(x.t, x.l) }, `${x.t.title} · ${x.l.title} →`))])))));
  }

  // ponytail: linear scan over a few hundred lessons/terms per keystroke. Fine until thousands; then build an inverted index.
  function search(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const hits = [];
    const score = (title, rest) => {
      const T = title.toLowerCase(), all = (title + ' ' + rest).toLowerCase();
      if (!words.every(w => all.includes(w))) return 0;
      return words.filter(w => T.includes(w)).length * 3 + (T.startsWith(words[0]) ? 2 : 0) + 1;
    };
    for (const t of tracks) {
      const s = score(t.title, `${t.id} ${t.group || ''} ${t.description || ''}`);
      if (s) hits.push({ s: s + 2 + (words.includes(t.id) ? 4 : 0), href: '#' + t.id, title: t.title, sub: `Track · ${t.lessons.length} lessons` });
      for (const l of t.lessons) {
        const s2 = score(l.title, `${t.title} ${l.tagline} ${l.remember} ${(l.terms || []).map(x => x.term).join(' ')}`);
        if (s2) hits.push({ s: s2 + 1, href: '#' + key(t, l), title: l.title, sub: `Lesson · ${t.title}` });
      }
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
      list.replaceChildren(...(hits.length ? hits.map((x, i) => h('a', { href: x.href, class: i === active ? 'on' : null, role: 'option', 'aria-selected': String(i === active), onclick: () => { input.value = ''; close(); } }, h('b', {}, x.title), h('small', {}, x.sub)))
        : [h('p', { class: 'muted-text' }, 'No matches. Try a shorter word.')]));
      list.hidden = !input.value.trim(); input.setAttribute('aria-expanded', String(!list.hidden));
    };
    input.addEventListener('input', () => { hits = search(input.value); active = 0; paint(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % Math.max(hits.length, 1); paint(); }
      else if (e.key === 'Enter' && hits[active]) { location.hash = hits[active].href; input.value = ''; close(); input.blur(); }
      else if (e.key === 'Escape') { input.value = ''; close(); input.blur(); }
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
  }

  // ---------- theme: System -> Light -> Dark ----------
  const THEME_KEY = 'android-lab:theme';
  const MODES = ['system', 'light', 'dark'];
  const ICONS = {
    system: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="currentColor"/><path d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    dark: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 12.6A7 7 0 0 1 7.4 3.5a7 7 0 1 0 9.1 9.1z" fill="currentColor"/></svg>',
  };
  function getMode() { try { const m = localStorage.getItem(THEME_KEY); return MODES.includes(m) ? m : 'system'; } catch (e) { return 'system'; } }
  function setMode(m) {
    try { if (m === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, m); } catch (e) { /* not remembered */ }
    applyMode(m);
  }
  function applyMode(m) {
    const root = document.documentElement;
    if (m === 'system') root.removeAttribute('data-theme'); else root.dataset.theme = m;
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    const nextMode = MODES[(MODES.indexOf(m) + 1) % MODES.length];
    const name = s => s[0].toUpperCase() + s.slice(1);
    btn.innerHTML = ICONS[m];
    btn.setAttribute('aria-label', `Theme: ${name(m)}. Switch to ${name(nextMode)}`);
    btn.title = `Theme: ${name(m)} (t)`;
  }
  const cycleMode = () => setMode(MODES[(MODES.indexOf(getMode()) + 1) % MODES.length]);
  // The t shortcut flips what you actually see, so it never looks like a no-op.
  function flipVisible() {
    const m = getMode();
    const dark = m === 'dark' || (m === 'system' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
    setMode(dark ? 'light' : 'dark');
  }

  // ---------- keyboard shortcuts ----------
  const SHORTCUTS = [['←  →', 'Previous / next lesson'], ['/', 'Search'], ['m', 'Map'], ['r', 'Review'], ['g', 'Glossary'], ['t', 'Light / dark theme'], ['?', 'This list']];
  let keysDialog;
  function showKeys() {
    if (!keysDialog) {
      keysDialog = h('dialog', { class: 'keys', 'aria-labelledby': 'keys-h', onclick(e) { if (e.target === keysDialog) keysDialog.close(); } },
        h('div', { class: 'keys-in' },
          h('div', { class: 'keys-head' }, h('h2', { id: 'keys-h' }, 'Keyboard shortcuts'), h('button', { class: 'btn small ghost', onclick: () => keysDialog.close() }, 'Close')),
          h('dl', {}, SHORTCUTS.map(([k, what]) => [h('dt', {}, k.split(/\s+/).map(x => h('kbd', {}, x))), h('dd', {}, what)])),
          h('p', { class: 'muted-text' }, 'Shortcuts pause while you type in a field.')));
      document.body.append(keysDialog);
    }
    if (!keysDialog.open) { if (keysDialog.showModal) keysDialog.showModal(); else keysDialog.setAttribute('open', ''); }
  }
  function onKey(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = document.activeElement;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (keysDialog && keysDialog.open) return;
    const go = hash => { e.preventDefault(); if (location.hash === hash) render(); else location.hash = hash; };
    const { t, l } = here;
    switch (e.key) {
      case '/': e.preventDefault(); document.getElementById('search').focus(); break;
      case 'ArrowLeft': case 'ArrowRight': {
        if (!l || e.shiftKey) return;
        const nb = t.lessons[t.lessons.indexOf(l) + (e.key === 'ArrowRight' ? 1 : -1)];
        if (nb) go('#' + key(t, nb));
        break;
      }
      case 'm': go('#home'); break;
      case 'r': go('#review'); break;
      case 'g': go('#glossary'); break;
      case 't': e.preventDefault(); flipVisible(); break;
      case '?': e.preventDefault(); showKeys(); break;
      default:
    }
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
          h('a', { class: 'btn primary', href: '#home' }, 'Back to the map')));
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

  function start() {
    load(); applyMode(getMode()); setupSearch();
    const tb = document.getElementById('theme-btn'); if (tb) tb.addEventListener('click', cycleMode);
    const kb = document.getElementById('keys-btn'); if (kb) kb.addEventListener('click', showKeys);
    addEventListener('keydown', onKey);
    addEventListener('scroll', paintReadbar, { passive: true });
    addEventListener('resize', paintReadbar);
    addEventListener('hashchange', render);
    render();
  }

  // A track may carry its own demo styles as a CSS string in t.css.
  function addTrack(t) { tracks.push(t); if (t.css && typeof document !== 'undefined') document.head.append(h('style', {}, t.css)); }

  return { addTrack, start, schedule, h, sleep, hl, code, replay, swap };
})();

if (typeof module !== 'undefined') module.exports = Lab;
else document.addEventListener('DOMContentLoaded', Lab.start);
