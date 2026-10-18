/* Coroutines track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below. Classes keep the prefix of the track they came from:
   kt- for the basics lesson (from Kotlin), flw- for the rest (from Flow). */
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

  const pressed = (buttons, keys, k) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(keys[i] === k)));

  // ─── Depth pass 2: Channels ─────────────────
  const channelsDepth = {
    deeper: [
      {
        title: 'close() lets receivers finish, cancel() throws the rest away',
        body: `<p><code>close()</code> is the sender saying it is done. New sends fail with <code>ClosedSendChannelException</code>, but values already in the buffer can still be received. Once the buffer is empty the channel is closed for receive, and a <code>for</code> loop over it ends normally.</p>
<p><code>cancel()</code> is the receiver saying it does not want anything more. It closes the channel and drops every buffered value at once. Receives and sends after that throw a <code>CancellationException</code>. The <code>produce { }</code> builder closes its channel for you when its block finishes.</p>`,
        code: `val numbers: ReceiveChannel<Int> = scope.produce(capacity = 4) {
    for (i in 1..10) send(i)
}   // closed automatically when the block ends

for (n in numbers) {            // ends when closed and empty
    if (n == 3) { numbers.cancel(); break }   // drop the rest, stop the producer
    show(n)
}`,
        visual(el) {
          const CAP = 4;
          let buf, n, state, busy = false;
          const pipe = h('div', { class: 'flw-chpipe' });
          const got = h('div', { class: 'flw-strip flw-wrap' });
          const fSend = h('span', { class: 'kt-state' }), fRecv = h('span', { class: 'kt-state' });
          const o = out();
          let slots = [];
          const flags = () => {
            const cs = state !== 'open', cr = state === 'cancelled' || (state === 'closed' && !buf.length);
            fSend.textContent = `isClosedForSend = ${cs}`; fSend.className = 'kt-state' + (cs ? ' warn' : ' ok');
            fRecv.textContent = `isClosedForReceive = ${cr}`; fRecv.className = 'kt-state' + (cr ? ' bad' : ' ok');
            pipe.classList.toggle('flw-d2ch-shut', state !== 'open');
          };
          const relayout = () => buf.forEach((c, i) => moveTo(c, slots[i]));
          function fresh() {
            buf = []; n = 0; state = 'open';
            slots = Array.from({ length: CAP }, () => h('span', { class: 'flw-slot' }));
            pipe.replaceChildren(...slots); got.replaceChildren(h('span', { class: 'flw-note' }, 'nothing received yet'));
            [1, 2, 3].forEach(() => { const c = h('span', { class: 'flw-v acc' }, String(++n)); buf.push(c); slots[buf.length - 1].append(c); });
            flags();
          }
          const take = c => { got.querySelectorAll('.flw-note').forEach(x => x.remove()); c.className = 'flw-v ok'; moveTo(c, got); };
          function send() {
            if (busy) return;
            if (state !== 'open') { replay(pipe, 'shake'); say(o, `<span class="bad">send(${n + 1}) throws</span> ${state === 'closed' ? 'ClosedSendChannelException' : 'CancellationException'} <span class="muted">// the channel is ${state}</span>`); return; }
            if (buf.length >= CAP) { replay(pipe, 'shake'); say(o, '<span class="muted">full:</span> send would suspend here. Receive one first.'); return; }
            const c = h('span', { class: 'flw-v acc drop-in' }, String(++n)); buf.push(c); slots[buf.length - 1].append(c); flags();
            say(o, `<span class="good">sent ${n}</span>, ${CAP - buf.length} slot${CAP - buf.length === 1 ? '' : 's'} left`);
          }
          function receive() {
            if (busy) return;
            if (buf.length) {
              const c = buf.shift(); take(c); relayout(); flags();
              say(o, `<span class="good">received ${c.textContent}</span>${state === 'closed' ? (buf.length ? ', still allowed after close()' : '. That was the last one, so the channel is now closed for receive.') : ''}`);
              return;
            }
            replay(pipe, 'shake');
            if (state === 'open') say(o, '<span class="muted">empty:</span> receive() would suspend until the next send.');
            else say(o, `<span class="bad">receive() throws</span> ${state === 'closed' ? 'ClosedReceiveChannelException' : 'CancellationException'}. Use receiveCatching() or a for loop to end quietly.`);
          }
          async function forLoop() {
            if (busy) return; busy = true;
            if (!buf.length && state === 'cancelled') { replay(pipe, 'shake'); say(o, '<span class="bad">the loop throws</span> CancellationException: the channel was cancelled.'); busy = false; return; }
            while (buf.length) {
              const c = buf.shift(); take(c); relayout(); flags();
              await sleep(380); if (!el.isConnected) return;
            }
            say(o, state === 'closed'
              ? '<span class="good">loop ended:</span> the channel was closed and is now empty, so the for loop finished normally.'
              : '<span class="muted">drained:</span> the buffer is empty but the channel is open, so the loop suspends and waits for the next value.');
            busy = false;
          }
          async function close() {
            if (busy) return;
            if (state !== 'open') { replay(pipe, 'shake'); say(o, `<span class="muted">no-op:</span> already ${state}. close() returns false.`); return; }
            state = 'closed'; flags(); replay(pipe, 'pop-soft');
            say(o, buf.length ? `<span class="good">closed:</span> no more sends. The ${buf.length} buffered value${buf.length === 1 ? '' : 's'} can still be received.` : '<span class="good">closed</span> and empty, so receivers are done at once.');
          }
          async function cancel() {
            if (busy) return; busy = true;
            if (state === 'cancelled') { replay(pipe, 'shake'); say(o, '<span class="muted">no-op:</span> already cancelled.'); busy = false; return; }
            const lost = buf.length;
            buf.forEach(c => { c.className = 'flw-v bad'; c.classList.add('fly-out'); });
            await sleep(420); if (!el.isConnected) return;
            buf.forEach(c => c.remove()); buf = []; state = 'cancelled'; flags();
            say(o, `<span class="bad">cancelled:</span> ${lost ? `${lost} buffered value${lost === 1 ? ' was' : 's were'} dropped` : 'nothing was buffered'}. The channel is closed both ways.`);
            busy = false;
          }
          fresh();
          o.innerHTML = 'A channel with room for 4 holds 1, 2 and 3. Close it, then receive. Then try cancel.';
          el.append(
            h('div', { class: 'controls' }, cmd('val ch = Channel<Int>(4)', () => { if (busy) return; fresh(); say(o, 'A fresh channel with 1, 2 and 3 in it.'); })),
            h('div', { class: 'flw-d2ch-flags' }, fSend, fRecv),
            pipe,
            h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'received'), got),
            h('div', { class: 'controls' }, cmd('ch.send(n)', send), cmd('ch.receive()', receive), cmd('for (x in ch) show(x)', forLoop)),
            h('div', { class: 'controls' }, cmd('ch.close()', close), cmd('ch.cancel()', cancel)),
            o);
        },
      },
      {
        title: 'select takes whichever channel is ready first',
        body: `<p><code>select { }</code> waits on several channels at once and runs the clause of the first one that has a value. Only that value is received. The other channel keeps its value for the next receive.</p>
<p>If more than one clause is ready at the same moment, <code>select</code> picks the first one in the order you wrote them. Use <code>selectUnbiased</code> when that bias would starve a channel.</p>`,
        code: `suspend fun firstAnswer(cache: ReceiveChannel<Prices>, network: ReceiveChannel<Prices>): Prices =
    select {
        cache.onReceive { it }       // listed first: wins a tie
        network.onReceive { it }
    }`,
        visual(el) {
          let netFirst = false, busy = false;
          const lanes = ['cache', 'network'].map(name => {
            const bar = h('i'), box = h('div', { class: 'flw-strip' }, h('span', { class: 'flw-note' }, 'empty'));
            return { name, bar, box, row: h('div', { class: 'flw-d2ch-lane' }, h('span', { class: 'lane-name' }, name), h('span', { class: 'flw-prog' }, bar), box) };
          });
          const winner = h('div', { class: 'flw-shown wait' }, 'select has not run yet');
          const o = out();
          const reset = () => lanes.forEach(l => { l.bar.style.transition = 'none'; l.bar.style.width = '0%'; l.box.replaceChildren(h('span', { class: 'flw-note' }, 'empty')); });
          const put = (l, text) => { const c = h('span', { class: 'flw-v acc drop-in' }, text); l.box.replaceChildren(c); return c; };
          async function race() {
            if (busy) return; busy = true;
            reset(); winner.className = 'flw-shown wait'; winner.textContent = 'select is suspended on both channels';
            const ms = netFirst ? [1500, 700] : [600, 1400];
            const vals = ['cached prices', 'fresh prices'];
            void lanes[0].bar.offsetWidth;
            lanes.forEach((l, i) => { l.bar.style.transition = `width ${ms[i]}ms linear`; l.bar.style.width = '100%'; });
            say(o, hl('select { cache.onReceive { it }; network.onReceive { it } }'));
            const first = ms[0] < ms[1] ? 0 : 1, second = 1 - first;
            await sleep(ms[first]); if (!el.isConnected) return;
            const c = put(lanes[first], vals[first]);
            await sleep(250); if (!el.isConnected) return;
            c.className = 'flw-v ok'; moveTo(c, winner); winner.className = 'flw-shown'; winner.firstChild.textContent = `select returned: `;
            lanes[first].box.replaceChildren(h('span', { class: 'flw-note' }, 'received'));
            say(o, `<span class="good">${lanes[first].name} was ready first</span>, so its clause ran and select returned.`);
            await sleep(ms[second] - ms[first]); if (!el.isConnected) return;
            const late = put(lanes[second], vals[second]); late.className = 'flw-v warn drop-in';
            say(o, `<span class="good">${lanes[first].name} won.</span> ${lanes[second].name}’s value arrived later and <span class="muted">waits in its channel</span>. select received only one.`);
            busy = false;
          }
          async function tie() {
            if (busy) return; busy = true;
            reset();
            lanes.forEach((l, i) => { l.bar.style.width = '100%'; put(l, ['cached prices', 'fresh prices'][i]); });
            winner.className = 'flw-shown wait'; winner.textContent = 'both channels already hold a value';
            await sleep(600); if (!el.isConnected) return;
            const c = lanes[0].box.firstChild; c.className = 'flw-v ok'; moveTo(c, winner);
            winner.className = 'flw-shown'; winner.firstChild.textContent = 'select returned: ';
            lanes[0].box.replaceChildren(h('span', { class: 'flw-note' }, 'received'));
            say(o, '<span class="good">tie:</span> both were ready, so select took the first clause, cache. selectUnbiased would pick one at random.');
            busy = false;
          }
          const sw = h('input', { type: 'checkbox', id: 'flw-d2ch-net', onchange() { netFirst = this.checked; say(o, netFirst ? 'The cache is cold now, so the network answers first.' : 'The cache answers first again.'); } });
          o.innerHTML = 'The cache and the network each send one value. Run select and see who wins.';
          el.append(
            h('div', { class: 'flw-search' }, lanes.map(l => l.row)),
            h('label', { class: 'switch', for: 'flw-d2ch-net' }, sw, 'cache is cold: network answers first'),
            h('div', { class: 'controls' }, cmd('select { cache.onReceive; network.onReceive }', race), cmd('select when both are ready', tie)),
            winner, o);
        },
      },
    ],
    underHood: {
      body: `<p>Since kotlinx.coroutines 1.7, a channel is a <code>BufferedChannel</code> built on a lock-free algorithm from the paper “Fast and Scalable Channels in Kotlin Coroutines”. Channel cells live in a linked list of small array segments. A send atomically increments a senders counter to claim a cell, and a receive does the same with a receivers counter. If the receiver got to a cell first, it parks its continuation there, and the sender that claims the cell resumes it directly with the value.</p>
<p>The capacity constants are shortcuts. <code>BUFFERED</code> means 64 unless the <code>kotlinx.coroutines.channels.defaultBuffer</code> system property says otherwise. <code>CONFLATED</code> is the same as capacity 1 with <code>BufferOverflow.DROP_OLDEST</code>.</p>`,
      code: `Channel<Int>(Channel.CONFLATED)
// behaves the same as
Channel<Int>(capacity = 1, onBufferOverflow = BufferOverflow.DROP_OLDEST)`,
    },
    mistakes: [
      {
        title: 'Expecting every collector to get each event',
        bad: `val events = _events.receiveAsFlow()
// Two parts of the screen both collect events
launch { events.collect { showSnackbar(it) } }
launch { events.collect { logToAnalytics(it) } }`,
        good: `// One collector for one-shot events
launch { events.collect { e -> showSnackbar(e); logToAnalytics(e) } }
// or a SharedFlow when every collector must see every value`,
        why: 'Values from a channel are split between collectors. Each event reaches one of them, so the snackbar silently misses about half.',
      },
      {
        title: 'trySend into a rendezvous channel from a callback',
        bad: `val clicks = Channel<Unit>()          // RENDEZVOUS
button.setOnClickListener { clicks.trySend(Unit) }`,
        good: `val clicks = Channel<Unit>(Channel.CONFLATED)
button.setOnClickListener { clicks.trySend(Unit) }`,
        why: 'With no buffer, <code>trySend</code> only succeeds if a receiver is waiting at that exact moment. Otherwise it fails and the click is lost without any error.',
      },
      {
        title: 'Collecting consumeAsFlow twice',
        bad: `val updates = channel.consumeAsFlow()
updates.collect { render(it) }
updates.collect { render(it) }   // after a resubscribe`,
        good: `val updates = channel.receiveAsFlow()   // can be collected again
updates.collect { render(it) }`,
        why: '<code>consumeAsFlow</code> cancels the channel when collection ends and throws IllegalStateException if collected a second time. <code>receiveAsFlow</code> allows more collections.',
      },
    ],
  };

  // ─── Channels ─────────────────
  const channels = {
    id: 'channels',
    title: 'Channels',
    tagline: 'A queue between coroutines. Each value goes to exactly one receiver.',
    body: `
<p>A <code>Channel</code> is a queue that coroutines share. <code>send</code> puts a value in and <code>receive</code> takes one out. Each value is received exactly once, by one receiver. A SharedFlow is different: it gives every value to every collector.</p>
<p>The capacity decides when <code>send</code> suspends. <code>RENDEZVOUS</code>, the default, has no buffer, so send waits for a receiver. <code>BUFFERED</code> holds 64 values, then send waits. <code>CONFLATED</code> keeps only the latest value and never suspends. <code>UNLIMITED</code> never suspends and grows until memory runs out. Several coroutines can receive from one channel to share the work. That is called fan-out.</p>
<p>For one-off UI events, a buffered channel exposed with <code>receiveAsFlow()</code> holds an event sent while no one collects, for example during a rotation, and delivers it once. A <code>MutableSharedFlow()</code> with no replay drops it. When the event changes what the screen shows, modeling it as state is often simpler still.</p>`,
    code: `class CheckoutViewModel(private val repo: CheckoutRepository) : ViewModel() {
    private val _events = Channel<CheckoutEvent>(Channel.BUFFERED)
    val events: Flow<CheckoutEvent> = _events.receiveAsFlow()

    fun pay() {
        viewModelScope.launch {
            repo.pay()
            _events.send(CheckoutEvent.OpenReceipt)   // kept until the screen collects it
        }
    }
}

// Fan-out: three workers share one queue. Each upload goes to exactly one worker.
suspend fun uploadAll(files: List<File>) = coroutineScope {
    val queue = Channel<File>(capacity = 10)
    launch {
        files.forEach { queue.send(it) }    // suspends while the queue is full
        queue.close()                       // lets the for loops below end
    }
    repeat(3) { worker ->
        launch { for (file in queue) upload(worker, file) }
    }
}`,
    remember: 'Channel: each value to one receiver, kept until received. SharedFlow: each value to every collector who is there.',
    level: 'advanced',
    terms: [
      { term: 'Channel', def: 'A coroutine-safe queue where send adds a value, receive removes one, and each value is delivered to exactly one receiver.' },
      { term: 'Channel capacity', def: 'The buffer size that decides when send suspends: RENDEZVOUS (0), BUFFERED (64), CONFLATED (latest only) or UNLIMITED.' },
      { term: 'Fan-out', def: 'Several coroutines receiving from the same channel, so each value is handled by one of them and the work is shared.' },
      { term: 'receiveAsFlow', def: 'Exposes a channel as a Flow whose collectors take values out of the channel, each value going to one collector.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Keep one-off events sent while no screen collects, and deliver each one once.', code: `private val _events = Channel<UiEvent>(Channel.[[BUFFERED]])
val events: Flow<UiEvent> = _events.[[receiveAsFlow]]()

fun onSaved() {
    viewModelScope.launch { _events.[[send]](UiEvent.ShowSaved) }
}`, why: 'A buffered channel holds the event until a collector takes it. <code>receiveAsFlow</code> lets the UI collect it like any flow.' },
      { type: 'bug', prompt: 'uploadAll uploads every file but never returns. Tap the bug.', code: `suspend fun uploadAll(files: List<File>) = coroutineScope {
    val queue = Channel<File>(capacity = 10)
    launch {
        files.forEach { queue.send(it) }
    }
    repeat(3) { launch { for (f in queue) upload(f) } }
}`, bug: 3, fix: '        files.forEach { queue.send(it) }; queue.close()', why: '<code>for (f in queue)</code> ends only when the channel is closed. Without <code>close()</code> the workers wait forever, so coroutineScope never returns.' },
    ],
    quiz: [
      { q: 'Three coroutines receive from one channel. The sender sends 6 values. How many receivers get each value?', options: ['Exactly one', 'All three', 'It depends on the capacity'], a: 0, why: 'A channel is a queue. Receiving takes the value out, so each one goes to one receiver.' },
      { q: '<code>val ch = Channel&lt;Int&gt;()</code> and no one is receiving. What does <code>ch.send(1)</code> do?', options: ['Returns at once', 'Suspends until a receiver takes the value', 'Throws'], a: 1, why: 'The default capacity is RENDEZVOUS. With no buffer, send waits for a receiver.' },
      { q: 'An event is sent while the screen rotates and nobody collects. Which one still delivers it to the new screen?', options: ['<code>MutableSharedFlow&lt;UiEvent&gt;()</code>', '<code>Channel&lt;UiEvent&gt;(Channel.BUFFERED)</code> with <code>receiveAsFlow()</code>'], a: 1, why: 'The channel keeps the event in its buffer. A SharedFlow with no replay drops values when it has no collectors.' },
      { q: 'A sender puts 3 values into a <code>Channel(capacity = 10)</code> and then calls <code>close()</code>. What does the receiver’s <code>for (x in channel)</code> loop do?', options: ['Receives all 3 values, then ends normally', 'Ends at once, the values are dropped', 'Receives 1 value, then throws ClosedReceiveChannelException'], a: 0, why: 'close() stops new sends, but values already in the buffer can still be received. The loop ends when the buffer is empty.' },
      { q: 'A click callback calls <code>trySend(Click)</code> on a <code>Channel&lt;Click&gt;()</code> while the collector is busy. What happens to the click?', options: ['It waits in the channel until the collector is free', 'trySend fails and the click is lost without an error', 'trySend suspends the callback'], a: 1, why: 'The default channel is rendezvous, with no buffer. trySend only succeeds if a receiver is waiting right then. Give the channel a buffer for callbacks.' },
    ],
    deeper: channelsDepth.deeper,
    underHood: channelsDepth.underHood,
    mistakes: channelsDepth.mistakes,
    visual(el) {
      const CAPS = {
        rendezvous: { label: 'Channel<Int>()', slots: 0, name: 'RENDEZVOUS' },
        three: { label: 'Channel<Int>(3)', slots: 3, name: 'capacity 3' },
        conflated: { label: 'Channel<Int>(CONFLATED)', slots: 1, name: 'CONFLATED' },
        unlimited: { label: 'Channel<Int>(UNLIMITED)', slots: Infinity, name: 'UNLIMITED' },
      };
      const ckeys = Object.keys(CAPS);
      let cap, buf, slots, pendSend, pendRecv, n;
      const sHold = h('div', { class: 'flw-hold' }), sNote = h('span', { class: 'flw-note' });
      const rHold = h('div', { class: 'flw-hold' }), rNote = h('span', { class: 'flw-note' });
      const sender = h('div', { class: 'flw-party' }, h('b', {}, 'sender'), sHold, sNote);
      const receiver = h('div', { class: 'flw-party' }, h('b', {}, 'receiver'), rHold, rNote);
      const pipe = h('div', { class: 'flw-chpipe' });
      const o = out();
      const chip = (v, cls = '') => h('span', { class: `flw-v ${cls}` }, String(v));
      const slotFor = i => (CAPS[cap].slots === Infinity ? pipe : slots[i]);
      const status = () => {
        sender.classList.toggle('sus', !!pendSend); receiver.classList.toggle('sus', pendRecv);
        sNote.textContent = pendSend ? `suspended in send(${pendSend.v})` : 'ready';
        rNote.textContent = pendRecv ? 'suspended in receive()' : rHold.children.length ? `got ${rHold.textContent}` : 'idle';
      };
      function setCap(k) {
        cap = k; buf = []; pendSend = null; pendRecv = false; n = 0;
        const c = CAPS[k];
        slots = c.slots === Infinity ? [] : Array.from({ length: c.slots }, () => h('span', { class: 'flw-slot' }));
        pipe.replaceChildren(...(c.slots === 0 ? [h('span', { class: 'flw-note' }, 'no buffer: hand-off only')] : slots));
        sHold.replaceChildren(); rHold.replaceChildren();
        pressed(capBtns, ckeys, k); status();
      }
      const toReceiver = c => { rHold.replaceChildren(); c.className = 'flw-v ok'; moveTo(c, rHold); };
      function send() {
        if (pendSend) { replay(sender, 'shake'); say(o, `<span class="muted">already suspended:</span> send(${pendSend.v}) is still waiting. Call receive() to make room.`); return; }
        const v = ++n, c = chip(v, 'acc drop-in');
        sHold.append(c);
        if (pendRecv) {
          pendRecv = false; toReceiver(c); status();
          say(o, `<span class="good">handed over:</span> the receiver was waiting, so ${v} went straight to it and both resumed.`); return;
        }
        const room = CAPS[cap].slots;
        if (cap === 'conflated' && buf.length) {
          const old = buf.pop(); old.classList.add('fly-out'); setTimeout(() => old.remove(), 400);
          buf.push(c); moveTo(c, slots[0]); status();
          say(o, `<span class="good">conflated:</span> ${old.textContent} was replaced by ${v}. send never suspends here.`); return;
        }
        if (buf.length < room && !(cap === 'unlimited' && buf.length >= 8)) {
          buf.push(c); moveTo(c, slotFor(buf.length - 1)); status();
          say(o, cap === 'unlimited' ? `<span class="good">queued:</span> ${buf.length} waiting. UNLIMITED never suspends, so a fast sender grows this without limit.` : `<span class="good">buffered:</span> ${v} waits in the channel. ${room - buf.length} slot${room - buf.length === 1 ? '' : 's'} left.`);
          return;
        }
        if (cap === 'unlimited') { c.remove(); n--; replay(pipe, 'shake'); say(o, '<span class="muted">demo limit:</span> 8 is enough to make the point. In a real app the queue would keep growing.'); return; }
        pendSend = { v, c }; status(); replay(sender, 'pop-soft');
        say(o, cap === 'rendezvous' ? `<span class="bad">suspended:</span> RENDEZVOUS has no buffer. send(${v}) waits until someone calls receive().` : `<span class="bad">suspended:</span> the buffer is full, so send(${v}) waits for a receive() to make room.`);
      }
      function receive() {
        if (pendRecv) { replay(receiver, 'shake'); say(o, '<span class="muted">already waiting:</span> receive() is suspended until someone sends.'); return; }
        if (buf.length) {
          const c = buf.shift(); toReceiver(c);
          buf.forEach((x, i) => moveTo(x, slotFor(i)));
          let msg = `<span class="good">received ${c.textContent}:</span> it left the channel, so no other receiver can get it.`;
          if (pendSend) { buf.push(pendSend.c); moveTo(pendSend.c, slotFor(buf.length - 1)); msg += ` That made room, so send(${pendSend.v}) resumed.`; pendSend = null; }
          status(); say(o, msg); return;
        }
        if (pendSend) {
          const { v, c } = pendSend; pendSend = null; toReceiver(c); status();
          say(o, `<span class="good">rendezvous:</span> sender and receiver met. ${v} changed hands and send(${v}) resumed.`); return;
        }
        pendRecv = true; status(); replay(receiver, 'pop-soft');
        say(o, '<span class="bad">suspended:</span> the channel is empty, so receive() waits for the next send.');
      }
      const capBtns = ckeys.map(k => cmd(CAPS[k].label, () => { setCap(k); say(o, `<span class="muted">${CAPS[k].name}:</span> a fresh channel. Send a few values, then receive.`); }));
      setCap('three');
      [1, 2].forEach(() => { const c = chip(++n); buf.push(c); slots[buf.length - 1].append(c); });
      status();
      o.innerHTML = 'A channel with room for 3 already holds 1 and 2. Send until it is full, then receive.';

      // Second stage: fan-out and the rotation case.
      const stage = h('div');
      const o2 = out('Run fan-out to share work, or send an event during a rotation.');
      let busy2 = false;
      const act = fn => async () => { if (busy2) return; busy2 = true; try { await fn(); } finally { busy2 = false; } };
      async function fanOut() {
        const queue = h('div', { class: 'flw-strip' }, [1, 2, 3, 4, 5, 6].map(i => chip(`job${i}`)));
        const W = [700, 1000, 1300].map((ms, i) => ({ ms, cur: h('div', { class: 'flw-hold' }), done: h('div', { class: 'flw-strip' }), got: [], i }));
        stage.replaceChildren(h('div', { class: 'flw-search' },
          h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'channel'), queue),
          W.map(w => h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, `worker ${w.i + 1}`), h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0' }, w.cur, w.done)))));
        say(o2, `${hl('repeat(3) { launch { for (job in queue) work(job) } }')}`);
        const work = async w => {
          for (;;) {
            const c = queue.firstElementChild;
            if (!c) return true;
            c.className = 'flw-v acc'; moveTo(c, w.cur); w.got.push(c.textContent);
            await sleep(w.ms); if (!stage.isConnected) return false;
            c.className = 'flw-v ok'; moveTo(c, w.done);
          }
        };
        const res = await Promise.all(W.map(work));
        if (!res.every(Boolean)) return;
        say(o2, `<span class="good">fan-out:</span> each job reached exactly one worker. ${W.map(w => `worker ${w.i + 1} got ${w.got.length}`).join(', ')}. The fast worker took more. A SharedFlow would have given every worker all 6.`);
      }
      async function rotation() {
        const col = (name) => {
          const scr = h('span', { class: 'flw-gps' }, 'screen collecting'), hold = h('div', { class: 'flw-strip' }), shownE = h('div', { class: 'flw-shown wait' }, 'waiting for events');
          const p = h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl(name) }), scr), h('span', { class: 'flw-note' }, 'buffer'), hold, shownE);
          return { p, scr, hold, shownE };
        };
        const ch = col('Channel(BUFFERED)'), sf = col('MutableSharedFlow()');
        stage.replaceChildren(h('div', { class: 'flw-duo' }, ch.p, sf.p));
        const both = f => [ch, sf].forEach(f);
        say(o2, 'Both screens are collecting. Now the user rotates the phone…');
        await sleep(900); if (!stage.isConnected) return;
        both(c => { c.scr.className = 'flw-gps off'; c.scr.textContent = 'rotating: no collector'; replay(c.p, 'pop-soft'); });
        await sleep(700); if (!stage.isConnected) return;
        say(o2, `${hl('send(OpenReceipt)')} <span class="muted">// payment finished while no one collects</span>`);
        const a = chip('OpenReceipt', 'acc drop-in'), b = chip('OpenReceipt', 'acc drop-in');
        ch.hold.append(a); sf.hold.append(b);
        await sleep(700); if (!stage.isConnected) return;
        b.classList.add('fly-out'); sf.shownE.className = 'flw-shown stale'; sf.shownE.textContent = 'dropped: no collectors';
        await sleep(900); if (!stage.isConnected) return;
        both(c => { c.scr.className = 'flw-gps'; c.scr.textContent = 'new screen collecting'; replay(c.p, 'pop-soft'); });
        await sleep(500); if (!stage.isConnected) return;
        ch.shownE.className = 'flw-shown'; ch.shownE.textContent = 'opened the receipt once '; a.className = 'flw-v ok'; moveTo(a, ch.shownE);
        sf.shownE.textContent = 'receipt never opened';
        say(o2, '<span class="good">Channel</span> kept the event in its buffer and delivered it once to the new screen. <span class="bad">SharedFlow</span> had no collector at that moment, so the event was lost.');
      }
      el.append(
        h('div', { class: 'controls' }, capBtns),
        h('div', { class: 'flw-chan' }, sender, pipe, receiver),
        h('div', { class: 'controls' }, cmd('channel.send(n)', send), cmd('channel.receive()', receive)),
        o,
        h('div', { class: 'controls' }, cmd('fan-out: 3 workers, 6 jobs', act(fanOut)), cmd('send an event during rotation', act(rotation))),
        stage, o2);
    },
  };

  // ─── Depth: Go deeper, under the hood, common mistakes ─────────────────
  // Small tree node used by the structured-concurrency step demos.
  function flwTreeNode(N, id, src, kids) {
    const bar = h('i'), st = h('span', { class: 'flw-st' });
    const box = h('div', { class: 'flw-node' }, h('span', { class: 'flw-src', html: hl(src) }), st, h('span', { class: 'flw-prog' }, bar));
    N[id] = { box, st, bar, p: 0, state: 'run' };
    return h('div', { class: 'flw-sub' }, box, kids && h('div', { class: 'flw-kids' }, kids));
  }
  function flwSetNode(N, id, state, text) {
    const n = N[id]; n.state = state; n.st.textContent = text;
    n.box.className = `flw-node ${state}${id === 'root' ? ' root' : ''}`;
  }

  const structuredDepth = {
    deeper: [
      {
        title: 'A suspend function finishes its work before it returns',
        body: `<p>When a suspend function starts parallel work, wrap it in <code>coroutineScope { }</code>. It returns only after every child is done, and if one fails, the error reaches the caller like any other exception.</p>
<p>Launching into a scope you were handed, or one you made up, breaks that. The function returns at once, the caller thinks the work is done, and a failure goes somewhere the caller never sees.</p>`,
        code: `// Returns when both are saved. A failure reaches the caller.
suspend fun saveAll(note: Note, tags: List<Tag>) = coroutineScope {
    launch { dao.saveNote(note) }
    launch { dao.saveTags(tags) }
}

// Returns before anything is saved. The caller can't wait or catch.
suspend fun saveAllWrong(note: Note, tags: List<Tag>) {
    CoroutineScope(Dispatchers.IO).launch { dao.saveNote(note) }
    CoroutineScope(Dispatchers.IO).launch { dao.saveTags(tags) }
}`,
      },
      {
        title: 'Work that must outlive the screen',
        body: `<p>Some work should finish even if the user leaves, like saving a bookmark. <code>viewModelScope</code> would cancel it. Don’t reach for <code>GlobalScope</code>. Inject a longer-lived scope instead, created and owned by something that lives longer than the screen, such as your <code>Application</code> class.</p>
<p>The coroutine is still part of a tree, just a longer-lived one. Calling <code>join()</code> lets the caller wait for it while the screen is still there.</p>`,
        code: `class ArticlesRepository(
    private val dataSource: ArticlesDataSource,
    private val externalScope: CoroutineScope,   // lives as long as the app
) {
    suspend fun bookmark(article: Article) {
        externalScope.launch { dataSource.bookmark(article) }
            .join()       // wait while the caller is alive; finishes even if it isn't
    }
}`,
      },
    ],
    underHood: {
      body: `<p>Every builder like <code>launch</code> or <code>async</code> creates a <code>Job</code>. When it starts, it looks up the Job already in its <code>CoroutineContext</code> and attaches itself to it as a child. That link is the tree.</p>
<p><code>cancel()</code> moves a Job to the cancelling state and cancels each child in turn. A coroutine suspended at that moment is waiting inside a <code>CancellableContinuation</code>, which is resumed with a <code>CancellationException</code> instead of a value. The exception unwinds the code, runs the <code>finally</code> blocks, and the Job becomes cancelled once all its children are done.</p>
<p>A failing child reports to its parent. A plain Job cancels itself and its other children. A <code>SupervisorJob</code> ignores failures from its children, so each child must handle its own.</p>`,
      code: `// What the tree looks like in the context
val parent = viewModelScope.coroutineContext[Job]!!
val child = viewModelScope.launch { delay(10_000) }
check(child in parent.children)          // attached on start
parent.cancelChildren()                 // child is resumed with CancellationException`,
    },
    mistakes: [
      {
        title: 'Catching Exception swallows cancellation',
        bad: `while (true) {
    try {
        repo.sync()
        delay(60_000)
    } catch (e: Exception) {      // also catches CancellationException
        log(e)
    }
}`,
        good: `while (true) {
    try {
        repo.sync()
        delay(60_000)
    } catch (e: IOException) {
        log(e)
    }
}`,
        why: '<code>CancellationException</code> is an <code>Exception</code>. Catching it keeps the loop alive after the scope is cancelled. Catch the specific type, or rethrow <code>CancellationException</code>. <code>runCatching</code> has the same problem.',
      },
      {
        title: 'Passing a new Job to launch breaks the tree',
        bad: `fun refresh() {
    viewModelScope.launch(SupervisorJob()) {
        repo.refresh()
    }
}`,
        good: `fun refresh() {
    viewModelScope.launch {
        supervisorScope {
            launch { repo.refreshNews() }
            launch { repo.refreshWeather() }
        }
    }
}`,
        why: 'A Job in the <code>launch</code> arguments becomes the new parent. The coroutine is no longer a child of <code>viewModelScope</code>, so <code>onCleared()</code> does not cancel it. Use <code>supervisorScope</code> inside instead.',
      },
    ],
  };

  const dispatchersDepth = {
    deeper: [
      {
        title: 'Main posts, Main.immediate runs now',
        body: `<p><code>Dispatchers.Main</code> always posts the coroutine to the main thread’s message queue, even if you are already on the main thread. The code after <code>launch</code> runs first, and the coroutine runs after whatever is already queued, often in a later frame.</p>
<p><code>Dispatchers.Main.immediate</code> skips the queue when you are already on main and runs the coroutine right away, up to its first suspension. <code>viewModelScope</code> and <code>lifecycleScope</code> use it, so a state update lands before the next frame.</p>`,
        visual(el) {
          const MODES = [['main', 'Dispatchers.Main'], ['imm', 'Dispatchers.Main.immediate']];
          let mode = 'main', busy = false;
          const snippet = h('div', { class: 'kt' });
          const queue = h('div', { class: 'flw-strip', 'aria-label': 'Main thread message queue' });
          const printed = h('div', { class: 'flw-strip', 'aria-label': 'Printed output' });
          const o = out();
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => { if (busy) return; mode = k; paint(); say(o, `<span class="muted">mode:</span> ${hl(src)}. Press run.`); }));
          const fill = () => queue.replaceChildren(h('span', { class: 'flw-v' }, 'touch'), h('span', { class: 'flw-v' }, 'draw frame'));
          function paint() {
            snippet.innerHTML = hl(`// in a click handler, already on main\nprintln("A")\nscope.launch(${mode === 'main' ? 'Dispatchers.Main' : 'Dispatchers.Main.immediate'}) {\n    println("B")\n}\nprintln("C")`);
            pressed(modeBtns, MODES.map(m => m[0]), mode);
            fill(); printed.replaceChildren(h('span', { class: 'flw-note' }, 'nothing printed yet'));
          }
          const print = (v, cls = 'ok') => {
            printed.querySelectorAll('.flw-note').forEach(n => n.remove());
            printed.append(h('span', { class: `flw-v drop-in ${cls}` }, v));
          };
          async function run() {
            if (busy) return; busy = true;
            try {
              fill(); printed.replaceChildren();
              const live = () => el.isConnected;
              print('A'); await sleep(450); if (!live()) return;
              if (mode === 'main') {
                const task = h('span', { class: 'flw-v acc drop-in' }, 'coroutine B');
                queue.append(task);
                say(o, 'launch posted the coroutine to the end of the queue and returned.');
                await sleep(550); if (!live()) return;
                print('C'); await sleep(450); if (!live()) return;
                for (const m of [...queue.children]) {
                  m.classList.add('acc'); await sleep(420); if (!live()) return;
                  if (m === task) print('B', 'acc');
                  m.remove(); await sleep(160); if (!live()) return;
                }
                say(o, '<span class="bad">A C B:</span> the coroutine waited behind the touch event and the frame. A state change in it would show one frame late.');
              } else {
                print('B', 'acc');
                say(o, 'Already on main, so immediate ran the coroutine in place, before launch returned.');
                await sleep(550); if (!live()) return;
                print('C'); await sleep(450); if (!live()) return;
                for (const m of [...queue.children]) { m.classList.add('acc'); await sleep(320); if (!live()) return; m.remove(); }
                say(o, '<span class="good">A B C:</span> no trip through the queue. The frame that follows already shows what B did.');
              }
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'Pick a dispatcher, then run the click handler.';
          el.append(h('div', { class: 'controls' }, modeBtns), snippet,
            h('div', { class: 'flw-cols' },
              h('div', { class: 'flw-col' }, h('span', { class: 'lane-name' }, 'main queue'), queue),
              h('div', { class: 'flw-col' }, h('span', { class: 'lane-name' }, 'printed'), printed)),
            h('div', { class: 'controls' }, cmd('run the click handler', run)), o);
        },
      },
      {
        title: 'Blocking calls on Default starve CPU work',
        body: `<p><code>Default</code> has one thread per CPU core, so only a few. A blocking file or socket read parks a thread without using the CPU. Put four of them on a four-core <code>Default</code> and every CPU task waits in the queue.</p>
<p><code>IO</code> allows up to 64 threads, so blocked threads are cheap there. Fill Default with blocking reads, then queue some parsing. Then try the reads on IO.</p>`,
        visual(el) {
          const POOLS = { def: { name: 'Default', size: 4, label: 'D' }, io: { name: 'IO', size: 8, label: 'IO' } };
          const DUR = { cpu: 1600, blk: 5200 };
          let warned = false;
          const o = out();
          const ui = {};
          const blocks = Object.entries(POOLS).map(([k, P]) => {
            P.slots = Array.from({ length: P.size }, (_, i) => {
              const bar = h('i'), what = h('span', {}, 'idle');
              const box = h('div', { class: 'flw-th' }, h('b', {}, `${P.label}-${i + 1}`), what, h('span', { class: 'flw-prog' }, bar));
              return { box, bar, what, task: null };
            });
            P.queue = [];
            P.qEl = h('div', { class: 'flw-strip flw-wrap' });
            ui[k] = P;
            return h('div', { class: 'flw-panel' },
              h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl(`Dispatchers.${P.name}`) }), h('span', { class: 'flw-badge' }, k === 'def' ? '4 cores' : '8 of 64 shown')),
              h('div', { class: 'flw-pool' }, P.slots.map(s => s.box)),
              h('span', { class: 'flw-note' }, 'queued'), P.qEl);
          });
          const paintQ = P => P.qEl.replaceChildren(...(P.queue.length ? P.queue.map(t => h('span', { class: `flw-v ${t.kind === 'cpu' ? 'acc' : 'bad'}` }, t.kind === 'cpu' ? 'parse' : 'read')) : [h('span', { class: 'flw-note' }, 'empty')]));
          function submit(k, kind, n) {
            const P = ui[k];
            if (P.queue.length + n > 12) { replay(P.qEl, 'shake'); say(o, '<span class="muted">full:</span> let the queue drain first, or press Reset.'); return false; }
            for (let i = 0; i < n; i++) P.queue.push({ kind, p: 0 });
            paintQ(P); return true;
          }
          const grid = h('div', { class: 'flw-duo' }, blocks);
          loop(grid, (now, dt) => {
            for (const P of Object.values(ui)) {
              let changed = false;
              for (const s of P.slots) {
                if (!s.task && P.queue.length) {
                  s.task = P.queue.shift(); changed = true;
                  s.box.className = `flw-th ${s.task.kind}`; s.what.textContent = s.task.kind === 'cpu' ? 'parse()' : 'blocked on read';
                  replay(s.box, 'pop-soft');
                }
                if (!s.task) continue;
                s.task.p = Math.min(1, s.task.p + dt / DUR[s.task.kind]);
                s.bar.style.width = s.task.p * 100 + '%';
                if (s.task.p >= 1) { s.task = null; s.box.className = 'flw-th'; s.what.textContent = 'idle'; s.bar.style.width = '0'; }
              }
              if (changed) paintQ(P);
            }
            const def = ui.def;
            if (!warned && def.queue.some(t => t.kind === 'cpu') && def.slots.every(s => s.task && s.task.kind === 'blk')) {
              warned = true;
              say(o, '<span class="bad">starved:</span> every Default thread is parked on a file read, so parse() waits even though the CPU is idle.');
            }
          });
          Object.values(ui).forEach(paintQ);
          o.innerHTML = 'Both pools are idle. Each button launches four coroutines. Fill Default with blocking reads, then queue some parsing.';
          el.append(
            h('div', { class: 'controls' },
              cmd('launch(Default) { readBlocking() }', () => { if (submit('def', 'blk', 4)) { warned = false; say(o, 'Four blocking reads went to Default. Each one parks a thread for seconds.'); } }),
              cmd('launch(Default) { parse() }', () => { if (submit('def', 'cpu', 4)) say(o, 'Four CPU tasks queued on Default.'); }),
              cmd('launch(IO) { readBlocking() }', () => { if (submit('io', 'blk', 4)) say(o, '<span class="good">IO:</span> the reads park IO threads instead. Default stays free for parse().'); })),
            grid, o);
        },
      },
      {
        title: 'Limit parallelism instead of making new pools',
        body: `<p>Sometimes you want at most one or a few coroutines at a time, for example writes to a file that is not thread safe. <code>limitedParallelism(n)</code> returns a view of an existing dispatcher that runs at most <code>n</code> tasks at once. It creates no new threads.</p>`,
        code: `class LogWriter(
    private val io: CoroutineDispatcher = Dispatchers.IO,
) {
    private val oneAtATime = io.limitedParallelism(1)   // serial, still on IO threads

    suspend fun append(line: String) = withContext(oneAtATime) {
        file.appendText(line + "\\n")
    }
}`,
      },
    ],
    underHood: {
      body: `<p>On Android, <code>Dispatchers.Main</code> wraps a <code>Handler</code> on the main <code>Looper</code>. Dispatching posts a <code>Runnable</code> to the main message queue. <code>Main.immediate</code> overrides <code>isDispatchNeeded</code> to return false when the current thread is already the main thread, so the coroutine just continues.</p>
<p><code>Default</code> and <code>IO</code> are two views over one shared scheduler. Default may run as many CPU tasks as there are cores. IO allows up to 64 blocking tasks (more on machines with more cores). Because the threads are shared, <code>withContext(Dispatchers.IO)</code> from Default often continues on the same thread with no real switch.</p>
<p><code>withContext</code> with the same dispatcher you are already on does not dispatch at all. It still checks for cancellation when the block ends.</p>`,
    },
    mistakes: [
      {
        title: 'Thread.sleep inside a coroutine',
        bad: `viewModelScope.launch {
    while (isActive) {
        refresh()
        Thread.sleep(30_000)   // blocks the main thread
    }
}`,
        good: `viewModelScope.launch {
    while (isActive) {
        refresh()
        delay(30_000)          // suspends, frees the thread
    }
}`,
        why: '<code>Thread.sleep</code> blocks the thread and ignores cancellation. On Main it freezes the UI and causes an ANR. <code>delay</code> frees the thread and can be cancelled.',
      },
      {
        title: 'Touching Views from inside withContext(IO)',
        bad: `lifecycleScope.launch {
    withContext(Dispatchers.IO) {
        val user = api.loadUserBlocking()
        binding.name.text = user.name     // wrong thread
    }
}`,
        good: `lifecycleScope.launch {
    val user = withContext(Dispatchers.IO) {
        api.loadUserBlocking()
    }
    binding.name.text = user.name         // back on Main
}`,
        why: 'Views may only be changed on the main thread, so this throws <code>CalledFromWrongThreadException</code>. Return the value from <code>withContext</code> and use it after the block.',
      },
      {
        title: 'Hard-coding Dispatchers.IO in a class',
        bad: `class ArticleRepository(private val api: ArticleApi) {
    suspend fun load() = withContext(Dispatchers.IO) {
        api.fetchBlocking()
    }
}`,
        good: `class ArticleRepository(
    private val api: ArticleApi,
    private val io: CoroutineDispatcher = Dispatchers.IO,
) {
    suspend fun load() = withContext(io) { api.fetchBlocking() }
}`,
        why: 'A hard-coded dispatcher runs on real threads in tests, out of reach of the test scheduler. Inject it, and pass a <code>StandardTestDispatcher(testScheduler)</code> in tests.',
      },
    ],
  };

  // ─── Promoted lessons: exceptions, cancellation, shared state ─────────────────
  // Step objects moved here from the structured-concurrency lesson.
  const superStep = {
        title: 'supervisorScope lets one child fail alone',
        body: `<p>In <code>coroutineScope</code>, one failing child cancels its siblings and the scope rethrows. Sometimes the children are independent. A broken badge count should not hide the posts.</p>
<p><code>supervisorScope</code> does not cancel the other children when one fails. A failed <code>async</code> keeps its exception until you call <code>await()</code>. A failed <code>launch</code> sends it to the <code>CoroutineExceptionHandler</code>, or crashes the app if there is none. This is why <code>viewModelScope</code> is built on a <code>SupervisorJob</code>.</p>`,
        code: `suspend fun loadProfile(): Profile = supervisorScope {
    val avatar = async { repo.avatar() }
    val posts = async { repo.posts() }
    val badges = async { repo.badges() }
    Profile(
        avatar = avatar.await(),
        posts = runCatching { posts.await() }.getOrDefault(emptyList()),
        badges = badges.await(),
    )
}`,
        visual(el) {
          const KIDS = [['avatar', 'async { avatar() }', 6500], ['posts', 'async { posts() }', 9000], ['badges', 'async { badges() }', 7500]];
          const MODES = [['scope', 'coroutineScope { }'], ['super', 'supervisorScope { }']];
          let mode = 'scope', busy = false, N = {}, failed = false;
          const wrap = h('div');
          const o = out();
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => {
            if (busy) return;
            mode = k; build();
            say(o, `<span class="muted">mode:</span> ${hl(src)}. Make posts() throw and watch its siblings.`);
          }));
          function build() {
            N = {}; failed = false;
            wrap.replaceChildren(h('div', { class: 'flw-tree' },
              flwTreeNode(N, 'root', mode === 'scope' ? 'coroutineScope' : 'supervisorScope', KIDS.map(([id, src]) => flwTreeNode(N, id, src)))));
            flwSetNode(N, 'root', 'run', 'waiting for children');
            KIDS.forEach(([id], i) => { flwSetNode(N, id, 'run', 'running'); N[id].p = 0.12 + i * 0.08; });
            pressed(modeBtns, MODES.map(m => m[0]), mode);
          }
          loop(wrap, (now, dt) => {
            if (!N.root || N.root.state !== 'run') return;
            let running = 0;
            for (const [id, , dur] of KIDS) {
              const n = N[id];
              if (n.state !== 'run') continue;
              running++;
              n.p = Math.min(1, n.p + dt / dur);
              n.bar.style.width = n.p * 100 + '%';
              if (n.p >= 1) { flwSetNode(N, id, 'done', 'returned'); replay(n.box, 'pop'); }
            }
            if (!running && !busy) {
              if (failed) {
                flwSetNode(N, 'root', 'caught', 'returned, posts empty'); replay(N.root.box, 'pop');
                say(o, '<span class="good">done:</span> avatar and badges finished. posts.await() threw inside runCatching, so the screen shows an empty post list instead of nothing.');
              } else {
                flwSetNode(N, 'root', 'done', 'returned'); replay(N.root.box, 'pop');
                say(o, '<span class="good">done:</span> all three children returned. Press run again, then make one fail.');
              }
            }
          });
          build();
          o.innerHTML = 'Three independent loads run under coroutineScope. Make posts() throw.';
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            wrap,
            h('div', { class: 'controls' },
              cmd('posts() throws IOException', async () => {
                if (busy) return;
                if (N.posts.state !== 'run') { replay(N.posts.box, 'shake'); say(o, '<span class="muted">no-op:</span> posts is not running. Press run again.'); return; }
                busy = true;
                try {
                  flwSetNode(N, 'posts', 'fail', 'IOException'); replay(N.posts.box, 'shake'); failed = true;
                  if (mode === 'super') {
                    say(o, '<span class="good">isolated:</span> supervisorScope left avatar and badges alone. The exception waits inside posts until someone calls await().');
                    return;
                  }
                  say(o, '<span class="bad">fail:</span> coroutineScope cancels the other children…');
                  for (const id of ['avatar', 'badges']) {
                    if (N[id].state !== 'run') continue;
                    await sleep(340); if (!wrap.isConnected) return;
                    flwSetNode(N, id, 'cancel', 'cancelled'); replay(N[id].box, 'shake');
                  }
                  await sleep(340); if (!wrap.isConnected) return;
                  flwSetNode(N, 'root', 'fail', 'rethrew IOException'); replay(N.root.box, 'shake');
                  say(o, '<span class="bad">fail:</span> avatar and badges were cancelled and their work was lost. The scope rethrew IOException to its caller.');
                } finally { busy = false; }
              }),
              cmd('run again', () => {
                if (busy) return;
                build();
                say(o, `<span class="muted">restarted:</span> three fresh children under ${mode === 'scope' ? 'coroutineScope' : 'supervisorScope'}.`);
              })),
            o);
        },
      };
  const cancelChecksStep = {
        title: 'Cancellation only lands where the code checks',
        body: `<p>Calling <code>cancel()</code> only marks a Job as cancelled. The coroutine notices the next time it suspends or checks. A loop that only does math never suspends, so it runs to the end and its result is thrown away.</p>
<p>Put <code>ensureActive()</code> or a <code>yield()</code> at the top of each iteration. The red stripes below are work done after the cancel, wasted CPU and battery.</p>`,
        code: `suspend fun resizeAll(photos: List<Photo>) = withContext(Dispatchers.Default) {
    for (photo in photos) {
        ensureActive()          // throws CancellationException once cancelled
        resize(photo)           // CPU only, never suspends
    }
}`,
        visual(el) {
          const DUR = 7000, CHECKS = 8;
          const lanes = [
            { key: 'plain', name: 'no checks', checks: false },
            { key: 'check', name: 'ensureActive()', checks: true },
          ];
          let busy = false;
          const o = out();
          const tl = h('div', { class: 'timeline' }, lanes.map(L => {
            L.run = h('span', { class: 'bar run', style: 'left:0;width:0' });
            L.waste = h('span', { class: 'bar block', style: 'left:0;width:0' });
            L.marks = L.checks ? Array.from({ length: CHECKS - 1 }, (_, i) => h('span', { class: 'flw-chk', style: `left:${((i + 1) / CHECKS) * 100}%` })) : [];
            L.st = h('span', { class: 'flw-note' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, L.name, h('br'), L.st), h('div', { class: 'lane-track' }, L.run, L.waste, L.marks));
          }));
          function start() {
            lanes.forEach(L => { L.p = 0; L.cancelAt = null; L.state = 'run'; L.st.textContent = 'running'; L.st.className = 'flw-note'; L.waste.style.width = '0'; });
          }
          loop(tl, (now, dt) => {
            for (const L of lanes) {
              if (L.state !== 'run' && L.state !== 'cancelling') continue;
              const before = L.p;
              L.p = Math.min(1, L.p + dt / DUR);
              if (L.state === 'cancelling' && L.checks) {
                const nextCheck = Math.ceil(before * CHECKS - 1e-9) / CHECKS;
                if (L.p >= nextCheck) {
                  L.p = nextCheck; L.state = 'stopped';
                  L.st.textContent = 'stopped at a check'; L.st.className = 'flw-note';
                  say(o, '<span class="good">stopped:</span> ensureActive() threw CancellationException at the next check. Only a sliver of work was wasted.');
                }
              }
              const cut = L.cancelAt == null ? L.p : L.cancelAt;
              L.run.style.width = cut * 100 + '%';
              if (L.cancelAt != null) { L.waste.style.left = L.cancelAt * 100 + '%'; L.waste.style.width = (L.p - L.cancelAt) * 100 + '%'; }
              if (L.p >= 1 && L.state !== 'stopped') {
                if (L.state === 'cancelling') {
                  L.state = 'wasted'; L.st.textContent = 'finished anyway'; L.st.className = 'flw-note warn';
                  say(o, '<span class="bad">wasted:</span> the loop without checks never noticed the cancel. It ran to the end, then its result was thrown away.');
                } else { L.state = 'done'; L.st.textContent = 'done'; }
              }
            }
          });
          start();
          o.innerHTML = 'Two copies of the same CPU loop are running. Cancel them both.';
          el.append(
            h('div', { class: 'controls' },
              cmd('job.cancel()', () => {
                if (busy) return;
                const live = lanes.filter(L => L.state === 'run');
                if (!live.length) { replay(tl, 'shake'); say(o, '<span class="muted">no-op:</span> nothing is running. Press start.'); return; }
                live.forEach(L => { L.state = 'cancelling'; L.cancelAt = L.p; L.st.textContent = 'cancel requested'; L.st.className = 'flw-note warn'; });
                say(o, '<span class="muted">cancel():</span> both Jobs are now marked cancelled. Watch which loop notices.');
              }),
              cmd('start', () => {
                if (lanes.some(L => L.state === 'run' || L.state === 'cancelling')) { replay(tl, 'shake'); say(o, '<span class="muted">busy:</span> wait until both loops have stopped.'); return; }
                start(); say(o, '<span class="muted">started:</span> two fresh loops.');
              })),
            tl,
            h('div', { class: 'legend' },
              h('span', {}, h('i', { class: 'bar run' }), 'useful work'),
              h('span', {}, h('i', { class: 'bar block' }), 'work after cancel'),
              h('span', {}, h('i', { class: 'flw-chk flw-chk-key' }), 'cancellation check')),
            o);
        },
      };

  // ─── Exception handling ─────────────────
  const exceptions = {
    id: 'exceptions',
    title: 'Exception handling in coroutines',
    tagline: 'Where an exception goes depends on the builder and on the parent.',
    level: 'advanced',
    body: `
<p>An exception that is not caught inside a coroutine does not stop there. It goes up the tree. A failed child reports to its parent. Under a normal <code>Job</code>, the parent cancels its other children and fails too. Under a <code>SupervisorJob</code>, like the one in <code>viewModelScope</code>, the parent ignores the failure, so the child has to deal with it alone.</p>
<p>The builder decides how the failure shows up. <code>launch</code> treats it as uncaught. At the top of the tree it goes to a <code>CoroutineExceptionHandler</code> if the context has one. If not, it goes to the thread’s uncaught exception handler, and an Android app crashes. <code>async</code> stores the exception in its <code>Deferred</code> and throws it when you call <code>await()</code>.</p>
<p>Your first tool is still a plain <code>try/catch</code> inside the coroutine, around the call that can fail. The handler is a last resort for logging. By the time it runs, the coroutine is already finished.</p>`,
    code: `class FeedViewModel(private val repo: FeedRepository) : ViewModel() {
    private val handler = CoroutineExceptionHandler { _, e ->
        Log.e("Feed", "unexpected failure", e)       // last resort: log it
    }

    fun refresh() {
        viewModelScope.launch(handler) {
            try {
                _state.value = UiState.Success(repo.feed())
            } catch (e: IOException) {               // expected: handle it here
                _state.value = UiState.Error("No connection")
            }
        }
    }

    suspend fun profile(): Profile = supervisorScope {
        val posts = async { repo.posts() }
        val badges = async { repo.badges() }
        val list = try { posts.await() } catch (e: IOException) { emptyList() }
        Profile(list, badges.await())
    }
}`,
    remember: 'launch: uncaught, goes up to the handler or crashes. async: kept until await(). Under a SupervisorJob each child handles its own failure.',
    terms: [
      { term: 'CoroutineExceptionHandler', def: 'A context element that receives uncaught exceptions from root coroutines and from direct children of a supervisor. It cannot recover the coroutine, only report.' },
      { term: 'SupervisorJob', def: 'A Job whose children can fail without cancelling it or their siblings. viewModelScope uses one.' },
      { term: 'Deferred', def: 'The result handle that async returns. It holds the value or the exception until await() is called.' },
      { term: 'Uncaught exception', def: 'A failure no try/catch handled and no parent took over. On Android it reaches the thread’s handler and crashes the app.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Load the home screen. If ads fail, show the news anyway.', code: `suspend fun loadHome(): Home = [[supervisorScope]] {
    val news = async { repo.news() }
    val ads = async { repo.ads() }
    val adList = try { ads.[[await]]() } catch (e: IOException) { emptyList() }
    Home(news.await(), adList)
}`, why: 'Under <code>supervisorScope</code> a failed ads call does not cancel news. Its exception waits in the Deferred, and <code>await()</code> throws it where you can catch it.' },
      { type: 'bug', prompt: 'When sync fails, the app crashes instead of showing “Sync failed”. Tap the bug.', code: `fun sync() {
    try {
        viewModelScope.launch { repo.sync() }
    } catch (e: IOException) {
        _error.value = "Sync failed"
    }
}`, bug: 2, fix: '        viewModelScope.launch { try { repo.sync() } catch (e: IOException) { _error.value = "Sync failed" } }', why: '<code>launch</code> returns at once, before <code>sync()</code> runs, so the outer try has nothing to catch. The exception is thrown later inside the coroutine. Catch it there.' },
    ],
    quiz: [
      { q: 'A <code>viewModelScope.launch { }</code> throws IOException. There is no try/catch and no handler. What happens?', options: ['Nothing, the coroutine just stops', 'The app crashes', 'viewModelScope retries it'], a: 1, why: 'The exception is uncaught. With no CoroutineExceptionHandler it goes to the thread’s uncaught exception handler, which crashes an Android app.' },
      { q: 'Inside <code>supervisorScope</code>, an <code>async</code> child throws and nobody calls <code>await()</code>. What happens to its siblings?', options: ['They keep running', 'They are cancelled', 'The scope rethrows at once'], a: 0, why: 'A supervisor does not cancel siblings, and async keeps its exception in the Deferred until await().' },
      { q: 'You pass a CoroutineExceptionHandler to a <code>launch</code> nested inside another <code>launch</code>. Is it used?', options: ['Yes, always', 'No, the child passes its failure to its parent', 'Only on the main thread'], a: 1, why: 'Children delegate exceptions to their parent, up to the root. Only the root’s handler (or one on a direct child of a supervisor) is used.' },
      { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">try {\n    viewModelScope.launch { throw IOException() }\n} catch (e: IOException) {\n    showError()\n}</pre>What happens?', options: ['showError() runs', 'showError() never runs, and with no handler the app crashes', 'viewModelScope ignores the exception'], a: 1, why: 'launch returns as soon as the coroutine starts, so the try has already finished when the exception is thrown. The uncaught failure goes to the thread’s handler.' },
      { q: 'A profile screen loads posts and a badge count in parallel. A broken badge count must not hide the posts. Which shape fits?', options: ['coroutineScope { } with a try/catch around badges.await()', 'supervisorScope { } with a try/catch around badges.await()', 'A CoroutineExceptionHandler on each async'], a: 1, why: 'In supervisorScope a failed child does not cancel its siblings, and the catch at await() handles it. Under coroutineScope the failed async still cancels the scope, and async ignores handlers.' },
    ],
    deeper: [
      superStep,
      {
        title: 'The handler only works at the top',
        body: `<p>A <code>CoroutineExceptionHandler</code> is only consulted where an exception has nowhere else to go: on a root coroutine, or on a coroutine launched directly in a supervisor scope. A handler on a nested child is never used, because the child passes its failure up to its parent.</p>
<p><code>async</code> ignores the handler too. It keeps the exception in its <code>Deferred</code>, so the place to deal with it is the <code>await()</code> call.</p>`,
        code: `val handler = CoroutineExceptionHandler { _, e -> Log.e("Sync", "failed", e) }

viewModelScope.launch(handler) {        // used: a direct child of a SupervisorJob
    launch(handler) {                   // not used here: the failure goes to the parent,
        repo.syncPhotos()               // and the outer launch's handler logs it
    }
}

viewModelScope.async(handler) {         // not used: async keeps the exception
    repo.syncNotes()                    // until someone calls await()
}`,
      },
      {
        title: 'Cancellation is not a failure',
        body: `<p>A coroutine that ends with a <code>CancellationException</code> was cancelled, not broken. Its parent is not cancelled, its siblings keep running, and no handler sees it. That is how <code>job.cancel()</code> can stop one child without touching the rest.</p>
<p>It is also why you should never turn a real failure into a <code>CancellationException</code>, or catch one and carry on. The tree would treat a broken job as a quiet stop, or keep a cancelled one running. The lesson Cancellation and timeouts covers this side.</p>`,
        code: `viewModelScope.launch {
    val upload = launch { uploader.upload(file) }
    val preview = launch { thumbnails.render(file) }
    upload.cancel()            // only upload stops; preview and the parent go on
}`,
      },
    ],
    mistakes: [
      {
        title: 'Wrapping launch in try/catch',
        bad: `try {
    viewModelScope.launch { repo.sync() }
} catch (e: IOException) {
    showError()
}`,
        good: `viewModelScope.launch {
    try {
        repo.sync()
    } catch (e: IOException) {
        showError()
    }
}`,
        why: '<code>launch</code> returns as soon as the coroutine is started. The exception is thrown later, inside the coroutine, where the outer try cannot see it.',
      },
      {
        title: 'Catching await() inside coroutineScope',
        bad: `coroutineScope {
    val posts = async { repo.posts() }
    val list = try { posts.await() } catch (e: IOException) { emptyList() }
    show(list)
}`,
        good: `supervisorScope {
    val posts = async { repo.posts() }
    val list = try { posts.await() } catch (e: IOException) { emptyList() }
    show(list)
}`,
        why: 'Under a plain Job the failed async also cancels its parent, so <code>coroutineScope</code> still fails even though you caught the exception at <code>await()</code>. Under a supervisor, the catch at <code>await()</code> is enough.',
      },
    ],
    visual(el) {
      const KIDS = [['news', 'news()'], ['posts', 'posts()'], ['badges', 'badges()']];
      const BUILDERS = [['launch', 'launch { }'], ['async', 'async { }']];
      const PARENTS = [['super', 'viewModelScope'], ['job', 'coroutineScope { }']];
      let builder = 'launch', parent = 'super', handler = false, busy = false, failed = false, held = false, N = {};
      const wrap = h('div');
      const dest = h('div', { class: 'flw-shown wait' });
      const o = out();
      const bBtns = BUILDERS.map(([k, src]) => cmd(src, () => { if (busy) return; builder = k; build(); say(o, `<span class="muted">builder:</span> each child is now ${hl(src)}. Make posts() throw.`); }));
      const pBtns = PARENTS.map(([k, src]) => cmd(src, () => { if (busy) return; parent = k; build(); say(o, k === 'super' ? '<span class="muted">parent:</span> viewModelScope, which has a SupervisorJob.' : '<span class="muted">parent:</span> coroutineScope, which has a plain Job.'); }));
      const sw = h('input', { type: 'checkbox', id: 'cox-ex-handler', onchange() { if (busy) { this.checked = handler; return; } handler = this.checked; build(); say(o, handler ? 'A CoroutineExceptionHandler is now in the context.' : 'No handler in the context.'); } });
      function build() {
        N = {}; failed = false; held = false;
        wrap.replaceChildren(h('div', { class: 'flw-tree' },
          flwTreeNode(N, 'root', parent === 'super' ? 'viewModelScope' : 'coroutineScope', KIDS.map(([id, f]) => flwTreeNode(N, id, `${builder} { ${f} }`)))));
        flwSetNode(N, 'root', 'run', parent === 'super' ? 'SupervisorJob' : 'Job');
        KIDS.forEach(([id], i) => { flwSetNode(N, id, 'run', 'running'); N[id].p = 0.15 + i * 0.1; });
        dest.className = 'flw-shown wait'; dest.textContent = 'No exception yet';
        pressed(bBtns, BUILDERS.map(b => b[0]), builder);
        pressed(pBtns, PARENTS.map(p => p[0]), parent);
      }
      loop(wrap, (now, dt) => {
        for (const [id] of KIDS) {
          const n = N[id];
          if (!n || n.state !== 'run') continue;
          n.p = Math.min(1, n.p + dt / 9000);
          n.bar.style.width = n.p * 100 + '%';
          if (n.p >= 1) { flwSetNode(N, id, 'done', 'returned'); replay(n.box, 'pop'); }
        }
      });
      const show = (cls, text) => { dest.className = 'flw-shown' + (cls ? ' ' + cls : ''); dest.textContent = text; replay(dest, 'pop'); };
      async function fail() {
        if (busy) return;
        if (failed) { replay(N.posts.box, 'shake'); say(o, '<span class="muted">already failed:</span> press reset to try another setup.'); return; }
        if (N.posts.state !== 'run') { replay(N.posts.box, 'shake'); say(o, '<span class="muted">too late:</span> posts already returned. Press reset.'); return; }
        busy = true; failed = true;
        try {
          flwSetNode(N, 'posts', 'fail', 'IOException'); replay(N.posts.box, 'shake');
          if (parent === 'job') {
            say(o, '<span class="bad">fail:</span> posts threw. A plain Job cancels the other children…');
            for (const id of ['news', 'badges']) {
              if (N[id].state !== 'run') continue;
              await sleep(340); if (!wrap.isConnected) return;
              flwSetNode(N, id, 'cancel', 'cancelled'); replay(N[id].box, 'shake');
            }
            await sleep(340); if (!wrap.isConnected) return;
            flwSetNode(N, 'root', 'fail', 'rethrows'); replay(N.root.box, 'shake');
            show('stale', 'coroutineScope rethrows IOException to its caller. Catch it there.');
            say(o, builder === 'async'
              ? `<span class="bad">no await() needed:</span> inside coroutineScope a failed async cancels its parent at once.${handler ? ' The handler was never asked: the error had a parent to go to.' : ''}`
              : `<span class="bad">fail:</span> the siblings were cancelled and the scope rethrew to the code that called it.${handler ? ' The handler was never asked: the error had a parent to go to.' : ''}`);
            return;
          }
          if (builder === 'async') {
            held = true; flwSetNode(N, 'posts', 'caught', 'holds IOException');
            show('wait', 'Kept in the Deferred. Nothing happens until someone calls await().');
            say(o, `<span class="good">isolated:</span> the supervisor left news and badges alone. async stored the exception.${handler ? ' async ignores the handler.' : ''} Now call await().`);
          } else if (handler) {
            show('', 'CoroutineExceptionHandler logged IOException. The app keeps running.');
            say(o, '<span class="good">handled:</span> the siblings kept running and the uncaught exception went to the handler. The posts coroutine is still over.');
          } else {
            show('stale', 'Uncaught: Thread.uncaughtExceptionHandler. The app crashes.');
            replay(wrap, 'shake');
            say(o, '<span class="bad">crash:</span> the supervisor did not cancel the siblings, but nobody handled the exception. On Android that ends the process.');
          }
        } finally { busy = false; }
      }
      function awaitIt() {
        if (busy) return;
        if (!held) {
          replay(dest, 'shake');
          say(o, builder === 'async' ? '<span class="muted">nothing waiting:</span> pick viewModelScope, make posts() throw, then await().' : '<span class="muted">no Deferred:</span> launch returns a Job, which has no await(). Pick async { }.');
          return;
        }
        held = false; flwSetNode(N, 'posts', 'fail', 'await() threw'); replay(N.posts.box, 'shake');
        show('stale', 'posts.await() throws IOException in the caller. A try/catch around it shows the error.');
        say(o, '<span class="good">surfaced:</span> await() rethrew the stored exception where the caller can catch it.');
      }
      build();
      o.innerHTML = 'Pick a builder and a parent, then make posts() throw. Where does the exception end up?';
      el.append(
        h('div', { class: 'controls' }, bBtns),
        h('div', { class: 'controls' }, pBtns),
        h('label', { class: 'switch', for: 'cox-ex-handler' }, sw, 'CoroutineExceptionHandler in the context'),
        wrap,
        h('div', { class: 'controls' }, cmd('posts() throws IOException', fail), cmd('posts.await()', awaitIt), cmd('reset', () => { if (busy) return; build(); say(o, '<span class="muted">reset:</span> three fresh children.'); })),
        dest, o);
    },
  };

  // ─── Cancellation and timeouts ─────────────────
  const cancellation = {
    id: 'cancellation',
    title: 'Cancellation and timeouts',
    tagline: 'cancel() only asks. The code has to check.',
    level: 'advanced',
    body: `
<p>Cancelling a coroutine is a request. <code>cancel()</code> marks the Job as cancelled, and the coroutine stops the next time it suspends or checks. Suspend functions from kotlinx.coroutines, like <code>delay()</code> and <code>withContext</code>, check for you. A loop of pure CPU work does not. Call <code>ensureActive()</code> or <code>yield()</code> inside it, or check <code>isActive</code>.</p>
<p>Cancellation travels as a <code>CancellationException</code>. It unwinds the code and runs <code>finally</code> blocks. It is not treated as a failure, so the parent is not cancelled and no handler sees it. That is why a broad <code>catch (e: Exception)</code> that swallows it keeps a cancelled coroutine running.</p>
<p>A timeout is cancellation on a clock. <code>withTimeout(ms)</code> cancels its block and throws <code>TimeoutCancellationException</code>. <code>withTimeoutOrNull(ms)</code> returns <code>null</code> instead, which is usually easier to handle.</p>`,
    code: `suspend fun resizeAll(photos: List<Photo>) = withContext(Dispatchers.Default) {
    for (photo in photos) {
        ensureActive()                 // throws CancellationException once cancelled
        resize(photo)                  // CPU only, never suspends
    }
}

suspend fun weatherOrCached(): Weather =
    withTimeoutOrNull(2_000) {         // null after 2 s, no exception
        api.weather()
    } ?: cache.lastWeather()`,
    remember: 'cancel() asks; suspend calls and ensureActive() listen. A timeout is just cancellation on a clock.',
    terms: [
      { term: 'Cooperative cancellation', def: 'A coroutine stops only at a suspension point or an explicit check, never in the middle of plain code.' },
      { term: 'ensureActive', def: 'Throws CancellationException if the current coroutine was cancelled, so CPU-only loops can stop promptly.' },
      { term: 'withTimeoutOrNull', def: 'Runs a block with a time limit and returns null if the limit is reached, instead of throwing.' },
      { term: 'NonCancellable', def: 'A Job that is always active. Used with withContext so suspending cleanup can run after cancellation.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Let the loop stop when cancelled, and give up on the network after 2 seconds.', code: `suspend fun checksum(files: List<File>): Long = withContext(Dispatchers.Default) {
    var sum = 0L
    for (f in files) {
        [[ensureActive|yield]]()
        sum += crc(f)
    }
    sum
}

val weather = [[withTimeoutOrNull]](2_000) { api.weather() } ?: cachedWeather`, why: '<code>ensureActive()</code> gives the loop a place to notice the cancel. <code>withTimeoutOrNull</code> returns null on timeout, so the elvis falls back to the cache.' },
      { type: 'bug', prompt: 'When the user leaves mid-upload, the upload is never marked as stopped. <code>markUploadStopped</code> is a suspend function. Tap the bug.', code: `viewModelScope.launch {
    try {
        uploader.upload(file)
    } finally {
        repo.markUploadStopped(file.id)
    }
}`, bug: 4, fix: '        withContext(NonCancellable) { repo.markUploadStopped(file.id) }', why: 'The coroutine is already cancelled when <code>finally</code> runs, so the suspend call throws CancellationException at once. <code>NonCancellable</code> lets the cleanup run.' },
    ],
    quiz: [
      { q: '<code>withTimeout(1_000) { api.load() }</code> runs inside <code>viewModelScope.launch</code> with no try/catch. The call takes 3 s. What happens?', options: ['The app crashes', 'The coroutine ends quietly as cancelled', 'It waits the full 3 s'], a: 1, why: 'TimeoutCancellationException is a CancellationException. launch treats it as a normal cancel: no crash, and no error shown either.' },
      { q: 'Which call inside a CPU loop lets cancellation stop it?', options: ['<code>Thread.sleep(1)</code>', '<code>ensureActive()</code>', '<code>println()</code>'], a: 1, why: '<code>ensureActive()</code> checks the Job and throws if it was cancelled. The others never look at the Job.' },
      { q: 'In the <code>finally</code> of a cancelled coroutine you call <code>delay(100)</code>. What happens?', options: ['It waits 100 ms', 'It throws CancellationException at once', 'It is skipped silently'], a: 1, why: 'The coroutine is cancelled, so any suspend call that checks throws at once. Wrap such cleanup in <code>withContext(NonCancellable)</code>.' },
      { q: 'A coroutine is waiting in <code>delay()</code> inside a try/finally. You call <code>job.cancel()</code>. Which order is right?', options: ['Job marked cancelled → delay throws CancellationException → finally runs → Job completes as cancelled', 'finally runs → Job marked cancelled → delay returns early → Job completes', 'delay finishes its wait → Job marked cancelled → finally runs'], a: 0, why: 'cancel() only marks the Job. The next suspension point, here the waiting delay, throws CancellationException, which unwinds the code and runs finally.' },
      { q: 'A coroutine is stuck in a blocking <code>BlockingQueue.take()</code> and ignores cancel(). Which fix lets cancel stop it?', options: ['Call ensureActive() before take()', 'Wrap the call in runInterruptible { }', 'Move it to Dispatchers.IO'], a: 1, why: 'runInterruptible interrupts the thread when the coroutine is cancelled, so the blocking call throws and the coroutine ends. ensureActive() only checks before the call starts.' },
    ],
    visual: cancelChecksStep.visual,
    deeper: [
      {
        title: 'withTimeout throws, withTimeoutOrNull returns null',
        body: `<p><code>withTimeout</code> throws <code>TimeoutCancellationException</code>, a kind of <code>CancellationException</code>. Inside a <code>launch</code> with no catch, the coroutine just ends as cancelled. Nothing crashes, but nothing shows an error either, and the spinner stays forever.</p>
<p><code>withTimeoutOrNull</code> returns <code>null</code> on timeout. Handle it with <code>?:</code> like any other missing value.</p>`,
        code: `viewModelScope.launch {
    _state.value = UiState.Loading
    val weather = withTimeoutOrNull(2_000) { api.weather() }
    _state.value = if (weather != null) UiState.Success(weather)
                   else UiState.Cached(cache.lastWeather())
}`,
        visual(el) {
          const LIMIT = 2000, MAX = 3000;
          const SPEEDS = [['fast', 'server answers in 1 s', 1000], ['slow', 'server answers in 3 s', 3000]];
          const MODES = [['throw', 'withTimeout(2_000)'], ['null', 'withTimeoutOrNull(2_000)']];
          let speed = 'slow', mode = 'throw', busy = false;
          const bar = h('span', { class: 'bar wait', style: 'left:0;width:0' });
          const track = h('div', { class: 'lane-track' }, bar, h('span', { class: 'flw-chk', style: `left:${(LIMIT / MAX) * 100}%` }));
          const screen = h('div', { class: 'flw-shown wait' }, 'Weather: not loaded');
          const o = out();
          const sBtns = SPEEDS.map(([k, label]) => cmd(label, () => { if (busy) return; speed = k; pressed(sBtns, SPEEDS.map(s => s[0]), k); }));
          const mBtns = MODES.map(([k, src]) => cmd(src, () => { if (busy) return; mode = k; pressed(mBtns, MODES.map(m => m[0]), k); }));
          async function run() {
            if (busy) return; busy = true;
            try {
              const ms = SPEEDS.find(s => s[0] === speed)[2];
              const stop = Math.min(ms, LIMIT);
              bar.className = 'bar wait'; bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth;
              bar.style.transition = `width ${stop}ms linear`; bar.style.width = (stop / MAX) * 100 + '%';
              screen.className = 'flw-shown wait'; screen.textContent = 'Loading…';
              say(o, `${hl(MODES.find(m => m[0] === mode)[1] + ' { api.weather() }')}`);
              await sleep(stop); if (!el.isConnected) return;
              if (ms <= LIMIT) {
                bar.className = 'bar run'; screen.className = 'flw-shown'; screen.textContent = 'Weather: 18°C, sunny'; replay(screen, 'pop');
                say(o, '<span class="good">in time:</span> the answer came before the deadline, so both versions just return it.');
              } else if (mode === 'throw') {
                bar.className = 'bar block'; replay(track, 'shake'); screen.className = 'flw-shown stale'; screen.textContent = 'Loading… (forever)';
                say(o, '<span class="bad">silent:</span> TimeoutCancellationException is a CancellationException, so launch ended quietly as cancelled. No crash, no error, and the spinner never stops.');
              } else {
                bar.className = 'bar block'; screen.className = 'flw-shown'; screen.textContent = 'Weather: 17°C (cached)'; replay(screen, 'pop');
                say(o, '<span class="good">handled:</span> the block was cancelled at 2 s and withTimeoutOrNull returned null. The ?: branch showed the cached weather.');
              }
            } finally { busy = false; }
          }
          pressed(sBtns, SPEEDS.map(s => s[0]), speed); pressed(mBtns, MODES.map(m => m[0]), mode);
          o.innerHTML = 'The dashed line is the 2 s deadline. Pick a server speed and a timeout function, then run.';
          el.append(h('div', { class: 'controls' }, sBtns), h('div', { class: 'controls' }, mBtns),
            h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'api.weather()'), track)),
            h('div', { class: 'controls' }, cmd('viewModelScope.launch { … }', run)), screen, o);
        },
      },
      {
        title: 'Cleanup that suspends needs NonCancellable',
        body: `<p>A cancelled coroutine still runs its <code>finally</code> blocks. But it is already cancelled, so a suspend call inside <code>finally</code> throws <code>CancellationException</code> at once and the cleanup never happens.</p>
<p>Wrap suspending cleanup in <code>withContext(NonCancellable)</code>. Keep that block short, because nothing can cancel it. Use it only with <code>withContext</code>. <code>launch(NonCancellable)</code> cuts the coroutine out of the tree.</p>`,
        code: `viewModelScope.launch {
    try {
        uploader.upload(file)
    } finally {
        withContext(NonCancellable) {
            repo.markUploadStopped(file.id)   // a suspend call, safe here
        }
    }
}`,
        visual(el) {
          let wrapIt = false, busy = false, running = false;
          const sw = h('input', { type: 'checkbox', id: 'cox-nc-wrap', onchange() { if (busy || running) { this.checked = wrapIt; return; } wrapIt = this.checked; paint(); } });
          const src = h('div', { class: 'kt' });
          const bar = h('i');
          const row = h('div', { class: 'flw-shown wait' }, 'uploads table: photo.jpg = idle');
          const o = out();
          const paint = () => { src.innerHTML = hl(`} finally {\n${wrapIt ? '    withContext(NonCancellable) {\n        repo.markUploadStopped(id)\n    }' : '    repo.markUploadStopped(id)'}\n}`); };
          function start() {
            if (busy || running) { say(o, '<span class="muted">already uploading.</span> Leave the screen to cancel it.'); return; }
            running = true;
            bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width 8000ms linear'; bar.style.width = '100%';
            row.className = 'flw-shown wait'; row.textContent = 'uploads table: photo.jpg = uploading';
            say(o, 'Uploading. Now leave the screen before it finishes.');
          }
          async function leave() {
            if (busy) return;
            if (!running) { replay(row, 'shake'); say(o, '<span class="muted">nothing to cancel.</span> Start the upload first.'); return; }
            busy = true; running = false;
            try {
              const w = getComputedStyle(bar).width; bar.style.transition = 'none'; bar.style.width = w;
              say(o, 'viewModelScope was cancelled. The upload stops and finally runs…');
              await sleep(700); if (!el.isConnected) return;
              if (wrapIt) {
                row.className = 'flw-shown'; row.textContent = 'uploads table: photo.jpg = stopped'; replay(row, 'pop');
                say(o, '<span class="good">cleaned up:</span> inside NonCancellable the suspend call ran to the end.');
              } else {
                row.className = 'flw-shown stale'; row.textContent = 'uploads table: photo.jpg = uploading (wrong)'; replay(row, 'shake');
                say(o, '<span class="bad">skipped:</span> markUploadStopped() threw CancellationException at its first suspension. The row still says uploading.');
              }
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'Start an upload, then leave the screen halfway.';
          el.append(h('label', { class: 'switch', for: 'cox-nc-wrap' }, sw, 'wrap cleanup in withContext(NonCancellable)'), src,
            h('span', { class: 'flw-prog' }, bar),
            h('div', { class: 'controls' }, cmd('uploader.upload(file)', start), cmd('leave the screen', leave)), row, o);
        },
      },
      {
        title: 'Blocking calls ignore cancel: runInterruptible',
        body: `<p>A blocking Java call, like <code>BlockingQueue.take()</code> or an old SDK method, never checks the Job. Cancelling the coroutine leaves the thread stuck until the call returns on its own.</p>
<p><code>runInterruptible</code> runs the block so that cancellation interrupts the thread. The blocking call throws <code>InterruptedException</code>, and <code>runInterruptible</code> turns it into a <code>CancellationException</code>. It only helps with calls that respond to thread interrupts.</p>`,
        code: `suspend fun <T> BlockingQueue<T>.awaitTake(): T =
    runInterruptible(Dispatchers.IO) {
        take()          // interrupted when the coroutine is cancelled
    }`,
      },
    ],
    mistakes: [
      {
        title: 'withTimeout that fails silently',
        bad: `viewModelScope.launch {
    _state.value = UiState.Loading
    val w = withTimeout(2_000) { api.weather() }
    _state.value = UiState.Success(w)
}`,
        good: `viewModelScope.launch {
    _state.value = UiState.Loading
    val w = withTimeoutOrNull(2_000) { api.weather() }
    _state.value = if (w != null) UiState.Success(w) else UiState.Error("Too slow")
}`,
        why: 'The timeout throws a CancellationException, so the coroutine ends quietly. The state stays Loading forever. <code>withTimeoutOrNull</code> gives you a value to react to.',
      },
      {
        title: 'launch(NonCancellable) to make work survive',
        bad: `fun save(note: Note) {
    viewModelScope.launch(NonCancellable) { repo.save(note) }
}`,
        good: `class NotesRepository(private val externalScope: CoroutineScope) {
    suspend fun save(note: Note) {
        externalScope.launch { dao.insert(note) }.join()
    }
}`,
        why: '<code>NonCancellable</code> passed to a builder cuts the parent-child link: the parent no longer waits for it and is not told if it fails. For work that must outlive the screen, use a longer-lived scope.',
      },
    ],
  };

  // ─── Shared mutable state ─────────────────
  const sharedState = {
    id: 'shared-state',
    title: 'Shared mutable state',
    tagline: 'Two coroutines, one variable: lock it, make it atomic, or keep it on one thread.',
    level: 'advanced',
    body: `
<p>Coroutines on <code>Dispatchers.Default</code> or <code>IO</code> run on several threads at once. If two of them change the same variable, updates get lost. <code>count++</code> is three steps: read, add, write. Two threads can read the same old value, and the second write overwrites the first.</p>
<p>There are three fixes. A <code>Mutex</code> lets one coroutine at a time into a block, and the others suspend while they wait instead of blocking a thread. An atomic like <code>AtomicInteger</code> does the read, add and write as one step. It is the fastest fix for a single value but hard to use for bigger state. <b>Confinement</b> keeps every change on one thread, for example the main thread or <code>Dispatchers.Default.limitedParallelism(1)</code>.</p>
<p><code>@Volatile</code> is not a fix. It makes each read and write visible to other threads, but <code>count++</code> is still three steps. For UI state in a <code>MutableStateFlow</code>, use <code>update { }</code>, which applies your change atomically.</p>`,
    code: `class DownloadStats {
    private val mutex = Mutex()
    private var bytes = 0L
    private val names = mutableListOf<String>()

    suspend fun record(name: String, size: Long) = mutex.withLock {
        bytes += size          // both changes happen together,
        names += name          // so nobody sees one without the other
    }
}

val finished = AtomicInteger(0)     // a single counter: an atomic is enough

suspend fun downloadAll(urls: List<String>) = coroutineScope {
    for (url in urls) launch(Dispatchers.IO) {
        val file = download(url)
        stats.record(file.name, file.size)
        finished.incrementAndGet()
    }
}`,
    remember: 'Shared and mutable across threads? Mutex for a block, an atomic for one value, confinement to keep it on one thread.',
    terms: [
      { term: 'Race condition', def: 'A bug where the result depends on how threads happen to interleave, like two count++ calls that both read the old value.' },
      { term: 'Mutex', def: 'A kotlinx.coroutines lock. withLock lets one coroutine at a time run a block; waiters suspend instead of blocking. It is not reentrant.' },
      { term: 'Atomic operation', def: 'A read-modify-write that happens as one indivisible step, like AtomicInteger.incrementAndGet().' },
      { term: 'Thread confinement', def: 'Making sure a piece of state is only ever touched from one thread, so no lock is needed.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make the cache safe when several coroutines write at once.', code: `private val mutex = [[Mutex]]()
private var cache: Map<String, User> = emptyMap()

suspend fun put(user: User) = mutex.[[withLock]] {
    cache = cache + (user.id to user)
}`, why: '<code>withLock</code> lets one coroutine at a time read and replace the map, so no write is lost.' },
      { type: 'bug', prompt: 'Tapping Add quickly on several items sometimes loses one from the cart. Tap the bug.', code: `private val _state = MutableStateFlow(CartState())

fun add(item: Item) {
    viewModelScope.launch(Dispatchers.Default) {
        _state.value = _state.value.copy(items = _state.value.items + item)
    }
}`, bug: 4, fix: '        _state.update { it.copy(items = it.items + item) }', why: 'Two coroutines can read the same old state and each write their own copy, so one item is lost. <code>update</code> retries until its change applies to the latest value.' },
    ],
    quiz: [
      { q: 'Two coroutines on <code>Dispatchers.Default</code> each run <code>counter++</code> 1,000 times on a plain <code>var</code>. What is the result?', options: ['Always 2,000', 'Often less than 2,000', 'Always 1,000'], a: 1, why: 'counter++ is read, add, write. When two threads interleave those steps, one increment overwrites the other.' },
      { q: 'Does marking the counter <code>@Volatile</code> fix it?', options: ['Yes', 'No'], a: 1, why: 'Volatile makes each read and write visible, but the read and the write are still two separate steps.' },
      { q: 'Which one waits for the lock without blocking a thread?', options: ['<code>synchronized</code>', '<code>ReentrantLock.lock()</code>', '<code>Mutex.lock()</code>'], a: 2, why: '<code>Mutex.lock()</code> is a suspend function. The other two park the thread while they wait.' },
      { q: 'Two coroutines on Dispatchers.Default each run <code>_state.value = _state.value.copy(count = _state.value.count + 1)</code>. Some increments are lost. Which change fixes it?', options: ['<code>_state.update { it.copy(count = it.count + 1) }</code>', 'Mark _state with @Volatile', 'Switch the coroutines to Dispatchers.IO'], a: 0, why: 'Reading value and then writing it is two steps. update { } applies the change atomically and reruns the lambda if the value changed in between.' },
      { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">suspend fun save() = mutex.withLock { write() }\n\nsuspend fun saveAll() = mutex.withLock {\n    save()\n}</pre>What happens when you call saveAll()?', options: ['It works, the same coroutine may lock twice', 'It waits forever inside save()', 'save() runs without the lock'], a: 1, why: 'A Mutex is not reentrant. The inner withLock waits for the lock that saveAll already holds, so it never gets it.' },
    ],
    deeper: [
      {
        title: 'Mutex suspends, synchronized blocks',
        body: `<p>In plain Java you would reach for <code>synchronized</code> or a <code>ReentrantLock</code>. Both block the waiting thread. In coroutines that wastes a thread from a small pool, or freezes the UI if it happens on Main.</p>
<p><code>Mutex.lock()</code> is a suspend function, so a waiting coroutine frees its thread. Always use <code>withLock</code>, which unlocks in a <code>finally</code> even when the block throws.</p>`,
        code: `private val mutex = Mutex()

suspend fun refreshToken(old: String): String = mutex.withLock {
    if (token != old) return@withLock token   // someone else already refreshed
    token = api.refresh(old)                  // a suspend call: fine inside withLock
    token
}`,
      },
      {
        title: 'MutableStateFlow: update, not value = value.copy()',
        body: `<p><code>_state.value = _state.value.copy(...)</code> reads, then writes. Two coroutines on different threads can read the same old state, and the second write drops the first change.</p>
<p><code>update { }</code> applies the change atomically. If the value changed while your lambda ran, it runs the lambda again on the new value. So the lambda may run more than once: keep it free of side effects. The State machine lesson in Design patterns shows this race step by step.</p>`,
        code: `private val _state = MutableStateFlow(CartState())

fun add(item: Item) {
    _state.update { it.copy(items = it.items + item) }   // safe from any thread
}`,
      },
      {
        title: 'Confinement: one thread owns the state',
        body: `<p>If only one thread ever touches the state, there is nothing to lock. A ViewModel that changes its state only from <code>viewModelScope</code> code running on Main is already confined.</p>
<p>Off the main thread, <code>limitedParallelism(1)</code> gives you a view of a dispatcher that runs one task at a time. Run the whole job inside it, not each tiny step. Switching for every increment works but is slow.</p>`,
        code: `private val counterContext = Dispatchers.Default.limitedParallelism(1)
private var count = 0

suspend fun countWords(lines: List<String>) = withContext(counterContext) {
    for (line in lines) count += line.split(' ').size   // one task at a time
}`,
      },
    ],
    mistakes: [
      {
        title: '@Volatile on a counter',
        bad: `@Volatile var finished = 0

launch(Dispatchers.IO) { download(url); finished++ }`,
        good: `val finished = AtomicInteger(0)

launch(Dispatchers.IO) { download(url); finished.incrementAndGet() }`,
        why: 'Volatile makes reads and writes visible across threads but does not make <code>++</code> a single step, so increments are still lost.',
      },
      {
        title: 'Calling withLock inside withLock',
        bad: `suspend fun save(item: Item) = mutex.withLock {
    items += item
    trim()                       // trim() also calls mutex.withLock
}`,
        good: `suspend fun save(item: Item) = mutex.withLock {
    items += item
    trimLocked()                 // assumes the caller holds the lock
}`,
        why: 'A Mutex is not reentrant. The inner <code>withLock</code> waits for a lock its own coroutine holds, so it waits forever.',
      },
    ],
    visual(el) {
      const MODES = [
        ['plain', 'var count', [['A', 'read 5', '', 5], ['B', 'read 5', '', 5], ['A', 'write 6', 'acc', 6], ['B', 'write 6', 'bad', 6]]],
        ['mutex', 'mutex.withLock { }', [['A', 'lock', 'ok'], ['B', 'lock: suspends', 'warn'], ['A', 'read 5', '', 5], ['A', 'write 6', 'acc', 6], ['A', 'unlock', 'ok'], ['B', 'gets lock', 'ok'], ['B', 'read 6', '', 6], ['B', 'write 7', 'acc', 7], ['B', 'unlock', 'ok']]],
        ['atomic', 'AtomicInteger', [['A', 'incrementAndGet → 6', 'acc', 6], ['B', 'incrementAndGet → 7', 'acc', 7]]],
        ['confined', 'limitedParallelism(1)', [['B', 'queued', 'warn'], ['A', 'read 5', '', 5], ['A', 'write 6', 'acc', 6], ['B', 'read 6', '', 6], ['B', 'write 7', 'acc', 7]]],
      ];
      let mode = 'plain', busy = false;
      const counter = h('span', { class: 'flw-badge' }, 'count = 5');
      const lanes = { A: h('div', { class: 'flw-strip flw-wrap' }), B: h('div', { class: 'flw-strip flw-wrap' }) };
      const o = out();
      const o2 = out('Then run the big version: 3 coroutines, 1,000 increments each.');
      const btns = MODES.map(([k, label]) => cmd(label, () => { if (busy) return; mode = k; clear(); pressed(btns, MODES.map(m => m[0]), k); say(o, `<span class="muted">mode:</span> ${hl(label)}. Run count++ on two threads.`); }));
      function clear() {
        counter.textContent = 'count = 5'; counter.className = 'flw-badge';
        Object.values(lanes).forEach(l => l.replaceChildren(h('span', { class: 'flw-note' }, 'idle')));
      }
      async function race() {
        if (busy) return; busy = true;
        try {
          clear(); Object.values(lanes).forEach(l => l.replaceChildren());
          const steps = MODES.find(m => m[0] === mode)[2];
          for (const [who, text, cls, val] of steps) {
            lanes[who].append(h('span', { class: `flw-v drop-in ${cls}` }, text));
            if (text.startsWith('write') || text.startsWith('increment')) { counter.textContent = `count = ${val}`; replay(counter, 'pop'); }
            await sleep(620); if (!el.isConnected) return;
          }
          const final = steps.filter(s => s[3] != null).pop()[3];
          counter.className = 'flw-badge';
          if (final === 7) say(o, `<span class="good">7:</span> ${mode === 'mutex' ? 'B waited, suspended, until A unlocked, then read the new value.' : mode === 'atomic' ? 'each increment was one indivisible step, so neither could interleave.' : 'one thread ran A, then B. They could never overlap.'}`);
          else { replay(counter, 'shake'); say(o, '<span class="bad">6, not 7:</span> both read 5 before either wrote. B’s write overwrote A’s, and one increment was lost.'); }
        } finally { busy = false; }
      }
      async function big() {
        if (busy) return; busy = true;
        try {
          say(o2, `${hl('repeat(3) { launch(Dispatchers.Default) { repeat(1_000) { count++ } } }')}`);
          await sleep(700); if (!el.isConnected) return;
          const res = mode === 'plain' ? 3000 - (150 + Math.floor(Math.random() * 900)) : 3000;
          say(o2, res === 3000
            ? `<span class="good">3000</span> every time with ${hl(MODES.find(m => m[0] === mode)[1])}.`
            : `<span class="bad">${res}</span>, not 3000. Run it again and you get a different number. That is a race.`);
        } finally { busy = false; }
      }
      clear(); pressed(btns, MODES.map(m => m[0]), mode);
      o.innerHTML = 'Two coroutines on different threads both run count++. It starts at 5.';
      el.append(h('div', { class: 'controls' }, btns),
        h('div', { class: 'flw-search' },
          h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'shared'), h('div', {}, counter)),
          h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'thread A'), lanes.A),
          h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'thread B'), lanes.B)),
        h('div', { class: 'controls' }, cmd('both run count++ at once', race), cmd('3 × 1,000 increments', big)),
        o, o2);
    },
  };

  Lab.addTrack({
    id: 'coroutines',
    title: 'Coroutines',
    description: 'How coroutines suspend without blocking, live in a cancellable tree, fail and time out safely, switch threads, share state and pass values through channels.',
    group: 'Building apps', requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'basics',
        title: 'Coroutine basics',
        tagline: 'Suspend the work, not the thread.',
        body: `
<p>A coroutine is a piece of work that can pause and pick up again later. When it reaches a <code>suspend</code> function like <code>delay()</code> or a network call, it steps aside and the thread runs other work in the meantime.</p>
<p><code>launch</code> starts a coroutine that runs alongside the code around it. <code>delay()</code> <em>suspends</em>: the coroutine waits, the thread stays free. <code>Thread.sleep()</code> <em>blocks</em>: the thread itself is stuck and nothing else can run on it.</p>
<p>On Android this matters because the main thread draws the UI. Block it and the app freezes. Suspend instead and the UI stays smooth. Play both versions below and compare the main thread lane.</p>`,
        code: `fun main() = runBlocking {
    launch {
        delay(800)          // A suspends, the thread is free
        println("A done")
    }
    launch {
        delay(400)
        println("B done")
    }
    println("Started")
}
// Started, B done, A done   (about 800 ms in total)`,
        remember: 'suspend pauses the coroutine, not the thread. delay() suspends; Thread.sleep() blocks.',
        level: 'intermediate',
        terms: [
          { term: 'Coroutine', def: 'A unit of work that can suspend and resume later without holding a thread while it waits.' },
          { term: 'suspend', def: 'Marks a function that can pause the calling coroutine. It can only be called from a coroutine or another suspend function.' },
          { term: 'launch', def: 'Starts a new coroutine in a scope and returns a Job, without waiting for a result.' },
          { term: 'delay', def: 'Suspends the coroutine for a time without blocking its thread, unlike Thread.sleep.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this function able to wait without blocking.', code: '[[suspend]] fun loadUser(id: Int): User {\n    [[delay]](300)   // simulated latency\n    return api.user(id)\n}', why: 'Only a <code>suspend</code> function can call <code>delay</code>, which pauses the coroutine and leaves the thread free.' },
          { type: 'bug', prompt: 'The UI freezes for two seconds. Tap the line that causes it.', code: 'viewModelScope.launch {\n    showSpinner()\n    Thread.sleep(2000)\n    hideSpinner()\n}', bug: 2, fix: '    delay(2000)', why: '<code>viewModelScope</code> runs on the main thread. <code>Thread.sleep</code> blocks it, so nothing can draw. <code>delay</code> suspends instead.' },
        ],
        quiz: [
          { q: 'What does the code above print, in order?', options: ['Started, A done, B done', 'Started, B done, A done', 'A done, B done, Started'], a: 1, why: '"Started" runs first. B’s 400 ms delay ends before A’s 800 ms.' },
          { q: 'Replace both <code>delay()</code> calls with <code>Thread.sleep()</code>. Total time is about', options: ['800 ms', '1200 ms', '400 ms'], a: 1, why: 'Sleep holds the only thread, so A and B run one after another: 800 + 400.' },
          { q: 'Inside a coroutine on Android’s main thread, which one keeps the UI responsive?', options: ['<code>delay(1000)</code>', '<code>Thread.sleep(1000)</code>'], a: 0, why: '<code>delay</code> suspends and frees the main thread to keep drawing.' },
          { q: 'Inside one coroutine you write <code>val news = api.news()</code> and then <code>val weather = api.weather()</code>. Each call takes 1 s. How long until both are ready?', options: ['About 1 s, suspend calls run in parallel', 'About 2 s, they run one after the other', 'It depends on the dispatcher'], a: 1, why: 'Code inside a coroutine is sequential by default. To overlap them, start each with async and await() both, so the total is the slowest call.' },
        ],
        deeper: [
          {
            title: 'Sequential by default, concurrent when you ask',
            body: `<p>Inside a coroutine, code runs top to bottom. Two suspend calls in a row run one after the other, even when they don’t depend on each other.</p>
<p>To run them at the same time, start each one with <code>async</code> and <code>await()</code> the results. The total time becomes the slowest call, not the sum. Wrap them in <code>coroutineScope</code> so a failure in one cancels the other.</p>`,
            visual(el) {
              const modes = {
                seq: {
                  label: 'one after another', total: 1060,
                  src: 'val user = api.user()       // 600 ms\nval orders = api.orders()   // 400 ms\nshow(user, orders)',
                  bars: [['user', 0, 600], ['orders', 600, 1000]],
                  note: 'About 1000 ms: orders() didn’t start until user() returned.',
                },
                par: {
                  label: 'async + await', total: 1060,
                  src: 'coroutineScope {\n    val user = async { api.user() }\n    val orders = async { api.orders() }\n    show(user.await(), orders.await())\n}',
                  bars: [['user', 0, 600], ['orders', 0, 400]],
                  note: 'About 600 ms: both requests ran at the same time, so you wait only for the slower one.',
                },
              };
              let mode = 'seq', busy = false, bars = [], cursors = [];
              const src = h('div', { class: 'kt' });
              const tl = h('div', { class: 'timeline' });
              const clock = h('span', { class: 'clock' }, '0 ms');
              const o = out();
              const buttons = Object.keys(modes).map(k => cmd(modes[k].label, () => { if (busy) return; mode = k; play(); }));
              const end = m => Math.max(...m.bars.map(b => b[2]));
              function setup() {
                const m = modes[mode];
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(modes)[i] === mode));
                src.innerHTML = hl(m.src);
                bars = []; cursors = [];
                const lane = (name, list) => {
                  const track = h('div', { class: 'lane-track' });
                  for (const [start, stop, kind] of list) {
                    const b = h('span', { class: `bar ${kind}`, style: `left:${(start / m.total) * 100}%;width:0` });
                    track.append(b); bars.push({ el: b, start, end: stop });
                  }
                  const c = h('span', { class: 'cursor' }); track.append(c); cursors.push(c);
                  return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track);
                };
                const done = end(m);
                tl.replaceChildren(
                  ...m.bars.map(([n, s, e]) => lane(`${n}()`, [[s, e, 'wait']])),
                  lane('show()', [[done, Math.min(done + 30, m.total), 'run']]));
              }
              function draw(t) {
                const m = modes[mode];
                for (const b of bars) b.el.style.width = (Math.max(0, Math.min(t, b.end) - b.start) / m.total) * 100 + '%';
                cursors.forEach(c => { c.style.left = (Math.min(t, m.total) / m.total) * 100 + '%'; });
                clock.textContent = Math.round(Math.min(t, end(m))) + ' ms';
              }
              function play() {
                if (busy) return; busy = true; setup();
                say(o, 'Running...');
                const m = modes[mode], t0 = performance.now(), stopAt = end(m) + 30;
                const tick = now => {
                  if (!tl.isConnected) return;
                  const t = Math.min((now - t0) / 2, stopAt);
                  draw(t);
                  if (t < stopAt) requestAnimationFrame(tick);
                  else { say(o, m.note); busy = false; }
                };
                requestAnimationFrame(tick);
              }
              setup(); draw(end(modes.seq) + 30); say(o, modes.seq.note);
              el.append(
                h('div', { class: 'controls' }, buttons, clock),
                src, tl,
                h('div', { class: 'legend' },
                  h('span', {}, h('i', { class: 'bar wait' }), 'waiting on the network (suspended)'),
                  h('span', {}, h('i', { class: 'bar run' }), 'show() runs')),
                o);
            },
          },
          {
            title: 'Every coroutine needs an owner',
            body: `<p>Launch coroutines in a scope that matches the work’s lifetime. <code>viewModelScope</code> cancels its coroutines when the ViewModel is cleared, and <code>lifecycleScope</code> when the Activity or Fragment is destroyed. Nothing keeps running after the screen is gone.</p>
<p>This idea is called structured concurrency. The next lessons in this track cover scopes, jobs and dispatchers in depth.</p>`,
            code: `class ProfileViewModel(private val repo: ProfileRepo) : ViewModel() {
    fun refresh() {
        viewModelScope.launch {          // cancelled in onCleared()
            val profile = repo.load()
            _state.value = profile
        }
    }
}`,
          },
        ],
        underHood: {
          body: `<p>The compiler rewrites every <code>suspend</code> function. It adds a hidden last parameter, a <code>Continuation</code>, and changes the return type to <code>Any?</code>. The function can now return either its result or a special marker, <code>COROUTINE_SUSPENDED</code>, which means “I paused, I’ll call you back”.</p>
<p>The body becomes a state machine. Each suspension point gets a number (a <code>label</code>). Before pausing, the function saves its local variables and the label into a continuation object. When the awaited work finishes, it calls <code>continuation.resumeWith(result)</code>, which calls the function again. The function reads the label and jumps straight to where it left off. No thread waits during the pause.</p>`,
          code: `// suspend fun load(): User {
//     val token = auth()          // suspension point 1
//     return api.user(token)      // suspension point 2
// }
// becomes, simplified:
fun load(cont: Continuation<User>): Any? {
    val sm = cont as? LoadStateMachine ?: LoadStateMachine(cont)
    when (sm.label) {
        0 -> {
            sm.label = 1
            val r = auth(sm)
            if (r === COROUTINE_SUSPENDED) return r
            sm.token = r as String        // came back right away
        }
        1 -> sm.token = sm.result as String   // resumed later
    }
    return api.user(sm.token, sm)   // label 2 works the same way
}`,
        },
        mistakes: [
          { title: 'Swallowing cancellation', bad: 'viewModelScope.launch {\n    try {\n        _state.value = repo.load()\n    } catch (e: Exception) {\n        _error.value = "Failed"\n    }\n}', good: 'viewModelScope.launch {\n    try {\n        _state.value = repo.load()\n    } catch (e: CancellationException) {\n        throw e\n    } catch (e: Exception) {\n        _error.value = "Failed"\n    }\n}', why: 'Cancellation travels as a <code>CancellationException</code>. Catching every <code>Exception</code> stops it, so a cancelled coroutine carries on and may show a false error. Rethrow it.' },
          { title: 'Launching in GlobalScope', bad: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    GlobalScope.launch { poll(api) }\n}', good: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    lifecycleScope.launch { poll(api) }\n}', why: '<code>GlobalScope</code> has no owner, so the work keeps running after the Activity is gone and can leak it. A lifecycle-bound scope cancels it for you.' },
          { title: 'runBlocking on the main thread', bad: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    val user = runBlocking { repo.load() }\n    show(user)\n}', good: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    lifecycleScope.launch { show(repo.load()) }\n}', why: '<code>runBlocking</code> blocks the calling thread until the work ends. On the main thread that freezes the UI and can trigger an ANR. It belongs in tests and <code>main()</code>.' },
        ],
        visual(el) {
          const modes = {
            delay: {
              label: 'delay()', total: 880,
              snippet: 'launch { delay(800); println("A done") }\nlaunch { delay(400); println("B done") }\nprintln("Started")',
              note: 'About 800 ms in total. While A and B were suspended, the main thread was free for other work.',
              bars: [['main', 'run', 0, 40], ['A', 'run', 20, 30], ['A', 'wait', 30, 800], ['B', 'run', 30, 40], ['B', 'wait', 40, 400], ['B', 'run', 400, 420], ['main', 'run', 400, 420], ['A', 'run', 800, 820], ['main', 'run', 800, 820]],
              prints: [[15, 'Started'], [415, 'B done'], [815, 'A done']],
            },
            sleep: {
              label: 'Thread.sleep()', total: 1280,
              snippet: 'launch { Thread.sleep(800); println("A done") }\nlaunch { Thread.sleep(400); println("B done") }\nprintln("Started")',
              note: 'About 1200 ms in total. Each sleep held the thread, so B couldn’t even start until A finished.',
              bars: [['main', 'run', 0, 20], ['A', 'run', 20, 30], ['A', 'block', 30, 820], ['main', 'block', 20, 820], ['B', 'queued', 20, 820], ['B', 'run', 820, 830], ['B', 'block', 830, 1220], ['main', 'block', 820, 1220]],
              prints: [[15, 'Started'], [825, 'A done'], [1225, 'B done']],
            },
          };
          const lanes = { main: 'main thread', A: 'coroutine A', B: 'coroutine B' };
          let mode = 'delay', busy = false, bars = [], cursors = [];
          const tl = h('div', { class: 'timeline' });
          const clock = h('span', { class: 'clock' }, '0 ms');
          const con = h('div', { class: 'out', 'aria-live': 'polite' });
          const note = h('p', { class: 'tip' });
          const snippet = h('div', { class: 'kt' });
          const buttons = Object.keys(modes).map(k => cmd(modes[k].label, () => { if (busy) return; mode = k; play(); }));
          function setup() {
            const m = modes[mode];
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(modes)[i] === mode));
            snippet.innerHTML = hl(m.snippet);
            bars = []; cursors = [];
            tl.replaceChildren(...Object.entries(lanes).map(([id, name]) => {
              const track = h('div', { class: 'lane-track' });
              for (const [lane, kind, start, end] of m.bars) {
                if (lane !== id) continue;
                const b = h('span', { class: `bar ${kind}`, style: `left:${(start / m.total) * 100}%;width:0` });
                track.append(b); bars.push({ el: b, start, end });
              }
              const c = h('span', { class: 'cursor' });
              track.append(c); cursors.push(c);
              return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track);
            }));
            con.replaceChildren(); note.textContent = '';
          }
          function draw(t) {
            const m = modes[mode];
            for (const b of bars) b.el.style.width = (Math.max(0, Math.min(t, b.end) - b.start) / m.total) * 100 + '%';
            cursors.forEach(c => { c.style.left = (t / m.total) * 100 + '%'; });
            clock.textContent = Math.round(t) + ' ms';
          }
          function play() {
            if (busy) return; busy = true; setup();
            const m = modes[mode], t0 = performance.now();
            let p = 0;
            const tick = now => {
              const t = Math.min((now - t0) / 2.5, m.total); // 2.5x slow motion
              draw(t);
              while (p < m.prints.length && m.prints[p][0] <= t) con.append(h('div', { class: 'line drop-in' }, m.prints[p++][1]));
              if (t < m.total) requestAnimationFrame(tick);
              else { note.textContent = m.note; busy = false; }
            };
            requestAnimationFrame(tick);
          }
          // Open on a finished run so the page reads complete before anyone presses Play.
          setup(); draw(modes.delay.total);
          modes.delay.prints.forEach(([, text]) => con.append(h('div', { class: 'line' }, text)));
          note.textContent = modes.delay.note;
          const legend = h('div', { class: 'legend' },
            h('span', {}, h('i', { class: 'bar run' }), 'running'),
            h('span', {}, h('i', { class: 'bar wait' }), 'suspended (thread free)'),
            h('span', {}, h('i', { class: 'bar block' }), 'blocking the thread'),
            h('span', {}, h('i', { class: 'bar queued' }), 'waiting to start'));
          el.append(
            h('div', { class: 'controls' }, buttons, h('button', { class: 'btn primary small', onclick: play }, 'Play'), clock),
            snippet, tl, legend, note, con);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'structured',
        title: 'Structured concurrency',
        tagline: 'Coroutines live in a tree. Cancel the top and everything below stops.',
        body: `
<p>Every coroutine starts inside a scope, and every coroutine it launches becomes its child. Together they form a tree. A parent finishes only after all of its children finish.</p>
<p>The tree is what makes cleanup automatic. Cancel a parent and every child below it is cancelled. When a child fails, it cancels its parent, and the parent cancels the other children. <code>viewModelScope</code> is cancelled in <code>onCleared()</code>, so nothing started there outlives the screen. It uses a <code>SupervisorJob</code>, so one failed <code>launch</code> does not cancel its other children. The next lesson, Exception handling in coroutines, shows where that failure goes instead.</p>
<p>Cancellation is cooperative. It takes effect at the next suspension point, like <code>delay()</code> or <code>await()</code>. The lesson Cancellation and timeouts covers CPU loops, cleanup and timeouts.</p>`,
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
          { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">suspend fun syncAll() {\n    appScope.launch { syncNews() }\n    appScope.launch { syncWeather() }\n}</pre>What is wrong with this suspend function?', options: ['It runs syncNews and syncWeather one after the other', 'It returns before the syncs finish, and their errors never reach the caller', 'It blocks the calling thread until both finish'], a: 1, why: 'Launching into a scope you were handed breaks the tree for the caller. Wrap the work in coroutineScope { } so the function returns only when every child is done and failures are rethrown.' },
          { q: 'Saving a bookmark must finish even if the user leaves the screen right after tapping. Which choice fits?', options: ['viewModelScope.launch { save() }', 'GlobalScope.launch { save() }', 'Launch in a longer-lived scope injected from the Application'], a: 2, why: 'viewModelScope would cancel the save, and GlobalScope has no owner. An injected app-wide scope keeps the work structured but lets it outlive the screen.' },
        ],
        deeper: structuredDepth.deeper,
        underHood: structuredDepth.underHood,
        mistakes: structuredDepth.mistakes,
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

      exceptions,
      cancellation,

      // 3 ─────────────────────────────────────────────
      {
        id: 'dispatchers',
        title: 'Dispatchers and withContext',
        tagline: 'Pick the right threads for the job, then hop back.',
        body: `
<p>A dispatcher decides which threads run a coroutine. <code>Dispatchers.Main</code> is the UI thread. <code>Dispatchers.IO</code> is a large pool for blocking calls like file, socket and database reads. <code>Dispatchers.Default</code> has one thread per CPU core (at least two), for heavy computation like parsing or sorting.</p>
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
          { q: 'On the main thread you run <code>scope.launch(Dispatchers.Main) { log("B") }</code> and then <code>log("A")</code>. What is logged?', options: ['B, then A', 'A, then B', 'Only A'], a: 1, why: 'Dispatchers.Main always posts to the message queue, so the code after launch runs first. Dispatchers.Main.immediate would run B at once, giving B then A.' },
          { q: 'Several coroutines write to a log file that is not thread safe. You want at most one write at a time. Which fits best?', options: ['Dispatchers.IO.limitedParallelism(1)', 'Dispatchers.Default', 'A new thread pool per write'], a: 0, why: 'limitedParallelism(1) gives a view of IO that runs one task at a time without creating new threads. Default runs several tasks at once.' },
        ],
        deeper: dispatchersDepth.deeper,
        underHood: dispatchersDepth.underHood,
        mistakes: dispatchersDepth.mistakes,
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

      sharedState,
      channels,
    ],
  });
})();
