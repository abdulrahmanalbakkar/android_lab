/* Android Studio and debugging track. Same shape as tracks/kotlin.js.
   The daily tools: the IDE, Logcat, the debugger, Layout Inspector, adb, lint and CI.
   Every demo is a simulation of the real tool, built from the names on developer.android.com/studio.
   Demo styles live in the css string below; every class is prefixed tl-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const cmdk = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const label = t => h('span', { class: 'tl-label' }, t);

  const css = `
.tl-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.tl-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.tl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; min-width: 0; }
.tl-panel { display: grid; gap: 2px; align-content: start; background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 10px; min-width: 0; overflow-x: auto; font: 500 0.78rem/1.55 var(--mono); }
.tl-panel-h { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: space-between; font: 700 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--t-c); padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.tl-ln { white-space: pre; padding: 0 6px; border-radius: 5px; border: 1px solid transparent; transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.tl-ln.tl-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
.tl-ln.tl-cur { background: rgba(255, 212, 121, 0.16); border-color: var(--t-s); }
.tl-ln.tl-errl { text-decoration: underline wavy var(--t-e); text-underline-offset: 3px; }
.tl-ln.tl-dim { opacity: 0.4; }
.tl-ln.tl-new { background: rgba(126, 226, 168, 0.12); }
.tl-pill { font: 600 0.74rem var(--mono); padding: 3px 9px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: background 0.25s, border-color 0.25s; }
.tl-pill.tl-ok { border-color: var(--ok); background: var(--ok-soft); }
.tl-pill.tl-err { border-color: var(--err); background: var(--err-soft); }
.tl-pill.tl-warn { border-color: var(--warm); background: var(--warm-soft); }
.tl-pill.tl-acc { border-color: var(--accent); background: var(--accent-soft); }
.tl-pill.tl-ghost { border-style: dashed; color: var(--muted); background: transparent; }

/* 1 studio */
.tl-ide { display: grid; gap: 10px; min-width: 0; }
.tl-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px; border-radius: 12px; background: var(--sunk); min-width: 0; }
.tl-tree .tl-ln { cursor: default; }
.tl-tree .tl-dir { color: var(--t-t); }
.tl-tree .tl-grp { color: var(--t-f); }
.tl-banner { font: 600 0.78rem var(--mono); padding: 8px 10px; border-radius: 10px; background: var(--warm-soft); border: 1.5px solid var(--warm); color: var(--ink); overflow-wrap: anywhere; }
.tl-banner[hidden] { display: none; }
.tl-keys { display: grid; gap: 6px; min-width: 0; }
.tl-key { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 10px; background: var(--bg); border: 1.5px solid var(--line); min-width: 0; }
.tl-key span { overflow-wrap: anywhere; min-width: 0; }

/* 2 logcat */
.tl-q { display: flex; gap: 6px; align-items: center; min-width: 0; padding: 6px 10px; border-radius: 10px; background: var(--code-bg); border: 1.5px solid var(--line); }
.tl-q:focus-within { border-color: var(--accent); }
.tl-q b { font: 700 0.8rem var(--mono); color: var(--t-c); }
.tl-q input { flex: 1; min-width: 0; font: 500 0.82rem var(--mono); background: transparent; border: 0; color: var(--code-ink); outline: none; }
.tl-log { display: grid; grid-template-columns: auto auto minmax(0, 1fr); gap: 0 8px; align-items: baseline; padding: 1px 4px; border-radius: 5px; }
.tl-log .tl-lv { font-weight: 800; width: 1.4em; text-align: center; border-radius: 4px; }
.tl-log .tl-tg { color: var(--t-t); white-space: nowrap; }
.tl-log .tl-ms { overflow-wrap: anywhere; min-width: 0; }
.tl-log .tl-pk { color: var(--t-c); }
.tl-lv-V, .tl-lv-D { color: var(--t-c); }
.tl-lv-I { color: var(--t-k); }
.tl-lv-W { color: var(--t-s); }
.tl-lv-E, .tl-lv-A { color: var(--t-e); }
.tl-log.tl-lv-E .tl-ms, .tl-log.tl-lv-A .tl-ms { color: var(--t-e); }
.tl-log.tl-pii { box-shadow: inset 3px 0 0 var(--t-e); }
.tl-count { font: 600 0.78rem var(--mono); color: var(--muted); }
.tl-count b { color: var(--ink); }

/* 3 debugger */
.tl-src .tl-ln { display: grid; grid-template-columns: 1.6em 1.8em minmax(0, 1fr); align-items: center; padding: 0 4px; }
.tl-gut { all: unset; cursor: pointer; width: 1.1em; height: 1.1em; border-radius: 50%; display: inline-grid; place-items: center; }
.tl-gut::after { content: ""; width: 0.7em; height: 0.7em; border-radius: 50%; border: 1px dashed rgba(255,255,255,0.18); }
.tl-gut.tl-bp::after { background: var(--t-e); border: 0; }
.tl-gut.tl-bp.tl-cond::after { background: var(--t-s); }
.tl-gut:focus-visible { outline: 2px solid var(--t-t); }
.tl-no { color: var(--t-c); text-align: right; padding-right: 6px; }
.tl-src .tl-ln.tl-cur .tl-no { color: var(--t-s); }
.tl-vars .tl-v { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px; padding: 1px 6px; border-radius: 5px; }
.tl-vars .tl-v b { color: var(--t-f); font-weight: 600; }
.tl-vars .tl-v span { overflow-wrap: anywhere; min-width: 0; }
.tl-vars .tl-v.tl-chg { background: rgba(126, 226, 168, 0.14); }
.tl-frame { padding: 1px 6px; border-radius: 5px; }
.tl-frame.tl-top { background: rgba(124, 200, 245, 0.14); }

/* 4 layout inspector */
.tl-phone { width: 210px; max-width: 100%; justify-self: center; border-radius: 26px; border: 7px solid var(--code-bg); background: var(--bg); padding: 12px 10px; display: grid; gap: 6px; align-content: start; min-height: 260px; }
.tl-ui { position: relative; padding: 7px 9px; border-radius: 9px; background: var(--surface); border: 1.5px solid var(--line); font: 600 0.78rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.tl-ui.tl-top { background: var(--accent-soft); border-color: var(--accent); }
.tl-ui.tl-sub { margin-left: 10px; font-weight: 500; }
.tl-ui::after { content: ""; position: absolute; inset: -1.5px; border-radius: 9px; background: var(--warm); opacity: 0; pointer-events: none; }
.tl-ui.tl-flash::after { animation: tl-flash 1.1s ease-out; }
@keyframes tl-flash { from { opacity: 0.55; } to { opacity: 0; } }
.tl-ct { display: grid; gap: 2px; min-width: 0; }
.tl-ct-row { display: grid; grid-template-columns: minmax(0, 1fr) 3.2em 3.2em; gap: 6px; align-items: center; padding: 2px 6px; border-radius: 5px; }
.tl-ct-row span:first-child { overflow-wrap: anywhere; min-width: 0; }
.tl-ct-row .tl-n { text-align: right; font-variant-numeric: tabular-nums; }
.tl-ct-row .tl-n.tl-up { color: var(--t-s); font-weight: 800; }
.tl-ct-row .tl-n.tl-sk { color: var(--t-k); font-weight: 800; }
.tl-ct-head { color: var(--t-c); font-size: 0.68rem; text-transform: uppercase; }

/* 5 adb */
.tl-term { min-height: 180px; max-height: 300px; overflow-y: auto; }
.tl-term .tl-ln { white-space: pre-wrap; overflow-wrap: anywhere; }
.tl-term .tl-ps { color: var(--t-k); }
.tl-term .tl-er { color: var(--t-e); }
.tl-term .tl-nt { color: var(--t-c); }
.tl-cmds { display: grid; gap: 6px; min-width: 0; }
.tl-cmds .cmd { text-align: left; white-space: normal; overflow-wrap: anywhere; }
.tl-dev { display: grid; gap: 8px; align-content: start; min-width: 0; }
.tl-scr { min-height: 120px; display: grid; gap: 6px; align-content: start; }
.tl-scr.tl-off { place-content: center; color: var(--muted); font: 600 0.78rem var(--mono); text-align: center; }
.tl-rec { justify-self: end; font: 800 0.66rem var(--mono); color: var(--err); }
.tl-rec[hidden] { display: none; }

/* 6 lint */
.tl-issue { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 8px; align-items: start; padding: 6px 8px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--bg); min-width: 0; transition: opacity 0.25s; }
.tl-issue .tl-msg { font: 500 0.78rem/1.45 var(--mono); overflow-wrap: anywhere; min-width: 0; }
.tl-issue.tl-base { opacity: 0.5; }
.tl-issue.tl-base .tl-msg { text-decoration: line-through; }
.tl-issues { display: grid; gap: 6px; min-width: 0; }

/* 7 ci */
.tl-pipe { display: grid; gap: 6px; min-width: 0; }
.tl-step { display: grid; grid-template-columns: 1.6em minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 7px 10px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--bg); font: 600 0.8rem var(--mono); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.tl-step span:nth-child(2) { overflow-wrap: anywhere; min-width: 0; }
.tl-step .tl-dot { width: 0.9em; height: 0.9em; border-radius: 50%; background: var(--sunk); border: 2px solid var(--line); justify-self: center; }
.tl-step.tl-run { border-color: var(--accent); background: var(--accent-soft); }
.tl-step.tl-run .tl-dot { border-color: var(--accent); border-top-color: transparent; animation: spin 0.7s linear infinite; }
.tl-step.tl-pass { border-color: var(--ok); }
.tl-step.tl-pass .tl-dot { background: var(--ok); border-color: var(--ok); }
.tl-step.tl-fail { border-color: var(--err); background: var(--err-soft); }
.tl-step.tl-fail .tl-dot { background: var(--err); border-color: var(--err); }
.tl-step.tl-skip { opacity: 0.45; }
.tl-step .tl-t { color: var(--muted); font-variant-numeric: tabular-nums; }
.tl-check { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); font: 600 0.82rem var(--mono); min-width: 0; }
.tl-check.tl-ok { border-color: var(--ok); }
.tl-check.tl-err { border-color: var(--err); }
.tl-check span { overflow-wrap: anywhere; min-width: 0; }
`;

  // ───────────── shared data for the Logcat lesson ─────────────
  const MINE = 'com.mynet.haber';
  const LOGS = [
    { pk: 'system_server', tg: 'ActivityManager', lv: 'I', ms: `Start proc 12345:${MINE}/u0a210 for top-activity` },
    { pk: MINE, tg: 'MainActivity', lv: 'D', ms: 'onCreate savedInstanceState=null' },
    { pk: MINE, tg: 'OkHttp', lv: 'D', ms: '--> GET https://api.example.com/v1/feed?page=1' },
    { pk: MINE, tg: 'OkHttp', lv: 'D', ms: '<-- 200 OK (412ms)' },
    { pk: MINE, tg: 'FeedRepository', lv: 'I', ms: 'loaded 20 items from network in 412ms' },
    { pk: 'com.google.android.gms', tg: 'GmsClient', lv: 'W', ms: 'Connection to service timed out, retrying' },
    { pk: MINE, tg: 'AuthManager', lv: 'D', ms: 'refresh token=eyJhbGciOiJIUzI1NiJ9.x9f… user=ayse@example.com', pii: true },
    { pk: MINE, tg: 'FeedViewModel', lv: 'W', ms: 'image cache full, evicting 12 entries' },
    { pk: MINE, tg: 'AuthManager', lv: 'I', ms: 'session refreshed' },
    { pk: 'system_server', tg: 'WindowManager', lv: 'V', ms: 'Relayout Window{a1b2 com.mynet.haber/.MainActivity}' },
    { pk: MINE, tg: 'FeedViewModel', lv: 'E', ms: 'parse failed for item id=42: missing "title"' },
    { pk: MINE, tg: 'AndroidRuntime', lv: 'E', ms: 'FATAL EXCEPTION: main\njava.lang.IllegalStateException: title must not be null\n\tat com.mynet.haber.feed.NewsRow(NewsRow.kt:31)', crash: true },
    { pk: 'com.google.android.gms', tg: 'Auth', lv: 'D', ms: 'token cache hit' },
  ];
  const LEVELS = ['V', 'D', 'I', 'W', 'E', 'A'];
  const LEVEL_NAMES = { VERBOSE: 'V', DEBUG: 'D', INFO: 'I', WARN: 'W', ERROR: 'E', ASSERT: 'A' };

  // Small Logcat query evaluator: key:value, -key:value, key~:regex, level:, is:crash, free text.
  // Same key positive terms are ORed, everything else is ANDed (the documented implicit rules). No & | ( ) here.
  function logcatFilter(query) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    const groups = {}; const all = [];
    for (const raw of terms) {
      const m = raw.match(/^(-?)(\w+)(~?):(.*)$/);
      if (!m) { all.push(e => (e.tg + ' ' + e.ms + ' ' + e.pk).toLowerCase().includes(raw.toLowerCase())); continue; }
      const [, neg, k, re, v] = m;
      let test;
      if (k === 'level') { const want = LEVEL_NAMES[v.toUpperCase()] || v.toUpperCase()[0]; test = e => LEVELS.indexOf(e.lv) >= LEVELS.indexOf(want); }
      else if (k === 'is') test = e => v === 'crash' ? !!e.crash : v === 'stacktrace' ? /\n\tat /.test(e.ms) : false;
      else {
        const field = { package: 'pk', tag: 'tg', message: 'ms' }[k];
        if (!field) return null;
        let rx = null;
        if (re) { try { rx = new RegExp(v); } catch (err) { return null; } }
        test = e => {
          const val = field === 'pk' && v === 'mine' && !re ? (e.pk === MINE ? 'mine' : '') : e[field];
          return rx ? rx.test(val) : val.toLowerCase().includes(v.toLowerCase());
        };
      }
      if (neg) all.push(e => !test(e));
      else (groups[k] = groups[k] || []).push(test);
    }
    Object.values(groups).forEach(g => all.push(e => g.some(t => t(e))));
    return e => all.every(t => t(e));
  }

  Lab.addTrack({
    id: 'tools',
    title: 'Android Studio and debugging',
    description: 'The tools you use every day: the IDE, Logcat, the debugger, Layout Inspector, adb, lint and a CI check on every pull request.',
    requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'studio-tour',
        title: 'Android Studio tour',
        tagline: 'Know the five places you touch every day: project view, Gradle sync, run configuration, target device and the shortcuts.',
        level: 'beginner',
        body: `
<p>The <b>Project</b> window has two useful modes. The <b>Android</b> view (the default) groups files by module and type: <code>manifests</code>, the source folder, <code>res</code> and one <b>Gradle Scripts</b> group. The <b>Project</b> view shows the real folders on disk, including <code>build/</code>, <code>src/test</code> and <code>src/androidTest</code>.</p>
<p>The IDE learns about your dependencies from Gradle. When you edit a <code>build.gradle.kts</code> or <code>libs.versions.toml</code> file, the editor does not know about the change until you run <b>Sync Project with Gradle Files</b>. Before that, a new import shows as an unresolved reference even though the build itself would work.</p>
<p>To run, you pick a <b>run configuration</b> (usually <code>app</code>) and a <b>target device</b>, then press <b>Run</b>. Behind that button Studio builds a debug APK with Gradle, installs it with adb and starts the launcher activity. Try the flow below.</p>`,
        visual(el) {
          const DEVICES = [
            { name: 'Pixel 8 API 36', kind: 'emulator', serial: 'emulator-5554' },
            { name: 'Galaxy A54', kind: 'USB device', serial: 'R58N12ABCDE' },
          ];
          const TREES = {
            android: [
              [0, 'app', 'grp'], [1, 'manifests', 'grp'], [2, 'AndroidManifest.xml'], [1, 'java', 'grp'], [2, 'com.mynet.haber', 'dir'], [3, 'MainActivity.kt'],
              [1, 'res', 'grp'], [2, 'values', 'dir'], [3, 'strings.xml (2)'], [0, 'Gradle Scripts', 'grp'], [1, 'build.gradle.kts (Project: Haber)'],
              [1, 'build.gradle.kts (Module :app)'], [1, 'libs.versions.toml'], [1, 'settings.gradle.kts'],
            ],
            project: [
              [0, 'Haber/', 'dir'], [1, 'app/', 'dir'], [2, 'build/', 'dir'], [2, 'src/', 'dir'], [3, 'main/', 'dir'], [4, 'AndroidManifest.xml'], [4, 'java/com/mynet/haber/', 'dir'],
              [4, 'res/values/strings.xml'], [4, 'res/values-en/strings.xml'], [3, 'test/', 'dir'], [3, 'androidTest/', 'dir'], [2, 'build.gradle.kts'], [1, 'gradle/libs.versions.toml'], [1, 'settings.gradle.kts'],
            ],
          };
          let view = 'android', dev = 0, added = false, synced = true, busy = false, run = 0;
          const tree = h('div', { class: 'tl-panel tl-tree' });
          const editor = h('div', { class: 'tl-panel' });
          const banner = h('div', { class: 'tl-banner', hidden: true }, 'Gradle files have changed since the last sync. The IDE may not work properly until you sync.');
          const log = h('div', { class: 'tl-panel', 'aria-live': 'polite' });
          const o = out('');
          function paintTree() {
            tree.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, view === 'android' ? 'Project: Android view' : 'Project: Project view')),
              ...TREES[view].map(([d, name, k]) => h('div', { class: `tl-ln ${k ? 'tl-' + k : ''}`, style: `padding-left:${6 + d * 12}px` }, name)));
          }
          function paintEditor() {
            const lines = [
              ['// MainActivity.kt'],
              added ? ['import timber.log.Timber', !synced] : null,
              ['class MainActivity : ComponentActivity() {'],
              ['  override fun onCreate(b: Bundle?) {'],
              ['    super.onCreate(b)'],
              added ? ['    Timber.d("onCreate")', !synced] : null,
              ['  }'], ['}'],
            ].filter(Boolean);
            editor.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Editor'), h('span', {}, added && !synced ? 'Unresolved reference: Timber' : 'no problems')),
              ...lines.map(([t, bad]) => h('div', { class: 'tl-ln' + (bad ? ' tl-errl' : ''), html: hl(t) })));
          }
          const viewBtns = [act('Android view', () => { view = 'android'; press(viewBtns, viewBtns[0]); paintTree(); }), act('Project view', () => { view = 'project'; press(viewBtns, viewBtns[1]); paintTree(); })];
          const devBtns = DEVICES.map((d, i) => act(`${d.name} (${d.kind})`, () => { dev = i; press(devBtns, devBtns[i]); }));
          async function stream(lines, gap = 260) {
            const my = ++run;
            log.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Build / Run')));
            for (const [t, cls] of lines) {
              await sleep(gap); if (!el.isConnected || my !== run) return false;
              log.append(h('div', { class: 'tl-ln tl-wrap', style: cls ? `color:var(${cls})` : null }, t));
            }
            return true;
          }
          async function sync() {
            if (busy) return; busy = true;
            say(o, 'Sync Project with Gradle Files: Gradle resolves dependencies, then the IDE re-indexes.');
            const ok = await stream([['Gradle sync started'], ['Resolving dependencies of :app'], [added ? 'Downloaded com.jakewharton.timber:timber' : 'Nothing new to download'], ['Gradle sync finished', '--t-k']]);
            busy = false; if (!ok) return;
            synced = true; banner.hidden = true; paintEditor();
            say(o, added ? '<span class="good">Synced.</span> The editor now knows Timber, so the red underline is gone.' : '<span class="good">Synced.</span> Nothing had changed, so nothing new happened.');
          }
          function addDep() {
            if (added) { say(o, 'The dependency is already in the file.'); return; }
            added = true; synced = false; banner.hidden = false; replay(banner, 'pop-soft'); paintEditor();
            say(o, `You added <span class="muted">implementation(libs.timber)</span> to <b>build.gradle.kts</b>. The editor still shows red until you sync.`);
          }
          async function runApp() {
            if (busy) return; busy = true;
            const d = DEVICES[dev];
            say(o, `Run: build, install and launch on <b>${d.name}</b>.`);
            const ok = await stream([
              ['> Task :app:compileDebugKotlin'], ['> Task :app:assembleDebug'], ['BUILD SUCCESSFUL in 7s', '--t-k'],
              [`Installing APK 'app-debug.apk' on '${d.serial}'`], [`$ adb shell am start -n "${MINE}/.MainActivity"`, '--t-c'], ['Launch succeeded', '--t-k'],
            ], 230);
            busy = false; if (!ok) return;
            say(o, added && !synced
              ? '<span class="good">It ran.</span> <span class="muted">Gradle built fine. Only the IDE was out of date. Sync to clear the red.</span>'
              : `<span class="good">Running on ${d.kind === 'emulator' ? 'the emulator' : 'your phone over USB'}.</span>`);
          }
          paintTree(); paintEditor(); press(viewBtns, viewBtns[0]); press(devBtns, devBtns[0]);
          log.append(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Build / Run')), h('div', { class: 'tl-ln tl-nt' }, 'Idle'));
          say(o, 'Switch views, pick a device, add a dependency, sync and run.');
          el.append(
            h('div', { class: 'tl-ide' },
              h('div', { class: 'tl-bar' }, label('run config'), h('span', { class: 'tl-pill tl-acc' }, 'app'), label('device'), devBtns),
              h('div', { class: 'tl-bar' }, act('Run', runApp), act('Sync Project with Gradle Files', sync), act('Add Timber dependency', addDep)),
              h('div', { class: 'tl-row' }, viewBtns),
              banner,
              h('div', { class: 'tl-grid' }, tree, editor),
              log),
            o);
        },
        code: `// app/build.gradle.kts  (shown under "Gradle Scripts" in the Android view)
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.mynet.haber"
    defaultConfig {
        applicationId = "com.mynet.haber"
        minSdk = 24
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.timber)   // after editing: Sync Project with Gradle Files
}`,
        remember: 'Edited a Gradle file? Sync before you trust the red underlines. Run = Gradle build + adb install + am start.',
        deeper: [
          {
            title: 'The shortcuts that pay off',
            body: `<p>You do not need hundreds of shortcuts. These cover most of a day: find anything, fix the thing under the cursor, jump to code and back, and drive the debugger. They come from the default keymap. You can change any of them under <b>Settings &gt; Keymap</b>.</p>`,
            visual(el) {
              const KEYS = [
                ['Search everywhere', 'Shift Shift', 'Shift Shift'],
                ['Find action', 'Ctrl+Shift+A', 'Cmd+Shift+A'],
                ['Quick fix / intention actions', 'Alt+Enter', 'Option+Enter'],
                ['Go to declaration', 'Ctrl+B', 'Cmd+B'],
                ['Find usages', 'Alt+F7', 'Option+F7'],
                ['Rename', 'Shift+F6', 'Shift+F6'],
                ['Recent files', 'Ctrl+E', 'Cmd+E'],
                ['Reformat code', 'Ctrl+Alt+L', 'Cmd+Option+L'],
                ['Run / Debug', 'Shift+F10 / Shift+F9', 'Ctrl+R / Ctrl+D'],
                ['Toggle breakpoint', 'Ctrl+F8', 'Cmd+F8'],
              ];
              let os = 0;
              const list = h('div', { class: 'tl-keys' });
              const paint = () => list.replaceChildren(...KEYS.map(k => h('div', { class: 'tl-key' }, h('span', {}, k[0]), h('kbd', {}, k[1 + os]))));
              const btns = [act('Windows / Linux', () => { os = 0; press(btns, btns[0]); paint(); replay(list, 'pop-soft'); }), act('macOS', () => { os = 1; press(btns, btns[1]); paint(); replay(list, 'pop-soft'); })];
              press(btns, btns[0]); paint();
              el.append(h('div', { class: 'controls' }, btns), list);
            },
          },
          {
            title: 'Apply Changes instead of a full Run',
            body: `<p>A full Run reinstalls and restarts the app. For small edits, <b>Apply Code Changes</b> swaps changed method bodies into the running app, and <b>Apply Changes and Restart Activity</b> also picks up resource changes and restarts only the activity. Both need a debug build on Android 8.0 (API 26) or higher.</p>
<p>Anything structural, such as a new field or a manifest change, still needs a full Run. Studio tells you when Apply Changes cannot be used.</p>`,
          },
          {
            title: 'Emulator or real device',
            body: `<p>Create emulators in <b>Device Manager</b> (<b>View &gt; Tool Windows &gt; Device Manager</b>). They are good for trying many API levels and screen sizes, and they reset cleanly. A real phone shows true performance, real touch and real vendor quirks, such as aggressive battery savers on some brands.</p>
<p>To use a phone, open <b>Settings &gt; About phone</b>, tap <b>Build number</b> seven times to unlock <b>Developer options</b>, then turn on <b>USB debugging</b>. The phone asks you to trust the computer the first time you plug it in.</p>`,
          },
        ],
        underHood: {
          body: `<p>The Run button is a shortcut for three steps you can run yourself in a terminal. Knowing them helps when the IDE misbehaves: if the command line build works, the problem is usually a stale sync or a cache in the IDE, not your code.</p>`,
          code: `./gradlew :app:assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.mynet.haber/.MainActivity`,
        },
        mistakes: [
          {
            title: 'Fighting red code that Gradle already accepts',
            bad: `// edited libs.versions.toml and build.gradle.kts
// editor: Unresolved reference: Timber
// ...deletes the import, tries again, restarts the IDE`,
            good: `// edited Gradle files -> Sync Project with Gradle Files
// editor re-indexes, Timber resolves`,
            why: 'The editor reads the project model that the last sync produced. After any Gradle edit, sync first. Restarting the IDE or invalidating caches is the last resort, not the first.',
          },
        ],
        terms: [
          { term: 'Gradle sync', def: 'Studio asks Gradle for the project model (modules, dependencies, source sets) so the editor can resolve code.' },
          { term: 'Run configuration', def: 'A saved recipe for what to build and launch, such as the app module and its default activity.' },
          { term: 'Android view', def: 'The default Project window mode that groups files by module and type instead of by folder.' },
          { term: 'AVD', def: 'Android Virtual Device: one emulator definition with a device profile and a system image.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the same build the Run button starts, from the terminal.', code: './gradlew :app:[[assembleDebug]]', why: '<code>assembleDebug</code> builds the debug APK of the <code>app</code> module. Run then installs it with adb.' },
          { type: 'bug', prompt: 'You added Timber but the editor marks the import red. Which line explains why?', code: '// 1. added implementation(libs.timber) to app/build.gradle.kts\n// 2. added timber to libs.versions.toml\n// 3. skipped Sync Project with Gradle Files\n// 4. wrote import timber.log.Timber', bug: 2, fix: '// 3. ran Sync Project with Gradle Files', why: 'The editor only knows dependencies from the last sync. The build would work, but the IDE has not re-read the Gradle files.' },
        ],
        quiz: [
          { q: 'Which Project window mode shows <code>build/</code> and the real <code>src/main</code> folders?', options: ['Android view', 'Project view', 'Gradle Scripts'], a: 1, why: 'The Android view groups files by type and hides some folders. The Project view mirrors the disk.' },
          { q: 'You changed one method body. What is the fastest way to see it on the running app?', options: ['Rebuild Project', 'Apply Code Changes', 'Uninstall and Run'], a: 1, why: 'Apply Code Changes swaps changed method bodies into the running debug app without reinstalling.' },
          { q: 'What does the Run button do, in order?', options: ['adb install, then Gradle build, then launch', 'Gradle build, adb install, launch the activity', 'Only launch the activity'], a: 1, why: 'Gradle builds the APK, adb installs it, and the activity manager starts the launcher activity.' },
        ],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'logcat',
        title: 'Logcat and structured logging',
        tagline: 'Log with a level and a tag, then filter with a query instead of scrolling.',
        level: 'beginner',
        body: `
<p>Every log line has a <b>level</b> (Verbose, Debug, Info, Warn, Error, Assert), a <b>tag</b>, the <b>package</b> that wrote it and a message. The device mixes lines from every app and the system into one stream, so the skill is filtering, not reading.</p>
<p>Studio's Logcat window takes a query. <code>package:mine</code> keeps only packages from your open project. <code>level:WARN</code> keeps warnings and anything more severe. <code>tag:</code>, <code>message:</code> and <code>package:</code> match text, a leading <code>-</code> excludes, and <code>~:</code> switches to a regex. <code>is:crash</code> finds crashes.</p>
<p>Terms with the same key are ORed, and everything else is ANDed. So <code>tag:Auth tag:Feed package:mine</code> means (Auth or Feed) and mine. Type your own query below or pick one.</p>`,
        visual(el) {
          const PRESETS = ['package:mine', 'package:mine level:WARN', 'package:mine -tag:OkHttp', 'tag:Auth tag:Feed package:mine', 'tag~:^Feed', 'is:crash'];
          const input = h('input', { type: 'text', value: 'package:mine', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Logcat query' });
          const panel = h('div', { class: 'tl-panel', 'aria-live': 'polite' });
          const count = h('span', { class: 'tl-count' });
          const o = out('');
          function paint() {
            const f = logcatFilter(input.value);
            if (!f) { count.innerHTML = '<b>invalid query</b>'; return; }
            const hits = LOGS.filter(f);
            count.innerHTML = `<b>${hits.length}</b> of ${LOGS.length} lines`;
            panel.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Logcat'), h('span', {}, 'Pixel 8 API 36')),
              ...(hits.length ? hits.map(e => h('div', { class: `tl-log tl-lv-${e.lv}${e.pii ? ' tl-pii' : ''}` },
                h('span', { class: `tl-lv tl-lv-${e.lv}` }, e.lv),
                h('span', { class: 'tl-tg' }, e.tg),
                h('span', { class: 'tl-ms tl-ln tl-wrap' }, e.ms, e.pk !== MINE ? h('span', { class: 'tl-pk' }, `  ${e.pk}`) : null))) : [h('div', { class: 'tl-ln tl-nt' }, 'No lines match.')]));
            const notes = {
              'package:mine': 'Only your app. The system and Play services lines are gone.',
              'package:mine level:WARN': 'Warnings and errors from your app: the first query to run when something feels wrong.',
              'package:mine -tag:OkHttp': 'The network logger is noisy. A leading minus hides it.',
              'tag:Auth tag:Feed package:mine': 'Two tag terms are ORed, then ANDed with package:mine. Tags match by substring, so AuthManager and FeedViewModel both count.',
              'tag~:^Feed': 'A regex on the tag: only tags that start with Feed.',
              'is:crash': 'The crash and its stack trace, from any app.',
            };
            const pii = hits.some(e => e.pii);
            say(o, (notes[input.value.trim()] || 'Your own query.') + (pii ? ' <span class="bad">The red-edged line leaks a token and an email. Never log those.</span>' : ''));
          }
          const btns = PRESETS.map(p => cmdk(p, () => { input.value = p; press(btns, btns[PRESETS.indexOf(p)]); paint(); }));
          input.addEventListener('input', () => { press(btns, null); paint(); });
          press(btns, btns[0]); paint();
          el.append(h('div', { class: 'tl-q' }, h('b', {}, 'Q'), input), h('div', { class: 'controls' }, btns), count, panel, o);
        },
        code: `class HaberApp : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) Timber.plant(Timber.DebugTree())   // tag = calling class
        else Timber.plant(CrashReportingTree())
    }
}

class CrashReportingTree : Timber.Tree() {
    override fun isLoggable(tag: String?, priority: Int) = priority >= Log.WARN

    override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
        crashReporter.log("$tag: $message")
        if (t != null) crashReporter.recordException(t)
    }
}

// usage
Timber.d("loaded %d items in %d ms", items.size, took)
Timber.w(e, "feed refresh failed, showing cache")`,
        remember: 'Start every hunt with package:mine level:WARN. Log a level, a tag and facts, never tokens or personal data.',
        deeper: [
          {
            title: 'Explicit operators and saved filters',
            body: `<p>When the implicit rules are not enough, Logcat accepts <code>&amp;</code>, <code>|</code> and parentheses. AND binds tighter than OR, so add parentheses when you mix them. <code>age:5m</code> keeps only the last five minutes, and <code>name:</code> gives a query a name in the history list. Press <kbd>Ctrl</kbd>+<kbd>Space</kbd> in the query field for suggestions.</p>
<p>You can split the Logcat view (right-click, <b>Split Right</b> or <b>Split Down</b>), and each split keeps its own query. One pane on your app, one on <code>is:crash</code> works well.</p>`,
            code: `(tag:FeedViewModel | level:ERROR) & package:mine
package:mine level:INFO -tag:OkHttp age:5m
message~:\\d{3,}ms package:mine            // slow calls
name:Network package:mine tag:OkHttp`,
          },
          {
            title: 'Wrap the logger once',
            body: `<p>Calling <code>android.util.Log</code> everywhere spreads two decisions through the codebase: what tag to use and what reaches a release build. A thin wrapper such as Timber makes both decisions in one place. Its <code>DebugTree</code> takes the tag from the calling class, and you plant a different tree in release that only forwards warnings and errors to your crash reporter.</p>
<p>Pass the exception as the first argument instead of pasting <code>e.message</code> into the string. The tree then gets the whole stack trace.</p>`,
            code: `// before: tag strings everywhere, debug noise in release
Log.d("FeedVM", "refresh failed: " + e.message)

// after: one place decides tags and what release keeps
Timber.w(e, "refresh failed for page %d", page)`,
          },
          {
            title: 'Logs are not private',
            body: `<p>Anyone with USB debugging can read the device log, bug reports include it, and a release tree may forward it to a crash reporting service. Treat a log line like a postcard. No auth tokens, passwords, full emails, phone numbers or message bodies. Log an id or a short hash if you need to correlate.</p>`,
            code: `// bad
Timber.d("refresh token=%s user=%s", token, user.email)

// good
Timber.d("token refreshed for user #%s (expires in %ds)", user.id, ttl)`,
          },
        ],
        underHood: {
          body: `<p>Apps write log entries to <code>logd</code>, a system service that keeps them in ring buffers. Studio's Logcat window and <code>adb logcat</code> both read from it. The command line tool has its own filter syntax: <code>tag:priority</code> pairs, with <code>*:S</code> to silence everything else.</p>`,
          code: `adb logcat ActivityManager:I FeedViewModel:D *:S
# priorities, lowest to highest: V D I W E F S`,
        },
        mistakes: [
          {
            title: 'Scrolling the whole device log',
            bad: '(no query)  ->  thousands of system lines per minute',
            good: 'package:mine level:WARN',
            why: 'Without a filter your app is a small part of the stream. Start narrow, then widen by dropping terms.',
          },
          {
            title: 'Logging secrets',
            bad: `Log.d("Auth", "login ok, token=$token")`,
            good: `Timber.d("login ok, token length=%d", token.length)`,
            why: 'Device logs end up in bug reports and crash tools. A token in a log is a token anyone with the report can use.',
          },
        ],
        terms: [
          { term: 'Log level', def: 'The severity of a line: Verbose, Debug, Info, Warn, Error or Assert. level:X keeps X and above.' },
          { term: 'Tag', def: 'A short label for the source of a line, usually the class name.' },
          { term: 'package:mine', def: 'A Logcat query value that matches the packages of the project open in Studio.' },
          { term: 'Tree (Timber)', def: 'A pluggable log destination. You plant different trees for debug and release.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show warnings and errors from your own app only.', code: 'package:[[mine]] level:[[WARN|warn|W]]', why: '<code>package:mine</code> keeps your project’s packages and <code>level:WARN</code> keeps WARN and more severe.' },
          { type: 'bug', prompt: 'This release tree leaks debug noise and a secret. Tap the line that lets everything through.', code: 'class ReleaseTree : Timber.Tree() {\n    override fun isLoggable(tag: String?, priority: Int) = true\n    override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {\n        crashReporter.log("$tag: $message")\n    }\n}', bug: 1, fix: '    override fun isLoggable(tag: String?, priority: Int) = priority >= Log.WARN', why: 'Returning <code>true</code> forwards every debug line, including any that slipped in with personal data. Release should keep warnings and errors only.' },
        ],
        quiz: [
          { q: 'What does <code>tag:Auth tag:Feed package:mine</code> match?', options: ['Auth and Feed and mine, all three', '(Auth or Feed) and mine', 'Auth or Feed or mine'], a: 1, why: 'Terms with the same key are ORed. Different keys are ANDed.' },
          { q: 'Which query hides the OkHttp logger but keeps the rest of your app?', options: ['package:mine tag:!OkHttp', 'package:mine -tag:OkHttp', 'package:mine level:OkHttp'], a: 1, why: 'A leading minus negates a term.' },
          { q: 'Why plant a different Timber tree in release?', options: ['DebugTree crashes in release', 'So release only forwards warnings and errors to your crash reporter', 'Release builds cannot log at all'], a: 1, why: 'One place decides what a release build keeps. Debug detail stays out of shipped apps.' },
        ],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'debugger',
        title: 'The debugger',
        tagline: 'Pause the app on a line, look at real values, then step one line at a time.',
        level: 'intermediate',
        body: `
<p>Logs show what you guessed you would need. The debugger shows everything at the moment the app pauses. Click the gutter to set a <b>breakpoint</b>, start with <b>Debug</b> instead of Run, and the app freezes when it reaches that line. The Variables pane shows every local in scope.</p>
<p>From there: <b>Step Over</b> (<kbd>F8</kbd>) runs the current line, including any calls inside it. <b>Step Into</b> (<kbd>F7</kbd>) enters the function called on this line. <b>Step Out</b> (<kbd>Shift</kbd>+<kbd>F8</kbd>) finishes the current function and returns to the caller. <b>Resume Program</b> runs to the next breakpoint.</p>
<p>A <b>conditional breakpoint</b> only pauses when an expression is true. It saves you from pressing Resume twenty times to reach the one item that matters. Below, the total is wrong for one item. Set breakpoints, add the condition and step until you see why.</p>`,
        visual(el) {
          const SRC = [
            'fun total(cart: List<Item>): Int {',
            '    var sum = 0',
            '    for (item in cart) {',
            '        val price = priceOf(item)',
            '        sum += price',
            '    }',
            '    return sum',
            '}',
            '',
            'fun priceOf(item: Item): Int {',
            '    val base = item.price * item.qty',
            '    val off = if (item.qty >= 3) base / 10 else 0',
            '    return base - off',
            '}',
          ];
          const CART = [{ name: 'simit', price: 1500, qty: 2 }, { name: 'çay', price: 1000, qty: 3 }, { name: 'ayran', price: 2500, qty: 1 }];
          const fmt = it => `Item(name="${it.name}", price=${it.price}, qty=${it.qty})`;
          // trace: each entry is "paused before running this line"
          const T = [];
          const push = (line, depth, vars, it) => T.push({ line, depth, vars, it });
          const cartV = ['cart', 'size = 3'];
          let sum = 0;
          push(1, 0, [cartV]);
          for (const it of CART) {
            push(2, 0, [cartV, ['sum', sum]]);
            push(3, 0, [cartV, ['sum', sum], ['item', fmt(it)]], it);
            const base = it.price * it.qty, off = it.qty >= 3 ? base / 10 : 0;
            push(10, 1, [['item', fmt(it)]], it);
            push(11, 1, [['item', fmt(it)], ['base', base]], it);
            push(12, 1, [['item', fmt(it)], ['base', base], ['off', off]], it);
            push(4, 0, [cartV, ['sum', sum], ['item', fmt(it)], ['price', base - off]], it);
            sum += base - off;
          }
          push(2, 0, [cartV, ['sum', sum]]);
          push(6, 0, [cartV, ['sum', sum]]);

          const bps = new Set([4]);
          let cond = false, at = -1, prevVars = {}, watch = false;
          const o = out('');
          const gutters = [];
          const lines = SRC.map((s, i) => {
            const g = h('button', { class: 'tl-gut', 'aria-label': `Toggle breakpoint on line ${i + 1}`, onclick() { if (!s.trim() || s === '}' || s === '    }') return; bps.has(i) ? bps.delete(i) : bps.add(i); paintGutters(); } });
            gutters.push(g);
            return h('div', { class: 'tl-ln' }, g, h('span', { class: 'tl-no' }, String(i + 1)), h('span', { html: hl(s) || ' ' }));
          });
          const src = h('div', { class: 'tl-panel tl-src' }, h('div', { class: 'tl-panel-h' }, h('span', {}, 'Cart.kt'), h('span', {}, 'click the gutter dots')), lines);
          const frames = h('div', { class: 'tl-panel' });
          const vars = h('div', { class: 'tl-panel tl-vars', 'aria-live': 'polite' });
          const evalOut = h('div', { class: 'tl-panel' });
          function paintGutters() { gutters.forEach((g, i) => { g.classList.toggle('tl-bp', bps.has(i)); g.classList.toggle('tl-cond', bps.has(i) && cond); }); }
          function paint() {
            const e = T[at];
            lines.forEach((l, i) => l.classList.toggle('tl-cur', !!e && e.line === i));
            frames.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Frames')),
              ...(!e ? [h('div', { class: 'tl-ln tl-nt' }, at >= T.length ? 'Process finished' : 'Not paused')]
                : e.depth ? [h('div', { class: 'tl-frame tl-top' }, `priceOf:${e.line + 1}, CartKt`), h('div', { class: 'tl-frame' }, 'total:4, CartKt')]
                  : [h('div', { class: 'tl-frame tl-top' }, `total:${e.line + 1}, CartKt`), h('div', { class: 'tl-frame' }, 'onCheckout:58, CartViewModel')]));
            const now = {};
            const rows = e ? e.vars.map(([k, v]) => { now[k] = String(v); return h('div', { class: 'tl-v' + (prevVars[k] !== undefined && prevVars[k] !== String(v) || prevVars[k] === undefined && Object.keys(prevVars).length ? ' tl-chg' : '') }, h('b', {}, k), h('span', {}, String(v))); }) : [];
            const w = e && watch ? (() => { const s = e.vars.find(v => v[0] === 'sum'); return h('div', { class: 'tl-v' }, h('b', {}, 'watch sum'), h('span', {}, s ? String(s[1]) : 'Cannot find local variable \'sum\'')); })() : null;
            vars.replaceChildren(...[h('div', { class: 'tl-panel-h' }, h('span', {}, 'Variables')), ...rows, w, !e ? h('div', { class: 'tl-ln tl-nt' }, '-') : null].filter(Boolean));
            prevVars = now;
          }
          function hitsBp(i) { const e = T[i]; return bps.has(e.line) && (!cond || (e.it && e.it.qty >= 3)); }
          function goTo(i, why) {
            if (i >= T.length) { at = T.length; paint(); say(o, `<span class="good">Finished.</span> total = ${sum}. <span class="muted">Expected 8200: simit 3000 + çay 2700 + ayran 2500.</span>`); return; }
            at = i; paint(); say(o, why);
          }
          const need = () => { if (at < 0 || at >= T.length) { say(o, 'Not paused. Press Debug first.'); return false; } return true; };
          const debug = () => { prevVars = {}; let i = 0; while (i < T.length && !hitsBp(i)) i++; goTo(i, i < T.length ? `Paused at breakpoint, line ${T[i].line + 1}.` : 'No breakpoint was hit.'); };
          const over = () => { if (!need()) return; const d = T[at].depth; let i = at + 1; while (i < T.length && T[i].depth > d) i++; goTo(i, `Step Over: ran line ${T[at].line + 1} as one unit.`); };
          const into = () => { if (!need()) return; const i = at + 1; goTo(i, T[i] && T[i].depth > T[at].depth ? 'Step Into: now inside priceOf().' : 'Step Into: no call on that line, so it behaves like Step Over.'); };
          const outOf = () => { if (!need()) return; const d = T[at].depth; if (!d) { goTo(T.length); return; } let i = at + 1; while (i < T.length && T[i].depth >= d) i++; goTo(i, 'Step Out: finished priceOf() and returned to total().'); };
          const resume = () => { if (!need()) return; let i = at + 1; while (i < T.length && !hitsBp(i)) i++; goTo(i, i < T.length ? `Resume: paused at the next breakpoint, line ${T[i].line + 1}.` : ''); };
          const condBtn = act('Condition: item.qty >= 3', () => { cond = !cond; condBtn.setAttribute('aria-pressed', String(cond)); paintGutters(); say(o, cond ? 'Breakpoints now pause only when <span class="muted">item.qty >= 3</span>. Press Debug again.' : 'Condition removed.'); });
          const watchBtn = act('Add to watches: sum', () => { watch = !watch; watchBtn.setAttribute('aria-pressed', String(watch)); paint(); });
          const EXPRS = ['item.price * item.qty', 'item.qty >= 3', 'sum + price'];
          const evalBtns = EXPRS.map(x => cmdk(x, () => {
            const e = T[at];
            let r;
            if (!e) r = 'Not paused';
            else {
              const v = Object.fromEntries(e.vars);
              if (x === 'sum + price') r = 'sum' in v && 'price' in v ? String(v.sum + v.price) : `Cannot find local variable '${'sum' in v ? 'price' : 'sum'}'`;
              else if (!e.it) r = "Cannot find local variable 'item'";
              else r = x.startsWith('item.price') ? String(e.it.price * e.it.qty) : String(e.it.qty >= 3);
            }
            evalOut.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Evaluate expression')), h('div', { class: 'tl-ln tl-wrap', html: `${hl(x)} <span style="color:var(--t-c)">=</span> ${esc(r)}` }));
            replay(evalOut, 'pop-soft');
          }));
          evalOut.append(h('div', { class: 'tl-panel-h' }, h('span', {}, 'Evaluate expression')), h('div', { class: 'tl-ln tl-nt' }, 'Pick an expression while paused'));
          paintGutters(); paint();
          say(o, 'A breakpoint sits on line 5. Press Debug, then step. Why is çay 2700 and not 3000?');
          el.append(
            h('div', { class: 'controls' }, act('Debug', debug), act('Step Over', over), act('Step Into', into), act('Step Out', outOf), act('Resume', resume)),
            h('div', { class: 'controls' }, condBtn, watchBtn),
            src,
            h('div', { class: 'tl-grid' }, frames, vars),
            h('div', { class: 'controls' }, label('evaluate'), evalBtns),
            evalOut, o);
        },
        code: `data class Item(val name: String, val price: Int, val qty: Int)

fun total(cart: List<Item>): Int {
    var sum = 0
    for (item in cart) {
        val price = priceOf(item)   // breakpoint, condition: item.qty >= 3
        sum += price
    }
    return sum
}

fun priceOf(item: Item): Int {
    val base = item.price * item.qty
    val off = if (item.qty >= 3) base / 10 else 0   // the "bug" was a bulk discount
    return base - off
}`,
        remember: 'Breakpoint where the value first looks wrong, add a condition to skip the boring iterations, then Step Into the call that produces it.',
        deeper: [
          {
            title: 'More than line breakpoints',
            body: `<p>Right-click a breakpoint to add a condition, or untick <b>Suspend</b> to turn it into a <b>logging breakpoint</b>: it logs a message and keeps running. That is a log line you add without editing code or rebuilding.</p>
<p>Other kinds: a <b>method breakpoint</b> pauses on entry to a function, a <b>field breakpoint</b> pauses when a property is read or written, and an <b>exception breakpoint</b> pauses where an exception is thrown, before any catch hides it. <b>View Breakpoints</b> lists them all, and <b>Mute Breakpoints</b> turns them off without losing them.</p>`,
          },
          {
            title: 'Attach instead of relaunching',
            body: `<p>Some bugs only show after you have navigated somewhere, or after a push notification opens the app. Restarting under Debug loses that state. Run the app normally, get it into the state you need, then use <b>Attach debugger to Android process</b> and pick your package. Your breakpoints become active right away.</p>
<p>The debugger needs a debuggable build, which debug builds are by default.</p>`,
          },
          {
            title: 'Debugging coroutines',
            body: `<p>When paused inside coroutine code, the debugger has a <b>Coroutines</b> tab that lists each coroutine and its state: <code>RUNNING</code>, <code>SUSPENDED</code> or <code>CREATED</code>. It shows which coroutine is waiting on which.</p>
<p>In suspend functions you may see a variable marked <i>was optimized out</i>. The compiler shortened its lifetime, so the value is gone. The <code>-Xdebug</code> compiler option keeps them alive, but never ship it: it can cause memory leaks. Add it while you debug, then remove it.</p>`,
            code: `// app/build.gradle.kts, temporary while debugging only
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xdebug")   // never in a release build
    }
}`,
          },
        ],
        underHood: {
          body: `<p>Debug builds are marked debuggable, so the runtime opens a debugging channel (JDWP) that Studio connects to through adb. A breakpoint is a request to the runtime: "suspend threads when this location runs". Evaluate Expression compiles your snippet and runs it inside the paused app, so it can call real functions and change real state. Be careful with expressions that have side effects.</p>`,
        },
        mistakes: [
          {
            title: 'Step Over when the bug is inside the call',
            bad: '// paused on: val price = priceOf(item)\n// Step Over -> price = 2700, but why?',
            good: '// paused on: val price = priceOf(item)\n// Step Into -> watch base and off being computed',
            why: 'Step Over runs the whole call as one step. If the result is surprising, the answer is inside, so Step Into it.',
          },
          {
            title: 'Pressing Resume twenty times',
            bad: '// breakpoint in a loop over 200 news items\n// Resume, Resume, Resume... until id == 42',
            good: '// right-click the breakpoint -> Condition: item.id == 42',
            why: 'A condition pauses only on the iteration you care about.',
          },
        ],
        terms: [
          { term: 'Breakpoint', def: 'A marker that pauses the app when that line is about to run.' },
          { term: 'Step Over / Into / Out', def: 'Run the current line, enter the function it calls, or finish the current function.' },
          { term: 'Watch', def: 'An expression the debugger re-evaluates every time the app pauses.' },
          { term: 'Frame', def: 'One function call on the call stack, with its own local variables.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pause only on the expensive item. Fill in the breakpoint condition.', code: '// condition on: sum += price\nitem.[[price]] * item.qty > 5000', why: 'A condition is a Kotlin expression evaluated in the paused frame. Only true results suspend.' },
          { type: 'bug', prompt: 'You want to see how <code>off</code> is computed but never land in <code>priceOf</code>. Tap the step that skips it.', code: '// 1. Debug: paused at val price = priceOf(item)\n// 2. Step Over\n// 3. look at price in Variables', bug: 1, fix: '// 2. Step Into', why: 'Step Over runs <code>priceOf</code> completely. Step Into enters it so you can watch <code>base</code> and <code>off</code>.' },
        ],
        quiz: [
          { q: 'You are inside <code>priceOf()</code> and have seen enough. Which action returns to the caller?', options: ['Step Over', 'Step Into', 'Step Out'], a: 2, why: 'Step Out runs the rest of the current function and pauses back in the caller.' },
          { q: 'What does a logging breakpoint do?', options: ['Pauses and writes to Logcat', 'Writes a message and keeps running, without a code change', 'Adds a Log.d call to your source'], a: 1, why: 'With Suspend off, the breakpoint only logs. No rebuild needed.' },
          { q: 'A variable in a suspend function shows "was optimized out". What happened?', options: ['The debugger is broken', 'The compiler ended its lifetime early, so the value no longer exists', 'The coroutine was cancelled'], a: 1, why: 'The variable is not needed any more, so the compiler dropped it. <code>-Xdebug</code> keeps it while debugging only.' },
        ],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'layout-inspector',
        title: 'Layout Inspector and recomposition counts',
        tagline: 'See the real UI tree of a running app, and count how often each composable recomposes or skips.',
        level: 'intermediate',
        body: `
<p>Layout Inspector shows the live UI hierarchy of your running debug app. Open it from the <b>Running Devices</b> window with <b>Toggle Layout Inspector</b>. The <b>Component Tree</b> shows the hierarchy and <b>Attributes</b> shows the parameters of the selected composable or view.</p>
<p>For Compose it adds two columns next to each node: how many times it was <b>recomposed</b> and how many times it was <b>skipped</b>. If they are missing, open <b>View Options</b> and select <b>Show Recomposition Counts</b>. Press <b>Reset</b>, do one interaction, then read the numbers. Recompositions also flash as a fading highlight on the screen image.</p>
<p>Below, tapping the button changes a counter. Watch which rows recompose. Then switch the list parameter to a remembered value and tap again.</p>`,
        visual(el) {
          const NODES = [
            { id: 'screen', name: 'NewsScreen', d: 0 },
            { id: 'bar', name: 'TopBar', d: 1 },
            { id: 'count', name: 'ReadCounter', d: 1 },
            { id: 'list', name: 'NewsList', d: 1 },
            { id: 'r1', name: 'NewsRow', d: 2 },
            { id: 'r2', name: 'NewsRow', d: 2 },
            { id: 'r3', name: 'NewsRow', d: 2 },
          ];
          const c = {}; const s = {};
          let read = 0, remembered = false;
          const ui = {
            bar: h('div', { class: 'tl-ui tl-top' }, 'Gündem'),
            count: h('div', { class: 'tl-ui' }),
            list: h('div', { class: 'tl-ui' }, 'NewsList'),
            r1: h('div', { class: 'tl-ui tl-sub' }, 'Deprem raporu'),
            r2: h('div', { class: 'tl-ui tl-sub' }, 'Dolar kuru'),
            r3: h('div', { class: 'tl-ui tl-sub' }, 'Maç sonucu'),
          };
          const phone = h('div', { class: 'tl-phone' }, ui.bar, ui.count, ui.list, ui.r1, ui.r2, ui.r3);
          const rows = {};
          const ct = h('div', { class: 'tl-panel' }, h('div', { class: 'tl-panel-h' }, h('span', {}, 'Component Tree')),
            h('div', { class: 'tl-ct' },
              h('div', { class: 'tl-ct-row tl-ct-head' }, h('span', {}, 'node'), h('span', { class: 'tl-n' }, 'comp'), h('span', { class: 'tl-n' }, 'skip')),
              NODES.map(n => { rows[n.id] = h('div', { class: 'tl-ct-row' }, h('span', { style: `padding-left:${n.d * 12}px` }, n.name), h('span', { class: 'tl-n' }), h('span', { class: 'tl-n' })); return rows[n.id]; })));
          const src = h('div', { class: 'kt' });
          const o = out('');
          function paint(changed = {}) {
            ui.count.textContent = `Okundu: ${read}`;
            NODES.forEach(n => {
              const [, a, b] = rows[n.id].children;
              a.textContent = c[n.id]; b.textContent = s[n.id];
              a.classList.toggle('tl-up', changed[n.id] === 'c'); b.classList.toggle('tl-sk', changed[n.id] === 's');
            });
            src.innerHTML = hl(remembered
              ? 'val visible = remember(all) { all.filter { it.visible } }\nNewsList(items = visible)'
              : 'NewsList(items = all.filter { it.visible })  // new List every time');
          }
          function reset() { NODES.forEach(n => { c[n.id] = 0; s[n.id] = 0; }); paint(); say(o, 'Counts reset. Now do one interaction.'); }
          function tap() {
            read++;
            const ch = { screen: 'c', bar: 's', count: 'c' };
            if (remembered) ch.list = 's';
            else { ch.list = 'c'; ch.r1 = ch.r2 = ch.r3 = 's'; }
            Object.entries(ch).forEach(([k, v]) => { (v === 'c' ? c : s)[k]++; if (v === 'c' && ui[k]) replay(ui[k], 'tl-flash'); });
            paint(ch);
            say(o, remembered
              ? '<span class="good">NewsList skipped.</span> <span class="muted">remember(all) returns the same List instance, so the parameter did not change.</span>'
              : '<span class="bad">NewsList recomposed</span> <span class="muted">even though no news changed. filter() made a new List, and an unstable parameter is compared by instance (===). The rows still skipped: same News objects.</span>');
          }
          const modeBtns = [
            act('filter inline', () => { remembered = false; press(modeBtns, modeBtns[0]); paint(); }),
            act('remember(all) { filter }', () => { remembered = true; press(modeBtns, modeBtns[1]); paint(); }),
          ];
          NODES.forEach(n => { c[n.id] = 1; s[n.id] = 0; });
          press(modeBtns, modeBtns[0]); paint();
          say(o, 'Every node composed once on first show. Tap "Okundu +1".');
          el.append(
            h('div', { class: 'controls' }, act('Okundu +1', tap), act('Reset', reset)),
            h('div', { class: 'controls' }, label('list param'), modeBtns),
            src,
            h('div', { class: 'tl-grid' }, phone, ct), o);
        },
        code: `@Composable
fun NewsScreen(all: List<News>) {
    var read by rememberSaveable { mutableIntStateOf(0) }
    val visible = remember(all) { all.filter { it.visible } }

    Column {
        TopBar(title = "Gündem")            // skips: title did not change
        ReadCounter(read) { read++ }        // recomposes: read changed
        NewsList(items = visible)           // skips: same List instance
    }
}

data class News(val id: Long, val title: String, val visible: Boolean)`,
        remember: 'Reset the counts, do one thing, then ask of every recomposed node: did its input really change?',
        deeper: [
          {
            title: 'Why a new list recomposes but the rows skip',
            body: `<p>To skip, Compose compares each parameter with the last value. Stable parameters are compared with <code>equals()</code>. Unstable ones, which include a plain <code>List</code>, are compared by instance with <code>===</code>. That is the rule under <b>strong skipping</b>, which is on by default since Kotlin 2.0.20.</p>
<p>So <code>all.filter { }</code> inside composition gives NewsList a new instance every time and it recomposes. Each row receives a <code>News</code> made only of <code>val</code> primitives and strings, which is stable and equal, so the rows skip. Wrapping the filter in <code>remember(all)</code> keeps the same instance until <code>all</code> changes.</p>`,
          },
          {
            title: 'Requirements and what the counts need',
            body: `<p>Recomposition counts need the app on API 29 or higher and Compose 1.2.0 or higher. Do not strip the <code>META-INF/androidx.compose.*.version</code> files from your debug APK: Layout Inspector uses them to show Compose nodes.</p>
<p>Double-click a composable in the tree to jump to its source. Select it to see its parameters in Attributes, which is often the fastest way to see which parameter changed.</p>`,
          },
          {
            title: 'Views, too',
            body: `<p>The same tool inspects View-based screens. Select a view to see its resolved attributes, including which style or theme set a color. <b>Show Only Subtree</b> isolates part of a big layout, and <b>Deep Inspect</b> lets you click a component on the screen image to select it. Turn Deep Inspect off when you want to use the app normally.</p>`,
          },
        ],
        underHood: {
          body: `<p>The Compose compiler wraps each restartable composable in a group that records its parameters. On recomposition the runtime compares the new arguments to the stored ones and either runs the body or skips it. Layout Inspector reads these groups through an inspection agent in your debug app and counts each run and each skip.</p>`,
        },
        mistakes: [
          {
            title: 'Building a new collection during composition',
            bad: `NewsList(items = all.filter { it.visible })`,
            good: `val visible = remember(all) { all.filter { it.visible } }
NewsList(items = visible)`,
            why: 'A fresh List is a new instance on every recomposition, so the child cannot skip. Better still, compute the filtered list in the ViewModel.',
          },
          {
            title: 'Reading counts without a reset',
            bad: '// open inspector after 5 minutes of use\n// NewsRow: 312 recompositions -> panic',
            good: '// press Reset, scroll once, read the counts',
            why: 'Totals since launch mix every interaction together. Reset, do one action, then judge.',
          },
        ],
        terms: [
          { term: 'Recomposition', def: 'Running a composable function again because something it reads changed.' },
          { term: 'Skip', def: 'Compose decided the inputs were unchanged and did not run the composable body.' },
          { term: 'Strong skipping', def: 'Compose mode, default since Kotlin 2.0.20, where composables with unstable parameters can still skip if the instances are the same.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the same filtered list instance until the source list changes.', code: 'val visible = [[remember]](all) { all.filter { it.visible } }', why: '<code>remember(all)</code> recomputes only when <code>all</code> changes, so the child gets the same instance and can skip.' },
          { type: 'bug', prompt: 'NewsList recomposes on every tap of an unrelated counter. Tap the cause.', code: '@Composable\nfun NewsScreen(all: List<News>) {\n    var read by remember { mutableIntStateOf(0) }\n    ReadCounter(read) { read++ }\n    NewsList(items = all.sortedBy { it.title })\n}', bug: 4, fix: '    NewsList(items = remember(all) { all.sortedBy { it.title } })', why: '<code>sortedBy</code> returns a new List on every recomposition. Remember it, or sort in the ViewModel.' },
        ],
        quiz: [
          { q: 'The recomposition columns are missing. Where do you turn them on?', options: ['Logcat settings', 'View Options > Show Recomposition Counts', 'Developer options on the phone'], a: 1, why: 'The option lives in the View Options menu of the Component Tree.' },
          { q: 'Under strong skipping, how is an unstable parameter compared?', options: ['With equals()', 'By instance, with ===', 'It is never compared, so it always recomposes'], a: 1, why: 'Unstable parameters use instance equality. Stable ones use equals().' },
        ],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'adb',
        title: 'adb essentials',
        tagline: 'Install, launch, open deep links, wipe data and kill your process from one terminal.',
        level: 'intermediate',
        body: `
<p><code>adb</code> (Android Debug Bridge) is the command line link between your computer and a device. Studio uses it behind the scenes. Using it yourself is faster for repeat tasks and lets you test things the UI cannot, like opening a deep link exactly as a notification would.</p>
<p>The commands you will use most: <code>adb devices -l</code> to list devices, <code>adb install</code>, <code>adb shell am start</code> to start activities or send a VIEW intent with a URL, <code>adb shell pm clear</code> to wipe app data, <code>adb shell dumpsys</code> to inspect system services and <code>adb shell screenrecord</code> for a video of a bug.</p>
<p>One test everyone should run: <b>process death</b>. Put the app in the background, kill its process with <code>adb shell am kill</code>, then reopen it from Recents. A well-built screen comes back with its state. Try it below with and without saved state.</p>`,
        visual(el) {
          const PKG = MINE;
          let installed = false, proc = 'none', screen = 'home', draft = '', saved = true, busy = false, rec = false;
          const term = h('div', { class: 'tl-panel tl-term', 'aria-live': 'polite' }, h('div', { class: 'tl-panel-h' }, h('span', {}, 'Terminal')));
          const scr = h('div', { class: 'tl-panel tl-scr' });
          const recDot = h('span', { class: 'tl-rec', hidden: true }, 'REC');
          const procPill = h('span', { class: 'tl-pill' });
          const o = out('');
          const print = (t, cls = '') => { term.append(h('div', { class: `tl-ln ${cls}` }, t)); term.scrollTop = term.scrollHeight; };
          function paint() {
            procPill.className = 'tl-pill ' + ({ fg: 'tl-ok', bg: 'tl-warn', dead: 'tl-err', none: 'tl-ghost' }[proc]);
            procPill.textContent = { fg: 'process: foreground', bg: 'process: cached (background)', dead: 'process: killed', none: 'process: not running' }[proc];
            if (proc !== 'fg') { scr.className = 'tl-panel tl-scr tl-off'; scr.replaceChildren(h('div', {}, installed ? 'Launcher' : 'Launcher (Haber not installed)')); return; }
            scr.className = 'tl-panel tl-scr';
            scr.replaceChildren(recDot,
              h('div', { class: 'tl-panel-h' }, h('span', {}, 'Haber'), h('span', {}, screen === 'article' ? 'haber/42' : 'feed')),
              ...(screen === 'article'
                ? [h('div', { class: 'tl-ln tl-wrap' }, 'Haber #42: Deprem raporu'), h('div', { class: 'tl-ln tl-wrap', style: 'color:var(--t-s)' }, `Yorum taslağı: ${draft ? '"' + draft + '"' : '(empty)'}`)]
                : [h('div', { class: 'tl-ln' }, '• Gündem'), h('div', { class: 'tl-ln' }, '• Ekonomi'), h('div', { class: 'tl-ln' }, '• Spor')]));
            recDot.hidden = !rec;
          }
          async function runCmd(c, fn) {
            if (busy) return; busy = true;
            print('$ ' + c, 'tl-ps');
            await sleep(250);
            if (!el.isConnected) return;
            fn();
            paint(); busy = false;
          }
          const notInstalled = () => { print(`Error: Activity class {${PKG}/${PKG}.MainActivity} does not exist.`, 'tl-er'); say(o, 'Install the app first.'); };
          const CMDS = [
            ['adb devices -l', () => { print('List of devices attached'); print('emulator-5554  device product:sdk_gphone64_x86_64 model:Pixel_8 transport_id:1'); say(o, 'One emulator. With several devices, pick one with <span class="muted">adb -s emulator-5554 ...</span>'); }],
            ['adb install app-debug.apk', () => { print('Performing Streamed Install'); print('Success'); installed = true; say(o, 'Installed. Nothing is running yet.'); }],
            [`adb shell am start -n ${PKG}/.MainActivity`, () => { if (!installed) return notInstalled(); print(`Starting: Intent { cmp=${PKG}/.MainActivity }`); proc = 'fg'; screen = 'feed'; say(o, 'Started the activity by component name.'); }],
            ['adb shell am start -a android.intent.action.VIEW -d "https://haber.example.com/haber/42"', () => { if (!installed) return notInstalled(); print('Starting: Intent { act=android.intent.action.VIEW dat=https://haber.example.com/... }'); proc = 'fg'; screen = 'article'; say(o, 'The same intent a notification or a browser link would send. Your intent filter routed it to article 42.'); }],
            [`adb shell pm clear ${PKG}`, () => { if (!installed) { print('Error: package not found', 'tl-er'); return; } print('Success'); proc = 'none'; draft = ''; screen = 'feed'; say(o, 'All app data deleted and the app stopped: like a fresh install, without reinstalling. Good for onboarding and login tests.'); }],
            [`adb shell dumpsys meminfo ${PKG}`, () => { if (proc === 'fg' || proc === 'bg') { print(`** MEMINFO in pid 12345 [${PKG}] **`); print('                 Pss Total  Private Dirty'); print('  Native Heap        14210          14120'); print('  Dalvik Heap         9832           9744'); print('        TOTAL        61048          41230'); say(o, 'Watch Pss Total and Private Dirty. Numbers here are made up for the demo.'); } else { print(`No process found for: ${PKG}`, 'tl-er'); } }],
            ['adb shell screenrecord --time-limit 10 /sdcard/bug.mp4', async () => { if (proc !== 'fg') { say(o, 'Open the app first so there is something to record.'); } rec = true; paint(); say(o, 'Recording (max 180 s, no audio). Then: <span class="muted">adb pull /sdcard/bug.mp4</span>'); await sleep(1600); rec = false; if (el.isConnected) { paint(); print('(recording saved to /sdcard/bug.mp4)', 'tl-nt'); } }],
            [`adb shell am kill ${PKG}`, () => {
              if (proc === 'fg') { say(o, '<span class="bad">Nothing happened.</span> <span class="muted">am kill only kills processes that are safe to kill. A foreground app is not. Press Home first.</span>'); return; }
              if (proc === 'bg') { proc = 'dead'; say(o, 'The cached process is gone, just as if the system reclaimed memory. Now reopen from Recents.'); return; }
              say(o, 'No process to kill.');
            }],
          ];
          const btns = CMDS.map(([c, fn]) => cmdk(c, () => runCmd(c, fn)));
          const savedBtn = act('State in SavedStateHandle', () => { saved = !saved; savedBtn.setAttribute('aria-pressed', String(saved)); say(o, saved ? 'The draft is saved in SavedStateHandle.' : 'The draft lives only in a ViewModel field.'); });
          const phoneBtns = [
            act('Type a comment draft', () => { if (proc !== 'fg' || screen !== 'article') { say(o, 'Open article 42 with the deep link command first.'); return; } draft = 'Geçmiş olsun'; paint(); }),
            act('Home', () => { if (proc === 'fg') { proc = 'bg'; paint(); say(o, 'App in the background. Its process is now cached and killable.'); } }),
            act('Open from Recents', () => {
              if (proc === 'bg') { proc = 'fg'; paint(); say(o, 'Same process, nothing was lost. That is not the interesting case.'); return; }
              if (proc === 'dead') { proc = 'fg'; if (!saved) draft = ''; paint(); say(o, saved ? '<span class="good">New process, same screen and draft.</span> <span class="muted">The system restored the back stack and saved state.</span>' : '<span class="bad">New process, the screen is back but the draft is gone.</span> <span class="muted">A ViewModel field dies with the process.</span>'); return; }
              say(o, 'Nothing in Recents yet.');
            }),
          ];
          savedBtn.setAttribute('aria-pressed', 'true');
          paint();
          say(o, 'Run the commands top to bottom. For process death: deep link, type a draft, Home, am kill, Open from Recents.');
          el.append(
            h('div', { class: 'tl-grid' },
              h('div', { class: 'tl-cmds' }, btns),
              h('div', { class: 'tl-dev' }, h('div', { class: 'tl-row' }, procPill), scr, h('div', { class: 'controls' }, phoneBtns, savedBtn))),
            term, o);
        },
        code: `# which devices are connected (use -s <serial> when there are several)
adb devices -l

# install, then start by component name
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.mynet.haber/.MainActivity

# open a deep link exactly like a notification would
adb shell am start -a android.intent.action.VIEW -d "https://haber.example.com/haber/42"

# fresh start: delete all app data
adb shell pm clear com.mynet.haber

# process death test: press Home on the device first
adb shell am kill com.mynet.haber
# ...then reopen the app from Recents

# memory snapshot and a screen recording
adb shell dumpsys meminfo com.mynet.haber
adb shell screenrecord --time-limit 30 /sdcard/bug.mp4
adb pull /sdcard/bug.mp4`,
        remember: 'Deep link with am start -a VIEW -d, fresh start with pm clear, process death with Home then am kill then Recents.',
        deeper: [
          {
            title: 'Process death, the bug QA always finds',
            body: `<p>Android kills cached background processes when it needs memory. When the user comes back, the system creates a new process, rebuilds the activity and hands back what you saved. Anything kept only in memory, like a ViewModel field or a singleton, starts empty.</p>
<p><code>am kill</code> reproduces this on demand, because it only kills processes that are safe to kill. <code>am force-stop</code> is different: it stops everything for the package and clears the task, which is like the user force stopping the app. That does not test state restoration.</p>
<p>The Developer options switch <b>Don't keep activities</b> is a related test: it destroys each activity as soon as you leave it.</p>`,
            code: `class ArticleViewModel(private val saved: SavedStateHandle) : ViewModel() {
    val draft: StateFlow<String> = saved.getStateFlow("draft", "")
    fun onDraftChange(text: String) { saved["draft"] = text }   // survives process death
}`,
          },
          {
            title: 'dumpsys, one service at a time',
            body: `<p><code>dumpsys</code> prints the state of a system service. <code>adb shell dumpsys -l</code> lists the services. The two most useful for app work are <code>meminfo &lt;package&gt;</code> (look at <b>Pss Total</b> and <b>Private Dirty</b>) and <code>gfxinfo &lt;package&gt;</code> for frame timing. Add <code>-h</code> after a service name to see its options.</p>`,
            code: `adb shell dumpsys -l
adb shell dumpsys meminfo -d com.mynet.haber
adb shell dumpsys gfxinfo com.mynet.haber framestats`,
          },
          {
            title: 'Logs from the command line',
            body: `<p><code>adb logcat</code> streams the same log Studio shows. Its filter is a list of <code>tag:priority</code> pairs, and <code>*:S</code> silences every other tag. It is handy on a CI machine or when you share a log with someone who does not use Studio.</p>`,
            code: `adb logcat FeedViewModel:D AndroidRuntime:E *:S`,
          },
        ],
        underHood: {
          body: `<p>adb has three parts: the client you type into, a server process on your computer that tracks devices, and the <code>adbd</code> daemon on the device. <code>adb shell am</code> and <code>adb shell pm</code> run the activity manager and package manager command line tools on the device itself, which is why they behave like the system would.</p>`,
        },
        mistakes: [
          {
            title: 'Testing restoration with force-stop',
            bad: 'adb shell am force-stop com.mynet.haber\n# reopen -> starts at the launcher screen, "works fine"',
            good: '# press Home\nadb shell am kill com.mynet.haber\n# reopen from Recents -> must restore the screen and draft',
            why: 'force-stop also clears the task, so nothing is restored and you never test your saved state. am kill on a backgrounded app matches what the system does under memory pressure.',
          },
        ],
        terms: [
          { term: 'adb', def: 'Android Debug Bridge: command line tool to install, run, inspect and control a device.' },
          { term: 'am', def: 'Activity manager command on the device: start activities, send intents, kill processes.' },
          { term: 'pm', def: 'Package manager command on the device: install, list and clear packages.' },
          { term: 'Process death', def: 'The system killing a background app process to free memory, then recreating the app when the user returns.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Open article 42 through its deep link.', code: 'adb shell am start -a android.intent.action.[[VIEW]] -d "https://haber.example.com/haber/42"', why: 'A VIEW intent with a data URI is what a browser or notification sends. Your intent filter decides which activity handles it.' },
          { type: 'bug', prompt: 'This process death test never kills the process. Tap the wrong step.', code: '# 1. open article 42 and type a draft\n# 2. keep the app on screen\n# 3. adb shell am kill com.mynet.haber\n# 4. reopen from Recents', bug: 1, fix: '# 2. press Home so the app goes to the background', why: '<code>am kill</code> only kills processes that are safe to kill. A foreground app is not one of them.' },
        ],
        quiz: [
          { q: 'Which command deletes all data of an app without uninstalling it?', options: ['adb uninstall -k', 'adb shell pm clear <package>', 'adb shell am kill <package>'], a: 1, why: '<code>pm clear</code> deletes all data associated with the package.' },
          { q: 'You run <code>am kill</code> while your app is on screen. What happens?', options: ['The app crashes', 'Nothing: a foreground process is not safe to kill', 'The app restarts at its launcher activity'], a: 1, why: 'am kill only kills processes that will not hurt the user experience.' },
          { q: 'What is the maximum length of one <code>adb shell screenrecord</code>?', options: ['30 seconds', '3 minutes', 'Unlimited'], a: 1, why: 'The default and maximum <code>--time-limit</code> is 180 seconds.' },
        ],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'lint',
        title: 'Android Lint and static analysis',
        tagline: 'Let tools find bugs before users do, and use a baseline so old issues do not hide new ones.',
        level: 'intermediate',
        body: `
<p>Android Lint reads your source, resources and manifest and reports likely bugs: calling an API newer than your <code>minSdk</code>, text that ignores locale, unused resources, accessibility gaps. Each issue has an id and a severity: informational, warning, error or fatal. Lint is not part of a normal build. You run it with <code>./gradlew lint</code> or <code>lintDebug</code>, and it writes an HTML report under <code>app/build/reports/</code>.</p>
<p>An old project may start with hundreds of issues. A <b>baseline</b> records today's issues in <code>lint-baseline.xml</code>, and later runs report only new ones. You stop the bleeding now and pay down the old debt over time.</p>
<p>Run lint below, create the baseline, then add new code and raise a severity.</p>`,
        visual(el) {
          const BASE_CODE = [
            ['if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {', 'ObsoleteSdkInt'],
            ['    window.insetsController?.hide(statusBars())', 'NewApi'],
            ['}', null],
            ['binding.count.text = "Okundu: " + read', 'SetTextI18n'],
          ];
          const NEW_LINE = ['val label = String.format("%.1f MB", size)', 'DefaultLocale'];
          const ISSUES = {
            ObsoleteSdkInt: { sev: 'warning', msg: 'Unnecessary; SDK_INT is always >= 24' },
            NewApi: { sev: 'error', msg: 'Call requires API level 30 (current min is 24)' },
            SetTextI18n: { sev: 'warning', msg: 'Do not concatenate text displayed with setText. Use resource string with placeholders.' },
            DefaultLocale: { sev: 'warning', msg: 'Implicitly using the default locale is a common source of bugs' },
          };
          let added = false, baseline = null, raised = false, ran = false;
          const codeP = h('div', { class: 'tl-panel' });
          const list = h('div', { class: 'tl-issues', 'aria-live': 'polite' });
          const cfg = h('div', { class: 'kt' });
          const o = out('');
          const lines = () => added ? [...BASE_CODE, NEW_LINE] : BASE_CODE;
          const sevOf = id => id === 'DefaultLocale' && raised ? 'error' : ISSUES[id].sev;
          function paint() {
            codeP.replaceChildren(h('div', { class: 'tl-panel-h' }, h('span', {}, 'HeaderBinder.kt'), h('span', {}, 'minSdk 24')),
              ...lines().map(([t, id]) => h('div', { class: 'tl-ln' + (id && ran && !(baseline && baseline.has(id)) ? ' tl-errl' : '') + (t === NEW_LINE[0] ? ' tl-new' : ''), html: hl(t) })));
            cfg.innerHTML = hl(`android {\n    lint {\n${baseline ? '        baseline = file("lint-baseline.xml")\n' : ''}        abortOnError = true   // default\n    }\n}`) +
              (raised ? '\n' + esc('<!-- lint.xml -->\n<issue id="DefaultLocale" severity="error" />') : '');
          }
          function run() {
            ran = true;
            const found = lines().filter(l => l[1]).map(l => l[1]);
            const fresh = found.filter(id => !(baseline && baseline.has(id)));
            list.replaceChildren(...found.map(id => {
              const inBase = baseline && baseline.has(id); const sev = sevOf(id);
              return h('div', { class: 'tl-issue' + (inBase ? ' tl-base' : '') },
                h('span', { class: `tl-pill ${inBase ? 'tl-ghost' : sev === 'error' ? 'tl-err' : 'tl-warn'}` }, inBase ? 'baseline' : sev),
                h('span', { class: 'tl-msg' }, h('b', {}, id), ': ', ISSUES[id].msg));
            }));
            replay(list, 'pop-soft');
            const errs = fresh.filter(id => sevOf(id) === 'error').length;
            const warns = fresh.length - errs;
            paint();
            say(o, `$ ./gradlew lintDebug  <span class="muted">${errs} errors, ${warns} warnings${baseline ? `, ${found.length - fresh.length} filtered by baseline` : ''}</span><br>` +
              (errs ? '<span class="bad">BUILD FAILED</span> <span class="muted">Lint found errors. abortOnError is true by default.</span>' : '<span class="good">BUILD SUCCESSFUL</span>'));
          }
          function makeBaseline() {
            baseline = new Set(lines().filter(l => l[1]).map(l => l[1]));
            paint(); list.replaceChildren();
            say(o, `Wrote lint-baseline.xml with ${baseline.size} issues. <span class="muted">Commit it. Run lint again: these no longer fail the build.</span>`);
          }
          const addBtn = act('Add new code', () => { if (added) return; added = true; paint(); say(o, 'A new line that formats a number with the default locale. Run lint.'); });
          const raiseBtn = act('lint.xml: DefaultLocale = error', () => { raised = !raised; raiseBtn.setAttribute('aria-pressed', String(raised)); paint(); say(o, raised ? 'DefaultLocale is now an error for this project. Run lint.' : 'Back to the default severity.'); });
          paint();
          say(o, 'Run lint on this legacy file first.');
          el.append(
            h('div', { class: 'controls' }, cmdk('./gradlew lintDebug', run), act('Create baseline', makeBaseline), addBtn, raiseBtn),
            h('div', { class: 'tl-grid' }, codeP, h('div', { class: 'tl-issues' }, label('issues'), list)),
            cfg, o);
        },
        code: `// app/build.gradle.kts
android {
    lint {
        baseline = file("lint-baseline.xml")   // first run creates it; commit it
        checkDependencies = true               // also analyze library modules
        disable += "TypographyFractions"
        // abortOnError is true by default: lint errors fail the task
    }
}

// lint.xml in the project root: per-issue severity
// <lint>
//     <issue id="DefaultLocale" severity="error" />
//     <issue id="UnusedResources" severity="ignore" />
// </lint>`,
        remember: 'Baseline the old issues, fail the build on new errors, and run lint in CI because the normal build skips it.',
        deeper: [
          {
            title: 'Suppress narrowly, and say why',
            body: `<p>Sometimes lint is wrong for your case. Suppress the one issue on the smallest element that needs it, with <code>@SuppressLint("IssueId")</code> in code or <code>tools:ignore="IssueId"</code> in XML. Avoid <code>"all"</code>: it also hides future real bugs in that element. Leave a short comment explaining why.</p>`,
            code: `@SuppressLint("SetTextI18n") // debug-only overlay, never translated
fun showBuildInfo(view: TextView) {
    view.text = "build " + BuildConfig.VERSION_NAME
}`,
          },
          {
            title: 'Refreshing the baseline',
            body: `<p>Baselines only shrink if you fix things. When you fix a batch of old issues, delete <code>lint-baseline.xml</code> and run lint again to write a smaller one. Review that diff like code: a baseline that grows means someone hid new issues in it.</p>
<p>In the IDE, baselines apply to batch runs such as <b>Code &gt; Inspect Code</b>, not to the live highlighting in the editor. So you still see old issues as you edit the file, which nudges you to fix them.</p>`,
            code: `rm app/lint-baseline.xml
./gradlew lintDebug -Dlint.baselines.continue=true`,
          },
          {
            title: 'detekt and ktlint',
            body: `<p>Lint knows Android: APIs, resources, the manifest. Two Kotlin tools cover the rest. <b>detekt</b> finds code smells such as long methods, deep nesting and swallowed exceptions, and it also supports a baseline for legacy code. <b>ktlint</b> enforces a formatting style, reads <code>.editorconfig</code>, and can fix most problems itself with <code>ktlint --format</code>.</p>
<p>Use them together: ktlint so nobody argues about formatting in review, detekt for structure, lint for Android. All three fit in the same CI step.</p>`,
            code: `./gradlew lintDebug detekt
ktlint --format "app/src/**/*.kt"`,
          },
        ],
        underHood: {
          body: `<p>Lint parses Kotlin and Java into a shared tree model (UAST) and runs detectors over it, plus detectors for XML resources, the manifest and Gradle files. Libraries can ship their own detectors inside the AAR. That is how AndroidX and Compose libraries warn about their own API misuse.</p>`,
        },
        mistakes: [
          {
            title: 'Turning lint off to get a green build',
            bad: `lint {
    abortOnError = false
}`,
            good: `lint {
    baseline = file("lint-baseline.xml")
}`,
            why: 'abortOnError = false lets every new error through too. A baseline accepts only the issues you already have.',
          },
          {
            title: 'Suppressing everything',
            bad: '@SuppressLint("all")\nclass HeaderBinder { ... }',
            good: '@SuppressLint("SetTextI18n") // reason\nfun showBuildInfo(...) { ... }',
            why: 'Suppress the exact id on the smallest element so future issues in the class still show up.',
          },
        ],
        terms: [
          { term: 'Lint issue id', def: 'The stable name of a check, such as NewApi or DefaultLocale, used in config and suppressions.' },
          { term: 'Severity', def: 'How lint treats an issue: ignore, informational, warning, error or fatal.' },
          { term: 'Baseline', def: 'A file of known issues that lint filters out, so only new issues are reported.' },
          { term: 'Static analysis', def: 'Finding problems by reading code, without running it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Point lint at a baseline file.', code: 'android {\n    lint {\n        [[baseline]] = file("lint-baseline.xml")\n    }\n}', why: 'The first run writes the file. Later runs report only issues that are not in it.' },
          { type: 'bug', prompt: 'New lint errors no longer fail CI. Tap the line responsible.', code: 'android {\n    lint {\n        baseline = file("lint-baseline.xml")\n        abortOnError = false\n        checkDependencies = true\n    }\n}', bug: 3, fix: '        abortOnError = true', why: 'With abortOnError off, lint reports errors but the task still succeeds. The baseline already covers the old issues.' },
        ],
        quiz: [
          { q: 'Does a normal <code>assembleDebug</code> run lint?', options: ['Yes, always', 'No, run lint explicitly, for example in CI', 'Only for release builds'], a: 1, why: 'Lint is not part of the normal build. Run <code>lint</code> or <code>lintDebug</code> yourself or in CI.' },
          { q: 'What problem does a lint baseline solve?', options: ['It speeds up lint', 'Hundreds of old issues hiding the new ones', 'It fixes issues automatically'], a: 1, why: 'Known issues are filtered out so new ones stand out and can fail the build.' },
          { q: 'Which tool would flag a 200-line function in Kotlin?', options: ['ktlint', 'detekt', 'adb'], a: 1, why: 'detekt reports code smells like long methods. ktlint is about formatting.' },
        ],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'ci',
        title: 'CI on every pull request',
        tagline: 'A GitHub Actions workflow runs lint, unit tests and a build on every PR, with a Gradle cache so it stays fast.',
        level: 'advanced',
        body: `
<p>Continuous integration (CI) means a clean machine builds and checks every change before it is merged. "Works on my machine" stops being an argument, and lint finally runs, because nobody has to remember it.</p>
<p>A workflow file in <code>.github/workflows/</code> triggers on <code>pull_request</code>. It checks out the code, installs a JDK with <code>actions/setup-java</code>, sets up Gradle with <code>gradle/actions/setup-gradle</code>, then runs <code>lintDebug</code>, <code>testDebugUnitTest</code> and <code>assembleDebug</code>. Branch protection can then require the check to pass before merging.</p>
<p><code>setup-gradle</code> caches Gradle's downloads and build outputs by default. Only runs on the default branch write the cache. Pull requests read it. So the first PR in a repo runs cold, and after a merge to main the next PR is fast. Try the order below.</p>`,
        visual(el) {
          const STEPS = [
            { id: 'co', name: 'actions/checkout', cold: 3, warm: 3 },
            { id: 'jdk', name: 'actions/setup-java (temurin 17)', cold: 9, warm: 6 },
            { id: 'gr', name: 'gradle/actions/setup-gradle', cold: 4, warm: 22 },
            { id: 'lint', name: './gradlew lintDebug', cold: 150, warm: 48 },
            { id: 'test', name: './gradlew testDebugUnitTest', cold: 95, warm: 34 },
            { id: 'asm', name: './gradlew assembleDebug', cold: 70, warm: 24 },
          ];
          let cacheOnMain = false, busy = false, token = 0;
          const rows = STEPS.map(s => { const r = h('div', { class: 'tl-step' }, h('span', { class: 'tl-dot' }), h('span', {}, s.name), h('span', { class: 'tl-t' }, '')); r.t = r.lastChild; return r; });
          const check = h('div', { class: 'tl-check' }, h('span', {}, 'No runs yet'));
          const cachePill = h('span', { class: 'tl-pill tl-ghost' });
          const o = out('');
          const mmss = s => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
          const paintCache = () => { cachePill.className = 'tl-pill ' + (cacheOnMain ? 'tl-ok' : 'tl-ghost'); cachePill.textContent = cacheOnMain ? 'cache: saved from main' : 'cache: empty'; };
          async function go(kind) {
            if (busy) return; busy = true; const my = ++token;
            const onMain = kind === 'merge';
            const warm = cacheOnMain;
            const failTest = kind === 'fail';
            rows.forEach(r => { r.className = 'tl-step'; r.t.textContent = ''; });
            check.className = 'tl-check'; check.replaceChildren(h('span', {}, onMain ? 'push to main: CI running…' : 'PR #128: checks running…'));
            let total = 0, failed = false;
            for (let i = 0; i < STEPS.length; i++) {
              const s = STEPS[i], r = rows[i];
              if (failed) { r.classList.add('tl-skip'); r.t.textContent = 'skipped'; continue; }
              r.classList.add('tl-run');
              await sleep(warm ? 260 : 520); if (!el.isConnected || my !== token) return;
              const sec = warm ? s.warm : s.cold; total += sec;
              r.classList.remove('tl-run');
              if (failTest && s.id === 'test') { r.classList.add('tl-fail'); r.t.textContent = mmss(sec); failed = true; replay(r, 'shake'); continue; }
              r.classList.add('tl-pass');
              r.t.textContent = s.id === 'gr' ? (warm ? 'cache restored' : 'cache miss') : mmss(sec);
            }
            if (onMain) { cacheOnMain = true; paintCache(); }
            check.className = 'tl-check ' + (failed ? 'tl-err' : 'tl-ok');
            check.replaceChildren(h('span', { class: `tl-pill ${failed ? 'tl-err' : 'tl-ok'}` }, failed ? 'failing' : 'passed'),
              h('span', {}, `${onMain ? 'main' : 'PR #128'} · build · ${mmss(total)}`),
              ...(failed ? [h('span', { class: 'muted-text' }, 'Merge blocked by branch protection')] : []));
            say(o, failed
              ? '<span class="bad">FeedViewModelTest > parse skips items without title FAILED.</span> <span class="muted">assembleDebug was skipped. Fix the test and push again.</span>'
              : onMain ? '<span class="good">Main is green and the cache is saved.</span> <span class="muted">Pull requests will now restore it.</span>'
                : warm ? '<span class="good">Fast run.</span> <span class="muted">The PR restored the cache that main wrote, but it does not write its own.</span>'
                  : '<span class="good">Passed, but slow.</span> <span class="muted">Cold cache: Gradle downloaded everything. PRs do not save the cache, so the next PR is cold too, until main runs.</span>');
            busy = false;
          }
          paintCache();
          say(o, 'Open a PR first, then merge to main, then push to a PR again.');
          el.append(
            h('div', { class: 'controls' }, act('Open PR', () => go('pr')), act('Merge to main', () => go('merge')), act('Push PR with a failing test', () => go('fail'))),
            h('div', { class: 'tl-row' }, label('job: build · ubuntu-latest'), cachePill),
            h('div', { class: 'tl-pipe' }, rows), check, o);
        },
        code: `# .github/workflows/android.yml
name: Android CI

on:
  pull_request:
  push:
    branches: [main]          # main runs write the Gradle cache

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true    # a new push cancels the old run

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: 17
      - uses: gradle/actions/setup-gradle@v6   # caching on by default
      - run: ./gradlew lintDebug testDebugUnitTest assembleDebug
      - if: always()
        uses: actions/upload-artifact@v6
        with:
          name: reports
          path: app/build/reports/`,
        remember: 'Trigger on pull_request, run lint + unit tests + assembleDebug, let setup-gradle cache, and also run on main so the cache gets written.',
        deeper: [
          {
            title: 'Why the main branch must run too',
            body: `<p><code>setup-gradle</code> writes the cache only from jobs on the default branch. Jobs on other branches read it but do not write it. If your workflow only triggers on <code>pull_request</code>, nothing ever writes the cache and every run is cold. Add <code>push: branches: [main]</code> so merges refresh it.</p>
<p>The same action also validates the Gradle wrapper JAR by default, which protects you from a pull request that swaps in a tampered wrapper.</p>`,
          },
          {
            title: 'Keep the reports when something fails',
            body: `<p>When lint or a test fails in CI, you want the HTML reports, not just the log. Upload <code>app/build/reports/</code> as an artifact with <code>if: always()</code>, so the step runs even after a failure. Lint reports land in <code>app/build/reports/lint-results-debug.html</code>, and unit test reports go in <code>app/build/reports/tests/</code>.</p>`,
          },
          {
            title: 'Make the check required',
            body: `<p>A check that can be ignored will be ignored on a busy day. In the repository settings, add a branch protection rule (or ruleset) for <code>main</code> that requires the <code>build</code> check to pass before merging. Now a red pipeline blocks the merge button.</p>
<p>Keep the PR job fast: lint, unit tests and one build. Slower jobs such as instrumented tests on emulators can run on a schedule or only on main.</p>`,
          },
        ],
        underHood: {
          body: `<p>Each run starts on a fresh virtual machine. Without a cache, Gradle downloads the Android Gradle Plugin, Kotlin and every dependency, and compiles everything from scratch. <code>setup-gradle</code> saves parts of the Gradle user home (downloaded artifacts and the build cache) at the end of a default-branch job and restores them at the start of later jobs, so most tasks come back from cache.</p>`,
        },
        mistakes: [
          {
            title: 'Only triggering on pull_request',
            bad: `on:
  pull_request:`,
            good: `on:
  pull_request:
  push:
    branches: [main]`,
            why: 'PR jobs only read the Gradle cache. Without main runs, nothing writes it and every PR is cold.',
          },
          {
            title: 'Running only the build',
            bad: '- run: ./gradlew assembleDebug',
            good: '- run: ./gradlew lintDebug testDebugUnitTest assembleDebug',
            why: 'A build that compiles proves little. Lint and unit tests are the checks nobody runs by hand.',
          },
        ],
        terms: [
          { term: 'Workflow', def: 'A YAML file in .github/workflows that defines when jobs run and what they do.' },
          { term: 'Job / step', def: 'A job runs on one machine. Steps run in order inside it; a failed step skips the rest.' },
          { term: 'Required check', def: 'A status that must pass before a pull request can be merged, set by branch protection.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the workflow on every pull request and on pushes to main.', code: 'on:\n  [[pull_request]]:\n  push:\n    branches: [ [[main]] ]', why: 'PRs get checked, and main runs write the Gradle cache that PRs read.' },
          { type: 'bug', prompt: 'CI is green but lint errors keep reaching main. Tap the line.', code: 'steps:\n  - uses: actions/checkout@v6\n  - uses: actions/setup-java@v5\n    with: { distribution: temurin, java-version: 17 }\n  - uses: gradle/actions/setup-gradle@v6\n  - run: ./gradlew testDebugUnitTest assembleDebug', bug: 5, fix: '  - run: ./gradlew lintDebug testDebugUnitTest assembleDebug', why: 'Lint is not part of the normal build. If CI does not run it, nothing does.' },
        ],
        quiz: [
          { q: 'Which jobs write the Gradle cache with setup-gradle by default?', options: ['Every job', 'Only jobs on the default branch', 'Only pull request jobs'], a: 1, why: 'Other branches read the cache but do not write it.' },
          { q: 'The test step fails. What happens to assembleDebug in the same job?', options: ['It runs anyway', 'It is skipped', 'It runs in a new job'], a: 1, why: 'Steps run in order and a failure skips the rest, unless a step uses <code>if: always()</code>.' },
          { q: 'Why upload <code>app/build/reports/</code> with <code>if: always()</code>?', options: ['To make the build faster', 'So you get the lint and test HTML reports even when the job fails', 'GitHub requires it'], a: 1, why: 'The reports are most useful exactly when something failed.' },
        ],
      },
    ],
  });
})();
