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
}`;

  Lab.addTrack({
    id: 'arch',
    title: 'App architecture',
    description: 'How a real Android app splits into layers, keeps its data straight, and wires itself together.',
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
    ],
  });
})();
