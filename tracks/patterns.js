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
}`;

  Lab.addTrack({
    id: 'patterns',
    title: 'Design patterns',
    description: 'Classic design patterns written the idiomatic Kotlin way, with the places they show up in Android.',
    group: 'Foundations', requires: ['oop'],
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
