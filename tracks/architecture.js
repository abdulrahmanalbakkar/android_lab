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
.arc-fit, .arc-layers, .arc-udf, .arc-map, .arc-flow, .arc-graph, .arc-screens { min-width: 0; }
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

.arc-table { border: 2px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.arc-tname { font: 600 0.74rem var(--mono); color: var(--muted); padding: 6px 10px; background: var(--sunk); }
.arc-tr { display: grid; grid-template-columns: 3em minmax(0, 1fr) 4.2em; gap: 6px; padding: 7px 10px; border-top: 1px solid var(--line); font: 500 0.84rem var(--mono); align-items: center; }
.arc-tr > span { overflow-wrap: anywhere; }
.arc-tr.arc-th { font-weight: 700; color: var(--muted); border-top: 0; }
.arc-tr.changed { background: var(--warm-soft); }
.arc-tr.added { background: var(--ok-soft); }
.arc-tr.bad { background: var(--err-soft); }

.arc-map { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
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
  .arc-udf, .arc-map { grid-template-columns: minmax(0, 1fr); }
  .arc-udf .phone { justify-self: center; }
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
}
/* depth steps */
.arc-flow > .arc-table { flex: 1 1 210px; }

/* depth pass 2 (arc-d2-) */
.arc-d2-src { flex: 1 1 170px; min-width: 0; display: grid; }
.arc-d2-src > * { grid-area: 1 / 1; }
.arc-node.arc-d2-off { opacity: 0.35; }
.obj.arc-d2-badcard { border-color: var(--err); }
.bar.arc-d2-bar { transition-property: width; transition-timing-function: linear; }
.arc-d2-frames { display: flex; gap: 2px; min-width: 0; }
.arc-d2-frame { flex: 1 1 0; min-width: 0; height: 22px; border-radius: 3px; background: var(--sunk); transition: background 0.15s; }
.arc-d2-drawn { background: var(--ok); }
.arc-d2-work { background: var(--warm); }
.arc-d2-drop { background: var(--warm); outline: 2px solid var(--err); outline-offset: -2px; }
.legend i.arc-d2-key { display: inline-block; height: 12px; }
.arc-d2-strip { display: flex; height: 28px; border-radius: 8px; overflow: hidden; background: var(--sunk); min-width: 0; }
.arc-d2-seg { min-width: 0; display: grid; place-items: center; font: 600 0.68rem var(--mono); white-space: nowrap; overflow: hidden; color: var(--ink); }
.legend i.arc-d2-seg { display: inline-block; height: 12px; }
.arc-d2-old { background: var(--sunk); color: var(--muted); }
.arc-d2-spin { background: var(--warm-soft); color: var(--warm); }
.arc-d2-flash { background: var(--err-soft); color: var(--err); outline: 2px solid var(--err); outline-offset: -2px; }
.arc-d2-content { background: var(--accent-soft); }
.phone .arc-d2-sec { width: 100%; display: grid; gap: 4px; padding: 6px 8px; border-radius: 10px; border: 1px solid var(--line); font-size: 0.74rem; min-width: 0; }
.phone .arc-d2-sec > b { font: 700 0.72rem var(--mono); color: var(--muted); }
.phone .arc-d2-sec.bad { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.phone .arc-d2-sec .arc-mini span { font-size: 0.72rem; padding: 3px 6px; }
.spinner.arc-d2-spin-s { width: 18px; height: 18px; border-width: 3px; }
.arc-screen.arc-d2-hot { border-color: var(--warm); background: var(--warm-soft); color: var(--warm); }
.arc-d2-center { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; min-width: 0; }
.arc-d2-rings { display: grid; gap: 8px; min-width: 0; }
.arc-d2-edges { display: grid; gap: 6px; min-width: 0; }
.arc-d2-edge { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; padding: 6px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); font: 600 0.78rem var(--mono); min-width: 0; }
.arc-d2-edge > span { min-width: 0; overflow-wrap: anywhere; }
.arc-d2-edge .arc-d2-verb { color: var(--muted); font-weight: 500; }
.arc-d2-edge.hot { border-color: var(--warm); background: var(--warm-soft); }
.arc-d2-edge.hot .arc-tag { background: var(--warm); color: var(--accent-ink); }
.arc-d2-screen { display: grid; gap: 4px; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.arc-d2-msg { font-weight: 700; color: var(--ink); }
`;

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
          { q: 'A repository parses a 5 MB JSON string before returning it. The ViewModel calls it from viewModelScope. Who should move the parsing off the main thread?', options: ['The ViewModel, by wrapping every repository call in withContext', 'The repository, with withContext inside the function that parses', 'The composable, by calling it in LaunchedEffect'], a: 1, why: 'The class that does the slow work makes itself main-safe. Then every caller can use it from the main thread without thinking about it.' },
        ],
        deeper: [
          {
            title: 'Swap a data source and the screen never knows',
            body: `
<p>The repository is the seam. It depends on an interface for each data source, and something outside it, usually Hilt, decides which class fills that interface. A unit test passes a fake that returns a fixed list. A Compose preview passes sample data. The app passes the Retrofit one.</p>
<p>None of that touches the layers above. The ViewModel asks <code>NewsRepository</code> for news and gets <code>List&lt;Article&gt;</code> back, whoever produced it. Swap the source below and count what changed.</p>`,
            code: `interface NewsRemoteDataSource {
    suspend fun latest(): List<ArticleDto>
}

class RetrofitNewsDataSource @Inject constructor(
    private val api: NewsApi,
) : NewsRemoteDataSource {
    override suspend fun latest() = api.getLatest()
}

// In a unit test: no network, same repository, same ViewModel
class FakeNewsDataSource(var articles: List<ArticleDto>) : NewsRemoteDataSource {
    override suspend fun latest() = articles
}

val repository = NewsRepository(remote = FakeNewsDataSource(testArticles), dao = FakeArticleDao())`,
            visual(el) {
              const SRC = {
                real: { name: 'RetrofitNewsDataSource', sub: 'real HTTP through NewsApi', ask: 'GET /latest', items: ['Room 2.8 notes', 'KSP is the default', 'Navigation 3 guide'], who: 'the app' },
                fake: { name: 'FakeNewsDataSource', sub: 'a fixed list, no network', ask: 'return articles', items: ['Test story 1', 'Test story 2'], who: 'a unit test' },
                preview: { name: 'PreviewNewsDataSource', sub: 'sample data for @Preview', ask: 'return sample', items: ['Sample headline'], who: 'a Compose preview' },
              };
              let cur = 'real', busy = false, src;
              const list = h('div', { class: 'arc-mini' });
              const screen = node('NewsScreen', 'draws UiState', list);
              const vm = node('NewsViewModel', 'knows NewsRepository');
              const repo = node('NewsRepository', 'knows the interface NewsRemoteDataSource');
              const slotEl = h('div', { class: 'arc-d2-src' });
              const o = out();
              const mkSrc = (k, anim) => { const n = node(SRC[k].name, SRC[k].sub); if (anim) n.classList.add('drop-in'); return n; };
              const paintList = fresh => list.replaceChildren(...SRC[cur].items.map((t, i) => h('span', { class: fresh && i === 0 ? 'arc-new drop-in' : null }, t)));
              const all = () => [screen, vm, repo, src];
              const calm = () => all().forEach(x => { x.classList.remove('on', 'ok'); x.box.replaceChildren(); });
              const hop = async (n, text, back) => {
                calm(); n.classList.add('on'); tok(n, text, back ? 'arc-back' : '');
                await sleep(480);
                return o.isConnected;
              };
              async function use(k, btn) {
                if (busy) return; busy = true;
                btns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
                const swapped = k !== cur;
                if (swapped) {
                  cur = k; src = mkSrc(k, true); swapIn(slotEl, src);
                  say(o, `<span class="muted">wiring changed: remote = ${SRC[k].name}() for ${SRC[k].who}…</span>`);
                  await sleep(650); if (!o.isConnected) return;
                }
                for (const [n, t] of [[vm, 'refresh()'], [repo, 'latest()'], [src, SRC[k].ask]]) if (!await hop(n, t)) return;
                for (const [n, t] of [[repo, 'List<Article>'], [vm, `UiState(items = ${SRC[k].items.length})`]]) if (!await hop(n, t, true)) return;
                calm();
                paintList(true); screen.classList.add('ok'); replay(screen, 'pop-soft');
                tok(vm, 'unchanged', 'arc-back'); tok(repo, 'unchanged', 'arc-back');
                say(o, swapped
                  ? `<span class="good">swapped:</span> one line of wiring changed. NewsScreen, NewsViewModel and NewsRepository changed 0 lines.`
                  : `<span class="good">same source:</span> the screen got ${SRC[k].items.length} item${SRC[k].items.length > 1 ? 's' : ''} from ${SRC[k].name}.`);
                busy = false;
              }
              const btns = ['real', 'fake', 'preview'].map(k => cmd(`remote = ${SRC[k].name}(${k === 'real' ? 'api' : ''})`, function () { use(k, this); }));
              btns[0].setAttribute('aria-pressed', 'true');
              src = mkSrc(cur); slotEl.append(src); paintList(false);
              say(o, 'Pick another data source. Watch which boxes have to change.');
              el.append(
                h('div', { class: 'controls arc-fit' }, btns),
                h('div', { class: 'arc-layers' }, band('UI layer', screen, vm), h('div', { class: 'arc-dir' }, '↓ depends on'), band('Data layer', repo, slotEl)),
                o);
            },
          },
          {
            title: 'The layer that does slow work moves it off the main thread',
            body: `
<p>A ViewModel launches work in <code>viewModelScope</code>, which runs on the main thread. So every function the data layer exposes should be <b>main-safe</b>: safe to call from the main thread without freezing it.</p>
<p>Retrofit <code>suspend</code> calls and Room <code>suspend</code> or <code>Flow</code> queries are main-safe already. Your own blocking work is not: writing a file, parsing a big JSON string, sorting thousands of rows. The class that does that work wraps it in <code>withContext</code>, so its callers never think about threads. Inject the dispatcher so a test can swap it.</p>`,
            code: `class NewsRepository @Inject constructor(
    private val dao: ArticleDao,
    @IoDispatcher private val io: CoroutineDispatcher,   // your own qualifier
) {
    // Safe to call from viewModelScope: the slow part moves itself.
    suspend fun exportCsv(target: File) = withContext(io) {
        val rows = dao.getAll()
        target.writeText(rows.joinToString("\\n") { "\${it.id},\${it.title}" })
    }
}`,
          },
        ],
        underHood: {
          body: `
<p>A tap on refresh starts one coroutine, and that one coroutine walks through every layer. <code>viewModelScope.launch</code> starts it on <code>Dispatchers.Main.immediate</code>. The compiler gives every <code>suspend</code> function a hidden <code>Continuation</code> parameter, and each call passes it on: ViewModel to use case, use case to repository, repository to Retrofit.</p>
<p>When Retrofit sends the request, the function returns a special <code>COROUTINE_SUSPENDED</code> marker all the way up, and the main thread is free to draw frames. OkHttp waits for the response on its own thread. When it arrives, Retrofit resumes the continuation, and the coroutine’s dispatcher posts the rest of the work back to the main thread. The line after <code>getLatestNews()</code> runs on Main, holding the result. No layer created a thread or a callback of its own.</p>`,
          code: `// You write
suspend fun latest(): List<Article>

// The JVM sees (simplified)
fun latest(continuation: Continuation<List<Article>>): Any?
// returns COROUTINE_SUSPENDED while waiting, or the list if it finished at once`,
        },
        mistakes: [
          {
            title: 'Holding an Activity in the data layer',
            bad: `class NewsRepository(private val activity: Activity) {
    private val cacheDir = activity.cacheDir
}`,
            good: `class NewsRepository @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val cacheDir = context.cacheDir
}`,
            why: 'A repository often lives as long as the app. If it keeps an Activity, every rotation leaks the old Activity and its whole view tree. The application context lives exactly as long as the repository.',
          },
          {
            title: 'The ViewModel builds its own dependencies',
            bad: `class NewsViewModel : ViewModel() {
    private val repository = NewsRepository(
        RetrofitNewsDataSource(retrofit.create(NewsApi::class.java)),
        AppDatabase.get().articleDao(),
    )
}`,
            good: `@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel()`,
            why: 'A ViewModel that constructs the data layer depends on every class below it and can’t be tested with a fake. Take the repository as a constructor parameter and let Hilt or the test decide what it is.',
          },
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
          { q: 'The user picks the “Tech” filter, sends the app to the background, and Android kills the process. Where must the filter live to come back?', options: ['In the UiState StateFlow', 'In SavedStateHandle', 'In a companion object'], a: 1, why: 'Process death destroys the ViewModel and everything in memory. SavedStateHandle is saved by the system and handed to the new ViewModel.' },
          { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">init {\n    viewModelScope.launch {\n        val list = repo.observeNews().first()\n        _uiState.update { it.copy(items = list) }\n    }\n}</pre>A new article is saved to the database later. What does the screen show?', options: ['The new article', 'The old list, it never updates', 'An empty list'], a: 1, why: 'The list was copied in once. Keep each input as a flow, combine them into UiState and use stateIn, so the state follows every change.' },
        ],
        deeper: [
          {
            title: 'Rotation keeps the ViewModel. Process death does not.',
            body: `
<p>On rotation the Activity is destroyed and created again, but the ViewModel waits in the <code>ViewModelStore</code>. The new Activity gets the same object, so the UiState is still there.</p>
<p>When the app sits in the background, Android can kill the whole process to free memory. The ViewModel dies with it. When the user comes back, a new process builds a new ViewModel. Keep small user input, like the selected filter, in <code>SavedStateHandle</code>: the system stores it in a Bundle and hands it back. Reload big data from the repository.</p>`,
            code: `@HiltViewModel
class NewsViewModel @Inject constructor(
    private val savedState: SavedStateHandle,
    private val repository: NewsRepository,
) : ViewModel() {
    // Comes back after process death. Keep it small: ids, queries, filters.
    private val filter: StateFlow<String> = savedState.getStateFlow("filter", "All")

    fun onEvent(event: NewsEvent) {
        if (event is NewsEvent.SelectFilter) savedState["filter"] = event.filter
    }
}`,
            visual(el) {
              const ARTS = [['Compose tips', 'Tech'], ['Derby tonight', 'Sports'], ['Kotlin 2.3 notes', 'Tech'], ['Transfer news', 'Sports']];
              let filter = 'Tech', useSsh = true, bundle = 'Tech', vmId = addr(), loading = false, busy = false;
              const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Screen preview' });
              const vm = node('NewsViewModel', 'held by the ViewModelStore');
              const saved = node('Saved state Bundle', 'kept by the system, even after the process dies');
              const o = out();
              const shown = () => ARTS.filter(a => filter === 'All' || a[1] === filter);
              function paint(anim) {
                phone.replaceChildren(
                  h('div', { class: 'arc-chips' }, ['All', 'Tech', 'Sports'].map(f => h('button', { class: 'arc-fchip' + (filter === f ? ' on' : ''), onclick: () => select(f) }, f))),
                  ...(loading ? [h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')]
                    : shown().map(a => h('div', { class: 'item arc-small' }, a[0]))));
                vm.box.replaceChildren(stateCard(`NewsViewModel${vmId}`, [['filter', `"${filter}"`], ['items', loading ? '[]' : `[${shown().length} articles]`]], [], anim));
                saved.box.replaceChildren(bundle ? h('span', { class: 'token arc-back' }, `"filter" = "${bundle}"`) : h('span', { class: 'tip' }, 'empty'));
              }
              function select(f) {
                if (busy) return;
                filter = f; if (useSsh) bundle = f;
                paint(); replay(phone, 'pop-soft');
                say(o, useSsh ? `${hl(`savedState["filter"] = "${f}"`)} <span class="muted">// the ViewModel and the Bundle both know</span>` : `${hl(`_uiState.update { it.copy(filter = "${f}") }`)} <span class="muted">// only the ViewModel knows</span>`);
              }
              async function rotate() {
                if (busy) return; busy = true;
                replay(phone, 'flip'); vm.classList.add('ok');
                say(o, '<span class="muted">Activity destroyed, new Activity created…</span>');
                await sleep(700); if (!el.isConnected) return;
                vm.classList.remove('ok'); paint();
                say(o, `<span class="good">rotated:</span> the new Activity asked for its ViewModel and got the same one, ${vmId}. The filter is still "${filter}".`);
                busy = false;
              }
              async function kill() {
                if (busy) return; busy = true;
                vm.classList.add('bad'); replay(vm, 'shake');
                vm.box.replaceChildren(h('span', { class: 'token boom' }, 'process killed'));
                phone.replaceChildren(h('p', { class: 'phone-note' }, 'App in the background. The system needs memory.'));
                say(o, '<span class="bad">process death:</span> every object in memory is gone, the ViewModel too.');
                await sleep(1000); if (!el.isConnected) return;
                vm.classList.remove('bad');
                vmId = addr(); filter = useSsh && bundle ? bundle : 'All'; loading = true;
                paint(true);
                say(o, `<span class="muted">user returns: new process, new ViewModel ${vmId}, loading from the repository…</span>`);
                await sleep(800); if (!el.isConnected) return;
                loading = false; paint(); replay(phone, 'pop-soft');
                say(o, useSsh
                  ? `<span class="good">restored:</span> "${filter}" came back from SavedStateHandle. The list was reloaded, not saved.`
                  : '<span class="bad">lost:</span> the filter is back to "All". It only lived in the ViewModel, which died with the process.');
                busy = false;
              }
              const sw = switchEl('arc-d-ssh', 'filter in SavedStateHandle', true, i => {
                if (busy) { i.checked = useSsh; return; }
                useSsh = i.checked; bundle = useSsh ? filter : null; paint();
                say(o, useSsh ? 'The filter is written to SavedStateHandle again.' : 'Now the filter only lives in the ViewModel. Try process death.');
              });
              paint();
              say(o, 'Pick a filter, then compare a rotation with process death.');
              el.append(
                h('div', { class: 'arc-udf' }, phone, h('div', { class: 'arc-col' }, vm, saved)),
                h('div', { class: 'controls arc-fit' }, cmd('rotate()', rotate), cmd('killProcess(); reopen()', kill), sw),
                o);
            },
          },
          {
            title: 'Derive the state. Don’t copy it in.',
            body: `
<p>Most screens mix data from the repository with choices the user made. If the ViewModel copies the repository list into its state once, in <code>init</code>, later database changes never reach the screen.</p>
<p>Instead, keep each input as a flow and <code>combine</code> them. Whenever any input emits, the lambda builds a fresh <code>UiState</code>. <code>stateIn</code> turns the result into the <code>StateFlow</code> the screen collects. The UiState is now a function of its inputs, and it can’t fall out of date.</p>`,
            code: `private val filter = MutableStateFlow("All")

val uiState: StateFlow<NewsUiState> =
    combine(repository.observeNews(), filter) { articles, f ->
        NewsUiState(
            filter = f,
            items = articles.filter { f == "All" || it.tag == f },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NewsUiState())

fun onEvent(event: NewsEvent) {
    if (event is NewsEvent.SelectFilter) filter.value = event.filter
}`,
            visual(el) {
              const POOL = [['Baseline profiles', 'Tech'], ['Cup final', 'Sports'], ['Room 2.8 notes', 'Tech'], ['Title race', 'Sports']];
              let arts = [['Compose tips', 'Tech'], ['Derby tonight', 'Sports'], ['Kotlin 2.3 notes', 'Tech']];
              let filter = 'All', live = true, snap = arts.slice(), p = 0, busy = false, stAddr = addr();
              const dbLane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'observeNews()'));
              const fLane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'filter'));
              const fn = h('div', { class: 'kt' });
              const comb = h('div', { class: 'arc-node' }, h('b', {}, 'combine(articles, filter)'), fn);
              const slot = h('div', { class: 'arc-stateslot' });
              const o = out();
              const items = () => (live ? arts : snap).filter(a => filter === 'All' || a[1] === filter);
              const card = (changed, anim) => stateCard(`NewsUiState${stAddr}`, [['filter', `"${filter}"`], ['items', `[${items().length} articles]`]], changed, anim);
              const paintFn = () => { fn.innerHTML = hl(live ? '{ a, f -> NewsUiState(f, a.filter { … }) }' : '// copied once in init, then copy(filter = …)'); };
              async function publish() {
                if (busy) return; busy = true;
                arts = [POOL[p++ % POOL.length], ...arts].slice(0, 6);
                laneTok(dbLane, `List(${arts.length})`);
                say(o, `<span class="muted">Room emits ${arts.length} articles…</span>`);
                await sleep(450); if (!el.isConnected) return;
                if (live) {
                  comb.classList.add('on'); replay(comb, 'pop-soft');
                  await sleep(400); if (!el.isConnected) return;
                  stAddr = addr(); swapIn(slot, card(['items'], true)); comb.classList.remove('on');
                  say(o, `<span class="good">combine re-ran:</span> a new article arrived, so a new UiState was built. The screen sees ${items().length} articles.`);
                } else {
                  comb.classList.add('bad'); replay(comb, 'shake');
                  await sleep(400); if (!el.isConnected) return;
                  comb.classList.remove('bad');
                  say(o, `<span class="bad">stale:</span> Room now has ${arts.length} articles. The state still holds the ${snap.length} it copied in init.`);
                }
                busy = false;
              }
              async function setFilter(f) {
                if (busy) return; busy = true;
                filter = f; laneTok(fLane, `"${f}"`);
                await sleep(450); if (!el.isConnected) return;
                comb.classList.add('on'); replay(comb, 'pop-soft');
                await sleep(350); if (!el.isConnected) return;
                stAddr = addr(); swapIn(slot, card(['filter', 'items'], true)); comb.classList.remove('on');
                say(o, live
                  ? `<span class="good">combine re-ran:</span> the filter emitted, so the items were filtered again from the latest list.`
                  : `<span class="muted">The filter changed, but it filters the old copy of ${snap.length} articles.</span>`);
                busy = false;
              }
              const sw = switchEl('arc-d-combine', 'combine the inputs', true, i => {
                if (busy) { i.checked = live; return; }
                live = i.checked; if (!live) snap = arts.slice();
                paintFn(); stAddr = addr(); swapIn(slot, card([], true));
                say(o, live ? 'combine is back. The state follows both inputs again.' : 'Now the list is copied once. Add an article and watch the state miss it.');
              });
              paintFn(); laneTok(dbLane, `List(${arts.length})`); laneTok(fLane, `"${filter}"`); slot.append(card([]));
              say(o, 'Both inputs feed one combine. Change either one.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('dao.upsert(article)', publish), cmd('filter.value = "Tech"', () => setFilter('Tech')), cmd('filter.value = "All"', () => setFilter('All')), sw),
                h('div', { class: 'arc-col' }, dbLane, fLane, h('div', { class: 'arc-dir' }, '↓'), comb, h('div', { class: 'arc-dir' }, '↓ stateIn'), slot),
                o);
            },
          },
          {
            title: 'StateFlow keeps only the latest value',
            body: `
<p><code>StateFlow</code> is conflated. It holds one value. A slow collector doesn’t get a queue of every update. It gets the newest value when it is ready again. For UI state that is what you want: nobody needs to see frames that are already out of date.</p>
<p>It also skips equal values. Setting a state that <code>equals()</code> the current one emits nothing. That is why UiState must be an immutable data class: equality has to mean “nothing changed”.</p>`,
            code: `// Five updates in a row
repeat(5) { _uiState.update { it.copy(unread = it.unread + 1) } }
// A slow collector may only see unread = 1 and then unread = 5.

// An equal value: no emission at all
_uiState.update { it.copy() }`,
            visual(el) {
              let value = 0, seen = 0, rendering = false, busy = false, got = [];
              const prodLane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'update { }'));
              const valChip = h('span', { class: 'chip total' }, '0');
              const flowNode = h('div', { class: 'arc-node' }, h('b', {}, 'uiState.value.unread'), valChip);
              const colLane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'collector'));
              const o = out();
              const drawTok = v => {
                const toks = colLane.querySelectorAll('.token');
                if (toks.length >= 6) toks[0].remove();
                colLane.append(h('span', { class: 'token drop-in arc-back' }, `draw ${v}`));
              };
              async function pump() {
                if (rendering || seen === value) return;
                rendering = true; seen = value; got.push(seen);
                drawTok(seen); replay(flowNode, 'pop-soft');
                await sleep(900);
                rendering = false;
                if (el.isConnected) pump();
              }
              async function burst() {
                if (busy) return; busy = true; got = [];
                prodLane.querySelectorAll('.token').forEach(t => t.remove());
                for (let i = 0; i < 5; i++) {
                  value++; valChip.textContent = String(value); replay(valChip, 'pop');
                  prodLane.append(h('span', { class: 'token drop-in' }, `→ ${value}`));
                  pump();
                  await sleep(150); if (!el.isConnected) return;
                }
                while (rendering || seen !== value) { await sleep(100); if (!el.isConnected) return; }
                say(o, `<span class="good">conflated:</span> 5 values were set. The slow collector drew ${got.join(' and ')}. It always ends on the latest.`);
                busy = false;
              }
              function same() {
                if (busy) return;
                prodLane.querySelectorAll('.token').forEach(t => t.remove());
                prodLane.append(h('span', { class: 'token drop-in is-null' }, 'copy() // equal'));
                replay(valChip, 'shake');
                say(o, '<span class="muted">equals() was true, so StateFlow did not emit. The collector did nothing.</span>');
              }
              drawTok(0);
              say(o, 'The collector takes 900 ms per frame. Fire five quick updates.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('repeat(5) { update { unread + 1 } }', burst), cmd('update { it.copy() }', same)),
                h('div', { class: 'arc-col' }, prodLane, flowNode, colLane),
                o);
            },
          },
        ],
        underHood: {
          body: `
<p><code>update</code> is a small loop around compare-and-set. It reads the current value, runs your lambda, and swaps the result in only if nobody changed the value in between. If another coroutine won the race, it runs the lambda again on the newer value. That is why two coroutines calling <code>update</code> at once never lose a change, while <code>value = value.copy(...)</code> can.</p>
<p><code>hiltViewModel()</code> and <code>viewModel()</code> look the ViewModel up in the <code>ViewModelStore</code> of the nearest owner, keyed by class. A <code>ComponentActivity</code> hands its store to the next instance through its non-configuration state during a rotation, which is why the same object comes back.</p>`,
          code: `// kotlinx.coroutines: MutableStateFlow.update
public inline fun <T> MutableStateFlow<T>.update(function: (T) -> T) {
    while (true) {
        val prevValue = value
        val nextValue = function(prevValue)
        if (compareAndSet(prevValue, nextValue)) return
    }
}`,
        },
        mistakes: [
          {
            title: 'Read-modify-write with value',
            bad: `fun toggleSave(id: Int) {
    val s = _uiState.value
    _uiState.value = s.copy(saved = s.saved + id)
}`,
            good: `fun toggleSave(id: Int) {
    _uiState.update { it.copy(saved = it.saved + id) }
}`,
            why: 'Two coroutines can read the same old state, and the second write drops the first change. <code>update</code> retries until its change lands on the latest value.',
          },
          {
            title: 'Mutable collections inside the state',
            bad: `data class NewsUiState(val items: MutableList<Article>)

fun add(a: Article) {
    _uiState.value.items.add(a)   // same object, no emission
}`,
            good: `data class NewsUiState(val items: List<Article> = emptyList())

fun add(a: Article) {
    _uiState.update { it.copy(items = it.items + a) }
}`,
            why: 'Changing the list in place keeps the same state object, so StateFlow sees an equal value and never emits. The screen keeps drawing the old list.',
          },
          {
            title: 'Passing the ViewModel down the tree',
            bad: `@Composable
fun ArticleRow(article: Article, viewModel: NewsViewModel) {
    Row(Modifier.clickable { viewModel.onEvent(ToggleSave(article.id)) }) { /* ... */ }
}`,
            good: `@Composable
fun ArticleRow(article: Article, onToggleSave: () -> Unit) {
    Row(Modifier.clickable(onClick = onToggleSave)) { /* ... */ }
}`,
            why: 'Only the screen-level composable should know the ViewModel. Child composables that take plain values and lambdas work in previews and tests without a ViewModel.',
          },
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
            say(o, '<span class="bad">compile error:</span> Unresolved reference \'add\'. <span class="muted">items is a read-only List. The screen can only read state; send an event instead.</span>');
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
          { q: 'In MVI the user taps Checkout. Which order is right?', options: ['Reducer returns an “order in progress” state → ViewModel launches the call → result comes back as OrderPlaced → reducer returns the final state', 'Reducer calls the API → reducer returns the final state', 'ViewModel calls the API → ViewModel sets the state directly → reducer logs it'], a: 0, why: 'A reducer stays pure, so the effect runs outside it. The result re-enters as one more intent, so every change still goes through the reducer.' },
          { q: 'Typing “kot” sends QueryChanged three times. The answer for “k” arrives last and replaces the results for “kot”. What fixes it?', options: ['Sort the answers by length', 'Cancel the previous search when a new query arrives, for example with mapLatest', 'Use tryEmit for the intents'], a: 1, why: 'Requests finish in any order. Cancelling the old one means only the latest query can ever write results.' },
        ],
        deeper: [
          {
            title: 'Effects run outside the reducer, and results come back as intents',
            body: `
<p>A reducer can’t call the network, so where does checkout happen? Split it in two. The reducer handles <code>Checkout</code> by returning a state that says an order is in progress. Then the ViewModel, outside the reducer, launches the call.</p>
<p>When the call returns, the ViewModel does not touch the state directly. It sends the result back in as one more intent: <code>OrderPlaced</code> or <code>OrderFailed</code>. Every change still goes through one function, and the intent log shows the whole story, the server’s answer included.</p>`,
            code: `fun onIntent(intent: CartIntent) {
    _state.update { reduce(it, intent) }
    if (intent is CartIntent.Checkout) viewModelScope.launch {
        val result = try {
            CartIntent.OrderPlaced(checkoutApi.placeOrder(_state.value.toOrder()))
        } catch (e: IOException) {
            CartIntent.OrderFailed(e.message ?: "Network error")
        }
        onIntent(result)   // the answer is just another intent
    }
}

private fun reduce(s: CartState, i: CartIntent): CartState = when (i) {
    CartIntent.Increment -> s.copy(qty = s.qty + 1)
    CartIntent.Checkout -> s.copy(isPlacingOrder = true, error = null)
    is CartIntent.OrderPlaced -> s.copy(isPlacingOrder = false, orderId = i.id)
    is CartIntent.OrderFailed -> s.copy(isPlacingOrder = false, error = i.message)
}`,
            visual(el) {
              let s = { qty: 2, placing: false, orderId: null, error: null }, fail = false, busy = false, n = 1040;
              const log = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'intents'));
              const red = h('div', { class: 'arc-node' }, h('b', {}, 'reduce(state, intent)'), h('small', {}, 'pure: no I/O, no launch'));
              const slot = h('div', { class: 'arc-stateslot' });
              const fx = node('viewModelScope.launch { }', 'the effect: the only part that talks to the network');
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const card = (changed, anim) => stateCard('CartState', [['qty', s.qty], ['isPlacingOrder', s.placing], ['orderId', quote(s.orderId)], ['error', quote(s.error)]], changed, anim);
              const push = (text, cls = '') => {
                const toks = log.querySelectorAll('.token');
                if (toks.length >= 3) toks[0].remove();
                log.append(h('span', { class: `token drop-in ${cls}` }, text));
              };
              async function reduce(text, patch, changed, cls) {
                push(text, cls);
                await sleep(380); if (!o.isConnected) return false;
                red.classList.add('on'); replay(red, 'pop-soft');
                await sleep(380); if (!o.isConnected) return false;
                Object.assign(s, patch); swapIn(slot, card(changed, true)); red.classList.remove('on');
                return true;
              }
              async function checkout() {
                if (busy) return; busy = true;
                fx.classList.remove('ok', 'bad'); fx.box.replaceChildren();
                say(o, '<span class="muted">Checkout goes through the reducer first…</span>');
                if (!await reduce('Checkout', { placing: true, error: null, orderId: null }, ['isPlacingOrder', 'error', 'orderId'])) return;
                line('<span class="muted">The state says "placing". Now the ViewModel launches the call.</span>');
                fx.classList.add('on'); tok(fx, 'checkoutApi.placeOrder(…)'); replay(fx, 'pop-soft');
                await sleep(1100); if (!o.isConnected) return;
                fx.classList.remove('on');
                if (fail) {
                  fx.classList.add('bad'); tok(fx, 'IOException', 'boom'); replay(fx, 'shake');
                  if (!await reduce('OrderFailed("timeout")', { placing: false, error: 'timeout' }, ['isPlacingOrder', 'error'], 'boom')) return;
                  say(o, '<span class="bad">failed:</span> the effect turned the exception into an <b>OrderFailed</b> intent. The reducer cleared the spinner and stored the error.');
                } else {
                  n++;
                  fx.classList.add('ok'); tok(fx, `"A-${n}"`, 'arc-back');
                  if (!await reduce(`OrderPlaced("A-${n}")`, { placing: false, orderId: `A-${n}` }, ['isPlacingOrder', 'orderId'], 'arc-back')) return;
                  say(o, '<span class="good">placed:</span> the result came back as an <b>OrderPlaced</b> intent. Even the server’s answer changed the state through reduce().');
                }
                busy = false;
              }
              async function inc() {
                if (busy) return; busy = true;
                if (!await reduce('Increment', { qty: s.qty + 1 }, ['qty'])) return;
                say(o, '<span class="muted">Increment needs no effect. The reducer alone handles it.</span>');
                busy = false;
              }
              const sw = switchEl('arc-d2-mvi-fail', 'the server fails', false, i => {
                if (busy) { i.checked = fail; return; }
                fail = i.checked;
                say(o, fail ? 'The next placeOrder() call will throw an IOException.' : 'The server answers again.');
              });
              slot.append(card([]));
              say(o, 'Check out the cart. Watch where the network call happens.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('onIntent(Checkout)', checkout), cmd('onIntent(Increment)', inc), sw),
                h('div', { class: 'arc-col' }, log, h('div', { class: 'arc-dir' }, '↓'), red, h('div', { class: 'arc-dir' }, '↓ new state'), slot, h('div', { class: 'arc-dir' }, 'after Checkout: launch, then send the answer back up as an intent'), fx),
                o);
            },
          },
          {
            title: 'Slow answers can arrive in the wrong order',
            body: `
<p>A search box sends <code>QueryChanged</code> on every key. Each one starts a request, and the requests don’t finish in the order they started. A short query like <code>"k"</code> matches more rows and can answer last. If every answer is applied, the screen ends up showing results for <code>"k"</code> under the query <code>"kot"</code>.</p>
<p>Cancel the previous search when a new query arrives. Keep the <code>Job</code> and call <code>cancel()</code>, or route queries through a flow with <code>mapLatest</code>. Because every query passes through one entry point in MVI, the rule lives in one place.</p>`,
            code: `private var searchJob: Job? = null

fun onIntent(intent: SearchIntent) {
    _state.update { reduce(it, intent) }
    if (intent is SearchIntent.QueryChanged) {
        searchJob?.cancel()                   // the older, slower search is dropped
        searchJob = viewModelScope.launch {
            val hits = repository.search(intent.query)
            onIntent(SearchIntent.ResultsLoaded(intent.query, hits))
        }
    }
}`,
            visual(el) {
              const Q = [['k', 0, 1700], ['ko', 300, 1100], ['kot', 600, 500]];
              const TOTAL = 1900;
              let cancel = false, busy = false, st = { query: '""', results: '[]' };
              const tracks = {};
              const tl = h('div', { class: 'timeline' }, Q.map(([q]) => {
                const tr = h('div', { class: 'lane-track' }); tracks[q] = tr;
                return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, `"${q}"`), tr);
              }));
              const slot = h('div', { class: 'arc-stateslot' });
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const card = (changed, bad) => {
                const c = stateCard('SearchState', [['query', st.query], ['results', st.results]], changed, true);
                if (bad) c.classList.add('arc-d2-badcard');
                return c;
              };
              async function type() {
                if (busy) return; busy = true;
                Object.values(tracks).forEach(t => t.replaceChildren());
                st = { query: '""', results: '[]' }; swapIn(slot, card([]));
                say(o, '<span class="muted">typing k, o, t…</span>');
                const ev = [];
                Q.forEach(([q, start, lat], i) => {
                  ev.push({ t: start, kind: 'start', q, lat });
                  const next = Q[i + 1];
                  if (cancel && next) ev.push({ t: next[1], kind: 'cancel', q, start });
                  else ev.push({ t: start + lat, kind: 'end', q });
                });
                ev.sort((a, b) => a.t - b.t || (a.kind === 'cancel' ? -1 : 1));
                const bars = {};
                let now = 0;
                for (const e of ev) {
                  await sleep(e.t - now); now = e.t;
                  if (!o.isConnected) return;
                  if (e.kind === 'start') {
                    const b = h('span', { class: 'bar run arc-d2-bar', style: `left:${e.t / TOTAL * 100}%;width:0;transition-duration:${e.lat}ms` });
                    tracks[e.q].append(b); void b.offsetWidth;
                    b.style.width = `${e.lat / TOTAL * 100}%`; bars[e.q] = b;
                    st.query = `"${e.q}"`; swapIn(slot, card(['query']));
                  } else if (e.kind === 'cancel') {
                    const b = bars[e.q];
                    b.style.transitionDuration = '0ms'; b.style.width = `${(e.t - e.start) / TOTAL * 100}%`;
                    b.classList.remove('run'); b.classList.add('queued');
                    line(`<span class="muted">search("${e.q}") cancelled</span>`);
                  } else {
                    st.results = `for "${e.q}"`;
                    const bad = st.query !== `"${e.q}"`;
                    swapIn(slot, card(['results'], bad));
                    line(bad ? `<span class="bad">results for "${e.q}" landed</span>` : `<span class="good">results for "${e.q}" landed</span>`);
                  }
                }
                await sleep(200); if (!o.isConnected) return;
                say(o, cancel
                  ? '<span class="good">consistent:</span> the older searches were cancelled, so only the results for "kot" landed.'
                  : '<span class="bad">stale:</span> "kot" answered first, then the slower "k" search overwrote it. The screen shows results for "k" under the query "kot".');
                busy = false;
              }
              const sw = switchEl('arc-d2-mvi-cancel', 'searchJob?.cancel()', false, i => {
                if (busy) { i.checked = cancel; return; }
                cancel = i.checked;
                say(o, cancel ? 'Each new query now cancels the one before it.' : 'Every search runs to the end and applies its answer.');
              });
              slot.append(card([]));
              say(o, 'Type "kot" fast. The shortest query takes longest to answer.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('type "kot"', type), sw),
                tl, slot, o);
            },
          },
          {
            title: 'Test the reducer with plain values',
            body: `
<p>A pure reducer needs no ViewModel, no dispatcher and no fake to test. Move it out of the class as an <code>internal</code> top-level function and feed it a list of intents with <code>fold</code>. The test runs in microseconds and reads like the user’s story.</p>`,
            code: `internal fun reduce(state: CartState, intent: CartIntent): CartState = when (intent) {
    CartIntent.Increment -> state.copy(qty = state.qty + 1)
    CartIntent.Decrement -> state.copy(qty = (state.qty - 1).coerceAtLeast(0))
    is CartIntent.ApplyCoupon -> state.copy(coupon = intent.code)
}

class CartReducerTest {
    @Test
    fun couponTakesTenPercentOff() {
        val state = listOf(CartIntent.Increment, CartIntent.ApplyCoupon("SAVE10"))
            .fold(CartState(), ::reduce)

        assertEquals(2, state.qty)
        assertEquals(21.6, state.total, 0.001)
    }
}`,
          },
        ],
        underHood: {
          body: `
<p><code>_state.update { reduce(it, intent) }</code> is a compare-and-set loop. It reads the state, runs the reducer and swaps the result in only if nobody changed the state in between. When two intents arrive from different threads at the same moment, one swap fails and <code>update</code> runs your reducer again on the newer state. A pure reducer makes that retry harmless. A reducer that sent a request would send it twice.</p>
<p>A <code>when</code> over a sealed type with no <code>else</code> compiles to a chain of type and equality checks. The compiler still adds a final branch that throws <code>NoWhenBranchMatchedException</code>. It can only run if a subtype shows up that this code was not compiled against, for example from a library that was updated without a rebuild.</p>`,
        },
        mistakes: [
          {
            title: 'Reading the clock inside the reducer',
            bad: `is NoteIntent.Add -> s.copy(
    notes = s.notes + Note(i.text, createdAt = System.currentTimeMillis()),
)`,
            good: `data class Add(val text: String, val at: Long) : NoteIntent

// The ViewModel reads the clock once and puts it in the intent
onIntent(NoteIntent.Add(text, at = clock.millis()))

is NoteIntent.Add -> s.copy(notes = s.notes + Note(i.text, createdAt = i.at))`,
            why: 'A reducer that reads the clock or a random number gives a different state for the same intents, so replays and tests stop matching. Put every outside value into the intent.',
          },
          {
            title: 'Sending intents with tryEmit into an unbuffered flow',
            bad: `private val intents = MutableSharedFlow<CartIntent>()

fun onIntent(intent: CartIntent) {
    intents.tryEmit(intent)   // may send nothing
}`,
            good: `fun onIntent(intent: CartIntent) {
    _state.update { reduce(it, intent) }
}

// or, if you need a stream of intents:
private val intents = MutableSharedFlow<CartIntent>(extraBufferCapacity = 64)`,
            why: 'With no buffer, <code>tryEmit</code> drops the value when nobody collects yet and returns <code>false</code> without sending when it would have to wait. Taps get lost and nothing reports it. Calling <code>update</code> directly is simpler and never drops.',
          },
          {
            title: 'Keeping public functions next to onIntent',
            bad: `class CartMviViewModel : ViewModel() {
    fun onIntent(intent: CartIntent) = _state.update { reduce(it, intent) }

    fun applyCoupon(code: String) = _state.update { it.copy(coupon = code) }
}`,
            good: `class CartMviViewModel : ViewModel() {
    fun onIntent(intent: CartIntent) = _state.update { reduce(it, intent) }
    // every action is a CartIntent; no other public way in
}`,
            why: 'A second way to change the state skips the reducer and the intent log. Replays and reducer tests no longer describe what the screen really did.',
          },
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
          { q: 'A use case combines 5,000 articles with followed topics and sorts them. The screen stutters each time a topic changes. What fixes it?', options: ['Make the Room query suspend', 'Add flowOn(defaultDispatcher) at the end of the use case', 'Call stateIn with SharingStarted.Eagerly'], a: 1, why: 'The combine lambda runs where the flow is collected, which is the main thread through viewModelScope. flowOn moves everything above it to another dispatcher.' },
          { q: 'Free users may keep three bookmarks, and two screens can save one. Where does the limit check go?', options: ['In each ViewModel', 'In one SaveArticleUseCase that both screens call', 'In the Room DAO query'], a: 1, why: 'Two copies of a rule drift apart. One use case keeps the business rule in one place for every screen.' },
        ],
        deeper: [
          {
            title: 'A rule that writes belongs in one place',
            body: `
<p>Use cases are not only for reading. Saving a bookmark looks like one repository call, until the business adds a rule: free users can keep three. Now two screens can save, and both must apply the same limit.</p>
<p>If each ViewModel checks the limit itself, the copies drift. Someone changes one and forgets the other, and the app behaves differently depending on where the user taps. Put the rule in <code>SaveArticleUseCase</code> and both screens call it. Turn the switch off to see the drift.</p>`,
            code: `class SaveArticleUseCase @Inject constructor(
    private val bookmarks: BookmarksRepository,
    private val user: UserDataRepository,
) {
    suspend operator fun invoke(id: Int): SaveResult {
        val limit = if (user.isPremium()) Int.MAX_VALUE else 3
        if (bookmarks.count() >= limit) return SaveResult.LimitReached(limit)
        bookmarks.add(id)
        return SaveResult.Saved
    }
}`,
            visual(el) {
              const LIMIT = 3;
              let shared = true, saved = [1, 2], next = 3, busy = false;
              const count = h('span', { class: 'chip total' }, '2');
              const repo = node('BookmarksRepository', 'stores saved ids', count);
              const uc = node('SaveArticleUseCase', 'free users keep 3');
              const avm = node('ArticleViewModel', 'calls saveArticle(id)');
              const fvm = node('FeedViewModel', 'calls saveArticle(id)');
              const sub = n => n.querySelector('small');
              const o = out();
              const ucBand = band('Domain layer', uc);
              function paint() {
                sub(avm).innerHTML = shared ? 'calls saveArticle(id)' : 'checks count &lt; 3 itself';
                sub(fvm).innerHTML = shared ? 'calls saveArticle(id)' : 'checks count &lt; 5 itself <span class="arc-baddep">(old copy)</span>';
                ucBand.classList.toggle('off', !shared);
                count.textContent = String(saved.length);
              }
              const calm = () => [avm, fvm, uc, repo].forEach(n => { n.classList.remove('on', 'ok', 'bad'); n.box.replaceChildren(); });
              async function save(vm, ownLimit, who) {
                if (busy) return; busy = true;
                calm();
                vm.classList.add('on'); tok(vm, `save(${next})`);
                await sleep(450); if (!o.isConnected) return;
                let checker = vm, limit = ownLimit;
                if (shared) {
                  vm.classList.remove('on'); checker = uc; limit = LIMIT;
                  uc.classList.add('on'); tok(uc, `count ${saved.length} < ${LIMIT}?`);
                  await sleep(550); if (!o.isConnected) return;
                } else {
                  tok(vm, `count ${saved.length} < ${ownLimit}?`);
                  await sleep(550); if (!o.isConnected) return;
                }
                if (saved.length >= limit) {
                  checker.classList.remove('on'); checker.classList.add('bad');
                  tok(checker, `LimitReached(${limit})`, 'boom'); replay(checker, 'shake');
                  say(o, `<span class="good">blocked:</span> ${who} can’t save more than ${limit}. ${shared ? 'Both screens get this answer from the same class.' : ''}`);
                } else {
                  saved.push(next++); paint(); replay(count, 'pop');
                  checker.classList.remove('on');
                  repo.classList.add(saved.length > LIMIT ? 'bad' : 'ok'); tok(repo, `add(${saved[saved.length - 1]})`, 'arc-back');
                  say(o, saved.length > LIMIT
                    ? `<span class="bad">rule broken:</span> ${who} saved bookmark number ${saved.length}. Its copy of the limit still says 5, so the two screens disagree.`
                    : `<span class="good">saved:</span> ${saved.length} of ${LIMIT} bookmarks.`);
                }
                busy = false;
              }
              function clear() {
                if (busy) return;
                calm(); saved = []; paint(); replay(count, 'pop');
                say(o, 'All bookmarks removed. Save again from either screen.');
              }
              const sw = switchEl('arc-d2-uc-rule', 'rule lives in SaveArticleUseCase', true, i => {
                if (busy) { i.checked = shared; return; }
                shared = i.checked; calm(); paint();
                say(o, shared ? 'Both ViewModels call the use case again.' : 'Each ViewModel now has its own copy of the rule. One copy is out of date.');
              });
              paint();
              say(o, 'Two bookmarks are saved. Save from both screens and watch who checks the limit.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('ArticleScreen: save()', () => save(avm, LIMIT, 'ArticleViewModel')), cmd('FeedScreen: save()', () => save(fvm, 5, 'FeedViewModel')), cmd('bookmarks.clear()', clear), sw),
                h('div', { class: 'arc-layers' }, band('UI layer', avm, fvm), h('div', { class: 'arc-dir' }, '↓'), ucBand, h('div', { class: 'arc-dir' }, '↓'), band('Data layer', repo)),
                o);
            },
          },
          {
            title: 'Heavy work in a use case runs on the collector’s thread',
            body: `
<p>Room runs its SQL off the main thread. The operators you add after it do not. The lambda inside <code>combine</code> runs wherever the flow is collected, and <code>stateIn(viewModelScope, …)</code> collects on the main thread. Filtering and sorting 5,000 articles there freezes the screen for a moment every time a topic changes.</p>
<p><code>flowOn</code> moves everything above it to another dispatcher. Put it at the end of the use case, so every caller gets a main-safe flow. Inject the dispatcher so tests can pass a test one.</p>`,
            code: `class GetPersonalizedFeedUseCase @Inject constructor(
    private val news: NewsRepository,
    private val userData: UserDataRepository,
    @DefaultDispatcher private val default: CoroutineDispatcher,
) {
    operator fun invoke(): Flow<List<Article>> =
        combine(news.observeNews(), userData.observeFollowedTopics()) { articles, topics ->
            articles.filter { it.topic in topics }.sortedByDescending { it.publishedAt }
        }.flowOn(default)   // the lambda above now runs off the main thread
}`,
            visual(el) {
              const N = 18, W0 = 5, W1 = 12;
              let off = false, busy = false;
              const mk = () => Array.from({ length: N }, () => h('span', { class: 'arc-d2-frame' }));
              const mainC = mk(), defC = mk();
              const dropped = h('span', { class: 'arc-badge' }, 'dropped: 0');
              const tl = h('div', { class: 'timeline' },
                h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'Main'), h('div', { class: 'arc-d2-frames' }, mainC)),
                h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'Default'), h('div', { class: 'arc-d2-frames' }, defC)));
              const legend = h('div', { class: 'legend' },
                h('span', {}, h('i', { class: 'arc-d2-key arc-d2-drawn' }), 'frame drawn'),
                h('span', {}, h('i', { class: 'arc-d2-key arc-d2-work' }), 'filter + sort'),
                h('span', {}, h('i', { class: 'arc-d2-key arc-d2-drop' }), 'frame dropped'));
              const o = out();
              async function follow() {
                if (busy) return; busy = true;
                [...mainC, ...defC].forEach(c => { c.className = 'arc-d2-frame'; });
                let lost = 0; dropped.textContent = 'dropped: 0';
                say(o, '<span class="muted">topics emitted, combine runs…</span>');
                for (let i = 0; i < N; i++) {
                  await sleep(70); if (!o.isConnected) return;
                  const work = i >= W0 && i < W1;
                  if (work && !off) {
                    mainC[i].classList.add('arc-d2-work', 'arc-d2-drop');
                    lost++; dropped.textContent = `dropped: ${lost}`; replay(dropped, 'pop');
                  } else {
                    mainC[i].classList.add('arc-d2-drawn');
                    if (work) defC[i].classList.add('arc-d2-work');
                  }
                }
                say(o, off
                  ? '<span class="good">smooth:</span> flowOn moved combine to a Default thread. Main drew every frame.'
                  : `<span class="bad">jank:</span> combine filtered 5,000 articles on Main. ${lost} frames were never drawn.`);
                busy = false;
              }
              const sw = switchEl('arc-d2-uc-flowon', '.flowOn(default)', false, i => {
                if (busy) { i.checked = off; return; }
                off = i.checked;
                say(o, off ? 'The combine lambda now runs on Dispatchers.Default.' : 'No flowOn: the lambda runs where stateIn collects, on Main.');
              });
              say(o, 'Follow a topic. The use case filters and sorts 5,000 articles.');
              el.append(h('div', { class: 'controls arc-fit' }, cmd('userData.follow("Sports")', follow), sw, dropped), tl, legend, o);
            },
          },
          {
            title: 'Test a use case with fakes',
            body: `
<p>A use case that takes repository interfaces in its constructor can be tested without Room, Retrofit or Hilt. Give it fakes backed by a <code>MutableStateFlow</code>, read the first value, change a fake, read again.</p>`,
            code: `class FakeUserDataRepository(followed: Set<String>) : UserDataRepository {
    private val topics = MutableStateFlow(followed)
    override fun observeFollowedTopics(): Flow<Set<String>> = topics
    fun follow(topic: String) = topics.update { it + topic }
}

@Test
fun feedKeepsOnlyFollowedTopics() = runTest {
    val news = FakeNewsRepository(listOf(article(1, "Kotlin"), article(2, "Sports")))
    val user = FakeUserDataRepository(followed = setOf("Kotlin"))
    val getFeed = GetPersonalizedFeedUseCase(news, user, StandardTestDispatcher(testScheduler))

    assertEquals(listOf(1), getFeed().first().map { it.id })

    user.follow("Sports")
    assertEquals(setOf(1, 2), getFeed().first().map { it.id }.toSet())
}`,
          },
        ],
        underHood: {
          body: `
<p><code>getFeed()</code> is plain syntax. The compiler turns it into <code>getFeed.invoke()</code>, an ordinary method call with no reflection and no extra object.</p>
<p>A use case with an <code>@Inject</code> constructor and no scope annotation is <b>unscoped</b>. Dagger generates a factory for it, and every time a ViewModel asks for one, the factory builds a new instance from the providers of its dependencies. So <code>ForYouViewModel</code> and <code>TopStoriesViewModel</code> each get their own copy. That is fine, and cheap, as long as the use case keeps no state of its own.</p>`,
          code: `// Generated by Dagger (simplified)
public final class GetPersonalizedFeedUseCase_Factory implements Factory<GetPersonalizedFeedUseCase> {
  @Override public GetPersonalizedFeedUseCase get() {
    return newInstance(newsProvider.get(), userDataProvider.get());
  }
}`,
        },
        mistakes: [
          {
            title: 'Keeping state inside a use case',
            bad: `class GetFeedUseCase @Inject constructor(private val news: NewsRepository) {
    private var cache: List<Article>? = null

    suspend operator fun invoke() = cache ?: news.latest().also { cache = it }
}`,
            good: `class GetFeedUseCase @Inject constructor(private val news: NewsRepository) {
    operator fun invoke(): Flow<List<Article>> = news.observeNews()
}
// the cache lives in the repository, the single source of truth`,
            why: 'An unscoped use case is a new object for each ViewModel, so each one keeps its own stale copy. Data belongs in the repository, which the whole app shares.',
          },
          {
            title: 'Returning UI types from the domain',
            bad: `class GetFeedUseCase @Inject constructor(...) {
    operator fun invoke(): Flow<NewsUiState> = ...
}`,
            good: `class GetFeedUseCase @Inject constructor(...) {
    operator fun invoke(): Flow<List<Article>> = ...
}
// each ViewModel maps articles to its own UiState`,
            why: 'A use case that returns one screen’s UiState can’t be shared with a second screen, and the domain layer now changes whenever a screen does.',
          },
          {
            title: 'Fire-and-forget work inside invoke',
            bad: `class RefreshFeedUseCase @Inject constructor(private val news: NewsRepository) {
    operator fun invoke() {
        GlobalScope.launch { news.refresh() }
    }
}`,
            good: `class RefreshFeedUseCase @Inject constructor(private val news: NewsRepository) {
    suspend operator fun invoke() = news.refresh()
}
// the caller decides the scope: viewModelScope, or WorkManager for work that must finish`,
            why: 'The caller can’t wait for it, cancel it or see its errors, and it keeps running after the screen is gone. A <code>suspend</code> function lets the caller own the coroutine.',
          },
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
          { q: 'Most refreshes finish in about 150 ms, and the spinner blinks on and off. What fits best?', options: ['Remove the spinner', 'Show the spinner only after a short delay, and cancel that when the load finishes', 'Always keep the spinner up for 2 s'], a: 1, why: 'Fast loads then show no spinner at all, and slow loads still show progress.' },
          { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">val state = repo.stories()\n    .map { UiState.Content(it) }\n    .stateIn(viewModelScope, WhileSubscribed(5_000), UiState.Empty)</pre>What does the user see on every open?', options: ['A spinner', 'A flash of “No stories yet” before the stories appear', 'Nothing until the stories arrive'], a: 1, why: 'The screen draws the initial value before the first result. Start with UiState.Loading instead of Empty.' },
        ],
        deeper: [
          {
            title: 'Don’t flash a spinner for a fast load',
            body: `
<p>Most refreshes answer in a few hundred milliseconds. A spinner that appears for 120 ms and vanishes reads as a glitch, and the list behind it jumps twice. Wait a little before showing it. If the data arrives first, the user never sees a spinner at all.</p>
<p>Start a second coroutine that sets <code>isLoading</code> after a short <code>delay</code>, and cancel it when the load finishes. Slow loads still show progress. Some apps also keep the spinner up for a minimum time once it appears, for the same reason.</p>`,
            code: `fun refresh() = viewModelScope.launch {
    val spinner = launch {
        delay(300)          // a fast load finishes first and never shows it
        _uiState.update { it.copy(isLoading = true) }
    }
    try {
        val items = repository.latest()
        _uiState.update { it.copy(items = items, errorMessage = null) }
    } catch (e: IOException) {
        _uiState.update { it.copy(errorMessage = "No connection") }
    } finally {
        spinner.cancel()
        _uiState.update { it.copy(isLoading = false) }
    }
}`,
            visual(el) {
              const D = 300, ITEMS = ['Compose tips', 'Derby tonight', 'Kotlin 2.3 notes'];
              let delayOn = false, busy = false;
              const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Screen preview' });
              const strip = h('div', { class: 'arc-d2-strip' });
              const o = out();
              const show = kind => phone.replaceChildren(...(kind === 'spin'
                ? [h('div', { class: 'arc-center' }, h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…'))]
                : ITEMS.map(t => h('div', { class: 'item arc-small' }, t))));
              async function load(ms) {
                if (busy) return; busy = true;
                strip.replaceChildren(h('span', { class: 'arc-d2-seg arc-d2-old', style: 'flex-basis:100%' }, 'refreshing…'));
                say(o, `<span class="muted">refresh() started. The repository answers in ${ms} ms…</span>`);
                const segs = [];
                if (!delayOn) {
                  show('spin');
                  await sleep(ms); if (!o.isConnected) return;
                  segs.push(['spin', ms]);
                } else if (ms <= D) {
                  await sleep(ms); if (!o.isConnected) return;
                  segs.push(['old', ms]);
                } else {
                  await sleep(D); if (!o.isConnected) return;
                  show('spin');
                  await sleep(ms - D); if (!o.isConnected) return;
                  segs.push(['old', D], ['spin', ms - D]);
                }
                show('items'); replay(phone, 'pop-soft');
                segs.push(['content', 500]);
                const total = segs.reduce((a, x) => a + x[1], 0);
                const flash = !delayOn && ms < D;
                strip.replaceChildren(...segs.map(([k, t]) => h('span', {
                  class: `arc-d2-seg drop-in ${k === 'spin' ? (flash ? 'arc-d2-flash' : 'arc-d2-spin') : k === 'old' ? 'arc-d2-old' : 'arc-d2-content'}`,
                  style: `flex-basis:${t / total * 100}%`, title: k === 'content' ? 'new list' : `${k === 'spin' ? 'spinner' : 'old list'} ${t} ms`,
                }, k === 'content' ? 'new list' : `${t} ms`)));
                say(o, flash ? '<span class="bad">flicker:</span> the spinner showed for 120 ms. Too short to read, so it looks like a glitch.'
                  : delayOn && ms <= D ? '<span class="good">no flicker:</span> the data came back before 300 ms, so the spinner never appeared. The old list stayed until the new one replaced it.'
                  : delayOn ? '<span class="good">spinner after 300 ms:</span> slow loads still show progress, fast ones never flash.'
                  : '<span class="muted">A 1.5 s spinner is fine. The problem is only the very short one.</span>');
                busy = false;
              }
              const sw = switchEl('arc-d2-uis-delay', 'wait 300 ms before the spinner', false, i => {
                if (busy) { i.checked = delayOn; return; }
                delayOn = i.checked;
                say(o, delayOn ? 'The spinner now waits 300 ms. Try the fast load again.' : 'The spinner shows the moment loading starts.');
              });
              show('items');
              strip.append(h('span', { class: 'arc-d2-seg arc-d2-content', style: 'flex-basis:100%' }, 'list on screen'));
              say(o, 'Refresh twice: once fast, once slow. The strip records what the screen showed.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('refresh() // 120 ms', () => load(120)), cmd('refresh() // 1.5 s', () => load(1500)), sw),
                h('div', { class: 'arc-udf' }, phone, h('div', { class: 'arc-col' },
                  h('div', { class: 'arc-cap' }, 'what the screen showed, in order'), strip,
                  h('div', { class: 'legend' },
                    h('span', {}, h('i', { class: 'arc-d2-seg arc-d2-old' }), 'old list'),
                    h('span', {}, h('i', { class: 'arc-d2-seg arc-d2-spin' }), 'spinner'),
                    h('span', {}, h('i', { class: 'arc-d2-seg arc-d2-flash' }), 'spinner flash'),
                    h('span', {}, h('i', { class: 'arc-d2-seg arc-d2-content' }), 'new list')))),
                o);
            },
          },
          {
            title: 'One screen, several loads: give each section its own state',
            body: `
<p>A home screen often loads news and weather from two sources. With one <code>isLoading</code> and one <code>errorMessage</code> for the whole screen, a failed weather call hides the news that loaded fine.</p>
<p>Give each section its own small state: loading, ready or failed. The screen draws what it has, and the broken part gets its own message and retry button. A generic <code>SectionState&lt;T&gt;</code> keeps the pattern short.</p>`,
            code: `sealed interface SectionState<out T> {
    data object Loading : SectionState<Nothing>
    data class Ready<T>(val data: T) : SectionState<T>
    data class Failed(val message: String) : SectionState<Nothing>
}

data class HomeUiState(
    val news: SectionState<List<Article>> = SectionState.Loading,
    val weather: SectionState<Forecast> = SectionState.Loading,
)

fun retryWeather() = viewModelScope.launch {
    _uiState.update { it.copy(weather = SectionState.Loading) }
    val next = try {
        SectionState.Ready(weatherRepository.today())
    } catch (e: IOException) {
        SectionState.Failed("Weather unavailable")
    }
    _uiState.update { it.copy(weather = next) }
}`,
            visual(el) {
              let split = true, busy = false, news = 'Ready', weather = 'Ready';
              const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Home screen preview' });
              const slot = h('div', { class: 'arc-stateslot' });
              const o = out();
              const sec = (title, st, body) => h('div', { class: 'arc-d2-sec' + (st === 'Failed' ? ' bad' : '') }, h('b', {}, title),
                st === 'Loading' ? h('div', { class: 'spinner arc-d2-spin-s' })
                  : st === 'Failed' ? h('span', {}, `Couldn’t load ${title.toLowerCase()}. `, h('span', { class: 'arc-retry' }, 'Retry'))
                    : body);
              function paint(changed = []) {
                const failed = news === 'Failed' || weather === 'Failed', loading = news === 'Loading' || weather === 'Loading';
                if (!split && loading) phone.replaceChildren(h('div', { class: 'arc-center' }, h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')));
                else if (!split && failed) phone.replaceChildren(h('div', { class: 'arc-center' }, h('div', { class: 'err-icon' }, '!'), h('p', { class: 'phone-note' }, 'Something went wrong'), h('span', { class: 'arc-retry' }, 'Retry')));
                else phone.replaceChildren(
                  sec('Weather', weather, h('span', {}, '18° and sunny')),
                  sec('News', news, h('div', { class: 'arc-mini' }, ['Compose tips', 'Derby tonight', 'Title race'].map(t => h('span', {}, t)))));
                swapIn(slot, split
                  ? stateCard('HomeUiState', [['news', news], ['weather', weather]], changed, true)
                  : stateCard('HomeUiState', [['isLoading', loading], ['errorMessage', failed ? '"Weather unavailable"' : 'null'], ['items', news === 'Ready' ? '[3 articles]' : '[]']], changed, true));
              }
              async function load(weatherFails) {
                if (busy) return; busy = true;
                news = 'Loading'; weather = 'Loading'; paint(split ? ['news', 'weather'] : ['isLoading']);
                say(o, '<span class="muted">loading news and weather in parallel…</span>');
                await sleep(600); if (!o.isConnected) return;
                news = 'Ready'; paint(split ? ['news'] : ['items']);
                await sleep(500); if (!o.isConnected) return;
                weather = weatherFails ? 'Failed' : 'Ready';
                paint(split ? ['weather'] : ['isLoading', 'errorMessage']); replay(phone, weatherFails ? 'shake' : 'pop-soft');
                say(o, !weatherFails ? '<span class="good">both loaded.</span>'
                  : split ? '<span class="good">partial failure:</span> news is on screen. Only the weather card shows an error and a retry.'
                    : '<span class="bad">all or nothing:</span> one error flag for the whole screen. The news loaded fine, but the error screen hides it.');
                busy = false;
              }
              async function retry() {
                if (busy) return;
                if (!split) { load(false); return; }
                busy = true;
                weather = 'Loading'; paint(['weather']);
                say(o, '<span class="muted">retryWeather(): only the weather section reloads…</span>');
                await sleep(700); if (!o.isConnected) return;
                weather = 'Ready'; paint(['weather']); replay(phone, 'pop-soft');
                say(o, '<span class="good">weather is back.</span> The news section never reloaded or flickered.');
                busy = false;
              }
              const sw = switchEl('arc-d2-uis-split', 'a state per section', true, i => {
                if (busy) { i.checked = split; return; }
                split = i.checked; paint();
                say(o, split ? 'Each section has its own state.' : 'One isLoading and one errorMessage for the whole screen.');
              });
              paint();
              say(o, 'Load the screen with a failing weather service, in both models.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('load() // weather fails', () => load(true)), cmd('load() // both work', () => load(false)), cmd('retryWeather()', retry), sw),
                h('div', { class: 'arc-udf' }, phone, h('div', { class: 'arc-col' }, slot)),
                o);
            },
          },
        ],
        underHood: {
          body: `
<p><code>LaunchedEffect(message)</code> starts a coroutine when it enters the composition and cancels it when it leaves, or when <code>message</code> changes. Rotate while a snackbar is up and the old composition leaves. Its coroutine is cancelled inside <code>showSnackbar</code>, so <code>userMessageShown()</code> never runs. The message is still in UiState, and the new composition shows it again. Nothing is lost, and nothing shows twice once it was acknowledged.</p>
<p><code>SnackbarHostState</code> guards <code>showSnackbar</code> with a <code>Mutex</code>. A second call waits until the current snackbar is dismissed, so two messages queue instead of overlapping.</p>`,
        },
        mistakes: [
          {
            title: 'An initial value that claims the list is empty',
            bad: `val uiState = repository.observeNews()
    .map { if (it.isEmpty()) FeedUiState.Empty else FeedUiState.Success(it) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FeedUiState.Empty)`,
            good: `val uiState = repository.observeNews()
    .map { if (it.isEmpty()) FeedUiState.Empty else FeedUiState.Success(it) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FeedUiState.Loading)`,
            why: 'The screen draws the initial value before the first query result arrives. With <code>Empty</code> it flashes “No stories yet” on every open, even when there are stories.',
          },
          {
            title: 'No catch before stateIn',
            bad: `val uiState: StateFlow<FeedUiState> = repository.observeNews()
    .map<List<Article>, FeedUiState> { FeedUiState.Success(it) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FeedUiState.Loading)`,
            good: `val uiState: StateFlow<FeedUiState> = repository.observeNews()
    .map<List<Article>, FeedUiState> { FeedUiState.Success(it) }
    .catch { emit(FeedUiState.Error(it.message ?: "Could not load")) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FeedUiState.Loading)`,
            why: 'An exception in the upstream flow ends the collection inside <code>viewModelScope</code>, which has no handler, so the app crashes. <code>catch</code> turns it into an error state the screen can draw.',
          },
          {
            title: 'Catching Exception turns cancellation into an error',
            bad: `fun load() = viewModelScope.launch {
    try {
        _uiState.update { it.copy(items = repository.latest()) }
    } catch (e: Exception) {
        _uiState.update { it.copy(errorMessage = "Something went wrong") }
    }
}`,
            good: `fun load() = viewModelScope.launch {
    try {
        _uiState.update { it.copy(items = repository.latest()) }
    } catch (e: IOException) {
        _uiState.update { it.copy(errorMessage = "No connection") }
    }
}`,
            why: 'Cancelling a coroutine throws <code>CancellationException</code> inside it. <code>catch (e: Exception)</code> swallows it, so cancelled work keeps going and records a fake error. Catch the specific failures, or rethrow <code>CancellationException</code>.',
          },
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
          { q: 'The user stars an article with no connection. Which order is right?', options: ['Write the star to Room marked pending → Room’s Flow updates the screen → WorkManager sends it when online → clear the pending flag', 'Send to the server → write to Room → update the screen', 'Update the UiState → send to the server → write to Room'], a: 0, why: 'The database is the source of truth for writes too. The screen updates at once, and the background job syncs later with retries.' },
          { q: 'A refresh calls <code>dao.upsertAll(serverRows)</code> while one row has a pending edit. What happens to the edit?', options: ['It is kept, upsert skips pending rows', 'It is overwritten by the server’s older copy and never sent', 'The refresh fails'], a: 1, why: 'A plain upsert replaces the row and its pending flag. Merge in one transaction and skip server rows whose local copy is still pending.' },
        ],
        deeper: [
          {
            title: 'User edits go to the database first',
            body: `
<p>The same rule holds for writes. When the user saves an article, the repository writes to Room right away and marks the row as pending. Room’s Flow emits, so the star lights up at once, even with no connection.</p>
<p>A background job sends pending rows to the server later. WorkManager runs it when the network is back, retries it with backoff when it fails, and keeps it across app restarts. When the server accepts the change, the job clears the pending flag.</p>`,
            code: `suspend fun toggleSave(id: Int) {
    dao.setSaved(id = id, saved = !dao.isSaved(id), pending = true)   // UI updates from Room now
    workManager.enqueueUniqueWork(
        "sync-saved",
        ExistingWorkPolicy.APPEND_OR_REPLACE,
        OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
            .build(),
    )
}

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted ctx: Context,
    @Assisted params: WorkerParameters,
    private val dao: ArticleDao,
    private val api: NewsApi,
) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result = try {
        dao.pending().forEach { api.setSaved(it.id, it.saved); dao.clearPending(it.id) }
        Result.success()
    } catch (e: IOException) {
        Result.retry()
    }
}`,
            visual(el) {
              let rows, server, online = true, busy = false;
              const body = h('div');
              const table = h('div', { class: 'arc-table' }, h('div', { class: 'arc-tname' }, 'Room · articles'),
                h('div', { class: 'arc-tr arc-th' }, h('span', {}, 'id'), h('span', {}, 'title'), h('span', {}, 'saved')), body);
              const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Screen preview' });
              const sList = h('div', { class: 'arc-mini' });
              const S = node('Server', 'saved articles on the account', sList);
              const W = node('SyncWorker', 'WorkManager, needs a network');
              const o = out();
              function paint(mark) {
                body.replaceChildren(...rows.map(r => h('div', { class: 'arc-tr' + (r.pending ? ' changed' : '') + (mark === r.id ? ' drop-in' : '') },
                  h('span', {}, String(r.id)), h('span', {}, r.pending ? `${r.title} · pending` : r.title), h('span', {}, r.saved ? '1' : '0'))));
                phone.replaceChildren(...rows.map(r => h('div', { class: 'item arc-row-item' }, h('span', {}, r.title),
                  h('button', { class: 'arc-star' + (r.saved ? ' on' : ''), 'aria-label': `Save ${r.title}`, onclick: () => toggle(r.id) }, r.saved ? '★' : '☆'))));
                sList.replaceChildren(...rows.map(r => h('span', { class: server[r.id] ? 'arc-new' : null }, `${r.id}: ${server[r.id] ? 'saved' : 'not saved'}`)));
              }
              function reset() {
                rows = [{ id: 1, title: 'Room notes', saved: false, pending: false }, { id: 2, title: 'Hilt guide', saved: false, pending: false }, { id: 3, title: 'KSP setup', saved: true, pending: false }];
                server = { 1: false, 2: false, 3: true };
              }
              function toggle(id) {
                if (busy) return;
                const r = rows.find(x => x.id === id);
                r.saved = !r.saved; r.pending = r.saved !== server[id];
                paint(id); replay(table, 'pop-soft'); replay(phone, 'pop-soft');
                const n = rows.filter(x => x.pending).length;
                say(o, `${hl(`dao.setSaved(${id}, ${r.saved}, pending = true)`)} <span class="muted">The star changed from Room right away. ${n} row${n === 1 ? '' : 's'} waiting to sync.</span>`);
              }
              async function sync() {
                if (busy) return; busy = true;
                clearAll([S, W]);
                W.classList.add('on'); tok(W, 'doWork()');
                await sleep(450); if (!el.isConnected) return;
                const pend = rows.filter(r => r.pending);
                if (!pend.length) { tok(W, 'Result.success()', 'arc-back'); W.classList.replace('on', 'ok'); say(o, 'Nothing pending. The job finished at once.'); busy = false; return; }
                if (!online) {
                  S.classList.add('bad'); tok(S, 'IOException', 'boom'); replay(S, 'shake');
                  await sleep(450); if (!el.isConnected) return;
                  W.classList.replace('on', 'bad'); tok(W, 'Result.retry()', 'boom');
                  say(o, `<span class="bad">offline:</span> the job asks to retry later with backoff. The ${pend.length} pending row${pend.length > 1 ? 's stay' : ' stays'} in Room, and the screen keeps showing the user’s choice.`);
                  busy = false; return;
                }
                for (const r of pend) {
                  S.classList.add('on'); tok(S, `PUT /saved/${r.id}`);
                  await sleep(550); if (!el.isConnected) return;
                  server[r.id] = r.saved; r.pending = false; paint(); replay(S, 'pop-soft');
                }
                S.classList.remove('on'); W.classList.replace('on', 'ok'); tok(W, 'Result.success()', 'arc-back');
                say(o, `<span class="good">synced:</span> the server accepted ${pend.length} change${pend.length > 1 ? 's' : ''} and the pending flags were cleared. The screen didn’t need to change.`);
                busy = false;
              }
              const sw = switchEl('arc-d-sync-net', 'Network on', true, i => {
                if (busy) { i.checked = online; return; }
                online = i.checked; clearAll([S, W]); S.classList.toggle('bad', !online);
                say(o, online ? 'Network back. WorkManager would start the sync now. Run it.' : 'Network off. Saving still works. Try it.');
              });
              reset(); paint();
              say(o, 'Tap a star on the phone, or run the commands. The screen only reads Room.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('toggleSave(2)', () => toggle(2)), cmd('SyncWorker.doWork()', sync), sw),
                h('div', { class: 'arc-flow' }, phone, h('span', { class: 'arrow' }, '→'), table, h('span', { class: 'arrow' }, '→'), W, h('span', { class: 'arrow' }, '→'), S),
                o);
            },
          },
          {
            title: 'A refresh must not overwrite pending edits',
            body: `
<p>Now two writers touch the same table: the refresh brings rows from the server, and the user’s edits wait to be synced. A plain <code>upsertAll</code> from the refresh replaces the row the user just changed with the server’s older copy. The star goes dark and the pending flag is gone, so the edit is never sent.</p>
<p>Merge instead. In one transaction, skip server rows whose local copy is still pending. Everything else updates as usual.</p>`,
            code: `@Dao
abstract class ArticleDao {
    @Query("SELECT id FROM articles WHERE pending = 1")
    abstract suspend fun pendingIds(): List<Int>

    @Upsert
    abstract suspend fun upsertAll(rows: List<ArticleEntity>)

    @Transaction
    open suspend fun mergeFromServer(remote: List<ArticleEntity>) {
        val pending = pendingIds().toSet()
        upsertAll(remote.filter { it.id !in pending })
    }
}`,
            visual(el) {
              let local, merge = true, busy = false;
              const REMOTE = [{ id: 1, title: 'Room notes v2', saved: false }, { id: 2, title: 'Hilt guide', saved: false }, { id: 3, title: 'KSP setup', saved: true }];
              const tbl = (name, bodyEl) => h('div', { class: 'arc-table' }, h('div', { class: 'arc-tname' }, name),
                h('div', { class: 'arc-tr arc-th' }, h('span', {}, 'id'), h('span', {}, 'title'), h('span', {}, 'saved')), bodyEl);
              const rBody = h('div'), lBody = h('div');
              const o = out();
              const row = (r, cls) => h('div', { class: 'arc-tr' + (cls ? ' ' + cls : '') }, h('span', {}, String(r.id)), h('span', {}, r.pending ? `${r.title} · pending` : r.title), h('span', {}, r.saved ? '1' : '0'));
              const paint = (marks = {}) => {
                rBody.replaceChildren(...REMOTE.map(r => row(r)));
                lBody.replaceChildren(...local.map(r => row(r, marks[r.id] || (r.pending ? 'changed' : ''))));
              };
              const reset = () => { local = [{ id: 1, title: 'Room notes', saved: false }, { id: 2, title: 'Hilt guide', saved: true, pending: true }, { id: 3, title: 'KSP setup', saved: true }]; };
              async function refresh() {
                if (busy) return; busy = true;
                const marks = {};
                let lost = false, kept = false;
                say(o, merge ? hl('dao.mergeFromServer(remote)') : hl('dao.upsertAll(remote)'));
                for (const r of REMOTE) {
                  const i = local.findIndex(x => x.id === r.id);
                  const mine = local[i];
                  await sleep(500); if (!el.isConnected) return;
                  if (merge && mine.pending) { marks[r.id] = 'changed'; kept = true; o.append(h('div', { class: 'line drop-in', html: `<span class="muted">row ${r.id}: pending, skipped</span>` })); }
                  else {
                    const changed = mine.title !== r.title || mine.saved !== r.saved;
                    if (mine.pending) lost = true;
                    local[i] = { ...r };
                    marks[r.id] = mine.pending ? 'bad' : changed ? 'added' : '';
                    o.append(h('div', { class: 'line drop-in', html: mine.pending ? `<span class="bad">row ${r.id}: replaced, the local edit is gone</span>` : `<span class="muted">row ${r.id}: ${changed ? 'updated' : 'same'}</span>` }));
                  }
                  paint(marks);
                }
                o.append(h('div', { class: 'line drop-in', html: lost
                  ? '<span class="bad">The user saved row 2, and the refresh undid it. Nothing is pending, so the save never reaches the server.</span>'
                  : kept ? '<span class="good">Row 1 got the new title. Row 2 kept the user’s save and is still pending.</span>' : '<span class="good">Nothing was pending, so every row took the server copy.</span>' }));
                busy = false;
              }
              function edit() {
                if (busy) return;
                const r = local.find(x => x.id === 2);
                r.saved = true; r.pending = true; paint();
                say(o, 'Row 2 is saved locally and pending again.');
              }
              const sw = switchEl('arc-d-merge', 'skip rows with pending edits', true, i => {
                if (busy) { i.checked = merge; return; }
                merge = i.checked;
                say(o, merge ? 'The refresh merges again.' : 'The refresh now upserts every server row. Run it with row 2 pending.');
              });
              reset(); paint();
              say(o, 'The user saved row 2 while offline. Now a refresh arrives with the server’s copy.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('repository.refresh()', refresh), cmd('toggleSave(2)', edit), sw),
                h('div', { class: 'arc-map' }, h('div', {}, h('div', { class: 'arc-cap' }, 'server response'), tbl('GET /articles', rBody)), h('div', {}, h('div', { class: 'arc-cap' }, 'on the device'), tbl('Room · articles', lBody))),
                o);
            },
          },
        ],
        underHood: {
          body: `
<p><code>stateIn(viewModelScope, WhileSubscribed(5_000), initial)</code> starts one coroutine in the ViewModel’s scope. It collects the repository Flow only while the <code>StateFlow</code> has a subscriber. When the last collector leaves, it waits 5 seconds before it cancels the upstream. A rotation takes far less than that, so the Room query keeps running and the new screen gets the current value at once.</p>
<p>While it collects, Room re-runs the query after each write transaction that touches the table, then emits the new list. The <code>StateFlow</code> compares it with the current value and drops it if it is equal, so a refresh that changed nothing doesn’t redraw the screen.</p>`,
        },
        mistakes: [
          {
            title: 'Putting the network result straight into the state',
            bad: `fun refresh() = viewModelScope.launch {
    val fresh = api.getLatest()
    _uiState.update { it.copy(items = fresh) }   // second source of truth
}`,
            good: `fun refresh() = viewModelScope.launch {
    repository.refresh()   // writes to Room; the observed Flow updates the state
}`,
            why: 'Now the screen has two writers. The next Room emission overwrites the network list, or the other way round, and the list flickers between them.',
          },
          {
            title: 'Handing Room entities to the UI',
            bad: `override fun observeNews(): Flow<List<ArticleEntity>> = dao.observeAll()`,
            good: `override fun observeNews(): Flow<List<Article>> =
    dao.observeAll().map { rows -> rows.map { it.toArticle() } }`,
            why: 'The UI then depends on table columns. Renaming a column or adding a sync flag forces changes in every screen. Map to a plain model at the repository boundary.',
          },
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
        id: 'hilt',
        title: 'Dependency injection with Hilt',
        tagline: 'Ask for a ViewModel. Hilt builds everything under it.',
        body: `
<p>A class shouldn’t build its own dependencies. It asks for them in its constructor, and something else hands them over. That something is Hilt.</p>
<p>Put <code>@Inject</code> on a constructor and Hilt knows how to build that class. For types you can’t annotate, like Retrofit or a Room database, write a <code>@Module</code> with <code>@Provides</code> functions. Use <code>@Binds</code> to say which implementation fills an interface. Hilt checks the whole graph at compile time, so a missing piece is a build error, not a crash.</p>
<p>Scopes decide how many instances exist. <code>@Singleton</code> means one for the whole app. A <code>@HiltViewModel</code> lives as long as its screen and survives rotation. The next lesson, Hilt components and scopes, covers every scope. Ask for a ViewModel below and watch the graph build bottom-up.</p>`,
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
          { q: 'You add two @Provides functions that both return CoroutineDispatcher: one for IO, one for Default. What happens?', options: ['Hilt picks the first one', 'The build fails with a duplicate binding error until you add qualifiers', 'Hilt injects a random one'], a: 1, why: 'Hilt finds a binding by type. A qualifier annotation becomes part of the key, so @IoDispatcher and @DefaultDispatcher are different bindings.' },
          { q: 'Formatter is unscoped. A class calls <code>get()</code> twice on a <code>Lazy&lt;Formatter&gt;</code> and twice on a <code>Provider&lt;Formatter&gt;</code>. How many Formatters are built?', options: ['1 from Lazy, 2 from Provider', '2 from each', '1 from each'], a: 0, why: 'A Lazy builds once and returns that same object after. A Provider asks Hilt on every get(), and an unscoped type is built each time.' },
        ],
        deeper: [
          {
            title: 'Two bindings of one type need a qualifier',
            body: `
<p>Hilt finds a binding by its type. If you provide two <code>CoroutineDispatcher</code>s, it can’t tell which one a constructor wants, and the build fails with a duplicate binding error.</p>
<p>A qualifier is an annotation that becomes part of the key. Put it on the <code>@Provides</code> function and on the constructor parameter. Injecting dispatchers this way also lets tests swap in a test dispatcher.</p>`,
            code: `@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class IoDispatcher

@Module
@InstallIn(SingletonComponent::class)
object DispatchersModule {
    @Provides @IoDispatcher
    fun io(): CoroutineDispatcher = Dispatchers.IO
}

class OfflineFirstNewsRepository @Inject constructor(
    private val dao: ArticleDao,
    @IoDispatcher private val io: CoroutineDispatcher,
) : NewsRepository`,
          },
          {
            title: 'Build it later, or build many: Lazy and Provider',
            body: `
<p>Hilt normally builds every constructor argument before your class exists. Ask for <code>Lazy&lt;T&gt;</code> instead and nothing is built until the first <code>get()</code>. Later calls on the same <code>Lazy</code> return that same object. It suits a heavy dependency that only one rare path needs.</p>
<p><code>Provider&lt;T&gt;</code> is different: every <code>get()</code> asks Hilt again. For an unscoped type that means a new instance each call. For a scoped type you get the one the component keeps. Both types come from <code>javax.inject</code> or <code>dagger</code>, not from Kotlin’s <code>lazy</code>.</p>`,
            code: `class ExportViewModel @Inject constructor(
    private val pdfWriter: dagger.Lazy<PdfWriter>,          // built on first get()
    private val rowBuilder: Provider<RowBuilder>,           // a new one per get()
) : ViewModel() {
    fun export(items: List<Article>) {
        val writer = pdfWriter.get()                         // first call builds it
        items.forEach { writer.add(rowBuilder.get().build(it)) }
    }
}`,
          },
        ],
        underHood: {
          body: `
<p>Hilt is a layer over Dagger. At build time it generates a Dagger component for each Hilt component and wires them as parent and child. The Gradle plugin rewrites <code>NewsApp</code> to extend a generated <code>Hilt_NewsApp</code>, which creates the singleton component, and each <code>@AndroidEntryPoint</code> class extends a generated base that injects its fields.</p>
<p>A scoped binding is stored in its component behind a thread-safe lazy holder, so the first request builds it and later ones get the same object. For <code>@HiltViewModel</code>, Hilt generates a map from ViewModel class to provider. <code>hiltViewModel()</code> uses a factory that creates a <code>ViewModelComponent</code> for the new ViewModel and picks its provider from that map. Nothing is looked up by reflection at runtime.</p>`,
        },
        mistakes: [
          {
            title: 'Using an injected field before super.onCreate()',
            bad: `@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var analytics: Analytics

    override fun onCreate(savedInstanceState: Bundle?) {
        analytics.track("open")
        super.onCreate(savedInstanceState)
    }
}`,
            good: `@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var analytics: Analytics

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        analytics.track("open")
    }
}`,
            why: 'Hilt injects Activity fields during <code>super.onCreate()</code>. Before that the field is empty and you get <code>UninitializedPropertyAccessException</code>.',
          },
          {
            title: 'Building dependencies by hand inside a class',
            bad: `@HiltViewModel
class NewsViewModel @Inject constructor() : ViewModel() {
    private val repository = OfflineFirstNewsRepository(NewsApiImpl(), FakeDao())
}`,
            good: `@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel()`,
            why: 'The ViewModel now picks concrete classes, skips the shared singletons, and can’t get a fake in tests. Ask for the interface in the constructor.',
          },
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

      // hilt-scopes ───────────────────────────────────
      {
        id: 'hilt-scopes',
        title: 'Hilt components and scopes',
        tagline: 'A scope ties one instance to one Android lifetime.',
        level: 'intermediate',
        body: `
<p>Hilt builds a tree of components, and each one lives as long as something on Android. <code>SingletonComponent</code> lives as long as the app process. <code>ActivityRetainedComponent</code> survives rotation and ends when the Activity finishes for real. <code>ViewModelComponent</code> belongs to one ViewModel. <code>ActivityComponent</code> is rebuilt every time the Activity object is recreated.</p>
<p>A scope annotation ties a class to one of them: <code>@Singleton</code>, <code>@ActivityRetainedScoped</code>, <code>@ViewModelScoped</code>, <code>@ActivityScoped</code>. Hilt then keeps one instance per component and reuses it until that component dies. Without a scope, Hilt builds a new instance every time someone asks.</p>
<p>A scope is a promise to keep an object in memory. Use one when the object holds state that several classes must share, needs synchronization, or is measured to be expensive to build. Leave everything else unscoped. Fire the events below and watch which instances survive.</p>`,
        code: `@Singleton
class Analytics @Inject constructor()                    // one per app process

@ActivityRetainedScoped
class CheckoutSession @Inject constructor()              // survives rotation

@ViewModelScoped
class SearchCache @Inject constructor()                  // one per ViewModel

@ActivityScoped
class PermissionHelper @Inject constructor(
    private val activity: Activity,                      // safe: dies with the Activity
)

class PriceFormatter @Inject constructor()               // no scope: new on every request`,
        remember: 'Scope state to the shortest lifetime that needs it; leave stateless classes unscoped.',
        terms: [
          { term: 'Hilt component', def: 'A generated container of bindings tied to an Android lifetime, such as SingletonComponent or ViewModelComponent.' },
          { term: 'Scope annotation', def: 'An annotation like @Singleton or @ViewModelScoped that makes Hilt keep one instance per component instead of building a new one per request.' },
          { term: '@ActivityRetainedScoped', def: 'The scope of ActivityRetainedComponent, which survives configuration changes and ends when the Activity finishes.' },
          { term: 'Unscoped binding', def: 'The default: Hilt builds a new instance for every injection point that asks for it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep one cache per ViewModel, provided from a module in the matching component.', code: '@Module\n@InstallIn([[ViewModelComponent]]::class)\nobject SearchModule {\n    @Provides @[[ViewModelScoped]]\n    fun cache(): SearchCache = SearchCache(maxEntries = 50)\n}', why: 'A module’s scoped bindings must use the scope of the component it is installed in. ViewModelComponent pairs with <code>@ViewModelScoped</code>.' },
          { type: 'bug', prompt: 'Every new search screen opens with the last screen’s results, and memory grows all session. Tap the line.', code: '@Singleton\nclass SearchCache @Inject constructor() {\n    val results = mutableMapOf<String, List<Article>>()\n}\n\n@HiltViewModel\nclass SearchViewModel @Inject constructor(\n    private val cache: SearchCache,\n) : ViewModel()', bug: 0, fix: '@ViewModelScoped', why: '<code>@Singleton</code> keeps one cache for the whole process, so every screen shares it and nothing is freed. <code>@ViewModelScoped</code> gives each ViewModel its own cache and frees it with the ViewModel.' },
        ],
        quiz: [
          { q: 'The user rotates the phone. Which scoped object is built again?', options: ['@Singleton', '@ActivityRetainedScoped', '@ViewModelScoped', '@ActivityScoped'], a: 3, why: 'Rotation recreates the Activity object, so ActivityComponent is rebuilt. The retained and ViewModel components survive configuration changes.' },
          { q: 'An unscoped <code>PriceFormatter</code> is injected into two classes. How many instances exist?', options: ['1', '2'], a: 1, why: 'Unscoped is the default, and it means a new instance per request.' },
          { q: 'A <code>@HiltViewModel</code> asks for an <code>@ActivityScoped</code> helper. What happens?', options: ['It gets the current Activity’s helper', 'The build fails', 'It gets a new helper each time'], a: 1, why: 'ViewModelComponent is not a child of ActivityComponent. The ViewModel outlives every Activity object, so Hilt refuses the binding at compile time.' },
          { q: 'A module has <code>@InstallIn(ViewModelComponent::class)</code> and a <code>@Singleton @Provides</code> function. What happens?', options: ['It works, @Singleton wins', 'The build fails because the scope does not match the component', 'The object is rebuilt on every injection'], a: 1, why: 'A scoped binding must use its component’s scope, here @ViewModelScoped. Hilt reports a mismatch at build time.' },
          { q: 'A binding lives in a module installed in ActivityComponent, with no scope. A @HiltViewModel asks for it. What happens?', options: ['It works, unscoped bindings are visible everywhere', 'The build fails, ViewModelComponent cannot see ActivityComponent bindings', 'It works only after rotation'], a: 1, why: 'A component sees bindings from itself and its parents. ActivityComponent is not a parent of ViewModelComponent, so the binding is invisible there.' },
        ],
        deeper: [
          {
            title: 'Dependencies come from your own scope or a longer one',
            body: `
<p>A component can use bindings from itself and from its parents, never from a child or a sibling. A ViewModel can get <code>@Singleton</code> and <code>@ActivityRetainedScoped</code> objects. It can’t get an <code>@ActivityScoped</code> one, because the ViewModel outlives every Activity object it ever sees.</p>
<p>Hilt checks this at build time. Pick who is asking and what it asks for, then build.</p>`,
            visual(el) {
              const C = {
                app: { name: 'SingletonComponent', up: null },
                ret: { name: 'ActivityRetainedComponent', up: 'app' },
                vm: { name: 'ViewModelComponent', up: 'ret' },
                act: { name: 'ActivityComponent', up: 'ret' },
              };
              const ASK = [['app', '@Singleton NewsRepository'], ['vm', 'NewsViewModel'], ['act', 'MainActivity']];
              const DEP = [['app', '@Singleton', 'Analytics'], ['ret', '@ActivityRetainedScoped', 'CheckoutSession'], ['vm', '@ViewModelScoped', 'SearchCache'], ['act', '@ActivityScoped', 'PermissionHelper']];
              let ask = 1, dep = 3, busy = false;
              for (const c of Object.values(C)) c.el = node(c.name, null);
              const all = Object.values(C).map(c => c.el);
              const o = out();
              const toggle = (label, fn) => h('button', { class: 'cmd', onclick: fn }, label);
              const press = (btns, i) => btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
              const askBtns = ASK.map(([, label], i) => toggle(label, () => { if (busy) return; ask = i; press(askBtns, i); clearAll(all); }));
              const depBtns = DEP.map(([, ann, cls], i) => toggle(`${ann} ${cls}`, () => { if (busy) return; dep = i; press(depBtns, i); clearAll(all); }));
              const chain = k => { const xs = []; for (let c = k; c; c = C[c].up) xs.push(c); return xs; };
              async function build() {
                if (busy) return; busy = true;
                clearAll(all);
                const [from, who] = ASK[ask], [to, ann, cls] = DEP[dep];
                say(o, `<span class="muted">${who} asks for ${cls}…</span>`);
                for (const k of chain(from)) {
                  C[k].el.classList.add(k === from ? 'on' : 'ask'); tok(C[k].el, k === from ? 'asks here' : 'visible');
                  await sleep(380); if (!el.isConnected) return;
                }
                const ok = chain(from).includes(to);
                C[to].el.classList.remove('ask', 'on'); C[to].el.classList.add(ok ? 'ok' : 'bad');
                tok(C[to].el, `${ann} ${cls}`, ok ? 'arc-back' : 'boom');
                if (!ok) replay(C[to].el, 'shake');
                await sleep(300); if (!el.isConnected) return;
                say(o, ok
                  ? `<span class="good">builds:</span> ${C[to].name} is ${to === from ? 'the same component' : 'a parent'} of ${C[from].name}, so the instance lives at least as long as ${who}.`
                  : `<span class="bad">error: [Dagger/IncompatiblyScopedBindings]</span> ${C[from].name} … may not reference bindings with different scopes: ${ann} class ${cls} <span class="muted">(shortened). ${C[to].name} is not above ${C[from].name}, so the object could die before ${who} does.</span>`);
                busy = false;
              }
              press(askBtns, ask); press(depBtns, dep);
              const row = (...ks) => h('div', { class: 'arc-row' }, ks.map(k => C[k].el));
              const up = () => h('div', { class: 'arc-dir' }, '↑ parent');
              say(o, 'Pick who asks and what it asks for, then build.');
              el.append(
                h('div', { class: 'controls arc-fit' }, h('span', { class: 'arc-cap' }, 'who asks'), askBtns),
                h('div', { class: 'controls arc-fit' }, h('span', { class: 'arc-cap' }, 'what it needs'), depBtns),
                h('div', { class: 'controls arc-fit' }, cmd('build()', build)),
                h('div', { class: 'arc-graph' }, row('app'), up(), row('ret'), up(), row('vm', 'act')),
                o);
            },
          },
          {
            title: 'Each component hands out a few objects for free',
            body: `
<p>Every component comes with default bindings you can ask for without a module. <code>SingletonComponent</code> gives you the <code>Application</code>, also as <code>@ApplicationContext Context</code>. <code>ActivityComponent</code> adds the <code>Activity</code> and <code>@ActivityContext</code>. <code>ViewModelComponent</code> gives you the ViewModel’s <code>SavedStateHandle</code>.</p>
<p>A component also sees its parents’ defaults. That is why a <code>@ViewModelScoped</code> helper can read the screen’s navigation arguments from <code>SavedStateHandle</code> without the ViewModel passing them down.</p>`,
            code: `@ViewModelScoped
class ArticleIdHolder @Inject constructor(
    savedStateHandle: SavedStateHandle,       // free in ViewModelComponent
) {
    val articleId: String = checkNotNull(savedStateHandle["articleId"])
}

@HiltViewModel
class ArticleViewModel @Inject constructor(
    private val ids: ArticleIdHolder,
    private val repository: NewsRepository,
) : ViewModel()`,
          },
          {
            title: 'A module’s scope must match its component',
            body: `
<p><code>@InstallIn</code> puts a module’s bindings into one component. A scoped <code>@Provides</code> in that module must use that component’s scope: <code>@Singleton</code> in <code>SingletonComponent</code>, <code>@ViewModelScoped</code> in <code>ViewModelComponent</code>, and so on. A mismatch is a build error.</p>
<p>The same component also decides who can see the binding. A module installed in <code>ActivityComponent</code> is invisible to ViewModels and singletons, even when its function is unscoped.</p>`,
            code: `@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton                       // matches SingletonComponent
    fun okHttp(): OkHttpClient = OkHttpClient()
}

@Module
@InstallIn(ActivityComponent::class)
object ActivityModule {
    @Provides @Singleton                       // build error: wrong scope for this component
    fun helper(activity: Activity): PermissionHelper = PermissionHelper(activity)
}`,
          },
        ],
        underHood: {
          body: `
<p>Hilt generates one Dagger component per Hilt component and links them as parent and child. A child component can call into its parent, which is how a ViewModel reaches a singleton. A parent has no reference to its children, so the reverse lookup can’t exist.</p>
<p>A scoped binding is stored in its component behind a thread-safe lazy holder. The first request builds the object, and later requests from the same component get the same one. When Android ends the lifetime, Hilt drops the component, and every object scoped to it becomes garbage with it.</p>`,
        },
        mistakes: [
          {
            title: 'Making everything @Singleton',
            bad: `@Singleton
class PriceFormatter @Inject constructor()

@Singleton
class SearchCache @Inject constructor()   // keeps every search forever`,
            good: `class PriceFormatter @Inject constructor()        // stateless: no scope

@ViewModelScoped
class SearchCache @Inject constructor()   // freed with its ViewModel`,
            why: 'A scope is a promise to keep an object alive. Stateless classes are cheap to build, so leave them unscoped. Scope state to the shortest lifetime that needs it.',
          },
          {
            title: 'Expecting @ActivityScoped to survive rotation',
            bad: `@ActivityScoped
class CheckoutSession @Inject constructor() {
    val items = mutableListOf<CartItem>()     // emptied on every rotation
}`,
            good: `@ActivityRetainedScoped
class CheckoutSession @Inject constructor() {
    val items = mutableListOf<CartItem>()     // survives rotation
}`,
            why: 'ActivityComponent is rebuilt with each Activity object. For state that must outlive a configuration change, use the retained component, or keep the state in a ViewModel.',
          },
        ],
        visual(el) {
          const R = [
            { k: 'app', ann: '@Singleton', cls: 'Analytics', life: 'SingletonComponent · the app process' },
            { k: 'ret', ann: '@ActivityRetainedScoped', cls: 'CheckoutSession', life: 'ActivityRetainedComponent · until the Activity finishes' },
            { k: 'vm', ann: '@ViewModelScoped', cls: 'SearchCache', life: 'ViewModelComponent · one ViewModel' },
            { k: 'act', ann: '@ActivityScoped', cls: 'PermissionHelper', life: 'ActivityComponent · one Activity object' },
            { k: 'none', ann: '(no scope)', cls: 'PriceFormatter', life: 'no component keeps it · new for every request' },
          ];
          const EV = {
            nav: { label: 'navigate(Search)', renew: ['vm', 'none'], msg: 'A new screen made a new ViewModel. The ViewModel-scoped object is new, and so is every unscoped one it asked for.' },
            rot: { label: 'rotate()', renew: ['act', 'none'], msg: 'The Activity object was rebuilt, so its scoped helper is new. The retained and ViewModel scopes survived. The unscoped formatter is always new.' },
            fin: { label: 'finish(); relaunch()', renew: ['ret', 'vm', 'act', 'none'], msg: 'The Activity finished for real. Everything below the app scope is gone. Analytics stayed.' },
            die: { label: 'process death', renew: ['app', 'ret', 'vm', 'act', 'none'], msg: 'A new process starts from nothing. Even the singleton is new.' },
          };
          let busy = false;
          const rows = R.map(r => Object.assign(r, { inst: addr(), el: node(`${r.ann} ${r.cls}`, r.life) }));
          const o = out();
          const chip = (r, fresh) => r.el.box.replaceChildren(h('span', { class: `chip ${fresh ? 'drop-in' : 'arc-reused pop'}` }, `${r.inst} ${fresh ? 'new' : 'kept'}`));
          async function fire(k) {
            if (busy) return; busy = true;
            const ev = EV[k];
            clearAll(rows.map(r => r.el));
            rows.forEach(r => r.el.box.replaceChildren(h('span', { class: 'chip arc-old' }, r.inst)));
            say(o, hl(ev.label));
            for (const r of rows) {
              await sleep(320); if (!el.isConnected) return;
              const fresh = ev.renew.includes(r.k);
              if (fresh) r.inst = addr();
              r.el.classList.add(fresh ? 'on' : 'ok');
              chip(r, fresh);
            }
            o.append(h('div', { class: 'line drop-in', html: `<span class="muted">${ev.msg}</span>` }));
            busy = false;
          }
          rows.forEach(r => chip(r, true));
          say(o, 'The app is running with one screen. Fire an event.');
          el.append(
            h('div', { class: 'controls arc-fit' }, Object.entries(EV).map(([k, ev]) => cmd(ev.label, () => fire(k)))),
            h('div', { class: 'arc-col' }, rows.map(r => r.el)),
            o);
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
          { q: 'Bookmarks needs to know which articles News has downloaded. Where do the pieces go?', options: ['An interface in :feature:news:api, bound with @Binds in :feature:news:impl', 'Bookmarks depends on :feature:news:impl', 'Copy the download code into Bookmarks'], a: 0, why: 'Bookmarks injects the interface and compiles without the implementation. Hilt checks that the binding exists when it builds the graph in :app.' },
          { q: 'Every feature depends on one :core:common. You change a date formatter in it. What does Gradle do?', options: ['Recompiles only the features that format dates', 'Reruns the compile task of every feature', 'Recompiles only :core:common'], a: 1, why: 'Every feature depends on the changed module, so all of them compile again. Split core by purpose so a change reaches only its users.' },
        ],
        deeper: [
          {
            title: 'Share a service, not a screen: interface in api, binding in impl',
            body: `
<p>Sometimes a feature needs data, not navigation. Bookmarks wants to show which articles are downloaded, and downloads belong to News. Put a small interface in <code>:feature:news:api</code> and bind the real class in <code>:feature:news:impl</code> with Hilt’s <code>@Binds</code>. Bookmarks injects the interface and never sees the class behind it.</p>
<p>Bookmarks compiles on its own, because it only needs the interface. Whether a binding exists is checked when Hilt builds the graph in <code>:app</code>. Leave news:impl out of <code>:app</code> and that build fails, with a clear error.</p>`,
            code: `// :feature:news:api
interface ArticleDownloads {
    fun isDownloaded(id: Int): Flow<Boolean>
}

// :feature:news:impl
class RoomArticleDownloads @Inject constructor(
    private val dao: DownloadDao,
) : ArticleDownloads {
    override fun isDownloaded(id: Int) = dao.observeExists(id)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class NewsBindingsModule {
    @Binds abstract fun downloads(impl: RoomArticleDownloads): ArticleDownloads
}

// :feature:bookmarks:impl, knows only the interface
@HiltViewModel
class BookmarksViewModel @Inject constructor(
    downloads: ArticleDownloads,
) : ViewModel()`,
            visual(el) {
              let withImpl = true, busy = false;
              const bm = node('BookmarksViewModel', ':feature:bookmarks:impl');
              const api = node('ArticleDownloads', ':feature:news:api · interface');
              const impl = node('RoomArticleDownloads', ':feature:news:impl · @Binds');
              const app = node('SingletonComponent', ':app · Hilt builds the graph here');
              const nodes = [bm, api, impl, app];
              const o = out();
              const calm = () => nodes.forEach(n => { n.classList.remove('on', 'ok', 'bad'); n.box.replaceChildren(); });
              const paint = () => impl.classList.toggle('arc-d2-off', !withImpl);
              async function step(n, text, cls, kind = 'on') {
                n.classList.add(kind); tok(n, text, cls);
                await sleep(520);
                return o.isConnected;
              }
              async function compileFeature() {
                if (busy) return; busy = true;
                calm();
                say(o, '<span class="muted">compiling :feature:bookmarks:impl…</span>');
                if (!await step(bm, 'needs ArticleDownloads')) return;
                if (!await step(api, 'interface found', 'arc-back', 'ok')) return;
                bm.classList.remove('on'); bm.classList.add('ok');
                say(o, `<span class="good">BUILD SUCCESSFUL:</span> bookmarks only needs the interface from news:api. ${withImpl ? '' : 'It compiles even now, without news:impl in :app. '}Who implements it is :app’s problem.`);
                busy = false;
              }
              async function buildApp() {
                if (busy) return; busy = true;
                calm();
                say(o, '<span class="muted">./gradlew :app:assembleDebug, Hilt collects every @InstallIn module on the classpath…</span>');
                if (!await step(app, 'collecting modules')) return;
                if (!await step(bm, 'asks for ArticleDownloads')) return;
                if (!await step(api, 'who implements me?')) return;
                if (withImpl) {
                  if (!await step(impl, '@Binds → RoomArticleDownloads', 'arc-back', 'ok')) return;
                  [bm, api, app].forEach(n => { n.classList.remove('on'); n.classList.add('ok'); });
                  tok(bm, 'gets RoomArticleDownloads', 'arc-back');
                  say(o, '<span class="good">BUILD SUCCESSFUL:</span> NewsBindingsModule came in through news:impl, so Hilt found the binding. Bookmarks still never named the class.');
                } else {
                  app.classList.remove('on'); app.classList.add('bad'); tok(app, 'MissingBinding', 'boom'); replay(app, 'shake');
                  say(o, '<span class="bad">error: [Dagger/MissingBinding]</span> ArticleDownloads cannot be provided without an @Provides-annotated method. <span class="muted">The interface exists, but no module on :app’s classpath binds it.</span>');
                }
                busy = false;
              }
              const sw = switchEl('arc-d2-mod-impl', ':app depends on news:impl', true, i => {
                if (busy) { i.checked = withImpl; return; }
                withImpl = i.checked; calm(); paint();
                say(o, withImpl ? 'news:impl is back in :app, and with it NewsBindingsModule.' : 'news:impl is no longer a dependency of :app. Build both again.');
              });
              say(o, 'Build the feature alone, then the app. Then drop news:impl from :app.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd(':feature:bookmarks:impl:compileDebugKotlin', compileFeature), cmd(':app:assembleDebug', buildApp), sw),
                h('div', { class: 'arc-graph' },
                  h('div', { class: 'arc-row' }, bm),
                  h('div', { class: 'arc-dir' }, '↓ injects'),
                  h('div', { class: 'arc-row' }, api),
                  h('div', { class: 'arc-dir' }, '↑ bound by'),
                  h('div', { class: 'arc-row' }, impl),
                  h('div', { class: 'arc-dir' }, '↑ collected in'),
                  h('div', { class: 'arc-row' }, app)),
                o);
            },
          },
          {
            title: 'Beware the :core:common grab bag',
            body: `
<p>Core modules hold what features share: models, the design system, networking. The easy shortcut is one <code>:core:common</code> for everything. Soon every feature depends on it, and every public change in it makes Gradle rerun the compile task of every feature, even those that never use the changed file.</p>
<p>Split core by purpose, so each feature depends only on what it uses. Then a change to the date formatter reaches the two features that format dates and leaves the rest alone. The same split keeps more of the build cache valid on CI.</p>`,
            code: `// feature/settings/impl/build.gradle.kts
dependencies {
    implementation(projects.core.ui)          // not core.common
}

// feature/news/impl/build.gradle.kts
dependencies {
    implementation(projects.core.date)
    implementation(projects.core.analytics)
    implementation(projects.core.ui)
}`,
            visual(el) {
              const FEAT = { news: ['date', 'analytics'], bookmarks: ['date'], search: ['analytics'], settings: ['ui'] };
              const CORE = { date: 'DateFormat.kt', analytics: 'Analytics.kt', ui: 'Theme.kt' };
              let split = false, busy = false;
              const chip = (text, cls = '') => h('span', { class: `arc-screen ${cls}` }, text);
              const featEls = {}; Object.keys(FEAT).forEach(f => { featEls[f] = chip(`:feature:${f}`); });
              const appEl = chip(':app');
              const coreRow = h('div', { class: 'arc-screens' });
              const deps = h('div', { class: 'arc-mini' });
              const tally = h('span', { class: 'arc-badge' }, 'tasks rerun: 0');
              const o = out();
              let coreEls = {};
              function paint() {
                coreEls = {};
                if (split) Object.keys(CORE).forEach(c => { coreEls[c] = chip(`:core:${c}`); });
                else coreEls.common = chip(':core:common');
                coreRow.replaceChildren(...Object.values(coreEls));
                deps.replaceChildren(...Object.entries(FEAT).map(([f, uses]) => h('span', {}, `:feature:${f} → ${split ? uses.map(u => ':core:' + u).join(', ') : ':core:common'}`)));
              }
              const calm = () => [appEl, ...Object.values(featEls), ...Object.values(coreEls)].forEach(c => c.classList.remove('arc-now', 'arc-d2-hot'));
              async function edit(core) {
                if (busy) return; busy = true;
                calm();
                const src = split ? coreEls[core] : coreEls.common;
                src.classList.add('arc-now'); replay(src, 'pop');
                say(o, `<span class="muted">public change in ${CORE[core]} (${split ? ':core:' + core : ':core:common'})…</span>`);
                const hit = Object.keys(FEAT).filter(f => !split || FEAT[f].includes(core));
                let n = 1; tally.textContent = `tasks rerun: ${n}`;
                for (const f of hit) {
                  await sleep(320); if (!o.isConnected) return;
                  featEls[f].classList.add('arc-d2-hot'); replay(featEls[f], 'pop-soft');
                  tally.textContent = `tasks rerun: ${++n}`;
                }
                await sleep(320); if (!o.isConnected) return;
                appEl.classList.add('arc-d2-hot'); tally.textContent = `tasks rerun: ${++n}`; replay(tally, 'pop');
                const skipped = Object.keys(FEAT).filter(f => !hit.includes(f));
                say(o, split
                  ? `<span class="good">${n} compile tasks reran.</span> Only ${hit.join(' and ')} use :core:${core}. ${skipped.map(f => ':feature:' + f).join(', ')} stayed up to date.`
                  : `<span class="bad">${n} compile tasks reran.</span> Every feature depends on :core:common, so all of them had to recompile, even ${Object.keys(FEAT).find(f => !FEAT[f].includes(core))}, which never uses ${CORE[core]}.`);
                busy = false;
              }
              const sw = switchEl('arc-d2-mod-split', 'split :core:common by purpose', false, i => {
                if (busy) { i.checked = split; return; }
                split = i.checked; paint(); tally.textContent = 'tasks rerun: 0';
                say(o, split ? 'Three small core modules. Each feature depends only on what it uses.' : 'One :core:common that every feature depends on.');
              });
              paint();
              say(o, 'Edit a shared file and count the compile tasks that must run again.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('edit DateFormat.kt', () => edit('date')), cmd('edit Analytics.kt', () => edit('analytics')), sw, tally),
                h('div', { class: 'arc-graph' },
                  h('div', { class: 'arc-screens arc-d2-center' }, appEl),
                  h('div', { class: 'arc-dir' }, '↓'),
                  h('div', { class: 'arc-screens arc-d2-center' }, Object.values(featEls)),
                  h('div', { class: 'arc-dir' }, '↓'),
                  h('div', { class: 'arc-d2-center' }, coreRow)),
                deps, o);
            },
          },
          {
            title: 'Keep the inside of a feature internal',
            body: `
<p>Kotlin’s <code>internal</code> means “visible inside this Gradle module only”. Mark screens, ViewModels and helpers in an impl module <code>internal</code>, and leave public only what <code>:app</code> calls: the <code>NavGraphBuilder</code> extension. Even if someone adds an impl-to-impl dependency by mistake, there is nothing to import.</p>`,
            code: `// :feature:news:impl
fun NavGraphBuilder.newsSection() {             // the only public entry point
    composable<ArticleRoute> { entry ->
        ArticleScreen(id = entry.toRoute<ArticleRoute>().id)
    }
}

@Composable
internal fun ArticleScreen(id: Int) { /* ... */ }

internal fun Article.readingTime(): String = "\${words / 200} min"`,
          },
        ],
        underHood: {
          body: `
<p>Each Gradle module compiles against its compile classpath: its own <code>implementation</code> and <code>api</code> dependencies, plus the <code>api</code> dependencies of those, and nothing else. That is why a class in news:impl does not exist for bookmarks:impl. The Kotlin compiler reports an unresolved reference.</p>
<p>Hilt still needs every module to build one graph. For each <code>@InstallIn</code> module and entry point, Hilt’s processor writes a small marker class into the package <code>hilt_aggregated_deps</code>. When <code>:app</code> builds, the Hilt Gradle plugin’s aggregating task scans the full runtime classpath of <code>:app</code> for those markers and generates the components from all of them. That is how a binding in news:impl reaches the graph while news:impl stays an <code>implementation</code> dependency.</p>`,
        },
        mistakes: [
          {
            title: 'Putting screens in the api module',
            bad: `// :feature:news:api
@Serializable data class ArticleRoute(val id: Int)

@Composable
fun ArticleScreen(id: Int, viewModel: ArticleViewModel = hiltViewModel()) { /* ... */ }`,
            good: `// :feature:news:api
@Serializable data class ArticleRoute(val id: Int)

// ArticleScreen and ArticleViewModel live in :feature:news:impl`,
            why: 'The api module is meant to be small and stable. With a screen inside, every UI tweak changes the api, and every feature that depends on it compiles again.',
          },
          {
            title: 'Navigating by hand-built strings',
            bad: `// :feature:bookmarks:impl
navController.navigate("article/$id")`,
            good: `// :feature:bookmarks:impl
onOpenArticle(id)   // :app passes navController::navigateToArticle

// :feature:news:api
fun NavController.navigateToArticle(id: Int) = navigate(ArticleRoute(id))`,
            why: 'A string route is copied into every feature that uses it, and a typo or a renamed argument only fails at run time. A <code>@Serializable</code> route from the api module is checked by the compiler.',
          },
          {
            title: 'A feature that depends on :app',
            bad: `// feature/bookmarks/impl/build.gradle.kts
dependencies {
    implementation(projects.app)   // to reach AppNavigator
}`,
            good: `// :feature:bookmarks:impl
fun NavGraphBuilder.bookmarksSection(onOpenArticle: (Int) -> Unit) { /* ... */ }

// :app passes the behaviour in
bookmarksSection(onOpenArticle = navController::navigateToArticle)`,
            why: '<code>:app</code> already depends on bookmarks:impl, so Gradle refuses the circular dependency. Pass behaviour down as a lambda and the feature never needs to know the app.',
          },
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
          { q: 'Where does <code>fun ArticleEntity.toDomain(): Article</code> belong?', options: ['In the domain module, next to Article', 'In the data layer, next to ArticleEntity', 'In the UI layer'], a: 1, why: 'A mapper names both models, so it sits in the outer ring. In the domain it would make the center import the Room entity.' },
          { q: 'The ViewModel catches Retrofit’s HttpException to tell a 401 from a 503. What is the problem, and what fixes it?', options: ['Nothing, that is the right place', 'The UI now depends on Retrofit; map failures to a small DomainError in the data layer', 'HttpException is never thrown, catch IOException'], a: 1, why: 'Errors cross borders like models do. Translating them in the data layer keeps library types out of the UI.' },
        ],
        deeper: [
          {
            title: 'Two kinds of arrows: imports point in, calls go out',
            body: `
<p>The dependency rule is about source code: which file imports which. It is not about which way calls travel at run time. When a use case asks for news, the call goes outward, into the data layer and down to Room. Yet the use case never imports anything from there.</p>
<p>The trick is <b>dependency inversion</b>. The domain owns the <code>NewsRepository</code> interface. The data layer imports that interface and implements it, so its arrow points inward. At run time, Hilt hands the use case the data layer’s object behind the interface. Compare both views below.</p>`,
            code: `// :core:domain declares what it needs
interface NewsRepository { fun observeNews(): Flow<List<Article>> }

class GetFeedUseCase @Inject constructor(private val repo: NewsRepository) {
    operator fun invoke() = repo.observeNews()   // calls outward at run time
}

// :core:data imports the domain and implements it: the import points inward
class OfflineFirstNewsRepository @Inject constructor(
    private val dao: ArticleDao,
) : NewsRepository { /* ... */ }

// :core:data, the one place that connects them
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds abstract fun news(impl: OfflineFirstNewsRepository): NewsRepository
}`,
            visual(el) {
              const C = {
                vm: ['ForYouViewModel', 'mid'], uc: ['GetFeedUseCase', 'in'], repo: ['NewsRepository', 'in'],
                impl: ['OfflineFirstNewsRepository', 'mid'], dao: ['ArticleDao', 'out'],
              };
              const els = {};
              const ring = (cls, name, keys) => h('div', { class: `arc-ring arc-${cls}` }, h('span', { class: 'arc-ring-name' }, name),
                h('div', { class: 'arc-cls' }, keys.map(k => (els[k] = h('span', { class: 'arc-cl' }, C[k][0] + (k === 'repo' ? ' «interface»' : ''))))));
              const edges = h('div', { class: 'arc-d2-edges' });
              const o = out();
              let busy = false;
              const VIEWS = {
                imports: [
                  ['vm', 'imports', 'uc', 'inward'],
                  ['uc', 'imports', 'repo', 'same ring'],
                  ['impl', 'implements', 'repo', 'inward'],
                  ['impl', 'imports', 'dao', 'adapter uses framework'],
                ],
                calls: [
                  ['vm', 'calls getFeed() on', 'uc', 'inward'],
                  ['uc', 'calls observeNews() on', 'repo', 'same ring'],
                  ['repo', 'runs as', 'impl', 'outward'],
                  ['impl', 'calls observeAll() on', 'dao', 'outward'],
                ],
              };
              async function show(kind, btn) {
                if (busy) return; busy = true;
                btns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
                edges.replaceChildren();
                Object.values(els).forEach(e => e.classList.remove('on', 'hot'));
                say(o, kind === 'imports' ? '<span class="muted">reading the import lines of each file…</span>' : '<span class="muted">following one getFeed() call at run time…</span>');
                for (const [a, verb, b, tag] of VIEWS[kind]) {
                  Object.values(els).forEach(e => e.classList.remove('on', 'hot'));
                  els[a].classList.add('on'); els[b].classList.add(tag === 'outward' ? 'hot' : 'on');
                  edges.append(h('div', { class: 'arc-d2-edge drop-in' + (tag === 'outward' ? ' hot' : '') },
                    h('span', {}, C[a][0]), h('span', { class: 'arc-d2-verb' }, verb), h('span', {}, C[b][0]),
                    h('span', { class: 'arc-tag' }, tag)));
                  await sleep(650); if (!o.isConnected) return;
                }
                Object.values(els).forEach(e => e.classList.remove('on', 'hot'));
                say(o, kind === 'imports'
                  ? '<span class="good">no import leaves the domain.</span> GetFeedUseCase and NewsRepository name nothing outside the center. The data layer reaches in to implement the interface.'
                  : '<span class="good">the call still reaches Room.</span> At run time it travels outward through the interface, to an object the domain never named. That is dependency inversion.');
                busy = false;
              }
              const btns = [cmd('// imports: who names whom?', function () { show('imports', this); }), cmd('getFeed() // calls: who runs whom?', function () { show('calls', this); })];
              say(o, 'Two views of the same five classes. Start with the imports.');
              el.append(
                h('div', { class: 'controls arc-fit' }, btns),
                h('div', { class: 'arc-d2-rings' },
                  ring('out', 'Frameworks', ['dao']),
                  ring('mid', 'Adapters', ['vm', 'impl']),
                  ring('in', 'Domain', ['uc', 'repo'])),
                edges, o);
            },
          },
          {
            title: 'Map errors at the border too',
            body: `
<p>Models are not the only thing that crosses a border. Retrofit throws <code>HttpException</code> and <code>IOException</code>. If those reach the ViewModel, the UI layer has to import Retrofit to tell a 401 from a 503, and swapping the HTTP library touches every screen.</p>
<p>Translate failures in the data layer, like you translate DTOs. The domain declares a small <code>DomainError</code> type for the cases the app cares about. The ViewModel maps those to messages and never sees a library exception.</p>`,
            code: `// :core:domain
sealed interface DomainError {
    data object Offline : DomainError
    data object SignedOut : DomainError
    data class Server(val code: Int) : DomainError
}
class DomainException(val error: DomainError) : Exception()

// :core:data, the only module that knows Retrofit
suspend fun <T> apiCall(block: suspend () -> T): T = try {
    block()
} catch (e: IOException) {
    throw DomainException(DomainError.Offline)
} catch (e: HttpException) {
    throw DomainException(if (e.code() == 401) DomainError.SignedOut else DomainError.Server(e.code()))
}`,
            visual(el) {
              const F = {
                off: { thrown: 'IOException', mapped: 'DomainError.Offline', msg: 'You’re offline. Showing saved stories.' },
                auth: { thrown: 'HttpException(401)', mapped: 'DomainError.SignedOut', msg: 'Please sign in again.' },
                down: { thrown: 'HttpException(503)', mapped: 'DomainError.Server(503)', msg: 'Server trouble. Try again soon.' },
              };
              let mapOn = true, busy = false;
              const retro = node('Retrofit call', 'framework');
              const mapper = node('apiCall { }', ':core:data · the border');
              const vm = node('ForYouViewModel', 'turns failures into text');
              const screen = h('div', { class: 'phone-note arc-d2-msg' }, 'Stories load normally.');
              const o = out();
              const all = [retro, mapper, vm];
              const calm = () => all.forEach(n => { n.classList.remove('on', 'ok', 'bad', 'arc-d2-off'); n.box.replaceChildren(); });
              async function fail(k) {
                if (busy) return; busy = true;
                calm();
                const f = F[k];
                retro.classList.add('bad'); tok(retro, f.thrown, 'boom'); replay(retro, 'shake');
                say(o, `<span class="muted">the call throws ${f.thrown}…</span>`);
                await sleep(650); if (!o.isConnected) return;
                if (mapOn) {
                  mapper.classList.add('on'); tok(mapper, f.mapped, 'arc-back');
                  await sleep(650); if (!o.isConnected) return;
                  mapper.classList.remove('on'); mapper.classList.add('ok');
                  vm.classList.add('ok'); tok(vm, `when (${f.mapped.split('(')[0].replace('DomainError.', '')})`, 'arc-back');
                  screen.textContent = f.msg; replay(screen, 'pop');
                  say(o, `<span class="good">mapped:</span> ${f.thrown} became ${f.mapped}. The ViewModel imports only the domain.`);
                } else {
                  mapper.classList.add('arc-d2-off');
                  await sleep(300); if (!o.isConnected) return;
                  vm.classList.add('bad'); tok(vm, 'import retrofit2.HttpException', 'boom'); replay(vm, 'shake');
                  screen.textContent = f.msg; replay(screen, 'pop');
                  say(o, '<span class="bad">leaked:</span> the screen works, but ForYouViewModel now imports Retrofit to read the status code. Switch to Ktor and every ViewModel changes.');
                }
                busy = false;
              }
              const sw = switchEl('arc-d2-clean-err', 'map to DomainError in :core:data', true, i => {
                if (busy) { i.checked = mapOn; return; }
                mapOn = i.checked; calm();
                say(o, mapOn ? 'Failures are translated at the border again.' : 'Now Retrofit’s exceptions travel up unchanged.');
              });
              say(o, 'Make the network fail three different ways.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('no network', () => fail('off')), cmd('HTTP 401', () => fail('auth')), cmd('HTTP 503', () => fail('down')), sw),
                h('div', { class: 'arc-flow' }, retro, h('span', { class: 'arrow' }, '→'), mapper, h('span', { class: 'arrow' }, '→'), vm),
                h('div', { class: 'arc-d2-screen' }, h('span', { class: 'arc-cap' }, 'on screen'), screen),
                o);
            },
          },
          {
            title: 'Let the build enforce the rule',
            body: `
<p>A rule that lives only in code review gets broken on a busy day. Make the domain a plain Kotlin module with no Android plugin. <code>android.*</code>, Room and Compose are then not on its classpath, and an import of them simply does not compile. In a Kotlin Multiplatform project, <code>commonMain</code> gives the same guarantee, and the domain runs on iOS too.</p>`,
            code: `// core/domain/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.jvm)   // no Android plugin: android.* is not on the classpath
}

dependencies {
    implementation(libs.kotlinx.coroutines.core)   // Flow is allowed
    implementation(libs.javax.inject)              // @Inject constructors, no Hilt runtime
}`,
          },
        ],
        underHood: {
          body: `
<p>A top-level extension function like <code>fun ArticleEntity.toDomain()</code> is compiled to a static method on a class named after its file, for example <code>ArticleMappersKt.toDomain(ArticleEntity)</code>. The receiver becomes the first parameter. There is no wrapper object and no reflection, and R8 can inline small ones in a release build.</p>
<p><code>rows.map { it.toDomain() }</code> is an <code>inline</code> function, so the lambda becomes a plain loop that fills a new <code>ArrayList</code> sized to the input. The cost is one new list and one new object per row, on every emission. Room re-runs a Flow query whenever its table changes, so the mapping runs again too. For a few hundred rows that is tiny next to the query itself.</p>`,
          code: `// fun ArticleEntity.toDomain() = Article(id, title, Instant.ofEpochMilli(publishedAtMillis))
// compiles to roughly:
public final class ArticleMappersKt {
    public static final Article toDomain(ArticleEntity $this$toDomain) { ... }
}`,
        },
        mistakes: [
          {
            title: 'Mappers that live in the domain',
            bad: `// :core:domain
data class Article(val id: Int, val title: String, val publishedAt: Instant) {
    fun toEntity() = ArticleEntity(id, title, publishedAt.toEpochMilli())
}`,
            good: `// :core:data
fun Article.toEntity() = ArticleEntity(id, title, publishedAt.toEpochMilli())
fun ArticleEntity.toDomain() = Article(id, title, Instant.ofEpochMilli(publishedAtMillis))`,
            why: 'A mapper names both models, so it must sit in the outer ring. Inside <code>Article</code> it makes the domain import the Room entity, and the center depends on the database again.',
          },
          {
            title: 'A repository interface that returns data-layer types',
            bad: `// :core:domain
interface NewsRepository {
    fun observeNews(): Flow<List<ArticleEntity>>
}`,
            good: `// :core:domain
interface NewsRepository {
    fun observeNews(): Flow<List<Article>>
}`,
            why: 'The interface is the domain’s contract. If it mentions <code>ArticleEntity</code>, the domain needs the data module to compile, and a table change ripples into every use case.',
          },
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
