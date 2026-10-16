/* Kotlin Multiplatform track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed kmp-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const pick = (btns, i) => btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
  const kt = src => h('div', { class: 'kt', html: hl(src) });

  const css = `
.kmp-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.kmp-grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr)); gap: 14px; min-width: 0; }
.kmp-panel { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, opacity 0.25s, background 0.25s; }
.kmp-panel.kmp-on { border-color: var(--accent); background: var(--accent-soft); }
.kmp-panel.kmp-dim { opacity: 0.4; }
.kmp-panel .kt { white-space: pre; }
.kmp-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px 10px; min-width: 0; }
.kmp-name { font: 700 0.86rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.kmp-flash { animation: kmp-flash 0.8s ease-out; }
@keyframes kmp-flash { from { box-shadow: 0 0 0 5px var(--accent-soft); border-color: var(--accent); } }

/* 1 source sets */
.kmp-tree { display: grid; gap: 6px; min-width: 0; }
.kmp-ss { display: grid; gap: 6px; margin-left: calc(var(--d) * 14px); padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, opacity 0.25s, background 0.25s; }
.kmp-ss.kmp-on { border-color: var(--accent); background: var(--accent-soft); }
.kmp-ss.kmp-dim { opacity: 0.35; }
.kmp-ss-note { font-size: 0.8rem; color: var(--muted); }
.kmp-files { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.kmp-file { font: 600 0.76rem var(--mono); padding: 3px 8px; border-radius: 6px; background: var(--code-bg); color: var(--t-t); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kmp-file.kmp-common { color: var(--t-f); }
.kmp-pipe { display: grid; gap: 10px; align-content: start; padding: 12px; border-radius: 14px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.kmp-inbox { display: flex; flex-wrap: wrap; gap: 6px; min-height: 34px; padding: 6px; border-radius: 10px; background: var(--sunk); min-width: 0; }
.kmp-steps { display: grid; gap: 6px; }
.kmp-step { font: 600 0.8rem var(--mono); padding: 6px 10px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: border-color 0.2s, color 0.2s; }
.kmp-step.kmp-on { border-color: var(--accent); color: var(--ink); }
.kmp-art { display: grid; place-items: center; min-height: 54px; border-radius: 12px; border: 2px dashed var(--line); font: 700 0.9rem var(--mono); color: var(--muted); padding: 6px; text-align: center; overflow-wrap: anywhere; }
.kmp-art.kmp-ready { border-style: solid; border-color: var(--ok); background: var(--ok-soft); color: var(--ok); }

/* 2 expect / actual */
.kmp-actuals { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.kmp-panel.kmp-missing { border-style: dashed; border-color: var(--err); background: var(--err-soft); }
.kmp-result { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-height: 52px; }
.kmp-res { font: 600 0.95rem var(--mono); padding: 8px 14px; border-radius: 10px; background: var(--accent); color: var(--accent-ink); max-width: 100%; overflow-wrap: anywhere; }
.kmp-res.kmp-err { background: var(--err); }

/* device frames */
.kmp-devs { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; align-items: flex-start; padding: 12px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.kmp-dev-wrap { display: grid; gap: 6px; justify-items: center; min-width: 0; }
.kmp-dev { position: relative; width: 140px; height: 232px; border: 7px solid var(--code-bg); border-radius: 22px; background: var(--surface); padding: 20px 9px 10px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; transition: border-color 0.25s; }
.kmp-dev::before { content: ""; position: absolute; top: 6px; left: 50%; transform: translateX(-50%); background: var(--code-bg); }
.kmp-and::before { width: 8px; height: 8px; border-radius: 50%; }
.kmp-ios { border-radius: 28px; }
.kmp-ios::before { width: 44px; height: 11px; border-radius: 999px; }
.kmp-win { width: 230px; height: 170px; border: 2px solid var(--ink); border-radius: 10px; padding: 0; gap: 0; }
.kmp-win::before { display: none; }
.kmp-win-bar { display: flex; gap: 5px; align-items: center; padding: 6px 8px; background: var(--sunk); border-bottom: 1px solid var(--line); font: 600 0.68rem var(--mono); color: var(--muted); }
.kmp-win-bar i { width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
.kmp-win-body { display: flex; flex-direction: column; gap: 6px; padding: 10px; flex: 1; min-height: 0; }
.kmp-dev.kmp-ask { border-color: var(--accent); }
.kmp-scr-title { font: 700 0.86rem var(--display); }
.kmp-and .kmp-scr-title { padding: 2px 0 4px; }
.kmp-ios .kmp-scr-title { text-align: center; }
.kmp-list { display: grid; gap: 4px; align-content: start; flex: 1 1 auto; min-height: 0; overflow: hidden; }
.kmp-li { font-size: 0.74rem; line-height: 1.25; padding: 5px 7px; overflow-wrap: anywhere; }
.kmp-and .kmp-li { background: var(--sunk); border-radius: 8px; }
.kmp-ios .kmp-li { border-bottom: 1px solid var(--line); padding-inline: 2px; }
.kmp-li.kmp-new { animation: drop-in 0.42s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
.kmp-empty { font-size: 0.74rem; color: var(--muted); text-align: center; margin: auto 0; }
.kmp-foot { margin-top: auto; font: 600 0.62rem var(--mono); color: var(--muted); }
.kmp-spin { width: 26px; height: 26px; margin: auto; border-radius: 50%; border: 3px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }

/* 3 repository */
.kmp-repo { display: grid; gap: 8px; padding: 12px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); min-width: 0; }
.kmp-layers { display: flex; flex-wrap: wrap; gap: 6px; }
.kmp-layer { display: grid; gap: 1px; padding: 6px 10px; border-radius: 9px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.kmp-layer b { font: 600 0.76rem var(--mono); }
.kmp-layer small { font-size: 0.7rem; color: var(--muted); }
.kmp-layer.kmp-on { border-color: var(--accent); background: var(--accent-soft); }
.kmp-layer.kmp-ok { border-color: var(--ok); background: var(--ok-soft); }
.kmp-layer.kmp-fail { border-color: var(--err); background: var(--err-soft); }

/* 4 view model */
.kmp-vm { display: grid; gap: 8px; padding: 12px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); min-width: 0; transition: opacity 0.3s, border-color 0.3s; }
.kmp-vm.kmp-gone { opacity: 0.5; border-style: dashed; }
.kmp-state { justify-self: start; font: 600 0.84rem var(--mono); padding: 4px 10px; border-radius: 8px; background: var(--accent-soft); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; }
.kmp-state.kmp-err { background: var(--err-soft); color: var(--err); }
.kmp-jobs { display: flex; flex-wrap: wrap; gap: 6px; min-height: 30px; align-items: center; }
.kmp-job { font: 600 0.74rem var(--mono); padding: 4px 10px; border-radius: 999px; border: 2px solid var(--accent); color: var(--ink); }
.kmp-job.kmp-run { animation: pulse 1s infinite; }
.kmp-job.kmp-done { border-color: var(--ok); color: var(--ok); }
.kmp-job.kmp-cancel { border-color: var(--err); color: var(--err); text-decoration: line-through; }
.kmp-stale { outline: 2px dashed var(--warm); outline-offset: 3px; }

/* 5 compose multiplatform */
.kmp-code { display: grid; background: var(--code-bg); border-radius: 12px; padding: 10px 6px; overflow-x: auto; min-width: 0; }
.kmp-line { font: 500 0.8rem/1.6 var(--mono); color: var(--code-ink); white-space: pre; padding: 0 8px; border-radius: 6px; transition: background 0.3s; }
.kmp-line.kmp-hot { background: rgba(255, 212, 121, 0.18); }
.kmp-logo { width: 34px; height: 34px; border-radius: 10px; align-self: center; background: var(--kmp-c, var(--accent)); transition: background 0.3s; flex: none; }
.kmp-hello { font: 700 0.86rem var(--display); text-align: center; overflow-wrap: anywhere; }
.kmp-btn { align-self: center; font: 700 0.72rem var(--body); padding: 5px 12px; border-radius: 999px; border: 0; background: var(--kmp-c, var(--accent)); color: var(--accent-ink); cursor: pointer; transition: background 0.3s; }
.kmp-plat { font: 600 0.62rem var(--mono); color: var(--muted); text-align: center; overflow-wrap: anywhere; }
.kmp-c-warm { --kmp-c: var(--warm); }
.kmp-c-ok { --kmp-c: var(--ok); }
.kmp-c-err { --kmp-c: var(--err); }

/* 6 swift mapping */
.kmp-map { display: grid; gap: 8px; min-width: 0; }
.kmp-maphead, .kmp-row { display: grid; grid-template-columns: minmax(0, 1fr) 46px minmax(0, 1fr); gap: 8px; align-items: center; min-width: 0; }
.kmp-row { all: unset; box-sizing: border-box; display: grid; grid-template-columns: minmax(0, 1fr) 46px minmax(0, 1fr); gap: 8px; align-items: center; min-width: 0; padding: 4px; border-radius: 12px; border: 2px solid transparent; cursor: pointer; }
.kmp-row:hover { border-color: var(--line); }
.kmp-row:focus-visible { outline: 2px solid var(--accent); }
.kmp-row.kmp-on { border-color: var(--accent); background: var(--accent-soft); }
.kmp-cell { font: 500 0.78rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 9px; padding: 7px 10px; white-space: pre; overflow-x: auto; min-width: 0; }
.kmp-cell.kmp-skie { box-shadow: inset 3px 0 0 var(--ok); }
.kmp-pass { position: relative; height: 20px; }
.kmp-pass::before { content: ""; position: absolute; left: 4px; right: 8px; top: 9px; height: 2px; background: var(--line); }
.kmp-pass::after { content: ""; position: absolute; right: 2px; top: 5px; border-style: solid; border-width: 5px 0 5px 8px; border-color: transparent transparent transparent var(--muted); }
.kmp-dot { position: absolute; top: 4px; left: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); z-index: 1; animation: kmp-go 0.55s ease-in-out forwards; }
@keyframes kmp-go { to { left: calc(100% - 14px); } }
@media (max-width: 560px) {
  .kmp-maphead { display: none; }
  .kmp-row { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .kmp-pass { height: 18px; width: 20px; justify-self: center; transform: rotate(90deg); }
}
/* depth steps */
.kmp-ss.kmp-leaf { border-style: dashed; }
.kmp-tbtn { font: 600 0.74rem var(--mono); padding: 3px 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); cursor: pointer; }
.kmp-tbtn[aria-pressed="true"], .kmp-tbtn.kmp-fixed { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.kmp-tbtn.kmp-fixed { cursor: default; }
.kmp-tpill { font: 700 0.72rem var(--mono); padding: 2px 9px; border-radius: 999px; }
.kmp-tpill:empty { display: none; }
.kmp-tpill.kmp-tok { background: var(--ok-soft); color: var(--ok); }
.kmp-tpill.kmp-tbad { background: var(--err-soft); color: var(--err); }
.kmp-tpill.kmp-twarn { background: var(--warm-soft); color: var(--warm); }
.kmp-vms { display: grid; gap: 8px; align-content: start; flex: 1 1 220px; min-width: 0; }
.kmp-vms .kmp-vm { padding: 8px 10px; gap: 4px; }
`;

  Lab.addTrack({
    id: 'kmp',
    title: 'Kotlin Multiplatform',
    description: 'Write the logic once in Kotlin and ship it to Android, iOS and desktop, with shared or native UI.',
    group: 'Shipping', requires: ['kotlin', 'arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'shares',
        title: 'What KMP shares',
        tagline: 'One codebase, split into source sets, compiled per target.',
        level: 'beginner',
        body: `
<p>A Kotlin Multiplatform module splits its code into <em>source sets</em>. Code in <code>commonMain</code> is compiled for every target. Code in <code>androidMain</code> or <code>iosMain</code> only goes into that platform, so it can use Android or iOS APIs.</p>
<p>Source sets form a tree. The default hierarchy template creates the middle levels for you: declare <code>iosArm64()</code> and <code>iosSimulatorArm64()</code> and you get <code>iosMain</code> and <code>appleMain</code> to share code between them. A file sees its own source set and every parent above it.</p>
<p>The same Kotlin ends up in different forms. For Android it becomes JVM bytecode, then DEX inside your APK. For iOS, Kotlin/Native compiles it through LLVM to machine code and packs it into a framework that Xcode links. There is no JVM on the iPhone.</p>`,
        code: `// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
}

kotlin {
    android {
        namespace = "com.example.shared"
        compileSdk = 36
        minSdk = 24
    }
    listOf(iosArm64(), iosSimulatorArm64()).forEach { target ->
        target.binaries.framework {
            baseName = "Shared"
            isStatic = true
        }
    }
    sourceSets {
        commonMain.dependencies {
            implementation(libs.kotlinx.coroutines.core)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.okhttp)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
        }
    }
}`,
        remember: 'commonMain goes everywhere. androidMain becomes JVM bytecode. iosMain becomes native code in a framework.',
        terms: [
          { term: 'source set', def: 'A group of Kotlin files with its own dependencies that is compiled for a specific set of targets.' },
          { term: 'commonMain', def: 'The source set compiled for every target in a KMP module; it can only use multiplatform APIs.' },
          { term: 'default hierarchy template', def: 'The Kotlin Gradle plugin rule that creates intermediate source sets such as iosMain and appleMain from the targets you declare.' },
          { term: 'Kotlin/Native', def: 'The Kotlin compiler backend that uses LLVM to produce native binaries, such as iOS frameworks, without a virtual machine.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put the coroutines library where every target gets it, and the Darwin engine only where iOS gets it.', code: 'sourceSets {\n    [[commonMain]].dependencies {\n        implementation(libs.kotlinx.coroutines.core)\n    }\n    [[iosMain]].dependencies {\n        implementation(libs.ktor.client.darwin)\n    }\n}', why: 'Shared libraries go in <code>commonMain</code>. The Darwin engine uses Apple networking, so it belongs in <code>iosMain</code>.' },
          { type: 'bug', prompt: 'The Android build works, but the iOS build fails to resolve a dependency. Tap the line.', code: 'kotlin {\n    android { namespace = "com.example.shared"; compileSdk = 36 }\n    iosArm64()\n    iosSimulatorArm64()\n    sourceSets {\n        commonMain.dependencies {\n            implementation(libs.ktor.client.core)\n            implementation(libs.ktor.client.okhttp)\n        }\n        iosMain.dependencies {\n            implementation(libs.ktor.client.darwin)\n        }\n    }\n}', bug: 7, fix: '        // move it: androidMain.dependencies { implementation(libs.ktor.client.okhttp) }', why: 'The OkHttp engine only exists for the JVM. A <code>commonMain</code> dependency must be published for every target, including iOS.' },
        ],
        quiz: [
          { q: 'Where can you call <code>android.content.Context</code>?', options: ['<code>commonMain</code>', '<code>androidMain</code>', 'Any source set'], a: 1, why: 'Only <code>androidMain</code> compiles against the Android SDK. <code>commonMain</code> must compile for iOS too.' },
          { q: 'What does the iOS build of a KMP module produce?', options: ['A JAR that runs on a JVM inside the app', 'A native framework compiled by Kotlin/Native', 'JavaScript run by a WebView'], a: 1, why: 'Kotlin/Native compiles to machine code through LLVM. Xcode links the framework like any other.' },
          { q: 'You target <code>iosArm64</code> and <code>iosSimulatorArm64</code>. Where does code for both go?', options: ['Copy it into both target source sets', '<code>iosMain</code>', '<code>androidMain</code>'], a: 1, why: 'The default hierarchy template creates <code>iosMain</code> as the shared parent of both iOS targets.' },
        ],
        visual(el) {
          const SETS = [
            { id: 'common', name: 'commonMain', note: 'every target', d: 0, files: ['Greeting.kt', 'ArticleRepository.kt'] },
            { id: 'android', name: 'androidMain', note: 'Android', d: 1, files: ['Platform.android.kt'] },
            { id: 'apple', name: 'appleMain', note: 'all Apple targets', d: 1, files: [] },
            { id: 'ios', name: 'iosMain', note: 'all iOS targets', d: 2, files: ['Platform.ios.kt'] },
            { id: 'arm', name: 'iosArm64Main', note: 'iPhone', d: 3, files: [] },
            { id: 'sim', name: 'iosSimulatorArm64Main', note: 'Simulator on Apple silicon', d: 3, files: [] },
          ];
          const TARGETS = [
            { label: 'Build Android', task: ':androidApp:assembleDebug', sets: ['common', 'android'], steps: ['Kotlin/JVM compiler', 'JVM bytecode (.class)', 'D8: bytecode to DEX'], art: 'app-debug.apk', note: 'commonMain + androidMain became JVM bytecode, then DEX inside the APK.' },
            { label: 'Build iPhone', task: ':shared:linkDebugFrameworkIosArm64', sets: ['common', 'apple', 'ios', 'arm'], steps: ['Kotlin/Native compiler', 'LLVM IR', 'arm64 machine code'], art: 'Shared.framework (iosArm64)', note: 'No JVM here. Kotlin/Native compiled four source sets to machine code for the device.' },
            { label: 'Build Simulator', task: ':shared:linkDebugFrameworkIosSimulatorArm64', sets: ['common', 'apple', 'ios', 'sim'], steps: ['Kotlin/Native compiler', 'LLVM IR', 'arm64 simulator code'], art: 'Shared.framework (simulator)', note: 'Same commonMain and iosMain code. Only the leaf source set and the binary differ.' },
          ];
          const nodes = {};
          const tree = h('div', { class: 'kmp-tree' }, SETS.map(s => (nodes[s.id] = h('div', { class: 'kmp-ss', style: `--d:${s.d}` },
            h('div', { class: 'kmp-head' }, h('span', { class: 'kmp-name' }, s.name), h('span', { class: 'kmp-ss-note' }, s.note)),
            s.files.length ? h('div', { class: 'kmp-files' }, s.files.map(f => h('span', { class: `kmp-file${s.id === 'common' ? ' kmp-common' : ''}` }, f))) : null))));
          const inbox = h('div', { class: 'kmp-inbox', 'aria-label': 'Files going into the compiler' });
          const steps = h('div', { class: 'kmp-steps' });
          const art = h('div', { class: 'kmp-art' }, 'no output yet');
          const o = out('Pick a target. Watch which source sets it compiles.');
          let busy = false;
          const btns = TARGETS.map((t, i) => act(t.label, () => run(t, i)));
          async function run(t, i) {
            if (busy) return; busy = true; pick(btns, i);
            inbox.replaceChildren(); art.className = 'kmp-art'; art.textContent = 'compiling...';
            steps.replaceChildren(...t.steps.map(s => h('div', { class: 'kmp-step' }, s)));
            say(o, `<span class="muted">$ ./gradlew ${t.task}</span>`);
            SETS.forEach(s => { nodes[s.id].className = 'kmp-ss' + (t.sets.includes(s.id) ? '' : ' kmp-dim'); });
            for (const s of SETS) {
              if (!t.sets.includes(s.id)) continue;
              nodes[s.id].classList.add('kmp-on'); await sleep(260); if (!el.isConnected) return;
              for (const f of s.files) { inbox.append(h('span', { class: `kmp-file drop-in${s.id === 'common' ? ' kmp-common' : ''}` }, f)); await sleep(180); }
            }
            for (const st of steps.children) { st.classList.add('kmp-on'); replay(st, 'pop-soft'); await sleep(420); if (!el.isConnected) return; }
            art.className = 'kmp-art kmp-ready pop'; art.textContent = t.art;
            say(o, `<span class="good">BUILD SUCCESSFUL</span> ${t.note}`);
            busy = false;
          }
          el.append(h('div', { class: 'kmp-grid2' },
            h('div', { class: 'kmp-panel' }, h('span', { class: 'kmp-label' }, 'shared/src'), tree),
            h('div', { class: 'kmp-pipe' }, h('span', { class: 'kmp-label' }, 'Into the compiler'), inbox, steps, h('span', { class: 'kmp-label' }, 'Output'), art)),
          h('div', { class: 'controls' }, btns), o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'expect',
        title: 'expect and actual',
        tagline: 'Declare it once in common, implement it per platform.',
        level: 'beginner',
        body: `
<p>Sometimes common code needs something only the platform has: the OS version, a UUID, a file path. Declare it in <code>commonMain</code> with <code>expect</code>, and write the body in each platform source set with <code>actual</code>.</p>
<p>The compiler checks the pairs. Every target must have exactly one matching <code>actual</code>, with the same name, parameters and return type. If iOS is missing one, the iOS build fails while Android still compiles.</p>
<p>Use <code>expect</code> for small functions and properties. When the implementation needs dependencies, such as an Android <code>Context</code>, prefer a plain interface in <code>commonMain</code> and one class per platform, passed in through the constructor or a DI library like Koin. Interfaces are easier to fake in tests. Expect and actual classes are still Beta.</p>`,
        code: `// commonMain/Platform.kt
expect fun platformName(): String

fun greet(): String = "Hello from \${platformName()}"

// androidMain/Platform.android.kt
actual fun platformName(): String = "Android \${Build.VERSION.SDK_INT}"

// iosMain/Platform.ios.kt
actual fun platformName(): String =
    UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion

// Often better: an interface in commonMain, one class per platform, wired with DI
interface Clipboard {
    fun copy(text: String)
}

// androidMain
class AndroidClipboard(private val context: Context) : Clipboard {
    override fun copy(text: String) {
        val manager = context.getSystemService(ClipboardManager::class.java)
        manager.setPrimaryClip(ClipData.newPlainText("text", text))
    }
}`,
        remember: 'expect promises it in common. Each target keeps the promise with actual, or that target fails to build.',
        terms: [
          { term: 'expect', def: 'A modifier on a commonMain declaration that has no body there and must be implemented by every target.' },
          { term: 'actual', def: 'A modifier on the platform implementation of an expect declaration, with the same signature.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a random ID function in common and implement it on Android.', code: '// commonMain\n[[expect]] fun randomId(): String\n\n// androidMain\n[[actual]] fun randomId(): String = UUID.randomUUID().toString()\n\n// iosMain\nactual fun randomId(): String = NSUUID().UUIDString', why: 'The common file promises the function with <code>expect</code>. Each platform file keeps the promise with <code>actual</code>.' },
          { type: 'bug', prompt: 'Android builds. iOS reports that the actual does not match its expect. Tap the line.', code: '// commonMain\nexpect fun currentTimeMillis(): Long\n\n// androidMain\nactual fun currentTimeMillis(): Long = System.currentTimeMillis()\n\n// iosMain\nactual fun currentTimeMillis(): Int = (NSDate().timeIntervalSince1970 * 1000).toInt()', bug: 7, fix: 'actual fun currentTimeMillis(): Long = (NSDate().timeIntervalSince1970 * 1000).toLong()', why: 'An <code>actual</code> must match the <code>expect</code> signature exactly. <code>Int</code> also overflows for milliseconds since 1970.' },
        ],
        quiz: [
          { q: 'An <code>expect fun</code> has an <code>actual</code> in <code>androidMain</code> only. The module targets Android and iOS. What happens?', options: ['iOS uses the Android version', 'The iOS compilation fails', 'It returns null on iOS'], a: 1, why: 'Every target needs its own <code>actual</code>. Android still compiles. iOS does not.' },
          { q: 'Your Android implementation needs a <code>Context</code>. What fits best?', options: ['An <code>expect fun</code> that reads a global static Context', 'An interface in <code>commonMain</code>, an Android class that takes Context in its constructor, wired with DI', 'Pass Context through <code>commonMain</code> function parameters'], a: 1, why: 'An interface keeps common code free of Android types, and the platform class gets its dependencies the normal way.' },
        ],
        deeper: [
          {
            title: 'Put the actual as high in the tree as it fits',
            body: `
<p>An <code>actual</code> doesn’t have to live in a leaf like <code>iosArm64Main</code>. It can sit in any source set between <code>commonMain</code> and the target, and it covers every target below it. One actual in <code>iosMain</code> serves the iPhone and the simulator. One in <code>appleMain</code> also serves macOS, since all of them can call the same Apple APIs.</p>
<p>The rule is per target: walking up from the target to <code>commonMain</code>, the compiler must find exactly one actual. None fails that target. Two also fail. Add a macOS target below and see which placement works.</p>`,
            visual(el) {
              const T = [
                { id: 'android', name: 'androidMain', d: 1, up: 'common', act: true },
                { id: 'apple', name: 'appleMain', d: 1, up: 'common', act: false },
                { id: 'ios', name: 'iosMain', d: 2, up: 'apple', act: true },
                { id: 'arm', name: 'iosArm64', d: 3, up: 'ios', leaf: true },
                { id: 'sim', name: 'iosSimulatorArm64', d: 3, up: 'ios', leaf: true },
                { id: 'mac', name: 'macosMain', d: 2, up: 'apple', act: false },
                { id: 'macarm', name: 'macosArm64', d: 3, up: 'mac', leaf: true },
              ];
              const byId = Object.fromEntries(T.map(t => [t.id, t]));
              let busy = false;
              const o = out();
              const common = h('div', { class: 'kmp-ss', style: '--d:0' }, h('div', { class: 'kmp-head' }, h('span', { class: 'kmp-name' }, 'commonMain'), h('span', { class: 'kmp-label' }, 'expect fun platformName()')));
              for (const t of T) {
                t.pill = h('span', { class: 'kmp-tpill' });
                const head = h('div', { class: 'kmp-head' }, h('span', { class: 'kmp-name' }, t.leaf ? `target: ${t.name}` : t.name));
                if (t.leaf) head.append(t.pill);
                else if (t.id === 'android') { head.append(h('span', { class: 'kmp-tbtn kmp-fixed' }, 'actual'), t.pill); }
                else {
                  t.btn = h('button', { class: 'kmp-tbtn', 'aria-pressed': String(t.act), onclick() {
                    if (busy) return; t.act = !t.act; this.setAttribute('aria-pressed', String(t.act)); clear();
                    say(o, `${t.act ? 'Added an' : 'Removed the'} actual ${t.act ? 'to' : 'from'} ${t.name}.`);
                  } }, 'actual');
                  head.append(t.btn);
                }
                t.el = h('div', { class: 'kmp-ss' + (t.leaf ? ' kmp-leaf' : ''), style: `--d:${t.d}` }, head);
              }
              const clear = () => { [common, ...T.map(t => t.el)].forEach(e => e.classList.remove('kmp-on', 'kmp-dim')); T.forEach(t => { t.pill.textContent = ''; t.pill.className = 'kmp-tpill'; }); };
              const path = id => { const xs = []; for (let c = id; c && c !== 'common'; c = byId[c].up) xs.push(byId[c]); return xs; };
              async function build() {
                if (busy) return; busy = true; clear();
                const targets = T.filter(t => t.leaf || t.id === 'android');
                const bad = [];
                for (const t of targets) {
                  const p = path(t.id);
                  [common, ...T.map(x => x.el)].forEach(e => e.classList.add('kmp-dim'));
                  common.classList.remove('kmp-dim');
                  p.forEach(x => { x.el.classList.remove('kmp-dim'); x.el.classList.add('kmp-on'); });
                  say(o, `<span class="muted">compiling ${t.name}: ${p.slice().reverse().map(x => x.name).join(' ← ')} ← commonMain</span>`);
                  await sleep(650); if (!el.isConnected) return;
                  const n = p.filter(x => x.act).length;
                  t.pill.textContent = n === 1 ? 'builds' : n ? 'two actuals' : 'no actual';
                  t.pill.className = 'kmp-tpill ' + (n === 1 ? 'kmp-tok' : 'kmp-tbad');
                  replay(t.pill, n === 1 ? 'pop' : 'shake');
                  if (n !== 1) bad.push(`${t.name} (${n ? 'two actuals' : 'no actual'})`);
                  p.forEach(x => x.el.classList.remove('kmp-on'));
                }
                [common, ...T.map(x => x.el)].forEach(e => e.classList.remove('kmp-dim'));
                say(o, bad.length
                  ? `<span class="bad">e:</span> ${bad.join(', ')} failed. Every target needs exactly one actual on its way up to commonMain.`
                  : '<span class="good">ok:</span> every target found exactly one actual.');
                busy = false;
              }
              say(o, 'Android and both iOS targets are covered. Build, then fix macOS.');
              el.append(
                h('div', { class: 'kmp-tree' }, common, T.map(t => t.el)),
                h('div', { class: 'controls' }, cmd('./gradlew assemble', build)),
                o);
            },
          },
          {
            title: 'Reuse a platform class with actual typealias',
            body: `
<p>Sometimes a platform already has a class that matches your <code>expect class</code> member for member. Then the actual can be a type alias, with no wrapper code. The JVM side below borrows <code>AtomicReference</code> from the JDK. iOS still writes a real class.</p>
<p>Expect and actual classes are Beta. The compiler warns unless you opt in with the <code>-Xexpect-actual-classes</code> flag. For most cases, an interface is still the simpler tool.</p>`,
            code: `// commonMain
expect class AtomicRef<V>(value: V) {
    fun get(): V
    fun set(value: V)
    fun compareAndSet(expect: V, update: V): Boolean
}

// jvmMain: an existing JDK class already matches
actual typealias AtomicRef<V> = java.util.concurrent.atomic.AtomicReference<V>

// iosMain: implement it
actual class AtomicRef<V> actual constructor(value: V) {
    /* ... */
}

// build.gradle.kts
kotlin { compilerOptions { freeCompilerArgs.add("-Xexpect-actual-classes") } }`,
          },
          {
            title: 'Interfaces can be faked in tests. expect can’t.',
            body: `
<p>Code in <code>commonTest</code> runs on every target. An <code>expect fun</code> always resolves to the real actual, so a test of code that copies to the clipboard touches the real clipboard, or needs an Android <code>Context</code> that a unit test doesn’t have.</p>
<p>With an interface, the code under test takes a <code>Clipboard</code>, and the test passes a fake that only records what it got. The same test then runs and passes on every target.</p>`,
            code: `class FakeClipboard : Clipboard {
    val copied = mutableListOf<String>()
    override fun copy(text: String) { copied += text }
}

class ShareTest {
    @Test
    fun copiesTheLink() {
        val clipboard = FakeClipboard()
        ShareUseCase(clipboard).share(articleId = 42)
        assertEquals(listOf("https://example.com/a/42"), clipboard.copied)
    }
}`,
            visual(el) {
              const MODES = [
                { label: 'expect fun copyToClipboard()', test: 'ShareUseCase().share(42)\n// can only check the real clipboard',
                  res: [['Android unit test (JVM)', 'bad', 'UninitializedPropertyAccessException: lateinit property appContext has not been initialized'],
                    ['iosSimulatorArm64Test', 'warn', 'passed, but it wrote to the simulator’s real pasteboard and had to read it back from the OS']] },
                { label: 'interface Clipboard + FakeClipboard', test: 'val fake = FakeClipboard()\nShareUseCase(fake).share(42)\nassertEquals(listOf(".../a/42"), fake.copied)',
                  res: [['Android unit test (JVM)', 'ok', 'passed: fake.copied == [".../a/42"]'], ['iosSimulatorArm64Test', 'ok', 'passed: same test, same fake']] },
              ];
              let mode = 0, busy = false;
              const testKt = h('div', { class: 'kt' });
              const panels = MODES[0].res.map(([name]) => {
                const res = h('div', { class: 'kmp-result' });
                return { el: h('div', { class: 'kmp-panel' }, h('span', { class: 'kmp-name' }, name), res), res };
              });
              const o = out();
              const btns = MODES.map((m, i) => act(m.label, () => { if (busy) return; mode = i; pick(btns, i); testKt.innerHTML = hl(m.test); replay(testKt, 'pop-soft'); panels.forEach(p => { p.res.replaceChildren(); p.el.classList.remove('kmp-on', 'kmp-missing'); }); }));
              async function run() {
                if (busy) return; busy = true;
                panels.forEach(p => { p.res.replaceChildren(); p.el.classList.remove('kmp-on', 'kmp-missing'); });
                say(o, '<span class="muted">./gradlew allTests</span>');
                for (let i = 0; i < panels.length; i++) {
                  const p = panels[i], [, kind, msg] = MODES[mode].res[i];
                  p.el.classList.add('kmp-on'); p.res.append(h('div', { class: 'kmp-spin' }));
                  await sleep(700); if (!el.isConnected) return;
                  p.el.classList.remove('kmp-on'); if (kind === 'bad') { p.el.classList.add('kmp-missing'); replay(p.el, 'shake'); }
                  p.res.replaceChildren(h('span', { class: `kmp-tpill ${kind === 'ok' ? 'kmp-tok' : kind === 'bad' ? 'kmp-tbad' : 'kmp-twarn'} drop-in` }, kind === 'ok' ? 'PASS' : kind === 'bad' ? 'FAIL' : 'PASS?'), h('span', { class: 'tip' }, msg));
                }
                say(o, mode
                  ? '<span class="good">ok:</span> the fake runs everywhere, and the test checks exactly what was copied.'
                  : '<span class="bad">expect:</span> the test can only reach the real platform code. One target crashes, the other leans on global OS state.');
                busy = false;
              }
              pick(btns, 0); testKt.innerHTML = hl(MODES[0].test);
              say(o, 'Pick a design, then run the shared test on both targets.');
              el.append(
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'kmp-panel' }, h('span', { class: 'kmp-name' }, 'commonTest/ShareTest.kt'), testKt),
                h('div', { class: 'controls' }, cmd('./gradlew allTests', run)),
                h('div', { class: 'kmp-grid2' }, panels.map(p => p.el)),
                o);
            },
          },
        ],
        underHood: {
          body: `
<p>There is no runtime lookup. Each target is compiled on its own, from <code>commonMain</code> plus every source set on its path. During that compilation the compiler matches each <code>expect</code> declaration to the one <code>actual</code> it can see and checks that names, parameters, return types and modifiers agree.</p>
<p>The <code>expect</code> declaration produces no code. Calls to it are compiled as direct calls to the actual, as if you had called that function by name. The Android binary contains only the Android actual and the iOS framework only the iOS one, so expect and actual cost nothing at runtime.</p>`,
        },
        mistakes: [
          {
            title: 'Default arguments on the actual',
            bad: `// commonMain
expect fun formatPrice(cents: Long, currency: String): String

// androidMain
actual fun formatPrice(cents: Long, currency: String = "EUR"): String = /* ... */`,
            good: `// commonMain
expect fun formatPrice(cents: Long, currency: String = "EUR"): String

// androidMain
actual fun formatPrice(cents: Long, currency: String): String = /* ... */`,
            why: 'Common callers only see the expect signature, so defaults must live there. The compiler rejects an actual with default values.',
          },
          {
            title: 'Same file name in common and platform code',
            bad: `// commonMain/Platform.kt
expect fun platformName(): String
fun greet() = "Hello from " + platformName()

// androidMain/Platform.kt
actual fun platformName(): String = "Android"`,
            good: `// commonMain/Platform.kt
expect fun platformName(): String
fun greet() = "Hello from " + platformName()

// androidMain/Platform.android.kt
actual fun platformName(): String = "Android"`,
            why: 'On the JVM both files compile to a class named <code>PlatformKt</code>, and the Android build fails with a duplicate class name. Add the platform as a suffix, as the KMP wizard does.',
          },
          {
            title: 'Writing expect for what the standard library already has',
            bad: `// commonMain
expect fun nowMillis(): Long
// androidMain: System.currentTimeMillis(), iosMain: NSDate()...`,
            good: `// commonMain
import kotlin.time.Clock   // standard library since Kotlin 2.1.20, may need @OptIn(ExperimentalTime::class)

fun nowMillis(): Long = Clock.System.now().toEpochMilliseconds()`,
            why: 'Time, UUIDs, atomics, coroutines and serialization already have multiplatform APIs. Every expect you write is code to test on every target. Check the standard library and kotlinx first.',
          },
        ],
        visual(el) {
          const T = [
            { label: 'Android', set: 'androidMain', src: 'actual fun platformName(): String =\n    "Android ${Build.VERSION.SDK_INT}"', result: 'Android 36' },
            { label: 'iOS', set: 'iosMain', src: 'actual fun platformName(): String =\n    UIDevice.currentDevice.systemName() +\n    " " + UIDevice.currentDevice.systemVersion', result: 'iOS 26.0' },
            { label: 'Desktop', set: 'jvmMain', src: 'actual fun platformName(): String =\n    "JVM " + System.getProperty("java.version")', result: 'JVM 21.0.4' },
          ];
          let cur = 0, busy = false, iosOk = true;
          const common = h('div', { class: 'kmp-panel' }, h('span', { class: 'kmp-name' }, 'commonMain'),
            kt('expect fun platformName(): String\n\nfun greet() = "Hello from ${platformName()}"'));
          const panels = T.map(t => h('div', { class: 'kmp-panel' }, h('span', { class: 'kmp-name' }, t.set), kt(t.src)));
          const result = h('div', { class: 'kmp-result' }, h('span', { class: 'kmp-label' }, 'greet()'));
          const o = out('Pick a target, then call greet().');
          const btns = T.map((t, i) => act(t.label, () => { if (busy) return; cur = i; pick(btns, i); clear(); }));
          const box = h('input', { type: 'checkbox', id: 'kmp-ios-actual', checked: true, onchange() {
            if (busy) { this.checked = iosOk; return; }
            iosOk = this.checked; const p = panels[1];
            p.classList.toggle('kmp-missing', !iosOk);
            p.lastElementChild.replaceWith(kt(iosOk ? T[1].src : '// no actual here'));
            replay(p, iosOk ? 'pop' : 'shake'); clear();
            say(o, iosOk ? '<span class="good">ok:</span> every target has its actual again.' : '<span class="bad">e:</span> Expected function \'platformName\' has no actual declaration in module for Native. Android and Desktop still build.');
          } });
          const clear = () => { result.replaceChildren(h('span', { class: 'kmp-label' }, 'greet()')); panels.forEach(p => p.classList.remove('kmp-on', 'kmp-dim')); common.classList.remove('kmp-on'); };
          async function call() {
            if (busy) return; busy = true; clear();
            common.classList.add('kmp-on'); replay(common, 'kmp-flash');
            say(o, `<span class="muted">compiling for ${T[cur].label}: resolving expect fun platformName()</span>`);
            await sleep(600); if (!el.isConnected) return;
            panels.forEach((p, i) => p.classList.add(i === cur ? 'kmp-on' : 'kmp-dim'));
            await sleep(500); if (!el.isConnected) return;
            if (cur === 1 && !iosOk) {
              replay(panels[1], 'shake');
              result.append(h('span', { class: 'kmp-res kmp-err drop-in' }, 'build failed'));
              say(o, '<span class="bad">e:</span> no actual for platformName() in iosMain. Turn it back on.');
            } else {
              result.append(h('span', { class: 'kmp-res drop-in' }, `"Hello from ${T[cur].result}"`));
              say(o, `<span class="good">ok:</span> the ${T[cur].set} actual was linked in. The other actuals are not in this binary at all.`);
            }
            busy = false;
          }
          pick(btns, 0);
          el.append(common, h('div', { class: 'kmp-actuals' }, panels),
            h('div', { class: 'controls' }, btns, h('button', { class: 'btn primary small', onclick: call }, 'Call greet()'),
              h('label', { class: 'switch', for: 'kmp-ios-actual' }, box, 'iosMain has actual')),
            result, o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'data',
        title: 'Sharing data and logic',
        tagline: 'Networking, JSON, a database and settings, all in commonMain.',
        level: 'intermediate',
        body: `
<p>The biggest win in KMP is the data layer. Ktor makes HTTP calls, kotlinx.serialization turns JSON into data classes, and a database caches the result. All of it lives in <code>commonMain</code>. Only small pieces are per platform: the Ktor engine (OkHttp on Android, Darwin on iOS) and where the database file goes.</p>
<p><code>@Serializable</code> works through a compiler plugin, so there is no reflection. That matters on Kotlin/Native. For storage you can use SQLDelight (you write SQL, it generates Kotlin) or Room, which now runs on Android, iOS and desktop with the bundled SQLite driver. Small key-value data goes in DataStore or multiplatform-settings.</p>
<p>Wrap it in one repository. The Android app and the iOS app each run their own copy of the same code.</p>`,
        code: `@Entity
@Serializable
data class Article(@PrimaryKey val id: Long, val title: String)

@Dao
interface ArticleDao {
    @Query("SELECT * FROM Article ORDER BY id DESC")
    fun observeAll(): Flow<List<Article>>

    @Upsert
    suspend fun upsertAll(items: List<Article>)
}

class ArticleRepository(
    private val client: HttpClient,
    private val dao: ArticleDao,
    private val prefs: DataStore<Preferences>,
    private val now: () -> Long,
) {
    fun articles(): Flow<List<Article>> = dao.observeAll()

    suspend fun refresh() {
        val fresh: List<Article> = client.get("https://api.example.com/articles").body()
        dao.upsertAll(fresh)
        prefs.edit { it[LAST_SYNC] = now() }
    }
}

// commonMain: one client config. The engine comes from the platform.
fun createHttpClient(engine: HttpClientEngine) = HttpClient(engine) {
    install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
}
// androidMain: createHttpClient(OkHttp.create())
// iosMain:     createHttpClient(Darwin.create())`,
        remember: 'Ktor fetches, serialization decodes, Room or SQLDelight caches. Only the engine and file paths are per platform.',
        terms: [
          { term: 'HttpClientEngine', def: 'The Ktor component that does the actual network I/O, such as OkHttp on Android or Darwin on iOS.' },
          { term: '@Serializable', def: 'A kotlinx.serialization annotation that makes the compiler plugin generate a serializer for the class, with no reflection.' },
          { term: 'BundledSQLiteDriver', def: 'A SQLite driver that ships its own SQLite build, used by Room KMP so every platform runs the same database engine.' },
          { term: 'multiplatform-settings', def: 'A library that wraps SharedPreferences on Android and NSUserDefaults on iOS behind one key-value API.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the JSON decode into <code>Weather</code>.', code: '@[[Serializable]]\ndata class Weather(val city: String, val tempC: Double)\n\nval client = HttpClient(engine) {\n    install([[ContentNegotiation]]) { json() }\n}\n\nsuspend fun load(city: String): Weather =\n    client.get("https://api.example.com/weather?city=$city").[[body]]()', why: '<code>@Serializable</code> generates the serializer, <code>ContentNegotiation</code> plugs JSON into Ktor, and <code>body()</code> decodes the response into the expected type.' },
          { type: 'bug', prompt: 'The list scrolls with stutters on both platforms after every refresh. Tap the line.', code: 'fun getDatabase(builder: RoomDatabase.Builder<AppDatabase>): AppDatabase =\n    builder\n        .setDriver(BundledSQLiteDriver())\n        .setQueryCoroutineContext(Dispatchers.Main)\n        .build()', bug: 3, fix: '        .setQueryCoroutineContext(Dispatchers.IO)', why: 'Room runs its queries in this context. <code>Dispatchers.Main</code> puts disk work on the UI thread. Use <code>Dispatchers.IO</code>, which exists on Native too.' },
        ],
        quiz: [
          { q: 'Which part of the Ktor setup has to differ between Android and iOS?', options: ['The JSON configuration', 'The engine, such as OkHttp or Darwin', 'The request URLs'], a: 1, why: 'The client config is shared. Only the engine that does the I/O is platform-specific.' },
          { q: 'Why does kotlinx.serialization work on iOS where reflection-based JSON libraries do not?', options: ['It uses Objective-C runtime reflection', 'A compiler plugin generates the serializers at build time', 'iOS apps only use XML'], a: 1, why: 'The code is generated during compilation, so Kotlin/Native needs no runtime reflection.' },
          { q: 'Where does a Room KMP database file path usually get decided?', options: ['In <code>commonMain</code>, hard-coded', 'In each platform source set, which creates the builder', 'Room picks it on its own'], a: 1, why: 'Android uses <code>context.getDatabasePath</code>, iOS uses its documents directory. Common code takes the builder and finishes the setup.' },
        ],
        visual(el) {
          const SEED = ['Room 2.8 is out', 'Ktor 3.3 notes'];
          const NEWS = ['Compose for iOS: what changed', 'SKIE vs NativeCoroutines', 'DataStore on iOS', 'Kotlin 2.3 roundup', 'Swift export preview', 'SQLDelight tips'];
          let n = 0, busy = false, offline = false;
          const apps = ['Android', 'iOS'].map((name, i) => {
            const list = h('div', { class: 'kmp-list' });
            const foot = h('span', { class: 'kmp-foot' });
            const dev = h('div', { class: `kmp-dev ${i ? 'kmp-ios' : 'kmp-and'}`, role: 'img', 'aria-label': `${name} app` }, h('span', { class: 'kmp-scr-title' }, 'News'), list, foot);
            return { name, list, foot, dev, db: i ? [] : SEED.slice(), sync: i ? null : '09:40' };
          });
          const layerDefs = [['cache', 'Room', 'dao.observeAll()'], ['net', 'Ktor', 'client.get(...)'], ['json', 'serialization', '.body<List<Article>>()'], ['save', 'Room', 'dao.upsertAll()'], ['prefs', 'DataStore', 'LAST_SYNC']];
          const layers = Object.fromEntries(layerDefs.map(([k, b, s]) => [k, h('div', { class: 'kmp-layer' }, h('b', {}, b), h('small', {}, s))]));
          const caller = h('span', { class: 'kmp-label' }, 'idle');
          const repo = h('div', { class: 'kmp-repo' }, h('div', { class: 'kmp-head' }, h('span', { class: 'kmp-name' }, 'ArticleRepository (commonMain)'), caller), h('div', { class: 'kmp-layers' }, Object.values(layers)));
          const o = out('Two apps, one repository. Refresh either one.');
          const paint = (a, fresh = 0) => {
            a.list.replaceChildren(...(a.db.length ? a.db.slice(0, 4).map((t, i) => h('div', { class: `kmp-li${i < fresh ? ' kmp-new' : ''}` }, t)) : [h('p', { class: 'kmp-empty' }, 'Empty. Pull to refresh.')]));
            a.foot.textContent = a.sync ? `rows: ${a.db.length} · synced ${a.sync}` : `rows: ${a.db.length}`;
          };
          apps.forEach(a => paint(a));
          async function refresh(a) {
            if (busy) return; busy = true;
            Object.values(layers).forEach(l => { l.className = 'kmp-layer'; });
            a.dev.classList.add('kmp-ask'); caller.textContent = `called by ${a.name}`;
            const step = async (k, cls, msg) => { layers[k].classList.add('kmp-on'); say(o, msg); await sleep(520); if (!el.isConnected) return false; layers[k].className = 'kmp-layer ' + cls; return true; };
            if (!await step('cache', 'kmp-ok', `<span class="muted">${a.name}: emit ${a.db.length} cached rows from the database</span>`)) return;
            if (offline) {
              await step('net', 'kmp-fail', `<span class="muted">${a.name}: GET /articles</span>`); if (!el.isConnected) return;
              replay(layers.net, 'shake');
              say(o, `<span class="bad">IOException:</span> no network. ${a.name} keeps showing its ${a.db.length} cached rows.`);
            } else {
              if (!await step('net', 'kmp-ok', `<span class="muted">${a.name}: GET /articles via ${a.name === 'iOS' ? 'Darwin' : 'OkHttp'} engine</span>`)) return;
              if (!await step('json', 'kmp-ok', '<span class="muted">decode JSON into List&lt;Article&gt;</span>')) return;
              const fresh = [NEWS[n % NEWS.length], NEWS[(n + 1) % NEWS.length]]; n += 2;
              a.db = [...fresh, ...a.db.filter(t => !fresh.includes(t))];
              if (!await step('save', 'kmp-ok', '<span class="muted">upsert rows. The Flow emits again.</span>')) return;
              paint(a, 2);
              const d = new Date(); a.sync = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              if (!await step('prefs', 'kmp-ok', '<span class="muted">save LAST_SYNC</span>')) return;
              paint(a);
              say(o, `<span class="good">ok:</span> ${a.name} got 2 new rows. Same Kotlin code ran, with a different engine and database file.`);
            }
            a.dev.classList.remove('kmp-ask'); caller.textContent = 'idle';
            busy = false;
          }
          const sw = h('input', { type: 'checkbox', id: 'kmp-offline', onchange() { offline = this.checked; say(o, offline ? 'Network off. Refresh to see the cache take over.' : 'Network back on.'); } });
          el.append(h('div', { class: 'kmp-devs' }, apps.map(a => h('div', { class: 'kmp-dev-wrap' }, a.dev, h('span', { class: 'kmp-label' }, a.name)))),
            repo,
            h('div', { class: 'controls' }, apps.map(a => act(`Refresh ${a.name}`, () => refresh(a))), h('label', { class: 'switch', for: 'kmp-offline' }, sw, 'offline')),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'viewmodels',
        title: 'Shared ViewModels and coroutines',
        tagline: 'One ViewModel, observed by Compose and by SwiftUI.',
        level: 'intermediate',
        body: `
<p>The AndroidX <code>lifecycle-viewmodel</code> library is multiplatform. You can write a <code>ViewModel</code> in <code>commonMain</code>, launch work in <code>viewModelScope</code>, and expose a <code>StateFlow</code>. When the ViewModel is cleared, the scope is cancelled on every platform. On iOS the Swift side owns the ViewModel and must clear it when the screen goes away, usually through a <code>ViewModelStore</code>.</p>
<p>Android collects the flow with <code>collectAsStateWithLifecycle()</code>. Swift is harder. Without help, Swift sees <code>StateFlow</code> as an Objective-C protocol: it can read <code>value</code> once, but collecting needs a hand-written <code>FlowCollector</code>.</p>
<p>Two tools fix that. SKIE is a compiler plugin that turns flows into Swift <code>AsyncSequence</code>s and suspend functions into <code>async</code> functions with cancellation. KMP-NativeCoroutines uses annotations plus a small Swift library to do the same.</p>`,
        code: `// commonMain
class NewsViewModel(private val repo: ArticleRepository) : ViewModel() {
    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state.asStateFlow()

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            _state.value = try {
                UiState.Success(repo.load())
            } catch (e: IOException) {
                UiState.Error(e.message ?: "Network error")
            }
        }
    }
}

// Android (Compose)
val state by viewModel.state.collectAsStateWithLifecycle()

// iOS with SKIE (Swift)
// for await state in viewModel.state { self.state = state }

// iOS with KMP-NativeCoroutines: annotate the Kotlin property
@NativeCoroutinesState
val uiState: StateFlow<UiState> = _state.asStateFlow()
// for try await state in asyncSequence(for: viewModel.uiStateFlow) { ... }`,
        remember: 'Write the ViewModel once. Android collects the StateFlow directly; Swift needs SKIE or KMP-NativeCoroutines to for-await it.',
        terms: [
          { term: 'lifecycle-viewmodel (KMP)', def: 'The AndroidX ViewModel artifact published for Android, iOS, desktop and web, so ViewModel and viewModelScope work in commonMain.' },
          { term: 'SKIE', def: 'A Kotlin compiler plugin from Touchlab that generates Swift-friendly APIs: flows as AsyncSequence, suspend as async, sealed types as Swift enums.' },
          { term: 'KMP-NativeCoroutines', def: 'A library that exposes annotated Kotlin flows and suspend functions to Swift as async/await, Combine or RxSwift.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the mutable flow private and launch work that is cancelled with the ViewModel.', code: 'class TimerViewModel : ViewModel() {\n    private val _seconds = [[MutableStateFlow]](0)\n    val seconds: StateFlow<Int> = _seconds.[[asStateFlow]]()\n\n    fun start() {\n        [[viewModelScope]].launch {\n            while (true) { delay(1000); _seconds.value += 1 }\n        }\n    }\n}', why: 'Only the ViewModel can write. <code>viewModelScope</code> stops the loop when the ViewModel is cleared, on Android and iOS alike.' },
          { type: 'bug', prompt: 'After the iOS screen closes, the network call keeps running and writes to a dead ViewModel. Tap the line.', code: 'class ProfileViewModel(private val repo: UserRepository) : ViewModel() {\n    private val _user = MutableStateFlow<User?>(null)\n    val user: StateFlow<User?> = _user.asStateFlow()\n\n    fun load(id: String) {\n        GlobalScope.launch {\n            _user.value = repo.user(id)\n        }\n    }\n}', bug: 5, fix: '        viewModelScope.launch {', why: '<code>GlobalScope</code> is not tied to anything, so clearing the ViewModel cancels nothing. <code>viewModelScope</code> is cancelled in <code>onCleared</code>.' },
        ],
        quiz: [
          { q: 'What happens to coroutines in <code>viewModelScope</code> when the ViewModel is cleared on iOS?', options: ['They keep running until the app exits', 'They are cancelled, same as on Android', 'viewModelScope does not exist on iOS'], a: 1, why: 'The KMP lifecycle library cancels the scope on every platform when the ViewModel is cleared.' },
          { q: 'With no bridge library, what can Swift easily do with a Kotlin <code>StateFlow</code>?', options: ['<code>for await</code> over it', 'Read its current <code>value</code>; collecting needs a hand-written collector', 'Bind it with <code>@Published</code> automatically'], a: 1, why: 'Swift sees an Objective-C protocol. Reading <code>value</code> works; observing changes needs a <code>FlowCollector</code> or a tool like SKIE.' },
          { q: 'With SKIE, how does SwiftUI observe <code>viewModel.state</code>?', options: ['<code>for await state in viewModel.state</code>', '<code>viewModel.state.observe(owner)</code>', '<code>viewModel.state.sink { }</code> only'], a: 0, why: 'SKIE exposes Kotlin flows as Swift <code>AsyncSequence</code>s, and cancels the Kotlin collection when the Swift task is cancelled.' },
        ],
        deeper: [
          {
            title: 'On iOS, someone has to clear the ViewModel',
            body: `
<p>On Android, the Activity or navigation back stack owns a <code>ViewModelStore</code> and clears it when the screen is gone for good. SwiftUI knows nothing about that. If Swift just creates the ViewModel and drops the reference, <code>onCleared()</code> never runs and <code>viewModelScope</code> is never cancelled. A polling loop keeps running for a screen nobody can see.</p>
<p>Give each iOS screen a small Kotlin holder that owns a <code>ViewModelStore</code>. Swift creates it when the screen appears and calls <code>clear()</code> when it goes away. Push and pop screens below.</p>`,
            code: `// iosMain: one holder per screen, owned by Swift
class NewsScreenHolder(repo: ArticleRepository) {
    private val store = ViewModelStore()
    val viewModel: NewsViewModel = ViewModelProvider.create(
        store,
        viewModelFactory { initializer { NewsViewModel(repo) } },
    )[NewsViewModel::class]

    fun clear() = store.clear()   // onCleared() runs, viewModelScope is cancelled
}

// Swift
// .onDisappear { holder.clear() }`,
            visual(el) {
              let clearOn = true, n = 0, busy = false;
              const stack = [], vms = [];
              const navList = h('div', { class: 'kmp-list' });
              const nav = h('div', { class: 'kmp-dev kmp-ios', role: 'img', 'aria-label': 'iOS navigation stack' }, h('span', { class: 'kmp-scr-title' }, 'Navigation'), navList);
              const vmBox = h('div', { class: 'kmp-vms' });
              const o = out();
              const paintNav = () => navList.replaceChildren(...(stack.length
                ? stack.map((v, i) => h('div', { class: 'kmp-li' + (i === stack.length - 1 ? ' kmp-new' : '') }, `${i === stack.length - 1 ? '▸ ' : ''}NewsScreen #${v.n}`))
                : [h('p', { class: 'kmp-empty' }, 'Home. No news screen open.')]));
              function push() {
                if (busy) return;
                if (stack.length >= 3) { replay(nav, 'shake'); say(o, 'Three screens deep is enough. Pop one.'); return; }
                const v = { n: ++n, ticks: 0, alive: true };
                v.count = h('span', { class: 'kmp-state' }, 'polls: 0');
                v.job = h('span', { class: 'kmp-job kmp-run' }, 'poll loop');
                v.note = h('span', { class: 'kmp-label' }, 'on screen');
                v.el = h('div', { class: 'kmp-vm drop-in' }, h('div', { class: 'kmp-head' }, h('span', { class: 'kmp-name' }, `NewsViewModel #${v.n}`), v.note), v.count, h('div', { class: 'kmp-jobs' }, v.job));
                stack.push(v); vms.push(v); vmBox.append(v.el);
                while (vms.length > 5) { const old = vms.shift(); old.alive = false; old.el.remove(); }
                paintNav();
                say(o, `Pushed NewsScreen #${v.n}. Its ViewModel starts polling in viewModelScope.`);
              }
              function pop() {
                if (busy) return;
                const v = stack.pop();
                if (!v) { replay(nav, 'shake'); say(o, 'Nothing to pop. Push a screen first.'); return; }
                paintNav();
                if (clearOn) {
                  v.alive = false; v.el.classList.add('kmp-gone'); v.job.className = 'kmp-job kmp-cancel'; v.note.textContent = 'cleared';
                  say(o, `<span class="good">holder.clear():</span> onCleared() ran and the poll loop of #${v.n} was cancelled.`);
                } else {
                  v.el.classList.add('kmp-stale'); v.note.textContent = 'no screen';
                  const leaked = vms.filter(x => x.alive && !stack.includes(x)).length;
                  say(o, `<span class="bad">leaked:</span> nobody cleared #${v.n}. ${leaked} ViewModel${leaked > 1 ? 's are' : ' is'} still polling for screens that are gone.`);
                }
              }
              const box = h('input', { type: 'checkbox', id: 'kmp-d-clear', checked: true, onchange() { clearOn = this.checked; say(o, clearOn ? 'Popped screens clear their store again.' : 'Now Swift just drops the screen. Pop one and watch.'); } });
              (async () => {
                while (true) {
                  await sleep(900); if (!el.isConnected) return;
                  vms.forEach(v => { if (v.alive) { v.ticks++; v.count.textContent = `polls: ${v.ticks}`; } });
                }
              })();
              paintNav(); push();
              el.append(
                h('div', { class: 'kmp-devs' }, h('div', { class: 'kmp-dev-wrap' }, nav, h('span', { class: 'kmp-label' }, 'SwiftUI')), vmBox),
                h('div', { class: 'controls' }, act('push NewsScreen', push), act('pop', pop), h('label', { class: 'switch', for: 'kmp-d-clear' }, box, 'clear on disappear')),
                o);
            },
          },
          {
            title: 'Cancellation has to cross the bridge',
            body: `
<p>SwiftUI cancels a view’s <code>.task</code> when the view disappears. Whether the Kotlin coroutine behind it stops depends on the bridge. Kotlin’s own export lets Swift <code>await</code> a suspend function, but it does not pass Swift’s cancellation on. The coroutine runs to the end, and its result is thrown away.</p>
<p>SKIE and KMP-NativeCoroutines connect the two: cancelling the Swift task cancels the coroutine, which stops at its next suspension point, network call included.</p>`,
            code: `// commonMain
class SearchRepository(private val api: SearchApi) {
    suspend fun search(query: String): List<SearchHit> {
        delay(300)                 // debounce; a cancellation point
        return api.search(query)   // Ktor calls are cancellable too
    }
}

// Swift with SKIE: leaving the view cancels the task and the coroutine
// .task(id: query) { hits = (try? await repo.search(query: query)) ?? [] }`,
            visual(el) {
              const BR = [
                { label: 'Kotlin export', cancel: false, swift: '.task { hits = try? await repo.search(query: "kotlin") }' },
                { label: 'SKIE', cancel: true, swift: '.task { hits = try? await repo.search(query: "kotlin") }' },
                { label: 'KMP-NativeCoroutines', cancel: true, swift: '.task { hits = try? await asyncFunction(for: repo.search(query: "kotlin")) }' },
              ];
              let br = 0, run = 0, swiftP = 0, ktP = 0, swiftEnd = null, ktEnd = null;
              const mkLane = name => { const bar = h('div', { class: 'bar run' }); const tr = h('div', { class: 'lane-track' }, bar); return { bar, row: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), tr) }; };
              const sw = mkLane('Swift .task'), kt = mkLane('Kotlin coroutine');
              const swiftLine = h('div', { class: 'kt' });
              const o = out();
              const paint = () => {
                sw.bar.style.left = '0'; sw.bar.style.width = `${swiftP}%`; sw.bar.className = 'bar ' + (swiftEnd === 'cancel' ? 'block' : 'run');
                kt.bar.style.left = '0'; kt.bar.style.width = `${ktP}%`; kt.bar.className = 'bar ' + (ktEnd === 'cancel' ? 'block' : ktEnd === 'wasted' ? 'queued' : 'run');
              };
              const btns = BR.map((b, i) => act(b.label, () => { if (run) return; br = i; pick(btns, i); swiftLine.innerHTML = hl(b.swift); replay(swiftLine, 'pop-soft'); }));
              async function open() {
                if (run) return;
                const my = run = Date.now();
                swiftP = 0; ktP = 0; swiftEnd = null; ktEnd = null; paint();
                say(o, 'Search screen open. The task awaits repo.search().');
                while (ktP < 100) {
                  await sleep(60); if (!el.isConnected || run !== my) return;
                  if (ktEnd === 'cancel') break;
                  ktP = Math.min(100, ktP + 2); if (!swiftEnd) swiftP = ktP;
                  paint();
                }
                if (ktEnd === 'cancel') return;
                if (swiftEnd === 'cancel') {
                  ktEnd = 'wasted'; paint();
                  say(o, '<span class="bad">wasted:</span> the coroutine finished the network call and the parsing. Swift had already cancelled, so the result was thrown away.');
                } else say(o, '<span class="good">done:</span> results arrived while the screen was still open.');
                run = 0;
              }
              async function leave() {
                if (!run || swiftEnd) { say(o, '<span class="muted">No search is running. Open the screen first.</span>'); return; }
                swiftEnd = 'cancel'; paint(); replay(sw.row, 'shake');
                if (BR[br].cancel) {
                  await sleep(200); if (!el.isConnected) return;
                  ktEnd = 'cancel'; paint(); run = 0;
                  say(o, `<span class="good">${BR[br].label}:</span> the Swift task was cancelled, so the coroutine got a CancellationException and stopped at ${ktP}%.`);
                } else {
                  say(o, '<span class="muted">The Swift task is cancelled. The Kotlin coroutine doesn’t know…</span>');
                }
              }
              pick(btns, 0); swiftLine.innerHTML = hl(BR[0].swift); paint();
              say(o, 'Pick a bridge. Open the screen, then leave it before the search finishes.');
              el.append(
                h('div', { class: 'controls' }, btns), swiftLine,
                h('div', { class: 'timeline' }, sw.row, kt.row),
                h('div', { class: 'controls' }, act('open search screen', open), act('leave screen', leave)),
                o);
            },
          },
          {
            title: 'Threads on iOS work the same way',
            body: `
<p><code>viewModelScope</code> runs on <code>Dispatchers.Main.immediate</code>. On iOS, <code>Dispatchers.Main</code> is the main dispatch queue, so state updates land on the UI thread on both platforms. <code>Dispatchers.IO</code> and <code>Default</code> exist on Kotlin/Native too, and since the new memory model, objects can move between threads freely. The same <code>withContext</code> code runs unchanged.</p>`,
            code: `fun refresh() {
    viewModelScope.launch {                                   // main thread on Android and iOS
        val items = withContext(Dispatchers.IO) { repo.loadFromDisk() }
        _state.value = UiState.Success(items)                 // back on main
    }
}`,
          },
        ],
        underHood: {
          body: `
<p>Every ViewModel keeps a set of closeable objects. The first time you read <code>viewModelScope</code>, it creates a scope with a <code>SupervisorJob</code> and <code>Dispatchers.Main.immediate</code> (where a main dispatcher exists) and registers it as one of them. <code>ViewModelStore.clear()</code> calls the ViewModel’s internal clear, which runs <code>onCleared()</code> and closes those objects. Closing the scope cancels its job, and that cancels every coroutine launched in it. This code is the same on every platform.</p>
<p>SKIE adds Swift code to the framework. For a flow, it generates an <code>AsyncSequence</code> that starts a Kotlin coroutine to collect the flow and hands each value to Swift. When the Swift task is cancelled, the sequence cancels that coroutine.</p>`,
        },
        mistakes: [
          {
            title: 'A catch-all that swallows cancellation',
            bad: `viewModelScope.launch {
    while (true) {
        try {
            delay(5_000)
            _state.value = repo.poll()
        } catch (e: Exception) {
            log(e)   // also catches CancellationException
        }
    }
}`,
            good: `viewModelScope.launch {
    while (isActive) {
        try {
            delay(5_000)
            _state.value = repo.poll()
        } catch (e: IOException) {
            log(e)
        }
    }
}`,
            why: 'After <code>clear()</code>, <code>delay</code> throws <code>CancellationException</code>. The catch eats it and the loop spins again, so the coroutine never stops. Catch only the errors you expect, or rethrow cancellation.',
          },
          {
            title: 'Handing Swift the mutable flow',
            bad: `class NewsViewModel : ViewModel() {
    val state = MutableStateFlow<UiState>(UiState.Loading)
}`,
            good: `class NewsViewModel : ViewModel() {
    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state.asStateFlow()
}`,
            why: 'Swift sees a writable <code>value</code> property and can set state from the view. Then the ViewModel no longer owns its state, and Android and iOS can drift apart.',
          },
        ],
        visual(el) {
          const BR = [
            { label: 'No bridge', swift: 'let s = viewModel.state.value  // read once', live: false },
            { label: 'SKIE', swift: 'for await s in viewModel.state { state = s }', live: true },
            { label: 'KMP-NativeCoroutines', swift: 'for try await s in asyncSequence(for: viewModel.stateFlow) { state = s }', live: true },
          ];
          let br = 0, busy = false, open = true, gen = 0, count = 3;
          const stateChip = h('span', { class: 'kmp-state' });
          const jobs = h('div', { class: 'kmp-jobs' });
          const vm = h('div', { class: 'kmp-vm' }, h('div', { class: 'kmp-head' }, h('span', { class: 'kmp-name' }, 'NewsViewModel (commonMain)'), h('span', { class: 'kmp-label' }, 'StateFlow<UiState>')), stateChip, h('span', { class: 'kmp-label' }, 'viewModelScope'), jobs);
          const mkScreen = (name, cls) => { const body = h('div', { class: 'kmp-list' }); const dev = h('div', { class: `kmp-dev ${cls}`, role: 'img', 'aria-label': `${name} screen` }, h('span', { class: 'kmp-scr-title' }, 'News'), body); return { dev, body }; };
          const and = mkScreen('Android', 'kmp-and'), ios = mkScreen('iOS', 'kmp-ios');
          const swiftLine = h('div', { class: 'kt' });
          const o = out('The ViewModel loaded 3 articles. Refresh it, switch the Swift bridge, or close the screen.');
          let state = { k: 'Success', n: 3 }, iosState = state;
          const label = s => s.k === 'Loading' ? 'UiState.Loading' : `UiState.Success(${s.n} articles)`;
          const render = (scr, s) => scr.body.replaceChildren(...(s.k === 'Loading' ? [h('div', { class: 'kmp-spin' })] : Array.from({ length: Math.min(s.n, 5) }, (_, i) => h('div', { class: 'kmp-li kmp-new' }, `Article ${i + 1}`))));
          const set = s => {
            state = s; stateChip.textContent = label(s); replay(stateChip, 'pop');
            render(and, s);
            if (BR[br].live) { iosState = s; render(ios, s); ios.dev.classList.remove('kmp-stale'); }
            else ios.dev.classList.toggle('kmp-stale', iosState !== s);
          };
          const btns = BR.map((b, i) => act(b.label, () => {
            if (busy) return; br = i; pick(btns, i);
            swiftLine.innerHTML = hl(b.swift); replay(swiftLine, 'pop-soft');
            iosState = state; render(ios, state); ios.dev.classList.remove('kmp-stale');
            say(o, b.live ? `<span class="good">${b.label}:</span> Swift now iterates the flow, so every new state re-renders the iOS screen.` : '<span class="muted">No bridge:</span> Swift reads <code>value</code> once. Refresh and watch iOS fall behind.');
          }));
          async function refresh() {
            if (busy || !open) return; busy = true; const g = ++gen;
            const job = h('span', { class: 'kmp-job kmp-run drop-in' }, `launch #${g}`); jobs.append(job);
            while (jobs.children.length > 4) jobs.firstElementChild.remove();
            set({ k: 'Loading' }); say(o, '<span class="muted">viewModelScope.launch { _state.value = UiState.Loading ... }</span>');
            await sleep(1100); if (!el.isConnected) return;
            if (g !== gen) return;
            count = 2 + (count % 4); set({ k: 'Success', n: count });
            job.className = 'kmp-job kmp-done';
            say(o, BR[br].live ? '<span class="good">ok:</span> both screens got the new state.' : '<span class="bad">stale:</span> Android updated. iOS still shows what it read the first time.');
            busy = false;
          }
          const closeBtn = act('Close screen', () => {
            open = !open;
            if (!open) {
              gen++; busy = false;
              jobs.querySelectorAll('.kmp-run').forEach(j => { j.className = 'kmp-job kmp-cancel'; });
              vm.classList.add('kmp-gone'); closeBtn.textContent = 'Open screen';
              say(o, '<span class="bad">onCleared():</span> viewModelScope cancelled. Running jobs stop on both platforms.');
            } else {
              vm.classList.remove('kmp-gone'); closeBtn.textContent = 'Close screen'; jobs.replaceChildren();
              say(o, 'New screen, new ViewModel.'); refresh();
            }
          });
          pick(btns, 0); swiftLine.innerHTML = hl(BR[0].swift);
          stateChip.textContent = label(state); render(and, state); render(ios, state);
          el.append(vm,
            h('div', { class: 'kmp-devs' },
              h('div', { class: 'kmp-dev-wrap' }, and.dev, h('span', { class: 'kmp-label' }, 'Compose')),
              h('div', { class: 'kmp-dev-wrap' }, ios.dev, h('span', { class: 'kmp-label' }, 'SwiftUI'))),
            h('div', { class: 'controls' }, h('span', { class: 'kmp-label' }, 'Swift side'), btns), swiftLine,
            h('div', { class: 'controls' }, cmd('viewModel.refresh()', refresh), closeBtn), o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'compose-mp',
        title: 'Compose Multiplatform',
        tagline: 'One composable, drawn on Android, iOS and desktop.',
        level: 'intermediate',
        body: `
<p>Compose Multiplatform is JetBrains' port of Jetpack Compose. On Android it is Jetpack Compose. On iOS (stable since 1.8) and desktop it draws the UI itself with Skia. You write <code>@Composable</code> functions in <code>commonMain</code> and each platform hosts them: <code>setContent</code> on Android, <code>ComposeUIViewController</code> on iOS, <code>Window</code> on desktop.</p>
<p>Shared resources go in <code>commonMain/composeResources</code>: images in <code>drawable</code>, strings in <code>values/strings.xml</code>, plus fonts and raw files. Add the <code>compose.components.resources</code> dependency and the plugin generates a <code>Res</code> class, so you write <code>painterResource(Res.drawable.logo)</code> and <code>stringResource(Res.string.greeting)</code>.</p>
<p>Platform-specific bits stay small: an <code>expect</code> function, or a native view embedded with <code>UIKitView</code> on iOS or <code>AndroidView</code> on Android.</p>`,
        code: `// commonMain/App.kt
@Composable
fun App() {
    var count by remember { mutableIntStateOf(0) }
    MaterialTheme {
        Column(
            Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Image(painterResource(Res.drawable.logo), contentDescription = null)
            Text(stringResource(Res.string.greeting), style = MaterialTheme.typography.headlineSmall)
            Button(onClick = { count++ }) { Text("Clicked $count times") }
            Text("Running on \${getPlatform().name}")
        }
    }
}

// androidMain: MainActivity.onCreate
setContent { App() }

// iosMain: shown from SwiftUI through UIViewControllerRepresentable
fun MainViewController() = ComposeUIViewController { App() }

// jvmMain: desktop entry point
fun main() = application {
    Window(onCloseRequest = ::exitApplication, title = "News") { App() }
}`,
        remember: 'Write the UI once in commonMain. Each platform only hosts it: setContent, ComposeUIViewController, Window.',
        terms: [
          { term: 'Compose Multiplatform', def: 'The JetBrains framework that runs Compose UI code on Android, iOS, desktop and web from one codebase.' },
          { term: 'Res', def: 'The class Compose Multiplatform generates from composeResources, with typed accessors like Res.string.title and Res.drawable.logo.' },
          { term: 'ComposeUIViewController', def: 'The iOS function that wraps a composable in a UIViewController so UIKit or SwiftUI can show it.' },
          { term: 'UIKitView', def: 'A composable that embeds a native UIKit view, such as a map, inside Compose UI on iOS.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Load the shared logo and title, and expose the screen to iOS.', code: 'Image([[painterResource]](Res.drawable.logo), contentDescription = null)\nText([[stringResource]](Res.string.title))\n\n// iosMain\nfun MainViewController() = [[ComposeUIViewController]] { App() }', why: 'The generated <code>Res</code> accessors go through <code>painterResource</code> and <code>stringResource</code>. iOS gets a <code>UIViewController</code> from <code>ComposeUIViewController</code>.' },
          { type: 'bug', prompt: 'This compiles in an Android-only app but not in <code>commonMain</code>. Tap the line.', code: '@Composable\nfun Header() {\n    Column(Modifier.padding(16.dp)) {\n        Image(painterResource(Res.drawable.logo), contentDescription = null)\n        Text(stringResource(R.string.title))\n    }\n}', bug: 4, fix: '        Text(stringResource(Res.string.title))', why: '<code>R</code> is generated by the Android build only. Shared code uses the Compose Multiplatform <code>Res</code> class.' },
        ],
        quiz: [
          { q: 'Where does a shared <code>strings.xml</code> go?', options: ['<code>androidMain/res/values</code>', '<code>commonMain/composeResources/values</code>', 'In the Xcode project'], a: 1, why: 'Files under <code>composeResources</code> are packaged for every target and exposed through <code>Res</code>.' },
          { q: 'How does an iOS app show a shared composable?', options: ['It wraps it with <code>ComposeUIViewController</code> and shows the UIViewController', 'It converts it to SwiftUI views at build time', 'It runs Android inside the iOS app'], a: 0, why: 'Compose draws into a UIViewController. SwiftUI hosts it with <code>UIViewControllerRepresentable</code>.' },
          { q: 'On iOS, what draws a Compose Multiplatform <code>Button</code>?', options: ['A UIKit <code>UIButton</code>', 'Compose itself, rendering with Skia', 'WebKit'], a: 1, why: 'Compose renders its own pixels with Skia. Use <code>UIKitView</code> when you need a real native view.' },
        ],
        visual(el) {
          const GREET = ['Hello, KMP!', 'Merhaba!', 'Welcome back', 'Hi from common'];
          const COLORS = [['', 'accent'], ['kmp-c-warm', 'warm'], ['kmp-c-ok', 'ok'], ['kmp-c-err', 'err']];
          let g = 0, c = 0, busy = false;
          const lines = {};
          const src = [
            ['h', '@Composable fun App() {'],
            ['', '  var count by remember { mutableIntStateOf(0) }'],
            ['logo', '  Image(painterResource(Res.drawable.logo), null)'],
            ['greet', '  Text(stringResource(Res.string.greeting))  // "Hello, KMP!"'],
            ['btn', '  Button(onClick = { count++ }) { Text("Clicked $count") }'],
            ['plat', '  Text("Running on ${getPlatform().name}")'],
            ['', '}'],
          ];
          const codeBox = h('div', { class: 'kmp-code' }, src.map(([k, s]) => { const l = h('div', { class: 'kmp-line', html: hl(s) }); if (k) lines[k] = l; return l; }));
          const FRAMES = [
            { name: 'Android', host: 'setContent { App() }', plat: 'Android 36', cls: 'kmp-dev kmp-and' },
            { name: 'iOS', host: 'ComposeUIViewController { App() }', plat: 'iOS 26.0', cls: 'kmp-dev kmp-ios' },
            { name: 'Desktop', host: 'Window { App() }', plat: 'Java 21.0.4', cls: 'kmp-dev kmp-win' },
          ];
          const o = out('Three hosts run the same App(). Tap a button inside a frame, or edit the shared code.');
          const frames = FRAMES.map(f => {
            const st = { count: 0 };
            const logo = h('div', { class: 'kmp-logo' });
            const hello = h('div', { class: 'kmp-hello' });
            const btn = h('button', { class: 'kmp-btn', onclick() { st.count++; paintBtn(); replay(btn, 'pop'); say(o, `<span class="muted">${f.name}:</span> count++ recomposed only this frame. Each app keeps its own state.`); } });
            const paintBtn = () => { btn.textContent = `Clicked ${st.count}`; };
            const content = [logo, hello, btn, h('div', { class: 'kmp-plat' }, `Running on ${f.plat}`)];
            const dev = f.name === 'Desktop'
              ? h('div', { class: f.cls, role: 'group', 'aria-label': 'Desktop window' }, h('div', { class: 'kmp-win-bar' }, h('i'), h('i'), h('i'), 'News'), h('div', { class: 'kmp-win-body' }, content))
              : h('div', { class: f.cls, role: 'group', 'aria-label': `${f.name} phone` }, content);
            paintBtn();
            return { f, dev, logo, hello, paint() { hello.textContent = GREET[g]; dev.classList.remove('kmp-c-warm', 'kmp-c-ok', 'kmp-c-err'); if (COLORS[c][0]) dev.classList.add(COLORS[c][0]); } };
          });
          frames.forEach(fr => fr.paint());
          async function edit(key, change, msg) {
            if (busy) return; busy = true; change();
            const l = lines[key]; l.classList.add('kmp-hot');
            if (key === 'greet') l.innerHTML = hl(`  Text(stringResource(Res.string.greeting))  // "${GREET[g]}"`);
            replay(l, 'pop-soft'); say(o, `<span class="muted">${msg}</span>`);
            await sleep(450);
            for (const fr of frames) { if (!el.isConnected) return; fr.paint(); replay(fr.dev, 'pop'); await sleep(260); }
            l.classList.remove('kmp-hot');
            say(o, '<span class="good">ok:</span> one edit in commonMain, three platforms updated. Counters kept their own values.');
            busy = false;
          }
          el.append(codeBox,
            h('div', { class: 'kmp-devs' }, frames.map(fr => h('div', { class: 'kmp-dev-wrap' }, fr.dev, h('span', { class: 'kmp-label' }, fr.f.host)))),
            h('div', { class: 'controls' },
              act('Edit strings.xml greeting', () => edit('greet', () => { g = (g + 1) % GREET.length; }, 'composeResources/values/strings.xml changed. Res.string.greeting has a new value.')),
              act('Change logo color', () => edit('logo', () => { c = (c + 1) % COLORS.length; }, `Res.drawable.logo swapped for the ${COLORS[(c + 1) % COLORS.length][1]} version.`))),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'swift',
        title: 'Interop with Swift and iOS',
        tagline: 'What your Kotlin API looks like from the Swift side.',
        level: 'advanced',
        body: `
<p>Kotlin/Native exports the shared module as a framework with an Objective-C header. Swift imports that header, so Swift sees your Kotlin API through Objective-C. Classes stay classes, interfaces become protocols, <code>List</code> becomes a Swift array, and an <code>object</code> is reached through <code>.shared</code>. Kotlin <code>Int</code> arrives as <code>Int32</code>, and top-level functions live on a class named after the file, like <code>PlatformKt</code>.</p>
<p>A <code>suspend</code> function becomes a method with a completion handler, which Swift can also call with <code>await</code>. Exceptions only cross into Swift if the function declares them with <code>@Throws</code>. Anything else crashes the app. Suspend functions always pass <code>CancellationException</code> through.</p>
<p>Sealed classes and enums lose their exhaustiveness: Swift sees a class hierarchy and needs <code>as?</code> casts with a default case. SKIE fixes that with real Swift enums and <code>onEnum(of:)</code>. Kotlin's own Swift export, which skips Objective-C, is still in Alpha.</p>`,
        code: `// Kotlin, commonMain
class UserRepository(private val api: UserApi) {
    fun count(): Int = api.cachedCount()

    @Throws(IOException::class)
    suspend fun load(id: String): User = api.fetch(id)
}

object Logger {
    fun log(message: String) = println(message)
}

sealed class UiState {
    data object Loading : UiState()
    data class Success(val user: User) : UiState()
}

// Swift, iOS app
// import Shared
//
// let n: Int32 = repo.count()                  // Kotlin Int is Int32
// Logger.shared.log(message: "start")          // object -> .shared
// let user = try await repo.load(id: "42")     // suspend -> async throws
//
// if let s = state as? UiState.Success {       // no exhaustive switch
//     print(s.user.name)
// }
//
// With SKIE:
// switch onEnum(of: state) {
// case .loading: showSpinner()
// case .success(let s): show(s.user)
// }`,
        remember: 'Swift sees Kotlin through Objective-C: Int is Int32, object is .shared, suspend is async, and only @Throws exceptions survive.',
        terms: [
          { term: '@Throws', def: 'A Kotlin annotation that lists exceptions to turn into Swift errors; undeclared exceptions crash when they reach Swift.' },
          { term: 'Objective-C export', def: 'The Kotlin/Native step that generates an Objective-C header for the framework, which is how Swift sees Kotlin types today.' },
          { term: 'XCFramework', def: 'An Apple bundle that holds one framework per platform and architecture, such as device and simulator, for Xcode to link.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the Kotlin singleton and exception usable from Swift.', code: '// Kotlin\n[[object]] Analytics {\n    fun track(event: String) { /* ... */ }\n}\n\n@[[Throws]](IOException::class)\nfun readConfig(): String = loadFile("config.json")\n\n// Swift\nAnalytics.[[shared]].track(event: "open")\nlet config = try ConfigKt.readConfig()', why: 'A Kotlin <code>object</code> is reached through <code>.shared</code>. <code>@Throws</code> turns the IOException into a Swift error you can <code>try</code>.' },
          { type: 'bug', prompt: 'This Swift file does not compile. Tap the line.', code: 'import Shared\n\nfunc summary(repo: UserRepository) -> String {\n    let total: Int = repo.count()\n    let names = repo.names()\n    return "\\(total) users: " + names.joined(separator: ", ")\n}', bug: 3, fix: '    let total = Int(repo.count())   // Kotlin Int arrives as Int32', why: 'Kotlin <code>Int</code> is 32-bit, so Swift sees <code>Int32</code>. Swift does not convert number types for you.' },
        ],
        quiz: [
          { q: 'Kotlin has <code>fun count(): Int</code>. What does Swift get?', options: ['<code>Int</code>', '<code>Int32</code>', '<code>NSNumber</code>'], a: 1, why: 'Kotlin <code>Int</code> is always 32-bit, so the header uses <code>int32_t</code>, which Swift imports as <code>Int32</code>.' },
          { q: 'A Kotlin function throws an exception it did not declare with <code>@Throws</code>, and Swift called it. What happens?', options: ['Swift receives an <code>Error</code>', 'The app crashes', 'It returns nil'], a: 1, why: 'Only declared exceptions become Swift errors. Undeclared ones terminate the program.' },
          { q: 'Without SKIE, how does Swift check which <code>UiState</code> it has?', options: ['An exhaustive <code>switch</code> over enum cases', '<code>as?</code> casts or <code>is</code> checks, with a fallback case', 'It cannot see sealed classes'], a: 1, why: 'Swift sees a class hierarchy, so the compiler cannot prove every case is handled. SKIE adds <code>onEnum(of:)</code> for that.' },
        ],
        visual(el) {
          const ROWS = [
            { k: 'class User(val name: String)', s: 'let u = User(name: "Ada")\nu.name  // String', note: 'Classes map to Swift classes. Constructor parameters become labels.' },
            { k: 'fun count(): Int', s: 'func count() -> Int32', note: 'Kotlin Int is 32-bit. Wrap with Int(...) when Swift needs Int.' },
            { k: 'val tags: List<String>', s: 'var tags: [String] { get }', note: 'Read-only collections become Swift arrays and dictionaries.' },
            { k: 'object Logger', s: 'Logger.shared.log(message: "hi")', note: 'An object is a class with one instance, reached through .shared.' },
            { k: 'enum class Theme { LIGHT, DARK }', s: 'Theme.light  // a class\nswitch needs default:', sk: 'enum Theme { case light, dark }\n// exhaustive switch', note: 'Plain export makes enums classes with static members. SKIE generates a real Swift enum.' },
            { k: 'sealed class UiState', s: 'if let s = state as? UiState.Success\n{ ... } else { ... }', sk: 'switch onEnum(of: state) {\ncase .loading: ...\ncase .success(let s): ... }', note: 'Sealed hierarchies need casts in plain export. SKIE wraps them in an exhaustive Swift enum.' },
            { k: '@Throws(IOException::class)\nsuspend fun load(): User', s: 'repo.load { user, error in ... }\n// or: try await repo.load()', sk: 'try await repo.load()\n// Task cancel cancels the coroutine', note: 'Suspend becomes a completion handler, which Swift can await. SKIE adds two-way cancellation.' },
            { k: 'val state: StateFlow<UiState>', s: 'vm.state.value  // read once\n// collect needs a FlowCollector', sk: 'for await s in vm.state { ... }', note: 'Flows lose their generic type and have no async API without help. SKIE makes them AsyncSequences.' },
          ];
          let skie = false, busy = false;
          const o = out('Each row shows a Kotlin declaration and what Swift sees. Tap a row to export it.');
          const rows = ROWS.map((r, i) => {
            const k = h('div', { class: 'kmp-cell', html: hl(r.k) });
            const pass = h('div', { class: 'kmp-pass', 'aria-hidden': 'true' });
            const s = h('div', { class: 'kmp-cell' });
            const row = h('button', { class: 'kmp-row', 'aria-label': `Export ${r.k.split('\n').pop()}`, onclick: () => send(i) }, k, pass, s);
            return { r, row, pass, s };
          });
          const swiftOf = x => (skie && x.r.sk) || x.r.s;
          const paint = x => { x.s.textContent = swiftOf(x); x.s.classList.toggle('kmp-skie', skie && !!x.r.sk); };
          rows.forEach(paint);
          async function send(i) {
            if (busy) return; busy = true;
            const x = rows[i];
            rows.forEach((y, j) => y.row.classList.toggle('kmp-on', j === i));
            x.s.textContent = ''; x.pass.append(h('span', { class: 'kmp-dot' }));
            say(o, '<span class="muted">Kotlin/Native: writing the Objective-C header...</span>');
            await sleep(560); if (!el.isConnected) return;
            x.pass.replaceChildren(); paint(x); replay(x.s, 'drop-in');
            say(o, `<span class="good">Swift:</span> ${x.r.note}`);
            busy = false;
          }
          async function playAll() {
            for (let i = 0; i < rows.length; i++) { if (!el.isConnected) return; while (busy) { await sleep(60); if (!el.isConnected) return; } await send(i); await sleep(250); }
          }
          const sw = h('input', { type: 'checkbox', id: 'kmp-skie', onchange() {
            skie = this.checked;
            rows.filter(x => x.r.sk).forEach(x => { paint(x); replay(x.s, 'flip'); });
            say(o, skie ? '<span class="good">SKIE on:</span> the green-edged rows now get Swift-native enums, async sequences and cancellation.' : 'SKIE off: plain Objective-C export.');
          } });
          el.append(h('div', { class: 'kmp-map' },
            h('div', { class: 'kmp-maphead' }, h('span', { class: 'kmp-label' }, 'Kotlin'), h('span'), h('span', { class: 'kmp-label' }, 'Swift sees')),
            rows.map(x => x.row)),
          h('div', { class: 'controls' }, act('Export all', playAll), h('label', { class: 'switch', for: 'kmp-skie' }, sw, 'with SKIE')),
          o);
        },
      },
    ],
  });
})();
