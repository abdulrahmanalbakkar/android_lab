/* Build and release track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed bd-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const toggle = (id, label, onchange) => {
    const input = h('input', { type: 'checkbox', id, onchange });
    return { input, el: h('label', { class: 'switch', for: id }, input, label) };
  };
  const lbl = t => h('span', { class: 'bd-label' }, t);

  const css = `
.bd-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.bd-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; min-width: 0; }
.bd-card { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.bd-card .out { font-size: 0.8rem; }
.bd-flash { animation: bd-flash 0.8s ease-out; }
@keyframes bd-flash { from { background: var(--accent-soft); box-shadow: 0 0 0 4px var(--accent-soft); } }
.bd-line { font: 500 0.8rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 6px 10px; overflow-x: auto; white-space: pre; min-width: 0; }

/* 1 phases */
.bd-phases { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 10px; }
.bd-phase { display: grid; gap: 4px; align-content: start; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.bd-phase b { font: 700 0.92rem var(--display); }
.bd-phase small { color: var(--muted); font-size: 0.84rem; line-height: 1.35; }
.bd-phase.bd-on { border-color: var(--accent); background: var(--accent-soft); }
.bd-phase.bd-skip { border-style: dashed; opacity: 0.6; }
.bd-tasks { display: grid; gap: 2px; padding: 10px; border-radius: 12px; background: var(--code-bg); overflow-x: auto; }
.bd-task { display: flex; justify-content: space-between; gap: 14px; align-items: center; font: 500 0.82rem var(--mono); color: var(--code-ink); padding: 3px 8px; border-radius: 6px; white-space: nowrap; transition: background 0.2s; }
.bd-task.bd-now { background: rgba(255, 212, 121, 0.14); }
.bd-st { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--t-c); }
.bd-st.bd-ex { color: var(--t-f); }
.bd-st.bd-utd { color: var(--t-s); }
.bd-st.bd-busy { color: var(--t-k); }

.bd-st.bd-fc { color: var(--t-t); }
/* depth demos */
.bd-graph svg { color: var(--muted); }
.bd-edge.bd-cyc { stroke: var(--err); stroke-width: 2.5; }
.bd-bar { display: grid; place-items: center; overflow: hidden; font: 600 0.66rem var(--mono); color: var(--accent-ink); white-space: nowrap; }

/* 2 catalog */
.bd-repos { display: flex; flex-wrap: wrap; gap: 6px; }
.bd-repo { font: 600 0.76rem var(--mono); padding: 3px 9px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.2s, color 0.2s, border-color 0.2s; }
.bd-repo.bd-look { border-color: var(--warm); color: var(--warm); }
.bd-repo.bd-no { border-color: var(--err); color: var(--err); background: var(--err-soft); }
.bd-repo.bd-yes { border-color: var(--ok); color: var(--ok); background: var(--ok-soft); }
.bd-mods { display: flex; flex-wrap: wrap; gap: 6px; }
.bd-mod { font: 600 0.76rem var(--mono); padding: 4px 9px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); }

/* 3 variants */
.bd-matrix { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr); gap: 6px; min-width: 0; }
.bd-mh { font: 600 0.7rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; align-self: center; padding: 2px 4px; overflow-wrap: anywhere; min-width: 0; }
.bd-cell { font: 600 0.8rem var(--mono); padding: 9px 6px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; overflow-wrap: anywhere; min-width: 0; text-align: center; }
.bd-cell:hover { border-color: var(--accent); }
.bd-cell[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.bd-kv { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 14px; margin: 0; font: 500 0.82rem var(--mono); }
.bd-kv dt { color: var(--muted); }
.bd-kv dd { margin: 0; overflow-wrap: anywhere; }
.bd-sets { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.bd-set { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 7px; background: var(--sunk); overflow-wrap: anywhere; }
.bd-set.bd-top { background: var(--warm-soft); color: var(--warm); }
.bd-gt { color: var(--muted); font: 600 0.8rem var(--mono); }
.bd-count { font: 600 0.85rem var(--mono); color: var(--warm); }

/* 4 module graph */
.bd-graph { background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; padding: 8px; min-width: 0; }
.bd-graph svg { display: block; width: 100%; max-width: 540px; height: auto; margin: 0 auto; }
.bd-edge { stroke: var(--muted); stroke-width: 1.5; transition: stroke 0.25s; }
.bd-edge.bd-api { stroke: var(--accent); stroke-width: 2.5; stroke-dasharray: 6 3; }
.bd-elab { font: 600 10px var(--mono); fill: var(--muted); }
.bd-elab.bd-api { fill: var(--accent); }
.bd-node rect { fill: var(--surface); stroke: var(--ink); stroke-width: 1.5; transition: fill 0.25s, stroke 0.25s; }
.bd-node text { font: 600 10.5px var(--mono); fill: var(--ink); }
.bd-node.bd-src rect { fill: var(--err-soft); stroke: var(--err); stroke-width: 2.5; }
.bd-node.bd-hot rect { fill: var(--warm-soft); stroke: var(--warm); stroke-width: 2.5; }
.bd-node.bd-pack rect { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 2.5; }
.bd-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 0.82rem; color: var(--muted); }
.bd-legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; border: 2px solid; }
.bd-legend .bd-l-src { background: var(--err-soft); border-color: var(--err); }
.bd-legend .bd-l-hot { background: var(--warm-soft); border-color: var(--warm); }
.bd-legend .bd-l-pack { background: var(--accent-soft); border-color: var(--accent); }

/* 5 signing */
.bd-flow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.bd-stn { display: grid; gap: 6px; justify-items: center; align-content: start; text-align: center; padding: 10px 6px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-height: 128px; min-width: 0; transition: border-color 0.25s, background 0.25s; }
.bd-stn b { font: 700 0.84rem var(--display); }
.bd-stn small { font-size: 0.75rem; color: var(--muted); line-height: 1.3; }
.bd-stn.bd-on { border-color: var(--accent); }
.bd-stn.bd-bad { border-color: var(--err); background: var(--err-soft); }
.bd-pslot { min-height: 26px; display: grid; place-items: center; max-width: 100%; }
.bd-pkg { font: 600 0.7rem var(--mono); padding: 4px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); max-width: 100%; overflow-wrap: anywhere; }
.bd-pkg.bd-g { background: var(--ok); }
.bd-pkg.bd-r { background: var(--err); }
.bd-keys { display: flex; flex-wrap: wrap; gap: 8px; }
.bd-key { font: 600 0.78rem var(--mono); padding: 5px 10px; border-radius: 8px; border: 2px solid var(--ok); background: var(--ok-soft); color: var(--ink); transition: background 0.25s, border-color 0.25s; }
.bd-key.bd-lost { border-color: var(--err); background: var(--err-soft); text-decoration: line-through; }
.bd-key.bd-leak { border-color: var(--warm); background: var(--warm-soft); }
@media (max-width: 560px) { .bd-flow { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

/* 6 bundles */
.bd-picks { display: grid; gap: 8px; }
.bd-pick { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.bd-pick .bd-label { width: 76px; }
.bd-opt { font: 600 0.8rem var(--mono); padding: 5px 11px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); cursor: pointer; }
.bd-opt[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.bd-files { display: grid; gap: 4px; min-height: 34px; }
.bd-file { display: flex; justify-content: space-between; gap: 10px; font: 500 0.8rem var(--mono); padding: 5px 10px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.bd-file span:first-child { overflow-wrap: anywhere; min-width: 0; }
.bd-file.bd-feat { border-color: var(--accent); background: var(--accent-soft); }
.bd-size { display: grid; grid-template-columns: 92px minmax(0, 1fr) 62px; gap: 8px; align-items: center; font: 600 0.78rem var(--mono); }
.bd-size span:last-child { text-align: right; }
.bd-meter { height: 12px; background: var(--sunk); border-radius: 99px; overflow: hidden; }
.bd-meter span { display: block; height: 100%; width: 0; background: var(--accent); border-radius: 99px; transition: width 0.4s; }
.bd-meter.bd-uni span { background: var(--muted); }

/* 7 rollout */
.bd-tracks { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.bd-trk { font: 600 0.78rem var(--mono); padding: 5px 10px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.25s, border-color 0.25s; }
.bd-trk.bd-on { border-color: var(--accent); color: var(--ink); background: var(--accent-soft); }
.bd-trk.bd-past { color: var(--ok); border-color: var(--ok); }
.bd-dots { width: 100%; max-width: 560px; justify-self: center; display: grid; grid-template-columns: repeat(20, minmax(0, 1fr)); gap: 4px; padding: 12px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; }
.bd-dot { aspect-ratio: 1; border-radius: 50%; background: var(--sunk); border: 1px solid var(--line); transition: background 0.35s, border-color 0.35s; }
.bd-dot.bd-v1 { background: var(--warm); border-color: var(--warm); }
.bd-dot.bd-crash { background: var(--err); border-color: var(--err); box-shadow: inset 0 0 0 3px var(--surface); }
.bd-dot.bd-v2 { background: var(--accent); border-color: var(--accent); }
.bd-dkey { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 0.82rem; color: var(--muted); align-items: center; }
.bd-dkey i { display: inline-block; width: 11px; height: 11px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; background: var(--sunk); border: 1px solid var(--line); }
.bd-dkey .bd-v1 { background: var(--warm); border-color: var(--warm); }
.bd-dkey .bd-crash { background: var(--err); border-color: var(--err); box-shadow: inset 0 0 0 2px var(--surface); }
.bd-dkey .bd-v2 { background: var(--accent); border-color: var(--accent); }
/* depth pass 2 */
.bd-d2-tree { display: grid; gap: 1px; align-content: start; font: 500 0.78rem/1.6 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 10px 14px; min-height: 5.4em; overflow-x: auto; min-width: 0; }
.bd-d2-tree > div { white-space: pre; }
.bd-d2-cmd { color: var(--t-c); }
.bd-d2-up { color: var(--t-f); }
.bd-d2-down { color: var(--t-e); }
.bd-d2-pin { color: var(--t-s); }
.bd-cell.bd-d2-off { background: var(--bg); color: var(--muted); border-style: dashed; text-decoration: line-through; }
.bd-set.bd-d2-win { background: var(--ok-soft); color: var(--ok); }
.bd-d2-apk { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.1fr); gap: 4px; min-width: 0; }
.bd-d2-seg { display: grid; gap: 2px; align-content: start; padding: 8px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.bd-d2-seg b { font: 600 0.78rem var(--mono); overflow-wrap: anywhere; }
.bd-d2-seg small { font-size: 0.74rem; color: var(--muted); line-height: 1.3; }
.bd-d2-seg.bd-d2-cov { border-color: var(--accent); background: var(--accent-soft); }
.bd-d2-seg.bd-d2-gone { opacity: 0.45; border-style: dashed; }
.bd-d2-seg.bd-d2-hit { outline: 3px solid var(--warm); outline-offset: -6px; }
.bd-d2-seg.bd-d2-scan { background: var(--warm-soft); }
@media (max-width: 560px) { .bd-d2-apk { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.bd-key.bd-d2-signer { border-color: var(--accent); background: var(--accent-soft); }
.bd-file.bd-d2-bad { border-color: var(--err); background: var(--err-soft); }
.bd-d2-tag { justify-self: start; font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.bd-d2-mod { transition: border-color 0.25s; }
.bd-d2-mod.bd-d2-here { border-color: var(--ok); }
.bd-d2-mod.bd-d2-here .bd-d2-tag { background: var(--ok-soft); color: var(--ok); }
.bd-d2-mono { font: 600 0.82rem var(--mono); overflow-wrap: anywhere; }
.bd-d2-small { color: var(--muted); font-size: 0.8rem; line-height: 1.35; overflow-wrap: anywhere; }
.bd-grid.bd-d2-users { grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr)); }
.bd-d2-user b { font: 700 0.86rem var(--display); }
.bd-d2-big { font: 800 1.5rem var(--mono); color: var(--accent); }
.bd-d2-chart { display: grid; gap: 4px; min-width: 0; }
.bd-d2-scale { position: relative; height: 30px; border-radius: 8px; background: var(--sunk); overflow: hidden; }
.bd-d2-base { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--ok); }
.bd-d2-band { position: absolute; top: 6px; bottom: 6px; left: 0; width: 0; box-sizing: border-box; border-radius: 6px; background: var(--warm-soft); border: 2px solid var(--warm); opacity: 0; transition: left 0.4s, width 0.4s, opacity 0.3s; }
.bd-d2-pt { position: absolute; top: 50%; left: 0; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--warm); opacity: 0; transition: left 0.4s; }
.bd-d2-ticks { display: flex; justify-content: space-between; gap: 6px; font: 500 0.72rem var(--mono); color: var(--muted); }
/* api levels */
.bd-al-gates { display: grid; gap: 6px; min-width: 0; }
.bd-al-gate { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.bd-al-head { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; min-width: 0; }
.bd-al-head b { font: 700 0.88rem var(--display); }
.bd-al-by { font: 600 0.7rem var(--mono); color: var(--muted); }
.bd-al-st { margin-left: auto; font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.bd-al-gate small { font: 500 0.78rem/1.4 var(--mono); color: var(--muted); overflow-wrap: anywhere; min-width: 0; }
.bd-al-gate small:empty { display: none; }
.bd-al-ok { border-color: var(--ok); background: var(--ok-soft); }
.bd-al-ok .bd-al-st { color: var(--ok); }
.bd-al-warn { border-color: var(--warm); background: var(--warm-soft); }
.bd-al-warn .bd-al-st { color: var(--warm); }
.bd-al-bad { border-color: var(--err); background: var(--err-soft); }
.bd-al-bad .bd-al-st { color: var(--err); }
.bd-al-skip { border-style: dashed; opacity: 0.55; }
.bd-al-gate.bd-al-ok small, .bd-al-gate.bd-al-warn small, .bd-al-gate.bd-al-bad small { color: var(--ink); }
`;

  Lab.addTrack({
    id: 'build',
    title: 'Build and release',
    description: 'How Gradle turns your modules into a signed App Bundle and how that bundle reaches users through Google Play.',
    group: 'Shipping', requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'gradle',
        title: 'Gradle basics',
        tagline: 'Settings, build scripts, tasks and the three phases of a build.',
        level: 'beginner',
        body: `
<p>Gradle builds your app from a few Kotlin script files. <code>settings.gradle.kts</code> lists the projects (modules) in the build and the repositories to download from. Each module has a <code>build.gradle.kts</code>. Its <code>plugins { }</code> block applies plugins such as <code>com.android.application</code>, which add the <code>android { }</code> block and dozens of tasks. Since AGP 9, Kotlin support is built in, so Android modules no longer apply the Kotlin Android plugin.</p>
<p>Every build runs in three phases. Initialization reads the settings file. Configuration runs every build script and wires the tasks into a graph. Execution runs only the tasks your command needs, in dependency order, and skips any task whose inputs and outputs have not changed.</p>
<p>Build scripts run on every build, even <code>./gradlew help</code>, so keep them cheap. Put real work inside a task action like <code>doLast</code>. Turn on the configuration cache so Gradle can skip configuration when no script changed. Always call <code>./gradlew</code>: the wrapper pins one Gradle version for the whole team.</p>`,
        code: `// settings.gradle.kts: which projects take part, where artifacts come from
pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositories { google(); mavenCentral() }
}
rootProject.name = "News"
include(":app")

// app/build.gradle.kts: configures one project
plugins {
    id("com.android.application")   // version is declared once, in the root build file
}

android {
    namespace = "com.example.news"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.example.news"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }
}

// Configured during configuration, run during execution
tasks.register("hello") {
    doLast { println("Hello from :app") }
}

// gradle.properties
// org.gradle.configuration-cache=true`,
        remember: 'Scripts configure, tasks execute. Work in a build script runs on every build; work in doLast runs only when needed.',
        terms: [
          { term: 'Gradle task', def: 'A unit of build work, such as compiling Kotlin or packaging an APK, with declared inputs and outputs so Gradle can skip it when nothing changed.' },
          { term: 'Configuration phase', def: 'The build phase where Gradle runs every build script to create and wire up the task graph.' },
          { term: 'Execution phase', def: 'The build phase where Gradle runs the actions of only the tasks the requested command depends on.' },
          { term: 'Gradle wrapper', def: 'The gradlew script and its properties file that download and run one pinned Gradle version for everyone on the project.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Register a task lazily and give it an action that runs at execution time.', code: 'tasks.[[register]]("printVersion") {\n    [[doLast|doFirst]] {\n        println("Building News 1.0")\n    }\n}', why: '<code>register</code> creates the task only when something needs it. Code in <code>doLast</code> runs in the execution phase, only when the task runs.' },
          { type: 'bug', prompt: 'This task prints its greeting at the wrong time, and with the configuration cache on it prints nothing at all. Tap the wrong line.', code: 'tasks.register("hello") {\n    group = "demo"\n    description = "Prints a greeting"\n    println("Hello from Gradle")\n}', bug: 3, fix: '    doLast { println("Hello from Gradle") }', why: 'The register block configures the task. A bare <code>println</code> there runs during configuration and leaves the task with no action. Wrap the work in <code>doLast</code>.' },
        ],
        quiz: [
          { q: 'You run <code>./gradlew assembleDebug</code> twice without changing anything. What does the second run do?', options: ['Recompiles everything to be safe', 'Configures, then marks the tasks UP-TO-DATE and skips their work', 'Skips all three phases'], a: 1, why: 'Gradle compares each task\u2019s inputs and outputs with the last run. Nothing changed, so every task is up to date. Configuration still runs unless the configuration cache is reused.' },
          { q: 'Where does <code>include(":feature:news")</code> belong?', options: ['<code>app/build.gradle.kts</code>', '<code>settings.gradle.kts</code>', '<code>gradle.properties</code>'], a: 1, why: 'The settings file decides which projects are part of the build. It is read in the initialization phase.' },
          { q: 'What does the configuration cache let Gradle skip?', options: ['The execution phase', 'The configuration phase, when build scripts and their inputs are unchanged', 'Downloading dependencies'], a: 1, why: 'Gradle stores the configured task graph and reuses it. Tasks still run or get skipped as usual.' },
          { q: 'A custom task has a doLast action but declares no outputs. You run the build twice and change nothing. What does Gradle do with that task on the second run?', options: ['Marks it UP-TO-DATE and skips it', 'Runs it again, because a task with no outputs can never be up to date', 'Restores it FROM-CACHE'], a: 1, why: 'The up-to-date check compares declared inputs and outputs with the last run. With no outputs there is nothing to compare, so the action runs on every build.' },
          { q: 'You build on <code>main</code>, switch to a feature branch, build, then switch back to <code>main</code>. Tasks that were UP-TO-DATE before now run again. Which setting lets Gradle reuse the earlier outputs?', options: ['<code>org.gradle.configuration-cache=true</code>', '<code>org.gradle.parallel=true</code>', '<code>org.gradle.caching=true</code>, the build cache'], a: 2, why: 'UP-TO-DATE only compares with the last run in this folder. The build cache stores outputs by an input key, so when the main-branch inputs come back the outputs are copied in as FROM-CACHE.' },
        ],
        deeper: [
          {
            title: 'Inputs and outputs make a task skippable',
            body: `<p>A task is UP-TO-DATE only if Gradle knows what it reads and what it writes. Before it runs a task, Gradle hashes the declared inputs and checks the declared outputs. If both match the last run, the action is skipped.</p>
<p>Gradle hashes file contents, not timestamps, so touching a file changes nothing. Deleting an output makes the task run again. A task that declares no outputs can never be up to date, so it runs on every build.</p>`,
            visual(el) {
              let content = 'versionName=1.0', touched = 0, made = false, last = null, busy = false;
              const hash = s => { let x = 7; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x.toString(16).padStart(8, '0').slice(0, 8); };
              const st = h('span', { class: 'bd-st' }, 'never run');
              const row = h('div', { class: 'bd-task' }, h('span', {}, ':app:writeVersion'), st);
              const kv = h('dl', { class: 'bd-kv' });
              const o = out('Run the task, then change things and run it again.');
              const decl = toggle('bd-g1-out', 'declares @OutputFile', function () {
                if (busy) { this.checked = !this.checked; return; }
                say(o, this.checked ? 'Outputs declared. Gradle can check them now.' : 'No outputs declared. Gradle has nothing to compare.');
              });
              decl.input.checked = true;
              const paint = () => kv.replaceChildren(...[
                ['version.txt', `${content} · touched ${touched}x`],
                ['input hash now', hash(content)],
                ['input hash last run', last || 'none'],
                ['Version.kt', made ? 'exists' : 'missing'],
              ].flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
              async function run() {
                if (busy) return; busy = true;
                st.textContent = 'checking'; st.className = 'bd-st bd-busy'; row.classList.add('bd-now');
                say(o, '<span class="muted">$ ./gradlew writeVersion --info</span>');
                await sleep(450); if (!el.isConnected) return;
                const now = hash(content);
                const why = !decl.input.checked ? 'Task has not declared any outputs despite executing actions.'
                  : last === null ? 'No history is available.'
                  : last !== now ? "Input property 'versionFile' file version.txt has changed."
                  : !made ? "Output property 'outputFile' file Version.kt has been removed." : null;
                row.classList.remove('bd-now');
                if (why) { made = true; last = now; st.textContent = 'EXECUTED'; st.className = 'bd-st bd-ex'; say(o, `<span class="bad">not up-to-date:</span> ${why}`); }
                else { st.textContent = 'UP-TO-DATE'; st.className = 'bd-st bd-utd'; say(o, '<span class="good">Skipping task \':app:writeVersion\' as it is up-to-date.</span>'); }
                replay(row, 'bd-flash'); paint(); busy = false;
              }
              const edit = (fn, msg) => () => { if (busy) return; fn(); paint(); replay(kv, 'bd-flash'); say(o, msg); };
              paint();
              el.append(
                h('div', { class: 'bd-tasks' }, row),
                h('div', { class: 'bd-card' }, lbl('What Gradle compares'), kv),
                h('div', { class: 'controls' },
                  cmd('./gradlew writeVersion', run),
                  act('Edit version.txt', edit(() => { content = content.endsWith('1.0') ? 'versionName=1.1' : 'versionName=1.0'; }, 'Content changed, so the input hash changed.')),
                  act('Touch version.txt', edit(() => { touched++; }, 'New timestamp, same bytes. The hash is the same.')),
                  act('Delete Version.kt', edit(() => { made = false; }, 'The output file is gone.')),
                  decl.el),
                o);
            },
          },
          {
            title: 'The build cache: FROM-CACHE',
            body: `<p>UP-TO-DATE only compares with the last run in this folder. Switch to a branch and back, and the outputs on disk belong to the other branch, so tasks run again.</p>
<p>The build cache remembers outputs by a key made from all the task’s inputs. When the same key comes back, Gradle copies the outputs from the cache and marks the task FROM-CACHE. Turn it on with <code>org.gradle.caching=true</code>. A remote cache shared with CI lets a fresh checkout skip work someone else already did.</p>`,
            code: `# gradle.properties
org.gradle.caching=true
org.gradle.configuration-cache=true`,
            visual(el) {
              const TASKS = [['compileDebugKotlin', 'kt'], ['mergeDebugResources', 'res']];
              let branch = 'main', busy = false;
              const cache = new Set(), ws = {};
              const keyOf = k => k === 'kt' ? `kt@${branch}` : 'res@shared';
              const rows = TASKS.map(([n, k]) => { const st = h('span', { class: 'bd-st' }, 'waiting'); return { k, st, row: h('div', { class: 'bd-task' }, h('span', {}, ':app:' + n), st) }; });
              const chips = h('div', { class: 'bd-repos' });
              const br = h('span', { class: 'bd-count' });
              const o = out('Build on main, switch branch, build, switch back and build again.');
              const cc = toggle('bd-g2-cache', 'org.gradle.caching=true', function () {
                if (busy) { this.checked = !this.checked; return; }
                say(o, this.checked ? 'Build cache on. Executed tasks store their outputs.' : 'Build cache off.');
              });
              const paint = () => {
                br.textContent = `branch: ${branch}`;
                chips.replaceChildren(...(cache.size ? [...cache].map(c => h('span', { class: 'bd-repo bd-yes' }, c)) : [h('span', { class: 'bd-repo' }, 'cache empty')]));
              };
              async function run() {
                if (busy) return; busy = true;
                rows.forEach(r => { r.st.textContent = 'waiting'; r.st.className = 'bd-st'; });
                say(o, '<span class="muted">$ ./gradlew assembleDebug</span>');
                const n = { ex: 0, fc: 0, utd: 0 };
                for (const r of rows) {
                  const key = keyOf(r.k);
                  r.row.classList.add('bd-now'); r.st.textContent = 'checking'; r.st.className = 'bd-st bd-busy';
                  await sleep(420); if (!el.isConnected) return;
                  r.row.classList.remove('bd-now');
                  let res;
                  if (ws[r.k] === key) res = 'utd';
                  else if (cc.input.checked && cache.has(key)) res = 'fc';
                  else { res = 'ex'; if (cc.input.checked) cache.add(key); }
                  ws[r.k] = key; n[res]++;
                  r.st.textContent = { utd: 'UP-TO-DATE', fc: 'FROM-CACHE', ex: 'EXECUTED' }[res];
                  r.st.className = 'bd-st ' + { utd: 'bd-utd', fc: 'bd-fc', ex: 'bd-ex' }[res];
                  paint();
                }
                say(o, `<span class="good">BUILD SUCCESSFUL</span> · ${n.ex} executed, ${n.fc} from cache, ${n.utd} up-to-date`);
                busy = false;
              }
              const sw = act('git switch feature', function () {
                if (busy) return;
                branch = branch === 'main' ? 'feature' : 'main';
                this.textContent = `git switch ${branch === 'main' ? 'feature' : 'main'}`;
                paint(); replay(br, 'bd-flash');
                say(o, `On ${branch}. Kotlin sources differ between branches. Resources are the same.`);
              });
              cc.input.checked = true;
              paint();
              el.append(
                h('div', { class: 'controls' }, br, cc.el),
                h('div', { class: 'bd-tasks' }, rows.map(r => r.row)),
                h('div', { class: 'bd-card' }, lbl('Build cache entries'), chips),
                h('div', { class: 'controls' },
                  cmd('./gradlew assembleDebug', run),
                  sw,
                  cmd('./gradlew clean', () => { if (busy) return; for (const k in ws) delete ws[k]; say(o, 'build/ deleted. The cache lives elsewhere, in ~/.gradle/caches.'); })),
                o);
            },
          },
          {
            title: 'Wire values lazily with providers',
            body: `<p>A custom task should declare its inputs and outputs as properties. Then Gradle can fingerprint them, and the task gets the up-to-date check and the cache for free.</p>
<p>Connect values with providers instead of reading them during configuration. <code>providers.exec</code> describes a command. It runs only when a task that needs the value runs, and the configuration cache knows to track it.</p>`,
            code: `abstract class WriteVersion : DefaultTask() {
    @get:Input abstract val gitSha: Property<String>
    @get:OutputFile abstract val outputFile: RegularFileProperty

    @TaskAction
    fun write() {
        outputFile.get().asFile.writeText("const val GIT_SHA = \\"\${gitSha.get()}\\"\\n")
    }
}

val gitSha = providers.exec { commandLine("git", "rev-parse", "--short", "HEAD") }
    .standardOutput.asText.map { it.trim() }

tasks.register<WriteVersion>("writeVersion") {
    this.gitSha = gitSha                                    // wired, not computed
    outputFile = layout.buildDirectory.file("generated/Version.kt")
}`,
          },
        ],
        underHood: {
          body: `<p><code>./gradlew</code> is a small script that starts the wrapper jar. The jar downloads the Gradle version named in <code>gradle/wrapper/gradle-wrapper.properties</code> once, into <code>~/.gradle/wrapper/dists</code>. Then it hands the build to a Gradle Daemon: a long-lived JVM that stays warm between builds. That is why the second build of the day is faster than the first.</p>
<p>Your <code>.kts</code> scripts compile to JVM classes, cached under <code>~/.gradle/caches</code>, and recompile only when they change. For each task, Gradle saves the input and output fingerprints in the project’s <code>.gradle</code> folder. UP-TO-DATE means the new fingerprint matches the saved one. The configuration cache stores the configured task graph in <code>.gradle/configuration-cache</code>. Kotlin compilation runs in its own Kotlin daemon.</p>`,
          code: `$ ./gradlew assembleDebug --info
> Task :app:compileDebugKotlin UP-TO-DATE
Skipping task ':app:compileDebugKotlin' as it is up-to-date.

$ ./gradlew --status   # running daemons
$ ./gradlew --stop     # stop them`,
        },
        mistakes: [
          {
            title: 'Running a process during configuration',
            bad: `// app/build.gradle.kts, top level
val sha = ProcessBuilder("git", "rev-parse", "--short", "HEAD")
    .start().inputStream.reader().readText().trim()
android.defaultConfig.buildConfigField("String", "SHA", "\\"$sha\\"")`,
            good: `val sha = providers.exec { commandLine("git", "rev-parse", "--short", "HEAD") }
    .standardOutput.asText.map { it.trim() }
androidComponents.onVariants { variant ->
    variant.buildConfigFields?.put("SHA", sha.map { BuildConfigField("String", "\\"$it\\"", null) })
}`,
            why: 'Top-level code runs on every build, even <code>./gradlew help</code>. The configuration cache also can’t see the process, so it can reuse a stale value. <code>providers.exec</code> is tracked and lazy.',
          },
          {
            title: 'Using project inside a task action',
            bad: `tasks.register("copyApks") {
    doLast {
        project.copy {
            from(project.layout.buildDirectory.dir("outputs/apk"))
            into("dist")
        }
    }
}`,
            good: `tasks.register<Copy>("copyApks") {
    from(layout.buildDirectory.dir("outputs/apk"))
    into(layout.projectDirectory.dir("dist"))
}`,
            why: 'With the configuration cache on, touching <code>Task.project</code> at execution time is reported as a problem and fails the build. A typed <code>Copy</code> task also declares inputs and outputs, so it can be up to date.',
          },
        ],
        visual(el) {
          const T = ['preBuild', 'mergeDebugResources', 'processDebugResources', 'compileDebugKotlin', 'dexBuilderDebug', 'mergeDexDebug', 'packageDebug', 'assembleDebug'];
          const tasks = ran => T.map(t => `&gt; Task :app:${t}${t === 'preBuild' || !ran.includes(t) ? ' <span class="muted">UP-TO-DATE</span>' : ''}`).join('\n');
          const ph = (a, b, c) => [['1 Initialization', 'read settings.gradle.kts', a], ['2 Configuration', 'run every build.gradle.kts', b], ['3 Execution', 'run the tasks that are needed', c]]
            .map(([n, d, s]) => `<p><b>${n}</b><br><span class="${s === 'ran' ? 'good' : 'muted'}">${s}</span> <span class="muted">· ${d}</span></p>`).join('');
          Lab.ui.terminal(el, {
            panelTitle: 'Build phases',
            predict: {
              q: 'You change one line in <code>MainActivity.kt</code> and run the same build again. Which tasks do real work?',
              options: ['All of them, from scratch', '<code>compileDebugKotlin</code> and the tasks that use its output', 'Only <code>packageDebug</code>'],
              a: 1,
              why: 'Gradle compares each task’s inputs and outputs with the last run. Resource tasks see the same files and stay UP-TO-DATE.',
            },
            frames: [
              { panel: ph('waiting', 'waiting', 'waiting'), say: 'One app module, with <code>org.gradle.configuration-cache=true</code> in <code>gradle.properties</code>. Run the debug build.' },
              { cmd: './gradlew assembleDebug --console=plain', out: tasks(T) + '\n\nBUILD SUCCESSFUL in 41s\n38 actionable tasks: 38 executed\nConfiguration cache entry stored.', panel: ph('ran', 'ran', 'ran'), say: 'The first build runs all three phases. The task list is shortened here. Gradle stores the task graph in the configuration cache.' },
              { cmd: './gradlew assembleDebug --console=plain', out: 'Reusing configuration cache.\n' + tasks([]) + '\n\nBUILD SUCCESSFUL in 2s\n38 actionable tasks: 38 up-to-date\nConfiguration cache entry reused.', panel: ph('skipped', 'skipped', 'ran'), say: 'Nothing changed. The scripts don’t run at all, and every task finds the same inputs and outputs, so it is UP-TO-DATE.' },
              { cmd: './gradlew assembleDebug --console=plain', out: 'Reusing configuration cache.\n' + tasks(['compileDebugKotlin', 'dexBuilderDebug', 'mergeDexDebug', 'packageDebug', 'assembleDebug']) + '\n\nBUILD SUCCESSFUL in 9s\n38 actionable tasks: 4 executed, 34 up-to-date\nConfiguration cache entry reused.', say: 'You changed one line in <code>MainActivity.kt</code>. Only the Kotlin compile and the tasks downstream of it run again.' },
              { cmd: './gradlew assembleDebug --console=plain', out: 'Calculating task graph as configuration cache cannot be reused because file \'app/build.gradle.kts\' has changed.\n' + tasks([]) + '\n\nBUILD SUCCESSFUL in 6s\n38 actionable tasks: 38 up-to-date\nConfiguration cache entry stored.', panel: ph('ran', 'ran', 'ran'), say: 'You added a comment to <code>app/build.gradle.kts</code>. A script changed, so configuration runs again. No task input changed, so execution still skips everything.' },
            ],
          });
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'catalogs',
        title: 'Version catalogs',
        tagline: 'One TOML file for every library and plugin version.',
        level: 'beginner',
        body: `
<p>A version catalog keeps every dependency and plugin version in one file, <code>gradle/libs.versions.toml</code>. Gradle reads it automatically and generates type-safe accessors. The entry <code>androidx-room-runtime</code> becomes <code>libs.androidx.room.runtime</code>: dashes turn into dots.</p>
<p>The file has four sections. <code>[versions]</code> holds numbers you point to with <code>version.ref</code>. <code>[libraries]</code> maps names to Maven coordinates. <code>[bundles]</code> groups libraries you always add together. <code>[plugins]</code> declares plugins you apply with <code>alias(...)</code>.</p>
<p>A typo in a string coordinate only shows up when Gradle has searched every repository and failed. A typo in an accessor is a compile error in the build script, and the IDE autocompletes the right name before you get there. Upgrading a library becomes a one-line change for every module.</p>`,
        code: `# gradle/libs.versions.toml
[versions]
agp = "9.0.0"
kotlin = "2.3.0"
room = "2.7.2"

[libraries]
androidx-room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }
androidx-room-ktx = { module = "androidx.room:room-ktx", version.ref = "room" }

[bundles]
room = ["androidx-room-runtime", "androidx-room-ktx"]

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }

// build.gradle.kts (root): pin plugin versions once, apply nowhere
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.compose) apply false
}

// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}
dependencies {
    implementation(libs.bundles.room)   // room-runtime + room-ktx
}`,
        remember: 'Versions live in libs.versions.toml. Dashes become dots: androidx-room-runtime is libs.androidx.room.runtime.',
        terms: [
          { term: 'Version catalog', def: 'A TOML file, usually gradle/libs.versions.toml, that declares library and plugin coordinates and versions and generates type-safe libs accessors.' },
          { term: 'version.ref', def: 'A catalog key that points a library or plugin at a shared entry in the [versions] section.' },
          { term: 'Catalog bundle', def: 'A named group of catalog libraries that you add with one line, such as implementation(libs.bundles.room).' },
          { term: 'Plugin alias', def: 'A catalog entry under [plugins] that you apply with alias(libs.plugins.name) instead of id plus a version string.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Apply the plugin and add the Room bundle through the catalog.', code: 'plugins {\n    [[alias]](libs.plugins.android.application)\n}\ndependencies {\n    implementation(libs.[[bundles]].room)\n}', why: 'Catalog plugins are applied with <code>alias</code>. Bundles live under <code>libs.bundles</code>.' },
          { type: 'bug', prompt: 'Gradle tries to download <code>room-ktx</code> with the version <code>room</code>. Tap the wrong line.', code: '[versions]\nroom = "2.7.2"\n\n[libraries]\nandroidx-room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }\nandroidx-room-ktx = { module = "androidx.room:room-ktx", version = "room" }', bug: 5, fix: 'androidx-room-ktx = { module = "androidx.room:room-ktx", version.ref = "room" }', why: '<code>version</code> takes a literal version string. To point at the <code>[versions]</code> entry you need <code>version.ref</code>.' },
        ],
        quiz: [
          { q: 'Which accessor does the entry <code>androidx-lifecycle-runtime-ktx</code> generate?', options: ['<code>libs.androidx_lifecycle_runtime_ktx</code>', '<code>libs.androidx.lifecycle.runtime.ktx</code>', '<code>libs["androidx-lifecycle-runtime-ktx"]</code>'], a: 1, why: 'Dashes, underscores and dots in alias names all become dot-separated accessor segments.' },
          { q: 'You misspell an accessor: <code>libs.androidx.room.runtme</code>. When do you find out?', options: ['When the build script compiles, or earlier in the IDE', 'Only after Gradle searches every repository', 'At runtime on the device'], a: 0, why: 'Accessors are generated Kotlin code. A name that does not exist is an unresolved reference in the build script.' },
          { q: 'Why declare plugins in the root build file with <code>apply false</code>?', options: ['To disable them', 'To load each plugin version once, so every module uses the same one', 'It is required by the catalog format'], a: 1, why: 'The root build puts the plugin on the classpath with one version. Modules then apply it without repeating a version.' },
          { q: 'The catalog says <code>coroutines = "1.8.1"</code>. You add an SDK that was built against coroutines 1.10.2. Which version does the app run?', options: ['1.8.1, because the catalog wins', '1.10.2, because conflict resolution picks the highest requested version', 'Neither: the build fails with a version conflict'], a: 1, why: 'A catalog version is a request, not a lock. Gradle picks the highest version in the graph, and <code>./gradlew :app:dependencies</code> shows it as <code>1.8.1 -> 1.10.2</code>.' },
          { q: 'You add the Compose BOM to the catalog. How should <code>androidx-compose-material3</code> be declared?', options: ['With <code>version.ref = "composeBom"</code>', 'With its own version number, to be safe', 'With no version, and the BOM added with <code>platform(libs.androidx.compose.bom)</code>'], a: 2, why: 'The BOM lists one tested version for every member. Members without a version take it from the BOM, so upgrading the whole family is one line.' },
        ],
        deeper: [
          {
            title: 'The catalog asks, conflict resolution decides',
            body: `<p>A catalog version is a request, not a lock. When two parts of the dependency graph ask for different versions of one library, Gradle picks the highest. Add an SDK that was built against a newer coroutines release, and your app runs that newer release, whatever <code>libs.versions.toml</code> says.</p>
<p>Run <code>./gradlew :app:dependencies</code> to see it. An arrow like <code>1.8.1 -> 1.10.2</code> means a version was raised. A <code>strictly</code> version turns your request into a rule and wins, even by downgrading. That can break the SDK that needed the newer one, so use it rarely.</p>`,
            code: `# gradle/libs.versions.toml
[versions]
coroutines = "1.8.1"                     # a request: other requests can raise it
# coroutines = { strictly = "1.8.1" }    # a rule: wins, even by downgrading

# see what was actually picked
$ ./gradlew :app:dependencies --configuration releaseRuntimeClasspath`,
            visual(el) {
              const C = 'org.jetbrains.kotlinx:kotlinx-coroutines-core';
              let sdk = false, strict = false, busy = false;
              const toml = h('div', { class: 'bd-line' });
              const tree = h('div', { class: 'bd-d2-tree', 'aria-live': 'polite' }, h('div', { class: 'bd-d2-cmd' }, '# not run yet'));
              const o = out('Run the task. Then add the SDK and run it again.');
              const paint = () => { toml.innerHTML = hl(strict ? 'coroutines = { strictly = "1.8.1" }' : 'coroutines = "1.8.1"'); };
              const sdkSw = toggle('bd-d2-cat-sdk', 'add com.acme:analytics:5.2.0', function () {
                if (busy) { this.checked = !this.checked; return; }
                sdk = this.checked; tree.replaceChildren(h('div', { class: 'bd-d2-cmd' }, '# graph changed, run again'));
                say(o, sdk ? 'Added an SDK that was built against coroutines 1.10.2.' : 'SDK removed.');
              });
              const strictSw = toggle('bd-d2-cat-strict', 'make it strictly', function () {
                if (busy) { this.checked = !this.checked; return; }
                strict = this.checked; paint(); replay(toml, 'bd-flash');
                tree.replaceChildren(h('div', { class: 'bd-d2-cmd' }, '# catalog changed, run again'));
                say(o, strict ? 'The catalog version is now a rule.' : 'Back to a plain request.');
              });
              async function run() {
                if (busy) return; busy = true;
                tree.replaceChildren();
                const ask = strict ? '{strictly 1.8.1}' : '1.8.1';
                const won = sdk && !strict ? '1.10.2' : '1.8.1';
                const lines = [['$ ./gradlew :app:dependencies', 'bd-d2-cmd'], ['releaseRuntimeClasspath', '']];
                lines.push([`${sdk ? '+---' : '\\---'} ${C}:${ask}${strict || won !== '1.8.1' ? ' -> ' + won : ''}`, won !== '1.8.1' ? 'bd-d2-up' : strict ? 'bd-d2-pin' : '']);
                if (sdk) {
                  lines.push(['\\--- com.acme:analytics:5.2.0', '']);
                  lines.push([`     \\--- ${C}:1.10.2${strict ? ' -> 1.8.1' : ' (*)'}`, strict ? 'bd-d2-down' : '']);
                }
                for (const [t, c] of lines) {
                  tree.append(h('div', { class: `drop-in ${c}` }, t));
                  await sleep(220); if (!el.isConnected) return;
                }
                if (sdk && strict) say(o, '<span class="bad">runs 1.8.1.</span> analytics was compiled against 1.10.2 and can fail with NoSuchMethodError when it calls a newer function.');
                else if (sdk) say(o, '<span class="good">runs 1.10.2.</span> The catalog asked for 1.8.1. The highest request in the graph won.');
                else say(o, '<span class="good">runs 1.8.1.</span> Nobody asked for anything else.');
                busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'bd-card' }, lbl('libs.versions.toml'), toml),
                h('div', { class: 'controls' }, sdkSw.el, strictSw.el),
                tree,
                h('div', { class: 'controls' }, cmd('./gradlew :app:dependencies', run)),
                o);
            },
          },
          {
            title: 'Libraries with no version: BOMs',
            body: `<p>Some libraries come as a family whose members must match, like Compose or Firebase. Their publishers ship a BOM, a bill of materials that lists one tested version for every member. Put the BOM in the catalog with a version, and list the members with no version at all.</p>
<p>Add the BOM with <code>platform()</code>. It takes part in conflict resolution like any other dependency, so every member lines up on its versions. Upgrading the whole family is one line. Add the BOM to each configuration that uses members, such as <code>androidTestImplementation</code> too.</p>`,
            code: `# gradle/libs.versions.toml
[versions]
composeBom = "2025.06.00"

[libraries]
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }                  # no version
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }

// app/build.gradle.kts
dependencies {
    val composeBom = platform(libs.androidx.compose.bom)
    implementation(composeBom)
    androidTestImplementation(composeBom)
    implementation(libs.androidx.compose.ui)            // version comes from the BOM
    implementation(libs.androidx.compose.material3)
}`,
          },
        ],
        underHood: {
          body: `<p>The catalog is read while Gradle sets up the build, before any build script runs. From it, Gradle generates a class named <code>LibrariesForLibs</code>, compiles it and puts it on the classpath of every build script. That is why <code>libs.androidx.room.runtime</code> autocompletes, and why a wrong name fails script compilation.</p>
<p>An accessor does not hold a version string. It returns a <code>Provider</code> of a dependency that Gradle reads when it needs it. Plugin entries come back as <code>Provider&lt;PluginDependency&gt;</code>, which <code>alias()</code> turns into a plugin request with an id and a version.</p>`,
          code: `// The types behind the accessors
val room: Provider<MinimalExternalModuleDependency> = libs.androidx.room.runtime
val roomBundle: Provider<ExternalModuleDependencyBundle> = libs.bundles.room
val agp: Provider<PluginDependency> = libs.plugins.android.application

println(room.get().module)                                // androidx.room:room-runtime
println(room.get().versionConstraint.requiredVersion)     // 2.7.2`,
        },
        mistakes: [
          {
            title: 'Typing one version by hand next to the catalog',
            bad: `dependencies {
    implementation(libs.androidx.room.runtime)     // 2.7.2 from the catalog
    ksp("androidx.room:room-compiler:2.6.1")       // typed by hand
}`,
            good: `# libs.versions.toml
androidx-room-compiler = { module = "androidx.room:room-compiler", version.ref = "room" }

dependencies {
    implementation(libs.androidx.room.runtime)
    ksp(libs.androidx.room.compiler)
}`,
            why: '<code>ksp</code> is a separate configuration, so conflict resolution never lines it up with the runtime. The code Room generates and the library it calls drift apart. Give every artifact of a family the same <code>version.ref</code>.',
          },
          {
            title: 'Forgetting apply false in the root build',
            bad: `// build.gradle.kts (root)
plugins {
    alias(libs.plugins.android.application)
}`,
            good: `// build.gradle.kts (root)
plugins {
    alias(libs.plugins.android.application) apply false
}`,
            why: 'Without <code>apply false</code> the root project applies the Android plugin itself. The root has no Android setup, so the build fails. The root should only load the plugin and pin its version.',
          },
        ],
        visual(el) {
          const file = (name, code) => `<p class="muted">${name}</p><pre class="ui-out">${code}</pre>`;
          const toml = 'gradle/libs.versions.toml';
          const tomlSrc = '[versions]\nroom = "2.7.2"\n\n[libraries]\nandroidx-room-runtime = {\n  module = "androidx.room:room-runtime",\n  version.ref = "room" }';
          Lab.ui.terminal(el, {
            panelTitle: 'The file you edited',
            predict: {
              q: 'A plain string coordinate has a typo: <code>"androidx.room:room-runtme:2.7.2"</code>. When does Gradle tell you?',
              options: ['As you type, in the IDE', 'Only when it resolves dependencies and has searched every repository', 'Never: it falls back to the closest name'],
              a: 1,
              why: 'A string is just text to Gradle. It learns the module does not exist only when no repository has it.',
            },
            frames: [
              { panel: file('app/build.gradle.kts', 'implementation(\n  "androidx.room:room-runtme:2.7.2")'), say: 'First, a dependency written as a string, with a typo: <code>runtme</code>.' },
              { cmd: './gradlew assembleDebug', out: '&gt; Task :app:checkDebugAarMetadata <span class="bad">FAILED</span>\n\nFAILURE: Build failed with an exception.\n\n* What went wrong:\nExecution failed for task \':app:checkDebugAarMetadata\'.\n&gt; Could not resolve all files for configuration \':app:debugRuntimeClasspath\'.\n   &gt; Could not find androidx.room:room-runtme:2.7.2.\n     Searched in the following locations:\n       - https://dl.google.com/dl/android/maven2/androidx/room/room-runtme/2.7.2/room-runtme-2.7.2.pom\n       - https://repo.maven.apache.org/maven2/androidx/room/room-runtme/2.7.2/room-runtme-2.7.2.pom\n\nBUILD FAILED in 18s', say: 'Configuration passes, tasks start, and only resolving the classpath fails, after Gradle has asked every repository.' },
              { clear: true, panel: file(toml, tomlSrc), say: 'Now the catalog. Gradle reads this file and generates Kotlin accessors: <code>androidx-room-runtime</code> becomes <code>libs.androidx.room.runtime</code>.' },
              { panel: file('app/build.gradle.kts', 'implementation(\n  libs.androidx.room.runtme)'), cmd: './gradlew assembleDebug', out: 'FAILURE: Build failed with an exception.\n\n* Where:\nBuild file \'app/build.gradle.kts\' line: 12\n\n* What went wrong:\nScript compilation error:\n  Unresolved reference <span class="bad">\'runtme\'</span>.\n\nBUILD FAILED in 3s', say: 'The same typo in an accessor is a compile error in the build script. No task runs, nothing downloads, and the IDE underlines it before you build.' },
              { panel: file('app/build.gradle.kts', 'implementation(\n  libs.androidx.room.runtime)'), cmd: './gradlew assembleDebug', out: 'BUILD SUCCESSFUL in 24s\n41 actionable tasks: 41 executed', say: 'Fixed with autocomplete. Every module that uses the accessor gets the same coordinates.' },
              { cmd: 'grep -n room gradle/libs.versions.toml', out: '2:room = "2.7.2"\n5:androidx-room-runtime = {\n6:  module = "androidx.room:room-runtime",\n7:  version.ref = "room" }', panel: file(toml, tomlSrc), say: 'To upgrade, change line 2. Every module that uses <code>libs.androidx.room.*</code> moves together.' },
            ],
          });
        },
      },

      // 2b ────────────────────────────────────────────
      {
        id: 'api-levels',
        title: 'API levels and compatibility',
        tagline: 'compileSdk, minSdk and targetSdk answer three different questions.',
        level: 'intermediate',
        body: `
<p>Every Android release has one API level, a plain integer: Android 15 is 35, Android 16 is 36. Your module sets three of them, and each one answers a different question. <code>compileSdk</code>: which Android APIs can my code see when it compiles? <code>minSdk</code>: which is the oldest Android that may install the app? <code>targetSdk</code>: which Android behavior have I tested against?</p>
<p><code>minSdk</code> is a promise you have to keep in code. With <code>minSdk = 24</code>, a call to an API added in 26 compiles fine and then crashes on an Android 7 phone. Lint’s <code>NewApi</code> check catches it. Guard the call with <code>Build.VERSION.SDK_INT</code>, or use an AndroidX <code>*Compat</code> class that does the check for you.</p>
<p><code>targetSdk</code> is how new platform behavior reaches your app. On a phone newer than your target, Android runs the app in a compatibility mode that acts like the older version. Raise the target and you opt in to every behavior change up to that level. Google Play forces the bump every year: since August 31, 2026, new apps and updates must target API 36.</p>`,
        code: `// app/build.gradle.kts
android {
    compileSdk = 36              // the APIs your code can see
    defaultConfig {
        minSdk = 24              // oldest Android that can install the app
        targetSdk = 36           // the behavior you tested against
    }
}

// Call a newer API only where it exists
fun createChannels(context: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {          // API 26
        val channel = NotificationChannel("breaking-news", "Breaking news", NotificationManager.IMPORTANCE_HIGH)
        context.getSystemService<NotificationManager>()?.createNotificationChannel(channel)
    }
}

// Or mark the whole function and let callers do the check
@RequiresApi(Build.VERSION_CODES.TIRAMISU)                         // API 33
fun askForNotifications(launcher: ActivityResultLauncher<String>) {
    launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
}`,
        remember: 'compileSdk lets you see APIs, minSdk decides who can install, targetSdk decides how Android treats you. Guard every call above minSdk.',
        terms: [
          { term: 'compileSdk', def: 'The Android SDK your code compiles against. It decides which platform classes and constants exist at compile time. It is not stored in the APK.' },
          { term: 'minSdk', def: 'The lowest API level that may install the app. Devices below it get INSTALL_FAILED_OLDER_SDK and Play does not offer the app to them.' },
          { term: 'targetSdk', def: 'The API level you tested against. Behavior changes gated on a target level apply only when targetSdk is that level or higher.' },
          { term: 'Core library desugaring', def: 'A build step where D8/R8 rewrites calls to newer Java library APIs, such as java.time, to a copy bundled in your app, so they work below the API level that added them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'NotificationChannel arrived in API 26 (Android 8.0). Guard the call.', code: 'if (Build.VERSION.[[SDK_INT]] >= Build.VERSION_CODES.[[O]]) {\n    notificationManager.createNotificationChannel(channel)\n}', why: '<code>SDK_INT</code> is the API level of the phone the code is running on. <code>VERSION_CODES.O</code> is 26, Android 8.0.' },
          { type: 'bug', prompt: 'On Android 13 phones the permission prompt never appears. Tap the wrong line.', code: 'fun askIfNeeded() {\n    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.TIRAMISU) {\n        launcher.launch(Manifest.permission.POST_NOTIFICATIONS)\n    }\n}', bug: 1, fix: '    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {', why: '<code>TIRAMISU</code> is 33, the level that added the permission. <code>&gt;</code> skips exactly Android 13. Version checks almost always use <code>&gt;=</code>.' },
        ],
        quiz: [
          { q: 'You raise <code>compileSdk</code> from 35 to 36 and change nothing else. What changes for users?', options: ['Android 16 behavior changes now apply to the app', 'Nothing at runtime: you can now call Android 16 APIs and see new lint warnings', 'Android 15 phones can no longer install the app'], a: 1, why: '<code>compileSdk</code> only decides what your code can see while compiling. Runtime behavior follows <code>targetSdk</code>, and who can install follows <code>minSdk</code>.' },
          { q: 'Your app targets API 35 and runs on an Android 16 phone. Which Android 16 changes apply?', options: ['All of them', 'Only the changes for all apps. The target-gated ones stay off until you target 36', 'None, the app runs as Android 15'], a: 1, why: 'Some changes apply to every app on the new version. Changes gated on targetSdk stay off while your target is lower, so the app runs in a compatibility mode for those.' },
          { q: 'Since August 31, 2026, what must a new app update on Google Play target (phone app)?', options: ['API 34 or higher', 'API 35 or higher', 'API 36 or higher'], a: 2, why: 'New apps and updates must target Android 16 (API 36). Wear OS and Automotive need 35, TV and XR need 34. An extension until November 1, 2026 could be requested.' },
          { q: '<pre>// minSdk = 24\nval v = Build.VERSION.RELEASE\nif (v.toInt() >= 8) {\n  createChannel()\n}</pre>Which line is the bug?', options: ['<code>val v = Build.VERSION.RELEASE</code>', '<code>if (v.toInt() >= 8) {</code>', '<code>createChannel()</code>'], a: 1, why: '<code>RELEASE</code> is a display string such as "8.1.0", so <code>toInt()</code> throws. Check <code>Build.VERSION.SDK_INT >= 26</code>, or use <code>NotificationManagerCompat</code>.' },
          { q: 'You mark a function <code>@RequiresApi(26)</code>. A caller calls it with no version check, and the app runs on an Android 7 phone (API 24). What happens?', options: ['The annotation skips the call on older phones', 'The function throws a clear "API too low" exception', 'Lint flags the caller, but nothing checks at runtime: the call reaches the missing API and crashes'], a: 2, why: '<code>@RequiresApi</code> only moves the lint duty to the caller. It adds no runtime check, so an unguarded call still fails on old phones.' },
          { q: 'With <code>minSdk = 24</code>, you want <code>java.time.LocalDate</code> and <code>NotificationChannel</code>. What does core library desugaring give you?', options: ['Both work on every device with no checks', '<code>LocalDate</code> works everywhere; <code>NotificationChannel</code> still needs a version check or a Compat class', 'Neither, you must raise minSdk to 26'], a: 1, why: 'Desugaring bundles a copy of parts of the Java library, such as java.time. It cannot add Android platform APIs like notification channels.' },
        ],
        deeper: [
          {
            title: 'Version checks, @RequiresApi and Compat classes',
            body: `<p>Lint knows the API level of every platform method. When a call needs more than your <code>minSdk</code>, it reports <code>NewApi</code> unless the call sits inside an <code>SDK_INT</code> check or inside a function marked <code>@RequiresApi</code>. The annotation does not check anything at runtime. It moves the duty to the caller, so lint now asks every caller for a check.</p>
<p>Before writing the check yourself, look for a Compat class. <code>ContextCompat</code>, <code>NotificationManagerCompat</code> and <code>WindowCompat</code> contain the version checks already. Never parse <code>Build.VERSION.RELEASE</code>: it is a display string like <code>"8.1.0"</code>, not a number.</p>`,
            code: `// Lint: Call requires API level 26 (current min is 24)
nm.createNotificationChannel(channel)

// Fixed by the library: no check needed in your code
NotificationManagerCompat.from(context).createNotificationChannel(
    NotificationChannelCompat.Builder("breaking-news", NotificationManagerCompat.IMPORTANCE_HIGH)
        .setName("Breaking news")
        .build()
)  // does nothing below API 26, where channels do not exist`,
          },
          {
            title: 'Core library desugaring',
            body: `<p><code>java.time.LocalDate</code> arrived in Android in API 26. With <code>minSdk = 24</code>, you can still use it by turning on core library desugaring. D8 (or R8) rewrites your calls to point at a copy of the library that ships inside your app. The rewrite depends on <code>minSdk</code>, not on the phone, so every device runs the bundled copy.</p>
<p>It covers a subset of <code>java.time</code>, <code>java.util.stream</code>, <code>java.util.function</code> and <code>Optional</code>. It adds a little to the app size. It does nothing for Android APIs such as <code>NotificationChannel</code>: those still need a version check.</p>`,
            code: `android {
    compileOptions {
        isCoreLibraryDesugaringEnabled = true
    }
}
dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.3")  // needs AGP 7.4+
}`,
            visual(el) {
              let sugar = false, busy = false;
              const o = out('minSdk is 24. Pick a phone and run the code.');
              const dex = h('div', { class: 'bd-line', html: hl('val due = LocalDate.now().plusDays(3)') });
              const sw = toggle('bd-al-sugar', 'isCoreLibraryDesugaringEnabled', function () {
                if (busy) { this.checked = !this.checked; return; }
                sugar = this.checked;
                dex.innerHTML = hl(sugar ? 'invoke-static j$.time.LocalDate.now()   // bundled copy' : 'invoke-static java.time.LocalDate.now()   // platform class');
                replay(dex, 'bd-flash');
                say(o, sugar ? 'D8 rewrote the call. The dex now points at j$.time, which ships inside the app.' : 'No desugaring. The dex calls the platform class directly.');
              });
              const run = api => async () => {
                if (busy) return; busy = true;
                say(o, `<span class="muted">Running on API ${api}...</span>`);
                await sleep(450); if (!el.isConnected) return;
                if (sugar) say(o, `<span class="good">API ${api}: due date computed.</span> The bundled copy runs on ${api < 26 ? 'this old phone' : 'this phone too, even though it has java.time'}.`);
                else if (api < 26) say(o, '<span class="bad">API 24: crash.</span> java.time.LocalDate does not exist before API 26. Lint warned: NewApi.');
                else say(o, `<span class="good">API ${api}: works.</span> The platform has java.time. Older phones would still crash.`);
                busy = false;
              };
              el.append(
                h('div', { class: 'controls' }, sw.el),
                h('div', { class: 'bd-card' }, lbl('What the dex calls'), dex),
                h('div', { class: 'controls' }, act('Run on Android 7.0 (API 24)', run(24)), act('Run on Android 16 (API 36)', run(36))),
                o);
            },
          },
          {
            title: 'Raising targetSdk: behavior changes',
            body: `<p>Each Android release publishes two lists: changes for all apps, and changes for apps that target the new level. The second list is what you sign up for when you raise <code>targetSdk</code>. For API 36 it includes: the edge-to-edge opt-out stops working, predictive back animations are on by default and <code>onBackPressed</code> is no longer called, and on screens at least 600dp wide the app ignores orientation and resizability limits.</p>
<p>Treat the bump as a small project. Read the list, run the Android SDK Upgrade Assistant in Android Studio, and test on a phone with the new version. In a debuggable build you can switch single target-gated changes on and off with <code>adb shell am compat</code> or under Developer options, App Compatibility Changes, and fix them one at a time.</p>`,
            code: `# See every compat change and its state for your app
adb shell dumpsys platform_compat

# Try one target-gated change before raising targetSdk (debuggable builds only)
adb shell am compat enable CHANGE_ID com.example.news
adb shell am compat reset  CHANGE_ID com.example.news`,
          },
          {
            title: 'Play’s yearly target API deadline',
            body: `<p>Google Play raises the required <code>targetSdk</code> once a year, about a year after each Android release. Since August 31, 2026, new phone apps and updates must target API 36. Wear OS and Android Automotive OS apps need 35, Android TV and Android XR apps need 34. Developers who needed more time could ask for an extension until November 1, 2026.</p>
<p>Apps you don’t update are also affected. An existing app must target at least API 35 to stay visible to new users on phones running a newer Android than its target. With a lower target, new users on newer phones no longer find it. Plan the bump every year, before the deadline.</p>`,
          },
        ],
        underHood: {
          body: `<p>The build copies <code>minSdk</code> and <code>targetSdk</code> into the merged <code>AndroidManifest.xml</code> as <code>&lt;uses-sdk&gt;</code>. <code>compileSdk</code> is not written there; it only picks which <code>android.jar</code> the compiler reads. The package installer compares <code>minSdkVersion</code> with the phone’s API level and refuses the install if the phone is older.</p>
<p>At runtime, the platform reads your <code>targetSdkVersion</code> from <code>ApplicationInfo</code>. Behavior changes are registered in the compatibility framework with the level that enables them. When your app calls into the system, the framework asks whether that change is enabled for your package. That is why a debuggable build can switch single changes on and off without a rebuild.</p>`,
          code: `$ aapt2 dump badging app-release.apk | grep sdk
sdkVersion:'24'
targetSdkVersion:'36'

$ adb install app-release.apk     # on an API 23 phone
Failure [INSTALL_FAILED_OLDER_SDK: Requires newer sdk version #24 (current version is #23)]`,
        },
        mistakes: [
          {
            title: 'Bumping targetSdk as a one-line change',
            bad: `// "Play says we must target 36"
targetSdk = 36   // changed, built, shipped`,
            good: `targetSdk = 36
// 1. Read the Android 16 behavior changes for apps targeting 36
// 2. Run the Android SDK Upgrade Assistant
// 3. Test edge-to-edge, back navigation and large screens on Android 16`,
            why: 'The target opts the app in to every target-gated change at once. Untested, that means content under the status bar, back handling that no longer runs, or broken tablet layouts.',
          },
          {
            title: 'Parsing the version name',
            bad: `if (Build.VERSION.RELEASE.toInt() >= 13) {
    askForNotifications()
}`,
            good: `if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    askForNotifications()
}`,
            why: '<code>RELEASE</code> is a display string such as <code>"8.1.0"</code>, so <code>toInt()</code> throws. <code>SDK_INT</code> is the integer API level, and lint understands checks against it.',
          },
        ],
        predict: {
          q: "No SDK_INT check, <code>minSdk = 24</code>, and the call needs API 26. You install on an API 24 phone. What happens?",
          options: ["The build fails to compile", "Lint warns, it installs, then it crashes when that line runs", "The install is refused"],
          a: 1,
          why: "<code>compileSdk</code> knows the API, so it compiles. <code>minSdk</code> lets the old phone install it, and the missing class crashes at runtime.",
        },
        visual(el) {
          const DEV = { 24: 'Android 7.0', 31: 'Android 12', 35: 'Android 15', 36: 'Android 16' };
          const s = { compile: 36, min: 24, target: 36, dev: 36, guard: true };
          let busy = false;
          const pick = (label, key, vals, fmt) => {
            const btns = vals.map(v => h('button', { class: 'bd-opt', 'aria-pressed': String(s[key] === v), onclick() {
              if (busy) return;
              s[key] = v; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(vals[i] === v))); reset();
            } }, fmt ? fmt(v) : String(v)));
            return h('div', { class: 'bd-pick' }, lbl(label), btns);
          };
          const src = h('div', { class: 'bd-line' });
          const paintSrc = () => { src.innerHTML = hl(s.guard
            ? '// SDK_INT = Build.VERSION.SDK_INT\nval is16 = SDK_INT >= BAKLAVA   // 36\nif (SDK_INT >= O) {             // 26\n    nm.createNotificationChannel(ch)\n}'
            : '// SDK_INT = Build.VERSION.SDK_INT\nval is16 = SDK_INT >= BAKLAVA   // 36\nnm.createNotificationChannel(ch) // 26'); };
          const GATES = [['compile', 'Compile', 'compileSdk'], ['lint', 'Lint', 'minSdk'], ['install', 'Install', 'minSdk'], ['run', 'Run', 'device'], ['behave', 'Behavior', 'targetSdk'], ['play', 'Play upload', 'targetSdk']];
          const rows = {};
          const gateEls = GATES.map(([k, name, by]) => {
            const st = h('span', { class: 'bd-al-st' }, 'waiting');
            const msg = h('small', {}, '');
            const row = h('div', { class: 'bd-al-gate' }, h('div', { class: 'bd-al-head' }, h('b', {}, name), h('span', { class: 'bd-al-by' }, by), st), msg);
            rows[k] = { row, st, msg };
            return row;
          });
          const o = out('Pick the three numbers and a phone, then build and install.');
          const guard = toggle('bd-al-guard', 'SDK_INT check around the call', function () {
            if (busy) { this.checked = !this.checked; return; }
            s.guard = this.checked; paintSrc(); replay(src, 'bd-flash'); reset();
          });
          guard.input.checked = true;
          function set(k, cls, label, text) {
            const r = rows[k];
            r.row.className = 'bd-al-gate bd-al-' + cls; r.st.textContent = label; r.msg.innerHTML = text;
            replay(r.row, 'bd-flash');
          }
          function reset() {
            for (const k in rows) { rows[k].row.className = 'bd-al-gate'; rows[k].st.textContent = 'waiting'; rows[k].msg.textContent = ''; }
            say(o, 'Settings changed. Build and install again.');
          }
          async function run() {
            if (busy) return; busy = true;
            for (const k in rows) { rows[k].row.className = 'bd-al-gate'; rows[k].st.textContent = 'waiting'; rows[k].msg.textContent = ''; }
            say(o, `<span class="muted">$ ./gradlew installDebug  ·  phone: ${DEV[s.dev]}, API ${s.dev}</span>`);
            const step = async () => { await sleep(380); return el.isConnected; };
            const stop = (msg) => { for (const k in rows) if (rows[k].st.textContent === 'waiting') { rows[k].row.className = 'bd-al-gate bd-al-skip'; rows[k].st.textContent = 'skipped'; } say(o, msg); busy = false; };
            if (!await step()) return;
            if (s.compile < 36) { set('compile', 'bad', 'error', `e: Unresolved reference 'BAKLAVA'. The API ${s.compile} SDK has no Android 16 constants.`); return stop('<span class="bad">BUILD FAILED</span> · raise compileSdk to see newer APIs.'); }
            set('compile', 'ok', 'ok', 'compileSdk 36 knows every API up to Android 16.');
            if (!await step()) return;
            const risky = !s.guard && s.min < 26;
            if (risky) set('lint', 'warn', 'NewApi', `Call requires API level 26 (current min is ${s.min}).`);
            else set('lint', 'ok', 'ok', s.guard ? 'The call sits inside an SDK_INT check.' : `minSdk ${s.min} is already 26 or higher.`);
            if (!await step()) return;
            if (s.dev < s.min) { set('install', 'bad', 'refused', `INSTALL_FAILED_OLDER_SDK: the phone is API ${s.dev}, minSdk is ${s.min}.`); return stop('<span class="bad">Not installed.</span> minSdk decides who can install.'); }
            set('install', 'ok', 'ok', `API ${s.dev} is at least minSdk ${s.min}.`);
            if (!await step()) return;
            if (!s.guard && s.dev < 26) { set('run', 'bad', 'crash', `NotificationChannel does not exist on API ${s.dev}. The app crashes on launch.`); return stop('<span class="bad">Crash on ' + DEV[s.dev] + '.</span> Lint warned you. A version check fixes it.'); }
            set('run', 'ok', 'ok', s.dev < 26 ? 'The check skips the channel code on this old phone.' : 'NotificationChannel exists here.');
            if (!await step()) return;
            const eff = Math.min(s.dev, s.target), notes = [];
            if (s.dev > s.target) notes.push(`compatibility mode: target-gated changes after API ${s.target} stay off`);
            if (eff >= 35) notes.push('edge-to-edge enforced');
            if (eff >= 36) notes.push('opt-out ignored, predictive back animations on');
            if (eff < 35) notes.push('no edge-to-edge enforcement');
            set('behave', s.dev > s.target ? 'warn' : 'ok', 'API ' + eff + ' rules', notes.join('; ') + '.');
            if (!await step()) return;
            if (s.target >= 36) set('play', 'ok', 'accepted', 'Meets the API 36 requirement for new apps and updates.');
            else set('play', 'bad', 'rejected', `Since Aug 31, 2026 updates must target 36.${s.target < 35 ? ' The existing listing is also hidden from new users on newer phones.' : ''}`);
            say(o, s.target >= 36 && !risky ? '<span class="good">Installed, running and shippable.</span>' : '<span class="good">Installed and running.</span> Check the warnings above.');
            busy = false;
          }
          paintSrc();
          el.append(
            h('div', { class: 'bd-picks' },
              pick('compile', 'compile', [35, 36]),
              pick('min', 'min', [24, 26]),
              pick('target', 'target', [34, 35, 36]),
              pick('phone', 'dev', [24, 31, 35, 36], v => 'API ' + v)),
            h('div', { class: 'controls' }, guard.el),
            src,
            h('div', { class: 'bd-al-gates' }, gateEls),
            h('div', { class: 'controls' }, cmd('./gradlew installDebug', run)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'variants',
        title: 'Build types and product flavors',
        tagline: 'How you build, times what you build, gives build variants.',
        level: 'intermediate',
        body: `
<p>A build type says <em>how</em> you build. <code>debug</code> is debuggable and signed with the debug key. <code>release</code> is shrunk by R8 and signed for the store. A product flavor says <em>what</em> you build: a free and a paid app, or a staging and a production backend. Every flavor belongs to a flavor dimension.</p>
<p>Gradle crosses them into build variants: each flavor combination times each build type. Two tiers and two build types make four variants, like <code>paidRelease</code>, each with its own tasks such as <code>assemblePaidRelease</code>. A second dimension doubles the count, so add dimensions only when you need them.</p>
<p>Variants differ in values and in files. <code>buildConfigField</code> adds a constant to the generated <code>BuildConfig</code> class, and <code>resValue</code> adds a resource. Recent AGP versions turn both off, so enable them in <code>buildFeatures</code>. For files, add a source set folder named after the variant, build type or flavor. The most specific folder wins over <code>src/main</code>.</p>`,
        code: `android {
    buildFeatures {
        buildConfig = true
        resValues = true
    }
    buildTypes {
        debug {
            applicationIdSuffix = ".debug"   // install next to the store build
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    flavorDimensions += "tier"
    productFlavors {
        create("free") {
            dimension = "tier"
            buildConfigField("Boolean", "SHOW_ADS", "true")
            resValue("string", "app_name", "News")
        }
        create("paid") {
            dimension = "tier"
            applicationIdSuffix = ".pro"
            buildConfigField("Boolean", "SHOW_ADS", "false")
            resValue("string", "app_name", "News Pro")
        }
    }
}
// Variants: freeDebug, freeRelease, paidDebug, paidRelease
// Source sets for paidDebug, most specific first:
//   src/paidDebug > src/debug > src/paid > src/main

// In app code
if (BuildConfig.SHOW_ADS) showBanner()`,
        remember: 'Flavors times build types equals variants. The most specific source set wins.',
        terms: [
          { term: 'Build type', def: 'A Gradle setting group, such as debug or release, that controls how the app is built: debuggability, shrinking and signing.' },
          { term: 'Product flavor', def: 'A version of the app inside a flavor dimension, such as free or paid, with its own ID suffix, values and source files.' },
          { term: 'Build variant', def: 'One combination of product flavors and a build type, such as paidRelease, which Gradle builds with its own set of tasks.' },
          { term: 'buildConfigField', def: 'A Gradle call that adds a typed constant to the generated BuildConfig class for a build type or flavor.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put the paid flavor in the tier dimension and give it its own application ID.', code: 'flavorDimensions += "tier"\nproductFlavors {\n    create("paid") {\n        [[dimension]] = "tier"\n        [[applicationIdSuffix]] = ".pro"\n    }\n}', why: 'Every flavor needs a <code>dimension</code>. <code>applicationIdSuffix</code> makes the paid app a separate install, <code>com.example.news.pro</code>.' },
          { type: 'bug', prompt: 'The build fails in the generated <code>BuildConfig.java</code>. Tap the wrong line.', code: 'android {\n    buildFeatures { buildConfig = true }\n    defaultConfig {\n        buildConfigField("String", "API_URL", "https://api.example.com")\n    }\n}', bug: 3, fix: '        buildConfigField("String", "API_URL", "\\"https://api.example.com\\"")', why: 'The third argument is pasted into Java source as is. A String constant needs its own escaped quotes, or the generated line is not valid Java.' },
        ],
        quiz: [
          { q: 'Flavor dimensions <code>tier</code> (free, paid) and <code>env</code> (staging, prod), plus debug and release. How many variants?', options: ['4', '6', '8'], a: 2, why: '2 tiers x 2 envs x 2 build types = 8, like <code>freeStagingDebug</code>.' },
          { q: 'Both <code>src/main/res/values/strings.xml</code> and <code>src/paid/res/values/strings.xml</code> define <code>title</code>. Which does <code>paidRelease</code> use?', options: ['The one in src/main', 'The one in src/paid', 'The build fails with a duplicate'], a: 1, why: 'Resources merge by priority. A flavor source set overrides <code>main</code>.' },
          { q: 'What is <code>applicationIdSuffix = ".debug"</code> on the debug build type for?', options: ['It makes the build faster', 'It lets the debug app install next to the release app on one phone', 'Play requires it'], a: 1, why: 'A different application ID is a different app to Android, so both can live on the same device.' },
          { q: 'Flavors <code>staging</code> and <code>prod</code> with debug and release. A staging release build makes no sense. What removes its tasks completely?', options: ['Set <code>variant.enable = false</code> for it in <code>androidComponents.beforeVariants</code>', 'Set <code>isMinifyEnabled = false</code> on release', 'Never run <code>assembleStagingRelease</code>'], a: 0, why: 'A variant disabled in beforeVariants is never created, so it gets no tasks, no configuration cost and no IDE entry.' },
          { q: ':app adds a build type <code>benchmark</code>. The library :core:billing has only debug and release. What happens when you build the benchmark variant?', options: ['Gradle quietly uses the library’s release variant', 'Dependency resolution fails until you add <code>matchingFallbacks += listOf("release")</code>', 'AGP creates a benchmark build type in the library for you'], a: 1, why: 'Variants are matched by name across modules. When the library has no matching build type, matchingFallbacks tells AGP which one to try instead.' },
        ],
        deeper: [
          {
            title: 'Switch off variants you never build',
            body: `<p>Every variant adds tasks, configuration time and entries in the IDE. Two dimensions and two build types make eight, and some make no sense, like a release build that talks to the staging backend. Filter them in <code>androidComponents.beforeVariants</code>. A disabled variant gets no tasks at all.</p>
<p>The filter runs before AGP creates the variant objects, so it only sees names: the build type and the flavors. You can’t read values such as <code>applicationId</code> there yet.</p>`,
            code: `androidComponents {
    beforeVariants { variant ->
        val staging = ("env" to "staging") in variant.productFlavors
        if (staging && variant.buildType == "release") {
            variant.enable = false   // no freeStagingRelease or paidStagingRelease tasks
        }
    }
}`,
            visual(el) {
              const TIERS = ['free', 'paid'], ENVS = ['staging', 'prod'], TYPES = ['debug', 'release'];
              const cap = s => s[0].toUpperCase() + s.slice(1);
              const name = (t, e, b) => t + cap(e) + cap(b);
              const on = {};
              TIERS.forEach(t => ENVS.forEach(e => TYPES.forEach(b => { on[name(t, e, b)] = true; })));
              let busy = false;
              const matrix = h('div', { class: 'bd-matrix' });
              const count = h('span', { class: 'bd-count' });
              const tree = h('div', { class: 'bd-d2-tree', 'aria-live': 'polite' }, h('div', { class: 'bd-d2-cmd' }, '# tap a variant to switch it off'));
              const o = out('All 8 variants are on. Some of them make no sense.');
              const paint = changed => {
                matrix.replaceChildren(
                  h('span', { class: 'bd-mh' }, 'tier + env'), ...TYPES.map(b => h('span', { class: 'bd-mh' }, b)),
                  ...TIERS.flatMap(t => ENVS.flatMap(e => [h('span', { class: 'bd-mh' }, `${t} + ${e}`), ...TYPES.map(b => {
                    const n = name(t, e, b);
                    return h('button', { class: 'bd-cell' + (on[n] ? '' : ' bd-d2-off') + (changed && changed.includes(n) ? ' pop' : ''), 'aria-pressed': String(on[n]), onclick() {
                      if (busy) return;
                      on[n] = !on[n]; paint([n]);
                      say(o, on[n] ? `${n} is back.` : `${n} switched off. No tasks for it.`);
                    } }, n);
                  })])));
                const n = Object.values(on).filter(Boolean).length;
                count.textContent = `${n} of 8 variants enabled`;
              };
              const filter = cmd('beforeVariants { stagingRelease off }', () => {
                if (busy) return;
                const hit = Object.keys(on).filter(n => n.endsWith('StagingRelease'));
                hit.forEach(n => { on[n] = false; }); paint(hit);
                say(o, 'The filter matched the env flavor staging with the release build type. Two variants gone.');
              });
              async function list() {
                if (busy) return; busy = true;
                tree.replaceChildren(h('div', { class: 'bd-d2-cmd' }, '$ ./gradlew tasks --group build'));
                for (const n of Object.keys(on).filter(k => on[k])) {
                  tree.append(h('div', { class: 'drop-in' }, `assemble${cap(n)}`));
                  await sleep(110); if (!el.isConnected) return;
                }
                say(o, 'Only enabled variants have tasks. Android Studio’s Build Variants panel shows the same list.');
                busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'controls' }, count),
                matrix,
                h('div', { class: 'controls' }, filter, cmd('./gradlew tasks', list)),
                tree, o);
            },
          },
          {
            title: 'Matching variants across modules',
            body: `<p>Variants must also match between modules. When <code>:app</code> builds its release variant, Gradle asks <code>:core:billing</code> for its release variant too. If the library has no build type with that name, resolution fails. A custom build type like <code>benchmark</code> hits this first.</p>
<p>Tell AGP what to fall back to. <code>matchingFallbacks</code> lists build types or flavors to try in order. <code>missingDimensionStrategy</code> picks a flavor for a dimension that the library has and the app does not.</p>`,
            code: `android {
    buildTypes {
        create("benchmark") {
            initWith(getByName("release"))
            matchingFallbacks += listOf("release")   // libraries have no "benchmark"
        }
    }
    defaultConfig {
        missingDimensionStrategy("store", "play")    // :core:billing has play and amazon
    }
}`,
            visual(el) {
              const LIB = ['playDebug', 'playRelease', 'amazonDebug', 'amazonRelease'];
              let bt = 'debug', busy = false;
              const chips = LIB.map(n => h('span', { class: 'bd-set' }, n));
              const tree = h('div', { class: 'bd-d2-tree', 'aria-live': 'polite' }, h('div', { class: 'bd-d2-cmd' }, '# pick a build type and resolve'));
              const o = out(':app has no store dimension. :core:billing has one.');
              const fb = toggle('bd-d2-var-fb', 'matchingFallbacks += "release"', function () { if (busy) { this.checked = !this.checked; return; } reset(); });
              const ms = toggle('bd-d2-var-ms', 'missingDimensionStrategy("store", "play")', function () { if (busy) { this.checked = !this.checked; return; } reset(); });
              const reset = () => { chips.forEach(c => { c.className = 'bd-set'; }); tree.replaceChildren(h('div', { class: 'bd-d2-cmd' }, '# setup changed, resolve again')); };
              const btBtns = ['debug', 'release', 'benchmark'].map(b => h('button', { class: 'bd-opt', 'aria-pressed': String(b === bt), onclick() {
                if (busy) return;
                bt = b; btBtns.forEach(x => x.setAttribute('aria-pressed', String(x.textContent === b))); reset();
              } }, b));
              const put = async (t, c = '') => { tree.append(h('div', { class: `drop-in ${c}` }, t)); await sleep(320); return el.isConnected; };
              async function resolve() {
                if (busy) return; busy = true;
                chips.forEach(c => { c.className = 'bd-set'; });
                tree.replaceChildren();
                if (!await put(`$ ./gradlew :app:assemble${bt[0].toUpperCase() + bt.slice(1)}`, 'bd-d2-cmd')) return;
                let type = bt;
                if (bt === 'benchmark') {
                  if (!fb.input.checked) {
                    await put('build type benchmark: not in :core:billing', 'bd-d2-down');
                    await put('> Could not resolve project :core:billing.', 'bd-d2-down');
                    replay(tree, 'shake'); say(o, '<span class="bad">Failed.</span> The library has only debug and release. Add a fallback.');
                    busy = false; return;
                  }
                  if (!await put('build type benchmark: not found, fallback release', 'bd-d2-up')) return;
                  type = 'release';
                } else if (!await put(`build type ${bt}: found`)) return;
                const cands = LIB.filter(n => n.toLowerCase().endsWith(type));
                if (!ms.input.checked) {
                  cands.forEach(n => { chips[LIB.indexOf(n)].className = 'bd-set bd-top'; });
                  await put('dimension store: :app has none', 'bd-d2-down');
                  await put(`> Cannot choose between the following variants of project :core:billing: ${cands.join(', ')}`, 'bd-d2-down');
                  replay(tree, 'shake'); say(o, '<span class="bad">Ambiguous.</span> Two library variants fit equally well. Pick one with missingDimensionStrategy.');
                  busy = false; return;
                }
                if (!await put('dimension store: missingDimensionStrategy picks play', 'bd-d2-up')) return;
                const pick = 'play' + type[0].toUpperCase() + type.slice(1);
                chips[LIB.indexOf(pick)].className = 'bd-set bd-d2-win pop';
                await put(`:core:billing -> ${pick}`, 'bd-d2-pin');
                say(o, `<span class="good">Resolved.</span> :app ${bt} uses :core:billing ${pick}.`);
                busy = false;
              }
              el.append(
                h('div', { class: 'bd-pick', role: 'group', 'aria-label': 'App build type' }, lbl(':app'), btBtns),
                h('div', { class: 'bd-card' }, lbl(':core:billing variants'), h('div', { class: 'bd-sets' }, chips)),
                h('div', { class: 'controls' }, fb.el, ms.el),
                h('div', { class: 'controls' }, act('Resolve :core:billing', resolve)),
                tree, o);
            },
          },
        ],
        underHood: {
          body: `<p>AGP reads your <code>android { }</code> block, then computes the variant list: every flavor combination times every build type, minus what <code>beforeVariants</code> disabled. For each variant it merges the settings in a fixed order. A flavor value overrides <code>defaultConfig</code>, and suffixes stack, flavor first and build type last, as in <code>com.example.news.pro.debug</code>. Then it registers that variant’s own tasks, like <code>compilePaidDebugKotlin</code> and <code>assemblePaidDebug</code>.</p>
<p>Each <code>buildConfigField</code> becomes a <code>static final</code> field in a generated <code>BuildConfig</code> class. Java and Kotlin treat those as compile-time constants and copy the value into the code that reads them. So in a paid release build, <code>if (BuildConfig.SHOW_ADS)</code> is <code>if (false)</code>, and R8 removes the dead branch. <code>resValue</code> entries go into a generated resource file that merges with the variant’s other resources.</p>`,
          code: `// What the generated BuildConfig for paidRelease contains
public final class BuildConfig {
  public static final String APPLICATION_ID = "com.example.news.pro";
  public static final String BUILD_TYPE = "release";
  public static final String FLAVOR = "paid";
  public static final int VERSION_CODE = 1;
  public static final String VERSION_NAME = "1.0";
  public static final boolean SHOW_ADS = false;
}`,
        },
        mistakes: [
          {
            title: 'Branching on BuildConfig.FLAVOR everywhere',
            bad: `fun firstScreen(): Screen =
    if (BuildConfig.FLAVOR == "free") UpsellScreen() else HomeScreen()

fun adsEnabled() = BuildConfig.FLAVOR == "free"`,
            good: `// src/free/kotlin/com/example/news/Tier.kt
object Tier : TierConfig {
    override fun firstScreen(): Screen = UpsellScreen()
    override val ads = true
}

// src/paid/kotlin/com/example/news/Tier.kt
object Tier : TierConfig {
    override fun firstScreen(): Screen = HomeScreen()
    override val ads = false
}`,
            why: 'String checks spread through the code, and a typo like <code>"Free"</code> compiles fine. With one class per flavor source set, each variant compiles only its own version, and the compiler checks both against the same interface.',
          },
          {
            title: 'Using the application ID as the code package',
            bad: `val cls = Class.forName("\${BuildConfig.APPLICATION_ID}.MainActivity")
startActivity(Intent(this, cls))`,
            good: `startActivity(Intent(this, MainActivity::class.java))`,
            why: 'The application ID changes per variant, for example <code>com.example.news.pro.debug</code>. Classes live in the <code>namespace</code>, which stays <code>com.example.news</code>. The lookup throws <code>ClassNotFoundException</code> in every variant with a suffix.',
          },
          {
            title: 'Declaring fields without turning BuildConfig on',
            bad: `android {
    defaultConfig {
        buildConfigField("String", "API_URL", "\\"https://api.example.com\\"")
    }
}`,
            good: `android {
    buildFeatures { buildConfig = true }
    defaultConfig {
        buildConfigField("String", "API_URL", "\\"https://api.example.com\\"")
    }
}`,
            why: 'Since AGP 8, modules don’t generate <code>BuildConfig</code> unless you ask. Custom fields with the feature off fail the build with a message that the feature is disabled. Turn it on only in the modules that need it.',
          },
        ],
        predict: {
          q: "Flavors <code>free</code> and <code>paid</code>, build types <code>debug</code> and <code>release</code>. How many build variants does Gradle make?",
          options: ["2", "4", "6"],
          a: 1,
          why: "Each flavor is crossed with each build type: freeDebug, freeRelease, paidDebug, paidRelease.",
        },
        visual(el) {
          const TYPES = ['debug', 'release'], TIERS = ['free', 'paid'], ENVS = ['staging', 'prod'];
          const cap = s => s[0].toUpperCase() + s.slice(1);
          let two = false, sel = 'freeDebug';
          const combos = () => (two ? TIERS.flatMap(t => ENVS.map(e => [t, e])) : TIERS.map(t => [t]));
          const vname = (fl, bt) => fl[0] + fl.slice(1).map(cap).join('') + cap(bt);
          const matrix = h('div', { class: 'bd-matrix' });
          const count = h('span', { class: 'bd-count' });
          const kv = h('dl', { class: 'bd-kv' }), sets = h('div', { class: 'bd-sets' });
          const o = out('');
          function info(fl, bt) {
            const n = vname(fl, bt);
            const id = 'com.example.news' + (fl[0] === 'paid' ? '.pro' : '') + (fl[1] === 'staging' ? '.staging' : '') + (bt === 'debug' ? '.debug' : '');
            const rows = [['applicationId', id], ['app_name', fl[0] === 'paid' ? 'News Pro' : 'News'], ['SHOW_ADS', String(fl[0] === 'free')]];
            if (two) rows.push(['API_URL', fl[1] === 'staging' ? 'staging.example.com' : 'api.example.com']);
            rows.push(['minify', String(bt === 'release')], ['task', 'assemble' + cap(n)]);
            kv.replaceChildren(...rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
            const order = [n, bt, ...(fl.length > 1 ? [fl[0] + cap(fl[1])] : []), ...fl, 'main'];
            sets.replaceChildren(...order.flatMap((s, i) => [i ? h('span', { class: 'bd-gt' }, '>') : null, h('span', { class: 'bd-set drop-in' + (i ? '' : ' bd-top'), style: `animation-delay:${i * 70}ms` }, 'src/' + s)]).filter(Boolean));
            say(o, `${hl('./gradlew assemble' + cap(n))} <span class="muted">· a file in src/${n} overrides the same file in src/main</span>`);
          }
          function paint() {
            const cs = combos();
            matrix.replaceChildren(
              h('span', { class: 'bd-mh' }, two ? 'tier + env' : 'tier'), ...TYPES.map(t => h('span', { class: 'bd-mh' }, t)),
              ...cs.flatMap(fl => [h('span', { class: 'bd-mh' }, fl.join(' + ')), ...TYPES.map(bt => {
                const n = vname(fl, bt);
                return h('button', { class: 'bd-cell' + (n === sel ? ' pop' : ''), 'aria-pressed': String(n === sel), onclick() { if (sel === n) return; sel = n; paint(); info(fl, bt); } }, n);
              })]));
            count.textContent = `${cs.length} flavor combos x ${TYPES.length} build types = ${cs.length * TYPES.length} variants`;
          }
          const env = toggle('bd-env', 'Add dimension env: staging, prod', function () {
            two = this.checked; sel = two ? 'freeStagingDebug' : 'freeDebug';
            paint(); info(two ? ['free', 'staging'] : ['free'], 'debug');
            replay(matrix, 'pop-soft');
          });
          paint(); info(['free'], 'debug');
          el.append(
            h('div', { class: 'controls' }, env.el, count),
            matrix,
            h('div', { class: 'bd-card' }, lbl('Selected variant'), kv, lbl('Source sets, highest priority first'), sets),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'modules',
        title: 'Modularization',
        tagline: 'Feature and core modules, api vs implementation, and what recompiles.',
        level: 'intermediate',
        body: `
<p>As an app grows, split it into Gradle modules. A feature module such as <code>:feature:news</code> holds one screen or flow. Core modules such as <code>:core:data</code> and <code>:core:ui</code> hold code that many features share. <code>:app</code> ties the features together. Features should not depend on each other. They meet through core modules and navigation.</p>
<p>How you declare a dependency decides who recompiles. <code>implementation</code> keeps it private: consumers can't see it, so a change inside it stops at your module. <code>api</code> makes it part of your public surface. Every module that uses you then compiles against it too, and recompiles when its public signatures change. Use <code>api</code> only when your public functions take or return its types.</p>
<p>Many modules means a lot of repeated <code>android { }</code> setup. Move it into convention plugins in an included <code>build-logic</code> build, and apply one plugin ID per module. Small modules with narrow APIs also let Gradle build in parallel and reuse more cached outputs.</p>`,
        code: `// build-logic/convention/src/main/kotlin/AndroidLibraryConventionPlugin.kt
import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure

class AndroidLibraryConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("com.android.library")
            extensions.configure<LibraryExtension> {
                compileSdk = 36
                defaultConfig.minSdk = 24
            }
        }
    }
}

// build-logic/convention/build.gradle.kts
gradlePlugin {
    plugins {
        register("androidLibrary") {
            id = "news.android.library"
            implementationClass = "AndroidLibraryConventionPlugin"
        }
    }
}

// settings.gradle.kts
pluginManagement { includeBuild("build-logic") }

// core/data/build.gradle.kts
plugins { id("news.android.library") }
dependencies {
    api(project(":core:model"))              // Repository returns Article from :core:model
    implementation(project(":core:network")) // hidden detail, changes stop here
}`,
        remember: 'implementation hides, api leaks. Every api edge widens what recompiles when that module changes.',
        terms: [
          { term: 'implementation', def: 'A Gradle dependency configuration that puts a library on your module\u2019s compile classpath without exposing it to modules that depend on you.' },
          { term: 'api', def: 'A Gradle dependency configuration, from the java-library or Android library plugin, that also exposes the dependency to your consumers\u2019 compile classpath.' },
          { term: 'Convention plugin', def: 'A Gradle plugin you write, usually in a build-logic included build, that applies shared build setup to many modules.' },
          { term: 'Compile avoidance', def: 'Gradle and Kotlin skipping recompilation of dependent modules when a change does not alter a module\u2019s public API.' },
        ],
        challenges: [
          { type: 'blank', prompt: '<code>:core:data</code> returns <code>Article</code> from <code>:core:model</code> in its public functions, and uses <code>:core:network</code> only inside. Pick the configurations.', code: 'dependencies {\n    [[api]](project(":core:model"))\n    [[implementation]](project(":core:network"))\n}', why: 'Consumers need <code>Article</code> to call the repository, so it is <code>api</code>. Network is an internal detail, so <code>implementation</code> keeps it private.' },
          { type: 'bug', prompt: '<code>:core:data</code> calls <code>createClient()</code> and fails with "Cannot access class OkHttpClient". Tap the line that causes it.', code: '// core/network/build.gradle.kts\ndependencies {\n    implementation(libs.okhttp)\n}\n\n// core/network/src/main/kotlin/Network.kt\nfun createClient(): OkHttpClient =\n    OkHttpClient.Builder().build()', bug: 2, fix: '    api(libs.okhttp)   // OkHttpClient is part of the public API', why: '<code>createClient()</code> returns an OkHttp type, so OkHttp is part of the module\u2019s public API. With <code>implementation</code>, consumers can\u2019t see that type. Use <code>api</code>, or stop returning the OkHttp type.' },
        ],
        quiz: [
          { q: 'You change only a private function body in <code>:core:network</code>. What recompiles?', options: ['Every module', ':core:network only. :app still repackages', ':core:network and everything above it'], a: 1, why: 'The public API did not change, so dependents keep their compiled output. Only packaging reruns to pick up the new bytecode.' },
          { q: 'When should a module use <code>api</code> for a dependency?', options: ['Always, so consumers get everything', 'When its public signatures use that dependency\u2019s types', 'Never, it is deprecated'], a: 1, why: 'If consumers must see a type to call you, expose it with <code>api</code>. Otherwise <code>implementation</code> keeps rebuilds small.' },
          { q: 'What is a convention plugin for?', options: ['Sharing build setup like compileSdk and minSdk across modules', 'Running tests faster', 'Publishing to Maven Central'], a: 0, why: 'It moves repeated Gradle setup into one place. Each module then applies one plugin ID.' },
          { q: ':feature:news needs to open settings, and :feature:settings needs a link back to news. Which setup works?', options: ['news depends on settings, and settings depends on news', 'Merge both features into one module', 'Each feature depends on the other’s small <code>:api</code> module, and :app wires in the real screens'], a: 2, why: 'Two features that depend on each other form a cycle, which Gradle refuses. Small :api modules hold only routes or interfaces, so the graph stays acyclic.' },
          { q: 'You split code into ten modules where each depends on the one below, like a chain, and turn on <code>org.gradle.parallel=true</code> on an 8-core machine. Why is the build barely faster?', options: ['Each module must wait for the one below it, so build time follows the longest path, not the module count', 'Parallel builds only help on CI', 'Gradle runs only one Kotlin compile at a time'], a: 0, why: 'A module can start only when its dependencies are done. In a chain there is never more than one module ready, so the extra workers sit idle. Keep the graph wide and shallow.' },
        ],
        deeper: [
          {
            title: 'Why features must not depend on each other',
            body: `<p>The news screen wants to open settings, so someone makes <code>:feature:news</code> depend on <code>:feature:settings</code>. It builds. Now every API change in settings recompiles news. A month later settings needs a link back to news, and Gradle refuses: modules can’t form a cycle.</p>
<p>The fix is a small <code>:api</code> module per feature. It holds only what others may call, such as a route or an interface. Features depend on each other’s <code>:api</code> modules, and <code>:app</code> wires in the real implementations, for example through Hilt.</p>`,
            code: `// feature/settings/api/src/main/kotlin/SettingsRoute.kt
@Serializable data object SettingsRoute

// feature/news/build.gradle.kts
dependencies {
    implementation(project(":feature:settings:api"))   // a route, not the screen
}`,
            visual(el) {
              let ns = false, sn = false, split = false, busy = false;
              const W = 104, H = 26;
              const graph = h('div', { class: 'bd-graph' });
              const o = out('Two features, one core module. Connect the features.');
              const draw = () => {
                const N = split
                  ? { app: [160, 20], news: [66, 84], settings: [254, 84], 'news:api': [66, 150], 'settings:api': [254, 150], 'core:data': [160, 212] }
                  : { app: [160, 20], news: [66, 96], settings: [254, 96], 'core:data': [160, 172] };
                const E = split
                  ? [['app', 'news'], ['app', 'settings'], ['news', 'settings:api', 'new'], ['settings', 'news:api', 'new'], ['news', 'core:data'], ['settings', 'core:data']]
                  : [['app', 'news'], ['app', 'settings'], ['news', 'core:data'], ['settings', 'core:data'], ...(ns ? [['news', 'settings', sn ? 'bad' : 'new']] : []), ...(sn ? [['settings', 'news', ns ? 'bad' : 'new']] : [])];
                const line = ([a, b, k]) => {
                  const [x1, y1] = N[a], [x2, y2] = N[b];
                  const cls = 'bd-edge' + (k === 'bad' ? ' bd-cyc' : k === 'new' ? ' bd-api' : '');
                  if (y1 === y2) { const dy = x2 > x1 ? -6 : 6, s = Math.sign(x2 - x1); return `<line class="${cls}" x1="${x1 + s * W / 2}" y1="${y1 + dy}" x2="${x2 - s * W / 2}" y2="${y2 + dy}" marker-end="url(#bd-m1-arr)"/>`; }
                  return `<line class="${cls}" x1="${x1}" y1="${y1 + H / 2}" x2="${x2}" y2="${y2 - H / 2}" marker-end="url(#bd-m1-arr)"/>`;
                };
                const nodes = Object.entries(N).map(([k, [x, y]]) => `<g class="bd-node${(ns && sn && !split && (k === 'news' || k === 'settings')) ? ' bd-src' : k.endsWith(':api') ? ' bd-pack' : ''}"><rect x="${x - W / 2}" y="${y - H / 2}" width="${W}" height="${H}" rx="7"/><text x="${x}" y="${y + 4}" text-anchor="middle">:${k}</text></g>`).join('');
                const hgt = split ? 232 : 192;
                graph.innerHTML = `<svg viewBox="0 0 320 ${hgt}" role="img" aria-label="Feature module graph"><defs><marker id="bd-m1-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor"/></marker></defs>${E.map(line).join('')}${nodes}</svg>`;
                replay(graph, 'pop-soft');
              };
              const add = which => () => {
                if (busy) return;
                if (split) { say(o, 'Already split. Each feature only sees the other’s :api module.'); return; }
                if (which === 'ns') { if (ns) { say(o, ':news already depends on :settings.'); return; } ns = true; }
                else { if (sn) { say(o, ':settings already depends on :news.'); return; } sn = true; }
                draw();
                say(o, ns && sn ? '<span class="bad">Both directions now.</span> Build it.' : 'Builds fine. <span class="muted">But now an API change in one feature recompiles the other.</span>');
              };
              const build = async () => {
                if (busy) return; busy = true;
                say(o, '<span class="muted">$ ./gradlew assembleDebug</span>');
                await sleep(500); if (!el.isConnected) return;
                if (ns && sn && !split) { replay(graph, 'shake'); say(o, '<span class="bad">Circular dependency between the following tasks:</span> :feature:news:compileDebugKotlin -> :feature:settings:compileDebugKotlin -> :feature:news:compileDebugKotlin'); }
                else say(o, `<span class="good">BUILD SUCCESSFUL</span>${split ? '. A change inside :settings no longer recompiles :news. Only a change to :settings:api does.' : ''}`);
                busy = false;
              };
              const splitIt = () => {
                if (busy) return;
                if (!ns && !sn) { say(o, 'Nothing to untangle yet. Connect the features first.'); return; }
                if (split) { say(o, 'Already split.'); return; }
                split = true; draw();
                say(o, 'Routes moved to :news:api and :settings:api. Features point at those. :app provides the real screens.');
              };
              draw();
              el.append(
                graph,
                h('div', { class: 'bd-legend' }, h('span', {}, h('i', { class: 'bd-l-pack' }), ':api module'), h('span', {}, h('i', { class: 'bd-l-src' }), 'in a cycle'), h('span', {}, 'Arrows point to what a module depends on.')),
                h('div', { class: 'controls' }, act(':news uses :settings', add('ns')), act(':settings uses :news', add('sn')), act('Split out :api modules', splitIt)),
                h('div', { class: 'controls' }, cmd('./gradlew assembleDebug', build)),
                o);
            },
          },
          {
            title: 'Wide graphs build in parallel',
            body: `<p>With <code>org.gradle.parallel=true</code>, Gradle compiles independent modules at the same time, one per worker. But a module can only start when everything it depends on is done. In a long chain, each module waits for the one below, and extra workers sit idle.</p>
<p>Build time is set by the longest path through the graph, not by the number of modules. Keep the graph wide and shallow: many features on a few small core modules.</p>`,
            code: `# gradle.properties
org.gradle.parallel=true
# workers default to the number of CPU cores
# org.gradle.workers.max=4`,
            visual(el) {
              let shape = 'wide', par = true, busy = false;
              const SH = {
                chain: [['core', []], ['m2', ['core']], ['m3', ['m2']], ['m4', ['m3']], ['m5', ['m4']], ['m6', ['m5']], ['app', ['m6']]],
                wide: [['core', []], ['f1', ['core']], ['f2', ['core']], ['f3', ['core']], ['f4', ['core']], ['f5', ['core']], ['app', ['f1', 'f2', 'f3', 'f4', 'f5']]],
              };
              const lanes = [0, 1, 2, 3].map(i => { const track = h('div', { class: 'lane-track' }); return { track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, `worker ${i + 1}`), track) }; });
              const total = h('span', { class: 'bd-count' });
              const o = out('');
              const plan = () => {
                const done = {}, free = par ? [0, 0, 0, 0] : [0], res = [];
                for (const [m, deps] of SH[shape]) {
                  const ready = Math.max(0, ...deps.map(d => done[d]));
                  let w = 0;
                  for (let i = 1; i < free.length; i++) if (Math.max(free[i], ready) < Math.max(free[w], ready)) w = i;
                  const start = Math.max(free[w], ready);
                  done[m] = free[w] = start + 1; res.push({ m, w, start });
                }
                return res;
              };
              const live = (() => { let seen = false; const t0 = Date.now(); return () => { if (el.isConnected) { seen = true; return true; } return !seen && Date.now() - t0 < 5000; }; })();
              async function run() {
                if (busy) return; busy = true;
                lanes.forEach(l => l.track.replaceChildren());
                const p = plan(), end = Math.max(...p.map(x => x.start + 1));
                total.textContent = '';
                for (const x of p.slice().sort((a, b) => a.start - b.start)) {
                  if (!live()) { busy = false; return; }
                  lanes[x.w].track.append(h('div', { class: 'bar run drop-in bd-bar', style: `left:${(x.start / 7 * 100).toFixed(2)}%;width:${(100 / 7 - 1).toFixed(2)}%` }, x.m));
                  await sleep(240);
                }
                total.textContent = `${end} time units for 7 modules`;
                say(o, end === 7
                  ? (par ? '<span class="bad">7 units:</span> every module waits for the one before it. Three workers never did anything.' : '7 units: one worker, one module at a time.')
                  : `<span class="good">${end} units:</span> five features compiled side by side once core was done.`);
                busy = false;
              }
              const pressAt = (bs, i) => bs.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
              const shapeBtns = ['wide', 'chain'].map((s, i) => act(s === 'wide' ? 'Wide graph' : 'Long chain', () => { if (busy) return; shape = s; pressAt(shapeBtns, i); run(); }));
              pressAt(shapeBtns, 0);
              const pp = toggle('bd-m2-par', 'org.gradle.parallel=true', function () { if (busy) { this.checked = !this.checked; return; } par = this.checked; run(); });
              pp.input.checked = true;
              el.append(
                h('div', { class: 'controls' }, shapeBtns, pp.el),
                h('div', { class: 'timeline' }, lanes.map(l => l.el)),
                h('div', { class: 'controls' }, cmd('./gradlew assembleDebug', run), total),
                o);
              run();
            },
          },
        ],
        underHood: {
          body: `<p>Each dependency configuration feeds two classpaths. <code>api</code> and <code>implementation</code> both end up on your consumers’ runtime classpath, because the code must be in the APK. Only <code>api</code> also goes on their compile classpath. That is the whole difference, and it is why <code>implementation</code> keeps rebuilds small. When published to Maven, <code>api</code> maps to the compile scope and <code>implementation</code> to the runtime scope.</p>
<p>When a module changes, the Kotlin Gradle plugin compares a snapshot of its ABI, the public signatures, with the previous one. If the ABI is the same, dependents skip recompiling even though the jar’s bytes changed. That is compile avoidance in practice: private changes stop at the module border.</p>`,
          code: `// :core:data has  api(":core:model")  and  implementation(":core:network")
// :feature:news depends on :core:data. Its classpaths:
//   compileClasspath: core-data, core-model
//   runtimeClasspath: core-data, core-model, core-network
$ ./gradlew :feature:news:dependencies --configuration debugCompileClasspath`,
        },
        mistakes: [
          {
            title: 'Making everything api to be safe',
            bad: `dependencies {
    api(libs.okhttp)
    api(libs.androidx.room.runtime)
    api(project(":core:network"))
}`,
            good: `dependencies {
    api(project(":core:model"))       // public functions return its types
    implementation(libs.okhttp)
    implementation(libs.androidx.room.runtime)
    implementation(project(":core:network"))
}`,
            why: 'Every <code>api</code> edge puts that library on all consumers’ compile classpaths. Their builds slow down, and they can start using types you meant to hide.',
          },
          {
            title: 'A :core:common grab-bag that everything uses',
            bad: `// core/common: DateUtils, Analytics, ImageLoader, Strings, Theme
// in every module:
implementation(project(":core:common"))`,
            good: `implementation(project(":core:analytics"))
implementation(project(":core:ui"))
// small modules, each with one job`,
            why: 'A change to any file in the grab-bag can change its ABI and recompile every module. Split it so a change only reaches the modules that use that piece.',
          },
          {
            title: 'Configuring modules from the root with subprojects',
            bad: `// root build.gradle.kts
subprojects {
    apply(plugin = "com.android.library")
    extensions.configure<LibraryExtension> { compileSdk = 36 }
}`,
            good: `// each module
plugins { id("news.android.library") }   // convention plugin in build-logic`,
            why: 'Cross-project configuration couples every module to the root script and blocks Gradle’s isolated projects work. A convention plugin keeps each module’s setup in its own build file.',
          },
        ],
        predict: {
          q: "<code>:core:data</code> uses <code>implementation(:core:network)</code>. You change a public signature in <code>:core:network</code>. Which modules recompile?",
          options: ["Only <code>:core:network</code> and <code>:core:data</code>", "Every module in the app", "Only <code>:core:network</code>"],
          a: 0,
          why: "With implementation, :core:network is private to :core:data. Modules above :core:data never compile against it.",
        },
        visual(el) {
          const N = { app: [170, 20], 'feature:news': [92, 82], 'feature:settings': [248, 82], 'core:data': [110, 148], 'core:ui': [250, 148], 'core:network': [62, 214], 'core:model': [200, 214] };
          const E = [['app', 'feature:news', 'impl'], ['app', 'feature:settings', 'impl'], ['feature:news', 'core:data', 'impl'], ['feature:news', 'core:ui', 'impl'], ['feature:settings', 'core:data', 'impl'], ['feature:settings', 'core:ui', 'impl'], ['core:data', 'core:model', 'api'], ['core:data', 'core:network', 'impl'], ['core:ui', 'core:model', 'impl']];
          const W = 112, H = 26;
          const ORDER = ['core:model', 'core:network', 'core:data', 'core:ui', 'feature:news', 'feature:settings', 'app'];
          let busy = false;
          const edges = E.map(([a, b, k], i) => {
            const [x1, y1] = N[a], [x2, y2] = N[b];
            const lab = a === 'core:data' ? `<text class="bd-elab${k === 'api' ? ' bd-api' : ''}" data-l="${i}" x="${(x1 + x2) / 2 + (x2 < x1 ? -30 : 6)}" y="${(y1 + y2) / 2 + (x2 < x1 ? 4 : -6)}">${k}</text>` : '';
            return `<line class="bd-edge${k === 'api' ? ' bd-api' : ''}" data-e="${i}" x1="${x1}" y1="${y1 + H / 2}" x2="${x2}" y2="${y2 - H / 2}"/>${lab}`;
          }).join('');
          const nodes = Object.entries(N).map(([k, [x, y]]) => `<g class="bd-node" data-m="${k}"><rect x="${x - W / 2}" y="${y - H / 2}" width="${W}" height="${H}" rx="7"/><text x="${x}" y="${y + 4}" text-anchor="middle">:${k}</text></g>`).join('');
          const graph = h('div', { class: 'bd-graph', html: `<svg viewBox="0 0 320 232" role="img" aria-label="Module dependency graph">${edges}${nodes}</svg>` });
          const node = m => graph.querySelector(`[data-m="${m}"]`);
          const o = out('Change a module and watch what recompiles.');
          const deps = m => E.filter(e => e[0] === m);
          const apiClosure = m => deps(m).filter(e => e[2] === 'api').flatMap(e => [e[1], ...apiClosure(e[1])]);
          const classpath = m => new Set(deps(m).flatMap(e => [e[1], ...apiClosure(e[1])]));
          const clear = () => graph.querySelectorAll('.bd-node').forEach(g => g.classList.remove('bd-src', 'bd-hot', 'bd-pack'));
          const apiSw = toggle('bd-api', 'core:data uses api(:core:network)', function () {
            if (busy) { this.checked = !this.checked; return; }
            E[7][2] = this.checked ? 'api' : 'impl';
            const line = graph.querySelector('[data-e="7"]'), lab = graph.querySelector('[data-l="7"]');
            line.classList.toggle('bd-api', this.checked); lab.classList.toggle('bd-api', this.checked); lab.textContent = E[7][2];
            clear();
            say(o, this.checked ? 'Now every module that uses :core:data also compiles against :core:network.' : ':core:network is private to :core:data again.');
          });
          async function change(target, abi) {
            if (busy) return; busy = true; clear();
            node(target).classList.add('bd-src');
            const hit = [target];
            say(o, `<span class="muted">${abi ? 'Public signature' : 'Function body'} changed in :${target}</span>`);
            await sleep(500); if (!el.isConnected) return;
            if (abi) for (const m of ORDER) {
              if (m === target || !classpath(m).has(target)) continue;
              node(m).classList.add('bd-hot'); hit.push(m);
              await sleep(380); if (!el.isConnected) return;
            }
            node('app').classList.add('bd-pack');
            await sleep(300); if (!el.isConnected) return;
            say(o, `<span class="${hit.length > 2 ? 'bad' : 'good'}">Recompiled ${hit.length} of 7 modules:</span> ${hit.map(m => ':' + m).join(', ')}. :app re-dexes and repackages.`);
            busy = false;
          }
          el.append(
            graph,
            h('div', { class: 'bd-legend' }, h('span', {}, h('i', { class: 'bd-l-src' }), 'changed'), h('span', {}, h('i', { class: 'bd-l-hot' }), 'recompiles'), h('span', {}, h('i', { class: 'bd-l-pack' }), 'repackages'), h('span', {}, 'Lines run from a module down to what it depends on.')),
            h('div', { class: 'controls' }, apiSw.el),
            h('div', { class: 'controls' },
              act('Edit a body in :core:network', () => change('core:network', false)),
              act('New signature in :core:network', () => change('core:network', true)),
              act('New class in :core:model', () => change('core:model', true))),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'signing',
        title: 'Signing',
        tagline: 'Debug key, upload key, app signing key, and keeping them safe.',
        level: 'intermediate',
        body: `
<p>Android installs an update only when it is signed with the same key as the app already on the phone. Debug builds use a debug keystore that Android Studio creates for you at <code>~/.android/debug.keystore</code>. Google Play rejects anything signed with it.</p>
<p>Play App Signing, required for new apps, uses two keys. You sign each upload with your upload key. Google keeps the app signing key and uses it to sign the APKs it sends to phones. If your upload key is lost or leaks, you request an upload key reset in Play Console and keep shipping, because phones only ever check the app signing key.</p>
<p>Treat the keystore and its passwords as secrets. Create the upload key with <code>keytool -genkeypair</code>, keep the <code>.jks</code> file out of git, and read passwords from environment variables or <code>~/.gradle/gradle.properties</code>, never from a file in the repo. In CI, store them as encrypted secrets and back up the keystore somewhere safe.</p>`,
        code: `// Create the upload key once (keep the file and passwords out of the repo)
// keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000

// app/build.gradle.kts
android {
    signingConfigs {
        create("upload") {
            storeFile = providers.gradleProperty("news.upload.storeFile").orNull?.let(::file)
            storePassword = providers.environmentVariable("UPLOAD_STORE_PASSWORD").orNull
            keyAlias = "upload"
            keyPassword = providers.environmentVariable("UPLOAD_KEY_PASSWORD").orNull
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("upload")
        }
        // debug uses ~/.android/debug.keystore automatically
    }
}

// ~/.gradle/gradle.properties (on your machine, not in git)
// news.upload.storeFile=/Users/you/keys/upload.jks

// .gitignore
// *.jks
// *.keystore`,
        remember: 'You sign with the upload key, Google signs with the app key. Lose the upload key and you can reset it. Never commit either one.',
        terms: [
          { term: 'Keystore', def: 'A password-protected file, usually .jks, that holds one or more private keys and their certificates.' },
          { term: 'Upload key', def: 'The key you use to sign app bundles before uploading them to Play, which Play can reset if it is lost or leaked.' },
          { term: 'App signing key', def: 'The key that signs the APKs installed on phones, which every future update must also be signed with.' },
          { term: 'Play App Signing', def: 'A Google Play service that stores your app signing key and signs the APKs it generates from your uploads.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the password from the environment and sign release builds with the upload config.', code: 'signingConfigs {\n    create("upload") {\n        storePassword = providers.[[environmentVariable|gradleProperty]]("UPLOAD_STORE_PASSWORD").orNull\n    }\n}\nbuildTypes {\n    release {\n        signingConfig = signingConfigs.[[getByName]]("upload")\n    }\n}', why: '<code>providers.environmentVariable</code> reads a CI secret without putting it in the repo. <code>signingConfigs.getByName</code> looks up the config you created.' },
          { type: 'bug', prompt: 'This file is committed to the repo. Tap the line that should never be there.', code: 'signingConfigs {\n    create("upload") {\n        storeFile = providers.gradleProperty("news.upload.storeFile").orNull?.let(::file)\n        storePassword = "Sup3rS3cret!"\n        keyAlias = "upload"\n        keyPassword = providers.environmentVariable("UPLOAD_KEY_PASSWORD").orNull\n    }\n}', bug: 3, fix: '        storePassword = providers.environmentVariable("UPLOAD_STORE_PASSWORD").orNull', why: 'A password in a build script ends up in git history for anyone with repo access. Read it from the environment or a properties file outside the repo, then rotate the leaked one.' },
        ],
        quiz: [
          { q: 'Your laptop with the upload keystore is stolen. What now?', options: ['The app can never be updated again', 'Request an upload key reset in Play Console, register a new upload key, keep shipping', 'Publish the app under a new package name'], a: 1, why: 'With Play App Signing, Google holds the app signing key. Only the upload key is lost, and Play can replace it.' },
          { q: 'You upload a bundle signed with the debug keystore. What happens?', options: ['Play rejects it because it was signed in debug mode', 'Play re-signs it and publishes it', 'It installs only on test devices'], a: 0, why: 'Play refuses uploads signed in debug mode. Sign release builds with your upload key.' },
          { q: 'Which key do users\u2019 phones check when an update installs?', options: ['The upload key', 'The app signing key', 'The debug key'], a: 1, why: 'Play delivers APKs signed with the app signing key. The upload key only proves to Play that the upload came from you.' },
          { q: 'Google sign-in works on your debug build and on the release APK you install from your laptop. For users who install from Play, it fails. What is the most likely cause?', options: ['Play strips Google sign-in from release builds', 'The upload key has expired', 'The fingerprint of Play’s app signing key is not registered with the service'], a: 2, why: 'Copies from Play are signed with the app signing key, not your upload key. Copy its SHA-1 and SHA-256 from the App signing page in Play Console and register them.' },
          { q: 'Inside <code>signingConfigs</code> in app/build.gradle.kts:<pre>create("upload") {\n  val p = System.getenv("KS")!!\n  storeFile = file(p)\n}</pre>A new contributor clones the repo and runs <code>./gradlew assembleDebug</code>. It fails. Which line is to blame?', options: ['<code>create("upload") {</code>', '<code>val p = System.getenv("KS")!!</code>', '<code>storeFile = file(p)</code>'], a: 1, why: 'This block runs during configuration for every build, even debug. Without the secret, <code>!!</code> throws. Attach the signing config only when the secrets exist.' },
        ],
        deeper: [
          {
            title: 'Signature schemes v1 to v4',
            body: `<p>An APK can carry several signatures. v1 is the old JAR scheme. It signs each file inside the zip, but not the zip structure around them. v2, checked since Android 7.0, signs the whole file as one blob, so any changed byte breaks it, and it verifies faster. v3, since Android 9, adds key rotation: the APK can carry proof that a new key replaced an old one. v4, since Android 11, is a separate <code>.idsig</code> file for streaming installs with <code>adb install --incremental</code>.</p>
<p>A phone checks the newest scheme it understands and ignores older ones. Signing tools pick schemes from your <code>minSdk</code>. With <code>minSdk = 24</code>, every phone checks v2 or later, so v1 adds nothing.</p>`,
            visual(el) {
              let full = true, old = false, tamper = 'none', busy = false;
              const seg = (t, d) => Object.assign(h('div', { class: 'bd-d2-seg' }, h('b', {}, t), h('small', {}, d)), { badge: null });
              const S = [seg('Entries', 'AndroidManifest.xml, classes.dex, res/'), seg('META-INF/', 'v1: a digest per entry'), seg('Signing Block', 'v2 and v3 signatures'), seg('Central dir + EOCD', 'zip index and metadata')];
              const cov = h('div', { class: 'bd-legend' });
              const o = out('Pick a scheme, a phone and a change, then install.');
              const group = (label, items, get, set) => {
                const btns = items.map(([k, t]) => h('button', { class: 'bd-opt', 'aria-pressed': String(get() === k), onclick() {
                  if (busy) return;
                  set(k); btns.forEach((b, i) => b.setAttribute('aria-pressed', String(get() === items[i][0]))); paint();
                } }, t));
                return h('div', { class: 'bd-pick', role: 'group', 'aria-label': label }, lbl(label), btns);
              };
              const checked = () => (old ? 'v1' : full ? 'v2' : 'v1');
              function paint() {
                const by = checked();
                S.forEach((s, i) => {
                  s.className = 'bd-d2-seg';
                  if (i === 2 && !full) s.classList.add('bd-d2-gone');
                  if (by === 'v1' && i === 0) s.classList.add('bd-d2-cov');
                  if (by === 'v2' && i !== 2) s.classList.add('bd-d2-cov');
                  if ((tamper === 'dex' && i === 0) || (tamper === 'meta' && i === 3)) s.classList.add('bd-d2-hit');
                });
                cov.textContent = `checked on this phone: ${by === 'v1' ? 'v1, which covers the entries only' : 'v2/v3, which cover every byte outside the signing block'}`;
              }
              async function install() {
                if (busy) return; busy = true;
                say(o, '<span class="muted">$ adb install app-release.apk</span>');
                const by = checked();
                const order = by === 'v1' ? [0] : [0, 1, 3];
                for (const i of order) {
                  S[i].classList.add('bd-d2-scan'); await sleep(380); if (!el.isConnected) return;
                  S[i].classList.remove('bd-d2-scan');
                }
                if (tamper === 'dex') { replay(S[0], 'shake'); say(o, `<span class="bad">Install refused.</span> The ${by} digest of classes.dex does not match. Every scheme catches a changed file.`); }
                else if (tamper === 'meta' && by === 'v2') { replay(S[3], 'shake'); say(o, '<span class="bad">Install refused.</span> v2 covers the zip index too, so a changed byte there breaks the signature.'); }
                else if (tamper === 'meta') say(o, '<span class="bad">Installed anyway.</span> v1 never looks at zip metadata. The Janus attack (2017) used this gap to slip extra code into v1-only APKs on Android 5 to 8.');
                else say(o, `<span class="good">Installed.</span> Verified with ${by === 'v1' ? 'v1 (JAR signing)' : 'APK Signature Scheme v2/v3'}.`);
                busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'bd-d2-apk' }, S),
                cov,
                h('div', { class: 'bd-picks' },
                  group('Signed', [[true, 'v1 + v2 + v3'], [false, 'v1 only']], () => full, v => { full = v; }),
                  group('Phone', [[false, 'Android 15'], [true, 'Android 6']], () => old, v => { old = v; }),
                  group('Change', [['none', 'nothing'], ['dex', 'edit classes.dex'], ['meta', 'edit zip metadata']], () => tamper, v => { tamper = v; })),
                h('div', { class: 'controls' }, cmd('adb install app-release.apk', install)),
                o);
            },
          },
          {
            title: 'Which fingerprint do services see?',
            body: `<p>Google sign-in, Maps key restrictions and Firebase recognize your app by its package name plus the SHA-1 or SHA-256 fingerprint of its signing certificate. Up to three certificates are in play: your debug key, your upload key and Play’s app signing key. Copies installed from Play carry the app signing key, so its fingerprint must be registered. Otherwise sign-in works for you and fails for every user.</p>
<p>Print your local fingerprints with <code>./gradlew signingReport</code>. Copy the app signing key’s fingerprints from the App signing page in Play Console.</p>`,
            code: `$ ./gradlew signingReport
Variant: debug
Store: /Users/you/.android/debug.keystore
SHA1: A1:3F:…
SHA-256: 5B:0C:…

Variant: release
Store: /Users/you/keys/upload.jks
SHA1: 7C:22:…
// The app signing key is not on your machine. Its fingerprints are in Play Console.`,
            visual(el) {
              const KEYS = [['debug', 'debug key', 'A1:3F:9E'], ['upload', 'upload key', '7C:22:B0'], ['app', 'app signing key', 'E9:04:5D']];
              const reg = { debug: true, upload: true, app: false };
              let src = 'debug';
              const SRC = [['debug', 'Run from Android Studio'], ['upload', 'Local release build'], ['app', 'Installed from Play']];
              const chips = {};
              const keyRow = h('div', { class: 'bd-keys' }, KEYS.map(([k, t, fp]) => (chips[k] = h('span', { class: 'bd-key' }, `${t} · SHA-1 ${fp}…`))));
              const o = out('Debug and upload fingerprints are registered. Try each install, then sign in.');
              const boxes = KEYS.map(([k, t]) => {
                const tg = toggle(`bd-d2-sig-${k}`, t, () => { reg[k] = tg.input.checked; say(o, `${t} fingerprint ${reg[k] ? 'added to' : 'removed from'} the console.`); });
                tg.input.checked = reg[k];
                return tg.el;
              });
              const paint = () => KEYS.forEach(([k]) => { chips[k].className = 'bd-key' + (k === src ? ' bd-d2-signer pop' : ''); });
              const srcBtns = SRC.map(([k, t]) => h('button', { class: 'bd-opt', 'aria-pressed': String(k === src), onclick() {
                src = k; srcBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(SRC[i][0] === k))); paint();
                say(o, `This copy is signed with the ${KEYS.find(x => x[0] === k)[1]}.`);
              } }, t));
              paint();
              el.append(
                h('div', { class: 'bd-pick', role: 'group', 'aria-label': 'Install' }, lbl('Install'), srcBtns),
                keyRow,
                h('div', { class: 'bd-card' }, lbl('Registered in Cloud Console / Firebase'), h('div', { class: 'controls' }, boxes)),
                h('div', { class: 'controls' }, act('Sign in with Google', () => {
                  const name = KEYS.find(x => x[0] === src)[1];
                  if (reg[src]) { replay(chips[src], 'pop'); say(o, `<span class="good">Signed in.</span> The ${name} fingerprint matches a registered one.`); }
                  else { replay(chips[src], 'shake'); say(o, `<span class="bad">Sign-in failed:</span> developer error. This app’s ${name} fingerprint is not registered.${src === 'app' ? ' This is what every Play user sees.' : ''}`); }
                })),
                o);
            },
          },
          {
            title: 'Signing in CI without a file in the repo',
            body: `<p>CI needs the upload key too. Store the keystore as a base64 secret, decode it to a temporary file at the start of the job, and pass the path in. The build script stays the same as on your machine, because it reads the same Gradle property and environment variables.</p>`,
            code: `# CI job. Secrets come from the CI's encrypted store.
echo "$UPLOAD_KEYSTORE_B64" | base64 --decode > "$RUNNER_TEMP/upload.jks"
./gradlew :app:bundleRelease -Pnews.upload.storeFile="$RUNNER_TEMP/upload.jks"
# UPLOAD_STORE_PASSWORD and UPLOAD_KEY_PASSWORD are secret environment variables`,
          },
        ],
        underHood: {
          body: `<p>v2 and v3 signatures live in an APK Signing Block, inserted just before the zip’s central directory. The signer splits the rest of the file into 1 MB chunks, hashes each chunk, and signs the combined digest together with the certificate. At install, the package manager recomputes the digests, checks the signature and records the signing certificate. On an update it compares the new certificate with the stored one, or follows a v3 rotation proof from the old key to the new one. A mismatch fails with <code>INSTALL_FAILED_UPDATE_INCOMPATIBLE</code>.</p>
<p>An <code>.aab</code> is never installed, so it carries a JAR signature, the kind jarsigner makes. Play checks it against your registered upload certificate, then signs the APKs it generates with the app signing key.</p>`,
          code: `$ apksigner verify --print-certs --verbose app-release.apk
Verifies
Verified using v1 scheme (JAR signing): false
Verified using v2 scheme (APK Signature Scheme v2): true
Verified using v3 scheme (APK Signature Scheme v3): true
Number of signers: 1
Signer #1 certificate SHA-256 digest: 3f9a…`,
        },
        mistakes: [
          {
            title: 'Breaking every build when a secret is missing',
            bad: `signingConfigs {
    create("upload") {
        storeFile = file(System.getenv("UPLOAD_STORE_FILE")!!)
        storePassword = System.getenv("UPLOAD_STORE_PASSWORD")!!
    }
}`,
            good: `val storePath = providers.environmentVariable("UPLOAD_STORE_FILE").orNull
if (storePath != null) {
    signingConfigs.create("upload") {
        storeFile = file(storePath)
        storePassword = providers.environmentVariable("UPLOAD_STORE_PASSWORD").get()
        keyAlias = "upload"
        keyPassword = providers.environmentVariable("UPLOAD_KEY_PASSWORD").get()
    }
    buildTypes.getByName("release").signingConfig = signingConfigs.getByName("upload")
}`,
            why: 'This block runs during configuration, for every build. The <code>!!</code> throws on any machine without the secrets, so a new contributor can’t even build debug. Attach the signing config only when the secrets exist.',
          },
          {
            title: 'Making a new key on a new machine',
            bad: `# new CI runner, no keystore found, so make one
keytool -genkeypair -keystore upload.jks -alias upload -keyalg RSA -validity 10000
./gradlew :app:bundleRelease`,
            good: `# restore the one registered upload key
echo "$UPLOAD_KEYSTORE_B64" | base64 --decode > upload.jks
./gradlew :app:bundleRelease`,
            why: 'Play accepts uploads only when they are signed with your registered upload key. A bundle signed with a fresh key is rejected as signed with the wrong key. Keep one upload key, back it up, and restore it wherever you build.',
          },
        ],
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'dev', label: 'Your machine', sub: 'upload key' },
              { id: 'console', label: 'Play Console', sub: 'checks uploads' },
              { id: 'pas', label: 'Play App Signing', sub: 'app signing key' },
              { id: 'phone', label: 'Phones', sub: 'check updates' },
            ],
            predict: {
              q: 'A teammate builds the release on another laptop, signed with a different keystore, and uploads it. What happens?',
              options: ['Accepted: Play re-signs everything anyway', 'Rejected: it is not signed with the registered upload key', 'Accepted, but phones refuse to install the update'],
              a: 1,
              why: 'Play Console checks every upload against the upload key it knows. That check is what proves the bundle comes from you.',
            },
            frames: [
              { say: 'You build a release bundle with <code>./gradlew :app:bundleRelease</code>. Follow the signatures.' },
              { at: 'dev', packet: '.aab · upload key', say: 'Gradle signs the bundle with your upload key from <code>signingConfigs</code>.' },
              { at: 'console', packet: 'upload key ✓', tone: 'ok', mark: { console: 'ok' }, say: 'Play Console checks the upload signature: this bundle really comes from you.' },
              { at: 'pas', packet: 'APKs · app key', say: 'Play builds the APKs and signs them with the app signing key. Google keeps that key; you never hold it.' },
              { at: 'phone', packet: 'update', tone: 'ok', mark: { phone: 'ok' }, say: 'The phone installs the update because it is signed with the same app signing key as the installed app.' },
              { at: 'dev', packet: '.aab · other key', tone: 'warm', mark: { dev: 'warm', console: null, phone: null }, say: 'A teammate builds on another laptop with a different keystore.' },
              { at: 'console', packet: 'rejected', tone: 'err', mark: { console: 'err' }, say: 'Play Console rejects it: wrong upload key. A bundle signed with the debug key is rejected too.' },
              { at: 'console', packet: 'key reset', tone: 'warm', mark: { console: 'warm' }, say: 'If the upload key is lost or leaks, request an upload key reset in Play Console and register a new one.' },
              { at: 'phone', packet: 'update', tone: 'ok', mark: { dev: 'ok', console: 'ok', phone: 'ok' }, say: 'Phones never see the upload key. They check the app signing key, which did not change, so updates keep installing.' },
            ],
          });
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'bundles',
        title: 'App Bundles and Play delivery',
        tagline: 'Upload one .aab, and each phone downloads only its split APKs.',
        level: 'intermediate',
        body: `
<p>You upload an Android App Bundle (<code>.aab</code>) to Play, not an APK. A bundle holds all your compiled code and resources, organized so Play can cut it apart. Play has required bundles for new apps since August 2021. Build one with <code>./gradlew :app:bundleRelease</code>.</p>
<p>From the bundle, Play generates split APKs for each device: a base APK, plus configuration splits for the phone\u2019s CPU architecture (ABI), screen density and languages. The phone installs them as one app. That download is usually much smaller than a universal APK that carries every ABI, density and language. APKs still matter for sideloading and other stores.</p>
<p>Dynamic feature modules go further. Their code ships only when the app asks for it with <code>SplitInstallManager</code>, or under conditions set in the module manifest. To see what a device would get, use <code>bundletool build-apks</code> with <code>--connected-device</code> on your bundle.</p>`,
        code: `// app/build.gradle.kts
android {
    bundle {
        language { enableSplit = true }  // set false if users pick a language inside the app
        density { enableSplit = true }
        abi { enableSplit = true }
    }
    dynamicFeatures += setOf(":feature:scanner")
}

// feature/scanner/build.gradle.kts
plugins { id("com.android.dynamic-feature") }
dependencies { implementation(project(":app")) }

// Download the module when the user opens the scanner
val manager = SplitInstallManagerFactory.create(context)
val request = SplitInstallRequest.newBuilder()
    .addModule("scanner")
    .build()
manager.startInstall(request)
    .addOnSuccessListener { sessionId -> trackInstall(sessionId) }
    .addOnFailureListener { e -> showError(e) }

// ./gradlew :app:bundleRelease
//   -> app/build/outputs/bundle/release/app-release.aab
// bundletool build-apks --bundle=app-release.aab --output=app.apks --connected-device`,
        remember: 'Upload one bundle. Play cuts it into base plus ABI, density and language splits, so each phone downloads only what it uses.',
        terms: [
          { term: 'Android App Bundle', def: 'The .aab publishing format that contains all of an app\u2019s code and resources and lets Google Play generate optimized APKs per device.' },
          { term: 'Split APK', def: 'One of several APKs, such as a base APK or an ABI, density or language split, that install together as a single app.' },
          { term: 'Dynamic feature module', def: 'A module built with the com.android.dynamic-feature plugin whose code Play can deliver later, on demand or by condition.' },
          { term: 'bundletool', def: 'Google\u2019s command-line tool that builds the APK set from an .aab, the same way Play does, so you can test it locally.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the scanner a dynamic feature, then build the bundle for upload.', code: '// feature/scanner/build.gradle.kts\nplugins {\n    id("com.android.[[dynamic-feature]]")\n}\n\n// terminal\n// ./gradlew :app:[[bundleRelease]]', why: 'Dynamic features use the <code>com.android.dynamic-feature</code> plugin. <code>bundleRelease</code> produces the <code>.aab</code> you upload.' },
          { type: 'bug', prompt: 'The app ships a native library and must still install on 32-bit ARM phones. Tap the wrong line.', code: 'android {\n    defaultConfig {\n        minSdk = 24\n        ndk {\n            abiFilters += listOf("arm64-v8a")\n        }\n    }\n}', bug: 4, fix: '            abiFilters += listOf("arm64-v8a", "armeabi-v7a")', why: 'With only <code>arm64-v8a</code>, the bundle has no 32-bit native code and 32-bit phones can\u2019t install it. Include <code>armeabi-v7a</code>, or drop the filter and let ABI splits keep downloads small.' },
        ],
        quiz: [
          { q: 'A French-speaking user on an arm64 phone with an xxhdpi screen installs your app. What does Play send?', options: ['A universal APK with every ABI, density and language', 'The base APK plus arm64-v8a, xxhdpi and fr config splits', 'Only the base APK'], a: 1, why: 'Play picks the splits that match the device configuration and installs them together.' },
          { q: 'What is a dynamic feature module good for?', options: ['Code most users don\u2019t need at install, like a rarely used scanner', 'Making every screen load faster', 'Replacing Gradle modules'], a: 0, why: 'Delivering it on demand keeps the first download small. Users who never open it never download it.' },
          { q: 'Your app has an in-app language picker. Why might you turn off the language split?', options: ['Language splits are not allowed with pickers', 'The phone only gets its system languages, so other languages would be missing until downloaded', 'It makes the app smaller'], a: 1, why: 'With language splits on, only device languages install. Turn the split off, or request extra languages with SplitInstallManager.' },
          { q: 'You run bundletool build-apks, then <code>adb install</code> only the base APK on a recent Android phone. What usually happens?', options: ['The install is refused with <code>INSTALL_FAILED_MISSING_SPLIT</code>', 'It installs and works, because the base has everything', 'adb installs the missing splits automatically'], a: 0, why: 'The base declares that it needs its splits. Use <code>bundletool install-apks</code> so the matching splits go in together, or build a universal APK for testers.' },
          { q: 'An AR mode works only on phones with ARCore support. How should its dynamic feature module ship?', options: ['Install-time for everyone, so it is always there', 'Conditional delivery on the AR device feature, with on-demand as a fallback', 'Put it in :app, since dynamic features are deprecated'], a: 1, why: 'Conditional delivery installs the module only on phones that match, so others never download it. On-demand covers the case where a user needs it later.' },
        ],
        deeper: [
          {
            title: 'Install a bundle the way Play does',
            body: `<p>A phone can’t install an <code>.aab</code>. To test what users get, let bundletool do Play’s job. <code>build-apks</code> cuts the bundle into an <code>.apks</code> archive, and <code>install-apks</code> picks the splits that match the connected phone and installs them together.</p>
<p>Copying only the base APK breaks things. On recent Android versions the install is usually refused with <code>INSTALL_FAILED_MISSING_SPLIT</code>, because the base declares that it needs its splits. Where it does install, the app crashes the first time it needs a native library or a resource that lived in a missing split. For testers who sideload, build one universal APK with <code>--mode=universal</code>.</p>`,
            code: `$ bundletool build-apks --bundle=app-release.aab --output=app.apks \\
    --ks=upload.jks --ks-key-alias=upload
$ bundletool install-apks --apks=app.apks      # picks splits for the connected phone

# one APK with everything, for sideloading testers
$ bundletool build-apks --bundle=app-release.aab --output=universal.apks --mode=universal`,
            visual(el) {
              let modern = true, inst = null, busy = false;
              const files = h('div', { class: 'bd-files', 'aria-live': 'polite' }, h('div', { class: 'bd-file' }, h('span', {}, 'nothing installed'), h('span', {}, '')));
              const o = out('Pick how to install on this arm64, xxhdpi, French-language phone.');
              const verBtns = [['Android 15', true], ['Android 9', false]].map(([t, v]) => h('button', { class: 'bd-opt', 'aria-pressed': String(v === modern), onclick() {
                if (busy) return;
                modern = v; verBtns.forEach(b => b.setAttribute('aria-pressed', String(b.textContent === t))); clear();
                say(o, `Phone switched to ${t}. Nothing installed.`);
              } }, t));
              const clear = () => { inst = null; files.replaceChildren(h('div', { class: 'bd-file' }, h('span', {}, 'nothing installed'), h('span', {}, ''))); };
              const SETS = {
                base: [['base-master.apk', '8.2 MB']],
                apks: [['base-master.apk', '8.2 MB'], ['base-arm64_v8a.apk', '5.6 MB'], ['base-xxhdpi.apk', '1.3 MB'], ['base-fr.apk', '0.1 MB']],
                uni: [['universal.apk', '31.4 MB']],
              };
              async function install(kind) {
                if (busy) return; busy = true;
                files.replaceChildren(); inst = null;
                say(o, '<span class="muted">installing…</span>');
                await sleep(400); if (!el.isConnected) return;
                if (kind === 'base' && modern) {
                  files.append(h('div', { class: 'bd-file bd-d2-bad drop-in' }, h('span', {}, 'base-master.apk'), h('span', {}, 'refused')));
                  say(o, '<span class="bad">Failure [INSTALL_FAILED_MISSING_SPLIT]</span> The base APK says it needs config splits that were not in the session.');
                  busy = false; return;
                }
                for (const [n, s] of SETS[kind]) {
                  files.append(h('div', { class: 'bd-file drop-in' }, h('span', {}, n), h('span', {}, s)));
                  await sleep(240); if (!el.isConnected) return;
                }
                inst = kind;
                say(o, kind === 'base' ? '<span class="bad">Installed, but incomplete.</span> Android 9 does not check for required splits. Open the app.' : `<span class="good">Installed.</span> ${kind === 'apks' ? 'Base plus the three splits this phone needs, 15.2 MB.' : 'One file with every ABI, density and language.'}`);
                busy = false;
              }
              const open = (what) => () => {
                if (busy) return;
                if (!inst) { say(o, 'Nothing is installed yet.'); return; }
                if (inst === 'base') {
                  replay(files, 'shake');
                  say(o, what === 'ui'
                    ? '<span class="bad">Resources$NotFoundException:</span> Drawable com.example.news:drawable/header. Its PNGs live in the density split.'
                    : '<span class="bad">UnsatisfiedLinkError:</span> dlopen failed: library "libfilters.so" not found. It lives in the ABI split.');
                  return;
                }
                replay(files, 'pop');
                say(o, what === 'ui' ? '<span class="good">Home screen drawn</span> with the xxhdpi header image.' : '<span class="good">Filters on.</span> libfilters.so loaded from the arm64-v8a split.');
              };
              el.append(
                h('div', { class: 'bd-pick', role: 'group', 'aria-label': 'Phone' }, lbl('Phone'), verBtns),
                h('div', { class: 'controls' },
                  cmd('adb install base-master.apk', () => install('base')),
                  cmd('bundletool install-apks --apks=app.apks', () => install('apks')),
                  cmd('adb install universal.apk', () => install('uni'))),
                files,
                h('div', { class: 'controls' }, act('Open the home screen', open('ui')), act('Turn on photo filters (native code)', open('so'))),
                o);
            },
          },
          {
            title: 'Choose how each feature module ships',
            body: `<p>A dynamic feature module declares its delivery in its own manifest. Install-time delivery ships it with the app. On-demand delivery waits until the app calls <code>SplitInstallManager</code>. Conditional delivery installs it at install time only on phones that match conditions such as a minimum API level, a hardware feature or the user’s country.</p>
<p>Pick by audience. A scanner that few users open fits on-demand. An AR mode that needs ARCore hardware fits conditional delivery, with on-demand as a fallback. A large module that everyone uses gains nothing from being dynamic.</p>`,
            code: `<!-- feature/ar/src/main/AndroidManifest.xml -->
<manifest xmlns:dist="http://schemas.android.com/apk/distribution">
    <dist:module dist:title="@string/title_ar">
        <dist:delivery>
            <dist:install-time>
                <dist:conditions>
                    <dist:device-feature dist:name="android.hardware.camera.ar" />
                    <dist:min-sdk dist:value="28" />
                </dist:conditions>
            </dist:install-time>
            <dist:on-demand />
        </dist:delivery>
        <dist:fusing dist:include="true" />
    </dist:module>
</manifest>`,
            visual(el) {
              const DEV = [
                { id: 'pixel', label: 'Android 16, ARCore', api: 36, ar: true },
                { id: 'mid', label: 'Android 9, no ARCore', api: 28, ar: false },
                { id: 'old', label: 'Android 8.1, ARCore', api: 27, ar: true },
              ];
              const MODS = [
                { id: 'reader', name: ':feature:reader', mode: 'install-time', mb: 2.0 },
                { id: 'scanner', name: ':feature:scanner', mode: 'on-demand', mb: 5.5 },
                { id: 'ar', name: ':feature:ar', mode: 'camera.ar and API 28+, else on-demand', mb: 9.1 },
              ];
              let dev = DEV[0], have = new Set(), busy = false, mb = 0;
              const cards = {};
              const grid = h('div', { class: 'bd-grid' }, MODS.map(m => {
                const st = h('span', { class: 'bd-d2-tag' }, 'not on phone');
                const c = h('div', { class: 'bd-card bd-d2-mod' }, h('b', { class: 'bd-d2-mono' }, m.name), h('small', { class: 'bd-d2-small' }, m.mode), st);
                cards[m.id] = { c, st };
                return c;
              }));
              const size = h('span', { class: 'bd-count' });
              const o = out('Pick a phone and install the app from Play.');
              const paint = () => {
                MODS.forEach(m => { const x = cards[m.id]; const on = have.has(m.id); x.c.classList.toggle('bd-d2-here', on); x.st.textContent = on ? 'installed' : 'not on phone'; });
                size.textContent = `on phone: ${(8.2 + mb).toFixed(1)} MB`;
              };
              const devBtns = DEV.map(d => h('button', { class: 'bd-opt', 'aria-pressed': String(d === dev), onclick() {
                if (busy) return;
                dev = d; devBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(DEV[i] === d)));
                have = new Set(); mb = 0; paint(); say(o, 'New phone. Install from Play.');
              } }, d.label));
              const add = async id => {
                const m = MODS.find(x => x.id === id);
                have.add(id); mb += m.mb; paint(); replay(cards[id].c, 'pop');
                await sleep(380); return el.isConnected;
              };
              async function install() {
                if (busy) return; busy = true;
                have = new Set(); mb = 0; paint();
                say(o, '<span class="muted">Play builds the splits for this phone…</span>');
                await sleep(400); if (!el.isConnected) return;
                if (!await add('reader')) return;
                const arOk = dev.ar && dev.api >= 28;
                if (arOk && !await add('ar')) return;
                say(o, arOk ? '<span class="good">Installed</span> base, reader and AR. This phone meets both AR conditions.'
                  : `<span class="good">Installed</span> base and reader. AR stayed out: ${!dev.ar ? 'no ARCore support' : 'API ' + dev.api + ' is below 28'}.`);
                busy = false;
              }
              const open = id => async () => {
                if (busy) return;
                if (!have.has('reader')) { say(o, 'Install the app first.'); return; }
                if (have.has(id)) { replay(cards[id].c, 'pop'); say(o, 'Already on the phone. It opens at once.'); return; }
                if (id === 'ar' && !(dev.ar && dev.api >= 28)) { replay(cards.ar.c, 'shake'); say(o, 'This phone can’t run the AR mode. Check support first and hide the entry, even though on-demand could download it.'); return; }
                busy = true;
                say(o, `${hl('manager.startInstall(request)')} <span class="muted">· downloading ${MODS.find(x => x.id === id).name}</span>`);
                await sleep(500); if (!el.isConnected) return;
                if (!await add(id)) return;
                say(o, `<span class="good">Downloaded on demand.</span> Users who never open it never pay for these ${MODS.find(x => x.id === id).mb} MB.`);
                busy = false;
              };
              paint();
              el.append(
                h('div', { class: 'bd-pick', role: 'group', 'aria-label': 'Phone' }, lbl('Phone'), devBtns),
                grid,
                h('div', { class: 'controls' }, act('Install from Play', install), act('Open the scanner', open('scanner')), act('Open AR mode', open('ar')), size),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>An <code>.aab</code> is a zip with one folder per module, such as <code>base/</code> and <code>scanner/</code>. Each holds <code>dex/</code>, <code>lib/</code>, <code>assets/</code> and <code>res/</code>, plus a manifest and a resource table stored as protocol buffers instead of the binary XML phones read. That format lets bundletool rebuild a separate resource table for each split. <code>BundleConfig.pb</code> records build settings such as which splits to make.</p>
<p>On the phone, all splits go in through one <code>PackageInstaller</code> session and sit side by side in the app’s folder. The class loader and the resource system treat them as one app.</p>`,
          code: `$ unzip -l app-release.aab        # names only
BundleConfig.pb
base/manifest/AndroidManifest.xml
base/dex/classes.dex
base/lib/arm64-v8a/libfilters.so
base/res/drawable-xxhdpi/header.png
base/resources.pb
scanner/manifest/AndroidManifest.xml
scanner/dex/classes.dex

$ adb shell pm path com.example.news
package:/data/app/~~Xk2…/com.example.news-9fA…/base.apk
package:/data/app/~~Xk2…/com.example.news-9fA…/split_config.arm64_v8a.apk
package:/data/app/~~Xk2…/com.example.news-9fA…/split_config.fr.apk
package:/data/app/~~Xk2…/com.example.news-9fA…/split_config.xxhdpi.apk`,
        },
        mistakes: [
          {
            title: 'Sending testers the .aab',
            bad: `$ adb install app/build/outputs/bundle/release/app-release.aab
# fails: a phone can't install a bundle`,
            good: `$ bundletool build-apks --bundle=app-release.aab --output=app.apks --connected-device
$ bundletool install-apks --apks=app.apks
# or upload it to Play internal app sharing and send the link`,
            why: 'An <code>.aab</code> is a publishing format. Let bundletool or Play cut it into APKs, so testers get the same splits that users will.',
          },
          {
            title: 'Opening a feature before its module arrives',
            bad: `manager.startInstall(request)
startActivity(Intent().setClassName(packageName, "com.example.scanner.ScanActivity"))`,
            good: `manager.registerListener { state ->
    if (state.status() == SplitInstallSessionStatus.INSTALLED && "scanner" in state.moduleNames()) {
        startActivity(Intent().setClassName(packageName, "com.example.scanner.ScanActivity"))
    }
}
manager.startInstall(request)

// In ScanActivity
override fun attachBaseContext(newBase: Context) {
    super.attachBaseContext(newBase)
    SplitCompat.installActivity(this)
}`,
            why: '<code>startInstall</code> only starts a download. Until it finishes, the class is not on the phone and the start crashes. Wait for <code>INSTALLED</code>, and call <code>SplitCompat.installActivity</code> so new code and resources are visible without a restart.',
          },
          {
            title: 'Depending on a feature module from :app',
            bad: `// app/build.gradle.kts
dependencies {
    implementation(project(":feature:scanner"))
}`,
            good: `// app/build.gradle.kts
android { dynamicFeatures += setOf(":feature:scanner") }

// :app reaches the feature through an interface it owns
val scanner = Class.forName("com.example.scanner.ScannerEntry")
    .getDeclaredConstructor().newInstance() as ScannerApi   // keep ScannerEntry in R8 rules`,
            why: 'A dynamic feature already depends on <code>:app</code>, so the reverse dependency is a cycle and Gradle fails. :app can’t see feature classes at compile time. Reach them by name, through an interface :app defines.',
          },
        ],
        predict: {
          q: "Play builds the APKs for one phone from your bundle. Compared with a universal APK, the download is…",
          options: ["About the same size", "Much smaller: one ABI, one density and only the phone’s languages", "Bigger, because of the split overhead"],
          a: 1,
          why: "A universal APK carries every ABI, density and language. The splits carry only what this phone needs.",
        },
        visual(el) {
          const ABI = { arm64_v8a: 5.6, x86_64: 6.0, armeabi_v7a: 4.1 };
          const DPI = { hdpi: 0.7, xxhdpi: 1.3 };
          const LANGS = ['en', 'fr', 'de'];
          const BASE = 8.2, LANG = 0.06, UNI = 31.4;
          let abi = 'arm64_v8a', dpi = 'xxhdpi', busy = false, scanner = false, total = 0;
          const langs = new Set(['fr']);
          const files = h('div', { class: 'bd-files', 'aria-live': 'polite' });
          const fmt = n => n.toFixed(1) + ' MB';
          const meter = (cls = '') => { const fill = h('span'); return Object.assign(h('div', { class: 'bd-meter ' + cls }, fill), { fill }); };
          const mPhone = meter(), mUni = meter('bd-uni');
          const nPhone = h('span', {}, '0.0 MB');
          const o = out('');
          const setTotal = t => { total = t; mPhone.fill.style.width = `${Math.min(100, (t / UNI) * 100)}%`; nPhone.textContent = fmt(t); };
          const fileRow = (n, s, feat) => h('div', { class: 'bd-file drop-in' + (feat ? ' bd-feat' : '') }, h('span', {}, n), h('span', {}, fmt(s)));
          async function install(anim) {
            if (busy) return; busy = true; scanner = false;
            files.replaceChildren(); setTotal(0);
            const list = [['base-master.apk', BASE], [`base-${abi}.apk`, ABI[abi]], [`base-${dpi}.apk`, DPI[dpi]], ...LANGS.filter(l => langs.has(l)).map(l => [`base-${l}.apk`, LANG])];
            let t = 0;
            for (const [n, s] of list) {
              files.append(fileRow(n, s)); t += s; setTotal(t);
              if (anim) { await sleep(360); if (!el.isConnected) return; }
            }
            say(o, `Play sent ${list.length} split APKs, ${fmt(t)}. A universal APK would be ${fmt(UNI)}.`);
            busy = false;
          }
          async function feature() {
            if (busy) return;
            if (scanner) { say(o, 'The scanner module is already installed.'); return; }
            busy = true; scanner = true;
            say(o, hl('manager.startInstall(request)') + ' <span class="muted">· downloading scanner</span>');
            const add = [['scanner-master.apk', 2.4], [`scanner-${abi}.apk`, 3.1]];
            for (const [n, s] of add) { await sleep(450); if (!el.isConnected) return; files.append(fileRow(n, s, true)); setTotal(total + s); }
            say(o, '<span class="good">Installed on demand.</span> Users who never scan never download these 5.5 MB.');
            busy = false;
          }
          const group = (label, keys, isOn, onPick, show = k => k) => {
            const btns = keys.map(k => h('button', { class: 'bd-opt', 'aria-pressed': String(isOn(k)), onclick() {
              if (busy) return;
              onPick(k); btns.forEach((b, i) => b.setAttribute('aria-pressed', String(isOn(keys[i]))));
              files.replaceChildren(); setTotal(0); scanner = false;
              say(o, 'Device changed. Install again to see what this phone gets.');
            } }, show(k)));
            return h('div', { class: 'bd-pick', role: 'group', 'aria-label': label }, lbl(label), btns);
          };
          mUni.fill.style.width = '100%';
          el.append(
            h('div', { class: 'bd-picks' },
              group('ABI', Object.keys(ABI), k => k === abi, k => { abi = k; }, k => k.replace(/_/g, '-')),
              group('Density', Object.keys(DPI), k => k === dpi, k => { dpi = k; }),
              group('Language', LANGS, k => langs.has(k), k => { if (langs.has(k) && langs.size > 1) langs.delete(k); else langs.add(k); })),
            h('div', { class: 'controls' }, act('Install from Play', () => install(true)), act('Open the scanner', feature)),
            files,
            h('div', { class: 'bd-size' }, h('span', {}, 'This phone'), mPhone, nPhone),
            h('div', { class: 'bd-size' }, h('span', {}, 'Universal'), mUni, h('span', {}, fmt(UNI))),
            o);
          install(false);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'tracks',
        title: 'Play Console release tracks',
        tagline: 'Internal to production, staged rollouts, halting, and versionCode rules.',
        level: 'advanced',
        body: `
<p>Play Console has four kinds of release tracks. Internal testing reaches up to 100 testers within minutes. Closed testing goes to testers you invite by email list or Google Group. Open testing lets anyone join from your store listing. Production reaches everyone. New personal developer accounts must run a closed test with at least 12 testers for 14 days before they can apply for production.</p>
<p>In production, use a staged rollout. Release to a small share of users, watch crashes and ANRs in Android vitals, then raise the percentage. If something breaks, halt the rollout. New users stop getting the update, but people who already installed it keep it. Play can\u2019t downgrade them.</p>
<p>So the fix is always a new release with a higher <code>versionCode</code>. Each upload needs a versionCode this app has never used, and an update only reaches users who have a lower one. In practice, increase it on every build you upload. The maximum is 2100000000. <code>versionName</code> is only the label users see.</p>`,
        code: `// app/build.gradle.kts
android {
    defaultConfig {
        // From CI: a build number that only goes up
        versionCode = providers.environmentVariable("CI_BUILD_NUMBER")
            .map { it.toInt() }
            .getOrElse(1)
        versionName = "2.5.1"   // what users see in the store
    }
}

// Release path for versionCode 251
// 1. Internal testing: up to 100 testers, minutes after upload
// 2. Closed testing: invited testers or Google Groups
// 3. Production, staged: 5% -> watch Android vitals -> 20% -> 50% -> 100%
// Crash spike at 20%? Halt. Users on 251 keep it.
// Ship versionCode 252 with the fix and roll it out again.`,
        remember: 'Roll out in stages, halt on a spike, fix forward. You can\u2019t roll back, so versionCode only goes up.',
        terms: [
          { term: 'Release track', def: 'A Play Console channel, such as internal, closed, open or production, that decides which users can install a given release.' },
          { term: 'Staged rollout', def: 'A production release that Play offers to a chosen percentage of users, which you raise step by step.' },
          { term: 'Halted rollout', def: 'A staged rollout you stopped in Play Console, so no new users get it while existing installs keep it.' },
          { term: 'versionCode', def: 'A positive integer, at most 2100000000, that orders app versions; each upload needs a new one and updates need a higher one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Derive the code from the version parts so it always grows. 2.5.1 becomes 20501.', code: 'val major = 2\nval minor = 5\nval patch = 1\nandroid {\n    defaultConfig {\n        [[versionCode]] = major * 10_000 + minor * 100 + [[patch]]\n        versionName = "2.5.1"\n    }\n}', why: 'Each part gets its own digits, so any higher version gives a higher <code>versionCode</code>, as long as minor and patch stay below 100.' },
          { type: 'bug', prompt: 'Play rejects some uploads and others end up lower than the last release. Tap the wrong line.', code: 'android {\n    defaultConfig {\n        applicationId = "com.example.news"\n        versionCode = System.currentTimeMillis().toInt()\n        versionName = "2.5.1"\n    }\n}', bug: 3, fix: '        versionCode = providers.environmentVariable("CI_BUILD_NUMBER").get().toInt()', why: 'Milliseconds since 1970 do not fit in an Int. <code>toInt()</code> keeps the low 32 bits, so the result jumps around and can be negative. Use a counter that only goes up, such as the CI build number.' },
        ],
        quiz: [
          { q: 'Your rollout is at 20% and crashes spike. You halt it. What happens to the 20%?', options: ['Play rolls them back to the previous version', 'They keep the new version; only new users stop getting it', 'Their app is uninstalled'], a: 1, why: 'Play never downgrades installed apps. Halting only stops further distribution, so you fix forward.' },
          { q: 'You try to upload a fix with the same <code>versionCode</code> as the halted release. What does Play say?', options: ['It replaces the halted release', 'Version code has already been used', 'It accepts it on a test track only'], a: 1, why: 'Every upload needs a versionCode the app has never used. Bump it.' },
          { q: 'Which track gets a build to up to 100 testers fastest?', options: ['Internal testing', 'Open testing', 'Production at 1%'], a: 0, why: 'Internal testing is meant for quick team checks and is usually available within minutes.' },
          { q: 'Production is on versionCode 251. You publish 249 to closed testing. Who gets 249?', options: ['Closed testers', 'Nobody, because every tester is also eligible for production’s higher 251', 'Everyone, because the newest upload wins'], a: 1, why: 'Play gives each user the highest versionCode across all tracks they are eligible for. Testers already get 251, so a lower test build reaches no one.' },
          { q: 'You compute <code>versionCode = major * 100 + minor * 10 + patch</code>. Which two versions get the same code?', options: ['1.2.3 and 1.3.2', '2.9.0 and 2.9.1', '2.10.0 and 3.0.0'], a: 2, why: '2.10.0 gives 200 + 100 + 0 = 300, the same as 3.0.0. A part above 9 spills into the next digit, so Play refuses the second upload or orders releases wrongly.' },
          { q: 'You start a flexible in-app update. It finishes downloading, but users stay on the old version for days. What is missing?', options: ['A call to <code>completeUpdate()</code>, usually after the user taps Restart', 'A higher update priority in Play Console', 'Nothing, Play installs it on the next reboot'], a: 0, why: 'A flexible update downloads and then waits. Play does not restart the app for it, so the app must ask the user and call completeUpdate().' },
        ],
        deeper: [
          {
            title: 'Who gets which release',
            body: `<p>Tracks overlap. Everyone is eligible for production, and testers are also eligible for the test tracks they joined. Play gives each user the highest versionCode published across all tracks they are eligible for. A closed tester gets 260 from closed testing while production is still on 251.</p>
<p>Two consequences follow. A test release with a lower versionCode than production reaches nobody, because its testers already get the higher production build. And users who opt into internal testing aren’t eligible for closed or open testing, so they only see internal and production.</p>`,
            visual(el) {
              const TR = ['internal', 'closed', 'open', 'production'];
              const START = { internal: 262, closed: 260, open: null, production: 251 };
              let tv = { ...START };
              const USERS = [
                { name: 'Everyone else', tracks: ['production'] },
                { name: 'Open tester', tracks: ['open', 'production'] },
                { name: 'Closed tester', tracks: ['closed', 'production'] },
                { name: 'Internal tester', tracks: ['internal', 'production'] },
              ];
              const trk = {};
              const trow = h('div', { class: 'bd-tracks' }, TR.map(t => (trk[t] = h('span', { class: 'bd-trk' }))));
              const ucards = USERS.map(u => {
                const v = h('span', { class: 'bd-d2-big' });
                const from = h('small', { class: 'bd-d2-small' });
                return { u, v, from, c: h('div', { class: 'bd-card bd-d2-user' }, h('b', {}, u.name), v, from) };
              });
              const o = out('Each user gets the highest versionCode among their tracks.');
              const paint = changed => {
                TR.forEach(t => { trk[t].textContent = `${t}: ${tv[t] ?? 'none'}`; trk[t].className = 'bd-trk' + (tv[t] ? ' bd-on' : ''); });
                ucards.forEach(x => {
                  const best = x.u.tracks.filter(t => tv[t]).sort((a, b) => tv[b] - tv[a])[0];
                  const old = x.v.textContent;
                  x.v.textContent = String(tv[best]);
                  x.from.textContent = `from ${best}`;
                  if (changed && old !== x.v.textContent) replay(x.c, 'pop');
                });
              };
              const action = (label, fn) => act(label, () => { const msg = fn(); paint(true); say(o, msg); });
              paint();
              el.append(
                trow,
                h('div', { class: 'bd-grid bd-d2-users' }, ucards.map(x => x.c)),
                h('div', { class: 'controls' },
                  action('Publish 250 to open', () => { tv.open = 250; return `<span class="bad">Open testers still get ${tv.production}.</span> 250 is lower than production, so nobody receives it.`; }),
                  action('Promote 260 to production', () => { tv.production = 260; return '<span class="good">Production is on 260.</span> Open testers jump to it too. Internal testers still get 262.'; }),
                  action('Publish 263 to internal', () => { tv.internal = 263; return 'Only internal testers move to 263. Nobody else is eligible for that track.'; }),
                  act('Start over', () => { tv = { ...START }; paint(true); say(o, 'Back to the start.'); })),
                o);
            },
          },
          {
            title: 'A 1% rollout is a small sample',
            body: `<p>Staged rollouts trade speed for safety. At 1%, a crash that hits one user in 200 shows up only a handful of times a day, and day-to-day noise can hide a real regression or invent one. At 20% the rate settles. So early stages catch the loud crashes, and you wait at each stage until there is enough data.</p>
<p>Compare the new release with the previous one on the same kind of devices, not with zero. Android vitals reports user-perceived crash and ANR rates per release, and flags apps that pass its bad-behavior thresholds.</p>`,
            visual(el) {
              const DAU = 200000, BASE = 0.004, MAX = 0.012;
              let pct = 1, bad = true, days = 0;
              const z = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
              const pos = r => `${Math.max(0, Math.min(100, (r / MAX) * 100))}%`;
              const band = h('span', { class: 'bd-d2-band' }), pt = h('span', { class: 'bd-d2-pt' });
              const scale = h('div', { class: 'bd-d2-scale', 'aria-hidden': 'true' }, h('span', { class: 'bd-d2-base', style: `left:${pos(BASE)}` }), band, pt);
              const ticks = h('div', { class: 'bd-d2-ticks', 'aria-hidden': 'true' }, ['0%', '0.4% (250)', '0.8%', '1.2%'].map(t => h('span', {}, t)));
              const stat = h('span', { class: 'bd-count' });
              const o = out('Pick a stage and simulate a day of data.');
              const pick = (items, get, set) => items.map(([k, t]) => {
                const b = h('button', { class: 'bd-opt', 'aria-pressed': String(get() === k), onclick() { set(k); b.parentNode.querySelectorAll('.bd-opt').forEach((x, i) => x.setAttribute('aria-pressed', String(items[i][0] === get()))); band.style.opacity = '0'; pt.style.opacity = '0'; days = 0; say(o, 'Changed. Simulate a day.'); } }, t);
                return b;
              });
              function day() {
                const n = Math.round(DAU * pct / 100), p = bad ? 0.006 : BASE;
                const k = Math.max(0, Math.round(n * p + Math.sqrt(n * p * (1 - p)) * z()));
                const r = k / n, half = 1.96 * Math.sqrt(Math.max(r, 1 / n) * (1 - r) / n);
                days++;
                band.style.left = pos(r - half); band.style.width = `calc(${pos(r + half)} - ${pos(r - half)})`;
                pt.style.left = pos(r); pt.style.opacity = '1'; band.style.opacity = '1'; replay(pt, 'pop');
                stat.textContent = `day ${days} · ${n.toLocaleString('en-US')} users · ${k} crashed · ${(r * 100).toFixed(2)}%`;
                const lo = r - half;
                say(o, lo > BASE
                  ? `<span class="bad">Clearly worse than 250.</span> Even the low end, ${(lo * 100).toFixed(2)}%, is above 0.40%. Halt.`
                  : r + half < BASE ? '<span class="good">Clearly not worse.</span>'
                  : `<span class="muted">Can’t tell yet.</span> The range ${(Math.max(0, lo) * 100).toFixed(2)}% to ${((r + half) * 100).toFixed(2)}% includes 250’s 0.40%. ${pct < 20 ? 'Wait, or the next stage will tell.' : ''}`);
              }
              el.append(
                h('div', { class: 'bd-pick', role: 'group', 'aria-label': 'Rollout' }, lbl('Rollout'), pick([[1, '1%'], [5, '5%'], [20, '20%'], [50, '50%']], () => pct, v => { pct = v; })),
                h('div', { class: 'bd-pick', role: 'group', 'aria-label': 'Release 251' }, lbl('251 is'), pick([[true, 'regressed: 0.60%'], [false, 'healthy: 0.40%']], () => bad, v => { bad = v; })),
                h('div', { class: 'bd-d2-chart' }, scale, ticks),
                h('div', { class: 'controls' }, act('Simulate a day', day), stat),
                o);
            },
          },
          {
            title: 'Tell users about the update in the app',
            body: `<p>A rollout only offers the update. Users with auto-update off can stay on an old version for months. The Play In-App Updates library checks for a newer release and shows Google Play’s update flow inside your app. A flexible update downloads in the background while the user keeps working. An immediate update blocks the app until it is installed.</p>
<p>Pick the flow per release with an update priority from 0 to 5. You set it when you create the release through the Google Play Developer API. Play Console has no field for it.</p>`,
            code: `val updates = AppUpdateManagerFactory.create(context)

updates.appUpdateInfo.addOnSuccessListener { info ->
    if (info.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE) return@addOnSuccessListener
    val type = if (info.updatePriority() >= 4) AppUpdateType.IMMEDIATE else AppUpdateType.FLEXIBLE
    if (info.isUpdateTypeAllowed(type)) {
        updates.startUpdateFlowForResult(info, updateLauncher, AppUpdateOptions.newBuilder(type).build())
    }
}

// val updateLauncher = registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { … }`,
          },
        ],
        underHood: {
          body: `<p>Play’s rules sit on top of a rule in Android itself. The package manager refuses an update whose versionCode is lower than the installed one, with <code>INSTALL_FAILED_VERSION_DOWNGRADE</code>. <code>adb install -d</code> allows a downgrade only for debuggable apps on a normal phone, so not even you can roll a user back to an older release build.</p>
<p>versionCode is a 32-bit int in the manifest, and Play caps it at 2100000000. Since API 28, <code>PackageInfo.longVersionCode</code> combines it with an optional <code>versionCodeMajor</code> in the upper 32 bits. Play compares versionCode.</p>`,
          code: `$ adb install -r app-250.apk         # 251 is installed
adb: failed to install app-250.apk: Failure [INSTALL_FAILED_VERSION_DOWNGRADE: …]

val info = packageManager.getPackageInfo(packageName, 0)
val code: Long = PackageInfoCompat.getLongVersionCode(info)`,
        },
        mistakes: [
          {
            title: 'Packing version parts into too few digits',
            bad: `versionCode = major * 100 + minor * 10 + patch
// 2.10.0 -> 300, 2.9.10 -> 300, 3.0.0 -> 300`,
            good: `// one counter that only goes up, from CI
versionCode = providers.environmentVariable("CI_BUILD_NUMBER").map(String::toInt).get()
versionName = "$major.$minor.$patch"`,
            why: 'A part above 9 spills into the next digit, so different versions get the same code. Play then refuses the second upload, or a hotfix sorts below the release it should replace.',
          },
          {
            title: 'Not resuming an immediate update',
            bad: `override fun onResume() {
    super.onResume()
    // nothing: the user left during an immediate update and came back
}`,
            good: `override fun onResume() {
    super.onResume()
    updates.appUpdateInfo.addOnSuccessListener { info ->
        if (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
            updates.startUpdateFlowForResult(info, updateLauncher,
                AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build())
        }
    }
}`,
            why: 'An immediate update keeps running if the user leaves the app. When they come back, resume the flow. Otherwise they use the old version while the update sits half done.',
          },
          {
            title: 'Never finishing a flexible update',
            bad: `updates.startUpdateFlowForResult(info, updateLauncher,
    AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build())
// and nothing else`,
            good: `updates.registerListener { state ->
    if (state.installStatus() == InstallStatus.DOWNLOADED) {
        showSnackbar("Update ready", action = "Restart") { updates.completeUpdate() }
    }
}`,
            why: 'A flexible update downloads in the background, then waits. Play does not restart your app for it. Ask the user, then call <code>completeUpdate()</code> to install.',
          },
        ],
        predict: {
          q: "Version 251 is at 20% of production. You raise the rollout to 50%. Who gets 251 next?",
          options: ["A new random half of all users, and some of the first 20% lose it", "The same 20% plus more users; nobody who has it loses it", "Only people who install the app for the first time"],
          a: 1,
          why: "A staged rollout only grows the group. Play never downgrades users who already updated.",
        },
        visual(el) {
          const TR = ['Internal', 'Closed', 'Open', 'Production'];
          const MSG = [
            'Internal testing: up to 100 testers, available within minutes.',
            'Closed testing: invited testers or Google Groups. New personal accounts need 12 testers for 14 days.',
            'Open testing: anyone can join from the store listing.',
            'Production. Pick a rollout percentage.',
          ];
          let stage = 0, p250 = 0, p251 = 0, rel = 250, halted = false, crash = false, busy = false;
          const rank = i => (i * 37) % 100;
          const trk = TR.map(t => h('span', { class: 'bd-trk' }, t));
          const dots = Array.from({ length: 100 }, () => h('span', { class: 'bd-dot' }));
          const stat = h('span', { class: 'bd-count' });
          const card = h('span', { class: 'bd-mod' });
          const o = out(MSG[0]);
          function paint() {
            trk.forEach((t, i) => { t.className = 'bd-trk' + (i === stage ? ' bd-on' : i < stage ? ' bd-past' : ''); });
            let n0 = 0, n1 = 0, n2 = 0;
            dots.forEach((d, i) => {
              const r = rank(i);
              if (r < p251) { d.className = 'bd-dot bd-v2'; n2++; }
              else if (r < p250) { d.className = 'bd-dot ' + (crash && r % 3 === 0 ? 'bd-crash' : 'bd-v1'); n1++; }
              else { d.className = 'bd-dot'; n0++; }
            });
            stat.textContent = `240: ${n0} · 250: ${n1} · 251: ${n2}`;
            const p = rel === 250 ? p250 : p251;
            card.textContent = `release ${rel} · ${stage < 3 ? TR[stage].toLowerCase() : halted ? 'halted at ' + p + '%' : p + '%'}`;
          }
          const promote = act('Promote to next track', () => {
            if (busy) return;
            if (stage === 3) { say(o, 'Already in production. Use the rollout percentages.'); return; }
            stage++; paint(); replay(trk[stage], 'pop');
            say(o, MSG[stage]);
          });
          const roll = pct => () => {
            if (busy) return;
            if (stage < 3) { say(o, 'Staged rollouts happen on production. Promote the release first.'); replay(promote, 'shake'); return; }
            if (rel === 250 && halted) { say(o, 'Release 250 is halted. Resume it, or upload a fix.'); return; }
            const cur = rel === 250 ? p250 : p251;
            if (pct <= cur) { say(o, `Already at ${cur}%. A staged rollout only goes up.`); return; }
            if (rel === 250) p250 = pct; else p251 = pct;
            paint();
            say(o, pct === 100 ? `<span class="good">Rollout complete.</span> Every user can update to ${rel}.` : `Rolling ${rel} out to ${pct}% of users. Watch Android vitals before going higher.`);
          };
          const spike = act('Crashes spike', () => {
            if (busy) return;
            if (rel !== 250 || !p250) { say(o, 'Roll release 250 out to some users first.'); return; }
            crash = true; paint(); dots.forEach(d => { if (d.classList.contains('bd-crash')) replay(d, 'pop'); });
            say(o, '<span class="bad">Android vitals:</span> crash rate is up for 250. Halt the rollout.');
          });
          const halt = act('Halt rollout', () => {
            if (busy) return;
            if (rel !== 250 || !p250 || p250 === 100) { say(o, rel !== 250 ? 'Release 251 is healthy. Nothing to halt.' : 'Only an active staged rollout can be halted.'); return; }
            halted = !halted; halt.textContent = halted ? 'Resume rollout' : 'Halt rollout'; paint();
            say(o, halted ? `<span class="bad">Halted.</span> No new users get 250. The ${p250}% who already updated keep it. Play can\u2019t downgrade them.` : 'Resumed. New users get 250 again.');
          });
          const up250 = act('Upload versionCode 250', () => {
            if (busy) return;
            replay(up250, 'shake');
            say(o, '<span class="bad">Version code 250 has already been used.</span> Try another version code.');
          });
          const up251 = act('Upload versionCode 251', async () => {
            if (busy) return;
            if (rel === 251) { say(o, '251 is already uploaded. Raise its rollout percentage.'); return; }
            if (stage < 3) { say(o, 'Get 250 to production first, so there is something to fix.'); return; }
            busy = true; say(o, 'Uploading 251 with the fix. Tested on internal first (skipped here).');
            await sleep(700); if (!el.isConnected) return;
            rel = 251; p251 = 5; halted = false; crash = false; halt.textContent = 'Halt rollout';
            paint(); dots.forEach(d => { if (d.classList.contains('bd-v2')) replay(d, 'pop'); });
            say(o, '<span class="good">251 at 5%.</span> It replaces 250 for new users. Raise it as vitals stay clean.');
            busy = false;
          });
          paint();
          el.append(
            h('div', { class: 'bd-tracks' }, trk, card),
            h('div', { class: 'controls' }, promote, ...[1, 5, 20, 50, 100].map(p => act(p + '%', roll(p)))),
            h('div', { class: 'bd-dots', 'aria-label': '100 users' }, dots),
            h('div', { class: 'bd-dkey' }, h('span', {}, h('i'), '240'), h('span', {}, h('i', { class: 'bd-v1' }), '250'), h('span', {}, h('i', { class: 'bd-crash' }), '250, crashing'), h('span', {}, h('i', { class: 'bd-v2' }), '251'), stat),
            h('div', { class: 'controls' }, spike, halt, up250, up251),
            o);
        },
      },
    ],
  });
})();
