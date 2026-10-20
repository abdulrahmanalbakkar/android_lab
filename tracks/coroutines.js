/* Coroutines track. Same shape as tracks/kotlin.js.
   Lessons (assembled from rb/coroutines/chunk_*.js) use the shared Lab.ui demos.
   The css string keeps the track's older demo styles (kt- and flw- prefixes). */
(() => {
  const css = `
.kt-cell { aspect-ratio: 1; min-width: 0; display: grid; place-items: center; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); font: 600 0.88rem var(--mono); color: var(--muted); transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.kt-cell.in { border-color: var(--accent); color: var(--ink); }
.kt-cell.skip { opacity: 0.35; }
.kt-cell.seen { background: var(--accent-soft); }
.kt-cell.at { background: var(--accent); color: var(--accent-ink); animation: pop 0.35s ease-out; }
.kt-up { font: 600 0.8rem var(--mono); color: var(--muted); }
.kt-work { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 6px; padding: 14px 10px; background: var(--bg); border-radius: 12px; min-width: 0; }
.kt-state { font: 600 0.78rem var(--mono); padding: 3px 10px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.kt-state.on { background: var(--accent-soft); color: var(--accent); }
.kt-state.warn { background: var(--warm-soft); color: var(--warm); }
.kt-state.bad { background: var(--err-soft); color: var(--err); }
.kt-state.ok { background: var(--ok-soft); color: var(--ok); }

.flw-tree { display: flex; justify-content: center; padding: 18px 6px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; overflow-x: auto; }
.flw-sub { position: relative; display: flex; flex-direction: column; align-items: center; padding: 18px 5px 0; min-width: 0; }
.flw-tree > .flw-sub { padding-top: 0; }
.flw-sub::before { content: ""; position: absolute; top: 0; left: 50%; height: 18px; border-left: 2px solid var(--line); }
.flw-sub::after { content: ""; position: absolute; top: 0; left: 0; right: 0; border-top: 2px solid var(--line); }
.flw-sub:first-child::after { left: 50%; }
.flw-sub:last-child::after { right: 50%; }
.flw-sub:only-child::after, .flw-tree > .flw-sub::before, .flw-tree > .flw-sub::after { display: none; }
.flw-kids { position: relative; display: flex; justify-content: center; padding-top: 16px; }
.flw-kids::before { content: ""; position: absolute; top: 0; left: 50%; height: 16px; border-left: 2px solid var(--line); }
.flw-node { display: grid; gap: 5px; justify-items: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--accent); background: var(--surface); width: max-content; max-width: 170px; transition: border-color 0.25s, opacity 0.25s, background 0.25s; }
.flw-src { font: 600 0.74rem/1.4 var(--mono); background: var(--code-bg); color: var(--code-ink); padding: 2px 7px; border-radius: 6px; white-space: nowrap; text-align: center; }
.flw-st { font: 600 0.72rem var(--mono); color: var(--muted); text-align: center; }
.flw-prog { display: block; width: 100%; min-width: 60px; height: 5px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.flw-prog i { display: block; height: 100%; width: 0; background: var(--accent); }
.flw-node.root .flw-prog { display: none; }
.flw-node.done { border-color: var(--ok); }
.flw-node.done .flw-st { color: var(--ok); }
.flw-node.done .flw-prog i { background: var(--ok); width: 100% !important; }
.flw-node.cancel { border-style: dashed; border-color: var(--muted); opacity: 0.55; }
.flw-node.cancel .flw-prog i { background: var(--muted); }
.flw-node.fail { border-color: var(--err); background: var(--err-soft); }
.flw-node.fail .flw-st { color: var(--err); }
.flw-node.fail .flw-prog i { background: var(--err); }
.flw-node.caught { border-color: var(--warm); background: var(--warm-soft); }
.flw-node.caught .flw-st { color: var(--warm); }
.flw-node.caught .flw-prog i { background: var(--warm); }

.flw-dtrack { height: 46px; overflow: visible; display: flex; align-items: center; gap: 8px; padding: 0 8px; }
.flw-task { position: relative; z-index: 1; display: inline-grid; gap: 4px; padding: 5px 10px; border-radius: 9px; background: var(--surface); border: 2px solid var(--ink); font: 600 0.78rem var(--mono); color: var(--ink); white-space: nowrap; }
.flw-task .flw-prog { height: 4px; }
.flw-ui { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
.flw-ui-label { font: 600 0.8rem var(--mono); color: var(--muted); }
.flw-ui-track { position: relative; flex: 1 1 120px; height: 18px; background: var(--sunk); border-radius: 99px; }
.flw-dot { position: absolute; top: 3px; left: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--ok); }
.flw-fps { font: 600 0.8rem var(--mono); color: var(--ok); font-variant-numeric: tabular-nums; }
.flw-ui.frozen { border-color: var(--err); }
.flw-ui.frozen .flw-dot { background: var(--err); }
.flw-ui.frozen .flw-fps { color: var(--err); }

.flw-badge { font: 600 0.75rem var(--mono); padding: 2px 9px; border-radius: 99px; background: var(--accent-soft); color: var(--accent); white-space: nowrap; }
.flw-cols { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-col { display: grid; grid-template-columns: 90px minmax(0, 1fr) 96px; gap: 10px; align-items: center; }
.flw-strip { display: flex; gap: 6px; align-items: center; min-height: 40px; padding: 4px 8px; border-radius: 9px; background: var(--sunk); overflow: hidden; min-width: 0; }
.flw-v { display: inline-grid; place-items: center; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); font: 600 0.8rem var(--mono); color: var(--ink); flex: none; white-space: nowrap; }
.flw-v.ok { border-color: var(--ok); color: var(--ok); }
.flw-v.acc { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.flw-v.gone { opacity: 0.5; border-style: dashed; text-decoration: line-through; }

.flw-search { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-srow { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 10px; align-items: center; }

.flw-duo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.flw-panel { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.flw-ph { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; min-height: 34px; }
.flw-note { color: var(--muted); font: 500 0.72rem var(--mono); }
.flw-note.warn { color: var(--warm); }

.flw-gps { font: 600 0.7rem var(--mono); padding: 2px 8px; border-radius: 99px; background: var(--ok-soft); color: var(--ok); }
.flw-gps.off { background: var(--sunk); color: var(--muted); }
.flw-gps.bad { background: var(--err-soft); color: var(--err); }

@media (max-width: 620px) {
  .flw-duo { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .flw-node { max-width: 96px; padding: 6px; }
  .flw-src { white-space: normal; font-size: 0.68rem; }
  .flw-st { font-size: 0.66rem; }
  .flw-prog { min-width: 0; }
  .flw-col { grid-template-columns: 64px minmax(0, 1fr); }
  .flw-srow { grid-template-columns: 56px minmax(0, 1fr); gap: 6px; }
}

.flw-shown { font: 600 0.86rem/1.5 var(--mono); padding: 8px 12px; border-radius: 9px; background: var(--ok-soft); color: var(--ok); overflow-wrap: anywhere; }
.flw-shown.stale { background: var(--err-soft); color: var(--err); }
.flw-shown.wait { background: var(--sunk); color: var(--muted); }

.flw-chan { display: grid; grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(76px, auto); gap: 10px; align-items: stretch; padding: 14px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; }
.flw-party { display: grid; gap: 6px; align-content: start; justify-items: center; padding: 8px; border-radius: 10px; background: var(--surface); border: 2px solid var(--line); min-width: 0; text-align: center; transition: border-color 0.25s; }
.flw-party > b { font: 700 0.78rem var(--mono); }
.flw-party .flw-note { overflow-wrap: anywhere; }
.flw-party.sus { border-color: var(--warm); border-style: dashed; }
.flw-hold { min-height: 34px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; justify-content: center; }
.flw-chpipe { display: flex; flex-wrap: wrap; align-items: center; align-content: center; justify-content: center; gap: 6px; padding: 8px; border-radius: 10px; background: var(--sunk); min-height: 56px; min-width: 0; }
.flw-slot { width: 36px; height: 34px; border-radius: 8px; border: 2px dashed var(--line); display: grid; place-items: center; flex: none; }
.flw-v.warn { border-color: var(--warm); color: var(--warm); background: var(--warm-soft); }
.flw-v.bad { border-color: var(--err); color: var(--err); background: var(--err-soft); }

@media (max-width: 520px) {
  .flw-chan { grid-template-columns: 74px minmax(0, 1fr) 74px; gap: 6px; padding: 10px; }
  .flw-party { padding: 6px 3px; }
  .flw-party > b { font-size: 0.7rem; }
  .flw-party .flw-note { font-size: 0.64rem; }
}
.flw-chk { position: absolute; top: 3px; bottom: 3px; width: 2px; margin-left: -1px; background: var(--ink); opacity: 0.55; z-index: 1; }
.legend .flw-chk-key { position: static; display: inline-block; width: 3px; height: 14px; margin-right: 8px; }
.flw-pool { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.flw-th { display: grid; gap: 4px; align-content: start; padding: 6px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); font: 600 0.68rem var(--mono); color: var(--muted); min-width: 0; min-height: 58px; overflow: hidden; transition: border-color 0.2s, background 0.2s; }
.flw-th b { color: var(--ink); }
.flw-th span:not(.flw-prog) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.flw-th .flw-prog { min-width: 0; }
.flw-th.cpu { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.flw-th.blk { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.flw-th.blk .flw-prog i { background: var(--err); }
.flw-wrap { flex-wrap: wrap; overflow: visible; }
/* depth 2: channels */
.flw-d2ch-flags { display: flex; flex-wrap: wrap; gap: 8px; }
.flw-chpipe.flw-d2ch-shut { outline: 2px dashed var(--warm); outline-offset: -2px; }
.flw-d2ch-lane { display: grid; grid-template-columns: 74px minmax(0, 1fr) minmax(0, 1.2fr); gap: 10px; align-items: center; min-width: 0; }
.flw-d2ch-lane .flw-prog { min-width: 0; }
.flw-shown .flw-v { margin-left: 6px; vertical-align: middle; }
@media (max-width: 520px) {
  .flw-d2ch-lane { grid-template-columns: 64px minmax(0, 1fr); gap: 6px; }
  .flw-d2ch-lane .flw-strip { grid-column: 2; }
}
`;

  Lab.addTrack({
    id: 'coroutines',
    title: 'Coroutines',
    description: 'Keep the app responsive during slow work: start coroutines, run things at the same time, pick the thread, cancel, handle errors, share values safely and pass values through channels.',
    group: 'Building apps', requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'why-async',
        title: 'Why apps must not wait',
        tagline: 'One thread draws the screen. Make it wait, and the whole app freezes.',
        goals: ['Say what the main thread of an app does', 'Explain why a long wait on the main thread freezes the screen', 'Recognise an ANR and what causes it'],
        level: 'beginner', introduces: ['Thread', 'sleep'],
        body: `
<p>The water tracker gets a <b>Sync</b> button. It sends today’s glasses to a <em>server</em>, a computer on the internet that keeps a copy, and the answer takes about 3 seconds to come back. Lin taps Sync, then taps <b>+1</b>, and nothing happens. The buttons don’t press, the screen doesn’t move. For 3 seconds the app looks broken.</p>
<p>A <em>thread</em> is one line of steps the phone works through, one step at a time. Every app gets one called the <em>main thread</em>. It does all the screen work: it draws the screen many times a second, and it runs the code for every tap, such as an <code>onClick</code>. Because it does one thing at a time, each job on it has to be quick.</p>
<p>Here <code>Thread.sleep(3000)</code> stands in for the slow server: it makes the thread it runs on stop for 3000 milliseconds. That is called <em>blocking</em>: the thread is stuck and can do nothing else. On the main thread it means no drawing and no taps; they wait in line until the thread is free. If the main thread doesn’t respond to a tap for 5 seconds, Android shows a dialog saying the app isn’t responding and offers to close it. That is an <em>ANR</em>, short for “Application Not Responding”.</p>
<p>You have already seen a way out. In the compose track, <code>delay</code> inside <code>LaunchedEffect</code> waited a whole hour, and the screen kept working. That wait happened in a coroutine. This track is about coroutines: work that can wait without holding up its thread.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['main thread'],
            span: 6,
            unit: 's',
            predict: {
              q: 'Lin taps Sync, which runs <code>Thread.sleep(3000)</code> on the main thread. One second later she taps <b>+1</b>. When does the count go up?',
              options: ['At once', 'When the sleep ends, 2 seconds later', 'Never: the tap is lost'],
              a: 1,
              why: 'The main thread does one job at a time. The tap waits in line until the sleep is over, and then it runs.',
            },
            frames: [
              { now: 0, say: 'Time runs left to right. The row is the main thread, and each bar is a job it is doing.' },
              { bars: [{ lane: 0, from: 0, to: 1.2, label: 'draw', tone: 'ok' }], say: 'Normally the main thread draws the screen again and again. Each drawing is short, so the app feels smooth.' },
              { bars: [{ lane: 0, from: 1.2, to: 4.2, label: 'sleep(3000)', tone: 'err' }], marks: [{ at: 1.2, label: 'Sync', tone: 'accent' }], now: 1.2, say: 'Lin taps Sync. Its <code>onClick</code> runs <code>Thread.sleep(3000)</code> on the main thread, and the thread stops.' },
              { marks: [{ at: 2.2, label: '+1', tone: 'warm' }], now: 2.2, say: 'A second later she taps <b>+1</b>. The main thread is asleep, so the tap waits in line, and the screen isn’t drawn again. The app is frozen.' },
              { bars: [{ lane: 0, from: 4.2, to: 4.8, label: '+1', tone: 'accent' }], now: 4.8, say: 'Three seconds after the tap on Sync, the sleep is over. Only now does the waiting tap run, and the count goes up.' },
              { bars: [{ lane: 0, from: 4.8, to: 6, label: 'draw', tone: 'ok' }], say: 'Drawing starts again. Had that tap waited more than 5 seconds, Android would have shown the “isn’t responding” dialog: an ANR.' },
            ],
          });
        },
        code: `@Composable
fun SyncButton() {
    var synced by remember { mutableStateOf(false) }
    Button(onClick = {
        Thread.sleep(3000)   // the main thread stops for 3 seconds: the whole app freezes
        synced = true
    }) {
        Text(if (synced) "Synced" else "Sync")
    }
}`,
        play: `fun main() {
    println("Tap: Sync")
    Thread.sleep(3000)          // this thread stops here for 3 seconds
    println("Sync finished")
    println("Tap: Add glass")   // this tap had to wait its turn
    // Change 3000 to 6000 and run again: everything after it waits longer.
}`,
        remember: 'The main thread draws the screen and runs every tap, one job at a time. Never make it wait.',
        terms: [
          { term: 'thread', def: 'One line of steps that the phone works through, one step at a time.' },
          { term: 'main thread', def: 'The thread that draws an app’s screen and runs the code for taps.' },
          { term: 'blocking', def: 'Making a thread stop and wait, so it can do nothing else meanwhile. <code>Thread.sleep(3000)</code> blocks for 3 seconds.' },
          { term: 'ANR', def: '“Application Not Responding”: Android’s dialog when the main thread hasn’t responded to a tap for 5 seconds.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hide the tip after 5 seconds without freezing the screen.', code: `[[LaunchedEffect]](Unit) {
    [[delay]](5000)
    visible = false
}`, why: '<code>delay</code> waits inside a coroutine and leaves the main thread free. <code>Thread.sleep(5000)</code> would freeze the screen for 5 seconds.' },
          { type: 'bug', prompt: 'The reminder works, but the app freezes as soon as the water screen opens. Tap the line to change.', code: `LaunchedEffect(glasses) {
    showReminder = false
    Thread.sleep(3600000)
    showReminder = true
}`, bug: 2, fix: '    delay(3600000)', why: 'The block of <code>LaunchedEffect</code> runs on the main thread. <code>Thread.sleep</code> blocks that thread for an hour; <code>delay</code> waits without blocking it.' },
        ],
        quiz: [
          { q: 'What does the main thread of an app do?', options: ['Draws the screen and runs the code for taps', 'Only talks to servers', 'Nothing while the app is open'], a: 0, why: 'All screen work happens on the main thread, one job at a time.' },
          { q: 'The main thread is stuck in a long job and hasn’t responded to a tap for 5 seconds. What does Android do?', options: ['Shows a dialog saying the app isn’t responding', 'Runs the tap on another thread', 'Nothing'], a: 0, why: 'That dialog is an ANR. The user can close the app from it.' },
          { q: 'What is the difference between <code>Thread.sleep(1000)</code> and <code>delay(1000)</code> inside <code>LaunchedEffect</code>?', options: ['<code>sleep</code> stops the whole thread; <code>delay</code> waits without holding the thread up', 'None', '<code>delay</code> waits 1000 seconds'], a: 0, why: 'Both wait 1 second, but only <code>delay</code> leaves the main thread free to draw and handle taps.' },
        ],
        docs: [['ANRs', 'https://developer.android.com/topic/performance/vitals/anr'], ['Kotlin coroutines on Android', 'https://developer.android.com/kotlin/coroutines']],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'basics',
        title: 'Your first coroutine',
        tagline: 'Start work that waits, while the rest of the program keeps going.',
        goals: ['Write a <code>suspend</code> function that waits with <code>delay</code>', 'Start a coroutine with <code>launch</code>', 'Predict the order in which lines print'],
        level: 'beginner', introduces: ['launch', 'runBlocking', 'kotlinx', 'coroutines'],
        body: `
<p>The frozen Sync button needs a different kind of waiting: send the glasses, and keep the app working while the answer is on its way. You can try that in a small Kotlin program first, with no phone involved.</p>
<p>A <em>coroutine</em> is a piece of work that can pause in the middle and carry on later. While it is paused, its thread is free to do other things. <code>delay(3000)</code> pauses the coroutine for 3 seconds; unlike <code>Thread.sleep</code>, it doesn’t stop the thread. A function that may pause is marked <code>suspend</code>: <code>suspend fun sync(glasses: Int) { ... }</code>. It can be called only from a coroutine or from another <code>suspend</code> function, the same rule as for <code>delay</code>.</p>
<p><code>launch { ... }</code> starts a new coroutine that runs the block, and returns at once: the lines after it keep running. The new coroutine gets its turn as soon as the thread is free, for example when the code that launched it reaches a <code>delay</code>. Many coroutines can share one thread this way, taking turns each time one of them pauses.</p>
<p>To try it, write <code>fun main() = runBlocking { ... }</code>. <code>runBlocking</code> keeps <code>main()</code> running until the coroutines inside finish; fine in small programs, never in an app (there, <code>LaunchedEffect</code> gives you the coroutine). The first line, <code>import kotlinx.coroutines.*</code>, brings in <code>launch</code>, <code>delay</code> and <code>runBlocking</code>; the <code>*</code> means “everything in it”.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['main', 'sync'],
            span: 4,
            unit: 's',
            predict: {
              q: '<code>main</code> runs <code>launch { sync(5) }</code>, then <code>println("Screen still works")</code>. <code>sync</code> starts by printing <code>Sending 5 glasses...</code>. Which line prints first?',
              options: ['<code>Screen still works</code>', '<code>Sending 5 glasses...</code>', '<code>Synced</code>'],
              a: 0,
              why: '<code>launch</code> only starts the coroutine and returns. <code>main</code> carries on and prints first; the new coroutine gets its turn when <code>main</code> pauses.',
            },
            frames: [
              { now: 0, say: 'The program from the code below. Each row is a coroutine. Both rows share one thread and take turns.' },
              { now: 0, say: '<code>launch</code> starts the sync coroutine and returns right away, so <code>main</code> keeps going. Output: <code>Screen still works</code>.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'wait', tone: 'muted' }], now: 0, say: '<code>main</code> reaches <code>delay(1000)</code> and pauses. The thread is free, so the sync coroutine gets its turn.' },
              { bars: [{ lane: 1, from: 0, to: 3, label: 'delay(3000)', tone: 'warm' }], now: 0, say: 'Output: <code>Sending 5 glasses...</code>. Then it pauses at <code>delay(3000)</code>. Both coroutines are waiting, and the thread has nothing to do.' },
              { marks: [{ at: 1, label: 'Tap', tone: 'ok' }], now: 1, say: 'At 1 s, <code>main</code>’s delay is over and it carries on. Output: <code>Tap: Add glass</code>. The tap was handled while the sync was still waiting.' },
              { marks: [{ at: 3, label: 'Synced', tone: 'ok' }], now: 3, say: 'At 3 s the sync coroutine carries on. Output: <code>Synced</code>. No coroutine is left, so <code>runBlocking</code> lets <code>main()</code> end.' },
            ],
          });
        },
        code: `import kotlinx.coroutines.*

suspend fun sync(glasses: Int) {
    println("Sending $glasses glasses...")
    delay(3000)                 // pretend the server takes 3 seconds
    println("Synced")
}

fun main() = runBlocking {
    launch { sync(5) }          // starts a coroutine and returns at once
    println("Screen still works")
    delay(1000)
    println("Tap: Add glass")
}
// Screen still works
// Sending 5 glasses...
// Tap: Add glass
// Synced`,
        play: `import kotlinx.coroutines.*

suspend fun boilKettle() {
    delay(2000)             // pauses this coroutine, not the thread
    println("Kettle boiled")
}

fun main() = runBlocking {
    launch { boilKettle() }
    println("Toast in")
    delay(1000)
    println("Toast done")
    // Change delay(1000) to delay(3000). Which line prints last now?
}`,
        remember: 'suspend fun can pause; delay pauses the coroutine, not the thread; launch { } starts a new coroutine and returns at once.',
        mistakes: [
          { title: 'Calling a suspend function from a normal one', bad: `fun main() {
    sync(5)
}
// error: Suspend function 'suspend fun sync(glasses: Int): Unit'
// can only be called from a coroutine or another suspend function.`, good: `fun main() = runBlocking {
    sync(5)
}`, why: 'A <code>suspend</code> function may pause, and only a coroutine can pause. <code>runBlocking</code> gives <code>main</code> one to run in.' },
        ],
        terms: [
          { term: 'coroutine', def: 'A piece of work that can pause and carry on later, leaving its thread free while it waits.' },
          { term: 'suspend', def: 'Marks a function that may pause, like <code>suspend fun sync()</code>. It can only be called from a coroutine or another <code>suspend</code> function.' },
          { term: 'launch', def: '<code>launch { ... }</code> starts a new coroutine that runs the block, and returns at once.' },
          { term: 'runBlocking', def: 'Keeps <code>main()</code> running until the coroutines inside finish. Fine in small programs, never in an app.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>brew</code> a function that can pause, and run it in a new coroutine.', code: `[[suspend]] fun brew() {
    delay(1000)
    println("Tea ready")
}

fun main() = runBlocking {
    [[launch]] { brew() }
    println("Waiting for tea")
}`, why: '<code>suspend</code> lets <code>brew</code> call <code>delay</code>. <code>launch</code> starts it as a new coroutine, so <code>Waiting for tea</code> prints first.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the line to fix.', code: `fun countDown() {
    println("3")
    delay(1000)
    println("Go")
}`, bug: 0, fix: 'suspend fun countDown() {', why: '<code>delay</code> can pause, so the function that calls it must be a <code>suspend</code> function.' },
        ],
        quiz: [
          { q: 'What does <code>delay(1000)</code> do in a coroutine?', options: ['Pauses the coroutine for 1 second, leaving the thread free', 'Stops the whole thread for 1 second', 'Waits 1000 seconds'], a: 0, why: 'The coroutine waits; meanwhile the thread can run other coroutines.' },
          { q: 'Inside <code>runBlocking</code>: <code>launch { println("A") }</code>, then <code>println("B")</code>. What prints first?', options: ['<code>B</code>', '<code>A</code>', 'Either, at random'], a: 0, why: '<code>launch</code> returns at once, so <code>B</code> prints. The new coroutine runs when the thread is free. Every time.' },
          { q: 'Where can you call a <code>suspend</code> function?', options: ['In a coroutine or in another <code>suspend</code> function', 'Anywhere', 'Only in <code>main</code>'], a: 0, why: 'Only a coroutine can pause, so a function that may pause needs one around it.' },
        ],
        docs: [['Coroutines basics', 'https://kotlinlang.org/docs/coroutines-basics.html']],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'structured',
        title: 'Structured concurrency',
        tagline: 'Every coroutine has a parent, and a parent waits for its children.',
        goals: ['Explain what a scope is and how parents and children relate', 'Wait for several coroutines with <code>coroutineScope</code>', 'Start a coroutine from a button with <code>rememberCoroutineScope</code>'],
        level: 'beginner', introduces: ['coroutineScope', 'rememberCoroutineScope'],
        body: `
<p>Sync now sends two things: today’s glasses and the daily goal. “Synced” should show only when both have arrived, and if Lin leaves the screen, both should stop. Coroutines keep track of this by forming a family.</p>
<p>A <em>scope</em> is the owner that coroutines are started in. <code>launch</code> always needs one: inside <code>runBlocking { }</code> the block is a scope, which is why <code>launch</code> works there. A coroutine started inside another one is its <em>child</em>, and the outer one is its <em>parent</em>. A parent is finished only when all its children are finished, and when a parent is stopped, its children stop with it. No coroutine runs without a parent watching it: that rule is called <em>structured concurrency</em>.</p>
<p>Inside a <code>suspend</code> function, <code>coroutineScope { ... }</code> makes a new scope. You can launch children in it, and the call returns only once every child has finished. So <code>syncAll()</code> below comes back when both parts are sent, and the line after it can safely say “All done”.</p>
<p>A button’s <code>onClick</code> is not a coroutine, so it can’t call a <code>suspend</code> function, and on its own it has no scope for <code>launch</code>. In Compose, <code>val scope = rememberCoroutineScope()</code> gives you a scope that belongs to the screen, and <code>scope.launch { ... }</code> in <code>onClick</code> starts a coroutine in it. When the screen leaves, the scope is stopped, and its coroutines with it, as with <code>LaunchedEffect</code>.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 270,
            nodes: [
              { id: 'rb', label: '<code>runBlocking</code>', x: 50, y: 12 },
              { id: 'sa', label: '<code>coroutineScope</code><br>in <code>syncAll()</code>', x: 50, y: 46, hidden: true },
              { id: 'go', label: '<code>launch</code>: goal<br>2 s', x: 22, y: 84, hidden: true },
              { id: 'gl', label: '<code>launch</code>: glasses<br>1 s', x: 78, y: 84, hidden: true },
            ],
            predict: {
              q: '<code>syncAll()</code> launches two children in <code>coroutineScope</code>: one takes 1 s, the other 2 s. When does <code>main</code> print <code>All done</code>?',
              options: ['At once', 'After 1 s', 'After 2 s'],
              a: 2,
              why: '<code>coroutineScope</code> returns only when every child has finished, and the slower one takes 2 s.',
            },
            frames: [
              { say: 'The program from Run it. <code>runBlocking</code> is the top of the family.' },
              { show: ['sa'], add: [['rb', 'sa', 'child', 'accent']], say: '<code>main</code> calls <code>syncAll()</code>. Its <code>coroutineScope</code> makes a new scope, a child of <code>runBlocking</code>.' },
              { show: ['go', 'gl'], add: [['sa', 'go', '', 'accent'], ['sa', 'gl', '', 'accent']], say: 'Two <code>launch</code> calls: two children. Launching doesn’t wait, so the block reaches its end at once. Output: <code>Both started</code>.' },
              { gone: ['gl'], hl: ['sa'], say: 'At 1 s: <code>Glasses synced</code>. That child is finished. The block is done too, but one child is still running, so the scope keeps waiting.' },
              { gone: ['go'], hl: ['sa'], say: 'At 2 s: <code>Goal synced</code>. Every child is finished, so <code>coroutineScope</code> returns.' },
              { gone: ['sa'], hl: ['rb'], say: 'Back in <code>main</code>: <code>All done</code>. It could only print after both children.' },
            ],
          });
        },
        code: `@Composable
fun SyncButton(glasses: Int) {
    val scope = rememberCoroutineScope()        // belongs to this screen
    var status by remember { mutableStateOf("Not synced") }
    Column {
        Text(status)
        Button(onClick = {
            scope.launch {                      // a new coroutine in the screen's scope
                status = "Syncing..."
                syncAll(glasses)                // comes back when both parts are sent
                status = "Synced"
            }
        }) {
            Text("Sync")
        }
    }
}

suspend fun syncAll(glasses: Int) {
    coroutineScope {
        launch { sendGlasses(glasses) }         // child 1
        launch { sendGoal() }                   // child 2
    }                                           // waits here for both
}

suspend fun sendGlasses(glasses: Int) {
    delay(1000)                                 // pretend the server takes 1 second
}

suspend fun sendGoal() {
    delay(2000)
}`,
        play: `import kotlinx.coroutines.*

suspend fun syncAll() {
    coroutineScope {
        launch {
            delay(2000)
            println("Goal synced")
        }
        launch {
            delay(1000)
            println("Glasses synced")
        }
        println("Both started")
    }
}

fun main() = runBlocking {
    syncAll()
    println("All done")     // waits for both children
    // Change delay(2000) to delay(4000). When does "All done" print now?
}`,
        remember: 'Coroutines live in a scope. A parent waits for its children, and stopping it stops them. coroutineScope { } returns when all its children are done.',
        mistakes: [
          { title: 'launch with no scope', bad: `fun onSyncClick() {
    launch { syncAll() }
}
// error: Unresolved reference 'launch'.`, good: `val scope = rememberCoroutineScope()
Button(onClick = { scope.launch { syncAll() } }) {
    Text("Sync")
}`, why: '<code>launch</code> has to be called on a scope. In a composable, <code>rememberCoroutineScope()</code> gives you one.' },
        ],
        terms: [
          { term: 'scope', def: 'The owner that coroutines are started in. It waits for them, and stopping it stops them.' },
          { term: 'structured concurrency', def: 'Every coroutine has a parent: a parent waits for its children, and stopping a parent stops its children.' },
          { term: 'coroutineScope', def: '<code>coroutineScope { ... }</code> makes a new scope inside a <code>suspend</code> function and returns when all its children have finished.' },
          { term: 'rememberCoroutineScope', def: 'In a composable, gives a scope that belongs to the screen, for starting coroutines from <code>onClick</code>. It is stopped when the screen leaves.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Wait for both downloads before printing “Ready”.', code: `suspend fun downloadAll() {
    [[coroutineScope]] {
        launch { downloadMaps() }
        launch { downloadPhotos() }
    }
    println("Ready")
}`, why: '<code>coroutineScope</code> returns only when both children are finished, so “Ready” comes last.' },
          { type: 'bug', prompt: 'This won’t compile: <code>onClick</code> is not a coroutine. Tap the line to fix.', code: `val scope = rememberCoroutineScope()
Button(onClick = {
    syncAll(glasses)
}) {
    Text("Sync")
}`, bug: 2, fix: '    scope.launch { syncAll(glasses) }', why: '<code>syncAll</code> is a <code>suspend</code> function. <code>scope.launch</code> starts a coroutine to run it in.' },
        ],
        quiz: [
          { q: 'A parent coroutine is stopped. What happens to its children?', options: ['They are stopped too', 'They keep running on their own', 'They start again'], a: 0, why: 'Children belong to their parent. That is what keeps work from running on after nobody needs it.' },
          { q: 'The block of <code>coroutineScope { }</code> has reached its end, but one child is still running. What happens?', options: ['It waits for the child, then returns', 'It returns at once', 'It stops the child'], a: 0, why: 'A scope is finished only when all its children are.' },
          { q: 'Why does a Sync button need <code>rememberCoroutineScope</code>?', options: ['<code>onClick</code> is not a coroutine; the scope lets it start one that stops when the screen leaves', 'It makes the button faster', 'Buttons can only call <code>suspend</code> functions'], a: 0, why: '<code>scope.launch</code> starts the coroutine, and the scope belongs to the screen.' },
        ],
        docs: [['Coroutines basics', 'https://kotlinlang.org/docs/coroutines-basics.html'], ['Side-effects in Compose', 'https://developer.android.com/develop/ui/compose/side-effects']],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'async',
        title: 'Doing things at the same time',
        tagline: 'Start two jobs together and wait for both answers.',
        goals: ['Start work that gives back a result with <code>async</code>', 'Get the result with <code>await</code>', 'Explain why two waits at once take half the time'],
        level: 'beginner', introduces: ['async', 'await', 'Deferred', 'currentTimeMillis'],
        body: `
<p>When the water screen opens, it needs two answers from the server: how many glasses Lin had today, and her daily goal. Each takes 1 second. Asked one after the other, the screen waits 2 seconds. But nothing stops both questions from being on their way at once.</p>
<p><code>launch</code> starts a coroutine but gives nothing back. <code>async { ... }</code> starts one too, and promises a result: it returns a <code>Deferred</code>, a box that will hold the block’s last value once it is ready. <code>val goal = async { loadGoal() }</code> starts loading and moves on at once.</p>
<p><code>goal.await()</code> takes the value out. If it is ready, you get it straight away; if not, the coroutine pauses until it is. Start every <code>async</code> first, and only then <code>await</code>: both waits overlap, and the total is about 1 second instead of 2.</p>
<p>To measure it, <code>System.currentTimeMillis()</code> gives the current time in milliseconds. Take it at the start, take it again at the end, and the difference is how long the work took.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['glasses', 'goal', 'glasses (async)', 'goal (async)'],
            span: 2,
            unit: 's',
            predict: {
              q: 'Two loads of 1 second each. Both are started with <code>async</code> before either <code>await</code>. About how long until both results are in?',
              options: ['1 second', '2 seconds', 'No time at all'],
              a: 0,
              why: 'Both start at once and wait at the same time, so the waits overlap.',
            },
            frames: [
              { now: 0, say: 'Two loads, 1 second each. The top two rows: one after the other. The bottom two: with <code>async</code>.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'loadGlasses()' }], now: 1, say: '<code>val glasses = loadGlasses()</code>. The coroutine pauses until the answer comes back.' },
              { bars: [{ lane: 1, from: 1, to: 2, label: 'loadGoal()' }], now: 2, say: 'Only then does <code>loadGoal()</code> start. Output: <code>Took 2 s</code>.' },
              { bars: [{ lane: 2, from: 0, to: 1, label: 'async', tone: 'ok' }, { lane: 3, from: 0, to: 1, label: 'async', tone: 'ok' }], now: 0, say: 'Now with <code>async</code>. Both calls return a <code>Deferred</code> at once, so both loads are on their way at 0 s.' },
              { marks: [{ at: 1, label: 'await', tone: 'ok' }], now: 1, say: '<code>glasses.await()</code> pauses until 1 s. By then the goal is ready too, so <code>goal.await()</code> answers straight away. Output: <code>5 of 8 glasses</code>, <code>Took 1 s</code>.' },
            ],
          });
        },
        code: `import kotlinx.coroutines.*

suspend fun loadGlasses(): Int {
    delay(1000)        // pretend the server takes 1 second
    return 5
}

suspend fun loadGoal(): Int {
    delay(1000)
    return 8
}

fun main() = runBlocking {
    val start = System.currentTimeMillis()
    val glasses = async { loadGlasses() }      // both start now
    val goal = async { loadGoal() }
    println("\${glasses.await()} of \${goal.await()} glasses")   // 5 of 8 glasses
    val seconds = (System.currentTimeMillis() - start) / 1000
    println("Took $seconds s")                // Took 1 s
}`,
        play: `import kotlinx.coroutines.*

suspend fun loadGlasses(): Int {
    delay(1000)
    return 5
}

suspend fun loadGoal(): Int {
    delay(1000)
    return 8
}

fun main() = runBlocking {
    val start = System.currentTimeMillis()
    val glasses = loadGlasses()       // one after the other
    val goal = loadGoal()
    println("$glasses of $goal glasses")
    val seconds = (System.currentTimeMillis() - start) / 1000
    println("Took $seconds s")
    // Prints "Took 2 s". Use async { } and await() to make it 1 s.
}`,
        remember: 'async { } starts work and returns a Deferred; await() gives the result, pausing until it is ready. Start them all, then await.',
        mistakes: [
          { title: 'Awaiting straight away', bad: `val glasses = async { loadGlasses() }.await()
val goal = async { loadGoal() }.await()
// 2 seconds: the second load starts after the first ends`, good: `val glasses = async { loadGlasses() }
val goal = async { loadGoal() }
println("\${glasses.await()} of \${goal.await()}")
// 1 second: both loads run at once`, why: '<code>await()</code> right after <code>async</code> waits for that load before the next one even starts. Start both first.' },
        ],
        terms: [
          { term: 'async', def: '<code>async { ... }</code> starts a coroutine and returns a <code>Deferred</code> that will hold the block’s result.' },
          { term: 'Deferred', def: 'The box <code>async</code> gives back. It holds the result once the work is done.' },
          { term: 'await', def: '<code>deferred.await()</code> gives the result, pausing the coroutine until it is ready.' },
          { term: 'System.currentTimeMillis', def: '<code>System.currentTimeMillis()</code> gives the current time in milliseconds, handy for measuring how long something took.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Load the weather and the news at the same time, then print both.', code: `val weather = [[async]] { loadWeather() }
val news = async { loadNews() }
println(weather.[[await]]())
println(news.await())`, why: 'Both <code>async</code> calls start before any <code>await</code>, so the two loads overlap.' },
          { type: 'bug', prompt: 'This prints <code>DeferredCoroutine{Active}@3cb5cdba of 8 glasses</code> instead of <code>5 of 8 glasses</code>. Tap the line to fix.', code: `val glasses = async { loadGlasses() }
val goal = async { loadGoal() }
println("\${glasses} of \${goal.await()} glasses")`, bug: 2, fix: 'println("${glasses.await()} of ${goal.await()} glasses")', why: '<code>glasses</code> is the <code>Deferred</code> box, not the number. <code>await()</code> takes the number out.' },
        ],
        quiz: [
          { q: 'What does <code>async { loadGoal() }</code> give back?', options: ['A <code>Deferred</code>: a box that will hold the result', 'The goal, right away', 'Nothing'], a: 0, why: 'It returns at once with the box; the result goes in when the load is done.' },
          { q: 'What happens at <code>goal.await()</code> when the goal hasn’t arrived yet?', options: ['The coroutine pauses until it has', 'It gives back 0', 'The program crashes'], a: 0, why: '<code>await</code> is a <code>suspend</code> function: it pauses until the value is ready.' },
          { q: 'Two loads take 1 second each. Which order of lines takes about 1 second?', options: ['async, async, then await, await', 'async, await, then async, await'], a: 0, why: 'Starting both before awaiting lets the two waits overlap.' },
        ],
        docs: [['Composing suspending functions', 'https://kotlinlang.org/docs/composing-suspending-functions.html']],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'dispatchers',
        title: 'Which thread runs it',
        tagline: 'Send heavy work to a background thread, then come back with the result.',
        goals: ['Name <code>Dispatchers.Main</code>, <code>IO</code> and <code>Default</code> and what each is for', 'Move work off the main thread with <code>withContext</code>', 'Explain why <code>suspend</code> alone doesn’t move work to another thread'],
        level: 'beginner', introduces: ['Dispatchers', 'IO', 'Default', 'withContext', 'currentThread'],
        body: `
<p>Lin wants statistics over every drink she has ever logged: hundreds of thousands of entries, sorted and added up. Work on that much data keeps a thread busy for a noticeable time, and unlike <code>delay</code> it can’t pause; it holds the thread until it is done. A coroutine started by <code>LaunchedEffect</code> or <code>rememberCoroutineScope</code> runs on the main thread, so that work would freeze the screen just like <code>Thread.sleep</code>. Marking the function <code>suspend</code> doesn’t change this: it still runs on the thread that called it.</p>
<p>A <em>dispatcher</em> decides which thread runs a coroutine. <code>Dispatchers.Main</code> is the main thread, for screen work (it exists only in apps). <code>Dispatchers.IO</code> is a group of background threads for work that waits on files or the network (IO means “input and output”). <code>Dispatchers.Default</code> is a group of background threads for heavy calculations, like adding up or sorting a long list.</p>
<p><code>withContext(Dispatchers.Default) { ... }</code> runs its block on that dispatcher and pauses the calling coroutine meanwhile. It gives back the block’s last value, and the coroutine then carries on where it was, on its own thread again. A good habit: put the <code>withContext</code> inside the slow <code>suspend</code> function itself, so it is safe to call from the main thread.</p>
<p>You can also give the dispatcher to <code>launch</code>: <code>launch(Dispatchers.Default) { ... }</code> runs that whole new coroutine on a background thread.</p>
<p>To see which thread runs a line, print <code>Thread.currentThread().name</code>: in a Kotlin program the first thread is called <code>main</code>.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['main thread', 'Default'],
            span: 7,
            unit: 's',
            predict: {
              q: 'A coroutine on the main thread runs <code>withContext(Dispatchers.Default) { ... }</code>. When the block is done, which thread runs the next line?',
              options: ['The main thread again', 'The Default thread', 'A new thread'],
              a: 0,
              why: '<code>withContext</code> only moves its own block. Afterwards the coroutine carries on on the thread it came from.',
            },
            frames: [
              { now: 0, say: 'The all-time total, in a <code>LaunchedEffect</code> on the main thread. Bar lengths show the idea, not exact times.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'start' }], say: 'The coroutine starts on the main thread.' },
              { bars: [{ lane: 1, from: 1, to: 5.5, label: 'history.sum()', tone: 'warm' }], now: 1, say: '<code>withContext(Dispatchers.Default)</code> hands its block to a background thread, and the coroutine pauses.' },
              { bars: [{ lane: 0, from: 1, to: 5.5, label: 'draw, taps', tone: 'ok' }], now: 3, say: 'Meanwhile the main thread is free: it keeps drawing and handling taps. No freeze.' },
              { bars: [{ lane: 0, from: 5.5, to: 7, label: 'total' }], now: 5.5, say: 'The block’s last value comes back. The coroutine carries on on the main thread, where it can safely change the screen’s state.' },
            ],
          });
        },
        code: `suspend fun allTimeTotal(history: List<Int>): Int {
    return withContext(Dispatchers.Default) {   // heavy work on a background thread
        history.sum()                           // pretend this list is huge
    }                                           // back on the caller's thread
}

@Composable
fun YearTotal(history: List<Int>) {
    var total by remember { mutableStateOf(0) }
    LaunchedEffect(history) {      // runs on the main thread
        total = allTimeTotal(history) // the main thread stays free meanwhile
    }
    Text("All time: $total glasses")
}`,
        play: `import kotlinx.coroutines.*

fun countTo(n: Int): Int {
    var total = 0
    for (i in 1..n) {
        total += i
    }
    return total
}

fun main() = runBlocking {
    println("Start on \${Thread.currentThread().name}")
    val sum = withContext(Dispatchers.Default) {
        println("Counting on \${Thread.currentThread().name}")
        countTo(1000)
    }
    println("Back on \${Thread.currentThread().name}: $sum")
}
// Start on main
// Counting on DefaultDispatcher-worker-1   (the number can change from run to run)
// Back on main: 500500`,
        remember: 'A dispatcher picks the thread: Main for the screen, IO for files and network, Default for heavy work. withContext(...) { } runs a block there and comes back; launch(Dispatchers.Default) { } starts a whole coroutine there.',
        mistakes: [
          { title: 'Thinking suspend moves the work', bad: `suspend fun allTimeTotal(history: List<Int>): Int {
    return history.sum()   // still on the caller's thread: the main thread
}`, good: `suspend fun allTimeTotal(history: List<Int>): Int {
    return withContext(Dispatchers.Default) {
        history.sum()
    }
}`, why: '<code>suspend</code> only means “may pause”. To run on another thread, the function has to say so with <code>withContext</code>.' },
        ],
        terms: [
          { term: 'dispatcher', def: 'Decides which thread runs a coroutine. <code>Dispatchers.Main</code> is the main thread of an app.' },
          { term: 'Dispatchers.IO', def: 'Background threads for work that waits on files or the network.' },
          { term: 'Dispatchers.Default', def: 'Background threads for heavy calculations, such as adding up or sorting a long list.' },
          { term: 'withContext', def: '<code>withContext(dispatcher) { ... }</code> runs the block on that dispatcher, then gives back its last value on the original thread.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Sort a long history on a thread meant for heavy calculations.', code: `suspend fun sortHistory(days: List<Int>): List<Int> {
    return [[withContext]](Dispatchers.[[Default]]) {
        days.sortedBy { it }
    }
}`, why: 'Sorting keeps a thread busy, so it belongs on <code>Dispatchers.Default</code>, not the main thread.' },
          { type: 'bug', prompt: 'Reading the file still freezes the screen. Tap the line to fix.', code: `suspend fun loadNotes(): List<String> {
    return withContext(Dispatchers.Main) {
        File("notes.txt").readLines()
    }
}`, bug: 1, fix: '    return withContext(Dispatchers.IO) {', why: 'Reading a file waits on the disk. <code>Dispatchers.IO</code> does that on a background thread; <code>Main</code> is the very thread that draws the screen.' },
        ],
        quiz: [
          { q: 'Which dispatcher fits reading a file?', options: ['<code>Dispatchers.IO</code>', '<code>Dispatchers.Main</code>', '<code>Dispatchers.Default</code>'], a: 0, why: 'IO is for work that waits on files or the network.' },
          { q: 'A <code>suspend</code> function adds up a huge list, with no <code>withContext</code>. It is called from <code>LaunchedEffect</code>. Which thread does the adding?', options: ['The main thread', 'A background thread', 'No thread at all'], a: 0, why: '<code>suspend</code> doesn’t switch threads. The work runs where the caller is: the main thread.' },
          { q: 'After <code>withContext(Dispatchers.Default) { ... }</code> finishes, where does the coroutine carry on?', options: ['On the thread it was on before', 'On a Default thread from then on'], a: 0, why: 'Only the block moves. The rest of the coroutine stays where it was.' },
        ],
        docs: [['Improve app performance with Kotlin coroutines', 'https://developer.android.com/kotlin/coroutines/coroutines-adv'], ['Coroutine context and dispatchers', 'https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html']],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'cancellation',
        title: 'Cancelling work',
        tagline: 'Stop a coroutine you no longer need, or one that takes too long.',
        goals: ['Stop a coroutine with its <code>Job</code> and <code>cancel()</code>', 'Make a busy loop stop when cancelled with <code>ensureActive()</code>', 'Give up on slow work with <code>withTimeoutOrNull</code>'],
        level: 'beginner', introduces: ['Job', 'CancellationException', 'ensureActive', 'withTimeoutOrNull'],
        body: `
<p>Sync sends a long history in parts. On a slow connection Lin taps <b>Cancel</b>. The sending should stop now, not quietly finish in the background.</p>
<p><code>launch</code> gives back a <code>Job</code>, a handle to the coroutine it started: <code>val job = launch { ... }</code>. <code>job.cancel()</code> asks it to stop. A cancelled coroutine stops the next time it reaches a <code>suspend</code> call such as <code>delay</code>: instead of returning, the call throws a special exception, a <code>CancellationException</code>, so the rest of the block is skipped (any <code>finally</code> still runs). This is also what happens to a <code>LaunchedEffect</code> coroutine when its screen leaves.</p>
<p>Cancelling is <em>cooperative</em>: the coroutine has to reach a point where it checks. A loop that never calls a <code>suspend</code> function, such as one that uses <code>Thread.sleep</code> or does a long calculation, never checks, and keeps going. Put <code>ensureActive()</code> in the loop: it stops the coroutine right there if it has been cancelled.</p>
<p>For “stop if it takes too long”, <code>withTimeoutOrNull(1000) { ... }</code> runs the block and cancels it if it isn’t done after 1000 milliseconds. Then it gives back <code>null</code>; otherwise you get the block’s last value.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['job', 'main'],
            span: 2.4,
            unit: 's',
            predict: {
              q: '<code>job.cancel()</code> is called at 1.2 s, while the job waits in <code>delay(500)</code> before part 4. What does the job print next?',
              options: ['Nothing more', '<code>Sending part 4</code>', '<code>All parts sent</code>'],
              a: 0,
              why: 'The cancelled <code>delay</code> throws instead of returning, so the rest of the block is skipped.',
            },
            frames: [
              { bars: [{ lane: 1, from: 0, to: 1.2, label: 'delay(1200)', tone: 'muted' }], now: 0, say: 'The program from the code below. The job sends 5 parts, one every 0.5 s. <code>main</code> waits 1.2 s, then cancels it.' },
              { bars: [{ lane: 0, from: 0, to: 0.5, label: '1' }, { lane: 0, from: 0.5, to: 1, label: '2' }], now: 1, say: 'Output: <code>Sending part 1</code>, <code>Sending part 2</code>. Between parts the job waits in <code>delay(500)</code>.' },
              { bars: [{ lane: 0, from: 1, to: 1.2, label: '3' }], marks: [{ at: 1.2, label: 'cancel', tone: 'err' }], now: 1.2, say: 'Output: <code>Sending part 3</code>. At 1.2 s <code>main</code> calls <code>job.cancel()</code> while the job waits for part 4. Output: <code>Cancelled</code>.' },
              { now: 1.2, say: 'The job’s <code>delay</code> throws instead of returning. Part 4 never prints, and neither does <code>All parts sent</code>.' },
              { bars: [{ lane: 1, from: 1.2, to: 2.2, label: 'timeout 1 s', tone: 'warm' }], marks: [{ at: 2.2, label: 'null', tone: 'warm' }], now: 2.2, say: 'Next, a 3-second wait with a 1-second limit. At the limit the block is cancelled and the answer is <code>null</code>. Output: <code>Answer: null</code>.' },
            ],
          });
        },
        code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        for (part in 1..5) {
            println("Sending part $part")
            delay(500)
        }
        println("All parts sent")
    }
    delay(1200)
    job.cancel()                 // the user tapped Cancel
    println("Cancelled")

    val answer = withTimeoutOrNull(1000) {
        delay(3000)              // a server that takes too long
        "Synced"
    }
    println("Answer: $answer")
}
// Sending part 1
// Sending part 2
// Sending part 3
// Cancelled
// Answer: null`,
        play: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {   // on a background thread, so main can still run and cancel it
        for (part in 1..5) {
            println("Saving part $part")
            Thread.sleep(500)    // blocks; never checks for cancel
        }
    }
    delay(1200)
    job.cancel()
    println("Cancelled")
    // Parts 4 and 5 still print. Add ensureActive() as the first line
    // inside the for loop, and run again.
}`,
        remember: 'job.cancel() stops a coroutine at its next suspend call. Busy loops need ensureActive(). withTimeoutOrNull gives null when time runs out.',
        terms: [
          { term: 'Job', def: 'The handle <code>launch</code> gives back. Use it to cancel the coroutine.' },
          { term: 'cancel', def: '<code>job.cancel()</code> asks a coroutine to stop. At its next check, such as a <code>delay</code>, a <code>CancellationException</code> is thrown: cancelling is cooperative.' },
          { term: 'ensureActive', def: '<code>ensureActive()</code> stops the coroutine right there if it has been cancelled. Use it in loops that never pause.' },
          { term: 'withTimeoutOrNull', def: '<code>withTimeoutOrNull(ms) { ... }</code> cancels the block if it takes longer than <code>ms</code> milliseconds, and then gives back <code>null</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Stop the sync when the user taps Cancel, and give up on the goal after 2 seconds.', code: `val job = launch { syncHistory() }
// the user taps Cancel
job.[[cancel]]()

val goal = [[withTimeoutOrNull]](2000) { loadGoal() }`, why: '<code>cancel()</code> stops the job. <code>withTimeoutOrNull</code> gives back <code>null</code> if <code>loadGoal()</code> takes longer than 2 seconds.' },
          { type: 'bug', prompt: 'After <code>job.cancel()</code>, this still saves all 365 days. Tap the line to fix.', code: `val job = launch(Dispatchers.Default) {
    for (day in 1..365) {
        Thread.sleep(10)
        println("Day $day saved")
    }
}`, bug: 2, fix: '        delay(10)', why: '<code>Thread.sleep</code> never checks for cancel. <code>delay</code> is a <code>suspend</code> call, so a cancelled job stops there.' },
        ],
        quiz: [
          { q: 'What does <code>launch</code> give back?', options: ['A <code>Job</code>, a handle to stop the coroutine', 'The result of the block', 'Nothing'], a: 0, why: 'Keep the <code>Job</code> in a <code>val</code> to cancel the coroutine later.' },
          { q: 'A coroutine runs a long loop with no <code>suspend</code> calls and no <code>ensureActive()</code>. You call <code>cancel()</code>. What happens?', options: ['It keeps going until the loop ends', 'It stops at once'], a: 0, why: 'Cancelling is cooperative. Without a check, the loop never notices.' },
          { q: 'What does <code>withTimeoutOrNull(500) { delay(2000); "done" }</code> give back?', options: ['<code>null</code>', '<code>"done"</code>', 'It crashes'], a: 0, why: 'The block needs 2 seconds but has 0.5, so it is cancelled and the answer is <code>null</code>.' },
        ],
        docs: [['Cancellation and timeouts', 'https://kotlinlang.org/docs/cancellation-and-timeouts.html']],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'exceptions',
        title: 'Errors in coroutines',
        tagline: 'Catch a failure where it happens, and keep one failure from stopping the rest.',
        goals: ['Catch an error from a <code>suspend</code> function with <code>try</code>/<code>catch</code>', 'Explain how a failed child cancels its parent and siblings', 'Keep the other children running with <code>supervisorScope</code>'],
        level: 'beginner', introduces: ['supervisorScope'],
        body: `
<p>On the train, Lin has no internet, and Sync fails. A <code>suspend</code> function that fails throws an exception like any other function, and if nothing catches it, the app crashes.</p>
<p>The simplest fix is <code>try</code>/<code>catch</code> around the <code>suspend</code> call, inside the coroutine: <code>scope.launch { try { ... } catch (e: Exception) { ... } }</code>. It has to be inside. A <code>try</code> around the <code>launch</code> itself is finished the moment <code>launch</code> returns, long before the failure.</p>
<p>One catch: <code>catch (e: Exception)</code> also catches the <code>CancellationException</code> of a cancelled coroutine, for example when the screen leaves. That is harmless here, because the <code>catch</code> only sets a message and nothing runs after it, but don’t keep doing more work after catching it.</p>
<p>An exception nobody catches travels up the family. This is called <em>propagation</em>. The failed child tells its parent; the parent cancels all its other children, and then fails too. So inside <code>coroutineScope</code>, one failed load cancels the other, and <code>coroutineScope</code> throws the error. For parts that belong together, that is right: half a result is no use.</p>
<p>Sometimes the parts don’t depend on each other: if the goal can’t load, today’s glasses should still show. <code>supervisorScope { ... }</code> works like <code>coroutineScope</code>, except that a failed child cancels neither its parent nor its siblings. (Behind it is a <code>SupervisorJob</code>: a <code>Job</code> whose children can fail alone.) With <code>async</code>, the error waits in the <code>Deferred</code> and is thrown by <code>await()</code>, so catch it there.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 250,
            nodes: [
              { id: 'p', label: 'the scope', x: 50, y: 14 },
              { id: 'g', label: '<code>async</code>: glasses<br>0.5 s', x: 22, y: 80 },
              { id: 'o', label: '<code>async</code>: goal<br>fails at 0.3 s', x: 78, y: 80, tone: 'err' },
            ],
            predict: {
              q: 'In <code>coroutineScope</code>, the goal fails at 0.3 s while the glasses are still loading. What happens to the glasses?',
              options: ['They are cancelled', 'They finish normally', 'Nothing: errors stay in their own coroutine'],
              a: 0,
              why: 'The error goes up to the parent, and the parent cancels its other children before failing itself.',
            },
            frames: [
              { add: [['p', 'g', '', 'accent'], ['p', 'o', '', 'accent']], say: 'First with <code>coroutineScope</code>: two children, glasses (0.5 s) and goal, which throws at 0.3 s.' },
              { add: [['o', 'p', 'error', 'err']], gone: ['o'], say: 'At 0.3 s the goal throws. Nobody catches it inside, so the error goes up to the parent.' },
              { add: [['p', 'g', 'cancel', 'err']], gone: ['g'], hl: ['p'], say: 'The parent cancels its other child. The glasses never arrive.' },
              { hl: ['p'], say: 'Then <code>coroutineScope</code> throws the error. A <code>try</code>/<code>catch</code> around it prints <code>Failed: Goal server is down</code>.' },
              { back: ['g', 'o'], remove: [['o', 'p'], ['p', 'g']], add: [['p', 'g', '', 'accent']], say: 'Now the same with <code>supervisorScope</code>, as in Run it.' },
              { add: [['o', 'p', 'kept for await()', 'warm']], gone: ['o'], say: 'The goal fails, but the error waits in its <code>Deferred</code>. Nothing is cancelled.' },
              { hl: ['g'], say: 'Glasses arrive at 0.5 s: <code>Glasses: 5</code>. Then <code>goal.await()</code> throws, and the <code>catch</code> prints <code>No goal: Goal server is down</code>.' },
            ],
          });
        },
        code: `@Composable
fun SyncButton(glasses: Int) {
    val scope = rememberCoroutineScope()
    var status by remember { mutableStateOf("Not synced") }
    Column {
        Text(status)
        Button(onClick = {
            scope.launch {
                try {
                    sendGlasses(glasses)               // may throw: no internet
                    status = "Synced"
                } catch (e: Exception) {
                    status = "Sync failed: \${e.message}"   // no crash
                }
            }
        }) {
            Text("Sync")
        }
    }
}`,
        play: `import kotlinx.coroutines.*

suspend fun loadGlasses(): Int {
    delay(500)
    return 5
}

suspend fun loadGoal(): Int {
    delay(300)
    throw Exception("Goal server is down")
}

fun main() = runBlocking {
    supervisorScope {
        val glasses = async { loadGlasses() }
        val goal = async { loadGoal() }
        println("Glasses: \${glasses.await()}")
        try {
            println("Goal: \${goal.await()}")
        } catch (e: Exception) {
            println("No goal: \${e.message}")
        }
    }
    println("Screen still works")
    // Change supervisorScope to coroutineScope and run again.
    // It crashes with "Goal server is down", before the glasses print:
    // the failed goal cancelled everything.
}
// Glasses: 5
// No goal: Goal server is down
// Screen still works`,
        remember: 'Catch with try/catch inside the coroutine. An uncaught failure cancels the parent and siblings; supervisorScope lets a child fail alone.',
        mistakes: [
          { title: 'try around launch', bad: `try {
    scope.launch {
        sendGlasses(glasses)
    }
} catch (e: Exception) {
    status = "Sync failed"   // never runs
}`, good: `scope.launch {
    try {
        sendGlasses(glasses)
    } catch (e: Exception) {
        status = "Sync failed"
    }
}`, why: '<code>launch</code> returns at once, so the outer <code>try</code> is over before the coroutine fails. Catch inside the coroutine.' },
        ],
        terms: [
          { term: 'propagation', def: 'An uncaught error travelling up: the failed child cancels its parent, which cancels the other children.' },
          { term: 'supervisorScope', def: 'Like <code>coroutineScope</code>, but a failed child cancels neither the scope nor its siblings.' },
          { term: 'SupervisorJob', def: 'The kind of job behind <code>supervisorScope</code>: one whose children can fail alone.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the glasses even when the goal fails.', code: `[[supervisorScope]] {
    val glasses = async { loadGlasses() }
    val goal = async { loadGoal() }
    println(glasses.await())
    try {
        println(goal.[[await]]())
    } catch (e: Exception) {
        println("No goal")
    }
}`, why: 'In <code>supervisorScope</code> the failed goal doesn’t cancel the glasses. Its error is thrown by <code>await()</code>, inside the <code>try</code>.' },
          { type: 'bug', prompt: 'When the goal fails, this crashes without printing the glasses. Tap the line to fix.', code: `coroutineScope {
    val glasses = async { loadGlasses() }
    val goal = async { loadGoal() }
    println("Glasses: \${glasses.await()}")
    try {
        println("Goal: \${goal.await()}")
    } catch (e: Exception) {
        println("No goal")
    }
}`, bug: 0, fix: 'supervisorScope {', why: 'In <code>coroutineScope</code> the failed goal cancels the glasses and the whole scope, before the <code>catch</code> is reached. <code>supervisorScope</code> lets the goal fail alone.' },
        ],
        quiz: [
          { q: '<code>try { scope.launch { throw Exception("x") } } catch (e: Exception) { ... }</code>. Does the <code>catch</code> run?', options: ['No: <code>launch</code> returned before the exception', 'Yes'], a: 0, why: 'The <code>try</code> only covers starting the coroutine. Put the <code>try</code> inside it.' },
          { q: 'In <code>coroutineScope</code>, one child fails and nobody catches it. What happens to the other children?', options: ['They are cancelled', 'They keep running', 'They fail with their own errors'], a: 0, why: 'The error goes to the parent, which cancels the rest and then fails.' },
          { q: 'In <code>supervisorScope</code>, an <code>async</code> child fails. Where do you see the error?', options: ['When you call <code>await()</code> on it', 'Nowhere', 'In the other children'], a: 0, why: 'The error is kept in the <code>Deferred</code> until <code>await()</code> throws it.' },
        ],
        docs: [['Coroutine exceptions handling', 'https://kotlinlang.org/docs/exception-handling.html']],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'shared-state',
        title: 'Shared state',
        tagline: 'When coroutines on several threads change one value, guard it.',
        goals: ['Explain why <code>glasses++</code> from several threads loses updates', 'Protect a value with <code>Mutex</code> and <code>withLock</code>', 'Avoid the problem by changing a value on one thread only'],
        level: 'beginner', introduces: ['Mutex', 'withLock'],
        body: `
<p>A test of the water tracker: 100 coroutines on <code>Dispatchers.Default</code> each add 1000 glasses to one counter. The answer should be 100000. It prints 98336, then 74386, a different number almost every run.</p>
<p><code>glasses++</code> looks like one step, but it is three: read the value, add 1, write it back. Two threads can both read 5 at the same moment, both write 6, and one glass is lost. A value that several coroutines change is <em>shared state</em>, and a bug where the result depends on which thread happens to go first is a <em>race condition</em>.</p>
<p>One fix is a lock. <code>val mutex = Mutex()</code> makes one, and <code>mutex.withLock { glasses++ }</code> lets only one coroutine at a time inside the block. The others pause, without blocking their thread, until it is free. (<code>Mutex</code> is short for “mutual exclusion”.) It needs <code>import kotlinx.coroutines.sync.*</code>.</p>
<p>The other fix is <em>confinement</em>: change the value on one thread only. Do the heavy work elsewhere and bring back just the result. In an app, keep state changes on the main thread: <code>total = withContext(Dispatchers.Default) { ... }</code> works out the number in the background, and the assignment happens back on the main thread. Only one thread ever touches <code>total</code>, so there is nothing to lock.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['thread 1', 'thread 2', 'glasses'],
            span: 4,
            unit: 'steps',
            predict: {
              q: '<code>glasses</code> is 5. Two threads run <code>glasses++</code> at the same moment, with no lock. What can <code>glasses</code> end up as?',
              options: ['Always 7', 'Sometimes 6', 'Always 6'],
              a: 1,
              why: 'If both read 5 before either writes, both write 6. It depends on timing, so it happens only sometimes.',
            },
            frames: [
              { bars: [{ lane: 2, from: 0, to: 3, label: '5', tone: 'muted' }], now: 0, say: '<code>glasses</code> is 5. Two threads each run <code>glasses++</code>, without a lock.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'read 5' }, { lane: 1, from: 0, to: 1, label: 'read 5' }], now: 1, say: 'Both read the value at the same moment: 5.' },
              { bars: [{ lane: 0, from: 1, to: 1.6, label: '+1' }, { lane: 1, from: 1, to: 1.6, label: '+1' }], now: 2, say: 'Each adds 1 to what it read: 6.' },
              { bars: [{ lane: 0, from: 1.6, to: 3, label: 'write 6' }, { lane: 1, from: 1.6, to: 3, label: 'write 6' }, { lane: 2, from: 3, to: 4, label: '6', tone: 'err' }], now: 3, say: 'Both write 6. Two glasses were added, but the count went up by one.' },
              { now: 4, say: 'With <code>mutex.withLock { glasses++ }</code>, thread 2 would pause at the lock until thread 1 had written 6. Then it would read 6 and write 7: both glasses count.' },
            ],
          });
        },
        code: `import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*

var glasses = 0
val mutex = Mutex()

fun main() = runBlocking {
    withContext(Dispatchers.Default) {     // several threads
        for (person in 1..100) {
            launch {
                for (tap in 1..1000) {
                    mutex.withLock {        // one coroutine at a time
                        glasses++
                    }
                }
            }
        }
    }
    println("Glasses: $glasses")           // Glasses: 100000, every time
}`,
        play: `import kotlinx.coroutines.*

var glasses = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {     // 100 coroutines on several threads
        for (person in 1..100) {
            launch {
                for (tap in 1..1000) {
                    glasses++
                }
            }
        }
    }
    println("Several threads: $glasses")   // should be 100000

    glasses = 0
    coroutineScope {                       // the same work, all on main's one thread
        for (person in 1..100) {
            launch {
                for (tap in 1..1000) {
                    glasses++
                }
            }
        }
    }
    println("One thread: $glasses")
    // Run it a few times. The first number is usually below 100000
    // and changes from run to run. The second is always 100000.
}`,
        remember: 'glasses++ from several threads can lose updates. Guard it with mutex.withLock { }, or change it on one thread only.',
        mistakes: [
          { title: 'A new lock in every coroutine', bad: `launch {
    val mutex = Mutex()          // each coroutine has its own lock
    mutex.withLock { glasses++ }
}`, good: `val mutex = Mutex()              // one lock, shared by all
launch {
    mutex.withLock { glasses++ }
}`, why: 'A lock only helps if everyone uses the same one. With a lock each, nobody ever waits.' },
        ],
        terms: [
          { term: 'race condition', def: 'A bug where the result depends on which thread happens to go first, like two <code>glasses++</code> losing an update.' },
          { term: 'Mutex', def: 'A lock for coroutines: <code>val mutex = Mutex()</code>. Only one coroutine at a time can hold it.' },
          { term: 'withLock', def: '<code>mutex.withLock { ... }</code> runs the block while holding the lock. Others pause until it is free.' },
          { term: 'confinement', def: 'Changing a value on one thread only, such as the main thread, so no lock is needed.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let only one coroutine at a time add a glass.', code: `val mutex = [[Mutex]]()

launch(Dispatchers.Default) {
    mutex.[[withLock]] {
        glasses++
    }
}`, why: '<code>Mutex()</code> makes the lock; <code>withLock</code> runs the block while holding it.' },
          { type: 'bug', prompt: 'The count comes out too low, though a lock exists. Tap the line to fix.', code: `val mutex = Mutex()
for (person in 1..100) {
    launch(Dispatchers.Default) {
        for (tap in 1..1000) {
            glasses++
        }
    }
}`, bug: 4, fix: '            mutex.withLock { glasses++ }', why: 'Having a lock isn’t enough; the change has to happen inside <code>withLock</code>.' },
        ],
        quiz: [
          { q: 'Why can <code>glasses++</code> lose updates when several threads run it?', options: ['It is three steps (read, add, write), and two threads can read the same old value', 'Kotlin rounds big numbers', 'Threads can’t change a <code>var</code>'], a: 0, why: 'Both read 5, both write 6, and one update is lost.' },
          { q: 'Another coroutine is inside <code>mutex.withLock { }</code>. What does yours do when it gets there?', options: ['Pauses until the lock is free, without blocking its thread', 'Skips the block', 'Crashes'], a: 0, why: '<code>withLock</code> waits like <code>delay</code> does: the coroutine pauses, and the thread is free.' },
          { q: 'Every coroutine that changes <code>glasses</code> runs on the main thread, and the change is a plain <code>glasses++</code>. Do you need a <code>Mutex</code>?', options: ['No: only one thread ever touches it', 'Yes, always'], a: 0, why: 'That is confinement. One thread runs one <code>glasses++</code> at a time.' },
        ],
        docs: [['Shared mutable state and concurrency', 'https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html']],
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'channels',
        title: 'Channels',
        tagline: 'Pass values from one coroutine to another, one at a time.',
        goals: ['Send and receive values through a <code>Channel</code>', 'Predict when <code>send</code> and <code>receive</code> pause', 'End a channel with <code>close</code> and read it with a <code>for</code> loop'],
        level: 'beginner', introduces: ['Channel', 'send', 'receive', 'channels'],
        body: `
<p>Every drink Lin taps should be saved to the server, in order and one at a time, while she keeps tapping. One coroutine produces drinks, another saves them. They need a safe way to hand values over.</p>
<p>A <em>channel</em> is a pipe between coroutines. <code>val drinks = Channel&lt;String&gt;()</code> makes one for <code>String</code> values; the type in <code>&lt; &gt;</code> says what goes through it, as in <code>List&lt;String&gt;</code>. <code>drinks.send("Tea")</code> puts a value in, and <code>drinks.receive()</code> takes the next one out. Values come out in the order they went in, each one is received once, and many coroutines can use the same channel safely. It needs <code>import kotlinx.coroutines.channels.*</code>.</p>
<p>Both calls can pause. <code>receive()</code> pauses while the channel is empty. A channel made with <code>Channel()</code> has no room to store values, so <code>send()</code> pauses until a receiver takes the value: the two meet and hand it over.</p>
<p>When the sender is done, <code>drinks.close()</code> says no more values are coming. <code>for (drink in drinks) { ... }</code> receives value after value, and ends once the channel is closed and empty.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'snd', label: 'sender', sub: '<code>launch</code>: taps' },
              { id: 'ch', label: 'channel', sub: '<code>Channel&lt;String&gt;()</code>' },
              { id: 'rec', label: 'receiver', sub: '<code>for (drink in drinks)</code>' },
            ],
            predict: {
              q: 'Nobody is receiving yet. The sender calls <code>drinks.send("Water")</code> on a <code>Channel&lt;String&gt;()</code>. What happens?',
              options: ['<code>send</code> pauses until someone receives', 'The value is thrown away', '<code>send</code> returns, and the value waits in the channel'],
              a: 0,
              why: 'This channel has no room to store values, so the sender waits until a receiver takes it.',
            },
            frames: [
              { mark: { rec: 'warm' }, say: 'The program from the code below. The receiver’s <code>for</code> loop starts first and waits: the channel is empty.' },
              { at: 'snd', packet: 'Water', say: 'At 0.5 s: <code>Tapped Water</code>. The sender calls <code>send</code>.' },
              { at: 'ch', packet: 'Water', say: 'The receiver is already waiting, so the value is handed straight over.' },
              { at: 'rec', packet: 'Water', tone: 'ok', say: 'Output: <code>Saving Water</code>. The loop goes back to waiting for the next drink.' },
              { at: 'rec', packet: 'Tea', tone: 'ok', say: 'At 1 s and 1.5 s, Tea and Juice go the same way: one at a time, in order.' },
              { at: 'snd', packet: 'close()', tone: 'muted', say: 'The sender calls <code>close()</code>: no more drinks.' },
              { at: 'rec', packet: 'close()', tone: 'muted', mark: { rec: 'ok' }, say: 'The channel is closed and empty, so the <code>for</code> loop ends. Output: <code>Done</code>.' },
            ],
          });
        },
        code: `import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    val drinks = Channel<String>()
    launch {
        for (drink in listOf("Water", "Tea", "Juice")) {
            delay(500)               // the user taps a drink
            println("Tapped $drink")
            drinks.send(drink)
        }
        drinks.close()               // no more drinks
    }
    for (drink in drinks) {          // receives until the channel is closed
        println("Saving $drink")
    }
    println("Done")
}
// Tapped Water
// Saving Water
// Tapped Tea
// Saving Tea
// Tapped Juice
// Saving Juice
// Done`,
        play: `import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    val drinks = Channel<String>()
    launch {
        for (drink in listOf("Water", "Tea")) {
            println("Sending $drink")
            drinks.send(drink)         // waits until someone takes it
            println("$drink was taken")
        }
        drinks.close()
    }
    delay(1000)
    println("Receiver ready")
    println("Got \${drinks.receive()}")
    delay(1000)
    println("Got \${drinks.receive()}")
}
// Sending Water
// Receiver ready
// Got Water
// Water was taken
// Sending Tea
// Got Tea
// Tea was taken`,
        remember: 'A Channel passes values between coroutines: send waits for a receiver, receive waits for a value, close ends the for loop.',
        mistakes: [
          { title: 'Forgetting close()', bad: `launch {
    for (drink in listOf("Water", "Tea")) {
        drinks.send(drink)
    }
}
for (drink in drinks) {
    println(drink)
}
println("Done")   // never prints: the loop waits forever`, good: `launch {
    for (drink in listOf("Water", "Tea")) {
        drinks.send(drink)
    }
    drinks.close()
}`, why: 'The <code>for</code> loop can’t know that no more values are coming. <code>close()</code> tells it.' },
        ],
        terms: [
          { term: 'Channel', def: 'A pipe between coroutines: values go in with <code>send</code> and come out, in order, with <code>receive</code>.' },
          { term: 'send', def: '<code>channel.send(value)</code> puts a value in. On a <code>Channel()</code>, it pauses until a receiver takes it.' },
          { term: 'receive', def: '<code>channel.receive()</code> takes the next value out, pausing while the channel is empty.' },
          { term: 'close', def: '<code>channel.close()</code> says no more values are coming, so a <code>for</code> loop over the channel ends.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send 1, 2 and 3, then end the channel so the loop finishes.', code: `val numbers = Channel<Int>()
launch {
    for (n in 1..3) {
        numbers.[[send]](n)
    }
    numbers.[[close]]()
}
for (n in numbers) {
    println(n)
}`, why: '<code>send</code> hands each number over; <code>close()</code> lets the <code>for</code> loop end.' },
          { type: 'bug', prompt: `This won’t compile: “Argument type mismatch: actual type is 'String', but 'Int' was expected.” Tap the line to fix.`, code: `val drinks = Channel<Int>()
launch {
    drinks.send("Water")
}
println(drinks.receive())`, bug: 0, fix: 'val drinks = Channel<String>()', why: 'The type in <code>&lt; &gt;</code> says what the channel carries. Drinks are text, so it is <code>Channel&lt;String&gt;</code>.' },
        ],
        quiz: [
          { q: 'Two coroutines receive from one channel. The sender sends 4 values. How many receivers get each value?', options: ['Exactly one', 'Both', 'It depends on the order'], a: 0, why: 'Receiving takes the value out of the channel, so each value goes to one receiver.' },
          { q: 'What does <code>receive()</code> do when the channel is empty?', options: ['Pauses until a value is sent', 'Gives back <code>null</code>', 'Throws'], a: 0, why: 'It waits, like <code>delay</code>, without blocking the thread.' },
          { q: 'When does <code>for (drink in drinks) { }</code> end?', options: ['When the channel is closed and empty', 'After one value', 'Never'], a: 0, why: '<code>close()</code> marks the end; the loop still gets every value sent before it.' },
        ],
        docs: [['Channels', 'https://kotlinlang.org/docs/channels.html']],
      },
    ],
  });
})();
