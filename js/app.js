/* Android Lab core: routing, the subway map, track and lesson pages, quizzes, challenges, spaced review, search, glossary.
   To add a topic: create tracks/<id>.js that calls Lab.addTrack({...}) (see tracks/kotlin.js)
   and add one <script> tag for it in index.html. Nothing in this file needs to change.
   Optional track fields: group ('Foundations' | 'Building apps' | 'Going deeper' | 'Shipping'),
   requires (array of track ids, a soft "recommended first"), hue (0-360, overrides the line color).
   Capstone projects are tracks with kind: 'project' and builds ('what you have at the end'); their lessons are
   build steps and may carry refs: ['track.lesson', ...], shown as "Review first" links. */
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
  // iv: interview mode, { setup, best: { [setupKey]: run }, history: [run] }. Added later; older saves simply lack it.
  let state = { done: {}, cards: {}, level: 'all', last: null, hide: {}, iv: {} };
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) state = { done: s.done || {}, cards: s.cards || {}, level: s.level || 'all', last: s.last || null, hide: s.hide || {}, iv: s.iv || {} };
      migrate();
    } catch (e) { /* storage blocked: run without saving */ }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* same */ } }

  // Lessons that moved between tracks. Saved progress, review cards and old links follow them.
  const MOVED = {
    'oop.srp': 'solid.srp', 'oop.open-closed': 'solid.open-closed', 'oop.liskov': 'solid.liskov', 'oop.isp': 'solid.isp', 'oop.dip': 'solid.dip',
    'kotlin.coroutines': 'coroutines.basics', 'flow.structured': 'coroutines.structured', 'flow.dispatchers': 'coroutines.dispatchers', 'flow.channels': 'coroutines.channels',
    'platform.channels': 'push.channels', 'platform.fcm': 'push.fcm', 'platform.messages': 'push.messages', 'platform.deeplinks': 'push.deeplinks',
    'platform.workmanager': 'background.workmanager', 'platform.fgs': 'background.fgs', 'platform.receivers': 'background.receivers',
    'arch.room': 'data.room', 'arch.net': 'data.net',
  };
  const MOVED_TRACKS = { platform: 'push' };
  const moved = k => { if (!k) return k; const m = k.match(/^([\w-]+\.[\w-]+)(\..*)?$/); return m && MOVED[m[1]] ? MOVED[m[1]] + (m[2] || '') : k; };
  function migrate() {
    const remap = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [moved(k), v]));
    state.done = remap(state.done); state.cards = remap(state.cards); state.last = moved(state.last);
  }

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
  const RESERVED = ['home', 'review', 'glossary', 'interview'];
  const isProject = t => t.kind === 'project';
  // 'track.lesson' -> { t, l }, or null when either id doesn't resolve.
  function lessonRef(id) {
    const s = String(id), dot = s.indexOf('.');
    const t = dot > 0 && trackById(s.slice(0, dot));
    const l = t && t.lessons.find(x => x.id === s.slice(dot + 1));
    return l ? { t, l } : null;
  }

  // Line colors: curated hues (OKLCH degrees) spaced so neighbours differ; lightness/chroma come from theme tokens.
  const HUES = [300, 150, 250, 45, 195, 350, 95, 270, 20, 170, 325, 125, 225, 70, 285, 5, 140, 210];
  const hue = t => (typeof t.hue === 'number' ? t.hue : HUES[Math.max(0, tracks.indexOf(t)) % HUES.length]);
  const GROUPS = ['Foundations', 'Building apps', 'Going deeper', 'Shipping'];
  function grouped() {
    const map = new Map(GROUPS.map(g => [g, []]));
    for (const t of tracks) { const g = t.group || 'More'; if (!map.has(g)) map.set(g, []); map.get(g).push(t); }
    // Capstone projects close their group, whatever order the scripts loaded in.
    return [...map].filter(([, ts]) => ts.length).map(([g, ts]) => [g, ts.filter(t => !isProject(t)).concat(ts.filter(isProject))]);
  }
  const andList = xs => xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
  const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- views ----------
  let flashTimer, ivTimer;
  let here = {}; // { t, l } of the current page, used by shortcuts and the reading bar; onKey lets a view take keys first
  function render() {
    clearInterval(flashTimer); clearInterval(ivTimer);
    const route = decodeURIComponent(location.hash.slice(1));
    const to = MOVED[route] || MOVED_TRACKS[route];
    if (to) { location.replace('#' + to); return; }
    let view; here = {};
    if (route === 'review') view = reviewView();
    else if (route === 'glossary') view = glossaryView();
    else if (route === 'interview') view = interviewView();
    else {
      const [tid, lid] = route.split('.');
      const t = !RESERVED.includes(tid) && trackById(tid);
      const l = t && lid != null && t.lessons.find(x => x.id === lid);
      if (l) { here = { t, l }; view = lessonView(t, l); }
      else if (t && lid == null) { here = { t }; view = trackView(t); }
      else view = homeView();
    }
    document.getElementById('app').replaceChildren(view);
    document.title = [here.l && here.l.title, here.t && here.t.title, route === 'review' && 'Review', route === 'glossary' && 'Glossary', route === 'interview' && 'Interview', 'Android Lab'].filter(Boolean).join(' · ');
    updateNav(route);
    window.scrollTo(0, 0);
    paintReadbar();
  }

  function updateNav(route) {
    const due = dueCards().length;
    const b = document.getElementById('due-badge');
    if (b) { b.textContent = due; b.hidden = !due; }
    const cur = ['review', 'glossary', 'interview'].includes(route) ? '#' + route : '#home';
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
    const at = k => { const [tid, lid] = (k || '').split('.'); const t = tracks.find(x => x.id === tid); const l = t && t.lessons.find(x => x.id === lid); return l && { t, l }; };
    const doneTotal = pins.filter(p => state.done[key(p.t, p.l)]).length;
    // Where to go next: the lesson after the last one opened (or that one, if unfinished); a new visitor starts at the first track.
    let next = at(state.last);
    if (next && state.done[key(next.t, next.l)]) { const nl = nextLesson(next.t); next = state.done[key(next.t, nl)] ? null : { t: next.t, l: nl }; }
    if (!next && tracks[0]) next = { t: tracks[0], l: nextLesson(tracks[0]) };
    const due = dueCards().length;
    const row = (href, label, title, sub, primary) => h('a', { class: 'today-row' + (primary ? ' primary' : ''), href },
      h('span', { class: 'today-label' }, label), h('span', { class: 'today-title' }, title), sub && h('span', { class: 'today-sub' }, sub));
    const card = h('div', { class: 'today', 'aria-label': 'Today' },
      h('div', { class: 'today-top' }, h('span', { class: 'flash-label' }, doneTotal ? 'Pick up where you left off' : 'Start here'), h('span', {}, `${doneTotal}/${pins.length} done`)),
      next && row('#' + key(next.t, next.l), doneTotal ? 'Continue' : 'First lesson', next.l.title, `${next.t.title} · ${next.l.tagline || ''}`, true),
      due ? row('#review', 'Review', `${due} card${due > 1 ? 's' : ''} due`, 'Answer them before you forget') : row('#review', 'Review', 'Nothing due', 'Quiz answers come back here on a schedule'),
      row('#interview', 'Practice', 'Interview round', '10 mixed questions, optional timer'));

    const lessons = pins.length, projects = tracks.filter(isProject).length;
    return h('div', { class: 'wrap home' },
      h('section', { class: 'hero' },
        h('div', { class: 'hero-copy' },
          h('h1', {}, 'Android Lab'),
          h('p', { class: 'lede' }, 'Learn Kotlin and Android one live demo at a time, then keep it with spaced review.'),
          h('p', { class: 'hero-meta' }, [`${tracks.length - projects} lines`, projects && `${projects} capstone${projects > 1 ? 's' : ''}`, `${lessons} stations`].filter(Boolean).join(' · '))),
        card),
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
          h('li', {}, h('span', { class: 'xring', 'aria-hidden': 'true' }), 'Transfer'),
          tracks.some(isProject) ? h('li', {}, h('span', { class: 'xrail', 'aria-hidden': 'true' }), 'Capstone project') : null)),
      grouped().map(([g, ts]) => h('section', { class: 'mgroup', 'aria-label': g },
        h('h3', { class: 'mgroup-h' }, g),
        h('ol', { class: 'mlines' }, ts.map(t => lineRow(t, i++))))));
  }

  function lineRow(t, i) {
    const miss = missing(t), rs = reqs(t), done = doneCount(t), n = t.lessons.length;
    const proj = isProject(t);
    return h('li', { class: 'mline' + (proj ? ' project' : '') + (miss.length ? ' soft' : ''), style: `--hue:${hue(t)};--i:${i}` },
      h('div', { class: 'mline-head' },
        h('a', { class: 'mpill', href: '#' + t.id }, proj ? [h('span', { class: 'mtag' }, 'Capstone'), ' '] : null, t.title),
        h('span', { class: 'mcount', 'aria-label': `${done} of ${n} done` }, `${done}/${n}`),
        rs.length ? h('p', { class: 'xfers' + (miss.length ? ' mnote' : '') },
          h('span', { class: 'xfers-label' }, miss.length ? 'Recommended after' : 'Transfer from'),
          rs.map(r => h('span', { class: 'xchip', style: `--hue:${hue(r)}` }, h('span', { class: 'xring', 'aria-hidden': 'true' }), r.title))) : null),
      lineBody(t, n, proj));
  }

  // Rail + always-visible captions. Names never depend on hover: the "Next" line names a lesson,
  // tapping a station (touch) shows its name before navigating, and "All lessons" lists every name.
  function lineBody(t, n, proj) {
    const nxt = nextLesson(t), allDone = doneCount(t) === n;
    const unit = proj ? 'steps' : 'lessons';
    const peek = h('p', { class: 'mpeek', hidden: true, 'aria-live': 'polite' });
    const list = h('ol', { class: 'mlist', hidden: true }, t.lessons.map((l, j) => {
      const k = key(t, l), d = state.done[k];
      return h('li', { class: d ? 'done' : null }, h('a', { href: '#' + k }, h('span', { class: 'mlist-n' }, d ? '✓' : String(j + 1)), l.title));
    }));
    const toggle = h('button', { type: 'button', class: 'mtoggle', 'aria-expanded': 'false', onclick() {
      const open = list.hidden; list.hidden = !open; this.setAttribute('aria-expanded', String(open));
      this.textContent = open ? `Hide ${unit}` : `All ${n} ${unit}`;
    } }, `All ${n} ${unit}`);
    let picked = null;
    const touch = () => matchMedia('(hover: none)').matches;
    const rail = h('ol', { class: 'mrail', 'aria-label': `${t.title} ${proj ? 'steps' : 'stations'}` }, t.lessons.map((l, j) => {
      const k = key(t, l), d = state.done[k], at = state.last === k;
      const side = j < n / 3 ? 'tip-l' : j >= (n * 2) / 3 ? 'tip-r' : null;
      return h('li', { class: ['mstop', d && 'done', at && 'here'].filter(Boolean).join(' '), style: `--j:${j}` },
        h('a', { href: '#' + k, class: side, 'data-tip': l.title, 'aria-label': `${j + 1}. ${l.title}${d ? ', done' : ''}${at ? ', you are here' : ''}`, onclick(e) {
          if (!touch() || picked === k) return; // desktop, or second tap: go
          e.preventDefault(); picked = k;
          rail.querySelectorAll('a.picked').forEach(a => a.classList.remove('picked')); this.classList.add('picked');
          peek.replaceChildren(...[h('span', { class: 'mpeek-n' }, `${j + 1}/${n}`), ' ', h('a', { href: '#' + k }, l.title, ' →'), d && h('span', { class: 'mpeek-done' }, ' done')].filter(Boolean));
          peek.hidden = false;
        } }, h('span', { class: ['mdot', d && 'done', at && 'here'].filter(Boolean).join(' ') })));
    }));
    const next = h('p', { class: 'mnext' },
      nxt ? [h('span', { class: 'mnext-label' }, allDone ? 'Done · start again' : doneCount(t) ? 'Next' : 'Start'), ' ', h('a', { href: '#' + key(t, nxt) }, nxt.title, ' →')] : null,
      toggle);
    return h('div', { class: 'mbody' }, rail, peek, next, list);
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
      h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': n, 'aria-valuenow': done, 'aria-label': 'Progress' },
        h('span', { style: `width:${n ? (done / n) * 100 : 0}%` })));
  }

  function trackView(t) {
    const n = t.lessons.length, done = doneCount(t), nxt = nextLesson(t), proj = isProject(t);
    const wrap = h('div', { class: 'wrap track-page' + (proj ? ' project' : ''), style: `--hue:${hue(t)}` });
    const empty = h('p', { class: 'muted-text tline-empty', hidden: true }, 'No lessons at this level in this track.');
    const syncEmpty = () => { empty.hidden = proj || state.level === 'all' || t.lessons.some(l => l.level === state.level); };
    const label = !nxt ? null : done === n ? `Start again: ${nxt.title}` : `${done ? 'Continue' : proj ? 'Start building' : 'Start'}: ${nxt.title}`;
    const builds = proj && t.builds ? h('section', { class: 'builds', 'aria-labelledby': 'builds-h' },
      h('h2', { id: 'builds-h' }, 'What you’ll build'),
      h('p', {}, t.builds),
      reqs(t).length ? h('p', { class: 'builds-uses' }, h('span', { class: 'builds-k' }, 'Builds on'),
        reqs(t).map(r => h('a', { href: '#' + r.id, class: 'xlink', style: `--hue:${hue(r)}` }, h('span', { class: 'xring', 'aria-hidden': 'true' }), r.title))) : null) : null;
    wrap.append(
      crumbs([['Map', '#home'], [t.title]]),
      h('header', { class: 'lesson-head track-head' },
        h('p', { class: 'eyebrow' }, h('span', { class: 'line-swatch', 'aria-hidden': 'true' }), proj ? `Capstone project · ${t.group || 'Project'} · ${n} steps` : `${t.group || 'Track'} · ${n} lessons`),
        h('h1', {}, t.title),
        h('p', { class: 'lede' }, t.description),
        progressBar(done, n),
        softNote(t),
        nxt ? h('div', { class: 'actions' }, h('a', { class: 'btn primary', href: '#' + key(t, nxt) }, label, ' →')) : null),
      builds,
      h('section', { class: 'track-lessons', 'aria-label': proj ? 'Steps' : 'Lessons' },
        proj ? h('h2', { class: 'steps-h' }, 'The steps') : levelFilter(wrap, t.lessons, syncEmpty),
        h('ol', { class: 'tline' }, t.lessons.map((l, j) => {
          const k = key(t, l), d = state.done[k], at = state.last === k;
          return h('li', { class: [d && 'done', at && 'here'].filter(Boolean).join(' ') || null, 'data-level': l.level || null },
            h('a', { href: '#' + k },
              h('span', { class: ['mdot', d && 'done', at && 'here'].filter(Boolean).join(' '), 'aria-hidden': 'true' }),
              h('span', { class: 'tbody' },
                h('span', { class: 'tnum' }, `${proj ? 'Step ' : ''}${String(j + 1).padStart(2, '0')}${d ? ' · done' : ''}${at ? ' · you are here' : ''}`),
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
    const idx = t.lessons.indexOf(l), proj = isProject(t);
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
        quiz.append(h('div', { class: 'done-note drop-in' }, proj ? 'Step complete.' : 'Lesson complete.',
          next ? h('a', { class: 'btn primary small', href: '#' + key(t, next) }, `Next: ${next.title} →`) : h('a', { class: 'btn small', href: '#' + t.id }, `Back to ${t.title}`)));
      })));

    const bench = h('section', { class: 'bench', 'aria-label': 'Interactive demo' },
      h('div', { class: 'bench-head' }, h('span', { class: 'bench-label' }, 'Try it'), h('button', { class: 'btn small', onclick: resetViz }, 'Reset')),
      viz);
    const snippet = code(l.code);
    const pin = h('aside', { class: 'pin' }, h('span', { class: 'pin-label' }, 'Pin this'), h('p', {}, l.remember));
    const practice = l.challenges && l.challenges.length ? h('section', { class: 'quiz' }, h('h2', {}, 'Practice'), l.challenges.map(challengeView)) : null;
    // Optional depth: l.deeper = [{ title, body, code?, visual? }], l.underHood = { body, code? }, l.mistakes = [{ title, bad, good, why }]
    const deeper = l.deeper && l.deeper.length ? h('section', { class: 'deeper' },
      h('h2', {}, 'Go deeper'),
      h('ol', { class: 'steps' }, l.deeper.map((d, i) => {
        const v = d.visual && h('div', { class: 'viz' });
        const li = h('li', { class: 'step' },
          h('h3', {}, h('span', { class: 'step-n', 'aria-hidden': 'true' }, String(i + 1)), d.title),
          h('div', { class: 'prose', html: d.body }),
          v && h('div', { class: 'bench mini' },
            h('div', { class: 'bench-head' }, h('span', { class: 'bench-label' }, 'Try it'), h('button', { class: 'btn small', onclick() { v.replaceChildren(); d.visual(v); } }, 'Reset')), v),
          d.code ? code(d.code) : null);
        if (v) d.visual(v);
        return li;
      }))) : null;
    const hood = l.underHood ? h('details', { class: 'hood' },
      h('summary', {}, h('span', { class: 'hood-label' }, 'Under the hood'), h('span', { class: 'muted-text' }, 'What the compiler or runtime actually does')),
      h('div', { class: 'prose', html: l.underHood.body }), l.underHood.code ? code(l.underHood.code) : null) : null;
    const mistakes = l.mistakes && l.mistakes.length ? h('section', { class: 'mistakes' },
      h('h2', {}, 'Common mistakes'),
      l.mistakes.map(m => h('div', { class: 'mistake' },
        h('h3', {}, m.title),
        h('div', { class: 'ba' },
          h('div', { class: 'ba-bad' }, h('span', { class: 'ba-tag' }, 'Before'), code(m.bad)),
          h('div', { class: 'ba-good' }, h('span', { class: 'ba-tag' }, 'After'), code(m.good))),
        h('p', { class: 'why', html: m.why })))) : null;
    const terms = l.terms && l.terms.length ? h('section', { class: 'terms' }, h('h2', {}, 'Terms'), h('dl', {}, l.terms.map(x => [h('dt', {}, x.term), h('dd', {}, x.def)]))) : null;
    const sections = [['Demo', bench], ['Code', snippet], ['Pin', pin], ['Go deeper', deeper], ['Under the hood', hood], ['Mistakes', mistakes], ['Practice', practice], ['Terms', terms], ['Check yourself', quiz]].filter(([, el]) => el);
    const toc = h('nav', { class: 'toc', 'aria-label': 'On this page' }, h('span', { class: 'toc-label' }, 'On this page'),
      sections.map(([label, el]) => h('button', { type: 'button', onclick() {
        el.setAttribute('tabindex', '-1');
        el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
      } }, label)));

    const page = h('div', { class: 'wrap lesson-page', style: `--hue:${hue(t)}` },
      h('nav', { class: 'side', 'aria-label': `${t.title} ${proj ? 'steps' : 'lessons'}` }, h('a', { class: 'side-track', href: '#' + t.id }, h('span', { class: 'line-swatch', 'aria-hidden': 'true' }), t.title), h('ol', {}, items)),
      h('article', { class: 'lesson' },
        crumbs([['Map', '#home'], [t.title, '#' + t.id], [l.title]]),
        state.hide[t.id] ? null : softNote(t, () => { state.hide[t.id] = true; save(); }),
        h('header', { class: 'lesson-head' },
          h('p', { class: 'eyebrow lesson-eyebrow' }, `${proj ? 'Step' : 'Lesson'} ${idx + 1} of ${t.lessons.length}`, levelBadge(l)),
          h('h1', {}, l.title),
          h('p', { class: 'lede' }, l.tagline)),
        reviewFirst(l),
        toc,
        h('div', { class: 'prose', html: l.body }),
        bench, snippet, pin, deeper, hood, mistakes, practice, terms, quiz,
        h('nav', { class: 'pager', 'aria-label': 'Lesson navigation' },
          prev && h('a', { href: '#' + key(t, prev) }, h('small', {}, '← Previous'), prev.title),
          next && h('a', { class: 'next', href: '#' + key(t, next) }, h('small', {}, 'Next →'), next.title))));
    l.visual(viz);
    return page;
  }

  // Project steps: compact links to the lessons a step applies. Ids that don't resolve are skipped.
  function reviewFirst(l) {
    const refs = (Array.isArray(l.refs) ? l.refs : []).map(lessonRef).filter(Boolean);
    if (!refs.length) return null;
    return h('nav', { class: 'refs', 'aria-label': 'Review first' }, h('span', { class: 'refs-label' }, 'Review first'),
      h('ul', {}, refs.map(({ t, l: x }) => h('li', {}, h('a', { href: '#' + key(t, x), class: 'xlink', style: `--hue:${hue(t)}`, title: `${t.title} · ${x.title}` },
        h('span', { class: 'xring', 'aria-hidden': 'true' }), x.title, state.done[key(t, x)] ? h('span', { class: 'vh' }, ' (done)') : null)))));
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
      const proj = isProject(t);
      const s = score(t.title, `${t.id} ${t.group || ''} ${t.description || ''} ${t.builds || ''} ${proj ? 'project capstone' : ''}`);
      if (s) hits.push({ s: s + 2 + (words.includes(t.id) ? 4 : 0), href: '#' + t.id, title: t.title, sub: proj ? `Capstone project · ${t.lessons.length} steps` : `Track · ${t.lessons.length} lessons` });
      for (const l of t.lessons) {
        const s2 = score(l.title, `${t.title} ${l.tagline} ${l.remember} ${(l.terms || []).map(x => x.term).join(' ')}`);
        if (s2) hits.push({ s: s2 + 1, href: '#' + key(t, l), title: l.title, sub: `${proj ? 'Step' : 'Lesson'} · ${t.title}` });
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
    // Browser chrome follows a forced theme too; 'system' restores the media-matched pair from index.html.
    document.querySelectorAll('meta[name="theme-color"]').forEach(x => {
      if (!x.dataset.c) x.dataset.c = x.content;
      x.content = m === 'system' ? x.dataset.c : m === 'dark' ? '#0B130F' : '#F4F8F5';
    });
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
  const SHORTCUTS = [['←  →', 'Previous / next lesson'], ['/', 'Search'], ['m', 'Map'], ['r', 'Review'], ['i', 'Interview practice'], ['g', 'Glossary'], ['t', 'Light / dark theme'], ['1  –  4', 'Answer (interview)'], ['Enter', 'Next question (interview)'], ['?', 'This list']];
  let keysDialog;
  function showKeys() {
    if (!keysDialog) {
      keysDialog = h('dialog', { class: 'keys', 'aria-labelledby': 'keys-h', onclick(e) { if (e.target === keysDialog) keysDialog.close(); } },
        h('div', { class: 'keys-in' },
          h('div', { class: 'keys-head' }, h('h2', { id: 'keys-h' }, 'Keyboard shortcuts'), h('button', { class: 'btn small ghost', onclick: () => keysDialog.close() }, 'Close')),
          h('dl', {}, SHORTCUTS.map(([k, what]) => [h('dt', {}, k.split(/\s+/).map(x => x === '–' ? h('span', { 'aria-hidden': 'true' }, '–') : h('kbd', {}, x))), h('dd', {}, what)])),
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
    if (here.onKey && here.onKey(e)) { e.preventDefault(); return; }
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
      case 'i': go('#interview'); break;
      case 't': e.preventDefault(); flipVisible(); break;
      case '?': e.preventDefault(); showKeys(); break;
      default:
    }
  }

  // ---------- interview mode ----------
  // Timed, mixed-topic practice from every lesson quiz. Options keep their order, so q.a always stays valid.
  // Nothing touches the review schedule unless the learner presses "Add missed to Review".
  const IV_PRESETS = [
    { label: 'Android interview', tracks: ['kotlin', 'android', 'compose', 'coroutines', 'flow', 'arch'] },
    { label: 'Kotlin only', tracks: ['kotlin', 'kdeep'] },
    { label: 'Everything', tracks: null },
  ];
  const IV_COUNTS = [10, 20, 30], IV_TIMES = [0, 30, 60];
  const presetTracks = p => (p.tracks ? p.tracks.filter(trackById) : tracks.map(t => t.id));
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
  const presetOf = ids => IV_PRESETS.find(p => presetTracks(p).length && sameSet(presetTracks(p), ids));
  const poolFor = ids => allCards().filter(c => ids.includes(c.t.id));
  const setupKey = su => `${[...su.tracks].sort().join(',')}|${su.n}|${su.secs}`;
  function setupLabel(su) {
    const p = presetOf(su.tracks);
    return `${p ? p.label : `${su.tracks.length} topic${su.tracks.length > 1 ? 's' : ''}`} · ${su.n} questions · ${su.secs ? `${su.secs} s each` : 'untimed'}`;
  }
  function shuffle(xs) {
    const a = xs.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const clock = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const ivScore = r => `${r.right} / ${r.total}`;
  const beats = (a, b) => !b || a.right / a.total > b.right / b.total || (a.right / a.total === b.right / b.total && a.ms < b.ms);

  function interviewView() {
    const root = h('div', { class: 'wrap iv' });
    let run = null, keys = null; // keys: what 1-9 / Enter do right now
    here.onKey = e => {
      if (!keys) return false;
      if (keys.answer && /^[1-9]$/.test(e.key)) return keys.answer(+e.key - 1);
      const tag = document.activeElement && document.activeElement.tagName;
      if (keys.next && e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'A') { keys.next(); return true; }
      return false;
    };
    const paint = (...kids) => {
      clearInterval(ivTimer);
      root.replaceChildren(...kids.filter(Boolean));
      window.scrollTo(0, 0);
      const f = root.querySelector('[data-focus]');
      if (f) f.focus({ preventScroll: true });
    };

    function setup() {
      keys = null;
      const saved = state.iv.setup || {};
      const savedIds = Array.isArray(saved.tracks) ? saved.tracks.filter(trackById) : [];
      let sel = new Set(savedIds.length ? savedIds : tracks.map(t => t.id));
      let n = IV_COUNTS.includes(saved.n) ? saved.n : 10, secs = IV_TIMES.includes(saved.secs) ? saved.secs : 0;
      const counts = {};
      for (const c of allCards()) counts[c.t.id] = (counts[c.t.id] || 0) + 1;

      const presets = IV_PRESETS.filter(p => presetTracks(p).length).map(p => h('button', { type: 'button', class: 'iv-chip', 'aria-pressed': 'false', onclick() { sel = new Set(presetTracks(p)); sync(); } }, p.label));
      const boxes = tracks.filter(t => counts[t.id]).map(t => {
        const input = h('input', { type: 'checkbox', value: t.id, onchange() { if (input.checked) sel.add(t.id); else sel.delete(t.id); sync(); } });
        return h('label', { class: 'iv-track' + (isProject(t) ? ' project' : ''), style: `--hue:${hue(t)}` }, input,
          h('span', { class: 'iv-track-in' }, h('span', { class: 'xring', 'aria-hidden': 'true' }), h('span', { class: 'iv-track-t' }, t.title),
            isProject(t) ? h('span', { class: 'vh' }, ', capstone') : null, h('span', { class: 'iv-n' }, h('span', { class: 'vh' }, ', '), counts[t.id], h('span', { class: 'vh' }, ' questions'))));
      });
      const seg = (name, vals, label, get, set) => h('div', { class: 'iv-seg' }, vals.map(v => h('label', {},
        h('input', { type: 'radio', name, value: v, checked: get() === v, onchange() { set(v); sync(); } }), h('span', {}, label(v)))));
      const note = h('p', { class: 'iv-pool', 'aria-live': 'polite' });
      const best = h('p', { class: 'iv-best' });
      const go = h('button', { class: 'btn primary', type: 'button', onclick() {
        const su = { tracks: tracks.map(t => t.id).filter(id => sel.has(id)), n, secs };
        state.iv.setup = su; save();
        start(su, shuffle(poolFor(su.tracks)).slice(0, n));
      } }, 'Start practice →');
      function sync() {
        const ids = [...sel], pool = poolFor(ids).length;
        boxes.forEach(b => { const i = b.querySelector('input'); i.checked = sel.has(i.value); });
        presets.forEach((b, i) => b.setAttribute('aria-pressed', String(sameSet(presetTracks(IV_PRESETS[i]), ids))));
        note.textContent = !ids.length ? 'Pick at least one topic.' : pool < n ? `These topics hold ${pool} question${pool > 1 ? 's' : ''}, so you get all of them.` : `${n} of ${pool} questions, drawn at random.`;
        go.disabled = !pool;
        const b = ids.length && state.iv.best && state.iv.best[setupKey({ tracks: ids, n, secs })];
        best.textContent = b ? `Best for this setup: ${ivScore(b)} in ${clock(b.ms)}` : '';
        best.hidden = !b;
      }
      const hist = (state.iv.history || []).slice(0, 6);
      paint(
        h('header', { class: 'lesson-head' },
          h('p', { class: 'eyebrow' }, 'Interview practice'),
          h('h1', { tabindex: '-1', 'data-focus': '' }, 'Practice like it’s the real thing'),
          h('p', { class: 'lede' }, 'Mixed questions from every lesson quiz, one at a time, optionally against the clock. Your review schedule is left alone unless you add the misses at the end.')),
        h('section', { class: 'iv-card', 'aria-label': 'Setup' },
          h('fieldset', { class: 'iv-field' }, h('legend', {}, 'Start from a preset'), h('div', { class: 'iv-chips' }, presets)),
          h('fieldset', { class: 'iv-field' },
            h('legend', {}, 'Topics'),
            h('div', { class: 'iv-tracks' }, boxes),
            h('div', { class: 'iv-mini' },
              h('button', { type: 'button', class: 'btn small ghost', onclick() { sel = new Set(tracks.map(t => t.id)); sync(); } }, 'Select all'),
              h('button', { type: 'button', class: 'btn small ghost', onclick() { sel = new Set(); sync(); } }, 'Clear'))),
          h('div', { class: 'iv-row' },
            h('fieldset', { class: 'iv-field' }, h('legend', {}, 'Questions'), seg('iv-n', IV_COUNTS, String, () => n, v => { n = v; })),
            h('fieldset', { class: 'iv-field' }, h('legend', {}, 'Time per question'), seg('iv-secs', IV_TIMES, v => (v ? `${v} s` : 'No limit'), () => secs, v => { secs = v; }))),
          h('div', { class: 'iv-go' }, h('div', { class: 'iv-go-text' }, note, best), go)),
        hist.length ? h('section', { class: 'iv-hist', 'aria-labelledby': 'iv-hist-h' },
          h('h2', { id: 'iv-hist-h' }, 'Recent runs'),
          h('ol', {}, hist.map(r => {
            const b = state.iv.best && state.iv.best[r.key];
            const top = b && b.at === r.at;
            return h('li', {}, h('span', { class: 'iv-hist-score' }, ivScore(r)), h('span', { class: 'iv-hist-label' }, r.label),
              h('span', { class: 'iv-hist-meta' }, clock(r.ms), top ? h('span', { class: 'iv-tag' }, 'Best') : null));
          }))) : null);
      sync();
    }

    function start(su, qs) {
      run = { su, qs, i: 0, answers: [] };
      question();
    }

    function question() {
      const c = run.qs[run.i], q = c.q, total = run.qs.length, secs = run.su.secs;
      const shownAt = Date.now();
      let answered = false;
      const why = h('p', { class: 'why', hidden: true });
      const last = run.i + 1 === total;
      const next = h('button', { class: 'btn primary', type: 'button', hidden: true, onclick: advance }, last ? 'See results' : 'Next question', ' →');
      const opts = q.options.map((o, j) => h('button', { class: 'opt iv-opt', type: 'button', onclick: () => answer(j) },
        h('kbd', { 'aria-hidden': 'true' }, String(j + 1)), h('span', { html: o })));
      const box = h('div', { class: 'q iv-q' },
        h('p', { class: 'eyebrow', style: `--hue:${hue(c.t)}` }, h('span', { class: 'line-swatch', 'aria-hidden': 'true' }), c.t.title),
        h('p', { class: 'q-text', html: q.q, tabindex: '-1', 'data-focus': '' }),
        h('div', { class: 'opts', role: 'group', 'aria-label': 'Answers' }, opts), why);

      let ring = null, tick = null;
      if (secs) {
        const C = 2 * Math.PI * 20, ms = secs * 1000, deadline = shownAt + ms;
        ring = h('div', { class: 'iv-ring', role: 'timer', 'aria-label': `${secs} seconds left`,
          html: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="iv-ring-bg" cx="24" cy="24" r="20"/><circle class="iv-ring-fg" cx="24" cy="24" r="20" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="0"/></svg><span aria-hidden="true">${secs}</span>` });
        const fg = ring.querySelector('.iv-ring-fg'), num = ring.querySelector('span');
        let shown = secs;
        tick = () => {
          const left = Math.max(0, deadline - Date.now()), s = Math.ceil(left / 1000);
          fg.setAttribute('stroke-dashoffset', (C * (1 - left / ms)).toFixed(2));
          if (s !== shown) { shown = s; num.textContent = s; ring.setAttribute('aria-label', `${s} second${s === 1 ? '' : 's'} left`); }
          ring.classList.toggle('low', left <= 5000);
          if (!left) answer(-1);
        };
      }

      function answer(j) {
        if (answered || j >= opts.length) return false;
        answered = true; clearInterval(ivTimer);
        const ok = j === q.a;
        run.answers.push({ pick: j, ok, ms: Math.min(Date.now() - shownAt, secs ? secs * 1000 : Infinity) });
        box.dataset.answered = '1';
        if (j >= 0) opts[j].classList.add(ok ? 'right' : 'wrong');
        if (opts[q.a]) opts[q.a].classList.add('right');
        opts.forEach(b => b.setAttribute('aria-disabled', 'true'));
        if (ring) ring.classList.add(j < 0 ? 'out' : 'stopped');
        why.innerHTML = `<b>${j < 0 ? 'Time’s up.' : ok ? 'Right.' : 'Not quite.'}</b> ${q.why || ''}`;
        why.hidden = false;
        status.textContent = j < 0 ? 'Time’s up.' : ok ? 'Right.' : 'Not quite.';
        next.hidden = false; next.focus({ preventScroll: true });
        next.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' });
        keys = { next: advance };
        return true;
      }
      function advance() {
        if (!answered) return;
        run.i++;
        if (run.i < run.qs.length) question(); else results();
      }
      const status = h('p', { class: 'vh', role: 'status' });
      keys = { answer };
      paint(
        h('div', { class: 'iv-top' },
          h('p', { class: 'eyebrow' }, 'Interview · ', setupLabel(run.su)),
          h('button', { class: 'btn small ghost', type: 'button', onclick: setup }, 'Quit')),
        h('div', { class: 'iv-bar' },
          h('span', { class: 'iv-count', 'aria-label': `Question ${run.i + 1} of ${total}` }, `${run.i + 1} / ${total}`),
          h('div', { class: 'meter', 'aria-hidden': 'true' }, h('span', { style: `width:${(run.i / total) * 100}%` })),
          ring),
        box,
        h('div', { class: 'iv-next' }, next,
          h('p', { class: 'iv-hint' }, h('kbd', {}, '1'), '–', h('kbd', {}, String(opts.length)), ' answer', h('span', { 'aria-hidden': 'true' }, ' · '), h('kbd', {}, 'Enter'), ' next')),
        status);
      if (tick) ivTimer = setInterval(tick, 100);
    }

    function results() {
      keys = null;
      const { su, qs, answers } = run;
      const total = qs.length, right = answers.filter(a => a.ok).length, ms = answers.reduce((s, a) => s + a.ms, 0);
      const k = setupKey(su), prev = state.iv.best && state.iv.best[k];
      const rec = { key: k, label: setupLabel(su), right, total, ms, at: Date.now() };
      const isBest = beats(rec, prev);
      state.iv.best = { ...(state.iv.best || {}), [k]: isBest ? rec : prev };
      state.iv.history = [rec, ...(state.iv.history || [])].slice(0, 12);
      save();

      const byTrack = new Map();
      qs.forEach((c, i) => {
        const r = byTrack.get(c.t) || { right: 0, total: 0 };
        r.total++; r.right += answers[i].ok ? 1 : 0; byTrack.set(c.t, r);
      });
      const missed = qs.map((c, i) => ({ c, a: answers[i] })).filter(x => !x.a.ok);
      const added = h('p', { class: 'iv-added', role: 'status' });
      const addBtn = missed.length ? h('button', { class: 'btn primary', type: 'button', onclick() {
        const now = Date.now();
        // Same shape the schedule produces after a miss (box 1), but due now instead of tomorrow.
        missed.forEach(({ c }) => { state.cards[c.id] = { ...schedule(state.cards[c.id], false, now), due: now }; });
        save(); updateNav('interview');
        addBtn.disabled = true; addBtn.textContent = 'Added to Review';
        added.replaceChildren(`${missed.length} card${missed.length > 1 ? 's are' : ' is'} due now. `, h('a', { href: '#review' }, 'Open Review →'));
      } }, `Add ${missed.length} missed to Review`) : null;
      const pct = Math.round((right / total) * 100);
      paint(
        h('header', { class: 'lesson-head' },
          h('p', { class: 'eyebrow' }, 'Interview results · ', rec.label),
          h('h1', { tabindex: '-1', 'data-focus': '' }, `${right} of ${total} right`),
          h('p', { class: 'lede' }, `${pct}% in ${clock(ms)} of answering, about ${(ms / total / 1000).toFixed(ms / total < 10000 ? 1 : 0)} s per question.`),
          h('p', { class: 'iv-best' }, isBest ? h('span', { class: 'iv-tag' }, prev ? 'New best' : 'First run') : `Best for this setup: ${ivScore(prev)} in ${clock(prev.ms)}`)),
        h('div', { class: 'actions' },
          addBtn,
          h('button', { class: 'btn' + (missed.length ? '' : ' primary'), type: 'button', onclick: () => start(su, shuffle(qs)) }, 'Try again'),
          h('button', { class: 'btn', type: 'button', onclick: setup }, 'New setup')),
        added,
        h('section', { class: 'iv-card', 'aria-labelledby': 'iv-by-h' },
          h('h2', { id: 'iv-by-h' }, 'By topic'),
          h('ul', { class: 'iv-bars' }, [...byTrack].sort((a, b) => tracks.indexOf(a[0]) - tracks.indexOf(b[0])).map(([t, r]) =>
            h('li', { style: `--hue:${hue(t)}` },
              h('a', { href: '#' + t.id, class: 'iv-bars-t' }, t.title),
              h('span', { class: 'iv-bars-m', 'aria-hidden': 'true' }, h('span', { style: `width:${(r.right / r.total) * 100}%` })),
              h('span', { class: 'iv-bars-n' }, `${r.right} / ${r.total}`, h('span', { class: 'vh' }, ' right')))))),
        h('section', { class: 'iv-missed', 'aria-labelledby': 'iv-miss-h' },
          h('h2', { id: 'iv-miss-h' }, missed.length ? `Missed (${missed.length})` : 'Nothing missed'),
          missed.length ? h('ol', {}, missed.map(({ c, a }) => h('li', { class: 'q', style: `--hue:${hue(c.t)}` },
            h('p', { class: 'eyebrow' }, h('span', { class: 'line-swatch', 'aria-hidden': 'true' }), `${c.t.title} · ${c.l.title}`),
            h('p', { class: 'q-text', html: c.q.q }),
            h('dl', { class: 'iv-ans' },
              h('dt', {}, 'Yours'), h('dd', { class: 'bad-ans', html: a.pick < 0 ? 'No answer in time' : c.q.options[a.pick] }),
              h('dt', {}, 'Right'), h('dd', { class: 'good-ans', html: c.q.options[c.q.a] })),
            h('p', { class: 'why', html: c.q.why || '' }),
            h('a', { href: '#' + key(c.t, c.l), class: 'iv-open' }, `Open lesson: ${c.l.title} →`))))
            : h('p', { class: 'muted-text' }, 'A clean run. Try a longer set or a tighter timer.')));
    }

    setup();
    return root;
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
    // Offline support, only when served over http(s); file:// can't register a service worker.
    try {
      if (/^https?:$/.test(location.protocol) && 'serviceWorker' in navigator) {
        addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
      }
    } catch (e) { /* no offline mode */ }
  }

  // A track may carry its own demo styles as a CSS string in t.css.
  function addTrack(t) { tracks.push(t); if (t.css && typeof document !== 'undefined') document.head.append(h('style', {}, t.css)); }

  return { addTrack, start, schedule, h, sleep, hl, code, replay, swap };
})();

if (typeof module !== 'undefined') module.exports = Lab;
else document.addEventListener('DOMContentLoaded', Lab.start);
