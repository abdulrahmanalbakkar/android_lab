/* Flow track. Same shape as tracks/kotlin.js.
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
.flw-src { font: 600 0.74rem/1.4 var(--mono); background: var(--code-bg); color: var(--code-ink); padding: 2px 7px; border-radius: 6px; white-space: nowrap; text-align: center; }
.flw-prog { display: block; width: 100%; min-width: 60px; height: 5px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.flw-prog i { display: block; height: 100%; width: 0; background: var(--accent); }

.flw-ui { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
.flw-ui.frozen { border-color: var(--err); }

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
  .flw-src { white-space: normal; font-size: 0.68rem; }
  .flw-prog { min-width: 0; }
  .flw-col { grid-template-columns: 64px minmax(0, 1fr); }
  .flw-col .flw-stat { grid-column: 2; }
  .flw-mrow, .flw-srow { grid-template-columns: 56px minmax(0, 1fr); gap: 6px; }
  .flw-mtrack { margin-inline: 12px; }
  .flw-m { min-width: 22px; height: 22px; padding: 0 4px; font-size: 0.66rem; }
  .flw-life .lane { grid-template-columns: 78px minmax(0, 1fr); }
}

.flw-ibar { position: absolute; top: 50%; height: 20px; margin-top: -10px; border-radius: 6px; border: 2px solid var(--accent); background: var(--accent-soft); overflow: hidden; opacity: 0; font: 700 0.64rem/16px var(--mono); color: var(--accent); text-indent: 3px; white-space: nowrap; }
.flw-ibar.on { opacity: 1; }
.flw-ibar.wait { border-style: dashed; border-color: var(--muted); background: transparent; color: var(--muted); }
.flw-ibar.cut { border-style: dashed; border-color: var(--err); background: var(--err-soft); color: var(--err); }
.flw-ibar.done { border-color: var(--ok); background: var(--ok-soft); color: var(--ok); }
.flw-ibar.half { height: 16px; margin-top: -17px; line-height: 12px; }
.flw-ibar.half.lo { margin-top: 1px; }
.flw-x { position: absolute; top: 50%; z-index: 2; transform: translate(-50%, -50%); font: 700 1rem var(--mono); color: var(--err); transition: opacity 0.3s; }
.flw-x.hide { opacity: 0; }
.flw-reqs { display: grid; gap: 6px; }
.flw-req { display: grid; grid-template-columns: minmax(0, 9.5em) minmax(0, 1fr) 70px; gap: 8px; align-items: center; padding: 5px 8px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.flw-req .flw-src { display: block; overflow: hidden; text-overflow: ellipsis; }
.flw-req.ok { border-color: var(--ok); }
.flw-req.ok .flw-prog i { background: var(--ok); }
.flw-req.cut { opacity: 0.55; border-style: dashed; }
.flw-req.cut .flw-prog i { background: var(--muted); }
.flw-shown { font: 600 0.86rem/1.5 var(--mono); padding: 8px 12px; border-radius: 9px; background: var(--ok-soft); color: var(--ok); overflow-wrap: anywhere; }
.flw-shown.stale { background: var(--err-soft); color: var(--err); }
.flw-shown.wait { background: var(--sunk); color: var(--muted); }

.flw-pipe { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); }
.flw-stage { display: grid; gap: 2px; font: 600 0.76rem var(--mono); padding: 6px 10px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); transition: border-color 0.25s, background 0.25s, opacity 0.25s; min-width: 0; }
.flw-stage small { font: 500 0.68rem var(--mono); color: var(--muted); }
.flw-stage.on { border-color: var(--accent); background: var(--accent-soft); }
.flw-stage.ok { border-color: var(--ok); background: var(--ok-soft); }
.flw-stage.fail { border-color: var(--err); background: var(--err-soft); }
.flw-stage.fail small { color: var(--err); }
.flw-stage.caught { border-color: var(--warm); background: var(--warm-soft); }
.flw-stage.caught small { color: var(--warm); }
.flw-stage.skip { opacity: 0.45; border-style: dashed; }
.flw-arrow { color: var(--muted); font: 600 0.8rem var(--mono); }
.flw-step { display: flex; align-items: center; gap: 6px; min-width: 0; }
.flw-log { display: grid; gap: 2px; }
.out.flw-log::before { content: none; }

.flw-v.warn { border-color: var(--warm); color: var(--warm); background: var(--warm-soft); }
.flw-v.bad { border-color: var(--err); color: var(--err); background: var(--err-soft); }
.flw-cb { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.flw-cb .flw-strip { flex-wrap: wrap; overflow: visible; }
.flw-big { font: 700 0.95rem var(--mono); }

@media (max-width: 620px) {
  .flw-cb { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .flw-req { grid-template-columns: minmax(0, 1fr) 64px; }
  .flw-req .flw-prog { grid-column: 1 / -1; grid-row: 2; }
  .flw-ibar { font-size: 0.58rem; text-indent: 2px; }
}
/* depth steps */
.flw-wrap { flex-wrap: wrap; overflow: visible; }
/* depth 2: operators */
.flw-d2op-tight .flw-m { min-width: 18px; height: 18px; padding: 0 3px; font-size: 0.62rem; }
/* depth 2: flatMap */
.flw-d2fm-pulse { display: block; height: 8px; border-radius: 99px; background: var(--sunk); min-width: 0; }
.flw-req.flw-d2fm-live .flw-d2fm-pulse { background: var(--accent); animation: pulse 0.8s ease-in-out infinite; }
`;

  // Plays a timeline of T ms, stretched by slow, calling frame(t) every animation frame.
  // Resolves false if node left the page or live() turned false (a newer run took over).
  const playT = (node, T, frame, slow = 1, live = () => true) => new Promise(res => {
    const t0 = performance.now();
    const step = now => {
      if (!node.isConnected || !live()) { res(false); return; }
      const t = reduced() ? T : Math.min(T, (now - t0) / slow);
      frame(t);
      if (t < T) requestAnimationFrame(step); else res(true);
    };
    requestAnimationFrame(step);
  });
  // A marble timeline. rows: [{ name, marbles: [{ t, v, c, goneAt }], bars: [{ s, e, k, label, half, lo }], marks: [t], end }].
  function board(rows, T) {
    const pct = t => (t / T) * 100 + '%';
    const items = [], cursors = [];
    const els = rows.map(r => {
      const tr = h('div', { class: 'flw-mtrack' });
      const cur = h('span', { class: 'cursor', style: 'left:0' });
      tr.append(cur); cursors.push(cur);
      (r.bars || []).forEach(b => {
        const e = h('span', { class: `flw-ibar ${b.k}${b.half ? ' half' : ''}${b.lo ? ' lo' : ''}`, style: `left:${pct(b.s)};width:0` }, b.label == null ? '' : String(b.label));
        tr.append(e); items.push({ e, s: b.s, b });
      });
      (r.marbles || []).forEach(m => {
        const e = h('span', { class: `flw-m c${m.c || 0} hide`, style: `left:${pct(m.t)}` }, String(m.v));
        tr.append(e); items.push({ e, s: m.t, m });
      });
      [...(r.marks || []), ...(r.end != null ? [r.end] : [])].forEach((t, i, all) => {
        const isEnd = r.end != null && i === all.length - 1;
        const e = isEnd ? h('span', { class: 'flw-end hide', style: `left:${pct(t)}` }) : h('span', { class: 'flw-x hide', style: `left:${pct(t)}`, 'aria-hidden': 'true' }, '×');
        tr.append(e); items.push({ e, s: t });
      });
      return h('div', { class: 'flw-mrow' }, h('span', { class: 'lane-name' }, r.name), tr);
    });
    const node = h('div', { class: 'flw-marbles' }, els);
    function paint(t) {
      cursors.forEach(c => { c.style.left = pct(t); });
      for (const it of items) {
        if (it.b) { it.e.style.width = pct(Math.max(0, Math.min(t, it.b.e) - it.b.s)); it.e.classList.toggle('on', t >= it.b.s); }
        else if (it.m) { it.e.classList.toggle('hide', t < it.m.t); it.e.classList.toggle('gone', it.m.goneAt != null && t >= it.m.goneAt); }
        else it.e.classList.toggle('hide', t < it.s);
      }
    }
    return { node, paint };
  }
  const pressed = (buttons, keys, k) => buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(keys[i] === k)));

  // ─── Depth pass 2: cold, operators, flatmap, backpressure, errors-retry, callbackflow ─────────────────
  const d2btn = (label, onclick) => h('button', { class: 'cmd', onclick }, label);

  const coldDepth = {
    deeper: [
      {
        title: 'collect suspends, so give each flow its own coroutine',
        body: `<p><code>collect</code> returns only when the flow completes. A flow that watches a database or a ticker never completes, so code after its <code>collect</code> never runs. Two collects in one <code>launch</code> run one after the other, and the second waits forever.</p>
<p>Start each long-lived collection in its own <code>launch</code>. Then they run side by side.</p>`,
        code: `// The news never loads: prices.collect never returns
viewModelScope.launch {
    prices.collect { _price.value = it }
    news.collect { _news.value = it }
}

// Each collection runs in its own coroutine
viewModelScope.launch { prices.collect { _price.value = it } }
viewModelScope.launch { news.collect { _news.value = it } }`,
        visual(el) {
          let gen = 0;
          const lane = name => {
            const strip = h('div', { class: 'flw-strip flw-wrap' }), st = h('span', { class: 'flw-stat' }, 'not started');
            return { strip, st, row: h('div', { class: 'flw-col' }, h('span', { class: 'lane-name' }, name), strip, st) };
          };
          const L = { prices: lane('prices'), news: lane('news') };
          const code = h('div', { class: 'kt' });
          const o = out();
          const add = (l, text) => { l.strip.append(h('span', { class: 'flw-v acc drop-in' }, text)); while (l.strip.children.length > 4) l.strip.firstElementChild.remove(); };
          const stat = (l, text, cls) => { l.st.textContent = text; l.st.className = 'flw-stat' + (cls ? ' ' + cls : ''); };
          async function run(split) {
            const my = ++gen;
            Object.values(L).forEach(l => { l.strip.replaceChildren(); stat(l, 'not started'); });
            code.innerHTML = hl(split ? 'launch { prices.collect { … } }\nlaunch { news.collect { … } }' : 'launch {\n    prices.collect { … }   // never completes\n    news.collect { … }\n}');
            say(o, split ? 'Two coroutines. Both collect at once.' : 'One coroutine. prices first, then news.');
            stat(L.prices, 'collecting', 'on');
            if (split) stat(L.news, 'collecting', 'on'); else stat(L.news, 'waiting for prices to finish', '');
            let p = 101, k = 0;
            for (let i = 0; i < 8; i++) {
              await sleep(550); if (!el.isConnected || my !== gen) return;
              add(L.prices, `$${p += (i % 3) - 1}`);
              if (split && i % 2 === 0) add(L.news, `story ${++k}`);
            }
            say(o, split
              ? '<span class="good">both live:</span> each collect suspends in its own coroutine.'
              : '<span class="bad">news never started:</span> prices is a ticker that never completes, so its collect never returns.');
          }
          el.append(
            h('div', { class: 'controls' }, cmd('launch { prices.collect {}; news.collect {} }', () => run(false)), cmd('launch { prices.collect {} }; launch { news.collect {} }', () => run(true))),
            code,
            h('div', { class: 'flw-cols' }, L.prices.row, L.news.row),
            o);
          run(false);
        },
      },
      {
        title: 'The collector can stop the producer early',
        body: `<p>A cold flow runs only as long as someone wants values. <code>first()</code> takes one value and then cancels the flow. <code>take(3)</code> cancels it after three. The producer stops at its current <code>emit</code>, the code after that never runs, and its <code>finally</code> block does.</p>
<p>So a flow that opens a connection can close it in <code>finally</code>, or in <code>onCompletion</code>, and it will close no matter how the collector stopped.</p>`,
        code: `val numbers = flow {
    try {
        for (i in 1..5) { delay(400); emit(i) }
    } finally {
        println("producer stopped")   // runs after first() too
    }
}
val one = numbers.first()            // 1, then the flow is cancelled
val three = numbers.take(3).toList() // [1, 2, 3]`,
        visual(el) {
          let busy = false;
          const lines = ['flow {', '  try {', '    for (i in 1..5) { delay(400); emit(i) }', '  } finally { println("producer stopped") }', '}'].map(t => h('div', { class: 'branch' }, t));
          const got = h('div', { class: 'flw-strip flw-wrap' });
          const log = h('div', { class: 'out flw-log', 'aria-live': 'polite' });
          const line = html => { log.append(h('div', { html })); while (log.children.length > 7) log.firstElementChild.remove(); };
          async function run(label, limit) {
            if (busy) return; busy = true;
            got.replaceChildren(); log.replaceChildren();
            line(`<span class="muted">${label}</span>`);
            lines[2].classList.add('scan');
            let i = 1;
            for (; i <= 5; i++) {
              await sleep(400); if (!el.isConnected) return;
              line(`emit(${i})`);
              got.append(h('span', { class: 'flw-v ok drop-in' }, String(i)));
              if (i === limit) break;
            }
            lines[2].classList.remove('scan');
            if (i < 5 && limit) {
              await sleep(250); if (!el.isConnected) return;
              lines[2].classList.add('cut'); line(`<span class="bad">cancelled</span> inside emit(${i}). emit(${i + 1}) never runs.`);
            }
            lines[3].classList.add('hit');
            line('<span class="good">finally:</span> producer stopped');
            await sleep(900); if (!el.isConnected) return;
            lines[2].classList.remove('cut'); lines[3].classList.remove('hit');
            line(limit ? `<span class="muted">collector got</span> ${limit === 1 ? '1' : '[1, 2, 3]'}` : '<span class="muted">collect returned:</span> the flow completed');
            busy = false;
          }
          line('Run the flow three ways. Watch where the producer stops.');
          el.append(
            h('div', { class: 'when' }, lines),
            h('div', { class: 'controls' },
              cmd('numbers.collect { show(it) }', () => run('numbers.collect { show(it) }', 0)),
              cmd('numbers.first()', () => run('numbers.first()', 1)),
              cmd('numbers.take(3).toList()', () => run('numbers.take(3).toList()', 3))),
            h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'got'), got),
            log);
        },
      },
    ],
    underHood: {
      body: `<p><code>Flow</code> is an interface with one function, <code>collect</code>, that takes a <code>FlowCollector</code>. When you write <code>collect { println(it) }</code>, your lambda is that collector. <code>flow { }</code> builds an object whose <code>collect</code> runs your block with the collector as receiver. So <code>emit(1)</code> is a plain suspend call into your lambda. There is no queue and no extra thread.</p>
<p>The collector is wrapped in a safety check. Emitting from a different coroutine context than the one collecting fails with “Flow invariant is violated”. <code>first()</code> and <code>take()</code> stop the producer by throwing an internal exception out of <code>emit</code>, which is why the producer’s <code>finally</code> runs.</p>`,
      code: `public interface Flow<out T> {
    public suspend fun collect(collector: FlowCollector<T>)
}

public fun interface FlowCollector<in T> {
    public suspend fun emit(value: T)
}`,
    },
    mistakes: [
      {
        title: 'Collecting the same cold flow twice and paying twice',
        bad: `val feed: Flow<Feed> = repo.feed()   // one request per collect
launch { feed.collect { header.show(it) } }
launch { feed.collect { list.show(it) } }`,
        good: `val feed: StateFlow<Feed?> = repo.feed()
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
// both parts of the screen read the one shared result`,
        why: 'Each <code>collect</code> runs the block again. Two collectors make two network requests. Share it with <code>stateIn</code> or <code>shareIn</code>.',
      },
      {
        title: 'Switching threads with withContext around emit',
        bad: `fun load(): Flow<Data> = flow {
    withContext(Dispatchers.IO) { emit(api.load()) }
}`,
        good: `fun load(): Flow<Data> = flow {
    emit(api.load())
}.flowOn(Dispatchers.IO)`,
        why: 'A flow must emit in the collector’s context. Emitting from inside <code>withContext</code> throws IllegalStateException: Flow invariant is violated. <code>flowOn</code> moves the upstream safely.',
      },
    ],
  };

  const operatorsDepth = {
    deeper: [
      {
        title: 'debounce waits for quiet, sample ticks on a clock',
        body: `<p><code>debounce</code> only lets a value through after a pause. On a source that never pauses, like scroll positions while a finger drags, it emits nothing until the source stops or completes.</p>
<p><code>sample(500)</code> emits the latest value once per period, as long as a new value arrived in that period. Use it for steady streams like progress or sensor data, where you want regular updates rather than a final one.</p>`,
        code: `@OptIn(FlowPreview::class)
val searchQuery = typed.debounce(300)         // one value after typing stops

@OptIn(FlowPreview::class)
val scrollForAnalytics = scrollY.sample(500)  // at most one value per 500 ms`,
        visual(el) {
          const T = 3200, END = 3000;
          const SOURCES = {
            steady: { label: 'steady: every 250 ms', times: Array.from({ length: 12 }, (_, i) => 100 + i * 250) },
            bursts: { label: 'bursts with pauses', times: [100, 200, 300, 400, 1100, 1200, 1300, 2000, 2100, 2200, 2300] },
          };
          const keys = Object.keys(SOURCES);
          const slot = h('div', { class: 'flw-d2op-tight' });
          const o = out();
          let gen = 0, cur;
          function build(k) {
            const ts = SOURCES[k].times, src = ts.map((t, i) => ({ t, v: i + 1, c: (i + 1) % 5 }));
            const deb = [];
            ts.forEach((t, i) => { const nxt = i + 1 < ts.length ? ts[i + 1] : Infinity; if (nxt - t >= 300) deb.push({ t: Math.min(t + 300, END), v: i + 1, c: (i + 1) % 5 }); });
            if (ts[ts.length - 1] + 300 > END && !deb.find(d => d.v === ts.length)) deb.push({ t: END, v: ts.length, c: ts.length % 5 });
            const smp = [];
            for (let tick = 500; tick < END; tick += 500) {
              const inWin = ts.map((t, i) => [t, i]).filter(([t]) => t > tick - 500 && t <= tick);
              if (inWin.length) { const i = inWin[inWin.length - 1][1]; smp.push({ t: tick, v: i + 1, c: (i + 1) % 5 }); }
            }
            cur = board([
              { name: 'source', marbles: src, end: END },
              { name: 'debounce', marbles: deb, end: END },
              { name: 'sample', marbles: smp, end: END },
            ], T);
            slot.replaceChildren(cur.node);
            pressed(btns, keys, k);
            return { deb, smp };
          }
          const btns = keys.map(k => cmd(SOURCES[k].label, async () => {
            const my = ++gen;
            const r = build(k);
            say(o, `<span class="muted">playing</span> ${SOURCES[k].label}`);
            if (!(await playT(cur.node, T, cur.paint, 1, () => gen === my))) return;
            say(o, k === 'steady'
              ? `<span class="bad">debounce:</span> no 300 ms pause ever came, so only the last value got out, at completion. <span class="good">sample:</span> ${r.smp.length} values, one per tick.`
              : `<span class="good">debounce:</span> one value per burst, ${r.deb.length} in all. <span class="good">sample:</span> a value on each tick that saw new data, ${r.smp.length} in all, none during the pauses.`);
          }));
          build('steady'); cur.paint(T);
          o.innerHTML = 'A source that never pauses. Play it, then play bursts.';
          el.append(h('div', { class: 'controls' }, btns), slot, o);
        },
      },
      {
        title: 'scan keeps a running result, reduce waits for the end',
        body: `<p><code>scan(initial) { acc, value -> }</code> carries a value from one emission to the next and emits every step, starting with the initial value. It is how you build a running total, or fold events into a state.</p>
<p><code>reduce</code> and <code>fold</code> do the same math, but they are terminal. They return one result when the flow completes, so on a flow that never completes they never return.</p>`,
        code: `val total: Flow<Int> = cartChanges.scan(0) { sum, change -> sum + change }
// emits 0, then a new sum for every change

val final: Int = cartChanges.fold(0) { sum, change -> sum + change }
// suspends until cartChanges completes, then returns once`,
        visual(el) {
          let acc = 0, done = false;
          const up = h('div', { class: 'flw-strip flw-wrap' });
          const sc = h('div', { class: 'flw-strip flw-wrap' }, h('span', { class: 'flw-v ok' }, '0'));
          const red = h('div', { class: 'flw-shown wait' }, 'fold: suspended until the flow completes');
          const o = out();
          const trim = s => { while (s.children.length > 7) s.firstElementChild.remove(); };
          function emit(x) {
            if (done) { replay(up, 'shake'); say(o, '<span class="muted">completed:</span> a finished flow emits nothing more. Press Reset.'); return; }
            acc += x;
            up.append(h('span', { class: 'flw-v acc drop-in' }, (x > 0 ? '+' : '') + x)); trim(up);
            sc.append(h('span', { class: 'flw-v ok drop-in' }, String(acc))); trim(sc);
            say(o, `scan emitted ${acc}. <span class="muted">fold still waits.</span>`);
          }
          el.append(
            h('div', { class: 'controls' }, cmd('emit(5)', () => emit(5)), cmd('emit(10)', () => emit(10)), cmd('emit(-3)', () => emit(-3)),
              cmd('// the flow completes', () => {
                if (done) { replay(red, 'shake'); return; }
                done = true; red.className = 'flw-shown'; red.textContent = `fold returned ${acc}`; replay(red, 'pop');
                say(o, `<span class="good">completed:</span> fold returned its one result, ${acc}. scan had already emitted every step.`);
              })),
            h('div', { class: 'flw-search' },
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'changes'), up),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'scan(0)'), sc),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'fold(0)'), red)),
            o);
          o.innerHTML = 'scan already emitted its initial 0. Emit a few changes, then complete the flow.';
        },
      },
      {
        title: 'Write your own operator with transform',
        body: `<p><code>transform { }</code> lets you emit zero, one or many values for each input. <code>map</code> and <code>filter</code> are special cases of it. For anything with its own state, write an extension that returns <code>flow { }</code> and collects the upstream inside.</p>`,
        code: `// zero or many values per input
val words: Flow<String> = lines.transform { line ->
    if (line.isNotBlank()) line.split(" ").forEach { emit(it) }
}

// a reusable operator with its own state
fun <T> Flow<T>.everyNth(n: Int): Flow<T> = flow {
    var i = 0
    collect { value -> if (i++ % n == 0) emit(value) }
}`,
      },
    ],
    underHood: {
      body: `<p>Most operators are small wrappers. <code>map</code> returns a new flow whose <code>collect</code> collects the upstream and calls <code>emit(transform(value))</code> downstream. Collecting the last flow in a chain walks up the chain, and every value then travels down through plain function calls in the collector’s coroutine. That is why a slow <code>map</code> slows the whole chain.</p>
<p>Operators that deal with time or several inputs are different. <code>debounce</code>, <code>sample</code> and <code>combine</code> start coroutines and channels inside, so they can wait on a timer and on values at once.</p>`,
      code: `// The shape of map (the real one uses internal helpers, same idea)
inline fun <T, R> Flow<T>.map(crossinline transform: suspend (T) -> R): Flow<R> =
    flow {
        collect { value -> emit(transform(value)) }
    }`,
    },
    mistakes: [
      {
        title: 'combine with an input that never emits',
        bad: `private val favorites = MutableSharedFlow<Set<Int>>()   // no value yet

val screen = combine(results, favorites) { list, favs -> mark(list, favs) }`,
        good: `private val favorites = MutableStateFlow<Set<Int>>(emptySet())

val screen = combine(results, favorites) { list, favs -> mark(list, favs) }`,
        why: '<code>combine</code> waits until every input has a value. A SharedFlow with no replay has none, so the screen stays empty until the user stars something.',
      },
      {
        title: 'Building a chain and never collecting it',
        bad: `fun observe() {
    viewModel.state.onEach { render(it) }
}`,
        good: `fun observe() {
    viewModel.state.onEach { render(it) }.launchIn(viewLifecycleOwner.lifecycleScope)
}`,
        why: '<code>onEach</code> returns a new cold flow. Without a terminal operator like <code>collect</code> or <code>launchIn</code>, nothing runs.',
      },
      {
        title: 'debounce delaying the first value too',
        bad: `@OptIn(FlowPreview::class)
val results = query.debounce(300).flatMapLatest { search(it) }
// the screen shows nothing for 300 ms after it opens`,
        good: `@OptIn(FlowPreview::class)
val results = query
    .debounce { q -> if (q.isEmpty()) 0L else 300L }
    .flatMapLatest { search(it) }`,
        why: 'debounce waits after every value, including the initial empty query. The overload with a lambda lets you skip the wait where it doesn’t help.',
      },
    ],
  };

  const flatmapDepth = {
    deeper: [
      {
        title: 'concurrency limits how many inner flows run',
        body: `<p><code>flatMapMerge(concurrency = n)</code> collects at most <code>n</code> inner flows at once. The rest wait their turn, in order. A free slot goes to the next one as soon as any inner flow completes, so results come out in finishing order.</p>
<p>With <code>concurrency = 1</code> it behaves exactly like <code>flatMapConcat</code>. Pick a limit that matches what the server or the disk can handle, not as many as possible.</p>`,
        code: `@OptIn(ExperimentalCoroutinesApi::class)
val thumbs: Flow<Thumb> = photoIds.asFlow()
    .flatMapMerge(concurrency = 2) { id -> flow { emit(api.thumb(id)) } }`,
        visual(el) {
          const DUR = [900, 400, 700, 300, 800, 500];
          let busy = false, gen = 0;
          const reqs = h('div', { class: 'flw-reqs' });
          const order = h('div', { class: 'flw-strip flw-wrap' });
          const stats = h('p', { class: 'tip' });
          const o = out();
          const rows = DUR.map((ms, i) => {
            const bar = h('i'), st = h('span', { class: 'flw-stat' }, 'queued');
            const row = h('div', { class: 'flw-req' }, h('span', { class: 'flw-src' }, `thumb(${i + 1}) · ${ms} ms`), h('span', { class: 'flw-prog' }, bar), st);
            return { ms, bar, st, row };
          });
          reqs.append(...rows.map(r => r.row));
          const paintIdle = () => rows.forEach(r => { r.bar.style.transition = 'none'; r.bar.style.width = '0%'; r.st.textContent = 'queued'; r.st.className = 'flw-stat'; r.row.className = 'flw-req'; });
          async function run(c) {
            if (busy) return; busy = true;
            const my = ++gen;
            pressed(btns, [1, 2, 4], c);
            paintIdle(); order.replaceChildren(); stats.textContent = 'running…';
            say(o, hl(`photoIds.asFlow().flatMapMerge(concurrency = ${c}) { thumb(it) }`));
            const t0 = performance.now();
            let next = 0;
            const worker = async () => {
              while (next < rows.length) {
                const r = rows[next++];
                r.st.textContent = 'loading'; r.st.className = 'flw-stat on';
                void r.bar.offsetWidth; r.bar.style.transition = `width ${r.ms}ms linear`; r.bar.style.width = '100%';
                await sleep(r.ms); if (!el.isConnected || my !== gen) return false;
                r.st.textContent = 'done'; r.st.className = 'flw-stat fin'; r.row.classList.add('ok');
                order.append(h('span', { class: 'flw-v ok drop-in' }, String(rows.indexOf(r) + 1)));
              }
              return true;
            };
            const res = await Promise.all(Array.from({ length: c }, worker));
            if (!res.every(Boolean)) return;
            const secs = ((performance.now() - t0) / 1000).toFixed(1);
            stats.textContent = `concurrency ${c}: done in about ${secs} s`;
            say(o, c === 1
              ? `<span class="muted">concurrency 1:</span> one at a time, in order, like flatMapConcat. Slowest, but the order is kept.`
              : `<span class="good">concurrency ${c}:</span> at most ${c} loading at once. Results came out in finishing order, not 1 to 6.`);
            busy = false;
          }
          const btns = [1, 2, 4].map(c => cmd(`flatMapMerge(concurrency = ${c})`, () => run(c)));
          stats.textContent = 'Six thumbnails with different load times.';
          o.innerHTML = 'Pick a concurrency and watch the slots fill.';
          el.append(h('div', { class: 'controls' }, btns), reqs,
            h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'emitted'), order), stats, o);
        },
      },
      {
        title: 'flatMapConcat gets stuck on flows that never end',
        body: `<p>Room queries, DataStore and StateFlows never complete. They keep emitting updates. <code>flatMapConcat</code> waits for each inner flow to complete before it starts the next, so with one of those inside, the first inner flow runs forever and the next one never starts.</p>
<p>When the outer value says which stream to watch, like the selected user, use <code>flatMapLatest</code>. It cancels the old stream and switches to the new one.</p>`,
        code: `@OptIn(ExperimentalCoroutinesApi::class)
val profile: Flow<User> = selectedUserId
    .flatMapLatest { id -> userDao.observe(id) }   // never completes, so not Concat`,
        visual(el) {
          let mode = 'concat', ids, active, tick, busy = false, gen = 0;
          const USERS = ['Ada', 'Grace', 'Linus'];
          const up = h('div', { class: 'flw-strip flw-wrap' });
          const inner = h('div', { class: 'flw-reqs' });
          const screen = h('div', { class: 'flw-shown' });
          const o = out();
          let rowsBy = {};
          const modeBtns = [cmd('selectedId.flatMapConcat { dao.observe(it) }', () => setMode('concat')), cmd('selectedId.flatMapLatest { dao.observe(it) }', () => setMode('latest'))];
          function mkRow(name) {
            const st = h('span', { class: 'flw-stat' });
            const row = h('div', { class: 'flw-req drop-in' }, h('span', { class: 'flw-src' }, `observe(${name})`), h('span', { class: 'flw-d2fm-pulse' }), st);
            rowsBy[name] = { row, st };
            inner.append(row);
          }
          const setSt = (name, text, cls) => { const r = rowsBy[name]; r.st.textContent = text; r.st.className = 'flw-stat' + (cls ? ' ' + cls : ''); r.row.classList.toggle('cut', cls === 'cut'); r.row.classList.toggle('flw-d2fm-live', cls === 'on'); };
          function setMode(m) {
            mode = m; pressed(modeBtns, ['concat', 'latest'], m);
            ids = [USERS[0]]; active = USERS[0]; tick = 0; rowsBy = {};
            up.replaceChildren(h('span', { class: 'flw-v acc' }, USERS[0])); inner.replaceChildren(); mkRow(USERS[0]); setSt(USERS[0], 'collecting', 'on');
            screen.textContent = `${USERS[0]} · update 0`;
            say(o, `${m === 'concat' ? 'flatMapConcat' : 'flatMapLatest'}. The screen follows ${USERS[0]}. Select another user.`);
            ticker(++gen);
          }
          async function ticker(my) {
            for (;;) {
              await sleep(800); if (!el.isConnected || my !== gen) return;
              tick++; screen.textContent = `${active} · update ${tick}`; replay(screen, 'pop-soft');
            }
          }
          function select() {
            if (busy) return;
            const next = USERS[ids.length % USERS.length];
            if (ids.length >= 3) { replay(up, 'shake'); say(o, '<span class="muted">enough users:</span> pick a mode to start over.'); return; }
            ids.push(next); up.append(h('span', { class: 'flw-v acc drop-in' }, next)); mkRow(next);
            if (mode === 'latest') {
              setSt(active, 'cancelled', 'cut'); active = next; tick = 0; setSt(next, 'collecting', 'on');
              screen.textContent = `${next} · update 0`; replay(screen, 'pop');
              say(o, `<span class="good">switched:</span> flatMapLatest cancelled the old stream and now follows ${next}.`);
            } else {
              setSt(next, 'waiting', '');
              say(o, `<span class="bad">stuck:</span> ${next} waits for observe(${ids[0]}) to complete. It never will, so the screen keeps showing ${ids[0]}.`);
            }
          }
          setMode('concat');
          el.append(h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'id'), up),
            inner, screen,
            h('div', { class: 'controls' }, d2btn('Select the next user', select)), o);
        },
      },
    ],
    underHood: {
      body: `<p>The three operators are built differently. <code>flatMapConcat</code> is <code>map</code> followed by <code>flattenConcat</code>, which is just <code>collect { inner -> emitAll(inner) }</code>: one inner flow at a time, in the collector’s coroutine.</p>
<p><code>flatMapMerge</code> runs inside a <code>channelFlow</code>. For each inner flow it acquires a permit from a <code>Semaphore(concurrency)</code>, launches a coroutine that collects it and sends into the shared channel, and releases the permit when that inner flow completes. With a concurrency of 1 it uses <code>flattenConcat</code> instead. <code>flatMapLatest</code> is <code>transformLatest { emitAll(transform(it)) }</code>. For each new value it cancels the previous child coroutine, waits for it to finish, and launches a new one.</p>`,
      code: `// The idea behind transformLatest, simplified
coroutineScope {
    var previous: Job? = null
    upstream.collect { value ->
        previous?.cancelAndJoin()                 // stop the old inner flow
        previous = launch { collector.transform(value) }
    }
}`,
    },
    mistakes: [
      {
        title: 'Using map when each value returns a Flow',
        bad: `val results: Flow<Flow<List<Article>>> = query.map { q -> repo.search(q) }
// collect gets flows, not lists`,
        good: `@OptIn(ExperimentalCoroutinesApi::class)
val results: Flow<List<Article>> = query.flatMapLatest { q -> repo.search(q) }`,
        why: '<code>map</code> wraps each inner flow without running it. A flatMap operator collects the inner flows and flattens their values into one stream.',
      },
      {
        title: 'Blocking calls inside flatMapLatest',
        bad: `query.flatMapLatest { q ->
    flow { emit(client.newCall(request(q)).execute()) }   // blocks a thread
}`,
        good: `query.flatMapLatest { q ->
    flow { emit(api.search(q)) }   // a suspend call, cancelled with the flow
}`,
        why: 'Cancellation can’t interrupt a blocking call. Every old request still runs to the end on some thread. A suspending client like Retrofit’s cancels the HTTP call too.',
      },
      {
        title: 'flatMapLatest for writes',
        bad: `@OptIn(ExperimentalCoroutinesApi::class)
edits.flatMapLatest { draft -> flow { emit(repo.save(draft)) } }.launchIn(scope)`,
        good: `@OptIn(ExperimentalCoroutinesApi::class)
edits.flatMapConcat { draft -> flow { emit(repo.save(draft)) } }.launchIn(scope)`,
        why: 'A new edit cancels the save still running, so a save can stop halfway. Writes need to finish, so run them in order.',
      },
    ],
  };

  const backpressureDepth = {
    deeper: [
      {
        title: 'Pick what a full buffer does',
        body: `<p><code>buffer(capacity, onBufferOverflow)</code> decides what happens when the queue is full. <code>SUSPEND</code>, the default, makes <code>emit</code> wait, so nothing is lost. <code>DROP_OLDEST</code> throws away the value that waited longest. <code>DROP_LATEST</code> throws away the value being emitted.</p>
<p><code>conflate()</code> is the special case that keeps only the newest value. The two drop modes never slow the producer down, so pick them only when losing values is fine.</p>`,
        code: `readings
    .buffer(capacity = 2, onBufferOverflow = BufferOverflow.DROP_OLDEST)
    .collect { show(it) }   // the producer never waits, old readings go first`,
        visual(el) {
          const P = 250, C = 700, N = 7, CAP = 2;
          const MODES = { SUSPEND: 'SUSPEND', DROP_OLDEST: 'DROP_OLDEST', DROP_LATEST: 'DROP_LATEST' };
          const keys = Object.keys(MODES);
          function sim(mode) {
            let tp = P, v = 1, cf = 0, pend = null, guard = 0;
            const q = [], coll = [], emits = [], prod = [], drops = [], qbars = [], marks = [];
            while ((v <= N || q.length || pend) && guard++ < 200) {
              const tTake = q.length ? Math.max(cf, q[0].at) : Infinity;
              const tEmit = v <= N && !pend ? tp : Infinity;
              if (tEmit === Infinity && tTake === Infinity) break;
              if (tEmit <= tTake) {
                prod.push({ s: tEmit - P, e: tEmit, k: 'run' }); emits.push({ t: tEmit, v, c: v % 5 });
                if (cf <= tEmit && !q.length) { coll.push({ s: tEmit, e: tEmit + C, k: 'done', label: v }); cf = tEmit + C; }
                else if (q.length < CAP) q.push({ v, at: tEmit });
                else if (mode === 'SUSPEND') pend = { v, at: tEmit };
                else if (mode === 'DROP_OLDEST') { const d = q.shift(); drops.push(d.v); qbars.push({ s: d.at, e: tEmit, k: 'cut', label: d.v, half: true, lo: d.v % 2 === 1 }); marks.push(tEmit); q.push({ v, at: tEmit }); }
                else { drops.push(v); marks.push(tEmit); }
                if (!pend) { v++; tp = tEmit + P; }
              } else {
                const it = q.shift();
                if (tTake > it.at) qbars.push({ s: it.at, e: tTake, k: 'wait', label: it.v, half: true, lo: it.v % 2 === 1 });
                coll.push({ s: tTake, e: tTake + C, k: 'done', label: it.v }); cf = tTake + C;
                if (pend) { prod.push({ s: pend.at, e: tTake, k: 'wait' }); q.push({ v: pend.v, at: tTake }); pend = null; v++; tp = tTake + P; }
              }
            }
            const end = Math.max(...coll.map(c => c.e));
            const prodEnd = emits[emits.length - 1].t;
            return { coll, emits, prod, qbars, marks, drops, end, prodEnd, done: coll.map(c => c.label) };
          }
          const T = Math.max(...keys.map(k => sim(k).end)) + 100;
          const slot = h('div', { class: 'flw-d2op-tight' }), snippet = h('div', { class: 'kt' }), stats = h('p', { class: 'tip' });
          const o = out();
          let gen = 0, cur;
          function build(k) {
            const r = sim(k);
            cur = board([
              { name: 'emit', bars: r.prod, marbles: r.emits },
              { name: 'queue', bars: r.qbars, marks: r.marks },
              { name: 'handle', bars: r.coll },
            ], T);
            slot.replaceChildren(cur.node);
            snippet.innerHTML = hl(`readings.buffer(2, BufferOverflow.${k}).collect { handle(it) }`);
            pressed(btns, keys, k);
            return r;
          }
          const report = (k, r) => `producer done at ${(r.prodEnd / 1000).toFixed(1)} s · handled: ${r.done.join(', ')} · dropped: ${r.drops.length ? r.drops.join(', ') : 'none'}`;
          const btns = keys.map(k => cmd(`BufferOverflow.${k}`, async () => {
            const my = ++gen;
            const r = build(k);
            stats.textContent = 'running…';
            if (!(await playT(cur.node, T, cur.paint, 1, () => gen === my))) return;
            stats.textContent = report(k, r);
            say(o, k === 'SUSPEND'
              ? '<span class="good">SUSPEND:</span> every value was handled. The dashed bars on the emit row are emit waiting for room.'
              : k === 'DROP_OLDEST'
                ? `<span class="good">DROP_OLDEST:</span> the producer never waited. When the queue was full, the oldest waiting value made room. The newest values survive.`
                : `<span class="good">DROP_LATEST:</span> the producer never waited. When the queue was full, the new value was thrown away. The early values survive.`);
          }));
          const r0 = build('SUSPEND'); cur.paint(T); stats.textContent = report('SUSPEND', r0);
          o.innerHTML = 'The producer emits every 250 ms, handle() takes 700 ms, and the queue holds 2. Play each mode.';
          el.append(h('div', { class: 'controls' }, btns), snippet, slot, stats, o);
        },
      },
      {
        title: 'A buffer between two slow stages makes a pipeline',
        body: `<p><code>buffer()</code> splits the chain into two coroutines at the point where you put it. Everything above runs in one, everything below in the other. If both sides do slow work, like decoding and then saving, they now overlap: the next value decodes while the last one saves.</p>
<p>Where you put it matters. A buffer above both slow stages leaves them in the same coroutine, taking turns, and gains nothing.</p>`,
        code: `frames
    .map { decode(it) }    // 400 ms each, in the upstream coroutine
    .buffer()
    .collect { save(it) }  // 400 ms each, overlaps with the next decode`,
        visual(el) {
          const D = 400, S = 400, N = 5;
          const MODES = {
            none: ['.map { decode }.collect { save }', 'no buffer'],
            above: ['.buffer().map { decode }.collect { save }', 'buffer above both'],
            between: ['.map { decode }.buffer().collect { save }', 'buffer between'],
          };
          const keys = Object.keys(MODES);
          function sim(k) {
            const dec = [], sav = [];
            let tD = 0, tS = 0;
            for (let i = 1; i <= N; i++) {
              if (k === 'between') { dec.push({ s: tD, e: tD + D, k: 'run', label: i }); tD += D; const s = Math.max(tD, tS); sav.push({ s, e: s + S, k: 'done', label: i }); tS = s + S; }
              else { dec.push({ s: tD, e: tD + D, k: 'run', label: i }); sav.push({ s: tD + D, e: tD + D + S, k: 'done', label: i }); tD += D + S; tS = tD; }
            }
            return { dec, sav, end: Math.max(tD, tS) };
          }
          const T = 4200;
          const slot = h('div'), stats = h('p', { class: 'tip' }), snippet = h('div', { class: 'kt' });
          const o = out();
          let gen = 0, cur;
          function build(k) {
            const r = sim(k);
            cur = board([{ name: 'decode', bars: r.dec }, { name: 'save', bars: r.sav }], T);
            slot.replaceChildren(cur.node); snippet.innerHTML = hl('frames' + MODES[k][0]); pressed(btns, keys, k);
            return r;
          }
          const btns = keys.map(k => cmd(MODES[k][1], async () => {
            const my = ++gen; const r = build(k);
            stats.textContent = 'running…';
            if (!(await playT(cur.node, T, cur.paint, 1, () => gen === my))) return;
            stats.textContent = `${N} frames in ${(r.end / 1000).toFixed(1)} s`;
            say(o, k === 'between'
              ? '<span class="good">pipeline:</span> decode and save overlapped. The total is close to the slower stage times 5, plus one decode.'
              : k === 'above' ? '<span class="bad">no gain:</span> decode and save are both below the buffer, in the same coroutine, so they still take turns.' : '<span class="muted">no buffer:</span> one coroutine. Each frame decodes, then saves, then the next starts.');
          }));
          const r0 = build('none'); cur.paint(T); stats.textContent = `${N} frames in ${(r0.end / 1000).toFixed(1)} s`;
          o.innerHTML = 'decode and save each take 400 ms. Move the buffer and compare the total.';
          el.append(h('div', { class: 'controls' }, btns), snippet, slot, stats, o);
        },
      },
      {
        title: 'Hot flows have buffers too',
        body: `<p>A <code>MutableSharedFlow()</code> with default settings has no buffer. Its <code>emit</code> waits for slow collectors, and <code>tryEmit</code>, the only option from a non-suspending callback, fails while anyone is collecting. Give it room with <code>extraBufferCapacity</code> and say what to drop when that fills. A StateFlow needs none of this, because it always keeps just the latest value.</p>`,
        code: `private val _clicks = MutableSharedFlow<Click>(
    extraBufferCapacity = 64,
    onBufferOverflow = BufferOverflow.DROP_OLDEST,
)
fun onClick(c: Click) { _clicks.tryEmit(c) }   // never suspends, never fails`,
      },
    ],
    underHood: {
      body: `<p>Without these operators, <code>emit</code> is a direct call into the collector, so there is nothing to overflow. <code>buffer</code>, <code>conflate</code>, <code>flowOn</code> and <code>channelFlow</code> are all built on one internal class, <code>ChannelFlow</code>. When you apply one of them, the upstream is launched in its own coroutine with <code>produceIn</code> and sends into a channel, and the downstream receives from it.</p>
<p>Applied next to each other, these operators fuse into a single channel instead of stacking several. Explicit capacities add up, and a buffer with a drop strategy overrides the ones before it. <code>collectLatest</code> is also built from them: it is <code>mapLatest(action).buffer(0).collect()</code>.</p>`,
      code: `// Fused into one channel, not two
flow.flowOn(Dispatchers.Default).buffer(16)

// conflate() is buffer(Channel.CONFLATED): keep only the newest value
flow.conflate()`,
    },
    mistakes: [
      {
        title: 'Blocking work inside collectLatest',
        bad: `bitmaps.collectLatest { b ->
    val small = scaleBlocking(b)   // CPU loop, never checks cancellation
    show(small)
}`,
        good: `bitmaps.collectLatest { b ->
    val small = withContext(Dispatchers.Default) { scale(b) }   // scale() calls ensureActive()
    show(small)
}`,
        why: 'Cancellation only lands at a suspension point. A blocking block can’t be cancelled, so collectLatest saves nothing and every stale image still gets scaled.',
      },
      {
        title: 'An unlimited buffer on a fast source',
        bad: `sensor.readings()              // 200 values a second
    .buffer(Channel.UNLIMITED)
    .collect { upload(it) }       // 5 a second`,
        good: `sensor.readings()
    .buffer(64, BufferOverflow.DROP_OLDEST)
    .collect { upload(it) }`,
        why: 'The queue grows by about 195 readings every second and never drains. Memory runs out slowly, in production. Bound the buffer and choose what to drop.',
      },
    ],
  };

  const errorsDepth = {
    deeper: [
      {
        title: 'Catch inside flatMapLatest to keep the stream alive',
        body: `<p>An exception that reaches the end of a chain completes it. If <code>catch</code> sits at the end of a search chain, one failed request ends the whole stream. It shows the error, and after that typing does nothing, because nobody collects the query anymore.</p>
<p>Put <code>catch</code> on the inner flow instead. Each search can fail on its own and turn into an error state, while the outer flow keeps listening for the next query.</p>`,
        code: `@OptIn(ExperimentalCoroutinesApi::class)
val state: Flow<SearchState> = query.flatMapLatest { q ->
    flow<SearchState> { emit(SearchState.Done(repo.search(q))) }
        .onStart { emit(SearchState.Loading) }
        .catch { emit(SearchState.Error) }          // per search
}`,
        visual(el) {
          let inner = false, alive, busy = false;
          const up = h('div', { class: 'flw-strip flw-wrap' });
          const status = h('span', { class: 'flw-gps' });
          const screen = h('div', { class: 'flw-shown' });
          const code = h('div', { class: 'kt' });
          const o = out();
          function reset() {
            alive = true; up.replaceChildren(); paint();
            screen.className = 'flw-shown wait'; screen.textContent = 'Type a query';
          }
          const paint = () => {
            status.className = 'flw-gps' + (alive ? '' : ' bad'); status.textContent = alive ? 'collecting query' : 'completed: nobody listens';
            code.innerHTML = hl(inner ? 'query.flatMapLatest { q ->\n    search(q).catch { emit(Error) }\n}' : 'query.flatMapLatest { q -> search(q) }\n    .catch { emit(Error) }');
          };
          async function type(q) {
            if (busy) return;
            up.append(h('span', { class: 'flw-v drop-in' + (alive ? ' acc' : ' gone') }, q));
            while (up.children.length > 6) up.firstElementChild.remove();
            if (!alive) { replay(screen, 'shake'); say(o, `<span class="bad">ignored:</span> the flow completed after the error. "${q}" goes nowhere.`); return; }
            busy = true;
            screen.className = 'flw-shown wait'; screen.textContent = `Loading "${q}"…`;
            await sleep(700); if (!el.isConnected) return;
            if (q !== 'crash') {
              screen.className = 'flw-shown'; screen.textContent = `Results for "${q}"`; replay(screen, 'pop');
              say(o, `<span class="good">ok:</span> "${q}" loaded.`);
            } else if (inner) {
              screen.className = 'flw-shown stale'; screen.textContent = 'Search failed. Try again.'; replay(screen, 'pop');
              say(o, '<span class="good">caught inside:</span> only this search failed. The outer flow still collects the query.');
            } else {
              alive = false; paint(); replay(status, 'shake');
              screen.className = 'flw-shown stale'; screen.textContent = 'Search failed.';
              say(o, '<span class="bad">caught at the end:</span> the error completed the whole chain. Now type something else.');
            }
            busy = false;
          }
          const sw = h('input', { type: 'checkbox', id: 'flw-d2er-inner', onchange() { inner = this.checked; reset(); say(o, inner ? 'catch moved into the inner flow.' : 'catch is at the end of the chain.'); } });
          reset();
          o.innerHTML = 'Search "kotlin", then "crash", then "flow".';
          el.append(
            code,
            h('label', { class: 'switch', for: 'flw-d2er-inner' }, sw, 'put catch on the inner flow'),
            h('div', { class: 'controls' }, cmd('type "kotlin"', () => type('kotlin')), cmd('type "crash"', () => type('crash')), cmd('type "flow"', () => type('flow'))),
            h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'query'), up),
            h('div', { class: 'flw-ph' }, status), screen, o);
        },
      },
      {
        title: 'Don’t wrap emit in try/catch',
        body: `<p><code>emit</code> runs the downstream code. A <code>try</code> around it in the producer also catches exceptions thrown by the collector. Flows have a rule called exception transparency: once downstream has failed, the producer must not emit again. If it does, the flow throws an IllegalStateException that says exception transparency is violated.</p>
<p>Use the <code>catch</code> operator for upstream errors. To catch errors from your own handling code, move that code into <code>onEach</code> above <code>catch</code>.</p>`,
        code: `numbers
    .onEach { render(it) }               // may throw
    .catch { e -> showError(e) }         // sees render's exception: it is upstream now
    .launchIn(scope)`,
        visual(el) {
          let busy = false;
          const V = {
            tryemit: { code: 'flow { for (i in 1..3) {\n    try { emit(i) } catch (e: Exception) { emit(-1) }\n} }.collect { render(it) }', label: 'try { emit(i) } catch { emit(-1) }' },
            op: { code: 'flow { for (i in 1..3) emit(i) }\n    .catch { emit(-1) }\n    .collect { render(it) }', label: '.catch { }.collect { render }' },
            onEach: { code: 'flow { for (i in 1..3) emit(i) }\n    .onEach { render(it) }\n    .catch { showError(it) }\n    .launchIn(scope)', label: '.onEach { render }.catch { }' },
          };
          const keys = Object.keys(V);
          const code = h('div', { class: 'kt' });
          const got = h('div', { class: 'flw-strip flw-wrap' });
          const result = h('div', { class: 'flw-shown wait' }, 'render(2) throws');
          const o = out();
          async function run(k) {
            if (busy) return; busy = true;
            pressed(btns, keys, k); code.innerHTML = hl(V[k].code); got.replaceChildren();
            result.className = 'flw-shown wait'; result.textContent = 'running…';
            for (let i = 1; i <= 2; i++) {
              await sleep(450); if (!el.isConnected) return;
              got.append(h('span', { class: 'flw-v drop-in ' + (i === 2 ? 'bad' : 'ok') }, String(i)));
            }
            await sleep(450); if (!el.isConnected) return;
            if (k === 'tryemit') {
              got.append(h('span', { class: 'flw-v warn drop-in' }, 'emit(-1)'));
              await sleep(350); if (!el.isConnected) return;
              result.className = 'flw-shown stale'; result.textContent = 'IllegalStateException: Flow exception transparency is violated';
              say(o, '<span class="bad">broken:</span> the producer caught render’s exception and emitted again into a collector that had already failed.');
            } else if (k === 'op') {
              result.className = 'flw-shown stale'; result.textContent = 'render’s exception reaches the caller of collect';
              say(o, '<span class="muted">transparent:</span> catch let the downstream exception pass. It is not for errors below it. Handle it where you call collect, or use onEach.');
            } else {
              result.className = 'flw-shown'; result.textContent = 'catch handled it: showError(IllegalStateException)';
              say(o, '<span class="good">caught:</span> render runs in onEach, above catch, so its exception is upstream and catch sees it.');
            }
            replay(result, 'pop');
            busy = false;
          }
          const btns = keys.map(k => cmd(V[k].label, () => run(k)));
          code.innerHTML = hl(V.tryemit.code); pressed(btns, keys, 'tryemit');
          o.innerHTML = 'render(2) throws. Run each version.';
          el.append(h('div', { class: 'controls' }, btns), code,
            h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'render'), got), result, o);
        },
      },
    ],
    underHood: {
      body: `<p><code>catch</code> collects the upstream inside a try block, but it wraps the downstream emit so it can tell where an exception came from. An exception thrown by downstream code is rethrown untouched, and so is cancellation. Only exceptions from upstream reach your block.</p>
<p><code>retry</code> and <code>retryWhen</code> are a loop around that same machinery. When the upstream fails and your predicate returns true, they collect the upstream again from the very start. Values it emitted before failing are emitted again.</p>`,
      code: `// retryWhen, close to the real implementation
fun <T> Flow<T>.retryWhen(predicate: suspend FlowCollector<T>.(Throwable, Long) -> Boolean): Flow<T> = flow {
    var attempt = 0L
    do {
        var again = false
        val cause = catchImpl(this)                   // collect upstream, return its exception
        if (cause != null) {
            if (predicate(cause, attempt)) { again = true; attempt++ } else throw cause
        }
    } while (again)
}`,
    },
    mistakes: [
      {
        title: 'Retrying a flow that already emitted',
        bad: `flow {
    emit(UiState.Loading)
    emit(UiState.Success(api.load()))
}.retry(3)
// every attempt shows Loading again, and partial results repeat`,
        good: `flow { emit(api.load()) }
    .retry(3) { it is IOException }
    .map<Data, UiState> { UiState.Success(it) }
    .onStart { emit(UiState.Loading) }`,
        why: 'retry collects the upstream again from the start, so anything it emitted before the failure is emitted again. Keep retry tight around the request.',
      },
      {
        title: 'catch above the operator that throws',
        bad: `api.stream()
    .catch { emit(Event.Error) }
    .map { parse(it) }          // parse errors are not caught`,
        good: `api.stream()
    .map { parse(it) }
    .catch { emit(Event.Error) }`,
        why: 'catch only sees exceptions from above it. Put it after every operator whose errors it should handle.',
      },
      {
        title: 'An empty catch',
        bad: `repo.articles()
    .catch { }                  // swallowed
    .collect { _state.value = UiState.Success(it) }`,
        good: `repo.articles()
    .map<List<Article>, UiState> { UiState.Success(it) }
    .catch { e -> emit(UiState.Error(e.message)) }
    .collect { _state.value = it }`,
        why: 'The flow completes quietly and the screen stays on its spinner forever. Turn the error into state the user can see and act on.',
      },
    ],
  };

  const callbackDepth = {
    deeper: [
      {
        title: 'Choose the buffer for bursts',
        body: `<p>Between the listener and the collector sits a channel. By default it is <code>BUFFERED</code>, 64 values, and <code>trySend</code> fails once it is full. You can change it from outside with <code>buffer()</code> or <code>conflate()</code>, which fuse into that channel.</p>
<p>Pick by meaning. For state, like connectivity or a sensor reading, only the latest value matters, so <code>conflate()</code>. For events that must all arrive, keep a buffer large enough, or use <code>buffer(Channel.UNLIMITED)</code> if the source is bounded.</p>`,
        code: `fun SensorManager.light(): Flow<Float> = callbackFlow {
    val listener = lightListener { trySend(it) }
    registerListener(listener, lightSensor, SensorManager.SENSOR_DELAY_UI)
    awaitClose { unregisterListener(listener) }
}.conflate()   // the collector only ever needs the newest reading`,
        visual(el) {
          const E = 8, GAP = 100, C = 500;
          const MODES = { def: 'callbackFlow { … }', b2: 'callbackFlow { … }.buffer(2)', con: 'callbackFlow { … }.conflate()' };
          const keys = Object.keys(MODES);
          let busy = false;
          const ev = h('div', { class: 'flw-strip flw-wrap' });
          const q = h('div', { class: 'flw-strip flw-wrap' });
          const cur = h('div', { class: 'flw-strip' });
          const done = h('div', { class: 'flw-strip flw-wrap' });
          const stats = h('p', { class: 'tip' });
          const o = out();
          const empty = s => { if (!s.children.length) s.append(h('span', { class: 'flw-note' }, 'empty')); };
          const clearNote = s => s.querySelectorAll('.flw-note').forEach(x => x.remove());
          async function run(k) {
            if (busy) return; busy = true;
            pressed(btns, keys, k);
            [ev, q, cur, done].forEach(s => s.replaceChildren()); [q, cur, done].forEach(empty);
            const cap = k === 'def' ? 64 : k === 'b2' ? 2 : 1;
            const queue = []; let busyUntil = 0, inHand = null, sent = 0, failed = 0, lost = 0;
            say(o, `${hl(MODES[k])} <span class="muted">// 8 events, 100 ms apart. The collector needs 500 ms each.</span>`);
            for (let t = 0; t <= E * GAP + 9 * C; t += 50) {
              if (t % GAP === 0 && t > 0 && t / GAP <= E) {
                const v = t / GAP;
                const chip = h('span', { class: 'flw-v drop-in' }, String(v));
                if (k === 'con') {
                  clearNote(q);
                  if (queue.length) { const old = queue.pop(); old.classList.add('fly-out'); setTimeout(() => old.remove(), 380); lost++; }
                  chip.classList.add('acc'); queue.push(chip); q.append(chip); sent++;
                  ev.append(h('span', { class: 'flw-v ok drop-in' }, `${v}: ok`));
                } else if (queue.length < cap) {
                  clearNote(q); chip.classList.add('acc'); queue.push(chip); q.append(chip); sent++;
                  ev.append(h('span', { class: 'flw-v ok drop-in' }, `${v}: ok`));
                } else {
                  failed++;
                  ev.append(h('span', { class: 'flw-v bad drop-in' }, `${v}: failed`));
                }
              }
              if (inHand && t >= busyUntil) { inHand.className = 'flw-v ok'; clearNote(done); moveTo(inHand, done); inHand = null; empty(cur); }
              if (!inHand && queue.length) { inHand = queue.shift(); clearNote(cur); moveTo(inHand, cur); busyUntil = t + C; empty(q); }
              await sleep(50); if (!el.isConnected) return;
              if (t > E * GAP && !inHand && !queue.length) break;
            }
            const handled = done.querySelectorAll('.flw-v').length;
            stats.textContent = `trySend ok: ${sent} · trySend failed: ${failed} · replaced by newer: ${lost} · handled: ${handled}`;
            say(o, k === 'def'
              ? '<span class="good">default buffer:</span> all 8 fit in 64 slots. Every event was handled, the last one long after it happened.'
              : k === 'b2'
                ? `<span class="bad">buffer(2):</span> while the collector was busy, only 2 could wait. ${failed} trySend calls failed and those events were lost.`
                : `<span class="good">conflate():</span> each new event replaced the waiting one. Only the newest was handled next, which is right for state.`);
            busy = false;
          }
          const btns = keys.map(k => cmd(MODES[k], () => run(k)));
          [q, cur, done].forEach(empty);
          stats.textContent = 'A burst of 8 listener calls meets a slow collector.';
          o.innerHTML = 'Pick a buffer and fire the burst.';
          el.append(h('div', { class: 'controls' }, btns),
            h('div', { class: 'flw-search' },
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'trySend'), ev),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'channel'), q),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'now'), cur),
              h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'done'), done)),
            stats, o);
        },
      },
      {
        title: 'One listener for many collectors: share it',
        body: `<p>Each collector of a <code>callbackFlow</code> runs the block again, so each one registers its own listener. Two screens watching connectivity means two network callbacks.</p>
<p>Put <code>stateIn</code> or <code>shareIn</code> after it, in a scope that outlives the screens, and they share one listener. The lesson stateIn vs shareIn covers how to pick.</p>`,
        code: `class NetworkMonitor(cm: ConnectivityManager, appScope: CoroutineScope) {
    val isOnline: StateFlow<Boolean> = cm.isOnline()     // the callbackFlow above
        .stateIn(appScope, SharingStarted.WhileSubscribed(5_000), false)
}`,
      },
    ],
    underHood: {
      body: `<p><code>callbackFlow</code> is a <code>channelFlow</code> with one extra check. When collection starts, your block runs in a <code>ProducerScope</code>, a coroutine launched in the collector’s scope that owns the channel. <code>trySend</code> and <code>send</code> write to that channel and the collector reads from it.</p>
<p><code>awaitClose</code> suspends until the channel is closed or the collector is cancelled, then runs your block in a <code>finally</code>, so the cleanup runs on every exit path. When your block returns, callbackFlow checks that the channel was closed. If it is still open, which happens when you forget <code>awaitClose</code>, it throws an IllegalStateException that tells you to call awaitClose.</p>`,
      code: `// awaitClose, close to the real implementation
suspend fun ProducerScope<*>.awaitClose(block: () -> Unit = {}) {
    try {
        suspendCancellableCoroutine<Unit> { cont -> invokeOnClose { cont.resume(Unit) } }
    } finally {
        block()   // unregister here
    }
}`,
    },
    mistakes: [
      {
        title: 'Blocking a callback thread to send',
        bad: `override fun onEvent(e: Event) {
    runBlocking { send(e) }    // blocks the main thread when the buffer is full
}`,
        good: `override fun onEvent(e: Event) {
    trySend(e)                 // never blocks; pick a buffer that fits the source
}`,
        why: '<code>runBlocking</code> on the main thread freezes the UI while the collector catches up, and can lead to an ANR. <code>trySend</code> returns at once.',
      },
      {
        title: 'Ignoring the listener’s error callback',
        bad: `override fun onError(error: Exception) {
    Log.e("Feed", "listener failed", error)
}`,
        good: `override fun onError(error: Exception) {
    close(error)    // the collector's catch sees it, then awaitClose cleans up
}`,
        why: 'Logging alone keeps the flow open with nothing coming, so the screen waits forever. <code>close(error)</code> ends the flow with that exception.',
      },
      {
        title: 'Not sending the current state first',
        bad: `fun SharedPreferences.theme(): Flow<String?> = callbackFlow {
    val l = OnSharedPreferenceChangeListener { p, key -> if (key == "theme") trySend(p.getString(key, null)) }
    registerOnSharedPreferenceChangeListener(l)
    awaitClose { unregisterOnSharedPreferenceChangeListener(l) }
}`,
        good: `fun SharedPreferences.theme(): Flow<String?> = callbackFlow {
    trySend(getString("theme", null))          // what is true right now
    val l = OnSharedPreferenceChangeListener { p, key -> if (key == "theme") trySend(p.getString(key, null)) }
    registerOnSharedPreferenceChangeListener(l)
    awaitClose { unregisterOnSharedPreferenceChangeListener(l) }
}`,
        why: 'A listener that only reports changes leaves a new collector with nothing until the next change, which may never come.',
      },
    ],
  };

  // ─── flatMapConcat / Merge / Latest ─────────────────
  const flatmap = {
    id: 'flatmap',
    title: 'flatMapLatest, Concat and Merge',
    tagline: 'Each value starts a flow. Choose to wait, to mix, or to cancel the old one.',
    body: `
<p>Sometimes each value should start a flow of its own. A search query starts a request. A chapter id starts a page download. The <code>flatMap</code> operators run that inner flow and pass its values on as one flat stream.</p>
<p><code>flatMapConcat</code> runs the inner flows one at a time, in order. The next one starts only after the previous one completes. <code>flatMapMerge</code> runs them at the same time, up to <code>concurrency</code> (16 by default), and passes values on as they arrive, mixed together.</p>
<p><code>flatMapLatest</code> cancels the running inner flow as soon as a new value arrives. Search-as-you-type needs exactly this. Typing "kot" cancels the request for "ko", so a slow, old answer can never replace a newer one.</p>`,
    code: `@OptIn(ExperimentalCoroutinesApi::class)
class SearchViewModel(private val repo: SearchRepository) : ViewModel() {
    private val query = MutableStateFlow("")

    // A new query cancels the search still running for the old one
    val results: StateFlow<SearchState> = query
        .flatMapLatest { q ->
            flow<SearchState> {
                emit(SearchState.Loading)
                emit(SearchState.Done(repo.search(q)))
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SearchState.Idle)

    fun onType(text: String) { query.value = text }
}

// One chapter at a time, pages stay in order
@OptIn(ExperimentalCoroutinesApi::class)
val pages: Flow<Page> = chapterIds.asFlow().flatMapConcat { id -> repo.pages(id) }

// Up to 4 thumbnails at once, in whatever order they finish
@OptIn(ExperimentalCoroutinesApi::class)
val thumbs: Flow<Thumb> = photoIds.asFlow()
    .flatMapMerge(concurrency = 4) { id -> flow { emit(repo.thumb(id)) } }`,
    remember: 'Concat waits its turn, Merge runs them all at once, Latest cancels the old one.',
    level: 'intermediate',
    terms: [
      { term: 'flatMapLatest', def: 'Starts an inner flow for each value and cancels the previous inner flow when a new value arrives.' },
      { term: 'flatMapConcat', def: 'Starts an inner flow for each value and runs them one after another, each waiting for the previous one to complete.' },
      { term: 'flatMapMerge', def: 'Starts an inner flow for each value and collects up to a set number of them at the same time, mixing their values.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Load up to 4 thumbnails at once, and make search drop stale requests.', code: `val thumbs = photoIds.asFlow()
    .[[flatMapMerge]](concurrency = 4) { id -> flow { emit(loadThumb(id)) } }

val results = query.[[flatMapLatest]] { q -> repo.search(q) }`, why: '<code>flatMapMerge</code> runs several inner flows at once. <code>flatMapLatest</code> cancels the old search when a new query arrives.' },
      { type: 'bug', prompt: 'Sometimes the list shows results for an older query. Tap the bug.', code: `@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
val results: Flow<List<Article>> = query
    .debounce(300)
    .filter { it.length >= 2 }
    .flatMapMerge { q -> repo.search(q) }`, bug: 4, fix: '    .flatMapLatest { q -> repo.search(q) }', why: '<code>flatMapMerge</code> keeps old searches running. If the search for an older query is slower, its results arrive last and replace the newer ones.' },
    ],
    quiz: [
      { q: 'Upstream emits A, then B while the inner flow for A is still running. With <code>flatMapLatest</code>, what happens to A’s inner flow?', options: ['It finishes, then B starts', 'It is cancelled and B starts', 'A and B run together'], a: 1, why: 'A new value cancels the inner flow that is still running for the previous one.' },
      { q: 'File chunks must upload one at a time, in order. Which operator fits?', options: ['<code>flatMapConcat</code>', '<code>flatMapMerge</code>', '<code>flatMapLatest</code>'], a: 0, why: 'Concat starts the next inner flow only after the previous one completes, so order is kept.' },
      { q: 'How many inner flows does <code>flatMapMerge { }</code> collect at once by default?', options: ['1', '16', 'No limit'], a: 1, why: 'The default concurrency is 16. Pass <code>concurrency</code> to change it.' },
    ],
    deeper: flatmapDepth.deeper,
    underHood: flatmapDepth.underHood,
    mistakes: flatmapDepth.mistakes,
    visual(el) {
      const T = 3700, STEP = 400;
      const UP = [['A', 0, 0], ['B', 500, 1], ['C', 1000, 2]];
      const MODES = {
        concat: { label: 'flatMapConcat', start: [0, 1200, 2400], cut: [null, null, null], note: '<span class="good">flatMapConcat:</span> B waited until inner(A) completed, and C waited for B. The order is kept, but it took the longest.' },
        merge: { label: 'flatMapMerge', start: [0, 500, 1000], cut: [null, null, null], note: '<span class="good">flatMapMerge:</span> all three inner flows ran at the same time, so values came out mixed. A2 came before B1, and B3 before C2.' },
        latest: { label: 'flatMapLatest', start: [0, 500, 1000], cut: [500, 1000, null], note: '<span class="good">flatMapLatest:</span> B cancelled inner(A) after A1, and C cancelled inner(B) after B1. Only the newest inner flow ran to the end.' },
      };
      const keys = Object.keys(MODES);
      const slot0 = h('div');
      const codeLine = h('div', { class: 'flw-op' });
      const o = out();
      let gen = 0, cur;
      function build(k) {
        const m = MODES[k], outM = [];
        const rows = [{ name: 'upstream', marbles: UP.map(([v, t, c]) => ({ t, v, c })), end: 1100 }];
        UP.forEach(([v, t, c], i) => {
          const s = m.start[i], cut = m.cut[i], e = cut != null ? cut : s + 3 * STEP;
          const bars = [];
          if (s > t) bars.push({ s: t, e: s, k: 'wait', label: 'waits' });
          bars.push({ s, e, k: cut != null ? 'cut' : 'run' });
          const marbles = [];
          for (let j = 1; j <= 3; j++) {
            const at = s + j * STEP;
            if (cut == null || at < cut) { marbles.push({ t: at, v: v + j, c }); outM.push({ t: at, v: v + j, c }); }
          }
          rows.push({ name: `inner(${v})`, bars, marbles, marks: cut != null ? [cut] : [] });
        });
        rows.push({ name: 'collect', marbles: outM, end: Math.max(...outM.map(x => x.t)) + 100 });
        cur = board(rows, T);
        slot0.replaceChildren(cur.node);
        codeLine.innerHTML = hl(`letters.${m.label} { x -> inner(x) }   // inner emits x1, x2, x3, 400 ms apart`);
        pressed(buttons, keys, k);
      }
      const buttons = keys.map(k => cmd(MODES[k].label, async () => {
        const my = ++gen;
        build(k);
        say(o, `<span class="muted">playing</span> ${hl(MODES[k].label)}`);
        if (await playT(cur.node, T, cur.paint, 1.25, () => gen === my)) say(o, MODES[k].note);
      }));
      build('latest'); cur.paint(T);
      o.innerHTML = 'Upstream sends A, B and C. Each one starts an inner flow of three values. Play each operator and compare.';

      // Search-as-you-type on real keystrokes.
      const input = h('input', { id: 'flw-fm-q', value: 'kotlin', spellcheck: 'false', autocomplete: 'off' });
      const reqs = h('div', { class: 'flw-reqs' });
      const shown = h('div', { class: 'flw-shown' }, 'Screen shows results for "kotlin"');
      const stats = h('p', { class: 'tip' });
      const so = out('Type in the box. Each change starts a search. Shorter queries match more, so they are slower here.');
      let smode = 'latest', started = 0, cancelled = 0, stale = 0, typing = false;
      const live = new Set();
      const paintStats = () => { stats.textContent = `searches started: ${started} · cancelled: ${cancelled} · stale results shown: ${stale}`; };
      function cancel(r) {
        clearTimeout(r.timer); live.delete(r); cancelled++;
        const w = getComputedStyle(r.bar).width;
        r.bar.style.transition = 'none'; r.bar.style.width = w;
        r.st.textContent = 'cancelled'; r.st.className = 'flw-stat'; r.row.classList.add('cut');
      }
      function request(q) {
        const lat = 500 + Math.max(0, 6 - q.length) * 260;
        const bar = h('i'), st = h('span', { class: 'flw-stat on' }, 'loading');
        const row = h('div', { class: 'flw-req drop-in' }, h('span', { class: 'flw-src' }, `search("${q}")`), h('span', { class: 'flw-prog' }, bar), st);
        reqs.prepend(row);
        while (reqs.children.length > 6) reqs.lastElementChild.remove();
        void bar.offsetWidth;
        bar.style.transition = `width ${lat}ms linear`; bar.style.width = '100%';
        if (smode === 'latest') [...live].forEach(cancel);
        const r = { row, bar, st };
        live.add(r); started++; paintStats();
        shown.className = 'flw-shown wait'; shown.textContent = 'Loading…';
        r.timer = setTimeout(() => {
          live.delete(r);
          if (!input.isConnected) return;
          st.textContent = 'done'; st.className = 'flw-stat fin'; row.classList.add('ok');
          const now = input.value.trim(), old = q !== now;
          if (old) stale++;
          shown.className = 'flw-shown' + (old ? ' stale' : '');
          shown.textContent = old ? `Screen shows results for "${q}", but you typed "${now}"` : `Screen shows results for "${q}"`;
          replay(shown, 'pop-soft'); paintStats();
          if (old) say(so, `<span class="bad">stale:</span> the old search for "${q}" finished last and replaced newer results. flatMapLatest would have cancelled it.`);
          else if (!live.size) say(so, smode === 'latest' ? `<span class="good">ok:</span> every older search was cancelled, so only "${q}" reached the screen.` : `<span class="good">ok:</span> "${q}" finished last this time.`);
        }, lat);
      }
      input.addEventListener('input', () => { const q = input.value.trim(); if (q) request(q); });
      const modeBtns = [
        cmd('flatMapLatest { search(it) }', () => { smode = 'latest'; pressed(modeBtns, ['latest', 'merge'], smode); say(so, '<span class="muted">mode:</span> flatMapLatest. Each keystroke cancels the search still running.'); }),
        cmd('flatMapMerge { search(it) }', () => { smode = 'merge'; pressed(modeBtns, ['latest', 'merge'], smode); say(so, '<span class="muted">mode:</span> flatMapMerge. Old searches keep running. Watch which one lands last.'); }),
      ];
      pressed(modeBtns, ['latest', 'merge'], smode);
      paintStats();
      el.append(
        h('div', { class: 'controls' }, buttons), codeLine, slot0, o,
        h('div', { class: 'flw-search' },
          h('div', { class: 'controls' }, modeBtns),
          h('label', { class: 'field-input', for: 'flw-fm-q' }, 'Search', input),
          h('div', { class: 'controls' }, cmd('type "kotlin"', async () => {
            if (typing) return; typing = true;
            input.value = '';
            for (const ch of 'kotlin') {
              await sleep(170); if (!input.isConnected) return;
              input.value += ch; input.dispatchEvent(new Event('input'));
            }
            typing = false;
          })),
          reqs, shown, stats),
        so);
    },
  };

  // ─── buffer / conflate / collectLatest ─────────────────
  const backpressure = {
    id: 'backpressure',
    title: 'Buffer, conflate and collectLatest',
    tagline: 'What to do when the producer is faster than the collector.',
    body: `
<p>By default a flow runs in one coroutine. <code>emit</code> calls your collector directly and waits for it to finish. A slow collector slows the producer down. Nothing is lost, but the two sides take turns instead of working at the same time.</p>
<p><code>buffer()</code> runs the producer in its own coroutine with a queue in between (64 slots by default). The producer keeps going while the collector works, and every value is still handled. <code>conflate()</code> keeps only the newest value in that queue. When the collector is ready, it gets the latest value and the ones it missed are dropped.</p>
<p><code>collectLatest</code> goes one step further. A new value cancels the block that is still handling the old one. Use it when only the newest value matters, like rendering a preview. Use <code>conflate</code> when each handling must finish, like an upload.</p>`,
    code: `val readings: Flow<Reading> = sensor.readings()   // a new value every 100 ms

// Every value is handled. The producer never waits for the collector.
readings.buffer(capacity = 64).collect { log.write(it) }

// The collector skips what it missed, but each upload finishes
readings.conflate().collect { api.uploadLatest(it) }

// Only the newest matters. A new value cancels the render in progress.
readings.collectLatest { reading ->
    val chart = renderChart(reading)     // suspending and cancellable
    _chart.value = chart
}`,
    remember: 'buffer keeps them all, conflate keeps the latest, collectLatest cancels the old work.',
    level: 'advanced',
    terms: [
      { term: 'Backpressure', def: 'What happens when values arrive faster than the collector can handle them; by default a flow producer suspends in emit until the collector catches up.' },
      { term: 'buffer', def: 'Runs the upstream in a separate coroutine with a queue, so the producer can keep emitting while the collector is busy.' },
      { term: 'conflate', def: 'A buffer that keeps only the most recent value, so a slow collector skips the values it missed.' },
      { term: 'collectLatest', def: 'A terminal operator that cancels the block handling the previous value when a new value arrives.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Show only the newest preview, and keep every log line while the producer runs ahead.', code: `previews.[[collectLatest]] { p ->
    _image.value = render(p)
}

logLines.[[buffer]]().collect { file.appendLine(it) }`, why: '<code>collectLatest</code> cancels a half-done render. <code>buffer</code> queues values, so none are lost.' },
      { type: 'bug', prompt: 'Analytics reports fewer taps than users made. Tap the bug.', code: `fun trackAll(events: Flow<AnalyticsEvent>) {
    appScope.launch {
        events
            .conflate()
            .collect { analytics.send(it) }
    }
}`, bug: 3, fix: '            .buffer()', why: '<code>conflate</code> drops every value that arrives while the collector is busy. Each tap must be counted, so it needs <code>buffer</code>.' },
    ],
    quiz: [
      { q: 'No operators. The producer emits every 100 ms and the collector takes 500 ms per value. What does the producer do?', options: ['Keeps emitting every 100 ms', 'Waits inside <code>emit</code> until the collector finishes', 'Drops values'], a: 1, why: 'Without a buffer, <code>emit</code> runs the collector directly and returns only when it is done.' },
      { q: 'With <code>conflate()</code>, values 2, 3 and 4 arrive while the collector is busy with 1. What does it get next?', options: ['2', '4', '2, 3 and 4 in order'], a: 1, why: 'A conflated buffer holds only the latest value. 2 and 3 were overwritten.' },
      { q: 'With <code>collectLatest</code>, value 2 arrives while the block is still handling 1. What happens?', options: ['The block for 1 finishes first', 'The block for 1 is cancelled', 'Value 2 is dropped'], a: 1, why: 'collectLatest cancels the running block and starts again with the new value.' },
    ],
    deeper: backpressureDepth.deeper,
    underHood: backpressureDepth.underHood,
    mistakes: backpressureDepth.mistakes,
    visual(el) {
      const P = 400, C = 600, N = 5, T = 5000;
      const at = v => v * P;
      const MODES = {
        none: { label: 'no operator', code: 'readings.collect { handle(it) }       // emit waits for handle()' },
        buffer: { label: '.buffer()', code: 'readings.buffer().collect { handle(it) }' },
        conflate: { label: '.conflate()', code: 'readings.conflate().collect { handle(it) }' },
        latest: { label: 'collectLatest { }', code: 'readings.collectLatest { handle(it) }  // new value cancels handle()' },
      };
      const keys = Object.keys(MODES);
      function sim(mode) {
        const prod = [], emits = [], coll = [], queue = [], marks = [];
        if (mode === 'none') {
          let t = 0;
          for (let v = 1; v <= N; v++) {
            prod.push({ s: t, e: t + P, k: 'run' });
            prod.push({ s: t + P, e: t + P + C, k: 'wait' });
            emits.push({ t: t + P, v, c: v % 5 });
            coll.push({ s: t + P, e: t + P + C, k: 'done', label: v });
            t += P + C;
          }
        } else {
          for (let v = 1; v <= N; v++) { prod.push({ s: at(v) - P, e: at(v), k: 'run' }); emits.push({ t: at(v), v, c: v % 5 }); }
          if (mode === 'buffer') {
            let f = 0;
            for (let v = 1; v <= N; v++) {
              const s = Math.max(at(v), f);
              if (s > at(v)) queue.push({ s: at(v), e: s, k: 'wait', label: v, half: true, lo: v % 2 === 1 });
              coll.push({ s, e: s + C, k: 'done', label: v }); f = s + C;
            }
          } else if (mode === 'conflate') {
            let f = 0, next = 1;
            while (next <= N) {
              let take = next;
              if (at(next) <= f) {
                while (take + 1 <= N && at(take + 1) <= f) take++;
                for (let d = next; d < take; d++) { queue.push({ s: at(d), e: at(d + 1), k: 'cut', label: d, half: true, lo: d % 2 === 1 }); marks.push(at(d + 1)); }
              }
              const s = Math.max(at(take), f);
              if (s > at(take)) queue.push({ s: at(take), e: s, k: 'wait', label: take, half: true, lo: take % 2 === 1 });
              coll.push({ s, e: s + C, k: 'done', label: take }); f = s + C; next = take + 1;
            }
          } else {
            for (let v = 1; v <= N; v++) {
              const cut = v < N && at(v + 1) < at(v) + C ? at(v + 1) : null;
              coll.push({ s: at(v), e: cut != null ? cut : at(v) + C, k: cut != null ? 'cut' : 'done', label: v });
            }
          }
        }
        const end = Math.max(...coll.map(c => c.e));
        const done = coll.filter(c => c.k === 'done').map(c => c.label);
        const dropped = queue.filter(q => q.k === 'cut').map(q => q.label);
        const cut = coll.filter(c => c.k === 'cut').map(c => c.label);
        return { prod, emits, coll, queue, marks, end, done, dropped, cut };
      }
      const s1 = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
      function note(mode, r) {
        const secs = (r.end / 1000).toFixed(1) + ' s';
        if (mode === 'none') return `<span class="muted">no operator:</span> emit waited for each handle() to finish. The two sides took turns: ${N} values in ${secs}.`;
        if (mode === 'buffer') return `<span class="good">.buffer():</span> the producer ran ahead and values waited in the queue. All ${N} were handled, in ${secs}.`;
        if (mode === 'conflate') return `<span class="good">.conflate():</span> ${r.dropped.join(', ')} arrived while the collector was busy and got replaced by a newer value. ${r.done.length} of ${N} handled, in ${secs}.`;
        return `<span class="good">collectLatest:</span> each new value cancelled the handle() still running. ${s1(r.cut.length, 'block')} cancelled, only ${r.done.join(', ')} finished, at ${secs}.`;
      }
      const slot0 = h('div'), snippet = h('div', { class: 'kt' }), stats = h('p', { class: 'tip' });
      const o = out();
      let gen = 0, cur;
      function build(k) {
        const r = sim(k);
        cur = board([
          { name: 'producer', bars: r.prod, marbles: r.emits, end: r.emits[N - 1].t + 60 },
          { name: 'queue', bars: r.queue, marks: r.marks },
          { name: 'collector', bars: r.coll },
        ], T);
        slot0.replaceChildren(cur.node);
        snippet.innerHTML = hl(MODES[k].code);
        pressed(buttons, keys, k);
        stats.textContent = `finished at ${(r.end / 1000).toFixed(1)} s · handled: ${r.done.length} · dropped: ${r.dropped.length} · cancelled: ${r.cut.length}`;
        return r;
      }
      const buttons = keys.map(k => cmd(MODES[k].label, async () => {
        const my = ++gen;
        const r = build(k);
        stats.textContent = 'running…';
        say(o, `<span class="muted">playing</span> ${hl(MODES[k].code)}`);
        if (!(await playT(cur.node, T, cur.paint, 1, () => gen === my))) return;
        stats.textContent = `finished at ${(r.end / 1000).toFixed(1)} s · handled: ${r.done.length} · dropped: ${r.dropped.length} · cancelled: ${r.cut.length}`;
        say(o, note(k, r));
      }));
      build('none'); cur.paint(T);
      o.innerHTML = 'The producer needs 400 ms per value. handle() needs 600 ms. Play each option and compare the end time.';
      el.append(h('div', { class: 'controls' }, buttons), snippet, slot0,
        h('div', { class: 'legend' },
          h('span', {}, h('i', { class: 'flw-ibar on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'working'),
          h('span', {}, h('i', { class: 'flw-ibar wait on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'waiting'),
          h('span', {}, h('i', { class: 'flw-ibar done on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'handled'),
          h('span', {}, h('i', { class: 'flw-ibar cut on', style: 'position:static;margin:0 6px 0 0;display:inline-block' }), 'dropped or cancelled')),
        stats, o);
    },
  };

  // ─── catch / retry / retryWhen / onCompletion ─────────────────
  const errorsRetry = {
    id: 'errors-retry',
    title: 'Errors, retry and completion',
    tagline: 'catch looks upstream, retry runs it again, onCompletion always runs.',
    body: `
<p>An exception thrown inside a flow travels down to the collector and ends the collection. <code>catch { }</code> stops it on the way. It only sees exceptions from code above it, never from operators below it or from inside <code>collect</code>. In the catch block you can <code>emit</code> a fallback, like an error state.</p>
<p><code>retry(3)</code> collects the upstream again from the start when it fails. <code>retryWhen { cause, attempt -> }</code> lets you decide each time, and wait first. Waiting 1 s, then 2 s, then 4 s is called exponential backoff. It gives a flaky network time to recover without hammering the server. Retry only errors that can go away, like an <code>IOException</code>.</p>
<p><code>onCompletion { cause -> }</code> runs when the flow ends for any reason, like <code>finally</code>. <code>cause</code> is null on success and holds the exception on failure or cancellation. It sees the error but does not stop it.</p>`,
    code: `fun articles(): Flow<UiState> = flow<UiState> {
        emit(UiState.Success(api.fetchArticles()))
    }
    .retryWhen { cause, attempt ->
        if (cause is IOException && attempt < 3) {
            delay(1_000L shl attempt.toInt())   // wait 1 s, 2 s, then 4 s
            true                                // collect the upstream again
        } else {
            false
        }
    }
    .onStart { emit(UiState.Loading) }
    .catch { e -> emit(UiState.Error(e.message ?: "Could not load")) }  // upstream only
    .onCompletion { cause -> Log.d("Feed", "finished, cause = $cause") }

// In the ViewModel
articles()
    .onEach { _state.value = it }
    .launchIn(viewModelScope)`,
    remember: 'catch only looks up. retry starts over. onCompletion always runs.',
    level: 'intermediate',
    terms: [
      { term: 'catch (Flow)', def: 'An operator that handles exceptions thrown upstream of it and can emit a fallback value; it never sees exceptions from downstream.' },
      { term: 'retryWhen', def: 'An operator that, when the upstream fails, calls your lambda with the cause and attempt number and collects the upstream again if it returns true.' },
      { term: 'Exponential backoff', def: 'A retry policy that doubles the wait after each failed attempt, such as 1 s, 2 s, then 4 s.' },
      { term: 'onCompletion', def: 'An operator whose block runs when the flow ends, with a null cause on success and the exception on failure or cancellation.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Try up to 3 more times on network errors, then fall back to a placeholder.', code: `repo.prices()
    .[[retry]](3) { it is IOException }
    .[[catch]] { emit(Prices.Unavailable) }
    .collect { show(it) }`, why: '<code>retry</code> collects the upstream again while its predicate is true. <code>catch</code> handles what is left.' },
      { type: 'bug', prompt: 'When the login token expires, the profile screen spins forever. Tap the bug.', code: `fun profile(): Flow<Profile> = flow { emit(api.profile()) }
    .retryWhen { cause, attempt ->
        delay(1_000L shl attempt.toInt().coerceAtMost(5))
        true
    }
    .catch { emit(Profile.Guest) }`, bug: 3, fix: '        cause is IOException && attempt < 3', why: 'Returning <code>true</code> always retries forever, even for an expired token that will never succeed. Retry only errors that can go away, and cap the attempts.' },
    ],
    quiz: [
      { q: '<code>flow.catch { emit(Fallback) }.collect { error("bad") }</code>. Does catch handle the error thrown in collect?', options: ['Yes', 'No, catch only sees exceptions from upstream'], a: 1, why: 'collect is downstream of catch. To catch it, move the work into <code>onEach</code> above catch and use <code>launchIn</code>.' },
      { q: 'Why wait 1 s, then 2 s, then 4 s between retries?', options: ['To give a flaky network or busy server time to recover without hammering it', 'Because <code>retryWhen</code> requires it', 'To make tests slower'], a: 0, why: 'Exponential backoff spaces attempts out more each time, which helps the server and the battery.' },
      { q: 'The flow completes normally. What is <code>cause</code> in <code>onCompletion { cause -> }</code>?', options: ['<code>null</code>', 'A <code>CancellationException</code>', 'The last value'], a: 0, why: 'cause is null on success, and holds the exception on failure or cancellation.' },
    ],
    deeper: errorsDepth.deeper,
    underHood: errorsDepth.underHood,
    mistakes: errorsDepth.mistakes,
    visual(el) {
      const A = 500, T = 6000;
      const SERVERS = { ok: ['server: works', 0], flaky: ['server: fails twice', 2], down: ['server: down', 99] };
      const skeys = Object.keys(SERVERS);
      let server = 'flaky', busy = false;
      const STAGES = [['flow { api.fetch() }', 'upstream'], ['retryWhen { … }', 'IOException, attempt < 3'], ['catch { … }', 'upstream only'], ['onCompletion { … }', 'always runs'], ['collect { show(it) }', 'the screen']];
      const st = STAGES.map(([src, sub]) => {
        const small = h('small', {}, sub);
        return { box: h('div', { class: 'flw-stage' }, h('span', { html: hl(src) }), small), small, sub };
      });
      const pipe = h('div', { class: 'flw-pipe' }, st.map((s, i) => (i ? h('div', { class: 'flw-step' }, h('span', { class: 'flw-arrow', 'aria-hidden': 'true' }, '→'), s.box) : s.box)));
      const mark = (i, cls, text) => { st[i].box.className = 'flw-stage' + (cls ? ' ' + cls : ''); st[i].small.textContent = text || st[i].sub; if (cls) replay(st[i].box, cls === 'fail' ? 'shake' : 'pop-soft'); };
      const clear = () => st.forEach((_, i) => mark(i, ''));
      const screen = h('div', { class: 'flw-shown' }, 'Success: 20 articles');
      const show = (cls, text) => { screen.className = 'flw-shown' + (cls ? ' ' + cls : ''); screen.textContent = text; replay(screen, 'pop'); };
      const slot0 = h('div');
      const log = h('div', { class: 'out flw-log', 'aria-live': 'polite' });
      const line = html => { log.append(h('div', { html })); while (log.children.length > 6) log.firstElementChild.remove(); };
      function schedule(fails, throwing) {
        const bars = [], ev = [];
        let t = 0, attempt = 0;
        ev.push([0, () => { show('wait', 'Loading…'); mark(0, 'on', 'attempt 1'); line('<span class="muted">onStart:</span> emit(Loading)'); }]);
        for (;;) {
          const failed = attempt < fails;
          bars.push({ s: t, e: t + A, k: failed ? 'cut' : 'done', label: `#${attempt + 1}` });
          t += A;
          if (!failed) {
            ev.push([t, throwing ? () => {
              mark(0, 'ok', 'returned 20 articles'); mark(4, 'on', 'handling Success');
              show('', 'Success: 20 articles');
              line('<span class="good">attempt 1:</span> 200 OK, emit(Success)');
            } : () => {
              mark(0, 'ok', 'returned 20 articles'); mark(1, ''); mark(2, 'skip', 'nothing to catch'); mark(3, 'ok', 'cause = null'); mark(4, 'ok', 'Success');
              show('', `Success: 20 articles${attempt ? ` after ${attempt + 1} attempts` : ''}`);
              line(`<span class="good">attempt ${attempt + 1}:</span> 200 OK, emit(Success)`);
              line('<span class="muted">onCompletion:</span> cause = null');
            }]);
            break;
          }
          const n = attempt, retry = n < 3, wait = 500 * 2 ** n;
          ev.push([t, () => {
            mark(0, 'fail', 'IOException');
            if (retry) { mark(1, 'on', `attempt ${n} → retry in ${2 ** n} s`); line(`<span class="bad">attempt ${n + 1}:</span> IOException. retryWhen(attempt = ${n}) waits ${2 ** n} s, returns true`); }
            else { mark(1, 'fail', 'attempt 3 → false'); line(`<span class="bad">attempt ${n + 1}:</span> IOException. retryWhen(attempt = ${n}) returns false`); }
          }]);
          if (!retry) {
            ev.push([t + 400, () => {
              mark(2, 'caught', 'emit(Error)'); mark(3, 'ok', 'cause = null'); mark(4, 'caught', 'Error');
              show('stale', 'Error: no connection. Pull to retry.');
              line('<span class="good">catch:</span> emit(Error("no connection"))');
              line('<span class="muted">onCompletion:</span> cause = null, because catch handled it');
            }]);
            t += 400;
            break;
          }
          bars.push({ s: t, e: t + wait, k: 'wait', label: `delay ${2 ** n} s` });
          ev.push([t + wait, () => mark(0, 'on', `attempt ${n + 2}`)]);
          t += wait; attempt++;
        }
        return { bars, ev, end: t };
      }
      async function play(fails, after) {
        const throwing = !!after;
        if (busy) return; busy = true;
        clear(); log.replaceChildren();
        const r = schedule(fails, throwing);
        const b = board([{ name: 'network', bars: r.bars }], T);
        slot0.replaceChildren(b.node);
        let i = 0;
        const ok = await playT(b.node, Math.max(r.end, 600), t => { b.paint(t); while (i < r.ev.length && r.ev[i][0] <= t) r.ev[i++][1](); });
        if (ok && after) await after();
        busy = false;
      }
      const sButtons = skeys.map(k => cmd(SERVERS[k][0], () => {
        if (busy) return;
        server = k; pressed(sButtons, skeys, k);
        line(`<span class="muted">${SERVERS[k][0]}.</span> Now collect.`);
      }));
      pressed(sButtons, skeys, server);
      // Opening state: a finished successful load.
      const first = schedule(0); const fb = board([{ name: 'network', bars: first.bars }], T);
      slot0.append(fb.node); fb.paint(T); first.ev.forEach(([, f]) => f());
      log.replaceChildren(); line('Pick how the server behaves, then collect. Delays run at double speed.');
      el.append(
        h('div', { class: 'controls' }, sButtons),
        pipe, slot0, screen,
        h('div', { class: 'controls' },
          cmd('articles().collect { show(it) }', () => play(SERVERS[server][1])),
          cmd('articles().collect { error("bad render") }', () => play(0, async () => {
            await sleep(400); if (!pipe.isConnected) return;
            mark(4, 'fail', 'throws IllegalStateException');
            line('<span class="bad">collect:</span> IllegalStateException("bad render")');
            await sleep(600); if (!pipe.isConnected) return;
            mark(2, 'skip', 'never sees it: downstream');
            mark(3, 'fail', 'cause = IllegalStateException');
            show('stale', 'Crash: IllegalStateException');
            line('<span class="bad">catch skipped:</span> it only handles exceptions from above it');
            line('<span class="muted">fix:</span> onEach { show(it) }.catch { … }.launchIn(scope)');
          }))),
        log);
    },
  };

  // ─── callbackFlow / channelFlow ─────────────────
  const callbackflow = {
    id: 'callbackflow',
    title: 'callbackFlow and channelFlow',
    tagline: 'Turn a listener API into a Flow, and unregister when collection stops.',
    body: `
<p>Many Android APIs push updates through a listener: network callbacks, sensors, location, Firebase. <code>callbackFlow { }</code> wraps one in a cold Flow. Register the listener inside the block, and call <code>trySend(value)</code> from each callback. <code>trySend</code> does not suspend, which matters because a callback is a plain function.</p>
<p>The block must end with <code>awaitClose { }</code>. It keeps the flow open while someone collects, and its lambda runs when collection stops. Unregister the listener there. If you forget, the system keeps calling a dead listener and leaks it, along with everything it references. If you leave out awaitClose entirely, the flow fails with an IllegalStateException as soon as the block returns.</p>
<p><code>channelFlow { }</code> is the same machinery without the awaitClose rule. Use it when several coroutines inside the block send values, for example a cached result and a fresh network result going into one stream.</p>`,
    code: `fun ConnectivityManager.isOnline(): Flow<Boolean> = callbackFlow {
    val callback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) { trySend(true) }
        override fun onLost(network: Network) { trySend(false) }
    }
    trySend(activeNetwork != null)                // the current state first
    registerDefaultNetworkCallback(callback)
    awaitClose { unregisterNetworkCallback(callback) }   // runs when collection stops
}.distinctUntilChanged()

// Two coroutines send into one flow
fun posts(): Flow<List<Post>> = channelFlow {
    launch { send(db.cachedPosts()) }
    launch { send(api.freshPosts()) }
}`,
    remember: 'Register in callbackFlow, trySend from the callback, unregister in awaitClose.',
    level: 'intermediate',
    terms: [
      { term: 'callbackFlow', def: 'A flow builder for wrapping listener APIs: you register a listener, send values from it, and must finish with awaitClose.' },
      { term: 'awaitClose', def: 'Suspends until the flow’s channel is closed or the collector is cancelled, then runs its block to clean up.' },
      { term: 'trySend', def: 'Adds a value to a channel without suspending and returns a result that says whether it worked.' },
      { term: 'channelFlow', def: 'A flow builder whose block can launch coroutines that all send values into the same flow.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Wrap a sensor listener as a Flow and clean up when collection stops.', code: `fun SensorManager.events(sensor: Sensor): Flow<Float> = [[callbackFlow]] {
    val listener = object : SensorEventListener {
        override fun onSensorChanged(e: SensorEvent) { [[trySend]](e.values[0]) }
        override fun onAccuracyChanged(s: Sensor, accuracy: Int) = Unit
    }
    registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    [[awaitClose]] { unregisterListener(listener) }
}`, why: '<code>callbackFlow</code> builds the flow, <code>trySend</code> works from a plain callback, and <code>awaitClose</code> unregisters on cancel.' },
      { type: 'bug', prompt: 'GPS stays on after the map screen closes. Tap the bug.', code: `fun LocationManager.updates(): Flow<Location> = callbackFlow {
    val listener = LocationListener { location -> trySend(location) }
    requestLocationUpdates(LocationManager.GPS_PROVIDER, 1_000L, 0f, listener, Looper.getMainLooper())
    awaitClose { }
}`, bug: 3, fix: '    awaitClose { removeUpdates(listener) }', why: 'awaitClose runs when collection stops, but this one does nothing. The listener stays registered, so GPS keeps running and the listener leaks.' },
    ],
    quiz: [
      { q: 'Why call <code>trySend</code> instead of <code>send</code> inside a listener callback?', options: ['trySend is faster', 'The callback is not a suspend function, and send suspends', 'send would drop the value'], a: 1, why: 'Listener methods are plain functions, so they cannot call a suspend function like send.' },
      { q: 'When does the block passed to <code>awaitClose { }</code> run?', options: ['Right after registering', 'When the collector is cancelled or the flow is closed', 'Only when an exception is thrown'], a: 1, why: 'awaitClose suspends while the flow is collected and runs its block when that ends, for any reason.' },
      { q: 'You need two coroutines inside one builder sending into the same flow, with no listener. Which builder?', options: ['<code>flow { }</code>', '<code>channelFlow { }</code>', '<code>flowOf()</code>'], a: 1, why: 'A plain flow { } may not emit from other coroutines. channelFlow gives you a channel that several coroutines can send to.' },
    ],
    deeper: callbackDepth.deeper,
    underHood: callbackDepth.underHood,
    mistakes: callbackDepth.mistakes,
    visual(el) {
      let collecting = true, leak = false, online = true, net = true, nextId = 2, busy = false;
      const cbs = [];
      const reg = h('div', { class: 'flw-strip' });
      const count = h('span', { class: 'flw-badge' });
      const flowState = h('span', { class: 'flw-gps' });
      const lane = h('div', { class: 'flw-strip' });
      const badge = h('span', { class: 'flw-gps flw-big' });
      const collState = h('span', { class: 'flw-note' });
      const uiHold = h('div', { class: 'flw-strip' });
      const o = out();
      const paint = () => {
        count.textContent = `${cbs.length} registered`;
        flowState.className = 'flw-gps' + (collecting ? '' : ' off');
        flowState.textContent = collecting ? 'open: awaitClose waiting' : 'closed';
        badge.className = 'flw-gps flw-big' + (online ? '' : ' bad');
        badge.textContent = online ? 'Online' : 'Offline';
        collState.textContent = collecting ? 'collecting isOnline()' : online !== net ? 'not collecting: shows an old value' : 'not collecting';
      };
      function register() {
        const id = nextId++;
        const c = { id, alive: true, e: h('span', { class: 'flw-v acc drop-in' }, `callback #${id - 1}`) };
        cbs.push(c); reg.append(c.e);
        return c;
      }
      function deliver(v) {
        const d = h('span', { class: 'flw-v acc drop-in' }, String(v));
        lane.append(d);
        setTimeout(() => {
          if (!d.isConnected) return;
          uiHold.replaceChildren(); d.className = 'flw-v ok'; moveTo(d, uiHold);
          online = v; paint(); replay(badge, 'pop');
        }, 450);
      }
      async function fire(v) {
        if (busy) return;
        if (net === v) { replay(badge, 'shake'); say(o, `<span class="muted">no-op:</span> the network is already ${v ? 'up' : 'down'}.`); return; }
        busy = true; net = v;
        if (!cbs.length) {
          paint(); replay(reg, 'shake');
          say(o, `<span class="muted">nobody listening:</span> ${v ? 'onAvailable' : 'onLost'} fired, but no callback is registered, so the screen was not told.`);
          busy = false; return;
        }
        let sent = 0, failed = 0;
        for (const c of cbs) {
          replay(c.e, c.alive ? 'pop' : 'shake');
          if (c.alive) { deliver(v); sent++; } else { failed++; c.e.className = 'flw-v bad'; }
          await sleep(220); if (!reg.isConnected) return;
        }
        if (!sent) paint();
        say(o, failed
          ? `<span class="bad">leak:</span> ${failed} dead callback${failed === 1 ? '' : 's'} still got ${v ? 'onAvailable' : 'onLost'}. trySend(${v}) failed because ${failed === 1 ? 'its' : 'their'} flow is closed, but the system still holds ${failed === 1 ? 'it' : 'them'}.`
          : `<span class="good">ok:</span> ${v ? 'onAvailable' : 'onLost'} called trySend(${v}), and the value reached the screen.`);
        busy = false;
      }
      const leakBox = h('input', { type: 'checkbox', id: 'flw-cb-leak', onchange() {
        leak = this.checked;
        say(o, leak ? '<span class="bad">bug mode:</span> awaitClose { } no longer unregisters. Cancel and collect again a few times.' : '<span class="good">fixed:</span> awaitClose { unregisterNetworkCallback(callback) } is back.');
      } });
      const snippet = h('div', { class: 'kt' });
      const paintCode = () => { snippet.innerHTML = hl(`callbackFlow {\n    registerDefaultNetworkCallback(callback)\n    awaitClose { ${leak ? '' : 'unregisterNetworkCallback(callback) '}}\n}`); };
      leakBox.addEventListener('change', paintCode);
      register(); uiHold.append(h('span', { class: 'flw-v ok' }, 'true'));
      paint(); paintCode();
      o.innerHTML = 'The screen is collecting, so callback #1 is registered. Drop the network, bring it back, then cancel.';

      // channelFlow: two senders, one stream.
      const lanes = [['launch { cache }', 500, 'cached: 12 posts'], ['launch { network }', 1500, 'fresh: 15 posts']].map(([name, ms, val]) => {
        const bar = h('i');
        return { name, ms, val, bar, row: h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, name.slice(9, -2)), h('span', { class: 'flw-prog' }, bar)) };
      });
      const outStrip = h('div', { class: 'flw-strip' });
      const o2 = out('channelFlow lets two coroutines send into one flow.');
      let busy2 = false;
      el.append(
        h('div', { class: 'flw-cb' },
          h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src' }, 'ConnectivityManager'), count), h('span', { class: 'flw-note' }, 'registered callbacks'), reg),
          h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('callbackFlow') }), flowState), h('span', { class: 'flw-note' }, 'trySend(…)'), lane),
          h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src' }, 'screen'), badge), collState, uiHold)),
        snippet,
        h('label', { class: 'switch', for: 'flw-cb-leak' }, leakBox, 'forget to unregister in awaitClose'),
        h('div', { class: 'controls' },
          cmd('isOnline().collect { show(it) }', () => {
            if (busy) return;
            if (collecting) { replay(flowState, 'shake'); say(o, '<span class="muted">already collecting:</span> cancel first, then collect again.'); return; }
            collecting = true; lane.replaceChildren();
            const c = register(); paint();
            deliver(net);
            say(o, `<span class="good">collect:</span> the block ran, registered callback #${c.id - 1} and sent the current state.${cbs.length > 1 ? ` The system now holds ${cbs.length} callbacks.` : ''}`);
          }),
          cmd('onLost()', () => fire(false)),
          cmd('onAvailable()', () => fire(true)),
          cmd('job.cancel()', async () => {
            if (busy) return;
            if (!collecting) { replay(flowState, 'shake'); say(o, '<span class="muted">no-op:</span> nothing is collecting.'); return; }
            busy = true; collecting = false; paint(); replay(flowState, 'pop');
            const c = cbs.find(x => x.alive); c.alive = false;
            await sleep(350); if (!reg.isConnected) return;
            if (!leak) {
              c.e.classList.add('fly-out'); await sleep(400); c.e.remove(); cbs.splice(cbs.indexOf(c), 1); paint();
              say(o, '<span class="good">awaitClose ran:</span> unregisterNetworkCallback removed the callback. Nothing is left behind.');
            } else {
              c.e.className = 'flw-v warn'; c.e.textContent += ' (leaked)'; replay(c.e, 'shake');
              say(o, `<span class="bad">leaked:</span> awaitClose ran but did nothing. The system still holds callback #${c.id - 1} and calls it on every change.`);
            }
            busy = false;
          })),
        o,
        h('div', { class: 'flw-search' },
          h('div', { class: 'controls' }, cmd('channelFlow { launch { cache }; launch { network } }', async () => {
            if (busy2) return; busy2 = true;
            outStrip.replaceChildren();
            say(o2, 'Both coroutines started at once inside channelFlow.');
            await Promise.all(lanes.map(async l => {
              l.bar.style.transition = 'none'; l.bar.style.width = '0%'; void l.bar.offsetWidth;
              l.bar.style.transition = `width ${l.ms}ms linear`; l.bar.style.width = '100%';
              await sleep(l.ms); if (!outStrip.isConnected) return;
              outStrip.append(h('span', { class: 'flw-v ok drop-in' }, l.val));
            }));
            busy2 = false;
            if (outStrip.isConnected) say(o2, '<span class="good">one stream:</span> the cache answered first, then the network. Both sent into the same flow, which completed when both coroutines were done.');
          })),
          lanes.map(l => l.row),
          h('div', { class: 'flw-srow' }, h('span', { class: 'lane-name' }, 'collect'), outStrip)),
        o2);
    },
  };

  // ─── Depth: Go deeper, under the hood, common mistakes ─────────────────
  const hotDepth = {
    deeper: [
      {
        title: 'StateFlow compares with equals()',
        body: `<p>StateFlow emits only when the new value is not equal to the current one. For a list, equal means same items in the same order. A list with the same contents is skipped, even if it is a new object.</p>
<p>Mutating a list in place is worse. The StateFlow already holds that same list, so the “new” value is equal to itself. Nothing is emitted, and the screen goes stale. Always set a new immutable value.</p>`,
        visual(el) {
          const FRUITS = ['Kiwi', 'Plum', 'Fig', 'Lime', 'Pear'];
          let mem = ['Apple', 'Pear'], shown = ['Apple', 'Pear'], next = 0, emits = 1;
          const memStrip = h('div', { class: 'flw-strip flw-wrap' }), shownStrip = h('div', { class: 'flw-strip flw-wrap' });
          const badge = h('span', { class: 'flw-badge' }, 'emissions 1');
          const o = out();
          const draw = (strip, list) => strip.replaceChildren(...list.map(v => h('span', { class: 'flw-v' }, v)));
          function paint() { draw(memStrip, mem); draw(shownStrip, shown); }
          const nextFruit = () => FRUITS[next++ % FRUITS.length];
          const emit = () => { shown = [...mem]; emits++; badge.textContent = `emissions ${emits}`; replay(badge, 'pop'); paint(); replay(shownStrip, 'pop-soft'); };
          const shownPanel = h('div', { class: 'flw-subrow' }, h('div', { class: 'flw-subhead' }, h('span', {}, 'what the screen collected'), badge), shownStrip);
          paint();
          o.innerHTML = 'The StateFlow holds a list and the screen shows what it collected. Add a fruit three ways.';
          el.append(
            h('div', { class: 'controls' },
              cmd('_cart.update { it + "Kiwi" }', () => {
                if (mem.length >= 6) mem = ['Apple'];
                mem = [...mem, nextFruit()];
                emit();
                say(o, '<span class="good">emitted:</span> update built a new list that differs from the old one, so collectors got it.');
              }),
              cmd('cart.add("Kiwi"); _cart.value = cart', () => {
                if (mem.length >= 6) { replay(memStrip, 'shake'); say(o, '<span class="muted">full:</span> press Reset to start over.'); return; }
                mem.push(nextFruit());
                paint(); replay(memStrip, 'pop-soft'); replay(shownPanel, 'shake');
                say(o, '<span class="bad">no emission:</span> the StateFlow already held this same list object. Old value equals new value, so the screen is now stale.');
              }),
              cmd('_cart.value = cart.toList()', () => {
                const stale = shown.join() !== mem.join();
                if (stale) { emit(); say(o, '<span class="good">emitted:</span> a new list whose contents differ from what the StateFlow last had. The screen caught up.'); return; }
                replay(badge, 'shake');
                say(o, '<span class="muted">no emission:</span> a new object, but equal contents. StateFlow skipped it.');
              })),
            h('div', { class: 'flw-duo' },
              h('div', { class: 'flw-subrow' }, h('div', { class: 'flw-subhead' }, h('span', {}, 'the list in memory'), h('span', { class: 'flw-note' }, 'cart')), memStrip),
              shownPanel),
            o);
        },
      },
      {
        title: 'replay decides what late collectors get',
        body: `<p><code>MutableSharedFlow(replay = n)</code> keeps the last <code>n</code> values and hands them to every new collector before live values. With <code>replay = 1</code> it behaves a little like a StateFlow, but without an initial value and without skipping equal values.</p>
<p>Pick a replay size, emit a few values, then let a new screen join.</p>`,
        code: `private val _log = MutableSharedFlow<LogLine>(
    replay = 3,                       // late collectors get the last 3
    extraBufferCapacity = 16,         // room for bursts before emit suspends
)`,
        visual(el) {
          const SIZES = [0, 1, 3];
          let replayN = 0, n = 0, subs = [];
          const sent = h('div', { class: 'flw-strip flw-wrap' });
          const list = h('div', { style: 'display:grid;gap:8px' });
          const o = out();
          const btns = SIZES.map(k => cmd(`MutableSharedFlow<Int>(replay = ${k})`, () => setReplay(k)));
          function setReplay(k) {
            replayN = k; n = 0; subs = [];
            sent.replaceChildren(h('span', { class: 'flw-note' }, 'nothing emitted yet'));
            list.replaceChildren(); addSub(false);
            pressed(btns, SIZES, k);
            say(o, `<span class="muted">replay = ${k}:</span> emit a few values, then let a screen join late.`);
          }
          function markCache() {
            const chips = [...sent.querySelectorAll('.flw-v')];
            chips.forEach((c, i) => c.classList.toggle('acc', i >= chips.length - replayN));
          }
          function addSub(late) {
            const strip = h('div', { class: 'flw-strip flw-wrap' }), note = h('span', { class: 'flw-note' });
            list.append(h('div', { class: `flw-subrow${late ? ' drop-in' : ''}` }, h('div', { class: 'flw-subhead' }, h('span', {}, `screen ${'ABCD'[subs.length]}`), note), strip));
            subs.push(strip);
            if (!late) return;
            const cache = [...sent.querySelectorAll('.flw-v')].slice(replayN ? -replayN : sent.children.length).map(c => c.textContent);
            cache.forEach(v => strip.append(h('span', { class: 'flw-v acc drop-in' }, v)));
            note.textContent = cache.length ? `replayed ${cache.length}` : 'got nothing from the past';
            note.className = cache.length ? 'flw-note' : 'flw-note warn';
          }
          setReplay(0);
          el.append(
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'controls' },
              cmd('_flow.emit(n)', () => {
                n++;
                sent.querySelectorAll('.flw-note').forEach(x => x.remove());
                sent.append(h('span', { class: 'flw-v drop-in' }, String(n)));
                while (sent.children.length > 6) sent.firstElementChild.remove();
                markCache();
                subs.forEach(s => { s.append(h('span', { class: 'flw-v ok drop-in' }, String(n))); while (s.children.length > 6) s.firstElementChild.remove(); });
                say(o, `emitted ${n}. ${replayN ? `The highlighted ${Math.min(replayN, n)} sit in the replay cache.` : 'Nothing is cached.'}`);
              }),
              cmd('a new screen starts collecting', () => {
                if (subs.length >= 3) { replay(list, 'shake'); say(o, '<span class="muted">full:</span> pick a replay size to start over.'); return; }
                addSub(true);
                say(o, replayN ? `<span class="good">joined:</span> it got the last ${replayN} value${replayN === 1 ? '' : 's'} first, then live ones.` : '<span class="bad">joined:</span> replay = 0, so it only sees values emitted from now on.');
              })),
            h('div', { class: 'flw-subrow' }, h('div', { class: 'flw-subhead' }, h('span', {}, 'emitted so far'), h('span', { class: 'flw-note' }, 'highlight = replay cache')), sent),
            list, o);
        },
      },
      {
        title: 'Events while nobody listens: Channel keeps them',
        body: `<p>A <code>SharedFlow</code> with no replay drops an event when nobody is collecting, for example while the app is in the background. For one-off events that must not get lost, use a <code>Channel</code> and expose it with <code>receiveAsFlow()</code>. A buffered channel holds events until a collector arrives.</p>
<p>The trade-off: each event goes to exactly one collector. That is usually what you want for navigation or a snackbar.</p>`,
        code: `private val _events = Channel<UiEvent>(Channel.BUFFERED)
val events: Flow<UiEvent> = _events.receiveAsFlow()

fun save() = viewModelScope.launch {
    repo.save()
    _events.send(UiEvent.ShowSnackbar("Saved"))   // waits in the buffer if needed
}`,
        visual(el) {
          let fg = true, k = 0;
          const NAMES = ['Saved', 'Sent', 'Synced', 'Copied'];
          const mk = (title) => {
            const buf = h('div', { class: 'flw-strip flw-wrap' }), shown = h('div', { class: 'flw-strip flw-wrap' });
            const panel = h('div', { class: 'flw-panel' },
              h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl(title) })),
              h('span', { class: 'flw-note' }, 'waiting in the flow'), buf,
              h('span', { class: 'flw-note' }, 'shown on screen'), shown);
            return { panel, buf, shown };
          };
          const sf = mk('MutableSharedFlow<UiEvent>()'), ch = mk('Channel<UiEvent>(BUFFERED)');
          const status = h('span', { class: 'flw-gps' }, 'app visible');
          const o = out();
          const empty = s => { if (!s.children.length) s.append(h('span', { class: 'flw-note' }, 'empty')); };
          const add = (s, v, cls) => { s.querySelectorAll('.flw-note').forEach(x => x.remove()); s.append(h('span', { class: `flw-v drop-in ${cls}` }, v)); while (s.children.length > 4) s.firstElementChild.remove(); };
          [sf.buf, sf.shown, ch.buf, ch.shown].forEach(empty);
          const toggle = h('button', { class: 'btn primary small', onclick() {
            fg = !fg;
            toggle.textContent = fg ? 'Go to home screen' : 'Open the app';
            status.textContent = fg ? 'app visible' : 'in background, not collecting';
            status.className = `flw-gps${fg ? '' : ' off'}`;
            if (!fg) { say(o, 'The screen stopped collecting. Now emit an event.'); return; }
            const held = [...ch.buf.querySelectorAll('.flw-v')];
            ch.buf.replaceChildren(); empty(ch.buf);
            held.forEach(c => add(ch.shown, c.textContent, 'ok'));
            say(o, held.length
              ? `<span class="good">back:</span> the Channel delivered ${held.length} held event${held.length === 1 ? '' : 's'}. The SharedFlow had nothing to give.`
              : 'Back in the foreground. Both flows deliver live events again.');
          } }, 'Go to home screen');
          o.innerHTML = 'Emit an event while the app is visible, then again while it is in the background.';
          el.append(
            h('div', { class: 'controls' },
              cmd('emit(ShowSnackbar(…))', () => {
                const v = NAMES[k++ % NAMES.length];
                if (fg) {
                  add(sf.shown, v, 'ok'); add(ch.shown, v, 'ok');
                  say(o, `"${v}" reached the screen through both.`);
                } else {
                  add(sf.buf, v, 'gone'); add(ch.buf, v, 'warn');
                  say(o, `<span class="bad">SharedFlow dropped "${v}":</span> no collector. <span class="good">The Channel holds it</span> in its buffer.`);
                }
              }),
              toggle, status),
            h('div', { class: 'flw-duo' }, sf.panel, ch.panel), o);
        },
      },
    ],
    underHood: {
      body: `<p>A <code>MutableStateFlow</code> keeps one value in an atomic field. Setting it compares the new value with the old one using <code>equals</code> and stops there if they match. Otherwise it stores the value and wakes the collectors. Each collector is a slot that only remembers “something changed”. When it wakes, it reads the newest value, so values set in between are skipped. That is the conflation you saw in the core demo.</p>
<p>The docs describe StateFlow as a special case of SharedFlow: replay of one, the oldest value dropped on overflow, equal values filtered out, and a required initial value.</p>`,
      code: `// Behaves like a StateFlow (except it does not need an initial value)
val shared = MutableSharedFlow<Int>(
    replay = 1,
    onBufferOverflow = BufferOverflow.DROP_OLDEST,
)
shared.tryEmit(0)                          // the initial value
val state = shared.distinctUntilChanged()`,
    },
    mistakes: [
      {
        title: 'Read, copy, write is a race',
        bad: `fun setLoading() {
    _state.value = _state.value.copy(loading = true)
}`,
        good: `fun setLoading() {
    _state.update { it.copy(loading = true) }
}`,
        why: 'Two coroutines can read the same old value and one write overwrites the other. <code>update</code> retries with compare-and-set until its change applies cleanly.',
      },
      {
        title: 'Exposing the mutable flow',
        bad: `class CartViewModel : ViewModel() {
    val items = MutableStateFlow<List<Item>>(emptyList())
}`,
        good: `class CartViewModel : ViewModel() {
    private val _items = MutableStateFlow<List<Item>>(emptyList())
    val items: StateFlow<List<Item>> = _items.asStateFlow()
}`,
        why: 'Any screen could write <code>vm.items.value = …</code> and bypass the ViewModel’s rules. Keep the mutable flow private and expose a read-only view.',
      },
      {
        title: 'Using StateFlow for a one-off event',
        bad: `private val _toast = MutableStateFlow<String?>(null)
fun save() = viewModelScope.launch {
    repo.save()
    _toast.value = "Saved"
}`,
        good: `private val _events = Channel<UiEvent>(Channel.BUFFERED)
val events = _events.receiveAsFlow()
fun save() = viewModelScope.launch {
    repo.save()
    _events.send(UiEvent.ShowToast("Saved"))
}`,
        why: 'StateFlow replays its value to every new collector. After a rotation the screen collects again and shows “Saved” a second time. Events need a flow that delivers once.',
      },
    ],
  };

  const lifecycleDepth = {
    deeper: [
      {
        title: 'In Fragments, collect with viewLifecycleOwner',
        body: `<p>A Fragment on the back stack keeps living, but its view is destroyed. When you come back, <code>onViewCreated</code> runs again. If you launch from the Fragment’s own <code>lifecycleScope</code>, the old coroutine is still there. Each trip adds another collector, and the old ones write to views that no longer exist.</p>
<p><code>viewLifecycleOwner</code> has a lifecycle that ends in <code>onDestroyView</code>, so its coroutines end with the view.</p>`,
        visual(el) {
          const MODES = [['frag', 'lifecycleScope'], ['view', 'viewLifecycleOwner.lifecycleScope']];
          let mode = 'frag', onScreen = true, viewN = 1, cols = [], acc = 0;
          const list = h('div', { class: 'flw-strip flw-wrap' });
          const stat = h('p', { class: 'tip' });
          const o = out();
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => { mode = k; reset(); say(o, `<span class="muted">mode:</span> launching from ${hl(src)} in onViewCreated. Go to Details and back a few times.`); }));
          const navBtn = h('button', { class: 'btn primary small', onclick() {
            if (!onScreen && viewN >= 5) { replay(list, 'shake'); say(o, '<span class="muted">enough:</span> five views is plenty. Pick a mode to start over.'); return; }
            onScreen = !onScreen;
            navBtn.textContent = onScreen ? 'Open Details' : 'Press Back';
            if (!onScreen) {
              cols.forEach(c => { if (c.state === 'run') c.state = 'wait'; });
              if (mode === 'view') cols.forEach(c => { if (c.view === viewN) c.state = 'gone'; });
              say(o, mode === 'view'
                ? `<span class="good">onDestroyView:</span> view #${viewN} is gone and its collector was cancelled with it.`
                : `onStop and onDestroyView ran. The Fragment is only CREATED now, so repeatOnLifecycle paused, but the coroutine from view #${viewN} is still alive.`);
            } else {
              viewN++;
              cols.forEach(c => { if (c.state === 'wait') c.state = 'run'; });
              cols.push({ view: viewN, state: 'run' });
              const stale = cols.filter(c => c.state === 'run' && c.view !== viewN).length;
              say(o, stale
                ? `<span class="bad">back:</span> onViewCreated launched another collector. ${stale} old one${stale === 1 ? '' : 's'} restarted too and now write${stale === 1 ? 's' : ''} to destroyed views.`
                : `<span class="good">back:</span> a new view #${viewN} and exactly one collector for it.`);
            }
            paint();
          } }, 'Open Details');
          function reset() {
            onScreen = true; viewN = 1; cols = [{ view: 1, state: 'run' }];
            navBtn.textContent = 'Open Details';
            pressed(modeBtns, MODES.map(m => m[0]), mode); paint();
          }
          function paint() {
            list.replaceChildren(...cols.map(c => {
              const stale = c.state === 'run' && c.view !== viewN;
              const cls = c.state === 'gone' ? 'gone' : c.state === 'wait' ? '' : stale ? 'bad' : 'ok';
              return h('span', { class: `flw-v ${cls}`, 'data-v': c.view }, `view #${c.view}${c.state === 'wait' ? ' paused' : c.state === 'gone' ? ' cancelled' : stale ? ' stale' : ''}`);
            }));
          }
          loop(list, (now, dt) => {
            acc += dt; if (acc < 1000) return; acc -= 1000;
            const live = cols.filter(c => c.state === 'run');
            live.forEach(c => { const chip = list.querySelector(`[data-v="${c.view}"]`); if (chip) replay(chip, 'pop'); });
            const bad = live.filter(c => c.view !== viewN).length;
            stat.textContent = `collectors running: ${live.length} · writing to destroyed views: ${bad}`;
          });
          reset();
          o.innerHTML = 'Each chip is a running collector. It pulses on every location update.';
          stat.textContent = 'collectors running: 1 · writing to destroyed views: 0';
          el.append(h('div', { class: 'controls' }, modeBtns), h('div', { class: 'controls' }, navBtn), list, stat, o);
        },
      },
      {
        title: 'One flow, one call: flowWithLifecycle',
        body: `<p>When a Fragment or Activity collects a single flow, <code>flowWithLifecycle</code> is a shorter way to write the same thing. It applies <code>repeatOnLifecycle</code> to the upstream. For several flows, keep one <code>repeatOnLifecycle</code> block with a <code>launch</code> per flow.</p>`,
        code: `viewLifecycleOwner.lifecycleScope.launch {
    vm.location
        .flowWithLifecycle(viewLifecycleOwner.lifecycle, Lifecycle.State.STARTED)
        .collect { binding.locationText.text = it.toString() }
}`,
      },
    ],
    underHood: {
      body: `<p><code>repeatOnLifecycle</code> is a suspend function that adds a <code>LifecycleEventObserver</code>. When the lifecycle moves up to the target state, the observer launches a child coroutine that runs your block. When it moves down past that state, the observer cancels that child. When the lifecycle is destroyed, <code>repeatOnLifecycle</code> returns, so the code after it runs only at the very end.</p>
<p><code>collectAsStateWithLifecycle</code> is built from the same piece. It is a <code>produceState</code> whose producer calls <code>repeatOnLifecycle</code> and collects inside it.</p>
<p><code>stateIn</code> launches one sharing coroutine in the scope you pass. It watches the StateFlow’s subscriber count. The start policy turns those counts into start and stop commands for the upstream collection.</p>`,
      code: `// Roughly what collectAsStateWithLifecycle does
@Composable
fun <T> StateFlow<T>.collectAsStateWithLifecycleSketch(lifecycle: Lifecycle): State<T> =
    produceState(initialValue = value, this, lifecycle) {
        lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            collect { value = it }
        }
    }`,
    },
    mistakes: [
      {
        title: 'Two collect calls in a row',
        bad: `repeatOnLifecycle(Lifecycle.State.STARTED) {
    vm.location.collect { showLocation(it) }
    vm.events.collect { handle(it) }   // never reached
}`,
        good: `repeatOnLifecycle(Lifecycle.State.STARTED) {
    launch { vm.location.collect { showLocation(it) } }
    launch { vm.events.collect { handle(it) } }
}`,
        why: '<code>collect</code> suspends until the flow completes. A StateFlow never completes, so the second line never runs. Give each flow its own <code>launch</code>.',
      },
      {
        title: 'Calling stateIn in a getter or function',
        bad: `val items: StateFlow<List<Item>>
    get() = repo.items().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList()
    )`,
        good: `val items: StateFlow<List<Item>> = repo.items().stateIn(
    viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList()
)`,
        why: 'Every access creates a new StateFlow and a new sharing coroutine that lives as long as <code>viewModelScope</code>. Each recomposition can add one. Create it once, as a property.',
      },
      {
        title: 'collectAsState on Android',
        bad: `@Composable
fun MapScreen(vm: MapViewModel) {
    val location by vm.location.collectAsState()
    LocationText(location)
}`,
        good: `@Composable
fun MapScreen(vm: MapViewModel) {
    val location by vm.location.collectAsStateWithLifecycle()
    LocationText(location)
}`,
        why: '<code>collectAsState</code> collects as long as the composable is in the composition, which includes time in the background. The lifecycle-aware version stops below STARTED, so <code>WhileSubscribed</code> can stop the upstream.',
      },
    ],
  };

  // ─── Promoted: suspendCancellableCoroutine (from callbackFlow) ─────────────────
  const oneShotStep = {
        title: 'One answer? Use suspendCancellableCoroutine',
        body: `<p>Some callbacks fire once: a single location fix, a dialog result, a one-shot request. A Flow is the wrong shape for that. <code>suspendCancellableCoroutine</code> suspends until you call <code>resume</code>, and returns the value like a normal function.</p>
<p>Register <code>invokeOnCancellation</code> to cancel the underlying request. Without it, cancelling the coroutine only stops the waiting. The request keeps running, and its late answer is ignored.</p>`,
        code: `suspend fun FusedLocationProviderClient.currentFix(): Location? =
    suspendCancellableCoroutine { cont ->
        val cts = CancellationTokenSource()
        getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cts.token)
            .addOnSuccessListener { cont.resume(it) }
            .addOnFailureListener { cont.resumeWithException(it) }
        cont.invokeOnCancellation { cts.cancel() }   // stop the GPS request too
    }`,
        visual(el) {
          let hook = true, busy = false, gen = 0, req = null;
          const caller = h('span', { class: 'flw-gps off' }, 'idle');
          const gps = h('span', { class: 'flw-gps off' }, 'GPS off');
          const bar = h('i');
          const shown = h('div', { class: 'flw-shown wait' }, 'No location yet');
          const o = out();
          const set = (e, cls, text) => { e.className = 'flw-gps' + (cls ? ' ' + cls : ''); e.textContent = text; };
          async function start() {
            if (req) { replay(caller, 'shake'); say(o, '<span class="muted">already waiting:</span> cancel it or let it finish.'); return; }
            const my = ++gen; req = { my, cancelled: false };
            set(caller, '', 'suspended in currentFix()'); set(gps, 'bad', 'GPS on');
            shown.className = 'flw-shown wait'; shown.textContent = 'Waiting for a fix…';
            bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = 'width 2000ms linear'; bar.style.width = '100%';
            say(o, 'The coroutine is suspended. The GPS request is running.');
            await sleep(2000); if (!el.isConnected || my !== gen) return;
            set(gps, 'off', 'GPS off');
            if (req.cancelled) {
              say(o, '<span class="bad">late answer ignored:</span> the request ran to the end with nobody waiting. resume() on a cancelled continuation does nothing.');
            } else {
              set(caller, '', 'resumed'); shown.className = 'flw-shown'; shown.textContent = 'Location: 41.01, 28.97'; replay(shown, 'pop');
              say(o, '<span class="good">resumed once:</span> the callback called cont.resume(location) and currentFix() returned.');
            }
            req = null;
          }
          async function cancel() {
            if (busy) return;
            if (!req || req.cancelled) { replay(caller, 'shake'); say(o, '<span class="muted">nothing to cancel.</span>'); return; }
            busy = true; req.cancelled = true;
            set(caller, 'off', 'cancelled'); shown.className = 'flw-shown stale'; shown.textContent = 'Screen closed before the fix';
            if (hook) {
              const w = getComputedStyle(bar).width; bar.style.transition = 'none'; bar.style.width = w;
              set(gps, 'off', 'GPS off'); gen++; req = null;
              say(o, '<span class="good">invokeOnCancellation ran:</span> cts.cancel() stopped the GPS request right away.');
            } else {
              replay(gps, 'shake');
              say(o, '<span class="bad">no cancellation hook:</span> the coroutine stopped waiting, but the GPS keeps running until the request ends.');
            }
            busy = false;
          }
          const sw = h('input', { type: 'checkbox', id: 'flw-d2cb-hook', checked: true, onchange() { hook = this.checked; say(o, hook ? 'invokeOnCancellation { cts.cancel() } is back.' : '<span class="bad">removed</span> invokeOnCancellation. Start, then cancel.'); } });
          o.innerHTML = 'Ask for one location fix, then try cancelling halfway.';
          el.append(
            h('label', { class: 'switch', for: 'flw-d2cb-hook' }, sw, h('span', { html: 'register <code>invokeOnCancellation</code>' })),
            h('div', { class: 'flw-duo' },
              h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src', html: hl('currentFix()') }), caller), h('span', { class: 'flw-prog' }, bar)),
              h('div', { class: 'flw-panel' }, h('div', { class: 'flw-ph' }, h('span', { class: 'flw-src' }, 'location request'), gps), shown)),
            h('div', { class: 'controls' }, cmd('val fix = currentFix()', start), cmd('job.cancel()', cancel)),
            o);
        },
      };
  const suspendCallback = {
    id: 'suspend-callback',
    title: 'suspendCancellableCoroutine',
    tagline: 'One callback, one answer: turn it into a suspend function.',
    level: 'intermediate',
    body: `
<p>Many APIs answer once through a callback: one location fix, one dialog choice, one request. A Flow is the wrong shape for a single answer. <code>suspendCancellableCoroutine</code> suspends the caller, hands you a continuation, and returns whatever you pass to <code>resume</code>.</p>
<p>Call <code>resume(value)</code> on success and <code>resumeWithException(e)</code> on failure, exactly once. Register <code>invokeOnCancellation</code> to stop the underlying request when the caller is cancelled. A cancelled coroutine stays cancelled: a later <code>resume</code> does not bring it back.</p>
<p>The rule of thumb: a callback that fires many times becomes a <code>callbackFlow</code>, one that fires once becomes a suspend function.</p>`,
    code: oneShotStep.code,
    remember: 'One answer: suspendCancellableCoroutine, resume exactly once, cancel the request in invokeOnCancellation. Many answers: callbackFlow.',
    visual: oneShotStep.visual,
    terms: [
      { term: 'Continuation', def: 'The handle to a suspended coroutine. Resuming it with a value or an exception makes the coroutine continue from where it paused.' },
      { term: 'resume', def: 'Continues the suspended coroutine with a value. Calling it a second time on the same continuation throws IllegalStateException.' },
      { term: 'invokeOnCancellation', def: 'Registers code that runs if the waiting coroutine is cancelled, so you can cancel the request or free a resource.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Turn a one-shot picker callback into a suspend function that also closes the picker on cancel.', code: `suspend fun ColorPicker.pick(): Color? = [[suspendCancellableCoroutine]] { cont ->
    show(
        onPicked = { color -> cont.[[resume]](color) },
        onDismissed = { cont.resume(null) },
    )
    cont.[[invokeOnCancellation]] { dismiss() }
}`, why: 'The builder suspends until one of the callbacks resumes it. <code>invokeOnCancellation</code> closes the picker if the caller goes away first.' },
      { type: 'bug', prompt: 'When the network fails, the profile screen spins forever. Tap the bug.', code: `suspend fun ProfileApi.load(id: String): Profile =
    suspendCancellableCoroutine { cont ->
        val call = fetch(id,
            onSuccess = { cont.resume(it) },
            onError = { e -> Log.e("Profile", "failed", e) },
        )
        cont.invokeOnCancellation { call.cancel() }
    }`, bug: 4, fix: '            onError = { e -> cont.resumeWithException(e) },', why: 'On failure nobody resumes the continuation, so the caller stays suspended forever. <code>resumeWithException</code> throws the error in the caller.' },
    ],
    quiz: [
      { q: 'A listener fires every time connectivity changes. Which builder fits?', options: ['<code>suspendCancellableCoroutine</code>', '<code>callbackFlow</code>'], a: 1, why: 'Many values over time is a stream. suspendCancellableCoroutine returns exactly one value.' },
      { q: 'The caller is cancelled while waiting, and you did not register <code>invokeOnCancellation</code>. What happens to the request?', options: ['It is cancelled too', 'It keeps running, and its answer is ignored', 'The app crashes'], a: 1, why: 'Cancellation stops the waiting coroutine, not the API behind it. Only your invokeOnCancellation code can stop that.' },
      { q: 'A buggy callback calls <code>cont.resume(x)</code> twice. What happens on the second call?', options: ['It is ignored', 'It throws IllegalStateException', 'The caller gets the second value'], a: 1, why: 'A continuation can be resumed once. A second resume throws IllegalStateException.' },
    ],
    deeper: [
      {
        title: 'Resume exactly once',
        body: `<p>Some callback APIs can call you more than once, for example a success followed by a completion, or a retrying SDK. A second <code>resume</code> throws <code>IllegalStateException</code>.</p>
<p>If the API may call back twice, check <code>cont.isActive</code> before resuming, and remove the listener after the first answer.</p>`,
        code: `suspend fun Scanner.firstCode(): String = suspendCancellableCoroutine { cont ->
    val listener = object : ScanListener {
        override fun onCode(code: String) {
            removeListener(this)                 // stop further calls
            if (cont.isActive) cont.resume(code) // and guard the rare race
        }
    }
    addListener(listener)
    cont.invokeOnCancellation { removeListener(listener) }
}`,
      },
      {
        title: 'invokeOnCancellation can run on any thread',
        body: `<p>Cancellation can happen at any moment, even while the callback is running on another thread. So <code>invokeOnCancellation</code> may run at the same time as your success callback. Whatever it calls, like <code>removeListener</code> or <code>cancel()</code>, must be safe to call from any thread and safe to call after the request already finished.</p>`,
        code: `cont.invokeOnCancellation {
    cts.cancel()      // CancellationTokenSource.cancel() is safe to call any time
}`,
      },
      {
        title: 'suspendCoroutine ignores cancellation',
        body: `<p>There is also a plain <code>suspendCoroutine</code>. It does not support cancellation: if the caller is cancelled, it keeps waiting until the callback finally resumes it. For anything on Android, where screens come and go, use the cancellable version.</p>`,
        code: `// Waits for the callback even after the screen is gone
suspend fun slowFix(): Location = suspendCoroutine { cont -> /* ... */ }

// Stops waiting at once when cancelled, and can cancel the request
suspend fun fix(): Location = suspendCancellableCoroutine { cont -> /* ... */ }`,
      },
    ],
    mistakes: [
      {
        title: 'Not resuming on the error path',
        bad: `suspendCancellableCoroutine { cont ->
    request.addOnSuccessListener { cont.resume(it) }
}`,
        good: `suspendCancellableCoroutine { cont ->
    request.addOnSuccessListener { cont.resume(it) }
    request.addOnFailureListener { cont.resumeWithException(it) }
}`,
        why: 'Every path must resume the continuation. If the failure path is missing, the caller stays suspended forever on an error.',
      },
      {
        title: 'Wrapping a repeating listener',
        bad: `suspend fun ConnectivityManager.onlineChanges(): Boolean =
    suspendCancellableCoroutine { cont ->
        registerDefaultNetworkCallback(callbackThatResumes(cont))
    }`,
        good: `fun ConnectivityManager.onlineChanges(): Flow<Boolean> = callbackFlow {
    val cb = callbackThatSends(this)
    registerDefaultNetworkCallback(cb)
    awaitClose { unregisterNetworkCallback(cb) }
}`,
        why: 'The network callback fires again and again. The second call would resume a finished continuation and throw, and the listener is never unregistered.',
      },
    ],
  };

  // ─── Promoted: stateIn vs shareIn (from Collecting safely in the UI) ─────────────────
  const startPolicyStep = {
        title: 'stateIn start policies',
        body: `<p><code>stateIn</code> takes a start policy. <code>Eagerly</code> starts the upstream as soon as the ViewModel exists and never stops it. <code>Lazily</code> waits for the first collector, then never stops. <code>WhileSubscribed(5_000)</code> runs only while someone collects, plus five seconds.</p>
<p>All three stop when <code>viewModelScope</code> is cancelled. Pick a policy and step through a screen’s life.</p>`,
        visual(el) {
          const MODES = [['eager', 'SharingStarted.Eagerly'], ['lazy', 'SharingStarted.Lazily'], ['ws', 'SharingStarted.WhileSubscribed(5_000)']];
          let mode = 'ws', subs = 0, up = false, cleared = false, graceUntil = 0, starts = 0;
          const upChip = h('span', { class: 'flw-gps off' }, 'upstream stopped');
          const subChip = h('span', { class: 'flw-badge' }, 'collectors 0');
          const timer = h('i');
          const timerBox = h('div', { class: 'flw-timer', hidden: true }, timer);
          const o = out();
          const startsEl = h('span', { class: 'flw-note' }, 'upstream starts: 0');
          const modeBtns = MODES.map(([k, src]) => cmd(src, () => { mode = k; reset(); }));
          const setUp = on => {
            if (on && !up) { starts++; replay(upChip, 'pop'); }
            up = on;
            upChip.textContent = up ? 'upstream running' : 'upstream stopped';
            upChip.className = `flw-gps${up ? '' : ' off'}`;
            startsEl.textContent = `upstream starts: ${starts}`;
          };
          function reset() {
            subs = 0; cleared = false; graceUntil = 0; starts = 0; up = false; timerBox.hidden = true;
            pressed(modeBtns, MODES.map(m => m[0]), mode);
            setUp(mode === 'eager');
            subChip.textContent = 'collectors 0';
            say(o, mode === 'eager' ? '<span class="muted">ViewModel created:</span> Eagerly started the upstream right away, before any screen asked.' : '<span class="muted">ViewModel created:</span> nothing runs until a screen collects.');
          }
          const dead = () => { if (!cleared) return false; replay(upChip, 'shake'); say(o, '<span class="muted">no-op:</span> viewModelScope is cancelled. Pick a policy to start over.'); return true; };
          loop(upChip, now => {
            if (!graceUntil) return;
            const left = graceUntil - now;
            if (left <= 0) {
              graceUntil = 0; timerBox.hidden = true; setUp(false);
              say(o, '<span class="good">5 s passed:</span> no collector came back, so WhileSubscribed stopped the upstream.');
              return;
            }
            timer.style.width = (left / 5000) * 100 + '%';
          });
          reset();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'controls' },
              cmd('screen starts collecting', () => {
                if (dead()) return;
                if (subs >= 2) { replay(subChip, 'shake'); say(o, '<span class="muted">enough:</span> two collectors is plenty here.'); return; }
                subs++; subChip.textContent = `collectors ${subs}`; replay(subChip, 'pop');
                const was = up;
                if (graceUntil) { graceUntil = 0; timerBox.hidden = true; }
                setUp(true);
                say(o, was ? '<span class="good">shared:</span> the upstream was already running, so this collector got the current value with no restart.' : '<span class="good">started:</span> the first collector started the upstream.');
              }),
              cmd('screen stops collecting', () => {
                if (dead()) return;
                if (!subs) { replay(subChip, 'shake'); say(o, '<span class="muted">no-op:</span> nobody is collecting.'); return; }
                subs--; subChip.textContent = `collectors ${subs}`;
                if (subs) { say(o, 'One collector left. The upstream keeps running for the other.'); return; }
                if (mode === 'ws') { graceUntil = performance.now() + 5000; timerBox.hidden = false; say(o, 'Last collector gone. WhileSubscribed waits 5 s in case it comes back, like after a rotation.'); }
                else say(o, `<span class="bad">still running:</span> ${mode === 'eager' ? 'Eagerly' : 'Lazily'} never stops while the ViewModel lives, even with nobody watching.`);
              }),
              cmd('onCleared()', () => {
                if (dead()) return;
                cleared = true; graceUntil = 0; timerBox.hidden = true; subs = 0; subChip.textContent = 'collectors 0';
                setUp(false);
                say(o, '<span class="good">cleared:</span> viewModelScope was cancelled, and the sharing coroutine with it. Every policy stops here.');
              })),
            h('div', { class: 'flw-ui' }, upChip, subChip, startsEl, h('div', { style: 'flex:1 1 120px' }, timerBox)),
            o);
        },
      };
  const statein = {
    id: 'statein-sharein',
    title: 'stateIn vs shareIn',
    tagline: 'Run one upstream for every collector: as a state, or as a stream.',
    level: 'advanced',
    body: `
<p>A cold flow runs its producer once per collector. Three collectors of a location flow means three GPS listeners. <code>stateIn</code> and <code>shareIn</code> run the upstream once, in a scope you pass, and hand its values to every collector.</p>
<p><code>stateIn</code> gives a <code>StateFlow</code>. It always has a value, the <code>initialValue</code> until the upstream emits. A late collector gets the current value at once, and a value equal to the current one is skipped. Use it for state the screen draws. <code>shareIn</code> gives a <code>SharedFlow</code>. It has no initial value, every emission goes out even if it repeats, and <code>replay</code> decides how many recent values a late collector gets. The default is 0.</p>
<p>Both take a <code>SharingStarted</code> policy that decides when the upstream runs, and both need a scope that outlives the collectors: <code>viewModelScope</code> for one screen, an injected app-wide scope for a repository.</p>`,
    code: `// ViewModel: state the screen draws
val uiState: StateFlow<UiState> = repo.articles()
    .map { UiState.Success(it) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)

// Repository: one socket shared by every screen that listens
class PricesRepository(socket: PriceSocket, externalScope: CoroutineScope) {
    val ticks: SharedFlow<PriceTick> = socket.ticks()      // a cold callbackFlow
        .shareIn(externalScope, SharingStarted.WhileSubscribed(), replay = 0)
}`,
    remember: 'stateIn: one current value, late collectors get it, repeats skipped. shareIn: a stream, replay decides what late collectors get.',
    terms: [
      { term: 'stateIn', def: 'Turns a flow into a StateFlow with an initial value, sharing one upstream among all collectors in a given scope.' },
      { term: 'shareIn', def: 'Turns a flow into a SharedFlow that runs one upstream for all collectors and replays a set number of recent values.' },
      { term: 'SharingStarted', def: 'The policy that decides when the shared upstream starts and stops: Eagerly, Lazily or WhileSubscribed.' },
      { term: 'Replay cache', def: 'The most recent values a SharedFlow keeps and gives to each new collector. Its size is the replay parameter.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Share one news upstream between screens, and give each new screen the latest list.', code: `val news: SharedFlow<List<Article>> = remote.newsUpdates()
    .[[shareIn]](externalScope, SharingStarted.WhileSubscribed(), replay = [[1]])`, why: '<code>shareIn</code> runs one upstream for all collectors. <code>replay = 1</code> hands the latest list to anyone who starts collecting later.' },
      { type: 'bug', prompt: 'After a rotation the profile screen stays blank until the profile changes again. Tap the bug.', code: `val profile: SharedFlow<Profile> = repo.profile()
    .shareIn(viewModelScope, SharingStarted.WhileSubscribed(5_000))

@Composable
fun ProfileScreen(vm: ProfileViewModel) {
    val p by vm.profile.collectAsStateWithLifecycle(initialValue = null)
    ProfileCard(p)
}`, bug: 1, fix: '    .shareIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), replay = 1)', why: 'With the default <code>replay = 0</code>, the new screen after rotation gets only future values. Replay the last one, or better, use <code>stateIn</code> for screen state.' },
    ],
    quiz: [
      { q: 'Three screens collect a cold <code>callbackFlow</code> of GPS fixes through one <code>shareIn</code>. How many GPS listeners are registered?', options: ['1', '3', '0'], a: 0, why: 'shareIn collects the upstream once and fans the values out to every collector.' },
      { q: 'A <code>stateIn</code> upstream emits <code>Online</code> twice in a row. How many times does a collector see it?', options: ['Once', 'Twice'], a: 0, why: 'A StateFlow skips a value equal to the current one.' },
      { q: 'With <code>shareIn(scope, started)</code> and no replay argument, what does a collector that starts late get first?', options: ['The latest value', 'Nothing until the next emission', 'Every value since the start'], a: 1, why: 'replay defaults to 0, so a late collector only sees values emitted after it arrives.' },
    ],
    deeper: [
      Object.assign({}, startPolicyStep, {
        title: 'Start policies: Eagerly, Lazily, WhileSubscribed',
        body: `<p>Both <code>stateIn</code> and <code>shareIn</code> take a start policy. <code>Eagerly</code> starts the upstream as soon as the ViewModel exists and never stops it. <code>Lazily</code> waits for the first collector, then never stops. <code>WhileSubscribed(5_000)</code> runs only while someone collects, plus five seconds.</p>
<p>All three stop when the scope is cancelled. Pick a policy and step through a screen’s life.</p>`,
      }),
      {
        title: 'Errors end the sharing: catch before stateIn',
        body: `<p>If the upstream throws, the sharing coroutine ends. Collectors are not told: they keep the last value and wait forever. The exception goes to the scope, and in <code>viewModelScope</code> an uncaught exception crashes the app.</p>
<p>Put <code>catch</code> (or <code>retry</code>) before <code>stateIn</code> or <code>shareIn</code>, and turn the failure into a value the screen can show.</p>`,
        code: `val uiState: StateFlow<UiState> = repo.articles()
    .map<List<Article>, UiState> { UiState.Success(it) }
    .catch { emit(UiState.Error("Could not load")) }     // before stateIn
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)`,
      },
      {
        title: 'WhileSubscribed can also forget the value',
        body: `<p><code>WhileSubscribed</code> has a second parameter, <code>replayExpirationMillis</code>. It is the time between stopping the upstream and resetting the cache. For <code>stateIn</code>, reset means back to <code>initialValue</code>. For <code>shareIn</code>, the replay cache is emptied. The default keeps the cache forever.</p>
<p>Use it when an old value would mislead, like a “last seen online” status after the app was in the background for an hour.</p>`,
        code: `val status = presence.updates()
    .stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(stopTimeoutMillis = 5_000, replayExpirationMillis = 0),
        Presence.Unknown,          // shown again after the upstream stopped
    )`,
      },
      {
        title: 'Need a real first value? The suspending stateIn',
        body: `<p><code>stateIn(scope)</code> without a policy or initial value is a suspend function. It starts the upstream at once, waits for the first value, and returns a StateFlow that already holds it. If the upstream completes without emitting, it throws <code>NoSuchElementException</code>.</p>`,
        code: `suspend fun settings(): StateFlow<Settings> =
    dataStore.data.map { it.toSettings() }.stateIn(appScope)   // never a placeholder`,
      },
    ],
    mistakes: [
      {
        title: 'shareIn for screen state',
        bad: `val cart: SharedFlow<Cart> = repo.cart()
    .shareIn(viewModelScope, SharingStarted.WhileSubscribed(5_000))`,
        good: `val cart: StateFlow<Cart> = repo.cart()
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), Cart.Empty)`,
        why: 'With no replay, a screen that starts collecting after the last emission, like after a rotation, has nothing to draw. Screen state wants a current value, which is what StateFlow is.',
      },
      {
        title: 'stateIn for one-off events',
        bad: `val messages: StateFlow<String?> = events
    .stateIn(viewModelScope, SharingStarted.Eagerly, null)`,
        good: `private val _messages = Channel<String>(Channel.BUFFERED)
val messages: Flow<String> = _messages.receiveAsFlow()`,
        why: 'A StateFlow skips a message equal to the last one and gives the last message to every new collector, so the same snackbar shows again after a rotation. See the Channels lesson in Coroutines.',
      },
    ],
    visual(el) {
      const MODES = [
        ['cold', 'cold flow', 'val loc = repo.locationUpdates()   // cold'],
        ['share0', 'shareIn(replay = 0)', 'val loc = repo.locationUpdates()\n    .shareIn(viewModelScope, WhileSubscribed(5_000))'],
        ['share1', 'shareIn(replay = 1)', 'val loc = repo.locationUpdates()\n    .shareIn(viewModelScope, WhileSubscribed(5_000), replay = 1)'],
        ['state', 'stateIn(initial = Loading)', 'val loc = repo.locationUpdates()\n    .stateIn(viewModelScope, WhileSubscribed(5_000), Loading)'],
      ];
      let mode = 'state', cols = [], seq = 0, last = null;
      const snippet = h('div', { class: 'kt' });
      const gps = h('span', { class: 'flw-gps off' }, 'GPS listeners: 0');
      const rows = h('div', { class: 'flw-search' });
      const o = out();
      const btns = MODES.map(([k, label]) => cmd(label, () => { mode = k; reset(); say(o, `<span class="muted">mode:</span> ${hl(label)}. Add a screen, emit, then add another.`); }));
      const chip = (text, cls = '') => h('span', { class: `flw-v drop-in ${cls}` }, text);
      function paintGps() {
        const n = mode === 'cold' ? cols.length : cols.length ? 1 : 0;
        gps.textContent = `GPS listeners: ${n}`; gps.className = `flw-gps${n ? (n > 1 ? ' bad' : '') : ' off'}`;
      }
      function reset() {
        cols = []; seq = 0; last = null;
        snippet.innerHTML = hl(MODES.find(m => m[0] === mode)[2]);
        rows.replaceChildren(h('span', { class: 'flw-note' }, 'No screen is collecting.'));
        pressed(btns, MODES.map(m => m[0]), mode); paintGps();
      }
      function give(c, v, cls) {
        c.strip.querySelectorAll('.flw-note').forEach(n => n.remove());
        c.strip.append(chip(v, cls));
        while (c.strip.children.length > 4) c.strip.firstElementChild.remove();
      }
      function add() {
        if (cols.length >= 3) { replay(rows, 'shake'); say(o, '<span class="muted">enough:</span> three screens make the point. Pick a mode to start over.'); return; }
        if (!cols.length) rows.replaceChildren();
        const c = { strip: h('div', { class: 'flw-strip flw-wrap' }, h('span', { class: 'flw-note' }, 'nothing yet')), seq: 0, last: null };
        cols.push(c);
        rows.append(h('div', { class: 'flw-srow drop-in' }, h('span', { class: 'lane-name' }, `screen ${cols.length}`), c.strip));
        paintGps();
        if (mode === 'cold') { say(o, cols.length > 1 ? `<span class="bad">another producer:</span> screen ${cols.length} started its own upstream. ${cols.length} GPS listeners now, each with its own numbers.` : 'Screen 1 started the upstream. Emit a value.'); return; }
        if (cols.length === 1 && !last) { if (mode === 'state') { give(c, 'Loading', 'warn'); say(o, '<span class="good">initial value:</span> nothing emitted yet, so the StateFlow hands out Loading.'); } else say(o, 'Screen 1 started the shared upstream. Emit a value.'); return; }
        if (mode === 'share0') say(o, '<span class="bad">replay = 0:</span> the new screen joined the shared upstream but got nothing. It waits for the next emission.');
        else if (mode === 'share1') { give(c, last, 'acc'); say(o, `<span class="good">replay = 1:</span> the new screen got ${last} from the replay cache right away.`); }
        else { give(c, last || 'Loading', last ? 'acc' : 'warn'); say(o, `<span class="good">current value:</span> a StateFlow always has one, so the new screen drew ${last || 'Loading'} at once.`); }
      }
      function emit(same) {
        if (!cols.length) { replay(gps, 'shake'); say(o, '<span class="muted">nobody collects,</span> so the upstream is not running. Add a screen first.'); return; }
        if (mode === 'cold') {
          cols.forEach(c => { if (!same || !c.last) c.last = `fix ${++c.seq}`; give(c, c.last); });
          say(o, same ? 'Each upstream sent its last fix again, and each collector got it.' : '<span class="muted">separate producers:</span> each screen counts its own fixes. They are not even seeing the same data.');
          return;
        }
        if (same && !last) { say(o, '<span class="muted">nothing to repeat yet.</span> Emit a new fix first.'); return; }
        if (same && mode === 'state') { cols.forEach(c => replay(c.strip, 'shake')); say(o, `<span class="good">skipped:</span> ${last} equals the current value, so the StateFlow did not emit it.`); return; }
        if (!same) last = `fix ${++seq}`;
        cols.forEach(c => give(c, last, 'ok'));
        say(o, same ? `<span class="muted">sent again:</span> a SharedFlow delivers ${last} again to every screen, even though it repeats.` : `<span class="good">shared:</span> one upstream, ${last} went to all ${cols.length} screen${cols.length === 1 ? '' : 's'}.`);
      }
      reset();
      o.innerHTML = 'Add a screen, emit a fix, then add another screen. Compare the modes.';
      el.append(h('div', { class: 'controls' }, btns), snippet,
        h('div', { class: 'controls' }, cmd('screen starts collecting', add), cmd('upstream emits', () => emit(false)), cmd('emit the same fix again', () => emit(true))),
        h('div', { class: 'flw-ui' }, gps), rows, o);
    },
  };

  Lab.addTrack({
    id: 'flow',
    title: 'Flow',
    description: 'How Flow streams values to your UI, from cold flows and operators to errors, callbacks, hot flows, sharing and lifecycle-aware collection.',
    group: 'Building apps', requires: ['coroutines'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
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
        deeper: coldDepth.deeper,
        underHood: coldDepth.underHood,
        mistakes: coldDepth.mistakes,
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

      // 2 ─────────────────────────────────────────────
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
        deeper: operatorsDepth.deeper,
        underHood: operatorsDepth.underHood,
        mistakes: operatorsDepth.mistakes,
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

      flatmap,
      backpressure,
      errorsRetry,

      // 3 ─────────────────────────────────────────────
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
        deeper: hotDepth.deeper,
        underHood: hotDepth.underHood,
        mistakes: hotDepth.mistakes,
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

      callbackflow,
      suspendCallback,

      // 4 ─────────────────────────────────────────────
      {
        id: 'lifecycle',
        title: 'Collecting safely in the UI',
        tagline: 'Collect while the screen is visible. Stop when it isn’t.',
        body: `
<p>A collector in the UI should run only while the screen is visible. In Compose, <code>collectAsStateWithLifecycle()</code> does this for you. In Views, wrap the collection in <code>repeatOnLifecycle(STARTED)</code>. It starts collecting when the screen reaches STARTED, cancels when it drops below, and starts again on return.</p>
<p>A plain <code>lifecycleScope.launch { flow.collect { } }</code> keeps collecting in the background until the Activity is destroyed. If the flow reads GPS or a socket, it keeps draining the battery.</p>
<p>In the ViewModel, <code>stateIn</code> turns a flow into a StateFlow with an initial value. Started with <code>SharingStarted.WhileSubscribed(5_000)</code>, it shares one upstream among all collectors and keeps it alive for 5 seconds after the last one leaves. A rotation takes far less than 5 seconds, so the upstream survives it. A trip to the home screen stops it. The next lesson, stateIn vs shareIn, covers the other start policies and when to share without a state.</p>`,
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
        deeper: lifecycleDepth.deeper,
        underHood: lifecycleDepth.underHood,
        mistakes: lifecycleDepth.mistakes,
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
      statein,
    ],
  });
})();
