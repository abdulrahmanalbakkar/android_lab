/* After launch track. Same shape as tracks/kotlin.js.
   What happens once the app is on Play: crashes and vitals, analytics, flags, updates, reviews, billing, policy.
   Version- and policy-specific facts were checked against developer.android.com, firebase.google.com and
   support.google.com/googleplay/android-developer in October 2026. Demo styles live in the css string below; every class is prefixed al-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const lbl = t => h('span', { class: 'al-label' }, t);
  const pill = (text, cls = '') => h('span', { class: `al-pill ${cls}` }, text);
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const pct = (v, d = 2) => `${v.toFixed(d)}%`;

  // A horizontal meter with an optional threshold marker. set(value) recolors the fill.
  function meter(name, max, threshold) {
    const fill = h('div', { class: 'al-fill' });
    const val = h('b', {}, '–');
    const mark = threshold != null ? h('div', { class: 'al-mark', style: `left:${(threshold / max) * 100}%`, title: `threshold ${threshold}%` }) : null;
    const el = h('div', { class: 'al-meter' },
      h('div', { class: 'al-meter-head' }, h('span', {}, name), val),
      h('div', { class: 'al-track' }, fill, mark),
      threshold != null ? h('small', { class: 'al-thr' }, `bad behavior threshold ${threshold}%`) : null);
    return {
      el,
      set(v) {
        fill.style.width = `${Math.min(100, (v / max) * 100)}%`;
        const over = threshold != null && v > threshold;
        fill.classList.toggle('al-over', over);
        el.classList.toggle('al-meter-over', over);
        val.textContent = pct(v);
      },
    };
  }

  // A small phone frame with a top bar and a content area.
  function phone(title) {
    const body = h('div', { class: 'al-screen' });
    const layer = h('div', { class: 'al-layer' });
    const el = h('div', { class: 'al-phone' }, h('div', { class: 'al-bar' }, title), body, layer);
    return { el, body, layer };
  }
  const articles = n => Array.from({ length: n }, (_, i) => h('div', { class: 'al-art' }, h('span', { class: 'al-thumb' }), h('span', { class: 'al-lines' }, h('i'), h('i', { class: 'al-short' }))));

  const css = `
.al-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.al-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; min-width: 0; }
.al-card { display: grid; gap: 10px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.al-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.al-pill { font: 600 0.78rem var(--mono); padding: 3px 9px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: background 0.25s, border-color 0.25s, opacity 0.25s; }
.al-pill.al-ok { border-color: var(--ok); background: var(--ok-soft); }
.al-pill.al-err { border-color: var(--err); background: var(--err-soft); }
.al-pill.al-warn { border-color: var(--warm); background: var(--warm-soft); }
.al-pill.al-acc { border-color: var(--accent); background: var(--accent-soft); }
.al-pill.al-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.al-note { font-size: 0.86rem; color: var(--muted); line-height: 1.45; overflow-wrap: anywhere; }

/* meters */
.al-meter { display: grid; gap: 4px; min-width: 0; }
.al-meter-head { display: flex; justify-content: space-between; gap: 8px; font: 600 0.8rem var(--mono); min-width: 0; }
.al-meter-head span { overflow-wrap: anywhere; min-width: 0; }
.al-meter-head b { font-variant-numeric: tabular-nums; }
.al-meter-over .al-meter-head b { color: var(--err); }
.al-track { position: relative; height: 12px; border-radius: 6px; background: var(--sunk); overflow: visible; }
.al-fill { height: 100%; width: 0; border-radius: 6px; background: var(--ok); transition: width 0.6s cubic-bezier(0.3, 1.2, 0.5, 1), background 0.3s; }
.al-fill.al-over { background: var(--err); }
.al-mark { position: absolute; top: -4px; bottom: -4px; width: 3px; margin-left: -1px; border-radius: 2px; background: var(--ink); }
.al-thr { font: 500 0.72rem var(--mono); color: var(--muted); }

/* 1 vitals */
.al-dau { font: 700 1.6rem var(--display); font-variant-numeric: tabular-nums; }
.al-models { display: grid; gap: 8px; }
.al-trace { display: grid; gap: 2px; background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 10px 12px; font: 500 0.78rem/1.5 var(--mono); min-width: 0; }
.al-trace span { overflow-wrap: anywhere; }
.al-trace .al-hot { color: var(--t-e); }

/* 2 funnel */
.al-funnel { display: grid; gap: 8px; min-width: 0; }
.al-step { display: grid; gap: 3px; min-width: 0; }
.al-step-head { display: flex; justify-content: space-between; gap: 8px; font: 600 0.8rem var(--mono); min-width: 0; }
.al-step-head span { overflow-wrap: anywhere; min-width: 0; }
.al-step-bar { height: 26px; border-radius: 7px; background: var(--accent); width: 0; transition: width 0.7s cubic-bezier(0.3, 1.1, 0.5, 1), background 0.3s; min-width: 2px; }
.al-step-bar.al-dim { background: var(--muted); opacity: 0.5; }
.al-drop { font: 600 0.74rem var(--mono); color: var(--err); }
.al-split { display: flex; flex-wrap: wrap; gap: 6px; }

/* 3 flags */
.al-dots { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 5px; max-width: 300px; }
.al-dot { aspect-ratio: 1; border-radius: 50%; background: var(--sunk); border: 2px solid var(--line); transition: background 0.3s, border-color 0.3s, transform 0.3s; }
.al-dot.al-on { background: var(--accent); border-color: var(--accent); transform: scale(1.08); }
.al-dot.al-sick { background: var(--err); border-color: var(--err); }
.al-range { width: min(320px, 100%); accent-color: var(--accent); }
.al-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; min-width: 0; }
.al-col { display: grid; gap: 4px; padding: 8px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; text-align: center; transition: border-color 0.25s, background 0.25s; }
.al-col b { font: 700 0.86rem var(--mono); overflow-wrap: anywhere; }
.al-col.al-hit { border-color: var(--accent); background: var(--accent-soft); }

/* phone mockups (4 updates, 5 review) */
.al-phone { position: relative; width: min(230px, 100%); height: 330px; border-radius: 26px; border: 8px solid var(--code-bg); background: var(--surface); overflow: hidden; display: flex; flex-direction: column; justify-self: center; }
.al-bar { font: 700 0.8rem var(--mono); padding: 8px 12px; background: var(--accent-soft); border-bottom: 1px solid var(--line); overflow-wrap: anywhere; }
.al-screen { flex: 1; display: grid; gap: 8px; align-content: start; padding: 10px; overflow: hidden; }
.al-art { display: flex; gap: 8px; align-items: center; }
.al-thumb { width: 34px; height: 34px; border-radius: 8px; background: var(--sunk); flex: none; }
.al-lines { display: grid; gap: 5px; flex: 1; }
.al-lines i { display: block; height: 7px; border-radius: 4px; background: var(--sunk); }
.al-lines i.al-short { width: 60%; }
.al-layer { position: absolute; inset: 0; pointer-events: none; }
.al-layer > * { pointer-events: auto; }
.al-sheet { position: absolute; left: 8px; right: 8px; bottom: 8px; display: grid; gap: 8px; padding: 12px; border-radius: 14px; background: var(--bg); border: 2px solid var(--line); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); font-size: 0.82rem; }
.al-sheet b { font-size: 0.9rem; }
.al-full { position: absolute; inset: 0; display: grid; place-content: center; gap: 10px; padding: 16px; text-align: center; background: var(--bg); font-size: 0.84rem; }
.al-snack { position: absolute; left: 8px; right: 8px; bottom: 8px; display: flex; flex-wrap: wrap; gap: 6px; justify-content: space-between; align-items: center; padding: 9px 12px; border-radius: 10px; background: var(--ink); color: var(--bg); font-size: 0.78rem; }
.al-snack b { color: var(--accent); font-family: var(--mono); }
.al-prog { height: 6px; border-radius: 3px; background: var(--sunk); overflow: hidden; }
.al-prog > div { height: 100%; width: 0; background: var(--accent); transition: width 0.2s linear; }
.al-stars { font-size: 1.3rem; letter-spacing: 4px; color: var(--warm); }
.al-spin { justify-self: center; width: 26px; height: 26px; border-radius: 50%; border: 4px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.7s linear infinite; }
.al-log { display: grid; gap: 3px; font: 500 0.78rem/1.45 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 10px 12px; min-height: 5.5em; min-width: 0; }
.al-log div { overflow-wrap: anywhere; }
.al-log .al-c { color: var(--t-c); }

/* 6 billing */
.al-sm { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.al-state { font: 600 0.76rem var(--mono); padding: 5px 9px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: all 0.25s; overflow-wrap: anywhere; }
.al-state.al-done { color: var(--ink); border-color: var(--ok); background: var(--ok-soft); }
.al-state.al-now { color: var(--ink); border-color: var(--accent); background: var(--accent-soft); box-shadow: 0 0 0 3px var(--accent-soft); }
.al-state.al-bad { color: var(--ink); border-color: var(--err); background: var(--err-soft); }
.al-state.al-wait { color: var(--ink); border-color: var(--warm); background: var(--warm-soft); }
.al-arrow { color: var(--muted); font-size: 0.8rem; }
.al-days { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.al-day { text-align: center; font: 600 0.74rem var(--mono); padding: 6px 4px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); transition: all 0.25s; }
.al-day.al-past { border-color: var(--warm); background: var(--warm-soft); }
.al-day.al-dead { border-color: var(--err); background: var(--err-soft); }

/* 7 policy */
.al-checks { display: grid; gap: 6px; }
.al-check { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font-size: 0.84rem; min-width: 0; transition: border-color 0.25s, background 0.25s; }
.al-check span { overflow-wrap: anywhere; min-width: 0; }
.al-check.al-pass { border-color: var(--ok); }
.al-check.al-fail { border-color: var(--err); background: var(--err-soft); }
.al-time { display: grid; gap: 8px; border-left: 3px solid var(--line); padding-left: 12px; }
.al-tick { display: grid; gap: 2px; font-size: 0.84rem; position: relative; }
.al-tick::before { content: ""; position: absolute; left: -19px; top: 4px; width: 11px; height: 11px; border-radius: 50%; background: var(--surface); border: 2px solid var(--muted); }
.al-tick.al-past::before { background: var(--accent); border-color: var(--accent); }
.al-tick b { font: 700 0.8rem var(--mono); }
`;

  Lab.addTrack({
    id: 'launch',
    title: 'After launch',
    description: 'Keep a released app healthy and earning: crash reports and Android vitals, analytics, feature flags, in-app updates and reviews, Play Billing and the Play policies that block releases.',
    requires: ['build'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'crashes',
        title: 'Crash reporting and Android vitals',
        tagline: 'Crashlytics tells you why the app crashed. Android vitals tells you whether Play thinks it crashes too often.',
        level: 'intermediate',
        body: `
<p>After release you can no longer attach a debugger. You need two views of the same problem. <b>Firebase Crashlytics</b> collects stack traces, logs and custom keys from your users' devices, so you can find the line that broke. <b>Android vitals</b> in Play Console counts how many daily users hit a crash or an ANR (app not responding), and Play acts on those numbers.</p>
<p>Play cares about <em>user-perceived</em> rates: crashes and ANRs that happen while an activity is on screen or a foreground service runs. A crash in a background broadcast receiver still counts in the plain crash rate, but not in the user-perceived one. If the user-perceived crash rate goes above <b>1.09%</b> overall, or the ANR rate above <b>0.47%</b>, Play may make your app harder to find and may show a warning on the store listing. A single phone model above <b>8%</b> counts too.</p>
<p>Play these days one by one and watch which meter crosses its line.</p>`,
        visual(el) {
          const DAYS = {
            quiet: { name: 'Quiet day', crash: 0.42, all: 0.6, anr: 0.21, models: [0.4, 0.5, 0.45], say: 'A normal day. Every meter sits under its line.' },
            receiver: { name: 'Crash in a broadcast receiver', crash: 0.42, all: 2.4, anr: 0.21, models: [0.4, 0.5, 0.45], say: 'The crash rate jumps, but the user-perceived rate does not move: the crash happened with nothing on screen. Fix it anyway, Crashlytics still shows it.' },
            open: { name: 'Crash when an article opens', crash: 1.85, all: 2.0, anr: 0.21, models: [1.7, 1.9, 1.95], say: 'Users see this one. The user-perceived crash rate passes 1.09%, so Play may lower the app’s visibility until it drops back.' },
            disk: { name: 'Disk read on the main thread', crash: 0.42, all: 0.6, anr: 0.88, models: [0.4, 0.5, 0.45], say: 'No crash, but the UI freezes long enough for ANRs. The ANR line is lower, 0.47%.' },
            model: { name: 'One phone model breaks', crash: 0.98, all: 1.1, anr: 0.21, models: [0.4, 0.5, 11.2], say: 'The overall rate stays under 1.09%, yet one model is over 8%. Play can act on that model alone, for example a warning for users of that device.' },
          };
          const MODELS = ['Pixel 8', 'Galaxy A15', 'Redmi 13C'];
          const up = meter('User-perceived crash rate', 3, 1.09);
          const all = meter('Crash rate, all crashes', 3);
          const anr = meter('User-perceived ANR rate', 1.5, 0.47);
          const per = MODELS.map(m => meter(m, 14, 8));
          const free = h('span', { class: 'al-dau' }, '–');
          const o = out('');
          const keys = Object.keys(DAYS);
          const btns = keys.map(k => act(DAYS[k].name, () => pick(k)));
          function pick(k) {
            const d = DAYS[k];
            press(btns, btns[keys.indexOf(k)]);
            up.set(d.crash); all.set(d.all); anr.set(d.anr);
            d.models.forEach((v, i) => per[i].set(v));
            free.textContent = pct(100 - d.crash);
            replay(free, 'pop');
            say(o, d.say);
          }
          el.append(
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'al-grid' },
              h('div', { class: 'al-card' }, lbl('20,000 daily users'), h('div', {}, free), h('span', { class: 'al-note' }, 'used the app without a user-perceived crash'), up.el, all.el, anr.el),
              h('div', { class: 'al-card' }, lbl('Per phone model'), h('div', { class: 'al-models' }, per.map(p => p.el)))),
            o);
          pick('quiet');
        },
        code: `// settings.gradle.kts / root build.gradle.kts
plugins {
    id("com.google.gms.google-services") version "4.5.0" apply false
    id("com.google.firebase.crashlytics") version "3.0.8" apply false
}

// app/build.gradle.kts
plugins {
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")   // also uploads R8 mapping files
}
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:35.0.1"))
    implementation("com.google.firebase:firebase-crashlytics")
    implementation("com.google.firebase:firebase-analytics")  // breadcrumbs
}

// Anywhere in the app
class ArticleRepository(private val api: NewsApi) {
    suspend fun load(id: String): Article? = try {
        Firebase.crashlytics.log("load article \$id")
        api.article(id)
    } catch (e: IOException) {
        Firebase.crashlytics.setCustomKey("article_id", id)
        Firebase.crashlytics.recordException(e)   // non-fatal: the app keeps running
        null
    }
}`,
        remember: 'Play judges user-perceived crashes and ANRs per day per user: stay under 1.09% and 0.47% overall, and under 8% on every phone model.',
        deeper: [
          {
            title: 'Non-fatals, logs and keys',
            body: `<p>A crash report alone says where the app died, not what led there. Three calls add context. <code>log()</code> leaves breadcrumbs, and Crashlytics keeps the last 64 kB of them. <code>setCustomKey()</code> records state such as the screen or the experiment group, up to 64 pairs. <code>recordException()</code> reports an exception you caught, so you see errors that did not crash the app.</p>
<p>Non-fatals are batched and sent the next time the app launches, and only the most recent eight are kept. Use them for errors you want to count, not for every expected failure such as no network.</p>`,
            code: `Firebase.crashlytics.setCustomKeys {
    key("screen", "article")
    key("ab_group", "new_reader_ui")
}
Firebase.crashlytics.setUserId(user.internalId)   // never an email or phone number

try {
    player.prepare(url)
} catch (e: PlaybackException) {
    Firebase.crashlytics.recordException(e)
    showError()
}`,
          },
          {
            title: 'Readable stack traces after R8',
            body: `<p>A release build shrunk by R8 renames your classes to short names like <code>a.b</code>. The stack traces from users' phones then point at names that do not exist in your code. R8 writes a <em>mapping file</em> for each build, and the Crashlytics Gradle plugin uploads it automatically when the build produces one. Crashlytics uses it to turn the names back.</p>
<p>The plugin lets you switch this off with <code>mappingFileUploadEnabled = false</code> to save build time. Do that only for debug-like variants, never for the build you ship.</p>`,
            visual(el) {
              const RAW = ['java.lang.NullPointerException', '  at a.b.c.a(SourceFile:3)', '  at a.b.d.b(SourceFile:1)', '  at o5.g.invokeSuspend(SourceFile:12)'];
              const MAPPED = ['java.lang.NullPointerException', '  at tr.example.haber.ArticleMapper.toUi(ArticleMapper.kt:42)', '  at tr.example.haber.ArticleViewModel.open(ArticleViewModel.kt:88)', '  at tr.example.haber.ArticleViewModel$open$1.invokeSuspend(ArticleViewModel.kt:31)'];
              const trace = h('div', { class: 'al-trace' });
              const o = out('');
              const show = lines => trace.replaceChildren(...lines.map((l, i) => h('span', { class: i === 1 ? 'al-hot' : null }, l)));
              const off = act('mappingFileUploadEnabled = false', () => { press([off, on], off); show(RAW); replay(trace, 'pop-soft'); say(o, 'No mapping file on the server. You know something was null, but not where.'); });
              const on = act('upload mapping (default)', async () => {
                press([off, on], on); show(RAW); say(o, 'Build finished. Uploading mapping.txt for this version…');
                await sleep(700); if (!el.isConnected) return;
                show(MAPPED); replay(trace, 'pop-soft'); say(o, '<span class="good">Deobfuscated:</span> line 42 of ArticleMapper.kt.');
              });
              el.append(h('div', { class: 'controls' }, off, on), trace, o);
              press([off, on], off); show(RAW);
              say(o, 'This is what a crash from a minified release build looks like.');
            },
            code: `// app/build.gradle.kts
android {
    buildTypes {
        getByName("debugMinified") {
            configure<CrashlyticsExtension> {
                mappingFileUploadEnabled = false   // faster local builds only
            }
        }
        // release keeps the default: the mapping file is uploaded
    }
}`,
          },
          {
            title: 'Ask first when the law says so',
            body: `<p>Crash reports leave the device, so they belong in your Data safety form and, depending on where your users live, may need consent. Crashlytics supports opt-in reporting: switch automatic collection off in the manifest, then turn it on in code once the user agrees. The choice persists across launches.</p>`,
            code: `<!-- AndroidManifest.xml -->
<meta-data
    android:name="firebase_crashlytics_collection_enabled"
    android:value="false" />

// After the user agrees on your consent screen
Firebase.crashlytics.setCrashlyticsCollectionEnabled(true)`,
          },
        ],
        underHood: {
          body: `<p>When an exception is not caught, the JVM calls the thread's default uncaught exception handler. A crash reporter installs its own handler there, writes the report to disk, and then lets the process die as it would have. The report is sent when the app starts again. That is why the Crashlytics setup guide tells you to restart the app after a test crash before you look at the console.</p>
<p>An ANR is different: the app does not die by itself. The system notices that the main thread has not handled an input event or a broadcast in time and shows the "isn't responding" dialog. Play counts it in vitals even if no exception was ever thrown.</p>`,
          code: `// The idea, in a few lines (do not ship this: Crashlytics does it for you)
val previous = Thread.getDefaultUncaughtExceptionHandler()
Thread.setDefaultUncaughtExceptionHandler { thread, e ->
    saveReportToDisk(e)              // fast, local, no network
    previous?.uncaughtException(thread, e)   // let the app crash as usual
}`,
        },
        mistakes: [
          {
            title: 'Swallowing exceptions to make the dashboard green',
            bad: `try {
    renderArticle(article)
} catch (e: Exception) {
    // ignore: keeps the crash rate low
}`,
            good: `try {
    renderArticle(article)
} catch (e: ParseException) {
    Firebase.crashlytics.recordException(e)
    showFallback(article.url)
}`,
            why: 'An empty catch hides the bug and leaves the user on a broken screen. Catch the specific exception you expect, record it as a non-fatal and show a fallback.',
          },
          {
            title: 'Personal data in user IDs and keys',
            bad: `Firebase.crashlytics.setUserId(user.email)
Firebase.crashlytics.setCustomKey("phone", user.phone)`,
            good: `Firebase.crashlytics.setUserId(user.internalId)
Firebase.crashlytics.setCustomKey("plan", user.plan.name)`,
            why: 'Crash data is sent off the device and seen by your whole team. Use an opaque internal ID and non-personal state. What you send must also match your Data safety answers.',
          },
        ],
        terms: [
          { term: 'User-perceived crash rate', def: 'Share of daily active users who had at least one crash while an activity was visible or a foreground service was running.' },
          { term: 'ANR', def: 'Application Not Responding: the main thread was blocked too long, so the system offered to close the app.' },
          { term: 'Bad behavior threshold', def: 'The Android vitals limit (for example 1.09% for user-perceived crashes) above which Play may reduce an app’s visibility.' },
          { term: 'Non-fatal', def: 'An exception your code caught and reported with recordException(). The app kept running.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Leave a breadcrumb, then report a caught exception without crashing.', code: 'Firebase.crashlytics.[[log]]("open article $id")\ntry {\n    api.article(id)\n} catch (e: IOException) {\n    Firebase.crashlytics.[[recordException]](e)\n}', why: '<code>log()</code> adds a line to the report’s log. <code>recordException()</code> sends a non-fatal event with the stack trace of the exception you caught.' },
          { type: 'bug', prompt: 'Crashes from the Play release show names like <code>a.b.c.a</code>. Tap the line that causes it.', code: 'android {\n    buildTypes {\n        getByName("release") {\n            isMinifyEnabled = true\n            configure<CrashlyticsExtension> {\n                mappingFileUploadEnabled = false\n            }\n        }\n    }\n}', bug: 5, fix: '                mappingFileUploadEnabled = true', why: 'R8 renames classes in the release build. Without the uploaded mapping file Crashlytics cannot turn <code>a.b.c</code> back into your class names.' },
        ],
        quiz: [
          { q: 'A crash happens inside a BroadcastReceiver while no activity is on screen. Which number goes up?', options: ['Only the user-perceived crash rate', 'Only the crash rate (all crashes)', 'Both'], a: 1, why: 'User-perceived crashes need a visible activity or a running foreground service. A background crash raises the plain crash rate only.' },
          { q: 'Your overall user-perceived crash rate is 0.9%, but one phone model is at 10%. Is that a problem for Play?', options: ['No, the overall rate is under 1.09%', 'Yes, the per-model threshold is 8%', 'Only if the model is a Pixel'], a: 1, why: 'Android vitals also has a per-phone-model threshold of 8%. Play can act for that model even when the average looks fine.' },
          { q: 'Why does a test crash only show up in Crashlytics after you open the app again?', options: ['The report is written to disk and sent on the next launch', 'Crashlytics waits 24 hours', 'Debug builds never send reports'], a: 0, why: 'A dying process is a bad place for network calls. The report is saved locally and uploaded when the app starts again.' },
        ],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'analytics',
        title: 'Analytics events that answer questions',
        tagline: 'Start from the question, then log the few events and parameters that answer it.',
        level: 'intermediate',
        body: `
<p>Analytics is only useful if it answers a question you will act on. "Do readers share articles?" leads to a funnel: <code>app_open</code>, then opening an article, then sharing it. Each step is an event, and the drop between steps tells you where to work.</p>
<p>Name events after what the user did, not after the button. Use Firebase's recommended events such as <code>SELECT_CONTENT</code> and <code>SHARE</code> when they fit, and put details in <em>parameters</em> (<code>content_type</code>, <code>method</code>) instead of in the event name. An app can log at most 500 different event types, so <code>"share_" + articleId</code> burns through them and splits one action into thousands of rows.</p>
<p>Events leave the device. They go in your Data safety form, they must not carry personal data, and in some regions you need consent before you collect them.</p>`,
        visual(el) {
          const STEPS = [
            { ev: 'app_open', n: 10000 },
            { ev: 'select_content', p: 'content_type = article', n: 6200 },
            { ev: 'share', p: 'method = …', n: 410 },
          ];
          const SPLIT = [['whatsapp', 240], ['x', 70], ['copy_link', 100]];
          let mode = 'good', fixed = false;
          const funnel = h('div', { class: 'al-funnel' });
          const split = h('div', { class: 'al-split' });
          const o = out('');
          const draw = () => {
            funnel.replaceChildren(); split.replaceChildren();
            if (mode === 'bad') {
              const row = h('div', { class: 'al-step' }, h('div', { class: 'al-step-head' }, h('span', {}, 'button_click'), h('b', {}, '23,480')), h('div', { class: 'al-step-bar al-dim' }));
              funnel.append(row);
              requestAnimationFrame(() => { row.lastChild.style.width = '100%'; });
              say(o, 'One generic event for every tap. You can count taps, but not which tap, so the question has no answer.');
              return;
            }
            const steps = STEPS.map((s, i) => ({ ...s, n: i === 2 && fixed ? 690 : s.n }));
            steps.forEach((s, i) => {
              const bar = h('div', { class: 'al-step-bar' });
              const drop = i ? h('span', { class: 'al-drop' }, `−${Math.round((1 - s.n / steps[i - 1].n) * 100)}% from the step before`) : null;
              funnel.append(h('div', { class: 'al-step' },
                h('div', { class: 'al-step-head' }, h('span', {}, s.ev + (s.p ? ` (${s.p})` : '')), h('b', {}, s.n.toLocaleString('en-US'))),
                bar, drop));
              setTimeout(() => { bar.style.width = `${(s.n / 10000) * 100}%`; }, 80 + i * 180);
            });
            const k = fixed ? 690 / 410 : 1;
            SPLIT.forEach(([m, n]) => split.append(pill(`method = ${m}: ${Math.round(n * k)}`, 'al-acc')));
            say(o, fixed
              ? 'After the faster share sheet ships, share rises from 410 to 690. Same events, so the before and after compare directly.'
              : 'Most readers open an article, very few share. That gap is where to look. The <b>method</b> parameter shows which share target people use.');
          };
          const bBad = act('log button_click', () => { mode = 'bad'; press([bBad, bGood], bBad); draw(); });
          const bGood = act('log named events + params', () => { mode = 'good'; press([bBad, bGood], bGood); draw(); });
          const bFix = act('ship a faster share sheet', () => { fixed = !fixed; bFix.setAttribute('aria-pressed', String(fixed)); if (mode === 'good') draw(); });
          el.append(
            h('div', { class: 'al-card' }, lbl('Question'), h('b', {}, 'Where do readers drop off before sharing an article?')),
            h('div', { class: 'controls' }, bBad, bGood, bFix),
            funnel, split, o);
          press([bBad, bGood], bGood); bFix.setAttribute('aria-pressed', 'false');
          draw();
        },
        code: `class ArticleAnalytics(private val analytics: FirebaseAnalytics) {

    fun articleOpened(article: Article, source: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SELECT_CONTENT) {
            param(FirebaseAnalytics.Param.CONTENT_TYPE, "article")
            param(FirebaseAnalytics.Param.ITEM_ID, article.id)
            param("source", source)          // "home", "push", "search"
        }
    }

    fun articleShared(article: Article, method: String) {
        analytics.logEvent(FirebaseAnalytics.Event.SHARE) {
            param(FirebaseAnalytics.Param.CONTENT_TYPE, "article")
            param(FirebaseAnalytics.Param.ITEM_ID, article.id)
            param(FirebaseAnalytics.Param.METHOD, method)   // "whatsapp", "copy_link"
        }
    }
}

// Wire it once, e.g. with Hilt
@Provides fun analytics(): FirebaseAnalytics = Firebase.analytics`,
        remember: 'Question first, then events. Event names say what the user did; the details go in parameters.',
        deeper: [
          {
            title: 'Write the tracking plan before the code',
            body: `<p>A short table saves weeks of bad data. One row per question: the question, the event, the parameters, and the decision it drives. If a row has no decision, drop it.</p>
<p>Keep the plan next to the code, and route every event through one small class like <code>ArticleAnalytics</code>. Then names cannot drift between screens (<code>share</code> in one place, <code>Share</code> in another: event names are case-sensitive, so those are two events).</p>`,
            code: `// tracking-plan.md, as a table in code review
// question                         | event           | params                    | decision
// Do push readers stay longer?     | select_content  | source=push|home|search   | tune push volume
// Which share target matters?      | share           | method                    | order of share buttons
// Does the new reader UI help?     | select_content  | (user property ab_group)  | keep or kill the flag`,
          },
          {
            title: 'Default parameters and user properties',
            body: `<p>Some values belong on every event, such as the app's edition or the experiment group. <code>setDefaultEventParameters()</code> adds them to all later events. A value passed to <code>logEvent()</code> wins over the default, and passing <code>null</code> clears it.</p>
<p>A <em>user property</em> describes the user rather than one action, for example their plan. Reports can then be filtered by it.</p>`,
            code: `analytics.setDefaultEventParameters(
    bundleOf("edition" to "tr", "ab_group" to flags.readerUiGroup)
)
analytics.setUserProperty("plan", if (user.isPremium) "premium" else "free")`,
          },
          {
            title: 'Consent mode',
            body: `<p>Google Analytics has consent mode. You set the default for each consent type in the manifest, then update it in code after the user chooses. Consent values persist across launches until you call <code>setConsent</code> again.</p>
<p>Set the defaults to denied when your users need to opt in, and show your consent screen before anything important happens.</p>`,
            code: `<!-- AndroidManifest.xml -->
<meta-data android:name="google_analytics_default_allow_analytics_storage" android:value="false" />
<meta-data android:name="google_analytics_default_allow_ad_storage" android:value="false" />
<meta-data android:name="google_analytics_default_allow_ad_user_data" android:value="false" />
<meta-data android:name="google_analytics_default_allow_ad_personalization_signals" android:value="false" />

// When the user accepts analytics but not ads
Firebase.analytics.setConsent {
    analyticsStorage(ConsentStatus.GRANTED)
    adStorage(ConsentStatus.DENIED)
    adUserData(ConsentStatus.DENIED)
    adPersonalization(ConsentStatus.DENIED)
}`,
          },
          {
            title: 'See events while you test',
            body: `<p>The dashboard updates a few times a day, which is too slow while you build. Turn on verbose logging for the Analytics tags and watch events in Logcat as you tap through the funnel.</p>`,
            code: `adb shell setprop log.tag.FA VERBOSE
adb shell setprop log.tag.FA-SVC VERBOSE
adb logcat -v time -s FA FA-SVC`,
          },
        ],
        mistakes: [
          {
            title: 'Data in the event name',
            bad: `analytics.logEvent("share_" + article.id) { }
analytics.logEvent("open_" + screenName) { }`,
            good: `analytics.logEvent(FirebaseAnalytics.Event.SHARE) {
    param(FirebaseAnalytics.Param.ITEM_ID, article.id)
}`,
            why: 'Each distinct name is a new event type, and an app gets 500. Values that vary go in parameters, so one event row can be split by them later.',
          },
          {
            title: 'Logging personal data',
            bad: `analytics.logEvent("login") {
    param("email", user.email)
}`,
            good: `analytics.logEvent(FirebaseAnalytics.Event.LOGIN) {
    param(FirebaseAnalytics.Param.METHOD, "google")
}`,
            why: 'Analytics is for behavior, not identity. Leave out emails, names and phone numbers; log how something happened, not who did it.',
          },
        ],
        terms: [
          { term: 'Event', def: 'A named thing the user did, such as share or select_content, logged with logEvent().' },
          { term: 'Parameter', def: 'A key and value attached to an event (method = whatsapp) that lets you split the event in reports.' },
          { term: 'Funnel', def: 'A sequence of events where each step should follow the last. The drop between steps shows where users stop.' },
          { term: 'Consent mode', def: 'Google Analytics settings (analytics_storage, ad_storage and so on) that record what the user agreed to.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Log a share with the share target as a parameter.', code: 'analytics.logEvent(FirebaseAnalytics.Event.[[SHARE]]) {\n    param(FirebaseAnalytics.Param.ITEM_ID, article.id)\n    param(FirebaseAnalytics.Param.[[METHOD]], "whatsapp")\n}', why: '<code>SHARE</code> is a recommended event, and <code>METHOD</code> records how the content was shared.' },
          { type: 'bug', prompt: 'After a week the console says the app hit its event type limit. Tap the line responsible.', code: 'fun onShare(article: Article, method: String) {\n    analytics.logEvent("share_${article.id}") {\n        param(FirebaseAnalytics.Param.METHOD, method)\n    }\n}', bug: 1, fix: '    analytics.logEvent(FirebaseAnalytics.Event.SHARE) {', why: 'Every article id creates a new event name. Use one <code>SHARE</code> event and put the id in <code>ITEM_ID</code>.' },
        ],
        quiz: [
          { q: 'You want to know which share target is popular. Where does "whatsapp" go?', options: ['In the event name: share_whatsapp', 'In a parameter: method = whatsapp', 'In a user property'], a: 1, why: 'One <code>share</code> event with a <code>method</code> parameter can be split by target in reports, and it costs one event type.' },
          { q: 'Why route all events through one class such as ArticleAnalytics?', options: ['It makes events send faster', 'Names and parameters stay consistent across screens', 'Firebase requires it'], a: 1, why: 'Event names are case-sensitive. One place that logs them stops two screens from inventing two spellings for the same action.' },
          { q: 'Where do you set the default consent state before the user has chosen?', options: ['In AndroidManifest.xml meta-data', 'In Remote Config', 'In the Play Console'], a: 0, why: 'Keys such as <code>google_analytics_default_allow_analytics_storage</code> set the defaults. <code>setConsent()</code> updates them later.' },
        ],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'flags',
        title: 'Remote Config and feature flags',
        tagline: 'Ship the code turned off, turn it on for a few users, and keep a switch to turn it off again.',
        level: 'intermediate',
        body: `
<p>A Play release takes days to reach most users, and you cannot take it back. A <em>feature flag</em> separates shipping code from turning it on. The new reader screen ships in the APK behind <code>if (flags.newReaderUi)</code>, and Firebase Remote Config decides the value from the server.</p>
<p>Turn it on for 5% of users, watch Crashlytics and Analytics, then widen the range. If crashes rise, set the flag back to false. That is a <em>kill switch</em>: no new build, no review, no waiting for users to update.</p>
<p>Every flag needs an in-app default, because the first launch may have no network. Remote Config fetches new values at most every 12 hours by default, and nothing changes until you <em>activate</em> them. Real-time listeners can push changes sooner.</p>`,
        visual(el) {
          // ponytail: fixed fake percentiles so the same users stay in when the range widens
          const P = Array.from({ length: 100 }, (_, i) => (i * 37) % 100);
          let value = 0, realtime = false, sick = false, busy = false;
          const dots = P.map(() => h('span', { class: 'al-dot' }));
          const range = h('input', { type: 'range', class: 'al-range', min: '0', max: '100', step: '5', value: '0', 'aria-label': 'Rollout percentage' });
          const v = h('b', {}, '0%');
          const on = meter('Crash rate, flag on', 3, 1.09);
          const offM = meter('Crash rate, flag off', 3, 1.09);
          const o = out('');
          const paint = () => {
            dots.forEach((d, i) => { d.classList.toggle('al-on', P[i] < value); d.classList.toggle('al-sick', sick && P[i] < value); });
            v.textContent = `${value}%`;
            on.set(value ? (sick ? 2.3 : 0.38) : 0); offM.set(0.41);
          };
          range.addEventListener('input', () => {
            if (busy) { range.value = String(value); return; }
            value = +range.value; paint();
            say(o, value === 0 ? 'Flag off for everyone. The code is in the app, but no one runs it.'
              : value === 100 ? 'Everyone has the new reader. Once it has been stable for a while, delete the flag and the old code.'
              : `${value}% of installs fall in the range and get <b>new_reader_ui = true</b>. Widening the range keeps the users who were already in.`);
          });
          const bug = act('new UI crashes on some phones', () => {
            if (!value) { say(o, 'Turn the flag on for some users first.'); return; }
            sick = true; paint(); say(o, '<span class="bad">The flag-on group crashes more.</span> Compare it with the flag-off group, then pull the switch.');
          });
          const rt = act('real-time listener', () => { realtime = !realtime; rt.setAttribute('aria-pressed', String(realtime)); });
          const kill = act('kill switch: set false', async () => {
            if (busy || !value) return; busy = true;
            say(o, realtime ? 'Published. Real-time listeners activate the new value right away.' : 'Published. Each device picks it up on its next fetch, so it spreads over hours.');
            const lit = dots.map((d, i) => i).filter(i => P[i] < value).sort(() => Math.random() - 0.5);
            for (const i of lit) {
              await sleep(realtime ? 15 : 90); if (!el.isConnected) return;
              dots[i].classList.remove('al-on', 'al-sick');
            }
            value = 0; sick = false; range.value = '0'; paint(); busy = false;
            say(o, '<span class="good">Everyone is back on the old screen.</span> No release, no review, no update needed.');
          });
          el.append(
            h('div', { class: 'al-row' }, lbl('new_reader_ui rollout'), v), range,
            h('div', { class: 'al-grid' }, h('div', { class: 'al-dots', 'aria-hidden': 'true' }, dots), h('div', { class: 'al-card' }, on.el, offM.el)),
            h('div', { class: 'controls' }, bug, rt, kill), o);
          rt.setAttribute('aria-pressed', 'false');
          paint(); say(o, 'Drag the slider to roll the flag out. Each dot is 1% of installs.');
        },
        code: `class Flags(private val rc: FirebaseRemoteConfig = Firebase.remoteConfig) {

    init {
        rc.setConfigSettingsAsync(remoteConfigSettings {
            minimumFetchIntervalInSeconds = if (BuildConfig.DEBUG) 0 else 3600
        })
        rc.setDefaultsAsync(R.xml.remote_config_defaults)   // used until a fetch is activated
    }

    val newReaderUi: Boolean get() = rc.getBoolean("new_reader_ui")
    val maxArticlesOffline: Long get() = rc.getLong("max_articles_offline")

    // Call on app start; the values apply from now on
    fun refresh() {
        rc.fetchAndActivate().addOnCompleteListener { task ->
            if (task.isSuccessful) Log.d("Flags", "updated = \${task.result}")
        }
    }
}

// Screen code reads the flag, it never calls Remote Config directly
if (flags.newReaderUi) NewReaderScreen(article) else ReaderScreen(article)`,
        remember: 'Every flag has an in-app default, every risky feature has a kill switch, and every finished flag gets deleted.',
        deeper: [
          {
            title: 'Fetched is not active',
            body: `<p>Remote Config keeps three layers: the in-app defaults, the last <em>fetched</em> values, and the <em>active</em> values. <code>getBoolean()</code> reads the active layer, falling back to the default. <code>fetch()</code> only downloads; <code>activate()</code> makes the download the active set.</p>
<p>That split lets you fetch in the background and activate at a calm moment, such as the next app start, so a screen does not change under the user's finger. Step through it.</p>`,
            visual(el) {
              const cols = ['in-app default', 'fetched', 'active'].map(t => {
                const b = h('b', {}, '–'); const c = h('div', { class: 'al-col' }, lbl(t), b); c.b = b; return c;
              });
              const o = out('');
              const set = (i, txt) => { cols[i].b.textContent = txt; cols.forEach(c => c.classList.remove('al-hit')); cols[i].classList.add('al-hit'); replay(cols[i], 'pop-soft'); };
              let fetched = null, active = null;
              const read = () => {
                const src = active != null ? 2 : 0; const val = active != null ? active : 'false';
                cols.forEach(c => c.classList.remove('al-hit')); cols[src].classList.add('al-hit');
                say(o, `${hl('rc.getBoolean("new_reader_ui")')} <span class="muted">→</span> <b>${val}</b> <span class="muted">from ${src ? 'active' : 'the default'}</span>`);
              };
              const bF = act('fetch()', () => { fetched = 'true'; set(1, fetched); say(o, 'Downloaded <b>true</b>. Nothing in the app changes yet.'); });
              const bA = act('activate()', () => { if (fetched == null) { say(o, 'Nothing fetched yet, so there is nothing to activate.'); return; } active = fetched; set(2, active); say(o, 'The fetched set is now active.'); });
              const bR = act('getBoolean()', read);
              cols[0].b.textContent = 'false';
              el.append(h('div', { class: 'controls' }, bF, bA, bR), h('div', { class: 'al-cols' }, cols), o);
              read();
            },
          },
          {
            title: 'Real-time updates for kill switches',
            body: `<p>The default minimum fetch interval is 12 hours, and fetching too often gets throttled. A kill switch that needs half a day is slow. With a real-time listener, the app hears about a published change and which keys it touched, without waiting for the fetch interval.</p>
<p>You still decide when to activate. For a kill switch, activate right away.</p>`,
            code: `rc.addOnConfigUpdateListener(object : ConfigUpdateListener {
    override fun onUpdate(configUpdate: ConfigUpdate) {
        if ("new_reader_ui" in configUpdate.updatedKeys) {
            rc.activate().addOnCompleteListener { readerUiChanged() }
        }
    }
    override fun onError(error: FirebaseRemoteConfigException) {
        Log.w("Flags", "config update error \${error.code}")
    }
})`,
          },
          {
            title: 'Rollouts with a control group',
            body: `<p>A plain percentage condition turns a flag on for a random share of app instances. Remote Config <em>rollouts</em> go one step further: they keep a control group and, with Crashlytics in the app, show stability for the rollout group next to the control group. If the numbers turn bad, you roll back for everyone or for one segment.</p>
<p>Crashlytics rollout metrics need the Crashlytics Android SDK 18.6.0 or newer, which current BoM versions include.</p>`,
          },
        ],
        mistakes: [
          {
            title: 'No in-app default',
            bad: `// No setDefaultsAsync: first launch offline gets false, 0 and ""
val limit = rc.getLong("max_articles_offline")   // 0: offline mode saves nothing`,
            good: `rc.setDefaultsAsync(R.xml.remote_config_defaults)
// res/xml/remote_config_defaults.xml
// <entry><key>max_articles_offline</key><value>50</value></entry>`,
            why: 'Without defaults the first launch, or any launch without network, reads empty values. Ship safe defaults in the APK.',
          },
          {
            title: 'Flags that never die',
            bad: `if (flags.newReaderUi) {
    if (flags.newReaderUiV2) NewReaderV2() else NewReader()
} else OldReader()   // three screens, two years later`,
            good: `NewReaderV2()   // flag at 100% for a month: delete the flag and the old screens`,
            why: 'Each flag doubles the paths you have to test. Once a flag has been fully on and stable, remove it and the dead code.',
          },
        ],
        terms: [
          { term: 'Feature flag', def: 'A boolean or value, read at runtime, that turns a piece of shipped code on or off.' },
          { term: 'Kill switch', def: 'A flag you can set to false from the server to turn off a broken feature without a new release.' },
          { term: 'Activate', def: 'The Remote Config step that makes the last fetched values the ones getBoolean() and friends return.' },
          { term: 'Rollout', def: 'Turning a feature on for a growing share of users while watching crashes and analytics.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Download new values and make them active in one call, after setting defaults.', code: 'rc.setDefaultsAsync(R.xml.[[remote_config_defaults]])\nrc.[[fetchAndActivate]]().addOnCompleteListener { task ->\n    if (task.isSuccessful) applyFlags()\n}', why: '<code>fetchAndActivate()</code> downloads and activates in one step. The defaults XML covers the time before that succeeds.' },
          { type: 'bug', prompt: 'The server says <code>new_reader_ui = true</code> and the fetch succeeds, but the app still shows the old reader. Tap the line that is wrong.', code: 'fun refresh() {\n    rc.fetch().addOnCompleteListener {\n        showReader(rc.getBoolean("new_reader_ui"))\n    }\n}', bug: 1, fix: '    rc.fetchAndActivate().addOnCompleteListener {', why: '<code>fetch()</code> only downloads. Until <code>activate()</code> runs, <code>getBoolean()</code> returns the old active value or the default.' },
        ],
        quiz: [
          { q: 'A feature behind a flag crashes for 20% of the users who have it. What is the fastest safe fix?', options: ['Publish a hotfix to Play', 'Set the flag to false in Remote Config', 'Ask users to clear app data'], a: 1, why: 'The kill switch turns the code path off for everyone on their next fetch, or right away with real-time updates, without a release.' },
          { q: 'What is the default minimum fetch interval for Remote Config?', options: ['1 minute', '1 hour', '12 hours'], a: 2, why: 'The default is 12 hours. You can lower it for development, but frequent fetches in production can get throttled.' },
          { q: 'Why ship in-app defaults for every parameter?', options: ['Remote Config refuses to fetch without them', 'The app must behave sensibly before any fetch succeeds', 'They make fetches faster'], a: 1, why: 'First launch and offline launches have no fetched values. The defaults are what the app runs with until a fetch is activated.' },
        ],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'updates',
        title: 'In-app updates',
        tagline: 'Ask Play to update the app from inside it: in the background for most releases, full screen only when it is critical.',
        level: 'intermediate',
        body: `
<p>Many users never open the Play Store to update. The Play in-app updates library lets your app check whether a newer version is on Play and start the update itself. It works on Android 5.0 (API 21) and newer, on phones, tablets and ChromeOS devices.</p>
<p>There are two flows. A <b>flexible</b> update downloads in the background while the user keeps reading; when it is done, you show a "Restart" prompt and call <code>completeUpdate()</code>. An <b>immediate</b> update takes over the screen, and Play installs the update and restarts the app. Use immediate only when the app cannot work without the new version, for example after a breaking API change.</p>
<p>Pick a flow below and run it. Watch which calls your code makes and which parts Play draws.</p>`,
        visual(el) {
          let mode = 'FLEXIBLE', busy = false, ver = '2.3';
          const ph = phone('');
          const log = h('div', { class: 'al-log', 'aria-live': 'polite' });
          const o = out('');
          const line = (t, c) => { log.append(h('div', { class: c }, t)); while (log.children.length > 7) log.firstChild.remove(); };
          const reset = () => {
            ph.el.firstChild.textContent = `Haberler ${ver}`;
            ph.body.replaceChildren(...articles(5)); ph.layer.replaceChildren();
          };
          const ask = (full) => new Promise(res => {
            const yes = h('button', { class: 'cmd', onclick: () => res(true) }, 'Update');
            const no = h('button', { class: 'cmd', onclick: () => res(false) }, full ? 'Cancel' : 'No thanks');
            const box = full
              ? h('div', { class: 'al-full drop-in' }, h('b', {}, 'Update required'), h('span', {}, 'Play UI: the app can’t be used until it updates.'), h('div', { class: 'al-row', style: 'justify-content:center' }, no, yes))
              : h('div', { class: 'al-sheet drop-in' }, h('b', {}, 'Update available'), h('span', {}, 'Play UI: Haberler 2.4 is ready to download.'), h('div', { class: 'al-row' }, no, yes));
            ph.layer.replaceChildren(box);
          });
          const alive = () => el.isConnected;
          async function run() {
            if (busy) return; busy = true; log.replaceChildren(); reset();
            if (ver === '2.4') { line('appUpdateInfo → UPDATE_NOT_AVAILABLE', 'al-c'); say(o, 'Already on the latest version. Press Reset to start over.'); busy = false; return; }
            line('appUpdateManager.appUpdateInfo');
            await sleep(500); if (!alive()) return;
            line(`→ UPDATE_AVAILABLE, isUpdateTypeAllowed(${mode}) = true`, 'al-c');
            line(`startUpdateFlowForResult(info, launcher, AppUpdateOptions.newBuilder(${mode}).build())`);
            say(o, 'Play draws the prompt. Your app only started the flow.');
            const ok = await ask(mode === 'IMMEDIATE'); if (!alive()) return;
            ph.layer.replaceChildren();
            if (!ok) {
              line('launcher → RESULT_CANCELED', 'al-c');
              say(o, mode === 'IMMEDIATE' ? 'The user said no. If the app can still work, let them continue and ask again later.' : 'The user said no. Do not ask again on every launch.');
              busy = false; return;
            }
            line('launcher → RESULT_OK', 'al-c');
            const bar = h('div', {});
            const prog = h('div', { class: 'al-prog' }, bar);
            if (mode === 'FLEXIBLE') {
              const note = h('span', { class: 'al-note' }, 'Downloading… keep reading');
              ph.body.prepend(h('div', { class: 'al-card drop-in' }, note, prog));
              line('InstallStateUpdatedListener: DOWNLOADING', 'al-c');
              for (let p = 0; p <= 100; p += 5) { bar.style.width = `${p}%`; await sleep(70); if (!alive()) return; }
              line('InstallStateUpdatedListener: DOWNLOADED', 'al-c');
              say(o, 'Downloaded. Play does not restart the app by itself, so you show a prompt.');
              await new Promise(res => ph.layer.replaceChildren(h('div', { class: 'al-snack drop-in' }, h('span', {}, 'An update has just been downloaded.'), h('button', { class: 'cmd', onclick: res }, 'RESTART'))));
              if (!alive()) return;
              line('appUpdateManager.completeUpdate()');
            } else {
              ph.layer.replaceChildren(h('div', { class: 'al-full' }, h('b', {}, 'Downloading update'), prog));
              for (let p = 0; p <= 100; p += 5) { bar.style.width = `${p}%`; await sleep(60); if (!alive()) return; }
            }
            ph.layer.replaceChildren(h('div', { class: 'al-full' }, h('span', { class: 'al-spin' }), h('span', {}, 'Installing…')));
            await sleep(900); if (!alive()) return;
            ver = '2.4'; reset(); replay(ph.el, 'pop-soft');
            line('app restarted on 2.4', 'al-c');
            say(o, mode === 'FLEXIBLE' ? '<span class="good">Updated.</span> The user read the whole time and chose when to restart.' : '<span class="good">Updated.</span> Play installed and restarted the app. The user waited, but no one is left on the old version.');
            busy = false;
          }
          const bF = act('flexible', () => { if (busy) return; mode = 'FLEXIBLE'; press([bF, bI], bF); });
          const bI = act('immediate', () => { if (busy) return; mode = 'IMMEDIATE'; press([bF, bI], bI); });
          el.append(h('div', { class: 'controls' }, bF, bI, act('check for update ▶', run)),
            h('div', { class: 'al-grid' }, ph.el, h('div', { class: 'al-card' }, lbl('what your code sees'), log)), o);
          press([bF, bI], bF); reset();
          say(o, 'Choose a flow, then check for an update.');
        },
        code: `// app/build.gradle.kts
implementation("com.google.android.play:app-update:2.1.0")
implementation("com.google.android.play:app-update-ktx:2.1.0")

class MainActivity : ComponentActivity() {
    private val updates by lazy { AppUpdateManagerFactory.create(this) }

    private val launcher = registerForActivityResult(StartIntentSenderForResult()) { result ->
        if (result.resultCode != RESULT_OK) Log.d("Update", "declined or failed: \${result.resultCode}")
    }

    private val listener = InstallStateUpdatedListener { state ->
        if (state.installStatus() == InstallStatus.DOWNLOADED) showRestartSnackbar()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        updates.registerListener(listener)
        updates.appUpdateInfo.addOnSuccessListener { info ->
            if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)
            ) {
                updates.startUpdateFlowForResult(
                    info, launcher, AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build()
                )
            }
        }
    }

    private fun showRestartSnackbar() { /* "Restart" action calls updates.completeUpdate() */ }

    override fun onDestroy() {
        updates.unregisterListener(listener)
        super.onDestroy()
    }
}`,
        remember: 'Flexible by default, immediate only when the old version cannot work. Check again in onResume().',
        deeper: [
          {
            title: 'Decide with priority and staleness',
            body: `<p>You don't have to hard-code the flow. When you roll out a release through the Play Developer API, you can give it an in-app update priority from 0 to 5. The app reads it with <code>updatePriority()</code>. The priority is fixed once the release rolls out.</p>
<p><code>clientVersionStalenessDays()</code> says how many days ago the update became available. A common rule: flexible after a few days, immediate for priority 4 and up.</p>`,
            code: `updates.appUpdateInfo.addOnSuccessListener { info ->
    if (info.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE) return@addOnSuccessListener
    val type = when {
        info.updatePriority() >= 4 && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE) -> AppUpdateType.IMMEDIATE
        (info.clientVersionStalenessDays() ?: -1) >= 3 && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE) -> AppUpdateType.FLEXIBLE
        else -> return@addOnSuccessListener
    }
    updates.startUpdateFlowForResult(info, launcher, AppUpdateOptions.newBuilder(type).build())
}`,
          },
          {
            title: 'Pick it up again in onResume()',
            body: `<p>Users leave the app in the middle of things. Two cases need a check when the app comes back. A flexible update may have finished downloading while the app was in the background: show the restart prompt again. An immediate update may have been interrupted: its availability reads <code>DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS</code>, and you resume it.</p>
<p>Each <code>AppUpdateInfo</code> can start a flow only once. To retry, ask for a fresh one.</p>`,
            code: `override fun onResume() {
    super.onResume()
    updates.appUpdateInfo.addOnSuccessListener { info ->
        if (info.installStatus() == InstallStatus.DOWNLOADED) showRestartSnackbar()
        if (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
            updates.startUpdateFlowForResult(
                info, launcher, AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()
            )
        }
    }
}`,
          },
        ],
        mistakes: [
          {
            title: 'Downloaded, but never installed',
            bad: `InstallStateUpdatedListener { state ->
    if (state.installStatus() == InstallStatus.DOWNLOADED) {
        // nothing: we assume Play restarts the app
    }
}`,
            good: `InstallStateUpdatedListener { state ->
    if (state.installStatus() == InstallStatus.DOWNLOADED) {
        showRestartSnackbar()   // action calls updates.completeUpdate()
    }
}`,
            why: 'For a flexible update Play does not restart the app. Until you call <code>completeUpdate()</code> the downloaded update just waits.',
          },
          {
            title: 'Immediate updates for every release',
            bad: `AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE)   // for a typo fix`,
            good: `val type = if (info.updatePriority() >= 4) AppUpdateType.IMMEDIATE else AppUpdateType.FLEXIBLE`,
            why: 'An immediate update blocks the app until it installs. Save it for releases the old version cannot live without, or users learn to cancel it.',
          },
        ],
        terms: [
          { term: 'Flexible update', def: 'An in-app update that downloads in the background while the app stays usable; you call completeUpdate() to install it.' },
          { term: 'Immediate update', def: 'A full-screen in-app update; Play installs it and restarts the app before the user can continue.' },
          { term: 'Update priority', def: 'A number from 0 to 5 set per release through the Play Developer API and read with updatePriority().' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a flexible update when Play allows it.', code: 'if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&\n    info.isUpdateTypeAllowed(AppUpdateType.[[FLEXIBLE]])) {\n    updates.[[startUpdateFlowForResult]](\n        info, launcher, AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build())\n}', why: 'Check that the type is allowed, then start the flow with the same type in <code>AppUpdateOptions</code>.' },
          { type: 'bug', prompt: 'The flexible update finishes downloading, the user taps Restart, and nothing happens. Tap the broken line.', code: 'fun showRestartSnackbar() {\n    Snackbar.make(root, "An update has just been downloaded.", Snackbar.LENGTH_INDEFINITE)\n        .setAction("RESTART") { updates.registerListener(listener) }\n        .show()\n}', bug: 2, fix: '        .setAction("RESTART") { updates.completeUpdate() }', why: '<code>completeUpdate()</code> is what installs a downloaded flexible update and restarts the app.' },
        ],
        quiz: [
          { q: 'Which flow lets the user keep using the app while the update downloads?', options: ['Immediate', 'Flexible', 'Both'], a: 1, why: 'Flexible updates download in the background. Immediate updates take over the screen.' },
          { q: 'After a flexible update reaches DOWNLOADED, what must the app do?', options: ['Nothing, Play restarts it', 'Call completeUpdate(), usually after the user taps Restart', 'Start an immediate update'], a: 1, why: 'Play does not restart the app for a flexible update. <code>completeUpdate()</code> installs it.' },
          { q: 'An immediate update was interrupted when the user left the app. What do you look for in onResume()?', options: ['UPDATE_NOT_<wbr>AVAILABLE', 'DEVELOPER_<wbr>TRIGGERED_<wbr>UPDATE_<wbr>IN_<wbr>PROGRESS', 'RESULT_<wbr>CANCELED'], a: 1, why: 'That availability value means an update your app started is still in progress, so you resume it.' },
        ],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'review',
        title: 'In-app reviews',
        tagline: 'Ask for a rating at a good moment, and accept that Play decides whether the card shows up.',
        level: 'beginner',
        body: `
<p>The Play In-App Review API shows the rating card inside your app, so users don't have to leave for the store. You call <code>requestReviewFlow()</code> to get a <code>ReviewInfo</code>, then <code>launchReviewFlow()</code> to hand control to Play.</p>
<p>Play enforces a quota on how often a user sees the card, and it does not publish the number. If you call the API again within a short time, often nothing appears. The API also never tells you whether the card showed or whether the user rated. The callback means only "the flow is over, carry on".</p>
<p>So ask after the user got value, such as finishing their fifth article, never behind a "Rate us" button, and never with a question like "Do you like the app?" first. A button may do nothing if the quota is used; for a button, open the Play Store listing instead.</p>`,
        visual(el) {
          // ponytail: the real quota is an undocumented Play detail; 30 days here is only for the demo
          const QUOTA = 30;
          let day = 1, lastShown = -999, busy = false;
          const ph = phone('Haberler');
          const log = h('div', { class: 'al-log', 'aria-live': 'polite' });
          const dayEl = h('b', {}, 'day 1');
          const o = out('');
          const line = (t, c) => { log.append(h('div', { class: c }, t)); while (log.children.length > 6) log.firstChild.remove(); };
          ph.body.append(...articles(5));
          async function flow(fromButton) {
            if (busy) return; busy = true;
            line('requestReviewFlow() → ReviewInfo');
            await sleep(350); if (!el.isConnected) return;
            line('launchReviewFlow(activity, info)');
            const shows = day - lastShown >= QUOTA;
            if (shows) {
              lastShown = day;
              await new Promise(res => ph.layer.replaceChildren(h('div', { class: 'al-sheet drop-in' },
                h('b', {}, 'Rate Haberler'), h('span', { class: 'al-stars', 'aria-hidden': 'true' }, '★★★★★'), h('span', { class: 'al-note' }, 'Play UI, not yours'),
                h('div', { class: 'al-row' }, h('button', { class: 'cmd', onclick: res }, 'Submit'), h('button', { class: 'cmd', onclick: res }, 'Not now')))));
              if (!el.isConnected) return;
              ph.layer.replaceChildren();
            } else {
              await sleep(400); if (!el.isConnected) return;
            }
            line('onComplete', 'al-c');
            say(o, fromButton && !shows
              ? '<span class="bad">The user tapped "Rate us" and nothing happened.</span> Your code got the same onComplete as always. For a button, link to the Play Store listing.'
              : shows ? 'The card showed. Your code got <b>onComplete</b> and cannot tell whether the user rated.'
                : 'Quota used, so Play showed nothing. Your code got the same <b>onComplete</b>. Continue the normal flow.');
            busy = false;
          }
          el.append(
            h('div', { class: 'controls' },
              act('reader finishes 5th article', () => flow(false)),
              act('+20 days', () => { day += 20; dayEl.textContent = `day ${day}`; replay(dayEl, 'pop'); }),
              act('“Rate us” button', () => flow(true))),
            h('div', { class: 'al-grid' }, ph.el, h('div', { class: 'al-card' }, h('div', { class: 'al-row' }, lbl('what your code sees'), dayEl), log)), o);
          say(o, 'Trigger the review at a good moment, then try again right away.');
        },
        code: `// app/build.gradle.kts
implementation("com.google.android.play:review:2.0.2")
implementation("com.google.android.play:review-ktx:2.0.2")

class ReviewPrompt(private val activity: Activity) {
    private val manager = ReviewManagerFactory.create(activity)

    // Call when the user just got value, e.g. after their 5th finished article
    fun maybeAsk(onDone: () -> Unit) {
        manager.requestReviewFlow().addOnCompleteListener { request ->
            if (!request.isSuccessful) { onDone(); return@addOnCompleteListener }
            manager.launchReviewFlow(activity, request.result).addOnCompleteListener {
                // No way to know if the card showed or if the user rated.
                onDone()
            }
        }
    }
}

// A "Rate us" item in Settings opens the store instead
fun openStoreListing(context: Context) {
    context.startActivity(Intent(Intent.ACTION_VIEW,
        Uri.parse("https://play.google.com/store/apps/details?id=\${context.packageName}")))
}`,
        remember: 'The review API may show nothing and never tells you what happened: call it at a good moment and carry on.',
        deeper: [
          {
            title: 'Request ahead, launch at the moment',
            body: `<p>A <code>ReviewInfo</code> is valid only for a limited time. You can request it a little ahead, for example when the reader reaches the end of the article, so the card appears without a delay when they tap "Next". Only do that when you are sure you will launch the flow.</p>`,
            code: `private var pending: ReviewInfo? = null

fun onArticleEndReached() {
    if (!shouldAsk()) return
    manager.requestReviewFlow().addOnSuccessListener { pending = it }
}

fun onNextTapped() {
    val info = pending ?: return goNext()
    pending = null
    manager.launchReviewFlow(activity, info).addOnCompleteListener { goNext() }
}`,
          },
          {
            title: 'Leave the card alone',
            body: `<p>Play's design rules for the card: show it as it is, with no overlay around it and nothing that changes its size or look, and don't remove it from code once it's up. Don't ask anything before or during the card, neither "Do you like the app?" nor "Would you give us 5 stars?". Filtering unhappy users away from the card is exactly what that rule forbids.</p>`,
          },
        ],
        mistakes: [
          {
            title: 'A "Rate us" button that calls the API',
            bad: `RateButton(onClick = { reviewPrompt.maybeAsk { } })   // may do nothing at all`,
            good: `RateButton(onClick = { openStoreListing(context) })   // always opens something`,
            why: 'If the user already hit the quota, the review flow shows nothing and the tap seems broken. A button should open the store listing.',
          },
          {
            title: 'Waiting for a result that never comes',
            bad: `manager.launchReviewFlow(activity, info).addOnCompleteListener {
    if (userRated) unlockBadge()   // there is no such information
}`,
            good: `manager.launchReviewFlow(activity, info).addOnCompleteListener {
    goNext()   // same path every time
}`,
            why: 'The API does not report whether the card showed or whether the user rated. Never reward a rating or branch on it.',
          },
        ],
        terms: [
          { term: 'ReviewInfo', def: 'A short-lived token from requestReviewFlow() that you pass to launchReviewFlow().' },
          { term: 'Review quota', def: 'Play’s undocumented, time-bound limit on how often one user can see the review card.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Get a ReviewInfo, then hand it to Play.', code: 'manager.[[requestReviewFlow]]().addOnSuccessListener { info ->\n    manager.[[launchReviewFlow]](activity, info).addOnCompleteListener { goNext() }\n}', why: 'The first call prepares the flow and returns a <code>ReviewInfo</code>. The second one shows the card, if Play decides to.' },
          { type: 'bug', prompt: 'This code breaks Play’s rules for the review card. Tap the line.', code: 'fun onFifthArticle() {\n    showDialog("Do you like Haberler?") { liked ->\n        if (liked) reviewPrompt.maybeAsk { goNext() }\n    }\n}', bug: 1, fix: '    reviewPrompt.maybeAsk { goNext() }', why: 'Asking a question before the card and showing it only to happy users is not allowed. Call the flow directly at a good moment.' },
        ],
        quiz: [
          { q: 'launchReviewFlow completed. What do you know?', options: ['The user rated the app', 'The card was shown', 'Only that the flow is over'], a: 2, why: 'The API does not say whether the card appeared or whether a rating was given. Continue your normal flow.' },
          { q: 'Where should a "Rate us" item in Settings lead?', options: ['launchReviewFlow()', 'The app’s Play Store listing', 'A custom 5-star dialog'], a: 1, why: 'The quota can make the review API show nothing. A button the user taps must always do something visible.' },
        ],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'billing',
        title: 'Play Billing',
        tagline: 'Connect, load products, launch the purchase, verify on your server, then acknowledge within three days.',
        level: 'advanced',
        body: `
<p>Digital goods sold in a Play app go through Google Play Billing. The current library is version 9 (9.1.0), and new apps and updates must use version 8 or later since August 31, 2026 (with an extension possible to November 1, 2026). There are two kinds of products: <b>one-time products</b> (consumable like coins, or permanent like "remove ads") and <b>subscriptions</b> with base plans and offers.</p>
<p>The flow: a <code>BillingClient</code> connects to Play, you query <code>ProductDetails</code>, and <code>launchBillingFlow()</code> opens Play's purchase sheet. The result arrives in <code>onPurchasesUpdated()</code>. A purchase can be <code>PURCHASED</code> or <code>PENDING</code>, for example when the user pays with cash at a store. Grant nothing while it is pending.</p>
<p>Then send the purchase token to your server, verify it with the Play Developer API, grant the content, and <b>acknowledge</b>. A purchase not acknowledged within three days is refunded automatically and the entitlement is revoked. Walk through it, and try forgetting the last step.</p>`,
        visual(el) {
          const NAMES = ['disconnected', 'connected', 'products loaded', 'purchase sheet', 'PENDING', 'PURCHASED', 'verified + granted', 'acknowledged'];
          const IDX = Object.fromEntries(NAMES.map((n, i) => [n, i]));
          let s = 'disconnected', pending = false, day = -1, busy = false, refunded = false;
          const chips = NAMES.map(n => h('span', { class: 'al-state' }, n));
          const sm = h('div', { class: 'al-sm' }, chips.flatMap((c, i) => i ? [h('span', { class: 'al-arrow', 'aria-hidden': 'true' }, '→'), c] : [c]));
          const days = [0, 1, 2, 3].map(d => h('span', { class: 'al-day' }, `day ${d}`));
          const o = out('');
          const paint = () => {
            const cur = IDX[s];
            chips.forEach((c, i) => {
              c.className = 'al-state';
              if (i === IDX.PENDING && !pending) return;
              if (i < cur) c.classList.add('al-done');
              if (i === cur) c.classList.add(s === 'PENDING' ? 'al-wait' : 'al-now');
            });
            if (refunded) { chips[IDX.acknowledged].classList.add('al-bad'); chips[IDX.acknowledged].textContent = 'refunded'; }
            days.forEach((d, i) => { d.className = 'al-day'; if (day >= 0 && i <= day) d.classList.add(i === 3 && refunded ? 'al-dead' : 'al-past'); });
            replay(chips[cur], 'pop');
          };
          const go = (to, html) => { s = to; paint(); say(o, html); };
          const need = (st, msg) => { if (s !== st || busy || refunded) { if (!busy && !refunded) say(o, msg); return false; } return true; };
          const steps = [
            act('startConnection()', () => { if (need('disconnected', 'Already connected.')) go('connected', 'Connected to Play. With <b>enableAutoServiceReconnection()</b> the library reconnects for you if the service drops.'); }),
            act('queryProductDetails', () => { if (need('connected', 'Connect first.')) go('products loaded', 'Got <b>reklamsiz_aylik</b> (ad-free, monthly) with its price and offer token, formatted by Play for the user’s country.'); }),
            act('buy: card', async () => {
              if (!need('products loaded', 'Load the product first.')) return; busy = true;
              go('purchase sheet', 'Play shows its purchase sheet. Your app waits.'); await sleep(900); if (!el.isConnected) return;
              busy = false; day = 0; go('PURCHASED', 'onPurchasesUpdated: OK, state <b>PURCHASED</b>. The three-day acknowledge clock starts now.');
            }),
            act('buy: cash at a store', async () => {
              if (!need('products loaded', 'Load the product first.')) return; busy = true; pending = true;
              go('purchase sheet', 'Play shows its purchase sheet. The user picks a cash payment.'); await sleep(900); if (!el.isConnected) return;
              busy = false; go('PENDING', 'State <b>PENDING</b>: no money yet. Grant nothing and do not acknowledge.');
            }),
            act('cash paid', () => { if (need('PENDING', 'Nothing is pending.')) { day = 0; go('PURCHASED', 'The payment cleared, the purchase is <b>PURCHASED</b>. The three-day clock starts now.'); } }),
            act('server: verify, grant, acknowledge', async () => {
              if (!need('PURCHASED', s === 'PENDING' ? 'Still pending: wait for PURCHASED.' : 'There is no purchased item to process.')) return; busy = true;
              go('verified + granted', 'Your server checked the token with <b>purchases.subscriptionsv2.get</b>, saw it was never used before, and unlocked ad-free reading.'); await sleep(900); if (!el.isConnected) return;
              busy = false; go('acknowledged', '<span class="good">Acknowledged.</span> The purchase is final. Renewals of this subscription don’t need acknowledging.');
            }),
            act('forget to acknowledge: +1 day', () => {
              if (refunded || busy) return;
              if (s !== 'PURCHASED' && s !== 'verified + granted') { say(o, 'The clock only runs for a PURCHASED item that is not acknowledged.'); return; }
              day = Math.min(3, day + 1);
              if (day === 3) { refunded = true; s = 'acknowledged'; paint(); say(o, '<span class="bad">Day 3, never acknowledged:</span> Play refunds the user and revokes the entitlement.'); return; }
              paint(); say(o, `Day ${day}. Still not acknowledged.`);
            }),
          ];
          el.append(h('div', { class: 'controls' }, steps), sm, h('div', { class: 'al-row' }, lbl('acknowledge window')), h('div', { class: 'al-days' }, days), o);
          paint(); say(o, 'Start with the connection.');
        },
        code: `// app/build.gradle.kts
implementation("com.android.billingclient:billing-ktx:9.1.0")

class BillingRepository(
    context: Context,
    private val backend: BackendApi,
    private val scope: CoroutineScope,
) : PurchasesUpdatedListener {

    private val client = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .build()

    fun connect() = client.startConnection(object : BillingClientStateListener {
        override fun onBillingSetupFinished(result: BillingResult) {
            if (result.responseCode == BillingResponseCode.OK) restorePurchases()
        }
        override fun onBillingServiceDisconnected() { /* auto reconnection handles it */ }
    })

    fun loadAdFree(onLoaded: (ProductDetails) -> Unit) {
        val params = QueryProductDetailsParams.newBuilder().setProductList(listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("reklamsiz_aylik")
                .setProductType(ProductType.SUBS)
                .build()
        )).build()
        client.queryProductDetailsAsync(params) { result, details ->
            if (result.responseCode == BillingResponseCode.OK) details.productDetailsList.firstOrNull()?.let(onLoaded)
        }
    }

    fun buy(activity: Activity, product: ProductDetails, accountHash: String) {
        val offer = product.subscriptionOfferDetails?.firstOrNull() ?: return
        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(product)
                    .setOfferToken(offer.offerToken)
                    .build()
            ))
            .setObfuscatedAccountId(accountHash)   // helps Play spot fraud
            .build()
        client.launchBillingFlow(activity, params)
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: List<Purchase>?) {
        when (result.responseCode) {
            BillingResponseCode.OK -> purchases.orEmpty().forEach(::handle)
            BillingResponseCode.USER_CANCELED -> Unit
            else -> Log.w("Billing", result.debugMessage)
        }
    }

    private fun handle(purchase: Purchase) {
        if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) return   // PENDING: wait
        // The server verifies the token with the Play Developer API, grants, then acknowledges
        scope.launch { backend.verifyAndAcknowledge(purchase.purchaseToken, purchase.products) }
    }

    private fun restorePurchases() {
        val params = QueryPurchasesParams.newBuilder().setProductType(ProductType.SUBS).build()
        client.queryPurchasesAsync(params) { _, list -> list.forEach(::handle) }
    }
}`,
        remember: 'Grant only PURCHASED, verify on your server, acknowledge within three days, and check queryPurchasesAsync() on every start.',
        deeper: [
          {
            title: 'Purchases that arrive while you are not looking',
            body: `<p><code>onPurchasesUpdated()</code> only fires while your app has an open connection. A purchase can finish when the app is closed: a pending cash payment clears, the user buys on another device, or the network drops mid-purchase. Call <code>queryPurchasesAsync()</code> after connecting and again in <code>onResume()</code>, and process whatever it returns with the same code path.</p>
<p>On the server, real-time developer notifications tell your backend about these changes even when no app is open.</p>`,
          },
          {
            title: 'Verify on the server, by token',
            body: `<p>A cracked client can fake a purchase, so the server decides. It stores every <code>purchaseToken</code> (it is globally unique, so it can be the primary key), refuses a token it has already seen, and asks Google for the real state with <code>purchases.products.get</code> or <code>purchases.subscriptionsv2.get</code>. If you set an obfuscated account ID, check that it matches the user who is asking.</p>
<p>Do not use <code>orderId</code> as a key: not every purchase has one. If verification fails, refund and revoke through the API instead of waiting for the three-day auto-refund.</p>`,
            code: `// Server side, in pseudo-Kotlin
fun verifyAndAcknowledge(token: String, userId: String) {
    if (purchases.exists(token)) return reject("token already used")
    val sub = playApi.purchases().subscriptionsv2().get(PACKAGE, token).execute()
    if (!sub.isActive() || sub.externalAccountId() != hash(userId)) return reject("not valid for this user")
    purchases.save(token, userId)
    entitlements.grant(userId, "ad_free")
    playApi.purchases().subscriptions().acknowledge(PACKAGE, SUB_ID, token, AckRequest()).execute()
}`,
          },
          {
            title: 'Consumables: consume instead of acknowledge',
            body: `<p>Coins and other things a user can buy again are <em>consumed</em>. Consuming also counts as acknowledging, and it makes the product available to buy again. Permanent one-time products and the first purchase of a subscription are acknowledged instead. Subscription renewals need no acknowledgement.</p>
<p>A consume call can fail, so the server must still check that the token was not already used before granting coins.</p>`,
            code: `// Client-side fallback when you have no backend for consumables (prefer the server)
val result = client.consumePurchase(
    ConsumeParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
)
if (result.billingResult.responseCode == BillingResponseCode.OK) wallet.add(100)`,
          },
        ],
        underHood: {
          body: `<p><code>BillingClient</code> does not talk to Google's servers itself. It binds to a service inside the Play Store app on the device, which owns the account, the payment methods and the purchase sheet. That is why the connection can drop (the Play Store updates itself, for example) and why the library offers automatic reconnection. It is also why one active <code>BillingClient</code> per app is recommended: two connections can both receive the same <code>onPurchasesUpdated</code> event.</p>`,
        },
        mistakes: [
          {
            title: 'Granting a pending purchase',
            bad: `purchases.forEach { p ->
    entitlements.grant("ad_free")   // even when the state is PENDING
}`,
            good: `purchases.filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
    .forEach { backend.verifyAndAcknowledge(it.purchaseToken, it.products) }`,
            why: 'A pending purchase has not been paid yet and may be cancelled. Grant and acknowledge only when the state is PURCHASED.',
          },
          {
            title: 'Trusting the client',
            bad: `override fun onPurchasesUpdated(result: BillingResult, list: List<Purchase>?) {
    if (result.responseCode == BillingResponseCode.OK) prefs.edit { putBoolean("premium", true) }
}`,
            good: `override fun onPurchasesUpdated(result: BillingResult, list: List<Purchase>?) {
    if (result.responseCode == BillingResponseCode.OK) list.orEmpty().forEach(::handle)   // server verifies
}`,
            why: 'A flag in local storage is easy to fake and never gets acknowledged, so real buyers are refunded after three days. Send the token to the server.',
          },
        ],
        terms: [
          { term: 'Purchase token', def: 'The globally unique string that identifies one purchase; your server stores it and verifies it with Google.' },
          { term: 'Acknowledge', def: 'Telling Play you granted the purchase. Without it, Play refunds the purchase after three days.' },
          { term: 'Pending purchase', def: 'A purchase waiting for payment, such as cash at a store. Grant nothing until it becomes PURCHASED.' },
          { term: 'Consume', def: 'Marking a one-time product as used so it can be bought again; it also acknowledges the purchase.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Only handle purchases that are paid for and not yet acknowledged.', code: 'if (purchase.purchaseState == Purchase.PurchaseState.[[PURCHASED]] &&\n    !purchase.[[isAcknowledged]]) {\n    backend.verifyAndAcknowledge(purchase.purchaseToken, purchase.products)\n}', why: 'PENDING purchases wait. Already acknowledged ones were handled before, for example on another launch.' },
          { type: 'bug', prompt: 'Users who pay with cash get ad-free reading and then get refunded three days later. Tap the line to fix.', code: 'private fun handle(purchase: Purchase) {\n    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {\n        backend.verifyAndAcknowledge(purchase.purchaseToken, purchase.products)\n    }\n    entitlements.grant("ad_free")\n}', bug: 4, fix: '    // the server grants after verifying; nothing here', why: 'The grant runs for PENDING purchases too, which are never acknowledged in time. Grant only after the server verifies a PURCHASED item.' },
        ],
        quiz: [
          { q: 'What happens to a purchase that is never acknowledged?', options: ['Nothing', 'Play refunds it after three days and revokes the entitlement', 'It is acknowledged automatically'], a: 1, why: 'Unacknowledged purchases are refunded automatically after three days.' },
          { q: 'The purchase state is PENDING. What should the app do?', options: ['Grant and acknowledge', 'Grant, but acknowledge later', 'Wait until it becomes PURCHASED'], a: 2, why: 'Pending means no money has moved yet. Grant and acknowledge only once it is PURCHASED.' },
          { q: 'Which value makes a good primary key for purchases in your database?', options: ['orderId', 'purchaseToken', 'productId'], a: 1, why: 'The purchase token is globally unique. Not every purchase has an orderId.' },
        ],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'policy',
        title: 'Play policy essentials',
        tagline: 'A few rules decide whether Play accepts your next update: target API level, the Data safety form, the billing library, and a verified developer.',
        level: 'beginner',
        body: `
<p>Play rejects or limits apps for reasons that have nothing to do with code quality. Three of them come up on every release.</p>
<p><b>Target API level.</b> Since August 31, 2026, new apps and app updates must target Android 16 (API 36); Wear OS and Android Automotive OS apps need API 35, and Android TV and XR apps need API 34. You can ask for an extension to November 1, 2026. Existing apps that don't update must target at least API 35 to stay visible to new users on newer Android versions.</p>
<p><b>Data safety.</b> Every app on Play fills in the Data safety form, even an app that collects nothing. It covers data your code and your third-party SDKs (Crashlytics, Analytics, ads) send off the device. You alone are responsible for its accuracy, and a wrong form can lead to blocked updates or removal.</p>
<p><b>Developer verification.</b> Android is rolling out a rule that apps on certified devices come from a registered, verified developer. Protections started on September 30, 2026 in Brazil, Indonesia, Singapore and Thailand and expand globally in 2027. Play registers most Play apps automatically; developers who distribute only outside Play register in the Android Developer Console.</p>`,
        visual(el) {
          let target = 35, when = 'sep', billing = 'none', safety = true;
          const DATES = { sep: 'Sep 15, 2026', ext: 'Sep 15, 2026, extensions granted', nov: 'Nov 2, 2026' };
          const checks = h('div', { class: 'al-checks' });
          const o = out('');
          const row = (ok, text) => h('div', { class: `al-check ${ok ? 'al-pass' : 'al-fail'}` }, h('span', {}, text), pill(ok ? 'ok' : 'blocked', ok ? 'al-ok' : 'al-err'));
          const paint = () => {
            const ext = when === 'ext';
            const needT = ext ? 35 : 36;
            const tOk = target >= needT;
            const bOk = billing === 'none' || billing === '9' || (billing === '7' && ext);
            checks.replaceChildren(
              row(tOk, `targetSdk ${target}: ${ext ? 'extension until Nov 1, 2026' : 'API 36 required for new apps and updates'}`),
              row(bOk, billing === 'none' ? 'No in-app purchases: billing rule does not apply' : `Billing Library ${billing === '9' ? '9.1.0' : '7.1.1'}: ${ext ? 'extension until Nov 1, 2026' : 'version 8 or later required'}`),
              row(safety, safety ? 'Data safety form matches what the app and its SDKs send' : 'Data safety form says "no data collected", but Crashlytics and Analytics send data'));
            const all = tOk && bOk && safety;
            say(o, all ? `<span class="good">This update can go out</span> on ${DATES[when]}.` : `<span class="bad">Fix the red rows</span> before you submit on ${DATES[when]}.`);
            [...checks.children].forEach((c, i) => { c.style.animationDelay = `${i * 80}ms`; c.classList.add('drop-in'); });
          };
          const group = (opts, get, set) => {
            const btns = opts.map(([v, label]) => act(label, () => { set(v); press(btns, btns[opts.findIndex(x => x[0] === v)]); paint(); }));
            press(btns, btns[opts.findIndex(x => x[0] === get())]);
            return btns;
          };
          const tBtns = group([[34, 'targetSdk 34'], [35, 'targetSdk 35'], [36, 'targetSdk 36']], () => target, v => { target = v; });
          const dBtns = group([['sep', 'Sep 15'], ['ext', 'Sep 15 + extensions'], ['nov', 'Nov 2']], () => when, v => { when = v; });
          const bBtns = group([['none', 'no billing'], ['7', 'Billing 7.1.1'], ['9', 'Billing 9.1.0']], () => billing, v => { billing = v; });
          const sBtn = act('Data safety up to date', () => { safety = !safety; sBtn.setAttribute('aria-pressed', String(safety)); paint(); });
          sBtn.setAttribute('aria-pressed', 'true');
          // Developer verification milestones from developer.android.com/developer-verification
          const MILES = [
            ['2026-08-01', 'August 2026', 'Developer APIs, limited distribution accounts and the advanced flow for power users launch.'],
            ['2026-09-30', 'September 30, 2026', 'Protections start for installs from participating stores in Brazil, Indonesia, Singapore and Thailand, on certified devices running Android 7+.'],
            ['2027-01-01', '2027', 'Verification expands globally for all apps on certified devices.'],
          ];
          const now = Date.now();
          const time = h('div', { class: 'al-time' }, MILES.map(([d, t, x]) => h('div', { class: `al-tick${now >= Date.parse(d) ? ' al-past' : ''}` }, h('b', {}, t), h('span', { class: 'al-note' }, x))));
          el.append(
            lbl('Will Play accept this update?'),
            h('div', { class: 'controls' }, dBtns), h('div', { class: 'controls' }, tBtns), h('div', { class: 'controls' }, bBtns, sBtn),
            checks, o,
            h('div', { class: 'al-card' }, lbl('Developer verification timeline'), time));
          paint();
        },
        code: `// app/build.gradle.kts
android {
    compileSdk = 36
    defaultConfig {
        applicationId = "tr.example.haber"
        minSdk = 24
        targetSdk = 36          // required for new apps and updates since Aug 31, 2026
        versionCode = 240
        versionName = "2.4"
    }
}

dependencies {
    implementation("com.android.billingclient:billing-ktx:9.1.0")   // 8+ required since Aug 31, 2026
}`,
        remember: 'Before each release: targetSdk meets this year’s rule, the billing library is current, and the Data safety form matches every SDK you added.',
        deeper: [
          {
            title: 'Raising targetSdk is a code change',
            body: `<p>Changing <code>targetSdk</code> opts the app into the behavior changes of that Android version. Read the behavior changes page for the new version, test on a device running it, and only then ship. The number in Gradle is the easy part.</p>
<p>The deadline comes every year around August 31. Plan the bump for early summer so the extension stays a backup, not the plan.</p>`,
          },
          {
            title: 'Filling the Data safety form',
            body: `<p><em>Collected</em> means data leaves the device. <em>Shared</em> means it goes to a third party; a service provider that processes data only for you generally doesn't count as sharing. Data handled only in memory for one request (ephemeral) is still declared in the form, but it isn't shown on the listing.</p>
<p>List every SDK and check its published Data safety guidance. Each new SDK is a reason to revisit the form. You also say whether users can ask for their data to be deleted; Play doesn't prescribe how, so an in-app option, a form or an email address can work.</p>`,
          },
          {
            title: 'What developer verification asks of you',
            body: `<p>For Play apps, Play registers the vast majority automatically; Play Console lets you register the rest and any apps you also ship outside Play. Developers who ship only outside Play use the Android Developer Console. Students and hobbyists can use limited distribution accounts to share apps with up to 20 devices without an ID or registration fee.</p>
<p>The rules are rolling out by region, so check the official page before each release season.</p>`,
          },
        ],
        mistakes: [
          {
            title: 'Bumping targetSdk without testing',
            bad: `targetSdk = 36   // changed the night before the deadline`,
            good: `targetSdk = 36   // after reading the Android 16 behavior changes and testing on Android 16`,
            why: 'A higher target turns on new platform behavior for your app. Untested, that can become a crash spike right after release.',
          },
          {
            title: 'Forgetting the SDKs in the Data safety form',
            bad: `// Data safety: "No data collected"
implementation("com.google.firebase:firebase-crashlytics")
implementation("com.google.firebase:firebase-analytics")`,
            good: `// Data safety: crash logs, diagnostics and app interactions declared,
// matching what Crashlytics and Analytics send`,
            why: 'Data sent by third-party SDKs counts as your app’s data. A form that leaves them out is inaccurate, and you are responsible for it.',
          },
        ],
        terms: [
          { term: 'targetSdk', def: 'The Android version your app says it was built and tested for; it opts the app into that version’s behavior changes.' },
          { term: 'Data safety form', def: 'The Play Console declaration of what user data your app and its SDKs collect and share, shown on the store listing.' },
          { term: 'Developer verification', def: 'Android’s requirement that apps on certified devices come from a registered, verified developer.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this phone app ready for an update submitted in late 2026.', code: 'defaultConfig {\n    minSdk = 24\n    targetSdk = [[36]]\n}', why: 'Since August 31, 2026, new apps and updates for phones must target Android 16, API 36 (with an extension possible to November 1).' },
          { type: 'bug', prompt: 'Play blocks this update in October 2026 (no extension). Tap the line that causes it.', code: 'android {\n    compileSdk = 36\n    defaultConfig {\n        minSdk = 24\n        targetSdk = 35\n    }\n}', bug: 4, fix: '        targetSdk = 36', why: 'Updates submitted after August 31, 2026 must target API 36 unless an extension to November 1 was granted.' },
        ],
        quiz: [
          { q: 'Your app collects no user data at all. Do you need to fill in the Data safety form?', options: ['No', 'Yes, every app on Play does', 'Only if it has ads'], a: 1, why: 'All apps published on Google Play must complete the form, even when the answer is "no data collected".' },
          { q: 'Crashlytics sends crash logs from your app. Whose data is that in the Data safety form?', options: ['Google’s, so you skip it', 'Your app’s, so you declare it', 'Nobody’s, crash logs are exempt'], a: 1, why: 'Data collected through third-party SDKs in your app counts as your app’s data.' },
          { q: 'Since August 31, 2026, which Play Billing Library versions can new apps and updates use?', options: ['Any version', 'Version 8 or later', 'Only version 9.1.0'], a: 1, why: 'Version 8 or later is required (extension possible to November 1, 2026). 9.1.0 is simply the latest.' },
        ],
      },
    ],
  });
})();
