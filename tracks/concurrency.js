/* Concurrency fundamentals track. Same shape as tracks/kotlin.js.
   For beginners: threads, race conditions, locks, deadlock, memory visibility and safer tools (atomics,
   immutable data, confinement), all in plain Kotlin. The coroutines track builds on this.
   Every class is prefixed cc-. */
(() => {
  const { h, hl, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const label = text => h('span', { class: 'cc-label' }, text);
  const tag = (text, cls = '') => h('span', { class: `cc-tag ${cls}` }, text);
  // Interleaving stepper: the learner picks which thread runs its next line.
  // o: { names, lines: [{ src, exec(th, sh, all) -> { msg, block?, jump?, cls? } }], init(), mem(sh) -> html, local(th) -> html, verdict(sh, ths) -> html, intro }
  function stepper(el, o) {
    let sh, ths, hist;
    const mem = h('div', { class: 'cc-mem', 'aria-live': 'polite' });
    const lanes = h('div', { class: 'cc-lanes' });
    const histEl = h('div', { class: 'cc-hist', 'aria-label': 'Schedule so far' });
    const msg = out('');
    const btns = o.names.map((n, i) => act(`Run ${n} next`, () => step(i), { class: `cmd cc-t${i}` }));
    function start() {
      sh = o.init();
      ths = o.names.map(name => ({ name, pc: 0, loc: {}, done: false, blocked: false, retries: 0 }));
      hist = [];
      paint();
      say(msg, o.intro);
    }
    function step(i) {
      const th = ths[i];
      if (th.done) return;
      const r = o.lines[th.pc].exec(th, sh, ths) || {};
      th.blocked = !!r.block;
      if (!r.block) {
        th.pc = r.jump != null ? r.jump : th.pc + 1;
        if (th.pc >= o.lines.length) th.done = true;
      }
      hist.push({ i, cls: r.block ? 'cc-blk' : r.cls || '' });
      paint(i);
      say(msg, (r.msg || '') + (ths.every(t => t.done) ? ' ' + o.verdict(sh, ths) : ''));
    }
    function paint(ran) {
      mem.innerHTML = o.mem(sh);
      if (ran != null) replay(mem, 'pop-soft');
      lanes.replaceChildren(...ths.map((th, i) => h('div', { class: `cc-lane cc-l${i} ${th.blocked ? 'cc-waiting' : ''} ${th.done ? 'cc-fin' : ''}` },
        h('div', { class: 'cc-lane-head' }, h('b', {}, th.name), tag(th.done ? 'done' : th.blocked ? 'blocked' : 'ready', th.done ? 'cc-ok' : th.blocked ? 'cc-warm' : '')),
        h('ol', { class: 'cc-code' }, o.lines.map((ln, k) => h('li', { class: !th.done && k === th.pc ? 'cc-at' : null, html: hl(ln.src) }))),
        h('div', { class: 'cc-loc', html: o.local(th) || '&nbsp;' }))));
      histEl.replaceChildren(label('schedule'), ...(hist.length ? hist.map(x => h('span', { class: `cc-hchip cc-h${x.i} ${x.cls}` }, o.names[x.i])) : [h('span', { class: 'muted-text' }, 'nothing yet')]));
      btns.forEach((b, i) => { b.disabled = ths[i].done; });
    }
    el.append(mem, lanes, h('div', { class: 'controls' }, btns, act('Start over', start)), histEl, msg);
    start();
  }

  const css = `
.cc-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cc-tag { font: 600 0.72rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); white-space: nowrap; }
.cc-tag.cc-ok { background: var(--ok-soft); color: var(--ok); }
.cc-tag.cc-warm { background: var(--warm-soft); color: var(--warm); }
.cc-tag.cc-acc { background: var(--accent-soft); color: var(--accent); }
.cc-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.cc-note { font-size: 0.82rem; color: var(--muted); margin: 0; overflow-wrap: anywhere; }
.cmd:disabled { opacity: 0.45; cursor: default; transform: none; }
.cmd.cc-t0 { border-color: var(--accent); }
.cmd.cc-t1 { border-color: var(--warm); }

/* stepper */
.cc-mem { justify-self: center; font: 600 0.95rem var(--mono); color: var(--ink); background: var(--surface); border: 2px solid var(--ink); border-radius: 12px; padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; justify-content: center; max-width: 100%; overflow-wrap: anywhere; }
.cc-mem b { font-size: 1.15rem; }
.cc-lanes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 10px; min-width: 0; }
.cc-lane { display: grid; gap: 6px; align-content: start; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, opacity 0.2s; }
.cc-lane.cc-l0 { border-color: var(--accent); }
.cc-lane.cc-l1 { border-color: var(--warm); }
.cc-lane.cc-waiting { border-style: dashed; }
.cc-lane.cc-fin { opacity: 0.7; }
.cc-lane-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: var(--ink); font-family: var(--mono); }
.cc-code { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; min-width: 0; }
.cc-code li { font: 500 0.8rem/1.5 var(--mono); padding: 2px 8px; border-radius: 6px; background: var(--code-bg); color: var(--code-ink); white-space: pre-wrap; overflow-wrap: anywhere; border-left: 4px solid transparent; }
.cc-code li.cc-at { border-left-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.cc-l1 .cc-code li.cc-at { border-left-color: var(--warm); box-shadow: inset 0 0 0 1px var(--warm); }
.cc-loc { font: 600 0.78rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cc-loc b { color: var(--ink); }
.cc-hist { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; min-width: 0; }
.cc-hchip { font: 700 0.7rem var(--mono); padding: 2px 6px; border-radius: 6px; border: 1.5px solid var(--accent); background: var(--accent-soft); color: var(--ink); }
.cc-hchip.cc-h1 { border-color: var(--warm); background: var(--warm-soft); }
.cc-hchip.cc-blk { border-style: dashed; background: transparent; color: var(--muted); }
`;

  Lab.addTrack({
    id: 'concurrency',
    title: 'Concurrency fundamentals',
    description: 'Make a program do two jobs at once with threads, see how shared values go wrong, and fix it with locks, @Volatile and safer tools.',
    requires: ['kotlin'],
    css,
    lessons: [
      {
        id: 'concurrency-parallelism',
        title: 'Concurrency and parallelism',
        tagline: 'Several jobs in progress at once: taking turns, or truly side by side.',
        goals: ['Start a second thread with <code>thread { }</code> and wait for it with <code>join()</code>', 'Tell concurrency (taking turns) from parallelism (at the same instant)', 'Expect the order of two threads to change from run to run'],
        level: 'beginner', introduces: ['import', 'thread', 'join', 'Thread', 'sleep'],
        body: `
<p>While a photo app saves a big picture, you can keep scrolling. The phone is doing two jobs at once. Each job runs on its own <em>thread</em>: a worker that follows its own list of instructions, in order, top to bottom. Every program you have written so far had one thread, the one that runs <code>fun main()</code>. It is called the main thread.</p>
<p>To start another one, write <code>import kotlin.concurrent.thread</code> at the top of the file. An <code>import</code> line tells Kotlin which toolbox a name comes from. Then <code>thread { ... }</code> runs the lambda on a new thread, while main goes on with its next line right away. <code>thread { }</code> gives back the new thread, so keep it in a <code>val</code>: <code>val worker = thread { ... }</code>. Later, <code>worker.join()</code> makes main wait until that thread has finished. And <code>Thread.sleep(10)</code> pauses the thread that runs it for 10 milliseconds (ms, thousandths of a second). Note the capital T: <code>Thread</code> is Kotlin’s name for the thread type itself, and <code>Thread.sleep</code> is a function that belongs to it.</p>
<p>The parts of a processor that run instructions are called <em>cores</em>, and a core runs one thread at a time. With one core, two threads take turns in tiny slices, and the operating system (the software that runs the phone) picks who goes next. That mixing is <em>interleaving</em>, and having several jobs in progress this way is <em>concurrency</em>. With two cores, both threads can run at the very same instant: that is <em>parallelism</em>. Phones have several cores, so you usually get both.</p>
<p>Either way, you don’t choose the order, and it can change every time the program runs. The rest of this track is about writing code that works in every order.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['1 core', '2 cores: #1', '2 cores: #2'],
            span: 12,
            predict: {
              q: 'Two threads each need 6 ms of work. The phone has <b>one</b> core. When are both done?',
              options: ['At 6 ms: they run at the same time', 'At about 12 ms: they take turns', 'At 3 ms: the work is split in half'],
              a: 1,
              why: 'One core runs one thread at a time. Taking turns lets both make progress, but the total work is still 12 ms.',
            },
            frames: [
              { now: 0, say: 'Two threads: <b>A</b> sorts photos, <b>B</b> sorts songs. Each needs 6 ms of work. First, a phone with one core.' },
              { bars: [{ lane: 0, from: 0, to: 2, label: 'A' }], say: 'The operating system lets A run for a short slice.' },
              { bars: [{ lane: 0, from: 2, to: 4, label: 'B', tone: 'warm' }], say: 'Then it pauses A and lets B run. Both jobs are in progress: that is <em>concurrency</em>.' },
              { bars: [{ lane: 0, from: 4, to: 6, label: 'A' }, { lane: 0, from: 6, to: 8, label: 'B', tone: 'warm' }], say: 'Back and forth: this mixing is <em>interleaving</em>. You don’t pick the order, and it can be different next time.' },
              { bars: [{ lane: 0, from: 8, to: 10, label: 'A' }, { lane: 0, from: 10, to: 12, label: 'B', tone: 'warm' }], say: 'The last one finishes at 12 ms. They never ran at the same instant: concurrent, but not parallel.' },
              { now: 6, bars: [{ lane: 1, from: 0, to: 6, label: 'A' }, { lane: 2, from: 0, to: 6, label: 'B', tone: 'warm' }], say: 'With two cores, A and B run at the same instant. That is <em>parallelism</em>, and both are done at 6 ms.' },
            ],
          });
        },
        code: `import kotlin.concurrent.thread

fun main() {
    val worker = thread {
        println("Worker: saving the photo")
    }
    println("Main: you can keep scrolling")
    worker.join()
    println("Main: the photo is saved")
}
// Main: you can keep scrolling
// Worker: saving the photo
// Main: the photo is saved
// (the first two lines can swap places)`,
        play: `import kotlin.concurrent.thread

fun main() {
    val a = thread {
        for (i in 1..4) {
            println("A$i")
            Thread.sleep(10)
        }
    }
    val b = thread {
        for (i in 1..4) {
            println("B$i")
            Thread.sleep(10)
        }
    }
    a.join()
    b.join()
    println("Both done")
    // Run it a few times. Does the mix of A and B lines change?
}`,
        remember: 'thread { } starts a new thread and join() waits for it. Taking turns is concurrency; running at the same instant on several cores is parallelism. The order is never up to you.',
        mistakes: [
          { title: 'Forgetting to wait with join()', bad: `val worker = thread { println("Saving the photo") }
println("Photo saved!")   // can print before the worker even starts`, good: `val worker = thread { println("Saving the photo") }
worker.join()             // wait until the worker is finished
println("Photo saved!")`, why: 'Main does not wait for a thread it started. If the next line depends on the thread’s work, call <code>join()</code> first.' },
        ],
        terms: [
          { term: 'thread', def: 'One worker inside a program that runs its own instructions in order. <code>thread { }</code> starts a new one.' },
          { term: 'interleaving', def: 'The way the steps of several threads get mixed together when they take turns.' },
          { term: 'concurrency', def: 'Several jobs in progress during the same time, even if only one runs at any instant.' },
          { term: 'parallelism', def: 'Several jobs running at the very same instant, on different cores.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a thread that prints a line, and make main wait for it.', code: `import kotlin.concurrent.thread

fun main() {
    val worker = [[thread]] { println("Downloading") }
    worker.[[join]]()
    println("Download finished")
}`, why: '<code>thread { }</code> starts the new thread, and <code>join()</code> waits until it has finished, so “Download finished” always comes last.' },
          { type: 'bug', prompt: '“Both saved” should only print after both threads are finished, but sometimes it comes before “Song saved”. Tap the line to fix.', code: `import kotlin.concurrent.thread

fun main() {
    val a = thread { println("Photo saved") }
    val b = thread { println("Song saved") }
    a.join()
    a.join()
    println("Both saved")
}`, bug: 6, fix: '    b.join()', why: '<code>join()</code> waits for one particular thread. Main waited for <code>a</code> twice and never for <code>b</code>.' },
        ],
        quiz: [
          { q: 'A phone with one core runs two threads, and both make progress during the same second. What is this?', options: ['Concurrency without parallelism', 'Parallelism', 'Neither'], a: 0, why: 'Both jobs are in progress at once (concurrency), but one core runs only one of them at any instant, so there is no parallelism.' },
          { q: 'What does <code>worker.join()</code> do?', options: ['The current thread waits until <code>worker</code> has finished', 'It starts <code>worker</code>', 'It joins two threads into one'], a: 0, why: '<code>thread { }</code> already started it. <code>join()</code> only waits.' },
          { q: 'You run a program with two threads twice and get a different order of lines each time. Is something broken?', options: ['No, the order of threads can change on every run', 'Yes, Kotlin has a bug', 'Yes, the phone is too slow'], a: 0, why: 'The operating system decides who runs when, and that changes from run to run. Good concurrent code is correct in every order.' },
        ],
        docs: [['Kotlin: thread()', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/thread.html'], ['Android: Processes and threads', 'https://developer.android.com/guide/components/processes-and-threads']],
      },

      {
        id: 'race-conditions',
        title: 'Race conditions',
        tagline: 'When two threads change the same value, updates can get lost.',
        goals: ['Explain why <code>likes++</code> is really three steps', 'Spot shared state that two threads change', 'Recognize a lost update in a program’s output'],
        level: 'beginner', introduces: [],
        body: `
<p>A post gets likes from people all over the world at the same moment. If each like is handled on its own thread, and every thread runs <code>likes++</code> on the same variable, the count can come out too low. Likes vanish, and no error tells you.</p>
<p><code>likes++</code> looks like one step, but the computer does three: read the current value, add 1, write the new value back. Another thread can run between any two of them. If Ada’s thread and Sam’s thread both read 0, both work out 1 and both write 1. Two likes, but the count says 1. That is a <em>lost update</em>.</p>
<p>A variable that more than one thread can change is <em>shared state</em>. A bug where the result depends on which thread happens to go first is a <em>race condition</em>. Races are sneaky: the program can give the right answer many times in a row and then a wrong one, because the order changes on every run.</p>
<p>In the demo, first watch one bad order. Then you pick which thread runs next: try to lose an update yourself. A lambda can read and change the <code>var</code>s of the function it is written in. That is how two threads end up sharing one variable. In the programs below, <code>for (i in 1..100000) counter.like()</code> is a whole loop on one line: when a loop body is a single line, you can leave out its <code>{ }</code>.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Ada’s thread', 'Sam’s thread'],
            span: 8,
            unit: 'steps',
            predict: {
              q: '<code>likes</code> starts at 0, and two threads each run <code>likes++</code> once. Can <code>likes</code> end up as 1?',
              options: ['No, <code>++</code> is a single step', 'Yes, if both threads read 0 before either one writes', 'Only on a phone with one core'],
              a: 1,
              why: 'Read, add, write: if both read the same old value, both write the same new value. One core is enough, since a switch between the read and the write does it.',
            },
            frames: [
              { now: 0, say: '<code>likes</code> is 0. Both threads run <code>likes++</code>, shown as its three real steps.' },
              { bars: [{ lane: 0, from: 0, to: 2, label: 'read 0' }], say: 'Ada’s thread reads <code>likes</code>: 0.' },
              { bars: [{ lane: 1, from: 2, to: 4, label: 'read 0', tone: 'warm' }], say: 'Before Ada’s thread writes, Sam’s thread gets a turn. It reads <code>likes</code> too: still 0.' },
              { bars: [{ lane: 0, from: 4, to: 6, label: 'write' }], say: 'Ada’s thread adds 1 to the 0 it read and writes 1. <code>likes</code> is now 1.' },
              { bars: [{ lane: 1, from: 6, to: 8, label: 'write', tone: 'warm' }], marks: [{ at: 8, label: 'lost', tone: 'err' }], say: 'Sam’s thread adds 1 to the 0 <em>it</em> read and writes 1. Two likes, but <code>likes</code> is 1: Ada’s like was overwritten. A lost update.' },
            ],
          });
          const box = h('div', { class: 'cc-stage' });
          el.append(h('p', { class: 'cc-note', html: '<b>Your turn.</b> You decide which thread runs its next line. Can you end with <code>likes = 1</code>? Can you end with 2?' }), box);
          stepper(box, {
            names: ['Ada', 'Sam'],
            lines: [
              { src: 'val now = likes', exec(th, sh) { th.loc.now = sh.likes; return { msg: `${th.name}’s thread reads likes: ${sh.likes}.` }; } },
              { src: 'val next = now + 1', exec(th) { th.loc.next = th.loc.now + 1; return { msg: `${th.name}’s thread works out ${th.loc.now} + 1 = ${th.loc.next}. likes itself has not changed yet.` }; } },
              { src: 'likes = next', exec(th, sh) { const old = sh.likes; sh.likes = th.loc.next; return { msg: old === th.loc.next ? `${th.name}’s thread writes ${th.loc.next}, but likes was already ${old}. The other thread’s like was overwritten.` : `${th.name}’s thread writes ${th.loc.next} to likes.` }; } },
            ],
            init: () => ({ likes: 0 }),
            mem: sh => `<span>likes = <b>${sh.likes}</b></span>`,
            local: th => th.loc.now === undefined ? 'now = ?' : `now = <b>${th.loc.now}</b>${th.loc.next === undefined ? '' : ` · next = <b>${th.loc.next}</b>`}`,
            verdict: sh => sh.likes === 2 ? '<span class="good">Both done: likes = 2. Correct this time.</span>' : '<span class="bad">Both done: likes = 1. Lost update: both threads read 0, so one like vanished.</span>',
            intro: 'Both threads start at their first line. Press a button to run that thread’s next line.',
          });
        },
        code: `fun main() {
    var likes = 0

    likes++              // one line in Kotlin...

    val now = likes      // ...is three steps for the computer:
    val next = now + 1   // read, add 1, write back
    likes = next

    println(likes)       // 2: both ways added 1, one after the other
}`,
        play: `import kotlin.concurrent.thread

class Counter {
    var likes = 0
    fun like() {
        likes++
    }
}

fun main() {
    val counter = Counter()
    val ada = thread { for (i in 1..100000) counter.like() }
    val sam = thread { for (i in 1..100000) counter.like() }
    ada.join()
    sam.join()
    println("likes = \${counter.likes}")    // should be 200000
    // Run it several times: the number changes, and is often too low.
    // Then change both 100000 to 100 (so 200 is right) and run again.
    // With so little work, one thread usually finishes before the
    // other starts, and the bug hides.
}`,
        remember: 'likes++ is read, add 1, write. When two threads change the same variable, one thread’s update can be lost, and only on some runs.',
        terms: [
          { term: 'shared state', def: 'A variable that more than one thread can read and change.' },
          { term: 'race condition', def: 'A bug where the result depends on the order in which threads happen to run.' },
          { term: 'lost update', def: 'Two threads read the same old value, and the second write wipes out the first.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write <code>likes++</code> out as the three steps the computer really does.', code: `var likes = 5
val now = [[likes]]      // 1. read
val next = now [[+]] 1     // 2. add 1
likes = [[next]]         // 3. write back
println(likes)        // 6`, why: 'Read the value into <code>now</code>, add 1, then write the result back. Another thread could run between any two of these lines.' },
          { type: 'bug', prompt: 'Each thread should count in its own box, and main adds them up. It should print 200000, but it often prints less. Tap the line to fix.', code: `import kotlin.concurrent.thread

fun main() {
    var adaLikes = 0
    var samLikes = 0
    val ada = thread { for (i in 1..100000) adaLikes++ }
    val sam = thread { for (i in 1..100000) adaLikes++ }
    ada.join()
    sam.join()
    println(adaLikes + samLikes)
}`, bug: 6, fix: '    val sam = thread { for (i in 1..100000) samLikes++ }', why: 'Sam’s thread changed <code>adaLikes</code> too, so two threads shared one variable and raced. With its own box, nothing is shared until after <code>join()</code>.' },
        ],
        quiz: [
          { q: '<code>likes</code> is 5. Ada’s thread reads 5. Sam’s thread reads 5 and writes 6. Ada’s thread adds 1 and writes. What is <code>likes</code>?', options: ['6', '7', '5'], a: 0, why: 'Ada’s thread worked from the old 5, so it writes 6 over Sam’s 6. One like is lost.' },
          { q: 'A two-thread counter printed the right total five runs in a row. Is it free of races?', options: ['Not necessarily: a bad order can be rare but still happen', 'Yes, five runs prove it', 'Yes, if the phone has several cores'], a: 0, why: 'The order changes from run to run. A lost update needs only one unlucky order, maybe on someone else’s phone.' },
          { q: 'Which of these is shared state?', options: ['A <code>var</code> that two threads both change', 'A <code>var</code> inside a function that only one thread runs', 'A number written in the code, like <code>100</code>'], a: 0, why: 'Shared state is something more than one thread can change. If only one thread touches it, it cannot race.' },
        ],
        docs: [['Java tutorial: Thread interference', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/interfere.html']],
      },

      {
        id: 'locks',
        title: 'Locks',
        tagline: 'Let only one thread at a time into the code that changes shared state.',
        goals: ['Guard shared state with <code>synchronized(lock) { }</code>', 'Explain what a critical section is', 'Make sure every thread uses the same lock'],
        level: 'beginner', introduces: ['synchronized', 'Any'],
        body: `
<p>A shared bathroom has a lock on the door. Whoever is inside locks it, and everyone else waits outside until it opens. Threads use the same idea to stop lost updates.</p>
<p>The code that reads and changes shared state, like <code>likes++</code>, is a <em>critical section</em>. Only one thread at a time should be inside it. That rule is called <em>mutual exclusion</em>: while one thread is in, the others are kept out.</p>
<p>In Kotlin you write <code>synchronized(lock) { likes++ }</code>. The <code>lock</code> can be any object; <code>val lock = Any()</code> makes a plain object whose only job is to be the lock. A thread that reaches <code>synchronized(lock)</code> while another thread is inside waits at the door. When the thread inside reaches the closing <code>}</code>, the lock opens and the next thread goes in. Now the read, add and write happen together, and no update is lost.</p>
<p>A lock only protects you if every thread uses the same lock object. Keep the block short, too: other threads are waiting while you are inside.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Ada’s thread', 'Sam’s thread'],
            span: 8,
            unit: 'steps',
            predict: {
              q: 'Ada’s thread is inside <code>synchronized(lock) { }</code>. Sam’s thread reaches <code>synchronized(lock)</code> on the same lock. What happens?',
              options: ['Sam’s thread waits until Ada’s thread leaves the block', 'Both run the block at the same time', 'Sam’s thread skips the block'],
              a: 0,
              why: 'Only one thread can hold a lock. The others wait at the door, then go in one by one.',
            },
            frames: [
              { now: 0, say: 'Both threads run <code>synchronized(lock) { likes++ }</code>. <code>likes</code> is 0 and the lock is open.' },
              { bars: [{ lane: 0, from: 0, to: 2, label: 'read 0', tone: 'ok' }], say: 'Ada’s thread gets there first. It takes the lock, goes in and reads 0.' },
              { bars: [{ lane: 1, from: 1, to: 4, label: 'waits', tone: 'muted' }], say: 'Sam’s thread reaches <code>synchronized(lock)</code>, but the lock is taken. It has to wait.' },
              { bars: [{ lane: 0, from: 2, to: 4, label: 'write', tone: 'ok' }], say: 'Ada’s thread adds 1, writes 1 and reaches <code>}</code>. The lock opens.' },
              { bars: [{ lane: 1, from: 4, to: 6, label: 'read 1', tone: 'warm' }], say: 'Now Sam’s thread takes the lock and goes in. It reads 1, the new value.' },
              { bars: [{ lane: 1, from: 6, to: 8, label: 'write', tone: 'warm' }], say: 'It adds 1 and writes 2. Both likes counted. At every moment, at most one thread was inside.' },
            ],
          });
          const box = h('div', { class: 'cc-stage' });
          el.append(h('p', { class: 'cc-note', html: '<b>Your turn.</b> Same steps, now inside a lock. Try to lose an update: run Ada once, then Sam.' }), box);
          stepper(box, {
            names: ['Ada', 'Sam'],
            lines: [
              { src: 'synchronized(lock) {', exec(th, sh) {
                if (sh.owner && sh.owner !== th.name) return { block: true, msg: `${th.name}’s thread has to wait: ${sh.owner}’s thread is inside. Run ${sh.owner} instead.` };
                sh.owner = th.name; return { msg: `${th.name}’s thread takes the lock and goes in.` };
              } },
              { src: '    val now = likes', exec(th, sh) { th.loc.now = sh.likes; return { msg: `${th.name}’s thread reads likes: ${sh.likes}.` }; } },
              { src: '    val next = now + 1', exec(th) { th.loc.next = th.loc.now + 1; return { msg: `${th.name}’s thread works out ${th.loc.now} + 1 = ${th.loc.next}.` }; } },
              { src: '    likes = next', exec(th, sh) { sh.likes = th.loc.next; return { msg: `${th.name}’s thread writes ${th.loc.next} to likes.` }; } },
              { src: '}', exec(th, sh) { sh.owner = null; return { msg: `${th.name}’s thread reaches } and the lock opens.` }; } },
            ],
            init: () => ({ likes: 0, owner: null }),
            mem: sh => `<span>likes = <b>${sh.likes}</b></span><span class="cc-tag ${sh.owner ? 'cc-acc' : ''}">lock: ${sh.owner ? sh.owner + ' is inside' : 'open'}</span>`,
            local: th => th.loc.now === undefined ? 'now = ?' : `now = <b>${th.loc.now}</b>${th.loc.next === undefined ? '' : ` · next = <b>${th.loc.next}</b>`}`,
            verdict: sh => sh.likes === 2 ? '<span class="good">Both done: likes = 2. Whatever order you pick, the lock keeps both likes.</span>' : '<span class="bad">Both done: likes = 1.</span>',
            intro: 'Both threads start at <code>synchronized(lock) {</code>. Press a button to run that thread’s next line.',
          });
        },
        code: `import kotlin.concurrent.thread

class Wallet {
    var coins = 0
    val lock = Any()

    fun add(amount: Int) {
        synchronized(lock) {
            coins += amount
        }
    }
}

fun main() {
    val wallet = Wallet()
    val ada = thread { for (i in 1..100000) wallet.add(1) }
    val sam = thread { for (i in 1..100000) wallet.add(1) }
    ada.join()
    sam.join()
    println(wallet.coins)    // 200000, every time
}`,
        play: `import kotlin.concurrent.thread

class Counter {
    var likes = 0
    val lock = Any()
    fun like() {
        synchronized(lock) {
            likes++
        }
    }
}

fun main() {
    val counter = Counter()
    val ada = thread { for (i in 1..100000) counter.like() }
    val sam = thread { for (i in 1..100000) counter.like() }
    ada.join()
    sam.join()
    println("likes = \${counter.likes}, expected 200000")
    // Now remove synchronized(lock) { } around likes++ and run it a few times.
}`,
        remember: 'Put every read and change of shared state inside synchronized(lock) { }, with one shared lock object. Only one thread at a time gets in.',
        mistakes: [
          { title: 'Locking only the write', bad: `val now = likes          // read outside the lock
synchronized(lock) {
    likes = now + 1
}`, good: `synchronized(lock) {
    val now = likes      // read inside the lock
    likes = now + 1
}`, why: 'Two threads can still both read the same old value before either one gets the lock. The read, the add and the write all belong in the critical section.' },
        ],
        terms: [
          { term: 'lock', def: 'An object that only one thread can hold at a time. <code>synchronized(lock) { }</code> holds it for the block.' },
          { term: 'critical section', def: 'Code that reads and changes shared state, which only one thread at a time may run.' },
          { term: 'mutual exclusion', def: 'The rule that while one thread is in the critical section, every other thread is kept out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Many threads add points to one game score. Make <code>add</code> safe with a lock.', code: `class Score {
    var total = 0
    val lock = [[Any]]()

    fun add(points: Int) {
        [[synchronized]](lock) {
            total += points
        }
    }
}`, why: '<code>Any()</code> makes a plain object to use as the lock, and <code>synchronized(lock) { }</code> lets one thread at a time run the block, so no points are lost.' },
          { type: 'bug', prompt: 'Two threads call <code>like()</code> 100000 times each, but the total is often below 200000. Tap the line to fix.', code: `class Counter {
    var likes = 0
    val lock = Any()
    fun like() {
        synchronized(Any()) {
            likes++
        }
    }
}`, bug: 4, fix: '        synchronized(lock) {', why: '<code>Any()</code> makes a brand new object on every call, so each thread gets its own lock and nobody ever waits. All threads must use the same <code>lock</code>.' },
        ],
        quiz: [
          { q: 'What is a critical section?', options: ['Code that changes shared state and must run in one thread at a time', 'Code that runs first in <code>main</code>', 'Any code inside a lambda'], a: 0, why: 'It is the part where a second thread in the middle would break things, like the three steps of <code>likes++</code>.' },
          { q: 'Ada’s thread uses <code>synchronized(lockA)</code> and Sam’s thread uses <code>synchronized(lockB)</code> around the same <code>likes++</code>. Is it safe?', options: ['No, they never wait for each other', 'Yes, both used <code>synchronized</code>', 'Only if <code>likes</code> is a <code>val</code>'], a: 0, why: 'Different locks are different doors. Both threads walk right in, so updates can still be lost.' },
          { q: 'Two threads each call <code>synchronized(lock) { likes++ }</code> 1000 times, starting from 0. What does <code>println(likes)</code> print after both are joined?', options: ['2000', 'Something between 1000 and 2000', '1000'], a: 0, why: 'With one shared lock, the three steps of each <code>++</code> can no longer be split, so all 2000 likes count.' },
        ],
        docs: [['Kotlin: synchronized()', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/synchronized.html'], ['Java tutorial: Intrinsic locks and synchronization', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html']],
      },

      {
        id: 'deadlock',
        title: 'Deadlock',
        tagline: 'Two threads each hold what the other needs, and both wait forever.',
        goals: ['Explain how two locks can make threads wait in a circle', 'Prevent deadlock by always taking locks in the same order', 'Check whether a thread is still running with <code>isAlive</code>'],
        level: 'intermediate', introduces: ['isDaemon', 'isAlive'],
        body: `
<p>Ada and Sam each want to write a note, and each needs both the pen and the paper. Ada grabs the pen while Sam grabs the paper. Now Ada waits for the paper and Sam waits for the pen. Neither lets go of what they hold, so they wait forever. In code this is a <em>deadlock</em>. The app does not crash; it freezes.</p>
<p>It can happen when a thread holds one lock and waits for a second one inside it: <code>synchronized(pen) { synchronized(paper) { ... } }</code>. If another thread takes the same two locks in the opposite order, each thread can end up holding the lock the other is waiting for. They wait in a circle.</p>
<p>The fix is a rule called <em>lock ordering</em>: every thread takes the locks in the same order, for example always the pen first, then the paper. Then the second thread waits at the pen while holding nothing, and the first can finish and let go of both.</p>
<p>The Run it program freezes on purpose, so it uses two new tools. <code>thread(isDaemon = true) { }</code> starts a thread that does not keep the program running: when <code>main</code> ends, the program ends, even if that thread is stuck. And <code>worker.isAlive</code> is <code>true</code> while a thread has not finished yet.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 260,
            nodes: [
              { id: 'ada', label: 'Ada’s thread', x: 18, y: 16 },
              { id: 'paper', label: 'paper<small>lock</small>', x: 82, y: 16, tone: 'muted' },
              { id: 'pen', label: 'pen<small>lock</small>', x: 18, y: 84, tone: 'muted' },
              { id: 'sam', label: 'Sam’s thread', x: 82, y: 84, tone: 'warm' },
            ],
            predict: {
              q: 'Ada’s thread holds the pen and waits for the paper. Sam’s thread holds the paper and waits for the pen. What happens?',
              options: ['Ada’s thread wins because it started first', 'Both threads wait forever', 'Kotlin notices and stops one with an error'],
              a: 1,
              why: 'Each thread waits for a lock the other one holds, and nobody lets go. Nothing breaks the circle, so both wait forever with no error.',
            },
            frames: [
              { say: 'Two threads, two locks. Ada’s thread takes pen, then paper. Sam’s thread takes paper, then pen.' },
              { add: [['ada', 'pen', 'holds', 'ok']], hl: ['ada'], say: 'Ada’s thread runs <code>synchronized(pen)</code> and takes the pen.' },
              { add: [['sam', 'paper', 'holds', 'ok']], hl: ['sam'], say: 'At the same moment, Sam’s thread runs <code>synchronized(paper)</code> and takes the paper.' },
              { add: [['ada', 'paper', 'waits for', 'warm']], hl: ['ada'], say: 'Ada’s thread now needs the paper. It is taken, so Ada’s thread waits, still holding the pen.' },
              { add: [['sam', 'pen', 'waits for', 'err'], ['ada', 'paper', 'waits for', 'err']], hl: ['ada', 'sam'], say: 'Sam’s thread needs the pen: taken too. Each waits for the other, in a circle. <b>Deadlock</b>: nobody will ever let go.' },
              { remove: [['ada', 'pen'], ['sam', 'paper'], ['ada', 'paper'], ['sam', 'pen']], add: [['ada', 'pen', 'holds', 'ok'], ['sam', 'pen', 'waits for', 'warm']], say: 'The fix: both threads take the pen first. Ada’s thread got it, so Sam’s thread waits at the pen, holding nothing.' },
              { add: [['ada', 'paper', 'holds', 'ok']], hl: ['ada'], say: 'Nobody holds the paper, so Ada’s thread takes it, writes its note and lets go of both locks.' },
              { remove: [['ada', 'pen'], ['ada', 'paper']], add: [['sam', 'pen', 'holds', 'ok'], ['sam', 'paper', 'holds', 'ok']], hl: ['sam'], say: 'Now Sam’s thread takes the pen, then the paper, and writes. Same order everywhere, so no circle can form.' },
            ],
          });
        },
        code: `import kotlin.concurrent.thread

val pen = Any()      // outside main, so every thread and function can use it
val paper = Any()

fun writeNote(name: String) {
    synchronized(pen) {          // rule: pen first,
        synchronized(paper) {    // then paper
            println("$name writes a note")
        }
    }
}

fun main() {
    val ada = thread { writeNote("Ada") }
    val sam = thread { writeNote("Sam") }
    ada.join()
    sam.join()
    println("Both done")
}
// Ada writes a note
// Sam writes a note   (these two can swap places)
// Both done`,
        play: `import kotlin.concurrent.thread

val pen = Any()      // outside main, so every thread and function can use it
val paper = Any()

fun main() {
    val ada = thread(isDaemon = true) {
        synchronized(pen) {
            println("Ada: got the pen")
            Thread.sleep(100)
            synchronized(paper) {
                println("Ada: got the paper too, writing")
            }
        }
    }
    val sam = thread(isDaemon = true) {
        synchronized(paper) {    // try: pen
            println("Sam: got the paper")
            Thread.sleep(100)
            synchronized(pen) {  // try: paper
                println("Sam: got the pen too, writing")
            }
        }
    }
    Thread.sleep(1000)
    println("Ada still stuck? \${ada.isAlive}")
    println("Sam still stuck? \${sam.isAlive}")
}`,
        remember: 'A deadlock is threads waiting for each other’s locks in a circle. Take locks in the same order everywhere and the circle cannot form.',
        mistakes: [
          { title: 'Trying to fix it with a pause', bad: `val sam = thread {
    Thread.sleep(500)   // hope Ada is done by then
    synchronized(paper) { synchronized(pen) { println("Sam writes") } }
}`, good: `val sam = thread {
    synchronized(pen) { synchronized(paper) { println("Sam writes") } }
}`, why: 'A pause changes the timing, not the danger. On a slow or busy phone, Ada’s thread may still hold the pen after 500 ms. The same lock order makes the circle impossible.' },
        ],
        terms: [
          { term: 'deadlock', def: 'Threads waiting for each other’s locks in a circle, so none of them can ever go on.' },
          { term: 'lock ordering', def: 'The rule that every thread takes several locks in the same fixed order, which prevents deadlock.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a thread that never ends without stopping the program from ending, and check that it is still running.', code: `import kotlin.concurrent.thread

fun main() {
    val worker = thread([[isDaemon]] = true) {
        while (true) { }    // never ends
    }
    Thread.sleep(100)
    println("Still running? \${worker.[[isAlive]]}")   // Still running? true
}`, why: 'With <code>isDaemon = true</code> the program can end while the thread still runs. <code>isAlive</code> is <code>true</code> until the thread finishes.' },
          { type: 'bug', prompt: 'Sometimes this program freezes forever. The rule is “pen first, then paper”. Tap the line that breaks it.', code: `import kotlin.concurrent.thread

val pen = Any()
val paper = Any()

fun main() {
    val ada = thread { synchronized(pen) { synchronized(paper) { println("Ada writes") } } }
    val sam = thread { synchronized(paper) { synchronized(pen) { println("Sam writes") } } }
    ada.join()
    sam.join()
}`, bug: 7, fix: '    val sam = thread { synchronized(pen) { synchronized(paper) { println("Sam writes") } } }', why: 'Sam’s thread took the locks in the opposite order. If each thread grabs its first lock at the same moment, they wait for each other forever.' },
        ],
        quiz: [
          { q: 'One thread runs <code>synchronized(a) { synchronized(b) { } }</code>, another runs <code>synchronized(b) { synchronized(a) { } }</code>. What can happen?', options: ['Both wait forever', 'Kotlin refuses to compile it', 'The second thread always waits a little, then goes on'], a: 0, why: 'If each grabs its first lock before the other’s second, each holds what the other needs: a deadlock.' },
          { q: 'Which change prevents that deadlock?', options: ['Both threads take <code>a</code> first, then <code>b</code>', 'Add <code>Thread.sleep(100)</code> before the second lock', 'Use more threads'], a: 0, why: 'With one fixed order, the thread that waits holds nothing the other needs.' },
          { q: 'What does a deadlocked app usually look like to the person using it?', options: ['It freezes, with no error message', 'It shows a “deadlock” error and closes', 'It runs slowly but finishes'], a: 0, why: 'The threads are not broken, just waiting forever. Nothing crashes, so nothing reports a problem.' },
        ],
        docs: [['Java tutorial: Deadlock', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/deadlock.html']],
      },

      {
        id: 'memory-visibility',
        title: 'Memory visibility',
        tagline: 'A value one thread writes is not always seen by another, unless you ask for it.',
        goals: ['Explain why a thread may not see another thread’s write', 'Mark a shared flag with <code>@Volatile</code>', 'Know that <code>@Volatile</code> does not make <code>likes++</code> safe'],
        level: 'intermediate', introduces: ['Volatile'],
        body: `
<p>A music app plays music on a worker thread that keeps checking a property, <code>playing</code>. You tap Stop, the main thread sets <code>playing = false</code>, and the music goes on. This is not a lost update: only one thread writes. The trouble is that the worker never sees the change.</p>
<p>Reading the computer’s main memory is slow. To go faster, each core keeps values it uses in its own small, quick memory called a <em>cache</em>. Caches can delay when another core sees a write. And while your program runs, the system that runs Kotlin code may notice that the loop never changes <code>playing</code> itself, read it once and reuse that value. That second one is what can make the worker look at an old copy forever.</p>
<p>Put <code>@Volatile</code> in front of the property: <code>@Volatile var playing = true</code>, with <code>import kotlin.concurrent.Volatile</code> at the top. A word with <code>@</code> in front is an annotation: a note to the compiler. This one promises that every read gets the latest value, and every write becomes <em>visible</em> to the other threads. <code>@Volatile</code> goes on a property of a class or object, not on a <code>var</code> inside a function.</p>
<p><code>@Volatile</code> is for a simple flag: one thread writes, others read. It does not make <code>likes++</code> safe, because that is still three steps. For that, keep using <code>synchronized</code>, which also makes the values written inside it visible to the next thread that takes the same lock. And <code>join()</code> lets main see everything the finished thread wrote, which is why the earlier lessons worked.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'worker', label: 'Worker thread<small>while (playing)</small>', x: 18, y: 12 },
              { id: 'main', label: 'Main thread<small>playing = false</small>', x: 82, y: 12, tone: 'warm' },
              { id: 'copy', label: 'Worker’s copy<small>cache</small>', x: 18, y: 52, tone: 'muted' },
              { id: 'mem', label: 'Main memory<small>playing</small>', x: 50, y: 88, tone: 'muted' },
            ],
            predict: {
              q: 'A plain <code>var playing</code>, no <code>@Volatile</code>. The main thread sets it to <code>false</code>. Must the worker’s loop stop?',
              options: ['Yes, at its next check', 'Not necessarily: it may keep using its old copy forever', 'Yes, but only after a second'],
              a: 1,
              why: 'Nothing forces the worker to look again. It may read <code>playing</code> once and reuse that <code>true</code> forever.',
            },
            frames: [
              { add: [['mem', 'copy', 'true'], ['copy', 'worker', 'true']], say: 'The worker loops while <code>playing</code> is true. It read the value once and keeps it in a fast copy.' },
              { add: [['main', 'mem', 'false', 'warm']], hl: ['main'], say: 'You tap Stop. The main thread writes <code>playing = false</code>, and main memory now says false.' },
              { add: [['copy', 'worker', 'still true', 'err']], hl: ['worker'], say: 'The worker checks again, but it looks at its own copy: still true. The music plays on.' },
              { hl: ['copy'], say: 'Nothing makes the worker look in main memory again. Without <code>@Volatile</code>, this loop is allowed to run forever.' },
              { remove: [['mem', 'copy'], ['copy', 'worker'], ['main', 'mem']], gone: ['copy'], add: [['main', 'mem', '@Volatile write', 'ok']], hl: ['main'], say: 'Now the property is <code>@Volatile var playing</code>. The main thread’s write is made visible to every thread.' },
              { add: [['mem', 'worker', 'latest: false', 'ok']], hl: ['worker'], say: 'Every check in the loop reads the latest value, with no old copy. The worker sees false, and the music stops.' },
            ],
          });
        },
        code: `import kotlin.concurrent.Volatile
import kotlin.concurrent.thread

class Player {
    @Volatile var playing = true
}

fun main() {
    val player = Player()
    val music = thread {
        while (player.playing) {
            Thread.sleep(10)        // play a little more music
        }
        println("Music stopped")
    }
    Thread.sleep(100)
    player.playing = false          // the music thread is sure to see this
    music.join()
    println("Done")
}
// Music stopped
// Done`,
        play: `import kotlin.concurrent.Volatile
import kotlin.concurrent.thread

object Switch {
    @Volatile var running = true    // delete @Volatile and run again
}

fun main() {
    val worker = thread(isDaemon = true) {
        while (Switch.running) {
            // keep checking the switch
        }
        println("Worker: I saw the switch and stopped")
    }
    Thread.sleep(500)
    Switch.running = false
    println("Main: switch is off")
    Thread.sleep(500)
    println("Worker still running? \${worker.isAlive}")
}`,
        remember: 'A write on one thread is not sure to be seen by another. @Volatile makes a flag visible to all threads, but it does not make likes++ safe.',
        mistakes: [
          { title: 'Expecting @Volatile to fix a counter', bad: `class Counter {
    @Volatile var likes = 0
}
// in two threads:
counter.likes++         // still loses updates`, good: `class Counter {
    var likes = 0
    val lock = Any()
}
// in two threads:
synchronized(counter.lock) { counter.likes++ }`, why: '<code>@Volatile</code> makes each read and write visible, but <code>likes++</code> is still a read and a separate write. Two threads can both read the same value in between.' },
        ],
        terms: [
          { term: 'cache', def: 'A small, fast memory near each core that keeps copies of values, so it does not have to read main memory every time.' },
          { term: 'visibility', def: 'Whether a value one thread wrote can be seen by another thread.' },
          { term: '@Volatile', def: 'An annotation that makes every read of a property get the latest value and every write visible to other threads.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the <code>cancelled</code> flag visible to every thread.', code: `import kotlin.concurrent.[[Volatile]]

class Download {
    @[[Volatile]] var cancelled = false
}`, why: 'Import the annotation, then write <code>@Volatile</code> in front of the property that one thread writes and others read.' },
          { type: 'bug', prompt: 'The worker should stop once main sets <code>ticking = false</code>, but sometimes it never stops. Tap the line to fix.', code: `import kotlin.concurrent.Volatile
import kotlin.concurrent.thread

object Timer {
    var ticking = true
}

fun main() {
    val worker = thread {
        while (Timer.ticking) { }
        println("Stopped")
    }
    Thread.sleep(100)
    Timer.ticking = false
    worker.join()
}`, bug: 4, fix: '    @Volatile var ticking = true', why: 'Without <code>@Volatile</code>, the worker may keep reading an old <code>true</code> forever. The annotation makes it see the new value.' },
        ],
        quiz: [
          { q: 'Which problem does <code>@Volatile</code> solve?', options: ['A thread not seeing a value another thread wrote', 'Two threads losing updates in <code>likes++</code>', 'Two threads waiting for each other’s locks'], a: 0, why: 'It is about visibility. Lost updates need a lock, and deadlock needs a lock order.' },
          { q: 'A class has the property <code>@Volatile var likes = 0</code>. Two threads each run <code>likes++</code> on it 100000 times. What does it print after both are joined?', options: ['Often less than 200000', 'Always 200000', 'Always 100000'], a: 0, why: 'Each read and write is visible, but the three steps can still interleave, so updates are still lost.' },
          { q: 'One thread sets the property <code>done</code> to <code>true</code> once; another checks <code>done</code> in a loop. Which property fits best?', options: ['<code>@Volatile var done = false</code>', 'A plain <code>var done = false</code>', '<code>val done = false</code>'], a: 0, why: 'One writer, other readers: a volatile flag is exactly this case. A plain <code>var</code> may never be seen, and a <code>val</code> cannot change.' },
        ],
        docs: [['Kotlin: Volatile', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-volatile/'], ['Java tutorial: Memory consistency errors', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/memconsist.html']],
      },

      {
        id: 'lock-free-tools',
        title: 'Safer tools',
        tagline: 'Atomic counters, data that never changes, and data only one thread touches.',
        goals: ['Count safely from many threads with <code>AtomicInteger</code>', 'Share data safely by making it immutable', 'Avoid sharing by keeping a value inside one thread'],
        level: 'intermediate', introduces: ['AtomicInteger', 'incrementAndGet'],
        body: `
<p>Locks work, but they make threads wait, and used carelessly they can deadlock. Often there is an easier way. Three tools cover most cases.</p>
<p><b>Atomic values.</b> <code>AtomicInteger(0)</code>, from <code>import java.util.concurrent.atomic.AtomicInteger</code>, holds an <code>Int</code> that many threads can change safely. <code>likes.incrementAndGet()</code> adds 1 as one <em>atomic</em> step, which means it cannot be split: no other thread can slip in between the read and the write. <code>likes.get()</code> reads the value. No lock, no waiting at a door.</p>
<p><b>Immutable data.</b> Data that can never change cannot race. A data class with only <code>val</code> properties, or a list from <code>listOf</code>, is <em>immutable</em>, so any number of threads can read it at the same time. To “change” a data class object, make a new one with <code>copy()</code>. To “change” a list, make a new list with <code>listOf</code>. Every property must itself be unchangeable: a <code>val</code> holding a <code>mutableListOf</code> list can still change.</p>
<p><b>Confinement.</b> If only one thread ever touches a variable, there is nothing to race. A <code>var</code> created inside a thread’s lambda belongs to that thread alone. Android uses this idea too: only the main thread may change what is on the screen.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Ada, <code>++</code>', 'Sam, <code>++</code>', 'Ada, atomic', 'Sam, atomic'],
            span: 8,
            unit: 'steps',
            predict: {
              q: 'Two threads each call <code>likes.incrementAndGet()</code> once on <code>AtomicInteger(0)</code>. What is <code>likes.get()</code> afterwards?',
              options: ['2, every time', '1 or 2, depending on timing', '0'],
              a: 0,
              why: 'Each call reads, adds and writes as one step that cannot be split, so the second call always starts from the first one’s result.',
            },
            frames: [
              { now: 0, say: 'Both threads add one like. First with a plain <code>likes++</code>, then with <code>incrementAndGet()</code>.' },
              { bars: [{ lane: 0, from: 0, to: 2, label: 'read 0' }, { lane: 1, from: 2, to: 4, label: 'read 0', tone: 'warm' }], say: 'Top two rows, plain <code>likes++</code>: both threads can read 0 before either one writes.' },
              { bars: [{ lane: 0, from: 4, to: 6, label: 'write' }, { lane: 1, from: 6, to: 8, label: 'write', tone: 'warm' }], marks: [{ at: 8, label: 'lost', tone: 'err' }], say: 'Both write 1. One like is lost, as in the race lesson.' },
              { bars: [{ lane: 2, from: 0, to: 4, label: '0 → 1', tone: 'ok' }], say: 'Bottom two rows, <code>AtomicInteger</code>, again from 0. Ada’s thread calls <code>incrementAndGet()</code>: read, add and write happen as one step, 0 → 1.' },
              { bars: [{ lane: 3, from: 4, to: 8, label: '1 → 2', tone: 'ok' }], say: 'Sam’s call cannot land in the middle of Ada’s. It starts from 1 and makes 2.' },
              { now: 8, say: 'Both likes counted, and no thread had to wait at a lock.' },
            ],
          });
        },
        code: `import java.util.concurrent.atomic.AtomicInteger
import kotlin.concurrent.thread

fun main() {
    val likes = AtomicInteger(0)
    val ada = thread { for (i in 1..100000) likes.incrementAndGet() }
    val sam = thread { for (i in 1..100000) likes.incrementAndGet() }
    ada.join()
    sam.join()
    println(likes.get())   // 200000, every time
}`,
        play: `import java.util.concurrent.atomic.AtomicInteger
import kotlin.concurrent.thread

data class Song(val title: String, val minutes: Int)

fun main() {
    val plays = AtomicInteger(0)      // shared and changing: atomic
    val song = Song("Rain", 4)        // shared but never changes: immutable

    val ada = thread {
        var mine = 0                  // confined: only Ada's thread uses it
        for (i in 1..50000) {
            plays.incrementAndGet()
            mine++
        }
        println("Ada played \${song.title} $mine times")
    }
    val sam = thread {
        var mine = 0                  // a different box, only Sam's
        for (i in 1..50000) {
            plays.incrementAndGet()
            mine++
        }
        println("Sam played \${song.title} $mine times")
    }
    ada.join()
    sam.join()
    println("Total plays: \${plays.get()}")
}`,
        remember: 'First try not sharing (confinement) or not changing (immutable data). For a shared counter use AtomicInteger. Use a lock for the rest.',
        mistakes: [
          { title: 'Thinking val makes a list immutable', bad: `val names = mutableListOf("Ada")   // val, but the list can change
// thread 1: names.add("Sam")
// thread 2: names.add("Lin")`, good: `val names = listOf("Ada", "Sam", "Lin")   // can never change
// any number of threads can read it`, why: '<code>val</code> only means the name always points to the same list. A mutable list can still be changed by two threads at once. A list from <code>listOf</code> cannot be changed at all.' },
        ],
        terms: [
          { term: 'atomic', def: 'Done as one step that cannot be split, so no other thread sees it half done. <code>incrementAndGet()</code> is atomic.' },
          { term: 'immutable', def: 'Can never change after it is made, like a data class with only <code>val</code> properties.' },
          { term: 'confinement', def: 'Keeping a value inside one thread, so no other thread can touch it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Count plays from many threads without a lock.', code: `import java.util.concurrent.atomic.AtomicInteger

val plays = [[AtomicInteger]](0)

fun onPlay() {
    plays.[[incrementAndGet]]()
}`, why: '<code>AtomicInteger</code> holds the shared number, and <code>incrementAndGet()</code> adds 1 in one step that cannot be split.' },
          { type: 'bug', prompt: '<code>likes.set(x)</code> writes a new value. This should print 200000, but it often prints less. Tap the line to fix.', code: `import java.util.concurrent.atomic.AtomicInteger
import kotlin.concurrent.thread

fun main() {
    val likes = AtomicInteger(0)
    val ada = thread { for (i in 1..100000) likes.incrementAndGet() }
    val sam = thread { for (i in 1..100000) likes.set(likes.get() + 1) }
    ada.join()
    sam.join()
    println(likes.get())
}`, bug: 6, fix: '    val sam = thread { for (i in 1..100000) likes.incrementAndGet() }', why: '<code>get()</code> and then <code>set()</code> are two separate steps, with the same gap as <code>likes++</code>. Only one call like <code>incrementAndGet()</code> is atomic.' },
        ],
        quiz: [
          { q: 'Which can many threads read at the same time with no lock?', options: ['An object of <code>data class Song(val title: String)</code>', 'A list from <code>mutableListOf()</code> that threads add to', 'A <code>var count</code> that threads increase'], a: 0, why: 'With only <code>val</code> properties, the object can never change, so there is nothing to race.' },
          { q: 'What does <code>likes.incrementAndGet()</code> do?', options: ['Adds 1 in one step that cannot be split, and gives back the new value', 'Reads the value without changing it', 'Takes a lock and keeps it'], a: 0, why: 'It is the atomic version of <code>++</code>: read, add and write as one step.' },
          { q: 'A <code>var total = 0</code> is created inside one thread’s lambda, and only that thread uses it. Does it need a lock?', options: ['No, it is confined to one thread', 'Yes, every var needs a lock', 'Yes, unless it is <code>@Volatile</code>'], a: 0, why: 'Races need at least two threads touching the same value. A confined value has only one.' },
        ],
        docs: [['Java tutorial: Atomic variables', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/atomicvars.html'], ['Java tutorial: Immutable objects', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/immutable.html']],
      },
    ],
  });
})();
