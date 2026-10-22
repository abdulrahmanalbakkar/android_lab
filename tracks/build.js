/* Build and release track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed bd-. */
(() => {
  const { h } = Lab;
  const lbl = t => h('span', { class: 'bd-label' }, t);

  const css = `
.bd-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.bd-al-ok { border-color: var(--ok); background: var(--ok-soft); }
.bd-al-ok .bd-al-st { color: var(--ok); }
.bd-al-warn { border-color: var(--warm); background: var(--warm-soft); }
.bd-al-warn .bd-al-st { color: var(--warm); }
.bd-al-bad { border-color: var(--err); background: var(--err-soft); }
.bd-al-bad .bd-al-st { color: var(--err); }
.bd-al-skip { border-style: dashed; opacity: 0.55; }
.bd-al-gate.bd-al-ok small, .bd-al-gate.bd-al-warn small, .bd-al-gate.bd-al-bad small { color: var(--ink); }
.bd-card { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.bd-card .out { font-size: 0.8rem; }
.bd-line { font: 500 0.8rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 6px 10px; overflow-x: auto; white-space: pre; min-width: 0; }
.bd-repos { display: flex; flex-wrap: wrap; gap: 6px; }
.bd-repo { font: 600 0.76rem var(--mono); padding: 3px 9px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.2s, color 0.2s, border-color 0.2s; }
.bd-repo.bd-yes { border-color: var(--ok); color: var(--ok); background: var(--ok-soft); }
.bd-matrix { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr); gap: 6px; min-width: 0; }
.bd-mh { font: 600 0.7rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; align-self: center; padding: 2px 4px; overflow-wrap: anywhere; min-width: 0; }
.bd-cell { font: 600 0.8rem var(--mono); padding: 9px 6px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); overflow-wrap: anywhere; min-width: 0; text-align: center; }
@media (max-width: 560px) { .bd-cell { font-size: 0.68rem; padding: 8px 3px; } }
.bd-cell[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.bd-kv { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 14px; margin: 0; font: 500 0.82rem var(--mono); }
.bd-kv dt { color: var(--muted); }
.bd-kv dd { margin: 0; overflow-wrap: anywhere; }
.bd-sets { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.bd-set { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 7px; background: var(--sunk); overflow-wrap: anywhere; }
.bd-gt { color: var(--muted); font: 600 0.8rem var(--mono); }
.bd-files { display: grid; gap: 4px; min-height: 34px; }
.bd-file { display: flex; justify-content: space-between; gap: 10px; font: 500 0.8rem var(--mono); padding: 5px 10px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.bd-file span:first-child { overflow-wrap: anywhere; min-width: 0; }
.bd-file.bd-feat { border-color: var(--accent); background: var(--accent-soft); }
.bd-size { display: grid; grid-template-columns: 92px minmax(0, 1fr) 62px; gap: 8px; align-items: center; font: 600 0.78rem var(--mono); }
.bd-size span:last-child { text-align: right; }
.bd-meter { height: 12px; background: var(--sunk); border-radius: 99px; overflow: hidden; }
.bd-meter span { display: block; height: 100%; width: 0; background: var(--accent); border-radius: 99px; transition: width 0.4s; }
.bd-meter.bd-uni span { background: var(--muted); }
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
.bd-set.bd-d2-win { background: var(--ok-soft); color: var(--ok); }
.bd-d2-mono { font: 600 0.82rem var(--mono); overflow-wrap: anywhere; }
.bd-al-gates { display: grid; gap: 6px; min-width: 0; }
.bd-al-gate { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.bd-al-head { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; min-width: 0; }
.bd-al-head b { font: 700 0.88rem var(--display); }
.bd-al-by { font: 600 0.7rem var(--mono); color: var(--muted); }
.bd-al-st { margin-left: auto; font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.bd-al-gate small { font: 500 0.78rem/1.4 var(--mono); color: var(--muted); overflow-wrap: anywhere; min-width: 0; }
.bd-al-gate small:empty { display: none; }
`;

  Lab.addTrack({
    id: 'build',
    title: 'Build and release',
    description: 'How Gradle builds your app, which versions and variants it makes, and how a signed App Bundle reaches users through Google Play, step by step.',
    group: 'Shipping', requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'gradle',
        title: 'Gradle',
        tagline: 'A build is a chain of tasks, and Gradle skips every task whose work is already done.',
        goals: ['Read the task lines that <code>./gradlew</code> prints', 'Explain when Gradle skips a task: <code>UP-TO-DATE</code> and <code>FROM-CACHE</code>', 'Turn on the build cache in <code>gradle.properties</code>'],
        level: 'intermediate', introduces: ['clean'],
        body: `
<p>After Lin clones Recipes on her new laptop, the first build takes almost a minute. She changes one line in <code>MainActivity.kt</code> and builds again: seven seconds. Gradle didn’t get faster; it did less work. Knowing which work it skips, and why, lets you read what a build prints and keep your builds quick.</p>
<p>You have typed <code>./gradlew assembleDebug</code> since the adb lesson. <code>assembleDebug</code> is a <em>task</em>: one piece of build work with a name. It needs other tasks first: compile the Kotlin code, merge the resources, package the APK, and so on. Gradle reads the build files, works out every task the command needs and runs them in the right order. With <code>--console=plain</code> it prints one line per task, such as <code>&gt; Task :app:compileDebugKotlin</code>: the module, <code>:app</code>, then the task.</p>
<p>Every task has <em>inputs</em>, the files and settings it reads, and <em>outputs</em>, the files it writes. Before it runs a task, Gradle compares both with the last build in this folder. If nothing changed, it skips the task and prints <code>UP-TO-DATE</code>. Lin’s one line changes the input of the Kotlin compile task, so that task and the ones that use its output run again; the resource tasks stay <code>UP-TO-DATE</code>. <code>./gradlew clean</code> deletes the <code>build</code> folders, and with them every output, so the next build does everything again.</p>
<p>The <em>build cache</em> goes one step further. Add <code>org.gradle.caching=true</code> to <code>gradle.properties</code>, a file in the project’s top folder, and Gradle keeps the outputs of each task in a cache in the <code>.gradle</code> folder of your home folder, filed under their inputs. When the same inputs come back, after a <code>clean</code> or after you switch back to a Git branch, it copies the outputs instead of doing the work, and prints <code>FROM-CACHE</code>. The last line of every build counts it all, as in <code>128 actionable tasks: 9 executed, 119 up-to-date</code>.</p>`,
        visual(el) {
          const T = (name, label) => `&gt; Task :app:${name}${label ? ' ' + label : ''}`;
          const list = (labels) => ['mergeDebugResources', 'processDebugResources', 'compileDebugKotlin', 'dexBuilderDebug', 'packageDebug'].map((n, k) => T(n, labels[k])).concat(T('assembleDebug', labels[5])).join('\n');
          Lab.ui.terminal(el, {
            predict: {
              q: 'Lin changes one line in <code>MainActivity.kt</code> and builds again. What does the task <code>mergeDebugResources</code> do?',
              options: ['It runs again, like every task', 'It is skipped: <code>UP-TO-DATE</code>', 'It fails: the build folder is out of date'],
              a: 1,
              why: 'Its inputs are the resource files, and none of them changed. Only the Kotlin compile task and the tasks that use its output have new inputs.',
            },
            frames: [
              { say: 'Recipes, with <code>org.gradle.caching=true</code> in <code>gradle.properties</code>. A debug build of Recipes runs well over a hundred tasks; the lines below show six of them. (The counts and times in this demo are example numbers.)' },
              { cmd: './gradlew assembleDebug --console=plain', out: list(['', '', '', '', '', '']) + '\n\nBUILD SUCCESSFUL in 48s\n128 actionable tasks: 128 executed', say: 'The first build in a fresh copy: every task does its work. A line with no label means the task ran. (Shortened: only six of the task lines are shown.)' },
              { cmd: './gradlew assembleDebug --console=plain', out: list(['UP-TO-DATE', 'UP-TO-DATE', 'UP-TO-DATE', 'UP-TO-DATE', 'UP-TO-DATE', 'UP-TO-DATE']) + '\n\nBUILD SUCCESSFUL in 2s\n128 actionable tasks: 128 up-to-date', say: 'The same command again, with nothing changed. Every task finds the same inputs and outputs as last time, so all of them are skipped.' },
              { cmd: './gradlew assembleDebug --console=plain', out: list(['UP-TO-DATE', 'UP-TO-DATE', '', '', '', '']) + '\n\nBUILD SUCCESSFUL in 7s\n128 actionable tasks: 9 executed, 119 up-to-date', say: 'Lin changed one line in <code>MainActivity.kt</code>. The Kotlin compile task has a new input, so it runs, and so do the tasks after it. The resource tasks stay <code>UP-TO-DATE</code>. (<code>assembleDebug</code> only stands for the tasks it needs, so it has no work of its own and isn’t counted.)' },
              { cmd: './gradlew clean', out: 'BUILD SUCCESSFUL in 1s\n4 actionable tasks: 4 executed', say: '<code>clean</code> deletes the <code>build</code> folder of each of the four modules. Every output is gone. The cache in the home folder is not touched.' },
              { cmd: './gradlew assembleDebug --console=plain', out: list(['FROM-CACHE', 'FROM-CACHE', 'FROM-CACHE', 'FROM-CACHE', '', '']) + '\n\nBUILD SUCCESSFUL in 11s\n128 actionable tasks: 41 executed, 87 from cache', say: 'No outputs on disk, so nothing is <code>UP-TO-DATE</code>. But the inputs are the same as in an earlier build, so most outputs are copied from the cache: <code>FROM-CACHE</code>. A few tasks, here packaging the APK, are not kept in the cache and run again.' },
              { say: 'Three ways a task can end: it ran (no label), it was skipped (<code>UP-TO-DATE</code>) or its outputs were copied (<code>FROM-CACHE</code>). Lin stops typing <code>clean</code> before every build: Gradle already redoes exactly what changed.' },
            ],
          });
        },
        code: `# gradle.properties, in the project's top folder (a line that starts with # is a comment)
# keep task outputs in the build cache
org.gradle.caching=true

# Terminal: one line per task
./gradlew assembleDebug --console=plain
# > Task :app:mergeDebugResources UP-TO-DATE     skipped: same inputs and outputs as last time
# > Task :app:compileDebugKotlin                 ran: MainActivity.kt changed
# ...
# BUILD SUCCESSFUL in 7s
# 128 actionable tasks: 9 executed, 119 up-to-date   (example numbers)

./gradlew clean                  # deletes the build folders: the next build has no outputs
./gradlew assembleDebug --console=plain
# > Task :app:compileDebugKotlin FROM-CACHE      copied from the cache: these inputs were built before`,
        remember: 'A build is a chain of tasks. Gradle skips a task whose inputs and outputs didn’t change (UP-TO-DATE) and copies outputs it already has in the build cache (FROM-CACHE).',
        mistakes: [
          { title: 'Cleaning before every build', bad: `./gradlew clean assembleDebug   # every time, "to be safe"`, good: `./gradlew assembleDebug         # Gradle redoes what changed`, why: 'Gradle compares inputs and outputs for every task, so it already reruns exactly the work that a change needs. <code>clean</code> throws all outputs away and makes every build slow. Keep it for the rare build that seems stuck on old files.' },
        ],
        terms: [
          { term: 'task', def: 'One piece of build work with a name, such as <code>compileDebugKotlin</code>. A command like <code>assembleDebug</code> needs many tasks, which Gradle runs in order.' },
          { term: 'inputs and outputs', def: 'The files and settings a task reads, and the files it writes. Gradle compares them with the last build to decide whether the task must run.' },
          { term: 'UP-TO-DATE', def: 'Printed for a task Gradle skipped, because its inputs and outputs are the same as in the last build in this folder.' },
          { term: 'build cache', def: 'Task outputs Gradle keeps in your home folder, filed under their inputs. Turned on with <code>org.gradle.caching=true</code>. A task whose outputs are copied from it shows <code>FROM-CACHE</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn on the build cache for Recipes.', code: `# gradle.properties
org.gradle.[[caching]]=[[true]]`, why: '<code>org.gradle.caching=true</code> in <code>gradle.properties</code> makes Gradle keep task outputs and copy them back when the same inputs return.' },
          { type: 'bug', prompt: 'Sam wrote down what the labels in a build mean. One line is wrong. Tap it.', code: `# What each task line means
UP-TO-DATE   ->  same inputs and outputs as last time: skipped
FROM-CACHE   ->  outputs copied from the build cache
(no label)   ->  outputs copied from the build cache`, bug: 3, fix: '(no label)   ->  the task ran and did its work', why: 'A task line with no label is a task that ran. Only <code>FROM-CACHE</code> means its outputs came from the cache.' },
        ],
        quiz: [
          { q: 'You run <code>./gradlew assembleDebug</code> twice and change nothing in between. What does the second build do?', options: ['Every task is <code>UP-TO-DATE</code>, so it takes a few seconds', 'It builds everything again, to be safe', 'It refuses: the APK already exists'], a: 0, why: 'Every task finds the same inputs and outputs as in the last build, so Gradle skips all of them.' },
          { q: 'After <code>./gradlew clean</code>, many tasks show <code>FROM-CACHE</code>. Why not <code>UP-TO-DATE</code>?', options: ['<code>clean</code> deleted the outputs, but the build cache still had outputs for the same inputs', '<code>clean</code> also emptied the cache', 'The tasks ran again, faster'], a: 0, why: '<code>UP-TO-DATE</code> needs the outputs on disk from the last build. <code>clean</code> removed them, so Gradle copied them from the cache in the home folder instead.' },
          { q: 'You change one line in a Kotlin file of <code>:app</code>. Which tasks do work?', options: ['The Kotlin compile task and the tasks that use its output', 'Every task of the build', 'Only <code>assembleDebug</code>'], a: 0, why: 'Only tasks whose inputs changed run. The resource tasks read other files, so they stay <code>UP-TO-DATE</code>.' },
        ],
        docs: [['Configure your build', 'https://developer.android.com/build'], ['Build cache', 'https://docs.gradle.org/current/userguide/build_cache.html']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'catalogs',
        title: 'Version catalogs',
        tagline: 'One list of versions for every module, and a way to see which version you really get.',
        goals: ['Move a library from typed strings in several modules into the catalog', 'Explain why a misspelt <code>libs</code> name fails before anything is downloaded', 'Find the version Gradle really uses with <code>./gradlew :app:dependencies</code>'],
        level: 'intermediate', introduces: ['releaseRuntimeClasspath'],
        body: `
<p>In the testing track, Recipes got its test libraries as typed lines, such as <code>testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.11.0")</code>, in <code>:core:data</code> and again in <code>:feature:recipes</code>. Months later Sam changes the number in one file and forgets the other. Now two modules test with two different versions, and nothing tells him.</p>
<p>You met the fix in the news reader project: the version catalog, <code>gradle/libs.versions.toml</code>. It is one file for the whole project, and every module reads the same <code>libs</code>. Move the library there once, and each module writes <code>testImplementation(libs.kotlinx.coroutines.test)</code>; the next update is one number for every module. The <code>libs</code> names are Kotlin code that Gradle makes from the file, so a typo such as <code>libs.kotlinx.corutines.test</code> stops the build at once with <code>Unresolved reference 'corutines'.</code> The same typo inside a string is only found after Gradle has asked every server it downloads from for a library that doesn’t exist.</p>
<p>The catalog says which version you <em>ask</em> for. Libraries bring their own libraries, though, and sometimes two of them ask for different versions of the same one. Gradle then picks the highest version anyone asks for. <code>./gradlew :app:dependencies --configuration releaseRuntimeClasspath</code> prints the tree of every library in the release app. Each line is a library, and an indented line is one the line above brings along. An arrow such as <code>1.10.2 -&gt; 1.11.0</code> means: asked for 1.10.2, got 1.11.0. When a library acts as if it were another version, this tree tells you why.</p>`,
        visual(el) {
          const file = s => '<pre class="ui-out">' + s + '</pre>';
          Lab.ui.terminal(el, {
            panelTitle: 'The files Sam is looking at',
            predict: {
              q: 'The catalog asks for coroutines 1.11.0. A cooking-timer library Recipes uses was made with coroutines 1.10.2. Which version ends up in the app?',
              options: ['Only 1.11.0, the highest one asked for', 'Both, one for each', 'Only 1.10.2, because the library came first'],
              a: 0,
              why: 'An app holds one version of each library. When two parts ask for different versions, Gradle picks the highest, and the tree shows it with an arrow.',
            },
            frames: [
              { panel: file('core/data/build.gradle.kts\n  testImplementation("org.jetbrains.kotlinx:\n    kotlinx-coroutines-test:1.11.0")\n\nfeature/recipes/build.gradle.kts\n  testImplementation("org.jetbrains.kotlinx:\n    kotlinx-coroutines-test:1.10.2")'), say: 'The same library typed into two build files, with two versions. Each module tests with its own one.' },
              { panel: file('gradle/libs.versions.toml\n[versions]\ncoroutines = "1.11.0"\n\n[libraries]\nkotlinx-coroutines-test = { group = "org.jetbrains.kotlinx",\n  name = "kotlinx-coroutines-test", version.ref = "coroutines" }'), say: 'Sam moves it into the catalog once. Both build files now say <code>testImplementation(libs.kotlinx.coroutines.test)</code>, and there is one version for the whole project.' },
              { cmd: './gradlew :core:data:test', out: '* Where:\nBuild file \'…/core/data/build.gradle.kts\' line: 14\n\n* What went wrong:\nScript compilation error:\n\n  Line 14:     testImplementation(libs.kotlinx.corutines.test)\n                                               ^ Unresolved reference \'corutines\'.\n\nBUILD FAILED in 3s', say: 'A typo in the <code>libs</code> name. <code>* Where:</code> names the file and line, and the <code>^</code> points at the wrong word. Gradle can’t even read the build file, so it stops before it downloads anything. Android Studio underlines the name as you type. (Output shortened.)' },
              { cmd: './gradlew :core:data:test :feature:recipes:test', out: 'BUILD SUCCESSFUL in 24s\n61 actionable tasks: 19 executed, 42 up-to-date', say: 'Fixed with the name Android Studio suggests. Both modules now test with 1.11.0. (Example numbers.)' },
              { cmd: './gradlew :app:dependencies --configuration releaseRuntimeClasspath', out: '+--- org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0\n\\--- com.example:timer-kit:2.1.0\n     \\--- org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2 -&gt; 1.11.0', say: 'The tree of the release app, cut to three lines. Each line is a library. An indented line is one the line above brings along. <code>timer-kit</code> (a made-up library for this example) asks for coroutines 1.10.2. Recipes asks for 1.11.0. The arrow shows what Gradle picked: the highest, 1.11.0.' },
              { say: 'It works the other way too: if a library asks for a higher version than your catalog, the app gets that higher one, and the catalog doesn’t show it. The tree does.' },
            ],
          });
        },
        code: `# gradle/libs.versions.toml
[versions]
coroutines = "1.11.0"

[libraries]
kotlinx-coroutines-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-core", version.ref = "coroutines" }
kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "coroutines" }

// core/data/build.gradle.kts, and the same lines in feature/recipes/build.gradle.kts
dependencies {
    implementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.kotlinx.coroutines.test)   // was a typed string with its own number
}

// Terminal: which versions does the release app really get?
// ./gradlew :app:dependencies --configuration releaseRuntimeClasspath
// +--- org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0
// \\--- com.example:timer-kit:2.1.0
//      \\--- org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2 -> 1.11.0   asked for 1.10.2, got 1.11.0`,
        remember: 'Every module asks for versions through the one catalog; ./gradlew :app:dependencies shows what Gradle really picked.',
        mistakes: [
          { title: 'Typing one library by hand next to the catalog', bad: `dependencies {
    implementation(libs.kotlinx.coroutines.core)                                // 1.11.0, from the catalog
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")   // typed by hand
}`, good: `dependencies {
    implementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.kotlinx.coroutines.test)   // same version.ref, same number
}`, why: 'The typed line has its own number, which nobody updates with the catalog. Libraries of one family, like the coroutines ones, should share one <code>version.ref</code>, so they always move together.' },
        ],
        terms: [
          { term: 'dependency tree', def: 'The list of every library a module uses, with the libraries they bring along, printed by <code>./gradlew :app:dependencies</code>.' },
          { term: 'version conflict', def: 'Two parts of the project asking for different versions of the same library. Gradle picks the highest and shows it with an arrow, as in <code>1.10.2 -&gt; 1.11.0</code>.' },
          { term: 'releaseRuntimeClasspath', def: 'The name Gradle gives the list of libraries inside the release app. Pass it to <code>dependencies</code> with <code>--configuration</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the test library the same version as the core library, through the catalog.', code: `[versions]
coroutines = "1.11.0"

[libraries]
kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", [[version.ref]] = "[[coroutines]]" }`, why: '<code>version.ref</code> points to a name under <code>[versions]</code>. Every library that points to <code>coroutines</code> moves when that one number changes.' },
          { type: 'bug', prompt: 'Sam read the dependency tree and wrote down what the release app gets. One line is wrong. Tap it.', code: `// What the release app gets, read from the tree
com.example:timer-kit:2.1.0                    gets 2.1.0
kotlinx-coroutines-core:1.10.2 -> 1.11.0       gets 1.10.2`, bug: 2, fix: 'kotlinx-coroutines-core:1.10.2 -> 1.11.0       gets 1.11.0', why: 'The number before the arrow is what was asked for, the one after it is what Gradle picked. The app gets 1.11.0.' },
        ],
        quiz: [
          { q: 'You type <code>libs.kotlinx.corutines.test</code> in a build file. When do you find out?', options: ['At once: Gradle can’t compile the build file, and Android Studio underlines the name', 'Only after Gradle has asked every server for the library', 'When the tests run'], a: 0, why: 'The <code>libs</code> names are Kotlin code that Gradle makes from the catalog. A wrong name is an unresolved reference in the build file.' },
          { q: 'The tree shows <code>kotlinx-coroutines-core:1.10.2 -&gt; 1.11.0</code>. What does it mean?', options: ['Something asked for 1.10.2, and Gradle picked 1.11.0', 'The app has both versions', 'An update to 1.11.0 is available'], a: 0, why: 'The arrow marks a version that was changed: another part asked for a higher one, and the highest wins.' },
          { q: 'Why does a catalog help most when a project has several modules?', options: ['Every module reads the same versions from one file', 'Modules can’t have dependencies without it', 'It makes the app smaller'], a: 0, why: 'With typed strings each build file has its own numbers, which drift apart. The catalog is one list that every module uses.' },
        ],
        docs: [['Migrate your build to version catalogs', 'https://developer.android.com/build/migrate-to-catalogs'], ['Viewing dependencies', 'https://docs.gradle.org/current/userguide/viewing_debugging_dependencies.html']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'api-levels',
        title: 'API levels',
        tagline: 'compileSdk, minSdk and targetSdk each answer a different question.',
        goals: ['Say what <code>compileSdk</code>, <code>minSdk</code> and <code>targetSdk</code> each change', 'Guard a call that is newer than <code>minSdk</code> after a <code>NewApi</code> lint error', 'Plan a <code>targetSdk</code> update the way Google Play requires it'],
        level: 'intermediate', introduces: ['NewApi'],
        body: `
<p>Since August 31, 2026, Google Play takes new apps and updates only if they target API 36, Android 16. Recipes already does. Then Sam asks: could the app reach older phones if <code>minSdk</code> went from 26 down to 24? And why is <code>compileSdk</code> 37? The three numbers in <code>app/build.gradle.kts</code> look alike, but each one answers a different question.</p>
<p><code>compileSdk</code> answers: what can the code use? It is the Android version whose classes and functions the compiler knows, here Android 17. It changes nothing on phones. Raising it lets you call newer functions, and some new libraries need it, like Navigation in the news reader project.</p>
<p><code>minSdk</code> answers: who can install the app? Phones older than it can’t, and Google Play doesn’t show them the app. It is also a promise your code must keep. The code is compiled against Android 17, so a call to something Android added in API 26 compiles fine, installs on an API 24 phone and crashes there when that line runs. Lint marks every such call as an error, <code>NewApi</code>, with a red underline. Run still builds it, but <code>./gradlew lint</code> fails. The fix is the check from the push track: <code>if (Build.VERSION.SDK_INT &gt;= 26) { }</code>.</p>
<p><code>targetSdk</code> answers: which behaviour changes apply? Each Android version changes some things only for apps that target it, like Android 16 ignoring orientation locks on large screens for apps that target API 36, from the accessibility track. On a phone newer than your <code>targetSdk</code>, Android keeps the old behaviour for those changes. So raising it is a small project: read that version’s list of behaviour changes, test, then raise it. Play makes everyone do this once a year. An existing app that targets less than API 35 is no longer offered to new users whose phones run a newer Android than it targets.</p>`,
        visual(el) {
          const gate = (name, by) => {
            const st = h('span', { class: 'bd-al-st' }), sm = h('small');
            return { st, sm, box: h('div', { class: 'bd-al-gate' }, h('div', { class: 'bd-al-head' }, h('b', {}, name), h('span', { class: 'bd-al-by' }, by), st), sm) };
          };
          const G = { build: gate('Build', 'compileSdk'), install: gate('Install', 'minSdk'), run: gate('Run', 'targetSdk and your checks') };
          const cfg = h('div', { class: 'bd-line' });
          const dev = h('div', { class: 'bd-d2-mono' });
          const stage = h('div', { class: 'ui-stage bd-card' }, lbl('app/build.gradle.kts'), cfg, lbl('Phone'), dev, h('div', { class: 'bd-al-gates' }, G.build.box, G.install.box, G.run.box));
          const word = { ok: 'passes', warn: 'warning', bad: 'fails', skip: 'not reached' };
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'Sam lowers <code>minSdk</code> to 24. Recipes calls <code>createNotificationChannel</code>, which Android added in API 26, with no check. What happens on an Android 7.0 phone (API 24)?',
              options: ['The build fails', 'It installs, then crashes when that line runs', 'The phone refuses to install it'],
              a: 1,
              why: '<code>compileSdk</code> 37 knows the function, so Run builds the app, though lint reports an error. <code>minSdk</code> 24 lets the phone install it. The function isn’t on that phone, so the app crashes when it gets there.',
            },
            frames: [
              { c: 37, m: 26, t: 36, say: 'Recipes as it is. Each build, and each phone, passes three gates, one for each number.' },
              { c: 37, m: 26, t: 36, phone: 'Android 8.0 · API 26', build: ['ok', 'The code only uses what Android 17 has.'], install: ['ok', '26 is not older than minSdk 26.'], run: ['ok', 'Nothing newer than this phone to worry about.'], say: 'An Android 8.0 phone, the oldest Recipes supports. All three gates pass.' },
              { c: 37, m: 26, t: 36, phone: 'Android 7.0 · API 24', build: ['ok', 'Same build.'], install: ['bad', '24 is older than minSdk 26: refused. Play doesn’t offer the app.'], run: ['skip', ''], say: 'An Android 7.0 phone can’t install Recipes, and Google Play doesn’t show the app there at all.' },
              { c: 37, m: 24, t: 36, phone: 'Android 7.0 · API 24', build: ['warn', 'Run builds it, but lint reports an error, NewApi: createNotificationChannel needs API 26, and minSdk is now 24.', 'lint error'], install: ['ok', '24 is not older than minSdk 24.'], run: ['bad', 'Crashes when createNotificationChannel runs: the phone doesn’t have it.'], say: 'Sam sets <code>minSdk = 24</code>. Run still builds the app, but lint reports an error. The phone installs the app, which crashes as soon as it creates its channel.' },
              { c: 37, m: 24, t: 36, phone: 'Android 7.0 · API 24', build: ['ok', 'The call sits inside if (Build.VERSION.SDK_INT >= 26).'], install: ['ok', '24 is not older than minSdk 24.'], run: ['ok', 'The check skips the channel. Phones below API 26 have no channels.'], say: 'With the check, the lint error is gone and the old phone works. Every call newer than <code>minSdk</code> needs this. The team decides it isn’t worth it and keeps <code>minSdk = 26</code>.' },
              { c: 37, m: 26, t: 36, phone: 'Android 17 · API 37', build: ['ok', 'Same build.'], install: ['ok', '37 is not older than minSdk 26.'], run: ['warn', 'Android 17’s changes for all apps apply. Its changes for apps that target 37 stay off.'], say: 'A phone newer than <code>targetSdk</code>. Android 17 keeps the old behaviour for the changes that are only for apps targeting 37, because Recipes hasn’t been tested with them.' },
              { c: 37, m: 26, t: 37, phone: 'Android 17 · API 37', build: ['ok', 'Same build.'], install: ['ok', 'Same.'], run: ['ok', 'All of Android 17’s changes apply, for example: the way out of the large-screen rules stops working.'], say: 'Next year Lin reads the list of Android 17 behaviour changes, tests Recipes on Android 17 and only then sets <code>targetSdk = 37</code>.' },
            ],
            draw(f) {
              cfg.textContent = `compileSdk = ${f.c}\nminSdk = ${f.m}\ntargetSdk = ${f.t}`;
              dev.textContent = f.phone || 'none yet';
              for (const k of ['build', 'install', 'run']) {
                const [tone, text, w] = f[k] || ['', ''];
                G[k].box.className = 'bd-al-gate' + (tone ? ' bd-al-' + tone : '');
                G[k].st.textContent = w || word[tone] || '';
                G[k].sm.textContent = text;
              }
            },
          });
        },
        code: `// app/build.gradle.kts of Recipes
android {
    compileSdk = 37        // what the code can use: Android 17's classes and functions
    defaultConfig {
        minSdk = 26        // who can install: Android 8.0 and newer
        targetSdk = 36     // which behaviour changes apply: those up to Android 16
    }
}

// With minSdk = 24, lint marks createNotificationChannel with NewApi: it needs API 26
fun createChannels(manager: NotificationManager) {
    if (Build.VERSION.SDK_INT >= 26) {      // Android 8.0 and newer
        val channel = NotificationChannel("new-recipes", "New recipes", NotificationManager.IMPORTANCE_DEFAULT)
        manager.createNotificationChannel(channel)
    }
    // Below API 26 there are no channels, and notifications work without them
}`,
        remember: 'compileSdk: what the code can use. minSdk: who can install, and every newer call needs a check. targetSdk: which behaviour changes apply, raised only after testing.',
        mistakes: [
          { title: 'Raising targetSdk as a one-line change', bad: `targetSdk = 37   // changed, built, published`, good: `targetSdk = 37
// 1. Read the behaviour changes for apps that target Android 17
// 2. Test Recipes on an Android 17 phone or emulator
// 3. Fix what changed, then publish`, why: 'Raising <code>targetSdk</code> switches on every behaviour change for that version at once. Untested, that can mean a layout that breaks on tablets or a feature that stops working.' },
        ],
        terms: [
          { term: 'compileSdk', def: 'The Android version whose classes and functions the code is compiled against. It changes what you can call, not how the app runs on phones.' },
          { term: 'behaviour change', def: 'Something a new Android version does differently. Some apply to every app, others only to apps whose <code>targetSdk</code> is that version or higher.' },
          { term: 'NewApi', def: 'The lint error on a call that needs a newer API level than <code>minSdk</code>. Fix it with a check on <code>Build.VERSION.SDK_INT</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'With <code>minSdk = 24</code>, create the channel only on phones with API 26 or newer.', code: `if (Build.VERSION.[[SDK_INT]] >= [[26]]) {
    manager.createNotificationChannel(channel)
}`, why: '<code>Build.VERSION.SDK_INT</code> is the API level of the phone the code runs on. Channels arrived in API 26, Android 8.0.' },
          { type: 'bug', prompt: 'Lin wrote down which number answers which question. One line is wrong. Tap it.', code: `// Which number answers which question
What can the code use?          ->  compileSdk
Who can install the app?        ->  targetSdk
Which behaviour changes apply?  ->  targetSdk`, bug: 2, fix: 'Who can install the app?        ->  minSdk', why: '<code>minSdk</code> decides who can install. <code>targetSdk</code> decides which behaviour changes apply.' },
        ],
        quiz: [
          { q: 'Lin raises <code>compileSdk</code> from 36 to 37 and changes nothing else. What changes for users?', options: ['Nothing on their phones: the code can now call Android 17 functions', 'Android 17’s behaviour changes now apply', 'Android 16 phones can’t install the app any more'], a: 0, why: '<code>compileSdk</code> only decides what the compiler knows. Who can install follows <code>minSdk</code>, and behaviour changes follow <code>targetSdk</code>.' },
          { q: 'Recipes targets API 36 and runs on an Android 17 phone. Which Android 17 changes apply?', options: ['Only the changes for all apps', 'All of them', 'None: the app runs as on Android 16 in every way'], a: 0, why: 'Changes meant only for apps that target 37 stay off until <code>targetSdk</code> is 37. Changes for all apps apply anyway.' },
          { q: 'Since August 31, 2026, what must a new phone app or an app update target to be accepted by Google Play?', options: ['API 36 or higher', 'API 34 or higher', 'The newest API level'], a: 0, why: 'New apps and updates must target Android 16, API 36. Watches, cars and TVs have lower numbers.' },
        ],
        docs: [['Target API level requirements for Google Play', 'https://developer.android.com/google/play/requirements/target-sdk'], ['The uses-sdk element', 'https://developer.android.com/guide/topics/manifest/uses-sdk-element']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'variants',
        title: 'Build variants',
        tagline: 'Build types times flavors: several versions of the app from one project.',
        goals: ['Add two product flavors, one for each server', 'Count the build variants and build one of them', 'Give one flavor its own files in a flavor folder'],
        level: 'intermediate', introduces: ['flavorDimensions', 'productFlavors', 'dimension', 'applicationIdSuffix', 'assembleStagingDebug', 'ServerConfig'],
        body: `
<p>The Recipes team tests new features against a test server, <code>staging.recipes.example.com</code>, so test recipes never reach real users. Lin changes the address in the code by hand before each test. Once she forgot to change it back, and a release talked to the test server. Gradle can build both versions of the app from one project instead.</p>
<p>A build type, <code>debug</code> or <code>release</code> from the R8 lesson, says <em>how</em> the app is built. A <em>product flavor</em> says <em>what</em> is built: here, which server it talks to. Each flavor belongs to a <em>flavor dimension</em>, a group of flavors from which every version picks one: <code>flavorDimensions += "server"</code>, then <code>create("staging")</code> and <code>create("prod")</code> inside <code>productFlavors { }</code>. <code>buildConfigField</code>, from the secrets lesson, gives each flavor its own address in <code>BuildConfig</code>. <code>applicationIdSuffix = ".staging"</code> makes the staging app’s id <code>com.example.recipes.staging</code>: to Android another app, so both fit on one phone.</p>
<p>Gradle pairs every flavor with every build type. Each pair is a <em>build variant</em>: <code>stagingDebug</code>, <code>stagingRelease</code>, <code>prodDebug</code> and <code>prodRelease</code>. Each has its own tasks, like <code>./gradlew assembleStagingDebug</code>, and Run builds the one you pick in <b>Build › Select Build Variant</b>. Only <code>:app</code> has the flavors. It hands the address to <code>:core:data</code>, where Retrofit is made, through Hilt: <code>:core:data</code> asks for a small <code>ServerConfig</code>, and <code>:app</code> provides it.</p>
<p>A variant can also have its own files. Next to <code>src/main</code>, the folder <code>src/staging</code> holds files only the staging flavor gets. Put a <code>strings.xml</code> in <code>src/staging/res/values/</code> with <code>app_name</code> “Recipes Staging”, and the staging app has that name on the home screen. When the same thing is in several folders, the most specific one wins: <code>src/stagingDebug</code>, then <code>src/debug</code>, then <code>src/staging</code>, then <code>src/main</code>.</p>`,
        visual(el) {
          const cells = {};
          const cell = v => (cells[v] = h('span', { class: 'bd-cell', 'aria-pressed': 'false' }, v));
          const matrix = h('div', { class: 'bd-matrix' },
            h('span', { class: 'bd-mh' }, 'server ↓ type →'), h('span', { class: 'bd-mh' }, 'debug'), h('span', { class: 'bd-mh' }, 'release'),
            h('span', { class: 'bd-mh' }, 'staging'), cell('stagingDebug'), cell('stagingRelease'),
            h('span', { class: 'bd-mh' }, 'prod'), cell('prodDebug'), cell('prodRelease'));
          const kv = h('dl', { class: 'bd-kv' });
          const sets = h('div', { class: 'bd-sets' });
          const stage = h('div', { class: 'ui-stage bd-card' }, lbl('Build variants'), matrix, lbl('The chosen variant'), kv, lbl('Where app_name comes from'), sets);
          const ST = 'https://staging.recipes.example.com/', PR = 'https://recipes.example.com/';
          const info = {
            stagingDebug: ['assembleStagingDebug', 'com.example.recipes.staging', ST, 'Recipes Staging', 'off, debug key'],
            stagingRelease: ['assembleStagingRelease', 'com.example.recipes.staging', ST, 'Recipes Staging', 'on, upload key'],
            prodDebug: ['assembleProdDebug', 'com.example.recipes', PR, 'Recipes', 'off, debug key'],
            prodRelease: ['assembleProdRelease', 'com.example.recipes', PR, 'Recipes', 'on, upload key'],
          };
          const folders = { stagingDebug: ['stagingDebug', 'debug', 'staging', 'main'], stagingRelease: ['stagingRelease', 'release', 'staging', 'main'], prodDebug: ['prodDebug', 'debug', 'prod', 'main'], prodRelease: ['prodRelease', 'release', 'prod', 'main'] };
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'Only <code>src/main</code> and <code>src/staging</code> have a <code>strings.xml</code> with <code>app_name</code>. Which name does the <code>prodDebug</code> app get?',
              options: ['“Recipes”, from <code>src/main</code>', '“Recipes Staging”, from <code>src/staging</code>', 'None: the build fails'],
              a: 0,
              why: '<code>prodDebug</code> reads <code>src/prodDebug</code>, <code>src/debug</code>, <code>src/prod</code> and <code>src/main</code>. Only <code>src/main</code> has the name, so it wins. <code>src/staging</code> isn’t part of this variant.',
            },
            frames: [
              { say: 'Two flavors in the <code>server</code> dimension, two build types: Gradle makes a variant for every pair. Four cells, four versions of the app.' },
              { v: 'stagingDebug', say: '<code>stagingDebug</code>: talks to the test server, has its own id and the name “Recipes Staging”. This is what Lin runs while she tests a new feature.' },
              { v: 'stagingRelease', say: '<code>stagingRelease</code>: the same server and id, built like a release, with R8. Useful to try a release build before it goes anywhere.' },
              { v: 'prodDebug', say: '<code>prodDebug</code>: the real server and the real id. It has no <code>src/prod</code> name, so the name comes from <code>src/main</code>.' },
              { v: 'prodRelease', say: '<code>prodRelease</code>: the one that goes to users. <code>./gradlew assembleProdRelease</code> builds it.' },
              { v: 'stagingDebug', win: 'staging', say: 'Where <code>app_name</code> comes from for <code>stagingDebug</code>: Gradle looks from the most specific folder down. <code>src/staging</code> has it, so its name beats the one in <code>src/main</code>.' },
              { v: 'prodDebug', win: 'main', say: 'For <code>prodDebug</code>, none of the first three folders has <code>app_name</code>, so <code>src/main</code> gives it. Lin installs <code>stagingDebug</code> and <code>prodDebug</code> side by side: two ids, two apps.' },
            ],
            draw(f) {
              for (const [v, c] of Object.entries(cells)) c.setAttribute('aria-pressed', String(v === f.v));
              const i = info[f.v];
              kv.replaceChildren(...(i ? [['variant', f.v], ['task', i[0]], ['application id', i[1]], ['BASE_URL', i[2]], ['app name', i[3]], ['R8 and key', i[4]]] : [['variant', 'pick one: Build › Select Build Variant']]).flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
              const fs = f.v ? folders[f.v] : [];
              sets.replaceChildren(...fs.flatMap((s, k) => [k ? h('span', { class: 'bd-gt' }, '›') : null, h('span', { class: 'bd-set' + (f.win === s ? ' bd-d2-win' : '') }, 'src/' + s)]).filter(Boolean));
            },
          });
        },
        code: `// app/build.gradle.kts
android {
    defaultConfig {
        applicationId = "com.example.recipes"
    }
    buildFeatures { buildConfig = true }        // as in the secrets lesson
    flavorDimensions += "server"                 // a group of flavors: each variant picks one
    productFlavors {
        create("staging") {
            dimension = "server"
            applicationIdSuffix = ".staging"     // com.example.recipes.staging: another app
            buildConfigField("String", "BASE_URL", "\\"https://staging.recipes.example.com/\\"")
        }
        create("prod") {
            dimension = "server"
            buildConfigField("String", "BASE_URL", "\\"https://recipes.example.com/\\"")
        }
    }
}
// Variants: stagingDebug, stagingRelease, prodDebug, prodRelease

// :core:data: Retrofit is made here, from an address it is given
class ServerConfig(val baseUrl: String)

// :app: the one module with flavors hands the address to Hilt
@Module
@InstallIn(SingletonComponent::class)
object ServerModule {
    @Provides
    fun provideServerConfig(): ServerConfig = ServerConfig(BuildConfig.BASE_URL)
}

// src/staging/res/values/strings.xml: only the staging app gets this name
// <string name="app_name">Recipes Staging</string>

// Terminal
// ./gradlew assembleStagingDebug`,
        remember: 'Flavors say what is built, build types how. Every pair is a variant with its own tasks, and the most specific source folder wins.',
        mistakes: [
          { title: 'Two flavors with the same application id', bad: `create("staging") {
    dimension = "server"
}`, good: `create("staging") {
    dimension = "server"
    applicationIdSuffix = ".staging"
}`, why: 'Without the suffix, both versions have the id <code>com.example.recipes</code>, so to Android they are the same app. Installing one replaces the other, together with its data.' },
        ],
        terms: [
          { term: 'product flavor', def: 'One version of what the app is, such as <code>staging</code> or <code>prod</code>, made with <code>create(...)</code> inside <code>productFlavors { }</code>.' },
          { term: 'flavor dimension', def: 'A group of flavors, such as <code>server</code>. Each build variant picks one flavor from every dimension.' },
          { term: 'build variant', def: 'One flavor paired with one build type, such as <code>stagingDebug</code>. Each variant has its own tasks, like <code>assembleStagingDebug</code>.' },
          { term: 'applicationIdSuffix', def: 'Text added to the end of the application id for one flavor or build type, so that version installs as a separate app.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put the staging flavor in the <code>server</code> dimension and give it its own application id.', code: `flavorDimensions += "server"
productFlavors {
    create("staging") {
        [[dimension]] = "server"
        [[applicationIdSuffix]] = ".staging"
    }
}`, why: 'Every flavor belongs to a dimension. <code>applicationIdSuffix</code> turns the id into <code>com.example.recipes.staging</code>, a separate app.' },
          { type: 'bug', prompt: 'The staging app should be called “Recipes Staging”, but every variant shows that name, even <code>prodRelease</code>. Tap the line to change.', code: `// The file that holds "Recipes Staging"
src/main/res/values/strings.xml`, bug: 1, fix: 'src/staging/res/values/strings.xml', why: 'Every variant reads <code>src/main</code>. A file only the staging flavor should get goes in <code>src/staging</code>.' },
        ],
        quiz: [
          { q: 'A server dimension with <code>staging</code> and <code>prod</code>, and the build types <code>debug</code> and <code>release</code>. How many build variants are there?', options: ['4', '2', '6'], a: 0, why: 'Each flavor is paired with each build type: 2 × 2 = 4.' },
          { q: 'Which task builds the debug version that talks to the test server?', options: ['<code>assembleStagingDebug</code>', '<code>assembleDebug</code> with a staging setting', '<code>assembleStaging</code>'], a: 0, why: 'Each variant has its own tasks, named after the flavor and then the build type.' },
          { q: 'Why can <code>stagingDebug</code> and <code>prodDebug</code> be installed on the same phone?', options: ['They have different application ids', 'Debug apps never replace each other', 'They have different names on the home screen'], a: 0, why: '<code>applicationIdSuffix</code> gives staging its own id, so Android treats it as another app.' },
        ],
        docs: [['Configure build variants', 'https://developer.android.com/build/build-variants']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'modules',
        title: 'Gradle modules',
        tagline: 'implementation or api: what other modules see, and what a change makes Gradle rebuild.',
        goals: ['Choose between <code>implementation</code> and <code>api</code> for a dependency', 'Fix a “Cannot access class” error between modules', 'Predict which modules compile again after a change'],
        level: 'intermediate', introduces: [],
        body: `
<p>Sam moves <code>Recipe</code> and the other plain data classes into a new, small module, <code>:core:model</code>, so other modules can use them without the whole data layer. <code>:core:data</code> depends on it with <code>implementation(project(":core:model"))</code>, as in the modules lesson. Then <code>:feature:recipes</code> stops building: <code>Cannot access class 'Recipe'. Check your module classpath for missing or conflicting dependencies.</code></p>
<p><code>implementation</code> keeps a dependency private. <code>:core:data</code> can use <code>:core:model</code>, but modules that depend on <code>:core:data</code> can’t see it. That is a problem here, because <code>RecipeRepository</code>’s public functions return <code>Recipe</code>, so whoever calls them needs that class too. <code>api(project(":core:model"))</code> passes the dependency on: every module that depends on <code>:core:data</code> now sees <code>:core:model</code> as well.</p>
<p>What a module sees is also what it is rebuilt for. When the public code of a module changes, Gradle compiles again every module that can see it. With <code>implementation</code> that is only the modules that depend on it directly. With <code>api</code> it is every module above them too. So use <code>api</code> only for a module whose classes appear in your own public functions, like <code>:core:model</code> here, and <code>implementation</code> for everything else, like Room and Retrofit inside <code>:core:data</code>. Then a Room update compiles one module again, not three.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'app', label: ':app', x: 50, y: 8 },
              { id: 'fr', label: ':feature:recipes', x: 22, y: 36 },
              { id: 'ft', label: ':feature:tonight', x: 78, y: 36 },
              { id: 'data', label: ':core:data', x: 50, y: 64 },
              { id: 'model', label: ':core:model', x: 22, y: 92, tone: 'warm' },
              { id: 'room', label: 'Room, Retrofit', x: 78, y: 92, tone: 'muted' },
            ],
            predict: {
              q: '<code>:core:data</code> has <code>implementation(project(":core:model"))</code>. <code>:feature:recipes</code> calls <code>repository.recipes()</code>, which returns <code>List&lt;Recipe&gt;</code>. What happens when it builds?',
              options: ['It builds: the class comes along with <code>:core:data</code>', 'It fails: <code>Cannot access class \'Recipe\'</code>', 'It builds, then crashes when the screen opens'],
              a: 1,
              why: 'With <code>implementation</code>, <code>:core:model</code> stays private to <code>:core:data</code>. The feature gets a <code>Recipe</code> back but can’t see that class, so the compiler stops.',
            },
            frames: [
              { add: [['app', 'fr'], ['app', 'ft'], ['fr', 'data'], ['ft', 'data'], ['data', 'model', 'implementation'], ['data', 'room', 'implementation']], say: 'Recipes after Sam’s move. An arrow means “depends on”. <code>:core:data</code> uses <code>:core:model</code> and the libraries with <code>implementation</code>.' },
              { hl: ['fr', 'model'], add: [['fr', 'model', 'can’t see', 'err']], say: '<code>:feature:recipes</code> gets a <code>List&lt;Recipe&gt;</code> from the repository but can’t see <code>:core:model</code>: <code>Cannot access class \'Recipe\'</code>.' },
              { remove: [['fr', 'model'], ['data', 'model']], add: [['data', 'model', 'api', 'accent'], ['fr', 'model', 'sees', 'weak'], ['ft', 'model', 'sees', 'weak']], say: 'Sam changes it to <code>api(project(":core:model"))</code>. Every module that depends on <code>:core:data</code> now sees <code>:core:model</code> too, and the features build.' },
              { hl: ['model', 'data', 'fr', 'ft'], say: 'Sam adds a field to <code>Recipe</code>. Every module that sees <code>:core:model</code> compiles again: both features as well as <code>:core:data</code>. That is the price of <code>api</code>.' },
              { hl: ['room', 'data'], say: 'Then Room gets an update. Room is an <code>implementation</code> of <code>:core:data</code>, so only <code>:core:data</code> compiles again. The features never saw Room, so they keep what they compiled.' },
              { say: 'The rule: <code>api</code> only for what your public functions show, <code>implementation</code> for the rest. Fewer modules see each change, and fewer compile again.' },
            ],
          });
        },
        code: `// settings.gradle.kts
include(":core:model")

// core/data/build.gradle.kts
dependencies {
    api(project(":core:model"))                 // RecipeRepository returns Recipe: callers need it
    implementation(libs.androidx.room3.runtime)  // used only inside :core:data
    implementation(libs.retrofit)
}

// core/data/src/main/.../RecipeRepository.kt
class RecipeRepository(private val dao: RecipeDao) {
    fun recipes(): Flow<List<Recipe>> = dao.getAll()   // Recipe comes from :core:model
}

// With implementation(project(":core:model")), :feature:recipes fails:
// Cannot access class 'Recipe'. Check your module classpath for missing or conflicting dependencies.`,
        remember: 'implementation keeps a dependency private; api passes it on to every module above. Use api only for what your public functions show.',
        mistakes: [
          { title: 'Making everything api, to be safe', bad: `dependencies {
    api(project(":core:model"))
    api(libs.androidx.room3.runtime)
    api(libs.retrofit)
}`, good: `dependencies {
    api(project(":core:model"))                  // in the public functions
    implementation(libs.androidx.room3.runtime)
    implementation(libs.retrofit)
}`, why: 'Every <code>api</code> line makes more modules see that library. They compile again whenever it changes, and the features could start using Room directly, past the repository.' },
        ],
        terms: [
          { term: 'api', def: 'A way to depend on a module or library that passes it on: every module that depends on yours sees it too.' },
          { term: 'public functions', def: 'Functions and classes other modules can call. The classes they take or return must be visible to the callers.' },
        ],
        challenges: [
          { type: 'blank', prompt: '<code>RecipeRepository</code> returns <code>Recipe</code> from <code>:core:model</code> and uses Retrofit only inside. Pick the right word for each line.', code: `dependencies {
    [[api]](project(":core:model"))
    [[implementation]](libs.retrofit)
}`, why: 'Callers need <code>Recipe</code>, so <code>:core:model</code> is <code>api</code>. Retrofit stays inside <code>:core:data</code>, so <code>implementation</code> keeps it private.' },
          { type: 'bug', prompt: '<code>:feature:tonight</code> fails with <code>Cannot access class \'Recipe\'</code>. Tap the line in <code>core/data/build.gradle.kts</code> that causes it.', code: `dependencies {
    implementation(project(":core:model"))
    implementation(libs.retrofit)
}`, bug: 1, fix: '    api(project(":core:model"))', why: '<code>:core:data</code> returns <code>Recipe</code> in its public functions, so modules that use <code>:core:data</code> must see <code>:core:model</code>. <code>api</code> passes it on.' },
        ],
        quiz: [
          { q: 'When should <code>:core:data</code> use <code>api</code> for a dependency?', options: ['When its public functions take or return that dependency’s classes', 'For every library, so nothing is missing', 'Never: only the app module may use it'], a: 0, why: 'Callers must see the classes they get back. Everything else stays private with <code>implementation</code>.' },
          { q: 'Room is an <code>implementation</code> dependency of <code>:core:data</code>. Room is updated. Which modules compile again?', options: ['Only <code>:core:data</code>', '<code>:core:data</code> and every module above it', 'All modules'], a: 0, why: 'Nothing above <code>:core:data</code> sees Room, so nothing above it needs compiling again.' },
          { q: '<code>:core:model</code> is <code>api</code> in <code>:core:data</code>. Sam adds a field to <code>Recipe</code>. What compiles again?', options: ['<code>:core:model</code>, <code>:core:data</code> and every module that depends on <code>:core:data</code>', 'Only <code>:core:model</code>', 'Only <code>:core:data</code>'], a: 0, why: 'With <code>api</code>, every module above <code>:core:data</code> sees <code>:core:model</code>, so a change there reaches all of them.' },
        ],
        docs: [['Add build dependencies', 'https://developer.android.com/build/dependencies'], ['Guide to Android app modularization', 'https://developer.android.com/topic/modularization']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'signing',
        title: 'Signing',
        tagline: 'Your upload key, Google’s app signing key, and why a lost key isn’t the end.',
        goals: ['Make an upload key with <code>keytool</code> and keep it out of Git', 'Sign the release build with it in <code>signingConfigs</code>', 'Explain what the upload key and the app signing key each do'],
        level: 'intermediate', introduces: ['keytool', 'storeFile', 'storePassword', 'keyAlias', 'keyPassword', 'genkeypair'],
        body: `
<p>A phone installs an update only if it is signed with the same key as the app already on it. You met signing in the R8 lesson, with the debug key Android Studio made for you. Google Play refuses anything signed with that key, so Recipes needs a key of its own. And the key that signs the app for users has to sign every update, for as long as the app exists.</p>
<p><em>Play App Signing</em>, required for every new app on Google Play, uses two keys. The <em>app signing key</em> is kept by Google: Play signs the APKs it sends to phones with it, and phones check it. The <em>upload key</em> is yours: you sign every upload with it, and Play Console checks that the upload really comes from you. If the upload key is lost or stolen, you make a new one and ask for an <em>upload key reset</em> in Play Console, and send Play the new key’s certificate, which <code>keytool -export -rfc -keystore ~/keys/recipes-upload-2.jks -alias upload -file upload_certificate.pem</code> writes. Phones never saw the upload key, so updates keep installing.</p>
<p>Make the upload key once, with <code>keytool</code>, a tool that comes with Java (<b>Build › Generate Signed Bundle/APK</b> in Android Studio does the same with a form). It writes a <em>keystore</em>: a file, locked with a password, that holds the key under a name, its <em>alias</em>. Keep the file outside the project folder, so it never ends up in Git, and keep a backup.</p>
<p>Then tell Gradle about it. <code>signingConfigs { create("upload") { } }</code> names the file, the alias and the passwords, and <code>signingConfig = signingConfigs.getByName("upload")</code> in <code>release { }</code> replaces the debug key you used for your test phone. The passwords come from <code>local.properties</code>, read with <code>Properties</code> as in the secrets lesson, so they stay out of Git too.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'dev', label: 'Lin’s computer', sub: 'upload key' },
              { id: 'console', label: 'Play Console', sub: 'checks the upload' },
              { id: 'pas', label: 'Play App Signing', sub: 'app signing key' },
              { id: 'phone', label: 'Phones', sub: 'check every update' },
            ],
            predict: {
              q: 'Lin’s laptop, with the upload key on it, is stolen. What happens to Recipes?',
              options: ['It can never be updated again', 'Lin makes a new upload key, asks for an upload key reset, and keeps publishing', 'It has to be published again under a new application id'],
              a: 1,
              why: 'Google keeps the app signing key, the one phones check. Only the upload key is lost, and Play Console can replace it.',
            },
            frames: [
              { at: 'dev', packet: '.aab', say: 'Lin builds the release with <code>signingConfig = signingConfigs.getByName("upload")</code>. Gradle signs it with her upload key.' },
              { at: 'console', packet: '.aab', tone: 'ok', mark: { console: 'ok' }, say: 'Play Console checks the signature against the upload key it knows: this upload comes from Lin.' },
              { at: 'pas', packet: 'APKs', say: 'Play makes the APKs for each phone and signs them with the app signing key. Google keeps that key; nobody on the team holds it.' },
              { at: 'phone', packet: 'APKs', tone: 'ok', mark: { phone: 'ok' }, say: 'Phones install the update, because it is signed with the same app signing key as the Recipes they already have.' },
              { at: 'dev', packet: '.aab', tone: 'warm', mark: { console: null, phone: null }, say: 'Sam builds a release on his own laptop, where he made a new key of his own.' },
              { at: 'console', packet: '.aab', tone: 'err', mark: { console: 'err' }, say: 'Play Console refuses it: it isn’t signed with the upload key it knows. A bundle signed with the debug key is refused too.' },
              { at: 'dev', packet: 'new key', tone: 'warm', mark: { console: null }, say: 'Months later, Lin’s laptop is stolen. She makes a new upload key with <code>keytool</code>, asks for an upload key reset in Play Console, and sends Play the new key’s certificate, which <code>keytool -export -rfc</code> writes to <code>upload_certificate.pem</code>.' },
              { at: 'phone', packet: 'APKs', tone: 'ok', mark: { console: 'ok', phone: 'ok' }, say: 'Once Play has the new upload key, her uploads work again. Phones never saw the upload key, and the app signing key didn’t change, so updates keep installing.' },
            ],
          });
        },
        code: `# Terminal, once: make the upload key (keytool asks for a password; -dname is the name on the key)
keytool -genkeypair -v -keystore ~/keys/recipes-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Lin, O=Recipes"
# Generating 2,048 bit RSA key pair and self-signed certificate (SHA384withRSA) with a validity of 10,000 days
# 	for: CN=Lin, O=Recipes
# [Storing /home/lin/keys/recipes-upload.jks]

# Only after a lost key: the certificate of the new key, which goes with the reset request
keytool -export -rfc -keystore ~/keys/recipes-upload-2.jks -alias upload -file upload_certificate.pem
# Certificate stored in file <upload_certificate.pem>

# local.properties (already in .gitignore). keytool uses one password for the file and the key.
UPLOAD_STORE_FILE=/home/lin/keys/recipes-upload.jks
UPLOAD_PASSWORD=the password Lin typed

// app/build.gradle.kts (localProperties is read at the top, as in the secrets lesson)
android {
    signingConfigs {
        create("upload") {
            storeFile = file(localProperties.getProperty("UPLOAD_STORE_FILE"))
            storePassword = localProperties.getProperty("UPLOAD_PASSWORD")
            keyAlias = "upload"
            keyPassword = localProperties.getProperty("UPLOAD_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("upload")   // no longer "debug"
        }
    }
}`,
        remember: 'You sign uploads with your upload key; Google signs what phones get with the app signing key. A lost upload key can be reset. Keep the key and its passwords out of Git.',
        mistakes: [
          { title: 'Uploading a release signed with the debug key', bad: `release {
    signingConfig = signingConfigs.getByName("debug")   // left from testing
}`, good: `release {
    signingConfig = signingConfigs.getByName("upload")
}`, why: 'The debug key is fine for your own test phone, as in the R8 lesson. Google Play refuses an upload signed with it, so the version you publish is signed with your upload key.' },
        ],
        terms: [
          { term: 'keystore', def: 'A file, locked with a password, that holds one or more keys, each under a name: its alias. <code>keytool</code> makes one.' },
          { term: 'upload key', def: 'Your key, which signs every bundle you upload. Play Console checks it, and can reset it if it is lost or stolen.' },
          { term: 'app signing key', def: 'The key Google keeps and signs the APKs for phones with. Every update must be signed with it, for the whole life of the app.' },
          { term: 'Play App Signing', def: 'Google Play keeping your app signing key and signing what it sends to phones. Required for new apps.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Sign the release build with the upload key instead of the debug key.', code: `signingConfigs {
    create("upload") {
        storeFile = file(localProperties.getProperty("UPLOAD_STORE_FILE"))
        [[keyAlias]] = "upload"
    }
}
buildTypes {
    release {
        signingConfig = signingConfigs.getByName("[[upload]]")
    }
}`, why: '<code>keyAlias</code> is the name of the key inside the keystore. <code>getByName("upload")</code> picks the signing setup made with <code>create("upload")</code>.' },
          { type: 'bug', prompt: 'This build file is committed to Git. Tap the line that must never be there.', code: `signingConfigs {
    create("upload") {
        storeFile = file(localProperties.getProperty("UPLOAD_STORE_FILE"))
        storePassword = "river-lamp-42"
        keyAlias = "upload"
        keyPassword = localProperties.getProperty("UPLOAD_PASSWORD")
    }
}`, bug: 3, fix: '        storePassword = localProperties.getProperty("UPLOAD_PASSWORD")', why: 'A password in a build file ends up in Git’s history, for everyone who can read the repository. Read it from <code>local.properties</code>, which stays on your computer.' },
        ],
        quiz: [
          { q: 'Which key do phones check when an update of Recipes installs?', options: ['The app signing key', 'The upload key', 'The debug key'], a: 0, why: 'Play sends APKs signed with the app signing key. The upload key only proves to Play Console that an upload came from you.' },
          { q: 'Sam builds a release with a new key he made himself and uploads it. What happens?', options: ['Play Console refuses it: it isn’t the upload key Play knows', 'Play accepts it, because Play signs everything again anyway', 'It is accepted, but phones won’t install it'], a: 0, why: 'Play Console checks every upload against the registered upload key. A different key needs an upload key reset first.' },
          { q: 'Where should the keystore file live?', options: ['Outside the project folder, with a backup', 'In <code>app/</code>, next to the build file', 'In Git, so the whole team has it'], a: 0, why: 'Anything in the project folder can end up in Git. The keystore and its passwords stay on the computers that build releases, and a backup keeps you from losing it.' },
        ],
        docs: [['Sign your app', 'https://developer.android.com/studio/publish/app-signing']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'bundles',
        title: 'App bundles',
        tagline: 'Upload one .aab, and each phone downloads only the parts it needs.',
        goals: ['Build the App Bundle you upload with <code>./gradlew bundleProdRelease</code>', 'Explain how Play turns one bundle into split APKs for each phone', 'Try on your own phone what Play would send, with <code>bundletool</code>'],
        level: 'intermediate', introduces: ['bundleRelease', 'bundleProdRelease', 'bundletool'],
        body: `
<p>The APK of Recipes holds everything for every phone: the pictures in five sizes, one for each kind of screen sharpness, the strings in every language the app has, and, in apps with native code, that code for several kinds of processor. Each phone uses one picture size and its own languages. With one APK for everyone, every user downloads all of it.</p>
<p>That is why Google Play wants an <em>Android App Bundle</em>, a <code>.aab</code> file, and since August 2021 every new app is published with one. It holds all the compiled code and resources, ordered so Play can cut it apart. In an app without flavors, <code>./gradlew bundleRelease</code> builds it. Recipes has flavors, so the task names the flavor too, as <code>assembleProdRelease</code> did: <code>./gradlew bundleProdRelease</code> builds <code>app/build/outputs/bundle/prodRelease/app-prod-release.aab</code>, signed with your upload key from the last lesson.</p>
<p>From the bundle, Play makes <em>split APKs</em> for each phone: a <em>base APK</em> with the code and everything every phone needs, and small <em>configuration APKs</em> for that phone’s screen <em>density</em> (how sharp the screen is), its languages and, when the app has native code, its kind of processor. The phone installs them together, as one app, and Play signs them all with the app signing key.</p>
<p>A phone can’t install a <code>.aab</code>. To try what Play would send it, use <code>bundletool</code>, Google’s command-line tool that also does this job for Play. It doesn’t come with Android Studio’s command-line tools: download <code>bundletool-all-….jar</code> from its GitHub releases page and run it with <code>java -jar bundletool-all-….jar build-apks …</code>. This lesson writes <code>bundletool</code> for short. <code>bundletool build-apks</code> with <code>--connected-device</code> makes the split APKs for the phone that is plugged in, and <code>bundletool install-apks</code> installs them. Without signing settings, bundletool signs them with your debug key, which is fine for a test.</p>`,
        visual(el) {
          const ALL = { code: 9.6, mdpi: 0.6, hdpi: 0.9, xhdpi: 1.3, xxhdpi: 1.9, xxxhdpi: 2.6, en: 0.2, es: 0.2, pt: 0.2 };
          const total = Object.values(ALL).reduce((a, b) => a + b, 0);
          const inBundle = h('div', { class: 'bd-repos' });
          const files = h('div', { class: 'bd-files' });
          const bar = (name, cls) => { const fill = h('span'); const num = h('span'); return { fill, num, row: h('div', { class: 'bd-size' }, h('span', {}, name), h('div', { class: 'bd-meter' + (cls ? ' ' + cls : '') }, fill), num) }; };
          const uni = bar('everything', 'bd-uni'), mine = bar('this phone');
          const dev = h('div', { class: 'bd-d2-mono' });
          const stage = h('div', { class: 'ui-stage bd-card' }, lbl('Inside app-prod-release.aab'), inBundle, lbl('Phone'), dev, lbl('What Play sends it'), files, lbl('Download size (example numbers)'), uni.row, mine.row);
          const mb = n => n.toFixed(1) + ' MB';
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'Ada’s phone is set to English and has an xxhdpi screen. Which language files does Play send her?',
              options: ['Only English', 'English, Spanish and Portuguese', 'None: strings are in the base APK'],
              a: 0,
              why: 'Languages come in their own configuration APKs. Play sends the ones for the languages her phone is set to, here only English.',
            },
            frames: [
              { say: 'What is inside the bundle: the code, the pictures in five densities and the strings in three languages. Recipes has no native code, so there are no processor parts.' },
              { phone: 'any phone, with one APK for all', files: [['app-prod-release.apk', ALL.code + 7.3 + 0.6, false]], sum: total, say: 'Without a bundle, every phone would get one APK with everything in it. (The sizes in this demo are example numbers.)' },
              { phone: 'Ada · English · xxhdpi', pick: ['code', 'xxhdpi', 'en'], files: [['base.apk', ALL.code, false], ['config.xxhdpi.apk', ALL.xxhdpi, true], ['config.en.apk', ALL.en, true]], say: 'Ada’s phone: the base APK, the pictures for her screen and the English strings. Three files that install as one app.' },
              { phone: 'Lin · Portuguese · xhdpi', pick: ['code', 'xhdpi', 'pt'], files: [['base.apk', ALL.code, false], ['config.xhdpi.apk', ALL.xhdpi, true], ['config.pt.apk', ALL.pt, true]], say: 'Lin’s phone has a less sharp screen and is set to Portuguese: a different picture part and a different language part. The base APK is the same.' },
              { phone: 'Sam · Spanish and English · xxxhdpi', pick: ['code', 'xxxhdpi', 'es', 'en'], files: [['base.apk', ALL.code, false], ['config.xxxhdpi.apk', ALL.xxxhdpi, true], ['config.es.apk', ALL.es, true], ['config.en.apk', ALL.en, true]], say: 'Sam’s phone is set to two languages, so it gets both. A phone that later switches to another language downloads that part from Play.' },
              { phone: 'Sam’s phone, from his computer', pick: ['code', 'xxxhdpi', 'es', 'en'], files: [['base.apk', ALL.code, false], ['config.xxxhdpi.apk', ALL.xxxhdpi, true], ['config.es.apk', ALL.es, true], ['config.en.apk', ALL.en, true]], say: 'To try a release before it goes to Play, Sam runs <code>bundletool build-apks</code> with <code>--connected-device</code>, then <code>bundletool install-apks</code>. His phone gets the same parts Play would send.' },
            ],
            draw(f) {
              const pick = f.pick || [];
              inBundle.replaceChildren(...Object.keys(ALL).map(k => h('span', { class: 'bd-repo' + (pick.includes(k) ? ' bd-yes' : '') }, k)));
              dev.textContent = f.phone || 'none yet';
              files.replaceChildren(...(f.files || []).map(([n, s, feat]) => h('div', { class: 'bd-file' + (feat ? ' bd-feat' : '') }, h('span', {}, n), h('span', {}, mb(s)))));
              const sum = f.sum || (f.files || []).reduce((a, x) => a + x[1], 0);
              uni.fill.style.width = f.files ? '100%' : '0'; uni.num.textContent = f.files ? mb(total) : '';
              mine.fill.style.width = f.files ? (sum / total * 100) + '%' : '0'; mine.num.textContent = f.files ? mb(sum) : '';
            },
          });
        },
        code: `# Build the bundle you upload to Google Play (signed with the upload key)
./gradlew bundleProdRelease
# writes app/build/outputs/bundle/prodRelease/app-prod-release.aab

# bundletool is a download: java -jar bundletool-all-….jar, written bundletool below

# Try it on the phone that is plugged in, the way Play would deliver it
bundletool build-apks --bundle=app/build/outputs/bundle/prodRelease/app-prod-release.aab --output=recipes.apks --connected-device
bundletool install-apks --apks=recipes.apks
# recipes.apks holds the split APKs for this phone; install-apks installs them together`,
        remember: 'Upload one .aab. Play cuts it into a base APK and configuration APKs, so each phone downloads only its own density, languages and processor parts.',
        mistakes: [
          { title: 'Installing the bundle with adb', bad: `adb install app/build/outputs/bundle/prodRelease/app-prod-release.aab`, good: `bundletool build-apks --bundle=app/build/outputs/bundle/prodRelease/app-prod-release.aab --output=recipes.apks --connected-device
bundletool install-apks --apks=recipes.apks`, why: 'A <code>.aab</code> is a file for Google Play, not for phones, so <code>adb install</code> can’t use it. bundletool cuts it into the APKs a phone installs, as Play does.' },
        ],
        terms: [
          { term: 'Android App Bundle', def: 'The <code>.aab</code> file you upload to Google Play. It holds all the code and resources, and Play makes the APKs for each phone from it.' },
          { term: 'split APKs', def: 'Several APKs that install together as one app: a base APK plus configuration APKs for one density, the phone’s languages and its processor.' },
          { term: 'density', def: 'How sharp a screen is: how many pixels fit in an inch. Pictures come in a size for each density, like <code>xxhdpi</code>.' },
          { term: 'bundletool', def: 'Google’s command-line tool that makes, from a bundle, the APKs a phone would get from Play, and installs them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the bundle for Play, then install on the plugged-in phone what Play would send it.', code: `./gradlew [[bundleProdRelease]]
bundletool build-apks --bundle=app/build/outputs/bundle/prodRelease/app-prod-release.aab --output=recipes.apks --connected-device
bundletool [[install-apks]] --apks=recipes.apks`, why: '<code>bundleProdRelease</code> makes the <code>.aab</code> of the prod flavor. <code>build-apks</code> cuts it for the connected phone, and <code>install-apks</code> installs those APKs together.' },
          { type: 'bug', prompt: 'Lin wrote down what Play sends to Ada’s phone (English, xxhdpi screen). One line is wrong. Tap it.', code: `// What Play sends to Ada's phone
base APK          the code and what every phone needs
xxhdpi APK        the pictures for her screen
every language    all the strings.xml files`, bug: 3, fix: 'en APK            the strings in her language, English', why: 'Languages are split too. Play sends only the languages the phone is set to.' },
        ],
        quiz: [
          { q: 'What do you upload to Google Play for a new app?', options: ['An Android App Bundle, <code>.aab</code>', 'One APK for every phone', 'The keystore and the code'], a: 0, why: 'Since August 2021, new apps are published with a bundle. Play makes the APKs from it.' },
          { q: 'Why is the download from a bundle smaller than one APK with everything?', options: ['Each phone gets only its own density, languages and processor parts', 'Play compresses the code harder', 'Pictures are left out'], a: 0, why: 'The base APK is the same for everyone. The configuration APKs carry only what that phone uses.' },
          { q: 'How do you put on your phone exactly what Play would send it?', options: ['<code>bundletool build-apks</code> with <code>--connected-device</code>, then <code>bundletool install-apks</code>', '<code>adb install app-release.aab</code>', 'Run in Android Studio'], a: 0, why: 'A phone can’t install a bundle. bundletool cuts it for the connected phone and installs the parts together.' },
        ],
        docs: [['About Android App Bundles', 'https://developer.android.com/guide/app-bundle'], ['bundletool', 'https://developer.android.com/tools/bundletool']],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'tracks',
        title: 'Release tracks',
        tagline: 'Internal, closed, open, production: reach a few people first, then everyone, step by step.',
        goals: ['Say who each of the four tracks reaches', 'Roll out to production in stages, and halt a bad release', 'Give every upload a higher <code>versionCode</code>'],
        level: 'intermediate', introduces: [],
        body: `
<p>Some crashes only happen on a few kinds of phone. If a new version goes to every user at once, such a crash reaches all of them on the same day. Play Console lets you release in steps instead: first to the team, then to testers, then to a small share of users, and to everyone only when it looks good.</p>
<p>Each step is a <em>track</em>, under <b>Test and release › Testing</b> in Play Console. <b>Internal testing</b> is for up to 100 testers you add by email; a new bundle reaches them within minutes. <b>Closed testing</b> is for testers you invite, with email lists or Google Groups. <b>Open testing</b> lets anyone join from the app’s page on Play. <b>Production</b> is everyone. On each track you click <b>Create new release</b>, upload the <code>.aab</code> and start the rollout. A personal developer account made after November 13, 2023 must first run a closed test with at least 12 testers for 14 days before it can apply for production.</p>
<p>In production, a <em>staged rollout</em> gives the new version to a share of users you pick, say 5%. You watch the crashes, then raise it with <b>Manage rollout › Update rollout</b>, step by step to 100%. If crashes go up, <b>Manage rollout › Halt rollout</b> stops it: no more users get that version. Those who have it keep it, because Play can’t take an update back.</p>
<p>So a fix always goes out as a new release with a higher <code>versionCode</code>. You met <code>versionCode</code> and <code>versionName</code> in the Android track’s project files. On Play, the rule is stricter: every upload needs a <code>versionCode</code> the app has never used, and a phone only updates to a higher one; the highest Play allows is 2100000000. <code>versionName</code>, like <code>"1.4.1"</code>, is still only what people see. Users get the highest <code>versionCode</code> of all the tracks they are in, so when production has a higher one than a test track, its testers get the production version.</p>`,
        visual(el) {
          const names = ['Internal', 'Closed', 'Open', 'Production'];
          const chips = names.map(n => h('span', { class: 'bd-trk' }, n));
          const dots = Array.from({ length: 100 }, () => h('span', { class: 'bd-dot' }));
          const info = h('div', { class: 'bd-d2-mono' });
          const key = h('div', { class: 'bd-dkey' }, h('span', {}, h('i', { class: 'bd-v1' }), 'versionCode 14'), h('span', {}, h('i', { class: 'bd-v2' }), 'versionCode 15 or 16'), h('span', {}, h('i', { class: 'bd-crash' }), 'crashed on 15'));
          const stage = h('div', { class: 'ui-stage bd-card' }, lbl('Tracks'), h('div', { class: 'bd-tracks' }, chips), info, lbl('100 users of Recipes'), h('div', { class: 'bd-dots' }, dots), key);
          const CRASH = [3, 11, 17];
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'Version 15 has reached 20% of users. Crashes go up, and Lin halts the rollout. What happens to the users who already have 15?',
              options: ['Play puts version 14 back on their phones', 'They keep 15 until a newer version comes', 'Recipes is removed from their phones'],
              a: 1,
              why: 'Halting only stops more users from getting 15. Play can’t take an update back, so the fix comes as a new, higher version.',
            },
            frames: [
              { on: [], past: [], v2: 0, txt: 'Production: versionCode 14 (1.4.0), 100%', say: 'Every user has versionCode 14. The team has a new version, 15, ready.' },
              { on: ['Internal'], past: [], v2: 0, txt: 'Internal testing: versionCode 15', say: 'Lin uploads the bundle with versionCode 15 to internal testing. Minutes later the team installs it from Play and tries it.' },
              { on: ['Closed'], past: ['Internal'], v2: 0, txt: 'Closed testing: versionCode 15', say: 'Then closed testing: a few dozen invited testers use it for a week. Users still have 14.' },
              { on: ['Production'], past: ['Internal', 'Closed'], v2: 5, txt: 'Production: versionCode 15, staged rollout 5%', say: 'Production with a staged rollout at 5%: five users in a hundred get 15. Lin watches the crashes for a day.' },
              { on: ['Production'], past: ['Internal', 'Closed'], v2: 20, crash: true, txt: 'Production: versionCode 15, staged rollout 20%', say: 'All looks fine, so she raises it to 20% with <b>Update rollout</b>. Now crashes show up on one kind of phone.' },
              { on: ['Production'], past: ['Internal', 'Closed'], v2: 20, crash: true, halted: true, txt: 'Production: versionCode 15, halted at 20%', say: '<b>Halt rollout</b>. Nobody new gets 15. The 20 users who have it keep it, crashes and all.' },
              { on: ['Production'], past: ['Internal', 'Closed'], v2: 20, txt: 'Production: versionCode 16, staged rollout 20%', say: 'The fix goes out as versionCode 16, with its own staged rollout. Uploading 15 again would be refused: that number is used.' },
              { on: ['Production'], past: ['Internal', 'Closed'], v2: 100, txt: 'Production: versionCode 16, 100%', say: 'No crashes this time. Step by step to 100%: every user, those on 14 and those on 15, updates to 16.' },
            ],
            draw(f) {
              chips.forEach((c, k) => { c.className = 'bd-trk' + (f.on.includes(names[k]) ? ' bd-on' : f.past.includes(names[k]) ? ' bd-past' : ''); });
              info.textContent = f.txt;
              dots.forEach((d, k) => { d.className = 'bd-dot ' + (k < f.v2 ? (f.crash && CRASH.includes(k) ? 'bd-crash' : 'bd-v2') : 'bd-v1'); });
            },
          });
        },
        code: `// app/build.gradle.kts
android {
    defaultConfig {
        versionCode = 16        // a new, higher number for every upload
        versionName = "1.4.1"   // what people see on Google Play and in Settings
    }
}

// The way versionCode 16 goes out, in Play Console
// 1. Internal testing: the team, minutes after the upload
// 2. Closed testing: invited testers
// 3. Production, staged rollout: 5% -> 20% -> 50% -> 100%, watching crashes at each step
// Crashes go up? Manage rollout > Halt rollout. Users who have 16 keep it,
// and the fix goes out as versionCode 17.`,
        remember: 'Release step by step: internal, closed, then production in stages. Halt a bad rollout and fix forward with a higher versionCode.',
        mistakes: [
          { title: 'Uploading the fix with the same versionCode', bad: `versionCode = 15   // same number, fixed code`, good: `versionCode = 16   // every upload gets a higher number`, why: 'Play Console refuses a <code>versionCode</code> the app has already used. And a phone that has 15 only updates to a higher number.' },
        ],
        terms: [
          { term: 'track', def: 'A release channel in Play Console: internal testing, closed testing, open testing or production. It decides who can get a release.' },
          { term: 'staged rollout', def: 'A production release that Play gives to a share of users you pick, which you raise step by step.' },
          { term: 'halt', def: 'Stopping a staged rollout with <b>Manage rollout › Halt rollout</b>: no more users get that version, and those who have it keep it.' },
          { term: 'versionCode', def: 'The number from the project files lesson that orders the versions of an app. On Play, every upload needs a new, higher one; the highest Play allows is 2100000000.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'versionCode 16, version 1.4.1, is out to everyone. Get the next update ready as version 1.4.2.', code: `defaultConfig {
    [[versionCode]] = 17
    [[versionName]] = "1.4.2"
}`, why: '<code>versionCode</code> must be higher than every number used before. <code>versionName</code> is the label people see.' },
          { type: 'bug', prompt: 'Lin’s plan for the next update, after versionCode 16. One step will fail. Tap it.', code: `// The next update, after versionCode 16
1. Make the changes for 1.4.2
2. Build the bundle with versionCode = 16
3. Start a staged rollout at 5%`, bug: 2, fix: '2. Build the bundle with versionCode = 17', why: 'Play Console refuses a <code>versionCode</code> that was already used, and phones that have 16 only update to a higher one.' },
        ],
        quiz: [
          { q: 'Which track gets a new version to the team fastest?', options: ['Internal testing', 'Open testing', 'Production'], a: 0, why: 'Internal testing is for up to 100 testers, and a new bundle reaches them within minutes.' },
          { q: 'A staged rollout is at 20%, and you halt it. What happens?', options: ['No more users get it; the 20% keep it', 'The 20% go back to the old version', 'The version goes to everyone at once'], a: 0, why: 'Halting stops the rollout. Play can’t take an update back from phones that have it.' },
          { q: 'Production has versionCode 21. You publish versionCode 20 to closed testing. What do the closed testers get?', options: ['21, from production: the highest of their tracks', '20, because they are testers', 'Both, side by side'], a: 0, why: 'Everyone can get production, and users get the highest <code>versionCode</code> of all their tracks. A test version below production reaches nobody.' },
        ],
        docs: [['Set up an open, closed or internal test', 'https://support.google.com/googleplay/android-developer/answer/9845334'], ['Version your app', 'https://developer.android.com/studio/publish/versioning']],
      },

      {
        id: 'automation',
        title: 'Automating releases',
        tagline: 'A workflow builds the signed bundle and sends it to internal testing; a person decides what reaches production.',
        goals: ['Keep the upload key, its password and a Play key in repository secrets, and hand them to steps with <code>env:</code>', 'Build the signed bundle on GitHub with a <code>versionCode</code> from <code>github.run_number</code>', 'Upload it to internal testing with <code>fastlane supply</code>, and leave production to a person'],
        level: 'intermediate', introduces: ['getenv', 'env', 'run_number', 'base64', 'fastlane', 'supply', 'gem'],
        body: `
<p>Every release of Recipes is Lin at her laptop: raise <code>versionCode</code> by hand, run <code>./gradlew bundleProdRelease</code>, open Play Console, upload. It takes half an hour, a forgotten <code>versionCode</code> gets the upload refused, and while Lin is away nobody can release, because the key is on her laptop. The CI lesson’s workflow already builds every pull request on a clean machine. A second workflow, <code>release.yml</code>, can build the signed bundle and send it to internal testing on every push to <code>main</code>.</p>
<p>That machine needs the upload key and its password, and neither may be in Git. A <em>repository secret</em> holds them: <b>Settings › Secrets and variables › Actions › New repository secret</b>. A secret is text and a keystore is a file, so first write the file as text with Base64, a way to spell any file in letters and digits (it hides nothing): <code>base64 -w 0 ~/keys/recipes-upload.jks > upload.base64</code>. Paste what that file holds as the secret <code>UPLOAD_KEYSTORE_BASE64</code>, delete the file, and add <code>UPLOAD_PASSWORD</code>. In the workflow, <code>\${{ secrets.UPLOAD_PASSWORD }}</code> reads a secret, and <code>env:</code> hands it to one step as an <em>environment variable</em>, a named value that the programs in that step can read. In a command, <code>$UPLOAD_KEYSTORE_BASE64</code> reads one, and <code>base64 --decode</code> turns the text back into <code>upload.jks</code>, in <code>\${{ runner.temp }}</code>: a folder on the machine that is emptied after the job.</p>
<p>Gradle reads an environment variable with <code>System.getenv("UPLOAD_PASSWORD")</code>, which gives <code>null</code> when it isn’t set. So <code>app/build.gradle.kts</code> gets a small function, <code>setting</code>: the environment variable first, <code>local.properties</code> second, so Lin’s own builds still find her key. The machine has no <code>local.properties</code> (it isn’t in Git), so the file is only read when <code>exists()</code> says it is there. For the number, <code>\${{ github.run_number }}</code> is the run’s place in line: 1 for the workflow’s first run, then 2, 3 and on. Recipes used up to 17 by hand, so <code>versionCode</code> is 100 plus the run number: run 42 builds 142. Every run gets a new, higher number, and nobody types it. On Lin’s computer <code>RUN_NUMBER</code> isn’t set, so a local build gets 100; only the workflow’s bundles go to Play.</p>
<p>For the upload, Play needs to know the workflow. In Google Cloud, turn on the <b>Google Play Android Developer API</b>, make a <em>service account</em>, an account for a program, and download its JSON key. Invite its email in Play Console under <b>Users and permissions</b>, for Recipes only, with <b>View app information</b> and <b>Release apps to testing tracks</b>, and nothing that releases to production. Then store the key as the secret <code>PLAY_SERVICE_ACCOUNT_JSON</code>. <em>fastlane</em>, a free tool for releasing apps, written in Ruby and installed with <code>gem install fastlane</code>, uploads with <code>fastlane supply</code> and <code>--track internal</code>. Play only updates an app that has a first upload, which Recipes already has. Production stays a person’s click: when the testers are happy, Lin opens <b>Production › Create new release › Add from library</b>, picks 142 and starts a staged rollout. fastlane’s <code>screengrab</code> can also take store screenshots in every language on an emulator, and Gradle Play Publisher is a Gradle plugin that does the same upload as a Gradle task.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'push', label: 'push', sub: 'to main' },
              { id: 'key', label: 'decode', sub: 'upload.jks' },
              { id: 'bundle', label: 'bundle', sub: 'bundleProdRelease' },
              { id: 'supply', label: 'supply', sub: 'service account' },
              { id: 'internal', label: 'Internal', sub: 'testers' },
              { id: 'prod', label: 'Production', sub: 'a person decides' },
            ],
            predict: {
              q: 'This is run 42 of <code>release.yml</code>, and <code>versionCode = 100 + (setting("RUN_NUMBER")?.toInt() ?: 0)</code>. Which <code>versionCode</code> does the bundle get?',
              options: ['42', '142', '18, one more than the last upload by hand'],
              a: 1,
              why: 'The workflow passes <code>\${{ github.run_number }}</code>, 42, as <code>RUN_NUMBER</code>. Gradle adds 100, so the bundle gets 142, above the 17 Lin used by hand.',
            },
            frames: [
              { at: 'push', packet: 'run 42', say: 'Lin merges a pull request into <code>main</code>. <code>on: push</code> matches, and run 42 of <code>release.yml</code> starts on a fresh machine: checkout, Java and Gradle, as in the CI lesson.' },
              { at: 'key', mark: { push: 'ok' }, say: '<code>env:</code> hands the secret <code>UPLOAD_KEYSTORE_BASE64</code> to this step, and <code>base64 --decode</code> writes it back as <code>upload.jks</code> in <code>\${{ runner.temp }}</code>. The key never touched Git.' },
              { at: 'bundle', packet: '142', mark: { key: 'ok' }, say: '<code>./gradlew bundleProdRelease</code> gets <code>UPLOAD_STORE_FILE</code>, <code>UPLOAD_PASSWORD</code> and <code>RUN_NUMBER</code> through <code>env:</code>. <code>setting</code> finds them, so the bundle is signed with the upload key and gets versionCode 142.' },
              { at: 'supply', mark: { bundle: 'ok' }, say: '<code>fastlane supply</code> signs in as the service account with the JSON key from <code>PLAY_SERVICE_ACCOUNT_JSON</code>, and uploads <code>app-prod-release.aab</code> with <code>--track internal</code>.' },
              { at: 'internal', tone: 'ok', mark: { supply: 'ok', internal: 'ok' }, say: 'Version 142 is on internal testing. Within minutes, the team installs it from Play. Nobody typed a number or opened a laptop with the key on it.' },
              { at: 'internal', tone: 'ok', mark: { prod: 'err' }, say: 'Could the workflow go further? No: the service account can release to testing tracks only, with no permission to release to production. That step belongs to a person.' },
              { at: 'prod', tone: 'ok', mark: { prod: 'ok' }, say: 'The testers are happy. Lin opens <b>Production › Create new release › Add from library</b>, picks 142, and starts a staged rollout at 5%, as in the tracks lesson.' },
              { at: 'push', packet: 'run 43', mark: { push: '', key: '', bundle: '', supply: '', internal: '', prod: '' }, say: 'The next merge into <code>main</code> starts run 43, which builds versionCode 143 for the testers. Production stays on 142 until Lin decides.' },
            ],
          });
        },
        code: `# Once, on Lin's computer: the keystore as text, for the secret UPLOAD_KEYSTORE_BASE64
base64 -w 0 ~/keys/recipes-upload.jks > upload.base64
# (on a Mac: base64 -i ~/keys/recipes-upload.jks -o upload.base64)
# Repository secrets: UPLOAD_KEYSTORE_BASE64, UPLOAD_PASSWORD, PLAY_SERVICE_ACCOUNT_JSON

# .github/workflows/release.yml
name: Release to internal testing

on:
  push:
    branches: [main]                 # every merge into main becomes a test release

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-java@v6
        with:
          distribution: temurin
          java-version: 17
      - uses: gradle/actions/setup-gradle@v6
      - run: echo "$UPLOAD_KEYSTORE_BASE64" | base64 --decode > "\${{ runner.temp }}/upload.jks"
        env:                         # text back into the keystore file
          UPLOAD_KEYSTORE_BASE64: \${{ secrets.UPLOAD_KEYSTORE_BASE64 }}
      - run: ./gradlew bundleProdRelease
        env:
          UPLOAD_STORE_FILE: \${{ runner.temp }}/upload.jks
          UPLOAD_PASSWORD: \${{ secrets.UPLOAD_PASSWORD }}
          RUN_NUMBER: \${{ github.run_number }}    # run 42 -> versionCode 142
      - uses: ruby/setup-ruby@v1     # fastlane is written in Ruby
        with:
          ruby-version: '3.4'
      - run: gem install fastlane
      - run: fastlane supply --aab app/build/outputs/bundle/prodRelease/app-prod-release.aab --track internal --package_name com.example.recipes
        env:                         # the service account's JSON key
          SUPPLY_JSON_KEY_DATA: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}

// app/build.gradle.kts: the parts that change
val localProperties = Properties()
val localFile = rootProject.file("local.properties")
if (localFile.exists()) {            // the CI machine has no local.properties
    localProperties.load(localFile.inputStream())
}
// The environment variable on CI, local.properties on Lin's computer
fun setting(name: String): String? = System.getenv(name) ?: localProperties.getProperty(name)

android {
    defaultConfig {
        versionCode = 100 + (setting("RUN_NUMBER")?.toInt() ?: 0)   // run 42 -> 142
    }
    signingConfigs {
        create("upload") {
            storeFile = setting("UPLOAD_STORE_FILE")?.let { file(it) }
            storePassword = setting("UPLOAD_PASSWORD")
            keyAlias = "upload"
            keyPassword = setting("UPLOAD_PASSWORD")
        }
    }
}`,
        remember: 'Secrets go in repository secrets and reach a step through env:. CI builds the signed bundle with versionCode from github.run_number and uploads it to internal testing; a person promotes it to production.',
        mistakes: [
          { title: 'The Play key committed to the repository', bad: `      # play-key.json sits in the repository, next to the code
      - run: fastlane supply --aab app/build/outputs/bundle/prodRelease/app-prod-release.aab --track internal --package_name com.example.recipes --json_key play-key.json`, good: `      - run: fastlane supply --aab app/build/outputs/bundle/prodRelease/app-prod-release.aab --track internal --package_name com.example.recipes
        env:
          SUPPLY_JSON_KEY_DATA: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}`, why: 'Anyone who can read the repository, and its history, could upload as your workflow. Like the upload key, the JSON key lives only in a repository secret, and <code>SUPPLY_JSON_KEY_DATA</code> hands its text to <code>fastlane supply</code>.' },
        ],
        terms: [
          { term: 'repository secret', def: 'A value stored in a GitHub repository’s settings, such as a password. A workflow reads it with <code>\${{ secrets.NAME }}</code>; it is never in the code.' },
          { term: 'environment variable', def: 'A named value that the programs of a step can read. <code>env:</code> sets it in a workflow, <code>$NAME</code> reads it in a command, and <code>System.getenv("NAME")</code> in Gradle.' },
          { term: 'service account', def: 'An account for a program instead of a person. Invited in Play Console with <b>Release apps to testing tracks</b> and no production permission, it can upload test releases but not publish to production.' },
          { term: 'fastlane', def: 'A free tool for releasing apps. <code>fastlane supply</code> uploads a bundle to a Google Play track.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the build step the password from the secrets, and the run number for <code>versionCode</code>.', code: `- run: ./gradlew bundleProdRelease
  env:
    UPLOAD_STORE_FILE: \${{ runner.temp }}/upload.jks
    UPLOAD_PASSWORD: \${{ [[secrets]].UPLOAD_PASSWORD }}
    RUN_NUMBER: \${{ github.[[run_number]] }}`, why: '<code>secrets.UPLOAD_PASSWORD</code> reads the repository secret, and <code>github.run_number</code> goes up by one with every run, so each bundle gets a new, higher <code>versionCode</code>.' },
          { type: 'bug', prompt: 'This upload is meant for the testers only, but nothing says where it goes, and fastlane then picks production. Tap the line.', code: `- uses: ruby/setup-ruby@v1
  with:
    ruby-version: '3.4'
- run: gem install fastlane
- run: fastlane supply --aab app/build/outputs/bundle/prodRelease/app-prod-release.aab --package_name com.example.recipes
  env:
    SUPPLY_JSON_KEY_DATA: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}`, bug: 4, fix: '- run: fastlane supply --aab app/build/outputs/bundle/prodRelease/app-prod-release.aab --track internal --package_name com.example.recipes', why: 'Without <code>--track</code>, <code>fastlane supply</code> uses production. <code>--track internal</code> sends every build to the testers, and production stays a person’s decision.' },
        ],
        quiz: [
          { q: 'Why is the keystore turned into Base64 before it becomes a secret?', options: ['A secret is text: Base64 writes the file as text, and <code>base64 --decode</code> turns it back', 'Base64 encrypts the key', 'Gradle can only read Base64 keystores'], a: 0, why: 'Base64 only changes how the file is written, it hides nothing. The secret is what keeps it safe.' },
          { q: 'Run 42 failed at the upload step, and Lin clicks <b>Re-run</b>. Which <code>versionCode</code> does the new attempt build?', options: ['142 again: a re-run keeps its run number', '143', '1'], a: 0, why: '<code>github.run_number</code> doesn’t change on a re-run. That is fine here: 142 never reached Play, so the number is still free.' },
          { q: 'Version 142 works well for the testers. Who puts it in production?', options: ['A person, in Play Console: <b>Create new release › Add from library</b>', 'The workflow, on its next run', 'Play, after 14 days on internal testing'], a: 0, why: 'The service account can only release to testing tracks. Choosing what every user gets stays a person’s click.' },
        ],
        docs: [['Using secrets in GitHub Actions', 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets'], ['fastlane supply', 'https://docs.fastlane.tools/actions/supply/']],
      },
    ],
  });
})();
