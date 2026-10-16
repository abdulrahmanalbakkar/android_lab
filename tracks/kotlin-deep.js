/* Kotlin, deeper. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed kd-. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = (el, rows) => el.replaceChildren(...rows.map(r => h('div', { class: 'kd-line' + (r.cls ? ' ' + r.cls : ''), html: `<span class="kd-src">${hl(r.src)}</span>` + (r.note ? `  <span class="${r.noteCls || 'muted'}">${esc(r.note)}</span>` : '') })));

  const css = `
.kd-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 14px; min-width: 0; }
.kd-card { display: grid; gap: 10px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.kd-label { font: 600 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.kd-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; min-width: 0; }
.kd-tag { font: 600 0.85rem var(--mono); background: var(--code-bg); color: var(--code-ink); padding: 4px 10px; border-radius: 7px; max-width: 100%; overflow-x: auto; white-space: nowrap; }
.kd-slot { display: grid; place-items: center; min-height: 58px; min-width: min(160px, 100%); padding: 6px; background: var(--sunk); border-radius: 10px; overflow: hidden; }
.kd-slot > * { grid-area: 1 / 1; }
.kd-slot .chip { font-size: 0.88rem; }
.kd-ghost { border-style: dashed; color: var(--muted); border-color: var(--muted); }
.kd-line { min-height: 1.6em; border-radius: 5px; padding: 0 4px; transition: background 0.25s, opacity 0.25s; }
.kd-line.kd-off { opacity: 0.55; }
.kd-line.kd-off .kd-src { text-decoration: line-through; }
.kd-line.kd-new { background: rgba(158, 223, 165, 0.16); }
.kd-line.kd-warn { background: rgba(255, 138, 155, 0.2); }
.kd-line.kd-flash { animation: kd-flash 0.45s ease-out; }
@keyframes kd-flash { from { background: rgba(255, 212, 121, 0.3); } }
.kd-count { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.kd-hit { border-color: var(--accent) !important; box-shadow: 0 0 0 4px var(--accent-soft); }
.kd-spin { width: 30px; height: 30px; border-radius: 50%; border: 4px solid var(--surface); border-top-color: var(--accent); animation: kd-spin 0.7s linear infinite; }
@keyframes kd-spin { to { transform: rotate(360deg); } }

/* 1 variance */
.kd-var { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: center; }
.kd-ladder { display: grid; gap: 4px; justify-items: center; }
.kd-type { font: 600 0.9rem var(--mono); padding: 6px 16px; border-radius: 999px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.25s, color 0.25s, border-color 0.25s; }
.kd-type.kd-ok { border-color: var(--ok); background: var(--ok-soft); color: var(--ok); }
.kd-type.kd-want { outline: 2px dashed var(--accent); outline-offset: 3px; }
.kd-up { font: 500 0.72rem var(--mono); color: var(--muted); }
.kd-target { display: grid; gap: 10px; justify-items: center; padding: 14px; border-radius: 14px; border: 2px solid var(--accent); background: var(--surface); min-width: 0; max-width: 100%; }

/* 2 delegation */
.kd-log { display: grid; gap: 4px; min-height: 30px; }
.kd-log-line { font: 500 0.78rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); padding: 4px 8px; border-radius: 7px; overflow-x: auto; white-space: nowrap; }
.kd-pill { font: 600 0.68rem var(--mono); padding: 1px 6px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; }
.kd-pill.kd-yes { background: var(--ok); color: var(--accent-ink); }
.kd-pill.kd-no { background: var(--sunk); color: var(--muted); }
.kd-fwd { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.kd-node { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 500 0.8rem var(--mono); min-width: 0; transition: border-color 0.2s, box-shadow 0.2s; }
.kd-node b { font-weight: 700; }

/* 3 inline */
.kd-heap { display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; min-height: 64px; padding: 10px; border-radius: 12px; border: 2px dashed var(--line); background: var(--surface); }
.kd-obj { font: 600 0.78rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--warm-soft); color: var(--warm); border: 1px solid var(--warm); }
.kd-empty { font-size: 0.85rem; color: var(--muted); }

/* 4 DSL */
.kd-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; min-width: 0; }
.phone.kd-phone { justify-content: flex-start; align-items: stretch; gap: 5px; height: 300px; }
.kd-sec { font: 700 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); margin-top: 6px; }
.kd-sec.kd-leak { color: var(--err); }
.kd-tog { display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 8px; background: var(--sunk); font-size: 0.84rem; font-weight: 700; }
.kd-tog i { flex: none; position: relative; width: 28px; height: 16px; border-radius: 99px; background: var(--accent); }
.kd-tog i::after { content: ""; position: absolute; right: 2px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--surface); }
.kd-none { font-size: 0.8rem; color: var(--muted); }

/* 5 value classes */
.kd-mem { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; min-height: 120px; padding: 14px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; }
.kd-raw { display: grid; gap: 4px; justify-items: center; }
.kd-boxed { display: grid; gap: 6px; justify-items: center; padding: 8px 12px; border-radius: 12px; border: 2px dashed var(--warm); background: var(--warm-soft); }
.kd-boxed .kd-label { color: var(--warm); }

/* 6 sequences */
.kd-seq { display: grid; grid-template-columns: 70px repeat(6, minmax(0, 1fr)); gap: 6px; min-width: 0; }
.kd-rowname { font: 600 0.74rem var(--mono); color: var(--muted); align-self: center; overflow-wrap: anywhere; }
.kd-cell { height: 38px; display: grid; place-items: center; border-radius: 8px; background: var(--sunk); border: 2px solid transparent; font: 600 0.84rem var(--mono); color: var(--muted); min-width: 0; transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.kd-cell.kd-val { background: var(--surface); color: var(--ink); border-color: var(--line); }
.kd-cell.kd-hot { background: var(--accent-soft); border-color: var(--accent); color: var(--ink); }
.kd-cell.kd-keep { background: var(--ok-soft); border-color: var(--ok); color: var(--ok); }
.kd-cell.kd-drop { background: var(--err-soft); color: var(--err); text-decoration: line-through; }
.kd-cell.kd-idle { opacity: 0.35; }
.kd-stats { display: flex; flex-wrap: wrap; gap: 8px; }
.kd-stat { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--ink); font-variant-numeric: tabular-nums; }

/* 7 errors */
.kd-pipe { display: flex; flex-wrap: wrap; gap: 26px; justify-content: center; padding: 16px 10px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; }
.kd-st { position: relative; display: grid; gap: 8px; justify-items: center; align-content: start; width: 106px; padding: 10px 6px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-height: 96px; transition: border-color 0.2s, opacity 0.2s; }
.kd-st:not(:last-child)::after { content: "→"; position: absolute; right: -20px; top: 34px; color: var(--muted); font-weight: 700; }
.kd-st-name { font: 600 0.72rem/1.3 var(--mono); color: var(--muted); text-align: center; overflow-wrap: anywhere; }
.kd-st.kd-on { border-color: var(--accent); }
.kd-st.kd-badst { border-color: var(--err); }
.kd-st.kd-skip { opacity: 0.4; }
.kd-tok { font: 600 0.7rem var(--mono); padding: 4px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); text-align: center; overflow-wrap: anywhere; }
.kd-tok.kd-err { background: var(--err); }
.kd-tok.kd-cancel { background: var(--sunk); color: var(--muted); outline: 2px dashed var(--muted); outline-offset: -2px; }
.kd-tok.kd-okk { background: var(--ok); }
.kd-job { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--ok-soft); color: var(--ok); }
.kd-job.kd-dead { background: var(--sunk); color: var(--muted); }
.kd-job.kd-zombie { background: var(--err-soft); color: var(--err); }

/* 8 operators */
.kd-plot { width: 100%; max-width: 260px; height: auto; }
.kd-plot .kd-g { stroke: var(--line); stroke-width: 0.03; }
.kd-plot .kd-ax { stroke: var(--muted); stroke-width: 0.05; }
.kd-plot line.kd-v { stroke-width: 0.14; stroke-linecap: round; }
.kd-plot .kd-a { stroke: var(--accent); fill: var(--accent); }
.kd-plot .kd-b { stroke: var(--warm); fill: var(--warm); }
.kd-plot .kd-r { stroke: var(--ok); fill: var(--ok); }
.kd-plot line.kd-anim { stroke-dasharray: 1; animation: kd-draw 0.6s ease-out both; }
.kd-plot circle { stroke-width: 0; }
.kd-plot text { fill: var(--ink); stroke: none; font-family: var(--mono); font-weight: 600; }
@keyframes kd-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.kd-parts { display: grid; gap: 10px; justify-items: center; min-width: 0; }

@media (max-width: 600px) { .kd-split { grid-template-columns: minmax(0, 1fr); } }
`;

  Lab.addTrack({
    id: 'kdeep',
    title: 'Kotlin, deeper',
    description: 'The language features behind idiomatic Kotlin libraries, from variance and delegates to DSLs and value classes.',
    group: 'Foundations', requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'variance',
        title: 'Generics and variance',
        tagline: 'When a Box<Cat> may stand in for a Box<Animal>.',
        level: 'advanced',
        body: `
<p>A generic class like <code>Box&lt;T&gt;</code> is invariant by default. A <code>Box&lt;Cat&gt;</code> is not a <code>Box&lt;Animal&gt;</code>, even though every cat is an animal. If it were, code holding the <code>Box&lt;Animal&gt;</code> could put a dog into your box of cats.</p>
<p>Mark <code>T</code> with <code>out</code> when the class only hands values out. Then a <code>Producer&lt;Cat&gt;</code> fits where a <code>Producer&lt;Animal&gt;</code> is expected. Mark it <code>in</code> when the class only takes values in. Then a <code>Consumer&lt;Animal&gt;</code> fits where a <code>Consumer&lt;Cat&gt;</code> is expected, because something that handles any animal can handle a cat.</p>
<p>Writing <code>out</code> or <code>in</code> on the class is declaration-site variance. Writing it on one use, like <code>MutableList&lt;out Number&gt;</code> in a parameter, is use-site variance. A star projection <code>List&lt;*&gt;</code> means a list of some unknown type: you read items as <code>Any?</code> and can't add any.</p>`,
        code: `open class Animal
class Cat : Animal()

interface Producer<out T> { fun get(): T }        // only returns T
interface Consumer<in T> { fun put(item: T) }     // only takes T

fun adopt(source: Producer<Animal>) = source.get()
fun feed(sink: Consumer<Cat>) = sink.put(Cat())

val catShelter = object : Producer<Cat> { override fun get() = Cat() }
val anyBowl = object : Consumer<Animal> { override fun put(item: Animal) {} }

adopt(catShelter)   // ok: out makes Producer covariant
feed(anyBowl)       // ok: in makes Consumer contravariant

// Use-site variance: MutableList is invariant, but this function only reads
fun total(values: MutableList<out Number>): Double = values.sumOf { it.toDouble() }

// Star projection: element type unknown, items read as Any?
fun describe(items: List<*>) = "\${items.size} items, first is \${items.firstOrNull()}"`,
        remember: 'out only produces T, so subtypes fit. in only consumes T, so supertypes fit.',
        terms: [
          { term: 'Variance', def: 'The rule for whether Box<Cat> can be used where Box<Animal> is expected, set with out, in, or neither.' },
          { term: 'out (covariance)', def: 'Marks a type parameter that is only returned, so a Box<Sub> can be used as a Box<Super>.' },
          { term: 'in (contravariance)', def: 'Marks a type parameter that is only accepted as input, so a Box<Super> can be used as a Box<Sub>.' },
          { term: 'Star projection', def: 'A type like List<*> whose type argument is unknown; you can read items as Any? but not write any.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make both assignments compile.', code: 'interface Source<[[out]] T> { fun next(): T }\ninterface Sink<[[in]] T> { fun send(item: T) }\n\nval s: Source<Animal> = catSource     // a Source<Cat>\nval k: Sink<Cat> = animalSink         // a Sink<Animal>', why: '<code>Source</code> only returns <code>T</code>, so it can be <code>out</code>. <code>Sink</code> only takes <code>T</code>, so it can be <code>in</code>.' },
          { type: 'bug', prompt: 'This interface won’t compile. Tap the line that breaks the variance rule.', code: 'interface Repository<out T> {\n    fun load(id: String): T\n    fun save(item: T)\n    fun all(): List<T>\n}', bug: 2, fix: '    // remove save(), or drop out and make T invariant', why: 'With <code>out T</code>, <code>T</code> may only appear in return positions. <code>save(item: T)</code> takes it as a parameter, which is an <code>in</code> position.' },
        ],
        quiz: [
          { q: 'Kotlin declares <code>List&lt;out E&gt;</code>. Can you pass a <code>List&lt;Cat&gt;</code> to <code>fun pet(all: List&lt;Animal&gt;)</code>?', options: ['Yes', 'No, you need a cast', 'Only if Cat is open'], a: 0, why: '<code>List</code> is read-only and covariant, so a list of cats is a list of animals.' },
          { q: 'Which interface can declare its parameter as <code>in T</code>?', options: ['One whose functions only take <code>T</code> as parameters', 'One whose functions only return <code>T</code>', 'One that both takes and returns <code>T</code>'], a: 0, why: '<code>in</code> means the type only flows in, like <code>Comparable&lt;in T&gt;</code>.' },
          { q: 'What can you do with a <code>MutableList&lt;*&gt;</code>?', options: ['Read items as <code>Any?</code>', 'Add any item', 'Nothing at all'], a: 0, why: 'The element type is unknown, so reads are typed <code>Any?</code> and writes are rejected.' },
        ],
        visual(el) {
          const TYPES = ['Any', 'Animal', 'Cat'];
          const MODES = {
            inv: { decl: 'class Box<T>', ok: ['Animal'], off: null, why: 'Box<T> is invariant, so only the exact type fits.' },
            out: { decl: 'class Box<out T>', ok: ['Animal', 'Cat'], off: 'put', why: 'out accepts subtypes only. Any is a supertype of Animal.' },
            in: { decl: 'class Box<in T>', ok: ['Any', 'Animal'], off: 'get', why: 'in accepts supertypes only. A Box<Cat> can’t take every Animal.' },
          };
          let mode = 'out', busy = false;
          const decl = h('div', { class: 'kt' });
          const typeEls = {};
          const ladder = h('div', { class: 'kd-ladder' });
          TYPES.forEach((t, i) => {
            if (i) ladder.append(h('span', { class: 'kd-up' }, `↑ ${t} is a ${TYPES[i - 1]}`));
            ladder.append(typeEls[t] = h('span', { class: 'kd-type' + (t === 'Animal' ? ' kd-want' : '') }, t));
          });
          const well = h('div', { class: 'kd-slot' }, h('span', { class: 'chip' }, 'Box<Animal>'));
          const target = h('div', { class: 'kd-target' }, h('span', { class: 'kd-tag', html: hl('val b: Box<Animal>') }), well, h('span', { class: 'kd-label' }, 'green types fit'));
          const o = out('');
          const modeBtns = Object.entries(MODES).map(([k, m]) => cmd(m.decl, () => { if (busy) return; mode = k; paint(); }));
          function paint() {
            const m = MODES[mode];
            press(modeBtns, modeBtns[Object.keys(MODES).indexOf(mode)]);
            lines(decl, [
              { src: m.decl + ' {' },
              { src: '    fun get(): T', cls: m.off === 'get' ? 'kd-off' : '', note: m.off === 'get' ? '✗ out position' : '', noteCls: 'bad' },
              { src: '    fun put(item: T)', cls: m.off === 'put' ? 'kd-off' : '', note: m.off === 'put' ? '✗ in position' : '', noteCls: 'bad' },
              { src: '}' },
            ]);
            TYPES.forEach(t => { typeEls[t].classList.toggle('kd-ok', m.ok.includes(t)); replay(typeEls[t], 'pop-soft'); });
            say(o, `${hl(m.decl)} <span class="muted">accepts</span> ${m.ok.map(t => hl(`Box<${t}>`)).join(', ')}`);
          }
          async function assign(t) {
            if (busy) return; busy = true;
            const m = MODES[mode];
            replay(typeEls[t], 'pop');
            if (m.ok.includes(t)) {
              swap(well, `Box<${t}>`);
              say(o, `<span class="good">ok:</span> ${hl(`val b: Box<Animal> = Box<${t}>()`)}`);
            } else {
              replay(target, 'shake');
              say(o, `<span class="bad">type mismatch:</span> expected ${hl('Box<Animal>')}, found ${hl(`Box<${t}>`)}<div class="line muted">${esc(m.why)}</div>`);
            }
            await sleep(450); busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'controls' }, modeBtns), decl,
            h('div', { class: 'stage kd-var' }, ladder, target),
            h('p', { class: 'tip' }, 'Assign a new box to b:'),
            h('div', { class: 'controls' }, TYPES.map(t => cmd(`b = Box<${t}>()`, () => assign(t)))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'delegation',
        title: 'Delegation',
        tagline: 'by hands the work to another object.',
        level: 'intermediate',
        body: `
<p>The <code>by</code> keyword hands a job to another object. In class delegation, <code>class CountingSet(inner) : MutableSet&lt;T&gt; by inner</code> makes the compiler write every interface method for you, each one forwarding to <code>inner</code>. You override only the ones you want to change.</p>
<p>Property delegation does the same for one property. Reads and writes go through the delegate's <code>getValue</code> and <code>setValue</code>. <code>by lazy { }</code> runs its block on the first read and caches the result, and it is thread-safe by default. <code>Delegates.observable</code> calls you back after every write with the old and the new value.</p>
<p>You already use one in Android. <code>val vm: ProfileViewModel by viewModels()</code> is a lazy delegate. It finds or creates the ViewModel the first time you touch <code>vm</code>, not when the Fragment is constructed.</p>`,
        code: `class CountingSet<T>(
    private val inner: MutableSet<T> = mutableSetOf(),
) : MutableSet<T> by inner {
    var attempts = 0
        private set

    override fun add(element: T): Boolean {
        attempts++
        return inner.add(element)   // size, contains, remove... forward to inner
    }
}

class ProfileFragment : Fragment(R.layout.profile) {
    private val vm: ProfileViewModel by viewModels()     // created on first access
    private val formatter by lazy { DateTimeFormatter.ofPattern("d MMM") }

    var filter: String by Delegates.observable("") { _, old, new ->
        if (old != new) vm.search(new)
    }
}`,
        remember: 'by hands the work to someone else. lazy runs once on first read; observable reports every write.',
        terms: [
          { term: 'Class delegation', def: 'Implementing an interface with by so the compiler forwards every method you don’t override to another object.' },
          { term: 'Property delegate', def: 'An object with getValue (and setValue for var) that handles reads and writes of a property declared with by.' },
          { term: 'by lazy', def: 'A delegate that runs its block on the first read, stores the result, and returns it on every later read.' },
          { term: 'Delegates.observable', def: 'A delegate that calls a callback with the property, old value and new value after every assignment.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the database only when something first reads <code>db</code>.', code: 'private val db [[by]] [[lazy]] {\n    Room.databaseBuilder(context, AppDb::class.java, "app.db").build()\n}', why: '<code>by lazy</code> defers the expensive build to the first access and then reuses the same instance.' },
          { type: 'bug', prompt: 'Come back to this Fragment from the back stack and the title stops updating. Tap the cause.', code: 'class ArticleFragment : Fragment(R.layout.article) {\n    private val vm: ArticleViewModel by viewModels()\n    private val title by lazy { requireView().findViewById<TextView>(R.id.title) }\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        vm.article.observe(viewLifecycleOwner) { title.text = it.headline }\n    }\n}', bug: 2, fix: '    // look the view up in onViewCreated: val title = view.findViewById<TextView>(R.id.title)', why: '<code>lazy</code> caches forever, but a Fragment outlives its view on the back stack. After the view is recreated, <code>title</code> still points at the old, destroyed TextView.' },
        ],
        quiz: [
          { q: '<code>val x by lazy { println("init"); 42 }</code>. You read <code>x</code> three times. How often does <code>init</code> print?', options: ['Once', 'Three times', 'Never'], a: 0, why: 'The block runs on the first read only. Later reads return the cached 42.' },
          { q: 'In <code>class A(b: B) : I by b</code>, what happens when you call a method of <code>I</code> that <code>A</code> doesn’t override?', options: ['It forwards to <code>b</code>', 'It throws', 'It does nothing'], a: 0, why: 'The compiler generates a forwarding method for every member of <code>I</code> you didn’t write yourself.' },
          { q: 'When does <code>by viewModels()</code> create or fetch the ViewModel?', options: ['When the Fragment is constructed', 'The first time the property is read', 'In <code>onDestroy</code>'], a: 1, why: 'It is a lazy delegate. That is why reading it before the Fragment is attached crashes.' },
        ],
        visual(el) {
          const o = out('Read the lazy value twice, then set the filter.');
          let busy = false;

          // lazy
          let made = null, runs = 0, reads = 0;
          const lazyWell = h('div', { class: 'kd-slot' }, h('span', { class: 'chip kd-ghost' }, 'not created'));
          const lazyCount = h('span', { class: 'kd-count' }, 'block ran 0 times · 0 reads');
          async function readLazy() {
            if (busy) return; busy = true; reads++;
            if (!made) {
              lazyWell.replaceChildren(h('span', { class: 'kd-spin' }));
              say(o, '<span class="muted">first read:</span> lazy runs the block...');
              await sleep(800); if (!el.isConnected) return;
              made = 'Formatter@3f2a'; runs++;
              lazyWell.replaceChildren(h('span', { class: 'chip drop-in' }, made));
              say(o, '<span class="good">created:</span> the block ran once and the result is cached');
            } else {
              replay(lazyWell.firstElementChild, 'pop');
              say(o, `<span class="good">read ${reads}:</span> same ${made}, block not run`);
            }
            lazyCount.textContent = `block ran ${runs} time${runs === 1 ? '' : 's'} · ${reads} read${reads === 1 ? '' : 's'}`;
            busy = false;
          }

          // observable
          let filter = '';
          const obsWell = h('div', { class: 'kd-slot' }, h('span', { class: 'chip' }, '""'));
          const log = h('div', { class: 'kd-log' });
          function setFilter(v) {
            const old = filter; filter = v; swap(obsWell, `"${v}"`);
            const ran = old !== v;
            log.prepend(h('div', { class: 'kd-log-line drop-in', html: `${hl(`"${old}" -> "${v}"`)} <span class="kd-pill ${ran ? 'kd-yes' : 'kd-no'}">${ran ? 'search' : 'same, skip'}</span>` }));
            while (log.children.length > 3) log.lastElementChild.remove();
            say(o, ran ? `<span class="good">callback:</span> old ${hl(`"${old}"`)}, new ${hl(`"${v}"`)}, so vm.search runs`
              : '<span class="muted">callback still fires,</span> but old == new, so the guard skips the search');
          }

          // class delegation
          let attempts = 0; const items = new Set(); let next = 0;
          const outer = h('div', { class: 'kd-node' }, h('b', {}, 'CountingSet'), h('span', {}, 'attempts = 0'));
          const inner = h('div', { class: 'kd-node' }, h('b', {}, 'inner'), h('span', {}, '{ }'));
          const paintSet = () => { outer.lastChild.textContent = `attempts = ${attempts}`; inner.lastChild.textContent = `{ ${[...items].join(', ')} }`; };
          const pulse = async node => { node.classList.add('kd-hit'); await sleep(380); node.classList.remove('kd-hit'); };
          async function add() {
            if (busy) return; busy = true;
            const v = '"' + 'aba'[next++ % 3] + '"';
            await pulse(outer); attempts++; paintSet();
            if (!el.isConnected) return;
            await pulse(inner); const added = !items.has(v); items.add(v); paintSet();
            say(o, `<span class="good">add(${esc(v)}):</span> your override counted it, then inner.add returned ${added}`);
            busy = false;
          }
          async function size() {
            if (busy) return; busy = true;
            await pulse(inner);
            say(o, `<span class="good">size = ${items.size}:</span> no override, so the generated method forwards to inner.size`);
            busy = false;
          }

          el.append(h('div', { class: 'kd-pair' },
            h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'by lazy'), h('span', { class: 'kd-tag', html: hl('val formatter by lazy { build() }') }), lazyWell, lazyCount,
              h('div', { class: 'controls' }, cmd('formatter.format(today)', readLazy))),
            h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'Delegates.observable'), h('span', { class: 'kd-tag', html: hl('var filter by observable("")') }), obsWell, log,
              h('div', { class: 'controls' }, ['kot', 'kotlin'].map(v => cmd(`filter = "${v}"`, () => setFilter(v))))),
            h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'class delegation'), h('span', { class: 'kd-tag', html: hl('MutableSet<T> by inner') }),
              h('div', { class: 'kd-fwd' }, outer, h('span', { class: 'arrow' }, '→'), inner),
              h('div', { class: 'controls' }, cmd('set.add(...)', add), cmd('set.size', size)))),
            h('p', { class: 'tip' }, 'Tap the same filter twice to see what observable does with an unchanged value.'),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'inline',
        title: 'inline and reified',
        tagline: 'Paste the lambda in place and keep T at runtime.',
        level: 'advanced',
        body: `
<p>A lambda you pass to a regular higher-order function becomes an object at runtime. If it captures local variables, a new object is created on every call. In a hot loop that is real garbage for the collector.</p>
<p>Mark the function <code>inline</code> and the compiler copies its body, and the lambda's body, into each call site. There is no function object and no extra call. It also allows a non-local <code>return</code>: inside <code>forEach { }</code>, <code>return</code> leaves the enclosing function, because the lambda's code really sits inside it.</p>
<p>Only inline functions can have <code>reified</code> type parameters. Then <code>T</code> is known at runtime, so <code>x is T</code> and <code>T::class</code> work. Use <code>noinline</code> for a lambda parameter you need to store or pass on. Use <code>crossinline</code> for one you call from inside another lambda or object, where a non-local return can't work.</p>`,
        code: `inline fun <T> measure(label: String, block: () -> T): T {
    val start = System.nanoTime()
    return block().also { Log.d("perf", "$label took \${System.nanoTime() - start} ns") }
}

inline fun <reified T : Parcelable> Bundle.parcelable(key: String): T? =
    BundleCompat.getParcelable(this, key, T::class.java)

fun hasAdmin(users: List<User>): Boolean {
    users.forEach { if (it.isAdmin) return true }   // non-local: leaves hasAdmin
    return false
}

inline fun View.onClick(crossinline action: () -> Unit) {
    setOnClickListener { action() }   // runs later, inside another object
}

val user = arguments?.parcelable<User>("user")`,
        remember: 'inline pastes the body at the call site: no lambda object, return works, and reified T survives to runtime.',
        terms: [
          { term: 'inline function', def: 'A function whose body, and the bodies of its lambda arguments, the compiler copies into every call site.' },
          { term: 'reified', def: 'A modifier for a type parameter of an inline function that keeps the real type available at runtime.' },
          { term: 'Non-local return', def: 'A bare return inside a lambda passed to an inline function, which returns from the enclosing function.' },
          { term: 'crossinline', def: 'Marks an inline lambda parameter that is called from another context, which forbids non-local returns in it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let callers write <code>intent.extra&lt;User&gt;("user")</code> without passing a class.', code: '[[inline]] fun <[[reified]] T : Parcelable> Intent.extra(key: String): T? =\n    IntentCompat.getParcelableExtra(this, key, T::class.java)', why: '<code>T::class</code> needs the real type at runtime, which only a <code>reified</code> parameter of an <code>inline</code> function has.' },
          { type: 'bug', prompt: 'This helper won’t compile. Tap the line to change.', code: 'inline fun debounceClick(view: View, action: () -> Unit) {\n    var last = 0L\n    view.setOnClickListener {\n        val now = SystemClock.elapsedRealtime()\n        if (now - last > 500) { last = now; action() }\n    }\n}', bug: 0, fix: 'inline fun debounceClick(view: View, crossinline action: () -> Unit) {', why: '<code>action</code> is called inside the click listener, a different object. An inlined lambda there could contain a non-local return, so Kotlin requires <code>crossinline</code>.' },
        ],
        quiz: [
          { q: 'Why can <code>return</code> inside <code>list.forEach { }</code> leave the enclosing function?', options: ['<code>forEach</code> is inline, so the lambda body is pasted into the function', 'Every Kotlin lambda can do that', 'It can’t; it only leaves the lambda'], a: 0, why: 'Non-local returns work only in lambdas passed to inline functions.' },
          { q: '<code>fun &lt;T&gt; isType(x: Any) = x is T</code> doesn’t compile. What fixes it?', options: ['<code>inline fun &lt;reified T&gt;</code>', '<code>crossinline</code>', '<code>@JvmStatic</code>'], a: 0, why: 'Generic types are erased at runtime. A reified parameter keeps the type at each inlined call site.' },
          { q: 'Your inline function stores its lambda parameter in a list for later. Which modifier does it need?', options: ['<code>noinline</code>', '<code>crossinline</code>', '<code>reified</code>'], a: 0, why: 'Storing a lambda needs a real function object, so it can’t be inlined.' },
        ],
        visual(el) {
          let inl = false, busy = false;
          const sw = h('input', { type: 'checkbox', id: 'kd-inline' });
          const decl = h('div', { class: 'kt' });
          const site = h('div', { class: 'kt' });
          const heap = h('div', { class: 'kd-heap' });
          const heapLbl = h('span', { class: 'kd-label' }, 'heap');
          const o = out('');
          const emptyHeap = () => heap.replaceChildren(h('span', { class: 'kd-empty' }, 'no lambda objects'));
          function paint() {
            lines(decl, [{ src: `${inl ? 'inline ' : ''}fun <T> measure(label: String, block: () -> T): T` }]);
            lines(site, inl
              ? [{ src: 'repeat(5) { i ->' }, { src: '    val start = System.nanoTime()', note: 'pasted' }, { src: '    draw(i)', note: 'lambda body, pasted' }, { src: '    Log.d("perf", ...)', note: 'pasted' }, { src: '}' }]
              : [{ src: 'repeat(5) { i ->' }, { src: '    measure("row", λ)', note: 'λ = new object capturing i' }, { src: '}' }]);
            heapLbl.textContent = 'heap';
            emptyHeap();
            say(o, inl ? 'inline: the call site holds the code itself. Run the loop.' : 'Not inline: each call gets a lambda object. Run the loop.');
          }
          sw.addEventListener('change', () => { if (busy) { sw.checked = inl; return; } inl = sw.checked; paint(); });
          async function loop() {
            if (busy) return; busy = true;
            emptyHeap(); let n = 0;
            const rows = [...site.children];
            for (let i = 0; i < 5; i++) {
              if (!el.isConnected) return;
              (inl ? rows.slice(1, 4) : [rows[1]]).forEach(r => replay(r, 'kd-flash'));
              if (!inl) {
                if (!n) heap.replaceChildren();
                heap.append(h('span', { class: 'kd-obj drop-in' }, `λ(i=${i})`)); n++;
              }
              heapLbl.textContent = `heap · ${n} lambda object${n === 1 ? '' : 's'}`;
              await sleep(380);
            }
            say(o, inl ? '<span class="good">5 calls, 0 allocations.</span> The body ran in place.' : `<span class="bad">5 calls, ${n} objects</span> for the garbage collector. A lambda that captures nothing is reused, but this one captures i.`);
            busy = false;
          }
          const ret = () => {
            if (inl) say(o, `<span class="good">ok:</span> ${hl('return true')} leaves hasAdmin(), because the lambda body sits inside it`);
            else { say(o, `<span class="bad">compile error:</span> 'return' is not allowed here <span class="muted">(each is not inline, so the lambda is a separate function)</span>`); replay(o, 'shake'); }
          };
          const reified = () => {
            if (inl) say(o, `<span class="good">ok:</span> ${hl('T::class')} is ${hl('User::class')} at this call site`);
            else { say(o, '<span class="bad">compile error:</span> Only type parameters of inline functions can be reified'); replay(o, 'shake'); }
          };
          paint();
          el.append(
            h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'kd-inline' }, sw, 'inline')),
            decl,
            h('div', { class: 'kd-split' }, site, h('div', { class: 'kd-card' }, heapLbl, heap)),
            h('div', { class: 'controls' },
              h('button', { class: 'btn primary small', onclick: loop }, 'Run the loop'),
              cmd('users.each { if (it.isAdmin) return true }', ret),
              cmd('decode<User>(json)', reified)),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'dsl',
        title: 'Lambdas with receivers and DSLs',
        tagline: 'T.() -> Unit turns a lambda into a little language.',
        level: 'advanced',
        body: `
<p>A lambda with receiver has a type like <code>StringBuilder.() -> Unit</code>. Inside it, <code>this</code> is the receiver, so you call its members without a prefix. <code>buildString { append("Hi") }</code> works this way, and so does <code>apply</code>.</p>
<p>Nest a few of these and you have a DSL. A builder function creates an object, runs your lambda on it, and returns the result. Gradle Kotlin scripts, <code>LazyColumn { items(...) }</code> in Compose and Ktor routing all use this pattern.</p>
<p>A nested lambda can see every outer receiver too, so you can call an outer builder's function by accident from deep inside. Annotate your builders with your own <code>@DslMarker</code> annotation and the compiler only lets you use the nearest receiver implicitly.</p>`,
        code: `@DslMarker annotation class SettingsDsl

@SettingsDsl class SettingsBuilder {
    private val sections = mutableListOf<Section>()
    fun section(title: String, block: SectionBuilder.() -> Unit) {
        sections += SectionBuilder(title).apply(block).build()
    }
    fun build() = Settings(sections)
}

@SettingsDsl class SectionBuilder(private val title: String) {
    private val rows = mutableListOf<String>()
    fun toggle(label: String) { rows += label }
    fun build() = Section(title, rows)
}

fun settings(block: SettingsBuilder.() -> Unit): Settings =
    SettingsBuilder().apply(block).build()

val screen = settings {
    section("Account") {
        toggle("Sync")       // this is SectionBuilder
        toggle("Backup")
    }
}`,
        remember: 'T.() -> Unit makes T the this of the lambda. @DslMarker stops outer receivers leaking in.',
        terms: [
          { term: 'Lambda with receiver', def: 'A lambda of type T.() -> R, where T is available as this inside the body.' },
          { term: 'DSL', def: 'A small domain-specific language built from nested builder functions that take lambdas with receivers.' },
          { term: '@DslMarker', def: 'A meta-annotation that stops implicit access to outer receivers marked with the same annotation.' },
          { term: 'buildString', def: 'A standard function that runs a StringBuilder.() -> Unit lambda and returns the built String.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>notification { title = "Hi" }</code> work.', code: 'fun notification(block: NotificationSpec.[[()]] -> Unit): NotificationSpec =\n    NotificationSpec().[[apply]](block)', why: '<code>NotificationSpec.() -> Unit</code> makes the spec <code>this</code> inside the lambda, and <code>apply</code> runs such a lambda on the object and returns it.' },
          { type: 'bug', prompt: 'The builder returns an empty <code>Body</code> every time. Tap the line.', code: '@DslMarker annotation class HtmlDsl\n@HtmlDsl class Ul { fun li(text: String) { /* ... */ } }\n@HtmlDsl class Body { fun ul(block: Ul.() -> Unit) = Ul().apply(block) }\nfun body(block: Body.() -> Unit) = Body().apply { block }', bug: 3, fix: 'fun body(block: Body.() -> Unit) = Body().apply(block)', why: '<code>apply { block }</code> only mentions the lambda as an unused value. It never invokes it. Pass it directly: <code>apply(block)</code>, or call <code>block()</code> inside.' },
        ],
        quiz: [
          { q: 'Inside <code>buildString { ... }</code>, what is <code>this</code>?', options: ['A <code>StringBuilder</code>', 'The finished <code>String</code>', 'The enclosing class'], a: 0, why: 'buildString takes a <code>StringBuilder.() -> Unit</code>, so the builder is the receiver.' },
          { q: 'What is the difference between <code>(T) -> Unit</code> and <code>T.() -> Unit</code>?', options: ['In the second, <code>T</code> is <code>this</code>, so you call its members without a prefix', 'The second runs on another thread', 'None, they are different spellings of one type'], a: 0, why: 'With a receiver you write <code>append("x")</code>; with a parameter you write <code>it.append("x")</code>.' },
          { q: 'What does <code>@DslMarker</code> change?', options: ['Calling an outer receiver of the same DSL implicitly becomes a compile error', 'The DSL runs faster', 'It generates the builder classes'], a: 0, why: 'You can still reach the outer one explicitly with <code>this@settings</code>.' },
        ],
        visual(el) {
          const NAMES = ['Account', 'Alerts', 'Storage'];
          const TOGS = ['Sync', 'Backup', 'Sound', 'Vibrate', 'Wi-Fi only', 'Badges'];
          let secs, nt, marker = false, fresh = null;
          const reset = () => { secs = [{ title: 'Account', rows: ['Sync'], leak: false, fromLeak: false }]; nt = 1; };
          const codeEl = h('div', { class: 'kt' });
          const phone = h('div', { class: 'phone kd-phone', 'aria-label': 'Settings screen preview' });
          const sw = h('input', { type: 'checkbox', id: 'kd-marker' });
          const o = out('Add rows. Then call section() from inside a section.');
          const written = () => secs.filter(s => !s.fromLeak);
          function paint() {
            const rows = [{ src: 'settings {' }];
            for (const s of written()) {
              rows.push({ src: `    section("${s.title}") {`, cls: fresh === s ? 'kd-new' : '' });
              s.rows.forEach((r, i) => rows.push({ src: `        toggle("${r}")`, cls: fresh === s.rows && i === s.rows.length - 1 ? 'kd-new' : '' }));
              if (s.leak) rows.push({ src: '        section("Oops") { }', cls: 'kd-warn', note: 'outer this' });
              rows.push({ src: '    }' });
            }
            rows.push({ src: '}' });
            lines(codeEl, rows);
            phone.replaceChildren(...secs.flatMap(s => [
              h('div', { class: 'kd-sec' + (s.fromLeak ? ' kd-leak' : '') + (fresh === s ? ' drop-in' : '') }, s.title),
              ...(s.rows.length ? s.rows.map((r, i) => h('div', { class: 'kd-tog' + (fresh === s.rows && i === s.rows.length - 1 ? ' drop-in' : '') }, r, h('i'))) : [h('div', { class: 'kd-none' }, 'empty section')]),
            ]));
            fresh = null;
          }
          const last = () => written()[written().length - 1];
          function addSection() {
            if (written().length >= NAMES.length) { say(o, 'That’s enough sections. Press Reset to start over.'); return; }
            const s = { title: NAMES[written().length], rows: [], leak: false, fromLeak: false };
            secs.push(s); fresh = s; paint();
            say(o, `${hl(`section("${s.title}") { }`)} <span class="muted">resolves on</span> ${hl('this: SettingsBuilder')}`);
          }
          function addToggle() {
            const s = last();
            if (s.rows.length >= 3) { say(o, 'This section is full. Add a new section first.'); return; }
            const t = TOGS[nt++ % TOGS.length];
            s.rows.push(t); fresh = s.rows; paint();
            say(o, `${hl(`toggle("${t}")`)} <span class="muted">resolves on</span> ${hl(`this: SectionBuilder("${s.title}")`)}`);
          }
          function leak() {
            const s = last();
            if (marker) {
              replay(codeEl, 'shake');
              say(o, `<span class="bad">compile error:</span> 'fun section(...)' can't be called in this context by implicit receiver. Use the explicit one if necessary`);
              return;
            }
            if (s.leak) { say(o, 'Already there. Turn on @DslMarker to see the compiler catch it.'); return; }
            s.leak = true;
            const leaked = { title: 'Oops', rows: [], leak: false, fromLeak: true };
            secs.push(leaked); fresh = leaked; paint();
            say(o, `<span class="bad">compiles, but wrong:</span> SectionBuilder has no section(), so Kotlin used the outer SettingsBuilder. "Oops" became a top-level section.`);
          }
          sw.addEventListener('change', () => {
            marker = sw.checked;
            const had = secs.some(s => s.fromLeak);
            if (marker && had) { secs = secs.filter(s => !s.fromLeak); secs.forEach(s => { s.leak = false; }); paint(); }
            say(o, marker ? `@DslMarker on: only the nearest receiver is implicit.${had ? ' The Oops line no longer compiles, so it is gone.' : ''}` : '@DslMarker off: every outer receiver is visible inside nested blocks.');
          });
          reset(); paint();
          el.append(
            h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'kd-marker' }, sw, '@DslMarker on both builders')),
            h('div', { class: 'kd-split' }, codeEl, phone),
            h('div', { class: 'controls' }, cmd('section("...") { }', addSection), cmd('toggle("...")', addToggle), cmd('section("Oops") { }  // inside a section', leak)),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'value',
        title: 'Value classes',
        tagline: 'A new type at compile time, the bare value at runtime.',
        level: 'intermediate',
        body: `
<p>A function like <code>refund(orderId: String, userId: String)</code> can't stop you from passing the arguments the wrong way round. A <code>typealias</code> doesn't help, because it is only another name for <code>String</code>. Wrapping each id in a regular class does help, but costs an object per value.</p>
<p><code>@JvmInline value class UserId(val raw: String)</code> is a distinct type for the compiler. At runtime the compiler uses the underlying <code>String</code> directly, so the common case has no wrapper object. A value class holds exactly one property. It can have functions, <code>init</code> checks and interfaces, but no identity.</p>
<p>The wrapper does appear when the value is used as some other type: as <code>Any</code>, as an interface, inside a generic like <code>List&lt;Cents&gt;</code>, or as a nullable when the underlying type is a primitive like <code>Long</code>. That boxing is usually cheap. Just don't expect zero cost inside collections.</p>`,
        code: `@JvmInline
value class UserId(val raw: String)

@JvmInline
value class Cents(val value: Long) {
    init { require(value >= 0) { "negative amount" } }
    operator fun plus(other: Cents) = Cents(value + other.value)
    fun format(): String = "%d.%02d".format(value / 100, value % 100)
}

fun charge(user: UserId, amount: Cents) { /* ... */ }

val id = UserId("u_42")
val price = Cents(1999)

charge(id, price)       // compiled with a String and a long: no wrappers
charge(price, id)       // compile error: argument type mismatch

val cart: List<Cents> = listOf(price)   // boxed: generics need objects
val maybe: Cents? = price               // boxed: a long can't be null`,
        remember: 'value class = a new type for the compiler, the bare value at runtime. It boxes only when used as another type.',
        terms: [
          { term: 'value class', def: 'A class wrapping exactly one value that the compiler checks as its own type but represents as the bare value where it can.' },
          { term: '@JvmInline', def: 'The annotation a value class needs on the JVM, which tells the compiler to inline its single property.' },
          { term: 'Boxing', def: 'Allocating a wrapper object around a value so it can be used where an object reference is required.' },
          { term: 'typealias', def: 'An alternative name for an existing type that adds no type safety, since both names mean the same type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a validated email type with no runtime wrapper.', code: '@[[JvmInline]]\n[[value]] class Email(val address: String) {\n    init { require("@" in address) { "not an email" } }\n}', why: 'On the JVM a value class needs <code>@JvmInline</code>. The <code>init</code> block still runs on every construction.' },
          { type: 'bug', prompt: 'One declaration won’t compile. Tap it.', code: '@JvmInline value class Meters(val value: Double)\n@JvmInline value class Point(val x: Double, val y: Double)\noperator fun Meters.plus(o: Meters) = Meters(value + o.value)\nfun walk(a: Meters, b: Meters): Meters = a + b', bug: 1, fix: 'data class Point(val x: Double, val y: Double)', why: 'A value class wraps exactly one property. Two values need a regular or data class.' },
        ],
        quiz: [
          { q: '<code>@JvmInline value class Id(val v: Int)</code>. How are the items of a <code>List&lt;Id&gt;</code> stored?', options: ['As boxed <code>Id</code> objects', 'As bare ints', 'As strings'], a: 0, why: 'Generic collections hold object references, so each Id is boxed.' },
          { q: 'Why choose a value class over <code>typealias UserId = String</code>?', options: ['A typealias accepts any String, so mixed-up arguments still compile', 'A typealias is slower at runtime', 'A typealias can’t be used as a parameter type'], a: 0, why: 'A typealias is just another name. A value class is a different type for the compiler.' },
          { q: 'Where is a <code>UserId</code> passed as the bare <code>String</code> at runtime?', options: ['As the parameter of <code>fun load(id: UserId)</code>', 'When assigned to <code>val a: Any</code>', 'Inside <code>mutableListOf(id)</code>'], a: 0, why: 'Used as its own type, it is unwrapped. As <code>Any</code> or in a generic, it is boxed.' },
        ],
        visual(el) {
          let kind = 'alias';
          const decl = h('div', { class: 'kt' });
          const o = out('');
          const kinds = [act('typealias', () => { kind = 'alias'; paint(); }), act('value class', () => { kind = 'value'; paint(); })];
          function paint() {
            press(kinds, kinds[kind === 'alias' ? 0 : 1]);
            lines(decl, kind === 'alias'
              ? [{ src: 'typealias OrderId = String' }, { src: 'typealias UserId = String' }, { src: 'fun refund(order: OrderId, to: UserId)' }]
              : [{ src: '@JvmInline value class OrderId(val raw: String)' }, { src: '@JvmInline value class UserId(val raw: String)' }, { src: 'fun refund(order: OrderId, to: UserId)' }]);
            say(o, 'Call refund the right way, then swap the arguments.');
          }
          const call = swapped => {
            if (!swapped) { say(o, `<span class="good">ok:</span> refunds order o_77 to user u_42`); return; }
            if (kind === 'alias') say(o, `<span class="bad">compiles:</span> both are just String. It refunds order "u_42" to user "o_77". Wrong account.`);
            else { replay(decl, 'shake'); say(o, `<span class="bad">compile error:</span> argument type mismatch: actual type is 'UserId', but 'OrderId' was expected`); }
          };

          const mem = h('div', { class: 'kd-mem' });
          const o2 = out('');
          const raw = (v, t) => h('div', { class: 'kd-raw drop-in' }, h('span', { class: 'chip' }, v), h('span', { class: 'kd-label' }, t));
          const boxed = (name, v) => h('div', { class: 'kd-boxed drop-in' }, h('span', { class: 'kd-label' }, `${name} object (heap)`), h('span', { class: 'chip' }, v));
          const CASES = [
            { src: 'val p = Cents(1999)', show: () => raw('1999', 'long'), say: '<span class="good">bare long:</span> no object is allocated' },
            { src: 'charge(id, p)', show: () => raw('1999', 'long parameter'), say: '<span class="good">bare long:</span> the JVM method takes a long (its name is mangled so Java can’t mix it up)' },
            { src: 'val a: Any = p', show: () => boxed('Cents', '1999'), say: '<span class="bad">boxed:</span> Any needs an object reference' },
            { src: 'listOf(p)', show: () => boxed('Cents', '1999'), say: '<span class="bad">boxed:</span> generic collections hold objects' },
            { src: 'val n: Cents? = p', show: () => boxed('Cents', '1999'), say: '<span class="bad">boxed:</span> a long can’t be null, so the nullable needs a wrapper' },
            { src: 'val u: UserId? = id', show: () => raw('"u_42"', 'String or null'), say: '<span class="good">bare String:</span> a String reference can already be null, so no wrapper' },
          ];
          const caseBtns = CASES.map(c => cmd(c.src, () => { press(caseBtns, caseBtns[CASES.indexOf(c)]); mem.replaceChildren(c.show()); say(o2, c.say); }));
          paint();
          mem.replaceChildren(CASES[0].show()); press(caseBtns, caseBtns[0]); say(o2, CASES[0].say);
          el.append(
            h('span', { class: 'kd-label' }, 'type safety'),
            h('div', { class: 'controls' }, kinds), decl,
            h('div', { class: 'controls' }, cmd('refund(orderId, userId)', () => call(false)), cmd('refund(userId, orderId)', () => call(true))),
            o,
            h('span', { class: 'kd-label' }, 'what sits in memory'),
            h('div', { class: 'controls' }, caseBtns), mem, o2);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'sequences',
        title: 'Collections vs Sequences',
        tagline: 'Eager steps over whole lists, or one element at a time.',
        level: 'intermediate',
        body: `
<p>Operations on a <code>List</code> are eager. Each step runs over every element and builds a new list before the next step starts. <code>list.map { }.filter { }.first()</code> maps everything, filters everything, then takes one item.</p>
<p>A <code>Sequence</code> is lazy. Intermediate steps like <code>map</code> and <code>filter</code> do nothing until a terminal operation like <code>first()</code>, <code>toList()</code> or <code>sum()</code> asks for values. Then each element travels the whole chain on its own, and work stops as soon as the result is known.</p>
<p>Reach for <code>asSequence()</code> on long chains over large collections, or when you stop early with <code>first</code>, <code>take</code> or <code>find</code>. For a couple of steps over a small list, a plain list is often faster, since a sequence adds a little overhead per element. <code>generateSequence</code> and <code>sequence { yield(x) }</code> can even describe infinite streams.</p>`,
        code: `val names = listOf("ada", "grace", "linus", "barbara", "ken", "margaret")

// Eager: 6 map calls, 6 filter calls, 2 lists built along the way
val eager = names.map { it.uppercase() }.filter { it.length > 4 }.first()

// Lazy: one element at a time, stops at the first match
val lazy = names.asSequence()
    .map { it.uppercase() }    // ada → ADA, grace → GRACE
    .filter { it.length > 4 }  // ADA fails, GRACE passes
    .first()                   // GRACE: done after 2 elements

// Infinite, but fine: take(5) limits it before toList()
val powers = generateSequence(1) { it * 2 }.take(5).toList()  // [1, 2, 4, 8, 16]`,
        remember: 'List steps run column by column over everything. Sequence steps run element by element and stop early.',
        terms: [
          { term: 'Sequence', def: 'A lazily evaluated collection type whose operations run per element only when a terminal operation pulls values.' },
          { term: 'Lazy evaluation', def: 'Deferring work until its result is actually needed, and doing only as much as that result requires.' },
          { term: 'Intermediate operation', def: 'A sequence step like map or filter that returns another sequence and does no work by itself.' },
          { term: 'generateSequence', def: 'Builds a possibly infinite sequence from a seed and a function that computes the next value.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Find the first long word without trimming every word first.', code: 'val firstLong = words\n    .[[asSequence]]()\n    .map { it.trim() }\n    .[[first|firstOrNull|find]] { it.length > 10 }', why: '<code>asSequence()</code> makes the chain lazy, so <code>trim()</code> runs only until the first match.' },
          { type: 'bug', prompt: 'This function never returns. Tap the line.', code: 'fun firstEvenSquares(): List<Int> =\n    generateSequence(1) { it + 1 }\n        .map { it * it }\n        .filter { it % 2 == 0 }\n        .toList().take(5)', bug: 4, fix: '        .take(5).toList()', why: 'The sequence is infinite. <code>toList()</code> tries to collect all of it before <code>take(5)</code> gets a chance. Limit first, then collect.' },
        ],
        quiz: [
          { q: '<code>listOf(1, 2, 3).asSequence().map { println(it); it }</code> with no terminal operation. What prints?', options: ['Nothing', '1 2 3', 'It fails to compile'], a: 0, why: 'Intermediate sequence steps are lazy. Nothing runs until something like <code>toList()</code> pulls.' },
          { q: 'For a lazy <code>map { }.filter { }</code>, in what order do the lambdas run for the first two elements?', options: ['map(1), filter(1), map(2), filter(2)', 'map(1), map(2), filter(1), filter(2)', 'filter(1), filter(2), map(1), map(2)'], a: 0, why: 'Each element goes through the whole chain before the next one starts.' },
          { q: 'When is a plain List usually the better choice?', options: ['Two steps over a small list', 'Stopping at the first match among a million items', 'An infinite stream'], a: 0, why: 'For small eager work, the per-element overhead of a sequence costs more than the lists it saves.' },
        ],
        visual(el) {
          const SRC = [1, 2, 3, 4, 5, 6];
          const ROWS = ['source', 'map', 'filter', 'take(2)'];
          let lazy = false, busy = false;
          const chain = h('div', { class: 'kt' });
          const grid = h('div', { class: 'kd-seq', role: 'img', 'aria-label': 'Elements flowing through map, filter and take' });
          let cells = [];
          const stat = { map: h('span', { class: 'kd-stat' }), filter: h('span', { class: 'kd-stat' }), lists: h('span', { class: 'kd-stat' }) };
          const o = out('');
          const modes = [act('List (eager)', () => { if (busy) return; lazy = false; paint(); }), act('Sequence (lazy)', () => { if (busy) return; lazy = true; paint(); })];
          const counts = { map: 0, filter: 0, lists: 0 };
          const paintStats = () => { stat.map.textContent = `map calls: ${counts.map}`; stat.filter.textContent = `filter calls: ${counts.filter}`; stat.lists.textContent = `lists built: ${counts.lists}`; };
          function paint() {
            press(modes, modes[lazy ? 1 : 0]);
            lines(chain, [{ src: lazy ? 'listOf(1, 2, 3, 4, 5, 6).asSequence()' : 'listOf(1, 2, 3, 4, 5, 6)' }, { src: '    .map { it * 3 }' }, { src: '    .filter { it % 2 == 0 }' }, { src: '    .take(2)' }, ...(lazy ? [{ src: '    .toList()' }] : [])]);
            grid.replaceChildren(); cells = [];
            ROWS.forEach((name, r) => {
              grid.append(h('span', { class: 'kd-rowname' }, name));
              cells.push(SRC.map(v => { const c = h('span', { class: 'kd-cell' + (r === 0 ? ' kd-val' : '') }, r === 0 ? String(v) : ''); grid.append(c); return c; }));
            });
            Object.keys(counts).forEach(k => { counts[k] = 0; }); paintStats();
            say(o, lazy ? 'Sequence: watch elements go down one column at a time.' : 'List: watch each step finish a whole row first.');
          }
          const set = (c, text, cls) => { c.textContent = text; c.className = 'kd-cell ' + cls; };
          async function hot(c) { c.classList.add('kd-hot'); await sleep(260); return el.isConnected; }
          async function run() {
            if (busy) return; busy = true;
            paint();
            const vals = SRC.map(v => v * 3);
            const pass = v => v % 2 === 0;
            const result = [];
            if (!lazy) {
              for (let i = 0; i < 6; i++) { if (!await hot(cells[1][i])) return; set(cells[1][i], String(vals[i]), 'kd-val'); counts.map++; paintStats(); }
              counts.lists++; paintStats();
              for (let i = 0; i < 6; i++) { if (!await hot(cells[2][i])) return; set(cells[2][i], String(vals[i]), pass(vals[i]) ? 'kd-keep' : 'kd-drop'); counts.filter++; paintStats(); }
              counts.lists++; paintStats();
              for (let i = 0; i < 6; i++) {
                if (!pass(vals[i])) { set(cells[3][i], '', 'kd-idle'); continue; }
                if (result.length < 2) { if (!await hot(cells[3][i])) return; set(cells[3][i], String(vals[i]), 'kd-keep'); result.push(vals[i]); } else set(cells[3][i], '', 'kd-idle');
              }
              counts.lists++; paintStats();
            } else {
              for (let i = 0; i < 6; i++) {
                if (result.length === 2) { for (let r = 0; r < 4; r++) cells[r][i].classList.add('kd-idle'); continue; }
                if (!await hot(cells[0][i])) return; cells[0][i].className = 'kd-cell kd-val';
                if (!await hot(cells[1][i])) return; set(cells[1][i], String(vals[i]), 'kd-val'); counts.map++; paintStats();
                if (!await hot(cells[2][i])) return; set(cells[2][i], String(vals[i]), pass(vals[i]) ? 'kd-keep' : 'kd-drop'); counts.filter++; paintStats();
                if (pass(vals[i])) { if (!await hot(cells[3][i])) return; set(cells[3][i], String(vals[i]), 'kd-keep'); result.push(vals[i]); }
                else set(cells[3][i], '', 'kd-idle');
              }
              counts.lists++; paintStats();
            }
            say(o, `<span class="good">result:</span> ${hl(`[${result.join(', ')}]`)} <span class="muted">with ${counts.map} map and ${counts.filter} filter calls</span>`);
            busy = false;
          }
          paint();
          el.append(h('div', { class: 'controls' }, modes, h('button', { class: 'btn primary small', onclick: run }, 'Run')), chain, grid, h('div', { class: 'kd-stats' }, stat.map, stat.filter, stat.lists), o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'errors',
        title: 'Exceptions, Result and runCatching',
        tagline: 'Catch what you can handle, and let cancellation through.',
        level: 'advanced',
        body: `
<p>Kotlin has no checked exceptions. Any function can throw, and the compiler won't remind you. Catch the specific types you can handle, like <code>IOException</code> from the network, and let the rest crash where you can see them.</p>
<p><code>runCatching { }</code> wraps the outcome in a <code>Result</code>: a success with a value, or a failure with the exception. You then <code>map</code>, <code>fold</code>, <code>getOrElse</code> or <code>onFailure</code> it. The catch is that it catches every <code>Throwable</code>.</p>
<p>That matters in coroutines. Cancellation arrives as a <code>CancellationException</code> thrown from the suspend point. If <code>catch (e: Exception)</code> or <code>runCatching</code> swallows it, the coroutine keeps running after its screen is gone. Rethrow it, or catch only the types you mean.</p>`,
        code: `suspend fun loadProfile(id: String): ProfileState = try {
    ProfileState.Ready(api.fetchUser(id))
} catch (e: IOException) {
    ProfileState.Offline              // network trouble: handled
}                                     // CancellationException passes through

suspend fun <T> safeCall(block: suspend () -> T): Result<T> =
    try {
        Result.success(block())
    } catch (e: CancellationException) {
        throw e                       // never swallow cancellation
    } catch (e: Exception) {
        Result.failure(e)
    }

val name = safeCall { api.fetchUser(id) }
    .map { it.displayName }
    .getOrElse { "Guest" }`,
        remember: 'Catch what you can handle. runCatching catches everything, so rethrow CancellationException.',
        terms: [
          { term: 'Result', def: 'A standard type that holds either a successful value or the Throwable that caused a failure.' },
          { term: 'runCatching', def: 'Runs a block and returns Result.success with its value, or Result.failure with any Throwable it threw.' },
          { term: 'CancellationException', def: 'The exception a suspend function throws when its coroutine is cancelled, which must propagate for cancellation to work.' },
          { term: 'Checked exception', def: 'A Java exception the compiler forces callers to catch or declare, a concept Kotlin does not have.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use <code>runCatching</code> but keep cancellation working.', code: 'val user = runCatching { repo.load(id) }\n    .[[onFailure]] { if (it is [[CancellationException]]) throw it }\n    .getOrNull()', why: 'Rethrowing the <code>CancellationException</code> lets the coroutine stop. Other failures become <code>null</code>.' },
          { type: 'bug', prompt: 'After the screen closes, this loop never stops and floods the log. Tap the cause.', code: 'viewModelScope.launch {\n    while (true) {\n        try {\n            prices.value = api.latestPrices()\n            delay(5_000)\n        } catch (e: Exception) {\n            Log.w("prices", "refresh failed", e)\n        }\n    }\n}', bug: 5, fix: '        } catch (e: IOException) {', why: 'When the scope is cancelled, <code>delay</code> throws <code>CancellationException</code>. <code>catch (e: Exception)</code> swallows it, so the loop spins again and again. Catch only <code>IOException</code>, or rethrow cancellation.' },
        ],
        quiz: [
          { q: 'What does <code>runCatching</code> catch?', options: ['Every <code>Throwable</code>, including <code>CancellationException</code>', 'Only <code>Exception</code> subclasses you list', 'Only <code>IOException</code>'], a: 0, why: 'That is why it needs care inside coroutines.' },
          { q: 'A coroutine is cancelled during <code>delay()</code>. The code catches <code>Exception</code> and logs it. What happens?', options: ['It keeps running past the catch', 'It stops cleanly', 'The app crashes'], a: 0, why: 'The cancellation signal was swallowed, so the code after the catch still runs.' },
          { q: 'How does Kotlin treat checked exceptions?', options: ['The compiler never forces you to catch or declare them', 'You must declare them with <code>throws</code>', 'They are turned into <code>Result</code>'], a: 0, why: 'Kotlin has no checked exceptions. <code>@Throws</code> exists only for Java and Swift interop.' },
        ],
        visual(el) {
          const OUTS = [
            { id: 'ok', label: 'returns a user' },
            { id: 'io', label: 'throws IOException' },
            { id: 'cancel', label: 'screen closes (cancel)' },
          ];
          const HANDS = [
            { id: 'rc', name: 'runCatching', src: 'runCatching { api.fetchUser() }' },
            { id: 'ex', name: 'catch Exception', src: 'try { api.fetchUser() } catch (e: Exception) { null }' },
            { id: 'io', name: 'catch IOException', src: 'try { api.fetchUser() } catch (e: IOException) { null }' },
          ];
          let oc = OUTS[2], hd = HANDS[0], busy = false;
          const st = ['fetchUser()', '', 'updateUi()'].map(n => h('div', { class: 'kd-st' }, h('span', { class: 'kd-st-name' }, n)));
          const job = h('span', { class: 'kd-job' }, 'job: active');
          const codeEl = h('div', { class: 'kt' });
          const o = out('');
          const oBtns = OUTS.map(x => act(x.label, () => { if (busy) return; oc = x; paint(); }));
          const hBtns = HANDS.map(x => act(x.name, () => { if (busy) return; hd = x; paint(); }));
          function clear() { st.forEach(s => { s.className = 'kd-st'; s.querySelector('.kd-tok')?.remove(); }); job.className = 'kd-job'; job.textContent = 'job: active'; }
          function paint() {
            press(oBtns, oBtns[OUTS.indexOf(oc)]); press(hBtns, hBtns[HANDS.indexOf(hd)]);
            st[1].firstChild.textContent = hd.name;
            lines(codeEl, [{ src: 'viewModelScope.launch {' }, { src: `    val user = ${hd.src}` }, { src: '    updateUi(user)' }, { src: '}' }]);
            clear();
            say(o, 'Pick what the call does and how you handle it, then launch.');
          }
          const tok = (s, text, cls = '') => { s.querySelector('.kd-tok')?.remove(); const t = h('span', { class: `kd-tok pop ${cls}` }, text); s.append(t); s.classList.add('kd-on'); };
          async function run() {
            if (busy) return; busy = true; clear();
            const step = async () => { await sleep(650); return el.isConnected; };
            if (oc.id === 'ok') tok(st[0], 'User', '');
            else if (oc.id === 'io') { tok(st[0], 'IOException', 'kd-err'); }
            else { job.textContent = 'job: cancelling'; job.className = 'kd-job kd-dead'; tok(st[0], 'Cancelled', 'kd-cancel'); }
            if (!await step()) return;
            const swallow = oc.id === 'cancel' && hd.id !== 'io';
            if (oc.id === 'ok') tok(st[1], 'User');
            else if (oc.id === 'io') tok(st[1], hd.id === 'rc' ? 'failure' : 'caught', 'kd-okk');
            else if (swallow) { tok(st[1], 'swallowed', 'kd-err'); st[1].classList.add('kd-badst'); }
            else tok(st[1], 'rethrown', 'kd-cancel');
            if (!await step()) return;
            if (oc.id === 'cancel' && !swallow) {
              st[2].classList.add('kd-skip'); job.textContent = 'job: cancelled'; job.className = 'kd-job kd-dead';
              say(o, '<span class="good">clean stop:</span> not an IOException, so it propagates. updateUi never runs.');
            } else if (swallow) {
              tok(st[2], 'runs anyway', 'kd-err'); st[2].classList.add('kd-badst'); replay(st[2], 'shake');
              job.textContent = 'job: still running'; job.className = 'kd-job kd-zombie';
              say(o, `<span class="bad">zombie:</span> ${hd.name} swallowed the CancellationException. The coroutine touches a screen that is gone.`);
            } else if (oc.id === 'ok') {
              tok(st[2], 'shows Ada', 'kd-okk'); say(o, '<span class="good">success:</span> every handler passes the value through.');
            } else {
              tok(st[2], 'offline UI', 'kd-okk');
              say(o, hd.id === 'io' ? '<span class="good">handled:</span> you caught exactly the failure you expected.' : `<span class="good">handled,</span> <span class="muted">but ${hd.name} would hide cancellation and real bugs too.</span>`);
            }
            busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'the call'), oBtns),
            h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'handler'), hBtns),
            codeEl,
            h('div', { class: 'kd-pipe' }, st),
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Launch'), job),
            o);
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'operators',
        title: 'Operators, infix and destructuring',
        tagline: 'a + b is just a.plus(b) with nicer spelling.',
        level: 'intermediate',
        body: `
<p>Operators in Kotlin are calls to functions with fixed names. <code>a + b</code> is <code>a.plus(b)</code>, <code>a[i]</code> is <code>a.get(i)</code>, <code>-a</code> is <code>a.unaryMinus()</code>, and <code>a += b</code> uses <code>plusAssign</code> or falls back to <code>a = a + b</code>. Mark such a function <code>operator</code> and your type gets the syntax.</p>
<p><code>infix</code> lets a function with one parameter sit between its two arguments. <code>1 to "one"</code> calls <code>1.to("one")</code>. Use it where the call reads like a sentence, like <code>a dot b</code> or <code>shouldBe</code> in tests.</p>
<p>Destructuring is the same trick. <code>val (x, y) = point</code> calls <code>point.component1()</code> and <code>point.component2()</code>. Data classes generate these in declaration order, so reordering the properties silently changes what <code>x</code> and <code>y</code> mean.</p>`,
        code: `data class Vec(val x: Int, val y: Int) {
    operator fun plus(o: Vec) = Vec(x + o.x, y + o.y)
    operator fun times(k: Int) = Vec(x * k, y * k)
    operator fun unaryMinus() = Vec(-x, -y)
    infix fun dot(o: Vec): Int = x * o.x + y * o.y
}

val a = Vec(2, 1)
val b = Vec(1, 2)

a + b          // Vec(x=3, y=3)     a.plus(b)
a * 2          // Vec(x=4, y=2)     a.times(2)
-a             // Vec(x=-2, y=-1)   a.unaryMinus()
a dot b        // 4                 a.dot(b)

val (x, y) = a + b                  // component1(), component2()
for ((key, value) in mapOf("a" to 1)) println("$key=$value")`,
        remember: 'Operators are named functions: + is plus, [] is get, (x, y) is component1 and component2.',
        terms: [
          { term: 'operator', def: 'A modifier that lets a function with a reserved name, like plus or get, be called with operator syntax.' },
          { term: 'infix function', def: 'A member or extension function with one parameter that can be called as a op b without dots or parentheses.' },
          { term: 'Destructuring declaration', def: 'Syntax like val (a, b) = x that assigns each name from x.component1(), x.component2() and so on.' },
          { term: 'componentN()', def: 'The operator functions destructuring calls by position, generated for each data class property in declaration order.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>(lunch + coffee) split 3</code> compile.', code: 'data class Money(val cents: Long) {\n    [[operator]] fun plus(o: Money) = Money(cents + o.cents)\n    [[infix]] fun split(ways: Int) = Money(cents / ways)\n}\nval each = (lunch + coffee) split 3', why: '<code>+</code> needs a function named <code>plus</code> marked <code>operator</code>. Calling <code>split</code> without a dot needs <code>infix</code>.' },
          { type: 'bug', prompt: 'One line makes <code>g[1, 2]</code> fail to compile on the last line. Tap it.', code: 'class Grid(private val cells: Array<IntArray>) {\n    fun get(row: Int, col: Int): Int = cells[row][col]\n    operator fun set(row: Int, col: Int, v: Int) { cells[row][col] = v }\n}\nval g = Grid(Array(3) { IntArray(3) })\ng[1, 2] = 7\nprintln(g[1, 2])', bug: 1, fix: '    operator fun get(row: Int, col: Int): Int = cells[row][col]', why: 'Reading <code>g[1, 2]</code> calls <code>get(1, 2)</code>, which only works when <code>get</code> is marked <code>operator</code>. <code>set</code> already is, so the write compiles.' },
        ],
        quiz: [
          { q: 'What does <code>a[i] = v</code> compile to?', options: ['<code>a.set(i, v)</code>', '<code>a.get(i).assign(v)</code>', '<code>a.put(i, v)</code>'], a: 0, why: 'Indexed assignment maps to the <code>set</code> operator with the index first.' },
          { q: '<code>data class User(val name: String, val age: Int)</code>. After <code>val (age, name) = User("Ada", 36)</code>, what is <code>age</code>?', options: ['<code>"Ada"</code>', '<code>36</code>', 'It doesn’t compile'], a: 0, why: 'Destructuring is by position. The first name gets <code>component1()</code>, which is <code>name</code>.' },
          { q: 'Which functions can be marked <code>infix</code>?', options: ['Member or extension functions with exactly one parameter', 'Any top-level function', 'Only operator functions'], a: 0, why: 'An infix call has exactly two sides: the receiver and the single argument.' },
        ],
        visual(el) {
          const A = [2, 1], B = [1, 2];
          let busy = false;
          const plot = h('div', { class: 'kd-parts' });
          const parts = h('div', { class: 'kd-parts' });
          const o = out('');
          const vec = (v, cls, label, anim) => {
            const [x, y] = v;
            const ly = y >= 0 ? -y - 0.45 : -y + 0.85;
            return `<line class="kd-v ${cls}${anim ? ' kd-anim' : ''}" x1="0" y1="0" x2="${x}" y2="${-y}" pathLength="1"/>` +
              `<circle class="${cls}" cx="${x}" cy="${-y}" r="0.13"/>` +
              `<text x="${x}" y="${ly}" font-size="0.55" text-anchor="middle">${label}</text>`;
          };
          function draw(res) {
            let g = '';
            for (let i = -4; i <= 4; i++) g += `<line class="kd-g" x1="${i}" y1="-4.5" x2="${i}" y2="4.5"/><line class="kd-g" x1="-4.5" y1="${i}" x2="4.5" y2="${i}"/>`;
            g += '<line class="kd-ax" x1="-4.5" y1="0" x2="4.5" y2="0"/><line class="kd-ax" x1="0" y1="-4.5" x2="0" y2="4.5"/>';
            g += vec(A, 'kd-a', 'a', false) + vec(B, 'kd-b', 'b', false);
            if (res) g += vec(res.v, 'kd-r', res.label, true);
            plot.innerHTML = `<svg class="kd-plot" viewBox="-5.2 -5.2 10.4 10.4" role="img" aria-label="Vectors a and b on a grid${res ? ' with the result ' + res.label : ''}">${g}</svg>`;
          }
          const fmt = v => `Vec(x=${v[0]}, y=${v[1]})`;
          const OPS = [
            { src: 'a + b', call: 'a.plus(b)', v: [3, 3] },
            { src: 'a * 2', call: 'a.times(2)', v: [4, 2] },
            { src: '-a', call: 'a.unaryMinus()', v: [-2, -1] },
            { src: 'a dot b', call: 'a.dot(b)', num: 4 },
            { src: 'val (x, y) = a + b', call: 'component1(), component2()', v: [3, 3], parts: true },
          ];
          const btns = OPS.map(op => cmd(op.src, async () => {
            if (busy) return; busy = true;
            press(btns, btns[OPS.indexOf(op)]);
            parts.replaceChildren();
            if (op.v) draw({ v: op.v, label: op.parts ? 'a + b' : op.src }); else draw(null);
            if (op.num != null) {
              parts.append(h('span', { class: 'chip total drop-in' }, String(op.num)), h('span', { class: 'kd-label' }, '2·1 + 1·2'));
              say(o, `${hl(op.src)} <span class="muted">calls</span> ${hl(op.call)} = ${hl(String(op.num))}`);
            } else if (op.parts) {
              say(o, `${hl(op.src)} <span class="muted">calls</span> ${hl(op.call)}`);
              await sleep(500); if (!el.isConnected) return;
              parts.append(h('span', { class: 'kd-tag drop-in', html: hl('x = component1()') }), h('span', { class: 'chip drop-in' }, '3'));
              await sleep(350); if (!el.isConnected) return;
              parts.append(h('span', { class: 'kd-tag drop-in', html: hl('y = component2()') }), h('span', { class: 'chip drop-in' }, '3'));
            } else {
              say(o, `${hl(op.src)} <span class="muted">calls</span> ${hl(op.call)} = ${hl(fmt(op.v))}`);
            }
            await sleep(400); busy = false;
          }));
          draw(null);
          parts.append(h('span', { class: 'kd-label' }, 'a = Vec(2, 1)'), h('span', { class: 'kd-label' }, 'b = Vec(1, 2)'));
          say(o, 'Pick an expression to see which function it calls.');
          el.append(h('div', { class: 'stage' }, plot, parts), h('div', { class: 'controls' }, btns), o);
        },
      },
    ],
  });
})();
