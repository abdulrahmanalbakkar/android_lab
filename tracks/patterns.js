/* Design patterns track. Same shape as tracks/kotlin.js.
   Each pattern shown the idiomatic Kotlin way, with where it appears on Android.
   Demo styles live in the css string below; every class is prefixed pt-. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const toggle = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked, onchange });
    return Object.assign(h('label', { class: 'switch', for: id }, input, label), { input });
  };
  const card = (title, ...kids) => h('div', { class: 'pt-card' }, h('span', { class: 'pt-title' }, title), ...kids);
  const tag = (text, kind = '') => h('span', { class: `pt-tag ${kind}` }, text);
  const money = c => '$' + (c / 100).toFixed(2);

  const css = `
.pt-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; min-width: 0; align-items: start; }
.pt-split.pt-auto { grid-template-columns: minmax(0, 1fr) auto; }
.pt-col { display: grid; gap: 8px; min-width: 0; align-content: start; }
.pt-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.pt-card { display: grid; gap: 8px; align-content: start; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.25s; }
.pt-card.pt-on { border-color: var(--accent); }
.pt-card.pt-ok { border-color: var(--ok); background: var(--ok-soft); }
.pt-card.pt-bad { border-color: var(--err); background: var(--err-soft); }
.pt-card[hidden] { display: none; }
.pt-card.pt-dim { opacity: 0.45; border-style: dashed; }
.pt-title { font: 700 0.86rem var(--mono); overflow-wrap: anywhere; }
.pt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.pt-tag { justify-self: start; font: 600 0.74rem var(--mono); padding: 3px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); overflow-wrap: anywhere; }
.pt-tag.pt-good { background: var(--ok-soft); color: var(--ok); }
.pt-tag.pt-warn { background: var(--err-soft); color: var(--err); }
.pt-tag.pt-acc { background: var(--accent-soft); color: var(--accent); }
.pt-flash { animation: pt-flash 0.7s ease-out; }
@keyframes pt-flash { from { background: var(--accent-soft); box-shadow: 0 0 0 6px var(--accent-soft); } }
.pt-spin { width: 22px; height: 22px; border-radius: 50%; border: 4px dotted var(--accent); }
.pt-on .pt-spin { animation: spin 0.6s linear infinite; }
.pt-chain { display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch; min-width: 0; }
.pt-chain > .pt-card { flex: 1 1 130px; }
.pt-num { font: 700 1.7rem var(--display); font-variant-numeric: tabular-nums; }
.pt-slot { display: grid; place-items: center; height: 46px; min-width: 64px; overflow: hidden; }
.pt-slot > * { grid-area: 1 / 1; }
.pt-dash { color: var(--muted); font: 600 1rem var(--mono); }
.phone.pt-phone { justify-content: flex-start; align-items: stretch; gap: 6px; padding: 14px 10px; }
.pt-li { padding: 7px 9px; border-radius: 9px; background: var(--sunk); font-size: 0.82rem; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere; }
.pt-li small { display: block; font-weight: 400; color: var(--muted); font-size: 0.72rem; }
.pt-li.pt-new { background: var(--accent-soft); }
.pt-empty { color: var(--muted); font-size: 0.85rem; text-align: center; margin: auto 0; }
.pt-steps { display: grid; gap: 4px; min-width: 0; }
.pt-step { font: 500 0.78rem/1.4 var(--mono); padding: 4px 8px; border-radius: 6px; color: var(--muted); border: 1px solid var(--line); overflow-wrap: anywhere; transition: background 0.2s, border-color 0.2s, color 0.2s; }
.pt-step.pt-now { color: var(--ink); border-color: var(--accent); background: var(--accent-soft); }
.pt-step.pt-done { color: var(--ok); border-color: var(--ok); }
.pt-step.pt-fail { color: var(--err); border-color: var(--err); background: var(--err-soft); }
.pt-notif { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 2px 8px; padding: 8px; border-radius: 10px; background: var(--sunk); font-size: 0.78rem; line-height: 1.3; }
.pt-notif b { overflow-wrap: anywhere; }
.pt-ic { grid-row: span 3; width: 22px; height: 22px; border-radius: 6px; background: var(--accent); }
.pt-ic.pt-none { background: transparent; outline: 2px dashed var(--err); outline-offset: -2px; }
.pt-act { justify-self: start; font: 700 0.72rem var(--mono); color: var(--accent); }
.pt-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.pt-chips .fn { font-size: 0.8rem; padding: 5px 10px; }
.pt-states { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap: 8px; }
.pt-state { display: grid; gap: 4px; justify-items: center; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); font: 700 0.9rem var(--mono); transition: border-color 0.2s, background 0.2s; }
.pt-state small { font: 500 0.7rem var(--mono); color: var(--muted); text-align: center; }
.pt-state.pt-on { border-color: var(--accent); background: var(--accent-soft); }
.pt-state.pt-next { border-style: dashed; border-color: var(--accent); }
.cmd.pt-off { opacity: 0.55; }
/* depth steps */
.pt-grow { transition: width 0.8s ease-out; }
.phone.pt-mini-phone { height: 220px; justify-content: flex-start; align-items: stretch; }
@media (max-width: 640px) {
  .pt-split, .pt-split.pt-auto { grid-template-columns: minmax(0, 1fr); }
}
/* depth pass 2 */
.pt-d2-cell { min-width: 2.2em; text-align: center; }
.pt-li.pt-d2-wrong { background: var(--err-soft); color: var(--err); }
.pt-d2-field { font: 500 0.8rem var(--mono); overflow-wrap: anywhere; }
.pt-step.pt-d2-skip { opacity: 0.45; text-decoration: line-through; }
.pt-d2-box { min-height: 52px; padding: 8px; border-radius: 10px; border: 2px dashed var(--accent); transition: border-color 0.25s, background 0.25s; }
.pt-d2-box.pt-d2-locked { border-style: solid; border-color: var(--ok); background: var(--ok-soft); }
.pt-li.pt-d2-tie { outline: 2px dashed var(--warm); outline-offset: -2px; }
.pt-d2-rows { display: grid; gap: 6px; min-width: 0; align-content: start; }
.pt-d2-row { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 10px; align-items: center; padding: 8px; border-radius: 10px; background: var(--sunk); transition: opacity 0.25s; min-width: 0; }
.pt-d2-row.pt-d2-fade { opacity: 0.2; }
.pt-d2-img { width: 40px; height: 40px; border-radius: 8px; background: var(--accent-soft); }
.pt-d2-img.pt-d2-loading { background: repeating-linear-gradient(45deg, var(--line) 0 6px, var(--surface) 6px 12px); animation: pulse 0.6s infinite; }
.pt-d2-t { font-weight: 700; font-size: 0.85rem; line-height: 1.25; overflow-wrap: anywhere; min-width: 0; }
.pt-d2-likes { font: 700 0.85rem var(--mono); }
.pt-d2-crow { display: grid; grid-template-columns: 2em minmax(0, 1fr) auto; gap: 8px; align-items: center; width: 100%; padding: 8px 10px; border: 0; border-radius: 9px; font: inherit; color: var(--ink); text-align: left; cursor: pointer; min-width: 0; }
.pt-d2-crow small { font: 500 0.7rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.pt-d2-crow:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.pt-d2-gpos { font: 700 0.85rem var(--mono); color: var(--muted); }
.pt-d2-a1 { background: var(--accent-soft); }
.pt-d2-a2 { background: var(--sunk); }
.pt-d2-a3 { background: var(--warm-soft); }
.pt-tag.pt-d2-a1, .pt-tag.pt-d2-a2, .pt-tag.pt-d2-a3 { color: var(--ink); }
.pt-card.pt-d2-ic { border-style: dashed; }
.pt-d2-val { font: 600 0.82rem var(--mono); overflow-wrap: anywhere; }
@media (max-width: 480px) { .pt-d2-crow { grid-template-columns: 1.6em minmax(0, 1fr); } .pt-d2-crow small { grid-column: 2; } }
`;

  Lab.addTrack({
    id: 'patterns',
    title: 'Design patterns',
    description: 'Classic design patterns written the idiomatic Kotlin way, with the places they show up in Android.',
    group: 'Foundations', requires: ['solid'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'singleton',
        title: 'Singleton',
        tagline: 'One instance for the whole app, created on first use.',
        level: 'beginner',
        body: `
<p>A singleton is a class with exactly one instance. In Kotlin you write <code>object</code> instead of <code>class</code>. The compiler creates the instance the first time any code touches it, and that creation is thread-safe.</p>
<p>For one expensive value inside a class, use <code>by lazy</code>. The block runs on the first read and every later read gets the same result.</p>
<p>A global <code>object</code> has a cost: every test shares it, so state leaks from one test into the next. For anything with state, write a normal class behind an interface and let Hilt keep one copy with <code>@Singleton</code>. The app still gets one instance, and a test can pass in a fresh fake. Run both tests below in each mode.</p>`,
        code: `// Kotlin object: one instance, created lazily, thread-safe
object AppClock {
    fun now(): Long = System.currentTimeMillis()
}

class FeedScreenState {
    val formatter by lazy { DateTimeFormatter.ofPattern("d MMM") }  // built on first read
}

// Stateful service: one instance through DI, swappable in tests
interface Analytics { fun track(event: String) }

class FirebaseAnalyticsImpl @Inject constructor() : Analytics {
    override fun track(event: String) { /* send it */ }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class AnalyticsModule {
    @Binds @Singleton
    abstract fun bindAnalytics(impl: FirebaseAnalyticsImpl): Analytics
}

class HomeViewModel @Inject constructor(private val analytics: Analytics) : ViewModel()

// In a test: a fresh fake every time
val vm = HomeViewModel(FakeAnalytics())`,
        remember: 'object gives you one instance. DI-scoped gives you one instance you can replace in tests.',
        terms: [
          { term: 'object declaration', def: 'A Kotlin class declared with object that has exactly one instance, created lazily on first access.' },
          { term: 'by lazy', def: 'A property delegate that runs its initializer on the first read and returns the cached value afterwards.' },
          { term: '@Singleton', def: 'A Hilt scope annotation that keeps one instance of a binding for the lifetime of the application component.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a singleton, and build the database only when it is first read.', code: '[[object]] Clock {\n    fun now() = System.currentTimeMillis()\n}\n\nval db by [[lazy]] { Room.databaseBuilder(app, AppDb::class.java, "app.db").build() }', why: '<code>object</code> declares the single instance. <code>by lazy</code> defers the expensive build to the first read.' },
          { type: 'bug', prompt: 'This singleton leaks a whole screen. Tap the line that causes it.', code: 'object ImageLoader {\n    private lateinit var context: Context\n\n    fun init(activity: Activity) {\n        context = activity\n    }\n\n    fun load(url: String) = Glide.with(context).load(url)\n}', bug: 4, fix: '        context = activity.applicationContext', why: 'The object lives as long as the process. Holding an Activity keeps it and its whole view tree in memory after it is destroyed. Keep only the application context.' },
        ],
        quiz: [
          { q: 'When is a Kotlin <code>object</code> instance created?', options: ['When the app starts', 'The first time code accesses it', 'Every time you reference it'], a: 1, why: 'Objects are initialized lazily on first access, and only once.' },
          { q: 'Why prefer a Hilt <code>@Singleton</code> over a global <code>object</code> for an analytics client?', options: ['It is faster', 'Tests can pass a fresh fake through the constructor', 'Objects cannot implement interfaces'], a: 1, why: 'You still get one instance in the app, but tests don’t share its state and can swap it out.' },
          { q: 'A singleton needs a <code>Context</code>. Which one is safe to store?', options: ['The current Activity', 'The application context', 'A Fragment’s requireContext()'], a: 1, why: 'The application context lives as long as the process, so holding it leaks nothing.' },
        ],
        deeper: [
          {
            title: 'Class initialization is the lock',
            body: `<p>The JVM runs a class's static initializer once, the first time the class is used. If two threads touch an <code>object</code> at the same moment, one runs the initializer and the others wait. No <code>synchronized</code> needed.</p>
<p>The flip side: if the <code>init</code> block throws, the first caller gets <code>ExceptionInInitializerError</code>, and every later access gets <code>NoClassDefFoundError</code> for the rest of the process. Keep object initializers small and unable to fail.</p>`,
            code: `object Config {
    val values: Map<String, String> = loadFromAssets()   // runs once, on first use
}

// Thread 1 and thread 2 call Config.values at the same moment:
// one runs the initializer, the other waits, both get the same map`,
            visual(el) {
              const THREADS = ['main', 'io-1', 'io-2'];
              let fails = false, busy = false;
              const tracks = THREADS.map(() => h('div', { class: 'lane-track' }));
              const got = THREADS.map(() => tag('-'));
              const o = out('Three threads read Config.values at nearly the same time.');
              const t = toggle('pt-sg-throw', 'init block throws', false, () => { if (busy) { t.input.checked = fails; return; } fails = t.input.checked; clear(); say(o, fails ? 'loadFromAssets() will throw this time.' : 'loadFromAssets() works.'); });
              function clear() { tracks.forEach(x => x.replaceChildren()); got.forEach(g => { g.textContent = '-'; g.className = 'pt-tag'; }); }
              const bar = (track, l, w, cls) => { const b = h('span', { class: `bar ${cls} pt-grow`, style: `left:${l}%;width:0` }); track.append(b); requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = `${w}%`; })); };
              async function run() {
                if (busy) return; busy = true; clear();
                bar(tracks[0], 0, 55, 'run');
                bar(tracks[1], 6, 49, 'wait');
                bar(tracks[2], 12, 43, 'wait');
                say(o, 'main runs the initializer. io-1 and io-2 wait on the class init lock.');
                await sleep(1000); if (!el.isConnected) return;
                if (!fails) {
                  got.forEach((g, i) => { g.textContent = 'Config@5e1'; g.className = 'pt-tag pt-good'; replay(g, 'pop'); });
                  say(o, '<span class="good">one instance:</span> the initializer ran once and all three threads got Config@5e1.');
                } else {
                  got[0].textContent = 'ExceptionInInitializerError'; got[0].className = 'pt-tag pt-warn'; replay(got[0], 'shake');
                  await sleep(350); if (!el.isConnected) return;
                  [1, 2].forEach(i => { got[i].textContent = 'NoClassDefFoundError'; got[i].className = 'pt-tag pt-warn'; replay(got[i], 'shake'); });
                  say(o, '<span class="bad">broken for good:</span> main got the real error. The waiting threads, and every later caller, get "Could not initialize class Config".');
                }
                busy = false;
              }
              el.append(
                h('div', { class: 'timeline' }, THREADS.map((n, i) => h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, n), tracks[i]))),
                h('div', { class: 'pt-col' }, THREADS.map((n, i) => h('div', { class: 'pt-row' }, h('span', { class: 'pt-label' }, n), got[i]))),
                h('div', { class: 'controls' }, t, cmd('Config.values  // from 3 threads', run)),
                o);
            },
          },
          {
            title: 'One per process, not one forever',
            body: `<p>A singleton lives in memory, so "one instance" really means one per running process. When Android kills your app in the background, the object and everything in it is gone. When the user comes back, a fresh process creates a fresh instance.</p>
<p>A component declared with <code>android:process=":sync"</code> runs in a second process with its own copy of every object. State that must survive or be shared belongs in storage like DataStore or Room, not in an <code>object</code>.</p>`,
            code: `object DraftHolder {
    var text: String = ""          // gone after process death
}

// AndroidManifest.xml
// <service android:name=".SyncService" android:process=":sync" />
// SyncService sees its own DraftHolder, with its own text`,
            visual(el) {
              const vals = { app: 0, sync: 0 };
              let pid = { app: 4120, sync: 4188 }, busy = false;
              const mk = k => {
                const num = h('span', { class: 'pt-num' }, '0');
                const sub = h('span', { class: 'pt-label' });
                const c = h('div', { class: 'pt-card pt-on' }, h('span', { class: 'pt-title' }, k === 'app' ? 'com.example.news' : 'com.example.news:sync'), sub, h('span', { class: 'pt-label' }, 'Counter.n'), num);
                return { c, num, sub };
              };
              const P = { app: mk('app'), sync: mk('sync') };
              const o = out('');
              const paint = () => Object.keys(P).forEach(k => { P[k].num.textContent = vals[k]; P[k].sub.textContent = `pid ${pid[k]}`; });
              function inc(k) {
                if (busy) return;
                vals[k]++; paint(); replay(P[k].num, 'pop');
                say(o, `${hl('Counter.n++')} <span class="muted">in the ${k === 'app' ? 'app' : ':sync'} process.</span> ${k === 'app' ? 'The sync process' : 'The app process'} still sees ${vals[k === 'app' ? 'sync' : 'app']}.`);
              }
              async function kill() {
                if (busy) return; busy = true;
                P.app.c.classList.add('leave'); await sleep(450); if (!el.isConnected) return;
                vals.app = 0; pid.app += 211; paint();
                P.app.c.classList.remove('leave'); replay(P.app.c, 'drop-in');
                say(o, '<span class="bad">process death:</span> the user came back to a new process. Counter was created again, so n is 0.');
                busy = false;
              }
              paint();
              say(o, 'Two processes from one app. Increment in each.');
              el.append(
                h('div', { class: 'pt-split' }, P.app.c, P.sync.c),
                h('div', { class: 'controls' }, cmd('Counter.n++  // app', () => inc('app')), cmd('Counter.n++  // :sync', () => inc('sync')), act('System kills the app process', kill)),
                o);
            },
          },
          {
            title: 'A singleton that needs an argument',
            body: `<p>An <code>object</code> can't take constructor parameters. When the one instance needs a <code>Context</code>, the classic answer is double-checked locking in a companion: a <code>@Volatile</code> field, a fast unlocked read, and a locked second check.</p>
<p>You will see it in older Room samples. In new code, let Hilt build the database in a <code>@Provides @Singleton</code> function and inject <code>@ApplicationContext</code>.</p>`,
            code: `@Database(entities = [ArticleEntity::class], version = 1)
abstract class AppDb : RoomDatabase() {
    companion object {
        @Volatile private var instance: AppDb? = null

        fun get(context: Context): AppDb =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(context.applicationContext, AppDb::class.java, "app.db")
                    .build()
                    .also { instance = it }
            }
    }
}`,
          },
        ],
        underHood: {
          body: `<p>An <code>object</code> compiles to a final class with a private constructor and a static <code>INSTANCE</code> field. The field is set in the class's static initializer, which the JVM runs once, under a lock, the first time the class is used. Java code calls <code>AppClock.INSTANCE.now()</code>.</p>
<p>A <code>companion object</code> is a nested class named <code>Companion</code>, held in a static field of the outer class. <code>by lazy</code> uses a different mechanism: a <code>SynchronizedLazyImpl</code> with its own lock.</p>`,
          code: `// Kotlin
object AppClock { fun now() = System.currentTimeMillis() }

// Roughly the Java it compiles to
public final class AppClock {
    public static final AppClock INSTANCE;
    private AppClock() {}
    static { INSTANCE = new AppClock(); }   // runs once, on first use
    public final long now() { return System.currentTimeMillis(); }
}`,
        },
        mistakes: [
          { title: 'Global mutable state in an object', bad: 'object Session {\n    var user: User? = null\n}\n// any screen, any thread: Session.user = ...', good: 'class SessionRepository @Inject constructor() {\n    private val _user = MutableStateFlow<User?>(null)\n    val user: StateFlow<User?> = _user.asStateFlow()\n    fun signIn(u: User) { _user.value = u }\n}', why: 'A public <code>var</code> in an object can change from anywhere, nobody is told, and every test shares it. An injected class with a <code>StateFlow</code> has one writer and observers.' },
          { title: 'lateinit setup in a singleton', bad: 'object Api {\n    lateinit var client: OkHttpClient\n    fun init(context: Context) { client = buildClient(context) }\n}\n// a ContentProvider runs before Application.onCreate', good: '@Module @InstallIn(SingletonComponent::class)\nobject ApiModule {\n    @Provides @Singleton\n    fun client(@ApplicationContext c: Context) = buildClient(c)\n}', why: 'Every caller now depends on someone calling <code>init</code> first. A provider, a test or a worker that runs early hits <code>UninitializedPropertyAccessException</code>. Let DI build it on demand.' },
          { title: 'Companion state shared by every instance', bad: 'class Downloader {\n    companion object { var active = 0 }\n    fun start() { active++ }\n}', good: 'class Downloader {\n    var active = 0\n        private set\n    fun start() { active++ }\n}', why: 'A companion is a single object for the whole class. Two downloaders on two screens count into the same number.' },
        ],
        visual(el) {
          let created = false, events = [], di = false, busy = false, gen = 0, fresh = 0;
          const id = () => '@' + (0x3a10 + gen * 0x1f7).toString(16);
          const inst = h('div', { class: 'pt-card pt-dim' });
          const fake = h('div', { class: 'pt-card', hidden: true });
          const o = out('Track an event from any caller, then run the two tests.');
          const paintInst = () => {
            inst.className = 'pt-card' + (created ? ' pt-on' : ' pt-dim');
            inst.replaceChildren(
              h('span', { class: 'pt-title' }, di ? 'Analytics  @Singleton (Hilt)' : 'object Analytics'),
              h('span', { class: 'pt-label' }, created ? `instance ${id()}` : 'not created yet'),
              h('div', { class: 'pt-row' }, events.length ? events.map(e => tag(e, 'pt-acc')) : h('span', { class: 'tip' }, 'no events stored')));
          };
          const names = ['HomeScreen', 'SettingsScreen', 'SyncWorker'];
          const callers = names.map(n => card(n, h('span', { class: 'pt-label' }, 'uses Analytics')));
          async function track(ci, ev) {
            if (busy) return; busy = true;
            callers.forEach(c => c.classList.remove('pt-on'));
            callers[ci].classList.add('pt-on'); replay(callers[ci], 'pt-flash');
            await sleep(300);
            const first = !created;
            if (first) { created = true; gen++; }
            events.push(ev); if (events.length > 5) events.shift();
            paintInst(); replay(inst, first ? 'pop' : 'pt-flash');
            say(o, first
              ? `<span class="good">first access:</span> the instance is created now, once. ${id()}`
              : `${names[ci]} got the same instance ${id()} <span class="muted">// every caller shares it</span>`);
            busy = false;
          }
          async function test(name, ev) {
            if (busy) return; busy = true;
            if (di) {
              fresh++;
              fake.hidden = false;
              fake.className = 'pt-card pt-ok';
              fake.replaceChildren(h('span', { class: 'pt-title' }, 'FakeAnalytics()'), h('span', { class: 'pt-label' }, `new for this test, #${fresh}`), h('div', { class: 'pt-row' }, tag(ev, 'pt-good')));
              replay(fake, 'drop-in');
              await sleep(350);
              say(o, `${name}: <span class="good">PASS</span> <span class="muted">// fresh fake, saw [${ev}]. The app instance was never touched.</span>`);
            } else {
              fake.hidden = true;
              if (!created) { created = true; gen++; }
              events.push(ev); if (events.length > 5) events.shift();
              paintInst(); replay(inst, 'pt-flash');
              await sleep(350);
              if (events.length === 1) say(o, `${name}: <span class="good">PASS</span> <span class="muted">// lucky: nothing ran before it</span>`);
              else { inst.classList.add('pt-bad'); replay(inst, 'shake'); say(o, `${name}: <span class="bad">FAIL</span> expected [${ev}] but was [${events.join(', ')}] <span class="muted">// state left over from earlier calls</span>`); }
            }
            busy = false;
          }
          const mode = toggle('pt-sg-di', 'Inject through Hilt', false, () => {
            if (busy) { mode.input.checked = di; return; }
            di = mode.input.checked; created = false; events = []; fake.hidden = true;
            paintInst(); replay(inst, 'pop');
            say(o, di ? 'App restarted with a DI-scoped instance. Tests now build their own fake.' : 'App restarted with a global object. Tests reach the same instance as the app.');
          });
          paintInst();
          el.append(
            h('div', { class: 'pt-split' }, h('div', { class: 'pt-col' }, callers), h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'the one instance'), inst, fake)),
            h('div', { class: 'controls' },
              cmd('Home: track("open")', () => track(0, 'open')),
              cmd('Settings: track("theme")', () => track(1, 'theme')),
              cmd('Worker: track("sync")', () => track(2, 'sync'))),
            h('div', { class: 'controls' }, mode,
              act('Run testOpenIsTracked', () => test('testOpenIsTracked', 'open')),
              act('Run testSyncIsTracked', () => test('testSyncIsTracked', 'sync'))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'factory',
        title: 'Factory and factory functions',
        tagline: 'Hide how an object gets built behind one call.',
        level: 'beginner',
        body: `
<p>A factory is a function that creates objects for you. The caller asks for a thing and the factory decides which class to build and what to pass in. In Kotlin that is usually a function in a <code>companion object</code>, named <code>of</code>, <code>from</code> or <code>create</code>.</p>
<p>A companion <code>operator fun invoke</code> lets the call look like a constructor, <code>Logger(debug = true)</code>, while it returns whichever implementation fits. Callers never name the concrete class.</p>
<p>Android uses a factory for every ViewModel. The system decides <em>when</em> one is needed: the first time, not after a rotation. Your <code>viewModelFactory</code> decides <em>how</em>: which repository and arguments to pass in. Rotate the screen below and watch whether the factory runs.</p>`,
        code: `interface Logger {
    fun log(msg: String)

    companion object {
        // Looks like a constructor, returns the right implementation
        operator fun invoke(debug: Boolean): Logger = if (debug) ConsoleLogger() else NoOpLogger
    }
}
val logger = Logger(debug = BuildConfig.DEBUG)

class Temperature private constructor(val celsius: Double) {
    companion object {
        fun of(text: String): Temperature =
            if (text.endsWith("F")) Temperature((text.dropLast(1).toDouble() - 32) * 5 / 9)
            else Temperature(text.removeSuffix("C").toDouble())
    }
}

// The ViewModel factory: Android decides when, you decide how
class DetailViewModel(private val repo: ArticleRepository, private val id: String) : ViewModel()

val detailFactory = viewModelFactory {
    initializer {
        val app = this[APPLICATION_KEY] as NewsApp
        DetailViewModel(app.container.articles, createSavedStateHandle()["id"]!!)
    }
}

@Composable
fun DetailRoute(vm: DetailViewModel = viewModel(factory = detailFactory)) { /* ... */ }`,
        remember: 'A factory decides how to build. For ViewModels, Android decides when.',
        terms: [
          { term: 'Factory function', def: 'A function that creates and returns an object, choosing the concrete class and its arguments for the caller.' },
          { term: 'operator invoke', def: 'An operator function that lets an object be called like a function, often used in a companion to look like a constructor.' },
          { term: 'viewModelFactory', def: 'A builder for ViewModelProvider.Factory whose initializer block creates a ViewModel with its dependencies.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>Logger(debug = true)</code> work on an interface.', code: 'interface Logger {\n    fun log(msg: String)\n    companion [[object]] {\n        operator fun [[invoke]](debug: Boolean): Logger =\n            if (debug) ConsoleLogger() else NoOpLogger\n    }\n}', why: 'A companion object with <code>operator fun invoke</code> makes <code>Logger(...)</code> call the factory.' },
          { type: 'bug', prompt: 'The detail screen reloads its data on every rotation. Tap the line responsible.', code: '@Composable\nfun DetailRoute(repo: ArticleRepository, id: String) {\n    val vm = DetailViewModel(repo, id)\n    val state by vm.state.collectAsStateWithLifecycle()\n    DetailScreen(state)\n}', bug: 2, fix: '    val vm: DetailViewModel = viewModel { DetailViewModel(repo, id) }', why: 'Calling the constructor builds a new ViewModel on every recomposition and after every rotation. <code>viewModel { }</code> passes your initializer to a factory and keeps the instance in the ViewModelStore.' },
        ],
        quiz: [
          { q: 'You rotate the phone. Does your <code>viewModelFactory</code> initializer run again?', options: ['Yes, the Activity is new', 'No, the existing ViewModel comes back from the ViewModelStore', 'Only on API 34+'], a: 1, why: 'The store survives configuration changes. The factory only runs when no instance exists yet.' },
          { q: 'What does a companion <code>operator fun invoke</code> let you write?', options: ['<code>Logger.invoke.create()</code>', '<code>Logger(debug = true)</code> on an interface', '<code>new Logger()</code>'], a: 1, why: 'The call looks like a constructor but runs your factory and returns any implementation.' },
        ],
        deeper: [
          {
            title: 'A factory can reuse, refuse, or pick a subtype',
            body: `<p>A constructor has one job: make a new object of exactly that class, every time. A factory function has more freedom. It can hand back a shared instance, return <code>null</code> for bad input, or return any subtype it likes.</p>
<p>The standard library does all three. <code>emptyList()</code> returns one shared empty list. <code>"12a".toIntOrNull()</code> returns <code>null</code> instead of throwing. Make the constructor <code>private</code> so every caller has to go through the factory and its checks.</p>`,
            code: `class Quantity private constructor(val value: Int) {
    companion object {
        private val small = Array(10) { Quantity(it) }    // built once

        fun of(value: Int): Quantity {
            require(value >= 0) { "negative: \$value" }
            return if (value < 10) small[value] else Quantity(value)
        }

        fun parse(text: String): Quantity? =
            text.toIntOrNull()?.takeIf { it >= 0 }?.let(::of)
    }
}`,
            visual(el) {
              const cache = Array.from({ length: 10 }, (_, i) => h('span', { class: 'pt-tag pt-d2-cell' }, String(i)));
              const fresh = h('div', { class: 'pt-row' }, h('span', { class: 'tip' }, 'none yet'));
              const resSlot = h('div', { class: 'pt-row' }, tag('-'));
              const same = tag('same as last result: -');
              const o = out('');
              let prev = null, n = 0x7a0, made = 0, busy = false;
              const addrOf = i => '@' + (0x3c0 + i * 0x10).toString(16);
              const show = (text, kind, anim = 'pop') => { resSlot.replaceChildren(tag(text, kind)); replay(resSlot.firstElementChild, anim); };
              function compare(a) {
                if (prev == null || a == null) { same.textContent = 'same as last result: -'; same.className = 'pt-tag'; }
                else { const s = prev === a; same.textContent = `same as last result: ${s ? 'yes' : 'no'}`; same.className = `pt-tag ${s ? 'pt-good' : 'pt-acc'}`; replay(same, 'pop'); }
                prev = a;
              }
              async function of(v) {
                if (busy) return; busy = true;
                cache.forEach(c => c.classList.remove('pt-acc'));
                if (v < 10) {
                  const c = cache[v]; c.classList.add('pt-acc'); replay(c, 'pop');
                  const a = addrOf(v);
                  show(`Quantity(${v}) ${a}`, 'pt-good'); compare(a);
                  say(o, `${hl(`Quantity.of(${v})`)} <span class="good">reused</span> ${a} <span class="muted">// from the cache, nothing allocated</span>`);
                } else {
                  n += 0x28; made++;
                  const a = '@' + n.toString(16);
                  if (made === 1) fresh.replaceChildren();
                  fresh.append(tag(`Quantity(${v}) ${a}`, 'pt-acc drop-in'));
                  while (fresh.children.length > 3) fresh.firstElementChild.remove();
                  show(`Quantity(${v}) ${a}`, 'pt-acc', 'drop-in'); compare(a);
                  say(o, `${hl(`Quantity.of(${v})`)} <span class="muted">// outside the cache: a new object on every call</span>`);
                }
                await sleep(300); busy = false;
              }
              function parse() {
                if (busy) return;
                cache.forEach(c => c.classList.remove('pt-acc'));
                show('null', ''); compare(null);
                say(o, `${hl('Quantity.parse("12a")')} = null <span class="muted">// bad input is an answer, not a crash. The caller decides.</span>`);
              }
              function neg() {
                if (busy) return;
                show('IllegalArgumentException', 'pt-warn', 'shake'); compare(null);
                say(o, `${hl('Quantity.of(-1)')} <span class="bad">IllegalArgumentException:</span> negative: -1 <span class="muted">// the check runs for every caller</span>`);
              }
              function ctor() {
                if (busy) return;
                show('compile error', 'pt-warn', 'shake');
                say(o, `${hl('Quantity(3)')} <span class="bad">compile error:</span> the constructor is private <span class="muted">// nobody can skip of()</span>`);
              }
              say(o, 'Call the factory. Watch where each result comes from.');
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'cache, built once'), h('div', { class: 'pt-row' }, cache), h('span', { class: 'pt-label' }, 'built on demand'), fresh),
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'last result'), resSlot, same)),
                h('div', { class: 'controls' }, cmd('Quantity.of(3)', () => of(3)), cmd('Quantity.of(250)', () => of(250)), cmd('Quantity.parse("12a")', parse), cmd('Quantity.of(-1)', neg), cmd('Quantity(3)', ctor)),
                o);
            },
          },
          {
            title: 'Same class, two ids: give the ViewModel a key',
            body: `<p>A <code>ViewModelStore</code> files each ViewModel under a key, and the default key is the class name. Ask the same owner twice for <code>DetailViewModel</code> and you get the first one back, even if your initializer would pass a different id. The factory does not run the second time.</p>
<p>That bites when one screen shows several items of the same type, such as pages in a <code>HorizontalPager</code>. Pass a <code>key</code> so each id gets its own entry. With Navigation you rarely need it, because every back stack entry has its own store.</p>`,
            code: `HorizontalPager(state = pagerState) { page ->
    val id = ids[page]
    val vm: DetailViewModel = viewModel(key = "detail-\$id") {
        DetailViewModel(repo, id)
    }
    DetailPage(vm)
}`,
            visual(el) {
              let keyed = false, busy = false, n = 0x4b0, made = 0;
              const store = new Map();
              const storeBox = h('div', { class: 'pt-col' });
              const madeTag = tag('');
              const factory = h('div', { class: 'pt-card' }, h('div', { class: 'pt-row' }, h('div', { class: 'pt-spin' }), h('span', { class: 'pt-title' }, 'initializer')), h('span', { class: 'pt-label' }, 'DetailViewModel(repo, id)'), madeTag);
              const pages = [7, 9].map((id, i) => {
                const shows = h('div', { class: 'pt-li' }, 'not opened');
                return { id, shows, card: h('div', { class: 'pt-card' }, h('span', { class: 'pt-title' }, `page ${i + 1}: article ${id}`), shows) };
              });
              const o = out('');
              const keyOf = id => (keyed ? `detail-${id}` : 'DefaultKey:…DetailViewModel');
              function paint() {
                storeBox.replaceChildren(...(store.size ? [...store].map(([k, v]) => h('div', { class: 'pt-li' + (v.fresh ? ' pt-new drop-in' : '') }, `DetailViewModel(id = ${v.id})`, h('small', {}, `key "${k}" · ${v.addr}`))) : [h('span', { class: 'tip' }, 'empty')]));
                madeTag.textContent = `ran ${made} time${made === 1 ? '' : 's'}`;
              }
              function reset() {
                store.clear(); made = 0;
                pages.forEach(p => { p.shows.textContent = 'not opened'; p.shows.className = 'pt-li'; p.card.className = 'pt-card'; });
                paint();
              }
              async function open(p) {
                if (busy) return; busy = true;
                const k = keyOf(p.id);
                replay(p.card, 'pt-flash');
                await sleep(300); if (!el.isConnected) return;
                store.forEach(v => { v.fresh = false; });
                let vm = store.get(k), msg;
                if (vm) {
                  paint();
                  msg = `key "${k}" is already in the store, so the initializer is skipped.`;
                } else {
                  factory.classList.add('pt-on'); replay(factory, 'pt-flash');
                  await sleep(600); if (!el.isConnected) return;
                  factory.classList.remove('pt-on');
                  n += 0x1c4; made++;
                  vm = { id: p.id, addr: '@' + n.toString(16), fresh: true };
                  store.set(k, vm); paint(); replay(madeTag, 'pop');
                  msg = `no entry for "${k}": <span class="good">created DetailViewModel(id = ${p.id})</span>`;
                }
                const ok = vm.id === p.id;
                p.shows.textContent = `shows article ${vm.id}`;
                p.shows.className = 'pt-li ' + (ok ? 'pt-new' : 'pt-d2-wrong');
                p.card.className = 'pt-card ' + (ok ? 'pt-ok' : 'pt-bad'); replay(p.card, ok ? 'pop-soft' : 'shake');
                say(o, msg + (ok ? '' : `<div class="line"><span class="bad">wrong article:</span> page for ${p.id} got the ViewModel for ${vm.id}</div>`));
                busy = false;
              }
              const t = toggle('pt-d2-fac-key', 'pass key = "detail-$id"', false, () => {
                if (busy) { t.input.checked = keyed; return; }
                keyed = t.input.checked; reset();
                say(o, keyed ? 'Each id now has its own key. Open both pages.' : 'No key: both pages share the class-name key.');
              });
              reset();
              say(o, 'One screen, two pages, one ViewModelStore. Open both pages.');
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, pages.map(p => p.card)),
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'ViewModelStore'), storeBox, factory)),
                h('div', { class: 'controls' }, t),
                h('div', { class: 'controls' }, pages.map(p => cmd(`viewModel { DetailViewModel(repo, ${p.id}) }`, () => open(p)))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p><code>by viewModels()</code> and Compose's <code>viewModel()</code> both end in <code>ViewModelProvider.get()</code>. It builds a key from the class name, looks it up in the owner's <code>ViewModelStore</code>, which is a plain map, and returns a hit as is. Only on a miss does it call <code>factory.create(modelClass, extras)</code> and store the result.</p>
<p>The <code>extras</code> are <code>CreationExtras</code>, a small typed map that the owner fills with the Application, the saved-state owner and the screen's arguments. <code>createSavedStateHandle()</code> reads from it. <code>viewModelFactory { initializer { } }</code> builds a factory that runs the initializer registered for the requested class. A companion <code>operator fun invoke</code> is plain sugar: <code>Logger(debug = true)</code> compiles to a call on the <code>Logger.Companion</code> object.</p>`,
          code: `// Roughly what ViewModelProvider.get does
fun <T : ViewModel> get(modelClass: KClass<T>): T {
    val key = "androidx.lifecycle.ViewModelProvider.DefaultKey:\${modelClass.qualifiedName}"
    store[key]?.let { return it as T }                 // after rotation: found
    val vm = factory.create(modelClass, extras)        // first time only
    store.put(key, vm)
    return vm
}`,
        },
        mistakes: [
          {
            title: 'A public constructor next to the factory',
            bad: `data class Temperature(val celsius: Double) {
    companion object {
        fun of(text: String): Temperature = TODO("parse and check")
    }
}
val t = Temperature(-500.0)   // skips every check in of()`,
            good: `@ConsistentCopyVisibility
data class Temperature private constructor(val celsius: Double) {
    companion object {
        fun of(text: String): Temperature = TODO("parse and check")
    }
}`,
            why: 'A public constructor lets callers skip your checks. Make it private. On a <code>data class</code>, <code>copy()</code> is a second way in: since Kotlin 2.0.20 the compiler warns about it, and <code>@ConsistentCopyVisibility</code> makes <code>copy()</code> private too.',
          },
          {
            title: 'Building heavy parts inside the initializer',
            bad: `val detailFactory = viewModelFactory {
    initializer {
        val api = Retrofit.Builder().baseUrl(BASE_URL).build().create<NewsApi>()
        DetailViewModel(ArticleRepository(api), createSavedStateHandle()["id"]!!)
    }
}`,
            good: `val detailFactory = viewModelFactory {
    initializer {
        val app = this[APPLICATION_KEY] as NewsApp
        DetailViewModel(app.container.articles, createSavedStateHandle()["id"]!!)
    }
}`,
            why: 'Every new screen now builds its own Retrofit and OkHttp client, each with its own connection pool. A factory should assemble shared parts, not create them. Keep one container, or let Hilt do it.',
          },
        ],
        visual(el) {
          let vm = '@7c21', made = 1, gen = 1, busy = false, n = 0x7c21;
          const actTitle = h('span', { class: 'pt-title' });
          const activity = h('div', { class: 'pt-card pt-on' }, actTitle, h('span', { class: 'pt-label' }, 'asks viewModel(factory)'));
          const storeSlot = h('div', { class: 'pt-row' });
          const store = card('ViewModelStore', h('span', { class: 'pt-label' }, 'survives rotation'), storeSlot);
          const madeTag = tag('');
          const factory = h('div', { class: 'pt-card' }, h('div', { class: 'pt-row' }, h('div', { class: 'pt-spin' }), h('span', { class: 'pt-title' }, 'detailFactory')), h('span', { class: 'pt-label' }, 'initializer { DetailViewModel(repo, id) }'), madeTag);
          const o = out('The screen is open and its ViewModel exists. Rotate it.');
          const paint = () => {
            actTitle.textContent = `DetailActivity #${gen}`;
            storeSlot.replaceChildren(vm ? h('span', { class: 'pt-tag pt-acc' }, `DetailViewModel ${vm}`) : h('span', { class: 'tip' }, 'empty'));
            madeTag.textContent = `initializer ran ${made} time${made === 1 ? '' : 's'}`;
          };
          async function ask() {
            replay(activity, 'pt-flash'); await sleep(300);
            if (!el.isConnected) return;
            replay(store, 'pt-flash'); await sleep(300);
            if (vm) {
              replay(storeSlot.firstElementChild, 'pop');
              say(o, `<span class="good">reused</span> DetailViewModel ${vm} <span class="muted">// factory not called, data still loaded</span>`);
              return;
            }
            factory.classList.add('pt-on'); replay(factory, 'pt-flash');
            await sleep(700);
            n += 0x1a3; vm = '@' + n.toString(16); made++;
            factory.classList.remove('pt-on');
            paint(); replay(storeSlot.firstElementChild, 'drop-in'); replay(madeTag, 'pop');
            say(o, `<span class="good">created</span> DetailViewModel ${vm} <span class="muted">// no instance in the store, so the factory ran</span>`);
          }
          async function rotate() {
            if (busy) return; busy = true;
            replay(activity, 'flip'); await sleep(420);
            gen++; paint();
            say(o, 'Configuration change: the Activity was destroyed and recreated.');
            await sleep(400);
            await ask(); busy = false;
          }
          async function finish() {
            if (busy) return; busy = true;
            if (!vm) { replay(store, 'shake'); say(o, 'The store is already empty. Open the screen again.'); busy = false; return; }
            const chip = storeSlot.firstElementChild; chip.classList.add('fly-out');
            await sleep(400);
            vm = null; gen++; paint();
            say(o, '<span class="muted">User pressed back.</span> onCleared() ran and the store is empty.');
            busy = false;
          }
          async function open() {
            if (busy) return; busy = true;
            await ask(); busy = false;
          }
          const impl = h('div', { class: 'pt-slot' }, h('span', { class: 'chip' }, 'ConsoleLogger'));
          paint();
          el.append(
            h('div', { class: 'pt-chain' }, activity, store, factory),
            h('div', { class: 'controls' }, act('Rotate', rotate), act('Press back', finish), cmd('viewModel(factory = detailFactory)', open)),
            o,
            h('div', { class: 'controls' }, h('span', { class: 'pt-label' }, 'companion invoke'),
              cmd('Logger(debug = true)', () => { swap(impl, 'ConsoleLogger'); }),
              cmd('Logger(debug = false)', () => { swap(impl, 'NoOpLogger'); }),
              impl));
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'builder',
        title: 'Builder',
        tagline: 'Named and default arguments replace most builders.',
        level: 'beginner',
        body: `
<p>In Java, a builder exists because a constructor with ten parameters is unreadable and most of them are optional. Kotlin solves that in the language. Give parameters default values, pass the ones you need by name, and use <code>copy()</code> to make a variant. A required parameter stays required, and the compiler checks it.</p>
<p>For a mutable object you configure once, <code>apply { }</code> gives the same chained feel: set properties inside the block and get the object back.</p>
<p>You still call real builders from Java libraries: <code>NotificationCompat.Builder</code>, <code>Retrofit.Builder</code>, <code>OkHttpClient.Builder</code>. They check required parts only at runtime. Turn off <code>setSmallIcon</code> below and post the notification.</p>`,
        code: `// Kotlin: named + default arguments
data class Request(
    val url: String,                      // required
    val method: String = "GET",
    val timeoutMs: Long = 10_000,
    val headers: Map<String, String> = emptyMap(),
)
val feed = Request(url = "https://api.example.com/feed", timeoutMs = 3_000)
val post = feed.copy(method = "POST")

// apply: configure a mutable object in one expression
val paint = Paint().apply {
    color = Color.RED
    strokeWidth = 4f
}

// Real builders on Android
val notification = NotificationCompat.Builder(context, CHANNEL_NEWS)
    .setSmallIcon(R.drawable.ic_news)     // required, checked only when posted
    .setContentTitle("Breaking")
    .setContentText("Tap to read")
    .setPriority(NotificationCompat.PRIORITY_HIGH)
    .build()

val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()`,
        remember: 'In Kotlin, defaults plus names are the builder. Use real builders only where a library gives you one.',
        terms: [
          { term: 'Named argument', def: 'An argument passed as name = value, so the call reads clearly and order does not matter.' },
          { term: 'Default argument', def: 'A parameter value used when the caller leaves that argument out.' },
          { term: 'Builder pattern', def: 'An object that collects settings through chained calls and creates the final object in build().' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Override only the timeout, then finish the notification.', code: 'val r = Request(url = feedUrl, [[timeoutMs]] = 3_000)\n\nval n = NotificationCompat.Builder(context, CHANNEL_NEWS)\n    .setSmallIcon(R.drawable.ic_news)\n    .setContentTitle("Breaking")\n    .[[build]]()', why: 'Name the one argument that differs from its default. A builder hands over the result in <code>build()</code>.' },
          { type: 'bug', prompt: 'The app crashes on start with an IllegalArgumentException. Tap the line.', code: 'val retrofit = Retrofit.Builder()\n    .baseUrl("https://api.example.com/v2")\n    .client(okHttpClient)\n    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))\n    .build()', bug: 1, fix: '    .baseUrl("https://api.example.com/v2/")', why: 'Retrofit requires the base URL to end in <code>/</code> when it has a path. Relative endpoint paths are resolved against it.' },
        ],
        quiz: [
          { q: 'What replaces most builders in Kotlin?', options: ['Interfaces', 'Default and named arguments', 'Extension functions'], a: 1, why: 'Optional parameters get defaults, and callers name only what they change.' },
          { q: 'You forget a required parameter in <code>Request(...)</code>. When do you find out?', options: ['At compile time', 'When <code>build()</code> runs', 'When the request is sent'], a: 0, why: 'A parameter without a default must be passed, and the compiler enforces it. A builder can only check at runtime.' },
          { q: 'What does <code>Paint().apply { color = Color.RED }</code> return?', options: ['Unit', 'The Paint', 'Color.RED'], a: 1, why: '<code>apply</code> runs the block on the object and returns that same object.' },
        ],
        deeper: [
          {
            title: 'Checks live in init, and copy() runs them too',
            body: `<p>A Java builder checks its values in <code>build()</code>. Kotlin has a better place: an <code>init</code> block with <code>require</code>. It runs on every construction, so an object with a bad value can never exist.</p>
<p><code>copy()</code> calls the primary constructor, so it runs the same checks. A variant made with <code>copy(timeoutMs = 0)</code> fails exactly like a fresh <code>Request</code> with that value would.</p>`,
            code: `data class Request(
    val url: String,
    val method: String = "GET",
    val timeoutMs: Long = 10_000,
) {
    init {
        require(url.startsWith("https://")) { "https only: \$url" }
        require(timeoutMs in 1..60_000) { "timeoutMs out of range: \$timeoutMs" }
    }
}

val feed = Request("https://api.example.com/feed")
val broken = feed.copy(timeoutMs = 0)   // IllegalArgumentException`,
            visual(el) {
              const URL = 'https://api.example.com/feed';
              let n = 0x2f0, busy = false;
              let cur = { url: URL, method: 'GET', timeoutMs: 10000, addr: '@2f0' };
              const checks = [
                { src: 'require(url.startsWith("https://"))', ok: r => r.url.startsWith('https://'), msg: r => `https only: ${r.url}` },
                { src: 'require(timeoutMs in 1..60_000)', ok: r => r.timeoutMs >= 1 && r.timeoutMs <= 60000, msg: r => `timeoutMs out of range: ${r.timeoutMs}` },
              ];
              const rows = checks.map(c => h('div', { class: 'pt-step', html: hl(c.src) }));
              const objBox = h('div', { class: 'pt-card pt-on' });
              const o = out('');
              function paintObj(anim) {
                objBox.replaceChildren(h('span', { class: 'pt-title' }, `val r: Request ${cur.addr}`),
                  ...['url', 'method', 'timeoutMs'].map(k => h('span', { class: 'pt-d2-field' }, `${k} = ${typeof cur[k] === 'string' ? `"${cur[k]}"` : cur[k]}`)));
                if (anim) replay(objBox, 'drop-in');
              }
              async function make(src, next) {
                if (busy) return; busy = true;
                rows.forEach(x => { x.className = 'pt-step'; });
                say(o, `${hl(src)} <span class="muted">// runs the primary constructor, so init runs</span>`);
                for (let i = 0; i < checks.length; i++) {
                  rows[i].classList.add('pt-now');
                  await sleep(420); if (!el.isConnected) return;
                  rows[i].classList.remove('pt-now');
                  if (!checks[i].ok(next)) {
                    rows[i].classList.add('pt-fail'); replay(rows[i], 'shake');
                    say(o, `${hl(src)}<div class="line"><span class="bad">IllegalArgumentException:</span> ${checks[i].msg(next)}</div><div class="line muted">// no object was created, r is unchanged</div>`);
                    busy = false; return;
                  }
                  rows[i].classList.add('pt-done');
                }
                n += 0x30; cur = { ...next, addr: '@' + n.toString(16) }; paintObj(true);
                say(o, `${hl(src)} <span class="good">ok</span> <span class="muted">// new Request ${cur.addr}, both checks passed</span>`);
                busy = false;
              }
              const calls = [
                ['Request(url = "https://api.example.com/feed")', () => ({ url: URL, method: 'GET', timeoutMs: 10000 })],
                ['Request(url = "http://api.example.com/feed")', () => ({ url: 'http://api.example.com/feed', method: 'GET', timeoutMs: 10000 })],
                ['r.copy(timeoutMs = 3_000)', () => ({ ...cur, timeoutMs: 3000 })],
                ['r.copy(timeoutMs = 0)', () => ({ ...cur, timeoutMs: 0 })],
                ['r.copy(method = "POST")', () => ({ ...cur, method: 'POST' })],
              ];
              paintObj(false);
              say(o, 'Build a Request, then make variants with copy().');
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'init { }: runs on every construction'), h('div', { class: 'pt-steps' }, rows)),
                  objBox),
                h('div', { class: 'controls' }, calls.map(([src, next]) => cmd(src, () => make(src, next())))),
                o);
            },
          },
          {
            title: 'Builders in the standard library: buildList and buildString',
            body: `<p>The standard library ships builders too. Inside <code>buildList { }</code> you get a <code>MutableList</code> to fill with loops and <code>if</code>s. What comes out is a read-only <code>List</code>, so no caller can change it later. <code>buildString</code>, <code>buildMap</code> and <code>buildSet</code> work the same way.</p>
<p>They replace a common leak: a <code>mutableListOf()</code> filled in a function and returned as mutable. Inside the braces, <code>this</code> is the builder, the same lambda-with-receiver trick that type-safe DSLs use.</p>`,
            code: `fun menuItems(user: User?, isTablet: Boolean): List<MenuItem> = buildList {
    add(MenuItem.Home)
    if (user != null) add(MenuItem.Profile(user.name))
    else add(MenuItem.SignIn)
    if (isTablet) addAll(MenuItem.tabletExtras)
    add(MenuItem.Settings)
}

val title = buildString {
    append(article.title)
    if (article.isLive) append(" · LIVE")
}`,
            visual(el) {
              let user = true, tablet = false, busy = false, built = null;
              const lines = [
                { src: 'add(MenuItem.Home)', run: () => ['Home'] },
                { src: 'if (user != null) add(MenuItem.Profile(user.name))', run: () => (user ? ['Profile(Ada)'] : []) },
                { src: 'else add(MenuItem.SignIn)', run: () => (user ? [] : ['SignIn']) },
                { src: 'if (isTablet) addAll(MenuItem.tabletExtras)', run: () => (tablet ? ['SplitView', 'Shortcuts'] : []) },
                { src: 'add(MenuItem.Settings)', run: () => ['Settings'] },
              ];
              const rows = lines.map(l => h('div', { class: 'pt-step', html: hl(l.src) }));
              const boxLabel = h('span', { class: 'pt-label' });
              const box = h('div', { class: 'pt-row pt-d2-box' });
              const o = out('');
              function fill(items, locked) {
                box.replaceChildren(...(items.length ? items.map(x => tag(x, 'pt-acc')) : [h('span', { class: 'tip' }, 'empty')]));
                box.classList.toggle('pt-d2-locked', locked);
                boxLabel.textContent = locked ? 'List<MenuItem>: read-only, returned' : 'MutableList: only inside the block';
              }
              async function run() {
                if (busy) return; busy = true;
                built = []; fill([], false);
                rows.forEach(r => { r.className = 'pt-step'; });
                say(o, hl(`val menu = menuItems(${user ? 'ada' : 'null'}, isTablet = ${tablet})`));
                for (let i = 0; i < lines.length; i++) {
                  rows[i].classList.add('pt-now');
                  await sleep(380); if (!el.isConnected) return;
                  const add = lines[i].run();
                  rows[i].classList.remove('pt-now'); rows[i].classList.add(add.length ? 'pt-done' : 'pt-d2-skip');
                  if (add.length && !built.length) box.replaceChildren();
                  add.forEach(x => { built.push(x); box.append(tag(x, 'pt-acc drop-in')); });
                }
                await sleep(250); if (!el.isConnected) return;
                fill(built, true); replay(box, 'pop-soft');
                say(o, `${hl('buildList')} returned ${built.length} items <span class="muted">// a List, so callers can read it but not change it</span>`);
                busy = false;
              }
              function mutate() {
                if (busy) return;
                replay(box, 'shake');
                say(o, `${hl('menu.add(MenuItem.Debug)')} <span class="bad">compile error:</span> List has no add() <span class="muted">// the mutable view never left buildList</span>`);
              }
              const tu = toggle('pt-d2-bl-user', 'signed in', true, () => { if (busy) { tu.input.checked = user; return; } user = tu.input.checked; say(o, `user = ${user ? 'ada' : 'null'}. Build the menu again.`); });
              const tt = toggle('pt-d2-bl-tab', 'tablet', false, () => { if (busy) { tt.input.checked = tablet; return; } tablet = tt.input.checked; say(o, `isTablet = ${tablet}. Build the menu again.`); });
              built = ['Home', 'Profile(Ada)', 'Settings']; fill(built, true);
              say(o, 'The menu for a signed-in phone user is built. Change the inputs and build it again.');
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'buildList { }'), h('div', { class: 'pt-steps' }, rows)),
                  h('div', { class: 'pt-col' }, boxLabel, box)),
                h('div', { class: 'controls' }, tu, tt, cmd('menuItems(user, isTablet)', run), cmd('menu.add(MenuItem.Debug)', mutate)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Named arguments cost nothing at runtime. The compiler puts them back into parameter order at the call site, and uses temporary variables when it needs to keep your left-to-right evaluation order.</p>
<p>Default values compile to an extra synthetic constructor or method. It takes the normal parameters plus an <code>int</code> bitmask, one bit per parameter, and a marker argument. A set bit means "use the default". Java callers see only the full signature, unless you add <code>@JvmOverloads</code>, which generates the shorter overloads for them. <code>apply</code> is an <code>inline</code> function, so its block is pasted in place with no lambda object.</p>`,
          code: `// Kotlin
Request(url = feedUrl, timeoutMs = 3_000)

// Roughly the bytecode, written as Java
new Request(feedUrl, null, 3000L, null, 0b1010, null);
// bit 1 (method) and bit 3 (headers) are set: use their defaults`,
        },
        mistakes: [
          {
            title: 'let where you meant apply',
            bad: `val paint = Paint().let {
    it.color = Color.RED
    it.strokeWidth = 4f
}   // paint is Unit`,
            good: `val paint = Paint().apply {
    color = Color.RED
    strokeWidth = 4f
}`,
            why: '<code>let</code> returns the lambda’s result, and a block that ends in an assignment returns <code>Unit</code>. <code>apply</code> returns the object itself, which is what a configure block needs.',
          },
          {
            title: 'A Java-style builder written in Kotlin',
            bad: `class RequestBuilder {
    private var url: String? = null
    private var timeoutMs = 10_000L
    fun url(u: String) = apply { url = u }
    fun timeout(ms: Long) = apply { timeoutMs = ms }
    fun build() = Request(url!!, timeoutMs = timeoutMs)
}`,
            good: `val request = Request(url = feedUrl, timeoutMs = 3_000)`,
            why: 'The builder turns a compile-time check into a <code>!!</code> that fails at runtime, and it is one more class to keep in sync. Defaults and named arguments give the same call for free.',
          },
          {
            title: 'Positional arguments of the same type',
            bad: `data class Notice(val title: String, val text: String)

val n = Notice(article.summary, article.title)   // swapped, still compiles`,
            good: `val n = Notice(title = article.title, text = article.summary)`,
            why: 'Two <code>String</code> parameters in the wrong order compile fine. Naming them makes each value say where it goes, and a swap becomes obvious in review.',
          },
        ],
        visual(el) {
          const opts = [
            { k: 'icon', label: 'setSmallIcon', b: '.setSmallIcon(R.drawable.ic_news)', kt: 'icon = R.drawable.ic_news' },
            { k: 'title', label: 'setContentTitle', b: '.setContentTitle("Breaking")', kt: 'title = "Breaking"' },
            { k: 'text', label: 'setContentText', b: '.setContentText("Tap to read")', kt: 'text = "Tap to read"' },
            { k: 'prio', label: 'setPriority', b: '.setPriority(PRIORITY_HIGH)', kt: 'priority = Priority.High' },
            { k: 'action', label: 'addAction', b: '.addAction(readAction)', kt: 'actions = listOf(readAction)' },
          ];
          const on = { icon: true, title: true, text: true, prio: false, action: false };
          let busy = false;
          const chain = h('div', { class: 'kt' }), named = h('div', { class: 'kt' });
          const o = out('Toggle setters, then post the notification.');
          const shade = h('div', { class: 'phone pt-phone' }, h('p', { class: 'pt-empty' }, 'No notifications'));
          const chips = opts.map(x => h('button', { class: 'fn' + (on[x.k] ? ' on' : ''), 'aria-pressed': on[x.k], onclick() {
            if (busy) return;
            on[x.k] = !on[x.k]; this.classList.toggle('on', on[x.k]); this.setAttribute('aria-pressed', on[x.k]);
            paint(); replay(chain, 'pop-soft'); replay(named, 'pop-soft');
          } }, x.label));
          function paint() {
            const sel = opts.filter(x => on[x.k]);
            chain.innerHTML = hl(['NotificationCompat.Builder(context, CHANNEL_NEWS)', ...sel.map(x => '    ' + x.b), '    .build()'].join('\n'));
            const args = sel.map(x => '    ' + x.kt + ',');
            named.innerHTML = hl(['Notice(', ...args, ')', on.icon ? '// compiles: every other field has a default' : "// compile error: no value passed for parameter 'icon'"].join('\n'));
          }
          async function post() {
            if (busy) return; busy = true;
            if (!on.icon) {
              replay(shade, 'shake');
              say(o, '<span class="bad">IllegalArgumentException:</span> Invalid notification (no valid small icon) <span class="muted">// the builder accepted it, the system did not</span>');
              busy = false; return;
            }
            const empty = shade.querySelector('.pt-empty'); if (empty) empty.remove();
            const n = h('div', { class: 'pt-notif drop-in' }, h('span', { class: 'pt-ic' }),
              h('b', {}, on.title ? 'Breaking' : '(no title)'),
              h('span', {}, on.text ? 'Tap to read' : ''),
              h('span', { class: 'pt-row' }, on.prio ? tag('heads-up', 'pt-acc') : null, on.action ? h('span', { class: 'pt-act' }, 'READ') : null));
            shade.prepend(n);
            while (shade.children.length > 4) shade.lastElementChild.remove();
            say(o, `<span class="good">posted</span> with ${opts.filter(x => on[x.k]).length} setters ${on.prio ? '<span class="muted">// priority sets heads-up only on Android 7.1 and lower; 8.0+ uses the channel importance</span>' : ''}`);
            await sleep(450); busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'pt-chips' }, chips),
            h('div', { class: 'pt-split' },
              h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'Library builder: checked at runtime'), chain, h('span', { class: 'pt-label' }, 'Kotlin named + defaults: checked by the compiler'), named),
              shade),
            h('div', { class: 'controls' }, cmd('notificationManager.notify(1, notification)', post)),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'observer',
        title: 'Observer',
        tagline: 'Tell everyone who cares when a value changes.',
        level: 'intermediate',
        body: `
<p>The observer pattern has one subject and many subscribers. When the subject changes, it notifies each subscriber. The classic form is a listener interface with <code>addListener</code> and <code>removeListener</code>.</p>
<p>Listeners have a sharp edge on Android. If a destroyed Activity forgets to unregister, the subject still holds it. The Activity can’t be garbage collected, and it keeps receiving updates for a screen nobody sees.</p>
<p>Modern Kotlin exposes a <code>StateFlow</code> instead and collects it with <code>repeatOnLifecycle</code> or <code>collectAsStateWithLifecycle</code>. The lifecycle cancels the collector for you, and a new collector gets the current value right away. Rotate the screen in both modes below.</p>`,
        code: `// Classic observer: you must remember to unregister
interface CartListener { fun onCountChanged(count: Int) }

class CartManager {
    private val listeners = mutableListOf<CartListener>()
    fun addListener(l: CartListener) { listeners += l }
    fun removeListener(l: CartListener) { listeners -= l }
}

// Kotlin: the subject is a StateFlow
class CartRepository {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()
    fun add() = _count.update { it + 1 }
}

// Activity: collection stops below STARTED and is cancelled on destroy
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        cart.count.collect { badge.text = it.toString() }
    }
}

// Compose
val count by cart.count.collectAsStateWithLifecycle()`,
        remember: 'A listener you forget to remove is a leak. A lifecycle-aware collector removes itself.',
        terms: [
          { term: 'Observer pattern', def: 'A design where a subject keeps a list of subscribers and notifies each one when its state changes.' },
          { term: 'Listener leak', def: 'A memory leak where a long-lived object still holds a listener that belongs to a destroyed screen.' },
          { term: 'viewLifecycleOwner', def: 'The lifecycle of a Fragment’s view, which ends in onDestroyView while the Fragment itself may live on.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Expose a read-only count that subscribers can collect.', code: 'class CartRepository {\n    private val _count = [[MutableStateFlow]](0)\n    val count: StateFlow<Int> = _count.[[asStateFlow]]()\n}', why: 'Keep the mutable flow private and hand out a read-only <code>StateFlow</code> view of it.' },
          { type: 'bug', prompt: 'After navigating away and back, this Fragment updates a dead view and collects twice. Tap the line.', code: 'override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n    super.onViewCreated(view, savedInstanceState)\n    lifecycleScope.launch {\n        repeatOnLifecycle(Lifecycle.State.STARTED) {\n            viewModel.count.collect { binding.badge.text = "$it" }\n        }\n    }\n}', bug: 2, fix: '    viewLifecycleOwner.lifecycleScope.launch {', why: 'A Fragment outlives its view. Tie view work to <code>viewLifecycleOwner</code> so the collector ends in <code>onDestroyView</code>.' },
        ],
        quiz: [
          { q: 'An Activity calls <code>addListener(this)</code> but never removes it. What happens after rotation?', options: ['Nothing, Android removes it', 'The old Activity stays in memory and keeps getting callbacks', 'The app crashes immediately'], a: 1, why: 'The subject still references the destroyed Activity, so it can’t be collected.' },
          { q: 'A new collector starts on a <code>StateFlow</code> whose value is 3. What does it get first?', options: ['Nothing until the next change', '3, right away', 'Every value since 0'], a: 1, why: 'A StateFlow always has a value and replays the current one to each new collector.' },
        ],
        deeper: [
          {
            title: 'StateFlow keeps only the latest value',
            body: `<p>A <code>StateFlow</code> is not a queue. It holds one value. A slow collector that falls behind skips straight to the newest value, and setting a value equal to the current one emits nothing at all.</p>
<p>That is exactly right for state: the screen only needs to show what is true now. It is wrong for anything where every single item matters, like messages in a chat log.</p>`,
            code: `val progress = MutableStateFlow(0)

// fast producer
launch { for (p in 1..5) { progress.value = p; delay(150) } }

// slow collector: may see 0, 2, 5 and never 1, 3 or 4
launch { progress.collect { p -> drawSlowly(p) } }

progress.value = 5   // same as current: no emission`,
            visual(el) {
              let cur = 0, last = null, busy = false, running = false;
              const sent = h('div', { class: 'pt-row' });
              const seen = h('div', { class: 'pt-row' });
              const valueEl = h('div', { class: 'pt-slot' }, h('span', { class: 'chip total' }, '0'));
              const coll = h('div', { class: 'pt-card' }, h('span', { class: 'pt-title' }, 'collector (600 ms per value)'), seen);
              const o = out('');
              function reset() { cur = 0; last = null; sent.replaceChildren(); seen.replaceChildren(); valueEl.replaceChildren(h('span', { class: 'chip total' }, '0')); }
              async function collector() {
                if (running) return; running = true;
                while (el.isConnected) {
                  if (cur !== last) {
                    last = cur;
                    coll.classList.add('pt-on');
                    seen.append(tag(String(cur), 'pt-good drop-in'));
                    [...sent.children].forEach(c => { if (c.textContent === String(cur)) c.className = 'pt-tag pt-good'; });
                    await sleep(600);
                    coll.classList.remove('pt-on');
                  } else if (!busy) break;
                  else await sleep(50);
                }
                running = false;
              }
              async function burst() {
                if (busy) return; busy = true; reset();
                collector();
                for (let p = 1; p <= 5; p++) {
                  await sleep(150); if (!el.isConnected) return;
                  cur = p; swap(valueEl, String(p));
                  sent.append(tag(String(p), 'pt-acc'));
                }
                busy = false;
                while (running) { await sleep(100); if (!el.isConnected) return; }
                [...sent.children].forEach(c => { if (!c.classList.contains('pt-good')) c.className = 'pt-tag'; });
                const skipped = [...sent.children].filter(c => !c.classList.contains('pt-good')).length;
                say(o, `<span class="good">conflated:</span> 5 values set, the collector drew ${5 - skipped} of them. ${skipped} grey ones were replaced before it got to them.`);
              }
              function same() {
                if (busy) return;
                replay(valueEl, 'shake');
                sent.append(tag(`${cur} (same)`, ''));
                say(o, `${hl(`state.value = ${cur}`)} <span class="muted">→ equal to the current value, so no collector is woken</span>`);
              }
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'state.value'), valueEl, h('span', { class: 'pt-label' }, 'set by the producer'), sent),
                  coll),
                h('div', { class: 'controls' }, cmd('repeat(5) { state.value = it + 1 }', burst), cmd('state.value = state.value', same)),
                o);
              say(o, 'Set five values fast. The collector is slow.');
            },
          },
          {
            title: 'One-off events are not state',
            body: `<p>A "Saved" snackbar is an event: show it once. Put it in a <code>StateFlow</code> and it shows again after every rotation, because a new collector gets the current value. Send it on a <code>SharedFlow</code> with no replay and it is lost if it fires while the screen is rotating, since no one is collecting.</p>
<p>The Android guidance is to keep it as state and clear it. The ViewModel holds the message in its UI state, and the UI calls <code>onMessageShown()</code> once it has displayed it. Rotation can't lose it or repeat it.</p>`,
            code: `data class EditorUiState(val text: String = "", val message: String? = null)

fun save() = viewModelScope.launch {
    repo.save(_state.value.text)
    _state.update { it.copy(message = "Saved") }
}
fun onMessageShown() = _state.update { it.copy(message = null) }

// UI
state.message?.let { msg ->
    LaunchedEffect(msg) {
        snackbarHostState.showSnackbar(msg)
        viewModel.onMessageShown()
    }
}`,
            visual(el) {
              const MODES = {
                state: { name: 'StateFlow<String?>', visible: 'shown', during: 'shown after rotation', rotate: 'shown AGAIN', good: [1, 1, 0] },
                shared: { name: 'SharedFlow (no replay)', visible: 'shown', during: 'lost', rotate: 'nothing', good: [1, 0, 1] },
                cleared: { name: 'state + onMessageShown()', visible: 'shown, then cleared', during: 'shown after rotation', rotate: 'nothing', good: [1, 1, 1] },
              };
              let mode = 'state', busy = false, pending = false, lastShown = false;
              const phone = h('div', { class: 'phone pt-mini-phone' });
              const o = out('');
              const mBtns = Object.entries(MODES).map(([k, m]) => cmd(m.name, () => { if (busy) return; mode = k; pending = false; lastShown = false; press(); blank(); say(o, `${m.name}. Save, then rotate.`); }));
              const press = () => mBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(MODES)[i] === mode)));
              const blank = (txt = 'Editor') => phone.replaceChildren(h('p', { class: 'phone-note' }, txt));
              async function snack(text, cls) {
                const s = h('div', { class: `pt-notif drop-in ${cls}` }, h('span', { class: 'pt-ic' }), h('b', {}, 'Saved'), h('span', {}, text));
                phone.append(s);
                await sleep(1000); if (el.isConnected && s.isConnected) { s.classList.add('fly-out'); await sleep(350); s.remove(); }
              }
              async function rotateAnim() { replay(phone, 'flip'); await sleep(420); blank(); }
              async function saveVisible() {
                if (busy) return; busy = true; blank();
                lastShown = mode === 'state';
                say(o, `${hl('save()')} <span class="muted">while the screen collects →</span> <span class="good">${MODES[mode].visible}</span>`);
                await snack('', ''); busy = false;
              }
              async function saveDuring() {
                if (busy) return; busy = true;
                say(o, 'save() finishes while the Activity is being recreated...');
                await rotateAnim(); if (!el.isConnected) return;
                const r = MODES[mode].during;
                lastShown = mode === 'state';
                if (r === 'lost') { replay(phone, 'shake'); say(o, `<span class="bad">lost:</span> the event fired with no collector, and SharedFlow without replay drops it.`); }
                else { say(o, `<span class="good">${r}:</span> the new collector read the message from state.`); await snack('', ''); }
                busy = false;
              }
              async function rotate() {
                if (busy) return; busy = true;
                await rotateAnim(); if (!el.isConnected) return;
                if (mode === 'state' && lastShown) { replay(phone, 'shake'); say(o, '<span class="bad">shown again:</span> the StateFlow still holds "Saved", and the new collector gets it at once.'); await snack('again', 'pt-repeat'); }
                else say(o, `<span class="good">nothing shown</span> <span class="muted">${mode === 'cleared' ? 'because onMessageShown() set it back to null' : mode === 'shared' ? 'because SharedFlow keeps no value' : 'because no message was set yet'}</span>`);
                busy = false;
              }
              press(); blank();
              say(o, 'Pick how the ViewModel sends "Saved".');
              el.append(
                h('div', { class: 'controls' }, mBtns),
                h('div', { class: 'pt-split pt-auto' },
                  h('div', { class: 'controls' },
                    act('save() while visible', saveVisible),
                    act('save() during a rotation', saveDuring),
                    act('Rotate', rotate)),
                  phone),
                o);
            },
          },
          {
            title: 'WhileSubscribed(5_000) and rotation',
            body: `<p><code>stateIn(scope, SharingStarted.WhileSubscribed(5_000), initial)</code> runs the upstream flow only while someone collects. When the last collector leaves, it waits 5 seconds before stopping.</p>
<p>A rotation drops the collector for well under a second, so the upstream, perhaps a database query or a location listener, keeps running. Leaving the app for longer than 5 seconds stops it and saves battery. When the user returns, collection restarts.</p>`,
            code: `val feed: StateFlow<List<Article>> = repo.articles()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),   // survives rotation
        initialValue = emptyList(),
    )`,
          },
        ],
        underHood: {
          body: `<p>A <code>MutableStateFlow</code> stores a single value. Setting it compares the new value with the old one using <code>equals</code>. If they differ, it stores the new one and wakes any suspended collectors. Each collector then reads whatever the value is at that moment. There is no buffer, which is where conflation comes from.</p>
<p><code>repeatOnLifecycle(STARTED)</code> launches your block each time the lifecycle reaches <code>STARTED</code> and cancels it when it falls below, at <code>ON_STOP</code>. A collector inside it is a new subscription each time, so it receives the current value immediately.</p>`,
          code: `// Equivalent behaviour, written by hand
val state = MutableStateFlow(0)
state.value = 1        // stored, collectors woken
state.value = 1        // equal: ignored
// a collector only ever sees "the latest value it hasn't seen",
// like flow.distinctUntilChanged() with a buffer of one`,
        },
        mistakes: [
          { title: 'Mutating the list inside a StateFlow', bad: 'private val _items = MutableStateFlow(mutableListOf<Item>())\nfun add(item: Item) {\n    _items.value.add(item)   // same list object: no emission\n}', good: 'private val _items = MutableStateFlow<List<Item>>(emptyList())\nfun add(item: Item) {\n    _items.update { it + item }   // new list: emits\n}', why: 'The flow sees the same object, which equals itself, so collectors are never told. Keep immutable values in a StateFlow and replace them.' },
          { title: 'Two collects in one coroutine', bad: 'repeatOnLifecycle(Lifecycle.State.STARTED) {\n    vm.title.collect { toolbar.title = it }\n    vm.items.collect { adapter.submitList(it) }   // never runs\n}', good: 'repeatOnLifecycle(Lifecycle.State.STARTED) {\n    launch { vm.title.collect { toolbar.title = it } }\n    launch { vm.items.collect { adapter.submitList(it) } }\n}', why: 'Collecting a StateFlow never completes, so the line after it is never reached. Give each collector its own <code>launch</code>.' },
          { title: 'Using the deprecated launchWhenStarted', bad: 'lifecycleScope.launchWhenStarted {\n    vm.location.collect { map.moveTo(it) }\n}', good: 'lifecycleScope.launch {\n    repeatOnLifecycle(Lifecycle.State.STARTED) {\n        vm.location.collect { map.moveTo(it) }\n    }\n}', why: '<code>launchWhenStarted</code> only pauses the collector in the background, so the upstream keeps producing. <code>repeatOnLifecycle</code> cancels it and starts again later.' },
        ],
        visual(el) {
          let count = 0, flow = true, gen = 1, busy = false, leaked = 0;
          const src = h('div', { class: 'pt-slot' }, h('span', { class: 'chip total' }, '0'));
          const subject = h('div', { class: 'pt-card pt-on' }, h('span', { class: 'pt-title' }), src);
          const list = h('div', { class: 'pt-col' });
          const o = out('Add to the cart, then rotate.');
          let subs = [];
          const mkSub = (name, value, life) => {
            const s = { name, life, ghost: false };
            s.slot = h('div', { class: 'pt-slot' }, h('span', { class: 'chip' }, value));
            s.status = tag(flow ? 'collecting' : 'listening', 'pt-good');
            s.el = h('div', { class: 'pt-card' }, h('div', { class: 'pt-row' }, h('span', { class: 'pt-title' }, name), s.status), s.slot);
            return s;
          };
          function reset() {
            count = 0; gen = 1; leaked = 0;
            subject.firstElementChild.textContent = flow ? 'cart.count: StateFlow<Int>' : 'CartManager listeners';
            src.replaceChildren(h('span', { class: 'chip total' }, '0'));
            subs = [mkSub('ToolbarBadge', '0', false), mkSub('CartActivity #1', '0', true)];
            list.replaceChildren(...subs.map(s => s.el));
          }
          async function add() {
            if (busy) return; busy = true;
            count++; swap(src, String(count)); replay(subject, 'pt-flash');
            for (const s of subs) {
              await sleep(200);
              if (!el.isConnected) return;
              swap(s.slot, String(count));
              if (s.ghost) { replay(s.el, 'shake'); }
              else replay(s.el, 'pt-flash');
            }
            say(o, leaked
              ? `count = ${count}. <span class="bad">${leaked} destroyed Activit${leaked > 1 ? 'ies' : 'y'} also got it</span> <span class="muted">// leaked, still registered</span>`
              : `count = ${count} <span class="muted">// ${subs.length} live subscribers updated</span>`);
            busy = false;
          }
          async function rotate() {
            if (busy) return; busy = true;
            const old = subs.find(s => s.life && !s.ghost);
            if (flow) {
              old.status.textContent = 'cancelled'; old.status.className = 'pt-tag';
              old.el.classList.add('leave'); await sleep(450);
              old.el.remove(); subs = subs.filter(s => s !== old);
            } else {
              old.ghost = true; leaked++;
              old.name += ' (destroyed)'; old.el.querySelector('.pt-title').textContent = old.name;
              old.status.textContent = 'still registered'; old.status.className = 'pt-tag pt-warn';
              old.el.classList.add('pt-bad'); replay(old.el, 'shake');
              await sleep(400);
            }
            gen++;
            const s = mkSub(`CartActivity #${gen}`, flow ? String(count) : '-', true);
            subs.push(s); list.append(s.el); replay(s.el, 'drop-in');
            const ghosts = subs.filter(x => x.ghost);
            if (ghosts.length > 2) { ghosts[0].el.remove(); subs = subs.filter(x => x !== ghosts[0]); }
            say(o, flow
              ? `Old collector cancelled. The new one got the current value <b>${count}</b> at once. <span class="muted">// StateFlow replays its value</span>`
              : `<span class="bad">leak:</span> the old Activity is still in the list (${leaked} leaked). The new listener shows nothing until the next change.`);
            busy = false;
          }
          const mode = toggle('pt-ob-flow', 'StateFlow + repeatOnLifecycle', true, () => {
            if (busy) { mode.input.checked = flow; return; }
            flow = mode.input.checked; reset(); replay(list, 'pop-soft');
            say(o, flow ? 'Lifecycle-aware collectors. Rotate and watch the old one go away.' : 'Plain listeners that never unregister. Rotate and watch the old one stay.');
          });
          reset();
          el.append(
            h('div', { class: 'pt-split' }, h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'subject'), subject), h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'subscribers'), list)),
            h('div', { class: 'controls' }, mode, cmd('cart.add()', add), act('Rotate', rotate)),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'strategy',
        title: 'Strategy',
        tagline: 'Pass the algorithm in instead of hard-coding it.',
        level: 'beginner',
        body: `
<p>A strategy is an interchangeable piece of behaviour. Instead of an <code>if</code> chain inside <code>Checkout</code> for every promotion, <code>Checkout</code> takes a pricing function and calls it. New promotion, new function. <code>Checkout</code> never changes.</p>
<p>In Kotlin a strategy is usually just a function type, like <code>(List&lt;CartItem&gt;) -&gt; Long</code>, and each strategy is a lambda. Reach for an interface when the strategy needs a name, its own state, or more than one method.</p>
<p>You already use one every day: <code>Comparator</code> is a sorting strategy. <code>sortedWith(compareBy { it.name })</code> keeps the sort algorithm and swaps only the ordering rule. Swap both strategies below.</p>`,
        code: `data class CartItem(val name: String, val priceCents: Long, val qty: Int)

typealias Pricing = (List<CartItem>) -> Long
val List<CartItem>.subtotal: Long get() = sumOf { it.priceCents * it.qty }

val regular: Pricing = { it.subtotal }
val sale20: Pricing = { it.subtotal * 80 / 100 }
val memberDeal: Pricing = { items -> items.subtotal.let { if (it >= 40_00) it - 5_00 else it } }
val threeForTwo: Pricing = { items ->
    val units = items.flatMap { item -> List(item.qty) { item.priceCents } }
    if (units.size >= 3) units.sum() - units.min() else units.sum()
}

class Checkout(var pricing: Pricing = regular) {
    fun total(items: List<CartItem>): Long = pricing(items)
}

val checkout = Checkout()
checkout.pricing = sale20            // swap at runtime

// Sorting strategies: Comparator
val byName = compareBy<CartItem> { it.name }
val byPriceDesc = compareByDescending<CartItem> { it.priceCents }
val rows = cart.sortedWith(byPriceDesc)`,
        remember: 'Keep the algorithm, swap the rule. In Kotlin the rule is usually a lambda.',
        terms: [
          { term: 'Strategy pattern', def: 'A design where an object receives an interchangeable algorithm instead of choosing one internally.' },
          { term: 'Comparator', def: 'A strategy object that decides the order of two values, used by sortedWith and sorted collections.' },
          { term: 'typealias', def: 'A Kotlin declaration that gives an existing type, such as a function type, a shorter name.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a title ordering and sort with it.', code: 'val byTitle = [[compareBy]]<Article> { it.title.lowercase() }\nval sorted = articles.[[sortedWith]](byTitle)', why: '<code>compareBy</code> creates a Comparator from a key. <code>sortedWith</code> takes any Comparator, so the sort itself never changes.' },
          { type: 'bug', prompt: 'Tapping “Sort by title” changes nothing on screen. Tap the line.', code: 'var articles: List<Article> = emptyList()\n\nfun applyOrder(order: Comparator<Article>) {\n    articles.sortedWith(order)\n    render(articles)\n}', bug: 3, fix: '    articles = articles.sortedWith(order)', why: '<code>sortedWith</code> returns a new sorted list and leaves the original alone. The result has to be assigned.' },
        ],
        quiz: [
          { q: 'A new “Black Friday” discount arrives. With the strategy pattern, what changes in <code>Checkout</code>?', options: ['A new branch in its when', 'Nothing, you pass it a new Pricing', 'Its constructor signature'], a: 1, why: 'The discount is a new function. Checkout just calls whatever pricing it holds.' },
          { q: 'When is an interface a better fit than a function type for a strategy?', options: ['Always', 'When it needs a name, state, or several methods', 'Never in Kotlin'], a: 1, why: 'A lambda covers one operation. An interface groups related operations and can hold data.' },
        ],
        deeper: [
          {
            title: 'Strategies compose: thenBy breaks ties',
            body: `<p>A <code>Comparator</code> is a strategy you can combine. <code>compareBy { it.category }.thenByDescending { it.priceCents }</code> sorts by category and breaks ties by price. Each piece is tiny, and the sort itself never changes.</p>
<p>Ties matter more than they look. Kotlin's <code>sortedWith</code> is stable: items that compare as equal keep the order they arrived in. Without a tie-breaker, that order comes from the server, and it can change between two loads of the same data.</p>`,
            code: `val order = compareBy<Product> { it.category }
    .thenByDescending { it.priceCents }
    .thenBy { it.name }

val rows = products.sortedWith(order)`,
            visual(el) {
              const items = [
                { name: 'Mug', cat: 'Home', p: 1200 }, { name: 'Tea', cat: 'Food', p: 900 },
                { name: 'Vase', cat: 'Home', p: 1200 }, { name: 'Lamp', cat: 'Home', p: 2400 },
                { name: 'Honey', cat: 'Food', p: 900 }, { name: 'Beans', cat: 'Food', p: 1800 },
              ];
              const KEYS = [
                { k: 'price', label: 'thenByDescending price', src: '.thenByDescending { it.priceCents }', f: (a, b) => b.p - a.p },
                { k: 'name', label: 'thenBy name', src: '.thenBy { it.name }', f: (a, b) => a.name.localeCompare(b.name) },
              ];
              const on = { price: false, name: false };
              let input = items.slice();
              const chain = h('div', { class: 'kt' });
              const list = h('div', { class: 'pt-col' });
              const inputRow = h('div', { class: 'pt-row' });
              const o = out('');
              const cmpOf = () => {
                const ks = [(a, b) => a.cat.localeCompare(b.cat), ...KEYS.filter(x => on[x.k]).map(x => x.f)];
                return (a, b) => { for (const f of ks) { const r = f(a, b); if (r) return r; } return 0; };
              };
              function paintChain() {
                chain.innerHTML = hl(['val order = compareBy<Product> { it.category }', ...KEYS.filter(x => on[x.k]).map(x => '    ' + x.src)].join('\n'));
                inputRow.replaceChildren(h('span', { class: 'pt-label' }, 'API order'), ...input.map(x => tag(x.name)));
              }
              function sortNow(anim) {
                const cmp = cmpOf();
                const sorted = input.slice().sort(cmp);
                let ties = 0;
                list.replaceChildren(...sorted.map((x, i) => {
                  const tie = (i > 0 && cmp(sorted[i - 1], x) === 0) || (i < sorted.length - 1 && cmp(x, sorted[i + 1]) === 0);
                  if (tie) ties++;
                  return h('div', { class: 'pt-li' + (tie ? ' pt-d2-tie' : '') + (anim ? ' drop-in' : ''), style: anim ? `animation-delay:${i * 50}ms` : null },
                    x.name, h('small', {}, `${x.cat} · ${money(x.p)}${tie ? ' · tie' : ''}`));
                }));
                return ties;
              }
              const report = ties => (ties
                ? `<span class="bad">${ties} rows tie</span> <span class="muted">// their order comes from the API, not from you</span>`
                : '<span class="good">no ties</span> <span class="muted">// every row has one place, whatever order the API used</span>');
              const chips = KEYS.map(x => h('button', { class: 'fn', 'aria-pressed': 'false', onclick() {
                on[x.k] = !on[x.k]; this.classList.toggle('on', on[x.k]); this.setAttribute('aria-pressed', String(on[x.k]));
                paintChain(); replay(chain, 'pop-soft');
                say(o, `${on[x.k] ? 'Added' : 'Removed'} ${hl(x.src)}. ${report(sortNow(true))}`);
              } }, x.label));
              function sortCmd() { say(o, `${hl('products.sortedWith(order)')} ${report(sortNow(true))}`); }
              function shuffle() {
                input = input.slice().reverse(); paintChain(); replay(inputRow, 'pt-flash');
                const ties = sortNow(true);
                say(o, ties
                  ? `Same items, new API order. <span class="bad">The tied rows swapped places.</span> <span class="muted">// stable sort keeps arrival order for ties</span>`
                  : `Same items, new API order. <span class="good">Same result.</span> <span class="muted">// the comparator decides every position</span>`);
              }
              paintChain();
              say(o, `Sorted by category only. ${report(sortNow(false))}`);
              el.append(
                h('div', { class: 'pt-chips' }, chips),
                h('div', { class: 'pt-split' }, h('div', { class: 'pt-col' }, chain, inputRow), list),
                h('div', { class: 'controls' }, cmd('products.sortedWith(order)', sortCmd), act('API sends the same items in a new order', shuffle)),
                o);
            },
          },
          {
            title: 'Pick the strategy at the edge, with a default',
            body: `<p>Something still has to choose the strategy. Keep that choice in one place at the edge of the app: a map from a config value to a strategy, with a safe default. <code>Checkout</code> never learns where the choice came from.</p>
<p>Remote config, A/B tests and user settings then become plain data. An unknown promo name from the server falls back to <code>regular</code> instead of crashing the cart. With Hilt you can build the same map from <code>@IntoMap</code> bindings.</p>`,
            code: `val pricings: Map<String, Pricing> = mapOf(
    "regular" to regular,
    "sale20" to sale20,
    "member" to memberDeal,
)

fun pricingFor(promo: String?): Pricing = pricings[promo] ?: regular

checkout.pricing = pricingFor(remoteConfig.getString("promo"))`,
            visual(el) {
              const sub = 5320;
              const MAP = [
                { key: 'regular', fn: 'regular', f: () => sub, note: 'full price' },
                { key: 'sale20', fn: 'sale20', f: () => Math.floor(sub * 80 / 100), note: '20% off everything' },
                { key: 'member', fn: 'memberDeal', f: () => (sub >= 4000 ? sub - 500 : sub), note: '$5 off at $40 or more' },
              ];
              let busy = false;
              const rows = MAP.map(m => h('div', { class: 'pt-step', html: hl(`"${m.key}" to ${m.fn}`) }));
              const fallback = h('div', { class: 'pt-step', html: hl('?: regular   // unknown or missing') });
              const cfg = tag('promo = -');
              const total = h('span', { class: 'pt-num' }, money(sub));
              const used = tag('regular');
              const cart = h('div', { class: 'pt-card pt-on' }, h('span', { class: 'pt-title' }, 'Checkout'), h('span', { class: 'pt-label' }, 'pricing'), used, h('span', { class: 'pt-label' }, 'total'), total);
              const o = out('');
              async function send(v) {
                if (busy) return; busy = true;
                const key = v == null ? null : v;
                cfg.textContent = `promo = ${v == null ? 'null' : `"${v}"`}`; cfg.className = 'pt-tag pt-acc'; replay(cfg, 'pop');
                [...rows, fallback].forEach(r => { r.className = 'pt-step'; });
                say(o, hl(`pricingFor(${v == null ? 'null' : `"${v}"`})`));
                let hit = null;
                for (let i = 0; i < MAP.length; i++) {
                  rows[i].classList.add('pt-now'); await sleep(260); if (!el.isConnected) return;
                  rows[i].classList.remove('pt-now');
                  if (MAP[i].key === key) { rows[i].classList.add('pt-done'); hit = MAP[i]; break; }
                }
                if (!hit) { fallback.classList.add('pt-now'); await sleep(260); if (!el.isConnected) return; fallback.classList.remove('pt-now'); fallback.classList.add('pt-done'); hit = MAP[0]; }
                used.textContent = hit.fn; replay(used, 'pop');
                total.textContent = money(hit.f()); replay(total, 'pop'); replay(cart, 'pt-flash');
                say(o, `${hl(`pricingFor(${v == null ? 'null' : `"${v}"`})`)} = ${hit.fn} <span class="muted">// ${v === hit.key ? hit.note : 'no match, so the safe default'}. Checkout did not change.</span>`);
                busy = false;
              }
              say(o, 'Remote config decides the promo. Send a few values.');
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'from the server'), cfg, h('span', { class: 'pt-label' }, 'pricings[promo]'), h('div', { class: 'pt-steps' }, rows, fallback)),
                  cart),
                h('div', { class: 'controls' }, ['sale20', 'member', 'blackfriday', null].map(v => cmd(`pricingFor(${v == null ? 'null' : `"${v}"`})`, () => send(v)))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Since Kotlin 2.0, a lambda stored in a function type compiles through <code>invokedynamic</code>, the same mechanism Java uses for its lambdas, and D8 turns that into small classes for Android. A lambda that captures nothing, like <code>sale20</code>, ends up as one shared instance. A lambda that captures a local variable gets a new object each time the expression runs.</p>
<p><code>compareBy</code> returns a <code>Comparator</code> that runs your selector on both items and compares the results. <code>thenBy</code> wraps it: it asks the first comparator and only on a tie calls the next one. <code>sortedWith</code> copies the list into an array and calls <code>java.util.Arrays.sort</code> with your comparator. For objects that is TimSort, which is stable.</p>`,
          code: `// thenBy, roughly
fun <T> Comparator<T>.thenBy(selector: (T) -> Comparable<*>?): Comparator<T> =
    Comparator { a, b ->
        val first = this.compare(a, b)
        if (first != 0) first else compareValuesBy(a, b, selector)
    }`,
        },
        mistakes: [
          {
            title: 'Comparing by subtraction',
            bad: `val newestFirst = Comparator<Article> { a, b ->
    (b.publishedAtMillis - a.publishedAtMillis).toInt()
}`,
            good: `val newestFirst = compareByDescending<Article> { it.publishedAtMillis }`,
            why: 'Two timestamps about 25 days apart differ by more than <code>Int.MAX_VALUE</code> milliseconds. <code>toInt()</code> wraps around, the sign flips, and older articles jump to the top. <code>compareBy</code> and <code>compareTo</code> never overflow.',
          },
          {
            title: 'Chaining two sorts the wrong way round',
            bad: `// wants: by section, then by title
articles.sortedBy { it.section }.sortedBy { it.title }`,
            good: `articles.sortedWith(compareBy({ it.section }, { it.title }))`,
            why: 'The last sort becomes the main key, so this list is ordered by title and section only breaks ties. One comparator with the keys in order says what you mean and sorts once.',
          },
          {
            title: 'A sorted set that drops items',
            bad: `val cart = sortedSetOf(compareBy<CartItem> { it.priceCents })
cart += CartItem("Tea", 450, 1)
cart += CartItem("Coffee", 450, 2)   // ignored: compares as equal`,
            good: `val cart = sortedSetOf(compareBy<CartItem>({ it.priceCents }, { it.name }))`,
            why: 'A sorted set treats <code>compare(a, b) == 0</code> as "same item" and keeps only the first. Give the comparator enough keys to tell different items apart.',
          },
        ],
        visual(el) {
          const items = [
            { name: 'Coffee', p: 450, q: 2 }, { name: 'Croissant', p: 320, q: 1 },
            { name: 'Beans', p: 1800, q: 1 }, { name: 'Mug', p: 1200, q: 1 },
          ];
          const sub = items.reduce((s, x) => s + x.p * x.q, 0);
          const pricings = [
            { id: 'regular', f: () => sub, note: 'full price' },
            { id: 'sale20', f: () => Math.floor(sub * 80 / 100), note: '20% off everything' },
            { id: 'memberDeal', f: () => (sub >= 4000 ? sub - 500 : sub), note: '$5 off at $40 or more' },
            { id: 'threeForTwo', f: () => { const u = items.flatMap(x => Array(x.q).fill(x.p)); return u.length >= 3 ? u.reduce((a, b) => a + b, 0) - Math.min(...u) : sub; }, note: 'cheapest unit free' },
          ];
          const sorts = [
            { id: 'byName', f: (a, b) => a.name.localeCompare(b.name) },
            { id: 'byPriceDesc', f: (a, b) => b.p - a.p },
            { id: 'byQtyDesc', f: (a, b) => b.q - a.q || a.name.localeCompare(b.name) },
          ];
          let pricing = pricings[0], sort = sorts[0], shown = sub;
          const rows = h('div', { class: 'pt-col' });
          const total = h('span', { class: 'pt-num' }, money(sub));
          const assign = h('div', { class: 'kt' }), sortLine = h('div', { class: 'kt' });
          const note = tag('');
          const checkoutCard = h('div', { class: 'pt-card pt-on' }, h('span', { class: 'pt-title' }, 'Checkout'), assign, h('span', { class: 'pt-label' }, 'total'), total, note);
          const o = out('Swap a strategy. Checkout’s code stays the same.');
          const pBtns = pricings.map(x => cmd(x.id, () => setPricing(x)));
          const sBtns = sorts.map(x => cmd(x.id, () => setSort(x)));
          function tween(from, to) {
            const t0 = performance.now();
            const step = now => {
              if (!total.isConnected) return;
              const k = Math.min(1, (now - t0) / 450);
              total.textContent = money(Math.round(from + (to - from) * k));
              if (k < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
          function paintRows(anim) {
            rows.replaceChildren(...[...items].sort(sort.f).map((x, i) => h('div', { class: 'pt-li' + (anim ? ' drop-in' : ''), style: anim ? `animation-delay:${i * 70}ms` : null },
              `${x.name} × ${x.q}`, h('small', {}, `${money(x.p)} each`))));
          }
          function paint() {
            assign.innerHTML = hl(`checkout.pricing = ${pricing.id}`);
            sortLine.innerHTML = hl(`cart.sortedWith(${sort.id})`);
            note.textContent = pricing.note;
            pBtns.forEach((b, i) => b.setAttribute('aria-pressed', pricings[i] === pricing));
            sBtns.forEach((b, i) => b.setAttribute('aria-pressed', sorts[i] === sort));
          }
          function setPricing(x) {
            pricing = x; paint();
            const next = x.f(); tween(shown, next);
            say(o, `${hl('checkout.total(cart)')} = <span class="good">${money(next)}</span> <span class="muted">// subtotal ${money(sub)}, ${x.note}</span>`);
            shown = next; replay(checkoutCard, 'pt-flash');
          }
          function setSort(x) {
            sort = x; paint(); paintRows(true);
            say(o, `${hl(`cart.sortedWith(${x.id})`)} <span class="muted">// same sort, different Comparator</span>`);
          }
          paint(); paintRows(false);
          el.append(
            h('div', { class: 'pt-split' }, h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'cart'), sortLine, rows), checkoutCard),
            h('div', { class: 'controls' }, h('span', { class: 'pt-label' }, 'pricing'), pBtns),
            h('div', { class: 'controls' }, h('span', { class: 'pt-label' }, 'order'), sBtns),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'adapter',
        title: 'Adapter',
        tagline: 'Make one shape fit where another is expected.',
        level: 'intermediate',
        body: `
<p>An adapter converts one interface into another that the caller expects. On Android you meet it in two places.</p>
<p>First, the data boundary. The server’s JSON shape is a DTO (data transfer object) that you don’t control: snake_case names, epoch seconds, fields that come and go. A small mapper such as <code>ArticleDto.toDomain()</code> adapts it to your own <code>Article</code> model. When the API renames a field, only the DTO and the mapper change.</p>
<p>Second, <code>RecyclerView.Adapter</code> adapts a list of models to row views. <code>ListAdapter</code> adds <code>DiffUtil</code>, so <code>submitList</code> updates only the rows that changed. Map, bind, then refresh below.</p>`,
        code: `// Server shape: you don't own it
@Serializable
data class ArticleDto(
    val id: Long,
    val headline: String,
    @SerialName("published_at") val publishedAtEpoch: Long,
    @SerialName("image_url") val imageUrl: String? = null,
)

// App shape: you do
data class Article(val id: Long, val title: String, val published: Instant, val image: String?)

fun ArticleDto.toDomain() = Article(
    id = id,
    title = headline.trim(),
    published = Instant.ofEpochSecond(publishedAtEpoch),
    image = imageUrl,
)

// RecyclerView adapter: list of Article -> row views
class ArticleAdapter : ListAdapter<Article, ArticleAdapter.Holder>(Diff) {
    class Holder(val binding: ItemArticleBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        Holder(ItemArticleBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: Holder, position: Int) {
        holder.binding.title.text = getItem(position).title
    }

    object Diff : DiffUtil.ItemCallback<Article>() {
        override fun areItemsTheSame(old: Article, new: Article) = old.id == new.id
        override fun areContentsTheSame(old: Article, new: Article) = old == new
    }
}`,
        remember: 'Map DTOs to your own models at the edge. Adapters make shapes fit; they don’t add behaviour.',
        terms: [
          { term: 'DTO', def: 'A data transfer object whose fields mirror an external format such as a JSON response.' },
          { term: 'Mapper', def: 'A function, often an extension like toDomain(), that converts one model type into another.' },
          { term: 'ListAdapter', def: 'A RecyclerView.Adapter that diffs each submitted list on a background thread and updates only changed rows.' },
          { term: 'DiffUtil', def: 'A utility that computes the inserts, removes, moves and changes between two lists.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the mapper and the row binding.', code: 'fun ArticleDto.[[toDomain]]() = Article(\n    id = id,\n    title = headline.trim(),\n    published = Instant.ofEpochSecond(publishedAtEpoch),\n    image = imageUrl,\n)\n\noverride fun onBindViewHolder(holder: Holder, position: Int) {\n    holder.binding.title.text = [[getItem]](position).title\n}', why: 'An extension on the DTO keeps the mapping next to the boundary. <code>ListAdapter.getItem</code> returns the model for a row.' },
          { type: 'bug', prompt: 'Editing one article’s title makes its row vanish and reappear instead of updating in place. Tap the line.', code: 'object Diff : DiffUtil.ItemCallback<Article>() {\n    override fun areItemsTheSame(old: Article, new: Article) = old == new\n    override fun areContentsTheSame(old: Article, new: Article) = old == new\n}', bug: 1, fix: '    override fun areItemsTheSame(old: Article, new: Article) = old.id == new.id', why: '<code>areItemsTheSame</code> asks “is this the same thing?” and should compare a stable id. Comparing everything turns every edit into a remove plus an insert.' },
        ],
        quiz: [
          { q: 'The API renames <code>headline</code> to <code>title</code>. What should change?', options: ['Every screen that shows a title', 'The DTO and its mapper', 'The RecyclerView adapter'], a: 1, why: 'The domain model and the UI depend on your Article, not on the JSON.' },
          { q: 'What does <code>ListAdapter</code> add over a plain <code>RecyclerView.Adapter</code>?', options: ['Click handling', 'Diffing on submitList so only changed rows update', 'Paging'], a: 1, why: 'It runs DiffUtil for you and dispatches minimal updates.' },
        ],
        deeper: [
          {
            title: 'Payloads: update one view, not the whole row',
            body: `<p>When <code>areContentsTheSame</code> returns false, <code>ListAdapter</code> rebinds the whole row, and the default item animator cross-fades it. For a like counter that ticks often, the row blinks and its image may reload.</p>
<p>Override <code>getChangePayload</code> to say <em>what</em> changed. The adapter then calls the three-argument <code>onBindViewHolder</code> on the same ViewHolder with that payload, and you update just one view. No cross-fade, no image reload.</p>`,
            code: `object LikesChanged

object Diff : DiffUtil.ItemCallback<Article>() {
    override fun areItemsTheSame(old: Article, new: Article) = old.id == new.id
    override fun areContentsTheSame(old: Article, new: Article) = old == new
    override fun getChangePayload(old: Article, new: Article): Any? =
        if (old.copy(likes = new.likes) == new) LikesChanged else null
}

override fun onBindViewHolder(holder: Holder, position: Int, payloads: List<Any>) {
    if (LikesChanged in payloads) holder.binding.likes.text = getItem(position).likes.toString()
    else super.onBindViewHolder(holder, position, payloads)   // full bind
}`,
            visual(el) {
              const data = [
                { id: 101, title: 'Rain expected all weekend', likes: 12 },
                { id: 102, title: 'Ferry times change on Monday', likes: 40 },
                { id: 103, title: 'New park opens downtown', likes: 7 },
              ];
              let payloads = false, busy = false, full = 0, partial = 0;
              data.forEach(a => {
                a.likesEl = h('b', { class: 'pt-d2-likes' }, String(a.likes));
                a.img = h('span', { class: 'pt-d2-img' });
                a.titleEl = h('span', { class: 'pt-d2-t' }, a.title);
                a.row = h('div', { class: 'pt-d2-row' }, a.img, h('div', { class: 'pt-col' }, a.titleEl, h('span', { class: 'pt-row' }, h('span', { class: 'pt-label' }, 'likes'), a.likesEl)));
              });
              const counts = tag('');
              const o = out('');
              const ln = html => o.append(h('div', { class: 'line drop-in', html }));
              const paintCounts = () => { counts.textContent = `full binds ${full} · payload binds ${partial}`; replay(counts, 'pop-soft'); };
              async function fullBind(a) {
                full++;
                a.row.classList.add('pt-d2-fade'); a.img.classList.add('pt-d2-loading');
                await sleep(420); if (!el.isConnected) return false;
                a.titleEl.textContent = a.title; a.likesEl.textContent = String(a.likes);
                a.row.classList.remove('pt-d2-fade');
                await sleep(380); if (!el.isConnected) return false;
                a.img.classList.remove('pt-d2-loading');
                return true;
              }
              async function like(a) {
                if (busy) return; busy = true;
                a.likes++;
                const pos = data.indexOf(a);
                say(o, `${hl(`submitList(list with ${a.id}.likes = ${a.likes})`)} <span class="muted">// only likes changed</span>`);
                if (payloads) {
                  partial++;
                  a.likesEl.textContent = String(a.likes); replay(a.likesEl, 'pop');
                  ln(`${hl(`onBindViewHolder(holder, ${pos}, [LikesChanged])`)} <span class="muted">// one TextView set, same ViewHolder</span>`);
                } else {
                  ln(`<span class="bad">getChangePayload = null</span> <span class="muted">// full rebind: cross-fade, image loads again</span>`);
                  if (!await fullBind(a)) return;
                }
                paintCounts(); busy = false;
              }
              async function retitle(a) {
                if (busy) return; busy = true;
                a.title = a.title.endsWith(' (updated)') ? a.title.replace(' (updated)', '') : a.title + ' (updated)';
                const pos = data.indexOf(a);
                say(o, `${hl(`submitList(list with ${a.id}.title changed)`)}`);
                ln(`${payloads ? 'title changed too, so getChangePayload returns null.' : 'no payload support.'} <span class="muted">// full bind of row ${pos} is correct here</span>`);
                if (!await fullBind(a)) return;
                paintCounts(); busy = false;
              }
              const t = toggle('pt-d2-ad-pay', 'override getChangePayload', false, () => {
                if (busy) { t.input.checked = payloads; return; }
                payloads = t.input.checked;
                say(o, payloads ? 'Payloads on. Like an article again.' : 'Payloads off. Every content change is a full bind.');
              });
              paintCounts();
              say(o, 'Tap like a few times and watch the row.');
              el.append(
                h('div', { class: 'pt-split' }, h('div', { class: 'pt-d2-rows' }, data.map(a => a.row)), h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'RecyclerView'), counts, t)),
                h('div', { class: 'controls' }, cmd('like(102)', () => like(data[1])), cmd('like(101)', () => like(data[0])), cmd('retitle(103)', () => retitle(data[2]))),
                o);
            },
          },
          {
            title: 'ConcatAdapter: several adapters in one list',
            body: `<p>A feed often has a header, the articles and a "loading more" footer. Instead of one adapter juggling view types and position offsets, give each part its own adapter and join them with <code>ConcatAdapter</code>. It adapts several adapters into the one adapter a RecyclerView expects.</p>
<p>Each child keeps its own positions, starting at 0. In a ViewHolder, <code>bindingAdapterPosition</code> is the position inside its own adapter, and <code>absoluteAdapterPosition</code> is the position in the whole list. Show the footer by giving its adapter one item, and hide it by giving it none.</p>`,
            code: `val header = HeaderAdapter()
val articles = ArticleAdapter()
val footer = LoadingFooterAdapter()    // itemCount is 0 or 1

recyclerView.adapter = ConcatAdapter(header, articles, footer)

class LoadingFooterAdapter : RecyclerView.Adapter<FooterHolder>() {
    var loading = false
        set(value) {
            if (field == value) return
            field = value
            if (value) notifyItemInserted(0) else notifyItemRemoved(0)
        }
    override fun getItemCount() = if (loading) 1 else 0
    // onCreateViewHolder, onBindViewHolder ...
}`,
            visual(el) {
              let header = true, loading = false, busy = false, next = 0;
              let items = ['Rain expected all weekend', 'Ferry times change', 'New park opens'];
              const extra = ['Library extends hours', 'Tram line extended', 'Market moves to Saturday', 'Marathon route set'];
              const list = h('div', { class: 'pt-d2-rows' });
              const legend = h('div', { class: 'pt-row' });
              const o = out('');
              const children = () => [
                { name: 'HeaderAdapter', cls: 'pt-d2-a1', rows: header ? ['Top stories'] : [] },
                { name: 'ArticleAdapter', cls: 'pt-d2-a2', rows: items },
                { name: 'FooterAdapter', cls: 'pt-d2-a3', rows: loading ? ['Loading more…'] : [] },
              ];
              let flat = [];
              function paint(mark) {
                flat = []; let g = 0;
                for (const c of children()) c.rows.forEach((r, local) => flat.push({ c, r, local, g: g++ }));
                list.replaceChildren(...flat.map(x => h('button', { type: 'button', class: `pt-d2-crow ${x.c.cls}` + (mark && mark(x) ? ' drop-in' : ''), onclick: () => tap(x) },
                  h('span', { class: 'pt-d2-gpos' }, String(x.g)), h('span', { class: 'pt-d2-t' }, x.r), h('small', {}, `${x.c.name} · ${x.local}`))));
                legend.replaceChildren(...children().map(c => h('span', { class: `pt-tag ${c.cls}` }, `${c.name}: ${c.rows.length}`)));
              }
              function tap(x) {
                if (busy) return;
                say(o, `tapped "${x.r}" <div class="line">${hl(`absoluteAdapterPosition = ${x.g}`)}</div><div class="line">${hl(`bindingAdapterPosition = ${x.local}`)} <span class="muted">// inside ${x.c.name}</span></div>`);
              }
              function toggleFooter() {
                if (busy) return;
                loading = !loading;
                const g = flat.length - (loading ? 0 : 1);
                paint(x => x.c.name === 'FooterAdapter');
                say(o, `${hl(`footer.loading = ${loading}`)} <span class="muted">// footer ${loading ? 'notifyItemInserted(0)' : 'notifyItemRemoved(0)'}: ConcatAdapter reports global position ${g}</span>`);
              }
              function add() {
                if (busy) return;
                if (next >= extra.length) { replay(list, 'shake'); say(o, 'No more articles on the server. Press Reset.'); return; }
                const title = extra[next++]; items = [...items, title];
                paint(x => x.r === title);
                const x = flat.find(f => f.r === title);
                say(o, `${hl('articles.submitList(list + article)')} <span class="muted">// local ${x.local} in ArticleAdapter, global ${x.g}${loading ? ', above the footer' : ''}</span>`);
              }
              function toggleHeader() {
                if (busy) return;
                header = !header;
                paint(x => header && x.c.name === 'HeaderAdapter');
                say(o, `${hl(`header.visible = ${header}`)} <span class="muted">// every global position below moved by one. Local positions did not.</span>`);
              }
              function tapLast() {
                const x = [...flat].reverse().find(f => f.c.name === 'ArticleAdapter');
                if (x) tap(x);
              }
              paint();
              say(o, 'Three adapters, one RecyclerView. Tap a row to see both positions.');
              el.append(
                legend, list,
                h('div', { class: 'controls' }, cmd('articles.submitList(list + article)', add), cmd('footer.loading = !footer.loading', toggleFooter), cmd('header.visible = !header.visible', toggleHeader), act('Tap the last article', tapLast)),
                o);
            },
          },
          {
            title: 'One bad item should not sink the feed',
            body: `<p>A mapper that throws on one malformed item fails the whole response, and the user sees an empty screen. At the edge, decide per item: map what is valid and drop the rest with <code>mapNotNull</code>, logging what you dropped.</p>
<p>Required fields stay non-null in your own model, so the rest of the app never checks them again. That is the adapter's real value: all the doubt about the server's data lives in one function.</p>`,
            code: `@Serializable
data class ArticleDto(
    val id: Long? = null,
    val headline: String? = null,
    @SerialName("published_at") val publishedAtEpoch: Long? = null,
)

fun ArticleDto.toDomainOrNull(): Article? {
    val id = id ?: return null
    val title = headline?.trim()?.takeIf { it.isNotEmpty() } ?: return null
    val published = publishedAtEpoch?.let(Instant::ofEpochSecond) ?: return null
    return Article(id, title, published, image = null)
}

val articles = dtos.mapNotNull { dto ->
    dto.toDomainOrNull().also { if (it == null) Log.w("Feed", "dropped \$dto") }
}`,
          },
        ],
        underHood: {
          body: `<p><code>ListAdapter</code> hands the work to an <code>AsyncListDiffer</code>. On <code>submitList</code> it first checks whether you passed the very same list object. If so, it does nothing. Otherwise it runs <code>DiffUtil.calculateDiff</code> on a background thread, comparing the new list with the one on screen, and posts the result to the main thread.</p>
<p>There the result becomes calls like <code>notifyItemRangeInserted</code> and <code>notifyItemChanged(position, payload)</code>. DiffUtil uses Eugene Myers's difference algorithm, roughly O(N + D²) where D is the number of edits, plus a pass to find moved items. If you submit again before a diff finishes, the older result is thrown away.</p>`,
          code: `// Inside AsyncListDiffer.submitList, roughly
if (newList === current) return                 // same object: nothing to do
val generation = ++maxScheduledGeneration
backgroundExecutor.execute {
    val result = DiffUtil.calculateDiff(callbackFor(current, newList))
    mainThread.execute {
        if (generation == maxScheduledGeneration) {    // a newer submit wins
            current = newList
            result.dispatchUpdatesTo(adapter)          // notifyItemInserted, ...Changed
        }
    }
}`,
        },
        mistakes: [
          {
            title: 'Mutating the list and submitting it again',
            bad: `val items = mutableListOf<Article>()
fun onNew(article: Article) {
    items.add(article)
    adapter.submitList(items)   // same object: ignored
}`,
            good: `var items: List<Article> = emptyList()
fun onNew(article: Article) {
    items = items + article
    adapter.submitList(items)   // new list: diffed
}`,
            why: 'ListAdapter skips a list it already holds. Even with a copy, the adapter has been reading the same list you mutated, so the diff has no old state to compare. Always submit a new list.',
          },
          {
            title: 'Formatting server data in onBindViewHolder',
            bad: `override fun onBindViewHolder(holder: Holder, position: Int) {
    val dto = getItem(position)
    holder.binding.date.text = SimpleDateFormat("d MMM", Locale.getDefault())
        .format(Date(dto.publishedAtEpoch * 1000))
}`,
            good: `// map once, at the edge
data class ArticleRow(val id: Long, val title: String, val dateLabel: String)

override fun onBindViewHolder(holder: Holder, position: Int) {
    holder.binding.date.text = getItem(position).dateLabel
}`,
            why: 'Bind runs every time a row scrolls into view. Building formatters there costs frame time and ties the adapter to the server shape. Map to a ready-to-show model once.',
          },
          {
            title: 'notifyDataSetChanged after every change',
            bad: `fun update(newItems: List<Article>) {
    items = newItems
    notifyDataSetChanged()
}`,
            good: `class ArticleAdapter : ListAdapter<Article, ArticleAdapter.Holder>(Diff) { /* ... */ }

adapter.submitList(newItems)`,
            why: '<code>notifyDataSetChanged</code> says "anything may have changed", so RecyclerView rebinds every visible row and drops all item animations. A diff sends only the real inserts, removes and changes.',
          },
        ],
        visual(el) {
          const pool = [
            { id: 101, headline: ' Rain expected all weekend ', t: 1792310400 },
            { id: 102, headline: 'Ferry times change on Monday', t: 1792224000 },
            { id: 103, headline: 'New park opens downtown', t: 1792137600 },
          ];
          const extra = { id: 104, headline: 'Library extends opening hours', t: 1792396800 };
          let dtos = pool.slice(), mapped = [], bound = [], renamed = false, busy = false;
          const day = t => new Date(t * 1000).toISOString().slice(0, 10);
          const json = h('div', { class: 'kt' });
          const mapper = h('div', { class: 'kt' });
          const domain = h('div', { class: 'pt-col' });
          const phone = h('div', { class: 'phone pt-phone' });
          const o = out('The JSON has arrived. Map it, then hand it to the adapter.');
          const key = () => (renamed ? 'title' : 'headline');
          function paintJson() {
            json.innerHTML = hl(dtos.map(d => `{ "id": ${d.id}, "${key()}": "${d.headline.trim().slice(0, 14)}…", "published_at": ${d.t} }`).join('\n'));
          }
          function paintMapper() { mapper.innerHTML = hl(`fun ArticleDto.toDomain() = Article(\n    id = id,\n    title = ${key()}.trim(),\n    published = Instant.ofEpochSecond(published_at),\n)`); }
          const domainCard = (a, anim) => h('div', { class: 'pt-li' + (anim ? ' drop-in' : '') }, `Article(${a.id})`, h('small', {}, `"${a.title}" · ${day(a.t)}`));
          const row = (a, isNew) => h('div', { class: 'pt-li' + (isNew ? ' pt-new drop-in' : '') }, a.title, h('small', {}, day(a.t)));
          function paintDomain(anim) { domain.replaceChildren(...(mapped.length ? mapped.map(a => domainCard(a, anim)) : [h('span', { class: 'tip' }, 'No Article objects yet')])); }
          function paintPhone(newIds = []) { phone.replaceChildren(...(bound.length ? bound.map(a => row(a, newIds.includes(a.id))) : [h('p', { class: 'pt-empty' }, 'No items')])); }
          async function map() {
            if (busy) return; busy = true;
            replay(mapper, 'pt-flash'); await sleep(350);
            if (!el.isConnected) return;
            mapped = dtos.map(d => ({ id: d.id, title: d.headline.trim(), t: d.t }));
            paintDomain(true);
            say(o, `${hl('dtos.map { it.toDomain() }')} <span class="muted">// trimmed titles, epoch seconds became Instants</span>`);
            busy = false;
          }
          async function submit() {
            if (busy) return; busy = true;
            if (!mapped.length) { replay(phone, 'shake'); say(o, '<span class="bad">type mismatch:</span> the adapter takes List&lt;Article&gt;, not List&lt;ArticleDto&gt;. Map first.'); busy = false; return; }
            const before = new Map(bound.map(a => [a.id, a]));
            const added = mapped.filter(a => !before.has(a.id)).map(a => a.id);
            const changed = mapped.filter(a => before.has(a.id) && before.get(a.id).title !== a.title).length;
            bound = mapped.slice(); paintPhone(added);
            say(o, `DiffUtil: <span class="good">${added.length} inserted</span>, ${changed} changed, ${bound.length - added.length - changed} untouched`);
            await sleep(400); busy = false;
          }
          async function refresh() {
            if (busy) return; busy = true;
            if (dtos.some(d => d.id === extra.id)) { say(o, 'Nothing new on the server. Reset to try again.'); busy = false; return; }
            dtos = [extra, ...dtos]; paintJson(); replay(json, 'pt-flash');
            say(o, 'The server sent one new article. Map it and submit again.');
            busy = false;
          }
          function rename() {
            if (busy) return;
            renamed = !renamed; paintJson(); paintMapper();
            replay(json, 'pt-flash'); replay(mapper, 'pt-flash');
            say(o, `JSON key is now "${key()}". <span class="good">2 places changed:</span> ArticleDto and toDomain(). <span class="muted">// Article, the adapter and the screen are untouched</span>`);
          }
          paintJson(); paintMapper(); paintDomain(false); paintPhone();
          el.append(
            h('div', { class: 'pt-chain' },
              card('ArticleDto (JSON)', json),
              card('mapper', mapper, h('span', { class: 'pt-label' }, 'Article'), domain),
              h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'RecyclerView'), phone)),
            h('div', { class: 'controls' },
              cmd('dtos.map { it.toDomain() }', map),
              cmd('adapter.submitList(articles)', submit),
              act('Server sends a new article', refresh),
              act('API renames a field', rename)),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'decorator',
        title: 'Decorator',
        tagline: 'Wrap an object to add behaviour without changing it.',
        level: 'intermediate',
        body: `
<p>A decorator implements the same interface as the object it wraps. It does a little extra work, such as caching, logging or retrying, and passes the call on to the inner object. Callers can’t tell the difference, so you stack wrappers like layers.</p>
<p>Kotlin makes this short with class delegation. <code>class LoggingRepo(inner: Repo) : Repo by inner</code> forwards every member to <code>inner</code>, and you override only the one you decorate.</p>
<p>OkHttp interceptors are the same idea as a chain: each one can change the request, call <code>chain.proceed()</code> to pass it on, and inspect the response on the way back. Toggle the layers below and call the repository twice.</p>`,
        code: `interface UserRepository { suspend fun user(id: Long): User }

class NetworkUserRepository(private val api: UserApi) : UserRepository {
    override suspend fun user(id: Long) = api.user(id).toDomain()
}

class CachingUserRepository(private val inner: UserRepository) : UserRepository {
    private val cache = ConcurrentHashMap<Long, User>()
    override suspend fun user(id: Long) = cache[id] ?: inner.user(id).also { cache[id] = it }
}

class LoggingUserRepository(private val inner: UserRepository) : UserRepository by inner {
    override suspend fun user(id: Long): User {
        val start = System.nanoTime()
        return inner.user(id).also {
            Log.d("Repo", "user($id) in \${(System.nanoTime() - start) / 1_000_000} ms")
        }
    }
}

val repo: UserRepository =
    LoggingUserRepository(CachingUserRepository(NetworkUserRepository(api)))

// OkHttp: interceptors decorate every call in order
val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor(tokens))
    .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
    .build()`,
        remember: 'Same interface in, same interface out, one extra behaviour per layer.',
        terms: [
          { term: 'Decorator pattern', def: 'A wrapper that implements the same interface as the object it wraps and adds behaviour around its calls.' },
          { term: 'Class delegation', def: 'Kotlin’s by keyword in a class header, which forwards all interface members to another object.' },
          { term: 'Interceptor', def: 'An OkHttp hook that receives the request chain, can modify the request or response, and calls proceed to continue.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the caching decorator.', code: 'class Caching(private val inner: Repo) : [[Repo]] {\n    private val cache = ConcurrentHashMap<Long, User>()\n    override suspend fun user(id: Long) =\n        cache[id] ?: [[inner]].user(id).also { cache[id] = it }\n}', why: 'The decorator implements the same interface and delegates a cache miss to the object it wraps.' },
          { type: 'bug', prompt: 'Requests reach the server without the Authorization header. Tap the line.', code: 'class AuthInterceptor(private val tokens: TokenStore) : Interceptor {\n    override fun intercept(chain: Interceptor.Chain): Response {\n        val request = chain.request().newBuilder()\n            .header("Authorization", "Bearer \${tokens.current()}")\n            .build()\n        return chain.proceed(chain.request())\n    }\n}', bug: 5, fix: '        return chain.proceed(request)', why: 'Requests are immutable. <code>newBuilder().build()</code> makes a new one, and that new request is the one to pass on.' },
        ],
        quiz: [
          { q: 'What must a decorator have in common with the object it wraps?', options: ['The same constructor', 'The same interface', 'The same package'], a: 1, why: 'Callers depend on the interface, so the wrapper can stand in for the original anywhere.' },
          { q: 'In <code>Logging(Caching(Network(api)))</code>, a second call for the same id is a cache hit. Does the log line still print?', options: ['Yes, Logging wraps Caching', 'No, the cache short-circuits everything'], a: 0, why: 'The outer layer sees every call. Only the layers inside the cache are skipped.' },
          { q: 'What does <code>: UserRepository by inner</code> do?', options: ['Inherits from inner’s class', 'Forwards every interface member you don’t override to inner', 'Makes inner lazy'], a: 1, why: 'Class delegation generates the forwarding methods, so you write only the decorated one.' },
        ],
        deeper: [
          {
            title: 'Application and network interceptors sit at different depths',
            body: `<p>OkHttp gives you two places to add a decorator. An <em>application</em> interceptor, added with <code>addInterceptor</code>, wraps the outside of the chain. It runs once per call, even when the response comes from the cache, and it never sees redirects.</p>
<p>A <em>network</em> interceptor, added with <code>addNetworkInterceptor</code>, sits next to the socket. It runs once for every request that really goes out, so twice for a redirect, and not at all for a cache hit. Put auth and app-level logging outside. Put anything that must see the real wire traffic inside.</p>`,
            code: `val client = OkHttpClient.Builder()
    .cache(Cache(context.cacheDir.resolve("http"), 10L * 1024 * 1024))
    .addInterceptor(AuthInterceptor(tokens))            // once per call
    .addNetworkInterceptor(WireLoggingInterceptor())    // once per network request
    .build()`,
            visual(el) {
              const L = [
                { k: 'call', name: 'newCall(request).execute()', sub: 'your code' },
                { k: 'app', name: 'addInterceptor', sub: 'application interceptor' },
                { k: 'retry', name: 'RetryAndFollowUp', sub: 'built in: redirects' },
                { k: 'cache', name: 'CacheInterceptor', sub: 'built in' },
                { k: 'net', name: 'addNetworkInterceptor', sub: 'network interceptor' },
                { k: 'server', name: 'server', sub: 'api.example.com' },
              ];
              const C = {};
              let ran = { app: 0, net: 0 }, cached = false, busy = false;
              L.forEach(x => {
                const note = tag(x.k === 'app' || x.k === 'net' ? 'ran 0×' : 'idle');
                C[x.k] = h('div', { class: 'pt-card' + (x.k === 'app' || x.k === 'net' ? ' pt-d2-ic' : '') }, h('div', { class: 'pt-row' }, h('span', { class: 'pt-title' }, x.name), h('span', { class: 'pt-label' }, x.sub)), note);
                C[x.k].note = note;
              });
              const o = out('');
              const ln = html => o.append(h('div', { class: 'line drop-in', html }));
              async function hit(k, text, kind = 'pt-acc') {
                const c = C[k];
                if (k === 'app' || k === 'net') { ran[k]++; text = `ran ${ran[k]}× · ${text}`; }
                c.classList.add('pt-on'); c.note.textContent = text; c.note.className = `pt-tag ${kind}`; replay(c, 'pt-flash');
                await sleep(300); c.classList.remove('pt-on');
                return el.isConnected;
              }
              function idle() { L.forEach(x => { const c = C[x.k]; c.note.className = 'pt-tag'; c.note.textContent = x.k === 'app' || x.k === 'net' ? `ran ${ran[x.k]}×` : x.k === 'cache' ? (cached ? '1 response stored' : 'empty') : 'idle'; }); }
              async function feed() {
                if (busy) return; busy = true; idle();
                const before = { ...ran };
                say(o, hl('GET /feed'));
                if (!await hit('call', 'waiting')) return;
                if (!await hit('app', 'request out')) return;
                if (!await hit('retry', 'passing on')) return;
                if (cached) {
                  if (!await hit('cache', 'HIT', 'pt-good')) return;
                  ln('<span class="good">served from cache</span> <span class="muted">// nothing below the cache runs</span>');
                } else {
                  if (!await hit('cache', 'miss', 'pt-warn')) return;
                  if (!await hit('net', 'on the wire')) return;
                  if (!await hit('server', '200 OK', 'pt-good')) return;
                  cached = true; C.cache.note.textContent = 'stored'; C.cache.note.className = 'pt-tag pt-good';
                  ln('<span class="good">200 OK</span> from the network, now cached');
                }
                ln(`application interceptor <b>+${ran.app - before.app}</b>, network interceptor <b>+${ran.net - before.net}</b>`);
                busy = false;
              }
              async function moved() {
                if (busy) return; busy = true; idle();
                const before = { ...ran };
                say(o, hl('GET /old-feed  // the server moved it'));
                if (!await hit('call', 'waiting')) return;
                if (!await hit('app', 'request out')) return;
                if (!await hit('retry', 'passing on')) return;
                if (!await hit('cache', 'miss', 'pt-warn')) return;
                if (!await hit('net', '/old-feed')) return;
                if (!await hit('server', '301 → /v2/feed', 'pt-warn')) return;
                if (!await hit('retry', 'follow redirect', 'pt-warn')) return;
                ln('<span class="muted">// RetryAndFollowUp sends a second request</span>');
                if (!await hit('cache', 'miss', 'pt-warn')) return;
                if (!await hit('net', '/v2/feed')) return;
                if (!await hit('server', '200 OK', 'pt-good')) return;
                ln(`application interceptor <b>+${ran.app - before.app}</b>, network interceptor <b>+${ran.net - before.net}</b> <span class="muted">// one call, two requests on the wire</span>`);
                busy = false;
              }
              function clear() {
                if (busy) return;
                cached = false; idle(); replay(C.cache, 'pop');
                say(o, `${hl('client.cache?.evictAll()')} <span class="muted">// the next GET /feed goes to the network</span>`);
              }
              idle();
              say(o, 'Send a few requests. Watch how often each interceptor runs.');
              el.append(
                h('div', { class: 'pt-col' }, L.map(x => C[x.k])),
                h('div', { class: 'controls' }, cmd('GET /feed', feed), cmd('GET /old-feed', moved), cmd('client.cache?.evictAll()', clear)),
                o);
            },
          },
          {
            title: 'A retry decorator for suspend calls',
            body: `<p>Retrying is a classic decorator: same interface, one extra behaviour. Wrap the repository, catch failures that may pass, wait a little longer each time, and give up after a few tries.</p>
<p>Two rules keep it safe. Retry only errors that can go away, like <code>IOException</code>, never a 404 or a bug. And let cancellation through: <code>delay</code> is cancellable, so when the user leaves and the scope is cancelled, the wait ends at once and no further try starts.</p>`,
            code: `class RetryingUserRepository(
    private val inner: UserRepository,
    private val maxAttempts: Int = 3,
) : UserRepository by inner {
    override suspend fun user(id: Long): User {
        var wait = 500L
        repeat(maxAttempts - 1) {
            try {
                return inner.user(id)
            } catch (e: IOException) {      // CancellationException is not an IOException
                delay(wait)
                wait *= 2
            }
        }
        return inner.user(id)               // last try: let the error out
    }
}`,
            visual(el) {
              const SPAN = 2800, K = 0.9;
              let busy = false, t = 0;
              const track = h('div', { class: 'lane-track' });
              const o = out('');
              const ln = html => o.append(h('div', { class: 'line drop-in', html }));
              const bar = (dur, cls) => {
                const b = h('span', { class: `bar ${cls} pt-grow`, style: `left:${(t / SPAN) * 100}%;width:0` });
                track.append(b);
                requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = `${(dur / SPAN) * 100}%`; }));
                t += dur; return b;
              };
              async function attempt(n, fails) {
                const b = bar(300, 'run');
                await sleep(300 * K + 250); if (!el.isConnected) return null;
                if (fails) { b.className = 'bar block'; ln(`try ${n}: <span class="bad">IOException</span> <span class="muted">// timeout</span>`); }
                else ln(`try ${n}: <span class="good">User(42, "Ada")</span>`);
                return !fails;
              }
              async function wait(ms, cut) {
                const d = cut ? ms * 0.4 : ms;
                const b = bar(d, 'wait');
                ln(`${hl(`delay(${ms})`)}`);
                await sleep(d * K + 200); if (!el.isConnected) return false;
                if (cut) { b.className = 'bar block'; return false; }
                return true;
              }
              async function run(kind) {
                if (busy) return; busy = true;
                track.replaceChildren(); t = 0;
                say(o, hl(`repo.user(42)  // ${kind === 'flaky' ? 'network flaky' : kind === 'down' ? 'offline' : 'user leaves'}`));
                const plan = kind === 'flaky' ? [true, true, false] : [true, true, true];
                let waitMs = 500;
                for (let i = 0; i < 3; i++) {
                  const ok = await attempt(i + 1, plan[i]);
                  if (ok == null) return;
                  if (ok) { ln('<span class="good">returned</span> <span class="muted">// the caller never saw the two failures</span>'); busy = false; return; }
                  if (i === 2) { ln('<span class="bad">IOException</span> thrown to the caller <span class="muted">// out of tries: show an error</span>'); busy = false; return; }
                  if (kind === 'leave' && i === 0) {
                    const goOn = await wait(waitMs, true);
                    if (!el.isConnected) return;
                    if (!goOn) { ln('<span class="bad">user pressed Back:</span> viewModelScope cancelled <div class="line muted">// delay threw CancellationException. Not an IOException, so no retry.</div>'); busy = false; return; }
                  }
                  if (!await wait(waitMs, false)) return;
                  waitMs *= 2;
                }
                busy = false;
              }
              say(o, 'Pick a network. Bars show tries, dashed bars show waits.');
              el.append(
                h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'repo.user(42)'), track)),
                h('div', { class: 'controls' }, cmd('repo.user(42)  // network flaky', () => run('flaky')), cmd('repo.user(42)  // offline', () => run('down')), cmd('repo.user(42)  // user leaves', () => run('leave'))),
                o);
            },
          },
          {
            title: 'Delegation is not inheritance',
            body: `<p>With <code>by inner</code>, calls are forwarded <em>to</em> the inner object, and inside it <code>this</code> is the inner object. If <code>NetworkUserRepository.team()</code> calls its own <code>user()</code>, it calls the plain network version. The caching layer never sees those calls.</p>
<p>That keeps layers independent, which is usually what you want. Just don't expect a decorator to change how the inner object talks to itself. If those inner calls need the extra behaviour too, decorate one level lower, for example the <code>UserApi</code>.</p>`,
            code: `class NetworkUserRepository(private val api: UserApi) : UserRepository {
    override suspend fun user(id: Long) = api.user(id).toDomain()
    override suspend fun team(ids: List<Long>) = ids.map { user(it) }   // this.user: no cache
}

class CachingUserRepository(private val inner: UserRepository) : UserRepository by inner {
    private val cache = ConcurrentHashMap<Long, User>()
    override suspend fun user(id: Long) = cache[id] ?: inner.user(id).also { cache[id] = it }
}

val repo = CachingUserRepository(NetworkUserRepository(api))
repo.team(listOf(42, 42))   // two network calls: team() was forwarded, user() inside it was not cached`,
          },
        ],
        underHood: {
          body: `<p>Class delegation is plain generated code. For <code>class LoggingUserRepository(inner: UserRepository) : UserRepository by inner</code>, the compiler keeps <code>inner</code> in a private final field and writes a forwarding method for every interface member you did not override. No reflection and no runtime proxy are involved.</p>
<p>OkHttp's chain is a list of interceptors and an index. <code>chain.proceed(request)</code> makes the next chain with the index plus one and calls that interceptor. After your application interceptors come the built-in ones: retry and follow-ups, the bridge that adds headers like <code>Accept-Encoding</code>, the cache, the connection setup, then your network interceptors, and finally the one that writes to the socket. The response travels back up the same stack.</p>`,
          code: `// What ": UserRepository by inner" generates, roughly
class LoggingUserRepository(inner: UserRepository) : UserRepository {
    private val delegate: UserRepository = inner       // named $$delegate_0 in bytecode
    override suspend fun team(ids: List<Long>) = delegate.team(ids)   // generated
    override suspend fun user(id: Long): User { /* your override */ TODO() }
}`,
        },
        mistakes: [
          {
            title: 'Calling proceed() twice without closing',
            bad: `override fun intercept(chain: Interceptor.Chain): Response {
    val first = chain.proceed(chain.request())
    if (first.code == 401) {
        tokens.refresh()
        return chain.proceed(chain.request().withToken(tokens.current()))
    }
    return first
}`,
            good: `override fun intercept(chain: Interceptor.Chain): Response {
    val first = chain.proceed(chain.request())
    if (first.code == 401) {
        first.close()                      // free the connection first
        tokens.refresh()
        return chain.proceed(chain.request().withToken(tokens.current()))
    }
    return first
}`,
            why: 'OkHttp requires the previous response body to be closed before an interceptor proceeds again. Otherwise the second call fails with an <code>IllegalStateException</code>. For 401s, OkHttp’s <code>Authenticator</code> is the hook built for exactly this.',
          },
          {
            title: 'Extending the class instead of wrapping it',
            bad: `class CachingUserRepository(api: UserApi) : NetworkUserRepository(api) {
    private val cache = ConcurrentHashMap<Long, User>()
    override suspend fun user(id: Long) = cache[id] ?: super.user(id).also { cache[id] = it }
}`,
            good: `class CachingUserRepository(private val inner: UserRepository) : UserRepository by inner {
    private val cache = ConcurrentHashMap<Long, User>()
    override suspend fun user(id: Long) = cache[id] ?: inner.user(id).also { cache[id] = it }
}`,
            why: 'The subclass can only cache the network repository, needs it to be <code>open</code>, and can’t be stacked with other layers in a different order. A wrapper takes any <code>UserRepository</code>, including a fake in tests.',
          },
          {
            title: 'Retrying errors that will never pass',
            bad: `} catch (e: HttpException) {
    delay(wait)        // retries 404 and 401 too
    wait *= 2
}`,
            good: `} catch (e: HttpException) {
    if (e.code() !in 500..599) throw e
    delay(wait)
    wait *= 2
}`,
            why: 'A 404 or 401 fails the same way every time, so retrying only adds delay and server load. Retry server errors and I/O failures, and pass client errors straight up.',
          },
        ],
        visual(el) {
          const users = { 42: 'Ada', 7: 'Linus' };
          const cache = new Map();
          let busy = false;
          const layer = (title, sub) => {
            const c = h('div', { class: 'pt-card' }, h('span', { class: 'pt-title' }, title), h('span', { class: 'pt-label' }, sub));
            c.note = tag('idle'); c.append(c.note);
            return c;
          };
          const L = { vm: layer('ViewModel', 'caller'), log: layer('Logging', 'times each call'), cache: layer('Caching', 'Map<Long, User>'), net: layer('Network', 'GET /users/{id}') };
          const expr = h('div', { class: 'kt' });
          const o = out('Call the repository. Call it again with the same id.');
          const logT = toggle('pt-dec-log', 'Logging', true, () => paint());
          const cacheT = toggle('pt-dec-cache', 'Caching', true, () => { if (!cacheT.input.checked) cache.clear(); paint(); });
          function paint() {
            if (busy) { logT.input.checked = !L.log.classList.contains('pt-dim'); cacheT.input.checked = !L.cache.classList.contains('pt-dim'); return; }
            const lg = logT.input.checked, ch = cacheT.input.checked;
            L.log.classList.toggle('pt-dim', !lg); L.cache.classList.toggle('pt-dim', !ch);
            let e = 'NetworkUserRepository(api)';
            if (ch) e = `CachingUserRepository(${e})`;
            if (lg) e = `LoggingUserRepository(${e})`;
            expr.innerHTML = hl(`val repo: UserRepository =\n    ${e}`); replay(expr, 'pop-soft');
            L.cache.note.textContent = ch ? `${cache.size} cached` : 'off';
          }
          const mark = (c, cls, text, kind = '') => {
            c.classList.remove('pt-on', 'pt-ok', 'pt-bad'); if (cls) c.classList.add(cls);
            c.note.textContent = text; c.note.className = `pt-tag ${kind}`;
          };
          async function call(id) {
            if (busy) return; busy = true;
            const lg = logT.input.checked, ch = cacheT.input.checked;
            const path = [L.vm, lg && L.log, ch && L.cache, L.net].filter(Boolean);
            Object.values(L).forEach(c => { c.classList.remove('pt-on', 'pt-ok', 'pt-bad'); c.note.className = 'pt-tag'; c.note.textContent = c === L.cache && ch ? `${cache.size} cached` : c === L.cache ? 'off' : 'idle'; });
            const t0 = performance.now();
            let stopAt = path.length - 1;
            for (let i = 0; i < path.length; i++) {
              const c = path[i];
              if (c === L.cache && cache.has(id)) { mark(c, 'pt-ok', 'hit', 'pt-good'); replay(c, 'pop'); stopAt = i; break; }
              mark(c, 'pt-on', c === L.net ? 'waiting…' : c === L.cache ? 'miss' : 'passing on', c === L.cache ? 'pt-warn' : 'pt-acc');
              replay(c, 'pt-flash');
              await sleep(c === L.net ? 750 : 320);
              if (!el.isConnected) return;
            }
            if (stopAt === path.length - 1) { mark(L.net, 'pt-ok', '200 OK', 'pt-good'); if (ch) cache.set(id, users[id]); }
            for (let i = stopAt - 1; i >= 0; i--) {
              await sleep(200);
              if (!el.isConnected) return;
              const c = path[i];
              mark(c, 'pt-ok', c === L.cache ? `stored · ${cache.size} cached` : c === L.log ? 'logged' : 'got User', 'pt-good');
            }
            const ms = Math.round(performance.now() - t0);
            const hit = stopAt < path.length - 1;
            say(o, `User(${id}, "${users[id]}") ${hit ? '<span class="good">from cache</span>' : '<span class="muted">from network</span>'}` +
              (lg ? `<div class="line muted">D/Repo: user(${id}) in ${ms} ms</div>` : '<div class="line muted">no logging layer, nothing printed</div>'));
            busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'pt-chain' }, L.vm, L.log, L.cache, L.net),
            expr,
            h('div', { class: 'controls' }, logT, cacheT),
            h('div', { class: 'controls' }, cmd('repo.user(42)', () => call(42)), cmd('repo.user(7)', () => call(7))),
            o);
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'facade',
        title: 'Facade',
        tagline: 'One simple front door to a messy subsystem.',
        level: 'intermediate',
        body: `
<p>A facade gives callers a small, simple API and hides the parts behind it. The callers don’t know which classes exist back there or in what order they run.</p>
<p>On Android the Repository is the usual facade. The ViewModel sees two calls: <code>articles()</code> returns a <code>Flow</code> and <code>refresh()</code> fetches new data. Behind them sit a Retrofit API, a Room DAO, two mappers and the rule that Room is the single source of truth.</p>
<p>Because the UI only reads from Room, going offline changes nothing for it: the cached list stays on screen and <code>refresh()</code> just fails. Turn the network off and refresh below.</p>`,
        code: `class ArticleRepository(
    private val dao: ArticleDao,     // Room
    private val api: NewsApi,        // Retrofit
) {
    // The UI reads only from Room
    fun articles(): Flow<List<Article>> =
        dao.observeAll().map { rows -> rows.map { it.toDomain() } }

    // Network writes into Room; Room's Flow then emits the new list
    suspend fun refresh() {
        val fresh = api.latest()
        dao.upsertAll(fresh.map { it.toEntity() })
    }
}

class FeedViewModel(private val repo: ArticleRepository) : ViewModel() {
    val feed: StateFlow<List<Article>> = repo.articles()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun onPullToRefresh() = viewModelScope.launch {
        try { repo.refresh() } catch (e: IOException) { /* show "offline" */ }
    }
}`,
        remember: 'The ViewModel asks the Repository. Only the Repository knows Room and Retrofit exist.',
        terms: [
          { term: 'Facade pattern', def: 'A class that offers a simple interface to a group of more complex classes and hides how they work together.' },
          { term: 'Leaky abstraction', def: 'An abstraction that forces callers to know details it was meant to hide, such as exposing a DAO from a repository.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The ViewModel should talk only to the facade.', code: 'class ArticleRepository(private val dao: ArticleDao, private val api: NewsApi) {\n    fun articles(): Flow<List<Article>> = TODO()\n    suspend fun refresh(): Unit = TODO()\n}\n\nclass FeedViewModel(private val repo: [[ArticleRepository]]) : ViewModel() {\n    val feed = repo.[[articles]]()\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())\n    fun onRefresh() = viewModelScope.launch { repo.[[refresh]]() }\n}', why: 'The ViewModel depends on one class with two calls. It never sees the DAO or the API.' },
          { type: 'bug', prompt: 'The feed is empty offline even though Room has yesterday’s articles. Tap the line.', code: 'class ArticleRepository(private val dao: ArticleDao, private val api: NewsApi) {\n    fun articles(): Flow<List<Article>> = flow { emit(api.latest().map { it.toDomain() }) }\n\n    suspend fun refresh() {\n        dao.upsertAll(api.latest().map { it.toEntity() })\n    }\n}', bug: 1, fix: '    fun articles(): Flow<List<Article>> = dao.observeAll().map { rows -> rows.map { it.toDomain() } }', why: 'The UI stream reads the network, so it fails offline and never shows what Room stored. Read from Room and let <code>refresh()</code> fill it.' },
        ],
        quiz: [
          { q: 'Which classes should <code>FeedViewModel</code> know about?', options: ['ArticleDao and NewsApi', 'ArticleRepository only', 'All three'], a: 1, why: 'The repository is the facade. Everything behind it can change without touching the ViewModel.' },
          { q: 'The network is down and the user pulls to refresh. With Room as the source of truth, what does the screen show?', options: ['An empty list', 'The last cached articles plus an offline message', 'A crash'], a: 1, why: 'The UI stream comes from Room, which still has data. Only the refresh call fails.' },
        ],
        deeper: [
          {
            title: 'The facade decides when to call the network',
            body: `<p>Callers should not decide when data is stale. Put that rule behind the facade. <code>articles()</code> still reads Room, and when someone starts collecting, it also checks how old the cache is. Fresh enough: no network call. Too old: refresh in the background while the old list stays on screen.</p>
<p>This is often called stale-while-revalidate. The ViewModel's code does not change at all. Only the repository knows the 15-minute rule, so you can tune it in one place.</p>`,
            code: `fun articles(): Flow<List<Article>> = channelFlow {
    launch {
        if (isStale()) {
            try { refresh() } catch (e: IOException) { /* keep showing the cache */ }
        }
    }
    dao.observeAll()
        .map { rows -> rows.map { it.toDomain() } }
        .collect { send(it) }          // cached rows go out at once
}

private suspend fun isStale() =
    clock.millis() - syncPrefs.lastSyncMillis() > 15.minutes.inWholeMilliseconds`,
            visual(el) {
              const fresh = ['Bridge reopens after repairs', 'Tram line extended north', 'Market moves to Saturdays', 'City marathon route set'];
              let room = ['Rain expected all weekend', 'New park opens downtown'], age = 3, n = 0, busy = false;
              const phone = h('div', { class: 'phone pt-phone' });
              const ageTag = tag('');
              const steps = h('div', { class: 'pt-steps' });
              const o = out('');
              const ln = html => o.append(h('div', { class: 'line drop-in', html }));
              const paintAge = () => { ageTag.textContent = `last sync ${age} min ago`; ageTag.className = 'pt-tag ' + (age > 15 ? 'pt-warn' : 'pt-good'); };
              const paintPhone = added => phone.replaceChildren(...room.map(t => h('div', { class: 'pt-li' + (added && added.includes(t) ? ' pt-new drop-in' : '') }, t)));
              async function step(label, ms = 420, cls = 'pt-done') {
                const s = h('div', { class: 'pt-step pt-now drop-in' }, label);
                steps.append(s);
                await sleep(ms);
                s.classList.remove('pt-now'); s.classList.add(cls);
                return el.isConnected;
              }
              async function collect() {
                if (busy) return; busy = true;
                steps.replaceChildren(); phone.replaceChildren(h('p', { class: 'pt-empty' }, 'loading…'));
                say(o, hl('repo.articles().collect { show(it) }'));
                if (!await step('dao.observeAll(): emit cached rows')) return;
                paintPhone(room.slice()); ln(`<span class="good">on screen at once:</span> ${room.length} cached articles`);
                const stale = age > 15;
                if (!await step(`isStale()? last sync ${age} min ago`, 420, stale ? 'pt-fail' : 'pt-done')) return;
                if (!stale) { ln('<span class="muted">// fresh enough: no network call at all</span>'); busy = false; return; }
                if (!await step('launch { refresh() }: in parallel', 300)) return;
                if (!await step('api.latest() → dao.upsertAll()', 750)) return;
                const added = [fresh[n++ % fresh.length]];
                room = [...added, ...room].slice(0, 5); age = 0; paintAge(); replay(ageTag, 'pop');
                if (!await step('Room emits again')) return;
                paintPhone(added);
                ln('<span class="good">updated:</span> Room emitted the new row. The ViewModel did nothing new.');
                busy = false;
              }
              function pass() {
                if (busy) return;
                age += 20; paintAge(); replay(ageTag, 'pop');
                say(o, `<span class="muted">// time passes. The cache is now ${age} minutes old.</span>`);
              }
              paintAge(); paintPhone();
              say(o, 'The cache was synced 3 minutes ago. Start collecting, then let time pass and collect again.');
              el.append(
                h('div', { class: 'pt-split' }, phone, h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'inside ArticleRepository'), ageTag, steps)),
                h('div', { class: 'controls' }, cmd('repo.articles()  // screen starts collecting', collect), act('20 minutes pass', pass)),
                o);
            },
          },
          {
            title: 'Errors leave the facade as your own types',
            body: `<p>If <code>refresh()</code> lets <code>HttpException</code> or <code>SerializationException</code> escape, the ViewModel must import Retrofit and kotlinx.serialization to handle them. The facade leaks, and any exception the ViewModel forgot crashes the app.</p>
<p>Translate at the boundary instead. The repository catches what its parts throw and returns a small sealed type the app owns. The ViewModel turns that into a message, and you could swap Retrofit for Ktor without touching it.</p>`,
            code: `sealed interface RefreshResult {
    data object Ok : RefreshResult
    data object Offline : RefreshResult
    data object SignedOut : RefreshResult
    data object BadData : RefreshResult
    data class ServerError(val code: Int) : RefreshResult
}

suspend fun refresh(): RefreshResult = try {
    dao.upsertAll(api.latest().map { it.toEntity() })
    RefreshResult.Ok
} catch (e: IOException) {
    RefreshResult.Offline
} catch (e: HttpException) {
    if (e.code() == 401) RefreshResult.SignedOut else RefreshResult.ServerError(e.code())
} catch (e: SerializationException) {
    RefreshResult.BadData
}`,
            visual(el) {
              const CASES = [
                { label: 'server answers 200', thrown: null, result: 'RefreshResult.Ok', ui: 'Updated just now', io: true },
                { label: 'no network', thrown: 'UnknownHostException', result: 'RefreshResult.Offline', ui: 'You are offline. Showing saved stories.', io: true },
                { label: 'token expired: 401', thrown: 'HttpException: HTTP 401', result: 'RefreshResult.SignedOut', ui: 'Please sign in again.' },
                { label: 'server down: 503', thrown: 'HttpException: HTTP 503', result: 'RefreshResult.ServerError(503)', ui: 'Server trouble. Try again soon.' },
                { label: 'broken JSON', thrown: 'SerializationException', result: 'RefreshResult.BadData', ui: 'Something went wrong on our side.' },
              ];
              let mapped = true, busy = false;
              const mk = title => { const v = h('div', { class: 'pt-d2-val' }, '-'); return { v, c: card(title, v) }; };
              const inside = mk('inside the repository'), across = mk('crosses the facade'), ui = mk('FeedViewModel shows');
              const o = out('');
              const set = (x, text, cls) => { x.v.textContent = text; x.c.className = 'pt-card ' + (cls || ''); replay(x.c, 'pt-flash'); };
              async function run(cs) {
                if (busy) return; busy = true;
                [inside, across, ui].forEach(x => set(x, '…', ''));
                say(o, `${hl('repo.refresh()')} <span class="muted">// ${cs.label}</span>`);
                await sleep(350); if (!el.isConnected) return;
                set(inside, cs.thrown ? `throws ${cs.thrown}` : 'rows saved', cs.thrown ? 'pt-bad' : 'pt-ok');
                await sleep(450); if (!el.isConnected) return;
                if (mapped) {
                  set(across, cs.result, cs.thrown ? 'pt-on' : 'pt-ok');
                  await sleep(450); if (!el.isConnected) return;
                  set(ui, cs.ui, cs.thrown ? 'pt-on' : 'pt-ok');
                  o.append(h('div', { class: 'line drop-in', html: `<span class="good">handled</span> <span class="muted">// the ViewModel only knows RefreshResult</span>` }));
                } else if (!cs.thrown || cs.io) {
                  set(across, cs.thrown ? `${cs.thrown} (an IOException)` : 'Unit', cs.thrown ? 'pt-on' : 'pt-ok');
                  await sleep(450); if (!el.isConnected) return;
                  set(ui, cs.ui, cs.thrown ? 'pt-on' : 'pt-ok');
                  o.append(h('div', { class: 'line drop-in', html: `<span class="muted">// caught by the ViewModel's catch (e: IOException)</span>` }));
                } else {
                  set(across, cs.thrown, 'pt-bad');
                  await sleep(450); if (!el.isConnected) return;
                  set(ui, 'app crashed', 'pt-bad'); replay(ui.c, 'shake');
                  o.append(h('div', { class: 'line drop-in', html: `<span class="bad">uncaught ${cs.thrown.split(':')[0]}</span> in viewModelScope <span class="muted">// the ViewModel only caught IOException</span>` }));
                }
                busy = false;
              }
              const t = toggle('pt-d2-fac-map', 'repository returns RefreshResult', true, () => {
                if (busy) { t.input.checked = mapped; return; }
                mapped = t.input.checked;
                [inside, across, ui].forEach(x => set(x, '-', ''));
                say(o, mapped ? 'The facade translates every failure.' : 'Raw exceptions now cross the facade. The ViewModel catches only IOException.');
              });
              say(o, 'Pick what happens on the server.');
              el.append(
                h('div', { class: 'pt-chain' }, inside.c, across.c, ui.c),
                h('div', { class: 'controls' }, t),
                h('div', { class: 'controls' }, CASES.map(cs => act(cs.label, () => run(cs)))),
                o);
            },
          },
          {
            title: 'When one facade is not enough',
            body: `<p>A repository per kind of data keeps each facade small. When a screen needs several of them combined, don't grow one repository into a class that knows everything. Add a use case: a small class in the domain layer that combines repositories for one job, often with a single <code>operator fun invoke</code>.</p>
<p>The domain layer is optional. Add use cases when the same logic is needed by several ViewModels, or when a ViewModel gets crowded. Don't add them by default.</p>`,
            code: `class GetFeedWithAuthorsUseCase(
    private val articles: ArticleRepository,
    private val authors: AuthorRepository,
) {
    operator fun invoke(): Flow<List<ArticleWithAuthor>> =
        combine(articles.articles(), authors.authors()) { list, people ->
            val byId = people.associateBy { it.id }
            list.map { ArticleWithAuthor(it, byId[it.authorId]) }
        }
}

// FeedViewModel
val feed = getFeedWithAuthors()
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())`,
          },
        ],
        underHood: {
          body: `<p>Calling <code>repo.articles()</code> does no work. It returns a cold <code>Flow</code>: a recipe. Each <code>collect</code> runs the recipe again from the start, so two collectors mean two Room observers, two queries after every write and two rounds of mapping.</p>
<p>That is why the ViewModel ends the chain with <code>stateIn</code>. It collects the upstream once in <code>viewModelScope</code> and shares the latest value with every UI collector. The facade stays cheap to call, and the decision to share sits in the class that knows how the screen uses the data.</p>`,
          code: `val a = repo.articles()   // nothing runs yet
val b = repo.articles()   // still nothing

launch { a.collect { } }  // Room observer #1: query, map
launch { b.collect { } }  // Room observer #2: query, map again

// One upstream, any number of collectors
val feed = repo.articles()
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())`,
        },
        mistakes: [
          {
            title: 'Exposing the parts behind the facade',
            bad: `class ArticleRepository(val dao: ArticleDao, val api: NewsApi) { /* ... */ }

// FeedViewModel
val rows = repo.dao.observeAll()`,
            good: `class ArticleRepository(
    private val dao: ArticleDao,
    private val api: NewsApi,
) { /* ... */ }`,
            why: 'Public constructor properties hand the DAO and the API to every caller. Once a ViewModel uses them, you can’t change storage without changing the UI.',
          },
          {
            title: 'A one-shot read for data that changes',
            bad: `suspend fun articles(): List<Article> =
    dao.getAll().map { it.toDomain() }`,
            good: `fun articles(): Flow<List<Article>> =
    dao.observeAll().map { rows -> rows.map { it.toDomain() } }`,
            why: 'The screen reads once and never hears about rows that <code>refresh()</code> writes later. A Flow from Room delivers every write to the UI.',
          },
          {
            title: 'Launching work on a scope made up on the spot',
            bad: `fun refresh() {
    CoroutineScope(Dispatchers.IO).launch {
        dao.upsertAll(api.latest().map { it.toEntity() })
    }
}`,
            good: `suspend fun refresh() {
    dao.upsertAll(api.latest().map { it.toEntity() })
}`,
            why: 'Nobody cancels that scope, and the caller can’t wait for the result or see the error. Make it <code>suspend</code> and let the caller’s scope own the work. Use an injected application scope only for work that must outlive the screen.',
          },
        ],
        visual(el) {
          const fresh = ['Bridge reopens after repairs', 'Tram line extended north', 'Market moves to Saturdays', 'City marathon route announced'];
          let room = ['Rain expected all weekend', 'New park opens downtown'], online = true, busy = false, next = 0;
          const phone = h('div', { class: 'phone pt-phone' });
          const roomTag = tag(''), netTag = tag('');
          const roomC = card('Room · ArticleDao', roomTag), netC = card('Retrofit · NewsApi', netTag), mapC = card('Mappers', tag('Dto → Entity → Article'));
          const steps = h('div', { class: 'pt-steps' });
          const o = out('The screen is collecting repo.articles(). Refresh it.');
          const paint = newOnes => {
            roomTag.textContent = `${room.length} rows`;
            netTag.textContent = online ? 'online' : 'offline'; netTag.className = `pt-tag ${online ? 'pt-good' : 'pt-warn'}`;
            phone.replaceChildren(...room.map(t => h('div', { class: 'pt-li' + (newOnes && newOnes.includes(t) ? ' pt-new drop-in' : '') }, t)));
          };
          async function run(list) {
            steps.replaceChildren(...list.map(s => h('div', { class: 'pt-step' }, s.label)));
            const els = [...steps.children];
            for (let i = 0; i < list.length; i++) {
              els[i].classList.add('pt-now'); if (list[i].card) { list[i].card.classList.add('pt-on'); replay(list[i].card, 'pt-flash'); }
              await sleep(480);
              if (!el.isConnected) return false;
              els[i].classList.remove('pt-now');
              if (list[i].card) list[i].card.classList.remove('pt-on');
              const ok = list[i].run ? list[i].run() : true;
              if (!ok) { els[i].classList.add('pt-fail'); els.slice(i + 1).forEach(x => { x.style.opacity = 0.35; }); return false; }
              els[i].classList.add('pt-done');
            }
            return true;
          }
          async function refresh() {
            if (busy) return; busy = true;
            let added = [];
            const ok = await run([
              { label: 'api.latest()', card: netC, run: () => online },
              { label: 'map ArticleDto → ArticleEntity', card: mapC },
              { label: 'dao.upsertAll(entities)', card: roomC, run: () => { added = [fresh[next % fresh.length]]; next++; room = [...added, ...room].slice(0, 5); return true; } },
              { label: 'Room Flow emits → map to Article', card: mapC },
            ]);
            if (!el.isConnected) return;
            if (ok) { paint(added); say(o, `${hl('repo.refresh()')} <span class="good">done</span> <span class="muted">// the screen updated because Room emitted, not because refresh returned data</span>`); }
            else { replay(netC, 'shake'); say(o, `${hl('repo.refresh()')} <span class="bad">IOException:</span> Unable to resolve host <span class="muted">// the cached ${room.length} articles stay on screen</span>`); }
            busy = false;
          }
          async function observe() {
            if (busy) return; busy = true;
            phone.replaceChildren();
            await run([
              { label: 'dao.observeAll()', card: roomC },
              { label: 'map ArticleEntity → Article', card: mapC },
              { label: 'emit to the ViewModel', run: () => { paint(room); return true; } },
            ]);
            if (!el.isConnected) return;
            say(o, `${hl('repo.articles()')} <span class="good">${room.length} articles from Room</span> <span class="muted">// no network needed${online ? '' : ', works offline'}</span>`);
            busy = false;
          }
          const net = toggle('pt-fac-net', 'Network on', true, () => {
            if (busy) { net.input.checked = online; return; }
            online = net.input.checked; paint(); replay(netC, 'pop');
            say(o, online ? 'Back online.' : 'Offline. The ViewModel’s code does not change.');
          });
          paint();
          el.append(
            h('div', { class: 'pt-split' },
              h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'FeedViewModel sees'),
                h('div', { class: 'controls' }, cmd('repo.articles()', observe), cmd('repo.refresh()', refresh)), phone),
              h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'ArticleRepository hides'), steps, h('div', { class: 'pt-chain' }, netC, mapC, roomC))),
            h('div', { class: 'controls' }, net),
            o);
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'state-machine',
        title: 'State machine',
        tagline: 'A fixed set of states and the only moves between them.',
        level: 'advanced',
        body: `
<p>A screen is always in exactly one state: idle, loading, showing data, or showing an error. Model that with a <code>sealed interface UiState</code>. Separate booleans like <code>isLoading</code> and <code>error</code> allow combinations that make no sense, like loading and failed at once.</p>
<p>Inputs become events. A pure function <code>reduce(state, event)</code> returns the next state. It is a state machine: it lists which events each state accepts, and every other event leaves the state as it is. A late <code>Loaded</code> that arrives after the user went back to Idle simply does nothing.</p>
<p>The ViewModel holds one <code>MutableStateFlow&lt;UiState&gt;</code> and applies the reducer with <code>update</code>. The reducer has no Android in it, so plain unit tests cover every transition. Send events below, including ones the current state does not accept.</p>`,
        code: `sealed interface UiState {
    data object Idle : UiState
    data object Loading : UiState
    data class Success(val items: List<Article>) : UiState
    data class Error(val message: String) : UiState
}

sealed interface FeedEvent {
    data object Load : FeedEvent
    data class Loaded(val items: List<Article>) : FeedEvent
    data class Failed(val message: String) : FeedEvent
    data object Retry : FeedEvent
}

fun reduce(state: UiState, event: FeedEvent): UiState = when (state) {
    UiState.Idle -> if (event is FeedEvent.Load) UiState.Loading else state
    UiState.Loading -> when (event) {
        is FeedEvent.Loaded -> UiState.Success(event.items)
        is FeedEvent.Failed -> UiState.Error(event.message)
        else -> state
    }
    is UiState.Success -> if (event is FeedEvent.Load) UiState.Loading else state
    is UiState.Error -> if (event is FeedEvent.Retry) UiState.Loading else state
}

class FeedViewModel : ViewModel() {
    private val _state = MutableStateFlow<UiState>(UiState.Idle)
    val state: StateFlow<UiState> = _state.asStateFlow()
    fun send(event: FeedEvent) = _state.update { reduce(it, event) }
}`,
        remember: 'One sealed state, one reducer. Anything the reducer doesn’t allow can’t happen.',
        terms: [
          { term: 'State machine', def: 'A model with a fixed set of states and rules saying which input moves which state to which next state.' },
          { term: 'Reducer', def: 'A pure function that takes the current state and an event and returns the next state.' },
          { term: 'Transition', def: 'One allowed move from one state to another, triggered by a specific event.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the closed set of states and apply the reducer atomically.', code: 'sealed [[interface|class]] UiState {\n    data object Loading : UiState\n    data class Success(val items: List<Article>) : UiState\n}\n\nfun send(event: FeedEvent) = _state.[[update]] { reduce(it, event) }', why: 'A sealed type lets <code>when</code> check every state. <code>update</code> reads and writes the flow atomically, so two quick events can’t overwrite each other.' },
          { type: 'bug', prompt: 'This reducer won’t compile. Tap the wrong line.', code: 'fun reduce(state: UiState, event: FeedEvent): UiState = when (state) {\n    UiState.Idle -> if (event is FeedEvent.Load) UiState.Loading else state\n    UiState.Loading -> when (event) {\n        is FeedEvent.Loaded -> UiState.Success(event.items)\n        is FeedEvent.Failed -> UiState.Error(event.message)\n        else -> state\n    }\n    UiState.Success -> if (event is FeedEvent.Load) UiState.Loading else state\n    is UiState.Error -> if (event is FeedEvent.Retry) UiState.Loading else state\n}', bug: 7, fix: '    is UiState.Success -> if (event is FeedEvent.Load) UiState.Loading else state', why: '<code>Success</code> is a data class with many instances, so it needs a type check with <code>is</code>. Only <code>data object</code> states can be matched by value.' },
        ],
        quiz: [
          { q: 'Why a sealed <code>UiState</code> instead of <code>isLoading</code>, <code>items</code> and <code>error</code> fields?', options: ['It uses less memory', 'Impossible combinations can’t be represented', 'StateFlow requires sealed types'], a: 1, why: 'Three independent fields allow states like loading with an error. A sealed type allows exactly one state at a time.' },
          { q: 'The state is <code>Idle</code> and a late <code>Loaded</code> event arrives. What does the reducer return?', options: ['Success', 'Idle, unchanged', 'It throws'], a: 1, why: 'Idle accepts only Load. Every other event falls through to <code>else state</code>.' },
          { q: 'Why is a pure reducer easy to test?', options: ['It needs an emulator', 'Same input always gives the same output, with no Android types', 'Hilt generates its tests'], a: 1, why: 'You call <code>reduce(state, event)</code> and assert on the result. No dispatcher, no lifecycle.' },
        ],
        deeper: [
          {
            title: 'Side effects run on transitions',
            body: `<p>The reducer stays pure: it never starts a network call. Instead, the ViewModel compares the state before and after an event. When the state <em>enters</em> <code>Loading</code>, it launches the request. When the request ends, the result comes back in as another event.</p>
<p>A nice result: a second <code>Load</code> while already loading is ignored by the reducer, so no second request starts. Tap <code>send(Load)</code> several times quickly.</p>`,
            code: `fun send(event: FeedEvent) {
    var entered: UiState? = null
    _state.update { old -> reduce(old, event).also { new -> entered = new.takeIf { new != old } } }
    if (entered == UiState.Loading) fetch()      // effect only on a real transition
}

private fun fetch() = viewModelScope.launch {
    val event = try {
        FeedEvent.Loaded(repo.latest())
    } catch (e: IOException) {
        FeedEvent.Failed("No connection")
    }
    send(event)
}`,
            visual(el) {
              const T = { Idle: { Load: 'Loading' }, Loading: { Loaded: 'Success', Failed: 'Error' }, Success: { Load: 'Loading' }, Error: { Retry: 'Loading' } };
              let state = 'Idle', fail = false, reqs = 0;
              const stateEl = h('div', { class: 'pt-slot' }, h('span', { class: 'chip' }, 'Idle'));
              const log = h('div', { class: 'pt-steps' });
              const count = tag('requests started: 0');
              const o = out('');
              const ft = toggle('pt-sm-fail', 'network fails', false, () => { fail = ft.input.checked; });
              const logLine = (text, cls = '') => { log.prepend(h('div', { class: `pt-step drop-in ${cls}`, html: text })); while (log.children.length > 5) log.lastElementChild.remove(); };
              function send(e) {
                const to = T[state][e];
                if (!to) { logLine(`${hl(`reduce(${state}, ${e})`)} = ${hl(state)}  <span class="muted">ignored</span>`); replay(stateEl, 'shake'); say(o, `${state} does not accept ${e}. <span class="muted">No new request.</span>`); return; }
                const from = state; state = to; swap(stateEl, to);
                logLine(`${hl(`reduce(${from}, ${e})`)} = ${hl(to)}`, 'pt-done');
                if (to === 'Loading') {
                  reqs++; count.textContent = `requests started: ${reqs}`; replay(count, 'pop');
                  logLine('effect: launch fetch()  GET /feed', 'pt-now');
                  say(o, `<span class="good">entered Loading</span>, so the ViewModel started one request.`);
                  setTimeout(() => { if (el.isConnected && state === 'Loading') send(fail ? 'Failed' : 'Loaded'); }, 1400);
                } else say(o, `${hl(to)} <span class="muted">${to === 'Error' ? 'Retry is the only way out.' : 'Load to refresh.'}</span>`);
              }
              say(o, 'Send Load, then tap it again while loading.');
              el.append(
                h('div', { class: 'pt-split' },
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'state'), stateEl, count),
                  h('div', { class: 'pt-col' }, h('span', { class: 'pt-label' }, 'reducer and effects'), log)),
                h('div', { class: 'controls' }, ft, cmd('send(Load)', () => send('Load')), cmd('send(Retry)', () => send('Retry'))),
                o);
            },
          },
          {
            title: 'Two events at once: why update',
            body: `<p>Events can arrive from different coroutines at nearly the same time: a network result on one, a tap on another. With <code>_state.value = reduce(_state.value, e)</code>, both read the same old state, and the second write erases the first.</p>
<p><code>update { }</code> reads, computes and then writes only if the state is still the one it read. If another write got there first, it runs the reducer again on the newer state. Neither event is lost.</p>`,
            visual(el) {
              let atomic = false, busy = false;
              const lanes = ['Loaded(items)', 'Bookmark(7)'].map(n => ({ name: n, steps: h('div', { class: 'pt-row' }) }));
              const result = h('div', { class: 'pt-card' }, h('span', { class: 'pt-title' }, 'final state'), h('span', { class: 'pt-label' }, '-'));
              const o = out('');
              const t = toggle('pt-sm-atomic', 'use _state.update { }', false, () => { if (busy) { t.input.checked = atomic; return; } atomic = t.input.checked; clear(); say(o, atomic ? 'update {}: compare-and-set, retry on conflict.' : 'value = reduce(value, e): read, then blind write.'); });
              function clear() { lanes.forEach(l => l.steps.replaceChildren()); result.className = 'pt-card'; result.lastChild.textContent = '-'; }
              const add = (l, text, kind = '') => { const s = tag(text, `${kind} drop-in`); l.steps.append(s); return s; };
              async function run() {
                if (busy) return; busy = true; clear();
                const [a, b] = lanes;
                const st = async ms => { await sleep(ms); return el.isConnected; };
                add(a, 'read v1 {items: [], marks: []}'); add(b, 'read v1 {items: [], marks: []}');
                if (!await st(600)) return;
                add(a, 'reduce → items: 3'); add(b, 'reduce → marks: [7]');
                if (!await st(600)) return;
                add(a, 'write v2', 'pt-good');
                if (!await st(500)) return;
                if (!atomic) {
                  add(b, 'write v2′ (overwrites)', 'pt-warn');
                  result.className = 'pt-card pt-bad'; result.lastChild.textContent = '{ items: [], marks: [7] }'; replay(result, 'shake');
                  say(o, '<span class="bad">lost update:</span> Bookmark was computed from v1, so its write threw away the three loaded items.');
                } else {
                  add(b, 'CAS fails: state is v2', 'pt-warn');
                  if (!await st(500)) return;
                  add(b, 'read v2, reduce again', 'pt-acc');
                  if (!await st(500)) return;
                  add(b, 'write v3', 'pt-good');
                  result.className = 'pt-card pt-ok'; result.lastChild.textContent = '{ items: 3, marks: [7] }'; replay(result, 'pop');
                  say(o, '<span class="good">both kept:</span> the second reducer ran twice, the second time on the newer state.');
                }
                busy = false;
              }
              say(o, 'Two events reach the ViewModel at the same moment.');
              el.append(
                h('div', { class: 'pt-col' }, lanes.map(l => h('div', { class: 'pt-card' }, h('span', { class: 'pt-title' }, `send(${l.name})`), l.steps))),
                result,
                h('div', { class: 'controls' }, t, h('button', { class: 'btn primary small', onclick: run }, 'Send both')),
                o);
            },
          },
          {
            title: 'Surviving process death',
            body: `<p>The state machine lives in the ViewModel, which dies with the process. Save only the inputs you need to rebuild it in <code>SavedStateHandle</code>, such as the selected tab or a search query. Don't save <code>Loading</code> or big lists: reload them.</p>
<p>When the new process starts, read the saved input and send the event that gets the machine moving again.</p>`,
            code: `class SearchViewModel(
    private val saved: SavedStateHandle,
    private val repo: SearchRepository,
) : ViewModel() {
    private val _state = MutableStateFlow<UiState>(UiState.Idle)
    val state = _state.asStateFlow()

    init {
        saved.get<String>("query")?.let { send(SearchEvent.Submit(it)) }   // restart after death
    }

    fun send(event: SearchEvent) {
        if (event is SearchEvent.Submit) saved["query"] = event.query
        _state.update { reduce(it, event) }
    }
}`,
          },
        ],
        underHood: {
          body: `<p><code>update</code> is a short loop in kotlinx.coroutines. It reads the value, calls your function, and tries <code>compareAndSet</code>. If another coroutine changed the value in between, the set fails and the loop runs your function again on the new value.</p>
<p>So the reducer may run more than once for one event. That is safe only because it is pure. A <code>when</code> over a sealed type compiles to a chain of <code>instanceof</code> checks, and <code>data object</code> branches compare with <code>equals</code>.</p>`,
          code: `// kotlinx.coroutines
public inline fun <T> MutableStateFlow<T>.update(function: (T) -> T) {
    while (true) {
        val prevValue = value
        val nextValue = function(prevValue)
        if (compareAndSet(prevValue, nextValue)) {
            return
        }
    }
}`,
        },
        mistakes: [
          { title: 'Side effects inside update', bad: '_state.update {\n    analytics.log("load")      // may run twice\n    reduce(it, FeedEvent.Load)\n}', good: '_state.update { reduce(it, FeedEvent.Load) }\nanalytics.log("load")', why: 'Under contention <code>update</code> calls its lambda again. Anything with a side effect inside it can happen twice. Keep the lambda pure.' },
          { title: 'Starting work for an event the machine ignored', bad: 'fun send(event: FeedEvent) {\n    _state.update { reduce(it, event) }\n    if (event is FeedEvent.Load) fetch()   // even while already Loading\n}', good: 'fun send(event: FeedEvent) {\n    var started = false\n    _state.update { old ->\n        reduce(old, event).also { started = it is UiState.Loading && old !is UiState.Loading }\n    }\n    if (started) fetch()\n}', why: 'The reducer refused the second <code>Load</code>, but the ViewModel fired a second request anyway. Trigger effects from the transition, not from the event.' },
        ],
        visual(el) {
          const T = { Idle: { Load: 'Loading' }, Loading: { Loaded: 'Success', Failed: 'Error' }, Success: { Load: 'Loading' }, Error: { Retry: 'Loading' } };
          const order = ['Idle', 'Loading', 'Success', 'Error'];
          const events = ['Load', 'Loaded', 'Failed', 'Retry'];
          let state = 'Idle', busy = false, trail = ['Idle'];
          const nodes = Object.fromEntries(order.map(s => [s, h('div', { class: 'pt-state' }, s, h('small', {}, Object.entries(T[s]).map(([e, to]) => `${e} → ${to}`).join(', ')))]));
          const src = {
            Idle: 'UiState.Idle -> if (event is Load) Loading\n        else state',
            Loading: 'UiState.Loading -> when (event) {\n        is Loaded -> Success(..)\n        is Failed -> Error(..)\n        else -> state }',
            Success: 'is UiState.Success -> if (event is Load) Loading\n        else state',
            Error: 'is UiState.Error -> if (event is Retry) Loading\n        else state',
          };
          const branches = Object.fromEntries(order.map(s => [s, h('div', { class: 'branch', html: '    ' + hl(src[s]) })]));
          const reducer = h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('when (state) {') }), order.map(s => branches[s]), h('div', { class: 'branch head' }, '}'));
          const phone = h('div', { class: 'phone' });
          const path = h('div', { class: 'pt-row' });
          const o = out('The screen is Idle. Send an event.');
          const btns = events.map(e => cmd(`send(${e})`, () => send(e)));
          function paint() {
            order.forEach(s => {
              nodes[s].classList.toggle('pt-on', s === state);
              nodes[s].classList.toggle('pt-next', Object.values(T[state]).includes(s) && s !== state);
            });
            btns.forEach((b, i) => { const ok = !!T[state][events[i]]; b.setAttribute('aria-pressed', ok); b.classList.toggle('pt-off', !ok); });
            const ui = {
              Idle: [h('p', { class: 'phone-note' }, 'Pull to load the feed')],
              Loading: [h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')],
              Success: ['Rain all weekend', 'Ferry times change', 'New park opens'].map(t => h('div', { class: 'item' }, t)),
              Error: [h('div', { class: 'err-icon' }, '!'), h('p', { class: 'phone-note' }, 'No connection'), h('span', { class: 'pt-tag pt-acc' }, 'Retry')],
            }[state];
            phone.replaceChildren(...ui);
            path.replaceChildren(h('span', { class: 'pt-label' }, 'path'), ...trail.map((s, i) => tag(s, i === trail.length - 1 ? 'pt-acc' : '')));
          }
          async function send(e) {
            if (busy) return; busy = true;
            order.forEach(s => branches[s].classList.remove('scan', 'hit', 'miss'));
            const b = branches[state];
            b.classList.add('scan');
            await sleep(380);
            if (!el.isConnected) return;
            b.classList.remove('scan');
            const to = T[state][e];
            if (!to) {
              b.classList.add('scan'); replay(nodes[state], 'shake');
              say(o, `${hl(`reduce(${state}, ${e})`)} = ${hl(state)} <span class="muted">// ${state} does not accept ${e}: ignored</span>`);
              busy = false; return;
            }
            b.classList.add('hit');
            const from = state; state = to;
            trail.push(to); if (trail.length > 6) trail.shift();
            paint(); replay(nodes[to], 'pop'); replay(phone, 'pop-soft');
            say(o, `${hl(`reduce(${from}, ${e})`)} = <span class="good">${to}</span>`);
            busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'pt-states' }, order.map(s => nodes[s])),
            h('div', { class: 'pt-split pt-auto' }, h('div', { class: 'pt-col' }, reducer, path), phone),
            h('div', { class: 'controls' }, btns),
            o);
        },
      },
    ],
  });
})();
