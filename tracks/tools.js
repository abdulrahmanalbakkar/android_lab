/* Android Studio and debugging track. Same shape as tracks/kotlin.js.
   The daily tools: the IDE, Logcat, the debugger, Layout Inspector, adb, lint and CI.
   Demos use the kit (graph, terminal, codeStepper, flow); the css below only styles the HTML
   the lessons put in terminal panels (a small device screen and a lint report). Classes are prefixed tlk-. */
(() => {
  const css = `
/* terminal panels: device screen and lint report */
.tlk-dev { display: grid; gap: 8px; min-width: 0; }
.tlk-pill { justify-self: start; font: 600 0.74rem var(--mono); padding: 3px 9px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); }
.tlk-pill.ok { border-color: var(--ok); background: var(--ok-soft); }
.tlk-pill.err { border-color: var(--err); background: var(--err-soft); }
.tlk-scr { display: grid; gap: 6px; align-content: start; min-height: 130px; padding: 10px; border-radius: 16px; border: 5px solid var(--code-bg); background: var(--bg); }
.tlk-bar { font-weight: 700; font-size: 0.82rem; padding: 4px 6px; border-radius: 6px; background: var(--accent-soft); }
.tlk-line { height: 7px; border-radius: 4px; background: var(--sunk); } .tlk-line.short { width: 60%; }
.tlk-field { border: 2px solid var(--accent); border-radius: 6px; padding: 6px 8px; font-size: 0.8rem; color: var(--ink); }
.tlk-home { display: grid; place-items: center; min-height: 100px; color: var(--muted); font: 600 0.78rem var(--mono); }
.tlk-note { margin: 0 0 6px; color: var(--muted); font-size: 0.8rem; }
.tlk-issue { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px; align-items: start; padding: 6px 8px; margin-bottom: 6px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); font-size: 0.78rem; }
.tlk-issue b { font: 700 0.66rem var(--mono); text-transform: uppercase; padding: 2px 5px; border-radius: 5px; background: var(--sunk); }
.tlk-issue span { display: grid; min-width: 0; overflow-wrap: anywhere; } .tlk-issue small { color: var(--muted); font-family: var(--mono); }
.tlk-issue.error { border-color: var(--err); } .tlk-issue.error b { background: var(--err-soft); color: var(--err); }
.tlk-issue.warning { border-color: var(--warm); } .tlk-issue.warning b { background: var(--warm-soft); color: var(--warm); }
.tlk-issue.base { opacity: 0.55; } .tlk-issue.base span { text-decoration: line-through; }
`;

  Lab.addTrack({
    id: 'tools', lang: 'shell',
    title: 'Android Studio and debugging',
    description: 'The tools you use every day on your Water tracker: find your way around Android Studio, read Logcat, pause code in the debugger, look inside the screen, install with adb, check with lint, and let GitHub check every pull request.',
    requires: ['android', 'compose'],
    css,
    lessons: [
      {
        id: 'studio-tour',
        title: 'A tour of Android Studio',
        tagline: 'Find your way around the window: where the files, the code, the running app and the messages are.',
        goals: ['Name the main parts of the Android Studio window', 'Open a tool window such as Logcat or Terminal, and get a closed one back', 'Use three shortcuts: Search Everywhere, quick fixes and comment line'],
        level: 'beginner', introduces: [],
        body: `
<p>You have already built and run an app in Android Studio. The next lessons use tools that live around the edges of its window: Logcat, the debugger, Layout Inspector, a terminal. Knowing where things are saves a lot of hunting. The examples in this track use Ada’s Water tracker from the Compose track: <code>WaterScreen</code>, with its <code>glasses</code> count and its <b>Add a glass</b> button. Its application id is <code>com.example.water</code>.</p>
<p>The window has a few fixed parts. At the top, the <b>toolbar</b>: the run configurations menu (usually <b>app</b>), the target device menu, and the <b>Run</b> and <b>Debug</b> buttons. On the left, the <b>Project</b> window with your files. In the middle, the <b>editor</b>. Around the edges, <b>tool windows</b>, each for one job: <b>Build</b>, <b>Logcat</b>, <b>Terminal</b>, and <b>Running Devices</b>, which shows the emulator’s screen. Click a tool window’s icon on the window edge to open or close it, or choose it under <b>View &gt; Tool Windows</b>. At the very bottom, the <b>status bar</b> says what Studio is busy with.</p>
<p>Three shortcuts cover most days. Press <kbd>Shift</kbd> twice for <b>Search Everywhere</b>: type part of a file name, a function or a menu action, and press <kbd>Enter</kbd>. <kbd>Alt</kbd>+<kbd>Enter</kbd> (<kbd>Option</kbd>+<kbd>Enter</kbd> on macOS) shows <b>quick fixes</b> for the red or yellow marked code under the cursor, such as adding a missing import. <kbd>Ctrl</kbd>+<kbd>/</kbd> (<kbd>Cmd</kbd>+<kbd>/</kbd> on macOS) turns the line under the cursor into a comment, and back.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'bar', label: 'Toolbar<small>app · device · Run · Debug</small>', x: 50, y: 9 },
              { id: 'project', label: 'Project<small>files</small>', x: 15, y: 42, tone: 'muted' },
              { id: 'editor', label: 'Editor<small>code</small>', x: 47, y: 42, tone: 'muted' },
              { id: 'devices', label: 'Running Devices<small>emulator</small>', x: 81, y: 42, tone: 'muted' },
              { id: 'tools', label: 'Tool windows<small>Build · Logcat · Terminal</small>', x: 50, y: 72, tone: 'muted' },
              { id: 'status', label: 'Status bar<small>what Studio is doing</small>', x: 50, y: 93, tone: 'muted' },
            ],
            predict: {
              q: 'You press <b>Run</b> with the emulator selected. Where does your app’s screen appear?',
              options: ['In the editor, next to your code', 'In the Running Devices tool window', 'In the Project window'],
              a: 1,
              why: 'The emulator’s screen is shown in the Running Devices tool window. On a real phone, the app opens on the phone itself.',
            },
            frames: [
              { say: 'The Android Studio window, drawn as boxes in roughly the places you find them. Each part has one job.' },
              { hl: ['bar'], say: 'The toolbar: choose what to run (<b>app</b>) and where (the device menu, for example <b>Medium Phone API 36</b>). <b>Run</b> starts the app; <b>Debug</b> starts it in a mode where you can pause it.' },
              { hl: ['project'], say: 'The Project window lists your files. Double-click one to open it.' },
              { hl: ['editor'], say: 'The editor shows the open file. A red underline marks an error, a yellow highlight a warning. Put the cursor on it and press <kbd>Alt</kbd>+<kbd>Enter</kbd> for fixes.' },
              { add: [['bar', 'devices', 'Run', 'accent']], hl: ['devices'], say: 'Press Run: Studio builds the app, installs it on the emulator and starts it. The emulator’s screen shows in Running Devices.' },
              { hl: ['tools'], say: '<b>Build</b> shows the build, <b>Logcat</b> the messages your app writes, <b>Terminal</b> a command line like the one from the Git track.' },
              { hl: ['status'], say: 'The status bar shows what Studio is busy with, such as a build. If something feels slow, look here first.' },
              { hl: ['tools'], say: 'Closed a tool window by mistake? Click its icon on the window edge, or choose <b>View &gt; Tool Windows</b> and its name. Shift twice and typing its name works too.' },
            ],
          });
        },
        code: `// MainActivity.kt, open in the editor
// Shift twice, type "MainAct", Enter          -> opens this file from anywhere

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Text("Hello")   // red if the import is missing: cursor on Text, Alt+Enter, Import
        }
    }
}

// cursor on the Text line, Ctrl+/ (Cmd+/ on macOS)  ->  // Text("Hello")`,
        remember: 'Toolbar to run, Project for files, editor for code, tool windows for the rest. Shift twice finds anything; Alt+Enter fixes.',
        terms: [
          { term: 'tool window', def: 'A panel on the edge of the Android Studio window for one job, such as Build, Logcat or Terminal. Find them under View &gt; Tool Windows.' },
          { term: 'Running Devices', def: 'The tool window that shows the emulator’s screen while your app runs.' },
          { term: 'Search Everywhere', def: 'Press Shift twice and type to find a file, a function or a menu action.' },
          { term: 'quick fix', def: 'A fix Studio offers for the marked code under the cursor. Alt+Enter (Option+Enter on macOS) opens the list.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the key you press twice to search for anything in Android Studio.', code: 'Search Everywhere: press [[Shift|shift]] twice', why: 'Double Shift opens Search Everywhere: files, functions and menu actions in one box.' },
          { type: 'bug', prompt: '<code>Text</code> is red because its import is missing. Ada follows these steps, but the line turns into a comment instead. Tap the wrong step.', code: 'Put the cursor on Text\nPress Ctrl+/\nChoose Import from the list', bug: 1, fix: 'Press Alt+Enter', why: '<kbd>Ctrl</kbd>+<kbd>/</kbd> comments the line out. <kbd>Alt</kbd>+<kbd>Enter</kbd> opens the quick fixes, where Import is.' },
        ],
        quiz: [
          { q: 'Where do you choose which device your app runs on?', options: ['The target device menu in the toolbar', 'The Project window', 'The status bar'], a: 0, why: 'The toolbar holds what to run, where to run it, and the Run and Debug buttons.' },
          { q: 'A word is underlined in red and the cursor is on it. What does <kbd>Alt</kbd>+<kbd>Enter</kbd> do?', options: ['Deletes the line', 'Shows quick fixes for it', 'Runs the app'], a: 1, why: 'Alt+Enter (Option+Enter on macOS) lists the fixes Studio knows for the marked code.' },
          { q: 'You closed the Terminal window. How do you get it back?', options: ['Restart Android Studio', 'View &gt; Tool Windows &gt; Terminal', 'Create a new project'], a: 1, why: 'Every tool window is listed under View &gt; Tool Windows. Its icon on the window edge works too.' },
        ],
        docs: [['Meet Android Studio: the user interface', 'https://developer.android.com/studio/intro/user-interface'], ['Keyboard shortcuts', 'https://developer.android.com/studio/intro/keyboard-shortcuts']],
      },

      {
        id: 'logcat',
        title: 'Logcat',
        tagline: 'Write messages from your app, find yours among thousands, and read a crash.',
        goals: ['Pick a log level, and keep the tag in one <code>TAG</code> constant', 'Filter Logcat to your app, a tag or a level', 'Find a crash and read which line caused it'],
        level: 'beginner', introduces: ['TAG', 'mine', 'crash'],
        body: `
<p>In the lifecycle lesson you wrote <code>Log.d("Hello", "onStart")</code> and filtered Logcat with <code>tag:Hello</code>. Here is the rest: levels, a tag constant, more queries, and reading a crash. (Your <code>println</code> lines land in Logcat too, with the tag <code>System.out</code>.)</p>
<p>The <code>d</code> in <code>Log.d</code> is the <em>level</em>, Debug. From chatty to serious: <code>Log.v</code> Verbose, <code>Log.d</code> Debug, <code>Log.i</code> Info, <code>Log.w</code> Warn, <code>Log.e</code> Error. Once a file has many log lines, keep the tag in one place: <code>private const val TAG = "Water"</code> at the top of the file (<code>private</code> here means only this file can use it). Then write <code>Log.d(TAG, "added a glass, glasses = $glasses")</code>, and the tag is spelled the same every time.</p>
<p>The device log mixes your lines with lines from the system and other apps, many every second. The query box at the top of Logcat keeps only what you need. It usually starts with <code>package:mine</code> already typed, which keeps your app; clear the box to see everything. <code>tag:Water</code> keeps one tag, <code>level:WARN</code> warnings and anything more serious, <code>is:crash</code> crashes. <code>package:mine level:WARN</code> keeps lines that match both.</p>
<p>A crash shows as a red block. It names the reason, such as <code>java.lang.ArithmeticException: divide by zero</code>, then lists <code>at</code> lines: the <em>stack trace</em>, the chain of function calls that led there, newest first. The first <code>at</code> line with your package and file name is usually where to look. Click its link to jump to that line.</p>`,
        visual(el) {
          const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const L = (time, tag, pkg, lv, msg) => esc(`${time}  ${pkg === 'com.example.water' ? '4242-4242' : '3117-3117'}  ${tag}  ${pkg}  ${lv}  ${msg}`);
          const A = L('09:41:05.870', 'ProfileInstaller', 'com.example.water', 'D', 'Installing profile for com.example.water').replace('4242-4242', '4242-4268');
          const B = L('09:41:06.312', 'Notes', 'com.example.notes', 'I', 'saved 3 notes');
          const C = L('09:41:07.123', 'Water', 'com.example.water', 'D', 'added a glass, glasses = 1');
          const D = L('09:41:07.904', 'Notes', 'com.example.notes', 'W', 'no network, showing saved notes');
          const E = L('09:41:08.450', 'Water', 'com.example.water', 'D', 'added a glass, glasses = 2');
          const F = L('09:41:09.502', 'Water', 'com.example.water', 'W', 'goal is 0');
          const G = L('09:41:09.511', 'AndroidRuntime', 'com.example.water', 'E', 'FATAL EXCEPTION: main') + '\nProcess: com.example.water, PID: 4242\njava.lang.ArithmeticException: divide by zero\n\tat com.example.water.MainActivityKt.percentOfGoal(MainActivity.kt:31)\n\t…';
          const red = s => `<span style="color:var(--t-e)">${s}</span>`;
          const phone = (body, pill, tone) => `<div class="tlk-dev"><span class="tlk-pill ${tone}">${pill}</span><div class="tlk-scr">${body}</div></div>`;
          const app = phone('<div class="tlk-bar">Water</div><div class="tlk-field">2 of 8 glasses</div><div class="tlk-line short"></div>', 'running', 'ok');
          const gone = phone('<div class="tlk-home">Water keeps stopping</div>', 'crashed', 'err');
          Lab.ui.terminal(el, {
            prompt: 'query:',
            panelTitle: 'Emulator',
            predict: {
              q: 'Your query is <code>package:mine level:WARN</code>. Which lines stay?',
              options: ['Only your app’s warnings', 'Your app’s warnings, errors and crashes', 'Warnings from every app on the device'],
              a: 1,
              why: '<code>level:WARN</code> keeps WARN and every more serious level. With <code>package:mine</code> next to it, a line must also come from your app.',
            },
            frames: [
              { clear: true, out: [A, B, C, D, E, F, red(G)].join('\n'), panel: app, say: 'Ada cleared the query box, so every line on the device shows. Each line: time, the process id and the thread id (Android’s numbers for the running app, and for the part of it that wrote the line), tag, package, level, message. (The date at the start is cut to fit.)' },
              { clear: true, cmd: 'package:mine', out: [A, C, E, F, red(G)].join('\n'), panel: app, say: '<code>package:mine</code> keeps lines from the app of the project you have open. The notes app is gone.' },
              { clear: true, cmd: 'tag:Water', out: [C, E, F].join('\n'), panel: app, say: '<code>tag:Water</code> keeps only the messages Ada wrote herself with <code>Log.d(TAG, …)</code> and <code>Log.w(TAG, …)</code>.' },
              { clear: true, cmd: 'package:mine level:WARN', out: [F, red(G)].join('\n'), panel: app, say: 'Warnings and errors from her app. This is a good first query when something feels wrong.' },
              { clear: true, cmd: 'is:crash', out: red(G), panel: gone, say: 'The crash. Read it from the top: <code>FATAL EXCEPTION: main</code> says the app stopped (<code>main</code> is the part of the app that runs the screen: the thread id was the same number as the process id), then which app, then the reason: <code>divide by zero</code>.' },
              { say: 'The first <code>at</code> line names her own code: the function <code>percentOfGoal</code> in <code>MainActivity.kt</code>, line 31. Functions written outside a class are listed as <code>MainActivityKt</code>, after the file they are in. It divided by a goal of 0. Clicking that line in Logcat opens it in the editor.' },
            ],
          });
        },
        code: `import android.util.Log

private const val TAG = "Water"       // private: only this file can use it

fun percentOfGoal(glasses: Int, goal: Int): Int {
    if (goal == 0) {
        Log.w(TAG, "goal is 0")
        return 0                      // before this check: crash, divide by zero
    }
    return glasses * 100 / goal
}

// in the button's onClick:
//     glasses++
//     Log.d(TAG, "added a glass, glasses = $glasses")
// Logcat:  Water  com.example.water  D  added a glass, glasses = 1`,
        remember: 'Log.d(TAG, "...") writes a line. package:mine finds yours, level:WARN the serious ones, is:crash the crash.',
        mistakes: [
          { title: 'Typing the tag by hand every time', bad: `Log.d("Water", "added a glass")
Log.d("Watr", "reset")        // typo: tag:Water never shows this line`, good: `private const val TAG = "Water"

Log.d(TAG, "added a glass")
Log.d(TAG, "reset")`, why: 'In the lifecycle lesson we typed <code>"Hello"</code> each time. That works, but once you have many lines, one constant is safer: one constant means one spelling. Logcat matches the tag text, so a typo hides the line from your query.' },
        ],
        terms: [
          { term: 'log level', def: 'How serious a message is: Verbose, Debug, Info, Warn or Error, written with <code>Log.v</code>, <code>Log.d</code>, <code>Log.i</code>, <code>Log.w</code> or <code>Log.e</code>.' },
          { term: 'query', def: 'What you type in the box at the top of Logcat to keep only some lines, such as <code>package:mine level:WARN</code>.' },
          { term: 'stack trace', def: 'The list of <code>at</code> lines under a crash: the function calls that led to it, newest first.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write a Debug-level message with the tag in <code>TAG</code>.', code: 'Log.[[d]](TAG, "reset to 0")', why: '<code>Log.d</code> writes at the Debug level. <code>TAG</code> keeps the tag spelled the same everywhere.' },
          { type: 'bug', prompt: 'Ada filters Logcat with <code>tag:Water</code>, but her reset message never shows up. Tap the line.', code: 'private const val TAG = "Water"\n\nfun reset() {\n    Log.d("TAG", "reset to 0")\n}', bug: 3, fix: '    Log.d(TAG, "reset to 0")', why: 'In quotes, <code>"TAG"</code> is the text TAG, so the tag of that line is TAG, not Water. Without quotes, <code>TAG</code> is the value <code>"Water"</code>.' },
        ],
        quiz: [
          { q: 'Which query keeps only crashes?', options: ['<code>level:ERROR</code>', '<code>is:crash</code>', '<code>tag:crash</code>'], a: 1, why: '<code>is:crash</code> matches crash entries. <code>level:ERROR</code> also keeps every other error line.' },
          { q: 'In a crash, which line usually points at the code to fix?', options: ['The last line of the block', 'The first <code>at</code> line that names your own package and file', 'The <code>FATAL EXCEPTION</code> line'], a: 1, why: 'The stack trace lists calls newest first. The first one in your own code is where your code was when it failed.' },
          { q: 'Which call writes a warning?', options: ['<code>Log.d(TAG, "goal is 0")</code>', '<code>Log.w(TAG, "goal is 0")</code>', '<code>Log.v(TAG, "goal is 0")</code>'], a: 1, why: '<code>w</code> is Warn. <code>d</code> is Debug and <code>v</code> is Verbose, both less serious.' },
        ],
        docs: [['View logs with Logcat', 'https://developer.android.com/studio/debug/logcat']],
      },

      {
        id: 'debugger',
        title: 'The debugger',
        tagline: 'Pause your running app on a line and look at the real values inside.',
        goals: ['Set a breakpoint and start the app with Debug', 'Run your code one line at a time with Step Over', 'Read values in the Variables pane to find a bug'],
        level: 'beginner', introduces: [],
        body: `
<p>Lin’s shopping screen adds up the prices 5, 8 and 12, and shows <b>Total: 20</b>. It should be 25. She could add <code>Log.d</code> lines, run again, and guess. The <em>debugger</em> is faster: it pauses the running app on a line you choose, and shows every value at that moment.</p>
<p>Click the gutter, the strip just left of the code, next to a line: a red dot appears. That is a <em>breakpoint</em>. Then press <b>Debug</b> (the bug icon next to Run, <kbd>Shift</kbd>+<kbd>F9</kbd>; <kbd>Ctrl</kbd>+<kbd>D</kbd> on macOS) instead of Run. When the app reaches that line, it freezes before running it, and the Debug window opens. Its <b>Variables</b> pane lists every value the function can see right now.</p>
<p><b>Step Over</b> (<kbd>F8</kbd>) runs the current line and pauses on the next one, so you can watch the values change. <b>Step Into</b> (<kbd>F7</kbd>) goes inside a function called on the current line, and <b>Step Out</b> (<kbd>Shift</kbd>+<kbd>F8</kbd>) finishes the function you are in and pauses back where it was called. <b>Resume Program</b> (<kbd>F9</kbd>; <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>R</kbd> on macOS) lets the app run on, until it reaches a breakpoint again.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun total(prices: List<Int>): Int {\n    var sum = 0\n    for (i in 1 until prices.size) {\n        sum += prices[i]\n    }\n    return sum\n}',
            varsTitle: 'Variables',
            predict: {
              q: '<code>total</code> is called with <code>listOf(5, 8, 12)</code>. When the loop starts, what value does the debugger show for <code>i</code>?',
              options: ['<code>0</code>', '<code>1</code>', '<code>5</code>'],
              a: 1,
              why: '<code>1 until prices.size</code> starts at 1. Index 0, which holds the 5, is never added. That is the bug.',
            },
            frames: [
              { say: 'A breakpoint (red dot) sits on line 2. Lin presses <b>Debug</b> and opens the shopping screen.' },
              { line: 2, vars: { prices: 'size = 3' }, say: 'The app pauses before running line 2. Variables shows what the function can see: only <code>prices</code> so far. Studio shows a list as its size; click the arrow next to it to see 5, 8 and 12.' },
              { line: 3, vars: { sum: '0' }, say: '<b>Step Over</b> ran line 2. A new value appears: <code>sum = 0</code>.' },
              { line: 4, vars: { i: '1' }, say: 'Step Over again: the loop starts, and <code>i</code> is 1, not 0. Suspicious: index 0 holds the 5.' },
              { line: 3, vars: { sum: '8' }, say: 'Line 4 added <code>prices[1]</code>, which is 8. The debugger goes back to the loop line for the next round.' },
              { line: 4, vars: { i: '2' }, say: '<code>i</code> is 2. This round adds <code>prices[2]</code>, the 12.' },
              { line: 6, vars: { sum: '20', i: null }, say: 'The loop is over and <code>i</code> is gone from Variables, because it only exists inside the loop. <code>sum</code> is 20: the 5 was skipped. Fix: <code>0 until prices.size</code>.' },
            ],
          });
        },
        code: `fun total(prices: List<Int>): Int {
    var sum = 0
    for (i in 0 until prices.size) {   // was 1 until: skipped prices[0]
        sum += prices[i]
    }
    return sum
}

// breakpoint on line 2, then Debug (Shift+F9)
// Step Over (F8) and watch Variables:
//   i = 0, sum = 5     i = 1, sum = 13     i = 2, sum = 25
// Text("Total: \${total(listOf(5, 8, 12))}")   // Total: 25`,
        remember: 'Breakpoint on the line, Debug instead of Run, then Step Over and watch Variables until a value surprises you.',
        terms: [
          { term: 'debugger', def: 'A tool that pauses your running app so you can look at its values and run it one line at a time.' },
          { term: 'breakpoint', def: 'A red dot in the gutter next to a line. When the app was started with Debug, it pauses before that line runs.' },
          { term: 'Step Over, Step Into, Step Out', def: 'Run the current line and pause on the next; go inside the function called on this line; finish the current function and go back to its caller.' },
          { term: 'Variables pane', def: 'The part of the Debug window that lists every value the paused function can see.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The debugger showed <code>i</code> starting at 1. Fix the loop so it starts at the first item.', code: 'for (i in [[0]] until prices.size) {', why: 'List indexes start at 0, so the loop must too, or the first price is skipped.' },
          { type: 'bug', prompt: 'Lin wants to pause inside <code>total</code>, but the app never stops. Tap the wrong step.', code: 'Click the gutter next to line 2: a red dot appears\nPress Run\nOpen the shopping screen', bug: 1, fix: 'Press Debug', why: 'Breakpoints only pause an app that was started with Debug. Run starts it without the debugger.' },
        ],
        quiz: [
          { q: 'You are paused on a line that calls <code>priceOf(item)</code>, and you want to see what happens inside <code>priceOf</code>. Which button?', options: ['Step Over', 'Step Into', 'Resume Program'], a: 1, why: 'Step Into goes inside the called function. Step Over would run the whole call as one step.' },
          { q: 'What does a red dot in the gutter mean?', options: ['A line that crashed', 'A breakpoint: the app pauses before this line runs', 'A line that was never run'], a: 1, why: 'Clicking the gutter sets a breakpoint. It works when the app was started with Debug.' },
          { q: 'You have seen enough and want the app to run on normally. What do you press?', options: ['Step Over', 'Resume Program', 'Step Into'], a: 1, why: 'Resume Program lets the app run until it reaches a breakpoint again.' },
        ],
        docs: [['Debug your app', 'https://developer.android.com/studio/debug'], ['Keyboard shortcuts', 'https://developer.android.com/studio/intro/keyboard-shortcuts']],
      },

      {
        id: 'layout-inspector',
        title: 'Layout Inspector',
        tagline: 'Look inside your running app’s screen: which composables it is made of, and what each one received.',
        goals: ['Open Layout Inspector on a running app', 'Find a composable in the Component Tree and read its values in Attributes', 'See how often each composable recomposes or skips'],
        level: 'beginner', introduces: [],
        body: `
<p>Ada tapped <b>Add a glass</b> three times, but the Water screen still says <b>0 of 8 glasses</b>. Is the Text there with old values? Is it a different Text? <b>Layout Inspector</b> shows the composables your running app really drew, nested the way they are on screen, with the values each one received.</p>
<p>Run the app, open the <b>Running Devices</b> window and click <b>Toggle Layout Inspector</b>. You get three parts. The <b>Layout Display</b> is a picture of the screen. The <b>Component Tree</b> lists the composables, nested like your code: a <code>Column</code> holds a <code>Text</code> and a <code>Button</code>. <b>Attributes</b> shows the values of the one you select, such as the text of a <code>Text</code>. Click a component in the Component Tree to select it. To pick one by clicking the screen picture, first turn on <b>Toggle Deep Inspect</b>; without it, a click on the picture works the app, like a tap. Double-click a component to jump to the code that made it.</p>
<p>The Component Tree can also count, for each composable, how many times it was recomposed and how many times it was skipped. If you don’t see the two count columns, open the <b>View Options</b> menu at the top of the Component Tree and choose <b>Show Recomposition Counts</b>. Press <b>Reset</b>, do one thing in the app, and read the numbers. The counts need an emulator or phone with API 29 (Android 10) or higher.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'screen', label: 'WaterScreen', x: 50, y: 9 },
              { id: 'col', label: 'Column', x: 50, y: 34 },
              { id: 'text', label: 'Text<small>"0 of 8 glasses"</small>', x: 25, y: 62 },
              { id: 'btn', label: 'Button', x: 75, y: 62 },
              { id: 'btext', label: 'Text<small>"Add a glass"</small>', x: 75, y: 90 },
            ],
            predict: {
              q: 'Ada presses Reset and taps <b>Add a glass</b> once. Which composable is <em>skipped</em>, so its skip count goes up?',
              options: ['The Text that shows the glasses', 'The Button', 'WaterScreen'],
              a: 1,
              why: 'Only code that reads <code>glasses</code> runs again. WaterScreen reads it to build the glasses text. Nothing the Button received changed, so Compose skips it.',
            },
            frames: [
              { add: [['screen', 'col'], ['col', 'text'], ['col', 'btn'], ['btn', 'btext']], say: 'The Water tracker’s Component Tree, drawn as boxes. It has the same shape as the code in <code>WaterScreen</code>.' },
              { hl: ['col'], say: 'The <code>Column</code> holds the Text and the Button, and the Button holds its own Text, the label.' },
              { hl: ['text'], say: 'Select the first Text. Attributes shows what it received: <code>text = "0 of 8 glasses"</code>. The Layout Display outlines it on the screen picture.' },
              { hl: ['btn'], say: 'Double-click the Button and the editor opens the line <code>Button(onClick = { glasses++ })</code>.' },
              { hl: ['screen', 'text'], say: 'Ada presses Reset, then taps once. WaterScreen and the glasses Text are recomposed: <code>glasses</code> changed, and they read it. Their recomposition count is now 1.' },
              { hl: ['btn'], say: 'The Button is skipped: nothing it received changed. Its skip count goes up to 1 instead.' },
              { say: 'Two more taps: WaterScreen and the glasses Text show 3, matching the 3 taps. A composable whose count climbs far faster than your taps is worth a look.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    var glasses by remember { mutableStateOf(0) }
    Column {
        Text("$glasses of 8 glasses")       // recomposed on every tap: its text changed
        Button(onClick = { glasses++ }) {   // skipped: nothing it received changed
            Text("Add a glass")
        }
    }
}

// Running Devices > Toggle Layout Inspector
// Component Tree:  WaterScreen > Column > Text, Button > Text
// View Options > Show Recomposition Counts, then Reset, then tap once`,
        remember: 'Running Devices, Toggle Layout Inspector: the tree shows what was drawn, Attributes shows what it received. Reset, tap once, read the counts.',
        mistakes: [
          { title: 'Reading the counts without a Reset', bad: `// open the counts after ten minutes of tapping around
// Text: 214 recompositions -> something must be wrong!`, good: `// press Reset, tap once
// Text: 1 recomposition -> one per tap, as expected`, why: 'The counts add up everything since the app started. Reset first, do one thing, then judge.' },
        ],
        terms: [
          { term: 'Layout Inspector', def: 'An Android Studio tool that shows the composables of your running app’s screen and the values they received.' },
          { term: 'Component Tree', def: 'The Layout Inspector pane that lists the composables, nested the way they are drawn.' },
          { term: 'Attributes', def: 'The Layout Inspector pane that shows the values of the selected composable, such as its text.' },
          { term: 'recomposition count', def: 'How many times a composable ran again, next to how many times Compose skipped it. Turn them on under View Options.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the menu item that shows the count columns.', code: 'View Options > Show [[Recomposition|recomposition]] Counts', why: 'The option is in the View Options menu at the top of the Component Tree.' },
          { type: 'bug', prompt: 'Tapping changes <code>glasses</code>, but the screen keeps saying <b>0 of 8 glasses</b>. Layout Inspector shows the Text with <code>text = "0 of 8 glasses"</code>, and its count never moves. Tap the line.', code: '@Composable\nfun WaterScreen() {\n    var glasses by remember { mutableStateOf(0) }\n    Column {\n        Text("0 of 8 glasses")\n        Button(onClick = { glasses++ }) {\n            Text("Add a glass")\n        }\n    }\n}', bug: 4, fix: '        Text("$glasses of 8 glasses")', why: 'The Text was given the fixed text <code>"0 of 8 glasses"</code>, so it never reads <code>glasses</code>. With <code>$glasses</code> it reads it, and is recomposed when it changes.' },
        ],
        quiz: [
          { q: 'Where do you start Layout Inspector?', options: ['In the Running Devices window, with Toggle Layout Inspector', 'In Logcat, with a query', 'Under File &gt; New'], a: 0, why: 'Run the app, then use Toggle Layout Inspector in the Running Devices window.' },
          { q: 'You select a Text in the Component Tree. Where do you read the text it received?', options: ['Attributes', 'Logcat', 'The status bar'], a: 0, why: 'Attributes shows the values of the selected composable.' },
          { q: 'You tap once, and a composable’s skip count goes up by 1. What happened?', options: ['It ran again', 'Compose skipped it: nothing it received changed', 'It crashed'], a: 1, why: 'The first column counts recompositions, the second counts skips.' },
        ],
        docs: [['Debug your layout with Layout Inspector', 'https://developer.android.com/studio/debug/layout-inspector'], ['Debug your Compose UI', 'https://developer.android.com/develop/ui/compose/tooling/debug']],
      },

      {
        id: 'adb',
        title: 'adb',
        tagline: 'Talk to the phone or emulator from the terminal: install apps, run commands on it, read its log.',
        goals: ['List connected devices with <code>adb devices</code>', 'Build an APK with <code>./gradlew assembleDebug</code>, then install and remove it with <code>adb install</code> and <code>adb uninstall</code>', 'Run a command on the device with <code>adb shell</code>, and read its log with <code>adb logcat</code>'],
        level: 'beginner', introduces: ['adb', 'devices', 'gradlew', 'assembleDebug', 'install', 'uninstall', 'shell', 'pm', 'packages', 'logcat', '-s'],
        body: `
<p>Pressing Run builds your app, installs it and starts it. Sometimes you want one piece only: put the same app on a second phone, remove it to start clean, or read the log in a terminal. <code>adb</code>, the Android Debug Bridge, is the command line tool Studio itself uses to talk to devices, and you can type its commands yourself.</p>
<p><code>adb</code> comes with Android Studio, in the SDK’s <code>platform-tools</code> folder. Type its commands in a terminal, such as Studio’s Terminal window. (If the terminal says the command is not found, the guide linked below shows where it lives.) <code>adb devices</code> lists the emulators and phones adb can reach. Each one has a <em>serial</em>, such as <code>emulator-5554</code>. When several are connected, put <code>-s</code> and the serial right after <code>adb</code>: <code>adb -s emulator-5554 install …</code>.</p>
<p>To install, you need an <em>APK</em>: one file holding your whole app. Build it with <code>./gradlew assembleDebug</code> in the Terminal. <code>gradlew</code> is a small file in the top folder of every project that runs Gradle, the build tool behind the Run button; <code>./</code> means “the one in this folder” (in the Windows Command Prompt, type <code>gradlew assembleDebug</code>). <code>assembleDebug</code> asks it to build the debug version of the app, into <code>app/build/outputs/apk/debug/app-debug.apk</code>. (The <code>build</code> folder shows when you switch the Project window from the Android view to the Project view, with the menu at its top.) <code>adb install</code> and that path installs it on the device. <code>adb uninstall com.example.water</code> removes it again, by its application id, the <code>applicationId</code> in the app’s <code>build.gradle.kts</code> (Module :app).</p>
<p><code>adb shell</code> and a command runs that command on the device itself. For example <code>pm</code>, the device’s package manager (the part of Android that keeps track of installed apps): <code>adb shell pm list packages water</code> lists installed apps whose id contains <code>water</code>. <code>adb logcat</code> prints the device log in the terminal, and <code>adb logcat -s Water</code> only the lines with the tag Water (after <code>logcat</code>, <code>-s</code> means something else: keep only this tag). It keeps printing until you press <kbd>Ctrl</kbd>+<kbd>C</kbd>, which stops a running command.</p>`,
        visual(el) {
          const dev = (pill, tone, screen) => `<div class="tlk-dev"><span class="tlk-pill ${tone}">${pill}</span><div class="tlk-scr">${screen}</div></div>`;
          const home = t => `<div class="tlk-home">${t}</div>`;
          const app = n => `<div class="tlk-bar">Water</div><div class="tlk-field">${n} of 8 glasses</div><div class="tlk-line short"></div>`;
          Lab.ui.terminal(el, {
            panelTitle: 'Emulator',
            predict: {
              q: 'Ada runs <code>adb install</code> and the terminal answers <code>Success</code>. What does the emulator show?',
              options: ['The app opens by itself', 'Nothing new on screen: the app is installed, but not started', 'An error: installing needs Android Studio'],
              a: 1,
              why: '<code>adb install</code> only installs. The app waits in the app list until someone opens it.',
            },
            frames: [
              { panel: dev('emulator-5554', 'ok', home('Home screen')), say: 'An emulator is running. Ada opens the Terminal window in Android Studio, in her project’s folder.' },
              { cmd: 'adb devices', out: 'List of devices attached\nemulator-5554\tdevice', say: 'One device. <code>emulator-5554</code> is its serial, and <code>device</code> means adb can talk to it.' },
              { cmd: './gradlew assembleDebug', out: '&gt; Task :app:assembleDebug\n\nBUILD SUCCESSFUL in 12s', say: 'Gradle builds the debug APK into <code>app/build/outputs/apk/debug/</code>. (Output shortened.)' },
              { cmd: 'adb install app/build/outputs/apk/debug/app-debug.apk', out: 'Performing Streamed Install\nSuccess', panel: dev('emulator-5554', 'ok', home('Water installed')), say: 'adb copies the APK onto the emulator and installs it.' },
              { cmd: 'adb shell pm list packages water', out: 'package:com.example.water', say: '<code>adb shell</code> runs <code>pm</code> on the emulator. It lists every installed app whose id contains <code>water</code>: just hers.' },
              { cmd: 'adb logcat -s Water', out: '10-20 09:41:07.123  4242  4242 D Water   : added a glass, glasses = 1\n10-20 09:41:08.450  4242  4242 D Water   : added a glass, glasses = 2', panel: dev('emulator-5554', 'ok', app(2)), say: 'She opens the app and taps <b>Add a glass</b> twice. Her <code>Log.d</code> lines from the Logcat lesson appear: date, time, the process id and the thread id, level <code>D</code>, tag, message.' },
              { cmd: 'adb uninstall com.example.water', out: 'Success', panel: dev('emulator-5554', 'ok', home('Home screen')), say: '<kbd>Ctrl</kbd>+<kbd>C</kbd> stopped the log. <code>adb uninstall</code> removes the app by its id, and its saved data goes with it.' },
            ],
          });
        },
        code: `adb devices
# List of devices attached
# emulator-5554	device

./gradlew assembleDebug           # builds app/build/outputs/apk/debug/app-debug.apk
# BUILD SUCCESSFUL in 12s

adb install app/build/outputs/apk/debug/app-debug.apk
# Performing Streamed Install
# Success

adb shell pm list packages water
# package:com.example.water

adb logcat -s Water                # only lines tagged Water; Ctrl+C stops it

adb uninstall com.example.water
# Success

# several devices connected: say which one
adb -s emulator-5554 install app/build/outputs/apk/debug/app-debug.apk`,
        remember: 'adb devices to see, ./gradlew assembleDebug to build the APK, adb install to add, adb uninstall to remove, adb shell to run a command on the device, adb logcat to read the log.',
        terms: [
          { term: 'adb', def: 'Android Debug Bridge: a command line tool that installs apps on a device, runs commands on it and reads its log.' },
          { term: 'APK', def: 'One file that holds a whole Android app, ready to install, such as <code>app-debug.apk</code>.' },
          { term: 'serial', def: 'The name adb gives each device, such as <code>emulator-5554</code>. Pick one with <code>-s</code> right after <code>adb</code>.' },
          { term: 'gradlew', def: 'A small file in the top folder of a project that runs Gradle, the build tool. <code>./gradlew assembleDebug</code> builds the debug APK.' },
                  ],
        challenges: [
          { type: 'blank', prompt: 'Install the debug APK on the emulator.', code: 'adb [[install]] app/build/outputs/apk/debug/app-debug.apk', why: '<code>adb install</code> takes the path of an APK on your computer.' },
          { type: 'bug', prompt: 'Ada wants to remove the Water app from the emulator, but the second command fails. Tap it.', code: 'adb devices\nadb uninstall app-debug.apk', bug: 1, fix: 'adb uninstall com.example.water', why: 'Installing takes a file, but uninstalling takes the app’s id: the device no longer has the file, it knows the app by its id.' },
        ],
        quiz: [
          { q: 'What does <code>adb devices</code> show?', options: ['Every app on the phone', 'The emulators and phones adb can talk to', 'The files in your project'], a: 1, why: 'It lists each connected device with its serial and state.' },
          { q: 'Which command runs <code>pm</code> on the device?', options: ['<code>pm list packages</code>', '<code>adb shell pm list packages</code>', '<code>adb pm shell list packages</code>'], a: 1, why: '<code>adb shell</code> followed by a command runs that command on the device. Typed alone, <code>pm</code> would run on your computer, which has no such tool.' },
          { q: '<code>adb logcat -s Water</code> keeps printing lines. How do you stop it?', options: ['Close Android Studio', 'Press <kbd>Ctrl</kbd>+<kbd>C</kbd>', 'Uninstall the app'], a: 1, why: 'Ctrl+C stops the command that is running in the terminal.' },
        ],
        docs: [['Android Debug Bridge (adb)', 'https://developer.android.com/tools/adb'], ['Logcat command-line tool', 'https://developer.android.com/tools/logcat']],
      },

      {
        id: 'lint',
        title: 'Lint',
        tagline: 'A tool that reads your code and warns you about likely bugs before anyone runs it.',
        goals: ['Run lint with <code>./gradlew lint</code> and find its report', 'Fix a lint error, such as state made without <code>remember</code>', 'Use a baseline so old warnings don’t hide new ones'],
        level: 'beginner', introduces: ['lint', 'baseline'],
        body: `
<p>In the Compose track you saw that state made without <code>remember</code> starts over on every recomposition. Android Studio already marks it red, as the Compose track showed: that red mark is lint. But the code still compiles and runs, so nothing stops you from shipping it. <em>Lint</em> reads your code, resources and manifest without running anything, and reports likely bugs like this one. Each <em>issue</em> has an id, such as <code>UnrememberedMutableState</code>, and a severity, such as warning or error.</p>
<p>In the editor, lint marks problems as you type: yellow for a warning, a red underline for something more serious. Hover over it to read why, and press <kbd>Alt</kbd>+<kbd>Enter</kbd> for fixes. These marks do not stop Run, and Run never runs a full lint check.</p>
<p>To check the whole project, run <code>./gradlew lint</code> in the Terminal window, with the same <code>gradlew</code> you used in the adb lesson (in the Windows Command Prompt, type <code>gradlew lint</code>). It writes a report you can open in a browser, under <code>app/build/reports/</code>. If lint finds an error, the command fails.</p>
<p>An older project may show 200 warnings at once, and a new one hides among them. A <em>baseline</em> is a file, <code>lint-baseline.xml</code>, that records today’s issues, so later runs report only new ones. Add <code>baseline = file("lint-baseline.xml")</code> inside <code>lint { }</code> in the <code>android { }</code> block of the app’s <code>build.gradle.kts</code> (Module :app). The first run writes the file and then stops with an error on purpose, so you notice; the extra setting <code>-Dlint.baselines.continue=true</code>, shown below, tells it to carry on. Commit the file, and fix the old issues over time.</p>`,
        visual(el) {
          const issue = (sev, at, msg, base) => `<div class="tlk-issue ${base ? 'base' : sev}"><b>${base ? 'baseline' : sev}</b><span><small>${at}</small>${msg}</span></div>`;
          const ERR = issue('error', 'MainActivity.kt:24', 'Creating a state object during composition without using <code>remember</code> [UnrememberedMutableState]');
          const OLD = b => issue('warning', 'strings.xml:3', 'The resource <code>R.string.old_title</code> appears to be unused [UnusedResources]', b);
          const NEW = issue('warning', 'strings.xml:4', 'The resource <code>R.string.share_label</code> appears to be unused [UnusedResources]');
          const note = t => `<p class="tlk-note">${t}</p>`;
          const fail = '&gt; Task :app:lintDebug FAILED\n…\nFAILURE: Build failed with an exception.\n\n* What went wrong:\nExecution failed for task \':app:lintDebug\'.\n&gt; Lint found errors in the project; aborting build.';
          Lab.ui.terminal(el, {
            panelTitle: 'Lint report',
            predict: {
              q: 'Lin’s Like button builds and runs. Does that mean lint has nothing to report?',
              options: ['Yes: an app that runs has no lint problems', 'No: lint finds likely bugs in code that compiles and runs', 'Yes, as long as Run showed no errors'],
              a: 1,
              why: 'Lint is not the compiler. It looks for code that works today but is likely wrong, such as state without <code>remember</code>.',
            },
            frames: [
              { panel: note('No report yet.'), say: 'Lin’s Like button keeps its state in <code>var liked by mutableStateOf(false)</code>, without <code>remember</code>. It builds and runs. She opens the Terminal window.' },
              { cmd: './gradlew lint', out: fail, panel: ERR + OLD(false), say: 'lint runs <code>lintDebug</code>: lint for the debug version of the app. One error, <code>UnrememberedMutableState</code>, and one warning: an unused string, <code>UnusedResources</code>. The error makes the command fail. (Output shortened.)' },
              { cmd: './gradlew lint', out: '&gt; Task :app:lintDebug\nWrote HTML report to file:///home/lin/Likes/app/build/reports/lint-results-debug.html\n\nBUILD SUCCESSFUL in 8s', panel: OLD(false), say: 'She changes it to <code>var liked by remember { mutableStateOf(false) }</code> and runs lint again. The error is gone. A warning alone does not fail the command, but it stays in the report.' },
              { cmd: './gradlew lint -Dlint.baselines.continue=true', out: 'Wrote XML report to file:///home/lin/Likes/app/lint-baseline.xml\nCreated baseline file /home/lin/Likes/app/lint-baseline.xml\n\nBUILD SUCCESSFUL in 9s', panel: note('Recorded in lint-baseline.xml:') + OLD(true), say: 'She adds <code>baseline = file("lint-baseline.xml")</code> to the Gradle file. This first run writes today’s issues into the file. She commits it.' },
              { cmd: './gradlew lint', out: '&gt; Task :app:lintDebug\nWrote HTML report to file:///home/lin/Likes/app/build/reports/lint-results-debug.html\n\nBUILD SUCCESSFUL in 7s', panel: NEW + OLD(true), say: 'A week later, a new string is left unused. The old warning stays quiet: the report now lists a single warning, the new unused string.' },
            ],
          });
        },
        code: `# in the Terminal window, in the project's top folder
./gradlew lint
# > Task :app:lintDebug
# Wrote HTML report to file:///home/lin/Likes/app/build/reports/lint-results-debug.html

# build.gradle.kts (Module :app): record today's issues in a baseline
#   android {
#       lint {
#           baseline = file("lint-baseline.xml")
#       }
#   }

# the first run writes the file; the setting lets it carry on. Commit the file
./gradlew lint -Dlint.baselines.continue=true
# Created baseline file /home/lin/Likes/app/lint-baseline.xml`,
        remember: 'Run never runs lint: ./gradlew lint does. Fix the errors, and baseline old warnings so new ones stand out.',
        terms: [
          { term: 'lint', def: 'A tool that reads your code, resources and manifest without running them, and reports likely bugs.' },
          { term: 'issue id, severity', def: 'Each lint issue has an id, such as <code>UnrememberedMutableState</code>, and a severity, such as warning or error. Errors make <code>./gradlew lint</code> fail.' },
          { term: 'baseline', def: 'A file, <code>lint-baseline.xml</code>, that records known issues, so lint reports only new ones.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run lint on the whole project from the Terminal window.', code: './gradlew [[lint]]', why: '<code>gradlew</code> runs Gradle, and <code>lint</code> is the job you ask it to do.' },
          { type: 'bug', prompt: 'Lint reports <code>UnrememberedMutableState</code> for this button: the Like never sticks. Tap the line.', code: '@Composable\nfun LikeButton() {\n    var liked by mutableStateOf(false)\n    Button(onClick = { liked = !liked }) {\n        Text(if (liked) "Liked" else "Like")\n    }\n}', bug: 2, fix: '    var liked by remember { mutableStateOf(false) }', why: 'Without <code>remember</code>, every recomposition makes a new state set to <code>false</code>, so the tap is lost.' },
        ],
        quiz: [
          { q: 'Does pressing Run also run a full lint check?', options: ['Yes, every time', 'No: you run it yourself, for example with <code>./gradlew lint</code>', 'Only when the app crashes'], a: 1, why: 'Lint is not part of the normal build. Run it yourself, or let a server run it for you.' },
          { q: 'What does a lint baseline do?', options: ['Fixes old issues automatically', 'Records today’s issues, so later runs report only new ones', 'Turns lint off'], a: 1, why: 'Old issues are filtered out, so a new one stands out instead of hiding among them.' },
          { q: 'Lint finds one warning and no errors. What does <code>./gradlew lint</code> do?', options: ['It fails', 'It succeeds, and the warning is in the report', 'It deletes the code'], a: 1, why: 'By default only errors make the command fail. Warnings are reported.' },
        ],
        docs: [['Improve your code with lint checks', 'https://developer.android.com/studio/write/lint']],
      },

      {
        id: 'ci',
        title: 'Continuous integration',
        tagline: 'Let GitHub build and check every pull request for you, on a clean machine.',
        goals: ['Say what continuous integration is and why teams use it', 'Read a minimal GitHub Actions workflow line by line', 'Find a failed check on a pull request and see which step failed'],
        level: 'beginner', introduces: ['pull_request', 'jobs', 'steps', 'uses'],
        body: `
<p>Sam opens a pull request. It worked on his laptop, but he forgot to run lint, and he forgot to commit one file, so the project doesn’t even build anywhere else. <em>Continuous integration</em> (CI) catches this: for every change, a fresh machine builds the project and runs the checks, automatically, before anyone merges it.</p>
<p>On GitHub this is called <b>GitHub Actions</b>. You describe the work in a <em>workflow</em>: a text file in the folder <code>.github/workflows/</code> of your repository, such as <code>android.yml</code>. It is written in YAML, a format of <code>key: value</code> lines. Indentation with spaces (never tabs) shows what belongs inside what, the way <code>{ }</code> does in Kotlin, and a line that starts with <code>-</code> is one item of a list.</p>
<p>Read the workflow below from the top. <code>on:</code> says when it runs: on every pull request, and on every push to <code>main</code> (<code>[main]</code> is a list with one item). <code>jobs:</code> lists the work. Our one job, <code>build</code>, <code>runs-on: ubuntu-latest</code>, a fresh Linux machine from GitHub. Its <code>steps:</code> run in order.</p>
<p>A <code>uses:</code> step runs an <em>action</em>, a ready-made step someone published; the part after <code>@</code> picks its version, and <code>with:</code> gives it settings. The comments in the code say what each action does. Last, a <code>run:</code> step types a command: <code>./gradlew lint assembleDebug</code>, lint and then the debug APK from the adb lesson. Commit the file and push: from then on, each pull request shows a <em>check</em>, a green tick or a red cross. Open it, or the <b>Actions</b> tab of the repository, to read each step’s output.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'pr', label: 'PR', sub: 'on: pull_request' },
              { id: 'checkout', label: 'checkout', sub: 'get the code' },
              { id: 'java', label: 'setup-java', sub: 'Java 17' },
              { id: 'gradle', label: 'setup-gradle', sub: 'Gradle' },
              { id: 'run', label: 'run', sub: 'lint, assembleDebug' },
            ],
            predict: {
              q: 'Sam’s branch still has <code>mutableStateOf</code> without <code>remember</code>. Which step turns red?',
              options: ['<code>actions/checkout</code>', '<code>actions/setup-java</code>', 'The <code>run:</code> step, <code>./gradlew lint assembleDebug</code>'],
              a: 2,
              why: 'Getting the code, Java and Gradle all work. Lint finds the error in the last step, so that is where the job fails.',
            },
            frames: [
              { say: 'Sam pushes his branch and opens a pull request. GitHub finds <code>.github/workflows/android.yml</code>.' },
              { at: 'pr', packet: 'commit', say: '<code>on: pull_request</code> matches, so the job <code>build</code> starts on a fresh Linux machine.' },
              { at: 'checkout', mark: { pr: 'ok' }, say: '<code>actions/checkout</code>: the machine starts empty, so first it downloads the repository.' },
              { at: 'java', mark: { checkout: 'ok' }, say: '<code>actions/setup-java</code> installs Java 17. Gradle needs it to run.' },
              { at: 'gradle', mark: { java: 'ok' }, say: '<code>setup-gradle</code> prepares Gradle. It also brings back files saved by earlier runs on <code>main</code>, so builds get faster. You may see a notice about its caching terms in the log; it is free for public repositories.' },
              { at: 'run', tone: 'err', mark: { gradle: 'ok', run: 'err' }, say: '<code>./gradlew lint assembleDebug</code>: lint finds <code>UnrememberedMutableState</code> and the command fails. The step turns red, and the pull request shows a red cross.' },
              { at: 'pr', packet: 'fix', mark: { pr: '', checkout: '', java: '', gradle: '', run: '' }, say: 'Sam adds <code>remember</code>, commits and pushes to the same branch. The check starts again, on the new commit.' },
              { at: 'run', tone: 'ok', mark: { pr: 'ok', checkout: 'ok', java: 'ok', gradle: 'ok', run: 'ok' }, say: 'Every step passes: a green tick. The team can review and merge, knowing the project builds and lint is clean.' },
            ],
          });
        },
        code: `# .github/workflows/android.yml
name: Android CI                # the name shown in the Actions tab

on:                             # when it runs:
  pull_request:                 #   on every pull request
  push:
    branches: [main]            #   and on every push to main

jobs:
  build:                        # one job, called build
    runs-on: ubuntu-latest      # on a fresh Linux machine from GitHub
    steps:                      # in order; after a failed step, the rest don't run
      - uses: actions/checkout@v7               # download the repository
      - uses: actions/setup-java@v6             # install Java
        with:
          distribution: temurin                 # which Java build: a free one
          java-version: 17
      - uses: gradle/actions/setup-gradle@v6    # prepare Gradle, reuse saved files
      - run: ./gradlew lint assembleDebug       # lint, then build the debug APK`,
        remember: 'A workflow in .github/workflows/ runs on every pull request: check out, set up Java and Gradle, then ./gradlew lint assembleDebug.',
        mistakes: [
          { title: 'gradlew is not allowed to run', bad: `      - run: ./gradlew lint assembleDebug
# in the log:
# /home/runner/work/_temp/…sh: line 1: ./gradlew: Permission denied
# Error: Process completed with exit code 126.`, good: `      - run: chmod +x gradlew
      - run: ./gradlew lint assembleDebug`, why: 'A project committed from Windows often stores <code>gradlew</code> without permission to run as a program, and the Linux machine refuses it. <code>chmod +x gradlew</code> gives it that permission first.' },
        ],
        terms: [
          { term: 'continuous integration (CI)', def: 'A server builds and checks every change automatically, on a clean machine, before it is merged.' },
          { term: 'workflow', def: 'A YAML file in <code>.github/workflows/</code> that says when GitHub Actions runs and what it does.' },
          { term: 'job, step', def: 'A job runs on one machine. Its steps run in order; <code>uses:</code> runs a ready-made action, <code>run:</code> runs a command.' },
          { term: 'check', def: 'The result a workflow shows on a pull request: a green tick when it passed, a red cross when it failed.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the workflow on every pull request, and on pushes to main.', code: 'on:\n  [[pull_request]]:\n  push:\n    branches: [main]', why: '<code>pull_request</code> checks every pull request. <code>push</code> to <code>main</code> checks what was merged.' },
          { type: 'bug', prompt: 'The check is always green, but lint errors still reach <code>main</code>. Tap the line.', code: 'steps:\n  - uses: actions/checkout@v7\n  - uses: actions/setup-java@v6\n    with:\n      distribution: temurin\n      java-version: 17\n  - uses: gradle/actions/setup-gradle@v6\n  - run: ./gradlew assembleDebug', bug: 7, fix: '  - run: ./gradlew lint assembleDebug', why: 'Building does not run lint. If the workflow doesn’t ask for <code>lint</code>, nothing checks it.' },
        ],
        quiz: [
          { q: 'Where must the workflow file be?', options: ['In the <code>app</code> folder', 'In <code>.github/workflows/</code>', 'Anywhere, if it ends in <code>.yml</code>'], a: 1, why: 'GitHub only discovers workflows in <code>.github/workflows</code>.' },
          { q: 'The <code>run:</code> step with lint fails. What happens next?', options: ['The steps after it run anyway', 'The steps after it don’t run, and the pull request shows a red cross', 'GitHub fixes the code'], a: 1, why: 'A failed step stops the job. Fix the code and push again to rerun it.' },
          { q: 'Why does the job start with <code>actions/checkout</code>?', options: ['To choose a branch name', 'The machine starts empty, so it first downloads your repository', 'To install Java'], a: 1, why: 'Every run gets a fresh machine. Without checkout, there is no code to build.' },
        ],
        docs: [['Quickstart for GitHub Actions', 'https://docs.github.com/en/actions/get-started/quickstart'], ['Workflow syntax for GitHub Actions', 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax']],
      },
    ],
  });
})();
