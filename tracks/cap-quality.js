/* Capstone: Production quality pass on the News Reader app (track id capquality).
   Picks up the offline-first News Reader from the capapp project (NewsRepository, OfflineFirstNewsRepository,
   NewsViewModel, NewsUiState, ArticleListScreen, NewsNavHost, ArticleDao, NewsApi, Hilt) and takes it to
   production quality one measured step at a time. Every demo shares one look: a phone mock of the app,
   a quality dashboard that fills in and improves step by step, and a strip of the parts touched in that step.
   All classes are prefixed cq-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const reduce = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
.cq-top { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; justify-content: center; min-width: 0; }
.cq-side { flex: 1 1 260px; min-width: 0; display: grid; gap: 10px; align-content: start; }
.cq-cap { margin: 0; font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.cq-seg { display: inline-flex; flex-wrap: wrap; justify-self: start; gap: 2px; padding: 3px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg); max-width: 100%; }
.cq-seg button { font: 600 0.8rem var(--body); min-height: 32px; padding: 4px 12px; border: 0; border-radius: 999px; background: none; color: var(--muted); cursor: pointer; }
.cq-seg button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }
.cq-seg button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.cq-dash { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.cq-tile { min-width: 0; display: grid; gap: 3px; padding: 7px 8px; border-radius: 10px; background: var(--bg); border: 1.5px solid var(--line); transition: border-color 0.3s, box-shadow 0.3s; }
.cq-tile span { font: 600 0.6rem var(--mono); text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cq-tile b { font: 700 0.95rem var(--mono); color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cq-tile.cq-ok b { color: var(--accent); }
.cq-tile.cq-warn b { color: var(--warm); }
.cq-tile.cq-bad b { color: var(--err); }
.cq-tile.cq-na b { color: var(--muted); font-weight: 500; }
.cq-tile.cq-hot { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.cq-m { height: 4px; border-radius: 2px; background: var(--sunk); overflow: hidden; }
.cq-m i { display: block; height: 100%; width: 0; background: var(--muted); transition: width 0.3s; }
.cq-ok .cq-m i { background: var(--accent); }
.cq-warn .cq-m i { background: var(--warm); }
.cq-bad .cq-m i { background: var(--err); }
.cq-parts { display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; }
.cq-part { font: 600 0.64rem var(--mono); padding: 3px 7px; border-radius: 6px; background: var(--sunk); color: var(--muted); border: 1px solid transparent; }
.cq-part.on { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }

.cq-phone { --cq-fs: 1; position: relative; flex: none; width: 196px; height: 356px; border-radius: 26px; border: 7px solid var(--code-bg); background: var(--surface); color: var(--ink); overflow: hidden; display: flex; flex-direction: column; transition: width 0.4s ease, height 0.4s ease, border-radius 0.4s; box-shadow: var(--shadow); }
.cq-phone[data-size="medium"] { width: 272px; }
.cq-phone[data-size="expanded"] { width: min(100%, 460px); height: 286px; border-radius: 18px; }
.cq-phone.cq-spin { animation: cq-spin 0.7s ease-in-out; }
@keyframes cq-spin { 50% { transform: rotate(90deg) scale(0.72); } }
.cq-bar { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 9px 12px 7px; font: 800 0.95rem var(--display); background: var(--surface); }
.cq-bar-r { display: flex; gap: 6px; align-items: center; }
.cq-rf { display: none; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: var(--ink); }
.cq-rf svg { width: 13px; height: 13px; }
.cq-phone.cq-hasrf .cq-rf { display: grid; }
.cq-pull { position: absolute; z-index: 2; top: 6px; left: 50%; width: 24px; height: 24px; margin-left: -12px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; animation: drop-in 0.3s; }
.cq-pull i { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.cq-banner { display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 5px 12px; background: var(--warm-soft); color: var(--warm); font: 600 calc(0.64rem * var(--cq-fs)) var(--body); }
.cq-snack { position: absolute; z-index: 2; left: 8px; right: 8px; bottom: 8px; padding: 7px 9px; border-radius: 6px; background: var(--code-bg); color: var(--code-ink); font: 500 0.6rem/1.3 var(--body); animation: drop-in 0.3s; }
.cq-body { position: relative; flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr); }
.cq-phone.cq-two .cq-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); }
.cq-pane { min-width: 0; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.cq-phone.cq-two .cq-detail { border-left: 1px solid var(--line); }
.cq-list { display: grid; gap: 5px; padding: 4px 8px 8px; align-content: start; transition: transform 0.25s ease; }
.cq-row { position: relative; display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; gap: 7px; align-items: center; padding: 6px 7px; min-height: 40px; border-radius: 9px; background: var(--sunk); }
.cq-phone.cq-fixed .cq-row { height: 44px; min-height: 0; overflow: hidden; }
.cq-phone.cq-tap .cq-row { cursor: pointer; }
.cq-row.cq-sel { box-shadow: inset 0 0 0 2px var(--accent); }
.cq-thumb { width: 24px; height: 24px; border-radius: 6px; background: var(--accent-soft); }
.cq-txt { min-width: 0; display: grid; gap: 1px; }
.cq-title { font: 700 calc(0.64rem * var(--cq-fs))/1.25 var(--body); overflow-wrap: break-word; }
.cq-phone.cq-two .cq-row { grid-template-columns: minmax(0, 1fr) auto; }
.cq-phone.cq-two .cq-thumb { display: none; }
.cq-meta { font: 400 calc(0.56rem * var(--cq-fs))/1.25 var(--body); color: var(--muted); }
.cq-phone.cq-lowc .cq-row .cq-meta { opacity: 0.45; }
.cq-bm { position: relative; display: none; place-items: center; width: 16px; height: 16px; border-radius: 6px; color: var(--muted); transition: width 0.25s, height 0.25s; }
.cq-phone.cq-bmk .cq-bm { display: grid; }
.cq-bm svg { width: 10px; height: 12px; }
.cq-bm.on { color: var(--accent); }
.cq-bm.on path { fill: currentColor; }
.cq-phone.cq-big .cq-bm { width: 28px; height: 28px; }
.cq-phone.cq-tgt .cq-bm { outline: 1.5px dashed var(--warm); outline-offset: 0; }
.cq-rc { display: none; position: absolute; top: -6px; left: -4px; font: 700 0.56rem var(--mono); padding: 1px 5px; border-radius: 999px; background: var(--code-bg); color: var(--code-ink); }
.cq-phone.cq-insp .cq-rc { display: block; }
.cq-rc.cq-scr { position: static; }
.cq-rc.hot { background: var(--err); color: var(--surface); }
.cq-row.cq-flash { animation: cq-flash 0.6s ease-out; }
@keyframes cq-flash { from { box-shadow: 0 0 0 3px var(--warm); } to { box-shadow: 0 0 0 3px transparent; } }
.cq-fab { position: absolute; right: 10px; bottom: 10px; width: 28px; height: 28px; border-radius: 9px; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; font: 700 0.8rem var(--mono); }
.cq-detail-in { padding: 10px 12px; display: grid; gap: 6px; align-content: start; }
.cq-back { font: 700 0.68rem var(--body); color: var(--accent); }
.cq-dtitle { font: 800 calc(0.8rem * var(--cq-fs))/1.25 var(--display); }
.cq-hero { height: 50px; border-radius: 8px; background: var(--accent-soft); }
.cq-ln { height: 6px; border-radius: 3px; background: var(--sunk); }
.cq-empty { margin: auto; padding: 10px; color: var(--muted); font: 600 0.7rem var(--body); text-align: center; }
.cq-cover { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; align-content: center; gap: 8px; padding: 14px; background: var(--surface); text-align: center; font: 500 0.7rem/1.35 var(--body); }
.cq-cover b { color: var(--accent); font-weight: 700; }
.cq-logo { width: 46px; height: 46px; border-radius: 14px; background: var(--accent); animation: pop 0.4s; }
.cq-hit { outline: 2.5px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
.cq-focus { outline: 3px solid var(--ok); outline-offset: 1px; border-radius: 6px; }
.cq-issue { position: relative; outline: 2px dashed var(--err); outline-offset: 1px; }
.cq-issue::after { content: attr(data-n); position: absolute; top: 1px; left: 1px; z-index: 3; min-width: 15px; height: 15px; padding: 0 3px; border-radius: 999px; background: var(--err); color: var(--surface); font: 700 0.58rem/15px var(--mono); text-align: center; }

.cq-tests, .cq-script { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); font: 500 0.72rem/1.55 var(--mono); overflow-x: auto; min-width: 0; }
.cq-t { display: flex; gap: 8px; align-items: center; white-space: nowrap; transition: opacity 0.2s; }
.cq-t.cq-off { opacity: 0.35; text-decoration: line-through; }
.cq-dot { flex: none; width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
.cq-dot.run { background: var(--t-s); animation: pulse 0.6s infinite; }
.cq-dot.pass { background: var(--t-k); }
.cq-dot.fail { background: var(--t-e); }
.cq-tsum { margin-top: 4px; color: var(--t-c); white-space: nowrap; }
.cq-sl { white-space: pre; padding: 0 6px; border-radius: 5px; transition: background 0.2s; }
.cq-sl.on { background: rgba(126, 226, 168, 0.16); }
.cq-sl.ok { color: var(--t-k); }
.cq-sl.bad { background: rgba(255, 138, 155, 0.2); }
.cq-queue { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 44px; padding: 7px; border-radius: 10px; border: 1.5px dashed var(--line); background: var(--bg); min-width: 0; }
.cq-ev { font: 600 0.7rem var(--mono); padding: 4px 8px; border-radius: 8px; border: 1.5px solid var(--accent); background: var(--surface); color: var(--ink); }
.cq-ev.cq-odd { border-color: var(--warm); color: var(--warm); }
.cq-hist { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; min-height: 28px; }
.cq-hist .cq-ev { border-style: dashed; }
.cq-hist .cq-ev.ok { border-style: solid; background: var(--accent-soft); color: var(--accent); }
.cq-hist .cq-ev.miss { border-color: var(--line); color: var(--muted); text-decoration: line-through; }
.cq-tree { display: grid; gap: 1px; padding: 8px; border-radius: 10px; background: var(--bg); font: 500 0.68rem/1.5 var(--mono); overflow-x: auto; min-width: 0; }
.cq-node { white-space: nowrap; padding: 0 6px; border-radius: 5px; color: var(--ink); }
.cq-node.dim { color: var(--muted); }
.cq-node.cq-hit { outline: none; background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.cq-frames { position: relative; height: 74px; display: flex; align-items: flex-end; gap: 2px; padding: 6px 6px 0; border-radius: 10px; background: var(--bg); overflow: hidden; min-width: 0; }
.cq-fr { flex: 1 1 0; min-width: 2px; border-radius: 2px 2px 0 0; background: var(--accent); transition: height 0.15s; }
.cq-fr.slow { background: var(--err); }
.cq-budget { position: absolute; z-index: 1; left: 0; right: 0; border-top: 1.5px dashed var(--warm); }
.cq-budget span { position: absolute; right: 6px; top: -17px; padding: 0 4px; border-radius: 4px; background: var(--bg); font: 600 0.6rem var(--mono); color: var(--warm); }
.cq-heap { display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; min-height: 64px; padding: 8px; border-radius: 10px; background: var(--bg); min-width: 0; }
.cq-act { display: grid; gap: 1px; font: 600 0.66rem var(--mono); padding: 5px 7px; border-radius: 8px; border: 1.5px solid var(--accent); background: var(--surface); color: var(--ink); }
.cq-act small { font: 500 0.58rem var(--mono); color: var(--muted); }
.cq-act.dead { border-style: dashed; border-color: var(--muted); color: var(--muted); }
.cq-act.leak { border-style: dashed; border-color: var(--err); background: var(--err-soft); color: var(--err); }
.cq-act.mon { border-color: var(--warm); }
.cq-scale { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cq-iters { display: flex; flex-wrap: wrap; gap: 4px; min-height: 22px; }
.cq-it { font: 600 0.64rem var(--mono); padding: 2px 6px; border-radius: 6px; background: var(--sunk); color: var(--ink); }
.cq-it.med { background: var(--accent); color: var(--accent-ink); }
.cq-tour { display: grid; gap: 4px; padding: 0; margin: 0; list-style: none; font: 500 0.78rem var(--body); }
.cq-tour li { padding: 4px 8px; border-radius: 7px; color: var(--muted); }
.cq-tour li.on { background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.cq-tour li.done { color: var(--ink); }
`;

  // ---------- shared app data (the News Reader project's sample headlines) ----------
  const ART = [
    { id: 'a1', title: 'Library extends weekend opening hours', src: 'Local' },
    { id: 'a2', title: 'Rail line reopens after two weeks of repairs', src: 'Transport' },
    { id: 'a3', title: 'Researchers map a deep-sea reef', src: 'Science' },
    { id: 'a4', title: 'City council approves new bike lanes', src: 'City Desk' },
    { id: 'a5', title: 'Storm expected along the coast on Friday', src: 'Weather' },
    { id: 'a6', title: 'Home team wins the regional final', src: 'Sport' },
    { id: 'a7', title: 'New park opens by the river', src: 'Local' },
  ];
  const ERR = 'No connection. Showing saved news.';
  const BM = '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1h8v10L5 8 1 11z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const RF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M12 7a5 5 0 1 1-1.5-3.6M12 1.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Dashboard values: metrics(k) = after step k; metrics(k - 1, k) = before step k, where step k's own metric
  // is measured and still bad; metrics(-1) = everything measured, nothing fixed. "—" means not measured yet.
  const TESTS_AT = [0, 5, 7, 10, 10, 11, 13, 13, 14, 14];
  const MEASURE = { frame: [4, 24, 11], leaks: [5, 1, 0], a11y: [6, 6, 0], sizes: [7, 1, 3], start: [8, 1240, 820] };
  function metrics(s, measuring) {
    const m = { tests: s < 0 ? 0 : TESTS_AT[s] };
    for (const k in MEASURE) {
      const [at, bad, good] = MEASURE[k];
      m[k] = s < 0 || at === measuring ? bad : at <= s ? good : null;
    }
    return m;
  }
  const TILES = [
    { k: 'tests', label: 'Tests passing', fmt: v => String(v), cls: v => (v >= 10 ? 'ok' : v ? 'warn' : 'bad'), meter: v => v / 14 },
    { k: 'frame', label: 'Frame p90', fmt: v => `${v} ms`, cls: v => (v <= 16 ? 'ok' : 'bad'), meter: v => Math.min(1, v / 32) },
    { k: 'leaks', label: 'Leaks', fmt: v => String(v), cls: v => (v ? 'bad' : 'ok'), meter: v => (v ? 1 : 0) },
    { k: 'a11y', label: 'A11y issues', fmt: v => String(v), cls: v => (v ? 'bad' : 'ok'), meter: v => v / 6 },
    { k: 'sizes', label: 'Window sizes', fmt: v => `${v} of 3`, cls: v => (v === 3 ? 'ok' : 'warn'), meter: v => v / 3 },
    { k: 'start', label: 'Cold start', fmt: v => `${v.toLocaleString('en-US')} ms`, cls: v => (v < 1000 ? 'ok' : 'warn'), meter: v => Math.min(1, v / 1400) },
  ];
  const HOT = { 1: ['tests'], 2: ['tests'], 3: ['tests'], 4: ['frame'], 5: ['leaks', 'tests'], 6: ['a11y', 'tests'], 7: ['sizes'], 8: ['start', 'tests'], 9: TILES.map(t => t.k) };
  const PARTS = ['MainActivity', 'NewsNavHost', 'ArticleListScreen', 'NewsViewModel', 'NewsUiState', 'NewsRepository', 'NetworkMonitor', 'ArticleDao', 'NewsApi', 'src/test', 'src/androidTest', ':baselineprofile'];
  const TOUCHED = {
    1: ['NewsViewModel', 'NewsRepository', 'src/test'], 2: ['src/test'], 3: ['ArticleListScreen', 'src/androidTest'],
    4: ['ArticleListScreen', 'NewsUiState'], 5: ['NetworkMonitor', 'NewsViewModel', 'ArticleListScreen', 'src/test'],
    6: ['ArticleListScreen', 'src/androidTest'], 7: ['NewsNavHost', 'NewsViewModel'], 8: ['MainActivity', 'ArticleListScreen', ':baselineprofile'], 9: PARTS,
  };

  // ---------- shared view helpers ----------
  function dash(step) {
    const stageOf = after => (after ? metrics(step) : step === 9 ? metrics(-1) : metrics(step - 1, step));
    const tiles = TILES.map(t => {
      const v = h('b'), m = h('i');
      const el = h('div', { class: 'cq-tile' + (HOT[step].includes(t.k) ? ' cq-hot' : '') }, h('span', { title: t.label }, t.label), v, h('div', { class: 'cq-m', 'aria-hidden': 'true' }, m));
      return { t, el, v, m };
    });
    const grid = h('div', { class: 'cq-dash', role: 'group', 'aria-label': 'Quality dashboard' }, tiles.map(x => x.el));
    const wrap = h('div', { class: 'cq-side', style: 'gap:6px' }, h('p', { class: 'cq-cap' }, 'Quality dashboard · illustrative · — not measured yet'), grid);
    let cur = stageOf(false), tok = 0;
    function paint(vals) {
      tiles.forEach(x => {
        const val = vals[x.t.k], na = val == null;
        x.v.textContent = na ? '—' : x.t.fmt(val);
        x.el.classList.remove('cq-ok', 'cq-warn', 'cq-bad', 'cq-na');
        x.el.classList.add('cq-' + (na ? 'na' : x.t.cls(val)));
        x.m.style.width = na ? '0' : Math.round(x.t.meter(val) * 100) + '%';
      });
    }
    async function to(after, anim = true) {
      const from = cur, target = stageOf(after), my = ++tok;
      cur = target;
      if (!anim || reduce()) { paint(target); return; }
      for (let i = 1; i <= 12; i++) {
        const vals = {};
        for (const k in target) vals[k] = from[k] == null || target[k] == null ? target[k] : Math.round(from[k] + (target[k] - from[k]) * (i / 12));
        paint(vals);
        await sleep(35);
        if (my !== tok || !wrap.isConnected) return;
      }
      tiles.forEach(x => { if (from[x.t.k] !== target[x.t.k]) replay(x.el, 'pop'); });
    }
    paint(cur);
    return { el: wrap, to };
  }

  function parts(step) {
    return h('div', { class: 'cq-side', style: 'gap:6px' }, h('p', { class: 'cq-cap' }, step === 9 ? 'Touched in this project' : 'Touched in this step'),
      h('div', { class: 'cq-parts' }, PARTS.map(p => h('span', { class: 'cq-part' + (TOUCHED[step].includes(p) ? ' on' : '') }, p))));
  }

  function seg(labels, start, onPick, guard) {
    let cur = start;
    const btns = labels.map((t, i) => h('button', { type: 'button', 'aria-pressed': String(i === start), onclick() {
      if (cur === i) return;
      if (guard && !guard()) { replay(this.parentNode, 'shake'); return; }
      cur = i;
      btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      onPick(i);
    } }, t));
    return { el: h('div', { class: 'cq-seg', role: 'group', 'aria-label': 'Compare states' }, btns), get: () => cur };
  }

  // One layout for every step: phone on the left; Before/After switch, dashboard, touched parts and extras on the right.
  function frame(el, step, ph, o) {
    const d = dash(step);
    const s = seg(o.labels || ['Before this step', `After step ${step}`], 0, i => { d.to(i === 1); o.onMode(i === 1); }, o.guard);
    el.append(
      h('div', { class: 'cq-top' }, ph.el, h('div', { class: 'cq-side' }, s.el, d.el, parts(step), o.side || [])),
      ...(o.below || []));
    o.onMode(false);
    return { d, s };
  }

  function phone() {
    const saved = new Set(['a3']);
    const rf = h('span', { class: 'cq-rf', html: RF });
    const scr = h('span', { class: 'cq-rc cq-scr' }, 'screen 1');
    const bar = h('div', { class: 'cq-bar' }, h('span', {}, 'News'), h('span', { class: 'cq-bar-r' }, scr, rf));
    const bannerTxt = h('span', {}, 'You’re offline'), retry = h('b', {}, 'Retry');
    const banner = h('div', { class: 'cq-banner', hidden: true }, bannerTxt);
    const list = h('div', { class: 'cq-list' });
    const rows = {};
    for (const a of ART) {
      const bm = h('span', { class: 'cq-bm' + (saved.has(a.id) ? ' on' : ''), html: BM });
      const rc = h('span', { class: 'cq-rc' }, '1');
      const title = h('span', { class: 'cq-title' }, a.title), meta = h('span', { class: 'cq-meta' }, a.src);
      const el = h('div', { class: 'cq-row' }, h('span', { class: 'cq-thumb' }), h('span', { class: 'cq-txt' }, title, meta), bm, rc);
      rows[a.id] = { a, el, bm, rc, title, meta, n: 1 };
      list.append(el);
    }
    const listPane = h('div', { class: 'cq-pane' }, list);
    const detail = h('div', { class: 'cq-pane cq-detail', hidden: true });
    const fab = h('span', { class: 'cq-fab', hidden: true, 'aria-hidden': 'true' }, '↑');
    const pull = h('span', { class: 'cq-pull', hidden: true }, h('i'));
    const snack = h('div', { class: 'cq-snack', hidden: true }, ERR);
    const body = h('div', { class: 'cq-body' }, listPane, detail, fab, pull, snack);
    const cover = h('div', { class: 'cq-cover', hidden: true });
    const el = h('div', { class: 'cq-phone', 'data-size': 'compact', role: 'group', 'aria-label': 'News app preview' }, bar, banner, body, cover);
    let openId = null, two = false, scrN = 1;
    function paint() {
      el.classList.toggle('cq-two', two);
      listPane.hidden = !two && !!openId;
      detail.hidden = !two && !openId;
      const a = ART.find(x => x.id === openId);
      detail.replaceChildren(a
        ? h('div', { class: 'cq-detail-in drop-in' },
          two ? null : h('span', { class: 'cq-back' }, '← Back'),
          h('span', { class: 'cq-dtitle' }, a.title), h('span', { class: 'cq-meta' }, a.src),
          h('div', { class: 'cq-hero' }), [96, 100, 88, 94, 62].map(w => h('div', { class: 'cq-ln', style: `width:${w}%` })))
        : h('p', { class: 'cq-empty' }, 'Select an article'));
      Object.values(rows).forEach(r => r.el.classList.toggle('cq-sel', two && r.a.id === openId));
    }
    const api = {
      el, bar, rf, banner, bannerTxt, retry, list, rows, detail, fab, saved, cover,
      get openId() { return openId; },
      setSaved(id, on) { if (on) saved.add(id); else saved.delete(id); rows[id].bm.classList.toggle('on', on); replay(rows[id].bm, 'pop'); },
      offline(on) { const was = !banner.hidden; banner.hidden = !on; if (on && !was) replay(banner, 'drop-in'); },
      refreshing(on) { pull.hidden = !on; },
      snack(on) { snack.hidden = !on; },
      screen(kind) {
        cover.hidden = !kind;
        cover.replaceChildren(...(kind === 'loading' ? [h('div', { class: 'spinner' })]
          : kind === 'splash' ? [h('div', { class: 'cq-logo' })]
          : kind === 'error' ? [h('span', {}, ERR), retry] : []));
      },
      open(id) { openId = id; paint(); },
      back() { openId = null; paint(); },
      layout(size, twoPane) { el.dataset.size = size; two = twoPane; paint(); },
      scrollTo(px) { list.style.transform = px ? `translateY(${-px}px)` : ''; },
      count(id, hot) { const r = rows[id]; r.n++; r.rc.textContent = String(r.n); r.rc.classList.toggle('hot', !!hot); replay(r.el, 'cq-flash'); },
      countScreen(k, hot) { scrN += k; scr.textContent = `screen ${scrN}`; scr.classList.toggle('hot', !!hot); },
      resetCounts() { scrN = 1; scr.textContent = 'screen 1'; scr.classList.remove('hot'); Object.values(rows).forEach(r => { r.n = 1; r.rc.textContent = '1'; r.rc.classList.remove('hot'); }); },
      reset() { api.screen(null); api.offline(false); api.refreshing(false); api.snack(false); api.scrollTo(0); fab.hidden = true; openId = null; paint(); },
    };
    paint();
    return api;
  }

  function runner(names) {
    const rows = names.map(n => { const dot = h('span', { class: 'cq-dot' }); return { r: h('div', { class: 'cq-t' }, dot, h('span', {}, n)), dot }; });
    const sum = h('div', { class: 'cq-tsum' });
    return {
      el: h('div', { class: 'cq-tests' }, rows.map(x => x.r), sum),
      set(i, st) { rows[i].dot.className = 'cq-dot ' + st; },
      reset() { rows.forEach(x => { x.dot.className = 'cq-dot'; }); sum.textContent = ''; },
      written(on) { rows.forEach(x => x.r.classList.toggle('cq-off', !on)); },
      sum(text) { sum.textContent = text; },
    };
  }

  function script(lines) {
    const els = lines.map(l => h('div', { class: 'cq-sl', html: hl(l) || ' ' }));
    return {
      el: h('div', { class: 'cq-script' }, els),
      mark(i) { els.forEach(e => e.classList.remove('on')); if (els[i]) els[i].classList.add('on'); },
      clear() { els.forEach(e => { e.className = 'cq-sl'; }); },
      set(i, cls) { els[i].classList.remove('on'); els[i].classList.add(cls); },
    };
  }

  Lab.addTrack({
    id: 'capquality',
    title: 'Production Quality Pass',
    kind: 'project',
    group: 'Going deeper',
    requires: ['capapp', 'testing', 'perf'],
    description: 'Take the offline-first News Reader from working to production quality, one measured fix at a time.',
    builds: 'The News Reader with ViewModel, Flow and UI tests, smooth scrolling, no leaks, an accessibility pass, a tablet layout and a measured faster cold start.',
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'unit-tests',
        title: 'Unit-test the ViewModel with fakes',
        tagline: 'A safety net before we change anything.',
        level: 'intermediate',
        refs: ['capapp.states', 'testing.fakes', 'testing.coroutines'],
        body: `
<p>The News Reader from the last project works. In this project we change a lot of it: the list, the network code, the layout, the startup path. Before touching anything, we pin down what it does today with fast JVM tests. Every later step runs them again.</p>
<p><code>NewsViewModel</code> already depends on the <code>NewsRepository</code> interface, so tests can hand it a fake. We move the <code>FakeNewsRepository</code> stand-in from the News Reader project into <code>src/test</code> and give it knobs: <code>emit()</code> to push articles, <code>refreshError</code> to make a refresh fail, <code>refreshDelay</code> to make it take time, and <code>refreshCount</code> to see how often it ran.</p>
<p>Each test uses <code>runTest</code> and the <code>MainDispatcherRule</code> from the testing track, so <code>viewModelScope</code> runs on a test dispatcher and <code>delay</code> uses a virtual clock. <code>uiState</code> is built with <code>stateIn(WhileSubscribed)</code>, so it only updates while someone collects it. Tests that read <code>uiState.value</code> start a collector in <code>backgroundScope</code> first.</p>`,
        code: `// src/test/.../FakeNewsRepository.kt: the stand-in from the News Reader project, now with knobs
class FakeNewsRepository : NewsRepository {
    private val articles = MutableStateFlow<List<Article>>(emptyList())
    var refreshError: IOException? = null
    var refreshDelay = 0L
    var refreshCount = 0

    fun emit(list: List<Article>) { articles.value = list }
    override fun observeArticles(): Flow<List<Article>> = articles
    override fun observeArticle(id: String): Flow<Article?> = articles.map { list -> list.find { it.id == id } }
    override suspend fun refresh() {
        refreshCount++
        delay(refreshDelay)
        refreshError?.let { throw it }
    }
}

// src/test/.../NewsViewModelTest.kt
class NewsViewModelTest {
    @get:Rule val mainRule = MainDispatcherRule()
    private val repo = FakeNewsRepository()
    private lateinit var vm: NewsViewModel

    @Before fun setUp() { vm = NewsViewModel(repo) }      // after the rule swapped Dispatchers.Main

    @Test fun refreshesOnStart() = runTest {
        assertEquals(1, repo.refreshCount)                  // init { refresh() }
    }

    @Test fun showsArticlesFromRepository() = runTest {
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.uiState.collect() }
        repo.emit(sampleArticles)
        assertEquals(sampleArticles, vm.uiState.value.articles)
        assertFalse(vm.uiState.value.isLoading)
    }

    @Test fun failedRefreshShowsMessage() = runTest {
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.uiState.collect() }
        repo.refreshError = IOException("no network")
        vm.refresh()
        assertEquals("No connection. Showing saved news.", vm.uiState.value.errorMessage)
        assertFalse(vm.uiState.value.isRefreshing)
    }

    @Test fun refreshIsIgnoredWhileOneIsRunning() = runTest {
        val slowRepo = FakeNewsRepository().apply { refreshDelay = 1_000 }
        val slowVm = NewsViewModel(slowRepo)                // init refresh now takes 1 s of virtual time
        slowVm.refresh()                                     // ignored: isRefreshing is still true
        advanceUntilIdle()
        assertEquals(1, slowRepo.refreshCount)
    }
    // plus startsInLoadingState(): assertTrue(vm.uiState.value.isLoading)
}`,
        remember: 'Fake behind the interface. Create the ViewModel after the Main rule, and collect uiState before you read it.',
        terms: [
          { term: 'Regression test', def: 'A test that pins down behavior that already works, so a later change cannot break it without a failing build.' },
        ],
        mistakes: [
          { title: 'Reading a WhileSubscribed StateFlow with no collector', bad: `@Test fun showsArticles() = runTest {
    repo.emit(sampleArticles)
    assertEquals(sampleArticles, vm.uiState.value.articles)   // still the initial value
}`, good: `@Test fun showsArticles() = runTest {
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.uiState.collect() }
    repo.emit(sampleArticles)
    assertEquals(sampleArticles, vm.uiState.value.articles)
}`, why: '<code>stateIn(WhileSubscribed)</code> only runs the upstream while something collects. Without a collector, <code>value</code> stays at the initial state.' },
          { title: 'Using the real repository in a ViewModel test', bad: `val vm = NewsViewModel(
    OfflineFirstNewsRepository(retrofit.create(NewsApi::class.java), db.articleDao()),
)`, good: `val repo = FakeNewsRepository().apply { emit(sampleArticles) }
val vm = NewsViewModel(repo)`, why: 'The real repository needs a server and a database, so the test is slow and fails for reasons that have nothing to do with the ViewModel. Test the repository on its own with an in-memory Room database.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the rule, the fake and the coroutine test builder.', code: 'class NewsViewModelTest {\n    @get:Rule val mainRule = [[MainDispatcherRule]]()\n    private val repo = [[FakeNewsRepository]]()\n\n    @Test fun refreshesOnStart() = [[runTest]] {\n        NewsViewModel(repo)\n        assertEquals(1, repo.refreshCount)\n    }\n}', why: 'The rule swaps <code>Dispatchers.Main</code>, the fake replaces the network and database, and <code>runTest</code> runs the test on a virtual clock.' },
          { type: 'bug', prompt: 'This test crashes before it reaches its assertion. Tap the line that causes it.', code: 'class NewsViewModelTest {\n    @get:Rule val mainRule = MainDispatcherRule()\n    private val repo = FakeNewsRepository()\n    private val vm = NewsViewModel(repo)\n\n    @Test fun failedRefreshShowsMessage() = runTest {\n        repo.refreshError = IOException("no network")\n        vm.refresh()\n        assertEquals("No connection. Showing saved news.", vm.uiState.value.errorMessage)\n    }\n}', bug: 3, fix: '    private lateinit var vm: NewsViewModel   // and create it in @Before', why: 'Property initializers run when JUnit creates the test class, before the rule calls <code>Dispatchers.setMain</code>. The constructor runs <code>init { refresh() }</code> and <code>stateIn(viewModelScope)</code>, so <code>viewModelScope</code> grabs the real Main dispatcher, which does not exist on the JVM. Create the ViewModel in <code>@Before</code>.' },
        ],
        quiz: [
          { q: 'Why can the test pass a <code>FakeNewsRepository</code> to <code>NewsViewModel</code>?', options: ['Hilt swaps it in automatically', 'The ViewModel depends on the NewsRepository interface, not on OfflineFirstNewsRepository', 'Kotlin allows any class as a constructor argument'], a: 1, why: 'Depending on the interface is what lets the app bind the real implementation with <code>@Binds</code> while tests hand in a fake.' },
          { q: 'A test reads <code>vm.uiState.value</code> and always gets the initial state. <code>uiState</code> uses <code>stateIn(viewModelScope, WhileSubscribed(5_000), …)</code>. What is missing?', options: ['A collector, for example in <code>backgroundScope</code>', 'A call to <code>advanceUntilIdle()</code> only', 'A <code>Thread.sleep</code>'], a: 0, why: 'With <code>WhileSubscribed</code> the upstream combine only runs while there is a subscriber. Start one before you read <code>value</code>.' },
          { q: 'In <code>refreshIsIgnoredWhileOneIsRunning</code>, how long does the test take in real time?', options: ['About one second', 'Milliseconds: runTest skips the 1 s delay on its virtual clock', 'It never finishes'], a: 1, why: '<code>delay</code> inside <code>runTest</code> advances virtual time, so <code>advanceUntilIdle()</code> runs the slow refresh instantly.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          const TESTS = ['startsInLoadingState', 'refreshesOnStart', 'showsArticlesFromRepository', 'failedRefreshShowsMessage', 'refreshIsIgnoredWhileOneIsRunning'];
          const run = runner(TESTS);
          const o = out();
          let after = false, broken = false, busy = false;
          const SCEN = [
            async () => { ph.screen('loading'); await sleep(450); return true; },
            async () => { ph.refreshing(true); await sleep(400); ph.refreshing(false); return true; },
            async () => { ph.screen(null); Object.values(ph.rows).forEach(r => replay(r.el, 'drop-in')); await sleep(400); return true; },
            async () => { ph.refreshing(true); await sleep(350); ph.snack(true); if (!broken) ph.refreshing(false); await sleep(400); return !broken; },
            async () => { ph.refreshing(true); await sleep(250); replay(ph.el, 'shake'); await sleep(350); ph.refreshing(false); return true; },
          ];
          async function runAll() {
            if (busy) return; busy = true;
            try {
              run.reset(); ph.reset();
              if (!after) {
                say(o, `<span class="muted">BUILD SUCCESSFUL</span> 0 tests ran.${broken ? ' Watch the app: pull to refresh while offline.' : ' Nothing checks refresh() yet.'}`);
                if (broken) {
                  await sleep(600); if (!live()) return;
                  ph.refreshing(true); await sleep(500); if (!live()) return;
                  ph.snack(true);
                  say(o, '<span class="bad">The refresh spinner never stops.</span> No test caught it, so this ships to users.');
                }
                return;
              }
              let failed = 0;
              say(o, '<span class="muted">./gradlew testDebugUnitTest</span> running on the JVM…');
              for (let i = 0; i < TESTS.length; i++) {
                run.set(i, 'run');
                const ok = await SCEN[i]();
                if (!live()) return;
                run.set(i, ok ? 'pass' : 'fail');
                if (!ok) failed++;
                if (i === 3) { ph.snack(false); ph.refreshing(false); }
                await sleep(120);
              }
              run.sum(`${TESTS.length} tests, ${TESTS.length - failed} passed${failed ? `, ${failed} failed` : ''}`);
              say(o, failed
                ? '<span class="bad">FAILED</span> failedRefreshShowsMessage: expected:&lt;false&gt; but was:&lt;true&gt;. The test caught the stuck spinner.'
                : '<span class="good">5 passed</span> in under a second. No emulator, no network.');
            } finally { busy = false; }
          }
          const breakBtn = cmd('break refresh(): drop the finally block', () => {
            if (busy) return;
            broken = !broken;
            breakBtn.setAttribute('aria-pressed', String(broken));
            say(o, broken ? '<span class="bad">bug added:</span> refresh() no longer resets isRefreshing when the network call throws. Run the tests.' : '<span class="good">bug removed:</span> finally { isRefreshing.value = false } is back.');
          }, { 'aria-pressed': 'false' });
          frame(el, 1, ph, {
            guard: () => !busy,
            side: [h('p', { class: 'cq-cap' }, 'NewsViewModelTest'), run.el],
            below: [h('div', { class: 'controls' }, cmd('./gradlew testDebugUnitTest', runAll), breakBtn), o],
            onMode(a) {
              after = a; run.reset(); run.written(a); ph.reset();
              run.sum(a ? '5 tests in src/test' : 'No tests written yet');
              say(o, a ? 'Five tests drive NewsViewModel through the fake. Run them, then break refresh() and run again.' : 'The app works, but nothing checks it. Try breaking refresh() and running the build.');
            },
          });
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'turbine',
        title: 'Test the state stream with Turbine',
        tagline: 'Check every state the screen goes through, in order.',
        level: 'intermediate',
        refs: ['testing.flows', 'flow.hot'],
        body: `
<p>The step-1 tests look at <code>uiState.value</code> at the end. They pass even if the refresh spinner never showed. Users see every state, so we test the sequence.</p>
<p>Turbine’s <code>test { }</code> collects <code>uiState</code> into a queue. Each <code>awaitItem()</code> takes the next state and fails if none arrives in time. Leftover events at the end fail the test too, so nothing slips by. The fake’s <code>refreshDelay</code> from step 1 makes the refresh take virtual time, so “refreshing” is a real, separate emission. When you only care about where a burst of changes ends, <code>expectMostRecentItem()</code> takes the latest and drops the rest.</p>
<p>This step leans on how <code>StateFlow</code> works: a new collector first gets the current value, and an equal value is dropped. If the fake emits the same list twice, Turbine sees one event.</p>`,
        code: `@Test fun refreshShowsSpinnerThenHidesIt() = runTest {
    repo.emit(sampleArticles)
    repo.refreshDelay = 1_000

    vm.uiState.test {
        assertTrue(awaitItem().isLoading)                     // stateIn's initial value
        assertEquals(sampleArticles, awaitItem().articles)    // first value from the repository
        vm.refresh()
        assertTrue(awaitItem().isRefreshing)
        val done = awaitItem()                                // after 1 s of virtual time
        assertFalse(done.isRefreshing)
        assertNull(done.errorMessage)
        cancelAndIgnoreRemainingEvents()
    }
}

@Test fun failedRefreshEndsWithMessage() = runTest {
    vm.uiState.test {
        skipItems(2)                                          // initial state + first list
        repo.refreshError = IOException("offline")
        vm.refresh()
        val state = expectMostRecentItem()                    // the last of the burst
        assertEquals("No connection. Showing saved news.", state.errorMessage)
        assertFalse(state.isRefreshing)
    }
}`,
        remember: 'test { } queues every state. awaitItem() takes them in order; leftovers fail the test.',
        terms: [
          { term: 'StateFlow conflation', def: 'StateFlow keeps only its latest value and ignores a new value equal to the current one, so a slow collector can miss states in between.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Collect <code>uiState</code> with Turbine, take the first state, and stop at the end.', code: 'vm.uiState.[[test]] {\n    assertTrue([[awaitItem]]().isLoading)\n    vm.refresh()\n    [[cancelAndIgnoreRemainingEvents]]()\n}', why: '<code>test { }</code> starts collecting into a queue, <code>awaitItem()</code> takes the next state, and <code>cancelAndIgnoreRemainingEvents()</code> stops collecting without failing on states we did not check.' },
          { type: 'bug', prompt: 'With this fake, <code>repo.emit(newList)</code> never reaches the ViewModel and <code>awaitItem()</code> times out. Tap the wrong line.', code: 'class FakeNewsRepository : NewsRepository {\n    private val articles = MutableStateFlow<List<Article>>(emptyList())\n    fun emit(list: List<Article>) { articles.value = list }\n    override fun observeArticles(): Flow<List<Article>> = flowOf(articles.value)\n    override fun observeArticle(id: String): Flow<Article?> = articles.map { list -> list.find { it.id == id } }\n    override suspend fun refresh() {}\n}', bug: 3, fix: '    override fun observeArticles(): Flow<List<Article>> = articles', why: '<code>flowOf(articles.value)</code> emits a snapshot once and completes. Return the <code>MutableStateFlow</code> itself so later emits reach every collector, like Room’s Flow does in the app.' },
        ],
        quiz: [
          { q: 'Inside <code>vm.uiState.test { }</code>, what does the first <code>awaitItem()</code> return?', options: ['Nothing until something changes', 'The current value of the StateFlow', 'The last value the flow will ever emit'], a: 1, why: 'A StateFlow always hands a new collector its current value first, here <code>NewsUiState()</code> with <code>isLoading = true</code>.' },
          { q: 'The fake emits the same list twice in a row. How many items does Turbine see?', options: ['Two', 'One', 'Zero'], a: 1, why: 'StateFlow ignores a value equal to its current one, so only one emission happens.' },
          { q: 'Why does the fake’s <code>refresh()</code> call <code>delay(refreshDelay)</code>?', options: ['To slow the test down in real time', 'So “refreshing” is a separate state that lasts some virtual time and is not conflated away', 'Turbine requires every function to suspend'], a: 1, why: 'Without a suspension point, refreshing can flip true and back before the collector sees it. <code>runTest</code> skips the delay instantly.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          const LABEL = { loading: 'Loading', list: 'Articles(7)', refreshing: 'Refreshing', done: 'Articles(7) done', list2: 'Articles(8)' };
          const LINES = [
            'vm.uiState.test {',
            '    assertTrue(awaitItem().isLoading)',
            '    assertEquals(sampleArticles, awaitItem().articles)',
            '    vm.refresh()',
            '    assertTrue(awaitItem().isRefreshing)',
            '    assertFalse(awaitItem().isRefreshing)',
            '    cancelAndIgnoreRemainingEvents()',
            '}',
          ];
          const EXPECT = { 1: 'loading', 2: 'list', 4: 'refreshing', 5: 'done' };
          const BEFORE = ['vm.refresh()', 'advanceUntilIdle()', 'assertFalse(vm.uiState.value.isRefreshing)'];
          const sc = script(LINES), scB = script(BEFORE);
          const qCap = h('p', { class: 'cq-cap' }, 'Turbine queue');
          const queue = h('div', { class: 'cq-queue', 'aria-label': 'Turbine event queue' });
          const hist = h('div', { class: 'cq-hist', 'aria-label': 'States the screen went through' });
          const o = out();
          let after = false, busy = false, auto = false, line = 0, q = [], subscribed = false, failed = false;
          const showOnPhone = k => {
            if (k === 'loading') ph.screen('loading');
            if (k === 'list' || k === 'list2') { ph.screen(null); ph.refreshing(false); }
            if (k === 'refreshing') ph.refreshing(true);
            if (k === 'done') ph.refreshing(false);
          };
          const histChips = {};
          function emit(k) {
            showOnPhone(k);
            const hc = h('span', { class: 'cq-ev drop-in' + (k === 'list2' ? ' cq-odd' : '') }, LABEL[k]);
            hist.append(hc); histChips[k] = hc;
            if (subscribed) { const c = h('span', { class: 'cq-ev drop-in' + (k === 'list2' ? ' cq-odd' : '') }, LABEL[k]); c.k = k; q.push(c); queue.append(c); }
          }
          async function take(expect) {
            const c = q.shift();
            if (!c) return false;
            c.classList.add('leave'); await sleep(300); c.remove();
            if (c.k !== expect) { failed = true; return c.k; }
            if (histChips[expect]) histChips[expect].classList.add('ok');
            return true;
          }
          function restart() {
            line = 0; q = []; subscribed = false; failed = false;
            queue.replaceChildren(); hist.replaceChildren(); sc.clear(); scB.clear(); ph.reset();
          }
          const ACT = [
            async () => { subscribed = true; emit('loading'); await sleep(250); emit('list'); return true; },
            () => take('loading'),
            () => take('list'),
            async () => { emit('refreshing'); return true; },
            () => take('refreshing'),
            async () => {
              if (!q.length) { say(o, '<span class="muted">awaitItem() suspends… runTest skips 1 000 ms of virtual time</span>'); await sleep(500); if (!live()) return true; emit('done'); await sleep(250); }
              return take('done');
            },
            async () => { q.forEach(c => c.remove()); q = []; subscribed = false; return true; },
            async () => true,
          ];
          async function step() {
            if (busy || !after) return;
            if (failed || line >= LINES.length) restart();
            busy = true;
            try {
              sc.mark(line);
              const r = await ACT[line]();
              if (!live()) return;
              if (r === true) {
                sc.set(line, 'ok');
                say(o, line === LINES.length - 1 ? '<span class="good">PASSED</span> every state checked in order: Loading, Articles, Refreshing, done.' : `${hl(LINES[line].trim())} <span class="good">ok</span>`);
                line++;
              } else {
                sc.set(line, 'bad');
                say(o, `<span class="bad">FAILED</span> expected ${LABEL[EXPECT[line]] || 'an item'} but got ${r ? LABEL[r] : 'nothing'}. An extra state jumped the queue.`);
              }
            } finally { busy = false; }
          }
          async function runTest() {
            if (busy || auto) return;
            if (!after) {
              busy = true;
              try {
                restart();
                for (let i = 0; i < BEFORE.length; i++) {
                  scB.mark(i);
                  if (i === 0) { emit('loading'); await sleep(200); emit('list'); await sleep(200); emit('refreshing'); }
                  if (i === 1) { await sleep(300); emit('done'); }
                  await sleep(350); if (!live()) return;
                  scB.set(i, 'ok');
                }
                Object.entries(histChips).forEach(([k, c]) => c.classList.add(k === 'done' ? 'ok' : 'miss'));
                say(o, '<span class="good">PASSED</span>, but only the last state was checked. It would still pass if the spinner never showed.');
              } finally { busy = false; }
              return;
            }
            auto = true;
            try {
              restart();
              while (after && line < LINES.length && !failed) { await step(); if (!live()) return; await sleep(200); }
            } finally { auto = false; }
          }
          const sameBtn = cmd('repo.emit(sameList)', () => {
            if (!after || busy) return;
            if (!subscribed) { say(o, 'Nobody is collecting yet. Step into the test first.'); return; }
            replay(queue, 'shake');
            say(o, '<span class="muted">no event:</span> StateFlow ignores a value equal to the current one.');
          });
          const newBtn = cmd('repo.emit(eightArticles)', () => {
            if (!after || busy) return;
            if (!subscribed) { say(o, 'Nobody is collecting yet. The value just sits in the StateFlow.'); return; }
            emit('list2');
            say(o, '<span class="muted">new event queued:</span> Articles(8). The next awaitItem() gets it, ready or not.');
          });
          const afterOnly = [cmd('Step', () => { if (!auto) step(); }), sameBtn, newBtn];
          frame(el, 2, ph, {
            guard: () => !busy && !auto,
            side: [h('p', { class: 'cq-cap' }, 'States the screen went through'), hist, qCap, queue],
            below: [sc.el, scB.el, h('div', { class: 'controls' }, cmd('Run test', runTest), afterOnly), o],
            onMode(a) {
              after = a; restart();
              sc.el.hidden = !a; scB.el.hidden = a; queue.hidden = !a; qCap.hidden = !a;
              afterOnly.forEach(b => { b.hidden = !a; });
              say(o, a ? 'Step through the Turbine test, or run it. Try emitting while it waits.' : 'The step-1 style test only reads uiState.value at the end. Run it.');
            },
          });
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'ui-tests',
        title: 'Compose UI tests on the semantics tree',
        tagline: 'Find nodes by meaning, act, assert.',
        level: 'intermediate',
        refs: ['testing.compose-ui', 'compose.hoisting', 'a11y.semantics'],
        body: `
<p>Unit tests prove the ViewModel is right. They do not prove the screen shows it. This step adds a few instrumented tests in <code>src/androidTest</code> for the screen users touch most.</p>
<p><code>ArticleListScreen</code> from the News Reader project is stateless: it takes <code>NewsUiState</code>, <code>onRefresh</code> and <code>onArticleClick</code>. So a test passes a state straight in. No ViewModel, no Hilt, no network. We only add <code>Modifier.testTag("article_list")</code> to its <code>LazyColumn</code> so tests can find the list.</p>
<p>Finders such as <code>onNodeWithText</code> search the semantics tree, the same tree TalkBack reads. A <code>Card</code> with <code>onClick</code> merges its texts into one button node, so finding a row by headline and clicking it works. <code>LazyColumn</code> only composes visible rows, so to check a row further down, scroll to it with <code>performScrollToNode</code> first.</p>`,
        code: `// ArticleList: give the LazyColumn a tag tests can find
LazyColumn(
    modifier = Modifier.testTag("article_list"),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp),
) { /* items(articles, key = { it.id }) { ... } as before */ }

// src/androidTest/.../ArticleListScreenTest.kt
class ArticleListScreenTest {
    @get:Rule val rule = createComposeRule()

    private fun show(state: NewsUiState, onRefresh: () -> Unit = {}, onArticleClick: (String) -> Unit = {}) =
        rule.setContent { MaterialTheme { ArticleListScreen(state, onRefresh, onArticleClick) } }

    @Test fun listShowsHeadlines() {
        show(NewsUiState(articles = sampleArticles, isLoading = false))
        rule.onNodeWithText("Library extends weekend opening hours").assertIsDisplayed()
        rule.onNodeWithTag("article_list").performScrollToNode(hasText(sampleArticles.last().title))
        rule.onNodeWithText(sampleArticles.last().title).assertIsDisplayed()
    }

    @Test fun errorWithNoArticlesOffersRetry() {
        var refreshes = 0
        show(NewsUiState(isLoading = false, errorMessage = "No connection. Showing saved news."),
            onRefresh = { refreshes++ })
        rule.onNodeWithText("No connection. Showing saved news.").assertIsDisplayed()
        rule.onNodeWithText("Retry").performClick()
        assertEquals(1, refreshes)
    }

    @Test fun tappingARowOpensThatArticle() {
        var opened: String? = null
        show(NewsUiState(articles = sampleArticles, isLoading = false), onArticleClick = { opened = it })
        rule.onNodeWithText("City council approves new bike lanes").performClick()
        assertEquals("a4", opened)
    }
}`,
        remember: 'Pass state in, find by text or tag, act, assert. Scroll lazy lists before you assert.',
        terms: [
          { term: 'useUnmergedTree', def: 'A finder option that searches the semantics tree before merging, so each Text inside a merged row is its own node.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Click Retry, then scroll the list to the last headline and check it shows.', code: 'rule.onNodeWithText("Retry").[[performClick]]()\nrule.onNodeWithTag("article_list").[[performScrollToNode]](hasText(last.title))\nrule.onNodeWithText(last.title).[[assertIsDisplayed]]()', why: 'Actions start with <code>perform</code>, checks with <code>assert</code>. <code>performScrollToNode</code> scrolls a lazy list until a matching child is composed.' },
          { type: 'bug', prompt: 'This test fails with “could not find any node”. The list has 30 articles. Tap the line that fails.', code: '@Test fun lastHeadlineIsInTheList() {\n    rule.setContent {\n        ArticleListScreen(NewsUiState(articles = thirtyArticles, isLoading = false), {}, {})\n    }\n    rule.onNodeWithText(thirtyArticles.first().title).assertIsDisplayed()\n    rule.onNodeWithText(thirtyArticles.last().title).assertIsDisplayed()\n}', bug: 5, fix: '    rule.onNodeWithTag("article_list").performScrollToNode(hasText(thirtyArticles.last().title))  // then assert', why: '<code>LazyColumn</code> only composes the rows on screen, so the 30th row has no semantics node yet. Scroll to it first, then assert.' },
        ],
        quiz: [
          { q: 'Why can the test call <code>ArticleListScreen(state, …)</code> without a ViewModel?', options: ['Compose tests mock ViewModels automatically', 'ArticleListScreen is stateless: it takes NewsUiState and lambdas', 'createComposeRule starts Hilt'], a: 1, why: 'State hoisting keeps the screen a plain function of its inputs, which is exactly what a UI test wants.' },
          { q: 'A row is a <code>Card(onClick = …)</code> holding two Texts. What does <code>onNodeWithText("City council approves new bike lanes")</code> find by default?', options: ['The Text node only, which has no click action', 'The merged card node, which has the click action', 'Nothing, merged nodes can’t be found by text'], a: 1, why: 'A clickable card merges its children’s semantics. Finders use the merged tree by default, so the card node carries both texts and the click.' },
          { q: 'Where do these tests live and how do they run?', options: ['src/test, on the JVM', 'src/androidTest, on a device or emulator', 'In the release APK'], a: 1, why: 'Compose UI tests need the Android framework, so they are instrumented tests run with connectedAndroidTest.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          const R = ph.rows;
          const treeEl = h('div', { class: 'cq-tree', 'aria-label': 'Semantics tree' });
          const o = out();
          let after = false, busy = false, unmerged = false, errorState = false;
          const NODE_EL = {};
          function nodes() {
            const n = [{ d: 0, t: 'Root', id: 'root' }, { d: 1, t: 'Text "News"', id: 'title', el: ph.bar }];
            if (errorState) {
              n.push({ d: 1, t: `Text "${ERR}"`, id: 'err', el: ph.cover.firstElementChild }, { d: 1, t: 'Button "Retry"  [OnClick]', id: 'retry', el: ph.retry });
              return n;
            }
            n.push({ d: 1, t: 'LazyColumn  tag="article_list"  [Scroll]', id: 'list', el: ph.list });
            const rowNodes = (r, id) => unmerged
              ? [{ d: 2, t: 'Button  [OnClick]', id, el: r.el }, { d: 3, t: `Text "${r.a.title}"`, id: id + 't', el: r.title }, { d: 3, t: `Text "${r.a.src}"`, id: id + 'm', el: r.meta }]
              : [{ d: 2, t: `Button "${r.a.title}", "${r.a.src}"  [OnClick]`, id, el: r.el }];
            n.push(...rowNodes(R.a1, 'r1'), ...rowNodes(R.a2, 'r2'), ...rowNodes(R.a3, 'r3'), ...rowNodes(R.a4, 'r4'),
              { d: 2, t: '… rows below are composed as they scroll in', id: 'more', dim: true }, ...rowNodes(R.a7, 'r7'));
            return n;
          }
          function paintTree() {
            treeEl.replaceChildren(...nodes().map(n => {
              const e = h('div', { class: 'cq-node' + (n.dim ? ' dim' : ''), style: `padding-left:${6 + n.d * 12}px` }, n.t);
              NODE_EL[n.id] = { e, el: n.el };
              return e;
            }));
          }
          function clearHits() { el.querySelectorAll('.cq-hit').forEach(x => x.classList.remove('cq-hit')); }
          function hit(id) { clearHits(); const n = NODE_EL[id]; if (!n) return; n.e.classList.add('cq-hit'); if (n.el) n.el.classList.add('cq-hit'); }
          const listState = async () => { errorState = false; ph.reset(); paintTree(); };
          const TESTS = [
            { name: 'listShowsHeadlines', lines: [
              ['show(NewsUiState(articles = sampleArticles, isLoading = false))', listState],
              ['rule.onNodeWithText("Library extends weekend opening hours").assertIsDisplayed()', async () => hit('r1')],
              ['rule.onNodeWithTag("article_list").performScrollToNode(hasText(last.title))', async () => { hit('list'); await sleep(250); ph.scrollTo(150); await sleep(450); }],
              ['rule.onNodeWithText(last.title).assertIsDisplayed()', async () => hit('r7')],
            ] },
            { name: 'errorWithNoArticlesOffersRetry', lines: [
              ['show(NewsUiState(isLoading = false, errorMessage = "No connection…"), onRefresh = { refreshes++ })', async () => { ph.reset(); ph.screen('error'); errorState = true; paintTree(); }],
              ['rule.onNodeWithText("No connection. Showing saved news.").assertIsDisplayed()', async () => hit('err')],
              ['rule.onNodeWithText("Retry").performClick()', async () => { hit('retry'); replay(ph.retry, 'pop'); }],
              ['assertEquals(1, refreshes)', async () => true],
            ] },
            { name: 'tappingARowOpensThatArticle', lines: [
              ['show(NewsUiState(articles = sampleArticles, isLoading = false), onArticleClick = { opened = it })', listState],
              ['rule.onNodeWithText("City council approves new bike lanes").performClick()', async () => { hit('r4'); replay(R.a4.el, 'cq-flash'); }],
              ['assertEquals("a4", opened)', async () => { clearHits(); ph.open('a4'); }],
            ] },
          ];
          const scWrap = h('div', { style: 'display:grid;min-width:0' });
          async function runOne(t) {
            const s = script(t.lines.map(l => l[0]));
            scWrap.replaceChildren(s.el);
            for (let i = 0; i < t.lines.length; i++) {
              s.mark(i);
              await t.lines[i][1]();
              await sleep(480);
              if (!live()) return false;
              s.set(i, 'ok');
            }
            return true;
          }
          async function run(list) {
            if (busy) return;
            if (!after) { say(o, '<span class="muted">./gradlew connectedDebugAndroidTest</span> 0 tests in src/androidTest. The tree is there, nothing checks it.'); replay(treeEl, 'shake'); return; }
            busy = true;
            try {
              let n = 0;
              for (const t of list) {
                say(o, `<span class="muted">running</span> ${t.name}…`);
                if (!(await runOne(t)) || !live()) return;
                n++;
                await sleep(250);
              }
              say(o, `<span class="good">${n} passed</span> ${list.length === 1 ? list[0].name : 'ArticleListScreenTest'} on the emulator.`);
            } finally { busy = false; }
          }
          const mergeBtn = cmd('useUnmergedTree = true', () => {
            if (busy) return;
            unmerged = !unmerged; mergeBtn.setAttribute('aria-pressed', String(unmerged)); paintTree();
            say(o, unmerged ? 'Unmerged: each Text in a card is its own node. Use it to assert on one child.' : 'Merged (the default): a clickable card carries all its texts and the click.');
          }, { 'aria-pressed': 'false' });
          const testBtns = TESTS.map(t => cmd(t.name, () => run([t])));
          frame(el, 3, ph, {
            guard: () => !busy,
            side: [h('p', { class: 'cq-cap' }, 'Semantics tree'), treeEl],
            below: [scWrap, h('div', { class: 'controls' }, cmd('Run all', () => run(TESTS)), testBtns, mergeBtn), o],
            onMode(a) {
              after = a; errorState = false; ph.reset(); paintTree(); clearHits(); scWrap.replaceChildren();
              testBtns.forEach(b => { b.hidden = !a; });
              say(o, a ? 'Three tests in src/androidTest. Run one and watch the finder light up the node and the pixels.' : 'This is the semantics tree of ArticleListScreen. Toggle the unmerged view to see what each card holds.');
            },
          });
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'recomposition',
        title: 'Fix a recomposition hotspot',
        tagline: 'One bookmark should redraw one row.',
        level: 'advanced',
        refs: ['compose2.stability', 'compose2.derived', 'perf.compose-perf', 'perf.frame'],
        body: `
<p>While we wrote tests, the team shipped the Bookmarks stretch idea from the News Reader project: bookmarks live in their own table, <code>NewsUiState</code> gained <code>bookmarkedIds: Set&lt;String&gt;</code>, each row got a bookmark icon, and long lists got a Back to top button. On a mid-range phone the list now feels rough. Layout Inspector’s recomposition counts show two problems.</p>
<p>One bookmark tap recomposes every visible row. Each row received the whole <code>bookmarkedIds</code> set and checked <code>article.id in bookmarkedIds</code> itself. After any change the set is a new object, and <code>Set</code> is an interface Compose treats as unstable, so with strong skipping it compares by instance and every row looks changed. The row only needs one Boolean. Compute <code>isBookmarked</code> in the list and pass that, and only the row whose Boolean flipped recomposes.</p>
<p>Scrolling recomposes the whole list on every frame. The Back to top check read <code>listState.layoutInfo</code> in composition, and that object changes on every scroll frame. <code>remember { derivedStateOf { listState.firstVisibleItemIndex > 2 } }</code> turns it into a Boolean that flips once.</p>`,
        code: `data class NewsUiState(
    val articles: List<Article> = emptyList(),
    val bookmarkedIds: Set<String> = emptySet(),          // added with bookmarks
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
)

@Composable
fun ArticleList(
    articles: List<Article>,
    bookmarkedIds: Set<String>,
    onArticleClick: (String) -> Unit,
    onBookmarkClick: (String, Boolean) -> Unit,
) {
    val listState = rememberLazyListState()
    // Before: val first = listState.layoutInfo.visibleItemsInfo.firstOrNull()?.index ?: 0   (new every frame)
    val showBackToTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 2 } }

    Box {
        LazyColumn(state = listState, modifier = Modifier.testTag("article_list")) {
            items(articles, key = { it.id }, contentType = { "article" }) { article ->
                ArticleRow(
                    article = article,
                    isBookmarked = article.id in bookmarkedIds,   // was: bookmarkedIds = bookmarkedIds
                    onClick = onArticleClick,
                    onBookmarkClick = onBookmarkClick,
                )
            }
        }
        BackToTopButton(visible = showBackToTop, listState = listState)
    }
}

@Composable
fun ArticleRow(
    article: Article,                 // all String fields: stable, compared with equals
    isBookmarked: Boolean,
    onClick: (String) -> Unit,
    onBookmarkClick: (String, Boolean) -> Unit,
) { /* Card with title, source and a bookmark icon */ }`,
        remember: 'Give each row only what it shows. derivedStateOf turns a per-frame value into a rare change.',
        mistakes: [
          { title: 'Promising stability you don’t have', bad: `@Immutable
data class NewsUiState(val bookmarkedIds: MutableSet<String>)`, good: `data class NewsUiState(val bookmarkedIds: Set<String>)   // and pass rows a Boolean`, why: '<code>@Immutable</code> is a promise the compiler trusts. If the set is changed in place, composables skip and show stale bookmarks. Keep state truly immutable and narrow what each row reads.' },
          { title: 'derivedStateOf that changes as often as its input', bad: `val index by remember { derivedStateOf { listState.firstVisibleItemIndex } }`, good: `val showBackToTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 2 } }`, why: '<code>derivedStateOf</code> only helps when the result changes less often than the state it reads. Copying a value one to one adds overhead and saves nothing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pass each row a Boolean, key the rows, and derive the Back to top flag.', code: 'items(articles, key = { it.[[id]] }) { article ->\n    ArticleRow(article, isBookmarked = article.id [[in]] bookmarkedIds)\n}\n\nval showBackToTop by remember { [[derivedStateOf]] { listState.firstVisibleItemIndex > 2 } }', why: 'Keys tie each row to its article, the Boolean only changes for the row that was bookmarked, and <code>derivedStateOf</code> only notifies readers when the flag flips.' },
          { type: 'bug', prompt: 'Lint warns about one line here, and the list still recomposes too much. Tap it.', code: '@Composable\nfun ArticleList(articles: List<Article>, bookmarkedIds: Set<String>) {\n    val listState = rememberLazyListState()\n    val showBackToTop by derivedStateOf { listState.firstVisibleItemIndex > 2 }\n    LazyColumn(state = listState) {\n        items(articles, key = { it.id }) { ArticleRow(it, isBookmarked = it.id in bookmarkedIds) }\n    }\n    BackToTopButton(visible = showBackToTop, listState = listState)\n}', bug: 3, fix: '    val showBackToTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 2 } }', why: 'Without <code>remember</code>, every recomposition creates a new derived state object and its caching is lost. Always wrap <code>derivedStateOf</code> in <code>remember</code>.' },
        ],
        quiz: [
          { q: 'Each <code>ArticleRow</code> takes the whole <code>bookmarkedIds: Set&lt;String&gt;</code>. Why do all rows recompose when one bookmark changes?', options: ['The new set is a different object, and an unstable Set is compared by instance, so every row’s input looks changed', 'Bookmarks are written on the main thread', 'LazyColumn redraws everything on any change'], a: 0, why: 'Every row receives the same new set. Passing a Boolean means only the row whose value actually changed has a different input.' },
          { q: 'With strong skipping on, how does Compose compare an unstable parameter?', options: ['With equals()', 'By instance (===)', 'It never skips'], a: 1, why: 'Strong skipping lets composables with unstable parameters skip, but only when the same instance is passed again.' },
          { q: 'Why does reading <code>listState.layoutInfo</code> in composition hurt while scrolling?', options: ['It throws while scrolling', 'It is a new value on every scroll frame, so the reader recomposes every frame', 'It disables keys'], a: 1, why: 'Read it inside <code>derivedStateOf</code> (or use <code>firstVisibleItemIndex</code> there) so composition only hears about the change you care about.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          ph.el.classList.add('cq-insp', 'cq-bmk');
          const N = 36, MAX = 34;
          const bars = Array.from({ length: N }, () => h('span', { class: 'cq-fr', style: 'height:20%' }));
          const budget = h('div', { class: 'cq-budget', style: `bottom:${(16.7 / MAX) * 68}px` }, h('span', {}, '16.7 ms'));
          const chart = h('div', { class: 'cq-frames', role: 'img', 'aria-label': 'Frame times' }, bars, budget);
          const o = out();
          let after = false, busy = false, down = false, frames = [];
          const jitter = (a, b) => a + Math.random() * (b - a);
          function paintFrames() { frames.forEach((ms, i) => { bars[i].style.height = Math.round((Math.min(ms, MAX) / MAX) * 68) + 'px'; bars[i].classList.toggle('slow', ms > 16.7); }); }
          const push = ms => { frames.push(ms); frames.shift(); paintFrames(); };
          const visible = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
          async function bookmark() {
            if (busy) return; busy = true;
            try {
              ph.setSaved('a4', !ph.saved.has('a4'));
              if (after) { ph.count('a4'); push(jitter(6, 9)); }
              else {
                for (const id of visible) { ph.count(id, true); await sleep(60); if (!live()) return; }
                push(jitter(19, 24)); push(jitter(17, 21));
              }
              say(o, after
                ? '<span class="good">1 row recomposed.</span> Only its isBookmarked changed; the other rows get equal inputs and skip.'
                : `<span class="bad">${visible.length} rows recomposed</span> for one bookmark. Every row got the new Set.`);
            } finally { busy = false; }
          }
          async function scroll() {
            if (busy) return; busy = true;
            try {
              const goDown = !down;
              let n = 0, shown = !ph.fab.hidden;
              for (let f = 1; f <= 14; f++) {
                const px = goDown ? f * 11 : (14 - f) * 11;
                ph.scrollTo(px);
                const show = px > 92;
                if (!after) { ph.countScreen(1, true); n++; }
                else if (show !== shown) { ph.countScreen(1); n++; }
                shown = show; ph.fab.hidden = !show;
                push(after ? jitter(6, 11) : jitter(15, 29));
                await sleep(55);
                if (!live()) return;
              }
              down = goDown;
              say(o, after
                ? `<span class="good">List recomposed ${n} time${n === 1 ? '' : 's'}</span>, when showBackToTop flipped. Frames stay under budget.`
                : `<span class="bad">List recomposed on all ${n} frames.</span> layoutInfo is new on every scroll frame and is read in composition.`);
            } finally { busy = false; }
          }
          frame(el, 4, ph, {
            guard: () => !busy,
            side: [h('p', { class: 'cq-cap' }, 'Frame times while you interact'), chart],
            below: [h('div', { class: 'controls' }, cmd('bookmark "City council…"', bookmark), cmd('scroll the list', scroll)), o],
            onMode(a) {
              after = a; ph.reset(); ph.resetCounts(); down = false;
              frames = Array.from({ length: N }, () => jitter(6, 10)); paintFrames();
              say(o, a ? 'Rows now get a Boolean and the flag is derived. Try the same two actions.' : 'Badges are Layout Inspector recomposition counts. Bookmark a story, then scroll.');
            },
          });
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'leak',
        title: 'Find and fix a memory leak',
        tagline: 'Rotate five times, keep one Activity.',
        level: 'advanced',
        refs: ['perf.leaks', 'flow.callbackflow', 'flow.lifecycle'],
        body: `
<p>Users can’t tell they are offline until a pull fails. So an offline banner went in quickly: a <code>@Singleton</code> <code>NetworkMonitor</code> that keeps a list of listeners, and <code>ArticleListScreen</code> adds a lambda to it. We add LeakCanary to debug builds, rotate the phone a few times, and it reports a retained <code>MainActivity</code>. The lambda captured the Activity’s context, nothing ever removed it, and every rotation left a destroyed Activity behind.</p>
<p>The fix moves network status into the data layer as a <code>Flow</code>. <code>callbackFlow</code> registers a <code>ConnectivityManager</code> callback when someone collects and unregisters it in <code>awaitClose</code> when they stop. <code>NewsViewModel</code> turns it into a <code>StateFlow</code> with <code>WhileSubscribed(5_000)</code>, which survives rotation, and the screen collects it with <code>collectAsStateWithLifecycle</code>. No UI object is ever stored in a singleton.</p>
<p>Tests change a little: <code>NewsViewModel</code> now also takes a <code>NetworkMonitor</code>, so <code>setUp()</code> passes a <code>FakeNetworkMonitor</code> backed by a <code>MutableStateFlow</code>. One new test checks that going offline flips <code>isOnline</code>.</p>`,
        code: `// Before: a singleton that keeps every listener it is given
// class NetworkMonitor { private val listeners = mutableListOf<(Boolean) -> Unit>() ... }
// ArticleListScreen: LaunchedEffect(Unit) { monitor.addListener { online -> Toast.makeText(context, ...) } }

interface NetworkMonitor {
    val isOnline: Flow<Boolean>
}

class ConnectivityNetworkMonitor @Inject constructor(
    @ApplicationContext private val context: Context,
) : NetworkMonitor {
    override val isOnline: Flow<Boolean> = callbackFlow {
        val cm = context.getSystemService<ConnectivityManager>()!!
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { trySend(true) }
            override fun onLost(network: Network) { trySend(false) }
        }
        trySend(cm.activeNetwork != null)
        cm.registerDefaultNetworkCallback(callback)
        awaitClose { cm.unregisterNetworkCallback(callback) }
    }.distinctUntilChanged()
}

// di/RepositoryModule: @Binds abstract fun bindNetworkMonitor(impl: ConnectivityNetworkMonitor): NetworkMonitor

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
    networkMonitor: NetworkMonitor,
) : ViewModel() {
    val isOnline: StateFlow<Boolean> = networkMonitor.isOnline
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), initialValue = true)
    // uiState and refresh() as before
}

// NewsNavHost, list destination
val isOnline by viewModel.isOnline.collectAsStateWithLifecycle()
// ArticleListScreen(state, isOnline, onRefresh, onArticleClick) shows OfflineBanner() when !isOnline

// app/build.gradle.kts
// debugImplementation(libs.leakcanary.android)`,
        remember: 'Singletons outlive screens. Never hand them a UI object; expose a Flow and let the collector come and go.',
        terms: [
          { term: 'Retained object', def: 'An object LeakCanary expected to be garbage collected, such as a destroyed Activity, that is still reachable after a GC.' },
        ],
        mistakes: [
          { title: 'Storing an Activity in a long-lived object', bad: `object ImageCache { lateinit var context: Context }
// in MainActivity.onCreate
ImageCache.context = this`, good: `ImageCache.context = applicationContext`, why: 'An <code>object</code> lives as long as the process. Holding the Activity keeps its whole view tree in memory after rotation. Use the application context for long-lived work.' },
          { title: 'callbackFlow without awaitClose', bad: `callbackFlow {
    cm.registerDefaultNetworkCallback(callback)
}`, good: `callbackFlow {
    cm.registerDefaultNetworkCallback(callback)
    awaitClose { cm.unregisterNetworkCallback(callback) }
}`, why: 'Without <code>awaitClose</code> the block returns at once, the flow fails with an IllegalStateException, and the callback is never removed.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Unregister when collection stops, and keep the status alive for 5 s across rotation.', code: 'callbackFlow {\n    cm.registerDefaultNetworkCallback(callback)\n    [[awaitClose]] { cm.unregisterNetworkCallback(callback) }\n}\n\nval isOnline = networkMonitor.isOnline\n    .stateIn(viewModelScope, SharingStarted.[[WhileSubscribed]](5_000), true)', why: '<code>awaitClose</code> runs when the collector goes away. <code>WhileSubscribed(5_000)</code> keeps the callback through a rotation and drops it 5 s after the screen is really gone.' },
          { type: 'bug', prompt: 'LeakCanary reports a retained Activity after rotation. Tap the line that leaks.', code: '@Composable\nfun OfflineBanner(monitor: LegacyNetworkMonitor) {\n    var online by remember { mutableStateOf(true) }\n    DisposableEffect(monitor) {\n        val listener: (Boolean) -> Unit = { online = it }\n        monitor.addListener(listener)\n        onDispose { }\n    }\n    if (!online) Banner("You\'re offline")\n}', bug: 6, fix: '        onDispose { monitor.removeListener(listener) }', why: 'The listener captures state that belongs to this screen. A singleton monitor keeps it, and the destroyed Activity with it, until you remove it in <code>onDispose</code>.' },
        ],
        quiz: [
          { q: 'What kept the old <code>MainActivity</code> alive?', options: ['The ViewModel', 'A lambda in the singleton NetworkMonitor’s listener list that captured the Activity context', 'Room’s database'], a: 1, why: 'The singleton lives as long as the app. Anything it references, and everything those reference, cannot be collected.' },
          { q: 'Why expose network status as a Flow from the data layer?', options: ['Flows are faster than callbacks', 'Registration follows collection: awaitClose unregisters when the last collector stops', 'Hilt cannot inject listeners'], a: 1, why: '<code>callbackFlow</code> ties the callback’s lifetime to the collector, so there is nothing to forget to remove.' },
          { q: 'After rotation, does the new screen register a second network callback?', options: ['Yes, every rotation adds one', 'No: the ViewModel survives rotation and WhileSubscribed(5_000) keeps the single upstream running', 'Only on tablets'], a: 1, why: 'The new screen collects the same StateFlow from the same ViewModel within 5 s, so the upstream never restarts.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          ph.el.classList.add('cq-bmk');
          const heap = h('div', { class: 'cq-heap', 'aria-label': 'Heap' });
          const o = out();
          let after = false, busy = false, acts = [], next = 1, listeners = 0;
          const mb = h('b', {}, '');
          function paint() {
            const mon = h('div', { class: 'cq-act mon' }, after ? 'NetworkMonitor' : 'NetworkMonitor (singleton)', h('small', {}, after ? 'isOnline: 1 collector (NewsViewModel)' : `listeners: ${listeners} lambda${listeners === 1 ? '' : 's'}`));
            heap.replaceChildren(mon, ...acts.map(a => h('div', { class: 'cq-act' + (a.live ? '' : after ? ' dead' : ' leak') },
              `MainActivity #${a.n}`, h('small', {}, a.live ? 'live' : after ? 'destroyed, unreachable' : 'destroyed, still referenced'))));
            mb.textContent = `${36 + acts.length * 9} MB`;
          }
          function reset() { acts = [{ n: 1, live: true }]; next = 2; listeners = 1; paint(); }
          async function rotate() {
            if (busy) return;
            if (acts.length >= 7) { say(o, 'That is enough to see the trend. Run a GC or LeakCanary.'); return; }
            busy = true;
            try {
              replay(ph.el, 'cq-spin');
              await sleep(350); if (!live()) return;
              acts.forEach(a => { a.live = false; });
              acts.push({ n: next++, live: true });
              if (!after) listeners++;
              paint();
              say(o, after ? 'New Activity created. The old one is destroyed and nothing points at it.' : `New Activity created, and the new screen added listener #${listeners}. The old Activity is still in the list.`);
              await sleep(350);
            } finally { busy = false; }
          }
          async function gc() {
            if (busy) return; busy = true;
            try {
              const before = acts.length;
              acts = acts.filter(a => a.live || !after);
              paint(); replay(heap, 'pop-soft');
              const freed = before - acts.length, kept = acts.length - 1;
              say(o, after ? `<span class="good">GC freed ${freed} Activit${freed === 1 ? 'y' : 'ies'}.</span> Heap back to ${mb.textContent}.` : `<span class="bad">GC freed nothing.</span> ${kept} destroyed Activit${kept === 1 ? 'y is' : 'ies are'} reachable from the singleton.`);
              await sleep(300);
            } finally { busy = false; }
          }
          function leakCanary() {
            if (busy) return;
            const retained = after ? 0 : acts.filter(a => !a.live).length;
            if (!retained) { say(o, after ? '<span class="good">LeakCanary: 0 retained objects.</span>' : 'LeakCanary: nothing retained yet. Rotate first.'); return; }
            o.innerHTML = `<span class="bad">LeakCanary: ${retained} retained MainActivity</span>`
              + '<div class="line">NetworkMonitor instance (singleton in SingletonComponent)</div>'
              + '<div class="line">↓ NetworkMonitor.listeners  ArrayList</div>'
              + '<div class="line">↓ [0]  lambda in ArticleListScreen</div>'
              + '<div class="line">↓ captured context  MainActivity</div>'
              + '<div class="line"><span class="bad">╳ MainActivity received onDestroy() but is still reachable</span></div>';
            replay(o, 'pop-soft');
          }
          const offBtn = cmd('go offline', () => {
            const on = ph.banner.hidden;
            ph.offline(on); offBtn.setAttribute('aria-pressed', String(on));
            say(o, on ? 'onLost → trySend(false) → isOnline is false → the banner shows.' : 'onAvailable → trySend(true) → the banner hides.');
          }, { 'aria-pressed': 'false' });
          frame(el, 5, ph, {
            guard: () => !busy,
            side: [h('p', { class: 'cq-cap' }, 'Heap · ', mb), heap],
            below: [h('div', { class: 'controls' }, cmd('rotate', rotate), cmd('force GC', gc), cmd('run LeakCanary', leakCanary), offBtn), o],
            onMode(a) { after = a; reset(); say(o, a ? 'NetworkMonitor is now a callbackFlow collected by the ViewModel. Rotate, GC, check.' : 'The quick offline banner is in. Rotate a few times, force a GC, then run LeakCanary.'); },
          });
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'a11y-pass',
        title: 'Accessibility pass',
        tagline: 'Labels, targets, announcements and 200% text.',
        level: 'advanced',
        refs: ['a11y.semantics', 'a11y.targets', 'a11y.text-scale'],
        body: `
<p>We run Accessibility Scanner and TalkBack over the list and find six issues, most in code added in steps 4 and 5. The bookmark icon has no label and a 24 dp touch target. The source line uses <code>Color.Gray</code>, too low in contrast. Refresh only exists as a pull gesture, which TalkBack and Switch Access users can’t easily perform. The offline banner appears silently. And at 200% font size the fixed row height cuts off headlines.</p>
<p>The fixes are small. <code>IconToggleButton</code> gives a 48 dp target and toggle semantics; we add <code>contentDescription</code> and a <code>stateDescription</code>. A Refresh <code>IconButton</code> in the top app bar does the same as the pull. <code>heightIn(min = …)</code> replaces <code>height</code>. <code>onSurfaceVariant</code> replaces the gray. <code>liveRegion</code> makes TalkBack announce the banner when it appears.</p>
<p>Then we keep them fixed. Two new UI tests turn on Accessibility Test Framework checks with <code>enableAccessibilityChecks()</code> and render the screen at double font size with <code>DeviceConfigurationOverride</code>.</p>`,
        code: `@Composable
fun ArticleRow(article: Article, isBookmarked: Boolean, onClick: (String) -> Unit, onBookmarkClick: (String, Boolean) -> Unit) {
    Card(
        onClick = { onClick(article.id) },
        modifier = Modifier.fillMaxWidth().heightIn(min = 72.dp),        // was height(72.dp)
    ) {
        Row(Modifier.padding(start = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f).padding(vertical = 8.dp)) {
                Text(article.title, style = MaterialTheme.typography.titleMedium, maxLines = 3, overflow = TextOverflow.Ellipsis)
                Text(
                    article.source,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,    // was Color.Gray
                )
            }
            IconToggleButton(                                             // 48 dp target, toggle semantics
                checked = isBookmarked,
                onCheckedChange = { onBookmarkClick(article.id, it) },
                modifier = Modifier.semantics { stateDescription = if (isBookmarked) "Saved" else "Not saved" },
            ) {
                Icon(painterResource(if (isBookmarked) R.drawable.ic_bookmark_filled else R.drawable.ic_bookmark), contentDescription = "Bookmark")
            }
        }
    }
}

// ArticleListScreen: Scaffold(topBar = { ... }) gets a Refresh action next to pull-to-refresh
TopAppBar(
    title = { Text("News") },
    actions = { IconButton(onClick = onRefresh) { Icon(painterResource(R.drawable.ic_refresh), contentDescription = "Refresh") } },
)
OfflineBanner(Modifier.semantics { liveRegion = LiveRegionMode.Polite })

// src/androidTest/.../ArticleListA11yTest.kt   (androidx.compose.ui:ui-test-junit4-accessibility)
class ArticleListA11yTest {
    @get:Rule val rule = createAndroidComposeRule<ComponentActivity>()
    @Before fun setUp() { rule.enableAccessibilityChecks() }

    @Test fun passesChecksAtDoubleFontSize() {
        rule.setContent {
            DeviceConfigurationOverride(DeviceConfigurationOverride.FontScale(2f)) {
                MaterialTheme { ArticleListScreen(sampleState, isOnline = true, onRefresh = {}, onArticleClick = {}) }
            }
        }
        rule.onRoot().tryPerformAccessibilityChecks()
        rule.onAllNodesWithContentDescription("Bookmark")[0].assertTouchHeightIsEqualTo(48.dp)
    }
}`,
        remember: 'Label it, make it 48 dp, let text grow, give gestures a button, announce changes. Then lock it in with a test.',
        terms: [
          { term: 'enableAccessibilityChecks', def: 'Turns on Accessibility Test Framework checks in a Compose UI test, so actions fail on problems such as missing labels or small touch targets.' },
          { term: 'DeviceConfigurationOverride', def: 'A Compose test API that overrides font scale, size, locale or other configuration for the content inside it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let rows grow with text, give the bookmark a real button, and announce the banner.', code: 'Card(onClick = { onClick(article.id) }, modifier = Modifier.fillMaxWidth().[[heightIn]](min = 72.dp)) { /* ... */ }\n\n[[IconToggleButton]](checked = isBookmarked, onCheckedChange = { onBookmarkClick(article.id, it) }) {\n    Icon(painterResource(R.drawable.ic_bookmark), contentDescription = "Bookmark")\n}\n\nOfflineBanner(Modifier.semantics { [[liveRegion]] = LiveRegionMode.Polite })', why: '<code>heightIn(min)</code> sets a floor, not a ceiling. <code>IconToggleButton</code> brings a 48 dp target and checked state. A polite live region makes TalkBack read the banner when it appears.' },
          { type: 'bug', prompt: 'TalkBack says “Unlabeled button” and the target is too small. Tap the line.', code: 'Card(onClick = { onClick(article.id) }, modifier = Modifier.fillMaxWidth().heightIn(min = 72.dp)) {\n    Row(verticalAlignment = Alignment.CenterVertically) {\n        Text(article.title, Modifier.weight(1f).padding(12.dp), maxLines = 3, overflow = TextOverflow.Ellipsis)\n        Icon(painterResource(R.drawable.ic_bookmark), contentDescription = null, modifier = Modifier.clickable { onBookmarkClick(article.id, !isBookmarked) })\n    }\n}', bug: 3, fix: '        IconToggleButton(checked = isBookmarked, onCheckedChange = { onBookmarkClick(article.id, it) }) { Icon(painterResource(R.drawable.ic_bookmark), contentDescription = "Bookmark") }', why: 'A clickable 24 dp icon with <code>contentDescription = null</code> is an unlabeled, tiny target. <code>IconToggleButton</code> gives 48 dp and toggle state; the description names it.' },
        ],
        quiz: [
          { q: 'At 200% font size, headlines are cut off. Which change fixes it?', options: ['Use dp instead of sp for the title', 'Replace <code>height(72.dp)</code> with <code>heightIn(min = 72.dp)</code>', 'Set <code>maxLines = 1</code>'], a: 1, why: 'Text must be free to grow. A minimum height keeps the layout tidy at normal size without capping it.' },
          { q: 'Why add a Refresh button when the list already has pull-to-refresh?', options: ['Pull gestures are hard or impossible for TalkBack and Switch Access users; a button is reachable by everyone', 'PullToRefreshBox is deprecated', 'Buttons refresh faster'], a: 0, why: 'Any action that only exists as a gesture needs an accessible alternative, such as a button or a custom accessibility action.' },
          { q: 'Why add <code>enableAccessibilityChecks()</code> to UI tests?', options: ['It fixes the issues for you', 'Regressions such as a new unlabeled button fail the build instead of reaching users', 'It turns on TalkBack on the emulator'], a: 1, why: 'The checks run on test actions and fail on Accessibility Test Framework issues, so the pass stays done.' },
        ],
        visual(el) {
          const ph = phone();
          ph.el.classList.add('cq-bmk');
          const R = ph.rows;
          const o = out();
          let after = false, focus = -1;
          const ISSUES = [
            { el: () => R.a1.bm, text: 'Bookmark icon has no label' },
            { el: () => R.a2.bm, text: 'Touch target 24 × 24 dp, needs 48 × 48' },
            { el: () => R.a1.meta, text: 'Text contrast 3.1:1, needs 4.5:1' },
            { el: () => ph.bar, text: 'Refresh only works as a pull gesture' },
            { el: () => ph.banner, text: 'Offline banner is not announced' },
            { el: () => R.a3.el, text: 'Fixed row height clips text at 200%' },
          ];
          const ORDER = () => after ? [
            [ph.bar, 'News'],
            [ph.rf, 'Refresh, button. Double tap to activate'],
            [ph.banner, 'You’re offline. (announced when it appeared: polite live region)'],
            [R.a1.el, 'Library extends weekend opening hours, Local, button. Double tap to activate'],
            [R.a1.bm, 'Bookmark, Not saved, checkbox. Double tap to toggle'],
            [R.a2.el, 'Rail line reopens after two weeks of repairs, Transport, button. Double tap to activate'],
          ] : [
            [ph.bar, 'News'],
            [ph.banner, 'You’re offline. (silent when it appeared)'],
            [R.a1.el, 'Library extends weekend opening hours, Local, button. Double tap to activate'],
            [R.a1.bm, 'Unlabeled button. Double tap to activate'],
            [R.a2.el, 'Rail line reopens after two weeks of repairs, Transport, button. Double tap to activate'],
          ];
          const clear = () => { el.querySelectorAll('.cq-issue').forEach(x => { x.classList.remove('cq-issue'); x.removeAttribute('data-n'); }); el.querySelectorAll('.cq-focus').forEach(x => x.classList.remove('cq-focus')); ph.el.classList.remove('cq-tgt'); };
          function scan() {
            clear(); focus = -1;
            ph.el.classList.add('cq-tgt');
            if (after) { say(o, '<span class="good">Accessibility Scanner: no suggestions.</span> Dashed boxes show the 48 dp targets.'); return; }
            ISSUES.forEach((x, i) => { const e = x.el(); e.classList.add('cq-issue'); e.dataset.n = String(i + 1); });
            o.innerHTML = '<span class="bad">6 suggestions</span>' + ISSUES.map((x, i) => `<div class="line">${i + 1}. ${x.text}</div>`).join('');
            replay(o, 'pop-soft');
          }
          function talk() {
            clear();
            const order = ORDER();
            focus = (focus + 1) % order.length;
            const [e, said] = order[focus];
            e.classList.add('cq-focus');
            say(o, `<span class="muted">TalkBack:</span> “${said}”`);
          }
          const scaleBtns = [1, 1.5, 2].map(s => h('button', { class: 'cmd', 'aria-pressed': String(s === 1), onclick() {
            ph.el.style.setProperty('--cq-fs', String(s));
            scaleBtns.forEach(b => b.setAttribute('aria-pressed', String(b === this)));
            say(o, s === 2 && !after ? '<span class="bad">200%:</span> rows keep height(72.dp), so headlines are cut off.' : `Font size ${Math.round(s * 100)}%${s > 1 && after ? ': rows grow with the text.' : '.'}`);
          } }, `font ${Math.round(s * 100)}%`));
          frame(el, 6, ph, {
            side: [h('p', { class: 'cq-cap' }, 'Font scale'), h('div', { class: 'cq-scale' }, scaleBtns)],
            below: [h('div', { class: 'controls' }, cmd('Accessibility Scanner', scan), cmd('TalkBack: swipe right', talk)), o],
            onMode(a) {
              after = a; clear(); focus = -1;
              ph.offline(true);
              ph.el.classList.toggle('cq-fixed', !a); ph.el.classList.toggle('cq-lowc', !a);
              ph.el.classList.toggle('cq-big', a); ph.el.classList.toggle('cq-hasrf', a);
              say(o, a ? 'All six fixes are in. Scan again, swipe through with TalkBack, and try 200%.' : 'Scan the screen, swipe through it with TalkBack, then try 200% text.');
            },
          });
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'adaptive',
        title: 'Adaptive list-detail for tablets',
        tagline: 'One pane on phones, two on wide screens.',
        level: 'advanced',
        refs: ['a11y.window-size', 'a11y.foldables', 'capapp.screens'],
        body: `
<p>On a tablet in landscape the News Reader shows one huge stretched list, and opening a story throws the list away. Wide screens have room for both. This step replaces the two-destination <code>NavHost</code> inside <code>NewsNavHost</code> with <code>NavigableListDetailPaneScaffold</code> from Material 3 adaptive.</p>
<p>The scaffold reads the window size class and decides how many panes fit. By default it shows two panes from the expanded width class (840 dp) up and one below it, so phones and an unfolded foldable in portrait keep the single-pane flow. <code>rememberListDetailPaneScaffoldNavigator&lt;String&gt;()</code> holds the selected article id as the detail pane’s <code>contentKey</code>, survives rotation, and handles system back. <code>navigateTo</code> is a suspend function, so we call it from a coroutine scope.</p>
<p>One more change: <code>ArticleViewModel</code> used to read the id from its route through <code>SavedStateHandle</code>. A pane has no route, so the id now comes in through a Hilt assisted factory, keyed by id so each article gets its own ViewModel. Check every size with <code>@PreviewScreenSizes</code> and a resizable emulator.</p>`,
        code: `@Composable
fun NewsNavHost(newsViewModel: NewsViewModel = hiltViewModel()) {
    val state by newsViewModel.uiState.collectAsStateWithLifecycle()
    val isOnline by newsViewModel.isOnline.collectAsStateWithLifecycle()
    val navigator = rememberListDetailPaneScaffoldNavigator<String>()
    val scope = rememberCoroutineScope()

    NavigableListDetailPaneScaffold(
        navigator = navigator,
        listPane = {
            AnimatedPane {
                ArticleListScreen(
                    state = state,
                    isOnline = isOnline,
                    onRefresh = newsViewModel::refresh,
                    onArticleClick = { id ->
                        scope.launch { navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, id) }
                    },
                )
            }
        },
        detailPane = {
            AnimatedPane {
                val id = navigator.currentDestination?.contentKey
                if (id == null) {
                    SelectAnArticle()
                } else {
                    val vm = hiltViewModel<ArticleViewModel, ArticleViewModel.Factory>(key = id) { it.create(id) }
                    val article by vm.article.collectAsStateWithLifecycle()
                    ArticleDetailScreen(article, onBack = { scope.launch { navigator.navigateBack() } })
                }
            }
        },
    )
}

@HiltViewModel(assistedFactory = ArticleViewModel.Factory::class)
class ArticleViewModel @AssistedInject constructor(
    @Assisted articleId: String,
    repository: NewsRepository,
) : ViewModel() {
    val article: StateFlow<Article?> = repository.observeArticle(articleId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    @AssistedFactory interface Factory { fun create(articleId: String): ArticleViewModel }
}

// app/build.gradle.kts
// implementation(libs.androidx.compose.material3.adaptive.navigation)`,
        remember: 'Decide panes by window width class, never by device type or orientation. The scaffold does it for you.',
        challenges: [
          { type: 'blank', prompt: 'Create the navigator, open an article in the detail pane, and read its id back.', code: 'val navigator = [[rememberListDetailPaneScaffoldNavigator]]<String>()\n\nscope.launch { navigator.[[navigateTo]](ListDetailPaneScaffoldRole.Detail, id) }\n\nval id = navigator.currentDestination?.[[contentKey]]', why: 'The navigator keeps the pane back stack. <code>navigateTo</code> moves to the detail role with a key, and <code>contentKey</code> gives it back to the detail pane.' },
          { type: 'bug', prompt: 'A landscape phone gets two cramped panes and a portrait tablet gets one stretched pane. Tap the cause.', code: '@Composable\nfun NewsLayout(list: @Composable () -> Unit, detail: @Composable () -> Unit) {\n    val twoPane = LocalConfiguration.current.orientation == Configuration.ORIENTATION_LANDSCAPE\n    if (twoPane) {\n        Row { Box(Modifier.weight(1f)) { list() }; Box(Modifier.weight(1.3f)) { detail() } }\n    } else {\n        list()\n    }\n}', bug: 2, fix: '    val twoPane = currentWindowAdaptiveInfo().windowSizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)', why: 'Orientation says nothing about how much width the window has. Multi-window, foldables and landscape phones all break it. Decide from the window size class.' },
        ],
        quiz: [
          { q: 'By default, at which window width class does the list-detail scaffold show two panes side by side?', options: ['Compact (under 600 dp)', 'Medium (600 to 840 dp)', 'Expanded (840 dp and up)'], a: 2, why: 'The default directive allows two horizontal panes from expanded width. Below that it shows one pane at a time.' },
          { q: 'Why does <code>ArticleViewModel</code> switch to an assisted factory?', options: ['Assisted injection is faster', 'In a pane there is no navigation route, so the id can’t come from SavedStateHandle; it is passed in when the ViewModel is created', 'Hilt no longer supports SavedStateHandle'], a: 1, why: 'The detail pane knows the id from <code>contentKey</code> and hands it to the factory. Keying by id gives each article its own ViewModel.' },
          { q: 'What happens to the selected article when a foldable unfolds from one pane to two?', options: ['It is lost, the user starts over', 'The navigator keeps it as contentKey, so the detail pane shows it next to the list', 'The app restarts'], a: 1, why: 'The navigator state survives configuration changes. The same destination is shown with a different pane layout.' },
        ],
        visual(el) {
          const ph = phone();
          ph.el.classList.add('cq-tap', 'cq-bmk', 'cq-big', 'cq-hasrf');
          const o = out();
          let after = false, size = 'compact';
          const SIZES = { compact: ['Phone', 411, 'Compact'], medium: ['Foldable, unfolded', 673, 'Medium'], expanded: ['Tablet, landscape', 1280, 'Expanded'] };
          const two = () => after && size === 'expanded';
          function apply() {
            ph.layout(size, two());
            const [name, dp, cls] = SIZES[size];
            say(o, `${name}: ${dp} dp wide · ${cls} · ${two() ? '2 panes' : '1 pane'}${!after && size === 'expanded' ? ' <span class="bad">stretched phone layout</span>' : ''}`);
          }
          const sizeBtns = Object.keys(SIZES).map(k => h('button', { class: 'cmd', 'aria-pressed': String(k === size), onclick() {
            size = k; sizeBtns.forEach(b => b.setAttribute('aria-pressed', String(b === this))); apply();
          } }, SIZES[k][0]));
          function openArticle(id) {
            ph.open(id);
            say(o, two() ? `navigateTo(Detail, "${id}"): the detail pane updates, the list stays.` : `navigateTo(Detail, "${id}"): one pane fits, so the detail replaces the list. Press back.`);
          }
          function back() {
            if (!ph.openId) { say(o, 'Nothing to go back to.'); return; }
            ph.back();
            say(o, two() ? 'Back cleared the selection. Both panes stay.' : 'Back: the list pane returns.');
          }
          Object.values(ph.rows).forEach(r => r.el.addEventListener('click', () => openArticle(r.a.id)));
          ph.detail.addEventListener('click', e => { if (e.target.classList.contains('cq-back')) back(); });
          frame(el, 7, ph, {
            side: [h('p', { class: 'cq-cap' }, 'Window'), h('div', { class: 'cq-scale' }, sizeBtns)],
            below: [h('div', { class: 'controls' }, cmd('tap "City council…"', () => openArticle('a4')), cmd('tap "Storm expected…"', () => openArticle('a5')), cmd('system back', back)), o],
            onMode(a) { after = a; ph.back(); apply(); },
          });
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'startup',
        title: 'Baseline Profile and startup numbers',
        tagline: 'Measure the cold start, then make it faster.',
        level: 'advanced',
        refs: ['testing.baseline', 'perf.startup', 'build.variants'],
        body: `
<p>First we measure. A <code>:baselineprofile</code> module holds a Macrobenchmark that cold-starts the release build ten times and reports <code>timeToInitialDisplayMs</code> (first frame) and <code>timeToFullDisplayMs</code>. For the second number to mean anything, <code>ArticleListScreen</code> calls <code>ReportDrawnWhen</code> once real articles are on screen, not while the spinner shows.</p>
<p>Then we generate a Baseline Profile. A generator test launches the app, waits for the list and scrolls it, while the plugin records which classes and methods ran. The profile ships in the APK, and ART compiles those methods ahead of time at install, so a fresh install does not start in the interpreter. <code>includeInStartupProfile = true</code> also feeds R8 so the startup code sits together in the DEX file.</p>
<p>UiAutomator finds Compose nodes by resource id, so <code>MainActivity</code> turns on <code>testTagsAsResourceId</code> at the root and we reuse the <code>article_list</code> tag from step 3. Run the benchmark again with <code>BaselineProfileMode.Require</code> and compare medians.</p>`,
        code: `// :baselineprofile/build.gradle.kts: plugins { id("com.android.test"); id("androidx.baselineprofile") }
// app/build.gradle.kts: plugins { id("androidx.baselineprofile") }
//   dependencies { baselineProfile(project(":baselineprofile")); implementation(libs.androidx.profileinstaller) }

@RunWith(AndroidJUnit4::class)
class NewsBaselineProfile {
    @get:Rule val rule = BaselineProfileRule()

    @Test fun generate() = rule.collect(
        packageName = "com.example.news",
        includeInStartupProfile = true,
    ) {
        pressHome()
        startActivityAndWait()
        device.wait(Until.hasObject(By.res("article_list")), 5_000)
        device.findObject(By.res("article_list")).fling(Direction.DOWN)
    }
}

@RunWith(AndroidJUnit4::class)
class StartupBenchmark {
    @get:Rule val rule = MacrobenchmarkRule()

    @Test fun coldStartNoProfile() = start(CompilationMode.None())
    @Test fun coldStartWithProfile() = start(CompilationMode.Partial(BaselineProfileMode.Require))

    private fun start(mode: CompilationMode) = rule.measureRepeated(
        packageName = "com.example.news",
        metrics = listOf(StartupTimingMetric()),
        compilationMode = mode,
        startupMode = StartupMode.COLD,
        iterations = 10,
    ) {
        pressHome()
        startActivityAndWait()
    }
}

// MainActivity: let UiAutomator see test tags
setContent { MaterialTheme { Box(Modifier.semantics { testTagsAsResourceId = true }) { NewsNavHost() } } }

// ArticleListScreen: full display = real content, not the spinner
ReportDrawnWhen { !state.isLoading }

// ./gradlew :app:generateBaselineProfile
// ./gradlew :baselineprofile:connectedBenchmarkReleaseAndroidTest`,
        remember: 'Measure the release build cold, report fully drawn at real content, ship a Baseline Profile, measure again.',
        terms: [
          { term: 'TTFD', def: 'Time to full display: from launch until the app reports it is fully drawn, for example when the first real content is on screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Record the profile, pick the startup metric, and force a cold start.', code: '@Test fun generate() = rule.[[collect]](packageName = "com.example.news", includeInStartupProfile = true) {\n    pressHome(); startActivityAndWait()\n}\n\nrule.measureRepeated(\n    packageName = "com.example.news",\n    metrics = listOf([[StartupTimingMetric]]()),\n    startupMode = StartupMode.[[COLD]],\n    iterations = 10,\n) { pressHome(); startActivityAndWait() }', why: '<code>collect</code> records the profile while the block runs. <code>StartupTimingMetric</code> reports TTID and TTFD. <code>COLD</code> kills the process before each iteration.' },
          { type: 'bug', prompt: 'The benchmark’s timeToFullDisplayMs equals the first frame, even though articles appear much later. Tap the cause.', code: '@Composable\nfun ArticleListScreen(state: NewsUiState, onRefresh: () -> Unit, onArticleClick: (String) -> Unit) {\n    ReportDrawn()\n    if (state.isLoading) {\n        LoadingSpinner()\n    } else {\n        ArticleList(state.articles, onArticleClick)\n    }\n}', bug: 2, fix: '    ReportDrawnWhen { !state.isLoading }', why: '<code>ReportDrawn()</code> reports fully drawn on the first composition, while the spinner is showing. Report when the real content is there.' },
        ],
        quiz: [
          { q: 'What does a Baseline Profile change on a fresh install?', options: ['It removes unused code', 'ART compiles the listed startup methods ahead of time, so they don’t start in the interpreter', 'It makes network calls faster'], a: 1, why: 'Without a profile, code starts interpreted and is JIT-compiled as it runs. The profile lets install-time compilation cover the hot path.' },
          { q: 'Why benchmark with <code>StartupMode.COLD</code> on a release build?', options: ['Debug builds are faster', 'Cold starts include process creation and are what new users feel; debug builds are not optimized and give misleading numbers', 'Warm starts can’t be measured'], a: 1, why: 'Release builds run R8 and are what users install. Cold start is the slowest and most visible case.' },
          { q: 'Why add <code>testTagsAsResourceId = true</code> at the root?', options: ['It speeds up composition', 'UiAutomator can find Compose nodes by their test tags as resource ids', 'It is required by Hilt'], a: 1, why: 'Macrobenchmark and the profile generator drive the app with UiAutomator, which sees resource ids, not Compose test tags, unless you expose them.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          ph.el.classList.add('cq-bmk', 'cq-hasrf', 'cq-big');
          const T = {
            before: { proc: 180, app: 330, act: 700, ttid: 890, ttfd: 1240 },
            after: { proc: 170, app: 280, act: 520, ttid: 600, ttfd: 820 },
          };
          const MAX = 1300;
          const LANES = [['process', 0, 'proc'], ['App.onCreate', 'proc', 'app'], ['Activity + UI', 'app', 'act'], ['first frame', 'act', 'ttid'], ['articles', 'ttid', 'ttfd']];
          const laneBars = LANES.map(() => h('span', { class: 'bar run', style: 'left:0;width:0' }));
          const lanes = h('div', { class: 'timeline', 'aria-label': 'Cold start timeline' }, LANES.map((l, i) => h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, l[0]), h('div', { class: 'lane-track' }, laneBars[i]))));
          const iters = h('div', { class: 'cq-iters', 'aria-label': 'Benchmark iterations' });
          const o = out();
          let after = false, busy = false;
          const t = () => T[after ? 'after' : 'before'];
          const pct = ms => (ms / MAX) * 100 + '%';
          function clearLanes() { laneBars.forEach(b => { b.style.width = '0'; b.style.left = '0'; }); }
          async function launch() {
            if (busy) return; busy = true;
            try {
              clearLanes(); ph.reset(); ph.screen('splash');
              const tt = t();
              const start = performance.now();
              for (let i = 0; i < LANES.length; i++) {
                const a = LANES[i][1] ? tt[LANES[i][1]] : 0, b = tt[LANES[i][2]];
                laneBars[i].style.left = pct(a);
                for (let s = 1; s <= 6; s++) { laneBars[i].style.width = pct((b - a) * (s / 6)); await sleep(((b - a) / 6) * 0.9); if (!live()) return; }
                if (LANES[i][2] === 'ttid') ph.screen('loading');
                if (LANES[i][2] === 'ttfd') ph.screen(null);
              }
              const took = Math.round(performance.now() - start);
              say(o, `TTID ${tt.ttid} ms · TTFD ${tt.ttfd} ms ${after ? '<span class="good">with the Baseline Profile</span>' : '<span class="muted">(no profile: startup code starts interpreted)</span>'} <span class="muted">· this replay took ${took} ms</span>`);
            } finally { busy = false; }
          }
          async function bench() {
            if (busy) return; busy = true;
            try {
              iters.replaceChildren();
              const tt = t();
              const vals = [];
              say(o, `<span class="muted">StartupBenchmark.${after ? 'coldStartWithProfile' : 'coldStartNoProfile'}</span> 10 cold starts…`);
              for (let i = 0; i < 10; i++) {
                const v = Math.round(tt.ttfd * (0.92 + Math.random() * 0.16));
                vals.push(v);
                iters.append(h('span', { class: 'cq-it drop-in' }, String(v)));
                replay(ph.el, 'pop-soft');
                await sleep(140); if (!live()) return;
              }
              const sorted = [...vals].sort((a, b) => a - b);
              const med = Math.round((sorted[4] + sorted[5]) / 2);
              let marked = 0;
              [...iters.children].forEach(c => { if (marked < 2 && (Number(c.textContent) === sorted[4] || Number(c.textContent) === sorted[5])) { c.classList.add('med'); marked++; } });
              say(o, `timeToFullDisplayMs <b>median ${med}</b> · min ${sorted[0]} · max ${sorted[9]} ${after ? '<span class="good">about a third faster</span>' : ''}`);
            } finally { busy = false; }
          }
          frame(el, 8, ph, {
            guard: () => !busy,
            side: [h('p', { class: 'cq-cap' }, 'Cold start, one launch'), lanes, h('p', { class: 'cq-cap' }, 'Macrobenchmark iterations (TTFD, ms)'), iters],
            below: [h('div', { class: 'controls' }, cmd('launch once (cold)', launch), cmd('run StartupBenchmark', bench)), o],
            onMode(a) {
              after = a; clearLanes(); iters.replaceChildren(); ph.reset();
              say(o, a ? 'Profile installed: CompilationMode.Partial(BaselineProfileMode.Require). Launch or benchmark.' : 'No profile yet: CompilationMode.None(). Launch once, then run the benchmark.');
            },
          });
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'You shipped a production-quality app',
        tagline: 'Everything, end to end, on one screen.',
        level: 'intermediate',
        refs: ['capapp.recap', 'testing.pyramid', 'perf.r8'],
        body: `
<p>Look at what changed. The News Reader has 8 JVM tests (ViewModel with fakes, state sequences with Turbine, network status), 5 instrumented tests (screen behavior, accessibility checks at double font size) and a startup benchmark. A bookmark redraws one row and scrolling stays under the frame budget. Rotating leaks nothing. TalkBack users get labels, a Refresh button and announcements. Tablets get list and detail side by side. Cold start dropped by about a third, and we can prove it.</p>
<p>The habit matters more than any one fix: measure, change one thing, measure again, and leave a test behind so it stays fixed. Wire the three Gradle commands below into CI so every pull request runs them.</p>
<p>Stretch ideas: add screenshot tests with Compose Preview Screenshot Testing or Roborazzi for each window size and font scale. Watch real-world jank and startup with Android vitals and JankStats. Turn on StrictMode in debug builds to catch disk and network work on the main thread. Test <code>OfflineFirstNewsRepository</code> itself against an in-memory Room database and a fake <code>NewsApi</code>.</p>`,
        code: `// app/build.gradle.kts: what this project added
plugins {
    alias(libs.plugins.baselineprofile)                                         // step 8
}

dependencies {
    implementation(libs.androidx.compose.material3.adaptive.navigation)         // step 7
    implementation(libs.androidx.profileinstaller)                              // step 8
    baselineProfile(project(":baselineprofile"))
    debugImplementation(libs.leakcanary.android)                                // step 5

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)                            // steps 1-2
    testImplementation(libs.turbine)

    androidTestImplementation(libs.androidx.compose.ui.test.junit4.accessibility)   // steps 3, 6
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

// Every pull request:
// ./gradlew testDebugUnitTest                                       8 JVM tests
// ./gradlew connectedDebugAndroidTest                               5 UI and accessibility tests
// ./gradlew :baselineprofile:connectedBenchmarkReleaseAndroidTest   startup numbers`,
        remember: 'Measure, change one thing, measure again, and leave a test behind.',
        challenges: [
          { type: 'blank', prompt: 'Name the two Gradle tasks CI runs for the debug tests.', code: './gradlew [[testDebugUnitTest|test]]          // src/test on the JVM\n./gradlew [[connectedDebugAndroidTest|connectedAndroidTest]]   // src/androidTest on a device', why: 'Local unit tests run on the JVM. Instrumented tests install the app and test APK on a device or emulator.' },
          { type: 'bug', prompt: 'After release, users see a notification about heap dumps. Tap the line in the build file.', code: 'dependencies {\n    implementation(libs.androidx.profileinstaller)\n    baselineProfile(project(":baselineprofile"))\n    implementation(libs.leakcanary.android)\n    testImplementation(libs.turbine)\n    androidTestImplementation(libs.androidx.compose.ui.test.junit4.accessibility)\n}', bug: 3, fix: '    debugImplementation(libs.leakcanary.android)', why: 'LeakCanary pauses the app to dump the heap. It belongs in debug builds only, so use <code>debugImplementation</code>.' },
        ],
        quiz: [
          { q: 'Which order did every step in this project follow?', options: ['Rewrite, then hope', 'Measure, change one thing, measure again, keep a test', 'Add libraries until numbers improve'], a: 1, why: 'Each step showed a number before and after, and most left a test or benchmark behind to keep the gain.' },
          { q: 'Which of these runs on the JVM without a device?', options: ['The Turbine tests of NewsViewModel', 'The accessibility checks at 200% font', 'The startup benchmark'], a: 0, why: 'ViewModel and Flow tests with fakes are local unit tests. UI tests and Macrobenchmark need a device.' },
        ],
        visual(el) {
          const live = () => el.isConnected;
          const ph = phone();
          ph.el.classList.add('cq-insp', 'cq-bmk');
          const run = runner(['src/test  ·  NewsViewModelTest', 'src/androidTest  ·  ArticleListScreenTest, ArticleListA11yTest', ':baselineprofile  ·  StartupBenchmark']);
          const STEPS = ['Cold start', 'Bookmark one story', 'Network drops', 'Rotate the phone', 'Unfold to a tablet', 'Fold back', 'Run every test'];
          const tour = h('ol', { class: 'cq-tour' }, STEPS.map(s => h('li', {}, s)));
          const o = out();
          let after = false, busy = false;
          const mark = i => [...tour.children].forEach((li, j) => { li.className = j < i ? 'done' : j === i ? 'on' : ''; });
          function reset() {
            ph.reset(); ph.resetCounts(); ph.layout('compact', false);
            ph.el.classList.toggle('cq-big', after); ph.el.classList.toggle('cq-hasrf', after);
            run.reset(); run.written(after); mark(-1);
          }
          async function play() {
            if (busy) return; busy = true;
            const ok = () => live();
            try {
              reset();
              mark(0); ph.screen('splash'); say(o, after ? 'Cold start with the Baseline Profile…' : 'Cold start, no profile…');
              await sleep(after ? 600 : 900); if (!ok()) return; ph.screen('loading');
              await sleep(after ? 300 : 500); if (!ok()) return; ph.screen(null);
              say(o, after ? '<span class="good">820 ms</span> to real articles.' : '<span class="bad">1,240 ms</span> to real articles.');
              await sleep(700); if (!ok()) return;
              mark(1); ph.setSaved('a4', !ph.saved.has('a4'));
              if (after) ph.count('a4'); else ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].forEach(id => ph.count(id, true));
              say(o, after ? '<span class="good">1 row recomposed.</span>' : '<span class="bad">6 rows recomposed</span> for one tap.');
              await sleep(900); if (!ok()) return;
              mark(2); ph.offline(true);
              say(o, after ? 'Banner shown. TalkBack announces <span class="good">“You’re offline”</span>.' : 'Banner shown. <span class="bad">TalkBack says nothing.</span>');
              await sleep(900); if (!ok()) return;
              mark(3); replay(ph.el, 'cq-spin'); await sleep(700); if (!ok()) return;
              say(o, after ? '<span class="good">Old Activity collected. 0 leaks.</span>' : '<span class="bad">Old Activity retained by NetworkMonitor.</span>');
              await sleep(700); if (!ok()) return;
              mark(4); ph.offline(false); ph.layout('expanded', after); ph.open('a4');
              say(o, after ? '<span class="good">List and detail side by side.</span>' : '<span class="bad">One stretched pane; the list is gone.</span>');
              await sleep(1100); if (!ok()) return;
              mark(5); ph.layout('compact', false);
              say(o, 'Back to one pane; the open article is kept.');
              await sleep(900); if (!ok()) return;
              mark(6);
              if (!after) say(o, '<span class="bad">0 tests.</span> Every change was a gamble.');
              else {
                for (let i = 0; i < 3; i++) { run.set(i, 'run'); await sleep(450); if (!ok()) return; run.set(i, 'pass'); }
                run.sum('8 + 5 + 1 = 14 checks, all green');
                say(o, '<span class="good">All green.</span> Ship it.');
              }
              mark(7);
            } finally { busy = false; }
          }
          frame(el, 9, ph, {
            labels: ['Start of project', 'Finished'],
            guard: () => !busy,
            side: [h('p', { class: 'cq-cap' }, 'End-to-end tour'), tour, run.el],
            below: [h('div', { class: 'controls' }, cmd('play the tour', play)), o],
            onMode(a) { after = a; reset(); run.sum(a ? '14 checks in CI' : 'No tests'); say(o, a ? 'The finished app. Play the tour.' : 'Every problem this project found, measured at once. Play the tour, then switch to Finished.'); },
          });
        },
      },
    ],
  });
})();
