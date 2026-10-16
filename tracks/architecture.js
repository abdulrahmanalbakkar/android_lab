/* App architecture track.
   Same shape as tracks/kotlin.js. Demo styles live in the css string below; every class starts with arc-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  let seed = 0x3a7;
  const addr = () => '@' + (seed = (seed * 37 + 0x1f3) % 0xfff).toString(16).padStart(3, '0');

  // A labelled box with a slot that tokens land in.
  function node(name, sub, ...extra) {
    const slot = h('div', { class: 'arc-slot' });
    const el = h('div', { class: 'arc-node' }, h('b', {}, name), sub ? h('small', { html: sub }) : null, ...extra, slot);
    return Object.assign(el, { box: slot });
  }
  const tok = (n, text, cls = '') => {
    const t = h('span', { class: `token ${cls}` }, text);
    n.box.replaceChildren(t); replay(t, 'pop');
    return t;
  };
  const clearAll = nodes => nodes.forEach(n => { n.classList.remove('on', 'bad', 'ok', 'ask'); n.box.replaceChildren(); });
  const switchEl = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked });
    input.addEventListener('change', () => onchange(input));
    return Object.assign(h('label', { class: 'switch', for: id }, input, label), { input });
  };

  // Shared by the newer lessons: a state card, a lane token, and a slot swap that animates the old card out.
  const stateCard = (name, fields, changed = [], anim = false) => h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
    h('span', { class: 'obj-name' }, name),
    fields.map(f => typeof f === 'string'
      ? h('span', { class: 'field' }, f)
      : h('span', { class: changed.includes(f[0]) ? 'field changed' : 'field' }, `${f[0]} = ${f[1]}`)));
  const swapIn = (slotEl, card) => {
    const prev = slotEl.firstElementChild;
    if (prev) { prev.classList.add('fly-out'); setTimeout(() => prev.remove(), 400); }
    slotEl.append(card);
  };
  const laneTok = (lane, text, cls = '') => {
    lane.querySelectorAll('.token').forEach(t => t.remove());
    lane.append(h('span', { class: `token drop-in ${cls}` }, text));
  };
  const band = (name, ...nodes) => h('div', { class: 'arc-band' }, h('span', { class: 'arc-band-name' }, name), h('div', { class: 'arc-row' }, nodes));
  const quote = v => (v == null ? 'null' : `"${v}"`);

  const css = `
.arc-fit, .arc-layers, .arc-udf, .arc-db, .arc-map, .arc-flow, .arc-graph, .arc-wire-row, .arc-screens { min-width: 0; }
.arc-layers { display: grid; gap: 4px; min-width: 0; }
.arc-band { display: grid; gap: 8px; padding: 12px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); transition: opacity 0.25s; min-width: 0; }
.arc-band.off { opacity: 0.35; }
.arc-band-name { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.arc-row { display: flex; flex-wrap: wrap; gap: 10px; min-width: 0; }
.arc-node { flex: 1 1 150px; min-width: 0; background: var(--surface); border: 2px solid var(--line); border-radius: 12px; padding: 10px 12px; display: grid; gap: 6px; align-content: start; transition: border-color 0.2s, background 0.2s; }
.arc-node > b { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; }
.arc-node > small { color: var(--muted); font-size: 0.8rem; line-height: 1.35; }
.arc-node.on { border-color: var(--accent); background: var(--accent-soft); }
.arc-node.ask { border-style: dashed; border-color: var(--accent); }
.arc-node.ok { border-color: var(--ok); }
.arc-node.bad { border-color: var(--err); background: var(--err-soft); }
.arc-slot { min-height: 34px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.arc-slot .token { font-size: 0.8rem; padding: 4px 10px; max-width: 100%; overflow-wrap: anywhere; }
.token.arc-back { background: var(--ok); }
.arc-dir { text-align: center; font: 600 0.78rem var(--mono); color: var(--muted); padding: 2px; }
.arc-dir.bad { color: var(--err); }
.arc-mini { display: grid; gap: 4px; }
.arc-mini span { font-size: 0.8rem; padding: 4px 8px; border-radius: 6px; background: var(--sunk); overflow-wrap: anywhere; }
.arc-mini span.arc-new { background: var(--ok-soft); }

.arc-udf { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start; }
.arc-col { display: grid; gap: 10px; min-width: 0; }
.arc-lane { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; background: var(--bg); border: 1px dashed var(--line); min-height: 48px; }
.arc-lane-name { font: 600 0.74rem var(--mono); color: var(--muted); min-width: 6.5em; }
.arc-lane .token { font-size: 0.78rem; padding: 4px 10px; overflow-wrap: anywhere; max-width: 100%; }
.arc-stateslot { display: grid; min-width: 0; }
.arc-stateslot > * { grid-area: 1 / 1; }
.arc-stateslot .obj { min-width: 0; }
.phone .arc-chips { display: flex; gap: 4px; width: 100%; }
.arc-fchip { flex: 1; font: 700 0.72rem var(--body); padding: 4px 2px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; }
.arc-fchip.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.phone.arc-top { justify-content: flex-start; gap: 6px; }
.phone .item.arc-row-item { display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 6px 9px; font-size: 0.76rem; line-height: 1.25; }
.arc-star { border: 0; background: none; cursor: pointer; font: 700 1rem var(--body); color: var(--muted); padding: 0 2px; }
.arc-star.on { color: var(--warm); }
.arc-banner { width: 100%; font-size: 0.74rem; font-weight: 700; padding: 5px 8px; border-radius: 8px; background: var(--warm-soft); color: var(--warm); }
.arc-flow { display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch; }
.arc-flow > .arc-node { flex: 1 1 140px; }
.arc-flow > .arrow { align-self: center; }

.arc-db { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.arc-table { border: 2px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.arc-table.inval { border-color: var(--warm); }
.arc-tname { font: 600 0.74rem var(--mono); color: var(--muted); padding: 6px 10px; background: var(--sunk); }
.arc-tr { display: grid; grid-template-columns: 3em minmax(0, 1fr) 4.2em; gap: 6px; padding: 7px 10px; border-top: 1px solid var(--line); font: 500 0.84rem var(--mono); align-items: center; }
.arc-tr > span { overflow-wrap: anywhere; }
.arc-tr.arc-th { font-weight: 700; color: var(--muted); border-top: 0; }
.arc-tr.changed { background: var(--warm-soft); }
.arc-tr.added { background: var(--ok-soft); }
.arc-tr.bad { background: var(--err-soft); }
.arc-empty { padding: 12px 10px; color: var(--muted); font-size: 0.86rem; border-top: 1px solid var(--line); }
.arc-badge { justify-self: start; font: 600 0.72rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.arc-badge.hot { background: var(--warm); color: var(--accent-ink); }

.arc-wire-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; }
.arc-end { font: 700 0.8rem var(--mono); padding: 10px 12px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); text-align: center; }
.arc-end.bad { outline: 2px solid var(--err); }
.arc-wire { position: relative; height: 40px; border-radius: 999px; background: var(--sunk); overflow: hidden; }
.arc-wire::before { content: ""; position: absolute; left: 10px; right: 10px; top: 50%; border-top: 2px dashed var(--line); }
.arc-packet { position: absolute; top: 6px; left: 0; transform: translateX(0); transition: left 0.85s ease-in-out, transform 0.85s ease-in-out; font: 600 0.74rem var(--mono); padding: 5px 10px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.arc-packet.far { left: 100%; transform: translateX(-100%); }
.arc-packet.mid { left: 50%; transform: translateX(-50%); }
.arc-packet.okp { background: var(--ok); }
.arc-packet.errp { background: var(--err); }
.arc-map { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.arc-json { display: grid; background: var(--code-bg); border-radius: 12px; padding: 10px 6px; min-height: 150px; align-content: start; overflow-x: auto; }
.arc-json .branch::after { color: var(--t-c); }
.arc-json .branch.hit::after { content: "  ✓"; }
.arc-json .branch.ign { opacity: 0.45; text-decoration: line-through; }
.arc-json .branch.ign::after { content: "   ignored"; }
.arc-objslot { display: grid; min-height: 150px; place-items: center; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); padding: 10px; min-width: 0; }
.arc-objslot .obj { min-width: 0; width: 100%; }
.arc-cap { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 4px; }

.arc-graph { display: grid; gap: 4px; min-width: 0; }
.arc-graph .arc-row { justify-content: center; }
.arc-graph .arc-node { flex: 0 1 220px; }
.arc-scope { justify-self: start; font: 600 0.7rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.arc-scope.single { background: var(--accent-soft); color: var(--accent); }
.arc-node .chip { height: 32px; min-width: 0; font-size: 0.82rem; padding: 0 10px; }
.arc-node .chip.arc-old { border-color: var(--line); color: var(--muted); }
.arc-node .chip.total { justify-self: start; min-width: 80px; }
.phone .item.arc-small { padding: 7px 10px; font-size: 0.82rem; }
.arc-node .chip.arc-reused { border-color: var(--ok); color: var(--ok); }
.arc-screens { display: flex; flex-wrap: wrap; gap: 8px; }
.arc-screen { font: 600 0.78rem var(--mono); padding: 6px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); }

@media (max-width: 860px) {
  .arc-udf, .arc-db, .arc-map { grid-template-columns: minmax(0, 1fr); }
  .arc-udf .phone { justify-self: center; }
}
@media (max-width: 520px) {
  .arc-wire-row { grid-template-columns: minmax(0, 1fr); }
}
/* mvvm-mvi */
.arc-mvx { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start; min-width: 0; }
.arc-panes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
.arc-pane { display: grid; gap: 8px; align-content: start; min-width: 0; padding: 12px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); }
.arc-pane-head { display: grid; gap: 2px; }
.arc-pane-head b { font: 700 0.95rem var(--mono); color: var(--accent); }
.arc-pane-head small { color: var(--muted); font-size: 0.8rem; }
.arc-pane .arc-lane { min-height: 40px; }
.arc-pane .arc-lane-name { min-width: 0; }
.arc-pane .kt { font-size: 0.76rem; }
.arc-pane .arc-cap { margin: 2px 0 0; }
.arc-total { margin-top: auto; width: 100%; text-align: right; font: 700 1.05rem var(--mono); padding-top: 6px; border-top: 1px solid var(--line); }
.phone .arc-chips .arc-fchip { font-size: 0.9rem; }

/* ui-state-patterns */
.phone.arc-rel { position: relative; }
.arc-center { flex: 1; width: 100%; display: grid; place-items: center; align-content: center; gap: 8px; text-align: center; }
.arc-center .phone-note { font-size: 0.82rem; }
.arc-refresh { width: 100%; height: 4px; flex: none; border-radius: 99px; background: var(--sunk); overflow: hidden; position: relative; }
.arc-refresh::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 40%; background: var(--accent); border-radius: 99px; animation: arc-slide 0.9s ease-in-out infinite; }
@keyframes arc-slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.arc-snack { position: absolute; left: 8px; right: 8px; bottom: 8px; display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: 0.74rem; font-weight: 700; }
.arc-snack b { color: var(--accent-soft); font: 700 0.72rem var(--mono); }
.arc-retry { font: 700 0.74rem var(--body); padding: 4px 12px; border-radius: 999px; border: 1px solid var(--accent); color: var(--accent); }

/* usecases */
.arc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.arc-tag { font: 600 0.74rem var(--mono); padding: 3px 9px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); }

/* modularization-arch */
.arc-scope.arc-hot { background: var(--warm-soft); color: var(--warm); }
.arc-scope.arc-fine { background: var(--ok-soft); color: var(--ok); }
.arc-baddep { color: var(--err); font-weight: 700; }
.arc-mods .arc-node { flex: 1 1 170px; }
.arc-screen.arc-now { border-color: var(--accent); background: var(--accent-soft); }

/* clean */
.arc-ring { display: grid; gap: 8px; padding: 12px; border-radius: 18px; border: 2px solid var(--line); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.arc-out { background: var(--bg); }
.arc-mid { background: var(--surface); }
.arc-in { background: var(--accent-soft); border-color: var(--accent); }
.arc-ring.bad { border-color: var(--err); background: var(--err-soft); }
.arc-ring-name { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.arc-cls { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.arc-cl { font: 600 0.76rem var(--mono); padding: 4px 9px; border-radius: 8px; background: var(--sunk); color: var(--ink); border: 1px solid var(--line); overflow-wrap: anywhere; min-width: 0; transition: background 0.2s, border-color 0.2s, color 0.2s; }
.arc-in .arc-cl { background: var(--surface); }
.arc-cl.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.arc-cl.hot { background: var(--warm-soft); color: var(--warm); border-color: var(--warm); }
.arc-cl.bad { background: var(--err-soft); color: var(--err); border-color: var(--err); }
.arc-pipe { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; min-width: 0; }
.arc-stage { min-width: 0; display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); transition: opacity 0.25s, border-color 0.2s; }
.arc-stage.on { border-color: var(--accent); }
.arc-stage.hot { border-color: var(--warm); }
.arc-stage.ok { border-color: var(--ok); }
.arc-stage.arc-cut, .arc-mapper.arc-cut { opacity: 0.3; }
.arc-ring.arc-cut { opacity: 0.45; }
.arc-stage .arc-stateslot { min-height: 96px; }
.arc-stage .obj { min-width: 0; font-size: 0.76rem; overflow-wrap: anywhere; padding: 8px 10px; }
.arc-mapper { font: 600 0.72rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.arc-mapper.on { color: var(--accent); }
.arc-cost { display: grid; gap: 6px; }
.arc-cost-row { display: grid; grid-template-columns: 7.5em minmax(0, 1fr) 4.5em; gap: 8px; align-items: center; font: 600 0.78rem var(--mono); color: var(--muted); transition: color 0.2s; }
.arc-cost-row .meter span { background: var(--muted); }
.arc-cost-row.on { color: var(--ink); }
.arc-cost-row.on .meter span { background: var(--accent); }

@media (max-width: 860px) {
  .arc-mvx { grid-template-columns: minmax(0, 1fr); }
  .arc-mvx .phone { justify-self: center; }
  .arc-pipe { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .arc-panes { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 420px) {
  .arc-pipe { grid-template-columns: minmax(0, 1fr); }
}`;

  Lab.addTrack({
    id: 'arch',
    title: 'App architecture',
    description: 'How a real Android app splits into layers, keeps its data straight, and wires itself together.',
    group: 'Building apps', requires: ['android', 'flow'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'layers',
        title: 'Layers: UI, domain, data',
        tagline: 'Each layer knows only the one below it.',
        body: `
<p>Google’s recommended architecture splits an app into layers. The <b>UI layer</b> draws the screen and holds screen state in a ViewModel. The <b>data layer</b> owns the data: repositories decide where it comes from, and data sources talk to the network or the database.</p>
<p>The <b>domain layer</b> sits between them and is optional. It holds use cases: small classes with one job, like “get the latest news, sorted”. Add it when several ViewModels need the same logic or a ViewModel grows too much.</p>
<p>The rule that makes this work: dependencies point one way, from UI down to data. A repository never knows which screen asked. Follow a request down and back, then try breaking the rule.</p>`,
        code: `// UI layer
@HiltViewModel
class NewsViewModel @Inject constructor(
    private val getLatestNews: GetLatestNewsUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow(NewsUiState())
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    fun refresh() = viewModelScope.launch {
        _uiState.update { it.copy(items = getLatestNews()) }
    }
}

// Domain layer (optional)
class GetLatestNewsUseCase @Inject constructor(
    private val repository: NewsRepository,
) {
    suspend operator fun invoke(): List<Article> =
        repository.latest().sortedByDescending { it.publishedAt }
}

// Data layer
class NewsRepository @Inject constructor(
    private val api: NewsApi,      // remote data source
    private val dao: ArticleDao,   // local data source
) {
    suspend fun latest(): List<Article> { /* fetch, save, read */ }
}`,
        remember: 'UI → (domain) → data. Arrows point down, never up.',
        level: 'beginner',
        terms: [
          { term: 'UI layer', def: 'The part of the app that draws the screen and holds screen state, made of Composables and ViewModels.' },
          { term: 'Data layer', def: 'The part of the app that owns the data, made of repositories and the data sources they call.' },
          { term: 'Use case', def: 'A small domain-layer class with one job that sits between ViewModels and repositories.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the use case so a ViewModel can call it like a function: <code>getLatestNews()</code>.', code: 'class GetLatestNewsUseCase @Inject constructor(\n    private val repository: [[NewsRepository]],\n) {\n    suspend operator fun [[invoke]](): List<Article> =\n        repository.latest().sortedByDescending { it.publishedAt }\n}', why: 'A use case depends on the repository below it. <code>operator fun invoke</code> lets callers write <code>getLatestNews()</code>.' },
          { type: 'bug', prompt: 'One line breaks the dependency rule. Tap it.', code: 'class NewsRepository @Inject constructor(\n    private val api: NewsApi,\n    private val viewModel: NewsViewModel,\n) {\n    suspend fun latest(): List<Article> = api.getLatest()\n}', bug: 2, fix: '    // remove it: the data layer must not know the UI layer', why: 'Dependencies point down. A repository that needs a ViewModel can’t be tested alone or shared by a second screen.' },
        ],
        quiz: [
          { q: 'Which dependency is allowed?', options: ['<code>NewsViewModel</code> uses <code>NewsRepository</code>', '<code>NewsRepository</code> uses <code>NewsViewModel</code>', 'Both, as long as it compiles'], a: 0, why: 'Dependencies point from the UI layer down to the data layer. A repository that knows a ViewModel can’t be reused or tested on its own.' },
          { q: 'Does every app need a domain layer?', options: ['Yes, every ViewModel must call a use case', 'No, add it when logic is shared or a ViewModel gets too big'], a: 1, why: 'Google marks the domain layer optional. A ViewModel may call a repository directly.' },
          { q: 'A button is tapped. Who should start the network call?', options: ['The Composable, with <code>api.getLatest()</code>', 'The ViewModel, through a use case or repository'], a: 1, why: 'The UI reports the tap. The ViewModel asks the layer below and turns the result into UiState.' },
        ],
        visual(el) {
          const pool = ['Room 2.8 notes', 'Hilt in 5 minutes', 'KSP is the default', 'StateFlow vs LiveData', 'Navigation 3 guide', 'Baseline profiles'];
          let busy = false, useCase = true, round = 0;
          const list = h('div', { class: 'arc-mini' });
          const N = {
            screen: node('NewsScreen', '@Composable · draws state', list),
            vm: node('NewsViewModel', 'holds UiState'),
            uc: node('GetLatestNewsUseCase', 'one job: latest news, sorted'),
            repo: node('NewsRepository', 'decides where data comes from'),
            api: node('NewsApi', 'remote source (Retrofit)'),
            dao: node('ArticleDao', 'local source (Room)'),
          };
          const all = Object.values(N);
          const dir1 = h('div', { class: 'arc-dir' }), dir2 = h('div', { class: 'arc-dir' });
          const band = (name, ...nodes) => h('div', { class: 'arc-band' }, h('span', { class: 'arc-band-name' }, name), h('div', { class: 'arc-row' }, nodes));
          const domain = band('Domain layer (optional)', N.uc);
          const o = out();
          const paintList = (fresh) => {
            const items = pool.slice(round % pool.length).concat(pool).slice(0, 3);
            list.replaceChildren(...items.map((t, i) => h('span', { class: fresh && i === 0 ? 'arc-new drop-in' : null }, t)));
          };
          const paintDirs = () => {
            dir1.className = dir2.className = 'arc-dir';
            dir1.textContent = '↓ depends on';
            dir2.textContent = useCase ? '↓ depends on' : '↓ ViewModel calls the repository directly';
          };
          const hop = async (n, text, back) => {
            all.forEach(x => x.classList.remove('on'));
            all.forEach(x => x.box.replaceChildren());
            n.classList.add('on'); tok(n, text, back ? 'arc-back' : '');
            await sleep(560);
            return el.isConnected;
          };
          async function refresh() {
            if (busy) return; busy = true;
            clearAll(all); paintDirs();
            const down = [[N.screen, 'onRefresh()'], [N.vm, 'refresh()'], ...(useCase ? [[N.uc, 'invoke()']] : []), [N.repo, 'latest()']];
            say(o, '<span class="muted">request going down…</span>');
            for (const [n, t] of down) if (!await hop(n, t)) return;
            all.forEach(x => { x.classList.remove('on'); x.box.replaceChildren(); });
            N.api.classList.add('on'); tok(N.api, 'GET /latest');
            N.dao.classList.add('on'); tok(N.dao, 'upsertAll()');
            await sleep(700); if (!el.isConnected) return;
            say(o, '<span class="muted">result coming back up…</span>');
            const up = [[N.repo, 'List<Article>'], ...(useCase ? [[N.uc, 'sorted list']] : []), [N.vm, 'UiState(items = 3)']];
            for (const [n, t] of up) if (!await hop(n, t, true)) return;
            round++;
            all.forEach(x => { x.classList.remove('on'); x.box.replaceChildren(); });
            N.screen.classList.add('ok'); paintList(true); replay(N.screen, 'pop-soft');
            say(o, `<span class="good">done:</span> ${useCase ? 'screen → ViewModel → use case → repository' : 'screen → ViewModel → repository'} → sources, and back up as UiState. Every arrow pointed down.`);
            busy = false;
          }
          function wrong(kind) {
            if (busy) return;
            clearAll(all); paintDirs();
            if (kind === 'up') {
              N.repo.classList.add('bad'); N.vm.classList.add('bad');
              tok(N.repo, 'import NewsViewModel', 'boom');
              const d = useCase ? dir2 : dir1;
              (useCase ? [dir1, dir2] : [dir1]).forEach(x => { x.className = 'arc-dir bad'; x.textContent = '↑ wrong way: data layer imports the UI layer'; });
              replay(N.repo, 'shake'); replay(d, 'shake');
              say(o, '<span class="bad">rule broken:</span> NewsRepository now needs a NewsViewModel to exist. You can’t test it alone, a second screen can’t reuse it, and the two classes now change together.');
            } else {
              N.screen.classList.add('bad'); N.api.classList.add('bad');
              tok(N.screen, 'api.getLatest()', 'boom'); tok(N.api, 'called from UI', 'boom');
              [dir1, dir2].forEach(x => { x.className = 'arc-dir bad'; x.textContent = '✗ skipped: ViewModel and repository'; });
              replay(N.screen, 'shake');
              say(o, '<span class="bad">rule broken:</span> the screen talks to the network itself. Nothing caches the result, rotation repeats the call, and the logic can’t be tested without a UI.');
            }
          }
          const sw = switchEl('arc-usecase', 'Use a domain layer', true, i => { if (busy) { i.checked = useCase; return; } useCase = i.checked; domain.classList.toggle('off', !useCase); clearAll(all); paintDirs(); say(o, useCase ? 'The ViewModel calls the use case, which calls the repository.' : 'No use case: the ViewModel calls the repository directly. That is allowed.'); });
          paintList(false); paintDirs();
          say(o, 'The screen shows 3 stories. Press onRefresh() to follow the request down and back.');
          el.append(
            h('div', { class: 'controls arc-fit' }, cmd('onRefresh()', refresh), sw),
            h('div', { class: 'arc-layers' }, band('UI layer', N.screen, N.vm), dir1, domain, dir2, band('Data layer', N.repo, N.api, N.dao)),
            h('div', { class: 'controls arc-fit' },
              cmd('class NewsRepository(val vm: NewsViewModel)', () => wrong('up')),
              cmd('NewsScreen { api.getLatest() }', () => wrong('skip'))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'udf',
        title: 'ViewModel and UiState',
        tagline: 'Events go up. State comes down.',
        body: `
<p>In unidirectional data flow the screen never changes its own data. When the user taps something, the screen sends an <b>event</b> to the ViewModel. The ViewModel decides what that means and produces a new <b>state</b>. The screen redraws from that state.</p>
<p>Keep the whole screen in one immutable <code>data class</code>, exposed as a <code>StateFlow</code>. To change it, the ViewModel calls <code>copy()</code> with the fields that changed. The old object stays as it was, and the new one replaces it in the flow.</p>
<p>One state object means the screen can’t show a half-updated mix, and every redraw starts from a single place you can log and test.</p>`,
        code: `data class NewsUiState(
    val filter: String = "All",
    val isLoading: Boolean = false,
    val items: List<Article> = emptyList(),
    val saved: Set<Int> = emptySet(),
)

sealed interface NewsEvent {
    data class SelectFilter(val filter: String) : NewsEvent
    data class ToggleSave(val id: Int) : NewsEvent
    data object Refresh : NewsEvent
}

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(NewsUiState())
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    fun onEvent(event: NewsEvent) {
        when (event) {
            is NewsEvent.SelectFilter -> _uiState.update { it.copy(filter = event.filter) }
            is NewsEvent.ToggleSave -> _uiState.update {
                it.copy(saved = if (event.id in it.saved) it.saved - event.id else it.saved + event.id)
            }
            NewsEvent.Refresh -> viewModelScope.launch {
                _uiState.update { it.copy(isLoading = true) }
                val items = repository.latest()
                _uiState.update { it.copy(isLoading = false, items = items) }
            }
        }
    }
}

@Composable
fun NewsScreen(viewModel: NewsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    NewsContent(state, onEvent = viewModel::onEvent)
}`,
        remember: 'Events up, state down. One immutable UiState; change it with copy().',
        level: 'intermediate',
        terms: [
          { term: 'Unidirectional data flow', def: 'A pattern where the UI sends events up to a state holder and only redraws from the state that comes back down.' },
          { term: 'UiState', def: 'An immutable data class that describes everything one screen shows at a given moment.' },
          { term: 'UI event', def: 'A message from the screen to the ViewModel that says what the user did, such as a tap on a filter.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Expose read-only state and change the filter without touching the old object.', code: 'private val _uiState = MutableStateFlow(NewsUiState())\nval uiState: [[StateFlow]]<NewsUiState> = _uiState.asStateFlow()\n\nfun selectFilter(filter: String) {\n    _uiState.[[update]] { it.[[copy]](filter = filter) }\n}', why: 'The screen gets a <code>StateFlow</code> it can’t write to. <code>update</code> swaps in a new object built with <code>copy()</code>.' },
          { type: 'bug', prompt: 'The filter changes in the ViewModel, but the screen never redraws. Tap the line that causes it.', code: '@Composable\nfun NewsScreen(viewModel: NewsViewModel = hiltViewModel()) {\n    val state = viewModel.uiState.value\n    NewsContent(\n        state = state,\n        onEvent = viewModel::onEvent,\n    )\n}', bug: 2, fix: '    val state by viewModel.uiState.collectAsStateWithLifecycle()', why: 'Reading <code>.value</code> takes one snapshot and doesn’t subscribe. <code>collectAsStateWithLifecycle()</code> recomposes on every new state.' },
        ],
        quiz: [
          { q: 'How should the screen switch the filter to "Tech"?', options: ['<code>state.filter = "Tech"</code>', '<code>onEvent(SelectFilter("Tech"))</code>', 'Keep the filter in a <code>var</code> inside the Composable'], a: 1, why: 'The screen reports what happened. The ViewModel owns the state and makes the change.' },
          { q: 'After <code>_uiState.update { it.copy(filter = "Tech") }</code>, what happened to the old state object?', options: ['Its filter field changed to "Tech"', 'Nothing. A new object replaced it in the StateFlow.'], a: 1, why: '<code>copy()</code> builds a new object. With <code>val</code> fields the old one can’t change.' },
          { q: 'Why expose <code>StateFlow</code> instead of the <code>MutableStateFlow</code>?', options: ['So only the ViewModel can write state', 'StateFlow uses less memory'], a: 0, why: 'The screen gets a read-only view, so every change has to go through an event.' },
        ],
        visual(el) {
          const source0 = [
            { id: 1, title: 'Compose tips', tag: 'Tech' },
            { id: 2, title: 'Derby tonight', tag: 'Sports' },
            { id: 3, title: 'Kotlin 2.2 notes', tag: 'Tech' },
            { id: 4, title: 'Transfer news', tag: 'Sports' },
          ];
          let source = source0.slice(), busy = false;
          let st = { filter: 'All', isLoading: false, saved: [], addr: addr() };
          const visible = s => source.filter(a => s.filter === 'All' || a.tag === s.filter);
          const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Screen preview' });
          const evLane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'events →'));
          const stLane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, '← state'));
          const reducer = h('div', { class: 'kt' });
          const vm = h('div', { class: 'arc-node' }, h('b', {}, 'NewsViewModel.onEvent()'), reducer);
          const slot = h('div', { class: 'arc-stateslot' });
          const o = out();
          const laneTok = (lane, text, cls = '') => { lane.querySelectorAll('.token').forEach(t => t.remove()); lane.append(h('span', { class: `token drop-in ${cls}` }, text)); };
          const card = (s, changed = [], anim) => h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, 'NewsUiState'),
            [['filter', `"${s.filter}"`], ['isLoading', String(s.isLoading)], ['items', `[${visible(s).length} articles]`], ['saved', `[${s.saved.join(', ')}]`]]
              .map(([k, v]) => h('span', { class: changed.includes(k) ? 'field changed' : 'field' }, `${k} = ${v}`)),
            h('span', { class: 'obj-addr' }, s.addr));
          function paintPhone() {
            const chips = h('div', { class: 'arc-chips' }, ['All', 'Tech', 'Sports'].map(f =>
              h('button', { class: 'arc-fchip' + (st.filter === f ? ' on' : ''), onclick: () => send({ type: 'filter', f }) }, f)));
            const body = st.isLoading
              ? [h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')]
              : visible(st).map(a => h('div', { class: 'item arc-row-item' }, h('span', {}, a.title),
                h('button', { class: 'arc-star' + (st.saved.includes(a.id) ? ' on' : ''), 'aria-label': `Save ${a.title}`, onclick: () => send({ type: 'save', id: a.id }) }, st.saved.includes(a.id) ? '★' : '☆')));
            phone.replaceChildren(chips, ...body);
          }
          async function emit(next, changed, line) {
            reducer.innerHTML = hl(line); vm.classList.add('on'); replay(vm, 'pop-soft');
            await sleep(500); if (!el.isConnected) return false;
            const old = st;
            st = { ...old, ...next, addr: addr() };
            const prev = slot.firstElementChild;
            if (prev) { prev.classList.add('fly-out'); setTimeout(() => prev.remove(), 400); }
            slot.append(card(st, changed, true));
            vm.classList.remove('on');
            laneTok(stLane, `NewsUiState${st.addr}`, 'arc-back');
            await sleep(350); if (!el.isConnected) return false;
            paintPhone(); replay(phone, 'pop-soft');
            say(o, `<span class="good">new state</span> ${st.addr} <span class="muted">replaced</span> ${old.addr}<span class="muted">. The old object was not touched. The screen redrew from the new one.</span>`);
            return true;
          }
          async function send(ev) {
            if (busy) return; busy = true;
            if (ev.type === 'filter') {
              laneTok(evLane, `SelectFilter("${ev.f}")`);
              await sleep(400);
              if (el.isConnected) await emit({ filter: ev.f }, ['filter', 'items'], `_uiState.update { it.copy(filter = "${ev.f}") }`);
            } else if (ev.type === 'save') {
              laneTok(evLane, `ToggleSave(${ev.id})`);
              await sleep(400);
              const saved = st.saved.includes(ev.id) ? st.saved.filter(x => x !== ev.id) : [...st.saved, ev.id].sort();
              if (el.isConnected) await emit({ saved }, ['saved'], `_uiState.update { it.copy(saved = it.saved ${st.saved.includes(ev.id) ? '-' : '+'} ${ev.id}) }`);
            } else {
              laneTok(evLane, 'Refresh');
              await sleep(400);
              if (!el.isConnected || !await emit({ isLoading: true }, ['isLoading'], '_uiState.update { it.copy(isLoading = true) }')) return;
              await sleep(800); if (!el.isConnected) return;
              if (!source.some(a => a.id === 5)) source = [{ id: 5, title: 'Navigation 3 guide', tag: 'Tech' }, ...source];
              if (!await emit({ isLoading: false }, ['isLoading', 'items'], '_uiState.update { it.copy(isLoading = false, items = items) }')) return;
            }
            busy = false;
          }
          function mutate() {
            if (busy) return;
            replay(phone, 'shake');
            say(o, '<span class="bad">compile error:</span> Unresolved reference: add. <span class="muted">items is a read-only List. The screen can only read state; send an event instead.</span>');
          }
          paintPhone();
          slot.append(card(st));
          reducer.innerHTML = hl('fun onEvent(event: NewsEvent)');
          laneTok(stLane, `NewsUiState${st.addr}`, 'arc-back');
          say(o, 'Tap a filter or a star on the phone, or send an event below.');
          el.append(
            h('div', { class: 'arc-udf' }, phone, h('div', { class: 'arc-col' }, evLane, vm, stLane, slot)),
            h('div', { class: 'controls arc-fit' },
              cmd('onEvent(SelectFilter("Tech"))', () => send({ type: 'filter', f: 'Tech' })),
              cmd('onEvent(SelectFilter("All"))', () => send({ type: 'filter', f: 'All' })),
              cmd('onEvent(ToggleSave(1))', () => send({ type: 'save', id: 1 })),
              cmd('onEvent(Refresh)', () => send({ type: 'refresh' })),
              cmd('state.items.add(article)', mutate)),
            o);
        },
      },

      // mvvm-mvi ───────────────────────────────────────
      {
        id: 'mvvm-mvi',
        title: 'MVVM vs MVI',
        tagline: 'A function per action, or one stream of intents.',
        level: 'intermediate',
        body: `
<p>Both patterns keep screen state in a ViewModel and let the screen draw it. They differ in how the screen asks for a change. In <b>MVVM</b> the ViewModel has one public function per action, like <code>increment()</code> or <code>applyCoupon()</code>. Each function updates the state in its own way.</p>
<p>In <b>MVI</b> the screen sends every action as an <b>intent</b>: a value of one sealed type, unrelated to Android’s <code>Intent</code> class. One entry point, <code>onIntent()</code>, hands the current state and the intent to a pure reducer, which returns the next state. Every change passes through one function, so you can log intents, replay them, and test the reducer with plain values.</p>
<p>MVVM is less code and fits most screens. MVI pays off when many actions touch the same state, as in a cart, a long form or an editor. The <code>onEvent()</code> ViewModel from the UiState lesson already sits between the two. Below, the same cart runs both ways at once.</p>`,
        code: `data class CartState(val qty: Int = 1, val coupon: String? = null) {
    val total: Double get() = qty * 12.0 * (if (coupon != null) 0.9 else 1.0)
}

// MVVM: one public function per action
class CartViewModel : ViewModel() {
    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state.asStateFlow()

    fun increment() = _state.update { it.copy(qty = it.qty + 1) }
    fun decrement() = _state.update { it.copy(qty = (it.qty - 1).coerceAtLeast(0)) }
    fun applyCoupon(code: String) = _state.update { it.copy(coupon = code) }
}

// MVI: one sealed intent type, one entry point, one pure reducer
sealed interface CartIntent {
    data object Increment : CartIntent
    data object Decrement : CartIntent
    data class ApplyCoupon(val code: String) : CartIntent
}

class CartMviViewModel : ViewModel() {
    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state.asStateFlow()

    fun onIntent(intent: CartIntent) = _state.update { reduce(it, intent) }

    private fun reduce(state: CartState, intent: CartIntent): CartState = when (intent) {
        CartIntent.Increment -> state.copy(qty = state.qty + 1)
        CartIntent.Decrement -> state.copy(qty = (state.qty - 1).coerceAtLeast(0))
        is CartIntent.ApplyCoupon -> state.copy(coupon = intent.code)
    }
}`,
        remember: 'MVVM: a function per action. MVI: one intent type, one reducer, every change in one place.',
        terms: [
          { term: 'MVVM', def: 'Model-View-ViewModel: the screen observes state from a ViewModel and calls one of its public functions for each user action.' },
          { term: 'MVI', def: 'Model-View-Intent: the screen sends every action as a value of one sealed type, and a single reducer turns state plus intent into the next state.' },
          { term: 'MVI intent', def: 'A value that describes one user action in MVI, such as CartIntent.Increment; it has nothing to do with android.content.Intent.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the intents and send every one through <code>reduce(state, intent)</code>.', code: 'sealed [[interface|class]] CartIntent {\n    data object Increment : CartIntent\n    data class ApplyCoupon(val code: String) : CartIntent\n}\n\nfun onIntent(intent: CartIntent) = _state.[[update]] { [[reduce]](it, intent) }', why: 'A sealed type lists every action, so <code>when</code> in the reducer must handle each one. <code>update</code> applies the reducer atomically.' },
          { type: 'bug', prompt: 'Replaying the intent log in a test places a real order. Tap the line that breaks the reducer.', code: 'private fun reduce(state: CartState, intent: CartIntent): CartState = when (intent) {\n    CartIntent.Increment -> state.copy(qty = state.qty + 1)\n    CartIntent.Decrement -> state.copy(qty = (state.qty - 1).coerceAtLeast(0))\n    is CartIntent.ApplyCoupon -> state.copy(coupon = intent.code)\n    CartIntent.Checkout -> state.also { checkoutApi.placeOrder(it) }\n}', bug: 4, fix: '    CartIntent.Checkout -> state.copy(isPlacingOrder = true)  // the ViewModel launches the call', why: 'A reducer must be pure: the same state and intent always give the same result and touch nothing else. Return a state that says an order is in progress, and let the ViewModel launch the network call.' },
        ],
        quiz: [
          { q: 'In MVI, how does the screen apply a coupon?', options: ['<code>vm.applyCoupon("SAVE10")</code>', '<code>vm.onIntent(ApplyCoupon("SAVE10"))</code>', '<code>state.coupon = "SAVE10"</code>'], a: 1, why: 'Every action is a value sent to the one entry point. The reducer decides what it does to the state.' },
          { q: 'What does an MVI reducer take and return?', options: ['The current state and an intent in, the next state out', 'An intent in, a network result out', 'Nothing; it changes the state in place'], a: 0, why: 'It is a pure function. That is why a log of intents can rebuild the same state again.' },
          { q: 'A settings screen has two toggles that never affect each other. What fits best?', options: ['Plain MVVM functions', 'Full MVI with a reducer and an intent log'], a: 0, why: 'MVI’s extra types pay off when many actions touch shared state. Two independent toggles don’t need them.' },
        ],
        visual(el) {
          const PRICE = 12, start = { qty: 1, coupon: null };
          let st = { ...start }, busy = false;
          const log = [];
          const total = s => (s.qty * PRICE * (s.coupon ? 0.9 : 1)).toFixed(2);
          const fields = s => [['qty', String(s.qty)], ['coupon', quote(s.coupon)], ['total', total(s)]];
          const o = out();
          const phone = h('div', { class: 'phone arc-top', 'aria-label': 'Cart screen preview' });
          const pane = (title, sub, laneName, capText) => {
            const lane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, laneName));
            const line = h('div', { class: 'kt' });
            const slot = h('div', { class: 'arc-stateslot' });
            const list = h('div', { class: 'arc-mini' });
            const root = h('div', { class: 'arc-pane' }, h('div', { class: 'arc-pane-head' }, h('b', {}, title), h('small', {}, sub)), lane, line, slot, h('div', { class: 'arc-cap' }, capText), list);
            return { root, lane, line, slot, list };
          };
          const A = pane('MVVM', 'CartViewModel: a public function per action', 'calls →', 'public functions');
          const B = pane('MVI', 'CartMviViewModel: one entry point', 'intents →', 'intent log');
          const API = ['increment()', 'decrement()', 'applyCoupon(code)'];
          const paintApi = hot => A.list.replaceChildren(...API.map(f => h('span', { class: f === hot ? 'arc-new' : null }, `fun ${f}`)));
          const paintLog = (cur = -1, fresh = false) => B.list.replaceChildren(...(log.length
            ? log.map((x, i) => h('span', { class: [i === cur ? 'arc-new' : '', fresh && i === log.length - 1 ? 'drop-in' : ''].join(' ').trim() || null }, `${i + 1}. ${x.intent}`))
            : [h('span', {}, '(empty)')]));
          const ACT = {
            add: { fn: 'increment()', mvvm: '_state.update { it.copy(qty = it.qty + 1) }', intent: 'Increment', mvi: 'Increment -> state.copy(qty = state.qty + 1)', next: s => ({ ...s, qty: s.qty + 1 }), ch: ['qty', 'total'] },
            sub: { fn: 'decrement()', mvvm: '_state.update { it.copy(qty = (it.qty - 1).coerceAtLeast(0)) }', intent: 'Decrement', mvi: 'Decrement -> state.copy(qty = (state.qty - 1).coerceAtLeast(0))', next: s => ({ ...s, qty: Math.max(0, s.qty - 1) }), ch: ['qty', 'total'] },
            coupon: { fn: 'applyCoupon(code)', call: 'applyCoupon("SAVE10")', mvvm: '_state.update { it.copy(coupon = code) }', intent: 'ApplyCoupon("SAVE10")', mvi: 'is ApplyCoupon -> state.copy(coupon = intent.code)', next: s => ({ ...s, coupon: 'SAVE10' }), ch: ['coupon', 'total'] },
          };
          function paintPhone() {
            phone.replaceChildren(...[
              h('p', { class: 'phone-note' }, 'Your cart'),
              h('div', { class: 'item arc-row-item' }, h('span', {}, 'Kotlin mug · €12'), h('b', {}, `× ${st.qty}`)),
              h('div', { class: 'arc-chips' },
                h('button', { class: 'arc-fchip', 'aria-label': 'Remove one', onclick: () => tap('sub') }, '−'),
                h('button', { class: 'arc-fchip', 'aria-label': 'Add one', onclick: () => tap('add') }, '+')),
              st.coupon ? h('div', { class: 'arc-banner' }, `${st.coupon}: 10% off`) : null,
              h('div', { class: 'arc-total' }, `€${total(st)}`),
            ].filter(Boolean));
          }
          async function tap(k) {
            if (busy) return; busy = true;
            const a = ACT[k];
            replay(phone, 'pop-soft');
            laneTok(A.lane, `viewModel.${a.call || a.fn}`);
            laneTok(B.lane, `onIntent(${a.intent})`);
            paintApi(a.fn);
            log.push({ intent: a.intent, k }); paintLog(log.length - 1, true);
            await sleep(450); if (!el.isConnected) return;
            A.line.innerHTML = hl(a.mvvm); B.line.innerHTML = hl(a.mvi);
            replay(A.line, 'pop-soft'); replay(B.line, 'pop-soft');
            await sleep(550); if (!el.isConnected) return;
            const nx = a.next(st);
            if (nx.qty === st.qty && nx.coupon === st.coupon) {
              say(o, '<span class="muted">Both returned a CartState equal to the current one, so StateFlow skipped it and the screen did not redraw. The MVI log still recorded the intent.</span>');
              busy = false; return;
            }
            st = nx;
            swapIn(A.slot, stateCard('CartState', fields(st), a.ch, true));
            swapIn(B.slot, stateCard('CartState', fields(st), a.ch, true));
            paintPhone();
            say(o, `<span class="good">same screen, same state.</span> MVVM ran <b>${a.fn}</b>. MVI ran <b>onIntent()</b>, and its log now holds ${log.length} intent${log.length > 1 ? 's' : ''}.`);
            busy = false;
          }
          async function replayLog() {
            if (busy) return;
            if (!log.length) { replay(B.root, 'shake'); say(o, '<span class="muted">The intent log is empty. Tap something first.</span>'); return; }
            busy = true;
            let s = { ...start };
            laneTok(A.lane, 'no log to replay', 'is-null');
            A.line.innerHTML = hl('// the calls left no record');
            laneTok(B.lane, 'CartState()');
            B.line.innerHTML = hl('var state = CartState()');
            swapIn(B.slot, stateCard('CartState', fields(s), [], true));
            say(o, '<span class="muted">MVI: starting from CartState() and feeding the log back through reduce()…</span>');
            for (let i = 0; i < log.length; i++) {
              await sleep(560); if (!el.isConnected) return;
              const a = ACT[log[i].k];
              paintLog(i);
              laneTok(B.lane, `reduce(state, ${a.intent})`);
              B.line.innerHTML = hl(a.mvi);
              s = a.next(s);
              swapIn(B.slot, stateCard('CartState', fields(s), a.ch, true));
            }
            await sleep(400); if (!el.isConnected) return;
            say(o, `<span class="good">replayed ${log.length} intent${log.length > 1 ? 's' : ''}:</span> qty = ${s.qty}, total = ${total(s)}, the same as the screen. The reducer is pure, so the log always rebuilds the same state. MVVM has no such record.`);
            busy = false;
          }
          paintPhone(); paintApi(null); paintLog();
          A.slot.append(stateCard('CartState', fields(st)));
          B.slot.append(stateCard('CartState', fields(st)));
          A.line.innerHTML = hl('fun increment() = _state.update { … }');
          B.line.innerHTML = hl('fun onIntent(intent: CartIntent)');
          say(o, 'One cart, two ViewModels. Tap a button and watch each one handle it.');
          el.append(
            h('div', { class: 'controls arc-fit' },
              cmd('tap "+"', () => tap('add')),
              cmd('tap "−"', () => tap('sub')),
              cmd('tap "Apply SAVE10"', () => tap('coupon')),
              cmd('replay(intentLog)', replayLog)),
            h('div', { class: 'arc-mvx' }, phone, h('div', { class: 'arc-panes' }, A.root, B.root)),
            o);
        },
      },

      // usecases ───────────────────────────────────────
      {
        id: 'usecases',
        title: 'Use cases and interactors',
        tagline: 'One job per class, and only when the job is real.',
        level: 'intermediate',
        body: `
<p>A use case, also called an interactor, puts one piece of business logic in its own class. Give it <code>operator fun invoke</code> and callers use it like a function: <code>getFeed()</code>. It may depend on repositories and on other use cases, never on the UI.</p>
<p>A use case earns its place when it holds real logic: it combines several repositories, applies a rule that two screens share, or keeps a ViewModel short. A use case that only forwards one call to a repository adds a file, a binding and a test, and nothing else. Skip it and call the repository. Google’s guide marks the whole domain layer optional.</p>
<p>Below, one use case joins the news list with the topics the user follows, and two screens share it. Follow a topic and both update. Then try the pass-through one.</p>`,
        code: `class GetPersonalizedFeedUseCase @Inject constructor(
    private val news: NewsRepository,
    private val userData: UserDataRepository,
) {
    operator fun invoke(): Flow<List<Article>> =
        combine(news.observeNews(), userData.observeFollowedTopics()) { articles, topics ->
            articles
                .filter { it.topic in topics }
                .sortedByDescending { it.publishedAt }
        }
}

@HiltViewModel
class ForYouViewModel @Inject constructor(
    getFeed: GetPersonalizedFeedUseCase,
) : ViewModel() {
    val feed: StateFlow<List<Article>> = getFeed()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

// A second screen reuses the rule instead of copying it
@HiltViewModel
class TopStoriesViewModel @Inject constructor(
    getFeed: GetPersonalizedFeedUseCase,
) : ViewModel() {
    val top: StateFlow<List<Article>> = getFeed()
        .map { it.take(2) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

// Ceremony: forwards one call and adds nothing. Call the repository instead.
class GetArticleUseCase @Inject constructor(private val news: NewsRepository) {
    suspend operator fun invoke(id: Int): Article = news.article(id)
}`,
        remember: 'A use case holds logic worth sharing. If it only forwards a call, delete it.',
        terms: [
          { term: 'Interactor', def: 'Another name for a use case: a domain-layer class that runs one piece of business logic.' },
          { term: 'Pass-through use case', def: 'A use case whose invoke only forwards to one repository function and adds no logic of its own.' },
          { term: 'zip', def: 'A Flow operator that pairs the nth value of one flow with the nth value of another, so it waits until both emit again.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the use case callable like a function and re-run it whenever either source changes.', code: 'class GetPersonalizedFeedUseCase @Inject constructor(\n    private val news: NewsRepository,\n    private val userData: UserDataRepository,\n) {\n    [[operator]] fun [[invoke]](): Flow<List<Article>> =\n        [[combine]](news.observeNews(), userData.observeFollowedTopics()) { articles, topics ->\n            articles.filter { it.topic in topics }\n        }\n}', why: '<code>operator fun invoke</code> lets callers write <code>getFeed()</code>. <code>combine</code> emits again with the latest of both flows whenever either one changes.' },
          { type: 'bug', prompt: 'Following a new topic doesn’t change the feed until a new article arrives. Tap the line.', code: 'class GetPersonalizedFeedUseCase @Inject constructor(\n    private val news: NewsRepository,\n    private val userData: UserDataRepository,\n) {\n    operator fun invoke(): Flow<List<Article>> =\n        news.observeNews().zip(userData.observeFollowedTopics()) { articles, topics ->\n            articles.filter { it.topic in topics }\n        }\n}', bug: 5, fix: '        combine(news.observeNews(), userData.observeFollowedTopics()) { articles, topics ->', why: '<code>zip</code> pairs emissions one to one, so a new topics value waits for the next news value. <code>combine</code> re-runs with the latest of both as soon as either emits.' },
        ],
        quiz: [
          { q: 'Which use case is worth its own class?', options: ['<code>invoke(id) = repo.article(id)</code>', 'One that combines news with followed topics and is used by two screens'], a: 1, why: 'It holds a real rule and removes duplicate code. The other only adds a hop.' },
          { q: 'What does <code>operator fun invoke</code> give you?', options: ['Callers can write <code>getFeed()</code> instead of <code>getFeed.execute()</code>', 'It runs the use case on a background thread', 'It lets Hilt inject the class'], a: 0, why: 'It is a calling convention. Threading comes from suspend functions and Flow; injection comes from <code>@Inject</code>.' },
          { q: 'May a use case depend on another use case?', options: ['Yes, and on repositories, but never on the UI layer', 'No, only on repositories'], a: 0, why: 'Use cases can build on each other. Like everything in the domain layer, they never point up at the UI.' },
        ],
        visual(el) {
          const extra = [{ t: 'Coroutines deep dive', topic: 'Kotlin' }, { t: 'Cup final tonight', topic: 'Sports' }, { t: 'Material 3 update', topic: 'Compose' }];
          let articles = [
            { id: 1, t: 'Compose 1.9 notes', topic: 'Compose', at: 5 },
            { id: 2, t: 'Derby tonight', topic: 'Sports', at: 4 },
            { id: 3, t: 'Kotlin 2.2 tips', topic: 'Kotlin', at: 3 },
            { id: 4, t: 'Room 2.8 notes', topic: 'Android', at: 2 },
          ];
          let topics = ['Kotlin', 'Compose'], busy = false, x = 0, seq = 5;
          const feed = () => articles.filter(a => topics.includes(a.topic)).sort((a, b) => b.at - a.at);
          const fyList = h('div', { class: 'arc-mini' }), topList = h('div', { class: 'arc-mini' });
          const newsList = h('div', { class: 'arc-mini' }), topicRow = h('div', { class: 'arc-tags' });
          const N = {
            fy: node('ForYouViewModel', '<code>getFeed()</code>', fyList),
            top: node('TopStoriesViewModel', '<code>getFeed().map { it.take(2) }</code>', topList),
            uc: node('GetPersonalizedFeedUseCase', 'combine(news, topics) → filter → sort'),
            pass: node('GetArticleUseCase', '<code>invoke(id) = news.article(id)</code>', h('span', { class: 'arc-scope' }, 'pass-through')),
            news: node('NewsRepository', '<code>observeNews()</code>', newsList),
            user: node('UserDataRepository', '<code>observeFollowedTopics()</code>', topicRow),
          };
          const all = Object.values(N);
          const o = out();
          const paintNews = fresh => newsList.replaceChildren(...articles.slice().sort((a, b) => b.at - a.at).slice(0, 4)
            .map(a => h('span', { class: a.id === fresh ? 'arc-new drop-in' : null }, `${a.t} · ${a.topic}`)));
          const paintTopics = fresh => topicRow.replaceChildren(...(topics.length ? topics.map(t => h('span', { class: 'arc-tag' + (t === fresh ? ' pop' : '') }, t)) : [h('span', { class: 'arc-tag' }, 'none')]));
          const rows = (list, hot) => (list.length ? list.map(a => h('span', { class: hot ? 'arc-new drop-in' : null }, a.t)) : [h('span', {}, '(nothing matches)')]);
          const paintFeeds = hot => { const f = feed(); fyList.replaceChildren(...rows(f, hot)); topList.replaceChildren(...rows(f.slice(0, 2), hot)); };
          const dim = () => all.forEach(n => { n.classList.remove('on', 'ask', 'bad', 'ok'); n.box.replaceChildren(); });
          async function step(pairs, back, ms = 540) {
            dim();
            pairs.forEach(([n, t]) => { n.classList.add('on'); tok(n, t, back ? 'arc-back' : ''); });
            await sleep(ms);
            return el.isConnected;
          }
          const landed = () => { dim(); [N.fy, N.top].forEach(n => n.classList.add('ok')); paintFeeds(true); };
          async function collect() {
            if (busy) return; busy = true;
            say(o, '<span class="muted">both ViewModels start collecting getFeed()…</span>');
            if (!await step([[N.fy, 'getFeed()'], [N.top, 'getFeed()']])) return;
            if (!await step([[N.uc, 'invoke()']])) return;
            if (!await step([[N.news, 'observeNews()'], [N.user, 'observeFollowedTopics()']])) return;
            if (!await step([[N.news, `${articles.length} articles`], [N.user, `[${topics.join(', ')}]`]], true)) return;
            if (!await step([[N.uc, `combine → ${feed().length} match`]], true, 640)) return;
            landed();
            say(o, `<span class="good">one rule, two screens:</span> ${feed().length} of ${articles.length} articles match your topics. Neither ViewModel contains the filter.`);
            busy = false;
          }
          const followBtn = cmd('userData.follow("Sports")', toggleSports);
          async function toggleSports() {
            if (busy) return; busy = true;
            const was = topics.includes('Sports');
            topics = was ? topics.filter(t => t !== 'Sports') : [...topics, 'Sports'];
            followBtn.innerHTML = hl(was ? 'userData.follow("Sports")' : 'userData.unfollow("Sports")');
            dim(); N.user.classList.add('on'); paintTopics('Sports'); tok(N.user, `emits [${topics.join(', ')}]`, 'arc-back');
            await sleep(650); if (!el.isConnected) return;
            if (!await step([[N.uc, `combine re-runs → ${feed().length}`]], true, 640)) return;
            landed();
            say(o, `<span class="good">${was ? 'unfollowed' : 'followed'} Sports:</span> the topics Flow emitted, combine re-ran with the latest news, and both screens updated. Nobody called getFeed() again.`);
            busy = false;
          }
          async function publish() {
            if (busy) return; busy = true;
            const e = extra[x++ % extra.length];
            const a = { id: seq, t: e.t, topic: e.topic, at: seq * 10 }; seq++;
            articles = [a, ...articles].slice(0, 8);
            dim(); N.news.classList.add('on'); paintNews(a.id); tok(N.news, 'emits', 'arc-back');
            await sleep(650); if (!el.isConnected) return;
            const hit = topics.includes(a.topic);
            if (!await step([[N.uc, hit ? `combine → ${feed().length}` : `filtered out: ${a.topic}`]], true, 640)) return;
            if (hit) landed(); else { dim(); N.uc.classList.add('ask'); paintFeeds(false); }
            say(o, hit
              ? `<span class="good">new ${a.topic} story:</span> it reached both screens, sorted to the top.`
              : `<span class="muted">new ${a.topic} story:</span> combine re-ran, but you don’t follow ${a.topic}, so the screens didn’t change. Follow Sports and it shows up.`);
            busy = false;
          }
          async function getArticle() {
            if (busy) return; busy = true;
            if (!await step([[N.fy, 'getArticle(3)']])) return;
            if (!await step([[N.pass, 'invoke(3)']])) return;
            if (!await step([[N.news, 'article(3)']])) return;
            if (!await step([[N.pass, 'Article(3)']], true)) return;
            dim(); N.pass.classList.add('ask'); N.fy.classList.add('ok'); tok(N.fy, 'Article(3)', 'arc-back');
            say(o, '<span class="bad">ceremony:</span> GetArticleUseCase handed the call straight down and the result straight up. It added a class, a test and a hop, and no logic. Call <b>news.article(3)</b> from the ViewModel until real logic shows up.');
            busy = false;
          }
          paintNews(); paintTopics(); paintFeeds(false);
          say(o, 'Both screens show the feed for Kotlin and Compose. Follow Sports, publish a story, or collect again.');
          el.append(
            h('div', { class: 'controls arc-fit' },
              cmd('getFeed().collect { … }', collect),
              followBtn,
              cmd('news.publish()', publish),
              cmd('getArticle(3)', getArticle)),
            h('div', { class: 'arc-layers' },
              band('UI layer: two screens', N.fy, N.top),
              h('div', { class: 'arc-dir' }, '↓ invoke()'),
              band('Domain layer: use cases', N.uc, N.pass),
              h('div', { class: 'arc-dir' }, '↓ depends on'),
              band('Data layer', N.news, N.user)),
            o);
        },
      },

      // ui-state-patterns ──────────────────────────────
      {
        id: 'ui-state-patterns',
        title: 'Loading, error and empty states',
        tagline: 'Draw every look the screen can have, and show messages once.',
        level: 'intermediate',
        body: `
<p>A screen that loads data has at least four looks: loading, content, empty and error. You can model them two ways. A <b>sealed</b> <code>UiState</code> has one subtype per look, so a mix like “loading and error at once” can’t exist, and <code>when</code> makes you draw every case. A <b>data class with flags</b> keeps <code>isLoading</code>, <code>items</code> and <code>errorMessage</code> side by side, so a reload can keep the old list on screen.</p>
<p>Many apps mix the two: a sealed type for the first load, flags once there is content. Either way, give an empty list its own look. A blank screen looks broken; “No stories yet” does not.</p>
<p>Snackbars are <b>one-off events</b>. Android’s guide recommends keeping the message in UiState and having the UI report when it has shown it. The ViewModel then clears it, so a rotation doesn’t show it twice. Try both switches below.</p>`,
        code: `// Option 1: a sealed type. One look at a time.
sealed interface FeedUiState {
    data object Loading : FeedUiState
    data object Empty : FeedUiState
    data class Success(val items: List<Article>) : FeedUiState
    data class Error(val message: String) : FeedUiState
}

// Option 2: one data class with flags. Content can stay during a reload.
data class NewsUiState(
    val isLoading: Boolean = false,
    val items: List<Article> = emptyList(),
    val errorMessage: String? = null,
    val userMessage: String? = null,   // snackbar text, cleared once shown
) {
    val isEmpty: Boolean get() = !isLoading && errorMessage == null && items.isEmpty()
}

// ViewModel
fun delete(article: Article) = viewModelScope.launch {
    repository.delete(article)
    _uiState.update { it.copy(userMessage = "Article deleted") }
}

fun userMessageShown() = _uiState.update { it.copy(userMessage = null) }

// Screen
val snackbarHostState = remember { SnackbarHostState() }
state.userMessage?.let { message ->
    LaunchedEffect(message) {
        snackbarHostState.showSnackbar(message)
        viewModel.userMessageShown()
    }
}`,
        remember: 'Draw loading, content, empty and error. Keep snackbar text in state and clear it once shown.',
        terms: [
          { term: 'Empty state', def: 'The look a screen shows when loading worked but there is nothing to list, such as a short message and an action.' },
          { term: 'One-off event', def: 'Something the UI should react to once, like a snackbar or a navigation, which still has to survive rotation.' },
          { term: 'Impossible state', def: 'A combination of fields that should never happen together, such as isLoading = true with an old error still set.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the message once, then tell the ViewModel so it clears it.', code: 'state.userMessage?.let { message ->\n    [[LaunchedEffect]](message) {\n        snackbarHostState.[[showSnackbar]](message)\n        viewModel.[[userMessageShown]]()\n    }\n}', why: 'The effect restarts when the message changes. <code>showSnackbar</code> suspends until the snackbar is gone, and then the ViewModel sets <code>userMessage</code> back to null.' },
          { type: 'bug', prompt: 'After a failed load, tapping Retry shows the spinner and the old error at the same time. Tap the line.', code: 'fun retry() = viewModelScope.launch {\n    _uiState.update { it.copy(isLoading = true) }\n    try {\n        val items = repository.latest()\n        _uiState.update { it.copy(isLoading = false, items = items, errorMessage = null) }\n    } catch (e: IOException) {\n        _uiState.update { it.copy(isLoading = false, errorMessage = "No connection") }\n    }\n}', bug: 1, fix: '    _uiState.update { it.copy(isLoading = true, errorMessage = null) }', why: 'With flags, every update has to reset the fields that no longer apply. A sealed <code>Loading</code> state would make this mix impossible.' },
        ],
        quiz: [
          { q: 'Pull-to-refresh should keep the list visible while it reloads. Which model makes that easy?', options: ['A sealed type where <code>Loading</code> replaces <code>Success</code>', 'A data class with <code>isLoading</code> next to <code>items</code>'], a: 1, why: 'Flags can hold the old items and a loading flag at once. A single sealed value can only be one of them.' },
          { q: 'Why give an empty list its own look?', options: ['So the screen says “No stories yet” instead of looking broken', 'Because <code>emptyList()</code> can’t be collected'], a: 0, why: 'Empty is a real result. Users need to see that loading worked and there is nothing there.' },
          { q: 'A delete shows a snackbar. Where should its text live?', options: ['In UiState, cleared when the UI calls <code>userMessageShown()</code>', 'In a <code>var</code> inside the Composable', 'In a Boolean <code>showSnackbar</code> that is never reset'], a: 0, why: 'State survives rotation and the acknowledgement clears it, so it shows once. A flag that is never reset shows again after every rotation.' },
        ],
        visual(el) {
          const pool = ['Compose tips', 'Kotlin 2.2 notes', 'Room 2.8 notes', 'Hilt in 5 minutes', 'Paging 3 basics'];
          let sealed = false, consume = true, busy = false, snack = null, round = 0;
          const fresh = () => pool.slice(round % 2, (round % 2) + 3);
          let st = { kind: 'Success', isLoading: false, items: fresh(), error: null, msg: null };
          const phone = h('div', { class: 'phone arc-top arc-rel', 'aria-label': 'Screen preview' });
          const slot = h('div', { class: 'arc-stateslot' });
          const line = h('div', { class: 'kt' });
          const o = out();
          const card = (changed = [], anim = false) => sealed
            ? stateCard(`FeedUiState.${st.kind}`,
              st.kind === 'Success' ? [['items', `[${st.items.length} articles]`], ['userMessage', quote(st.msg)]]
                : st.kind === 'Error' ? [['message', quote(st.error)]] : ['data object'], changed, anim)
            : stateCard('NewsUiState', [['isLoading', String(st.isLoading)], ['items', `[${st.items.length} articles]`], ['errorMessage', quote(st.error)], ['userMessage', quote(st.msg)]], changed, anim);
          const setState = (next, changed) => { st = { ...st, ...next }; swapIn(slot, card(changed, true)); };
          const vmLine = src => { line.innerHTML = hl(src); replay(line, 'pop-soft'); };
          function paintPhone(drop = false) {
            const kids = [];
            const has = st.items.length > 0;
            const loadingFull = sealed ? st.kind === 'Loading' : st.isLoading && !has;
            const errorFull = sealed ? st.kind === 'Error' : !!st.error && !has && !st.isLoading;
            const empty = sealed ? st.kind === 'Empty' : !st.isLoading && !st.error && !has;
            const list = sealed ? st.kind === 'Success' : has;
            if (!sealed && st.isLoading && has) kids.push(h('div', { class: 'arc-refresh' }));
            if (!sealed && st.error && has) kids.push(h('div', { class: 'arc-banner drop-in' }, `${st.error}. Showing saved stories.`));
            if (loadingFull) kids.push(h('div', { class: 'arc-center' }, h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')));
            else if (errorFull) kids.push(h('div', { class: 'arc-center' }, h('div', { class: 'err-icon' }, '!'), h('p', { class: 'phone-note' }, st.error), h('span', { class: 'arc-retry' }, 'Retry')));
            else if (empty) kids.push(h('div', { class: 'arc-center' }, h('p', { class: 'phone-note' }, h('b', {}, 'No stories yet')), h('p', { class: 'phone-note' }, 'Follow a topic to fill your feed.')));
            if (list) kids.push(...st.items.map(t => h('div', { class: 'item arc-small' + (drop ? ' drop-in' : '') }, t)));
            if (snack) kids.push(h('div', { class: 'arc-snack drop-in' }, h('span', {}, snack), h('b', {}, 'UNDO')));
            phone.replaceChildren(...kids);
          }
          async function load(result) {
            if (busy) return; busy = true;
            snack = null;
            const had = sealed ? st.kind === 'Success' && st.items.length : st.items.length;
            if (sealed) { setState({ kind: 'Loading', isLoading: true, msg: null }, []); vmLine('_uiState.value = FeedUiState.Loading'); }
            else { setState({ isLoading: true }, ['isLoading']); vmLine('_uiState.update { it.copy(isLoading = true) }'); }
            paintPhone();
            say(o, sealed
              ? (had ? '<span class="bad">Loading replaced Success:</span> the list vanished while it reloads.' : '<span class="muted">FeedUiState.Loading: one look, a spinner.</span>')
              : (had ? '<span class="good">isLoading = true sits next to items:</span> the list stays, with a progress bar on top.' : '<span class="muted">isLoading = true and no items yet: a full spinner.</span>'));
            await sleep(1100); if (!el.isConnected) return;
            if (result === 'ok') {
              round++;
              const items = fresh();
              if (sealed) { setState({ kind: 'Success', isLoading: false, items, error: null }, ['items']); vmLine('_uiState.value = FeedUiState.Success(items)'); }
              else { setState({ isLoading: false, items, error: null }, ['isLoading', 'items', 'errorMessage']); vmLine('_uiState.update { it.copy(isLoading = false, items = items, errorMessage = null) }'); }
              paintPhone(true);
              say(o, `<span class="good">content:</span> ${st.items.length} stories.`);
            } else if (result === 'empty') {
              if (sealed) { setState({ kind: 'Empty', isLoading: false, items: [], error: null }, []); vmLine('_uiState.value = FeedUiState.Empty'); }
              else { setState({ isLoading: false, items: [], error: null }, ['isLoading', 'items', 'errorMessage']); vmLine('_uiState.update { it.copy(isLoading = false, items = emptyList()) }'); }
              paintPhone();
              say(o, '<span class="good">empty:</span> loading worked and there is nothing to show, so the screen says so instead of going blank.');
            } else {
              if (sealed) { setState({ kind: 'Error', isLoading: false, items: [], error: 'No connection' }, ['message']); vmLine('_uiState.value = FeedUiState.Error("No connection")'); }
              else { setState({ isLoading: false, error: 'No connection' }, ['isLoading', 'errorMessage']); vmLine('_uiState.update { it.copy(isLoading = false, errorMessage = "No connection") }'); }
              paintPhone();
              say(o, sealed
                ? '<span class="bad">Error:</span> a full error screen with Retry. Any stories you had are gone from this state.'
                : (st.items.length ? '<span class="good">error with content:</span> the old stories stay and a banner explains. Flags can hold both.' : '<span class="bad">error:</span> nothing saved, so a full error screen with Retry.'));
            }
            busy = false;
          }
          async function del() {
            if (busy) return;
            const can = (sealed ? st.kind === 'Success' : true) && st.items.length > 1;
            if (!can) { replay(phone, 'shake'); say(o, '<span class="muted">Load a list with stories first.</span>'); return; }
            busy = true;
            setState({ items: st.items.slice(1), msg: 'Article deleted' }, ['items', 'userMessage']);
            vmLine('_uiState.update { it.copy(userMessage = "Article deleted") }');
            snack = st.msg; paintPhone();
            say(o, '<span class="muted">LaunchedEffect(message) → snackbarHostState.showSnackbar("Article deleted")…</span>');
            await sleep(1700); if (!el.isConnected) return;
            snack = null; paintPhone();
            if (consume) {
              setState({ msg: null }, ['userMessage']);
              vmLine('fun userMessageShown() = _uiState.update { it.copy(userMessage = null) }');
              say(o, '<span class="good">shown once:</span> the snackbar finished, the UI called userMessageShown(), and the message left the state. Now rotate.');
            } else {
              vmLine('// userMessageShown() never called');
              say(o, '<span class="bad">still in state:</span> the snackbar is gone from the screen, but userMessage = "Article deleted" is still set. Now rotate.');
            }
            busy = false;
          }
          async function rotate() {
            if (busy) return; busy = true;
            snack = null; replay(phone, 'flip');
            await sleep(420); if (!el.isConnected) return;
            paintPhone();
            say(o, '<span class="muted">Activity recreated. The new screen collects the same UiState from the ViewModel…</span>');
            await sleep(500); if (!el.isConnected) return;
            if (st.msg) {
              snack = st.msg; paintPhone();
              say(o, '<span class="bad">shown again:</span> userMessage was never cleared, so LaunchedEffect ran on the new screen and the snackbar came back. Turn the switch on.');
              await sleep(1600); if (!el.isConnected) return;
              snack = null; paintPhone();
            } else {
              say(o, '<span class="good">no repeat:</span> the screen came back from the same UiState, and there is no message left to show.');
            }
            busy = false;
          }
          const swSealed = switchEl('arc-uis-sealed', 'Model as sealed FeedUiState', false, i => {
            if (busy) { i.checked = sealed; return; }
            sealed = i.checked; snack = null;
            st = { kind: 'Success', isLoading: false, items: fresh(), error: null, msg: null };
            slot.replaceChildren(card([], true)); paintPhone(true);
            vmLine(sealed ? 'sealed interface FeedUiState' : 'data class NewsUiState(…)');
            say(o, sealed ? 'Sealed: one look at a time. Load again with stories on screen and watch the list.' : 'Flags: fields sit side by side. Load again and the list stays.');
          });
          const swConsume = switchEl('arc-uis-consume', 'Call userMessageShown()', true, i => {
            if (busy) { i.checked = consume; return; }
            consume = i.checked;
            say(o, consume ? 'The UI reports when the snackbar is done, and the ViewModel clears it.' : 'Nobody clears the message now. Delete a story, then rotate.');
          });
          slot.append(card()); paintPhone();
          vmLine('data class NewsUiState(…)');
          say(o, 'Three stories on screen. Load, delete or rotate, and flip the switches to compare.');
          el.append(
            h('div', { class: 'controls arc-fit' },
              cmd('load() → items', () => load('ok')),
              cmd('load() → empty', () => load('empty')),
              cmd('load() → IOException', () => load('err')),
              cmd('delete(first)', del),
              cmd('rotate()', rotate)),
            h('div', { class: 'controls arc-fit' }, swSealed, swConsume),
            h('div', { class: 'arc-udf' }, phone, h('div', { class: 'arc-col' }, h('div', { class: 'arc-cap' }, 'last ViewModel line'), line, h('div', { class: 'arc-cap' }, 'current state'), slot)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'ssot',
        title: 'Repository as source of truth',
        tagline: 'The UI reads the database. The network writes to it.',
        body: `
<p>An offline-first repository picks one place as the <b>single source of truth</b>: the local Room database. The UI observes a <code>Flow</code> from the database and nothing else.</p>
<p>The network has one job: refresh the database. When new data arrives, the repository writes it to Room. Room notices the change and its Flow emits the new rows, which reach the screen. The network response never goes straight to the UI.</p>
<p>So when the network fails, the screen still has everything that was saved. Switch the network off below and refresh, then reopen the app.</p>`,
        code: `class OfflineFirstNewsRepository @Inject constructor(
    private val dao: ArticleDao,
    private val api: NewsApi,
) : NewsRepository {

    // The UI only ever reads from the database
    override fun observeNews(): Flow<List<Article>> =
        dao.observeAll().map { rows -> rows.map { it.toArticle() } }

    // The network only ever writes to the database
    override suspend fun refresh(): Boolean = try {
        val fresh = api.getLatest()
        dao.upsertAll(fresh.map { it.toEntity() })
        true
    } catch (e: IOException) {
        false   // offline: the cached rows stay on screen
    }
}

// In the ViewModel
val uiState: StateFlow<NewsUiState> = repository.observeNews()
    .map { NewsUiState(items = it) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NewsUiState())`,
        remember: 'UI ← database ← network. The network writes to the database, never to the screen.',
        level: 'advanced',
        terms: [
          { term: 'Single source of truth', def: 'The one place that owns a piece of data; everything else reads from it and sends changes through it.' },
          { term: 'Offline-first', def: 'A design where the app reads from local storage first and uses the network only to refresh it.' },
          { term: 'Repository', def: 'A data-layer class that hides where data comes from and gives the rest of the app one API for it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the database the source of truth: the UI reads from it, the network writes to it.', code: 'override fun observeNews(): Flow<List<Article>> =\n    [[dao]].observeAll().map { rows -> rows.map { it.toArticle() } }\n\noverride suspend fun refresh() {\n    val fresh = api.getLatest()\n    dao.[[upsertAll|insertAll]](fresh.map { it.toEntity() })\n}', why: 'The screen observes Room. A refresh only writes rows, and Room’s Flow carries them to the screen.' },
          { type: 'bug', prompt: 'Offline, this screen goes blank, and refreshes never show up. Tap the wrong line.', code: 'class OfflineFirstNewsRepository @Inject constructor(\n    private val dao: ArticleDao,\n    private val api: NewsApi,\n) : NewsRepository {\n    override fun observeNews(): Flow<List<Article>> =\n        flow { emit(api.getLatest().map { it.toArticle() }) }\n\n    override suspend fun refresh() {\n        dao.upsertAll(api.getLatest().map { it.toEntity() })\n    }\n}', bug: 5, fix: '        dao.observeAll().map { rows -> rows.map { it.toArticle() } }', why: 'The UI reads straight from the network, so the database is skipped. Observe the DAO instead, and the saved rows show even with no connection.' },
        ],
        quiz: [
          { q: 'In an offline-first repository, where does the screen get its list?', options: ['From the network response', 'From the database Flow', 'From whichever answers first'], a: 1, why: 'The database is the single source of truth. The screen observes it.' },
          { q: '<code>refresh()</code> fails with an <code>IOException</code>. What does the screen show?', options: ['An empty list', 'The rows already in Room, plus an offline note', 'It crashes'], a: 1, why: 'The failure stops the write. Room still holds the old rows and its Flow keeps them on screen.' },
          { q: 'New articles arrive from the API. How do they reach the screen?', options: ['The repository writes them to Room, and the Flow emits', 'The repository passes them to the ViewModel directly'], a: 0, why: 'Writing to the database is the only path. The observing Flow does the rest.' },
        ],
        visual(el) {
          const titles = ['Room 2.8 notes', 'Hilt in 5 minutes', 'KSP is the default', 'StateFlow vs LiveData', 'Navigation 3 guide', 'Baseline profiles', 'Paging 3 basics'];
          let server = 3, db = 2, shown = 2, online = true, offlineNote = false, busy = false;
          const sList = h('div', { class: 'arc-mini' }), dList = h('div', { class: 'arc-mini' });
          const S = node('Server · NewsApi', 'remote', sList);
          const D = node('Room · articles', 'single source of truth', dList);
          const R = node('Repository', '<code>observeNews()</code> = <code>dao.observeAll()</code>');
          const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Screen preview' });
          const o = out();
          const rows = (n, newFrom) => titles.slice(0, n).map((t, i) => h('span', { class: i >= newFrom ? 'arc-new drop-in' : null }, t));
          const paint = (newServer = 99, newDb = 99) => {
            sList.replaceChildren(...rows(server, newServer));
            dList.replaceChildren(...rows(db, newDb));
          };
          const paintPhone = (newFrom = 99, cold) => {
            const kids = [];
            if (!online && offlineNote) kids.push(h('div', { class: 'arc-banner drop-in' }, 'Offline. Showing saved news.'));
            if (cold) kids.push(h('div', { class: 'spinner' }));
            else kids.push(...titles.slice(0, shown).map((t, i) => h('div', { class: 'item arc-small' + (i >= newFrom ? ' drop-in' : '') }, t)));
            phone.replaceChildren(...kids);
          };
          const nodes = [S, D, R];
          async function refresh() {
            if (busy) return; busy = true;
            clearAll(nodes);
            R.classList.add('on'); tok(R, 'refresh()');
            await sleep(450); if (!el.isConnected) return;
            S.classList.add('on'); tok(S, 'GET /latest');
            await sleep(600); if (!el.isConnected) return;
            if (!online) {
              S.classList.replace('on', 'bad'); tok(S, 'IOException', 'boom'); replay(S, 'shake');
              await sleep(500); if (!el.isConnected) return;
              tok(R, 'catch → false', 'boom');
              offlineNote = true; paintPhone(); replay(phone, 'pop-soft');
              say(o, `<span class="bad">offline:</span> nothing was written, so Room didn’t change. The screen still shows its ${shown} saved stories.`);
              busy = false; return;
            }
            tok(S, `200 OK · ${server} items`, 'arc-back');
            await sleep(500); if (!el.isConnected) return;
            const before = db;
            S.classList.remove('on'); D.classList.add('on'); tok(D, `upsertAll(${server})`);
            db = server; paint(99, before); replay(D, 'pop-soft');
            await sleep(650); if (!el.isConnected) return;
            D.classList.remove('on'); tok(R, `Flow emits ${db} rows`, 'arc-back');
            await sleep(500); if (!el.isConnected) return;
            const prev = shown; shown = db; offlineNote = false; paintPhone(prev); replay(phone, 'pop-soft');
            say(o, db > before
              ? `<span class="good">ok:</span> the network wrote ${db - before} new row${db - before > 1 ? 's' : ''} to Room. Room’s Flow emitted, and that is what the screen drew.`
              : `<span class="good">ok:</span> nothing new, but the write still made Room’s Flow emit the same ${db} rows.`);
            busy = false;
          }
          function publish() {
            if (busy) return;
            if (server >= titles.length) { replay(S, 'shake'); say(o, 'The server is out of stories. Refresh, or press Reset.'); return; }
            server++; paint(server - 1); replay(S, 'pop-soft');
            say(o, `The server has ${server - db} stor${server - db > 1 ? 'ies' : 'y'} the app hasn’t seen yet. The screen doesn’t know until a refresh writes it to Room.`);
          }
          async function reopen() {
            if (busy) return; busy = true;
            clearAll(nodes); S.classList.toggle('bad', !online);
            paintPhone(99, true);
            say(o, '<span class="muted">app process killed, opening again…</span>');
            await sleep(700); if (!el.isConnected) return;
            D.classList.add('on'); tok(D, `SELECT · ${db} rows`, 'arc-back');
            await sleep(450); if (!el.isConnected) return;
            tok(R, `Flow emits ${db} rows`, 'arc-back');
            shown = db; paintPhone(0); replay(phone, 'pop-soft');
            say(o, `<span class="good">cold start:</span> the ${db} stories came off disk. No network call${online ? ' was needed' : ', and the network is off'}.`);
            busy = false;
          }
          const sw = switchEl('arc-online', 'Network on', true, i => {
            online = i.checked; S.classList.toggle('bad', !online);
            if (online) offlineNote = false;
            paintPhone();
            say(o, online ? 'Network back on. Refresh to catch up.' : 'Network off. Try a refresh: the screen keeps its data.');
          });
          paint(); paintPhone();
          say(o, 'The screen shows the 2 stories in Room. The server already has a third. Refresh to pull it in.');
          el.append(
            h('div', { class: 'controls arc-fit' }, cmd('repository.refresh()', refresh), cmd('server.publish()', publish), cmd('reopenApp()', reopen), sw),
            h('div', { class: 'arc-flow' }, S, h('span', { class: 'arrow' }, '→'), D, h('span', { class: 'arrow' }, '→'), R, h('span', { class: 'arrow' }, '→'), phone),
            h('p', { class: 'tip' }, 'There is no arrow from the server to the screen. Every update goes through the database.'),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'room',
        title: 'Room basics',
        tagline: 'A table, a DAO, and queries that keep watching.',
        body: `
<p>Room is a layer over SQLite. You describe a table with an <code>@Entity</code> data class, write queries in a <code>@Dao</code> interface, and list both in a <code>@Database</code> class. KSP generates the code that runs the SQL, and it checks your queries at compile time.</p>
<p>Write operations are <code>suspend</code> functions, so they run off the main thread. Queries can return a <code>Flow</code>. A Flow query doesn’t run once and stop: Room re-runs it every time its table changes and emits the new result.</p>
<p>Change the table below and watch both observers react on their own.</p>`,
        code: `@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: Int,
    val title: String,
    val read: Boolean = false,
)

@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles ORDER BY id")
    fun observeAll(): Flow<List<ArticleEntity>>

    @Query("SELECT COUNT(*) FROM articles WHERE read = 0")
    fun observeUnreadCount(): Flow<Int>

    @Insert suspend fun insert(article: ArticleEntity)
    @Update suspend fun update(article: ArticleEntity)
    @Delete suspend fun delete(article: ArticleEntity)
}

@Database(entities = [ArticleEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}

// build.gradle.kts
// ksp(libs.androidx.room.compiler)`,
        remember: '@Entity is the table, @Dao the queries, @Database ties them up. A Flow query re-emits on every change.',
        level: 'intermediate',
        terms: [
          { term: '@Entity', def: 'A Room annotation that turns a data class into a database table.' },
          { term: '@Dao', def: 'A Room annotation for an interface whose functions are the queries and writes for your tables.' },
          { term: '@Database', def: 'A Room annotation on an abstract RoomDatabase class that lists the entities and exposes the DAOs.' },
          { term: '@Upsert', def: 'A Room DAO annotation that inserts a row, or updates it if a row with the same primary key exists.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the table, its key, and a query that keeps emitting.', code: '@[[Entity]](tableName = "articles")\ndata class ArticleEntity(\n    @[[PrimaryKey]] val id: Int,\n    val title: String,\n)\n\n@Dao\ninterface ArticleDao {\n    @Query("SELECT * FROM articles")\n    fun observeAll(): [[Flow]]<List<ArticleEntity>>\n}', why: '<code>@Entity</code> makes the table, <code>@PrimaryKey</code> marks its key, and a <code>Flow</code> return type makes Room re-run the query on every change.' },
          { type: 'bug', prompt: 'Calling one of these from a button click crashes the app. Tap the line.', code: '@Dao\ninterface ArticleDao {\n    @Query("SELECT * FROM articles ORDER BY id")\n    fun observeAll(): Flow<List<ArticleEntity>>\n\n    @Insert\n    fun insert(article: ArticleEntity)\n\n    @Delete\n    suspend fun delete(article: ArticleEntity)\n}', bug: 6, fix: '    suspend fun insert(article: ArticleEntity)', why: 'A blocking DAO call on the main thread throws <code>IllegalStateException</code>. Mark writes <code>suspend</code> and Room runs them off the main thread.' },
        ],
        quiz: [
          { q: 'You collect <code>dao.observeAll()</code>, then insert a row. What happens?', options: ['Nothing until you call <code>observeAll()</code> again', 'The Flow re-runs the query and emits the new list'], a: 1, why: 'Room tracks which tables a query reads and re-runs it after any write to them.' },
          { q: 'Which annotation turns a data class into a table?', options: ['<code>@Dao</code>', '<code>@Entity</code>', '<code>@Database</code>'], a: 1, why: '<code>@Entity</code> describes a table. <code>@Dao</code> holds queries; <code>@Database</code> lists entities and DAOs.' },
          { q: 'A plain <code>@Insert</code> gets an id that already exists. What happens?', options: ['The row is replaced', 'It throws <code>SQLiteConstraintException</code>', 'It is skipped silently'], a: 1, why: 'The default conflict strategy is ABORT. Use <code>@Upsert</code> or <code>onConflict</code> to change that.' },
        ],
        visual(el) {
          const pool = ['Hilt', 'Retrofit', 'Paging', 'DataStore', 'WorkManager', 'Compose', 'Coil'];
          let rows = [{ id: 1, title: 'Room', read: false }, { id: 2, title: 'Flow', read: true }, { id: 3, title: 'KSP', read: false }];
          let nextId = 4, p = 0, busy = false, nAll = 1, nCount = 1;
          const body = h('div');
          const table = h('div', { class: 'arc-table' }, h('div', { class: 'arc-tname' }, 'table: articles'),
            h('div', { class: 'arc-tr arc-th' }, h('span', {}, 'id'), h('span', {}, 'title'), h('span', {}, 'read')), body);
          const allList = h('div', { class: 'arc-mini' });
          const allBadge = h('span', { class: 'arc-badge' });
          const cnt = h('span', { class: 'chip total' });
          const cntBadge = h('span', { class: 'arc-badge' });
          const obsAll = node('observeAll()', '<code>.collect { list -> … }</code>', allBadge, allList);
          const obsCnt = node('observeUnreadCount()', '<code>.collect { n -> … }</code>', cntBadge, cnt);
          const o = out();
          const rowEl = new Map();
          function paintTable(mark = {}) {
            rowEl.clear();
            body.replaceChildren(...(rows.length ? rows.map(r => {
              const e = h('div', { class: 'arc-tr' + (mark[r.id] ? ' ' + mark[r.id] : '') }, h('span', {}, String(r.id)), h('span', {}, `"${r.title}"`), h('span', {}, r.read ? '1' : '0'));
              rowEl.set(r.id, e); return e;
            }) : [h('div', { class: 'arc-empty' }, 'No rows. Insert one.')]));
          }
          function paintObs(hot) {
            allList.replaceChildren(...(rows.length ? rows.map(r => h('span', {}, `${r.read ? '✓' : '•'} ${r.title}`)) : [h('span', {}, '(empty list)')]));
            const unread = rows.filter(r => !r.read).length;
            const same = cnt.textContent === String(unread);
            cnt.textContent = String(unread);
            allBadge.textContent = `emission #${nAll}`; cntBadge.textContent = `emission #${nCount}${hot && same ? ' · same value' : ''}`;
            allBadge.classList.toggle('hot', !!hot); cntBadge.classList.toggle('hot', !!hot);
            if (hot) { replay(obsAll, 'pop'); replay(obsCnt, 'pop'); }
          }
          async function write(sql, change, mark) {
            if (busy) return; busy = true;
            say(o, hl(sql));
            change();
            paintTable(mark);
            const e = mark && rowEl.get(+Object.keys(mark)[0]);
            if (e) replay(e, 'drop-in');
            await sleep(450); if (!el.isConnected) return;
            table.classList.add('inval'); replay(table, 'pop-soft');
            o.append(h('div', { class: 'line drop-in', html: hl('// Room: table "articles" changed, re-running 2 queries') }));
            await sleep(450); if (!el.isConnected) return;
            nAll++; nCount++; paintObs(true);
            await sleep(500); if (!el.isConnected) return;
            table.classList.remove('inval'); paintTable();
            busy = false;
          }
          const insert = () => {
            const t = pool[p++ % pool.length], id = nextId++;
            write(`dao.insert(ArticleEntity(${id}, "${t}"))`, () => rows.push({ id, title: t, read: false }), { [id]: 'added' });
          };
          const markRead = () => {
            if (busy) return;
            const r = rows.find(x => !x.read);
            if (!r) { replay(table, 'shake'); say(o, '<span class="muted">Every row is already read. Insert one first.</span>'); return; }
            write(`dao.update(article${r.id}.copy(read = true))`, () => { r.read = true; }, { [r.id]: 'changed' });
          };
          const del = async () => {
            if (busy) return;
            const r = rows[rows.length - 1];
            if (!r) { replay(table, 'shake'); say(o, '<span class="muted">The table is empty. Insert a row first.</span>'); return; }
            busy = true;
            const e = rowEl.get(r.id); e.classList.add('leave');
            await sleep(420); if (!el.isConnected) return;
            busy = false;
            write(`dao.delete(article${r.id})`, () => { rows = rows.filter(x => x !== r); });
          };
          const dup = () => {
            if (busy) return;
            const r = rows[0];
            if (!r) { replay(table, 'shake'); say(o, '<span class="muted">The table is empty, so there is no id to clash with.</span>'); return; }
            paintTable({ [r.id]: 'bad' }); replay(rowEl.get(r.id), 'shake');
            say(o, `<span class="bad">SQLiteConstraintException:</span> UNIQUE constraint failed: articles.id <span class="muted">// nothing was written, so nothing emits</span>`);
          };
          paintTable(); paintObs(false);
          say(o, 'Both observers are collecting. Change the table and watch them re-emit.');
          el.append(
            h('div', { class: 'arc-db' }, table, h('div', { class: 'arc-col' }, obsAll, obsCnt)),
            h('div', { class: 'controls arc-fit' },
              cmd('dao.insert(…)', insert),
              cmd('dao.update(it.copy(read = true))', markRead),
              cmd('dao.delete(last)', del),
              cmd('dao.insert(ArticleEntity(1, "Dup"))', dup)),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'net',
        title: 'Retrofit and kotlinx.serialization',
        tagline: 'JSON in, a Kotlin object out, failures as values.',
        body: `
<p>Retrofit turns an interface into HTTP calls. Mark a function <code>suspend</code>, annotate it with <code>@GET</code> and the path, and Retrofit runs the request off the main thread and returns the parsed body.</p>
<p>kotlinx.serialization does the parsing. Mark the data class <code>@Serializable</code> and each JSON key fills the property with the same name. <code>@SerialName</code> handles keys like <code>published_at</code>. With <code>ignoreUnknownKeys = true</code>, extra fields from the server don’t break your app.</p>
<p>Calls fail. A 4xx or 5xx response throws <code>HttpException</code>. No connection throws an <code>IOException</code>. JSON that doesn’t match your class throws a <code>SerializationException</code>. Catch them in the repository and return a <code>Result</code>, so the ViewModel gets a value instead of a crash.</p>`,
        code: `@Serializable
data class ArticleDto(
    val id: Int,
    val title: String,
    @SerialName("published_at") val publishedAt: String,
)

interface NewsApi {
    @GET("articles/{id}")
    suspend fun getArticle(@Path("id") id: Int): ArticleDto
}

private val json = Json { ignoreUnknownKeys = true }

val api: NewsApi = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(NewsApi::class.java)

suspend fun loadArticle(id: Int): Result<ArticleDto> = try {
    Result.success(api.getArticle(id))
} catch (e: HttpException) {           // 404, 500, …
    Result.failure(e)
} catch (e: IOException) {             // offline, timeout
    Result.failure(e)
} catch (e: SerializationException) {  // JSON doesn't match
    Result.failure(e)
}`,
        remember: 'suspend fun in an interface, @Serializable on the class, and every failure caught and returned as a value.',
        level: 'intermediate',
        terms: [
          { term: 'Retrofit', def: 'A library that turns an annotated Kotlin interface into HTTP calls.' },
          { term: '@Serializable', def: 'A kotlinx.serialization annotation that generates the code to turn a class into JSON and back.' },
          { term: '@SerialName', def: 'A kotlinx.serialization annotation that maps a property to a JSON key with a different name.' },
          { term: 'HttpException', def: 'The exception Retrofit throws when a call returns a non-2xx status code.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Skip unknown JSON keys and declare a GET call that runs off the main thread.', code: 'private val json = Json { [[ignoreUnknownKeys]] = true }\n\ninterface NewsApi {\n    @[[GET]]("articles/{id}")\n    [[suspend]] fun getArticle(@Path("id") id: Int): ArticleDto\n}', why: '<code>ignoreUnknownKeys</code> stops extra server fields from throwing. A <code>suspend</code> Retrofit function runs the request off the main thread.' },
          { type: 'bug', prompt: 'Every response fails with <code>MissingFieldException</code> for <code>publishedAt</code>. Tap the wrong line.', code: '@Serializable\ndata class ArticleDto(\n    val id: Int,\n    val title: String,\n    @SerializedName("published_at") val publishedAt: String,\n)', bug: 4, fix: '    @SerialName("published_at") val publishedAt: String,', why: '<code>@SerializedName</code> is Gson’s annotation. kotlinx.serialization ignores it and looks for a <code>publishedAt</code> key, which the JSON doesn’t have.' },
        ],
        quiz: [
          { q: '<code>suspend fun getArticle(id: Int): ArticleDto</code> gets a 404. What happens?', options: ['It returns null', 'It throws <code>HttpException</code>', 'It returns an empty ArticleDto'], a: 1, why: 'When the return type is the body, Retrofit throws for any non-2xx response. Return <code>Response&lt;ArticleDto&gt;</code> if you want to inspect the code yourself.' },
          { q: 'The JSON has a <code>"views"</code> key your class doesn’t declare. With <code>ignoreUnknownKeys = true</code>:', options: ['The key is skipped', 'Parsing throws'], a: 0, why: 'Without that setting, an unknown key throws a <code>SerializationException</code>.' },
          { q: 'How do you map <code>"published_at"</code> to <code>publishedAt</code>?', options: ['<code>@SerialName("published_at")</code>', '<code>@Json(name = "published_at")</code>', 'Rename the property to <code>published_at</code>'], a: 0, why: '<code>@SerialName</code> is the kotlinx.serialization annotation. <code>@Json</code> belongs to Moshi.' },
        ],
        visual(el) {
          const ok = [['{', null], ['  "id": 42,', ['id', '42']], ['  "title": "Room with KSP",', ['title', '"Room with KSP"']], ['  "published_at": "2026-10-01",', ['publishedAt', '"2026-10-01"']], ['  "views": 1280', 'ign'], ['}', null]];
          const missing = [['{', null], ['  "id": 42,', ['id', '42']], ['  "published_at": "2026-10-01"', ['publishedAt', '"2026-10-01"']], ['}', null]];
          let busy = false;
          const app = h('div', { class: 'arc-end' }, 'App');
          const server = h('div', { class: 'arc-end' }, 'api.example.com');
          const wire = h('div', { class: 'arc-wire' });
          const jsonBox = h('div', { class: 'arc-json' });
          const objSlot = h('div', { class: 'arc-objslot' });
          const req = h('div', { class: 'kt' });
          const o = out();
          const packet = async (text, cls, to) => {
            wire.querySelectorAll('.arc-packet').forEach(p => p.remove());
            const p = h('span', { class: `arc-packet ${cls}${to === 'back' ? ' far' : ''}` }, text);
            wire.append(p); void p.offsetWidth;
            p.classList.remove('far');
            if (to === 'far') p.classList.add('far');
            else if (to === 'mid') p.classList.add('mid');
            await sleep(900);
            return el.isConnected;
          };
          const showObj = (fields, anim) => {
            const card = h('div', { class: 'obj' + (anim ? ' drop-in' : '') }, h('span', { class: 'obj-name' }, 'ArticleDto'));
            fields.forEach(([k, v]) => card.append(h('span', { class: 'field' }, `${k} = ${v}`)));
            objSlot.replaceChildren(card);
            return card;
          };
          const reset = () => { [app, server].forEach(x => x.classList.remove('bad')); jsonBox.replaceChildren(); objSlot.replaceChildren(h('span', { class: 'tip' }, 'waiting for a response')); };
          async function run(kind) {
            if (busy) return; busy = true;
            reset();
            req.innerHTML = hl('api.getArticle(42)') + '  <span class="muted">→ GET /articles/42</span>';
            say(o, '<span class="muted">request sent…</span>');
            if (kind === 'offline') {
              if (!await packet('GET /articles/42', '', 'mid')) return;
              const p = wire.querySelector('.arc-packet'); p.classList.add('errp'); replay(p, 'shake'); app.classList.add('bad');
              objSlot.replaceChildren(h('span', { class: 'build-fail' }, 'no object'));
              say(o, `<span class="bad">UnknownHostException</span> <span class="muted">is an IOException →</span> ${hl('Result.failure(e)')} <span class="muted">→ UiState.Error("No connection")</span>`);
              busy = false; return;
            }
            if (!await packet('GET /articles/42', '', 'far')) return;
            replay(server, 'pop');
            const status = kind === 'notfound' ? '404 Not Found' : '200 OK';
            if (!await packet(status, kind === 'notfound' ? 'errp' : 'okp', 'back')) return;
            const lines = kind === 'notfound' ? [['{ "error": "not found" }', null]] : kind === 'missing' ? missing : ok;
            const rowsEls = lines.map(([t]) => h('div', { class: 'branch', html: hl(t) }));
            for (const r of rowsEls) { jsonBox.append(r); replay(r, 'drop-in'); await sleep(120); }
            if (!el.isConnected) return;
            if (kind === 'notfound') {
              server.classList.add('bad');
              objSlot.replaceChildren(h('span', { class: 'build-fail' }, 'no object'));
              say(o, `<span class="bad">HttpException: HTTP 404</span> <span class="muted">Retrofit throws for any non-2xx →</span> ${hl('Result.failure(e)')}`);
              busy = false; return;
            }
            const card = showObj([], true);
            for (let i = 0; i < lines.length; i++) {
              const m = lines[i][1]; if (!m) continue;
              rowsEls[i].classList.add('scan'); await sleep(380); if (!el.isConnected) return;
              rowsEls[i].classList.remove('scan');
              if (m === 'ign') { rowsEls[i].classList.add('ign'); continue; }
              rowsEls[i].classList.add('hit');
              card.append(h('span', { class: 'field changed drop-in' }, `${m[0]} = ${m[1]}`));
            }
            if (kind === 'missing') {
              card.classList.add('shake'); card.style.borderColor = 'var(--err)';
              say(o, `<span class="bad">MissingFieldException:</span> Field 'title' is required for type ArticleDto, but it was missing. <span class="muted">A SerializationException: catch it too, or the app crashes.</span>`);
            } else {
              say(o, `${hl('Result.success(ArticleDto(id=42, title="Room with KSP", publishedAt="2026-10-01"))')} <span class="muted">// "views" was ignored</span>`);
            }
            busy = false;
          }
          // Open on a finished successful call.
          req.innerHTML = hl('api.getArticle(42)') + '  <span class="muted">→ GET /articles/42</span>';
          ok.forEach(([t, m]) => jsonBox.append(h('div', { class: 'branch' + (m === 'ign' ? ' ign' : m ? ' hit' : ''), html: hl(t) })));
          showObj(ok.filter(x => Array.isArray(x[1])).map(x => x[1]));
          wire.append(h('span', { class: 'arc-packet okp' }, '200 OK'));
          say(o, `${hl('Result.success(ArticleDto(id=42, …))')} <span class="muted">Replay it, or try a failure.</span>`);
          el.append(
            h('div', { class: 'controls arc-fit' },
              cmd('200 OK', () => run('ok')),
              cmd('404 Not Found', () => run('notfound')),
              cmd('no network', () => run('offline')),
              cmd('JSON without "title"', () => run('missing'))),
            req,
            h('div', { class: 'arc-wire-row' }, app, wire, server),
            h('div', { class: 'arc-map' },
              h('div', {}, h('div', { class: 'arc-cap' }, 'response body (JSON)'), jsonBox),
              h('div', {}, h('div', { class: 'arc-cap' }, 'Kotlin object'), objSlot)),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'hilt',
        title: 'Dependency injection with Hilt',
        tagline: 'Ask for a ViewModel. Hilt builds everything under it.',
        body: `
<p>A class shouldn’t build its own dependencies. It asks for them in its constructor, and something else hands them over. That something is Hilt.</p>
<p>Put <code>@Inject</code> on a constructor and Hilt knows how to build that class. For types you can’t annotate, like Retrofit or a Room database, write a <code>@Module</code> with <code>@Provides</code> functions. Use <code>@Binds</code> to say which implementation fills an interface. Hilt checks the whole graph at compile time, so a missing piece is a build error, not a crash.</p>
<p>Scopes decide how many instances exist. <code>@Singleton</code> means one for the whole app. A <code>@HiltViewModel</code> lives as long as its screen and survives rotation. Ask for a ViewModel below and watch the graph build bottom-up.</p>`,
        code: `@HiltAndroidApp
class NewsApp : Application()

@AndroidEntryPoint
class MainActivity : ComponentActivity()

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel()

@Singleton
class OfflineFirstNewsRepository @Inject constructor(
    private val api: NewsApi,
    private val dao: ArticleDao,
) : NewsRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindNews(impl: OfflineFirstNewsRepository): NewsRepository
}

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides @Singleton
    fun provideOkHttp(): OkHttpClient = OkHttpClient.Builder().build()

    @Provides @Singleton
    fun provideApi(client: OkHttpClient): NewsApi = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(client)
        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(NewsApi::class.java)

    @Provides @Singleton
    fun provideDb(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "news.db").build()

    @Provides @Singleton
    fun provideDao(db: AppDatabase): ArticleDao = db.articleDao()
}

// In a Composable
val viewModel: NewsViewModel = hiltViewModel()`,
        remember: '@Inject constructor says how to build it; @Provides and @Binds fill the gaps; the scope says how many exist.',
        level: 'intermediate',
        terms: [
          { term: '@Inject', def: 'An annotation on a constructor that tells Hilt how to build the class and what it needs.' },
          { term: '@Provides', def: 'A Hilt module function that builds an object Hilt can’t construct itself, like Retrofit or a Room database.' },
          { term: '@Binds', def: 'An abstract Hilt module function that tells Hilt which implementation to use for an interface.' },
          { term: '@InstallIn', def: 'A Hilt annotation that puts a module in a component, such as SingletonComponent, which sets where its bindings are available.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Hilt build the repository and use it wherever <code>NewsRepository</code> is asked for.', code: 'class OfflineFirstNewsRepository @[[Inject]] constructor(\n    private val api: NewsApi,\n    private val dao: ArticleDao,\n) : NewsRepository { /* ... */ }\n\n@Module\n@[[InstallIn]](SingletonComponent::class)\nabstract class RepositoryModule {\n    @[[Binds]]\n    abstract fun bindNews(impl: OfflineFirstNewsRepository): NewsRepository\n}', why: '<code>@Inject</code> says how to build the class, <code>@InstallIn</code> places the module, and <code>@Binds</code> maps the interface to the implementation.' },
          { type: 'bug', prompt: 'The build fails with “Context cannot be provided without an @Provides-annotated method”. Tap the line.', code: '@Module\n@InstallIn(SingletonComponent::class)\nobject AppModule {\n    @Provides @Singleton\n    fun provideDb(context: Context): AppDatabase =\n        Room.databaseBuilder(context, AppDatabase::class.java, "news.db").build()\n}', bug: 4, fix: '    fun provideDb(@ApplicationContext context: Context): AppDatabase =', why: 'Hilt doesn’t bind a plain <code>Context</code>. Ask for <code>@ApplicationContext</code> so a singleton database never holds an Activity.' },
        ],
        quiz: [
          { q: 'What does <code>@Inject constructor(...)</code> tell Hilt?', options: ['How to build this class, and what it needs', 'To keep one instance for the whole app', 'To build it lazily on a background thread'], a: 0, why: 'It marks the constructor Hilt calls. Scope is a separate annotation like <code>@Singleton</code>.' },
          { q: 'When do you reach for <code>@Binds</code>?', options: ['To build a third-party object like Retrofit', 'To tell Hilt which implementation to use for an interface'], a: 1, why: '<code>@Binds</code> maps an interface to an implementation Hilt can already build. <code>@Provides</code> runs your code to build an object.' },
          { q: 'Two screens each get their own <code>NewsViewModel</code>. <code>NewsRepository</code> is <code>@Singleton</code>. How many repositories exist?', options: ['1', '2'], a: 0, why: 'Each screen gets a new ViewModel, but both receive the same singleton repository.' },
        ],
        visual(el) {
          const G = {
            vm: { name: 'NewsViewModel', how: '@HiltViewModel @Inject constructor', deps: ['repo'], scope: () => 'per screen' },
            repo: { name: 'NewsRepository', how: '@Binds → OfflineFirstNewsRepository', deps: ['api', 'dao'], scope: () => (single ? '@Singleton' : 'unscoped') },
            api: { name: 'NewsApi', how: '@Provides provideApi(client)', deps: ['ok'], scope: () => '@Singleton' },
            dao: { name: 'ArticleDao', how: '@Provides provideDao(db)', deps: ['db'], scope: () => '@Singleton' },
            ok: { name: 'OkHttpClient', how: '@Provides provideOkHttp()', deps: [], scope: () => '@Singleton' },
            db: { name: 'AppDatabase', how: '@Provides provideDb(context)', deps: [], scope: () => '@Singleton' },
          };
          let single = true, noApi = false, busy = false, screenNo = 0, current = null;
          for (const [k, n] of Object.entries(G)) {
            n.badge = h('span', { class: 'arc-scope' });
            n.el = node(n.name, `<code>${n.how}</code>`, n.badge);
            n.key = k;
          }
          const nodes = Object.values(G).map(n => n.el);
          const paintBadges = () => Object.values(G).forEach(n => { const s = n.scope(); n.badge.textContent = s; n.badge.className = 'arc-scope' + (s === '@Singleton' ? ' single' : ''); });
          const screens = h('div', { class: 'arc-screens' });
          const o = out();
          const isScoped = n => n.scope() === '@Singleton';
          const put = (n, id, reused) => { n.el.box.replaceChildren(h('span', { class: `chip ${reused ? 'arc-reused pop' : 'drop-in'}` }, reused ? `${id} reused` : `${id} new`)); };
          async function resolve(k, made, animate) {
            const n = G[k];
            if (animate) { n.el.classList.add('ask'); await sleep(260); if (!el.isConnected) throw 0; }
            if (k === 'api' && noApi) throw 'missing';
            if (isScoped(n) && n.inst) {
              if (animate) { n.el.classList.replace('ask', 'ok'); put(n, n.inst, true); await sleep(260); }
              made.reused.push(n.name); return n.inst;
            }
            for (const d of n.deps) await resolve(d, made, animate);
            n.inst = addr();
            if (animate) { n.el.classList.remove('ask'); n.el.classList.add('on'); put(n, n.inst, false); await sleep(380); if (!el.isConnected) throw 0; }
            made.created.push(n.name);
            return n.inst;
          }
          const paintInst = () => Object.values(G).forEach(n => { if (n.inst) n.el.box.replaceChildren(h('span', { class: 'chip arc-old' }, n.inst)); });
          async function request(animate = true) {
            if (busy) return; busy = true;
            clearAll(nodes); paintInst();
            const made = { created: [], reused: [] };
            if (animate) say(o, hl('hiltViewModel<NewsViewModel>()') + ' <span class="muted">resolving what it needs…</span>');
            try { await resolve('vm', made, animate); } catch (e) {
              if (e !== 'missing') return;
              G.api.el.classList.replace('ask', 'bad'); replay(G.api.el, 'shake');
              say(o, '<span class="bad">error: [Dagger/MissingBinding]</span> NewsApi cannot be provided without an @Provides-annotated method. <span class="muted">The build fails. The app never runs with a hole in its graph.</span>');
              busy = false; return;
            }
            screenNo++;
            current = h('span', { class: 'arc-screen drop-in' }, `screen ${screenNo}: VM${G.vm.inst} · repo${G.repo.inst}`);
            screens.append(current);
            if (animate) say(o, `<span class="good">built bottom-up:</span> ${made.created.join(', ')}. ${made.reused.length ? `<span class="muted">Reused:</span> ${made.reused.join(', ')}.` : ''}`);
            busy = false;
          }
          function rotate() {
            if (busy) return;
            if (!current) { say(o, '<span class="muted">No screen is open yet. Ask for a ViewModel first.</span>'); return; }
            clearAll(nodes); paintInst();
            G.vm.el.classList.add('ok'); put(G.vm, G.vm.inst, true);
            replay(current, 'flip');
            say(o, `<span class="good">rotated:</span> the Activity was recreated, but ${hl(`NewsViewModel${G.vm.inst}`)} survived. Nothing in the graph was built again.`);
          }
          const swSingle = switchEl('arc-singleton', '@Singleton on the repository', true, i => {
            if (busy) { i.checked = single; return; }
            single = i.checked; paintBadges();
            say(o, single ? 'One repository for the whole app again.' : 'Unscoped: every ViewModel will get its own repository, and its own cache.');
          });
          const swApi = switchEl('arc-noapi', 'Delete provideApi()', false, i => {
            if (busy) { i.checked = noApi; return; }
            noApi = i.checked; clearAll(nodes); paintInst();
            G.api.el.classList.toggle('bad', noApi);
            say(o, noApi ? 'NewsApi has no binding now. Try building a ViewModel.' : 'provideApi() is back.');
          });
          paintBadges();
          // Open with screen 1 already built so every node shows an instance.
          request(false).then(() => {
            Object.values(G).forEach(n => put(n, n.inst, false));
            say(o, 'Screen 1 is open. Open a second screen to see which instances are new and which are shared.');
          });
          const row = (...ks) => h('div', { class: 'arc-row' }, ks.map(k => G[k].el));
          const up = () => h('div', { class: 'arc-dir' }, '↑ injected into');
          el.append(
            h('div', { class: 'controls arc-fit' }, cmd('hiltViewModel<NewsViewModel>()', () => request()), cmd('rotate()', rotate)),
            h('div', { class: 'controls arc-fit' }, swSingle, swApi),
            h('div', { class: 'arc-graph' }, row('vm'), up(), row('repo'), up(), row('api', 'dao'), up(), row('ok', 'db')),
            screens, o);
        },
      },

      // modularization-arch ────────────────────────────
      {
        id: 'modularization-arch',
        title: 'Modularizing by feature and layer',
        tagline: 'Features talk through small api modules, and only :app sees everything.',
        level: 'advanced',
        body: `
<p>Layers split code by job. Feature modules split it by screen or flow, so one team can change Bookmarks without touching News. Split each feature in two. <code>:feature:news:api</code> is the small public surface: route classes and maybe an interface. <code>:feature:news:impl</code> holds the screens, ViewModels and DI wiring, and only <code>:app</code> depends on it.</p>
<p>The rules: an impl module may depend on api modules and on core modules, never on another impl module. Api modules depend on almost nothing. <code>:app</code> depends on every impl and builds the navigation graph from each feature’s entry point. So Bookmarks opens an article by navigating to <code>ArticleRoute</code> from news:api, without knowing which screen draws it.</p>
<p>This lesson is about where the lines go. The Build track’s Modularization lesson covers the Gradle side: <code>api</code> vs <code>implementation</code>, convention plugins and build speed. Below, open an article across features, then see what a change recompiles.</p>`,
        code: `// :feature:news:api, the only part other features see
@Serializable data class ArticleRoute(val id: Int)

fun NavController.navigateToArticle(id: Int) = navigate(ArticleRoute(id))

// :feature:news:impl, screens stay internal to the feature
fun NavGraphBuilder.newsSection() {
    composable<ArticleRoute> { entry ->
        ArticleScreen(id = entry.toRoute<ArticleRoute>().id)
    }
}

// :feature:bookmarks:impl, knows news:api only
fun NavGraphBuilder.bookmarksSection(onOpenArticle: (Int) -> Unit) {
    composable<BookmarksRoute> {
        BookmarksScreen(onOpenArticle = onOpenArticle)
    }
}

// :app, the one place that sees every impl and wires them up
NavHost(navController, startDestination = BookmarksRoute) {
    bookmarksSection(onOpenArticle = navController::navigateToArticle)
    newsSection()
}

// feature/bookmarks/impl/build.gradle.kts
dependencies {
    implementation(projects.feature.bookmarks.api)
    implementation(projects.feature.news.api)   // never news.impl
    implementation(projects.core.data)
    implementation(projects.core.ui)
}`,
        remember: 'Impl depends on api, never on another impl. Only :app sees every impl and wires the navigation.',
        terms: [
          { term: 'Feature module', def: 'A Gradle module that holds one screen or user flow, such as news or bookmarks, separate from other features.' },
          { term: 'API module', def: 'The small public half of a feature, with routes and interfaces that other features may depend on.' },
          { term: 'Impl module', def: 'The private half of a feature, with its screens, ViewModels and DI bindings, which only the app module depends on.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Depend on the news contract only, and register the article destination in news:impl.', code: '// feature/bookmarks/impl/build.gradle.kts\ndependencies {\n    implementation(projects.feature.news.[[api]])\n    implementation(projects.core.data)\n}\n\n// :feature:news:impl\nfun NavGraphBuilder.newsSection() {\n    composable<[[ArticleRoute]]> { entry ->\n        ArticleScreen(id = entry.[[toRoute]]<ArticleRoute>().id)\n    }\n}', why: 'Bookmarks only needs the route from news:api. News registers the screen for that route with <code>composable&lt;ArticleRoute&gt;</code> and reads the arguments back with <code>toRoute()</code>.' },
          { type: 'bug', prompt: 'Every change to a public class in the news screens now recompiles Bookmarks, and the two teams keep breaking each other. Tap the line.', code: '// feature/bookmarks/impl/build.gradle.kts\nplugins {\n    id("news.android.feature")\n}\n\ndependencies {\n    implementation(projects.feature.bookmarks.api)\n    implementation(projects.feature.news.impl)\n    implementation(projects.core.data)\n    implementation(projects.core.ui)\n}', bug: 7, fix: '    implementation(projects.feature.news.api)', why: 'An impl module that depends on another impl sees all of its public classes and recompiles with them. Depend on the small api module and let <code>:app</code> connect the two.' },
        ],
        quiz: [
          { q: '<code>:feature:bookmarks:impl</code> needs to open an article. What should it depend on?', options: ['<code>:feature:news:impl</code>', '<code>:feature:news:api</code>', '<code>:app</code>'], a: 1, why: 'The api module has the route. The screen behind it stays private to news:impl.' },
          { q: 'Who builds the NavHost that connects every feature?', options: ['<code>:app</code>, which depends on every impl module', 'Each feature builds its own NavHost and they find each other at run time', '<code>:core:ui</code>'], a: 0, why: 'Only <code>:app</code> sees every impl, so it calls each feature’s <code>NavGraphBuilder</code> extension and passes callbacks between them.' },
          { q: 'What belongs in an api module?', options: ['Routes and small interfaces other features use', 'The screens and ViewModels', 'The Room database'], a: 0, why: 'Keep it small and stable. Everything that changes often lives in impl, where only the feature and <code>:app</code> recompile.' },
        ],
        visual(el) {
          const M = {
            app: { name: ':app', short: 'app', deps: ['newsImpl', 'bmImpl'], role: 'wires everything' },
            newsImpl: { name: ':feature:news:impl', short: 'news:impl', deps: ['newsApi', 'data', 'ui'], role: 'screens + DI' },
            bmImpl: { name: ':feature:bookmarks:impl', short: 'bookmarks:impl', deps: ['bmApi', 'newsApi', 'data', 'ui'], role: 'screens + DI' },
            newsApi: { name: ':feature:news:api', short: 'news:api', deps: [], role: 'ArticleRoute' },
            bmApi: { name: ':feature:bookmarks:api', short: 'bookmarks:api', deps: [], role: 'BookmarksRoute' },
            data: { name: ':core:data', short: 'core:data', deps: [], role: 'shared' },
            ui: { name: ':core:ui', short: 'core:ui', deps: [], role: 'shared' },
          };
          let bad = false, busy = false;
          const deps = k => M[k].deps.concat(bad && k === 'bmImpl' ? ['newsImpl'] : []);
          for (const m of Object.values(M)) {
            m.depsEl = h('small');
            m.badge = h('span', { class: 'arc-scope' });
            m.el = node(m.name, null, m.depsEl, m.badge);
          }
          const nodes = Object.values(M).map(m => m.el);
          const screens = h('div', { class: 'arc-screens' });
          const o = out();
          const paintDeps = () => Object.entries(M).forEach(([k, m]) => {
            const ds = deps(k);
            m.depsEl.innerHTML = ds.length ? '→ ' + ds.map(d => `<span class="${bad && k === 'bmImpl' && d === 'newsImpl' ? 'arc-baddep' : ''}">${M[d].short}</span>`).join(', ') : 'depends on nothing';
          });
          const badge = (m, text, cls = '') => { m.badge.textContent = text; m.badge.className = 'arc-scope' + (cls ? ' ' + cls : ''); };
          const reset = () => {
            clearAll(nodes);
            Object.values(M).forEach(m => badge(m, m.role));
            if (bad) [M.bmImpl, M.newsImpl].forEach(m => m.el.classList.add('bad'));
          };
          const showScreens = (names) => screens.replaceChildren(...names.map((n, i) => h('span', { class: 'arc-screen drop-in' + (i === names.length - 1 ? ' arc-now' : '') }, n)));
          async function openArticle() {
            if (busy) return; busy = true;
            reset(); showScreens(['BookmarksScreen']);
            const path = bad
              ? [[M.bmImpl, 'ArticleScreen(7)'], [M.newsImpl, 'called directly']]
              : [[M.bmImpl, 'onOpenArticle(7)'], [M.app, 'navigateToArticle(7)'], [M.newsApi, 'ArticleRoute(7)'], [M.newsImpl, 'composable<ArticleRoute>']];
            say(o, '<span class="muted">tap on a bookmark…</span>');
            for (const [m, t] of path) {
              nodes.forEach(n => { n.classList.remove('on'); n.box.replaceChildren(); });
              m.el.classList.add('on'); tok(m.el, t);
              await sleep(650); if (!el.isConnected) return;
            }
            showScreens(['BookmarksScreen', 'ArticleScreen(id = 7)']);
            say(o, bad
              ? '<span class="bad">works, but coupled:</span> Bookmarks built the news screen itself. It now compiles against every public class in news:impl, and the two features can’t be built or tested apart.'
              : '<span class="good">opened across features:</span> Bookmarks only knew ArticleRoute from news:api. :app passed navigateToArticle in, and news:impl drew the screen.');
            busy = false;
          }
          const dependents = k => Object.keys(M).filter(x => deps(x).includes(k));
          async function change(k) {
            if (busy) return; busy = true;
            reset(); screens.replaceChildren();
            const m = M[k];
            m.el.classList.add('on'); badge(m, 'changed', 'single'); replay(m.el, 'pop-soft');
            say(o, `<span class="muted">${k === 'newsApi' ? 'ArticleRoute gets a new field' : 'a public class in news:impl changes'}…</span>`);
            await sleep(600); if (!el.isConnected) return;
            const hit = dependents(k);
            for (const d of hit) {
              M[d].el.classList.add('ask'); badge(M[d], 'recompiles', 'arc-hot'); replay(M[d].el, 'pop');
              await sleep(380); if (!el.isConnected) return;
            }
            if (!hit.includes('app') && k !== 'app') badge(M.app, 'repackages');
            Object.keys(M).filter(x => x !== k && x !== 'app' && !hit.includes(x)).forEach(x => { M[x].el.classList.add('ok'); badge(M[x], 'up to date', 'arc-fine'); });
            const names = hit.map(d => M[d].short).join(', ');
            say(o, k === 'newsApi'
              ? `<span class="muted">contract change:</span> ${names} recompile, because both features use the route. Keep api modules small and change them rarely.`
              : bad
                ? `<span class="bad">${names} recompile:</span> Bookmarks depends on news:impl directly, so News’ internals now break and rebuild Bookmarks.`
                : `<span class="good">only ${names} recompiles</span> beyond news:impl itself. Bookmarks never noticed.`);
            busy = false;
          }
          const sw = switchEl('arc-mod-baddep', 'bookmarks:impl → news:impl', false, i => {
            if (busy) { i.checked = bad; return; }
            bad = i.checked; paintDeps(); reset(); screens.replaceChildren();
            if (bad) { replay(M.bmImpl.el, 'shake'); say(o, '<span class="bad">rule broken:</span> an impl module now depends on another impl. Open an article or change news:impl to see the cost.'); }
            else say(o, '<span class="good">rule restored:</span> bookmarks:impl depends on news:api only.');
          });
          paintDeps(); reset(); showScreens(['BookmarksScreen']);
          say(o, 'Bookmarks is on screen. Open an article from it, or change a module and see what recompiles.');
          el.append(
            h('div', { class: 'controls arc-fit' },
              cmd('bookmarks: open article 7', openArticle),
              cmd('edit a public class in news:impl', () => change('newsImpl')),
              cmd('edit ArticleRoute in news:api', () => change('newsApi')),
              sw),
            h('div', { class: 'arc-layers arc-mods' },
              band('App', M.app.el),
              h('div', { class: 'arc-dir' }, '↓ depends on every impl'),
              band('Feature impl', M.newsImpl.el, M.bmImpl.el),
              h('div', { class: 'arc-dir' }, '↓ impl → api, never impl → impl'),
              band('Feature api', M.newsApi.el, M.bmApi.el),
              band('Core', M.data.el, M.ui.el)),
            screens,
            h('p', { class: 'tip' }, 'How Gradle decides what recompiles is in the Build track’s Modularization lesson.'),
            o);
        },
      },

      // clean ──────────────────────────────────────────
      {
        id: 'clean',
        title: 'Clean Architecture in practice',
        tagline: 'Dependencies point inward, and each ring keeps its own model.',
        level: 'advanced',
        body: `
<p>Clean Architecture draws the app as rings. The domain sits in the middle: models like <code>Article</code>, repository interfaces and use cases, in plain Kotlin with no Android or library annotations. Around it sit adapters: repository implementations, ViewModels and mappers. Frameworks like Room, Retrofit and Compose sit outside. The <b>dependency rule</b>: source code only points inward. The domain knows nothing about the rings around it.</p>
<p>The data layer still reaches the domain: it implements the interface the domain declares. Each ring keeps its own model, and mappers convert at the borders. <code>ArticleDto</code> matches the JSON, <code>ArticleEntity</code> the Room table, <code>Article</code> the business, <code>ArticleUi</code> the screen. When the server renames a field, the DTO changes and nothing else does.</p>
<p>That safety costs classes. A small app with one screen and one data source can use one model and skip the domain module. Add rings when the app, the team or the number of data sources grows.</p>`,
        code: `// :core:domain, plain Kotlin: no Room, Retrofit or Compose imports
data class Article(val id: Int, val title: String, val publishedAt: Instant)

interface NewsRepository {
    fun observeNews(): Flow<List<Article>>
}

// :core:data, implements the domain interface
@Serializable
data class ArticleDto(
    val id: Int,
    val title: String,
    @SerialName("published_at") val publishedAt: String,
)

@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: Int,
    val title: String,
    val publishedAtMillis: Long,
)

fun ArticleDto.toEntity() = ArticleEntity(id, title, Instant.parse(publishedAt).toEpochMilli())
fun ArticleEntity.toDomain() = Article(id, title, Instant.ofEpochMilli(publishedAtMillis))

class OfflineFirstNewsRepository @Inject constructor(
    private val dao: ArticleDao,
) : NewsRepository {
    override fun observeNews(): Flow<List<Article>> =
        dao.observeAll().map { rows -> rows.map { it.toDomain() } }
}

// UI layer, shaped for the screen
data class ArticleUi(val id: Int, val title: String, val age: String)

fun Article.toUi(now: Instant): ArticleUi {
    val hours = Duration.between(publishedAt, now).toHours()
    return ArticleUi(id, title, if (hours < 1) "just now" else "$hours h ago")
}`,
        remember: 'Source code points inward. Each ring has its own model, and mappers translate at the borders.',
        terms: [
          { term: 'Clean Architecture', def: 'A way to arrange code in rings, with business rules in the center and frameworks outside, where dependencies only point inward.' },
          { term: 'Dependency rule', def: 'The Clean Architecture rule that inner code never names anything from an outer ring, such as a domain model importing Room.' },
          { term: 'Domain model', def: 'A plain Kotlin class, like Article, that describes business data without any database, network or UI annotations.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Implement the domain interface in the data layer and hand out domain models.', code: 'class OfflineFirstNewsRepository @Inject constructor(\n    private val dao: ArticleDao,\n) : [[NewsRepository]] {\n    override fun observeNews(): Flow<List<Article>> =\n        dao.observeAll().map { rows -> rows.map { it.[[toDomain]]() } }\n}', why: 'The domain declares <code>NewsRepository</code>; the data layer implements it, so the arrow points inward. The mapper turns each Room row into an <code>Article</code>.' },
          { type: 'bug', prompt: 'The domain module stopped compiling as a plain Kotlin module. Tap the line that breaks the dependency rule.', code: '// :core:domain, a plain Kotlin module\npackage com.example.news.domain\n\n@Entity(tableName = "articles")\ndata class Article(\n    val id: Int,\n    val title: String,\n    val publishedAt: Instant,\n)\n\ninterface NewsRepository {\n    fun observeNews(): Flow<List<Article>>\n}', bug: 3, fix: '// remove it: the Room table is ArticleEntity in the data layer', why: 'A Room annotation makes the center depend on a framework in the outer ring. Keep <code>Article</code> plain and let <code>ArticleEntity</code> carry <code>@Entity</code>.' },
        ],
        quiz: [
          { q: 'Which import breaks the dependency rule in the domain module?', options: ['<code>kotlinx.coroutines.flow.Flow</code>', '<code>androidx.room.Entity</code>', '<code>java.time.Instant</code>'], a: 1, why: 'Room is a framework in the outer ring. Flow and Instant are general-purpose types most teams allow in the domain.' },
          { q: 'The API renames <code>"title"</code> to <code>"headline"</code>. With a DTO and mappers, what changes?', options: ['The DTO: <code>@SerialName("headline") val title</code>', 'Every model from the DTO to the UI', 'The domain model and every use case'], a: 0, why: 'The DTO absorbs the JSON shape. Its Kotlin property keeps its name, so the mapper, the domain and the UI don’t change.' },
          { q: 'You are building a one-screen app with one API call. Is the full set of rings worth it?', options: ['Yes, every app needs every ring and mapper', 'Usually not: one model and a repository are enough until the app grows'], a: 1, why: 'Each ring adds models and mappers to maintain. Start small and split when a second data source or team shows up.' },
        ],
        visual(el) {
          const PUB = '2026-10-16T08:00:00Z', MS = Date.UTC(2026, 9, 16, 8, 0, 0);
          let renamed = false, small = false, busy = false;
          const C = {};
          const cl = (label, k) => (C[k] = h('span', { class: 'arc-cl' }, label));
          const inner = h('div', { class: 'arc-ring arc-in' }, h('span', { class: 'arc-ring-name' }, 'Domain · plain Kotlin'),
            h('div', { class: 'arc-cls' }, cl('Article', 'article'), cl('interface NewsRepository', 'iface'), cl('GetLatestNewsUseCase', 'uc')));
          const mid = h('div', { class: 'arc-ring arc-mid' }, h('span', { class: 'arc-ring-name' }, 'Adapters · data and UI'),
            h('div', { class: 'arc-cls' }, cl('ArticleDto', 'dto'), cl('ArticleEntity', 'entity'), cl('toEntity() · toDomain()', 'map1'), cl('OfflineFirstNewsRepository', 'impl'), cl('NewsViewModel', 'vm'), cl('ArticleUi · toUi()', 'ui')), inner);
          const outer = h('div', { class: 'arc-ring arc-out' }, h('span', { class: 'arc-ring-name' }, 'Frameworks'),
            h('div', { class: 'arc-cls' }, cl('Retrofit', 'retrofit'), cl('Room', 'room'), cl('Compose', 'compose')), mid);
          const rings = [outer, mid, inner];
          const S = [
            { k: 'dto', name: 'ArticleDto', cap: 'from JSON', chips: ['retrofit', 'dto'] },
            { k: 'entity', name: 'ArticleEntity', cap: 'Room row', map: '← toEntity()', chips: ['map1', 'entity', 'room'] },
            { k: 'article', name: 'Article', cap: 'domain', map: '← toDomain()', chips: ['map1', 'article', 'impl'] },
            { k: 'ui', name: 'ArticleUi', cap: 'screen', map: '← toUi(now)', chips: ['vm', 'ui', 'compose'] },
          ];
          const fieldsOf = k => ({
            dto: [['id', '42'], renamed ? ['title ← "headline"', '"Room with KSP"'] : ['title', '"Room with KSP"'], ['publishedAt', `"${PUB}"`]],
            entity: [['id', '42'], ['title', '"Room with KSP"'], ['publishedAtMillis', String(MS)]],
            article: [['id', '42'], ['title', '"Room with KSP"'], ['publishedAt', 'Instant(08:00Z)']],
            ui: [['id', '42'], ['title', '"Room with KSP"'], ['age', '"2 h ago"']],
          }[k]);
          const pipe = h('div', { class: 'arc-pipe' });
          for (const s of S) {
            s.slot = h('div', { class: 'arc-stateslot' });
            if (s.map) s.mapEl = h('span', { class: 'arc-mapper' }, s.map);
            s.el = h('div', { class: 'arc-stage' }, h('div', { class: 'arc-cap' }, s.cap), s.mapEl || h('span', { class: 'arc-mapper' }, 'GET /articles/42'), s.slot);
            pipe.append(s.el);
          }
          const rowFull = h('div', { class: 'arc-cost-row on' }, h('span', {}, 'full rings'), h('div', { class: 'meter' }, h('span', { style: 'width:100%' })), h('span', {}, '9 types'));
          const rowSmall = h('div', { class: 'arc-cost-row' }, h('span', {}, 'small app'), h('div', { class: 'meter' }, h('span', { style: 'width:33%' })), h('span', {}, '3 types'));
          const o = out();
          const chipsOff = () => Object.values(C).forEach(c => c.classList.remove('on', 'hot', 'bad'));
          const stagesOff = () => S.forEach(s => { s.el.classList.remove('on', 'hot', 'ok'); if (s.mapEl) s.mapEl.classList.remove('on'); });
          const fill = (s, changed = [], anim = false) => { s.slot.replaceChildren(stateCard(s.name, fieldsOf(s.k), changed, anim)); };
          const live = () => S.filter(s => !small || s.k === 'dto' || s.k === 'ui');
          async function fetchArticle() {
            if (busy) return; busy = true;
            chipsOff(); stagesOff(); rings.forEach(r => r.classList.remove('bad'));
            S.forEach(s => s.slot.replaceChildren());
            say(o, '<span class="muted">GET /articles/42…</span>');
            for (const s of live()) {
              await sleep(380); if (!el.isConnected) return;
              chipsOff(); stagesOff();
              if (s.mapEl && !small) s.mapEl.classList.add('on');
              s.el.classList.add('on'); s.chips.forEach(k => C[k].classList.add('on'));
              fill(s, [], true);
              await sleep(420); if (!el.isConnected) return;
            }
            chipsOff(); stagesOff();
            say(o, small
              ? '<span class="good">small app:</span> the DTO goes straight to a UI model. Two classes, one mapper, no domain module. Plenty for one screen.'
              : '<span class="good">four models, three mappers:</span> each ring got the shape it needs. The domain saw an Instant and nothing about JSON, SQL or Compose.');
            busy = false;
          }
          const renameBtn = cmd('server renames "title" → "headline"', rename);
          async function rename() {
            if (busy) return; busy = true;
            renamed = !renamed;
            renameBtn.innerHTML = hl(renamed ? 'server renames "headline" → "title"' : 'server renames "title" → "headline"');
            chipsOff(); stagesOff(); rings.forEach(r => r.classList.remove('bad'));
            const d = S[0];
            d.el.classList.add('hot'); C.dto.classList.add('hot');
            fill(d, [renamed ? 'title ← "headline"' : 'title'], true);
            await sleep(500); if (!el.isConnected) return;
            for (const s of S.slice(1)) {
              if (!s.slot.firstElementChild) fill(s);
              s.el.classList.add('ok'); replay(s.el, 'pop-soft');
              await sleep(240); if (!el.isConnected) return;
            }
            say(o, renamed
              ? `<span class="good">one line changed:</span> ${hl('@SerialName("headline") val title: String')} in ArticleDto. The mapper, Article, ArticleUi and every use case compile untouched.`
              : '<span class="good">reverted:</span> again only the DTO changed.');
            busy = false;
          }
          function leak() {
            if (busy) return;
            chipsOff(); stagesOff();
            inner.classList.add('bad'); C.article.classList.add('bad'); C.room.classList.add('bad');
            replay(inner, 'shake');
            say(o, `<span class="bad">dependency rule broken:</span> ${hl('import androidx.room.Entity')} in the domain points outward, to a framework. The domain module now needs Room to compile, and every Room upgrade touches your business code.`);
          }
          const sw = switchEl('arc-clean-small', 'Small app: one screen, one API', false, i => {
            if (busy) { i.checked = small; return; }
            small = i.checked;
            rings.forEach(r => r.classList.remove('bad')); chipsOff(); stagesOff();
            S.forEach(s => { const cut = small && (s.k === 'entity' || s.k === 'article'); s.el.classList.toggle('arc-cut', cut); if (s.mapEl) s.mapEl.classList.toggle('arc-cut', cut); });
            S[3].mapEl.textContent = small ? '← dto.toUi()' : '← toUi(now)';
            inner.classList.toggle('arc-cut', small);
            rowFull.classList.toggle('on', !small); rowSmall.classList.toggle('on', small);
            say(o, small
              ? 'Small app: no Room cache, no domain module. ArticleDto maps straight to what the screen needs. Fetch to see the shorter path.'
              : 'Full rings: four models and three mappers. Worth it once there are several sources, screens or teams.');
          });
          S.forEach(s => fill(s));
          say(o, 'Article 42 has already passed through every ring. Fetch it again, rename a server field, or break the rule.');
          el.append(
            h('div', { class: 'controls arc-fit' }, cmd('fetch(42)', fetchArticle), renameBtn, cmd('import androidx.room.Entity // in Article.kt', leak)),
            h('div', { class: 'controls arc-fit' }, sw),
            outer,
            h('div', { class: 'arc-dir' }, 'source dependencies point inward: Frameworks → Adapters → Domain'),
            pipe,
            h('div', { class: 'arc-cost' }, rowFull, rowSmall),
            o);
        },
      },
    ],
  });
})();
