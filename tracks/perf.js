/* Performance track. Same shape as tracks/kotlin.js.
   Lessons (assembled from rb/perf/chunk_*.js) use only the shared Lab.ui demos, so the track needs no css of its own. */
(() => {
  const css = ``;

  Lab.addTrack({
    id: 'perf',
    title: 'Performance',
    description: 'Find out why an app stutters, freezes, leaks memory or starts slowly, measure it with the right tool, and fix it. Then shrink the release build with R8, and keep the code it can’t see you use.',
    group: 'Going deeper', requires: ['arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'frame',
        title: 'Frames and jank',
        tagline: 'The screen gets a new picture many times a second, and each one has a deadline.',
        goals: ['Work out how much time one frame gets at 60 and 120 Hz', 'Explain what jank is and why one slow job causes it', 'Find the Logcat line that says frames were skipped'],
        level: 'beginner', introduces: [],
        body: `
<p>Lin scrolls through her 80 recipes. Most of the time the list glides, but every few rows it stops for a moment and then jumps ahead. Nothing crashes and nothing is wrong on the screen, yet the app feels cheap. That stutter has a name, and this track is about finding slow spots like it and fixing them.</p>
<p>A phone’s screen shows a new picture many times a second. Each picture is a <em>frame</em>. The <em>refresh rate</em>, in hertz (Hz), says how many: at 60 Hz the screen wants 60 frames a second, so the app has 1000 ÷ 60 ≈ 16.7 milliseconds to get each one ready. That is the <em>frame budget</em>. Many newer phones run at 90 or 120 Hz, which leaves 11.1 or only 8.3 ms. In that time the main thread runs the composables that changed, works out where everything goes, and draws.</p>
<p>When a frame isn’t ready by its deadline, the screen shows the old picture again. The list stands still for a moment, then jumps to catch up. That stop-and-jump is <em>jank</em>. One 40 ms job at 60 Hz misses two deadlines. While you scroll, <code>LazyColumn</code> builds each new row as it comes into view, inside a frame, so slow code in a row janks the whole scroll.</p>
<p>A long stall leaves a note in Logcat, under the tag <code>Choreographer</code>, the part of Android that times the frames: <code>Skipped 42 frames!  The application may be doing too much work on its main thread.</code> It only appears when 30 or more frames in a row were missed, half a second at 60 Hz. Shorter stutters need the tools in the next lessons.</p>`,
        visual(el) {
          const dl = [16.7, 33.3, 50, 66.7, 83.3].map(at => ({ at, label: '', tone: 'muted' }));
          Lab.ui.timeline(el, {
            lanes: ['main thread', 'screen'],
            span: 100,
            unit: 'ms',
            predict: {
              q: 'At 60 Hz there is a deadline every 16.7 ms. One frame’s work takes 40 ms. How many times does the screen show the old picture again?',
              options: ['None: the screen waits for it', 'Twice', 'Forty times'],
              a: 1,
              why: 'The work starts at one deadline and runs past the next two. At both, the screen has nothing new, so it shows the old frame again.',
            },
            frames: [
              { marks: dl, now: 0, say: 'Time runs left to right, 100 ms in all. Each thin mark is a deadline: at 60 Hz the screen takes a new frame every 16.7 ms.' },
              { bars: [{ lane: 0, from: 0, to: 9, label: 'frame 1', tone: 'ok' }, { lane: 1, from: 16.7, to: 33.3, label: '1', tone: 'ok' }], now: 16.7, say: 'The main thread gets frame 1 ready in 9 ms, well inside the budget. At the first deadline the screen shows it.' },
              { bars: [{ lane: 0, from: 16.7, to: 25, label: 'frame 2', tone: 'ok' }, { lane: 1, from: 33.3, to: 50, label: '2', tone: 'ok' }], now: 33.3, say: 'Frame 2 is quick too. The list moves a little with every frame: smooth.' },
              { bars: [{ lane: 0, from: 33.3, to: 73.3, label: 'new row: 40 ms', tone: 'err' }], now: 50, say: 'A new recipe row scrolls into view, and building it takes 40 ms. The deadline at 50 ms comes, and frame 3 isn’t ready.' },
              { bars: [{ lane: 1, from: 50, to: 66.7, label: '2 again', tone: 'warm' }, { lane: 1, from: 66.7, to: 83.3, label: '2 again', tone: 'warm' }], now: 73.3, say: 'Two deadlines pass with nothing new, so the screen shows frame 2 twice more. For 33 ms the list stands still.' },
              { bars: [{ lane: 1, from: 83.3, to: 100, label: '3', tone: 'ok' }], now: 83.3, say: 'Frame 3 lands at the next deadline, and the list jumps ahead to catch up. That stop-and-jump is jank. At 120 Hz the same 40 ms would miss even more deadlines.' },
            ],
          });
        },
        code: `@Composable
fun RecipeList(recipes: List<Recipe>) {
    LazyColumn {
        items(recipes, key = { recipe -> recipe.id }) { recipe ->
            RecipeRow(recipe)   // runs inside a frame, as the row scrolls into view
        }
    }
}

@Composable
fun RecipeRow(recipe: Recipe) {
    // At 60 Hz the whole frame, this row included, gets 16.7 ms.
    // Keep this body quick: no file reads, no big calculations.
    Text("\${recipe.title} · \${recipe.minutes} min")
}

// Logcat, tag:Choreographer, after a long stall:
// Skipped 42 frames!  The application may be doing too much work on its main thread.`,
        play: `fun main() {
    val workMs = 40.0          // one slow row
    for (hz in listOf(60, 90, 120)) {
        val budgetMs = 1000.0 / hz
        println("$hz Hz: $budgetMs ms per frame, late: \${workMs > budgetMs}")
    }
    // Change workMs to 10.0. At which rates is the frame on time now?
}
// 60 Hz: 16.666666666666668 ms per frame, late: true
// 90 Hz: 11.11111111111111 ms per frame, late: true
// 120 Hz: 8.333333333333334 ms per frame, late: true`,
        remember: '60 Hz gives each frame 16.7 ms, 120 Hz only 8.3 ms. A frame that misses its deadline is jank.',
        terms: [
          { term: 'frame', def: 'One picture on the screen. A smooth app gets a new one ready for every refresh.' },
          { term: 'refresh rate', def: 'How many frames the screen shows per second, in hertz (Hz): 60, 90 or 120 on most phones.' },
          { term: 'frame budget', def: 'The time the app has to get one frame ready: 1000 ms divided by the refresh rate, 16.7 ms at 60 Hz.' },
          { term: 'jank', def: 'A visible stutter: frames missed their deadline, so the screen showed the old picture again and then jumped.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show only the lines about skipped frames in Logcat’s query box.', code: `tag:[[Choreographer]]`, why: '<code>Choreographer</code> is the part of Android that times frames. It writes the “Skipped … frames!” line under its own tag.' },
          { type: 'bug', prompt: 'This should print the budget at 120 Hz, but it prints 16.666666666666668. Tap the line to change.', code: `fun main() {
    val hz = 120
    val budgetMs = 1000.0 / 60
    println("At $hz Hz each frame gets $budgetMs ms")
}`, bug: 2, fix: '    val budgetMs = 1000.0 / hz', why: 'The budget is 1000 ms divided by the refresh rate. Dividing by <code>hz</code> gives 8.333333333333334 at 120 Hz.' },
        ],
        quiz: [
          { q: 'At 60 Hz, how long does the app have to get one frame ready?', options: ['60 ms', 'About 16.7 ms', 'One second'], a: 1, why: '1000 ms ÷ 60 frames ≈ 16.7 ms per frame.' },
          { q: 'A frame isn’t ready when its deadline comes. What does the screen show?', options: ['A blank screen', 'An error dialog', 'The previous frame again'], a: 2, why: 'The screen keeps the old picture until a new frame is ready. The pause and the jump after it are jank.' },
          { q: 'Scrolling stutters, but Logcat has no “Skipped … frames!” line. How can that be?', options: ['Jank can’t happen when the line is missing', 'The line only appears after 30 or more missed frames in a row', 'Logcat only works at 60 Hz'], a: 1, why: 'Short stutters of a few frames don’t reach the limit of 30. They are still jank, and the profiler later in this track finds them.' },
        ],
        docs: [['Slow rendering', 'https://developer.android.com/topic/performance/vitals/render']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'main-thread',
        title: 'The main thread',
        tagline: 'Let StrictMode point at the slow work hiding on the main thread.',
        goals: ['List the places where your code runs on the main thread', 'Turn on StrictMode in the debug build', 'Follow a StrictMode report to the line that blocks, and move that work off the main thread'],
        level: 'beginner', introduces: ['StrictMode', 'setThreadPolicy', 'ThreadPolicy', 'detectDiskReads', 'detectDiskWrites', 'detectNetwork', 'penaltyLog', 'BuildConfig', 'DEBUG', 'buildFeatures', 'buildConfig'],
        body: `
<p>Sam adds a quick <b>Export</b> button to Recipes. On his new phone it works at once. On Lin’s older phone the screen hangs for a moment after every tap. Writing a file takes a few milliseconds on one phone and hundreds on another, so slow work can hide on your own phone and show up only on someone else’s.</p>
<p>From the coroutines track you know the rule: the main thread draws the screen, so it must never wait. The hard part is noticing where your code runs on it. Code in <code>onClick</code>, in a composable’s body and in lifecycle callbacks such as <code>onCreate</code> runs on the main thread, and so does a coroutine from <code>LaunchedEffect</code> or <code>viewModelScope</code> unless you give it another dispatcher. Reading or writing a file or a database, or talking to a server, blocks the thread while it waits.</p>
<p><code>StrictMode</code> is Android’s own checker for this. You tell it what to watch for on the main thread, such as <code>detectDiskReads()</code>, <code>detectDiskWrites()</code> and <code>detectNetwork()</code>, and what to do when it sees one. That event is a <em>violation</em>, and <code>penaltyLog()</code> writes each one to Logcat under the tag <code>StrictMode</code>, with a stack trace that leads to your line. Turn it on in <code>RecipesApp.onCreate()</code>, which runs once when the app starts, before any screen.</p>
<p>StrictMode is for you while you build the app, not for users, so turn it on only in the debug build. The debug build is the one Run installs; the release build is the one you give to users. <code>BuildConfig.DEBUG</code> is <code>true</code> only in the debug build. Gradle makes the <code>BuildConfig</code> class once you add <code>buildFeatures { buildConfig = true }</code> inside <code>android { }</code> in <code>app/build.gradle.kts</code>. When StrictMode points at a line, the fix is the one you know: put the slow part inside <code>withContext(Dispatchers.IO)</code>.</p>`,
        visual(el) {
          const list = `<div class="ui-m-bar">Recipes</div><div class="ui-m-body"><div class="ui-m-row"><div>Pancakes · 20 min</div></div><div class="ui-m-row"><div>Tomato soup · 30 min</div></div><div class="ui-m-row"><div>Lentil curry · 40 min</div></div><span class="ui-m-btn exp">Export recipes</span></div>`;
          const done = list.replace('</div></div><span', '</div></div><span class="ui-m-muted">Exported 80 recipes</span><span');
          Lab.ui.phone(el, {
            logTitle: 'Logcat · tag:StrictMode',
            predict: {
              q: 'StrictMode is on with <code>detectDiskWrites()</code> and <code>penaltyLog()</code>. The Export button writes a file right inside <code>onClick</code>. What happens when Lin taps it?',
              options: ['A StrictMode line with a stack trace appears in Logcat', 'The app crashes', 'Nothing: the write is quick on her phone'],
              a: 0,
              why: 'StrictMode reports every disk write on the main thread, fast or slow. <code>penaltyLog()</code> only writes it down; the app keeps running.',
            },
            frames: [
              { screen: list, say: 'Recipes on Lin’s older phone, in the debug build with StrictMode on. The panel shows Logcat with the query <code>tag:StrictMode</code>.' },
              { tap: '.exp', log: 'StrictMode  D  StrictMode policy violation; ~duration=212 ms: android.os.strictmode.DiskWriteViolation', say: 'She taps Export. The <code>onClick</code> writes the file on the main thread, and for 212 ms the screen can’t move. StrictMode reports a disk write on the main thread.' },
              { log: '	at com.example.recipes.ExportKt.saveExportNow(Export.kt:12)', say: 'Further down the stack trace (the system’s lines in between are cut here), the first line from your package names the function and the line: <code>saveExportNow</code>, line 12 of <code>Export.kt</code>.' },
              { screen: done, say: 'The file is written, late. On Sam’s phone the same write took a few milliseconds, which is why he never saw a problem.' },
              { screen: list, say: 'The fix: the write moves inside <code>withContext(Dispatchers.IO)</code> in a <code>suspend</code> function, and the button calls it from <code>scope.launch</code>.' },
              { tap: '.exp', screen: done, say: 'Tap again: no new StrictMode line, and the screen keeps moving while the file is written.' },
            ],
          });
        },
        code: `// app/build.gradle.kts, inside android { }:
// buildFeatures { buildConfig = true }

@HiltAndroidApp
class RecipesApp : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {               // only in the debug build
            StrictMode.setThreadPolicy(
                StrictMode.ThreadPolicy.Builder()
                    .detectDiskReads()
                    .detectDiskWrites()
                    .detectNetwork()
                    .penaltyLog()              // write each violation to Logcat
                    .build()
            )
        }
    }
}

// Export.kt: StrictMode pointed here. Before, the write ran on the main thread:
// fun saveExportNow(folder: File, recipes: List<Recipe>) {
//     File(folder, "recipes.txt").writeText(exportText(recipes))
// }
suspend fun saveExport(folder: File, recipes: List<Recipe>) {
    withContext(Dispatchers.IO) {              // now the write waits on a background thread
        File(folder, "recipes.txt").writeText(exportText(recipes))
    }
}`,
        remember: 'Turn on StrictMode in the debug build. Every line it logs is main-thread work to move into withContext(Dispatchers.IO).',
        terms: [
          { term: 'StrictMode', def: 'Android’s checker that watches the main thread for disk and network work and reports it. Set up with <code>StrictMode.setThreadPolicy(...)</code>.' },
          { term: 'violation', def: 'One time StrictMode saw what you asked it to watch for, such as a disk write on the main thread.' },
          { term: 'penaltyLog', def: 'Tells StrictMode to write each violation to Logcat, with a stack trace, under the tag <code>StrictMode</code>.' },
          { term: 'BuildConfig.DEBUG', def: '<code>true</code> in the debug build, <code>false</code> in the release build. Needs <code>buildFeatures { buildConfig = true }</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Report every file read on the main thread in Logcat.', code: `StrictMode.setThreadPolicy(
    StrictMode.ThreadPolicy.Builder()
        .[[detectDiskReads]]()
        .[[penaltyLog]]()
        .build()
)`, why: '<code>detectDiskReads()</code> says what to watch for, and <code>penaltyLog()</code> says what to do: write it to Logcat.' },
          { type: 'bug', prompt: 'StrictMode logs a <code>DiskReadViolation</code> in <code>loadNote</code>, which a <code>LaunchedEffect</code> calls. Tap the line to change.', code: `suspend fun loadNote(folder: File): String {
    val file = File(folder, "note.txt")
    return file.readText()
}`, bug: 2, fix: '    return withContext(Dispatchers.IO) { file.readText() }', why: 'A <code>suspend</code> function runs on the thread that called it, here the main thread. <code>withContext(Dispatchers.IO)</code> moves the read to a background thread and gives back its text.' },
        ],
        quiz: [
          { q: 'Which of these runs on the main thread?', options: ['The code in a button’s <code>onClick</code>', 'The block inside <code>withContext(Dispatchers.IO)</code>', 'Both'], a: 0, why: 'Taps are handled on the main thread. <code>withContext(Dispatchers.IO)</code> runs its block on a background thread.' },
          { q: 'What does <code>penaltyLog()</code> do?', options: ['Crashes the app on the first violation', 'Moves the slow work to another thread', 'Writes each violation to Logcat with a stack trace'], a: 2, why: 'It only reports. Moving the work is your job, once you know where it is.' },
          { q: 'Why turn on StrictMode only when <code>BuildConfig.DEBUG</code> is <code>true</code>?', options: ['It is a tool for you while you build; users don’t need its checks or log lines', 'It doesn’t compile in the release build', 'It makes the debug build faster'], a: 0, why: 'StrictMode finds problems during development. The release build is the one you give to users.' },
        ],
        docs: [['StrictMode', 'https://developer.android.com/reference/android/os/StrictMode']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'anr',
        title: 'ANRs',
        tagline: 'What makes Android say “isn’t responding”, and how to find the cause.',
        goals: ['Name the deadlines that trigger an ANR', 'Explain why waiting for other work on the main thread causes one', 'Find the ANR line in Logcat and see why Google Play counts them'],
        level: 'beginner', introduces: [],
        body: `
<p>Sam is on a train and taps Refresh in Recipes. The screen freezes, and a few seconds later Android shows <b>Recipes isn’t responding</b>, with <b>Close app</b> and <b>Wait</b>. Most people tap Close app. Google Play counts these too: <em>Android vitals</em> in the Play Console shows the share of users who saw one, and at 0.47% or more, Play is likely to show the app to fewer people.</p>
<p>You met the main rule in the coroutines track: if a tap or key press isn’t handled within 5 seconds, that is an ANR. It isn’t the only deadline. Android also calls the other components from the manifest on the main thread and gives them a limit: a <code>&lt;receiver&gt;</code>, the code that reacts to a system event, must finish within 5 seconds while the app is on screen, and a service’s start-up code within a few seconds.</p>
<p>So an ANR always means the main thread was stuck: busy with a long job, or waiting for something else. The classic one is waiting on purpose. <code>runBlocking</code> blocks the thread it runs on until the coroutines inside finish, which is why it is never used in an app. In an <code>onClick</code> around a network call, the main thread waits for the server, and in a tunnel that wait can last far longer than 5 seconds. Sending work to another thread doesn’t help either if the main thread then waits for it.</p>
<p>When it happens on your phone, Android writes it to Logcat: <code>ANR in com.example.recipes (com.example.recipes/.MainActivity)</code>, followed by a <code>Reason</code> line. <code>Input dispatching timed out</code> there means a tap waited too long. The line comes from Android itself, so clear <code>package:mine</code> from the query box to see it. For your users’ phones, the Play Console collects ANRs with the stack trace of the main thread: the first lines from your package show where it was stuck.</p>`,
        visual(el) {
          const rows = '<div class="ui-m-row r1"><div>Pancakes · 20 min</div></div><div class="ui-m-row"><div>Tomato soup · 30 min</div></div><div class="ui-m-row"><div>Lentil curry · 40 min</div></div>';
          const list = `<div class="ui-m-bar">Recipes</div><div class="ui-m-body">${rows}<span class="ui-m-btn refresh">Refresh</span></div>`;
          const busy = `<div class="ui-m-bar">Recipes</div><div class="ui-m-body">${rows}<span class="ui-m-muted">Refreshing…</span></div>`;
          const anr = list + '<div class="ui-m-scrim"><div class="ui-m-dialog"><b>Recipes isn’t responding</b><span class="ui-m-btn ghost">Close app</span><span class="ui-m-btn ghost">Wait</span></div></div>';
          const detail = '<div class="ui-m-bar">← Pancakes</div><div class="ui-m-body"><div class="ui-m-row"><div>1. Mix flour and eggs</div></div><div class="ui-m-row"><div>2. Fry for 2 minutes</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Main thread',
            predict: {
              q: 'Refresh runs <code>runBlocking { repository.refresh(force = true) }</code> in its <code>onClick</code>. Sam is in a tunnel, so the server never answers. He taps Pancakes one second later. What does he see?',
              options: ['Pancakes opens at once', '“Recipes isn’t responding” about 5 seconds after his tap', 'Nothing ever: the app stays frozen without a message'],
              a: 1,
              why: 'The main thread is stuck in <code>runBlocking</code>, so the tap waits in line. After 5 seconds without handling it, Android shows the ANR dialog.',
            },
            frames: [
              { screen: list, log: 'free: drawing frames, handling taps', say: 'Recipes, with Sam in a tunnel. The panel shows what the main thread is doing.' },
              { tap: '.refresh', log: 'Refresh: runBlocking waits for the server', say: 'He taps Refresh. Its <code>onClick</code> runs <code>runBlocking</code> around the network call, so the main thread stops and waits for the server.' },
              { tap: '.r1', log: 'tap on Pancakes: waiting in line', say: 'A second later he taps Pancakes. Nothing happens: the tap waits until the main thread is free.' },
              { screen: anr, log: '5 s without handling the tap', say: 'Five seconds after his tap, Android gives up waiting and shows the ANR dialog. Most people close the app here.' },
              { log: 'ActivityManager  E  ANR in com.example.recipes (com.example.recipes/.MainActivity)', say: 'Logcat gets a line from Android. Its <code>Reason</code> line starts with <code>Input dispatching timed out</code>: a tap waited too long.' },
              { screen: busy, log: 'fixed: onClick calls viewModel.refresh(force = true)', say: 'The fix: <code>onClick</code> calls the ViewModel, which starts the refresh in <code>viewModelScope.launch</code>. The coroutine waits; the main thread doesn’t.' },
              { tap: '.r1', screen: detail, log: 'tap on Pancakes: handled at once', say: 'While the refresh is still waiting for the server, the tap on Pancakes opens it at once.' },
            ],
          });
        },
        code: `// Before: the main thread waits for the server. In a tunnel, that is an ANR.
Button(onClick = {
    runBlocking { repository.refresh(force = true) }   // blocks the main thread
}) {
    Text("Refresh")
}

// After: the ViewModel starts a coroutine, and the main thread stays free.
Button(onClick = { viewModel.refresh(force = true) }) {
    Text("Refresh")
}

// RecipesViewModel (shortened: the real refresh also sets isRefreshing and catches IOException)
fun refresh(force: Boolean) {
    viewModelScope.launch {
        repository.refresh(force)    // waits without blocking the main thread
    }
}

// Logcat (clear package:mine first):
// ANR in com.example.recipes (com.example.recipes/.MainActivity)`,
        remember: 'An ANR means the main thread was stuck past a deadline: 5 s for a tap. Never make it wait, not even for another thread.',
        mistakes: [
          {
            title: 'Waiting for a background thread from the main thread',
            bad: `fun onRefresh() {
    runBlocking {
        withContext(Dispatchers.IO) {   // the work runs on a background thread...
            repository.refresh(force = true)
        }
    }                                   // ...but the main thread waits right here
}`,
            good: `fun onRefresh() {
    viewModelScope.launch {
        repository.refresh(force = true)
    }
}`,
            why: 'Moving work to another thread doesn’t help when the main thread then waits for it. <code>runBlocking</code> always waits; <code>launch</code> starts the work and returns at once.',
          },
        ],
        terms: [
          { term: 'Android vitals', def: 'The part of the Google Play Console that counts ANRs, crashes and slow starts on your users’ phones.' },
          { term: 'ANR rate', def: 'The share of daily users who saw an ANR. At 0.47% or more, Google Play is likely to show the app to fewer people.' },
          { term: 'Input dispatching timed out', def: 'The <code>Reason</code> of an ANR where a tap or key press wasn’t handled within 5 seconds.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start the refresh in the ViewModel without blocking the main thread.', code: `fun refresh(force: Boolean) {
    viewModelScope.[[launch]] {
        repository.refresh(force)
    }
}`, why: '<code>launch</code> starts a coroutine and returns at once. The coroutine can wait for the server while the main thread keeps drawing.' },
          { type: 'bug', prompt: 'In a tunnel, tapping Refresh ends in “Recipes isn’t responding”. Tap the line to change.', code: `Button(onClick = {
    runBlocking { repository.refresh(force = true) }
}) {
    Text("Refresh")
}`, bug: 1, fix: '    viewModel.refresh(force = true)', why: '<code>runBlocking</code> holds the main thread until the server answers. <code>viewModel.refresh</code> starts a coroutine in <code>viewModelScope</code> and returns at once.' },
        ],
        quiz: [
          { q: 'Which of these can cause an ANR?', options: ['A coroutine in <code>viewModelScope</code> that waits for the network', '<code>runBlocking</code> around a network call in <code>onClick</code>', '<code>delay(10000)</code> inside a <code>LaunchedEffect</code>'], a: 1, why: '<code>runBlocking</code> blocks the main thread. The other two wait inside a coroutine, which leaves the thread free.' },
          { q: 'Which Logcat line tells you an ANR happened?', options: ['<code>Skipped 42 frames!</code>', '<code>StrictMode policy violation</code>', '<code>ANR in com.example.recipes (com.example.recipes/.MainActivity)</code>'], a: 2, why: 'Android writes <code>ANR in</code> and the app’s name, then a <code>Reason</code> line. The other two are warnings about slow work, not ANRs.' },
          { q: 'Why does Google Play care about ANRs?', options: ['It removes the app after the first one', 'At an ANR rate of 0.47% or more, it is likely to show the app to fewer people', 'It doesn’t: ANRs only happen in debug builds'], a: 1, why: 'Android vitals counts ANRs on real users’ phones, and a high rate hurts how often Play shows the app.' },
        ],
        docs: [['ANRs', 'https://developer.android.com/topic/performance/vitals/anr'], ['Diagnose and fix ANRs', 'https://developer.android.com/topic/performance/anrs/diagnose-and-fix-anrs']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'leaks',
        title: 'Memory leaks',
        tagline: 'Let LeakCanary find the screens your app forgot to let go of.',
        goals: ['Add LeakCanary to the debug build only', 'Read a leak trace and find the reference that causes the leak', 'Fix a leak by keeping <code>applicationContext</code> instead of an Activity'],
        level: 'beginner', introduces: ['leakcanary'],
        body: `
<p>Recipes gets a cooking timer: <code>CookTimer.start(this, 10)</code> shows a toast when ten minutes are up. Lin starts it and turns the phone to read the recipe sideways. Everything still works. But from then on the old screen, with everything on it, stays in memory. Do that often enough and the app slows down, until it crashes with an <code>OutOfMemoryError</code>.</p>
<p>You saw the cause in the Context lesson. Android frees an object only when nothing points to it any more. A <em>memory leak</em> is something long-lived, like an <code>object</code> or a ViewModel, keeping something short-lived, like an Activity. <code>CookTimer</code> is an <code>object</code>, so it lives as long as the app, and it kept <code>MainActivity</code> #1 after Android destroyed it. Leaks don’t fail on the spot, which is why they are hard to see.</p>
<p><em>LeakCanary</em> is a library that finds them for you. Add it with <code>debugImplementation</code>, as in the testing track, so only the debug build has it and users never get it. No code needed. When an Activity is destroyed, LeakCanary checks 5 seconds later whether it is really gone. If it isn’t, the Activity is <em>retained</em>. Once 5 objects are retained (or 1, when the app is in the background), it saves a copy of the app’s memory and shows a notification. Tap it to read what it found.</p>
<p>It shows a <em>leak trace</em>: the chain of references, read from top to bottom, from something that is always kept down to the leaked object. <code>Leaking: NO</code> marks objects that are fine to keep, like a class. The reference underlined with <code>~~~</code> is the suspect: cut that one. Here it is <code>CookTimer.screen</code>, so the timer should keep <code>applicationContext</code>, the Context of the whole app, instead.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'android', label: 'Android', x: 50, y: 12, tone: 'muted' },
              { id: 'a1', label: 'MainActivity #1<small>its whole screen</small>', x: 24, y: 48 },
              { id: 'a2', label: 'MainActivity #2', x: 72, y: 48, hidden: true },
              { id: 'timer', label: 'CookTimer<small>object: lives as long as the app</small>', x: 26, y: 86, tone: 'warm' },
              { id: 'app', label: 'application­Context', x: 72, y: 86, tone: 'ok', hidden: true },
            ],
            predict: {
              q: 'Lin starts the timer, which stores <code>MainActivity</code> #1 in <code>CookTimer.screen</code>. Then she turns the phone, and Android destroys #1. Can its memory be freed?',
              options: ['Yes: destroyed screens are always freed', 'No: <code>CookTimer</code> still points to it', 'Only when the phone runs low on memory'],
              a: 1,
              why: 'Android frees an object when nothing points to it. <code>CookTimer</code> lives as long as the app and still points to #1.',
            },
            frames: [
              { add: [['android', 'a1', 'on screen', 'ok']], say: '<code>MainActivity</code> #1 is on screen, and Android points to it. <code>CookTimer</code> is an <code>object</code>: it exists as long as the app runs.' },
              { add: [['timer', 'a1', 'screen', 'warm']], hl: ['timer'], say: 'Lin taps Start. <code>CookTimer.start(this, 10)</code> stores the Activity in <code>screen</code>, to show a toast in ten minutes.' },
              { remove: [['android', 'a1']], show: ['a2'], add: [['android', 'a2', 'on screen', 'ok']], say: 'She turns the phone. Android destroys #1, makes #2 and lets go of #1.' },
              { hl: ['a1'], say: 'But <code>CookTimer.screen</code> still points to #1, so it can’t be freed, and neither can anything on its screen. Five seconds later, LeakCanary counts it as retained.' },
              { remove: [['timer', 'a1']], show: ['app'], add: [['timer', 'app', 'screen', 'ok']], gone: ['a1'], say: 'The fix: <code>screen = context.applicationContext</code>. Nothing points to #1 any more, so Android frees it. The toast still works.' },
            ],
          });
        },
        code: `// app/build.gradle.kts: debug build only, so users never get it
dependencies {
    debugImplementation("com.squareup.leakcanary:leakcanary-android:2.14")
}

// The leak LeakCanary found:
object CookTimer {
    private var screen: Context? = null
    fun start(context: Context, minutes: Int) {
        screen = context                      // a MainActivity, kept after rotation
    }
}

// Its leak trace (lines above and below cut):
// ├─ com.example.recipes.CookTimer class
// │    Leaking: NO (a class is never leaking)
// │    ↓ static CookTimer.screen
// │                       ~~~~~~
// ╰→ com.example.recipes.MainActivity instance
//      Leaking: YES (ObjectWatcher was watching this because com.example.recipes.MainActivity received Activity#onDestroy() callback and Activity#mDestroyed is true)`,
        remember: 'Add LeakCanary with debugImplementation, read the trace top to bottom, and cut the reference underlined with ~~~.',
        mistakes: [
          {
            title: 'Keeping the Activity in something that outlives it',
            bad: `object CookTimer {
    private var screen: Context? = null
    fun start(context: Context, minutes: Int) {
        screen = context
    }
}`,
            good: `object CookTimer {
    private var screen: Context? = null
    fun start(context: Context, minutes: Int) {
        screen = context.applicationContext
    }
}`,
            why: 'An <code>object</code> lives as long as the app. <code>applicationContext</code> lives just as long, so keeping it leaks nothing. The Activity lives only until the next rotation.',
          },
        ],
        terms: [
          { term: 'LeakCanary', def: 'A library for the debug build that notices destroyed screens that stay in memory and shows why.' },
          { term: 'retained', def: 'Still in memory 5 seconds after it should be gone. LeakCanary counts retained objects.' },
          { term: 'leak trace', def: 'The chain of references that keeps a leaked object in memory. The suspect reference is underlined with <code>~~~</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add LeakCanary so that only the debug build gets it.', code: `dependencies {
    [[debugImplementation]]("com.squareup.leakcanary:leakcanary-android:2.14")
}`, why: 'As in the testing track, <code>debugImplementation</code> leaves the library out of the release build, the one users install.' },
          { type: 'bug', prompt: 'LeakCanary shows <code>MainActivity</code> leaking through <code>static Reminders.context</code>. Tap the line to change.', code: `object Reminders {
    private var context: Context? = null
    fun init(screen: Context) {
        context = screen
    }
}`, bug: 3, fix: '        context = screen.applicationContext', why: 'An <code>object</code> outlives every screen. Keeping <code>applicationContext</code>, which lives as long as the app, cuts the path to the Activity.' },
        ],
        quiz: [
          { q: 'Why is LeakCanary added with <code>debugImplementation</code>?', options: ['So only the debug build has it, and users never get it', 'Because it only works in Kotlin', 'To make the release build smaller than the debug build'], a: 0, why: 'LeakCanary is a tool for you. Its checks and memory copies have no place on users’ phones.' },
          { q: 'In a leak trace, what does a reference underlined with <code>~~~</code> mean?', options: ['The object is fine to keep', 'The line has a typo', 'It is a suspect: one of these references causes the leak'], a: 2, why: 'LeakCanary rules out what it can and underlines what is left. Cutting the suspect reference fixes the leak.' },
          { q: 'Which may keep an Activity without leaking it?', options: ['A ViewModel', 'An <code>object</code>', 'Neither: both outlive the Activity'], a: 2, why: 'Both can live longer than the screen, so a kept Activity can’t be freed. They may keep <code>applicationContext</code>.' },
        ],
        docs: [['LeakCanary: getting started', 'https://square.github.io/leakcanary/getting_started/'], ['Capture a heap dump', 'https://developer.android.com/studio/profile/capture-heap-dump']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'profiler',
        title: 'Profiling',
        tagline: 'Measure where the time goes before you change anything.',
        goals: ['Start a profiler task on your running app', 'Read a flame chart and find the function that takes the time', 'Measure a piece of code with <code>measureTimeMillis</code>'],
        level: 'intermediate', introduces: ['measureTimeMillis'],
        body: `
<p>Recipes gets a search box, and typing in it feels slow: each letter shows up a moment late. Lin is sure it is the database and starts rewriting the DAO. A day later the search is just as slow. The slow part is rarely where you guess, so measure first.</p>
<p>The <em>profiler</em> in Android Studio records what your running app does. Open the <b>More actions</b> menu (three dots) next to the Run button and choose <b>Profile 'app' with complete data</b>. Then pick a <em>task</em>: <b>Find CPU Hotspots</b> records which functions run and for how long; <b>Analyze Memory Usage (Heap Dump)</b> takes a snapshot of every object in memory, the same kind of copy LeakCanary makes. Start the task, do the slow thing for a few seconds, and stop.</p>
<p>Find CPU Hotspots shows a <em>flame chart</em> for each thread. Every bar is a function, and the bars on top of it are the functions it called. A bar’s width is the share of the recorded time spent in it, including what it called. Left to right is not a timeline: all calls of a function through the same chain are added up into one bar. Look for a wide bar with nothing wide on top. Its own code is the <em>hotspot</em>.</p>
<p>Two habits help. A debuggable app runs slower than the one users get, so trust the shares more than the exact numbers. And for one piece of code, <code>measureTimeMillis { ... }</code> from Kotlin runs its block and gives back how many milliseconds it took. Measure again after every fix.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: [' ', ' ', ' ', ' '],
            span: 100,
            unit: '%',
            predict: {
              q: 'In a flame chart, a wide bar has nothing on top of it. Where does its time go?',
              options: ['Into its own code', 'Into the functions it calls', 'Into waiting for the next frame'],
              a: 0,
              why: 'The bars on top are the functions it called. With none there, all of its width is spent in its own lines: that is the hotspot.',
            },
            frames: [
              { now: 0, say: 'Lin records 3 seconds of typing with Find CPU Hotspots. This is the main thread’s flame chart, built here from the bottom up. Width is the share of the time.' },
              { bars: [{ lane: 3, from: 0, to: 100, label: 'onQueryChange', tone: 'accent' }], now: 100, say: 'At the bottom, <code>onQueryChange</code> in the ViewModel, called for every letter. It is full width: all the recorded time is spent in it or in what it calls.' },
              { bars: [{ lane: 2, from: 0, to: 95, label: 'search', tone: 'accent' }], say: 'On top: what it called. <code>search</code> takes 95% of the time. The thin 5% with nothing on top is the rest of <code>onQueryChange</code>’s own code.' },
              { bars: [{ lane: 1, from: 0, to: 3, label: 'first', tone: 'muted' }, { lane: 1, from: 3, to: 94, label: 'filter', tone: 'accent' }], say: '<code>search</code> reads the recipes from the repository with <code>first()</code>, a thin 3%: the database Lin suspected is not the problem. Then it runs <code>filter</code> over them.' },
              { bars: [{ lane: 0, from: 3, to: 93, label: 'similar', tone: 'err' }], say: '<code>similar</code> compares the search with every title. It is wide and has nothing on top: its own code takes 90% of the time. That is the hotspot.' },
              { say: 'The fix goes where the chart points: the filter moves into <code>withContext(Dispatchers.Default)</code>, and the letters show up at once. Record again to check: the main thread’s chart is now almost empty.' },
            ],
          });
        },
        code: `class SearchViewModel(private val repository: RecipeRepository) : ViewModel() {
    val results = MutableStateFlow(listOf<Recipe>())

    fun onQueryChange(query: String) {
        viewModelScope.launch {
            results.value = search(query)
        }
    }

    private suspend fun search(query: String): List<Recipe> {
        val all = repository.recipes.first()      // only 3% of the time
        // The flame chart showed similar() taking 90% of the main thread:
        return withContext(Dispatchers.Default) {
            all.filter { recipe -> similar(recipe.title, query) }
        }
    }
}`,
        play: `import kotlin.system.measureTimeMillis

fun main() {
    val titles = mutableListOf<String>()
    for (i in 1..200000) {
        titles.add("Recipe $i")
    }
    val ms = measureTimeMillis {
        val found = titles.filter { it.contains("99") }
        println("Found \${found.size} recipes")
    }
    println("Search took $ms ms")
    // Change 200000 to 2000000. Does the time grow too?
}
// Found 7382 recipes
// Search took 85 ms   (the number changes from run to run)`,
        remember: 'Measure before you fix: in a flame chart, the wide bar with nothing on top is the hotspot.',
        terms: [
          { term: 'profiler', def: 'An Android Studio tool that records what your running app does: which functions take time, what is in memory.' },
          { term: 'profiler task', def: 'One kind of recording, such as <b>Find CPU Hotspots</b> or <b>Analyze Memory Usage (Heap Dump)</b>.' },
          { term: 'flame chart', def: 'A chart of bars, one per function, with the functions it called on top. Width is the share of the time, not a timeline.' },
          { term: 'hotspot', def: 'The code that takes most of the time: a wide bar with nothing wide on top of it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Time how long the filter takes, in milliseconds.', code: `val ms = [[measureTimeMillis]] {
    titles.filter { it.contains("99") }
}
println("Search took $ms ms")`, why: '<code>measureTimeMillis</code> runs the block and gives back how long it took.' },
          { type: 'bug', prompt: 'Lin wanted to move the hotspot off the main thread, but the flame chart of the main thread still shows <code>similar</code>. Tap the line to change.', code: `private suspend fun search(query: String): List<Recipe> {
    val all = repository.recipes.first()
    return withContext(Dispatchers.Main) {
        all.filter { recipe -> similar(recipe.title, query) }
    }
}`, bug: 2, fix: '    return withContext(Dispatchers.Default) {', why: '<code>Dispatchers.Main</code> is the main thread. Heavy calculations belong on <code>Dispatchers.Default</code>.' },
        ],
        quiz: [
          { q: 'Which profiler task shows which functions take the time?', options: ['Analyze Memory Usage (Heap Dump)', 'Find CPU Hotspots', 'Layout Inspector'], a: 1, why: 'Find CPU Hotspots records the functions that run. A heap dump is a snapshot of memory, and Layout Inspector is not a profiler task.' },
          { q: 'In a flame chart, what does a bar’s width show?', options: ['When the function ran', 'How many lines the function has', 'The share of the recorded time spent in that function and what it called'], a: 2, why: 'All calls through the same chain are added up into one bar. Left to right is not time.' },
          { q: 'Why measure before you change code?', options: ['The profiler makes the app faster', 'The slow part is often not where you guess', 'Lint needs a recording first'], a: 1, why: 'Lin rewrote the DAO, but reading the recipes took only 3% of the time. One recording pointed at the real 90%.' },
        ],
        docs: [['Profile your app performance', 'https://developer.android.com/studio/profile'], ['Flame chart', 'https://developer.android.com/studio/profile/chart-glossary/flame-chart']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'compose-perf',
        title: 'Compose performance',
        tagline: 'Help Compose skip the parts of the screen that didn’t change.',
        goals: ['Tell a stable parameter from an unstable one', 'Explain why a new list on every run stops Compose from skipping', 'Check a fix with Layout Inspector’s recomposition counts'],
        level: 'intermediate', introduces: [],
        body: `
<p>The Recipes screen shows the cooking timer at the top, and below it the list of quick recipes. Layout Inspector’s recomposition counts show something odd: <code>RecipeList</code> runs again every second, in step with the timer, although the recipes never change. With a short list nobody notices. With a long one, every second costs a frame.</p>
<p>You know <em>skipping</em> from the Compose track: when a composable runs again, Compose skips a child whose inputs didn’t change. How it decides “didn’t change” depends on the type. A <em>stable</em> type is one where Compose can tell: <code>Int</code>, <code>String</code>, <code>Boolean</code>, and a data class like <code>Recipe</code>, whose properties are all <code>val</code>s of stable types. Compose compares those with <code>==</code>.</p>
<p>An <em>unstable</em> type is one Compose can’t be sure about, like a <code>List</code> (the object behind it might be a mutable list that changes in place) or a class with a <code>var</code> property. Compose compares those with <code>===</code>: the very same object means skip, a new object means run again, even if its contents are equal. Since Kotlin 2.0.20 this rule is on by default, under the name <em>strong skipping</em>.</p>
<p>Now the odd count makes sense. <code>quickRecipes(state.recipes, 20)</code> in the composable’s body runs <code>filter</code>, which makes a new <code>List</code> every time, so <code>RecipeList</code> gets a new object every second. Make the list once instead, in the ViewModel: add a <code>quickRecipes</code> property to <code>RecipesUiState</code> and fill it from <code>getQuickRecipes()</code>. The same object then comes back until the recipes really change, and Compose skips <code>RecipeList</code>.</p>`,
        visual(el) {
          const tick = (t, list, tone) => [
            { lane: 0, from: t, to: t + 0.85, label: 'ran', tone: 'accent' },
            { lane: 1, from: t, to: t + 0.85, label: 'ran', tone: 'accent' },
            { lane: 2, from: t, to: t + 0.85, label: list, tone },
          ];
          Lab.ui.timeline(el, {
            lanes: ['RecipesContent', 'Timer text', 'RecipeList'],
            span: 5,
            unit: 's',
            predict: {
              q: 'Every second, <code>RecipesContent</code> runs <code>quickRecipes(state.recipes, 20)</code> and passes the result to <code>RecipeList</code>. The recipes didn’t change. Does <code>RecipeList</code> run again?',
              options: ['Yes: it gets a new <code>List</code> object each time', 'No: the contents are the same', 'Only every other second'],
              a: 0,
              why: 'A <code>List</code> is unstable, so Compose compares it with <code>===</code>. <code>quickRecipes</code> calls <code>filter</code>, which makes a new object every time, so the check fails.',
            },
            frames: [
              { now: 0, say: 'One row per composable, five seconds of the timer ticking. Each bar is one run, or one skip.' },
              { bars: tick(0, 'ran', 'err'), say: 'The timer ticks. <code>RecipesContent</code> reads the seconds, so it runs again, and <code>quickRecipes(...)</code> makes a new list. <code>RecipeList</code> gets a new object: it runs too.' },
              { bars: tick(1, 'ran', 'err'), say: 'Next second, the same. Same recipes, new <code>List</code> object, <code>===</code> is false. Layout Inspector: 2 recompositions, 0 skips.' },
              { bars: tick(2, 'skipped', 'muted'), say: 'After the fix, <code>RecipesContent</code> passes <code>state.quickRecipes</code>, made once by the ViewModel. It is the very same object as last time, so Compose skips <code>RecipeList</code>.' },
              { bars: tick(3, 'skipped', 'muted'), say: 'Only the parts that read the seconds run. Layout Inspector now counts skips for <code>RecipeList</code>.' },
              { bars: tick(4, 'ran', 'ok'), marks: [{ at: 4, label: 'new recipe', tone: 'ok' }], say: 'Lin adds a recipe. The ViewModel makes a new list, and <code>RecipeList</code> runs: exactly when it should.' },
            ],
          });
        },
        code: `// Before: a new List every run, so RecipeList can never be skipped
// (onRefresh and onFavorite left out)
@Composable
fun RecipesContent(state: RecipesUiState, seconds: Int) {
    Column {
        Text("Timer: $seconds s")                     // changes every second
        RecipeList(quickRecipes(state.recipes, 20))   // new List object each time
    }
}

// After: the UI state gets a quickRecipes property...
data class RecipesUiState(
    val isLoading: Boolean = true,
    val recipes: List<Recipe> = listOf(),
    val quickRecipes: List<Recipe> = listOf(),        // new
    val isRefreshing: Boolean = false,
    val note: String = "",
)

// ...which RecipesViewModel fills once per change, in init:
viewModelScope.launch {
    getQuickRecipes().collect { list ->
        _uiState.value = _uiState.value.copy(quickRecipes = list)
    }
}

@Composable
fun RecipesContent(state: RecipesUiState, seconds: Int) {
    Column {
        Text("Timer: $seconds s")
        RecipeList(state.quickRecipes)    // the same object until the recipes change: skipped
    }
}

// Stable: every property is a val of a stable type, so Compose compares with ==
data class Recipe(val id: Int, val title: String, val minutes: Int, val favorite: Boolean = false)`,
        remember: 'Stable values are compared with ==, unstable ones like List with ===. Don’t build a new list in a composable’s body.',
        terms: [
          { term: 'stable', def: 'A type where Compose can tell whether the value changed, like <code>Int</code>, <code>String</code> or a data class of <code>val</code>s of stable types. Compared with <code>==</code>.' },
          { term: 'unstable', def: 'A type Compose can’t be sure about, like <code>List</code> or a class with a <code>var</code>. Compared with <code>===</code>: only the same object is skipped.' },
          { term: 'strong skipping', def: 'The rule, on since Kotlin 2.0.20, that lets Compose skip a composable with unstable parameters when it gets the very same objects.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>Note</code> stable: every property must be read-only.', code: `data class Note(
    [[val]] id: Int,
    [[val]] text: String,
)`, why: 'A data class whose properties are all <code>val</code>s of stable types, like <code>Int</code> and <code>String</code>, is stable. A <code>var</code> makes it unstable.' },
          { type: 'bug', prompt: 'The UI state already has <code>quickRecipes</code>, filled by the ViewModel, yet <code>RecipeList</code> runs every second. Tap the line to change.', code: `@Composable
fun RecipesContent(state: RecipesUiState, seconds: Int) {
    Column {
        Text("Timer: $seconds s")
        RecipeList(state.quickRecipes.toList())
    }
}`, bug: 4, fix: '        RecipeList(state.quickRecipes)', why: '<code>toList()</code> makes a new <code>List</code> every second, even with the same recipes in it. <code>state.quickRecipes</code> on its own is the same object until the recipes change, so Compose can skip.' },
        ],
        quiz: [
          { q: 'Which parameter type does Compose treat as stable?', options: ['<code>String</code>', '<code>List&lt;Recipe&gt;</code>', 'A class with a <code>var</code> property'], a: 0, why: '<code>String</code> can’t change, so Compose can compare it with <code>==</code>. The other two are unstable.' },
          { q: 'With strong skipping, how does Compose compare an unstable parameter like a <code>List</code>?', options: ['Are the contents equal (<code>==</code>)?', 'It never compares and always runs', 'Is it the very same object (<code>===</code>)?'], a: 2, why: 'For unstable types only the same object counts as unchanged. A new list with equal contents still runs.' },
          { q: 'How do you check that <code>RecipeList</code> is skipped now?', options: ['Layout Inspector’s recomposition counts', 'Logcat with <code>tag:Choreographer</code>', 'LeakCanary'], a: 0, why: 'Layout Inspector counts, per composable, how often it ran and how often it was skipped.' },
        ],
        docs: [['Stability in Compose', 'https://developer.android.com/develop/ui/compose/performance/stability'], ['Strong skipping mode', 'https://developer.android.com/develop/ui/compose/performance/stability/strongskipping']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'startup',
        title: 'Startup time',
        tagline: 'Show the first screen sooner by doing less before it.',
        goals: ['Tell a cold, a warm and a hot start apart', 'Read the time to the first screen from Logcat', 'Move work the first screen doesn’t need out of startup with <code>by lazy</code>'],
        level: 'intermediate', introduces: [],
        body: `
<p>Lin taps the Recipes icon and looks at an empty screen for almost two seconds. People notice that every single time they open the app, and Android vitals counts slow starts too. Most of that wait is code you wrote, running before the first screen.</p>
<p>There are three kinds of start. A <em>cold start</em> begins with no process: Android starts one, creates <code>RecipesApp</code> and runs its <code>onCreate</code>, then creates <code>MainActivity</code>, runs its <code>onCreate</code> with <code>setContent</code>, and draws the first frame. In a <em>warm start</em> the process is still running, but the Activity has to be created again. In a <em>hot start</em> the Activity is still there and comes back to the front, as after Home. A cold start does the most, so measure that one.</p>
<p>Everything <code>RecipesApp</code> does when it is made, in its properties and in its <code>onCreate</code>, runs on the main thread before any screen can be drawn. For each line, ask: does the first screen need this? If not, create it later. You know <code>by lazy</code> from <code>val container by lazy { ... }</code> in the dependency injection lesson: it builds the value the first time someone reads it. A crash logger is one thing that must stay, so it can catch crashes during startup.</p>
<p>To measure, end the app’s process first: <code>adb shell am force-stop com.example.recipes</code> (<code>am</code> is the device’s activity manager). Then tap the icon. Android writes a line like <code>Displayed com.example.recipes/.MainActivity for user 0: +1s650ms</code>: the time from the tap to the first frame. Android writes it, not your app, so clear <code>package:mine</code> and type <code>tag:ActivityTaskManager</code> in Logcat’s query box.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['before', 'after', 'Default'],
            span: 2400,
            unit: 'ms',
            predict: {
              q: '<code>RecipesApp</code> has <code>val searchIndex = SearchIndex.build()</code>, which takes 800 ms. When can the first screen appear?',
              options: ['Only after the index is built', 'Right away: <code>RecipesApp</code> is made in the background', 'Before it: the Activity comes first'],
              a: 0,
              why: 'In a cold start the main thread makes <code>RecipesApp</code> and runs its <code>onCreate</code> first, then the Activity, then the first frame. Every line in between delays the screen.',
            },
            frames: [
              { now: 0, say: 'Two cold starts of Recipes. The top row is the main thread with the search index built during startup. The middle row is the main thread after the fix, and the bottom row a background thread of <code>Dispatchers.Default</code>.' },
              { bars: [{ lane: 0, from: 0, to: 300, label: 'process', tone: 'muted' }], say: 'Lin taps the icon. There is no process yet, so Android starts one. Your code hasn’t run.' },
              { bars: [{ lane: 0, from: 300, to: 1100, label: 'search index', tone: 'err' }, { lane: 0, from: 1100, to: 1200, label: 'crash log', tone: 'accent' }], say: 'Making <code>RecipesApp</code> builds the search index (800 ms), then its <code>onCreate</code> sets up the crash logger. No screen exists yet.' },
              { bars: [{ lane: 0, from: 1200, to: 1650, label: 'MainActivity', tone: 'ok' }], marks: [{ at: 1650, label: '+1s650ms', tone: 'err' }], say: 'Then <code>MainActivity.onCreate</code> and the first frame. Logcat: <code>Displayed … +1s650ms</code>.' },
              { bars: [{ lane: 1, from: 0, to: 300, label: 'process', tone: 'muted' }, { lane: 1, from: 300, to: 400, label: 'crash log', tone: 'accent' }, { lane: 1, from: 400, to: 850, label: 'MainActivity', tone: 'ok' }], marks: [{ at: 850, label: '+850ms', tone: 'ok' }], say: 'The same app with <code>val searchIndex by lazy { ... }</code>. Only the crash logger stays in <code>onCreate</code>, and the first frame comes at 850 ms.' },
              { bars: [{ lane: 2, from: 1500, to: 2300, label: 'search index', tone: 'warm' }], say: 'The index is built the first time something reads it: when Lin opens Search, inside the search’s <code>withContext(Dispatchers.Default)</code>, off the main thread. If she never searches, it is never built.' },
            ],
          });
        },
        code: `@HiltAndroidApp
class RecipesApp : Application() {
    // Before: val searchIndex = SearchIndex.build(), built during startup (800 ms)
    // Now built the first time something reads it:
    val searchIndex by lazy { SearchIndex.build() }

    override fun onCreate() {
        super.onCreate()
        CrashLog.install(this)   // stays: it must catch crashes during startup
    }
}

// Logcat, tag:ActivityTaskManager, cold start before and after:
// Displayed com.example.recipes/.MainActivity for user 0: +1s650ms
// Displayed com.example.recipes/.MainActivity for user 0: +850ms`,
        remember: 'Measure a cold start with the Displayed line, and move everything the first screen doesn’t need out of startup.',
        terms: [
          { term: 'cold start', def: 'Starting the app with no process: Android starts one, runs <code>Application.onCreate</code>, then the Activity, then the first frame.' },
          { term: 'warm start', def: 'The process is still running, but the Activity has to be created again.' },
          { term: 'hot start', def: 'The Activity is still there and comes back to the front, as after pressing Home.' },
          { term: 'Displayed', def: 'The Logcat line from <code>ActivityTaskManager</code> with the time from the tap to the first frame, such as <code>+850ms</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show only Android’s startup lines in Logcat.', code: `tag:[[ActivityTaskManager]]`, why: 'The <code>Displayed</code> line comes from Android, under the tag <code>ActivityTaskManager</code>. Clear <code>package:mine</code> first, or it is hidden.' },
          { type: 'bug', prompt: 'Lin wants the search index built only when Search first needs it, not during startup. Tap the line to change.', code: `class RecipesApp : Application() {
    val searchIndex = SearchIndex.build()

    override fun onCreate() {
        super.onCreate()
        CrashLog.install(this)
    }
}`, bug: 1, fix: '    val searchIndex by lazy { SearchIndex.build() }', why: 'A plain <code>val</code> is built as soon as <code>RecipesApp</code> is made, before any screen. <code>by lazy</code> waits until something reads it.' },
        ],
        quiz: [
          { q: 'Lin presses Home, then taps the Recipes icon again. Which kind of start is that?', options: ['Cold', 'Warm', 'Hot'], a: 2, why: 'The process and the Activity are still there. The Activity only comes back to the front.' },
          { q: 'In a cold start, what runs before the first frame?', options: ['Only <code>MainActivity.onCreate</code>', 'Nothing: the screen comes first', '<code>RecipesApp.onCreate</code>, then <code>MainActivity.onCreate</code>'], a: 2, why: 'Android makes the app’s <code>Application</code> object before any Activity, all on the main thread.' },
          { q: 'Why doesn’t <code>package:mine</code> show the <code>Displayed</code> line?', options: ['It only appears in release builds', 'Android writes it, not your app', 'It appears only after 5 seconds'], a: 1, why: '<code>package:mine</code> keeps your app’s lines. The startup time is measured and written by the system.' },
        ],
        docs: [['App startup time', 'https://developer.android.com/topic/performance/vitals/launch-time']],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'r8',
        title: 'Shrinking with R8',
        tagline: 'Turn on R8 for the release build, and try that build on your own phone.',
        goals: ['Turn on R8 for the release build', 'Explain what R8 removes and renames', 'Build the release app, install it on your phone and keep its <code>mapping.txt</code>'],
        level: 'intermediate', introduces: ['buildTypes', 'assembleRelease', 'signingConfig', 'signingConfigs', 'getByName'],
        body: `
<p>Recipes is almost ready for users, and most of its download is library code it never calls. Every unused class still has to be downloaded, installed and loaded. One setting lets a tool called <em>R8</em> cut that away, and it usually makes the app a little faster too.</p>
<p>A <em>build type</em> is one way of building the app. You met the two in the main-thread lesson: <code>debug</code> is the one Run installs, <code>release</code> is the one for users. Inside <code>buildTypes { release { } }</code> in <code>app/build.gradle.kts</code>, <code>optimization { enable = true }</code> turns R8 on. R8 starts from what Android can start, such as the activities in the manifest, and follows every call. Classes and functions nothing reaches are removed: that is <em>shrinking</em>. It also simplifies the code that is left, renames it to short names like <code>a.b</code>, and drops unused resources.</p>
<p>R8 runs only in the release build, so try that build on a phone before you ship. <code>./gradlew assembleRelease</code> builds it. A phone only installs an app that is <em>signed</em>: it carries a digital signature that shows who made it. Run signs the debug build with a <em>debug key</em> that Android Studio made for you. Without a signing setting, the release build comes out as <code>app-release-unsigned.apk</code>, which a phone won’t install. To try it on your own phone, add <code>signingConfig = signingConfigs.getByName("debug")</code> inside <code>release { }</code>. Never use the debug key for the version you publish: that one gets a key of your own.</p>
<p>Renamed code makes a stack trace hard to read. Every release build writes <code>mapping.txt</code>, under <code>app/build/outputs/mapping/release/</code>, with every old name and its new one. Android Studio’s Logcat uses it to show the real names, and Google Play gets it with the app when you publish, for crashes from your users. Each build overwrites it, so keep a copy for every version you publish.</p>`,
        visual(el) {
          const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const classes = s => '<pre class="ui-out">' + esc(s) + '</pre>';
          const before = 'MainActivity\nRecipeRepository\nOldExporter  (unused)\n… many library classes';
          const after = 'MainActivity  (same name)\na.b  ← RecipeRepository\n(removed)  OldExporter\n… far fewer library classes';
          Lab.ui.terminal(el, {
            panelTitle: 'Classes in the release app',
            predict: {
              q: 'Nothing in Recipes calls <code>OldExporter</code> any more. The release build has <code>optimization { enable = true }</code>. What does R8 do with that class?',
              options: ['Removes it', 'Keeps it with its full name', 'Stops the build with an error'],
              a: 0,
              why: 'R8 follows every call from what Android can start. A class it never reaches is removed, and the build carries on.',
            },
            frames: [
              { panel: classes(before), say: 'Recipes before R8 (this panel is a summary, not real output). Every class is in the app with its full name, even <code>OldExporter</code>.' },
              { cmd: './gradlew assembleRelease', out: 'BUILD SUCCESSFUL in 52s', panel: classes(after), say: 'R8 runs as part of the release build. <code>OldExporter</code> is gone, <code>RecipeRepository</code> is now called <code>a.b</code>, and <code>MainActivity</code> keeps its name, because the manifest names it.' },
              { cmd: 'adb install app/build/outputs/apk/release/app-release.apk', out: 'Performing Streamed Install\nSuccess', say: 'With <code>signingConfig = signingConfigs.getByName("debug")</code> in <code>release { }</code>, the release app is signed with the debug key, so Lin’s test phone installs it.' },
              { cmd: 'cat app/build/outputs/mapping/release/mapping.txt', out: 'com.example.recipes.data.RecipeRepository -&gt; a.b:', say: 'One line from <code>mapping.txt</code> (the rest is cut): the old name, an arrow, the new name. Lin keeps a copy of this file for the version she publishes.' },
              { say: 'She opens every screen of the release app. Only this build is shrunk, so only this build can show what R8 broke. The next lesson is about exactly that.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
android {
    buildTypes {
        release {
            optimization {
                enable = true   // R8: shrink, simplify and rename the release build
            }
            // Only to try the release build on your own phone, never for the version you publish:
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

// Terminal: build the release app, then install it
// ./gradlew assembleRelease
// adb install app/build/outputs/apk/release/app-release.apk

// After the build, app/build/outputs/mapping/release/mapping.txt has lines like:
// com.example.recipes.data.RecipeRepository -> a.b:`,
        remember: 'optimization { enable = true } in release turns on R8. Try the signed release build on a phone, and keep its mapping.txt.',
        terms: [
          { term: 'R8', def: 'The tool that shrinks, simplifies and renames the code of a release build when <code>optimization { enable = true }</code> is set.' },
          { term: 'build type', def: 'One way of building the app: <code>debug</code> for Run, <code>release</code> for users. Set in <code>buildTypes { }</code>.' },
          { term: 'shrinking', def: 'Removing the classes and functions that nothing in the app reaches.' },
          { term: 'signing', def: 'Adding a digital signature that shows who made the app. A phone installs only signed apps.' },
          { term: 'mapping.txt', def: 'The file each release build writes with every old name and its new short name, used to read crashes. Overwritten by every build.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Sign the release build with the debug key, to try it on your own phone.', code: `release {
    [[signingConfig]] = signingConfigs.getByName("[[debug]]")
}`, why: '<code>signingConfigs.getByName("debug")</code> is the debug key that Run already uses. Fine for your test phone, never for the version you publish.' },
          { type: 'bug', prompt: 'Lin wants R8 on the build that users get, but her release app is as big as before. Tap the line to change.', code: `android {
    buildTypes {
        debug {
            optimization {
                enable = true
            }
        }
    }
}`, bug: 2, fix: '        release {', why: 'The settings inside <code>debug { }</code> only change what Run builds. R8 belongs in <code>release { }</code>.' },
        ],
        quiz: [
          { q: 'What does R8 remove?', options: ['Classes and functions that nothing in the app reaches', 'Every comment and blank line', 'All library code'], a: 0, why: 'It follows every call from what Android can start. What it never reaches is removed.' },
          { q: 'The release build has no signing setting. What happens when you try to install it on a phone?', options: ['It installs like the debug build', 'The phone won’t install <code>app-release-unsigned.apk</code>', 'Gradle signs it with your own key'], a: 1, why: 'A phone installs only signed apps. For a test phone, sign the release build with the debug key.' },
          { q: 'A crash from the release app shows names like <code>a.b</code>. What turns them back into real names?', options: ['<code>mapping.txt</code> from that build', 'A lint baseline', 'LeakCanary'], a: 0, why: 'Every release build writes <code>mapping.txt</code>. Android Studio and the Play Console use it to show the original names. Keep a copy, because the next build overwrites it.' },
        ],
        docs: [['Enable app optimization', 'https://developer.android.com/topic/performance/app-optimization/enable-app-optimization'], ['Sign your app', 'https://developer.android.com/studio/publish/app-signing']],
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'keep-rules',
        title: 'Keep rules',
        tagline: 'Tell R8 to leave alone the code it can’t see you use.',
        goals: ['Explain why a class found by its name looks unused to R8', 'Recognise the crash this causes in the release app', 'Write a narrow keep rule in a <code>.keep</code> file'],
        level: 'intermediate', introduces: ['forName', 'ClassNotFoundException'],
        body: `
<p>Recipes can now import recipes. Lin picks <b>Web</b> or <b>Pdf</b> in a menu, and the app finds the class that does the work by its name: <code>Class.forName("com.example.recipes.importers.\${source}Importer")</code>. <code>Class.forName</code> takes a full class name as text, the package plus the class, and gives back that class while the app runs. Here the name is put together from what Lin picked, so the full text only exists while the app runs.</p>
<p>R8 only follows code that names a class directly. Nothing names <code>WebImporter</code> that way, so to R8 it looks unused, and it is removed. The build still succeeds. In the debug build everything works too, because R8 doesn’t run there. Only the release app crashes, with <code>ClassNotFoundException</code>, when Lin picks Web. That is why you try the release build before you ship.</p>
<p>A <em>keep rule</em> tells R8 what to leave alone. Keep rules go in a file ending in <code>.keep</code> in the folder <code>app/src/main/keepRules/</code>. <code>-keep class com.example.recipes.importers.WebImporter { &lt;init&gt;(); }</code> keeps the class, with its name, and its constructor, which keep rules write as <code>&lt;init&gt;()</code>. The app needs the constructor to make an importer from the class. Keep only what is found by name: everything you keep stays big and keeps its long name. Libraries such as Retrofit and kotlinx.serialization bring their own keep rules, so you rarely need many.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: '<code>WebImporter</code> is only found with <code>Class.forName</code>, from a name put together while the app runs. There is no keep rule. When do you find out?',
              options: ['The release build fails', 'The release app crashes when it reaches that code', 'Never: R8 works out the name'],
              a: 1,
              why: 'R8 can’t know a name that only exists while the app runs. It removes the class without a warning, the build passes, and the app crashes when <code>Class.forName</code> runs.',
            },
            frames: [
              { say: 'Recipes with <code>optimization { enable = true }</code> in the release build type. Import finds <code>WebImporter</code> and <code>PdfImporter</code> only by their names, with <code>Class.forName</code>.' },
              { cmd: './gradlew assembleRelease', out: 'BUILD SUCCESSFUL in 52s', say: 'R8 runs as part of the release build. Nothing in the code names the importers directly, so R8 removes them. The build passes.' },
              { cmd: 'adb logcat -v tag -s AndroidRuntime', out: 'E/AndroidRuntime: FATAL EXCEPTION: main\nE/AndroidRuntime: Process: com.example.recipes, PID: 4211\nE/AndroidRuntime: java.lang.ClassNotFoundException: com.example.recipes.importers.WebImporter', say: 'On her test phone, Lin picks Web in the Import menu, and the release app crashes. (<code>-v tag</code> prints only the level and tag before each line; the lines after these are cut.) The class is gone.' },
              { cmd: 'cat app/src/main/keepRules/importers.keep', out: '-keep class com.example.recipes.importers.WebImporter { &lt;init&gt;(); }\n-keep class com.example.recipes.importers.PdfImporter { &lt;init&gt;(); }', say: 'She adds a new file in <code>keepRules</code> with one rule per importer: keep this class, its name and its constructor. As narrow as possible.' },
              { cmd: './gradlew assembleRelease', out: 'BUILD SUCCESSFUL in 49s', say: 'Build again. Both importers stay, with their real names, so <code>Class.forName</code> finds them. Everything else is still shrunk and renamed.' },
              { say: 'Import works in the release app, from the web and from a PDF.' },
            ],
          });
        },
        code: `// In the Import screen. source is what Lin picked in the menu: "Web" or "Pdf"
val importerClass = Class.forName("com.example.recipes.importers.\${source}Importer")
// ...then the app makes an importer from that class, with its constructor

// The release app without a keep rule (adb logcat -v tag -s AndroidRuntime):
// E/AndroidRuntime: java.lang.ClassNotFoundException: com.example.recipes.importers.WebImporter

// app/src/main/keepRules/importers.keep
// -keep class com.example.recipes.importers.WebImporter { <init>(); }
// -keep class com.example.recipes.importers.PdfImporter { <init>(); }`,
        play: `class WebImporter
class PdfImporter

fun main() {
    val source = "Web"                          // what Lin picked
    val found = Class.forName("\${source}Importer")
    println("Found \${found.name}")
    // Change "Web" to "Pdf", then to "Csv". Which one crashes, and why?
}
// Found WebImporter`,
        remember: 'R8 removes what nothing names directly. Keep each class that is only found by its name, with a narrow rule in a .keep file.',
        terms: [
          { term: 'Class.forName', def: 'Finds a class from its full name, given as text, while the app runs.' },
          { term: 'ClassNotFoundException', def: 'The crash when <code>Class.forName</code> gets a name of a class that isn’t in the app, for example because R8 removed it.' },
          { term: 'keep rule', def: 'A line that tells R8 to leave something alone, such as <code>-keep class com.example.Foo { &lt;init&gt;(); }</code>, in a <code>.keep</code> file.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Recipes gets a <code>CsvImporter</code>, also found with <code>Class.forName</code>. Keep it and its constructor.', code: `-[[keep]] class com.example.recipes.importers.CsvImporter { <[[init]]>(); }`, why: '<code>-keep class</code> keeps the class and its name. <code>&lt;init&gt;()</code> is how a keep rule writes the constructor.' },
          { type: 'bug', prompt: 'In the play, Lin picks Csv and the program crashes with <code>ClassNotFoundException: CsvImporter</code>. Tap the line to change so it finds an importer that exists.', code: `class WebImporter
class PdfImporter

fun main() {
    val source = "Csv"
    val found = Class.forName("\${source}Importer")
    println("Found \${found.name}")
}`, bug: 4, fix: '    val source = "Pdf"', why: 'There is no class named <code>CsvImporter</code>, so <code>Class.forName</code> throws. <code>"Pdf"</code> makes the name <code>PdfImporter</code>, which exists. In the release app, a class R8 removed is missing in the same way.' },
        ],
        quiz: [
          { q: 'Why does <code>WebImporter</code> need a keep rule?', options: ['<code>Class.forName</code> is slow', 'Keep rules make the class faster', 'Its name is put together while the app runs, so R8 can’t see that it is used'], a: 2, why: 'R8 only follows code that names the class directly. Without a rule it removes the class.' },
          { q: 'Without the keep rule, where does the crash show up?', options: ['In the release app, when it reaches <code>Class.forName</code>', 'In the debug build too', 'During <code>./gradlew assembleRelease</code>'], a: 0, why: 'R8 runs only in the release build, and it removes the class without a warning. The build passes; the app crashes later.' },
          { q: 'In <code>-keep class com.example.recipes.importers.WebImporter { &lt;init&gt;(); }</code>, what is <code>&lt;init&gt;()</code>?', options: ['The class’s <code>init { }</code> block', 'The constructor', 'The first function in the class'], a: 1, why: 'Keep rules write the constructor as <code>&lt;init&gt;()</code>. The app needs it to make an importer from the class.' },
        ],
        docs: [['Add keep rules', 'https://developer.android.com/topic/performance/app-optimization/add-keep-rules']],
      },
    ],
  });
})();
