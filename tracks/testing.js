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
/* depth pass 2 */
.tst-d2-row { display: grid; grid-template-columns: minmax(0, 15em) auto minmax(0, 1fr); gap: 6px 10px; align-items: center; padding: 6px; border-radius: 10px; border: 2px solid transparent; min-width: 0; transition: border-color 0.2s, background 0.2s; }
.tst-d2-row .cmd, .tst-d2-wrap .cmd { text-align: left; white-space: normal; }
.tst-d2-file { font: 600 0.74rem var(--mono); color: var(--muted); }
.tst-d2-row.tst-d2-best { border-color: var(--ok); background: var(--ok-soft); }
.tst-d2-msg { font-size: 0.88rem; color: var(--muted); min-width: 0; overflow-wrap: anywhere; }
.tst-d2-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
.tst-d2-dex { display: grid; gap: 4px; min-width: 0; }
.tst-d2-pages { display: grid; grid-template-columns: repeat(30, minmax(0, 1fr)); gap: 3px; }
.tst-d2-pg { aspect-ratio: 1; border-radius: 3px; background: var(--sunk); border: 1px solid var(--line); min-width: 0; transition: background 0.2s; }
.tst-d2-pg.tst-d2-start { background: var(--warm-soft); border-color: var(--warm); }
.tst-d2-pg.tst-d2-hit { background: var(--warm); }
.tst-d2-ms { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font: 600 0.74rem var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; }
@media (max-width: 560px) {
  .tst-d2-row { grid-template-columns: minmax(0, 1fr) auto; }
  .tst-d2-msg { grid-column: 1 / -1; }
  .tst-d2-pages { grid-template-columns: repeat(15, minmax(0, 1fr)); }
}

/* promoted: robolectric */
.tst-wrap .cmd { white-space: normal; text-align: left; overflow-wrap: anywhere; }
.tst-rb-loop { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 10px; align-items: center; min-width: 0; }
.tst-rb-box { display: grid; gap: 6px; align-content: start; min-height: 96px; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.tst-rb-box.tst-rb-hot { border-color: var(--accent); }
.tst-rb-msg { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--warm-soft); color: var(--ink); border: 1px solid var(--warm); overflow-wrap: anywhere; }
.tst-rb-msg.tst-rb-ran { background: var(--ok-soft); border-color: var(--ok); }
.tst-rb-arrow { font: 700 1.2rem var(--mono); color: var(--muted); }
@media (max-width: 520px) { .tst-rb-loop { grid-template-columns: minmax(0, 1fr); } .tst-rb-arrow { transform: rotate(90deg); justify-self: center; } }

/* promoted: mockk */
.tst-mk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 12px; min-width: 0; }
.tst-mk-calls { display: grid; gap: 4px; min-height: 64px; align-content: start; }
.tst-mk-call { font: 600 0.78rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--sunk); color: var(--ink); overflow-wrap: anywhere; }
.tst-mk-call.tst-mk-boom { background: var(--err-soft); color: var(--err); }
.tst-mk-slot { font: 600 0.8rem var(--mono); color: var(--accent); overflow-wrap: anywhere; }

/* promoted: screenshots */
.tst-ss-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 12px; min-width: 0; }
.tst-ss-pane { display: grid; gap: 6px; min-width: 0; }
.tst-ss-img { display: grid; grid-template-columns: repeat(20, minmax(0, 1fr)); gap: 1px; padding: 4px; border-radius: 10px; background: var(--line); border: 1px solid var(--line); }
.tst-ss-px { aspect-ratio: 1; background: var(--surface); min-width: 0; }
.tst-ss-px.k-card { background: var(--sunk); }
.tst-ss-px.k-title { background: var(--ink); }
.tst-ss-px.k-text { background: var(--muted); }
.tst-ss-px.k-btn { background: var(--accent); }
.tst-ss-px.k-btn2 { background: var(--warm); }
.tst-ss-px.k-aa { background: var(--line); }
.tst-ss-img.tst-ss-diff .tst-ss-px { background: var(--surface); }
.tst-ss-img.tst-ss-diff .tst-ss-px.tst-ss-hit { background: var(--err); }
.tst-ss-img.tst-ss-empty .tst-ss-px { background: var(--sunk); opacity: 0.5; }

/* promoted: hilt testing */
.tst-hl-tests { display: grid; gap: 8px; min-width: 0; }
.tst-hl-row { display: grid; grid-template-columns: minmax(0, 12em) minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.tst-hl-row b { font: 600 0.8rem var(--mono); overflow-wrap: anywhere; }
.tst-hl-bind { font: 600 0.76rem var(--mono); padding: 3px 8px; border-radius: 999px; justify-self: start; overflow-wrap: anywhere; }
.tst-hl-bind.tst-hl-real { background: var(--err-soft); color: var(--err); }
.tst-hl-bind.tst-hl-fake { background: var(--ok-soft); color: var(--ok); }
.tst-hl-comp { font: 600 0.72rem var(--mono); color: var(--muted); }
@media (max-width: 520px) { .tst-hl-row { grid-template-columns: minmax(0, 1fr) auto; } .tst-hl-row b { grid-column: 1 / -1; } }
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

  // ─── Depth pass 2: pyramid, fakes, flows, baseline ─────────────────────
  const pyramidDepth = {
    deeper: [
      {
        title: 'Test each bug at the lowest layer that catches it',
        body: `<p>When a bug reaches users, ask which layer could have caught it, and add the test at the lowest one that can. A wrong price format is pure logic, so a unit test catches it in milliseconds. A wrong Room query needs a real SQLite engine, so it needs an integration test with an in-memory database. A button wired to the wrong screen only shows up when something drives the UI.</p>
<p>Pick a bug and try each layer.</p>`,
        visual(el) {
          const LAYERS = [
            { k: 'unit', name: 'unit test with a fake', ms: 8 },
            { k: 'int', name: 'integration: real Room, in memory', ms: 300 },
            { k: 'ui', name: 'UI test on a device', ms: 4000 },
          ];
          const BUGS = [
            { label: 'Price shows 12.5 instead of $12.50', low: 'unit', res: {
              unit: 'formatter test fails: expected $12.50', int: 'caught too, but the database adds nothing here', ui: 'caught too, 500 times slower' } },
            { label: 'Room query sorts oldest first', low: 'int', res: {
              unit: null, int: 'the real query runs on SQLite and the order check fails', ui: 'caught, if a UI test happens to look at the order' }, miss: 'missed: the fake has no SQL. It returns the list you gave it.' },
            { label: 'Pay opens Settings instead of Receipt', low: 'ui', res: {
              unit: null, int: null, ui: 'tap Pay, assert Receipt is shown: fails' }, miss: 'missed: no screen, no navigation at this layer.' },
          ];
          let bug = 0, busy = false;
          const rows = LAYERS.map(l => {
            const t = h('span', { class: 'tst-res' }, 'not run');
            const msg = h('span', { class: 'tst-d2-msg' }, '');
            const btn = h('button', { class: 'cmd', onclick: () => tryLayer(l) }, l.name);
            return { l, t, msg, row: h('div', { class: 'tst-d2-row' }, btn, t, msg) };
          });
          const o = out();
          const bugBtns = BUGS.map((b, i) => h('button', { class: 'cmd', onclick() { if (busy) return; bug = i; paint(); } }, b.label));
          function paint() {
            pressed(bugBtns, BUGS.map((_, i) => i), bug);
            rows.forEach(r => { r.t.textContent = 'not run'; r.t.className = 'tst-res'; r.msg.textContent = ''; r.row.classList.remove('tst-d2-best'); });
            say(o, `<span class="muted">bug:</span> ${BUGS[bug].label}. Which layer catches it?`);
          }
          async function tryLayer(l) {
            if (busy) return; busy = true;
            const r = rows.find(x => x.l === l), b = BUGS[bug], hit = b.res[l.k];
            r.t.textContent = 'running'; r.t.className = 'tst-res';
            await sleep(250 + Math.min(900, l.ms / 5));
            if (!el.isConnected) return;
            r.t.textContent = hit ? `caught · ${fmt(l.ms)}` : `missed · ${fmt(l.ms)}`;
            r.t.className = 'tst-res drop-in' + (hit ? '' : ' tst-bad');
            r.msg.textContent = hit || b.miss;
            if (hit && l.k === b.low) {
              r.row.classList.add('tst-d2-best'); replay(r.row, 'pop-soft');
              say(o, `<span class="good">lowest layer:</span> ${l.name}. Put the regression test here.`);
            } else if (hit) say(o, 'Caught, but a cheaper layer might do it. Try the ones below.');
            else say(o, '<span class="bad">missed.</span> Go one layer up.');
            busy = false;
          }
          el.append(h('div', { class: 'controls tst-d2-wrap' }, bugBtns), h('div', { class: 'tst-sub' }, rows.map(r => r.row)), o);
          paint();
        },
      },
    ],
    underHood: {
      body: `<p>Local tests compile against <code>android.jar</code>, which holds the API signatures and no real code. To make it runnable on the JVM, the Android Gradle plugin generates a copy where every method throws <code>RuntimeException("Method ... not mocked.")</code>. That is the error you see when plain unit test code touches <code>Uri</code> or <code>TextUtils</code>.</p>
<p>An instrumented run builds two APKs, your app and a test APK, and installs both. Gradle then starts them with <code>am instrument</code>. The system starts your app's process with <code>AndroidJUnitRunner</code> inside it, so the tests run in the same process as your code and use the real framework. Robolectric sits in between: it loads real Android framework code into a sandboxed class loader on the JVM and swaps the parts that need native code or hardware for Java "shadows". The next lesson, <em>Robolectric: Android on the JVM</em>, shows when to use it.</p>`,
    },
    mistakes: [
      {
        title: 'Silencing "not mocked" with returnDefaultValues',
        bad: `android {
    testOptions {
        unitTests.isReturnDefaultValues = true
    }
}
// TextUtils.isEmpty("") now returns false, and the test still passes`,
        good: `// Keep the rule in plain Kotlin and test that
fun isBlankTitle(title: String) = title.isBlank()

// or run the test with the real framework on Robolectric
@RunWith(AndroidJUnit4::class)
class TitleRulesTest { /* ... */ }`,
        why: 'With that flag every stub method returns 0, false or null. Tests go green while checking nothing real. Move logic out of Android types, or use Robolectric where you truly need the framework.',
      },
      {
        title: 'Checking a pure rule through a UI test',
        bad: `// androidTest: a device run to check a formatting rule
@Test fun showsPriceInDollars() {
    rule.setContent { PriceTag(cents = 1250) }
    rule.onNodeWithText("$12.50").assertIsDisplayed()
}`,
        good: `// test: milliseconds on the JVM
@Test fun formatsDollars() {
    assertEquals("$12.50", PriceFormatter(Locale.US).format(1250))
}`,
        why: 'The rule has nothing to do with the screen. Test it once at the bottom, and keep UI tests for wiring: this button opens that screen.',
      },
      {
        title: 'UI tests against the real backend',
        bad: `@HiltAndroidTest
class CheckoutFlowTest {
    // uses the real NetworkModule and a staging server
    @Test fun payOpensReceipt() { /* ... */ }
}`,
        good: `@HiltAndroidTest
@UninstallModules(NetworkModule::class)
class CheckoutFlowTest {
    @BindValue @JvmField
    val api: PaymentApi = FakePaymentApi(result = PaymentResult.Paid)

    @Test fun payOpensReceipt() { /* ... */ }
}`,
        why: 'UI tests are already the slowest layer. A real server adds network flakes and data that changes under you. Swap the network layer for a fake through Hilt.',
      },
    ],
  };

  const fakesDepth = {
    deeper: [
      {
        title: 'Fakes survive refactors, call checks do not',
        body: `<p>A mock test usually pins down <em>how</em> the ViewModel talks to its repository: which function, how many times. A fake test only checks <em>what</em> comes out. Refactor the ViewModel without changing its behavior and the fake test keeps passing, while the call check fails. Worse, a call check can pass while the screen is broken.</p>
<p>Switch between three versions of <code>load()</code> and run both tests.</p>`,
        code: `// Mock style (MockK): pins the call
val repo = mockk<NewsRepository>()
coEvery { repo.latest() } returns listOf(article)
NewsViewModel(repo).load()
coVerify(exactly = 1) { repo.latest() }

// Fake style: checks the result
val repo = FakeNewsRepository().apply { articles = listOf(article) }
val vm = NewsViewModel(repo)
vm.load()
assertEquals(UiState.Success(listOf(article)), vm.state.value)`,
        visual(el) {
          const VERS = {
            v1: { label: 'v1: original', src: ['fun load() = viewModelScope.launch {', '    _state.value = Success(repo.latest())', '}'],
              mock: [true, 'latest() was called once'], fake: [true, 'state is Success(1 article)'] },
            v2: { label: 'v2: cache first (refactor)', src: ['fun load() = viewModelScope.launch {', '    val cached = repo.cached()', '    _state.value = Success(cached.ifEmpty { repo.latest() })', '}'],
              mock: [false, 'MockKException: no answer found for NewsRepository(#1).cached()'], fake: [true, 'state is Success(1 article). The fake answers cached() with an empty list.'] },
            v3: { label: 'v3: forgets to set state (bug)', src: ['fun load() = viewModelScope.launch {', '    val list = repo.latest()', '    // _state.value = Success(list)  <- lost in a merge', '}'],
              mock: [true, 'latest() was called once. Nothing looked at the state.'], fake: [false, 'expected: Success(1 article) but was: Loading'] },
          };
          const MOCK = ['coEvery { repo.latest() } returns listOf(a)', 'NewsViewModel(repo).load()', 'coVerify(exactly = 1) { repo.latest() }'];
          const FAKE = ['val repo = FakeNewsRepository().apply { articles = listOf(a) }', 'val vm = NewsViewModel(repo); vm.load()', 'assertEquals(Success(listOf(a)), vm.state.value)'];
          let ver = 'v1', busy = false;
          const vm = h('div', { class: 'tst-script' });
          const mRows = gwt(MOCK), fRows = gwt(FAKE);
          const mRes = h('span', { class: 'tst-res' }, 'PASSED'), fRes = h('span', { class: 'tst-res' }, 'PASSED');
          const o = out();
          const keys = Object.keys(VERS);
          const vBtns = keys.map(k => h('button', { class: 'cmd', onclick() { if (busy) return; ver = k; paint(); say(o, `<span class="muted">ViewModel:</span> ${VERS[k].label}. Run both tests.`); } }, VERS[k].label));
          function paint() {
            pressed(vBtns, keys, ver);
            vm.replaceChildren(...gwt(VERS[ver].src));
            [mRes, fRes].forEach(r => { r.textContent = 'not run'; r.className = 'tst-res'; });
            mark(mRows, -1); mark(fRows, -1);
          }
          async function runOne(rows, res, [ok, msg]) {
            for (let i = 0; i < rows.length; i++) { mark(rows, i, 'tst-on'); await sleep(320); if (!el.isConnected) return false; }
            mark(rows, rows.length - 1, ok ? 'tst-pass' : 'tst-fail');
            res.textContent = ok ? 'PASSED' : 'FAILED'; res.className = 'tst-res drop-in' + (ok ? '' : ' tst-bad');
            o.append(h('div', { class: 'line drop-in', html: `${ok ? '<span class="good">pass</span>' : '<span class="bad">fail</span>'} ${msg}` }));
            return true;
          }
          async function run() {
            if (busy) return; busy = true;
            try {
              paint(); say(o, `<span class="muted">$</span> ./gradlew test <span class="muted">// ${VERS[ver].label}</span>`);
              if (!(await runOne(mRows, mRes, VERS[ver].mock))) return;
              if (!(await runOne(fRows, fRes, VERS[ver].fake))) return;
              o.append(h('div', { class: 'line drop-in', html: ver === 'v2' ? 'Behavior is the same, yet the mock test broke.' : ver === 'v3' ? '<span class="bad">The screen is broken and the mock test is green.</span>' : 'Both pass on the original code.' }));
            } finally { busy = false; }
          }
          pressed(vBtns, keys, ver); vm.replaceChildren(...gwt(VERS.v1.src));
          mark(mRows, 2, 'tst-pass'); mark(fRows, 2, 'tst-pass');
          o.innerHTML = 'Both tests pass on v1. Try the refactor, then the bug.';
          el.append(
            h('div', { class: 'controls' }, vBtns),
            h('div', { class: 'tst-sub' }, h('span', { class: 'tst-label' }, 'NewsViewModel.load()'), vm),
            h('div', { class: 'tst-cols' },
              h('div', { class: 'tst-sub' }, h('div', { class: 'tst-d2-head' }, h('span', { class: 'tst-label' }, 'mock test'), mRes), h('div', { class: 'tst-script' }, mRows)),
              h('div', { class: 'tst-sub' }, h('div', { class: 'tst-d2-head' }, h('span', { class: 'tst-label' }, 'fake test'), fRes), h('div', { class: 'tst-script' }, fRows))),
            h('div', { class: 'controls' }, cmd('./gradlew test', run)),
            o);
        },
      },
      {
        title: 'One shared fake, checked against the real thing',
        body: `<p>Write each fake once and share it, for example from a <code>:core:testing</code> module, so every feature's tests use the same one. The risk is drift: the real repository changes its behavior and the fake does not, so tests stay green while the app breaks.</p>
<p>A contract test guards against that. Write the expectations once in an abstract test class, then run it against the fake and against the real implementation backed by an in-memory database.</p>`,
        code: `abstract class NewsRepositoryContract {
    abstract fun repo(): NewsRepository

    @Test fun latestIsNewestFirst() = runTest {
        val repo = repo()
        repo.save(article(id = 1, publishedAt = 100))
        repo.save(article(id = 2, publishedAt = 200))
        assertEquals(listOf(2, 1), repo.latest().map { it.id })
    }
}

class FakeNewsRepositoryTest : NewsRepositoryContract() {
    override fun repo() = FakeNewsRepository()
}

@RunWith(AndroidJUnit4::class)   // Robolectric or a device: Room needs SQLite
class RoomNewsRepositoryTest : NewsRepositoryContract() {
    override fun repo() = RoomNewsRepository(
        Room.inMemoryDatabaseBuilder(context, NewsDb::class.java).build().newsDao()
    )
}`,
      },
    ],
    underHood: {
      body: `<p>A fake is ordinary code, so nothing is hidden. Mocks are built at runtime. Kotlin classes and functions are final by default, so a mocking library can't simply subclass them. Mockito 5 uses its inline mock maker by default, and MockK works in a similar way: both attach a Java agent and rewrite the bytecode of the mocked class while the test runs, so every call goes to the library's recorder.</p>
<p>That is why the first mock in a run is slow, and why a mock only answers calls you stubbed. A MockK mock throws <code>MockKException</code> for any other call unless you create it with <code>relaxed = true</code>.</p>`,
    },
    mistakes: [
      {
        title: 'Mocking a data class you could just build',
        bad: `val article = mockk<Article>()
every { article.title } returns "Kotlin 2.3 is out"
every { article.id } returns 7`,
        good: `val article = Article(id = 7, title = "Kotlin 2.3 is out")`,
        why: 'Data classes are plain values. A real one is shorter, can be compared with <code>assertEquals</code>, and can’t return something its constructor would never allow.',
      },
      {
        title: 'A fake shared as a singleton object',
        bad: `object FakeNewsRepository : NewsRepository {
    var articles = emptyList<Article>()
    override suspend fun latest() = articles
}`,
        good: `class FakeNewsRepository : NewsRepository {
    var articles = emptyList<Article>()
    override suspend fun latest() = articles
}
// a new instance in every test`,
        why: 'An <code>object</code> keeps its state for the whole test JVM. One test leaves articles behind, and the next one passes or fails depending on run order.',
      },
    ],
  };

  const flowsDepth = {
    deeper: [
      {
        title: 'StateFlow conflates, so assert the value',
        body: `<p>A <code>StateFlow</code> keeps only its latest value. If the ViewModel sets <code>Loading</code> and then <code>Success</code> without suspending in between, a collector that runs later only finds <code>Success</code>. Which values a test sees depends on the collector's dispatcher, not on your code.</p>
<p>A collector on <code>UnconfinedTestDispatcher</code> resumes at once on every change and records each one. On <code>StandardTestDispatcher</code> it is queued, runs when the test yields, and reads only the newest value. For state, assert on <code>value</code>. Collect only when the sequence itself is what you test.</p>`,
        code: `@Test fun refreshEndsInSuccess() = runTest {
    vm.refresh()
    assertEquals(UiState.Success(articles), vm.state.value)   // state: check the value
}

@Test fun refreshShowsLoadingFirst() = runTest {
    val seen = mutableListOf<UiState>()
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.state.toList(seen) }
    vm.refresh()
    assertEquals(listOf(Idle, Loading, Success(articles)), seen)   // the order matters here
}`,
        visual(el) {
          let busy = false, pending = false, value = 'Idle', std = [], unc = [];
          const valSlot = h('span', {}, h('span', { class: 'tst-ev' }, 'Idle'));
          const stdEl = h('div', { class: 'tst-evs' }), uncEl = h('div', { class: 'tst-evs' });
          const queue = h('div', { class: 'tst-queue', 'aria-label': 'Test scheduler queue' });
          const o = out();
          const chip = (v, cls = '') => h('span', { class: `tst-ev drop-in ${cls}` }, v);
          const setVal = v => { value = v; valSlot.replaceChildren(chip(v)); };
          function paintQueue() { queue.replaceChildren(...(pending ? [h('span', { class: 'tst-task drop-in' }, 'resume standard collector')] : [])); }
          function reset() {
            pending = false; std = ['Idle']; unc = ['Idle']; setVal('Idle');
            stdEl.replaceChildren(chip('Idle')); uncEl.replaceChildren(chip('Idle')); paintQueue();
          }
          async function refresh() {
            if (busy) return; busy = true;
            try {
              say(o, `${hl('vm.refresh()')} <span class="muted">// sets Loading, then Success, no suspension between</span>`);
              for (const v of ['Loading', 'Success(3)']) {
                setVal(v); unc.push(v); uncEl.append(chip(v));
                if (!pending) { pending = true; paintQueue(); }
                await sleep(450); if (!el.isConnected) return;
              }
              o.append(h('div', { class: 'line drop-in' }, 'Unconfined recorded both. The standard collector is still waiting in the queue.'));
            } finally { busy = false; }
          }
          function runCurrent() {
            if (busy) return;
            if (!pending) { replay(queue, 'shake'); say(o, `${hl('runCurrent()')} <span class="muted">// nothing queued</span>`); return; }
            pending = false; paintQueue();
            std.push(value); stdEl.append(chip(value));
            say(o, `${hl('runCurrent()')} <span class="muted">// the standard collector wakes up and reads the current value: ${value}. Loading is gone.</span>`);
          }
          function check() {
            if (busy) return;
            const want = ['Idle', 'Loading', 'Success(3)'];
            const okU = unc.join() === want.join(), okS = std.join() === want.join();
            say(o, `${hl('assertEquals(listOf(Idle, Loading, Success(3)), seen)')}`);
            o.append(h('div', { class: 'line drop-in', html: `unconfined: ${okU ? '<span class="good">pass</span>' : `<span class="bad">fail</span>, seen [${unc.join(', ')}]`}` }));
            o.append(h('div', { class: 'line drop-in', html: `standard: ${okS ? '<span class="good">pass</span>' : `<span class="bad">fail</span>, seen [${std.join(', ')}]`}` }));
            o.append(h('div', { class: 'line drop-in', html: `${hl('assertEquals(Success(3), vm.state.value)')} ${value === 'Success(3)' ? '<span class="good">pass either way</span>' : '<span class="muted">refresh first</span>'}` }));
          }
          reset();
          o.innerHTML = 'Both collectors started and got the initial Idle. Call vm.refresh().';
          el.append(
            h('div', { class: 'tst-clocks' }, h('span', { class: 'tst-state' }, 'vm.state.value ', valSlot)),
            h('div', { class: 'tst-cols' },
              h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'collector on StandardTestDispatcher'), stdEl),
              h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'collector on UnconfinedTestDispatcher'), uncEl)),
            queue,
            h('div', { class: 'controls' }, cmd('vm.refresh()', refresh), cmd('runCurrent()', runCurrent), cmd('assertEquals(...)', check),
              h('button', { class: 'btn small', onclick() { if (busy) return; reset(); say(o, 'Fresh test: both collectors hold Idle.'); } }, 'New test')),
            o);
        },
      },
      {
        title: 'stateIn with WhileSubscribed needs a collector',
        body: `<p>ViewModels often build state with <code>stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), Loading)</code>. That flow only collects its upstream while someone collects it. A test that just reads <code>.value</code> has no subscriber, so the upstream never starts and the value stays <code>Loading</code> forever.</p>
<p>Start an empty collector in <code>backgroundScope</code> first, even if you only assert on <code>value</code>. Turn it on and off below.</p>`,
        code: `@Test fun showsArticles() = runTest {
    val repo = HotFakeNewsRepository()          // MutableSharedFlow inside
    val vm = NewsViewModel(repo)                 // uiState = repo.articles.map(...).stateIn(...)
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.uiState.collect {} }

    repo.emit(listOf(article))
    assertEquals(UiState.Success(listOf(article)), vm.uiState.value)
}`,
        visual(el) {
          let sub = false, value = 'Loading', busy = false;
          const valSlot = h('span', {}, h('span', { class: 'tst-ev' }, 'Loading'));
          const upTag = h('span', { class: 'tst-res tst-bad' }, 'upstream idle');
          const subTag = h('b', {}, '0');
          const repoEl = h('div', { class: 'tst-evs' });
          const o = out();
          const sw = h('input', { type: 'checkbox', id: 'tst-d2-sub', onchange() {
            if (busy) { sw.checked = sub; return; }
            sub = sw.checked; paint();
            say(o, sub ? `${hl('backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.uiState.collect {} }')} <span class="muted">// one subscriber: WhileSubscribed starts the upstream</span>`
              : '<span class="muted">collector removed:</span> no subscribers. After the 5 s timeout the upstream stops.');
          } });
          function paint() {
            subTag.textContent = sub ? '1' : '0';
            upTag.textContent = sub ? 'upstream collecting' : 'upstream idle';
            upTag.className = 'tst-res drop-in' + (sub ? '' : ' tst-bad');
          }
          async function emit() {
            if (busy) return; busy = true;
            try {
              const e = h('span', { class: 'tst-ev drop-in' }, 'listOf(article)');
              repoEl.replaceChildren(e);
              await sleep(400); if (!el.isConnected) return;
              if (sub) {
                value = 'Success(1)'; valSlot.replaceChildren(h('span', { class: 'tst-ev tst-ok drop-in' }, value));
                say(o, `${hl('repo.emit(listOf(article))')} <span class="good">// mapped and stored in uiState</span>`);
              } else {
                e.classList.add('tst-gone');
                say(o, `${hl('repo.emit(listOf(article))')} <span class="bad">// nobody collects the upstream, the emission goes nowhere</span>`);
              }
            } finally { busy = false; }
          }
          function check() {
            if (busy) return;
            const ok = value === 'Success(1)';
            say(o, `${hl('assertEquals(Success(listOf(article)), vm.uiState.value)')} ${ok ? '<span class="good">PASSED</span>' : `<span class="bad">FAILED</span> <span class="muted">// was ${value}</span>`}`);
            if (!ok) replay(valSlot, 'shake');
          }
          paint();
          o.innerHTML = 'No collector yet. Emit from the fake, then assert.';
          el.append(
            h('label', { class: 'switch', for: 'tst-d2-sub' }, sw, h('span', { html: hl('backgroundScope collector') })),
            h('div', { class: 'tst-cols' },
              h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'fake repository'), repoEl),
              h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'stateIn(WhileSubscribed)'), upTag, h('span', { class: 'tst-stats' }, h('span', {}, 'subscribers ', subTag))),
              h('div', { class: 'tst-lane' }, h('span', { class: 'tst-label' }, 'vm.uiState.value'), valSlot)),
            h('div', { class: 'controls' }, cmd('repo.emit(listOf(article))', emit), cmd('assertEquals(...)', check),
              h('button', { class: 'btn small', onclick() { if (busy) return; value = 'Loading'; valSlot.replaceChildren(h('span', { class: 'tst-ev' }, 'Loading')); repoEl.replaceChildren(); say(o, 'New ViewModel: uiState is Loading again.'); } }, 'New test')),
            o);
        },
      },
      {
        title: 'Two flows at once: turbineScope and testIn',
        body: `<p><code>test { }</code> covers one flow. When an action changes state and also sends a one-off event, collect both. Inside <code>turbineScope</code>, <code>testIn(backgroundScope)</code> returns a Turbine you assert on later, and <code>runTest</code> cancels its collector when the test ends.</p>
<p><code>skipItems(n)</code> drops items you don't care about, and <code>expectMostRecentItem()</code> takes the newest one and ignores the rest.</p>`,
        code: `@Test fun saveUpdatesStateAndShowsSnackbar() = runTest {
    turbineScope {
        val states = vm.state.testIn(backgroundScope)
        val events = vm.events.testIn(backgroundScope)
        states.skipItems(1)                      // the current value

        vm.save()

        assertEquals(Event.Saved, events.awaitItem())
        assertEquals(UiState.Saved, states.expectMostRecentItem())
    }
}`,
      },
    ],
    underHood: {
      body: `<p><code>test { }</code> launches a coroutine that collects your flow and sends every item into a channel. Turbine guarantees the flow runs up to its first suspension point before your block's first line, so an initial value is already queued. <code>awaitItem()</code> receives from that channel. When the block ends, Turbine cancels the collector and fails if events are still waiting.</p>
<p>The 3 second timeout is wall clock time, not <code>runTest</code>'s virtual time. Delays in your code are skipped as usual, while a missing emission still fails after 3 real seconds.</p>`,
    },
    mistakes: [
      {
        title: 'Triggering an event before collecting it',
        bad: `@Test fun saveShowsSnackbar() = runTest {
    vm.save()                         // emits Event.Saved on a SharedFlow
    vm.events.test {
        assertEquals(Event.Saved, awaitItem())   // No value produced in 3s
    }
}`,
        good: `@Test fun saveShowsSnackbar() = runTest {
    vm.events.test {
        vm.save()                     // collector is already running
        assertEquals(Event.Saved, awaitItem())
    }
}`,
        why: 'A <code>SharedFlow</code> without replay drops values nobody is collecting. Start <code>test { }</code> first and trigger the action inside it.',
      },
      {
        title: 'Using first() to wait for a later state',
        bad: `vm.refresh()                                   // launches in viewModelScope
assertEquals(UiState.Success(articles), vm.state.first())`,
        good: `vm.refresh()
assertEquals(
    UiState.Success(articles),
    vm.state.first { it is UiState.Success },
)`,
        why: 'A <code>StateFlow</code> always has a value, so <code>first()</code> returns the current one at once, often still <code>Loading</code>. Wait for the state you mean with a predicate, or advance the scheduler and read <code>value</code>.',
      },
      {
        title: 'Forgetting the StateFlow’s current value in Turbine',
        bad: `vm.state.test {
    vm.refresh()
    assertEquals(UiState.Success(articles), awaitItem())   // got Idle
}`,
        good: `vm.state.test {
    assertEquals(UiState.Idle, awaitItem())   // the current value comes first
    vm.refresh()
    assertEquals(UiState.Success(articles), expectMostRecentItem())
}`,
        why: 'Turbine receives the StateFlow’s current value as soon as it starts collecting. Take it first, or skip it with <code>skipItems(1)</code>.',
      },
    ],
  };

  const baselineDepth = {
    deeper: [
      {
        title: 'Startup Profiles also lay out the DEX files',
        body: `<p>A Baseline Profile decides which code gets compiled. A <em>Startup Profile</em>, a subset of it, also decides where that code sits. With R8 on, AGP puts the startup classes together at the front of <code>classes.dex</code>, so a launch reads one compact block of the file instead of pieces spread over several DEX files. Google reports startup usually 15% to 30% faster than with a Baseline Profile alone.</p>
<p>It needs AGP 8.2 or newer and <code>isMinifyEnabled = true</code>. Mark startup journeys with <code>includeInStartupProfile = true</code>, and keep them small enough to fit in the first DEX file.</p>`,
        code: `@Test fun startup() = baselineProfileRule.collect(
    packageName = "com.example.news",
    includeInStartupProfile = true,   // also writes startup-prof.txt
) {
    pressHome()
    startActivityAndWait()
}
// Output: src/<variant>/generated/baselineProfiles/startup-prof.txt, read by AGP`,
        visual(el) {
          const FILES = ['classes.dex', 'classes2.dex', 'classes3.dex'], PER = 30;
          const SPREAD = [2, 7, 12, 19, 26, 33, 41, 48, 55, 63, 70, 77, 84, 88];
          const PACKED = [0, 1, 2, 3, 4];
          let packed = false, busy = false;
          const cells = [];
          const files = FILES.map((name, f) => h('div', { class: 'tst-d2-dex' }, h('span', { class: 'tst-d2-file' }, name),
            h('div', { class: 'tst-d2-pages' }, Array.from({ length: PER }, (_, i) => (cells[f * PER + i] = h('span', { class: 'tst-d2-pg' }))))));
          const stat = h('span', { class: 'tst-stats' });
          const o = out();
          const startup = () => (packed ? PACKED : SPREAD);
          function paint() {
            cells.forEach(c => { c.className = 'tst-d2-pg'; });
            startup().forEach(i => cells[i].classList.add('tst-d2-start'));
            stat.innerHTML = 'pages with startup code: <b>—</b> · files opened: <b>—</b>';
          }
          const sw = h('input', { type: 'checkbox', id: 'tst-d2-dexlayout', onchange() {
            if (busy) { sw.checked = packed; return; }
            packed = sw.checked; paint();
            say(o, packed ? 'Rebuilt with a Startup Profile: the startup classes moved to the front of classes.dex.' : 'No Startup Profile: startup classes sit wherever the build happened to put them.');
          } });
          async function launch() {
            if (busy) return; busy = true;
            try {
              paint();
              say(o, `${hl('startActivityAndWait()')} <span class="muted">// cold start, reading startup code</span>`);
              const list = startup(), seenFiles = new Set();
              for (const i of list) {
                cells[i].classList.add('tst-d2-hit'); replay(cells[i], 'pop');
                seenFiles.add(Math.floor(i / PER));
                stat.innerHTML = `pages with startup code: <b>${list.indexOf(i) + 1}</b> · files opened: <b>${seenFiles.size}</b>`;
                await sleep(packed ? 220 : 160); if (!el.isConnected) return;
              }
              o.append(h('div', { class: 'line drop-in', html: packed ? '<span class="good">5 pages, 1 file.</span> Less to read and keep in memory before the first frame.' : '<span class="bad">14 pages in 3 files.</span> Each page also holds code startup never needs.' }));
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'Each square is a page of a DEX file. Orange pages hold startup code. Run a cold start.';
          el.append(
            h('label', { class: 'switch', for: 'tst-d2-dexlayout' }, sw, h('span', { html: hl('includeInStartupProfile = true') })),
            h('div', { class: 'tst-sub' }, files),
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: launch }, 'Cold start'), stat),
            h('p', { class: 'tip' }, 'A simplified picture. Real gains depend on the app and the device.'),
            o);
        },
      },
      {
        title: 'How the profile reaches a phone',
        body: `<p>The profile ships in the APK as <code>assets/dexopt/baseline.prof</code>. Play passes it to the device at install, so ART compiles the listed methods before the first launch. Play also aggregates profiles from real users into Cloud Profiles, but those take hours to days after each release. Your Baseline Profile covers that gap.</p>
<p>Other install paths may not use the profile at install. Then <code>androidx.profileinstaller</code> writes it on the first run, and the benefit arrives when the background dexopt job runs, likely overnight. Since AGP 8.4, installing a non-debuggable build from Studio or Gradle also installs the profile, so local release builds behave like Play installs.</p>`,
        visual(el) {
          const PATHS = { play: 'Google Play', side: 'Other store or sideload', local: 'Studio / Gradle (AGP 8.4+)' };
          let path = 'play', compiled = true, written = false, launches = [], busy = false;
          const lanes = h('div', { class: 'timeline' });
          const state = h('span', { class: 'tst-res' });
          const o = out();
          const keys = Object.keys(PATHS);
          const pBtns = keys.map(k => h('button', { class: 'cmd', onclick() { if (busy) return; path = k; install(); } }, PATHS[k]));
          function paintState() {
            state.textContent = compiled ? 'startup code: AOT compiled' : written ? 'profile written, not compiled yet' : 'no profile on device';
            state.className = 'tst-res drop-in' + (compiled ? '' : ' tst-bad');
          }
          function paintLanes() {
            lanes.replaceChildren(...(launches.length ? launches.map((l, i) => h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, `launch ${l.n}`),
              h('div', { class: 'lane-track' }, h('span', { class: `bar ${l.aot ? 'tst-aotbar' : 'tst-interp'}` + (i === launches.length - 1 ? ' drop-in' : ''), style: `left:0;width:${(l.ms / 1400) * 100}%` }),
                h('span', { class: 'tst-d2-ms' }, `${l.ms} ms`)))) : [h('p', { class: 'tip' }, 'No launches yet.')]));
          }
          let count = 0;
          function install() {
            pressed(pBtns, keys, path);
            compiled = path !== 'side'; written = compiled; launches = []; count = 0;
            paintState(); paintLanes();
            say(o, path === 'side' ? 'Installed without install-time compilation. Launch it.' : `Installed from ${PATHS[path]}: dex2oat compiled the profile during install.`);
          }
          async function launch() {
            if (busy) return; busy = true;
            try {
              await sleep(250); if (!el.isConnected) return;
              const ms = compiled ? 680 + (count % 3) * 9 : 1020 - Math.min(count, 2) * 18;
              launches.push({ n: ++count, ms, aot: compiled }); if (launches.length > 5) launches.shift();
              paintLanes();
              say(o, `cold start ${count}: first frame at ${compiled ? `<span class="good">${ms} ms</span>` : `<span class="bad">${ms} ms</span>`}`);
              if (!written) { written = true; paintState(); o.append(h('div', { class: 'line drop-in' }, 'ProfileInstaller: wrote the baseline profile. ART compiles it at the next background dexopt.')); }
              else if (!compiled) o.append(h('div', { class: 'line drop-in' }, 'Still interpreted and JIT compiled. The profile waits for the idle job.'));
            } finally { busy = false; }
          }
          function night() {
            if (busy) return;
            if (compiled) { say(o, 'Background dexopt ran. Startup code was already compiled, nothing changes.'); return; }
            if (!written) { say(o, 'Background dexopt ran, but no profile was written yet. Launch the app once first.'); return; }
            compiled = true; paintState(); replay(state, 'pop');
            say(o, '<span class="good">Overnight, idle and charging:</span> background dexopt compiled the profile with speed-profile.');
          }
          install();
          launches = [{ n: 1, ms: 680, aot: true }]; count = 1; paintLanes();
          o.innerHTML = 'Installed from Play and launched once: 680 ms. Pick another install path.';
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'tst-label' }, 'install from'), pBtns),
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: launch }, 'Launch app'), h('button', { class: 'btn small', onclick: night }, 'Leave it overnight'), state),
            lanes,
            h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'bar tst-aotbar' }), 'AOT from the profile'), h('span', {}, h('i', { class: 'bar tst-interp' }), 'interpreted + JIT')),
            o);
        },
      },
    ],
    underHood: {
      body: `<p>The generated rules are plain text. Each line names a class, or a method with flags: <code>H</code> for hot, <code>S</code> for used during startup, <code>P</code> for used after startup. AGP merges your rules with the ones libraries ship, rewrites the names to match R8's output, and compiles everything into the binary <code>baseline.prof</code> in <code>assets/dexopt/</code>. ART uses it only while it stays under 1.5 MB.</p>
<p>At install, <code>dex2oat</code> runs with the <code>speed-profile</code> filter. It compiles exactly the methods in the profile to machine code and leaves the rest to the interpreter and the JIT. While the app runs, ART records which other methods get hot, and the background dexopt job later compiles those as well.</p>`,
      code: `# baseline-prof.txt (excerpt)
Lcom/example/news/MainActivity;
HSPLcom/example/news/MainActivity;->onCreate(Landroid/os/Bundle;)V
HSPLcom/example/news/feed/FeedViewModel;-><init>(Lcom/example/news/data/NewsRepository;)V
PLcom/example/news/feed/FeedScreenKt;->FeedRow(Lcom/example/news/Article;Landroidx/compose/runtime/Composer;I)V`,
    },
    mistakes: [
      {
        title: 'No profileinstaller in the app',
        bad: `dependencies {
    implementation(platform(libs.compose.bom))
    "baselineProfile"(project(":baselineprofile"))
    // the profile is generated, but nothing installs it off Play
}`,
        good: `dependencies {
    implementation(platform(libs.compose.bom))
    implementation("androidx.profileinstaller:profileinstaller:1.4.1")
    "baselineProfile"(project(":baselineprofile"))
}`,
        why: 'Installs that skip install-time compilation, and older devices, get the profile only through <code>profileinstaller</code>. Macrobenchmark also uses it to install the profile for <code>CompilationMode.Partial()</code>.',
      },
      {
        title: 'A profile generated once and never again',
        bad: `// baseline-prof.txt committed a year ago.
// Since then: new home screen, renamed ViewModels, a new DI setup.`,
        good: `// CI, before every release build:
// ./gradlew :app:generateReleaseBaselineProfile
// then commit the regenerated src/release/generated/baselineProfiles/`,
        why: 'Rules for methods that were renamed or removed match nothing, and new startup code is missing. Regenerate the profile as part of each release.',
      },
      {
        title: 'Benchmarking with CompilationMode.Full()',
        bad: `@Test fun startupWithProfile() = startup(CompilationMode.Full())`,
        good: `@Test fun startupWithProfile() = startup(CompilationMode.Partial())`,
        why: '<code>Full()</code> compiles the whole app ahead of time, which no user’s device does. It hides how good or bad your profile is. <code>Partial()</code> installs your Baseline Profile, like a real install.',
      },
    ],
  };

  // ─── Promoted and gap lessons ─────────────────────────────────────────
  const robolectricLesson = {
    id: 'robolectric',
    title: 'Robolectric: Android on the JVM',
    tagline: 'Run tests that need Android classes on your computer, with no device.',
    level: 'intermediate',
    body: `
<p>Some logic needs Android classes but no real screen, like code that reads a <code>Uri</code>, a string resource or <code>SharedPreferences</code>. In <code>src/test</code> those calls throw, because the JVM only has a stub of the Android framework. Robolectric runs the same test on the JVM with a simulated framework. Google maintains it, and it supports Android versions back to API 21.</p>
<p>It needs no device, but it boots a sandbox first, so the first test in a run takes a few seconds. After that each test is fast. It is not a full emulator: some things, like <code>WebView</code> or system UI such as edge-to-edge, still need a device test.</p>
<p>Below, one test runs three ways, then 50 tests show how the setup cost spreads out.</p>`,
    code: `// app/build.gradle.kts
android {
    testOptions { unitTests { isIncludeAndroidResources = true } }
}
dependencies {
    testImplementation("org.robolectric:robolectric:<version>")
    testImplementation("androidx.test.ext:junit:<version>")
}

// app/src/test/java/.../LinkParserTest.kt
@RunWith(AndroidJUnit4::class)   // in src/test this runs on Robolectric
class LinkParserTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()

    @Test fun extractsArticleId() {
        val uri = Uri.parse("https://example.com/news/42")
        assertEquals("42", LinkParser.articleId(uri))
    }

    @Test fun readsTheBreakingLabel() {
        assertEquals("Eilmeldung", context.getString(R.string.breaking))
    }
}`,
    remember: 'Need Android classes but not a device? Robolectric runs them on the JVM. You pay the sandbox boot once per run.',
    deeper: [
      {
        title: 'The main looper is paused',
        body: `<p>Since Robolectric 4.4 the default looper mode is <code>PAUSED</code>. It works like a real phone: a <code>Runnable</code> posted to the main looper does not run inline. It waits in the queue until the test lets the looper run with <code>shadowOf(getMainLooper()).idle()</code>.</p>
<p>The clock is frozen too. <code>idle()</code> runs only what is due now. <code>idleFor(...)</code> moves the clock forward and runs what became due on the way. Post a few things, assert, then idle.</p>`,
        code: `@Test fun showsBannerAfterPost() {
    banner.showLater()                          // posts to the main looper
    assertFalse(banner.isShown)                 // nothing ran yet
    shadowOf(getMainLooper()).idle()            // run what is due now
    assertTrue(banner.isShown)
}

@Test fun hidesAfterThreeSeconds() {
    banner.show()                               // posts hide() with a 3 s delay
    shadowOf(getMainLooper()).idleFor(Duration.ofSeconds(3))
    assertFalse(banner.isShown)
}`,
        visual(el) {
          let now = 0, shown = false, busy = false;
          const queue = [];
          const qBox = h('div', { class: 'tst-rb-box', 'aria-label': 'Main looper queue' });
          const ranBox = h('div', { class: 'tst-rb-box', 'aria-label': 'Ran' });
          const clock = h('span', { class: 'clock' });
          const state = h('span', { class: 'tst-res' });
          const o = out();
          function paint() {
            clock.textContent = `clock ${fmt(now)}`;
            state.textContent = `banner.isShown = ${shown}`;
            state.className = 'tst-res' + (shown ? '' : ' tst-bad');
            qBox.replaceChildren(h('span', { class: 'tst-label' }, 'queued'),
              ...queue.slice().sort((a, b) => a.due - b.due).map(m => h('span', { class: 'tst-rb-msg drop-in' }, `${m.name}  due ${fmt(m.due)}`)));
          }
          const post = (name, delay, fn) => { queue.push({ name, due: now + delay, fn }); paint(); };
          async function runUntil(t, label) {
            if (busy) return; busy = true;
            say(o, `<span class="muted">$</span> ${label}`);
            qBox.classList.add('tst-rb-hot');
            for (;;) {
              const due = queue.filter(m => m.due <= t).sort((a, b) => a.due - b.due)[0];
              if (!due) break;
              await sleep(350); if (!el.isConnected) return;
              queue.splice(queue.indexOf(due), 1);
              now = Math.max(now, due.due); due.fn();
              ranBox.append(h('span', { class: 'tst-rb-msg tst-rb-ran drop-in' }, `${due.name} at ${fmt(now)}`));
              while (ranBox.children.length > 5) ranBox.children[1].remove();
              paint();
            }
            now = Math.max(now, t); paint();
            qBox.classList.remove('tst-rb-hot');
            const left = queue.length;
            o.append(h('div', { class: 'line drop-in' }, left ? `${left} message${left > 1 ? 's' : ''} still waiting: not due yet.` : 'Queue empty.'));
            busy = false;
          }
          function check(expect) {
            if (busy) return;
            const ok = shown === expect;
            say(o, ok ? `<span class="good">PASSED</span> banner.isShown is ${shown}` : `<span class="bad">AssertionError:</span> expected ${expect}, was ${shown}.${queue.length ? ' The post is still in the queue.' : ''}`);
          }
          ranBox.append(h('span', { class: 'tst-label' }, 'ran'));
          paint();
          o.innerHTML = 'Post the banner, then assert before and after idle().';
          el.append(
            h('div', { class: 'controls tst-wrap' },
              cmd('banner.showLater()', () => { if (!busy) { post('show()', 0, () => { shown = true; }); say(o, 'Posted show(). It waits in the queue.'); } }),
              cmd('postDelayed(hide, 3_000)', () => { if (!busy) { post('hide()', 3000, () => { shown = false; }); say(o, 'Posted hide() for 3 s from now.'); } })),
            h('div', { class: 'controls tst-wrap' },
              cmd('assertTrue(banner.isShown)', () => check(true)),
              cmd('assertFalse(banner.isShown)', () => check(false))),
            h('div', { class: 'controls tst-wrap' },
              cmd('shadowOf(getMainLooper()).idle()', () => runUntil(now, 'idle()')),
              cmd('idleFor(Duration.ofSeconds(3))', () => runUntil(now + 3000, 'idleFor(3 s)')),
              h('button', { class: 'btn small', onclick() { if (busy) return; queue.length = 0; now = 0; shown = false; ranBox.replaceChildren(h('span', { class: 'tst-label' }, 'ran')); paint(); say(o, 'New test.'); } }, 'New test'),
              clock),
            h('div', { class: 'tst-rb-loop' }, qBox, h('span', { class: 'tst-rb-arrow', 'aria-hidden': 'true' }, '→'), ranBox),
            h('div', { class: 'controls tst-wrap' }, state),
            o);
        },
      },
      {
        title: 'Pick the API level and resources with @Config',
        body: `<p>By default Robolectric runs your tests at the <code>targetSdk</code> of the app. Put <code>@Config(sdk = [...])</code> on a class or a test to choose levels yourself. With several levels listed, the test runs once per level, which is a cheap way to check code that branches on <code>Build.VERSION.SDK_INT</code>.</p>
<p><code>@Config(qualifiers = "...")</code> sets resource qualifiers like language, night mode or screen size, so you can check that German strings or dark colors are picked up.</p>`,
        code: `@RunWith(AndroidJUnit4::class)
@Config(sdk = [26, 35])                    // every test runs twice
class NotificationFactoryTest {
    @Test fun usesAChannelOnOreoAndLater() { /* ... */ }
}

@Test
@Config(qualifiers = "de-rDE-night")
fun picksGermanDarkResources() {
    assertEquals("Eilmeldung", context.getString(R.string.breaking))
}`,
      },
      {
        title: 'Compose UI tests without a device',
        body: `<p>Robolectric can run Espresso and Compose UI tests too. The same <code>createComposeRule()</code> test can live in <code>src/test</code> with <code>@RunWith(AndroidJUnit4::class)</code> and run in seconds on the JVM. That is a good home for most behavior tests of a single screen: tap this, see that.</p>
<p>Keep a few tests on a device for what Robolectric does not simulate well, like system UI, <code>WebView</code> or real hardware.</p>`,
        code: `// app/src/test/... runs on Robolectric
// debugImplementation("androidx.compose.ui:ui-test-manifest") provides the host activity
@RunWith(AndroidJUnit4::class)
class LikeButtonTest {
    @get:Rule val rule = createComposeRule()

    @Test fun tapTogglesLike() {
        rule.setContent { LikeButton() }
        rule.onNodeWithContentDescription("Like").performClick()
        rule.onNodeWithContentDescription("Liked").assertExists()
    }
}`,
      },
    ],
    mistakes: [
      {
        title: 'Asserting before the looper runs',
        bad: `banner.showLater()
Thread.sleep(500)                 // the paused looper never runs on its own
assertTrue(banner.isShown)`,
        good: `banner.showLater()
shadowOf(getMainLooper()).idle()
assertTrue(banner.isShown)`,
        why: 'In paused looper mode posted work only runs when the test idles the looper. Sleeping the test thread just wastes time.',
      },
      {
        title: 'Resources not included',
        bad: `android {
    // no testOptions: Robolectric can't see the merged resources
}`,
        good: `android {
    testOptions { unitTests { isIncludeAndroidResources = true } }
}`,
        why: 'Robolectric reads your app’s merged resources and manifest. Without this flag Gradle does not hand them to the test, and resource lookups fail.',
      },
      {
        title: 'Robolectric for things it cannot simulate',
        bad: `// src/test
@Test fun articleWebViewLoadsPage() { /* WebView on Robolectric */ }`,
        good: `// src/androidTest: a real WebView on a device
@Test fun articleWebViewLoadsPage() { /* ... */ }`,
        why: 'Robolectric covers most of the framework, not all of it. WebView, system UI and hardware behavior need a device or emulator.',
      },
    ],
    terms: [
      { term: 'Robolectric', def: 'A Google-maintained framework that runs Android tests on the JVM with a simulated Android framework.' },
      { term: 'Shadow', def: 'A Robolectric class that stands in for part of a framework class, such as ShadowLooper for Looper.' },
      { term: 'Paused looper mode', def: 'Robolectric’s default since 4.4: posted work waits in the main looper until the test idles it.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Run this test on Robolectric and let the posted work run.', code: '@RunWith([[AndroidJUnit4]]::class)\nclass BannerTest {\n    @Test fun shows() {\n        banner.showLater()\n        shadowOf(getMainLooper()).[[idle]]()\n        assertTrue(banner.isShown)\n    }\n}', why: '<code>AndroidJUnit4</code> picks Robolectric in <code>src/test</code>. <code>idle()</code> runs everything the main looper has due.' },
      { type: 'bug', prompt: 'This Robolectric test fails with “expected true”. Tap the line that should let the post run.', code: '@Test fun showsSavedMessage() {\n    val vm = SaveViewModel(context)\n    vm.save()                     // posts the message to the main looper\n    Thread.sleep(500)\n    assertTrue(vm.savedMessageShown)\n}', bug: 3, fix: '    shadowOf(getMainLooper()).idle()', why: 'The main looper is paused. Only idle() or idleFor() runs what is queued; sleeping does not.' },
    ],
    quiz: [
      { q: 'Where do Robolectric tests live and run?', options: ['<code>src/androidTest</code>, on a device', '<code>src/test</code>, on the JVM', 'Only on a CI emulator'], a: 1, why: 'Robolectric is a local test runner. No device, no APK install.' },
      { q: 'Why does the first Robolectric test in a run take seconds?', options: ['It boots the simulated Android sandbox', 'It installs an APK', 'It waits for an emulator'], a: 0, why: 'The sandbox loads the framework once. The tests after it are fast.' },
      { q: 'In paused looper mode, a Runnable posted to the main looper…', options: ['runs right away', 'never runs', 'waits until the test calls idle() or idleFor()'], a: 2, why: 'Like on a real device, posting only queues the work. The test decides when the looper runs.' },
      { q: 'In paused looper mode, code under test posts a Runnable to the main looper. Which test order is right?', options: ['Trigger the code → shadowOf(getMainLooper()).idle() → assert', 'Trigger the code → assert → idle()', 'Trigger the code → Thread.sleep(500) → assert'], a: 0, why: 'Posted work waits in the queue until the test runs the looper. Asserting first sees nothing, and sleeping does not run the queue.' },
      { q: 'A test is marked <code>@Config(sdk = [28, 34])</code>. How does it run?', options: ['Once, at API 34', 'Twice, once per listed level', 'Once, at the app’s targetSdk'], a: 1, why: 'With several levels listed, Robolectric runs the test once for each. It is a cheap way to cover code that branches on SDK_INT.' },
    ],
    visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['plain JVM', 'Robo&shy;lectric', 'device'],
            span: 6,
            unit: 's',
            predict: {
              q: 'One Robolectric test takes about 3.3 s. Roughly how long do 50 of them take in one run?',
              options: ['About 50 × 3.3 s, close to three minutes', 'About 5.5 s: the sandbox boots once, then each test is fast', 'The same as 50 tests on a device'],
              a: 1,
              why: 'Most of the first test’s time is booting the simulated framework. Later tests in the same run reuse it and take tens of milliseconds.',
            },
            frames: [
              { now: 0, say: '<code>LinkParserTest</code> calls <code>Uri.parse</code>. Run it three ways and watch the clock from the moment you start. Times are typical, not exact.' },
              { bars: [{ lane: 0, from: 0, to: 0.15, tone: 'err', label: '✗' }], say: 'Plain JVM: <code>android.jar</code> holds only stubs, so <code>Uri.parse</code> throws “Method parse in android.net.Uri not mocked”. It fails in milliseconds.' },
              { bars: [{ lane: 1, from: 0, to: 3.2, tone: 'muted', label: 'boot sandbox' }], say: 'Robolectric first boots a simulated Android framework inside the JVM. That takes a few seconds.' },
              { bars: [{ lane: 1, from: 3.2, to: 3.3, tone: 'ok' }], say: 'Then the test runs real Android code, <code>Uri</code> and resources included, in about 50 ms. It passes.' },
              { bars: [{ lane: 2, from: 0, to: 6, tone: 'warm', label: 'build + install 2 APKs, ~38 s →' }], say: 'On a device, Gradle first builds and installs the app and the test APK. The first test starts after half a minute or more.' },
              { bars: [{ lane: 1, from: 3.3, to: 5.5, tone: 'ok', label: '+49 tests' }], say: 'Now run 50 Robolectric tests. The sandbox boots once, and the other 49 take about 45 ms each.' },
              { now: 5.5, say: 'Robolectric: Android APIs at near-JVM speed, no device. It is still not a full device: <code>WebView</code> or system UI need a real one.' },
            ],
          });
        },
  };

  const mockkLesson = {
    id: 'mockk',
    title: 'Mocks with MockK',
    tagline: 'Script an answer, then check the one call that matters.',
    level: 'intermediate',
    body: `
<p>A fake is the default choice (see <em>Unit tests with fakes</em>). Sometimes the thing you want to check is the call itself: did the ViewModel log an analytics event, send a message, delete a file? Those functions often return <code>Unit</code>, so there is no state to read back. A mock records every call, so the test can check it.</p>
<p>MockK is a mocking library for Kotlin. <code>mockk&lt;T&gt;()</code> creates a mock. <code>every { ... } returns x</code> scripts an answer, and <code>just Runs</code> scripts a <code>Unit</code> function. <code>verify { ... }</code> checks that a call happened with the arguments you expect. A plain mock is strict: any call you did not script throws <code>MockKException</code>.</p>
<p>Keep mocks for side effects you can’t observe another way. Verifying every call ties the test to how the code works instead of what it does.</p>`,
    code: `interface Analytics {
    fun log(event: String, articleId: Int)
}

class ArticleViewModelTest {
    private val analytics = mockk<Analytics>()

    @Test fun openingAnArticleLogsOnce() {
        every { analytics.log(any(), any()) } just Runs
        val vm = ArticleViewModel(analytics)

        vm.open(articleId = 7)

        verify(exactly = 1) { analytics.log("article_open", 7) }
        confirmVerified(analytics)            // and nothing else was called
    }
}

// testImplementation("io.mockk:mockk:<version>")`,
    remember: 'Fakes for state, mocks for side effects. Verify the call that matters, not every call.',
    deeper: [
      {
        title: 'Suspend functions: coEvery and coVerify',
        body: `<p>Inside <code>every { }</code> you can’t call a suspend function, because that block is not a coroutine. MockK has coroutine versions: <code>coEvery</code> to script and <code>coVerify</code> to check. They take the same matchers, and <code>throws</code> works for error paths.</p>`,
        code: `val repo = mockk<NewsRepository>()
coEvery { repo.latest() } returns listOf(article)
// or the error path
coEvery { repo.latest() } throws IOException("offline")

vm.load()
coVerify(exactly = 1) { repo.latest() }`,
      },
      {
        title: 'Capture an argument with slot',
        body: `<p>Sometimes the code builds the argument itself, like an event with a timestamp. Matching it exactly is hard. Capture it instead: create a <code>slot</code>, pass <code>capture(slot)</code> as the matcher, then assert on the fields you care about.</p>`,
        code: `val sent = slot<ChatMessage>()
coEvery { chatApi.send(capture(sent)) } just Runs

vm.send("Hello")

assertEquals("Hello", sent.captured.text)
assertEquals(UserId(42), sent.captured.from)`,
      },
      {
        title: 'Strict, relaxed and relaxUnitFun',
        body: `<p>A strict mock fails loudly on any call you did not script. <code>mockk(relaxed = true)</code> answers every call with a default instead: 0, an empty string, an empty list, or another relaxed mock. That is convenient and hides bugs, because a wrong call quietly returns something.</p>
<p><code>relaxUnitFun = true</code> is the middle ground. Only functions that return <code>Unit</code> are relaxed. Anything that returns data must still be scripted.</p>`,
        code: `val analytics = mockk<Analytics>(relaxUnitFun = true)   // log() just runs
val repo = mockk<NewsRepository>()                       // latest() must be scripted

val careless = mockk<NewsRepository>(relaxed = true)
careless.latest()   // returns an empty list without complaint`,
      },
    ],
    mistakes: [
      {
        title: 'Verifying the query instead of the result',
        bad: `coEvery { repo.latest() } returns listOf(article)
vm.load()
coVerify { repo.latest() }   // the screen could still be broken`,
        good: `coEvery { repo.latest() } returns listOf(article)
vm.load()
assertEquals(UiState.Success(listOf(article)), vm.state.value)`,
        why: 'The user sees the state, not the call. Check the output when there is one, and keep verify for side effects.',
      },
      {
        title: 'A relaxed repository',
        bad: `val repo = mockk<NewsRepository>(relaxed = true)
vm.load()
assertEquals(UiState.Empty, vm.state.value)   // passes for the wrong reason`,
        good: `coEvery { repo.latest() } returns emptyList()
vm.load()
assertEquals(UiState.Empty, vm.state.value)`,
        why: 'A relaxed mock returns an empty list for anything. The test passes even if load() calls the wrong function.',
      },
      {
        title: 'Mocking types you don’t own',
        bad: `val context = mockk<Context>()
every { context.getString(R.string.breaking) } returns "Eilmeldung"`,
        good: `interface Strings { fun breaking(): String }
class FakeStrings : Strings { override fun breaking() = "Eilmeldung" }`,
        why: 'You don’t know every call a framework class makes inside. Wrap it behind your own small interface, or use the real thing on Robolectric.',
      },
    ],
    terms: [
      { term: 'Mock', def: 'A test double that you program per call and that records its calls so the test can verify them.' },
      { term: 'Stub', def: 'A scripted answer for a call, such as every { repo.latest() } returns list.' },
      { term: 'Verification', def: 'A check that a call happened with certain arguments and a certain number of times, such as verify(exactly = 1).' },
      { term: 'Relaxed mock', def: 'A MockK mock that returns default values for calls you did not script instead of throwing.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Create a mock whose Unit functions just run, then check the event was logged once.', code: 'val analytics = [[mockk]]<Analytics>(relaxUnitFun = true)\nArticleViewModel(analytics).open(articleId = 7)\n[[verify]](exactly = 1) { analytics.log("article_open", 7) }', why: '<code>relaxUnitFun</code> lets <code>log()</code> run without a script. <code>verify</code> checks the call and its arguments.' },
      { type: 'bug', prompt: 'This test does not compile: “Suspend function can be called only from a coroutine”. Tap the line.', code: '@Test fun showsArticles() = runTest {\n    val repo = mockk<NewsRepository>()\n    every { repo.latest() } returns listOf(article)\n    val vm = NewsViewModel(repo)\n    vm.load()\n    assertEquals(UiState.Success(listOf(article)), vm.state.value)\n}', bug: 2, fix: '    coEvery { repo.latest() } returns listOf(article)', why: '<code>latest()</code> is a suspend function. Script it with <code>coEvery</code>, whose block is a coroutine.' },
    ],
    quiz: [
      { q: 'When is a mock a better fit than a fake?', options: ['To give a ViewModel data to show', 'To check a side effect with no state to read back, like an analytics event', 'In every unit test'], a: 1, why: 'A fake covers state. A mock shines when the call itself is the behavior.' },
      { q: 'A plain <code>mockk&lt;Analytics&gt;()</code> gets a call you never scripted. What happens?', options: ['It returns a default value', 'The call is ignored', 'It throws MockKException'], a: 2, why: 'Plain mocks are strict. Use relaxed or relaxUnitFun to change that, knowingly.' },
      { q: 'Which pair scripts and checks suspend functions?', options: ['coEvery and coVerify', 'every and verify', 'suspendEvery and suspendVerify'], a: 0, why: 'The co versions run their block as a coroutine, so suspend calls are allowed.' },
      { q: '<code>every { repo.load() } returns articles</code>, where load() is a suspend function. What happens?', options: ['It works like any other function', 'It does not compile, because every { } is not a coroutine; use coEvery', 'It returns articles only on the main thread'], a: 1, why: 'A suspend call needs a coroutine. coEvery and coVerify are the coroutine versions with the same matchers.' },
      { q: 'An Analytics mock has many Unit functions you don’t care about, plus <code>sessionId(): String</code>. You want unscripted Unit calls to pass but data calls to fail loudly. Which mock?', options: ['mockk&lt;Analytics&gt;()', 'mockk&lt;Analytics&gt;(relaxed = true)', 'mockk&lt;Analytics&gt;(relaxUnitFun = true)'], a: 2, why: 'relaxUnitFun relaxes only Unit functions. A relaxed mock would quietly return an empty sessionId, and a strict one fails on every unscripted log call.' },
    ],
    visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'val analytics = mockk<Analytics>()\n\n@Test fun openingAnArticleLogsOnce() {\n  every {\n    analytics.log(any(), any())\n  } just Runs\n  val vm = ArticleViewModel(analytics)\n  vm.open(articleId = 7)\n  verify(exactly = 1) {\n    analytics.log("article_open", 7)\n  }\n  confirmVerified(analytics)\n}',
            varsTitle: 'Inside the mock',
            outTitle: 'Test result',
            predict: {
              q: 'Say <code>open()</code> had a bug and logged the event twice. Which line would fail?',
              options: ['<code>vm.open(7)</code>: the second call throws', '<code>verify(exactly = 1)</code>', '<code>confirmVerified</code>', 'None: the test passes'],
              a: 1,
              why: 'The scripted answer accepts any number of calls and records them all. <code>verify(exactly = 1)</code> counts the matching calls in that record and finds two.',
            },
            frames: [
              { say: 'A mock records every call made on it. Step through the test and watch the record.' },
              { line: 1, vars: { answers: 'none', recorded: 'none' }, say: '<code>mockk&lt;Analytics&gt;()</code> makes a strict mock: no answers yet, so any call would throw <code>MockKException</code>.' },
              { line: [4, 5, 6], vars: { answers: 'log(any(), any()) → Unit' }, say: '<code>every { … } just Runs</code> scripts <code>log()</code> for any arguments. It returns <code>Unit</code>.' },
              { line: 7, vars: { vm: 'ArticleViewModel(mock)' }, say: 'The ViewModel gets the mock through its constructor, like a fake.' },
              { line: 8, stack: ['vm.open(7)', 'analytics.log("article_open", 7)'], vars: { recorded: 'log("article_open", 7)' }, say: '<code>open()</code> calls <code>log()</code>. The mock finds the scripted answer, returns, and records the call with its arguments.' },
              { line: [9, 10, 11], stack: [], out: 'verify: 1 matching call ✓', say: '<code>verify</code> searches the record for <code>log("article_open", 7)</code> and finds exactly one.' },
              { line: 12, out: 'confirmVerified: no unverified calls ✓\nPASSED', say: '<code>confirmVerified</code> checks that no other call was recorded. The test passes.' },
              { line: 8, vars: { recorded: 'log("article_open", 7) × 2' }, out: '— with the bug: open() logs twice —', say: 'Now imagine the bug. Both calls match the script, so <code>open()</code> runs fine and the record holds two calls.' },
              { line: [9, 10, 11], out: 'verify(exactly = 1): found 2 calls ✗\nFAILED', say: 'The <code>verify</code> check fails. The mock caught a side effect that left no state to read back.' },
            ],
          });
        },
  };

  const screenshotsLesson = {
    id: 'screenshots',
    title: 'Screenshot tests',
    tagline: 'Save a picture of the UI and fail when it changes.',
    level: 'intermediate',
    body: `
<p>A behavior test checks that a button exists and does the right thing. It does not notice that the padding shrank, the title now wraps, or the dark theme made text unreadable. A screenshot test renders a composable, saves the image as a <em>reference</em> (also called a golden), and on later runs compares a fresh render to it. One test checks colors, sizes, spacing and fonts at once.</p>
<p>There are two commands. <b>Record</b> writes reference images, which you commit. <b>Verify</b> renders again and fails if an image differs, with a report that shows the reference, the new image and the difference. A failure is not always a bug. If the change was on purpose, you record again, and the reviewer approves the new image in the pull request.</p>
<p>Most teams run them on the JVM for speed. Roborazzi renders through Robolectric. Google’s Compose Preview Screenshot Testing renders your previews and is still experimental.</p>`,
    code: `// module build.gradle.kts: plugins { id("io.github.takahirom.roborazzi") }
// plus the Roborazzi and Robolectric test dependencies

@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)        // real rendering on Robolectric
class ArticleCardScreenshotTest {
    @get:Rule val composeRule = createComposeRule()

    @Test fun articleCard() {
        composeRule.setContent { AppTheme { ArticleCard(sampleArticle) } }
        composeRule.onRoot().captureRoboImage("src/test/screenshots/article_card.png")
    }
}

// ./gradlew recordRoborazziDebug    write the reference images, then commit them
// ./gradlew verifyRoborazziDebug    fail when a render differs from its reference`,
    remember: 'Record a reference, verify against it on the same machine, and read the diff before you record again.',
    deeper: [
      {
        title: 'Pixel-perfect needs one machine',
        body: `<p>Fonts, the OS, the CPU architecture and library versions all change rendering a little. A reference recorded on a Mac can fail on a Linux CI server with nothing wrong in your code.</p>
<p>Either record and verify in the same place, usually CI, or allow a small tolerance. Tolerance has a cost: a real change smaller than the threshold passes too. A common CI flow runs verify on every pull request, records new images when it fails, and commits them to the branch so the reviewer sees and approves them.</p>`,
      },
      {
        title: 'Compose Preview Screenshot Testing',
        body: `<p>Google’s own tool turns previews into tests. Put <code>@PreviewTest</code> on a <code>@Preview</code> in the <code>screenshotTest</code> source set, then run the update and validate tasks. It renders on your computer with Layoutlib, the same engine as the Android Studio preview, so it needs no Robolectric.</p>
<p>It is experimental and its setup is still changing: the standalone Gradle plugin is being replaced by AGP test suites. Check the current docs before you set it up.</p>`,
        code: `// app/src/screenshotTest/kotlin/.../ArticleCardScreenshots.kt
@PreviewTest
@Preview(showBackground = true)
@Composable
fun ArticleCardPreview() {
    AppTheme { ArticleCard(sampleArticle) }
}

// ./gradlew updateDebugScreenshotTest     record references
// ./gradlew validateDebugScreenshotTest   compare and write an HTML report`,
      },
      {
        title: 'Pick a few cases, not every combination',
        body: `<p>Themes, font sizes, screen widths and languages multiply. Test every combination and you get hundreds of images to review each time a color changes. Pick the cases that can break in a different way: dark theme, the largest font scale, the narrowest width, and the language with the longest words.</p>
<p>Turn the switches below and watch the count.</p>`,
        code: `@Preview(name = "light")
@Preview(name = "dark", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Preview(name = "large font", fontScale = 2f)
@Preview(name = "German", locale = "de")
@Composable
fun ArticleCardCases() { AppTheme { ArticleCard(sampleArticle) } }`,
        visual(el) {
          const AX = [
            { k: 'theme', label: 'themes', opts: [1, 2] },
            { k: 'font', label: 'font scales', opts: [1, 3, 5] },
            { k: 'width', label: 'widths', opts: [1, 3] },
            { k: 'lang', label: 'languages', opts: [1, 2, 6] },
          ];
          const S = { theme: 2, font: 1, width: 1, lang: 1, screens: 12 };
          const total = h('b');
          const o = out();
          const rows = AX.map(a => {
            const btns = a.opts.map(v => h('button', { class: 'cmd', onclick() { S[a.k] = v; paint(); } }, String(v)));
            a.btns = btns;
            return h('div', { class: 'controls tst-wrap' }, h('span', { class: 'tst-label' }, a.label), btns);
          });
          function paint() {
            AX.forEach(a => a.btns.forEach((b, i) => b.setAttribute('aria-pressed', String(a.opts[i] === S[a.k]))));
            const per = AX.reduce((p, a) => p * S[a.k], 1), n = per * S.screens;
            total.textContent = String(n);
            say(o, `${S.screens} screens × ${per} cases = <b>${n}</b> reference images. ${n > 300 ? '<span class="bad">One color change breaks all of them.</span>' : n > 60 ? 'Getting heavy to review.' : '<span class="good">Small enough to review.</span>'}`);
          }
          el.append(...rows, h('div', { class: 'tst-stats' }, h('span', {}, 'images to keep: ', total)), o);
          paint();
        },
      },
    ],
    mistakes: [
      {
        title: 'Recording on a laptop, verifying on CI',
        bad: `# on your Mac
./gradlew recordRoborazziDebug && git commit -am "update screenshots"
# CI on Linux: verifyRoborazziDebug fails on anti-aliasing`,
        good: `# CI records when verify fails and pushes the images to the branch;
# the reviewer approves them in the pull request`,
        why: 'Rendering differs between machines. Keep recording and verifying in one environment.',
      },
      {
        title: 'Recording just to make the build green',
        bad: `./gradlew verifyRoborazziDebug   # 14 images failed
./gradlew recordRoborazziDebug   # all green now`,
        good: `./gradlew verifyRoborazziDebug
# open build/reports/roborazzi/index.html, check every diff,
# then record only if each change was intended`,
        why: 'Recording accepts whatever the code draws now. Without reading the diff, the test catches nothing.',
      },
    ],
    terms: [
      { term: 'Reference image', def: 'The approved screenshot a test compares against, also called a golden. It is committed with the code.' },
      { term: 'Diff report', def: 'The output of a failed screenshot test, showing the reference, the new render and the pixels that changed.' },
      { term: 'Tolerance', def: 'How much difference a screenshot comparison allows before it fails, such as a percentage of changed pixels.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Name the two Roborazzi tasks for the debug variant.', code: '// write new reference images\n./gradlew [[recordRoborazziDebug]]\n// fail when a render differs\n./gradlew [[verifyRoborazziDebug]]', why: 'Record writes references. Verify compares and fails on a difference.' },
      { type: 'bug', prompt: 'This screenshot test fails on every run, even with no code change. Tap the line.', code: '@Test fun articleCard() {\n    composeRule.setContent {\n        AppTheme { ArticleCard(sampleArticle.copy(publishedAt = Clock.System.now())) }\n    }\n    composeRule.onRoot().captureRoboImage("src/test/screenshots/article_card.png")\n}', bug: 2, fix: '        AppTheme { ArticleCard(sampleArticle.copy(publishedAt = fixedInstant)) }', why: 'The card shows “2 minutes ago”, which changes every run. Screenshot inputs must be fixed: times, random values and network data.' },
    ],
    quiz: [
      { q: 'A screenshot test fails after you made the title bigger on purpose. What next?', options: ['Raise the tolerance until it passes', 'Check the diff, record new references, and let the reviewer approve them', 'Delete the test'], a: 1, why: 'An intended change means a new reference. The diff in the pull request is how the team approves it.' },
      { q: 'Why record and verify on the same machine?', options: ['Gradle refuses otherwise', 'It is faster', 'Fonts, OS and hardware change rendering slightly'], a: 2, why: 'Small rendering differences make pixel-perfect comparisons fail across machines.' },
      { q: 'What is the risk of a high tolerance?', options: ['A small real regression can pass', 'Tests run slower', 'More reference images'], a: 0, why: 'Anything under the threshold passes, including a missing icon or a 1 dp shift.' },
      { q: 'Which change is a screenshot test most likely to catch that assertIsDisplayed() misses?', options: ['A button that opens the wrong screen', 'Padding that shrank and a title that now wraps', 'A ViewModel that never loads'], a: 1, why: 'A screenshot compares the whole picture: colors, sizes, spacing and fonts. Behavior tests check that nodes exist and act right.' },
      { q: 'You have 3 themes, 4 font scales, 5 widths and 6 languages. Which set of cases fits best?', options: ['All 360 combinations', 'Default theme only', 'A few that break differently: dark theme, largest font scale, narrowest width, longest language'], a: 2, why: 'Each extra case adds images to review on every change. Pick the ones that can fail in their own way.' },
    ],
    predict: {
          q: 'Tolerance is 1%. You remove a small unread dot and run verify. What happens?',
          options: ['It fails: any change fails', 'It can pass: the dot is less than 1% of the pixels, so a real change slips through', 'Verify records a new reference'],
          a: 1,
          why: 'A tolerance accepts a share of changed pixels. A small but real change can stay under it, which is why high tolerances are risky.',
        },
    visual(el) {
      const W = 20, H = 12;
      const CHANGES = [
        { k: 'pad', label: 'padding 16 → 8 dp' },
        { k: 'font', label: 'title font larger' },
        { k: 'color', label: 'button color' },
        { k: 'dot', label: 'unread dot removed' },
        { k: 'machine', label: 'render on another machine' },
      ];
      const S = { pad: false, font: false, color: false, dot: false, machine: false, tol: 0, ref: null };
      function render() {
        const g = Array(W * H).fill('');
        const set = (x, y, k) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k; };
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) set(x, y, 'card');
        const p = S.pad ? 1 : 2, x0 = 1 + p, y0 = 1 + p;
        const tw = S.font ? 12 : 9, th = S.font ? 2 : 1;
        for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) set(x0 + x, y0 + y, 'title');
        if (!S.dot) set(W - 2 - p, y0, 'btn2');
        const ty = y0 + th + 1;
        for (let x = 0; x < 14; x++) set(x0 + x, ty, 'text');
        for (let x = 0; x < 9; x++) set(x0 + x, ty + 1, 'text');
        for (let y = 0; y < 2; y++) for (let x = 0; x < 5; x++) set(x0 + x, H - 2 - p - 1 + y, S.color ? 'btn2' : 'btn');
        if (S.machine) { set(x0 + tw, y0, 'aa'); set(x0 + 14, ty, 'aa'); }
        return g;
      }
      const mk = () => { const cells = Array.from({ length: W * H }, () => h('span', { class: 'tst-ss-px' })); return { cells, el: h('div', { class: 'tst-ss-img', role: 'img' }, cells) }; };
      const ref = mk(), now = mk(), diff = mk();
      ref.el.setAttribute('aria-label', 'Reference image'); now.el.setAttribute('aria-label', 'New render'); diff.el.setAttribute('aria-label', 'Difference');
      diff.el.classList.add('tst-ss-diff');
      const paintImg = (img, g) => img.cells.forEach((c, i) => { c.className = 'tst-ss-px' + (g && g[i] ? ' k-' + g[i] : ''); });
      const verdict = h('span', { class: 'tst-res' }, 'not run');
      const o = out();
      const boxes = CHANGES.map(c => {
        const input = h('input', { type: 'checkbox', id: 'tst-ss-' + c.k });
        input.addEventListener('change', () => { S[c.k] = input.checked; paint(); verdict.textContent = 'not run'; verdict.className = 'tst-res'; diff.cells.forEach(x => x.classList.remove('tst-ss-hit')); });
        return h('label', { class: 'switch', for: 'tst-ss-' + c.k }, input, h('span', {}, c.label));
      });
      const tolBtns = [0, 1].map(v => h('button', { class: 'cmd', onclick() { S.tol = v; tolBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === v))); say(o, v ? 'Tolerance: up to 1% of pixels may differ.' : 'Pixel-perfect: any changed pixel fails.'); } }, v ? '1% tolerance' : 'pixel-perfect'));
      function paint() { paintImg(now, render()); paintImg(ref, S.ref); ref.el.classList.toggle('tst-ss-empty', !S.ref); }
      function record() {
        S.ref = render(); paint();
        diff.cells.forEach(x => x.classList.remove('tst-ss-hit'));
        verdict.textContent = 'recorded'; verdict.className = 'tst-res drop-in';
        say(o, '<span class="muted">$</span> ./gradlew recordRoborazziDebug  <span class="good">1 reference written</span>');
      }
      async function verify() {
        if (!S.ref) { say(o, '<span class="bad">No reference image.</span> Record first.'); return; }
        const g = render();
        let n = 0;
        diff.cells.forEach(x => x.classList.remove('tst-ss-hit'));
        say(o, '<span class="muted">$</span> ./gradlew verifyRoborazziDebug');
        for (let i = 0; i < g.length; i++) if (g[i] !== S.ref[i]) { n++; diff.cells[i].classList.add('tst-ss-hit'); }
        await sleep(200); if (!el.isConnected) return;
        const pct = (n / g.length) * 100, pass = pct <= S.tol;
        verdict.textContent = pass ? 'PASSED' : 'FAILED'; verdict.className = 'tst-res drop-in' + (pass ? '' : ' tst-bad');
        const real = S.pad || S.font || S.color || S.dot;
        let note = '';
        if (pass && n && real) note = ' <span class="bad">A real change slipped under the threshold.</span>';
        else if (!pass && !real) note = ' Nothing changed in the code: only the machine.';
        o.append(h('div', { class: 'line drop-in', html: `${n} of ${g.length} pixels differ (${pct.toFixed(1)}%).${note}` }));
      }
      tolBtns[0].setAttribute('aria-pressed', 'true');
      record();
      o.innerHTML = 'A reference is recorded. Change something, then verify.';
      el.append(
        h('div', { class: 'controls tst-wrap' }, boxes),
        h('div', { class: 'tst-ss-wrap' },
          h('div', { class: 'tst-ss-pane' }, h('span', { class: 'tst-label' }, 'reference'), ref.el),
          h('div', { class: 'tst-ss-pane' }, h('span', { class: 'tst-label' }, 'new render'), now.el),
          h('div', { class: 'tst-ss-pane' }, h('span', { class: 'tst-label' }, 'diff'), diff.el)),
        h('div', { class: 'controls tst-wrap' }, tolBtns),
        h('div', { class: 'controls tst-wrap' }, cmd('./gradlew recordRoborazziDebug', record), cmd('./gradlew verifyRoborazziDebug', verify), verdict),
        o);
    },
  };

  const hiltTestingLesson = {
    id: 'hilt-testing',
    title: 'Hilt in tests',
    tagline: 'Swap a real binding for a fake in the graph the test app uses.',
    level: 'advanced',
    body: `
<p>A unit test builds a ViewModel by hand and passes fakes to its constructor. A UI test starts a real Activity, and Hilt builds that Activity’s dependencies. To get fakes in there, you change the Hilt graph for the test.</p>
<p>Mark the test class with <code>@HiltAndroidTest</code> and add a <code>HiltAndroidRule</code>. Hilt then generates components for the test and runs it in <code>HiltTestApplication</code> instead of your app class. To replace a module for every test in the source set, write a test module with <code>@TestInstallIn(components = ..., replaces = ...)</code>. To replace it for one test class only, use <code>@UninstallModules</code> with <code>@BindValue</code> or a nested module.</p>
<p>Prefer <code>@TestInstallIn</code>. Each class with <code>@UninstallModules</code> gets its own generated components, which can slow test builds a lot.</p>`,
    code: `// app/src/androidTest/java/.../FakeNetworkModule.kt   (every test in androidTest)
@Module
@TestInstallIn(components = [SingletonComponent::class], replaces = [NetworkModule::class])
abstract class FakeNetworkModule {
    @Singleton @Binds
    abstract fun bindApi(fake: FakeNewsApi): NewsApi
}

@Singleton
class FakeNewsApi @Inject constructor() : NewsApi {
    var articles = listOf(Article("Kotlin 2.3 released"))
    var error: Exception? = null
    var calls = 0
    override suspend fun latest(): List<Article> { calls++; error?.let { throw it }; return articles }
}

@HiltAndroidTest
class NewsScreenTest {
    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
    @get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()

    @Inject lateinit var api: FakeNewsApi

    @Before fun setUp() { hiltRule.inject() }

    @Test fun showsHeadlinesFromTheFake() {
        composeRule.onNodeWithText("Kotlin 2.3 released").assertIsDisplayed()
        assertEquals(1, api.calls)
    }
}

// androidTestImplementation("com.google.dagger:hilt-android-testing:<version>")
// kspAndroidTest("com.google.dagger:hilt-android-compiler:<version>")`,
    remember: '@HiltAndroidTest plus HiltAndroidRule first. Replace modules with @TestInstallIn; use @UninstallModules only when one class needs something different.',
    deeper: [
      {
        title: 'A test runner that swaps the Application',
        body: `<p>Hilt tests must run in <code>HiltTestApplication</code>, not your <code>@HiltAndroidApp</code> class. For instrumented tests, write a small runner that creates it, and point <code>testInstrumentationRunner</code> at it. For Robolectric, set the application with <code>@Config</code> on the class, or once for all tests in <code>robolectric.properties</code>.</p>`,
        code: `class HiltTestRunner : AndroidJUnitRunner() {
    override fun newApplication(cl: ClassLoader?, name: String?, context: Context?): Application =
        super.newApplication(cl, HiltTestApplication::class.java.name, context)
}
// android { defaultConfig { testInstrumentationRunner = "com.example.HiltTestRunner" } }

// Robolectric
@HiltAndroidTest
@Config(application = HiltTestApplication::class)
class SettingsScreenTest { /* ... */ }`,
      },
      {
        title: 'Rule order: Hilt first',
        body: `<p>The Compose rule launches the Activity, and the Activity asks Hilt for its dependencies. So <code>HiltAndroidRule</code> must run before every other rule. Give it <code>order = 0</code> and the others higher numbers, or wrap them in a <code>RuleChain</code> with the Hilt rule outside.</p>`,
        code: `@get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
@get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()
@get:Rule(order = 2) val screenshotRule = SomeOtherRule()`,
      },
      {
        title: '@BindValue for one test class',
        body: `<p>When one class needs a different binding, uninstall the production module there and bind a field with <code>@BindValue</code>. Hilt binds the field under its declared type. You can only uninstall modules marked <code>@InstallIn</code>, not other <code>@TestInstallIn</code> modules, and each class that does this costs extra build time.</p>
<p>Often a configurable shared fake is simpler: inject <code>FakeNewsApi</code> and set its error field in the test.</p>`,
        code: `@UninstallModules(NetworkModule::class)
@HiltAndroidTest
class OfflineScreenTest {
    @BindValue @JvmField
    val api: NewsApi = FakeNewsApi().apply { error = IOException("offline") }

    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
    // ...
}`,
      },
    ],
    mistakes: [
      {
        title: 'Forgetting hiltRule.inject()',
        bad: `@Inject lateinit var api: FakeNewsApi

@Test fun showsHeadlines() {
    api.articles = emptyList()   // lateinit property api has not been initialized
}`,
        good: `@Inject lateinit var api: FakeNewsApi

@Before fun setUp() { hiltRule.inject() }`,
        why: 'Hilt fills <code>@Inject</code> fields in the test only when you call <code>inject()</code>.',
      },
      {
        title: 'Uninstalling a @TestInstallIn module',
        bad: `@UninstallModules(FakeNetworkModule::class)   // a @TestInstallIn module
@HiltAndroidTest
class CheckoutErrorTest { /* ... */ }`,
        good: `@HiltAndroidTest
class CheckoutErrorTest {
    @Inject lateinit var api: FakeNewsApi
    @Before fun setUp() { hiltRule.inject(); api.error = IOException("offline") }
}`,
        why: '<code>@UninstallModules</code> only accepts <code>@InstallIn</code> modules, so this does not compile. Make the shared fake configurable instead.',
      },
      {
        title: '@UninstallModules in every class',
        bad: `@UninstallModules(NetworkModule::class) @HiltAndroidTest class NewsScreenTest { /* nested fake module */ }
@UninstallModules(NetworkModule::class) @HiltAndroidTest class SettingsScreenTest { /* the same again */ }`,
        good: `@TestInstallIn(components = [SingletonComponent::class], replaces = [NetworkModule::class])
@Module abstract class FakeNetworkModule { /* once, for all tests */ }`,
        why: 'Hilt generates a separate set of components for each class that uninstalls modules. The same fake everywhere belongs in one @TestInstallIn module.',
      },
    ],
    terms: [
      { term: '@HiltAndroidTest', def: 'Marks a test class that uses Hilt, so Hilt generates components for it.' },
      { term: 'HiltAndroidRule', def: 'The JUnit rule that sets up the Hilt components for each test and injects the test’s @Inject fields.' },
      { term: '@TestInstallIn', def: 'Marks a test module that replaces a production module for every test in the source set.' },
      { term: '@BindValue', def: 'Binds a field of the test class into the Hilt graph under its declared type.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Replace NetworkModule with a fake for every test in this source set.', code: '@Module\n@[[TestInstallIn]](\n    components = [SingletonComponent::class],\n    [[replaces]] = [NetworkModule::class],\n)\nabstract class FakeNetworkModule {\n    @Singleton @Binds\n    abstract fun bindApi(fake: FakeNewsApi): NewsApi\n}', why: '<code>@TestInstallIn</code> installs this module and removes the one named in <code>replaces</code>, for all tests in the folder.' },
      { type: 'bug', prompt: 'The Activity starts before Hilt has set up the test components. Tap the line to change.', code: '@HiltAndroidTest\nclass NewsScreenTest {\n    @get:Rule(order = 0) val composeRule = createAndroidComposeRule<MainActivity>()\n    @get:Rule(order = 1) val hiltRule = HiltAndroidRule(this)\n\n    @Test fun showsHeadlines() { /* ... */ }\n}', bug: 2, fix: '    @get:Rule(order = 2) val composeRule = createAndroidComposeRule<MainActivity>()', why: 'Rules run from the lowest order. The Hilt rule must come first, so the Compose rule needs a higher number.' },
    ],
    quiz: [
      { q: 'Every test in <code>androidTest</code> should use <code>FakeNewsApi</code>. What do you write?', options: ['@UninstallModules in each test class', 'One module with @TestInstallIn(replaces = [NetworkModule::class])', 'A @BindValue field in each class'], a: 1, why: 'One test module replaces the binding everywhere, with no extra components per class.' },
      { q: 'Why prefer @TestInstallIn over @UninstallModules?', options: ['Hilt generates new components for each class that uses @UninstallModules, which slows builds', '@UninstallModules is deprecated', '@TestInstallIn tests run faster on the device'], a: 0, why: 'The Hilt docs warn about the build time cost and recommend @TestInstallIn whenever possible.' },
      { q: 'What does <code>hiltRule.inject()</code> do?', options: ['Launches the Activity', 'Replaces the production modules', 'Fills the @Inject fields of the test class'], a: 2, why: 'Module replacement happens at compile time. inject() populates the test’s own fields.' },
      { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">@get:Rule(order = 0) val compose = createAndroidComposeRule&lt;MainActivity&gt;()\n@get:Rule(order = 1) val hilt = HiltAndroidRule(this)</pre>What is wrong?', options: ['Nothing', 'The Activity launches before Hilt is set up; the Hilt rule needs order = 0', 'Rules cannot have an order'], a: 1, why: 'The Compose rule starts the Activity, which asks Hilt for its dependencies. HiltAndroidRule must run before every other rule.' },
      { q: 'An instrumented @HiltAndroidTest crashes because the app runs your @HiltAndroidApp class. What fixes it?', options: ['A custom test runner that creates HiltTestApplication, set as testInstrumentationRunner', 'Add @AndroidEntryPoint to the test', 'Call hiltRule.inject() earlier'], a: 0, why: 'Hilt tests must run in HiltTestApplication. For instrumented tests a small runner creates it; for Robolectric you set it with @Config.' },
    ],
    visual(el) {
          Lab.ui.graph(el, {
            height: 310,
            nodes: [
              { id: 'test', label: 'NewsScreenTest<small>@HiltAndroidTest</small>', x: 25, y: 10, hidden: true, tone: 'warm' },
              { id: 'app', label: 'HiltTestApplication', x: 72, y: 10, hidden: true, tone: 'warm' },
              { id: 'act', label: 'MainActivity', x: 25, y: 50 },
              { id: 'comp', label: 'SingletonComponent', x: 72, y: 50, tone: 'muted' },
              { id: 'net', label: 'NetworkModule<small>real NewsApi</small>', x: 25, y: 90 },
              { id: 'fake', label: 'FakeNetworkModule<small>FakeNewsApi</small>', x: 72, y: 90, hidden: true, tone: 'ok' },
            ],
            predict: {
              q: 'The test has <code>@Inject lateinit var api: FakeNewsApi</code>, and the Activity gets a <code>NewsApi</code>. Are they the same object?',
              options: ['Yes: both come from the test’s SingletonComponent, and the binding is <code>@Singleton</code>', 'No: the test always gets its own copy', 'Only if the test builds the Activity by hand'],
              a: 0,
              why: 'Hilt builds one graph for the test. A <code>@Singleton</code> binding hands the same instance to the Activity and to <code>hiltRule.inject()</code>, so the test can set it up and read it back.',
            },
            frames: [
              { add: [['act', 'comp', 'NewsApi'], ['comp', 'net', 'installs']], say: 'In the app, <code>MainActivity</code> gets its <code>NewsApi</code> from <code>SingletonComponent</code>, which installs <code>NetworkModule</code>: the real server.' },
              { show: ['test'], add: [['test', 'act', 'launches']], say: 'A UI test launches <code>MainActivity</code>. Left like this, it would call the real server.' },
              { show: ['app'], add: [['app', 'comp', 'builds', 'warm']], say: '<code>@HiltAndroidTest</code> and <code>HiltAndroidRule</code>: the test runs in <code>HiltTestApplication</code>, and Hilt generates components just for tests.' },
              { show: ['fake'], gone: ['net'], remove: [['comp', 'net']], add: [['comp', 'fake', 'installs instead', 'ok']], say: '<code>@TestInstallIn(replaces = [NetworkModule::class])</code> swaps the module for every test in <code>androidTest</code>.' },
              { hl: ['test', 'comp'], add: [['comp', 'test', 'inject()', 'accent']], say: '<code>hiltRule.inject()</code> fills the test’s <code>@Inject</code> fields from the same graph: the same <code>FakeNewsApi</code> the Activity uses.' },
              { hl: ['act', 'fake'], add: [['act', 'comp', 'fake', 'ok']], say: 'The screen shows “Kotlin 2.3 released” from the fake, and the test checks <code>api.calls == 1</code>. No network involved.' },
            ],
          });
        },
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
    @Test fun formatsDollars() {
        assertEquals("$12.50", PriceFormatter(Locale.US).format(1250))
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
          { q: 'A DAO query returns the wrong rows in production. What is the lowest layer that can catch this bug?', options: ['A local unit test with a fake repository', 'An integration test with an in-memory Room database', 'A UI test that taps through the screen'], a: 1, why: 'The bug lives in the SQL, so the test needs a real SQLite engine. A fake would skip the query entirely, and a UI test would be slower than needed.' },
        ],
        deeper: pyramidDepth.deeper,
        underHood: pyramidDepth.underHood,
        mistakes: pyramidDepth.mistakes,
        predict: {
          q: 'You run all 226 tests: 200 unit, 20 instrumented and 6 UI tests. Which group takes most of the time?',
          options: ['The 200 unit tests, because there are the most of them', 'The 6 UI tests', 'All three take about the same'],
          a: 1,
          why: 'A unit test takes milliseconds on the JVM. A UI test drives a real screen on a device and takes seconds, plus the build and install before it.',
        },
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

      robolectricLesson,

      // 2 ─────────────────────────────────────────────
      {
        id: 'fakes',
        title: 'Unit tests with fakes',
        tagline: 'Swap the network for a small in-memory class.',
        level: 'beginner',
        body: `
<p>A ViewModel usually depends on a repository that talks to the network or a database. Use the real one in a unit test and the test gets slow, needs a connection, and fails whenever the server data changes.</p>
<p>The fix is a <em>fake</em>: a small, working implementation of the same interface that keeps data in memory. The ViewModel takes the interface in its constructor, so the test can hand it the fake. A fake behaves like the real thing, which makes it easier to read and less brittle than a mock that scripts every call.</p>
<p>Write each test in three parts. <b>Given</b> sets up the fake. <b>When</b> does one thing. <b>Then</b> checks the result. Step through below: first the real repository, then the fake.</p>`,
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
          { q: 'A FakeNewsRepository is declared as an <code>object</code> and shared by all tests. A test passes alone but fails in the full suite. Why?', options: ['Fakes cannot be objects', 'An object keeps its state for the whole test JVM, so another test left articles behind', 'The test needs Robolectric'], a: 1, why: 'Shared state makes results depend on run order. Create a new fake instance in each test.' },
        ],
        deeper: fakesDepth.deeper,
        underHood: fakesDepth.underHood,
        mistakes: fakesDepth.mistakes,
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'test', label: 'NewsViewModelTest', x: 72, y: 50, hidden: true, tone: 'warm' },
              { id: 'vm', label: 'NewsViewModel', x: 25, y: 10 },
              { id: 'repo', label: 'NewsRepository<small>interface</small>', x: 25, y: 50, tone: 'muted' },
              { id: 'real', label: 'Real repository<small>network</small>', x: 25, y: 90 },
              { id: 'fake', label: 'FakeNewsRepository<small>a list in memory</small>', x: 70, y: 90, hidden: true, tone: 'ok' },
            ],
            predict: {
              q: 'The test uses <code>FakeNewsRepository</code>. You run it 100 times in a row. What changes between runs?',
              options: ['Nothing: same input, same result, a few milliseconds each', 'The timing, and now and then the result', 'It fails from the second run on'],
              a: 0,
              why: 'Each test builds a new fake that holds its data in memory. No network, no shared server data, so every run is the same.',
            },
            frames: [
              { add: [['vm', 'repo', 'latest()'], ['repo', 'real', 'implements']], say: 'In the app, <code>NewsViewModel</code> only knows the <code>NewsRepository</code> interface. The real implementation calls the server.' },
              { show: ['test'], hl: ['real'], add: [['test', 'vm', 'passes real'], ['repo', 'real', 'slow, flaky', 'err']], say: 'A test with the real one waits for the network, and fails when the server is down or its data changes.' },
              { show: ['fake'], gone: ['real'], remove: [['repo', 'real']], add: [['repo', 'fake', '', 'ok'], ['test', 'vm', 'passes fake', 'ok']], say: 'Pass a fake instead. It has the same interface, so the ViewModel can’t tell the difference.' },
              { hl: ['test', 'fake'], add: [['test', 'fake', 'articles = …', 'accent']], say: '<b>Given</b>: the test puts one article into the fake.' },
              { hl: ['vm', 'fake'], add: [['vm', 'repo', 'latest()', 'ok']], say: '<b>When</b>: <code>vm.load()</code> calls <code>latest()</code>. The fake returns its list from memory at once.' },
              { hl: ['test', 'vm'], say: '<b>Then</b>: <code>assertEquals(UiState.Success(repo.articles), vm.state.value)</code>. The test checks the result, not how the ViewModel got it.' },
              { hl: ['fake'], add: [['test', 'fake', 'error = …', 'err']], say: 'The offline test sets <code>error</code> instead. The fake throws, and the ViewModel must show <code>UiState.Error("offline")</code>. No need to pull a cable.' },
            ],
          });
        },
      },

      mockkLesson,

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
          { q: 'A search runs 300 ms after the last keystroke. In the test you type, then call <code>advanceTimeBy(300)</code>. Has the search run?', options: ['Yes', 'No, a task due exactly at the new time has not run yet; call runCurrent()', 'Only with UnconfinedTestDispatcher'], a: 1, why: 'advanceTimeBy runs tasks scheduled before the new time. runCurrent() then runs what is due right now.' },
          { q: 'Inside runTest you write <code>launch { vm.state.collect { states += it } }</code>. What happens when the test body ends?', options: ['The test passes', 'runTest waits for the collector, which never finishes, and fails on its timeout', 'The collector is cancelled automatically'], a: 1, why: 'runTest waits for every coroutine in its scope, and a StateFlow collector never completes. Launch it in backgroundScope, which runTest cancels at the end.' },
        ],
        deeper: coroutinesDepth.deeper,
        underHood: coroutinesDepth.underHood,
        mistakes: coroutinesDepth.mistakes,
        predict: {
          q: 'Main is an <code>UnconfinedTestDispatcher</code>. You call <code>vm.sync()</code>, which launches a coroutine. When does that coroutine start?',
          options: ['Right away, inside <code>sync()</code>, up to its first suspension', 'Only after <code>advanceUntilIdle()</code>', 'After a real delay'],
          a: 0,
          why: 'Unconfined starts a launched coroutine eagerly. A <code>StandardTestDispatcher</code> queues it until you advance the scheduler.',
        },
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
          { q: 'The ViewModel builds state with <code>stateIn(viewModelScope, WhileSubscribed(5_000), Loading)</code>. The test calls vm.load() and reads <code>vm.state.value</code> with no collector. What does it see?', options: ['Success', 'Loading, forever', 'It throws'], a: 1, why: 'WhileSubscribed only runs the upstream while someone collects. Start an empty collector in backgroundScope first.' },
          { q: 'The ViewModel sets Loading, then Success, with no suspension in between. The test collector runs on StandardTestDispatcher. What does it record?', options: ['Loading, then Success', 'Only Success', 'Only Loading'], a: 1, why: 'StateFlow conflates. A queued collector runs later and reads only the newest value. Assert on the final state, not on every step.' },
        ],
        deeper: flowsDepth.deeper,
        underHood: flowsDepth.underHood,
        mistakes: flowsDepth.mistakes,
        predict: {
          q: 'The repository emits a list equal to the current state. How many new items reach Turbine’s queue?',
          options: ['One, like every emission', 'None: a StateFlow skips a value equal to its current one', 'Two: the old and the new value'],
          a: 1,
          why: '<code>StateFlow</code> compares with <code>equals</code> and only emits real changes, so the collector never sees the repeat.',
        },
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
          { q: 'The ViewModel loads on a real Dispatchers.IO thread. <code>onNodeWithText("Kotlin").assertIsDisplayed()</code> fails sometimes. Why?', options: ['The rule only waits for Compose and idling resources, not your IO thread', 'Text finders are flaky', 'The semantics tree is not merged'], a: 0, why: 'The assertion can run before the data arrives. Use a fake repository that answers at once, or waitUntil the node exists.' },
          { q: 'You want to check a card halfway through its expand animation. What do you do?', options: ['Thread.sleep(150) after the click', 'Set rule.mainClock.autoAdvance = false, click, then advanceTimeBy(150)', 'Call waitForIdle() after the click'], a: 1, why: 'With autoAdvance on, the rule waits until animations end. Stopping the test clock lets you move time yourself and assert in the middle.' },
        ],
        deeper: composeUiDepth.deeper,
        underHood: composeUiDepth.underHood,
        mistakes: composeUiDepth.mistakes,
        predict: {
          q: 'No node on the screen shows the text “Archive”. What does <code>onNodeWithText("Archive").assertIsDisplayed()</code> do?',
          options: ['Passes: there is nothing to check', 'Fails: a finder must match exactly one node, and it found none', 'Waits until a node with that text appears'],
          a: 1,
          why: 'An <code>onNodeWith…</code> finder expects exactly one match. Zero or two matches fail with an AssertionError that prints the matcher.',
        },
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

      screenshotsLesson, hiltTestingLesson,

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
          { q: 'The app is installed outside Play, so the profile is not applied at install. What still gets the Baseline Profile onto the device?', options: ['Cloud Profiles', 'androidx.profileinstaller, which writes it on the first run', 'Nothing, the profile is lost'], a: 1, why: 'profileinstaller covers installs that skip install-time compilation, and Macrobenchmark uses it too. Keep it in the app.' },
          { q: 'Why not use CompilationMode.Full() as the “with profile” side of a startup benchmark?', options: ['Full() is slower than None()', 'Full() compiles the whole app, which no user’s device does, so it hides how good your profile is', 'Full() needs a debuggable build'], a: 1, why: 'Partial() installs your Baseline Profile like a real install would, so comparing it with None() shows what the profile gains.' },
        ],
        deeper: baselineDepth.deeper,
        underHood: baselineDepth.underHood,
        mistakes: baselineDepth.mistakes,
        predict: {
          q: 'The app ships a Baseline Profile and is installed from Play. How do the startup methods run on the first launch?',
          options: ['Interpreted, then JIT compiled as they get hot', 'As machine code from the start: they were compiled ahead of time at install', 'They are compiled during the first frame'],
          a: 1,
          why: 'The profile lists the startup methods, so the system compiles them at install. Without it they start in the interpreter.',
        },
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
