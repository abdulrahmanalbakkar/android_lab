/* Concurrency fundamentals track. Same shape as tracks/kotlin.js.
   The theory a university operating systems / concurrency course covers (interleaving, races, locks, deadlock,
   the memory model, lock-free tools), then the Kotlin and Android form. The coroutines track builds on this.
   Every class is prefixed cc-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const label = text => h('span', { class: 'cc-label' }, text);
  const tag = (text, cls = '') => h('span', { class: `cc-tag ${cls}` }, text);
  // A row of pressed-state buttons. items: [{ text | src }]
  function picker(name, items, onPick, start = 0) {
    const btns = items.map((it, k) => (it.src ? cmd : act)(it.src || it.text, () => { press(btns, btns[k]); onPick(it, k); }));
    press(btns, btns[start]);
    return h('div', { class: 'controls' }, name ? label(name) : null, btns);
  }

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

  // Timeline: rows of cells, filled tick by tick. rows: [{ name, cells: [ 'A' | 'B' | '' ] }]
  function timeline(cols) {
    const root = h('div', { class: 'cc-tl', style: `--c:${cols}` });
    let cells = [];
    return {
      root,
      setRows(rows) {
        cells = [];
        root.replaceChildren(...rows.map(r => {
          const cs = Array.from({ length: cols }, () => h('span', { class: 'cc-tc' }));
          cells.push(cs);
          return h('div', { class: 'cc-tr' }, h('span', { class: 'cc-tn' }, r), h('div', { class: 'cc-tcs' }, cs));
        }));
      },
      fill(row, col, text, cls) { const c = cells[row][col]; c.textContent = text; c.className = `cc-tc ${cls}`; },
    };
  }

  const css = `
.cc-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cc-tag { font: 600 0.72rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); white-space: nowrap; }
.cc-tag.cc-ok { background: var(--ok-soft); color: var(--ok); }
.cc-tag.cc-warm { background: var(--warm-soft); color: var(--warm); }
.cc-tag.cc-err { background: var(--err-soft); color: var(--err); }
.cc-tag.cc-acc { background: var(--accent-soft); color: var(--accent); }
.cc-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.cc-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
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
.cc-hchip.cc-fail { border-color: var(--err); background: var(--err-soft); }

/* timeline */
.cc-tl { display: grid; gap: 6px; min-width: 0; }
.cc-tr { display: grid; grid-template-columns: 4.6em minmax(0, 1fr); gap: 8px; align-items: center; min-width: 0; }
.cc-tn { font: 600 0.74rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cc-tcs { display: grid; grid-template-columns: repeat(var(--c), minmax(0, 1fr)); gap: 3px; min-width: 0; }
.cc-tc { height: 28px; border-radius: 5px; background: var(--sunk); display: grid; place-items: center; font: 700 0.72rem var(--mono); color: var(--ink); min-width: 0; overflow: hidden; transition: background 0.2s; }
.cc-tc.cc-a { background: var(--accent-soft); box-shadow: inset 0 0 0 2px var(--accent); animation: cc-pop 0.3s ease-out; }
.cc-tc.cc-b { background: var(--warm-soft); box-shadow: inset 0 0 0 2px var(--warm); animation: cc-pop 0.3s ease-out; }
.cc-tc.cc-w { background: transparent; box-shadow: inset 0 0 0 1.5px var(--line); color: var(--muted); }
@keyframes cc-pop { from { transform: scale(0.6); } }

/* chips and boxes */
.cc-chip { font: 600 0.82rem var(--mono); padding: 4px 10px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); overflow-wrap: anywhere; }
.cc-chip.cc-acc { border-color: var(--accent); background: var(--accent-soft); }
.cc-chip.cc-warm { border-color: var(--warm); background: var(--warm-soft); }
.cc-chip.cc-ok { border-color: var(--ok); background: var(--ok-soft); }
.cc-chip.cc-err { border-color: var(--err); background: var(--err-soft); }
.cc-chip.cc-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.cc-in { animation: cc-pop 0.35s ease-out; }
.cc-box { display: grid; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.cc-box.cc-acc { border-color: var(--accent); }
.cc-box.cc-ok { border-color: var(--ok); }
.cc-box.cc-err { border-color: var(--err); background: var(--err-soft); }
.cc-box h4 { margin: 0; font: 700 0.86rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cc-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 10px; min-width: 0; }
.cc-val { font: 700 1rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cc-val.cc-stale { color: var(--err); }
.cc-val.cc-fresh { color: var(--ok); }
.cc-room { min-height: 54px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; border-radius: 12px; border: 2px dashed var(--accent); padding: 8px; min-width: 0; }
.cc-queue { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 36px; min-width: 0; }

/* philosophers */
.cc-svg { display: block; width: 100%; max-width: 320px; height: auto; margin: 0 auto; }
.cc-svg .cc-table { fill: var(--sunk); stroke: var(--line); stroke-width: 2; }
.cc-svg .cc-ph circle { fill: var(--surface); stroke: var(--muted); stroke-width: 3; transition: fill 0.25s, stroke 0.25s; }
.cc-svg .cc-ph.cc-eat circle { fill: var(--ok-soft); stroke: var(--ok); }
.cc-svg .cc-ph.cc-wait circle { fill: var(--warm-soft); stroke: var(--warm); }
.cc-svg .cc-ph.cc-dead circle { fill: var(--err-soft); stroke: var(--err); }
.cc-svg .cc-fk rect { fill: var(--surface); stroke: var(--ink); stroke-width: 2; transition: fill 0.25s; }
.cc-svg .cc-fk.cc-held rect { fill: var(--accent); stroke: var(--accent); }
.cc-svg .cc-hold { stroke: transparent; stroke-width: 4; stroke-linecap: round; transition: stroke 0.25s; }
.cc-svg .cc-hold.cc-has { stroke: var(--accent); }
.cc-svg .cc-hold.cc-want { stroke: var(--warm); stroke-dasharray: 5 5; }
.cc-svg .cc-hold.cc-cyc { stroke: var(--err); stroke-dasharray: 5 5; }
.cc-svg text { fill: var(--ink); font-family: var(--mono); text-anchor: middle; dominant-baseline: central; font-size: 13px; font-weight: 700; }
.cc-svg .cc-sub { font-size: 10px; font-weight: 600; fill: var(--muted); }
.cc-svg .cc-fk text { font-size: 10px; }
.cc-svg .cc-fk.cc-held text { fill: var(--accent-ink); }
.cc-stats { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 600 0.8rem var(--mono); color: var(--muted); }
.cc-stats b { color: var(--ink); }
.cc-cond { display: grid; gap: 6px; min-width: 0; }
.cc-cond .cmd { white-space: normal; text-align: left; font-family: var(--sans, inherit); }
`;

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  lessons.push({
    id: 'concurrency-parallelism',
    title: 'Concurrency vs parallelism',
    tagline: 'Concurrency is dealing with many things at once. Parallelism is doing many things at once.',
    level: 'beginner',
    body: `
<p>A program is <em>concurrent</em> when several tasks are in progress during the same period. On one CPU core, the operating system gets there by <em>interleaving</em>: it runs a thread for a few milliseconds, saves its state, and switches to another. Both tasks move forward, but at any instant only one runs.</p>
<p>A program is <em>parallel</em> when tasks run at the same instant on different cores. Parallelism needs hardware with several cores. Concurrency is a way to structure a program; parallelism is one way to run it. Every phone today has several cores, so your concurrent Kotlin code usually runs in parallel too.</p>
<p>Concurrency is hard for one reason: <em>you do not control the order</em>. The scheduler can switch threads between any two machine instructions, and the order changes from run to run. A bug that needs one rare order can pass every test and then show up on a user's phone. The rest of this track is about code that is correct in <em>every</em> order. The coroutines track (<a href="#coroutines.basics">Coroutines basics</a>) is built on top of these ideas.</p>`,
    code: `// Two tasks. Whether they interleave or run in parallel
// depends on the dispatcher and the number of cores.
suspend fun loadHome() = coroutineScope {
    val news = async(Dispatchers.IO) { api.headlines() }      // waits on the network
    val weather = async(Dispatchers.IO) { api.weather("London") }
    HomeScreen(news.await(), weather.await())
}

// CPU work: Dispatchers.Default has about one thread per core,
// so these two sorts can truly run at the same time.
suspend fun sortBoth(a: IntArray, b: IntArray) = coroutineScope {
    launch(Dispatchers.Default) { a.sort() }
    launch(Dispatchers.Default) { b.sort() }
}`,
    remember: 'Concurrency is about structure (tasks overlap in time). Parallelism is about hardware (tasks run at the same instant). Correct code must work for every interleaving.',
    visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['1 core', '2 cores: #1', '2 cores: #2'],
            span: 12,
            predict: {
              q: 'Two tasks need 6 ms of CPU work each. The phone has <b>one</b> core. When are both done?',
              options: ['At 6 ms: they run at the same time', 'At about 12 ms: they take turns', 'At 3 ms: the work is split in half'],
              a: 1,
              why: 'One core runs one thread at a time. Taking turns makes both tasks progress, but the total work is still 12 ms.',
            },
            frames: [
              { now: 0, say: 'Two tasks: <b>A</b> (sort the news) and <b>B</b> (sort the weather). Each needs 6 ms of CPU. First, one core.' },
              { bars: [{ lane: 0, from: 0, to: 2, label: 'A' }], say: 'The scheduler runs A for a time slice.' },
              { bars: [{ lane: 0, from: 2, to: 4, label: 'B', tone: 'warm' }], say: 'Then it saves A’s state and switches to B. Both are in progress: that is <em>concurrent</em>.' },
              { bars: [{ lane: 0, from: 4, to: 6, label: 'A' }, { lane: 0, from: 6, to: 8, label: 'B', tone: 'warm' }], say: 'Back and forth. You do not choose the order; the scheduler does, and it can change from run to run.' },
              { bars: [{ lane: 0, from: 8, to: 10, label: 'A' }, { lane: 0, from: 10, to: 12, label: 'B', tone: 'warm' }], say: 'Both finish at 12 ms. They never ran at the same instant: concurrent, not parallel.' },
              { now: 6, bars: [{ lane: 1, from: 0, to: 6, label: 'A' }, { lane: 2, from: 0, to: 6, label: 'B', tone: 'warm' }], say: 'With two cores, A and B run at the same instant. That is <em>parallel</em>, and both finish at 6 ms.' },
            ],
          });
        },
    deeper: [
      {
        title: 'Process, thread, core',
        body: `<p>A <em>process</em> is a running program with its own memory. Your app is one Linux process. A <em>thread</em> is one line of execution inside a process. All threads of a process share the same heap: that sharing is what makes them fast to talk to each other, and what makes them dangerous.</p>
<p>A <em>core</em> is the hardware that runs one thread at a time. The kernel's scheduler maps runnable threads onto cores. When there are more threads than cores, it time-slices. A <em>context switch</em> saves one thread's registers and loads another's; it costs time, which is one reason thousands of threads are a bad idea and coroutines exist.</p>`,
      },
      {
        title: 'Why it is hard: the order changes every run',
        body: `<p>Two threads each print three lines. Program order inside each thread is fixed, but how the lines mix is up to the scheduler. With 3 + 3 lines there are 20 possible orders. Run it a few times.</p>`,
        visual(el) {
          const outRow = h('div', { class: 'cc-row' });
          const seen = new Set();
          const st = h('div', { class: 'cc-stats' });
          const msg = out('Press Run. Thread A prints A1 A2 A3, thread B prints B1 B2 B3.');
          function run() {
            const a = ['A1', 'A2', 'A3'], b = ['B1', 'B2', 'B3'], res = [];
            while (a.length || b.length) res.push((!b.length || (a.length && Math.random() < 0.5) ? a : b).shift());
            outRow.replaceChildren(...res.map((x, k) => h('span', { class: `cc-chip cc-in ${x[0] === 'A' ? 'cc-acc' : 'cc-warm'}`, style: `animation-delay:${k * 50}ms` }, x)));
            const key = res.join(' ');
            const isNew = !seen.has(key); seen.add(key);
            st.innerHTML = `distinct orders seen: <b>${seen.size}</b> of 20`;
            say(msg, isNew ? 'A new order. Each thread kept its own order; only the mix changed.' : 'This order showed up before. Some orders are rare, and a bug that needs a rare order hides from tests.');
          }
          el.append(h('div', { class: 'cc-stage' }, outRow, st), h('div', { class: 'controls' }, act('Run', run)), msg);
          st.innerHTML = 'distinct orders seen: <b>0</b> of 20';
        },
      },
      {
        title: 'On Android: one main thread, a pool per job',
        body: `<p>Android gives your app one <em>main thread</em>. It draws the UI and handles input, and the UI toolkit is not thread-safe, so only the main thread may touch views. Block it for a few seconds and the system shows an ANR dialog (see <a href="#perf.main-thread">Keep the main thread free</a>).</p>
<p>Everything else goes to background threads. In coroutines, <code>Dispatchers.Default</code> is for CPU work; its pool has as many threads as there are CPU cores, and at least two. <code>Dispatchers.IO</code> is for blocking I/O and allows many more threads, because they spend most of their time waiting. <a href="#coroutines.dispatchers">Dispatchers</a> covers the details.</p>`,
        code: `lifecycleScope.launch {                       // main thread
    val bitmap = withContext(Dispatchers.Default) {
        decodeAndResize(bytes)                    // CPU work, on a pool thread
    }
    imageView.setImageBitmap(bitmap)              // back on main: touch the UI
}`,
      },
    ],
    underHood: {
      body: `<p>A thread on the JVM (and on ART) is a real OS thread with its own stack, often around 1 MB of reserved address space. The Linux scheduler decides which thread runs on which core and preempts them on a timer or when they block on I/O, a lock or <code>sleep</code>. A coroutine is not a thread: it is an object holding a suspended computation, and a dispatcher runs many coroutines on a few threads. When a coroutine suspends, its thread is free to run another one.</p>`,
    },
    mistakes: [
      { title: 'Expecting more threads to make CPU work faster', bad: '// 64 threads to sort 64 chunks on an 8-core phone\nval pool = Executors.newFixedThreadPool(64)', good: '// CPU-bound work: about one thread per core\nchunks.map { async(Dispatchers.Default) { it.sorted() } }.awaitAll()', why: 'Past the number of cores, extra threads cannot run at the same instant. They only add context switches and memory. Use more threads only for work that waits, like network calls.' },
      { title: '"It worked when I ran it"', bad: '// Ran the test 10 times, always passed.\n// Ship it.', good: '// Reason about every interleaving, or remove the\n// shared mutable state so order no longer matters.', why: 'A concurrency bug can need an order that shows up once in a million runs. Passing tests do not prove there is no race; only a design that is safe in every order does.' },
    ],
    terms: [
      { term: 'Concurrency', def: 'Several tasks in progress over the same period, whether or not they run at the same instant.' },
      { term: 'Parallelism', def: 'Several tasks running at the same instant on different cores.' },
      { term: 'Interleaving', def: 'One possible order in which the steps of several threads are mixed together by the scheduler.' },
      { term: 'Context switch', def: 'The scheduler saving one thread’s state and loading another’s so a core can run it.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Pick the dispatcher for each job.', code: 'withContext(Dispatchers.[[Default]]) { image.blur(radius = 8) }   // CPU work\nwithContext(Dispatchers.[[IO]]) { file.readBytes() }               // blocking I/O\nwithContext(Dispatchers.[[Main]]) { title.text = "Ready" }        // touch the UI', why: 'CPU work goes to Default (about one thread per core), blocking I/O to IO, and UI changes to Main, because the UI toolkit is not thread-safe.' },
      { type: 'bug', prompt: 'This freezes the screen while the file loads. Tap the line that causes it.', code: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    val text = File(filesDir, "news.json").readText()\n    render(text)\n}', bug: 2, fix: '    lifecycleScope.launch { val text = withContext(Dispatchers.IO) { File(filesDir, "news.json").readText() }; render(text) }', why: '<code>onCreate</code> runs on the main thread. Reading a file there blocks drawing and input until it finishes. Move the read to <code>Dispatchers.IO</code> and come back to main to render.' },
    ],
    quiz: [
      { q: 'A phone with one core runs two threads that each make progress over the same second. What is this?', options: ['Concurrency without parallelism', 'Parallelism without concurrency', 'Neither'], a: 0, why: 'The tasks overlap in time (concurrency), but one core can only run one at a time, so there is no parallelism.' },
      { q: 'Two CPU-bound tasks each take 1 second on one core. Roughly how long do they take together on 1 core, interleaved, and on 2 cores?', options: ['2 s on 1 core, about 1 s on 2 cores', '1 s on both', '2 s on both'], a: 0, why: 'Interleaving does not create CPU time: one core still has 2 seconds of work. Two cores can run both at once.' },
      { q: 'Why can a race condition pass 1,000 test runs and still be a bug?', options: ['The scheduler may produce the bad interleaving only rarely', 'Tests always run on one thread', 'Races only happen in release builds'], a: 0, why: 'The order of steps between threads changes from run to run. A bad order can be rare but still possible, so it appears on some user’s phone.' },
      { q: 'You want to download 20 images. Which choice fits?', options: ['Dispatchers.IO, because the threads mostly wait on the network', 'Dispatchers.Default, because there is one thread per core', 'Dispatchers.Main, because the images go on screen'], a: 0, why: 'Downloads spend their time waiting, so more threads than cores helps. IO allows that; Default is sized for CPU work and Main must stay free.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  const incLines = locked => [
    ...(locked ? [{ src: 'lock.lock()', exec(th, sh) {
      if (sh.owner && sh.owner !== th.name) return { block: true, msg: `${th.name} is blocked: ${sh.owner} holds the lock. Run ${sh.owner} instead.` };
      sh.owner = th.name; return { msg: `${th.name} takes the lock and enters the critical section.` };
    } }] : []),
    { src: 'val r = count', exec(th, sh) { th.loc.r = sh.count; return { msg: `${th.name} reads count (${sh.count}) into its own register r.` }; } },
    { src: 'val n = r + 1', exec(th) { th.loc.n = th.loc.r + 1; return { msg: `${th.name} computes ${th.loc.r} + 1 = ${th.loc.n}. Memory has not changed.` }; } },
    { src: 'count = n', exec(th, sh) { const old = sh.count; sh.count = th.loc.n; return { msg: old === th.loc.n ? `${th.name} writes ${th.loc.n}, but count was already ${old}. Its +1 just overwrote the other thread's +1.` : `${th.name} writes ${th.loc.n} to count.` }; } },
    ...(locked ? [{ src: 'lock.unlock()', exec(th, sh) { sh.owner = null; return { msg: `${th.name} releases the lock.` }; } }] : []),
  ];
  const incCfg = locked => ({
    names: ['T1', 'T2'],
    lines: incLines(locked),
    init: () => ({ count: 0, owner: null }),
    mem: sh => `<span>count = <b>${sh.count}</b></span>${locked ? `<span class="cc-tag ${sh.owner ? 'cc-acc' : ''}">lock: ${sh.owner ? 'held by ' + sh.owner : 'free'}</span>` : ''}`,
    local: th => th.loc.r === undefined ? 'r = ?' : `r = <b>${th.loc.r}</b>${th.loc.n === undefined ? '' : ` · n = <b>${th.loc.n}</b>`}`,
    verdict: sh => sh.count === 2 ? '<span class="good">Both done: count = 2. Correct.</span>' : '<span class="bad">Both done: count = 1. Lost update: both threads read 0, so one +1 vanished.</span>',
    intro: locked ? 'Same code, now inside lock() / unlock(). Try to break it: run T1 once, then T2.' : 'Two threads both run count++, split into its three real steps. You are the scheduler: pick who runs next. Can you end with count = 1?',
  });

  lessons.push({
    id: 'race-conditions',
    title: 'Race conditions and critical sections',
    tagline: 'count++ is three steps, and another thread can run between any two of them.',
    level: 'intermediate',
    body: `
<p>A <em>race condition</em> is a bug where the result depends on the timing of threads. The classic one is <code>count++</code>. It looks like one step, but the CPU does three: read <code>count</code> into a register, add 1, write it back. This is a <em>read-modify-write</em>. If two threads both read 0 before either writes, both write 1, and one increment is lost.</p>
<p>The code that touches shared data and must not be interleaved is a <em>critical section</em>. To make it safe, it must be <em>atomic</em>: other threads see either none of it or all of it, never the middle. A lock, an atomic variable or keeping the data on one thread are the three ways to get there.</p>
<p>A <em>data race</em> is the narrow, formal version: two threads access the same variable, at least one writes, and nothing orders the accesses. In the demo you are the scheduler. Try to lose an update, then turn on the lock and try again. <a href="#coroutines.shared-state">Shared mutable state</a> shows the same bug with coroutines.</p>`,
    code: `class ArticleStats {
    private var reads = 0
    private val lock = Any()

    // Broken: read-modify-write from many threads
    fun onReadUnsafe() { reads++ }

    // Fixed: the whole read-modify-write is one critical section
    fun onRead() = synchronized(lock) { reads++ }

    fun total(): Int = synchronized(lock) { reads }
}

// A check-then-act race: two threads can both see null
// and both run the expensive load.
private var cache: Config? = null
fun configUnsafe(): Config = cache ?: load().also { cache = it }

// Kotlin's lazy is synchronized by default: load() runs once.
val config: Config by lazy { load() }`,
    remember: 'A read-modify-write on shared data is not atomic. Make the whole critical section atomic, not just each line.',
    visual(el) {
      const box = h('div', { class: 'cc-stage' });
      const sw = h('input', { type: 'checkbox', id: 'cc-race-lock', onchange() { box.replaceChildren(); stepper(box, incCfg(this.checked)); } });
      el.append(h('label', { class: 'cc-row', for: 'cc-race-lock' }, sw, h('span', {}, 'Guard count++ with a lock')), box);
      stepper(box, incCfg(false));
    },
        predict: {
          q: 'There is no lock. You are the scheduler and can pick which thread runs its next step. Can you make two <code>count++</code> calls end with count = 1?',
          options: ['No: <code>count++</code> is a single step', 'Yes: let both threads read before either one writes', 'Only on a device with one core'],
          a: 1,
          why: '<code>count++</code> is read, add, write. If both threads read the same old value, both write the same new value, and one increment is lost. One core is enough: a switch between the read and the write does it.',
        },
        play: `import kotlin.concurrent.thread

var count = 0
val lock = Any()

fun main() {
    val threads = List(4) {
        thread {
            repeat(100_000) {
                count++                    // try: synchronized(lock) { count++ }
            }
        }
    }
    threads.forEach { it.join() }
    println("count = $count, expected 400000")
}`,
    deeper: [
      {
        title: 'What a correct critical section needs',
        body: `<p>Operating systems courses list three requirements for any solution to the critical section problem:</p>
<ul><li><b>Mutual exclusion</b>: at most one thread is inside at a time.</li><li><b>Progress</b>: if nobody is inside and someone wants in, someone gets in; the choice cannot be put off forever.</li><li><b>Bounded waiting</b>: once a thread asks, there is a limit to how many others can enter before it. Without this a thread can starve.</li></ul>
<p>A lock gives mutual exclusion. Whether it also gives bounded waiting depends on its fairness, which the next lesson covers.</p>`,
      },
      {
        title: 'Count the bad schedules',
        body: `<p>Each thread has 3 steps, so there are 6!/(3!·3!) = 20 ways to interleave them. An update is lost unless one thread finishes its write before the other reads. Only 2 of the 20 schedules do that. Press the button to check all of them.</p>`,
        visual(el) {
          const grid = h('div', { class: 'cc-row' });
          const st = h('div', { class: 'cc-stats' });
          const msg = out('Press "Try all 20" to run every interleaving of the two increments.');
          const all = [];
          (function gen(a, b, s) { if (!a && !b) { all.push(s); return; } if (a) gen(a - 1, b, s + '1'); if (b) gen(a, b - 1, s + '2'); })(3, 3, '');
          const run = async () => {
            grid.replaceChildren(); let ok = 0;
            for (const s of all) {
              const pc = { 1: 0, 2: 0 }, r = {}; let count = 0;
              for (const c of s) { const p = pc[c]++; if (p === 0) r[c] = count; else if (p === 2) count = r[c] + 1; }
              const good = count === 2; ok += good;
              grid.append(h('span', { class: `cc-chip cc-in ${good ? 'cc-ok' : 'cc-err'}`, title: `count = ${count}` }, s.replace(/1/g, 'A').replace(/2/g, 'B')));
              st.innerHTML = `correct: <b>${ok}</b> · lost update: <b>${grid.children.length - ok}</b>`;
              await sleep(70);
              if (!el.isConnected) return;
            }
            say(msg, 'Only AAABBB and BBBAAA give 2. The other 18 lose an update. The fast "all of A, then all of B" orders are what you usually see in testing, which is why the bug hides.');
          };
          el.append(h('div', { class: 'cc-stage' }, grid, st), h('div', { class: 'controls' }, act('Try all 20', run)), msg);
        },
      },
      {
        title: 'Check-then-act is a race too',
        body: `<p>Races are not only about counters. <code>if (x == null) x = create()</code> reads, decides, and writes. Two threads can both see <code>null</code> and both create. The same goes for "if the file does not exist, create it" or "if the map has no key, put one". Make the check and the act one atomic step: a lock around both, <code>by lazy</code>, <code>ConcurrentHashMap.computeIfAbsent</code>, or <code>MutableStateFlow.update { }</code>.</p>`,
        code: `val sessions = ConcurrentHashMap<String, Session>()

// Racy: two threads can both miss and both create
fun sessionUnsafe(id: String) = sessions[id] ?: Session(id).also { sessions[id] = it }

// Atomic check-then-act
fun session(id: String) = sessions.computeIfAbsent(id) { Session(it) }`,
      },
    ],
    underHood: {
      body: `<p>On ARM64, which nearly every Android phone uses, <code>count++</code> on a field compiles to roughly a load, an add and a store: three instructions. Even if the CPU had a single "increment memory" instruction, the JIT is free to keep <code>count</code> in a register across several increments, so you can never count on a plain <code>++</code> being atomic. The JVM's answer is <code>AtomicInteger</code>, which uses special atomic instructions; lesson 6 shows how.</p>`,
      code: `// What count++ means, written out
val r = this.count      // load
val n = r + 1           // add
this.count = n          // store`,
    },
    mistakes: [
      { title: 'Locking each step instead of the whole operation', bad: 'fun withdraw(amount: Int) {\n    val ok = synchronized(lock) { balance >= amount }\n    if (ok) synchronized(lock) { balance -= amount }\n}', good: 'fun withdraw(amount: Int) = synchronized(lock) {\n    if (balance >= amount) balance -= amount\n}', why: 'Between the two locked blocks another thread can withdraw too, and the balance goes negative. The check and the change belong to one critical section.' },
      { title: 'Thinking a thread-safe collection makes your logic safe', bad: 'val seen = Collections.synchronizedList(mutableListOf<String>())\nif (id !in seen) seen.add(id)   // two calls, two lock grabs', good: 'val seen = ConcurrentHashMap.newKeySet<String>()\nseen.add(id)                    // one atomic call, returns false if present', why: 'Each call on a synchronized collection is atomic, but a sequence of calls is not. Use one method that does the whole job.' },
    ],
    terms: [
      { term: 'Race condition', def: 'A bug where the result depends on how the steps of threads happen to interleave.' },
      { term: 'Data race', def: 'Two threads access the same variable, at least one writes, and no synchronization orders the accesses.' },
      { term: 'Critical section', def: 'Code that touches shared state and must not run in more than one thread at a time.' },
      { term: 'Atomic', def: 'Happening as one indivisible step: other threads see the state before or after, never in between.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make the increment atomic with a lock object.', code: 'private val lock = Any()\nprivate var likes = 0\n\nfun like() = [[synchronized]](lock) { [[likes++]] }', why: '<code>synchronized(lock) { }</code> runs the block while holding the lock’s monitor, so the read, add and write happen as one step for every thread using the same lock.' },
      { type: 'bug', prompt: 'Two threads call <code>reserve()</code> for the last seat. Both succeed. Tap the line that lets it happen.', code: 'fun reserve(): Boolean {\n    if (synchronized(lock) { seatsLeft } == 0) return false\n    synchronized(lock) { seatsLeft-- }\n    return true\n}', bug: 1, fix: '    synchronized(lock) { if (seatsLeft == 0) return false; seatsLeft-- }', why: 'The check runs in one critical section and the decrement in another. Both threads can pass the check before either decrements. The check and the act must share one lock block.' },
    ],
    quiz: [
      { q: 'count starts at 0. T1 reads 0. T2 reads 0, adds 1, writes 1. T1 adds 1 and writes. What is count?', options: ['1', '2', '0'], a: 0, why: 'T1 computed 0 + 1 from its stale read and wrote 1 over T2’s 1. One increment is lost.' },
      { q: 'Which of these is a check-then-act race?', options: ['<code>if (cache == null) cache = load()</code> from two threads', '<code>val x = list.size</code> on one thread', '<code>val y = 1 + 2</code>'], a: 0, why: 'Both threads can see null before either assigns, so both run <code>load()</code>. The other two have no shared state changing under them.' },
      { q: 'A thread-safe map is used like <code>if (!map.containsKey(k)) map.put(k, v)</code>. Is it safe?', options: ['No, two calls can interleave; use putIfAbsent or computeIfAbsent', 'Yes, the map is thread-safe', 'Only on one core'], a: 0, why: 'Each method is atomic on its own, but another thread can put between <code>containsKey</code> and <code>put</code>. One atomic method does both.' },
      { q: 'Which requirement does a lock that lets one thread win every time break?', options: ['Bounded waiting', 'Mutual exclusion', 'Atomicity'], a: 0, why: 'Only one thread is inside at a time, so mutual exclusion holds. But a waiting thread may never get in, so there is no bound on its wait.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  lessons.push({
    id: 'locks',
    title: 'Locks and mutual exclusion',
    tagline: 'One thread in, everyone else waits: synchronized, ReentrantLock and Mutex.',
    level: 'intermediate',
    body: `
<p>A <em>lock</em> (or mutex, for mutual exclusion) guards a critical section. A thread calls <code>lock()</code> before it enters and <code>unlock()</code> when it leaves. While one thread holds the lock, others that call <code>lock()</code> wait. On the JVM you have three common forms: <code>synchronized(obj) { }</code>, which uses the object's built-in monitor; <code>ReentrantLock</code> from <code>java.util.concurrent.locks</code>, with extras like <code>tryLock</code> and fairness; and, in coroutines, <code>Mutex</code>, which suspends instead of blocking the thread.</p>
<p>Two properties matter. A <em>reentrant</em> lock lets the thread that holds it lock it again (it keeps a hold count); <code>synchronized</code> and <code>ReentrantLock</code> are reentrant, but Kotlin's <code>Mutex</code> is not, so locking it twice from the same coroutine waits forever. A <em>fair</em> lock hands itself to the thread that waited longest. <code>ReentrantLock(true)</code> is fair; the default is not, which gives more throughput but no order guarantee.</p>
<p>Keep critical sections short, never do slow I/O or call unknown code while holding a lock, and always release in a <code>finally</code> (<code>withLock</code> and <code>synchronized</code> do that for you).</p>`,
    code: `class Favorites {
    private val lock = ReentrantLock()
    private val ids = mutableSetOf<Long>()

    fun toggle(id: Long) = lock.withLock {          // kotlin.concurrent.withLock
        if (!ids.add(id)) ids.remove(id)
    }

    // Give up instead of waiting forever
    fun snapshotOrNull(): Set<Long>? =
        if (lock.tryLock(50, TimeUnit.MILLISECONDS)) {
            try { ids.toSet() } finally { lock.unlock() }
        } else null
}

// In coroutines: suspend while waiting, keep the thread free
class Downloads {
    private val mutex = Mutex()
    private val done = mutableListOf<String>()
    suspend fun markDone(name: String) = mutex.withLock { done += name }
}`,
    remember: 'Lock the whole critical section, keep it short, release in finally. synchronized and ReentrantLock are reentrant; Mutex is not.',
    visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['T1', 'T2', 'T3'],
            span: 14,
            predict: {
              q: 'The lock is <code>ReentrantLock(true)</code>. T2 has waited since 1 ms, T3 since 4 ms. T1 unlocks for the last time. Who enters next?',
              options: ['T2', 'T3', 'Both at once', 'No promise: any waiter may win'],
              a: 0,
              why: 'A fair lock grants access to the thread that has waited longest. The default <code>ReentrantLock()</code> makes no such promise.',
            },
            frames: [
              { now: 0, say: 'Three threads share one <code>ReentrantLock(true)</code>, a fair lock. Only the holder may run the critical section. Bar labels show T1’s hold count.' },
              { bars: [{ lane: 0, from: 0, to: 3, label: '×1' }, { lane: 1, from: 1, to: 3, tone: 'muted' }], say: 'T1 calls <code>lock()</code> on a free lock and enters. Hold count 1. At 1 ms T2 calls <code>lock()</code>, finds it held, and is parked.' },
              { bars: [{ lane: 0, from: 3, to: 6, label: '×2', tone: 'warm' }, { lane: 1, from: 3, to: 6, label: 'wait', tone: 'muted' }, { lane: 2, from: 4, to: 6, tone: 'muted' }], say: 'T1 calls a helper that locks again. The lock is reentrant, so T1 does not wait: the hold count goes to 2. At 4 ms T3 arrives and parks behind T2.' },
              { bars: [{ lane: 0, from: 6, to: 8, label: '×1' }, { lane: 1, from: 6, to: 8, tone: 'muted' }, { lane: 2, from: 6, to: 8, tone: 'muted' }], say: 'The helper unlocks. Hold count 1: T1 still holds the lock, so nobody else can enter.' },
              { bars: [{ lane: 1, from: 8, to: 11, label: 'holds', tone: 'ok' }, { lane: 2, from: 8, to: 11, label: 'wait', tone: 'muted' }], say: 'T1 unlocks again. Count 0, the lock is free. The fair lock hands it to the longest waiter, T2.' },
              { bars: [{ lane: 2, from: 11, to: 14, label: 'holds', tone: 'ok' }], say: 'T2 unlocks and T3 enters. At every moment exactly one thread was inside. With the default, non-fair lock, T3 could have gone before T2.' },
            ],
          });
        },
        play: `import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread
import kotlin.concurrent.withLock

val lock = ReentrantLock(true)    // fair. Try ReentrantLock(): then no order is promised

fun log(msg: String) = println("\${Thread.currentThread().name}: $msg, holdCount = \${lock.holdCount}")

fun save() = lock.withLock { log("inside save()") }

fun main() {
    val workers = lock.withLock {
        log("main locked")
        save()                         // the same thread locks again: reentrant
        val started = (1..3).map { n ->
            thread(name = "T$n") { lock.withLock { log("got the lock") } }
                .also { Thread.sleep(50) }   // T1 waits longest, then T2, then T3
        }
        log("main unlocking")
        started
    }
    workers.forEach { it.join() }
    println("free again, tryLock() = \${lock.tryLock()}")
}`,
    deeper: [
      {
        title: 'synchronized or ReentrantLock?',
        body: `<p><code>synchronized</code> is the simplest: the lock is released automatically when the block ends, even on an exception. Use <code>ReentrantLock</code> when you need what <code>synchronized</code> lacks: <code>tryLock()</code> to give up instead of waiting, a timeout, <code>lockInterruptibly()</code>, a fair ordering, or several <code>Condition</code>s. With a <code>ReentrantLock</code> you must unlock yourself, so always put <code>unlock()</code> in <code>finally</code>, or use Kotlin's <code>withLock</code> extension.</p>
<p>One detail from the Javadoc: the plain <code>tryLock()</code> ignores fairness and takes a free lock even when others are waiting. Use <code>tryLock(0, TimeUnit.SECONDS)</code> to respect it.</p>`,
        code: `val lock = ReentrantLock(true)       // fair: longest waiter goes first
lock.lock()
try {
    updateCache()
} finally {
    lock.unlock()                     // runs even if updateCache() throws
}`,
      },
      {
        title: 'Lock granularity',
        body: `<p>One big lock is easy to get right but makes every thread wait, even when they touch unrelated data. Many small locks (for example one per bucket, called <em>lock striping</em>) let threads that touch different data run in parallel, at the cost of more complexity and a higher chance of deadlock if one operation needs two of them. Run four updates both ways.</p>`,
        visual(el) {
          const tl = timeline(4);
          const msg = out('');
          let fine = false, sameKey = false, tok = 0;
          const KEYS = ['news', 'sports', 'weather', 'stocks'];
          async function run() {
            const t = ++tok;
            tl.setRows(['T1', 'T2', 'T3', 'T4']);
            const keys = sameKey ? ['news', 'news', 'news', 'news'] : KEYS;
            // time slot for each thread
            const slot = [], busy = {};
            keys.forEach((k, i) => { const lockId = fine ? k : 'all'; busy[lockId] = (busy[lockId] ?? -1) + 1; slot[i] = busy[lockId]; });
            const end = Math.max(...slot) + 1;
            for (let c = 0; c < end; c++) {
              keys.forEach((k, i) => { if (slot[i] === c) tl.fill(i, c, k.slice(0, 2), i % 2 ? 'cc-b' : 'cc-a'); else if (slot[i] > c) tl.fill(i, c, '…', 'cc-w'); });
              await sleep(380);
              if (t !== tok || !el.isConnected) return;
            }
            say(msg, `${fine ? 'One lock per key' : 'One lock for the map'}, ${sameKey ? 'all on the same key' : 'four different keys'}: ${end} tick${end > 1 ? 's' : ''}. ${!fine && !sameKey ? 'Threads waited for data they never shared.' : fine && !sameKey ? 'No one waited: different keys, different locks.' : 'Same key, same lock: finer locks cannot help real contention.'}`);
          }
          el.append(picker('locks', [{ text: 'One lock for the map' }, { text: 'One lock per key' }], (_, k) => { fine = k === 1; run(); }),
            picker('updates', [{ text: 'Different keys' }, { text: 'Same key' }], (_, k) => { sameKey = k === 1; run(); }),
            h('div', { class: 'cc-stage' }, tl.root), msg);
          run();
        },
      },
      {
        title: 'Mutex: a lock that suspends',
        body: `<p>In coroutine code, prefer <code>Mutex</code>. A thread lock parks the whole thread while it waits; on <code>Dispatchers.Main</code> that freezes the UI, and on <code>Default</code> it takes a core away from other coroutines. <code>Mutex.lock()</code> suspends only the coroutine, so the thread goes on to run others. Do not hold a thread lock across a suspension point: the coroutine may resume on a different thread, and other threads stay blocked the whole time it is suspended.</p>
<p>Because <code>Mutex</code> is not reentrant, a function holding it must not call another function that takes the same mutex. Split the code into a public function that locks and a private one that assumes the lock is held.</p>`,
        code: `private val mutex = Mutex()
private val items = mutableListOf<Item>()

suspend fun add(item: Item) = mutex.withLock { addLocked(item) }
suspend fun addAll(list: List<Item>) = mutex.withLock { list.forEach(::addLocked) }

// Caller must hold mutex. Never call mutex.withLock in here.
private fun addLocked(item: Item) { items += item }`,
      },
    ],
    underHood: {
      body: `<p>An uncontended lock is cheap: the JVM claims it with one atomic compare-and-set on a word in the object header or lock object. Only when another thread already holds it does the waiter spin briefly and then get parked by the OS, which costs a system call and a context switch. That is why contention, not locking itself, is what makes locks slow. <code>ReentrantLock</code> is built on <code>AbstractQueuedSynchronizer</code>, which keeps waiting threads in a queue; fairness decides whether a newly arriving thread may jump that queue.</p>`,
    },
    mistakes: [
      { title: 'Forgetting to unlock on an exception', bad: 'lock.lock()\nsave(article)        // throws: lock is never released\nlock.unlock()', good: 'lock.withLock {\n    save(article)    // released in finally, even on throw\n}', why: 'If the code between lock and unlock throws, every later caller waits forever. Always unlock in <code>finally</code>, or use <code>withLock</code> / <code>synchronized</code>, which do it for you.' },
      { title: 'Locking on different objects', bad: 'fun add(x: Int) = synchronized(Any()) { total += x }   // a new lock each call', good: 'private val lock = Any()\nfun add(x: Int) = synchronized(lock) { total += x }', why: 'Mutual exclusion only holds between threads using the same lock. A fresh object per call means nobody ever waits, so nothing is protected.' },
      { title: 'Taking a Mutex twice', bad: 'suspend fun refresh() = mutex.withLock {\n    clear()          // clear() also calls mutex.withLock\n}', good: 'suspend fun refresh() = mutex.withLock {\n    clearLocked()    // private, assumes the lock is held\n}', why: '<code>Mutex</code> is non-reentrant: locking it again from the same coroutine suspends forever. <code>synchronized</code> would have allowed it, which is why this bug appears when porting code.' },
    ],
    terms: [
      { term: 'Mutex', def: 'Short for mutual exclusion: a lock that lets one holder at a time into a critical section.' },
      { term: 'Reentrant lock', def: 'A lock the current holder can take again; it counts holds and is free only after the same number of unlocks.' },
      { term: 'Fair lock', def: 'A lock that gives itself to the longest-waiting thread, trading throughput for no starvation.' },
      { term: 'Lock granularity', def: 'How much data one lock protects: one coarse lock, or many fine ones that allow more parallel work.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Release the lock even if <code>write()</code> throws.', code: 'lock.lock()\n[[try]] {\n    write(article)\n} [[finally]] {\n    lock.[[unlock]]()\n}', why: 'The <code>finally</code> block runs whether <code>write</code> returns or throws, so the lock is always released. This is the pattern the <code>ReentrantLock</code> Javadoc recommends.' },
      { type: 'bug', prompt: 'This coroutine code sometimes freezes forever. Tap the line that causes it.', code: 'private val mutex = Mutex()\nsuspend fun save(a: Article) = mutex.withLock { dao.insert(a) }\nsuspend fun saveAll(list: List<Article>) = mutex.withLock {\n    list.forEach { save(it) }\n}', bug: 3, fix: '    list.forEach { dao.insert(it) }', why: '<code>saveAll</code> holds the mutex and calls <code>save</code>, which tries to lock it again. <code>Mutex</code> is not reentrant, so the coroutine waits for itself.' },
    ],
    quiz: [
      { q: 'T1 holds a <code>ReentrantLock</code> and calls <code>lock()</code> again. What happens?', options: ['It succeeds and the hold count becomes 2', 'T1 deadlocks', 'It throws IllegalMonitorStateException'], a: 0, why: 'A reentrant lock lets its holder lock again and counts the holds. T1 must unlock twice before others can enter.' },
      { q: 'The same coroutine calls <code>mutex.lock()</code> twice on a Kotlin <code>Mutex</code>. What happens?', options: ['The second call suspends forever', 'The hold count goes to 2', 'It throws at once'], a: 0, why: 'The docs say Mutex is non-reentrant: locking it again even from the holder suspends the caller, which waits for a lock only it can release.' },
      { q: 'A map is updated by 8 threads on unrelated keys and the app is slow from lock contention. Which change fits best?', options: ['Use finer locks, such as one per key bucket, or a ConcurrentHashMap', 'Make the lock fair', 'Add more threads'], a: 0, why: 'Threads wait on data they do not share. Finer locks let them proceed in parallel. Fairness changes who goes next, not how many wait.' },
      { q: 'Why is a fair lock usually slower?', options: ['It must hand off to the queued waiter instead of letting a running thread grab it', 'It uses more memory per thread', 'It disables the JIT'], a: 0, why: 'A non-fair lock lets a thread that is already running take a free lock right away. A fair one wakes the longest waiter, which costs a context switch. The Javadoc warns fair locks are often much slower under contention.' },
      { q: 'You need to wait up to 100 ms for a lock and then give up. Which do you use?', options: ['<code>ReentrantLock.tryLock(100, TimeUnit.MILLISECONDS)</code>', '<code>synchronized</code>', '<code>@Volatile</code>'], a: 0, why: '<code>synchronized</code> waits as long as it takes. <code>tryLock</code> with a timeout returns false if the lock is not free in time.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  lessons.push({
    id: 'deadlock',
    title: 'Deadlock, livelock and starvation',
    tagline: 'Threads that wait for each other forever, and the four conditions that make it possible.',
    level: 'advanced',
    body: `
<p>A <em>deadlock</em> is a set of threads where each one waits for a lock another one holds, so none can move. The textbook case: T1 holds lock A and wants B, while T2 holds B and wants A. Nothing crashes. The threads just stop, and on the main thread that means an ANR (see <a href="#perf.anr">ANRs</a>).</p>
<p>Coffman and colleagues showed in 1971 that a deadlock needs all four of these at once: <b>mutual exclusion</b> (a resource has one owner), <b>hold and wait</b> (a thread keeps what it has while it waits for more), <b>no preemption</b> (nobody can take a lock away), and <b>circular wait</b> (a cycle of threads, each waiting on the next). Break any one and deadlock is impossible. The most practical fix is to break circular wait with a global <em>lock order</em>: every thread takes locks in the same order.</p>
<p>Two cousins: in <em>livelock</em> threads are not blocked but keep reacting to each other and never finish, like two people stepping aside in a corridor in the same direction. In <em>starvation</em> one thread could run but keeps losing to others. The demo is Dijkstra's dining philosophers: five threads, five forks, each needs two forks to eat.</p>`,
    code: `// Transfer between two accounts, each with its own lock.
// Broken: transfer(a, b) and transfer(b, a) at once can deadlock.
fun transferUnsafe(from: Account, to: Account, amount: Long) {
    synchronized(from) {
        synchronized(to) { from.balance -= amount; to.balance += amount }
    }
}

// Fixed: always lock the account with the smaller id first.
fun transfer(from: Account, to: Account, amount: Long) {
    val (first, second) = if (from.id < to.id) from to to else to to from
    synchronized(first) {
        synchronized(second) { from.balance -= amount; to.balance += amount }
    }
}`,
    remember: 'Deadlock needs mutual exclusion, hold and wait, no preemption and circular wait. Take locks in one global order to break the cycle.',
    visual(el) {
      const N = 5, C = 150, RP = 112, RF = 66;
      const ang = i => (-90 + i * 72) * Math.PI / 180;
      const fang = i => (-90 + i * 72 - 36) * Math.PI / 180;     // fork i sits between P(i-1) and P(i)
      const P = Array.from({ length: N }, (_, i) => ({ x: C + RP * Math.cos(ang(i)), y: C + RP * Math.sin(ang(i)) }));
      const F = Array.from({ length: N }, (_, i) => ({ x: C + RF * Math.cos(fang(i)), y: C + RF * Math.sin(fang(i)) }));
      const forksOf = i => [i, (i + 1) % N];                     // left, right
      let lines = '';
      for (let i = 0; i < N; i++) for (const f of forksOf(i)) lines += `<line class="cc-hold" data-l="${i}-${f}" x1="${P[i].x.toFixed(1)}" y1="${P[i].y.toFixed(1)}" x2="${F[f].x.toFixed(1)}" y2="${F[f].y.toFixed(1)}"/>`;
      const svg = `<svg class="cc-svg" viewBox="0 0 300 300" role="img" aria-label="Five philosophers around a table with five forks">
<circle class="cc-table" cx="${C}" cy="${C}" r="84"/>${lines}
${F.map((f, i) => `<g class="cc-fk" data-f="${i}"><rect x="${(f.x - 13).toFixed(1)}" y="${(f.y - 10).toFixed(1)}" width="26" height="20" rx="5"/><text x="${f.x.toFixed(1)}" y="${f.y.toFixed(1)}">F${i}</text></g>`).join('')}
${P.map((p, i) => `<g class="cc-ph" data-p="${i}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="22"/><text x="${p.x.toFixed(1)}" y="${(p.y - 5).toFixed(1)}">P${i}</text><text class="cc-sub" x="${p.x.toFixed(1)}" y="${(p.y + 9).toFixed(1)}">think</text></g>`).join('')}
</svg>`;
      const wrap = h('div', { html: svg });
      const gP = [...wrap.querySelectorAll('.cc-ph')], gF = [...wrap.querySelectorAll('.cc-fk')];
      const L = Object.fromEntries([...wrap.querySelectorAll('.cc-hold')].map(l => [l.dataset.l, l]));
      const st = h('div', { class: 'cc-stats' });
      const msg = out('');
      let ordered = false, fork, ph, tick, dead, tok = 0;
      const first = i => (ordered ? Math.min(...forksOf(i)) : forksOf(i)[0]);
      const second = i => (forksOf(i).find(f => f !== first(i)));
      function reset() {
        tok++;
        fork = Array(N).fill(null);
        ph = Array.from({ length: N }, () => ({ s: 'think', want: null, eat: 0, meals: 0, rest: 0 }));
        tick = 0; dead = false;
        paint();
        say(msg, ordered ? 'Lock order: everyone takes the lower-numbered fork first. P4 needs F4 and F0, so it reaches for F0 first. Step or Run.' : 'Naive: everyone takes the left fork, then the right. This schedule is the worst case: all five reach for the left fork at the same moment. Step or Run.');
      }
      function stepOnce() {
        if (dead) return false;
        tick++;
        let progress = false;
        for (let i = 0; i < N; i++) {
          const p = ph[i];
          if (p.s === 'rest') { if (--p.rest <= 0) p.s = 'think'; progress = true; continue; }
          if (p.s === 'eat') {
            if (--p.eat <= 0) { forksOf(i).forEach(f => { fork[f] = null; }); p.s = 'rest'; p.rest = 1; p.meals++; }
            progress = true; continue;
          }
          const want = p.s === 'think' ? first(i) : second(i);
          if (fork[want] === null) {
            fork[want] = i; p.want = null; progress = true;
            if (p.s === 'think') p.s = 'one'; else { p.s = 'eat'; p.eat = 2; }
          } else p.want = want;
        }
        if (!progress) dead = true;
        paint();
        const eating = ph.map((p, i) => (p.s === 'eat' ? 'P' + i : null)).filter(Boolean);
        if (dead) say(msg, '<span class="bad">Deadlock.</span> Every philosopher holds one fork and waits for the next one: a circular wait P0 → P1 → P2 → P3 → P4 → P0. No one will ever move again. Switch to lock order and run it again.');
        else if (tick === 1 && !ordered) say(msg, 'Tick 1: everyone picked up the left fork. Each now needs the fork its neighbor holds.');
        else say(msg, `Tick ${tick}: ${eating.length ? eating.join(', ') + ' eating.' : 'nobody eating this tick, but someone made progress.'}${ordered ? ' The ordering means at least one philosopher can always finish.' : ''}`);
        return !dead;
      }
      async function run() {
        const t = ++tok;
        for (let k = 0; k < 24; k++) {
          if (!stepOnce()) return;
          await sleep(420);
          if (t !== tok || !el.isConnected) return;
        }
      }
      function paint() {
        ph.forEach((p, i) => {
          const cls = dead ? 'cc-dead' : p.s === 'eat' ? 'cc-eat' : p.want != null ? 'cc-wait' : '';
          gP[i].setAttribute('class', `cc-ph ${cls}`);
          gP[i].querySelector('.cc-sub').textContent = p.s === 'eat' ? 'eat' : p.want != null ? 'wait' : p.s === 'one' ? '1 fork' : p.s === 'rest' ? 'full' : 'think';
          for (const f of forksOf(i)) L[`${i}-${f}`].setAttribute('class', `cc-hold ${fork[f] === i ? 'cc-has' : p.want === f ? (dead ? 'cc-cyc' : 'cc-want') : ''}`);
        });
        fork.forEach((o, f) => gF[f].setAttribute('class', `cc-fk ${o !== null ? 'cc-held' : ''}`));
        st.innerHTML = `tick <b>${tick}</b> · meals: <b>${ph.reduce((s, p) => s + p.meals, 0)}</b> · ${ph.map((p, i) => `P${i} <b>${p.meals}</b>`).join(' ')}`;
      }
      el.append(picker('strategy', [{ text: 'Left fork first' }, { text: 'Lower-numbered fork first' }], (_, k) => { ordered = k === 1; reset(); }),
        h('div', { class: 'cc-stage' }, wrap, st),
        h('div', { class: 'controls' }, act('Step', () => { tok++; stepOnce(); }), act('Run', run), act('Restart', reset)), msg);
      reset();
    },
        predict: {
          q: 'Every philosopher takes the left fork first, and all five reach for it at the same moment. What happens next?',
          options: ['They take turns eating', 'All five wait forever', 'The philosopher with the lowest number eats first'],
          a: 1,
          why: 'Each one holds one fork and waits for the fork its neighbor holds. That is a circular wait, and with locks that are never taken away nobody can move.',
        },
        play: `import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread

val a = ReentrantLock()
val b = ReentrantLock()

fun work(name: String, first: ReentrantLock, second: ReentrantLock) {
    first.lock()
    try {
        Thread.sleep(50)                     // the other thread takes its first lock now
        if (second.tryLock(500, TimeUnit.MILLISECONDS)) {
            try { println("$name: got both locks") } finally { second.unlock() }
        } else {
            println("$name: waited 500 ms for the second lock and gave up")
        }
    } finally {
        first.unlock()
    }
}

fun main() {
    val t1 = thread { work("T1", a, b) }
    val t2 = thread { work("T2", b, a) }     // change to work("T2", a, b): one lock order
    t1.join(); t2.join()
}`,
    deeper: [
      {
        title: 'Break one condition, any one',
        body: `<p>All four Coffman conditions must hold for a deadlock. Turn them off one at a time and see how each is broken in practice.</p>`,
        visual(el) {
          const C = [
            ['Mutual exclusion', 'Share without owning: immutable data, or lock-free atomics, so nobody has to hold anything.'],
            ['Hold and wait', 'Take every lock you need at once, or release what you hold before you wait for more.'],
            ['No preemption', 'Let a waiter give up: tryLock with a timeout, then release what it holds and retry later.'],
            ['Circular wait', 'One global lock order. If everyone takes A before B, no cycle can form.'],
          ];
          const on = C.map(() => true);
          const res = h('div', { class: 'cc-box' });
          const btns = C.map(([name], i) => act('', () => { on[i] = !on[i]; paint(i); }));
          function paint(changed) {
            btns.forEach((b, i) => { b.setAttribute('aria-pressed', String(on[i])); b.textContent = `${on[i] ? 'holds' : 'broken'}: ${C[i][0]}`; });
            const all = on.every(Boolean);
            res.className = `cc-box ${all ? 'cc-err' : 'cc-ok'}`;
            res.innerHTML = `<h4>${all ? 'Deadlock possible' : 'Deadlock impossible'}</h4><p class="cc-note">${changed != null && !on[changed] ? C[changed][1] : all ? 'All four conditions hold. Tap one to break it.' : 'At least one condition is broken.'}</p>`;
            if (changed != null) replay(res, 'pop-soft');
          }
          el.append(h('div', { class: 'cc-cond' }, btns), res);
          paint();
        },
      },
      {
        title: 'Livelock and starvation',
        body: `<p>A common deadlock "fix" is: try the second lock, and if it is taken, release the first and retry. If two threads do this in lockstep, they release and retry forever: a <em>livelock</em>. They are running, using CPU, and getting nothing done. The usual fix is a random back-off before retrying, so their timing drifts apart.</p>
<p><em>Starvation</em> is when one thread is always passed over: a non-fair lock that busy threads keep grabbing, or a low-priority thread that never gets the CPU. Fair locks and bounded queues help.</p>`,
        code: `fun <T> withBoth(a: ReentrantLock, b: ReentrantLock, block: () -> T): T {
    while (true) {
        a.lock()
        try {
            if (b.tryLock()) try { return block() } finally { b.unlock() }
        } finally { a.unlock() }
        Thread.sleep(Random.nextLong(1, 10))   // random back-off breaks the lockstep
    }
}`,
      },
      {
        title: 'The Android classic: blocking main while main is needed',
        body: `<p><code>runBlocking</code> on the main thread blocks it until the inner coroutine finishes. If that coroutine then needs the main thread, for example through <code>withContext(Dispatchers.Main)</code> or a callback posted to the main looper, it waits for a thread that is waiting for it. That is a two-party deadlock, and the user sees an ANR. Do not block the main thread; launch from <code>lifecycleScope</code> or <code>viewModelScope</code> instead.</p>`,
        code: `// Deadlock: main waits for the coroutine, the coroutine waits for main
override fun onResume() {
    super.onResume()
    runBlocking {
        val user = withContext(Dispatchers.IO) { repo.user() }
        withContext(Dispatchers.Main) { show(user) }    // main is blocked: never runs
    }
}`,
      },
    ],
    underHood: {
      body: `<p>The JVM does not prevent or break deadlocks, but it can find them after the fact. A thread dump (from Android Studio's debugger, or <code>jstack</code> on a desktop JVM) lists each thread's state and which monitor it is waiting for, and HotSpot marks monitor deadlocks it detects. <code>ThreadMXBean.findDeadlockedThreads()</code> does the same in code on a desktop JVM. On Android, the ANR traces file written when the system kills an unresponsive app contains the same kind of dump, so a "waiting to lock ... held by thread N" line there is the first thing to look for.</p>`,
    },
    mistakes: [
      { title: 'Locks taken in different orders in different places', bad: 'fun a() = synchronized(cacheLock) { synchronized(dbLock) { sync() } }\nfun b() = synchronized(dbLock) { synchronized(cacheLock) { flush() } }', good: '// Rule for the whole module: dbLock before cacheLock\nfun a() = synchronized(dbLock) { synchronized(cacheLock) { sync() } }\nfun b() = synchronized(dbLock) { synchronized(cacheLock) { flush() } }', why: 'If <code>a()</code> and <code>b()</code> run at once, each can hold the lock the other wants. One documented order everywhere removes the cycle.' },
      { title: 'Calling unknown code while holding a lock', bad: 'synchronized(lock) {\n    items += item\n    listeners.forEach { it.onChanged(items) }   // may take other locks\n}', good: 'val snapshot = synchronized(lock) { items += item; items.toList() }\nlisteners.forEach { it.onChanged(snapshot) }', why: 'A listener can take its own locks or call back into you, creating an order you never planned. Copy what you need under the lock and call out after releasing it.' },
    ],
    terms: [
      { term: 'Deadlock', def: 'A set of threads each waiting for a resource another one in the set holds, so none can proceed.' },
      { term: 'Coffman conditions', def: 'Mutual exclusion, hold and wait, no preemption and circular wait: all four are needed for deadlock.' },
      { term: 'Livelock', def: 'Threads keep running and reacting to each other but make no progress.' },
      { term: 'Starvation', def: 'A thread that could run is passed over again and again and never gets the resource.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Order the two locks by account id so every thread takes them in the same order.', code: 'val first = if (from.id [[<]] to.id) from else to\nval second = if (first === from) [[to]] else from\nsynchronized([[first]]) { synchronized(second) { move(from, to, amount) } }', why: 'Whichever direction the transfer goes, the account with the smaller id is locked first. Two transfers can no longer hold each other’s second lock, so circular wait cannot form.' },
      { type: 'bug', prompt: 'This sometimes freezes when <code>sync()</code> and <code>clear()</code> run on two threads at once. Tap the line that breaks the lock order.', code: 'fun sync() = synchronized(dbLock) {\n    synchronized(cacheLock) { copyDbToCache() }\n}\nfun clear() = synchronized(cacheLock) {\n    synchronized(dbLock) { wipeBoth() }\n}', bug: 3, fix: 'fun clear() = synchronized(dbLock) { synchronized(cacheLock) { wipeBoth() } }', why: '<code>sync</code> takes dbLock then cacheLock; <code>clear</code> takes them the other way round. Each thread can hold one and wait for the other. Use the same order in both.' },
    ],
    quiz: [
      { q: 'T1 holds A and waits for B. T2 holds B and waits for A. Which Coffman condition does a global lock order break?', options: ['Circular wait', 'Mutual exclusion', 'No preemption'], a: 0, why: 'If every thread takes A before B, no thread can hold B while waiting for A, so the cycle cannot form. The locks are still exclusive and still cannot be taken away.' },
      { q: 'Two threads use tryLock, release and retry immediately, in perfect lockstep. CPU is at 100% but nothing finishes. What is this?', options: ['Livelock', 'Deadlock', 'Starvation'], a: 0, why: 'The threads are not blocked: they keep running and backing off in reaction to each other. That is livelock. A random back-off breaks the lockstep.' },
      { q: 'You add a timeout to every lock acquisition and release held locks when it fires. Which condition does that break?', options: ['No preemption (and hold and wait)', 'Mutual exclusion', 'Circular wait'], a: 0, why: 'A thread that gives up and releases what it holds stops holding while waiting, which acts like letting the resource be taken back. The cycle can still form briefly but cannot last.' },
      { q: 'In the dining philosophers, what does "take the lower-numbered fork first" change?', options: ['P4 reaches for F0 before F4, so not everyone can hold their first fork while waiting', 'Each philosopher needs only one fork', 'Forks become shareable'], a: 0, why: 'P4 and P0 now compete for F0 first. One of them gets nothing, which leaves a fork free for a neighbor, so the circle of waits cannot close.' },
      { q: 'An ANR trace shows main "waiting to lock" a monitor held by a background thread, which is blocked waiting on main. What is the best fix?', options: ['Stop blocking main: make the call async and avoid waiting on main from that thread', 'Raise the thread priority', 'Make the lock fair'], a: 0, why: 'It is a two-thread deadlock. Fairness or priority cannot break a cycle. Removing the blocking wait on main removes one edge of it.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  lessons.push({
    id: 'memory-visibility',
    title: 'Memory visibility and the JVM memory model',
    tagline: 'A write on one thread is not guaranteed to be seen by another without a happens-before edge.',
    level: 'advanced',
    body: `
<p>Races are not the only problem. Even a single write can be <em>invisible</em> to another thread. CPUs keep values in registers and store buffers, the hardware reorders memory operations, and the JIT can keep a field in a register or move a read out of a loop. Inside one thread you never notice, because each thread sees its own actions in program order. Across threads, the Java Language Specification (chapter 17) explicitly lets compilers and CPUs reorder steps when this does not change the result for that thread alone.</p>
<p>The memory model gives you one tool to reason with: <em>happens-before</em>. If write W happens-before read R, then R sees W (or something later). The edges you use most come from JLS 17.4.5: an <b>unlock</b> of a monitor happens-before every later <b>lock</b> of that monitor; a write to a <b>volatile</b> field happens-before every later read of it; <code>Thread.start()</code> happens-before the actions in the started thread; and everything a thread does happens-before another thread returns from <code>join()</code> on it. With no edge, there is no guarantee, even after a long time.</p>
<p>In Kotlin, <code>@Volatile</code> marks a property's backing field as volatile: reads and writes of it are atomic and visible to other threads, along with everything the writer did before. It does <em>not</em> make <code>count++</code> atomic; that is still a read and a separate write.</p>`,
    code: `class Poller {
    // Without @Volatile the loop may never see stop() and run forever.
    @Volatile private var running = true      // kotlin.concurrent.Volatile

    fun start() = thread {
        while (running) {
            poll()
        }
    }

    fun stop() { running = false }            // seen by the loop thread
}

// Safe publication: the volatile write of 'ready' publishes 'data' too.
class Holder {
    private var data: List<Article> = emptyList()
    @Volatile private var ready = false

    fun publish(list: List<Article>) { data = list; ready = true }
    fun readOrNull(): List<Article>? = if (ready) data else null
}`,
    remember: 'Without a happens-before edge (lock, volatile, start/join), another thread may never see your write. @Volatile gives visibility, not atomicity.',
    visual(el) {
          Lab.ui.graph(el, {
            height: 280,
            nodes: [
              { id: 'A', label: 'Thread A<small>while (running)</small>', x: 17, y: 12 },
              { id: 'B', label: 'Thread B<small>running = false</small>', x: 83, y: 12, tone: 'warm' },
              { id: 'reg', label: 'A’s copy<small>register / JIT</small>', x: 17, y: 52, tone: 'muted' },
              { id: 'buf', label: 'B’s store<small>buffer</small>', x: 83, y: 52, tone: 'muted' },
              { id: 'mem', label: 'Main memory<small>running</small>', x: 50, y: 88, tone: 'muted' },
            ],
            predict: {
              q: 'Plain <code>var running</code>. B’s write has reached main memory, which now says false. Does A’s loop have to stop?',
              options: ['Yes, at its next check', 'No: A may keep using its own copy forever', 'Yes, but only after the next garbage collection'],
              a: 1,
              why: 'Without a happens-before edge, A is never required to read memory again. The JIT may read <code>running</code> once and turn the loop into <code>while (true)</code>.',
            },
            frames: [
              { add: [['mem', 'reg', 'true'], ['reg', 'A', 'true']], say: 'A spins on a plain <code>var running = true</code>. It loaded the value once, and the JIT may keep it in a register.' },
              { add: [['B', 'buf', 'false', 'warm']], say: 'B writes <code>running = false</code>. The write lands in B’s store buffer first. Memory still says true.' },
              { hl: ['A'], add: [['reg', 'A', 'true', 'err']], say: 'A checks again and sees its copy: true. Nothing forces A to look for B’s write.' },
              { add: [['buf', 'mem', 'false', 'warm']], say: 'Later the buffer drains, and memory says false. A still uses its copy. The memory model allows it to loop forever.' },
              { remove: [['mem', 'reg'], ['reg', 'A'], ['B', 'buf'], ['buf', 'mem']], gone: ['reg', 'buf'], add: [['B', 'mem', 'volatile write', 'ok']], say: 'Now <code>@Volatile var running</code>. B’s write is a volatile write: it cannot stay private to B.' },
              { add: [['mem', 'A', 'volatile read: false', 'ok']], hl: ['A'], say: 'Every check in A’s loop is a volatile read, so it cannot be cached. The write happens-before the read that sees it, and A stops.' },
            ],
          });
        },
        play: `import kotlin.concurrent.thread

object Flags {
    @Volatile var running = true   // delete @Volatile and run again
}

fun main() {
    val worker = thread(isDaemon = true) {
        var spins = 0L
        while (Flags.running) spins++
        println("worker saw running = false after $spins spins")
    }
    Thread.sleep(100)
    Flags.running = false
    println("main set running = false")
    worker.join(2_000)
    println(if (worker.isAlive) "after 2 s the worker is still spinning: it never saw the write" else "worker stopped")
}`,
    deeper: [
      {
        title: 'Reordering: seeing the flag before the data',
        body: `<p>Thread A runs <code>data = 42; ready = true</code>. Thread B runs <code>if (ready) println(data)</code>. You might expect B to print 42 or nothing. Without synchronization, B may also print 0: the two writes can become visible in the other order. The JLS has the same shape in Example 17.4-1. Make <code>ready</code> volatile and the volatile write happens-before the read that sees it, which carries <code>data = 42</code> along by program order.</p>`,
        visual(el) {
          let vol = false;
          const tally = { none: 0, ok: 0, bad: 0 };
          const st = h('div', { class: 'cc-row' });
          const msg = out('Press Run to sample outcomes the memory model allows.');
          function paint() {
            st.replaceChildren(h('span', { class: 'cc-chip' }, `nothing printed: ${tally.none}`), h('span', { class: 'cc-chip cc-ok' }, `printed 42: ${tally.ok}`), h('span', { class: `cc-chip ${vol ? 'cc-ghost' : 'cc-err'}` }, vol ? 'printed 0: not allowed' : `printed 0: ${tally.bad}`));
          }
          function run(n) {
            let last;
            for (let k = 0; k < n; k++) {
              const x = Math.random();
              last = x < 0.45 ? 'none' : (!vol && x > 0.88) ? 'bad' : 'ok';
              tally[last]++;
            }
            paint(); replay(st, 'pop-soft');
            say(msg, last === 'bad' ? '<span class="bad">B saw ready = true but data = 0.</span> The writes became visible out of order.' : last === 'ok' ? 'B saw ready = true and data = 42.' : 'B looked before A set ready, so it printed nothing.');
          }
          el.append(picker('ready is', [{ src: 'var ready = false' }, { src: '@Volatile var ready = false' }], (_, k) => { vol = k === 1; Object.keys(tally).forEach(x => { tally[x] = 0; }); paint(); say(msg, vol ? 'Volatile: printing 0 is now impossible.' : 'Plain field: all three outcomes are allowed.'); }),
            h('div', { class: 'cc-stage' }, st), h('div', { class: 'controls' }, act('Run once', () => run(1)), act('Run 20×', () => run(20))), msg,
            h('p', { class: 'cc-note' }, 'Which outcomes can happen comes from the memory model. How often each one happens here is made up; on real devices it depends on the CPU and the JIT.'));
          paint();
        },
      },
      {
        title: 'Volatile is not atomic',
        body: `<p>The Kotlin docs say that only the backing field's own reads and writes are atomic. An increment is a read followed by a separate write, so <code>@Volatile var count</code> plus <code>count++</code> from two threads still loses updates, exactly like lesson 2. Use <code>@Volatile</code> for a flag or a reference that one thread writes and others read. For read-modify-write, use a lock or an atomic class.</p>
<p>A JVM detail from JLS 17.7: a write to a plain (non-volatile) <code>Long</code> or <code>Double</code> field may be done as two 32-bit halves, so another thread could see half of each value. Volatile 64-bit fields, and all references, are always read and written whole.</p>`,
        code: `@Volatile var count = 0
fun hit() { count++ }                  // still a race: read, then write

val count2 = AtomicInteger(0)
fun hit2() { count2.incrementAndGet() } // atomic read-modify-write`,
      },
      {
        title: 'Where your edges come from in practice',
        body: `<p>You rarely write <code>@Volatile</code> in app code, because the tools you already use create happens-before edges for you. <code>synchronized</code> and <code>ReentrantLock</code> do (unlock, then lock). Thread-safe collections in <code>java.util.concurrent</code> and atomics do. Starting a thread and joining it does. In coroutines, the library takes care of it when a coroutine resumes on another thread, and <code>limitedParallelism(1)</code> documents a happens-before between the pieces of code it runs. Problems start when you share a plain <code>var</code> between threads with none of these in between.</p>`,
      },
    ],
    underHood: {
      body: `<p>To keep its promises the JIT emits memory barriers around volatile accesses and lock operations. On ARM64, which has a weaker memory model than x86 and actually reorders many loads and stores, a volatile read typically compiles to a load-acquire instruction (<code>LDAR</code>) and a volatile write to a store-release (<code>STLR</code>). These stop earlier writes from moving past the release and later reads from moving before the acquire. This is also why a visibility bug can hide on an x86 emulator and appear on an ARM phone.</p>`,
    },
    mistakes: [
      { title: 'A stop flag without @Volatile', bad: 'private var cancelled = false\nfun cancel() { cancelled = true }\n// worker: while (!cancelled) step()', good: '@Volatile private var cancelled = false\nfun cancel() { cancelled = true }\n// worker: while (!cancelled) step()', why: 'With no happens-before edge the worker is allowed to never see <code>true</code>; the JIT may hoist the read out of the loop. <code>@Volatile</code> forces each read to see the latest write. (In coroutines, prefer cancellation and <code>isActive</code>.)' },
      { title: 'Using @Volatile to fix a counter', bad: '@Volatile var downloads = 0\nfun done() { downloads++ }', good: 'val downloads = AtomicInteger(0)\nfun done() { downloads.incrementAndGet() }', why: 'Volatile makes the read and the write visible, but they are still two steps. Another thread can slip in between, so updates are lost.' },
    ],
    terms: [
      { term: 'Happens-before', def: 'The JLS ordering that guarantees one action’s effects are visible to another; without it there is no visibility guarantee.' },
      { term: 'Visibility', def: 'Whether a write made by one thread can be seen by reads in another thread.' },
      { term: 'Reordering', def: 'Compilers, the JIT or the CPU running memory operations in a different order than written, when one thread alone cannot tell.' },
      { term: '@Volatile', def: 'Marks a property’s backing field volatile: reads and writes are atomic and visible to other threads, but compound updates are not atomic.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make the flag visible to the worker thread.', code: 'class Sync {\n    [[@Volatile]] private var stopRequested = false\n    fun stop() { stopRequested = [[true]] }\n    fun loop() { while (![[stopRequested]]) syncOnce() }\n}', why: 'A write to a volatile field happens-before every later read of it, so the loop sees <code>true</code> after <code>stop()</code>.' },
      { type: 'bug', prompt: 'Two threads call <code>record()</code> and the total comes out low. Tap the line that is not thread-safe.', code: 'class Meter {\n    @Volatile private var total = 0L\n    fun record(bytes: Long) {\n        total += bytes\n    }\n}', bug: 3, fix: '        totalAtomic.addAndGet(bytes)   // private val totalAtomic = AtomicLong()', why: '<code>@Volatile</code> only makes each read and write visible. <code>total += bytes</code> is a read and a write, and another thread can write in between. Use <code>AtomicLong</code> or a lock.' },
    ],
    quiz: [
      { q: 'Thread B sets a plain <code>var done = true</code>. Thread A spins on <code>while (!done)</code>. What does the memory model guarantee?', options: ['Nothing: A may spin forever', 'A sees it within a few milliseconds', 'A sees it after the next garbage collection'], a: 0, why: 'There is no happens-before edge between the write and the reads, so no rule says A must ever see it. The JIT may even read <code>done</code> only once.' },
      { q: 'Which of these does NOT create a happens-before edge between two threads?', options: ['Both threads reading the same plain field', 'An unlock followed by a lock of the same monitor', 'A volatile write followed by a read of that field', 'Thread.start() and the started thread’s first action'], a: 0, why: 'JLS 17.4.5 lists unlock/lock on one monitor, volatile write/read and start(). Two plain reads synchronize nothing.' },
      { q: 'A writes <code>data = 42</code> then <code>ready = true</code> (both plain). B sees <code>ready == true</code>. What can B read from data?', options: ['42 or 0', 'Only 42', 'Only 0'], a: 0, why: 'Without synchronization the two writes can become visible in either order, so B might see the flag but not the data. Making <code>ready</code> volatile rules out 0.' },
      { q: 'What does <code>@Volatile</code> NOT give you?', options: ['Atomic count++', 'Visibility of writes to other threads', 'Atomic reads and writes of a Long field'], a: 0, why: 'Volatile reads and writes are each atomic and visible, including 64-bit ones. A read-modify-write such as <code>count++</code> is still two separate accesses.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  const casCfg = () => ({
    names: ['T1', 'T2'],
    lines: [
      { src: 'val old = value.get()', exec(th, sh) { th.loc.old = sh.v; delete th.loc.nw; return { msg: `${th.name} reads value = ${sh.v}.` }; } },
      { src: 'val new = old + 1', exec(th) { th.loc.nw = th.loc.old + 1; return { msg: `${th.name} computes ${th.loc.nw} locally. Nothing is locked.` }; } },
      { src: 'if (!value.compareAndSet(old, new))\n    retry from the top', exec(th, sh) {
        if (sh.v === th.loc.old) { sh.v = th.loc.nw; sh.ok++; return { jump: 3, msg: `CAS succeeds: value was still ${th.loc.old}, so ${th.name} sets it to ${th.loc.nw} in one atomic step.` }; }
        th.retries++; sh.fail++;
        return { jump: 0, cls: 'cc-fail', msg: `<span class="bad">CAS fails:</span> ${th.name} expected ${th.loc.old} but value is now ${sh.v}. Nothing was written. ${th.name} loops back and tries again.` };
      } },
    ],
    init: () => ({ v: 0, ok: 0, fail: 0 }),
    mem: sh => `<span>value = <b>${sh.v}</b></span><span class="cc-tag cc-ok">CAS ok ${sh.ok}</span><span class="cc-tag ${sh.fail ? 'cc-err' : ''}">CAS failed ${sh.fail}</span>`,
    local: th => `${th.loc.old === undefined ? 'old = ?' : `old = <b>${th.loc.old}</b>`}${th.loc.nw === undefined ? '' : ` · new = <b>${th.loc.nw}</b>`} · retries: <b>${th.retries}</b>`,
    verdict: (sh, ths) => `<span class="good">Both done: value = ${sh.v}.</span> ${sh.fail ? `It took ${sh.fail} retr${sh.fail > 1 ? 'ies' : 'y'}, but no update was lost and nobody ever waited on a lock.` : 'No conflict this time. Try again and run T2 between T1’s read and its CAS.'}`,
    intro: 'A lock-free increment. Run T1’s read, then all of T2, then T1’s CAS. T1’s CAS will fail and retry, and the result is still right.',
  });
  // the CAS loop has 3 lines; jump: 3 ends the thread
  lessons.push({
    id: 'lock-free-tools',
    title: 'Atomics, immutability and message passing',
    tagline: 'Compare-and-set, data that never changes, and state owned by one thread: concurrency without locks.',
    level: 'advanced',
    body: `
<p>Locks work but have costs: waiting, contention and deadlock risk. Three other tools avoid them. The first is <em>atomics</em>. <code>AtomicInteger</code>, <code>AtomicLong</code> and <code>AtomicReference</code> are built on <em>compare-and-set</em> (CAS): "set the value to <code>new</code> only if it is still <code>old</code>, and tell me if it worked". The hardware does it as one indivisible step. To update, you read, compute, and CAS; if another thread got there first, the CAS fails and you retry. No thread ever blocks, and a thread that is paused cannot hold others up. That is what <em>lock-free</em> means.</p>
<p>The second is <em>immutability</em>. Data that never changes cannot race. Share a <code>data class</code> of <code>val</code>s and build a new copy to "change" it; then the only shared mutable thing is one reference to the current snapshot, which an atomic or a <code>StateFlow</code> can swap safely. The third is to <em>not share</em>: <em>thread confinement</em> keeps state on one thread (like the UI on the main thread), and <em>message passing</em> lets one owner coroutine hold the state while others send it messages through a <code>Channel</code>. "Do not communicate by sharing memory; share memory by communicating."</p>`,
    code: `// Atomic: lock-free counter and snapshot swap
val unread = AtomicInteger(0)
fun onNewArticle() = unread.incrementAndGet()

data class Feed(val items: List<Article>, val page: Int)   // immutable
private val _feed = MutableStateFlow(Feed(emptyList(), 0))
val feed: StateFlow<Feed> = _feed

fun append(more: List<Article>) = _feed.update { old ->     // CAS loop inside
    old.copy(items = old.items + more, page = old.page + 1)
}

// Confinement: all access to 'cache' runs one piece at a time
private val confined = Dispatchers.Default.limitedParallelism(1)
private val cache = HashMap<String, Article>()
suspend fun put(a: Article) = withContext(confined) { cache[a.id] = a }`,
    remember: 'Prefer not sharing (confinement, message passing), then sharing only immutable data, then atomics, and use locks for the rest.',
    visual(el) {
      const box = h('div', { class: 'cc-stage' });
      el.append(box);
      stepper(box, casCfg());
    },
        predict: {
          q: 'T2 changes <code>value</code> between T1’s read and T1’s compare-and-set, so T1 has to retry. What is <code>value</code> when both threads are done?',
          options: ['1: one update was lost', '2: both increments counted', '0: the failed CAS undid everything'],
          a: 1,
          why: 'A failed CAS writes nothing. T1 reads the new value, computes again and retries, so no update is lost and no thread ever waited on a lock.',
        },
        play: `import java.util.concurrent.atomic.AtomicInteger
import kotlin.concurrent.thread

val count = AtomicInteger(0)
val retries = AtomicInteger(0)

fun increment() {
    while (true) {
        val old = count.get()
        if (count.compareAndSet(old, old + 1)) return
        retries.incrementAndGet()          // another thread got there first: retry
    }
}

fun main() {
    val threads = List(4) {
        thread { repeat(100_000) { increment() } }   // change 4 to 1 and compare the retries
    }
    threads.forEach { it.join() }
    println("count = \${count.get()}, failed CAS attempts = \${retries.get()}")
}`,
    deeper: [
      {
        title: 'The CAS loop and why the function must be pure',
        body: `<p>Every atomic "update" method is a CAS loop. <code>AtomicInteger.updateAndGet(f)</code> reads the value, applies <code>f</code>, and CASes; if that fails, it calls <code>f</code> again. The Javadoc says the function should be side-effect-free for this reason, and <code>MutableStateFlow.update</code> documents that its function may run several times. Never log, send a request or bump another counter inside it.</p>
<p>CAS works on one variable. To update two values together, put them in one immutable object and CAS the reference, or use a lock.</p>`,
        code: `// What updateAndGet does, written out
fun AtomicInteger.updateAndGetLike(f: (Int) -> Int): Int {
    while (true) {
        val old = get()
        val new = f(old)              // may run more than once
        if (compareAndSet(old, new)) return new
    }
}`,
      },
      {
        title: 'Message passing: one owner, a mailbox',
        body: `<p>An <em>actor</em> is a coroutine that owns some state and a mailbox. Others never touch the state; they send messages. The owner handles them one at a time, so inside it the code is plain single-threaded code. In Kotlin you build one from a <code>Channel</code> and a loop. (kotlinx.coroutines has an <code>actor { }</code> builder, but it is marked <code>@ObsoleteCoroutinesApi</code>, so the plain channel form is the safer choice.) See <a href="#coroutines.channels">Channels</a>.</p>`,
        code: `sealed interface Msg {
    data object Inc : Msg
    class Get(val reply: CompletableDeferred<Int>) : Msg
}

fun CoroutineScope.counter(): SendChannel<Msg> {
    val box = Channel<Msg>(Channel.UNLIMITED)
    launch {
        var count = 0                    // only this coroutine touches it
        for (m in box) when (m) {
            Msg.Inc -> count++
            is Msg.Get -> m.reply.complete(count)
        }
    }
    return box
}`,
        visual(el) {
          let count = 0, box = [];
          const mail = h('div', { class: 'cc-queue' });
          const own = h('div', { class: 'cc-box cc-acc' });
          const msg = out('Send a few messages from different threads, then let the owner process them.');
          function paint() {
            mail.replaceChildren(label('mailbox'), ...(box.length ? box.map(m => h('span', { class: `cc-chip cc-in ${m.from === 'UI' ? 'cc-acc' : 'cc-warm'}` }, `${m.t} (${m.from})`)) : [h('span', { class: 'muted-text' }, 'empty')]));
            own.innerHTML = `<h4>Owner coroutine</h4><span class="cc-val">count = ${count}</span>`;
          }
          const send = (t, from) => () => { box.push({ t, from }); paint(); say(msg, `${from} sends ${t}. It does not touch count; the message just waits in the channel.`); };
          function proc() {
            const m = box.shift();
            if (!m) { say(msg, 'Mailbox is empty. The owner suspends on the channel until a message arrives.'); return; }
            if (m.t === 'Inc') { count++; say(msg, `Owner handles Inc from ${m.from}: count = ${count}. One message at a time, so no race is possible.`); }
            else say(msg, `Owner handles Get from ${m.from} and replies ${count}.`);
            paint(); replay(own, 'pop-soft');
          }
          el.append(h('div', { class: 'cc-stage' }, mail, own),
            h('div', { class: 'controls' }, act('UI: send Inc', send('Inc', 'UI')), act('Worker: send Inc', send('Inc', 'IO')), act('Worker: send Get', send('Get', 'IO')), act('Owner: handle next', proc)), msg);
          paint();
        },
      },
      {
        title: 'Thread confinement',
        body: `<p>The simplest thread-safe code is code that runs on one thread. Android's UI is confined to the main thread. You can confine your own state too: run all access through <code>Dispatchers.Default.limitedParallelism(1)</code>, which the docs say runs those pieces of code one after another with a happens-before between them. Confine in big chunks: switching context for every tiny update is slow, as the Kotlin shared-state guide shows. And remember it limits threads, not coroutines: if the code suspends in the middle, another coroutine can run in between, so it is not a replacement for a <code>Mutex</code> across suspension points.</p>`,
      },
    ],
    underHood: {
      body: `<p>On ARM64, CAS compiles either to an LL/SC pair (load-exclusive <code>LDAXR</code> and store-exclusive <code>STLXR</code>, retried if another core touched the line) or, on CPUs with the ARMv8.1 atomics, a single <code>CAS</code> instruction. Lock-free has one classic trap, the <em>ABA problem</em>: a value changes from A to B and back to A, and a CAS that expected A succeeds even though the world changed. With plain counters it does not matter; with pointer-based structures like a lock-free stack it can. <code>AtomicStampedReference</code> pairs the reference with a version number to catch it. Under heavy contention, many threads retrying CAS can also be slower than a lock; <code>LongAdder</code> spreads a hot counter over several cells for that case.</p>`,
    },
    mistakes: [
      { title: 'Side effects inside update { }', bad: '_state.update {\n    analytics.log("page")      // may run twice\n    it.copy(page = it.page + 1)\n}', good: '_state.update { it.copy(page = it.page + 1) }\nanalytics.log("page")', why: 'The function may run again if another thread updated the value first. Keep it pure and do side effects once, outside.' },
      { title: 'get() then set() on an atomic', bad: 'val n = counter.get()\ncounter.set(n + 1)             // two atomic steps, still a race', good: 'counter.incrementAndGet()      // one atomic read-modify-write', why: 'Each call is atomic on its own, but another thread can change the value between them. Use the combined methods or a <code>compareAndSet</code> loop.' },
      { title: 'Sharing a mutable list "read-only"', bad: 'val shared = mutableListOf<Article>()\nfun items(): List<Article> = shared   // callers see later changes', good: 'private val _items = AtomicReference<List<Article>>(emptyList())\nfun items(): List<Article> = _items.get()   // an immutable snapshot\nfun add(a: Article) = _items.updateAndGet { it + a }', why: 'A <code>List</code> type only hides the mutating methods; the object can still change while another thread iterates it. Hand out immutable snapshots and swap the reference atomically.' },
    ],
    terms: [
      { term: 'Compare-and-set (CAS)', def: 'An atomic instruction that writes a new value only if the current value equals the expected one, and reports whether it did.' },
      { term: 'Lock-free', def: 'Code where some thread always makes progress, because no thread waits on a lock another thread holds.' },
      { term: 'Thread confinement', def: 'Keeping data reachable from only one thread at a time, so it needs no synchronization.' },
      { term: 'Actor', def: 'A coroutine or thread that owns state and changes it only in response to messages from its mailbox.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Finish the lock-free increment.', code: 'while (true) {\n    val old = counter.[[get]]()\n    val new = old + 1\n    if (counter.[[compareAndSet]](old, new)) break\n}', why: 'Read the current value, compute the next, and CAS. If another thread changed it in between, the CAS returns false and the loop tries again with a fresh read.' },
      { type: 'bug', prompt: 'Two threads call <code>addTag</code> and some tags go missing. Tap the broken line.', code: 'private val tags = AtomicReference<Set<String>>(emptySet())\nfun addTag(t: String) {\n    val old = tags.get()\n    tags.set(old + t)\n}', bug: 3, fix: '    tags.updateAndGet { it + t }', why: '<code>get()</code> then <code>set()</code> is a read-modify-write split in two. A tag added by another thread in between is overwritten. <code>updateAndGet</code> runs a CAS loop that retries on conflict.' },
    ],
    quiz: [
      { q: 'value is 5. T1 reads 5. T2 increments it to 6. T1 calls <code>compareAndSet(5, 6)</code>. What happens?', options: ['It returns false and writes nothing; T1 retries', 'It writes 6 and returns true', 'T1 blocks until T2 finishes'], a: 0, why: 'CAS only writes if the value still equals the expected 5. It is 6, so the CAS fails and T1 must read again.' },
      { q: 'Why must the lambda passed to <code>MutableStateFlow.update</code> be free of side effects?', options: ['It can run more than once when there is contention', 'It runs on the main thread', 'It is compiled to a lock'], a: 0, why: 'The docs say the function may be evaluated multiple times if the value is updated concurrently, because update is a CAS loop.' },
      { q: 'You need to update <code>firstName</code> and <code>lastName</code> together so no one ever sees a mix. Which works without a lock?', options: ['An immutable Name(first, last) in an AtomicReference, swapped with CAS', 'Two AtomicReference fields', 'Two @Volatile fields'], a: 0, why: 'CAS works on one variable. Put both in one immutable object and swap the single reference, so readers see the old pair or the new pair, never half of each.' },
      { q: 'Order the choices from "least shared" to "most shared":', options: ['Confinement → immutable sharing → atomics → locks', 'Locks → atomics → immutable sharing → confinement', 'Atomics → confinement → locks → immutable sharing'], a: 0, why: 'Confined data is not shared at all; immutable data is shared but never changes; atomics share one changing variable safely; locks guard any amount of shared changing state, at the highest cost.' },
      { q: 'Code on <code>limitedParallelism(1)</code> does <code>val x = read(); delay(10); write(x + 1)</code>. Is the update safe from other coroutines on that dispatcher?', options: ['No, another coroutine can run during the delay', 'Yes, only one thread runs it', 'Yes, delay holds the dispatcher'], a: 0, why: 'The dispatcher runs one piece of code at a time, but suspending at <code>delay</code> lets another coroutine in before the write. For a critical section that suspends, use a <code>Mutex</code>.' },
    ],
  });

  Lab.addTrack({
    id: 'concurrency',
    title: 'Concurrency fundamentals',
    description: 'The theory under threads and coroutines: interleaving, race conditions, locks, deadlock, the JVM memory model and lock-free tools.',
    requires: ['kotlin'],
    css,
    lessons,
  });
})();
