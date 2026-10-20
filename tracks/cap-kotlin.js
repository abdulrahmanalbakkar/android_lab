/* Capstone project: a budget tracker in plain Kotlin (no Android yet).
   A project is a track with kind: 'project'. Its lessons are build steps; each step adds code to ONE growing program.
   Steps: 1 plan, 2 model, 3 input, 4 reports, 5 storage, 6 rules, 7 tests, 8 recap.
   diagram(step) draws the program's parts as they are after that step (new parts highlighted); it is used as the
   side panel of Lab.ui.terminal demos: panel: dia(5). Styles live in the css string; every class is prefixed ck-. */
(() => {
  const { h } = Lab;

  // ---------- the program's parts, and the step that adds each one ----------
  // row: top = what runs the program; row 3 = the data; row 4 = the storage classes. mem: [text, step that adds it].
  const NODES = [
    { id: 'main', row: 0, step: 1, name: 'main()', kind: 'fun', mem: [['runs the program', 1], ['runOnce(storage, typed)', 8]] },
    { id: 'tests', row: 0, step: 7, name: 'runTests()', kind: 'checks', mem: [['test(name, passed)', 7], ['9 checks', 7]] },
    { id: 'tracker', row: 1, step: 2, name: 'Tracker', kind: 'class', mem: [['add(expense)', 2], ['all()', 2], ['saveTo(storage)', 5], ['loadFrom(storage)', 5]] },
    { id: 'budget', row: 1, step: 6, name: 'Budget', kind: 'class', mem: [['limits: Map', 6], ['status(category, spent)', 6]] },
    { id: 'parse', row: 2, step: 3, name: 'parseExpense()', kind: 'fun', mem: [['parseCategory(word)', 3], ['enter(tracker, typed)', 3]] },
    { id: 'reports', row: 2, step: 4, name: 'reports', kind: 'functions', mem: [['total()', 4], ['totalFor(category)', 4], ['printReport()', 4]] },
    { id: 'storage', row: 2, step: 5, name: 'Storage', kind: 'interface', mem: [['save(lines)', 5], ['load()', 5]] },
    { id: 'file', row: 4, step: 5, name: 'FileStorage', kind: 'class', mem: [['a text file', 5]] },
    { id: 'memory', row: 4, step: 5, name: 'MemoryStorage', kind: 'class', mem: [['a list in memory', 5]] },
    { id: 'expense', row: 3, step: 2, name: 'Expense', kind: 'data class', mem: [['amount, category, note', 2], ['toLine()', 5]] },
    { id: 'category', row: 3, step: 2, name: 'Category', kind: 'enum', mem: [['FOOD RENT TRAVEL', 2], ['FUN OTHER', 2]] },
    { id: 'status', row: 3, step: 6, name: 'BudgetStatus', kind: 'sealed', mem: [['NoLimit', 6], ['Within(left)', 6], ['Over(amount)', 6]] },
  ];
  // [from, to, step, implements?]
  const EDGES = [
    ['main', 'tracker', 2], ['tracker', 'expense', 2], ['expense', 'category', 2],
    ['main', 'parse', 3], ['parse', 'expense', 3],
    ['main', 'reports', 4], ['reports', 'expense', 4],
    ['tracker', 'storage', 5], ['tracker', 'parse', 5], ['file', 'storage', 5, true], ['memory', 'storage', 5, true],
    ['main', 'budget', 6], ['budget', 'status', 6], ['reports', 'budget', 6],
    ['tests', 'parse', 7], ['tests', 'tracker', 7], ['tests', 'budget', 7], ['tests', 'reports', 7], ['tests', 'memory', 7],
  ];
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };

  // diagram(step): the parts after that step. { plan: true } shows the finished design with nothing marked new.
  function diagram(step, { plan = false } = {}) {
    const nodes = {};
    const svg = svgEl('svg', { 'aria-hidden': 'true' });
    const shown = NODES.filter(n => n.step <= step);
    const isNew = s => !plan && s === step;
    const rows = [0, 1, 2, 3, 4].map(r => shown.filter(n => n.row === r)).filter(r => r.length).map(list =>
      h('div', { class: 'ck-row' }, list.map(n => {
        const fresh = isNew(n.step) || n.mem.some(m => isNew(m[1]));
        const mem = h('span', { class: 'ck-mem', hidden: !fresh }, n.mem.filter(m => m[1] <= step).map(m => h('span', { class: isNew(m[1]) ? 'ck-mnew' : null }, m[0])));
        const b = h('button', {
          type: 'button', class: ['ck-node', isNew(n.step) && 'ck-new', !isNew(n.step) && fresh && 'ck-grown', n.kind === 'interface' && 'ck-iface'].filter(Boolean).join(' '),
          'aria-expanded': String(fresh), 'aria-label': `${n.name}, ${n.kind}${isNew(n.step) ? ', new in this step' : fresh ? ', changed in this step' : ''}`,
          onclick() { mem.hidden = !mem.hidden; b.setAttribute('aria-expanded', String(!mem.hidden)); draw(); },
        }, h('span', { class: 'ck-kind' }, n.kind, isNew(n.step) ? h('em', {}, 'new') : null), h('b', {}, n.name), mem);
        nodes[n.id] = b;
        return b;
      })));
    const edges = EDGES.filter(e => e[2] <= step && nodes[e[0]] && nodes[e[1]]);
    const hasImpl = edges.some(e => e[3]);
    const wrap = h('figure', { class: 'ck-dia', 'aria-label': plan ? 'The finished design' : `The program's parts after step ${step}` },
      svg,
      h('figcaption', { class: 'ck-dia-head' }, h('span', {}, plan ? 'The finished design' : `Parts · step ${step}`),
        h('span', { class: 'ck-legend' }, plan ? null : h('span', { class: 'ck-lg ck-lg-new' }, 'new'), h('span', { class: 'ck-lg ck-lg-use' }, 'uses'), hasImpl ? h('span', { class: 'ck-lg ck-lg-impl' }, 'implements') : null)),
      rows,
      h('p', { class: 'ck-dia-tip' }, 'Tap a box to show or hide what is inside.'));

    let first = true, drawn = false; // new arrows animate in on the first draw only
    function draw() {
      if (!wrap.isConnected) { if (drawn) ro.disconnect(); return; }
      const box = wrap.getBoundingClientRect();
      if (!box.width) return;
      if (drawn) first = false;
      drawn = true;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      svg.replaceChildren();
      const ports = {};
      const port = (id, side) => { const k = id + side; ports[k] = (ports[k] || 0) + 1; return ports[k]; };
      const plans = edges.map(([from, to, s, impl]) => {
        const a = nodes[from].getBoundingClientRect(), b = nodes[to].getBoundingClientRect();
        const side = Math.abs(a.top - b.top) < 4;
        const down = a.top < b.top;
        return { a, b, side, down, impl, fresh: isNew(s), pa: side ? 0 : port(from, down ? 'b' : 't'), pb: side ? 0 : port(to, down ? 't' : 'b'), from, to };
      });
      for (const p of plans) {
        const cls = ['ck-edge', p.impl && 'ck-impl', p.fresh && 'ck-enew'].filter(Boolean).join(' ');
        let d, tipPts;
        if (p.side) { // same row: a short horizontal arrow
          const right = p.a.left < p.b.left;
          const x1 = (right ? p.a.right : p.a.left) - box.left, x2 = (right ? p.b.left : p.b.right) - box.left;
          const y = p.a.top + p.a.height / 2 - box.top, dir = right ? 1 : -1, tip = x2 - dir * 7;
          d = `M${x1} ${y} L${tip} ${y}`;
          tipPts = `${tip},${y - 5} ${tip},${y + 5} ${x2},${y}`;
        } else {
          const na = ports[p.from + (p.down ? 'b' : 't')], nb = ports[p.to + (p.down ? 't' : 'b')];
          const x1 = p.a.left - box.left + (p.a.width * p.pa) / (na + 1);
          const x2 = p.b.left - box.left + (p.b.width * p.pb) / (nb + 1);
          const y1 = (p.down ? p.a.bottom : p.a.top) - box.top;
          const y2 = (p.down ? p.b.top : p.b.bottom) - box.top;
          const dir = p.down ? 1 : -1, tip = y2 - dir * 7, my = (y1 + tip) / 2;
          d = `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${tip}`;
          tipPts = `${x2 - 5},${tip} ${x2 + 5},${tip} ${x2},${y2}`;
        }
        const path = svgEl('path', { d, class: cls });
        if (p.fresh && !p.impl && first) path.setAttribute('pathLength', '1');
        svg.append(path, svgEl('polygon', { points: tipPts, class: cls.replace('ck-edge', 'ck-arrow') }));
      }
    }
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => draw()) : { observe() {}, disconnect() {} };
    ro.observe(wrap);
    rows.forEach(r => ro.observe(r));
    setTimeout(draw, 400);
    return wrap;
  }
  // For a terminal demo's side panel: panel: dia(5) or dia(8, { plan: true }).
  const dia = (step, opts) => node => node.append(diagram(step, opts));
  // A text file shown in a side panel: panel: file('expenses.txt', ['800 RENT ', '12 FOOD lunch with Sam']).
  const file = (name, lines) => node => node.append(h('div', { class: 'ck-file' }, h('span', { class: 'ck-file-name' }, name),
    h('pre', {}, lines.length ? lines.join('\n') : '(empty)')));

  const css = `
.ck-dia { position: relative; margin: 0; display: grid; gap: 22px; padding: 12px 10px 10px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); min-width: 0; }
.ck-dia > svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 0; }
.ck-dia-head { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px 12px; font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.ck-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; text-transform: none; letter-spacing: 0; font-weight: 500; }
.ck-lg { display: inline-flex; align-items: center; gap: 5px; }
.ck-lg::before { content: ""; display: inline-block; width: 18px; height: 0; border-top: 2px solid var(--muted); }
.ck-lg-new::before { width: 12px; height: 10px; border: 2px solid var(--accent); border-radius: 3px; background: var(--accent-soft); }
.ck-lg-impl::before { border-top-style: dashed; }
.ck-row { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 12px 18px; min-width: 0; }
.ck-node { display: grid; gap: 1px; text-align: left; padding: 6px 9px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); font: 500 0.72rem/1.35 var(--mono); max-width: 100%; min-width: 0; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; animation: ck-fade 0.5s ease-out both; }
.ck-node:hover { border-color: var(--muted); }
.ck-node b { font-weight: 700; overflow-wrap: anywhere; }
.ck-node.ck-iface { border-style: dashed; border-color: var(--muted); }
.ck-node.ck-new { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.ck-node.ck-grown { border-color: var(--accent); }
.ck-kind { display: flex; gap: 6px; align-items: center; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.ck-kind em { font-style: normal; color: var(--accent); }
.ck-mem { display: grid; color: var(--muted); font-size: 0.68rem; border-top: 1px dashed var(--line); padding-top: 3px; margin-top: 3px; }
.ck-mem span { overflow-wrap: anywhere; }
.ck-mem .ck-mnew { color: var(--accent); font-weight: 600; }
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
.ck-file { display: grid; gap: 4px; min-width: 0; }
.ck-file-name { font: 600 0.72rem var(--mono); color: var(--muted); }
.ck-file pre { margin: 0; font: 500 0.76rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 8px 10px; white-space: pre-wrap; overflow-wrap: anywhere; min-height: 2.4em; }
@media (prefers-reduced-motion: reduce) { .ck-node { animation: none; } .ck-edge.ck-enew[pathLength] { animation: none; stroke-dashoffset: 0; } }
`;

  Lab.addTrack({
    id: 'capkotlin',
    title: 'Project: a budget tracker',
    kind: 'project',
    group: 'Foundations',
    requires: ['kotlin', 'oop', 'solid'],
    description: 'Build one small Kotlin program step by step: it reads expenses, adds them up, saves them and warns you about your budget.',
    builds: 'A budget tracker in plain Kotlin: it reads lines like "12 food lunch", skips bad ones, shows totals per category, saves to a text file and loads it back, warns when a category goes over its limit, and checks itself with small hand-made tests.',
    css,
    lessons: [
      // 1 plan ─────────────────────────────────────────────
      {
        id: 'plan',
        title: 'What we’ll build',
        tagline: 'Write down what the program must do, then cut the work into small steps.',
        goals: ['Turn an idea into a short list of checkable requirements', 'Cut a program into small steps that each end with code that runs', 'Decide what to leave out of the first version'],
        level: 'beginner', introduces: [],
        refs: ['kotlin.lists', 'kotlin.list-loop', 'git.commits'],
        body: `
<p>Money goes out all month, and at the end you wonder where it went. A notebook helps, but adding it up by hand is slow, and a notebook never warns you. In this project you build a small Kotlin program that does it for you: a budget tracker. It uses what you already know, plus a few small new tools, each explained when a step needs it.</p>
<p>Before any code, write down what the program must do. Each point is a <em>requirement</em>: a short sentence someone could check. “Show the total for each category” can be checked; “be nice to use” can’t. Our six are in the Run it program below. Also write down what it will <em>not</em> do yet. That choice is the <em>project scope</em>, and it keeps the project small: no app screen (Android comes in Stage 4), no dates, amounts are whole numbers (12, not 12.50), and no reading from the keyboard. Real keyboard input is out of scope for this project: the typed lines come as a list of strings in the program.</p>
<p>Then cut the work into steps. Each <em>build step</em> adds a little code and ends with a program that runs, so when something breaks, the mistake is in the few lines you just wrote. Eight steps: this plan, the data model, reading input, reports, saving, budget rules, tests, and putting it together. You build the program in the Run it editor. If you later set the project up on your computer, commit after each step (the Git track shows how).</p>
<p>Every step’s Run it holds the <em>whole</em> program as it is at that step. Run it, change it, break it. The demo shows the finished tracker at work, and the diagram next to it shows its parts.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            panelTitle: 'The parts you will build',
            predict: {
              q: 'On Monday you enter <code>12 food lunch with Sam</code>. On Friday the program starts again and you enter nothing for food. What should Friday’s report say for FOOD?',
              options: ['<code>FOOD: 12</code>, because Monday’s lunch was kept', 'Nothing: a new run starts empty', '<code>FOOD: 0</code>'],
              a: 0,
              why: 'Requirement 5 says expenses are kept for next time. Step 5 makes that true by saving them to a file.',
            },
            frames: [
              { panel: dia(8, { plan: true }), out: '--- Monday ---\nAdded: Expense(amount=800, category=RENT, note=)', say: 'The finished tracker on Monday. The typed line <code>800 rent</code> became an <code>Expense</code>. Steps 2 and 3 build that.' },
              { out: 'Added: Expense(amount=12, category=FOOD, note=lunch with Sam)', say: 'A note may contain spaces: everything after the category is the note.' },
              { out: 'Skipped: abc food', say: '<code>abc</code> is not an amount, so the line is skipped instead of crashing the program (requirement 3).' },
              { out: 'FOOD: 12 (188 left)\nRENT: 800 (no limit)\nTotal: 812', say: 'Totals for each category (step 4), and how much of each limit is left (step 6).' },
              { out: '--- Friday ---\nAdded: Expense(amount=90, category=FUN, note=concert)\nAdded: Expense(amount=40, category=FUN, note=cinema)\nSkipped: 5 snacks', say: 'Friday: the program starts again. Before reading new lines, it loads what Monday saved (step 5). <code>snacks</code> is not a category, so that line is skipped.' },
              { out: 'FOOD: 12 (188 left)\nRENT: 800 (no limit)\nFUN: 130 (OVER by 30)\nTotal: 942', say: 'Monday’s expenses are still there, and FUN went over its limit of 100. That is requirement 6. Tap the boxes in the diagram to see what each part holds.' },
            ],
          });
        },
        code: `// Budget tracker: the plan
// It must:
// 1. Record an expense: amount, category, note
// 2. Enter an expense as one line of text, like: 12 food lunch
// 3. Skip lines that make no sense
// 4. Show the total for each category
// 5. Keep the expenses for next time
// 6. Warn when a category goes over its limit
// Not yet: an app screen, dates, amounts with cents

fun main() {
    println("Budget tracker")   // Budget tracker
}`,
        play: `fun main() {
    val requirements = listOf(
        "Record an expense: amount, category, note",
        "Enter an expense as one line of text, like: 12 food lunch",
        "Skip lines that make no sense",
        "Show the total for each category",
        "Keep the expenses for next time",
        "Warn when a category goes over its limit"
    )
    println("The budget tracker must:")
    for ((i, requirement) in requirements.withIndex()) {
        println("\${i + 1}. $requirement")
    }
}`,
        remember: 'Write down what the program must do as checkable sentences, then build it in small steps that each end with a program that runs.',
        mistakes: [
          { title: 'Writing everything at once', bad: `// Day 1: write all 100 lines, then press Run
// 14 errors. Which part is wrong?`, good: `// Step 2: the data model. Run it.
// Step 3: reading input. Run it.`, why: 'When every step ends with a program that runs, a new error can only come from the lines you just added.' },
        ],
        terms: [
          { term: 'requirement', def: 'A short sentence about what a program must do, written so that anyone can check it: “Show the total for each category.”' },
          { term: 'project scope', def: 'What a project includes now, and what it leaves out on purpose (not the same as a variable’s scope).' },
          { term: 'build step', def: 'A small piece of work that ends with a program that runs.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print the plan, one numbered line per step, starting at 1.', code: `val steps = listOf("plan", "model", "input")
for ((i, step) in steps.[[withIndex]]()) {
    println("\${i [[+]] 1}. $step")
}`, why: '<code>withIndex()</code> gives the index and the item. Indexes start at 0, so add 1 for the step number.' },
          { type: 'bug', prompt: 'One requirement can’t be checked by anyone. Tap it.', code: `val requirements = listOf(
    "Record an expense: amount, category, note",
    "Show the total for each category",
    "Be nice to use"
)`, bug: 3, fix: '    "Warn when a category goes over its limit"', why: 'Nobody can say when “be nice to use” is done. A requirement names something the program does that you can see.' },
        ],
        quiz: [
          { q: 'Which of these is a good requirement?', options: ['Show the total for each category', 'Make the code good', 'Use a lot of Kotlin'], a: 0, why: 'You can run the program and check whether it shows the totals. The others can’t be checked.' },
          { q: 'Why should every step end with a program that runs?', options: ['If something breaks, the mistake is in the code you just added', 'Kotlin can only run short programs', 'Then you never need to test'], a: 0, why: 'The last version worked, so a new problem comes from the new lines.' },
          { q: 'The plan says amounts are whole numbers. Why leave cents out?', options: ['To keep the first version small; cents can be a later step', 'Kotlin has no decimal numbers', 'Nobody ever needs cents'], a: 0, why: 'Project scope keeps a project finishable. A first version that works beats a big one that doesn’t.' },
        ],
        docs: [['Try Kotlin in the browser', 'https://play.kotlinlang.org/'], ['Get started with Kotlin', 'https://kotlinlang.org/docs/getting-started.html']],
      },

      // 2 model ─────────────────────────────────────────────
      {
        id: 'model',
        title: 'The data model',
        tagline: 'Category, Expense and Tracker: the three types the rest is built on.',
        goals: ['Describe an expense with a data class and its category with an enum', 'Keep the list of expenses inside a class, behind a private property', 'Create, print and copy expenses'],
        level: 'beginner', introduces: [],
        refs: ['kotlin.data-classes', 'kotlin.enums', 'kotlin.encapsulation-basics', 'kotlin.mutable-lists', 'oop.domain-modeling'],
        body: `
<p>Every later step works with expenses, so we start by deciding what an expense <em>is</em>. On paper you would write “12, food, lunch with Sam”: an amount, a category and a note. Choosing types for those things is called the <em>data model</em>.</p>
<p>The categories are a short, fixed list, so they become an enum: <code>enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }</code>. A typo like <code>Category.FOD</code> won’t compile. An expense only holds values, so it is a data class: <code>data class Expense(val amount: Int, val category: Category, val note: String)</code>. That gives readable printing, <code>==</code> that compares values, and <code>copy</code>. Every property is a <code>val</code>: to change an expense, you make a changed copy.</p>
<p>The expenses need a home. <code>class Tracker</code> keeps them in a <code>private val expenses = mutableListOf&lt;Expense&gt;()</code>. Code outside can only add one with <code>add</code>, and read them with <code>all()</code>. <code>all()</code> hands the list out as a <code>List&lt;Expense&gt;</code>, a type without <code>add</code>, so nothing outside can change the list behind the tracker’s back.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()
    fun add(expense: Expense) {
        expenses.add(expense)
    }
    fun all(): List<Expense> = expenses
}

fun main() {
    val tracker = Tracker()
    val lunch = Expense(12, Category.FOOD, "lunch with Sam")
    tracker.add(lunch)
    tracker.add(lunch.copy(note = "lunch with Lin"))
    println(tracker.all())
    println(lunch == tracker.all()[0])
}`,
            predict: {
              q: 'The last line compares <code>lunch</code> with the first expense in the tracker. What does it print?',
              options: ['<code>true</code>', '<code>false</code>', 'An error: <code>expenses</code> is private'],
              a: 0,
              why: '<code>all()</code> is public, so reading works. The first item holds the same values as <code>lunch</code>, and a data class compares values.',
            },
            frames: [
              { line: 1, say: 'Five categories, and no others can exist.' },
              { line: 3, say: 'An expense: an amount, one of the categories, and a note. <code>data</code> gives printing, comparing and <code>copy</code>.' },
              { line: [5, 6], say: 'The tracker’s list is <code>private</code>: only the tracker’s own functions can touch it.' },
              { line: [14, 15], vars: { tracker: 'Tracker (0 expenses)', lunch: 'Expense(12, FOOD, "lunch with Sam")' }, say: 'An empty tracker and one expense.' },
              { line: 16, vars: { tracker: 'Tracker (1 expense)' }, say: '<code>add</code> puts the expense into the private list.' },
              { line: 17, vars: { tracker: 'Tracker (2 expenses)' }, say: '<code>copy</code> makes a new expense with a different note. <code>lunch</code> itself doesn’t change.' },
              { line: 18, out: '[Expense(amount=12, category=FOOD, note=lunch with Sam), Expense(amount=12, category=FOOD, note=lunch with Lin)]', say: 'Printing a list of data class objects shows every value.' },
              { line: 19, out: 'true', say: 'Same amount, category and note, so <code>==</code> gives <code>true</code>.' },
            ],
          });
        },
        code: `enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses
}

fun main() {
    val tracker = Tracker()
    tracker.add(Expense(800, Category.RENT, "March"))
    println(tracker.all())   // [Expense(amount=800, category=RENT, note=March)]
}`,
        play: `enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses
}

fun main() {
    val tracker = Tracker()
    tracker.add(Expense(800, Category.RENT, "March"))
    tracker.add(Expense(12, Category.FOOD, "lunch with Sam"))
    val lunch = Expense(12, Category.FOOD, "lunch with Sam")
    tracker.add(lunch.copy(note = "lunch with Lin"))

    for (expense in tracker.all()) {
        println(expense)
    }
    println(tracker.all().size)
}`,
        remember: 'Category is an enum, Expense is a data class, and Tracker keeps its list private behind add and all().',
        mistakes: [
          { title: 'A category as plain text', bad: `data class Expense(val amount: Int, val category: String, val note: String)

Expense(12, "fod", "lunch")   // compiles, typo and all`, good: `data class Expense(val amount: Int, val category: Category, val note: String)

Expense(12, Category.FOOD, "lunch")`, why: 'With a String, every typo compiles and quietly breaks the totals later. The enum allows only the five categories.' },
        ],
        terms: [
          { term: 'data model', def: 'The types a program uses to describe its world. Here: <code>Category</code>, <code>Expense</code> and <code>Tracker</code>.' },
          { term: 'List<Expense>', def: 'The type of a list of expenses. Through this type you can read the list but not add to it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the two types so this prints the taxi ride.', code: `[[enum]] class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

[[data]] class Expense(val amount: Int, val category: Category, val note: String)

fun main() {
    val taxi = Expense(25, Category.TRAVEL, "airport")
    println(taxi)   // Expense(amount=25, category=TRAVEL, note=airport)
}`, why: 'An <code>enum class</code> lists the only allowed values. A <code>data class</code> prints its values.' },
          { type: 'bug', prompt: 'Kotlin says <code>Unresolved reference \'add\'.</code> Tap the line to fix.', code: `class Tracker {
    private val expenses = listOf<Expense>()
    fun add(expense: Expense) {
        expenses.add(expense)
    }
}`, bug: 1, fix: '    private val expenses = mutableListOf<Expense>()', why: 'A <code>listOf</code> list can’t change, so it has no <code>add</code>. The tracker needs a <code>mutableListOf</code> list.' },
        ],
        quiz: [
          { q: 'Why is the category an enum and not a String?', options: ['Only the five categories can exist, so a typo won’t compile', 'An enum prints faster', 'A data class can’t hold a String'], a: 0, why: 'The enum is the full list of allowed values. Kotlin rejects anything else.' },
          { q: '<code>val dinner = lunch.copy(note = "dinner")</code>. What is <code>lunch.note</code> now?', options: ['<code>"lunch with Sam"</code>, as before', '<code>"dinner"</code>', 'An error: <code>note</code> is a <code>val</code>'], a: 0, why: '<code>copy</code> makes a new object. The original keeps its values.' },
          { q: 'Outside the <code>Tracker</code> class, which line won’t compile?', options: ['<code>tracker.add(lunch)</code>', '<code>tracker.all().size</code>', '<code>tracker.expenses.add(lunch)</code>'], a: 2, why: '<code>expenses</code> is private. Outside code goes through <code>add</code> and <code>all()</code>.' },
        ],
        docs: [['Data classes', 'https://kotlinlang.org/docs/data-classes.html'], ['Enum classes', 'https://kotlinlang.org/docs/enum-classes.html']],
      },

      // 3 input ─────────────────────────────────────────────
      {
        id: 'input',
        title: 'Reading input',
        tagline: 'Turn a typed line like “12 food lunch” into an Expense, and skip lines that make no sense.',
        goals: ['Cut a line of text into parts with <code>split</code>', 'Turn each part into the right type, or <code>null</code> when it doesn’t fit', 'Skip bad lines without crashing'],
        level: 'beginner', introduces: ['split', 'limit', 'lowercase'],
        refs: ['kotlin.null-safety', 'kotlin.when', 'kotlin.lists', 'kotlin.if-expression', 'kotlin.default-args'],
        body: `
<p>Nobody wants to type <code>Expense(12, Category.FOOD, "lunch")</code> for every coffee. People want to type a short line, <code>12 food lunch with Sam</code>, and they make typos: <code>abc food</code>, <code>5 snacks</code>. The program must keep the good lines and skip the bad ones, without crashing.</p>
<p>New tool: <code>split</code> cuts text wherever a separator appears and gives back a <code>List&lt;String&gt;</code>. <code>"12 food lunch".split(" ")</code> is <code>[12, food, lunch]</code>. But a note can have spaces too, so we add the named argument <code>limit = 3</code>: make at most 3 parts, and the last part keeps the rest of the line. <code>"12 food lunch with Sam".split(" ", limit = 3)</code> is <code>[12, food, lunch with Sam]</code>.</p>
<p>Then each part is converted, and anything that doesn’t fit gives <code>null</code>. The amount comes from <code>parts[0].toIntOrNull()</code>. <code>parseCategory</code> turns a word into a <code>Category</code> with a <code>when</code>, and <code>else -&gt; null</code> for unknown words. One more small tool, <code>lowercase()</code>, gives the same text in small letters, so <code>Food</code> and <code>FOOD</code> work too. <code>parseExpense</code> returns <code>Expense?</code>: an expense, or <code>null</code> when the line has fewer than 2 parts, a bad amount (0 or less counts as bad), or an unknown category. After <code>if (amount == null || category == null) return null</code>, Kotlin knows both are there: a smart cast.</p>
<p>Where do the lines come from? Reading real keyboard input is out of scope for this project, and the Run it editor can’t read the keyboard anyway. So a list of strings stands in for what someone types. <code>enter</code> goes through the lines, adds the good ones to the tracker and prints which ones it skipped.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'line', label: 'line', sub: 'String' },
              { id: 'split', label: 'split', sub: 'limit = 3' },
              { id: 'amount', label: 'amount', sub: 'toIntOrNull()' },
              { id: 'cat', label: 'category', sub: 'parseCategory' },
              { id: 'out', label: 'result', sub: 'Expense?' },
            ],
            predict: {
              q: 'What should happen to the typed line <code>5 snacks</code>?',
              options: ['It is skipped: <code>snacks</code> is not a category', 'It is added as OTHER', 'The program crashes'],
              a: 0,
              why: '<code>parseCategory("snacks")</code> finds no matching branch and gives <code>null</code>, so <code>parseExpense</code> gives <code>null</code> and the line is skipped.',
            },
            frames: [
              { at: 'line', packet: '"12 food lunch with Sam"', say: 'A typed line arrives. It is one <code>String</code>.' },
              { at: 'split', packet: '[12, food, lunch with Sam]', mark: { line: 'ok' }, say: '<code>split(" ", limit = 3)</code> makes three parts. The note keeps its spaces.' },
              { at: 'amount', packet: '12', tone: 'ok', mark: { split: 'ok', amount: 'ok' }, say: '<code>"12".toIntOrNull()</code> is <code>12</code>, and 12 is more than 0. A good amount.' },
              { at: 'cat', packet: 'Category.FOOD', tone: 'ok', mark: { cat: 'ok' }, say: '<code>"food"</code> matches the <code>"food"</code> branch of the <code>when</code>.' },
              { at: 'out', packet: 'Expense(12, FOOD, "lunch with Sam")', tone: 'ok', mark: { out: 'ok' }, say: 'Every part fits, so <code>parseExpense</code> returns an <code>Expense</code>, and <code>enter</code> adds it to the tracker.' },
              { at: 'split', packet: '[5, snacks]', mark: { line: 'ok', split: 'ok', amount: '', cat: '', out: '' }, say: 'The next line, <code>5 snacks</code>, gives two parts. No note: that is allowed.' },
              { at: 'cat', packet: '"snacks"', tone: 'err', mark: { amount: 'ok', cat: 'err' }, say: 'The amount 5 is fine, but no branch matches <code>"snacks"</code>: <code>parseCategory</code> gives <code>null</code>.' },
              { at: 'out', packet: 'null', tone: 'err', mark: { out: 'err' }, say: '<code>parseExpense</code> returns <code>null</code>, and <code>enter</code> prints <code>Skipped: 5 snacks</code>. No crash.' },
            ],
          });
        },
        code: `fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun main() {
    println(parseExpense("12 food lunch with Sam"))   // Expense(amount=12, category=FOOD, note=lunch with Sam)
    println(parseExpense("800 Rent"))                 // Expense(amount=800, category=RENT, note=)
    println(parseExpense("5 snacks"))                 // null
    println(parseExpense("0 food"))                   // null
}`,
        play: `enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses
}

fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun enter(tracker: Tracker, typed: List<String>) {
    for (line in typed) {
        val expense = parseExpense(line)
        if (expense == null) {
            println("Skipped: $line")
        } else {
            tracker.add(expense)
            println("Added: $expense")
        }
    }
}

fun main() {
    // The Run it editor can't read the keyboard, so this list stands in for what someone types.
    val typed = listOf("12 food lunch with Sam", "800 rent", "abc food", "5 snacks", "-3 fun")
    val tracker = Tracker()
    enter(tracker, typed)
    println("\${tracker.all().size} expenses kept")
}`,
        remember: 'split(" ", limit = 3) cuts the line; each part becomes a value or null; a null anywhere means the line is skipped.',
        mistakes: [
          { title: 'Splitting without a limit', bad: `val parts = "12 food lunch with Sam".split(" ")
println(parts)   // [12, food, lunch, with, Sam]`, good: `val parts = "12 food lunch with Sam".split(" ", limit = 3)
println(parts)   // [12, food, lunch with Sam]`, why: 'Without <code>limit</code>, every space cuts, and the note falls apart into separate words.' },
        ],
        terms: [
          { term: 'split', def: 'Cuts text into a <code>List&lt;String&gt;</code> at a separator: <code>"a b".split(" ")</code> is <code>[a, b]</code>.' },
          { term: 'limit', def: 'In <code>split</code>, the most parts to make. The last part keeps the rest of the text.' },
          { term: 'lowercase()', def: 'The same text in small letters: <code>"Food".lowercase()</code> is <code>"food"</code>.' },
          { term: 'parse', def: 'To read text and turn it into a value of some type, or say that it can’t be done.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Cut the line so the note keeps its spaces.', code: `val parts = "40 fun concert with Ada".[[split]](" ", [[limit]] = 3)
println(parts[2])   // concert with Ada`, why: '<code>split</code> cuts at each space, and <code>limit = 3</code> stops after three parts.' },
          { type: 'bug', prompt: '<code>parseCategory("Food")</code> gives <code>null</code>, but it should give <code>FOOD</code>. Tap the line.', code: `fun parseCategory(word: String): Category? = when (word) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    else -> null
}`, bug: 0, fix: 'fun parseCategory(word: String): Category? = when (word.lowercase()) {', why: '<code>"Food"</code> is not equal to <code>"food"</code>. Turning the word into small letters first makes both match.' },
        ],
        quiz: [
          { q: 'What is <code>"9 travel bus to Oslo".split(" ", limit = 3)</code>?', options: ['<code>[9, travel, bus to Oslo]</code>', '<code>[9, travel, bus, to, Oslo]</code>', '<code>[9 travel bus to Oslo]</code>'], a: 0, why: 'Three parts at most. The third keeps the rest of the line, spaces included.' },
          { q: '<code>parseExpense("abc food")</code> gives <code>null</code>. Why doesn’t the program crash?', options: ['<code>toIntOrNull()</code> gives <code>null</code> instead of throwing, and the line is skipped', 'Kotlin skips bad lines by itself', '<code>split</code> removes the letters'], a: 0, why: '<code>toInt()</code> would crash on <code>"abc"</code>. <code>toIntOrNull()</code> gives <code>null</code>, which the code checks.' },
          { q: 'Why does <code>parseExpense</code> return <code>Expense?</code> and not <code>Expense</code>?', options: ['Some lines make no sense, and <code>null</code> says “no expense here”', 'Every expense might be empty', 'Data classes must be nullable'], a: 0, why: 'The <code>?</code> makes the caller deal with a missing answer, which is how bad lines get skipped.' },
        ],
        docs: [['split (Kotlin API)', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html'], ['Null safety', 'https://kotlinlang.org/docs/null-safety.html']],
      },

      // 4 reports ─────────────────────────────────────────────
      {
        id: 'reports',
        title: 'Reports',
        tagline: 'Add up what you spent, in total and per category.',
        goals: ['Add up amounts with <code>filter</code>, <code>map</code> and <code>sum</code>', 'Write the totals as extension functions on <code>List&lt;Expense&gt;</code>', 'Go through every category with <code>Category.entries</code>'],
        level: 'intermediate', introduces: ['entries'],
        refs: ['kotlin.collection-ops', 'kotlin.extensions', 'kotlin.lambdas', 'kotlin.enums'],
        body: `
<p>The tracker holds expenses now, but the question you care about is “how much did I spend on food?”. A <em>report</em> answers it: numbers worked out from the list.</p>
<p>The collection tools you know do the work. <code>map { it.amount }</code> turns each expense into its amount, and <code>sum()</code> adds them up. For one category, <code>filter { it.category == category }</code> first keeps only its expenses. We write these as extension functions on <code>List&lt;Expense&gt;</code>, so they read like built-in ones: <code>expenses.total()</code> and <code>expenses.totalFor(Category.FOOD)</code>. Inside them, <code>this</code> is the list, so <code>filter</code> and <code>map</code> need nothing in front.</p>
<p>A report prints a line per category, so it needs every category. New tool: <code>Category.entries</code> is a list of all the entries of an enum, in the order they are written: <code>[FOOD, RENT, TRAVEL, FUN, OTHER]</code>. <code>printReport</code> goes through it, prints only the categories you spent something on, then the total. None of these functions change the list. They only read it, so they take a <code>List&lt;Expense&gt;</code>, which is what <code>tracker.all()</code> gives.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `// Category and Expense come from step 2.
fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun main() {
    val expenses = listOf(
        Expense(800, Category.RENT, ""),
        Expense(12, Category.FOOD, "lunch with Sam"),
        Expense(8, Category.FOOD, "snacks")
    )
    println(expenses.totalFor(Category.FOOD))
    println(Category.entries)
}`,
            predict: {
              q: 'What does <code>expenses.totalFor(Category.FOOD)</code> print?',
              options: ['<code>20</code>', '<code>820</code>', '<code>2</code>'],
              a: 0,
              why: '<code>filter</code> keeps the two FOOD expenses, <code>map</code> takes their amounts, 12 and 8, and <code>sum()</code> adds them.',
            },
            frames: [
              { line: [6, 7, 8, 9, 10], vars: { expenses: '[RENT 800, FOOD 12, FOOD 8]' }, say: 'Three expenses: rent and two kinds of food.' },
              { line: 11, vars: { this: '[RENT 800, FOOD 12, FOOD 8]', category: 'FOOD' }, say: '<code>totalFor</code> is called on the list, so inside it, <code>this</code> is that list.' },
              { line: 3, vars: { 'after filter': '[FOOD 12, FOOD 8]' }, say: '<code>filter</code> keeps the expenses whose category is FOOD. Rent is left out.' },
              { line: 3, vars: { 'after map': '[12, 8]' }, say: '<code>map { it.amount }</code> turns each expense into its amount.' },
              { line: 3, vars: { 'after sum': '20' }, say: '<code>sum()</code> adds the numbers up.' },
              { line: 11, out: '20', vars: { this: null, category: null, 'after filter': null, 'after map': null, 'after sum': null }, say: 'The FOOD total: 20.' },
              { line: 12, out: '[FOOD, RENT, TRAVEL, FUN, OTHER]', say: '<code>Category.entries</code>: every category, in the order they are written. <code>printReport</code> goes through this list.' },
            ],
          });
        },
        code: `fun List<Expense>.total(): Int = map { it.amount }.sum()

fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun printReport(expenses: List<Expense>) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) println("$category: $spent")
    }
    println("Total: \${expenses.total()}")
}

fun main() {
    val expenses = listOf(Expense(800, Category.RENT, ""), Expense(12, Category.FOOD, "lunch"), Expense(8, Category.FOOD, "snacks"))
    println(expenses.totalFor(Category.FOOD))   // 20
    printReport(expenses)
    // FOOD: 20
    // RENT: 800
    // Total: 820
}`,
        play: `enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses
}

fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun enter(tracker: Tracker, typed: List<String>) {
    for (line in typed) {
        val expense = parseExpense(line)
        if (expense == null) {
            println("Skipped: $line")
        } else {
            tracker.add(expense)
            println("Added: $expense")
        }
    }
}

fun List<Expense>.total(): Int = map { it.amount }.sum()

fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun printReport(expenses: List<Expense>) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) println("$category: $spent")
    }
    println("Total: \${expenses.total()}")
}

fun main() {
    // Stands in for what someone types.
    val typed = listOf("800 rent", "12 food lunch with Sam", "40 fun concert", "8 food snacks", "abc food")
    val tracker = Tracker()
    enter(tracker, typed)
    printReport(tracker.all())
}`,
        remember: 'filter narrows, map picks the amount, sum adds; Category.entries lists every category for the report.',
        mistakes: [
          { title: 'Forgetting the filter', bad: `fun List<Expense>.totalFor(category: Category): Int =
    map { it.amount }.sum()   // adds every category`, good: `fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()`, why: 'Without <code>filter</code>, the parameter is never used, and every category gets the grand total.' },
        ],
        terms: [
          { term: 'report', def: 'Numbers worked out from the data, like a total per category.' },
          { term: 'entries', def: 'A list of all the entries of an enum, in the order they are written: <code>Category.entries</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add up every amount in the list.', code: 'fun List<Expense>.total(): Int = [[map]] { it.amount }.[[sum]]()', why: '<code>map</code> turns each expense into its amount, then <code>sum()</code> adds them.' },
          { type: 'bug', prompt: 'The report also prints <code>TRAVEL: 0</code> and <code>OTHER: 0</code>. Tap the line.', code: `fun printReport(expenses: List<Expense>) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent >= 0) println("$category: $spent")
    }
    println("Total: \${expenses.total()}")
}`, bug: 3, fix: '        if (spent > 0) println("$category: $spent")', why: '0 is “greater than or equal to 0”, so empty categories pass. Only print what is more than 0.' },
        ],
        quiz: [
          { q: 'What is <code>listOf(Expense(5, Category.FUN, ""), Expense(7, Category.FUN, "")).total()</code>?', options: ['<code>12</code>', '<code>2</code>', '<code>[5, 7]</code>'], a: 0, why: '<code>map</code> gives <code>[5, 7]</code>, and <code>sum()</code> adds them.' },
          { q: 'What does <code>Category.entries</code> hold?', options: ['All five categories, in the order they are written', 'Only the categories you have spent on', 'The number 5'], a: 0, why: 'It lists every entry of the enum, used or not. That is why <code>printReport</code> checks <code>spent &gt; 0</code>.' },
          { q: 'Inside <code>fun List&lt;Expense&gt;.total()</code>, what is <code>this</code>?', options: ['The list <code>total()</code> was called on', 'One <code>Expense</code>', 'The <code>Tracker</code>'], a: 0, why: 'The value before the dot is the receiver, and <code>this</code> is the receiver.' },
        ],
        docs: [['Extensions', 'https://kotlinlang.org/docs/extensions.html'], ['Aggregate operations', 'https://kotlinlang.org/docs/collection-aggregate.html']],
      },

      // 5 storage ─────────────────────────────────────────────
      {
        id: 'storage',
        title: 'Saving to a file',
        tagline: 'Keep the expenses when the program stops, and load them next time.',
        goals: ['Write lines to a text file and read them back with <code>File</code>', 'Hide where data is kept behind a <code>Storage</code> interface', 'Swap the file for a list in memory without changing the Tracker'],
        level: 'intermediate', introduces: ['import', 'File', 'writeText', 'readLines'],
        refs: ['kotlin.interfaces', 'kotlin.exceptions', 'kotlin.extensions', 'solid.dip'],
        body: `
<p>Stop the program and every expense is gone: the list lives in the computer’s memory, and a program’s memory is cleared when it stops. To keep data, a program writes it to a file on disk and reads it back next time.</p>
<p>Each expense becomes one line of text, in the shape people type: <code>fun Expense.toLine(): String = "$amount $category $note"</code> gives <code>"12 FOOD lunch with Sam"</code>. Loading needs nothing new: <code>parseExpense</code> already reads that shape, and <code>lowercase()</code> makes <code>FOOD</code> match. The new tool comes from Java, an older language that Kotlin runs alongside; Kotlin can use Java’s ready-made classes. <code>import java.io.File</code> at the top of the file makes the <code>File</code> class available. <code>File("expenses.txt").writeText(text)</code> writes the text into the file, replacing what was there, and <code>File("expenses.txt").readLines()</code> reads it back as a <code>List&lt;String&gt;</code>, one item per line. With only a name, the file is created in the folder the program runs from. On the very first run there is no file yet: <code>readLines()</code> throws an exception, we catch it, and start with an empty list.</p>
<p>The Run it editor can’t use files, and later you may want a database instead. So the <code>Tracker</code> doesn’t use <code>File</code> itself: it talks to an interface, <code>Storage</code>, with <code>save(lines)</code> and <code>load()</code>. <code>FileStorage</code> keeps that promise with a file; <code>MemoryStorage</code> keeps it with a list in memory, for Run it and for tests. <code>tracker.saveTo(storage)</code> and <code>tracker.loadFrom(storage)</code> work with either. This is dependency inversion from the SOLID track, used for real.</p>`,
        visual(el) {
          const f = lines => file('expenses.txt', lines);
          Lab.ui.terminal(el, {
            panelTitle: 'On disk',
            predict: {
              q: 'The file holds <code>800 RENT</code> and <code>12 FOOD lunch with Sam</code>. A new, empty Tracker loads it, then <code>40 fun concert</code> is added. What is the total in the report?',
              options: ['<code>852</code>', '<code>40</code>', '<code>812</code>'],
              a: 0,
              why: 'Loading puts the 800 and the 12 back into the tracker. Add the 40 and the total is 852.',
            },
            frames: [
              { panel: node => node.append(h('div', { class: 'ck-file' }, h('span', { class: 'ck-file-name' }, 'expenses.txt'), h('pre', {}, '(no file yet)'))), out: 'Added: Expense(amount=800, category=RENT, note=)\nAdded: Expense(amount=12, category=FOOD, note=lunch with Sam)', say: 'Monday, with <code>FileStorage("expenses.txt")</code>. Two lines are typed and added. Nothing is on disk yet.' },
              { panel: f(['800 RENT ', '12 FOOD lunch with Sam']), say: '<code>tracker.saveTo(storage)</code>: <code>toLine()</code> turns each expense into a line, and <code>FileStorage</code> writes them with <code>writeText</code>. The rent line ends with a space: its note is empty.' },
              { say: 'The program stops. The tracker and its list are gone from memory, but the file stays on disk.' },
              { say: 'Friday: the program starts again with a new, empty tracker. <code>loadFrom(storage)</code> reads the two lines with <code>readLines()</code>, and <code>parseExpense</code> turns each one back into an <code>Expense</code>.' },
              { out: 'Added: Expense(amount=40, category=FUN, note=concert)', say: 'A new line is typed and added.' },
              { out: 'FOOD: 12\nRENT: 800\nFUN: 40\nTotal: 852', say: 'The report includes Monday’s expenses: they came back from the file.' },
              { panel: f(['800 RENT ', '12 FOOD lunch with Sam', '40 FUN concert']), say: 'Saving again writes all three lines, replacing the old content. Next time, all three come back.' },
            ],
          });
        },
        code: `import java.io.File

fun Expense.toLine(): String = "$amount $category $note"   // "12 FOOD lunch with Sam"

interface Storage {
    fun save(lines: List<String>)
    fun load(): List<String>
}

class FileStorage(private val path: String) : Storage {
    override fun save(lines: List<String>) {
        var text = ""
        for (line in lines) {
            text += line + "\\n"   // inside quotes, \\n means "new line"
        }
        File(path).writeText(text)
    }

    override fun load(): List<String> {
        try {
            return File(path).readLines()
        } catch (e: Exception) {
            return listOf()   // no file yet: nothing saved
        }
    }
}

// New in class Tracker:
fun saveTo(storage: Storage) {
    storage.save(expenses.map { it.toLine() })
}

fun loadFrom(storage: Storage) {
    for (line in storage.load()) {
        val expense = parseExpense(line)
        if (expense != null) expenses.add(expense)
    }
}`,
        play: `import java.io.File


enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses

    fun saveTo(storage: Storage) {
        storage.save(expenses.map { it.toLine() })
    }

    fun loadFrom(storage: Storage) {
        for (line in storage.load()) {
            val expense = parseExpense(line)
            if (expense != null) expenses.add(expense)
        }
    }
}

fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun enter(tracker: Tracker, typed: List<String>) {
    for (line in typed) {
        val expense = parseExpense(line)
        if (expense == null) {
            println("Skipped: $line")
        } else {
            tracker.add(expense)
            println("Added: $expense")
        }
    }
}

fun List<Expense>.total(): Int = map { it.amount }.sum()

fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun printReport(expenses: List<Expense>) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) println("$category: $spent")
    }
    println("Total: \${expenses.total()}")
}

fun Expense.toLine(): String = "$amount $category $note"

interface Storage {
    fun save(lines: List<String>)
    fun load(): List<String>
}

class FileStorage(private val path: String) : Storage {
    override fun save(lines: List<String>) {
        var text = ""
        for (line in lines) {
            text += line + "\\n"   // inside quotes, \\n means "new line"
        }
        File(path).writeText(text)
    }

    override fun load(): List<String> {
        try {
            return File(path).readLines()
        } catch (e: Exception) {
            return listOf()
        }
    }
}

class MemoryStorage : Storage {
    private var saved: List<String> = listOf()

    override fun save(lines: List<String>) {
        saved = lines
    }

    override fun load(): List<String> = saved
}

fun main() {
    // The Run it editor can't use files, so MemoryStorage stands in for FileStorage("expenses.txt").
    val storage = MemoryStorage()

    val monday = Tracker()
    enter(monday, listOf("800 rent", "12 food lunch with Sam"))
    monday.saveTo(storage)
    println(storage.load())

    // Like starting the program again on Friday: a new, empty Tracker.
    val friday = Tracker()
    friday.loadFrom(storage)
    enter(friday, listOf("40 fun concert"))
    printReport(friday.all())
}`,
        remember: 'One line per expense, written with writeText and read back with readLines; the Tracker only knows the Storage interface.',
        mistakes: [
          { title: 'Reading a file that isn’t there yet', bad: `override fun load(): List<String> = File(path).readLines()
// first run: FileNotFoundException, the program crashes`, good: `override fun load(): List<String> {
    try {
        return File(path).readLines()
    } catch (e: Exception) {
        return listOf()
    }
}`, why: 'On the first run nothing has been saved. A missing file means no expenses yet, so start with an empty list.' },
        ],
        terms: [
          { term: 'import', def: 'Makes a class from somewhere else usable in this file: <code>import java.io.File</code>.' },
          { term: 'File', def: 'A file on disk, found by its name or path: <code>File("expenses.txt")</code>.' },
          { term: 'writeText / readLines', def: '<code>writeText(text)</code> writes text into the file, replacing what was there. <code>readLines()</code> reads it back as a list with one item per line.' },
          { term: '\\n', def: 'Inside quotes, a new line. <code>"a\\nb"</code> prints <code>a</code> and <code>b</code> on two lines.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write each line, with a new line after it, into the file.', code: `override fun save(lines: List<String>) {
    var text = ""
    for (line in lines) {
        text += line + "[[\\n]]"
    }
    File(path).[[writeText]](text)
}`, why: '<code>\\n</code> ends each line. <code>writeText</code> puts the whole text into the file.' },
          { type: 'bug', prompt: 'After <code>saveTo</code>, <code>loadFrom</code> always gives an empty tracker. Tap the line.', code: `class MemoryStorage : Storage {
    private var saved: List<String> = listOf()
    override fun save(lines: List<String>) {
        saved = lines
    }
    override fun load(): List<String> = listOf()
}`, bug: 5, fix: '    override fun load(): List<String> = saved', why: '<code>load</code> must give back what <code>save</code> kept, not a new empty list.' },
        ],
        quiz: [
          { q: 'What does <code>Expense(800, Category.RENT, "").toLine()</code> give?', options: ['<code>"800 RENT "</code>, ending with a space', '<code>"800 RENT"</code>', '<code>"Expense(amount=800, category=RENT, note=)"</code>'], a: 0, why: 'The template puts a space before the note, and the note is empty. <code>split</code> later reads it back as an empty note.' },
          { q: 'Why does <code>saveTo</code> take a <code>Storage</code> and not a <code>FileStorage</code>?', options: ['So any storage works: a file, memory for tests, later a database', 'An interface runs faster', 'A class can’t be a parameter type'], a: 0, why: 'The tracker only needs the promise: save lines, load lines. Who keeps them is a detail it doesn’t depend on.' },
          { q: 'On the first run, <code>expenses.txt</code> doesn’t exist. What does <code>FileStorage.load()</code> give?', options: ['An empty list: <code>readLines()</code> throws, and <code>catch</code> returns <code>listOf()</code>', 'The program crashes', '<code>null</code>'], a: 0, why: 'The <code>try</code>/<code>catch</code> turns the missing file into “nothing saved yet”.' },
        ],
        docs: [['Interfaces', 'https://kotlinlang.org/docs/interfaces.html'], ['readLines (Kotlin API)', 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/read-lines.html']],
      },

      // 6 rules ─────────────────────────────────────────────
      {
        id: 'rules',
        title: 'Budget rules',
        tagline: 'Set a limit per category, and get a clear answer: no limit, within it, or over.',
        goals: ['Keep a limit per category in a <code>Map</code>', 'Answer with one of a closed set of results, using a sealed interface', 'Turn each result into text with a <code>when</code> that needs no <code>else</code>'],
        level: 'intermediate', introduces: [],
        refs: ['kotlin.maps', 'kotlin.sealed', 'kotlin.classes', 'oop.encapsulation'],
        body: `
<p>Totals tell you what happened. A budget tells you when to stop. You decide on a <em>budget limit</em> per category: at most 200 for food and 100 for fun. The program should tell you how much is left, and warn you when you go over. Rent has no limit: it is what it is.</p>
<p>The limits are a map from category to amount: <code>mapOf(Category.FOOD to 200, Category.FUN to 100)</code>. Its type is written <code>Map&lt;Category, Int&gt;</code>: the keys are categories and the values are <code>Int</code>s, the way <code>List&lt;Expense&gt;</code> names what a list holds. <code>class Budget</code> keeps the map private and has one function, <code>status(category, spent)</code>. <code>limits[category]</code> gives that category’s limit, or <code>null</code> when it has none.</p>
<p>The answer comes in three shapes: no limit; within the limit, with how much is left; or over, and by how much. They carry different data, so a sealed interface fits: <code>object NoLimit</code>, <code>class Within(val left: Int)</code> and <code>class Over(val amount: Int)</code>. <code>describe</code> turns each one into text with a <code>when</code> and no <code>else</code>, so if you add a fourth kind later, Kotlin points at <code>describe</code>.</p>
<p>Checking values against rules is called <em>validation</em>. <code>parseExpense</code> validates typed lines; <code>Budget</code> validates spending. The rules live in one place: <code>Budget</code> decides, and <code>printReport</code> only prints. <code>printReport</code> now takes the <code>Budget</code> too, and adds its answer in brackets: <code>FOOD: 12 (188 left)</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Budget(private val limits: Map<Category, Int>) {
    fun status(category: Category, spent: Int): BudgetStatus {
        val limit = limits[category]
        if (limit == null) return NoLimit
        if (spent > limit) return Over(spent - limit)
        return Within(limit - spent)
    }
}

fun main() {
    val budget = Budget(mapOf(Category.FOOD to 200, Category.FUN to 100))
    println(describe(budget.status(Category.FUN, 130)))
    println(describe(budget.status(Category.RENT, 800)))
}`,
            predict: {
              q: 'FUN has a limit of 100, and you spent 130. What does <code>status</code> return?',
              options: ['<code>Over(30)</code>', '<code>Within(-30)</code>', '<code>NoLimit</code>'],
              a: 0,
              why: '130 is more than 100, so the <code>spent &gt; limit</code> line returns <code>Over(130 - 100)</code>.',
            },
            frames: [
              { line: 11, vars: { budget: 'limits {FOOD=200, FUN=100}' }, say: 'Two limits. RENT has none.' },
              { line: [12, 3], vars: { category: 'FUN', spent: '130', limit: '100' }, say: 'Look up FUN in the map: its limit is 100.' },
              { line: 4, say: 'The limit is not <code>null</code>, so go on. After this line Kotlin knows <code>limit</code> is an <code>Int</code>.' },
              { line: 5, say: '130 &gt; 100: return <code>Over(30)</code>.' },
              { line: 12, out: 'OVER by 30', say: '<code>describe</code> matches <code>is Over</code> and prints how much over.' },
              { line: [13, 3], vars: { category: 'RENT', spent: '800', limit: 'null' }, say: 'RENT is not a key in the map, so the lookup gives <code>null</code>.' },
              { line: 4, out: 'no limit', say: 'No limit: return the <code>NoLimit</code> object, and <code>describe</code> says so.' },
            ],
          });
        },
        code: `sealed interface BudgetStatus
object NoLimit : BudgetStatus
class Within(val left: Int) : BudgetStatus
class Over(val amount: Int) : BudgetStatus

class Budget(private val limits: Map<Category, Int>) {
    fun status(category: Category, spent: Int): BudgetStatus {
        val limit = limits[category]
        if (limit == null) return NoLimit
        if (spent > limit) return Over(spent - limit)
        return Within(limit - spent)
    }
}

fun describe(status: BudgetStatus): String = when (status) {
    NoLimit -> "no limit"
    is Within -> "\${status.left} left"
    is Over -> "OVER by \${status.amount}"
}

// changed: now takes the budget, and adds its answer in brackets
fun printReport(expenses: List<Expense>, budget: Budget) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) {
            val status = budget.status(category, spent)
            println("$category: $spent (\${describe(status)})")
        }
    }
    println("Total: \${expenses.total()}")
}

fun main() {
    val budget = Budget(mapOf(Category.FOOD to 200, Category.FUN to 100))
    println(describe(budget.status(Category.FOOD, 12)))    // 188 left
    println(describe(budget.status(Category.FUN, 130)))    // OVER by 30
    println(describe(budget.status(Category.RENT, 800)))   // no limit
    printReport(listOf(Expense(12, Category.FOOD, "lunch"), Expense(800, Category.RENT, "")), budget)
    // FOOD: 12 (188 left)
    // RENT: 800 (no limit)
    // Total: 812
}`,
        play: `import java.io.File


enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses

    fun saveTo(storage: Storage) {
        storage.save(expenses.map { it.toLine() })
    }

    fun loadFrom(storage: Storage) {
        for (line in storage.load()) {
            val expense = parseExpense(line)
            if (expense != null) expenses.add(expense)
        }
    }
}

fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun enter(tracker: Tracker, typed: List<String>) {
    for (line in typed) {
        val expense = parseExpense(line)
        if (expense == null) {
            println("Skipped: $line")
        } else {
            tracker.add(expense)
            println("Added: $expense")
        }
    }
}

fun List<Expense>.total(): Int = map { it.amount }.sum()

fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun Expense.toLine(): String = "$amount $category $note"

interface Storage {
    fun save(lines: List<String>)
    fun load(): List<String>
}

class FileStorage(private val path: String) : Storage {
    override fun save(lines: List<String>) {
        var text = ""
        for (line in lines) {
            text += line + "\\n"   // inside quotes, \\n means "new line"
        }
        File(path).writeText(text)
    }

    override fun load(): List<String> {
        try {
            return File(path).readLines()
        } catch (e: Exception) {
            return listOf()
        }
    }
}

class MemoryStorage : Storage {
    private var saved: List<String> = listOf()

    override fun save(lines: List<String>) {
        saved = lines
    }

    override fun load(): List<String> = saved
}

sealed interface BudgetStatus
object NoLimit : BudgetStatus
class Within(val left: Int) : BudgetStatus
class Over(val amount: Int) : BudgetStatus

class Budget(private val limits: Map<Category, Int>) {
    fun status(category: Category, spent: Int): BudgetStatus {
        val limit = limits[category]
        if (limit == null) return NoLimit
        if (spent > limit) return Over(spent - limit)
        return Within(limit - spent)
    }
}

fun describe(status: BudgetStatus): String = when (status) {
    NoLimit -> "no limit"
    is Within -> "\${status.left} left"
    is Over -> "OVER by \${status.amount}"
}

fun printReport(expenses: List<Expense>, budget: Budget) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) {
            val status = budget.status(category, spent)
            println("$category: $spent (\${describe(status)})")
        }
    }
    println("Total: \${expenses.total()}")
}

fun main() {
    val budget = Budget(mapOf(Category.FOOD to 200, Category.FUN to 100))
    val tracker = Tracker()
    // Stands in for what someone types.
    enter(tracker, listOf("800 rent", "12 food lunch with Sam", "90 fun concert", "40 fun cinema"))
    printReport(tracker.all(), budget)
}`,
        remember: 'Budget looks up the limit and answers NoLimit, Within(left) or Over(amount); describe handles all three with no else.',
        mistakes: [
          { title: 'Over at exactly the limit', bad: `if (spent >= limit) return Over(spent - limit)
// 200 of 200: "OVER by 0"`, good: `if (spent > limit) return Over(spent - limit)
// 200 of 200: "0 left"`, why: 'Spending exactly your limit is still within it. Only more than the limit is over.' },
        ],
        terms: [
          { term: 'Map<Category, Int>', def: 'The type of a map whose keys are categories and whose values are <code>Int</code>s.' },
          { term: 'validation', def: 'Checking values against rules: is this line a real expense, is this spending within its limit.' },
          { term: 'budget limit', def: 'The most you plan to spend in one category.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the rule: no limit, over, or within.', code: `fun status(category: Category, spent: Int): BudgetStatus {
    val limit = limits[category]
    if (limit [[==]] null) return NoLimit
    if (spent > limit) return [[Over]](spent - limit)
    return Within(limit - spent)
}`, why: 'A missing key gives <code>null</code>, which means no limit. Spending more than the limit is <code>Over</code>.' },
          { type: 'bug', prompt: 'Spending 12 of a 200 limit prints <code>-188 left</code>. Tap the line.', code: `fun status(category: Category, spent: Int): BudgetStatus {
    val limit = limits[category]
    if (limit == null) return NoLimit
    if (spent > limit) return Over(spent - limit)
    return Within(spent - limit)
}`, bug: 4, fix: '    return Within(limit - spent)', why: 'What is left is the limit minus what you spent: 200 - 12 = 188.' },
        ],
        quiz: [
          { q: 'The limits map has no RENT key. What is <code>limits[Category.RENT]</code>?', options: ['<code>null</code>', '<code>0</code>', 'The program crashes'], a: 0, why: 'A missing key gives <code>null</code>. <code>status</code> turns that into <code>NoLimit</code>.' },
          { q: 'Why does the <code>when</code> in <code>describe</code> need no <code>else</code>?', options: ['<code>BudgetStatus</code> is sealed, so Kotlin knows all three kinds are handled', '<code>else</code> is not allowed with objects', 'Because it returns a String'], a: 0, why: 'All members of a sealed interface are known, so Kotlin can check that each has a branch.' },
          { q: 'You add <code>class Near(val left: Int) : BudgetStatus</code>. What happens?', options: ['<code>describe</code> stops compiling until it handles <code>Near</code>', 'Near statuses print nothing', 'Nothing changes'], a: 0, why: 'The <code>when</code> no longer covers every member, and Kotlin points you to it.' },
        ],
        docs: [['Sealed classes and interfaces', 'https://kotlinlang.org/docs/sealed-classes.html'], ['Map-specific operations', 'https://kotlinlang.org/docs/map-operations.html']],
      },

      // 7 tests ─────────────────────────────────────────────
      {
        id: 'tests',
        title: 'Testing it',
        tagline: 'Small checks that tell you, after every change, that the program still works.',
        goals: ['Write a check as a name plus a true or false answer', 'Check parsing, totals, budget rules and saving', 'Use a failing check to find a bug fast'],
        level: 'intermediate', introduces: [],
        refs: ['kotlin.functions', 'kotlin.data-classes', 'kotlin.lambdas', 'solid.dip'],
        body: `
<p>You change one line in <code>parseExpense</code> to make it “simpler”, and without noticing, notes with spaces stop working: a <em>regression</em>. You might find out weeks later. A <em>test</em> is a small piece of code that checks one thing the program must do, and says PASS or FAIL. Run all the tests after every change and you know at once.</p>
<p>Our tests are hand-made. <code>fun test(name: String, passed: Boolean): Boolean</code> prints PASS or FAIL with the name, and gives <code>passed</code> back. Each check compares what the code gives with what it should give, written by hand: <code>parseExpense("800 rent") == Expense(800, Category.RENT, "")</code>. Expense is a data class, so <code>==</code> compares the values. For a budget answer, <code>budget.status(Category.FOOD, 250) is Over</code> is <code>true</code> when the answer is an <code>Over</code>: the same <code>is</code> check you used in <code>when</code>.</p>
<p><code>runTests</code> puts every result in a list, and <code>results.count { it }</code> counts the ones that are <code>true</code>. The saving check uses <code>MemoryStorage</code>: save with one tracker, load into a new one, and compare the two lists. Two lists are <code>==</code> when they hold equal items in the same order. No file needed: the <code>Storage</code> interface from step 5 pays off again.</p>
<p>Keep each check small, and give it a name that says what it checks. When “reads a full line” fails, the name tells you where to look.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            panelTitle: 'Parts after step 7',
            predict: {
              q: 'Someone removes <code>limit = 3</code> from the <code>split</code> in <code>parseExpense</code>. Which check fails?',
              options: ['“reads a full line”: the note <code>lunch with Sam</code> gets lost', '“skips an unknown category”', 'None: everything still passes'],
              a: 0,
              why: 'Without the limit, <code>12 food lunch with Sam</code> splits into 5 parts, so the note is lost. “save then load” fails too, for the same reason.',
            },
            frames: [
              { panel: dia(7), out: 'PASS reads a full line\nPASS note is optional\nPASS skips a word as amount\nPASS skips an unknown category\nPASS skips zero', say: '<code>runTests()</code> runs each check in order. Each prints PASS or FAIL with its name.' },
              { out: 'PASS adds up one category\nPASS over the limit\nPASS no limit set\nPASS save then load\n9 of 9 checks passed', say: 'All 9 pass. <code>count { it }</code> counted the <code>true</code> results.' },
              { clear: true, say: 'Now someone changes <code>line.split(" ", limit = 3)</code> to <code>line.split(" ")</code>. It looks simpler. They run the tests again.' },
              { out: 'FAIL reads a full line\nPASS note is optional\nPASS skips a word as amount\nPASS skips an unknown category\nPASS skips zero', say: 'The very first check fails. Its name says where to look: reading a full line, note included.' },
              { out: 'PASS adds up one category\nPASS over the limit\nPASS no limit set\nFAIL save then load\n7 of 9 checks passed', say: '“save then load” fails too: the saved line <code>12 FOOD lunch with Sam</code> loses its note when read back.' },
              { clear: true, out: 'PASS reads a full line\nPASS note is optional\nPASS skips a word as amount\nPASS skips an unknown category\nPASS skips zero\nPASS adds up one category\nPASS over the limit\nPASS no limit set\nPASS save then load\n9 of 9 checks passed', say: 'Put <code>limit = 3</code> back, run again: 9 of 9. The bug never reached anyone.' },
            ],
          });
        },
        code: `fun test(name: String, passed: Boolean): Boolean {
    if (passed) println("PASS $name") else println("FAIL $name")
    return passed
}

fun runTests() {
    val lunch = Expense(12, Category.FOOD, "lunch with Sam")
    val budget = Budget(mapOf(Category.FOOD to 200))
    val results = listOf(
        test("reads a full line", parseExpense("12 food lunch with Sam") == lunch),
        test("skips an unknown category", parseExpense("5 snacks") == null),
        test("over the limit", budget.status(Category.FOOD, 250) is Over)
    )
    println("\${results.count { it }} of \${results.size} checks passed")
}
// PASS reads a full line
// PASS skips an unknown category
// PASS over the limit
// 3 of 3 checks passed`,
        play: `import java.io.File


enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses

    fun saveTo(storage: Storage) {
        storage.save(expenses.map { it.toLine() })
    }

    fun loadFrom(storage: Storage) {
        for (line in storage.load()) {
            val expense = parseExpense(line)
            if (expense != null) expenses.add(expense)
        }
    }
}

fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun enter(tracker: Tracker, typed: List<String>) {
    for (line in typed) {
        val expense = parseExpense(line)
        if (expense == null) {
            println("Skipped: $line")
        } else {
            tracker.add(expense)
            println("Added: $expense")
        }
    }
}

fun List<Expense>.total(): Int = map { it.amount }.sum()

fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun Expense.toLine(): String = "$amount $category $note"

interface Storage {
    fun save(lines: List<String>)
    fun load(): List<String>
}

class FileStorage(private val path: String) : Storage {
    override fun save(lines: List<String>) {
        var text = ""
        for (line in lines) {
            text += line + "\\n"   // inside quotes, \\n means "new line"
        }
        File(path).writeText(text)
    }

    override fun load(): List<String> {
        try {
            return File(path).readLines()
        } catch (e: Exception) {
            return listOf()
        }
    }
}

class MemoryStorage : Storage {
    private var saved: List<String> = listOf()

    override fun save(lines: List<String>) {
        saved = lines
    }

    override fun load(): List<String> = saved
}

sealed interface BudgetStatus
object NoLimit : BudgetStatus
class Within(val left: Int) : BudgetStatus
class Over(val amount: Int) : BudgetStatus

class Budget(private val limits: Map<Category, Int>) {
    fun status(category: Category, spent: Int): BudgetStatus {
        val limit = limits[category]
        if (limit == null) return NoLimit
        if (spent > limit) return Over(spent - limit)
        return Within(limit - spent)
    }
}

fun describe(status: BudgetStatus): String = when (status) {
    NoLimit -> "no limit"
    is Within -> "\${status.left} left"
    is Over -> "OVER by \${status.amount}"
}

fun printReport(expenses: List<Expense>, budget: Budget) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) {
            val status = budget.status(category, spent)
            println("$category: $spent (\${describe(status)})")
        }
    }
    println("Total: \${expenses.total()}")
}

fun test(name: String, passed: Boolean): Boolean {
    if (passed) println("PASS $name") else println("FAIL $name")
    return passed
}

fun runTests() {
    val lunch = Expense(12, Category.FOOD, "lunch with Sam")
    val rent = Expense(800, Category.RENT, "")
    val tea = Expense(3, Category.FOOD, "tea")
    val budget = Budget(mapOf(Category.FOOD to 200))

    val storage = MemoryStorage()
    val before = Tracker()
    before.add(lunch)
    before.add(rent)
    before.saveTo(storage)
    val after = Tracker()
    after.loadFrom(storage)

    val results = listOf(
        test("reads a full line", parseExpense("12 food lunch with Sam") == lunch),
        test("note is optional", parseExpense("800 rent") == rent),
        test("skips a word as amount", parseExpense("abc food") == null),
        test("skips an unknown category", parseExpense("5 snacks") == null),
        test("skips zero", parseExpense("0 food") == null),
        test("adds up one category", listOf(lunch, rent, tea).totalFor(Category.FOOD) == 15),
        test("over the limit", budget.status(Category.FOOD, 250) is Over),
        test("no limit set", budget.status(Category.RENT, 800) == NoLimit),
        test("save then load", after.all() == before.all())
    )
    println("\${results.count { it }} of \${results.size} checks passed")
}

fun main() {
    runTests()
}`,
        remember: 'A test compares what the code gives with a value you wrote by hand; run them all after every change.',
        mistakes: [
          { title: 'A check that can’t fail', bad: 'test("reads a line", parseExpense("12 food lunch") == parseExpense("12 food lunch"))', good: 'test("reads a line", parseExpense("12 food lunch") == Expense(12, Category.FOOD, "lunch"))', why: 'Comparing the code with itself always passes, even when it is wrong. Write the expected value by hand.' },
        ],
        terms: [
          { term: 'test', def: 'A small piece of code that checks one thing the program must do and reports PASS or FAIL.' },
          { term: 'expected value', def: 'What the result should be, written by hand in the test.' },
          { term: 'regression', def: 'A bug in something that used to work. Running the tests after each change catches it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the test helper, then check that a zero amount is skipped.', code: `fun test(name: String, passed: Boolean): Boolean {
    if (passed) println("PASS $name") else println("FAIL $name")
    [[return]] passed
}

test("skips zero", parseExpense("0 food") [[==]] null)`, why: 'The helper gives back <code>passed</code> so <code>runTests</code> can count it. A skipped line means <code>parseExpense</code> gives <code>null</code>.' },
          { type: 'bug', prompt: 'This check prints FAIL, but <code>totalFor</code> is right. The test itself is wrong. Tap the line.', code: `val lunch = Expense(12, Category.FOOD, "lunch")
val tea = Expense(3, Category.FOOD, "tea")
val rent = Expense(800, Category.RENT, "")
test("adds up one category", listOf(lunch, tea, rent).totalFor(Category.FOOD) == 815)`, bug: 3, fix: 'test("adds up one category", listOf(lunch, tea, rent).totalFor(Category.FOOD) == 15)', why: 'Only the two FOOD expenses count: 12 + 3 = 15. Tests can have bugs too, so work out the expected value carefully.' },
        ],
        quiz: [
          { q: 'Why can a test write <code>parseExpense("800 rent") == Expense(800, Category.RENT, "")</code>?', options: ['Expense is a data class, so <code>==</code> compares the values', 'Kotlin compares any two objects by their values', 'Because the note is empty'], a: 0, why: 'A data class gets <code>equals</code>, so two expenses with the same values are equal.' },
          { q: 'Why does the saving check use <code>MemoryStorage</code>?', options: ['It keeps the <code>Storage</code> promise without a file, so the check runs anywhere, in Run it too', 'Files can’t be tested', 'It is faster to type'], a: 0, why: 'The tracker only needs a <code>Storage</code>. Any class that keeps the promise can stand in.' },
          { q: 'When should you run the tests?', options: ['After every change', 'Once, when the project is done', 'Only when something looks broken'], a: 0, why: 'Then a failing check points at the change you just made.' },
        ],
        docs: [['Fundamentals of testing Android apps', 'https://developer.android.com/training/testing/fundamentals']],
      },

      // 8 recap ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'Putting it together',
        tagline: 'The whole program in one file, one run from start to finish, and what to build next.',
        goals: ['Say what each part of the program does', 'Follow one run from typed lines to the saved file', 'Pick a next feature and plan it as one small step'],
        level: 'intermediate', introduces: [],
        refs: ['capkotlin.plan', 'solid.srp', 'oop.cohesion-coupling', 'git.commits'],
        body: `
<p>You started with six requirements, and each one now has code. <code>Expense</code> and <code>Category</code> describe the data. <code>parseExpense</code> reads typed lines and skips bad ones. <code>totalFor</code> and <code>printReport</code> answer “how much”. <code>Storage</code> keeps expenses between runs. <code>Budget</code> warns when you go over. <code>runTests</code> checks it all.</p>
<p>The only new piece is <code>runOnce</code>. Here is one run, <em>end to end</em>: it makes the budget and an empty tracker, loads what was saved, enters the new lines, prints the report and saves. <code>main</code> calls it twice with the same storage, like opening the program on Monday and again on Friday. Each part does one job, which is why every step could add code without breaking the others.</p>
<p>On a computer with Android Studio (you install it in Stage 4), replace <code>MemoryStorage()</code> with <code>FileStorage("expenses.txt")</code>, and your expenses survive between real runs. Then call <code>runOnce</code> once per run, with the lines you want to add: the next run starts from what was saved. If <code>main</code> still called it twice, every run would load the file and add Monday’s lines again. And there is plenty to add: a date for each expense, amounts with cents (store 1250 for 12.50), a way to remove a mistake. Treat each one like this project: write it as a requirement, add a check to <code>runTests</code>, write the code, run the tests, and commit if the project is on your computer.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            panelTitle: 'The finished program',
            predict: {
              q: 'On Friday someone enters <code>90 fun concert</code> and <code>40 fun cinema</code>. The FUN limit is 100. What does the report say for FUN?',
              options: ['<code>FUN: 130 (OVER by 30)</code>', '<code>FUN: 40 (60 left)</code>', '<code>FUN: 130 (30 left)</code>'],
              a: 0,
              why: 'Both lines are added: 90 + 40 = 130. That is 30 more than the limit, so <code>Budget</code> answers <code>Over(30)</code>.',
            },
            frames: [
              { panel: dia(8), out: '--- Monday ---', say: '<code>main</code> calls <code>runOnce</code> for Monday. The storage is empty, so the tracker starts with nothing.' },
              { out: 'Added: Expense(amount=800, category=RENT, note=)\nAdded: Expense(amount=12, category=FOOD, note=lunch with Sam)\nSkipped: abc food', say: '<code>enter</code> sends each line through <code>parseExpense</code>. The bad one is skipped.' },
              { out: 'FOOD: 12 (188 left)\nRENT: 800 (no limit)\nTotal: 812', say: '<code>printReport</code> uses <code>totalFor</code> for the numbers and <code>Budget</code> for the words in brackets. Then <code>saveTo</code> stores the two expenses.' },
              { out: '--- Friday ---', say: 'A second <code>runOnce</code> with the same storage: a new tracker loads Monday’s two expenses first.' },
              { out: 'Added: Expense(amount=90, category=FUN, note=concert)\nAdded: Expense(amount=40, category=FUN, note=cinema)\nSkipped: 5 snacks', say: 'Two new expenses. <code>snacks</code> is not a category, so that line is skipped.' },
              { out: 'FOOD: 12 (188 left)\nRENT: 800 (no limit)\nFUN: 130 (OVER by 30)\nTotal: 942', say: 'Monday’s expenses are back, and FUN is over its limit. Every requirement from the plan, in one run.' },
            ],
          });
        },
        code: `fun runOnce(storage: Storage, typed: List<String>) {
    val budget = Budget(mapOf(Category.FOOD to 200, Category.FUN to 100))
    val tracker = Tracker()
    tracker.loadFrom(storage)
    enter(tracker, typed)
    printReport(tracker.all(), budget)
    tracker.saveTo(storage)
}

fun main() {
    // runTests()   // remove the // at the start to run the checks from step 7 first
    // The Run it editor can't use files. On your own computer, use FileStorage("expenses.txt")
    // and call runOnce once per real run: the next run starts from what was saved.
    val storage = MemoryStorage()
    println("--- Monday ---")
    runOnce(storage, listOf("800 rent", "12 food lunch with Sam", "abc food"))
    println("--- Friday ---")
    runOnce(storage, listOf("90 fun concert", "40 fun cinema", "5 snacks"))
}`,
        play: `import java.io.File


enum class Category { FOOD, RENT, TRAVEL, FUN, OTHER }

data class Expense(val amount: Int, val category: Category, val note: String)

class Tracker {
    private val expenses = mutableListOf<Expense>()

    fun add(expense: Expense) {
        expenses.add(expense)
    }

    fun all(): List<Expense> = expenses

    fun saveTo(storage: Storage) {
        storage.save(expenses.map { it.toLine() })
    }

    fun loadFrom(storage: Storage) {
        for (line in storage.load()) {
            val expense = parseExpense(line)
            if (expense != null) expenses.add(expense)
        }
    }
}

fun parseCategory(word: String): Category? = when (word.lowercase()) {
    "food" -> Category.FOOD
    "rent" -> Category.RENT
    "travel" -> Category.TRAVEL
    "fun" -> Category.FUN
    "other" -> Category.OTHER
    else -> null
}

fun parseExpense(line: String): Expense? {
    val parts = line.split(" ", limit = 3)
    if (parts.size < 2) return null
    val amount = parts[0].toIntOrNull()
    val category = parseCategory(parts[1])
    if (amount == null || category == null) return null
    if (amount <= 0) return null
    val note = if (parts.size == 3) parts[2] else ""
    return Expense(amount, category, note)
}

fun enter(tracker: Tracker, typed: List<String>) {
    for (line in typed) {
        val expense = parseExpense(line)
        if (expense == null) {
            println("Skipped: $line")
        } else {
            tracker.add(expense)
            println("Added: $expense")
        }
    }
}

fun List<Expense>.total(): Int = map { it.amount }.sum()

fun List<Expense>.totalFor(category: Category): Int =
    filter { it.category == category }.map { it.amount }.sum()

fun Expense.toLine(): String = "$amount $category $note"

interface Storage {
    fun save(lines: List<String>)
    fun load(): List<String>
}

class FileStorage(private val path: String) : Storage {
    override fun save(lines: List<String>) {
        var text = ""
        for (line in lines) {
            text += line + "\\n"   // inside quotes, \\n means "new line"
        }
        File(path).writeText(text)
    }

    override fun load(): List<String> {
        try {
            return File(path).readLines()
        } catch (e: Exception) {
            return listOf()
        }
    }
}

class MemoryStorage : Storage {
    private var saved: List<String> = listOf()

    override fun save(lines: List<String>) {
        saved = lines
    }

    override fun load(): List<String> = saved
}

sealed interface BudgetStatus
object NoLimit : BudgetStatus
class Within(val left: Int) : BudgetStatus
class Over(val amount: Int) : BudgetStatus

class Budget(private val limits: Map<Category, Int>) {
    fun status(category: Category, spent: Int): BudgetStatus {
        val limit = limits[category]
        if (limit == null) return NoLimit
        if (spent > limit) return Over(spent - limit)
        return Within(limit - spent)
    }
}

fun describe(status: BudgetStatus): String = when (status) {
    NoLimit -> "no limit"
    is Within -> "\${status.left} left"
    is Over -> "OVER by \${status.amount}"
}

fun printReport(expenses: List<Expense>, budget: Budget) {
    for (category in Category.entries) {
        val spent = expenses.totalFor(category)
        if (spent > 0) {
            val status = budget.status(category, spent)
            println("$category: $spent (\${describe(status)})")
        }
    }
    println("Total: \${expenses.total()}")
}

fun test(name: String, passed: Boolean): Boolean {
    if (passed) println("PASS $name") else println("FAIL $name")
    return passed
}

fun runTests() {
    val lunch = Expense(12, Category.FOOD, "lunch with Sam")
    val rent = Expense(800, Category.RENT, "")
    val tea = Expense(3, Category.FOOD, "tea")
    val budget = Budget(mapOf(Category.FOOD to 200))

    val storage = MemoryStorage()
    val before = Tracker()
    before.add(lunch)
    before.add(rent)
    before.saveTo(storage)
    val after = Tracker()
    after.loadFrom(storage)

    val results = listOf(
        test("reads a full line", parseExpense("12 food lunch with Sam") == lunch),
        test("note is optional", parseExpense("800 rent") == rent),
        test("skips a word as amount", parseExpense("abc food") == null),
        test("skips an unknown category", parseExpense("5 snacks") == null),
        test("skips zero", parseExpense("0 food") == null),
        test("adds up one category", listOf(lunch, rent, tea).totalFor(Category.FOOD) == 15),
        test("over the limit", budget.status(Category.FOOD, 250) is Over),
        test("no limit set", budget.status(Category.RENT, 800) == NoLimit),
        test("save then load", after.all() == before.all())
    )
    println("\${results.count { it }} of \${results.size} checks passed")
}

fun runOnce(storage: Storage, typed: List<String>) {
    val budget = Budget(mapOf(Category.FOOD to 200, Category.FUN to 100))
    val tracker = Tracker()
    tracker.loadFrom(storage)
    enter(tracker, typed)
    printReport(tracker.all(), budget)
    tracker.saveTo(storage)
}

fun main() {
    // runTests()   // remove the // at the start to run the checks from step 7 first
    // The Run it editor can't use files. On your own computer, use FileStorage("expenses.txt")
    // and call runOnce once per real run: the next run starts from what was saved.
    val storage = MemoryStorage()
    println("--- Monday ---")
    runOnce(storage, listOf("800 rent", "12 food lunch with Sam", "abc food"))
    println("--- Friday ---")
    runOnce(storage, listOf("90 fun concert", "40 fun cinema", "5 snacks"))
}`,
        remember: 'Each part does one job: model, parse, report, store, rules, tests. runOnce wires them into one run.',
        terms: [
          { term: 'feature', def: 'Something new the program can do, like dates or cents. Add each one as its own small step.' },
          { term: 'end to end', def: 'Following one run through every part, from the typed lines to the saved file.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'One run: load what was saved, enter the new lines, report, then save.', code: `fun runOnce(storage: Storage, typed: List<String>) {
    val budget = Budget(mapOf(Category.FOOD to 200, Category.FUN to 100))
    val tracker = Tracker()
    tracker.[[loadFrom]](storage)
    enter(tracker, typed)
    printReport(tracker.all(), budget)
    tracker.[[saveTo]](storage)
}`, why: 'Load first, so old expenses are counted. Save last, so the new ones are kept for next time.' },
          { type: 'bug', prompt: 'Friday’s report shows only FUN: Monday’s expenses are gone. Tap the line.', code: `fun main() {
    val storage = MemoryStorage()
    runOnce(storage, listOf("800 rent", "12 food lunch with Sam"))
    runOnce(MemoryStorage(), listOf("90 fun concert"))
}`, bug: 3, fix: '    runOnce(storage, listOf("90 fun concert"))', why: 'A new <code>MemoryStorage()</code> is empty. Friday must use the same storage Monday saved to.' },
        ],
        quiz: [
          { q: 'Which part decides that FUN is over its limit?', options: ['<code>Budget</code>', '<code>printReport</code>', '<code>parseExpense</code>'], a: 0, why: '<code>Budget.status</code> holds the rule. <code>printReport</code> only prints what it answers.' },
          { q: 'Later you want to keep expenses in a database. What has to change?', options: ['Add a new class that implements <code>Storage</code>; the tracker stays the same', 'Rewrite <code>Tracker</code>', 'Change <code>Expense</code>'], a: 0, why: 'The tracker depends only on the <code>Storage</code> promise, so a new kind of storage plugs in.' },
          { q: 'You want to add dates. What is a good first move?', options: ['Write it as a requirement and add a check for it to <code>runTests</code>', 'Rewrite the whole program at once', 'Delete the tests, since they will fail'], a: 0, why: 'A small, checkable step, the same way the whole project was built.' },
        ],
        docs: [['Kotlin documentation', 'https://kotlinlang.org/docs/home.html'], ['Android Basics with Compose', 'https://developer.android.com/courses/android-basics-compose/course']],
      },
    ],
  });
})();
