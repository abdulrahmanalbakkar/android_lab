/* CS and interview basics track. Same shape as tracks/kotlin.js.
   Data structures and algorithms for job interviews, all in Kotlin.
   Most demos are step players: a lesson builds a list of frames (snapshots of the algorithm),
   and player() gives Step / Run / Reset over them. Every class is prefixed dsa- (cs- is taken by tracks/cap-ship.js). */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const pill = (text, cls = '') => h('span', { class: `dsa-pill ${cls}` }, String(text));
  const code = s => `<code>${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code>`;
  const label = text => h('span', { class: 'dsa-label' }, text);
  function stats(names) {
    const vals = {};
    const root = h('div', { class: 'dsa-stats' }, names.map(n => { const b = h('b', {}, '-'); vals[n] = b; return h('span', { class: 'dsa-stat' }, `${n} `, b); }));
    root.set = (n, v) => { if (vals[n].textContent !== String(v)) { vals[n].textContent = String(v); replay(vals[n], 'pop-soft'); } };
    return root;
  }
  // A row of array cells. cells: [{ v, i?, tag?, cls? }]
  const cellRow = (cells, extra = '') => h('div', { class: `dsa-arr ${extra}`, style: `--n:${cells.length}` },
    cells.map((c, k) => h('div', { class: `dsa-cell ${c.cls || ''}` },
      h('span', { class: 'dsa-i' }, c.i === undefined ? String(k) : c.i),
      h('span', { class: 'dsa-v' }, c.v === undefined || c.v === null ? '' : String(c.v)),
      h('span', { class: 'dsa-tag' }, c.tag || ''))));
  // Picker: a label plus pressed-state buttons. items: [{ src, ... }]
  function picker(name, items, onPick) {
    const btns = items.map((it, k) => cmd(it.src, () => { press(btns, btns[k]); onPick(it, k); }));
    press(btns, btns[0]);
    return h('div', { class: 'controls' }, label(name), btns);
  }

  // Step player. o.build() returns frames (frame 0 is the start state), o.paint(frame) draws one.
  function player(el, o) {
    let frames = [], i = 0, tok = 0;
    const msg = out('');
    const count = h('span', { class: 'dsa-stat' });
    const runB = act('Run', run, { 'aria-pressed': 'false' });
    const stepB = act('Step', () => { tok++; runB.setAttribute('aria-pressed', 'false'); go(i + 1); });
    const resetB = act('Reset', reset);
    function go(n) {
      if (n >= frames.length) return;
      i = n;
      const f = frames[i];
      o.paint(f, i, frames);
      if (f.msg != null) say(msg, f.msg);
      count.textContent = `step ${i} of ${frames.length - 1}`;
      stepB.disabled = runB.disabled = i >= frames.length - 1;
    }
    async function run() {
      const t = ++tok;
      runB.setAttribute('aria-pressed', 'true');
      while (i < frames.length - 1) {
        go(i + 1);
        await sleep(o.speed || 600);
        if (t !== tok || !el.isConnected) return;
      }
      runB.setAttribute('aria-pressed', 'false');
    }
    function reset() { tok++; runB.setAttribute('aria-pressed', 'false'); frames = o.build(); i = 0; go(0); }
    el.append(...[].concat(o.top || []), h('div', { class: 'dsa-stage' }, o.view), h('div', { class: 'controls dsa-ctl' }, stepB, runB, resetB, count), msg);
    reset();
    return { reset };
  }

  // Nodes and edges as inline SVG. nodes: [{ id, x, y, text?, label? }], edges: [[a, b]]
  let svgN = 0;
  function graphSvg(nodes, edges, { w = 320, ht = 200, r = 16, directed = false, name = 'graph' } = {}) {
    const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
    const mid = `dsa-arrow-${++svgN}`;
    const lines = edges.map(([a, b]) => {
      const A = pos[a], B = pos[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const end = r + (directed ? 3 : 0);
      return `<line class="dsa-ed" data-e="${a}>${b}" x1="${(A.x + ux * r).toFixed(1)}" y1="${(A.y + uy * r).toFixed(1)}" x2="${(B.x - ux * end).toFixed(1)}" y2="${(B.y - uy * end).toFixed(1)}"${directed ? ` marker-end="url(#${mid})"` : ''}/>`;
    }).join('');
    const circles = nodes.map(n => `<g class="dsa-gn" data-n="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="${r}"/><text class="dsa-gt" x="${n.x}" y="${n.y}">${n.text ?? ''}</text>${n.label ? `<text class="dsa-gl" x="${n.x}" y="${n.y + r + 11}">${n.label}</text>` : ''}</g>`).join('');
    const defs = directed ? `<defs><marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path class="dsa-arrow" d="M0,0 L10,5 L0,10 z"/></marker></defs>` : '';
    const root = h('div', { class: 'dsa-svgwrap', html: `<svg class="dsa-svg" viewBox="0 0 ${w} ${ht}" role="img" aria-label="${name}">${defs}${lines}${circles}</svg>` });
    const N = {}, E = {};
    root.querySelectorAll('.dsa-gn').forEach(g => { N[g.dataset.n] = g; });
    root.querySelectorAll('.dsa-ed').forEach(l => { E[l.dataset.e] = l; });
    const edge = (a, b) => E[`${a}>${b}`] || (directed ? null : E[`${b}>${a}`]);
    return {
      root,
      clear() { Object.values(N).forEach(g => g.setAttribute('class', 'dsa-gn')); Object.values(E).forEach(l => l.setAttribute('class', 'dsa-ed')); },
      node(id, cls) { N[id].setAttribute('class', `dsa-gn ${cls || ''}`); },
      edge(a, b, cls) { const l = edge(a, b); if (l) l.setAttribute('class', `dsa-ed ${cls || ''}`); },
      text(id, t) { N[id].querySelector('.dsa-gt').textContent = t; },
    };
  }

  const css = `
.dsa-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.dsa-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.dsa-col { display: grid; gap: 6px; align-content: start; min-width: 0; }
.dsa-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.dsa-stats { display: flex; flex-wrap: wrap; gap: 4px 16px; min-width: 0; }
.dsa-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.dsa-stat b { color: var(--ink); display: inline-block; }
.dsa-ctl .cmd:disabled { opacity: 0.45; cursor: default; transform: none; }
.dsa-pill { font: 600 0.8rem var(--mono); padding: 3px 9px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.dsa-pill.dsa-acc { border-color: var(--accent); background: var(--accent-soft); }
.dsa-pill.dsa-warm { border-color: var(--warm); background: var(--warm-soft); }
.dsa-pill.dsa-ok { border-color: var(--ok); background: var(--ok-soft); }
.dsa-pill.dsa-err { border-color: var(--err); background: var(--err-soft); }
.dsa-pill.dsa-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.dsa-pill.dsa-sm { font-size: 0.72rem; padding: 2px 6px; border-width: 1.5px; }
.dsa-flash { animation: dsa-flash 0.5s ease-out; }
@keyframes dsa-flash { from { transform: translateY(-6px) scale(1.1); } }
.dsa-cmp { font: 600 0.82rem/1.5 var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.kt.dsa-wrapk { white-space: pre-wrap; overflow-wrap: anywhere; }

/* array cells */
.dsa-arr { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 4px; min-width: 0; }
.dsa-arr.dsa-wrap { display: flex; flex-wrap: wrap; }
.dsa-arr.dsa-wrap .dsa-cell { width: 34px; }
.dsa-arr.dsa-wide { grid-template-columns: repeat(var(--n), minmax(0, 72px)); justify-content: start; }
.dsa-cell { display: grid; justify-items: center; gap: 1px; padding: 3px 0; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.dsa-v { font: 700 0.86rem/1.3 var(--mono); color: var(--ink); max-width: 100%; overflow: hidden; min-height: 1.3em; }
.dsa-i { font: 500 0.6rem var(--mono); color: var(--muted); }
.dsa-tag { font: 700 0.6rem/1.2 var(--mono); color: var(--accent); min-height: 1.2em; max-width: 100%; overflow-wrap: anywhere; text-align: center; }
:is(.dsa-cell, .dsa-sq, .dsa-bucket).dsa-on { border-color: var(--accent); background: var(--accent-soft); }
:is(.dsa-cell, .dsa-sq, .dsa-bucket).dsa-hot { border-color: var(--warm); background: var(--warm-soft); }
:is(.dsa-cell, .dsa-sq, .dsa-bucket).dsa-ok { border-color: var(--ok); background: var(--ok-soft); }
:is(.dsa-cell, .dsa-sq, .dsa-bucket).dsa-bad { border-color: var(--err); background: var(--err-soft); }
:is(.dsa-cell, .dsa-sq).dsa-dim { opacity: 0.32; }
.dsa-cell.dsa-empty { border-style: dashed; background: transparent; }
.dsa-hot .dsa-tag { color: var(--warm); }
.dsa-bad .dsa-tag { color: var(--err); }
.dsa-ok .dsa-tag { color: var(--ok); }

/* growth meter */
.dsa-meter { display: grid; grid-template-columns: 6.4em minmax(0, 1fr) 4.6em; gap: 7px 8px; align-items: center; font: 600 0.78rem var(--mono); color: var(--ink); min-width: 0; }
.dsa-track { height: 16px; background: var(--sunk); border-radius: 6px; overflow: hidden; min-width: 0; }
.dsa-fill { height: 100%; width: 0; min-width: 3px; border-radius: 6px; background: var(--accent); transition: width 0.45s ease-out; }
.dsa-fill.dsa-f-warm { background: var(--warm); }
.dsa-fill.dsa-f-err { background: var(--err); }
.dsa-num { text-align: right; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }

/* square grids */
.dsa-grid { display: grid; grid-template-columns: repeat(var(--c), minmax(0, 1fr)); gap: 3px; width: 100%; max-width: 300px; margin: 0 auto; min-width: 0; }
.dsa-sq { aspect-ratio: 1; display: grid; place-items: center; border-radius: 6px; border: 1.5px solid var(--line); background: var(--surface); font: 600 0.72rem var(--mono); color: var(--ink); min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.dsa-sq.dsa-wall { background: var(--muted); border-color: var(--muted); }
.dsa-sq.dsa-head { background: transparent; border-color: transparent; color: var(--muted); }
.dsa-sq.dsa-off { opacity: 0.25; }

/* hash buckets */
.dsa-buckets { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 4px; min-width: 0; }
.dsa-bucket { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding: 3px 6px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); min-height: 32px; min-width: 0; transition: border-color 0.2s, background 0.2s; }
.dsa-bi { font: 600 0.68rem var(--mono); color: var(--muted); min-width: 1.8em; }

/* stacks, queues, splits */
.dsa-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; align-items: start; min-width: 0; }
.dsa-stack { display: flex; flex-direction: column-reverse; justify-content: flex-start; align-items: center; gap: 4px; min-height: 130px; width: 76px; padding: 6px; border: 2px solid var(--line); border-top: none; border-radius: 0 0 10px 10px; }
.dsa-queue { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; min-height: 30px; min-width: 0; }

/* bars */
.dsa-bars { display: flex; align-items: flex-end; gap: 4px; height: 130px; min-width: 0; }
.dsa-bar { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; border: 2px solid var(--line); border-radius: 6px 6px 2px 2px; background: var(--sunk); font: 700 0.7rem var(--mono); color: var(--ink); padding-top: 2px; transition: height 0.3s, background 0.2s, border-color 0.2s, opacity 0.2s; }
.dsa-bar.dsa-on { border-color: var(--accent); background: var(--accent-soft); }
.dsa-bar.dsa-hot { border-color: var(--warm); background: var(--warm-soft); }
.dsa-bar.dsa-ok { border-color: var(--ok); background: var(--ok-soft); }
.dsa-bar.dsa-dim { opacity: 0.35; }
.dsa-ptr { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 4px; font: 700 0.62rem var(--mono); color: var(--accent); text-align: center; min-height: 1.2em; }

/* svg graphs and trees */
.dsa-svgwrap { min-width: 0; }
.dsa-svg { display: block; width: 100%; max-width: 440px; height: auto; margin: 0 auto; overflow: visible; }
.dsa-svg .dsa-ed { stroke: var(--line); stroke-width: 2.5; transition: stroke 0.25s; }
.dsa-svg .dsa-ed.dsa-on { stroke: var(--accent); stroke-width: 4; }
.dsa-svg .dsa-ed.dsa-hot { stroke: var(--warm); stroke-width: 4; }
.dsa-svg .dsa-ed.dsa-ok { stroke: var(--ok); stroke-width: 4; }
.dsa-svg .dsa-ed.dsa-bad { stroke: var(--err); stroke-width: 4; }
.dsa-svg .dsa-arrow { fill: var(--muted); }
.dsa-svg .dsa-gn circle { fill: var(--surface); stroke: var(--muted); stroke-width: 2.5; transition: fill 0.25s, stroke 0.25s; }
.dsa-svg .dsa-gn.dsa-on circle { fill: var(--accent-soft); stroke: var(--accent); }
.dsa-svg .dsa-gn.dsa-hot circle { fill: var(--warm-soft); stroke: var(--warm); }
.dsa-svg .dsa-gn.dsa-ok circle { fill: var(--ok-soft); stroke: var(--ok); }
.dsa-svg .dsa-gn.dsa-bad circle { fill: var(--err-soft); stroke: var(--err); }
.dsa-svg .dsa-gn.dsa-dim { opacity: 0.35; }
.dsa-svg text { fill: var(--ink); font-family: var(--mono); text-anchor: middle; dominant-baseline: central; }
.dsa-svg .dsa-gt { font-size: 13px; font-weight: 700; }
.dsa-svg .dsa-gl { font-size: 11px; font-weight: 600; fill: var(--muted); }

/* interview card */
.dsa-card { display: grid; gap: 8px; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--accent); background: var(--surface); min-width: 0; }
.dsa-card h4 { margin: 0; font: 700 1rem var(--display); color: var(--ink); }
.dsa-card p, .dsa-card ul { margin: 0; color: var(--ink); }
.dsa-card ul { padding-left: 1.2em; }
@media (max-width: 520px) { .dsa-split { grid-template-columns: minmax(0, 1fr); } .dsa-stack { width: auto; min-height: 0; flex-direction: row; flex-wrap: wrap; border: 2px solid var(--line); border-left: none; border-radius: 0 10px 10px 0; } }
`;

  // ---------- shared data for demos ----------
  const javaHash = s => { let x = 0; for (let k = 0; k < s.length; k++) x = (Math.imul(31, x) + s.charCodeAt(k)) | 0; return x; };
  const bucketOf = (x, cap) => (x ^ (x >>> 16)) & (cap - 1);

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  lessons.push({
    id: 'big-o',
    title: 'Big-O: how cost grows',
    tagline: 'Count how the work grows with the input, not the milliseconds.',
    level: 'beginner',
    body: `
<p>Big-O describes how the work an algorithm does grows as the input gets bigger. It ignores the exact milliseconds, which depend on the phone, and keeps only the shape of the growth. If doubling <code>n</code> doubles the work, it is O(n). If doubling <code>n</code> makes four times the work, it is O(n²).</p>
<p>To find it, count the steps that repeat. One loop over the list is O(n). A loop inside a loop over the same list is O(n²). Cutting the problem in half on every step, like binary search, is O(log n). Drop constants and smaller terms: 3n + 5 is still O(n).</p>
<p><em>Space complexity</em> is the same idea for memory: how much extra memory you allocate as n grows. Step through the demo and watch n² pull away from the rest as n doubles.</p>`,
    code: `// O(1): one step, whatever the size
fun first(items: List<Int>): Int? = items.firstOrNull()

// O(n): touches every item once
fun total(items: List<Int>): Int {
    var sum = 0
    for (x in items) sum += x
    return sum
}

// O(n²) time: compares every pair
fun hasDuplicateSlow(items: List<Int>): Boolean {
    for (i in items.indices)
        for (j in i + 1 until items.size)
            if (items[i] == items[j]) return true
    return false
}

// O(n) time, O(n) extra space: trade memory for speed
fun hasDuplicate(items: List<Int>): Boolean {
    val seen = HashSet<Int>()
    for (x in items) if (!seen.add(x)) return true
    return false
}`,
    remember: 'Count the loops that depend on n. Nested loops multiply, loops in a row add, and halving gives log n.',
    visual(el) {
      const CL = [
        ['O(1)', () => 1, ''],
        ['O(log n)', n => Math.max(1, Math.log2(n)), ''],
        ['O(n)', n => n, ''],
        ['O(n log n)', n => n * Math.max(1, Math.log2(n)), 'dsa-f-warm'],
        ['O(n²)', n => n * n, 'dsa-f-err'],
      ];
      const rows = CL.map(([name, , cls]) => { const fill = h('div', { class: `dsa-fill ${cls}` }); const num = h('span', { class: 'dsa-num' }, '1'); return { fill, num, els: [h('span', {}, name), h('div', { class: 'dsa-track' }, fill), num] }; });
      const nLabel = h('b', {}, '1');
      const fmt = v => Math.round(v).toLocaleString('en-US');
      player(el, {
        view: [h('div', { class: 'dsa-row' }, label('input size'), h('span', { class: 'dsa-stat' }, 'n = ', nLabel)), h('div', { class: 'dsa-meter' }, rows.map(r => r.els)), h('span', { class: 'dsa-stat' }, 'Bar length: steps, relative to the biggest one at this n.')],
        speed: 900,
        build: () => [1, 2, 4, 8, 16, 32, 64, 128].map((n, k) => ({
          n,
          msg: k === 0 ? 'n = 1: every class costs about one step. Press Step to double n.'
            : n === 128 ? `n = 128: n² is <span class="bad">${fmt(n * n)}</span> steps, n log n is ${fmt(n * 7)}, n is 128, log n is 7. At n = 100,000 and 1 µs per step, n² takes about 3 hours; n log n takes under 2 seconds.`
              : `n doubled to ${n}: O(n) doubled, O(n²) went ×4 to ${fmt(n * n)}, O(log n) only went up by 1.`,
        })),
        paint(f) {
          nLabel.textContent = String(f.n);
          const vals = CL.map(([, fn]) => fn(f.n));
          const max = Math.max(...vals);
          rows.forEach((r, k) => { r.fill.style.width = `${(vals[k] / max) * 100}%`; r.num.textContent = fmt(vals[k]); });
        },
      });
    },
    deeper: [
      {
        title: 'Count the pairs',
        body: `<p>The nested loop in <code>hasDuplicateSlow</code> compares every pair once: n(n − 1) / 2 comparisons. For 6 items that is 15, for 1,000 items about 500,000. Big-O drops the ½ and the −n and keeps n².</p>
<p>The <code>HashSet</code> version looks at each item once: 6 checks for 6 items. Step through the worst case, a list with no duplicates, where nothing stops the loops early.</p>`,
        visual(el) {
          const items = [5, 2, 9, 4, 7, 1], n = items.length;
          const sq = [];
          const grid = h('div', { class: 'dsa-grid', style: `--c:${n + 1}` },
            h('div', { class: 'dsa-sq dsa-head' }, ''), items.map(v => h('div', { class: 'dsa-sq dsa-head' }, String(v))),
            items.map((v, i) => [h('div', { class: 'dsa-sq dsa-head' }, String(v)), items.map((w, j) => { const s = h('div', { class: `dsa-sq ${j <= i ? 'dsa-off' : ''}` }); sq.push({ s, i, j }); return s; })]));
          const st = stats(['comparisons', 'with a HashSet']);
          player(el, {
            view: [grid, st], speed: 350,
            build() {
              const fr = [{ c: -1, msg: 'Each white square is one pair (i, j) with i &lt; j. The loops visit them row by row.' }];
              let c = 0;
              for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { c++; fr.push({ i, j, c, msg: `items[${i}] = ${items[i]} vs items[${j}] = ${items[j]}: different. ${c} comparisons so far.` }); }
              fr.push({ i: -1, j: -1, c, end: true, msg: `Done: ${c} comparisons = 6 × 5 / 2. A HashSet does it in 6 add() calls. Double the list to 12 and the pairs grow to 66, the set calls to 12.` });
              return fr;
            },
            paint(f) {
              sq.forEach(({ s, i, j }) => {
                if (j <= i) return;
                const idx = i * n + j, cur = f.i * n + f.j;
                s.className = `dsa-sq ${f.end ? 'dsa-ok' : idx === cur ? 'dsa-hot' : f.i >= 0 && (i < f.i || (i === f.i && j < f.j)) ? 'dsa-on' : ''}`;
                s.textContent = f.i === i && f.j === j ? '?' : '';
              });
              st.set('comparisons', Math.max(0, f.c ?? 0));
              st.set('with a HashSet', f.end ? 6 : '-');
            },
          });
        },
      },
      {
        title: 'Hidden loops in one line',
        body: `<p>Many Kotlin calls loop for you: <code>contains</code>, <code>indexOf</code>, <code>filter</code>, <code>count</code>, <code>sorted</code>. On a <code>List</code>, <code>x in list</code> scans the list. Put it inside another loop and you have O(n × m), even though you only wrote one loop.</p>
<p>The fix is usually to build a <code>HashSet</code> once, in O(m), so each lookup is O(1) on average.</p>`,
        code: `// Looks like one loop. It is O(n × m), because \`in\` on a List scans it.
fun common(a: List<String>, b: List<String>): List<String> =
    a.filter { it in b }

// O(n + m): build a set once, then each lookup is O(1) on average
fun commonFast(a: List<String>, b: List<String>): List<String> {
    val inB = b.toHashSet()
    return a.filter { it in inB }
}`,
      },
      {
        title: 'Space complexity',
        body: `<p>Count the extra memory the function allocates as n grows. <code>reversed()</code> builds a new list: O(n) extra space. <code>reverse()</code> on a mutable list swaps items in place: O(1) extra.</p>
<p>Recursion also uses memory. Every call that has not returned yet keeps a frame on the call stack, so recursion n levels deep is O(n) space, and very deep recursion ends in <code>StackOverflowError</code>.</p>`,
        code: `val copy = list.reversed()        // O(n) extra memory: a new list
mutableList.reverse()             // O(1) extra memory: swaps in place

fun sumTo(n: Int): Long = if (n == 0) 0 else n + sumTo(n - 1)   // O(n) stack frames
fun sumToLoop(n: Int): Long { var s = 0L; for (i in 1..n) s += i; return s }   // O(1)`,
      },
      {
        title: 'Measure when it matters',
        body: `<p>Big-O tells you the shape, not the real time. For small inputs a simple O(n²) loop can beat a clever O(n log n) one, because constants and memory layout matter. When speed matters, measure. <code>measureTime</code> from the standard library gives a quick rough number; a single run like this is a sanity check, not a benchmark.</p>`,
        code: `import kotlin.time.measureTime

val big = List(100_000) { it }
val slow = measureTime { hasDuplicateSlow(big.take(5_000)) }
val fast = measureTime { hasDuplicate(big) }
println("slow: $slow, fast: $fast")`,
      },
    ],
    mistakes: [
      { title: 'contains() on a List inside a loop', bad: 'val blocked: List<Long> = loadBlocked()\nval visible = messages.filter { it.senderId !in blocked }   // O(n × m)', good: 'val blocked: Set<Long> = loadBlocked().toHashSet()\nval visible = messages.filter { it.senderId !in blocked }   // O(n + m)', why: 'The line looks cheap, but <code>in</code> on a <code>List</code> walks it from the start. A <code>HashSet</code> answers in O(1) on average.' },
      { title: 'Counting constants in Big-O', bad: '// "Two passes, so this is O(2n)"\nval low = prices.min()\nval high = prices.max()', good: '// Two passes still grow like one: O(n)\nval low = prices.min()\nval high = prices.max()', why: 'Big-O describes growth. 2n and n both double when n doubles, so both are O(n). Constants matter for real speed, not for the class.' },
    ],
    terms: [
      { term: 'Big-O', def: 'A description of how an algorithm’s work grows with input size, keeping only the fastest-growing term.' },
      { term: 'Time complexity', def: 'How the number of steps grows as the input grows, for example O(n) or O(n²).' },
      { term: 'Space complexity', def: 'How much extra memory an algorithm needs as the input grows, including the call stack.' },
      { term: 'O(log n)', def: 'Growth where doubling the input adds only one more step, typical of halving the problem each time.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fill in the Big-O of each function. Use n for the list size.', code: 'fun first(list: List<Int>) = list[0]          // O([[1]])\nfun sum(list: List<Int>) = list.sum()          // O([[n]])\nfun pairs(list: List<Int>) =\n    list.flatMap { a -> list.map { b -> a to b } }   // O([[n²|n^2|n*n]])', why: 'Indexing is one step. <code>sum()</code> visits each item. <code>flatMap</code> over the list with a <code>map</code> over the list inside makes n × n pairs.' },
      { type: 'bug', prompt: 'With 50,000 users this takes seconds. Tap the line that makes it O(n²).', code: 'fun newUsers(all: List<User>, known: List<User>): List<User> {\n    val result = mutableListOf<User>()\n    for (u in all) {\n        if (u !in known) result += u\n    }\n    return result\n}', bug: 3, fix: '        if (u !in knownSet) result += u   // val knownSet = known.toHashSet()', why: '<code>u !in known</code> scans the whole <code>known</code> list for every user. Build a <code>HashSet</code> once before the loop and each check is O(1) on average.' },
    ],
    quiz: [
      { q: 'A function loops over a list, and inside that loop it loops over the same list again. What is its time complexity?', options: ['O(n)', 'O(2n)', 'O(n²)'], a: 2, why: 'For each of the n items it does n more steps: n × n.' },
      { q: 'Binary search halves the range on every step. About how many steps for 1,000,000 sorted items?', options: ['About 20', 'About 1,000', 'About 500,000'], a: 0, why: '2²⁰ is about 1,048,576, so 20 halvings get from a million down to one.' },
      { q: '<code>val copy = list.sorted()</code>. How much extra space does it use?', options: ['O(1)', 'O(n), because it returns a new list'], a: 1, why: '<code>sorted()</code> leaves the original alone and builds a new list of n items. <code>sort()</code> on a mutable list sorts in place.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  lessons.push({
    id: 'arrays-lists',
    title: 'Arrays and lists',
    tagline: 'Reading by index is instant. Inserting at the front moves everything.',
    level: 'beginner',
    body: `
<p>An array is one block of memory with slots side by side. Reading <code>a[i]</code> jumps straight to slot <code>i</code>, so it is O(1). Its size is fixed when you create it.</p>
<p><code>ArrayList</code>, the default <code>MutableList</code> in Kotlin, wraps an array that is usually bigger than the list. Adding at the end fills a free slot. When the array is full, the list allocates a bigger one and copies everything over. That copy is O(n), but it happens rarely, so <code>add</code> is O(1) <em>amortized</em>: averaged over many adds, the cost per add stays constant.</p>
<p>Inserting or removing at the front is different. Every element has to shift one slot, so <code>add(0, x)</code> is O(n). Step through the demo and watch the copy counter: copies per add stay small even as the list grows.</p>`,
    code: `val scores = IntArray(5)                 // fixed size, primitive ints, no boxing
scores[2] = 90                           // O(1)

val names = mutableListOf("Ada", "Ali")  // an ArrayList under the hood
names += "Ece"                           // O(1) amortized: append
names[0]                                 // O(1): index into the array
names.add(0, "Zeynep")                   // O(n): shifts every element right
names.removeAt(0)                        // O(n): shifts every element left

// Know the size up front? Allocate once.
val ids = ArrayList<Long>(10_000)
val squares = List(1_000) { it * it }`,
    remember: 'Index and append are cheap. Insert or remove at the front shifts everything: O(n).',
    visual(el) {
      const slots = h('div', {});
      const st = stats(['size', 'capacity', 'copies', 'copies per add']);
      player(el, {
        view: [label('backing array'), slots, st], speed: 500,
        build() {
          let cap = 4, copies = 0;
          const arr = [];
          const fr = [{ cap, arr: [], copies, adds: 0, msg: 'An empty list with room for 4. (Real ArrayLists start at 10; the demo starts small.)' }];
          for (let k = 1; k <= 20; k++) {
            if (arr.length === cap) {
              const old = cap;
              cap = cap + (cap >> 1);
              copies += arr.length;
              fr.push({ cap, arr: [...arr], copies, adds: k - 1, copied: true, msg: `<span class="bad">Full at ${old}.</span> Allocate ${cap} slots (about 1.5×) and copy all ${arr.length} items: O(n), this time only.` });
            }
            arr.push(k);
            fr.push({ cap, arr: [...arr], copies, adds: k, at: arr.length - 1, msg: `add(${k}) → slot ${arr.length - 1}. A free slot was waiting: no copy.` });
          }
          const last = fr[fr.length - 1];
          last.msg = `20 adds cost ${copies} copies in total, about ${(copies / 20).toFixed(1)} per add. Because the array grows by a factor, that average stays bounded no matter how long the list gets: amortized O(1).`;
          return fr;
        },
        paint(f) {
          const cells = [];
          for (let k = 0; k < f.cap; k++) {
            const has = k < f.arr.length;
            cells.push({ v: has ? f.arr[k] : '', cls: !has ? 'dsa-empty' : f.copied ? 'dsa-hot dsa-flash' : k === f.at ? 'dsa-on dsa-flash' : '' });
          }
          slots.replaceChildren(cellRow(cells, 'dsa-wrap'));
          st.set('size', f.arr.length); st.set('capacity', f.cap); st.set('copies', f.copies);
          st.set('copies per add', f.adds ? (f.copies / f.adds).toFixed(2) : '-');
        },
      });
    },
    deeper: [
      {
        title: 'Insert at the front, one shift at a time',
        body: `<p><code>add(0, x)</code> has to open a gap at slot 0. The list moves the last item right, then the one before it, and so on down to slot 0. With n items that is n moves. <code>add(x)</code> at the end moves nothing.</p>
<p>Building a long list by inserting at the front is O(n²) in total. Append and reverse once at the end, or use <code>ArrayDeque</code>, which has a cheap <code>addFirst</code>.</p>`,
        visual(el) {
          let mode = 'front';
          const row = h('div', {});
          const st = stats(['moves']);
          const p = player(el, {
            top: picker('call', [{ src: 'list.add(0, "X")', m: 'front' }, { src: 'list.add("X")', m: 'end' }], it => { mode = it.m; p.reset(); }),
            view: [row, st], speed: 650,
            build() {
              const a = ['A', 'B', 'C', 'D', 'E', null, null, null];
              const fr = [{ a: [...a], moves: 0, msg: `list = [A, B, C, D, E], capacity 8. Calling ${mode === 'front' ? 'add(0, "X")' : 'add("X")'}.` }];
              if (mode === 'end') { a[5] = 'X'; fr.push({ a: [...a], at: 5, moves: 0, msg: 'Slot 5 is free. Write X there. Zero moves: O(1).' }); return fr; }
              let moves = 0;
              for (let k = 4; k >= 0; k--) { a[k + 1] = a[k]; moves++; fr.push({ a: [...a], at: k + 1, from: k, moves, msg: `Move ${a[k]} from slot ${k} to slot ${k + 1}.` }); }
              a[0] = 'X';
              fr.push({ a: [...a], at: 0, moves, done: true, msg: `Write X into slot 0. ${moves} moves for 5 items: O(n). A list of 100,000 would move 100,000 items.` });
              return fr;
            },
            paint(f) {
              row.replaceChildren(cellRow(f.a.map((v, k) => ({ v: v ?? '', cls: v == null ? 'dsa-empty' : k === f.at ? 'dsa-on dsa-flash' : k === f.from ? 'dsa-dim' : '' }))));
              st.set('moves', f.moves);
            },
          });
        },
      },
      {
        title: 'LinkedList: cheap links, slow walks',
        body: `<p><code>java.util.LinkedList</code> keeps each element in its own node with pointers to the previous and next node. Adding or removing at either end is O(1). But <code>get(i)</code> has to walk node by node from an end, so it is O(n). The nodes are scattered in memory, so even a full walk is slower than walking an array.</p>
<p>In practice, Kotlin’s <code>ArrayDeque</code> gives O(1) at both ends on top of an array, and is the better default for queues and stacks.</p>`,
        code: `val linked = java.util.LinkedList<Int>()
linked.addFirst(1)       // O(1)
linked[5_000]            // O(n): walks node by node

val deque = ArrayDeque<Int>()
deque.addFirst(1)        // O(1) amortized, backed by an array
deque.addLast(2)
deque[0]                 // O(1)`,
      },
      {
        title: 'Remove many items in one pass',
        body: `<p>Calling <code>removeAt</code> in a loop shifts the tail on every call: O(n²) in the worst case. <code>removeAll { }</code> on a mutable list, or <code>filter</code> into a new list, does the job in one pass.</p>`,
        code: `// O(n²): every removeAt shifts the rest of the list
var i = 0
while (i < list.size) { if (list[i] < 0) list.removeAt(i) else i++ }

// O(n): one pass
list.removeAll { it < 0 }
val positives = list.filter { it >= 0 }`,
      },
    ],
    underHood: {
      body: `<p>On the JVM, an <code>ArrayList</code> keeps an <code>Object[]</code>. An <code>Int</code> in a <code>List&lt;Int&gt;</code> is stored as a boxed <code>Integer</code> object; an <code>IntArray</code> stores raw ints with no boxing. In OpenJDK, a new <code>ArrayList()</code> starts with an empty shared array and allocates 10 slots on the first add. When it is full, the new capacity is the old one plus half, and the items are copied with <code>Arrays.copyOf</code>.</p>`,
      code: `// Roughly what ArrayList.add does (OpenJDK, simplified)
fun add(e: Any?) {
    if (size == elementData.size) {
        val newCap = elementData.size + (elementData.size shr 1)   // about 1.5×
        elementData = elementData.copyOf(newCap)                     // O(n) copy
    }
    elementData[size++] = e
}`,
    },
    mistakes: [
      { title: 'Building a list by inserting at the front', bad: 'val feed = mutableListOf<Post>()\nfor (post in incoming) feed.add(0, post)   // O(n²) overall', good: 'val feed = incoming.asReversed().toMutableList()   // O(n)\n// or: val feed = ArrayDeque<Post>(); feed.addFirst(post)', why: 'Each <code>add(0, …)</code> shifts every item already in the list. Reverse once, or use <code>ArrayDeque</code> when you really need the front.' },
      { title: 'Reaching for LinkedList by habit', bad: 'val queue = java.util.LinkedList<Job>()', good: 'val queue = ArrayDeque<Job>()', why: '<code>ArrayDeque</code> is also O(1) at both ends, uses less memory per element, and is faster to walk because its items sit in one array.' },
    ],
    terms: [
      { term: 'Amortized O(1)', def: 'An operation that is sometimes slow but cheap on average over many calls, like ArrayList.add.' },
      { term: 'Capacity', def: 'How many slots a list’s backing array has, which can be more than the number of items in it.' },
      { term: 'Boxing', def: 'Wrapping a primitive like an Int in an object so it can live in a generic collection.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Use an array of primitive ints, and give the list its final capacity up front.', code: 'val expected = rows.size\nval counts = [[IntArray]](26)\nval users = [[ArrayList]]<User>(expected)', why: '<code>IntArray</code> stores raw ints with no boxing. <code>ArrayList(capacity)</code> allocates once, so no copies happen while you add.' },
      { type: 'bug', prompt: 'This crashes with <code>IndexOutOfBoundsException</code>. Tap the broken line.', code: 'fun average(scores: List<Int>): Double {\n    var total = 0\n    for (i in 0..scores.size) {\n        total += scores[i]\n    }\n    return total.toDouble() / scores.size\n}', bug: 2, fix: '    for (i in scores.indices) {', why: '<code>0..size</code> includes <code>size</code>, one past the last index. <code>indices</code> (or <code>0 until size</code>) stops at <code>size - 1</code>.' },
    ],
    quiz: [
      { q: 'Why is <code>add()</code> at the end of an ArrayList called O(1) amortized?', options: ['It never copies', 'It copies rarely, so the average cost per add stays constant', 'The JVM caches it'], a: 1, why: 'A full array is copied into a bigger one, but the growth is by a factor, so total copies stay proportional to the number of adds.' },
      { q: 'Which call is O(n) on an ArrayList of n items?', options: ['list[n / 2]', 'list.add(x)', 'list.add(0, x)'], a: 2, why: 'Inserting at index 0 shifts every item one slot right.' },
      { q: 'You need cheap adds and removes at both ends. Which type?', options: ['ArrayList', 'ArrayDeque', 'IntArray'], a: 1, why: '<code>ArrayDeque</code> is a ring buffer: both ends are O(1) amortized.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  lessons.push({
    id: 'hashing',
    title: 'Hash maps and sets',
    tagline: 'Turn a key into a bucket number, and lookups stop depending on size.',
    level: 'intermediate',
    body: `
<p>A hash map keeps an array of <em>buckets</em>. To store a key, it calls <code>hashCode()</code>, mixes the bits, and turns the number into a bucket index. To find the key later, it does the same math and looks in that one bucket. That is why <code>get</code>, <code>put</code> and <code>contains</code> are O(1) on average.</p>
<p>Two keys can land in the same bucket. That is a <em>collision</em>. The map keeps both and uses <code>equals()</code> to tell them apart. When the map gets too full (on the JVM, more entries than 75% of the bucket count by default), it doubles the buckets and moves every key. A <code>HashSet</code> is the same structure with keys only.</p>
<p>The demo uses the real JVM <code>String.hashCode()</code> and the same bucket math as <code>java.util.HashMap</code>. Watch for collisions, and for the resize when the 7th key goes in.</p>`,
    code: `val stock = hashMapOf("elma" to 12, "armut" to 4)
stock["kiraz"] = 30            // put: O(1) on average
stock["elma"]                  // get: hash, jump to one bucket, compare with equals()
"muz" in stock                 // containsKey: O(1) on average

val seen = HashSet<String>()
for (word in words) {
    if (!seen.add(word)) println("repeat: $word")   // add() returns false if it was there
}

// Counting things: the most common interview pattern
val counts: Map<String, Int> = words.groupingBy { it }.eachCount()`,
    remember: 'equals and hashCode go together. Equal objects must have equal hash codes, or the map looks in the wrong bucket.',
    visual(el) {
      const KEYS = ['elma', 'armut', 'kiraz', 'muz', 'nar', 'incir', 'ayva', 'erik', 'üzüm', 'limon'];
      const box = h('div', {});
      const st = stats(['size', 'buckets', 'resize after']);
      player(el, {
        view: [box, st], speed: 750,
        build() {
          let cap = 8, b = Array.from({ length: cap }, () => []), size = 0;
          const snap = o => ({ cap, b: b.map(x => [...x]), size, ...o });
          const fr = [snap({ msg: 'An empty HashMap with 8 buckets. Press Step to put the first key.' })];
          for (const k of KEYS) {
            const x = javaHash(k), i = bucketOf(x, cap);
            fr.push(snap({ hot: i, key: k, msg: `${code(`"${k}".hashCode()`)} = ${x}. Mix the bits and keep the low ${Math.log2(cap)}: bucket <b>${i}</b>.` }));
            const had = b[i].length;
            b[i].push(k); size++;
            fr.push(snap({ hot: i, key: k, col: had > 0, msg: had ? `<span class="bad">Collision:</span> bucket ${i} already holds ${b[i].slice(0, -1).map(s => `"${s}"`).join(', ')}. Both stay; ${code('equals()')} tells them apart on lookup.` : `<span class="good">put:</span> "${k}" goes into empty bucket ${i}.` }));
            if (size > cap * 0.75) {
              const thr = cap * 0.75;
              cap *= 2;
              const nb = Array.from({ length: cap }, () => []);
              for (const list of b) for (const s of list) nb[bucketOf(javaHash(s), cap)].push(s);
              b = nb;
              fr.push(snap({ resized: true, msg: `size ${size} &gt; ${thr} (8 × 0.75). <span class="bad">Resize:</span> ${cap} buckets, and every key moves to its new bucket. O(n) once, then lookups stay short.` }));
            }
          }
          const k = 'nar', x = javaHash(k), i = bucketOf(x, cap);
          fr.push(snap({ hot: i, key: k, find: true, msg: `${code('map["nar"]')}: hash → bucket ${i}, compare ${b[i].length} key${b[i].length > 1 ? 's' : ''} with equals(). The other ${cap - 1} buckets are never touched.` }));
          return fr;
        },
        paint(f) {
          box.replaceChildren(h('div', { class: 'dsa-buckets' }, f.b.map((list, i) => h('div', { class: `dsa-bucket ${i === f.hot ? (f.col ? 'dsa-hot' : f.find ? 'dsa-ok' : 'dsa-on') : ''}` },
            h('span', { class: 'dsa-bi' }, String(i)),
            list.map(s => pill(s, `dsa-sm ${s === f.key && i === f.hot ? (f.find ? 'dsa-ok' : 'dsa-acc dsa-flash') : ''} ${f.resized ? 'dsa-flash' : ''}`))))));
          st.set('size', f.size); st.set('buckets', f.cap); st.set('resize after', f.cap * 0.75);
        },
      });
    },
    deeper: [
      {
        title: 'The equals and hashCode contract',
        body: `<p>A hash map first picks the bucket with <code>hashCode()</code>, then compares keys in it with <code>equals()</code>. A plain class inherits identity versions of both, so two <code>Point(1, 2)</code> objects are different keys. A <code>data class</code> generates both from the properties in its primary constructor, so equal points get equal hash codes.</p>
<p>The rule: if two objects are equal, their hash codes must be equal. Override one, override both. Add the same point twice under each declaration and see what the set does.</p>`,
        visual(el) {
          let data = false, set = [], ids = 0;
          const ID = [0x1b6d3586, 0x4554617c, 0x74a14482, 0x1540e19d, 0x677327b6, 0x14ae5a5];
          const decl = h('div', { class: 'kt' });
          const box = h('div', {});
          const o = out('');
          const hashOf = () => (data ? 31 * 1 + 2 : ID[ids++ % ID.length]);
          const hex = x => (data ? String(x) : `0x${x.toString(16)}`);
          function paint(hot) {
            decl.innerHTML = hl(`${data ? 'data ' : ''}class Point(val x: Int, val y: Int)`);
            box.replaceChildren(h('div', { class: 'dsa-buckets' }, [0, 1, 2, 3].map(i => h('div', { class: `dsa-bucket ${i === hot ? 'dsa-on' : ''}` }, h('span', { class: 'dsa-bi' }, String(i)),
              set.filter(p => (p.hash & 3) === i).map(p => pill(`Point(1, 2) #${hex(p.hash)}`, 'dsa-sm'))))));
          }
          function add() {
            const hash = hashOf(), i = hash & 3;
            const same = set.find(p => (p.hash & 3) === i && (data || false));
            if (same) { paint(i); say(o, `${hl('set.add(Point(1, 2))')} <span class="muted">→ hash ${hex(hash)}, bucket ${i}, equals() true →</span> <span class="good">false</span> <span class="muted">(already there, size ${set.length})</span>`); return; }
            set.push({ hash }); paint(i);
            say(o, `${hl('set.add(Point(1, 2))')} <span class="muted">→ hash ${hex(hash)}, bucket ${i} →</span> <span class="${set.length > 1 ? 'bad' : 'good'}">true</span> <span class="muted">(size ${set.length})</span>`);
          }
          function has() {
            const hash = hashOf(), i = hash & 3;
            const hit = data && set.some(p => (p.hash & 3) === i);
            paint(i);
            say(o, `${hl('Point(1, 2) in set')} <span class="muted">→ hash ${hex(hash)}, look in bucket ${i} →</span> <span class="${hit ? 'good' : 'bad'}">${hit}</span>${!data && set.length ? ' <span class="muted">(identity hash: a new object, so a new hash)</span>' : ''}`);
          }
          const decls = [cmd('class Point', () => pick(false)), cmd('data class Point', () => pick(true))];
          function pick(d) { data = d; set = []; ids = 0; press(decls, decls[d ? 1 : 0]); paint(-1); say(o, d ? 'data class: hashCode() = 31 × x + y = 33, equals() compares x and y.' : 'Plain class: hashCode() and equals() use object identity.'); }
          el.append(h('div', { class: 'controls' }, label('declare'), decls), decl,
            h('div', { class: 'dsa-stage' }, label('hashSetOf<Point>(), 4 buckets'), box),
            h('div', { class: 'controls' }, cmd('set.add(Point(1, 2))', add), cmd('Point(1, 2) in set', has)), o);
          pick(false);
        },
      },
      {
        title: 'Iteration order: HashMap vs LinkedHashMap',
        body: `<p><code>mapOf()</code>, <code>mutableMapOf()</code>, <code>setOf()</code> and <code>mutableSetOf()</code> give you a <code>LinkedHashMap</code> or <code>LinkedHashSet</code>. They keep a linked list through the entries, so iteration follows insertion order. <code>hashMapOf()</code> and <code>HashSet()</code> promise no order and use a little less memory.</p>
<p>If you need keys sorted, <code>sortedMapOf()</code> gives a <code>TreeMap</code>, where operations are O(log n).</p>`,
        code: `val linked = mutableMapOf("c" to 3, "a" to 1, "b" to 2)   // LinkedHashMap
println(linked.keys)    // [c, a, b]: insertion order

val plain = hashMapOf("c" to 3, "a" to 1, "b" to 2)       // HashMap
println(plain.keys)     // bucket order, not insertion order. Don't rely on it.

val sorted = sortedMapOf("c" to 3, "a" to 1, "b" to 2)    // TreeMap, O(log n)
println(sorted.keys)    // [a, b, c]`,
      },
      {
        title: 'Never change a key while it is in a map',
        body: `<p>The map files an entry under the hash the key had when you put it in. If you then change a field that <code>hashCode()</code> uses, the entry sits in the old bucket while lookups go to the new one. The entry is lost. Keys should be immutable: use <code>val</code> properties.</p>`,
        code: `data class Tag(var name: String)

val tags = hashSetOf(Tag("kotlin"))
val t = tags.first()
t.name = "android"                // its hashCode changes; the entry stays where it was
println(Tag("android") in tags)   // false
println(t in tags)                // false, even though t is in the set`,
      },
    ],
    underHood: {
      body: `<p>On the JVM, <code>HashMap</code> keeps a table whose size is a power of two, 16 by default. The bucket index is <code>(h xor (h ushr 16)) and (size - 1)</code>: mixing in the high bits helps keys whose hash codes differ only in high bits. Each bucket is a chain of nodes. When one bucket reaches 8 nodes and the table has at least 64 buckets, that bucket turns into a small red-black tree, so even a bad hash degrades to O(log n) in that bucket instead of O(n).</p>`,
      code: `// java.util.HashMap, simplified
fun indexFor(key: Any?, tableSize: Int): Int {
    val h = key?.hashCode() ?: 0
    val spread = h xor (h ushr 16)        // mix high bits into low bits
    return spread and (tableSize - 1)     // tableSize is a power of two
}`,
    },
    mistakes: [
      { title: 'Overriding equals without hashCode', bad: 'class Email(val value: String) {\n    override fun equals(other: Any?) =\n        other is Email && other.value.equals(value, ignoreCase = true)\n}', good: 'class Email(val value: String) {\n    override fun equals(other: Any?) =\n        other is Email && other.value.equals(value, ignoreCase = true)\n    override fun hashCode() = value.lowercase().hashCode()\n}', why: 'Two equal emails would get different identity hash codes and land in different buckets, so a set keeps both. The hash must use the same rule as <code>equals</code>.' },
      { title: 'Counting with containsKey and !!', bad: 'val counts = mutableMapOf<String, Int>()\nfor (w in words) {\n    if (counts.containsKey(w)) counts[w] = counts[w]!! + 1\n    else counts[w] = 1\n}', good: 'val counts = words.groupingBy { it }.eachCount()\n// or, in a loop: counts[w] = (counts[w] ?: 0) + 1', why: 'The first version hashes the key up to three times and needs <code>!!</code>. <code>groupingBy { }.eachCount()</code> says what you mean in one line.' },
    ],
    terms: [
      { term: 'Hash code', def: 'An Int computed from an object, used by hash maps and sets to pick a bucket.' },
      { term: 'Bucket', def: 'One slot in a hash table’s array, holding every entry whose hash maps to that index.' },
      { term: 'Collision', def: 'Two different keys landing in the same bucket; equals() is used to tell them apart.' },
      { term: 'Load factor', def: 'How full a hash table may get before it grows; the JVM HashMap default is 0.75.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Count every word in one line, then detect a repeat with a set in O(1).', code: 'val counts = words.[[groupingBy]] { it }.[[eachCount]]()\nval seen = HashSet<String>()\nif (!seen.[[add]](word)) println("repeat")', why: '<code>groupingBy { it }.eachCount()</code> builds a <code>Map&lt;String, Int&gt;</code>. <code>add</code> returns <code>false</code> when the element was already in the set.' },
      { type: 'bug', prompt: 'Two <code>Money(100, "TRY")</code> objects are equal, but the set keeps both. Tap the line to change.', code: 'class Money(val amount: Long, val currency: String) {\n    override fun equals(other: Any?) =\n        other is Money && amount == other.amount && currency == other.currency\n}\nval set = hashSetOf(Money(100, "TRY"), Money(100, "TRY"))\nprintln(set.size)   // 2', bug: 0, fix: 'data class Money(val amount: Long, val currency: String) {', why: '<code>equals</code> is overridden but <code>hashCode</code> is not, so the two objects get different identity hashes. A <code>data class</code> generates a matching <code>hashCode</code> (or you write one by hand).' },
    ],
    quiz: [
      { q: 'Two keys land in the same bucket. What does HashMap use to tell them apart?', options: ['hashCode()', 'equals()', 'toString()'], a: 1, why: 'The hash code only picks the bucket. Inside it, keys are compared with <code>equals()</code>.' },
      { q: 'Which of these keeps insertion order when you iterate?', options: ['hashMapOf()', 'mutableMapOf()', 'HashSet()'], a: 1, why: '<code>mutableMapOf()</code> returns a <code>LinkedHashMap</code>.' },
      { q: 'Why is HashMap.get O(1) only on average?', options: ['Because of garbage collection', 'If many keys collide in one bucket, the map has to search that bucket', 'Because Strings are immutable'], a: 1, why: 'With a good hash, buckets hold one or two keys. With a bad one, many keys pile into one bucket.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  lessons.push({
    id: 'stacks-queues',
    title: 'Stacks and queues',
    tagline: 'Last in, first out for undo and brackets. First in, first out for BFS and jobs.',
    level: 'beginner',
    body: `
<p>A <em>stack</em> gives back the last thing you put in (LIFO). Think of an app’s back stack: the screen you opened last closes first. A <em>queue</em> gives back the oldest thing (FIFO), like jobs waiting in line.</p>
<p>In Kotlin, use <code>ArrayDeque</code> for both. It is a ring buffer over an array, so adding and removing at either end is O(1) amortized. As a stack: <code>addLast</code> and <code>removeLast</code>. As a queue: <code>addLast</code> and <code>removeFirst</code>.</p>
<p>A classic stack problem: are the brackets balanced? Push every opener. On a closer, pop and check that it matches. At the end the stack must be empty. Pick an input and step through it.</p>`,
    code: `fun isBalanced(s: String): Boolean {
    val pairs = mapOf(')' to '(', ']' to '[', '}' to '{')
    val stack = ArrayDeque<Char>()
    for (c in s) {
        when (c) {
            '(', '[', '{' -> stack.addLast(c)
            ')', ']', '}' -> if (stack.removeLastOrNull() != pairs[c]) return false
        }
    }
    return stack.isEmpty()
}

// Queue: first in, first out
val jobs = ArrayDeque<String>()
jobs.addLast("upload")
jobs.addLast("sync")
jobs.removeFirst()   // "upload"`,
    remember: 'ArrayDeque for both: addLast + removeLast is a stack, addLast + removeFirst is a queue.',
    visual(el) {
      let input = '{[()()]}';
      const chars = h('div', {});
      const stack = h('div', { class: 'dsa-stack' });
      const PAIR = { ')': '(', ']': '[', '}': '{' };
      const p = player(el, {
        top: picker('input', [{ src: '"{[()()]}"', s: '{[()()]}' }, { src: '"([)]"', s: '([)]' }, { src: '"(()"', s: '(()' }], it => { input = it.s; p.reset(); }),
        view: h('div', { class: 'dsa-split' }, h('div', { class: 'dsa-col' }, label('string'), chars), h('div', { class: 'dsa-col' }, label('stack'), stack)),
        speed: 700,
        build() {
          const st = [], fr = [{ i: -1, st: [], msg: `isBalanced("${input}"). The stack starts empty.` }];
          for (let i = 0; i < input.length; i++) {
            const c = input[i];
            if ('([{'.includes(c)) { st.push(c); fr.push({ i, st: [...st], push: true, msg: `'${c}' opens: addLast('${c}').` }); continue; }
            const top = st.pop();
            if (top !== PAIR[c]) { fr.push({ i, st: [...st], bad: true, msg: `'${c}' closes, but the top was ${top ? `'${top}'` : 'nothing'}. <span class="bad">return false</span>` }); return fr; }
            fr.push({ i, st: [...st], ok: true, msg: `'${c}' closes: removeLast() gives '${top}', it matches.` });
          }
          const empty = st.length === 0;
          fr.push({ i: input.length, st: [...st], end: true, bad: !empty, msg: empty ? 'End of string and the stack is empty. <span class="good">return true</span>' : `End of string, but ${st.length} opener${st.length > 1 ? 's are' : ' is'} still on the stack. <span class="bad">return false</span>` });
          return fr;
        },
        paint(f) {
          chars.replaceChildren(cellRow([...input].map((c, k) => ({ v: c, cls: k === f.i ? (f.bad ? 'dsa-bad' : 'dsa-on') : k < f.i ? 'dsa-dim' : '', tag: k === f.i ? '↑' : '' }))));
          stack.replaceChildren(...f.st.map((c, k) => pill(c, k === f.st.length - 1 ? `dsa-acc ${f.push ? 'dsa-flash' : ''}` : '')));
          if (f.end) replay(stack, f.bad ? 'shake' : 'pop-soft');
        },
      });
    },
    deeper: [
      {
        title: 'ArrayDeque is a ring',
        body: `<p>Inside, <code>ArrayDeque</code> keeps an array and the index of the first element, <code>head</code>. <code>addFirst</code> steps <code>head</code> back by one and wraps around to the end of the array. <code>addLast</code> writes after the last element, also wrapping. Nothing ever shifts, so both ends are O(1). When the array fills up, it grows and copies once, like <code>ArrayList</code>.</p>
<p>Try the calls and watch the indexes wrap. (Simplified: this ring has a fixed 8 slots and refuses to grow.)</p>`,
        visual(el) {
          const CAP = 8;
          let buf = Array(CAP).fill(null), head = 0, size = 0, n = 0;
          const ring = h('div', {});
          const logical = h('div', { class: 'kt' });
          const o = out('');
          function paint(at) {
            const tail = (head + size - 1 + CAP) % CAP;
            ring.replaceChildren(cellRow(buf.map((v, k) => ({ v: v ?? '', cls: v == null ? 'dsa-empty' : k === at ? 'dsa-on dsa-flash' : '', tag: size && k === head && k === tail ? 'head/last' : size && k === head ? 'head' : size && k === tail ? 'last' : '' }))));
            const items = []; for (let k = 0; k < size; k++) items.push(buf[(head + k) % CAP]);
            logical.innerHTML = hl(`deque = [${items.join(', ')}]`);
          }
          const full = c => { say(o, `${hl(c)} <span class="muted">→</span> <span class="bad">full</span> <span class="muted">(a real ArrayDeque would grow and copy here)</span>`); };
          const empty = c => { say(o, `${hl(c)} <span class="muted">→</span> <span class="bad">NoSuchElementException</span> <span class="muted">(empty; removeFirstOrNull() returns null instead)</span>`); };
          el.append(h('div', { class: 'dsa-stage' }, label('backing array, 8 slots'), ring, logical),
            h('div', { class: 'controls' },
              cmd('addLast(n)', () => { if (size === CAP) return full('addLast(n)'); const k = (head + size) % CAP; buf[k] = ++n; size++; paint(k); say(o, `${hl(`addLast(${n})`)} <span class="muted">→ slot ${k}</span>`); }),
              cmd('addFirst(n)', () => { if (size === CAP) return full('addFirst(n)'); head = (head - 1 + CAP) % CAP; buf[head] = ++n; size++; paint(head); say(o, `${hl(`addFirst(${n})`)} <span class="muted">→ head moves back to slot ${head}${head === CAP - 1 ? ', wrapping around' : ''}</span>`); }),
              cmd('removeFirst()', () => { if (!size) return empty('removeFirst()'); const v = buf[head]; buf[head] = null; head = (head + 1) % CAP; size--; if (!size) head = 0; paint(-1); say(o, `${hl('removeFirst()')} <span class="muted">→</span> ${v}`); }),
              cmd('removeLast()', () => { if (!size) return empty('removeLast()'); const k = (head + size - 1) % CAP; const v = buf[k]; buf[k] = null; size--; if (!size) head = 0; paint(-1); say(o, `${hl('removeLast()')} <span class="muted">→</span> ${v}`); })),
            o);
          paint(-1); say(o, 'Add from both ends. addFirst on an empty ring wraps straight to slot 7.');
        },
      },
      {
        title: 'A queue drives BFS',
        body: `<p>Breadth-first search (BFS) visits things in rings of distance: everything 1 step away, then everything 2 steps away, and so on. The queue makes that happen. Take from the front, add new neighbours to the back, and the order sorts itself out. In a grid maze, the first time BFS reaches a cell is along a shortest path.</p>`,
        visual(el) {
          const MAP = ['S..#..', '.#.#.#', '.#....', '...##.', '##...G'];
          const R = MAP.length, C = MAP[0].length;
          const sq = [];
          const grid = h('div', { class: 'dsa-grid', style: `--c:${C}` }, MAP.map((row, r) => [...row].map((ch, c) => { const s = h('div', { class: `dsa-sq ${ch === '#' ? 'dsa-wall' : ''}` }); sq.push(s); return s; })));
          const queue = h('div', { class: 'dsa-queue' });
          player(el, {
            view: [grid, label('queue (front → back)'), queue], speed: 550,
            build() {
              const dist = {}, par = {}, key = (r, c) => `${r},${c}`;
              const q = [[0, 0]];
              dist[key(0, 0)] = 0;
              const snap = o => ({ dist: { ...dist }, q: q.map(x => key(...x)), ...o });
              const fr = [snap({ msg: 'Start S has distance 0 and is the only cell in the queue.' })];
              while (q.length) {
                const [r, c] = q.shift();
                const d = dist[key(r, c)];
                if (MAP[r][c] === 'G') {
                  const path = []; let k = key(r, c); while (k) { path.push(k); k = par[k]; }
                  fr.push(snap({ cur: key(r, c), path, msg: `Took G from the queue at distance <b>${d}</b>. Following the parents back gives a shortest path.` }));
                  return fr;
                }
                const added = [];
                for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                  const nr = r + dr, nc = c + dc;
                  if (nr < 0 || nc < 0 || nr >= R || nc >= C || MAP[nr][nc] === '#' || dist[key(nr, nc)] !== undefined) continue;
                  dist[key(nr, nc)] = d + 1; par[key(nr, nc)] = key(r, c); q.push([nr, nc]); added.push(key(nr, nc));
                }
                fr.push(snap({ cur: key(r, c), added, msg: `removeFirst() → (${r},${c}), distance ${d}. ${added.length ? `addLast ${added.map(a => `(${a})`).join(' ')} at distance ${d + 1}.` : 'No new neighbours.'}` }));
              }
              return fr;
            },
            paint(f) {
              let k = 0;
              for (let r = 0; r < R; r++) for (let c = 0; c < C; c++, k++) {
                if (MAP[r][c] === '#') continue;
                const id = `${r},${c}`, d = f.dist[id];
                const cls = f.path && f.path.includes(id) ? 'dsa-ok' : id === f.cur ? 'dsa-hot' : f.q.includes(id) ? 'dsa-on' : d !== undefined ? 'dsa-dim' : '';
                sq[k].className = `dsa-sq ${cls}`;
                sq[k].textContent = MAP[r][c] === 'G' && d === undefined ? 'G' : d !== undefined ? String(d) : '';
              }
              queue.replaceChildren(...(f.q.length ? f.q.map(id => pill(`(${id})`, `dsa-sm ${f.added && f.added.includes(id) ? 'dsa-acc dsa-flash' : ''}`)) : [pill('empty', 'dsa-sm dsa-ghost')]));
            },
          });
        },
        code: `fun stepsTo(grid: List<String>, start: Pair<Int, Int>, goal: Pair<Int, Int>): Int {
    val dist = mutableMapOf(start to 0)
    val queue = ArrayDeque(listOf(start))
    while (queue.isNotEmpty()) {
        val cell = queue.removeFirst()
        if (cell == goal) return dist.getValue(cell)
        val (r, c) = cell
        for ((dr, dc) in listOf(0 to 1, 1 to 0, 0 to -1, -1 to 0)) {
            val next = r + dr to c + dc
            val open = grid.getOrNull(next.first)?.getOrNull(next.second)?.let { it != '#' } == true
            if (open && next !in dist) {
                dist[next] = dist.getValue(cell) + 1
                queue.addLast(next)
            }
        }
    }
    return -1
}`,
      },
      {
        title: 'Monotonic stack: the next warmer day',
        body: `<p>A popular interview pattern keeps a stack whose values only go one way, here decreasing from bottom to top. For each day, pop every colder day still waiting on the stack: today is their answer. Every index is pushed once and popped at most once, so the whole thing is O(n) even with a loop inside a loop.</p>`,
        code: `// For each day, how many days until a warmer one? 0 if never.
fun daysUntilWarmer(temps: IntArray): IntArray {
    val answer = IntArray(temps.size)
    val waiting = ArrayDeque<Int>()          // indexes; their temps decrease bottom to top
    for (i in temps.indices) {
        while (waiting.isNotEmpty() && temps[waiting.last()] < temps[i]) {
            val j = waiting.removeLast()
            answer[j] = i - j
        }
        waiting.addLast(i)
    }
    return answer
}`,
      },
    ],
    mistakes: [
      { title: 'list.removeLast() with compileSdk 35', bad: 'val history = mutableListOf<Screen>()\n// compileSdk = 35, minSdk = 24\nhistory.removeLast()   // NoSuchMethodError on Android 14 and lower', good: 'history.removeAt(history.lastIndex)\n// or keep the history in an ArrayDeque<Screen>() and call its removeLast()', why: 'Android 15 added <code>List.removeFirst()</code> and <code>removeLast()</code> to Java’s <code>List</code>. With <code>compileSdk</code> 35, Kotlin resolves the call to that new Java method, which older devices don’t have. Lint’s <code>NewApi</code> check flags it.' },
      { title: 'Using java.util.Stack', bad: 'val stack = java.util.Stack<Int>()\nstack.push(1)\nstack.pop()', good: 'val stack = ArrayDeque<Int>()\nstack.addLast(1)\nstack.removeLast()', why: '<code>Stack</code> extends the old <code>Vector</code> class, and every method is synchronized. Its own Javadoc points to the <code>Deque</code> interface instead.' },
      { title: 'removeFirst() on an empty queue', bad: 'val next = queue.removeFirst()   // throws if empty', good: 'val next = queue.removeFirstOrNull() ?: return', why: '<code>removeFirst()</code> throws <code>NoSuchElementException</code> on an empty deque. The <code>OrNull</code> versions let you handle the empty case with <code>?:</code>.' },
    ],
    terms: [
      { term: 'Stack (LIFO)', def: 'A collection where the last element added is the first one removed.' },
      { term: 'Queue (FIFO)', def: 'A collection where the first element added is the first one removed.' },
      { term: 'Deque', def: 'A double-ended queue that supports adding and removing at both ends.' },
      { term: 'Ring buffer', def: 'An array used in a circle: indexes wrap around from the end to the start, so nothing has to shift.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Use the ArrayDeque as a queue: add at the back, take from the front.', code: 'val queue = ArrayDeque<Int>()\nqueue.[[addLast]](1)\nqueue.addLast(2)\nval first = queue.[[removeFirst|removeFirstOrNull]]()   // 1', why: 'A queue adds at one end and removes at the other. With <code>addLast</code>, the oldest item is at the front.' },
      { type: 'bug', prompt: '<code>isBalanced("((")</code> returns true. Tap the broken line.', code: 'fun isBalanced(s: String): Boolean {\n    val stack = ArrayDeque<Char>()\n    for (c in s) {\n        if (c == \'(\') stack.addLast(c)\n        else if (stack.removeLastOrNull() != \'(\') return false\n    }\n    return true\n}', bug: 6, fix: '    return stack.isEmpty()', why: 'Openers that were never closed are still on the stack. The string is balanced only if the stack is empty at the end.' },
    ],
    quiz: [
      { q: 'You push A, then B, then C onto a stack and pop once. What comes out?', options: ['A', 'B', 'C'], a: 2, why: 'Last in, first out: C was pushed last.' },
      { q: 'Which structure does BFS use to pick the next node?', options: ['A stack', 'A queue', 'A hash map'], a: 1, why: 'A queue hands out nodes in the order they were found, which is the order of their distance.' },
      { q: 'Why prefer ArrayDeque over LinkedList for a queue?', options: ['It is thread-safe', 'Its elements sit in one array: less memory, faster walks, still O(1) at both ends', 'It keeps elements sorted'], a: 1, why: 'Neither is thread-safe. <code>ArrayDeque</code> avoids one node object per element.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  lessons.push({
    id: 'two-pointers',
    title: 'Two pointers and sliding window',
    tagline: 'Move two indexes instead of trying every pair, and O(n²) becomes O(n).',
    level: 'intermediate',
    body: `
<p>Many array problems ask about pairs or ranges. Trying every pair is O(n²). Often you can keep two indexes instead and move them by a rule, so each index walks the array at most once: O(n).</p>
<p><em>Two pointers from both ends</em>: in a sorted array, to find two numbers that add up to a target, start with <code>left</code> at the first item and <code>right</code> at the last. Sum too small? Move <code>left</code> right to get a bigger number. Too big? Move <code>right</code> left. Each move throws away every pair that the dropped item could be part of.</p>
<p><em>Sliding window</em>: both pointers move the same way and the range between them is the window. Grow the right edge, shrink the left edge when a rule breaks, and update the answer as you go. Go deeper below for both kinds of window.</p>`,
    code: `// nums is sorted. Returns the indexes of two numbers that add up to target, or null.
fun pairWithSum(nums: IntArray, target: Int): Pair<Int, Int>? {
    var left = 0
    var right = nums.lastIndex
    while (left < right) {
        val sum = nums[left] + nums[right]
        when {
            sum == target -> return left to right
            sum < target -> left++      // need a bigger number
            else -> right--             // need a smaller number
        }
    }
    return null
}`,
    remember: 'Each pointer only moves in one direction, so the whole scan is O(n).',
    visual(el) {
      const A = [1, 3, 4, 6, 8, 11, 14, 17];
      let target = 14;
      const row = h('div', {});
      const st = stats(['steps', 'pairs a brute force checks']);
      const p = player(el, {
        top: picker('target', [{ src: '14', t: 14 }, { src: '25', t: 25 }, { src: '16', t: 16 }], it => { target = it.t; p.reset(); }),
        view: [label('nums (sorted)'), row, st], speed: 750,
        build() {
          let l = 0, r = A.length - 1, steps = 0;
          const fr = [{ l, r, steps, msg: `pairWithSum(nums, ${target}). left starts at index 0, right at index ${r}.` }];
          while (l < r) {
            const s = A[l] + A[r];
            steps++;
            if (s === target) { fr.push({ l, r, steps, found: true, msg: `${A[l]} + ${A[r]} = ${s}. <span class="good">Found: return ${l} to ${r}</span>` }); return fr; }
            if (s < target) { fr.push({ l, r, steps, msg: `${A[l]} + ${A[r]} = ${s} &lt; ${target}: too small. ${A[l]} can’t reach ${target} with anything, so left++.` }); l++; }
            else { fr.push({ l, r, steps, msg: `${A[l]} + ${A[r]} = ${s} &gt; ${target}: too big. ${A[r]} is too big with anything left, so right--.` }); r--; }
            fr.push({ l, r, steps, msg: null });
          }
          fr.push({ l, r, steps, none: true, msg: `left met right. <span class="bad">No pair adds up to ${target}: return null.</span> ${steps} sums checked instead of 28.` });
          return fr;
        },
        paint(f) {
          row.replaceChildren(cellRow(A.map((v, k) => ({ v, cls: k < f.l || k > f.r ? 'dsa-dim' : f.found && (k === f.l || k === f.r) ? 'dsa-ok dsa-flash' : k === f.l || k === f.r ? 'dsa-on' : '', tag: [k === f.l && 'L', k === f.r && 'R'].filter(Boolean).join(' ') }))));
          st.set('steps', f.steps); st.set('pairs a brute force checks', 28);
        },
      });
    },
    deeper: [
      {
        title: 'Fixed window: best sum of k in a row',
        body: `<p>The best total of 3 days in a row: recomputing each window’s sum is O(n × k). Instead, slide: add the item that enters on the right, subtract the one that leaves on the left. Each step is O(1), so the scan is O(n).</p>`,
        visual(el) {
          const A = [2, 1, 5, 1, 3, 2, 9, 1], K = 3;
          const row = h('div', {});
          const st = stats(['window sum', 'best']);
          player(el, {
            view: [label('nums, k = 3'), row, st], speed: 750,
            build() {
              let w = A[0] + A[1] + A[2], best = w;
              const fr = [{ l: 0, r: 2, w, best, msg: `First window: 2 + 1 + 5 = ${w}. best = ${w}.` }];
              for (let r = K; r < A.length; r++) {
                const l = r - K + 1;
                w += A[r] - A[r - K];
                const better = w > best; best = Math.max(best, w);
                fr.push({ l, r, w, best, better, out: r - K, msg: `+${A[r]} enters, −${A[r - K]} leaves: sum ${w}.${better ? ` <span class="good">New best: ${best}</span>` : ''}` });
              }
              fr[fr.length - 1].msg += ` Done after ${A.length - K + 1} windows, one add and one subtract each.`;
              return fr;
            },
            paint(f) {
              row.replaceChildren(cellRow(A.map((v, k) => ({ v, cls: k >= f.l && k <= f.r ? (f.better ? 'dsa-ok' : 'dsa-on') : k === f.out ? 'dsa-hot' : '', tag: k === f.r ? 'in' : k === f.out ? 'out' : '' }))));
              st.set('window sum', f.w); st.set('best', f.best);
            },
          });
        },
        code: `fun maxSumOfK(nums: IntArray, k: Int): Int {
    var window = nums.take(k).sum()
    var best = window
    for (right in k until nums.size) {
        window += nums[right] - nums[right - k]   // add the new one, drop the old one
        best = maxOf(best, window)
    }
    return best
}

// Short version with the stdlib. O(n × k), fine for small k.
val best = nums.toList().windowed(3) { it.sum() }.max()`,
      },
      {
        title: 'Growing and shrinking: longest run without repeats',
        body: `<p>When the window size isn’t fixed, grow the right edge one step at a time. If the new item breaks the rule (here: a repeated letter), shrink from the left until the rule holds again. A set remembers what is inside the window.</p>
<p>The inner <code>while</code> loop looks like O(n²), but <code>left</code> only moves forward. Each letter enters the window once and leaves at most once: O(n) in total.</p>`,
        visual(el) {
          const S = 'dvdfabca';
          const row = h('div', {});
          const set = h('div', { class: 'dsa-queue' });
          const st = stats(['window', 'best']);
          player(el, {
            view: [label(`s = "${S}"`), row, label('inWindow set'), set, st], speed: 650,
            build() {
              const inW = new Set(), fr = [{ l: 0, r: -1, set: [], best: 0, msg: 'Empty window. Grow right one letter at a time.' }];
              let l = 0, best = 0;
              for (let r = 0; r < S.length; r++) {
                while (inW.has(S[r])) { fr.push({ l, r, set: [...inW], best, dup: true, msg: `'${S[r]}' is already in the window. Remove '${S[l]}' and move left.` }); inW.delete(S[l]); l++; }
                inW.add(S[r]);
                const better = r - l + 1 > best; best = Math.max(best, r - l + 1);
                fr.push({ l, r, set: [...inW], best, better, msg: `Add '${S[r]}': window "${S.slice(l, r + 1)}", length ${r - l + 1}.${better ? ` <span class="good">best = ${best}</span>` : ''}` });
              }
              fr.push({ l, r: S.length - 1, set: [...inW], best, msg: `Done: the longest run without repeats has <b>${best}</b> letters ("vdfabc").` });
              return fr;
            },
            paint(f) {
              row.replaceChildren(cellRow([...S].map((c, k) => ({ v: c, cls: k === f.r && f.dup ? 'dsa-bad' : k >= f.l && k <= f.r ? (f.better ? 'dsa-ok' : 'dsa-on') : '', tag: [k === f.l && 'L', k === f.r && 'R'].filter(Boolean).join(' ') }))));
              set.replaceChildren(...(f.set.length ? f.set.map(c => pill(`'${c}'`, 'dsa-sm')) : [pill('empty', 'dsa-sm dsa-ghost')]));
              st.set('window', Math.max(0, f.r - f.l + 1)); st.set('best', f.best);
            },
          });
        },
        code: `fun longestUnique(s: String): Int {
    val inWindow = HashSet<Char>()
    var left = 0
    var best = 0
    for (right in s.indices) {
        while (s[right] in inWindow) {      // shrink until the repeat is gone
            inWindow.remove(s[left])
            left++
        }
        inWindow.add(s[right])
        best = maxOf(best, right - left + 1)
    }
    return best
}`,
      },
      {
        title: 'Same direction: slow and fast pointers',
        body: `<p>Another shape: <code>fast</code> reads every item, <code>slow</code> marks where the next item to keep goes. This edits an array in place with O(1) extra space. Removing duplicates from a sorted array is the classic example.</p>`,
        code: `// nums is sorted. Keeps one copy of each value at the front, returns how many.
fun dedupe(nums: IntArray): Int {
    if (nums.isEmpty()) return 0
    var slow = 0
    for (fast in 1 until nums.size) {
        if (nums[fast] != nums[slow]) {
            slow++
            nums[slow] = nums[fast]
        }
    }
    return slow + 1
}`,
      },
    ],
    mistakes: [
      { title: 'Two pointers on unsorted data', bad: 'pairWithSum(intArrayOf(3, 8, 1, 6), 7)   // null, but 1 + 6 = 7', good: 'fun pairWithSum(nums: IntArray, target: Int): Pair<Int, Int>? {\n    val seen = HashMap<Int, Int>()          // value -> index\n    for ((i, x) in nums.withIndex()) {\n        seen[target - x]?.let { return it to i }\n        seen[x] = i\n    }\n    return null\n}', why: 'The pointer rule only works because the array is sorted. For unsorted input, a hash map of “what I need” finds the pair in one pass and keeps the original indexes.' },
      { title: 'Recomputing every window', bad: 'for (i in 0..nums.size - k) {\n    best = maxOf(best, nums.slice(i until i + k).sum())   // O(n × k)\n}', good: 'var window = nums.take(k).sum()\nfor (right in k until nums.size) {\n    window += nums[right] - nums[right - k]               // O(1) per step\n    best = maxOf(best, window)\n}', why: 'Neighbouring windows share k − 1 items. Update the sum with what enters and what leaves instead of adding everything again.' },
    ],
    terms: [
      { term: 'Two pointers', def: 'A technique that moves two indexes through an array by a rule, instead of checking every pair.' },
      { term: 'Sliding window', def: 'A range [left, right] that moves through an array, growing on the right and shrinking on the left.' },
      { term: 'Complement', def: 'The value still needed to reach a target, target − x, often looked up in a hash map.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Finish the pointer moves for a sorted array.', code: 'while (left < right) {\n    val sum = nums[left] + nums[right]\n    when {\n        sum == target -> return left to right\n        sum < target -> [[left++|left += 1]]\n        else -> [[right--|right -= 1]]\n    }\n}', why: 'A small sum needs a bigger left number, so <code>left</code> moves right. A big sum needs a smaller right number, so <code>right</code> moves left.' },
      { type: 'bug', prompt: '<code>maxSumOfK(intArrayOf(1, 2, 3, 4), 2)</code> should be 7 but returns 5. Tap the broken line.', code: 'fun maxSumOfK(nums: IntArray, k: Int): Int {\n    var window = nums.take(k).sum()\n    var best = window\n    for (right in k until nums.size) {\n        window += nums[right] - nums[right - 1]\n        best = maxOf(best, window)\n    }\n    return best\n}', bug: 4, fix: '        window += nums[right] - nums[right - k]', why: 'The item leaving the window is <code>k</code> places behind the one entering, not 1.' },
    ],
    quiz: [
      { q: 'Two pointers from both ends rely on what?', options: ['The array is sorted', 'The array has no duplicates', 'The array size is even'], a: 0, why: 'Sorting is what tells you which pointer to move when the sum is too small or too big.' },
      { q: 'Why is a sliding window O(n) even with a while loop inside the for loop?', options: ['The while loop runs at most once', 'Each item enters the window once and leaves at most once', 'Kotlin optimizes the loop'], a: 1, why: '<code>left</code> never moves back, so all the inner loop runs add up to at most n steps.' },
      { q: 'Sorted array, pointers at both ends, the sum is too small. What moves?', options: ['left moves right', 'right moves left', 'both move'], a: 0, why: 'Only a bigger left value can raise the sum.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  lessons.push({
    id: 'binary-search',
    title: 'Binary search',
    tagline: 'Halve a sorted range on every check: a million items take about 20.',
    level: 'intermediate',
    body: `
<p>Binary search finds a value in a <em>sorted</em> list by checking the middle. If the middle is too small, the answer can only be on the right, so drop the left half. Too big, drop the right half. Each check halves the range, so it is O(log n).</p>
<p>The idea is simple; the details cause bugs. Decide what <code>lo</code> and <code>hi</code> mean and keep that true on every step. Below, both ends are inclusive: if the target exists, it is somewhere in <code>lo..hi</code>. So the loop runs <code>while (lo &lt;= hi)</code> and moves to <code>mid + 1</code> or <code>mid - 1</code>, never to <code>mid</code> itself.</p>
<p>Kotlin already has it: <code>list.binarySearch(x)</code> returns the index, or <code>-(insertion point) - 1</code> when the value is missing. Pick 40 in the demo to see that number.</p>`,
    code: `fun indexOf(sorted: IntArray, target: Int): Int {
    var lo = 0
    var hi = sorted.lastIndex             // inclusive: the target is in lo..hi
    while (lo <= hi) {
        val mid = (lo + hi) ushr 1        // no overflow, even near Int.MAX_VALUE
        when {
            sorted[mid] == target -> return mid
            sorted[mid] < target -> lo = mid + 1
            else -> hi = mid - 1
        }
    }
    return -(lo + 1)                      // same convention as the stdlib
}

val prices = listOf(5, 12, 23, 45, 72)
prices.binarySearch(23)                   // 2
prices.binarySearch(40)                   // -4: it would go at index 3
val users = listOf(User(id = 1), User(id = 4), User(id = 9))   // sorted by id
users.binarySearchBy(4) { it.id }         // 1`,
    remember: 'Pick what lo and hi mean, keep it true on every step, and make sure every branch shrinks the range.',
    visual(el) {
      const A = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 81, 91];
      let target = 23;
      const row = h('div', {});
      const st = stats(['checks', 'range left']);
      const p = player(el, {
        top: picker('target', [{ src: '23', t: 23 }, { src: '72', t: 72 }, { src: '40', t: 40 }, { src: '2', t: 2 }], it => { target = it.t; p.reset(); }),
        view: [label('sorted (12 items)'), row, st], speed: 800,
        build() {
          let lo = 0, hi = A.length - 1, checks = 0;
          const fr = [{ lo, hi, checks, msg: `Looking for ${target}. lo = 0, hi = ${hi}: the whole list is in play.` }];
          while (lo <= hi) {
            const mid = (lo + hi) >>> 1;
            checks++;
            if (A[mid] === target) { fr.push({ lo, hi, mid, checks, found: true, msg: `mid = (${lo} + ${hi}) / 2 = ${mid}. a[${mid}] = ${A[mid]}. <span class="good">Found at index ${mid}.</span>` }); return fr; }
            const less = A[mid] < target;
            fr.push({ lo, hi, mid, checks, msg: `mid = ${mid}. a[${mid}] = ${A[mid]} ${less ? '&lt;' : '&gt;'} ${target}, so ${less ? `lo = mid + 1 = ${mid + 1}` : `hi = mid − 1 = ${mid - 1}`}.` });
            if (less) lo = mid + 1; else hi = mid - 1;
            fr.push({ lo, hi, checks, msg: null });
          }
          fr.push({ lo, hi, checks, miss: true, msg: `lo (${lo}) passed hi (${hi}): ${target} is not here. It would go at index ${lo}, so binarySearch returns −(${lo}) − 1 = <b>${-lo - 1}</b>.` });
          return fr;
        },
        paint(f) {
          row.replaceChildren(cellRow(A.map((v, k) => ({ v, cls: f.found && k === f.mid ? 'dsa-ok dsa-flash' : k === f.mid ? 'dsa-hot' : f.miss && k === f.lo ? 'dsa-bad' : k < f.lo || k > f.hi ? 'dsa-dim' : 'dsa-on', tag: [k === f.lo && 'lo', k === f.mid && 'mid', k === f.hi && 'hi'].filter(Boolean).join(' ') }))));
          st.set('checks', f.checks); st.set('range left', Math.max(0, f.hi - f.lo + 1));
        },
      });
    },
    deeper: [
      {
        title: 'Off-by-one traps',
        body: `<p>There are two consistent ways to write the bounds. Mixing them causes infinite loops or skipped items.</p>
<p><b>Inclusive</b> <code>lo..hi</code>: start <code>hi = lastIndex</code>, loop <code>while (lo &lt;= hi)</code>, update with <code>mid ± 1</code>. <b>Half-open</b> <code>lo until hi</code>: start <code>hi = size</code>, loop <code>while (lo &lt; hi)</code>, update with <code>hi = mid</code> and <code>lo = mid + 1</code>. Check one thing on every branch: does the range get smaller?</p>`,
        code: `// Inclusive bounds: the target is in lo..hi
var lo = 0
var hi = a.lastIndex
while (lo <= hi) { /* lo = mid + 1  or  hi = mid - 1 */ }

// Half-open bounds: the answer is in lo until hi
var lo = 0
var hi = a.size
while (lo < hi) { /* lo = mid + 1  or  hi = mid */ }

// Mixed up: hi = mid with lo <= hi.
// When lo == hi == mid and a[mid] > target, hi stays the same: an infinite loop.`,
      },
      {
        title: 'Find the first match',
        body: `<p>With duplicates, <code>binarySearch</code> may return any of the matching indexes. To get the <em>first</em> one, keep searching left after a match. This “lower bound” returns the first index whose value is at least the target, which is also where you would insert it.</p>`,
        visual(el) {
          const A = [1, 2, 2, 2, 2, 3, 5, 8];
          const row = h('div', {});
          player(el, {
            view: [label('lowerBound(a, 2), half-open lo until hi'), row], speed: 800,
            build() {
              let lo = 0, hi = A.length;
              const fr = [{ lo, hi, msg: 'lo = 0, hi = 8 (one past the end). The answer is in lo until hi.' }];
              while (lo < hi) {
                const mid = (lo + hi) >>> 1;
                const less = A[mid] < 2;
                fr.push({ lo, hi, mid, msg: `mid = ${mid}, a[mid] = ${A[mid]}. ${less ? `Less than 2: lo = mid + 1 = ${mid + 1}.` : `At least 2: this could be the first one, but there may be an earlier 2. hi = mid = ${mid}.`}` });
                if (less) lo = mid + 1; else hi = mid;
                fr.push({ lo, hi, msg: null });
              }
              fr.push({ lo, hi, done: true, msg: `lo == hi == ${lo}. The first 2 is at index <b>${lo}</b>.` });
              return fr;
            },
            paint(f) {
              row.replaceChildren(cellRow(A.map((v, k) => ({ v, cls: f.done && k === f.lo ? 'dsa-ok dsa-flash' : k === f.mid ? 'dsa-hot' : k < f.lo || k >= f.hi ? 'dsa-dim' : 'dsa-on', tag: [k === f.lo && 'lo', k === f.mid && 'mid', k === f.hi && 'hi'].filter(Boolean).join(' ') }))));
            },
          });
        },
        code: `// First index whose value is >= target. Returns a.size if there is none.
fun lowerBound(a: IntArray, target: Int): Int {
    var lo = 0
    var hi = a.size
    while (lo < hi) {
        val mid = (lo + hi) ushr 1
        if (a[mid] < target) lo = mid + 1 else hi = mid
    }
    return lo
}`,
      },
      {
        title: 'Search the answer, not the array',
        body: `<p>Binary search works on any yes/no question that flips once. “Can a truck with capacity <em>c</em> ship all parcels in 5 days?” is no for small <em>c</em> and yes from some point on. Binary search over <em>c</em> finds that point in O(log(range)) checks, each check O(n). Interviewers love this twist.</p>`,
        code: `// Smallest daily capacity that ships every parcel, in order, within \`days\` days.
fun minCapacity(weights: IntArray, days: Int): Int {
    var lo = weights.max()        // must fit the heaviest parcel
    var hi = weights.sum()        // everything in one day
    while (lo < hi) {
        val cap = (lo + hi) ushr 1
        if (daysNeeded(weights, cap) <= days) hi = cap else lo = cap + 1
    }
    return lo
}

fun daysNeeded(weights: IntArray, cap: Int): Int {
    var days = 1
    var load = 0
    for (w in weights) {
        if (load + w > cap) { days++; load = 0 }
        load += w
    }
    return days
}`,
      },
    ],
    mistakes: [
      { title: 'Binary search on unsorted data', bad: 'listOf(9, 2, 7, 4).binarySearch(7)   // undefined result', good: 'listOf(9, 2, 7, 4).indexOf(7)          // one lookup: O(n)\nval sorted = list.sorted()            // many lookups: sort once,\nsorted.binarySearch(7)                // then O(log n) each', why: 'The Kotlin docs say the result is undefined if the list is not sorted. Sorting costs O(n log n), so it only pays off when you search many times.' },
      { title: 'Treating every miss as -1', bad: 'if (list.binarySearch(x) == -1) list.add(x)', good: 'val i = list.binarySearch(x)\nif (i < 0) list.add(-(i + 1), x)   // insert and keep the list sorted', why: 'A miss returns <code>-(insertion point) - 1</code>, which is −1 only when the insertion point is 0. Check for any negative value, and use it to insert in the right place.' },
      { title: 'Overflow in the middle index', bad: 'val mid = (lo + hi) / 2', good: 'val mid = (lo + hi) ushr 1   // or lo + (hi - lo) / 2', why: 'When <code>lo + hi</code> is bigger than <code>Int.MAX_VALUE</code> it wraps to a negative number. That happens when you search a huge numeric range, as in “search the answer”.' },
    ],
    terms: [
      { term: 'Binary search', def: 'Finding a value in sorted data by checking the middle and dropping half of the range each time.' },
      { term: 'Insertion point', def: 'The index where a missing value would go to keep a list sorted.' },
      { term: 'Lower bound', def: 'The first index whose value is greater than or equal to the target.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Insert <code>x</code> into a sorted list and keep it sorted.', code: 'val i = list.binarySearch(x)\nval at = if (i >= 0) i else [[-(i + 1)|-i - 1|-(i+1)|-i-1]]\nlist.add(at, x)', why: 'A miss returns <code>-(insertionPoint) - 1</code>. Solving for the insertion point gives <code>-(i + 1)</code>.' },
      { type: 'bug', prompt: 'This hangs forever for some targets. Tap the broken line.', code: 'fun indexOf(a: IntArray, target: Int): Int {\n    var lo = 0\n    var hi = a.lastIndex\n    while (lo <= hi) {\n        val mid = (lo + hi) ushr 1\n        if (a[mid] == target) return mid\n        if (a[mid] < target) lo = mid + 1 else hi = mid\n    }\n    return -1\n}', bug: 6, fix: '        if (a[mid] < target) lo = mid + 1 else hi = mid - 1', why: 'With inclusive bounds, <code>hi = mid</code> can leave the range unchanged when <code>lo == hi</code>. <code>mid</code> was already checked, so drop it: <code>hi = mid - 1</code>.' },
    ],
    quiz: [
      { q: '<code>listOf(10, 20, 30).binarySearch(25)</code> returns?', options: ['-1', '-3', '2'], a: 1, why: '25 would go at index 2, so the result is −2 − 1 = −3.' },
      { q: 'What does binary search need from the data?', options: ['Sorted in the same order you search with', 'Stored in a HashMap', 'No duplicates'], a: 0, why: 'Duplicates are fine. Without sorting, dropping half the range is not safe.' },
      { q: 'Inclusive bounds <code>lo..hi</code>, and <code>a[mid] &gt; target</code>. Which update is right?', options: ['hi = mid', 'hi = mid - 1', 'lo = mid'], a: 1, why: '<code>mid</code> is already ruled out and everything right of it is bigger still.' },
    ],
  });

  // 7 ─────────────────────────────────────────────
  lessons.push({
    id: 'sorting',
    title: 'Sorting',
    tagline: 'Use the stdlib sort, know that it is stable, and build comparators that read well.',
    level: 'intermediate',
    body: `
<p>You will rarely write a sort at work. <code>sorted()</code>, <code>sortedBy { }</code> and <code>sortedWith(comparator)</code> return a new sorted list; <code>sort()</code> and <code>sortBy { }</code> sort a mutable list in place. They are O(n log n). The Kotlin API docs promise that sorting objects is <em>stable</em>: items that compare equal keep their original order.</p>
<p>On the JVM and Android, these calls end up in Java’s object sort, which is TimSort: a merge sort that also spots stretches that are already in order, so nearly sorted data sorts fast. <code>IntArray.sort()</code> uses a quicksort variant instead; stability does not matter there, because two equal ints are identical.</p>
<p>Interviews still ask how sorts work. Merge sort splits the list, sorts the halves and merges them by comparing their fronts. Step through the merges below.</p>`,
    code: `import java.text.Collator
import java.util.Locale

data class Song(val title: String, val artist: String, val plays: Int)

val byPlays = songs.sortedByDescending { it.plays }
val byArtistThenTitle = songs.sortedWith(compareBy<Song>({ it.artist }, { it.title }))

// Turkish alphabetical order: Ç after C, Ş after S
val turkish = Collator.getInstance(Locale.forLanguageTag("tr"))
val byTitleTr = songs.sortedWith(compareBy(turkish) { it.title })

val scores = intArrayOf(40, 7, 19)
scores.sort()                       // in place, primitive sort
val top3 = songs.sortedByDescending { it.plays }.take(3)`,
    remember: 'sorted* is O(n log n) and stable for objects. Build comparators with compareBy and thenBy, not by hand.',
    visual(el) {
      const START = [38, 27, 43, 3, 9, 82, 10, 50];
      const max = Math.max(...START);
      const bars = h('div', { class: 'dsa-bars' });
      const ptr = h('div', { class: 'dsa-ptr', style: `--n:${START.length}` });
      const buf = h('div', {});
      player(el, {
        view: [bars, ptr, label('merged run'), buf], speed: 550,
        build() {
          const a = [...START], fr = [];
          const snap = o => fr.push({ a: [...a], ...o });
          snap({ msg: 'Bottom-up merge sort. Runs of 1 item are already sorted. Merge neighbours into runs of 2, then 4, then 8.' });
          for (let w = 1; w < a.length; w *= 2) {
            for (let lo = 0; lo < a.length - w; lo += 2 * w) {
              const mid = lo + w, hi = Math.min(lo + 2 * w, a.length);
              let i = lo, j = mid;
              const out = [];
              snap({ lo, mid, hi, i, j, buf: [], msg: `Merge [${a.slice(lo, mid).join(', ')}] with [${a.slice(mid, hi).join(', ')}].` });
              while (i < mid || j < hi) {
                const left = j >= hi || (i < mid && a[i] <= a[j]);
                const m = j >= hi ? `Right run is empty: take ${a[i]}.` : i >= mid ? `Left run is empty: take ${a[j]}.` : left ? `${a[i]} ≤ ${a[j]}: take ${a[i]} from the left${a[i] === a[j] ? ' (ties go left: that keeps it stable)' : ''}.` : `${a[j]} &lt; ${a[i]}: take ${a[j]} from the right.`;
                out.push(left ? a[i++] : a[j++]);
                snap({ lo, mid, hi, i, j, buf: [...out], msg: m });
              }
              for (let k = 0; k < out.length; k++) a[lo + k] = out[k];
              snap({ lo, hi, done: true, buf: [...out], msg: `Copy back: [${out.join(', ')}] is now one sorted run.` });
            }
          }
          snap({ all: true, msg: 'Sorted. 3 rounds of merging (log₂ 8), each round touches all 8 items: O(n log n).' });
          return fr;
        },
        paint(f) {
          bars.replaceChildren(...f.a.map((v, k) => {
            const inL = f.mid !== undefined && k >= f.lo && k < f.mid, inR = f.mid !== undefined && k >= f.mid && k < f.hi;
            const used = (inL && k < f.i) || (inR && k < f.j);
            const cls = f.all || (f.done && k >= f.lo && k < f.hi) ? 'dsa-ok' : used ? 'dsa-dim' : inL ? 'dsa-on' : inR ? 'dsa-hot' : '';
            return h('div', { class: `dsa-bar ${cls}`, style: `height:${18 + (v / max) * 82}%` }, String(v));
          }));
          ptr.replaceChildren(...f.a.map((_, k) => h('span', {}, [k === f.i && f.i < f.mid && 'i', k === f.j && f.j < f.hi && 'j'].filter(Boolean).join(' '))));
          const len = f.hi !== undefined ? f.hi - f.lo : 0;
          buf.replaceChildren(len ? cellRow(Array.from({ length: len }, (_, k) => ({ v: f.buf[k] ?? '', i: '', cls: k < f.buf.length ? (k === f.buf.length - 1 && !f.done ? 'dsa-on dsa-flash' : f.done ? 'dsa-ok' : '') : 'dsa-empty' })), 'dsa-wide') : pill('waiting for a merge', 'dsa-sm dsa-ghost'));
        },
      });
    },
    deeper: [
      {
        title: 'Stable means ties keep their order',
        body: `<p>Sort five people by score. Ece and Su both have 1; Ali and Can both have 3. A stable sort promises Ece stays before Su and Ali before Can, as in the input. This lets you sort by one key after another: sort by name, then stably by score, and people with equal scores stay in name order.</p>
<p>The demo uses insertion sort, which is also stable: it only moves an item past others that are <em>strictly</em> bigger.</p>`,
        visual(el) {
          const P = [['Ali', 3], ['Ece', 1], ['Can', 3], ['Su', 1], ['Naz', 2]];
          const row = h('div', {});
          player(el, {
            view: [label('people.sortedBy { it.score }'), row], speed: 700,
            build() {
              const a = P.map(x => [...x]), fr = [{ a: a.map(x => [...x]), msg: 'Grow a sorted prefix from the left, one person at a time.' }];
              for (let i = 1; i < a.length; i++) {
                const key = a[i];
                let j = i - 1;
                fr.push({ a: a.map(x => [...x]), cur: i, msg: `Take ${key[0]} (${key[1]}). Move left past anyone with a bigger score.` });
                while (j >= 0 && a[j][1] > key[1]) { a[j + 1] = a[j]; a[j] = key; fr.push({ a: a.map(x => [...x]), cur: j, msg: `${a[j + 1][0]} (${a[j + 1][1]}) &gt; ${key[1]}: swap.` }); j--; }
                if (j >= 0) fr.push({ a: a.map(x => [...x]), cur: j + 1, stop: j, msg: `${a[j][0]} has ${a[j][1]}, not bigger than ${key[1]}: stop.${a[j][1] === key[1] ? ' Equal scores never swap, so the earlier person stays first.' : ''}` });
              }
              fr.push({ a: a.map(x => [...x]), end: true, msg: 'Result: Ece, Su, Naz, Ali, Can. Ece is still before Su, and Ali before Can: stable.' });
              return fr;
            },
            paint(f) {
              row.replaceChildren(cellRow(f.a.map(([n, s], k) => ({ v: n, tag: `score ${s}`, cls: f.end ? (s !== 2 ? 'dsa-ok' : '') : k === f.cur ? 'dsa-hot' : k === f.stop ? 'dsa-on' : '' })), 'dsa-wide'));
            },
          });
        },
        code: `val people = listOf("Ali" to 3, "Ece" to 1, "Can" to 3, "Su" to 1, "Naz" to 2)
people.sortedBy { it.second }
// [(Ece, 1), (Su, 1), (Naz, 2), (Ali, 3), (Can, 3)]`,
      },
      {
        title: 'Comparators that read well',
        body: `<p><code>compareBy</code> builds a comparator from one or more selectors; <code>thenBy</code> and <code>thenByDescending</code> add tie-breakers. <code>nullsLast()</code> decides where nulls go. They are clearer and safer than a hand-written <code>compare</code> that subtracts numbers.</p>`,
        code: `val inbox = messages.sortedWith(
    compareByDescending<Message> { it.pinned }
        .thenByDescending { it.sentAt }
        .thenBy { it.id }
)

// Messages never read go last
val byRead = messages.sortedWith(compareBy(nullsLast<Long>()) { it.readAt })`,
      },
      {
        title: 'Quick sort: partition around a pivot',
        body: `<p>Quick sort picks a pivot, moves smaller items to its left and the rest to its right, then sorts each side the same way. It sorts in place and is fast in practice, O(n log n) on average. But it is not stable, and if the pivot is the smallest or biggest item every time, it degrades to O(n²).</p>
<p>Merge sort is always O(n log n) and stable, but needs O(n) extra memory for merging. Step through one partition with the last item as pivot.</p>`,
        visual(el) {
          const START = [7, 2, 9, 4, 3, 8, 5];
          const row = h('div', {});
          player(el, {
            view: [label('partition(a, 0, 6), pivot = a[6]'), row], speed: 750,
            build() {
              const a = [...START], hi = a.length - 1, pivot = a[hi];
              let i = 0;
              const fr = [{ a: [...a], i, msg: `pivot = ${pivot}. i marks where the next item smaller than ${pivot} goes.` }];
              for (let j = 0; j < hi; j++) {
                if (a[j] < pivot) {
                  const m = `${a[j]} &lt; ${pivot}: swap it into slot i = ${i}, then i++.`;
                  [a[i], a[j]] = [a[j], a[i]];
                  fr.push({ a: [...a], i, j, sw: true, msg: m });
                  i++;
                } else fr.push({ a: [...a], i, j, msg: `${a[j]} ≥ ${pivot}: leave it on the right side.` });
              }
              [a[i], a[hi]] = [a[hi], a[i]];
              fr.push({ a: [...a], i, done: true, msg: `Swap the pivot into slot ${i}. Left of it: all smaller. Right: all bigger. ${pivot} is in its final place; now sort each side.` });
              return fr;
            },
            paint(f) {
              row.replaceChildren(cellRow(f.a.map((v, k) => ({ v, cls: f.done ? (k === f.i ? 'dsa-ok dsa-flash' : k < f.i ? 'dsa-on' : 'dsa-hot') : k === START.length - 1 ? 'dsa-ok' : k === f.j ? (f.sw ? 'dsa-on dsa-flash' : 'dsa-hot') : k < f.i ? 'dsa-on' : '', tag: [k === f.i && 'i', k === f.j && 'j', !f.done && k === START.length - 1 && 'pivot'].filter(Boolean).join(' ') }))));
            },
          });
        },
        code: `fun quickSort(a: IntArray, lo: Int = 0, hi: Int = a.lastIndex) {
    if (lo >= hi) return
    val p = partition(a, lo, hi)
    quickSort(a, lo, p - 1)
    quickSort(a, p + 1, hi)
}

fun partition(a: IntArray, lo: Int, hi: Int): Int {
    val pivot = a[hi]
    var i = lo                                    // a[lo until i] are all < pivot
    for (j in lo until hi) {
        if (a[j] < pivot) { a[i] = a[j].also { a[j] = a[i] }; i++ }
    }
    a[hi] = a[i].also { a[i] = a[hi] }            // pivot to its final place
    return i
}`,
      },
    ],
    underHood: {
      body: `<p>On the JVM, <code>Iterable.sorted()</code> copies the items into an array, calls <code>java.util.Arrays.sort</code> on it and wraps the array as a list. For object arrays that sort is TimSort, used in OpenJDK since Java 7 and in Android’s core library. For primitive arrays like <code>IntArray</code>, <code>Arrays.sort</code> is a Dual-Pivot Quicksort.</p>`,
      code: `// kotlin-stdlib on the JVM, simplified
fun <T : Comparable<T>> Iterable<T>.sorted(): List<T> {
    if (this is Collection) {
        if (size <= 1) return toList()
        return (toTypedArray<Comparable<T>>() as Array<T>).apply { sort() }.asList()
    }
    return toMutableList().apply { sort() }
}
// Array<T>.sort() calls java.util.Arrays.sort(this)`,
    },
    mistakes: [
      { title: 'Sorting to get one item', bad: 'val top = songs.sortedByDescending { it.plays }.first()   // O(n log n)', good: 'val top = songs.maxBy { it.plays }                        // O(n)', why: 'You only need the biggest one. <code>maxBy</code> (or <code>maxByOrNull</code> for a list that can be empty) looks at each item once.' },
      { title: 'A comparator that subtracts', bad: 'messages.sortedWith { a, b -> (a.sentAt - b.sentAt).toInt() }', good: 'messages.sortedBy { it.sentAt }', why: 'Two timestamps can differ by more than <code>Int.MAX_VALUE</code>; <code>toInt()</code> then flips the sign and the order breaks. Let <code>compareBy</code>/<code>sortedBy</code> compare.' },
      { title: 'Calling sorted() and ignoring the result', bad: 'posts.sortedBy { it.createdAt }\nshow(posts)                     // unchanged', good: 'val ordered = posts.sortedBy { it.createdAt }\nshow(ordered)\n// or, on a MutableList: posts.sortBy { it.createdAt }', why: 'Functions ending in <code>-ed</code> return a new list. The in-place versions are <code>sort</code>, <code>sortBy</code> and <code>sortWith</code>.' },
    ],
    terms: [
      { term: 'Stable sort', def: 'A sort that keeps items with equal keys in their original relative order.' },
      { term: 'Comparator', def: 'An object that decides the order of two items, built in Kotlin with compareBy and thenBy.' },
      { term: 'TimSort', def: 'The merge-sort-based, stable sort the JVM uses for objects; it is fast on data that is already partly sorted.' },
      { term: 'Partition', def: 'The quick sort step that puts smaller items left of a pivot and bigger items right of it.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Sort by artist, then by plays from high to low.', code: 'songs.sortedWith(\n    [[compareBy]]<Song> { it.artist }\n        .[[thenByDescending]] { it.plays }\n)', why: '<code>compareBy</code> sets the first key. <code>thenByDescending</code> breaks ties with the second, in reverse order.' },
      { type: 'bug', prompt: 'The feed should show the newest posts first, but its order never changes. Tap the broken line.', code: 'fun showFeed(posts: MutableList<Post>) {\n    posts.sortedByDescending { it.createdAt }\n    adapter.submitList(posts)\n}', bug: 1, fix: '    posts.sortByDescending { it.createdAt }', why: '<code>sortedByDescending</code> returns a new list that is thrown away. <code>sortByDescending</code> sorts the mutable list in place.' },
    ],
    quiz: [
      { q: 'What does “stable” mean for <code>sortedBy</code>?', options: ['It never throws', 'Items with equal keys keep their original order', 'It runs in O(n)'], a: 1, why: 'Stability is about ties: equal items do not swap places.' },
      { q: 'Which sort is O(n log n) in the worst case and stable?', options: ['Quick sort', 'Merge sort', 'Selection sort'], a: 1, why: 'Merge sort always splits in half and merges with ties going left. Quick sort can hit O(n²) and is not stable.' },
      { q: 'You only need the biggest number in a list. Best call?', options: ['sortedDescending().first()', 'maxOrNull()', 'sorted().last()'], a: 1, why: 'One pass, O(n), and no new list.' },
    ],
  });

  // 8 ─────────────────────────────────────────────
  const TREE = { 8: [4, 12], 4: [2, 6], 12: [10, 14], 2: [], 6: [], 10: [], 14: [] };
  const TREE_POS = [[8, 160, 26], [4, 85, 90], [12, 235, 90], [2, 40, 158], [6, 130, 158], [10, 190, 158], [14, 280, 158]];
  const treeSvg = name => graphSvg(TREE_POS.map(([id, x, y]) => ({ id, x, y, text: id })), [[8, 4], [8, 12], [4, 2], [4, 6], [12, 10], [12, 14]], { w: 320, ht: 182, r: 17, name });
  const PARENT = { 4: 8, 12: 8, 2: 4, 6: 4, 10: 12, 14: 12 };

  lessons.push({
    id: 'trees',
    title: 'Recursion and trees',
    tagline: 'A tree is a node plus smaller trees, so recursive code follows its shape.',
    level: 'intermediate',
    body: `
<p>A binary tree node holds a value and up to two children, and each child is a tree itself. So most tree code is recursive: handle the empty tree, call yourself on <code>left</code> and <code>right</code>, and combine the results.</p>
<p>A recursive function needs a <em>base case</em> that stops it and a step that makes the problem smaller. Each call waits on the call stack until the calls it made return. That is depth-first search (DFS): go all the way down one branch before trying the next. Where you record the node gives the three orders: pre-order (before the children), in-order (between them) and post-order (after them).</p>
<p>Breadth-first search (BFS) visits the tree level by level with a queue instead. Pick an order and step through it. This tree is a binary search tree, so in-order gives the values sorted.</p>`,
    code: `class Node(val value: Int, val left: Node? = null, val right: Node? = null)

fun inOrder(node: Node?, out: MutableList<Int>) {
    if (node == null) return                 // base case
    inOrder(node.left, out)
    out += node.value                        // in-order: between the children
    inOrder(node.right, out)
}

fun height(node: Node?): Int =
    if (node == null) 0 else 1 + maxOf(height(node.left), height(node.right))

fun levelOrder(root: Node?): List<Int> {
    val out = mutableListOf<Int>()
    val queue = ArrayDeque<Node>()
    root?.let(queue::addLast)
    while (queue.isNotEmpty()) {
        val node = queue.removeFirst()
        out += node.value
        node.left?.let(queue::addLast)
        node.right?.let(queue::addLast)
    }
    return out
}`,
    remember: 'Base case first, then recurse on smaller pieces. DFS uses the call stack; BFS uses a queue.',
    visual(el) {
      let order = 'pre';
      const t = treeSvg('Binary search tree with 7 nodes');
      const side = h('div', { class: 'dsa-queue' });
      const sideLabel = label('call stack (bottom → top)');
      const outRow = h('div', { class: 'dsa-queue' });
      const NAMES = { pre: 'pre-order', in: 'in-order', post: 'post-order', level: 'level order' };
      const p = player(el, {
        top: picker('order', [{ src: 'preOrder', o: 'pre' }, { src: 'inOrder', o: 'in' }, { src: 'postOrder', o: 'post' }, { src: 'levelOrder', o: 'level' }], it => { order = it.o; p.reset(); }),
        view: [t.root, sideLabel, side, label('output'), outRow], speed: 600,
        build() {
          const fr = [], stack = [], out = [], done = new Set();
          const snap = (cur, msg, q) => fr.push({ cur, stack: [...stack], q, out: [...out], done: new Set(done), msg });
          if (order === 'level') {
            const q = [8];
            snap(null, 'Level order: put the root in a queue.', [...q]);
            while (q.length) {
              const n = q.shift();
              out.push(n); done.add(n);
              q.push(...TREE[n]);
              snap(n, `removeFirst() → ${n}. Record it, add its children ${TREE[n].length ? TREE[n].join(' and ') : '(none)'} to the back.`, [...q]);
            }
            fr[fr.length - 1].msg += ' Done: level by level.';
            return fr;
          }
          snap(null, `${NAMES[order]}: start with visit(8). Each call sits on the call stack until it returns.`);
          const rec = n => {
            stack.push(n);
            snap(n, `call visit(${n})`);
            const [l, r] = TREE[n];
            if (order === 'pre') { out.push(n); done.add(n); snap(n, `pre-order: record ${n} before its children.`); }
            if (l) rec(l);
            if (order === 'in') { out.push(n); done.add(n); snap(n, `in-order: left side finished, record ${n}.`); }
            if (r) rec(r);
            if (order === 'post') { out.push(n); done.add(n); snap(n, `post-order: both children finished, record ${n}.`); }
            stack.pop();
            snap(stack[stack.length - 1] ?? null, `visit(${n}) returns${l ? '' : ' (a leaf: both children are null, the base case)'}.`);
          };
          rec(8);
          fr[fr.length - 1].msg = `Done: ${out.join(', ')}.${order === 'in' ? ' Sorted, because left < node < right everywhere in a BST.' : order === 'post' ? ' Children always come before their parent.' : ' The root comes first.'}`;
          return fr;
        },
        paint(f) {
          t.clear();
          sideLabel.textContent = order === 'level' ? 'queue (front → back)' : 'call stack (bottom → top)';
          for (const id of Object.keys(TREE).map(Number)) {
            const cls = id === f.cur ? 'dsa-hot' : f.stack.includes(id) ? 'dsa-on' : f.done.has(id) ? 'dsa-ok' : '';
            t.node(id, cls);
            if (PARENT[id] && f.stack.includes(id)) t.edge(PARENT[id], id, 'dsa-on');
          }
          const items = order === 'level' ? f.q : f.stack.map(n => `visit(${n})`);
          side.replaceChildren(...(items.length ? items.map((x, k) => pill(x, `dsa-sm ${order !== 'level' && k === items.length - 1 ? 'dsa-warm' : ''}`)) : [pill('empty', 'dsa-sm dsa-ghost')]));
          outRow.replaceChildren(...(f.out.length ? f.out.map((x, k) => pill(x, `dsa-sm dsa-ok ${k === f.out.length - 1 ? 'dsa-flash' : ''}`)) : [pill('nothing yet', 'dsa-sm dsa-ghost')]));
        },
      });
    },
    deeper: [
      {
        title: 'Search a binary search tree',
        body: `<p>In a binary search tree, everything left of a node is smaller and everything right is bigger. Searching compares with the node and goes one way, dropping the whole other subtree, like binary search on an array. That is O(height): O(log n) if the tree is balanced, but O(n) if it has turned into a line, which happens when you insert values that are already sorted.</p>`,
        visual(el) {
          let target = 6;
          const t = treeSvg('Search path in a binary search tree');
          const p = player(el, {
            top: picker('find', [{ src: '6', v: 6 }, { src: '14', v: 14 }, { src: '11', v: 11 }], it => { target = it.v; p.reset(); }),
            view: t.root, speed: 800,
            build() {
              const fr = [{ path: [], msg: `contains(root, ${target})` }];
              let n = 8;
              const path = [];
              while (n) {
                path.push(n);
                if (n === target) { fr.push({ path: [...path], found: n, msg: `${target} == ${n}. <span class="good">true</span> after ${path.length} comparisons.` }); return fr; }
                const goLeft = target < n, next = TREE[n][goLeft ? 0 : 1];
                fr.push({ path: [...path], msg: `${target} ${goLeft ? '&lt;' : '&gt;'} ${n}: go ${goLeft ? 'left' : 'right'}. The ${goLeft ? 'right' : 'left'} subtree is skipped.` });
                n = next;
              }
              fr.push({ path: [...path], miss: true, msg: `${target} would be a child of ${path[path.length - 1]}, but that child is null. <span class="bad">false</span>` });
              return fr;
            },
            paint(f) {
              t.clear();
              f.path.forEach((n, k) => {
                const last = k === f.path.length - 1;
                t.node(n, last ? (f.found ? 'dsa-ok' : f.miss ? 'dsa-bad' : 'dsa-hot') : 'dsa-on');
                if (k) t.edge(f.path[k - 1], n, 'dsa-on');
              });
            },
          });
        },
        code: `fun contains(node: Node?, target: Int): Boolean = when {
    node == null -> false
    target == node.value -> true
    target < node.value -> contains(node.left, target)
    else -> contains(node.right, target)
}`,
      },
      {
        title: 'Deep recursion and the stack',
        body: `<p>Every call takes a frame on the thread’s stack. A tree shaped like a long line, say 100,000 nodes deep, makes the recursive version throw <code>StackOverflowError</code>. Three ways out: keep your own stack in an <code>ArrayDeque</code>; use <code>tailrec</code> when the recursive call is the very last thing the function does (not possible with two children); or wrap the function in the stdlib’s <code>DeepRecursiveFunction</code>, which keeps its stack on the heap.</p>`,
        code: `// Pre-order with your own stack: no StackOverflowError
fun preOrder(root: Node?): List<Int> {
    val out = mutableListOf<Int>()
    val stack = ArrayDeque<Node>()
    root?.let(stack::addLast)
    while (stack.isNotEmpty()) {
        val node = stack.removeLast()
        out += node.value
        node.right?.let(stack::addLast)    // push right first so left comes out first
        node.left?.let(stack::addLast)
    }
    return out
}

// Or keep the recursive shape and let the stdlib move the stack to the heap
val depth = DeepRecursiveFunction<Node?, Int> { node ->
    if (node == null) 0 else 1 + maxOf(callRecursive(node.left), callRecursive(node.right))
}`,
      },
      {
        title: 'Trees you already use',
        body: `<p>An Android view hierarchy is a tree: a <code>ViewGroup</code> holds children, which may be groups too. Compose builds a tree of layout nodes. JSON, a file system and a navigation graph’s nested graphs are trees as well. Counting views is the same recursion as counting tree nodes.</p>`,
        code: `import androidx.core.view.children

fun countViews(view: View): Int =
    if (view is ViewGroup) 1 + view.children.sumOf { countViews(it) } else 1`,
      },
    ],
    mistakes: [
      { title: 'No base case', bad: 'fun size(node: Node?): Int =\n    1 + size(node?.left) + size(node?.right)', good: 'fun size(node: Node?): Int =\n    if (node == null) 0 else 1 + size(node.left) + size(node.right)', why: 'Without a case that stops, the function calls itself with <code>null</code> forever and ends in <code>StackOverflowError</code>.' },
      { title: 'Recursing on huge, unbalanced input', bad: 'fun depth(node: Node?): Int =\n    if (node == null) 0 else 1 + maxOf(depth(node.left), depth(node.right))\n// a 100,000-deep chain: StackOverflowError', good: 'val depth = DeepRecursiveFunction<Node?, Int> { node ->\n    if (node == null) 0\n    else 1 + maxOf(callRecursive(node.left), callRecursive(node.right))\n}', why: 'Recursion depth equals tree height. If the input can be deep, use an explicit stack or <code>DeepRecursiveFunction</code>.' },
    ],
    terms: [
      { term: 'Recursion', def: 'A function that solves a problem by calling itself on smaller versions of it.' },
      { term: 'Base case', def: 'The input a recursive function answers directly, without calling itself, so the recursion stops.' },
      { term: 'DFS', def: 'Depth-first search: follow one branch to the bottom before backing up, using recursion or a stack.' },
      { term: 'Binary search tree', def: 'A binary tree where every node’s left subtree holds smaller values and its right subtree bigger ones.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Count the nodes in a tree.', code: 'fun size(node: Node?): Int =\n    if (node == [[null]]) 0\n    else 1 + size(node.[[left]]) + size(node.right)', why: 'The empty tree has 0 nodes. Otherwise it is this node plus the size of each subtree.' },
      { type: 'bug', prompt: '<code>levelOrder</code> should list the tree level by level, but the order is wrong. Tap the broken line.', code: 'fun levelOrder(root: Node?): List<Int> {\n    val out = mutableListOf<Int>()\n    val queue = ArrayDeque<Node>()\n    root?.let(queue::addLast)\n    while (queue.isNotEmpty()) {\n        val node = queue.removeLast()\n        out += node.value\n        node.left?.let(queue::addLast)\n        node.right?.let(queue::addLast)\n    }\n    return out\n}', bug: 5, fix: '        val node = queue.removeFirst()', why: 'Adding at the back and removing at the back is a stack, which gives a depth-first order. BFS needs a queue: take from the front.' },
    ],
    quiz: [
      { q: 'In-order traversal of a binary search tree gives?', options: ['The values sorted ascending', 'The values level by level', 'The root last'], a: 0, why: 'Left subtree (smaller), then the node, then right subtree (bigger), at every level.' },
      { q: 'What does every recursive function need?', options: ['A loop', 'A base case that stops it', 'A global variable'], a: 1, why: 'Without one it never stops calling itself.' },
      { q: 'Which order records the root first?', options: ['Pre-order', 'In-order', 'Post-order'], a: 0, why: 'Pre-order records each node before its children, and the root is visited first.' },
    ],
  });

  // 9 ─────────────────────────────────────────────
  const CITY = [
    { id: 'ist', label: 'İstanbul', x: 60, y: 26 }, { id: 'bur', label: 'Bursa', x: 62, y: 104 }, { id: 'izm', label: 'İzmir', x: 34, y: 186 },
    { id: 'esk', label: 'Eskişehir', x: 160, y: 96 }, { id: 'ank', label: 'Ankara', x: 282, y: 40 }, { id: 'kon', label: 'Konya', x: 258, y: 150 }, { id: 'ant', label: 'Antalya', x: 150, y: 196 },
  ];
  const ROADS = [['ist', 'bur'], ['ist', 'ank'], ['bur', 'izm'], ['bur', 'esk'], ['esk', 'ank'], ['esk', 'kon'], ['ank', 'kon'], ['izm', 'ant'], ['kon', 'ant']];
  const NAME = Object.fromEntries(CITY.map(c => [c.id, c.label]));

  lessons.push({
    id: 'graphs',
    title: 'Graphs',
    tagline: 'Nodes and edges. Store them as an adjacency list, then walk them with BFS or DFS.',
    level: 'advanced',
    body: `
<p>A graph is a set of nodes connected by edges: cities and roads, users and follows, Gradle modules and their dependencies. Unlike a tree, a graph can have cycles and many paths between two nodes, so you must remember which nodes you have already seen.</p>
<p>The usual way to store one is an <em>adjacency list</em>: a map from each node to its neighbours. It takes O(V + E) memory, where V is the number of nodes and E the number of edges, and BFS or DFS over it is O(V + E) time.</p>
<p>When every edge costs the same, BFS finds the shortest path: it reaches every node at distance 1 before any node at distance 2. Record each node’s <code>parent</code> when you first see it, then follow the parents back from the goal. Step through BFS from İstanbul to Antalya on a made-up road map.</p>`,
    code: `typealias Graph = Map<String, List<String>>

fun graphOf(vararg roads: Pair<String, String>): Graph {
    val adj = mutableMapOf<String, MutableList<String>>()
    for ((a, b) in roads) {                          // undirected: add both ways
        adj.getOrPut(a) { mutableListOf() }.add(b)
        adj.getOrPut(b) { mutableListOf() }.add(a)
    }
    return adj
}

fun shortestPath(g: Graph, from: String, to: String): List<String>? {
    val parent = mutableMapOf<String, String?>(from to null)
    val queue = ArrayDeque(listOf(from))
    while (queue.isNotEmpty()) {
        val node = queue.removeFirst()
        if (node == to) return generateSequence(to) { parent[it] }.toList().asReversed()
        for (next in g[node].orEmpty()) {
            if (next !in parent) {                   // first time seen
                parent[next] = node
                queue.addLast(next)
            }
        }
    }
    return null
}`,
    remember: 'Graphs have cycles, so keep a visited set. BFS gives shortest paths when every edge costs the same.',
    visual(el) {
      const g = graphSvg(CITY.map(c => ({ ...c, text: '' })), ROADS, { w: 320, ht: 215, r: 15, name: 'Road map of seven Turkish cities' });
      const adj = {};
      for (const [a, b] of ROADS) { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); }
      const queue = h('div', { class: 'dsa-queue' });
      player(el, {
        view: [g.root, label('queue (front → back)'), queue, h('span', { class: 'dsa-stat' }, 'Numbers in the circles: distance from İstanbul.')], speed: 700,
        build() {
          const dist = { ist: 0 }, par = {}, q = ['ist'];
          const snap = o => ({ dist: { ...dist }, par: { ...par }, q: [...q], ...o });
          const fr = [snap({ msg: 'Start: İstanbul has distance 0 and is the only node in the queue.' })];
          while (q.length) {
            const n = q.shift();
            if (n === 'ant') {
              const path = []; let k = n; while (k) { path.push(k); k = par[k]; }
              fr.push(snap({ cur: n, path, msg: `Antalya comes out of the queue at distance ${dist[n]}. Follow parents back: <b>${path.reverse().map(x => NAME[x]).join(' → ')}</b>.` }));
              return fr;
            }
            fr.push(snap({ cur: n, msg: `removeFirst() → ${NAME[n]} (distance ${dist[n]}). Check its neighbours: ${adj[n].map(x => NAME[x]).join(', ')}.` }));
            for (const m of adj[n]) {
              if (dist[m] !== undefined) { fr.push(snap({ cur: n, look: m, seen: true, msg: `${NAME[m]} was already seen. Skip it: a shorter or equal path got there first.` })); continue; }
              dist[m] = dist[n] + 1; par[m] = n; q.push(m);
              fr.push(snap({ cur: n, look: m, msg: `${NAME[m]} is new: distance ${dist[m]}, parent ${NAME[n]}. addLast.` }));
            }
          }
          return fr;
        },
        paint(f) {
          g.clear();
          for (const c of CITY) {
            const cls = f.path ? (f.path.includes(c.id) ? 'dsa-ok' : 'dsa-dim') : c.id === f.cur ? 'dsa-hot' : c.id === f.look ? (f.seen ? 'dsa-bad' : 'dsa-on') : f.q.includes(c.id) ? 'dsa-on' : f.dist[c.id] !== undefined ? 'dsa-ok' : '';
            g.node(c.id, cls);
            g.text(c.id, f.dist[c.id] ?? '');
            if (f.par[c.id] && !f.path) g.edge(f.par[c.id], c.id, 'dsa-on');
          }
          if (f.path) for (let k = 1; k < f.path.length; k++) g.edge(f.path[k - 1], f.path[k], 'dsa-ok');
          if (f.look && !f.path) g.edge(f.cur, f.look, f.seen ? 'dsa-bad' : 'dsa-hot');
          queue.replaceChildren(...(f.q.length ? f.q.map(x => pill(NAME[x], `dsa-sm ${x === f.look && !f.seen ? 'dsa-acc dsa-flash' : ''}`)) : [pill('empty', 'dsa-sm dsa-ghost')]));
        },
      });
    },
    deeper: [
      {
        title: 'Adjacency list or matrix',
        body: `<p>An adjacency matrix is a V × V grid of booleans: <code>matrix[a][b]</code> says whether an edge exists. Checking one edge is O(1), but it always takes O(V²) memory, and listing a node’s neighbours is O(V). Most real graphs are sparse (each node has few neighbours), so the list wins. Use a matrix for small, dense graphs.</p>`,
        code: `// Matrix: small, dense graphs
val n = 4
val matrix = Array(n) { BooleanArray(n) }
matrix[0][1] = true
matrix[1][0] = true

// List: big, sparse graphs (most real ones)
val adj = List(n) { mutableListOf<Int>() }
adj[0].add(1)
adj[1].add(0)`,
      },
      {
        title: 'Cycle detection: modules that depend on each other',
        body: `<p>Gradle refuses module dependencies that form a cycle. To detect one in a directed graph, run DFS and give each node a colour: <em>white</em> (not visited), <em>gray</em> (on the current DFS path), <em>black</em> (finished). Reaching a gray node means you walked in a circle back onto your own path: a cycle. Reaching a black node is fine; it was fully explored before.</p>`,
        visual(el) {
          const MODS = [
            { id: 'app', label: ':app', x: 160, y: 22 }, { id: 'news', label: ':feature:news', x: 75, y: 90 }, { id: 'search', label: ':feature:search', x: 245, y: 90 },
            { id: 'data', label: ':core:data', x: 75, y: 160 }, { id: 'ui', label: ':core:ui', x: 245, y: 160 }, { id: 'net', label: ':core:network', x: 160, y: 214 },
          ];
          const BASE = [['app', 'news'], ['app', 'search'], ['news', 'data'], ['news', 'ui'], ['search', 'data'], ['search', 'ui'], ['data', 'net']];
          const LABEL = Object.fromEntries(MODS.map(m => [m.id, m.label]));
          let withCycle = false;
          const holder = h('div', {});
          const path = h('div', { class: 'dsa-queue' });
          let g;
          const p = player(el, {
            top: picker('graph', [{ src: 'no cycle', c: false }, { src: ':core:network -> :feature:news', c: true }], it => { withCycle = it.c; p.reset(); }),
            view: [holder, label('current DFS path (gray)'), path], speed: 650,
            build() {
              const edges = withCycle ? [...BASE, ['net', 'news']] : BASE;
              g = graphSvg(MODS.map(m => ({ ...m, text: '' })), edges, { w: 320, ht: 240, r: 13, directed: true, name: 'Module dependency graph' });
              holder.replaceChildren(g.root);
              const adj = {}; for (const [a, b] of edges) (adj[a] = adj[a] || []).push(b);
              const color = {}, stack = [], fr = [];
              const snap = o => fr.push({ color: { ...color }, stack: [...stack], ...o });
              snap({ msg: 'Every module starts white. Start DFS at :app.' });
              let found = null;
              const visit = n => {
                color[n] = 'gray'; stack.push(n);
                snap({ cur: n, msg: `${LABEL[n]} turns gray: it is on the current path.` });
                for (const m of adj[n] || []) {
                  const c = color[m] || 'white';
                  if (c === 'gray') { found = [n, m]; snap({ cur: n, edge: [n, m], bad: true, msg: `${LABEL[n]} → ${LABEL[m]}, and ${LABEL[m]} is gray. <span class="bad">Cycle:</span> ${stack.slice(stack.indexOf(m)).map(x => LABEL[x]).join(' → ')} → ${LABEL[m]}.` }); return true; }
                  if (c === 'black') { snap({ cur: n, edge: [n, m], msg: `${LABEL[n]} → ${LABEL[m]}: already black (finished). No cycle through it, skip.` }); continue; }
                  snap({ cur: n, edge: [n, m], msg: `${LABEL[n]} → ${LABEL[m]}: white, go deeper.` });
                  if (visit(m)) return true;
                }
                color[n] = 'black'; stack.pop();
                snap({ cur: n, msg: `${LABEL[n]} is finished: black.` });
                return false;
              };
              if (!visit('app')) snap({ msg: '<span class="good">No gray node was ever reached again: no cycle.</span> Gradle can build these modules in order.' });
              return fr;
            },
            paint(f) {
              g.clear();
              const cyc = f.bad ? f.stack.slice(f.stack.indexOf(f.edge[1])) : [];
              for (const m of MODS) {
                const c = f.color[m.id];
                g.node(m.id, cyc.includes(m.id) ? 'dsa-bad' : m.id === f.cur ? 'dsa-hot' : c === 'gray' ? 'dsa-on' : c === 'black' ? 'dsa-ok' : '');
              }
              for (let k = 1; k < f.stack.length; k++) g.edge(f.stack[k - 1], f.stack[k], f.bad && cyc.includes(f.stack[k]) && cyc.includes(f.stack[k - 1]) ? 'dsa-bad' : 'dsa-on');
              if (f.edge) g.edge(f.edge[0], f.edge[1], f.bad ? 'dsa-bad' : 'dsa-hot');
              path.replaceChildren(...(f.stack.length ? f.stack.map(x => pill(LABEL[x], `dsa-sm ${cyc.includes(x) ? 'dsa-err' : 'dsa-acc'}`)) : [pill('empty', 'dsa-sm dsa-ghost')]));
            },
          });
        },
        code: `enum class Mark { WHITE, GRAY, BLACK }

fun hasCycle(g: Map<String, List<String>>): Boolean {
    val mark = mutableMapOf<String, Mark>().withDefault { Mark.WHITE }
    fun visit(n: String): Boolean {
        mark[n] = Mark.GRAY                          // on the current path
        for (m in g[n].orEmpty()) {
            when (mark.getValue(m)) {
                Mark.GRAY -> return true             // back onto our own path: a cycle
                Mark.WHITE -> if (visit(m)) return true
                Mark.BLACK -> {}                     // finished earlier, nothing new
            }
        }
        mark[n] = Mark.BLACK
        return false
    }
    return g.keys.any { mark.getValue(it) == Mark.WHITE && visit(it) }
}`,
      },
      {
        title: 'Weighted edges need Dijkstra',
        body: `<p>When edges have different costs, like minutes of driving, BFS is not enough: a path with more edges can still be cheaper. Dijkstra’s algorithm always expands the cheapest node found so far, using a priority queue. With <code>java.util.PriorityQueue</code> it runs in O((V + E) log V). It needs costs that are zero or positive.</p>`,
        code: `fun cheapest(g: Map<String, List<Pair<String, Int>>>, from: String): Map<String, Int> {
    val best = mutableMapOf(from to 0)
    val queue = java.util.PriorityQueue<Pair<String, Int>>(compareBy { it.second })
    queue.add(from to 0)
    while (queue.isNotEmpty()) {
        val (node, cost) = queue.poll()
        if (cost > best.getValue(node)) continue          // an outdated entry
        for ((next, w) in g[node].orEmpty()) {
            val c = cost + w
            if (c < (best[next] ?: Int.MAX_VALUE)) {
                best[next] = c
                queue.add(next to c)
            }
        }
    }
    return best
}`,
      },
    ],
    mistakes: [
      { title: 'No visited set', bad: 'while (queue.isNotEmpty()) {\n    val node = queue.removeFirst()\n    for (next in g[node].orEmpty()) queue.addLast(next)\n}', good: 'val seen = mutableSetOf(start)\nwhile (queue.isNotEmpty()) {\n    val node = queue.removeFirst()\n    for (next in g[node].orEmpty()) if (seen.add(next)) queue.addLast(next)\n}', why: 'In an undirected graph, A lists B and B lists A, so without a visited set they add each other forever.' },
      { title: 'Marking visited when you take a node out', bad: 'val node = queue.removeFirst()\nif (!seen.add(node)) continue\nfor (next in g[node].orEmpty()) queue.addLast(next)', good: 'val node = queue.removeFirst()\nfor (next in g[node].orEmpty()) {\n    if (seen.add(next)) queue.addLast(next)   // mark when you add\n}', why: 'Marking late lets the same node sit in the queue many times, which wastes time and memory. Mark it the moment you add it.' },
    ],
    terms: [
      { term: 'Adjacency list', def: 'A graph stored as a map from each node to the list of its neighbours.' },
      { term: 'Visited set', def: 'The nodes a search has already seen, kept so cycles don’t make it loop forever.' },
      { term: 'Unweighted shortest path', def: 'The path with the fewest edges; BFS finds it because it explores in order of distance.' },
      { term: 'Back edge', def: 'In a DFS, an edge to a node that is still on the current path; in a directed graph it means a cycle.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Add a node to the queue only the first time you see it.', code: 'for (next in g[node].orEmpty()) {\n    if (seen.[[add]](next)) queue.[[addLast]](next)\n}', why: '<code>add</code> returns <code>true</code> only if the node was not in the set yet, so the check and the marking happen in one call.' },
      { type: 'bug', prompt: 'Every reachable city comes back with distance 1. Tap the broken line.', code: 'fun distances(g: Map<String, List<String>>, from: String): Map<String, Int> {\n    val dist = mutableMapOf(from to 0)\n    val queue = ArrayDeque(listOf(from))\n    while (queue.isNotEmpty()) {\n        val node = queue.removeFirst()\n        for (next in g[node].orEmpty()) {\n            if (next !in dist) {\n                dist[next] = dist.getValue(from) + 1\n                queue.addLast(next)\n            }\n        }\n    }\n    return dist\n}', bug: 7, fix: '                dist[next] = dist.getValue(node) + 1', why: 'A neighbour is one step further than the node you reached it from, not one step from the start.' },
    ],
    quiz: [
      { q: 'Why does BFS find the shortest path in an unweighted graph?', options: ['It visits nodes in order of their distance from the start', 'It tries every possible path', 'It uses recursion'], a: 0, why: 'The queue hands out all distance-1 nodes before any distance-2 node, so the first time it reaches a node is along a shortest path.' },
      { q: 'How much memory does an adjacency list need for V nodes and E edges?', options: ['O(V²)', 'O(V + E)', 'O(E²)'], a: 1, why: 'One entry per node plus one list item per edge (two for undirected edges).' },
      { q: 'In DFS cycle detection, you reach a node that is still gray. What does it mean?', options: ['There is a cycle', 'It is a dead end', 'It is the shortest path'], a: 0, why: 'Gray nodes are on the current path, so you have walked back onto your own path.' },
    ],
  });

  // 10 ────────────────────────────────────────────
  lessons.push({
    id: 'dp',
    title: 'Dynamic programming',
    tagline: 'Solve each small problem once, store the answer, and build the big one from it.',
    level: 'advanced',
    body: `
<p>Dynamic programming (DP) works when a problem breaks into smaller versions of itself and those smaller versions repeat. Plain recursion solves the same subproblem again and again, which can take exponential time. DP solves each one once and stores the answer.</p>
<p>There are two styles. <em>Memoization</em> is top-down: write the recursion, and cache results in a map so a repeated call returns at once. <em>Tabulation</em> is bottom-up: fill an array from the smallest case upward, so every value you need is already there when you need it.</p>
<p>The demo fills a table for coin change: the fewest coins that make each amount, with coins 1, 3 and 4. For each amount, look back by each coin and take the best result plus one. Greedy (biggest coin first) gives 4 + 1 + 1 for 6; the table finds 3 + 3.</p>`,
    code: `// Fewest coins that add up to amount, or -1.
// Tabulation: O(amount × coins) time, O(amount) space.
fun minCoins(coins: IntArray, amount: Int): Int {
    val inf = Int.MAX_VALUE
    val dp = IntArray(amount + 1) { inf }    // dp[a] = fewest coins for amount a
    dp[0] = 0                                // base case: 0 coins make 0
    for (a in 1..amount) {
        for (c in coins) {
            if (c <= a && dp[a - c] != inf) dp[a] = minOf(dp[a], dp[a - c] + 1)
        }
    }
    return if (dp[amount] == inf) -1 else dp[amount]
}`,
    remember: 'Say what dp[i] means in one sentence, find how it builds from smaller i, set the base case, then fill in order.',
    visual(el) {
      const COINS = [1, 3, 4], N = 10;
      const row = h('div', {});
      const st = stats(['cells filled', 'dp[10]']);
      player(el, {
        view: [label('dp[a] = fewest coins for amount a, coins 1, 3, 4'), row, st], speed: 420,
        build() {
          const dp = Array(N + 1).fill(Infinity), via = Array(N + 1).fill(null);
          dp[0] = 0;
          const fr = [{ dp: [...dp], via: [...via], a: 0, msg: 'dp[0] = 0: zero coins make zero. Every other cell starts at ∞ (not reachable yet).' }];
          for (let a = 1; a <= N; a++) {
            for (const c of COINS) {
              if (c > a) continue;
              const cand = dp[a - c] + 1, better = cand < dp[a];
              if (better) { dp[a] = cand; via[a] = c; }
              fr.push({ dp: [...dp], via: [...via], a, look: a - c, msg: `a = ${a}, coin ${c}: dp[${a - c}] + 1 = ${cand}.${better ? ` <span class="good">Best so far for ${a}.</span>` : ` Not better than ${dp[a]}.`}` });
            }
            fr.push({ dp: [...dp], via: [...via], a, set: true, msg: `dp[${a}] = ${dp[a]} (last coin ${via[a]}).` });
          }
          const used = []; let a = N; while (a > 0) { used.push(via[a]); a -= via[a]; }
          const trace = []; a = N; while (a > 0) { trace.push(a); a -= via[a]; }
          fr.push({ dp: [...dp], via: [...via], a: N + 1, trace, msg: `Follow the “last coin” back from 10: ${used.join(' + ')} = 10, <b>${dp[N]} coins</b>. Greedy would take 4 + 4 + 1 + 1 = 4 coins.` });
          return fr;
        },
        paint(f) {
          row.replaceChildren(cellRow(f.dp.map((v, k) => ({ v: v === Infinity ? '∞' : v, tag: f.via[k] && k <= f.a ? `+${f.via[k]}` : '', cls: f.trace ? (f.trace.includes(k) || k === 0 ? 'dsa-ok' : '') : k === f.look ? 'dsa-hot' : k === f.a ? (f.set ? 'dsa-ok dsa-flash' : 'dsa-on') : k > f.a ? 'dsa-dim' : '' }))));
          st.set('cells filled', Math.min(f.a, N) + 1); st.set('dp[10]', f.dp[N] === Infinity ? '∞' : f.dp[N]);
        },
      });
    },
    deeper: [
      {
        title: 'Memoization: climbing stairs',
        body: `<p>How many ways can you climb <em>n</em> steps taking 1 or 2 at a time? The last move was either 1 step or 2, so <code>ways(n) = ways(n − 1) + ways(n − 2)</code>. Plain recursion asks for the same <code>ways(3)</code> over and over: 25 calls for n = 6, and the count grows exponentially. With a memo map, each value is computed once: 11 calls. Switch between the two and compare.</p>`,
        visual(el) {
          let memoOn = false;
          const calls = h('div', { class: 'dsa-queue' });
          const memo = h('div', { class: 'dsa-queue' });
          const st = stats(['calls', 'memo hits']);
          const p = player(el, {
            top: picker('version', [{ src: 'waysPlain(6)', m: false }, { src: 'ways(6, memo)', m: true }], it => { memoOn = it.m; p.reset(); }),
            view: [label('calls in order'), calls, label('memo'), memo, st], speed: 380,
            build() {
              const fr = [], list = [], m = {};
              let hits = 0;
              const snap = msg => fr.push({ list: list.map(x => ({ ...x })), m: { ...m }, hits, msg });
              snap(`${memoOn ? 'ways(6, memo)' : 'waysPlain(6)'}: each chip below is one function call.`);
              const ways = n => {
                if (n <= 1) { list.push({ n, kind: 'base' }); snap(`ways(${n}) = 1: base case.`); return 1; }
                if (memoOn && m[n] !== undefined) { hits++; list.push({ n, kind: 'hit' }); snap(`ways(${n}) is in the memo: ${m[n]}, no work.`); return m[n]; }
                list.push({ n, kind: 'call' });
                snap(`ways(${n}) = ways(${n - 1}) + ways(${n - 2})`);
                const v = ways(n - 1) + ways(n - 2);
                if (memoOn) { m[n] = v; snap(`Store ways(${n}) = ${v} in the memo.`); }
                return v;
              };
              const v = ways(6);
              snap(`ways(6) = ${v} after <b>${list.length} calls</b>.${memoOn ? ' Each value computed once: O(n).' : ' ways(2) alone ran 5 times. This is O(2ⁿ)-ish growth.'}`);
              return fr;
            },
            paint(f) {
              calls.replaceChildren(...(f.list.length ? f.list.map((c, k) => pill(c.n, `dsa-sm ${c.kind === 'hit' ? 'dsa-ok' : c.kind === 'base' ? 'dsa-ghost' : 'dsa-acc'} ${k === f.list.length - 1 ? 'dsa-flash' : ''}`)) : [pill('no calls yet', 'dsa-sm dsa-ghost')]));
              const keys = Object.keys(f.m);
              memo.replaceChildren(...(memoOn ? (keys.length ? keys.map(k => pill(`${k} → ${f.m[k]}`, 'dsa-sm dsa-ok')) : [pill('empty', 'dsa-sm dsa-ghost')]) : [pill('no memo in this version', 'dsa-sm dsa-ghost')]));
              st.set('calls', f.list.length); st.set('memo hits', f.hits);
            },
          });
        },
        code: `// ways(n): how many ways to climb n steps taking 1 or 2 at a time
fun waysPlain(n: Int): Long =
    if (n <= 1) 1 else waysPlain(n - 1) + waysPlain(n - 2)               // exponential

fun ways(n: Int, memo: MutableMap<Int, Long> = HashMap()): Long {
    if (n <= 1) return 1
    return memo.getOrPut(n) { ways(n - 1, memo) + ways(n - 2, memo) }  // O(n)
}`,
      },
      {
        title: 'Keep only what you need',
        body: `<p>A tabulated DP often only reads the last row or the last few cells. Climbing stairs only needs the previous two values, so two variables replace the whole array: O(n) time, O(1) space. Interviewers often ask for this follow-up.</p>`,
        code: `fun ways(n: Int): Long {
    var prev = 1L   // ways(i - 2)
    var cur = 1L    // ways(i - 1)
    repeat(n - 1) {
        val next = prev + cur
        prev = cur
        cur = next
    }
    return cur
}`,
      },
      {
        title: 'Spotting a DP problem',
        body: `<p>Clues: “how many ways”, “fewest”, “most”, “can you reach”, a choice at each step, and a greedy idea that fails on a small example. Then work in four steps: define the <b>state</b> (what <code>dp[i]</code> or <code>dp[r][c]</code> means), the <b>transition</b> (how it builds from smaller states), the <b>base case</b>, and the <b>order</b> to fill. Grids are the classic 2D case.</p>`,
        code: `// Paths from the top-left to the bottom-right cell, moving only right or down
fun gridPaths(rows: Int, cols: Int): Long {
    val dp = Array(rows) { LongArray(cols) { 1L } }    // first row and column: 1 way
    for (r in 1 until rows) for (c in 1 until cols) {
        dp[r][c] = dp[r - 1][c] + dp[r][c - 1]         // from above + from the left
    }
    return dp[rows - 1][cols - 1]
}`,
      },
    ],
    mistakes: [
      { title: 'Greedy where DP is needed', bad: '// Take the biggest coin that fits, repeat\nfun greedyCoins(coins: IntArray, amount: Int): Int {\n    var left = amount\n    var count = 0\n    for (c in coins.sortedDescending()) { count += left / c; left %= c }\n    return if (left == 0) count else -1\n}\ngreedyCoins(intArrayOf(1, 3, 4), 6)   // 3 (4 + 1 + 1)', good: 'minCoins(intArrayOf(1, 3, 4), 6)      // 2 (3 + 3)', why: 'Greedy happens to work for some coin systems, but not for every set of coins. Test your greedy idea on a small example; if it fails, it is a DP problem.' },
      { title: 'A memo that is created on every call', bad: 'fun ways(n: Int): Long {\n    val memo = HashMap<Int, Long>()   // new and empty each time\n    if (n <= 1) return 1\n    return memo.getOrPut(n) { ways(n - 1) + ways(n - 2) }\n}', good: 'fun ways(n: Int, memo: MutableMap<Int, Long> = HashMap()): Long {\n    if (n <= 1) return 1\n    return memo.getOrPut(n) { ways(n - 1, memo) + ways(n - 2, memo) }\n}', why: 'Each call gets its own empty map, so nothing is ever found in it and the run is as slow as plain recursion. Share one memo across all calls.' },
    ],
    terms: [
      { term: 'Dynamic programming', def: 'Solving a problem by combining stored answers to smaller, overlapping subproblems.' },
      { term: 'Memoization', def: 'Top-down DP: recursion plus a cache, so each subproblem is computed once.' },
      { term: 'Tabulation', def: 'Bottom-up DP: filling a table from the base case upward in a loop.' },
      { term: 'Overlapping subproblems', def: 'The same smaller problem showing up many times inside a recursion, which is what makes DP pay off.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Cache each result with <code>getOrPut</code>.', code: 'fun ways(n: Int, memo: MutableMap<Int, Long>): Long {\n    if (n <= 1) return [[1|1L]]\n    return memo.[[getOrPut]](n) { ways(n - 1, memo) + ways(n - 2, memo) }\n}', why: 'There is one way to climb 0 or 1 steps. <code>getOrPut</code> returns the stored value, or runs the lambda once and stores its result.' },
      { type: 'bug', prompt: '<code>minCoins(intArrayOf(2), 3)</code> should return -1, but returns a huge negative number. Tap the broken line.', code: 'fun minCoins(coins: IntArray, amount: Int): Int {\n    val dp = IntArray(amount + 1) { Int.MAX_VALUE }\n    dp[0] = 0\n    for (a in 1..amount) {\n        for (c in coins) {\n            if (c <= a) dp[a] = minOf(dp[a], dp[a - c] + 1)\n        }\n    }\n    return if (dp[amount] == Int.MAX_VALUE) -1 else dp[amount]\n}', bug: 5, fix: '            if (c <= a && dp[a - c] != Int.MAX_VALUE) dp[a] = minOf(dp[a], dp[a - c] + 1)', why: '<code>dp[1]</code> is unreachable, so it stays <code>Int.MAX_VALUE</code>, and <code>+ 1</code> wraps it to <code>Int.MIN_VALUE</code>. Skip cells that are not reachable.' },
    ],
    quiz: [
      { q: 'Memoization vs tabulation?', options: ['Memoization is top-down recursion with a cache; tabulation fills a table bottom-up', 'They are the same thing', 'Tabulation always uses recursion'], a: 0, why: 'Both store subproblem answers. They differ in direction and in whether recursion drives the order.' },
      { q: 'Why is the plain recursive <code>ways(n)</code> slow?', options: ['Recursion is slow on Android', 'It solves the same subproblems many times', 'It uses Long'], a: 1, why: 'The number of calls grows exponentially because <code>ways(k)</code> is recomputed for every path that reaches it.' },
      { q: 'Coins 1, 3 and 4. Fewest coins for 6?', options: ['2', '3', '6'], a: 0, why: '3 + 3. Greedy picks 4 + 1 + 1, which is 3 coins.' },
    ],
  });

  // 11 ────────────────────────────────────────────
  lessons.push({
    id: 'interview',
    title: 'Approaching a coding interview',
    tagline: 'Clarify, try examples, start simple, improve, then test out loud.',
    level: 'beginner',
    body: `
<p>Interviewers grade how you think as much as the final code. A fixed routine keeps you from freezing, or from racing into the wrong solution. Five steps work for most problems.</p>
<p><b>Clarify</b> the input and output: sizes, empty input, duplicates, character set. <b>Examples</b>: work one normal case by hand, plus an edge case. <b>Brute force</b>: say the simple solution and its Big-O, even if it is slow. <b>Optimize</b>: find the repeated work and remove it with a set, a map, two pointers, sorting or DP. <b>Test</b>: run your code on the examples line by line and fix bugs before the interviewer points them out.</p>
<p>Step through the five phases on a real question: <em>return the first character that appears only once in a string</em>.</p>`,
    code: `// First character that appears exactly once, or null.
// O(n) time, O(k) extra space for k distinct characters.
fun firstUnique(s: String): Char? {
    val counts = s.groupingBy { it }.eachCount()
    return s.firstOrNull { counts.getValue(it) == 1 }
}

// The tests you say out loud
check(firstUnique("swiss") == 'w')
check(firstUnique("aabb") == null)
check(firstUnique("") == null)
check(firstUnique("ğüğ") == 'ü')`,
    remember: 'Clarify, examples, brute force, optimize, test. Say each step out loud before you code it.',
    visual(el) {
      const PH = ['Clarify', 'Examples', 'Brute force', 'Optimize', 'Test'];
      const phases = PH.map(n => pill(n, 'dsa-ghost'));
      const card = h('div', { class: 'dsa-card' });
      const S = 'swiss';
      player(el, {
        view: [h('div', { class: 'dsa-row' }, phases), card], speed: 1600,
        build() {
          const fr = [
            { p: -1, title: 'The question', html: '<p>“Given a string, return the first character that appears only once.”</p><p>Don’t start typing yet. Press Step.</p>', msg: 'Start every problem the same way.' },
            { p: 0, title: 'Ask before you code', html: '<ul><li>What if no character is unique? <b>Return null.</b></li><li>Empty string? <b>Also null.</b></li><li>Only a–z, or any Unicode? <b>Any character.</b></li><li>How long can it be? <b>Up to 10⁵.</b></li></ul>', msg: 'Each answer changes the code: a nullable return type, and a map instead of an IntArray(26).' },
            { p: 1, title: 'Work examples by hand', html: '<ul><li>"swiss" → s appears 3 times, <b>w once</b> → \'w\'</li><li>"aabb" → nothing unique → null</li><li>"" → null</li></ul>', msg: 'Writing examples first gives you test cases for later.' },
            { p: 2, title: 'Say the simple version', html: '<p>For each character, count it in the whole string. First count of 1 wins.</p>', code: 'fun firstUnique(s: String): Char? =\n    s.firstOrNull { c -> s.count { it == c } == 1 }   // O(n²)', msg: 'Correct but O(n²): 10⁵ characters means up to 10¹⁰ steps. Say that out loud, then improve.' },
            { p: 3, title: 'Remove the repeated work', html: '<p>The inner <code>count</code> scans the string again for every character. Count everything once in a map, then scan once.</p>', code: 'val counts = s.groupingBy { it }.eachCount()     // O(n)\nreturn s.firstOrNull { counts.getValue(it) == 1 }  // O(n)', msg: 'Two passes: O(n) time, O(k) space for k distinct characters.' },
          ];
          const counts = {};
          for (let k = 0; k < S.length; k++) {
            counts[S[k]] = (counts[S[k]] || 0) + 1;
            fr.push({ p: 4, title: 'Trace "swiss": count pass', cells: { at: k, counts: { ...counts } }, html: '', msg: `counts['${S[k]}'] = ${counts[S[k]]}` });
          }
          for (let k = 0; k < S.length; k++) {
            const one = counts[S[k]] === 1;
            fr.push({ p: 4, title: 'Trace "swiss": scan pass', cells: { at: k, counts: { ...counts }, scan: true, hit: one }, html: '', msg: one ? `counts['${S[k]}'] == 1. <span class="good">return '${S[k]}'</span>, matching the example.` : `counts['${S[k]}'] == ${counts[S[k]]}, keep going.` });
            if (one) break;
          }
          fr.push({ p: 5, title: 'Wrap up', html: '<ul><li>Run "aabb" and "": both null.</li><li>State the final cost: O(n) time, O(k) space.</li><li>Mention a trade-off: for only a–z, an <code>IntArray(26)</code> is faster than a map.</li></ul>', msg: 'Done. The interviewer heard every decision.' });
          return fr;
        },
        paint(f) {
          phases.forEach((ph, k) => { ph.className = `dsa-pill ${k < f.p ? 'dsa-ok' : k === f.p ? 'dsa-acc' : 'dsa-ghost'}`; });
          const kids = [h('h4', {}, f.title)];
          if (f.html) kids.push(h('div', { html: f.html }));
          if (f.code) kids.push(h('div', { class: 'kt dsa-wrapk', html: hl(f.code) }));
          if (f.cells) {
            const c = f.cells;
            kids.push(cellRow([...S].map((ch, k) => ({ v: ch, cls: k === c.at ? (c.scan ? (c.hit ? 'dsa-ok dsa-flash' : 'dsa-hot') : 'dsa-on') : k < c.at ? 'dsa-dim' : '' }))));
            kids.push(h('div', { class: 'dsa-queue' }, Object.entries(c.counts).map(([ch, n]) => pill(`'${ch}' → ${n}`, `dsa-sm ${n === 1 ? 'dsa-ok' : ''}`))));
          }
          card.replaceChildren(...kids);
        },
      });
    },
    deeper: [
      {
        title: 'Questions worth asking',
        body: `<p>Clarifying questions show care, and they often hide the trick of the problem. A short list to run through:</p>
<ul><li><b>Size</b>: how big can the input get? That tells you whether O(n²) is acceptable.</li><li><b>Empty and tiny inputs</b>: what should happen with zero or one item?</li><li><b>Duplicates and order</b>: can values repeat? Is the input sorted?</li><li><b>Range</b>: negative numbers? Overflow? Only a–z or any Unicode?</li><li><b>Output</b>: return a value, an index, or all answers? What if there is no answer: <code>null</code>, <code>-1</code>, or an exception?</li></ul>`,
      },
      {
        title: 'From brute force to better: clues to tools',
        body: `<p>Most optimizations come from a handful of patterns. Match the clue in the problem to the tool. Pick a clue below.</p>`,
        visual(el) {
          const CLUES = [
            { src: '"have I seen this before?"', t: 'HashSet / HashMap', why: 'Turns a scan inside a loop into an O(1) lookup.', l: 'hashing' },
            { src: '"sorted array, find a pair"', t: 'Two pointers', why: 'Move left or right by comparing the sum to the target: O(n).', l: 'two-pointers' },
            { src: '"best range of k items"', t: 'Sliding window', why: 'Update the window as it moves instead of recomputing it.', l: 'two-pointers' },
            { src: '"sorted, find a value fast"', t: 'Binary search', why: 'Halve the range each check: O(log n).', l: 'binary-search' },
            { src: '"fewest steps / moves"', t: 'BFS', why: 'Explores in order of distance, so the first hit is the shortest.', l: 'graphs' },
            { src: '"matching brackets, undo, nearest bigger"', t: 'Stack', why: 'The most recent open item is the one that matters.', l: 'stacks-queues' },
            { src: '"how many ways / fewest coins"', t: 'Dynamic programming', why: 'Overlapping subproblems: store each answer once.', l: 'dp' },
          ];
          const o = out('Pick a clue.');
          const btns = CLUES.map((c, k) => cmd(c.src, () => { press(btns, btns[k]); say(o, `<span class="good">${c.t}</span> <span class="muted">→</span> ${c.why} <a href="#cs.${c.l}">Review the lesson</a>`); }));
          el.append(h('div', { class: 'controls' }, btns), o);
        },
      },
      {
        title: 'Test like a debugger',
        body: `<p>After writing the code, don’t say “I think it works”. Walk through it with a small example, tracking each variable as the interviewer watches. Then try the edge cases you collected: empty input, one item, all items equal, the biggest size, negative numbers. Finding your own bug is a good sign in an interview; missing it is not.</p>`,
        code: `// Say the trace out loud for "aab":
// counts = {a=2, b=1}
// scan: 'a' -> 2, skip; 'a' -> 2, skip; 'b' -> 1, return 'b'
check(firstUnique("aab") == 'b')
check(firstUnique("a") == 'a')            // one item
check(firstUnique("zzzz") == null)        // all the same`,
      },
    ],
    mistakes: [
      { title: 'Coding before clarifying', bad: '// Heard "first unique character" and started typing\nfun firstUnique(s: String): Char =\n    s.first { c -> s.count { it == c } == 1 }   // throws on "aabb"', good: '// Asked: what if nothing is unique? -> return null\nfun firstUnique(s: String): Char? =\n    s.firstOrNull { c -> s.count { it == c } == 1 }', why: 'One question about the no-answer case changes the return type and avoids a crash. It also shows the interviewer you think about edge cases.' },
      { title: 'Forgetting the small edge cases', bad: 'fun maxGap(a: IntArray): Int =\n    (1 until a.size).maxOf { a[it] - a[it - 1] }   // throws for size < 2', good: 'fun maxGap(a: IntArray): Int? =\n    (1 until a.size).maxOfOrNull { a[it] - a[it - 1] }', why: '<code>maxOf</code> throws <code>NoSuchElementException</code> on an empty range. Empty and one-item inputs are the first tests to try.' },
    ],
    terms: [
      { term: 'Brute force', def: 'The simplest correct solution, usually trying every option, used as a starting point.' },
      { term: 'Edge case', def: 'An input at the boundary, like empty, one item, or the maximum size, where bugs tend to hide.' },
      { term: 'Trade-off', def: 'Gaining one thing, like speed, by giving up another, like memory or simplicity.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Finish the O(n) solution: count once, then scan once.', code: 'fun firstUnique(s: String): Char? {\n    val counts = s.[[groupingBy]] { it }.eachCount()\n    return s.[[firstOrNull]] { counts.getValue(it) == 1 }\n}', why: '<code>groupingBy { it }.eachCount()</code> counts in one pass. <code>firstOrNull</code> returns <code>null</code> when no character matches.' },
      { type: 'bug', prompt: '<code>firstUnique("aabb")</code> should return null, but it crashes. Tap the broken line.', code: 'fun firstUnique(s: String): Char? {\n    val counts = HashMap<Char, Int>()\n    for (c in s) counts[c] = (counts[c] ?: 0) + 1\n    return s.first { counts[it] == 1 }\n}', bug: 3, fix: '    return s.firstOrNull { counts[it] == 1 }', why: '<code>first</code> throws <code>NoSuchElementException</code> when nothing matches. The function promises <code>Char?</code>, so use <code>firstOrNull</code>.' },
    ],
    quiz: [
      { q: 'What should you do first when you get a problem?', options: ['Write the optimal code', 'Clarify the inputs, outputs and edge cases', 'Pick the fastest language'], a: 1, why: 'Questions about size, empty input and the no-answer case shape everything after.' },
      { q: 'Why say the brute force solution out loud?', options: ['It gives a correct baseline and a Big-O to improve on', 'Interviewers want slow code', 'It is always the final answer'], a: 0, why: 'A working baseline shows you can solve it, and its cost points at the repeated work to remove.' },
      { q: 'The input is sorted and you need a pair with a given sum. Which tool fits?', options: ['Two pointers', 'Dynamic programming', 'A stack'], a: 0, why: 'Sorted input lets you move one pointer or the other based on the sum, in O(n).' },
    ],
  });

  Lab.addTrack({
    id: 'cs',
    title: 'CS and interview basics',
    description: 'Big-O, the core data structures and the classic algorithm patterns, in Kotlin, to get ready for coding interviews.',
    requires: ['kotlin'],
    css,
    lessons,
  });
})();
