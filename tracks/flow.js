/* Coroutines and Flow track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed flw-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  // Runs fn every animation frame until node leaves the page (navigation or Reset).
  const loop = (node, fn) => {
    let last = performance.now();
    const step = now => {
      if (!node.isConnected) return;
      fn(now, Math.min(100, now - last)); last = now;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Move a node to a new parent and animate it from where it was.
  const moveTo = (node, parent) => {
    const a = node.getBoundingClientRect();
    parent.append(node);
    const b = node.getBoundingClientRect();
    if (node.animate) node.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], { duration: reduced() ? 1 : 480, easing: 'cubic-bezier(0.3, 1.25, 0.5, 1)' });
  };

  const css = `
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

.flw-prod { display: grid; gap: 8px; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--accent); background: var(--surface); }
.flw-prod-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; font: 700 0.85rem var(--mono); }
.flw-badge { font: 600 0.75rem var(--mono); padding: 2px 9px; border-radius: 99px; background: var(--accent-soft); color: var(--accent); white-space: nowrap; }
.flw-run { font: 500 0.82rem var(--mono); padding: 4px 9px; border-radius: 7px; background: var(--sunk); }
.flw-idle { font-size: 0.9rem; color: var(--muted); }
.flw-cols { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-col { display: grid; grid-template-columns: 90px minmax(0, 1fr) 96px; gap: 10px; align-items: center; }
.flw-strip { display: flex; gap: 6px; align-items: center; min-height: 40px; padding: 4px 8px; border-radius: 9px; background: var(--sunk); overflow: hidden; min-width: 0; }
.flw-v { display: inline-grid; place-items: center; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); font: 600 0.8rem var(--mono); color: var(--ink); flex: none; white-space: nowrap; }
.flw-v.ok { border-color: var(--ok); color: var(--ok); }
.flw-v.acc { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.flw-v.gone { opacity: 0.5; border-style: dashed; text-decoration: line-through; }
.flw-stat { font: 600 0.74rem var(--mono); color: var(--muted); }
.flw-stat.on { color: var(--accent); }
.flw-stat.fin { color: var(--ok); }

.flw-marbles { display: grid; gap: 6px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-mrow { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 10px; align-items: center; }
.flw-mtrack { position: relative; height: 36px; margin-inline: 14px; }
.flw-mtrack::before { content: ""; position: absolute; left: -14px; right: -14px; top: 50%; border-top: 2px solid var(--line); }
.flw-op { font: 500 0.8rem var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 9px; padding: 7px 12px; overflow-x: auto; white-space: nowrap; }
.flw-m { position: absolute; top: 50%; z-index: 1; transform: translate(-50%, -50%); min-width: 26px; height: 26px; padding: 0 6px; border-radius: 99px; display: grid; place-items: center; font: 700 0.74rem var(--mono); border: 2px solid; transition: opacity 0.3s, transform 0.3s cubic-bezier(0.2, 1.4, 0.4, 1); white-space: nowrap; }
.flw-m.hide { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
.flw-m.gone { opacity: 0.3; border-style: dashed; }
.flw-m.c0 { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.flw-m.c1 { background: var(--warm-soft); border-color: var(--warm); color: var(--warm); }
.flw-m.c2 { background: var(--ok-soft); border-color: var(--ok); color: var(--ok); }
.flw-m.c3 { background: var(--err-soft); border-color: var(--err); color: var(--err); }
.flw-m.c4 { background: var(--surface); border-color: var(--ink); color: var(--ink); }
.flw-end { position: absolute; top: 7px; bottom: 7px; width: 3px; border-radius: 2px; background: var(--ink); transform: translateX(-50%); transition: opacity 0.3s; }
.flw-win { position: absolute; top: 50%; height: 10px; margin-top: -5px; border-radius: 5px; background: var(--warm-soft); border: 1px solid var(--warm); transition: opacity 0.3s; }
.flw-end.hide, .flw-win.hide { opacity: 0; }
.flw-search { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); }
.flw-srow { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 10px; align-items: center; }
.flw-timer { height: 6px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.flw-timer i { display: block; height: 100%; width: 0; background: var(--warm); }

.flw-duo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.flw-panel { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.flw-ph { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; min-height: 34px; }
.flw-val { font: 700 0.95rem var(--mono); padding: 3px 10px; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font-variant-numeric: tabular-nums; }
.flw-subrow { display: grid; gap: 5px; padding: 8px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.flw-subhead { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font: 700 0.76rem var(--mono); }
.flw-note { color: var(--muted); font: 500 0.72rem var(--mono); }
.flw-note.warn { color: var(--warm); }
.flw-subrow .flw-strip { min-height: 38px; padding: 3px 6px; }

.flw-life { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: center; }
.flw-life > div { display: grid; gap: 10px; min-width: 0; }
.flw-phone { width: 150px; height: 230px; border-radius: 24px; border: 7px solid var(--code-bg); background: var(--surface); padding: 12px 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; overflow: hidden; justify-self: center; text-align: center; }
.flw-phone.flw-rot { animation: flw-rot 0.5s ease-in-out; }
.flw-screen { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; }
.flw-gps { font: 600 0.7rem var(--mono); padding: 2px 8px; border-radius: 99px; background: var(--ok-soft); color: var(--ok); }
.flw-gps.off { background: var(--sunk); color: var(--muted); }
.flw-gps.bad { background: var(--err-soft); color: var(--err); }
.flw-coord { font: 700 0.86rem/1.4 var(--mono); }
.flw-home { display: grid; grid-template-columns: repeat(3, 26px); gap: 10px; }
.flw-home i { width: 26px; height: 26px; border-radius: 8px; background: var(--sunk); }
.flw-life .lane { grid-template-columns: 96px minmax(0, 1fr); }
@keyframes flw-rot { 50% { transform: rotate(90deg) scale(0.75); } }

@media (max-width: 620px) {
  .flw-duo, .flw-life { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .flw-node { max-width: 96px; padding: 6px; }
  .flw-src { white-space: normal; font-size: 0.68rem; }
  .flw-st { font-size: 0.66rem; }
  .flw-prog { min-width: 0; }
  .flw-col { grid-template-columns: 64px minmax(0, 1fr); }
  .flw-col .flw-stat { grid-column: 2; }
  .flw-mrow, .flw-srow { grid-template-columns: 56px minmax(0, 1fr); gap: 6px; }
  .flw-mtrack { margin-inline: 12px; }
  .flw-m { min-width: 22px; height: 22px; padding: 0 4px; font-size: 0.66rem; }
  .flw-life .lane { grid-template-columns: 78px minmax(0, 1fr); }
}`;

  Lab.addTrack({
    id: 'flow',
    title: 'Coroutines and Flow',
    description: 'How coroutines are organized, cancelled and moved between threads, and how Flow streams values to your UI.',
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'structured',
        title: 'Structured concurrency',
        tagline: 'Coroutines live in a tree. Cancel the top and everything below stops.',
        body: `
<p>Every coroutine starts inside a scope, and every coroutine it launches becomes its child. Together they form a tree. A parent finishes only after all of its children finish.</p>
<p>The tree is what makes cleanup automatic. Cancel a parent and every child below it is cancelled. When a child fails, it cancels its parent, and the parent cancels the other children. <code>viewModelScope</code> is cancelled in <code>onCleared()</code>, so nothing started there outlives the screen. It uses a <code>SupervisorJob</code>, so one failed <code>launch</code> does not cancel its other children.</p>
<p>Cancellation is cooperative. It takes effect at the next suspension point, like <code>delay()</code> or <code>await()</code>. A long CPU loop with no suspend calls should call <code>ensureActive()</code> now and then so it notices.</p>`,
        code: `class FeedViewModel(private val repo: FeedRepository) : ViewModel() {
    private var feedJob: Job? = null

    init {
        viewModelScope.launch { tick() }        // a separate child of the scope
        refresh()
    }

    fun refresh() {
        feedJob?.cancel()                       // also cancels news and weather
        feedJob = viewModelScope.launch {
            try {
                val feed = coroutineScope {
                    val news = async { repo.news() }
                    val weather = async { repo.weather() }
                    Feed(news.await(), weather.await())
                }   // weather throws? news is cancelled, then the error lands here
                _state.value = UiState.Success(feed)
            } catch (e: IOException) {
                _state.value = UiState.Error("No connection")
            }
        }
    }
}
// When the screen goes away, onCleared() cancels viewModelScope and every coroutine in it.`,
        remember: 'Cancel a parent and its children stop. A failing child cancels its siblings. When the scope ends, the work ends.',
        level: 'advanced',
        terms: [
          { term: 'Structured concurrency', def: 'The rule that every coroutine runs inside a scope as a child, so cancelling or failing a parent reaches all its children.' },
          { term: 'coroutineScope', def: 'A suspend function that creates a child scope and returns only after every coroutine started in it finishes.' },
          { term: 'SupervisorJob', def: 'A Job whose failed child does not cancel its parent or its other children.' },
          { term: 'ensureActive', def: 'Throws CancellationException if the current coroutine was cancelled, so CPU-only loops can stop promptly.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Load news and weather in parallel and wait for both.', code: 'suspend fun loadFeed(): Feed = [[coroutineScope]] {\n    val news = [[async]] { repo.news() }\n    val weather = async { repo.weather() }\n    Feed(news.[[await]](), weather.await())\n}', why: '<code>coroutineScope</code> waits for both children. If one fails, the other is cancelled.' },
          { type: 'bug', prompt: 'This refresh keeps running after the user leaves the screen. Tap the bug.', code: 'class FeedViewModel(private val repo: FeedRepository) : ViewModel() {\n    fun refresh() {\n        GlobalScope.launch {\n            _state.value = UiState.Success(repo.feed())\n        }\n    }\n}', bug: 2, fix: '        viewModelScope.launch {', why: '<code>GlobalScope</code> belongs to no parent, so nothing cancels it. <code>viewModelScope</code> is cancelled in <code>onCleared()</code>.' },
        ],
        quiz: [
          { q: 'Inside <code>coroutineScope { }</code>, <code>async { weather() }</code> throws while <code>async { news() }</code> is still running. What happens to news?', options: ['It keeps running and its result is kept', 'It is cancelled', 'It is restarted'], a: 1, why: 'A failing child cancels its parent scope, and the scope cancels its other children before rethrowing the error.' },
          { q: 'The user leaves the screen and <code>onCleared()</code> runs. What happens to coroutines started in <code>viewModelScope</code>?', options: ['They finish in the background', 'They are cancelled', 'They move to GlobalScope'], a: 1, why: '<code>viewModelScope</code> is cancelled in <code>onCleared()</code>, and that cancels every coroutine in it.' },
          { q: 'You cancel a coroutine that is in a tight CPU loop with no suspend calls. What happens?', options: ['It stops at once', 'It keeps running until it checks, for example with <code>ensureActive()</code>', 'The app crashes'], a: 1, why: 'Cancellation is cooperative. Suspend calls check for it; plain loops must check <code>isActive</code> or call <code>ensureActive()</code>.' },
        ],
        visual(el) {
          const N = {};
          const DUR = { news: 7000, weather: 11000 };
          let tickT = 3000, busy = false;
          const node = (id, src, kids) => {
            const bar = h('i'), st = h('span', { class: 'flw-st' });
            const box = h('div', { class: 'flw-node' }, h('span', { class: 'flw-src', html: hl(src) }), st, h('span', { class: 'flw-prog' }, bar));
            N[id] = { box, st, bar, p: 0, state: 'run' };
            return h('div', { class: 'flw-sub' }, box, kids && h('div', { class: 'flw-kids' }, kids));
          };
          const tree = h('div', { class: 'flw-tree' },
            node('scope', 'viewModelScope', [
              node('feed', 'launch { loadFeed() }', [node('news', 'async { news() }'), node('weather', 'async { weather() }')]),
              node('tick', 'launch { tick() }'),
            ]));
          const o = out('Both async children are working. Cancel, fail or clear and watch the tree.');
          const set = (id, state, text) => {
            const n = N[id]; n.state = state; n.st.textContent = text;
            n.box.className = `flw-node ${state}${id === 'scope' ? ' root' : ''}`;
          };
          const alive = () => tree.isConnected;
          function launchFeed(p1 = 0, p2 = 0) {
            N.news.p = p1; N.weather.p = p2;
            set('feed', 'run', 'awaiting both'); set('news', 'run', 'running'); set('weather', 'run', 'running');
            ['feed', 'news', 'weather'].forEach(id => replay(N[id].box, 'drop-in'));
          }
          async function cancelKids(ids, text) {
            for (const id of ids) {
              if (N[id].state !== 'run') continue;
              await sleep(340); if (!alive()) return false;
              set(id, 'cancel', text); replay(N[id].box, 'shake');
            }
            return true;
          }
          async function cancelFeed() {
            N.feed.st.textContent = 'cancelling';
            if (!(await cancelKids(['news', 'weather'], 'cancelled'))) return false;
            await sleep(340); if (!alive()) return false;
            set('feed', 'cancel', 'cancelled'); replay(N.feed.box, 'shake');
            return true;
          }
          const act = fn => async () => { if (busy) return; busy = true; try { await fn(); } finally { busy = false; } };
          const deadScope = () => {
            if (N.scope.state !== 'cancel') return false;
            replay(N.scope.box, 'shake');
            say(o, '<span class="bad">no-op:</span> viewModelScope is cancelled. Anything launched in it now is cancelled at once. Press Reset.');
            return true;
          };

          set('scope', 'run', 'active');
          set('tick', 'run', '');
          launchFeed(0.35, 0.2);
          loop(tree, (now, dt) => {
            for (const id of ['news', 'weather']) {
              const n = N[id];
              if (n.state !== 'run') continue;
              n.p = Math.min(1, n.p + dt / DUR[id]);
              n.bar.style.width = n.p * 100 + '%';
              if (n.p >= 1) { set(id, 'done', 'returned'); replay(n.box, 'pop'); }
            }
            if (N.feed.state === 'run') {
              N.feed.bar.style.width = ((N.news.p + N.weather.p) / 2) * 100 + '%';
              if (N.news.state === 'done' && N.weather.state === 'done') {
                set('feed', 'done', 'Success'); replay(N.feed.box, 'pop');
                say(o, '<span class="good">done:</span> both children returned, so loadFeed could finish. A parent always waits for its children.');
              }
            }
            if (N.tick.state === 'run') {
              tickT += dt;
              N.tick.st.textContent = `tick ${Math.floor(tickT / 1000)}`;
              N.tick.bar.style.width = (tickT % 1000) / 10 + '%';
            }
          });

          el.append(tree,
            h('div', { class: 'controls' },
              cmd('feedJob.cancel()', act(async () => {
                if (deadScope()) return;
                if (N.feed.state !== 'run') { replay(N.feed.box, 'shake'); say(o, '<span class="muted">no-op:</span> feedJob already finished, so cancel() does nothing. Try refresh().'); return; }
                if (await cancelFeed()) say(o, '<span class="good">ok:</span> cancelling feedJob cancelled news and weather too. tick is not its child, so it kept going.');
              })),
              cmd('weather() throws IOException', act(async () => {
                if (deadScope()) return;
                if (N.weather.state !== 'run') { replay(N.weather.box, 'shake'); say(o, '<span class="muted">no-op:</span> weather is not running. Press refresh() first.'); return; }
                set('weather', 'fail', 'IOException'); replay(N.weather.box, 'shake');
                say(o, '<span class="bad">fail:</span> weather threw. Its parent scope cancels the other child…');
                await sleep(500); if (!alive()) return;
                if (!(await cancelKids(['news'], 'cancelled'))) return;
                await sleep(400); if (!alive()) return;
                set('feed', 'caught', 'caught: Error UI'); replay(N.feed.box, 'pop');
                replay(N.tick.box, 'pop');
                say(o, '<span class="bad">fail:</span> coroutineScope cancelled news and rethrew. loadFeed caught the IOException and showed an error. tick lives outside that scope, so it kept going.');
              })),
              cmd('refresh()', act(async () => {
                if (deadScope()) return;
                const was = N.feed.state === 'run';
                if (was && !(await cancelFeed())) return;
                if (was) { await sleep(300); if (!alive()) return; }
                launchFeed();
                say(o, was ? '<span class="good">ok:</span> refresh() cancelled the old feedJob and its children, then launched a fresh one.' : '<span class="good">ok:</span> refresh() launched a new feedJob with two new children.');
              })),
              cmd('onCleared()', act(async () => {
                if (deadScope()) return;
                N.scope.st.textContent = 'cancelling';
                if (N.feed.state === 'run' && !(await cancelFeed())) return;
                if (N.tick.state === 'run') { await sleep(340); if (!alive()) return; set('tick', 'cancel', 'cancelled'); replay(N.tick.box, 'shake'); }
                await sleep(340); if (!alive()) return;
                set('scope', 'cancel', 'cancelled'); replay(N.scope.box, 'shake');
                say(o, '<span class="good">ok:</span> onCleared() cancelled viewModelScope, and the cancel spread down to every coroutine in the tree.');
              }))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'dispatchers',
        title: 'Dispatchers and withContext',
        tagline: 'Pick the right threads for the job, then hop back.',
        body: `
<p>A dispatcher decides which threads run a coroutine. <code>Dispatchers.Main</code> is the UI thread. <code>Dispatchers.IO</code> is a large pool for blocking calls like file, socket and database reads. <code>Dispatchers.Default</code> has one thread per CPU core, for heavy computation like parsing or sorting.</p>
<p><code>withContext(dispatcher) { … }</code> runs a block on another dispatcher. The caller suspends until the block returns, then continues on its original dispatcher with the result. It does not start a parallel task.</p>
<p>Code in <code>viewModelScope</code> starts on Main. Keep Main for touching the UI and hop away for anything slow. Suspend functions from Room and Retrofit already switch threads for you, so you can call them from Main.</p>`,
        code: `fun load() {
    viewModelScope.launch {                  // starts on Main
        _state.value = UiState.Loading
        val json = withContext(Dispatchers.IO) {
            api.fetchArticlesBlocking()      // blocking network call
        }
        val articles = withContext(Dispatchers.Default) {
            parseAndSort(json)               // CPU-heavy work
        }
        _state.value = UiState.Success(articles)   // back on Main
    }
}`,
        remember: 'Main draws, IO waits, Default computes. withContext hops there and back.',
        level: 'intermediate',
        terms: [
          { term: 'Dispatchers.Main', def: 'The dispatcher that runs coroutines on the Android main thread, where UI work must happen.' },
          { term: 'Dispatchers.IO', def: 'A large shared thread pool for blocking calls like file, database and socket reads.' },
          { term: 'Dispatchers.Default', def: 'A thread pool sized to the CPU cores, for CPU-heavy work like parsing, sorting and image decoding.' },
          { term: 'withContext', def: 'Runs a block on another dispatcher, suspends the caller until it returns, then resumes on the original dispatcher.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the file off the main thread, then decode it on the CPU pool.', code: 'viewModelScope.launch {\n    val bytes = [[withContext]](Dispatchers.[[IO]]) { file.readBytes() }\n    val thumb = withContext(Dispatchers.[[Default]]) { decodeThumbnail(bytes) }\n    _thumbnail.value = thumb\n}', why: 'IO waits on the disk. Default does the decoding. Then the code continues on Main.' },
          { type: 'bug', prompt: 'The app freezes while articles load. Tap the line that causes it.', code: 'fun load() {\n    viewModelScope.launch {\n        _state.value = UiState.Loading\n        val articles = api.fetchArticlesBlocking()\n        _state.value = UiState.Success(articles)\n    }\n}', bug: 3, fix: '        val articles = withContext(Dispatchers.IO) { api.fetchArticlesBlocking() }', why: '<code>viewModelScope</code> starts on Main. A blocking call there stops the UI from drawing.' },
        ],
        quiz: [
          { q: 'Where should you parse and sort a 5 MB JSON string?', options: ['<code>Dispatchers.Main</code>', '<code>Dispatchers.IO</code>', '<code>Dispatchers.Default</code>'], a: 2, why: 'Parsing is CPU work. Default is sized to the number of cores, which suits it.' },
          { q: 'After <code>withContext(Dispatchers.IO) { … }</code> returns inside a coroutine that started on Main, where does the next line run?', options: ['On an IO thread', 'Back on Main', 'On whichever thread is free'], a: 1, why: '<code>withContext</code> switches only for its block, then resumes the caller on its original dispatcher.' },
          { q: 'Does <code>withContext</code> run its block in parallel with the code after it?', options: ['Yes, like <code>launch</code>', 'No, the caller suspends until the block returns its result'], a: 1, why: 'It is a suspend call that returns the block’s result. For parallel work, use <code>async</code> or <code>launch</code>.' },
        ],
        visual(el) {
          const lanes = {};
          const tl = h('div', { class: 'timeline' }, [['main', 'Main (UI)'], ['io', 'IO'], ['def', 'Default']].map(([id, name]) => {
            lanes[id] = h('div', { class: 'lane-track flw-dtrack' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), lanes[id]);
          }));
          const label = h('span', {}, 'load()'), bar = h('i');
          const task = h('span', { class: 'flw-task' }, label, h('span', { class: 'flw-prog' }, bar));
          lanes.main.append(task);
          const dot = h('span', { class: 'flw-dot' }), fps = h('span', { class: 'flw-fps' }, 'smooth');
          const ui = h('div', { class: 'flw-ui' }, h('span', { class: 'flw-ui-label' }, 'UI frames'), h('span', { class: 'flw-ui-track' }, dot), fps);
          const MODES = {
            good: {
              label: 'load()',
              lines: ['viewModelScope.launch {              // starts on Main', '    showSpinner()', '    val json = withContext(Dispatchers.IO) { api.fetch() }', '    val list = withContext(Dispatchers.Default) { parse(json) }', '    render(list)                     // back on Main', '}'],
              steps: [[0, 'main', 'launch', 350], [1, 'main', 'showSpinner()', 450], [2, 'io', 'api.fetch()', 1700], [3, 'def', 'parse(json)', 1300], [4, 'main', 'render(list)', 450]],
            },
            bad: {
              label: 'loadBlocking()',
              lines: ['viewModelScope.launch {              // starts on Main', '    showSpinner()', '    val json = api.fetchBlocking()   // blocks Main', '    val list = parse(json)           // still on Main', '    render(list)', '}'],
              steps: [[0, 'main', 'launch', 350], [1, 'main', 'showSpinner()', 300], [2, 'main', 'api.fetchBlocking()', 1700, true], [3, 'main', 'parse(json)', 1300, true], [4, 'main', 'render(list)', 450]],
            },
          };
          const codeBox = h('div', { class: 'when' });
          const o = out('Run load() and watch the task change lanes while the UI dot keeps moving.');
          let mode = 'good', rows = [], busy = false, blocked = false, phase = 0, frozenMs = 0;
          const buttons = Object.keys(MODES).map(k => cmd(MODES[k].label, () => run(k)));
          function paint() {
            rows = MODES[mode].lines.map(l => h('div', { class: 'branch', html: hl(l) }));
            codeBox.replaceChildren(...rows);
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(MODES)[i] === mode));
          }
          loop(ui, (now, dt) => {
            if (blocked) { frozenMs += dt; fps.textContent = `frozen ${(frozenMs / 1000).toFixed(1)} s`; return; }
            phase += dt;
            const x = (Math.sin(phase / 450) + 1) / 2;
            dot.style.left = `calc(${x * 100}% - ${x * 12}px)`;
          });
          async function run(k) {
            if (busy) return; busy = true; mode = k; paint();
            frozenMs = 0; fps.textContent = 'smooth';
            for (const [i, lane, text, ms, block] of MODES[k].steps) {
              rows.forEach((r, j) => r.classList.toggle('scan', j === i));
              label.textContent = text;
              bar.style.transition = 'none'; bar.style.width = '0%';
              if (task.parentElement !== lanes[lane]) {
                moveTo(task, lanes[lane]);
                say(o, `<span class="muted">withContext:</span> hopping to ${lane === 'main' ? 'Main' : lane === 'io' ? 'Dispatchers.IO' : 'Dispatchers.Default'}`);
                await sleep(480); if (!task.isConnected) return;
              }
              label.textContent = text;
              bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth;
              bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%';
              blocked = !!block; ui.classList.toggle('frozen', blocked);
              if (blocked) say(o, `<span class="bad">blocking Main:</span> ${hl(text)} holds the UI thread, so no frames are drawn.`);
              await sleep(ms); if (!task.isConnected) return;
            }
            blocked = false; ui.classList.remove('frozen');
            rows.forEach(r => r.classList.remove('scan'));
            label.textContent = 'done: 20 articles';
            replay(task, 'pop');
            if (k === 'bad') {
              fps.textContent = `froze ${(frozenMs / 1000).toFixed(1)} s`;
              say(o, `<span class="bad">jank:</span> Main was blocked for ${(frozenMs / 1000).toFixed(1)} s, about ${Math.round(frozenMs / 16.7)} dropped frames. Block it for 5 s and Android shows "App not responding".`);
            } else {
              fps.textContent = 'smooth the whole time';
              say(o, '<span class="good">ok:</span> the slow parts ran on IO and Default. Main only did the quick UI steps, so the dot never stopped.');
            }
            busy = false;
          }
          paint();
          el.append(h('div', { class: 'controls' }, buttons), codeBox, ui, tl, o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'cold',
        title: 'Flow basics: cold streams',
        tagline: 'A Flow does nothing until someone collects it.',
        body: `
<p>A <code>Flow</code> is a stream of values that arrive over time. Building one with <code>flow { … }</code> runs nothing. The block is a recipe that waits for someone to call <code>collect</code>.</p>
<p>Each <code>collect</code> runs the block again from the top, just for that collector. Two collectors on a flow that makes a network request make two requests. That is what <em>cold</em> means.</p>
<p><code>collect</code> is a suspend function. It returns when the flow completes. If the collecting coroutine is cancelled, the producer stops with it.</p>`,
        code: `val ticks: Flow<Int> = flow {
    println("Flow started")
    for (i in 1..4) {
        delay(800)
        emit(i)          // suspends until the collector has handled i
    }
}
// Nothing has printed yet. A Flow is only a recipe.

launch { ticks.collect { println("A got $it") } }
delay(1200)
launch { ticks.collect { println("B got $it") } }
// "Flow started" prints twice. A and B each get their own 1, 2, 3, 4.`,
        remember: 'A cold Flow is a recipe. Each collect runs it again from the start.',
        level: 'beginner',
        terms: [
          { term: 'Flow', def: 'An asynchronous stream of values that are emitted one at a time over time and handled by a collector.' },
          { term: 'Cold flow', def: 'A flow whose code runs from the start for each collector and does nothing while no one collects.' },
          { term: 'emit', def: 'Sends a value from a flow builder to the collector and suspends until the collector has handled it.' },
          { term: 'collect', def: 'A suspend terminal operator that starts a flow and handles each value, returning when the flow completes.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a flow that counts down once per second.', code: 'fun countdown(from: Int): Flow<Int> = [[flow]] {\n    for (i in from downTo 0) {\n        [[emit]](i)\n        delay(1000)\n    }\n}', why: '<code>flow { }</code> builds a cold flow. <code>emit</code> sends each value to the collector.' },
          { type: 'bug', prompt: 'Tapping Sync never syncs anything. Tap the line that causes it.', code: 'class SyncViewModel(private val repo: SyncRepository) : ViewModel() {\n    fun sync() {\n        viewModelScope.launch {\n            repo.syncAll()        // returns Flow<Progress>\n        }\n    }\n}', bug: 3, fix: '            repo.syncAll().collect { _progress.value = it }', why: 'Calling a function that returns a Flow only builds the recipe. Nothing runs until you <code>collect</code> it.' },
        ],
        quiz: [
          { q: '<code>val f = flow { println("hi"); emit(1) }</code> and nothing else. What prints?', options: ['<code>hi</code>', 'Nothing', '<code>1</code>'], a: 1, why: 'The block only runs when something collects the flow.' },
          { q: 'A cold flow makes one network request when it runs. Two screens collect it. How many requests?', options: ['One, shared', 'Two'], a: 1, why: 'Each <code>collect</code> runs the whole block again for that collector.' },
          { q: 'When does <code>ticks.collect { … }</code> return?', options: ['Right away', 'After the first value', 'When the flow completes'], a: 2, why: '<code>collect</code> suspends until the flow finishes emitting, or until it is cancelled.' },
        ],
        visual(el) {
          let runs = 1;
          const running = {};
          const runsBadge = h('span', { class: 'flw-badge' }, 'block has run 1 time');
          const idle = h('p', { class: 'flw-idle' }, 'Idle. The block runs only while someone collects.');
          const runRows = h('div', { style: 'display:grid;gap:6px' });
          const prod = h('div', { class: 'flw-prod' },
            h('div', { class: 'flw-prod-head' }, h('span', { html: hl('flow { for (i in 1..4) { delay(800); emit(i) } }') }), runsBadge),
            idle, runRows);
          const cols = {};
          const col = name => {
            const strip = h('div', { class: 'flw-strip' }), stat = h('span', { class: 'flw-stat' }, 'not collecting');
            cols[name] = { strip, stat };
            return h('div', { class: 'flw-col' }, h('span', { class: 'lane-name', html: hl(`collector ${name}`) }), strip, stat);
          };
          const colBox = h('div', { class: 'flw-cols' }, col('A'), col('B'));
          const o = out('A collected once already. Start A again, then start B while A is halfway.');
          [1, 2, 3, 4].forEach(i => cols.A.strip.append(h('span', { class: 'flw-v' }, String(i))));
          cols.A.stat.textContent = 'completed'; cols.A.stat.className = 'flw-stat fin';
          const syncIdle = () => { idle.hidden = runRows.children.length > 0; };
          syncIdle();
          async function collect(name) {
            const c = cols[name];
            if (running[name]) { replay(c.strip, 'shake'); say(o, `<span class="muted">busy:</span> collector ${name} is still collecting. collect returns when the flow completes.`); return; }
            running[name] = true; runs++;
            runsBadge.textContent = `block has run ${runs} times`; replay(runsBadge, 'pop');
            c.strip.replaceChildren(); c.stat.textContent = 'collecting'; c.stat.className = 'flw-stat on';
            const st = h('b', {}, 'Flow started');
            const row = h('div', { class: 'flw-run drop-in' }, `run ${runs} for ${name}: `, st);
            runRows.append(row); syncIdle();
            say(o, `${hl(`launch { ticks.collect { ${name} } }`)} <span class="muted">// the block starts from the top for ${name}</span>`);
            for (let i = 1; i <= 4; i++) {
              await sleep(800); if (!prod.isConnected) return;
              st.textContent = `emit(${i})`; replay(row, 'pop-soft');
              c.strip.append(h('span', { class: 'flw-v acc drop-in' }, String(i)));
            }
            await sleep(300); if (!prod.isConnected) return;
            c.strip.querySelectorAll('.flw-v').forEach(v => v.classList.remove('acc'));
            c.stat.textContent = 'completed'; c.stat.className = 'flw-stat fin';
            row.classList.add('leave');
            await sleep(450); row.remove(); syncIdle();
            running[name] = false;
            say(o, `<span class="good">done:</span> ${name}'s run finished and collect returned. ${Object.values(running).some(Boolean) ? 'The other run is still going on its own.' : 'The producer is idle again.'}`);
          }
          el.append(
            h('div', { class: 'controls' },
              cmd('val ticks = flow { … }', () => { replay(prod, 'shake'); say(o, '<span class="muted">nothing happened:</span> defining a Flow runs no code. The block waits for a collector.'); }),
              cmd('launch { ticks.collect { A } }', () => collect('A')),
              cmd('launch { ticks.collect { B } }', () => collect('B'))),
            prod, colBox, o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'operators',
        title: 'Flow operators',
        tagline: 'map, filter, debounce, distinctUntilChanged, combine on a marble diagram.',
        body: `
<p>Operators take a flow and return a new flow. <code>map</code> transforms each value, <code>filter</code> drops values that fail a test, and <code>distinctUntilChanged</code> drops a value that equals the one right before it. Nothing runs until someone collects the final flow.</p>
<p>Some operators care about time. <code>debounce(300)</code> waits until values stop arriving for 300 ms, then passes on only the latest one. That is how a search box avoids one request per keystroke.</p>
<p><code>combine</code> joins flows. It emits once every input has a value, then again whenever any input changes, using the latest value from each.</p>`,
        code: `@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
val results: Flow<List<Article>> = query    // StateFlow<String> from the text field
    .debounce(300)                          // wait for a 300 ms pause in typing
    .map { it.trim() }
    .filter { it.length >= 2 }
    .distinctUntilChanged()                 // "kotlin" then "kotlin " is one search
    .mapLatest { api.search(it) }           // a new query cancels the old search

val screen: Flow<List<Article>> = combine(results, favorites) { list, favs ->
    list.map { it.copy(isFavorite = it.id in favs) }
}`,
        remember: 'map changes, filter drops, distinctUntilChanged skips repeats, debounce waits for quiet, combine joins the latest values.',
        level: 'intermediate',
        terms: [
          { term: 'debounce', def: 'A flow operator that waits for a pause of the given length and then emits only the latest value.' },
          { term: 'distinctUntilChanged', def: 'A flow operator that drops a value equal to the one emitted right before it.' },
          { term: 'combine', def: 'Joins flows and emits using the latest value of each, every time any of them emits.' },
          { term: 'mapLatest', def: 'Like map, but a new value cancels the transform still running for the previous one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Search after the user stops typing, and skip repeated queries.', code: 'val results = query\n    .[[debounce]](300)\n    .[[distinctUntilChanged]]()\n    .mapLatest { api.search(it) }', why: '<code>debounce</code> waits for a quiet moment. <code>distinctUntilChanged</code> skips a query equal to the last one.' },
          { type: 'bug', prompt: 'Starring an article does nothing until the next search. Tap the bug.', code: 'val favorites: Flow<Set<Int>> = favoritesRepo.ids()\nval results: Flow<List<Article>> = searchRepo.results()\n\nval screen = results.zip(favorites) { list, favs ->\n    list.map { it.copy(isFavorite = it.id in favs) }\n}', bug: 3, fix: 'val screen = combine(results, favorites) { list, favs ->', why: '<code>zip</code> waits for a new value from both flows to pair them. <code>combine</code> emits when either one changes.' },
        ],
        quiz: [
          { q: 'You type <code>k</code>, <code>ko</code>, <code>kot</code> with 100 ms between keys, then stop. With <code>debounce(300)</code>, how many searches run?', options: ['3', '1, for <code>kot</code>', '0'], a: 1, why: 'Each key resets the 300 ms wait. Only the value before the pause gets through.' },
          { q: '<code>flowOf(1, 1, 2, 2, 1).distinctUntilChanged().toList()</code>', options: ['<code>[1, 2]</code>', '<code>[1, 2, 1]</code>', '<code>[1, 1, 2, 2, 1]</code>'], a: 1, why: 'It only compares with the previous value, so the final 1 differs from the 2 before it and passes.' },
          { q: 'When does <code>combine(a, b) { … }</code> emit its first value?', options: ['When a emits', 'When both a and b have emitted at least once', 'When both complete'], a: 1, why: 'It needs a latest value from every input before it can call your lambda.' },
        ],
        visual(el) {
          const T = 2200, END = 2000, SLOW = 1.6;
          const col = v => (typeof v === 'number' ? v % 5 : 3 + 'AB'.indexOf(v));
          const SRC = [[100, 1], [400, 2], [700, 2], [1000, 3], [1300, 4], [1550, 4], [1800, 5]];
          const OPS = {
            map: {
              code: 'upstream.map { it * 10 }',
              note: 'map: every value went through, multiplied by 10, the moment it arrived.',
              build: () => ({ inputs: [{ name: 'upstream', items: SRC.map(([t, v]) => ({ t, v })) }], output: SRC.map(([t, v]) => ({ t, v: v * 10, c: col(v) })) }),
            },
            filter: {
              code: 'upstream.filter { it % 2 == 0 }',
              note: 'filter: odd values were dropped. Even ones passed through unchanged.',
              build: () => ({ inputs: [{ name: 'upstream', items: SRC.map(([t, v]) => ({ t, v, dropAt: v % 2 ? t : null })) }], output: SRC.filter(([, v]) => v % 2 === 0).map(([t, v]) => ({ t, v })) }),
            },
            distinct: {
              code: 'upstream.distinctUntilChanged()',
              note: 'distinctUntilChanged: the second 2 and the second 4 equal the value right before them, so they were dropped.',
              build: () => {
                const items = SRC.map(([t, v], i) => ({ t, v, dropAt: i && SRC[i - 1][1] === v ? t : null }));
                return { inputs: [{ name: 'upstream', items }], output: items.filter(m => m.dropAt == null).map(({ t, v }) => ({ t, v })) };
              },
            },
            debounce: {
              code: 'upstream.debounce(300)',
              note: 'debounce: a value followed by another within 300 ms was dropped. The last value of each burst got through 300 ms later. At completion, the pending 6 was emitted right away.',
              build: () => {
                const D = [[100, 1], [330, 2], [560, 3], [1100, 4], [1330, 5], [1750, 6]];
                const next = i => (i + 1 < D.length ? D[i + 1][0] : Infinity);
                const items = D.map(([t, v], i) => { const fire = Math.min(t + 300, END); return next(i) < fire ? { t, v, dropAt: next(i) } : { t, v, outAt: fire }; });
                return {
                  inputs: [{ name: 'upstream', items }],
                  output: items.filter(m => m.outAt).map(m => ({ t: m.outAt, v: m.v })),
                  windows: D.map(([t], i) => ({ s: t, e: Math.min(t + 300, next(i), END) })),
                };
              },
            },
            combine: {
              code: 'combine(numbers, letters) { n, l -> "$n$l" }',
              note: 'combine: nothing came out until letters had a value. After that, every change on either side paired with the latest from the other.',
              build: () => {
                const A = [[100, 1], [900, 2], [1700, 3]], B = [[500, 'A'], [1300, 'B']];
                let a = null, b = null; const output = [];
                [...A.map(x => [...x, 'a']), ...B.map(x => [...x, 'b'])].sort((x, y) => x[0] - y[0]).forEach(([t, v, side]) => {
                  if (side === 'a') a = v; else b = v;
                  if (a != null && b != null) output.push({ t, v: `${a}${b}`, c: col(a) });
                });
                return { inputs: [{ name: 'numbers', items: A.map(([t, v]) => ({ t, v })) }, { name: 'letters', items: B.map(([t, v]) => ({ t, v })) }], output };
              },
            },
          };
          const LABELS = { map: '.map { it * 10 }', filter: '.filter { it % 2 == 0 }', distinct: '.distinctUntilChanged()', debounce: '.debounce(300)', combine: 'combine(a, b)' };
          const diagram = h('div', { class: 'flw-marbles' });
          const o = out();
          let busy = false;
          const opButtons = Object.keys(OPS).map(k => cmd(LABELS[k], () => play(k)));
          const pct = t => (t / T) * 100 + '%';
          function build(key) {
            const op = OPS[key].build(), ev = [], cursors = [];
            const track = () => { const tr = h('div', { class: 'flw-mtrack' }); const c = h('span', { class: 'cursor', style: 'left:0' }); tr.append(c); cursors.push(c); return tr; };
            const reveal = (t, e) => ev.push([t, () => e.classList.remove('hide')]);
            const marble = (tr, m) => {
              const e = h('span', { class: `flw-m c${m.c != null ? m.c : col(m.v)} hide`, style: `left:${pct(m.t)}` }, String(m.v));
              tr.append(e); reveal(m.t, e);
              if (m.dropAt != null) ev.push([m.dropAt + 1, () => e.classList.add('gone')]);
            };
            const end = tr => { const e = h('span', { class: 'flw-end hide', style: `left:${pct(END)}` }); tr.append(e); reveal(END, e); };
            const rows = op.inputs.map(lane => {
              const tr = track();
              (op.windows || []).forEach(w => { const e = h('span', { class: 'flw-win hide', style: `left:${pct(w.s)};width:${((w.e - w.s) / T) * 100}%` }); tr.append(e); reveal(w.s, e); });
              lane.items.forEach(m => marble(tr, m)); end(tr);
              return h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, lane.name), tr);
            });
            rows.push(h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, 'operator'), h('div', { class: 'flw-op', html: hl(OPS[key].code) })));
            const otr = track(); op.output.forEach(m => marble(otr, m)); end(otr);
            rows.push(h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, 'collect'), otr));
            diagram.replaceChildren(...rows);
            opButtons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(OPS)[i] === key));
            ev.sort((x, y) => x[0] - y[0]);
            return { ev, cursors };
          }
          function play(key) {
            if (busy) return; busy = true;
            const { ev, cursors } = build(key);
            say(o, `<span class="muted">playing</span> ${hl(OPS[key].code)}`);
            let i = 0; const t0 = performance.now();
            const step = now => {
              if (!diagram.isConnected) return;
              const t = Math.min((now - t0) / SLOW, T);
              while (i < ev.length && ev[i][0] <= t) ev[i++][1]();
              cursors.forEach(c => { c.style.left = pct(t); });
              if (t < T) requestAnimationFrame(step);
              else { busy = false; say(o, OPS[key].note); }
            };
            requestAnimationFrame(step);
          }
          // Open on a finished map diagram.
          const first = build('map');
          first.ev.forEach(([, f]) => f()); first.cursors.forEach(c => { c.style.left = '100%'; });
          o.textContent = 'Pick an operator to play it. Time runs left to right; the bar marks completion.';

          // Search box: the same chain on real keystrokes.
          const input = h('input', { id: 'flw-search', value: 'flow', spellcheck: 'false', autocomplete: 'off' });
          const typed = h('div', { class: 'flw-strip' }), sent = h('div', { class: 'flw-strip' });
          const tbar = h('i'), timer = h('div', { class: 'flw-timer' }, tbar);
          const stats = h('span', { class: 'flw-stat' });
          const so = out('Type in the box. Each pause of 300 ms fires one search.');
          let keys = 4, searches = 1, last = 'flow', pending, typing = false;
          const add = (strip, chip) => { strip.prepend(chip); while (strip.children.length > 7) strip.lastElementChild.remove(); };
          const paintStats = () => { stats.textContent = `${keys} keystrokes, ${searches} search${searches === 1 ? '' : 'es'}`; };
          ['flow', 'flo', 'fl', 'f'].reverse().forEach(q => add(typed, h('span', { class: 'flw-v' }, q)));
          add(sent, h('span', { class: 'flw-v ok' }, 'flow'));
          paintStats();
          function onKey() {
            const q = input.value; keys++; paintStats();
            add(typed, h('span', { class: 'flw-v drop-in' }, q === '' ? '""' : JSON.stringify(q).slice(1, -1).replace(/ /g, '␣')));
            tbar.style.transition = 'none'; tbar.style.width = '100%'; void tbar.offsetWidth;
            tbar.style.transition = 'width 300ms linear'; tbar.style.width = '0%';
            clearTimeout(pending);
            pending = setTimeout(() => {
              if (!input.isConnected) return;
              const t = q.trim();
              if (t.length < 2) { add(sent, h('span', { class: 'flw-v gone drop-in' }, t || '""')); say(so, `<span class="muted">filter:</span> "${t}" is shorter than 2 characters, so no search.`); return; }
              if (t === last) { add(sent, h('span', { class: 'flw-v gone drop-in' }, t)); say(so, `<span class="muted">distinctUntilChanged:</span> "${t}" after trim is the same as the last query, so no new search.`); return; }
              last = t; searches++; paintStats();
              add(sent, h('span', { class: 'flw-v ok drop-in' }, t));
              say(so, `<span class="good">search:</span> ${hl(`api.search("${t}")`)} <span class="muted">// ${keys} keys so far, only ${searches} searches</span>`);
            }, 300);
          }
          input.addEventListener('input', onKey);
          async function autoType(chunks) {
            if (typing) return; typing = true;
            for (const [text, pause] of chunks) {
              for (const ch of text) {
                if (!input.isConnected) return;
                input.value = ch === '\b' ? input.value.slice(0, -1) : input.value + ch; onKey();
                await sleep(110);
              }
              await sleep(pause);
            }
            typing = false;
          }
          el.append(
            h('div', { class: 'controls' }, opButtons), diagram, o,
            h('div', { class: 'flw-search' },
              h('label', { class: 'field-input', for: 'flw-search' }, 'Search', input),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'typed'), typed),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, '300 ms'), timer),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'search()'), sent),
              stats),
            h('div', { class: 'controls' },
              cmd('type "ko" … "tlin"', () => { input.value = ''; autoType([['ko', 650], ['tlin', 400]]); }),
              cmd('add a space', () => autoType([[' ', 400]]))),
            so);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'hot',
        title: 'StateFlow and SharedFlow',
        tagline: 'Hot streams: one holds state, the other broadcasts events.',
        body: `
<p>A <code>StateFlow</code> always holds one current value. A new collector gets that value right away, then every change after it. Setting a value equal to the current one emits nothing, and a slow collector skips straight to the latest value. That makes it a good fit for screen state.</p>
<p>A <code>SharedFlow</code> broadcasts to whoever is collecting at that moment. With the default <code>replay = 0</code>, a collector that arrives late gets nothing from the past, and an event emitted while nobody collects is lost. Use it for one-off events like a toast, where replaying an old event would be a bug.</p>
<p>Both are <em>hot</em>: they exist and hold or emit values whether anyone collects or not. Expose them read-only with <code>asStateFlow()</code> and <code>asSharedFlow()</code> so only the ViewModel can change them.</p>`,
        code: `class EditorViewModel(private val repo: EditorRepository) : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()     // always has a value

    private val _events = MutableSharedFlow<UiEvent>()   // replay = 0
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()

    fun increment() {
        _count.update { it + 1 }
    }

    fun save() {
        viewModelScope.launch {
            repo.save()
            _events.emit(UiEvent.ShowToast("Saved"))     // late collectors miss it
        }
    }
}`,
        remember: 'StateFlow: always a value, and the latest one replays. SharedFlow: broadcast now, late collectors miss it.',
        level: 'intermediate',
        terms: [
          { term: 'StateFlow', def: 'A hot flow that always holds one current value, replays it to new collectors and skips values equal to the current one.' },
          { term: 'SharedFlow', def: 'A hot flow that broadcasts each value to its current collectors, with an optional replay cache for late ones.' },
          { term: 'Hot flow', def: 'A flow that exists and holds or emits values whether or not anyone is collecting it.' },
          { term: 'MutableStateFlow.update', def: 'Atomically replaces a StateFlow value using a function of the current value, safe across threads.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hold the query in the ViewModel and expose it read-only.', code: 'private val _query = [[MutableStateFlow]]("")\nval query: StateFlow<String> = _query.[[asStateFlow]]()', why: 'The mutable flow stays private. The UI only sees a read-only <code>StateFlow</code>.' },
          { type: 'bug', prompt: 'The Saved toast never shows while the screen is open. Tap the bug.', code: 'class EditorViewModel(private val repo: EditorRepository) : ViewModel() {\n    private val _events = MutableSharedFlow<UiEvent>()\n    val events: SharedFlow<UiEvent> = _events.asSharedFlow()\n\n    fun save() {\n        viewModelScope.launch {\n            repo.save()\n            _events.tryEmit(UiEvent.ShowToast("Saved"))\n        }\n    }\n}', bug: 7, fix: '            _events.emit(UiEvent.ShowToast("Saved"))', why: 'A default <code>MutableSharedFlow()</code> has no buffer. <code>tryEmit</code> can’t suspend, so it fails whenever someone is collecting. <code>emit</code> waits for the collector.' },
        ],
        quiz: [
          { q: 'A screen starts collecting <code>count</code> after it has reached 5. What is the first value it gets?', options: ['<code>0</code>', '<code>5</code>', 'Nothing until the next change'], a: 1, why: 'StateFlow hands every new collector its current value straight away.' },
          { q: '<code>_count.value</code> is 5 and you set it to 5 again. What do collectors get?', options: ['Another 5', 'Nothing'], a: 1, why: 'StateFlow only emits when the new value is not equal to the current one.' },
          { q: 'A <code>MutableSharedFlow&lt;UiEvent&gt;()</code> emits a toast while no one is collecting. What happens to it?', options: ['It waits for the next collector', 'It is dropped', 'It throws'], a: 1, why: 'With replay = 0 and no collectors, there is nobody to deliver to, so the event is gone.' },
        ],
        visual(el) {
          let count = 2, evN = 1, busy = false;
          const TOASTS = ['Saved', 'Deleted', 'Copied', 'Sent', 'Synced'];
          const NAMES = ['A', 'B', 'C', 'D'];
          const subs = [];
          const stateVal = h('span', { class: 'flw-val' }, '2');
          const sharedInfo = h('span', { class: 'flw-badge' }, 'emitted 1');
          const sList = h('div', { style: 'display:grid;gap:8px' }), eList = h('div', { style: 'display:grid;gap:8px' });
          const o = out('Screen A has been collecting from the start. Change things, then let a new screen join late.');
          const chip = (text, cls = '') => h('span', { class: `flw-v drop-in ${cls}` }, String(text));
          const push = (strip, c, max) => {
            strip.querySelectorAll('.flw-note').forEach(n => n.remove());
            strip.querySelectorAll('.acc').forEach(n => n.classList.remove('acc'));
            strip.append(c);
            while (strip.children.length > max) strip.firstElementChild.remove();
          };
          function addSub(name, late) {
            const sStrip = h('div', { class: 'flw-strip' }), sNote = h('span', { class: 'flw-note' });
            const eStrip = h('div', { class: 'flw-strip' }), eNote = h('span', { class: 'flw-note' });
            const row = (strip, note) => h('div', { class: `flw-subrow${late ? ' drop-in' : ''}` }, h('div', { class: 'flw-subhead' }, h('span', {}, `screen ${name}`), note), strip);
            sList.append(row(sStrip, sNote)); eList.append(row(eStrip, eNote));
            subs.push({ sStrip, sNote, eStrip, eNote });
            if (late) {
              push(sStrip, chip(count, 'acc'), 5); sNote.textContent = 'got the current value at once';
              eStrip.append(h('span', { class: 'flw-note' }, 'waiting for the next event'));
              eNote.textContent = `missed ${evN} earlier event${evN === 1 ? '' : 's'}`; eNote.className = 'flw-note warn';
            }
          }
          addSub('A');
          [0, 1, 2].forEach(v => subs[0].sStrip.append(h('span', { class: 'flw-v' }, String(v))));
          subs[0].eStrip.append(h('span', { class: 'flw-v ok' }, 'Saved'));
          const setVal = v => { stateVal.textContent = String(v); replay(stateVal, 'pop'); };
          const deliver = (fn) => subs.forEach((s, i) => setTimeout(() => { if (stateVal.isConnected) fn(s); }, i * 120));
          el.append(
            h('div', { class: 'controls' },
              cmd('_count.update { it + 1 }', () => {
                if (busy) return; setVal(++count);
                deliver(s => { push(s.sStrip, chip(count), 5); s.sNote.textContent = ''; });
                say(o, `<span class="good">StateFlow:</span> value is now ${count}. Every current collector got it.`);
              }),
              cmd('_count.value = _count.value', () => {
                if (busy) return; replay(stateVal, 'shake');
                say(o, `<span class="muted">no emission:</span> ${count} equals the current value, so StateFlow sent nothing.`);
              }),
              cmd('repeat(3) { _count.update { it + 1 } }', async () => {
                if (busy) return; busy = true;
                const from = count;
                for (let k = 0; k < 3; k++) { setVal(++count); await sleep(140); if (!stateVal.isConnected) return; }
                await sleep(250); if (!stateVal.isConnected) return;
                deliver(s => { push(s.sStrip, chip(count), 5); s.sNote.textContent = `skipped ${from + 1}, ${from + 2}`; });
                say(o, `<span class="good">conflated:</span> the collectors were busy drawing, so they skipped ${from + 1} and ${from + 2} and got only the latest, ${count}.`);
                busy = false;
              }),
              cmd('_events.emit(ShowToast(…))', () => {
                const t = TOASTS[evN % TOASTS.length]; evN++;
                sharedInfo.textContent = `emitted ${evN}`; replay(sharedInfo, 'pop');
                deliver(s => push(s.eStrip, chip(t, 'ok'), 3));
                say(o, `<span class="good">SharedFlow:</span> "${t}" went to everyone collecting right now. Nobody who joins later will see it.`);
              }),
              cmd('a new screen starts collecting', () => {
                if (subs.length >= NAMES.length) { replay(sList, 'shake'); say(o, '<span class="muted">full:</span> four screens is enough for this demo. Press Reset to start over.'); return; }
                const name = NAMES[subs.length];
                addSub(name, true);
                say(o, `<span class="good">screen ${name} joined:</span> StateFlow replayed ${count} at once. SharedFlow had nothing to replay, so ${name} missed ${evN} event${evN === 1 ? '' : 's'}.`);
              })),
            h('div', { class: 'flw-duo' },
              h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('StateFlow<Int>') }), stateVal), sList),
              h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('SharedFlow<UiEvent>') }), sharedInfo), eList)),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'lifecycle',
        title: 'Collecting safely in the UI',
        tagline: 'Collect while the screen is visible. Stop when it isn’t.',
        body: `
<p>A collector in the UI should run only while the screen is visible. In Compose, <code>collectAsStateWithLifecycle()</code> does this for you. In Views, wrap the collection in <code>repeatOnLifecycle(STARTED)</code>. It starts collecting when the screen reaches STARTED, cancels when it drops below, and starts again on return.</p>
<p>A plain <code>lifecycleScope.launch { flow.collect { } }</code> keeps collecting in the background until the Activity is destroyed. If the flow reads GPS or a socket, it keeps draining the battery.</p>
<p>In the ViewModel, <code>stateIn</code> turns a flow into a StateFlow with an initial value. Started with <code>SharingStarted.WhileSubscribed(5_000)</code>, it shares one upstream among all collectors and keeps it alive for 5 seconds after the last one leaves. A rotation takes far less than 5 seconds, so the upstream survives it. A trip to the home screen stops it.</p>`,
        code: `// ViewModel: one shared upstream, kept alive 5 s after the UI stops collecting
val location: StateFlow<Location?> = repo.locationUpdates()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = null,
    )

// Compose
@Composable
fun MapScreen(vm: MapViewModel = viewModel()) {
    val location by vm.location.collectAsStateWithLifecycle()
    LocationText(location)
}

// Views, in a Fragment
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        vm.location.collect { binding.locationText.text = it.toString() }
    }
}`,
        remember: 'Collect with the lifecycle: on at STARTED, off below it. WhileSubscribed(5_000) rides out a rotation.',
        level: 'advanced',
        terms: [
          { term: 'repeatOnLifecycle', def: 'Runs a block when the lifecycle reaches a given state, cancels it when it falls below, and runs it again on return.' },
          { term: 'collectAsStateWithLifecycle', def: 'Collects a flow into Compose State only while the lifecycle is at least STARTED.' },
          { term: 'stateIn', def: 'Turns a flow into a StateFlow with an initial value, shared by all collectors in a given scope.' },
          { term: 'SharingStarted.WhileSubscribed', def: 'A start policy that runs the upstream while there are collectors and stops it a set time after the last one leaves.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Share one upstream that stops 5 seconds after the UI goes away.', code: 'val items: StateFlow<List<Item>> = repo.items()\n    .[[stateIn]](viewModelScope, SharingStarted.[[WhileSubscribed]](5_000), emptyList())', why: '<code>stateIn</code> makes a StateFlow. <code>WhileSubscribed(5_000)</code> rides out a rotation and stops in the background.' },
          { type: 'bug', prompt: 'GPS keeps running after the user presses Home. Tap the bug.', code: 'override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n    viewLifecycleOwner.lifecycleScope.launch {\n        viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.CREATED) {\n            vm.location.collect { binding.locationText.text = it.toString() }\n        }\n    }\n}', bug: 2, fix: '        viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {', why: 'A stopped screen is still CREATED, so the block keeps collecting. STARTED stops it when the screen is hidden.' },
        ],
        quiz: [
          { q: 'With <code>repeatOnLifecycle(STARTED)</code>, the user presses Home. What happens to the collection?', options: ['It keeps running', 'It is cancelled, and it restarts when the screen is STARTED again', 'The Activity is destroyed'], a: 1, why: 'The block is cancelled when the lifecycle drops below STARTED and relaunched when it gets back there.' },
          { q: 'Why pass <code>5_000</code> to <code>WhileSubscribed</code>?', options: ['To poll every 5 seconds', 'So a short gap, like a rotation, does not restart the upstream', 'To time out slow network calls'], a: 1, why: 'The upstream stays alive for 5 s after the last collector leaves. A rotation reconnects well within that.' },
          { q: 'An Activity uses <code>lifecycleScope.launch { gps.collect { … } }</code>. The app sits in the background. Is GPS still being collected?', options: ['Yes, until the Activity is destroyed', 'No, it stops at onStop'], a: 0, why: '<code>lifecycleScope</code> is only cancelled at onDestroy. Collection must be tied to STARTED to stop in the background.' },
        ],
        visual(el) {
          const W = 12000;
          const MODES = {
            naive: { label: 'lifecycleScope.launch { collect }', code: 'lifecycleScope.launch {\n    repo.locationUpdates().collect { show(it) }\n}' },
            lifecycle: { label: 'repeatOnLifecycle(STARTED)', code: 'lifecycleScope.launch {\n    repeatOnLifecycle(Lifecycle.State.STARTED) {\n        repo.locationUpdates().collect { show(it) }\n    }\n}' },
            shared: { label: 'stateIn(WhileSubscribed(5_000))', code: '// ViewModel\nval location = repo.locationUpdates()\n    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)\n// Compose\nval loc by vm.location.collectAsStateWithLifecycle()' },
          };
          const LANES = [['started', 'STARTED'], ['coll', 'collector'], ['up', 'GPS upstream']];
          const tracks = {};
          const tl = h('div', { class: 'timeline' }, LANES.map(([id, name]) => {
            tracks[id] = h('div', { class: 'lane-track' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), tracks[id]);
          }));
          const snippet = h('div', { class: 'kt' });
          const phone = h('div', { class: 'flw-phone', role: 'img', 'aria-label': 'Phone preview' });
          const stats = h('p', { class: 'tip' });
          const o = out();
          const modeButtons = Object.keys(MODES).map(k => cmd(MODES[k].label, () => reset(k, true)));
          let mode, fg, rotUntil, coll, up, graceUntil, restarts, bgReads, reads, readAcc, segs, phoneKey, statsText;
          function reset(m, announce) {
            mode = m; fg = true; rotUntil = 0; graceUntil = 0; restarts = 0; bgReads = 0; reads = 0; readAcc = 0; coll = up = true;
            const t = performance.now() - 3000;
            segs = { started: [{ s: t, e: null, k: 'run' }], coll: [{ s: t, e: null, k: 'run' }], up: [{ s: t, e: null, k: 'run' }] };
            phoneKey = statsText = '';
            snippet.innerHTML = hl(MODES[m].code);
            modeButtons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(MODES)[i] === m));
            homeBtn.textContent = 'Go to home screen';
            if (announce) say(o, `<span class="muted">mode:</span> ${hl(MODES[m].label)}. Now send the app to the background, or rotate.`);
          }
          function setSeg(lane, on, kind, now) {
            const arr = segs[lane], last = arr[arr.length - 1], open = last && last.e == null;
            if (open && (!on || last.k !== kind)) last.e = now;
            if (on && (!open || last.k !== kind)) arr.push({ s: now, e: null, k: kind });
            while (arr.length && arr[0].e != null && arr[0].e < now - W) arr.shift();
          }
          const coord = n => `${(41.0082 + n * 0.0004).toFixed(4)}\n${(28.9784 + n * 0.0003).toFixed(4)}`;
          function paintPhone(rotating) {
            const key = `${fg}|${rotating}|${coll}|${up}|${reads}`;
            if (key === phoneKey) return; phoneKey = key;
            const gps = h('span', { class: `flw-gps${up ? (fg ? '' : ' bad') : ' off'}` }, up ? 'GPS in use' : 'GPS off');
            let screen;
            if (rotating) screen = h('div', { class: 'flw-screen' }, h('p', { class: 'phone-note' }, 'recreating'));
            else if (fg) screen = h('div', { class: 'flw-screen' }, h('p', { class: 'phone-note' }, 'You are here'), h('p', { class: 'flw-coord', style: 'white-space:pre' }, coord(reads)), h('p', { class: 'phone-note' }, coll ? 'live' : 'waiting'));
            else screen = h('div', { class: 'flw-screen' }, h('div', { class: 'flw-home' }, Array.from({ length: 9 }, () => h('i'))), h('p', { class: 'phone-note' }, 'app in background'));
            phone.replaceChildren(gps, screen);
          }
          loop(tl, (now, dt) => {
            const rotating = now < rotUntil;
            const started = fg && !rotating;
            const c = mode === 'naive' ? !rotating : started;
            let u;
            if (mode === 'shared') {
              if (c) { u = true; graceUntil = 0; }
              else if (up) { if (!graceUntil) graceUntil = now + 5000; u = now < graceUntil; if (!u) graceUntil = 0; }
              else u = false;
            } else u = c;
            if (u && !up) restarts++;
            coll = c; up = u;
            if (up) {
              readAcc += dt;
              if (readAcc >= 1000) { readAcc -= 1000; reads++; if (!fg) bgReads++; }
            }
            setSeg('started', started, 'run', now);
            setSeg('coll', c, c && !fg ? 'block' : 'run', now);
            setSeg('up', u, !c ? 'wait' : !fg ? 'block' : 'run', now);
            const x0 = now - W;
            for (const [id] of LANES) {
              tracks[id].replaceChildren(...segs[id].filter(g => (g.e == null ? now : g.e) > x0).map(g => {
                const s = Math.max(g.s, x0), e = g.e == null ? now : g.e;
                return h('span', { class: `bar ${g.k}`, style: `left:${((s - x0) / W) * 100}%;width:${((e - s) / W) * 100}%` });
              }));
            }
            paintPhone(rotating);
            const txt = `GPS restarts: ${restarts} · readings taken in background: ${bgReads}${graceUntil && !c ? ` · upstream stops in ${((graceUntil - now) / 1000).toFixed(1)} s` : ''}`;
            if (txt !== statsText) { statsText = txt; stats.textContent = txt; }
          });
          const homeBtn = h('button', { class: 'btn primary small', onclick() {
            if (performance.now() < rotUntil) return;
            fg = !fg;
            homeBtn.textContent = fg ? 'Go to home screen' : 'Open the app';
            if (!fg) {
              say(o, {
                naive: '<span class="bad">still collecting:</span> lifecycleScope lives until onDestroy, so GPS keeps running in the background.',
                lifecycle: '<span class="good">stopped:</span> below STARTED, the collector was cancelled, and the cold flow turned GPS off with it.',
                shared: '<span class="good">collector stopped.</span> WhileSubscribed keeps GPS on for 5 s in case you come right back, then stops it.',
              }[mode]);
            } else {
              say(o, {
                naive: '<span class="muted">back:</span> it never stopped, so nothing restarted. The battery paid for every background reading.',
                lifecycle: '<span class="good">STARTED again:</span> a new collector started, and the cold flow switched GPS back on.',
                shared: up ? '<span class="good">back within 5 s:</span> the shared upstream was still running, so nothing restarted.' : '<span class="good">back:</span> the upstream had stopped, so it starts again. The StateFlow shows its last value right away.',
              }[mode]);
            }
          } }, 'Go to home screen');
          const rotBtn = h('button', { class: 'btn small', onclick() {
            if (performance.now() < rotUntil) return;
            if (!fg) { replay(phone, 'shake'); say(o, '<span class="muted">no-op:</span> open the app first, then rotate it.'); return; }
            rotUntil = performance.now() + 450; replay(phone, 'flw-rot');
            say(o, mode === 'shared'
              ? '<span class="good">rotation:</span> the collector stopped for under half a second, well inside the 5 s window, so GPS kept running.'
              : '<span class="bad">rotation:</span> the Activity was recreated. The collector restarted, and so did GPS, from scratch.');
          } }, 'Rotate');
          reset('lifecycle');
          o.innerHTML = 'The timeline is live. Send the app to the background, bring it back, rotate, then try another mode.';
          el.append(
            h('div', { class: 'controls' }, modeButtons),
            snippet,
            h('div', { class: 'flw-life' }, phone, h('div', {}, tl,
              h('div', { class: 'legend' },
                h('span', {}, h('i', { class: 'bar run' }), 'active'),
                h('span', {}, h('i', { class: 'bar block' }), 'active in background'),
                h('span', {}, h('i', { class: 'bar wait' }), 'kept alive, no collector')),
              h('div', { class: 'controls' }, homeBtn, rotBtn),
              stats)),
            o);
        },
      },
    ],
  });
})();
