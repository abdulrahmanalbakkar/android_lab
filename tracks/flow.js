/* Flow track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed flw-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  // Runs fn every animation frame until node leaves the page (navigation or Reset).
  const loop = (node, fn) => {
    let last = performance.now();
    const step = now => {
      if (!node.isConnected) return;
      fn(now, Math.min(100, now - last)); last = now;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Move a node to a new parent and animate it from where it was.
  const moveTo = (node, parent) => {
    const a = node.getBoundingClientRect();
    parent.append(node);
    const b = node.getBoundingClientRect();
    if (node.animate) node.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: reduced() ? 1 : 480, easing: 'cubic-bezier(0.3, 1.25, 0.5, 1)' });
  };

  const css = `
.flw-src { font: 600 0.74rem/1.4 var(--mono); background: var(--code-bg); color: var(--code-ink); padding: 2px 7px; border-radius: 6px; white-space: nowrap; text-align: center; }
.flw-prog { display: block; width: 100%; min-width: 60px; height: 5px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.flw-prog i { display: block; height: 100%; width: 0; background: var(--accent); }

.flw-ui { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
.flw-ui.frozen { border-color: var(--err); }

.flw-prod { display: grid; gap: 8px; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--accent); background: var(--surface); }
.flw-prod-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; font: 700 0.85rem var(--mono); }
.flw-badge { font: 600 0.75rem var(--mono); padding: 2px 9px; border-radius: 99px; background: var(--accent-soft); color: var(--accent); white-space: nowrap; }
.flw-run { font: 500 0.82rem var(--mono); padding: 4px 9px; border-radius: 7px; background: var(--sunk); }
.flw-idle { font-size: 0.9rem; color: var(--muted); }
.flw-cols { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-col { display: grid; grid-template-columns: 90px minmax(0, 1fr) 96px; gap: 10px; align-items: center; }
.flw-strip { display: flex; gap: 6px; align-items: center; min-height: 40px; padding: 4px 8px; border-radius: 9px; background: var(--sunk); overflow: hidden; min-width: 0; }
.flw-v { display: inline-grid; place-items: center; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); font: 600 0.8rem var(--mono); color: var(--ink); flex: none; white-space: nowrap; }
.flw-v.ok { border-color: var(--ok); color: var(--ok); }
.flw-v.acc { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.flw-v.gone { opacity: 0.5; border-style: dashed; text-decoration: line-through; }
.flw-stat { font: 600 0.74rem var(--mono); color: var(--muted); }
.flw-stat.on { color: var(--accent); }
.flw-stat.fin { color: var(--ok); }

.flw-marbles { display: grid; gap: 6px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-mrow { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 10px; align-items: center; }
.flw-mtrack { position: relative; height: 36px; margin-inline: 14px; }
.flw-mtrack::before { content: ""; position: absolute; left: -14px; right: -14px; top: 50%; border-top: 2px solid var(--line); }
.flw-op { font: 500 0.8rem var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 9px; padding: 7px 12px; overflow-x: auto; white-space: nowrap; }
.flw-m { position: absolute; top: 50%; z-index: 1; transform: translate(-50%, -50%); min-width: 26px; height: 26px; padding: 0 6px; border-radius: 99px; display: grid; place-items: center; font: 700 0.74rem var(--mono); border: 2px solid; transition: opacity 0.3s, transform 0.3s cubic-bezier(0.2, 1.4, 0.4, 1); white-space: nowrap; }
.flw-m.hide { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
.flw-m.gone { opacity: 0.3; border-style: dashed; }
.flw-m.c0 { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.flw-m.c1 { background: var(--warm-soft); border-color: var(--warm); color: var(--warm); }
.flw-m.c2 { background: var(--ok-soft); border-color: var(--ok); color: var(--ok); }
.flw-m.c3 { background: var(--err-soft); border-color: var(--err); color: var(--err); }
.flw-m.c4 { background: var(--surface); border-color: var(--ink); color: var(--ink); }
.flw-end { position: absolute; top: 7px; bottom: 7px; width: 3px; border-radius: 2px; background: var(--ink); transform: translateX(-50%); transition: opacity 0.3s; }
.flw-win { position: absolute; top: 50%; height: 10px; margin-top: -5px; border-radius: 5px; background: var(--warm-soft); border: 1px solid var(--warm); transition: opacity 0.3s; }
.flw-end.hide, .flw-win.hide { opacity: 0; }
.flw-search { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-srow { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 10px; align-items: center; }
.flw-timer { height: 6px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.flw-timer i { display: block; height: 100%; width: 0; background: var(--warm); }

.flw-duo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.flw-panel { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.flw-ph { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; min-height: 34px; }
.flw-val { font: 700 0.95rem var(--mono); padding: 3px 10px; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font-variant-numeric: tabular-nums; }
.flw-subrow { display: grid; gap: 5px; padding: 8px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.flw-subhead { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font: 700 0.76rem var(--mono); }
.flw-note { color: var(--muted); font: 500 0.72rem var(--mono); }
.flw-note.warn { color: var(--warm); }
.flw-subrow .flw-strip { min-height: 38px; padding: 3px 6px; }

.flw-life { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: center; }
.flw-life > div { display: grid; gap: 10px; min-width: 0; }
.flw-phone { width: 150px; height: 230px; border-radius: 24px; border: 7px solid var(--code-bg); background: var(--surface); padding: 12px 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; overflow: hidden; justify-self: center; text-align: center; }
.flw-phone.flw-rot { animation: flw-rot 0.5s ease-in-out; }
.flw-screen { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; }
.flw-gps { font: 600 0.7rem var(--mono); padding: 2px 8px; border-radius: 99px; background: var(--ok-soft); color: var(--ok); }
.flw-gps.off { background: var(--sunk); color: var(--muted); }
.flw-gps.bad { background: var(--err-soft); color: var(--err); }
.flw-coord { font: 700 0.86rem/1.4 var(--mono); }
.flw-home { display: grid; grid-template-columns: repeat(3, 26px); gap: 10px; }
.flw-home i { width: 26px; height: 26px; border-radius: 8px; background: var(--sunk); }
.flw-life .lane { grid-template-columns: 96px minmax(0, 1fr); }
@keyframes flw-rot { 50% { transform: rotate(90deg) scale(0.75); } }

@media (max-width: 620px) {
  .flw-duo, .flw-life { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .flw-src { white-space: normal; font-size: 0.68rem; }
  .flw-prog { min-width: 0; }
  .flw-col { grid-template-columns: 64px minmax(0, 1fr); }
  .flw-col .flw-stat { grid-column: 2; }
  .flw-mrow, .flw-srow { grid-template-columns: 56px minmax(0, 1fr); gap: 6px; }
  .flw-mtrack { margin-inline: 12px; }
  .flw-m { min-width: 22px; height: 22px; padding: 0 4px; font-size: 0.66rem; }
  .flw-life .lane { grid-template-columns: 78px minmax(0, 1fr); }
}

.flw-ibar { position: absolute; top: 50%; height: 20px; margin-top: -10px; border-radius: 6px; border: 2px solid var(--accent); background: var(--accent-soft); overflow: hidden; opacity: 0; font: 700 0.64rem/16px var(--mono); color: var(--accent); text-indent: 3px; white-space: nowrap; }
.flw-ibar.on { opacity: 1; }
.flw-ibar.wait { border-style: dashed; border-color: var(--muted); background: transparent; color: var(--muted); }
.flw-ibar.cut { border-style: dashed; border-color: var(--err); background: var(--err-soft); color: var(--err); }
.flw-ibar.done { border-color: var(--ok); background: var(--ok-soft); color: var(--ok); }
.flw-ibar.half { height: 16px; margin-top: -17px; line-height: 12px; }
.flw-ibar.half.lo { margin-top: 1px; }
.flw-x { position: absolute; top: 50%; z-index: 2; transform: translate(-50%, -50%); font: 700 1rem var(--mono); color: var(--err); transition: opacity 0.3s; }
.flw-x.hide { opacity: 0; }
.flw-reqs { display: grid; gap: 6px; }
.flw-req { display: grid; grid-template-columns: minmax(0, 9.5em) minmax(0, 1fr) 70px; gap: 8px; align-items: center; padding: 5px 8px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.flw-req .flw-src { display: block; overflow: hidden; text-overflow: ellipsis; }
.flw-req.ok { border-color: var(--ok); }
.flw-req.ok .flw-prog i { background: var(--ok); }
.flw-req.cut { opacity: 0.55; border-style: dashed; }
.flw-req.cut .flw-prog i { background: var(--muted); }
.flw-shown { font: 600 0.86rem/1.5 var(--mono); padding: 8px 12px; border-radius: 9px; background: var(--ok-soft); color: var(--ok); overflow-wrap: anywhere; }
.flw-shown.stale { background: var(--err-soft); color: var(--err); }
.flw-shown.wait { background: var(--sunk); color: var(--muted); }

.flw-pipe { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); }
.flw-stage { display: grid; gap: 2px; font: 600 0.76rem var(--mono); padding: 6px 10px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); transition: border-color 0.25s, background 0.25s, opacity 0.25s; min-width: 0; }
.flw-stage small { font: 500 0.68rem var(--mono); color: var(--muted); }
.flw-stage.on { border-color: var(--accent); background: var(--accent-soft); }
.flw-stage.ok { border-color: var(--ok); background: var(--ok-soft); }
.flw-stage.fail { border-color: var(--err); background: var(--err-soft); }
.flw-stage.fail small { color: var(--err); }
.flw-stage.caught { border-color: var(--warm); background: var(--warm-soft); }
.flw-stage.caught small { color: var(--warm); }
.flw-stage.skip { opacity: 0.45; border-style: dashed; }
.flw-arrow { color: var(--muted); font: 600 0.8rem var(--mono); }
.flw-step { display: flex; align-items: center; gap: 6px; min-width: 0; }
.flw-log { display: grid; gap: 2px; }
.out.flw-log::before { content: none; }

.flw-v.warn { border-color: var(--warm); color: var(--warm); background: var(--warm-soft); }
.flw-v.bad { border-color: var(--err); color: var(--err); background: var(--err-soft); }
.flw-cb { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.flw-cb .flw-strip { flex-wrap: wrap; overflow: visible; }
.flw-big { font: 700 0.95rem var(--mono); }

@media (max-width: 620px) {
  .flw-cb { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .flw-req { grid-template-columns: minmax(0, 1fr) 64px; }
  .flw-req .flw-prog { grid-column: 1 / -1; grid-row: 2; }
  .flw-ibar { font-size: 0.58rem; text-indent: 2px; }
}
/* depth steps */
.flw-wrap { flex-wrap: wrap; overflow: visible; }
`;

  // Plays a timeline of T ms, stretched by slow, calling frame(t) every animation frame.
  // Resolves false if node left the page or live() turned false (a newer run took over).
  const playT = (node, T, frame, slow = 1, live = () => true) => new Promise(res => {
    const t0 = performance.now();
    const step = now => {
      if (!node.isConnected || !live()) { res(false); return; }
      const t = reduced() ? T : Math.min(T, (now - t0) / slow);
      frame(t);
      if (t < T) requestAnimationFrame(step); else res(true);
    };
    requestAnimationFrame(step);
  });
  // A marble timeline. rows: [{ name, marbles: [{ t, v, c, goneAt }], bars: [{ s, e, k, label, half, lo }], marks: [t], end }].
  function board(rows, T) {
    const pct = t => (t / T) * 100 + '%';
    const items = [], cursors = [];
    const els = rows.map(r => {
      const tr = h('div', { class: 'flw-mtrack' });
      const cur = h('span', { class: 'cursor', style: 'left:0' });
      tr.append(cur); cursors.push(cur);
      (r.bars || []).forEach(b => {
        const e = h('span', { class: `flw-ibar ${b.k}${b.half ? ' half' : ''}${b.lo ? ' lo' : ''}`, style: `left:${pct(b.s)};width:0` }, b.label == null ? '' : String(b.label));
        tr.append(e); items.push({ e, s: b.s, b });
      });
      (r.marbles || []).forEach(m => {
        const e = h('span', { class: `flw-m c${m.c || 0} hide`, style: `left:${pct(m.t)}` }, String(m.v));
        tr.append(e); items.push({ e, s: m.t, m });
      });
      [...(r.marks || []), ...(r.end != null ? [r.end] : [])].forEach((t, i, all) => {
        const isEnd = r.end != null && i === all.length - 1;
        const e = isEnd ? h('span', { class: 'flw-end hide', style: `left:${pct(t)}` }) : h('span', { class: 'flw-x hide', style: `left:${pct(t)}`, 'aria-hidden': 'true' }, '×');
        tr.append(e); items.push({ e, s: t });
      });
      return h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, r.name), tr);
    });
    const node = h('div', { class: 'flw-marbles' }, els);
    function paint(t) {
      cursors.forEach(c => { c.style.left = pct(t); });
      for (const it of items) {
        if (it.b) { it.e.style.width = pct(Math.max(0, Math.min(t, it.b.e) - it.b.s)); it.e.classList.toggle('on', t >= it.b.s); }
        else if (it.m) { it.e.classList.toggle('hide', t < it.m.t); it.e.classList.toggle('gone', it.m.goneAt != null && t >= it.m.goneAt); }
        else it.e.classList.toggle('hide', t < it.s);
      }
    }
    return { node, paint };
  }
  const pressed = (buttons, keys, k) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(keys[i] === k)));

  // ─── flatMapConcat / Merge / Latest ─────────────────
  const flatmap = {
    id: 'flatmap',
    title: 'flatMapLatest, Concat and Merge',
    tagline: 'Each value starts a flow. Choose to wait, to mix, or to cancel the old one.',
    body: `
<p>Sometimes each value should start a flow of its own. A search query starts a request. A chapter id starts a page download. The <code>flatMap</code> operators run that inner flow and pass its values on as one flat stream.</p>
<p><code>flatMapConcat</code> runs the inner flows one at a time, in order. The next one starts only after the previous one completes. <code>flatMapMerge</code> runs them at the same time, up to <code>concurrency</code> (16 by default), and passes values on as they arrive, mixed together.</p>
<p><code>flatMapLatest</code> cancels the running inner flow as soon as a new value arrives. Search-as-you-type needs exactly this. Typing "kot" cancels the request for "ko", so a slow, old answer can never replace a newer one.</p>`,
    code: `@OptIn(ExperimentalCoroutinesApi::class)
class SearchViewModel(private val repo: SearchRepository) : ViewModel() {
    private val query = MutableStateFlow("")

    // A new query cancels the search still running for the old one
    val results: StateFlow<SearchState> = query
        .flatMapLatest { q ->
            flow<SearchState> {
                emit(SearchState.Loading)
                emit(SearchState.Done(repo.search(q)))
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SearchState.Idle)

    fun onType(text: String) { query.value = text }
}

// One chapter at a time, pages stay in order
@OptIn(ExperimentalCoroutinesApi::class)
val pages: Flow<Page> = chapterIds.asFlow().flatMapConcat { id -> repo.pages(id) }

// Up to 4 thumbnails at once, in whatever order they finish
@OptIn(ExperimentalCoroutinesApi::class)
val thumbs: Flow<Thumb> = photoIds.asFlow()
    .flatMapMerge(concurrency = 4) { id -> flow { emit(repo.thumb(id)) } }`,
    remember: 'Concat waits its turn, Merge runs them all at once, Latest cancels the old one.',
    level: 'intermediate',
    terms: [
      { term: 'flatMapLatest', def: 'Starts an inner flow for each value and cancels the previous inner flow when a new value arrives.' },
      { term: 'flatMapConcat', def: 'Starts an inner flow for each value and runs them one after another, each waiting for the previous one to complete.' },
      { term: 'flatMapMerge', def: 'Starts an inner flow for each value and collects up to a set number of them at the same time, mixing their values.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Load up to 4 thumbnails at once, and make search drop stale requests.', code: `val thumbs = photoIds.asFlow()
    .[[flatMapMerge]](concurrency = 4) { id -> flow { emit(loadThumb(id)) } }

val results = query.[[flatMapLatest]] { q -> repo.search(q) }`, why: '<code>flatMapMerge</code> runs several inner flows at once. <code>flatMapLatest</code> cancels the old search when a new query arrives.' },
      { type: 'bug', prompt: 'Sometimes the list shows results for an older query. Tap the bug.', code: `@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
val results: Flow<List<Article>> = query
    .debounce(300)
    .filter { it.length >= 2 }
    .flatMapMerge { q -> repo.search(q) }`, bug: 4, fix: '    .flatMapLatest { q -> repo.search(q) }', why: '<code>flatMapMerge</code> keeps old searches running. If the search for an older query is slower, its results arrive last and replace the newer ones.' },
    ],
    quiz: [
      { q: 'Upstream emits A, then B while the inner flow for A is still running. With <code>flatMapLatest</code>, what happens to A’s inner flow?', options: ['It finishes, then B starts', 'It is cancelled and B starts', 'A and B run together'], a: 1, why: 'A new value cancels the inner flow that is still running for the previous one.' },
      { q: 'File chunks must upload one at a time, in order. Which operator fits?', options: ['<code>flatMapConcat</code>', '<code>flatMapMerge</code>', '<code>flatMapLatest</code>'], a: 0, why: 'Concat starts the next inner flow only after the previous one completes, so order is kept.' },
      { q: 'How many inner flows does <code>flatMapMerge { }</code> collect at once by default?', options: ['1', '16', 'No limit'], a: 1, why: 'The default concurrency is 16. Pass <code>concurrency</code> to change it.' },
    ],
    visual(el) {
      const T = 3700, STEP = 400;
      const UP = [['A', 0, 0], ['B', 500, 1], ['C', 1000, 2]];
      const MODES = {
        concat: { label: 'flatMapConcat', start: [0, 1200, 2400], cut: [null, null, null], note: '<span class="good">flatMapConcat:</span> B waited until inner(A) completed, and C waited for B. The order is kept, but it took the longest.' },
        merge: { label: 'flatMapMerge', start: [0, 500, 1000], cut: [null, null, null], note: '<span class="good">flatMapMerge:</span> all three inner flows ran at the same time, so values came out mixed. A2 came before B1, and B3 before C2.' },
        latest: { label: 'flatMapLatest', start: [0, 500, 1000], cut: [500, 1000, null], note: '<span class="good">flatMapLatest:</span> B cancelled inner(A) after A1, and C cancelled inner(B) after B1. Only the newest inner flow ran to the end.' },
      };
      const keys = Object.keys(MODES);
      const slot0 = h('div');
      const codeLine = h('div', { class: 'flw-op' });
      const o = out();
      let gen = 0, cur;
      function build(k) {
        const m = MODES[k], outM = [];
        const rows = [{ name: 'upstream', marbles: UP.map(([v, t, c]) => ({ t, v, c })), end: 1100 }];
        UP.forEach(([v, t, c], i) => {
          const s = m.start[i], cut = m.cut[i], e = cut != null ? cut : s + 3 * STEP;
          const bars = [];
          if (s > t) bars.push({ s: t, e: s, k: 'wait', label: 'waits' });
          bars.push({ s, e, k: cut != null ? 'cut' : 'run' });
          const marbles = [];
          for (let j = 1; j <= 3; j++) {
            const at = s + j * STEP;
            if (cut == null || at < cut) { marbles.push({ t: at, v: v + j, c }); outM.push({ t: at, v: v + j, c }); }
          }
          rows.push({ name: `inner(${v})`, bars, marbles, marks: cut != null ? [cut] : [] });
        });
        rows.push({ name: 'collect', marbles: outM, end: Math.max(...outM.map(x => x.t)) + 100 });
        cur = board(rows, T);
        slot0.replaceChildren(cur.node);
        codeLine.innerHTML = hl(`letters.${m.label} { x -> inner(x) }   // inner emits x1, x2, x3, 400 ms apart`);
        pressed(buttons, keys, k);
      }
      const buttons = keys.map(k => cmd(MODES[k].label, async () => {
        const my = ++gen;
        build(k);
        say(o, `<span class="muted">playing</span> ${hl(MODES[k].label)}`);
        if (await playT(cur.node, T, cur.paint, 1.25, () => gen === my)) say(o, MODES[k].note);
      }));
      build('latest'); cur.paint(T);
      o.innerHTML = 'Upstream sends A, B and C. Each one starts an inner flow of three values. Play each operator and compare.';

      // Search-as-you-type on real keystrokes.
      const input = h('input', { id: 'flw-fm-q', value: 'kotlin', spellcheck: 'false', autocomplete: 'off' });
      const reqs = h('div', { class: 'flw-reqs' });
      const shown = h('div', { class: 'flw-shown' }, 'Screen shows results for "kotlin"');
      const stats = h('p', { class: 'tip' });
      const so = out('Type in the box. Each change starts a search. Shorter queries match more, so they are slower here.');
      let smode = 'latest', started = 0, cancelled = 0, stale = 0, typing = false;
      const live = new Set();
      const paintStats = () => { stats.textContent = `searches started: ${started} · cancelled: ${cancelled} · stale results shown: ${stale}`; };
      function cancel(r) {
        clearTimeout(r.timer); live.delete(r); cancelled++;
        const w = getComputedStyle(r.bar).width;
        r.bar.style.transition = 'none'; r.bar.style.width = w;
        r.st.textContent = 'cancelled'; r.st.className = 'flw-stat'; r.row.classList.add('cut');
      }
      function request(q) {
        const lat = 500 + Math.max(0, 6 - q.length) * 260;
        const bar = h('i'), st = h('span', { class: 'flw-stat on' }, 'loading');
        const row = h('div', { class: 'flw-req drop-in' }, h('span', { class: 'flw-src' }, `search("${q}")`), h('span', { class: 'flw-prog' }, bar), st);
        reqs.prepend(row);
        while (reqs.children.length > 6) reqs.lastElementChild.remove();
        void bar.offsetWidth;
        bar.style.transition = `width ${lat}ms linear`; bar.style.width = '100%';
        if (smode === 'latest') [...live].forEach(cancel);
        const r = { row, bar, st };
        live.add(r); started++; paintStats();
        shown.className = 'flw-shown wait'; shown.textContent = 'Loading…';
        r.timer = setTimeout(() => {
          live.delete(r);
          if (!input.isConnected) return;
          st.textContent = 'done'; st.className = 'flw-stat fin'; row.classList.add('ok');
          const now = input.value.trim(), old = q !== now;
          if (old) stale++;
          shown.className = 'flw-shown' + (old ? ' stale' : '');
          shown.textContent = old ? `Screen shows results for "${q}", but you typed "${now}"` : `Screen shows results for "${q}"`;
          replay(shown, 'pop-soft'); paintStats();
          if (old) say(so, `<span class="bad">stale:</span> the old search for "${q}" finished last and replaced newer results. flatMapLatest would have cancelled it.`);
          else if (!live.size) say(so, smode === 'latest' ? `<span class="good">ok:</span> every older search was cancelled, so only "${q}" reached the screen.` : `<span class="good">ok:</span> "${q}" finished last this time.`);
        }, lat);
      }
      input.addEventListener('input', () => { const q = input.value.trim(); if (q) request(q); });
      const modeBtns = [
        cmd('flatMapLatest { search(it) }', () => { smode = 'latest'; pressed(modeBtns, ['latest', 'merge'], smode); say(so, '<span class="muted">mode:</span> flatMapLatest. Each keystroke cancels the search still running.'); }),
        cmd('flatMapMerge { search(it) }', () => { smode = 'merge'; pressed(modeBtns, ['latest', 'merge'], smode); say(so, '<span class="muted">mode:</span> flatMapMerge. Old searches keep running. Watch which one lands last.'); }),
      ];
      pressed(modeBtns, ['latest', 'merge'], smode);
      paintStats();
      el.append(
        h('div', { class: 'controls' }, buttons), codeLine, slot0, o,
        h('div', { class: 'flw-search' },
          h('div', { class: 'controls' }, modeBtns),
          h('label', { class: 'field-input', for: 'flw-fm-q' }, 'Search', input),
          h('div', { class: 'controls' }, cmd('type "kotlin"', async () => {
            if (typing) return; typing = true;
            input.value = '';
            for (const ch of 'kotlin') {
              await sleep(170); if (!input.isConnected) return;
              input.value += ch; input.dispatchEvent(new Event('input'));
            }
            typing = false;
          })),
          reqs, shown, stats),
        so);
    },
  };

  // ─── buffer / conflate / collectLatest ─────────────────
  const backpressure = {
    id: 'backpressure',
    title: 'Buffer, conflate and collectLatest',
    tagline: 'What to do when the producer is faster than the collector.',
    body: `
<p>By default a flow runs in one coroutine. <code>emit</code> calls your collector directly and waits for it to finish. A slow collector slows the producer down. Nothing is lost, but the two sides take turns instead of working at the same time.</p>
<p><code>buffer()</code> runs the producer in its own coroutine with a queue in between (64 slots by default). The producer keeps going while the collector works, and every value is still handled. <code>conflate()</code> keeps only the newest value in that queue. When the collector is ready, it gets the latest value and the ones it missed are dropped.</p>
<p><code>collectLatest</code> goes one step further. A new value cancels the block that is still handling the old one. Use it when only the newest value matters, like rendering a preview. Use <code>conflate</code> when each handling must finish, like an upload.</p>`,
    code: `val readings: Flow<Reading> = sensor.readings()   // a new value every 100 ms

// Every value is handled. The producer never waits for the collector.
readings.buffer(capacity = 64).collect { log.write(it) }

// The collector skips what it missed, but each upload finishes
readings.conflate().collect { api.uploadLatest(it) }

// Only the newest matters. A new value cancels the render in progress.
readings.collectLatest { reading ->
    val chart = renderChart(reading)     // suspending and cancellable
    _chart.value = chart
}`,
    remember: 'buffer keeps them all, conflate keeps the latest, collectLatest cancels the old work.',
    level: 'advanced',
    terms: [
      { term: 'Backpressure', def: 'What happens when values arrive faster than the collector can handle them; by default a flow producer suspends in emit until the collector catches up.' },
      { term: 'buffer', def: 'Runs the upstream in a separate coroutine with a queue, so the producer can keep emitting while the collector is busy.' },
      { term: 'conflate', def: 'A buffer that keeps only the most recent value, so a slow collector skips the values it missed.' },
      { term: 'collectLatest', def: 'A terminal operator that cancels the block handling the previous value when a new value arrives.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Show only the newest preview, and keep every log line while the producer runs ahead.', code: `previews.[[collectLatest]] { p ->
    _image.value = render(p)
}

logLines.[[buffer]]().collect { file.appendLine(it) }`, why: '<code>collectLatest</code> cancels a half-done render. <code>buffer</code> queues values, so none are lost.' },
      { type: 'bug', prompt: 'Analytics reports fewer taps than users made. Tap the bug.', code: `fun trackAll(events: Flow<AnalyticsEvent>) {
    appScope.launch {
        events
            .conflate()
            .collect { analytics.send(it) }
    }
}`, bug: 3, fix: '            .buffer()', why: '<code>conflate</code> drops every value that arrives while the collector is busy. Each tap must be counted, so it needs <code>buffer</code>.' },
    ],
    quiz: [
      { q: 'No operators. The producer emits every 100 ms and the collector takes 500 ms per value. What does the producer do?', options: ['Keeps emitting every 100 ms', 'Waits inside <code>emit</code> until the collector finishes', 'Drops values'], a: 1, why: 'Without a buffer, <code>emit</code> runs the collector directly and returns only when it is done.' },
      { q: 'With <code>conflate()</code>, values 2, 3 and 4 arrive while the collector is busy with 1. What does it get next?', options: ['2', '4', '2, 3 and 4 in order'], a: 1, why: 'A conflated buffer holds only the latest value. 2 and 3 were overwritten.' },
      { q: 'With <code>collectLatest</code>, value 2 arrives while the block is still handling 1. What happens?', options: ['The block for 1 finishes first', 'The block for 1 is cancelled', 'Value 2 is dropped'], a: 1, why: 'collectLatest cancels the running block and starts again with the new value.' },
    ],
    visual(el) {
      const P = 400, C = 600, N = 5, T = 5000;
      const at = v => v * P;
      const MODES = {
        none: { label: 'no operator', code: 'readings.collect { handle(it) }       // emit waits for handle()' },
        buffer: { label: '.buffer()', code: 'readings.buffer().collect { handle(it) }' },
        conflate: { label: '.conflate()', code: 'readings.conflate().collect { handle(it) }' },
        latest: { label: 'collectLatest { }', code: 'readings.collectLatest { handle(it) }  // new value cancels handle()' },
      };
      const keys = Object.keys(MODES);
      function sim(mode) {
        const prod = [], emits = [], coll = [], queue = [], marks = [];
        if (mode === 'none') {
          let t = 0;
          for (let v = 1; v <= N; v++) {
            prod.push({ s: t, e: t + P, k: 'run' });
            prod.push({ s: t + P, e: t + P + C, k: 'wait' });
            emits.push({ t: t + P, v, c: v % 5 });
            coll.push({ s: t + P, e: t + P + C, k: 'done', label: v });
            t += P + C;
          }
        } else {
          for (let v = 1; v <= N; v++) { prod.push({ s: at(v) - P, e: at(v), k: 'run' }); emits.push({ t: at(v), v, c: v % 5 }); }
          if (mode === 'buffer') {
            let f = 0;
            for (let v = 1; v <= N; v++) {
              const s = Math.max(at(v), f);
              if (s > at(v)) queue.push({ s: at(v), e: s, k: 'wait', label: v, half: true, lo: v % 2 === 1 });
              coll.push({ s, e: s + C, k: 'done', label: v }); f = s + C;
            }
          } else if (mode === 'conflate') {
            let f = 0, next = 1;
            while (next <= N) {
              let take = next;
              if (at(next) <= f) {
                while (take + 1 <= N && at(take + 1) <= f) take++;
                for (let d = next; d < take; d++) { queue.push({ s: at(d), e: at(d + 1), k: 'cut', label: d, half: true, lo: d % 2 === 1 }); marks.push(at(d + 1)); }
              }
              const s = Math.max(at(take), f);
              if (s > at(take)) queue.push({ s: at(take), e: s, k: 'wait', label: take, half: true, lo: take % 2 === 1 });
              coll.push({ s, e: s + C, k: 'done', label: take }); f = s + C; next = take + 1;
            }
          } else {
            for (let v = 1; v <= N; v++) {
              const cut = v < N && at(v + 1) < at(v) + C ? at(v + 1) : null;
              coll.push({ s: at(v), e: cut != null ? cut : at(v) + C, k: cut != null ? 'cut' : 'done', label: v });
            }
          }
        }
        const end = Math.max(...coll.map(c => c.e));
        const done = coll.filter(c => c.k === 'done').map(c => c.label);
        const dropped = queue.filter(q => q.k === 'cut').map(q => q.label);
        const cut = coll.filter(c => c.k === 'cut').map(c => c.label);
        return { prod, emits, coll, queue, marks, end, done, dropped, cut };
      }
      const s1 = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
      function note(mode, r) {
        const secs = (r.end / 1000).toFixed(1) + ' s';
        if (mode === 'none') return `<span class="muted">no operator:</span> emit waited for each handle() to finish. The two sides took turns: ${N} values in ${secs}.`;
        if (mode === 'buffer') return `<span class="good">.buffer():</span> the producer ran ahead and values waited in the queue. All ${N} were handled, in ${secs}.`;
        if (mode === 'conflate') return `<span class="good">.conflate():</span> ${r.dropped.join(', ')} arrived while the collector was busy and got replaced by a newer value. ${r.done.length} of ${N} handled, in ${secs}.`;
        return `<span class="good">collectLatest:</span> each new value cancelled the handle() still running. ${s1(r.cut.length, 'block')} cancelled, only ${r.done.join(', ')} finished, at ${secs}.`;
      }
      const slot0 = h('div'), snippet = h('div', { class: 'kt' }), stats = h('p', { class: 'tip' });
      const o = out();
      let gen = 0, cur;
      function build(k) {
        const r = sim(k);
        cur = board([
          { name: 'producer', bars: r.prod, marbles: r.emits, end: r.emits[N - 1].t + 60 },
          { name: 'queue', bars: r.queue, marks: r.marks },
          { name: 'collector', bars: r.coll },
        ], T);
        slot0.replaceChildren(cur.node);
        snippet.innerHTML = hl(MODES[k].code);
        pressed(buttons, keys, k);
        stats.textContent = `finished at ${(r.end / 1000).toFixed(1)} s · handled: ${r.done.length} · dropped: ${r.dropped.length} · cancelled: ${r.cut.length}`;
        return r;
      }
      const buttons = keys.map(k => cmd(MODES[k].label, async () => {
        const my = ++gen;
        const r = build(k);
        stats.textContent = 'running…';
        say(o, `<span class="muted">playing</span> ${hl(MODES[k].code)}`);
        if (!(await playT(cur.node, T, cur.paint, 1, () => gen === my))) return;
        stats.textContent = `finished at ${(r.end / 1000).toFixed(1)} s · handled: ${r.done.length} · dropped: ${r.dropped.length} · cancelled: ${r.cut.length}`;
        say(o, note(k, r));
      }));
      build('none'); cur.paint(T);
      o.innerHTML = 'The producer needs 400 ms per value. handle() needs 600 ms. Play each option and compare the end time.';
      el.append(h('div', { class: 'controls' }, buttons), snippet, slot0,
        h('div', { class: 'legend' },
          h('span', {}, h('i', { class: 'flw-ibar on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'working'),
          h('span', {}, h('i', { class: 'flw-ibar wait on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'waiting'),
          h('span', {}, h('i', { class: 'flw-ibar done on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'handled'),
          h('span', {}, h('i', { class: 'flw-ibar cut on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'dropped or cancelled')),
        stats, o);
    },
  };

  // ─── catch / retry / retryWhen / onCompletion ─────────────────
  const errorsRetry = {
    id: 'errors-retry',
    title: 'Errors, retry and completion',
    tagline: 'catch looks upstream, retry runs it again, onCompletion always runs.',
    body: `
<p>An exception thrown inside a flow travels down to the collector and ends the collection. <code>catch { }</code> stops it on the way. It only sees exceptions from code above it, never from operators below it or from inside <code>collect</code>. In the catch block you can <code>emit</code> a fallback, like an error state.</p>
<p><code>retry(3)</code> collects the upstream again from the start when it fails. <code>retryWhen { cause, attempt -> }</code> lets you decide each time, and wait first. Waiting 1 s, then 2 s, then 4 s is called exponential backoff. It gives a flaky network time to recover without hammering the server. Retry only errors that can go away, like an <code>IOException</code>.</p>
<p><code>onCompletion { cause -> }</code> runs when the flow ends for any reason, like <code>finally</code>. <code>cause</code> is null on success and holds the exception on failure or cancellation. It sees the error but does not stop it.</p>`,
    code: `fun articles(): Flow<UiState> = flow<UiState> {
        emit(UiState.Success(api.fetchArticles()))
    }
    .retryWhen { cause, attempt ->
        if (cause is IOException && attempt < 3) {
            delay(1_000L shl attempt.toInt())   // wait 1 s, 2 s, then 4 s
            true                                // collect the upstream again
        } else {
            false
        }
    }
    .onStart { emit(UiState.Loading) }
    .catch { e -> emit(UiState.Error(e.message ?: "Could not load")) }  // upstream only
    .onCompletion { cause -> Log.d("Feed", "finished, cause = $cause") }

// In the ViewModel
articles()
    .onEach { _state.value = it }
    .launchIn(viewModelScope)`,
    remember: 'catch only looks up. retry starts over. onCompletion always runs.',
    level: 'intermediate',
    terms: [
      { term: 'catch (Flow)', def: 'An operator that handles exceptions thrown upstream of it and can emit a fallback value; it never sees exceptions from downstream.' },
      { term: 'retryWhen', def: 'An operator that, when the upstream fails, calls your lambda with the cause and attempt number and collects the upstream again if it returns true.' },
      { term: 'Exponential backoff', def: 'A retry policy that doubles the wait after each failed attempt, such as 1 s, 2 s, then 4 s.' },
      { term: 'onCompletion', def: 'An operator whose block runs when the flow ends, with a null cause on success and the exception on failure or cancellation.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Try up to 3 more times on network errors, then fall back to a placeholder.', code: `repo.prices()
    .[[retry]](3) { it is IOException }
    .[[catch]] { emit(Prices.Unavailable) }
    .collect { show(it) }`, why: '<code>retry</code> collects the upstream again while its predicate is true. <code>catch</code> handles what is left.' },
      { type: 'bug', prompt: 'When the login token expires, the profile screen spins forever. Tap the bug.', code: `fun profile(): Flow<Profile> = flow { emit(api.profile()) }
    .retryWhen { cause, attempt ->
        delay(1_000L shl attempt.toInt().coerceAtMost(5))
        true
    }
    .catch { emit(Profile.Guest) }`, bug: 3, fix: '        cause is IOException && attempt < 3', why: 'Returning <code>true</code> always retries forever, even for an expired token that will never succeed. Retry only errors that can go away, and cap the attempts.' },
    ],
    quiz: [
      { q: '<code>flow.catch { emit(Fallback) }.collect { error("bad") }</code>. Does catch handle the error thrown in collect?', options: ['Yes', 'No, catch only sees exceptions from upstream'], a: 1, why: 'collect is downstream of catch. To catch it, move the work into <code>onEach</code> above catch and use <code>launchIn</code>.' },
      { q: 'Why wait 1 s, then 2 s, then 4 s between retries?', options: ['To give a flaky network or busy server time to recover without hammering it', 'Because <code>retryWhen</code> requires it', 'To make tests slower'], a: 0, why: 'Exponential backoff spaces attempts out more each time, which helps the server and the battery.' },
      { q: 'The flow completes normally. What is <code>cause</code> in <code>onCompletion { cause -> }</code>?', options: ['<code>null</code>', 'A <code>CancellationException</code>', 'The last value'], a: 0, why: 'cause is null on success, and holds the exception on failure or cancellation.' },
    ],
    visual(el) {
      const A = 500, T = 6000;
      const SERVERS = { ok: ['server: works', 0], flaky: ['server: fails twice', 2], down: ['server: down', 99] };
      const skeys = Object.keys(SERVERS);
      let server = 'flaky', busy = false;
      const STAGES = [['flow { api.fetch() }', 'upstream'], ['retryWhen { … }', 'IOException, attempt < 3'], ['catch { … }', 'upstream only'], ['onCompletion { … }', 'always runs'], ['collect { show(it) }', 'the screen']];
      const st = STAGES.map(([src, sub]) => {
        const small = h('small', {}, sub);
        return { box: h('div', { class: 'flw-stage' }, h('span', { html: hl(src) }), small), small, sub };
      });
      const pipe = h('div', { class: 'flw-pipe' }, st.map((s, i) => (i ? h('div', { class: 'flw-step' }, h('span', { class: 'flw-arrow', 'aria-hidden': 'true' }, '→'), s.box) : s.box)));
      const mark = (i, cls, text) => { st[i].box.className = 'flw-stage' + (cls ? ' ' + cls : ''); st[i].small.textContent = text || st[i].sub; if (cls) replay(st[i].box, cls === 'fail' ? 'shake' : 'pop-soft'); };
      const clear = () => st.forEach((_, i) => mark(i, ''));
      const screen = h('div', { class: 'flw-shown' }, 'Success: 20 articles');
      const show = (cls, text) => { screen.className = 'flw-shown' + (cls ? ' ' + cls : ''); screen.textContent = text; replay(screen, 'pop'); };
      const slot0 = h('div');
      const log = h('div', { class: 'out flw-log', 'aria-live': 'polite' });
      const line = html => { log.append(h('div', { html })); while (log.children.length > 6) log.firstElementChild.remove(); };
      function schedule(fails, throwing) {
        const bars = [], ev = [];
        let t = 0, attempt = 0;
        ev.push([0, () => { show('wait', 'Loading…'); mark(0, 'on', 'attempt 1'); line('<span class="muted">onStart:</span> emit(Loading)'); }]);
        for (;;) {
          const failed = attempt < fails;
          bars.push({ s: t, e: t + A, k: failed ? 'cut' : 'done', label: `#${attempt + 1}` });
          t += A;
          if (!failed) {
            ev.push([t, throwing ? () => {
              mark(0, 'ok', 'returned 20 articles'); mark(4, 'on', 'handling Success');
              show('', 'Success: 20 articles');
              line('<span class="good">attempt 1:</span> 200 OK, emit(Success)');
            } : () => {
              mark(0, 'ok', 'returned 20 articles'); mark(1, ''); mark(2, 'skip', 'nothing to catch'); mark(3, 'ok', 'cause = null'); mark(4, 'ok', 'Success');
              show('', `Success: 20 articles${attempt ? ` after ${attempt + 1} attempts` : ''}`);
              line(`<span class="good">attempt ${attempt + 1}:</span> 200 OK, emit(Success)`);
              line('<span class="muted">onCompletion:</span> cause = null');
            }]);
            break;
          }
          const n = attempt, retry = n < 3, wait = 500 * 2 ** n;
          ev.push([t, () => {
            mark(0, 'fail', 'IOException');
            if (retry) { mark(1, 'on', `attempt ${n} → retry in ${2 ** n} s`); line(`<span class="bad">attempt ${n + 1}:</span> IOException. retryWhen(attempt = ${n}) waits ${2 ** n} s, returns true`); }
            else { mark(1, 'fail', 'attempt 3 → false'); line(`<span class="bad">attempt ${n + 1}:</span> IOException. retryWhen(attempt = ${n}) returns false`); }
          }]);
          if (!retry) {
            ev.push([t + 400, () => {
              mark(2, 'caught', 'emit(Error)'); mark(3, 'ok', 'cause = null'); mark(4, 'caught', 'Error');
              show('stale', 'Error: no connection. Pull to retry.');
              line('<span class="good">catch:</span> emit(Error("no connection"))');
              line('<span class="muted">onCompletion:</span> cause = null, because catch handled it');
            }]);
            t += 400;
            break;
          }
          bars.push({ s: t, e: t + wait, k: 'wait', label: `delay ${2 ** n} s` });
          ev.push([t + wait, () => mark(0, 'on', `attempt ${n + 2}`)]);
          t += wait; attempt++;
        }
        return { bars, ev, end: t };
      }
      async function play(fails, after) {
        const throwing = !!after;
        if (busy) return; busy = true;
        clear(); log.replaceChildren();
        const r = schedule(fails, throwing);
        const b = board([{ name: 'network', bars: r.bars }], T);
        slot0.replaceChildren(b.node);
        let i = 0;
        const ok = await playT(b.node, Math.max(r.end, 600), t => { b.paint(t); while (i < r.ev.length && r.ev[i][0] <= t) r.ev[i++][1](); });
        if (ok && after) await after();
        busy = false;
      }
      const sButtons = skeys.map(k => cmd(SERVERS[k][0], () => {
        if (busy) return;
        server = k; pressed(sButtons, skeys, k);
        line(`<span class="muted">${SERVERS[k][0]}.</span> Now collect.`);
      }));
      pressed(sButtons, skeys, server);
      // Opening state: a finished successful load.
      const first = schedule(0); const fb = board([{ name: 'network', bars: first.bars }], T);
      slot0.append(fb.node); fb.paint(T); first.ev.forEach(([, f]) => f());
      log.replaceChildren(); line('Pick how the server behaves, then collect. Delays run at double speed.');
      el.append(
        h('div', { class: 'controls' }, sButtons),
        pipe, slot0, screen,
        h('div', { class: 'controls' },
          cmd('articles().collect { show(it) }', () => play(SERVERS[server][1])),
          cmd('articles().collect { error("bad render") }', () => play(0, async () => {
            await sleep(400); if (!pipe.isConnected) return;
            mark(4, 'fail', 'throws IllegalStateException');
            line('<span class="bad">collect:</span> IllegalStateException("bad render")');
            await sleep(600); if (!pipe.isConnected) return;
            mark(2, 'skip', 'never sees it: downstream');
            mark(3, 'fail', 'cause = IllegalStateException');
            show('stale', 'Crash: IllegalStateException');
            line('<span class="bad">catch skipped:</span> it only handles exceptions from above it');
            line('<span class="muted">fix:</span> onEach { show(it) }.catch { … }.launchIn(scope)');
          }))),
        log);
    },
  };

  // ─── callbackFlow / channelFlow ─────────────────
  const callbackflow = {
    id: 'callbackflow',
    title: 'callbackFlow and channelFlow',
    tagline: 'Turn a listener API into a Flow, and unregister when collection stops.',
    body: `
<p>Many Android APIs push updates through a listener: network callbacks, sensors, location, Firebase. <code>callbackFlow { }</code> wraps one in a cold Flow. Register the listener inside the block, and call <code>trySend(value)</code> from each callback. <code>trySend</code> does not suspend, which matters because a callback is a plain function.</p>
<p>The block must end with <code>awaitClose { }</code>. It keeps the flow open while someone collects, and its lambda runs when collection stops. Unregister the listener there. If you forget, the system keeps calling a dead listener and leaks it, along with everything it references. If you leave out awaitClose entirely, the flow fails with an IllegalStateException as soon as the block returns.</p>
<p><code>channelFlow { }</code> is the same machinery without the awaitClose rule. Use it when several coroutines inside the block send values, for example a cached result and a fresh network result going into one stream.</p>`,
    code: `fun ConnectivityManager.isOnline(): Flow<Boolean> = callbackFlow {
    val callback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) { trySend(true) }
        override fun onLost(network: Network) { trySend(false) }
    }
    trySend(activeNetwork != null)                // the current state first
    registerDefaultNetworkCallback(callback)
    awaitClose { unregisterNetworkCallback(callback) }   // runs when collection stops
}.distinctUntilChanged()

// Two coroutines send into one flow
fun posts(): Flow<List<Post>> = channelFlow {
    launch { send(db.cachedPosts()) }
    launch { send(api.freshPosts()) }
}`,
    remember: 'Register in callbackFlow, trySend from the callback, unregister in awaitClose.',
    level: 'intermediate',
    terms: [
      { term: 'callbackFlow', def: 'A flow builder for wrapping listener APIs: you register a listener, send values from it, and must finish with awaitClose.' },
      { term: 'awaitClose', def: 'Suspends until the flow’s channel is closed or the collector is cancelled, then runs its block to clean up.' },
      { term: 'trySend', def: 'Adds a value to a channel without suspending and returns a result that says whether it worked.' },
      { term: 'channelFlow', def: 'A flow builder whose block can launch coroutines that all send values into the same flow.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Wrap a sensor listener as a Flow and clean up when collection stops.', code: `fun SensorManager.events(sensor: Sensor): Flow<Float> = [[callbackFlow]] {
    val listener = object : SensorEventListener {
        override fun onSensorChanged(e: SensorEvent) { [[trySend]](e.values[0]) }
        override fun onAccuracyChanged(s: Sensor, accuracy: Int) = Unit
    }
    registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    [[awaitClose]] { unregisterListener(listener) }
}`, why: '<code>callbackFlow</code> builds the flow, <code>trySend</code> works from a plain callback, and <code>awaitClose</code> unregisters on cancel.' },
      { type: 'bug', prompt: 'GPS stays on after the map screen closes. Tap the bug.', code: `fun LocationManager.updates(): Flow<Location> = callbackFlow {
    val listener = LocationListener { location -> trySend(location) }
    requestLocationUpdates(LocationManager.GPS_PROVIDER, 1_000L, 0f, listener, Looper.getMainLooper())
    awaitClose { }
}`, bug: 3, fix: '    awaitClose { removeUpdates(listener) }', why: 'awaitClose runs when collection stops, but this one does nothing. The listener stays registered, so GPS keeps running and the listener leaks.' },
    ],
    quiz: [
      { q: 'Why call <code>trySend</code> instead of <code>send</code> inside a listener callback?', options: ['trySend is faster', 'The callback is not a suspend function, and send suspends', 'send would drop the value'], a: 1, why: 'Listener methods are plain functions, so they cannot call a suspend function like send.' },
      { q: 'When does the block passed to <code>awaitClose { }</code> run?', options: ['Right after registering', 'When the collector is cancelled or the flow is closed', 'Only when an exception is thrown'], a: 1, why: 'awaitClose suspends while the flow is collected and runs its block when that ends, for any reason.' },
      { q: 'You need two coroutines inside one builder sending into the same flow, with no listener. Which builder?', options: ['<code>flow { }</code>', '<code>channelFlow { }</code>', '<code>flowOf()</code>'], a: 1, why: 'A plain flow { } may not emit from other coroutines. channelFlow gives you a channel that several coroutines can send to.' },
    ],
    visual(el) {
      let collecting = true, leak = false, online = true, net = true, nextId = 2, busy = false;
      const cbs = [];
      const reg = h('div', { class: 'flw-strip' });
      const count = h('span', { class: 'flw-badge' });
      const flowState = h('span', { class: 'flw-gps' });
      const lane = h('div', { class: 'flw-strip' });
      const badge = h('span', { class: 'flw-gps flw-big' });
      const collState = h('span', { class: 'flw-note' });
      const uiHold = h('div', { class: 'flw-strip' });
      const o = out();
      const paint = () => {
        count.textContent = `${cbs.length} registered`;
        flowState.className = 'flw-gps' + (collecting ? '' : ' off');
        flowState.textContent = collecting ? 'open: awaitClose waiting' : 'closed';
        badge.className = 'flw-gps flw-big' + (online ? '' : ' bad');
        badge.textContent = online ? 'Online' : 'Offline';
        collState.textContent = collecting ? 'collecting isOnline()' : online !== net ? 'not collecting: shows an old value' : 'not collecting';
      };
      function register() {
        const id = nextId++;
        const c = { id, alive: true, e: h('span', { class: 'flw-v acc drop-in' }, `callback #${id - 1}`) };
        cbs.push(c); reg.append(c.e);
        return c;
      }
      function deliver(v) {
        const d = h('span', { class: 'flw-v acc drop-in' }, String(v));
        lane.append(d);
        setTimeout(() => {
          if (!d.isConnected) return;
          uiHold.replaceChildren(); d.className = 'flw-v ok'; moveTo(d, uiHold);
          online = v; paint(); replay(badge, 'pop');
        }, 450);
      }
      async function fire(v) {
        if (busy) return;
        if (net === v) { replay(badge, 'shake'); say(o, `<span class="muted">no-op:</span> the network is already ${v ? 'up' : 'down'}.`); return; }
        busy = true; net = v;
        if (!cbs.length) {
          paint(); replay(reg, 'shake');
          say(o, `<span class="muted">nobody listening:</span> ${v ? 'onAvailable' : 'onLost'} fired, but no callback is registered, so the screen was not told.`);
          busy = false; return;
        }
        let sent = 0, failed = 0;
        for (const c of cbs) {
          replay(c.e, c.alive ? 'pop' : 'shake');
          if (c.alive) { deliver(v); sent++; } else { failed++; c.e.className = 'flw-v bad'; }
          await sleep(220); if (!reg.isConnected) return;
        }
        if (!sent) paint();
        say(o, failed
          ? `<span class="bad">leak:</span> ${failed} dead callback${failed === 1 ? '' : 's'} still got ${v ? 'onAvailable' : 'onLost'}. trySend(${v}) failed because ${failed === 1 ? 'its' : 'their'} flow is closed, but the system still holds ${failed === 1 ? 'it' : 'them'}.`
          : `<span class="good">ok:</span> ${v ? 'onAvailable' : 'onLost'} called trySend(${v}), and the value reached the screen.`);
        busy = false;
      }
      const leakBox = h('input', { type: 'checkbox', id: 'flw-cb-leak', onchange() {
        leak = this.checked;
        say(o, leak ? '<span class="bad">bug mode:</span> awaitClose { } no longer unregisters. Cancel and collect again a few times.' : '<span class="good">fixed:</span> awaitClose { unregisterNetworkCallback(callback) } is back.');
      } });
      const snippet = h('div', { class: 'kt' });
      const paintCode = () => { snippet.innerHTML = hl(`callbackFlow {\n    registerDefaultNetworkCallback(callback)\n    awaitClose { ${leak ? '' : 'unregisterNetworkCallback(callback) '}}\n}`); };
      leakBox.addEventListener('change', paintCode);
      register(); uiHold.append(h('span', { class: 'flw-v ok' }, 'true'));
      paint(); paintCode();
      o.innerHTML = 'The screen is collecting, so callback #1 is registered. Drop the network, bring it back, then cancel.';

      // channelFlow: two senders, one stream.
      const lanes = [['launch { cache }', 500, 'cached: 12 posts'], ['launch { network }', 1500, 'fresh: 15 posts']].map(([name, ms, val]) => {
        const bar = h('i');
        return { name, ms, val, bar, row: h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, name.slice(9, -2)), h('span', { class: 'flw-prog' }, bar)) };
      });
      const outStrip = h('div', { class: 'flw-strip' });
      const o2 = out('channelFlow lets two coroutines send into one flow.');
      let busy2 = false;
      el.append(
        h('div', { class: 'flw-cb' },
          h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src' }, 'ConnectivityManager'), count), h('span', { class: 'flw-note' }, 'registered callbacks'), reg),
          h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('callbackFlow') }), flowState), h('span', { class: 'flw-note' }, 'trySend(…)'), lane),
          h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src' }, 'screen'), badge), collState, uiHold)),
        snippet,
        h('label', { class: 'switch', for: 'flw-cb-leak' }, leakBox, 'forget to unregister in awaitClose'),
        h('div', { class: 'controls' },
          cmd('isOnline().collect { show(it) }', () => {
            if (busy) return;
            if (collecting) { replay(flowState, 'shake'); say(o, '<span class="muted">already collecting:</span> cancel first, then collect again.'); return; }
            collecting = true; lane.replaceChildren();
            const c = register(); paint();
            deliver(net);
            say(o, `<span class="good">collect:</span> the block ran, registered callback #${c.id - 1} and sent the current state.${cbs.length > 1 ? ` The system now holds ${cbs.length} callbacks.` : ''}`);
          }),
          cmd('onLost()', () => fire(false)),
          cmd('onAvailable()', () => fire(true)),
          cmd('job.cancel()', async () => {
            if (busy) return;
            if (!collecting) { replay(flowState, 'shake'); say(o, '<span class="muted">no-op:</span> nothing is collecting.'); return; }
            busy = true; collecting = false; paint(); replay(flowState, 'pop');
            const c = cbs.find(x => x.alive); c.alive = false;
            await sleep(350); if (!reg.isConnected) return;
            if (!leak) {
              c.e.classList.add('fly-out'); await sleep(400); c.e.remove(); cbs.splice(cbs.indexOf(c), 1); paint();
              say(o, '<span class="good">awaitClose ran:</span> unregisterNetworkCallback removed the callback. Nothing is left behind.');
            } else {
              c.e.className = 'flw-v warn'; c.e.textContent += ' (leaked)'; replay(c.e, 'shake');
              say(o, `<span class="bad">leaked:</span> awaitClose ran but did nothing. The system still holds callback #${c.id - 1} and calls it on every change.`);
            }
            busy = false;
          })),
        o,
        h('div', { class: 'flw-search' },
          h('div', { class: 'controls' }, cmd('channelFlow { launch { cache }; launch { network } }', async () => {
            if (busy2) return; busy2 = true;
            outStrip.replaceChildren();
            say(o2, 'Both coroutines started at once inside channelFlow.');
            await Promise.all(lanes.map(async l => {
              l.bar.style.transition = 'none'; l.bar.style.width = '0%'; void l.bar.offsetWidth;
              l.bar.style.transition = `width ${l.ms}ms linear`; l.bar.style.width = '100%';
              await sleep(l.ms); if (!outStrip.isConnected) return;
              outStrip.append(h('span', { class: 'flw-v ok drop-in' }, l.val));
            }));
            busy2 = false;
            if (outStrip.isConnected) say(o2, '<span class="good">one stream:</span> the cache answered first, then the network. Both sent into the same flow, which completed when both coroutines were done.');
          })),
          lanes.map(l => l.row),
          h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'collect'), outStrip)),
        o2);
    },
  };

  // ─── Depth: Go deeper, under the hood, common mistakes ─────────────────
  const hotDepth = {
    deeper: [
      {
        title: 'StateFlow compares with equals()',
        body: `<p>StateFlow emits only when the new value is not equal to the current one. For a list, equal means same items in the same order. A list with the same contents is skipped, even if it is a new object.</p>
<p>Mutating a list in place is worse. The StateFlow already holds that same list, so the “new” value is equal to itself. Nothing is emitted, and the screen goes stale. Always set a new immutable value.</p>`,
        visual(el) {
          const FRUITS = ['Kiwi', 'Plum', 'Fig', 'Lime', 'Pear'];
          let mem = ['Apple', 'Pear'], shown = ['Apple', 'Pear'], next = 0, emits = 1;
          const memStrip = h('div', { class: 'flw-strip flw-wrap' }), shownStrip = h('div', { class: 'flw-strip flw-wrap' });
          const badge = h('span', { class: 'flw-badge' }, 'emissions 1');
          const o = out();
          const draw = (strip, list) => strip.replaceChildren(...list.map(v => h('span', { class: 'flw-v' }, v)));
          function paint() { draw(memStrip, mem); draw(shownStrip, shown); }
          const nextFruit = () => FRUITS[next++ % FRUITS.length];
          const emit = () => { shown = [...mem]; emits++; badge.textContent = `emissions ${emits}`; replay(badge, 'pop'); paint(); replay(shownStrip, 'pop-soft'); };
          const shownPanel = h('div', { class: 'flw-subrow' }, h('div', { class: 'flw-subhead' }, h('span', {}, 'what the screen collected'), badge), shownStrip);
          paint();
          o.innerHTML = 'The StateFlow holds a list and the screen shows what it collected. Add a fruit three ways.';
          el.append(
            h('div', { class: 'controls' },
              cmd('_cart.update { it + "Kiwi" }', () => {
                if (mem.length >= 6) mem = ['Apple'];
                mem = [...mem, nextFruit()];
                emit();
                say(o, '<span class="good">emitted:</span> update built a new list that differs from the old one, so collectors got it.');
              }),
              cmd('cart.add("Kiwi"); _cart.value = cart', () => {
                if (mem.length >= 6) { replay(memStrip, 'shake'); say(o, '<span class="muted">full:</span> press Reset to start over.'); return; }
                mem.push(nextFruit());
                paint(); replay(memStrip, 'pop-soft'); replay(shownPanel, 'shake');
                say(o, '<span class="bad">no emission:</span> the StateFlow already held this same list object. Old value equals new value, so the screen is now stale.');
              }),
              cmd('_cart.value = cart.toList()', () => {
                const stale = shown.join() !== mem.join();
                if (stale) { emit(); say(o, '<span class="good">emitted:</span> a new list whose contents differ from what the StateFlow last had. The screen caught up.'); return; }
                replay(badge, 'shake');
                say(o, '<span class="muted">no emission:</span> a new object, but equal contents. StateFlow skipped it.');
              })),
            h('div', { class: 'flw-duo' },
              h('div', { class: 'flw-subrow' }, h('div', { class: 'flw-subhead' }, h('span', {}, 'the list in memory'), h('span', { class: 'flw-note' }, 'cart')), memStrip),
              shownPanel),
            o);
        },
      },
      {
        title: 'replay decides what late collectors get',
        body: `<p><code>MutableSharedFlow(replay = n)</code> keeps the last <code>n</code> values and hands them to every new collector before live values. With <code>replay = 1</code> it behaves a little like a StateFlow, but without an initial value and without skipping equal values.</p>
<p>Pick a replay size, emit a few values, then let a new screen join.</p>`,
        code: `private val _log = MutableSharedFlow<LogLine>(
    replay = 3,                       // late collectors get the last 3
    extraBufferCapacity = 16,         // room for bursts before emit suspends
)`,
        visual(el) {
          const SIZES = [0, 1, 3];
          let replayN = 0, n = 0, subs = [];
          const sent = h('div', { class: 'flw-strip flw-wrap' });
          const list = h('div', { style: 'display:grid;gap:8px' });
          const o = out();
          const btns = SIZES.map(k => cmd(`MutableSharedFlow<Int>(replay = ${k})`, () => setReplay(k)));
          function setReplay(k) {
            replayN = k; n = 0; subs = [];
            sent.replaceChildren(h('span', { class: 'flw-note' }, 'nothing emitted yet'));
            list.replaceChildren(); addSub(false);
            pressed(btns, SIZES, k);
            say(o, `<span class="muted">replay = ${k}:</span> emit a few values, then let a screen join late.`);
          }
          function markCache() {
            const chips = [...sent.querySelectorAll('.flw-v')];
            chips.forEach((c, i) => c.classList.toggle('acc', i >= chips.length - replayN));
          }
          function addSub(late) {
            const strip = h('div', { class: 'flw-strip flw-wrap' }), note = h('span', { class: 'flw-note' });
            list.append(h('div', { class: `flw-subrow${late ? ' drop-in' : ''}` }, h('div', { class: 'flw-subhead' }, h('span', {}, `screen ${'ABCD'[subs.length]}`), note), strip));
            subs.push(strip);
            if (!late) return;
            const cache = [...sent.querySelectorAll('.flw-v')].slice(replayN ? -replayN : sent.children.length).map(c => c.textContent);
            cache.forEach(v => strip.append(h('span', { class: 'flw-v acc drop-in' }, v)));
            note.textContent = cache.length ? `replayed ${cache.length}` : 'got nothing from the past';
            note.className = cache.length ? 'flw-note' : 'flw-note warn';
          }
          setReplay(0);
          el.append(
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'controls' },
              cmd('_flow.emit(n)', () => {
                n++;
                sent.querySelectorAll('.flw-note').forEach(x => x.remove());
                sent.append(h('span', { class: 'flw-v drop-in' }, String(n)));
                while (sent.children.length > 6) sent.firstElementChild.remove();
                markCache();
                subs.forEach(s => { s.append(h('span', { class: 'flw-v ok drop-in' }, String(n))); while (s.children.length > 6) s.firstElementChild.remove(); });
                say(o, `emitted ${n}. ${replayN ? `The highlighted ${Math.min(replayN, n)} sit in the replay cache.` : 'Nothing is cached.'}`);
              }),
              cmd('a new screen starts collecting', () => {
                if (subs.length >= 3) { replay(list, 'shake'); say(o, '<span class="muted">full:</span> pick a replay size to start over.'); return; }
                addSub(true);
                say(o, replayN ? `<span class="good">joined:</span> it got the last ${replayN} value${replayN === 1 ? '' : 's'} first, then live ones.` : '<span class="bad">joined:</span> replay = 0, so it only sees values emitted from now on.');
              })),
            h('div', { class: 'flw-subrow' }, h('div', { class: 'flw-subhead' }, h('span', {}, 'emitted so far'), h('span', { class: 'flw-note' }, 'highlight = replay cache')), sent),
            list, o);
        },
      },
      {
        title: 'Events while nobody listens: Channel keeps them',
        body: `<p>A <code>SharedFlow</code> with no replay drops an event when nobody is collecting, for example while the app is in the background. For one-off events that must not get lost, use a <code>Channel</code> and expose it with <code>receiveAsFlow()</code>. A buffered channel holds events until a collector arrives.</p>
<p>The trade-off: each event goes to exactly one collector. That is usually what you want for navigation or a snackbar.</p>`,
        code: `private val _events = Channel<UiEvent>(Channel.BUFFERED)
val events: Flow<UiEvent> = _events.receiveAsFlow()

fun save() = viewModelScope.launch {
    repo.save()
    _events.send(UiEvent.ShowSnackbar("Saved"))   // waits in the buffer if needed
}`,
        visual(el) {
          let fg = true, k = 0;
          const NAMES = ['Saved', 'Sent', 'Synced', 'Copied'];
          const mk = (title) => {
            const buf = h('div', { class: 'flw-strip flw-wrap' }), shown = h('div', { class: 'flw-strip flw-wrap' });
            const panel = h('div', { class: 'flw-panel' },
              h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl(title) })),
              h('span', { class: 'flw-note' }, 'waiting in the flow'), buf,
              h('span', { class: 'flw-note' }, 'shown on screen'), shown);
            return { panel, buf, shown };
          };
          const sf = mk('MutableSharedFlow<UiEvent>()'), ch = mk('Channel<UiEvent>(BUFFERED)');
          const status = h('span', { class: 'flw-gps' }, 'app visible');
          const o = out();
          const empty = s => { if (!s.children.length) s.append(h('span', { class: 'flw-note' }, 'empty')); };
          const add = (s, v, cls) => { s.querySelectorAll('.flw-note').forEach(x => x.remove()); s.append(h('span', { class: `flw-v drop-in ${cls}` }, v)); while (s.children.length > 4) s.firstElementChild.remove(); };
          [sf.buf, sf.shown, ch.buf, ch.shown].forEach(empty);
          const toggle = h('button', { class: 'btn primary small', onclick() {
            fg = !fg;
            toggle.textContent = fg ? 'Go to home screen' : 'Open the app';
            status.textContent = fg ? 'app visible' : 'in background, not collecting';
            status.className = `flw-gps${fg ? '' : ' off'}`;
            if (!fg) { say(o, 'The screen stopped collecting. Now emit an event.'); return; }
            const held = [...ch.buf.querySelectorAll('.flw-v')];
            ch.buf.replaceChildren(); empty(ch.buf);
            held.forEach(c => add(ch.shown, c.textContent, 'ok'));
            say(o, held.length
              ? `<span class="good">back:</span> the Channel delivered ${held.length} held event${held.length === 1 ? '' : 's'}. The SharedFlow had nothing to give.`
              : 'Back in the foreground. Both flows deliver live events again.');
          } }, 'Go to home screen');
          o.innerHTML = 'Emit an event while the app is visible, then again while it is in the background.';
          el.append(
            h('div', { class: 'controls' },
              cmd('emit(ShowSnackbar(…))', () => {
                const v = NAMES[k++ % NAMES.length];
                if (fg) {
                  add(sf.shown, v, 'ok'); add(ch.shown, v, 'ok');
                  say(o, `"${v}" reached the screen through both.`);
                } else {
                  add(sf.buf, v, 'gone'); add(ch.buf, v, 'warn');
                  say(o, `<span class="bad">SharedFlow dropped "${v}":</span> no collector. <span class="good">The Channel holds it</span> in its buffer.`);
                }
              }),
              toggle, status),
            h('div', { class: 'flw-duo' }, sf.panel, ch.panel), o);
        },
      },
    ],
    underHood: {
      body: `<p>A <code>MutableStateFlow</code> keeps one value in an atomic field. Setting it compares the new value with the old one using <code>equals</code> and stops there if they match. Otherwise it stores the value and wakes the collectors. Each collector is a slot that only remembers “something changed”. When it wakes, it reads the newest value, so values set in between are skipped. That is the conflation you saw in the core demo.</p>
<p>The docs describe StateFlow as a special case of SharedFlow: replay of one, the oldest value dropped on overflow, equal values filtered out, and a required initial value.</p>`,
      code: `// Behaves like a StateFlow (except it does not need an initial value)
val shared = MutableSharedFlow<Int>(
    replay = 1,
    onBufferOverflow = BufferOverflow.DROP_OLDEST,
)
shared.tryEmit(0)                          // the initial value
val state = shared.distinctUntilChanged()`,
    },
    mistakes: [
      {
        title: 'Read, copy, write is a race',
        bad: `fun setLoading() {
    _state.value = _state.value.copy(loading = true)
}`,
        good: `fun setLoading() {
    _state.update { it.copy(loading = true) }
}`,
        why: 'Two coroutines can read the same old value and one write overwrites the other. <code>update</code> retries with compare-and-set until its change applies cleanly.',
      },
      {
        title: 'Exposing the mutable flow',
        bad: `class CartViewModel : ViewModel() {
    val items = MutableStateFlow<List<Item>>(emptyList())
}`,
        good: `class CartViewModel : ViewModel() {
    private val _items = MutableStateFlow<List<Item>>(emptyList())
    val items: StateFlow<List<Item>> = _items.asStateFlow()
}`,
        why: 'Any screen could write <code>vm.items.value = …</code> and bypass the ViewModel’s rules. Keep the mutable flow private and expose a read-only view.',
      },
      {
        title: 'Using StateFlow for a one-off event',
        bad: `private val _toast = MutableStateFlow<String?>(null)
fun save() = viewModelScope.launch {
    repo.save()
    _toast.value = "Saved"
}`,
        good: `private val _events = Channel<UiEvent>(Channel.BUFFERED)
val events = _events.receiveAsFlow()
fun save() = viewModelScope.launch {
    repo.save()
    _events.send(UiEvent.ShowToast("Saved"))
}`,
        why: 'StateFlow replays its value to every new collector. After a rotation the screen collects again and shows “Saved” a second time. Events need a flow that delivers once.',
      },
    ],
  };

  const lifecycleDepth = {
    deeper: [
      {
        title: 'In Fragments, collect with viewLifecycleOwner',
        body: `<p>A Fragment on the back stack keeps living, but its view is destroyed. When you come back, <code>onViewCreated</code> runs again. If you launch from the Fragment’s own <code>lifecycleScope</code>, the old coroutine is still there. Each trip adds another collector, and the old ones write to views that no longer exist.</p>
<p><code>viewLifecycleOwner</code> has a lifecycle that ends in <code>onDestroyView</code>, so its coroutines end with the view.</p>`,
        visual(el) {
          const MODES = [['frag', 'lifecycleScope'], ['view', 'viewLifecycleOwner.lifecycleScope']];
          let mode = 'frag', onScreen = true, viewN = 1, cols = [], acc = 0;
          const list = h('div', { class: 'flw-strip flw-wrap' });
          const stat = h('p', { class: 'tip' });
          const o = out();
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => { mode = k; reset(); say(o, `<span class="muted">mode:</span> launching from ${hl(src)} in onViewCreated. Go to Details and back a few times.`); }));
          const navBtn = h('button', { class: 'btn primary small', onclick() {
            if (!onScreen && viewN >= 5) { replay(list, 'shake'); say(o, '<span class="muted">enough:</span> five views is plenty. Pick a mode to start over.'); return; }
            onScreen = !onScreen;
            navBtn.textContent = onScreen ? 'Open Details' : 'Press Back';
            if (!onScreen) {
              cols.forEach(c => { if (c.state === 'run') c.state = 'wait'; });
              if (mode === 'view') cols.forEach(c => { if (c.view === viewN) c.state = 'gone'; });
              say(o, mode === 'view'
                ? `<span class="good">onDestroyView:</span> view #${viewN} is gone and its collector was cancelled with it.`
                : `onStop and onDestroyView ran. The Fragment is only CREATED now, so repeatOnLifecycle paused, but the coroutine from view #${viewN} is still alive.`);
            } else {
              viewN++;
              cols.forEach(c => { if (c.state === 'wait') c.state = 'run'; });
              cols.push({ view: viewN, state: 'run' });
              const stale = cols.filter(c => c.state === 'run' && c.view !== viewN).length;
              say(o, stale
                ? `<span class="bad">back:</span> onViewCreated launched another collector. ${stale} old one${stale === 1 ? '' : 's'} restarted too and now write${stale === 1 ? 's' : ''} to destroyed views.`
                : `<span class="good">back:</span> a new view #${viewN} and exactly one collector for it.`);
            }
            paint();
          } }, 'Open Details');
          function reset() {
            onScreen = true; viewN = 1; cols = [{ view: 1, state: 'run' }];
            navBtn.textContent = 'Open Details';
            pressed(modeBtns, MODES.map(m => m[0]), mode); paint();
          }
          function paint() {
            list.replaceChildren(...cols.map(c => {
              const stale = c.state === 'run' && c.view !== viewN;
              const cls = c.state === 'gone' ? 'gone' : c.state === 'wait' ? '' : stale ? 'bad' : 'ok';
              return h('span', { class: `flw-v ${cls}`, 'data-v': c.view }, `view #${c.view}${c.state === 'wait' ? ' paused' : c.state === 'gone' ? ' cancelled' : stale ? ' stale' : ''}`);
            }));
          }
          loop(list, (now, dt) => {
            acc += dt; if (acc < 1000) return; acc -= 1000;
            const live = cols.filter(c => c.state === 'run');
            live.forEach(c => { const chip = list.querySelector(`[data-v="${c.view}"]`); if (chip) replay(chip, 'pop'); });
            const bad = live.filter(c => c.view !== viewN).length;
            stat.textContent = `collectors running: ${live.length} · writing to destroyed views: ${bad}`;
          });
          reset();
          o.innerHTML = 'Each chip is a running collector. It pulses on every location update.';
          stat.textContent = 'collectors running: 1 · writing to destroyed views: 0';
          el.append(h('div', { class: 'controls' }, modeBtns), h('div', { class: 'controls' }, navBtn), list, stat, o);
        },
      },
      {
        title: 'stateIn start policies',
        body: `<p><code>stateIn</code> takes a start policy. <code>Eagerly</code> starts the upstream as soon as the ViewModel exists and never stops it. <code>Lazily</code> waits for the first collector, then never stops. <code>WhileSubscribed(5_000)</code> runs only while someone collects, plus five seconds.</p>
<p>All three stop when <code>viewModelScope</code> is cancelled. Pick a policy and step through a screen’s life.</p>`,
        visual(el) {
          const MODES = [['eager', 'SharingStarted.Eagerly'], ['lazy', 'SharingStarted.Lazily'], ['ws', 'SharingStarted.WhileSubscribed(5_000)']];
          let mode = 'ws', subs = 0, up = false, cleared = false, graceUntil = 0, starts = 0;
          const upChip = h('span', { class: 'flw-gps off' }, 'upstream stopped');
          const subChip = h('span', { class: 'flw-badge' }, 'collectors 0');
          const timer = h('i');
          const timerBox = h('div', { class: 'flw-timer', hidden: true }, timer);
          const o = out();
          const startsEl = h('span', { class: 'flw-note' }, 'upstream starts: 0');
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => { mode = k; reset(); }));
          const setUp = on => {
            if (on && !up) { starts++; replay(upChip, 'pop'); }
            up = on;
            upChip.textContent = up ? 'upstream running' : 'upstream stopped';
            upChip.className = `flw-gps${up ? '' : ' off'}`;
            startsEl.textContent = `upstream starts: ${starts}`;
          };
          function reset() {
            subs = 0; cleared = false; graceUntil = 0; starts = 0; up = false; timerBox.hidden = true;
            pressed(modeBtns, MODES.map(m => m[0]), mode);
            setUp(mode === 'eager');
            subChip.textContent = 'collectors 0';
            say(o, mode === 'eager' ? '<span class="muted">ViewModel created:</span> Eagerly started the upstream right away, before any screen asked.' : '<span class="muted">ViewModel created:</span> nothing runs until a screen collects.');
          }
          const dead = () => { if (!cleared) return false; replay(upChip, 'shake'); say(o, '<span class="muted">no-op:</span> viewModelScope is cancelled. Pick a policy to start over.'); return true; };
          loop(upChip, now => {
            if (!graceUntil) return;
            const left = graceUntil - now;
            if (left <= 0) {
              graceUntil = 0; timerBox.hidden = true; setUp(false);
              say(o, '<span class="good">5 s passed:</span> no collector came back, so WhileSubscribed stopped the upstream.');
              return;
            }
            timer.style.width = (left / 5000) * 100 + '%';
          });
          reset();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'controls' },
              cmd('screen starts collecting', () => {
                if (dead()) return;
                if (subs >= 2) { replay(subChip, 'shake'); say(o, '<span class="muted">enough:</span> two collectors is plenty here.'); return; }
                subs++; subChip.textContent = `collectors ${subs}`; replay(subChip, 'pop');
                const was = up;
                if (graceUntil) { graceUntil = 0; timerBox.hidden = true; }
                setUp(true);
                say(o, was ? '<span class="good">shared:</span> the upstream was already running, so this collector got the current value with no restart.' : '<span class="good">started:</span> the first collector started the upstream.');
              }),
              cmd('screen stops collecting', () => {
                if (dead()) return;
                if (!subs) { replay(subChip, 'shake'); say(o, '<span class="muted">no-op:</span> nobody is collecting.'); return; }
                subs--; subChip.textContent = `collectors ${subs}`;
                if (subs) { say(o, 'One collector left. The upstream keeps running for the other.'); return; }
                if (mode === 'ws') { graceUntil = performance.now() + 5000; timerBox.hidden = false; say(o, 'Last collector gone. WhileSubscribed waits 5 s in case it comes back, like after a rotation.'); }
                else say(o, `<span class="bad">still running:</span> ${mode === 'eager' ? 'Eagerly' : 'Lazily'} never stops while the ViewModel lives, even with nobody watching.`);
              }),
              cmd('onCleared()', () => {
                if (dead()) return;
                cleared = true; graceUntil = 0; timerBox.hidden = true; subs = 0; subChip.textContent = 'collectors 0';
                setUp(false);
                say(o, '<span class="good">cleared:</span> viewModelScope was cancelled, and the sharing coroutine with it. Every policy stops here.');
              })),
            h('div', { class: 'flw-ui' }, upChip, subChip, startsEl, h('div', { style: 'flex:1 1 120px' }, timerBox)),
            o);
        },
      },
      {
        title: 'One flow, one call: flowWithLifecycle',
        body: `<p>When a Fragment or Activity collects a single flow, <code>flowWithLifecycle</code> is a shorter way to write the same thing. It applies <code>repeatOnLifecycle</code> to the upstream. For several flows, keep one <code>repeatOnLifecycle</code> block with a <code>launch</code> per flow.</p>`,
        code: `viewLifecycleOwner.lifecycleScope.launch {
    vm.location
        .flowWithLifecycle(viewLifecycleOwner.lifecycle, Lifecycle.State.STARTED)
        .collect { binding.locationText.text = it.toString() }
}`,
      },
    ],
    underHood: {
      body: `<p><code>repeatOnLifecycle</code> is a suspend function that adds a <code>LifecycleEventObserver</code>. When the lifecycle moves up to the target state, the observer launches a child coroutine that runs your block. When it moves down past that state, the observer cancels that child. When the lifecycle is destroyed, <code>repeatOnLifecycle</code> returns, so the code after it runs only at the very end.</p>
<p><code>collectAsStateWithLifecycle</code> is built from the same piece. It is a <code>produceState</code> whose producer calls <code>repeatOnLifecycle</code> and collects inside it.</p>
<p><code>stateIn</code> launches one sharing coroutine in the scope you pass. It watches the StateFlow’s subscriber count. The start policy turns those counts into start and stop commands for the upstream collection.</p>`,
      code: `// Roughly what collectAsStateWithLifecycle does
@Composable
fun <T> StateFlow<T>.collectAsStateWithLifecycleSketch(lifecycle: Lifecycle): State<T> =
    produceState(initialValue = value, this, lifecycle) {
        lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            collect { value = it }
        }
    }`,
    },
    mistakes: [
      {
        title: 'Two collect calls in a row',
        bad: `repeatOnLifecycle(Lifecycle.State.STARTED) {
    vm.location.collect { showLocation(it) }
    vm.events.collect { handle(it) }   // never reached
}`,
        good: `repeatOnLifecycle(Lifecycle.State.STARTED) {
    launch { vm.location.collect { showLocation(it) } }
    launch { vm.events.collect { handle(it) } }
}`,
        why: '<code>collect</code> suspends until the flow completes. A StateFlow never completes, so the second line never runs. Give each flow its own <code>launch</code>.',
      },
      {
        title: 'Calling stateIn in a getter or function',
        bad: `val items: StateFlow<List<Item>>
    get() = repo.items().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList()
    )`,
        good: `val items: StateFlow<List<Item>> = repo.items().stateIn(
    viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList()
)`,
        why: 'Every access creates a new StateFlow and a new sharing coroutine that lives as long as <code>viewModelScope</code>. Each recomposition can add one. Create it once, as a property.',
      },
      {
        title: 'collectAsState on Android',
        bad: `@Composable
fun MapScreen(vm: MapViewModel) {
    val location by vm.location.collectAsState()
    LocationText(location)
}`,
        good: `@Composable
fun MapScreen(vm: MapViewModel) {
    val location by vm.location.collectAsStateWithLifecycle()
    LocationText(location)
}`,
        why: '<code>collectAsState</code> collects as long as the composable is in the composition, which includes time in the background. The lifecycle-aware version stops below STARTED, so <code>WhileSubscribed</code> can stop the upstream.',
      },
    ],
  };

  Lab.addTrack({
    id: 'flow',
    title: 'Flow',
    description: 'How Flow streams values to your UI, from cold flows and operators to errors, hot flows and lifecycle-aware collection.',
    group: 'Building apps', requires: ['coroutines'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'cold',
        title: 'Flow basics: cold streams',
        tagline: 'A Flow does nothing until someone collects it.',
        body: `
<p>A <code>Flow</code> is a stream of values that arrive over time. Building one with <code>flow { … }</code> runs nothing. The block is a recipe that waits for someone to call <code>collect</code>.</p>
<p>Each <code>collect</code> runs the block again from the top, just for that collector. Two collectors on a flow that makes a network request make two requests. That is what <em>cold</em> means.</p>
<p><code>collect</code> is a suspend function. It returns when the flow completes. If the collecting coroutine is cancelled, the producer stops with it.</p>`,
        code: `val ticks: Flow<Int> = flow {
    println("Flow started")
    for (i in 1..4) {
        delay(800)
        emit(i)          // suspends until the collector has handled i
    }
}
// Nothing has printed yet. A Flow is only a recipe.

launch { ticks.collect { println("A got $it") } }
delay(1200)
launch { ticks.collect { println("B got $it") } }
// "Flow started" prints twice. A and B each get their own 1, 2, 3, 4.`,
        remember: 'A cold Flow is a recipe. Each collect runs it again from the start.',
        level: 'beginner',
        terms: [
          { term: 'Flow', def: 'An asynchronous stream of values that are emitted one at a time over time and handled by a collector.' },
          { term: 'Cold flow', def: 'A flow whose code runs from the start for each collector and does nothing while no one collects.' },
          { term: 'emit', def: 'Sends a value from a flow builder to the collector and suspends until the collector has handled it.' },
          { term: 'collect', def: 'A suspend terminal operator that starts a flow and handles each value, returning when the flow completes.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a flow that counts down once per second.', code: 'fun countdown(from: Int): Flow<Int> = [[flow]] {\n    for (i in from downTo 0) {\n        [[emit]](i)\n        delay(1000)\n    }\n}', why: '<code>flow { }</code> builds a cold flow. <code>emit</code> sends each value to the collector.' },
          { type: 'bug', prompt: 'Tapping Sync never syncs anything. Tap the line that causes it.', code: 'class SyncViewModel(private val repo: SyncRepository) : ViewModel() {\n    fun sync() {\n        viewModelScope.launch {\n            repo.syncAll()        // returns Flow<Progress>\n        }\n    }\n}', bug: 3, fix: '            repo.syncAll().collect { _progress.value = it }', why: 'Calling a function that returns a Flow only builds the recipe. Nothing runs until you <code>collect</code> it.' },
        ],
        quiz: [
          { q: '<code>val f = flow { println("hi"); emit(1) }</code> and nothing else. What prints?', options: ['<code>hi</code>', 'Nothing', '<code>1</code>'], a: 1, why: 'The block only runs when something collects the flow.' },
          { q: 'A cold flow makes one network request when it runs. Two screens collect it. How many requests?', options: ['One, shared', 'Two'], a: 1, why: 'Each <code>collect</code> runs the whole block again for that collector.' },
          { q: 'When does <code>ticks.collect { … }</code> return?', options: ['Right away', 'After the first value', 'When the flow completes'], a: 2, why: '<code>collect</code> suspends until the flow finishes emitting, or until it is cancelled.' },
        ],
        visual(el) {
          let runs = 1;
          const running = {};
          const runsBadge = h('span', { class: 'flw-badge' }, 'block has run 1 time');
          const idle = h('p', { class: 'flw-idle' }, 'Idle. The block runs only while someone collects.');
          const runRows = h('div', { style: 'display:grid;gap:6px' });
          const prod = h('div', { class: 'flw-prod' },
            h('div', { class: 'flw-prod-head' }, h('span', { html: hl('flow { for (i in 1..4) { delay(800); emit(i) } }') }), runsBadge),
            idle, runRows);
          const cols = {};
          const col = name => {
            const strip = h('div', { class: 'flw-strip' }), stat = h('span', { class: 'flw-stat' }, 'not collecting');
            cols[name] = { strip, stat };
            return h('div', { class: 'flw-col' }, h('span', { class: 'lane-name', html: hl(`collector ${name}`) }), strip, stat);
          };
          const colBox = h('div', { class: 'flw-cols' }, col('A'), col('B'));
          const o = out('A collected once already. Start A again, then start B while A is halfway.');
          [1, 2, 3, 4].forEach(i => cols.A.strip.append(h('span', { class: 'flw-v' }, String(i))));
          cols.A.stat.textContent = 'completed'; cols.A.stat.className = 'flw-stat fin';
          const syncIdle = () => { idle.hidden = runRows.children.length > 0; };
          syncIdle();
          async function collect(name) {
            const c = cols[name];
            if (running[name]) { replay(c.strip, 'shake'); say(o, `<span class="muted">busy:</span> collector ${name} is still collecting. collect returns when the flow completes.`); return; }
            running[name] = true; runs++;
            runsBadge.textContent = `block has run ${runs} times`; replay(runsBadge, 'pop');
            c.strip.replaceChildren(); c.stat.textContent = 'collecting'; c.stat.className = 'flw-stat on';
            const st = h('b', {}, 'Flow started');
            const row = h('div', { class: 'flw-run drop-in' }, `run ${runs} for ${name}: `, st);
            runRows.append(row); syncIdle();
            say(o, `${hl(`launch { ticks.collect { ${name} } }`)} <span class="muted">// the block starts from the top for ${name}</span>`);
            for (let i = 1; i <= 4; i++) {
              await sleep(800); if (!prod.isConnected) return;
              st.textContent = `emit(${i})`; replay(row, 'pop-soft');
              c.strip.append(h('span', { class: 'flw-v acc drop-in' }, String(i)));
            }
            await sleep(300); if (!prod.isConnected) return;
            c.strip.querySelectorAll('.flw-v').forEach(v => v.classList.remove('acc'));
            c.stat.textContent = 'completed'; c.stat.className = 'flw-stat fin';
            row.classList.add('leave');
            await sleep(450); row.remove(); syncIdle();
            running[name] = false;
            say(o, `<span class="good">done:</span> ${name}'s run finished and collect returned. ${Object.values(running).some(Boolean) ? 'The other run is still going on its own.' : 'The producer is idle again.'}`);
          }
          el.append(
            h('div', { class: 'controls' },
              cmd('val ticks = flow { … }', () => { replay(prod, 'shake'); say(o, '<span class="muted">nothing happened:</span> defining a Flow runs no code. The block waits for a collector.'); }),
              cmd('launch { ticks.collect { A } }', () => collect('A')),
              cmd('launch { ticks.collect { B } }', () => collect('B'))),
            prod, colBox, o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'operators',
        title: 'Flow operators',
        tagline: 'map, filter, debounce, distinctUntilChanged, combine on a marble diagram.',
        body: `
<p>Operators take a flow and return a new flow. <code>map</code> transforms each value, <code>filter</code> drops values that fail a test, and <code>distinctUntilChanged</code> drops a value that equals the one right before it. Nothing runs until someone collects the final flow.</p>
<p>Some operators care about time. <code>debounce(300)</code> waits until values stop arriving for 300 ms, then passes on only the latest one. That is how a search box avoids one request per keystroke.</p>
<p><code>combine</code> joins flows. It emits once every input has a value, then again whenever any input changes, using the latest value from each.</p>`,
        code: `@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
val results: Flow<List<Article>> = query    // StateFlow<String> from the text field
    .debounce(300)                          // wait for a 300 ms pause in typing
    .map { it.trim() }
    .filter { it.length >= 2 }
    .distinctUntilChanged()                 // "kotlin" then "kotlin " is one search
    .mapLatest { api.search(it) }           // a new query cancels the old search

val screen: Flow<List<Article>> = combine(results, favorites) { list, favs ->
    list.map { it.copy(isFavorite = it.id in favs) }
}`,
        remember: 'map changes, filter drops, distinctUntilChanged skips repeats, debounce waits for quiet, combine joins the latest values.',
        level: 'intermediate',
        terms: [
          { term: 'debounce', def: 'A flow operator that waits for a pause of the given length and then emits only the latest value.' },
          { term: 'distinctUntilChanged', def: 'A flow operator that drops a value equal to the one emitted right before it.' },
          { term: 'combine', def: 'Joins flows and emits using the latest value of each, every time any of them emits.' },
          { term: 'mapLatest', def: 'Like map, but a new value cancels the transform still running for the previous one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Search after the user stops typing, and skip repeated queries.', code: 'val results = query\n    .[[debounce]](300)\n    .[[distinctUntilChanged]]()\n    .mapLatest { api.search(it) }', why: '<code>debounce</code> waits for a quiet moment. <code>distinctUntilChanged</code> skips a query equal to the last one.' },
          { type: 'bug', prompt: 'Starring an article does nothing until the next search. Tap the bug.', code: 'val favorites: Flow<Set<Int>> = favoritesRepo.ids()\nval results: Flow<List<Article>> = searchRepo.results()\n\nval screen = results.zip(favorites) { list, favs ->\n    list.map { it.copy(isFavorite = it.id in favs) }\n}', bug: 3, fix: 'val screen = combine(results, favorites) { list, favs ->', why: '<code>zip</code> waits for a new value from both flows to pair them. <code>combine</code> emits when either one changes.' },
        ],
        quiz: [
          { q: 'You type <code>k</code>, <code>ko</code>, <code>kot</code> with 100 ms between keys, then stop. With <code>debounce(300)</code>, how many searches run?', options: ['3', '1, for <code>kot</code>', '0'], a: 1, why: 'Each key resets the 300 ms wait. Only the value before the pause gets through.' },
          { q: '<code>flowOf(1, 1, 2, 2, 1).distinctUntilChanged().toList()</code>', options: ['<code>[1, 2]</code>', '<code>[1, 2, 1]</code>', '<code>[1, 1, 2, 2, 1]</code>'], a: 1, why: 'It only compares with the previous value, so the final 1 differs from the 2 before it and passes.' },
          { q: 'When does <code>combine(a, b) { … }</code> emit its first value?', options: ['When a emits', 'When both a and b have emitted at least once', 'When both complete'], a: 1, why: 'It needs a latest value from every input before it can call your lambda.' },
        ],
        visual(el) {
          const T = 2200, END = 2000, SLOW = 1.6;
          const col = v => (typeof v === 'number' ? v % 5 : 3 + 'AB'.indexOf(v));
          const SRC = [[100, 1], [400, 2], [700, 2], [1000, 3], [1300, 4], [1550, 4], [1800, 5]];
          const OPS = {
            map: {
              code: 'upstream.map { it * 10 }',
              note: 'map: every value went through, multiplied by 10, the moment it arrived.',
              build: () => ({ inputs: [{ name: 'upstream', items: SRC.map(([t, v]) => ({ t, v })) }], output: SRC.map(([t, v]) => ({ t, v: v * 10, c: col(v) })) }),
            },
            filter: {
              code: 'upstream.filter { it % 2 == 0 }',
              note: 'filter: odd values were dropped. Even ones passed through unchanged.',
              build: () => ({ inputs: [{ name: 'upstream', items: SRC.map(([t, v]) => ({ t, v, dropAt: v % 2 ? t : null })) }], output: SRC.filter(([, v]) => v % 2 === 0).map(([t, v]) => ({ t, v })) }),
            },
            distinct: {
              code: 'upstream.distinctUntilChanged()',
              note: 'distinctUntilChanged: the second 2 and the second 4 equal the value right before them, so they were dropped.',
              build: () => {
                const items = SRC.map(([t, v], i) => ({ t, v, dropAt: i && SRC[i - 1][1] === v ? t : null }));
                return { inputs: [{ name: 'upstream', items }], output: items.filter(m => m.dropAt == null).map(({ t, v }) => ({ t, v })) };
              },
            },
            debounce: {
              code: 'upstream.debounce(300)',
              note: 'debounce: a value followed by another within 300 ms was dropped. The last value of each burst got through 300 ms later. At completion, the pending 6 was emitted right away.',
              build: () => {
                const D = [[100, 1], [330, 2], [560, 3], [1100, 4], [1330, 5], [1750, 6]];
                const next = i => (i + 1 < D.length ? D[i + 1][0] : Infinity);
                const items = D.map(([t, v], i) => { const fire = Math.min(t + 300, END); return next(i) < fire ? { t, v, dropAt: next(i) } : { t, v, outAt: fire }; });
                return {
                  inputs: [{ name: 'upstream', items }],
                  output: items.filter(m => m.outAt).map(m => ({ t: m.outAt, v: m.v })),
                  windows: D.map(([t], i) => ({ s: t, e: Math.min(t + 300, next(i), END) })),
                };
              },
            },
            combine: {
              code: 'combine(numbers, letters) { n, l -> "$n$l" }',
              note: 'combine: nothing came out until letters had a value. After that, every change on either side paired with the latest from the other.',
              build: () => {
                const A = [[100, 1], [900, 2], [1700, 3]], B = [[500, 'A'], [1300, 'B']];
                let a = null, b = null; const output = [];
                [...A.map(x => [...x, 'a']), ...B.map(x => [...x, 'b'])].sort((x, y) => x[0] - y[0]).forEach(([t, v, side]) => {
                  if (side === 'a') a = v; else b = v;
                  if (a != null && b != null) output.push({ t, v: `${a}${b}`, c: col(a) });
                });
                return { inputs: [{ name: 'numbers', items: A.map(([t, v]) => ({ t, v })) }, { name: 'letters', items: B.map(([t, v]) => ({ t, v })) }], output };
              },
            },
          };
          const LABELS = { map: '.map { it * 10 }', filter: '.filter { it % 2 == 0 }', distinct: '.distinctUntilChanged()', debounce: '.debounce(300)', combine: 'combine(a, b)' };
          const diagram = h('div', { class: 'flw-marbles' });
          const o = out();
          let busy = false;
          const opButtons = Object.keys(OPS).map(k => cmd(LABELS[k], () => play(k)));
          const pct = t => (t / T) * 100 + '%';
          function build(key) {
            const op = OPS[key].build(), ev = [], cursors = [];
            const track = () => { const tr = h('div', { class: 'flw-mtrack' }); const c = h('span', { class: 'cursor', style: 'left:0' }); tr.append(c); cursors.push(c); return tr; };
            const reveal = (t, e) => ev.push([t, () => e.classList.remove('hide')]);
            const marble = (tr, m) => {
              const e = h('span', { class: `flw-m c${m.c != null ? m.c : col(m.v)} hide`, style: `left:${pct(m.t)}` }, String(m.v));
              tr.append(e); reveal(m.t, e);
              if (m.dropAt != null) ev.push([m.dropAt + 1, () => e.classList.add('gone')]);
            };
            const end = tr => { const e = h('span', { class: 'flw-end hide', style: `left:${pct(END)}` }); tr.append(e); reveal(END, e); };
            const rows = op.inputs.map(lane => {
              const tr = track();
              (op.windows || []).forEach(w => { const e = h('span', { class: 'flw-win hide', style: `left:${pct(w.s)};width:${((w.e - w.s) / T) * 100}%` }); tr.append(e); reveal(w.s, e); });
              lane.items.forEach(m => marble(tr, m)); end(tr);
              return h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, lane.name), tr);
            });
            rows.push(h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, 'operator'), h('div', { class: 'flw-op', html: hl(OPS[key].code) })));
            const otr = track(); op.output.forEach(m => marble(otr, m)); end(otr);
            rows.push(h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, 'collect'), otr));
            diagram.replaceChildren(...rows);
            opButtons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(OPS)[i] === key));
            ev.sort((x, y) => x[0] - y[0]);
            return { ev, cursors };
          }
          function play(key) {
            if (busy) return; busy = true;
            const { ev, cursors } = build(key);
            say(o, `<span class="muted">playing</span> ${hl(OPS[key].code)}`);
            let i = 0; const t0 = performance.now();
            const step = now => {
              if (!diagram.isConnected) return;
              const t = Math.min((now - t0) / SLOW, T);
              while (i < ev.length && ev[i][0] <= t) ev[i++][1]();
              cursors.forEach(c => { c.style.left = pct(t); });
              if (t < T) requestAnimationFrame(step);
              else { busy = false; say(o, OPS[key].note); }
            };
            requestAnimationFrame(step);
          }
          // Open on a finished map diagram.
          const first = build('map');
          first.ev.forEach(([, f]) => f()); first.cursors.forEach(c => { c.style.left = '100%'; });
          o.textContent = 'Pick an operator to play it. Time runs left to right; the bar marks completion.';

          // Search box: the same chain on real keystrokes.
          const input = h('input', { id: 'flw-search', value: 'flow', spellcheck: 'false', autocomplete: 'off' });
          const typed = h('div', { class: 'flw-strip' }), sent = h('div', { class: 'flw-strip' });
          const tbar = h('i'), timer = h('div', { class: 'flw-timer' }, tbar);
          const stats = h('span', { class: 'flw-stat' });
          const so = out('Type in the box. Each pause of 300 ms fires one search.');
          let keys = 4, searches = 1, last = 'flow', pending, typing = false;
          const add = (strip, chip) => { strip.prepend(chip); while (strip.children.length > 7) strip.lastElementChild.remove(); };
          const paintStats = () => { stats.textContent = `${keys} keystrokes, ${searches} search${searches === 1 ? '' : 'es'}`; };
          ['flow', 'flo', 'fl', 'f'].reverse().forEach(q => add(typed, h('span', { class: 'flw-v' }, q)));
          add(sent, h('span', { class: 'flw-v ok' }, 'flow'));
          paintStats();
          function onKey() {
            const q = input.value; keys++; paintStats();
            add(typed, h('span', { class: 'flw-v drop-in' }, q === '' ? '""' : JSON.stringify(q).slice(1, -1).replace(/ /g, '␣')));
            tbar.style.transition = 'none'; tbar.style.width = '100%'; void tbar.offsetWidth;
            tbar.style.transition = 'width 300ms linear'; tbar.style.width = '0%';
            clearTimeout(pending);
            pending = setTimeout(() => {
              if (!input.isConnected) return;
              const t = q.trim();
              if (t.length < 2) { add(sent, h('span', { class: 'flw-v gone drop-in' }, t || '""')); say(so, `<span class="muted">filter:</span> "${t}" is shorter than 2 characters, so no search.`); return; }
              if (t === last) { add(sent, h('span', { class: 'flw-v gone drop-in' }, t)); say(so, `<span class="muted">distinctUntilChanged:</span> "${t}" after trim is the same as the last query, so no new search.`); return; }
              last = t; searches++; paintStats();
              add(sent, h('span', { class: 'flw-v ok drop-in' }, t));
              say(so, `<span class="good">search:</span> ${hl(`api.search("${t}")`)} <span class="muted">// ${keys} keys so far, only ${searches} searches</span>`);
            }, 300);
          }
          input.addEventListener('input', onKey);
          async function autoType(chunks) {
            if (typing) return; typing = true;
            for (const [text, pause] of chunks) {
              for (const ch of text) {
                if (!input.isConnected) return;
                input.value = ch === '\b' ? input.value.slice(0, -1) : input.value + ch; onKey();
                await sleep(110);
              }
              await sleep(pause);
            }
            typing = false;
          }
          el.append(
            h('div', { class: 'controls' }, opButtons), diagram, o,
            h('div', { class: 'flw-search' },
              h('label', { class: 'field-input', for: 'flw-search' }, 'Search', input),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'typed'), typed),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, '300 ms'), timer),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'search()'), sent),
              stats),
            h('div', { class: 'controls' },
              cmd('type "ko" … "tlin"', () => { input.value = ''; autoType([['ko', 650], ['tlin', 400]]); }),
              cmd('add a space', () => autoType([[' ', 400]]))),
            so);
        },
      },

      flatmap,
      backpressure,
      errorsRetry,

      // 3 ─────────────────────────────────────────────
      {
        id: 'hot',
        title: 'StateFlow and SharedFlow',
        tagline: 'Hot streams: one holds state, the other broadcasts events.',
        body: `
<p>A <code>StateFlow</code> always holds one current value. A new collector gets that value right away, then every change after it. Setting a value equal to the current one emits nothing, and a slow collector skips straight to the latest value. That makes it a good fit for screen state.</p>
<p>A <code>SharedFlow</code> broadcasts to whoever is collecting at that moment. With the default <code>replay = 0</code>, a collector that arrives late gets nothing from the past, and an event emitted while nobody collects is lost. Use it for one-off events like a toast, where replaying an old event would be a bug.</p>
<p>Both are <em>hot</em>: they exist and hold or emit values whether anyone collects or not. Expose them read-only with <code>asStateFlow()</code> and <code>asSharedFlow()</code> so only the ViewModel can change them.</p>`,
        code: `class EditorViewModel(private val repo: EditorRepository) : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()     // always has a value

    private val _events = MutableSharedFlow<UiEvent>()   // replay = 0
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()

    fun increment() {
        _count.update { it + 1 }
    }

    fun save() {
        viewModelScope.launch {
            repo.save()
            _events.emit(UiEvent.ShowToast("Saved"))     // late collectors miss it
        }
    }
}`,
        remember: 'StateFlow: always a value, and the latest one replays. SharedFlow: broadcast now, late collectors miss it.',
        level: 'intermediate',
        terms: [
          { term: 'StateFlow', def: 'A hot flow that always holds one current value, replays it to new collectors and skips values equal to the current one.' },
          { term: 'SharedFlow', def: 'A hot flow that broadcasts each value to its current collectors, with an optional replay cache for late ones.' },
          { term: 'Hot flow', def: 'A flow that exists and holds or emits values whether or not anyone is collecting it.' },
          { term: 'MutableStateFlow.update', def: 'Atomically replaces a StateFlow value using a function of the current value, safe across threads.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hold the query in the ViewModel and expose it read-only.', code: 'private val _query = [[MutableStateFlow]]("")\nval query: StateFlow<String> = _query.[[asStateFlow]]()', why: 'The mutable flow stays private. The UI only sees a read-only <code>StateFlow</code>.' },
          { type: 'bug', prompt: 'The Saved toast never shows while the screen is open. Tap the bug.', code: 'class EditorViewModel(private val repo: EditorRepository) : ViewModel() {\n    private val _events = MutableSharedFlow<UiEvent>()\n    val events: SharedFlow<UiEvent> = _events.asSharedFlow()\n\n    fun save() {\n        viewModelScope.launch {\n            repo.save()\n            _events.tryEmit(UiEvent.ShowToast("Saved"))\n        }\n    }\n}', bug: 7, fix: '            _events.emit(UiEvent.ShowToast("Saved"))', why: 'A default <code>MutableSharedFlow()</code> has no buffer. <code>tryEmit</code> can’t suspend, so it fails whenever someone is collecting. <code>emit</code> waits for the collector.' },
        ],
        quiz: [
          { q: 'A screen starts collecting <code>count</code> after it has reached 5. What is the first value it gets?', options: ['<code>0</code>', '<code>5</code>', 'Nothing until the next change'], a: 1, why: 'StateFlow hands every new collector its current value straight away.' },
          { q: '<code>_count.value</code> is 5 and you set it to 5 again. What do collectors get?', options: ['Another 5', 'Nothing'], a: 1, why: 'StateFlow only emits when the new value is not equal to the current one.' },
          { q: 'A <code>MutableSharedFlow&lt;UiEvent&gt;()</code> emits a toast while no one is collecting. What happens to it?', options: ['It waits for the next collector', 'It is dropped', 'It throws'], a: 1, why: 'With replay = 0 and no collectors, there is nobody to deliver to, so the event is gone.' },
        ],
        deeper: hotDepth.deeper,
        underHood: hotDepth.underHood,
        mistakes: hotDepth.mistakes,
        visual(el) {
          let count = 2, evN = 1, busy = false;
          const TOASTS = ['Saved', 'Deleted', 'Copied', 'Sent', 'Synced'];
          const NAMES = ['A', 'B', 'C', 'D'];
          const subs = [];
          const stateVal = h('span', { class: 'flw-val' }, '2');
          const sharedInfo = h('span', { class: 'flw-badge' }, 'emitted 1');
          const sList = h('div', { style: 'display:grid;gap:8px' }), eList = h('div', { style: 'display:grid;gap:8px' });
          const o = out('Screen A has been collecting from the start. Change things, then let a new screen join late.');
          const chip = (text, cls = '') => h('span', { class: `flw-v drop-in ${cls}` }, String(text));
          const push = (strip, c, max) => {
            strip.querySelectorAll('.flw-note').forEach(n => n.remove());
            strip.querySelectorAll('.acc').forEach(n => n.classList.remove('acc'));
            strip.append(c);
            while (strip.children.length > max) strip.firstElementChild.remove();
          };
          function addSub(name, late) {
            const sStrip = h('div', { class: 'flw-strip' }), sNote = h('span', { class: 'flw-note' });
            const eStrip = h('div', { class: 'flw-strip' }), eNote = h('span', { class: 'flw-note' });
            const row = (strip, note) => h('div', { class: `flw-subrow${late ? ' drop-in' : ''}` }, h('div', { class: 'flw-subhead' }, h('span', {}, `screen ${name}`), note), strip);
            sList.append(row(sStrip, sNote)); eList.append(row(eStrip, eNote));
            subs.push({ sStrip, sNote, eStrip, eNote });
            if (late) {
              push(sStrip, chip(count, 'acc'), 5); sNote.textContent = 'got the current value at once';
              eStrip.append(h('span', { class: 'flw-note' }, 'waiting for the next event'));
              eNote.textContent = `missed ${evN} earlier event${evN === 1 ? '' : 's'}`; eNote.className = 'flw-note warn';
            }
          }
          addSub('A');
          [0, 1, 2].forEach(v => subs[0].sStrip.append(h('span', { class: 'flw-v' }, String(v))));
          subs[0].eStrip.append(h('span', { class: 'flw-v ok' }, 'Saved'));
          const setVal = v => { stateVal.textContent = String(v); replay(stateVal, 'pop'); };
          const deliver = (fn) => subs.forEach((s, i) => setTimeout(() => { if (stateVal.isConnected) fn(s); }, i * 120));
          el.append(
            h('div', { class: 'controls' },
              cmd('_count.update { it + 1 }', () => {
                if (busy) return; setVal(++count);
                deliver(s => { push(s.sStrip, chip(count), 5); s.sNote.textContent = ''; });
                say(o, `<span class="good">StateFlow:</span> value is now ${count}. Every current collector got it.`);
              }),
              cmd('_count.value = _count.value', () => {
                if (busy) return; replay(stateVal, 'shake');
                say(o, `<span class="muted">no emission:</span> ${count} equals the current value, so StateFlow sent nothing.`);
              }),
              cmd('repeat(3) { _count.update { it + 1 } }', async () => {
                if (busy) return; busy = true;
                const from = count;
                for (let k = 0; k < 3; k++) { setVal(++count); await sleep(140); if (!stateVal.isConnected) return; }
                await sleep(250); if (!stateVal.isConnected) return;
                deliver(s => { push(s.sStrip, chip(count), 5); s.sNote.textContent = `skipped ${from + 1}, ${from + 2}`; });
                say(o, `<span class="good">conflated:</span> the collectors were busy drawing, so they skipped ${from + 1} and ${from + 2} and got only the latest, ${count}.`);
                busy = false;
              }),
              cmd('_events.emit(ShowToast(…))', () => {
                const t = TOASTS[evN % TOASTS.length]; evN++;
                sharedInfo.textContent = `emitted ${evN}`; replay(sharedInfo, 'pop');
                deliver(s => push(s.eStrip, chip(t, 'ok'), 3));
                say(o, `<span class="good">SharedFlow:</span> "${t}" went to everyone collecting right now. Nobody who joins later will see it.`);
              }),
              cmd('a new screen starts collecting', () => {
                if (subs.length >= NAMES.length) { replay(sList, 'shake'); say(o, '<span class="muted">full:</span> four screens is enough for this demo. Press Reset to start over.'); return; }
                const name = NAMES[subs.length];
                addSub(name, true);
                say(o, `<span class="good">screen ${name} joined:</span> StateFlow replayed ${count} at once. SharedFlow had nothing to replay, so ${name} missed ${evN} event${evN === 1 ? '' : 's'}.`);
              })),
            h('div', { class: 'flw-duo' },
              h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('StateFlow<Int>') }), stateVal), sList),
              h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('SharedFlow<UiEvent>') }), sharedInfo), eList)),
            o);
        },
      },

      callbackflow,

      // 4 ─────────────────────────────────────────────
      {
        id: 'lifecycle',
        title: 'Collecting safely in the UI',
        tagline: 'Collect while the screen is visible. Stop when it isn’t.',
        body: `
<p>A collector in the UI should run only while the screen is visible. In Compose, <code>collectAsStateWithLifecycle()</code> does this for you. In Views, wrap the collection in <code>repeatOnLifecycle(STARTED)</code>. It starts collecting when the screen reaches STARTED, cancels when it drops below, and starts again on return.</p>
<p>A plain <code>lifecycleScope.launch { flow.collect { } }</code> keeps collecting in the background until the Activity is destroyed. If the flow reads GPS or a socket, it keeps draining the battery.</p>
<p>In the ViewModel, <code>stateIn</code> turns a flow into a StateFlow with an initial value. Started with <code>SharingStarted.WhileSubscribed(5_000)</code>, it shares one upstream among all collectors and keeps it alive for 5 seconds after the last one leaves. A rotation takes far less than 5 seconds, so the upstream survives it. A trip to the home screen stops it.</p>`,
        code: `// ViewModel: one shared upstream, kept alive 5 s after the UI stops collecting
val location: StateFlow<Location?> = repo.locationUpdates()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = null,
    )

// Compose
@Composable
fun MapScreen(vm: MapViewModel = viewModel()) {
    val location by vm.location.collectAsStateWithLifecycle()
    LocationText(location)
}

// Views, in a Fragment
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        vm.location.collect { binding.locationText.text = it.toString() }
    }
}`,
        remember: 'Collect with the lifecycle: on at STARTED, off below it. WhileSubscribed(5_000) rides out a rotation.',
        level: 'advanced',
        terms: [
          { term: 'repeatOnLifecycle', def: 'Runs a block when the lifecycle reaches a given state, cancels it when it falls below, and runs it again on return.' },
          { term: 'collectAsStateWithLifecycle', def: 'Collects a flow into Compose State only while the lifecycle is at least STARTED.' },
          { term: 'stateIn', def: 'Turns a flow into a StateFlow with an initial value, shared by all collectors in a given scope.' },
          { term: 'SharingStarted.WhileSubscribed', def: 'A start policy that runs the upstream while there are collectors and stops it a set time after the last one leaves.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Share one upstream that stops 5 seconds after the UI goes away.', code: 'val items: StateFlow<List<Item>> = repo.items()\n    .[[stateIn]](viewModelScope, SharingStarted.[[WhileSubscribed]](5_000), emptyList())', why: '<code>stateIn</code> makes a StateFlow. <code>WhileSubscribed(5_000)</code> rides out a rotation and stops in the background.' },
          { type: 'bug', prompt: 'GPS keeps running after the user presses Home. Tap the bug.', code: 'override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n    viewLifecycleOwner.lifecycleScope.launch {\n        viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.CREATED) {\n            vm.location.collect { binding.locationText.text = it.toString() }\n        }\n    }\n}', bug: 2, fix: '        viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {', why: 'A stopped screen is still CREATED, so the block keeps collecting. STARTED stops it when the screen is hidden.' },
        ],
        quiz: [
          { q: 'With <code>repeatOnLifecycle(STARTED)</code>, the user presses Home. What happens to the collection?', options: ['It keeps running', 'It is cancelled, and it restarts when the screen is STARTED again', 'The Activity is destroyed'], a: 1, why: 'The block is cancelled when the lifecycle drops below STARTED and relaunched when it gets back there.' },
          { q: 'Why pass <code>5_000</code> to <code>WhileSubscribed</code>?', options: ['To poll every 5 seconds', 'So a short gap, like a rotation, does not restart the upstream', 'To time out slow network calls'], a: 1, why: 'The upstream stays alive for 5 s after the last collector leaves. A rotation reconnects well within that.' },
          { q: 'An Activity uses <code>lifecycleScope.launch { gps.collect { … } }</code>. The app sits in the background. Is GPS still being collected?', options: ['Yes, until the Activity is destroyed', 'No, it stops at onStop'], a: 0, why: '<code>lifecycleScope</code> is only cancelled at onDestroy. Collection must be tied to STARTED to stop in the background.' },
        ],
        deeper: lifecycleDepth.deeper,
        underHood: lifecycleDepth.underHood,
        mistakes: lifecycleDepth.mistakes,
        visual(el) {
          const W = 12000;
          const MODES = {
            naive: { label: 'lifecycleScope.launch { collect }', code: 'lifecycleScope.launch {\n    repo.locationUpdates().collect { show(it) }\n}' },
            lifecycle: { label: 'repeatOnLifecycle(STARTED)', code: 'lifecycleScope.launch {\n    repeatOnLifecycle(Lifecycle.State.STARTED) {\n        repo.locationUpdates().collect { show(it) }\n    }\n}' },
            shared: { label: 'stateIn(WhileSubscribed(5_000))', code: '// ViewModel\nval location = repo.locationUpdates()\n    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)\n// Compose\nval loc by vm.location.collectAsStateWithLifecycle()' },
          };
          const LANES = [['started', 'STARTED'], ['coll', 'collector'], ['up', 'GPS upstream']];
          const tracks = {};
          const tl = h('div', { class: 'timeline' }, LANES.map(([id, name]) => {
            tracks[id] = h('div', { class: 'lane-track' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), tracks[id]);
          }));
          const snippet = h('div', { class: 'kt' });
          const phone = h('div', { class: 'flw-phone', role: 'img', 'aria-label': 'Phone preview' });
          const stats = h('p', { class: 'tip' });
          const o = out();
          const modeButtons = Object.keys(MODES).map(k => cmd(MODES[k].label, () => reset(k, true)));
          let mode, fg, rotUntil, coll, up, graceUntil, restarts, bgReads, reads, readAcc, segs, phoneKey, statsText;
          function reset(m, announce) {
            mode = m; fg = true; rotUntil = 0; graceUntil = 0; restarts = 0; bgReads = 0; reads = 0; readAcc = 0; coll = up = true;
            const t = performance.now() - 3000;
            segs = { started: [{ s: t, e: null, k: 'run' }], coll: [{ s: t, e: null, k: 'run' }], up: [{ s: t, e: null, k: 'run' }] };
            phoneKey = statsText = '';
            snippet.innerHTML = hl(MODES[m].code);
            modeButtons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(MODES)[i] === m));
            homeBtn.textContent = 'Go to home screen';
            if (announce) say(o, `<span class="muted">mode:</span> ${hl(MODES[m].label)}. Now send the app to the background, or rotate.`);
          }
          function setSeg(lane, on, kind, now) {
            const arr = segs[lane], last = arr[arr.length - 1], open = last && last.e == null;
            if (open && (!on || last.k !== kind)) last.e = now;
            if (on && (!open || last.k !== kind)) arr.push({ s: now, e: null, k: kind });
            while (arr.length && arr[0].e != null && arr[0].e < now - W) arr.shift();
          }
          const coord = n => `${(41.0082 + n * 0.0004).toFixed(4)}\n${(28.9784 + n * 0.0003).toFixed(4)}`;
          function paintPhone(rotating) {
            const key = `${fg}|${rotating}|${coll}|${up}|${reads}`;
            if (key === phoneKey) return; phoneKey = key;
            const gps = h('span', { class: `flw-gps${up ? (fg ? '' : ' bad') : ' off'}` }, up ? 'GPS in use' : 'GPS off');
            let screen;
            if (rotating) screen = h('div', { class: 'flw-screen' }, h('p', { class: 'phone-note' }, 'recreating'));
            else if (fg) screen = h('div', { class: 'flw-screen' }, h('p', { class: 'phone-note' }, 'You are here'), h('p', { class: 'flw-coord', style: 'white-space:pre' }, coord(reads)), h('p', { class: 'phone-note' }, coll ? 'live' : 'waiting'));
            else screen = h('div', { class: 'flw-screen' }, h('div', { class: 'flw-home' }, Array.from({ length: 9 }, () => h('i'))), h('p', { class: 'phone-note' }, 'app in background'));
            phone.replaceChildren(gps, screen);
          }
          loop(tl, (now, dt) => {
            const rotating = now < rotUntil;
            const started = fg && !rotating;
            const c = mode === 'naive' ? !rotating : started;
            let u;
            if (mode === 'shared') {
              if (c) { u = true; graceUntil = 0; }
              else if (up) { if (!graceUntil) graceUntil = now + 5000; u = now < graceUntil; if (!u) graceUntil = 0; }
              else u = false;
            } else u = c;
            if (u && !up) restarts++;
            coll = c; up = u;
            if (up) {
              readAcc += dt;
              if (readAcc >= 1000) { readAcc -= 1000; reads++; if (!fg) bgReads++; }
            }
            setSeg('started', started, 'run', now);
            setSeg('coll', c, c && !fg ? 'block' : 'run', now);
            setSeg('up', u, !c ? 'wait' : !fg ? 'block' : 'run', now);
            const x0 = now - W;
            for (const [id] of LANES) {
              tracks[id].replaceChildren(...segs[id].filter(g => (g.e == null ? now : g.e) > x0).map(g => {
                const s = Math.max(g.s, x0), e = g.e == null ? now : g.e;
                return h('span', { class: `bar ${g.k}`, style: `left:${((s - x0) / W) * 100}%;width:${((e - s) / W) * 100}%` });
              }));
            }
            paintPhone(rotating);
            const txt = `GPS restarts: ${restarts} · readings taken in background: ${bgReads}${graceUntil && !c ? ` · upstream stops in ${((graceUntil - now) / 1000).toFixed(1)} s` : ''}`;
            if (txt !== statsText) { statsText = txt; stats.textContent = txt; }
          });
          const homeBtn = h('button', { class: 'btn primary small', onclick() {
            if (performance.now() < rotUntil) return;
            fg = !fg;
            homeBtn.textContent = fg ? 'Go to home screen' : 'Open the app';
            if (!fg) {
              say(o, {
                naive: '<span class="bad">still collecting:</span> lifecycleScope lives until onDestroy, so GPS keeps running in the background.',
                lifecycle: '<span class="good">stopped:</span> below STARTED, the collector was cancelled, and the cold flow turned GPS off with it.',
                shared: '<span class="good">collector stopped.</span> WhileSubscribed keeps GPS on for 5 s in case you come right back, then stops it.',
              }[mode]);
            } else {
              say(o, {
                naive: '<span class="muted">back:</span> it never stopped, so nothing restarted. The battery paid for every background reading.',
                lifecycle: '<span class="good">STARTED again:</span> a new collector started, and the cold flow switched GPS back on.',
                shared: up ? '<span class="good">back within 5 s:</span> the shared upstream was still running, so nothing restarted.' : '<span class="good">back:</span> the upstream had stopped, so it starts again. The StateFlow shows its last value right away.',
              }[mode]);
            }
          } }, 'Go to home screen');
          const rotBtn = h('button', { class: 'btn small', onclick() {
            if (performance.now() < rotUntil) return;
            if (!fg) { replay(phone, 'shake'); say(o, '<span class="muted">no-op:</span> open the app first, then rotate it.'); return; }
            rotUntil = performance.now() + 450; replay(phone, 'flw-rot');
            say(o, mode === 'shared'
              ? '<span class="good">rotation:</span> the collector stopped for under half a second, well inside the 5 s window, so GPS kept running.'
              : '<span class="bad">rotation:</span> the Activity was recreated. The collector restarted, and so did GPS, from scratch.');
          } }, 'Rotate');
          reset('lifecycle');
          o.innerHTML = 'The timeline is live. Send the app to the background, bring it back, rotate, then try another mode.';
          el.append(
            h('div', { class: 'controls' }, modeButtons),
            snippet,
            h('div', { class: 'flw-life' }, phone, h('div', {}, tl,
              h('div', { class: 'legend' },
                h('span', {}, h('i', { class: 'bar run' }), 'active'),
                h('span', {}, h('i', { class: 'bar block' }), 'active in background'),
                h('span', {}, h('i', { class: 'bar wait' }), 'kept alive, no collector')),
              h('div', { class: 'controls' }, homeBtn, rotBtn),
              stats)),
            o);
        },
      },
    ],
  });
})();
