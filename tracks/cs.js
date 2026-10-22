/* Data structures and algorithms track. Same shape as tracks/kotlin.js.
   Big O, the core data structures and classic algorithm patterns, all in Kotlin.
   Demos use Lab.ui (codeStepper, flow, player with a custom stage built from the helpers below).
   Every class is prefixed dsa- (cs- is taken by tracks/cap-ship.js). */
(() => {
  const { h } = Lab;
  const pill = (text, cls = '') => h('span', { class: `dsa-pill ${cls}` }, String(text));
  const label = text => h('span', { class: 'dsa-label' }, text);
  // A row of array cells. cells: [{ v, i?, tag?, cls? }]
  const cellRow = (cells, extra = '') => h('div', { class: `dsa-arr ${extra}`, style: `--n:${cells.length}` },
    cells.map((c, k) => h('div', { class: `dsa-cell ${c.cls || ''}` },
      h('span', { class: 'dsa-i' }, c.i === undefined ? String(k) : c.i),
      h('span', { class: 'dsa-v' }, c.v === undefined || c.v === null ? '' : String(c.v)),
      h('span', { class: 'dsa-tag' }, c.tag || ''))));

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

/* problem-solving card */
.dsa-card { display: grid; gap: 8px; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--accent); background: var(--surface); min-width: 0; }
.dsa-card h4 { margin: 0; font: 700 1rem var(--display); color: var(--ink); }
.dsa-card p, .dsa-card ul { margin: 0; color: var(--ink); }
.dsa-card ul { padding-left: 1.2em; }
@media (max-width: 520px) { .dsa-split { grid-template-columns: minmax(0, 1fr); } .dsa-stack { width: auto; min-height: 0; flex-direction: row; flex-wrap: wrap; border: 2px solid var(--line); border-left: none; border-radius: 0 10px 10px 0; } }
`;

  // A small binary search tree (8; 4, 12; 2, 6, 10, 14), drawn with graphSvg.
  const TREE_POS = [[8, 160, 26], [4, 85, 90], [12, 235, 90], [2, 40, 158], [6, 130, 158], [10, 190, 158], [14, 280, 158]];
  const treeSvg = name => graphSvg(TREE_POS.map(([id, x, y]) => ({ id, x, y, text: id })), [[8, 4], [8, 12], [4, 2], [4, 6], [12, 10], [12, 14]], { w: 320, ht: 182, r: 17, name });

  Lab.addTrack({
    id: 'cs',
    title: 'Data structures and algorithms',
    description: 'Big-O, the core data structures and the classic algorithm patterns, in Kotlin, to write faster code and solve problems with confidence.',
    requires: ['kotlin'],
    css,
    lessons: [
      {
        id: 'big-o',
        title: 'How fast is it?',
        tagline: 'Count how the steps grow when the list grows.',
        goals: ['Count the steps a piece of code takes as its list grows', 'Tell O(1), O(n) and O(n²) apart', 'Spot the loop inside a loop that makes code slow'],
        level: 'beginner', introduces: [],
        body: `
<p>A search in a notes app feels instant with 20 notes. Will the same code still feel instant with 20,000? Seconds don’t help much here, because they change from phone to phone. So programmers count <em>steps</em> instead: how many times the code looks at an item.</p>
<p><em>Big O</em> is a short way to say how the number of steps grows when the list grows. The letter n stands for how many items there are. O(1), read “O of 1”, means the same number of steps however long the list is: <code>guests[0]</code> goes straight to the first item. O(n) means one step per item: a <code>for</code> loop looking for a name may have to check every guest, so twice the guests means twice the steps.</p>
<p>Put a loop inside a loop over the same list and you get O(n²), “n squared”: for each of the n items, the inner loop takes n steps, n × n in total. Twice the items, four times the steps. With 10 items you won’t notice. With 100,000, this is the code that makes an app freeze.</p>
<p>Big O keeps only the big picture. Two loops one after the other take 2n steps, and that is still O(n): it still grows in a straight line. Only a loop <em>inside</em> a loop multiplies.</p>`,
        visual(el) {
          const rows = [['O(1)', () => 1, ''], ['O(n)', n => n, 'dsa-f-warm'], ['O(n²)', n => n * n, 'dsa-f-err']];
          const fills = [], nums = [];
          const nLabel = h('b', {}, '10');
          const meter = h('div', { class: 'dsa-meter' }, rows.map(([name, , cls], k) => {
            fills[k] = h('div', { class: `dsa-fill ${cls}` });
            nums[k] = h('span', { class: 'dsa-num' }, '');
            return [h('span', {}, name), h('div', { class: 'dsa-track' }, fills[k]), nums[k]];
          }));
          const view = h('div', { class: 'dsa-stage' },
            h('div', { class: 'dsa-row' }, label('names in the list'), h('span', { class: 'dsa-stat' }, 'n = ', nLabel)),
            meter,
            h('span', { class: 'dsa-stat' }, 'Steps for: reading guests[0], searching for the last name, a loop inside a loop.'));
          const fmt = v => v.toLocaleString('en-US');
          Lab.ui.player(el, {
            stage: h('div', { class: 'ui-stage' }, view),
            predict: {
              q: 'At n = 40, the loop inside a loop takes 1,600 steps. How many at n = 80?',
              options: ['3,200', '6,400', '1,680'],
              a: 1,
              why: 'Twice the items means n × n gets four times bigger: 80 × 80 = 6,400.',
            },
            frames: [
              { n: 10, say: '10 names. Reading the first one: 1 step. Searching for the last one: 10 steps. A loop inside a loop: 10 × 10 = 100 steps.' },
              { n: 20, say: 'Twice the names. The search takes twice the steps, 20. The loop inside a loop takes four times as many, 400.' },
              { n: 40, say: 'Doubled again: 40 and 1,600. Reading <code>guests[0]</code> still takes 1 step. That is O(1).' },
              { n: 80, say: '80 names: the search grows in a straight line, O(n). The loop inside a loop shoots up to 6,400, O(n²). With 80,000 names it would be 6,400,000,000 steps.' },
            ],
            draw(f) {
              nLabel.textContent = String(f.n);
              rows.forEach(([, fn], k) => { const v = fn(f.n); fills[k].style.width = `${(v / 6400) * 100}%`; nums[k].textContent = fmt(v); });
            },
          });
        },
        code: `fun main() {
    val guests = listOf("Ada", "Sam", "Lin", "Noor")
    println(guests[0])            // Ada. O(1): one step, however long the list

    var steps = 0
    for (guest in guests) {       // O(n): one step per guest
        steps++
    }
    println(steps)                // 4

    var pairSteps = 0
    for (a in guests) {           // O(n²): for each guest...
        for (b in guests) {       // ...look at every guest again
            pairSteps++
        }
    }
    println(pairSteps)            // 16
}`,
        play: `fun makeList(n: Int): List<Int> {
    val items = mutableListOf<Int>()
    for (i in 1..n) {
        items.add(i)
    }
    return items
}

fun stepsToFind(items: List<Int>, target: Int): Int {
    var steps = 0
    for (x in items) {
        steps++
        if (x == target) {
            return steps
        }
    }
    return steps
}

fun stepsForPairs(items: List<Int>): Int {
    var steps = 0
    for (a in items) {
        for (b in items) {
            steps++
        }
    }
    return steps
}

fun main() {
    for (n in listOf(10, 20, 40, 80)) {
        val items = makeList(n)
        val search = stepsToFind(items, n)
        val pairs = stepsForPairs(items)
        println("n = $n: search $search steps, pairs $pairs steps")
    }
    // Add 160 to the list. Before you run it, guess both numbers.
}`,
        remember: 'Count the steps as the list grows. No loop: O(1). One loop: O(n). A loop inside a loop: O(n²).',
        mistakes: [
          { title: 'Calling two loops in a row O(n²)', bad: 'for (p in prices) {\n    total += p\n}\nfor (p in prices) {\n    count++\n}\n// "Two loops, so O(n²)"', good: 'for (p in prices) {\n    total += p\n}\nfor (p in prices) {\n    count++\n}\n// n + n = 2n steps: still O(n)\n\nfor (a in prices) {\n    for (b in prices) {\n        count++\n    }\n}\n// n × n steps: this one is O(n²)', why: 'The first code is fine; only the reading was wrong. Loops one after the other add up: n + n. Only a loop inside a loop multiplies: n × n.' },
        ],
        terms: [
          { term: 'Big O', def: 'A short way to say how the number of steps grows as the number of items, n, grows.' },
          { term: 'O(1)', def: 'The same number of steps however many items there are, like reading <code>list[0]</code>.' },
          { term: 'O(n)', def: 'One step per item: twice the items, twice the steps. One loop over the list.' },
          { term: 'O(n²)', def: 'n × n steps: twice the items, four times the steps. A loop inside a loop over the same list.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the Big O of each part in its comment. Use n for the number of names.', code: 'println(names[0])        // O([[1]])\nfor (name in names) {    // O([[n]])\n    println(name)\n}', why: 'Reading one index is one step, whatever the size. The loop runs once per name.' },
          { type: 'bug', prompt: 'This should count one step per song and print 4. It prints 1. Tap the wrong line.', code: 'val songs = listOf("Intro", "Rain", "Night Bus", "Outro")\nvar steps = 0\nfor (song in songs) {\n    steps = 1\n}\nprintln(steps)', bug: 3, fix: '    steps++', why: '<code>steps = 1</code> puts 1 in the box every round. <code>steps++</code> adds one each round: 4 rounds, 4 steps.' },
        ],
        quiz: [
          { q: 'An O(n) search takes 1,000 steps on 1,000 names. About how many on 2,000 names?', options: ['2,000', '4,000', '1,001'], a: 0, why: 'O(n) grows in a straight line: twice the items, twice the steps.' },
          { q: 'A loop inside a loop goes over the same 10 items. How many times does the inner part run?', options: ['10', '20', '100'], a: 2, why: 'For each of the 10 items, the inner loop runs 10 times: 10 × 10 = 100. That is O(n²).' },
          { q: 'Which takes the same number of steps for 5 items and for 5 million?', options: ['<code>list[0]</code>', 'A <code>for</code> loop that prints every item'], a: 0, why: 'Reading one index is one step: O(1). The loop runs once per item: O(n).' },
        ],
        docs: [['Collections overview', 'https://kotlinlang.org/docs/collections-overview.html']],
      },

      {
        id: 'arrays-lists',
        title: 'Arrays and lists',
        tagline: 'Why reading item 5,000 is instant, but adding at the front is not.',
        goals: ['Make a fixed-size array with <code>IntArray</code> and <code>intArrayOf</code>', 'Explain why <code>list[i]</code> is O(1)', 'Explain why <code>add(0, x)</code> and <code>removeAt(0)</code> are O(n)'],
        level: 'beginner', introduces: ['IntArray', 'intArrayOf', 'ArrayList', 'removeAt'],
        body: `
<p>A playlist has 100,000 songs. Jumping to song 50,000 is instant, but putting a new song at the very top makes the phone do 100,000 moves. Both come from how a list is stored.</p>
<p>Underneath is an <em>array</em>: a row of slots side by side in memory, made once with a fixed number of slots. <code>IntArray(5)</code> makes 5 slots for <code>Int</code> values, all starting at 0, and <code>intArrayOf(90, 75, 82)</code> makes one holding those values. You read and write slots like list items: <code>scores[2] = 82</code>. Because the slots sit side by side, the computer can work out where slot 2 is and go straight there: O(1). An array’s size never changes, so it has no <code>add</code>.</p>
<p>A <code>mutableListOf</code> list is an <code>ArrayList</code>: a list that keeps its items in an array with spare slots at the end. <code>add(x)</code> fills the next free slot, so nothing moves. (When the spare slots run out, it makes a bigger array and copies everything over. That happens rarely, so adding at the end stays cheap.)</p>
<p>The front is different. <code>add(0, x)</code> puts <code>x</code> at index 0, so every item must first move one slot to the right. <code>removeAt(0)</code> removes the item at index 0, and every item after it moves one slot left. With n items, that is n moves: O(n).</p>`,
        visual(el) {
          const row = h('div', {});
          const view = h('div', { class: 'dsa-stage' }, label('the array inside shopping'), row);
          Lab.ui.player(el, {
            stage: h('div', { class: 'ui-stage' }, view),
            predict: {
              q: '<code>shopping.add(0, "bread")</code> needs slot 0 to be free. How many items have to move?',
              options: ['None', 'One', 'All four'],
              a: 2,
              why: 'Every item shifts one slot to the right to open a gap at the front.',
            },
            frames: [
              { a: ['milk', 'eggs', 'rice', 'tea', null], say: '<code>shopping</code> holds 4 items in an array with a free slot at the end. Now: <code>shopping.add(0, "bread")</code>.' },
              { a: ['milk', 'eggs', 'rice', 'tea', 'tea'], to: 4, from: 3, say: 'Start at the end: tea is copied from slot 3 to slot 4.' },
              { a: ['milk', 'eggs', 'rice', 'rice', 'tea'], to: 3, from: 2, say: 'rice moves from slot 2 to slot 3, over the old copy of tea.' },
              { a: ['milk', 'eggs', 'eggs', 'rice', 'tea'], to: 2, from: 1, say: 'eggs moves from slot 1 to slot 2.' },
              { a: ['milk', 'milk', 'eggs', 'rice', 'tea'], to: 1, from: 0, say: 'milk moves from slot 0 to slot 1. Slot 0 can be overwritten now.' },
              { a: ['bread', 'milk', 'eggs', 'rice', 'tea'], to: 0, done: true, say: 'bread goes into slot 0. 4 moves for 4 items: O(n). <code>shopping.add("bread")</code> at the end would have moved nothing.' },
            ],
            draw(f) {
              row.replaceChildren(cellRow(f.a.map((v, k) => ({
                v: v ?? '',
                cls: v == null ? 'dsa-empty' : k === f.to ? (f.done ? 'dsa-ok dsa-flash' : 'dsa-hot dsa-flash') : k === f.from ? 'dsa-dim' : '',
                tag: k === f.to ? (f.done ? 'new' : 'moved') : '',
              }))));
            },
          });
        },
        code: `fun main() {
    val temps = IntArray(3)             // 3 slots, all 0
    temps[0] = 12
    temps[2] = 9
    println(temps[1])                   // 0
    println(temps.size)                 // 3

    val scores = intArrayOf(90, 75, 82) // an array with values in it
    println(scores[2])                  // 82. O(1): straight to slot 2

    val queue = mutableListOf("Ada", "Sam", "Lin")   // an ArrayList
    queue.add("Noor")                   // [Ada, Sam, Lin, Noor]. At the end: nothing moves
    queue.add(0, "Ben")                 // [Ben, Ada, Sam, Lin, Noor]. O(n): 4 items move right
    queue.removeAt(0)                   // [Ada, Sam, Lin, Noor]. O(n): 4 items move left
    println(queue)                      // [Ada, Sam, Lin, Noor]
}`,
        play: `fun movesToAddAtFront(size: Int): Int {
    val slots = IntArray(size + 1)   // size items, plus one free slot at the end
    var moves = 0
    for (i in size downTo 1) {
        slots[i] = slots[i - 1]      // move one item a slot to the right
        moves++
    }
    slots[0] = 99                    // the front slot is free now
    return moves
}

fun main() {
    val shopping = mutableListOf("milk", "eggs", "rice")
    shopping.add("tea")              // at the end: nothing moves
    shopping.add(0, "bread")         // at the front: every item moves one slot
    println(shopping)

    for (n in listOf(10, 100, 1000)) {
        println("Add at the front of $n items: \${movesToAddAtFront(n)} moves")
    }
    // Try 10000. How many moves do you expect?
}`,
        remember: 'Reading by index is O(1). Adding at the end moves nothing. Adding or removing at the front moves every item: O(n).',
        mistakes: [
          { title: 'Trying to add to an array', bad: 'val scores = intArrayOf(90, 75)\nscores.add(82)   // Unresolved reference \'add\'.', good: 'val scores = mutableListOf(90, 75)\nscores.add(82)   // [90, 75, 82]', why: 'An array has a fixed number of slots. When the number of items changes, use a list.' },
        ],
        terms: [
          { term: 'array', def: 'A fixed number of slots side by side in memory. Reading any slot by index is O(1).' },
          { term: 'IntArray', def: 'An array of <code>Int</code>s. <code>IntArray(5)</code> makes 5 slots holding 0; <code>intArrayOf(1, 2)</code> makes one with those values.' },
          { term: 'ArrayList', def: 'The list <code>mutableListOf</code> gives you: an array with spare slots that grows when it is full.' },
          { term: 'removeAt()', def: '<code>list.removeAt(i)</code> removes the item at index <code>i</code>; the items after it move one slot left.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make an array with one slot per day of the week, and set Monday’s temperature.', code: 'val temps = [[IntArray]](7)\ntemps[0] = 12\nprintln(temps.[[size]])   // 7', why: '<code>IntArray(7)</code> makes 7 slots, all 0. <code>size</code> works on arrays like on lists.' },
          { type: 'bug', prompt: 'This should print 247, but it crashes with an out-of-bounds error. Tap the wrong line.', code: 'fun main() {\n    val scores = intArrayOf(90, 75, 82)\n    var total = 0\n    for (i in 0..scores.size) {\n        total += scores[i]\n    }\n    println(total)\n}', bug: 3, fix: '    for (i in scores.indices) {', why: '<code>0..scores.size</code> includes 3, one past the last slot. <code>indices</code> is <code>0..2</code> here.' },
        ],
        quiz: [
          { q: 'A list holds 1,000 items. How many items move when you call <code>add(0, x)</code>?', options: ['0', '1', '1,000'], a: 2, why: 'Every item shifts one slot right to make room at index 0. That is O(n).' },
          { q: 'What does <code>IntArray(4)</code> hold?', options: ['Four slots, all 0', 'Nothing: its size is 0', 'One slot holding 4'], a: 0, why: 'The number is how many slots to make. Each <code>Int</code> slot starts at 0.' },
          { q: 'Which one is O(1) on a list of n items?', options: ['<code>list[500]</code>', '<code>list.removeAt(0)</code>'], a: 0, why: 'Reading an index goes straight to the slot. Removing at the front moves every item after it.' },
        ],
        docs: [['Arrays', 'https://kotlinlang.org/docs/arrays.html'], ['List-specific operations', 'https://kotlinlang.org/docs/list-operations.html']],
      },

      {
        id: 'hashing',
        title: 'Hash maps',
        tagline: 'How a map finds a key without looking through them all.',
        goals: ['Explain how a hash code picks a bucket', 'Say what a collision is and why lookups stay fast', 'Use <code>HashMap</code>, and know that <code>mapOf</code> works the same way'],
        level: 'beginner', introduces: ['hashCode', 'HashMap'],
        body: `
<p>A phone book app holds a million names. <code>ages["Ada"]</code> comes back instantly, yet a loop through a million names would take a million steps. A map doesn’t search. It works out where Ada must be.</p>
<p>The trick is <em>hashing</em>. Every key can turn itself into a number, its <em>hash code</em>: <code>"Ada".hashCode()</code> is 65662, and it is the same every time. The map keeps an array of <em>buckets</em>. With 8 buckets, the remainder <code>65662 % 8</code> is 6, so Ada’s pair goes into bucket 6. To find Ada later, the map does the same calculation and goes straight to bucket 6: no searching, O(1).</p>
<p>Two keys can land in the same bucket. That is a <em>collision</em>: <code>"Sam"</code> and <code>"Omar"</code> both land in bucket 7. The bucket keeps both pairs, and a lookup checks the few keys in it with <code>==</code>. The map adds more buckets as it fills up, so buckets stay short and lookups stay O(1) on average.</p>
<p>Kotlin’s <code>HashMap&lt;String, Int&gt;()</code> is exactly this. The maps you have made with <code>mapOf</code> and <code>mutableMapOf</code> are a <code>LinkedHashMap</code>: a hash map that also remembers the order you added keys. (A real hash map mixes the hash code a little more before picking a bucket, but the idea is the same.)</p>`,
        visual(el) {
          const B = 8;
          const calc = h('div', { class: 'dsa-cmp' });
          const grid = h('div', {});
          const view = h('div', { class: 'dsa-stage' }, calc, label('8 buckets'), grid);
          const ada = ['Ada', 6], sam = ['Sam', 7], lin = ['Lin', 1], noor = ['Noor', 4], omar = ['Omar', 7];
          Lab.ui.player(el, {
            stage: h('div', { class: 'ui-stage' }, view),
            predict: {
              q: 'Omar’s bucket is 7, and Sam is already in bucket 7. What happens?',
              options: ['Omar replaces Sam', 'Both stay in bucket 7', 'The program crashes'],
              a: 1,
              why: 'A bucket can hold more than one pair. Only the same key replaces a value.',
            },
            frames: [
              { keys: [], calc: 'ages = HashMap&lt;String, Int&gt;()', say: 'An empty hash map with 8 buckets, numbered 0 to 7.' },
              { keys: [ada], at: 6, calc: '"Ada".hashCode() = 65662, 65662 % 8 = 6', say: 'Ada’s hash code is 65662. The remainder after dividing by 8 is 6, so Ada goes into bucket 6.' },
              { keys: [ada, sam], at: 7, calc: '"Sam".hashCode() = 82879, 82879 % 8 = 7', say: 'Sam lands in bucket 7.' },
              { keys: [ada, sam, lin, noor], at: 4, calc: 'Lin: 76401 % 8 = 1   Noor: 2433924 % 8 = 4', say: 'Lin goes into bucket 1 and Noor into bucket 4. Each one took a single calculation, however full the map is.' },
              { keys: [ada, sam, lin, noor, omar], at: 7, hot: true, calc: '"Omar".hashCode() = 2461359, 2461359 % 8 = 7', say: 'Omar also lands in bucket 7: a collision. The bucket now holds two pairs.' },
              { keys: [ada, sam, lin, noor, omar], at: 7, find: 'Sam', calc: 'ages["Omar"]: 2461359 % 8 = 7', say: 'Looking up Omar: the same calculation points to bucket 7. The first key there is Sam. Not equal.' },
              { keys: [ada, sam, lin, noor, omar], at: 7, find: 'Omar', ok: true, calc: 'ages["Omar"]: found in bucket 7', say: 'The next key is Omar: found. Two checks in one short bucket, not a search through every name.' },
            ],
            draw(f) {
              calc.innerHTML = f.calc;
              grid.replaceChildren(h('div', { class: 'dsa-buckets' }, Array.from({ length: B }, (_, k) => {
                const inB = f.keys.filter(([, b]) => b === k);
                const cls = k !== f.at ? '' : f.ok ? 'dsa-ok' : f.hot ? 'dsa-hot' : 'dsa-on';
                return h('div', { class: `dsa-bucket ${cls}` }, h('span', { class: 'dsa-bi' }, String(k)),
                  inB.map(([name]) => pill(name, f.find === name ? (f.ok ? 'dsa-ok' : 'dsa-warm') : '')));
              })));
            },
          });
        },
        code: `fun main() {
    println("Ada".hashCode())         // 65662, every time
    println("Ada".hashCode() % 8)     // 6: Ada's bucket out of 8

    val stock = HashMap<String, Int>()
    stock["pears"] = 4                // O(1) on average
    stock["plums"] = 9
    println(stock["pears"])           // 4
    println(stock["figs"])            // null: no "figs" in its bucket

    val prices = mutableMapOf("tea" to 3)   // a hash map too
    println(prices["tea"])            // 3
}`,
        play: `fun main() {
    val names = listOf("Ada", "Sam", "Lin", "Noor", "Omar")
    for (name in names) {
        val code = name.hashCode()
        println("$name: hash code $code, bucket \${code % 8}")
    }

    val ages = HashMap<String, Int>()
    ages["Ada"] = 36
    ages["Omar"] = 41
    println(ages["Omar"])
    // Add a short name of your own to the list. Which bucket does it land in?
    // Long names can give a negative hash code, and then a negative remainder.
    // A real map removes the minus sign before picking a bucket.
}`,
        remember: 'A map turns each key into a hash code, and the hash code picks a bucket. No searching: O(1) on average.',
        terms: [
          { term: 'hash code', def: 'A number a value makes from itself, always the same for the same value: <code>"Ada".hashCode()</code>.' },
          { term: 'bucket', def: 'One slot in a hash map’s array. The hash code decides which bucket a key goes in.' },
          { term: 'collision', def: 'Two different keys landing in the same bucket. The bucket keeps both.' },
          { term: 'HashMap', def: 'Kotlin’s hash map: <code>HashMap&lt;String, Int&gt;()</code>. <code>mapOf</code> and <code>mutableMapOf</code> work the same way and also keep the order.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make an empty hash map from fruit names to amounts, then store 4 pears.', code: 'val stock = [[HashMap]]<String, Int>()\nstock["pears"] = 4\nprintln(stock["pears"])   // 4', why: '<code>HashMap&lt;String, Int&gt;()</code> makes an empty map with <code>String</code> keys and <code>Int</code> values.' },
          { type: 'bug', prompt: 'This should count each word and print <code>{red=2, blue=1}</code>. It prints <code>{red=1, blue=1}</code>. Tap the wrong line.', code: 'fun main() {\n    val words = listOf("red", "blue", "red")\n    val counts = mutableMapOf<String, Int>()\n    for (word in words) {\n        counts[word] = 1\n    }\n    println(counts)\n}', bug: 4, fix: '        counts[word] = counts.getOrDefault(word, 0) + 1', why: 'Each word should add one to its count so far. <code>getOrDefault</code> gives 0 the first time a word appears.' },
        ],
        quiz: [
          { q: 'Why is <code>ages["Ada"]</code> fast in a map with a million names?', options: ['Ada’s hash code says which bucket to look in', 'The map checks every name very quickly', 'The map keeps its names in alphabetical order'], a: 0, why: 'The map does one calculation to find the bucket, then checks the few keys in it.' },
          { q: 'What is a collision?', options: ['Two keys landing in the same bucket', 'Adding the same key twice', 'A crash when the map is full'], a: 0, why: 'Different keys can share a bucket. The bucket holds both, and lookups compare keys with <code>==</code>.' },
          { q: '<code>"Lin".hashCode()</code> is 76401. With 8 buckets, which bucket does Lin go in?', options: ['1', '7', '0'], a: 0, why: '76400 is 8 × 9550, so <code>76401 % 8</code> leaves 1.' },
        ],
        docs: [['HashMap', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-hash-map/'], ['Collections overview', 'https://kotlinlang.org/docs/collections-overview.html']],
      },

      {
        id: 'sets',
        title: 'Sets',
        tagline: 'Have I seen this before? Ask a set, not a list.',
        goals: ['Check whether a value is there in O(1) with a set', 'Collect values without duplicates using <code>mutableSetOf</code>', 'Turn a list into a set with <code>toSet()</code>'],
        level: 'beginner', introduces: ['mutableSetOf', 'HashSet', 'toSet'],
        body: `
<p>A music app shouldn’t suggest a song you have already heard today. With a list of heard songs, <code>song in heard</code> checks the list item by item: O(n), and it runs again for every new song. A set answers the same question in about one step.</p>
<p>A set works like a hash map with keys and no values. Each value goes into the bucket its hash code picks, so <code>"Rain" in heard</code> looks in one bucket: O(1) on average. That is also why a set keeps each value once: a second <code>"Rain"</code> lands in the same bucket, finds the first one there, and isn’t added.</p>
<p>For a set that changes, use <code>mutableSetOf()</code>. Its <code>add(x)</code> gives back <code>true</code> if <code>x</code> was new and <code>false</code> if it was already there, so one call both stores the value and tells you whether you had seen it. <code>toSet()</code> turns a list into a set, dropping the duplicates.</p>
<p>Kotlin’s plain hash set is <code>HashSet</code>. <code>setOf</code> and <code>mutableSetOf</code> give a <code>LinkedHashSet</code>, a hash set that also keeps the order values were first added.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val words = listOf("red", "blue", "red", "green", "blue")\n    val seen = mutableSetOf<String>()\n    for (word in words) {\n        if (!seen.add(word)) {\n            println("Seen before: $word")\n        }\n    }\n    println(seen)\n}',
            predict: {
              q: 'What does this program print first?',
              options: ['<code>Seen before: red</code>', '<code>Seen before: blue</code>', '<code>[red, blue, green]</code>'],
              a: 0,
              why: 'red is the first word that comes a second time, at position 2.',
            },
            frames: [
              { line: 2, vars: { words: '[red, blue, red, green, blue]' }, say: 'Five words, and two of them come twice.' },
              { line: 3, vars: { seen: '[]' }, say: 'An empty set that can change.' },
              { line: [4, 5], vars: { word: 'red', seen: '[red]' }, say: '<code>seen.add("red")</code>: red is new, so it goes in and <code>add</code> gives <code>true</code>. <code>!true</code> is <code>false</code>, so nothing is printed.' },
              { line: [4, 5], vars: { word: 'blue', seen: '[red, blue]' }, say: 'blue is new too: added, nothing printed.' },
              { line: [5, 6], vars: { word: 'red' }, out: 'Seen before: red', say: 'red again. Its bucket already holds red, so nothing is added and <code>add</code> gives <code>false</code>. <code>!false</code> is <code>true</code>: print.' },
              { line: [4, 5], vars: { word: 'green', seen: '[red, blue, green]' }, say: 'green is new: added.' },
              { line: [5, 6], vars: { word: 'blue' }, out: 'Seen before: blue', say: 'blue is already there: <code>add</code> gives <code>false</code>, so it is printed.' },
              { line: 9, vars: { word: null }, out: '[red, blue, green]', say: 'Each word once, in the order it first came. Every <code>add</code> looked in one bucket, O(1) on average, so the whole loop is O(n).' },
            ],
          });
        },
        code: `fun main() {
    val tags = mutableSetOf("kotlin")
    println(tags.add("android"))    // true: it was new
    println(tags.add("kotlin"))     // false: already there, nothing added
    println("android" in tags)      // true. O(1) on average, like a map key

    val colors = listOf("red", "blue", "red")
    println(colors.toSet())         // [red, blue]

    val ids = HashSet<Int>()
    ids.add(7)
    println(ids.size)               // 1
}`,
        play: `fun main() {
    val visitors = listOf("Ada", "Sam", "Ada", "Lin", "Sam", "Ada")
    val unique = visitors.toSet()
    println(unique)
    println("\${visitors.size} visits, \${unique.size} people")

    val guests = HashSet<String>()
    println(guests.add("Noor"))
    println(guests.add("Noor"))
    println("Noor" in guests)
    println("Ben" in guests)
    // Add "Lin" to visitors twice more. Does the number of people change?
}`,
        remember: 'To ask “is it in here?”, use a set: O(1) on average, and each value is kept once.',
        mistakes: [
          { title: 'Checking a growing list inside a loop', bad: 'val seen = mutableListOf<String>()\nfor (word in words) {\n    if (word in seen) {    // O(n) every time\n        println(word)\n    }\n    seen.add(word)\n}', good: 'val seen = mutableSetOf<String>()\nfor (word in words) {\n    if (!seen.add(word)) {    // O(1) on average\n        println(word)\n    }\n}', why: '<code>in</code> on a list looks at the items one by one, so the whole loop is O(n²). With a set it is O(n).' },
        ],
        terms: [
          { term: 'membership', def: 'Whether a value is in a collection. <code>x in s</code> asks it.' },
          { term: 'mutableSetOf', def: 'Makes a set you can add to. <code>add(x)</code> gives <code>false</code> if <code>x</code> was already there.' },
          { term: 'HashSet', def: 'Kotlin’s hash set: values go into buckets picked by their hash codes, so checking membership is O(1) on average.' },
          { term: 'toSet()', def: 'Gives a set with the list’s values, each one once.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Count how many different people visited.', code: 'val visits = listOf("Ada", "Sam", "Ada")\nval people = visits.[[toSet]]()\nprintln(people.[[size]])   // 2', why: '<code>toSet()</code> drops the second Ada, so 2 people are left.' },
          { type: 'bug', prompt: 'This doesn’t compile: <code>Unresolved reference \'add\'.</code> Tap the wrong line.', code: 'fun main() {\n    val seen = setOf<String>()\n    seen.add("red")\n    println(seen)\n}', bug: 1, fix: '    val seen = mutableSetOf<String>()', why: 'A <code>setOf</code> set can’t change. <code>mutableSetOf</code> makes one with <code>add</code>.' },
        ],
        quiz: [
          { q: '<code>val s = mutableSetOf("a")</code>. What does <code>s.add("a")</code> give?', options: ['<code>false</code>', '<code>true</code>', 'An error'], a: 0, why: '"a" is already there, so nothing is added and <code>add</code> says <code>false</code>.' },
          { q: 'Why is <code>x in set</code> faster than <code>x in list</code> when there are many items?', options: ['The set looks in the one bucket that x’s hash code picks', 'A set holds fewer items', 'A list must be sorted first'], a: 0, why: 'A list is checked item by item, O(n). A set goes to one bucket, O(1) on average.' },
          { q: 'What does <code>println(listOf(3, 1, 3, 2).toSet())</code> print?', options: ['<code>[3, 1, 2]</code>', '<code>[1, 2, 3]</code>', '<code>[3, 1, 3, 2]</code>'], a: 0, why: 'The second 3 is dropped, and the set keeps the order values first came in.' },
        ],
        docs: [['HashSet', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-hash-set/'], ['Set-specific operations', 'https://kotlinlang.org/docs/set-operations.html']],
      },

      {
        id: 'stacks-queues',
        title: 'Stacks and queues',
        tagline: 'Last in, first out. First in, first out.',
        goals: ['Use a stack for “the latest one first”', 'Use a queue for “first come, first served”', 'Do both with <code>ArrayDeque</code> in O(1)'],
        level: 'beginner', introduces: ['ArrayDeque', 'addLast', 'removeLast', 'removeFirst', 'isEmpty', 'isNotEmpty'],
        body: `
<p>Press undo in a notes app and the latest change is undone first. Wait in line at a bakery and the person who came first is served first. These two orders turn up all over programs, and each has a name.</p>
<p>A <em>stack</em> works like a pile of plates: you add on top and take from the top. The last item in is the first out, called <em>LIFO</em>. A <em>queue</em> works like a line of people: you join at the back and leave from the front. The first in is the first out: <em>FIFO</em>.</p>
<p>Kotlin’s <code>ArrayDeque</code> (say “array deck”) does both. <code>addLast(x)</code> adds at the end. For a stack, take items back with <code>removeLast()</code>; for a queue, with <code>removeFirst()</code>. Both give you the item they removed. <code>isEmpty()</code> and <code>isNotEmpty()</code> tell you whether anything is left, which makes a handy <code>while</code> condition.</p>
<p>Why not a <code>mutableListOf</code> list? Its <code>removeAt(0)</code> moves every item: O(n). An <code>ArrayDeque</code> keeps track of where its front is, so taking from either end moves nothing: O(1).</p>`,
        visual(el) {
          const stackBox = h('div', { class: 'dsa-stack' });
          const queueBox = h('div', { class: 'dsa-queue' });
          const calls = h('div', { class: 'dsa-cmp' });
          const view = h('div', { class: 'dsa-stage' }, calls,
            h('div', { class: 'dsa-split' },
              h('div', { class: 'dsa-col' }, label('queue (front highlighted)'), queueBox),
              h('div', { class: 'dsa-col' }, label('stack (top highlighted)'), stackBox)));
          Lab.ui.player(el, {
            stage: h('div', { class: 'ui-stage' }, view),
            predict: {
              q: 'Ada, Sam and Lin are added to both, in that order. What do <code>stack.removeLast()</code> and <code>queue.removeFirst()</code> give back first?',
              options: ['Stack: Lin. Queue: Ada.', 'Stack: Ada. Queue: Ada.', 'Stack: Lin. Queue: Lin.'],
              a: 0,
              why: 'The stack gives back the last one in. The queue gives back the first one in.',
            },
            frames: [
              { s: [], q: [], calls: 'val stack = ArrayDeque&lt;String&gt;()<br>val queue = ArrayDeque&lt;String&gt;()', say: 'Two empty <code>ArrayDeque</code>s. One is used as a stack, the other as a queue.' },
              { s: ['Ada'], q: ['Ada'], calls: 'stack.addLast("Ada")<br>queue.addLast("Ada")', say: 'Ada goes into both.' },
              { s: ['Ada', 'Sam'], q: ['Ada', 'Sam'], calls: 'stack.addLast("Sam")<br>queue.addLast("Sam")', say: 'Sam goes on top of the stack, and to the back of the queue.' },
              { s: ['Ada', 'Sam', 'Lin'], q: ['Ada', 'Sam', 'Lin'], calls: 'stack.addLast("Lin")<br>queue.addLast("Lin")', say: 'Lin goes on top of the stack and to the back of the queue. Same three names, same order, in both.' },
              { s: ['Ada', 'Sam'], q: ['Sam', 'Lin'], out: ['Lin', 'Ada'], calls: 'stack.removeLast()  → Lin<br>queue.removeFirst() → Ada', say: 'The stack gives back Lin, the last one in: LIFO. The queue gives back Ada, the first one in: FIFO.' },
              { s: ['Ada'], q: ['Lin'], out: ['Sam', 'Sam'], calls: 'stack.removeLast()  → Sam<br>queue.removeFirst() → Sam', say: 'Both give back Sam this time. Ada is left on the stack, Lin in the queue. Nothing had to move: O(1).' },
            ],
            draw(f) {
              calls.innerHTML = f.calls;
              stackBox.replaceChildren(...f.s.map((v, k) => pill(v, k === f.s.length - 1 ? 'dsa-acc' : '')));
              queueBox.replaceChildren(...f.q.map((v, k) => pill(v, k === 0 ? 'dsa-acc' : '')));
            },
          });
        },
        code: `fun main() {
    val stack = ArrayDeque<Int>()
    stack.addLast(1)
    stack.addLast(2)
    stack.addLast(3)
    println(stack.removeLast())     // 3: last in, first out
    println(stack)                  // [1, 2]

    val queue = ArrayDeque<Int>()
    queue.addLast(1)
    queue.addLast(2)
    queue.addLast(3)
    println(queue.removeFirst())    // 1: first in, first out
    println(queue)                  // [2, 3]
    println(queue.isEmpty())        // false
}`,
        play: `fun main() {
    // A queue: the first one in line is served first
    val line = ArrayDeque<String>()
    line.addLast("Ada")
    line.addLast("Sam")
    line.addLast("Lin")
    while (line.isNotEmpty()) {
        val next = line.removeFirst()
        println("Serving $next, still waiting: $line")
    }

    // A stack: the last page you opened is the first you go back from
    val pages = ArrayDeque<String>()
    pages.addLast("Home")
    pages.addLast("Recipes")
    pages.addLast("Soup")
    println("Back from \${pages.removeLast()}")
    println("Now on \${pages.last()}")
    println(pages.isEmpty())
    // Swap removeFirst() and removeLast() in the two parts. What changes?
}`,
        remember: 'Stack: addLast + removeLast, the latest first. Queue: addLast + removeFirst, the oldest first. ArrayDeque does both in O(1).',
        mistakes: [
          { title: 'Taking from an empty deque', bad: 'val jobs = ArrayDeque<String>()\nprintln(jobs.removeFirst())\n// NoSuchElementException: ArrayDeque is empty.', good: 'val jobs = ArrayDeque<String>()\nif (jobs.isNotEmpty()) {\n    println(jobs.removeFirst())\n}', why: 'There is nothing to give back, so the program crashes. Check with <code>isNotEmpty()</code> first.' },
        ],
        terms: [
          { term: 'stack', def: 'Add and take at the same end. The last item in is the first out (LIFO).' },
          { term: 'queue', def: 'Add at the back, take from the front. The first item in is the first out (FIFO).' },
          { term: 'LIFO / FIFO', def: 'Last in, first out (a stack) / first in, first out (a queue).' },
          { term: 'ArrayDeque', def: 'Kotlin’s list that is cheap at both ends: <code>addLast</code>, <code>removeLast</code> and <code>removeFirst</code> are O(1).' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Undo the latest change first.', code: 'val changes = ArrayDeque<String>()\nchanges.[[addLast]]("bold")\nchanges.addLast("italic")\nprintln(changes.[[removeLast]]())   // italic', why: 'Undo is a stack: the change added last comes back first.' },
          { type: 'bug', prompt: 'Customers should be served in the order they came, Ada first. This serves Sam. Tap the wrong line.', code: 'fun main() {\n    val line = ArrayDeque<String>()\n    line.addLast("Ada")\n    line.addLast("Sam")\n    println(line.removeLast())\n}', bug: 4, fix: '    println(line.removeFirst())', why: 'A line of customers is a queue: take from the front with <code>removeFirst()</code>.' },
        ],
        quiz: [
          { q: 'Which one gives back the item added last?', options: ['A stack', 'A queue'], a: 0, why: 'A stack is last in, first out. A queue is first in, first out.' },
          { q: 'A printer prints documents in the order they were sent. Which fits?', options: ['A queue', 'A stack'], a: 0, why: 'The first document sent is printed first: FIFO.' },
          { q: 'Why use <code>ArrayDeque</code> for a queue instead of a list with <code>removeAt(0)</code>?', options: ['<code>removeFirst()</code> is O(1), while <code>removeAt(0)</code> moves every item: O(n)', 'Lists can’t hold Strings', 'There is no difference'], a: 0, why: 'A list shifts all its items left. An <code>ArrayDeque</code> only moves its front marker.' },
        ],
        docs: [['ArrayDeque', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-array-deque/']],
      },

      {
        id: 'recursion',
        title: 'Recursion',
        tagline: 'A function that calls itself on a smaller problem.',
        goals: ['Write a function that calls itself', 'Give it a base case so it stops', 'Follow the waiting calls on the call stack'],
        level: 'beginner', introduces: [],
        body: `
<p>Adding up 1 + 2 + 3 and so on up to 100 by hand takes a while. But if someone tells you the sum up to 99, you need one more step: add 100. Some problems are easiest to solve like that, as one small step plus a smaller copy of the same problem.</p>
<p>A function that calls itself is called <em>recursion</em>. <code>sumTo(n)</code> returns <code>n + sumTo(n - 1)</code>: to work out <code>sumTo(3)</code>, it asks for <code>sumTo(2)</code>, which asks for <code>sumTo(1)</code>. Each call gets its own <code>n</code>, like a separate box.</p>
<p>It has to stop somewhere. The <em>base case</em> is the input you can answer without calling again: <code>sumTo(1)</code> is 1. Then the answers travel back: <code>sumTo(2)</code> is 2 + 1, and <code>sumTo(3)</code> is 3 + 3. The calls that are waiting sit on the <em>call stack</em>, a stack like in the last lesson: the latest call finishes first.</p>
<p>Forget the base case and the calls never end. The call stack fills up and the program crashes with <code>StackOverflowError</code>. <code>sumTo(n)</code> makes n calls, so it is O(n), the same as a loop.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun sumTo(n: Int): Int {\n    if (n == 1) {\n        return 1\n    }\n    return n + sumTo(n - 1)\n}\n\nfun main() {\n    println(sumTo(3))\n}',
            predict: {
              q: 'What does <code>println(sumTo(3))</code> print?',
              options: ['6', '3', 'Nothing: it never stops'],
              a: 0,
              why: '3 + 2 + 1 = 6. The calls stop at the base case, <code>n == 1</code>.',
            },
            frames: [
              { line: 9, stack: ['main()'], say: '<code>main</code> asks for <code>sumTo(3)</code>.' },
              { line: 2, stack: ['main()', 'sumTo(3)'], vars: { n: '3' }, say: 'A call starts with its own <code>n</code>, here 3. It isn’t 1, so the <code>if</code> is skipped.' },
              { line: 2, stack: ['main()', 'sumTo(3)', 'sumTo(2)'], vars: { n: '2' }, say: '<code>sumTo(3)</code> reaches line 5, <code>3 + sumTo(2)</code>: to finish, it needs <code>sumTo(2)</code>. It waits on the stack while a new call starts with its own <code>n</code> = 2. It isn’t 1, so the <code>if</code> is skipped.' },
              { line: 2, stack: ['main()', 'sumTo(3)', 'sumTo(2)', 'sumTo(1)'], vars: { n: '1' }, say: 'The same again: <code>sumTo(2)</code> waits for <code>sumTo(1)</code>. This time <code>n</code> is 1, so the <code>if</code> is true.' },
              { line: 3, stack: ['main()', 'sumTo(3)', 'sumTo(2)', 'sumTo(1)'], vars: { n: '1' }, say: 'Base case: <code>n</code> is 1, so it returns 1 without calling again.' },
              { line: 5, stack: ['main()', 'sumTo(3)', 'sumTo(2)'], vars: { n: '2' }, say: '<code>sumTo(1)</code> is done and leaves the stack. <code>sumTo(2)</code> can finish now: 2 + 1 = 3.' },
              { line: 5, stack: ['main()', 'sumTo(3)'], vars: { n: '3' }, say: 'Back in <code>sumTo(3)</code>, with its own <code>n</code> still 3: 3 + 3 = 6.' },
              { line: 9, stack: ['main()'], vars: { n: null }, out: '6', say: 'The latest call finished first, the first call finished last. Three calls for n = 3: O(n).' },
            ],
          });
        },
        code: `fun factorial(n: Int): Int {
    if (n == 1) {                   // base case: the answer is known, stop here
        return 1
    }
    return n * factorial(n - 1)     // a smaller copy of the same problem
}

fun main() {
    println(factorial(4))           // 24, which is 4 * 3 * 2 * 1
    println(factorial(1))           // 1, straight from the base case
}`,
        play: `fun countdown(n: Int) {
    if (n == 0) {
        println("Liftoff!")
        return
    }
    println(n)
    countdown(n - 1)
}

fun sumTo(n: Int): Int {
    if (n == 1) {
        return 1
    }
    return n + sumTo(n - 1)
}

fun main() {
    countdown(3)
    println(sumTo(4))
    println(sumTo(100))
    // Remove the if block in sumTo and run it. What happens?
}`,
        remember: 'A recursive function calls itself on a smaller input, and its base case answers without calling again.',
        mistakes: [
          { title: 'No base case', bad: 'fun sumTo(n: Int): Int {\n    return n + sumTo(n - 1)\n}\n// Exception in thread "main" java.lang.StackOverflowError', good: 'fun sumTo(n: Int): Int {\n    if (n == 1) {\n        return 1\n    }\n    return n + sumTo(n - 1)\n}', why: 'Without a base case, every call makes another call. The call stack fills up and the program crashes.' },
        ],
        terms: [
          { term: 'recursion', def: 'A function calling itself, each time on a smaller version of the problem.' },
          { term: 'base case', def: 'The input a recursive function answers straight away, without calling itself. It makes the calls stop.' },
          { term: 'call stack', def: 'Where the calls that haven’t finished yet wait. The latest call is on top and finishes first.' },
          { term: 'StackOverflowError', def: 'The crash you get when too many calls are waiting, usually because the base case is missing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the factorial: <code>factorial(4)</code> is 4 * 3 * 2 * 1.', code: 'fun factorial(n: Int): Int {\n    if (n == [[1]]) {\n        return 1\n    }\n    return n * [[factorial]](n - 1)\n}', why: 'The base case is 1. Every other call multiplies <code>n</code> by the factorial of one less.' },
          { type: 'bug', prompt: 'This should print 6, but it crashes with <code>StackOverflowError</code>. Tap the wrong line.', code: 'fun sumTo(n: Int): Int {\n    if (n == 1) {\n        return 1\n    }\n    return n + sumTo(n)\n}\n\nfun main() {\n    println(sumTo(3))\n}', bug: 4, fix: '    return n + sumTo(n - 1)', why: '<code>sumTo(n)</code> calls itself with the same <code>n</code>, so it never gets smaller and never reaches 1.' },
        ],
        quiz: [
          { q: 'What is a base case?', options: ['The input a recursive function answers without calling itself', 'The first line of every function', 'The biggest input a function accepts'], a: 0, why: 'It is where the calls stop and the answers start travelling back.' },
          { q: 'How many calls of <code>sumTo</code> does <code>sumTo(4)</code> make, counting itself?', options: ['4', '1', '10'], a: 0, why: '<code>sumTo(4)</code>, <code>sumTo(3)</code>, <code>sumTo(2)</code> and <code>sumTo(1)</code>: one call per number, O(n). 10 is the answer it returns.' },
          { q: 'What happens when a recursive function has no base case?', options: ['It keeps calling itself until the call stack is full: <code>StackOverflowError</code>', 'It returns 0', 'Kotlin refuses to compile it'], a: 0, why: 'It compiles, but every call starts another one until the program crashes.' },
        ],
        docs: [['Functions', 'https://kotlinlang.org/docs/functions.html']],
      },

      {
        id: 'two-pointers',
        title: 'Two pointers',
        tagline: 'Walk in from both ends instead of trying every pair.',
        goals: ['Find a pair in a sorted list by walking in from both ends', 'Decide which pointer to move after each comparison', 'See why this takes O(n) steps instead of O(n²)'],
        level: 'beginner', introduces: [],
        body: `
<p>You have a gift card worth 12 and a list of prices, smallest first: 2, 4, 5, 8, 11, 15. Which two items use up the card exactly? Trying every pair with a loop inside a loop works, but that is O(n²): for 1,000 prices, up to 499,500 tries.</p>
<p>Use two <em>pointers</em> instead: two <code>var</code>s that hold indexes. <code>left</code> starts at the first price, <code>right</code> at the last. Add the two prices. Too big? Move <code>right</code> one slot left, to a smaller price. Too small? Move <code>left</code> one slot right, to a bigger one. Equal? Found.</p>
<p>This only works because the list is <em>sorted</em>, in order from smallest to largest. When 2 + 15 is too big, 15 is too big with every other price as well, since they are all at least 2. So each step rules out one price for good, and the pointers meet after at most n steps: O(n).</p>
<p>If your list isn’t in order yet, <code>sortedBy { it }</code> gives you a sorted copy first.</p>`,
        visual(el) {
          const P = [2, 4, 5, 8, 11, 15];
          const row = h('div', {});
          const sum = h('div', { class: 'dsa-cmp' });
          const view = h('div', { class: 'dsa-stage' }, label('prices, target 12'), row, sum);
          Lab.ui.player(el, {
            stage: h('div', { class: 'ui-stage' }, view),
            predict: {
              q: 'The first sum is 2 + 15 = 17, more than 12. Which pointer should move?',
              options: ['<code>right</code>, one slot left', '<code>left</code>, one slot right'],
              a: 0,
              why: 'The sum is too big, and only a smaller right price can make it smaller.',
            },
            frames: [
              { l: 0, r: 5, out: [], text: 'step 1: 2 + 15 = 17, too big', say: '<code>left</code> starts at the first price, <code>right</code> at the last. 2 + 15 = 17: more than 12.' },
              { l: 0, r: 4, out: [5], text: 'step 2: 2 + 11 = 13, too big', say: '<code>right</code> moves left. 15 is ruled out: even with the smallest price it is too big. 2 + 11 = 13: still too big.' },
              { l: 0, r: 3, out: [4, 5], text: 'step 3: 2 + 8 = 10, too small', say: '<code>right</code> moves again. 2 + 8 = 10: now too small.' },
              { l: 1, r: 3, out: [0, 4, 5], text: 'step 4: 4 + 8 = 12, found', say: 'Too small, so <code>left</code> moves right, to a bigger price. 2 is ruled out. 4 + 8 = 12.' },
              { l: 1, r: 3, out: [0, 4, 5], done: true, text: 'found 4 + 8 in 4 steps', say: 'Found in 4 steps. A loop inside a loop could try up to 15 pairs for 6 prices.' },
            ],
            draw(f) {
              row.replaceChildren(cellRow(P.map((v, k) => ({
                v,
                cls: f.out.includes(k) ? 'dsa-dim' : (k === f.l || k === f.r) ? (f.done ? 'dsa-ok' : 'dsa-on') : '',
                tag: k === f.l ? 'left' : k === f.r ? 'right' : '',
              }))));
              sum.textContent = f.text;
            },
          });
        },
        code: `fun findPair(prices: List<Int>, target: Int): String {
    var left = 0
    var right = prices.size - 1
    while (left < right) {
        val sum = prices[left] + prices[right]
        if (sum == target) {
            return "\${prices[left]} + \${prices[right]}"
        } else if (sum < target) {
            left++
        } else {
            right -= 1
        }
    }
    return "no pair"
}

fun main() {
    val prices = listOf(2, 4, 5, 8, 11, 15)
    println(findPair(prices, 12))   // 4 + 8
    println(findPair(prices, 30))   // no pair
}`,
        play: `fun stepsWithTwoPointers(prices: List<Int>, target: Int): Int {
    var steps = 0
    var left = 0
    var right = prices.size - 1
    while (left < right) {
        steps++
        val sum = prices[left] + prices[right]
        if (sum == target) {
            return steps
        } else if (sum < target) {
            left++
        } else {
            right -= 1
        }
    }
    return steps
}

fun stepsWithTwoLoops(prices: List<Int>, target: Int): Int {
    var steps = 0
    for (i in prices.indices) {
        for (j in i + 1 until prices.size) {
            steps++
            if (prices[i] + prices[j] == target) {
                return steps
            }
        }
    }
    return steps
}

fun main() {
    for (n in listOf(10, 100, 1000)) {
        val prices = mutableListOf<Int>()
        for (i in 1..n) {
            prices.add(i * 2)       // 2, 4, 6, ... already in order
        }
        val target = 1              // no two even prices add up to 1: the worst case
        val fast = stepsWithTwoPointers(prices, target)
        val slow = stepsWithTwoLoops(prices, target)
        println("n = $n: two pointers $fast steps, two loops $slow steps")
    }
    // Change the target to 6 (2 + 4). Which way wins now, and why?
}`,
        remember: 'On a sorted list, start one pointer at each end. Too big: move right in. Too small: move left in. O(n).',
        mistakes: [
          { title: 'Using two pointers on a list that isn’t sorted', bad: 'val prices = listOf(15, 4, 2, 8, 11, 5)\nprintln(findPair(prices, 12))   // no pair', good: 'val prices = listOf(15, 4, 2, 8, 11, 5)\nprintln(findPair(prices.sortedBy { it }, 12))   // 4 + 8', why: 'Moving a pointer only makes the sum smaller or bigger when the prices are in order. Sort first.' },
        ],
        terms: [
          { term: 'pointer', def: 'Here: a <code>var</code> that holds an index and moves along the list, like <code>left</code> and <code>right</code>.' },
          { term: 'two pointers', def: 'Two indexes that walk through a list, often from both ends toward each other, ruling out an item each step.' },
          { term: 'sorted', def: 'In order, smallest first. <code>sortedBy { it }</code> gives a sorted copy of a list of numbers.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start the two pointers at both ends of the list.', code: 'var left = [[0]]\nvar right = prices.[[size]] - 1', why: 'The first index is 0 and the last is <code>size - 1</code>.' },
          { type: 'bug', prompt: 'With prices 2, 4, 5, 8, 11, 15 and target 12, this should find 4 + 8, but it says no pair. Tap the wrong line.', code: 'fun findPair(prices: List<Int>, target: Int): String {\n    var left = 0\n    var right = prices.size - 1\n    while (left < right) {\n        val sum = prices[left] + prices[right]\n        if (sum == target) {\n            return "\${prices[left]} + \${prices[right]}"\n        } else if (sum < target) {\n            right -= 1\n        } else {\n            right -= 1\n        }\n    }\n    return "no pair"\n}', bug: 8, fix: '            left++', why: 'When the sum is too small it needs a bigger price, so <code>left</code> must move right. Moving <code>right</code> makes the sum even smaller.' },
        ],
        quiz: [
          { q: 'Sorted prices 1, 3, 6, 9 and target 9. The first sum is 1 + 9 = 10. What happens next?', options: ['<code>right</code> moves left: the sum must get smaller', '<code>left</code> moves right', 'Both pointers move'], a: 0, why: '10 is too big, so the biggest price goes. Then 1 + 6 = 7 is too small, <code>left</code> moves, and 3 + 6 = 9.' },
          { q: 'Why must the list be sorted?', options: ['So moving a pointer makes the sum bigger or smaller in a way you know', 'So the loop has fewer lines', 'Kotlin can’t read unsorted lists'], a: 0, why: 'In a sorted list, moving <code>left</code> right always gives a bigger price and moving <code>right</code> left a smaller one.' },
          { q: 'For 1,000 sorted prices, at most how many steps do two pointers take?', options: ['About 1,000', 'About 500,000', 'About 10'], a: 0, why: 'Each step rules out one price, so it is O(n). The play program counts 999.' },
        ],
        docs: [['Conditions and loops', 'https://kotlinlang.org/docs/control-flow.html']],
      },

      {
        id: 'binary-search',
        title: 'Binary search',
        tagline: 'Halve a sorted list on every check.',
        goals: ['Find a value in a sorted list by checking the middle', 'Explain why a million items need only about 20 steps', 'Use Kotlin’s <code>binarySearch</code>'],
        level: 'beginner', introduces: ['binarySearch', 'toList'],
        body: `
<p>Looking for a word in a paper dictionary, you don’t read it page by page. You open it in the middle, see whether your word comes before or after that page, and forget about the other half. Searching a list item by item is O(n): one step per item. When the list is <em>sorted</em>, you can use the dictionary trick instead. It is called <em>binary search</em>.</p>
<p>Keep two indexes, <code>low</code> and <code>high</code>: the part of the list where the value can still be. Look at the middle one, <code>mid = (low + high) / 2</code> (dividing whole numbers drops the decimals, so <code>mid</code> is always a whole index). Equal? Found. Is the middle value smaller than the one you want? Then everything left of it is smaller too, so move <code>low</code> to <code>mid + 1</code>. Bigger? Move <code>high</code> to <code>mid - 1</code>. When <code>low</code> passes <code>high</code>, nothing is left to check: the value isn’t there.</p>
<p>Every step throws away half of what is left. In a list of 1,000,000 numbers, the program below needed 20 steps. Doubling the items adds only one step. That is O(log n), read “O of log n”: the number of times you can halve n before one item is left. The catch: the list must be sorted, or the half you throw away might hold the answer.</p>
<p>Kotlin has it built in: <code>prices.binarySearch(11)</code> gives the index, 4. When the value is missing, it gives a negative number. To try it on a big list, <code>(1..1000000).toList()</code> turns a range into a real list.</p>`,
        visual(el) {
          const prices = [2, 4, 5, 8, 11, 15];
          const row = h('div', {});
          const info = h('div', { class: 'dsa-cmp' });
          const stage = h('div', { class: 'ui-stage dsa-col' }, h('div', { class: 'dsa-cmp' }, 'find(prices, 4)'), row, info);
          const frames = [
            { low: 0, high: 5, say: 'Looking for 4. At the start it could be anywhere from index 0 (<code>low</code>) to index 5 (<code>high</code>).' },
            { low: 0, high: 5, mid: 2, say: '<code>mid = (0 + 5) / 2</code>, which is 2. The middle value is 5, bigger than 4.' },
            { low: 0, high: 1, say: 'So 4 can only be on the left: <code>high = mid - 1</code>, which is 1. One step, and half the list is gone.' },
            { low: 0, high: 1, mid: 0, say: '<code>mid = (0 + 1) / 2</code>, which is 0 (the .5 is dropped). The value 2 is smaller than 4.' },
            { low: 1, high: 1, say: '<code>low = mid + 1</code>, which is 1. Only index 1 is left.' },
            { low: 1, high: 1, mid: 1, found: true, say: '<code>mid = (1 + 1) / 2</code>, which is 1. The value is 4: found at index 1, after 3 steps.' },
          ];
          Lab.ui.player(el, {
            frames, stage,
            predict: { q: 'The middle value is 5, and you are looking for 4. Where can 4 still be?', options: ['Left of the middle', 'Right of the middle', 'Anywhere in the list'], a: 0, why: 'The list is sorted, so everything right of 5 is bigger than 5.' },
            draw(f) {
              row.replaceChildren(cellRow(prices.map((v, k) => {
                const tags = [k === f.low ? 'low' : '', k === f.mid ? 'mid' : '', k === f.high ? 'high' : ''].filter(Boolean).join(' ');
                const cls = k < f.low || k > f.high ? 'dsa-dim' : k === f.mid ? (f.found ? 'dsa-ok' : 'dsa-hot') : 'dsa-on';
                return { v, tag: tags, cls };
              })));
              info.textContent = `low = ${f.low}, high = ${f.high}` + (f.mid === undefined ? '' : `, mid = ${f.mid}`);
            },
          });
        },
        code: `fun find(sorted: List<Int>, target: Int): Int {
    var low = 0
    var high = sorted.size - 1
    while (low <= high) {
        val mid = (low + high) / 2
        if (sorted[mid] == target) {
            return mid
        } else if (sorted[mid] < target) {
            low = mid + 1     // target is right of mid
        } else {
            high = mid - 1    // target is left of mid
        }
    }
    return -1                 // nothing left to check: not there
}

fun main() {
    val prices = listOf(2, 4, 5, 8, 11, 15)
    println(find(prices, 11))            // 4
    println(find(prices, 9))             // -1
    println(prices.binarySearch(11))     // 4
    println(prices.binarySearch(9))      // -5: negative means not found
}`,
        play: `fun find(sorted: List<Int>, target: Int): Int {
    var low = 0
    var high = sorted.size - 1
    var steps = 0
    while (low <= high) {
        val mid = (low + high) / 2
        steps++
        if (sorted[mid] == target) {
            println("Found \$target after \$steps steps")
            return mid
        } else if (sorted[mid] < target) {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    println("Not found: \$target, after \$steps steps")
    return -1
}

fun main() {
    val prices = listOf(2, 4, 5, 8, 11, 15)
    println(find(prices, 4))
    println(find(prices, 9))

    val big = (1..1000000).toList()   // the numbers 1 to 1,000,000
    println(find(big, 765432))
    println(find(big, 0))
    // Try other numbers. Can you make it take more than 20 steps?
}`,
        remember: 'Binary search checks the middle and drops half each step: O(log n), but only on a sorted list.',
        mistakes: [
          { title: 'Searching a list that isn’t sorted', bad: 'println(listOf(8, 2, 15, 4).binarySearch(8))   // -3: "not found", but 8 is there', good: 'println(listOf(2, 4, 8, 15).binarySearch(8))   // 2', why: 'Binary search trusts the order to decide which half to drop. On an unsorted list it can drop the half that holds the answer.' },
        ],
        terms: [
          { term: 'binary search', def: 'Finding a value in a sorted list by checking the middle and dropping half of what is left each step.' },
          { term: 'O(log n)', def: 'Steps grow by one each time the number of items doubles. A million items take about 20.' },
          { term: 'binarySearch', def: 'Kotlin’s built-in binary search on a sorted list: <code>list.binarySearch(x)</code> gives the index, or a negative number when <code>x</code> is missing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the loop condition and the middle index.', code: 'while (low [[<=]] high) {\n    val mid = ([[low]] + [[high]]) / 2', why: 'Keep going while there is something left (<code>low &lt;= high</code>), and check the middle of what is left.' },
          { type: 'bug', prompt: '<code>find(listOf(2, 4), 4)</code> never finishes. Tap the wrong line.', code: 'fun find(sorted: List<Int>, target: Int): Int {\n    var low = 0\n    var high = sorted.size - 1\n    while (low <= high) {\n        val mid = (low + high) / 2\n        if (sorted[mid] == target) {\n            return mid\n        } else if (sorted[mid] < target) {\n            low = mid\n        } else {\n            high = mid - 1\n        }\n    }\n    return -1\n}', bug: 8, fix: '            low = mid + 1', why: 'With <code>low = 0</code> and <code>high = 1</code>, <code>mid</code> is 0 every time, so <code>low = mid</code> changes nothing. <code>mid</code> is already checked: move past it with <code>mid + 1</code>.' },
        ],
        quiz: [
          { q: 'What does binary search need from the list?', options: ['It must be sorted', 'It must be short', 'It must have no repeated values'], a: 0, why: 'Dropping half is only safe when the order tells you which side the value is on.' },
          { q: 'A sorted list grows from 1,000 to 2,000 items. How many more steps does binary search need, at most?', options: ['About 1 more', 'About 1,000 more', 'Twice as many'], a: 0, why: 'The first step halves 2,000 back to 1,000. Doubling adds one step: O(log n).' },
          { q: 'What is <code>listOf(2, 4, 5, 8, 11, 15).binarySearch(8)</code>?', options: ['<code>3</code>', '<code>4</code>', '<code>8</code>'], a: 0, why: 'It gives the index, not the value. 8 is at index 3.' },
        ],
        docs: [['Binary search in sorted lists', 'https://kotlinlang.org/docs/list-operations.html#binary-search-in-sorted-lists']],
      },

      {
        id: 'sorting',
        title: 'Sorting',
        tagline: 'Put items in order, and see how a sort does it.',
        goals: ['Sort a list with <code>sorted()</code>, <code>sortedDescending()</code> and <code>sortedBy { }</code>', 'Follow how selection sort puts a list in order', 'Explain why Kotlin’s sort is O(n log n) and selection sort is O(n²)'],
        level: 'beginner', introduces: ['sorted', 'sortedDescending'],
        body: `
<p>A scoreboard shows the best score first, a contact list goes from A to Z, and binary search from the last lesson only works on a sorted list. Kotlin sorts for you. <code>sorted()</code> gives a new list, smallest first, and <code>sortedDescending()</code> gives biggest first. Text is sorted alphabetically. <code>sortedBy { }</code>, from the Kotlin track, sorts by whatever the lambda picks: with <code>it.length</code>, the number of letters in each word, short words come first. Like <code>filter</code>, these give a new list and leave the original as it was.</p>
<p>How does a sort work inside? A simple way, <em>selection sort</em>, is how many people sort cards in their hand: find the smallest card and put it first. Then find the smallest of the rest and put it second, and so on. “Put it first” means a <em>swap</em>: two items trade places. A swap needs a spare box, <code>val saved = items[start]</code>, or the first value is overwritten before you can move it.</p>
<p>Selection sort looks at every remaining item in every round: a loop inside a loop, O(n²). On 1,000 numbers it makes 499,500 steps. If you only need the smallest item, one loop is enough; sorting costs more than one pass over the list.</p>
<p>Kotlin’s <code>sorted()</code> uses a smarter method based on <em>merge sort</em>: split the list into halves, sort each half, then merge the two sorted halves by comparing their fronts. That is O(n log n), far fewer steps than O(n²) on a long list. So in your own code, call <code>sorted()</code>.</p>`,
        visual(el) {
          const row = h('div', {});
          const stage = h('div', { class: 'ui-stage dsa-col' }, h('div', { class: 'dsa-cmp' }, 'selectionSort(cards)'), row);
          const frames = [
            { v: [7, 3, 9, 1], done: 0, say: 'Four cards. Each round finds the smallest item in the unsorted part and swaps it to the front of that part.' },
            { v: [7, 3, 9, 1], done: 0, start: 0, smallest: 3, say: 'Round 1 compares 7 with 3, 9 and 1: 3 steps. The smallest is 1, at index 3.' },
            { v: [1, 3, 9, 7], done: 1, say: 'Swap: 1 and 7 trade places. Index 0 is done for good.' },
            { v: [1, 3, 9, 7], done: 1, start: 1, smallest: 1, say: 'Round 2 compares 3 with 9 and 7: 2 steps. 3 is already the smallest, so the swap changes nothing.' },
            { v: [1, 3, 9, 7], done: 2, start: 2, smallest: 3, say: 'Round 3 compares 9 with 7: 1 step. 7 is smaller.' },
            { v: [1, 3, 7, 9], done: 3, say: 'Swap 9 and 7.' },
            { v: [1, 3, 7, 9], done: 4, say: 'The last item is in place on its own. 3 + 2 + 1 = 6 steps for 4 items. Every round is a loop inside the round loop: O(n²).' },
          ];
          Lab.ui.player(el, {
            frames, stage,
            predict: { q: 'Start: <code>[7, 3, 9, 1]</code>. After round 1, which number is at index 0?', options: ['<code>1</code>', '<code>3</code>', '<code>7</code>'], a: 0, why: 'Round 1 finds the smallest of all four, 1, and swaps it to the front.' },
            draw(f) {
              row.replaceChildren(cellRow(f.v.map((v, k) => {
                let cls = k < f.done ? 'dsa-ok' : '', tag = '';
                if (f.start !== undefined && k >= f.start) cls = 'dsa-on';
                if (k === f.smallest) { cls = 'dsa-hot'; tag = 'smallest'; }
                if (k === f.start) tag = k === f.smallest ? 'start smallest' : 'start';
                return { v, tag, cls };
              })));
            },
          });
        },
        code: `// MutableList<Int>: the type of a list made with mutableListOf, so the function can change it
fun selectionSort(items: MutableList<Int>) {
    for (start in 0 until items.size) {
        var smallest = start
        for (i in start + 1 until items.size) {
            if (items[i] < items[smallest]) {
                smallest = i
            }
        }
        val saved = items[start]          // swap, keeping one value safe
        items[start] = items[smallest]
        items[smallest] = saved
    }
}

fun main() {
    val cards = mutableListOf(7, 3, 9, 1)
    selectionSort(cards)
    println(cards)                                    // [1, 3, 7, 9]
    println(listOf(7, 3, 9, 1).sortedDescending())    // [9, 7, 3, 1]
    println(listOf("tea", "milk", "rice").sorted())   // [milk, rice, tea]
    println(listOf("bread", "tea", "milk").sortedBy { it.length })  // [tea, milk, bread]
}`,
        play: `fun selectionSort(items: MutableList<Int>): Int {
    var steps = 0
    for (start in 0 until items.size) {
        var smallest = start
        for (i in start + 1 until items.size) {
            steps++
            if (items[i] < items[smallest]) {
                smallest = i
            }
        }
        val saved = items[start]
        items[start] = items[smallest]
        items[smallest] = saved
    }
    return steps
}

fun main() {
    val cards = mutableListOf(7, 3, 9, 1)
    println("\${selectionSort(cards)} steps: \$cards")

    val scores = mutableListOf(5, 2, 8, 1, 9, 3, 7, 4, 6, 10)
    println("\${selectionSort(scores)} steps: \$scores")

    val names = listOf("Noor", "Ada", "Sam", "Lin")
    println(names.sorted())
    println(names.sortedDescending())
    // Add 10 more numbers to scores. How many steps now?
}`,
        remember: 'Call sorted() or sortedBy { }: O(n log n). Simple sorts like selection sort are O(n²).',
        mistakes: [
          { title: 'Swapping without a spare box', bad: 'items[start] = items[smallest]\nitems[smallest] = items[start]   // both now hold the same value', good: 'val saved = items[start]\nitems[start] = items[smallest]\nitems[smallest] = saved', why: 'After the first line the old value at <code>start</code> is gone. Keep it in <code>saved</code> first. With <code>[7, 3, 9, 1]</code>, after the first round the list is <code>[1, 3, 9, 1]</code>: the 7 is lost. By the end it is <code>[1, 1, 1, 1]</code>.' },
        ],
        terms: [
          { term: 'selection sort', def: 'A simple sort: find the smallest of the rest, swap it to the front, repeat. O(n²).' },
          { term: 'swap', def: 'Two items trade places. Needs a spare box so neither value is lost.' },
          { term: 'merge sort', def: 'Split in halves, sort each half, merge them by comparing their fronts. O(n log n). Kotlin’s <code>sorted()</code> uses a method based on it.' },
          { term: 'O(n log n)', def: 'About log n steps per item: n × the number of halvings. For 1,000 items, roughly 10 steps each. Much less than n². The cost of a good sort.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print the names A to Z, then Z to A.', code: 'val names = listOf("Noor", "Ada", "Sam")\nprintln(names.[[sorted]]())\nprintln(names.[[sortedDescending]]())', why: '<code>sorted()</code> is smallest first, alphabetical for text; <code>sortedDescending()</code> is the other way round.' },
          { type: 'bug', prompt: 'This should sort smallest first, but <code>[7, 3, 9, 1]</code> comes out as <code>[9, 7, 3, 1]</code>. Tap the wrong line.', code: 'fun selectionSort(items: MutableList<Int>) {\n    for (start in 0 until items.size) {\n        var smallest = start\n        for (i in start + 1 until items.size) {\n            if (items[i] > items[smallest]) {\n                smallest = i\n            }\n        }\n        val saved = items[start]\n        items[start] = items[smallest]\n        items[smallest] = saved\n    }\n}', bug: 4, fix: '            if (items[i] < items[smallest]) {', why: 'With <code>&gt;</code> each round picks the biggest, so the list ends up biggest first.' },
        ],
        quiz: [
          { q: 'What is <code>listOf(5, 1, 4).sorted()</code>?', options: ['<code>[1, 4, 5]</code>', '<code>[5, 4, 1]</code>', '<code>[5, 1, 4]</code>'], a: 0, why: '<code>sorted()</code> puts the smallest first.' },
          { q: '<code>val a = listOf(3, 1, 2)</code> then <code>val b = a.sorted()</code>. What does <code>println(a)</code> print?', options: ['<code>[3, 1, 2]</code>', '<code>[1, 2, 3]</code>'], a: 0, why: '<code>sorted()</code> gives a new list in <code>b</code>. The original stays as it was.' },
          { q: 'Why is selection sort O(n²)?', options: ['Each of its n rounds looks through the rest of the list: a loop inside a loop', 'It swaps items', 'It makes a new list'], a: 0, why: 'n rounds, each looking at up to n items. 4 items took 6 steps, 1,000 items took 499,500.' },
        ],
        docs: [['Ordering', 'https://kotlinlang.org/docs/collection-ordering.html']],
      },

      {
        id: 'trees',
        title: 'Trees',
        tagline: 'Items that branch out, like folders inside folders.',
        goals: ['Build a small binary tree out of nodes', 'Visit every node with a recursive function', 'Explain why a binary search tree prints its values in order'],
        level: 'beginner', introduces: ['sortedSetOf'],
        body: `
<p>Folders on a computer hold files and more folders, which hold more folders. A family tree and a tournament bracket have the same shape. A list is a line; a <em>tree</em> branches. Each box in a tree is a <em>node</em>. The node at the top is the <em>root</em>, and a node with nothing below it is a <em>leaf</em>.</p>
<p>In a <em>binary tree</em>, each node has at most two children: a left one and a right one. In Kotlin a node is a small class: <code>class Node(val value: Int, val left: Node? = null, val right: Node? = null)</code>. A child can be missing, so its type is <code>Node?</code>, and the defaults let you write a leaf as <code>Node(2)</code>. Each child is a whole smaller tree of its own.</p>
<p>That is why recursion, from the recursion lesson, fits trees so well. To visit every node: if the node is null, stop (the base case). Otherwise visit the left subtree, then the node itself, then the right subtree. Going through every node like this is a <em>traversal</em>; this order, left, node, right, is called in-order.</p>
<p>The tree in the demo is a <em>binary search tree</em>: everything left of a node is smaller, everything right is bigger. So in-order prints the values sorted. Kotlin’s <code>sortedSetOf(8, 4, 12)</code> keeps its items in a tree like this, which is why it always gives them back in order: <code>[4, 8, 12]</code>.</p>`,
        visual(el) {
          const t = treeSvg('Binary search tree with root 8');
          const out = h('div', { class: 'dsa-cmp' });
          const stage = h('div', { class: 'ui-stage dsa-col' }, t.root, out);
          const frames = [
            { path: [], printed: [], say: '<code>printInOrder(root)</code> starts at 8. Before printing anything, it goes left.' },
            { path: [8, 4], cur: 2, printed: [2], say: 'From 8 go left to 4, then left to 2. The left child of 2 is null: that call stops at once (base case). Print 2.' },
            { path: [8], cur: 4, printed: [2, 4], say: 'Back in the call for 4: its left side is done, so print 4.' },
            { path: [8, 4], cur: 6, printed: [2, 4, 6], say: 'Now the right subtree of 4: node 6. No children, so print 6. All of 4’s subtree is done.' },
            { path: [], cur: 8, printed: [2, 4, 6, 8], say: 'Back up to the root: its left side is done, print 8.' },
            { path: [8, 12], cur: 10, printed: [2, 4, 6, 8, 10], say: 'The right subtree of 8: go to 12, then left to 10. Print 10.' },
            { path: [8], cur: 12, printed: [2, 4, 6, 8, 10, 12], say: 'Back at 12: print it, then go right.' },
            { path: [8, 12], cur: 14, printed: [2, 4, 6, 8, 10, 12, 14], say: 'Print 14. Every node printed once, smallest first, because left is always smaller.' },
          ];
          Lab.ui.player(el, {
            frames, stage,
            predict: { q: 'Which value does <code>printInOrder</code> print first?', options: ['<code>8</code>, the root', '<code>2</code>', '<code>14</code>'], a: 1, why: 'It goes left before printing, as far as it can. The leftmost node is 2.' },
            draw(f) {
              t.clear();
              f.printed.forEach(v => t.node(v, 'dsa-ok'));
              f.path.forEach(v => { if (!f.printed.includes(v)) t.node(v, 'dsa-on'); });
              if (f.cur !== undefined) t.node(f.cur, 'dsa-hot');
              out.textContent = 'Printed: ' + (f.printed.join(' ') || '(nothing yet)');
            },
          });
        },
        code: `class Node(val value: Int, val left: Node? = null, val right: Node? = null)

fun printInOrder(node: Node?) {
    if (node == null) {
        return                     // base case: an empty tree
    }
    printInOrder(node.left)        // everything smaller first
    println(node.value)
    printInOrder(node.right)       // then everything bigger
}

fun countNodes(node: Node?): Int {
    if (node == null) {
        return 0
    }
    return 1 + countNodes(node.left) + countNodes(node.right)
}

fun main() {
    val root = Node(8, Node(4, Node(2), Node(6)), Node(12, Node(10), Node(14)))
    printInOrder(root)             // 2 4 6 8 10 12 14, one per line
    println(countNodes(root))      // 7
    println(sortedSetOf(8, 4, 12, 2))   // [2, 4, 8, 12]
}`,
        play: `class Node(val value: Int, val left: Node? = null, val right: Node? = null)

fun printInOrder(node: Node?) {
    if (node == null) {
        return
    }
    printInOrder(node.left)
    println(node.value)
    printInOrder(node.right)
}

fun countNodes(node: Node?): Int {
    if (node == null) {
        return 0
    }
    return 1 + countNodes(node.left) + countNodes(node.right)
}

fun main() {
    //        5
    //      /   \\
    //     3     9
    //    /     /
    //   1     7
    val root = Node(5, Node(3, Node(1)), Node(9, Node(7)))
    printInOrder(root)
    println("\${countNodes(root)} nodes")
    // Give 9 a right child, Node(11). Where does 11 appear in the output?
}`,
        remember: 'A tree node holds a value and smaller trees. Tree code is recursive: stop at null, handle left, the node, right.',
        mistakes: [
          { title: 'Forgetting the null check', bad: 'fun printInOrder(node: Node?) {\n    printInOrder(node.left)   // Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type \'Node?\'.\n    println(node.value)\n    printInOrder(node.right)\n}', good: 'fun printInOrder(node: Node?) {\n    if (node == null) {\n        return\n    }\n    printInOrder(node.left)\n    println(node.value)\n    printInOrder(node.right)\n}', why: 'Every leaf has null children, so the function is always called with null in the end. The check is the base case, and after it Kotlin knows <code>node</code> is not null.' },
        ],
        terms: [
          { term: 'tree', def: 'Nodes that branch out from one top node, the root. Each node’s children are smaller trees.' },
          { term: 'node', def: 'One box in a tree: a value plus links to its children. A node with no children is a leaf.' },
          { term: 'traversal', def: 'Visiting every node of a tree once. In-order means left subtree, then the node, then the right subtree.' },
          { term: 'binary search tree', def: 'A binary tree where everything left of a node is smaller and everything right is bigger.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish <code>countNodes</code>: an empty tree has no nodes; otherwise count this node plus both sides.', code: 'fun countNodes(node: Node?): Int {\n    if (node == [[null]]) {\n        return [[0]]\n    }\n    return 1 + countNodes(node.[[left]]) + countNodes(node.right)\n}', why: 'The base case answers the empty tree. Each call adds 1 for its own node.' },
          { type: 'bug', prompt: 'On the demo tree this should print 2 4 6 8 10 12 14, but it prints 2 4 2 8 2 4 2. Tap the wrong line.', code: 'fun printInOrder(node: Node?) {\n    if (node == null) {\n        return\n    }\n    printInOrder(node.left)\n    println(node.value)\n    printInOrder(node.left)\n}', bug: 6, fix: '    printInOrder(node.right)', why: 'The second call must go to the right subtree. Going left twice prints the left side twice and never reaches 10, 12 and 14.' },
        ],
        quiz: [
          { q: 'In <code>Node(8, Node(4), Node(12))</code>, which node is the root?', options: ['<code>8</code>', '<code>4</code>', '<code>12</code>'], a: 0, why: 'The outer node is the top of the tree. 4 and 12 are its children.' },
          { q: 'What is a node with no children called?', options: ['A leaf', 'A root', 'A base case'], a: 0, why: 'Leaves are at the ends of the branches.' },
          { q: 'In a binary search tree with root 8, where is 5?', options: ['Somewhere in the left subtree', 'Somewhere in the right subtree', 'It could be anywhere'], a: 0, why: 'Everything smaller than a node is on its left.' },
        ],
        docs: [['sortedSetOf', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-set-of.html']],
      },

      {
        id: 'heaps',
        title: 'Heaps and priority queues',
        tagline: 'Always get the smallest item next, fast.',
        goals: ['Take out the smallest item first with <code>PriorityQueue</code>', 'Picture a heap as a tree where each parent is smaller than its children', 'Explain why adding and taking out cost O(log n)'],
        level: 'beginner', introduces: ['import', 'PriorityQueue', 'peek', 'poll'],
        body: `
<p>A to-do app: tasks keep arriving, each with the number of days until it is due, and you always want the most urgent one next. A queue from the stacks and queues lesson serves tasks in the order they arrived. Sorting the whole list after every new task works, but it is slow. A <em>priority queue</em> always hands out the smallest item first, whatever order the items came in.</p>
<p>Kotlin borrows Java’s <code>PriorityQueue</code>. It lives in a named group of code called <code>java.util</code>, so the file needs one extra line at the very top: <code>import java.util.PriorityQueue</code>. An <code>import</code> line lets the rest of the file use that type.</p>
<p><code>val daysLeft = PriorityQueue&lt;Int&gt;()</code> makes an empty one; <code>&lt;Int&gt;</code> says what it holds, as in <code>List&lt;Int&gt;</code>. <code>add(5)</code> puts an item in, <code>peek()</code> shows the smallest without taking it out, and <code>poll()</code> takes the smallest out and gives it back.</p>
<p>Inside is a <em>heap</em>: a binary tree, as in the trees lesson, where every parent is smaller than or equal to its children, so the smallest item is always at the root. The tree is stored in a plain list, row by row, which is why printing the queue shows heap order, not sorted order. <code>add</code> and <code>poll()</code> move an item up or down the tree with swaps, one row at a time. A tree of n items has about log n rows, so both are O(log n). <code>peek()</code> is O(1): the smallest is always on top.</p>`,
        visual(el) {
          const P = [[0, 160, 24], [1, 85, 84], [2, 235, 84], [3, 45, 144], [4, 125, 144], [5, 195, 144], [6, 275, 144]];
          const g = graphSvg(P.map(([id, x, y]) => ({ id, x, y, text: '' })), [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], { w: 320, ht: 166, r: 17, name: 'Heap as a tree' });
          const row = h('div', {});
          const stage = h('div', { class: 'ui-stage dsa-col' }, g.root, label('Stored as a list'), row);
          const frames = [
            { v: [], say: 'An empty <code>PriorityQueue</code>. Spots fill row by row, left to right.' },
            { v: [5], hot: [0], say: '<code>add(5)</code>: the first item becomes the root.' },
            { v: [2, 5], hot: [0, 1], say: '<code>add(2)</code> goes into the next free spot, under 5. 2 is smaller than its parent 5, so they swap.' },
            { v: [2, 5, 8], hot: [2], say: '<code>add(8)</code>: 8 is bigger than its parent 2, so it stays where it is.' },
            { v: [2, 5, 8, 1], hot: [3], say: '<code>add(1)</code> lands under 5. 1 is smaller than 5: swap.' },
            { v: [2, 1, 8, 5], hot: [1], say: 'Now 1 sits under 2. Still smaller: swap again.' },
            { v: [1, 2, 8, 5], hot: [0], say: '1 is at the root: two swaps, one per row. <code>println(queue)</code> prints the list: <code>[1, 2, 8, 5]</code>. Not sorted, but the smallest is first.' },
            { v: [2, 5, 8], hot: [0, 1], say: '<code>poll()</code> gives back 1. The last item, 5, moves to the root, then swaps down with its smaller child, 2. The next smallest is on top again.' },
          ];
          Lab.ui.player(el, {
            frames, stage,
            predict: { q: 'After <code>add(5)</code>, <code>add(2)</code>, <code>add(8)</code>, <code>add(1)</code>, what does <code>println(queue)</code> print?', options: ['<code>[1, 2, 5, 8]</code>', '<code>[1, 2, 8, 5]</code>', '<code>[5, 2, 8, 1]</code>'], a: 1, why: 'It prints the heap’s list, row by row. Only the first item is sure to be the smallest.' },
            draw(f) {
              g.clear();
              P.forEach(([id]) => {
                g.text(id, f.v[id] === undefined ? '' : String(f.v[id]));
                g.node(id, f.v[id] === undefined ? 'dsa-dim' : (f.hot || []).includes(id) ? 'dsa-hot' : 'dsa-on');
              });
              row.replaceChildren(f.v.length ? cellRow(f.v.map((v, k) => ({ v, cls: (f.hot || []).includes(k) ? 'dsa-hot' : '' })), 'dsa-wide') : h('span', { class: 'dsa-stat' }, '[ ]'));
            },
          });
        },
        code: `import java.util.PriorityQueue

fun main() {
    val daysLeft = PriorityQueue<Int>()   // days until each task is due
    daysLeft.add(5)
    daysLeft.add(2)
    daysLeft.add(8)
    daysLeft.add(1)
    println(daysLeft)           // [1, 2, 8, 5]: heap order, not sorted
    println(daysLeft.peek())    // 1, still in the queue
    println(daysLeft.poll())    // 1, now taken out
    println(daysLeft.poll())    // 2
    println(daysLeft)           // [5, 8]
}`,
        play: `import java.util.PriorityQueue

fun main() {
    val queue = PriorityQueue<Int>()
    for (days in listOf(7, 4, 9, 2, 6)) {
        queue.add(days)
    }
    println("Inside: \$queue")
    println("Most urgent: \${queue.peek()}")

    while (queue.isNotEmpty()) {
        println("Next: \${queue.poll()}")
    }

    val words = PriorityQueue<String>()
    words.add("tea")
    words.add("bread")
    words.add("milk")
    println(words.poll())
    // Add a task with 0 days left. When does it come out?
}`,
        remember: 'PriorityQueue: add and poll are O(log n), peek is O(1), and the smallest always comes out first.',
        mistakes: [
          { title: 'Expecting the printed queue to be sorted', bad: 'println(daysLeft)   // [1, 2, 8, 5]', good: 'while (daysLeft.isNotEmpty()) {\n    println(daysLeft.poll())   // 1, 2, 5, 8\n}', why: 'Printing shows the heap’s list, where only the first item is sure to be the smallest. Taking items out with <code>poll()</code> gives them in order.' },
        ],
        terms: [
          { term: 'priority queue', def: 'A collection that always gives back its smallest item first. In Kotlin: <code>PriorityQueue</code>.' },
          { term: 'heap', def: 'A binary tree where every parent is smaller than or equal to its children, stored in a list row by row.' },
          { term: 'import', def: 'A line at the top of a file that lets you use a type from a named group of code, like <code>import java.util.PriorityQueue</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the queue usable, then take out the smallest item.', code: 'import java.util.[[PriorityQueue]]\n\nfun main() {\n    val queue = PriorityQueue<Int>()\n    queue.add(9)\n    queue.add(4)\n    println(queue.[[poll]]())   // 4\n}', why: 'The import names the type. <code>poll()</code> takes out and gives back the smallest.' },
          { type: 'bug', prompt: 'This should print 1 and then 3, but it never stops printing 1. Tap the wrong line.', code: 'import java.util.PriorityQueue\n\nfun main() {\n    val queue = PriorityQueue<Int>()\n    queue.add(3)\n    queue.add(1)\n    while (queue.isNotEmpty()) {\n        println(queue.peek())\n    }\n}', bug: 7, fix: '        println(queue.poll())', why: '<code>peek()</code> only looks, so the queue never gets empty. <code>poll()</code> takes the item out.' },
        ],
        quiz: [
          { q: 'Which call takes the smallest item out of a <code>PriorityQueue</code>?', options: ['<code>poll()</code>', '<code>peek()</code>', '<code>add()</code>'], a: 0, why: '<code>peek()</code> only shows it; <code>poll()</code> removes it and gives it back.' },
          { q: 'You add 9, 4 and 6. What does the first <code>poll()</code> give?', options: ['<code>4</code>', '<code>9</code>', '<code>6</code>'], a: 0, why: 'Smallest first, whatever order the items were added in.' },
          { q: 'Why is <code>add</code> O(log n)?', options: ['The new item swaps up at most one row at a time, and there are about log n rows', 'It sorts the whole list', 'It looks at every item'], a: 0, why: 'Each row holds twice as many spots as the one above, so n items fit in about log n rows.' },
        ],
        docs: [['PriorityQueue', 'https://developer.android.com/reference/java/util/PriorityQueue']],
      },

      {
        id: 'graphs',
        title: 'Graphs',
        tagline: 'Places joined by paths, and how to find your way.',
        goals: ['Store a map of connections as a <code>Map</code> of lists', 'Find the fewest stops between two places with breadth-first search', 'Tell breadth-first and depth-first search apart'],
        level: 'beginner', introduces: [],
        body: `
<p>A bus map: stops, and lines between the ones a bus drives straight between. How many stops is it from Home to the Pool, at the fewest? Friends of friends, roads between towns and links between web pages have the same shape. It is called a <em>graph</em>: places (nodes) joined by connections (edges). A tree is a graph too, but a graph can have loops: from Home you can ride round and come back to Home.</p>
<p>Kotlin has no graph type. The usual way is a map from each place to the list of its neighbours, called an <em>adjacency list</em>: <code>"Home" to listOf("Park", "School")</code>. A bus goes both ways, so Park lists Home as well. Its type, <code>Map&lt;String, List&lt;String&gt;&gt;</code>, reads “a map from String to a list of Strings”.</p>
<p><em>Breadth-first search</em> (BFS) finds the fewest stops. Start with Home in an <code>ArrayDeque</code> used as a queue. Take the first stop out, and give every neighbour not reached yet a distance one bigger, then add it to the back of the queue. First in, first out means all places 1 stop away come out before any place 2 stops away: BFS spreads in rings. The <code>distance</code> map also remembers who is already reached, so loops don’t send it round forever.</p>
<p><em>Depth-first search</em> (DFS) goes as far as it can down one path before it backs up, like walking a maze with one hand on the wall. With recursion it is short: visit a place, then call yourself for each neighbour you haven’t seen (the Run it program has one; its <code>MutableSet&lt;String&gt;</code> is the type of a set made with <code>mutableSetOf</code>). DFS answers “can I get there at all?”, but it doesn’t find the fewest stops.</p>`,
        visual(el) {
          const S = [['Home', 36, 100], ['Park', 125, 40], ['School', 125, 160], ['Market', 215, 70], ['Library', 215, 170], ['Pool', 295, 120]];
          const E = [['Home', 'Park'], ['Home', 'School'], ['Park', 'Market'], ['School', 'Market'], ['School', 'Library'], ['Market', 'Pool'], ['Library', 'Pool']];
          const g = graphSvg(S.map(([id, x, y]) => ({ id, x, y, text: '', label: id })), E, { w: 330, ht: 205, r: 16, name: 'Bus map' });
          const q = h('div', {});
          const stage = h('div', { class: 'ui-stage dsa-col' }, g.root, label('queue'), q);
          const frames = [
            { d: { Home: 0 }, queue: ['Home'], say: 'Start at Home, 0 stops away. The queue holds Home. The number in a circle is its distance.' },
            { d: { Home: 0, Park: 1, School: 1 }, cur: 'Home', lines: [['Home', 'Park'], ['Home', 'School']], queue: ['Park', 'School'], say: 'Take Home out. Its neighbours Park and School are new: 0 + 1 = 1 stop. They go to the back of the queue.' },
            { d: { Home: 0, Park: 1, School: 1, Market: 2 }, cur: 'Park', lines: [['Park', 'Market']], queue: ['School', 'Market'], say: 'Take Park out. Home is already reached, so skip it. Market is new: 2 stops.' },
            { d: { Home: 0, Park: 1, School: 1, Market: 2, Library: 2 }, cur: 'School', lines: [['School', 'Library']], queue: ['Market', 'Library'], say: 'Take School out. Home and Market are already reached. Library is new: 2 stops.' },
            { d: { Home: 0, Park: 1, School: 1, Market: 2, Library: 2, Pool: 3 }, cur: 'Market', lines: [['Market', 'Pool']], queue: ['Library', 'Pool'], say: 'Take Market out. Pool is new: 3 stops.' },
            { d: { Home: 0, Park: 1, School: 1, Market: 2, Library: 2, Pool: 3 }, cur: 'Library', queue: ['Pool'], say: 'Take Library out. School and Pool are both reached already. Pool keeps 3: the first time BFS reaches a place is always by the fewest stops.' },
            { d: { Home: 0, Park: 1, School: 1, Market: 2, Library: 2, Pool: 3 }, cur: 'Pool', queue: [], done: true, say: 'Take Pool out: nothing new. The queue is empty, so BFS is done. Pool is 3 stops from Home.' },
          ];
          Lab.ui.player(el, {
            frames, stage,
            predict: { q: 'How many stops is Pool from Home, at the fewest?', options: ['2', '3', '4'], a: 1, why: 'Home, Park, Market, Pool: 3 rides. No route has fewer.' },
            draw(f) {
              g.clear();
              S.forEach(([id]) => {
                const has = f.d[id] !== undefined;
                g.text(id, has ? String(f.d[id]) : '');
                g.node(id, id === f.cur ? 'dsa-hot' : has ? (f.done ? 'dsa-ok' : 'dsa-on') : '');
              });
              (f.lines || []).forEach(([a, b]) => g.edge(a, b, 'dsa-on'));
              q.replaceChildren(h('div', { class: 'dsa-queue' }, f.queue.length ? f.queue.map(s => pill(s)) : pill('empty', 'dsa-ghost')));
            },
          });
        },
        code: `fun stopsFrom(bus: Map<String, List<String>>, start: String): Map<String, Int> {
    val distance = mutableMapOf(start to 0)
    val queue = ArrayDeque<String>()
    queue.addLast(start)
    while (queue.isNotEmpty()) {
        val stop = queue.removeFirst()
        for (next in bus.getOrDefault(stop, listOf())) {
            if (distance[next] == null) {      // not reached yet
                distance[next] = distance.getOrDefault(stop, 0) + 1
                queue.addLast(next)
            }
        }
    }
    return distance
}

fun main() {
    val bus = mapOf(
        "Home" to listOf("Park", "School"),
        "Park" to listOf("Home", "Market"),
        "School" to listOf("Home", "Market", "Library"),
        "Market" to listOf("Park", "School", "Pool"),
        "Library" to listOf("School", "Pool"),
        "Pool" to listOf("Market", "Library")
    )
    println(stopsFrom(bus, "Home"))
    // {Home=0, Park=1, School=1, Market=2, Library=2, Pool=3}
    println(stopsFrom(bus, "Home")["Pool"])   // 3
}`,
        play: `fun stopsFrom(bus: Map<String, List<String>>, start: String): Map<String, Int> {
    val distance = mutableMapOf(start to 0)
    val queue = ArrayDeque<String>()
    queue.addLast(start)
    while (queue.isNotEmpty()) {
        val stop = queue.removeFirst()
        for (next in bus.getOrDefault(stop, listOf())) {
            if (distance[next] == null) {
                distance[next] = distance.getOrDefault(stop, 0) + 1
                queue.addLast(next)
            }
        }
    }
    return distance
}

fun visit(bus: Map<String, List<String>>, stop: String, seen: MutableSet<String>) {
    if (!seen.add(stop)) {
        return
    }
    println("DFS visits \$stop")
    for (next in bus.getOrDefault(stop, listOf())) {
        visit(bus, next, seen)
    }
}

fun main() {
    val bus = mapOf(
        "Home" to listOf("Park", "School"),
        "Park" to listOf("Home", "Market"),
        "School" to listOf("Home", "Market", "Library"),
        "Market" to listOf("Park", "School", "Pool"),
        "Library" to listOf("School", "Pool"),
        "Pool" to listOf("Market", "Library")
    )
    println("BFS: \${stopsFrom(bus, "Home")}")
    println("From Pool: \${stopsFrom(bus, "Pool")}")
    visit(bus, "Home", mutableSetOf())
    // Add a new stop "Zoo" next to Pool (remember both directions). How far is it from Home?
}`,
        remember: 'A graph is a map from each place to its neighbours. BFS with a queue finds the fewest steps; DFS goes deep first.',
        terms: [
          { term: 'graph', def: 'Places (nodes) joined by connections (edges). Unlike a tree, it can have loops.' },
          { term: 'adjacency list', def: 'A graph stored as a map from each node to the list of its neighbours.' },
          { term: 'BFS', def: 'Breadth-first search: visit in rings, nearest first, using a queue. Finds the fewest steps.' },
          { term: 'DFS', def: 'Depth-first search: follow one path as far as it goes, then back up. Often written with recursion.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'BFS adds to the back of the queue and takes from the front.', code: 'queue.[[addLast]](start)\nwhile (queue.isNotEmpty()) {\n    val stop = queue.[[removeFirst]]()', why: 'First in, first out: places are handled in the order they were reached, nearest first.' },
          { type: 'bug', prompt: 'Every stop comes out as 0 stops away: <code>{Home=0, Park=0, School=0, ...}</code>. Tap the wrong line.', code: 'while (queue.isNotEmpty()) {\n    val stop = queue.removeFirst()\n    for (next in bus.getOrDefault(stop, listOf())) {\n        if (distance[next] == null) {\n            distance[next] = distance.getOrDefault(stop, 0)\n            queue.addLast(next)\n        }\n    }\n}', bug: 4, fix: '            distance[next] = distance.getOrDefault(stop, 0) + 1', why: 'A neighbour is one ride further than the stop you came from, so add 1.' },
        ],
        quiz: [
          { q: 'Which search finds the fewest stops from Home to Pool?', options: ['Breadth-first search (BFS)', 'Depth-first search (DFS)'], a: 0, why: 'BFS reaches every place 1 stop away before any place 2 stops away, so the first time it reaches a place is by the shortest route.' },
          { q: 'What does BFS keep its waiting places in?', options: ['A queue: first in, first out', 'A stack: last in, first out', 'A sorted list'], a: 0, why: 'Taking from the front keeps the nearest places first.' },
          { q: 'Why does the code check <code>distance[next] == null</code>?', options: ['So loops like Home, Park, Home don’t make it go round forever', 'To skip stops that are far away', 'Because the map might be empty'], a: 0, why: 'A place already reached is skipped, so each place goes into the queue once.' },
        ],
        docs: [['ArrayDeque', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-array-deque/'], ['Map-specific operations', 'https://kotlinlang.org/docs/map-operations.html']],
      },

      {
        id: 'dp',
        title: 'Dynamic programming',
        tagline: 'Remember answers so you never work them out twice.',
        goals: ['Spot a recursive function that solves the same small problem again and again', 'Save answers in a map so each one is worked out once', 'Build answers up from the smallest one in a list'],
        level: 'beginner', introduces: [],
        body: `
<p>A puzzle: you climb a staircase taking 1 or 2 stairs at a time. In how many different ways can you climb 4 stairs? Your last move was either 1 stair or 2, so <code>ways(4) = ways(3) + ways(2)</code>. With 0 or 1 stairs there is exactly 1 way. That is a short recursive function, and it is right. But for 40 stairs it makes 331,160,281 calls (counted in a real run).</p>
<p>Why so many? <code>ways(5)</code> calls <code>ways(4)</code> and <code>ways(3)</code>; <code>ways(4)</code> calls <code>ways(3)</code> again, and so on down. The same small questions are worked out again and again. The fix is to remember answers. Keep a map, <code>val saved = mutableMapOf&lt;Int, Int&gt;()</code>, made outside any function so every call can use it. Before working out <code>ways(n)</code>, look in the map; after working it out, save it. Now each n is worked out once, and 40 stairs takes 79 calls.</p>
<p>That is <em>dynamic programming</em>: split a problem into smaller ones that repeat, solve each once and reuse the answers. (The name is old and doesn’t mean much; think “remembering answers”.) Saving the answers of a recursive function like this is called <em>memoization</em>, from “memo”, a note to yourself.</p>
<p>You can also start from the bottom. Make a list where <code>table[0]</code> and <code>table[1]</code> are 1, then fill <code>table[n] = table[n - 1] + table[n - 2]</code> for 2, 3, 4 and up with a <code>for</code> loop. No recursion at all, and it is O(n): one step per stair.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'val saved = mutableMapOf<Int, Int>()\n\nfun ways(stairs: Int): Int {\n    if (stairs <= 1) {\n        return 1\n    }\n    val known = saved[stairs]\n    if (known != null) {\n        return known\n    }\n    val answer = ways(stairs - 1) + ways(stairs - 2)\n    saved[stairs] = answer\n    return answer\n}\n\nfun main() {\n    println(ways(4))\n}',
            predict: {
              q: '<code>ways(4)</code> needs <code>ways(2)</code> twice. With <code>saved</code>, what happens the second time?',
              options: ['It works it out again', 'It reads the saved answer'],
              a: 1,
              why: 'The first time, the answer goes into <code>saved</code>. The second time, line 7 finds it.',
            },
            frames: [
              { line: 11, stack: ['main()', 'ways(4)', 'ways(3)', 'ways(2)'], vars: { saved: '{}' }, say: '<code>ways(4)</code> asks for <code>ways(3)</code>, which asks for <code>ways(2)</code>. Nothing is saved yet, so each has to work it out.' },
              { line: 5, stack: ['main()', 'ways(4)', 'ways(3)', 'ways(2)', 'ways(1)'], say: '<code>ways(2)</code> asks for <code>ways(1)</code> and then <code>ways(0)</code>. Both are base cases: 1 each.' },
              { line: 12, stack: ['main()', 'ways(4)', 'ways(3)', 'ways(2)'], vars: { saved: '{2=2}' }, say: '<code>ways(2)</code> is 1 + 1 = 2. Save it: <code>saved[2] = 2</code>.' },
              { line: 12, stack: ['main()', 'ways(4)', 'ways(3)'], vars: { saved: '{2=2, 3=3}' }, say: '<code>ways(3)</code> also needs <code>ways(1)</code>, which is 1. So <code>ways(3)</code> is 2 + 1 = 3. Saved.' },
              { line: 9, stack: ['main()', 'ways(4)', 'ways(2)'], say: 'Back in <code>ways(4)</code>, the second half asks for <code>ways(2)</code> again. This time it is saved: return 2 straight away, no more calls.' },
              { line: 12, stack: ['main()', 'ways(4)'], vars: { saved: '{2=2, 3=3, 4=5}' }, say: '<code>ways(4)</code> is 3 + 2 = 5. Saved too.' },
              { line: 17, stack: ['main()'], out: '5', say: 'It prints 5. That took 7 calls; without <code>saved</code> it takes 9. For 40 stairs: 79 calls instead of 331,160,281.' },
            ],
          });
        },
        code: `val saved = mutableMapOf<Int, Int>()   // stairs -> number of ways

fun ways(stairs: Int): Int {
    if (stairs <= 1) {
        return 1
    }
    val known = saved[stairs]
    if (known != null) {
        return known                   // worked out before: reuse it
    }
    val answer = ways(stairs - 1) + ways(stairs - 2)
    saved[stairs] = answer
    return answer
}

fun tableWays(stairs: Int): Int {
    val table = mutableListOf(1, 1)    // 0 stairs and 1 stair: 1 way each
    for (n in 2..stairs) {
        table.add(table[n - 1] + table[n - 2])
    }
    return table[stairs]
}

fun main() {
    println(ways(4))           // 5
    println(ways(30))          // 1346269
    println(tableWays(30))     // 1346269
}`,
        play: `var calls = 0
val saved = mutableMapOf<Int, Int>()

fun slowWays(stairs: Int): Int {
    calls++
    if (stairs <= 1) {
        return 1
    }
    return slowWays(stairs - 1) + slowWays(stairs - 2)
}

fun ways(stairs: Int): Int {
    calls++
    if (stairs <= 1) {
        return 1
    }
    val known = saved[stairs]
    if (known != null) {
        return known
    }
    val answer = ways(stairs - 1) + ways(stairs - 2)
    saved[stairs] = answer
    return answer
}

fun main() {
    println("Slow: \${slowWays(30)} ways, \$calls calls")
    calls = 0
    println("Saved: \${ways(30)} ways, \$calls calls")
    // Try 40 stairs in both: the slow one makes over 300 million calls.
}`,
        remember: 'When the same smaller problem comes up again and again, save its answer the first time and reuse it.',
        terms: [
          { term: 'dynamic programming', def: 'Solving a problem from smaller problems that repeat, working each one out only once.' },
          { term: 'memoization', def: 'Saving a function’s answers, for example in a map, so a repeated call can return the saved answer at once.' },
          { term: 'subproblem', def: 'A smaller version of the problem, like <code>ways(3)</code> inside <code>ways(4)</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Reuse a saved answer, and save a new one.', code: 'val known = saved[stairs]\nif (known [[!=]] null) {\n    return known\n}\nval answer = ways(stairs - 1) + ways(stairs - 2)\nsaved[stairs] = [[answer]]\nreturn answer', why: 'A saved answer is not null. A new answer is saved before it is returned.' },
          { type: 'bug', prompt: '<code>tableWays(4)</code> should be 5, but it gives 8. Tap the wrong line.', code: 'fun tableWays(stairs: Int): Int {\n    val table = mutableListOf(1, 1)\n    for (n in 2..stairs) {\n        table.add(table[n - 1] + table[n - 1])\n    }\n    return table[stairs]\n}', bug: 3, fix: '        table.add(table[n - 1] + table[n - 2])', why: 'The ways to n stairs are the ways to n - 1 (last move 1 stair) plus the ways to n - 2 (last move 2 stairs). Adding n - 1 twice just doubles.' },
        ],
        quiz: [
          { q: 'Why does the plain recursive <code>ways(40)</code> make hundreds of millions of calls?', options: ['It works out the same smaller answers again and again', 'The answer is a big number', 'Recursion is always slow'], a: 0, why: 'Saving each answer once brings it down to 79 calls, with the same result.' },
          { q: 'The table starts <code>[1, 1]</code> and each new entry is the sum of the two before it. What is <code>table[3]</code>?', options: ['<code>3</code>', '<code>2</code>', '<code>5</code>'], a: 0, why: '<code>table[2]</code> is 1 + 1 = 2, and <code>table[3]</code> is 2 + 1 = 3.' },
          { q: 'When does dynamic programming help?', options: ['When the same smaller problems come up more than once', 'Whenever a list is sorted', 'Only when there is no recursion'], a: 0, why: 'Remembering answers only pays off if you would otherwise work them out again.' },
        ],
        docs: [['Map-specific operations', 'https://kotlinlang.org/docs/map-operations.html']],
      },

      {
        id: 'method',
        title: 'Solving a problem step by step',
        tagline: 'A routine for when you don’t know where to start.',
        goals: ['Work through small examples by hand before writing code', 'Write a simple, correct version first, then make it faster', 'Test the edge cases: empty, one item, no answer'],
        level: 'beginner', introduces: [],
        body: `
<p>A new problem can feel like a blank page. Here is one: a visitor log lists names in the order people came in. Who is the first person to come back a second time? A routine helps more than a flash of genius, and it is the same routine every time.</p>
<p><b>1. Understand it.</b> Say it in your own words. What goes in, what comes out? Here a <code>List&lt;String&gt;</code> goes in and a <code>String?</code> comes out: null when nobody came back. <b>2. Work examples by hand.</b> <code>Ada, Sam, Lin, Sam, Ada</code> gives Sam, because Sam’s second visit comes before Ada’s. Also try the odd ones, the <em>edge cases</em>: an empty log, one name, nobody coming back.</p>
<p><b>3. Write a simple version first.</b> For each visit, look back at every earlier one. A loop inside a loop is O(n²), but it is easy to get right, and a correct slow answer beats a fast wrong one. This straightforward try-everything version is called <em>brute force</em>. <b>4. Make it faster.</b> What work repeats? Looking back through earlier names. Which tool from this track answers “have I seen this?” in one step? A set: <code>seen.add(name)</code> gives false when the name is already there. One pass, O(n).</p>
<p><b>5. Test.</b> Run every example from step 2 through both versions and check they agree. The simple version is now your answer key.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'understand', label: 'Understand', sub: 'in, out' },
              { id: 'examples', label: 'Examples', sub: 'by hand' },
              { id: 'simple', label: 'Simple first', sub: 'correct' },
              { id: 'faster', label: 'Faster', sub: 'what repeats?' },
              { id: 'test', label: 'Test', sub: 'edge cases' },
            ],
            predict: { q: 'Which version should you write first?', options: ['The fastest one you can think of', 'A simple one you are sure is right'], a: 1, why: 'A correct simple version gives you something that works, and an answer key to test the faster one against.' },
            frames: [
              { say: 'Problem: in a visitor log, who is the first person to come back?' },
              { at: 'understand', packet: 'log', say: 'In: a list of names. Out: one name, or null if nobody came back. That is <code>String?</code>.' },
              { at: 'examples', packet: 'Sam', mark: { understand: 'ok' }, say: '<code>Ada, Sam, Lin, Sam, Ada</code>: Sam. <code>Ada, Sam</code>: null. An empty log: null.' },
              { at: 'simple', packet: 'O(n²)', mark: { examples: 'ok' }, say: 'For each visit, compare it with every earlier visit. A loop inside a loop: slow but clearly right.' },
              { at: 'faster', packet: 'O(n)', tone: 'ok', mark: { simple: 'ok' }, say: 'The repeated work is looking back. A set remembers who has been seen, so each name takes one step.' },
              { at: 'test', packet: '✓', tone: 'ok', mark: { faster: 'ok' }, say: 'Run every example through both versions. They agree, including the empty log.' },
              { mark: { test: 'ok' }, say: 'Next time you are stuck, start again at step 1. It works for small exercises and big features alike.' },
            ],
          });
        },
        code: `// Simple first: for each visit, look back at every earlier one. O(n²)
fun firstReturnSimple(visits: List<String>): String? {
    for (i in visits.indices) {
        for (j in 0 until i) {
            if (visits[j] == visits[i]) {
                return visits[i]
            }
        }
    }
    return null
}

// Faster: remember who you've seen in a set. O(n)
fun firstReturn(visits: List<String>): String? {
    val seen = mutableSetOf<String>()
    for (name in visits) {
        if (!seen.add(name)) {      // add gives false: seen before
            return name
        }
    }
    return null
}

fun main() {
    val log = listOf("Ada", "Sam", "Lin", "Sam", "Ada")
    println(firstReturnSimple(log))           // Sam
    println(firstReturn(log))                 // Sam
    println(firstReturn(listOf("Ada", "Sam"))) // null: nobody came back
    println(firstReturn(listOf()))            // null: empty log
}`,
        play: `fun firstReturnSimple(visits: List<String>): String? {
    for (i in visits.indices) {
        for (j in 0 until i) {
            if (visits[j] == visits[i]) {
                return visits[i]
            }
        }
    }
    return null
}

fun firstReturn(visits: List<String>): String? {
    val seen = mutableSetOf<String>()
    for (name in visits) {
        if (!seen.add(name)) {
            return name
        }
    }
    return null
}

fun check(visits: List<String>) {
    val simple = firstReturnSimple(visits)
    val fast = firstReturn(visits)
    println("\$visits -> \$fast, same as simple: \${simple == fast}")
}

fun main() {
    check(listOf("Ada", "Sam", "Lin", "Sam", "Ada"))
    check(listOf("Mia", "Mia"))
    check(listOf("Ada", "Sam"))
    check(listOf("Ben"))
    check(listOf())
    // Add your own example. Can you find one where the two disagree?
}`,
        remember: 'Understand, work examples, write it simply, make it faster, test the edge cases.',
        terms: [
          { term: 'edge case', def: 'An unusual input at the edge of what is allowed: an empty list, one item, no answer.' },
          { term: 'brute force', def: 'The straightforward solution that tries everything. Often slow, but a good correct first version.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the fast version.', code: 'fun firstReturn(visits: List<String>): String? {\n    val seen = mutableSetOf<String>()\n    for (name in visits) {\n        if (!seen.[[add]](name)) {\n            return name\n        }\n    }\n    return [[null]]\n}', why: '<code>add</code> gives false for a name already in the set. If the loop ends, nobody came back: null.' },
          { type: 'bug', prompt: 'On <code>Ada, Sam, Lin, Sam, Ada</code> this gives Ada instead of Sam. Tap the wrong line.', code: 'fun firstReturnSimple(visits: List<String>): String? {\n    for (i in visits.indices) {\n        for (j in 0..i) {\n            if (visits[j] == visits[i]) {\n                return visits[i]\n            }\n        }\n    }\n    return null\n}', bug: 2, fix: '        for (j in 0 until i) {', why: '<code>0..i</code> includes <code>i</code> itself, so the very first name matches itself. Only earlier visits count: <code>0 until i</code>.' },
        ],
        quiz: [
          { q: 'What is an edge case?', options: ['An unusual input like an empty list or a single item', 'The last line of a function', 'A bug that crashes the program'], a: 0, why: 'Edge cases are where code most often breaks, so test them on purpose.' },
          { q: 'Your fast version and your simple version give different answers for one example. What now?', options: ['Work that example by hand to see which one is wrong', 'Trust the fast one', 'Delete the simple one'], a: 0, why: 'The example and your hand-worked answer decide. Often the fast version missed something.' },
          { q: 'Step 4 asks “what work repeats?”. In the visitor log, what repeats in the simple version?', options: ['Looking back through earlier names', 'Printing the answer', 'Making the list'], a: 0, why: 'A set remembers the earlier names, so nothing needs looking back at.' },
        ],
        docs: [['Collections overview', 'https://kotlinlang.org/docs/collections-overview.html']],
      },
    ],
  });
})();
