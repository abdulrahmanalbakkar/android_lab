/* Show your work track. Same shape as tracks/kotlin.js. Demos use the visual kit (Lab.ui). */
(() => {
  const css = `
/* a repository page, as GitHub draws it (repo lesson) */
.pf-gh { display: grid; gap: 8px; min-width: 0; font-size: 0.78rem; }
.pf-gh-top { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; font: 700 0.8rem var(--mono); color: var(--ink); }
.pf-lic { font: 600 0.7rem var(--mono); color: var(--muted); }
.pf-files { border: 1.5px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); }
.pf-files div { display: grid; grid-template-columns: minmax(0, auto) minmax(0, 1fr); gap: 10px; padding: 4px 8px; border-top: 1px solid var(--line); font: 500 0.72rem var(--mono); }
.pf-files div:first-child { border-top: 0; }
.pf-files span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pf-files span + span { color: var(--muted); text-align: right; }
.pf-files .pf-new { background: var(--accent-soft); }
.pf-md { border: 1.5px solid var(--line); border-radius: 10px; padding: 8px 10px; background: var(--surface); display: grid; gap: 4px; min-width: 0; }
.pf-md h4 { margin: 0; font: 700 1rem var(--display); color: var(--ink); }
.pf-md h5 { margin: 4px 0 0; font: 700 0.82rem var(--display); color: var(--ink); border-bottom: 1px solid var(--line); padding-bottom: 2px; }
.pf-md p { margin: 0; line-height: 1.4; }
.pf-md ul { margin: 0; padding-left: 1.1em; line-height: 1.4; }
.pf-md code { font-size: 0.7rem; }
.pf-md.pf-empty { color: var(--muted); text-align: center; padding: 14px 10px; }
.pf-shot { width: 34px; height: 60px; border-radius: 6px; border: 1px solid var(--line); background: linear-gradient(var(--accent-soft), var(--sunk)); }

/* CI status badge */
.pf-badge { display: inline-flex; justify-self: start; border-radius: 4px; overflow: hidden; font: 600 0.66rem var(--mono); }
.pf-badge b { background: var(--ink); color: var(--bg); padding: 2px 6px; font-weight: 600; }
.pf-badge i { font-style: normal; padding: 2px 6px; background: var(--ok); color: var(--bg); }
.pf-badge.pf-fail i { background: var(--err); }

/* a store listing on the phone (publish lesson) */
.pf-store { display: grid; gap: 7px; align-content: start; padding: 10px 12px; font-size: 0.74rem; min-width: 0; }
.pf-app { display: flex; gap: 8px; align-items: center; min-width: 0; }
.pf-app b { display: block; font-size: 0.9rem; }
.pf-icon { width: 40px; height: 40px; border-radius: 10px; flex: none; display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); font: 800 1.1rem var(--display); }
.pf-ph { background: var(--sunk); border: 1px dashed var(--muted); color: var(--muted); }
.pf-small { font-size: 0.68rem; color: var(--muted); line-height: 1.35; }
.pf-strip { display: flex; gap: 5px; min-height: 60px; }
.pf-strip .pf-ph { width: 34px; height: 60px; border-radius: 6px; }
.pf-about { font-weight: 700; color: var(--ink); }
.pf-asset { display: flex; justify-content: space-between; gap: 6px; padding: 5px 7px; border: 1px solid var(--line); border-radius: 6px; font: 600 0.66rem var(--mono); }
.pf-tag { display: inline-block; justify-self: start; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--accent); color: var(--accent); font: 600 0.64rem var(--mono); }
`;

  Lab.addTrack({
    id: 'portfolio',
    title: 'Show your work',
    description: 'Put News out in the open: a repository anyone can read, CI that proves it builds and passes its tests, a published app, a short write-up of your decisions, and a weekly routine for keeping up.',
    group: 'Shipping',
    requires: ['capship'],
    css,
    lessons: [
      {
        id: 'repo',
        title: 'A repository others can read',
        tagline: 'A README, a tidy top folder, commit messages that explain, and a licence.',
        goals: ['Write a README that says what the app is, shows it, and says how to run it', 'Write commit messages with a short subject and, when it helps, a reason', 'Add a licence, so others know what they may do with your code'],
        level: 'beginner', introduces: ['README', 'LICENSE'],
        body: `
<p>Sam has never seen News. He opens <code>github.com/ada/news</code> and finds folders called <code>app</code>, <code>gradle</code> and <code>baselineprofile</code>, with no word about what the app does, how to run it, or whether he may reuse any of it. He closes the tab. Your repository is the first thing people see of your work, so make it readable in a minute.</p>
<p>GitHub shows a file named <code>README.md</code> below the file list, drawn as a page. It is Markdown, like <code>AGENTS.md</code>: <code>#</code> starts a heading and <code>-</code> a list item. Two more pieces: text between backticks shows as code, and <code>![The article list](docs/list.png)</code> shows an image, with the words read out in its place between the brackets and its path between the parentheses. A good README has four parts: what the app is, in a line or two; a screenshot (the <b>Take screenshot</b> button in the emulator’s toolbar makes one); how to run it; and what comes next. <code>AGENTS.md</code> stays: it is for agents, the README is for people.</p>
<p>Keep the top folder for what a visitor needs first: the README, the licence, <code>AGENTS.md</code> and the build files. Screenshots and longer notes go in <code>docs/</code>. Check that <code>.gitignore</code> still lists <code>local.properties</code>, with the upload key’s password. And write commit messages for the next reader: a subject of about 50 characters that says what the commit does, and, when the reason isn’t obvious, a body that says why. A second <code>-m</code> adds the body, after a blank line. GitHub shows each file’s latest subject next to it.</p>
<p>Last, a licence. Without one, the author keeps all the rights, as the <a href="#aidev.safety">licences lesson</a> said: people may read the code but not reuse it. On GitHub, <b>Add file › Create new file</b>, name it <code>LICENSE</code>, click <b>Choose a license template</b>, pick one, such as MIT, then <b>Review and submit</b> and <b>Commit changes</b>. MIT and Apache-2.0 both let anyone use, change and share the code as long as they keep your copyright notice and the licence text. <code>git pull</code> brings the new file down.</p>`,
        visual(el) {
          const files = (extra) => [['app/', 'Sign the release build with the upload key'], ['baselineprofile/', 'Create the News project'], ...(extra.includes('docs') ? [['docs/', 'Add a README with a screenshot', 1]] : []), ['gradle/', 'Create the News project'], ['.gitignore', 'Create the News project'], ['AGENTS.md', 'Add the rules for agents'], ...(extra.includes('lic') ? [['LICENSE', 'Create LICENSE', 1]] : []), ...(extra.includes('docs') ? [['README.md', 'Add a README with a screenshot', 1]] : []), ['build.gradle.kts', 'Create the News project']]
            .map(([n, m, isNew]) => `<div${isNew ? ' class="pf-new"' : ''}><span>${n}</span><span>${m}</span></div>`).join('');
          const readme = `<div class="pf-md"><h4>News</h4><p>A news reader for Android that keeps working with no signal. It lists headlines, opens each article, and sends alerts for breaking and local stories.</p><div class="pf-shot" role="img" aria-label="The article list"></div><h5>How to run</h5><ul><li>Clone the repository and open the folder in Android Studio.</li><li>Pick a phone or an emulator and press Run.</li><li>Run the tests with <code>./gradlew test</code>.</li></ul><h5>What’s next</h5><ul><li>A filter by source</li><li>A “saved for later” star</li><li>Search</li></ul></div>`;
          const page = (extra) => `<div class="pf-gh"><div class="pf-gh-top">ada / news${extra.includes('lic') ? '<span class="pf-lic">MIT license</span>' : ''}</div><div class="pf-files">${files(extra)}</div>${extra.includes('docs') ? readme : '<div class="pf-md pf-empty">No README yet: GitHub offers an <b>Add a README</b> button here.</div>'}</div>`;
          Lab.ui.terminal(el, {
            panelTitle: 'github.com/ada/news',
            predict: {
              q: 'Ada adds <code>README.md</code> to the top folder of News and pushes it. Where does GitHub show it?',
              options: ['Below the file list, drawn as a page', 'Only when someone opens the file', 'In the Actions tab'],
              a: 0,
              why: 'GitHub looks for a README in the top folder and draws it under the files, so it is the first thing a visitor reads.',
            },
            frames: [
              { panel: page([]), say: 'What Sam sees: folders, each with its latest commit message, and nothing that says what News is.' },
              { cmd: 'git status', out: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nUntracked files:\n\tREADME.md\n\tdocs/\n\nnothing added to commit but untracked files present (use "git add" to track)', say: 'Ada wrote <code>README.md</code> and saved a screenshot of the list as <code>docs/list.png</code>. <code>local.properties</code> isn’t listed: <code>.gitignore</code> skips it. (A hint line is cut.)' },
              { cmd: 'git add README.md docs', say: 'Both go on the list for the next commit. A folder name adds everything inside it.' },
              { cmd: 'git commit -m "Add a README with a screenshot" -m "Says what News does, how to run it and what comes next."', out: '[main 92e1c73] Add a README with a screenshot\n 2 files changed, 21 insertions(+)\n create mode 100644 README.md\n create mode 100644 docs/list.png', say: 'The first <code>-m</code> is the subject: what the commit does. The second is the body: why. Git prints only the subject here.' },
              { cmd: 'git push', out: 'To https://github.com/ada/news.git\n   5a053b5..92e1c73  main -&gt; main', panel: page(['docs']), say: 'On GitHub, the README now sits under the file list: what News is, how it looks, how to run it, what’s next.' },
              { panel: page(['docs', 'lic']), say: 'In the browser: <b>Add file › Create new file</b>, the name <code>LICENSE</code>, <b>Choose a license template</b>, MIT, <b>Review and submit</b>, <b>Commit changes</b>. GitHub names the commit “Create LICENSE” and shows the licence at the top.' },
              { cmd: 'git pull', out: 'From https://github.com/ada/news\n   92e1c73..429d60c  main       -&gt; origin/main\nUpdating 92e1c73..429d60c\nFast-forward\n LICENSE | 21 +++++++++++++++++++++\n 1 file changed, 21 insertions(+)\n create mode 100644 LICENSE', say: 'That commit was made on GitHub, so Ada pulls it down to her computer.' },
              { cmd: 'git log --oneline', out: '429d60c (HEAD -&gt; main, origin/main) Create LICENSE\n92e1c73 Add a README with a screenshot\n5a053b5 Sign the release build with the upload key\nf228a59 Book a sync when a push arrives\nbae9021 Create the News project', say: 'The subjects read like a list of what happened to News. Anyone can follow it without opening a single file.' },
            ],
          });
        },
        code: `<!-- README.md, in the top folder of News -->
# News

A news reader for Android that keeps working with no signal.
It lists headlines, opens each article, and sends alerts for breaking and local stories.

![The article list](docs/list.png)

## How to run

- Clone the repository and open the folder in Android Studio.
- Pick a phone or an emulator and press Run.
- Run the tests with \`./gradlew test\`.

The list loads from https://news.example.com.
Alerts need a server that sends FCM messages; without one, the app still lists and opens articles.

## What's next

- A filter by source
- A "saved for later" star
- Search

<!-- The top folder: README.md, LICENSE, AGENTS.md, .gitignore, build files,
     app/, baselineprofile/, gradle/, and docs/ for screenshots and notes -->

<!-- Terminal: a subject that says what, a body that says why -->
<!-- git commit -m "Add a README with a screenshot" -m "Says what News does, how to run it and what comes next." -->`,
        remember: 'A README with what, a screenshot, how to run and what’s next; a subject that says what each commit does; and a LICENSE, so others may reuse the code.',
        mistakes: [
          { title: 'A subject that says nothing', bad: `git commit -m "fixes"`, good: `git commit -m "Ignore story types this version doesn't know" -m "A newer server may send types News 1.0 can't show."`, why: 'In <code>git log --oneline</code> and next to every file on GitHub, “fixes” tells nobody what changed. The subject says what; the body, when it helps, says why.' },
        ],
        terms: [
          { term: 'README', def: 'The file <code>README.md</code> in the top folder. GitHub shows it below the file list: what the project is, how to run it, what comes next.' },
          { term: 'image (Markdown)', def: '<code>![words](path)</code>: the image at <code>path</code>, with <code>words</code> read out or shown when the image can’t be seen.' },
          { term: 'subject line', def: 'The first line of a commit message, about 50 characters, saying what the commit does. A second <code>-m</code> adds a body that says why.' },
          { term: 'LICENSE', def: 'The file in the top folder with the licence’s text. It tells others what they may do with the code.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the README its heading, and show the screenshot below the first line.', code: '[[#]] News\n\nA news reader for Android that keeps working with no signal.\n\n[[!]][The article list](docs/list.png)', why: '<code>#</code> starts a heading. An image is a link with <code>!</code> in front: the words in brackets, the path in parentheses.' },
          { type: 'bug', prompt: 'Next to <code>app/</code>, GitHub will show this commit’s subject to every visitor. Tap the line that tells them nothing.', code: 'git add app/src/main/java/com/example/news/ui/ArticleListScreen.kt\ngit commit -m "stuff"\ngit push', bug: 1, fix: 'git commit -m "Show the source under each headline"', why: 'The subject says what the commit does, in a few words. “stuff” would need a reader to open the diff.' },
        ],
        quiz: [
          { q: 'What should the first lines of a README say?', options: ['What the app is and does', 'A list of every file', 'Every commit so far'], a: 0, why: 'A visitor decides in a minute. The file list and the history are already on the page.' },
          { q: 'In <code>git commit -m "Add a README" -m "Says what News does."</code>, what is the second <code>-m</code>?', options: ['A second commit', 'The body of the message, after a blank line', 'The author’s name'], a: 1, why: 'Each <code>-m</code> adds a paragraph. The first is the subject; the next ones form the body.' },
          { q: 'A public repository has no licence. May Sam copy its code into his app?', options: ['Yes, it is public', 'No: without a licence, the author keeps all the rights', 'Yes, if he changes the names'], a: 1, why: 'Public means anyone may read it. Reuse needs permission, and a licence is that permission.' },
        ],
        docs: [['About READMEs', 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes'], ['Adding a license to a repository', 'https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository']],
      },

      {
        id: 'ci',
        title: 'CI that proves it works',
        tagline: 'Build News and run its unit tests on every push, and show the result in the README.',
        goals: ['Run lint, the unit tests and the debug build on every push and pull request', 'Keep the build working on a machine that has only what is in Git', 'Add a status badge to the README'],
        level: 'intermediate', introduces: [],
        body: `
<p>The quality pass gave News tests, but tests only help when someone runs them. Ada forgets to now and then, and one day a change that breaks the offline message reaches <code>main</code> without anyone noticing. In the <a href="#tools.ci">CI lesson</a>, a workflow ran lint and built the app on every pull request. News gets one too, and this one also runs the tests.</p>
<p><code>.github/workflows/android.yml</code> is the same file with two changes. <code>on:</code> lists <code>push:</code> with no branches, so it runs on every push to any branch, and <code>pull_request:</code>; a push to a branch with an open pull request runs it twice, one check for each. And the <code>run:</code> step adds <code>test</code>: <code>./gradlew lint test assembleDebug</code> runs the tests in <code>app/src/test</code> on the CI machine, in seconds. The UI tests need an emulator, which takes more setup there, so keep running <code>connectedAndroidTest</code> yourself before you merge.</p>
<p>The first run turns red before lint starts. The machine has only what is in Git. Ada hasn’t given News a <code>release.yml</code> yet, so its <code>app/build.gradle.kts</code> still loads <code>local.properties</code> the way the release build step wrote it, and <code>.gitignore</code> keeps that file out. Gradle reads every build file before it runs any task, so that one line stops everything. The fix is the one Recipes got in the <a href="#build.automation">release automation lesson</a>: load the file only if it <code>exists()</code>, and read each value through <code>setting()</code>, which gives <code>null</code> when nothing is set. The debug build and the tests don’t need the key; a <code>release.yml</code> like Recipes’ can build the signed bundle later.</p>
<p>Last, show the result. GitHub draws a <em>status badge</em> for each workflow at <code>https://github.com/ada/news/actions/workflows/android.yml/badge.svg</code>; put it as an image at the top of the README. It shows the latest result on <code>main</code>, “passing” or “failing”, so a visitor sees at once that the code builds and its tests pass. Badges of private repositories can’t be seen from outside GitHub.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'The workflow runs <code>./gradlew lint test assembleDebug</code> for the first time, on the CI machine. What happens?',
              options: ['Everything passes, as on Ada’s computer', 'Gradle stops before any task: <code>local.properties</code> isn’t there', 'Only the tests fail'],
              a: 1,
              why: 'The machine gets only what is in Git. The build file loads <code>local.properties</code>, and <code>.gitignore</code> keeps it out of Git.',
            },
            nodes: [
              { id: 'push', label: 'git push', sub: 'to any branch' },
              { id: 'machine', label: 'Fresh machine', sub: 'checkout, Java, Gradle' },
              { id: 'run', label: './gradlew lint test assembleDebug' },
              { id: 'badge', label: 'Badge', sub: 'in the README' },
            ],
            frames: [
              { at: 'push', packet: 'push', say: 'Ada commits <code>.github/workflows/android.yml</code> and pushes <code>main</code>. <code>on: push</code> matches.' },
              { at: 'machine', packet: 'push', say: 'A fresh Linux machine downloads the repository, then installs Java 17 and Gradle. It has every file in Git, and nothing else.' },
              { at: 'run', packet: 'failing', tone: 'err', mark: { run: 'err' }, say: 'Gradle reads the build files first and stops: <code>Build file \'/home/runner/work/news/news/app/build.gradle.kts\' line: 14</code>, <code>/home/runner/work/news/news/local.properties (No such file or directory)</code>. Lint and the tests never started. (An example: the line number depends on your file.)' },
              { at: 'badge', packet: 'failing', tone: 'err', mark: { badge: 'err' }, say: 'The badge at the top of the README now reads <span class="pf-badge pf-fail"><b>Android CI</b><i>failing</i></span>.' },
              { at: 'push', packet: 'fix', mark: { run: '', badge: '' }, say: 'The fix from the release automation lesson, in <code>app/build.gradle.kts</code>: load <code>local.properties</code> only if it exists, and read values through <code>setting()</code>. Ada commits and pushes.' },
              { at: 'run', packet: 'passing', tone: 'ok', mark: { run: 'ok' }, say: 'Lint is clean, the 7 unit tests pass (<code>NewsViewModelTest</code> and <code>ReadingTimeTest</code>), and the debug APK builds: <code>BUILD SUCCESSFUL</code>.' },
              { at: 'badge', packet: 'passing', tone: 'ok', mark: { badge: 'ok' }, say: '<span class="pf-badge"><b>Android CI</b><i>passing</i></span> Anyone who opens the repository sees that <code>main</code> builds and its tests pass.' },
              { at: 'run', packet: 'pull request', tone: 'err', mark: { run: 'err', badge: 'ok' }, say: 'Later, Sam’s branch changes the offline message. His pull request gets a red cross, with <code>NewsViewModelTest &gt; offline refresh ends with a message FAILED</code> and <code>7 tests completed, 1 failed</code> in the log (an example). <code>main</code> is untouched, and its badge stays green.' },
            ],
          });
        },
        code: `# .github/workflows/android.yml
name: Android CI                # the badge shows this name

on:
  push:                         # every push, to any branch
  pull_request:                 # and every pull request

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-java@v6
        with:
          distribution: temurin
          java-version: 17
      - uses: gradle/actions/setup-gradle@v6
      - run: ./gradlew lint test assembleDebug   # lint, the unit tests, the debug APK

// app/build.gradle.kts: the fix from the release automation lesson
val localProperties = Properties()
val localFile = rootProject.file("local.properties")
if (localFile.exists()) {                      // false on CI: it isn't in Git
    localProperties.load(localFile.inputStream())
}
fun setting(name: String): String? = System.getenv(name) ?: localProperties.getProperty(name)

android {
    signingConfigs {
        create("upload") {
            storeFile = setting("UPLOAD_STORE_FILE")?.let { file(it) }   // null on CI: debug and tests don't need it
            storePassword = setting("UPLOAD_PASSWORD")
            keyAlias = "upload"
            keyPassword = setting("UPLOAD_PASSWORD")
        }
    }
}

<!-- README.md, first lines -->
# News

![Android CI](https://github.com/ada/news/actions/workflows/android.yml/badge.svg)`,
        remember: 'One workflow runs lint, the unit tests and the debug build on every push and pull request; it sees only what is in Git; the badge shows main’s result to everyone.',
        mistakes: [
          { title: 'A build file that needs a file Git doesn’t have', bad: `localProperties.load(rootProject.file("local.properties").inputStream())
// on CI:
// * What went wrong:
// /home/runner/work/news/news/local.properties (No such file or directory)`, good: `val localFile = rootProject.file("local.properties")
if (localFile.exists()) {
    localProperties.load(localFile.inputStream())
}`, why: 'Gradle reads every build file before running any task, so one missing file stops lint, the tests and the build. Load it only if it exists, and let values that aren’t there be <code>null</code>.' },
        ],
        terms: [
          { term: 'status badge', def: 'A small image GitHub draws for a workflow, “passing” or “failing”, at <code>…/actions/workflows/android.yml/badge.svg</code>. By default it shows the default branch.' },
          { term: 'configuration (Gradle)', def: 'The first part of every Gradle run: it reads all the build files. An error there stops every task, even <code>lint</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the workflow on every push and every pull request, and run the unit tests too.', code: 'on:\n  [[push]]:\n  [[pull_request]]:\n\n# …\n      - run: ./gradlew lint [[test]] assembleDebug', why: '<code>push:</code> with no branches matches every push. <code>test</code> runs the tests in <code>app/src/test</code>.' },
          { type: 'bug', prompt: 'The workflow is <code>.github/workflows/android.yml</code>, but the badge never appears in the README. Tap the line.', code: '# News\n\n![Android CI](https://github.com/ada/news/actions/workflows/ci.yml/badge.svg)\n\nA news reader for Android that keeps working with no signal.', bug: 2, fix: '![Android CI](https://github.com/ada/news/actions/workflows/android.yml/badge.svg)', why: 'The badge address names the workflow’s file. There is no <code>ci.yml</code>, so there is no badge to draw.' },
        ],
        quiz: [
          { q: 'Why did the first run fail before lint even started?', options: ['The machine has only what is in Git, and the build file loads <code>local.properties</code>', 'Lint is too slow on CI', 'GitHub needs the upload key’s password'], a: 0, why: 'Gradle reads every build file first. A missing file there stops all the tasks.' },
          { q: 'What does the badge show, without anything added to its address?', options: ['The latest result on the default branch, <code>main</code>', 'The result of your last pull request', 'How many tests there are'], a: 0, why: 'A red pull request doesn’t turn the badge red: it shows <code>main</code>, what visitors get.' },
          { q: 'With <code>push:</code> and <code>pull_request:</code>, a push to a branch with an open pull request runs the workflow…', options: ['once', 'twice, once for each event', 'not at all'], a: 1, why: 'Both events match, and each gets its own check on the pull request.' },
        ],
        docs: [['Adding a workflow status badge', 'https://docs.github.com/en/actions/how-tos/monitor-workflows/add-a-status-badge'], ['Events that trigger workflows', 'https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows']],
      },

      {
        id: 'publish',
        title: 'Publishing your app',
        tagline: 'A store listing that shows what News does, or a GitHub Release with an APK.',
        goals: ['Fill in a store listing: name, descriptions, icon and screenshots', 'Publish an APK as a GitHub Release when the app isn’t on Google Play', 'Explain why the Play copy and the GitHub copy can’t update each other'],
        level: 'intermediate', introduces: [],
        body: `
<p>A link to an app people can install says more than any description. You already know the path to Google Play: a signed bundle (<a href="#build.signing">signing</a>, <a href="#build.bundles">bundles</a>), the testing tracks (<a href="#build.tracks">tracks</a>, <a href="#capship.ship">shipping News</a>) and the policies (<a href="#launch.policy">policy</a>). This lesson is about what readers see before they install: the <em>store listing</em>.</p>
<p>In Play Console it is the <b>Main store listing</b> page. Text: the app name (up to 30 characters), a short description (up to 80; the first text people see) and a full description (up to 4,000). Graphics: a 512 × 512 PNG icon, a 1024 × 500 <em>feature graphic</em> that Play uses to show the app off, and at least two screenshots, up to eight per kind of device. Screenshots are JPEG or PNG without transparency, each side between 320 and 3,840 pixels, the long side at most twice the short one. Take them in the emulator, on real screens: the list, an article, an alert. Say plainly what the app does: repeated or unrelated keywords can get an app suspended.</p>
<p>Not on Play? A <em>GitHub Release</em> also gives people something to install. <code>./gradlew assembleRelease</code> builds <code>app-release.apk</code>, signed with your upload key. On GitHub: <b>Releases › Draft a new release</b>, type <code>v1.0</code> in <b>Choose a tag</b> and click <b>Create new tag</b>, add a title and notes, drop the APK into the box for files, and click <b>Publish release</b>. A <em>tag</em> is a name fixed to one commit, so <code>v1.0</code> always leads to the code that built it.</p>
<p>To install it, readers allow their browser in the <b>Install unknown apps</b> settings. And the two copies are signed differently: Play signs with the app signing key it keeps, your APK carries the upload key, so a phone can’t update one with the other. Point people to one place.</p>`,
        visual(el) {
          const shots = (n) => [0, 1].map(k => k < n ? '<div class="pf-shot"></div>' : '<div class="pf-ph"></div>').join('');
          const store = (s) => `<div class="pf-store">
<div class="pf-app"><div class="pf-icon${s.icon ? '' : ' pf-ph'}">${s.icon ? 'N' : ''}</div><div>${s.name ? '<b>News</b>' : '<span class="pf-small">App name</span>'}<div class="pf-small">Ada Lind</div></div></div>
<span class="ui-m-btn">Install</span>
<div class="pf-strip">${shots(s.shots || 0)}</div>
<p class="pf-small">${s.short ? 'Headlines that keep working with no signal.' : 'Short description'}</p>
<span class="pf-small${s.full ? ' pf-about' : ''}">About this app ›</span>
</div>`;
          const about = `<div class="ui-m-bar">About this app</div><div class="ui-m-body"><p class="pf-small">News lists the day’s headlines and keeps every article on your phone, so you can read on a train with no signal. Alerts for breaking and local news open the story they are about.</p><p class="pf-small">Choose which alerts you get in your phone’s settings.</p></div>`;
          const release = `<div class="ui-m-bar">ada / news · Releases</div><div class="pf-store"><span class="pf-tag">v1.0</span><b>News 1.0</b><p class="pf-small">The first release: headlines, articles that work offline, and alerts for breaking and local news.</p><div class="pf-asset"><span>news-1.0.apk</span><span>⇩</span></div><div class="pf-asset"><span>Source code (zip)</span><span>⇩</span></div></div>`;
          const unknown = `${release}<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Install unknown apps</b><p class="pf-small">Browser</p><div class="ui-m-row"><div>Allow from this source</div><span class="ui-m-chip">On</span></div></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Main store listing',
            predict: {
              q: 'Ada fills in the name, both descriptions, the icon, the feature graphic and one screenshot. Can she publish the listing?',
              options: ['Yes, everything has something in it', 'No: it needs at least two screenshots', 'No: it needs a video first'],
              a: 1,
              why: 'A listing needs at least two screenshots before it can be published. A video is optional.',
            },
            frames: [
              { screen: store({}), say: 'What readers see before they install. Empty, the listing can’t be published.' },
              { screen: store({ name: 1, icon: 1 }), log: ['App name: News (30 characters at most)', 'App icon: 512 × 512 PNG'], say: 'A short, plain name and the launcher icon, as a 512 × 512 PNG.' },
              { screen: store({ name: 1, icon: 1, short: 1 }), log: 'Short description: 43 of 80 characters', say: 'The short description is the first text people read. One sentence: what News does for them.' },
              { screen: store({ name: 1, icon: 1, short: 1, shots: 2 }), log: ['Phone screenshots: 2 (at least 2, at most 8)', 'Feature graphic: 1024 × 500, no transparency'], say: 'Two screenshots from the emulator’s <b>Take screenshot</b> button: the list and an article. Plus the feature graphic, which Play uses in places that show the app off.' },
              { screen: about, tap: '.ui-m-bar', log: 'Full description: 4,000 characters at most', say: 'The full description, behind “About this app”: what it does, in plain sentences. No list of keywords.' },
              { screen: release, log: 'Not on Play: a GitHub Release', say: 'Without a Play listing, Ada publishes a GitHub Release: tag <code>v1.0</code>, notes, and the APK from <code>./gradlew assembleRelease</code>, renamed <code>news-1.0.apk</code>. GitHub adds the source code by itself.' },
              { screen: unknown, tap: '.ui-m-chip', say: 'A reader taps the APK. The first time, Android asks them to allow the browser in <b>Install unknown apps</b>.' },
            ],
          });
        },
        code: `# Google Play: Play Console › Main store listing
# App name            News                                          (up to 30 characters)
# Short description   Headlines that keep working with no signal.   (up to 80)
# Full description    what News does, in plain sentences            (up to 4,000)
# App icon            512 × 512 PNG
# Feature graphic     1024 × 500, JPEG or PNG without transparency
# Screenshots         at least 2, up to 8 per kind of device; each side 320 to 3,840 px,
#                     the long side at most twice the short one (emulator: Take screenshot)

# Not on Play: a GitHub Release
./gradlew assembleRelease
#   app/build/outputs/apk/release/app-release.apk, signed with your upload key
# GitHub › Releases › Draft a new release
#   Choose a tag: v1.0 › Create new tag
#   Release title: News 1.0
#   Notes: what's in it
#   Attach: app-release.apk, renamed news-1.0.apk
#   Publish release
# Readers allow their browser in Install unknown apps.
# The Play copy and this APK are signed differently: one can't update the other.`,
        remember: 'A listing needs a plain name, two descriptions, an icon, a feature graphic and at least two real screenshots; without Play, a GitHub Release with a tag and the signed APK.',
        terms: [
          { term: 'store listing', def: 'The page readers see on Google Play before they install: name, descriptions, icon, feature graphic and screenshots.' },
          { term: 'feature graphic', def: 'A 1024 × 500 image Play uses to show the app off in some places.' },
          { term: 'GitHub Release', def: 'A page on GitHub for one version: a tag, notes, and files people can download, such as an APK.' },
          { term: 'tag', def: 'A name fixed to one commit, like <code>v1.0</code>. Unlike a branch, it doesn’t move.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the APK to attach to the GitHub Release: the release code, signed with your upload key.', code: './gradlew [[assembleRelease]]\n# app/build/outputs/apk/release/app-release.apk', why: '<code>assembleRelease</code> builds the release APK, as in the release build step. <code>bundleRelease</code> builds a bundle, which only Play installs.' },
          { type: 'bug', prompt: 'Play Console won’t publish this listing. Tap the line.', code: 'App name: News\nShort description: Headlines that keep working with no signal.\nApp icon: 512 x 512 PNG\nFeature graphic: 1024 x 500 PNG\nPhone screenshots: 1', bug: 4, fix: 'Phone screenshots: 2', why: 'A listing needs at least two screenshots before it can be published.' },
        ],
        quiz: [
          { q: 'How long can the short description be?', options: ['30 characters', '80 characters', '4,000 characters'], a: 1, why: '30 is the app name, 4,000 the full description.' },
          { q: 'A reader installed <code>news-1.0.apk</code> from GitHub. Why won’t Play update it to the Play version?', options: ['The signatures differ: Play signs with its app signing key, the APK carries your upload key', 'Play doesn’t update apps older than a month', 'The versionCode is too low'], a: 0, why: 'An update must be signed with the same key as the installed app. Point people to one place.' },
          { q: 'What is the tag <code>v1.0</code>?', options: ['A branch for version 1.0', 'A name fixed to one commit, the code that built 1.0', 'The APK file'], a: 1, why: 'A branch moves with every commit. A tag stays where you put it.' },
        ],
        docs: [['Add preview assets to showcase your app', 'https://support.google.com/googleplay/android-developer/answer/9866151'], ['Managing releases in a repository', 'https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository']],
      },

      {
        id: 'explain',
        title: 'Explaining your decisions',
        tagline: 'A short write-up: what you chose, what it cost, and what you would change.',
        goals: ['Write one short entry per decision: the choice, the alternative, the trade-offs', 'Name what a choice costs, not only what it gives', 'Say what you would change, now that you know more'],
        level: 'beginner', introduces: [],
        body: `
<p>Lin reads the News code and has questions. Why is there a database in a news app? Why does a push book a sync instead of carrying the article? Why data messages? The code shows <em>what</em> News does; it can’t show <em>why</em>. Those answers are in Ada’s head today, and gone in six months. So she writes them down in <code>docs/decisions.md</code>, linked from the README.</p>
<p>One short entry per decision, under a <code>##</code> heading that names it, with four parts. <b>Why</b>: the reason, tied to a real need. <b>Instead of</b>: the option you didn’t choose, and why it lost. <b>Trade-offs</b>: a <em>trade-off</em> is what a choice costs to get what it gives, and every choice has some. <b>What I’d change</b>: what you know now that you didn’t then.</p>
<p>The costs make it believable. An entry with only gains reads like an advert, and a reader stops trusting the rest. Keep each entry to a few lines, write it when you make the decision rather than at the end, and when a “What I’d change” line becomes real, add a link to the pull request that did it.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 330,
            predict: {
              q: 'Which of these belongs under <b>Trade-offs</b> for “Room is the source of truth”?',
              options: ['The list works with no signal', 'Every change to a table needs a new version and a migration', 'Hilt builds the repository'],
              a: 1,
              why: 'Working offline is what the choice gives. The migrations are what it costs. Hilt is a different decision.',
            },
            nodes: [
              { id: 'dec', label: 'Room is the source of truth', x: 50, y: 9 },
              { id: 'g1', label: 'Works with no signal', x: 25, y: 36, tone: 'ok', hidden: true },
              { id: 'g2', label: 'One place the screens read', x: 25, y: 62, tone: 'ok', hidden: true },
              { id: 'c1', label: 'A migration for every table change', x: 75, y: 36, tone: 'warm', hidden: true },
              { id: 'c2', label: 'Old stories pile up', x: 75, y: 62, tone: 'warm', hidden: true },
              { id: 'alt', label: 'Instead of: show what the server sends', x: 25, y: 89, tone: 'muted', hidden: true },
              { id: 'ch', label: 'Next: delete stories older than 30 days', x: 75, y: 89, hidden: true },
            ],
            frames: [
              { hl: ['dec'], say: 'Lin’s first question: why a database in a news app? The entry starts with the decision, under its own heading.' },
              { show: ['g1', 'g2'], add: [['dec', 'g1', '', 'ok'], ['g1', 'g2', '', 'ok']], say: '<b>Why</b>, on the left: readers open News on trains with no signal. The screens read only Room, and a refresh only writes to it.' },
              { show: ['alt'], hl: ['alt'], say: '<b>Instead of</b>: showing what the server sends. Less code, but an empty screen in every tunnel.' },
              { show: ['c1'], add: [['dec', 'c1', '', 'warm']], hl: ['c1'], say: '<b>Trade-offs</b>, on the right: every change to a table needs a new version, a migration and its schema file, as when News got reading times.' },
              { show: ['c2'], add: [['c1', 'c2', '', 'warm']], hl: ['c2'], say: 'And stories stay on the phone until something deletes them. Nothing does yet.' },
              { show: ['ch'], add: [['c2', 'ch', '', 'accent']], hl: ['ch'], say: '<b>What I’d change</b>: let <code>SyncWorker</code> delete stories older than 30 days. One honest line turns a cost into a plan.' },
              { hl: ['dec', 'alt', 'c1', 'c2'], say: 'Lin now knows what was chosen, what was weighed against it and what it costs, without asking. A few short lines did it.' },
            ],
          });
        },
        code: `<!-- docs/decisions.md, linked from the README -->
# Decisions

## Offline first, with Room as the source of truth
### Why
Readers open News on trains and in tunnels. The screens read only Room; refresh() only writes to it.
### Instead of
Showing what the server sends: less code, but an empty screen with no signal.
### Trade-offs
- Every change to a table needs a new version, a migration and its schema file.
- Stories stay on the phone until something deletes them.
### What I'd change
- Delete stories older than 30 days in SyncWorker.
- Load the list in pages with Paging once the archive grows.

## Data messages, not notification messages
### Why
News picks the channel by type, links the alert to its article and books a sync.
### Instead of
Notification messages: while News is in the background, Android shows them by itself and none of our code runs.
### Trade-offs
- Every message goes through our code, so every version must ignore types it doesn't know.
- The server may add keys, but never rename or reuse them.
### What I'd change
- Nothing yet.`,
        remember: 'One short entry per decision: why, instead of what, what it costs, and what you’d change. Write it when you decide.',
        mistakes: [
          { title: 'A decision without its costs', bad: `## Room is the source of truth
### Trade-offs
- None. Room is the best choice.`, good: `## Room is the source of truth
### Trade-offs
- Every change to a table needs a new version, a migration and its schema file.
- Stories stay on the phone until something deletes them.`, why: 'Every choice costs something. Naming the costs shows you weighed them, and tells the next person what to watch.' },
        ],
        terms: [
          { term: 'trade-off', def: 'What a choice costs to get what it gives, like migrations in exchange for working offline.' },
          { term: 'alternative', def: 'An option you considered and didn’t choose. Writing it down shows why it lost.' },
          { term: 'decisions file', def: 'A short document in the repository, such as <code>docs/decisions.md</code>, with one entry for each important choice.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete the entry: the heading for what the choice costs.', code: '## Data messages, not notification messages\n### Why\nNews picks the channel by type and books a sync.\n### Instead of\nNotification messages: Android shows them by itself in the background.\n### [[Trade-offs]]\n- Every version must ignore types it doesn\'t know.', why: 'Under <b>Trade-offs</b> goes what the choice costs: here, code that has to handle every message.' },
          { type: 'bug', prompt: 'One line under <b>Trade-offs</b> is a gain, not a cost. Tap it.', code: '## Room is the source of truth\n### Trade-offs\n- Every change to a table needs a new version and a migration.\n- The list works with no signal.\n- Stories stay on the phone until something deletes them.', bug: 3, fix: '- Every row takes space on the phone.', why: 'Working offline is why the choice was made, so it belongs under <b>Why</b>. Trade-offs are its costs.' },
        ],
        quiz: [
          { q: 'Why write down the option you didn’t choose?', options: ['So readers see it was weighed, and why it lost', 'To make the file longer', 'So you can switch to it later without thinking'], a: 0, why: 'Otherwise the next person suggests it again and you have the same discussion twice.' },
          { q: 'When is the best time to write an entry?', options: ['When you make the decision', 'Right before you publish the app', 'Only if someone asks'], a: 0, why: 'The reasons are fresh then. Months later, you would be guessing.' },
          { q: 'An entry lists three gains and no costs. What does a reader think?', options: ['That the author weighed nothing, so the rest is harder to trust', 'That the choice was perfect', 'Nothing: costs don’t matter'], a: 0, why: 'Every choice has costs. Naming them is what makes the write-up believable.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first']],
      },

      {
        id: 'keep-learning',
        title: 'Keep learning',
        tagline: 'Release notes, a changelog, official docs and samples, and a small weekly routine.',
        goals: ['Read release notes and tell a stable version from an alpha', 'Keep a changelog for your own app', 'Follow a short weekly routine for keeping up'],
        level: 'beginner', introduces: [],
        body: `
<p>News is finished; its libraries are not. Kotlin has a language release every six months and a tooling release three months after each one, and AndroidX libraries change every few weeks. Nobody keeps up with all of it. A small routine, once a week, keeps up with what <em>your</em> app uses.</p>
<p>Start with <em>release notes</em>. Each AndroidX library has a page, newest version first, with headings such as Bug Fixes, API Changes and New Features. The versions have stages: <b>alpha</b> (APIs may still change), <b>beta</b> (complete, may have bugs), <b>rc</b> (a candidate for stable) and <b>stable</b>. Apps you ship use stable. On 21 October 2026, Room 3’s newest version is <code>3.1.0-alpha03</code>; the newest stable is <code>3.0.3</code>, which News already has. Read the alpha’s notes to see what’s coming, and wait. Kotlin lists its releases on kotlinlang.org, with a “What’s new” page for each language release.</p>
<p>Your app needs notes too. A <em>changelog</em>, <code>CHANGELOG.md</code>, lists each version, newest first, under headings such as Added and Fixed. Its lines become the “What’s new” text in Play Console, up to 500 characters per language, and the notes of a GitHub Release.</p>
<p>Then read code. The official samples at developer.android.com/samples show whole apps built the recommended way. When a library surprises you, open its source and read the tests for the function you call: they show how it is meant to be used. The routine: release notes for the libraries in <code>libs.versions.toml</code>; at most one update, on a branch, which CI checks; one sample or test file; and a line in your notes. Most weeks nothing needs updating. That is a fine result.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            predict: {
              q: 'Room’s newest version is <code>3.1.0-alpha03</code>. News uses <code>3.0.3</code>, the newest stable. Update News now?',
              options: ['Yes: newest is best', 'No: an alpha’s APIs may still change; read its notes and wait for stable', 'Yes, if the build still passes'],
              a: 1,
              why: 'Apps you ship use stable versions. An alpha can change or remove APIs before it is stable.',
            },
            nodes: [
              { id: 'notes', label: 'Release notes', sub: 'libs.versions.toml' },
              { id: 'update', label: 'At most one update', sub: 'branch, CI' },
              { id: 'read', label: 'Read code', sub: 'a sample, a test' },
              { id: 'log', label: 'Write it down', sub: 'notes, changelog' },
            ],
            frames: [
              { at: 'notes', packet: 'Room 3', say: 'Thursday, half an hour. Ada goes down <code>libs.versions.toml</code> and opens each library’s release notes. Room 3: <code>3.1.0-alpha03</code> came out on 21 October 2026.' },
              { at: 'notes', packet: 'alpha', tone: 'warm', mark: { notes: 'warm' }, say: 'An alpha: its APIs may still change. News stays on <code>3.0.3</code>, the newest stable. She reads the notes anyway, to see what is coming.' },
              { at: 'notes', packet: 'Kotlin', mark: { notes: 'ok' }, say: 'Kotlin’s releases page: <code>2.4.21</code>, from 8 October, is the newest, and News has it. Navigation <code>2.10.2</code>: the newest stable too.' },
              { at: 'update', packet: 'nothing', tone: 'ok', mark: { update: 'ok' }, say: 'Nothing to update this week. On a week that has one, it goes on its own branch, with a commit like “Update Navigation to …”, and CI runs the tests.' },
              { at: 'read', packet: 'a sample', say: 'She opens one of the official samples and reads how it tests its repository, next to News’s <code>FakeNewsRepository</code>.' },
              { at: 'log', packet: 'one line', tone: 'ok', mark: { log: 'ok' }, say: 'One line in her notes: Room 3.1 is coming, with its notes linked, to check when it turns stable.' },
              { at: 'log', packet: '1.3', mark: { log: 'ok' }, say: 'On a release week, the same habit fills <code>CHANGELOG.md</code>, and its lines become the “What’s new” text on Play.' },
            ],
          });
        },
        code: `<!-- CHANGELOG.md, newest first (older entries cut) -->
# Changelog

## 1.3
### Added
- Reading time under each headline.
- Summaries of long stories, labelled as written by AI.

## 1.2
### Fixed
- The crash that halted the 1.1 rollout.

<!-- Play Console › the release › Release notes: up to 500 characters per language -->
<en-US>
Each headline now shows how long it takes to read.
Long stories have a summary, labelled as written by AI.
</en-US>

<!-- Once a week, about 30 minutes
1. Release notes for every library in gradle/libs.versions.toml
   (developer.android.com/jetpack/androidx/versions, kotlinlang.org/docs/releases.html)
2. At most one update to a stable version, on its own branch; CI runs the tests
3. Read one official sample or one library test
4. One line in your notes; on a release week, the changelog -->`,
        remember: 'Read the release notes of what you use, ship only stable versions, keep a changelog, read real code, and do it a little every week.',
        terms: [
          { term: 'release notes', def: 'What changed in a version: bug fixes, new features, changed APIs. Every library publishes them, and so should your app.' },
          { term: 'alpha, beta, rc, stable', def: 'A version’s stages. Alpha APIs may still change; stable is what apps you ship should use.' },
          { term: 'changelog', def: 'A file, often <code>CHANGELOG.md</code>, listing each version of a project, newest first, with what was added and fixed.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Room’s release notes list <code>3.1.0-alpha03</code> and the stable <code>3.0.3</code>. Keep News on the newest stable.', code: '[versions]\nroom3 = "[[3.0.3]]"', why: 'Apps you ship use stable versions. The alpha’s notes are worth reading, not shipping.' },
          { type: 'bug', prompt: 'News should only use stable versions. Tap the line.', code: '[versions]\nkotlin = "2.4.21"\nnavigation = "2.10.2"\nroom3 = "3.1.0-alpha03"', bug: 3, fix: 'room3 = "3.0.3"', why: '<code>alpha03</code> means alpha: its APIs may still change. <code>3.0.3</code> is the newest stable.' },
        ],
        quiz: [
          { q: 'What does “alpha” mean in <code>3.1.0-alpha03</code>?', options: ['Its APIs may still change before it is stable', 'It is the best version so far', 'It fixes only bugs'], a: 0, why: 'Beta is complete but may have bugs, rc is a candidate, stable is for apps you ship.' },
          { q: 'Where should Play’s “What’s new” text come from?', options: ['The changelog entry for that version', 'The commit subjects, pasted in', 'The README'], a: 0, why: 'The changelog already says what changed for readers. Play allows 500 characters per language.' },
          { q: 'A library function doesn’t behave the way you expected. A good place to look first?', options: ['Its tests, in the library’s source', 'A random forum answer from years ago', 'Nowhere: rewrite it yourself'], a: 0, why: 'Tests show how the authors mean a function to be used, and they run against the real code.' },
        ],
        docs: [['AndroidX releases', 'https://developer.android.com/jetpack/androidx/versions'], ['Kotlin releases', 'https://kotlinlang.org/docs/releases.html']],
      },
    ],
  });
})();
