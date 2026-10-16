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
          const TASKS = [['mergeDebugResources', 'res'], ['processDebugResources', 'res'], ['compileDebugKotlin', 'kt'], ['dexBuilderDebug', 'kt'], ['mergeDexDebug', 'kt'], ['packageDebug', 'both']];
          let built = false, kt = false, res = false, cached = false, busy = false;
          const ph = (t, d) => { const s = h('small', {}, d); return Object.assign(h('div', { class: 'bd-phase' }, h('b', {}, t), s), { s }); };
          const p1 = ph('1 Initialization', 'Reads settings.gradle.kts to find the projects.');
          const p2 = ph('2 Configuration', 'Runs each build.gradle.kts and builds the task graph.');
          const p3 = ph('3 Execution', 'Runs the needed tasks. Skips the up-to-date ones.');
          const rows = TASKS.map(([n, k]) => { const st = h('span', { class: 'bd-st' }, 'waiting'); return { k, st, row: h('div', { class: 'bd-task' }, h('span', {}, ':app:' + n), st) }; });
          const life = h('div', { class: 'bd-task' }, h('span', {}, ':app:assembleDebug'), h('span', { class: 'bd-st' }, 'lifecycle task'));
          const o = out('Run the build. Then edit a file and run it again.');
          const cc = toggle('bd-cc', 'Configuration cache', function () {
            if (!this.checked) cached = false;
            say(o, this.checked ? 'Configuration cache on. The next build stores the task graph. The one after reuses it.' : 'Configuration cache off. Every build runs every build script again.');
          });
          async function run() {
            if (busy) return; busy = true;
            [p1, p2, p3].forEach(p => p.classList.remove('bd-on', 'bd-skip'));
            rows.forEach(r => { r.st.textContent = 'waiting'; r.st.className = 'bd-st'; });
            say(o, '<span class="muted">$ ./gradlew assembleDebug</span>');
            p1.classList.add('bd-on'); p1.s.textContent = 'settings.gradle.kts: 1 project, :app.';
            await sleep(500); if (!el.isConnected) return;
            p1.classList.remove('bd-on');
            const reuse = cc.input.checked && cached;
            if (reuse) { p2.classList.add('bd-skip'); p2.s.textContent = 'Skipped: reusing the configuration cache.'; await sleep(250); }
            else { p2.classList.add('bd-on'); p2.s.textContent = 'Ran app/build.gradle.kts. Graph: 6 tasks for assembleDebug.'; await sleep(750); p2.classList.remove('bd-on'); }
            if (!el.isConnected) return;
            cached = cc.input.checked;
            p3.classList.add('bd-on'); p3.s.textContent = 'Walking the graph in dependency order.';
            let ran = 0;
            for (const r of rows) {
              const need = !built || (kt && r.k !== 'res') || (res && r.k !== 'kt');
              r.row.classList.add('bd-now'); r.st.textContent = need ? 'running' : 'checking'; r.st.className = 'bd-st bd-busy';
              await sleep(need ? 420 : 160); if (!el.isConnected) return;
              r.row.classList.remove('bd-now');
              r.st.textContent = need ? 'EXECUTED' : 'UP-TO-DATE'; r.st.className = 'bd-st ' + (need ? 'bd-ex' : 'bd-utd');
              ran += need;
            }
            p3.classList.remove('bd-on'); p3.s.textContent = `Ran ${ran} of 6 tasks.`;
            built = true; kt = false; res = false;
            say(o, `<span class="good">BUILD SUCCESSFUL</span> · 6 actionable tasks: ${ran} executed, ${6 - ran} up-to-date${reuse ? ' · configuration cache reused' : ''}`);
            busy = false;
          }
          const edit = (fn, msg) => () => { if (busy) return; fn(); say(o, msg); };
          el.append(
            h('div', { class: 'bd-phases' }, p1, p2, p3),
            h('div', { class: 'bd-tasks', 'aria-label': 'Task graph' }, rows.map(r => r.row), life),
            h('div', { class: 'controls' },
              cmd('./gradlew assembleDebug', run),
              act('Edit MainActivity.kt', edit(() => { kt = true; }, 'MainActivity.kt changed. Kotlin, dex and packaging tasks are now out of date.')),
              act('Edit strings.xml', edit(() => { res = true; }, 'strings.xml changed. Resource and packaging tasks are now out of date.')),
              cmd('./gradlew clean', edit(() => { built = false; }, 'build/ deleted. Every task has to run again.')),
              cc.el),
            o);
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
        ],
        visual(el) {
          let typo = true, ver = '2.7.2', busy = false;
          const nm = () => (typo ? 'runtme' : 'runtime');
          const strLine = h('div', { class: 'bd-line' }), verLine = h('div', { class: 'bd-line' }), tomlLine = h('div', { class: 'bd-line' }), accLine = h('div', { class: 'bd-line' });
          const repos = ['google()', 'mavenCentral()'].map(r => h('span', { class: 'bd-repo' }, r));
          const MODS = [':app', ':core:data', ':feature:news'];
          const mods = MODS.map(() => h('span', { class: 'bd-mod' }));
          const o1 = out('Not synced yet.'), o2 = out('Not synced yet.');
          const fix = act('', () => {
            if (busy) return; typo = !typo; paint();
            repos.forEach(r => { r.className = 'bd-repo'; });
            say(o1, 'Edited. Sync again.'); say(o2, 'Edited. Sync again.');
          });
          function paint() {
            strLine.innerHTML = hl(`implementation("androidx.room:room-${nm()}:2.7.2")`);
            verLine.innerHTML = hl(`room = "${ver}"`);
            tomlLine.innerHTML = hl('androidx-room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }');
            accLine.innerHTML = hl(`implementation(libs.androidx.room.${nm()})`);
            mods.forEach((m, i) => { m.textContent = `${MODS[i]} · room ${ver}`; });
            fix.textContent = typo ? 'Fix the typo' : 'Bring the typo back';
          }
          async function syncStr() {
            if (busy) return; busy = true;
            repos.forEach(r => { r.className = 'bd-repo'; });
            say(o1, 'Resolving dependencies...');
            for (const r of repos) {
              r.className = 'bd-repo bd-look';
              await sleep(650); if (!el.isConnected) return;
              if (!typo) { r.className = 'bd-repo bd-yes'; say(o1, '<span class="good">resolved</span> room-runtime:2.7.2 from google()'); busy = false; return; }
              r.className = 'bd-repo bd-no';
            }
            say(o1, '<span class="bad">Failed to resolve:</span> androidx.room:room-runtme:2.7.2'); replay(o1, 'shake');
            busy = false;
          }
          async function syncCat() {
            if (busy) return; busy = true;
            if (typo) { say(o2, '<span class="bad">Script compilation error:</span> Unresolved reference \'runtme\'.'); replay(accLine, 'shake'); busy = false; return; }
            say(o2, 'Compiling build scripts...');
            await sleep(500); if (!el.isConnected) return;
            say(o2, `<span class="good">resolved</span> room-runtime:${ver} for ${MODS.length} modules`);
            busy = false;
          }
          function bump() {
            if (busy) return;
            ver = ver === '2.7.2' ? '2.8.0' : '2.7.2'; paint();
            replay(verLine, 'bd-flash'); mods.forEach(m => replay(m, 'bd-flash'));
            say(o2, `One line changed. All ${MODS.length} modules now use room ${ver}. The string in the first card still says 2.7.2.`);
          }
          paint();
          el.append(
            h('div', { class: 'bd-grid' },
              h('div', { class: 'bd-card' }, lbl('String coordinate'), strLine, h('div', { class: 'bd-repos' }, repos), o1, h('div', { class: 'controls' }, act('Sync', syncStr))),
              h('div', { class: 'bd-card' }, lbl('libs.versions.toml'), verLine, tomlLine, lbl('app/build.gradle.kts'), accLine, h('div', { class: 'bd-mods' }, mods), o2,
                h('div', { class: 'controls' }, act('Sync', syncCat), act('Bump room', bump)))),
            h('div', { class: 'controls' }, fix),
            h('p', { class: 'tip' }, 'Dashes become dots: androidx-room-runtime is libs.androidx.room.runtime.'));
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
        ],
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
        ],
        visual(el) {
          let busy = false, lost = false, leaked = false;
          const stn = (t, d) => { const slot = h('div', { class: 'bd-pslot' }); return Object.assign(h('div', { class: 'bd-stn' }, h('b', {}, t), h('small', {}, d), slot), { well: slot }); };
          const S = [stn('Your machine', 'Signs the .aab with the upload key'), stn('Play Console', 'Checks the upload signature'), stn('Play App Signing', 'Re-signs APKs with the app signing key'), stn('Phones', 'Check the app signing key')];
          const upKey = h('span', { class: 'bd-key' }, 'upload key: you');
          const appKey = h('span', { class: 'bd-key' }, 'app signing key: Google');
          const o = out('Upload a release and follow the signatures.');
          const pkg = (t, c = '') => h('span', { class: `bd-pkg pop ${c}` }, t);
          async function upload(debug) {
            if (busy) return;
            S.forEach(s => { s.classList.remove('bd-on', 'bd-bad'); s.well.replaceChildren(); });
            if (!debug && lost) { say(o, '<span class="bad">No upload key to sign with.</span> Request a reset first.'); replay(upKey, 'shake'); return; }
            busy = true;
            S[0].classList.add('bd-on'); S[0].well.append(pkg(debug ? 'debug key' : 'upload key'));
            await sleep(700); if (!el.isConnected) return;
            S[1].classList.add('bd-on'); S[1].well.append(pkg('checking'));
            await sleep(700); if (!el.isConnected) return;
            if (debug) {
              S[1].classList.add('bd-bad'); S[1].well.replaceChildren(pkg('rejected', 'bd-r')); replay(S[1], 'shake');
              say(o, '<span class="bad">Rejected:</span> You uploaded an APK or Android App Bundle that was signed in debug mode.');
              busy = false; return;
            }
            S[1].well.replaceChildren(pkg('upload key ok', 'bd-g'));
            await sleep(600); if (!el.isConnected) return;
            S[2].classList.add('bd-on'); S[2].well.append(pkg('app key'));
            await sleep(700); if (!el.isConnected) return;
            S[3].classList.add('bd-on'); S[3].well.append(pkg('update ok', 'bd-g'));
            say(o, `<span class="good">Released.</span> Phones only see the app signing key. ${leaked ? '<span class="bad">But the keystore is still in git.</span>' : 'Your upload key never left your machine.'}`);
            busy = false;
          }
          const loseBtn = act('Lose the upload key', () => {
            if (busy) return;
            lost = !lost;
            if (lost) {
              upKey.className = 'bd-key bd-lost'; replay(upKey, 'shake'); loseBtn.textContent = 'Request upload key reset';
              say(o, 'Upload key gone. New uploads can\u2019t be signed. The app signing key is safe at Google.');
            } else {
              upKey.className = 'bd-key pop'; upKey.textContent = 'new upload key: you'; loseBtn.textContent = 'Lose the upload key';
              say(o, '<span class="good">Reset done</span> in Play Console. You registered a new upload certificate. Updates keep working because phones check the app signing key.');
            }
          });
          const leakBtn = cmd('git add upload.jks', () => {
            if (busy) return;
            leaked = !leaked;
            upKey.classList.toggle('bd-leak', leaked); replay(upKey, leaked ? 'shake' : 'pop');
            leakBtn.innerHTML = hl(leaked ? 'git rm --cached upload.jks' : 'git add upload.jks');
            say(o, leaked
              ? '<span class="bad">Leaked.</span> Anyone with the repo and the password can sign uploads as you. Purge it from history, add *.jks to .gitignore, reset the upload key.'
              : '<span class="good">Removed</span> and ignored. Also rewrite history and reset the upload key, since old commits still hold it.');
          });
          el.append(
            h('div', { class: 'bd-flow' }, S),
            h('div', { class: 'bd-keys' }, upKey, appKey),
            h('div', { class: 'controls' },
              act('Upload signed with upload key', () => upload(false)),
              act('Upload signed with debug key', () => upload(true)),
              loseBtn, leakBtn),
            o);
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
          { q: 'A Turkish-speaking user on an arm64 phone with an xxhdpi screen installs your app. What does Play send?', options: ['A universal APK with every ABI, density and language', 'The base APK plus arm64-v8a, xxhdpi and tr config splits', 'Only the base APK'], a: 1, why: 'Play picks the splits that match the device configuration and installs them together.' },
          { q: 'What is a dynamic feature module good for?', options: ['Code most users don\u2019t need at install, like a rarely used scanner', 'Making every screen load faster', 'Replacing Gradle modules'], a: 0, why: 'Delivering it on demand keeps the first download small. Users who never open it never download it.' },
          { q: 'Your app has an in-app language picker. Why might you turn off the language split?', options: ['Language splits are not allowed with pickers', 'The phone only gets its system languages, so other languages would be missing until downloaded', 'It makes the app smaller'], a: 1, why: 'With language splits on, only device languages install. Turn the split off, or request extra languages with SplitInstallManager.' },
        ],
        visual(el) {
          const ABI = { arm64_v8a: 5.6, x86_64: 6.0, armeabi_v7a: 4.1 };
          const DPI = { hdpi: 0.7, xxhdpi: 1.3 };
          const LANGS = ['en', 'tr', 'de'];
          const BASE = 8.2, LANG = 0.06, UNI = 31.4;
          let abi = 'arm64_v8a', dpi = 'xxhdpi', busy = false, scanner = false, total = 0;
          const langs = new Set(['tr']);
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
        ],
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
