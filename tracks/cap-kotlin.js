/* Capstone project: Expense Tracker Core (pure Kotlin, no Android yet).
   A project is a track with kind: 'project'. Its lessons are build steps; each step adds code that the next one uses.
   Every step's demo shows the program running in a terminal mock plus a class diagram that grows step by step.
   Demo styles live in the css string below; every class is prefixed ck-, every input id starts with ck-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const kt = src => h('div', { class: 'kt', html: hl(src) });
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  // ---------- the program's data, mirrored in JS so the demos behave like the Kotlin code ----------
  const CATS = ['FOOD', 'RENT', 'TRAVEL', 'FUN', 'OTHER'];
  const LABEL = { FOOD: 'Food', RENT: 'Rent', TRAVEL: 'Travel', FUN: 'Fun', OTHER: 'Other' };
  const TODAY = '2026-03-14';
  const fmt = c => `${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}`;
  const expStr = e => `Expense(id=${e.id}, amount=${fmt(e.cents)}, category=${e.cat}, note=${e.note}, date=${e.date})`;

  // Same rules as parseMoney: a positive decimal with at most 2 fraction digits.
  function parseMoney(t) {
    if (!/^\+?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null;
    const [w, f = ''] = t.replace('+', '').split('.');
    if (f.length > 2) return null;
    const cents = Number(w || 0) * 100 + Number((f + '00').slice(0, 2));
    return cents > 0 ? cents : null;
  }
  // Same as line.trim().split(Regex("\\s+"), limit = 3)
  function split3(line) {
    let rest = line.trim();
    const parts = [];
    for (let i = 0; i < 2; i++) {
      const k = rest.search(/\s+/);
      if (k < 0) break;
      parts.push(rest.slice(0, k)); rest = rest.slice(k).replace(/^\s+/, '');
    }
    parts.push(rest);
    return parts;
  }
  // Returns { ok, e } or { ok: false, msg, stage } where stage is the step that failed (1 amount, 2 category).
  function parseExpense(line, id, date = TODAY) {
    const parts = split3(line);
    const cents = parseMoney(parts[0]);
    if (cents == null) return { ok: false, parts, stage: 1, msg: `'${parts[0]}' is not an amount like 12.50` };
    const cat = parts[1] != null ? CATS.find(c => c === parts[1].toUpperCase()) : null;
    if (!cat) return { ok: false, parts, stage: 2, cents, msg: `Pick a category: ${CATS.map(c => c.toLowerCase()).join(', ')}` };
    return { ok: true, parts, e: { id, cents, cat, note: parts[2] || '', date } };
  }
  const resultStr = r => (r.ok ? `Success(${expStr(r.e)})` : `Failure(tracker.ParseException: ${r.msg})`);
  function totals(list) {
    const m = new Map();
    for (const e of list) m.set(e.cat, (m.get(e.cat) || 0) + e.cents);
    return m;
  }
  const mapStr = m => `{${[...m].map(([k, v]) => `${k}=${fmt(v)}`).join(', ')}}`;

  // ---------- terminal mock ----------
  function terminal(title) {
    const body = h('div', { class: 'ck-term-body', role: 'log', 'aria-live': 'polite', 'aria-label': 'Program output' });
    const el = h('div', { class: 'ck-term' },
      h('div', { class: 'ck-term-bar', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('span', {}, title)), body);
    const line = (text, cls = '') => {
      const ln = h('div', { class: `ck-ln ${cls} drop-in` }, text);
      body.append(ln);
      while (body.children.length > 14) body.firstChild.remove();
      body.scrollTop = body.scrollHeight;
      return ln;
    };
    return {
      el, line,
      in: t => line(t, 'ck-in'),
      ok: t => line(t, 'ck-ok'),
      err: t => line(t, 'ck-err'),
      warn: t => line(t, 'ck-warn'),
      dim: t => line(t, 'ck-dim'),
      clear: () => body.replaceChildren(),
    };
  }

  // ---------- class diagram that grows with the steps ----------
  // row: layer from top (entry points) to bottom (model). step: the build step that adds it.
  const NODES = [
    { id: 'main', row: 0, step: 8, name: 'main()', kind: 'fun', mem: ['runBlocking { }', 'readlnOrNull()'] },
    { id: 'test', row: 0, step: 7, name: 'ExpenseTrackerTest', kind: 'test', mem: ['5 x @Test', 'runTest { }'] },
    { id: 'tracker', row: 1, step: 4, name: 'ExpenseTracker', kind: 'class', mem: ['add(line): Result<Expense>', 'report(month)'] },
    { id: 'budget', row: 1, step: 5, name: 'Budget', kind: 'data class + DSL', mem: ['budget { }', 'check(totals)'] },
    { id: 'sync', row: 1, step: 6, name: 'SyncService', kind: 'class', mem: ['suspend syncPending(): Int'] },
    { id: 'parse', row: 2, step: 2, name: 'parseExpense()', kind: 'fun', mem: ['Result<Expense>', 'parseMoney(): Money?'] },
    { id: 'reports', row: 2, step: 3, name: 'Reports.kt', kind: 'extensions', mem: ['totalsByCategory()', 'topCategories(n)'] },
    { id: 'repo', row: 2, step: 4, name: 'ExpenseRepository', kind: 'interface', mem: ['add(expense)', 'all()', 'nextId()'] },
    { id: 'api', row: 2, step: 6, name: 'SyncApi', kind: 'interface', mem: ['suspend upload(batch)'] },
    { id: 'mem', row: 3, step: 4, name: 'InMemoryExpenseRepository', kind: 'class', mem: ['items: MutableList'] },
    { id: 'fakeapi', row: 3, step: 6, name: 'FakeSyncApi', kind: 'class', mem: ['failuresLeft', 'received'] },
    { id: 'expense', row: 4, step: 1, name: 'Expense', kind: 'data class', mem: ['id, amount: Money', 'category, note, date'] },
    { id: 'money', row: 4, step: 1, name: 'Money', kind: 'value class', mem: ['cents: Long', 'plus(other)'] },
    { id: 'category', row: 4, step: 1, name: 'Category', kind: 'enum', mem: ['FOOD RENT TRAVEL', 'FUN OTHER'] },
    { id: 'alert', row: 4, step: 5, name: 'BudgetAlert', kind: 'sealed', mem: ['Near', 'Over'] },
  ];
  // [from, to, step, impl?]
  const EDGES = [
    ['parse', 'expense', 2], ['reports', 'expense', 3],
    ['tracker', 'parse', 4], ['tracker', 'repo', 4], ['tracker', 'reports', 4], ['mem', 'repo', 4, true],
    ['budget', 'alert', 5],
    ['sync', 'repo', 6], ['sync', 'api', 6], ['fakeapi', 'api', 6, true],
    ['test', 'tracker', 7], ['test', 'sync', 7],
    ['main', 'tracker', 8], ['main', 'budget', 8], ['main', 'sync', 8],
  ];
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };

  function diagram(step) {
    const nodes = {};
    const svg = svgEl('svg', { 'aria-hidden': 'true' });
    const shown = NODES.filter(n => n.step <= step);
    const rows = [0, 1, 2, 3, 4].map(r => shown.filter(n => n.row === r)).filter(r => r.length).map(list =>
      h('div', { class: 'ck-row' }, list.map(n => {
        const fresh = n.step === step;
        const mem = h('span', { class: 'ck-mem', hidden: !fresh }, n.mem.map(m => h('span', {}, m)));
        const b = h('button', {
          type: 'button', class: ['ck-node', fresh && 'ck-new', n.kind === 'interface' && 'ck-iface', n.kind === 'test' && 'ck-testnode'].filter(Boolean).join(' '),
          'aria-expanded': String(fresh), 'aria-label': `${n.name}, ${n.kind}${fresh ? ', new in this step' : ''}`,
          onclick() { mem.hidden = !mem.hidden; b.setAttribute('aria-expanded', String(!mem.hidden)); draw(); },
        }, h('span', { class: 'ck-kind' }, n.kind, fresh ? h('em', {}, 'new') : null), h('b', {}, n.name), mem);
        nodes[n.id] = b;
        return b;
      })));
    const edges = EDGES.filter(e => e[2] <= step && nodes[e[0]] && nodes[e[1]]);
    const wrap = h('figure', { class: 'ck-dia', 'aria-label': `Class diagram after step ${step}` },
      svg,
      h('figcaption', { class: 'ck-dia-head' }, h('span', {}, `Class diagram · step ${step}`),
        h('span', { class: 'ck-legend' }, h('span', { class: 'ck-lg ck-lg-new' }, 'new'), h('span', { class: 'ck-lg ck-lg-use' }, 'uses'), step >= 4 ? h('span', { class: 'ck-lg ck-lg-impl' }, 'implements') : null)),
      rows,
      h('p', { class: 'ck-dia-tip' }, 'Tap a box to show or hide its members.'));

    let first = true, drawn = false; // edges animate in on the first draw only
    function draw() {
      if (!wrap.isConnected) { ro.disconnect(); return; }
      const box = wrap.getBoundingClientRect();
      if (!box.width) return;
      if (drawn) first = false;
      drawn = true;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      svg.replaceChildren();
      // spread several arrows that touch the same box along its edge
      const ports = {};
      const port = (id, side) => { const k = id + side; ports[k] = (ports[k] || 0) + 1; return ports[k]; };
      const plan = edges.map(([from, to, s, impl]) => {
        const a = nodes[from].getBoundingClientRect(), b = nodes[to].getBoundingClientRect();
        const down = a.top < b.top;
        return { a, b, down, impl, fresh: s === step, pa: port(from, down ? 'b' : 't'), pb: port(to, down ? 't' : 'b'), from, to };
      });
      for (const p of plan) {
        const na = ports[p.from + (p.down ? 'b' : 't')], nb = ports[p.to + (p.down ? 't' : 'b')];
        const x1 = p.a.left - box.left + (p.a.width * p.pa) / (na + 1);
        const x2 = p.b.left - box.left + (p.b.width * p.pb) / (nb + 1);
        const y1 = (p.down ? p.a.bottom : p.a.top) - box.top;
        const y2 = (p.down ? p.b.top : p.b.bottom) - box.top;
        const dir = p.down ? 1 : -1, tip = y2 - dir * 7, my = (y1 + tip) / 2;
        const cls = ['ck-edge', p.impl && 'ck-impl', p.fresh && 'ck-enew'].filter(Boolean).join(' ');
        const path = svgEl('path', { d: `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${tip}`, class: cls });
        if (p.fresh && !p.impl && first) path.setAttribute('pathLength', '1');
        svg.append(path, svgEl('polygon', { points: `${x2 - 5},${tip} ${x2 + 5},${tip} ${x2},${y2}`, class: cls.replace('ck-edge', 'ck-arrow') }));
      }
    }
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    rows.forEach(r => ro.observe(r));
    setTimeout(draw, 500);
    const flash = (...ids) => ids.forEach(id => { if (nodes[id]) replay(nodes[id], 'ck-hot'); });
    return { el: wrap, flash, draw };
  }

  const css = `
.ck-term { border-radius: 12px; background: var(--code-bg); overflow: hidden; min-width: 0; }
.ck-term-bar { display: flex; align-items: center; gap: 6px; padding: 7px 12px; background: rgba(255, 255, 255, 0.06); font: 600 0.72rem var(--mono); color: var(--t-c); min-width: 0; }
.ck-term-bar i { flex: none; width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.18); }
.ck-term-bar span { margin-left: 6px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ck-term-body { display: grid; align-content: start; gap: 1px; padding: 10px 14px; min-height: 8.5em; max-height: 17em; overflow: auto; font: 500 0.8rem/1.55 var(--mono); color: var(--code-ink); }
.ck-ln { white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.ck-ln.ck-in { color: var(--t-t); }
.ck-ln.ck-in::before { content: "> "; color: var(--t-c); }
.ck-ln.ck-ok { color: var(--t-k); }
.ck-ln.ck-err { color: var(--t-e); }
.ck-ln.ck-warn { color: var(--t-s); }
.ck-ln.ck-dim { color: var(--t-c); font-style: italic; }

.ck-dia { position: relative; margin: 0; display: grid; gap: 22px; padding: 12px 10px 10px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); min-width: 0; }
.ck-dia > svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 0; }
.ck-dia-head { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px 12px; font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.ck-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; text-transform: none; letter-spacing: 0; font-weight: 500; }
.ck-lg { display: inline-flex; align-items: center; gap: 5px; }
.ck-lg::before { content: ""; display: inline-block; width: 18px; height: 0; border-top: 2px solid var(--muted); }
.ck-lg-new::before { width: 12px; height: 10px; border: 2px solid var(--accent); border-radius: 3px; background: var(--accent-soft); }
.ck-lg-impl::before { border-top-style: dashed; }
.ck-row { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 12px 14px; min-width: 0; }
.ck-node { display: grid; gap: 1px; text-align: left; padding: 6px 9px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); font: 500 0.72rem/1.35 var(--mono); max-width: 100%; min-width: 0; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; animation: ck-fade 0.5s ease-out both; }
.ck-node:hover { border-color: var(--muted); }
.ck-node b { font-weight: 700; overflow-wrap: anywhere; }
.ck-node.ck-iface { border-style: dashed; border-color: var(--muted); }
.ck-node.ck-testnode b { color: var(--ok); }
.ck-node.ck-new { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.ck-node.ck-hot { animation: ck-hot 1s ease-out; }
.ck-kind { display: flex; gap: 6px; align-items: center; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.ck-kind em { font-style: normal; color: var(--accent); }
.ck-mem { display: grid; color: var(--muted); font-size: 0.68rem; border-top: 1px dashed var(--line); padding-top: 3px; margin-top: 3px; }
.ck-mem span { overflow-wrap: anywhere; }
.ck-dia-tip { position: relative; z-index: 1; font-size: 0.78rem; color: var(--muted); text-align: center; }
.ck-edge { fill: none; stroke: var(--muted); stroke-width: 1.4; opacity: 0.65; }
.ck-edge.ck-impl { stroke-dasharray: 5 4; }
.ck-edge.ck-enew { stroke: var(--accent); stroke-width: 2; opacity: 1; }
.ck-edge.ck-enew[pathLength] { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ck-draw 0.7s 0.2s ease-out forwards; }
.ck-arrow { fill: var(--muted); opacity: 0.65; }
.ck-arrow.ck-impl { fill: var(--bg); stroke: var(--muted); stroke-width: 1.4; }
.ck-arrow.ck-enew { fill: var(--accent); opacity: 1; }
.ck-arrow.ck-impl.ck-enew { fill: var(--bg); stroke: var(--accent); }
@keyframes ck-draw { to { stroke-dashoffset: 0; } }
@keyframes ck-fade { from { opacity: 0; } }
@keyframes ck-hot { from { background: var(--warm-soft); border-color: var(--warm); box-shadow: 0 0 0 5px var(--warm-soft); } }

.ck-stage { align-items: stretch; }
.ck-card { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; max-width: 100%; transition: border-color 0.25s; }
.ck-card.ck-on { border-color: var(--accent); }
.ck-card.ck-bad { border-color: var(--err); }
.ck-card-title { font: 700 0.8rem var(--mono); overflow-wrap: anywhere; }
.ck-tag { justify-self: start; font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.ck-tag.ck-good { background: var(--ok-soft); color: var(--ok); }
.ck-tag.ck-warnt { background: var(--warm-soft); color: var(--warm); }
.ck-tag.ck-badt { background: var(--err-soft); color: var(--err); }
.ck-stage .obj { min-width: 0; max-width: 100%; }
.ck-stage .field { overflow-wrap: anywhere; }

.ck-input { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.ck-input label { font: 600 0.82rem var(--mono); color: var(--muted); }
.ck-input input { flex: 1 1 180px; min-width: 0; font: 500 0.95rem var(--mono); padding: 8px 12px; border-radius: 9px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
.ck-pipe { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; min-width: 0; }
.ck-st { position: relative; display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.ck-st-name { font: 600 0.7rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.ck-st-val { font: 600 0.78rem var(--mono); overflow-wrap: anywhere; min-height: 1.4em; }
.ck-st.ck-on { border-color: var(--accent); background: var(--accent-soft); }
.ck-st.ck-pass { border-color: var(--ok); }
.ck-st.ck-fail { border-color: var(--err); background: var(--err-soft); }
.ck-st.ck-fail .ck-st-val { color: var(--err); }

.ck-code { display: grid; background: var(--code-bg); border-radius: 12px; padding: 8px; overflow-x: auto; min-width: 0; }
.ck-line { font: 500 0.8rem/1.6 var(--mono); color: var(--code-ink); white-space: pre; padding: 1px 8px; border-radius: 6px; border: 1px solid transparent; transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.ck-line.ck-cur { background: rgba(126, 226, 168, 0.14); border-color: var(--t-k); }
.ck-line.ck-off { opacity: 0.45; }
.ck-flow { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; justify-content: center; min-width: 0; }
.ck-exp { display: inline-grid; gap: 0; padding: 5px 9px; border-radius: 9px; border: 2px solid var(--ink); background: var(--surface); font: 600 0.74rem/1.3 var(--mono); transition: opacity 0.3s; }
.ck-exp small { font-weight: 500; color: var(--muted); }
.ck-exp.ck-out { opacity: 0.35; border-style: dashed; text-decoration: line-through; }
.ck-exp.ck-synced { border-color: var(--ok); background: var(--ok-soft); }
.ck-bucket { display: grid; gap: 6px; justify-items: center; padding: 8px; border-radius: 12px; border: 1.5px dashed var(--line); background: var(--surface); min-width: 0; }
.ck-bucket-key { font: 700 0.74rem var(--mono); color: var(--accent); }
.ck-bucket .chip { height: 36px; min-width: 0; font-size: 0.86rem; }
.ck-bars { display: grid; gap: 8px; width: 100%; min-width: 0; }
.ck-bar { display: grid; grid-template-columns: 70px minmax(0, 1fr) auto; gap: 8px; align-items: center; font: 600 0.76rem var(--mono); transition: opacity 0.3s; }
.ck-bar-track { height: 18px; border-radius: 6px; background: var(--sunk); overflow: hidden; }
.ck-bar-fill { display: block; height: 100%; width: 0; border-radius: 6px; background: var(--accent); transition: width 0.6s ease-out; }
.ck-bar.ck-dropped { opacity: 0.35; }
.ck-bar.ck-dropped .ck-bar-fill { background: var(--muted); }

.ck-dip { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 8px; align-items: center; min-width: 0; }
.ck-socket { display: grid; gap: 4px; justify-items: center; padding: 10px; border-radius: 12px; border: 2px dashed var(--muted); background: var(--bg); font: 700 0.76rem var(--mono); text-align: center; overflow-wrap: anywhere; min-width: 0; }
.ck-link { font: 700 1rem var(--mono); color: var(--muted); text-align: center; }
.ck-items { display: flex; flex-wrap: wrap; gap: 5px; min-height: 30px; align-items: center; }
.ck-file { font: 500 0.72rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 6px 8px; white-space: pre; overflow-x: auto; min-height: 2.2em; }

.ck-meters { display: grid; gap: 12px; width: 100%; min-width: 0; }
.ck-meter { display: grid; gap: 5px; min-width: 0; }
.ck-meter-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; font: 600 0.78rem var(--mono); }
.ck-meter-track { position: relative; height: 16px; border-radius: 6px; background: var(--sunk); }
.ck-meter-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; background: var(--accent); transition: width 0.5s ease-out, background 0.3s; }
.ck-meter-fill.ck-near { background: var(--warm); }
.ck-meter-fill.ck-over { background: var(--err); }
.ck-warnline { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--ink); transition: left 0.4s; }
.ck-meter.ck-unset { opacity: 0.45; }

.ck-tests { display: grid; gap: 6px; min-width: 0; }
.ck-test { display: grid; grid-template-columns: 16px minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; padding: 6px 10px; border-radius: 9px; background: var(--surface); border: 1px solid var(--line); font: 500 0.78rem var(--mono); transition: border-color 0.2s; }
.ck-test b { font-weight: 600; overflow-wrap: anywhere; }
.ck-test small { color: var(--muted); }
.ck-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--sunk); border: 2px solid var(--line); }
.ck-test.ck-run .ck-dot { border-color: var(--accent); border-top-color: transparent; animation: spin 0.6s linear infinite; }
.ck-test.ck-pass { border-color: var(--ok); }
.ck-test.ck-pass .ck-dot { background: var(--ok); border-color: var(--ok); }
.ck-test.ck-fail { border-color: var(--err); background: var(--err-soft); }
.ck-test.ck-fail .ck-dot { background: var(--err); border-color: var(--err); }
.ck-test .ck-why { grid-column: 2 / -1; color: var(--err); font-size: 0.72rem; overflow-wrap: anywhere; }
.ck-stats { display: flex; flex-wrap: wrap; gap: 6px 14px; font: 600 0.78rem var(--mono); color: var(--muted); }
.ck-stats b { color: var(--ink); }
.ck-sync .lane-name { overflow-wrap: anywhere; }
@media (max-width: 560px) {
  .ck-pipe { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ck-dip { grid-template-columns: minmax(0, 1fr); }
  .ck-link { transform: rotate(90deg); }
  .ck-bar { grid-template-columns: 54px minmax(0, 1fr) auto; }
}
`;

  Lab.addTrack({
    id: 'capkotlin',
    title: 'Expense Tracker Core',
    kind: 'project',
    group: 'Foundations',
    requires: ['kotlin', 'solid'],
    description: 'Build the core of an expense tracker in plain Kotlin, step by step, before any Android code.',
    builds: 'A tested Kotlin module that parses expenses, reports totals, checks budgets and syncs in the background, with a small console app on top.',
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'model',
        title: 'Model the data',
        tagline: 'Money, Category and Expense: three types the rest is built on.',
        level: 'beginner',
        refs: ['kotlin.data', 'kotlin.enums', 'kdeep.value', 'kotlin.classes'],
        body: `
<p>We start with the data. An expense has an amount, a category, a note and a date. Each one gets a type that makes wrong values hard to write.</p>
<p><code>Money</code> is a value class around a <code>Long</code> of cents. A <code>Double</code> can’t store 0.10 exactly, so sums of doubles drift. Cents stay exact. The value class costs nothing at runtime, and its <code>init</code> block rejects negative amounts. <code>Category</code> is an enum because the set is small and fixed. <code>Expense</code> is a data class, so <code>equals</code>, <code>toString</code> and <code>copy</code> come for free.</p>
<p>This is a plain Kotlin JVM project with no Android in it. Every step runs from a <code>main</code> function or a unit test. Run the lines in the demo and watch the first boxes of the class diagram appear.</p>`,
        code: `// src/main/kotlin/tracker/Model.kt
package tracker

import java.time.LocalDate

@JvmInline
value class Money(val cents: Long) {
    init { require(cents >= 0) { "Money can't be negative: $cents" } }

    operator fun plus(other: Money) = Money(cents + other.cents)

    override fun toString() = "%d.%02d".format(cents / 100, cents % 100)

    companion object {
        val ZERO = Money(0)
    }
}

enum class Category(val label: String) {
    FOOD("Food"), RENT("Rent"), TRAVEL("Travel"), FUN("Fun"), OTHER("Other")
}

data class Expense(
    val id: Long,
    val amount: Money,
    val category: Category,
    val note: String = "",
    val date: LocalDate,
)`,
        remember: 'Give each idea its own type: Money in cents, a fixed enum for categories, a data class for the record.',
        challenges: [
          { type: 'blank', prompt: 'Declare the amount type with no runtime cost, and the record with free <code>equals</code> and <code>copy</code>.', code: '@JvmInline\n[[value]] class Money(val cents: Long)\n\n[[data]] class Expense(val id: Long, val amount: Money, val category: Category)', why: 'A <code>value class</code> wraps one value without an extra object in most places. A <code>data class</code> generates <code>equals</code>, <code>hashCode</code>, <code>toString</code> and <code>copy</code>.' },
          { type: 'bug', prompt: 'One line will make totals drift by a cent now and then. Tap it.', code: '@JvmInline\nvalue class Money(val cents: Long) {\n    init { require(cents >= 0) { "negative: $cents" } }\n    operator fun plus(other: Money) = Money(cents + other.cents)\n}\n\ndata class Expense(val id: Long, val amount: Double, val category: Category)', bug: 6, fix: 'data class Expense(val id: Long, val amount: Money, val category: Category)', why: 'A <code>Double</code> stores 0.1 as a binary fraction that is slightly off, so sums like 0.1 + 0.2 give 0.30000000000000004. The <code>Money</code> type exists to avoid that.' },
        ],
        quiz: [
          { q: 'Why does <code>Money</code> hold a <code>Long</code> of cents instead of a <code>Double</code>?', options: ['A Double can’t represent amounts like 0.10 exactly, so sums drift', 'A Long prints faster', 'Value classes only accept Long'], a: 0, why: 'Binary floating point rounds most decimal fractions. Whole cents add up exactly.' },
          { q: 'What does <code>e.copy(note = "team lunch")</code> return?', options: ['A new Expense with the same other fields and the new note', 'The same object with its note changed', 'A compile error, because note is a val'], a: 0, why: '<code>copy</code> builds a new instance. The original stays as it was.' },
          { q: 'At runtime, a parameter of type <code>Money</code> is usually stored as', options: ['A plain <code>long</code>', 'A Money object on the heap', 'A String'], a: 0, why: 'The compiler unwraps value classes to their single property. It boxes them only where it must, for example when used as a nullable or generic type.' },
        ],
        visual(el) {
          const term = terminal('Model.kt · scratch run');
          const dia = diagram(1);
          const base = { id: 1, cents: 1250, cat: 'FOOD', note: 'lunch', date: TODAY };
          const stage = h('div', { class: 'stage ck-stage' });
          const card = (x, title, changed) => h('div', { class: 'obj drop-in' },
            h('span', { class: 'obj-name' }, title),
            ['id', 'amount', 'category', 'note', 'date'].map(k => h('span', { class: 'field' + (k === changed ? ' changed' : '') },
              `${k} = ${k === 'amount' ? fmt(x.cents) : k === 'category' ? 'Category.' + x.cat : k === 'note' ? `"${x.note}"` : k === 'id' ? x.id : x.date}`)));
          let eCard = card(base, 'val e'), copyCard = null;
          stage.append(eCard);
          const run = (src, fn) => cmd(src, () => { term.in(src); fn(); });
          el.append(
            stage,
            h('div', { class: 'controls' },
              run('println(Money(1250))', () => { term.ok('12.50'); dia.flash('money'); }),
              run('Money(1250) + Money(830)', () => { term.ok('20.80'); dia.flash('money'); }),
              run('Money(-5)', () => { term.err("IllegalArgumentException: Money can't be negative: -5"); replay(stage, 'shake'); dia.flash('money'); }),
              run('Category.entries', () => { term.ok(`[${CATS.join(', ')}]`); dia.flash('category'); }),
              run('println(e)', () => { term.ok(expStr(base)); replay(eCard, 'pop'); dia.flash('expense', 'money', 'category'); }),
              run('val c = e.copy(note = "team lunch")', () => {
                if (copyCard) copyCard.remove();
                copyCard = card({ ...base, note: 'team lunch' }, 'val c', 'note');
                stage.append(copyCard);
                term.ok(expStr({ ...base, note: 'team lunch' }));
                dia.flash('expense');
              }),
              run('e == e.copy()', () => { term.ok('true  // data classes compare fields'); replay(eCard, 'pop'); dia.flash('expense'); })),
            term.el, dia.el);
          term.dim('// Tap a line above to run it.');
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'parse',
        title: 'Parse input safely',
        tagline: 'Turn "12.50 food lunch" into an Expense, or a clear error.',
        level: 'beginner',
        refs: ['kotlin.nulls', 'kdeep.errors', 'kotlin.exceptions', 'kotlin.types'],
        body: `
<p>Users type expenses as text: an amount, a category and an optional note. Text can be anything, so parsing must handle bad input without crashing.</p>
<p>Two tools do the work. Small helpers return <code>null</code> when they can’t parse: <code>parseMoney</code> uses <code>toBigDecimalOrNull()</code>, and <code>Category.from</code> uses <code>firstOrNull</code>. The elvis operator <code>?:</code> turns each null into a <code>ParseException</code> with a helpful message. <code>runCatching</code> wraps the whole thing into a <code>Result&lt;Expense&gt;</code>, so the caller sees in the type that parsing can fail.</p>
<p>Type a line in the demo, or pick one, and watch it pass through each check. The first check that fails decides the error.</p>`,
        code: `// Model.kt: Category gets a lookup
enum class Category(val label: String) {
    FOOD("Food"), RENT("Rent"), TRAVEL("Travel"), FUN("Fun"), OTHER("Other");

    companion object {
        fun from(text: String): Category? =
            entries.firstOrNull { it.name.equals(text, ignoreCase = true) }
    }
}

// src/main/kotlin/tracker/Parser.kt
class ParseException(message: String) : IllegalArgumentException(message)

fun parseMoney(text: String): Money? =
    text.toBigDecimalOrNull()
        ?.takeIf { it.signum() > 0 && it.scale() <= 2 }
        ?.let { Money(it.movePointRight(2).longValueExact()) }

fun parseExpense(line: String, id: Long, date: LocalDate): Result<Expense> = runCatching {
    val parts = line.trim().split(Regex("\\\\s+"), limit = 3)
    val amount = parseMoney(parts[0])
        ?: throw ParseException("'\${parts[0]}' is not an amount like 12.50")
    val category = parts.getOrNull(1)?.let { Category.from(it) }
        ?: throw ParseException("Pick a category: \${Category.entries.joinToString { it.name.lowercase() }}")
    Expense(id, amount, category, note = parts.getOrNull(2).orEmpty(), date = date)
}

// Calling it
parseExpense("12.50 food lunch", id = 1, date = LocalDate.now())
    .onSuccess { println("Added $it") }
    .onFailure { println("Error: \${it.message}") }`,
        remember: 'Helpers return null, ?: turns null into a clear error, runCatching turns the error into a Result.',
        terms: [
          { term: 'toBigDecimalOrNull', def: 'Parses a string as an exact decimal number and returns null instead of throwing when the text is not a number.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish <code>parseMoney</code>: parse without throwing, then wrap the cents.', code: 'fun parseMoney(text: String): Money? =\n    text.[[toBigDecimalOrNull]]()\n        ?.takeIf { it.signum() > 0 && it.scale() <= 2 }\n        ?.[[let]] { Money(it.movePointRight(2).longValueExact()) }', why: '<code>toBigDecimalOrNull</code> gives null for bad text, and each <code>?.</code> skips the rest of the chain once a value is null.' },
          { type: 'bug', prompt: 'Bad amounts end up as a useless <code>NullPointerException</code> in the Result. Tap the line.', code: 'fun parseExpense(line: String, id: Long, date: LocalDate): Result<Expense> = runCatching {\n    val parts = line.trim().split(Regex("\\\\s+"), limit = 3)\n    val amount = parseMoney(parts[0])!!\n    val category = parts.getOrNull(1)?.let { Category.from(it) }\n        ?: throw ParseException("Unknown category")\n    Expense(id, amount, category, parts.getOrNull(2).orEmpty(), date)\n}', bug: 2, fix: 'val amount = parseMoney(parts[0]) ?: throw ParseException("Not an amount: ${parts[0]}")', why: '<code>!!</code> throws a bare <code>NullPointerException</code>. The Result is still a failure, but the message tells the user nothing and code that checks for <code>ParseException</code> misses it.' },
        ],
        quiz: [
          { q: 'What does <code>parseMoney("4.999")</code> return?', options: ['<code>null</code>, because the scale is 3', '<code>Money(499)</code>', 'It throws ArithmeticException'], a: 0, why: '<code>takeIf { it.scale() &lt;= 2 }</code> turns any amount with more than two decimals into null.' },
          { q: 'Why return <code>Result&lt;Expense&gt;</code> instead of throwing from <code>parseExpense</code>?', options: ['The type tells callers that parsing can fail, and they handle both cases', 'Result is faster than an exception', 'Kotlin functions can’t throw'], a: 0, why: 'A thrown exception is invisible in the signature. A Result makes failure part of the return type.' },
          { q: 'What happens with the input <code>"12"</code>?', options: ['<code>getOrNull(1)</code> is null, so the elvis throws a ParseException inside runCatching', 'IndexOutOfBoundsException crashes the program', 'The category defaults to OTHER'], a: 0, why: '<code>getOrNull</code> never throws. The missing category becomes a ParseException, and <code>runCatching</code> wraps it in a failed Result.' },
        ],
        mistakes: [
          { title: 'Parsing money through Double', bad: 'fun parseMoney(text: String): Money? {\n    val value = text.toDoubleOrNull() ?: return null\n    return Money((value * 100).toLong())\n}\n// "0.29" -> 28 cents', good: 'fun parseMoney(text: String): Money? =\n    text.toBigDecimalOrNull()\n        ?.takeIf { it.signum() > 0 && it.scale() <= 2 }\n        ?.let { Money(it.movePointRight(2).longValueExact()) }', why: '<code>0.29 * 100</code> is <code>28.999999999999996</code> in floating point, and <code>toLong()</code> cuts it to 28. <code>BigDecimal</code> keeps the decimal digits exact.' },
          { title: 'Splitting on a single space', bad: 'val parts = line.split(" ")\n// "12.50  food" -> ["12.50", "", "food"]', good: 'val parts = line.trim().split(Regex("\\\\s+"), limit = 3)\n// "12.50  food lunch" -> ["12.50", "food", "lunch"]', why: 'Users type double spaces and trailing spaces. A whitespace regex absorbs them, and <code>limit = 3</code> keeps the note in one piece even when it has spaces.' },
        ],
        visual(el) {
          const term = terminal('Parser.kt · parseExpense(line, id, today)');
          const dia = diagram(2);
          const input = h('input', { id: 'ck-parse-in', value: '12.50 food lunch', spellcheck: 'false', autocomplete: 'off', maxlength: '40' });
          const st = ['split(Regex("\\\\s+"), limit = 3)', 'parseMoney(parts[0])', 'Category.from(parts[1])', 'Expense(...)'].map(name => {
            const val = h('span', { class: 'ck-st-val' }, ' ');
            const box = h('div', { class: 'ck-st' }, h('span', { class: 'ck-st-name' }, name), val);
            box.val = val;
            return box;
          });
          let busy = false, nextId = 1;
          async function run(line) {
            if (busy) return; busy = true;
            if (line != null) input.value = line;
            const text = input.value;
            st.forEach(s => { s.className = 'ck-st'; s.val.textContent = ' '; });
            term.in(`parseExpense("${text}")`);
            const r = parseExpense(text, nextId);
            const shown = [
              `[${r.parts.map(p => `"${p}"`).join(', ')}]`,
              r.stage === 1 ? 'null' : fmt(r.ok ? r.e.cents : r.cents),
              r.stage === 2 ? 'null' : r.ok ? 'Category.' + r.e.cat : '',
              r.ok ? `#${r.e.id}` : '',
            ];
            const stop = r.ok ? 4 : r.stage + 1;
            for (let i = 0; i < stop; i++) {
              st[i].classList.add('ck-on');
              dia.flash(['parse', 'money', 'category', 'expense'][i]);
              await sleep(380);
              if (!el.isConnected) return;
              st[i].val.textContent = shown[i];
              st[i].classList.remove('ck-on');
              const failed = !r.ok && i === r.stage;
              st[i].classList.add(failed ? 'ck-fail' : 'ck-pass');
              replay(st[i], failed ? 'shake' : 'pop-soft');
            }
            if (r.ok) { term.ok(resultStr(r)); nextId++; } else term.err(resultStr(r));
            busy = false;
          }
          input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
          const presets = ['12.50 food lunch', '8 travel', '4.999 fun', 'abc food', '20 pizza', '  42.5   FUN  movie night '];
          el.append(
            h('div', { class: 'ck-input' }, h('label', { for: 'ck-parse-in' }, 'line ='), input, h('button', { class: 'btn primary small', onclick: () => run() }, 'parseExpense')),
            h('div', { class: 'controls' }, presets.map(p => cmd(`"${p}"`, () => run(p)))),
            h('div', { class: 'ck-pipe' }, st),
            term.el, dia.el);
          term.dim('// Each check returns null on bad input; ?: turns that into a ParseException.');
          run();
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'reports',
        title: 'Reports with collections',
        tagline: 'filter, groupBy, sumOf and sort turn a list into totals.',
        level: 'beginner',
        refs: ['kotlin.collections', 'kotlin.lambdas', 'kotlin.extensions'],
        body: `
<p>A tracker is only useful if it answers questions. How much did I spend this month? On what? Which categories cost the most?</p>
<p>Each answer is a short chain of collection operations, written as extension functions on <code>List&lt;Expense&gt;</code>. <code>filter</code> keeps one month. <code>groupBy</code> builds a <code>Map&lt;Category, List&lt;Expense&gt;&gt;</code>. <code>mapValues</code> with <code>sumOf</code> turns each group into a total. <code>sortedByDescending</code> and <code>take</code> pick the top categories. None of them change the original list. Each returns a new collection.</p>
<p>Step through the chain in the demo. Each button runs the pipeline up to that line.</p>`,
        code: `// src/main/kotlin/tracker/Reports.kt
import java.time.YearMonth

fun List<Expense>.total(): Money = Money(sumOf { it.amount.cents })

fun List<Expense>.inMonth(month: YearMonth): List<Expense> =
    filter { YearMonth.from(it.date) == month }

fun List<Expense>.totalsByCategory(): Map<Category, Money> =
    groupBy { it.category }
        .mapValues { (_, items) -> items.total() }

fun List<Expense>.topCategories(n: Int = 3): List<Pair<Category, Money>> =
    totalsByCategory().toList()
        .sortedByDescending { (_, money) -> money.cents }
        .take(n)

// Calling it
val march = expenses.inMonth(YearMonth.of(2026, 3))
println(march.totalsByCategory())   // {FOOD=20.80, RENT=950.00, ...}
println(march.topCategories())      // [(RENT, 950.00), (FUN, 45.99), (TRAVEL, 24.00)]`,
        remember: 'filter to narrow, groupBy to bucket, sumOf to total, sortedByDescending + take for the top n.',
        terms: [
          { term: 'groupBy', def: 'Splits a collection into a map from each key, returned by the selector, to the list of elements with that key, keeping first-seen order.' },
          { term: 'sumOf', def: 'Adds up the value the selector returns for each element; the selector’s return type picks Int, Long, Double or BigDecimal.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Total the expenses per category.', code: 'fun List<Expense>.totalsByCategory(): Map<Category, Money> =\n    [[groupBy]] { it.category }\n        .[[mapValues]] { (_, items) -> Money(items.[[sumOf]] { it.amount.cents }) }', why: '<code>groupBy</code> makes the buckets, <code>mapValues</code> keeps the keys and replaces each list, and <code>sumOf</code> adds the cents.' },
          { type: 'bug', prompt: 'The “top categories” report shows the cheapest ones. Tap the line.', code: 'fun List<Expense>.topCategories(n: Int = 3): List<Pair<Category, Money>> =\n    totalsByCategory().toList()\n        .sortedBy { (_, money) -> money.cents }\n        .take(n)', bug: 2, fix: '        .sortedByDescending { (_, money) -> money.cents }', why: '<code>sortedBy</code> sorts ascending, so <code>take(n)</code> keeps the smallest totals.' },
        ],
        quiz: [
          { q: 'What type does <code>expenses.groupBy { it.category }</code> return?', options: ['<code>Map&lt;Category, List&lt;Expense&gt;&gt;</code>', '<code>Map&lt;Category, Money&gt;</code>', '<code>List&lt;List&lt;Expense&gt;&gt;</code>'], a: 0, why: 'Each key maps to the list of elements that produced it. Totals come after, with <code>mapValues</code>.' },
          { q: 'What does <code>take(3)</code> do when there are only 2 categories?', options: ['Returns both', 'Throws IndexOutOfBoundsException', 'Pads the list with null'], a: 0, why: '<code>take(n)</code> returns at most n elements and never throws for a short list.' },
          { q: 'Why write <code>totalsByCategory</code> as an extension on <code>List&lt;Expense&gt;</code>?', options: ['It reads like a built-in call and needs no wrapper class', 'It can read private fields of the list', 'It runs faster than a regular function'], a: 0, why: 'An extension is a static function with a nicer call site. It sees only public members, the same as any other caller.' },
        ],
        visual(el) {
          const term = terminal('Reports.kt · march report');
          const dia = diagram(3);
          const DATA = [
            { id: 1, cents: 1250, cat: 'FOOD', date: '03-02' }, { id: 2, cents: 95000, cat: 'RENT', date: '03-01' },
            { id: 3, cents: 2400, cat: 'TRAVEL', date: '03-05' }, { id: 4, cents: 4599, cat: 'FUN', date: '03-07' },
            { id: 5, cents: 830, cat: 'FOOD', date: '03-09' }, { id: 6, cents: 3100, cat: 'FOOD', date: '02-27' },
            { id: 7, cents: 1500, cat: 'FUN', date: '02-21' },
          ];
          const march = DATA.filter(d => d.date.startsWith('03'));
          const LINES = ['expenses', '    .inMonth(YearMonth.of(2026, 3))', '    .groupBy { it.category }', '    .mapValues { (_, items) -> items.total() }', '    .toList().sortedByDescending { it.second.cents }.take(3)'];
          const code = h('div', { class: 'ck-code', 'aria-label': 'Report pipeline' }, LINES.map(l => h('div', { class: 'ck-line', html: hl(l) })));
          const view = h('div', { class: 'stage ck-flow' });
          const chip = (d, out) => h('span', { class: 'ck-exp drop-in' + (out ? ' ck-out' : '') }, `${d.cat} ${fmt(d.cents)}`, h('small', {}, `#${d.id} · ${d.date}`));
          const groups = () => { const m = new Map(); march.forEach(d => { if (!m.has(d.cat)) m.set(d.cat, []); m.get(d.cat).push(d); }); return m; };
          let stage = 0, busy = false;
          const btns = [];
          function paint(s) {
            stage = s;
            press(btns, btns[s]);
            [...code.children].forEach((ln, i) => { ln.classList.toggle('ck-cur', i === s); ln.classList.toggle('ck-off', i > s); });
            view.replaceChildren();
            if (s <= 1) { view.append(...DATA.map(d => chip(d, s === 1 && !d.date.startsWith('03')))); term.in(s ? 'expenses.inMonth(march).size' : 'expenses.size'); term.ok(s ? '5  // February is filtered out' : '7'); dia.flash(s ? 'reports' : 'expense'); return; }
            const g = groups();
            if (s === 2 || s === 3) {
              view.append(...[...g].map(([k, items], i) => h('div', { class: 'ck-bucket drop-in', style: `animation-delay:${i * 90}ms` },
                h('span', { class: 'ck-bucket-key' }, k),
                s === 2 ? items.map(d => chip(d)) : h('span', { class: 'chip total pop', style: 'height:40px;min-width:0;font-size:0.95rem' }, fmt(items.reduce((a, d) => a + d.cents, 0))))));
              term.in(s === 2 ? 'groupBy { it.category }' : 'totalsByCategory()');
              term.ok(s === 2 ? `{${[...g].map(([k, items]) => `${k}=[${items.map(d => '#' + d.id).join(', ')}]`).join(', ')}}` : mapStr(totals(march)));
              dia.flash('reports', 'expense');
              return;
            }
            const sorted = [...totals(march)].sort((a, b) => b[1] - a[1]);
            const max = sorted[0][1];
            const bars = sorted.map(([k, v], i) => {
              const fill = h('span', { class: 'ck-bar-fill' });
              const row = h('div', { class: 'ck-bar drop-in' + (i >= 3 ? ' ck-dropped' : ''), style: `animation-delay:${i * 90}ms` },
                h('span', {}, k), h('span', { class: 'ck-bar-track' }, fill), h('span', {}, fmt(v) + (i >= 3 ? '  dropped by take(3)' : '')));
              setTimeout(() => { fill.style.width = `${Math.max(2, (v / max) * 100)}%`; }, 60 + i * 90);
              return row;
            });
            view.append(h('div', { class: 'ck-bars' }, bars));
            term.in('topCategories(3)');
            term.ok(`[${sorted.slice(0, 3).map(([k, v]) => `(${k}, ${fmt(v)})`).join(', ')}]`);
            dia.flash('reports');
          }
          LINES.forEach((l, i) => btns.push(cmd(['expenses', '.inMonth(march)', '.groupBy { }', '.mapValues { total() }', '.topCategories(3)'][i], () => { if (!busy) paint(i); })));
          async function all() {
            if (busy) return; busy = true;
            for (let i = 0; i < LINES.length; i++) { paint(i); await sleep(1100); if (!el.isConnected) return; }
            busy = false;
          }
          el.append(code, h('div', { class: 'controls' }, btns, h('button', { class: 'btn primary small', onclick: all }, 'Run the whole chain')), view, term.el, dia.el);
          paint(0);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'storage',
        title: 'A storage interface',
        tagline: 'ExpenseTracker depends on an interface, not on where data lives.',
        level: 'intermediate',
        refs: ['solid.dip', 'kotlin.inheritance', 'oop.encapsulation'],
        body: `
<p>Now the pieces need a home. <code>ExpenseTracker</code> is the class the app talks to: it parses a line, stores the expense and builds reports. Where should it store things? Today, in memory. Later, in a file or a database.</p>
<p>So the tracker depends on an <code>ExpenseRepository</code> interface and receives it through its constructor. This is dependency inversion from the OOP track: the high-level class owns the interface, and storage details plug into it. <code>InMemoryExpenseRepository</code> is the first implementation. It keeps its list private and hands out copies, so no caller can change it behind its back.</p>
<p>The date comes in as a function too. Tests will pass a fixed date, so their results never depend on the day they run. Swap the storage in the demo: the tracker code doesn’t change.</p>`,
        code: `// src/main/kotlin/tracker/Storage.kt
interface ExpenseRepository {
    fun add(expense: Expense)
    fun all(): List<Expense>
    fun nextId(): Long
}

class InMemoryExpenseRepository : ExpenseRepository {
    private val items = mutableListOf<Expense>()

    override fun add(expense: Expense) { items += expense }
    override fun all(): List<Expense> = items.toList()   // a copy, not the list itself
    override fun nextId(): Long = items.size + 1L
}

// src/main/kotlin/tracker/ExpenseTracker.kt
class ExpenseTracker(
    private val repo: ExpenseRepository,
    private val today: () -> LocalDate,
) {
    fun add(line: String): Result<Expense> =
        parseExpense(line, repo.nextId(), today())
            .onSuccess { repo.add(it) }

    fun report(month: YearMonth = YearMonth.from(today())): Map<Category, Money> =
        repo.all().inMonth(month).totalsByCategory()
}

// Wiring
val tracker = ExpenseTracker(InMemoryExpenseRepository()) { LocalDate.now() }`,
        remember: 'Depend on the interface, receive it in the constructor, and keep the concrete class choice at the edge.',
        challenges: [
          { type: 'blank', prompt: 'Make the in-memory store a real <code>ExpenseRepository</code> that hands out copies.', code: 'class InMemoryExpenseRepository : [[ExpenseRepository]] {\n    private val items = mutableListOf<Expense>()\n    [[override]] fun add(expense: Expense) { items += expense }\n    override fun all(): List<Expense> = items.[[toList]]()\n    override fun nextId(): Long = items.size + 1L\n}', why: 'The class implements the interface, every member it fulfils needs <code>override</code>, and <code>toList()</code> returns a snapshot instead of the mutable list.' },
          { type: 'bug', prompt: 'This compiles, but undoes the design of this step. Tap the line.', code: 'class ExpenseTracker(\n    private val repo: InMemoryExpenseRepository,\n    private val today: () -> LocalDate,\n) {\n    fun add(line: String): Result<Expense> =\n        parseExpense(line, repo.nextId(), today()).onSuccess { repo.add(it) }\n}', bug: 1, fix: '    private val repo: ExpenseRepository,', why: 'Typing the parameter as the concrete class ties the tracker to memory storage. A file-backed or fake repository can no longer be passed in.' },
        ],
        quiz: [
          { q: 'What does taking <code>ExpenseRepository</code> in the constructor make easy?', options: ['Passing a different storage, like an in-memory fake in tests', 'Making the tracker a singleton', 'Skipping the parser'], a: 0, why: 'The tracker works with anything that implements the interface, so callers decide which one.' },
          { q: 'Why does <code>all()</code> return <code>items.toList()</code>?', options: ['Callers get a snapshot and can’t change the stored list', 'toList() sorts the expenses', 'The interface requires a new list'], a: 0, why: 'Returning the <code>MutableList</code> itself would let a caller cast it and add or remove items without going through the repository.' },
          { q: 'Why is the date a <code>() -&gt; LocalDate</code> instead of a call to <code>LocalDate.now()</code> inside the tracker?', options: ['Tests can pass a fixed date and get the same result every day', 'LocalDate.now() is deprecated', 'Lambdas are faster than function calls'], a: 0, why: 'The current date is hidden input. Passing it in makes the class predictable and testable.' },
        ],
        visual(el) {
          const term = terminal('ExpenseTracker.kt · tracker.add(line)');
          const dia = diagram(4);
          let impl = 'mem', items = [];
          const trackerCard = h('div', { class: 'ck-card ck-on' }, h('span', { class: 'ck-card-title' }, 'ExpenseTracker'), kt('private val repo:\n    ExpenseRepository'), h('span', { class: 'ck-tag ck-good' }, 'code unchanged'));
          const socket = h('div', { class: 'ck-socket' }, h('span', { class: 'ck-tag' }, 'interface'), 'ExpenseRepository');
          const implTitle = h('span', { class: 'ck-card-title' });
          const implBody = h('div');
          const implCard = h('div', { class: 'ck-card' }, implTitle, implBody);
          function paintImpl() {
            implTitle.textContent = impl === 'mem' ? 'InMemoryExpenseRepository' : 'CsvExpenseRepository (sketch)';
            if (impl === 'mem') implBody.replaceChildren(h('div', { class: 'ck-items' }, items.length ? items.map(e => h('span', { class: 'ck-exp' }, `#${e.id} ${e.cat} ${fmt(e.cents)}`)) : h('small', { class: 'muted-text' }, 'items: []')));
            else implBody.replaceChildren(h('div', { class: 'ck-file' }, items.length ? items.map(e => `${e.id},${e.cents},${e.cat},${e.note},${e.date}`).join('\n') : '# expenses.csv is empty'));
          }
          const swapBtns = [];
          const choose = (which, b) => {
            impl = which; items = []; press(swapBtns, b);
            term.in(which === 'mem' ? 'ExpenseTracker(InMemoryExpenseRepository()) { today }' : 'ExpenseTracker(CsvExpenseRepository(file)) { today }');
            term.dim('// a new store starts empty; ExpenseTracker is the same class');
            paintImpl(); replay(implCard, 'pop-soft'); replay(trackerCard.lastChild, 'pop');
            dia.flash('repo', which === 'mem' ? 'mem' : 'repo');
          };
          swapBtns.push(cmd('InMemoryExpenseRepository()', function () { choose('mem', this); }), cmd('CsvExpenseRepository(file)', function () { choose('csv', this); }));
          press(swapBtns, swapBtns[0]);
          const add = line => cmd(`tracker.add("${line}")`, () => {
            const r = parseExpense(line, items.length + 1);
            term.in(`tracker.add("${line}")`);
            dia.flash('tracker', 'parse');
            if (r.ok) { items.push(r.e); term.ok(resultStr(r)); setTimeout(() => dia.flash(impl === 'mem' ? 'mem' : 'repo'), 250); paintImpl(); replay(implCard, 'pop-soft'); }
            else { term.err(resultStr(r)); term.dim('// onSuccess never ran, so nothing was stored'); replay(implCard, 'shake'); }
          });
          paintImpl();
          el.append(
            h('div', { class: 'ck-dip' }, trackerCard, h('span', { class: 'ck-link', 'aria-hidden': 'true' }, '→'), socket, h('span', { class: 'ck-link', 'aria-hidden': 'true' }, '←'), implCard),
            h('div', { class: 'controls' }, h('span', { class: 'tip' }, 'Plug in:'), swapBtns),
            h('div', { class: 'controls' },
              add('12.50 food lunch'), add('30 fun cinema'), add('lunch'),
              cmd('tracker.report()', () => {
                term.in('tracker.report()');
                term.ok(mapStr(totals(items)));
                dia.flash('tracker', 'repo', 'reports');
              })),
            term.el, dia.el);
          term.dim('// Add a few expenses, then swap the storage.');
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'budget',
        title: 'A budget DSL',
        tagline: 'budget { Category.FOOD limit 300.money } reads like a sentence.',
        level: 'intermediate',
        refs: ['kdeep.dsl', 'patterns.builder', 'kotlin.sealed', 'kotlin.scope'],
        body: `
<p>Users want limits: 300 a month for food, 80 for fun, and a warning before they hit them. We could pass a map to a constructor. A small DSL reads better and checks its input in one place.</p>
<p><code>budget { }</code> takes a lambda with receiver of type <code>BudgetBuilder</code>, so inside the braces you call the builder’s members directly. <code>infix fun Category.limit(amount: Money)</code> lets you write <code>Category.FOOD limit 300.money</code>. <code>build()</code> validates and returns an immutable <code>Budget</code>. <code>@DslMarker</code> stops nested blocks from reaching outer builders by accident.</p>
<p><code>Budget.check</code> compares totals with limits and returns a list of <code>BudgetAlert</code>s. The alert is a sealed interface with two cases, so a <code>when</code> over it is exhaustive. Toggle limits and add spending in the demo.</p>`,
        code: `// src/main/kotlin/tracker/Budget.kt
val Int.money: Money get() = Money(this * 100L)

sealed interface BudgetAlert {
    val category: Category
    data class Near(override val category: Category, val spent: Money, val limit: Money) : BudgetAlert
    data class Over(override val category: Category, val spent: Money, val limit: Money) : BudgetAlert
}

data class Budget(val limits: Map<Category, Money>, val warnAt: Double) {
    fun check(totals: Map<Category, Money>): List<BudgetAlert> =
        limits.mapNotNull { (category, limit) ->
            val spent = totals[category] ?: Money.ZERO
            when {
                spent.cents > limit.cents -> BudgetAlert.Over(category, spent, limit)
                spent.cents >= limit.cents * warnAt -> BudgetAlert.Near(category, spent, limit)
                else -> null
            }
        }
}

@DslMarker
annotation class BudgetDsl

@BudgetDsl
class BudgetBuilder {
    private val limits = mutableMapOf<Category, Money>()
    var warnAt = 0.8

    infix fun Category.limit(amount: Money) {
        limits[this] = amount
    }

    fun build(): Budget {
        require(warnAt in 0.0..1.0) { "warnAt must be between 0 and 1" }
        return Budget(limits.toMap(), warnAt)
    }
}

fun budget(block: BudgetBuilder.() -> Unit): Budget =
    BudgetBuilder().apply(block).build()

// Using it
val monthly = budget {
    Category.FOOD limit 300.money
    Category.FUN limit 80.money
}
monthly.check(tracker.report())   // [Near(category=FUN, spent=64.00, limit=80.00)]`,
        remember: 'A DSL is a builder plus a lambda with receiver: budget { } runs your block on a BudgetBuilder, then build() checks and freezes it.',
        challenges: [
          { type: 'blank', prompt: 'Wire up the builder function and the infix limit.', code: 'fun budget(block: [[BudgetBuilder]].() -> Unit): Budget =\n    BudgetBuilder().[[apply]](block).build()\n\nclass BudgetBuilder {\n    private val limits = mutableMapOf<Category, Money>()\n    [[infix]] fun Category.limit(amount: Money) { limits[this] = amount }\n    fun build() = Budget(limits.toMap(), warnAt = 0.8)\n}', why: 'The block’s receiver is <code>BudgetBuilder</code>, <code>apply</code> runs it on a fresh builder and returns the builder, and <code>infix</code> allows <code>FOOD limit 300.money</code> without dots or parentheses.' },
          { type: 'bug', prompt: 'Overspending is reported as “near the limit”, never “over”. Tap the line.', code: 'fun check(totals: Map<Category, Money>): List<BudgetAlert> =\n    limits.mapNotNull { (category, limit) ->\n        val spent = totals[category] ?: Money.ZERO\n        when {\n            spent.cents >= limit.cents * warnAt -> BudgetAlert.Near(category, spent, limit)\n            spent.cents > limit.cents -> BudgetAlert.Over(category, spent, limit)\n            else -> null\n        }\n    }', bug: 4, fix: '            spent.cents > limit.cents -> BudgetAlert.Over(category, spent, limit)   // Over first, then Near', why: '<code>when</code> takes the first branch that matches. Anything over the limit is also above the warning line, so the Near branch must come second.' },
        ],
        quiz: [
          { q: 'Inside <code>budget { ... }</code>, what is <code>this</code>?', options: ['A BudgetBuilder', 'The Budget being returned', 'Category.FOOD'], a: 0, why: 'The parameter type <code>BudgetBuilder.() -&gt; Unit</code> makes the builder the receiver of the block.' },
          { q: 'Food has spent 240.00 of a 300.00 limit with <code>warnAt = 0.75</code>. What does <code>check</code> return for food?', options: ['<code>Near</code>, because 240 ≥ 225', '<code>Over</code>', 'Nothing'], a: 0, why: 'The warning line is 300 × 0.75 = 225. 240 is past it but not over 300.' },
          { q: 'What does <code>@DslMarker</code> prevent?', options: ['Calling an outer builder’s members implicitly from inside a nested block', 'Calling budget twice', 'Using infix functions'], a: 0, why: 'With the marker, implicit receivers from outer DSL blocks are hidden in inner ones, so you can’t call the wrong builder by accident.' },
        ],
        visual(el) {
          const term = terminal('Budget.kt · monthly.check(tracker.report())');
          const dia = diagram(5);
          const spent = { FOOD: 20500, FUN: 4599, TRAVEL: 2400 };
          const LIM = { FOOD: 300, FUN: 80, TRAVEL: 50 };
          const on = { FOOD: true, FUN: true, TRAVEL: false };
          let warnAt = 0.8;
          const src = h('div', { class: 'kt' });
          const meters = {};
          const box = h('div', { class: 'ck-meters' }, Object.keys(LIM).map(c => {
            const fill = h('span', { class: 'ck-meter-fill' }), line = h('span', { class: 'ck-warnline', title: 'warnAt' });
            const status = h('span', { class: 'ck-tag' }), nums = h('span');
            const m = h('div', { class: 'ck-meter' }, h('div', { class: 'ck-meter-head' }, h('span', {}, c), nums, status), h('div', { class: 'ck-meter-track' }, fill, line));
            meters[c] = { m, fill, line, status, nums };
            return m;
          }));
          const check = () => Object.keys(LIM).filter(c => on[c]).flatMap(c => {
            const lim = LIM[c] * 100, s = spent[c];
            return s > lim ? [{ k: 'Over', c, s, lim }] : s >= lim * warnAt ? [{ k: 'Near', c, s, lim }] : [];
          });
          function paint() {
            const lines = ['val monthly = budget {', ...(warnAt !== 0.8 ? [`    warnAt = ${warnAt}`] : []), ...Object.keys(LIM).filter(c => on[c]).map(c => `    Category.${c} limit ${LIM[c]}.money`), '}'];
            src.innerHTML = hl(lines.join('\n'));
            const alerts = check();
            for (const c of Object.keys(LIM)) {
              const x = meters[c], lim = LIM[c] * 100, s = spent[c], a = alerts.find(y => y.c === c);
              x.m.classList.toggle('ck-unset', !on[c]);
              x.nums.textContent = on[c] ? `${fmt(s)} / ${fmt(lim)}` : `${fmt(s)} · no limit`;
              x.fill.style.width = `${Math.min(100, (s / lim) * 100)}%`;
              x.fill.className = 'ck-meter-fill' + (a ? (a.k === 'Over' ? ' ck-over' : ' ck-near') : '');
              x.line.style.left = `${warnAt * 100}%`;
              x.line.hidden = !on[c];
              x.status.className = 'ck-tag ' + (!on[c] ? '' : a ? (a.k === 'Over' ? 'ck-badt' : 'ck-warnt') : 'ck-good');
              x.status.textContent = !on[c] ? 'off' : a ? a.k : 'ok';
            }
            return alerts;
          }
          function report(what) {
            if (what) term.in(what);
            const alerts = paint();
            term.in('monthly.check(tracker.report())');
            if (!alerts.length) term.ok('[]');
            else term.warn(`[${alerts.map(a => `${a.k}(category=${a.c}, spent=${fmt(a.s)}, limit=${fmt(a.lim)})`).join(', ')}]`);
            dia.flash('budget', 'alert');
          }
          const toggles = Object.keys(LIM).map(c => cmd(`Category.${c} limit ${LIM[c]}.money`, function () {
            on[c] = !on[c]; this.setAttribute('aria-pressed', String(on[c]));
            report(`// ${on[c] ? 'added' : 'removed'} ${c} limit`);
          }, { 'aria-pressed': String(on[c]) }));
          const warnBtn = cmd('warnAt = 0.5', function () {
            warnAt = warnAt === 0.8 ? 0.5 : 0.8; this.setAttribute('aria-pressed', String(warnAt === 0.5));
            report(`// warnAt is now ${warnAt}`);
          }, { 'aria-pressed': 'false' });
          const spend = (c, amt, note) => cmd(`tracker.add("${amt} ${c.toLowerCase()} ${note}")`, () => {
            spent[c] += amt * 100;
            term.in(`tracker.add("${amt} ${c.toLowerCase()} ${note}")`);
            dia.flash('tracker');
            report();
            replay(meters[c].m, 'pop-soft');
          });
          el.append(
            src,
            h('div', { class: 'controls' }, h('span', { class: 'tip' }, 'Limits:'), toggles, warnBtn),
            h('div', { class: 'stage' }, box),
            h('div', { class: 'controls' }, h('span', { class: 'tip' }, 'Spend:'), spend('FOOD', 40, 'groceries'), spend('FUN', 20, 'games'), spend('TRAVEL', 15, 'bus')),
            term.el, dia.el);
          report();
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'sync',
        title: 'Sync with coroutines',
        tagline: 'Upload in parallel batches, retry with backoff, cancel cleanly.',
        level: 'intermediate',
        refs: ['coroutines.basics', 'coroutines.structured', 'kotlin.exceptions', 'kotlin.inheritance'],
        body: `
<p>The tracker should back up new expenses to a server. There is no server yet, so we hide it behind a <code>SyncApi</code> interface and write a <code>FakeSyncApi</code> that waits a little and can fail on purpose. Same idea as the repository: the service depends on an interface.</p>
<p><code>SyncService.syncPending()</code> is a <code>suspend</code> function. It splits pending expenses into batches with <code>chunked</code>, starts one <code>async</code> per batch inside <code>coroutineScope</code>, and waits with <code>awaitAll</code>. That is structured concurrency: the function returns only when every batch is done. If one batch fails for good, the scope cancels the others and the error reaches the caller.</p>
<p>Each batch retries network errors with a growing <code>delay</code>. It catches only <code>IOException</code>, so cancellation still works. Try the three network modes in the demo.</p>`,
        code: `// src/main/kotlin/tracker/Sync.kt
import kotlinx.coroutines.*
import java.io.IOException
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds

interface SyncApi {
    suspend fun upload(batch: List<Expense>)
}

class FakeSyncApi(
    private val latency: Duration = 300.milliseconds,
    var failuresLeft: Int = 0,
) : SyncApi {
    val received = mutableListOf<Expense>()   // fine for single-threaded tests and runBlocking

    override suspend fun upload(batch: List<Expense>) {
        delay(latency)
        if (failuresLeft > 0) { failuresLeft--; throw IOException("network down") }
        received += batch
    }
}

class SyncService(
    private val repo: ExpenseRepository,
    private val api: SyncApi,
    private val batchSize: Int = 2,
    private val maxAttempts: Int = 3,
) {
    private val syncedIds = mutableSetOf<Long>()

    suspend fun syncPending(): Int = coroutineScope {
        val pending = repo.all().filter { it.id !in syncedIds }
        val done = pending.chunked(batchSize)
            .map { batch -> async { uploadWithRetry(batch) } }
            .awaitAll()
            .flatten()
        syncedIds += done.map { it.id }
        done.size
    }

    private suspend fun uploadWithRetry(batch: List<Expense>): List<Expense> {
        repeat(maxAttempts - 1) { attempt ->
            try {
                api.upload(batch)
                return batch
            } catch (e: IOException) {
                println("retry \${attempt + 1}: \${e.message}")
                delay(200L * (attempt + 1))   // back off, then try again
            }
        }
        api.upload(batch)   // last attempt: let the error escape
        return batch
    }
}

fun main() = runBlocking {
    val repo = InMemoryExpenseRepository()
    val tracker = ExpenseTracker(repo) { LocalDate.now() }
    listOf("12.50 food", "30 fun", "8 travel", "950 rent", "4.20 food").forEach { tracker.add(it) }
    val sync = SyncService(repo, FakeSyncApi(failuresLeft = 2))
    println("Synced \${sync.syncPending()} expenses")   // Synced 5 expenses
}`,
        remember: 'coroutineScope + async per batch + awaitAll: parallel work that finishes together or fails together. Retry only the errors you expect.',
        terms: [
          { term: 'chunked', def: 'Splits a collection into lists of at most the given size; the last list may be shorter.' },
          { term: 'awaitAll', def: 'Waits for a list of Deferred values and returns their results in order, failing as soon as any of them fails.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Upload the batches in parallel and wait for all of them.', code: 'suspend fun syncPending(): Int = [[coroutineScope]] {\n    val pending = repo.all().filter { it.id !in syncedIds }\n    val done = pending.[[chunked]](batchSize)\n        .map { batch -> [[async]] { uploadWithRetry(batch) } }\n        .awaitAll()\n        .flatten()\n    syncedIds += done.map { it.id }\n    done.size\n}', why: '<code>coroutineScope</code> gives a scope that waits for its children, <code>chunked</code> makes the batches, and <code>async</code> starts each upload so <code>awaitAll</code> can collect them.' },
          { type: 'bug', prompt: 'Cancelling the sync doesn’t stop it: it keeps retrying. Tap the line.', code: 'private suspend fun uploadWithRetry(batch: List<Expense>): List<Expense> {\n    repeat(maxAttempts - 1) { attempt ->\n        try {\n            api.upload(batch)\n            return batch\n        } catch (e: Exception) {\n            delay(200L * (attempt + 1))\n        }\n    }\n    api.upload(batch)\n    return batch\n}', bug: 5, fix: '        } catch (e: IOException) {', why: 'Cancellation is delivered as a <code>CancellationException</code>. Catching every <code>Exception</code> swallows it, so the loop retries a job that should have stopped.' },
        ],
        quiz: [
          { q: 'What does wrapping the batches in <code>coroutineScope { }</code> guarantee?', options: ['syncPending returns only after every batch is done, and one failure cancels the rest', 'Each batch runs on its own thread', 'Errors in a batch are ignored'], a: 0, why: '<code>coroutineScope</code> waits for all its children. When a child fails, it cancels the siblings and rethrows the error.' },
          { q: 'With 5 pending expenses and <code>batchSize = 2</code> on a healthy network, how many upload calls happen?', options: ['3', '5', '2'], a: 0, why: '<code>chunked(2)</code> gives batches of 2, 2 and 1.' },
          { q: 'Why does <code>uploadWithRetry</code> catch only <code>IOException</code>?', options: ['Catching every Exception would also catch CancellationException and keep retrying after a cancel', 'IOException is the only exception upload can throw', 'Kotlin can’t catch Exception in suspend functions'], a: 0, why: 'Retry the failures you expect. Let everything else, cancellation included, pass through.' },
        ],
        mistakes: [
          { title: 'Fire and forget in GlobalScope', bad: 'fun syncLater() {\n    GlobalScope.launch { sync.syncPending() }\n}', good: '// Let the caller pick the scope\nsuspend fun syncNow(): Int = sync.syncPending()\n\n// or take one in: class Syncer(private val scope: CoroutineScope)', why: 'A <code>GlobalScope</code> job has no owner. Nobody can cancel it, its errors go to the default handler, and tests can’t wait for it.' },
          { title: 'Marking work done before it finishes', bad: 'pending.chunked(2).forEach { batch ->\n    launch { api.upload(batch) }\n}\nsyncedIds += pending.map { it.id }   // runs right away', good: 'val done = pending.chunked(2)\n    .map { batch -> async { uploadWithRetry(batch) } }\n    .awaitAll()\n    .flatten()\nsyncedIds += done.map { it.id }', why: '<code>launch</code> returns immediately, so the IDs are marked as synced before any upload has run. Await the results first.' },
          { title: 'Thread.sleep for backoff', bad: 'catch (e: IOException) {\n    Thread.sleep(200)\n}', good: 'catch (e: IOException) {\n    delay(200)\n}', why: '<code>Thread.sleep</code> blocks the thread, ignores cancellation and makes <code>runTest</code> wait in real time. <code>delay</code> suspends, can be cancelled and is skipped by the test clock.' },
        ],
        visual(el) {
          const term = terminal('Sync.kt · sync.syncPending()');
          const dia = diagram(6);
          let items = [
            { id: 1, cents: 1250, cat: 'FOOD' }, { id: 2, cents: 3000, cat: 'FUN' }, { id: 3, cents: 800, cat: 'TRAVEL' },
            { id: 4, cents: 95000, cat: 'RENT' }, { id: 5, cents: 420, cat: 'FOOD' },
          ];
          const synced = new Set();
          let mode = 'flaky', busy = false;
          const chips = h('div', { class: 'ck-flow' });
          const stats = h('div', { class: 'ck-stats' });
          const tl = h('div', { class: 'timeline ck-sync' });
          const clock = h('span', { class: 'clock' }, 't = 0 ms');
          function paintChips() {
            chips.replaceChildren(...items.map(e => h('span', { class: 'ck-exp' + (synced.has(e.id) ? ' ck-synced' : '') }, `#${e.id} ${e.cat}`, h('small', {}, synced.has(e.id) ? 'synced' : 'pending'))));
            stats.innerHTML = `<span>repo: <b>${items.length}</b></span><span>pending: <b>${items.filter(e => !synced.has(e.id)).length}</b></span><span>network: <b>${mode === 'ok' ? 'healthy' : mode === 'flaky' ? 'first 2 calls fail' : 'down'}</b></span>`;
          }
          // Simulate the Kotlin code: 300 ms per call, backoff 200 * attempt, 3 attempts, first permanent failure cancels the rest.
          function plan(batches) {
            let failures = mode === 'flaky' ? 2 : 0;
            const st = batches.map((b, i) => ({ i, b, t: 0, attempt: 0, segs: [], done: false }));
            const log = [];
            let error = null;
            for (;;) {
              const live = st.filter(s => !s.done);
              if (!live.length) break;
              const s = live.reduce((a, x) => (x.t < a.t ? x : a));
              const end = s.t + 300;
              const fail = mode === 'down' || (mode === 'flaky' && failures-- > 0);
              if (!fail) { s.segs.push({ c: 'run', a: s.t, b: end }); s.done = true; log.push({ at: end, cls: 'dim', text: `// batch ${s.i + 1} uploaded [${s.b.map(e => '#' + e.id).join(', ')}]` }); continue; }
              s.segs.push({ c: 'block', a: s.t, b: end });
              s.attempt++;
              if (s.attempt >= 3) {
                s.done = true; error = end;
                for (const o of st.filter(x => !x.done)) {
                  if (o.t < end) o.segs.push({ c: 'queued', a: o.t, b: end });
                  else { const w = o.segs[o.segs.length - 1]; if (w) w.b = end; }
                  o.done = true;
                }
                log.push({ at: end, cls: 'err', text: `batch ${s.i + 1} failed 3 times; coroutineScope cancels the other batches` });
                break;
              }
              log.push({ at: end, cls: 'warn', text: `retry ${s.attempt}: network down` });
              const wait = 200 * s.attempt;
              s.segs.push({ c: 'wait', a: end, b: end + wait });
              s.t = end + wait;
            }
            return { st, log, error, end: Math.max(...st.flatMap(s => s.segs.map(g => g.b))) };
          }
          async function sync() {
            if (busy) return; busy = true;
            const pending = items.filter(e => !synced.has(e.id));
            term.in('sync.syncPending()');
            dia.flash('sync', 'repo');
            const batches = [];
            for (let i = 0; i < pending.length; i += 2) batches.push(pending.slice(i, i + 2));
            tl.replaceChildren();
            if (!batches.length) { term.ok('Synced 0 expenses  // nothing pending'); busy = false; return; }
            term.dim(`// ${pending.length} pending -> chunked(2) -> ${batches.length} batches, one async each`);
            const p = plan(batches);
            const span = Math.max(p.end, 1500);
            const bars = [];
            p.st.forEach(s => {
              const track = h('div', { class: 'lane-track' });
              s.segs.forEach(g => { const bar = h('span', { class: `bar ${g.c}`, style: `left:${(g.a / span) * 100}%;width:0` }); bar.g = g; track.append(bar); bars.push(bar); });
              tl.append(h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, `batch ${s.i + 1}`), track));
            });
            const cursor = h('span', { class: 'cursor', style: 'left:0' });
            tl.firstChild.lastChild.append(cursor);
            let li = 0;
            for (let t = 0; t <= p.end; t += 25) {
              await sleep(22);
              if (!el.isConnected) return;
              clock.textContent = `t = ${t} ms`;
              cursor.style.left = `${(t / span) * 100}%`;
              bars.forEach(b => { if (t > b.g.a) b.style.width = `${((Math.min(t, b.g.b) - b.g.a) / span) * 100}%`; });
              while (li < p.log.length && p.log[li].at <= t) {
                const x = p.log[li++];
                term[x.cls](x.text);
                dia.flash(x.cls === 'dim' ? 'fakeapi' : 'api');
              }
            }
            while (li < p.log.length) { const x = p.log[li++]; term[x.cls](x.text); }
            if (p.error != null) { term.err('Exception in thread "main" java.io.IOException: network down'); replay(tl, 'shake'); }
            else { pending.forEach(e => synced.add(e.id)); term.ok(`Synced ${pending.length} expenses`); }
            paintChips();
            busy = false;
          }
          const modeBtns = [];
          const setMode = (m, b) => { if (busy) return; mode = m; press(modeBtns, b); paintChips(); };
          modeBtns.push(
            cmd('FakeSyncApi()', function () { setMode('ok', this); }),
            cmd('FakeSyncApi(failuresLeft = 2)', function () { setMode('flaky', this); }),
            cmd('FakeSyncApi(failuresLeft = 99)', function () { setMode('down', this); }));
          press(modeBtns, modeBtns[1]);
          let n = 6;
          paintChips();
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'tip' }, 'Network:'), modeBtns),
            h('div', { class: 'stage' }, chips),
            stats,
            h('div', { class: 'controls' },
              h('button', { class: 'btn primary small', onclick: sync }, 'sync.syncPending()'),
              cmd('tracker.add("9.99 food")', () => { if (busy) return; items.push({ id: n++, cents: 999, cat: 'FOOD' }); term.in('tracker.add("9.99 food")'); dia.flash('tracker', 'repo'); paintChips(); }),
              clock),
            tl,
            h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'bar run' }), 'upload ok'), h('span', {}, h('i', { class: 'bar block' }), 'IOException'), h('span', {}, h('i', { class: 'bar wait' }), 'delay (backoff)'), h('span', {}, h('i', { class: 'bar queued' }), 'cancelled')),
            term.el, dia.el);
          term.dim('// Pick a network, then sync. Sync twice to see that synced items are skipped.');
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'tests',
        title: 'Unit tests with kotlin.test',
        tagline: 'Fakes, a fixed clock and runTest make every part checkable.',
        level: 'intermediate',
        refs: ['testing.fakes', 'testing.coroutines', 'testing.pyramid'],
        body: `
<p>Every earlier step made one choice that pays off now. The tracker takes its storage and its clock as parameters. Sync talks to an interface. So a test can build the whole core in memory, with a fixed date and a fake network, and run in milliseconds.</p>
<p><code>kotlin.test</code> gives the annotations and assertions: <code>@Test</code>, <code>assertEquals</code>, <code>assertTrue</code> and <code>assertIs</code>, which also smart-casts. On the JVM it runs on JUnit 5. For the suspend code, <code>runTest</code> from kotlinx-coroutines-test runs the body on a virtual clock, so the 300 ms delays and the backoff take no real time.</p>
<p>JUnit creates a new test class instance for every test, so each test gets a fresh repository. In the demo, run the suite, then break one piece of the code and watch the right test catch it.</p>`,
        code: `// build.gradle.kts
// dependencies {
//     testImplementation(kotlin("test"))
//     testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")
// }
// tasks.test { useJUnitPlatform() }

// src/test/kotlin/tracker/ExpenseTrackerTest.kt
import kotlinx.coroutines.test.runTest
import java.time.LocalDate
import kotlin.test.*

class ExpenseTrackerTest {
    private val repo = InMemoryExpenseRepository()
    private val tracker = ExpenseTracker(repo) { LocalDate.of(2026, 3, 14) }

    @Test
    fun parsesAValidLine() {
        val expense = tracker.add("12.50 food lunch").getOrThrow()
        assertEquals(Money(1250), expense.amount)
        assertEquals(Category.FOOD, expense.category)
    }

    @Test
    fun rejectsABadAmount() {
        val result = tracker.add("12.505 food")
        assertIs<ParseException>(result.exceptionOrNull())
        assertTrue(repo.all().isEmpty())
    }

    @Test
    fun totalsGroupByCategory() {
        listOf("10 food", "5.50 food", "20 fun").forEach { tracker.add(it) }
        assertEquals(mapOf(Category.FOOD to Money(1550), Category.FUN to Money(2000)), tracker.report())
    }

    @Test
    fun budgetWarnsBeforeTheLimit() {
        val budget = budget { warnAt = 0.5; Category.FOOD limit 10.money }
        val alerts = budget.check(mapOf(Category.FOOD to Money(600)))
        assertIs<BudgetAlert.Near>(alerts.single())
    }

    @Test
    fun syncRetriesAndUploadsOnce() = runTest {
        listOf("10 food", "20 fun", "3 travel").forEach { tracker.add(it) }
        val api = FakeSyncApi(failuresLeft = 1)
        val sync = SyncService(repo, api)
        assertEquals(3, sync.syncPending())
        assertEquals(0, sync.syncPending())   // nothing uploaded twice
        assertEquals(3, api.received.size)
    }
}`,
        remember: 'Inject what varies (storage, clock, network), then tests are plain function calls on fakes. runTest skips the delays.',
        terms: [
          { term: 'kotlin.test', def: 'Kotlin’s multiplatform test library with @Test and assertions like assertEquals and assertIs, running on JUnit on the JVM.' },
          { term: 'assertIs', def: 'A kotlin.test assertion that fails unless a value has the given type, and returns the value smart-cast to that type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the sync test so it runs on virtual time.', code: '@[[Test]]\nfun syncUploadsOne() = [[runTest]] {\n    tracker.add("10 food")\n    val sync = SyncService(repo, FakeSyncApi(failuresLeft = 1))\n    [[assertEquals]](1, sync.syncPending())\n}', why: '<code>@Test</code> marks the function, <code>runTest</code> lets it call suspend code and skips <code>delay</code>, and <code>assertEquals</code> takes the expected value first.' },
          { type: 'bug', prompt: 'This test passes in March and fails in April. Tap the line.', code: 'class ExpenseTrackerTest {\n    private val repo = InMemoryExpenseRepository()\n    private val tracker = ExpenseTracker(repo) { LocalDate.now() }\n\n    @Test\n    fun totalsGroupByCategory() {\n        tracker.add("10 food")\n        assertEquals(mapOf(Category.FOOD to Money(1000)), tracker.report(YearMonth.of(2026, 3)))\n    }\n}', bug: 2, fix: '    private val tracker = ExpenseTracker(repo) { LocalDate.of(2026, 3, 14) }', why: 'The expense gets today’s date, but the report asks for March 2026. Pass a fixed clock so the test means the same thing on every day.' },
        ],
        quiz: [
          { q: 'Why does the sync test finish at once even though each upload calls <code>delay(300.milliseconds)</code>?', options: ['runTest uses a virtual clock that skips delays', 'FakeSyncApi skips delay in tests', 'JUnit runs the delays in parallel'], a: 0, why: '<code>runTest</code> runs coroutines on a test scheduler. When everything is waiting, it jumps the clock forward.' },
          { q: 'Why does each test start with an empty repository?', options: ['JUnit creates a new test class instance for every test method', 'kotlin.test clears all fields', 'InMemoryExpenseRepository resets itself'], a: 0, why: 'Fields are initialized again for each test, so tests can’t leak state into each other.' },
          { q: '<code>assertIs&lt;ParseException&gt;(result.exceptionOrNull())</code> passes when', options: ['The Result is a failure holding a ParseException', 'The Result is any failure', 'The Result is a success'], a: 0, why: 'A success gives null, which is not a ParseException, and other exception types fail the type check too.' },
        ],
        visual(el) {
          const term = terminal('./gradlew test');
          const dia = diagram(7);
          const TESTS = [
            { name: 'parsesAValidLine()', ms: 4, nodes: ['tracker', 'parse', 'mem'] },
            { name: 'rejectsABadAmount()', ms: 2, nodes: ['tracker', 'parse'], bug: 'scale', msg: 'AssertionFailedError: Expected value to be of type <tracker.ParseException>, actual <null>.' },
            { name: 'totalsGroupByCategory()', ms: 3, nodes: ['tracker', 'reports', 'mem'] },
            { name: 'budgetWarnsBeforeTheLimit()', ms: 2, nodes: ['budget'], bug: 'warn', msg: 'NoSuchElementException: List is empty.' },
            { name: 'syncRetriesAndUploadsOnce()', ms: 11, nodes: ['sync', 'fakeapi', 'mem'], bug: 'mark', msg: 'AssertionFailedError: expected: <0> but was: <3>' },
          ];
          const BUGS = [
            { id: 'scale', src: '?.takeIf { it.scale() <= 3 }', where: 'parseMoney' },
            { id: 'warn', src: 'spent.cents >= limit.cents -> Near', where: 'Budget.check' },
            { id: 'mark', src: '// syncedIds += done.map { it.id }', where: 'SyncService' },
          ];
          const broken = new Set();
          const rows = TESTS.map(t => {
            const why = h('span', { class: 'ck-why', hidden: true });
            const time = h('small', {}, '');
            const row = h('div', { class: 'ck-test' }, h('span', { class: 'ck-dot', 'aria-hidden': 'true' }), h('b', {}, t.name), time, why);
            Object.assign(row, { why, time });
            return row;
          });
          let busy = false;
          async function run() {
            if (busy) return; busy = true;
            rows.forEach(r => { r.className = 'ck-test'; r.why.hidden = true; r.time.textContent = ''; });
            term.in('./gradlew test');
            term.dim('> Task :test');
            dia.flash('test');
            let failed = 0;
            for (let i = 0; i < TESTS.length; i++) {
              const t = TESTS[i], r = rows[i];
              r.classList.add('ck-run');
              dia.flash(...t.nodes);
              await sleep(420);
              if (!el.isConnected) return;
              const fail = t.bug && broken.has(t.bug);
              r.classList.remove('ck-run');
              r.classList.add(fail ? 'ck-fail' : 'ck-pass');
              r.time.textContent = `${t.ms} ms`;
              if (fail) { failed++; r.why.textContent = t.msg; r.why.hidden = false; replay(r, 'shake'); term.err(`ExpenseTrackerTest > ${t.name} FAILED`); term.err(`    ${t.msg}`); }
              else term.ok(`ExpenseTrackerTest > ${t.name} PASSED`);
            }
            if (failed) { term.err(`${TESTS.length} tests completed, ${failed} failed`); term.err('BUILD FAILED in 2s'); }
            else term.ok('BUILD SUCCESSFUL in 2s  // the sync test skipped ~0.5 s of delays');
            busy = false;
          }
          const bugBtns = BUGS.map(b => cmd(b.src, function () {
            if (busy) return;
            if (broken.has(b.id)) broken.delete(b.id); else broken.add(b.id);
            this.setAttribute('aria-pressed', String(broken.has(b.id)));
            term.dim(broken.has(b.id) ? `// broke ${b.where}: ${b.src}` : `// fixed ${b.where}`);
          }, { 'aria-pressed': 'false', title: `Break ${b.where}` }));
          el.append(
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Run tests')),
            h('div', { class: 'ck-tests' }, rows),
            h('p', { class: 'tip' }, 'Break the code (tap again to fix), then run the tests:'),
            h('div', { class: 'controls' }, bugBtns),
            term.el, dia.el);
          run();
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'You built it',
        tagline: 'A console app wires every piece together. Then, where to go next.',
        level: 'intermediate',
        refs: ['kotlin.when', 'arch.layers', 'solid.srp'],
        body: `
<p>The last piece is <code>main()</code>. It is the one place that picks concrete classes: the in-memory repository, the fake sync API, today’s date and the budget. Everything else only knows interfaces and plain data. This place is called the composition root. A loop reads lines with <code>readlnOrNull()</code> and a <code>when</code> routes them: <code>report</code>, <code>sync</code>, <code>quit</code>, or an expense to parse.</p>
<p>Look at what you have: value and data classes for the model, null-safe parsing into a <code>Result</code>, collection reports, storage behind an interface, a budget DSL with sealed alerts, parallel sync with retries, and a test suite that runs in milliseconds. None of it imports Android, so all of it can move into an app unchanged.</p>
<p>Stretch ideas:</p>
<ul>
<li>Add a <code>CsvExpenseRepository</code> that reads and writes a file. Make the repository functions <code>suspend</code> and do the file work in <code>withContext(Dispatchers.IO)</code>.</li>
<li>Move the model and logic into a Kotlin Multiplatform <code>commonMain</code>, swap <code>java.time</code> for kotlinx-datetime, and reuse it from an Android app.</li>
<li>Expose the totals as a <code>StateFlow</code> so a UI updates whenever an expense is added.</li>
<li>Support several currencies: add a currency to <code>Money</code> and refuse to add amounts in different ones.</li>
</ul>`,
        code: `// src/main/kotlin/tracker/Main.kt
fun main() = runBlocking {
    val repo = InMemoryExpenseRepository()
    val tracker = ExpenseTracker(repo) { LocalDate.now() }
    val sync = SyncService(repo, FakeSyncApi())
    val monthly = budget {
        Category.FOOD limit 300.money
        Category.FUN limit 80.money
    }

    println("Type an expense like '12.50 food lunch', or: report, sync, quit")
    while (true) {
        print("> ")
        val line = readlnOrNull()?.trim() ?: break
        when (line) {
            "quit" -> break
            "report" -> {
                val totals = tracker.report()
                totals.forEach { (category, money) -> println("\${category.label}: $money") }
                monthly.check(totals).forEach { alert ->
                    when (alert) {
                        is BudgetAlert.Near -> println("Careful: \${alert.category.label} at \${alert.spent} of \${alert.limit}")
                        is BudgetAlert.Over -> println("Over budget: \${alert.category.label} \${alert.spent} of \${alert.limit}")
                    }
                }
            }
            "sync" -> println("Synced \${sync.syncPending()} expenses")
            else -> tracker.add(line).fold(
                onSuccess = { println("Added #\${it.id}: \${it.amount} \${it.category.label}") },
                onFailure = { println("Error: \${it.message}") },
            )
        }
    }
}`,
        remember: 'Only main() knows the concrete classes. Everything else depends on interfaces and data, so it can move into an Android app as is.',
        terms: [
          { term: 'Composition root', def: 'The single place, usually main() or Application, where concrete classes are created and passed to the code that needs them.' },
          { term: 'readlnOrNull', def: 'Reads one line from standard input and returns null when the input has ended.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the input loop.', code: 'while (true) {\n    val line = [[readlnOrNull]]()?.trim() ?: break\n    when (line) {\n        "quit" -> [[break]]\n        "sync" -> println("Synced ${sync.syncPending()} expenses")\n        else -> tracker.add(line).[[fold]](\n            onSuccess = { println("Added #${it.id}") },\n            onFailure = { println("Error: ${it.message}") },\n        )\n    }\n}', why: '<code>readlnOrNull</code> returns null at end of input, <code>break</code> leaves the loop from inside <code>when</code>, and <code>fold</code> handles both sides of the Result.' },
          { type: 'bug', prompt: 'Sync always prints “Synced 0 expenses”. Tap the line.', code: 'fun main() = runBlocking {\n    val repo = InMemoryExpenseRepository()\n    val tracker = ExpenseTracker(repo) { LocalDate.now() }\n    val sync = SyncService(InMemoryExpenseRepository(), FakeSyncApi())\n    tracker.add("12.50 food lunch")\n    println("Synced ${sync.syncPending()} expenses")\n}', bug: 3, fix: '    val sync = SyncService(repo, FakeSyncApi())', why: 'The sync service got its own, empty repository. The composition root must pass the same instance to everything that shares it.' },
        ],
        quiz: [
          { q: 'Where does the program decide to use <code>InMemoryExpenseRepository</code> and <code>FakeSyncApi</code>?', options: ['Only in main(), the composition root', 'Inside ExpenseTracker', 'In every class that stores or syncs'], a: 0, why: 'The other classes receive interfaces through their constructors and never name a concrete class.' },
          { q: 'To store expenses in a file instead of memory, what changes?', options: ['A new ExpenseRepository class and one line in main()', 'ExpenseTracker and SyncService', 'The Expense data class'], a: 0, why: 'That is the payoff of depending on the interface: new behaviour is added, existing classes stay closed.' },
          { q: 'When does <code>readlnOrNull()</code> return null?', options: ['When input ends, for example after Ctrl+D or a closed pipe', 'When the user presses Enter on an empty line', 'Never'], a: 0, why: 'An empty line is an empty string. Null means there is no more input, so the loop ends.' },
        ],
        visual(el) {
          const term = terminal('java -jar tracker.jar');
          const dia = diagram(8);
          const items = [];
          const synced = new Set();
          const LIMITS = { FOOD: 30000, FUN: 8000 };
          let busy = false, quit = false;
          const input = h('input', { id: 'ck-repl-in', placeholder: '12.50 food lunch', spellcheck: 'false', autocomplete: 'off', maxlength: '40' });
          const stats = h('div', { class: 'ck-stats' });
          const paintStats = () => { stats.innerHTML = `<span>expenses: <b>${items.length}</b></span><span>not synced: <b>${items.filter(e => !synced.has(e.id)).length}</b></span><span>limits: <b>Food 300.00, Fun 80.00</b></span>`; };
          async function exec(raw) {
            if (busy || quit) return;
            const line = raw.trim();
            busy = true;
            term.in(line);
            dia.flash('main');
            if (line === 'quit') {
              quit = true; input.disabled = true;
              term.dim('Process finished with exit code 0  // press Reset to start again');
            } else if (line === 'report') {
              dia.flash('tracker', 'reports', 'budget', 'alert');
              const t = totals(items);
              if (!t.size) term.dim('// no expenses yet, so the report prints nothing');
              for (const [k, v] of t) term.ok(`${LABEL[k]}: ${fmt(v)}`);
              for (const [k, lim] of Object.entries(LIMITS)) {
                const s = t.get(k) || 0;
                if (s > lim) term.err(`Over budget: ${LABEL[k]} ${fmt(s)} of ${fmt(lim)}`);
                else if (s >= lim * 0.8) term.warn(`Careful: ${LABEL[k]} at ${fmt(s)} of ${fmt(lim)}`);
              }
            } else if (line === 'sync') {
              dia.flash('sync', 'repo');
              const pending = items.filter(e => !synced.has(e.id));
              term.dim(pending.length ? `// uploading ${Math.ceil(pending.length / 2)} batch(es) in parallel...` : '// nothing pending');
              await sleep(pending.length ? 650 : 150);
              if (!el.isConnected) return;
              dia.flash('api', 'fakeapi');
              pending.forEach(e => synced.add(e.id));
              term.ok(`Synced ${pending.length} expenses`);
            } else {
              dia.flash('tracker', 'parse');
              const r = parseExpense(line, items.length + 1, TODAY);
              if (r.ok) { items.push(r.e); term.ok(`Added #${r.e.id}: ${fmt(r.e.cents)} ${LABEL[r.e.cat]}`); setTimeout(() => dia.flash('repo', 'mem', 'expense'), 250); }
              else term.err(`Error: ${r.msg}`);
            }
            paintStats();
            busy = false;
          }
          const submit = () => { const v = input.value; if (!v.trim()) return; input.value = ''; exec(v); };
          input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
          paintStats();
          el.append(
            h('div', { class: 'ck-input' }, h('label', { for: 'ck-repl-in' }, '>'), input, h('button', { class: 'btn primary small', onclick: submit }, 'Enter')),
            h('div', { class: 'controls' }, ['12.50 food lunch', '48 fun concert', '950 rent march', 'report', 'sync', 'pizza 12', 'quit'].map(c => cmd(c, () => exec(c)))),
            stats, term.el, dia.el);
          term.line("Type an expense like '12.50 food lunch', or: report, sync, quit");
        },
      },
    ],
  });
})();
