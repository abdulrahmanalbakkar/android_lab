/* How code runs track. Same shape as tracks/kotlin.js.
   Computer science foundations: compilers, runtimes, memory management, then the Android form of each
   (kotlinc, D8/R8, ART, its garbage collector, startup). Every class is prefixed rt-.
   Timing numbers in the demos are illustrative and labelled as such; the facts in the prose follow
   source.android.com and developer.android.com. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const act = (text, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, text);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const label = text => h('span', { class: 'rt-label' }, text);
  const pre = src => h('pre', { class: 'kt rt-pre', html: hl(src) });
  function stats(names) {
    const vals = {};
    const root = h('div', { class: 'rt-stats' }, names.map(n => { const b = h('b', {}, '-'); vals[n] = b; return h('span', { class: 'rt-stat' }, `${n} `, b); }));
    root.set = (n, v) => { if (vals[n].textContent !== String(v)) { vals[n].textContent = String(v); replay(vals[n], 'pop-soft'); } };
    return root;
  }
  function picker(name, items, onPick) {
    const btns = items.map((it, k) => act(it.label, () => { press(btns, btns[k]); onPick(it, k); }));
    press(btns, btns[0]);
    return h('div', { class: 'controls' }, name ? label(name) : null, btns);
  }

  // Step player. o.build() returns frames (frame 0 is the start), o.paint(frame) draws one.
  function player(el, o) {
    let frames = [], i = 0, tok = 0;
    const msg = out('');
    const count = h('span', { class: 'rt-stat' });
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
        await sleep(o.speed || 700);
        if (t !== tok || !el.isConnected) return;
      }
      runB.setAttribute('aria-pressed', 'false');
    }
    function reset() { tok++; runB.setAttribute('aria-pressed', 'false'); frames = o.build(); i = 0; go(0); }
    el.append(...[].concat(o.top || []), h('div', { class: 'rt-stage' }, o.view), h('div', { class: 'controls rt-ctl' }, stepB, runB, resetB, count), msg);
    reset();
    return { reset };
  }

  // Directed object graph as inline SVG. nodes: [{ id, x, y, text, label, root? }], edges: [[a, b, both?]]
  let svgN = 0;
  function graphSvg(nodes, edges, { w = 360, ht = 230, r = 16, name = 'object graph' } = {}) {
    const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
    const mid = `rt-arrow-${++svgN}`;
    const lines = edges.map(([a, b, both]) => {
      const A = pos[a], B = pos[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const s = r + (both ? 3 : 0), e = r + 3;
      return `<line class="rt-ed" data-e="${a}>${b}" x1="${(A.x + ux * s).toFixed(1)}" y1="${(A.y + uy * s).toFixed(1)}" x2="${(B.x - ux * e).toFixed(1)}" y2="${(B.y - uy * e).toFixed(1)}" marker-end="url(#${mid})"${both ? ` marker-start="url(#${mid})"` : ''}/>`;
    }).join('');
    const shapes = nodes.map(n => `<g class="rt-gn" data-n="${n.id}">${n.root
      ? `<rect x="${n.x - r - 6}" y="${n.y - r + 2}" width="${2 * r + 12}" height="${2 * r - 4}" rx="7"/>`
      : `<circle cx="${n.x}" cy="${n.y}" r="${r}"/>`}<text class="rt-gt" x="${n.x}" y="${n.y}">${n.text}</text>${n.label ? `<text class="rt-gl" x="${n.x}" y="${n.y + r + 11}">${n.label}</text>` : ''}</g>`).join('');
    const defs = `<defs><marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path class="rt-arrow" d="M0,0 L10,5 L0,10 z"/></marker></defs>`;
    const root = h('div', { class: 'rt-svgwrap', html: `<svg class="rt-svg" viewBox="0 0 ${w} ${ht}" role="img" aria-label="${name}">${defs}${lines}${shapes}</svg>` });
    const N = {}, E = {};
    root.querySelectorAll('.rt-gn').forEach(g => { N[g.dataset.n] = g; });
    root.querySelectorAll('.rt-ed').forEach(l => { E[l.dataset.e] = l; });
    return {
      root,
      node(id, cls) { N[id].setAttribute('class', `rt-gn ${cls || ''}`); },
      edge(a, b, cls) { const l = E[`${a}>${b}`]; if (l) l.setAttribute('class', `rt-ed ${cls || ''}`); },
    };
  }

  const css = `
.rt-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.rt-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.rt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.rt-note { font: 500 0.74rem/1.4 var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.rt-stats { display: flex; flex-wrap: wrap; gap: 4px 16px; min-width: 0; }
.rt-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.rt-stat b { color: var(--ink); display: inline-block; }
.rt-ctl .cmd:disabled { opacity: 0.45; cursor: default; transform: none; }
.kt.rt-pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 0.8rem; line-height: 1.5; }
.rt-pill { font: 600 0.76rem var(--mono); padding: 4px 9px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s, opacity 0.2s, transform 0.2s; }
.rt-pill.rt-on { border-color: var(--accent); background: var(--accent-soft); transform: translateY(-2px); }
.rt-pill.rt-done { border-color: var(--ok); }
.rt-pill.rt-warm { border-color: var(--warm); background: var(--warm-soft); }
.rt-pill.rt-bad { border-color: var(--err); background: var(--err-soft); }
.rt-pill.rt-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.rt-pill.rt-gone { opacity: 0.3; text-decoration: line-through; }
.rt-arrowtxt { color: var(--muted); font: 700 0.8rem var(--mono); }
.rt-group { display: grid; gap: 4px; min-width: 0; }
.rt-group-name { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; }
.rt-g-front { color: var(--accent); } .rt-g-mid { color: var(--warm); } .rt-g-back { color: var(--ok); }
.rt-pipe { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: end; min-width: 0; }

/* bytecode viewer */
.rt-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 10px; min-width: 0; }
.rt-pane { display: grid; gap: 6px; align-content: start; min-width: 0; }
@media (max-width: 620px) { .rt-split { grid-template-columns: minmax(0, 1fr); } }

/* class and method lists (DEX) */
.rt-classes { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.rt-class { display: grid; gap: 4px; padding: 8px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: opacity 0.3s, border-color 0.3s; }
.rt-class h5 { margin: 0; font: 700 0.78rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.rt-class.rt-gone { opacity: 0.3; border-style: dashed; }
.rt-class.rt-lib { border-color: var(--warm); }
.rt-m { font: 500 0.72rem var(--mono); color: var(--ink); overflow-wrap: anywhere; transition: opacity 0.3s; }
.rt-m.rt-gone { opacity: 0.35; text-decoration: line-through; color: var(--muted); }
.rt-m.rt-new { color: var(--accent); font-weight: 700; }
.rt-dexfile { display: grid; gap: 4px; min-width: 0; }
.rt-meter { height: 18px; background: var(--sunk); border-radius: 6px; overflow: hidden; min-width: 0; position: relative; }
.rt-fill { height: 100%; width: 0; background: var(--accent); border-radius: 6px; transition: width 0.45s ease-out, background 0.3s; }
.rt-fill.rt-full { background: var(--err); }

/* charts */
.rt-svgwrap { min-width: 0; }
.rt-svg { display: block; width: 100%; max-width: 460px; height: auto; margin: 0 auto; overflow: visible; }
.rt-svg text { fill: var(--ink); font-family: var(--mono); }
.rt-svg .rt-axis { stroke: var(--line); stroke-width: 1.5; }
.rt-svg .rt-tick { fill: var(--muted); font-size: 10px; }
.rt-svg .rt-line { fill: none; stroke-width: 2.5; stroke-linejoin: round; }
.rt-svg .rt-l-int { stroke: var(--err); } .rt-svg .rt-l-jit { stroke: var(--warm); } .rt-svg .rt-l-aot { stroke: var(--ok); }
.rt-svg .rt-mark { fill: var(--accent); font-size: 10px; font-weight: 700; }
.rt-svg .rt-markline { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 4 3; }
.rt-key { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 600 0.74rem var(--mono); color: var(--ink); }
.rt-key i { display: inline-block; width: 14px; height: 4px; border-radius: 2px; vertical-align: middle; margin-right: 6px; }
.rt-k-int { background: var(--err); } .rt-k-jit { background: var(--warm); } .rt-k-aot { background: var(--ok); }
.rt-bars { display: grid; gap: 6px; min-width: 0; }
.rt-barrow { display: grid; grid-template-columns: 5.6em minmax(0, 1fr) 4.4em; gap: 8px; align-items: center; font: 600 0.74rem var(--mono); color: var(--ink); min-width: 0; }
.rt-bar { height: 16px; border-radius: 5px; background: var(--muted); width: 0; transition: width 0.45s ease-out, background 0.3s; }
.rt-bar.rt-b-slow { background: var(--err); } .rt-bar.rt-b-mid { background: var(--warm); } .rt-bar.rt-b-fast { background: var(--ok); }
.rt-num { text-align: right; font-variant-numeric: tabular-nums; }

/* object graph */
.rt-svg .rt-ed { stroke: var(--line); stroke-width: 2.5; transition: stroke 0.25s; }
.rt-svg .rt-ed.rt-on { stroke: var(--ok); stroke-width: 3.5; }
.rt-svg .rt-ed.rt-dim { opacity: 0.2; }
.rt-svg .rt-arrow { fill: var(--muted); }
.rt-svg .rt-gn circle, .rt-svg .rt-gn rect { fill: var(--surface); stroke: var(--muted); stroke-width: 2.5; transition: fill 0.25s, stroke 0.25s, opacity 0.3s; }
.rt-svg .rt-gn.rt-root rect { stroke: var(--accent); fill: var(--accent-soft); }
.rt-svg .rt-gn.rt-on circle { fill: var(--ok-soft); stroke: var(--ok); }
.rt-svg .rt-gn.rt-hot circle { fill: var(--warm-soft); stroke: var(--warm); }
.rt-svg .rt-gn.rt-bad circle { fill: var(--err-soft); stroke: var(--err); }
.rt-svg .rt-gn.rt-dim { opacity: 0.18; }
.rt-svg .rt-gt { font-size: 12px; font-weight: 700; text-anchor: middle; dominant-baseline: central; }
.rt-svg .rt-gl { font-size: 10px; font-weight: 600; fill: var(--muted); text-anchor: middle; dominant-baseline: central; }

/* heap boxes (leaks, generations) */
.rt-heap { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr)); gap: 8px; min-width: 0; }
.rt-obj { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 600 0.76rem/1.35 var(--mono); color: var(--ink); min-width: 0; overflow-wrap: anywhere; transition: opacity 0.3s, border-color 0.3s, background 0.3s; }
.rt-obj small { font-weight: 500; color: var(--muted); }
.rt-obj.rt-live { border-color: var(--ok); background: var(--ok-soft); }
.rt-obj.rt-leak { border-color: var(--err); background: var(--err-soft); }
.rt-obj.rt-freed { opacity: 0.3; border-style: dashed; }
.rt-gens { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; min-width: 0; }
.rt-gen { display: flex; flex-wrap: wrap; gap: 5px; align-content: start; min-height: 70px; padding: 8px; border-radius: 10px; border: 2px dashed var(--line); min-width: 0; }
.rt-path { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }

/* startup timeline */
.rt-tl { display: flex; height: 34px; border-radius: 8px; overflow: hidden; background: var(--sunk); min-width: 0; }
.rt-seg { height: 100%; transition: flex-basis 0.45s ease-out; min-width: 0; border-right: 2px solid var(--bg); }
.rt-s0 { background: var(--muted); } .rt-s1 { background: var(--accent); } .rt-s2 { background: var(--warm); }
.rt-s3 { background: var(--err); } .rt-s4 { background: var(--ok); } .rt-s5 { background: var(--ink); }
.rt-legend { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr)); gap: 4px 12px; font: 600 0.74rem var(--mono); color: var(--ink); min-width: 0; }
.rt-legend span { display: flex; gap: 6px; align-items: center; min-width: 0; overflow-wrap: anywhere; }
.rt-legend i { flex: none; width: 12px; height: 12px; border-radius: 3px; }
.rt-legend b { margin-left: auto; font-variant-numeric: tabular-nums; }
.rt-total { font: 700 1.05rem var(--mono); color: var(--ink); }
`;

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  const PIPE = {
    compile: [
      { name: 'Source', g: 'front', text: 'val total = price * 2 + tax', msg: 'One line of Kotlin. To the CPU it is only characters. <code>price</code> and <code>tax</code> are <code>Int</code> parameters.' },
      { name: 'Tokens', g: 'front', text: '[val] [total] [=] [price] [*] [2] [+] [tax]', msg: '<b>Lexer:</b> groups characters into tokens: keywords, names, operators, numbers. Spaces and comments go away.' },
      { name: 'Syntax tree', g: 'front', text: 'Property total\n└─ Plus\n   ├─ Times\n   │  ├─ Name price\n   │  └─ Const 2\n   └─ Name tax', msg: '<b>Parser:</b> builds a tree from the grammar. <code>*</code> binds tighter than <code>+</code>, so Times sits under Plus.' },
      { name: 'Typed tree', g: 'front', text: 'Property total: Int\n└─ call Int.plus(Int): Int\n   ├─ call Int.times(Int): Int\n   │  ├─ price: Int\n   │  └─ 2: Int\n   └─ tax: Int', msg: '<b>Semantic analysis:</b> resolves every name and infers every type. Type errors are reported here, before any code exists.' },
      { name: 'IR', g: 'mid', text: 't1 = mul price, 2\nt2 = add t1, tax\ntotal = t2', msg: '<b>Intermediate representation:</b> a simple form that is neither Kotlin nor machine code. Many languages and many CPUs can share it.' },
      { name: 'Optimized IR', g: 'mid', text: 't1 = shl price, 1     // ×2 became a shift\ntotal = add t1, tax   // t2 removed', msg: '<b>Optimizer:</b> rewrites the IR to do the same work with fewer or cheaper steps.' },
      { name: 'Machine code', g: 'back', text: 'lsl  w8, w0, #1      // ARM64\nadd  w0, w8, w1', msg: '<b>Code generator:</b> picks real CPU instructions and registers. Done once, ahead of time. Running it later costs nothing extra.' },
    ],
    interpret: [
      { name: 'Source', g: 'front', text: 'val total = price * 2 + tax\n// price = 40, tax = 5', msg: 'Same line, now run by an interpreter. Inputs: <code>price = 40</code>, <code>tax = 5</code>.' },
      { name: 'Tokens', g: 'front', text: '[val] [total] [=] [price] [*] [2] [+] [tax]', msg: 'An interpreter has a front end too: it still has to tokenize and parse.' },
      { name: 'Syntax tree', g: 'front', text: 'Property total\n└─ Plus\n   ├─ Times\n   │  ├─ Name price\n   │  └─ Const 2\n   └─ Name tax', msg: 'It stops at a tree (or a simple bytecode). No machine code is generated.' },
      { name: 'Evaluate', g: 'back', text: 'visit Name price   → 40\nvisit Const 2      → 2\nvisit Times        → 80', msg: '<b>Evaluate:</b> the interpreter walks the tree and does each operation in its own loop. Every visit costs dispatch work.' },
      { name: 'Evaluate', g: 'back', text: 'visit Name price   → 40\nvisit Const 2      → 2\nvisit Times        → 80\nvisit Name tax     → 5\nvisit Plus         → 85\nstore total        = 85', msg: 'Result: 85. It started right away, with no compile step.' },
      { name: 'Evaluate', g: 'back', text: '// line runs again (next loop iteration)\nvisit Name price   → 41\nvisit Const 2      → 2\nvisit Times        → 82\n...', msg: 'Run the line again and the interpreter walks the tree again. <span class="bad">The work is repeated every time.</span> A compiler paid once.' },
    ],
  };

  lessons.push({
    id: 'source-to-machine',
    title: 'From source to machine code',
    tagline: 'A compiler translates once ahead of time; an interpreter executes as it reads.',
    level: 'beginner',
    body: `
<p>A CPU runs only machine instructions: load, add, compare, jump. Your Kotlin has to become those instructions somehow. A <em>compiler</em> translates the whole program ahead of time into another form. An <em>interpreter</em> reads the program and carries out each step while it runs.</p>
<p>Most compilers are built as a pipeline. The <em>front end</em> understands the language: it splits text into tokens, parses them into a tree, and checks names and types. The <em>back end</em> understands the machine: it picks instructions and registers. Between them sits an <em>intermediate representation</em> (IR), a simple form both halves agree on.</p>
<p>Real systems mix both ideas. Kotlin compiles to bytecode, and Android's runtime then interprets some of it and compiles the rest to machine code. This track follows a line of Kotlin all the way to the CPU. Step through the pipeline, then switch to the interpreter and compare.</p>`,
    code: `// What each stage sees, for one function
fun total(price: Int, tax: Int): Int = price * 2 + tax

// Front end:  tokens → syntax tree → typed tree (errors like "type mismatch" come from here)
// IR:         t1 = mul price, 2 ; t2 = add t1, tax ; return t2
// Optimizer:  mul by 2 → shift left by 1
// Back end:   ARM64 for a phone, x86-64 for an emulator on a PC

// Kotlin itself compiles to JVM bytecode, which is one more intermediate form:
// kotlinc total.kt -d out/        → out/TotalKt.class`,
    remember: 'Front end = understand the language. Back end = target the machine. IR is the contract between them.',
    predict: {
      q: "In compiler mode, what becomes of <code>price * 2</code> before it reaches the CPU?",
      options: ["It stays a multiply instruction", "The optimizer turns ×2 into a left shift", "It is computed at compile time"],
      a: 1,
      why: "<code>price</code> is only known at run time, so the work can’t be done early. But shifting left by one bit doubles an integer and is cheaper than a multiply.",
    },
    visual(el) {
      let mode = 'compile';
      const pipe = h('div', { class: 'rt-pipe' });
      const art = h('div', {});
      const p = player(el, {
        top: picker('mode', [{ label: 'Compiler', v: 'compile' }, { label: 'Interpreter', v: 'interpret' }], it => { mode = it.v; p.reset(); }),
        view: [pipe, label('what this stage holds'), art],
        speed: 1100,
        build: () => PIPE[mode].map(f => ({ ...f })),
        paint(f, i, frames) {
          const names = [...new Set(frames.map(x => x.name))];
          const cur = names.indexOf(f.name);
          const groups = { front: 'front end', mid: 'middle (IR)', back: mode === 'compile' ? 'back end' : 'run' };
          pipe.replaceChildren(...Object.keys(groups).map(g => {
            const own = names.filter(n => frames.find(x => x.name === n).g === g);
            if (!own.length) return null;
            return h('div', { class: 'rt-group' }, h('span', { class: `rt-group-name rt-g-${g}` }, groups[g]),
              h('div', { class: 'rt-row' }, own.map(n => { const k = names.indexOf(n); return h('span', { class: `rt-pill ${k === cur ? 'rt-on' : k < cur ? 'rt-done' : 'rt-ghost'}` }, n); })));
          }).filter(Boolean));
          art.replaceChildren(pre(f.text));
          replay(art.firstChild, 'drop-in');
        },
      });
    },
    deeper: [
      {
        title: 'Why split front and back',
        body: `<p>Without a shared IR, supporting 4 languages on 3 CPUs needs 12 separate compilers. With one IR you write 4 front ends and 3 back ends: 7 pieces, and every optimization on the IR helps all of them.</p>
<p>Kotlin uses this idea. One front end reads Kotlin, then separate back ends produce JVM bytecode, JavaScript, WebAssembly or native code for Kotlin/Native. That is how <a href="#kmp">Kotlin Multiplatform</a> shares one language across targets.</p>`,
        code: `//                ┌─ JVM back end    → .class (Android, server)
// Kotlin source → front end → IR ─┼─ JS back end     → .js
//                ├─ Wasm back end   → .wasm
//                └─ Native back end → iOS / macOS binaries (LLVM)`,
      },
      {
        title: 'Bytecode: a portable middle',
        body: `<p>Some compilers stop at <em>bytecode</em>: compact instructions for a virtual machine, not for a real CPU. The same bytecode runs on any device that has the VM. The VM then interprets it or compiles it further.</p>
<p>Android uses two bytecodes in a row. Kotlin compiles to JVM bytecode (<code>.class</code> files), and the build turns that into DEX bytecode, which Android's runtime (ART) runs. Lessons 2 to 4 follow each step.</p>`,
      },
      {
        title: 'AOT and JIT',
        body: `<p><em>Ahead-of-time</em> (AOT) compilation produces machine code before the program runs: slow to build, fast from the first instruction. <em>Just-in-time</em> (JIT) compilation starts by interpreting, watches which code runs often, and compiles only that hot code while the program runs.</p>
<p>JIT spends compile time only where it pays off and can use what it sees at runtime. AOT avoids the warm-up. ART uses both, guided by profiles; see <a href="#runtime.art">ART: interpreter, JIT and AOT</a>.</p>`,
      },
    ],
    mistakes: [
      { title: 'Treating "compiled" and "fast" as the same thing', bad: '// "Kotlin is compiled, so this is free"\nfor (i in 0 until 1_000_000) {\n    list.add(Item(i))       // 1M allocations\n}', good: '// Compiled code still does the work you wrote\nval list = ArrayList<Item>(1_000_000)\nfor (i in 0 until 1_000_000) list.add(Item(i))', why: 'A compiler removes translation overhead, not the work itself. A million allocations stay a million allocations; only better code makes them fewer.' },
    ],
    terms: [
      { term: 'Compiler', def: 'A program that translates source code ahead of time into another form, such as bytecode or machine code.' },
      { term: 'Interpreter', def: 'A program that runs code by reading it and performing each operation directly, without first producing machine code.' },
      { term: 'Intermediate representation (IR)', def: 'The simplified form of a program a compiler works on between its front end and back end.' },
      { term: 'Front end / back end', def: 'The front end parses and type-checks one language; the back end generates code for one target machine.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Name the compiler stages in order.', code: '// characters → [[tokens]] (lexer)\n// tokens → syntax [[tree]] (parser)\n// tree → typed tree (semantic analysis)\n// typed tree → [[IR]] → optimizer → machine code', why: 'The lexer makes tokens, the parser makes a tree, type checking annotates it, and lowering to IR lets the optimizer and back end work on a simple form.' },
      { type: 'bug', prompt: 'This pipeline description has one stage in the wrong place. Tap it.', code: '1. Lexer: characters → tokens\n2. Parser: tokens → syntax tree\n3. Code generator: syntax tree → machine code\n4. Semantic analysis: check names and types', bug: 2, fix: '3. Semantic analysis: check names and types (then IR → code generator)', why: 'Types are checked in the front end, before any code is generated. A code generator needs a typed program: it must know whether <code>+</code> means integer add or string concatenation.' },
    ],
    quiz: [
      { q: 'You write <code>val x: Int = "hello"</code>. Which stage reports the error?', options: ['The lexer', 'Semantic analysis (type checking) in the front end', 'The code generator in the back end', 'The CPU, when the line runs'], a: 1, why: '"hello" is a valid token and the line parses fine. Only type checking knows a <code>String</code> can’t go into an <code>Int</code>, and it runs before any code exists.' },
      { q: 'A loop body runs 10 million times. Why does an interpreter usually lose to compiled code here?', options: ['Interpreters can’t run loops', 'It repeats the dispatch work for every operation on every pass; compiled code paid the translation once', 'Interpreted code uses more threads'], a: 1, why: 'Each visit to a tree node or bytecode costs a lookup and a jump in the interpreter’s own loop. Compiled code goes straight to CPU instructions.' },
      { q: 'A team adds a new CPU target to a compiler that has a shared IR. What do they write?', options: ['A new front end for every language', 'One new back end from the IR', 'A new IR'], a: 1, why: 'Every front end already produces the IR, so one back end from IR to the new CPU serves all of them.' },
      { q: 'Which order matches Kotlin on Android?', options: ['Kotlin → machine code → DEX', 'Kotlin → JVM bytecode → DEX → (interpreted, JIT or AOT on the device)', 'Kotlin → DEX → JVM bytecode'], a: 1, why: 'kotlinc emits .class files, D8 or R8 converts them to DEX, and ART on the phone decides how each method runs.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  const SNIPS = [
    {
      label: 'Properties',
      kt: `class User(val name: String, var age: Int)`,
      java: `public final class User {
   @NotNull
   private final String name;
   private int age;

   public User(@NotNull String name, int age) {
      Intrinsics.checkNotNullParameter(name, "name");
      super();
      this.name = name;
      this.age = age;
   }

   @NotNull
   public final String getName() { return this.name; }

   public final int getAge() { return this.age; }

   public final void setAge(int var1) { this.age = var1; }
}`,
      bc: `public final java.lang.String getName();
  Code:
     0: aload_0
     1: getfield  // Field name:Ljava/lang/String;
     4: areturn

public final void setAge(int);
  Code:
     0: aload_0
     1: iload_1
     2: putfield  // Field age:I
     5: return`,
      note: '<code>val</code> gives a private final field and a getter. <code>var</code> adds a setter. Classes are <code>final</code> unless you write <code>open</code>. Non-null parameters get a runtime check so Java callers can’t pass null.',
    },
    {
      label: 'data class',
      kt: `data class Point(val x: Int, val y: Int)`,
      java: `public final class Point {
   private final int x;
   private final int y;

   public Point(int x, int y) { this.x = x; this.y = y; }
   public final int getX() { return this.x; }
   public final int getY() { return this.y; }

   public final int component1() { return this.x; }
   public final int component2() { return this.y; }

   @NotNull
   public final Point copy(int x, int y) { return new Point(x, y); }
   // + static copy$default(...) for the default arguments

   @NotNull
   public String toString() { return "Point(x=" + this.x + ", y=" + this.y + ")"; }

   public int hashCode() { return Integer.hashCode(this.x) * 31 + Integer.hashCode(this.y); }

   public boolean equals(@Nullable Object other) {
      if (this == other) return true;
      if (!(other instanceof Point)) return false;
      Point p = (Point) other;
      return this.x == p.x && this.y == p.y;
   }
}`,
      bc: `$ javap -p Point.class
public final class Point {
  private final int x;
  private final int y;
  public Point(int, int);
  public final int getX();
  public final int getY();
  public final int component1();
  public final int component2();
  public final Point copy(int, int);
  public static Point copy$default(Point, int, int, int, java.lang.Object);
  public java.lang.String toString();
  public int hashCode();
  public boolean equals(java.lang.Object);
}`,
      note: 'One line generates ten methods. They only use properties from the primary constructor. Every one of them is code that ends up in your DEX file unless R8 removes the unused ones.',
    },
    {
      label: 'Lambda',
      kt: `fun doubled(xs: List<Int>): List<Int> {
    val twice = { x: Int -> x * 2 }
    return xs.map(twice)
}`,
      java: `public final class MainKt {           // top-level functions live here
   @NotNull
   public static final List<Integer> doubled(@NotNull List<Integer> xs) {
      Intrinsics.checkNotNullParameter(xs, "xs");
      Function1 twice = MainKt::doubled$lambda$0;   // invokedynamic
      // map is inline: its loop is copied here
      Collection dest = new ArrayList(CollectionsKt.collectionSizeOrDefault(xs, 10));
      for (Object item : xs) dest.add(twice.invoke(item));
      return (List) dest;
   }

   private static final int doubled$lambda$0(int x) { return x * 2; }
}`,
      bc: `public static final java.util.List doubled(java.util.List);
  Code:
     ...
     6: invokedynamic  // InvokeDynamic #0:invoke:()Lkotlin/jvm/functions/Function1;
    11: astore_1
     ...
    54: invokeinterface // kotlin/jvm/functions/Function1.invoke
     ...

private static final int doubled$lambda$0(int);
  Code:
     0: iload_0
     1: iconst_2
     2: imul
     3: ireturn`,
      note: 'The lambda body becomes a private static method. Since Kotlin 2.0, lambdas are created with <code>invokedynamic</code> by default instead of one anonymous class each. On Android, D8 desugars that into code the runtime supports. <code>map</code> itself is inline, so its loop is pasted in.',
    },
    {
      label: 'inline fun',
      kt: `inline fun timed(block: () -> Unit) {
    val start = System.nanoTime()
    block()
    println(System.nanoTime() - start)
}

fun main() {
    timed { println("Hello") }
}`,
      java: `public static final void main() {
   // the body of timed() is copied in, and so is the lambda
   long start$iv = System.nanoTime();
   System.out.println("Hello");
   System.out.println(System.nanoTime() - start$iv);
}

// timed() still exists for callers from Java and reflection,
// but this call site never calls it`,
      bc: `public static final void main();
  Code:
     0: invokestatic  // Method java/lang/System.nanoTime:()J
     3: lstore_1
     4: ldc           // String Hello
     6: getstatic     // Field java/lang/System.out
     9: swap
    10: invokevirtual // Method java/io/PrintStream.println
     ...
    // no Function0 object, no invoke() call`,
      note: '<code>inline</code> makes the compiler copy the function body and the lambda into the call site. No function object is created. See <a href="#kdeep.inline">inline functions</a> for when this pays off.',
    },
  ];

  lessons.push({
    id: 'kotlin-compile',
    title: 'What kotlinc produces',
    tagline: 'Kotlin compiles to JVM bytecode, and decompiling it shows what your one-liners cost.',
    level: 'intermediate',
    body: `
<p>On Android, the Kotlin compiler turns <code>.kt</code> files into JVM <code>.class</code> files. Since Kotlin 2.0 the compiler uses a rewritten front end called K2, which does the parsing, name resolution and type inference. A shared IR back end then generates the bytecode.</p>
<p>Bytecode is the honest version of your code. A <code>val</code> becomes a private field plus a getter. A <code>data class</code> becomes about ten methods. Top-level functions land in a class named after the file, like <code>MainKt</code>. None of this is bad, but it is real code that gets shipped, loaded and run.</p>
<p>You can see it yourself: in Android Studio, open a Kotlin file and use <b>Tools › Kotlin › Show Kotlin Bytecode</b>, then <b>Decompile</b> for a Java-like view. The demo runs <code>kotlinc</code> and <code>javap</code> on three small files; the output is real, from Kotlin 2.2.</p>`,
    code: `// Compile one file on the command line and look inside
// $ kotlinc Point.kt -d out/
// $ javap -p out/Point.class          (members)
// $ javap -c -p out/Point.class       (bytecode instructions)

data class Point(val x: Int, val y: Int)

fun main() {
    val p = Point(1, 2)
    val (x, y) = p            // calls p.component1(), p.component2()
    println(p.copy(y = 5))    // calls the static copy$default helper
}`,
    remember: 'Every Kotlin feature compiles to plain JVM members. Decompile when you need to know what a line really costs.',
    visual(el) {
      const src = s => '<pre class="ui-out">' + s.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
      Lab.ui.terminal(el, {
        panelTitle: 'Kotlin source',
        predict: {
          q: '<code>Main.kt</code> holds only a top-level function, <code>doubled()</code>. What does kotlinc write for it?',
          options: ['Nothing: a top-level function needs a class around it', 'A class <code>MainKt</code> with <code>doubled</code> as a static method', 'A class named <code>Main</code>'],
          a: 1,
          why: 'The JVM only knows classes, so top-level functions go into a class named after the file plus <code>Kt</code>, as static methods.',
        },
        frames: [
          { panel: src('// User.kt\nclass User(val name: String, var age: Int)\n\n// Point.kt\ndata class Point(val x: Int, val y: Int)\n\n// Main.kt\nfun doubled(xs: List<Int>): List<Int> {\n    val twice = { x: Int -> x * 2 }\n    return xs.map(twice)\n}'), say: 'Three small Kotlin files. Compile them and look inside the class files with <code>javap</code>, the JDK’s class file viewer.' },
          { cmd: 'kotlinc User.kt Point.kt Main.kt -d out', say: 'kotlinc writes JVM <code>.class</code> files. No output means no errors.' },
          { cmd: 'ls out', out: 'META-INF  MainKt.class  Point.class  User.class', say: 'One class file per class, plus <code>MainKt</code> for the top-level function in <code>Main.kt</code>.' },
          { cmd: 'javap -p out/User.class', panel: src('class User(val name: String, var age: Int)'), out: 'Compiled from "User.kt"\npublic final class User {\n  private final java.lang.String name;\n  private int age;\n  public User(java.lang.String, int);\n  public final java.lang.String getName();\n  public final int getAge();\n  public final void setAge(int);\n}', say: '<code>val</code> became a private final field and a getter. <code>var</code> also got a setter. The class is <code>final</code> because Kotlin classes are closed by default.' },
          { cmd: 'javap -p out/Point.class', clear: true, panel: src('data class Point(val x: Int, val y: Int)'), out: 'Compiled from "Point.kt"\npublic final class Point {\n  private final int x;\n  private final int y;\n  public Point(int, int);\n  public final int getX();\n  public final int getY();\n  public final int component1();\n  public final int component2();\n  public final Point copy(int, int);\n  public static Point copy$default(Point, int, int, int, java.lang.Object);\n  public java.lang.String toString();\n  public int hashCode();\n  public boolean equals(java.lang.Object);\n}', say: 'One line of Kotlin, ten methods: getters, <code>componentN</code> for destructuring, <code>copy</code> with a helper for default arguments, and <code>toString</code>, <code>hashCode</code>, <code>equals</code>.' },
          { cmd: 'javap -p out/MainKt.class', clear: true, panel: src('fun doubled(xs: List<Int>): List<Int> {\n    val twice = { x: Int -> x * 2 }\n    return xs.map(twice)\n}'), out: 'Compiled from "Main.kt"\npublic final class MainKt {\n  public static final java.util.List&lt;java.lang.Integer&gt; doubled(java.util.List&lt;java.lang.Integer&gt;);\n  private static final int doubled$lambda$0(int);\n}', say: 'The top-level function is a static method of <code>MainKt</code>. The lambda body became a private static method, <code>doubled$lambda$0</code>.' },
          { cmd: 'javap -c -p out/MainKt.class | grep -E "invokedynamic|Function1.invoke"', out: '       6: invokedynamic #36,  0             // InvokeDynamic #0:invoke:()Lkotlin/jvm/functions/Function1;\n      76: invokeinterface #70,  2           // InterfaceMethod kotlin/jvm/functions/Function1.invoke:(Ljava/lang/Object;)Ljava/lang/Object;', say: 'Since Kotlin 2.0 the lambda object is made with <code>invokedynamic</code>. <code>map</code> is inline, so its loop was copied into <code>doubled</code> and calls <code>invoke</code> once per item, with <code>Object</code> parameters: each <code>Int</code> is boxed.' },
        ],
      });
    },
    deeper: [
      {
        title: 'K2: the new front end',
        body: `<p>K2 is enabled by default from Kotlin 2.0.0. It replaced the old front end with one unified data structure that carries more semantic information, which makes analysis faster and smart casts smarter. JetBrains reports large compile-time gains on real projects, though your numbers will vary.</p>
<p>K2 changes the front end only. The bytecode it produces for ordinary code looks the same as before, because the IR back end did not change in the same way.</p>`,
      },
      {
        title: 'Names Java sees',
        body: `<p>Properties become <code>getX()</code>/<code>setX()</code>; a property named <code>isOpen</code> keeps the name for its getter. Top-level functions in <code>News.kt</code> become static methods of <code>NewsKt</code>. A <code>companion object</code> becomes a nested class called <code>Companion</code> with a static instance field. Annotations change the shape when Java callers need it.</p>`,
        code: `@file:JvmName("NewsUtils")          // class name instead of NewsKt
package com.example.news

fun slugify(title: String) = title.lowercase().replace(' ', '-')

class Article(@JvmField val id: Long) {   // public field, no getter
    companion object {
        @JvmStatic fun empty() = Article(0)   // real static method too
    }
}`,
      },
      {
        title: 'Read bytecode for what matters',
        body: `<p>You don’t need to read every instruction. Look for a few signs: <code>new</code> inside a loop (allocations), <code>invokeinterface ... Function1.invoke</code> (a lambda call that was not inlined), <code>Integer.valueOf</code> (boxing an <code>Int</code> into an object), and <code>checkNotNullParameter</code> (null checks at public boundaries).</p>`,
        code: `fun sum(xs: List<Int>): Int {     // List<Int> holds boxed Integers
    var s = 0
    for (x in xs) s += x           // bytecode: Integer.intValue() per item
    return s
}

fun sum(xs: IntArray): Int {      // IntArray is a primitive int[]
    var s = 0
    for (x in xs) s += x           // bytecode: iaload, no boxing
    return s
}`,
      },
    ],
    underHood: {
      body: `<p>A <code>.class</code> file holds a constant pool (every name, type and string the class uses), its fields, and its methods. Each method has a <em>stack machine</em> bytecode: instructions push values onto an operand stack and pop them. <code>iload_1</code> pushes local variable 1, <code>imul</code> pops two ints and pushes their product, <code>ireturn</code> returns the top. DEX, which Android runs, uses registers instead of a stack, which is why a conversion step (D8) exists.</p>`,
      code: `// x * 2 + 1 as JVM stack bytecode
iload_0     // stack: [x]
iconst_2    // stack: [x, 2]
imul        // stack: [x*2]
iconst_1    // stack: [x*2, 1]
iadd        // stack: [x*2+1]
ireturn`,
    },
    mistakes: [
      { title: 'A data class for an object with identity', bad: 'data class Player(val id: Long) {\n    var score = 0      // not in the constructor\n}\n// two players with the same id are "equal"\n// even with different scores', good: 'class Player(val id: Long) {\n    var score = 0\n}\n// or keep the data class for values only:\ndata class Score(val playerId: Long, val points: Int)', why: 'Generated <code>equals</code> and <code>hashCode</code> use only constructor properties. Decompiling shows exactly which fields they compare, so a body property like <code>score</code> is ignored.' },
      { title: 'Assuming a lambda is free in a hot path', bad: 'val onFrame: (Long) -> Unit = { t -> draw(t) }\n// called every frame via Function1.invoke(Object)\n// the Long is boxed on every call', good: 'fun interface FrameCallback { fun onFrame(t: Long) }\nval onFrame = FrameCallback { t -> draw(t) }\n// invoke takes a primitive long', why: 'A generic function type like <code>(Long) -> Unit</code> compiles to <code>Function1&lt;Long, Unit&gt;</code>, whose <code>invoke</code> takes an <code>Object</code>. The bytecode shows a <code>Long.valueOf</code> on each call. A <code>fun interface</code> with a primitive parameter avoids it.' },
    ],
    terms: [
      { term: 'kotlinc', def: 'The Kotlin command-line compiler. For the JVM it writes .class files (or a .jar).' },
      { term: 'K2', def: 'The rewritten Kotlin compiler front end, enabled by default since Kotlin 2.0.0.' },
      { term: 'JVM bytecode', def: 'The stack-based instruction format stored in .class files.' },
      { term: 'Decompile', def: 'Turn compiled bytecode back into readable source, usually Java, to see what the compiler generated.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fill in what Java sees for this Kotlin class.', code: '// class Account(val iban: String, var isActive: Boolean)\naccount.[[getIban]]()\naccount.[[isActive]]()\naccount.[[setActive]](false)', why: 'A property gets a <code>get</code> prefix. A property that starts with <code>is</code> keeps its name for the getter, and its setter replaces <code>is</code> with <code>set</code>.' },
      { type: 'bug', prompt: 'Java code calls a Kotlin top-level function from <code>News.kt</code> in package <code>com.example</code>. One line is wrong. Tap it.', code: '// Kotlin, file News.kt\npackage com.example\nfun headline(id: Long): String = "..."\n\n// Java\nString h = com.example.News.headline(42L);', bug: 5, fix: 'String h = com.example.NewsKt.headline(42L);', why: 'Top-level functions compile into a class named after the file plus <code>Kt</code>, so <code>News.kt</code> becomes <code>NewsKt</code>. Use <code>@file:JvmName("News")</code> if you want the shorter name.' },
    ],
    quiz: [
      { q: '<code>class Box(val size: Int)</code>. What does the class file contain for <code>size</code>?', options: ['A public field only', 'A private final field and a public getSize() method', 'A getter and a setter', 'Nothing; Kotlin properties exist only at compile time'], a: 1, why: '<code>val</code> means read-only: one private final backing field plus a getter. A <code>var</code> would add <code>setSize</code>.' },
      { q: 'Which members does <code>data class Point(val x: Int, val y: Int)</code> generate that a plain class does not?', options: ['equals, hashCode, toString, componentN and copy', 'Only toString', 'A no-argument constructor and setters'], a: 0, why: 'The data modifier generates equals, hashCode and toString from the constructor properties, plus component1/component2 for destructuring and copy.' },
      { q: 'You decompile a hot function and see <code>Integer.valueOf</code> inside a loop. What does that mean?', options: ['The code is reading a String', 'An Int is being boxed into an Integer object each time, which allocates for most values', 'The loop was inlined'], a: 1, why: 'Generic types like <code>List&lt;Int&gt;</code> or <code>Function1&lt;Int, …&gt;</code> work with objects, so primitives get boxed. In a hot loop that means many short-lived allocations.' },
      { q: 'With Kotlin 2.0 defaults, how is a plain lambda like <code>{ x: Int -> x * 2 }</code> compiled for the JVM?', options: ['As a separate anonymous class file per lambda', 'With invokedynamic, its body in a private static method', 'Its body is always copied into the call site'], a: 1, why: 'Kotlin 2.0 made invokedynamic the default for lambdas, which shrinks the output compared to one class per lambda. Copying into the call site happens only for lambdas passed to inline functions.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  const DEX_CLASSES = [
    { n: 'MainActivity', ms: ['onCreate', 'showHeadline'], entry: true },
    { n: 'Headlines', ms: ['format', 'formatOld', 'shareText'] },
    { n: 'LegacyParser', ms: ['parseXml', 'parseRss'] },
    { n: 'TextUtils (library)', ms: ['capitalize', 'reverse', 'pad', 'wrap'], lib: true },
  ];
  // which methods are reachable from the entry point MainActivity.onCreate
  const USED = new Set(['MainActivity.onCreate', 'MainActivity.showHeadline', 'Headlines.format', 'TextUtils (library).capitalize']);
  const SHORT = { 'MainActivity': 'MainActivity', 'Headlines': 'a', 'TextUtils (library)': 'b' };
  lessons.push({
    id: 'dex',
    title: 'From bytecode to DEX: D8 and R8',
    tagline: 'D8 turns class files into DEX; R8 also shrinks, optimizes and renames for release.',
    level: 'intermediate',
    body: `
<p>Android does not run <code>.class</code> files. It runs DEX (Dalvik Executable) bytecode, a register-based format packed into <code>classes.dex</code> files inside the APK. The build converts your classes and every library’s classes to DEX.</p>
<p><b>D8</b> is the dexer. It converts Java bytecode to DEX and <em>desugars</em> newer Java language features into code that older Android versions can run. Debug builds use D8.</p>
<p><b>R8</b> does the same conversion for release builds and optimizes on the way. It starts from your entry points (activities, services and other components in the manifest), keeps only the code they can reach, inlines and merges where it can, and shortens names. You turn it on with <code>isMinifyEnabled = true</code>. Step through a release build; <a href="#perf.r8">R8 and app size</a> covers keep rules in depth.</p>`,
    code: `// app/build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true        // R8: shrink, optimize, obfuscate code
            isShrinkResources = true      // also drop unused resources
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"      // your keep rules
            )
        }
    }
}`,
    remember: 'D8 converts. R8 converts and removes, inlines and renames, starting from your entry points.',
    predict: {
      q: "<code>LegacyParser</code> is in the app, but nothing reachable from <code>MainActivity</code> calls it. What happens to it in a debug build (D8) and a release build (R8)?",
      options: ["Both keep it", "D8 keeps it; R8 removes it", "Both remove it"],
      a: 1,
      why: "D8 only converts. R8 starts from the entry points and keeps only what they can reach.",
    },
    visual(el) {
      const box = h('div', { class: 'rt-classes' });
      const st = stats(['classes', 'methods', 'tool']);
      player(el, {
        view: [label('your app + one library'), box, st], speed: 1300,
        build: () => [
          { phase: 'class', tool: 'kotlinc', msg: 'After kotlinc: 4 classes as <code>.class</code> files, JVM stack bytecode. Only <code>MainActivity</code> is declared in the manifest.' },
          { phase: 'dex', tool: 'D8', msg: '<b>D8 (debug build):</b> everything converted to DEX register bytecode, nothing removed. Debug builds stop here so they build fast and debug cleanly.' },
          { phase: 'mark', tool: 'R8', msg: '<b>R8, shrink:</b> start at the entry point <code>MainActivity.onCreate</code> and follow every call. Green methods are reachable.' },
          { phase: 'shrink', tool: 'R8', msg: 'Unreachable code is removed, including unused library methods. <code>LegacyParser</code> is never called, so the whole class goes.' },
          { phase: 'opt', tool: 'R8', msg: '<b>R8, optimize:</b> <code>Headlines.format</code> is small and has one caller, so its body is inlined into <code>showHeadline</code>. Nothing is left in <code>Headlines</code>.' },
          { phase: 'obf', tool: 'R8', msg: '<b>R8, obfuscate:</b> remaining names are shortened. <code>MainActivity</code> keeps its name because the manifest refers to it. A mapping file records the renames.' },
        ],
        paint(f) {
          const P = ['class', 'dex', 'mark', 'shrink', 'opt', 'obf'].indexOf(f.phase);
          let nc = 0, nm = 0;
          box.replaceChildren(...DEX_CLASSES.map(c => {
            const usedMs = c.ms.filter(m => USED.has(`${c.n}.${m}`) && !(P >= 4 && c.n === 'Headlines'));
            const classGone = (P >= 3 && !c.ms.some(m => USED.has(`${c.n}.${m}`))) || (P >= 4 && c.n === 'Headlines');
            if (!classGone) nc++;
            const title = P >= 5 && !classGone ? SHORT[c.n] : c.n;
            const rows = c.ms.map(m => {
              const k = `${c.n}.${m}`, used = USED.has(k);
              let cls = 'rt-m', text = m + '()';
              if (P === 2 && used) cls += ' rt-new';
              if (P >= 3 && !used) cls += ' rt-gone';
              if (P >= 4 && k === 'Headlines.format') { cls += ' rt-gone'; text += ' → inlined'; }
              if (P >= 4 && k === 'MainActivity.showHeadline') { cls += ' rt-new'; text += ' + format body'; }
              if (P >= 5 && used && !cls.includes('gone') && c.n !== 'MainActivity') text = 'a()';
              if (P >= 5 && k === 'MainActivity.showHeadline') text = 'a()';
              if (!cls.includes('gone')) nm++;
              return h('span', { class: cls }, text);
            });
            return h('div', { class: `rt-class ${c.lib ? 'rt-lib' : ''} ${classGone ? 'rt-gone' : ''}` }, h('h5', {}, title + (P === 0 ? '.class' : '')), rows);
          }));
          st.set('classes', nc); st.set('methods', nm); st.set('tool', f.tool);
        },
      });
    },
    deeper: [
      {
        title: 'The 64K reference limit and multidex',
        body: `<p>One DEX file can reference at most 65,536 methods, counting your code, libraries and the framework methods you call. Bigger apps need several files: <code>classes.dex</code>, <code>classes2.dex</code> and so on. ART, the runtime on Android 5.0 (API 21) and higher, loads multiple DEX files natively, so with <code>minSdk</code> 21 or higher multidex is on by default and needs no library.</p>
<p>Add libraries below and watch the first file fill. R8 helps here too: removing unused methods often keeps a debug-sized app inside fewer files.</p>`,
        visual(el) {
          const LIMIT = 65536;
          let refs = 18000;
          const files = h('div', { class: 'rt-bars' });
          const msg = out('');
          function paint(text) {
            const n = Math.ceil(refs / LIMIT);
            files.replaceChildren(...Array.from({ length: n }, (_, k) => {
              const inFile = Math.min(LIMIT, refs - k * LIMIT);
              const fill = h('div', { class: `rt-fill ${inFile >= LIMIT ? 'rt-full' : ''}` });
              requestAnimationFrame(() => { fill.style.width = `${(inFile / LIMIT) * 100}%`; });
              return h('div', { class: 'rt-dexfile' }, h('span', { class: 'rt-stat' }, k ? `classes${k + 1}.dex ` : 'classes.dex ', h('b', {}, `${inFile.toLocaleString('en-US')} / 65,536`)), h('div', { class: 'rt-meter' }, fill));
            }));
            say(msg, text);
          }
          const add = (name, n) => act(`+ ${name}`, () => { refs += n; paint(`Added ${name}: about ${n.toLocaleString('en-US')} method references (illustrative). Total ${refs.toLocaleString('en-US')} across ${Math.ceil(refs / LIMIT)} DEX file(s).`); });
          el.append(h('div', { class: 'controls' }, add('networking', 9000), add('image loading', 7000), add('analytics SDK', 22000), add('maps', 30000),
            act('R8 shrink', () => { refs = Math.max(12000, Math.round(refs * 0.55)); paint(`R8 removed unreachable methods: about ${refs.toLocaleString('en-US')} references left (illustrative). Fewer methods also means less to load and verify.`); })),
          h('div', { class: 'rt-stage' }, files), msg);
          paint('A small app: 18,000 references, one DEX file.');
        },
      },
      {
        title: 'Keep rules for reflection',
        body: `<p>R8 can only follow calls it can see in code. Anything found by name at runtime (reflection, JSON libraries that read field names, classes named in XML) looks unused and may be removed or renamed. Keep rules tell R8 to leave it alone. Many libraries ship their own rules inside the AAR, so you add rules mainly for your own reflective code.</p>`,
        code: `# proguard-rules.pro
# A model parsed by reflection: keep its field names as they are
-keepclassmembers class com.example.news.data.ArticleDto {
    <fields>;
}

# Better: use a library that generates code at build time
# (kotlinx.serialization, Moshi codegen) so no rule is needed`,
      },
      {
        title: 'Read obfuscated crashes',
        body: `<p>After renaming, a release stack trace says <code>at a.b.a(SourceFile:12)</code>. R8 writes a mapping file, <code>build/outputs/mapping/release/mapping.txt</code>, from each new name back to the original. Keep it for every release you ship and upload it to Play Console (or your crash reporter) so traces come back readable.</p>`,
        code: `# mapping.txt (excerpt)
com.example.news.Headlines -> a:
    java.lang.String shareText(java.lang.String) -> a
com.example.news.LegacyParser -> b:`,
      },
    ],
    mistakes: [
      { title: 'Testing only debug builds', bad: '// Ship release with R8 on,\n// but every test ran on debug (D8 only)\n./gradlew connectedDebugAndroidTest', good: '// Run the release build (or a minified test build type)\n// before shipping\n./gradlew assembleRelease\n// install it and walk the main flows', why: 'R8 changes the code: it removes, inlines and renames. A missing keep rule shows up only in a minified build, often as <code>ClassNotFoundException</code> or a JSON field that is suddenly null.' },
      { title: 'Turning off optimization to "fix" a crash', bad: '# proguard-rules.pro\n-dontobfuscate\n-dontoptimize\n-dontshrink', good: '# keep only what is accessed reflectively\n-keep class com.example.news.plugins.** { <init>(); }', why: 'Disabling R8 hides one missing rule and gives up all the size and speed gains. Find the class or member that is loaded by name and keep just that.' },
    ],
    terms: [
      { term: 'DEX', def: 'Dalvik Executable: the register-based bytecode format Android runs, stored as classes.dex files in the APK.' },
      { term: 'D8', def: 'The dexer that converts Java bytecode to DEX and desugars newer Java language features.' },
      { term: 'R8', def: 'The release optimizer: converts to DEX while shrinking, optimizing and obfuscating code, starting from the entry points.' },
      { term: 'Desugaring', def: 'Rewriting newer language features into older bytecode that every supported Android version can run.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Turn on code and resource shrinking for release.', code: 'release {\n    is[[MinifyEnabled]] = true\n    is[[ShrinkResources]] = true\n    proguardFiles(getDefaultProguardFile("proguard-android-[[optimize]].txt"), "proguard-rules.pro")\n}', why: '<code>isMinifyEnabled</code> runs R8 on code, <code>isShrinkResources</code> removes unused resources, and <code>proguard-android-optimize.txt</code> is the default rule file that leaves optimization on.' },
      { type: 'bug', prompt: 'The release build parses JSON with a reflection-based library and every field comes back null. Tap the line that explains why.', code: 'class ArticleDto {\n    var title: String? = null   // read by name at runtime\n}\n// build.gradle.kts\nisMinifyEnabled = true\n// proguard-rules.pro is empty', bug: 5, fix: '-keepclassmembers class com.example.news.ArticleDto { <fields>; }', why: 'R8 renamed <code>title</code> to something like <code>a</code>, so the library looks for a JSON key that does not match. A keep rule for the fields (or a codegen-based serializer) fixes it.' },
    ],
    quiz: [
      { q: 'Put the release build steps in order.', options: ['R8 → kotlinc → APK', 'kotlinc → .class files → R8 (shrink, optimize, rename, dex) → classes.dex in the APK', 'kotlinc → DEX → .class → R8'], a: 1, why: 'kotlinc writes JVM bytecode. R8 reads it together with library bytecode and writes optimized DEX, which is packaged into the APK or bundle.' },
      { q: 'How does R8 decide which code to keep?', options: ['It keeps what is listed in build.gradle', 'It starts from entry points such as manifest components and keep rules, and keeps everything reachable from them', 'It keeps the most recently edited files'], a: 1, why: 'This is tree shaking: build a graph of references from the roots and drop what is not in it.' },
      { q: 'Your app has <code>minSdk = 24</code> and passes 65,536 method references. What do you need to do?', options: ['Add the androidx.multidex library', 'Nothing special; the build writes classes2.dex and ART loads it natively', 'Remove libraries until it fits'], a: 1, why: 'With minSdk 21 or higher, multidex is enabled by default. The legacy library is only for minSdk 20 and lower.' },
      { q: 'A crash report from release says <code>at a.c.b(SourceFile:3)</code>. What turns it back into real names?', options: ['The mapping file R8 wrote for that exact build', 'Rebuilding the app in debug', 'The Kotlin compiler'], a: 0, why: 'mapping.txt records each rename. It differs from build to build, so keep it for every version you ship.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  // Illustrative per-call cost of one method, in microseconds.
  const CALLS = 40, HOT = 10, JIT_DONE = 14;
  const cost = (mode, c) => mode === 'int' ? 100 : mode === 'aot' ? 14 : c < JIT_DONE ? 100 : 12;
  lessons.push({
    id: 'art',
    title: 'ART: interpreter, JIT and AOT',
    tagline: 'Android runs each method interpreted, JIT-compiled or AOT-compiled, and profiles decide which.',
    level: 'advanced',
    body: `
<p>ART, the Android Runtime, runs your DEX code. It can run a method three ways. The <em>interpreter</em> executes DEX instructions one by one: no setup, slow per call. The <em>JIT</em> compiler watches which methods are hot and compiles them to machine code in memory while the app runs. <em>AOT</em> compilation, done by the on-device <code>dex2oat</code> tool, writes machine code to disk before the app runs.</p>
<p>ART does not AOT-compile everything, because that costs install time and storage for code that rarely runs. Instead it uses <em>profiles</em>: lists of the classes and methods that matter. While the app runs, ART records a profile. When the device is idle and charging, a background job recompiles the app with the <code>speed-profile</code> filter, so only the profiled methods become machine code.</p>
<p>The catch: a fresh install has no local profile yet, so the first launches run interpreted and JIT code. Watch one method warm up in the demo.</p>`,
    code: `# Check how an installed app is compiled (filter per DEX file)
adb shell dumpsys package dexopt | grep -A 3 com.example.news

# Force profile-guided AOT compilation now, as the idle job would
adb shell cmd package compile -m speed-profile -f com.example.news

# Reset to the just-installed state to measure a first launch
adb shell cmd package compile --reset com.example.news`,
    remember: 'Interpreted first, JIT when hot, AOT for what the profile lists. A Baseline Profile gives the profile on day one.',
    predict: {
      q: "In the JIT run, the method counts as hot at call 10. When do calls get fast?",
      options: ["At call 10 exactly", "A few calls later, once the background compile is done", "Only after the app restarts"],
      a: 1,
      why: "The JIT compiles in the background. Until the machine code is ready, calls keep running in the interpreter.",
    },
    visual(el) {
      const W = 320, H = 170, L = 34, B = 24, T = 10;
      const x = c => L + (c / (CALLS - 1)) * (W - L - 8);
      const y = v => T + (1 - v / 110) * (H - T - B);
      const svgWrap = h('div', { class: 'rt-svgwrap' });
      const st = stats(['call', 'this call', 'total so far']);
      const msg = out('');
      let tok = 0;
      const ticks = [0, 50, 100].map(v => `<text class="rt-tick" x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`).join('');
      const xt = [1, 10, 20, 30, 40].map(c => `<text class="rt-tick" x="${x(c - 1)}" y="${H - 8}" text-anchor="middle">${c}</text>`).join('');
      function frame(mode, upto) {
        const lines = ['int', 'jit', 'aot'].filter(m => m === mode || mode === 'all').map(m => {
          const n = mode === 'all' ? CALLS : upto;
          const pts = Array.from({ length: n }, (_, c) => `${x(c).toFixed(1)},${y(cost(m, c)).toFixed(1)}`).join(' ');
          return n ? `<polyline class="rt-line rt-l-${m}" points="${pts}"/>` : '';
        }).join('');
        const mark = (mode === 'jit' || mode === 'all') && (mode === 'all' || upto > HOT)
          ? `<line class="rt-markline" x1="${x(HOT)}" y1="${T}" x2="${x(HOT)}" y2="${H - B}"/><text class="rt-mark" x="${x(HOT) + 4}" y="${T + 10}">hot: JIT starts</text>` : '';
        svgWrap.innerHTML = `<svg class="rt-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="time per call by call number"><line class="rt-axis" x1="${L}" y1="${H - B}" x2="${W}" y2="${H - B}"/><line class="rt-axis" x1="${L}" y1="${T}" x2="${L}" y2="${H - B}"/>${ticks}${xt}${mark}${lines}</svg>`;
      }
      const MSG = {
        int: 'Interpreter only: every call costs the same, about 100 µs here. No warm-up, no speed-up.',
        jit: 'JIT: interpreted at first. After enough calls the method counts as hot and is compiled in the background; calls keep running interpreted until the code is ready, then drop to about 12 µs. The JIT code lives in memory and is gone when the process dies.',
        aot: 'AOT from a profile: the method was compiled before the app started, so it is fast from call 1. This is what a Baseline Profile buys for the code paths it lists.',
      };
      async function run(mode) {
        const t = ++tok;
        let total = 0;
        say(msg, MSG[mode]);
        for (let c = 1; c <= CALLS; c++) {
          total += cost(mode, c - 1);
          frame(mode, c);
          st.set('call', c); st.set('this call', `${cost(mode, c - 1)} µs`); st.set('total so far', `${(total / 1000).toFixed(2)} ms`);
          await sleep(c <= JIT_DONE + 2 ? 110 : 45);
          if (t !== tok || !el.isConnected) return;
        }
      }
      const btns = [
        act('Interpreter only', () => { press(btns, btns[0]); run('int'); }),
        act('Interpreter + JIT', () => { press(btns, btns[1]); run('jit'); }),
        act('AOT (profiled)', () => { press(btns, btns[2]); run('aot'); }),
        act('Compare all', () => { tok++; press(btns, btns[3]); frame('all'); st.set('call', 40); st.set('this call', '-'); st.set('total so far', '-'); say(msg, `Over 40 calls: interpreter ${(CALLS * 100 / 1000).toFixed(1)} ms, JIT ${(Array.from({ length: CALLS }, (_, c) => cost('jit', c)).reduce((a, b) => a + b) / 1000).toFixed(2)} ms, AOT ${(CALLS * 14 / 1000).toFixed(2)} ms. The JIT gap is the warm-up users feel on a fresh install.`); }),
      ];
      el.append(h('div', { class: 'controls' }, btns),
        h('div', { class: 'rt-stage' }, svgWrap,
          h('div', { class: 'rt-key' }, h('span', {}, h('i', { class: 'rt-k-int' }), 'interpreter'), h('span', {}, h('i', { class: 'rt-k-jit' }), 'JIT'), h('span', {}, h('i', { class: 'rt-k-aot' }), 'AOT')),
          h('span', { class: 'rt-note' }, 'y: µs per call · x: call number · illustrative numbers'), st), msg);
      frame('int', 0);
      say(msg, 'Pick a mode. Each run calls the same method 40 times.');
    },
    deeper: [
      {
        title: 'Compiler filters',
        body: `<p>ART compiles each app with a <em>compiler filter</em>. <code>verify</code> only checks the DEX code, with no AOT compilation. <code>speed-profile</code> AOT-compiles the methods listed in the profile and optimizes loading of the profiled classes. <code>speed</code> AOT-compiles everything. Most apps end up on <code>speed-profile</code>: fast where it matters, small on disk.</p>`,
        code: `$ adb shell dumpsys package dexopt
  [com.example.news]
    path: /data/app/.../base.apk
      arm64: [status=speed-profile] [reason=bg-dexopt]
      // after a fresh install without a profile you would see status=verify`,
      },
      {
        title: 'The life of an install',
        body: `<p>Install from Play: if a cloud profile exists, ART AOT-compiles the methods in it right away. Cloud profiles are built by Play from real users’ sessions, but they take hours to days to arrive after an update and need Android 9 (API 28) or higher.</p>
<p>First runs: code that was not compiled is interpreted, and hot methods get JIT-compiled. ART records a local profile and merges it with any cloud profile. Later, while idle and charging, a daemon recompiles with the merged profile, and later launches use more AOT code.</p>`,
      },
      {
        title: 'Baseline Profiles: with and without',
        body: `<p>A Baseline Profile is a profile you ship inside the app, at <code>assets/dexopt/baseline.prof</code>. During installation ART AOT-compiles the methods it lists, so every user gets fast startup and scrolling from the first launch, not after the first idle-and-charging night. The Android docs report about 30% faster code execution from the first launch for included code paths. Compare five launches after an update. Numbers are illustrative.</p>`,
        visual(el) {
          const DATA = {
            off: [980, 960, 950, 690, 680],
            on: [690, 685, 680, 675, 670],
          };
          const LAB = ['launch 1', 'launch 2', 'launch 3', 'after idle', 'launch 5'];
          const rows = LAB.map(n => { const bar = h('div', { class: 'rt-bar' }); const num = h('span', { class: 'rt-num' }, ''); return { bar, num, el: h('div', { class: 'rt-barrow' }, h('span', {}, n), h('div', {}, bar), num) }; });
          const msg = out('');
          function show(k) {
            DATA[k].forEach((v, i) => {
              rows[i].bar.style.width = `${(v / 1000) * 100}%`;
              rows[i].bar.className = `rt-bar ${v > 900 ? 'rt-b-slow' : 'rt-b-fast'}`;
              rows[i].num.textContent = `${v} ms`;
            });
            say(msg, k === 'off'
              ? 'No profile in the app: the first launches after install or update are interpreted and JIT-compiled. Only after the idle-and-charging dexopt does startup drop. Many users open the app before that happens.'
              : 'Baseline Profile shipped in the APK: ART compiles the startup path at install time, so launch 1 is already fast. The later small gains come from the local profile adding more methods.');
          }
          el.append(picker('profile', [{ label: 'No profile', v: 'off' }, { label: 'Baseline Profile', v: 'on' }], it => show(it.v)),
            h('div', { class: 'rt-stage' }, h('div', { class: 'rt-bars' }, rows.map(r => r.el)), h('span', { class: 'rt-note' }, 'cold start time per launch · illustrative')), msg);
          show('off');
        },
      },
      {
        title: 'Generate one',
        body: `<p>You don’t write the profile by hand. A Macrobenchmark test drives the app through its critical journeys, and the Baseline Profile Gradle plugin turns the recorded methods into rules. Startup Profiles, a subset, also tell R8 to put startup code first in the primary DEX file. See <a href="#perf.startup">startup performance</a> for measuring the result.</p>`,
        code: `@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule
    val rule = BaselineProfileRule()

    @Test
    fun generate() = rule.collect(packageName = "com.example.news") {
        pressHome()
        startActivityAndWait()             // the cold start path
        device.findObject(By.res("feed")).fling(Direction.DOWN)   // a key journey
    }
}

// Output rules look like:
// HSPLcom/example/news/MainActivity;->onCreate(Landroid/os/Bundle;)V
// flags H = hot, S = startup, P = post-startup; the L starts the DEX class descriptor`,
      },
    ],
    underHood: {
      body: `<p>When ART loads a DEX file it looks for a matching <code>.oat</code>/<code>.odex</code> file with compiled code. If a method has compiled code, ART calls it directly. Otherwise the method runs in the interpreter, which also counts calls and loop iterations. Crossing a threshold queues the method for the JIT. JIT profiling data is kept in the code cache and written to a profile file that only the app can access; <code>dex2oat</code> reads that file later to drive AOT compilation.</p>`,
    },
    mistakes: [
      { title: 'Measuring startup only on your own phone', bad: '// Installed from Android Studio days ago,\n// opened 50 times, dexopt already ran\n// "Startup is 400 ms, we are fine"', good: '// Measure a real first launch\nadb shell cmd package compile --reset com.example.news\n// or use Macrobenchmark with\n// CompilationMode.None / Partial(BaselineProfileMode.Require)', why: 'Your device has a rich local profile and AOT code. A user who just installed or updated has neither. Reset compilation or use Macrobenchmark compilation modes to see what they see.' },
    ],
    terms: [
      { term: 'ART', def: 'The Android Runtime, which runs DEX bytecode with an interpreter, a JIT compiler and AOT-compiled code.' },
      { term: 'JIT compilation', def: 'Compiling hot methods to machine code in memory while the app runs.' },
      { term: 'dex2oat', def: 'The on-device tool that AOT-compiles DEX code to machine code, guided by profiles.' },
      { term: 'Baseline Profile', def: 'A list of classes and methods shipped in the app so ART AOT-compiles them at install time.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Force the same compilation the idle job would do.', code: 'adb shell cmd package compile -m [[speed-profile]] -f com.example.news', why: '<code>speed-profile</code> AOT-compiles only the methods in the profile. <code>speed</code> would compile everything, which is not what users get.' },
      { type: 'bug', prompt: 'A developer explains why the first launch after an update is slow. One line is wrong. Tap it.', code: '1. The update replaces the DEX files.\n2. Old AOT code no longer matches, so methods start interpreted.\n3. Hot methods get JIT-compiled while the app runs.\n4. The JIT writes its machine code to disk for next time.\n5. Idle and charging, dex2oat recompiles from the profile.', bug: 3, fix: '4. The JIT records a profile; its machine code stays in memory only.', why: 'JIT code lives in the code cache of the running process. What survives is the <em>profile</em>, which dex2oat uses later for AOT compilation.' },
    ],
    quiz: [
      { q: 'A fresh install has no cloud profile and no Baseline Profile. How do its first launches run?', options: ['Fully AOT-compiled at install', 'Interpreted, with hot methods JIT-compiled while running', 'The app can’t start until dex2oat finishes'], a: 1, why: 'Without a profile there is nothing to guide install-time AOT compilation, so ART starts from the interpreter and the JIT.' },
      { q: 'Why doesn’t ART just AOT-compile every method of every app?', options: ['It is not allowed on Android', 'Compiling everything costs install time and storage for code that rarely runs; profiles target what matters', 'AOT code is slower than interpreted code'], a: 1, why: '<code>speed-profile</code> is a trade-off: machine code for the hot and startup paths, verified DEX for the rest.' },
      { q: 'Put the profile-guided cycle in order.', options: ['dex2oat → JIT → profile → interpreter', 'Interpreter and JIT run the app → ART records a profile → idle and charging, dex2oat compiles from it → next launch uses AOT code', 'Profile → install → JIT → nothing else'], a: 1, why: 'Running the app produces the profile; the background job consumes it; the following launches benefit.' },
      { q: 'What does a Baseline Profile change compared with relying on cloud profiles?', options: ['It works from the first launch of every install, without waiting for Play to aggregate data', 'It makes the APK smaller', 'It turns off the JIT'], a: 0, why: 'Cloud profiles need real usage data and take hours to days after an update. A Baseline Profile ships in the APK and is applied at install.' },
      { q: 'A method runs 40 times. In which mode does the total time differ most between the first calls and the last calls?', options: ['Interpreter only', 'Interpreter + JIT', 'AOT'], a: 1, why: 'The interpreter and AOT are flat. With the JIT, early calls are interpreted and later ones run compiled code, so the cost drops partway through.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  const GC_NODES = [
    { id: 'R1', x: 50, y: 30, text: 'stack', root: true },
    { id: 'R2', x: 300, y: 30, text: 'static', root: true },
    { id: 'L', x: 50, y: 110, text: 'L', label: 'list' },
    { id: 'U', x: 130, y: 110, text: 'U', label: 'user' },
    { id: 'B', x: 130, y: 192, text: 'B', label: 'bitmap' },
    { id: 'C', x: 300, y: 110, text: 'C', label: 'config' },
    { id: 'T1', x: 215, y: 110, text: 'T1', label: 'temp' },
    { id: 'T2', x: 215, y: 192, text: 'T2', label: 'temp' },
    { id: 'X', x: 280, y: 192, text: 'X', label: 'cycle' },
    { id: 'Y', x: 338, y: 192, text: 'Y', label: 'cycle' },
  ];
  const GC_EDGES = [['R1', 'L'], ['L', 'U'], ['U', 'B'], ['R2', 'C'], ['C', 'U'], ['T1', 'T2'], ['T2', 'U'], ['X', 'Y', true]];
  lessons.push({
    id: 'gc',
    title: 'Memory: stack, heap and garbage collection',
    tagline: 'Objects live on the heap until nothing reachable points at them.',
    level: 'intermediate',
    body: `
<p>Each thread has a <em>stack</em>: one frame per running function, holding its local variables and parameters. A frame disappears the moment its function returns. Objects you create with a constructor live on the <em>heap</em>, shared by all threads, and they outlive the function that made them. A local variable holds only a reference to them.</p>
<p>Someone has to free heap objects. One approach is <em>reference counting</em>: each object counts who points at it and is freed at zero. Its weak spot is cycles: two objects pointing at each other never reach zero. ART instead uses a <em>tracing</em> garbage collector. It starts from the <em>GC roots</em> (thread stacks, static fields and a few others), marks everything it can reach, and frees the rest.</p>
<p>Step through one collection. Watch <code>T2</code>: it points at a live object, but nothing points at it. And watch the X–Y cycle that reference counting would leak.</p>`,
    code: `fun loadFeed(): List<Article> {
    val client = HttpClient()        // reference on the stack, object on the heap
    val items = client.fetch()       // heap
    val parsed = items.map(::Article) // heap
    return parsed                    // the caller now holds the reference
}   // frame gone: client and items are unreachable and can be collected

object Cache {                       // static: a GC root for as long as the process lives
    val articles = mutableListOf<Article>()
}`,
    remember: 'Reachable from a GC root means alive. Everything else is garbage, cycles included.',
    predict: {
      q: "<code>T2</code> points at the live object <code>U</code>, but nothing points at <code>T2</code>. Does <code>T2</code> survive the collection?",
      options: ["Yes: it references a live object", "No: no path from a root reaches it, so it is freed", "Only if <code>U</code> is freed too"],
      a: 1,
      why: "Marking follows references out of the roots. What an object points at does not matter, only whether something reachable points at it.",
    },
    visual(el) {
      const g = graphSvg(GC_NODES, GC_EDGES, { w: 360, ht: 228, name: 'heap objects and references from GC roots' });
      const st = stats(['marked', 'freed']);
      player(el, {
        view: [g.root, st], speed: 900,
        build() {
          const fr = [{ marked: [], seen: [], freed: [], phase: 'start', msg: 'The heap after some work. Boxes are GC roots. Which circles are still needed?' }];
          fr.push({ marked: [], seen: [], freed: [], phase: 'roots', msg: '<b>Mark:</b> start at the GC roots: here a thread stack and a static field.' });
          const order = [['L', 'R1'], ['C', 'R2'], ['U', 'L'], ['B', 'U']];
          const marked = [], seen = [];
          for (const [n, from] of order) {
            marked.push(n); seen.push([from, n]);
            fr.push({ marked: [...marked], seen: [...seen], freed: [], phase: 'mark', cur: n, msg: n === 'U' ? '<code>U</code> is reachable from <code>L</code> (and also from <code>C</code>). The collector marks it once and moves on.' : `Follow <code>${from}</code> → <code>${n}</code>: reachable, mark it.` });
          }
          fr.push({ marked: [...marked], seen: [...seen], freed: [], phase: 'garbage', msg: '<b>Mark done.</b> Red objects were never reached. <code>T2</code> points at <code>U</code>, but pointing out does not keep you alive; being pointed at from a root does.' });
          const freed = [];
          for (const n of ['T1', 'T2', 'X', 'Y']) {
            freed.push(n);
            fr.push({ marked: [...marked], seen: [...seen], freed: [...freed], phase: 'sweep', msg: n === 'X' ? '<b>Sweep:</b> <code>X</code> and <code>Y</code> point at each other, so each has a reference count of 1. Reference counting would keep them forever. Tracing frees them.' : `<b>Sweep:</b> free <code>${n}</code>. Its memory goes back to the heap.` });
          }
          fr[fr.length - 1].msg = 'Collection done: 4 live objects kept, 4 freed, including the cycle.';
          return fr;
        },
        paint(f) {
          for (const n of GC_NODES) {
            if (n.root) { g.node(n.id, f.phase === 'start' ? '' : 'rt-root'); continue; }
            const cls = f.freed.includes(n.id) ? 'rt-dim' : f.marked.includes(n.id) ? (f.cur === n.id ? 'rt-hot' : 'rt-on') : (f.phase === 'garbage' || f.phase === 'sweep') ? 'rt-bad' : '';
            g.node(n.id, cls);
          }
          for (const [a, b] of GC_EDGES) {
            const on = f.seen.some(([x, y]) => x === a && y === b);
            const dead = f.freed.includes(a);
            g.edge(a, b, on ? 'rt-on' : dead ? 'rt-dim' : '');
          }
          st.set('marked', f.marked.length); st.set('freed', f.freed.length);
        },
      });
    },
    deeper: [
      {
        title: 'Generations',
        body: `<p>Most objects die young: a temporary string, an iterator, a lambda capture. Android’s heap is <em>generational</em>: new objects go into a young generation, which is collected often and cheaply. Objects that survive long enough are promoted to an older generation, which is collected less often. Allocate some objects and run minor collections; survivors move right.</p>`,
        visual(el) {
          let id = 0, objs = [];
          const young = h('div', { class: 'rt-gen' }), old = h('div', { class: 'rt-gen' });
          const msg = out('');
          function paint() {
            young.replaceChildren(...objs.filter(o => o.gen === 'y').map(o => h('span', { class: `rt-pill ${o.keep ? 'rt-on' : ''}` }, `#${o.id}${o.age ? ` ·${o.age}` : ''}`)));
            old.replaceChildren(...objs.filter(o => o.gen === 'o').map(o => h('span', { class: 'rt-pill rt-done' }, `#${o.id}`)));
          }
          const alloc = act('Allocate 5', () => {
            for (let k = 0; k < 5; k++) { id++; objs.push({ id, gen: 'y', age: 0, keep: id % 4 === 0 }); }
            paint(); say(msg, 'Five new objects in the young generation. Highlighted ones are still referenced (say, added to a list); the rest were temporary.');
          });
          const minor = act('Minor GC', () => {
            const before = objs.filter(o => o.gen === 'y').length;
            objs = objs.filter(o => o.gen === 'o' || o.keep);
            let promoted = 0;
            objs.forEach(o => { if (o.gen === 'y') { o.age++; if (o.age >= 2) { o.gen = 'o'; promoted++; } } });
            const freed = before - objs.filter(o => o.gen === 'y').length - promoted;
            paint(); say(msg, `Minor GC looked only at the young generation: freed ${freed}, promoted ${promoted} that survived twice. The old generation was not scanned, which keeps this cheap.`);
          });
          el.append(h('div', { class: 'controls' }, alloc, minor),
            h('div', { class: 'rt-stage' }, h('div', { class: 'rt-gens' }, h('div', { class: 'rt-group' }, label('young'), young), h('div', { class: 'rt-group' }, label('old'), old))), msg);
          paint(); say(msg, 'Press Allocate, then Minor GC a few times.');
        },
      },
      {
        title: 'ART’s collector: concurrent copying',
        body: `<p>Since Android 8.0 the default collector is Concurrent Copying (CC). It does most of its work on a background thread while your app keeps running, and copies live objects together, which reduces fragmentation. It has one small pause whose length does not grow with the heap size. From Android 10 it is generational.</p>
<p>To move objects while your code is reading them, CC uses a <em>read barrier</em>: a small check on reference reads from the heap. The compiler and runtime add it; you write nothing.</p>`,
      },
      {
        title: 'GC and jank',
        body: `<p>Even a concurrent collector costs CPU, and each collection competes with your UI thread for time. A frame at 60 Hz has about 16 ms. If you allocate many objects in every frame, for example inside <code>onDraw</code> or a hot animation loop, the collector runs more often and frames can miss their deadline. Allocate once, reuse in the loop. See <a href="#perf.frame">frames and jank</a>.</p>`,
        code: `class Gauge(context: Context) : View(context) {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)   // once
    private val rect = RectF()                          // once

    override fun onDraw(canvas: Canvas) {
        // no Paint() or RectF() here: this runs every frame
        rect.set(0f, 0f, width.toFloat(), height.toFloat())
        canvas.drawArc(rect, 135f, 270f * progress, false, paint)
    }
}`,
      },
    ],
    underHood: {
      body: `<p>Every app has a hard heap limit that depends on the device’s RAM. Allocating past it throws <code>OutOfMemoryError</code>. <code>ActivityManager.getMemoryClass()</code> returns the limit in megabytes, which is useful for sizing caches. Memory your app has written stays resident in RAM; the only way to give it back is to drop references so the collector can free the objects.</p>`,
      code: `val am = getSystemService(ActivityManager::class.java)
val heapMb = am.memoryClass                    // heap limit in MB for this device
val cache = LruCache<String, Bitmap>(heapMb * 1024 * 1024 / 8)   // bytes, sizeOf() below
// override sizeOf to return bitmap.byteCount so the limit is in bytes`,
    },
    mistakes: [
      { title: 'Calling System.gc() to "free memory"', bad: 'override fun onTrimMemory(level: Int) {\n    System.gc()   // hope something gets freed\n}', good: 'override fun onTrimMemory(level: Int) {\n    super.onTrimMemory(level)\n    imageCache.evictAll()   // drop references you own\n}', why: 'The collector can only free unreachable objects. If you still reference them, a forced GC does nothing except cost time. Release your own references (caches, big buffers) instead.' },
      { title: 'Allocating in a per-frame callback', bad: 'override fun onDraw(canvas: Canvas) {\n    val p = Paint()            // new object every frame\n    canvas.drawText(label, 0f, 40f, p)\n}', good: 'private val p = Paint()\noverride fun onDraw(canvas: Canvas) {\n    canvas.drawText(label, 0f, 40f, p)\n}', why: 'At 60 or 120 frames per second, a few allocations per frame add up to thousands per second, and the collector has to keep cleaning them up.' },
    ],
    terms: [
      { term: 'Heap', def: 'The memory area shared by all threads where objects live until the garbage collector frees them.' },
      { term: 'GC root', def: 'A reference the collector treats as always alive, such as a local variable on a thread stack or a static field.' },
      { term: 'Tracing GC', def: 'A collector that marks every object reachable from the roots and frees the rest.' },
      { term: 'Generational GC', def: 'A collector that keeps new objects separate and collects them more often, because most objects die young.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Complete the description of a tracing collection.', code: '// 1. start from the GC [[roots]]\n// 2. [[mark]] every object reachable from them\n// 3. [[sweep]] (free) everything not marked', why: 'This is mark and sweep. Copying collectors like ART’s CC move the marked objects instead of sweeping in place, but reachability works the same way.' },
      { type: 'bug', prompt: 'This explanation of why an object is kept alive has one false line. Tap it.', code: '1. A local variable in a running function is a GC root.\n2. A static field is a GC root.\n3. An object that references a live object is also kept alive.\n4. Two objects that only reference each other can be collected.', bug: 2, fix: '3. An object is kept alive only if something reachable references it.', why: 'References point one way. Pointing <em>at</em> a live object does not help; only being reachable <em>from</em> a root does. That is why <code>T2</code> in the demo was freed.' },
    ],
    quiz: [
      { q: '<code>A</code> and <code>B</code> reference each other, and nothing else references either. What does ART’s tracing GC do?', options: ['Keeps both, because each has a reference', 'Frees both, because neither is reachable from a root', 'Frees one and keeps the other'], a: 1, why: 'Tracing only asks "reachable from a root?" Cycles that are cut off are garbage. Plain reference counting is what gets stuck on them.' },
      { q: 'A function returns. What happens to the objects its local variables pointed at?', options: ['They are freed immediately', 'They become collectable if nothing else references them; the GC frees them later', 'They move to the stack'], a: 1, why: 'The stack frame and its references vanish at once. The heap objects stay until a collection finds them unreachable, unless they were returned or stored somewhere.' },
      { q: 'Why is a generational heap a good bet?', options: ['Old objects are smaller', 'Most objects die young, so frequently collecting only the young area frees a lot for little work', 'It avoids GC roots'], a: 1, why: 'Scanning a small young area finds lots of garbage. Long-lived objects get promoted and are not rescanned every time.' },
      { q: 'Which code is most likely to make the GC run often during scrolling?', options: ['Creating a Paint once in a View’s constructor', 'Allocating new objects inside onDraw or onBindViewHolder for every item and frame', 'A static val holding a constant string'], a: 1, why: 'Per-frame or per-bind allocations create a steady stream of garbage at exactly the time the UI thread needs its time budget.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  lessons.push({
    id: 'references',
    title: 'Leaks and reference types',
    tagline: 'A leak is an object you are done with that a GC root can still reach.',
    level: 'intermediate',
    body: `
<p>A garbage-collected app can still leak memory. The collector frees only unreachable objects, so if something long-lived still references an object you are done with, that object stays. The classic Android case is an <code>Activity</code>. On rotation the system destroys the old activity and creates a new one. If a static field, a singleton or a long-running task still points at the old one, it stays in memory with its whole view tree and bitmaps.</p>
<p>Java and Kotlin also have weaker references. A <code>WeakReference</code> does not keep its object alive: once only weak references remain, the next collection can clear it. A <code>SoftReference</code> is cleared when memory runs low. Normal references are <em>strong</em>.</p>
<p>In the demo, each Activity registers with a long-lived event bus. Watch what the GC can and cannot free after each rotation. See <a href="#perf.leaks">memory leaks</a> for finding them in a real app.</p>`,
    code: `// Leaks: a static (companion) field outlives every Activity
class ArticleActivity : AppCompatActivity() {
    companion object {
        var current: ArticleActivity? = null      // GC root → old Activity
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        current = this
    }
}

// Fine: keep app-wide state in something that lives as long as the app
class ImageCache(private val app: Application)   // Application context, not an Activity`,
    remember: 'Never let something longer-lived hold a strong reference to something shorter-lived, especially an Activity, View or Context.',
    visual(el) {
      Lab.ui.graph(el, {
        height: 270,
        nodes: [
          { id: 'root', label: 'GC root<small>static field</small>', x: 17, y: 14, tone: 'muted' },
          { id: 'bus', label: 'NewsBus<small>object</small>', x: 50, y: 14 },
          { id: 'sys', label: 'GC root<small>system</small>', x: 83, y: 14, tone: 'muted' },
          { id: 'a1', label: 'Activity #1<small>+ its views</small>', x: 17, y: 82 },
          { id: 'a2', label: 'Activity #2', x: 50, y: 82, hidden: true },
          { id: 'a3', label: 'Activity #3', x: 83, y: 82, hidden: true },
        ],
        predict: {
          q: 'Each Activity calls <code>NewsBus.register(this)</code> and never unregisters. You rotate twice, then the GC runs. How many <code>MainActivity</code> objects are still in memory?',
          options: ['1: the one on screen', '3: the one on screen and both destroyed ones', '0: the GC frees them all'],
          a: 1,
          why: 'NewsBus is held by a static field, a GC root, and its listener list holds every Activity strongly. Reachable means alive.',
        },
        frames: [
          { add: [['root', 'bus'], ['sys', 'a1'], ['bus', 'a1', 'listener']], say: 'Activity #1 is on screen, held by the system. In <code>onCreate</code> it registers with <code>NewsBus</code>, an <code>object</code> that lives as long as the process.' },
          { show: ['a2'], remove: [['sys', 'a1']], add: [['sys', 'a2'], ['bus', 'a2', 'listener']], say: 'Rotate. The system destroys #1 and creates #2, which registers too. Nobody removed #1 from the list.' },
          { hl: ['root', 'bus', 'a1'], add: [['root', 'bus', '', 'err'], ['bus', 'a1', 'listener', 'err']], say: 'The GC runs. Root → NewsBus → #1 is a path, so #1 is reachable and stays, with its whole view tree and bitmaps. That is a leak.' },
          { show: ['a3'], remove: [['sys', 'a2']], add: [['sys', 'a3'], ['bus', 'a3', 'listener'], ['bus', 'a2', 'listener', 'err']], say: 'Rotate again: two destroyed Activities are held now. Every rotation adds one.' },
          { remove: [['bus', 'a1'], ['bus', 'a2']], add: [['root', 'bus']], gone: ['a1', 'a2'], say: 'The fix: <code>unregister(this)</code> in <code>onDestroy</code>. No path from a root reaches #1 or #2 any more, so the next GC frees them.' },
        ],
      });
    },
    deeper: [
      {
        title: 'Strong, soft and weak',
        body: `<p>A <em>strong</em> reference keeps its object alive. A <em>weak</em> reference lets the collector clear it at the next GC once no strong reference is left. A <em>soft</em> reference is cleared only when the runtime needs memory. Soft references make poor caches on Android: you can’t control when they clear. A size-limited <code>LruCache</code> is more predictable.</p>`,
        visual(el) {
          let refs;
          const box = h('div', { class: 'rt-heap' });
          const msg = out('');
          function reset() { refs = [{ k: 'strong', alive: true }, { k: 'soft', alive: true }, { k: 'weak', alive: true }]; paint(); say(msg, 'Three references to three objects. No other strong references exist.'); }
          function paint() { box.replaceChildren(...refs.map(r => h('div', { class: `rt-obj ${r.alive ? 'rt-live' : 'rt-freed'}` }, `${r.k} ref`, h('small', {}, r.alive ? '.get() → object' : '.get() → null')))); }
          el.append(h('div', { class: 'controls' },
            act('Normal GC', () => { refs.forEach(r => { if (r.k === 'weak') r.alive = false; }); paint(); say(msg, 'Normal GC: the weakly reachable object was cleared. Strong and soft survive.'); }),
            act('GC under memory pressure', () => { refs.forEach(r => { if (r.k !== 'strong') r.alive = false; }); paint(); say(msg, 'Memory is tight: soft references are cleared too, before the runtime would throw OutOfMemoryError. The strong one stays no matter what.'); }),
            act('Reset', reset)),
          h('div', { class: 'rt-stage' }, box), msg);
          reset();
        },
      },
      {
        title: 'Weak references in callbacks',
        body: `<p>When a long-lived object must call back into an Activity, a <code>WeakReference</code> avoids keeping it alive. Always check <code>get()</code> for null: the Activity may already be gone. Better still, scope the work to the lifecycle, so it stops when the screen does (<code>lifecycleScope</code>, <code>viewModelScope</code>, unregistering listeners in the matching callback).</p>`,
        code: `class Downloader(listener: Listener) {
    private val ref = WeakReference(listener)

    fun onDone(file: File) {
        ref.get()?.onDownloaded(file)   // null if the Activity was collected
    }
}`,
      },
      {
        title: 'Common leak paths',
        body: `<p>Most Android leaks come from a few shapes: a static or singleton field holding an Activity, View or Activity <code>Context</code>; a listener registered on a long-lived object and never unregistered; an inner class or lambda that captures the Activity and is handed to a long-lived thread or <code>GlobalScope</code>; a cache that grows forever. The Android Studio memory profiler can capture a heap dump and flags leaked <code>Activity</code> and <code>Fragment</code> instances.</p>`,
        code: `// Leak: the lambda captures this@MainActivity, the scope outlives it
GlobalScope.launch { delay(60_000); binding.title.text = "Ready" }

// Fixed: cancelled in onDestroy
lifecycleScope.launch { delay(60_000); binding.title.text = "Ready" }`,
      },
    ],
    mistakes: [
      { title: 'Activity context in a singleton', bad: 'object Analytics {\n    lateinit var context: Context\n}\n// in MainActivity.onCreate:\nAnalytics.context = this', good: 'object Analytics {\n    lateinit var context: Context\n}\n// in MainActivity.onCreate:\nAnalytics.context = applicationContext', why: 'A Kotlin <code>object</code> is held by a static field, a GC root for the whole process. The application context lives just as long, so holding it leaks nothing.' },
      { title: 'Registering without unregistering', bad: 'override fun onStart() {\n    super.onStart()\n    NewsBus.register(this)\n}', good: 'override fun onStart() { super.onStart(); NewsBus.register(this) }\noverride fun onStop() { NewsBus.unregister(this); super.onStop() }', why: 'The bus is long-lived and keeps a strong reference to every listener. Pair each register with an unregister in the matching lifecycle callback.' },
    ],
    terms: [
      { term: 'Memory leak', def: 'An object the app no longer needs that stays reachable from a GC root, so it is never freed.' },
      { term: 'WeakReference', def: 'A reference that does not keep its object alive; get() returns null after the object is collected.' },
      { term: 'SoftReference', def: 'A reference the collector clears only when memory is low.' },
      { term: 'Heap dump', def: 'A snapshot of every object on the heap and its references, used to find what keeps a leaked object alive.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Hold the listener without keeping it alive, and handle the case where it is gone.', code: 'private val ref = [[WeakReference]](listener)\n\nfun notifyDone() {\n    ref.[[get]]()?.onDone()\n}', why: '<code>WeakReference.get()</code> returns the object while it is alive and <code>null</code> after it is collected, so the safe call is required.' },
      { type: 'bug', prompt: 'After a few rotations the heap dump shows several destroyed <code>FeedActivity</code> instances. Tap the line responsible.', code: 'class FeedActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        ImageLoader.init(this)\n        setContent { Feed() }\n    }\n}', bug: 3, fix: '        ImageLoader.init(applicationContext)', why: '<code>ImageLoader</code> is a singleton, so it keeps whatever context it gets for the whole process. Passing the Activity pins every destroyed instance. The application context is safe.' },
    ],
    quiz: [
      { q: 'Why does a destroyed Activity referenced from a companion object never get collected?', options: ['Activities are never collected', 'Companion object fields are static, a GC root, so the Activity stays reachable', 'Companion objects copy the Activity'], a: 1, why: 'Reachability decides everything. A static field is a root for as long as the class is loaded, which is usually the life of the process.' },
      { q: 'Only weak references point at an object. What happens at the next GC?', options: ['Nothing; weak references still keep it', 'It can be cleared, and get() then returns null', 'It is promoted to the old generation'], a: 1, why: 'Weak references do not count for reachability. Once no strong path remains, the object can be cleared.' },
      { q: 'Which option is the safest for a cache of decoded images?', options: ['A HashMap of SoftReferences', 'An LruCache sized from the memory class', 'A static MutableList that is never cleared'], a: 1, why: 'An LruCache has a fixed budget and evicts predictably. Soft references clear at unpredictable times, and an unbounded list is a leak.' },
    ],
  });

  // 7 ─────────────────────────────────────────────
  const PHASES = [
    { n: 'Fork from Zygote', ms: 60, cls: 'rt-s0', fixed: true },
    { n: 'Bind app, load classes', ms: 140, cls: 'rt-s1', code: true },
    { n: 'ContentProviders (3 SDKs)', ms: 180, cls: 'rt-s2', code: true, opt: 'startup' },
    { n: 'Application.onCreate', ms: 420, cls: 'rt-s3', code: true, opt: 'lazy' },
    { n: 'Activity.onCreate + setContent', ms: 300, cls: 'rt-s4', code: true },
    { n: 'First frame', ms: 110, cls: 'rt-s5', code: true },
  ];
  lessons.push({
    id: 'startup',
    title: 'What happens at cold start',
    tagline: 'Process, classes, providers, Application, Activity, first frame: each one adds time.',
    level: 'intermediate',
    body: `
<p>A <em>cold start</em> begins with no process for your app. The system forks a new process from Zygote, a process that already has the framework loaded. Then your app’s classes start loading on first use, every <code>ContentProvider</code> in the merged manifest is created, <code>Application.onCreate</code> runs, the launcher activity is created and its UI is composed or inflated, and the first frame is drawn. After the fork, all of your part runs on the main thread, before the user sees anything but the starting window.</p>
<p>Everything from the previous lessons shows up here. Classes have to be loaded and verified. Methods run interpreted or JIT-compiled unless a profile got them compiled. Objects created during startup are allocated and collected.</p>
<p>The demo shows one cold start before and after two kinds of fixes. The numbers are illustrative; measure your own with Macrobenchmark or the <code>Displayed</code> line in Logcat. See <a href="#perf.startup">startup performance</a> for the measuring side.</p>`,
    code: `class NewsApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Every line here delays the first frame of every cold start.
        Crash.init(this)                       // needed early: keep
        // Ads.init(this)                      // heavy, not needed for the first screen
        // Search.index(this)                  // disk I/O on the main thread
    }
}

// Create heavy objects on first use instead
val ads by lazy { Ads.create(app) }`,
    remember: 'Cold start runs every provider, Application.onCreate and your first screen on the main thread. Do less there, later, or off the main thread.',
    visual(el) {
      const run = (lane, ms) => {
        const names = ['fork', 'classes', 'providers', 'App', 'Activity', 'frame'];
        const tones = ['muted', 'accent', 'warm', 'err', 'accent', 'ok'];
        let t = 0;
        return ms.map((d, k) => ({ lane, from: t, to: (t += d), label: names[k], tone: tones[k] }));
      };
      Lab.ui.timeline(el, {
        lanes: ['Shipped', 'Lazy init', '+ Profile'],
        span: 1250, unit: 'ms',
        predict: {
          q: 'In this cold start, which phase is the longest before any fixes?',
          options: ['Forking the process from Zygote', 'Creating the ContentProviders', '<code>Application.onCreate</code> with SDK set-up'],
          a: 2,
          why: 'Everything in <code>Application.onCreate</code> runs on the main thread before the first frame, on every cold start. Heavy SDK init there is the usual culprit.',
        },
        frames: [
          { now: 0, say: 'One cold start on the main thread, as shipped. The numbers are illustrative.' },
          { bars: run(0, [60, 140]), say: 'The system forks the process from Zygote. Then classes load on first use.' },
          { bars: run(0, [60, 140, 180]).slice(2), say: 'Every <code>ContentProvider</code> in the merged manifest is created next, before <code>Application.onCreate</code>. Three SDKs bring three.' },
          { bars: run(0, [60, 140, 180, 420]).slice(3), say: '<code>Application.onCreate</code> sets up ads and search. 420 ms of work nobody sees.' },
          { bars: run(0, [60, 140, 180, 420, 300, 110]).slice(4), marks: [{ at: 1210, label: '1210', tone: 'err' }], say: 'Then the Activity, its UI, and the first frame: 1210 ms in all.' },
          { bars: run(1, [60, 140, 50, 90, 300, 110]), marks: [{ at: 750, label: '750', tone: 'warm' }], say: 'App Startup runs the three initializers from one provider, and ads and search set up on first use. 750 ms.' },
          { bars: run(2, [60, 98, 35, 63, 210, 77]), marks: [{ at: 543, label: '543', tone: 'ok' }], say: 'A Baseline Profile gets the startup code AOT-compiled at install, so every phase that runs your code is faster. The fork is not.' },
        ],
      });
    },
    deeper: [
      {
        title: 'Cold, warm and hot',
        body: `<p>A <em>cold</em> start creates the process. A <em>warm</em> start finds the process alive but has to recreate the activity. A <em>hot</em> start only brings an existing activity to the front. Optimizing cold start improves the other two. Android vitals treats starts as excessive at 5 seconds or more for cold, 2 for warm and 1.5 for hot.</p>
<p>Time to initial display (TTID) is the first frame and is measured for you. Time to full display (TTFD) is when the content is really usable, and you report it with <code>reportFullyDrawn()</code>.</p>`,
        code: `// Logcat after a launch
// ActivityTaskManager: Displayed com.example.news/.MainActivity: +612ms

@Composable
fun FeedScreen(items: List<Article>) {
    ReportDrawnWhen { items.isNotEmpty() }   // TTFD once real content shows
    LazyColumn { items(items) { ArticleRow(it) } }
}`,
      },
      {
        title: 'Class loading and static init',
        body: `<p>ART loads a class the first time code uses it, and runs its static initializer then: a Kotlin <code>object</code>’s <code>init</code> block and property initializers, a <code>companion object</code>’s properties, top-level properties of a file. If that first use happens during startup, so does the work. A heavy <code>object</code> touched from <code>Application.onCreate</code> runs its whole set-up on the main thread.</p>`,
        code: `object Dictionary {
    // runs on first access of Dictionary, on whatever thread touches it
    val words: Set<String> = loadAllWords()     // 40 ms of disk I/O
}

// Touch it later, off the main thread
lifecycleScope.launch(Dispatchers.IO) { Dictionary.words }`,
      },
      {
        title: 'ContentProviders run before onCreate',
        body: `<p>Libraries often initialize themselves with a <code>ContentProvider</code> in their manifest, because the system creates providers before <code>Application.onCreate</code>. Each one costs time to instantiate, and they run in no guaranteed order. The App Startup library replaces them with one shared provider and explicit <code>Initializer</code> classes with declared dependencies.</p>`,
        code: `class AnalyticsInitializer : Initializer<Analytics> {
    override fun create(context: Context): Analytics =
        Analytics.init(context.applicationContext)

    override fun dependencies(): List<Class<out Initializer<*>>> =
        listOf(WorkManagerInitializer::class.java)   // runs first
}`,
      },
    ],
    mistakes: [
      { title: 'Disk or network work in Application.onCreate', bad: 'override fun onCreate() {\n    super.onCreate()\n    val cfg = File(filesDir, "config.json").readText()  // main thread I/O\n    Config.load(cfg)\n}', good: 'override fun onCreate() {\n    super.onCreate()\n    appScope.launch(Dispatchers.IO) {\n        Config.load(File(filesDir, "config.json").readText())\n    }\n}', why: 'Application.onCreate blocks the first frame on every cold start. Move I/O to a background dispatcher and show a placeholder until the data arrives.' },
      { title: 'Measuring warm starts and calling it startup', bad: '// Press Home, tap the icon again: 180 ms\n// "Our startup is fast"', good: '// Kill the process first, then launch\nadb shell am force-stop com.example.news\nadb shell am start -W -n com.example.news/.MainActivity', why: 'A process that is still alive skips the fork, class loading, providers and Application.onCreate. Users coming from a notification after a few hours usually get a cold start.' },
    ],
    terms: [
      { term: 'Cold start', def: 'A launch where the app process does not exist yet, so everything from process creation to first frame runs.' },
      { term: 'Zygote', def: 'A system process with the framework preloaded; every app process is forked from it.' },
      { term: 'TTID / TTFD', def: 'Time to initial display (first frame) and time to full display (content usable, reported by the app).' },
      { term: 'App Startup', def: 'An AndroidX library that runs component initializers from a single shared ContentProvider in dependency order.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Create the ads client on first use instead of in Application.onCreate.', code: 'class NewsApp : Application() {\n    val ads: AdsClient by [[lazy]] { AdsClient.create(this) }\n}', why: '<code>by lazy</code> runs its block the first time <code>ads</code> is read, so a cold start that never shows an ad never pays for it.' },
      { type: 'bug', prompt: 'Cold start got 300 ms slower after this change. Tap the line that runs on the main thread during startup.', code: 'object Emoji {\n    val table = loadTable()   // reads a 2 MB file\n}\nclass NewsApp : Application() {\n    override fun onCreate() {\n        super.onCreate()\n        Log.d("app", "emoji: " + Emoji.table.size)\n    }\n}', bug: 6, fix: '        // touch Emoji later, off the main thread', why: 'Reading <code>Emoji.table</code> loads and initializes the <code>Emoji</code> class on the spot, so the 2 MB read runs inside <code>Application.onCreate</code>. The innocent-looking log line is the trigger.' },
    ],
    quiz: [
      { q: 'Put the cold start steps in order.', options: ['Application.onCreate → fork process → providers → first frame', 'Fork from Zygote → ContentProviders → Application.onCreate → Activity.onCreate → first frame', 'Activity.onCreate → Application.onCreate → fork'], a: 1, why: 'The process must exist before any of your code runs, providers are created before Application.onCreate, and the activity comes last before drawing.' },
      { q: 'Three SDKs each register a ContentProvider for auto-init. What does App Startup change?', options: ['It removes the need to initialize them', 'Their initializers run from one shared provider in a declared order, and can be made lazy', 'It moves them to a separate process'], a: 1, why: 'Each provider costs time to create and their order is undefined. One InitializationProvider with Initializer classes fixes both.' },
      { q: 'A Kotlin <code>object</code> does heavy work in <code>init</code>. When does that work run?', options: ['At install time', 'The first time any code touches the object, on that thread', 'Always on a background thread'], a: 1, why: 'Class initialization is lazy and runs on the thread that first uses the class. Touching it from Application.onCreate puts it on the cold start path.' },
      { q: 'A Baseline Profile mostly speeds up which part of cold start?', options: ['Forking the process from Zygote', 'Phases that run your app code, because those methods are AOT-compiled at install', 'Downloading the APK'], a: 1, why: 'Profiles change how your DEX code runs. The fork is system work that does not depend on how your code is compiled.' },
      { q: 'You measure 180 ms by pressing Home and tapping the icon again. Why is this misleading?', options: ['It measures a warm or hot start, which skips process creation and Application.onCreate', 'Logcat rounds the numbers', 'The emulator is always faster'], a: 0, why: 'The process was still alive. Kill it first (or use Macrobenchmark with StartupMode.COLD) to measure what users get after the system reclaimed your process.' },
    ],
  });

  Lab.addTrack({
    id: 'runtime',
    title: 'How code runs',
    description: 'Compilers, bytecode, the Android Runtime and garbage collection: what happens between your Kotlin and the CPU.',
    requires: ['kotlin'],
    css,
    lessons,
  });
})();
