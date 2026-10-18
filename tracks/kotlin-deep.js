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

/* depth steps */
.kd-intruder { border-color: var(--err) !important; background: var(--err-soft) !important; color: var(--err) !important; }
.kd-node.kd-bad { border-color: var(--err); background: var(--err-soft); }
.kd-node.kd-dim { opacity: 0.45; }
.kd-grow { transition: width 0.7s ease-out; }
.phone.kd-mini-phone { height: 200px; }

@media (max-width: 600px) { .kd-split { grid-template-columns: minmax(0, 1fr); } }
/* depth pass 2: dsl, value, sequences, operators */
.kd-dsl-stack { display: grid; gap: 8px; min-width: 0; }
.kd-node.kd-dsl-ok { border-color: var(--ok); background: var(--ok-soft); }
.kd-tag.kd-dsl-match { outline: 2px solid var(--ok); outline-offset: 1px; }
.kd-tag.kd-dsl-miss { outline: 2px solid var(--err); outline-offset: 1px; }
.kd-vcl-bits { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.kd-vcl-bit { width: 34px; height: 42px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); font: 700 1rem var(--mono); cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s; }
.kd-vcl-bit[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--ink); }
.kd-sqn-belt { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr)); gap: 10px; min-width: 0; }
.kd-sqn-st { display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: opacity 0.25s; }
.kd-sqn-st.kd-sqn-off { opacity: 0.35; border-style: dashed; }
.kd-sqn-well { display: flex; flex-wrap: wrap; gap: 4px; min-height: 30px; align-content: flex-start; }
.kd-sqn-chip { font: 600 0.8rem var(--mono); padding: 3px 8px; border-radius: 7px; background: var(--surface); border: 2px solid var(--ink); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: opacity 0.3s; }
.kd-sqn-chip.kd-sqn-gone { opacity: 0.25; }
.kd-sqn-chip.kd-sqn-keep { border-color: var(--ok); background: var(--ok-soft); }
.kd-cell.kd-sqn-cell { flex: 1 1 64px; padding: 0 6px; font-size: 0.76rem; }
.kd-line.kd-sqn-run { background: rgba(255, 212, 121, 0.24); }
.kd-opr-item { font: 600 0.8rem var(--mono); padding: 2px 8px; border-radius: 6px; background: var(--sunk); color: var(--ink); }
.kd-opr-vers { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; min-height: 48px; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); }
.kd-opr-banner { padding: 8px 12px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font-weight: 700; font-size: 0.9rem; transition: background 0.25s, border-color 0.25s; }
.kd-opr-banner.kd-opr-ok { border-color: var(--ok); background: var(--ok-soft); color: var(--ok); }
.kd-opr-banner.kd-opr-bad { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.slot.kd-ji-slot { width: auto; min-width: min(120px, 100%); padding: 0 12px; font: 600 0.95rem var(--mono); }
.kd-gen-row { display: flex; flex-wrap: wrap; gap: 6px; min-height: 40px; min-width: 0; }
.chip.kd-gen-chip { min-width: 0; height: 34px; padding: 0 10px; font-size: 0.85rem; border-width: 1.5px; }
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
          { q: 'With <code>fun &lt;T&gt; copy(from: MutableList&lt;out T&gt;, to: MutableList&lt;in T&gt;)</code>, what happens with <code>copy(animals, cats)</code>?', options: ['It compiles with T = Cat', 'It does not compile: an Animal may not be a Cat', 'It compiles but throws ClassCastException at runtime'], a: 1, why: 'T would have to be Animal to read from animals, and then cats can’t accept it. The compiler rejects every T that fits, so the bad copy never runs.' },
          { q: 'You view a <code>Box&lt;Cat&gt;</code> as <code>val view: Box&lt;out Animal&gt;</code>. What does <code>view.put()</code> accept?', options: ['<code>Nothing</code>, so you can’t call it', '<code>Animal</code>', '<code>Any?</code>'], a: 0, why: 'An out projection only lets values come out. In-positions take Nothing, which protects the owner who still expects only cats inside.' },
          { q: 'When does this fail?<pre class="code mini"><code>val raw: List&lt;Any&gt; = listOf(1)\nval strings = raw as List&lt;String&gt;\nval first: String = strings[0]</code></pre>', options: ['On the third line, when the item is read as a String', 'On the second line, at the cast', 'Never: the Int is converted to "1"'], a: 0, why: 'Generics are erased, so the cast can only check for List and passes. The ClassCastException waits for the first read that needs a String.' },
        ],
        deeper: [
          {
            title: 'Why out bans put',
            body: `<p>Take an invariant <code>class Box&lt;T&gt;</code> with both <code>get()</code> and <code>put()</code>. You can still view a <code>Box&lt;Cat&gt;</code> as <code>Box&lt;out Animal&gt;</code>. Through that view, <code>get()</code> returns <code>Animal</code>, and <code>put()</code> takes <code>Nothing</code>, so you can't call it.</p>
<p>The ban protects the owner of the box. They still hold it as <code>Box&lt;Cat&gt;</code> and expect only cats inside. Flip the switch to see what would happen without it.</p>`,
            code: `class Box<T>(private var item: T) {
    fun get(): T = item
    fun put(value: T) { item = value }
}

val catBox = Box(Cat())
val view: Box<out Animal> = catBox   // ok: read-only view

val a: Animal = view.get()           // fine, a Cat is an Animal
view.put(Dog())                      // error: put now takes Nothing`,
            visual(el) {
              let items = ['Cat'], unsafe = false, busy = false;
              const shelf = h('div', { class: 'kd-heap', 'aria-label': 'What is inside the box' });
              const sw = h('input', { type: 'checkbox', id: 'kd-var-unsafe' });
              const o = out('One object: a Box<Cat>. The owner holds catBox. You hold view: Box<out Animal>.');
              const paint = fresh => shelf.replaceChildren(...items.map((t, i) => h('span', { class: 'chip' + (t === 'Dog' ? ' kd-intruder' : '') + (fresh && i === items.length - 1 ? ' drop-in' : '') }, t)));
              sw.addEventListener('change', () => { unsafe = sw.checked; say(o, unsafe ? '<span class="bad">pretend mode:</span> the compiler now lets put() through the view.' : 'Normal rules: put() takes Nothing through an out view.'); });
              async function read() {
                if (busy) return; busy = true;
                replay(shelf.lastElementChild, 'pop');
                const t = items[items.length - 1];
                say(o, `${hl('val a: Animal = view.get()')} <span class="good">ok:</span> got a ${t}, and every ${t} is an Animal`);
                await sleep(400); busy = false;
              }
              async function put() {
                if (busy) return; busy = true;
                if (!unsafe) { replay(shelf, 'shake'); say(o, `<span class="bad">compile error:</span> argument type mismatch: actual type is 'Dog', but 'Nothing' was expected`); }
                else if (items.includes('Dog')) say(o, 'The dog is already in there. Let the owner read it.');
                else { items.push('Dog'); paint(true); say(o, `${hl('view.put(Dog())')} <span class="bad">compiles in pretend mode.</span> A Dog now sits in a box of cats.`); }
                await sleep(400); busy = false;
              }
              async function owner() {
                if (busy) return; busy = true;
                const t = items[items.length - 1];
                replay(shelf.lastElementChild, 'pop');
                if (t === 'Dog') { replay(shelf, 'shake'); say(o, `${hl('val c: Cat = catBox.get()')} <span class="bad">ClassCastException:</span> class Dog cannot be cast to class Cat <span class="muted">(far from the line that caused it)</span>`); }
                else say(o, `${hl('val c: Cat = catBox.get()')} <span class="good">ok:</span> still a Cat`);
                await sleep(400); busy = false;
              }
              function reset() { items = ['Cat']; paint(true); say(o, 'Box emptied and refilled with one Cat.'); }
              paint(false);
              el.append(
                h('div', { class: 'kd-pair' },
                  h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'the object'), h('span', { class: 'kd-tag', html: hl('Box<Cat>') }), shelf),
                  h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'your view'), h('span', { class: 'kd-tag', html: hl('view: Box<out Animal>') }),
                    h('div', { class: 'controls' }, cmd('view.get()', read), cmd('view.put(Dog())', put)))),
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'kd-var-unsafe' }, sw, 'Pretend the compiler allowed put')),
                h('div', { class: 'controls' }, cmd('catBox.get()  // the owner', owner), act('Refill', reset)),
                o);
            },
          },
          {
            title: 'Use-site variance on one function',
            body: `<p><code>MutableList</code> must stay invariant, because it both reads and writes. A copy function only reads from one list and only writes to the other. Say so at the use site: <code>from: MutableList&lt;out T&gt;</code> and <code>to: MutableList&lt;in T&gt;</code>.</p>
<p>Now a list of cats can be copied into a list of animals. Copying animals into a list of cats still fails, because some of those animals may be dogs.</p>`,
            code: `fun <T> copy(from: MutableList<out T>, to: MutableList<in T>) {
    for (item in from) to.add(item)
}

val cats: MutableList<Cat> = mutableListOf(Cat())
val animals: MutableList<Animal> = mutableListOf()
copy(cats, animals)      // T = Animal: read cats, write animals
copy(animals, cats)      // error: an Animal may not be a Cat`,
            visual(el) {
              const START = { cats: ['Tom', 'Kit'], animals: ['Rex'], anys: ['42'] };
              const TYPE = { cats: 'Cat', animals: 'Animal', anys: 'Any' };
              const RANK = { cats: 0, animals: 1, anys: 2 };
              let lists, variant = false, busy = false;
              const boxes = {}, wells = {};
              const sig = h('div', { class: 'kt' });
              const o = out('');
              Object.keys(START).forEach(k => {
                wells[k] = h('div', { class: 'kd-row' });
                boxes[k] = h('div', { class: 'kd-card' }, h('span', { class: 'kd-tag', html: hl(`${k}: MutableList<${TYPE[k]}>`) }), wells[k]);
              });
              const paintList = k => wells[k].replaceChildren(...(lists[k].length ? lists[k].map(x => h('span', { class: 'chip' }, x)) : [h('span', { class: 'kd-empty' }, 'empty')]));
              function reset() { lists = JSON.parse(JSON.stringify(START)); Object.keys(lists).forEach(paintList); }
              const sigBtns = [act('invariant', () => setSig(false)), act('out / in', () => setSig(true))];
              function setSig(v) {
                if (busy) return; variant = v; press(sigBtns, sigBtns[v ? 1 : 0]);
                lines(sig, [{ src: v ? 'fun <T> copy(from: MutableList<out T>, to: MutableList<in T>)' : 'fun <T> copy(from: MutableList<T>, to: MutableList<T>)', cls: 'kd-new' }]);
                say(o, v ? 'from only produces T, to only consumes T.' : 'Both lists must have exactly the same T.');
              }
              async function copy(a, b) {
                if (busy) return; busy = true;
                const ok = variant ? RANK[a] <= RANK[b] : a === b;
                const call = `copy(${a}, ${b})`;
                if (!ok) {
                  replay(boxes[b], 'shake');
                  say(o, `${hl(call)} <span class="bad">compile error:</span> ${variant ? `no T fits. T must be a supertype of ${TYPE[a]} and a subtype of ${TYPE[b]}.` : `argument type mismatch: actual type is 'MutableList<${TYPE[b]}>', but 'MutableList<${TYPE[a]}>' was expected.`}`);
                  await sleep(400); busy = false; return;
                }
                if (lists[b].length > 5) lists[b] = START[b].slice();
                boxes[a].classList.add('kd-hit');
                for (const x of lists[a].slice()) {
                  await sleep(300); if (!el.isConnected) return;
                  lists[b].push(x); paintList(b); replay(wells[b].lastElementChild, 'drop-in');
                }
                boxes[a].classList.remove('kd-hit');
                say(o, `${hl(call)} <span class="good">ok:</span> T = ${TYPE[b]}. Read as ${TYPE[a]}, written as ${TYPE[b]}.`);
                busy = false;
              }
              reset(); setSig(false);
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'signature'), sigBtns), sig,
                h('div', { class: 'kd-pair' }, boxes.cats, boxes.animals, boxes.anys),
                h('div', { class: 'controls' }, cmd('copy(cats, animals)', () => copy('cats', 'animals')), cmd('copy(animals, anys)', () => copy('animals', 'anys')), cmd('copy(animals, cats)', () => copy('animals', 'cats')), cmd('copy(cats, cats)', () => copy('cats', 'cats'))),
                o);
            },
          },
          {
            title: 'When the rule is too strict: @UnsafeVariance',
            body: `<p><code>List&lt;out E&gt;</code> still has <code>contains(element: E)</code>, which takes <code>E</code> as input. The standard library marks that parameter <code>@UnsafeVariance</code>. It tells the compiler "this method only compares, it never stores".</p>
<p>Use it the same way in your own read-only types, and only when the method truly never writes the value anywhere. If it does, you are back to dogs in the cat box.</p>`,
            code: `interface ReadOnlyCache<out V> {
    fun get(key: String): V?
    // only compares, never stores, so the input position is safe
    fun containsValue(value: @UnsafeVariance V): Boolean
}`,
          },
        ],
        underHood: {
          body: `<p>Variance exists only at compile time. Generics are erased on the JVM, so a <code>Box&lt;Cat&gt;</code> and a <code>Box&lt;Animal&gt;</code> are the same class at runtime. That is also why an unchecked cast like <code>list as List&lt;String&gt;</code> never fails on the spot.</p>
<p>For Java callers, Kotlin turns declaration-site variance into wildcards on parameters. A parameter of type <code>Producer&lt;Animal&gt;</code> becomes <code>Producer&lt;? extends Animal&gt;</code>. Return types get no wildcard, so Java code that receives the value stays simple. Final type arguments like <code>String</code> also get no wildcard.</p>`,
          code: `// Kotlin
interface Producer<out T> { fun get(): T }
fun adopt(source: Producer<Animal>): Animal = source.get()
fun shelter(): Producer<Animal> = TODO()

// What Java sees
Animal adopt(Producer<? extends Animal> source)
Producer<Animal> shelter()            // no wildcard on return types`,
        },
        mistakes: [
          { title: 'Asking for MutableList when you only read', bad: 'fun average(xs: MutableList<Number>): Double =\n    xs.sumOf { it.toDouble() } / xs.size\n\nval ints: MutableList<Int> = mutableListOf(1, 2, 3)\naverage(ints)   // error: MutableList<Int>', good: 'fun average(xs: List<Number>): Double =\n    xs.sumOf { it.toDouble() } / xs.size\n\nval ints: MutableList<Int> = mutableListOf(1, 2, 3)\naverage(ints)   // ok: List is covariant', why: '<code>MutableList</code> is invariant, so it rejects a list of a subtype. If you only read, take <code>List</code>, which is <code>out</code>.' },
          { title: 'Trusting an unchecked cast', bad: 'val names = payload["names"] as List<String>\n// passes even if the list holds numbers\nnames.first().length   // ClassCastException here', good: 'val names = (payload["names"] as? List<*>)\n    .orEmpty()\n    .filterIsInstance<String>()', why: 'Erasure means <code>as List&lt;String&gt;</code> only checks for <code>List</code>. The crash moves to the first read. Check each element instead.' },
          { title: 'Comparator without in', bad: 'fun sortCats(cats: MutableList<Cat>, by: Comparator<Cat>) =\n    cats.sortWith(by)\n\nsortCats(cats, byName)   // error: byName is Comparator<Animal>', good: 'fun sortCats(cats: MutableList<Cat>, by: Comparator<in Cat>) =\n    cats.sortWith(by)\n\nsortCats(cats, byName)   // ok', why: '<code>java.util.Comparator</code> has no variance in Kotlin. A comparator for any animal can sort cats, so say <code>in Cat</code>, as <code>sortWith</code> itself does.' },
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
        predict: {
          "q": "With <code>class Box&lt;in T&gt;</code>, which boxes can you assign to <code>val b: Box&lt;Animal&gt;</code>?",
          "options": [
            "Only Box&lt;Animal&gt;",
            "Box&lt;Animal&gt; and Box&lt;Cat&gt;",
            "Box&lt;Any&gt; and Box&lt;Animal&gt;"
          ],
          "a": 2,
          "why": "<code>in</code> makes Box contravariant. A box that accepts any <code>Any</code> can stand in for one that must accept Animals, but a Box&lt;Cat&gt; can’t take every Animal."
        },
        play: `open class Animal { override fun toString() = "Animal" }
class Cat : Animal() { override fun toString() = "Cat" }

interface Producer<out T> { fun get(): T }
interface Consumer<in T> { fun put(item: T) }

fun adopt(source: Producer<Animal>) = source.get()
fun feed(sink: Consumer<Cat>) = sink.put(Cat())
fun total(values: MutableList<out Number>): Double = values.sumOf { it.toDouble() }

fun main() {
    val shelter = object : Producer<Cat> { override fun get() = Cat() }
    val bowl = object : Consumer<Animal> { override fun put(item: Animal) = println("bowl got a $item") }
    println("adopted a \${adopt(shelter)}")   // out: Producer<Cat> is a Producer<Animal>
    feed(bowl)                               // in: Consumer<Animal> is a Consumer<Cat>

    val cats: List<Cat> = listOf(Cat())
    val animals: List<Animal> = cats         // List<out E>, so this is fine
    println(animals)

    val ints = mutableListOf(1, 2, 3)
    println(total(ints))                     // use-site out on an invariant MutableList
    // val nums: MutableList<Number> = ints  // remove the //: type mismatch
}`
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
          { q: 'An adapter is created and read only on the main thread, and you want no locking. Which lazy mode fits?', options: ['<code>lazy(LazyThreadSafetyMode.PUBLICATION)</code>', 'The default <code>lazy { }</code>', '<code>lazy(LazyThreadSafetyMode.NONE)</code>'], a: 2, why: 'NONE skips locking, which is safe only when one thread ever touches the property. The default SYNCHRONIZED takes a lock, and PUBLICATION may run the block twice.' },
          { q: 'A property must refuse negative ages before they are stored. Which delegate do you use?', options: ['<code>Delegates.observable</code>', '<code>Delegates.vetoable</code>', '<code>Delegates.notNull()</code>'], a: 1, why: 'observable runs after the value is stored, so it can only react. vetoable runs before and returns false to reject the change.' },
        ],
        deeper: [
          {
            title: 'Write your own property delegate',
            body: `<p>Any object with the right <code>getValue</code> and <code>setValue</code> can be a delegate. Implement <code>ReadWriteProperty</code> and the compiler routes every read and write of the property through it.</p>
<p>Each call also receives <code>thisRef</code>, the object that owns the property, and <code>property</code>, which carries its name. One delegate class can back many properties and use each name as a storage key.</p>`,
            code: `class Pref(private val prefs: SharedPreferences) : ReadWriteProperty<Any?, String> {
    override fun getValue(thisRef: Any?, property: KProperty<*>): String =
        prefs.getString(property.name, "").orEmpty()

    override fun setValue(thisRef: Any?, property: KProperty<*>, value: String) =
        prefs.edit { putString(property.name, value) }
}

class Session(prefs: SharedPreferences) {
    var token by Pref(prefs)    // stored under "token"
    var theme by Pref(prefs)    // stored under "theme"
}`,
            visual(el) {
              const store = {};
              let busy = false;
              const owner = h('div', { class: 'kd-node' }, h('b', {}, 'session'), h('span', {}, 'var token, var theme'));
              const dele = h('div', { class: 'kd-node' }, h('b', {}, 'Pref'), h('span', {}, 'getValue / setValue'));
              const disk = h('div', { class: 'kd-node' }, h('b', {}, 'SharedPreferences'), h('span', {}, '{ }'));
              const call = h('div', { class: 'kd-log' });
              const o = out('Write a property, then read it back.');
              const paintDisk = () => { disk.lastChild.textContent = '{ ' + Object.entries(store).map(([k, v]) => `${k}=${v}`).join(', ') + ' }'; };
              const pulse = async n => { n.classList.add('kd-hit'); await sleep(330); n.classList.remove('kd-hit'); return el.isConnected; };
              async function write(name, v) {
                if (busy) return; busy = true;
                say(o, `${hl(`session.${name} = "${v}"`)} <span class="muted">has no field to write to</span>`);
                if (!await pulse(owner)) return;
                call.replaceChildren(h('div', { class: 'kd-log-line drop-in', html: hl(`setValue(session, ::${name}, "${v}")`) }));
                if (!await pulse(dele)) return;
                store[name] = `"${v}"`; paintDisk();
                if (!await pulse(disk)) return;
                say(o, `<span class="good">stored</span> under the key <b>${name}</b>, taken from property.name`);
                busy = false;
              }
              async function read(name) {
                if (busy) return; busy = true;
                if (!await pulse(owner)) return;
                call.replaceChildren(h('div', { class: 'kd-log-line drop-in', html: hl(`getValue(session, ::${name})`) }));
                if (!await pulse(dele)) return;
                if (!await pulse(disk)) return;
                say(o, `${hl(`session.${name}`)} = ${hl(store[name] || '""')} <span class="muted">${store[name] ? 'read from disk' : 'nothing stored yet, so the default'}</span>`);
                busy = false;
              }
              el.append(
                h('div', { class: 'kd-fwd' }, owner, h('span', { class: 'arrow' }, '→'), dele, h('span', { class: 'arrow' }, '→'), disk),
                call,
                h('div', { class: 'controls' }, cmd('session.token = "a1b2"', () => write('token', 'a1b2')), cmd('session.theme = "dark"', () => write('theme', 'dark')), cmd('session.token', () => read('token')), cmd('session.theme', () => read('theme'))),
                o);
            },
          },
          {
            title: 'lazy and threads',
            body: `<p><code>by lazy</code> takes a mode. The default, <code>SYNCHRONIZED</code>, holds a lock while the block runs. A second thread that reads at the same time waits, and the block runs once.</p>
<p><code>PUBLICATION</code> lets both threads run the block, and the first result to finish wins. <code>NONE</code> has no locking at all. It is fastest, but only safe when one thread ever touches the property, such as a view created on the main thread.</p>`,
            code: `val parser by lazy { JsonParser() }                                  // SYNCHRONIZED
val digest by lazy(LazyThreadSafetyMode.PUBLICATION) { sha256() }      // may run twice
val adapter by lazy(LazyThreadSafetyMode.NONE) { FeedAdapter() }       // main thread only`,
            visual(el) {
              const MODES = {
                SYNCHRONIZED: { a: [[0, 60, 'run']], b: [[8, 60, 'wait']], runs: 1, same: true, say: 'Thread B waited on the lock. The block ran once and both threads got the same object.' },
                PUBLICATION: { a: [[0, 60, 'run']], b: [[8, 60, 'run']], runs: 2, same: true, say: 'Both threads ran the block. A finished first, so its result was kept and B threw its own away.' },
                NONE: { a: [[0, 60, 'run']], b: [[8, 60, 'run']], runs: 2, same: false, say: 'No lock: both ran the block, and here each thread kept its own result. With NONE the outcome on two threads is undefined.' },
              };
              let mode = 'SYNCHRONIZED', busy = false;
              const tracks = { a: h('div', { class: 'lane-track' }), b: h('div', { class: 'lane-track' }) };
              const got = { a: h('span', { class: 'chip kd-ghost' }, '?'), b: h('span', { class: 'chip kd-ghost' }, '?') };
              const runs = h('span', { class: 'kd-stat' }, 'block ran 0 times');
              const o = out('Pick a mode, then let two threads read the property at the same moment.');
              const btns = Object.keys(MODES).map(k => act(k, () => { if (busy) return; mode = k; press(btns, btns[Object.keys(MODES).indexOf(k)]); clear(); say(o, `lazy(${k}). Run both threads.`); }));
              function clear() { Object.values(tracks).forEach(t => t.replaceChildren()); Object.values(got).forEach(g => { g.className = 'chip kd-ghost'; g.textContent = '?'; }); runs.textContent = 'block ran 0 times'; }
              async function run() {
                if (busy) return; busy = true; clear();
                const m = MODES[mode];
                for (const t of ['a', 'b']) for (const [l, w, cls] of m[t]) {
                  const bar = h('span', { class: `bar ${cls} kd-grow`, style: `left:${l}%;width:0` });
                  tracks[t].append(bar);
                  requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = `${w - l}%`; }));
                }
                await sleep(900); if (!el.isConnected) return;
                got.a.className = 'chip pop'; got.a.textContent = 'Parser@1a';
                await sleep(250); if (!el.isConnected) return;
                got.b.className = 'chip pop' + (m.same ? '' : ' kd-intruder'); got.b.textContent = m.same ? 'Parser@1a' : 'Parser@7f';
                runs.textContent = `block ran ${m.runs} time${m.runs > 1 ? 's' : ''}`; replay(runs, 'pop');
                say(o, (m.same ? '<span class="good">one instance.</span> ' : '<span class="bad">two instances.</span> ') + m.say);
                busy = false;
              }
              press(btns, btns[0]);
              el.append(
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'timeline' },
                  h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'thread A'), tracks.a),
                  h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'thread B'), tracks.b)),
                h('div', { class: 'kd-row' }, h('span', { class: 'kd-label' }, 'A got'), got.a, h('span', { class: 'kd-label' }, 'B got'), got.b, runs),
                h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Read on both threads')),
                o);
            },
          },
          {
            title: 'Delegates you already use',
            body: `<p>A <code>Map</code> can back properties directly: <code>val name: String by map</code> reads <code>map["name"]</code>. It is handy for parsed config, but a missing key throws on read.</p>
<p>Compose state is a delegate too. <code>var count by remember { mutableStateOf(0) }</code> works because the runtime defines <code>getValue</code> and <code>setValue</code> extensions on <code>State</code> and <code>MutableState</code>. Reading <code>count</code> calls <code>.value</code>, which is what lets Compose track the read.</p>`,
            code: `class FeatureFlags(values: Map<String, Any?>) {
    val newFeed: Boolean by values      // values["newFeed"]
    val maxItems: Int by values         // values["maxItems"]
}

@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }   // getValue/setValue on MutableState
    Button(onClick = { count++ }) { Text("Tapped $count times") }
}`,
          },
        ],
        underHood: {
          body: `<p>For a delegated property the compiler adds a hidden field that holds the delegate, and writes the getter and setter to call it. For <code>by lazy</code> the field is a <code>Lazy</code> and the getter reads its <code>value</code>.</p>
<p>For class delegation the compiler stores the delegate in a hidden field and writes one forwarding method for every interface member you didn't override. It captures the object you passed at construction. The names below are what you see in the bytecode.</p>`,
          code: `// You write
class CountingSet<T>(inner: MutableSet<T>) : MutableSet<T> by inner
class Screen { val formatter by lazy { build() } }

// Roughly what the compiler generates
class CountingSet<T>(inner: MutableSet<T>) : MutableSet<T> {
    private val \`$$delegate_0\` = inner
    override val size: Int get() = \`$$delegate_0\`.size
    override fun contains(element: T) = \`$$delegate_0\`.contains(element)
    // ...one forwarder per member you did not write
}
class Screen {
    private val \`formatter$delegate\` = lazy { build() }
    val formatter get() = \`formatter$delegate\`.value
}`,
        },
        mistakes: [
          { title: 'Expecting class delegation to follow a var', bad: 'class Player(var engine: Engine) : Engine by engine\n\nplayer.engine = ExoEngine()\nplayer.play()   // still calls the old engine', good: 'class Player(engine: Engine) : Engine {\n    var engine = engine\n    override fun play() = engine.play()\n}', why: 'The delegate is captured once, at construction. Reassigning the property does not change where the generated methods forward. Forward by hand if the target can change.' },
          { title: 'Using lazy for a value that changes', bad: 'class Profile(private val prefs: SharedPreferences) {\n    val name by lazy { prefs.getString("name", "") }\n}', good: 'class Profile(private val prefs: SharedPreferences) {\n    val name: String get() = prefs.getString("name", "").orEmpty()\n}', why: '<code>lazy</code> caches forever. After the user renames themselves, <code>name</code> still returns the old value. Use a getter, or observe the source.' },
          { title: 'Rejecting values with observable', bad: 'var volume by Delegates.observable(5) { _, _, new ->\n    if (new !in 0..10) volume = 5   // too late, and re-enters\n}', good: 'var volume by Delegates.vetoable(5) { _, _, new ->\n    new in 0..10                     // false keeps the old value\n}', why: '<code>observable</code> runs after the value is stored. <code>vetoable</code> runs before and can refuse the change.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'class CountingSet<T>(\n    private val inner: MutableSet<T> = mutableSetOf(),\n) : MutableSet<T> by inner {\n    var attempts = 0\n    override fun add(element: T): Boolean {\n        attempts++\n        return inner.add(element)\n    }\n}\nval set = CountingSet<String>()\nset.add("a")\nset.add("a")\nprintln(set.size)\nprintln(set.contains("a"))',
            predict: {
              q: 'Line 12 adds <code>"a"</code> a second time. What are <code>attempts</code> and <code>set.size</code> afterwards?',
              options: ['2 and 1', '1 and 1', '2 and 2'],
              a: 0,
              why: '<code>add</code> is your override, so it counts every call. It then forwards to <code>inner</code>, a real Set, which ignores the duplicate.',
            },
            frames: [
              { say: '<code>by inner</code> makes the compiler write every <code>MutableSet</code> method for you. You override only <code>add</code>.' },
              { line: 10, vars: { attempts: '0', inner: '{}' }, stack: ['main'], say: 'A CountingSet wraps a fresh, empty <code>mutableSetOf()</code>.' },
              { line: [11, 5], stack: ['main', 'CountingSet.add("a")'], say: '<code>add</code> is overridden, so your code runs, not a generated forwarder.' },
              { line: 6, vars: { attempts: '1' }, say: 'Your extra behaviour: count the attempt.' },
              { line: 7, vars: { inner: '{a}' }, stack: ['main', 'CountingSet.add("a")', 'inner.add("a")'], say: 'Then hand the real work to <code>inner</code>. It stores "a" and returns <code>true</code>.' },
              { line: [12, 5, 6, 7], vars: { attempts: '2' }, stack: ['main', 'CountingSet.add("a")', 'inner.add("a")'], say: 'Again: the attempt is counted, but <code>inner</code> already has "a", returns <code>false</code> and stays <code>{a}</code>.' },
              { line: [13, 3], stack: ['main', 'size (generated)', 'inner.size'], out: '1', say: 'You never wrote <code>size</code>. The compiler generated it from <code>by inner</code>: it just returns <code>inner.size</code>.' },
              { line: [14, 3], stack: ['main', 'contains (generated)', 'inner.contains("a")'], out: 'true', say: 'The same for <code>contains</code> and every other member you did not override.' },
            ],
          });
        },
        play: `import kotlin.properties.Delegates

class CountingSet<T>(
    private val inner: MutableSet<T> = mutableSetOf(),
) : MutableSet<T> by inner {
    var attempts = 0
        private set

    override fun add(element: T): Boolean {
        attempts++
        return inner.add(element)
    }
}

class Search {
    val index by lazy { println("building index"); listOf("ada", "grace") }
    var filter: String by Delegates.observable("") { _, old, new -> println("filter '$old' -> '$new'") }
}

fun main() {
    val set = CountingSet<String>()
    set.add("a"); set.add("a"); set.add("b")
    // add set.addAll(listOf("c", "d")) here: does attempts change?
    println("size=\${set.size} attempts=\${set.attempts}")

    val s = Search()
    println(s.index.size)
    println(s.index.size)   // no second "building index"
    s.filter = "k"
    s.filter = "ko"
}`,
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
          { q: 'What does <code>f()</code> print?<pre class="code mini"><code>fun f() {\n    listOf(1, 2, 3).forEach {\n        if (it == 2) return\n        print(it)\n    }\n    print("done")\n}</code></pre>', options: ['<code>1</code>', '<code>13done</code>', '<code>1done</code>'], a: 0, why: 'forEach is inline, so a bare return leaves f() itself. Nothing after the loop runs.' },
          { q: 'Same code, but with <code>return@forEach</code> instead of <code>return</code>. What does it print?', options: ['<code>13done</code>', '<code>1</code>', '<code>1done</code>'], a: 0, why: 'A labelled return only leaves the current lambda call, like continue in a loop. 2 is skipped and the function goes on to print done.' },
          { q: 'This does not compile. Which modifier on <code>action</code> is the intended fix?<pre class="code mini"><code>inline fun View.onClick(action: () -&gt; Unit) {\n    setOnClickListener { action() }\n}</code></pre>', options: ['<code>crossinline</code>', '<code>reified</code>', '<code>@PublishedApi</code>'], a: 0, why: 'action is called from inside another lambda that runs later, where a non-local return can’t work. crossinline forbids that return and lets the call compile.' },
        ],
        deeper: [
          {
            title: 'noinline: keep one lambda as an object',
            body: `<p>An inlined lambda has no object, so you can't store it, put it in a list or pass it to a non-inline function. If an inline function needs to keep one of its lambdas, mark that parameter <code>noinline</code>.</p>
<p>The other lambdas are still pasted in. Only the <code>noinline</code> one becomes a real function object, with the cost that brings.</p>`,
            code: `private val pending = mutableListOf<() -> Unit>()

inline fun track(onStart: () -> Unit, noinline onDone: () -> Unit) {
    onStart()            // pasted into the caller
    pending += onDone    // stored: needs a real object
}`,
            visual(el) {
              let noinl = false, busy = false, calls = 0;
              const sw = h('input', { type: 'checkbox', id: 'kd-noinline' });
              const decl = h('div', { class: 'kt' });
              const site = h('div', { class: 'kt' });
              const heap = h('div', { class: 'kd-heap' });
              const o = out('');
              const empty = () => heap.replaceChildren(h('span', { class: 'kd-empty' }, 'pending is empty'));
              function paint() {
                lines(decl, [
                  { src: `inline fun track(onStart: () -> Unit, ${noinl ? 'noinline ' : ''}onDone: () -> Unit) {`, cls: noinl ? 'kd-new' : '' },
                  { src: '    onStart()' },
                  { src: '    pending += onDone', cls: noinl ? '' : 'kd-warn', note: noinl ? '' : '✗ illegal', noteCls: 'bad' },
                  { src: '}' },
                ]);
                lines(site, [{ src: 'track(onStart = { log("start") }, onDone = { log("done") })' }]);
                calls = 0; empty();
                say(o, noinl ? 'onDone is a real object now. Call track() a few times.' : 'Both lambdas are inline. Try to call track().');
              }
              sw.addEventListener('change', () => { if (busy) { sw.checked = noinl; return; } noinl = sw.checked; paint(); });
              async function call() {
                if (busy) return; busy = true;
                if (!noinl) {
                  replay(decl, 'shake');
                  say(o, `<span class="bad">compile error:</span> Illegal usage of inline parameter 'onDone'. Add 'noinline' modifier to the parameter declaration.`);
                  await sleep(400); busy = false; return;
                }
                const rows = [...decl.children];
                replay(rows[1], 'kd-flash'); await sleep(350); if (!el.isConnected) return;
                replay(rows[2], 'kd-flash');
                if (!calls) heap.replaceChildren();
                calls++;
                heap.append(h('span', { class: 'kd-obj drop-in' }, `λ onDone #${calls}`));
                while (heap.children.length > 6) heap.firstElementChild.remove();
                say(o, `<span class="good">call ${calls}:</span> log("start") ran in place, and one onDone object went into pending.`);
                await sleep(300); busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'kd-noinline' }, sw, 'noinline onDone')),
                decl, site,
                h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'pending (heap)'), heap),
                h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: call }, 'Call track()')),
                o);
            },
          },
          {
            title: 'reified means one copy per type',
            body: `<p>A reified function is not one function that knows <code>T</code>. The compiler pastes a fresh copy at each call site, with <code>T</code> replaced by the real class. <code>extra&lt;User&gt;()</code> becomes code that names <code>User::class.java</code>.</p>
<p>That is also why Java code can't use it. Nothing fills in <code>T</code> for a direct call, so the compiled method's body only throws.</p>`,
            code: `inline fun <reified T : Parcelable> Intent.extra(key: String): T? =
    IntentCompat.getParcelableExtra(this, key, T::class.java)

val user = intent.extra<User>("user")
// compiles to: IntentCompat.getParcelableExtra(intent, "user", User::class.java)`,
            visual(el) {
              const TYPES = ['User', 'Article', 'Comment'];
              let busy = false;
              const sites = h('div', { class: 'kd-log' });
              const count = h('span', { class: 'kd-stat' }, 'call sites: 0');
              const o = out('Call the function with different types and watch each call site get its own copy.');
              async function callWith(t) {
                if (busy) return; busy = true;
                if (sites.children.length >= 4) sites.lastElementChild.remove();
                const line = h('div', { class: 'kd-log-line drop-in', html: `${hl(`intent.extra<${t}>("${t.toLowerCase()}")`)}` });
                sites.prepend(line);
                await sleep(500); if (!el.isConnected) return;
                line.innerHTML = hl(`IntentCompat.getParcelableExtra(intent, "${t.toLowerCase()}", ${t}::class.java)`);
                replay(line, 'kd-flash');
                count.textContent = `call sites: ${sites.children.length}`; replay(count, 'pop');
                say(o, `<span class="good">inlined:</span> T became ${hl(`${t}::class.java`)} right here. No type is looked up at runtime.`);
                busy = false;
              }
              function fromJava() {
                replay(sites, 'shake');
                say(o, `${hl('IntentExtKt.extra(intent, "user")')} <span class="muted">called directly, not inlined →</span> <span class="bad">UnsupportedOperationException:</span> This function has a reified type parameter and thus can only be inlined at compilation time, not called directly.`);
              }
              el.append(
                h('span', { class: 'kd-tag', html: hl('inline fun <reified T : Parcelable> Intent.extra(key: String): T?') }),
                h('div', { class: 'controls' }, TYPES.map(t => cmd(`extra<${t}>(...)`, () => callWith(t))), act('Call the compiled method directly', fromJava)),
                h('div', { class: 'kd-card' }, h('div', { class: 'kd-row' }, h('span', { class: 'kd-label' }, 'compiled call sites'), count), sites),
                o);
            },
          },
          {
            title: 'When not to inline',
            body: `<p>Inlining copies code into every caller, so a long inline function called from many places grows the app. Keep inline functions short, and inline only when a lambda parameter or a reified type makes it pay off. The compiler warns when it sees no benefit.</p>
<p>A public inline function is pasted into other modules, so it may only touch public API. To call an internal helper from it, mark the helper <code>@PublishedApi internal</code>. It stays hidden from callers but becomes part of your binary contract.</p>`,
            code: `inline fun <T> Cache.getOrPut(key: String, load: () -> T): T =
    read<T>(key) ?: load().also { write(key, it) }

@PublishedApi
internal fun <T> Cache.read(key: String): T? = TODO()   // visible to inlined code only
@PublishedApi
internal fun Cache.write(key: String, value: Any?): Unit = TODO()`,
          },
        ],
        underHood: {
          body: `<p><code>forEach</code> is an ordinary inline function in the standard library. After inlining, the call becomes a plain loop in your function, which is why <code>return</code> leaves your function.</p>
<p>A lambda passed to a non-inline function needs an object. Since Kotlin 2.0 the compiler builds it with <code>invokedynamic</code> and the JVM's <code>LambdaMetafactory</code>. Older versions generated one class per lambda. Either way, a lambda that captures variables is a new object per call, and one that captures nothing is reused.</p>`,
          code: `// stdlib
public inline fun <T> Iterable<T>.forEach(action: (T) -> Unit) {
    for (element in this) action(element)
}

// You write, inside hasAdmin()
users.forEach { if (it.isAdmin) return true }

// What ends up in hasAdmin() after inlining
for (element in users) { if (element.isAdmin) return true }`,
        },
        mistakes: [
          { title: 'return where you meant to skip', bad: 'fun printNames(names: List<String>) {\n    names.forEach {\n        if (it.isBlank()) return   // stops everything\n        println(it)\n    }\n    println("done")\n}', good: 'fun printNames(names: List<String>) {\n    names.forEach {\n        if (it.isBlank()) return@forEach   // skips this one\n        println(it)\n    }\n    println("done")\n}', why: 'A bare <code>return</code> in an inline lambda leaves the whole function, so later names and "done" never print. <code>return@forEach</code> works like <code>continue</code>.' },
          { title: 'Inlining a function with no lambda', bad: 'inline fun dp(px: Int, density: Float): Int =\n    (px / density).roundToInt()', good: 'fun dp(px: Int, density: Float): Int =\n    (px / density).roundToInt()', why: 'With no lambda and no reified type there is nothing to save, only code to copy. The compiler warns that the performance impact is insignificant.' },
          { title: 'Touching private code from a public inline function', bad: 'class Repo {\n    private val cache = mutableMapOf<String, Any>()\n    inline fun <reified T> cached(key: String): T? = cache[key] as? T\n}', good: 'class Repo {\n    @PublishedApi internal val cache = mutableMapOf<String, Any>()\n    inline fun <reified T> cached(key: String): T? = cache[key] as? T\n}', why: 'The body is pasted into callers outside the class, where <code>private</code> members don’t exist. The compiler rejects it. <code>@PublishedApi internal</code> allows it.' },
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
        predict: {
          "q": "Not inline: <code>repeat(5) { i -> measure(\"row\") { draw(i) } }</code>. How many lambda objects does the loop create?",
          "options": [
            "0",
            "1, reused for every call",
            "5, one per call, because it captures i"
          ],
          "a": 2,
          "why": "A lambda that captures a local value needs a new object for each call. Mark <code>measure</code> inline and the body is pasted in place, with no object at all."
        },
        play: `inline fun <reified T> check(x: Any): String =
    if (x is T) "$x is a \${T::class.simpleName}" else "$x is not a \${T::class.simpleName}"

fun hasNegative(xs: List<Int>): Boolean {
    xs.forEach { if (it < 0) return true }   // leaves hasNegative, not just the lambda
    return false
}

fun f() {
    listOf(1, 2, 3).forEach {
        if (it == 2) return        // change return to return@forEach and run again
        print(it)
    }
    print(" done")
}

fun main() {
    println(check<String>("hi"))
    println(check<Int>("hi"))
    println(hasNegative(listOf(3, -1, 4)))
    f()
    println()
}`
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
          { q: 'What is the type of <code>r</code> in <code>val r = user.apply { name.length }</code>?', options: ['<code>Int</code>', '<code>User</code>', '<code>Unit</code>'], a: 1, why: 'apply always returns its receiver and drops the block’s last expression. Use run or let when you want the computed value.' },
          { q: 'What happens with <code>Box { Text("Name", Modifier.weight(1f)) }</code>?', options: ['It compiles and weight is ignored', 'It does not compile: weight is not in scope', 'It compiles and fills the Box'], a: 1, why: 'weight is an extension declared inside RowScope and ColumnScope, so it only resolves inside a Row or Column content lambda.' },
          { q: 'Only SettingsBuilder has the @SettingsDsl marker, not SectionBuilder. Inside <code>section("A") { }</code> you call <code>section("B") { }</code>. What happens?', options: ['It is a compile error', 'It throws at runtime', 'It compiles and adds B to the outer settings'], a: 2, why: 'An outer receiver is blocked only when a nearer receiver carries the same marker. Put the marker on every builder class.' },
        ],
        deeper: [
          {
            title: 'Receiver or parameter: the scope functions',
            body: `<p>The five scope functions are the smallest DSLs you use every day. <code>apply</code>, <code>run</code> and <code>with</code> take a lambda with receiver, so the object is <code>this</code>. <code>also</code> and <code>let</code> take a plain lambda, so the object is <code>it</code>.</p>
<p>They also differ in what they return. <code>apply</code> and <code>also</code> hand back the object itself, which is why builders end with <code>apply(block)</code>. <code>run</code>, <code>let</code> and <code>with</code> return the lambda's last expression.</p>`,
            code: `val user = User(name = "Ada")

user.apply { name.length }     // this = user, returns user
user.also { it.name.length }   // it = user,   returns user
user.run { name.length }       // this = user, returns 3
user.let { it.name.length }    // it = user,   returns 3
with(user) { name.length }     // this = user, returns 3`,
            visual(el) {
              const FNS = [
                { n: 'apply', src: 'val r = user.apply { name.length }', type: 'User.() -> Unit', ref: 'this', ret: 'user', retT: 'User' },
                { n: 'also', src: 'val r = user.also { it.name.length }', type: '(User) -> Unit', ref: 'it', ret: 'user', retT: 'User' },
                { n: 'run', src: 'val r = user.run { name.length }', type: 'User.() -> R', ref: 'this', ret: '3', retT: 'Int' },
                { n: 'let', src: 'val r = user.let { it.name.length }', type: '(User) -> R', ref: 'it', ret: '3', retT: 'Int' },
                { n: 'with', src: 'val r = with(user) { name.length }', type: 'User.() -> R', ref: 'this', ret: '3', retT: 'Int' },
              ];
              let busy = false;
              const call = h('div', { class: 'kt' });
              const type = h('span', { class: 'kd-tag' });
              const inside = h('div', { class: 'kd-slot' });
              const result = h('div', { class: 'kd-slot' });
              const rtype = h('span', { class: 'kd-count' });
              const lam = h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'lambda type'), type, h('span', { class: 'kd-label' }, 'inside the braces'), inside);
              const res = h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'r holds'), result, rtype);
              const o = out('');
              const btns = FNS.map(f => cmd(f.n, () => run(f)));
              function show(f) {
                press(btns, btns[FNS.indexOf(f)]);
                lines(call, [{ src: f.src, cls: 'kd-flash' }]);
                type.innerHTML = hl(f.type); replay(type, 'pop-soft');
              }
              async function run(f) {
                if (busy) return; busy = true;
                show(f);
                lam.classList.add('kd-hit');
                swap(inside, `${f.ref} = user`);
                say(o, `${hl(f.n)} <span class="muted">runs the lambda with the object as</span> ${hl(f.ref)}`);
                await sleep(600); if (!el.isConnected) return;
                lam.classList.remove('kd-hit'); res.classList.add('kd-hit');
                swap(result, f.ret); rtype.textContent = `r: ${f.retT}`;
                say(o, `${hl(f.n)} <span class="muted">returns</span> ${hl(f.ret)} <span class="muted">(${f.ret === 'user' ? 'the object itself, the last expression is ignored' : 'the last expression of the lambda'})</span>`);
                await sleep(450); res.classList.remove('kd-hit'); busy = false;
              }
              show(FNS[0]); swap(inside, 'this = user'); swap(result, 'user'); rtype.textContent = 'r: User';
              say(o, 'Same body every time: name.length. Pick a scope function.');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'user = User(name = "Ada")'), btns),
                call,
                h('div', { class: 'kd-pair' }, lam, res),
                o);
            },
          },
          {
            title: 'The innermost receiver wins, and this@label reaches out',
            body: `<p>Inside nested lambdas, Kotlin looks for a name on the innermost receiver first, then on each outer one. If two builders both have a <code>title</code>, the nearer one shadows the outer one, and nothing warns you which one you got.</p>
<p>With <code>@DslMarker</code>, an outer receiver of the same DSL is off limits for implicit calls, even when it is the only match. To use it on purpose, name it with a label. <code>this@section</code> means the receiver of the lambda passed to <code>section</code>.</p>`,
            code: `settings {                        // this@settings: SettingsBuilder
    title = "Preferences"
    section("Account") {          // this@section: SectionBuilder
        title = "Account"
        toggle {                  // this@toggle: ToggleBuilder
            label = this@section.title    // explicit: always allowed
        }
    }
}`,
            visual(el) {
              const RECV = [
                { lbl: 'this@toggle', t: 'ToggleBuilder', m: { label: '""', enabled: 'true' } },
                { lbl: 'this@section', t: 'SectionBuilder', m: { title: '"Account"', 'toggle { }': '' } },
                { lbl: 'this@settings', t: 'SettingsBuilder', m: { title: '"Preferences"', 'section { }': '' } },
              ];
              const CALLS = [
                { src: 'label = "Sync"', name: 'label', from: 0 },
                { src: 'label = title', name: 'title', from: 0 },
                { src: 'label = this@section.title', name: 'title', from: 1, explicit: true },
                { src: 'label = this@settings.title', name: 'title', from: 2, explicit: true },
              ];
              let marker = true, busy = false;
              const cards = RECV.map(r => {
                const mem = {};
                const row = h('div', { class: 'kd-row' }, Object.keys(r.m).map(k => (mem[k] = h('span', { class: 'kd-tag' }, k))));
                const c = h('div', { class: 'kd-node' }, h('b', { html: hl(`${r.lbl}: ${r.t}`) }), row);
                c.mem = mem; return c;
              });
              const sw = h('input', { type: 'checkbox', id: 'kd-dsl-marker2', checked: true });
              const o = out('');
              function clear() {
                cards.forEach(c => { c.classList.remove('kd-hit', 'kd-dsl-ok', 'kd-bad', 'kd-dim'); Object.values(c.mem).forEach(m => m.classList.remove('kd-dsl-match', 'kd-dsl-miss')); });
              }
              sw.addEventListener('change', () => {
                if (busy) { sw.checked = marker; return; }
                marker = sw.checked; clear();
                say(o, marker ? '@DslMarker on: only the innermost receiver is implicit.' : '@DslMarker off: every outer receiver is searched, nearest first.');
              });
              async function call(c) {
                if (busy) return; busy = true;
                clear();
                for (let i = c.from; i < cards.length; i++) {
                  const card = cards[i], hit = card.mem[c.name];
                  card.classList.add('kd-hit'); replay(card, 'pop-soft');
                  await sleep(420); if (!el.isConnected) return;
                  card.classList.remove('kd-hit');
                  if (!hit) { card.classList.add('kd-dim'); continue; }
                  const val = RECV[i].m[c.name];
                  if (i > 0 && !c.explicit && marker) {
                    card.classList.add('kd-bad'); hit.classList.add('kd-dsl-miss'); replay(card, 'shake');
                    say(o, `${hl(c.src)} <span class="bad">compile error:</span> '${c.name}' can't be used in this context by implicit receiver. Use the explicit one if necessary.`);
                  } else {
                    card.classList.add('kd-dsl-ok'); hit.classList.add('kd-dsl-match'); replay(hit, 'pop');
                    const shadow = i === 1 && !c.explicit;
                    say(o, `${hl(c.src)} <span class="good">resolves on ${RECV[i].t}:</span> ${hl(val)}${shadow ? ' <span class="muted">(SettingsBuilder.title is shadowed)</span>' : ''}`);
                  }
                  break;
                }
                await sleep(300); busy = false;
              }
              say(o, 'The code runs inside toggle { }. Assign label and watch where each name resolves.');
              el.append(
                h('label', { class: 'switch', for: 'kd-dsl-marker2' }, sw, '@DslMarker on all three builders'),
                h('div', { class: 'kd-dsl-stack' }, h('span', { class: 'kd-label' }, 'implicit receivers, innermost first'), cards),
                h('div', { class: 'controls' }, CALLS.map(c => cmd(c.src, () => call(c)))),
                o);
            },
          },
          {
            title: 'Words that exist only inside one block',
            body: `<p>A scope interface can declare extension functions as members. Compose does this with <code>Modifier.weight()</code>. It is declared inside <code>RowScope</code> and <code>ColumnScope</code>, so it only resolves inside the content lambda of a <code>Row</code> or <code>Column</code>. Inside a <code>Box</code> it is an unresolved reference.</p>
<p>Compose also marks its lazy list scopes with its own DSL marker, <code>@LazyScopeMarker</code>. That is why calling <code>items()</code> from inside one item's content doesn't compile.</p>`,
            code: `interface RowScope {
    fun Modifier.weight(weight: Float, fill: Boolean = true): Modifier
    // ...
}

Row {
    Text("Name", Modifier.weight(1f))   // ok: this is RowScope
}
Box {
    Text("Name", Modifier.weight(1f))   // error: unresolved reference 'weight'
}`,
          },
        ],
        underHood: {
          body: `<p>A receiver is just a first parameter. At runtime <code>StringBuilder.() -> Unit</code> and <code>(StringBuilder) -> Unit</code> are the same type, <code>Function1&lt;StringBuilder, Unit&gt;</code>, and Kotlin lets you assign one to the other. <code>sb.greet()</code> and <code>greet(sb)</code> compile to the same <code>invoke(sb)</code> call.</p>
<p>The scope functions and <code>buildString</code> are <code>inline</code>, so the lambda body is pasted into the caller and no function object exists. A non-inline builder like <code>settings { }</code> does get a lambda object. Since Kotlin 2.0 the JVM backend creates it with <code>invokedynamic</code> by default. <code>@DslMarker</code> only changes what the compiler accepts. It adds no runtime check.</p>`,
          code: `val greet: StringBuilder.() -> Unit = { append("Hi") }
val plain: (StringBuilder) -> Unit = greet   // same type underneath

val sb = StringBuilder()
sb.greet()     // greet.invoke(sb)
greet(sb)      // greet.invoke(sb), identical`,
        },
        mistakes: [
          { title: 'Using apply when you need the result', bad: 'val nameLength = user.apply { name.length }\n// nameLength is the User, not an Int', good: 'val nameLength = user.run { name.length }', why: '<code>apply</code> always returns its receiver and drops the last expression. Use <code>run</code> or <code>let</code> when you want what the lambda computes.' },
          { title: 'Marking only one builder', bad: '@DslMarker annotation class SettingsDsl\n\n@SettingsDsl class SettingsBuilder { /* section() */ }\nclass SectionBuilder { /* toggle() */ }\n// section() still leaks into section blocks', good: '@DslMarker annotation class SettingsDsl\n\n@SettingsDsl class SettingsBuilder { /* section() */ }\n@SettingsDsl class SectionBuilder { /* toggle() */ }', why: 'An outer receiver is blocked only when a nearer receiver carries the same marker. Put it on every builder class, or on an interface they all implement.' },
          { title: 'A self-assignment hidden by shadowing', bad: 'class Header(var text: String = "")\n\nclass Screen(private val text: String) {\n    fun header() = Header().apply {\n        text = text   // Header.text = Header.text\n    }\n}', good: 'class Screen(private val text: String) {\n    fun header() = Header().apply {\n        text = this@Screen.text\n    }\n}', why: 'Inside <code>apply</code>, the receiver\'s members shadow the outer class. Both sides of <code>text = text</code> mean <code>Header.text</code>. Name the outer one with a label, or rename it.' },
        ],
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'call', label: 'settings { }', x: 17, y: 12, tone: 'muted' },
              { id: 'sb', label: 'SettingsBuilder<small>section()</small>', x: 83, y: 12, hidden: true },
              { id: 'sec', label: 'section<small>"Account"</small>', x: 17, y: 50, tone: 'muted', hidden: true },
              { id: 'secb', label: 'SectionBuilder<small>toggle()</small>', x: 83, y: 88, hidden: true },
              { id: 'tog', label: 'toggle<small>"Sync"</small>', x: 17, y: 88, tone: 'muted', hidden: true },
              { id: 'oops', label: 'section<small>"Oops"</small>', x: 50, y: 50, tone: 'muted', hidden: true },
            ],
            predict: {
              q: 'Inside <code>section("Account") { }</code>, <code>toggle("Sync")</code> has no prefix. Which object receives that call?',
              options: ['The SectionBuilder for Account', 'The SettingsBuilder', 'Both, since both are in scope'],
              a: 0,
              why: 'A call without a prefix resolves on the nearest implicit receiver. The innermost lambda’s <code>this</code> is the SectionBuilder.',
            },
            frames: [
              { say: 'A DSL is nested lambdas with receivers. Follow which object each call lands on.' },
              { show: ['sb'], add: [['call', 'sb', 'this']], say: '<code>settings { }</code> creates a SettingsBuilder and runs your lambda with it as <code>this</code>.' },
              { show: ['sec'], add: [['sec', 'sb']], say: '<code>section(...)</code> has no prefix. The nearest receiver, SettingsBuilder, has that member.' },
              { show: ['secb'], add: [['sec', 'secb', 'this']], say: '<code>section</code> builds a SectionBuilder and runs the inner lambda with that as <code>this</code>.' },
              { show: ['tog'], add: [['tog', 'secb', 'nearest this', 'ok']], hl: ['tog', 'secb'], say: '<code>toggle("Sync")</code> resolves on the innermost receiver. That is what you meant.' },
              { show: ['oops'], add: [['oops', 'sb', 'outer this', 'warm']], hl: ['oops', 'sb'], say: 'Call <code>section("Oops")</code> in the same block. SectionBuilder has no <code>section</code>, so the compiler looks outward and quietly finds SettingsBuilder. Oops becomes a top-level section.' },
              { add: [['oops', 'sb', 'error', 'err']], hl: ['oops'], say: 'Mark both builders with your <code>@DslMarker</code> annotation and the outer receiver is no longer implicit. The mistake is now a compile error. Write <code>this@settings.section</code> if you really mean it.' },
            ],
          });
        },
        play: `@DslMarker annotation class SettingsDsl

@SettingsDsl class SectionBuilder(private val title: String) {
    private val rows = mutableListOf<String>()
    fun toggle(label: String) { rows += label }
    fun build() = "$title: $rows"
}

@SettingsDsl class SettingsBuilder {
    private val sections = mutableListOf<String>()
    fun section(title: String, block: SectionBuilder.() -> Unit) {
        sections += SectionBuilder(title).apply(block).build()
    }
    fun build(): List<String> = sections
}

fun settings(block: SettingsBuilder.() -> Unit) = SettingsBuilder().apply(block).build()

fun main() {
    val screen = settings {
        section("Account") {
            toggle("Sync")       // this is SectionBuilder here
            toggle("Backup")
        }
        section("Alerts") { toggle("Sound") }
        // put section("Oops") { } inside the Alerts block: @DslMarker rejects it
    }
    screen.forEach(::println)
    println(buildString { append("built with "); append("a receiver") })
}`,
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
          { q: 'Both <code>fun load(id: UserId)</code> and <code>fun load(id: OrderId)</code> take a String at runtime. How does the JVM keep them apart?', options: ['It doesn’t: they clash and the file won’t compile', 'The compiler adds a hash to each function’s JVM name', 'The JVM picks one at runtime by checking the value'], a: 1, why: 'Functions that take value classes get mangled names like load-<hash>. Use @JvmName to give Java a name it can call.' },
          { q: 'What does this print?<pre class="code mini"><code>val raw: Byte = 0xFF.toByte()\nprintln(raw.toInt())</code></pre>', options: ['255', '-1', '0'], a: 1, why: 'Byte is signed, so the bits 1111 1111 read as -1. toUByte().toInt() or and 0xFF gives 255.' },
        ],
        deeper: [
          {
            title: 'Name mangling keeps overloads apart',
            body: `<p>At runtime both <code>UserId</code> and <code>OrderId</code> are a <code>String</code>. So <code>load(id: UserId)</code> and <code>load(id: OrderId)</code> would both become <code>load(String)</code> on the JVM, which is a clash. The compiler avoids it by adding a stable hash to the name of every function that takes a value class: <code>load-&lt;hash&gt;(String)</code>.</p>
<p>Java can't call a name with a dash in it. To expose such a function to Java, choose its JVM name yourself with <code>@JvmName</code>.</p>`,
            code: `@JvmInline value class UserId(val raw: String)
@JvmInline value class OrderId(val raw: String)

fun load(id: UserId) { }       // JVM: load-<hash>(String)
fun load(id: OrderId) { }      // JVM: load-<hash2>(String)

@JvmName("refundOrder")
fun refund(id: OrderId) { }    // JVM: refundOrder(String), callable from Java`,
            visual(el) {
              let mangle = true, jvmName = false, busy = false;
              const src = h('div', { class: 'kt' });
              const jvm = h('div', { class: 'kt' });
              const o = out('');
              const swM = h('input', { type: 'checkbox', id: 'kd-vcl-mangle', checked: true });
              const swJ = h('input', { type: 'checkbox', id: 'kd-vcl-jvmname' });
              const sigs = () => [
                mangle ? 'load-<hash>(String)' : 'load(String)',
                mangle ? 'load-<hash2>(String)' : 'load(String)',
                jvmName ? 'refundOrder(String)' : (mangle ? 'refund-<hash3>(String)' : 'refund(String)'),
              ];
              function paintSrc() {
                lines(src, [
                  { src: 'fun load(id: UserId)' },
                  { src: 'fun load(id: OrderId)' },
                  ...(jvmName ? [{ src: '@JvmName("refundOrder")', cls: 'kd-new' }] : []),
                  { src: 'fun refund(id: OrderId)' },
                ]);
                lines(jvm, [{ src: '// press Compile', cls: 'kd-off' }]);
              }
              async function compile() {
                if (busy) return; busy = true;
                paintSrc();
                const s = sigs(), rows = [];
                for (let i = 0; i < s.length; i++) {
                  await sleep(300); if (!el.isConnected) return;
                  const clash = !mangle && i < 2;
                  rows.push({ src: `void ${s[i]}`, cls: clash ? 'kd-warn' : 'kd-new', note: clash ? 'same signature' : '', noteCls: 'bad' });
                  lines(jvm, rows);
                }
                if (!mangle) { replay(jvm, 'shake'); say(o, '<span class="bad">Platform declaration clash:</span> The following declarations have the same JVM signature (load(Ljava/lang/String;)V) <span class="muted">(this is what mangling prevents)</span>'); }
                else say(o, '<span class="good">compiled:</span> each function got its own JVM name, so the two load overloads no longer collide.');
                busy = false;
              }
              async function fromJava() {
                if (busy) return; busy = true;
                if (jvmName) say(o, `${hl('RepoKt.refundOrder("o_77");')} <span class="good">ok from Java:</span> @JvmName gave it a legal name. Java passes a plain String.`);
                else { replay(src, 'shake'); say(o, `${hl('RepoKt.refund("o_77");')} <span class="bad">Java can't see it:</span> the JVM name is ${hl(mangle ? 'refund-<hash3>' : 'refund')}${mangle ? ', and a dash is not legal in a Java identifier' : ''}.`); }
                await sleep(400); busy = false;
              }
              swM.addEventListener('change', () => { if (busy) { swM.checked = mangle; return; } mangle = swM.checked; paintSrc(); say(o, mangle ? 'Mangling on, as the real compiler does.' : '<span class="bad">pretend mode:</span> no hash suffix. Compile and see why it exists.'); });
              swJ.addEventListener('change', () => { if (busy) { swJ.checked = jvmName; return; } jvmName = swJ.checked; paintSrc(); replay(src, 'pop-soft'); say(o, jvmName ? '@JvmName("refundOrder") added to refund().' : '@JvmName removed.'); });
              paintSrc();
              say(o, 'Compile the file and read the JVM signatures.');
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'kd-vcl-mangle' }, swM, 'Mangle names'), h('label', { class: 'switch', for: 'kd-vcl-jvmname' }, swJ, '@JvmName on refund()')),
                h('div', { class: 'kd-pair' },
                  h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'Kotlin source'), src),
                  h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'JVM signatures'), jvm)),
                h('div', { class: 'controls' }, act('Compile', compile), cmd('RepoKt.refund("o_77")  // from Java', fromJava)),
                o);
            },
          },
          {
            title: 'Unsigned types: same bits, different type',
            body: `<p><code>UByte</code>, <code>UShort</code>, <code>UInt</code> and <code>ULong</code> are value classes in the standard library. A <code>UByte</code> wraps a <code>Byte</code>: the same eight bits in memory, but a different type, so the compiler reads them differently.</p>
<p>This matters when you parse bytes from Bluetooth or a binary file. <code>Byte</code> is signed, so the bits <code>1111 1111</code> read as -1. Convert with <code>toUByte()</code>, or mask with <code>and 0xFF</code>, to get 255.</p>`,
            code: `val raw: Byte = packet[0]          // bits 1111 1111
raw.toInt()                        // -1: Byte is signed
raw.toUByte().toInt()              // 255: same bits, unsigned type
raw.toInt() and 0xFF               // 255: the classic mask`,
            visual(el) {
              let v = 0xFF;
              const bits = Array.from({ length: 8 }, (_, i) => {
                const w = 7 - i;
                return h('button', { class: 'kd-vcl-bit', type: 'button', 'aria-label': `bit ${w}`, onclick() { v ^= 1 << w; paint(true); } });
              });
              const signed = h('span', { class: 'chip' }), unsigned = h('span', { class: 'chip' });
              const sCard = h('div', { class: 'kd-card' }, h('span', { class: 'kd-tag', html: hl('raw.toInt()') }), signed, h('span', { class: 'kd-label' }, 'as Byte (signed)'));
              const uCard = h('div', { class: 'kd-card' }, h('span', { class: 'kd-tag', html: hl('raw.toUByte().toInt()') }), unsigned, h('span', { class: 'kd-label' }, 'as UByte'));
              const hex = h('span', { class: 'kd-count' });
              const o = out('');
              function paint(anim) {
                bits.forEach((b, i) => { const on = (v >> (7 - i)) & 1; b.textContent = String(on); b.setAttribute('aria-pressed', String(!!on)); });
                const s = v >= 128 ? v - 256 : v;
                signed.textContent = String(s); unsigned.textContent = String(v);
                hex.textContent = `0x${v.toString(16).toUpperCase().padStart(2, '0')} · one byte in memory either way`;
                sCard.classList.toggle('kd-hit', s !== v);
                if (anim) { replay(signed, 'pop'); replay(unsigned, 'pop'); }
                say(o, s === v ? `Top bit is 0: both types read ${v}.` : `Top bit is 1: as a signed Byte it means ${s}, as a UByte it means ${v}.`);
              }
              const preset = n => cmd(`0x${n.toString(16).toUpperCase().padStart(2, '0')}`, () => { v = n; paint(true); });
              paint(false);
              el.append(
                h('div', { class: 'kd-vcl-bits', role: 'group', 'aria-label': 'Eight bits of one byte, tap to flip' }, bits), hex,
                h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'presets'), preset(0x7F), preset(0x80), preset(0xFF), preset(0x2A)),
                h('div', { class: 'kd-pair' }, sCard, uCard),
                o);
            },
          },
          {
            title: 'Two values in one: packing',
            body: `<p>A value class holds exactly one property, but that property can carry more than one value. Compose's <code>Offset</code> is a value class over a single <code>Long</code> named <code>packedValue</code>. The x float sits in the top 32 bits and the y float in the bottom 32. Two numbers, no object per offset.</p>
<p>You can do the same for small pairs that you create in large numbers. Keep the packing private and expose readable properties.</p>`,
            code: `@JvmInline
value class GridCell private constructor(private val packed: Long) {
    constructor(row: Int, col: Int) :
        this((row.toLong() shl 32) or (col.toLong() and 0xFFFFFFFFL))

    val row: Int get() = (packed shr 32).toInt()
    val col: Int get() = packed.toInt()
}

val c = GridCell(row = 3, col = 7)   // one long at runtime
c.row   // 3
c.col   // 7`,
          },
        ],
        underHood: {
          body: `<p>The compiler keeps a real <code>Cents</code> class, but most code never creates one. Construction calls a static <code>constructor-impl</code>, which runs your <code>init</code> checks and returns the bare <code>long</code>. Each member becomes a static function with an <code>-impl</code> suffix that takes that long as its first argument.</p>
<p>When the value must be an object, as <code>Any</code>, in a generic or as a nullable <code>Long</code>-backed type, the compiler inserts <code>box-impl</code>, and <code>unbox-impl</code> on the way back.</p>`,
          code: `// Kotlin
val p = Cents(1999)
p.format()
val a: Any = p

// JVM, simplified
long p = Cents.constructor-impl(1999L);   // runs init, returns 1999L
Cents.format-impl(p);                     // static, takes the long
Object a = Cents.box-impl(p);             // a real Cents object`,
        },
        mistakes: [
          { title: 'Unwrapping at the first chance', bad: 'fun charge(userId: String, cents: Long) { /* ... */ }\n\ncharge(user.id.raw, price.value)', good: 'fun charge(userId: UserId, amount: Cents) { /* ... */ }\n\ncharge(user.id, price)', why: 'Once <code>.raw</code> travels through your code, the mix-up the value class prevented is possible again. Unwrap only at the edges: the database, the network, Java callers.' },
          { title: 'A public constructor next to a validating factory', bad: '@JvmInline value class Email(val address: String) {\n    companion object {\n        fun parse(s: String): Email? =\n            if ("@" in s) Email(s) else null\n    }\n}\nval e = Email("not an email")   // skips parse()', good: '@JvmInline value class Email private constructor(val address: String) {\n    companion object {\n        fun parse(s: String): Email? =\n            if ("@" in s) Email(s) else null\n    }\n}', why: 'The type only means "valid" if every way in checks. Make the constructor private, or put the check in <code>init</code>.' },
          { title: 'Expecting no objects in a big collection', bad: 'val prices: List<Cents> =\n    List(100_000) { Cents(it.toLong()) }\n// 100,000 boxed Cents objects', good: 'val prices = LongArray(100_000) { it.toLong() }\n// one array, no object per item\nfun priceAt(i: Int) = Cents(prices[i])', why: 'Generics always box. For large numeric data, store a primitive array and wrap single values at the API boundary.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: '@JvmInline value class Cents(val value: Long)\nfun charge(amount: Cents) { /* ... */ }\nval p = Cents(1999)\ncharge(p)\nval a: Any = p\nval list = listOf(p)\nval n: Cents? = p\nval back = a as Cents',
            varsTitle: 'What the JVM stores',
            predict: {
              q: 'Which of these lines makes the JVM allocate a <code>Cents</code> wrapper object?',
              options: ['<code>val p = Cents(1999)</code>', '<code>charge(p)</code>', '<code>val a: Any = p</code>'],
              a: 2,
              why: 'Where the static type is <code>Cents</code>, the compiler uses the bare <code>long</code>. <code>Any</code> needs an object reference, so the value gets boxed there.',
            },
            frames: [
              { say: 'For the compiler, <code>Cents</code> is its own type. Watch what actually sits in memory at each line.' },
              { line: [3, 1], vars: { p: '1999 (bare long)' }, say: 'No object is created. <code>p</code> is compiled as a plain <code>long</code>.' },
              { line: [4, 2], vars: { amount: '1999 (long parameter)' }, stack: ['main', 'charge(long)'], say: 'The JVM method takes a <code>long</code>. Its name is mangled, so Java can’t pass any random long by mistake.' },
              { line: 5, vars: { amount: null, a: '→ Cents object {1999}' }, stack: ['main'], say: '<code>Any</code> needs a reference, so here the compiler allocates a wrapper. That is boxing.' },
              { line: 6, vars: { list: '[→ Cents object {1999}]' }, say: 'Generic collections hold objects, so each element is boxed too.' },
              { line: 7, vars: { n: '→ Cents object {1999}' }, say: 'A <code>long</code> can’t be null, so <code>Cents?</code> needs a wrapper as well.' },
              { line: 8, vars: { back: '1999 (bare long again)' }, say: 'Cast back to <code>Cents</code> and the value is unboxed. Boxing happens only at these borders, never in the common case.' },
            ],
          });
        },
        play: `@JvmInline
value class UserId(val raw: String)

@JvmInline
value class Cents(val value: Long) {
    init { require(value >= 0) { "negative amount" } }
    operator fun plus(other: Cents) = Cents(value + other.value)
    fun format(): String = "%d.%02d".format(value / 100, value % 100)
}

fun charge(user: UserId, amount: Cents) = println("charge \${user.raw} \${amount.format()}")

fun main() {
    val id = UserId("u_42")
    val price = Cents(1999)
    charge(id, price)
    // charge(price, id)   // remove the //: argument type mismatch
    println((price + Cents(1)).format())

    val boxed: Any = price   // as Any, a wrapper object is needed
    println(boxed)
    println(listOf(price, Cents(5)))
    println(runCatching { Cents(-5) }.exceptionOrNull()?.message)
}`,
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
<p>Reach for <code>asSequence()</code> on long chains over large collections, or when you stop early with <code>first</code>, <code>take</code> or <code>find</code>. For a couple of steps over a small list, a plain list is often faster, since a sequence adds a little overhead per element. <code>generateSequence</code> and <code>sequence { yield(x) }</code> can even describe infinite streams. The next lesson, <strong>sequence { } and yield</strong>, shows how.</p>`,
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
          { q: 'How many times does <code>parse</code> run for each line?<pre class="code mini"><code>val parsed = lines.asSequence().map { parse(it) }\nparsed.count()\nparsed.toList()</code></pre>', options: ['Once', 'Never', 'Twice'], a: 2, why: 'A sequence is a recipe. Each terminal operation runs the chain again from the source. Collect once with toList() and reuse the list.' },
          { q: 'For 1,000 scores, how many times does map run in <code>scores.asSequence().map { it * 3 }.sorted().take(2).toList()</code>?', options: ['1,000', '2', '3'], a: 0, why: 'sorted() can’t emit anything until it has seen every element, so it pulls the whole upstream first. The early stop from take(2) only helps below it.' },
        ],
        deeper: [
          {
            title: 'sorted() has to see everything first',
            body: `<p>Most sequence steps take one element and pass it on. A few are stateful. <code>sorted()</code> can't hand out its first element until it has seen the last one. So it pulls the whole upstream into a list, sorts it, and only then continues lazily.</p>
<p>That cancels the early stop for every step above it, and on an infinite sequence it never finishes. <code>distinct()</code> is stateful too, but milder: it remembers what it has seen and still passes each new item on at once.</p>`,
            code: `val lowest2 = scores.asSequence()
    .map { it * 3 }
    .sorted()       // pulls every element before emitting one
    .take(2)
    .toList()`,
            visual(el) {
              const SRC = [5, 2, 8, 1, 9, 3];
              let sorted = true, busy = false, n = 0;
              const chain = h('div', { class: 'kt' });
              const st = name => { const well = h('div', { class: 'kd-sqn-well' }); const box = h('div', { class: 'kd-sqn-st' }, h('span', { class: 'kd-label' }, name), well); box.well = well; return box; };
              const S = { src: st('source'), map: st('map { it * 3 }'), sort: st('sorted()'), take: st('take(2)') };
              const calls = h('span', { class: 'kd-stat' });
              const sw = h('input', { type: 'checkbox', id: 'kd-sqn-sorted', checked: true });
              const o = out('');
              const chip = (v, cls = '') => h('span', { class: `kd-sqn-chip ${cls}` }, String(v));
              function paint() {
                lines(chain, [{ src: 'scores.asSequence()' }, { src: '    .map { it * 3 }' }, ...(sorted ? [{ src: '    .sorted()', cls: 'kd-new' }] : []), { src: '    .take(2)' }, { src: '    .toList()' }]);
                S.sort.classList.toggle('kd-sqn-off', !sorted);
                Object.values(S).forEach(s => s.well.replaceChildren());
                S.src.well.append(...SRC.map(v => chip(v)));
                n = 0; calls.textContent = 'map calls: 0';
              }
              sw.addEventListener('change', () => { if (busy) { sw.checked = sorted; return; } sorted = sw.checked; paint(); say(o, sorted ? 'sorted() is back in the chain. Run it.' : 'No sorted(): take(2) can stop the chain early.'); });
              async function run() {
                if (busy) return; busy = true; paint();
                const buf = [], res = [];
                for (let i = 0; i < SRC.length; i++) {
                  if (!sorted && res.length === 2) break;
                  S.src.well.children[i].classList.add('kd-sqn-gone');
                  S.map.well.replaceChildren(chip(SRC[i] * 3, 'drop-in'));
                  n++; calls.textContent = `map calls: ${n}`; replay(calls, 'pop-soft');
                  await sleep(380); if (!el.isConnected) return;
                  S.map.well.replaceChildren();
                  const v = SRC[i] * 3;
                  if (sorted) { buf.push(v); S.sort.well.append(chip(v, 'drop-in')); }
                  else { res.push(v); S.take.well.append(chip(v, 'kd-sqn-keep drop-in')); }
                  await sleep(160); if (!el.isConnected) return;
                }
                if (sorted) {
                  say(o, 'sorted() now holds every element. It sorts, then starts emitting.');
                  await sleep(500); if (!el.isConnected) return;
                  buf.sort((a, b) => a - b);
                  S.sort.well.replaceChildren(...buf.map(v => chip(v, 'pop')));
                  await sleep(550); if (!el.isConnected) return;
                  for (let k = 0; k < 2; k++) {
                    S.sort.well.firstElementChild.remove(); res.push(buf[k]);
                    S.take.well.append(chip(buf[k], 'kd-sqn-keep drop-in'));
                    await sleep(350); if (!el.isConnected) return;
                  }
                }
                say(o, `<span class="good">result:</span> ${hl(`[${res.join(', ')}]`)} <span class="muted">${sorted ? `map ran ${n} times: sorted() needed them all` : `map ran only ${n} times, in source order`}</span>`);
                busy = false;
              }
              paint();
              say(o, 'Run the chain and count the map calls.');
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'kd-sqn-sorted' }, sw, '.sorted() in the chain'), h('button', { class: 'btn primary small', onclick: run }, 'Run')),
                chain,
                h('div', { class: 'kd-sqn-belt' }, S.src, S.map, S.sort, S.take),
                h('div', { class: 'kd-stats' }, calls),
                o);
            },
          },
          {
            title: 'A sequence is a recipe, not a result',
            body: `<p>A sequence stores no values. Every terminal operation runs the whole chain again from the source. Call <code>count()</code> and then <code>toList()</code>, and every <code>map</code> lambda runs twice.</p>
<p>If you need the values more than once, collect them once with <code>toList()</code> and reuse the list. Some sequences can't even run twice. One made with <code>iterator.asSequence()</code> throws <code>IllegalStateException</code> with "This sequence can be consumed only once." on the second pass.</p>`,
            code: `val parsed = lines.asSequence().map { parse(it) }   // a recipe

parsed.count()     // parses every line
parsed.first()     // parses again, from the start
parsed.toList()    // and again

val rows = parsed.toList()   // parse once, reuse rows`,
            visual(el) {
              const N = 5;
              let total = 0, cached = false, filled = false, busy = false;
              const cells = Array.from({ length: N }, (_, i) => h('span', { class: 'kd-cell kd-sqn-cell' }, `line ${i + 1}`));
              const counter = h('span', { class: 'kd-stat' });
              const rowsCard = h('div', { class: 'kd-node kd-dim' }, h('b', { html: hl('val rows: List<Row>') }), h('span', { class: 'kd-empty' }, 'not collected yet'));
              const sw = h('input', { type: 'checkbox', id: 'kd-sqn-cache' });
              const o = out('');
              const paintCount = () => { counter.textContent = `parse calls so far: ${total}`; replay(counter, 'pop-soft'); };
              async function parse(k) {
                cells.forEach(c => c.className = 'kd-cell kd-sqn-cell');
                for (let i = 0; i < k; i++) {
                  cells[i].classList.add('kd-hot'); total++; paintCount();
                  await sleep(200); if (!el.isConnected) return false;
                  cells[i].classList.replace('kd-hot', 'kd-keep');
                }
                return true;
              }
              const RES = { count: '5', first: 'Row(1)', toList: '[Row(1), ..., Row(5)]' };
              async function term(kind) {
                if (busy) return; busy = true;
                const before = total;
                if (cached) {
                  if (!filled) {
                    say(o, `${hl('val rows = parsed.toList()')} <span class="muted">runs the recipe once...</span>`);
                    if (!await parse(N)) return;
                    filled = true; rowsCard.classList.remove('kd-dim');
                    rowsCard.lastElementChild.replaceWith(h('span', { class: 'kd-sqn-chip kd-sqn-keep drop-in' }, '5 rows in memory'));
                  } else { cells.forEach(c => c.className = 'kd-cell kd-sqn-cell kd-idle'); replay(rowsCard, 'pop'); }
                  say(o, `${hl(`rows.${kind}()`)} = ${hl(RES[kind])} <span class="good">${total - before} new parse calls</span>${total === before ? ' <span class="muted">(reads the stored list)</span>' : ''}`);
                } else {
                  if (!await parse(kind === 'first' ? 1 : N)) return;
                  say(o, `${hl(`parsed.${kind}()`)} = ${hl(RES[kind])} <span class="${total - before > 1 ? 'bad' : 'muted'}">${total - before} new parse call${total - before === 1 ? '' : 's'}</span>`);
                }
                busy = false;
              }
              sw.addEventListener('change', () => {
                if (busy) { sw.checked = cached; return; }
                cached = sw.checked; filled = false; total = 0; paintCount();
                rowsCard.className = 'kd-node kd-dim'; rowsCard.lastElementChild.replaceWith(h('span', { class: 'kd-empty' }, 'not collected yet'));
                cells.forEach(c => c.className = 'kd-cell kd-sqn-cell');
                say(o, cached ? 'Callers now use rows, a list collected once.' : 'Callers use the sequence directly again.');
              });
              paintCount();
              say(o, 'Call a few terminal operations and watch the parse counter.');
              el.append(
                h('div', { class: 'kd-row' }, cells), counter,
                h('div', { class: 'controls' }, cmd('count()', () => term('count')), cmd('first()', () => term('first')), cmd('toList()', () => term('toList'))),
                h('label', { class: 'switch', for: 'kd-sqn-cache' }, sw, 'Collect once: val rows = parsed.toList()'), rowsCard,
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Each intermediate step wraps the previous sequence in a small object. <code>map</code> returns a <code>TransformingSequence</code> and <code>filter</code> a <code>FilteringSequence</code>. Nothing runs yet. The terminal operation asks the outermost one for an iterator, and each <code>next()</code> pulls one element up through the chain of iterators below it.</p>
<p>That is also where the per-element overhead comes from. <code>Iterable.map</code> is <code>inline</code>, so the list version has no lambda objects. <code>Sequence.map</code> is not inline, so each step keeps its lambda as an object and every element passes through a few interface calls.</p>`,
          code: `// What the chain builds, simplified
names.asSequence()              // a Sequence over the list's iterator
    .map { it.uppercase() }     // TransformingSequence(source, transformer)
    .filter { it.length > 4 }   // FilteringSequence(source, predicate)
    .first()                    // iterator().next() pulls through both`,
        },
        mistakes: [
          { title: 'Letting a sequence escape useLines', bad: 'fun errors(file: File): Sequence<String> =\n    file.useLines { lines ->\n        lines.filter { "ERROR" in it }\n    }\n\nerrors(log).first()   // the reader is already closed', good: 'fun errors(file: File): List<String> =\n    file.useLines { lines ->\n        lines.filter { "ERROR" in it }.toList()\n    }', why: '<code>useLines</code> closes the file when its lambda returns. The lazy sequence escapes before anything was read, so the first pull hits a closed reader. Finish the work inside the block.' },
          { title: 'Indexing into a sequence in a loop', bad: 'val rows = lines.asSequence().map(::parse)\nfor (i in 0 until rows.count()) {\n    show(rows.elementAt(i))\n}', good: 'val rows = lines.asSequence().map(::parse)\nfor (row in rows) {\n    show(row)\n}', why: '<code>count()</code> runs the whole chain, and every <code>elementAt(i)</code> walks it again from the start. That is quadratic work. Iterate once.' },
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
        predict: {
          "q": "Lazy version: <code>(1..6).asSequence().map { it * 3 }.filter { it % 2 == 0 }.take(2).toList()</code>. How many times does map run?",
          "options": [
            "6",
            "4",
            "2"
          ],
          "a": 1,
          "why": "Each element runs the whole chain on its own. 6 and 12 pass the filter, from elements 2 and 4, and then take(2) is satisfied, so 5 and 6 are never mapped."
        },
        play: `fun main() {
    val names = listOf("ada", "grace", "linus", "barbara")

    println("List (eager):")
    val eager = names
        .map { println("  map $it"); it.uppercase() }
        .filter { println("  filter $it"); it.length > 4 }
        .first()
    println("  -> $eager")

    println("Sequence (lazy):")
    val lazy = names.asSequence()
        .map { println("  map $it"); it.uppercase() }
        .filter { println("  filter $it"); it.length > 4 }
        .first()               // delete .first() and run again: nothing is mapped
    println("  -> $lazy")
}`
      },

      // + generators ──────────────────────────────────
      {
        id: 'generators',
        title: 'sequence { } and yield',
        tagline: 'Write a producer as a plain loop that pauses after each value.',
        level: 'intermediate',
        body: `
<p><code>sequence { }</code> lets you write the code that produces values as ordinary code, with loops and local variables. Each <code>yield(x)</code> hands one value to whoever is reading and pauses the block right there. The next read resumes it on the following line. With an iterator, <code>hasNext()</code> runs the block up to the next <code>yield</code> and <code>next()</code> returns that value.</p>
<p>Nothing runs when you build the sequence. The block starts on the first read, and it only runs as far as the reader needs. That is why a <code>while (true)</code> loop is fine: the reader decides when to stop, with <code>take(n)</code> or <code>first { }</code>.</p>
<p><code>yieldAll(…)</code> hands over a whole list, range or another sequence, one value at a time. For a value that only depends on the previous one, <code>generateSequence</code> is shorter still.</p>`,
        code: `val fibonacci = sequence {
    var a = 0L
    var b = 1L
    while (true) {
        yield(a)          // hand out a, pause here
        val next = a + b
        a = b
        b = next
    }
}

fibonacci.take(8).toList()       // [0, 1, 1, 2, 3, 5, 8, 13]
fibonacci.first { it > 100 }     // 144`,
        remember: 'yield hands out one value and pauses. The reader decides how far the block runs.',
        terms: [
          { term: 'yield', def: 'Inside <code>sequence { }</code>, hands one value to the reader and pauses the block until the next value is asked for.' },
          { term: 'yieldAll', def: 'Hands over every value of a collection, iterator or sequence, one at a time.' },
          { term: 'SequenceScope', def: 'The receiver of a <code>sequence { }</code> block. It only allows its own <code>yield</code> functions to suspend.' },
          { term: 'generateSequence', def: 'Builds a sequence from a first value and a function that computes the next one. It ends when the function returns null.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Produce the even numbers 0, 2, 4, … forever.', code: 'val evens = [[sequence]] {\n    var n = 0\n    while (true) {\n        [[yield]](n)\n        n += 2\n    }\n}', why: '<code>sequence { }</code> builds the lazy producer, and <code>yield</code> hands out each value and pauses.' },
          { type: 'bug', prompt: 'This line never returns. Tap it.', code: 'val powers = generateSequence(1) { it * 2 }\nval firstTen = powers\n    .map { it.toString() }\n    .toList()', bug: 3, fix: '    .take(10).toList()', why: 'The sequence is infinite. <code>toList()</code> keeps pulling forever. Limit it with <code>take(10)</code> first.' },
        ],
        quiz: [
          { q: 'You build <code>val s = sequence { println("hi"); yield(1) }</code> and never read it. What is printed?', options: ['"hi"', 'Nothing', '"hi" twice'], a: 1, why: 'Building a sequence runs no code. The block starts on the first read.' },
          { q: 'What does <code>it.next()</code> do on a sequence iterator?', options: ['Runs the whole block and returns the first value', 'Runs the block up to the next yield and returns that value', 'Restarts the block from the top'], a: 1, why: 'The block runs only until the next <code>yield</code>, then pauses there.' },
          { q: 'A block has <code>yieldAll(generateSequence(1) { it + 1 })</code> followed by <code>yield(0)</code>. When is 0 produced?', options: ['After the infinite part', 'Never', 'First'], a: 1, why: 'An infinite <code>yieldAll</code> never finishes, so the code after it never runs. Put it last.' },
          { q: 'Does “cleanup” print?<pre class="code mini"><code>val one = sequence {\n    try { yield(1) } finally { println("cleanup") }\n}\none.first()</code></pre>', options: ['No: the block stays paused at yield and never resumes', 'Yes, right after first() returns', 'Yes, before first() returns 1'], a: 0, why: 'first() stops reading after one value, so the block never runs past yield, finally included. Own resources around the whole read instead.' },
          { q: 'What is <code>generateSequence(1) { if (it &lt; 8) it + 2 else null }.toList()</code>?', options: ['<code>[1, 3, 5, 7, 9]</code>', '<code>[1, 3, 5, 7]</code>', 'It never ends'], a: 0, why: 'The function runs on 7, which is below 8, and returns 9. Only on 9 does it return null, which ends the sequence.' },
        ],
        deeper: [
          {
            title: 'Infinite generators: the reader sets the limit',
            body: `<p>A generator with <code>while (true)</code> is safe because it only runs while someone reads. <code>take(8)</code> stops after eight values. <code>first { it > 100 }</code> stops at the first match. The loop never gets further than that.</p>
<p>Each terminal call asks for a new iterator, and each new iterator starts the block again from the top. Reading the same <code>sequence { }</code> twice runs its code twice.</p>`,
            code: `fibonacci.take(3).toList()     // [0, 1, 1]        3 yields ran
fibonacci.take(8).toList()     // [0, 1, 1, 2, 3, 5, 8, 13]
fibonacci.first { it > 100 }   // 144              13 yields ran`,
            visual(el) {
              const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
              const pile = h('div', { class: 'kd-gen-row' });
              const count = h('span', { class: 'kd-count' }, 'yields so far: 0');
              const o = out();
              let busy = false;
              async function run(src, n, pick) {
                if (busy) return; busy = true;
                pile.replaceChildren(); count.textContent = 'yields so far: 0';
                say(o, `${hl(src)} <span class="muted">// new iterator, block starts at the top</span>`);
                for (let i = 0; i < n; i++) {
                  await sleep(170); if (!el.isConnected) return;
                  const last = i === n - 1;
                  pile.append(h('span', { class: 'chip kd-gen-chip drop-in' + (last && pick ? ' kd-hit' : '') }, String(FIB[i])));
                  count.textContent = `yields so far: ${i + 1}`;
                }
                const res = pick ? String(FIB[n - 1]) : `[${FIB.slice(0, n).join(', ')}]`;
                say(o, `${hl(src)} = ${hl(res)} <span class="muted">// ${n} yields ran, then the loop stayed paused for good</span>`);
                busy = false;
              }
              el.append(
                h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'values the loop produced'), pile, count),
                h('div', { class: 'controls' },
                  cmd('fibonacci.take(3).toList()', () => run('fibonacci.take(3).toList()', 3, false)),
                  cmd('fibonacci.take(8).toList()', () => run('fibonacci.take(8).toList()', 8, false)),
                  cmd('fibonacci.first { it > 100 }', () => run('fibonacci.first { it > 100 }', 13, true)),
                  cmd('fibonacci.toList()', () => { if (busy) return; replay(pile, 'shake'); say(o, `${hl('fibonacci.toList()')} <span class="bad">never returns</span> <span class="muted">it keeps pulling from a loop with no end</span>`); })),
                o);
              say(o, 'Each call reads only as far as it needs.');
            },
          },
          {
            title: 'generateSequence: each value from the last',
            body: `<p>When every value comes from the previous one, <code>generateSequence(seed) { next(it) }</code> says it in one line. Return <code>null</code> from the function to end the sequence. If it never returns null, the sequence is infinite.</p>
<p>A handy Android case is walking up a chain of parents: start at a view’s parent and keep asking for the next parent until there is none.</p>`,
            code: `val odds = generateSequence(1) { if (it < 8) it + 2 else null }
odds.toList()   // [1, 3, 5, 7, 9]

// every ViewParent above this view, nearest first
val parents = generateSequence(view.parent) { it.parent }
val inScroll = parents.any { it is ScrollView }`,
          },
          {
            title: 'Stopping early skips the rest, even finally',
            body: `<p>If the reader stops before the block ends, the rest of the block never runs. That includes <code>finally</code> blocks, so a <code>sequence { }</code> is a poor place to own a resource that must be closed.</p>
<p>Open and close the resource around the whole read instead, for example with <code>useLines { }</code>, and finish the work inside it.</p>`,
            code: `val one = sequence {
    try {
        yield(1)
    } finally {
        println("cleanup")   // never printed below
    }
}
one.first()   // 1`,
          },
        ],
        underHood: {
          body: `<p>The block compiles to a coroutine state machine, the same machinery as a <code>suspend</code> function. Each <code>yield</code> is a suspension point: the block saves its local variables and returns to the iterator. The next <code>hasNext()</code> resumes it from that saved state.</p>
<p>The scope, <code>SequenceScope</code>, is marked <code>@RestrictsSuspension</code>. That is why only <code>yield</code> and <code>yieldAll</code> may suspend inside it, and why you can’t call <code>delay</code> or a network function there. No thread or dispatcher is involved: everything runs on the thread that reads the sequence.</p>`,
          code: `// simplified signature
fun <T> sequence(block: suspend SequenceScope<T>.() -> Unit): Sequence<T>

@RestrictsSuspension
abstract class SequenceScope<in T> {
    abstract suspend fun yield(value: T)
    abstract suspend fun yieldAll(iterator: Iterator<T>)
}`,
        },
        mistakes: [
          { title: 'Suspending inside sequence { }', bad: 'val pages = sequence {\n    var page = 1\n    while (true) yield(api.load(page++))   // suspend fun\n}', good: 'val pages = flow {\n    var page = 1\n    while (true) emit(api.load(page++))\n}', why: 'A <code>sequence { }</code> block may only suspend in its own <code>yield</code> calls, so calling a suspend function there doesn\'t compile. A producer that waits belongs in a <code>Flow</code>.' },
          { title: 'Code after an infinite yieldAll', bad: 'val ids = sequence {\n    yieldAll(generateSequence(1) { it + 1 })\n    yield(0)   // never reached\n}', good: 'val ids = sequence {\n    yield(0)\n    yieldAll(generateSequence(1) { it + 1 })\n}', why: 'An infinite <code>yieldAll</code> never finishes. Anything after it is dead code. Make it the last call.' },
          { title: 'Collecting an infinite sequence', bad: 'fibonacci.filter { it % 2 == 0L }.toList()', good: 'fibonacci.filter { it % 2 == 0L }.take(10).toList()', why: '<code>toList()</code>, <code>count()</code> and <code>sum()</code> read until the end, and an infinite sequence has none. Limit it first.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'val ids = sequence {\n    println("start")\n    yield(1)\n    println("after 1")\n    yield(2)\n}\nval iter = ids.iterator()\nprintln(iter.next())\nprintln(iter.next())\nprintln(iter.hasNext())',
            predict: {
              q: 'Line 8 calls <code>iter.next()</code> for the first time. What is printed by the end of that line?',
              options: ['"start", then 1', 'Only 1', '"start", "after 1", then 1'],
              a: 0,
              why: '<code>next()</code> runs the block from where it stopped up to the next <code>yield</code>. That prints "start", and <code>yield(1)</code> pauses before "after 1".',
            },
            frames: [
              { say: 'Two lines of code, separated by <code>yield</code>. Watch when the block actually runs.' },
              { line: 1, vars: { block: 'not started' }, stack: ['main'], say: 'Building the sequence runs nothing. It only stores the block.' },
              { line: 7, vars: { iter: 'ready' }, say: 'Getting an iterator does not run it either.' },
              { line: [8, 2], vars: { block: 'running' }, stack: ['main', 'iter.next()', 'sequence block'], out: 'start', say: '<code>next()</code> starts the block. It runs line 2...' },
              { line: 3, vars: { block: 'paused at yield(1)' }, say: '...until <code>yield(1)</code>. The value goes out and the block freezes right here, local state and all.' },
              { line: 8, stack: ['main'], out: '1', say: 'Back in <code>main</code>, <code>next()</code> returns 1.' },
              { line: [9, 4], vars: { block: 'running' }, stack: ['main', 'iter.next()', 'sequence block'], out: 'after 1', say: 'The second <code>next()</code> resumes on the line after the <code>yield</code>.' },
              { line: 5, vars: { block: 'paused at yield(2)' }, say: 'It pauses again at <code>yield(2)</code>.' },
              { line: 9, stack: ['main'], out: '2', say: '<code>next()</code> returns 2.' },
              { line: [10, 6], vars: { block: 'finished' }, out: 'false', say: '<code>hasNext()</code> resumes the block to look for one more value. It reaches the end, so the answer is <code>false</code>.' },
            ],
          });
        },
        play: `fun main() {
    val fibonacci = sequence {
        var a = 0L
        var b = 1L
        while (true) {
            yield(a)              // hand out a, pause here
            val next = a + b
            a = b
            b = next
        }
    }
    println(fibonacci.take(8).toList())   // change take(8) to take(20)
    println(fibonacci.first { it > 100 })

    val ids = sequence {
        println("  start")
        yield(1)
        println("  after 1")
        yield(2)
    }
    val iter = ids.iterator()
    println("built, nothing ran yet")
    println(iter.next())
    println(iter.next())
}`,
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
          { q: 'A wrong password is a normal answer the login screen must handle. How should the repository report it?', options: ['By throwing an exception', 'As a case of a sealed LoginResult', 'As Result.failure with an exception'], a: 1, why: 'Expected outcomes belong in the type, so every when must handle them and a new case breaks the build. Result and exceptions make every failure look the same.' },
          { q: 'In <code>viewModelScope.launch { val a = async(handler) { fail() }; a.await() }</code>, does the CoroutineExceptionHandler on the async see the failure?', options: ['Yes, it catches it and the coroutine continues', 'No: a handler only works on a root launch or a launch directly in a supervisor', 'Only if await() is never called'], a: 1, why: 'Installing a handler on a child or on async does nothing. Here the exception reaches the root launch, which has no handler of its own.' },
          { q: 'In <code>supervisorScope { }</code>, the ads async fails with IOException while the feed async is still loading. What happens to feed?', options: ['It is cancelled with the scope', 'It keeps running', 'The app crashes at once'], a: 1, why: 'A supervisor does not cancel siblings when one child fails. The ads exception waits inside its Deferred until ads.await() is called.' },
        ],
        deeper: [
          {
            title: 'Expected failures as types',
            body: `<p><code>Result</code> holds a <code>Throwable</code>, so every failure looks the same to the caller. A wrong password is not an exception, though. It is a normal answer your screen must handle.</p>
<p>Model those answers as a sealed type. The compiler then makes every <code>when</code> handle each case, and a new case breaks the build instead of the screen. Keep exceptions for the truly unexpected.</p>`,
            code: `sealed interface LoginResult {
    data class Success(val user: User) : LoginResult
    data object WrongPassword : LoginResult
    data class Locked(val minutes: Int) : LoginResult
    data object Offline : LoginResult
}

fun render(r: LoginResult): String = when (r) {
    is LoginResult.Success -> "Hi \${r.user.name}"
    LoginResult.WrongPassword -> "Wrong password"
    is LoginResult.Locked -> "Try again in \${r.minutes} min"
    LoginResult.Offline -> "You are offline"
}`,
            visual(el) {
              const CASES = [
                { k: 'Success', src: 'is Success -> "Hi ${r.user.name}"', ui: 'Hi Ada', cls: 'kd-okk' },
                { k: 'WrongPassword', src: 'WrongPassword -> "Wrong password"', ui: 'Wrong password', cls: 'kd-err' },
                { k: 'Locked', src: 'is Locked -> "Try again in ${r.minutes} min"', ui: 'Try again in 15 min', cls: 'kd-err' },
                { k: 'Offline', src: 'Offline -> "You are offline"', ui: 'You are offline', cls: 'kd-cancel' },
              ];
              let busy = false;
              const rows = CASES.map(c => h('div', { class: 'branch', html: '    ' + hl(c.src) }));
              const box = h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('when (r) {') }), rows, h('div', { class: 'branch head' }, '}'));
              const screen = h('div', { class: 'phone kd-mini-phone' }, h('p', { class: 'phone-note' }, 'Log in'));
              const o = out('Pick what the server answers.');
              async function answer(i) {
                if (busy) return; busy = true;
                rows.forEach(r => r.classList.remove('scan', 'hit', 'miss'));
                for (let j = 0; j <= i; j++) {
                  rows[j].classList.add('scan'); await sleep(260); if (!el.isConnected) return;
                  rows[j].classList.remove('scan'); rows[j].classList.add(j === i ? 'hit' : 'miss');
                }
                screen.replaceChildren(h('span', { class: `kd-tok pop ${CASES[i].cls}` }, CASES[i].ui));
                say(o, `${hl(`LoginResult.${CASES[i].k}`)} <span class="good">handled</span> <span class="muted">by its own branch, checked by the compiler</span>`);
                busy = false;
              }
              function addCase() {
                replay(box, 'shake');
                say(o, `<span class="muted">Add</span> ${hl('data object TooManyAttempts : LoginResult')} <span class="muted">→</span> <span class="bad">compile error:</span> 'when' expression must be exhaustive. Add the 'TooManyAttempts' branch.`);
              }
              el.append(
                h('div', { class: 'kd-split' }, box, screen),
                h('div', { class: 'controls' }, CASES.map((c, i) => act(c.k, () => answer(i))), act('Add a new case', addCase)),
                o);
            },
          },
          {
            title: 'launch, async and who sees the exception',
            body: `<p>In a normal scope, a failing child cancels its parent and every sibling, whether it was started with <code>launch</code> or <code>async</code>. A <code>try</code> around <code>await()</code> catches the exception there, but the scope has already failed and still throws.</p>
<p>In a <code>supervisorScope</code>, siblings keep running. A failed <code>launch</code> reports to the <code>CoroutineExceptionHandler</code>, and crashes the app if there is none. A failed <code>async</code> keeps its exception until you call <code>await()</code>.</p>`,
            code: `suspend fun loadHome() = supervisorScope {
    val ads = async { api.ads() }        // may fail
    val feed = async { api.feed() }      // keeps running if ads fails
    HomeState(
        feed = feed.await(),
        ads = try { ads.await() } catch (e: IOException) { emptyList() },
    )
}`,
            visual(el) {
              let builder = 'launch', scope = 'coroutineScope', busy = false;
              const codeEl = h('div', { class: 'kt' });
              const parent = h('div', { class: 'kd-node' }, h('b', {}, 'scope'), h('span', {}, 'active'));
              const kidA = h('div', { class: 'kd-node' }, h('b', {}, 'loadAds()'), h('span', {}, 'waiting'));
              const kidB = h('div', { class: 'kd-node' }, h('b', {}, 'loadFeed()'), h('span', {}, 'waiting'));
              const caller = h('div', { class: 'kd-node' }, h('b', {}, 'caller / handler'), h('span', {}, 'idle'));
              const o = out('');
              const set = (n, text, cls) => { n.lastChild.textContent = text; n.className = 'kd-node' + (cls ? ' ' + cls : ''); };
              const bBtns = [cmd('launch', () => pick('launch')), cmd('async', () => pick('async'))];
              const sBtns = [cmd('coroutineScope', () => pickS('coroutineScope')), cmd('supervisorScope', () => pickS('supervisorScope'))];
              function paint() {
                press(bBtns, bBtns[builder === 'launch' ? 0 : 1]); press(sBtns, sBtns[scope === 'coroutineScope' ? 0 : 1]);
                lines(codeEl, [
                  { src: `${scope} {` },
                  { src: `    val ads = ${builder} { loadAds() }`, note: 'throws IOException', noteCls: 'bad' },
                  { src: `    ${builder} { loadFeed() }` },
                  ...(builder === 'async' ? [{ src: '    try { ads.await() } catch (e: IOException) { }' }] : []),
                  { src: '}' },
                ]);
                set(parent, 'active'); set(kidA, 'waiting'); set(kidB, 'waiting'); set(caller, 'idle');
                say(o, 'Pick a builder and a scope, then run.');
              }
              function pick(b) { if (busy) return; builder = b; paint(); }
              function pickS(s) { if (busy) return; scope = s; paint(); }
              async function run() {
                if (busy) return; busy = true; paint();
                const step = async ms => { await sleep(ms); return el.isConnected; };
                set(kidA, 'running', 'kd-hit'); set(kidB, 'running', 'kd-hit');
                if (!await step(700)) return;
                set(kidA, 'IOException', 'kd-bad'); replay(kidA, 'shake');
                if (!await step(600)) return;
                const sup = scope === 'supervisorScope';
                if (!sup) {
                  set(parent, 'cancelling', 'kd-bad'); set(kidB, 'cancelled', 'kd-dim');
                  if (!await step(600)) return;
                  set(parent, 'failed', 'kd-bad');
                  set(caller, 'gets IOException', 'kd-bad'); replay(caller, 'shake');
                  say(o, builder === 'async'
                    ? '<span class="bad">scope failed:</span> the try around await() caught it, but the child had already cancelled the scope, so coroutineScope still throws to the caller.'
                    : '<span class="bad">scope failed:</span> the child cancelled its parent and loadFeed with it. coroutineScope rethrows to the caller.');
                } else {
                  set(kidB, 'done', ''); replay(kidB, 'pop');
                  if (!await step(500)) return;
                  set(parent, 'done');
                  if (builder === 'async') { set(caller, 'caught at await()', ''); replay(caller, 'pop'); say(o, '<span class="good">contained:</span> loadFeed finished. The exception waited inside the Deferred and the try around await() handled it.'); }
                  else { set(caller, 'handler or crash', 'kd-bad'); replay(caller, 'shake'); say(o, '<span class="good">loadFeed finished,</span> <span class="bad">but</span> the failed launch reported its exception to the CoroutineExceptionHandler. Without one, the app crashes.'); }
                }
                busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'builder'), bBtns),
                h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'scope'), sBtns),
                codeEl,
                h('div', { class: 'kd-fwd' }, parent, h('span', { class: 'arrow' }, '→'), kidA, kidB),
                h('div', { class: 'kd-fwd' }, h('span', { class: 'kd-label' }, 'exception reaches'), caller),
                h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Run')),
                o);
            },
          },
          {
            title: 'CoroutineExceptionHandler is a last resort',
            body: `<p>A handler only sees exceptions from a root <code>launch</code>, or from a <code>launch</code> directly inside a supervisor. Installing it on a child or on <code>async</code> does nothing. It can't recover the coroutine either: by the time it runs, the coroutine is finished.</p>
<p><code>viewModelScope</code> uses a <code>SupervisorJob</code>, so each <code>launch</code> in it is a root of its own. Use the handler to report and show a generic error. Handle the failures you expect with <code>try</code> where they happen.</p>`,
            code: `class FeedViewModel(private val repo: FeedRepository) : ViewModel() {
    private val handler = CoroutineExceptionHandler { _, e ->
        Log.e("Feed", "refresh crashed", e)
        _message.value = "Something went wrong"
    }

    fun refresh() = viewModelScope.launch(handler) {
        try {
            repo.refresh()
        } catch (e: IOException) {
            _message.value = "You are offline"      // expected: handled here
        }
    }
}`,
          },
        ],
        underHood: {
          body: `<p><code>runCatching</code> is an inline function around a plain <code>try</code> that catches <code>Throwable</code>. <code>Result</code> is a value class: a success stores the bare value, and a failure stores a small internal <code>Failure</code> object that holds the exception.</p>
<p>Cancellation uses the same machinery as any exception. When a job is cancelled, the next suspension point that checks for it, like <code>delay</code> or <code>yield</code>, throws <code>CancellationException</code>. A tight loop with no suspension point never sees it unless it calls <code>ensureActive()</code>.</p>`,
          code: `// stdlib, slightly simplified
public inline fun <R> runCatching(block: () -> R): Result<R> =
    try {
        Result.success(block())
    } catch (e: Throwable) {
        Result.failure(e)
    }

// CPU-bound loop: check for cancellation yourself
suspend fun crunch(items: List<Item>) = withContext(Dispatchers.Default) {
    for (item in items) {
        ensureActive()          // throws CancellationException if cancelled
        process(item)
    }
}`,
        },
        mistakes: [
          { title: 'Suspending in finally after cancellation', bad: 'viewModelScope.launch {\n    try {\n        editor.autosaveLoop()\n    } finally {\n        repo.saveDraft(editor.text)   // throws at once: job is cancelled\n    }\n}', good: 'viewModelScope.launch {\n    try {\n        editor.autosaveLoop()\n    } finally {\n        withContext(NonCancellable) {\n            repo.saveDraft(editor.text)\n        }\n    }\n}', why: 'A cancelled coroutine throws <code>CancellationException</code> at its next suspension point, including inside <code>finally</code>. <code>NonCancellable</code> lets the cleanup finish.' },
          { title: 'Losing the original cause', bad: 'try {\n    api.sync()\n} catch (e: IOException) {\n    throw SyncFailedException("sync failed")\n}', good: 'try {\n    api.sync()\n} catch (e: IOException) {\n    throw SyncFailedException("sync failed", e)\n}', why: 'Without the cause, the stack trace ends at your <code>throw</code> and hides the real network error. Pass the caught exception on.' },
          { title: 'Exceptions for ordinary control flow', bad: 'val admin = try {\n    users.first { it.isAdmin }\n} catch (e: NoSuchElementException) {\n    null\n}', good: 'val admin = users.firstOrNull { it.isAdmin }', why: 'Throwing is slow and hides intent. The standard library has an <code>OrNull</code> version for most functions that can come up empty.' },
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
        predict: {
          "q": "The screen closes while <code>fetchUser()</code> is suspended. Which handler lets the coroutine stop cleanly?",
          "options": [
            "runCatching { }",
            "catch (e: Exception)",
            "catch (e: IOException)"
          ],
          "a": 2,
          "why": "Cancellation arrives as a CancellationException. runCatching and catch (e: Exception) swallow it; catching only IOException lets it pass."
        },
        play: `import kotlinx.coroutines.*

fun parse(text: String): Result<Int> = runCatching { text.toInt() }

fun main() = runBlocking {
    println(parse("42").map { it * 2 }.getOrElse { -1 })
    println(parse("4x").map { it * 2 }.getOrElse { -1 })

    val job = launch {
        repeat(3) { i ->
            try {
                delay(100)
                println("tick $i")
            } catch (e: Exception) {   // change Exception to java.io.IOException and run again
                println("swallowed \${e::class.simpleName}, loop goes on")
            }
        }
    }
    delay(250)
    job.cancel()
    job.join()
    println("job cancelled: \${job.isCancelled}")
}`
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
          { q: 'What happens?<pre class="code mini"><code>var c = mutableListOf(1, 2)\nc += 3</code></pre>', options: ['It does not compile: plus and plusAssign both match', 'c is the same list, now [1, 2, 3]', 'c points at a new list [1, 2, 3]'], a: 0, why: 'On a var holding a MutableList, += could mean c.plusAssign(3) or c = c + 3, so it is ambiguous. Use a val with a mutable list, or a var with a read-only one.' },
          { q: 'What is <code>"1.10.0" &lt; "1.9.0"</code>?', options: ['<code>false</code>', '<code>true</code>', 'It does not compile'], a: 1, why: 'Strings compare character by character, and "1" is less than "9" at the third character. Compare versions as numbers with a Comparable type.' },
        ],
        deeper: [
          {
            title: '+= on a val, a var, or both',
            body: `<p><code>a += b</code> has two possible meanings. If <code>a</code> has a <code>plusAssign</code> operator, the object changes in place. Otherwise, if <code>a</code> is a <code>var</code>, Kotlin writes <code>a = a + b</code>: <code>plus</code> builds a new object and the variable now points at it.</p>
<p>The difference shows when something else still holds the old object. A <code>var</code> holding a <code>MutableList</code> has both options, so <code>+=</code> doesn't compile at all. Pick one: a <code>val</code> with a mutable list, or a <code>var</code> with a read-only one.</p>`,
            code: `val a = mutableListOf(1, 2)
a += 3          // a.plusAssign(3): same list, now [1, 2, 3]

var b = listOf(1, 2)
b += 3          // b = b + 3: a new list, the old one unchanged

var c = mutableListOf(1, 2)
c += 3          // compile error: plus and plusAssign both match`,
            visual(el) {
              const KINDS = [
                { src: 'val x = mutableListOf(1, 2)', mode: 'mutate', t: 'MutableList' },
                { src: 'var x = listOf(1, 2)', mode: 'replace', t: 'List' },
                { src: 'var x = mutableListOf(1, 2)', mode: 'ambiguous', t: 'MutableList' },
              ];
              let kind = KINDS[0], objs, xRef, nextN, busy = false;
              const decl = h('div', { class: 'kt' });
              const heap = h('div', { class: 'kd-heap', 'aria-label': 'Objects on the heap' });
              const xTag = h('span', { class: 'kd-tag' }), oldTag = h('span', { class: 'kd-tag' });
              const o = out('');
              const plusBtn = cmd('x += 3', plus);
              const kBtns = KINDS.map(k => cmd(k.src, () => { if (busy) return; kind = k; reset(); say(o, k.mode === 'ambiguous' ? 'A var holding a MutableList. Try +=.' : `x and old point at the same ${k.t}. Now try +=.`); }));
              function paint(freshObj, freshItem) {
                heap.replaceChildren(...objs.map(ob => h('div', { class: 'kd-node' + (ob.id === xRef ? ' kd-hit' : '') + (ob === freshObj ? ' drop-in' : '') },
                  h('b', {}, `#${ob.id} ${kind.t}`),
                  h('div', { class: 'kd-row' }, ob.items.map((v, i) => h('span', { class: 'kd-opr-item' + (ob === freshItem && i === ob.items.length - 1 ? ' drop-in' : '') }, String(v)))))));
                xTag.innerHTML = hl(`x → #${xRef}`); oldTag.innerHTML = hl('old → #1');
                plusBtn.innerHTML = hl(`x += ${nextN}`);
              }
              function reset() {
                press(kBtns, kBtns[KINDS.indexOf(kind)]);
                lines(decl, [{ src: kind.src }, { src: 'val old = x' }]);
                objs = [{ id: 1, items: [1, 2] }]; xRef = 1; nextN = 3; paint();
              }
              async function plus() {
                if (busy) return; busy = true;
                if (nextN > 6) { reset(); say(o, 'Started over.'); busy = false; return; }
                const n = nextN;
                if (kind.mode === 'ambiguous') {
                  replay(decl, 'shake');
                  say(o, `${hl(`x += ${n}`)} <span class="bad">compile error: assignment operators ambiguity</span> <span class="muted">x = x.plus(${n}) and x.plusAssign(${n}) both fit</span>`);
                } else if (kind.mode === 'mutate') {
                  const ob = objs.find(b => b.id === xRef); ob.items.push(n); nextN++; paint(null, ob);
                  replay(oldTag, 'pop');
                  say(o, `${hl(`x += ${n}`)} <span class="muted">→</span> ${hl(`x.plusAssign(${n})`)} <span class="good">#1 changed in place.</span> old sees ${hl(`[${ob.items.join(', ')}]`)} too.`);
                } else {
                  const cur = objs.find(b => b.id === xRef);
                  const ob = { id: objs.length + 1, items: [...cur.items, n] };
                  objs.push(ob); xRef = ob.id; nextN++; paint(ob);
                  replay(xTag, 'pop');
                  say(o, `${hl(`x += ${n}`)} <span class="muted">→</span> ${hl(`x = x + ${n}`)} <span class="good">new list #${ob.id}.</span> old still points at #1 ${hl('[1, 2]')}.`);
                }
                await sleep(400); busy = false;
              }
              reset();
              say(o, 'Pick a declaration, then press += a few times.');
              el.append(
                h('div', { class: 'controls' }, kBtns), decl,
                h('div', { class: 'kd-pair' },
                  h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'variables'), xTag, oldTag),
                  h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'heap'), heap)),
                h('div', { class: 'controls' }, plusBtn),
                o);
            },
          },
          {
            title: 'compareTo powers <, >, sorting and ranges',
            body: `<p>Implement <code>Comparable</code> and one function, <code>compareTo</code>, gives your type every comparison operator. <code>a &lt; b</code> compiles to <code>a.compareTo(b) &lt; 0</code>. The same function drives <code>sorted()</code>, <code>maxOf</code> and ranges like <code>min..max</code>.</p>
<p>Version strings are the classic trap. Strings compare character by character, so <code>"1.10.0" &lt; "1.9.0"</code> is true. A force-update check built on that tells users on the newest version to update.</p>`,
            code: `data class Version(val major: Int, val minor: Int, val patch: Int) : Comparable<Version> {
    override fun compareTo(other: Version) =
        compareValuesBy(this, other, Version::major, Version::minor, Version::patch)
}

val current = Version(1, 10, 0)
val minimum = Version(1, 9, 0)
current >= minimum                      // true: current.compareTo(minimum) >= 0
current in minimum..Version(2, 0, 0)    // true: rangeTo works on any Comparable`,
            visual(el) {
              const VERS = ['1.10.0', '1.2.0', '2.0.0', '1.9.3', '1.2.10'];
              const num = s => s.split('.').map(Number);
              const cmpV = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
              const cmpS = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
              let typed = false, busy = false;
              const wrap = h('div', { class: 'kd-opr-vers' });
              const chips = VERS.map(v => h('span', { class: 'kd-sqn-chip' }, v));
              const banner = h('div', { class: 'kd-opr-banner' });
              const o = out('');
              const modes = [act('String', () => setMode(false)), act('Version : Comparable', () => setMode(true))];
              function setMode(t) {
                if (busy) return; typed = t; press(modes, modes[t ? 1 : 0]);
                chips.forEach(c => { c.classList.remove('kd-sqn-keep'); c.textContent = t ? `Version(${c.dataset.v.split('.').join(', ')})` : `"${c.dataset.v}"`; });
                banner.className = 'kd-opr-banner'; banner.textContent = 'minimum supported: 1.9.0, installed: 1.10.0';
                say(o, t ? 'Compared field by field as numbers.' : 'Compared as text, one character at a time.');
              }
              function reorder(order) {
                const first = new Map(order.map(e => [e, e.getBoundingClientRect()]));
                wrap.append(...order);
                order.forEach(e => { const a = first.get(e), b = e.getBoundingClientRect(); e.style.transition = 'none'; e.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`; });
                void wrap.offsetWidth;
                order.forEach(e => { e.style.transition = 'transform 0.55s cubic-bezier(0.3, 1.2, 0.5, 1)'; e.style.transform = ''; });
              }
              async function sort() {
                if (busy) return; busy = true;
                const order = [...chips].sort((a, b) => (typed ? cmpV : cmpS)(a.dataset.v, b.dataset.v));
                reorder(order);
                const wrong = !typed;
                say(o, `${hl('versions.sorted()')} <span class="muted">→</span> ${order.map(c => c.dataset.v).join(' < ')}${wrong ? ' <span class="bad">1.10.0 sorts before 1.2.0</span>' : ' <span class="good">numeric order</span>'}`);
                await sleep(650); busy = false;
              }
              async function check() {
                if (busy) return; busy = true;
                const ok = typed ? cmpV('1.10.0', '1.9.0') >= 0 : cmpS('1.10.0', '1.9.0') >= 0;
                banner.className = `kd-opr-banner ${ok ? 'kd-opr-ok' : 'kd-opr-bad'}`;
                banner.textContent = ok ? 'Up to date' : 'Update required. Please install the latest version.';
                replay(banner, ok ? 'pop' : 'shake');
                say(o, typed
                  ? `${hl('current >= minimum')} <span class="muted">→ compareTo compares 10 with 9 →</span> ${hl('true')}`
                  : `${hl('"1.10.0" >= "1.9.0"')} <span class="muted">→ the third character: '1' < '9' →</span> ${hl('false')} <span class="bad">blocks the newest version</span>`);
                await sleep(500); busy = false;
              }
              chips.forEach((c, i) => { c.dataset.v = VERS[i]; });
              wrap.append(...chips);
              setMode(false);
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'kd-label' }, 'compare as'), modes),
                wrap,
                h('div', { class: 'controls' }, cmd('versions.sorted()', sort), cmd('current >= minimum', check)),
                banner, o);
            },
          },
          {
            title: 'invoke: objects you call like functions',
            body: `<p><code>operator fun invoke</code> makes an instance callable with parentheses. Android code uses it for use cases: a class with one job, injected like any other dependency and called like a function.</p>
<p>Keep it for classes that really do one thing. If a class has two entry points, <code>invoke</code> hides which one you are calling.</p>`,
            code: `class GetUnreadCount @Inject constructor(private val repo: InboxRepository) {
    operator fun invoke(): Flow<Int> =
        repo.messages().map { list -> list.count { !it.read } }
}

@HiltViewModel
class InboxViewModel @Inject constructor(getUnreadCount: GetUnreadCount) : ViewModel() {
    val unread: StateFlow<Int> = getUnreadCount()      // getUnreadCount.invoke()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0)
}`,
          },
        ],
        underHood: {
          body: `<p>An operator call is an ordinary method call. <code>a + b</code> on your <code>Vec</code> compiles to <code>a.plus(b)</code>, and <code>val (x, y) = v</code> to <code>v.component1()</code> and <code>v.component2()</code>. There is no extra dispatch layer.</p>
<p>For built-in number types the compiler goes further. <code>Int + Int</code> becomes a single JVM add instruction, not a call. In <code>for ((k, v) in map)</code>, <code>component1()</code> and <code>component2()</code> on <code>Map.Entry</code> are inline extensions from the standard library, so they compile straight to <code>getKey()</code> and <code>getValue()</code>.</p>`,
          code: `// Kotlin
val c = a + b
val (x, y) = c
val n = 2 + 3 * k

// JVM, simplified
Vec c = a.plus(b);
int x = c.component1();
int y = c.component2();
int n = 2 + 3 * k;     // imul, iadd: no method calls`,
        },
        mistakes: [
          { title: 'A plus that changes the left side', bad: 'class Basket(val items: MutableList<Item>) {\n    operator fun plus(item: Item): Basket {\n        items += item      // mutates this basket\n        return this\n    }\n}\nval full = empty + apple   // empty changed too', good: 'data class Basket(val items: List<Item>) {\n    operator fun plus(item: Item) = Basket(items + item)\n}', why: 'Readers expect <code>a + b</code> to leave <code>a</code> alone, as it does for numbers. Return a new object from <code>plus</code>. In-place change is what <code>plusAssign</code> is for.' },
          { title: 'compareTo that disagrees with equals', bad: 'data class Version(val major: Int, val minor: Int) : Comparable<Version> {\n    override fun compareTo(other: Version) =\n        major.compareTo(other.major)\n}\nsortedSetOf(Version(1, 2), Version(1, 9)).size   // 1', good: 'override fun compareTo(other: Version) =\n    compareValuesBy(this, other, Version::major, Version::minor)', why: 'Sorted collections like <code>TreeSet</code> treat <code>compareTo == 0</code> as "the same element". Comparing only part of the state silently drops items that <code>equals</code> says are different.' },
          { title: 'A Pair where names would help', bad: 'fun bounds(): Pair<Int, Int> = 0 to 100\n\nval (max, min) = bounds()   // swapped, still compiles', good: 'data class Bounds(val min: Int, val max: Int)\nfun bounds() = Bounds(min = 0, max = 100)\n\nval b = bounds()\nb.max', why: 'Destructuring goes by position, and a <code>Pair</code> carries no names at all. A small data class lets the reader see which value is which.' },
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
        predict: {
          "q": "With <code>a = Vec(2, 1)</code>, what does <code>a * 2</code> call, and what does it give?",
          "options": [
            "a.times(2), giving Vec(x=4, y=2)",
            "a.multiply(2), giving Vec(x=4, y=2)",
            "a.times(2), giving Vec(x=4, y=1)"
          ],
          "a": 0,
          "why": "The <code>*</code> operator is the function named <code>times</code>. Vec’s version multiplies both coordinates."
        },
        play: `data class Vec(val x: Int, val y: Int) {
    operator fun plus(o: Vec) = Vec(x + o.x, y + o.y)
    operator fun times(k: Int) = Vec(x * k, y * k)
    operator fun unaryMinus() = Vec(-x, -y)
    infix fun dot(o: Vec): Int = x * o.x + y * o.y
}

fun main() {
    val a = Vec(2, 1)
    val b = Vec(1, 2)
    println(a + b)       // a.plus(b)
    println(a * 2)       // a.times(2)
    println(-a)          // a.unaryMinus()
    println(a dot b)     // a.dot(b)

    val (x, y) = a + b   // component1(), component2()
    println("x=$x y=$y")

    var c = a
    c += b               // no plusAssign, so c = c + b
    println(c)
    // swap the properties to Vec(val y: Int, val x: Int) and run again
}`
      },
      // + java-interop ────────────────────────────────
      {
        id: 'java-interop',
        title: 'Java interop',
        tagline: 'Calling Java from Kotlin, and making Kotlin pleasant to call from Java.',
        level: 'intermediate',
        body: `
<p>Most of the Android SDK and many libraries are written in Java, and older apps mix both languages. Kotlin and Java compile to the same bytecode, so they call each other directly. A few gaps show up at the border.</p>
<p><b>Kotlin calling Java:</b> Java types carry no nullability, so Kotlin sees them as <em>platform types</em>, written <code>String!</code> in the IDE. The compiler trusts you either way, which means a null can slip through. Java getters and setters look like properties (<code>view.isEnabled</code>), and a Java interface with one method takes a lambda.</p>
<p><b>Java calling Kotlin:</b> Java can’t see default arguments or companion objects the way Kotlin does. Annotations fill the gap: <code>@JvmStatic</code> makes a companion function a real static method, <code>@JvmOverloads</code> generates the shorter overloads, <code>@JvmField</code> exposes a plain field, and <code>@Throws</code> declares checked exceptions.</p>`,
        code: `class Toasts {
    companion object {
        @JvmStatic
        @JvmOverloads
        fun make(text: String, ms: Int = 2000): Toast = Toast(text, ms)
    }
}

// Java, thanks to the annotations:
// Toasts.make("Saved");          short overload, static call
// Toasts.make("Saved", 3500);

// Kotlin calling Java: a lambda for View.OnClickListener
button.setOnClickListener { save() }`,
        remember: 'Give Java values an explicit Kotlin type at the border. Annotate Kotlin APIs that Java code calls.',
        terms: [
          { term: 'Platform type', def: 'A type from Java whose nullability is unknown, shown as <code>T!</code>. Kotlin lets you treat it as nullable or not, and doesn’t check.' },
          { term: 'SAM conversion', def: 'Passing a lambda where an interface with a single abstract method is expected. Works for Java interfaces and Kotlin <code>fun interface</code>s.' },
          { term: '@JvmStatic', def: 'Makes a function in a companion or named object a static method, so Java calls <code>Foo.bar()</code> instead of <code>Foo.Companion.bar()</code>.' },
          { term: '@JvmOverloads', def: 'Generates one overload per default parameter, dropping parameters from the right, so Java can leave them out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Java call <code>Router.open("home")</code> directly, without <code>Companion</code> and without the second argument.', code: 'class Router {\n    companion object {\n        [[@JvmStatic]]\n        [[@JvmOverloads]]\n        fun open(route: String, animate: Boolean = true) { }\n    }\n}', why: '<code>@JvmStatic</code> adds the static method, and <code>@JvmOverloads</code> adds <code>open(String)</code> next to <code>open(String, boolean)</code>.' },
          { type: 'bug', prompt: 'The last line doesn’t compile. Fix the declaration it relies on.', code: 'interface OnPick {\n    fun pick(id: Int)\n}\n\nfun setOnPick(listener: OnPick) { }\n\nsetOnPick { id -> show(id) }', bug: 0, fix: 'fun interface OnPick {', why: 'A lambda converts to a Kotlin interface only if it is declared as a <code>fun interface</code>. Java interfaces with one method convert automatically.' },
        ],
        quiz: [
          { q: 'A Java method returns <code>String</code> with no annotations. What type does Kotlin give it?', options: ['<code>String</code>', '<code>String?</code>', '<code>String!</code>, a platform type'], a: 2, why: 'Without nullability annotations Kotlin can’t know, so it uses a platform type and leaves the choice to you.' },
          { q: 'Without <code>@JvmStatic</code>, how does Java call <code>fun create()</code> in <code>Foo</code>’s companion object?', options: ['<code>Foo.create()</code>', '<code>Foo.Companion.create()</code>', 'It can’t'], a: 1, why: 'The companion is an object stored in a static field named <code>Companion</code>. Its functions are instance methods on it.' },
          { q: 'Kotlin <code>fun load(path: String)</code> throws <code>IOException</code>. Java’s <code>catch (IOException e)</code> around it fails to compile. What fixes it?', options: ['<code>@Throws(IOException::class)</code>', '<code>@JvmStatic</code>', 'Nothing can'], a: 0, why: 'Kotlin has no checked exceptions, so the method has no <code>throws</code> clause. <code>@Throws</code> adds it.' },
          { q: 'A Java <code>getNickname()</code> has no annotations and returns null. What does <code>val c: String = repo.nickname</code> do?', options: ['Stores null in c', 'Fails to compile', 'Throws NullPointerException on that line'], a: 2, why: 'A platform type may be stored as non-null. Kotlin then checks the value right there, so a null fails at the border instead of three calls later.' },
          { q: 'Without any annotation, how does Java call <code>fun today()</code> declared at the top level of Dates.kt?', options: ['<code>DatesKt.today()</code>', '<code>Dates.today()</code>', '<code>today()</code>'], a: 0, why: 'Top-level functions become static methods on a class named after the file plus Kt. @file:JvmName("Dates") would allow Dates.today().' },
        ],
        deeper: [
          {
            title: 'Platform types: decide at the border',
            body: `<p>When Kotlin reads a Java value of unknown nullability, it lets you call methods on it directly and lets you store it in a non-null variable. If the value is null, you get a <code>NullPointerException</code> at runtime, the very thing Kotlin types are meant to stop.</p>
<p>The fix is to state the type the moment the value enters Kotlin code. <code>String?</code> is always safe. A non-null type is fine only when you know Java never returns null, and then a null fails right at that line, not three calls later. Java code annotated with nullability annotations, such as JSpecify or <code>androidx.annotation</code>, gives Kotlin real types instead.</p>`,
            code: `// Java
public class UserRepo {
    public String getNickname() { return null; }
}

// Kotlin
repo.nickname.length              // compiles, NPE at runtime
val b: String? = repo.nickname    // safe: now the compiler checks
val c: String = repo.nickname     // NPE right here if it was null`,
            visual(el) {
              const java = h('div', { class: 'kt', html: hl('// Java\npublic String getNickname() { return null; }') });
              const result = h('div', { class: 'slot kd-ji-slot' });
              const o = out();
              const CASES = [
                ['repo.nickname.length', null, 'compiles, then NullPointerException when the line runs'],
                ['val c: String = repo.nickname', null, 'compiles, then NullPointerException on this assignment'],
                ['val b: String? = repo.nickname', 'null', 'safe: b is String?, so the compiler makes you handle null'],
                ['repo.nickname?.length ?: 0', '0', 'safe: treated as nullable on purpose'],
              ];
              el.append(
                h('div', { class: 'stage' }, java, result),
                h('div', { class: 'controls' }, CASES.map(([src, v, note]) => cmd(src, () => {
                  if (v == null) {
                    replay(java, 'shake'); swap(result, 'NPE');
                    say(o, `${hl(src)} <span class="bad">crash:</span> <span class="muted">${note}</span>`);
                  } else {
                    swap(result, v);
                    say(o, `${hl(src)} = ${hl(v)} <span class="good">ok:</span> <span class="muted">${note}</span>`);
                  }
                }))),
                o);
              say(o, 'The Java getter returns null. Try each way of reading it from Kotlin.');
            },
          },
          {
            title: 'SAM conversion and fun interface',
            body: `<p>A Java interface with exactly one abstract method, like <code>View.OnClickListener</code> or <code>Runnable</code>, accepts a Kotlin lambda. Kotlin builds the object for you.</p>
<p>Your own Kotlin interfaces only get this if you declare them with <code>fun interface</code>. If a Java method has overloads that take different single-method interfaces, name the one you mean: <code>Runnable { … }</code>.</p>`,
            code: `button.setOnClickListener { view -> save() }       // Java interface
executor.execute(Runnable { sync() })             // pick the overload

fun interface OnRetry { fun retry(attempt: Int) }  // Kotlin interface
fun onRetry(listener: OnRetry) { }
onRetry { attempt -> log("try $attempt") }`,
          },
          {
            title: '@JvmField, @Throws and file names',
            body: `<p>Top-level functions in <code>Dates.kt</code> become static methods on a class named <code>DatesKt</code>. <code>@file:JvmName("Dates")</code> picks a nicer name for Java callers.</p>
<p><code>@JvmField</code> turns a property into a plain public field with no getter, for Java code or libraries that read fields directly. It can’t be used on private, <code>open</code>, <code>override</code>, <code>const</code> or delegated properties. <code>@Throws</code> adds a <code>throws</code> clause so Java code can catch a checked exception from Kotlin.</p>`,
            code: `@file:JvmName("Dates")
package app.util

fun today(): String = LocalDate.now().toString()   // Java: Dates.today()

class Config { @JvmField val retries = 3 }         // Java: config.retries

@Throws(IOException::class)
fun readToken(file: File): String = file.readText()`,
          },
        ],
        underHood: {
          body: `<p>A companion object is a nested class <code>Toasts.Companion</code> with one instance stored in a static field <code>Toasts.Companion</code>. Its functions are instance methods on that object. <code>@JvmStatic</code> adds a static method on <code>Toasts</code> that forwards to the companion, so both call styles work.</p>
<p>Default arguments compile to one full method plus a synthetic <code>make$default</code> method that takes a bit mask of which arguments were left out. Java can’t call the synthetic one. <code>@JvmOverloads</code> writes ordinary overloads that fill in the defaults and call the full method.</p>`,
          code: `// roughly what Java sees with both annotations
public final class Toasts {
    public static final Companion Companion = new Companion();
    public static Toast make(String text, int ms) { return Companion.make(text, ms); }
    public static Toast make(String text) { return Companion.make(text); }

    public static final class Companion {
        public Toast make(String text, int ms) { ... }
        public Toast make(String text) { return make(text, 2000); }
    }
}`,
        },
        mistakes: [
          { title: 'Trusting a Java return value to be non-null', bad: '// LegacyAuth is an old Java class with no annotations\nval token: String = legacyAuth.getToken()', good: 'val token: String? = legacyAuth.getToken()\nif (token == null) return showLogin()', why: 'Kotlin can’t tell whether the Java method may return null, so it accepts both. If it does return null, the non-null version crashes. Pick the nullable type unless you know better, and handle null at the border.' },
          { title: 'A plain Kotlin interface for a callback', bad: 'interface OnDone { fun done() }\nfun upload(onDone: OnDone) { }\nupload { toast("ok") }   // doesn\'t compile', good: 'fun interface OnDone { fun done() }\nfun upload(onDone: OnDone) { }\nupload { toast("ok") }', why: 'Only <code>fun interface</code> declarations accept a lambda in Kotlin. For Kotlin-only code, a function type <code>() -> Unit</code> is often simpler still.' },
          { title: 'Hiding a checked exception from Java', bad: 'fun loadConfig(): Config {\n    if (!file.exists()) throw IOException("missing")\n    ...\n}', good: '@Throws(IOException::class)\nfun loadConfig(): Config {\n    if (!file.exists()) throw IOException("missing")\n    ...\n}', why: 'Without <code>@Throws</code> the Java signature has no <code>throws</code> clause, so Java callers aren’t told and can’t even write a <code>catch (IOException e)</code> for it.' },
        ],
        visual(el) {
          let st = false, ov = false;
          const swS = h('input', { type: 'checkbox', id: 'kd-ji-static' });
          const swO = h('input', { type: 'checkbox', id: 'kd-ji-over' });
          const kt = h('div', { class: 'kt' });
          const java = h('div', { class: 'kt' });
          const o = out();
          const CALLS = [
            { src: 'Toasts.Companion.make("Hi", 2000);', need: [] },
            { src: 'Toasts.make("Hi", 2000);', need: ['s'] },
            { src: 'Toasts.Companion.make("Hi");', need: ['o'] },
            { src: 'Toasts.make("Hi");', need: ['s', 'o'] },
          ];
          function paint(flash) {
            lines(kt, [
              { src: 'class Toasts {' }, { src: '    companion object {' },
              { src: '        @JvmStatic', cls: st ? 'kd-new' : 'kd-off' + (flash === 's' ? ' kd-flash' : '') },
              { src: '        @JvmOverloads', cls: ov ? 'kd-new' : 'kd-off' + (flash === 'o' ? ' kd-flash' : '') },
              { src: '        fun make(text: String,' }, { src: '                 ms: Int = 2000)' }, { src: '    }' }, { src: '}' },
            ]);
            const has = k => (k === 's' ? st : ov);
            lines(java, [{ src: '// Java' }, ...CALLS.map(c => {
              const ok = c.need.every(has);
              return { src: c.src, cls: (ok ? 'kd-new' : 'kd-warn') + (flash ? ' kd-flash' : ''), note: ok ? 'ok' : 'error', noteCls: ok ? 'good' : 'bad' };
            })]);
            const n = CALLS.filter(c => c.need.every(has)).length;
            say(o, `${n} of 4 Java calls compile; the others fail with “cannot find symbol”. <span class="muted">${!st && !ov ? 'Java sees only the companion instance and the full parameter list.' : st && ov ? 'Both styles work, with or without ms.' : st ? 'Static call works, but Java must still pass ms.' : 'Java may leave out ms, but has to go through Companion.'}</span>`);
          }
          swS.addEventListener('change', () => { st = swS.checked; paint('s'); });
          swO.addEventListener('change', () => { ov = swO.checked; paint('o'); });
          paint();
          el.append(
            h('div', { class: 'kd-pair' },
              h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'Kotlin'), kt),
              h('div', { class: 'kd-card' }, h('span', { class: 'kd-label' }, 'Java call sites'), java)),
            h('div', { class: 'controls' },
              h('label', { class: 'switch', for: 'kd-ji-static' }, swS, '@JvmStatic'),
              h('label', { class: 'switch', for: 'kd-ji-over' }, swO, '@JvmOverloads'),
              act('Show Java’s view', () => { replay(java, 'pop-soft'); paint('all'); })),
            o);
        },
        predict: {
          "q": "You add only <code>@JvmOverloads</code>, not <code>@JvmStatic</code>. Which Java call starts to compile?",
          "options": [
            "<code>Toasts.make(\"Hi\");</code>",
            "<code>Toasts.Companion.make(\"Hi\");</code>",
            "<code>Toasts.make(\"Hi\", 2000);</code>"
          ],
          "a": 1,
          "why": "@JvmOverloads generates the shorter overload. Without @JvmStatic it still lives on the Companion instance, not on the class."
        },
        play: `import java.io.File
import java.util.Properties

fun main() {
    val file = File("notes.txt")
    println(file.name)                 // Java getName() reads as a property

    val task = Runnable { println("a lambda became a Java Runnable") }
    task.run()

    val sb = StringBuilder()
    sb.append("Hi")
    println(sb.length)

    val props = Properties()
    val safe: String? = props.getProperty("theme")    // platform type String!, you choose
    println(safe ?: "theme not set")

    val risky: String = props.getProperty("theme")    // compiles, but the value is null
    println(risky.length)                             // add ?: "light" above and run again
}`
      },
    ],
  });
})();
