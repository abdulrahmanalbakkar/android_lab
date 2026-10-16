/* Testing and quality track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed tst-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const fmt = ms => (ms >= 1000 ? (ms / 1000).toFixed(ms >= 10000 ? 0 : 1) + ' s' : Math.round(ms) + ' ms');

  const css = `
.tst-label { font: 600 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.tst-sub { display: grid; gap: 10px; padding: 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--bg); min-width: 0; }
.tst-row { min-width: 0; }
.tst-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 14px; min-width: 0; }

/* 1 pyramid */
.tst-pyr { display: grid; gap: 6px; justify-items: center; padding: 16px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.tst-layer { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 10px; width: var(--tst-w); max-width: 100%; padding: 10px 12px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); font: 600 0.86rem var(--mono); cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.15s; }
.tst-layer:hover { transform: translateY(-1px); }
.tst-layer small { color: var(--muted); font-weight: 500; }
.tst-layer.tst-unit { border-color: var(--ok); }
.tst-layer.tst-inst { border-color: var(--warm); }
.tst-layer.tst-ui { border-color: var(--accent); }
.tst-layer[aria-pressed="true"].tst-unit { background: var(--ok-soft); }
.tst-layer[aria-pressed="true"].tst-inst { background: var(--warm-soft); }
.tst-layer[aria-pressed="true"].tst-ui { background: var(--accent-soft); }
.tst-info { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 14px; align-items: center; font-size: 0.92rem; }
.tst-dots { display: inline-flex; gap: 5px; }
.tst-dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--sunk); border: 1px solid var(--line); }
.tst-dots i.on { background: var(--ink); border-color: var(--ink); }
.bar.tst-c-unit { background: var(--ok); min-width: 3px; }
.bar.tst-c-inst { background: var(--warm); min-width: 3px; }
.bar.tst-c-ui { background: var(--accent); min-width: 3px; }
.tst-stats { display: flex; flex-wrap: wrap; gap: 6px 18px; font: 500 0.82rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.tst-stats b { color: var(--ink); }

/* 2 fakes */
.tst-wire { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; padding: 16px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.tst-gwt { display: grid; gap: 4px; padding: 10px; border-radius: 12px; background: var(--code-bg); min-width: 0; max-width: 100%; overflow-x: auto; }
.tst-gwt-line { font: 500 0.8rem/1.5 var(--mono); color: var(--code-ink); white-space: pre; padding: 3px 8px; border-radius: 6px; border-left: 3px solid transparent; transition: background 0.2s, border-color 0.2s; }
.tst-gwt-line.tst-on { background: rgba(255, 212, 121, 0.14); border-left-color: var(--t-f); }
.tst-gwt-line.tst-pass { background: rgba(158, 223, 165, 0.15); border-left-color: var(--t-k); }
.tst-gwt-line.tst-fail { background: rgba(255, 138, 155, 0.18); border-left-color: var(--t-e); }
.tst-link { font: 700 1.3rem var(--mono); color: var(--muted); transition: color 0.2s; }
.tst-link.tst-busy { color: var(--accent); animation: pulse 0.6s infinite; }
.tst-dep { display: grid; gap: 6px; justify-items: center; min-width: 170px; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--warm); background: var(--surface); font: 500 0.84rem var(--mono); text-align: center; transition: border-color 0.25s; }
.tst-dep.tst-fake { border-color: var(--ok); }
.tst-dep b { font-weight: 700; }
.tst-dep small { color: var(--muted); }
.tst-hist { display: flex; flex-wrap: wrap; gap: 6px; min-height: 34px; align-items: center; }
.tst-res { font: 600 0.78rem var(--mono); padding: 4px 9px; border-radius: 999px; background: var(--ok-soft); color: var(--ok); font-variant-numeric: tabular-nums; }
.tst-res.tst-bad { background: var(--err-soft); color: var(--err); }

/* 3 coroutines */
.tst-clocks { display: flex; flex-wrap: wrap; gap: 10px 22px; font: 500 0.8rem var(--mono); color: var(--muted); }
.tst-clocks b { display: inline-block; min-width: 4.5em; font: 700 1.05rem var(--mono); color: var(--warm); font-variant-numeric: tabular-nums; }
.tst-clocks b.tst-vt { color: var(--accent); }
.tst-tick { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--ink); opacity: 0.5; }
.tst-queue { display: flex; flex-wrap: wrap; gap: 6px; min-height: 40px; align-items: center; padding: 8px; border-radius: 10px; border: 2px dashed var(--line); background: var(--surface); }
.tst-queue:empty::before { content: "queue empty"; font: 500 0.8rem var(--mono); color: var(--muted); }
.tst-task { font: 600 0.78rem var(--mono); padding: 5px 10px; border-radius: 8px; background: var(--accent-soft); color: var(--ink); border: 1px solid var(--accent); }
.tst-state { font: 600 0.9rem var(--mono); }
.tst-state .chip { height: 36px; font-size: 0.86rem; }

/* 4 flows */
.tst-lane { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; min-height: 150px; }
.tst-lane.tst-live { border-color: var(--accent); }
.tst-evs { display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; min-height: 40px; }
.tst-ev { font: 600 0.78rem var(--mono); padding: 5px 10px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); color: var(--ink); white-space: nowrap; }
.tst-ev.tst-ok { border-color: var(--ok); background: var(--ok-soft); }
.tst-ev.tst-no { border-color: var(--err); background: var(--err-soft); }
.tst-ev.tst-gone { opacity: 0.4; text-decoration: line-through; }
.tst-script { display: grid; gap: 3px; background: var(--code-bg); border-radius: 14px; padding: 12px; overflow-x: auto; min-width: 0; }
.tst-script .tst-gwt-line.tst-skip { opacity: 0.35; text-decoration: line-through; }
.tst-timer { font: 700 0.85rem var(--mono); color: var(--warm); font-variant-numeric: tabular-nums; }

/* 5 compose */
.tst-split { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start; min-width: 0; }
.phone.tst-phone { justify-content: flex-start; align-items: stretch; gap: 8px; height: 330px; width: 210px; position: relative; padding: 16px 12px; }
.tst-ph-title { font: 800 1.2rem var(--display); border-radius: 6px; }
.tst-ph-count { color: var(--muted); font-size: 0.86rem; border-radius: 6px; }
.tst-ph-list { display: grid; gap: 5px; padding: 4px; border-radius: 8px; overflow: hidden; max-height: 150px; }
.tst-ph-row { padding: 6px 9px; border-radius: 8px; background: var(--sunk); font-size: 0.84rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tst-ph-btn { justify-self: start; align-self: start; padding: 7px 14px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-weight: 700; font-size: 0.86rem; }
.tst-ph-fab { position: absolute; right: 12px; bottom: 12px; width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: var(--warm-soft); color: var(--warm); font: 800 1.5rem var(--display); }
.tst-ph-toast { position: absolute; left: 12px; bottom: 64px; right: 12px; padding: 6px 10px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: 0.8rem; text-align: center; }
.tst-hit { outline: 3px solid var(--warm); outline-offset: 2px; }
.tst-tree { display: grid; gap: 2px; background: var(--code-bg); border-radius: 14px; padding: 12px; overflow-x: auto; min-width: 0; }
.tst-node { font: 500 0.8rem/1.5 var(--mono); color: var(--code-ink); white-space: pre; padding: 2px 8px; border-radius: 6px; border: 1px solid transparent; }
.tst-node .tst-prop { color: var(--t-c); }
.tst-node.tst-match { background: rgba(255, 212, 121, 0.16); border-color: var(--t-f); }

/* 6 baseline profiles */
.tst-methods { width: min(100%, 480px); display: grid; grid-template-columns: repeat(16, minmax(0, 1fr)); gap: 4px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); }
.tst-m { aspect-ratio: 1; border-radius: 3px; border: 1.5px dashed var(--muted); transition: background 0.25s, border-color 0.25s; }
.tst-m.tst-jit { background: var(--warm); border: 1.5px solid var(--warm); }
.tst-m.tst-aot { background: var(--accent); border: 1.5px solid var(--accent); }
.tst-m.tst-cold { opacity: 0.35; }
.bar.tst-sys { background: var(--muted); opacity: 0.55; }
.bar.tst-interp { background: repeating-linear-gradient(45deg, var(--warm) 0 5px, transparent 5px 9px); }
.bar.tst-aotbar { background: var(--accent); }
.tst-frame { position: absolute; top: 0; bottom: 0; width: 3px; background: var(--ok); border-radius: 2px; }
.legend i.tst-sq { width: 12px; height: 12px; border-radius: 3px; }

@media (max-width: 720px) { .tst-split { grid-template-columns: minmax(0, 1fr); } .tst-split .phone { justify-self: center; } }
@media (max-width: 520px) { .tst-methods { grid-template-columns: repeat(12, minmax(0, 1fr)); } }

/* depth steps */
.phone.tst-dz-phone { width: 170px; height: 220px; justify-content: flex-start; align-items: stretch; gap: 10px; padding: 16px 12px; }
.tst-dz-panel { border-radius: 10px; background: var(--accent-soft); border: 2px solid var(--accent); box-sizing: border-box; min-height: 0; transition: none; }
.tst-dz-panel[style*="height: 0px"], .tst-dz-panel[style*="height:0"] { border-width: 0; }
`;

  // ─── Depth: Go deeper, under the hood, common mistakes ─────────────────
  const pressed = (buttons, keys, k) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(keys[i] === k)));
  const gwt = lines => lines.map(src => h('div', { class: 'tst-gwt-line', html: hl(src) }));
  const mark = (rows, i, cls) => rows.forEach((r, j) => { r.classList.remove('tst-on', 'tst-pass', 'tst-fail'); if (j === i && cls) r.classList.add(cls); });

  const coroutinesDepth = {
    deeper: [
      {
        title: 'Step the clock: advanceTimeBy and runCurrent',
        body: `<p><code>advanceUntilIdle()</code> runs everything. To test what happens <em>between</em> events, step the clock yourself. <code>advanceTimeBy(ms)</code> moves virtual time forward and runs every task scheduled <em>before</em> the new time. A task scheduled exactly at the new time is not run yet. <code>runCurrent()</code> runs the tasks due right now.</p>
<p>The ViewModel below waits 300 ms after the last keystroke before it searches. Step the clock and see when the search runs.</p>`,
        code: `@Test fun searchesOnlyAfterTypingStops() = runTest {
    vm.onQuery("kot")
    advanceTimeBy(300)               // clock at 300, search not run yet
    assertEquals(SearchState.Idle, vm.state.value)
    runCurrent()                     // runs the task due at 300
    assertEquals(SearchState.Results(12), vm.state.value)
}`,
        visual(el) {
          const END = 1200;
          let now = 0, tasks = [], state = 'Idle', typed = 0;
          const WORDS = ['kot', 'kotl', 'kotli', 'kotlin'];
          const cursor = h('span', { class: 'cursor', style: 'left:0' });
          const track = h('div', { class: 'lane-track' }, cursor);
          const clock = h('b', { class: 'tst-vt' }, '0 ms');
          const stateSlot = h('span', {}, h('span', { class: 'chip' }, 'Idle'));
          const queueEl = h('div', { class: 'tst-queue', 'aria-label': 'Scheduled tasks' });
          const o = out();
          const pct = t => (Math.min(t, END) / END) * 100 + '%';
          const setState = s => { state = s; stateSlot.replaceChildren(h('span', { class: 'chip drop-in' }, s)); };
          function paint() {
            cursor.style.left = pct(now);
            clock.textContent = now + ' ms';
            track.querySelectorAll('.tst-tick').forEach(x => x.remove());
            tasks.forEach(t => track.append(h('span', { class: 'tst-tick', style: `left:${pct(t.at)};opacity:1;background:var(--accent);width:3px` })));
            queueEl.replaceChildren(...tasks.map(t => h('span', { class: 'tst-task drop-in' }, `search("${t.q}") at ${t.at} ms`)));
          }
          const run = list => list.forEach(t => { tasks = tasks.filter(x => x !== t); setState(`Results(${t.q.length * 3})`); });
          function reset() { now = 0; tasks = []; typed = 0; setState('Idle'); paint(); }
          reset();
          o.innerHTML = 'Type a query to schedule a debounced search, then step the clock.';
          el.append(
            h('div', { class: 'controls' },
              cmd('vm.onQuery(…)', () => {
                if (now > END - 300) { replay(track, 'shake'); say(o, '<span class="muted">end of the timeline:</span> press Reset to start again.'); return; }
                const q = WORDS[Math.min(typed++, WORDS.length - 1)];
                const had = tasks.length;
                tasks = [{ at: now + 300, q }];
                if (state !== 'Idle' && !had) setState('Idle');
                paint(); replay(queueEl, 'pop-soft');
                say(o, had ? `typed "${q}": the old search was cancelled and a new one is due at ${now + 300} ms.` : `typed "${q}": a search is due at ${now + 300} ms.`);
              }),
              cmd('advanceTimeBy(100)', () => step(100)),
              cmd('advanceTimeBy(300)', () => step(300)),
              cmd('runCurrent()', () => {
                const due = tasks.filter(t => t.at <= now);
                if (!due.length) { replay(queueEl, 'shake'); say(o, `${hl('runCurrent()')} <span class="muted">// nothing is due at ${now} ms</span>`); return; }
                run(due); paint(); replay(stateSlot, 'pop');
                say(o, `${hl('runCurrent()')} <span class="good">// ran the search due at ${now} ms</span>`);
              }),
              cmd('advanceUntilIdle()', () => {
                if (!tasks.length) { say(o, `${hl('advanceUntilIdle()')} <span class="muted">// nothing queued, clock stays at ${now} ms</span>`); return; }
                now = Math.max(now, ...tasks.map(t => t.at)); run([...tasks]); paint(); replay(clock, 'pop');
                say(o, `${hl('advanceUntilIdle()')} <span class="good">// jumped to ${now} ms and ran everything</span>`);
              })),
            h('div', { class: 'tst-clocks' }, h('span', {}, 'currentTime ', clock), h('span', { class: 'tst-state' }, 'vm.state ', stateSlot)),
            h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'virtual time'), track)),
            queueEl, o);
          function step(ms) {
            if (now + ms > END) { replay(track, 'shake'); say(o, '<span class="muted">end of the timeline:</span> press Reset to start again.'); return; }
            const target = now + ms;
            const ran = tasks.filter(t => t.at < target);
            const atEdge = tasks.filter(t => t.at === target);
            now = target; run(ran); paint(); replay(clock, 'pop');
            if (ran.length) say(o, `${hl(`advanceTimeBy(${ms})`)} <span class="good">// the search was due before ${now} ms, so it ran</span>`);
            else if (atEdge.length) say(o, `${hl(`advanceTimeBy(${ms})`)} <span class="bad">// clock is at ${now} ms, but the task due exactly at ${now} has not run. Call runCurrent().</span>`);
            else say(o, `${hl(`advanceTimeBy(${ms})`)} <span class="muted">// clock at ${now} ms, nothing due yet</span>`);
          }
        },
      },
      {
        title: 'Endless coroutines go in backgroundScope',
        body: `<p><code>runTest</code> waits for every coroutine launched in its scope before it returns. A collector of a <code>StateFlow</code> or a ticker never finishes, so the test hangs until <code>runTest</code>’s timeout fails it.</p>
<p>Launch such collectors in <code>backgroundScope</code> instead. It shares the same scheduler, and <code>runTest</code> cancels it when the test body ends.</p>`,
        visual(el) {
          const MODES = [['plain', 'launch { … }'], ['bg', 'backgroundScope.launch { … }']];
          let mode = 'plain', busy = false;
          const script = h('div', { class: 'tst-script' });
          const timer = h('span', { class: 'bar wait', style: 'left:0;width:0;opacity:0' });
          const child = h('span', { class: 'chip' }, 'not started');
          const verdict = h('span', { class: 'tst-res' }, 'not run');
          const o = out();
          let rows = [];
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => { if (busy) return; mode = k; paint(); say(o, `<span class="muted">mode:</span> the collector is launched with ${hl(src)}. Run the test.`); }));
          function paint() {
            rows = gwt([
              '@Test fun countsTicks() = runTest {',
              '    val seen = mutableListOf<Int>()',
              mode === 'bg' ? '    backgroundScope.launch { vm.ticks.toList(seen) }' : '    launch { vm.ticks.toList(seen) }',
              '    advanceTimeBy(3_000); runCurrent()',
              '    assertEquals(listOf(1, 2, 3), seen)',
              '}   // runTest now waits for its children',
            ]);
            script.replaceChildren(...rows);
            pressed(modeBtns, MODES.map(m => m[0]), mode);
            timer.style.width = '0'; timer.style.opacity = '0'; child.textContent = 'not started'; child.className = 'chip';
            verdict.textContent = 'not run'; verdict.className = 'tst-res';
          }
          async function runIt() {
            if (busy) return; busy = true;
            const live = () => el.isConnected;
            try {
              paint();
              for (let i = 0; i < rows.length; i++) {
                mark(rows, i, 'tst-on');
                if (i === 2) { child.textContent = 'collecting'; child.className = 'chip bool drop-in'; }
                await sleep(420); if (!live()) return;
              }
              mark(rows, 4, 'tst-pass'); await sleep(300); if (!live()) return;
              if (mode === 'bg') {
                child.textContent = 'cancelled'; child.className = 'chip drop-in';
                verdict.textContent = 'PASSED'; verdict.className = 'tst-res drop-in';
                mark(rows, 5, 'tst-pass');
                say(o, '<span class="good">passed:</span> the body finished, runTest cancelled backgroundScope, and the endless collector went with it.');
                return;
              }
              mark(rows, 5, 'tst-on');
              say(o, 'The body is done, but one child is still collecting. runTest waits for it…');
              const T = 2600, t0 = performance.now();
              timer.style.opacity = '1';
              while (performance.now() - t0 < T) {
                timer.style.width = ((performance.now() - t0) / T) * 100 + '%';
                await sleep(50); if (!live()) return;
              }
              timer.style.width = '100%';
              mark(rows, 5, 'tst-fail');
              verdict.textContent = 'FAILED: timed out'; verdict.className = 'tst-res tst-bad drop-in';
              say(o, '<span class="bad">failed:</span> the collector never completes, so runTest timed out even though every assertion passed.');
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'The ViewModel exposes an endless flow of ticks. Run the test both ways.';
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            script,
            h('div', { class: 'tst-clocks' }, h('span', { class: 'tst-state' }, 'collector ', child), verdict),
            h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'waiting (sped up)'), h('div', { class: 'lane-track' }, timer))),
            h('div', { class: 'controls' }, cmd('run the test', runIt)),
            o);
        },
      },
    ],
    underHood: {
      body: `<p><code>runTest</code> creates a <code>TestScope</code> whose dispatcher is a <code>StandardTestDispatcher</code> with a <code>TestCoroutineScheduler</code>. If <code>Dispatchers.Main</code> was replaced with a test dispatcher, <code>runTest</code> reuses that dispatcher’s scheduler, so both share one clock.</p>
<p>The scheduler is a queue of tasks ordered by virtual time. When a coroutine on a test dispatcher calls <code>delay(1_000)</code>, nothing sleeps. The dispatcher adds “resume this continuation” to the queue at <code>currentTime + 1_000</code>, and the coroutine suspends. Advancing takes tasks off the queue in time order, sets <code>currentTime</code> to each task’s time and runs it.</p>`,
    },
    mistakes: [
      {
        title: 'runBlocking with real delays',
        bad: `@Test fun retries() = runBlocking {
    vm.sync()
    delay(3_500)          // the test really waits
    assertEquals(SyncState.Done, vm.state.value)
}`,
        good: `@Test fun retries() = runTest {
    vm.sync()
    advanceUntilIdle()    // skips the delays
    assertEquals(SyncState.Done, vm.state.value)
}`,
        why: 'Real waits make the suite slow and flaky, since 3.5 s may not be enough on a busy CI machine. <code>runTest</code> runs the same code on virtual time.',
      },
      {
        title: 'setMain without resetMain',
        bad: `@Before fun setUp() {
    Dispatchers.setMain(StandardTestDispatcher())
}`,
        good: `@Before fun setUp() {
    Dispatchers.setMain(StandardTestDispatcher())
}
@After fun tearDown() {
    Dispatchers.resetMain()
}`,
        why: 'The replaced Main stays installed for the next test in the same process, with a scheduler that test does not control. A JUnit rule that does both is the safest form.',
      },
      {
        title: 'Code under test on a hard-coded dispatcher',
        bad: `class SyncViewModel(private val repo: SyncRepository) : ViewModel() {
    fun sync() = viewModelScope.launch(Dispatchers.IO) {
        _state.value = repo.sync()
    }
}`,
        good: `class SyncViewModel(
    private val repo: SyncRepository,
    private val io: CoroutineDispatcher = Dispatchers.IO,
) : ViewModel() {
    fun sync() = viewModelScope.launch(io) { _state.value = repo.sync() }
}`,
        why: 'Work on the real IO pool runs on other threads, outside the test scheduler. <code>advanceUntilIdle()</code> can return before it finishes. Inject the dispatcher and pass a test one.',
      },
    ],
  };

  const composeUiDepth = {
    deeper: [
      {
        title: 'What the rule waits for, and what it does not',
        body: `<p>Before every finder and assertion, the rule waits until Compose is idle: no pending recomposition, layout or draw, and no running animations. It also waits for registered Espresso idling resources.</p>
<p>It does not know about your own background work. If the ViewModel loads on a real <code>Dispatchers.IO</code> thread, the assertion can run before the data arrives. Use a fake repository that returns at once, or wait for the result with <code>waitUntil</code>. Never <code>Thread.sleep</code>.</p>`,
        code: `rule.onNodeWithText("Refresh").performClick()
rule.waitUntil(timeoutMillis = 5_000) {
    rule.onAllNodesWithText("Ada Lovelace").fetchSemanticsNodes().isNotEmpty()
}
rule.onNodeWithText("Ada Lovelace").assertIsDisplayed()`,
        visual(el) {
          const MODES = [['fake', 'fake repo, returns at once'], ['io', 'real repo on Dispatchers.IO'], ['wait', 'real repo + waitUntil']];
          let mode = 'fake', busy = false;
          const script = h('div', { class: 'tst-script' });
          const screen = h('div', { class: 'tst-ph-count' }, 'Loading…');
          const bar = h('span', { class: 'bar run', style: 'left:0;width:0' });
          const verdict = h('span', { class: 'tst-res' }, 'not run');
          const o = out();
          let rows = [];
          const modeBtns = MODES.map(([k, label]) => h('button', { class: 'cmd', onclick() { if (busy) return; mode = k; paint(); say(o, `<span class="muted">setup:</span> ${label}. Run the test.`); } }, label));
          function paint() {
            const lines = ['rule.setContent { ProfileScreen(vm) }', 'rule.onNodeWithText("Refresh").performClick()'];
            if (mode === 'wait') lines.push('rule.waitUntilExactlyOneExists(hasText("Ada Lovelace"))');
            lines.push('rule.onNodeWithText("Ada Lovelace").assertIsDisplayed()');
            rows = gwt(lines); script.replaceChildren(...rows);
            pressed(modeBtns, MODES.map(m => m[0]), mode);
            screen.textContent = 'Profile'; screen.className = 'tst-ph-count';
            bar.style.width = '0'; verdict.textContent = 'not run'; verdict.className = 'tst-res';
          }
          async function runIt() {
            if (busy) return; busy = true;
            const live = () => el.isConnected;
            let loaded = false, loadP = 0, t0 = 0;
            const LOAD = 1400;
            const tick = () => { if (!t0) return; loadP = Math.min(1, (performance.now() - t0) / LOAD); bar.style.width = loadP * 100 + '%'; if (loadP >= 1 && !loaded) { loaded = true; screen.textContent = 'Ada Lovelace'; screen.className = 'tst-ph-title drop-in'; } };
            try {
              paint();
              mark(rows, 0, 'tst-on'); await sleep(450); if (!live()) return;
              mark(rows, 1, 'tst-on'); screen.textContent = 'Loading…';
              if (mode === 'fake') { await sleep(250); if (!live()) return; loaded = true; bar.style.width = '100%'; screen.textContent = 'Ada Lovelace'; screen.className = 'tst-ph-title drop-in'; }
              else t0 = performance.now();
              await sleep(400); if (!live()) return; tick();
              let i = 2;
              if (mode === 'wait') {
                mark(rows, 2, 'tst-on');
                while (!loaded) { await sleep(100); if (!live()) return; tick(); replay(rows[2], 'pop-soft'); }
                await sleep(200); if (!live()) return;
                i = 3;
              }
              mark(rows, i, 'tst-on'); await sleep(350); if (!live()) return; tick();
              if (loaded) {
                mark(rows, i, 'tst-pass'); verdict.textContent = 'PASSED'; verdict.className = 'tst-res drop-in';
                say(o, mode === 'fake' ? '<span class="good">passed:</span> the fake answered during the click, so the name was there before the assertion.' : '<span class="good">passed:</span> waitUntil polled the tree until the name showed up, then the assertion ran.');
              } else {
                mark(rows, i, 'tst-fail'); verdict.textContent = 'FAILED'; verdict.className = 'tst-res tst-bad drop-in';
                say(o, '<span class="bad">failed:</span> Compose was idle, so the rule let the assertion run. The IO thread was still loading.');
                while (!loaded) { await sleep(100); if (!live()) return; tick(); }
              }
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'Pick a setup and run the same test.';
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'tst-split' },
              h('div', { class: 'phone tst-dz-phone' }, h('span', { class: 'tst-ph-btn' }, 'Refresh'), screen),
              h('div', { class: 'tst-sub' }, script,
                h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'data load'), h('div', { class: 'lane-track' }, bar))),
                h('div', { class: 'controls' }, cmd('run the test', runIt), verdict))),
            o);
        },
      },
      {
        title: 'Freeze the clock to test an animation',
        body: `<p>The rule drives Compose with a test clock, <code>rule.mainClock</code>. By default it advances on its own, so after <code>performClick()</code> the rule waits until animations finish and you only see the end state.</p>
<p>Set <code>autoAdvance = false</code> to stop it. Then move time yourself with <code>advanceTimeBy</code> or <code>advanceTimeByFrame</code> and check the UI in the middle of an animation.</p>`,
        code: `@Test fun panelIsHalfOpenMidAnimation() {
    rule.mainClock.autoAdvance = false
    rule.setContent { ExpandingPanel() }        // tween(300) on height
    rule.onNodeWithText("Details").performClick()
    rule.mainClock.advanceTimeBy(150)
    rule.onNodeWithTag("panel").assertHeightIsAtLeast(40.dp)
    rule.mainClock.advanceTimeBy(150)
    rule.onNodeWithTag("panel").assertHeightIsEqualTo(120.dp)
}`,
        visual(el) {
          const DUR = 300, FULL = 120;
          let auto = true, t = null, open = false, busy = false;
          const panel = h('div', { class: 'tst-dz-panel', style: 'height:0' });
          const clock = h('b', { class: 'tst-vt' }, '0 ms');
          const heightEl = h('b', {}, '0 dp');
          const o = out();
          const ease = x => 1 - Math.pow(1 - x, 3);
          let clockMs = 0;
          function paint() {
            const p = !open ? 0 : t == null ? 1 : Math.min(1, t / DUR);
            const hdp = Math.round(FULL * ease(p));
            panel.style.height = (hdp / FULL) * 90 + 'px';
            heightEl.textContent = hdp + ' dp';
            clock.textContent = clockMs + ' ms';
          }
          const sw = h('input', { type: 'checkbox', id: 'tst-dz-auto', onchange() { auto = !sw.checked; t = null; open = false; clockMs = 0; paint(); say(o, auto ? 'autoAdvance is on: the rule runs animations to the end for you.' : '<span class="muted">autoAdvance = false:</span> time only moves when you advance it.'); } });
          async function click() {
            if (busy) return;
            if (open) { replay(panel, 'shake'); say(o, '<span class="muted">already open:</span> press Reset to close it.'); return; }
            open = true; t = 0;
            if (!auto) { paint(); say(o, `${hl('performClick()')} <span class="muted">// animation started, clock frozen at ${clockMs} ms, height 0 dp</span>`); return; }
            busy = true;
            try {
              const start = clockMs;
              while (t < DUR) { t = Math.min(DUR, t + 16); clockMs = start + t; paint(); await sleep(16); if (!el.isConnected) return; }
              say(o, `${hl('performClick()')} <span class="good">// the rule waited for the animation: height is already ${FULL} dp</span>`);
            } finally { busy = false; }
          }
          function adv(ms) {
            if (busy) return;
            if (auto) { replay(clock, 'shake'); say(o, '<span class="muted">tip:</span> turn off autoAdvance first. With it on, there is nothing in between to inspect.'); return; }
            clockMs += ms;
            if (t != null) t = Math.min(DUR, t + ms);
            paint(); replay(heightEl, 'pop');
            say(o, t == null ? `clock at ${clockMs} ms. Nothing is animating yet. Click first.` : t >= DUR ? `clock at ${clockMs} ms. The animation is done: ${heightEl.textContent}.` : `clock at ${clockMs} ms, ${t} ms into the animation. Height is ${heightEl.textContent}.`);
          }
          paint();
          o.innerHTML = 'autoAdvance is on. Click Details and see what the test observes.';
          el.append(
            h('label', { class: 'switch', for: 'tst-dz-auto' }, sw, h('span', { html: hl('mainClock.autoAdvance = false') })),
            h('div', { class: 'controls' }, cmd('performClick()', click), cmd('mainClock.advanceTimeByFrame()', () => adv(16)), cmd('mainClock.advanceTimeBy(100)', () => adv(100))),
            h('div', { class: 'tst-split' },
              h('div', { class: 'phone tst-dz-phone' }, h('span', { class: 'tst-ph-btn' }, 'Details'), panel),
              h('div', { class: 'tst-sub' }, h('div', { class: 'tst-clocks' }, h('span', {}, 'mainClock ', clock), h('span', {}, 'panel height ', heightEl)))),
            o);
        },
      },
    ],
    underHood: {
      body: `<p>The compose rule hosts your content in an Activity and installs a test frame clock, the one you control through <code>mainClock</code>. Frames only happen when that clock advances.</p>
<p>Every finder first calls <code>waitForIdle()</code>. That loop advances the clock if <code>autoAdvance</code> is on, applies pending snapshot changes, and checks that the Recomposer has no pending work and the layout is clean. With Espresso on the classpath, it also waits for registered idling resources. Only then does it read the semantics tree.</p>`,
    },
    mistakes: [
      {
        title: 'Sleeping instead of waiting for a condition',
        bad: `rule.onNodeWithText("Refresh").performClick()
Thread.sleep(2_000)
rule.onNodeWithText("4 messages").assertIsDisplayed()`,
        good: `rule.onNodeWithText("Refresh").performClick()
rule.waitUntil(timeoutMillis = 5_000) {
    rule.onAllNodesWithText("4 messages").fetchSemanticsNodes().isNotEmpty()
}
rule.onNodeWithText("4 messages").assertIsDisplayed()`,
        why: 'A fixed sleep is too long on a fast machine and too short on a slow one. <code>waitUntil</code> returns as soon as the condition holds and fails clearly on timeout.',
      },
      {
        title: 'Asserting a lazy item that was never composed',
        bad: `rule.onNodeWithText("Invoice #40").assertIsDisplayed()`,
        good: `rule.onNodeWithTag("inbox_list")
    .performScrollToNode(hasText("Invoice #40"))
rule.onNodeWithText("Invoice #40").assertIsDisplayed()`,
        why: 'A <code>LazyColumn</code> only composes rows near the screen, so a row far down is not in the semantics tree at all. Scroll to it first.',
      },
      {
        title: 'Matching part of a text without substring',
        bad: `rule.onNodeWithText("messages").assertExists()   // the Text says "3 messages"`,
        good: `rule.onNodeWithText("messages", substring = true).assertExists()`,
        why: 'Text finders match the whole string by default. Pass <code>substring = true</code>, or better, match the full text the user sees.',
      },
    ],
  };

  Lab.addTrack({
    id: 'testing',
    title: 'Testing and quality',
    description: 'Fast, trustworthy tests from ViewModels to Compose screens, plus measuring how fast the app starts.',
    group: 'Going deeper', requires: ['arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'pyramid',
        title: 'The testing pyramid',
        tagline: 'Many fast tests at the bottom, a few slow ones on top.',
        level: 'beginner',
        body: `
<p>Android has two test folders. <code>src/test</code> holds <em>local unit tests</em>. They run on the JVM on your computer in milliseconds, with no device. <code>src/androidTest</code> holds <em>instrumented tests</em>. They run on a phone or emulator, so they can use real Android classes like Room and <code>Context</code>, and UI tests that drive whole screens.</p>
<p>Each step up the pyramid buys more confidence that the real app works, and costs more time, more setup and more flakiness. A UI test can take seconds. A unit test takes a few milliseconds.</p>
<p>So keep most tests at the bottom, where you run them on every change. Use the top layers for the few flows that must never break, like login or checkout. Run each layer below and compare the bars.</p>`,
        code: `// app/src/test/java/.../PriceFormatterTest.kt   (JVM, no device)
class PriceFormatterTest {
    @Test fun formatsLira() {
        assertEquals("₺12,50", PriceFormatter(Locale.forLanguageTag("tr-TR")).format(1250))
    }
}

// app/src/androidTest/java/.../CheckoutFlowTest.kt   (device or emulator)
@RunWith(AndroidJUnit4::class)
class CheckoutFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun payButtonOpensReceipt() {
        rule.onNodeWithText("Pay").performClick()
        rule.onNodeWithText("Receipt").assertIsDisplayed()
    }
}

// ./gradlew test                    runs src/test
// ./gradlew connectedAndroidTest    runs src/androidTest on a device`,
        remember: 'Most tests at the bottom: fast JVM unit tests. A few UI tests on top for the flows that must not break.',
        terms: [
          { term: 'Local unit test', def: 'A test in src/test that runs on the JVM on your computer, with no device or emulator.' },
          { term: 'Instrumented test', def: 'A test in src/androidTest that runs on a device or emulator and can use real Android framework classes.' },
          { term: 'Testing pyramid', def: 'A guideline to write many fast, small tests and fewer slow, broad ones such as end-to-end UI tests.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Name the Gradle tasks that run each folder.', code: './gradlew [[test|testDebugUnitTest]]                 // src/test on the JVM\n./gradlew [[connectedAndroidTest|connectedDebugAndroidTest]]   // src/androidTest on a device', why: '<code>test</code> runs local unit tests. <code>connectedAndroidTest</code> installs the app and the test APK on a connected device.' },
          { type: 'bug', prompt: 'This local unit test fails with “Method parse in android.net.Uri not mocked”. Tap the line that causes it.', code: '// app/src/test/java/.../LinkParserTest.kt\nclass LinkParserTest {\n    @Test fun extractsArticleId() {\n        val uri = Uri.parse("https://example.com/news/42")\n        assertEquals("42", LinkParser.articleId(uri))\n    }\n}', bug: 3, fix: '        val uri = URI("https://example.com/news/42")   // java.net.URI runs on the JVM', why: 'Local tests run against a stub android.jar where every Android method throws. Keep logic in plain Kotlin or Java types, move the test to androidTest, or use Robolectric.' },
        ],
        quiz: [
          { q: 'Which tests run on your computer without a device?', options: ['<code>src/test</code>', '<code>src/androidTest</code>', 'Both'], a: 0, why: 'Local unit tests in <code>src/test</code> run on the JVM. <code>androidTest</code> needs a device or emulator.' },
          { q: 'Why should most of your tests be local unit tests?', options: ['They give the most confidence that the real screen works', 'They are fast and stable enough to run on every change', 'Instrumented tests cannot use assertions'], a: 1, why: 'Milliseconds per test means you get feedback right away. The slower layers stay few.' },
          { q: 'Which layer tells you most directly that a real user can finish checkout?', options: ['A local unit test of the price formatter', 'A UI test that taps through the checkout screen'], a: 1, why: 'The UI test exercises the real screens together. That confidence is why you keep a few, even though they are slow.' },
        ],
        visual(el) {
          const layers = [
            { id: 'ui', name: 'UI tests', w: '46%', n: 6, ms: 4000, where: 'Device. Drives whole screens.', speed: 1, cost: 3, conf: 3 },
            { id: 'inst', name: 'Instrumented', w: '72%', n: 20, ms: 600, where: 'Device. Real Room, Context, files.', speed: 2, cost: 2, conf: 2 },
            { id: 'unit', name: 'Local unit', w: '100%', n: 200, ms: 8, where: 'JVM on your computer. No device.', speed: 3, cost: 1, conf: 1 },
          ];
          const total = Math.max(...layers.map(l => l.n * l.ms));
          let sel = layers[2], busy = false;
          const dots = n => h('span', { class: 'tst-dots', 'aria-label': `${n} of 3` }, [1, 2, 3].map(i => h('i', { class: i <= n ? 'on' : null })));
          const info = h('div', { class: 'tst-info' });
          const btns = layers.map(l => h('button', { class: `tst-layer tst-${l.id}`, style: `--tst-w:${l.w}`, onclick: () => pick(l) }, l.name, h('small', {}, `${l.n} tests`)));
          function pick(l) {
            sel = l;
            btns.forEach((b, i) => b.setAttribute('aria-pressed', layers[i] === l));
            info.replaceChildren(
              h('span', { class: 'tst-label' }, 'Runs on'), h('span', {}, l.where),
              h('span', { class: 'tst-label' }, 'Speed'), dots(l.speed),
              h('span', { class: 'tst-label' }, 'Cost to keep'), dots(l.cost),
              h('span', { class: 'tst-label' }, 'Confidence'), dots(l.conf));
            replay(info, 'pop-soft');
          }
          const bars = {}, stats = {};
          const tl = h('div', { class: 'timeline' }, layers.map(l => {
            bars[l.id] = h('span', { class: `bar tst-c-${l.id}`, style: 'left:0;width:0' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, l.name), h('div', { class: 'lane-track' }, bars[l.id]));
          }));
          const statRow = h('div', { class: 'tst-stats' }, layers.map(l => (stats[l.id] = h('span'))));
          const clock = h('span', { class: 'clock' }, '0 s');
          const o = out();
          const draw = (l, t) => {
            const elapsed = Math.min(t, l.n * l.ms);
            bars[l.id].style.width = (elapsed / total) * 100 + '%';
            stats[l.id].innerHTML = `${l.name}: <b>${Math.floor(elapsed / l.ms)}/${l.n}</b> in <b>${fmt(elapsed)}</b>`;
          };
          function run(ids, label) {
            if (busy) return; busy = true;
            const sel = layers.filter(l => ids.includes(l.id));
            const end = Math.max(...sel.map(l => l.n * l.ms));
            layers.forEach(l => draw(l, 0));
            say(o, `<span class="muted">$</span> ${label}`);
            const t0 = performance.now();
            const tick = now => {
              if (!el.isConnected) return;
              const t = Math.min((now - t0) * 8, end); // 8x fast forward
              sel.forEach(l => draw(l, t));
              clock.textContent = fmt(t);
              if (t < end) { requestAnimationFrame(tick); return; }
              const slow = sel.reduce((a, b) => (a.n * a.ms > b.n * b.ms ? a : b));
              o.append(h('div', { class: 'line drop-in', html: `<span class="good">BUILD SUCCESSFUL</span> in ${fmt(end)}. Slowest: ${slow.name}, ${fmt(slow.ms)} per test.` }));
              busy = false;
            };
            requestAnimationFrame(tick);
          }
          pick(sel);
          layers.forEach(l => draw(l, l.n * l.ms));
          clock.textContent = fmt(total);
          o.innerHTML = 'Last run: 226 tests. 200 unit tests took 1.6 s. 6 UI tests took 24 s.';
          el.append(
            h('div', { class: 'tst-cols' }, h('div', { class: 'tst-pyr' }, btns), h('div', { class: 'tst-sub' }, h('span', { class: 'tst-label' }, 'Tap a layer'), info)),
            h('div', { class: 'controls' },
              cmd('./gradlew test', () => run(['unit'], './gradlew test')),
              cmd('./gradlew connectedAndroidTest', () => run(['inst', 'ui'], './gradlew connectedAndroidTest')),
              h('button', { class: 'btn primary small', onclick: () => run(['unit', 'inst', 'ui'], 'run every layer') }, 'Run everything'),
              clock),
            tl, statRow,
            h('p', { class: 'tip' }, 'Shown at 8x speed. Device layers also pay for building and installing two APKs before the first test runs.'),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'fakes',
        title: 'Unit tests with fakes',
        tagline: 'Swap the network for a small in-memory class.',
        level: 'beginner',
        body: `
<p>A ViewModel usually depends on a repository that talks to the network or a database. Use the real one in a unit test and the test gets slow, needs a connection, and fails whenever the server data changes.</p>
<p>The fix is a <em>fake</em>: a small, working implementation of the same interface that keeps data in memory. The ViewModel takes the interface in its constructor, so the test can hand it the fake. A fake behaves like the real thing, which makes it easier to read and less brittle than a mock that scripts every call.</p>
<p>Write each test in three parts. <b>Given</b> sets up the fake. <b>When</b> does one thing. <b>Then</b> checks the result. Run the test below with the real repository, then flip to the fake.</p>`,
        code: `interface NewsRepository {
    suspend fun latest(): List<Article>
}

class FakeNewsRepository : NewsRepository {
    var articles = emptyList<Article>()
    var error: Exception? = null

    override suspend fun latest(): List<Article> {
        error?.let { throw it }
        return articles
    }
}

class NewsViewModelTest {
    @get:Rule val mainRule = MainDispatcherRule()   // see the next lesson

    @Test fun loadShowsArticles() = runTest {
        // Given
        val repo = FakeNewsRepository().apply { articles = listOf(Article("Kotlin 2.3 is out")) }
        val vm = NewsViewModel(repo)
        // When
        vm.load()
        // Then
        assertEquals(UiState.Success(repo.articles), vm.state.value)
    }

    @Test fun loadShowsErrorWhenOffline() = runTest {
        val repo = FakeNewsRepository().apply { error = IOException("offline") }
        val vm = NewsViewModel(repo)
        vm.load()
        assertEquals(UiState.Error("offline"), vm.state.value)
    }
}`,
        remember: 'Depend on an interface, test with a fake. Given, When, Then.',
        terms: [
          { term: 'Test double', def: 'Any object that stands in for a real dependency during a test, such as a fake, stub or mock.' },
          { term: 'Fake', def: 'A simple working implementation of an interface, often in memory, used in tests instead of the real one.' },
          { term: 'Given / When / Then', def: 'A test layout: set up the state, perform one action, then assert on the outcome.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete the fake so the ViewModel can use it.', code: 'class FakeNewsRepository : [[NewsRepository]] {\n    var articles = emptyList<Article>()\n    [[override]] suspend fun latest(): List<Article> = articles\n}', why: 'The fake implements the same interface the ViewModel depends on, and overrides its function with an in-memory answer.' },
          { type: 'bug', prompt: 'This test passes on your machine and fails on CI at random. Tap the line that makes it flaky.', code: '@Test fun loadShowsArticles() = runTest {\n    val article = Article("Kotlin 2.3 is out")\n    val repo = NewsRepositoryImpl(RetrofitClient.api)\n    val vm = NewsViewModel(repo)\n    vm.load()\n    assertEquals(UiState.Success(listOf(article)), vm.state.value)\n}', bug: 2, fix: '    val repo = FakeNewsRepository().apply { articles = listOf(article) }', why: 'The real repository calls the live server. The test then depends on the network and on whatever the server returns today.' },
        ],
        quiz: [
          { q: 'What makes a fake different from a mock?', options: ['A fake is a small working implementation; a mock is scripted per call', 'A fake can only be used in UI tests', 'There is no difference'], a: 0, why: 'A fake really stores and returns data. A mock answers only the calls you told it to expect.' },
          { q: 'What has to be true about <code>NewsViewModel</code> so a test can pass it a fake?', options: ['It creates its repository inside init', 'It takes a NewsRepository interface in its constructor', 'It is an object'], a: 1, why: 'Constructor injection of an interface lets the test choose the implementation.' },
          { q: 'In Given / When / Then, where does <code>vm.load()</code> go?', options: ['Given', 'When', 'Then'], a: 1, why: 'When is the one action under test. Given sets up the fake, Then asserts.' },
        ],
        visual(el) {
          const runsReal = [
            { ms: 1240, ok: true }, { ms: 3000, ok: false, msg: 'SocketTimeoutException: timeout' },
            { ms: 860, ok: true }, { ms: 1530, ok: false, msg: 'expected 1 article but was 4. The server data changed.' }, { ms: 990, ok: true },
          ];
          let fake = false, busy = false, n = 0;
          const lines = [
            ['given', () => (fake ? 'val repo = FakeNewsRepository().apply { articles = listOf(a) }' : 'val repo = NewsRepositoryImpl(api)')],
            ['given', () => 'val vm = NewsViewModel(repo)'],
            ['when', () => 'vm.load()'],
            ['then', () => 'assertEquals(Success(listOf(a)), vm.state.value)'],
          ];
          const rows = lines.map(() => h('div', { class: 'tst-gwt-line' }));
          const paintLines = () => lines.forEach(([k, f], i) => { rows[i].innerHTML = `<span class="t-c">${k === 'given' && i ? '     ' : k.padEnd(5)}</span> ` + hl(f()); });
          const depName = h('b'), depNote = h('small'), depStatus = h('span');
          const dep = h('div', { class: 'tst-dep' }, depName, depNote, depStatus);
          const link = h('span', { class: 'tst-link' }, '→');
          const hist = h('div', { class: 'tst-hist', 'aria-label': 'Test run history' });
          const toggle = h('input', { type: 'checkbox', id: 'tst-fake-toggle' });
          const o = out();
          function paint() {
            paintLines();
            dep.classList.toggle('tst-fake', fake);
            depName.textContent = fake ? 'FakeNewsRepository' : 'NewsRepositoryImpl';
            depNote.textContent = fake ? 'list in memory' : 'HTTPS to api.example.com';
            depStatus.textContent = 'idle';
          }
          async function once() {
            const r = fake ? { ms: 3 + (n % 3), ok: true } : runsReal[n % runsReal.length];
            n++;
            rows.forEach(x => { x.className = 'tst-gwt-line'; });
            for (let i = 0; i < 3; i++) { rows[i].classList.add('tst-on'); await sleep(i === 2 ? 120 : 220); if (!el.isConnected) return; rows[i].classList.remove('tst-on'); }
            rows[2].classList.add('tst-on'); link.classList.add('tst-busy');
            depStatus.textContent = fake ? 'returns the list' : 'waiting for server…';
            await sleep(fake ? 160 : r.ms * 0.6);
            link.classList.remove('tst-busy'); rows[2].classList.remove('tst-on');
            depStatus.textContent = r.ok ? 'returned 1 article' : 'failed';
            rows[3].classList.add(r.ok ? 'tst-pass' : 'tst-fail');
            hist.append(h('span', { class: `tst-res drop-in${r.ok ? '' : ' tst-bad'}` }, `${r.ok ? 'pass' : 'fail'} ${fmt(r.ms)}`));
            say(o, r.ok ? `<span class="good">PASSED</span> in ${fmt(r.ms)}` : `<span class="bad">FAILED</span> after ${fmt(r.ms)}: ${r.msg}`);
            if (!r.ok) replay(dep, 'shake');
          }
          async function runMany(k) {
            if (busy) return; busy = true;
            for (let i = 0; i < k && el.isConnected; i++) await once();
            busy = false;
          }
          toggle.addEventListener('change', () => {
            if (busy) { toggle.checked = fake; return; }
            fake = toggle.checked; n = 0; hist.replaceChildren(); paint();
            say(o, fake ? 'Same test, fake dependency. Run it a few times.' : 'Real network again. Run it a few times.');
          });
          paint();
          runsReal.slice(0, 3).forEach(r => hist.append(h('span', { class: `tst-res${r.ok ? '' : ' tst-bad'}` }, `${r.ok ? 'pass' : 'fail'} ${fmt(r.ms)}`)));
          n = 3;
          o.innerHTML = 'Three earlier runs against the real server: slow, and one failed. Flip to the fake and run again.';
          el.append(
            h('label', { class: 'switch', for: 'tst-fake-toggle' }, toggle, 'Use FakeNewsRepository'),
            h('div', { class: 'tst-wire' }, h('div', { class: 'tst-gwt' }, rows), link, dep),
            h('div', { class: 'controls' },
              h('button', { class: 'btn primary small', onclick: () => runMany(1) }, 'Run test'),
              h('button', { class: 'btn small', onclick: () => runMany(5) }, 'Run 5 times')),
            h('div', { class: 'tst-sub' }, h('span', { class: 'tst-label' }, 'Run history'), hist),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'coroutines',
        title: 'Testing coroutines',
        tagline: 'runTest skips delays with a virtual clock.',
        level: 'intermediate',
        body: `
<p>Wrap coroutine tests in <code>runTest</code>. It runs on a test scheduler with a <em>virtual clock</em>: <code>delay(2_000)</code> moves that clock forward by two seconds and returns at once. A retry with backoff that waits three seconds for real finishes in a few milliseconds.</p>
<p>Code in <code>viewModelScope</code> runs on <code>Dispatchers.Main</code>, which does not exist on the JVM. Swap it with <code>Dispatchers.setMain</code>, usually inside a small JUnit rule. With a <code>StandardTestDispatcher</code>, a launched coroutine waits in the queue until you call <code>advanceUntilIdle()</code> or <code>runCurrent()</code>. An <code>UnconfinedTestDispatcher</code> starts it right away and runs it up to its first suspension.</p>
<p>Inject other dispatchers too, and create them as <code>StandardTestDispatcher(testScheduler)</code> so every coroutine shares one clock.</p>`,
        code: `class MainDispatcherRule(
    val testDispatcher: TestDispatcher = UnconfinedTestDispatcher(),
) : TestWatcher() {
    override fun starting(description: Description) = Dispatchers.setMain(testDispatcher)
    override fun finished(description: Description) = Dispatchers.resetMain()
}

// In SyncViewModel:
fun sync() = viewModelScope.launch {
    _state.value = SyncState.Syncing
    repeat(3) { attempt ->
        if (repo.trySync()) { _state.value = SyncState.Done; return@launch }
        delay(1_000L * (attempt + 1))      // 1 s, then 2 s
    }
    _state.value = SyncState.Failed
}

class SyncViewModelTest {
    @get:Rule val mainRule = MainDispatcherRule(StandardTestDispatcher())

    @Test fun retriesThenSucceeds() = runTest {
        val vm = SyncViewModel(FakeSyncRepository(failuresBeforeSuccess = 2))
        vm.sync()
        assertEquals(SyncState.Idle, vm.state.value)   // queued, not run yet
        advanceUntilIdle()                              // runs it and skips both delays
        assertEquals(SyncState.Done, vm.state.value)
        assertEquals(3_000L, currentTime)               // virtual milliseconds
    }
}`,
        remember: 'runTest skips delay() on a virtual clock. Standard queues until you advance; Unconfined runs at once.',
        terms: [
          { term: 'runTest', def: 'A coroutine test builder that runs the body on a test scheduler whose virtual clock skips delays.' },
          { term: 'StandardTestDispatcher', def: 'A test dispatcher that queues new coroutines until the test advances the scheduler.' },
          { term: 'UnconfinedTestDispatcher', def: 'A test dispatcher that starts new coroutines immediately and runs them until their first suspension.' },
          { term: 'MainDispatcherRule', def: 'A common JUnit rule that calls Dispatchers.setMain with a test dispatcher before each test and resetMain after.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the test on virtual time and let the queued coroutine finish.', code: '@Test fun showsDoneAfterSync() = [[runTest]] {\n    vm.sync()\n    [[advanceUntilIdle]]()\n    assertEquals(SyncState.Done, vm.state.value)\n}', why: '<code>runTest</code> gives you the virtual clock. <code>advanceUntilIdle()</code> runs every queued task and skips their delays.' },
          { type: 'bug', prompt: 'In a test class without a Main dispatcher rule, the state can stay <code>Syncing</code> after <code>advanceUntilIdle()</code>. Tap the fragile line.', code: '@Test fun syncFinishes() = runTest {\n    val repo = FakeSyncRepository()\n    val vm = SyncViewModel(repo, ioDispatcher = StandardTestDispatcher())\n    vm.sync()\n    advanceUntilIdle()\n    assertEquals(SyncState.Done, vm.state.value)\n}', bug: 2, fix: '    val vm = SyncViewModel(repo, ioDispatcher = StandardTestDispatcher(testScheduler))', why: 'Without an argument, <code>StandardTestDispatcher()</code> borrows the scheduler of a test Main dispatcher if one is installed, and otherwise creates its own. Then advancing the test’s scheduler never runs its tasks. Pass <code>testScheduler</code> so every dispatcher shares one clock.' },
        ],
        quiz: [
          { q: 'Inside <code>runTest</code>, how long does <code>delay(10_000)</code> take on the wall clock?', options: ['About 10 seconds', 'Almost no time; the virtual clock jumps ahead', 'It throws'], a: 1, why: 'The test scheduler advances virtual time instead of waiting.' },
          { q: 'Main is a <code>StandardTestDispatcher</code>. Right after <code>vm.sync()</code>, has the launched coroutine run?', options: ['Yes, up to its first delay', 'No, it waits in the queue until you advance'], a: 1, why: 'Standard queues new coroutines. Unconfined would start it right away.' },
          { q: 'Why does a ViewModel test need <code>Dispatchers.setMain</code>?', options: ['viewModelScope uses Dispatchers.Main, which the JVM does not have', 'It makes tests run in parallel', 'runTest requires it'], a: 0, why: 'Without a replacement, launching in viewModelScope fails because there is no Android main looper.' },
        ],
        deeper: coroutinesDepth.deeper,
        underHood: coroutinesDepth.underHood,
        mistakes: coroutinesDepth.mistakes,
        visual(el) {
          // Part A: real vs virtual time
          const steps = [[0, 'attempt 1 failed'], [1000, 'attempt 2 failed'], [3000, 'attempt 3 ok: Done']];
          const END = 3000;
          let busyA = false;
          const real = h('span', { class: 'bar wait', style: 'left:0;width:0' });
          const virt = h('span', { class: 'bar run', style: 'left:0;width:0' });
          const ticks = t => steps.map(([at]) => h('span', { class: 'tst-tick', style: `left:${(at / END) * 100}%`, hidden: t < at }));
          let realTicks = ticks(END), virtTicks = ticks(END);
          const realTrack = h('div', { class: 'lane-track' }, real, realTicks);
          const virtTrack = h('div', { class: 'lane-track' }, virt, virtTicks);
          const vClock = h('b', { class: 'tst-vt' }, '3000 ms'), wClock = h('b', {}, '4 ms');
          const oa = out();
          const resetA = () => { real.style.width = '0'; virt.style.width = '0'; [...realTicks, ...virtTicks].forEach(x => { x.hidden = true; }); };
          async function realRun() {
            if (busyA) return; busyA = true; resetA();
            say(oa, hl('runBlocking { vm.sync() }') + ' <span class="muted">// real delays, plays at real speed</span>');
            const t0 = performance.now();
            await new Promise(done => {
              const tick = now => {
                if (!el.isConnected) return done();
                const t = Math.min(now - t0, END);
                real.style.width = (t / END) * 100 + '%';
                realTicks.forEach((x, i) => { x.hidden = t < steps[i][0]; });
                vClock.textContent = Math.round(t) + ' ms'; wClock.textContent = Math.round(t) + ' ms';
                if (t < END) requestAnimationFrame(tick); else done();
              };
              requestAnimationFrame(tick);
            });
            oa.append(h('div', { class: 'line drop-in' }, 'Done after 3 s of waiting. Every run of this test costs 3 s.'));
            busyA = false;
          }
          async function virtRun() {
            if (busyA) return; busyA = true; resetA();
            say(oa, hl('runTest { vm.sync(); advanceUntilIdle() }'));
            for (let i = 0; i < steps.length; i++) {
              const [at, msg] = steps[i];
              virt.style.transition = 'width 0.12s'; virt.style.width = (at / END) * 100 + '%';
              virtTicks[i].hidden = false;
              vClock.textContent = at + ' ms'; replay(vClock, 'pop');
              wClock.textContent = (i + 1) * 2 + ' ms';
              oa.append(h('div', { class: 'line drop-in' }, `virtual ${at} ms: ${msg}`));
              await sleep(260);
              if (!el.isConnected) return;
            }
            virt.style.transition = '';
            oa.append(h('div', { class: 'line drop-in', html: '<span class="good">PASSED</span> in about 6 ms of wall time' }));
            busyA = false;
          }
          real.style.width = '100%'; virt.style.width = '100%';
          oa.innerHTML = 'Both runs finished. Same code, same 3000 ms of delays. Only the real one waited.';

          // Part B: Standard vs Unconfined
          let mode = 'standard', vt = 0, state = 'Idle', queue = [], started = false, busyB = false;
          const queueEl = h('div', { class: 'tst-queue', 'aria-label': 'Scheduler queue' });
          const stateSlot = h('span', {}, h('span', { class: 'chip' }, 'Idle'));
          const vtEl = h('b', { class: 'tst-vt' }, '0 ms');
          const ob = out();
          const modeBtns = [['standard', 'StandardTestDispatcher()'], ['unconfined', 'UnconfinedTestDispatcher()']].map(([k, src]) => cmd(src, () => { if (busyB) return; mode = k; resetB(); }));
          const setState = s => { state = s; stateSlot.replaceChildren(h('span', { class: 'chip drop-in' }, s)); };
          const paintQ = () => queueEl.replaceChildren(...queue.map(q => h('span', { class: 'tst-task drop-in' }, q.label)));
          function phase(p) {
            if (p === 0) { setState('Syncing'); queue.push({ p: 1, at: vt + 1000, label: `resume at ${vt + 1000} ms` }); return 'attempt 1 failed, delay(1000)'; }
            if (p === 1) { queue.push({ p: 2, at: vt + 2000, label: `resume at ${vt + 2000} ms` }); return 'attempt 2 failed, delay(2000)'; }
            setState('Done'); return 'attempt 3 ok';
          }
          function resetB() {
            vt = 0; queue = []; started = false; setState('Idle'); paintQ(); vtEl.textContent = '0 ms';
            modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', ['standard', 'unconfined'][i] === mode));
            say(ob, `Main is ${mode === 'standard' ? 'Standard' : 'Unconfined'}. Call ${hl('vm.sync()')}.`);
          }
          function sync() {
            if (busyB) return;
            if (started) { say(ob, 'sync() already launched. Advance, or pick a dispatcher to start over.'); return; }
            started = true;
            if (mode === 'standard') {
              queue.push({ p: 0, at: vt, label: 'launch { sync body }' }); paintQ();
              say(ob, `${hl('vm.sync()')} <span class="muted">// queued. state is still</span> Idle`);
            } else {
              const msg = phase(0); paintQ();
              say(ob, `${hl('vm.sync()')} <span class="muted">// ran at once:</span> ${msg}`);
            }
          }
          async function advance() {
            if (busyB) return;
            if (!queue.length) { say(ob, `${hl('advanceUntilIdle()')} <span class="muted">// nothing queued</span>`); return; }
            busyB = true; say(ob, hl('advanceUntilIdle()'));
            while (queue.length && el.isConnected) {
              queue.sort((a, b) => a.at - b.at);
              const q = queue.shift(); paintQ();
              if (q.at > vt) { vt = q.at; vtEl.textContent = vt + ' ms'; replay(vtEl, 'pop'); }
              await sleep(380);
              ob.append(h('div', { class: 'line drop-in' }, `${vt} ms: ${phase(q.p)}`)); paintQ();
              await sleep(380);
            }
            busyB = false;
          }
          resetB();

          el.append(
            h('div', { class: 'tst-sub' },
              h('span', { class: 'tst-label' }, 'Same retry, two clocks'),
              h('div', { class: 'controls' }, cmd('runBlocking { … }', realRun), cmd('runTest { … }', virtRun)),
              h('div', { class: 'tst-clocks' }, h('span', {}, 'virtual time ', vClock), h('span', {}, 'wall time ', wClock)),
              h('div', { class: 'timeline' },
                h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'real clock'), realTrack),
                h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'virtual clock'), virtTrack)),
              oa),
            h('div', { class: 'tst-sub' },
              h('span', { class: 'tst-label' }, 'Who runs the launched coroutine, and when'),
              h('div', { class: 'controls' }, modeBtns),
              h('div', { class: 'controls' }, cmd('vm.sync()', sync), cmd('advanceUntilIdle()', advance)),
              h('div', { class: 'tst-clocks' }, h('span', { class: 'tst-state' }, 'vm.state ', stateSlot), h('span', {}, 'currentTime ', vtEl)),
              queueEl, ob));
          wClock.textContent = '6 ms'; vClock.textContent = '3000 ms';
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'flows',
        title: 'Testing Flows',
        tagline: 'Collect emissions into a queue, then assert one at a time.',
        level: 'intermediate',
        body: `
<p>A <code>StateFlow</code> never completes, so calling <code>collect</code> in a test body hangs. You need a collector that runs alongside the test and records what arrives.</p>
<p><b>Turbine</b> does this for you. Inside <code>flow.test { }</code> every emission lands in a queue. <code>awaitItem()</code> takes the next one, or fails if nothing arrives within 3 seconds. When the block ends, any item you did not consume fails the test, so surprise emissions can’t hide. Call <code>cancelAndIgnoreRemainingEvents()</code> when you only care about the first few.</p>
<p>Without Turbine, launch a collector in <code>backgroundScope</code> with an <code>UnconfinedTestDispatcher</code> and append to a list. <code>runTest</code> cancels that scope when the test ends. Step through the test below, and try the extra buttons to see each failure.</p>`,
        code: `@Test fun showsArticlesAfterRefresh() = runTest {
    val repo = FakeNewsRepository()     // backed by a MutableStateFlow
    val vm = NewsViewModel(repo)

    vm.uiState.test {
        assertEquals(UiState.Loading, awaitItem())
        repo.emit(listOf(article))
        assertEquals(UiState.Success(listOf(article)), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}

// Without Turbine
@Test fun collectsIntoList() = runTest {
    val repo = FakeNewsRepository()
    val vm = NewsViewModel(repo)
    val values = mutableListOf<UiState>()
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
        vm.uiState.toList(values)
    }
    repo.emit(listOf(article))
    assertEquals(UiState.Success(listOf(article)), values.last())
}`,
        remember: 'Turbine queues every emission. awaitItem() takes one; leftovers fail the test.',
        terms: [
          { term: 'Turbine', def: 'A small testing library by Cash App that collects a Flow into a queue so a test can await and assert each event.' },
          { term: 'awaitItem()', def: 'A Turbine call that suspends until the next emission arrives and returns it, failing after a timeout.' },
          { term: 'backgroundScope', def: 'A scope inside runTest for coroutines that should run alongside the test and be cancelled when it ends.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Collect with Turbine and take the first emission.', code: 'vm.uiState.[[test]] {\n    assertEquals(UiState.Loading, [[awaitItem]]())\n    repo.emit(listOf(article))\n    assertEquals(UiState.Success(listOf(article)), awaitItem())\n}', why: '<code>test { }</code> starts collecting into a queue. <code>awaitItem()</code> takes the next event from it.' },
          { type: 'bug', prompt: 'This test never finishes. Tap the line that hangs.', code: '@Test fun emitsSuccess() = runTest {\n    val values = mutableListOf<UiState>()\n    vm.uiState.collect { values += it }\n    repo.emit(listOf(article))\n    assertEquals(UiState.Success(listOf(article)), values.last())\n}', bug: 2, fix: '    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.uiState.toList(values) }', why: 'A StateFlow never completes, so <code>collect</code> suspends forever and the lines after it never run. Collect in <code>backgroundScope</code> instead.' },
        ],
        quiz: [
          { q: 'Inside Turbine’s <code>test { }</code>, you call <code>awaitItem()</code> and nothing is emitted. What happens?', options: ['It returns null', 'It fails after the timeout, 3 seconds by default', 'It waits forever'], a: 1, why: 'Turbine fails with “No value produced” once the timeout passes.' },
          { q: 'The block ends with one emission still in the queue. Result?', options: ['The test passes', 'The test fails with unconsumed events'], a: 1, why: 'Turbine checks the queue is empty at the end. Use <code>cancelAndIgnoreRemainingEvents()</code> if leftovers are fine.' },
          { q: 'What is the first item a <code>StateFlow</code> gives a new collector?', options: ['Its current value, right away', 'Nothing until the next change'], a: 0, why: 'StateFlow always has a value and replays it to every new collector.' },
        ],
        visual(el) {
          const script = [
            { src: 'vm.uiState.test {', kind: 'start' },
            { src: '    assertEquals(Loading, awaitItem())', kind: 'await', want: 'Loading' },
            { src: '    repo.emit(listOf(article))', kind: 'emit', ev: 'Success(1 article)' },
            { src: '    assertEquals(Success(1 article), awaitItem())', kind: 'await', want: 'Success(1 article)' },
            { src: '    cancelAndIgnoreRemainingEvents()', kind: 'cancel' },
            { src: '}', kind: 'end' },
          ];
          let pc, queue, live, done, cur, busy = false;
          const rows = script.map(s => h('div', { class: 'tst-gwt-line', html: hl(s.src) }));
          const flowVal = h('span', {});
          const flowLane = h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'vm.uiState'), h('div', { class: 'tst-evs' }, flowVal));
          const qEl = h('div', { class: 'tst-evs', 'aria-label': 'Turbine queue' });
          const qLane = h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'Turbine queue'), qEl);
          const aEl = h('div', { class: 'tst-evs' });
          const aLane = h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'Asserted'), aEl);
          const timer = h('span', { class: 'tst-timer' });
          const cancelBox = h('input', { type: 'checkbox', id: 'tst-cancel-toggle', checked: true });
          const o = out();
          const setFlow = v => { cur = v; flowVal.replaceChildren(h('span', { class: 'tst-ev drop-in' }, v)); };
          const pushQ = v => { const e = h('span', { class: 'tst-ev drop-in' }, v); queue.push({ v, el: e }); qEl.append(e); };
          function reset() {
            pc = 0; queue = []; live = false; done = false;
            qEl.replaceChildren(); aEl.replaceChildren(); setFlow('Loading'); timer.textContent = '';
            qLane.classList.remove('tst-live');
            paintRows();
            say(o, 'Press Step to run the test one line at a time.');
          }
          function paintRows() {
            rows.forEach((r, i) => {
              r.className = 'tst-gwt-line' + (i < pc ? ' tst-pass' : '') + (i === pc && !done ? ' tst-on' : '');
              if (script[i].kind === 'cancel' && !cancelBox.checked) r.classList.add('tst-skip');
            });
          }
          function fail(msg) {
            done = true; live = false; qLane.classList.remove('tst-live');
            paintRows(); rows[Math.min(pc, rows.length - 1)].className = 'tst-gwt-line tst-fail';
            say(o, `<span class="bad">FAILED</span> ${msg}`); replay(o, 'shake');
          }
          async function take(want) {
            if (!queue.length) {
              for (let s = 3; s > 0; s--) { timer.textContent = `awaitItem() waiting… ${s} s`; await sleep(1000); if (!el.isConnected) return false; }
              timer.textContent = '';
              fail('No value produced in 3s');
              return false;
            }
            const q = queue.shift();
            q.el.classList.add('leave'); await sleep(380); q.el.remove();
            const ok = want == null || q.v === want;
            aEl.append(h('span', { class: `tst-ev drop-in ${ok ? 'tst-ok' : 'tst-no'}` }, q.v));
            if (!ok) { fail(`expected: ${want} but was: ${q.v}`); return false; }
            return true;
          }
          async function step() {
            if (busy) return;
            if (done) { reset(); return; }
            busy = true;
            const s = script[pc];
            if (s.kind === 'start') {
              live = true; qLane.classList.add('tst-live');
              await sleep(200); pushQ('Loading');
              say(o, 'Collecting. A StateFlow sends its current value first.');
            } else if (s.kind === 'await') {
              if (!(await take(s.want))) { busy = false; return; }
              say(o, `<span class="good">ok</span> awaitItem() returned ${s.want}`);
            } else if (s.kind === 'emit') {
              setFlow(s.ev); await sleep(300); pushQ(s.ev);
              say(o, 'The fake emits, the ViewModel maps it, the item lands in the queue.');
            } else if (s.kind === 'cancel') {
              if (cancelBox.checked) {
                queue.forEach(q => q.el.classList.add('tst-gone')); queue = [];
                live = false; qLane.classList.remove('tst-live');
                say(o, 'Collection cancelled. Leftover items are ignored.');
              } else say(o, '<span class="muted">// line removed</span>');
            } else {
              if (queue.length) { fail(`Unconsumed events found: ${queue.map(q => q.v).join(', ')}`); busy = false; return; }
              live = false; qLane.classList.remove('tst-live'); done = true;
              say(o, '<span class="good">PASSED</span> Every emission was accounted for.');
            }
            pc++; paintRows(); busy = false;
            if (done) rows.forEach(r => r.classList.remove('tst-on'));
          }
          async function extraEmit() {
            if (busy) return;
            if (!live) { say(o, 'Nobody is collecting yet, or collection already stopped.'); return; }
            if (cur === 'Success(0 articles)') { say(o, 'StateFlow skips a value equal to its current one. Nothing new reaches the queue.'); replay(flowLane, 'shake'); return; }
            setFlow('Success(0 articles)'); await sleep(250); pushQ('Success(0 articles)');
            say(o, 'An extra emission joined the queue. Keep stepping and see what it breaks.');
          }
          async function extraAwait() {
            if (busy || done) return;
            if (!live) { say(o, 'Call awaitItem() inside the test block. Step into it first.'); return; }
            busy = true;
            if (await take(null)) say(o, 'awaitItem() consumed one item without asserting on it.');
            busy = false;
          }
          cancelBox.addEventListener('change', () => { if (!busy) { paintRows(); } });
          reset();
          el.append(
            h('div', { class: 'tst-cols' }, flowLane, qLane, aLane),
            h('div', { class: 'tst-script' }, rows),
            h('div', { class: 'controls' },
              h('button', { class: 'btn primary small', onclick: step }, 'Step'),
              cmd('repo.emit(emptyList())', extraEmit),
              cmd('awaitItem()', extraAwait),
              timer),
            h('label', { class: 'switch', for: 'tst-cancel-toggle' }, cancelBox, 'Keep cancelAndIgnoreRemainingEvents()'),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'compose-ui',
        title: 'Compose UI tests',
        tagline: 'Find nodes in the semantics tree, act, assert.',
        level: 'intermediate',
        body: `
<p>Compose tests don’t look at pixels. They read the <em>semantics tree</em>, a parallel description of the UI that accessibility services also use: text, content descriptions, roles, test tags and available actions.</p>
<p><code>createComposeRule()</code> gives you a host to <code>setContent</code> on. A <em>finder</em> like <code>onNodeWithText</code> or <code>onNodeWithTag</code> must match exactly one node. Then you act with <code>performClick()</code> and check with <code>assertIsDisplayed()</code> or <code>assertTextEquals()</code>. The rule waits for the UI to be idle between steps, so you don’t need sleeps.</p>
<p>By default finders search the <em>merged</em> tree: a <code>Button</code> absorbs its child <code>Text</code>, so <code>onNodeWithText("Refresh")</code> finds the clickable button itself. Pick a finder below and watch which node it matches.</p>`,
        code: `@Composable
fun InboxScreen(viewModel: InboxViewModel = viewModel()) {
    val messages by viewModel.messages.collectAsStateWithLifecycle()
    Column {
        Text("Inbox", style = MaterialTheme.typography.headlineSmall)
        Text("\${messages.size} messages")
        LazyColumn(Modifier.testTag("inbox_list")) {
            items(messages, key = { it.id }) { Text(it.subject) }
        }
        Button(onClick = viewModel::refresh) { Text("Refresh") }
    }
}

class InboxScreenTest {
    @get:Rule val rule = createComposeRule()

    @Test fun refreshAddsMessage() {
        rule.setContent { InboxScreen(InboxViewModel(FakeInboxRepository(count = 3))) }
        rule.onNodeWithText("3 messages").assertIsDisplayed()
        rule.onNodeWithText("Refresh").performClick()
        rule.onNodeWithText("4 messages").assertIsDisplayed()
        rule.onNodeWithTag("inbox_list").onChildren().assertCountEquals(4)
    }
}`,
        remember: 'Find one node in the semantics tree, perform an action, assert. Tags for things without text.',
        terms: [
          { term: 'Semantics tree', def: 'The tree of meaning Compose builds alongside the UI, read by tests and accessibility services.' },
          { term: 'createComposeRule', def: 'A JUnit rule that hosts composable content in a test and synchronizes with Compose before each check.' },
          { term: 'Modifier.testTag', def: 'A modifier that puts a string tag in the semantics tree so tests can find the node with onNodeWithTag.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Create the rule, tap Refresh, then check the new count is visible.', code: '@get:Rule val rule = [[createComposeRule]]()\n\n@Test fun refreshAddsMessage() {\n    rule.setContent { InboxScreen() }\n    rule.onNodeWithText("Refresh").[[performClick]]()\n    rule.onNodeWithText("4 messages").[[assertIsDisplayed]]()\n}', why: 'Rule, finder, action, assertion: that is the whole shape of a Compose UI test.' },
          { type: 'bug', prompt: 'This fails with “Expected exactly \'1\' node but found \'3\' nodes”. Tap the line.', code: '@Test fun deletesFirstMessage() {\n    rule.setContent { InboxScreen(messages = sampleMessages) }   // 3 rows, each with a Delete button\n    rule.onNodeWithText("Delete").performClick()\n    rule.onNodeWithText("2 messages").assertIsDisplayed()\n}', bug: 2, fix: '    rule.onAllNodesWithText("Delete").onFirst().performClick()', why: 'Single-node finders demand exactly one match. Use <code>onAllNodes…</code> and pick one, or give each row a unique test tag.' },
        ],
        quiz: [
          { q: 'What does a Compose UI test read to find nodes?', options: ['The rendered pixels', 'The semantics tree', 'The Kotlin source code'], a: 1, why: 'Finders match semantics properties like text, tags and content descriptions.' },
          { q: '<code>Button { Text("Refresh") }</code>. What does <code>onNodeWithText("Refresh")</code> match by default?', options: ['The Button, because it merges its child Text', 'Only the inner Text node', 'Nothing'], a: 0, why: 'Finders use the merged tree. Pass <code>useUnmergedTree = true</code> to reach the inner Text.' },
          { q: 'When is <code>Modifier.testTag</code> the right finder hook?', options: ['For a node with no stable text, such as a list or an image', 'For every node, always', 'Never in production code'], a: 0, why: 'Prefer what the user sees, like text or content descriptions. Use tags when there is nothing user-visible to match.' },
        ],
        deeper: composeUiDepth.deeper,
        underHood: composeUiDepth.underHood,
        mistakes: composeUiDepth.mistakes,
        visual(el) {
          let msgs = ['Standup at 10', 'Invoice #2041', 'Lunch Friday?'], sel = null, toastT;
          const subjects = ['Release notes', 'Design review', 'Weekly digest', 'Build passed'];
          const ui = {}, tree = {};
          const phone = h('div', { class: 'phone tst-phone', role: 'img', 'aria-label': 'Inbox screen preview' });
          const treeEl = h('div', { class: 'tst-tree', 'aria-label': 'Semantics tree' });
          const o = out();
          const node = (id, depth, label, props) => (tree[id] = h('div', { class: 'tst-node', html: `${'  '.repeat(depth)}${depth ? '├ ' : ''}${label}${props ? ` <span class="tst-prop">${props}</span>` : ''}` }));
          function render() {
            ui.title = h('div', { class: 'tst-ph-title' }, 'Inbox');
            ui.count = h('div', { class: 'tst-ph-count' }, `${msgs.length} messages`);
            ui.list = h('div', { class: 'tst-ph-list' }, msgs.map((m, i) => h('div', { class: 'tst-ph-row' + (i === msgs.length - 1 && msgs.length > 3 ? ' drop-in' : '') }, m)));
            ui.btn = h('div', { class: 'tst-ph-btn' }, 'Refresh');
            ui.fab = h('div', { class: 'tst-ph-fab', 'aria-hidden': 'true' }, '+');
            phone.replaceChildren(ui.title, ui.count, ui.list, ui.btn, ui.fab);
            treeEl.replaceChildren(
              node('root', 0, 'Root'),
              node('title', 1, 'Text "Inbox"', 'Heading'),
              node('count', 1, `Text "${msgs.length} messages"`),
              node('list', 1, 'LazyColumn', 'TestTag="inbox_list" ScrollBy'),
              ...msgs.map((m, i) => node('row' + i, 2, `Text "${m}"`)),
              node('btn', 1, 'Button', 'Role=Button OnClick Text="Refresh"'),
              node('fab', 1, 'FloatingActionButton', 'ContentDescription="Compose new" OnClick'));
            if (sel) mark(sel, false);
          }
          function mark(id, anim = true) {
            Object.values(tree).forEach(n => n.classList.remove('tst-match'));
            Object.values(ui).forEach(n => n.classList.remove('tst-hit'));
            if (!id) return;
            tree[id].classList.add('tst-match'); ui[id].classList.add('tst-hit');
            if (anim) { replay(tree[id], 'pop-soft'); replay(ui[id], 'pop'); }
          }
          const finders = [
            { src: 'onNodeWithText("Refresh")', id: 'btn', note: 'matched the Button. Its Text child is merged into it.' },
            { src: 'onNodeWithTag("inbox_list")', id: 'list', note: 'matched the LazyColumn by its test tag.' },
            { src: 'onNodeWithContentDescription("Compose new")', id: 'fab', note: 'matched the icon-only button by its content description.' },
            { src: 'onNodeWithText("Archive")', id: null },
          ];
          function find(f) {
            sel = f.id; mark(f.id);
            if (!f.id) {
              say(o, `<span class="bad">AssertionError:</span> Expected exactly '1' node but could not find any node that satisfies: (Text + InputText + EditableText contains 'Archive' (ignoreCase: false))`);
              replay(treeEl, 'shake'); return;
            }
            say(o, `${hl('rule.' + f.src)} <span class="muted">// ${f.note}</span>`);
          }
          const need = act => { if (!sel) { say(o, `<span class="bad">No node selected.</span> Pick a finder first, then call ${hl(act)}.`); return true; } return false; };
          function click() {
            if (need('.performClick()')) return;
            if (sel === 'btn') {
              msgs = [...msgs, subjects[(msgs.length - 3) % subjects.length]]; render();
              say(o, `${hl('.performClick()')} <span class="muted">// refresh ran. Compose recomposed, and the tree now has</span> Text "${msgs.length} messages"`);
              replay(tree.count, 'pop-soft');
            } else if (sel === 'fab') {
              clearTimeout(toastT);
              const t = h('div', { class: 'tst-ph-toast drop-in' }, 'New message'); phone.append(t);
              toastT = setTimeout(() => t.remove(), 1400);
              say(o, `${hl('.performClick()')} <span class="muted">// OnClick ran</span>`);
            } else say(o, `${hl('.performClick()')} <span class="muted">// a tap is injected at its center. No row handles clicks, so nothing changes.</span>`);
          }
          function displayed() {
            if (need('.assertIsDisplayed()')) return;
            replay(ui[sel], 'pop');
            say(o, `${hl('.assertIsDisplayed()')} <span class="good">passed</span> <span class="muted">// the node is on screen with a non-zero size</span>`);
          }
          render();
          find(finders[0]);
          el.append(
            h('div', { class: 'controls tst-row' }, finders.map(f => cmd(f.src, () => find(f)))),
            h('div', { class: 'tst-split' }, phone, treeEl),
            h('div', { class: 'controls' },
              cmd('.performClick()', click), cmd('.assertIsDisplayed()', displayed),
              h('button', { class: 'btn small', onclick() { msgs = msgs.slice(0, 3); render(); say(o, 'Back to 3 messages.'); } }, 'Reset messages')),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'baseline',
        title: 'Baseline Profiles and Macrobenchmark',
        tagline: 'Compile the startup path ahead of time, then measure it.',
        level: 'advanced',
        body: `
<p>Android’s runtime starts an app’s code in an interpreter and compiles hot methods with the JIT as they run. Ahead-of-time (AOT) compilation into machine code usually waits for idle background passes, so a fresh install starts slower than it needs to.</p>
<p>A <em>Baseline Profile</em> is a list of the classes and methods your startup and key journeys use. It ships inside the app, and the system compiles those methods ahead of time at install. A cold start then runs machine code from the first frame. Google reports around 30% faster first launches from this alone.</p>
<p>You generate the profile with <code>BaselineProfileRule</code> and check the gain with <em>Macrobenchmark</em>, which launches your release build repeatedly and reports <code>timeToInitialDisplayMs</code>. Compare <code>CompilationMode.None()</code> with <code>CompilationMode.Partial()</code> below.</p>`,
        code: `// :baselineprofile module, generates baseline-prof.txt
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule val rule = BaselineProfileRule()

    @Test fun generate() = rule.collect(packageName = "com.example.news") {
        pressHome()
        startActivityAndWait()
        // also walk the journeys users take right after launch
    }
}

// Same module, measures the result on a real device
@RunWith(AndroidJUnit4::class)
class StartupBenchmark {
    @get:Rule val rule = MacrobenchmarkRule()

    @Test fun startupNoCompilation() = startup(CompilationMode.None())
    @Test fun startupBaselineProfile() = startup(CompilationMode.Partial())

    private fun startup(mode: CompilationMode) = rule.measureRepeated(
        packageName = "com.example.news",
        metrics = listOf(StartupTimingMetric()),
        compilationMode = mode,
        startupMode = StartupMode.COLD,
        iterations = 10,
    ) {
        pressHome()
        startActivityAndWait()
    }
}`,
        remember: 'A Baseline Profile turns the startup path into AOT machine code at install. Prove it with Macrobenchmark on a release build.',
        terms: [
          { term: 'Baseline Profile', def: 'A list of classes and methods shipped with the app that the system compiles ahead of time at install.' },
          { term: 'Macrobenchmark', def: 'A Jetpack library that measures real app behavior such as startup and scrolling by driving a release build on a device.' },
          { term: 'Cold start', def: 'A launch where the app process does not exist yet, so the system must create it before drawing the first frame.' },
          { term: 'JIT vs AOT', def: 'JIT compiles methods while the app runs; AOT compiles them to machine code before the app runs.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Measure cold startup time with Macrobenchmark.', code: '@get:Rule val rule = [[MacrobenchmarkRule]]()\n\n@Test fun coldStartup() = rule.measureRepeated(\n    packageName = "com.example.news",\n    metrics = listOf([[StartupTimingMetric]]()),\n    compilationMode = CompilationMode.Partial(),\n    startupMode = StartupMode.[[COLD]],\n    iterations = 10,\n) {\n    pressHome()\n    startActivityAndWait()\n}', why: '<code>StartupTimingMetric</code> reports time to initial display. <code>COLD</code> kills the process before each iteration.' },
          { type: 'bug', prompt: 'Startup numbers from this benchmark build type are far slower than what users see. Tap the line.', code: '// app/build.gradle.kts\nandroid {\n    buildTypes {\n        create("benchmark") {\n            initWith(getByName("release"))\n            signingConfig = signingConfigs.getByName("debug")\n            matchingFallbacks += listOf("release")\n            isDebuggable = true\n        }\n    }\n}', bug: 7, fix: '            isDebuggable = false', why: 'A debuggable app runs with many runtime optimizations turned off, so it measures something users never run. Macrobenchmark stops with a DEBUGGABLE error for that reason, unless you suppress it.' },
        ],
        quiz: [
          { q: 'What does a Baseline Profile contain?', options: ['Machine code for the whole app', 'A list of classes and methods to compile ahead of time', 'Recorded frame timings'], a: 1, why: 'It is a rule list. The device compiles the listed code to machine code at install.' },
          { q: 'What does <code>CompilationMode.None()</code> measure?', options: ['Startup with no AOT compilation, the worst case', 'Startup with the Baseline Profile', 'Startup with everything compiled'], a: 0, why: 'It resets compilation, so code runs interpreted and JIT-compiled. Compare it with <code>Partial()</code> to see the profile’s gain.' },
          { q: 'Why benchmark a non-debuggable release build?', options: ['Debuggable builds skip optimizations, so the numbers are not real', 'Macrobenchmark only installs from Play'], a: 0, why: 'Users run release builds. Debuggable builds run slower in ways that hide or invent problems.' },
        ],
        visual(el) {
          const TOTAL = 1100;
          const modes = {
            none: { label: 'CompilationMode.None()', name: 'no profile', frame: 1020, segs: [[0, 120, 'tst-sys'], [120, 340, 'tst-interp'], [340, 1020, 'tst-interp']], runs: [1088, 1004, 1032, 979, 1020] },
            partial: { label: 'CompilationMode.Partial()', name: 'Baseline Profile', frame: 680, segs: [[0, 120, 'tst-sys'], [120, 260, 'tst-aotbar'], [260, 680, 'tst-aotbar']], runs: [702, 668, 691, 655, 680] },
          };
          let mode = 'partial', busy = false;
          const STARTUP = 40, N = 64;
          const squares = Array.from({ length: N }, (_, i) => h('span', { class: 'tst-m' + (i >= STARTUP ? ' tst-cold' : '') }));
          const lanes = {}, frames = {};
          const tl = h('div', { class: 'timeline' }, Object.entries(modes).map(([k, m]) => {
            const track = h('div', { class: 'lane-track' });
            lanes[k] = m.segs.map(([s, e, c]) => { const b = h('span', { class: `bar ${c}`, style: `left:${(s / TOTAL) * 100}%;width:0` }); track.append(b); return { b, s, e }; });
            frames[k] = h('span', { class: 'tst-frame', style: `left:${(m.frame / TOTAL) * 100}%`, hidden: true });
            track.append(frames[k]);
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, m.name), track);
          }));
          const clock = h('span', { class: 'clock' }, '0 ms');
          const o = out();
          const modeBtns = Object.entries(modes).map(([k, m]) => cmd(m.label, () => { if (busy) return; mode = k; paintMode(); }));
          const drawLane = (k, t) => { lanes[k].forEach(({ b, s, e }) => { b.style.width = (Math.max(0, Math.min(t, e) - s) / TOTAL) * 100 + '%'; }); frames[k].hidden = t < modes[k].frame; };
          const setSquares = k => squares.forEach((q, i) => { q.className = 'tst-m' + (i >= STARTUP ? ' tst-cold' : '') + (k === 'partial' && i < STARTUP ? ' tst-aot' : ''); });
          function paintMode() {
            modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(modes)[i] === mode));
            setSquares(mode);
            say(o, mode === 'partial'
              ? 'The startup methods are already AOT compiled from the profile. Press Cold start.'
              : 'Compilation reset. Every method starts interpreted. Press Cold start.');
          }
          function coldStart() {
            if (busy) return; busy = true;
            const m = modes[mode];
            drawLane(mode, 0); setSquares(mode);
            say(o, `${hl('startActivityAndWait()')} <span class="muted">// ${m.name}, cold</span>`);
            const t0 = performance.now();
            let jitted = 0;
            const tick = now => {
              if (!el.isConnected) return;
              const t = Math.min((now - t0) / 2.2, m.frame + 40); // 2.2x slow motion
              drawLane(mode, t);
              clock.textContent = Math.round(Math.min(t, m.frame)) + ' ms';
              if (mode === 'none') {
                const want = Math.floor(Math.max(0, t - 300) / 18);
                while (jitted < Math.min(want, STARTUP)) squares[jitted++].classList.add('tst-jit');
              }
              if (t < m.frame + 40) { requestAnimationFrame(tick); return; }
              o.append(h('div', { class: 'line drop-in', html: `first frame at <span class="good">${m.frame} ms</span>${mode === 'none' ? '. Hot methods were JIT compiled during the launch.' : '. 33% faster than no profile.'}` }));
              busy = false;
            };
            requestAnimationFrame(tick);
          }
          async function measure() {
            if (busy) return; busy = true;
            const m = modes[mode];
            say(o, `${hl('measureRepeated(iterations = 5)')} <span class="muted">// ${m.name}</span>`);
            for (const r of m.runs) {
              await sleep(260); if (!el.isConnected) return;
              o.append(h('div', { class: 'line drop-in' }, `timeToInitialDisplayMs ${r}`));
            }
            const sorted = [...m.runs].sort((a, b) => a - b);
            o.append(h('div', { class: 'line drop-in', html: `<span class="good">median ${sorted[2]} ms</span>  min ${sorted[0]}  max ${sorted[4]}` }));
            busy = false;
          }
          Object.keys(modes).forEach(k => drawLane(k, TOTAL));
          clock.textContent = '680 ms';
          paintMode();
          o.innerHTML = 'Both cold starts done: first frame at 1020 ms without a profile, 680 ms with one.';
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'controls' },
              h('button', { class: 'btn primary small', onclick: coldStart }, 'Cold start'),
              h('button', { class: 'btn small', onclick: measure }, 'Run Macrobenchmark'),
              clock),
            tl,
            h('div', { class: 'tst-sub' },
              h('span', { class: 'tst-label' }, 'App methods. The first 40 run during startup.'),
              h('div', { class: 'tst-methods', 'aria-hidden': 'true' }, squares),
              h('div', { class: 'legend' },
                h('span', {}, h('i', { class: 'tst-sq tst-m' }), 'interpreted'),
                h('span', {}, h('i', { class: 'tst-sq tst-m tst-jit' }), 'JIT compiled while running'),
                h('span', {}, h('i', { class: 'tst-sq tst-m tst-aot' }), 'AOT from the profile'),
                h('span', {}, h('i', { class: 'bar tst-sys' }), 'process start'),
                h('span', {}, h('i', { class: 'tst-sq', style: 'background:var(--ok);width:4px' }), 'first frame'))),
            o);
        },
      },
    ],
  });
})();
