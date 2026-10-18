/* Visual kit for lesson demos: Lab.ui.*
   Every component is a step player. You describe the demo as a list of frames, and the learner moves through
   them with Back / Play / Next / Reset. Frame 0 is the starting state. Each frame has `say` (HTML caption) plus
   component data. Step back works because each component rebuilds frame i from frames 0..i.
   Pass `predict: { q, options, a, why }` to ask "what do you think happens?" before the controls unlock.
   Motion: CSS transitions only, switched off by prefers-reduced-motion. Nothing plays until the learner asks.

   Lab.ui.phone(el, { frames: [{ screen, tap, log, say }] })            a phone screen (HTML built from .ui-m-* parts)
   Lab.ui.timeline(el, { lanes, span, unit, frames: [{ bars, marks, now, say }] })   work over time, per thread/lane
   Lab.ui.graph(el, { nodes, height, frames: [{ add, remove, show, gone, hl, say }] }) boxes and arrows (objects, modules)
   Lab.ui.flow(el, { nodes, frames: [{ at, packet, tone, mark, say }] })  one item moving through a pipeline
   Lab.ui.codeStepper(el, { code, frames: [{ line, vars, out, stack, say }] }) run code line by line
   Lab.ui.terminal(el, { frames: [{ cmd, out, clear, panel, say }] })  a shell session, optional side panel
   Lab.ui.predict(el, { q, options, a, why }, onDone)                   the predict box on its own
   Lab.ui.player(el, { frames, stage, draw, predict, speed })            the engine, for custom stages */
(() => {
  const { h, replay } = Lab;
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const upTo = (frames, i) => frames.slice(0, i + 1);
  const latest = (frames, i, k) => { for (let j = i; j >= 0; j--) if (frames[j][k] !== undefined) return frames[j][k]; };
  const html = (node, v) => { if (typeof v === 'function') { node.replaceChildren(); v(node); } else node.innerHTML = v == null ? '' : v; };
  const TONES = ['accent', 'ok', 'err', 'warm', 'muted'];

  function predict(el, p, onDone) {
    let done = false;
    const why = h('div', { class: 'ui-why', 'aria-live': 'polite' });
    const finish = () => { if (done) return; done = true; box.classList.add('answered'); onDone && onDone(); };
    const picks = p.options.map((o, k) => h('button', { type: 'button', class: 'ui-pick', html: o, onclick() {
      if (done) return;
      picks.forEach((b, j) => { b.disabled = true; if (j === p.a) b.classList.add('right'); });
      if (k !== p.a) picks[k].classList.add('wrong');
      why.innerHTML = `<b>${k === p.a ? 'You called it.' : 'Not quite.'}</b> ${p.why || ''} Now play it and watch.`;
      skip.remove(); finish();
    } }));
    const skip = h('button', { type: 'button', class: 'ui-skip', onclick() { why.innerHTML = 'Skipped. Play it and see.'; skip.remove(); picks.forEach(b => (b.disabled = true)); finish(); } }, 'Skip');
    const box = h('div', { class: 'ui-predict' },
      h('div', { class: 'ui-predict-head' }, h('span', { class: 'ui-predict-label' }, 'Predict first'), skip),
      h('p', { class: 'ui-predict-q', html: p.q }), h('div', { class: 'ui-picks' }, picks), why);
    el.append(box);
    return box;
  }

  function player(el, { frames, stage, draw, predict: p, speed = 1700 }) {
    let i = 0, timer = null;
    const last = frames.length - 1;
    const say = h('p', { class: 'ui-say', 'aria-live': 'polite' });
    const b = (label, text, fn) => h('button', { type: 'button', class: 'ui-ctl-btn', 'aria-label': label, title: label, onclick: fn }, text);
    const reset = b('Back to start', '↺', () => { stop(); go(0); });
    const back = b('Previous step', '◀', () => { stop(); go(i - 1); });
    const next = b('Next step', '▶', () => { stop(); go(i + 1); });
    const play = h('button', { type: 'button', class: 'ui-ctl-btn ui-play', onclick: () => (timer ? stop() : start()) }, 'Play');
    const dots = h('div', { class: 'ui-dots', 'aria-hidden': 'true' }, frames.map((_, k) => h('i', { onclick() { stop(); go(k); } })));
    const count = h('span', { class: 'ui-count' });
    const ctl = h('div', { class: 'ui-ctl' }, reset, back, play, next, dots, count);
    function go(n) {
      i = Math.max(0, Math.min(last, n));
      draw(frames[i], i);
      say.innerHTML = frames[i].say || '';
      count.textContent = `${i + 1} / ${frames.length}`;
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k <= i));
      reset.disabled = back.disabled = i === 0; next.disabled = i === last;
    }
    function stop() { clearInterval(timer); timer = null; play.textContent = i === last ? 'Replay' : 'Play'; play.classList.remove('on'); }
    function start() {
      if (i === last) go(0);
      play.textContent = 'Pause'; play.classList.add('on');
      timer = setInterval(() => { if (!el.isConnected || i >= last) return stop(); go(i + 1); if (i >= last) stop(); }, speed);
    }
    const root = h('div', { class: 'ui' });
    const lock = on => { root.classList.toggle('ui-locked', on); [reset, back, next, play].forEach(x => (x.disabled = on)); if (!on) go(i); };
    if (p) predict(root, p, () => { lock(false); play.focus({ preventScroll: true }); });
    root.append(stage, say, ctl);
    el.append(root);
    go(0);
    if (p) lock(true);
    return { go, get i() { return i; } };
  }

  // ---------- phone ----------
  function phone(el, { frames, predict: p, speed, logTitle = 'Log' }) {
    const screen = h('div', { class: 'ui-screen' });
    const dot = h('span', { class: 'ui-tap', 'aria-hidden': 'true' });
    const dev = h('div', { class: 'ui-phone' },
      h('div', { class: 'ui-status', 'aria-hidden': 'true' }, h('span', {}, '9:41'), h('span', { class: 'ui-status-icons' }, h('i'), h('i'), h('i'))),
      screen, dot, h('div', { class: 'ui-gesture', 'aria-hidden': 'true' }));
    const hasLog = frames.some(f => f.log !== undefined);
    const log = hasLog ? h('ol', { class: 'ui-log', 'aria-label': logTitle }) : null;
    const stage = h('div', { class: 'ui-stage ui-phone-stage' }, dev, hasLog ? h('div', { class: 'ui-log-box' }, h('span', { class: 'ui-panel-label' }, logTitle), log) : null);
    let shown;
    return player(el, { frames, stage, predict: p, speed, draw(f, i) {
      const s = latest(frames, i, 'screen');
      if (s !== shown) { shown = s; html(screen, s); replay(screen, 'ui-fade'); }
      dot.classList.remove('on');
      const target = f.tap && screen.querySelector(f.tap);
      if (target) {
        const a = target.getBoundingClientRect(), r = dev.getBoundingClientRect();
        dot.style.left = (a.left - r.left + a.width / 2) + 'px'; dot.style.top = (a.top - r.top + a.height / 2) + 'px';
        replay(dot, 'on');
      }
      if (log) {
        const lines = upTo(frames, i).flatMap((x, j) => (x.log == null ? [] : [].concat(x.log).map(t => [t, j === i])));
        log.replaceChildren(...lines.map(([t, isNew]) => h('li', { class: isNew ? 'new' : null, html: t })));
        log.scrollTop = log.scrollHeight;
      }
    } });
  }

  // ---------- timeline ----------
  function timeline(el, { lanes, span, unit = 'ms', frames, predict: p, speed }) {
    const tracks = lanes.map(() => h('div', { class: 'ui-lane-track' }));
    const cursor = h('div', { class: 'ui-now' });
    const grid = h('div', { class: 'ui-lanes' }, lanes.map((name, k) => h('div', { class: 'ui-lane' }, h('span', { class: 'ui-lane-name', html: name }), tracks[k])));
    const area = h('div', { class: 'ui-tl-area' }, grid, h('div', { class: 'ui-tl-overlay' }, cursor));
    const axis = h('div', { class: 'ui-axis', 'aria-hidden': 'true' }, h('span', {}, `0 ${unit}`), h('span', {}, `${span} ${unit}`));
    const marks = h('div', { class: 'ui-tl-marks' });
    area.lastChild.append(marks);
    const stage = h('div', { class: 'ui-stage ui-tl' }, area, axis);
    const pct = v => `${Math.max(0, Math.min(100, (v / span) * 100))}%`;
    return player(el, { frames, stage, predict: p, speed, draw(f, i) {
      tracks.forEach(t => t.replaceChildren());
      let end = 0;
      upTo(frames, i).forEach((x, j) => (x.bars || []).forEach(bar => {
        const lane = typeof bar.lane === 'number' ? bar.lane : lanes.indexOf(bar.lane);
        if (!tracks[lane]) return;
        end = Math.max(end, bar.to);
        tracks[lane].append(h('span', { class: `ui-bar t-${bar.tone || 'accent'}${j === i ? ' new' : ''}`, style: `left:${pct(bar.from)};width:calc(${pct(bar.to - bar.from)} - 2px)`, title: bar.label || null, html: bar.label || '' }));
      }));
      marks.replaceChildren(...upTo(frames, i).flatMap(x => x.marks || []).map(m => h('span', { class: `ui-mark t-${m.tone || 'err'}`, style: `left:${pct(m.at)}` }, h('b', { html: m.label || '' }))));
      const now = f.now !== undefined ? f.now : end;
      cursor.style.left = pct(now);
      cursor.hidden = i === 0 && f.now === undefined;
    } });
  }

  // ---------- graph ----------
  function graph(el, { nodes, frames, height = 260, predict: p, speed }) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ui-edges'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs>' + TONES.map(t => `<marker id="ui-arr-${t}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ui-arr t-${t}"/></marker>`).join('') + '</defs><g></g>';
    const g = svg.lastChild;
    const labels = h('div', { class: 'ui-edge-labels' });
    const box = h('div', { class: 'ui-graph', style: `height:${height}px` }, svg, labels);
    const els = {};
    for (const n of nodes) box.append(els[n.id] = h('div', { class: `ui-node t-${n.tone || 'accent'}`, style: `left:${n.x}%;top:${n.y}%`, html: n.label }));
    const stage = h('div', { class: 'ui-stage' }, box);
    let edges = [];
    function paint() {
      if (!box.isConnected) return;
      const r = box.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      g.replaceChildren(); labels.replaceChildren();
      for (const e of edges) {
        const A = els[e.from], B = els[e.to];
        if (!A || !B || A.hidden || B.hidden) continue;
        const a = A.getBoundingClientRect(), b = B.getBoundingClientRect();
        const ax = a.left - r.left + a.width / 2, ay = a.top - r.top + a.height / 2, bx = b.left - r.left + b.width / 2, by = b.top - r.top + b.height / 2;
        const dx = bx - ax, dy = by - ay;
        const cut = (w, hh) => Math.min(Math.abs(dx) > 0.01 ? (w / 2 + 4) / Math.abs(dx) : Infinity, Math.abs(dy) > 0.01 ? (hh / 2 + 4) / Math.abs(dy) : Infinity);
        const t1 = cut(a.width, a.height), t2 = cut(b.width, b.height);
        if (t1 + t2 >= 1) continue;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', ax + dx * t1); line.setAttribute('y1', ay + dy * t1);
        line.setAttribute('x2', bx - dx * t2); line.setAttribute('y2', by - dy * t2);
        line.setAttribute('class', `ui-edge t-${e.tone || 'muted'}${e.dash ? ' dash' : ''}${e.isNew ? ' new' : ''}`);
        line.setAttribute('marker-end', `url(#ui-arr-${e.tone || 'muted'})`);
        g.append(line);
        if (e.label) labels.append(h('span', { class: `ui-edge-label t-${e.tone || 'muted'}`, style: `left:${(ax + bx) / 2}px;top:${(ay + by) / 2}px`, html: e.label }));
      }
    }
    if (typeof ResizeObserver === 'function') new ResizeObserver(() => paint()).observe(box);
    return player(el, { frames, stage, predict: p, speed, draw(f, i) {
      const map = new Map(), gone = new Set(), shown = new Set();
      upTo(frames, i).forEach((x, j) => {
        for (const [from, to] of x.remove || []) map.delete(from + '>' + to);
        for (const [from, to, label, tone] of x.add || []) map.set(from + '>' + to, { from, to, label, tone: TONES.includes(tone) ? tone : 'muted', dash: tone === 'weak', isNew: j === i });
        (x.show || []).forEach(id => shown.add(id));
        (x.gone || []).forEach(id => gone.add(id));
        (x.back || []).forEach(id => gone.delete(id));
      });
      edges = [...map.values()];
      for (const n of nodes) {
        const e = els[n.id];
        e.hidden = !!n.hidden && !shown.has(n.id);
        e.classList.toggle('gone', gone.has(n.id));
        e.classList.toggle('hl', (f.hl || []).includes(n.id));
        e.classList.toggle('new', (f.show || []).includes(n.id));
      }
      requestAnimationFrame(paint);
    } });
  }

  // ---------- flow ----------
  function flow(el, { nodes, frames, predict: p, speed }) {
    const els = {};
    const row = h('div', { class: 'ui-flow' }, nodes.map(n => (els[n.id] = h('div', { class: 'ui-fnode' }, h('b', { html: n.label }), n.sub ? h('small', { html: n.sub }) : null, h('div', { class: 'ui-fslot' })))));
    const packet = h('span', { class: 'ui-packet' });
    const stage = h('div', { class: 'ui-stage ui-flow-wrap' }, row);
    return player(el, { frames, stage, predict: p, speed, draw(f, i) {
      const marks = Object.assign({}, ...upTo(frames, i).map(x => x.mark || {}));
      for (const n of nodes) {
        els[n.id].className = `ui-fnode${marks[n.id] ? ' t-' + marks[n.id] : ''}${f.at === n.id ? ' at' : ''}`;
      }
      const at = f.at && els[f.at];
      if (!at) { packet.remove(); return; }
      const before = packet.isConnected ? packet.getBoundingClientRect() : null;
      packet.innerHTML = latest(frames, i, 'packet') || '●';
      packet.className = `ui-packet t-${f.tone || 'accent'}`;
      at.querySelector('.ui-fslot').append(packet);
      if (before && packet.animate && !reduced()) {
        const a = packet.getBoundingClientRect();
        packet.animate([{ transform: `translate(${before.left - a.left}px, ${before.top - a.top}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)' });
      }
    } });
  }

  // ---------- code stepper ----------
  function codeStepper(el, { code, frames, predict: p, speed, varsTitle = 'Variables', outTitle = 'Output' }) {
    const lines = code.replace(/\n$/, '').split('\n').map((src, k) => h('span', { class: 'ui-ln' }, h('i', { 'aria-hidden': 'true' }, String(k + 1)), h('code', { html: Lab.hl(src) || ' ' })));
    const pre = h('pre', { class: 'ui-src' }, lines);
    const vars = h('dl', { class: 'ui-vars' });
    const stackBox = h('ol', { class: 'ui-stack' });
    const out = h('pre', { class: 'ui-out' });
    const hasStack = frames.some(f => f.stack), hasOut = frames.some(f => f.out != null), hasVars = frames.some(f => f.vars);
    const side = h('div', { class: 'ui-side' },
      hasStack ? h('div', {}, h('span', { class: 'ui-panel-label' }, 'Call stack'), stackBox) : null,
      hasVars ? h('div', {}, h('span', { class: 'ui-panel-label' }, varsTitle), vars) : null,
      hasOut ? h('div', {}, h('span', { class: 'ui-panel-label' }, outTitle), out) : null);
    const stage = h('div', { class: 'ui-stage ui-cs' }, pre, side);
    const state = i => {
      const v = {};
      upTo(frames, i).forEach(x => { for (const [k, val] of Object.entries(x.vars || {})) { if (val === null) delete v[k]; else v[k] = String(val); } });
      return v;
    };
    return player(el, { frames, stage, predict: p, speed, draw(f, i) {
      const on = [].concat(f.line || []);
      lines.forEach((ln, k) => ln.classList.toggle('on', on.includes(k + 1)));
      const cur = lines[on[0] - 1];
      if (cur) { const top = cur.offsetTop - pre.clientHeight / 2 + cur.offsetHeight / 2; pre.scrollTop = Math.max(0, top); }
      const now = state(i), before = i ? state(i - 1) : {};
      vars.replaceChildren(...Object.entries(now).flatMap(([k, val]) => [h('dt', {}, k), h('dd', { class: before[k] !== val ? 'changed' : null }, val)]));
      stackBox.replaceChildren(...[].concat(latest(frames, i, 'stack') || []).map((s, k, all) => h('li', { class: k === all.length - 1 ? 'top' : null, html: s })));
      out.textContent = upTo(frames, i).map(x => x.out).filter(x => x != null).join('\n');
    } });
  }

  // ---------- terminal ----------
  function terminal(el, { frames, predict: p, speed, prompt = '$', panelTitle = '' }) {
    const scr = h('div', { class: 'ui-term', role: 'log' });
    const hasPanel = frames.some(f => f.panel !== undefined);
    const panel = hasPanel ? h('div', { class: 'ui-term-panel' }) : null;
    const stage = h('div', { class: 'ui-stage ui-term-wrap' }, h('div', { class: 'ui-term-box' }, h('div', { class: 'ui-term-bar', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), scr),
      hasPanel ? h('div', { class: 'ui-term-side' }, panelTitle ? h('span', { class: 'ui-panel-label' }, panelTitle) : null, panel) : null);
    let shown;
    return player(el, { frames, stage, predict: p, speed, draw(f, i) {
      let start = 0;
      upTo(frames, i).forEach((x, j) => { if (x.clear) start = j; });
      const rows = [];
      frames.slice(start, i + 1).forEach((x, j) => {
        const isNew = start + j === i;
        if (x.cmd) rows.push(h('div', { class: 'ui-cmdline' + (isNew ? ' new' : '') }, h('span', { class: 'ui-prompt' }, prompt + ' '), x.cmd));
        if (x.out) rows.push(h('div', { class: 'ui-outline' + (isNew ? ' new' : ''), html: x.out }));
      });
      scr.replaceChildren(...rows);
      scr.scrollTop = scr.scrollHeight;
      if (panel) { const v = latest(frames, i, 'panel'); if (v !== shown) { shown = v; html(panel, v); replay(panel, 'ui-fade'); } }
    } });
  }

  Lab.ui = { player, predict, phone, timeline, graph, flow, codeStepper, terminal };
})();
