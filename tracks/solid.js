/* SOLID principles track. Same shape as tracks/kotlin.js.
   Five design principles applied to Kotlin and Android code; builds on the OOP basics track (tracks/oop.js).
   Demo styles live in the css string below; every class is prefixed oo-, shared with tracks/oop.js. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const kt = src => h('div', { class: 'kt', html: hl(src) });
  const pill = (text, cls = '') => h('span', { class: `oo-pill ${cls}` }, text);
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  const css = `
.oo-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 14px; min-width: 0; }
.oo-card { display: grid; gap: 10px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, opacity 0.25s; }
.oo-card.oo-on { border-color: var(--accent); }
.oo-card.oo-bad { border-color: var(--err); }
.oo-card.oo-good { border-color: var(--ok); }
.oo-card.oo-warn { border-color: var(--warm); }
.oo-card.oo-dim { opacity: 0.5; }
.oo-title { font: 700 0.9rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.oo-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.oo-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.oo-pill { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: opacity 0.25s, border-color 0.25s, background 0.25s; }
.oo-pill.oo-acc { border-color: var(--accent); background: var(--accent-soft); }
.oo-pill.oo-warn { border-color: var(--warm); background: var(--warm-soft); }
.oo-pill.oo-err { border-color: var(--err); background: var(--err-soft); }
.oo-pill.oo-ok { border-color: var(--ok); background: var(--ok-soft); }
.oo-pill.oo-ghost { border-style: dashed; border-color: var(--muted); color: var(--muted); background: transparent; }
.oo-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.oo-stat b { color: var(--ink); }
.oo-flash { animation: oo-flash 0.8s ease-out; }
@keyframes oo-flash { from { box-shadow: 0 0 0 6px var(--accent-soft); background: var(--accent-soft); } }
.oo-code { display: grid; background: var(--code-bg); border-radius: 12px; padding: 10px; overflow-x: auto; min-width: 0; }
.oo-line { font: 500 0.82rem/1.6 var(--mono); color: var(--code-ink); white-space: pre; padding: 1px 8px; border-radius: 6px; border: 1px solid transparent; transition: background 0.2s, border-color 0.2s; }
.oo-line.oo-cur { background: rgba(255, 212, 121, 0.14); border-color: var(--t-f); }
.oo-line.oo-ln-ok { background: rgba(158, 223, 165, 0.15); border-color: var(--t-k); }
.oo-line.oo-ln-err { background: rgba(255, 138, 155, 0.18); border-color: var(--t-e); }
.oo-label.oo-raw { text-transform: none; letter-spacing: 0; }
.kt.oo-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
.oo-switches { display: flex; flex-wrap: wrap; gap: 4px 16px; }

/* 1 single responsibility */
.oo-classes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 10px; min-width: 0; }

/* 3 liskov */
.oo-canvas { display: grid; place-items: center; min-height: 190px; padding: 12px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.oo-shape { display: grid; place-items: center; background: var(--accent-soft); border: 3px solid var(--accent); border-radius: 6px; font: 700 0.8rem var(--mono); color: var(--ink); transition: width 0.5s cubic-bezier(0.3, 1.3, 0.5, 1), height 0.5s cubic-bezier(0.3, 1.3, 0.5, 1), border-color 0.3s, background 0.3s; overflow: hidden; }
.oo-shape.oo-fail { border-color: var(--err); background: var(--err-soft); }
.oo-shape.oo-pass { border-color: var(--ok); background: var(--ok-soft); }

/* 5 dependency inversion */
.oo-layers { display: grid; gap: 6px; justify-items: center; min-width: 0; }
.oo-layers .oo-card { width: min(100%, 420px); }
.oo-arrow { font: 600 0.78rem var(--mono); color: var(--muted); text-align: center; }
.oo-arrow.oo-hot { color: var(--err); }

/* depth steps */
.phone.oo-mini-phone { height: 200px; width: min(190px, 100%); }
.oo-matrix { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)); gap: 6px 8px; align-items: center; min-width: 0; }
.oo-matrix.oo-scopes { grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr)); }
.oo-matrix .oo-label { overflow-wrap: anywhere; }
.oo-matrix .oo-pill { justify-self: start; font-size: 0.74rem; }
.oo-col { display: grid; gap: 2px; min-width: 0; }
.oo-cell { display: grid; place-items: center; min-height: 30px; border-radius: 8px; background: var(--sunk); font: 600 0.74rem var(--mono); color: var(--muted); transition: background 0.2s, color 0.2s; }
.oo-cell.oo-pass { background: var(--ok-soft); color: var(--ok); }
.oo-cell.oo-fail { background: var(--err-soft); color: var(--err); }
.oo-cell.oo-na { opacity: 0.5; border: 1px dashed var(--line); background: transparent; }
/* depth pass 2: srp, open-closed, isp */
.oo-srp-stats { display: flex; flex-wrap: wrap; gap: 6px 14px; }
.phone.oo-srp-phone { justify-content: flex-start; align-items: stretch; height: 220px; gap: 8px; }
.oo-srp-name { font-weight: 800; font-size: 1rem; overflow-wrap: anywhere; }
.oo-srp-err { margin: auto 0; padding: 10px; border-radius: 10px; background: var(--err-soft); color: var(--err); font: 600 0.76rem/1.4 var(--mono); overflow-wrap: anywhere; }
.oo-srp-btn { align-self: flex-start; padding: 6px 14px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-weight: 700; font-size: 0.8rem; }
.oo-ocp-list { display: grid; gap: 6px; min-width: 0; }
.oo-ocp-art { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; padding: 8px 10px; border-radius: 10px; background: var(--surface); border: 1.5px solid var(--line); min-width: 0; }
.oo-ocp-art b { overflow-wrap: anywhere; font-size: 0.9rem; }
.oo-ocp-art span { font: 500 0.74rem var(--mono); color: var(--muted); }
.oo-ocp-art.oo-ocp-pin { border-color: var(--warm); background: var(--warm-soft); }
.oo-line.oo-isp-blink { animation: oo-isp-blink 0.8s ease-out; }
.oo-line.oo-isp-idle { animation: oo-isp-idle 0.8s ease-out; }
@keyframes oo-isp-blink { from { background: rgba(158, 223, 165, 0.32); } }
@keyframes oo-isp-idle { from { background: rgba(255, 255, 255, 0.14); } }
.oo-isp-field { flex: 1 1 140px; padding: 8px 10px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); font: 500 0.9rem var(--mono); min-width: 0; }
.oo-isp-ctrls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 40px; }
.oo-isp-seek { flex: 1 1 110px; height: 8px; border-radius: 99px; background: var(--sunk); position: relative; overflow: hidden; }
.oo-isp-seek::after { content: ""; position: absolute; inset: 0 60% 0 0; background: var(--accent); }
`;

  Lab.addTrack({
    id: 'solid',
    title: 'SOLID principles',
    description: 'The five SOLID design principles, each shown with Kotlin and Android code you can break and fix.',
    group: 'Foundations',
    requires: ['oop'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'srp',
        title: 'S: Single responsibility',
        tagline: 'A class should have one reason to change.',
        level: 'intermediate',
        body: `
<p>The single responsibility principle says a class should answer to one kind of change. A useful test is to ask <em>who</em> asks for changes. The backend team changes the API. Designers change how dates look. Analytics renames events. If all of them edit the same file, that file has too many jobs.</p>
<p>The usual Android offender is a “god” Activity or ViewModel that fetches, caches, formats, validates and logs. Every change touches it, merge conflicts pile up, and testing one part means setting up all of them.</p>
<p>Split by reason to change: a repository for data, a formatter for display text, a validator for rules, a small analytics wrapper. The ViewModel then just coordinates. Send a change request below, before and after the split.</p>`,
        code: `// Before: one class, many reasons to change
class ProfileViewModel : ViewModel() {
    fun load() { /* Retrofit call, Room cache, date formatting, analytics... */ }
}

// After: each class has one job
class ProfileRepository(private val api: ProfileApi, private val dao: ProfileDao) {
    fun observe(id: String): Flow<Profile> = dao.observe(id)
    suspend fun refresh(id: String) = dao.upsert(api.profile(id))
}

class ProfileFormatter(private val locale: Locale) {
    fun joined(p: Profile): String =
        DateTimeFormatter.ofPattern("MMM yyyy", locale).format(p.joinedOn)
}

class ProfileViewModel(
    private val repo: ProfileRepository,
    private val formatter: ProfileFormatter,
    private val analytics: ProfileAnalytics,
) : ViewModel() {
    val joined: StateFlow<String> = repo.observe("me")
        .map { formatter.joined(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), "")

    init { analytics.screenViewed() }
}`,
        remember: 'Ask who would ask for a change. One answer per class.',
        terms: [
          { term: 'Single responsibility principle', def: 'The rule that a class should have only one reason to change, meaning it serves one kind of concern.' },
          { term: 'God class', def: 'A class that has collected many unrelated jobs, so almost every change has to touch it.' },
          { term: 'Cohesion', def: 'How closely the members of a class belong together; a cohesive class has members that all serve the same purpose.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The ViewModel gets data from the repository and display text from the formatter. Fill in who does each job.', code: 'class ProfileViewModel(\n    private val repo: ProfileRepository,\n    private val formatter: ProfileFormatter,\n) : ViewModel() {\n    val joined: StateFlow<String> = [[repo]].observe("me")\n        .map { [[formatter]].joined(it) }\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), "")\n}', why: 'The ViewModel only connects the pieces. Data comes from the repository, text comes from the formatter.' },
          { type: 'bug', prompt: 'Designers want a new headline style, and the data layer has to change. Tap the line that doesn’t belong here.', code: 'class ProfileRepository(\n    private val api: ProfileApi,\n    private val dao: ProfileDao,\n) {\n    suspend fun refresh(id: String) = dao.upsert(api.profile(id))\n    fun observe(id: String): Flow<Profile> = dao.observe(id)\n    fun headline(p: Profile) = p.name.uppercase() + " · " + p.city\n}', bug: 6, fix: '    // move headline() to a ProfileFormatter in the UI layer', why: 'Display formatting changes for design reasons. Data loading changes for backend reasons. Keeping both here gives the repository two reasons to change.' },
        ],
        quiz: [
          { q: 'What is a practical test for “one responsibility”?', options: ['The class has under 100 lines', 'Only one kind of stakeholder would ask to change it', 'It has one public method'], a: 1, why: 'Size and method count are side effects. The principle is about reasons to change.' },
          { q: 'Designers change the date format. After a good split, which class changes?', options: ['ProfileViewModel', 'ProfileRepository', 'ProfileFormatter'], a: 2, why: 'Formatting is the formatter’s only job, so the change lands there and nowhere else.' },
        ],
        deeper: [
          {
            title: 'Too far: one class per function',
            body: `<p>Splitting has a cost too. Cut every function into its own class and one change is spread over many files again, and the ViewModel has to wire a dozen tiny classes. Code that changes together now lives apart.</p>
<p>The goal is cohesion: group what changes for the same reason, and split what changes for different reasons. Try the same change requests at three levels of splitting.</p>`,
            visual(el) {
              const FNS = [
                { f: 'fetchProfile()', g: 'api', cls: 'FetchProfile' }, { f: 'parseDto()', g: 'api', cls: 'ParseProfileDto' },
                { f: 'cacheProfile()', g: 'api', cls: 'CacheProfile' }, { f: 'readCache()', g: 'api', cls: 'ReadCachedProfile' },
                { f: 'formatName()', g: 'design', cls: 'FormatName' }, { f: 'formatJoinDate()', g: 'design', cls: 'FormatJoinDate' },
                { f: 'validateEmail()', g: 'rules', cls: 'ValidateEmail' }, { f: 'validateName()', g: 'rules', cls: 'ValidateName' },
                { f: 'trackView()', g: 'analytics', cls: 'TrackView' }, { f: 'trackEdit()', g: 'analytics', cls: 'TrackEdit' },
              ];
              const GROUP = { api: 'ProfileRepository', design: 'ProfileFormatter', rules: 'ProfileValidator', analytics: 'ProfileAnalytics' };
              const ASKS = [
                { label: 'Backend adds a bio field', hits: ['parseDto()', 'cacheProfile()', 'readCache()'] },
                { label: 'Design changes the date format', hits: ['formatJoinDate()'] },
                { label: 'Names may now contain emoji', hits: ['validateName()', 'formatName()'] },
              ];
              const MODES = [{ k: 'god', label: '1 class' }, { k: 'reason', label: 'by reason to change' }, { k: 'fn', label: '1 class per function' }];
              let mode = 'reason', busy = false;
              const area = h('div', { class: 'oo-classes' });
              const stats = h('div', { class: 'oo-srp-stats' });
              const o = out('');
              let cards = {}, pills = {};
              const owner = fn => mode === 'god' ? 'ProfileViewModel' : mode === 'reason' ? GROUP[fn.g] : fn.cls;
              function render() {
                cards = {}; pills = {};
                FNS.forEach(fn => {
                  const n = owner(fn);
                  if (!cards[n]) cards[n] = h('div', { class: 'oo-card oo-on drop-in' }, h('span', { class: 'oo-title' }, n), h('div', { class: 'oo-row' }));
                  cards[n].lastElementChild.append(pills[fn.f] = pill(fn.f, 'oo-acc'));
                });
                area.replaceChildren(...Object.values(cards));
                area.style.gridTemplateColumns = mode === 'fn' ? 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))' : '';
                stats.replaceChildren(h('span', { class: 'oo-stat', html: `classes the ViewModel wires: <b>${mode === 'god' ? 0 : Object.keys(cards).length}</b>` }));
              }
              const modeBtns = MODES.map(m => act(m.label, () => { if (busy) return; mode = m.k; press(modeBtns, modeBtns[MODES.indexOf(m)]); render(); say(o, m.k === 'god' ? 'Everything in one ViewModel.' : m.k === 'reason' ? 'One class per reason to change.' : 'Every function is its own class.'); }));
              async function ask(a) {
                if (busy) return; busy = true;
                Object.values(cards).forEach(c => c.classList.remove('oo-warn'));
                const files = new Set(a.hits.map(f => owner(FNS.find(x => x.f === f))));
                const unrelated = [...files].reduce((n, c) => n + FNS.filter(fn => owner(fn) === c && !a.hits.includes(fn.f)).length, 0);
                files.forEach(c => { cards[c].classList.add('oo-warn'); replay(cards[c], 'shake'); });
                a.hits.forEach(f => { pills[f].className = 'oo-pill oo-warn'; replay(pills[f], 'pop'); });
                stats.replaceChildren(
                  h('span', { class: 'oo-stat', html: `files opened: <b>${files.size}</b>` }),
                  h('span', { class: 'oo-stat', html: `unrelated functions in them: <b>${unrelated}</b>` }),
                  h('span', { class: 'oo-stat', html: `classes the ViewModel wires: <b>${mode === 'god' ? 0 : Object.keys(cards).length}</b>` }));
                say(o, mode === 'god'
                  ? `${a.label}. <span class="bad">1 file, but ${unrelated} unrelated functions</span> share it, and all of them need retesting.`
                  : mode === 'fn'
                    ? `${a.label}. <span class="bad">${files.size} file${files.size > 1 ? 's' : ''} for one change</span>${files.size > 1 ? ', and nothing tells you they belong together' : ''}. The ViewModel wires ${Object.keys(cards).length} classes.`
                    : `${a.label}. <span class="good">${files.size} focused file${files.size > 1 ? 's' : ''}</span>, ${unrelated} unrelated function${unrelated === 1 ? '' : 's'} nearby. Things that change together stay together.`);
                await sleep(1300); if (!el.isConnected) return;
                Object.values(cards).forEach(c => c.classList.remove('oo-warn'));
                Object.values(pills).forEach(p => { p.className = 'oo-pill oo-acc'; });
                busy = false;
              }
              press(modeBtns, modeBtns[1]); render();
              say(o, 'Send a change request at each level of splitting.');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'split'), modeBtns),
                area, stats,
                h('div', { class: 'controls' }, ASKS.map(a => act(a.label, () => ask(a)))),
                o);
            },
          },
          {
            title: 'Split the composable too',
            body: `<p>Composables collect jobs just like classes do. A screen that gets its ViewModel, collects state and draws the layout does two things: wiring and drawing. Split it into a <code>ProfileRoute</code> that talks to the ViewModel and a <code>ProfileScreen</code> that only takes state and callbacks.</p>
<p>The stateless half renders in a <code>@Preview</code> and in UI tests with any state you hand it, with no ViewModel, Hilt or network behind it.</p>`,
            code: `@Composable
fun ProfileRoute(vm: ProfileViewModel = hiltViewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    ProfileScreen(state, onSave = vm::save)
}

@Composable
fun ProfileScreen(state: ProfileUiState, onSave: () -> Unit) {
    Column {
        Text(state.name)
        Text(state.joined)
        Button(onClick = onSave) { Text("Save") }
    }
}

@Preview
@Composable
fun ProfileScreenPreview() =
    ProfileScreen(ProfileUiState("Ada", "Joined May 2021"), onSave = {})`,
            visual(el) {
              const STATES = [
                { src: 'ProfileUiState("Ada", "Joined May 2021")', name: 'Ada', joined: 'Joined May 2021', what: '@Preview' },
                { src: 'ProfileUiState("Maximiliana Bartholomew-Okonkwo", ...)', name: 'Maximiliana Bartholomew-Okonkwo', joined: 'Joined Jan 2019', what: 'UI test: a long name' },
                { src: 'ProfileUiState(name = "", joined = "")', name: '', joined: '', what: 'UI test: empty profile' },
              ];
              let split = false, busy = false;
              const code = h('div', { class: 'oo-code' });
              const phone = h('div', { class: 'phone oo-srp-phone', 'aria-label': 'Rendered screen' });
              const sw = h('input', { type: 'checkbox', id: 'oo-srp-split' });
              const o = out('');
              function paintCode() {
                const L = split
                  ? ['@Composable fun ProfileRoute(vm: ProfileViewModel = hiltViewModel())', '    = ProfileScreen(vm.state..., vm::save)', '@Composable fun ProfileScreen(state: ProfileUiState, onSave: () -> Unit)']
                  : ['@Composable fun ProfileScreen(vm: ProfileViewModel = hiltViewModel()) {', '    val state by vm.state.collectAsStateWithLifecycle()', '    // draws name, joined date, Save button', '}'];
                code.replaceChildren(...L.map((t, i) => h('div', { class: `oo-line drop-in${split && i === 2 ? ' oo-ln-ok' : ''}`, html: hl(t) })));
              }
              function idle() { phone.replaceChildren(h('span', { class: 'phone-note' }, 'Nothing rendered yet')); }
              sw.addEventListener('change', () => { if (busy) { sw.checked = split; return; } split = sw.checked; paintCode(); idle(); say(o, split ? 'Split: ProfileScreen now needs only state and a callback.' : 'One composable that builds its own ViewModel.'); });
              async function render(s) {
                if (busy) return; busy = true;
                phone.replaceChildren(h('span', { class: 'phone-note' }, 'Rendering...'));
                await sleep(500); if (!el.isConnected) return;
                if (!split) {
                  phone.replaceChildren(h('div', { class: 'oo-srp-err drop-in' }, `${s.what} failed: there is no Hilt graph to build ProfileViewModel, its repository and its API client.`));
                  replay(phone, 'shake');
                  say(o, `<span class="bad">${s.what} can't run:</span> the screen creates its own ViewModel, so you can't hand it a state.`);
                } else {
                  phone.replaceChildren(
                    h('span', { class: 'oo-srp-name drop-in' }, s.name || 'No name yet'),
                    h('span', { class: 'phone-note drop-in' }, s.joined || 'Joined date unknown'),
                    h('span', { class: 'oo-srp-btn drop-in' }, 'Save'));
                  say(o, `${hl(`ProfileScreen(${s.src}, onSave = {})`)} <span class="good">rendered.</span>`);
                }
                busy = false;
              }
              paintCode(); idle();
              say(o, 'Render the screen in a preview or a test.');
              el.append(
                h('label', { class: 'switch', for: 'oo-srp-split' }, sw, 'Split into ProfileRoute + ProfileScreen'),
                h('div', { class: 'oo-pair' }, code, phone),
                h('div', { class: 'controls' }, STATES.map(s => act(s.what, () => render(s)))),
                o);
            },
          },
          {
            title: 'When the ViewModel grows: use cases',
            body: `<p>After data and formatting move out, the ViewModel coordinates. On big screens even that grows: combine several sources, apply a business rule, decide what to show. The optional domain layer in Android's architecture guide moves such logic into use cases, one class per operation, often called through <code>invoke</code>.</p>
<p>Add one when two ViewModels need the same logic, or when a ViewModel gets hard to read. A use case that only forwards a single call is noise.</p>`,
            code: `class GetProfileSummary @Inject constructor(
    private val profiles: ProfileRepository,
    private val orders: OrderRepository,
) {
    operator fun invoke(id: String): Flow<ProfileSummary> =
        combine(profiles.observe(id), orders.countFor(id)) { p, count ->
            ProfileSummary(name = p.name, isVip = count >= 10)
        }
}`,
          },
        ],
        mistakes: [
          { title: 'A Utils object that collects everything', bad: 'object Utils {\n    fun formatDate(d: LocalDate): String = TODO()\n    fun isValidEmail(s: String): Boolean = TODO()\n    fun track(event: String) { /* ... */ }\n}', good: 'class DateFormatter(private val locale: Locale) { /* format() */ }\nclass EmailValidator { /* isValid() */ }\nclass Analytics(private val tracker: Tracker) { /* track() */ }', why: 'A utils file is a god class without a name. Every team edits it, and nothing in it can be swapped for a fake in a test. Group functions by who asks for changes.' },
          { title: 'A repository that shows UI', bad: 'class ProfileRepository(\n    private val api: ProfileApi,\n    private val context: Context,\n) {\n    suspend fun refresh(id: String) {\n        try { api.profile(id) } catch (e: IOException) {\n            Toast.makeText(context, "Offline", Toast.LENGTH_SHORT).show()\n        }\n    }\n}', good: 'class ProfileRepository(private val api: ProfileApi) {\n    suspend fun refresh(id: String): Profile = api.profile(id)\n}\n// ViewModel: catch (e: IOException) -> offline = true in UI state', why: 'Data code now changes when designers restyle errors, and it can\'t run in a unit test without a Context. Let the data layer report the failure and the UI decide how to show it.' },
          { title: 'One ViewModel for the whole app', bad: 'class MainViewModel : ViewModel() {\n    val feed: StateFlow<FeedState> = TODO()\n    val profile: StateFlow<ProfileState> = TODO()\n    val settings: StateFlow<SettingsState> = TODO()\n    fun refreshFeed() { }\n    fun logout() { }\n}', good: 'class FeedViewModel(/* ... */) : ViewModel()\nclass ProfileViewModel(/* ... */) : ViewModel()\nclass SettingsViewModel(/* ... */) : ViewModel()', why: 'Every screen change edits the same class, and its state lives as long as the app. A ViewModel per screen stays small and is cleared when its screen goes away.' },
        ],
        visual(el) {
          const methods = [
            { m: 'fetchProfile()', r: 'api', home: 'ProfileRepository' },
            { m: 'cacheInRoom()', r: 'api', home: 'ProfileRepository' },
            { m: 'formatJoinDate()', r: 'design', home: 'ProfileFormatter' },
            { m: 'validateEmail()', r: 'rules', home: 'EmailValidator' },
            { m: 'trackScreenView()', r: 'analytics', home: 'ProfileAnalytics' },
            { m: 'uiState', r: 'screen', home: 'ProfileViewModel' },
          ];
          const homes = ['ProfileViewModel', 'ProfileRepository', 'ProfileFormatter', 'EmailValidator', 'ProfileAnalytics'];
          const asks = [
            { r: 'api', label: 'Backend adds a field' },
            { r: 'design', label: 'Design changes the date format' },
            { r: 'rules', label: 'Product tightens email rules' },
            { r: 'analytics', label: 'Analytics renames an event' },
          ];
          let split = false, busy = false, pills = [], cards = {};
          const area = h('div', {});
          const o = out('Send a change request. Count how much code it touches.');
          function render(animate) {
            pills = methods.map(x => { const p = pill(x.m, 'oo-acc'); p.r = x.r; return p; });
            cards = {};
            if (!split) {
              const c = h('div', { class: `oo-card oo-on${animate ? ' drop-in' : ''}` }, h('span', { class: 'oo-title' }, 'class ProfileViewModel'), h('span', { class: 'oo-stat' }, '612 lines · 6 jobs'), h('div', { class: 'oo-row' }, pills));
              homes.forEach(n => { cards[n] = c; });
              area.replaceChildren(c);
            } else {
              const grid = h('div', { class: 'oo-classes' });
              homes.forEach((n, i) => {
                const own = pills.filter((p, j) => methods[j].home === n);
                const c = h('div', { class: `oo-card oo-on${animate ? ' drop-in' : ''}`, style: animate ? `animation-delay:${i * 90}ms` : null }, h('span', { class: 'oo-title' }, n), h('div', { class: 'oo-row' }, own));
                cards[n] = c; grid.append(c);
              });
              area.replaceChildren(grid);
            }
          }
          async function change(a) {
            if (busy) return; busy = true;
            const hit = new Set(methods.filter(x => x.r === a.r).map(x => x.home));
            const touched = [...new Set([...hit].map(n => cards[n]))];
            Object.values(cards).forEach(c => c.classList.remove('oo-warn'));
            touched.forEach(c => { c.classList.add('oo-warn'); replay(c, 'shake'); });
            pills.forEach(p => { if (p.r === a.r) { p.className = 'oo-pill oo-warn'; replay(p, 'pop'); } });
            if (!split) {
              say(o, `${a.label}. <span class="bad">edit ProfileViewModel.kt:</span> the file every other feature also lives in. Re-test all 6 jobs.`);
            } else {
              say(o, `${a.label}. <span class="good">edit ${[...hit].join(', ')}:</span> one small class. The other ${homes.length - hit.size} are untouched.`);
            }
            await sleep(1300);
            if (!el.isConnected) return;
            touched.forEach(c => c.classList.remove('oo-warn'));
            pills.forEach(p => { p.className = 'oo-pill oo-acc'; });
            busy = false;
          }
          const splitBtn = act('Split by reason to change', async () => {
            if (busy) return; busy = true;
            if (!split) { pills.forEach((p, i) => { p.style.animationDelay = `${i * 60}ms`; p.classList.add('leave'); }); await sleep(700); }
            split = !split; render(true);
            splitBtn.textContent = split ? 'Merge back into one class' : 'Split by reason to change';
            say(o, split ? 'Five focused classes. The ViewModel keeps only uiState and coordinates the rest.' : 'Back to one god class.');
            busy = false;
          });
          render(false);
          el.append(
            h('div', { class: 'stage' }, area),
            h('div', { class: 'controls' }, asks.map(a => act(a.label, () => change(a)))),
            h('div', { class: 'controls' }, splitBtn),
            o);
          area.style.cssText = 'width:100%;min-width:0;display:grid';
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'open-closed',
        title: 'O: Open/closed',
        tagline: 'Add behaviour by adding code, not by editing code that works.',
        level: 'intermediate',
        body: `
<p>The open/closed principle says code should be open for extension and closed for modification. You add a new payment method by writing a new class, not by editing five <code>when</code> blocks that already work and are already tested.</p>
<p>An open hierarchy (an interface any class can implement) makes adding <em>types</em> cheap. Each type carries its own <code>fee()</code> and <code>label</code>. But adding a new <em>operation</em> means editing every class.</p>
<p>A <code>sealed</code> hierarchy flips the trade-off. Adding an operation is one new function with a <code>when</code>. Adding a type breaks every <code>when</code>, and the compiler lists each one, which is safe but not closed. Pick by what changes more often in your app. Try both below.</p>`,
        code: `// Sealed: a fixed set of types. New operations are cheap.
sealed interface Payment
data class Card(val last4: String) : Payment
data object GooglePay : Payment

fun fee(p: Payment): Int = when (p) {
    is Card -> 30
    GooglePay -> 0
}   // add PayPal and the compiler flags every when that needs a branch

// Open: any class can join. New types are cheap.
interface PaymentMethod {
    val label: String
    fun fee(): Int
}
class PayPal(val email: String) : PaymentMethod {
    override val label = "PayPal"
    override fun fee() = 25
}

fun checkoutTotal(amount: Int, method: PaymentMethod) = amount + method.fee()`,
        remember: 'Open hierarchy: new types are cheap. Sealed: new operations are cheap. Pick by what changes more.',
        terms: [
          { term: 'Open/closed principle', def: 'The rule that you should be able to add behaviour by adding new code, without modifying code that already works.' },
          { term: 'Expression problem', def: 'The trade-off where a design makes either new types or new operations easy to add, but not both.' },
          { term: 'Exhaustive when', def: 'A when over a sealed type that covers every subtype, so the compiler reports an error when a new subtype is added.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the set of payments closed so <code>label()</code> needs no <code>else</code>.', code: '[[sealed]] interface Payment\ndata class Card(val last4: String) : Payment\ndata object GooglePay : Payment\n\nfun label(p: Payment) = [[when]] (p) {\n    is Card -> "Card ${p.last4}"\n    GooglePay -> "Google Pay"\n}', why: 'With <code>sealed</code> the compiler knows every subtype, so a <code>when</code> that covers them all is exhaustive.' },
          { type: 'bug', prompt: 'PayPal was added last sprint and is charged no fee by mistake. Nothing warned anyone. Tap the line to blame.', code: 'sealed interface Payment\ndata class Card(val last4: String) : Payment\ndata object GooglePay : Payment\ndata class PayPal(val email: String) : Payment\n\nfun fee(p: Payment): Int = when (p) {\n    is Card -> 30\n    GooglePay -> 0\n    else -> 0\n}', bug: 8, fix: '    is PayPal -> 25   // no else: new types become compile errors', why: 'An <code>else</code> branch over a sealed type swallows every future subtype. Listing each type keeps the compiler checking for you.' },
        ],
        quiz: [
          { q: 'With an open <code>PaymentMethod</code> interface, what does adding Klarna take?', options: ['One new class', 'Editing every function that handles payments', 'Changing the interface'], a: 0, why: 'Each implementation carries its own behaviour, so existing code stays as it is.' },
          { q: 'With a sealed <code>Payment</code>, what does adding a <code>refund()</code> operation take?', options: ['Editing every subtype', 'One new function with a when', 'It is impossible'], a: 1, why: 'Operations live in functions outside the types, so a new one is a single new function.' },
          { q: 'Why avoid <code>else</code> in a <code>when</code> over a sealed type?', options: ['It is slower', 'It hides new subtypes from the compiler', 'It doesn’t compile'], a: 1, why: 'Without <code>else</code>, adding a subtype turns every incomplete <code>when</code> into a compile error.' },
        ],
        deeper: [
          {
            title: 'Plug-ins through a registry',
            body: `<p>A <code>when</code> that maps every deep link to a screen has to be edited for each new feature. Turn it around: each feature module contributes a handler to a set, and the router just walks the set. A new feature adds a module and a binding. The router stays closed.</p>
<p>Hilt builds the set for you with <code>@IntoSet</code>. In Kotlin, inject it as <code>Set&lt;@JvmSuppressWildcards DeepLinkHandler&gt;</code> so the type Dagger sees matches the one it provides.</p>`,
            code: `interface DeepLinkHandler {
    fun canHandle(uri: Uri): Boolean
    fun open(uri: Uri)
}

// in :feature:news
@Module
@InstallIn(SingletonComponent::class)
abstract class NewsLinks {
    @Binds @IntoSet
    abstract fun bind(handler: NewsLinkHandler): DeepLinkHandler
}

// in :app, never edited for a new feature
class Router @Inject constructor(
    private val handlers: Set<@JvmSuppressWildcards DeepLinkHandler>,
) {
    fun open(uri: Uri) {
        handlers.firstOrNull { it.canHandle(uri) }?.open(uri) ?: openHome()
    }
}`,
            visual(el) {
              const FEATS = [
                { k: 'news', h: 'NewsLinkHandler', screen: id => `ArticleScreen(${id})` },
                { k: 'video', h: 'VideoLinkHandler', screen: id => `PlayerScreen(${id})` },
                { k: 'shop', h: 'ShopLinkHandler', screen: id => `ShopScreen("${id}")` },
              ];
              const URLS = [['news', '42'], ['video', '7'], ['shop', 'cart']];
              const on = new Set(['news']);
              let busy = false, edits = 0;
              const set = h('div', { class: 'oo-row' });
              const setCard = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label oo-raw' }, 'Set<DeepLinkHandler>'), set);
              const router = h('div', { class: 'oo-code' }, ...['class Router(handlers: Set<DeepLinkHandler>) {', '    fun open(uri: Uri) =', '        handlers.firstOrNull { it.canHandle(uri) }', '            ?.open(uri) ?: openHome()', '}'].map(t => h('div', { class: 'oo-line', html: hl(t) })));
              const rStat = h('span', { class: 'oo-stat' });
              const routerCard = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, ':app'), router, rStat);
              const o = out('');
              const chips = {};
              function paintSet(fresh) {
                set.replaceChildren(...FEATS.filter(f => on.has(f.k)).map(f => (chips[f.k] = pill(f.h, `oo-acc${f.k === fresh ? ' drop-in' : ''}`))));
                if (!on.size) set.append(h('span', { class: 'tip' }, 'empty set'));
                rStat.innerHTML = `Router lines edited: <b>${edits}</b>`;
              }
              const toggles = FEATS.map(f => {
                const id = `oo-ocp-feat-${f.k}`;
                const inp = h('input', { type: 'checkbox', id, checked: on.has(f.k) });
                inp.addEventListener('change', () => {
                  if (busy) { inp.checked = on.has(f.k); return; }
                  if (inp.checked) on.add(f.k); else on.delete(f.k);
                  paintSet(inp.checked ? f.k : null); replay(routerCard, 'pop-soft');
                  say(o, inp.checked ? `<span class="good">:feature:${f.k} added</span> ${hl(`@Binds @IntoSet ${f.h}`)}. The Router did not change.` : `:feature:${f.k} removed from the build. The Router did not change.`);
                });
                return h('label', { class: 'switch', for: id }, inp, `:feature:${f.k}`);
              });
              async function open([k, id]) {
                if (busy) return; busy = true;
                const list = FEATS.filter(f => on.has(f.k));
                Object.values(chips).forEach(c => { c.className = 'oo-pill oo-acc'; });
                router.children[2].classList.add('oo-cur');
                let hit = null;
                for (const f of list) {
                  const c = chips[f.k]; c.className = 'oo-pill oo-warn'; replay(c, 'pop');
                  await sleep(380); if (!el.isConnected) return;
                  if (f.k === k) { c.className = 'oo-pill oo-ok'; hit = f; break; }
                  c.className = 'oo-pill oo-ghost';
                }
                router.children[2].classList.remove('oo-cur');
                if (hit) say(o, `${hl(`app://${k}/${id}`)} <span class="muted">→</span> <span class="good">${hit.h}</span> opens ${hl(hit.screen(id))}`);
                else { router.children[3].classList.add('oo-cur'); replay(setCard, 'shake'); say(o, `${hl(`app://${k}/${id}`)} <span class="muted">→ no handler in the set →</span> ${hl('openHome()')}`); await sleep(500); router.children[3].classList.remove('oo-cur'); }
                busy = false;
              }
              paintSet();
              say(o, 'Turn feature modules on, then open links.');
              el.append(
                h('div', { class: 'oo-switches' }, toggles),
                h('div', { class: 'oo-pair' }, setCard, routerCard),
                h('div', { class: 'controls' }, URLS.map(u => cmd(`router.open("app://${u[0]}/${u[1]}")`, () => open(u)))),
                o);
            },
          },
          {
            title: 'Behaviour passed in: comparators',
            body: `<p><code>sortedWith</code> is a perfectly closed function. Nobody edits it to support a new order. You pass a <code>Comparator</code>, and comparators combine: <code>compareByDescending { it.pinned }.then(newest)</code> builds a new order out of two small ones.</p>
<p>The same works in your own code. A function that takes a lambda or a small interface for the part that varies stays closed, while callers extend it.</p>`,
            code: `val newest = compareByDescending<Article> { it.date }
val popular = compareByDescending<Article> { it.reads }
val pinnedFirst = compareByDescending<Article> { it.pinned }.then(newest)

articles.sortedWith(pinnedFirst)`,
            visual(el) {
              const ARTS = [
                { t: 'New metro line opens', d: 12, reads: 900, pin: false },
                { t: 'Derby ends 2-2', d: 14, reads: 4100, pin: false },
                { t: 'Rain expected Friday', d: 15, reads: 300, pin: false },
                { t: 'Election guide', d: 10, reads: 2500, pin: true },
                { t: 'App update notes', d: 13, reads: 120, pin: false },
              ];
              const byDate = (a, b) => b.d - a.d;
              const CMPS = [
                { n: 'newest', src: 'compareByDescending { it.date }', f: byDate },
                { n: 'popular', src: 'compareByDescending { it.reads }', f: (a, b) => b.reads - a.reads },
                { n: 'title', src: 'compareBy { it.title }', f: (a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0) },
                { n: 'pinnedFirst', src: 'compareByDescending { it.pinned }.then(newest)', f: (a, b) => (b.pin - a.pin) || byDate(a, b) },
              ];
              let busy = false;
              const list = h('div', { class: 'oo-ocp-list' });
              const rows = ARTS.map(a => { const r = h('div', { class: `oo-ocp-art${a.pin ? ' oo-ocp-pin' : ''}` }, h('b', {}, a.t), h('span', {}, a.pin ? 'pinned' : ''), h('span', {}, `${a.d} Oct`), h('span', {}, `${a.reads} reads`)); r.a = a; return r; });
              const call = h('div', { class: 'oo-code' }, h('div', { class: 'oo-line' }), h('div', { class: 'oo-line', html: hl('articles.sortedWith(order)   // never edited') }));
              const o = out('');
              const btns = CMPS.map(c => cmd(c.n, () => sortBy(c)));
              function reorder(order) {
                const first = new Map(order.map(e => [e, e.getBoundingClientRect()]));
                list.append(...order);
                order.forEach(e => { const a = first.get(e), b = e.getBoundingClientRect(); e.style.transition = 'none'; e.style.transform = `translateY(${a.top - b.top}px)`; });
                void list.offsetWidth;
                order.forEach(e => { e.style.transition = 'transform 0.5s cubic-bezier(0.3, 1.2, 0.5, 1)'; e.style.transform = ''; });
              }
              async function sortBy(c) {
                if (busy) return; busy = true;
                press(btns, btns[CMPS.indexOf(c)]);
                call.firstElementChild.innerHTML = hl(`val order = ${c.src}`); replay(call.firstElementChild, 'oo-flash');
                reorder([...rows].sort((x, y) => c.f(x.a, y.a)));
                say(o, `${hl(`articles.sortedWith(${c.n})`)} <span class="muted">→ new order, and</span> <span class="good">sortedWith did not change</span>`);
                await sleep(600); busy = false;
              }
              list.append(...rows);
              call.firstElementChild.innerHTML = hl('val order = /* pick one */');
              say(o, 'Pass different comparators to the same function.');
              el.append(call, h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'order'), btns), list, o);
            },
          },
          {
            title: 'Extension functions add operations from outside',
            body: `<p>"Closed for modification" can also mean a module you shouldn't touch. Extension functions add operations to a type from the outside. A UI module can give the domain's <code>Payment</code> an <code>icon()</code> without the domain knowing anything about drawables.</p>
<p>Extensions are resolved statically, so pair them with a sealed type and an exhaustive <code>when</code>. The compiler still points at every place a new payment type needs handling.</p>`,
            code: `// :core:domain knows nothing about Android resources
sealed interface Payment
data class Card(val last4: String) : Payment
data object GooglePay : Payment

// :feature:checkout adds a UI-only operation
@DrawableRes
fun Payment.icon(): Int = when (this) {
    is Card -> R.drawable.ic_card
    GooglePay -> R.drawable.ic_google_pay
}`,
          },
        ],
        underHood: {
          body: `<p>An exhaustive <code>when</code> over a sealed type compiles to a chain of type and equality checks. Since the compiler proved the list complete, it adds a hidden last branch that throws <code>NoWhenBranchMatchedException</code>. That branch only runs if a subtype appears that this code was not compiled against, for example from a library updated without recompiling your module.</p>
<p>A <code>when</code> over an enum compiles differently. A generated <code>$WhenMappings</code> class maps each constant's ordinal to a branch number, and the JVM jumps with a <code>tableswitch</code>. Either way, a new case is something your build tells you about, not your users.</p>`,
          code: `// Kotlin
fun fee(p: Payment): Int = when (p) {
    is Card -> 30
    GooglePay -> 0
}

// JVM, simplified
if (p instanceof Card) return 30;
if (Intrinsics.areEqual(p, GooglePay.INSTANCE)) return 0;
throw new NoWhenBranchMatchedException();`,
        },
        mistakes: [
          { title: 'A Boolean per variant', bad: 'fun share(\n    text: String,\n    viaSms: Boolean,\n    viaEmail: Boolean,\n    viaWhatsApp: Boolean,\n) {\n    if (viaSms) { /* ... */ }\n    if (viaEmail) { /* ... */ }\n    if (viaWhatsApp) { /* ... */ }\n}', good: 'interface ShareTarget { fun share(text: String) }\n\nfun share(text: String, targets: List<ShareTarget>) =\n    targets.forEach { it.share(text) }', why: 'Every new channel edits the signature, the body and every call site. With a small interface, a new channel is a new class.' },
          { title: 'Making everything open "for extension"', bad: 'open class PriceFormatter {\n    open fun currency() = "TRY"\n    open fun format(cents: Long) = "${cents / 100} ${currency()}"\n}', good: 'class PriceFormatter(private val currency: String) {\n    fun format(cents: Long) = "${cents / 100} $currency"\n}', why: '<code>open</code> lets subclasses depend on every detail, which is the fragile base class problem again. Extend through constructor parameters or interfaces you designed for it.' },
        ],
        visual(el) {
          const fees = { Card: 30, GooglePay: 0, PayPal: 25, Klarna: 40, Bank: 10 };
          const typePool = ['PayPal', 'Klarna', 'Bank'], opPool = ['refund', 'icon', 'limit'];
          let types = ['Card', 'GooglePay'], ops = ['fee', 'label'], mode = 'sealed', busy = false;
          const area = h('div', { class: 'oo-classes' });
          const stat = h('span', { class: 'oo-stat' });
          const o = out('Pick a design, then add a type or an operation.');
          let edits = 0, added = 0;
          const branch = (t, op) => mode === 'sealed' ? `    ${t === 'GooglePay' ? t : 'is ' + t} -> …` : `    override fun ${op}() = …`;
          function cardFor(head, rows) {
            const lines = rows.map(([t, op]) => h('div', { class: 'oo-line', html: hl(branch(t, op)) }));
            const box = h('div', { class: 'oo-code' }, h('div', { class: 'oo-line', html: hl(head) }), ...lines, h('div', { class: 'oo-line' }, '}'));
            const c = h('div', { class: 'oo-card oo-on' }, box);
            c.box = box; return c;
          }
          function render() {
            area.replaceChildren(...(mode === 'sealed'
              ? ops.map(op => cardFor(`fun ${op}(p: Payment) = when (p) {`, types.map(t => [t, op])))
              : types.map(t => cardFor(`class ${t} : PaymentMethod {`, ops.map(op => [t, op])))));
            stat.innerHTML = `existing code edited: <b>${edits}</b> · new code added: <b>${added}</b>`;
          }
          async function grow(kind) {
            if (busy) return;
            const pool = kind === 'type' ? typePool : opPool, have = kind === 'type' ? types : ops;
            const next = pool.find(x => !have.includes(x));
            if (!next) { say(o, `No more ${kind}s to add. Press Reset to start over.`); return; }
            busy = true;
            // Does this addition need a new card, or a new row in every existing card?
            const newCard = (mode === 'sealed') === (kind === 'op');
            if (newCard) {
              have.push(next); added++; render();
              const c = area.lastElementChild; c.classList.add('drop-in', 'oo-good');
              say(o, `<span class="good">added ${kind === 'type' ? 'class ' + next : 'fun ' + next + '()'}:</span> one new block. Nothing that already works was opened.`);
              await sleep(900); if (el.isConnected) c.classList.remove('oo-good');
            } else {
              const old = [...area.children];
              have.push(next);
              old.forEach((c, i) => {
                const row = mode === 'sealed' ? [next, ops[i]] : [types[i], next];
                const ln = h('div', { class: 'oo-line oo-ln-err drop-in', html: hl(mode === 'sealed' ? `    // missing: is ${next}` : `    // missing: override fun ${next}()`) });
                c.box.lastElementChild.before(ln); c.ln = ln; c.row = row;
                c.classList.replace('oo-on', 'oo-bad'); replay(c, 'shake');
              });
              say(o, mode === 'sealed'
                ? `<span class="bad">compile error ×${old.length}:</span> 'when' expression must be exhaustive. Add the 'is ${next}' branch.`
                : `<span class="bad">compile error ×${old.length}:</span> Class is not abstract and does not implement abstract member '${next}'.`);
              await sleep(1100);
              for (const c of old) {
                if (!el.isConnected) return;
                c.ln.className = 'oo-line oo-ln-ok'; c.ln.innerHTML = hl(branch(...c.row));
                c.classList.replace('oo-bad', 'oo-warn'); edits++;
                stat.innerHTML = `existing code edited: <b>${edits}</b> · new code added: <b>${added}</b>`;
                await sleep(380);
              }
              say(o, `<span class="bad">fixed by editing ${old.length} existing ${mode === 'sealed' ? 'functions' : 'classes'}.</span> Safe, because the compiler found them all, but not closed.`);
              await sleep(500); if (el.isConnected) render();
            }
            busy = false;
          }
          const modeBtns = [
            cmd('sealed interface Payment', () => setMode('sealed')),
            cmd('interface PaymentMethod', () => setMode('open')),
          ];
          function setMode(m) {
            if (busy) return;
            mode = m; press(modeBtns, modeBtns[m === 'sealed' ? 0 : 1]); edits = 0; added = 0; render(); replay(area, 'pop-soft');
            say(o, m === 'sealed' ? 'Sealed: operations are functions with a when. Each card is one function.' : 'Open: each type is a class that carries its own operations. Each card is one class.');
          }
          press(modeBtns, modeBtns[0]); render();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            area, stat,
            h('div', { class: 'controls' }, act('Add a payment type', () => grow('type')), act('Add an operation', () => grow('op'))),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'liskov',
        title: 'L: Liskov substitution',
        tagline: 'A subtype must keep every promise its parent made.',
        level: 'advanced',
        body: `
<p>The Liskov substitution principle says that anywhere code expects a type, any subtype must work without surprises. Compiling is not enough. The subtype has to keep the parent’s behaviour: the same rules on inputs, the same guarantees on results, no new exceptions.</p>
<p>The classic case is <code>Square</code> extending <code>Rectangle</code>. A square must keep both sides equal, so setting the width also sets the height. Code written for rectangles assumes the two are independent, and it breaks.</p>
<p>The Android flavour is an implementation that throws <code>UnsupportedOperationException</code> for half its interface, like a read-only <code>Settings</code> whose <code>put()</code> throws. If a type can’t keep a promise, it should implement a smaller interface. Run the same caller with each object below.</p>`,
        code: `open class Rectangle(width: Int, height: Int) {
    open var width = width
    open var height = height
    val area: Int get() = width * height
}

class Square(side: Int) : Rectangle(side, side) {
    override var width: Int
        get() = super.width
        set(value) { super.width = value; super.height = value }
    override var height: Int
        get() = super.height
        set(value) { super.width = value; super.height = value }
}

fun stretch(r: Rectangle) {
    r.width = 10
    r.height = 4
    check(r.area == 40)   // fails for a Square: area is 16
}

// Fix: no shared mutable parent. Each shape keeps its own promise.
sealed interface Shape { val area: Int }
data class Rect(val w: Int, val h: Int) : Shape { override val area get() = w * h }
data class Sq(val side: Int) : Shape { override val area get() = side * side }`,
        remember: 'If it compiles but surprises the caller, it is not a real subtype.',
        terms: [
          { term: 'Liskov substitution principle', def: 'The rule that objects of a subtype must be usable anywhere the parent type is expected without breaking the caller.' },
          { term: 'Contract', def: 'The promises a type makes about inputs, results and side effects that every implementation must keep.' },
          { term: 'Refused bequest', def: 'A subclass that inherits methods it can’t support and stubs them out or throws.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Model both shapes as immutable values behind one interface.', code: 'interface Shape { val area: Int }\ndata class Rect(val w: Int, val h: Int) : Shape {\n    override val area: Int get() = w * h\n}\ndata class Square(val side: Int) : [[Shape]] {\n    override val area: Int get() = [[side * side|side*side]]\n}', why: 'Neither shape inherits setters it can’t honour. Each one only promises an area, and keeps that promise.' },
          { type: 'bug', prompt: 'A settings screen crashes when it saves to the defaults object. Tap the line that breaks the contract.', code: 'interface Settings {\n    fun get(key: String): String?\n    fun put(key: String, value: String)\n}\nclass BundledDefaults(private val map: Map<String, String>) : Settings {\n    override fun get(key: String) = map[key]\n    override fun put(key: String, value: String) = throw UnsupportedOperationException()\n}', bug: 6, fix: '    // can’t honour put(): implement a read-only interface instead of Settings', why: 'Any caller holding a <code>Settings</code> may call <code>put()</code>. A type that throws there is not a valid substitute. Split out a read-only interface.' },
        ],
        quiz: [
          { q: 'Square extends Rectangle and compiles. Why can it still break LSP?', options: ['Squares are slower', 'It changes behaviour callers rely on: width and height are no longer independent', 'It needs an interface'], a: 1, why: 'LSP is about behaviour. The compiler checks signatures, not promises.' },
          { q: 'Which of these breaks LSP?', options: ['An override that returns a more specific type', 'An override that throws for inputs the parent accepted', 'An override that logs extra info'], a: 1, why: 'Rejecting input the parent accepted strengthens the precondition, and callers written for the parent will fail.' },
        ],
        deeper: [
          {
            title: 'Accept more, promise more, never the reverse',
            body: `<p>A contract has two sides. The precondition is what the method accepts. The postcondition is what it guarantees back. A valid subtype may accept <em>more</em> than the parent, and may promise <em>more</em>. It may not accept less or promise less.</p>
<p>Here the parent <code>Uploader</code> accepts files up to 10 MB and returns an https URL. The caller uploads a 5 MB avatar and loads the URL. Try each implementation.</p>`,
            code: `interface Uploader {
    /** Accepts files up to 10 MB. Returns an https URL. */
    suspend fun upload(file: File): Uri
}

class CdnUploader : Uploader { /* up to 100 MB: accepts more, fine */ }
class TinyUploader : Uploader {
    override suspend fun upload(file: File): Uri {
        require(file.length() <= 1_000_000)   // accepts less: breaks callers
        TODO()
    }
}`,
            visual(el) {
              const IMPLS = [
                { name: 'CdnUploader', max: 100, url: 'https://cdn.example.com/a.jpg', note: 'accepts up to 100 MB' },
                { name: 'SigningUploader', max: 10, url: 'https://img.example.com/a.jpg?sig=9f', note: 'adds a signature' },
                { name: 'TinyUploader', max: 1, url: '', note: 'accepts up to 1 MB' },
                { name: 'MirrorUploader', max: 10, url: 'http://mirror.example.com/a.jpg', note: 'returns http' },
              ];
              let pick = IMPLS[0], busy = false;
              const steps = ['val url = uploader.upload(avatar)   // 5 MB', 'check(url.scheme == "https")', 'imageLoader.load(url)'].map(t => h('div', { class: 'oo-line', html: hl(t) }));
              const pre = h('span', { class: 'oo-pill' }), post = h('span', { class: 'oo-pill' });
              const o = out('');
              const btns = IMPLS.map(x => cmd(x.name, () => { if (busy) return; pick = x; press(btns, btns[IMPLS.indexOf(x)]); paint(); }));
              function paint() {
                steps.forEach(s => s.classList.remove('oo-cur', 'oo-ln-ok', 'oo-ln-err'));
                pre.textContent = `accepts ≤ ${pick.max} MB`; pre.className = 'oo-pill ' + (pick.max >= 10 ? 'oo-ok' : 'oo-err');
                post.textContent = pick.url ? (pick.url.startsWith('https') ? 'returns https' : 'returns http') : 'returns https';
                post.className = 'oo-pill ' + (!pick.url || pick.url.startsWith('https') ? 'oo-ok' : 'oo-err');
                say(o, `${pick.name}: ${pick.note}. Run the caller.`);
              }
              async function run() {
                if (busy) return; busy = true; paint();
                steps[0].classList.add('oo-cur'); await sleep(600); if (!el.isConnected) return;
                steps[0].classList.remove('oo-cur');
                if (pick.max < 5) {
                  steps[0].classList.add('oo-ln-err'); replay(pre, 'shake');
                  say(o, '<span class="bad">IllegalArgumentException:</span> Failed requirement. <span class="muted">The parent accepts 5 MB, so the caller had every right to send it.</span>');
                  busy = false; return;
                }
                steps[0].classList.add('oo-ln-ok'); steps[1].classList.add('oo-cur');
                await sleep(500); if (!el.isConnected) return;
                steps[1].classList.remove('oo-cur');
                if (!pick.url.startsWith('https')) {
                  steps[1].classList.add('oo-ln-err'); replay(post, 'shake');
                  say(o, `<span class="bad">IllegalStateException: Check failed.</span> got ${pick.url} <span class="muted">The parent promised https and this one promises less.</span>`);
                  busy = false; return;
                }
                steps[1].classList.add('oo-ln-ok'); steps[2].classList.add('oo-ln-ok'); replay(steps[2], 'pop');
                say(o, `<span class="good">works:</span> ${pick.max > 10 ? 'accepting more than the parent never hurts a caller.' : 'promising more than the parent never hurts a caller.'}`);
                busy = false;
              }
              press(btns, btns[0]); paint();
              el.append(
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'oo-pair' },
                  h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'parent contract'), h('div', { class: 'oo-row' }, pill('accepts ≤ 10 MB', 'oo-acc'), pill('returns https', 'oo-acc')), h('span', { class: 'oo-label' }, 'this implementation'), h('div', { class: 'oo-row' }, pre, post)),
                  h('div', { class: 'oo-code' }, steps)),
                h('div', { class: 'controls' }, cmd('uploadAvatar(uploader)', run)),
                o);
            },
          },
          {
            title: 'Write the contract once as tests',
            body: `<p>Promises in a doc comment are easy to break. Put them in an abstract test class instead, with one abstract factory method. Each implementation gets a tiny subclass that runs every contract test against it.</p>
<p>A type that fails the contract is not a valid substitute. Often the fix is a smaller interface that it can fully honour, and a smaller contract to match.</p>`,
            code: `abstract class SettingsContract {
    abstract fun create(): Settings

    @Test fun getReturnsWhatPutStored() {
        val s = create()
        s.put("theme", "dark")
        assertEquals("dark", s.get("theme"))
    }
    @Test fun missingKeyIsNull() = assertNull(create().get("nope"))
}

class InMemorySettingsTest : SettingsContract() { override fun create() = InMemorySettings() }
class DataStoreSettingsTest : SettingsContract() { override fun create() = DataStoreSettings(testStore()) }`,
            visual(el) {
              const TESTS = [{ n: 'get returns what put stored', w: true }, { n: 'missing key is null', w: false }, { n: 'put overwrites', w: true }];
              const IMPLS = ['InMemory', 'DataStore', 'BundledDefaults'];
              let split = false, busy = false;
              const cells = [];
              const grid = h('div', { class: 'oo-matrix', role: 'table', 'aria-label': 'Contract test results' });
              const o = out('Run the contract suite against every implementation.');
              function build() {
                grid.replaceChildren(h('span', { class: 'oo-label' }, 'test'), ...IMPLS.map(i => h('span', { class: 'oo-label oo-raw' }, i)));
                cells.length = 0;
                TESTS.forEach((t, r) => {
                  grid.append(h('span', { class: 'oo-stat' }, t.n));
                  cells[r] = IMPLS.map((im, c) => { const skip = split && c === 2 && t.w; const x = h('span', { class: 'oo-cell' + (skip ? ' oo-na' : '') }, skip ? 'n/a' : ''); grid.append(x); return x; });
                });
              }
              const sw = h('input', { type: 'checkbox', id: 'oo-lsp-split' });
              sw.addEventListener('change', () => { if (busy) { sw.checked = split; return; } split = sw.checked; build(); say(o, split ? 'BundledDefaults now implements ReadOnlySettings. Only the read tests apply to it.' : 'BundledDefaults claims to be a full Settings again.'); });
              async function run() {
                if (busy) return; busy = true; build();
                let fails = 0;
                for (let c = 0; c < IMPLS.length; c++) for (let r = 0; r < TESTS.length; r++) {
                  const x = cells[r][c];
                  if (x.classList.contains('oo-na')) continue;
                  x.textContent = '…'; await sleep(170); if (!el.isConnected) return;
                  const ok = !(c === 2 && TESTS[r].w);
                  if (!ok) fails++;
                  x.textContent = ok ? 'pass' : 'fail'; x.classList.add(ok ? 'oo-pass' : 'oo-fail'); replay(x, ok ? 'pop-soft' : 'shake');
                }
                say(o, fails ? `<span class="bad">${fails} failed:</span> BundledDefaults.put() throws UnsupportedOperationException. It is not a valid Settings.` : '<span class="good">all green:</span> every type keeps every promise it makes.');
                busy = false;
              }
              build();
              el.append(grid,
                h('label', { class: 'switch', for: 'oo-lsp-split' }, sw, 'BundledDefaults implements ReadOnlySettings instead'),
                h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Run contract tests')),
                o);
            },
          },
          {
            title: 'Read-only is not immutable',
            body: `<p>Kotlin's <code>MutableList</code> is a subtype of <code>List</code>, and that is a valid substitution. <code>List</code> only promises that <em>you</em> can read. It never promised that nobody else can write.</p>
<p>So a function that keeps a <code>List</code> it was given may see it change later. If you need a value that can't change, copy it with <code>toList()</code>, or use a truly immutable type such as <code>PersistentList</code> from kotlinx.collections.immutable.</p>`,
            code: `class Playlist(songs: List<Song>) {
    private val songs = songs.toList()   // own copy: callers can't change it later
}

val source = mutableListOf(song1)
val p = Playlist(source)
source += song2          // p.songs is unaffected`,
          },
        ],
        mistakes: [
          { title: 'Narrowing what an override accepts', bad: 'open class Player {\n    open fun setVolume(level: Int) { /* 0..100 */ }\n}\nclass KidsPlayer : Player() {\n    override fun setVolume(level: Int) {\n        require(level <= 50)\n    }\n}', good: 'class KidsPlayer : Player() {\n    override fun setVolume(level: Int) {\n        super.setVolume(level.coerceAtMost(50))\n    }\n}', why: 'Code written for <code>Player</code> may pass 80 and crash. Accept the same range and handle it, here by capping.' },
          { title: 'A silent no-op override', bad: 'class GuestAccount : Account {\n    override suspend fun syncFavorites() {\n        // guests have no server account\n    }\n}', good: 'interface Account { val name: String }\ninterface SyncedAccount : Account {\n    suspend fun syncFavorites()\n}\nclass GuestAccount : Account', why: 'A caller that syncs and then shows "Saved" now lies to the user. Doing nothing breaks the promise as surely as throwing. Leave the method out of types that can’t do it.' },
          { title: 'Casting a read-only list to mutable', bad: 'fun addDefault(tags: List<String>) {\n    (tags as MutableList).add("news")\n}\naddDefault(listOf("kotlin", "android"))   // throws', good: 'fun withDefault(tags: List<String>): List<String> =\n    tags + "news"', why: 'The cast compiles and even succeeds, but <code>listOf</code> returns a fixed-size list. <code>add</code> throws <code>UnsupportedOperationException</code>. Return a new list instead.' },
        ],
        visual(el) {
          const U = 16;
          const subs = {
            rect: { src: 'Rectangle(2, 2)', set: (s, k, v) => { s[k] = v; } },
            square: { src: 'Square(2)', set: (s, k, v) => { s.w = v; s.h = v; } },
            sq2: { src: 'Sq(2)', decl: 'val r: Shape = Sq(2)', immut: true },
          };
          let pick = 'rect', busy = false, s = { w: 2, h: 2 };
          const lines = ['fun stretch(r: Rectangle) {', '    r.width = 10', '    r.height = 4', '    check(r.area == 40)', '}'].map(t => h('div', { class: 'oo-line', html: hl(t) }));
          const shape = h('div', { class: 'oo-shape' });
          const o = out('Pick an object and pass it to stretch().');
          function paint() { shape.style.width = `${s.w * U}px`; shape.style.height = `${s.h * U}px`; shape.textContent = s.w >= 3 && s.h >= 2 ? `${s.w}×${s.h}` : ''; }
          const btns = Object.entries(subs).map(([k, x]) => cmd(x.decl || `val r = ${x.src}`, () => { if (busy) return; pick = k; s = { w: 2, h: 2 }; shape.className = 'oo-shape'; lines.forEach(l => l.classList.remove('oo-cur', 'oo-ln-ok', 'oo-ln-err')); paint(); press(btns, btns[Object.keys(subs).indexOf(k)]); say(o, `${hl(x.src)} ready. Run stretch(r).`); }));
          async function run() {
            if (busy) return; busy = true;
            const x = subs[pick];
            s = { w: 2, h: 2 }; paint(); shape.className = 'oo-shape';
            lines.forEach(l => l.classList.remove('oo-cur', 'oo-ln-ok', 'oo-ln-err'));
            if (x.immut) {
              lines[0].classList.add('oo-ln-err'); replay(lines[0], 'shake');
              say(o, `<span class="bad">compile error:</span> Argument type mismatch: actual type is 'Shape', but 'Rectangle' was expected. <span class="muted">An immutable Sq never promised setters, so it can’t be misused.</span>`);
              busy = false; return;
            }
            lines[0].classList.add('oo-cur'); await sleep(450);
            for (const [i, k, v] of [[1, 'w', 10], [2, 'h', 4]]) {
              if (!el.isConnected) return;
              lines[i - 1].classList.remove('oo-cur'); lines[i].classList.add('oo-cur');
              x.set(s, k, v); paint();
              say(o, `${hl(lines[i].textContent.trim())} <span class="muted">→ now ${s.w} × ${s.h}</span>`);
              await sleep(800);
            }
            lines[2].classList.remove('oo-cur');
            const area = s.w * s.h, ok = area === 40;
            lines[3].classList.add(ok ? 'oo-ln-ok' : 'oo-ln-err');
            shape.classList.add(ok ? 'oo-pass' : 'oo-fail');
            if (!ok) replay(shape, 'shake'); else replay(shape, 'pop');
            say(o, ok ? `<span class="good">ok:</span> area = ${area}. Rectangle kept its promise.` : `<span class="bad">IllegalStateException: Check failed.</span> area = ${area}, expected 40. Setting height also changed width.`);
            busy = false;
          }
          press(btns, btns[0]); paint();
          el.append(
            h('div', { class: 'oo-pair' }, h('div', { class: 'oo-code' }, lines), h('div', { class: 'oo-canvas' }, shape)),
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'controls' }, cmd('stretch(r)', run)),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'isp',
        title: 'I: Interface segregation',
        tagline: 'Many small interfaces beat one fat one.',
        level: 'intermediate',
        body: `
<p>The interface segregation principle says no class should be forced to depend on methods it doesn’t use. A fat <code>MediaPlayer</code> interface with <code>play</code>, <code>pause</code>, <code>seek</code> and <code>download</code> forces a live radio stream to “implement” seeking and downloading. It ends up with <code>TODO()</code> stubs that crash at runtime.</p>
<p>Split the fat interface into small roles: <code>Playable</code>, <code>Seekable</code>, <code>Downloadable</code>. Each class implements only what it can really do. Each function asks only for the role it needs, so <code>skipIntro(p: Seekable)</code> can’t even be handed a radio.</p>
<p>The bug moves from a crash in a user’s hands to a red line in your editor. Try the same calls with both designs below.</p>`,
        code: `// Fat: every player must pretend it can do everything
interface MediaPlayer {
    fun play(); fun pause(); fun seek(ms: Long); fun download()
}

// Split: small roles. Implement only what you can do.
interface Playable { fun play(); fun pause() }
interface Seekable { fun seek(ms: Long) }
interface Downloadable { suspend fun download() }

class LiveRadio(private val player: ExoPlayer) : Playable {
    override fun play() = player.play()
    override fun pause() = player.pause()
}

class Podcast(
    private val player: ExoPlayer,
    private val downloads: EpisodeDownloads,
) : Playable, Seekable, Downloadable {
    override fun play() = player.play()
    override fun pause() = player.pause()
    override fun seek(ms: Long) = player.seekTo(ms)
    override suspend fun download() = downloads.save()
}

fun skipIntro(p: Seekable) = p.seek(30_000)   // LiveRadio can't be passed in`,
        remember: 'Ask for the smallest interface you need. Implement only the roles you can really fill.',
        terms: [
          { term: 'Interface segregation principle', def: 'The rule that clients should not be forced to depend on methods they do not use, so large interfaces are split into small roles.' },
          { term: 'Role interface', def: 'A small interface that describes one capability, such as Seekable, rather than everything a class can do.' },
          { term: 'Fat interface', def: 'An interface with so many methods that most implementations can only support part of it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give each class only the roles it can fill, and ask only for the role you need.', code: 'interface Playable { fun play() }\ninterface Seekable { fun seek(ms: Long) }\n\nclass Podcast : Playable, [[Seekable]] { /* ... */ }\nclass LiveRadio : [[Playable]] { /* ... */ }\n\nfun skipIntro(p: [[Seekable]]) = p.seek(30_000)', why: 'A podcast can seek, a live stream can’t. <code>skipIntro</code> needs only seeking, so it asks for <code>Seekable</code>.' },
          { type: 'bug', prompt: 'The player screen calls <code>seek()</code> on any MediaPlayer, and live radio crashes. Tap the line that crashes.', code: 'interface MediaPlayer {\n    fun play()\n    fun seek(ms: Long)\n}\nclass LiveRadio(private val stream: ExoPlayer) : MediaPlayer {\n    override fun play() = stream.play()\n    override fun seek(ms: Long) = TODO("live radio can\'t seek")\n}', bug: 6, fix: '    // drop seek(): split Seekable out of MediaPlayer and don’t implement it here', why: '<code>TODO()</code> throws <code>NotImplementedError</code> when called. The fat interface forced a promise LiveRadio can’t keep.' },
        ],
        quiz: [
          { q: 'Why is <code>override fun seek(ms: Long) = TODO()</code> a design smell?', options: ['TODO is deprecated', 'The class was forced to promise something it can’t do', 'It is slower'], a: 1, why: 'A stub that throws means the interface asks for more than this class supports. It also breaks Liskov.' },
          { q: 'After splitting, what happens if you call <code>skipIntro(radio)</code>?', options: ['It crashes at runtime', 'It does not compile', 'It silently does nothing'], a: 1, why: 'LiveRadio is not Seekable, so the compiler rejects the call.' },
        ],
        deeper: [
          {
            title: 'Fat interfaces in the Android SDK',
            body: `<p>The SDK has fat interfaces of its own. <code>TextWatcher</code> makes you implement <code>beforeTextChanged</code>, <code>onTextChanged</code> and <code>afterTextChanged</code>, even if you only care about one. Most implementations leave two of them empty.</p>
<p>The core-ktx library wraps such listeners in small functions. <code>doAfterTextChanged { }</code> asks for exactly one lambda and fills in the rest. Type in the field and compare what you had to write.</p>`,
            code: `// The full interface: three methods, two of them empty
search.addTextChangedListener(object : TextWatcher {
    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
    override fun afterTextChanged(s: Editable?) { vm.onQuery(s.toString()) }
})

// core-ktx: ask only for the role you need
search.doAfterTextChanged { vm.onQuery(it.toString()) }`,
            visual(el) {
              const WATCHER = [
                ['search.addTextChangedListener(object : TextWatcher {', null],
                ['    override fun beforeTextChanged(...) {}', 'idle'],
                ['    override fun onTextChanged(...) {}', 'idle'],
                ['    override fun afterTextChanged(s: Editable?) { vm.onQuery(s.toString()) }', 'used'],
                ['})', null],
              ];
              const KTX = [['search.doAfterTextChanged { vm.onQuery(it.toString()) }', 'used']];
              let ktx = false, n = 0;
              const code = h('div', { class: 'oo-code' });
              const stat = h('span', { class: 'oo-stat' });
              const field = h('input', { class: 'oo-isp-field', id: 'oo-isp-field', type: 'text', value: 'kot', autocomplete: 'off', spellcheck: 'false' });
              const o = out('');
              let lineEls = [];
              function paint() {
                const L = ktx ? KTX : WATCHER;
                lineEls = L.map(([t, role]) => { const d = h('div', { class: 'oo-line', html: hl(t) }); d.role = role; return d; });
                code.replaceChildren(...lineEls);
                stat.innerHTML = ktx ? 'callbacks you wrote: <b>1</b>, empty ones: <b>0</b>' : 'callbacks you wrote: <b>3</b>, empty ones: <b>2</b>';
              }
              function onInput() {
                n++;
                const used = lineEls.filter(l => l.role);
                used.forEach((l, i) => setTimeout(() => { if (el.isConnected) replay(l, l.role === 'used' ? 'oo-isp-blink' : 'oo-isp-idle'); }, i * 160));
                say(o, ktx
                  ? `${hl(`vm.onQuery("${field.value}")`)} <span class="muted">one callback ran</span>`
                  : `${hl(`vm.onQuery("${field.value}")`)} <span class="muted">three callbacks ran, two of them did nothing</span>`);
              }
              field.addEventListener('input', onInput);
              const typeBtn = cmd('type "l"', () => { if (field.value.length > 16) field.value = 'kot'; field.value += 'l'; onInput(); });
              const modes = [act('object : TextWatcher', () => { ktx = false; press(modes, modes[0]); paint(); say(o, 'Three methods to implement. Type to see which ones run.'); }), act('doAfterTextChanged { }', () => { ktx = true; press(modes, modes[1]); paint(); say(o, 'One lambda. core-ktx supplies the empty methods for you.'); })];
              press(modes, modes[0]); paint();
              say(o, 'Type in the field or press the type button.');
              el.append(
                h('div', { class: 'controls' }, modes),
                code, stat,
                h('label', { class: 'oo-label', for: 'oo-isp-field' }, 'search field'),
                h('div', { class: 'oo-row' }, field, typeBtn),
                o);
            },
          },
          {
            title: 'Ask for a capability at runtime',
            body: `<p>Sometimes you hold the broad role and want to offer more when the object can do it. A player screen gets a <code>Playable</code>, and shows a seek bar only if that object is also <code>Seekable</code>. Check with <code>is</code> or <code>as?</code>, and the smart cast gives you the narrower role.</p>
<p>LiveRadio never pretends to seek. The screen just doesn't offer it.</p>`,
            code: `@Composable
fun PlayerControls(player: Playable) {
    Row {
        PlayPauseButton(player)
        if (player is Seekable) SeekBar(onSeek = player::seek)   // smart cast
        (player as? Downloadable)?.let { DownloadButton(it) }
    }
}`,
            visual(el) {
              const ITEMS = [
                { n: 'LiveRadio', roles: ['Playable'] },
                { n: 'Podcast', roles: ['Playable', 'Seekable', 'Downloadable'] },
                { n: 'LocalSong', roles: ['Playable', 'Seekable'] },
              ];
              let cur = ITEMS[1], busy = false;
              const decl = h('div', { class: 'kt oo-wrap' });
              const checks = [
                { src: 'if (player is Seekable)', role: 'Seekable' },
                { src: 'player as? Downloadable', role: 'Downloadable' },
              ].map(c => { const res = h('span', { class: 'oo-pill' }); const row = h('div', { class: 'oo-row' }, h('span', { class: 'kt', html: hl(c.src) }), res); row.c = c; row.res = res; return row; });
              const ctrls = h('div', { class: 'oo-isp-ctrls' });
              const screen = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'PlayerControls'), ctrls);
              const o = out('');
              const btns = ITEMS.map(it => cmd(`PlayerControls(${it.n}())`, () => show(it)));
              async function show(it) {
                if (busy) return; busy = true;
                cur = it; press(btns, btns[ITEMS.indexOf(it)]);
                decl.innerHTML = hl(`class ${it.n} : ${it.roles.join(', ')}`); replay(decl, 'pop-soft');
                ctrls.replaceChildren(h('span', { class: 'oo-pill oo-acc drop-in' }, 'Play / Pause'));
                for (const row of checks) {
                  row.res.className = 'oo-pill oo-ghost'; row.res.textContent = '...';
                }
                for (const row of checks) {
                  await sleep(380); if (!el.isConnected) return;
                  const yes = it.roles.includes(row.c.role);
                  row.res.className = `oo-pill ${yes ? 'oo-ok' : 'oo-ghost'}`; row.res.textContent = yes ? 'true' : 'false';
                  replay(row.res, 'pop');
                  if (yes) ctrls.append(row.c.role === 'Seekable' ? h('div', { class: 'oo-isp-seek drop-in', role: 'img', 'aria-label': 'Seek bar' }) : h('span', { class: 'oo-pill oo-acc drop-in' }, 'Download'));
                }
                const extra = it.roles.length - 1;
                say(o, extra ? `${it.n} can do ${extra} more thing${extra > 1 ? 's' : ''}, so the screen shows ${extra > 1 ? 'both extra controls' : 'a seek bar'}.` : 'LiveRadio is only Playable. No stub, no crash, no seek bar.');
                busy = false;
              }
              decl.innerHTML = hl('class Podcast : Playable, Seekable, Downloadable');
              press(btns, btns[1]);
              ctrls.append(h('span', { class: 'oo-pill oo-acc' }, 'Play / Pause'), h('div', { class: 'oo-isp-seek', role: 'img', 'aria-label': 'Seek bar' }), h('span', { class: 'oo-pill oo-acc' }, 'Download'));
              checks.forEach(r => { r.res.className = 'oo-pill oo-ok'; r.res.textContent = 'true'; });
              say(o, 'Hand the screen a different player.');
              el.append(
                h('div', { class: 'controls' }, btns), decl,
                h('div', { class: 'oo-pair' }, h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'checks'), checks), screen),
                o);
            },
          },
          {
            title: 'Split by client: readers and writers',
            body: `<p>Roles don't have to follow what an object is. Often the best split follows who calls it. Most screens only read articles, and one editor screen writes them. Give each the interface it needs, and let one repository implement both.</p>
<p>A reading screen then can't delete anything by accident, and its test fake has two methods instead of ten.</p>`,
            code: `interface ArticleReader {
    fun observe(id: String): Flow<Article>
    fun latest(): Flow<List<Article>>
}
interface ArticleWriter {
    suspend fun save(article: Article)
    suspend fun delete(id: String)
}

class ArticleRepository @Inject constructor(
    private val dao: ArticleDao,
) : ArticleReader, ArticleWriter { /* ... */ }
// bind both interfaces to ArticleRepository with @Binds

@HiltViewModel
class ReaderViewModel @Inject constructor(articles: ArticleReader) : ViewModel()
@HiltViewModel
class EditorViewModel @Inject constructor(articles: ArticleWriter) : ViewModel()`,
          },
        ],
        underHood: {
          body: `<p>Small interfaces cost nothing at runtime. Implementing five of them adds five entries to the class's interface list, and a call through any of them is one <code>invokeinterface</code>. <code>player is Seekable</code> compiles to a JVM <code>instanceof</code>, and the smart cast after it is a plain <code>checkcast</code>.</p>
<p>The <code>TODO()</code> stubs that a fat interface forces on you have a story too. <code>TODO()</code> is an inline function that returns <code>Nothing</code> and always throws <code>NotImplementedError</code>. Since <code>Nothing</code> fits any return type, a stub compiles anywhere, and the crash waits for runtime.</p>`,
          code: `// Kotlin
if (player is Seekable) player.seek(30_000)

// JVM, simplified
if (player instanceof Seekable) {
    ((Seekable) player).seek(30_000L);   // checkcast, then invokeinterface
}`,
        },
        mistakes: [
          { title: 'Asking for the whole repository', bad: 'class TitleBar(private val repo: ArticleRepository) {\n    fun title(id: String) = repo.observe(id).map { it.title }\n}\n// its fake must stub all ten repository methods', good: 'class TitleBar(private val articles: ArticleReader) {\n    fun title(id: String) = articles.observe(id).map { it.title }\n}', why: 'Depending on the fat type ties the class to methods it never calls, and every fake has to stub them. Ask for the smallest role that covers the call.' },
          { title: 'Empty default bodies to dodge the split', bad: 'interface MediaPlayer {\n    fun play()\n    fun seek(ms: Long) {}      // "optional"\n    fun download() {}\n}\nclass LiveRadio : MediaPlayer {\n    override fun play() { /* ... */ }\n}', good: 'interface Playable { fun play() }\ninterface Seekable { fun seek(ms: Long) }\nclass LiveRadio : Playable {\n    override fun play() { /* ... */ }\n}', why: 'The <code>TODO()</code> crash turns into silence: the seek button does nothing and nobody knows why. The type still claims a skill it doesn\'t have.' },
          { title: 'Splitting roles that always travel together', bad: 'interface Playable { fun play() }\ninterface Pausable { fun pause() }\n\nfun controls(p: Playable, q: Pausable)   // always the same object', good: 'interface Playable {\n    fun play()\n    fun pause()\n}\n\nfun controls(p: Playable)', why: 'If no class implements one without the other and no caller needs just one, the split only adds ceremony. Split where callers really differ.' },
        ],
        visual(el) {
          const caps = { LiveRadio: ['play'], Podcast: ['play', 'seek', 'download'] };
          const roles = { play: 'Playable', seek: 'Seekable', download: 'Downloadable' };
          let mode = 'fat', who = 'LiveRadio', busy = false;
          const decl = h('div', { class: 'kt oo-wrap' });
          const mlist = h('div', { class: 'oo-row' });
          const card = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'Implementation'), decl, mlist);
          const now = h('p', { class: 'phone-note' }, 'Stopped');
          const screen = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Player screen'), now);
          const o = out('Pick a design and an object, then call things on it.');
          function paint() {
            const can = caps[who];
            decl.innerHTML = hl(mode === 'fat' ? `class ${who} : MediaPlayer` : `class ${who} : ${can.map(c => roles[c]).join(', ')}`);
            const ms = mode === 'fat' ? ['play', 'seek', 'download'] : can;
            mlist.replaceChildren(...ms.map(m => pill(can.includes(m) ? `${m}()` : `${m}() = TODO()`, can.includes(m) ? 'oo-acc' : 'oo-err')));
            card.classList.toggle('oo-bad', mode === 'fat' && can.length < 3); card.classList.toggle('oo-on', !(mode === 'fat' && can.length < 3));
          }
          const modeBtns = [cmd('interface MediaPlayer', () => setMode('fat')), cmd('Playable / Seekable / Downloadable', () => setMode('split'))];
          const whoBtns = Object.keys(caps).map(k => cmd(`val p = ${k}()`, () => { if (busy) return; who = k; press(whoBtns, whoBtns[Object.keys(caps).indexOf(k)]); now.textContent = 'Stopped'; screen.className = 'oo-card'; paint(); replay(card, 'pop-soft'); say(o, `${k} ready.`); }));
          function setMode(m) { if (busy) return; mode = m; press(modeBtns, modeBtns[m === 'fat' ? 0 : 1]); screen.className = 'oo-card'; now.textContent = 'Stopped'; paint(); replay(card, 'pop-soft'); say(o, m === 'fat' ? 'One fat interface: every class must list every method.' : 'Small roles: each class lists only what it can do.'); }
          const calls = [
            { cap: 'play', src: 'p.play()', fn: 'play()', done: () => `Playing ${who === 'LiveRadio' ? 'Radio live' : 'Episode 12'}` },
            { cap: 'seek', src: 'skipIntro(p)', fn: 'skipIntro(p: Seekable)', done: () => 'Skipped to 0:30' },
            { cap: 'download', src: 'saveOffline(p)', fn: 'saveOffline(p: Downloadable)', done: () => 'Saved for offline' },
          ];
          async function call(c) {
            if (busy) return; busy = true;
            const can = caps[who].includes(c.cap);
            screen.className = 'oo-card';
            if (can) { now.textContent = c.done(); screen.classList.add('oo-good'); replay(screen, 'pop'); say(o, `${hl(c.src)} <span class="muted">→</span> <span class="good">ok</span>`); }
            else if (mode === 'fat') {
              now.textContent = 'App stopped'; screen.classList.add('oo-bad'); replay(screen, 'shake');
              say(o, `${hl(c.src)} <span class="muted">→ compiled fine, then at runtime:</span> <span class="bad">NotImplementedError: An operation is not implemented.</span>`);
            } else {
              replay(decl, 'shake'); screen.classList.add('oo-warn');
              say(o, `${hl(c.src)} <span class="muted">→</span> <span class="bad">compile error:</span> Argument type mismatch: actual type is '${who}', but '${roles[c.cap]}' was expected. <span class="muted">Caught before it ships.</span>`);
            }
            await sleep(500); busy = false;
          }
          press(modeBtns, modeBtns[0]); press(whoBtns, whoBtns[0]); paint();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'controls' }, whoBtns),
            h('div', { class: 'oo-pair' }, card, screen),
            h('div', { class: 'controls' }, calls.map(c => cmd(c.src, () => call(c)))),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'dip',
        title: 'D: Dependency inversion',
        tagline: 'High-level code depends on interfaces. Details plug in from outside.',
        level: 'advanced',
        body: `
<p>The dependency inversion principle says high-level policy should not depend on low-level details. Both should depend on an abstraction. A <code>NewsViewModel</code> should not build a Retrofit client. It should ask for a <code>NewsRepository</code>, and something else decides which one.</p>
<p>“Inversion” is about the arrows. Without it, the ViewModel points down at the network class. With it, the ViewModel points at the interface, and the network class points <em>up</em> at the same interface by implementing it. Details now depend on policy.</p>
<p>On Android, Hilt does the wiring. A <code>@Binds</code> line in a module is the one place that names the concrete class. Swapping to an offline-first repository changes that line only, and a unit test can pass a fake by hand. Try both setups below.</p>`,
        code: `// High level: knows only the abstraction
interface NewsRepository {
    fun headlines(): Flow<List<Article>>
}

@HiltViewModel
class NewsViewModel @Inject constructor(
    repo: NewsRepository,
) : ViewModel() {
    val headlines: StateFlow<List<Article>> = repo.headlines()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

// Low level: implements the abstraction
class OfflineFirstNewsRepository @Inject constructor(
    private val dao: ArticleDao,
) : NewsRepository {
    override fun headlines() = dao.observeAll()
}

// Wiring: the only place that names the concrete class
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    abstract fun bindNews(impl: OfflineFirstNewsRepository): NewsRepository
}

// Test: no network, no Hilt
val vm = NewsViewModel(FakeNewsRepository(listOf(sampleArticle)))`,
        remember: 'Policy and details both point at the interface. Only the DI module names the concrete class.',
        terms: [
          { term: 'Dependency inversion principle', def: 'The rule that high-level code and low-level details should both depend on abstractions, not on each other.' },
          { term: 'Dependency injection', def: 'Passing an object its dependencies from outside, usually through the constructor, instead of letting it create them.' },
          { term: '@Binds', def: 'A Hilt or Dagger annotation on an abstract module function that tells the graph which implementation to supply for an interface.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tell Hilt which class to provide when someone asks for <code>NewsRepository</code>.', code: '@Module\n@InstallIn(SingletonComponent::class)\nabstract class DataModule {\n    @[[Binds]]\n    abstract fun bindNews(impl: NetworkNewsRepository): [[NewsRepository]]\n}', why: '<code>@Binds</code> maps the interface in the return type to the implementation in the parameter.' },
          { type: 'bug', prompt: 'The binding exists, but tests can’t swap in a fake and moving to offline-first means editing the ViewModel. Tap the line that couples it to a detail.', code: '@Module\n@InstallIn(SingletonComponent::class)\nabstract class DataModule {\n    @Binds\n    abstract fun bindNews(impl: NetworkNewsRepository): NewsRepository\n}\n@HiltViewModel\nclass NewsViewModel @Inject constructor(\n    private val repo: NetworkNewsRepository,\n) : ViewModel()', bug: 8, fix: '    private val repo: NewsRepository,', why: 'Asking for the concrete class skips the abstraction, so the <code>@Binds</code> line has no effect on this ViewModel. Depend on the interface.' },
        ],
        quiz: [
          { q: 'What gets “inverted” in dependency inversion?', options: ['The order of constructor parameters', 'The direction of the arrow: the detail now depends on an abstraction the high-level code owns', 'The call stack'], a: 1, why: 'The low-level class points up at the interface by implementing it, instead of the high-level class pointing down at it.' },
          { q: 'You switch from a network repository to an offline-first one. With DIP and Hilt, what changes?', options: ['NewsViewModel', 'The @Binds line in the module', 'Every screen'], a: 1, why: 'The module is the one place that names the concrete class.' },
          { q: 'Why does DIP make ViewModel tests easier?', options: ['Tests can pass a fake repository through the constructor', 'Hilt runs faster in tests', 'ViewModels don’t need tests'], a: 0, why: 'The ViewModel only needs something that implements the interface, so a fake with fixed data works.' },
        ],
        deeper: [
          {
            title: 'A fake you can drive',
            body: `<p>The interface is the seam a test uses. A hand-written fake backed by a <code>MutableStateFlow</code> lets the test push any data it likes, at any moment, and check how the ViewModel reacts.</p>
<p>Fakes are usually clearer than mocks here. They behave like a tiny real repository, so one fake serves every test and reads like normal code.</p>`,
            code: `class FakeNewsRepository : NewsRepository {
    private val flow = MutableStateFlow<List<Article>>(emptyList())
    fun emit(articles: List<Article>) { flow.value = articles }
    override fun headlines(): Flow<List<Article>> = flow
}

@get:Rule val mainRule = MainDispatcherRule()   // Dispatchers.Main for viewModelScope

@Test fun showsHeadlinesWhenTheRepoEmits() = runTest {
    val repo = FakeNewsRepository()
    val vm = NewsViewModel(repo)
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.headlines.collect() }

    assertEquals(emptyList<Article>(), vm.headlines.value)
    repo.emit(listOf(sampleArticle))
    assertEquals(listOf(sampleArticle), vm.headlines.value)
}`,
            visual(el) {
              const SAMPLES = [['Rain all weekend', 'Ferry times change'], [], ['New park opens', 'Tram extended', 'Market moves']];
              let busy = false;
              const phone = h('div', { class: 'phone oo-mini-phone' });
              const assertLine = h('div', { class: 'oo-line', html: hl('// no assertion yet') });
              const fake = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'test controls the fake'), kt('class FakeNewsRepository : NewsRepository'));
              const vmCard = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'real NewsViewModel'), kt('vm.headlines: StateFlow<List<Article>>'), phone);
              const o = out('');
              function show(list) {
                phone.replaceChildren(...(list.length ? list.map(t => h('div', { class: 'item drop-in' }, t)) : [h('p', { class: 'phone-note drop-in' }, 'No news yet')]));
              }
              async function emit(i) {
                if (busy) return; busy = true;
                const list = SAMPLES[i];
                replay(fake, 'oo-flash');
                say(o, `${hl(`repo.emit(${list.length ? `listOf(${list.length} articles)` : 'emptyList()'})`)} <span class="muted">→ flows into the ViewModel</span>`);
                await sleep(450); if (!el.isConnected) return;
                vmCard.classList.add('oo-on'); show(list);
                assertLine.className = 'oo-line oo-ln-ok';
                assertLine.innerHTML = hl(`assertEquals(${list.length ? `${list.length} articles` : 'emptyList()'}, vm.headlines.value)  // passes`);
                replay(assertLine, 'pop');
                await sleep(400); vmCard.classList.remove('oo-on'); busy = false;
              }
              show([]);
              say(o, 'You are the test. Push data through the fake.');
              el.append(
                h('div', { class: 'oo-pair' }, fake, vmCard),
                h('div', { class: 'oo-code' }, assertLine),
                h('div', { class: 'controls' }, cmd('repo.emit(two articles)', () => emit(0)), cmd('repo.emit(emptyList())', () => emit(1)), cmd('repo.emit(three articles)', () => emit(2))),
                o);
            },
          },
          {
            title: '@Binds for your classes, @Provides for theirs',
            body: `<p><code>@Binds</code> maps an interface to a class you wrote, whose constructor already has <code>@Inject</code>. It is just a declaration, so the module is abstract.</p>
<p>Classes from libraries, like Retrofit or Room, have no <code>@Inject</code> constructor and are made by builders. Build them in a <code>@Provides</code> function. Hilt calls it when something needs the type.</p>`,
            code: `@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun retrofit(client: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(client)
        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
        .build()

    @Provides
    fun newsApi(retrofit: Retrofit): NewsApi = retrofit.create()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds abstract fun news(impl: OfflineFirstNewsRepository): NewsRepository
}`,
          },
          {
            title: 'Scopes decide how long an object lives',
            body: `<p>Without a scope, Hilt builds a new object every time something asks for one. A scope annotation keeps one instance per component: <code>@Singleton</code> for the app, <code>@ActivityRetainedScoped</code> across rotations of one Activity, <code>@ActivityScoped</code> for one Activity instance, and <code>@ViewModelScoped</code> for one ViewModel.</p>
<p>Pick the shortest life that works. A wider scope keeps memory and state around longer than anyone expects. Watch which instances survive each event below.</p>`,
            visual(el) {
              const ROWS = [
                { k: 'none', label: 'ArticleFormatter', scope: 'no scope', two: true },
                { k: 'vm', label: 'NewsPager', scope: '@ViewModelScoped', two: true },
                { k: 'act', label: 'Navigator', scope: '@ActivityScoped' },
                { k: 'ret', label: 'SessionCache', scope: '@ActivityRetainedScoped' },
                { k: 'app', label: 'NewsRepository', scope: '@Singleton' },
              ];
              const RESETS = {
                rotate: ['act'],
                screen: ['none', 'vm'],
                reopen: ['none', 'vm', 'act', 'ret'],
                process: ['none', 'vm', 'act', 'ret', 'app'],
              };
              let n = 0x2a0, busy = false;
              const id = () => '@' + (n += 0x35).toString(16);
              const ids = {};
              const chips = {};
              const grid = h('div', { class: 'oo-matrix oo-scopes' });
              const o = out('');
              function fresh(k) { const r = ROWS.find(x => x.k === k); ids[k] = r.two ? [id(), k === 'none' ? id() : null] : [id()]; if (k === 'vm') ids.vm[1] = ids.vm[0]; }
              function build() {
                grid.replaceChildren(h('span', { class: 'oo-label' }, 'binding'), h('span', { class: 'oo-label' }, 'in ViewModel'), h('span', { class: 'oo-label' }, 'in a use case'));
                ROWS.forEach(r => {
                  grid.append(h('div', { class: 'oo-col' }, h('span', { class: 'oo-title' }, r.label), h('span', { class: 'oo-stat' }, r.scope)));
                  chips[r.k] = [pill('', 'oo-acc'), r.two ? pill('', 'oo-acc') : h('span', { class: 'oo-stat' }, '-')];
                  grid.append(chips[r.k][0], chips[r.k][1]);
                });
              }
              function paint(changed) {
                ROWS.forEach(r => {
                  ids[r.k].forEach((v, i) => { if (!v) return; const c = chips[r.k][i]; c.textContent = v; c.className = 'oo-pill ' + (changed.includes(r.k) ? 'oo-warn' : 'oo-acc'); replay(c, changed.includes(r.k) ? 'drop-in' : 'pop-soft'); });
                });
              }
              const MSG = {
                rotate: 'Rotation: a new Activity, so a new @ActivityScoped Navigator. The ViewModel survived, and so did everything scoped to it or wider.',
                screen: 'A new screen gets a new ViewModel: new NewsPager, new formatters. Activity and app objects stay.',
                reopen: 'The Activity finished and started again. Everything below @Singleton is new.',
                process: 'The process died. Even the @Singleton is rebuilt from scratch.',
              };
              async function ev(k) {
                if (busy) return; busy = true;
                RESETS[k].forEach(fresh); paint(RESETS[k]);
                say(o, MSG[k]);
                await sleep(500); busy = false;
              }
              build(); ROWS.forEach(r => fresh(r.k)); paint([]);
              say(o, 'Unscoped: the ViewModel and the use case each got their own formatter. @ViewModelScoped: they share one pager.');
              el.append(grid,
                h('div', { class: 'controls' }, act('Rotate', () => ev('rotate')), act('Open another news screen', () => ev('screen')), act('Back out, then reopen the app', () => ev('reopen')), act('Process death', () => ev('process'))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Hilt runs at compile time, through KSP or kapt. For each Hilt component it generates a Dagger component that knows how to build every binding installed in it. For each <code>@Inject</code> constructor it generates a small factory class.</p>
<p>The Hilt Gradle plugin also rewrites your <code>@AndroidEntryPoint</code> Activity to extend a generated <code>Hilt_HomeActivity</code>, which injects fields in <code>onCreate</code>. A scoped binding is wrapped in a <code>DoubleCheck</code> provider, which creates the object once and caches it. An unscoped binding calls the factory every time.</p>`,
          code: `// Generated for: class OfflineFirstNewsRepository @Inject constructor(dao: ArticleDao)
public final class OfflineFirstNewsRepository_Factory implements Factory<OfflineFirstNewsRepository> {
    private final Provider<ArticleDao> daoProvider;
    @Override public OfflineFirstNewsRepository get() {
        return new OfflineFirstNewsRepository(daoProvider.get());
    }
}

// In the component, a @Singleton binding is cached:
newsProvider = DoubleCheck.provider(OfflineFirstNewsRepository_Factory.create(daoProvider));`,
        },
        mistakes: [
          { title: 'An interface that leaks the detail', bad: 'interface NewsRepository {\n    fun dao(): ArticleDao\n    fun api(): NewsApi\n}', good: 'interface NewsRepository {\n    fun headlines(): Flow<List<Article>>\n    suspend fun refresh()\n}', why: 'Returning the DAO and the API ties every caller to Room and Retrofit again. The interface should speak the caller’s language, in domain types.' },
          { title: 'Field injection on a class you build yourself', bad: 'class Uploader {\n    @Inject lateinit var api: UploadApi\n}\nval u = Uploader()\nu.api   // UninitializedPropertyAccessException', good: 'class Uploader @Inject constructor(\n    private val api: UploadApi,\n)\n// ask Hilt for an Uploader instead of calling the constructor', why: 'Hilt only fills fields of objects it creates or entry points it knows. Constructor injection makes the dependency impossible to forget.' },
          { title: 'A scope wider than the state', bad: '@Singleton\nclass CheckoutForm @Inject constructor() {\n    var address = ""\n    var coupon = ""\n}', good: '@ViewModelScoped\nclass CheckoutForm @Inject constructor() {\n    var address = ""\n    var coupon = ""\n}', why: 'As a singleton, the half-filled form follows the user into the next checkout, and into the next account after a logout. Scope state to the screen that owns it.' },
        ],
        visual(el) {
          const impls = ['NetworkNewsRepository', 'OfflineFirstNewsRepository'];
          let mode = 'direct', impl = 0, busy = false, vmEdits = 0;
          const vmLine = h('div', { class: 'kt oo-wrap' });
          const vmStat = h('span', { class: 'oo-stat' });
          const vm = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'High level'), h('span', { class: 'oo-title' }, 'class NewsViewModel'), vmLine, vmStat);
          const arrow1 = h('div', { class: 'oo-arrow' });
          const iface = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'Abstraction'), kt('interface NewsRepository'));
          const arrow2 = h('div', { class: 'oo-arrow' }, '↑ implements');
          const implName = h('span', { class: 'oo-title' });
          const binds = h('div', { class: 'kt oo-wrap' });
          const low = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Low level'), implName, binds);
          const o = out('Pick a setup, then swap the data source or run a unit test.');
          function paint() {
            const dir = mode === 'direct';
            vmLine.innerHTML = hl(dir ? `private val repo = ${impls[impl]}(api)` : '@Inject constructor(repo: NewsRepository)');
            vmStat.innerHTML = `edits to NewsViewModel.kt: <b>${vmEdits}</b>`;
            arrow1.textContent = dir ? `↓ creates and depends on ${impls[impl]}` : '↓ depends on';
            arrow1.classList.toggle('oo-hot', dir);
            iface.hidden = dir; arrow2.hidden = dir;
            implName.textContent = `class ${impls[impl]}${dir ? '' : ' : NewsRepository'}`;
            binds.hidden = dir;
            binds.innerHTML = hl(`@Binds fun bind(impl: ${impls[impl]}): NewsRepository`);
          }
          const modeBtns = [cmd('val repo = NetworkNewsRepository(api)', () => setMode('direct')), cmd('@Inject constructor(repo: NewsRepository)', () => setMode('inverted'))];
          function setMode(m) { if (busy) return; mode = m; impl = 0; vmEdits = 0; press(modeBtns, modeBtns[m === 'direct' ? 0 : 1]); [vm, low].forEach(c => c.classList.remove('oo-warn', 'oo-good', 'oo-bad')); paint(); say(o, m === 'direct' ? 'The ViewModel builds its own repository. The arrow points down at a detail.' : 'Both sides point at the interface. Hilt picks the class.'); }
          async function swap() {
            if (busy) return; busy = true;
            impl = 1 - impl;
            if (mode === 'direct') {
              vmEdits++; paint(); vm.classList.add('oo-warn'); replay(vm, 'shake');
              say(o, `<span class="bad">edit NewsViewModel.kt:</span> the screen logic had to change just to switch to ${impls[impl]}.`);
            } else {
              paint(); low.classList.add('oo-good'); replay(binds, 'pop'); replay(vm, 'oo-flash');
              say(o, `<span class="good">edit DataModule only:</span> one @Binds line now names ${impls[impl]}. NewsViewModel is untouched.`);
            }
            await sleep(1000);
            if (el.isConnected) { vm.classList.remove('oo-warn'); low.classList.remove('oo-good'); }
            busy = false;
          }
          async function test() {
            if (busy) return; busy = true;
            say(o, `${hl('@Test fun showsHeadlines()')} <span class="muted">running on the JVM…</span>`);
            await sleep(700);
            if (!el.isConnected) return;
            if (mode === 'direct') {
              vm.classList.add('oo-bad'); replay(vm, 'shake');
              say(o, `<span class="bad">FAILED</span> UnknownHostException: the ViewModel made a real network call. <span class="muted">There is no seam to pass a fake.</span>`);
            } else {
              implName.textContent = 'class FakeNewsRepository : NewsRepository'; binds.hidden = true;
              low.classList.add('oo-good'); replay(low, 'pop');
              say(o, `<span class="good">PASSED</span> in 4 ms. ${hl('NewsViewModel(FakeNewsRepository(sample))')}`);
            }
            await sleep(1300);
            if (el.isConnected) { vm.classList.remove('oo-bad'); low.classList.remove('oo-good'); paint(); }
            busy = false;
          }
          press(modeBtns, modeBtns[0]); paint();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'oo-layers' }, vm, arrow1, iface, arrow2, low),
            h('div', { class: 'controls' }, act('Switch to the other data source', swap), act('Run the ViewModel unit test', test)),
            o);
        },
      },
    ],
  });
})();
