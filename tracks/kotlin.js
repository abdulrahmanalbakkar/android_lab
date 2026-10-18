/* Kotlin track.
   A track is { id, title, description, lessons: [...] }.
   A lesson is { id, title, tagline, body (HTML), code (Kotlin), remember (one line),
                 quiz: [{ q, options, a (index of the right option), why }], visual(el) }.
   visual(el) receives an empty element and fills it with the interactive demo. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const show = v => (v == null ? 'null' : typeof v === 'string' ? `"${v}"` : String(v));

  // Demo styles for the newer lessons; every class is prefixed kt-.
  const css = `
.kt-type { justify-self: start; font: 600 0.74rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); }
.kt.kt-tpl { white-space: normal; }
.kt-tpl span { display: inline-block; white-space: pre; }
.kt-types .obj { min-width: 120px; }
.kt-tpl .kt-hole { color: var(--t-k); outline: 1.5px dashed var(--t-k); outline-offset: 1px; border-radius: 4px; transition: background 0.2s; }
.kt-tpl .kt-hole.on { background: rgba(200, 166, 255, 0.22); }
.kt-tpl .kt-filled { background: rgba(158, 223, 165, 0.14); border-radius: 4px; }
.kt-line { display: grid; grid-template-columns: repeat(11, minmax(0, 44px)); gap: 6px; justify-content: center; padding: 18px 10px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.kt-cell { aspect-ratio: 1; min-width: 0; display: grid; place-items: center; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); font: 600 0.88rem var(--mono); color: var(--muted); transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.kt-cell.in { border-color: var(--accent); color: var(--ink); }
.kt-cell.skip { opacity: 0.35; }
.kt-cell.seen { background: var(--accent-soft); }
.kt-cell.at { background: var(--accent); color: var(--accent-ink); animation: pop 0.35s ease-out; }
.kt-printed { display: inline-block; white-space: pre; }
.when .branch.kt-on { background: rgba(127, 211, 255, 0.14); border-color: var(--t-t); }
.when .branch.kt-err { background: rgba(255, 138, 155, 0.16); border-color: var(--t-e); }
.when .branch.kt-off { opacity: 0.35; }
.kt-zone { flex: 1 1 200px; min-width: 0; display: grid; gap: 10px; justify-items: center; align-content: start; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); }
.kt-zone-title { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); text-align: center; }
.kt-zone .obj { min-width: 0; }
.kt-pile { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; min-height: 46px; min-width: 0; max-width: 100%; }
.kt-tree { flex-direction: column; flex-wrap: nowrap; gap: 8px; }
.kt-card { display: grid; gap: 6px; min-width: 0; max-width: 100%; }
.kt-card .kt { border: 2px solid transparent; }
.kt-card.broken .kt { border: 2px dashed var(--err); }
.kt-tag { justify-self: start; font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.kt-tag.final { background: var(--err-soft); color: var(--err); }
.kt-tag.open { background: var(--ok-soft); color: var(--ok); }
.kt-tag.abstract, .kt-tag.interface { background: var(--warm-soft); color: var(--warm); }
.kt-up { font: 600 0.8rem var(--mono); color: var(--muted); }
.kt-enum-wrap { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; justify-content: center; min-width: 0; }
.kt-enum-wrap .when { flex: 1 1 240px; }
.kt-light { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: var(--code-bg); }
.kt-lamp { width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); transition: background 0.25s, box-shadow 0.25s; }
.kt-lamp.on.r { background: var(--err); box-shadow: 0 0 22px var(--err); }
.kt-lamp.on.y { background: var(--warm); box-shadow: 0 0 22px var(--warm); }
.kt-lamp.on.g { background: var(--ok); box-shadow: 0 0 22px var(--ok); }
.station.kt-skip { opacity: 0.4; border-style: dashed; }
.slot.kt-slot { width: 72px; height: 56px; }
.kt-capture { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 6px 8px; border-radius: 8px; background: var(--sunk); }
.chip.kt-sm { min-width: 0; height: 34px; padding: 0 10px; font-size: 0.82rem; border-width: 1.5px; }
.stage.kt-refs { gap: 10px; }
.stage.kt-col { flex-direction: column; flex-wrap: nowrap; }
.stage.kt-twice { flex-wrap: nowrap; gap: 6px; padding: 16px 8px; }
.kt-twice .slot.kt-slot { width: 52px; height: 52px; flex: none; }
.kt-twice .machine { min-width: 0; padding: 10px; flex: none; }
.kt-twice .gear { width: 24px; height: 24px; border-width: 4px; }
.kt-twice .chip { min-width: 0; height: 38px; padding: 0 8px; font-size: 0.9rem; }
.kt-ref { display: grid; gap: 6px; justify-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); font: 600 0.88rem var(--mono); min-width: 0; }
.obj .kt-pile { justify-content: flex-start; min-height: 0; }
.kt-shared { max-width: 100%; }
.stage.kt-buckets { align-items: flex-start; }
.kt-bucket { display: grid; gap: 8px; justify-items: center; padding: 10px; border: 1.5px dashed var(--line); border-radius: 12px; background: var(--surface); min-width: 0; max-width: 100%; }
.kt-bucket-key { font: 600 0.78rem var(--mono); color: var(--accent); }
.field.kt-unset { color: var(--muted); font-style: italic; }
.field.kt-stale { background: var(--err-soft); color: var(--err); font-weight: 600; }
.field.kt-ptr { color: var(--ok); font-weight: 600; }
.kt-body-prop { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed var(--line); }
.kt-card.kt-d2-on .kt { border-color: var(--t-k); }
.kt-zone.kt-d2-on { border-color: var(--accent); background: var(--accent-soft); }
.obj.kt-d2-ty-card { justify-items: start; min-width: 0; max-width: 100%; }
.kt-d2-ty-card .chip { max-width: 100%; overflow-wrap: anywhere; height: auto; min-height: 46px; }
.kt-d2-cf-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 44px)); gap: 6px; justify-content: center; padding: 14px 10px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.kt-cell.kt-d2-cf-hit { background: var(--ok); color: var(--surface); border-color: var(--ok); }
.obj.kt-d2-ob-ghost { border-style: dashed; border-color: var(--muted); opacity: 0.7; }
.kt-d2-sc-pre { white-space: pre; }
.kt-type.kt-d2-sc-drop { justify-self: center; text-decoration: line-through; background: var(--sunk); color: var(--muted); }
.kt-d2-se-boxes { display: grid; gap: 2px; min-width: 0; }
.kt-d2-se-boxes .switch { font-weight: 500; overflow-wrap: anywhere; }
.kt-d2-se-leaf { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--muted); transition: background 0.2s, color 0.2s; max-width: 100%; overflow-wrap: anywhere; }
.kt-d2-se-leaf.ok { background: var(--ok-soft); color: var(--ok); }
.kt-d2-se-leaf.bad { background: var(--err-soft); color: var(--err); }
.kt-d2-se-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 12px; min-width: 0; }
.kt-d2-se-col { display: grid; gap: 8px; min-width: 0; align-content: start; }
.kt-pile.kt-d2-se-head { justify-content: space-between; align-items: center; min-height: 0; }
.kt-d2-ex-tag { font: 600 0.7rem var(--mono); padding: 1px 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); color: var(--t-c); }
.kt-d2-ex-tag.ok { background: rgba(126, 226, 168, 0.18); color: var(--t-k); }
.kt-li-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 12px; min-width: 0; }
.obj.kt-li-obj { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.kt-li-count { font: 600 0.78rem var(--mono); color: var(--muted); }
.machine.kt-li-machine, .machine.kt-pr-machine { min-width: 0; max-width: 100%; padding: 10px 12px; }
.kt-li-machine .kt, .kt-pr-machine .kt { white-space: normal; overflow-wrap: anywhere; }
.kt-pr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 10px; min-width: 0; }
.kt-pr-cell { display: grid; gap: 4px; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: background 0.2s, border-color 0.2s; }
.kt-pr-cell.ok { border-color: var(--ok); background: var(--ok-soft); }
.kt-pr-cell.no { border-color: var(--err); background: var(--err-soft); }
.kt-pr-where { font: 600 0.82rem var(--mono); color: var(--ink); }
.kt-pr-mark { font-size: 0.85rem; color: var(--muted); }
.kt-pr-cell.ok .kt-pr-mark { color: var(--ok); }
.kt-pr-cell.no .kt-pr-mark { color: var(--err); }
.kt-ms-three { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 10px; min-width: 0; }
.kt-zone.kt-ms-zone { align-content: start; }
.kt-ms-map { display: grid; gap: 4px; justify-items: center; font: 500 0.85rem var(--mono); min-width: 0; }
.kt-ms-empty { font-size: 0.85rem; }
.slot.kt-ms-slot { width: auto; min-width: min(140px, 100%); max-width: 100%; padding: 0 12px; font: 600 0.95rem var(--mono); }
.kt-pile.kt-ms-res { min-height: 40px; }
`;

  Lab.addTrack({
    id: 'kotlin',
    title: 'Kotlin',
    description: 'The language Android is written in, from val to sealed classes and exceptions.',
    group: 'Foundations', requires: [],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'vals',
        title: 'val and var',
        tagline: 'Names that can and can’t be reassigned.',
        body: `
<p><code>val</code> names a value that never gets replaced. <code>var</code> names something you can point at a new value later.</p>
<p>Start with <code>val</code>. Switch to <code>var</code> only when the value really has to change, like a counter or a score. Fewer things that change means fewer bugs to chase.</p>
<p>One catch: <code>val</code> locks the <em>name</em>, not the object behind it. A <code>val list = mutableListOf(1)</code> can still grow with <code>list.add(2)</code>.</p>`,
        code: `val name = "Ada"      // read-only
var score = 10        // mutable

score += 5            // fine: score is now 15
name = "Grace"        // error: 'val' cannot be reassigned

val items = mutableListOf(1)
items.add(2)          // fine: the list changes, the name doesn't`,
        remember: 'val can’t be reassigned, var can. Default to val.',
        level: 'beginner',
        terms: [
          { term: 'val', def: 'A read-only reference. It is set once and can’t point at a new value.' },
          { term: 'var', def: 'A mutable reference. You can assign it a new value later.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>count</code> changeable and keep <code>title</code> fixed.', code: '[[val]] title = "Inbox"\n[[var]] count = 0\ncount += 1', why: 'Only <code>count</code> gets a new value, so only it needs <code>var</code>.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'val user = "Ada"\nvar visits = 0\nvisits = visits + 1\nuser = "Grace"', bug: 3, fix: '// remove it, or declare user with var on line 1', why: '<code>user</code> is a <code>val</code>, so it can’t be reassigned.' },
        ],
        quiz: [
          { q: 'Which of these compiles?', options: ['<code>val a = 1; a = 2</code>', '<code>var b = 1; b = 2</code>', 'Both'], a: 1, why: 'Only a <code>var</code> can take a new value after it is set.' },
          { q: '<code>val list = mutableListOf(1)</code>. Does <code>list.add(2)</code> compile?', options: ['Yes', 'No, val makes the list read-only'], a: 0, why: '<code>val</code> stops you from pointing <code>list</code> at a different list. The list object itself can still change.' },
        ],
        deeper: [
          {
            title: 'A val can still give different answers',
            body: `<p>A <code>val</code> property can have a custom getter. Then nothing is stored at all: the getter runs on every read, so the answer changes when the values it reads change.</p>
<p><code>val</code> only promises there is no setter. For a value fixed at compile time, use <code>const val</code>. It works for numbers, <code>Boolean</code>, <code>Char</code> and <code>String</code>, at the top level or inside an <code>object</code>.</p>`,
            code: `class Rect(var w: Int, var h: Int) {
    val area: Int get() = w * h    // runs on every read
    val startArea = w * h          // stored once, at creation
}

const val MAX_ITEMS = 50           // compile-time constant`,
            visual(el) {
              let w = 3, ht = 2, busy = false;
              const start = w * ht;
              const fw = h('span', { class: 'field' }, `var w = ${w}`);
              const fh = h('span', { class: 'field' }, `var h = ${ht}`);
              const fs = h('span', { class: 'field' }, `val startArea = ${start}`);
              const obj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'rect: Rect'), fw, fh, fs,
                h('span', { class: 'obj-addr' }, 'area: no field, only a getter'));
              const calc = h('div', { class: 'kt', html: hl('get() = w * h') });
              const getter = h('div', { class: 'machine' }, h('div', { class: 'gear' }), calc);
              const result = h('div', { class: 'slot' });
              const o = out();
              const bump = (which) => {
                if (busy) return;
                const f = which === 'w' ? fw : fh;
                if (which === 'w') w += 1; else ht += 1;
                f.textContent = which === 'w' ? `var w = ${w}` : `var h = ${ht}`;
                f.className = 'field changed'; replay(f, 'pop');
                say(o, `${hl(`rect.${which} += 1`)} <span class="muted">// startArea is still ${start}</span>`);
              };
              async function readArea() {
                if (busy) return; busy = true;
                calc.innerHTML = hl(`get() = ${w} * ${ht}`);
                getter.classList.add('busy');
                await sleep(650);
                getter.classList.remove('busy');
                if (!getter.isConnected) return;
                swap(result, String(w * ht));
                say(o, `${hl('rect.area')} = ${hl(String(w * ht))} <span class="muted">// computed on this read</span>`);
                busy = false;
              }
              function readStart() {
                if (busy) return;
                replay(fs, 'pop'); swap(result, String(start));
                say(o, `${hl('rect.startArea')} = ${hl(String(start))} <span class="muted">// stored at creation, never recomputed</span>`);
              }
              el.append(
                h('div', { class: 'stage' }, obj, getter, result),
                h('div', { class: 'controls' },
                  cmd('rect.w += 1', () => bump('w')),
                  cmd('rect.h += 1', () => bump('h')),
                  cmd('rect.area', readArea),
                  cmd('rect.startArea', readStart)),
                o);
              swap(result, String(w * ht));
              say(o, `${hl('rect.area')} = ${hl('6')} <span class="muted">// change w or h, then read both vals again</span>`);
            },
          },
          {
            title: 'When the value isn’t ready at construction',
            body: `<p>A property must get its value when the object is built. Sometimes that value only exists later, like a Fragment’s adapter or a test’s subject. Don’t reach for a nullable <code>var</code> straight away.</p>
<p>Kotlin has two tools for this: <code>lateinit var</code>, which you assign yourself later, and <code>val … by lazy { }</code>, which computes itself on first read. The next lesson, <strong>lateinit and lazy</strong>, compares them.</p>`,
            code: `private lateinit var adapter: FeedAdapter       // assigned in onViewCreated
private val formatter by lazy { NumberFormat.getInstance() }  // built on first use`,
          },
        ],
        underHood: {
          body: `<p>A <code>val</code> property compiles to a private field plus a getter, <code>getName()</code>. A <code>var</code> also gets a setter, <code>setName()</code>. A <code>val</code> with a custom getter that never mentions <code>field</code> has no field at all, only the getter method.</p>
<p>For a local variable there is no runtime difference between <code>val</code> and <code>var</code>: the compiler enforces the rule and the bytecode is the same. A <code>const val</code> is copied into every place that reads it. A <code>lateinit</code> property is a normal nullable field whose getter checks for null and throws <code>UninitializedPropertyAccessException</code>.</p>`,
          code: `// Kotlin
class Rect(var w: Int, var h: Int) {
    val area: Int get() = w * h
}

// Roughly what the JVM sees (decompiled to Java)
public final class Rect {
    private int w;
    private int h;
    public final int getW() { return w; }
    public final void setW(int value) { w = value; }
    // the same pair for h
    public final int getArea() { return w * h; }   // no field
}`,
        },
        mistakes: [
          { title: 'A var just to fill it from branches', bad: 'var label = ""\nif (count == 0) {\n    label = "Empty"\n} else {\n    label = "$count items"\n}', good: 'val label = if (count == 0) "Empty" else "$count items"', why: '<code>if</code> is an expression, so the value can be built in one step. The <code>val</code> also proves nothing changes it later.' },
          { title: 'Mutating a var inside screen state', bad: 'data class CartState(var count: Int)\n\n_state.value.count += 1   // screen never updates', good: 'data class CartState(val count: Int)\n\n_state.update { it.copy(count = it.count + 1) }', why: 'Changing a field inside the current object never sets a new value, so <code>StateFlow</code> has nothing to emit. With <code>val</code> fields the only way to change state is a new object, which observers see.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'val name = "Ada"\nvar score = 10\nscore += 5\nname = "Grace"\nval items = mutableListOf(1)\nitems.add(2)',
            predict: {
              q: 'Line 4 tries <code>name = "Grace"</code>. What happens?',
              options: ['<code>name</code> becomes "Grace"', 'The code does not compile', 'It compiles, then crashes when line 4 runs', 'Kotlin quietly makes a copy called <code>name</code>'],
              a: 1,
              why: 'A <code>val</code> is assigned once. The compiler checks that, so the program never builds.',
            },
            frames: [
              { say: 'Six lines. Step through them and watch the names on the right.' },
              { line: 1, vars: { 'val name': '"Ada"' }, say: '<code>val</code> creates a read-only name and points it at <code>"Ada"</code>.' },
              { line: 2, vars: { 'var score': '10' }, say: '<code>var</code> creates a name that can point at a new value later.' },
              { line: 3, vars: { 'var score': '15' }, say: '<code>score += 5</code> points <code>score</code> at a new value, <code>15</code>. Allowed, because it is a <code>var</code>.' },
              { line: 4, out: "error: 'val' cannot be reassigned", say: 'The compiler rejects line 4 before anything runs. <code>name</code> is a <code>val</code>, so it can never point at <code>"Grace"</code>.' },
              { line: 5, vars: { 'val items': '[1]' }, out: '(line 4 deleted, build OK)', say: 'Delete line 4 and it builds. <code>items</code> is a <code>val</code> that points at a mutable list.' },
              { line: 6, vars: { 'val items': '[1, 2]' }, say: 'The list grew, and that is fine. <code>val</code> locks the <em>name</em>, not the object behind it.' },
            ],
          });
        }
,
        play: `fun main() {
    val name = "Ada"
    var score = 10
    score += 5
    // name = "Grace"   // remove the // and run: it will not compile

    val items = mutableListOf(1)
    items.add(2)
    println("$name has $score points and items $items")
}`,
      },

      // + lateinit ────────────────────────────────────
      {
        id: 'lateinit',
        title: 'lateinit and lazy',
        tagline: 'Non-null properties whose value arrives after the constructor.',
        body: `
<p>Some properties can’t get their value in the constructor. A Fragment builds its adapter in <code>onViewCreated</code>. A test builds its subject in <code>@Before</code>. Making them nullable would force a <code>?.</code> on every use, even though they are never null once the screen is running.</p>
<p><code>lateinit var</code> says: “this is non-null, I will assign it before anyone reads it.” If you break that promise, the read throws <code>UninitializedPropertyAccessException</code> with the property’s name in the message.</p>
<p><code>val x by lazy { }</code> solves a different problem. Nobody assigns it. The block runs on the first read, the result is kept, and every later read returns the same value. Use it for something costly that may never be needed.</p>`,
        code: `class FeedFragment : Fragment(R.layout.feed) {
    // assigned later, by you
    private lateinit var adapter: FeedAdapter

    // computed on first read, then kept
    private val dateFormat by lazy {
        SimpleDateFormat("d MMMM yyyy", Locale.US)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        adapter = FeedAdapter(dateFormat)
    }
}`,
        remember: 'lateinit: you assign it later. lazy: it computes itself on first read. Neither is for values that can really be missing.',
        level: 'beginner',
        terms: [
          { term: 'lateinit', def: 'A modifier for a non-null <code>var</code> that is assigned after construction. Reading it first throws.' },
          { term: 'UninitializedPropertyAccessException', def: 'The exception thrown when a <code>lateinit</code> property is read before anything assigned it.' },
          { term: 'by lazy', def: 'A delegate that runs its block on the first read of a <code>val</code> and returns the stored result after that.' },
          { term: 'isInitialized', def: 'Checks whether a <code>lateinit</code> property has been assigned, written <code>::name.isInitialized</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The adapter is assigned in <code>onViewCreated</code>. The formatter should be built only when first used.', code: 'private [[lateinit]] var adapter: FeedAdapter\nprivate val dateFormat by [[lazy]] {\n    SimpleDateFormat("d MMMM", Locale.US)\n}', why: '<code>lateinit</code> marks a <code>var</code> you assign yourself later. <code>lazy</code> builds the value on the first read.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'class LoginTest {\n    private lateinit val repo: FakeRepo\n\n    @Before fun setUp() {\n        repo = FakeRepo()\n    }\n}', bug: 1, fix: '    private lateinit var repo: FakeRepo', why: '<code>lateinit</code> only works on <code>var</code>. It has to be assigned after construction, and a <code>val</code> can’t be assigned there.' },
        ],
        quiz: [
          { q: 'A <code>lateinit</code> property is read before it was assigned. What happens?', options: ['It returns null', 'It throws UninitializedPropertyAccessException', 'It returns a default value'], a: 1, why: 'The getter checks the field and throws, naming the property in the message.' },
          { q: 'Which declaration compiles?', options: ['<code>lateinit var count: Int</code>', '<code>lateinit var name: String?</code>', '<code>lateinit var name: String</code>'], a: 2, why: '<code>lateinit</code> needs a non-null type that isn’t a primitive like <code>Int</code>.' },
          { q: '<code>val db by lazy { openDb() }</code> is read three times. How many times does <code>openDb()</code> run?', options: ['Once', 'Three times', 'Never, until you call it'], a: 0, why: '<code>lazy</code> runs the block on the first read and stores the result for every later read.' },
          { q: 'A Fragment keeps <code>private lateinit var binding: FeedBinding</code> and never clears it. The user opens another screen and this Fragment goes to the back stack. What is the problem?', options: ['The next read of binding throws UninitializedPropertyAccessException', 'Android sets binding back to unassigned in onDestroyView', 'The old view tree stays in memory while the Fragment object lives'], a: 2, why: 'The Fragment outlives its view on the back stack, and the lateinit field still points at the destroyed views. A nullable backing property cleared in onDestroyView lets them go.' },
          { q: 'You need “assign later, crash if read early” for <code>var pageSize: Int</code>. Which declaration works?', options: ['<code>lateinit var pageSize: Int</code>', '<code>val pageSize: Int by lazy</code>', '<code>var pageSize: Int by Delegates.notNull()</code>'], a: 2, why: 'lateinit is not allowed on primitive types like Int. Delegates.notNull() gives the same rule and throws IllegalStateException on an early read.' },
        ],
        deeper: [
          {
            title: 'Ask before you read: isInitialized',
            body: `<p>Inside the class (or the same file, for a top-level property) you can check <code>::adapter.isInitialized</code> before reading. It is handy in teardown code that may run even when setup failed half way.</p>
<p>If you find yourself checking it in many places, the value really can be missing. Make it nullable and let the compiler help instead.</p>`,
            code: `@After fun tearDown() {
    if (::db.isInitialized) db.close()
}`,
          },
          {
            title: 'Primitives: Delegates.notNull()',
            body: `<p><code>lateinit</code> is not allowed on <code>Int</code>, <code>Boolean</code> and the other primitive types. When you need the same “assign later, crash if read early” rule for a number, use <code>by Delegates.notNull()</code>. A read before the first assignment throws <code>IllegalStateException</code>.</p>
<p>Often a plain start value is simpler: <code>var retries = 0</code>.</p>`,
            code: `import kotlin.properties.Delegates

var pageSize: Int by Delegates.notNull()

pageSize = 20
println(pageSize)   // 20`,
          },
          {
            title: 'Fragment bindings outlive their views',
            body: `<p>A Fragment object can live on after its view is destroyed, for example on the back stack. A <code>lateinit var binding</code> keeps pointing at the old view tree, so the whole tree stays in memory.</p>
<p>The Android docs use a nullable backing property instead: assign it in <code>onCreateView</code>, set it to <code>null</code> in <code>onDestroyView</code>, and read it through a non-null getter that is only valid in between.</p>`,
            code: `private var _binding: ResultProfileBinding? = null
// only valid between onCreateView and onDestroyView
private val binding get() = _binding!!

override fun onDestroyView() {
    super.onDestroyView()
    _binding = null
}`,
          },
        ],
        underHood: {
          body: `<p>A <code>lateinit</code> property is stored in a normal field that the JVM allows to be null. The generated getter checks that field, and if it is null it throws <code>UninitializedPropertyAccessException</code> instead of returning it. That is why primitives are excluded: an <code>int</code> field can’t hold null, so there would be no way to mark it unset.</p>
<p><code>by lazy</code> stores a <code>Lazy</code> object next to the property. Its first <code>value</code> read runs your block and keeps the result. By default that first run is synchronized, so two threads never both run the block.</p>`,
          code: `// private lateinit var adapter: FeedAdapter
// roughly what the getter does:
FeedAdapter getAdapter() {
    if (adapter == null) throw new UninitializedPropertyAccessException("lateinit property adapter has not been initialized");
    return adapter;
}`,
        },
        mistakes: [
          { title: 'lateinit on a primitive', bad: 'private lateinit var retries: Int', good: 'private var retries = 0\n// or: private var retries: Int by Delegates.notNull()', why: '<code>lateinit</code> needs a field that can hold null while unset, so it isn’t allowed on <code>Int</code>, <code>Boolean</code> and the other primitive types. Give it a start value, or use <code>Delegates.notNull()</code>.' },
          { title: 'lateinit for a value that may never come', bad: 'lateinit var avatarUrl: String   // some users have none\n\nif (::avatarUrl.isInitialized) load(avatarUrl)', good: 'var avatarUrl: String? = null\n\navatarUrl?.let { load(it) }', why: 'When “no value” is a normal state, say so in the type. A nullable property makes every reader handle it, and the compiler checks that they do.' },
          { title: 'lazy that reads something not ready yet', bad: 'class ProfileFragment : Fragment() {\n    private val userId by lazy { requireArguments().getString("id")!! }\n    init { log(userId) }   // arguments not set yet\n}', good: 'class ProfileFragment : Fragment() {\n    private val userId by lazy { requireArguments().getString("id")!! }\n    override fun onViewCreated(view: View, s: Bundle?) { log(userId) }\n}', why: '<code>lazy</code> runs on the first read, wherever that is. Read it only once the things it depends on exist.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'class FeedFragment {\n    lateinit var adapter: FeedAdapter\n    val dateFormat by lazy { SimpleDateFormat("d MMM") }\n}\nval f = FeedFragment()\nf.dateFormat.format(today)\nf.dateFormat.format(today)\nf.adapter = FeedAdapter()\nf.adapter.submitList(items)\nval g = FeedFragment()\ng.adapter.submitList(items)',
            varsTitle: 'Fields',
            predict: {
              q: 'Line 8 assigns <code>f.adapter</code>. Line 11 then uses <code>g.adapter</code> on a second, new <code>FeedFragment</code>. What happens?',
              options: ['It works: f already assigned the adapter', 'It throws <code>UninitializedPropertyAccessException</code>', 'It returns null and nothing is shown'],
              a: 1,
              why: 'A <code>lateinit</code> property is a field of each object. Assigning <code>f.adapter</code> fills only f’s field, so g’s getter still finds it empty and throws.',
            },
            frames: [
              { say: 'One <code>lateinit</code> property and one <code>lazy</code> property. Watch when each one gets its value.' },
              { line: 5, vars: { 'f.adapter': '(not set)', 'f.dateFormat': '(not computed)', 'lazy block ran': '0 times' }, say: 'The constructor runs. Neither property has a value yet, and nothing is null-checked.' },
              { line: [6, 3], vars: { 'f.dateFormat': 'SimpleDateFormat@7c21', 'lazy block ran': '1 time' }, out: '14 Mar', say: 'The first read of <code>dateFormat</code> runs the <code>lazy</code> block and keeps the result.' },
              { line: 7, out: '14 Mar', say: 'The second read returns the kept object. The block does not run again.' },
              { line: 8, vars: { 'f.adapter': 'FeedAdapter@3b9a' }, say: 'Nobody computes a <code>lateinit</code> value for you. You assign it, here as <code>onViewCreated</code> would.' },
              { line: 9, say: 'Now the read is fine. The getter finds a value and returns it.' },
              { line: 10, vars: { 'g.adapter': '(not set)' }, say: 'A second object gets its own empty field.' },
              { line: 11, out: 'UninitializedPropertyAccessException: lateinit property adapter has not been initialized', say: 'The getter finds g’s field empty and throws, naming the property. A broken promise fails loudly, right where it was broken.' },
            ],
          });
        },
        play: `class Screen {
    lateinit var title: String

    val formatter by lazy {
        println("building the formatter")
        "[%s]"
    }
}

fun main() {
    val s = Screen()
    println(s.formatter.format("one"))
    println(s.formatter.format("two"))   // the lazy block does not run again

    s.title = "Home"                      // put // in front of this line and run again
    println(s.title)
}`,
      },

      // + types ─────────────────────────────────────
      {
        id: 'types',
        title: 'Basic types and string templates',
        tagline: 'Int, Double, String, and values inside text.',
        body: `
<p>Kotlin works out a type from the value you assign. A whole number is an <code>Int</code>, or a <code>Long</code> when it is too big for Int or ends in <code>L</code>. A decimal is a <code>Double</code>, and <code>0.5f</code> is a <code>Float</code>. You also get <code>Boolean</code>, <code>Char</code> in single quotes and <code>String</code> in double quotes.</p>
<p>Numbers never convert on their own. An Int can’t go where a Long is expected, so you call <code>toLong()</code> or <code>toDouble()</code>. To read a number from text, <code>"42".toInt()</code> works but throws on bad input. <code>toIntOrNull()</code> gives null instead.</p>
<p>Put values inside a string with a template: <code>$name</code> for a plain name, <code>\${count + 1}</code> for any expression. Triple quotes make a raw string that keeps line breaks and needs no escapes.</p>`,
        code: `val count = 42                 // Int
val big = 3_000_000_000        // Long: too big for Int
val price = 9.99               // Double
val ratio = 0.5f               // Float
val done = false               // Boolean
val initial = 'A'              // Char
val name = "Ada"               // String

val total: Long = count.toLong()   // no automatic widening
val parsed = "42".toInt()          // 42
val safe = "4x".toIntOrNull()      // null

println("$name has \${count + 1} points")
val json = """
    {"name": "$name"}
""".trimIndent()`,
        remember: 'The value picks the type. Convert numbers with toX(). $name and ${expr} put values into text.',
        level: 'beginner',
        terms: [
          { term: 'Type inference', def: 'The compiler works out a variable’s type from the value assigned to it, so you don’t have to write it.' },
          { term: 'String template', def: 'A $name or ${expression} inside a string literal that is replaced by its value.' },
          { term: 'Raw string', def: 'A string in triple quotes that keeps line breaks and treats backslashes literally.' },
          { term: 'toIntOrNull', def: 'Parses a string as an Int and returns null instead of throwing when the text is not a number.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the Int into a Long, then print it with a template.', code: 'val count: Int = 21\nval total: Long = count.[[toLong]]()\nprintln("Total: [[$]]total")', why: 'Kotlin never widens numbers for you, so <code>toLong()</code> is required. <code>$total</code> drops the value into the string.' },
          { type: 'bug', prompt: 'One line has a type mismatch. Tap it.', code: 'val count: Int = 10\nval total: Long = count\nval average = total / 2.0\nprintln("Average $average")', bug: 1, fix: 'val total: Long = count.toLong()', why: 'An Int is not a Long, even though every Int fits. Convert it with <code>toLong()</code>.' },
        ],
        quiz: [
          { q: 'What type does <code>val x = 3_000_000_000</code> get?', options: ['<code>Int</code>', '<code>Long</code>', '<code>Double</code>'], a: 1, why: 'The number is bigger than Int’s maximum of about 2.1 billion, so Kotlin picks Long.' },
          { q: '<code>val a = 1; val b = 2</code>. What does <code>"$a + $b"</code> contain?', options: ['<code>"1 + 2"</code>', '<code>"3"</code>', '<code>"$a + $b"</code>'], a: 0, why: 'Each <code>$name</code> is replaced on its own. To compute the sum, write <code>"${a + b}"</code>.' },
          { q: 'What does <code>"abc".toInt()</code> do?', options: ['Returns 0', 'Returns null', 'Throws NumberFormatException'], a: 2, why: '<code>toInt()</code> throws on text that is not a number. Use <code>toIntOrNull()</code> to get null instead.' },
          { q: 'What does <code>val ms = 30 * 24 * 60 * 60 * 1000</code> hold?', options: ['A wrong negative number: the Int overflowed', '2592000000', 'Nothing: it throws ArithmeticException'], a: 0, why: 'Every factor is an Int, so the math runs in Int and wraps past 2,147,483,647 without a warning. Write 30L or use 30.days.inWholeMilliseconds.' },
          { q: 'What does <code>println(0.1 + 0.2 == 0.3)</code> print?', options: ['true', 'false', 'It does not compile'], a: 1, why: 'Doubles store binary fractions, and 0.1 + 0.2 is 0.30000000000000004. Compare with a tolerance, or keep money in Long cents.' },
        ],
        deeper: [
          {
            title: 'Int overflow wraps around without a warning',
            body: `<p>An <code>Int</code> holds values up to 2,147,483,647. One more and it wraps to the most negative value, -2,147,483,648. There is no exception and no warning, just a wrong number.</p>
<p>Time math hits this often: 30 days in milliseconds is about 2.6 billion. Make the first number in the chain a <code>Long</code> with an <code>L</code> suffix so every step runs in Long, or use <code>kotlin.time.Duration</code>.</p>`,
            code: `val days = 30
val bad = days * 24 * 60 * 60 * 1000    // -1702967296
val good = days * 24L * 60 * 60 * 1000  // 2592000000

// import kotlin.time.Duration.Companion.days
val ms = 30.days.inWholeMilliseconds    // 2592000000`,
            visual(el) {
              const chains = [
                { src: 'days * 24 * 60 * 60 * 1000', long: false, steps: [['days', 30], ['* 24', 24], ['* 60', 60], ['* 60', 60], ['* 1000', 1000]] },
                { src: 'days * 24L * 60 * 60 * 1000', long: true, steps: [['days', 30], ['* 24L', 24], ['* 60', 60], ['* 60', 60], ['* 1000', 1000]] },
                { src: 'Int.MAX_VALUE + 1', long: false, add: true, steps: [['Int.MAX_VALUE', 2147483647], ['+ 1', 1]] },
              ];
              let busy = false;
              const track = h('div', { class: 'track' });
              const o = out();
              const buttons = chains.map(c => cmd(c.src, () => run(c)));
              async function run(c) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', chains[i] === c));
                const st = c.steps.map(s => h('div', { class: 'station' }, h('span', { class: 'st-label' }, s[0])));
                track.replaceChildren(...st);
                let v = 0, wrapped = false;
                for (let i = 0; i < c.steps.length; i++) {
                  const n = c.steps[i][1];
                  if (i === 0) v = n;
                  else if (c.long) v = v * n;
                  else {
                    const exact = c.add ? v + n : v * n;
                    v = c.add ? (v + n) | 0 : Math.imul(v, n);
                    wrapped = exact !== v;
                  }
                  const isLong = c.long && i > 0;
                  st[i].classList.add('on');
                  st[i].append(h('span', { class: 'token pop' + (wrapped ? ' boom' : '') }, String(v)), h('span', { class: 'kt-type' }, isLong ? 'Long' : 'Int'));
                  if (wrapped) replay(st[i], 'shake');
                  await sleep(520); if (!track.isConnected) return;
                }
                say(o, wrapped
                  ? `<span class="bad">wrapped:</span> ${hl(c.src)} = ${hl(String(v))} <span class="muted">// the real answer doesn’t fit in an Int</span>`
                  : `<span class="good">ok:</span> ${hl(c.src)} = ${hl(String(v))} <span class="muted">// ${c.long ? 'Long from 24L on' : 'fits in an Int'}</span>`);
                busy = false;
              }
              el.append(h('div', { class: 'kt', html: hl('val days = 30') }), h('div', { class: 'controls' }, buttons), track, o);
              run(chains[0]);
            },
          },
          {
            title: 'Doubles are close, not exact',
            body: `<p>A <code>Double</code> stores a binary fraction. Most decimals, like 0.1, have no exact binary form, so tiny errors creep in: <code>0.1 + 0.2</code> is <code>0.30000000000000004</code>, and comparing it to 0.3 with <code>==</code> fails.</p>
<p>Compare Doubles with a small tolerance. Where exact values matter, avoid fractions: store money as a <code>Long</code> count of cents, or use <code>BigDecimal</code>. Also note that dividing two Ints drops the fraction, and dividing an Int by zero throws while a Double gives <code>Infinity</code>.</p>`,
            visual(el) {
              const exprs = [
                { src: '7 / 2', type: 'Int', v: '3', note: 'both Ints: the fraction is dropped' },
                { src: '7 / 2.0', type: 'Double', v: '3.5', note: 'one Double makes it Double division' },
                { src: '0.1 + 0.2', type: 'Double', v: '0.30000000000000004', note: 'the nearest binary values, added' },
                { src: '0.1 + 0.2 == 0.3', type: 'Boolean', v: 'false', note: 'never compare Doubles with ==' },
                { src: 'abs(0.1 + 0.2 - 0.3) < 1e-9', type: 'Boolean', v: 'true', note: 'compare with a tolerance (kotlin.math.abs)' },
                { src: '10 + 20', type: 'Int', v: '30', note: 'money as cents: exact' },
                { src: '1.0 / 0', type: 'Double', v: 'Infinity', note: 'Doubles have Infinity and NaN' },
                { src: '1 / 0', error: 'ArithmeticException: / by zero' },
              ];
              const expr = h('div', { class: 'kt' });
              const type = h('span', { class: 'kt-type' });
              const val = h('span', { class: 'chip' });
              const card = h('div', { class: 'obj kt-d2-ty-card' }, expr, type, val);
              const o = out();
              const buttons = exprs.map(x => cmd(x.src, () => show(x)));
              function show(x) {
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', exprs[i] === x));
                expr.innerHTML = hl(x.src);
                if (x.error) {
                  type.textContent = 'throws'; val.textContent = 'crash';
                  replay(card, 'shake');
                  say(o, `<span class="bad">crash:</span> ${x.error} <span class="muted">// Int division by zero throws</span>`);
                  return;
                }
                type.textContent = x.type; val.textContent = x.v;
                replay(val, 'flip');
                say(o, `${hl(x.src)} = ${hl(x.v)} <span class="muted">// ${x.note}</span>`);
              }
              el.append(h('div', { class: 'stage' }, card), h('div', { class: 'controls' }, buttons), o);
              show(exprs[2]);
            },
          },
        ],
        underHood: {
          body: `<p>A non-null <code>Int</code> compiles to the JVM primitive <code>int</code>: 4 bytes, no object around it. An <code>Int?</code>, or an Int inside a generic type like <code>List&lt;Int&gt;</code>, has to be an object, so it is <em>boxed</em> into a <code>java.lang.Integer</code>. Long, Double and the others work the same way.</p>
<p>Boxing is why numbers are compared with <code>==</code>, never <code>===</code>. The JVM caches the boxes for values from -128 to 127, so two boxed 100s are the same object while two boxed 10000s are not. String templates do no work at runtime beyond building the string: the compiler turns them into ordinary concatenation.</p>`,
          code: `val a: Int = 100
val boxedA: Int? = a
val anotherBoxedA: Int? = a

val b: Int = 10000
val boxedB: Int? = b
val anotherBoxedB: Int? = b

boxedA === anotherBoxedA   // true: cached box
boxedB === anotherBoxedB   // false: two boxes
boxedB == anotherBoxedB    // true: same value`,
        },
        mistakes: [
          { title: 'A dot right after $name', bad: 'println("Hi $user.name")\n// Hi User(name=Ada, age=36).name', good: 'println("Hi \${user.name}")\n// Hi Ada', why: 'A short template ends at the first character that can’t be part of a name, so <code>$user</code> stops at the dot. Use braces for anything longer than one name.' },
          { title: 'Reading a digit as its character code', bad: 'val digit = pin[0].code   // 55 for \'7\'', good: 'val digit = pin[0].digitToInt()   // 7', why: '<code>code</code> is the character’s Unicode number. <code>digitToInt()</code> gives the digit’s value and throws if the character is not a digit.' },
          { title: 'Converting after an Int division', bad: 'val average: Double =\n    (total / count).toDouble()', good: 'val average: Double =\n    total.toDouble() / count', why: 'With two Ints the fraction is already gone before <code>toDouble()</code> runs. Convert one side first so the division itself is done in Double.' },
        ],
        visual(el) {
          const decls = [
            { src: 'val a = 42', name: 'a', type: 'Int', value: '42' },
            { src: 'val b = 3_000_000_000', name: 'b', type: 'Long', value: '3000000000', note: 'too big for Int' },
            { src: 'val c = 9.99', name: 'c', type: 'Double', value: '9.99' },
            { src: "val d = 'K'", name: 'd', type: 'Char', value: "'K'" },
            { src: 'val e = "42".toInt()', name: 'e', type: 'Int', value: '42', note: 'parsed from text' },
            { src: 'val f = "4x".toIntOrNull()', name: 'f', type: 'Int?', value: 'null', note: 'not a number, so null' },
            { src: 'val g = "4x".toInt()', error: 'NumberFormatException: For input string: "4x"' },
          ];
          const stage = h('div', { class: 'stage kt-types' });
          const o = out();
          const shown = [];
          const card = (d, anim) => h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, `val ${d.name}`),
            h('span', { class: 'kt-type' }, d.type),
            h('span', { class: 'field' }, `= ${d.value}`));
          function declare(d, anim = true) {
            if (d.error) { replay(stage, 'shake'); say(o, `<span class="bad">crash:</span> ${d.error}`); return; }
            const old = shown.find(x => x.d === d);
            if (old) replay(old.el, 'pop');
            else {
              const c = card(d, anim); stage.append(c); shown.push({ d, el: c });
              if (shown.length > 4) shown.shift().el.remove();
            }
            say(o, `${hl(d.src)}  <span class="muted">// ${d.type}${d.note ? ', ' + d.note : ''}</span>`);
          }
          // String template part
          const count = 4;
          const nameIn = h('input', { id: 'kt-types-name', value: 'Ada', spellcheck: 'false', autocomplete: 'off', maxlength: '14' });
          const decl = h('div', { class: 'kt' });
          const tpl = h('div', { class: 'kt kt-tpl' });
          const o2 = out();
          const parts = [
            { html: hl('println(') + '<span class="t-s">"Hi, </span>' },
            { hole: '$name', val: () => nameIn.value },
            { html: '<span class="t-s">! You have </span>' },
            { hole: '${count + 1}', val: () => String(count + 1) },
            { html: '<span class="t-s"> new messages"</span>)' },
          ];
          let busy = false;
          const paintTpl = () => {
            decl.innerHTML = hl(`val name = ${JSON.stringify(nameIn.value)}\nval count = ${count}`);
            tpl.replaceChildren(...parts.map(p => (p.hole ? h('span', { class: 'kt-hole' }, p.hole) : h('span', { html: p.html }))));
          };
          async function evaluate() {
            if (busy) return; busy = true; paintTpl();
            const spans = [...tpl.children];
            for (let i = 0; i < parts.length; i++) {
              if (!parts[i].hole) continue;
              spans[i].classList.add('on'); await sleep(500);
              if (!tpl.isConnected) return;
              spans[i].textContent = parts[i].val(); spans[i].className = 't-s kt-filled'; replay(spans[i], 'flip');
              await sleep(380);
            }
            say(o2, `Hi, ${nameIn.value.replace(/[<&]/g, '')}! You have ${count + 1} new messages`);
            busy = false;
          }
          nameIn.addEventListener('input', () => { if (!busy) { paintTpl(); say(o2, 'Press Run to fill the template.'); } });
          declare(decls[0], false); declare(decls[2], false);
          say(o, 'Declare a value. Kotlin works out its type.');
          paintTpl(); say(o2, 'Press Run to fill the template.');
          el.append(
            stage,
            h('div', { class: 'controls' }, decls.map(d => cmd(d.src, () => declare(d)))),
            o,
            h('p', { class: 'tip' }, 'String templates: each hole is replaced by its value.'),
            h('label', { class: 'field-input', for: 'kt-types-name' }, 'name =', nameIn),
            decl, tpl,
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: evaluate }, 'Run println')),
            o2);
        },
        predict: {
          "q": "Kotlin works out each type from the value. What type does <code>val c = 9.99</code> get?",
          "options": [
            "Float",
            "Double",
            "Decimal"
          ],
          "a": 1,
          "why": "A decimal literal is a <code>Double</code> unless it ends in <code>f</code>, which makes it a <code>Float</code>."
        },
        play: `fun main() {
    val count = 42
    val big = 3_000_000_000
    val price = 9.99
    val name = "Ada"

    println("count is an \${count::class.simpleName}")
    println("big is a \${big::class.simpleName}")
    println("price is a \${price::class.simpleName}")
    println("$name has \${count + 1} points")

    val total: Long = count.toLong()     // no automatic widening
    println(total + big)
    println("4x".toIntOrNull())          // null instead of a crash
    println(0.1 + 0.2)                   // Doubles are not exact

    val text = "42"                      // change "42" to "4x" and run again
    println(text.toInt() * 2)
}`
      },

      // + control ─────────────────────────────────────
      {
        id: 'control',
        title: 'Control flow and ranges',
        tagline: 'if returns a value, for walks a range.',
        body: `
<p>In Kotlin <code>if</code> is an expression: it hands back a value. <code>val max = if (a > b) a else b</code> replaces the ternary operator other languages have.</p>
<p><code>for</code> walks over anything you can iterate, most often a range. <code>1..5</code> includes both ends. <code>0 until 5</code> (or <code>0..&lt;5</code>) stops before the end, which suits list indexes. <code>5 downTo 1</code> counts down, and <code>step 2</code> skips values.</p>
<p>Use <code>while</code> when you don’t know the count in advance, and <code>repeat(3) { }</code> when you just need something done n times. Pick a range below and walk it.</p>`,
        code: `val max = if (a > b) a else b      // if returns a value

for (i in 1..5) print(i)           // 12345
for (i in 0 until 5) print(i)      // 01234
for (i in 5 downTo 1) print(i)     // 54321
for (i in 0..10 step 3) print(i)   // 0369

for ((index, name) in names.withIndex()) {
    println("$index: $name")
}

var tries = 3
while (tries > 0) { tries-- }
repeat(3) { println("Hi") }`,
        remember: '.. includes the end, until stops before it. downTo counts down, step skips. if gives back a value.',
        level: 'beginner',
        terms: [
          { term: 'Range (..)', def: 'An inclusive sequence of values from a start to an end, like 1..5, which you can loop over or test with in.' },
          { term: 'until', def: 'Builds a range that stops before its end value, so 0 until 3 is 0, 1, 2.' },
          { term: 'downTo', def: 'Builds a range that counts down, like 5 downTo 1, and can be combined with step.' },
          { term: 'if expression', def: 'An if with an else branch that returns a value, so it can be assigned or returned.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print 10, 8, 6, 4, 2, 0.', code: 'for (i in 10 [[downTo]] 0 [[step]] 2) {\n    println(i)\n}', why: '<code>downTo</code> counts down from 10 to 0, and <code>step 2</code> skips every other value.' },
          { type: 'bug', prompt: 'This loop crashes with IndexOutOfBoundsException. Tap the line.', code: 'val items = listOf("a", "b", "c")\nfor (i in 0..items.size) {\n    println(items[i])\n}', bug: 1, fix: 'for (i in items.indices) {   // or 0 until items.size', why: '<code>..</code> includes the end, so the last round reads <code>items[3]</code>. Valid indexes stop at <code>size - 1</code>.' },
        ],
        quiz: [
          { q: 'How many times does <code>for (i in 1..3)</code> run?', options: ['2', '3', '4'], a: 1, why: '<code>1..3</code> includes both ends: 1, 2, 3.' },
          { q: '<code>(1 until 4).toList()</code> is', options: ['<code>[1, 2, 3]</code>', '<code>[1, 2, 3, 4]</code>', '<code>[2, 3]</code>'], a: 0, why: '<code>until</code> stops before the end value.' },
          { q: 'Does <code>val label = if (ok) "yes" else "no"</code> compile?', options: ['Yes, if is an expression', 'No, use a ternary <code>?:</code>'], a: 0, why: 'Kotlin has no ternary operator. <code>if</code> with an <code>else</code> returns a value.' },
          { q: 'What does <code>for (i in 5..1) print(i)</code> print?', options: ['Nothing', '54321', '12345'], a: 0, why: 'A range whose start is above its end is empty, so the loop runs zero times with no error. Use 5 downTo 1 to count down.' },
          { q: 'You search a grid with two nested for loops and want to stop both at the first match. The outer loop is labelled <code>rows@</code>. What do you write?', options: ['<code>break@rows</code>', '<code>break</code>', '<code>continue@rows</code>'], a: 0, why: 'A plain break only leaves the inner loop, so the search carries on with the next row. break@rows leaves the labelled outer loop too.' },
        ],
        deeper: [
          {
            title: 'Leave nested loops with a label',
            body: `<p>A plain <code>break</code> or <code>continue</code> only affects the innermost loop. To stop an outer loop from inside an inner one, give the outer loop a label, like <code>rows@</code>, and write <code>break@rows</code>.</p>
<p>Searching a grid is the classic case. With a plain <code>break</code>, the search leaves the current row and carries on with the next one, so it can find a second match and overwrite the first.</p>`,
            code: `var found: Pair<Int, Int>? = null
rows@ for (r in grid.indices) {
    for (c in grid[r].indices) {
        if (grid[r][c] == target) {
            found = r to c
            break@rows          // leaves both loops
        }
    }
}`,
            visual(el) {
              const grid = [[4, 2, 9, 1, 5], [3, 8, 7, 6, 2], [1, 5, 4, 9, 3], [6, 7, 2, 8, 4]];
              const target = 7;
              let busy = false;
              const cells = grid.map(row => row.map(v => h('span', { class: 'kt-cell' }, String(v))));
              const board = h('div', { class: 'kt-d2-cf-grid', role: 'img', 'aria-label': 'A 4 by 5 grid of numbers' }, cells.flat());
              const o = out();
              const kinds = [
                { src: 'break', label: false },
                { src: 'break@rows', label: true },
              ];
              const code = h('div', { class: 'kt' });
              const buttons = kinds.map(k => cmd(`use ${k.src}`, () => run(k)));
              const paint = k => { code.innerHTML = hl(`rows@ for (r in grid.indices) {\n    for (c in grid[r].indices) {\n        if (grid[r][c] == 7) {\n            found = r to c\n            ${k.src}\n        }\n    }\n}`); };
              async function run(k) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', kinds[i] === k));
                paint(k);
                cells.flat().forEach(c => { c.className = 'kt-cell'; });
                let checked = 0, found = null, hits = 0;
                outer: for (let r = 0; r < grid.length; r++) {
                  for (let c = 0; c < grid[r].length; c++) {
                    const cell = cells[r][c];
                    cell.classList.add('at', 'seen'); checked++;
                    await sleep(170);
                    if (!board.isConnected) return;
                    cell.classList.remove('at');
                    if (grid[r][c] === target) {
                      found = [r, c]; hits++;
                      cell.classList.add('kt-d2-cf-hit'); replay(cell, 'pop');
                      say(o, `found 7 at (${r}, ${c}) <span class="muted">// ${k.label ? 'break@rows leaves both loops' : 'break leaves only the inner loop'}</span>`);
                      await sleep(500);
                      if (!board.isConnected) return;
                      if (k.label) break outer;
                      break;
                    }
                  }
                }
                cells.flat().forEach(c => { if (!c.classList.contains('seen')) c.classList.add('skip'); });
                say(o, `${hl(`found = (${found[0]}, ${found[1]})`)} <span class="muted">// checked ${checked} of 20 cells${hits > 1 ? ', the later match overwrote the first' : ''}</span>`);
                busy = false;
              }
              el.append(code, board, h('div', { class: 'controls' }, buttons), o);
              run(kinds[0]);
            },
          },
          {
            title: 'Ranges are values too',
            body: `<p>A range is an object. Store it in a <code>val</code>, test membership with <code>in</code> and <code>!in</code>, or walk it backwards with <code>reversed()</code>. Char ranges work too: <code>'a'..'z'</code>.</p>
<p>For keeping a number inside bounds, skip the if chain: <code>coerceIn(0, 100)</code> returns the value, or the nearest bound when it is outside.</p>`,
            code: `val workHours = 9..17
if (hour in workHours) showOpen()
if (status !in 200..299) showError(status)

val isLower = ch in 'a'..'z'
for (i in (1..3).reversed()) print(i)   // 321

val volume = requested.coerceIn(0, 100)  // 140 -> 100, -5 -> 0`,
          },
        ],
        underHood: {
          body: `<p>A <code>for</code> loop over a range written in place, like <code>0 until n</code>, <code>1..n</code> or <code>list.indices</code>, compiles to a plain counting loop. No range object is created and nothing is boxed, so it costs the same as a Java <code>for (int i = 0; ...)</code>.</p>
<p>A loop over a <code>List</code> uses its iterator, like Java’s for-each loop. An <code>if</code> used as an expression compiles to the same branch Java’s <code>? :</code> produces.</p>`,
          code: `// Kotlin
for (i in 0 until n) total += i

// Roughly what the JVM sees (decompiled to Java)
for (int i = 0; i < n; i++) {
    total += i;
}`,
        },
        mistakes: [
          { title: 'Counting down with ..', bad: 'for (i in 10..1) println(i)   // prints nothing', good: 'for (i in 10 downTo 1) println(i)', why: 'A range whose start is above its end is empty, so the loop runs zero times without any error. <code>downTo</code> builds a range that counts down.' },
          { title: 'if as a value without else', bad: 'val label = if (count > 0) "$count new"', good: 'val label = if (count > 0) "$count new" else "No news"', why: 'An <code>if</code> used as a value must have an <code>else</code>. Otherwise there would be no value when the condition is false, so it doesn’t compile.' },
          { title: 'Stepping through Doubles', bad: 'for (x in 0.0..1.0 step 0.1) plot(x)', good: 'for (i in 0..10) plot(i / 10.0)', why: 'A Double range can test <code>in</code>, but you can’t loop over it or use <code>step</code>. Loop over Ints and divide, which also avoids adding up rounding errors.' },
        ],
        visual(el) {
          const ranges = [
            { src: '1..5', vals: [1, 2, 3, 4, 5] },
            { src: '0 until 5', vals: [0, 1, 2, 3, 4] },
            { src: '5 downTo 1', vals: [5, 4, 3, 2, 1] },
            { src: '0..10 step 3', vals: [0, 3, 6, 9] },
            { src: '10 downTo 0 step 2', vals: [10, 8, 6, 4, 2, 0] },
          ];
          let cur = ranges[0], busy = false;
          const cells = Array.from({ length: 11 }, (_, i) => h('span', { class: 'kt-cell' }, String(i)));
          const line = h('div', { class: 'kt-line', role: 'img', 'aria-label': 'Number line from 0 to 10' }, cells);
          const loop = h('div', { class: 'kt' });
          const ifLine = h('div', { class: 'kt' });
          const o = out();
          const buttons = ranges.map(r => cmd(r.src, () => { if (busy) return; cur = r; paint(); replay(line, 'pop-soft'); }));
          const ifSrc = 'val kind = if (i % 2 == 0) "even" else "odd"';
          function paint() {
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', ranges[i] === cur));
            loop.innerHTML = hl(`for (i in ${cur.src}) print("$i ")`);
            ifLine.innerHTML = hl(ifSrc);
            cells.forEach((c, i) => { c.className = 'kt-cell' + (cur.vals.includes(i) ? ' in' : ' skip'); });
            say(o, `<span class="muted">${cur.vals.length} values in the range. Press Run loop.</span>`);
          }
          async function walk() {
            if (busy) return; busy = true; paint(); o.replaceChildren();
            for (const v of cur.vals) {
              cells.forEach(c => c.classList.remove('at'));
              cells[v].classList.add('at', 'seen');
              o.append(h('span', { class: 'kt-printed drop-in' }, v + ' '));
              ifLine.innerHTML = hl(ifSrc) + `  <span class="t-c">// i = ${v} → "${v % 2 === 0 ? 'even' : 'odd'}"</span>`;
              await sleep(520);
              if (!line.isConnected) return;
            }
            cells.forEach(c => c.classList.remove('at'));
            o.append(h('span', { class: 'muted' }, ` // ran ${cur.vals.length} times`));
            busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'controls' }, buttons),
            line, loop, ifLine,
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: walk }, 'Run loop')),
            o);
        },
        predict: {
          "q": "How many numbers does <code>for (i in 0..10 step 3)</code> visit?",
          "options": [
            "3: 0, 3, 6",
            "4: 0, 3, 6, 9",
            "4: 0, 3, 6, 9 and then 10"
          ],
          "a": 1,
          "why": "The range starts at 0 and jumps by 3. The next value, 12, would pass the end, so the loop stops after 9."
        },
        play: `fun main() {
    for (i in 1..5) print("$i ")
    println("  <- 1..5")
    for (i in 0 until 5) print("$i ")
    println("  <- 0 until 5")
    for (i in 10 downTo 0 step 3) print("$i ")   // change step 3 to step 4
    println("  <- 10 downTo 0 step 3")

    val n = 7
    val kind = if (n % 2 == 0) "even" else "odd"   // if hands back a value
    println("$n is $kind")

    var tries = 3
    while (tries > 0) {
        println("try $tries")
        tries--
    }
    repeat(2) { println("Hi #$it") }
}`
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'nulls',
        title: 'Null safety',
        tagline: 'Maybe-missing values are part of the type.',
        body: `
<p>In Kotlin a <code>String</code> can never be null. If a value might be missing, you say so in the type with a question mark: <code>String?</code>.</p>
<p>The compiler then makes you deal with the missing case before you use the value. You have four tools: <code>?.</code> calls only when there is a value, <code>?:</code> (the Elvis operator) supplies a fallback, <code>if (x != null)</code> smart-casts, and <code>!!</code> says “trust me” and crashes if you are wrong.</p>
<p>Flip the value to <code>null</code> below and send it through each expression.</p>`,
        code: `val name: String? = null

name.length          // won't compile
name?.length         // null
name?.length ?: 0    // 0
name!!.length        // throws NullPointerException

if (name != null) {
    name.length      // smart cast: name is a String in here
}`,
        remember: 'Type? means maybe null. ?. skips, ?: falls back, !! crashes.',
        level: 'beginner',
        terms: [
          { term: 'Nullable type', def: 'A type ending in ?, like String?, that can also hold null.' },
          { term: 'Safe call (?.)', def: 'Calls a member only when the value is not null, and gives null otherwise.' },
          { term: 'Elvis operator (?:)', def: 'Returns the left side when it is not null, and the right side when it is.' },
          { term: 'Not-null assertion (!!)', def: 'Treats a nullable value as non-null and throws NullPointerException if it is null.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Get the length, or 0 when there is no input.', code: 'val input: String? = readlnOrNull()\nval len = input[[?.]]length [[?:]] 0', why: '<code>?.</code> gives null when <code>input</code> is null, and <code>?:</code> swaps that null for 0.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'fun greet(user: User?) {\n    val name = user?.name ?: "guest"\n    println("Hi, $name")\n    println(user.email)\n}', bug: 3, fix: '    println(user?.email ?: "no email")', why: '<code>user</code> is nullable, so a plain <code>.</code> call is not allowed. Use <code>?.</code> and give a fallback.' },
        ],
        quiz: [
          { q: '<code>val n: String? = null</code>. What is <code>n?.length ?: -1</code>?', options: ['<code>null</code>', '<code>-1</code>', '<code>0</code>', 'It throws'], a: 1, why: '<code>?.</code> produces null, so Elvis supplies -1.' },
          { q: 'When is <code>!!</code> a reasonable choice?', options: ['Whenever the compiler complains about nulls', 'When a null there would be a bug you want to see right away', 'Never, it does not compile'], a: 1, why: '<code>!!</code> turns null into a crash. Use it only where null means a programming mistake.' },
          { q: 'Which type can hold <code>null</code>?', options: ['<code>String</code>', '<code>String?</code>', 'Both'], a: 1, why: 'Only types with <code>?</code> allow null.' },
          { q: 'Does this compile?<pre class="code mini"><code>class Form(var name: String?)\n\nfun show(form: Form) {\n    if (form.name != null) println(form.name.length)\n}</code></pre>', options: ['Yes: the if proves it is not null', 'No: form.name is a var property, so it is not smart-cast. Copy it into a local val', 'Only if show() runs on the main thread'], a: 1, why: 'A mutable property could change between the check and the use, so the compiler won’t smart-cast it. A local val, or form.name?.let { }, fixes it.' },
          { q: 'A user has no address. What is <code>user.address?.city?.name ?: "?"</code>?', options: ['null', '"?"', 'It throws NullPointerException'], a: 1, why: 'The first null ends the safe-call chain, so the whole chain is null, and the Elvis at the end catches it.' },
        ],
        deeper: [
          {
            title: 'Smart casts need a value that can’t change',
            body: `<p>After <code>if (x != null)</code> the compiler treats <code>x</code> as non-null. It only does that when nothing could set <code>x</code> back to null between the check and the use.</p>
<p>A local <code>val</code> is safe. So is a local <code>var</code> nobody touches in between. A <code>var</code> property on a class is not: another thread could change it. Copy it into a local <code>val</code> first, or use <code>?.let</code>.</p>`,
            code: `class Form(var name: String?)

fun show(form: Form) {
    val name = form.name          // read once
    if (name != null) println(name.length)

    form.name?.let { println(it.length) }   // same idea
}`,
            visual(el) {
              const kinds = [
                { label: 'local val', ref: 'name', ok: true, src: 'val name: String? = load()\nif (name != null) {\n    println(name.length)\n}', note: 'A local val can’t change, so the check still holds.' },
                { label: 'local var', ref: 'name', ok: true, src: 'var name: String? = load()\nif (name != null) {\n    println(name.length)\n}', note: 'Nothing assigns this local var between the check and the use, so the cast holds.' },
                { label: 'val property', ref: 'form.name', ok: true, src: 'class Form(val name: String?)\nif (form.name != null) {\n    println(form.name.length)\n}', note: 'A val property without a custom getter, in the same module, can’t change.' },
                { label: 'var property', ref: 'form.name', ok: false, src: 'class Form(var name: String?)\nif (form.name != null) {\n    println(form.name.length)\n}', note: 'Smart cast to \'String\' is impossible, because \'form.name\' is a mutable property that could have been changed by this time' },
                { label: 'copy it first', ref: 'name', ok: true, src: 'val name = form.name   // one read\nif (name != null) {\n    println(name.length)\n}', note: 'The local copy can’t change, so the smart cast works again.' },
              ];
              let busy = false;
              const decl = h('div', { class: 'kt' });
              const track = h('div', { class: 'track' });
              const o = out();
              const buttons = kinds.map(k => cmd(k.label, () => run(k)));
              const station = label => h('div', { class: 'station' }, h('span', { class: 'st-label' }, label));
              async function run(k) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', kinds[i] === k));
                decl.innerHTML = hl(k.src);
                const st = [station(`${k.ref} != null`), station('in between'), station(`${k.ref}.length`)];
                track.replaceChildren(...st);
                say(o, 'Checking...');
                const tok = h('span', { class: 'token drop-in' }, '"Kotlin"');
                st[0].classList.add('on'); st[0].append(tok);
                await sleep(650); if (!track.isConnected) return;
                st[1].classList.add('on');
                if (k.ok) st[1].append(h('span', { class: 'kt-type drop-in' }, 'can’t change'));
                else {
                  st[1].append(h('span', { class: 'kt-type drop-in' }, 'other thread'), h('span', { class: 'token is-null drop-in' }, 'null'));
                  replay(st[1], 'shake');
                }
                await sleep(750); if (!track.isConnected) return;
                st[2].classList.add('on');
                if (k.ok) {
                  st[2].append(h('span', { class: 'token pop' }, '6'));
                  say(o, `<span class="good">compiles:</span> ${k.note}`);
                } else {
                  replay(st[2], 'shake');
                  st[2].append(h('span', { class: 'token boom' }, '?'));
                  say(o, `<span class="bad">compile error:</span> ${k.note}`);
                }
                busy = false;
              }
              el.append(h('div', { class: 'controls' }, buttons), decl, track, o);
              run(kinds[3]);
            },
          },
          {
            title: 'Safe calls short-circuit a whole chain',
            body: `<p>Real data is nested: a user may have no address, and an address may have no city. Chain <code>?.</code> calls and the first null ends the chain. Every call after it is skipped, and the whole expression is null.</p>
<p>Put one <code>?:</code> at the end and it catches a null from any link.</p>`,
            visual(el) {
              const cases = [
                { label: 'all present', vals: ['User', 'Address', '"Oslo"'] },
                { label: 'city = null', vals: ['User', 'Address', null] },
                { label: 'address = null', vals: ['User', null] },
                { label: 'user = null', vals: [null] },
              ];
              const labels = ['user', '?.address', '?.city', '?: "Unknown"'];
              let busy = false;
              const track = h('div', { class: 'track' });
              const o = out();
              const buttons = cases.map(c => cmd(c.label, () => run(c)));
              async function run(c) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', cases[i] === c));
                const st = labels.map(l => h('div', { class: 'station' }, h('span', { class: 'st-label' }, l)));
                track.replaceChildren(...st);
                let v;
                for (let i = 0; i < 3; i++) {
                  if (i < c.vals.length) {
                    v = c.vals[i];
                    st[i].classList.add('on');
                    st[i].append(h('span', { class: 'token pop' + (v == null ? ' is-null' : '') }, v == null ? 'null' : v));
                  } else {
                    st[i].classList.add('kt-skip');
                    st[i].append(h('span', { class: 'kt-type' }, 'skipped'));
                  }
                  await sleep(i < c.vals.length ? 600 : 300); if (!track.isConnected) return;
                }
                const result = v == null ? '"Unknown"' : v;
                st[3].classList.add('on');
                st[3].append(h('span', { class: 'token pop' }, result));
                say(o, v == null
                  ? `<span class="good">result:</span> ${hl('"Unknown"')} <span class="muted">// the chain hit null at ${labels[c.vals.length - 1]}, Elvis caught it</span>`
                  : `<span class="good">result:</span> ${hl('"Oslo"')} <span class="muted">// no null, Elvis not used</span>`);
                busy = false;
              }
              el.append(h('div', { class: 'kt', html: hl('val city = user?.address?.city ?: "Unknown"') }), h('div', { class: 'controls' }, buttons), track, o);
              run(cases[2]);
            },
          },
          {
            title: 'Values from Java carry no promise',
            body: `<p>Java code without nullability annotations returns a <em>platform type</em>, shown as <code>String!</code>. Kotlin lets you treat it as <code>String</code> or <code>String?</code>. Pick wrong and you get a NullPointerException at runtime, not a compile error.</p>
<p>Most Android SDK and AndroidX APIs are annotated now, so you see a real <code>String</code> or <code>String?</code>. For older or third-party Java code, write the nullable type yourself where the value enters Kotlin. The <strong>Java interop</strong> lesson in the Kotlin deep dive track covers the rest of the border.</p>`,
            code: `// Java: public String getNickname() { ... }   no annotation

val a = legacy.nickname            // String! : the compiler trusts you
a.length                           // NPE if Java returned null

val b: String? = legacy.nickname   // now the compiler checks every use
val len = b?.length ?: 0`,
          },
        ],
        underHood: {
          body: `<p>On the JVM, <code>String</code> and <code>String?</code> are the same class, <code>java.lang.String</code>. Nullability lives in Kotlin metadata and in <code>@NotNull</code>/<code>@Nullable</code> annotations. There is no wrapper object like Java’s <code>Optional</code>.</p>
<p><code>?.</code> compiles to a plain null check and a branch. <code>!!</code> compiles to a check that throws <code>NullPointerException</code>. For public functions with non-null parameters, the compiler adds <code>Intrinsics.checkNotNullParameter</code> at the top, so a Java caller that passes null fails at the call, not somewhere deep inside.</p>`,
          code: `// Kotlin
fun greet(name: String) = name.length

// Roughly what the JVM sees (decompiled to Java)
public static final int greet(@NotNull String name) {
    Intrinsics.checkNotNullParameter(name, "name");
    return name.length();
}`,
        },
        mistakes: [
          { title: 'Silencing the compiler with !!', bad: 'val id = intent.getStringExtra("id")!!', good: 'val id = requireNotNull(intent.getStringExtra("id")) {\n    "DetailActivity needs an id extra"\n}', why: 'Both crash when the extra is missing. <code>requireNotNull</code> says why, so the crash report points straight at the cause. If a missing value is normal, use <code>?:</code> with a fallback instead.' },
          { title: 'Using ?.let ?: as if-else', bad: 'user?.let { render(it) } ?: showLogin()', good: 'if (user != null) render(user) else showLogin()', why: 'The Elvis also runs when the <code>let</code> block itself returns null. If <code>render</code> returns a nullable result and gives back null, both branches run.' },
          { title: 'Making everything nullable', bad: 'var title: String? = ""\nvar tags: List<String>? = emptyList()', good: 'var title: String = ""\nvar tags: List<String> = emptyList()', why: 'These always have a value, so <code>?</code> only adds null checks at every use. Use a nullable type only when “missing” is a real state.' },
        ],
        visual(el) {
          let isNull = false, running = false;
          const track = h('div', { class: 'track' });
          const o = out('Pick an expression to watch the value travel.');
          const toggle = cmd('', () => { if (running) return; isNull = !isNull; paint(); }, { 'aria-label': 'Toggle the value of name' });
          const paint = () => { toggle.innerHTML = hl(`val name: String? = ${isNull ? 'null' : '"Kotlin"'}`) + '  <span class="muted">⇄ tap to flip</span>'; track.replaceChildren(); say(o, 'Pick an expression to watch the value travel.'); };
          const len = v => (v == null ? null : v.length);
          const exprs = [
            { src: 'name.length', error: 'Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type \'String?\'.' },
            { src: 'name?.length', steps: [['?.length', len]] },
            { src: 'name?.length ?: 0', steps: [['?.length', len], ['?: 0', v => v ?? 0]] },
            { src: 'name!!.length', steps: [['!!.length', v => { if (v == null) throw new Error('NullPointerException'); return v.length; }]] },
          ];
          async function run(x) {
            if (running) return;
            track.replaceChildren();
            if (x.error) { say(o, `<span class="bad">compile error:</span> ${x.error}`); replay(o, 'shake'); return; }
            running = true;
            let v = isNull ? null : 'Kotlin';
            const labels = ['name', ...x.steps.map(s => s[0])];
            const stations = labels.map(label => h('div', { class: 'station' }, h('span', { class: 'st-label' }, label)));
            track.append(...stations);
            const token = h('span', { class: 'token' });
            for (let i = 0; i < stations.length; i++) {
              if (i > 0) {
                try { v = x.steps[i - 1][1](v); } catch (e) {
                  token.textContent = 'NPE'; token.className = 'token boom';
                  stations[i].append(token); replay(stations[i], 'shake');
                  say(o, `<span class="bad">crash:</span> ${e.message}`);
                  running = false; return;
                }
              }
              token.textContent = show(v);
              token.className = 'token' + (v == null ? ' is-null' : '');
              stations[i].classList.add('on'); stations[i].append(token); replay(token, 'pop');
              await sleep(650);
            }
            say(o, `<span class="good">result:</span> ${hl(x.src)} = ${hl(show(v))}`);
            running = false;
          }
          paint();
          el.append(h('div', { class: 'controls' }, toggle), track, h('div', { class: 'controls' }, exprs.map(x => cmd(x.src, () => run(x)))), o);
        },
        predict: {
          "q": "With <code>name = null</code>, what does <code>name!!.length</code> do?",
          "options": [
            "It gives null",
            "It throws NullPointerException",
            "It does not compile"
          ],
          "a": 1,
          "why": "<code>!!</code> tells the compiler the value is not null. When it is, the program throws at that point."
        },
        play: `fun describe(name: String?): String {
    val length = name?.length ?: 0
    return if (name != null) {
        "$name has $length letters"   // smart cast: name is a String here
    } else {
        "no name, length $length"
    }
}

fun main() {
    println(describe("Kotlin"))
    println(describe(null))

    val maybe: String? = "Ada"   // change "Ada" to null and run again
    println(maybe?.uppercase())
    println(maybe?.length ?: -1)
    println(maybe!!.length)       // !! crashes when maybe is null
}`
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'lambdas',
        title: 'Functions and lambdas',
        tagline: 'Functions are values you can pass around.',
        body: `
<p>A function is declared with <code>fun</code>. When the body is a single expression, write it after <code>=</code> and skip the braces and <code>return</code>.</p>
<p>A lambda is a function without a name, written in braces: <code>{ x -> x * 2 }</code>. You can store it in a variable, pass it to another function, or return it. Its type reads like a tiny arrow diagram: <code>(Int) -> Int</code> takes an Int and gives back an Int.</p>
<p>When a lambda has exactly one parameter, you can drop the name and call it <code>it</code>. When it is the last argument, it moves outside the parentheses: <code>list.map { it * 2 }</code>.</p>`,
        code: `fun double(x: Int): Int = x * 2

val triple: (Int) -> Int = { x -> x * 3 }
val isEven: (Int) -> Boolean = { it % 2 == 0 }

double(4)      // 8
triple(4)      // 12
isEven(4)      // true

listOf(1, 2, 3).map { it * 10 }   // [10, 20, 30]`,
        remember: '{ x -> body } is a function value. One parameter? Call it it. Last argument? Move it outside ( ).',
        level: 'beginner',
        terms: [
          { term: 'Lambda', def: 'A function without a name, written in braces, that you can store or pass as a value.' },
          { term: 'Function type', def: 'A type like (Int) -> String that describes what a function takes and returns.' },
          { term: 'it', def: 'The implicit name of the single parameter of a lambda that doesn’t declare one.' },
          { term: 'Trailing lambda', def: 'A lambda passed as the last argument and written after the parentheses.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete the function type and the implicit parameter name.', code: 'val square: (Int) -> [[Int]] = { x -> x * x }\nval names = users.map { [[it]].name }', why: '<code>square</code> takes an Int and returns an Int. A one-parameter lambda can call its parameter <code>it</code>.' },
          { type: 'bug', prompt: 'This function won’t compile. Tap the wrong line.', code: 'fun doubled(prices: List<Int>): List<Int> {\n    return prices.map { p ->\n        return p * 2\n    }\n}', bug: 2, fix: '        p * 2   // the last expression is the result', why: 'A bare <code>return</code> inside a lambda returns from <code>doubled</code> itself, with an Int instead of a List. The last expression of a lambda is already its result.' },
        ],
        quiz: [
          { q: 'What is the type of <code>{ s: String -> s.length }</code>?', options: ['<code>(String) -> Int</code>', '<code>(Int) -> String</code>', '<code>String</code>'], a: 0, why: 'It takes a String and returns its length, an Int.' },
          { q: '<code>listOf(1, 2, 3).map { it + 1 }</code> returns', options: ['<code>[1, 2, 3]</code>', '<code>[2, 3, 4]</code>', '<code>6</code>'], a: 1, why: '<code>it</code> is each item in turn, so every item gets 1 added.' },
          { q: 'What does this print?<pre class="code mini"><code>fun makeCounter(): () -&gt; Int {\n    var count = 0\n    return { count += 1; count }\n}\nval a = makeCounter()\nval b = makeCounter()\na(); a()\nprintln(b())</code></pre>', options: ['1', '3', '2'], a: 0, why: 'Each makeCounter() call creates a fresh count, and each lambda keeps its own. b has been called once.' },
          { q: 'With <code>fun twice(f: (Int) -&gt; Int): (Int) -&gt; Int = { x -&gt; f(f(x)) }</code>, what is <code>g(5)</code> after <code>val g = twice { it * 2 }</code>?', options: ['20', '10', '25'], a: 0, why: 'twice returns a lambda that applies f two times: 5 * 2 = 10, then 10 * 2 = 20.' },
          { q: 'What happens when the button is tapped?<pre class="code mini"><code>button.setOnClickListener { viewModel::refresh }</code></pre>', options: ['refresh() runs on every tap', 'It does not compile', 'Nothing runs: the lambda only produces a function reference'], a: 2, why: 'The lambda’s last expression is the reference itself, and the Unit-returning listener ignores it. Pass the reference directly, or call viewModel.refresh() inside the lambda.' },
        ],
        deeper: [
          {
            title: 'Lambdas remember where they were made',
            body: `<p>A lambda can use the variables around it, and it keeps them alive after the surrounding function returns. This is called a <em>closure</em>.</p>
<p>Each call to <code>makeCounter()</code> creates a fresh <code>count</code>, so every counter you make has its own. The lambda captures the variable itself, not a snapshot of its value, so it sees and makes changes.</p>`,
            code: `fun makeCounter(): () -> Int {
    var count = 0
    return { count += 1; count }
}

val a = makeCounter()
val b = makeCounter()
a(); a()     // 1, 2
b()          // 1: b has its own count`,
            visual(el) {
              const stage = h('div', { class: 'stage' });
              const o = out();
              const made = {};
              const card = name => {
                const val = h('span', { class: 'field' }, 'count = 0');
                const c = h('div', { class: 'obj drop-in' },
                  h('span', { class: 'obj-name' }, `val ${name}`),
                  h('span', { class: 'kt-type' }, '() -> Int'),
                  h('div', { class: 'kt-capture' }, h('span', { class: 'kt-tag' }, 'captured'), val));
                return { el: c, val, n: 0 };
              };
              const make = name => {
                if (made[name]) { replay(made[name].el, 'shake'); say(o, `<span class="bad">error:</span> Conflicting declarations: val ${name}`); return; }
                made[name] = card(name); stage.append(made[name].el);
                say(o, `${hl(`val ${name} = makeCounter()`)} <span class="muted">// a new count, starting at 0</span>`);
              };
              const call = name => {
                const c = made[name];
                if (!c) { say(o, `<span class="bad">error:</span> Unresolved reference '${name}'. Create it first.`); replay(o, 'shake'); return; }
                c.n += 1; c.val.textContent = `count = ${c.n}`;
                c.val.className = 'field changed'; replay(c.val, 'pop');
                say(o, `${hl(`${name}()`)} <span class="muted">returns</span> ${hl(String(c.n))}`);
              };
              make('a');
              say(o, 'Call a() a few times, then make b and compare.');
              el.append(stage,
                h('div', { class: 'controls' },
                  cmd('a()', () => call('a')),
                  cmd('val b = makeCounter()', () => make('b')),
                  cmd('b()', () => call('b'))),
                o);
            },
          },
          {
            title: 'Pass a function you already have',
            body: `<p>When a lambda only calls one function, pass a <em>function reference</em> instead. <code>::isValid</code> refers to a top-level function, <code>String::length</code> to a member, and <code>viewModel::refresh</code> to a member bound to one object.</p>
<p>A reference has a function type like any lambda, so it fits anywhere <code>(T) -> R</code> is expected.</p>`,
            code: `fun isValid(email: String) = "@" in email

emails.filter { isValid(it) }   // lambda
emails.filter(::isValid)         // same thing, by reference

names.map(String::length)        // member reference
Button(onClick = viewModel::refresh) { Text("Refresh") }`,
          },
          {
            title: 'Functions that build functions',
            body: `<p>A function can take a function and return a new one. <code>twice(f)</code> returns a lambda that applies <code>f</code> two times. The returned lambda captures <code>f</code>, just like the counter captured <code>count</code>.</p>
<p>This is how many library APIs work: you hand over a small piece of behaviour, and they wrap it in more behaviour.</p>`,
            code: `fun twice(f: (Int) -> Int): (Int) -> Int = { x -> f(f(x)) }

val addThree: (Int) -> Int = { it + 3 }
val g = twice(addThree)
g(1)   // addThree(addThree(1)) = 7`,
            visual(el) {
              const fns = [
                { src: '{ it + 3 }', f: x => x + 3 },
                { src: '{ it * 2 }', f: x => x * 2 },
                { src: '{ it * it }', f: x => x * x },
              ];
              let cur = fns[0], x = 1, busy = false;
              const sig = h('div', { class: 'kt' });
              const machine = () => h('div', { class: 'machine' }, h('div', { class: 'gear' }), h('div', { class: 'kt' }));
              const m1 = machine(), m2 = machine();
              const slots = [h('div', { class: 'slot kt-slot' }), h('div', { class: 'slot kt-slot' }), h('div', { class: 'slot kt-slot' })];
              const o = out();
              const buttons = fns.map(fn => cmd(`f = ${fn.src}`, () => { if (busy) return; cur = fn; paint(); }));
              function paint() {
                sig.innerHTML = hl(`val g = twice(${cur.src})`);
                [m1, m2].forEach(m => { m.lastChild.innerHTML = hl('f'); });
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', fns[i] === cur));
                slots[0].replaceChildren(h('span', { class: 'chip' }, String(x)));
                slots[1].replaceChildren(); slots[2].replaceChildren();
                say(o, `Call ${hl(`g(${x})`)} to run f two times.`);
              }
              async function pass(from, m, to, v) {
                const chip = from.firstElementChild;
                if (chip) chip.classList.add('feed');
                m.classList.add('busy');
                await sleep(550);
                m.classList.remove('busy');
                if (!m.isConnected) return false;
                if (chip) chip.remove();
                to.replaceChildren(h('span', { class: 'chip drop-in' }, String(v)));
                await sleep(300);
                return m.isConnected;
              }
              async function call() {
                if (busy) return; busy = true;
                const y = cur.f(x), z = cur.f(y);
                if (!await pass(slots[0], m1, slots[1], y)) return;
                if (!await pass(slots[1], m2, slots[2], z)) return;
                say(o, `${hl(`g(${x})`)} = f(f(${x})) = f(${y}) = ${hl(String(z))}`);
                x = (x % 5) + 1;
                busy = false;
              }
              paint();
              el.append(sig,
                h('div', { class: 'stage kt-twice' }, slots[0], m1, slots[1], m2, slots[2]),
                h('div', { class: 'controls' }, buttons, h('button', { class: 'btn primary small', onclick: call }, 'Call g(x)')),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>On the JVM a function type like <code>(Int) -> Int</code> is the interface <code>Function1&lt;Int, Int&gt;</code> with one method, <code>invoke</code>. Calling <code>f(4)</code> is calling <code>f.invoke(4)</code>. Because generics need objects, the Int is boxed on the way in and out.</p>
<p>Since Kotlin 2.0, lambdas compile through <code>invokedynamic</code> by default, the same mechanism Java lambdas use, instead of one generated class per lambda. A captured <code>var</code> can’t live on the stack, so the compiler moves it into a small box object (<code>Ref.IntRef</code> for an Int) that both the function and the lambda share. That is why the counter keeps counting.</p>
<p>Standard functions such as <code>map</code>, <code>filter</code> and <code>forEach</code> are <code>inline</code>: the lambda body is copied into the call site and no function object exists at all.</p>`,
          code: `// fun makeCounter(): () -> Int { var count = 0; return { count += 1; count } }
// compiles to roughly:
fun makeCounter(): Function0<Int> {
    val count = Ref.IntRef()          // shared box
    count.element = 0
    return object : Function0<Int> {
        override fun invoke(): Int {
            count.element += 1
            return count.element
        }
    }
}`,
        },
        mistakes: [
          { title: 'Returning the function instead of calling it', bad: 'Button(onClick = { viewModel::refresh }) {\n    Text("Refresh")\n}', good: 'Button(onClick = viewModel::refresh) {\n    Text("Refresh")\n}\n// or onClick = { viewModel.refresh() }', why: 'The lambda’s last expression is the reference itself, so the click just produces a function value and nothing runs. Pass the reference directly, or call it inside the lambda.' },
          { title: 'Nested it shadows the outer it', bad: 'users.forEach {\n    it.orders.forEach {\n        log(it.id)   // which it?\n    }\n}', good: 'users.forEach { user ->\n    user.orders.forEach { order ->\n        log("\${user.id}: \${order.id}")\n    }\n}', why: 'The inner <code>it</code> hides the outer one, so you can’t reach the user anymore and it is easy to read the wrong one. Name parameters once lambdas nest.' },
          { title: 'Expecting a snapshot of a captured var', bad: 'var label = "Loading"\nval show = { println(label) }\nlabel = "Done"\nshow()   // expects "Loading"', good: 'val snapshot = label\nval show = { println(snapshot) }\nlabel = "Done"\nshow()   // prints "Loading"', why: 'A lambda captures the variable, not its value at that moment. Copy the value into a <code>val</code> when you need what it was at creation time.' },
        ],
        visual(el) {
          const fns = [
            { src: '{ x -> x * 2 }', type: '(Int) -> Int', f: x => x * 2 },
            { src: '{ x -> x + 10 }', type: '(Int) -> Int', f: x => x + 10 },
            { src: '{ it * it }', type: '(Int) -> Int', f: x => x * x },
            { src: '{ it % 2 == 0 }', type: '(Int) -> Boolean', f: x => x % 2 === 0 },
          ];
          let cur = fns[0], x = 3, busy = false;
          const sig = h('div', { class: 'kt' });
          const body = h('div', { class: 'kt' });
          const machine = h('div', { class: 'machine' }, h('div', { class: 'gear' }), body);
          const inSlot = h('div', { class: 'slot' }), outSlot = h('div', { class: 'slot' });
          const o = out('Pick a lambda, then call it.');
          const buttons = fns.map(fn => cmd(fn.src, () => { if (busy) return; cur = fn; paint(); }));
          function paint() {
            sig.innerHTML = hl(`val f: ${cur.type} = ${cur.src}`);
            body.innerHTML = hl(cur.src);
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', fns[i] === cur));
            inSlot.replaceChildren(h('span', { class: 'chip' }, String(x)));
            outSlot.replaceChildren();
          }
          async function call() {
            if (busy) return; busy = true;
            const chip = inSlot.firstElementChild;
            chip.classList.add('feed'); machine.classList.add('busy');
            await sleep(500); chip.remove(); await sleep(450);
            machine.classList.remove('busy');
            const r = cur.f(x);
            outSlot.replaceChildren(h('span', { class: `chip drop-in${typeof r === 'boolean' ? ' bool' : ''}` }, String(r)));
            say(o, `${hl(`f(${x})`)} <span class="muted">returns</span> ${hl(String(r))}`);
            x = (x % 9) + 1;
            await sleep(300);
            inSlot.replaceChildren(h('span', { class: 'chip drop-in' }, String(x)));
            busy = false;
          }
          paint();
          el.append(sig,
            h('div', { class: 'stage' }, inSlot, h('span', { class: 'arrow' }, '→'), machine, h('span', { class: 'arrow' }, '→'), outSlot),
            h('div', { class: 'controls' }, buttons, h('button', { class: 'btn primary small', onclick: call }, 'Call f(x)')),
            o);
        },
        predict: {
          "q": "<code>val f: (Int) -> Boolean = { it % 2 == 0 }</code>. What comes out of <code>f(3)</code>?",
          "options": [
            "false",
            "1",
            "3"
          ],
          "a": 0,
          "why": "A lambda returns its last expression. <code>3 % 2 == 0</code> is <code>false</code>."
        },
        play: `fun twice(f: (Int) -> Int): (Int) -> Int = { x -> f(f(x)) }

fun makeCounter(): () -> Int {
    var count = 0
    return { count += 1; count }
}

fun main() {
    val double: (Int) -> Int = { it * 2 }
    val isEven: (Int) -> Boolean = { it % 2 == 0 }
    println(double(4))
    println(isEven(7))
    println(twice(double)(5))                 // double(double(5))
    println(listOf(1, 2, 3).map { it * 10 })

    val a = makeCounter()
    a(); a()
    println("a: \${a()}")   // the lambda keeps its own count
    val b = makeCounter()
    println("b: \${b()}")   // a new counter starts again. Call b() twice more first and run again
}`
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'collections',
        title: 'Collection operations',
        tagline: 'filter, map, take, sum: an assembly line for lists.',
        body: `
<p>Kotlin lists come with operations that take a lambda and return a <em>new</em> list. The original stays as it was.</p>
<p><code>filter</code> keeps the items where the lambda returns true. <code>map</code> turns each item into something else. <code>take(n)</code> keeps the first n. Terminal operations like <code>sum()</code> or <code>first()</code> collapse the list into a single value.</p>
<p>Read a chain top to bottom, one step at a time. Build one below and watch each step happen.</p>`,
        code: `val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8)

val result = numbers
    .filter { it % 2 == 0 }   // [2, 4, 6, 8]
    .map { it * it }          // [4, 16, 36, 64]
    .take(3)                  // [4, 16, 36]
    .sum()                    // 56`,
        remember: 'filter keeps, map transforms, take trims, sum collapses. Each step returns a new list.',
        level: 'beginner',
        terms: [
          { term: 'filter', def: 'Returns a new list with only the items for which the lambda returns true.' },
          { term: 'map', def: 'Returns a new list with the lambda applied to every item.' },
          { term: 'Terminal operation', def: 'An operation like sum(), first() or count() that turns a collection into a single value.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add up the amounts of paid orders only.', code: 'val total = orders\n    .[[filter]] { it.paid }\n    .[[map]] { it.amount }\n    .sum()', why: '<code>filter</code> drops unpaid orders, <code>map</code> turns each order into its amount, and <code>sum()</code> adds them.' },
          { type: 'bug', prompt: '<code>people</code> can be empty. One line crashes then.', code: 'fun summary(people: List<Person>): String {\n    val adults = people.filter { it.age >= 18 }\n    val youngest = adults.minBy { it.age }\n    return "${adults.size} adults, youngest ${youngest?.name}"\n}', bug: 2, fix: '    val youngest = adults.minByOrNull { it.age }', why: '<code>minBy</code> throws <code>NoSuchElementException</code> on an empty list. <code>minByOrNull</code> returns null instead.' },
        ],
        quiz: [
          { q: '<code>listOf(1, 2, 3, 4).filter { it > 2 }</code>', options: ['<code>[1, 2]</code>', '<code>[3, 4]</code>', '<code>[true, true]</code>'], a: 1, why: '<code>filter</code> keeps the items where the lambda is true.' },
          { q: 'After <code>val b = a.map { it * 2 }</code>, what is in <code>a</code>?', options: ['The doubled values', 'The original values', 'Nothing'], a: 1, why: 'Collection operations return a new list and leave the original alone.' },
          { q: '<code>listOf(1, 2, 3).map { it * 2 }.sum()</code>', options: ['<code>6</code>', '<code>12</code>', '<code>[2, 4, 6]</code>'], a: 1, why: '2 + 4 + 6 = 12.' },
          { q: 'What is <code>listOf("ab", "ac", "b").associateBy { it.first() }</code>?', options: ['<code>{a=ab, b=b}</code>', '<code>{a=ac, b=b}</code>', '<code>{a=[ab, ac], b=[b]}</code>'], a: 1, why: 'associateBy keeps one value per key, and the last one wins, so "ab" is gone. groupBy would keep both in a list.' },
          { q: 'You must remove every read message from a <code>MutableList&lt;Message&gt;</code>. Which is right?', options: ['<code>for (m in messages) if (m.read) messages.remove(m)</code>', '<code>messages.removeAll { it.read }</code>', '<code>messages.filter { !it.read }</code> and ignore the result'], a: 1, why: 'Removing inside a for loop over the same list throws ConcurrentModificationException, and filter returns a new list without changing the original. removeAll does it in one safe pass.' },
        ],
        deeper: [
          {
            title: 'Read-only is not the same as immutable',
            body: `<p><code>List</code> has no <code>add</code> or <code>remove</code>. That stops <em>you</em> from changing the list through that name. It doesn’t stop someone holding a <code>MutableList</code> to the same object.</p>
<p>The common pattern is a private <code>MutableList</code> exposed as a <code>List</code>. Readers can’t edit it, but they do see every change. When you need a frozen copy, call <code>toList()</code>.</p>`,
            code: `class Basket {
    private val _items = mutableListOf("Tea")
    val items: List<String> get() = _items   // read-only view

    fun add(item: String) { _items.add(item) }
}

val snapshot = basket.items.toList()          // a separate copy`,
            visual(el) {
              const fruit = ['Kiwi', 'Fig', 'Lime', 'Plum', 'Date'];
              let next = 0, snap = null;
              const listChips = h('div', { class: 'kt-pile' });
              const listObj = h('div', { class: 'obj kt-shared' }, h('span', { class: 'obj-name' }, 'ArrayList @4f1a'), listChips);
              const refA = h('div', { class: 'kt-ref' }, h('span', { class: 'kt-tag open' }, 'MutableList'), h('code', {}, '_items'));
              const refB = h('div', { class: 'kt-ref' }, h('span', { class: 'kt-tag' }, 'List'), h('code', {}, 'items'));
              const snapZone = h('div', { class: 'kt-pile' });
              const o = out();
              const chip = (t, anim) => h('span', { class: 'chip kt-sm' + (anim ? ' drop-in' : '') }, t);
              listChips.append(chip('Tea'));
              el.append(
                h('div', { class: 'stage kt-refs kt-col' }, h('div', { class: 'kt-pile' }, refA, refB), h('span', { class: 'kt-up' }, 'both point at ↓'), listObj),
                h('div', { class: 'controls' },
                  cmd('_items.add(...)', () => {
                    const f = fruit[next++ % fruit.length];
                    listChips.append(chip(f, true));
                    if (listChips.children.length > 6) listChips.firstElementChild.remove();
                    replay(refA, 'pop'); replay(refB, 'pop');
                    say(o, `${hl(`_items.add("${f}")`)} <span class="muted">// items sees it too: same object</span>`);
                  }),
                  cmd('items.add("Fig")', () => {
                    replay(refB, 'shake');
                    say(o, '<span class="bad">compile error:</span> Unresolved reference \'add\'. List has no add().');
                  }),
                  cmd('val snapshot = items.toList()', () => {
                    snap = [...listChips.children].map(c => c.textContent);
                    snapZone.replaceChildren(h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, 'snapshot: ArrayList @7c2e'), h('div', { class: 'kt-pile' }, snap.map(t => chip(t)))));
                    say(o, `${hl('items.toList()')} <span class="muted">// new list. Later adds won’t reach it.</span>`);
                  })),
                o, snapZone);
              say(o, 'Two names point at one list. Add through _items and watch items.');
            },
          },
          {
            title: 'Group, split, index and fold',
            body: `<p>Beyond <code>filter</code> and <code>map</code>, a few operations reshape a list into something else. <code>groupBy</code> builds a <code>Map&lt;K, List&lt;T&gt;&gt;</code>. <code>partition</code> splits into a pair of lists. <code>associateBy</code> builds a <code>Map&lt;K, T&gt;</code> with one value per key. <code>fold</code> walks the list carrying a running result.</p>
<p>Watch <code>associateBy</code> closely: when two items share a key, the last one wins and the earlier one is gone.</p>`,
            visual(el) {
              const words = ['apple', 'avocado', 'banana', 'blueberry', 'cherry', 'kiwi'];
              let busy = false;
              const stage = h('div', { class: 'stage kt-buckets' });
              const o = out();
              const chip = (t, extra = '') => h('span', { class: 'chip kt-sm ' + extra }, t);
              const bucket = key => {
                const pile = h('div', { class: 'kt-pile' });
                const b = h('div', { class: 'kt-bucket drop-in' }, h('span', { class: 'kt-bucket-key' }, key), pile);
                stage.append(b);
                return pile;
              };
              const reset = () => { stage.replaceChildren(h('div', { class: 'kt-pile' }, words.map(w => chip(w)))); };
              async function into(keyOf) {
                const piles = new Map();
                stage.replaceChildren();
                for (const w of words) {
                  const k = keyOf(w);
                  if (!piles.has(k)) piles.set(k, bucket(k));
                  piles.get(k).append(chip(w, 'drop-in'));
                  await sleep(260); if (!stage.isConnected) return false;
                }
                return true;
              }
              const ops = [
                { src: 'groupBy { it.first() }', run: async () => {
                  if (!await into(w => `'${w[0]}'`)) return;
                  say(o, hl('{a=[apple, avocado], b=[banana, blueberry], c=[cherry], k=[kiwi]}'));
                } },
                { src: 'partition { it.length > 5 }', run: async () => {
                  if (!await into(w => (w.length > 5 ? 'first (true)' : 'second (false)'))) return;
                  say(o, hl('([avocado, banana, blueberry, cherry], [apple, kiwi])'));
                } },
                { src: 'associateBy { it.length }', run: async () => {
                  const piles = new Map();
                  stage.replaceChildren();
                  for (const w of words) {
                    const k = w.length;
                    if (!piles.has(k)) piles.set(k, bucket(String(k)));
                    const p = piles.get(k);
                    if (p.firstElementChild) {
                      p.firstElementChild.classList.add('leave');
                      say(o, `key ${k}: ${hl(`"${w}"`)} replaces ${hl(`"${p.firstElementChild.textContent}"`)}`);
                      await sleep(450); if (!stage.isConnected) return;
                      p.replaceChildren();
                    }
                    p.append(chip(w, 'drop-in'));
                    await sleep(260); if (!stage.isConnected) return;
                  }
                  say(o, `${hl('{5=apple, 7=avocado, 6=cherry, 9=blueberry, 4=kiwi}')} <span class="muted">// banana was overwritten</span>`);
                } },
                { src: 'fold(0) { acc, w -> acc + w.length }', run: async () => {
                  reset();
                  const chips = [...stage.firstElementChild.children];
                  const acc = h('span', { class: 'chip total drop-in' }, '0');
                  stage.append(h('div', { class: 'kt-bucket' }, h('span', { class: 'kt-bucket-key' }, 'acc'), acc));
                  let sum = 0;
                  for (let i = 0; i < words.length; i++) {
                    chips[i].classList.add('leave');
                    sum += words[i].length;
                    say(o, `acc = ${sum - words[i].length} + ${words[i].length} <span class="muted">// "${words[i]}"</span>`);
                    await sleep(420); if (!stage.isConnected) return;
                    acc.textContent = String(sum); replay(acc, 'pop');
                  }
                  say(o, `<span class="good">result:</span> ${hl(String(sum))} <span class="muted">// total letters</span>`);
                } },
              ];
              reset();
              say(o, hl('val fruit = listOf("apple", "avocado", "banana", "blueberry", "cherry", "kiwi")'));
              el.append(stage,
                h('div', { class: 'controls' }, ops.map(op => cmd(op.src, async () => {
                  if (busy) return; busy = true; await op.run(); busy = false;
                }))),
                o);
            },
          },
          {
            title: 'Long chains on big lists',
            body: `<p>Every step in a chain builds a whole new list. For a few hundred items that costs nothing. For large data, or when you only need the first match, call <code>asSequence()</code> so each item flows through the whole chain one at a time. The Kotlin deep dive track covers sequences in detail.</p>`,
            code: `val firstBig = orders
    .asSequence()
    .filter { it.paid }
    .map { it.total }
    .first { it > 100 }   // stops at the first match`,
          },
        ],
        underHood: {
          body: `<p><code>map</code> and <code>filter</code> are ordinary extension functions on <code>Iterable</code>, marked <code>inline</code>. The compiler pastes your lambda into a plain loop that fills a new <code>ArrayList</code>, so no function object is created per call.</p>
<p><code>List</code> and <code>MutableList</code> both become <code>java.util.List</code> on the JVM. Read-only is a compile-time view. A cast like <code>items as MutableList</code> compiles, which is one more reason to hand out copies when it matters.</p>`,
          code: `// From the standard library
public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R> {
    return mapTo(ArrayList<R>(collectionSizeOrDefault(10)), transform)
}

public inline fun <T, R, C : MutableCollection<in R>>
        Iterable<T>.mapTo(destination: C, transform: (T) -> R): C {
    for (item in this) destination.add(transform(item))
    return destination
}`,
        },
        mistakes: [
          { title: 'Building a list just to count it', bad: 'val paid = orders.filter { it.paid }.size\nval first = orders.filter { it.paid }.first()', good: 'val paid = orders.count { it.paid }\nval first = orders.first { it.paid }', why: '<code>count</code>, <code>first</code>, <code>any</code> and <code>none</code> take a predicate directly. They skip the temporary list, and <code>first</code> stops at the first match.' },
          { title: 'Removing while looping', bad: 'for (item in cart) {\n    if (item.qty == 0) cart.remove(item)\n}', good: 'cart.removeAll { it.qty == 0 }', why: 'Changing a list while a <code>for</code> loop walks it throws <code>ConcurrentModificationException</code>. <code>removeAll</code> with a predicate does it in one safe pass.' },
          { title: 'Ignoring the result of sorted()', bad: 'names.sorted()\nshowNames(names)   // still unsorted', good: 'val sortedNames = names.sorted()\nshowNames(sortedNames)', why: '<code>sorted()</code> returns a new list like every other operation here. Only <code>sort()</code> on a <code>MutableList</code> changes it in place.' },
        ],
        visual(el) {
          let items, lines, busy = false;
          const row = h('div', { class: 'stage' });
          const chain = h('pre', { class: 'code mini' });
          const o = out();
          const paint = () => {
            chain.innerHTML = hl(lines.join('\n'));
            o.innerHTML = hl(Array.isArray(items) ? `[${items.map(c => c.v).join(', ')}]` : String(items));
          };
          const reset = () => {
            items = [1, 2, 3, 4, 5, 6, 7, 8].map(v => ({ v, el: h('span', { class: 'chip' }, String(v)) }));
            row.replaceChildren(...items.map(c => c.el));
            lines = ['listOf(1, 2, 3, 4, 5, 6, 7, 8)'];
            paint();
          };
          const drop = async keep => {
            const gone = items.filter(c => !keep(c));
            gone.forEach(c => c.el.classList.add('leave'));
            await sleep(450);
            gone.forEach(c => c.el.remove());
            items = items.filter(keep);
          };
          const ops = [
            { src: '.filter { it % 2 == 0 }', run: () => drop(c => c.v % 2 === 0) },
            { src: '.filter { it > 3 }', run: () => drop(c => c.v > 3) },
            { src: '.map { it * it }', run: async () => {
              items.forEach((c, i) => setTimeout(() => {
                replay(c.el, 'flip');
                setTimeout(() => { c.el.textContent = String(c.v); }, 200);
              }, i * 90));
              items.forEach(c => { c.v = c.v * c.v; });
              await sleep(items.length * 90 + 450);
            } },
            { src: '.take(3)', run: () => { const keep = new Set(items.slice(0, 3)); return drop(c => keep.has(c)); } },
            { src: '.sum()', run: async () => {
              items.forEach(c => c.el.classList.add('leave'));
              await sleep(450);
              items = items.reduce((s, c) => s + c.v, 0);
              row.replaceChildren(h('span', { class: 'chip total drop-in' }, String(items)));
            } },
          ];
          reset();
          el.append(row,
            h('div', { class: 'controls' }, ops.map(op => cmd(op.src, async () => {
              if (busy) return;
              if (!Array.isArray(items)) { say(o, '<span class="bad">error:</span> sum() returned an Int. Press Reset to start a new chain.'); return; }
              busy = true; await op.run(); lines.push('    ' + op.src); paint(); busy = false;
            }))),
            chain, o);
        },
        predict: {
          "q": "Start from <code>listOf(1, 2, 3, 4, 5, 6, 7, 8)</code>, then <code>.filter { it % 2 == 0 }</code>, then <code>.map { it * it }</code>. What is the list now?",
          "options": [
            "[4, 16, 36, 64]",
            "[1, 4, 9, 16, 25, 36, 49, 64]",
            "[2, 4, 6, 8]"
          ],
          "a": 0,
          "why": "filter keeps 2, 4, 6 and 8, then map squares each of them. Each step builds a new list."
        },
        play: `fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8)

    val evens = numbers.filter { it % 2 == 0 }
    println("filter: $evens")
    val squares = evens.map { it * it }
    println("map:    $squares")
    val firstThree = squares.take(3)      // change take(3) to take(1)
    println("take:   $firstThree")
    println("sum:    \${firstThree.sum()}")

    println("numbers is still $numbers")  // nothing changed the original

    val words = listOf("ab", "ac", "b")
    println(words.groupBy { it.first() })
    println(words.associateBy { it.first() })   // a later key wins
}`
      },

      // + maps-sets ───────────────────────────────────
      {
        id: 'maps-sets',
        title: 'Maps and Sets',
        tagline: 'Unique items, and values you look up by key.',
        body: `
<p>A <code>List</code> keeps every item in order, duplicates included. A <code>Set</code> keeps each item once: adding one that is already there changes nothing. A <code>Map</code> stores pairs of key and value, like a dictionary, with each key at most once.</p>
<p>Build them with <code>setOf(…)</code> and <code>mapOf("fr" to "French")</code>. The word <code>to</code> makes a <code>Pair</code>. Like lists, the plain versions are read-only, and <code>mutableSetOf</code> and <code>mutableMapOf</code> give you ones you can change.</p>
<p><code>map[key]</code> returns a nullable value, because the key may not be there. The default implementations remember insertion order, so iterating gives items back in the order you added them.</p>`,
        code: `val basket = mutableListOf<String>()
val kinds = mutableSetOf<String>()
val counts = mutableMapOf<String, Int>()

fun add(fruit: String) {
    basket.add(fruit)                          // keeps duplicates
    kinds.add(fruit)                           // false if already there
    counts[fruit] = (counts[fruit] ?: 0) + 1   // key -> value
}

add("apple"); add("pear"); add("apple")
// basket = [apple, pear, apple]
// kinds  = [apple, pear]
// counts = {apple=2, pear=1}`,
        remember: 'List for order and duplicates, Set for uniqueness, Map for lookup by key. map[key] can be null.',
        level: 'beginner',
        terms: [
          { term: 'Set', def: 'A collection of unique items. Adding an item that is already there leaves the set unchanged.' },
          { term: 'Map', def: 'A collection of key-value pairs. Keys are unique; different keys may share a value.' },
          { term: 'to', def: 'An infix function that builds a <code>Pair</code>, used to write map entries: <code>"fr" to "French"</code>.' },
          { term: 'LinkedHashMap', def: 'The default <code>MutableMap</code>. It keeps entries in insertion order. <code>HashMap</code> makes no promise about order.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a read-only map from language code to name.', code: 'val langs = [[mapOf]](\n    "fr" [[to]] "French",\n    "en" to "English",\n)', why: '<code>mapOf</code> takes pairs, and <code>a to b</code> builds a pair.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'val langs = mapOf("fr" to "French", "en" to "English")\nval code = "de"\nval name: String = langs[code]\nprintln(name)', bug: 2, fix: 'val name: String = langs[code] ?: "Unknown"', why: '<code>langs[code]</code> is a <code>String?</code>, because the key may be missing. Give a fallback with <code>?:</code>.' },
        ],
        quiz: [
          { q: '<code>setOf(1, 2, 2, 3).size</code>', options: ['<code>3</code>', '<code>4</code>', 'It doesn’t compile'], a: 0, why: 'A set keeps each item once, so the second 2 is dropped.' },
          { q: '<code>mapOf("a" to 1)["b"]</code>', options: ['<code>0</code>', '<code>null</code>', 'It throws'], a: 1, why: 'Indexing a map with a missing key returns null.' },
          { q: 'You check <code>if (id in seen)</code> thousands of times. Which type should <code>seen</code> be?', options: ['<code>List</code>', '<code>Set</code>', 'It makes no difference'], a: 1, why: '<code>in</code> on a list checks items one by one. A hash set finds the item by its hash, in about the same time whatever its size.' },
          { q: 'What does <code>mapOf("fr" to "French").getValue("de")</code> do?', options: ['Throws NoSuchElementException', 'Returns null', 'Returns an empty String'], a: 0, why: 'getValue is for keys that must be there, so a missing key fails with a message that names it. Use map[key] ?: fallback when missing is normal.' },
          { q: 'What is <code>setOf(1, 2, 3) subtract setOf(2, 3, 4)</code>?', options: ['<code>[4]</code>', '<code>[1, 4]</code>', '<code>[1]</code>'], a: 2, why: 'subtract keeps what is in the left set but not in the right one, so order matters. [1, 4] would be both differences together.' },
          { q: 'This line is slow with 10,000 orders and 10,000 users. What is the best fix?<pre class="code mini"><code>orders.map { o -&gt; users.first { it.id == o.userId } }</code></pre>', options: ['Build <code>val byId = users.associateBy { it.id }</code> once, then read <code>byId[o.userId]</code>', 'Sort users by id first', 'Call <code>users.asSequence()</code> inside the lambda'], a: 0, why: 'first scans the whole user list for every order. A map built once turns each lookup into a hash lookup.' },
        ],
        deeper: [
          {
            title: 'Reading a key that may be missing',
            body: `<p>There are several ways to read from a map, and they differ only in what happens when the key is not there. <code>map[key]</code> returns null. <code>getValue(key)</code> throws. <code>getOrDefault(key, x)</code> returns <code>x</code>, and <code>getOrElse(key) { … }</code> runs a lambda for the fallback.</p>
<p>Most of the time, <code>map[key] ?: fallback</code> reads best. Use <code>getValue</code> only when a missing key means a bug.</p>`,
            code: `val langs = mapOf("fr" to "French", "en" to "English")

langs["de"]                      // null
langs["de"] ?: "Unknown"         // "Unknown"
langs.getOrDefault("de", "?")    // "?"
langs.getValue("de")             // throws NoSuchElementException`,
            visual(el) {
              const map = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'langs'),
                h('span', { class: 'field' }, '"fr" → "French"'), h('span', { class: 'field' }, '"en" → "English"'));
              const result = h('div', { class: 'slot kt-ms-slot' });
              const o = out();
              const READS = [
                ['langs["fr"]', '"French"', 'the key is there'],
                ['langs["de"]', 'null', 'missing key, no crash, but the type is String?'],
                ['langs["de"] ?: "Unknown"', '"Unknown"', 'the usual fallback'],
                ['langs.getOrDefault("de", "?")', '"?"', 'fallback passed as a value'],
                ['langs.getValue("de")', null, 'NoSuchElementException'],
              ];
              el.append(
                h('div', { class: 'stage' }, map, result),
                h('div', { class: 'controls' }, READS.map(([src, v, note]) => cmd(src, () => {
                  if (v == null) {
                    replay(map, 'shake'); swap(result, 'throws');
                    say(o, `${hl(src)} <span class="bad">throws</span> <span class="muted">${note}</span>`);
                    return;
                  }
                  swap(result, v);
                  say(o, `${hl(src)} = ${hl(v)} <span class="muted">// ${note}</span>`);
                }))),
                o);
              say(o, 'Read a key that exists, then one that doesn’t.');
            },
          },
          {
            title: 'Set math: union, intersect, subtract',
            body: `<p>Sets come with the operations you know from school maths. <code>a union b</code> has everything from both. <code>a intersect b</code> keeps what is in both. <code>a subtract b</code> keeps what is in <code>a</code> but not in <code>b</code>, so order matters there.</p>
<p>They also work on lists, but the result is always a <code>Set</code>, so duplicates disappear.</p>`,
            code: `val following = setOf("alice", "bob", "sam")
val followers = setOf("bob", "sam", "maya")

following intersect followers   // [bob, sam]     mutual
followers subtract following    // [maya]         follow back?
following union followers       // [alice, bob, sam, maya]`,
            visual(el) {
              const A = ['alice', 'bob', 'sam'], B = ['bob', 'sam', 'maya'];
              const pile = (xs, cls) => h('div', { class: 'kt-pile' }, xs.map(x => h('span', { class: 'chip kt-sm ' + (cls || '') }, x)));
              const res = h('div', { class: 'kt-pile kt-ms-res' });
              const o = out();
              const OPS = [
                ['following union followers', [...new Set([...A, ...B])], 'everything from both'],
                ['following intersect followers', A.filter(x => B.includes(x)), 'in both: mutual follows'],
                ['following subtract followers', A.filter(x => !B.includes(x)), 'you follow them, they don’t follow back'],
                ['followers subtract following', B.filter(x => !A.includes(x)), 'they follow you, you don’t follow back'],
              ];
              el.append(
                h('div', { class: 'kt-li-pair' },
                  h('div', { class: 'kt-zone' }, h('span', { class: 'kt-zone-title' }, 'following'), pile(A)),
                  h('div', { class: 'kt-zone' }, h('span', { class: 'kt-zone-title' }, 'followers'), pile(B))),
                h('div', { class: 'kt-zone' }, h('span', { class: 'kt-zone-title' }, 'result'), res),
                h('div', { class: 'controls' }, OPS.map(([src, xs, note]) => cmd(src, () => {
                  res.replaceChildren(...(xs.length ? xs.map(x => h('span', { class: 'chip kt-sm drop-in' }, x)) : [h('span', { class: 'muted' }, 'empty set')]));
                  say(o, `${hl(src)} = [${xs.join(', ')}] <span class="muted">// ${note}</span>`);
                }))),
                o);
              say(o, 'Combine the two sets.');
            },
          },
          {
            title: 'Pick the collection by the question you ask',
            body: `<p>Ask what the code does most. “Show these in order” is a <code>List</code>. “Have I seen this one?” is a <code>Set</code>. “Find the item with this id” is a <code>Map</code>.</p>
<p>The difference shows up in loops. <code>x in list</code> checks the items one by one, so a lookup inside a loop gets slow as the list grows. Turn the list into a set or a map once, with <code>toSet()</code> or <code>associateBy { it.id }</code>, and each lookup becomes a hash lookup.</p>`,
            code: `// slow: scans users for every order
orders.map { o -> users.first { it.id == o.userId } }

// fast: build the index once
val byId = users.associateBy { it.id }
orders.map { o -> byId[o.userId] }`,
          },
          {
            title: 'getOrPut: fill a map on demand',
            body: `<p>A mutable map makes a simple cache. <code>getOrPut(key) { … }</code> returns the stored value if there is one. If not, it runs the lambda, stores the result under the key, and returns it.</p>`,
            code: `private val avatars = mutableMapOf<String, Bitmap>()

fun avatar(userId: String): Bitmap =
    avatars.getOrPut(userId) { decodeAvatar(userId) }`,
          },
        ],
        underHood: {
          body: `<p><code>mutableSetOf()</code> creates a <code>LinkedHashSet</code> and <code>mutableMapOf()</code> a <code>LinkedHashMap</code>. Both are hash tables with an extra linked list that remembers insertion order. To find a key, the table calls <code>hashCode()</code> to pick a bucket, then <code>equals()</code> to find the match inside it.</p>
<p>That is why keys need sensible <code>equals</code> and <code>hashCode</code>, which data classes give you, and why a key must not change after you store it. <code>hashSetOf()</code> and <code>hashMapOf()</code> skip the linked list: a bit less memory, no order promise.</p>`,
          code: `val m = mutableMapOf("b" to 2, "a" to 1)
println(m)            // {b=2, a=1}  insertion order
println(m.javaClass)  // class java.util.LinkedHashMap`,
        },
        mistakes: [
          { title: 'Forcing a map read with !!', bad: 'val name = langs[code]!!', good: 'val name = langs[code] ?: "Unknown"\n// or, if a missing key is a bug:\nval name = langs.getValue(code)', why: '<code>!!</code> throws a bare <code>NullPointerException</code>. A fallback handles the case. <code>getValue</code> fails with a message that names the missing key.' },
          { title: 'A list used for membership checks', bad: 'val blocked = loadBlocked()        // List<String>\nmessages.filter { it.from !in blocked }', good: 'val blocked = loadBlocked().toSet()\nmessages.filter { it.from !in blocked }', why: 'Every <code>in</code> on a list walks it. With many messages and a long list that is a lot of work. Convert once to a set.' },
          { title: 'Expecting order from hashSetOf', bad: 'val tags = hashSetOf("kotlin", "android", "compose")\ntags.first()   // which one?', good: 'val tags = setOf("kotlin", "android", "compose")\ntags.first()   // "kotlin"', why: '<code>HashSet</code> makes no promise about order. <code>setOf</code> and <code>mutableSetOf</code> keep insertion order. Use <code>sortedSetOf</code> when you want sorted order.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'val basket = mutableListOf<String>()\nval kinds = mutableSetOf<String>()\nval counts = mutableMapOf<String, Int>()\nfor (fruit in listOf("apple", "pear", "apple")) {\n    basket.add(fruit)\n    kinds.add(fruit)\n    counts[fruit] = (counts[fruit] ?: 0) + 1\n}\nprintln(counts["banana"])',
            predict: {
              q: 'Third time round the loop, <code>"apple"</code> is added again. What does the Set <code>kinds</code> hold afterwards?',
              options: ['[apple, pear]', '[pear, apple]: the apple moves to the end', '[apple, pear, apple]'],
              a: 0,
              why: 'A Set keeps each item once. The second <code>add("apple")</code> returns false and changes nothing, so the first apple keeps its place.',
            },
            frames: [
              { say: 'The same three fruits go into a List, a Set and a Map. Watch how each one stores them.' },
              { line: [1, 2, 3], vars: { basket: '[]', kinds: '[]', counts: '{}' }, say: 'Three empty mutable collections.' },
              { line: 4, vars: { fruit: '"apple"' }, say: 'First pass: <code>fruit</code> is <code>"apple"</code>.' },
              { line: [5, 6, 7], vars: { basket: '[apple]', kinds: '[apple]', counts: '{apple=1}' }, say: 'All three take it. <code>counts["apple"]</code> was null, so <code>?: 0</code> starts the count at 0, plus 1.' },
              { line: [4, 5, 6, 7], vars: { fruit: '"pear"', basket: '[apple, pear]', kinds: '[apple, pear]', counts: '{apple=1, pear=1}' }, say: 'Second pass, <code>"pear"</code>: new everywhere.' },
              { line: 4, vars: { fruit: '"apple"' }, say: 'Third pass: <code>"apple"</code> again.' },
              { line: 5, vars: { basket: '[apple, pear, apple]' }, say: 'A List keeps every item, duplicates included, in order.' },
              { line: 6, say: 'The Set already has it. <code>add</code> returns <code>false</code> and <code>kinds</code> stays <code>[apple, pear]</code>.' },
              { line: 7, vars: { counts: '{apple=2, pear=1}' }, say: 'A Map key is also unique. The same key gets a new value, 2.' },
              { line: 9, vars: { fruit: null }, out: 'null', say: '<code>map[key]</code> is nullable: there is no <code>"banana"</code> key, so you get <code>null</code>, not a crash.' },
            ],
          });
        },
        play: `fun main() {
    val basket = mutableListOf<String>()
    val kinds = mutableSetOf<String>()
    val counts = mutableMapOf<String, Int>()

    for (fruit in listOf("apple", "pear", "apple")) {   // add "pear" again and run
        basket.add(fruit)
        val isNew = kinds.add(fruit)
        counts[fruit] = (counts[fruit] ?: 0) + 1
        println("add($fruit): set.add returned $isNew")
    }

    println("List: $basket")
    println("Set:  $kinds")
    println("Map:  $counts")
    println(counts["banana"])      // null: no such key
    println("apple" in kinds)
}`,
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'when',
        title: 'when expressions',
        tagline: 'Top to bottom, first match wins.',
        body: `
<p><code>when</code> checks its branches from top to bottom and runs the <em>first</em> one that matches. It is an expression, so it hands back a value you can store or return.</p>
<p>A branch can match an exact value, a range with <code>in 1..9</code>, or a type with <code>is</code>. After an <code>is String</code> match, Kotlin smart-casts, so you can use <code>x.length</code> right away. <code>else</code> catches whatever is left.</p>
<p>Pick a value and watch the scan. Notice that <code>0</code> never reaches <code>is Int</code>.</p>`,
        code: `fun describe(x: Any): String = when (x) {
    0         -> "zero"
    is Int    -> if (x > 0) "positive" else "negative"
    is String -> "text, \${x.length} chars"
    is Double -> "a Double"
    else      -> "something else"
}`,
        remember: 'when runs the first matching branch, top to bottom, and returns its value.',
        level: 'beginner',
        terms: [
          { term: 'when', def: 'An expression that checks its branches from top to bottom and returns the value of the first one that matches.' },
          { term: 'Smart cast', def: 'After a type or null check, the compiler treats the value as the checked type without an explicit cast.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Match the range and catch everything else.', code: 'val label = when (code) {\n    200 -> "OK"\n    [[in]] 500..599 -> "Server error"\n    [[else]] -> "Other"\n}', why: '<code>in</code> matches a range. <code>else</code> covers every value the other branches miss.' },
          { type: 'bug', prompt: 'A score of 95 returns "pass". Tap the line that can never match.', code: 'fun grade(score: Int): String = when {\n    score >= 50 -> "pass"\n    score >= 90 -> "excellent"\n    else -> "fail"\n}', bug: 2, fix: '    // move this above score >= 50: put the narrow check first', why: 'The first match wins. Every score of 90 or more already matched <code>score >= 50</code>, so the narrower branch has to come first.' },
        ],
        quiz: [
          { q: 'With the code above, what does <code>describe(0)</code> return?', options: ['<code>"zero"</code>', '<code>"negative"</code>', 'Both branches run'], a: 0, why: 'The <code>0</code> branch comes first and only the first match runs.' },
          { q: 'Inside <code>is String -> ...</code>, why can you write <code>x.length</code>?', options: ['x is smart-cast to String in that branch', 'Any has a length property', 'You can’t, it needs a cast'], a: 0, why: 'After an <code>is</code> check, Kotlin treats the value as that type inside the branch.' },
          { q: 'With <code>shipping(weightKg = 25.0, express = true, member = true)</code> from the no-subject when above, what is returned?', options: ['25.0', '12.0', '0.0'], a: 0, why: 'Branches are tried top to bottom and the first true condition wins. weightKg > 20 comes first, so the later true conditions never count.' },
        ],
        deeper: [
          {
            title: 'when with no subject',
            body: `<p>Leave out the parentheses and every branch becomes its own Boolean condition. That makes <code>when</code> a tidy replacement for an <code>if / else if</code> chain, and the conditions can test different values.</p>
<p>The rules stay the same: top to bottom, the first true condition wins, and <code>else</code> takes the rest. Flip the inputs below and see which branch wins when several are true.</p>`,
            code: `fun shipping(weightKg: Double, express: Boolean, member: Boolean) = when {
    weightKg > 20 -> 25.0
    express       -> 12.0
    member        -> 0.0
    else          -> 4.5
}`,
            visual(el) {
              const s = { heavy: false, express: true, member: true };
              const branches = [
                { line: 'weightKg > 20 -> 25.0', test: () => s.heavy, res: '25.0' },
                { line: 'express       -> 12.0', test: () => s.express, res: '12.0' },
                { line: 'member        -> 0.0', test: () => s.member, res: '0.0' },
                { line: 'else          -> 4.5', test: () => true, res: '4.5' },
              ];
              let busy = false;
              const rows = branches.map(b => h('div', { class: 'branch', html: '    ' + hl(b.line) }));
              const call = h('div', { class: 'kt' });
              const o = out();
              const box = (key, text) => {
                const input = h('input', { type: 'checkbox', id: `kt-d2-wh-${key}` });
                input.checked = s[key];
                input.addEventListener('change', () => { if (busy) { input.checked = s[key]; return; } s[key] = input.checked; paint(); });
                return h('label', { class: 'switch', for: `kt-d2-wh-${key}` }, input, text);
              };
              const args = () => `shipping(\n    weightKg = ${s.heavy ? '24.0' : '2.0'},\n    express = ${s.express},\n    member = ${s.member},\n)`;
              function paint() {
                call.innerHTML = hl(args());
                rows.forEach(r => { r.className = 'branch'; });
                say(o, 'Press Run to scan the branches.');
              }
              async function run() {
                if (busy) return; busy = true;
                rows.forEach(r => { r.className = 'branch'; });
                for (let i = 0; i < branches.length; i++) {
                  rows[i].classList.add('scan'); await sleep(380);
                  if (!call.isConnected) return;
                  rows[i].classList.remove('scan');
                  if (branches[i].test()) {
                    rows[i].classList.add('hit');
                    rows.slice(i + 1).forEach(r => r.classList.add('skip'));
                    const later = branches.slice(i + 1, 3).filter(b => b.test()).length;
                    say(o, `= ${hl(branches[i].res)}${later ? ' <span class="muted">// later true conditions never get checked</span>' : ''}`);
                    break;
                  }
                  rows[i].classList.add('miss');
                }
                busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'controls' }, box('heavy', 'weightKg = 24.0'), box('express', 'express'), box('member', 'member')),
                call,
                h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('when {') }), rows, h('div', { class: 'branch head' }, '}')),
                h('div', { class: 'controls' }, cmd('Run shipping(...)', run)),
                o);
            },
          },
          {
            title: 'Name the subject, add a guard',
            body: `<p><code>when (val result = repo.load())</code> calls <code>load()</code> once and names the result. The name only exists inside the <code>when</code>, so it can’t leak into the rest of the function.</p>
<p>Since Kotlin 2.2 a branch can add a guard after its check: <code>is LoadResult.Ok if result.items.isEmpty() -></code>. The branch matches only when the type check and the guard both hold. Before guards you had to nest an <code>if</code> inside the branch. The compiler can’t know whether a guard holds, so you still need an unguarded branch for that type, or an <code>else</code>.</p>`,
            code: `when (val result = repo.load()) {
    is LoadResult.Ok if result.items.isEmpty() -> showEmpty()
    is LoadResult.Ok    -> showList(result.items)
    is LoadResult.Error -> showError(result.message)
}`,
            visual(el) {
              const values = [
                { label: 'Ok(emptyList())', ok: true, empty: true },
                { label: 'Ok(listOf("a", "b"))', ok: true, empty: false },
                { label: 'Error("Timeout")', ok: false },
              ];
              const branches = [
                { line: 'is LoadResult.Ok if result.items.isEmpty() -> showEmpty()', test: v => v.ok && v.empty, why: v => (v.ok ? 'type matches, but the guard is false' : 'not an Ok') },
                { line: 'is LoadResult.Ok    -> showList(result.items)', test: v => v.ok, why: () => 'not an Ok' },
                { line: 'is LoadResult.Error -> showError(result.message)', test: v => !v.ok, why: () => 'not an Error' },
              ];
              let busy = false;
              const head = h('div', { class: 'branch head' });
              const rows = branches.map(b => h('div', { class: 'branch', html: '    ' + hl(b.line) }));
              const o = out();
              const buttons = values.map(v => cmd(`load() returns ${v.label}`, () => run(v)));
              async function run(v) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', values[i] === v));
                head.innerHTML = hl(`when (val result = LoadResult.${v.label}) {`);
                rows.forEach(r => { r.className = 'branch'; });
                for (let i = 0; i < branches.length; i++) {
                  rows[i].classList.add('scan'); await sleep(420);
                  if (!head.isConnected) return;
                  rows[i].classList.remove('scan');
                  if (branches[i].test(v)) {
                    rows[i].classList.add('hit');
                    rows.slice(i + 1).forEach(r => r.classList.add('skip'));
                    say(o, `${hl(branches[i].line.split('-> ')[1])} <span class="muted">// branch ${i + 1} won</span>`);
                    break;
                  }
                  rows[i].classList.add('miss');
                  say(o, `<span class="muted">branch ${i + 1}: ${branches[i].why(v)}</span>`);
                  await sleep(300);
                  if (!head.isConnected) return;
                }
                busy = false;
              }
              head.innerHTML = hl('when (val result = repo.load()) {');
              el.append(h('div', { class: 'controls' }, buttons),
                h('div', { class: 'when' }, head, rows, h('div', { class: 'branch head' }, '}')),
                o);
              run(values[0]);
            },
          },
        ],
        underHood: {
          body: `<p>The compiler picks the cheapest bytecode it can. A <code>when</code> on Int constants can become a JVM <code>tableswitch</code> or <code>lookupswitch</code>: a jump straight to the right branch instead of a chain of comparisons. On String constants it can switch on <code>hashCode()</code> first and confirm with <code>equals</code>. On an enum it switches on the entry’s position through a small generated mapping class.</p>
<p>Branches with <code>is</code>, <code>in</code> ranges or free conditions become ordinary <code>instanceof</code> checks and comparisons, tried in order. That is why the order you write is the order they run.</p>`,
          code: `// Kotlin
fun label(code: Int) = when (code) {
    200 -> "OK"
    404 -> "Not found"
    else -> "Other"
}

// Roughly what the JVM sees (decompiled to Java)
switch (code) {
    case 200: return "OK";
    case 404: return "Not found";
    default:  return "Other";
}`,
        },
        mistakes: [
          { title: 'Conditions under a subject', bad: 'val feel = when (temp) {\n    temp < 0  -> "freezing"\n    temp < 20 -> "mild"\n    else      -> "hot"\n}', good: 'val feel = when {\n    temp < 0  -> "freezing"\n    temp < 20 -> "mild"\n    else      -> "hot"\n}', why: 'With a subject, each branch value is compared to <code>temp</code>, so <code>temp < 0</code> would mean “is temp equal to false”. That doesn’t compile. Drop the subject when branches are conditions.' },
          { title: 'A range without in', bad: 'when (age) {\n    0..12  -> "child"\n    13..17 -> "teen"\n    else   -> "adult"\n}', good: 'when (age) {\n    in 0..12  -> "child"\n    in 13..17 -> "teen"\n    else      -> "adult"\n}', why: 'Without <code>in</code>, the branch asks whether the Int equals a range object, which can never be true, and the compiler rejects it. <code>in</code> asks whether the value is inside the range.' },
        ],
        visual(el) {
          const values = [
            { label: '0', type: 'Int', v: 0 }, { label: '42', type: 'Int', v: 42 }, { label: '-7', type: 'Int', v: -7 },
            { label: '"Kotlin"', type: 'String', v: 'Kotlin' }, { label: '3.14', type: 'Double', v: 3.14 }, { label: 'true', type: 'Boolean', v: true },
          ];
          const branches = [
            { line: '0         -> "zero"', test: x => x.type === 'Int' && x.v === 0, res: () => '"zero"' },
            { line: 'is Int    -> if (x > 0) "positive" else "negative"', test: x => x.type === 'Int', res: x => (x.v > 0 ? '"positive"' : '"negative"') },
            { line: 'is String -> "text, ${x.length} chars"', test: x => x.type === 'String', res: x => `"text, ${x.v.length} chars"` },
            { line: 'is Double -> "a Double"', test: x => x.type === 'Double', res: () => '"a Double"' },
            { line: 'else      -> "something else"', test: () => true, res: () => '"something else"' },
          ];
          let busy = false;
          const head = h('div', { class: 'branch head' });
          const rows = branches.map(b => h('div', { class: 'branch', html: '    ' + hl(b.line) }));
          const o = out('Pick a value for x.');
          async function check(x) {
            if (busy) return; busy = true;
            rows.forEach(r => { r.className = 'branch'; });
            head.innerHTML = hl(`when (${x.label}) {`);
            for (let i = 0; i < branches.length; i++) {
              rows[i].classList.add('scan'); await sleep(420); rows[i].classList.remove('scan');
              if (branches[i].test(x)) {
                rows[i].classList.add('hit');
                rows.slice(i + 1).forEach(r => r.classList.add('skip'));
                say(o, `${hl(`describe(${x.label})`)} <span class="muted">=</span> ${hl(branches[i].res(x))}`);
                break;
              }
              rows[i].classList.add('miss');
            }
            busy = false;
          }
          head.innerHTML = hl('when (x) {');
          el.append(
            h('div', { class: 'controls' }, values.map(x => cmd(`x = ${x.label}`, () => check(x)))),
            h('div', { class: 'when' }, head, rows, h('div', { class: 'branch head' }, '}')),
            o);
        },
        predict: {
          "q": "Which branch does <code>describe(-7)</code> stop at?",
          "options": [
            "<code>0 -> \"zero\"</code>",
            "<code>is Int</code>, giving \"negative\"",
            "<code>else</code>"
          ],
          "a": 1,
          "why": "Branches are checked top to bottom. -7 is not 0, but it is an Int, so the second branch wins and the rest are skipped."
        },
        play: `fun describe(x: Any): String = when (x) {
    0 -> "zero"
    is Int -> if (x > 0) "positive" else "negative"
    is String -> "text, \${x.length} chars"   // smart cast to String
    in listOf(true, false) -> "a Boolean"
    else -> "something else"
}

fun main() {
    val values = listOf<Any>(0, 42, -7, "Kotlin", true, 3.14)
    for (x in values) {
        println("$x -> \${describe(x)}")
    }
    // move the \`is Int\` line above \`0 -> "zero"\` and run again: what does 0 give?
}`
      },

      // + classes ───────────────────────────────────
      {
        id: 'classes',
        title: 'Classes and constructors',
        tagline: 'Primary constructor, init blocks, default arguments.',
        body: `
<p>The parentheses after a class name are its <em>primary constructor</em>. Write <code>val</code> or <code>var</code> in front of a parameter and it becomes a property you can read later. Without it, the parameter only exists while the object is being built. There is no <code>new</code> keyword: <code>User("Ada", 36)</code> creates an object.</p>
<p>When an object is created, property initializers and <code>init</code> blocks run from top to bottom, in the order you wrote them. Use <code>init</code> for setup that needs the constructor values.</p>
<p>Give a parameter a default value and callers can skip it. Named arguments like <code>User(name = "Cy")</code> make calls readable. A secondary <code>constructor</code> must call the primary one through <code>this(...)</code>, and in Kotlin default arguments usually replace it.</p>`,
        code: `class User(val name: String, val age: Int = 18) {
    val isAdult = age >= 18

    init {
        println("Created $name, age $age")
    }

    constructor(name: String, born: Int, year: Int) :
        this(name, year - born) {
        println("from birth year")
    }

    fun greet() = "Hi, I'm $name"
}

val a = User("Ada", 36)
val b = User("Bo")                   // age = 18
val c = User(age = 20, name = "Cy")  // named arguments
val d = User("Dee", 1990, 2026)      // secondary: age = 36`,
        remember: 'val in the constructor makes a property. init runs at creation. Defaults beat extra constructors.',
        level: 'beginner',
        terms: [
          { term: 'Primary constructor', def: 'The parameter list in a class header; parameters marked val or var become properties.' },
          { term: 'init block', def: 'A block in a class body that runs when an object is created, in order with the property initializers.' },
          { term: 'Secondary constructor', def: 'An extra constructor declared with constructor that must delegate to the primary one with this(...).' },
          { term: 'Default argument', def: 'A value given to a parameter in its declaration, used when the caller leaves that argument out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let callers skip the seconds, and log every new timer.', code: 'class Timer(val seconds: Int [[=]] 60) {\n    [[init]] {\n        println("Timer for $seconds s")\n    }\n}\nval t = Timer()', why: '<code>= 60</code> is a default argument, so <code>Timer()</code> compiles. The <code>init</code> block runs each time a Timer is created.' },
          { type: 'bug', prompt: '<code>describe()</code> won’t compile. Tap the line to fix.', code: 'class Account(owner: String) {\n    var balance = 0\n    fun describe() = "$owner has $balance"\n}', bug: 0, fix: 'class Account(val owner: String) {', why: 'Without <code>val</code>, <code>owner</code> is only a constructor parameter. Member functions can’t see it. <code>val</code> makes it a property.' },
        ],
        quiz: [
          { q: '<code>class P(name: String)</code>. Does <code>P("Ada").name</code> compile?', options: ['Yes', 'No, name is not a property'], a: 1, why: 'Only parameters marked <code>val</code> or <code>var</code> become properties.' },
          { q: 'With the code above, what is <code>User("Bo").age</code>?', options: ['<code>0</code>', '<code>18</code>', 'It doesn’t compile'], a: 1, why: 'The caller skipped <code>age</code>, so its default of 18 is used.' },
          { q: 'When does an <code>init</code> block run?', options: ['Each time an object is created', 'Once, when the class is loaded', 'Only if you call it'], a: 0, why: '<code>init</code> is part of construction, so it runs for every new object.' },
          { q: 'With the User class above, what does <code>User("Dee", 1990, 2026)</code> print, in order?', options: ['“from birth year”, then “Created Dee, age 36”', 'Only “from birth year”', '“Created Dee, age 36”, then “from birth year”'], a: 2, why: 'A secondary constructor first delegates to the primary one through this(...), which runs the initializers and init blocks. Its own body runs after that.' },
        ],
        deeper: [
          {
            title: 'The parent is built first',
            body: `<p>When a class extends another, the parent’s constructor runs completely before the child sets any of its own properties. That includes the child’s <code>val</code> constructor parameters.</p>
<p>So if the parent’s <code>init</code> calls an <code>open</code> function, the child’s override runs on a half-built object. A non-null <code>String</code> can read as <code>null</code> there. The IDE warns about calling non-final functions in a constructor. Take the warning seriously.</p>`,
            visual(el) {
              const src = [
                'open class Base {',
                '    init { println("Base: " + describe()) }',
                '    open fun describe() = "base"',
                '}',
                'class Child(val name: String) : Base() {',
                '    init { println("Child init") }',
                '    override fun describe() = "child $name"',
                '}',
              ];
              const rows = src.map(s => h('div', { class: 'branch', html: hl(s) }));
              const nameField = h('span', { class: 'field kt-unset' }, 'name = (not created)');
              const obj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'Child'), nameField);
              const con = h('div', { class: 'out', 'aria-live': 'polite' });
              const o = out();
              let busy = false, built = false;
              async function at(i, note) {
                rows.forEach(r => r.classList.remove('kt-on'));
                if (i >= 0) rows[i].classList.add('kt-on');
                say(o, note);
                await sleep(900);
                return rows[0].isConnected;
              }
              const log = t => con.append(h('div', { class: 'line drop-in' }, t));
              async function create() {
                if (busy) return; busy = true;
                con.replaceChildren(); built = false;
                nameField.textContent = 'name = null'; nameField.className = 'field kt-unset';
                if (!await at(4, `${hl('Child("Ada")')}: first stop is ${hl('Base()')}`)) return;
                if (!await at(1, 'Base init runs. Child hasn’t stored name yet.')) return;
                if (!await at(6, 'describe() is open, so Child’s override runs on the half-built object')) return;
                replay(nameField, 'shake');
                log('Base: child null');
                if (!await at(6, `<span class="bad">name is null</span> here, even though its type is String`)) return;
                nameField.textContent = 'name = "Ada"'; nameField.className = 'field changed'; replay(nameField, 'pop');
                if (!await at(4, 'Back in Child: now name = "Ada" is stored')) return;
                if (!await at(5, 'Child init runs')) return;
                log('Child init');
                rows.forEach(r => r.classList.remove('kt-on'));
                say(o, '<span class="good">done:</span> the object is complete. Try describe() now.');
                built = true; busy = false;
              }
              async function describe() {
                if (busy) return;
                if (!built) { say(o, '<span class="bad">error:</span> create the Child first.'); replay(o, 'shake'); return; }
                busy = true;
                if (!await at(6, `${hl('child.describe()')} after construction`)) return;
                log('child Ada');
                rows.forEach(r => r.classList.remove('kt-on'));
                say(o, `<span class="good">returns</span> ${hl('"child Ada"')} <span class="muted">// name is set by now</span>`);
                busy = false;
              }
              say(o, 'Create a Child and watch who runs first.');
              el.append(
                h('div', { class: 'when' }, rows),
                h('div', { class: 'controls' }, cmd('val child = Child("Ada")', create), cmd('child.describe()', describe)),
                o, h('div', { class: 'stage' }, obj), con);
            },
          },
          {
            title: 'Stored once or computed on every read',
            body: `<p><code>val isAdult = age >= 18</code> runs once, when the object is built, and stores the answer. If <code>age</code> is a <code>var</code> that changes later, the stored answer goes stale.</p>
<p>A custom getter, <code>val isAdult get() = age >= 18</code>, has no stored value. It runs its expression on every read, so it always matches the current <code>age</code>.</p>`,
            code: `class Person(var age: Int) {
    val isAdultStored = age >= 18              // computed once
    val isAdult: Boolean get() = age >= 18     // computed on every read
}`,
            visual(el) {
              let age = 17, stored = false;
              const fAge = h('span', { class: 'field' });
              const fStored = h('span', { class: 'field' });
              const fGet = h('span', { class: 'field' });
              const o = out();
              const obj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'val p = Person(17)'), fAge, fStored, fGet);
              function paint(changed) {
                const now = age >= 18;
                fAge.textContent = `age = ${age}`;
                fStored.textContent = `isAdultStored = ${stored}`;
                fStored.className = 'field' + (stored !== now ? ' kt-stale' : '');
                fGet.textContent = `isAdult = ${now}`;
                fGet.className = 'field' + (changed ? ' changed' : '');
                if (changed) { replay(fAge, 'pop'); replay(fGet, 'flip'); }
              }
              const setAge = n => {
                age = n; paint(true);
                const now = age >= 18;
                say(o, stored !== now
                  ? `${hl(`p.age = ${age}`)} <span class="bad">isAdultStored is stale:</span> it still says ${stored}`
                  : `${hl(`p.age = ${age}`)} <span class="muted">// both agree, for now</span>`);
              };
              paint(false);
              say(o, 'Have a birthday. Only the getter keeps up.');
              el.append(h('div', { class: 'stage' }, obj),
                h('div', { class: 'controls' },
                  cmd('p.age += 1', () => setAge(Math.min(age + 1, 99))),
                  cmd('p.age -= 1', () => setAge(Math.max(age - 1, 0))),
                  cmd('val p = Person(17)', () => { age = 17; stored = false; paint(false); replay(obj, 'drop-in'); say(o, 'New object: both computed from age 17.'); })),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Each property becomes a private JVM field plus a getter (and a setter for <code>var</code>), so Java sees <code>getName()</code>. A property with only a custom getter that never uses <code>field</code> gets no field at all.</p>
<p>The constructor body the compiler writes is: call the superclass constructor, store the <code>val</code>/<code>var</code> parameters, then run property initializers and <code>init</code> blocks in source order. Default arguments become one extra synthetic constructor that takes a bit mask of which arguments were left out. Java can’t use that one, which is what <code>@JvmOverloads</code> is for.</p>`,
          code: `// class User(val name: String, val age: Int = 18)
// roughly what Java sees:
public final class User {
    private final String name;
    private final int age;
    public User(String name, int age) { super(); this.name = name; this.age = age; }
    public User(String name, int age, int mask, DefaultConstructorMarker m) {
        this(name, (mask & 2) != 0 ? 18 : age);   // bit 2: age was left out
    }
    public final String getName() { return name; }
    public final int getAge() { return age; }
}`,
        },
        mistakes: [
          { title: 'Assigning constructor parameters by hand', bad: 'class User(name: String, age: Int) {\n    val name: String\n    val age: Int\n    init {\n        this.name = name\n        this.age = age\n    }\n}', good: 'class User(val name: String, val age: Int)', why: '<code>val</code> in the header declares and assigns the property in one go. The long form is a habit carried over from Java.' },
          { title: 'Overloading instead of defaults', bad: 'class Toast(val text: String, val ms: Int) {\n    constructor(text: String) : this(text, 2000)\n}', good: 'class Toast(val text: String, val ms: Int = 2000)', why: 'A default argument covers the same calls with less code, and named arguments keep calls clear. Add <code>@JvmOverloads</code> only if Java code needs the overloads.' },
          { title: 'Accepting invalid state', bad: 'class Percent(val value: Int)\n\nval p = Percent(140)   // fine?', good: 'class Percent(val value: Int) {\n    init {\n        require(value in 0..100) { "value must be 0..100, was $value" }\n    }\n}', why: 'Check rules in <code>init</code> with <code>require</code>. A bad value fails right where the object is created, with a clear message, instead of causing odd bugs later.' },
        ],
        visual(el) {
          const src = [
            'class User(val name: String, val age: Int = 18) {',
            '    val isAdult = age >= 18',
            '    init { println("Created $name, age $age") }',
            '    constructor(name: String, born: Int, year: Int) :',
            '        this(name, year - born) { println("from birth year") }',
            '}',
          ];
          const rows = src.map(s => h('div', { class: 'branch', html: hl(s) }));
          const stage = h('div', { class: 'stage' });
          const con = h('div', { class: 'out', 'aria-live': 'polite' });
          const o = out();
          const objs = [];
          let busy = false;
          const calls = [
            { src: 'User("Ada", 36)', name: 'Ada', age: 36, bind: 'name = "Ada", age = 36' },
            { src: 'User("Bo")', name: 'Bo', age: 18, bind: 'name = "Bo", age not passed: default 18' },
            { src: 'User(age = 20, name = "Cy")', name: 'Cy', age: 20, bind: 'named arguments: order doesn’t matter' },
            { src: 'User("Dee", 1990, 2026)', name: 'Dee', age: 36, secondary: true },
          ];
          const card = (u, anim) => h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, `User`),
            h('span', { class: 'field' }, `name = "${u.name}"`),
            h('span', { class: 'field' }, `age = ${u.age}`),
            h('span', { class: 'field changed' }, `isAdult = ${u.age >= 18}`));
          const addObj = (u, anim) => { const c = card(u, anim); stage.append(c); objs.push(c); if (objs.length > 3) objs.shift().remove(); };
          const log = text => con.append(h('div', { class: 'line drop-in' }, text));
          async function step(i, note) {
            rows.forEach(r => r.classList.remove('kt-on'));
            rows[i].classList.add('kt-on');
            say(o, note);
            await sleep(700);
            return rows[0].isConnected;
          }
          async function create(c) {
            if (busy) return; busy = true;
            con.replaceChildren();
            if (c.secondary) {
              if (!await step(3, '3 arguments: the secondary constructor matches')) return;
              if (!await step(4, `it delegates first: ${hl('this("Dee", 2026 - 1990)')}`)) return;
            }
            if (!await step(0, `primary constructor: ${c.secondary ? 'name = "Dee", age = 36' : c.bind}`)) return;
            if (!await step(1, `property initializer: isAdult = ${c.age >= 18}`)) return;
            if (!await step(2, 'init block runs')) return;
            log(`Created ${c.name}, age ${c.age}`);
            if (c.secondary) { if (!await step(4, 'then the secondary constructor’s own body')) return; log('from birth year'); }
            rows.forEach(r => r.classList.remove('kt-on'));
            addObj(c, true);
            say(o, `<span class="good">ok:</span> ${hl(`val u = ${c.src}`)}`);
            busy = false;
          }
          addObj(calls[0], false); log('Created Ada, age 36');
          say(o, 'Create a User and watch the order things run in.');
          el.append(
            h('div', { class: 'when' }, rows),
            h('div', { class: 'controls' }, calls.map(c => cmd(c.src, () => create(c)))),
            o, stage, con);
        },
        predict: {
          "q": "When <code>User(\"Ada\", 36)</code> is built, which runs first: the <code>isAdult</code> initializer or the <code>init</code> block?",
          "options": [
            "isAdult, because it is written above init",
            "init, because init blocks always run first",
            "They run at the same time"
          ],
          "a": 0,
          "why": "Property initializers and init blocks run top to bottom, in the order they appear in the class."
        },
        play: `class User(val name: String, val age: Int = 18) {
    val isAdult = age >= 18

    init {
        println("init: $name, age $age, adult $isAdult")
    }

    constructor(name: String, born: Int, year: Int) : this(name, year - born) {
        println("secondary constructor body")
    }
}

fun main() {
    val a = User("Ada", 36)
    val b = User("Bo")                     // change to User("Bo", age = 12)
    val c = User(age = 20, name = "Cy")
    val d = User("Dee", 1990, 2026)
    println("\${b.name} is \${b.age}")
    println(listOf(a, b, c, d).map { it.name })
}`
      },

      // + properties ──────────────────────────────────
      {
        id: 'properties',
        title: 'Properties, setters and visibility',
        tagline: 'Control who can read a property, who can change it, and what gets stored.',
        body: `
<p>A Kotlin property is not just a field. It is a getter, a setter for a <code>var</code>, and usually a stored value behind them. You can write your own <code>get()</code> or <code>set(value)</code>. Inside them, <code>field</code> means the stored value.</p>
<p>A custom setter lets you clamp or check what callers assign. <code>private set</code> keeps the getter public but lets only the class change the value. Callers can read the score; only <code>hit()</code> can raise it.</p>
<p>Visibility modifiers decide who sees a name at all: <code>public</code> (the default), <code>private</code>, <code>protected</code> and <code>internal</code>. Start as private as you can and open up only what other code really needs.</p>`,
        code: `class Player {
    var health = 100
        set(value) { field = value.coerceIn(0, 100) }

    var score = 0
        private set              // readable everywhere, writable only here

    internal var debugName = "p1"   // visible in this module only

    fun hit(points: Int) { score += points }
}

player.health = 140   // stored as 100
player.score = 999    // doesn't compile: the setter is private`,
        remember: 'Use field inside accessors, private set for read-only from outside, and the narrowest visibility that works.',
        level: 'beginner',
        terms: [
          { term: 'Backing field', def: 'The stored value behind a property. Inside <code>get()</code> or <code>set()</code> you reach it with <code>field</code>.' },
          { term: 'private set', def: 'Keeps the property readable with its normal visibility while only the declaring class can assign it.' },
          { term: 'internal', def: 'Visible anywhere in the same module, such as one Gradle module, and hidden from other modules.' },
          { term: 'protected', def: 'Visible in the class and its subclasses. Not allowed on top-level declarations.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Everyone may read <code>count</code>, but only the class may change it.', code: 'class Cart {\n    var count = 0\n        [[private]] set\n\n    fun add() { count += 1 }\n}', why: 'A modifier before <code>set</code> changes only the setter’s visibility. The getter stays public.' },
          { type: 'bug', prompt: 'Setting <code>volume</code> crashes with StackOverflowError. Tap the line.', code: 'class Speaker {\n    var volume = 5\n        set(value) {\n            volume = value.coerceIn(0, 10)\n        }\n}', bug: 3, fix: '            field = value.coerceIn(0, 10)', why: 'Assigning <code>volume</code> inside its own setter calls the setter again, forever. Write to <code>field</code> instead.' },
        ],
        quiz: [
          { q: 'What is the visibility of a declaration with no modifier?', options: ['<code>private</code>', '<code>internal</code>', '<code>public</code>'], a: 2, why: 'Kotlin uses <code>public</code> when you write no modifier.' },
          { q: '<code>var score = 0; private set</code>. What can code outside the class do?', options: ['Read and write it', 'Read it only', 'Nothing'], a: 1, why: 'The getter keeps the property’s visibility. Only the setter is private.' },
          { q: 'In an app with <code>:app</code> and <code>:core</code> modules, who sees an <code>internal</code> class in <code>:core</code>?', options: ['Only code in :core', 'Code in :app and :core', 'Only the same file'], a: 0, why: '<code>internal</code> means the same module. <code>:app</code> is a different module.' },
          { q: 'What happens when code assigns <code>user.name = " Ada "</code>?<pre class="code mini"><code>var name = ""\n    set(value) { name = value.trim() }</code></pre>', options: ['name becomes "Ada"', 'It does not compile', 'StackOverflowError: the setter calls itself'], a: 2, why: 'Inside its own setter, name = … calls the setter again, forever. Write field = value.trim() to store the value directly.' },
        ],
        deeper: [
          {
            title: 'The four visibility modifiers',
            body: `<p>For a member of a class: <code>private</code> is visible inside the class only. <code>protected</code> adds subclasses, wherever they live. <code>internal</code> is visible to all code in the same module. <code>public</code> is visible everywhere.</p>
<p>A module is a set of Kotlin files compiled together, such as one Gradle module. The <code>test</code> source set can also see <code>internal</code> declarations of <code>main</code>. At the top level of a file, <code>private</code> means “this file only”, and <code>protected</code> is not allowed.</p>`,
            code: `// :core module
open class Repo {
    private val cache = mutableMapOf<String, User>()  // this class only
    protected fun log(msg: String) { }                 // + subclasses
    internal fun clearCache() { cache.clear() }        // all of :core
    fun user(id: String): User? = cache[id]            // everyone
}`,
            visual(el) {
              const SPOTS = [
                ['Inside Repo', [1, 1, 1, 1]],
                ['Other code in :core', [0, 0, 1, 1]],
                ['Subclass in :app', [0, 1, 0, 1]],
                ['Other code in :app', [0, 0, 0, 1]],
              ];
              const MODS = ['private', 'protected', 'internal', 'public'];
              const cells = SPOTS.map(([name]) => h('div', { class: 'kt-pr-cell' }, h('span', { class: 'kt-pr-where' }, name), h('span', { class: 'kt-pr-mark' }, '?')));
              const o = out();
              const btns = MODS.map((m, i) => h('button', { class: 'cmd', 'aria-pressed': 'false', html: hl(`${m} fun clearCache()`), onclick: () => pick(i) }));
              function pick(i) {
                btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
                cells.forEach((c, k) => {
                  const ok = SPOTS[k][1][i];
                  c.className = 'kt-pr-cell ' + (ok ? 'ok' : 'no');
                  c.lastChild.textContent = ok ? 'can call it' : 'can’t see it';
                  replay(c, 'pop-soft');
                });
                const n = SPOTS.filter(s => s[1][i]).length;
                say(o, `${hl(MODS[i])} <span class="muted">visible from ${n} of 4 places</span>`);
              }
              el.append(h('div', { class: 'kt-pr-grid' }, cells), h('div', { class: 'controls' }, btns), o);
              say(o, 'Pick a modifier for clearCache() and see who can call it.');
            },
          },
          {
            title: 'Backing property: _state and state',
            body: `<p><code>private set</code> stops reassignment, but if the value is a mutable object, callers can still change what is inside it. The usual fix is two properties: a private mutable one with an underscore, and a public read-only one that returns it.</p>
<p>You will see this in almost every ViewModel. The screen can collect <code>state</code> but has no way to push a value into it.</p>`,
            code: `class CartViewModel : ViewModel() {
    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state

    fun add(item: Item) {
        _state.update { it.copy(items = it.items + item) }
    }
}`,
          },
        ],
        underHood: {
          body: `<p>The JVM has fields and methods, not properties. <code>var health</code> becomes a private field <code>health</code> plus <code>getHealth()</code> and <code>setHealth(int)</code>. Your custom setter is the body of <code>setHealth</code>, and <code>field</code> compiles to the private field. With <code>private set</code>, <code>setHealth</code> is a private method.</p>
<p>The JVM has no idea of a Kotlin module, so <code>internal</code> members compile to <code>public</code> bytecode with a mangled name. Kotlin code in other modules is blocked by the compiler, not by the JVM.</p>`,
          code: `// var health = 100
//     set(value) { field = value.coerceIn(0, 100) }
// roughly what Java sees:
private int health = 100;
public final int getHealth() { return health; }
public final void setHealth(int value) { health = RangesKt.coerceIn(value, 0, 100); }`,
        },
        mistakes: [
          { title: 'Assigning the property inside its own setter', bad: 'var name = ""\n    set(value) { name = value.trim() }', good: 'var name = ""\n    set(value) { field = value.trim() }', why: '<code>name = …</code> inside the setter calls the setter again, which never ends and throws <code>StackOverflowError</code>. <code>field</code> writes the stored value directly.' },
          { title: 'A public mutable list', bad: 'class Playlist {\n    val songs = mutableListOf<Song>()\n}\n\nplaylist.songs.clear()   // anyone can do this', good: 'class Playlist {\n    private val _songs = mutableListOf<Song>()\n    val songs: List<Song> get() = _songs\n    fun add(s: Song) { _songs.add(s) }\n}', why: '<code>val</code> stops reassignment, not changes inside the list. Expose a read-only type and keep the mutable one private.' },
          { title: 'Java-style getter functions', bad: 'private var count = 0\nfun getCount(): Int = count', good: 'var count = 0\n    private set', why: 'A Kotlin property already has a getter. A hand-written <code>getCount()</code> is extra code, and callers have to remember to use the function instead of the property.' },
        ],
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'class Player {\n    var health = 100\n        set(value) { field = value.coerceIn(0, 100) }\n    var score = 0\n        private set\n    fun hit(points: Int) { score += points }\n}\nval p = Player()\np.health = 140\np.health = -5\np.hit(10)\np.score = 999',
            predict: {
              q: 'Line 9 runs <code>p.health = 140</code>. What does <code>p.health</code> hold afterwards?',
              options: ['140', '100', 'It does not compile: 140 is out of range'],
              a: 1,
              why: 'An assignment calls the setter. This one stores <code>value.coerceIn(0, 100)</code> in <code>field</code>, so 140 becomes 100.',
            },
            frames: [
              { say: 'An assignment to a property is a call to its setter. Watch the call stack.' },
              { line: 8, vars: { 'p.health': '100', 'p.score': '0' }, stack: ['main'], say: 'A new Player. Both properties start with their initial values.' },
              { line: [9, 3], vars: { value: '140', 'p.health': '100' }, stack: ['main', 'health.set(140)'], say: '<code>p.health = 140</code> calls the custom setter with <code>value = 140</code>. It clamps the number and writes it to <code>field</code>, the stored value.' },
              { line: [10, 3], vars: { value: '-5', 'p.health': '0' }, stack: ['main', 'health.set(-5)'], say: '-5 goes through the same setter and is stored as 0. Callers can never put a bad value in.' },
              { line: [11, 6], vars: { value: null, 'p.score': '10' }, stack: ['main', 'Player.hit(10)'], say: '<code>hit</code> is inside the class, so it may use the private setter of <code>score</code>.' },
              { line: 12, stack: ['main'], out: "error: Cannot assign to 'score': the setter is private in 'Player'", say: 'From outside, the getter is public but the setter is not. The compiler rejects the line.' },
            ],
          });
        },
        play: `class Player {
    var health = 100
        set(value) {
            field = value.coerceIn(0, 100)
        }

    var score = 0
        private set

    fun hit(points: Int) {
        score += points
    }
}

fun main() {
    val p = Player()
    p.health = 140
    println("health = \${p.health}")   // the setter clamped it
    p.health = -5
    println("health = \${p.health}")
    p.hit(10)
    println("score = \${p.score}")
    // p.score = 999   // remove the // and run: the setter is private
}`,
      },

      // + inheritance ─────────────────────────────────
      {
        id: 'inheritance',
        title: 'Interfaces, abstract and open classes',
        tagline: 'Classes are final until you open them.',
        body: `
<p>In Kotlin, classes and their functions are <em>final</em> by default: nobody can extend or override them. Mark a class <code>open</code> to allow subclasses, and mark each function <code>open</code> that may be replaced. The subclass writes <code>override</code>.</p>
<p>A subclass header calls the parent’s constructor: <code>class Dog : Animal()</code>. An <code>abstract</code> class can’t be created on its own, and its <code>abstract</code> members have no body, so every subclass must provide one. An <code>interface</code> has no constructor and holds no state, but it can give functions a default body. A class extends at most one class and can implement many interfaces.</p>
<p>This lesson covers the syntax. When to use each one is in the OOP track. Step through the class tree below and watch which body each call finds.</p>`,
        code: `interface Named {
    val name: String
    fun describe() = "I am $name"     // default body
}

abstract class Animal(override val name: String) : Named {
    abstract fun sound(): String      // no body: subclasses must override
    open fun move() = "walks"         // open: may be overridden
    fun breathe() = "breathes"        // final: can't be overridden
}

class Bird(name: String) : Animal(name) {
    override fun sound() = "Tweet"
    override fun move() = "flies"
}

val b = Bird("Robin")
b.describe()   // "I am Robin"
b.move()       // "flies"`,
        remember: 'Final by default. open allows it, override does it, abstract demands it. Interfaces: no constructor, many allowed.',
        level: 'beginner',
        terms: [
          { term: 'open', def: 'A modifier that allows a class to be subclassed or a member to be overridden, since both are final by default.' },
          { term: 'override', def: 'Marks a member that replaces an open or abstract member from a superclass or interface.' },
          { term: 'Abstract class', def: 'A class that can’t be instantiated and may declare abstract members that subclasses must implement.' },
          { term: 'Interface', def: 'A type that declares members a class promises to provide; it can have default bodies but no constructor or stored state.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let <code>Button</code> extend <code>View</code> and replace <code>draw()</code>.', code: '[[open]] class View {\n    [[open]] fun draw() = println("view")\n}\nclass Button : View() {\n    [[override]] fun draw() = println("button")\n}', why: 'The class and the function both need <code>open</code>, and the subclass must say <code>override</code>.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'interface Clickable {\n    fun onClick()\n}\n\nclass SaveButton : Clickable() {\n    override fun onClick() = save()\n}', bug: 4, fix: 'class SaveButton : Clickable {', why: 'An interface has no constructor, so there is nothing to call. Drop the parentheses.' },
        ],
        quiz: [
          { q: '<code>class A</code> and <code>class B : A()</code>. Does it compile?', options: ['Yes', 'No, A is final'], a: 1, why: 'Classes are final unless marked <code>open</code> or <code>abstract</code>.' },
          { q: 'Can you write <code>Shape()</code> when <code>Shape</code> is abstract?', options: ['Yes', 'No'], a: 1, why: 'An abstract class can only be created through a concrete subclass.' },
          { q: 'How many classes can a Kotlin class extend, and how many interfaces can it implement?', options: ['One class, many interfaces', 'Many of both', 'One of each'], a: 0, why: 'Kotlin has single class inheritance, but a class can implement any number of interfaces.' },
          { q: 'Two interfaces both give <code>fun move()</code> a default body. <code>class Duck : Swimmer, Flyer</code> does not override move(). What happens?', options: ['Swimmer’s version wins because it is listed first', 'It throws at runtime when move() is called', 'It does not compile until Duck overrides move()'], a: 2, why: 'Kotlin refuses to guess between two inherited bodies. Duck must override move(), and can call super<Swimmer>.move() or super<Flyer>.move() inside it.' },
        ],
        deeper: [
          {
            title: 'super, and two parents with the same function',
            body: `<p>An override can still call the version it replaces with <code>super.move()</code>. That is how a subclass adds to its parent’s behaviour instead of throwing it away.</p>
<p>When a class implements two interfaces that both give <code>move()</code> a default body, Kotlin refuses to guess. The class must override <code>move()</code>, and inside it picks a parent by name: <code>super&lt;Swimmer&gt;.move()</code>.</p>`,
            code: `interface Swimmer { fun move() = "swims" }
interface Flyer { fun move() = "flies" }

class Duck : Swimmer, Flyer {
    override fun move() =
        super<Swimmer>.move() + " and " + super<Flyer>.move()
}

Duck().move()   // "swims and flies"`,
            visual(el) {
              const parent = (name, body) => {
                const code = h('div', { class: 'kt', html: hl(`interface ${name} {\n    fun move() = "${body}"\n}`) });
                return { el: h('div', { class: 'kt-card' }, h('span', { class: 'kt-tag interface' }, 'interface'), code), name, body };
              };
              const sw = parent('Swimmer', 'swims'), fl = parent('Flyer', 'flies');
              const bodies = [
                { label: 'no override', src: 'class Duck : Swimmer, Flyer', err: 'Duck must override move(), because it inherits two implementations of it.' },
                { label: 'super.move()', src: 'class Duck : Swimmer, Flyer {\n    override fun move() = super.move()\n}', err: 'Many supertypes available. Say which one you mean in angle brackets, like super<Foo>.' },
                { label: 'super<Swimmer>', src: 'class Duck : Swimmer, Flyer {\n    override fun move() = super<Swimmer>.move()\n}', uses: [sw] },
                { label: 'super<Flyer>', src: 'class Duck : Swimmer, Flyer {\n    override fun move() = super<Flyer>.move()\n}', uses: [fl] },
                { label: 'both', src: 'class Duck : Swimmer, Flyer {\n    override fun move() =\n        super<Swimmer>.move() + " and " + super<Flyer>.move()\n}', uses: [sw, fl], join: true },
              ];
              let busy = false;
              const duckCode = h('div', { class: 'kt' });
              const duck = h('div', { class: 'kt-card' }, h('span', { class: 'kt-tag' }, 'class'), duckCode);
              const o = out();
              const buttons = bodies.map(b => cmd(b.label, () => pick(b)));
              async function pick(b) {
                if (busy) return; busy = true;
                buttons.forEach((x, i) => x.setAttribute('aria-pressed', bodies[i] === b));
                [sw, fl].forEach(p => p.el.classList.remove('kt-d2-on'));
                duckCode.innerHTML = hl(b.src);
                if (b.err) {
                  duck.className = 'kt-card broken'; replay(duck, 'shake');
                  say(o, `<span class="bad">compile error:</span> ${b.err}`);
                  busy = false; return;
                }
                duck.className = 'kt-card';
                say(o, `${hl('Duck().move()')} <span class="muted">calls...</span>`);
                for (const p of b.uses) {
                  p.el.classList.add('kt-d2-on'); replay(p.el, 'pop');
                  await sleep(480); if (!duck.isConnected) return;
                }
                const r = b.join ? 'swims and flies' : b.uses[0].body;
                replay(duck, 'pop');
                say(o, `${hl('Duck().move()')} = ${hl(`"${r}"`)}`);
                busy = false;
              }
              el.append(
                h('div', { class: 'stage kt-tree' }, h('div', { class: 'kt-pile' }, sw.el, fl.el), h('span', { class: 'kt-up' }, '▲ implements both'), duck),
                h('div', { class: 'controls' }, buttons),
                o);
              pick(bodies[4]);
            },
          },
          {
            title: 'An override stays open until you say final',
            body: `<p>An <code>override</code> member is open itself, so a subclass of your subclass can override it again. Write <code>final override</code> to stop the chain at your class.</p>
<p>Properties follow the same rules: <code>open val</code> in the parent, <code>override val</code> in the child. A child may turn a <code>val</code> into a <code>var</code>, since that only adds a setter. It can’t turn a <code>var</code> into a <code>val</code>, because callers of the parent type expect to be able to set it.</p>`,
            code: `open class Animal {
    open val legs: Int = 4
    open fun move() = "walks"
}

open class Bird : Animal() {
    override var legs = 2                 // val -> var is allowed
    final override fun move() = "flies"   // no further overrides
}

class Penguin : Bird() {
    override fun move() = "waddles"       // error: move is final in Bird
}`,
          },
        ],
        underHood: {
          body: `<p>A Kotlin class without <code>open</code> compiles to a <code>final</code> JVM class, and its functions to <code>final</code> methods. That is why mocking a Kotlin class needs Mockito’s inline mock maker (the default since Mockito 5) or MockK, and why frameworks like Spring use the all-open compiler plugin.</p>
<p>Since Kotlin 2.2, an interface function with a body compiles to a Java <code>default</code> method. By default the compiler also keeps the older <code>DefaultImpls</code> helper class for binary compatibility with code built by older Kotlin versions. A call like <code>super&lt;Swimmer&gt;.move()</code> becomes a direct, non-virtual call to that interface’s version.</p>`,
          code: `// Kotlin
class Plain
open class Base

// Roughly what the JVM sees (decompiled to Java)
public final class Plain { }
public class Base { }`,
        },
        mistakes: [
          { title: 'Skipping super in a lifecycle override', bad: 'class MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        setContent { App() }\n    }\n}', good: 'class MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent { App() }\n    }\n}', why: 'Framework lifecycle methods do real work in the parent. Lint flags the missing call, and at runtime Android throws <code>SuperNotCalledException</code>.' },
          { title: 'An abstract class with no state', bad: 'abstract class Clickable {\n    abstract fun onClick()\n}\nclass SaveButton : BaseButton(), Clickable()   // error: two classes', good: 'interface Clickable {\n    fun onClick()\n}\nclass SaveButton : BaseButton(), Clickable', why: 'A class can extend only one class. If the parent has no constructor state, make it an interface so any class can implement it alongside its real parent.' },
          { title: 'Giving an interface property a value', bad: 'interface Screen {\n    val title: String = "Home"\n}', good: 'interface Screen {\n    val title: String get() = "Home"\n}', why: 'Interfaces can’t store state, so property initializers are not allowed. A getter computes the default value on each read instead.' },
        ],
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'named', label: 'Named<small>interface</small>', x: 50, y: 12, tone: 'warm' },
              { id: 'animal', label: 'Animal<small>abstract class</small>', x: 50, y: 50, tone: 'warm', hidden: true },
              { id: 'bird', label: 'Bird<small>2 overrides</small>', x: 17, y: 88, hidden: true },
              { id: 'dog', label: 'Dog<small>1 override</small>', x: 83, y: 88, hidden: true },
              { id: 'ghost', label: 'Animal(…)<small>error</small>', x: 50, y: 88, tone: 'err', hidden: true },
            ],
            predict: {
              q: '<code>Dog</code> overrides only <code>sound()</code>. What does <code>Dog("Rex").move()</code> return?',
              options: ['"walks", from Animal', 'Compile error: Dog must override <code>move()</code>', '"flies", like Bird'],
              a: 0,
              why: 'Only <code>abstract</code> members must be overridden. <code>move()</code> is <code>open</code> with a body, so Dog inherits Animal’s version.',
            },
            frames: [
              { say: '<code>Named</code> is an interface: no constructor, no state, and <code>describe()</code> has a default body.' },
              { show: ['animal'], add: [['animal', 'named', 'implements']], say: '<code>abstract class Animal</code> implements it. <code>sound()</code> has no body, <code>move()</code> is <code>open</code>, everything else is final.' },
              { show: ['bird'], add: [['bird', 'animal', 'extends']], say: '<code>class Bird : Animal(name)</code> calls the parent constructor and overrides both functions.' },
              { show: ['dog'], add: [['dog', 'animal', 'extends']], say: '<code>Dog</code> overrides only <code>sound()</code>, the one it must.' },
              { hl: ['bird'], say: '<code>bird.move()</code>: Bird has its own override, so the answer is <code>"flies"</code>.' },
              { hl: ['dog', 'animal'], add: [['dog', 'animal', 'move()', 'accent']], say: '<code>dog.move()</code>: Dog has none, so the call uses Animal’s <code>open</code> body: <code>"walks"</code>.' },
              { hl: ['dog', 'animal', 'named'], add: [['animal', 'named', 'describe()', 'accent']], say: '<code>dog.describe()</code> goes all the way up to the interface default: <code>"I am Rex"</code>.' },
              { show: ['ghost'], add: [['ghost', 'animal', '', 'err']], hl: ['ghost'], say: '<code>Animal("Ghost")</code> fails: an abstract class can’t be created on its own. Without <code>open</code> or <code>abstract</code>, <code>class Dog : Animal</code> would fail too.' },
            ],
          });
        },
        play: `interface Named {
    val name: String
    fun describe() = "I am $name"          // default body
}

abstract class Animal(override val name: String) : Named {
    abstract fun sound(): String
    open fun move() = "walks"
}

class Bird(name: String) : Animal(name) {
    override fun sound() = "Tweet"
    override fun move() = "flies"
}

class Dog(name: String) : Animal(name) {
    override fun sound() = "Woof"            // move() is inherited
}

fun main() {
    val animals: List<Animal> = listOf(Bird("Robin"), Dog("Rex"))
    for (a in animals) {
        println("\${a.describe()}. \${a.name} says \${a.sound()} and \${a.move()}.")
    }
    // add: val ghost = Animal("Ghost")  -> an abstract class can't be created
}`,
      },

      // + objects ─────────────────────────────────────
      {
        id: 'objects',
        title: 'object and companion object',
        tagline: 'One instance, made for you.',
        body: `
<p><code>object</code> declares a class and its only instance in one go. That is a singleton. Kotlin creates it the first time you use it, safely across threads, and every use refers to the same instance. You call it by name: <code>Analytics.log("open")</code>.</p>
<p>A <code>companion object</code> lives inside a class. You call its members on the class name, like <code>User.guest()</code>, which makes it the place for factory functions and constants. It plays the role of <code>static</code> in Java.</p>
<p>An <em>object expression</em>, <code>object : Comparator&lt;String&gt; { … }</code>, makes a one-off instance of an unnamed class right where you need it. On Android, avoid singletons that hold a <code>Context</code> or other state you can’t clean up.</p>`,
        code: `object Analytics {
    private var events = 0
    fun log(name: String) {
        events++
        println("$name (#$events)")
    }
}

class User private constructor(val name: String) {
    companion object {
        const val MAX_NAME = 20
        fun guest() = User("guest")
        fun from(raw: String) = User(raw.take(MAX_NAME))
    }
}

Analytics.log("open")      // open (#1)
Analytics.log("buy")       // buy (#2): the same object
val u = User.guest()       // called on the class name

val byLength = object : Comparator<String> {
    override fun compare(a: String, b: String) = a.length - b.length
}`,
        remember: 'object = a singleton. companion object = members on the class name. object : Type { } = a one-off instance.',
        level: 'beginner',
        terms: [
          { term: 'object declaration', def: 'Declares a class and its single instance together, created lazily on first use.' },
          { term: 'companion object', def: 'An object inside a class whose members are called on the class name, used for factories and constants.' },
          { term: 'Object expression', def: 'An expression like object : Comparator<String> { … } that creates an instance of an unnamed class on the spot.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a factory you can call as <code>Note.empty()</code>.', code: 'class Note(val text: String) {\n    [[companion]] [[object]] {\n        fun empty() = Note("")\n    }\n}\nval n = Note.empty()', why: 'Members of a <code>companion object</code> are called on the class name.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'object Session {\n    var token: String? = null\n}\n\nfun login(t: String) {\n    Session().token = t\n}', bug: 5, fix: '    Session.token = t', why: 'An <code>object</code> already is its instance and has no constructor. Use it by name.' },
        ],
        quiz: [
          { q: 'How many instances of <code>object Analytics</code> exist in a running app?', options: ['One', 'One per call', 'One per thread'], a: 0, why: 'An object declaration is a singleton: every reference points at the same instance.' },
          { q: '<code>fun guest()</code> sits in <code>User</code>’s companion object. How do you call it?', options: ['<code>User.guest()</code>', '<code>User().guest()</code>', '<code>guest(User)</code>'], a: 0, why: 'Companion members are called on the class name, with no instance needed.' },
          { q: 'With the Config object above, this runs. How many times is “Config init” printed?<pre class="code mini"><code>println(Config.VERSION)\nConfig.isOn("search")\nConfig.isOn("chat")</code></pre>', options: ['Never', 'Twice', 'Once'], a: 2, why: 'A const val is copied into the reading code, so the first line doesn’t create the object. The first isOn() runs init, and it never runs again.' },
        ],
        deeper: [
          {
            title: 'Created on first use, exactly once',
            body: `<p>An <code>object</code> is not built when the app starts. Its <code>init</code> block runs the first time any code touches it, and never again in that process. A companion object starts the same way, when its class is first used.</p>
<p>A <code>const val</code> is the exception. The compiler copies its value into the code that reads it, so reading <code>Config.VERSION</code> doesn’t create the object at all.</p>`,
            code: `object Config {
    const val VERSION = "2.4"
    val flags: Map<String, Boolean>

    init {
        println("Config init")
        flags = loadFlags()
    }

    fun isOn(name: String) = flags[name] == true
}

println(Config.VERSION)   // 2.4, no init
Config.isOn("search")     // Config init, then true
Config.isOn("chat")       // no init this time`,
            visual(el) {
              let created = false, busy = false;
              const state = h('span', { class: 'field kt-unset' }, 'not created yet');
              const flags = h('span', { class: 'field kt-unset' }, 'flags = (none)');
              const obj = h('div', { class: 'obj kt-d2-ob-ghost' }, h('span', { class: 'obj-name' }, 'object Config'), state, flags);
              const init = h('div', { class: 'machine' }, h('div', { class: 'gear' }), h('div', { class: 'kt', html: hl('init { }') }));
              const log = h('div', { class: 'out', 'aria-live': 'polite' });
              const o = out();
              const print = text => {
                log.append(h('div', { class: 'line drop-in' }, text));
                while (log.children.length > 5) log.firstElementChild.remove();
              };
              const paint = () => {
                obj.className = 'obj' + (created ? '' : ' kt-d2-ob-ghost');
                state.textContent = created ? 'INSTANCE ready' : 'not created yet';
                state.className = 'field ' + (created ? 'kt-ptr' : 'kt-unset');
                flags.textContent = created ? 'flags = {search=true, chat=false}' : 'flags = (none)';
                flags.className = 'field' + (created ? '' : ' kt-unset');
              };
              async function use(name, value) {
                if (busy) return; busy = true;
                if (!created) {
                  init.classList.add('busy');
                  say(o, '<span class="muted">first use: running init...</span>');
                  await sleep(800);
                  init.classList.remove('busy');
                  if (!obj.isConnected) return;
                  created = true; paint(); replay(obj, 'pop');
                  print('Config init');
                } else replay(obj, 'cmp');
                print(String(value));
                say(o, `${hl(`Config.isOn("${name}")`)} = ${hl(String(value))}`);
                busy = false;
              }
              el.append(
                h('div', { class: 'stage' }, obj, init),
                h('div', { class: 'controls' },
                  cmd('println(Config.VERSION)', () => {
                    if (busy) return;
                    print('2.4');
                    say(o, `${hl('Config.VERSION')} = ${hl('"2.4"')} <span class="muted">// const: copied in at compile time, ${created ? 'no init needed' : 'object still not created'}</span>`);
                  }),
                  cmd('Config.isOn("search")', () => use('search', true)),
                  cmd('Config.isOn("chat")', () => use('chat', false)),
                  cmd('restart the process', () => {
                    if (busy) return;
                    created = false; paint(); log.replaceChildren();
                    say(o, '<span class="muted">A new process starts with no Config instance.</span>');
                  })),
                h('p', { class: 'tip' }, 'Logcat'), log, o);
              paint();
              say(o, 'Read the constant first, then call a function.');
            },
          },
          {
            title: 'A lambda beats an object expression for one method',
            body: `<p>An object expression creates a new instance every time that line runs, and it can read the local variables around it, just like a lambda. When the interface has a single abstract method, you rarely need the object syntax.</p>
<p>Java interfaces like <code>View.OnClickListener</code>, and Kotlin interfaces declared with <code>fun interface</code>, accept a lambda directly. This is called SAM conversion. Keep <code>object :</code> for abstract classes, for interfaces with several methods, or when the instance needs its own state.</p>`,
            code: `fun interface PriceFormatter {
    fun format(cents: Long): String
}

val euro = PriceFormatter { "EUR " + it / 100.0 }   // SAM conversion
button.setOnClickListener { save() }                // Java interface

// An abstract class still needs an object expression
recycler.addOnScrollListener(object : RecyclerView.OnScrollListener() {
    override fun onScrolled(rv: RecyclerView, dx: Int, dy: Int) {
        if (dy > 0) hideFab()
    }
})`,
          },
        ],
        underHood: {
          body: `<p>An <code>object</code> compiles to a class with a private constructor and a static field named <code>INSTANCE</code>, set in the class’s static initializer. The JVM runs that initializer once, on first use, and makes other threads wait until it is done. That is where the free laziness and thread safety come from.</p>
<p>A companion object becomes a nested class named <code>Companion</code>, plus a static field <code>Companion</code> on the outer class. Kotlin code writes <code>User.guest()</code>, but Java code has to write <code>User.Companion.guest()</code> unless the function is marked <code>@JvmStatic</code>. A <code>const val</code> becomes a <code>static final</code> field.</p>`,
          code: `// Kotlin
object Analytics {
    fun log(name: String) { /* ... */ }
}

// Roughly what the JVM sees (decompiled to Java)
public final class Analytics {
    public static final Analytics INSTANCE;
    private Analytics() { }
    static { INSTANCE = new Analytics(); }
    public final void log(String name) { /* ... */ }
}`,
        },
        mistakes: [
          { title: 'Constants without const', bad: 'class HomeScreen {\n    companion object {\n        val TAG = "HomeScreen"\n    }\n}', good: 'private const val TAG = "HomeScreen"\n\nclass HomeScreen { /* ... */ }', why: 'Without <code>const</code>, each read goes through a getter on the companion instance. A <code>const val</code> is copied into the code that reads it, and a private top-level one stays out of the class’s API.' },
          { title: 'Assuming the object’s contents are thread-safe', bad: 'object Cart {\n    val items = mutableListOf<Item>()\n}\n// called from several coroutines\nCart.items.add(item)', good: 'object Cart {\n    private val _items = MutableStateFlow<List<Item>>(emptyList())\n    val items: StateFlow<List<Item>> = _items\n    fun add(item: Item) = _items.update { it + item }\n}', why: 'Only the object’s creation is thread-safe. A plain <code>MutableList</code> inside it can be corrupted when two threads add at once. <code>update</code> on a <code>MutableStateFlow</code> retries until its change applies cleanly.' },
          { title: 'Companion functions Java can’t see nicely', bad: 'class DetailFragment : Fragment() {\n    companion object {\n        fun newInstance(id: String) = DetailFragment().apply {\n            arguments = bundleOf("id" to id)\n        }\n    }\n}\n// Java: DetailFragment.Companion.newInstance(id)', good: 'class DetailFragment : Fragment() {\n    companion object {\n        @JvmStatic\n        fun newInstance(id: String) = DetailFragment().apply {\n            arguments = bundleOf("id" to id)\n        }\n    }\n}\n// Java: DetailFragment.newInstance(id)', why: 'Companion members are instance methods of the hidden <code>Companion</code> object. <code>@JvmStatic</code> also generates a real static method, so Java callers use the same short form as Kotlin.' },
        ],
        visual(el) {
          Lab.ui.graph(el, {
            height: 290,
            nodes: [
              { id: 'home', label: 'HomeScreen', x: 17, y: 14, tone: 'muted' },
              { id: 'cart', label: 'CartScreen', x: 83, y: 14, tone: 'muted' },
              { id: 'an', label: 'Analytics<small>object, one instance</small>', x: 50, y: 50, tone: 'ok', hidden: true },
              { id: 't1', label: 'Tracker #1<small>events = 1</small>', x: 17, y: 86, hidden: true },
              { id: 't2', label: 'Tracker #2<small>events = 1</small>', x: 83, y: 86, hidden: true },
            ],
            predict: {
              q: 'HomeScreen calls <code>Analytics.log("open")</code>, then CartScreen calls <code>Analytics.log("buy")</code>. What does the second call print?',
              options: ['<code>buy (#1)</code>: each screen has its own Analytics', '<code>buy (#2)</code>: both screens reach the same object', 'Nothing: Analytics has to be created with <code>Analytics()</code> first'],
              a: 1,
              why: 'An <code>object</code> declaration is a class with exactly one instance. Every use of the name refers to it, so its counter is shared.',
            },
            frames: [
              { say: 'Two screens, and nothing has used <code>Analytics</code> yet. It does not exist so far.' },
              { show: ['an'], add: [['home', 'an', 'log("open") #1', 'ok']], hl: ['an'], say: 'The first use creates the instance, safely across threads. It prints <code>open (#1)</code>.' },
              { add: [['cart', 'an', 'log("buy") #2', 'ok']], hl: ['an'], say: 'CartScreen names <code>Analytics</code> too and gets the same instance. Its counter is now 2: <code>buy (#2)</code>.' },
              { show: ['t1'], add: [['home', 't1', 'Tracker()']], say: 'Compare a normal class. <code>Tracker()</code> builds a new object every time it is called.' },
              { show: ['t2'], add: [['cart', 't2', 'Tracker()']], say: 'A second <code>Tracker()</code> is another object with its own counter, so it says #1 again.' },
              { hl: ['an'], say: '<code>Analytics === Analytics</code> is always <code>true</code>. That shared state is why a singleton must never hold a <code>Context</code> or a screen.' },
            ],
          });
        },
        play: `object Analytics {
    private var events = 0
    init { println("Analytics created") }

    fun log(name: String) {
        events++
        println("Analytics: $name (#$events)")
    }
}

class Tracker {
    private var events = 0
    fun log(name: String) { events++; println("Tracker: $name (#$events)") }
}

class User private constructor(val name: String) {
    companion object {
        fun guest() = User("guest")
    }
}

fun main() {
    println("main starts")
    Analytics.log("open")
    Analytics.log("buy")         // the same object, so #2
    Tracker().log("open")
    Tracker().log("buy")         // a new object, so #1 again
    println(User.guest().name)   // try User("x"): the constructor is private
}`,
      },

      // + enums ───────────────────────────────────────
      {
        id: 'enums',
        title: 'Enum classes',
        tagline: 'A fixed list of named values.',
        body: `
<p>An <code>enum class</code> lists every value a type can have, like the colors of a traffic light. Each entry is a single object. Entries can take constructor values and the class can have functions, after a semicolon that ends the list.</p>
<p>Every entry knows its <code>name</code> and its <code>ordinal</code> (its position, from 0). <code>Light.entries</code> lists them all in order, and <code>Light.valueOf("RED")</code> looks one up by name, throwing if there is no match. A <code>when</code> that covers every entry needs no <code>else</code>.</p>
<p>Enum or sealed? Use an enum when every case has the same shape and there is exactly one of each. Use a sealed type when cases carry different data, like an error with its own message.</p>`,
        code: `enum class Light(val seconds: Int) {
    RED(30), YELLOW(5), GREEN(25);

    fun next(): Light = when (this) {
        RED -> GREEN
        GREEN -> YELLOW
        YELLOW -> RED
    }
}

Light.entries           // [RED, YELLOW, GREEN]
Light.RED.ordinal       // 0
Light.GREEN.seconds     // 25
Light.valueOf("GREEN")  // GREEN
Light.RED.next()        // GREEN`,
        remember: 'enum class = a fixed set of single values. entries lists them; when over all of them needs no else.',
        level: 'beginner',
        terms: [
          { term: 'enum class', def: 'A class with a fixed set of named instances, its entries, declared in its body.' },
          { term: 'entries', def: 'A list of all of an enum’s values in declaration order, the modern replacement for values().' },
          { term: 'ordinal', def: 'The zero-based position of an enum entry in its declaration.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print every size by name.', code: 'enum class Size { S, M, L }\n\nfor (s in Size.[[entries]]) {\n    println(s.[[name]])\n}', why: '<code>entries</code> lists every value in order, and <code>name</code> is the entry’s name as a String.' },
          { type: 'bug', prompt: 'An old app version saved <code>"AUTO"</code>. One line crashes on it. Tap it.', code: 'enum class Theme { LIGHT, DARK, SYSTEM }\n\nfun load(prefs: SharedPreferences): Theme {\n    val saved = prefs.getString("theme", null) ?: return Theme.SYSTEM\n    return Theme.valueOf(saved)\n}', bug: 4, fix: '    return Theme.entries.firstOrNull { it.name == saved } ?: Theme.SYSTEM', why: '<code>valueOf</code> throws IllegalArgumentException for an unknown name. Stored text can be anything, so look it up safely.' },
        ],
        quiz: [
          { q: 'What is <code>Light.entries.size</code> for the code above?', options: ['2', '3', '0'], a: 1, why: 'There are three entries: RED, YELLOW and GREEN.' },
          { q: 'A <code>when (light)</code> covers RED, YELLOW and GREEN. Does it need <code>else</code>?', options: ['Yes, always', 'No, it is exhaustive'], a: 1, why: 'The compiler knows every entry, so covering them all is enough.' },
          { q: 'Each error case needs its own message and code. Enum or sealed?', options: ['Enum', 'Sealed'], a: 1, why: 'Sealed subtypes can carry different data per case. Enum entries all share one shape.' },
          { q: 'You store the user’s chosen Priority in DataStore. What should you save?', options: ['Its ordinal', 'Its hashCode()', 'Its name, or a stable key of its own'], a: 2, why: 'Ordinals shift when entries are added or reordered, so saved numbers would point at the wrong entry. A name or own key stays put.' },
        ],
        deeper: [
          {
            title: 'Entries with their own behaviour',
            body: `<p>An enum can declare an <code>abstract</code> function, and then each entry must give it a body. The entries are still one fixed list, but each behaves differently. An enum can also implement an interface the same way.</p>
<p>This keeps the logic next to the value it belongs to. Add an entry and the compiler makes you write its body, just like an exhaustive <code>when</code> makes you add a branch.</p>`,
            code: `enum class Op(val symbol: String) {
    PLUS("+")  { override fun apply(a: Int, b: Int) = a + b },
    MINUS("-") { override fun apply(a: Int, b: Int) = a - b },
    TIMES("*") { override fun apply(a: Int, b: Int) = a * b };

    abstract fun apply(a: Int, b: Int): Int
}

Op.entries.map { "8 \${it.symbol} 2 = \${it.apply(8, 2)}" }
// [8 + 2 = 10, 8 - 2 = 6, 8 * 2 = 16]`,
            visual(el) {
              const ops = [
                { name: 'PLUS', sym: '+', f: (a, b) => a + b, body: 'a + b' },
                { name: 'MINUS', sym: '-', f: (a, b) => a - b, body: 'a - b' },
                { name: 'TIMES', sym: '*', f: (a, b) => a * b, body: 'a * b' },
              ];
              let busy = false;
              const cards = ops.map(op => h('div', { class: 'kt-card' },
                h('span', { class: 'kt-tag' }, `${op.name}("${op.sym}") · ${ops.indexOf(op)}`),
                h('div', { class: 'kt', html: hl(`override fun apply(...) =\n    ${op.body}`) })));
              const extra = h('div', {});
              const o = out();
              async function call(list) {
                if (busy) return; busy = true;
                const lines = [];
                for (const op of list) {
                  const c = cards[ops.indexOf(op)];
                  cards.forEach(x => x.classList.remove('kt-d2-on'));
                  c.classList.add('kt-d2-on'); replay(c, 'pop');
                  lines.push(`8 ${op.sym} 2 = ${op.f(8, 2)}`);
                  say(o, `${hl(`Op.${op.name}.apply(8, 2)`)} = ${hl(String(op.f(8, 2)))}`);
                  await sleep(list.length > 1 ? 520 : 200); if (!o.isConnected) return;
                }
                if (list.length > 1) say(o, `[${lines.join(', ')}] <span class="muted">// one call, three different bodies</span>`);
                busy = false;
              }
              el.append(
                h('div', { class: 'kt', html: hl('abstract fun apply(a: Int, b: Int): Int') }),
                h('div', { class: 'stage' }, cards, extra),
                h('div', { class: 'controls' },
                  ops.map(op => cmd(`Op.${op.name}.apply(8, 2)`, () => call([op]))),
                  cmd('Op.entries.map { ... }', () => call(ops)),
                  cmd('DIV("/"),  // no body', () => {
                    if (busy) return;
                    extra.replaceChildren(h('div', { class: 'kt-card broken drop-in' }, h('span', { class: 'kt-tag' }, 'DIV("/") · 3'), h('div', { class: 'kt', html: hl('// no apply body') })));
                    replay(extra, 'shake');
                    say(o, '<span class="bad">compile error:</span> entry DIV doesn’t implement the abstract member apply');
                  })),
                o);
              say(o, 'Call each entry. The same function name runs a different body.');
            },
          },
          {
            title: 'Save the name, never the ordinal',
            body: `<p><code>ordinal</code> is only a position. Insert an entry in the middle, or reorder the list, and every later ordinal shifts. Ordinals saved in preferences, a database or on a server then point at the wrong entry, with no error at all.</p>
<p>Save <code>name</code> and look it up safely when you read it back. If you might rename entries later, give each one its own stable key, like <code>enum class Priority(val key: String)</code>, and save that.</p>`,
            visual(el) {
              const v1 = ['LOW', 'NORMAL', 'HIGH'], v2 = ['LOW', 'NORMAL', 'URGENT', 'HIGH'];
              let list = v1, saved = null;
              const row = h('div', { class: 'kt-pile' });
              const ver = h('span', { class: 'kt-type' }, 'app v1');
              const sOrd = h('span', { class: 'field kt-unset' }, 'priority_ord = (empty)');
              const sName = h('span', { class: 'field kt-unset' }, 'priority_name = (empty)');
              const store = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'saved prefs'), sOrd, sName);
              const result = h('div', { class: 'slot' });
              const o = out();
              const paint = anim => {
                ver.textContent = list === v1 ? 'app v1' : 'app v2: URGENT added';
                row.replaceChildren(...list.map((n, i) => h('span', { class: 'chip kt-sm' + (anim && (n === 'URGENT' || i >= 3) ? ' drop-in' : '') }, `${n} · ${i}`)));
              };
              const need = () => { if (saved) return true; replay(store, 'shake'); say(o, '<span class="bad">nothing saved yet:</span> press save(Priority.HIGH) first'); return false; };
              el.append(
                h('div', { class: 'stage kt-col' }, h('div', { class: 'controls' }, h('span', { class: 'kt-zone-title' }, 'Priority.entries'), ver), row, h('div', { class: 'kt-pile' }, store, result)),
                h('div', { class: 'controls' },
                  cmd('save(Priority.HIGH)', () => {
                    const ord = list.indexOf('HIGH');
                    saved = { ord, name: 'HIGH' };
                    sOrd.textContent = `priority_ord = ${ord}`; sName.textContent = 'priority_name = "HIGH"';
                    sOrd.className = sName.className = 'field changed'; replay(store, 'pop');
                    say(o, `saved ordinal ${ord} and name "HIGH"`);
                  }),
                  cmd('ship the update', () => {
                    if (list === v2) { say(o, '<span class="muted">Already on v2. Press Reset to go back to v1.</span>'); return; }
                    list = v2; paint(true);
                    say(o, 'v2 inserts URGENT before HIGH. <span class="muted">HIGH moved from 2 to 3.</span>');
                  }),
                  cmd('entries[saved ordinal]', () => {
                    if (!need()) return;
                    const got = list[saved.ord];
                    swap(result, got);
                    if (got !== 'HIGH') { replay(result, 'shake'); say(o, `<span class="bad">wrong entry:</span> ${hl(`Priority.entries[${saved.ord}]`)} = ${got}, but the user picked HIGH`); }
                    else say(o, `${hl(`Priority.entries[${saved.ord}]`)} = HIGH <span class="muted">// right only until the order changes</span>`);
                  }),
                  cmd('find by saved name', () => {
                    if (!need()) return;
                    swap(result, 'HIGH');
                    say(o, `${hl('Priority.entries.firstOrNull { it.name == saved }')} = HIGH <span class="muted">// survives inserts and reorders</span>`);
                  })),
                o);
              paint(false);
              say(o, 'Save, ship the update, then read the value back both ways.');
            },
          },
        ],
        underHood: {
          body: `<p>An enum class compiles to a Java enum: a final class that extends <code>java.lang.Enum</code>, with one <code>static final</code> field per entry. All entries are created together in the static initializer, the first time the enum is used. An entry with its own body becomes an anonymous subclass.</p>
<p><code>values()</code> returns a fresh copy of the array on every call, because a caller could change an array. <code>entries</code>, added in Kotlin 1.9, returns a read-only list that is created once, so prefer it in new code.</p>`,
          code: `// Kotlin
enum class Light { RED, YELLOW, GREEN }

// Roughly what the JVM sees (decompiled to Java)
public final class Light extends Enum<Light> {
    public static final Light RED = new Light("RED", 0);
    public static final Light YELLOW = new Light("YELLOW", 1);
    public static final Light GREEN = new Light("GREEN", 2);
    // plus a static list that backs Light.entries
}`,
        },
        mistakes: [
          { title: 'Reaching for values()', bad: 'for (size in Size.values()) addChip(size)', good: 'for (size in Size.entries) addChip(size)', why: '<code>values()</code> copies the whole array on each call. <code>entries</code> is a ready-made read-only list, and it is the form the IDE now suggests.' },
          { title: 'Comparing names as text', bad: 'if (light.name == "RED") stop()', good: 'if (light == Light.RED) stop()', why: 'A typo in the string compiles and is always false, and renaming the entry silently breaks it. Comparing entries is checked by the compiler.' },
          { title: 'An else that hides new entries', bad: 'fun color(l: Light) = when (l) {\n    Light.RED -> Color.Red\n    else -> Color.Green\n}', good: 'fun color(l: Light) = when (l) {\n    Light.RED -> Color.Red\n    Light.YELLOW -> Color.Yellow\n    Light.GREEN -> Color.Green\n}', why: 'With <code>else</code>, an entry added later quietly gets the fallback. Listing every entry lets the compiler point at each <code>when</code> that needs the new case.' },
        ],
        visual(el) {
          const L = [{ name: 'RED', s: 30, c: 'r' }, { name: 'YELLOW', s: 5, c: 'y' }, { name: 'GREEN', s: 25, c: 'g' }];
          const order = [0, 2, 1]; // branch order in next(): RED, GREEN, YELLOW
          const nextOf = { 0: 2, 2: 1, 1: 0 };
          let cur = 0, busy = false;
          const lamps = L.map(l => h('span', { class: `kt-lamp ${l.c}` }));
          const light = h('div', { class: 'kt-light', role: 'img', 'aria-label': 'Traffic light' }, lamps);
          const rows = order.map(i => h('div', { class: 'branch', html: '    ' + hl(`${L[i].name.padEnd(6)} -> ${L[nextOf[i]].name}`) }));
          const chips = h('div', { class: 'kt-pile' });
          const o = out();
          const paint = () => { lamps.forEach((lp, i) => lp.classList.toggle('on', i === cur)); light.setAttribute('aria-label', `Traffic light: ${L[cur].name}`); };
          async function next(quiet) {
            rows.forEach(r => { r.className = 'branch'; });
            for (let k = 0; k < order.length; k++) {
              rows[k].classList.add('scan'); await sleep(260); rows[k].classList.remove('scan');
              if (!light.isConnected) return false;
              if (order[k] === cur) { rows[k].classList.add('hit'); rows.slice(k + 1).forEach(r => r.classList.add('skip')); break; }
              rows[k].classList.add('miss');
            }
            cur = nextOf[cur]; paint(); replay(lamps[cur], 'pop');
            if (!quiet) say(o, `light = ${hl(`Light.${L[cur].name}`)}  <span class="muted">// seconds = ${L[cur].s}, ordinal = ${cur}</span>`);
            return true;
          }
          async function run(f) { if (busy) return; busy = true; await f(); busy = false; }
          async function cycle() {
            for (let n = 0; n < 3; n++) {
              if (!await next(true)) return;
              say(o, `${hl(`Light.${L[cur].name}`)} <span class="muted">for ${L[cur].s} s (sped up)</span>`);
              await sleep(L[cur].s * 40);
              if (!light.isConnected) return;
            }
          }
          async function entries() {
            chips.replaceChildren();
            for (let i = 0; i < L.length; i++) { chips.append(h('span', { class: 'chip drop-in' }, `${L[i].name} · ${i}`)); await sleep(140); }
            say(o, `${hl('Light.entries')} = [RED, YELLOW, GREEN]  <span class="muted">// name · ordinal</span>`);
          }
          paint();
          el.append(
            h('div', { class: 'kt-enum-wrap' }, light,
              h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('fun next() = when (this) {') }), rows, h('div', { class: 'branch head' }, '}'))),
            h('div', { class: 'controls' },
              cmd('light = light.next()', () => run(() => next(false))),
              cmd('light.ordinal', () => { replay(lamps[cur], 'pop'); say(o, `${hl(`Light.${L[cur].name}.ordinal`)} = ${hl(String(cur))}`); }),
              cmd('Light.entries', () => run(entries)),
              cmd('Light.valueOf("BLUE")', () => { replay(light, 'shake'); say(o, '<span class="bad">crash:</span> IllegalArgumentException: No enum constant Light.BLUE'); }),
              h('button', { class: 'btn primary small', onclick: () => run(cycle) }, 'Run a cycle')),
            chips, o);
          say(o, `light = ${hl('Light.RED')}  <span class="muted">// seconds = 30, ordinal = 0</span>`);
        },
        predict: {
          "q": "What does <code>Light.valueOf(\"BLUE\")</code> do?",
          "options": [
            "Returns null",
            "Throws IllegalArgumentException",
            "Does not compile"
          ],
          "a": 1,
          "why": "<code>valueOf</code> looks an entry up by name at run time. With no match it throws, so use <code>entries.firstOrNull</code> when the name may be wrong."
        },
        play: `enum class Light(val seconds: Int) {
    RED(30), YELLOW(5), GREEN(25);

    fun next(): Light = when (this) {
        RED -> GREEN
        GREEN -> YELLOW
        YELLOW -> RED
    }
}

fun main() {
    println(Light.entries)
    var light = Light.RED
    repeat(4) {
        println("\${light.name} (ordinal \${light.ordinal}) for \${light.seconds} s")
        light = light.next()
    }
    println(Light.valueOf("GREEN"))   // change "GREEN" to "BLUE" and run again
}`
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'data',
        title: 'Data classes',
        tagline: 'Classes that compare by their values.',
        body: `
<p>Put <code>data</code> in front of a class whose job is to hold values, and Kotlin writes the boring parts for you: <code>equals()</code> compares the fields, <code>toString()</code> prints them, and <code>copy()</code> makes a new object with some fields changed.</p>
<p>A plain class compares by identity: two objects are equal only when they are the very same object in memory. The demo below compares two equal-looking objects both ways.</p>
<p>On Android you will use data classes for screen state and API responses. Because <code>copy()</code> makes a new object instead of editing the old one, Compose can tell that something changed.</p>`,
        code: `data class User(val name: String, val age: Int)

val a = User("Ada", 36)
val b = User("Ada", 36)
val c = a.copy(age = 37)    // User(name=Ada, age=37)

a == b      // true: same field values
a == c      // false
println(a)  // User(name=Ada, age=36)`,
        remember: 'data class: equals by fields, readable toString, copy() for changes.',
        level: 'beginner',
        terms: [
          { term: 'data class', def: 'A class whose equals, hashCode, toString and copy are generated from its constructor properties.' },
          { term: 'copy()', def: 'Creates a new data class instance with the same values, except for the ones you pass.' },
          { term: 'Structural equality', def: 'Comparing objects by their values with ==, as opposed to identity with ===.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a value class for points and move one.', code: '[[data]] class Point(val x: Int, val y: Int)\nval p = Point(1, 2)\nval moved = p.[[copy]](x = 5)', why: '<code>data</code> generates <code>copy()</code>, which returns <code>Point(5, 2)</code> and leaves <code>p</code> alone.' },
          { type: 'bug', prompt: 'This data class won’t compile. Tap the wrong line.', code: 'data class Product(\n    val id: Int,\n    name: String,\n    val price: Double,\n)', bug: 2, fix: '    val name: String,', why: 'Every parameter in a data class’s primary constructor must be a property, so it needs <code>val</code> or <code>var</code>.' },
        ],
        quiz: [
          { q: 'For a plain (non-data) class, <code>User("Ada") == User("Ada")</code> is', options: ['<code>true</code>', '<code>false</code>'], a: 1, why: 'Without <code>data</code>, <code>==</code> checks whether both are the same object, and these are two separate objects.' },
          { q: 'What does <code>a.copy(age = 37)</code> do to <code>a</code>?', options: ['Sets its age to 37', 'Nothing. It returns a new object.'], a: 1, why: '<code>copy()</code> builds a new object. With <code>val</code> properties, <code>a</code> can’t change at all.' },
          { q: 'What does this print?<pre class="code mini"><code>data class Item(val id: Int) {\n    var selected = false\n}\nval a = Item(1).apply { selected = true }\nprintln(a == Item(1))</code></pre>', options: ['true', 'false', 'It does not compile'], a: 0, why: 'The generated equals uses only primary constructor properties. selected is declared in the body, so it doesn’t count.' },
          { q: 'A data class with a var property is in a HashSet. You change that property. What does <code>set.contains(item)</code> return?', options: ['true', 'It throws ConcurrentModificationException', 'false'], a: 2, why: 'The hash changed, so the set looks in a different bucket and misses the object. It is still in the set, just unreachable.' },
        ],
        deeper: [
          {
            title: 'Only the constructor counts',
            body: `<p>The generated <code>equals</code>, <code>hashCode</code>, <code>toString</code> and <code>copy</code> use only the properties in the primary constructor. A property declared in the class body is invisible to all four.</p>
<p>That can be handy for UI-only flags, and surprising when you forget it. <code>copy()</code> calls the constructor, so a body property starts again from its initializer.</p>`,
            code: `data class Item(val id: Int, val name: String) {
    var selected = false     // not part of equals, toString or copy
}`,
            visual(el) {
              const a = { selected: false }, b = { selected: false };
              const field = () => h('span', { class: 'field' });
              const fa = field(), fb = field();
              const card = (n, f) => h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, `val ${n}`),
                h('span', { class: 'field' }, 'id = 1'), h('span', { class: 'field' }, 'name = "Tea"'),
                h('span', { class: 'kt-body-prop' }, h('span', { class: 'kt-tag' }, 'body'), f));
              const ca = card('a', fa), cb = card('b', fb);
              const o = out();
              const paint = () => {
                fa.textContent = `selected = ${a.selected}`; fb.textContent = `selected = ${b.selected}`;
                fa.className = 'field' + (a.selected ? ' changed' : '');
              };
              paint();
              say(o, 'a and b are Item(1, "Tea"). Select a, then compare.');
              el.append(
                h('div', { class: 'kt', html: hl('data class Item(val id: Int, val name: String) {\n    var selected = false\n}') }),
                h('div', { class: 'stage' }, ca, cb),
                h('div', { class: 'controls' },
                  cmd('a.selected = !a.selected', () => { a.selected = !a.selected; paint(); replay(fa, 'pop'); say(o, hl(`a.selected = ${a.selected}`)); }),
                  cmd('a == b', () => {
                    replay(ca, 'cmp'); replay(cb, 'cmp');
                    say(o, `${hl('a == b')} <span class="muted">is</span> ${hl('true')} <span class="muted">// ${a.selected !== b.selected ? 'selected differs, but equals ignores it' : 'id and name match'}</span>`);
                  }),
                  cmd('println(a)', () => say(o, `Item(id=1, name=Tea) <span class="muted">// no selected</span>`)),
                  cmd('a.copy().selected', () => say(o, `${hl('false')} <span class="muted">// copy() runs the constructor, so selected starts at false${a.selected ? ' even though a.selected is true' : ''}</span>`))),
                o);
            },
          },
          {
            title: 'copy() is shallow',
            body: `<p><code>copy()</code> copies each property’s <em>reference</em>. It doesn’t clone the objects they point to. If a property holds a <code>MutableList</code>, the copy and the original share that one list, and a change through either shows in both.</p>
<p>Use read-only types inside data classes and build new values instead: <code>copy(items = items + "Jam")</code> creates a new list and leaves the old object untouched.</p>`,
            visual(el) {
              const sw = h('input', { type: 'checkbox', id: 'kt-data-shallow-ro' });
              const decl = h('div', { class: 'kt' });
              const stage = h('div', { class: 'stage kt-refs' });
              const lists = h('div', { class: 'kt-pile' });
              const o = out();
              let ro, a, b, ids;
              const addr = n => '@' + (0x3a10 + n * 0x2c4).toString(16);
              const listCard = l => (l.el = h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, `${ro ? 'List' : 'MutableList'} ${addr(l.id)}`),
                h('div', { class: 'kt-pile' }, l.items.map(t => h('span', { class: 'chip kt-sm' }, t)))));
              const refCard = (n, x) => h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, `val ${n}: Cart`),
                h('span', { class: 'field' }, `owner = "${x.owner}"`),
                h('span', { class: 'field kt-ptr' }, `items → ${addr(x.list.id)}`));
              function paint() {
                stage.replaceChildren(refCard('a', a), ...(b ? [refCard('b', b)] : []));
                const all = [...new Set([a.list, ...(b ? [b.list] : [])])];
                lists.replaceChildren(...all.map(listCard));
              }
              function reset() {
                ro = sw.checked; ids = 0;
                a = { owner: 'Ada', list: { id: ids++, items: ['Tea'] } }; b = null;
                decl.innerHTML = hl(`data class Cart(val owner: String, val items: ${ro ? 'List' : 'MutableList'}<String>)`);
                paint();
                say(o, 'Copy a, then add to b’s items.');
              }
              sw.addEventListener('change', reset);
              const copyB = () => {
                if (b) { say(o, '<span class="bad">error:</span> b already exists. Press Reset to start over.'); replay(o, 'shake'); return; }
                b = { owner: 'Bo', list: a.list }; paint();
                say(o, `${hl('val b = a.copy(owner = "Bo")')} <span class="muted">// one list, two references</span>`);
              };
              const add = () => {
                if (!b) { say(o, '<span class="bad">error:</span> Unresolved reference \'b\'. Copy a first.'); replay(o, 'shake'); return; }
                if (ro) {
                  b = { owner: b.owner, list: { id: ids++, items: [...b.list.items, 'Jam'] } };
                  paint();
                  say(o, `${hl('b = b.copy(items = b.items + "Jam")')} <span class="good">a keeps [Tea]</span>`);
                } else {
                  b.list.items.push('Jam'); paint();
                  replay(stage, 'shake');
                  say(o, `${hl('b.items.add("Jam")')} <span class="bad">a.items changed too:</span> ${hl(`[${a.list.items.join(', ')}]`)}`);
                }
              };
              reset();
              el.append(
                h('label', { class: 'switch', for: 'kt-data-shallow-ro' }, sw, 'read-only List + copy'),
                decl, stage, lists,
                h('div', { class: 'controls' },
                  cmd('val b = a.copy(owner = "Bo")', copyB),
                  cmd('add "Jam" to b', add),
                  cmd('println(a.items)', () => say(o, hl(`[${a.list.items.join(', ')}]`)))),
                o);
            },
          },
          {
            title: 'Don’t change a key after storing it',
            body: `<p>Sets and map keys find an object by its <code>hashCode</code>. A data class computes that from its properties. Change a <code>var</code> property after adding the object and its hash changes, so the set looks in the wrong place and can’t find it any more.</p>
<p>Keep data classes made of <code>val</code>s, especially ones you use as keys.</p>`,
            code: `data class Tag(var name: String)

val tag = Tag("kotlin")
val tags = hashSetOf(tag)
tag.name = "android"

tags.contains(tag)   // false: stored under the old hash
tags.size            // 1: it is still in there, unreachable`,
          },
        ],
        underHood: {
          body: `<p>The compiler adds these members to every data class, built only from the primary constructor properties: <code>component1()</code> to <code>componentN()</code> for destructuring, <code>copy()</code> with each parameter defaulting to the current value, <code>equals()</code>, <code>hashCode()</code> and <code>toString()</code>.</p>
<p>If you write one of <code>equals</code>, <code>hashCode</code> or <code>toString</code> yourself in the class body, the compiler uses yours and skips generating it. <code>val (name, age) = user</code> is just <code>user.component1()</code> and <code>user.component2()</code>.</p>`,
          code: `// data class User(val name: String, val age: Int) gets, roughly:
operator fun component1() = name
operator fun component2() = age
fun copy(name: String = this.name, age: Int = this.age) = User(name, age)
override fun equals(other: Any?) =
    this === other || (other is User && name == other.name && age == other.age)
override fun hashCode() = name.hashCode() * 31 + age.hashCode()
override fun toString() = "User(name=$name, age=$age)"`,
        },
        mistakes: [
          { title: 'Arrays inside a data class', bad: 'data class Photo(val id: Int, val bytes: ByteArray)\n\nPhoto(1, data) == Photo(1, data.copyOf())   // false', good: 'data class Photo(val id: Int, val bytes: List<Byte>)\n// or override equals/hashCode with contentEquals/contentHashCode', why: 'Arrays compare by identity, so the generated <code>equals</code> does too. The IDE warns about this. Use a <code>List</code>, or write <code>equals</code> and <code>hashCode</code> yourself.' },
          { title: 'Mutating state instead of copying it', bad: 'data class UiState(val items: MutableList<String>)\n\n_state.value.items.add("New")   // UI never updates', good: 'data class UiState(val items: List<String>)\n\n_state.update { it.copy(items = it.items + "New") }', why: 'The StateFlow still holds the same object, so it has nothing new to emit and Compose sees no change. A new object from <code>copy()</code> triggers the update.' },
          { title: 'Secrets in toString', bad: 'data class Login(val user: String, val password: String)\n\nLog.d("Auth", "Sending $login")', good: 'data class Login(val user: String, val password: String) {\n    override fun toString() = "Login(user=$user, password=***)"\n}', why: 'The generated <code>toString</code> prints every constructor property, so passwords and tokens end up in logs and crash reports. Override it for sensitive data.' },
        ],
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'a', label: 'val a', x: 17, y: 12, tone: 'muted' },
              { id: 'b', label: 'val b', x: 83, y: 12, tone: 'muted', hidden: true },
              { id: 'c', label: 'val c', x: 50, y: 12, tone: 'muted', hidden: true },
              { id: 'oa', label: 'User@1b6d<small>Ada, 36</small>', x: 17, y: 52 },
              { id: 'ob', label: 'User@2f0a<small>Ada, 36</small>', x: 83, y: 52, hidden: true },
              { id: 'oc', label: 'User@5e01<small>Ada, 37</small>', x: 17, y: 88, hidden: true },
            ],
            predict: {
              q: '<code>a</code> and <code>b</code> are two separate <code>User("Ada", 36)</code> objects of a <code>data class</code>. What are <code>a == b</code> and <code>a === b</code>?',
              options: ['true and true', 'true and false', 'false and false'],
              a: 1,
              why: '<code>==</code> calls <code>equals()</code>, which a data class generates to compare the fields. <code>===</code> asks whether both names point at the very same object.',
            },
            frames: [
              { add: [['a', 'oa']], say: '<code>data class User(val name: String, val age: Int)</code>. <code>val a = User("Ada", 36)</code> points at one object.' },
              { show: ['b', 'ob'], add: [['b', 'ob']], say: '<code>val b = User("Ada", 36)</code> builds a second object with the same values. Two boxes in memory.' },
              { add: [['oa', 'ob', '== true', 'ok']], hl: ['oa', 'ob'], say: '<code>a == b</code> calls the generated <code>equals()</code>. Every field matches, so it is <code>true</code>.' },
              { add: [['oa', 'ob', '=== false', 'err']], hl: ['oa', 'ob'], say: '<code>a === b</code> compares identity. They are different objects, so it is <code>false</code>.' },
              { remove: [['oa', 'ob']], show: ['c', 'oc'], add: [['c', 'oc'], ['oa', 'oc', 'copy(age = 37)', 'accent']], say: '<code>val c = a.copy(age = 37)</code> builds a new object with one field changed. <code>a</code> itself is untouched.' },
              { add: [['oa', 'oc', '== false', 'err']], hl: ['oa', 'oc'], say: '<code>a == c</code> is <code>false</code>: the ages differ. <code>println(c)</code> prints <code>User(name=Ada, age=37)</code>.' },
              { remove: [['oa', 'oc']], add: [['oa', 'ob', '== false', 'err']], hl: ['oa', 'ob'], say: 'Remove <code>data</code> and <code>==</code> falls back to identity, so even a and b are not equal, <code>copy()</code> no longer exists and <code>println(a)</code> shows <code>User@1b6d</code>.' },
            ],
          });
        },
        play: `data class User(val name: String, val age: Int)

class Plain(val name: String, val age: Int)

fun main() {
    val a = User("Ada", 36)
    val b = User("Ada", 36)
    val c = a.copy(age = 37)

    println(a == b)    // same field values
    println(a === b)   // but two different objects
    println(a == c)
    println(a)
    println(c)

    println(Plain("Ada", 36) == Plain("Ada", 36))   // plain classes compare identity
    println(Plain("Ada", 36))
    // remove \`data\` from User: copy() stops compiling. Delete that line and run again
}`,
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'extensions',
        title: 'Extension functions',
        tagline: 'Add functions to types you don’t own.',
        body: `
<p>An extension function adds a new function to an existing type, like <code>String</code> or an Android <code>View</code>, without editing it or subclassing it.</p>
<p>Write the type, a dot, then the name: <code>fun String.shout()</code>. Inside, <code>this</code> is the value it was called on (the <em>receiver</em>). The class itself does not change. Kotlin just lets you call your function with dot syntax.</p>
<p>Android KTX is mostly extensions. <code>view.isVisible = true</code> and <code>"https://…".toUri()</code> are both extensions written by Google.</p>`,
        code: `fun String.shout(): String = uppercase() + "!"
fun String.isPalindrome(): Boolean = this == reversed()
fun String.initials(): String =
    split(" ").map { it.first() }.joinToString("")

"hello".shout()             // "HELLO!"
"level".isPalindrome()      // true
"Ada Lovelace".initials()   // "AL"`,
        remember: 'fun Type.name() adds a function to Type from outside. Inside it, this is the receiver.',
        level: 'beginner',
        terms: [
          { term: 'Extension function', def: 'A function declared outside a type, like fun String.shout(), that you call with dot syntax on that type.' },
          { term: 'Receiver', def: 'The object an extension or a lambda with receiver is called on, available inside as this.' },
          { term: 'Android KTX', def: 'Jetpack libraries of Kotlin extensions that make Android APIs shorter, like view.isVisible.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add an <code>isEven()</code> function to Int.', code: 'fun [[Int]].isEven(): Boolean = [[this]] % 2 == 0\n10.isEven()   // true', why: 'The receiver type goes before the dot, and <code>this</code> is the Int it was called on.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'class Wallet(private val cents: Long) {\n    fun total(): Long = cents\n}\n\nfun Wallet.display(): String =\n    "EUR " + cents / 100.0', bug: 5, fix: '    "EUR " + total() / 100.0', why: 'An extension is an ordinary function outside the class, so it can’t read <code>private</code> members. Use the public <code>total()</code>.' },
        ],
        quiz: [
          { q: 'Inside <code>fun Int.isOdd() = this % 2 == 1</code>, what is <code>this</code>?', options: ['The Int it was called on', 'The file it lives in', 'Nothing, extensions have no this'], a: 0, why: '<code>this</code> is the receiver: in <code>5.isOdd()</code> it is 5.' },
          { q: 'Can an extension function read a class’s <code>private</code> members?', options: ['Yes, it becomes part of the class', 'No, it is an ordinary function called with dot syntax'], a: 1, why: 'Extensions are compiled to regular functions that take the receiver as a parameter, so they can’t see private members.' },
          { q: 'What does <code>s.label()</code> return?<pre class="code mini"><code>open class Shape\nclass Circle : Shape()\nfun Shape.label() = "a shape"\nfun Circle.label() = "a circle"\n\nval s: Shape = Circle()</code></pre>', options: ['"a circle"', '"a shape"', 'It does not compile: the call is ambiguous'], a: 1, why: 'Extensions are picked at compile time from the declared type, here Shape. Only members dispatch on the real object.' },
        ],
        deeper: [
          {
            title: 'The declared type picks the extension',
            body: `<p>Members are picked at runtime, from the object that is really there. Extensions are picked by the compiler, from the type the variable is <em>declared</em> as. So an extension never overrides another extension, even when the names match.</p>
<p>And when a member and an extension have the same signature, the member always wins. The IDE warns that the extension is shadowed.</p>`,
            code: `open class Shape { open fun name() = "Shape" }
class Circle : Shape() { override fun name() = "Circle" }

fun Shape.label() = "a shape"
fun Circle.label() = "a circle"

val s: Shape = Circle()
s.name()    // "Circle": member, runtime object
s.label()   // "a shape": extension, declared type`,
            visual(el) {
              const decls = [
                { src: 'val s: Shape = Circle()', declared: 'Shape', real: 'Circle' },
                { src: 'val s: Circle = Circle()', declared: 'Circle', real: 'Circle' },
                { src: 'val s: Shape = Shape()', declared: 'Shape', real: 'Shape' },
              ];
              let cur = decls[0], busy = false;
              const dType = h('span', { class: 'chip' });
              const rType = h('span', { class: 'chip' });
              const compile = h('div', { class: 'kt-zone' }, h('span', { class: 'kt-zone-title' }, 'compiler sees'), dType, h('span', { class: 'tip' }, 'decides extensions'));
              const runtime = h('div', { class: 'kt-zone' }, h('span', { class: 'kt-zone-title' }, 'runtime holds'), rType, h('span', { class: 'tip' }, 'decides members'));
              const o = out();
              const declButtons = decls.map(d => cmd(d.src, () => { if (busy) return; cur = d; paint(); }));
              function paint() {
                declButtons.forEach((b, i) => b.setAttribute('aria-pressed', decls[i] === cur));
                dType.textContent = cur.declared; rType.textContent = `${cur.real}()`;
                [compile, runtime].forEach(z => z.classList.remove('kt-d2-on'));
                say(o, `${hl(cur.src)} <span class="muted">// now call both</span>`);
              }
              async function callIt(member) {
                if (busy) return; busy = true;
                [compile, runtime].forEach(z => z.classList.remove('kt-d2-on'));
                const zone = member ? runtime : compile;
                zone.classList.add('kt-d2-on'); replay(zone, 'pop-soft');
                await sleep(450); if (!zone.isConnected) return;
                const r = member ? `"${cur.real}"` : (cur.declared === 'Circle' ? '"a circle"' : '"a shape"');
                say(o, `${hl(member ? 's.name()' : 's.label()')} = ${hl(r)} <span class="muted">// ${member ? 'member: chosen from the real object' : 'extension: chosen from the declared type'}</span>`);
                busy = false;
              }
              paint();
              el.append(
                h('div', { class: 'controls' }, declButtons),
                h('div', { class: 'stage' }, compile, runtime),
                h('div', { class: 'controls' }, cmd('s.name()', () => callIt(true)), cmd('s.label()', () => callIt(false))),
                o);
            },
          },
          {
            title: 'Nullable receivers and extension properties',
            body: `<p>An extension can be declared on a nullable type. Then you can call it on null without <code>?.</code>, and <code>this</code> may be null inside. <code>isNullOrBlank()</code> from the standard library works this way.</p>
<p>You can also declare extension properties. They have no backing field, so they can’t store anything: each one is a getter, and maybe a setter, in disguise.</p>`,
            code: `fun String?.orPlaceholder(): String =
    if (this.isNullOrBlank()) "Untitled" else this

val title: String? = null
title.orPlaceholder()           // "Untitled", no ?. needed

val String.wordCount: Int
    get() = split(" ").count { it.isNotBlank() }

"Hello Kotlin world".wordCount  // 3`,
            visual(el) {
              const inputs = [
                { label: 'null', v: null },
                { label: '""', v: '' },
                { label: '"   "', v: '   ' },
                { label: '"Notes"', v: 'Notes' },
              ];
              let busy = false;
              const track = h('div', { class: 'track' });
              const o = out();
              const buttons = inputs.map(x => cmd(`${x.label}.orPlaceholder()`, () => run(x)));
              async function run(x) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', inputs[i] === x));
                const st = ['this', 'isNullOrBlank()', 'result'].map(l => h('div', { class: 'station' }, h('span', { class: 'st-label' }, l)));
                track.replaceChildren(...st);
                const blank = x.v == null || x.v.trim() === '';
                const steps = [
                  [x.v == null ? 'null' : JSON.stringify(x.v), x.v == null],
                  [String(blank), false],
                  [blank ? '"Untitled"' : JSON.stringify(x.v), false],
                ];
                for (let i = 0; i < 3; i++) {
                  st[i].classList.add('on');
                  st[i].append(h('span', { class: 'token pop' + (steps[i][1] ? ' is-null' : '') }, steps[i][0]));
                  await sleep(480); if (!track.isConnected) return;
                }
                say(o, `${hl(`${x.label}.orPlaceholder()`)} = ${hl(steps[2][0])}${x.v == null ? ' <span class="muted">// called on null, no crash</span>' : ''}`);
                busy = false;
              }
              el.append(h('div', { class: 'controls' }, buttons), track, o);
              run(inputs[0]);
            },
          },
        ],
        underHood: {
          body: `<p>An extension compiles to a static function in a class named after its file. The receiver becomes the first parameter. <code>"hi".shout()</code> is really <code>StringExtKt.shout("hi")</code>, which is also how Java code calls it.</p>
<p>That explains every rule in this lesson. A static function can’t see private members, so neither can the extension. The compiler picks a static function from the types it knows, so the declared type decides. And the class itself never changes, so a member with the same signature is always found first.</p>`,
          code: `// StringExt.kt
fun String.shout(): String = uppercase() + "!"

// Roughly what the JVM sees (decompiled to Java)
public final class StringExtKt {
    public static final String shout(String $this$shout) {
        return $this$shout.toUpperCase(Locale.ROOT) + "!";
    }
}`,
        },
        mistakes: [
          { title: 'Naming an extension like a member', bad: 'class Price(val cents: Long) {\n    fun format() = "$cents ct"\n}\nfun Price.format() = "EUR " + cents / 100.0\n\nPrice(250).format()   // "250 ct": the member ran', good: 'fun Price.formatEuro() = "EUR " + cents / 100.0\n\nPrice(250).formatEuro()   // "EUR 2.5"', why: 'A member always beats an extension with the same signature, so this extension is never called. Give it a name the type doesn’t already use.' },
          { title: 'Public extensions on everyday types', bad: '// Utils.kt\nfun String.toUserId() = UserId(lowercase())', good: '// UserRepository.kt\nprivate fun String.toUserId() = UserId(lowercase())', why: 'A public extension on <code>String</code> shows up in autocomplete on every string in the module. Keep narrow helpers <code>private</code> or <code>internal</code>, next to the code that uses them.' },
        ],
        visual(el) {
          const exts = [
            { name: 'shout()', sig: 'fun String.shout() = uppercase() + "!"', f: s => JSON.stringify(s.toUpperCase() + '!') },
            { name: 'isPalindrome()', sig: 'fun String.isPalindrome() = this == reversed()', f: s => String(s === [...s].reverse().join('')) },
            { name: 'initials()', sig: 'fun String.initials() = split(" ").map { it.first() }.joinToString("")', f: s => JSON.stringify(s.split(' ').filter(Boolean).map(w => w[0]).join('')) },
          ];
          const input = h('input', { id: 'ext-receiver', value: 'level', spellcheck: 'false', autocomplete: 'off' });
          const members = h('div', { class: 'members' }, ['length', 'uppercase()', 'reversed()', 'split()', 'trim()'].map(m => h('span', { class: 'member' }, m)));
          const panel = h('div', { class: 'class-panel' },
            h('span', { class: 'class-title' }, 'String'),
            members,
            h('span', { class: 'tip' }, 'Dashed = your extension. The String class itself is untouched.'));
          const o = out('Pick an extension. The first tap declares it, then it runs.');
          const added = new Set();
          async function use(x) {
            if (!added.has(x.name)) {
              added.add(x.name);
              members.append(h('span', { class: 'member ext drop-in' }, x.name));
              say(o, hl(x.sig));
              await sleep(800);
            }
            say(o, `${hl(`${JSON.stringify(input.value)}.${x.name}`)} <span class="muted">→</span> ${hl(x.f(input.value))}`);
          }
          el.append(
            h('div', { class: 'stage' }, panel),
            h('label', { class: 'field-input', for: 'ext-receiver' }, 'Call it on', input),
            h('div', { class: 'controls' }, exts.map(x => cmd(x.name, () => use(x)))),
            o);
        },
        predict: {
          "q": "You declare <code>fun String.shout()</code>. What happens to the String class itself?",
          "options": [
            "It gains a new method",
            "Nothing: shout is a static function that takes the string",
            "Kotlin makes a hidden subclass of String"
          ],
          "a": 1,
          "why": "An extension compiles to a static function whose first parameter is the receiver. The class is never changed."
        },
        play: `fun String.shout(): String = uppercase() + "!"
fun String.isPalindrome(): Boolean = this == reversed()
fun String.initials(): String = split(" ").map { it.first() }.joinToString("")

open class Shape
class Circle : Shape()

fun Shape.label() = "a shape"
fun Circle.label() = "a circle"

fun main() {
    val word = "level"            // change "level" to "Kotlin"
    println(word.shout())
    println(word.isPalindrome())
    println("Ada Lovelace".initials())

    val s: Shape = Circle()
    println(s.label())            // chosen by the declared type, not the object
    println(Circle().label())
}`
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'scope',
        title: 'Scope functions',
        tagline: 'let, run, with, apply, also on one grid.',
        body: `
<p><code>let</code>, <code>run</code>, <code>with</code>, <code>apply</code> and <code>also</code> all do the same basic thing: run a block of code with an object in reach. They differ on just two questions.</p>
<p><b>How do you refer to the object inside the block?</b> As <code>it</code>, a lambda parameter, or as <code>this</code>, so you can call its members directly. <b>What comes back?</b> The block’s last expression, or the object itself.</p>
<p>Answer those two questions and you know which one you want. The grid below is the whole topic. Tap a function to see where it sits.</p>`,
        code: `val name = "Kotlin"
val len1 = name.let { it.length }         // 6
val len2 = name.run { length }            // 6
val len3 = with(name) { length }          // 6

val p = Person().apply { age = 30 }       // the Person
val q = p.also { println(it.age) }        // the same Person`,
        remember: 'let and also use it; run, with and apply use this. apply and also return the object; the rest return the block’s result.',
        level: 'intermediate',
        terms: [
          { term: 'Scope function', def: 'One of let, run, with, apply and also, which run a block with an object in reach.' },
          { term: 'apply', def: 'Runs a block with the object as this and returns the object, which suits configuring it.' },
          { term: 'let', def: 'Runs a block with the object as it and returns the block’s result, often after ?..' },
          { term: 'also', def: 'Runs a block with the object as it and returns the object, which suits side effects like logging.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Configure the Paint, then show the user only if there is one.', code: 'val paint = Paint().[[apply]] {\n    color = Color.RED\n    strokeWidth = 4f\n}\nuser?.[[let]] { show(it) }', why: '<code>apply</code> gives <code>this</code> and returns the Paint. <code>?.let</code> runs only when <code>user</code> is not null.' },
          { type: 'bug', prompt: 'One line has a type mismatch. Tap it.', code: 'val name = "Kotlin"\nval upper = name.let { it.uppercase() }\nval length: Int = name.also { it.length }\nprintln("$upper $length")', bug: 2, fix: 'val length: Int = name.let { it.length }', why: '<code>also</code> returns the object, a String, and ignores the block’s result. <code>let</code> returns the block’s result.' },
        ],
        quiz: [
          { q: 'Configure an object and keep it: <code>val tv = TextView(ctx).___ { text = "Hi" }</code>', options: ['<code>let</code>', '<code>apply</code>', '<code>run</code>'], a: 1, why: '<code>apply</code> gives you <code>this</code> (so <code>text = …</code> works) and returns the TextView.' },
          { q: 'Which returns the block’s result and calls the object <code>it</code>?', options: ['<code>also</code>', '<code>let</code>', '<code>with</code>'], a: 1, why: '<code>let</code>: <code>it</code> inside, last expression out.' },
          { q: '<code>val x = "abc".also { it.length }</code>. What is <code>x</code>?', options: ['<code>3</code>', '<code>"abc"</code>'], a: 1, why: '<code>also</code> always returns the object it was called on.' },
          { q: 'What is <code>r</code>?<pre class="code mini"><code>val r = 5.let { it * 2 }\n    .also { it + 1 }\n    .run { this + 3 }</code></pre>', options: ['13', '14', '16'], a: 0, why: 'let passes on 10. also passes on the object it got, 10, and drops it + 1. run returns 10 + 3.' },
          { q: 'What is <code>"0".toIntOrNull()?.takeIf { it in 1..65535 } ?: 8080</code>?', options: ['8080', '0', 'null'], a: 0, why: '0 is outside the range, so takeIf returns null and the Elvis supplies the fallback.' },
        ],
        deeper: [
          {
            title: 'Inside apply, this changes',
            body: `<p>A block that gets the object as <code>this</code> puts that object first when Kotlin looks up a bare name. Inside <code>toolbar.apply { }</code>, <code>title</code> means the Toolbar’s title, even when your Activity has one too. Local variables and parameters are still checked before any <code>this</code>.</p>
<p>So <code>title = title</code> inside the block reads the Toolbar’s title and writes it straight back. Nothing changes on screen. Use a local with a different name, or reach the outer object with a label: <code>this@MainActivity.title</code>.</p>`,
            code: `class MainActivity : AppCompatActivity() {
    fun setUp(toolbar: Toolbar, screenName: String) {
        toolbar.apply {
            title = title                     // toolbar.title = toolbar.title
            title = this@MainActivity.title   // what was meant
            subtitle = screenName             // parameter: found first
        }
    }
}`,
            visual(el) {
              const layers = [
                { name: 'locals', line: 'locals     screenName', has: ['screenName'] },
                { name: 'Toolbar', line: 'Toolbar    title, subtitle', has: ['title', 'subtitle', 'menu'] },
                { name: 'MainActivity', line: 'Activity   title, finish()', has: ['title', 'finish', 'viewModel'] },
                { name: 'top level', line: 'top level  println()', has: ['println'] },
              ];
              const exprs = [
                { src: 'title', key: 'title', note: 'the Toolbar’s own title, not the Activity’s' },
                { src: 'screenName', key: 'screenName', note: 'a parameter: locals are checked first' },
                { src: 'finish()', key: 'finish', note: 'Toolbar has no finish(), so the search goes outward' },
                { src: 'this@MainActivity.title', key: 'title', jump: 2, note: 'the label skips straight to the Activity' },
                { src: 'println("ok")', key: 'println', note: 'no receiver has it, so the top level does' },
              ];
              let busy = false;
              const rows = layers.map(l => h('div', { class: 'branch', html: hl(l.line) }));
              const head = h('div', { class: 'branch head' });
              const o = out();
              const buttons = exprs.map(x => cmd(x.src, () => find(x)));
              async function find(x) {
                if (busy) return; busy = true;
                buttons.forEach((b, i) => b.setAttribute('aria-pressed', exprs[i] === x));
                head.innerHTML = hl(`toolbar.apply { ${x.src} }`);
                rows.forEach(r => { r.className = 'branch'; });
                for (let i = 0; i < layers.length; i++) {
                  if (x.jump != null && i < x.jump) { rows[i].classList.add('skip'); continue; }
                  rows[i].classList.add('scan'); await sleep(420);
                  if (!head.isConnected) return;
                  rows[i].classList.remove('scan');
                  if (layers[i].has.includes(x.key)) {
                    rows[i].classList.add('hit');
                    rows.slice(i + 1).forEach(r => r.classList.add('skip'));
                    say(o, `${hl(x.src)} <span class="muted">→ ${layers[i].name}: ${x.note}</span>`);
                    break;
                  }
                  rows[i].classList.add('miss');
                }
                busy = false;
              }
              el.append(h('div', { class: 'controls' }, buttons), h('div', { class: 'when' }, head, rows), o);
              find(exprs[0]);
            },
          },
          {
            title: 'Watch what flows down a chain',
            body: `<p>Scope functions chain, and the return column of the grid decides what the next call receives. <code>let</code> and <code>run</code> pass on the block’s result. <code>also</code> and <code>apply</code> pass on the object they were called on, and whatever the block computed is dropped.</p>
<p>Swap one function in the chain below and watch which value reaches the end.</p>`,
            visual(el) {
              const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
              const steps = [
                { opts: ['let', 'also'], body: '{ it.trim() }', f: v => v.trim() },
                { opts: ['run', 'apply'], body: '{ replaceFirstChar { it.uppercase() } }', f: v => cap(v) },
                { opts: ['let', 'also'], body: '{ "Hi, $it" }', f: v => `Hi, ${v}` },
              ];
              const pick = [0, 0, 0];
              let busy = false;
              const code = h('div', { class: 'kt' });
              const track = h('div', { class: 'track' });
              const o = out();
              const fnOf = i => steps[i].opts[pick[i]];
              const toggles = steps.map((s, i) => cmd('', () => { if (busy) return; pick[i] = 1 - pick[i]; paint(); }));
              function paint() {
                toggles.forEach((b, i) => { b.innerHTML = hl(`.${fnOf(i)}`) + ' <span class="muted">⇄</span>'; b.setAttribute('aria-label', `Step ${i + 1}: ${fnOf(i)}, tap to swap`); });
                code.innerHTML = hl(`val greeting = "  ada  "\n${steps.map((s, i) => `    .${fnOf(i)} ${s.body}`).join('\n')}`);
                track.replaceChildren();
                say(o, 'Press Run chain.');
              }
              async function run() {
                if (busy) return; busy = true;
                const st = ['start', ...steps.map((s, i) => `.${fnOf(i)}`)].map(l => h('div', { class: 'station' }, h('span', { class: 'st-label' }, l)));
                track.replaceChildren(...st);
                let v = '  ada  ';
                st[0].classList.add('on');
                st[0].append(h('span', { class: 'token pop kt-d2-sc-pre' }, JSON.stringify(v)));
                await sleep(450); if (!track.isConnected) return;
                for (let i = 0; i < steps.length; i++) {
                  const res = steps[i].f(v);
                  const passes = pick[i] === 0;
                  st[i + 1].classList.add('on');
                  if (!passes) st[i + 1].append(h('span', { class: 'kt-type kt-d2-sc-drop kt-d2-sc-pre' }, `block: ${JSON.stringify(res)}`));
                  v = passes ? res : v;
                  st[i + 1].append(h('span', { class: 'token pop kt-d2-sc-pre' }, JSON.stringify(v)));
                  await sleep(600); if (!track.isConnected) return;
                }
                const right = v === 'Hi, Ada';
                say(o, `greeting = ${hl(JSON.stringify(v))} <span class="muted">// ${right ? 'every step passed its result on' : 'a dropped block result changed the outcome'}</span>`);
                busy = false;
              }
              paint();
              el.append(code, h('div', { class: 'controls' }, toggles, h('button', { class: 'btn primary small', onclick: run }, 'Run chain')), track, o);
              run();
            },
          },
          {
            title: 'takeIf: keep a value only if it passes',
            body: `<p><code>takeIf { }</code> returns the object when the condition holds and null when it doesn’t. <code>takeUnless</code> is the reverse. Followed by <code>?:</code>, it replaces a small if/else that only exists to pick a fallback.</p>`,
            code: `val port = input.toIntOrNull()?.takeIf { it in 1..65535 } ?: 8080

fun search(field: EditText) {
    val query = field.text.toString().trim().takeUnless { it.isEmpty() }
        ?: return                      // nothing to search
    viewModel.search(query)
}`,
          },
        ],
        underHood: {
          body: `<p>All five are tiny <code>inline</code> functions in the standard library. Their blocks are copied into your code, so no lambda object is created and a scope function costs nothing at runtime.</p>
<p>The difference between <code>this</code> and <code>it</code> is just the parameter type. <code>apply</code> takes <code>T.() -> Unit</code>, a lambda with receiver, so the object becomes <code>this</code>. <code>let</code> takes <code>(T) -> R</code>, a plain lambda, so the object arrives as <code>it</code>. Each one also declares a contract that its block runs exactly once, which is why you can assign a <code>val</code> inside one.</p>`,
          code: `// From the standard library
public inline fun <T> T.apply(block: T.() -> Unit): T {
    contract { callsInPlace(block, InvocationKind.EXACTLY_ONCE) }
    block()
    return this
}

public inline fun <T, R> T.let(block: (T) -> R): R {
    contract { callsInPlace(block, InvocationKind.EXACTLY_ONCE) }
    return block(this)
}`,
        },
        mistakes: [
          { title: 'Nesting let inside let', bad: 'user?.let { u ->\n    u.address?.let { a ->\n        a.city?.let { c -> showCity(c) }\n    }\n}', good: 'user?.address?.city?.let { showCity(it) }', why: 'A safe-call chain already stops at the first null. One <code>let</code> at the end is enough, and the code reads top to bottom again.' },
          { title: 'with on a nullable value', bad: 'val user: User? = repo.current()\nwith(user) {\n    println(name)   // error: user may be null\n}', good: 'val user: User? = repo.current()\nuser?.run {\n    println(name)\n}', why: '<code>with</code> is not an extension, so you can’t put <code>?.</code> in front of it, and inside the block <code>this</code> is still <code>User?</code>. <code>?.run</code> does the same job and skips the block on null.' },
        ],
        visual(el) {
          const fns = {
            let: { cell: 'it-r', src: 'val r = name.let { it.length }', ret: '6', tip: 'Use it for null checks and transforms: <code>user?.let { show(it) }</code>' },
            run: { cell: 'this-r', src: 'val r = name.run { length }', ret: '6', tip: 'Use it to compute a value from an object’s own members.' },
            with: { cell: 'this-r', src: 'val r = with(name) { length }', ret: '6', tip: 'Same as run, but not an extension: the object goes in the parentheses.' },
            apply: { cell: 'this-o', src: 'val r = Person().apply { age = 30 }', ret: 'Person(age=30)', tip: 'Use it to configure a new object, builder style.' },
            also: { cell: 'it-o', src: 'val r = person.also { log(it) }', ret: 'Person(age=30)', tip: 'Use it for side effects like logging, without breaking a chain.' },
          };
          const cells = {}, chips = {};
          const cell = (id, names) => (cells[id] = h('div', { class: 'cell' }, names.map(n => (chips[n] = h('button', { class: 'fn', onclick: () => pick(n) }, n)))));
          const grid = h('div', { class: 'scope-grid' },
            h('span'), h('span', { class: 'colhead' }, 'returns block result'), h('span', { class: 'colhead' }, 'returns the object'),
            h('span', { class: 'rowhead' }, h('code', {}, 'it')), cell('it-r', ['let']), cell('it-o', ['also']),
            h('span', { class: 'rowhead' }, h('code', {}, 'this')), cell('this-r', ['run', 'with']), cell('this-o', ['apply']));
          const o = out(), tip = h('p', { class: 'tip' });
          let seq = 0;
          async function pick(n) {
            const f = fns[n], my = ++seq;
            Object.values(cells).forEach(c => c.classList.remove('on'));
            Object.values(chips).forEach(c => c.classList.remove('on'));
            cells[f.cell].classList.add('on'); chips[n].classList.add('on');
            o.innerHTML = hl(f.src); tip.innerHTML = f.tip;
            await sleep(500);
            if (my === seq) o.append(h('div', { class: 'line drop-in', html: hl(`// r = ${f.ret}`) }));
          }
          el.append(grid, tip, o);
          pick('let');
        },
        predict: {
          "q": "Which scope function refers to the object as <code>it</code> and returns the object itself?",
          "options": [
            "let",
            "run",
            "apply",
            "also"
          ],
          "a": 3,
          "why": "<code>also</code> passes the object as <code>it</code> and hands the same object back, so it fits side effects like logging."
        },
        play: `class Person {
    var age = 0
    override fun toString() = "Person(age=$age)"
}

fun main() {
    val name = "Kotlin"
    println(name.let { it.length })        // it, returns the block result
    println(name.run { length })           // this, returns the block result
    println(with(name) { uppercase() })

    val p = Person().apply { age = 30 }    // this, returns the object
    println(p)
    val q = p.also { println("log: \${it.age}") }   // it, returns the object
    println(q === p)

    val r = 5.let { it * 2 }.also { it + 1 }.run { this + 3 }
    println(r)   // change .also to .let and run again
}`
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'sealed',
        title: 'Sealed classes',
        tagline: 'A closed set of cases the compiler can check.',
        body: `
<p>A <code>sealed</code> class or interface has a fixed list of subtypes, all declared in the same package and module. The compiler knows every possible case.</p>
<p>That pays off in <code>when</code>: cover every subtype and you need no <code>else</code>. Add a new subtype later and every <code>when</code> that forgot it stops compiling, so you can’t ship a screen that ignores the new state.</p>
<p>This is the standard way to model what an Android screen shows: loading, content, or an error. Tick the box below to forget a branch.</p>`,
        code: `sealed interface UiState {
    data object Loading : UiState
    data class Success(val items: List<String>) : UiState
    data class Error(val message: String) : UiState
}

fun render(state: UiState) = when (state) {
    UiState.Loading    -> showSpinner()
    is UiState.Success -> showList(state.items)
    is UiState.Error   -> showError(state.message)
}`,
        remember: 'sealed = a closed set of types. when can cover them all without else, and the compiler flags a missing case.',
        level: 'intermediate',
        terms: [
          { term: 'Sealed interface', def: 'An interface whose implementations are all known at compile time, declared in the same module and package.' },
          { term: 'Exhaustive when', def: 'A when that covers every possible case, so it needs no else and the compiler flags any missing one.' },
          { term: 'data object', def: 'A singleton with a readable generated toString, used for cases that carry no data.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the result type closed and match on its subtypes.', code: '[[sealed]] interface Result {\n    data class Ok(val value: String) : Result\n    data class Fail(val error: Throwable) : Result\n}\n\nfun show(r: Result) = when (r) {\n    [[is]] Result.Ok -> r.value\n    is Result.Fail -> r.error.message\n}', why: '<code>sealed</code> lets the compiler see both cases, so the <code>when</code> needs no <code>else</code>. <code>is</code> matches by type.' },
          { type: 'bug', prompt: 'The <code>when</code> fails to compile with “must be exhaustive”. Tap the line to fix.', code: 'interface UiState\ndata object Loading : UiState\ndata class Ready(val items: List<String>) : UiState\n\nfun title(s: UiState) = when (s) {\n    Loading -> "Loading"\n    is Ready -> "${s.items.size} items"\n}', bug: 0, fix: 'sealed interface UiState', why: 'A plain interface can have implementations anywhere, so the compiler can’t know the list is complete. <code>sealed</code> closes it.' },
        ],
        quiz: [
          { q: 'You add <code>data object Empty : UiState</code>. What happens to a <code>when</code> with no <code>else</code> that doesn’t handle it?', options: ['It compiles and skips Empty', 'It stops compiling until you add the branch', 'It crashes at runtime'], a: 1, why: 'The compiler knows every subtype, so it reports the missing case.' },
          { q: 'Inside <code>is UiState.Error -> …</code>, can you read <code>state.message</code>?', options: ['Yes, state is smart-cast to Error', 'No, you must cast it yourself'], a: 0, why: 'The <code>is</code> check smart-casts <code>state</code> inside that branch.' },
          { q: 'Error is a nested sealed interface with Offline and Server. Does this when compile?<pre class="code mini"><code>when (s) {\n    UiState.Loading -&gt; showSpinner()\n    is UiState.Success -&gt; showList(s.items)\n    UiState.Error.Offline -&gt; showOffline()\n}</code></pre>', options: ['Yes: every top-level case has a branch', 'No: UiState.Error.Server is not covered', 'Only with an else branch added at the top'], a: 1, why: 'The compiler checks down to every leaf. Add a Server branch, or one is UiState.Error branch for the whole group.' },
          { q: 'An existing enum NetworkFailure should become one case of Failure. How should you declare Failure?', options: ['<code>sealed interface Failure</code>', '<code>sealed class Failure</code>', '<code>abstract class Failure</code>'], a: 0, why: 'An enum class can’t extend another class, but it can implement an interface. A sealed interface lets the enum join the closed list.' },
        ],
        deeper: [
          {
            title: 'Group cases with a nested sealed type',
            body: `<p>A subtype of a sealed type can be sealed itself. <code>Error</code> below has two cases of its own. A <code>when</code> can handle the whole group with one <code>is UiState.Error</code> branch, handle each case on its own, or mix both.</p>
<p>The compiler checks down to every leaf. Tick branches below and see which leaf each one covers, and what is still missing.</p>`,
            code: `sealed interface UiState {
    data object Loading : UiState
    data class Success(val items: List<String>) : UiState
    sealed interface Error : UiState {
        data object Offline : Error
        data class Server(val code: Int) : Error
    }
}

fun render(s: UiState) = when (s) {
    UiState.Loading       -> showSpinner()
    is UiState.Success    -> showList(s.items)
    UiState.Error.Offline -> showOffline()
    is UiState.Error      -> showError(s)   // here: only Server is left
}`,
            visual(el) {
              const leaves = ['Loading', 'Success', 'Offline', 'Server'];
              const branches = [
                { src: 'UiState.Loading ->', covers: ['Loading'], on: true },
                { src: 'is UiState.Success ->', covers: ['Success'], on: true },
                { src: 'UiState.Error.Offline ->', covers: ['Offline'], on: false },
                { src: 'is UiState.Error.Server ->', covers: ['Server'], on: false },
                { src: 'is UiState.Error ->', covers: ['Offline', 'Server'], on: true },
                { src: 'else ->', covers: leaves, on: false },
              ];
              let busy = false;
              const pills = leaves.map(l => h('span', { class: 'kt-d2-se-leaf' }, l));
              const o = out();
              const boxes = branches.map((b, i) => {
                const input = h('input', { type: 'checkbox', id: `kt-d2-se-b${i}` });
                input.checked = b.on;
                input.addEventListener('change', () => { if (busy) { input.checked = b.on; return; } b.on = input.checked; check(false); });
                return h('label', { class: 'switch', for: `kt-d2-se-b${i}` }, input, h('span', {}, b.src));
              });
              const missingSrc = { Loading: 'UiState.Loading', Success: 'is UiState.Success', Offline: 'UiState.Error.Offline', Server: 'is UiState.Error.Server' };
              async function check(anim) {
                if (busy) return; busy = true;
                const used = new Set(), missing = [];
                for (let i = 0; i < leaves.length; i++) {
                  const k = branches.findIndex(b => b.on && b.covers.includes(leaves[i]));
                  pills[i].className = 'kt-d2-se-leaf ' + (k < 0 ? 'bad' : 'ok');
                  pills[i].textContent = k < 0 ? `${leaves[i]}: missing` : `${leaves[i]}: ${branches[k].src.replace(' ->', '')}`;
                  if (k < 0) missing.push(leaves[i]); else used.add(k);
                  if (anim) { replay(pills[i], 'pop'); await sleep(320); if (!o.isConnected) return; }
                }
                const idle = branches.map((b, i) => (b.on && !used.has(i) ? b.src.replace(' ->', '') : null)).filter(Boolean);
                if (missing.length) {
                  say(o, `<span class="bad">compile error:</span> 'when' expression must be exhaustive. Add the ${missing.map(m => `'${missingSrc[m]}'`).join(', ')} branch${missing.length > 1 ? 'es' : ''} or an 'else' branch.`);
                } else if (branches[5].on && idle.includes('else')) {
                  say(o, `<span class="good">compiles</span> <span class="muted">with a warning:</span> 'when' is exhaustive so 'else' is redundant here`);
                } else {
                  say(o, `<span class="good">compiles:</span> every leaf is covered${idle.length ? `. <span class="muted">${idle.join(', ')} can never match: earlier branches took its cases.</span>` : ''}`);
                }
                busy = false;
              }
              el.append(
                h('div', { class: 'kt-d2-se-boxes' }, boxes),
                h('div', { class: 'stage' }, h('div', { class: 'kt-pile' }, pills)),
                h('div', { class: 'controls' }, cmd('compile render()', () => check(true))),
                o);
              check(false);
            },
          },
          {
            title: 'else hides the case you add next',
            body: `<p>An <code>else</code> branch makes a <code>when</code> compile today and after every future change. That is exactly the problem. Add <code>Empty</code> to the sealed type, and the <code>when</code> with <code>else</code> still builds and quietly sends Empty down the wrong path. The exhaustive one stops the build and points at the gap.</p>
<p>Leave <code>else</code> out of a <code>when</code> over sealed and enum types, so the compiler can do this check for you.</p>`,
            visual(el) {
              let hasEmpty = false, bFixed = false, busy = false;
              const col = (name, lines) => {
                const rows = lines.map(l => h('div', { class: 'branch', html: '  ' + hl(l.src) }));
                const tag = h('span', { class: 'kt-tag open' }, 'builds');
                const res = h('div', { class: 'out', html: '<span class="muted">not rendered yet</span>' });
                const whenEl = h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('when (state) {') }), rows, h('div', { class: 'branch head' }, '}'));
                const wrap = h('div', { class: 'kt-d2-se-col' }, h('div', { class: 'kt-pile kt-d2-se-head' }, h('span', { class: 'kt-zone-title' }, name), tag), whenEl, res);
                return { wrap, rows, tag, res, lines, whenEl };
              };
              const A = col('with else', [
                { src: 'Loading    -> showSpinner()', m: 'Loading', screen: 'spinner' },
                { src: 'is Success -> showList()', m: 'Success', screen: 'the list' },
                { src: 'else       -> showError()', m: '*', screen: 'an error screen' },
              ]);
              const B = col('exhaustive', [
                { src: 'Loading    -> showSpinner()', m: 'Loading', screen: 'spinner' },
                { src: 'is Success -> showList()', m: 'Success', screen: 'the list' },
                { src: 'is Error   -> showError()', m: 'Error', screen: 'an error screen' },
              ]);
              const fixRow = h('div', { class: 'branch drop-in', html: '  ' + hl('Empty      -> showEmpty()') });
              const o = out();
              const builds = c => c === A || !hasEmpty || bFixed;
              function paint() {
                for (const c of [A, B]) {
                  const ok = builds(c);
                  c.tag.textContent = ok ? 'builds' : 'build failed';
                  c.tag.className = 'kt-tag ' + (ok ? 'open' : 'final');
                  c.rows.forEach(r => { r.className = 'branch'; });
                  fixRow.className = 'branch';
                }
              }
              async function scan(c, s) {
                c.res.replaceChildren();
                if (!builds(c)) {
                  replay(c.whenEl, 'shake');
                  c.res.innerHTML = '<span class="bad">compile error:</span> add the \'UiState.Empty\' branch';
                  return;
                }
                const rows = c === B && bFixed ? [...c.rows, fixRow] : c.rows;
                const lines = c === B && bFixed ? [...c.lines, { m: 'Empty', screen: 'the empty state' }] : c.lines;
                for (let i = 0; i < rows.length; i++) {
                  rows[i].classList.add('scan'); await sleep(330);
                  if (!o.isConnected) return;
                  rows[i].classList.remove('scan');
                  if (lines[i].m === s || lines[i].m === '*') {
                    rows[i].classList.add('hit');
                    const wrong = s === 'Empty' && lines[i].m === '*';
                    c.res.innerHTML = wrong ? `<span class="bad">shows ${lines[i].screen}</span> for an empty list` : `<span class="good">shows ${lines[i].screen}</span>`;
                    return;
                  }
                  rows[i].classList.add('miss');
                }
              }
              async function render(s) {
                if (busy) return;
                if (s === 'Empty' && !hasEmpty) { say(o, '<span class="bad">error:</span> Unresolved reference \'Empty\'. Add the subtype first.'); replay(o, 'shake'); return; }
                busy = true; paint();
                say(o, hl(`render(UiState.${s})`));
                await Promise.all([scan(A, s), scan(B, s)]);
                if (!o.isConnected) return;
                busy = false;
              }
              el.append(
                h('div', { class: 'controls' },
                  cmd('data object Empty : UiState', () => {
                    if (busy) return;
                    if (hasEmpty) { say(o, '<span class="muted">Empty is already there. Press Reset to start over.</span>'); return; }
                    hasEmpty = true; paint(); A.res.replaceChildren(); B.res.replaceChildren();
                    replay(B.whenEl, 'shake');
                    say(o, 'Added Empty. <span class="muted">The else version still builds. The exhaustive one stops.</span>');
                  }),
                  cmd('render(UiState.Empty)', () => render('Empty')),
                  cmd('render(UiState.Success)', () => render('Success')),
                  cmd('fix B: add the Empty branch', () => {
                    if (busy) return;
                    if (!hasEmpty) { say(o, '<span class="muted">Nothing to fix yet: add Empty first.</span>'); return; }
                    if (!bFixed) { bFixed = true; B.rows[2].after(fixRow); }
                    paint(); B.res.replaceChildren();
                    say(o, '<span class="good">B builds again</span> <span class="muted">and now has a real screen for Empty.</span>');
                  })),
                h('div', { class: 'kt-d2-se-pair' }, A.wrap, B.wrap),
                o);
              paint();
              say(o, 'Add the new subtype, then render it in both versions.');
            },
          },
          {
            title: 'Where subtypes can live',
            body: `<p>Subtypes don’t have to be nested inside the sealed type. They can sit in any file, as long as it is in the same module and the same package. Code in other modules, including libraries, can’t add one, which is what keeps the list closed.</p>
<p>Pick a <code>sealed class</code> when every case shares constructor state, like an id. Otherwise prefer a <code>sealed interface</code>: a class can implement several sealed interfaces, and an enum class or an object can join one too.</p>`,
            code: `// Event.kt
sealed class Event(val id: String)

// Clicks.kt: same package, same module
class Click(id: String, val x: Int, val y: Int) : Event(id)
class Scroll(id: String, val dy: Int) : Event(id)

sealed interface Failure
enum class NetworkFailure : Failure { TIMEOUT, OFFLINE }
data class HttpFailure(val code: Int) : Failure`,
          },
        ],
        underHood: {
          body: `<p>On the JVM a sealed class compiles to an abstract class, and a sealed interface to a plain interface. The closed list of subtypes is stored in Kotlin metadata. The compiler reads it to check every <code>when</code>, and with kotlin-reflect you can read it too, as <code>KClass.sealedSubclasses</code>.</p>
<p>An exhaustive <code>when</code> on a sealed type becomes a chain of <code>instanceof</code> and equality checks. The compiler still adds a hidden last branch that throws <code>NoWhenBranchMatchedException</code>. It can only fire if class files change after your code was compiled.</p>`,
          code: `// Kotlin
fun title(s: UiState) = when (s) {
    UiState.Loading    -> "Loading"
    is UiState.Success -> "Done"
    is UiState.Error   -> "Failed"
}

// Roughly what the JVM sees (decompiled to Java)
if (Intrinsics.areEqual(s, UiState.Loading.INSTANCE)) return "Loading";
if (s instanceof UiState.Success) return "Done";
if (s instanceof UiState.Error) return "Failed";
throw new NoWhenBranchMatchedException();`,
        },
        mistakes: [
          { title: 'A plain object as a state', bad: 'sealed interface UiState {\n    object Loading : UiState\n}\nLog.d(TAG, "state=$state")\n// state=UiState$Loading@6d06d69c', good: 'sealed interface UiState {\n    data object Loading : UiState\n}\nLog.d(TAG, "state=$state")\n// state=Loading', why: 'A plain <code>object</code> prints its class name and a hash. <code>data object</code> generates a readable <code>toString</code>, which makes logs and test failures clear.' },
          { title: 'Casting instead of matching', bad: 'val items = (state as UiState.Success).items', good: 'val items = (state as? UiState.Success)?.items.orEmpty()\n// or handle every case in a when', why: '<code>as</code> throws <code>ClassCastException</code> the moment the state is Loading or Error. <code>as?</code> gives null instead, and a <code>when</code> makes you decide what each case shows.' },
        ],
        visual(el) {
          const states = [
            { name: 'Loading', emit: 'UiState.Loading', line: 'UiState.Loading    -> showSpinner()' },
            { name: 'Success', emit: 'UiState.Success(items)', line: 'is UiState.Success -> showList(state.items)' },
            { name: 'Error', emit: 'UiState.Error("No connection")', line: 'is UiState.Error   -> showError(state.message)' },
          ];
          const rows = states.map(s => h('div', { class: 'branch', html: '    ' + hl(s.line) }));
          const drop = h('input', { type: 'checkbox', id: 'sealed-drop' });
          const phone = h('div', { class: 'phone', role: 'img', 'aria-label': 'Screen preview' });
          const o = out();
          let retrying = false;
          const screens = {
            Loading: () => [h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')],
            Success: () => ['Kotlin', 'Compose', 'Room'].map((x, i) => h('div', { class: 'item drop-in', style: `animation-delay:${i * 90}ms` }, x)),
            Error: () => [h('div', { class: 'err-icon' }, '!'), h('p', { class: 'phone-note' }, 'No connection'), h('button', { class: 'btn small', onclick: retry }, 'Retry')],
          };
          async function retry() {
            if (retrying) return; retrying = true;
            render(states[0]); await sleep(1300); render(states[1]);
            retrying = false;
          }
          function render(s) {
            rows.forEach((r, i) => r.classList.toggle('hit', !drop.checked && states[i] === s));
            if (drop.checked) {
              phone.replaceChildren(h('p', { class: 'build-fail' }, 'Build failed'));
              replay(phone, 'shake');
              say(o, `<span class="bad">compile error:</span> 'when' expression must be exhaustive. Add the 'is Error' branch or an 'else' branch.`);
              return;
            }
            phone.replaceChildren(...screens[s.name]());
            say(o, hl(`render(${s.emit})`));
          }
          drop.addEventListener('change', () => { rows[2].classList.toggle('cut', drop.checked); render(states[1]); });
          el.append(
            h('div', { class: 'controls' }, states.map(s => cmd(s.emit, () => render(s)))),
            h('div', { class: 'sealed-wrap' },
              h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('when (state) {') }), rows, h('div', { class: 'branch head' }, '}')),
              phone),
            h('label', { class: 'switch', for: 'sealed-drop' }, drop, 'Forget the Error branch'),
            o);
          render(states[1]);
        },
        predict: {
          "q": "You delete the <code>is UiState.Error</code> branch and there is no <code>else</code>. When do you find out?",
          "options": [
            "When an Error reaches the screen and the app crashes",
            "At build time: the when is no longer exhaustive",
            "Never: the screen just stays empty"
          ],
          "a": 1,
          "why": "The compiler knows every subtype of a sealed type, so it checks that a <code>when</code> used as an expression covers all of them."
        },
        play: `sealed interface UiState {
    data object Loading : UiState
    data class Success(val items: List<String>) : UiState
    data class Error(val message: String) : UiState
}

fun render(state: UiState): String = when (state) {
    UiState.Loading -> "spinner"
    is UiState.Success -> "list with \${state.items.size} items"
    is UiState.Error -> "error: \${state.message}"   // delete this line: the when stops compiling
}

fun main() {
    val states = listOf(
        UiState.Loading,
        UiState.Success(listOf("Kotlin", "Compose")),
        UiState.Error("No connection"),
    )
    for (s in states) println("$s -> \${render(s)}")
}`
      },

      // + exceptions ──────────────────────────────────
      {
        id: 'exceptions',
        title: 'Exceptions',
        tagline: 'throw, catch, and try as an expression.',
        body: `
<p><code>throw</code> stops the current function and travels up the call stack until a matching <code>catch</code> handles it. If nothing catches it, the app crashes. Catch the specific type you can handle, like <code>NumberFormatException</code>, not every <code>Exception</code>.</p>
<p><code>try</code> is an expression. Its value is the last line of the <code>try</code> block, or of the <code>catch</code> block when something was thrown. <code>finally</code> always runs, thrown or not, and doesn’t change the value. Kotlin has no checked exceptions: the compiler never forces you to catch anything.</p>
<p>Three standard helpers say what went wrong. <code>require(cond)</code> throws <code>IllegalArgumentException</code> for a bad argument. <code>check(cond)</code> throws <code>IllegalStateException</code> when the object is in the wrong state. <code>error("msg")</code> always throws <code>IllegalStateException</code>.</p>`,
        code: `fun parseAge(input: String): Int {
    val age = try {
        input.trim().toInt()
    } catch (e: NumberFormatException) {
        -1
    } finally {
        println("parsed '$input'")
    }
    require(age >= 0) { "Age must be a number, got '$input'" }
    return age
}

class Player {
    private var started = false
    fun start() { started = true }
    fun pause() {
        check(started) { "pause() called before start()" }
    }
}

fun fail(): Nothing = error("unreachable")   // IllegalStateException`,
        remember: 'try gives a value, finally always runs. require for bad arguments, check for bad state.',
        level: 'beginner',
        terms: [
          { term: 'try expression', def: 'A try/catch whose value is the last expression of the block that ran, so it can be assigned.' },
          { term: 'finally', def: 'A block after try/catch that always runs, whether or not an exception was thrown.' },
          { term: 'require', def: 'Throws IllegalArgumentException with your message when a condition about an argument is false.' },
          { term: 'check', def: 'Throws IllegalStateException with your message when a condition about the current state is false.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Parse the text, or use 0 when it is not a number.', code: 'val n = [[try]] {\n    text.toInt()\n} [[catch]] (e: NumberFormatException) {\n    0\n}', why: 'Because <code>try</code> is an expression, <code>n</code> gets the parsed number or the 0 from <code>catch</code>.' },
          { type: 'bug', prompt: 'A bad argument should throw IllegalArgumentException, but this throws IllegalStateException. Tap the line.', code: 'fun setVolume(level: Int) {\n    check(level in 0..100) { "level out of range: $level" }\n    player.volume = level\n}', bug: 1, fix: '    require(level in 0..100) { "level out of range: $level" }', why: '<code>check</code> is for the object’s state. A wrong value passed in by the caller is an argument problem, so use <code>require</code>.' },
        ],
        quiz: [
          { q: '<code>val x = try { "7".toInt() } catch (e: Exception) { 0 } finally { println("end") }</code>. What is <code>x</code>?', options: ['<code>7</code>', '<code>0</code>', '<code>Unit</code>'], a: 0, why: 'Nothing was thrown, so the value comes from the try block. finally runs but doesn’t change the value.' },
          { q: 'Does Kotlin force you to catch <code>IOException</code>?', options: ['Yes, like Java', 'No, Kotlin has no checked exceptions'], a: 1, why: 'Every exception is unchecked in Kotlin. You decide where to handle it.' },
          { q: 'What does <code>require(false)</code> throw?', options: ['<code>IllegalStateException</code>', '<code>IllegalArgumentException</code>', 'Nothing'], a: 1, why: '<code>require</code> is for arguments. <code>check</code> and <code>error</code> throw IllegalStateException.' },
          { q: 'What does this print?<pre class="code mini"><code>fun b() { try { error("x") } finally { print("B") } }\nfun a() { try { b() } finally { print("A") } }\n\ntry { a() } catch (e: Exception) { print("C") }</code></pre>', options: ['ABC', 'BAC', 'C'], a: 1, why: 'The exception climbs from b() to a() to the caller. Each finally runs on the way out, innermost first, and the catch runs last.' },
        ],
        deeper: [
          {
            title: 'An exception climbs the call stack',
            body: `<p>When code throws, the current function stops on that line. If it has no matching <code>catch</code>, its caller stops too, and so on up the stack, until some frame catches it. Every <code>finally</code> on the way still runs.</p>
<p>If no frame catches it, the thread dies. On Android an uncaught exception on the main thread crashes the whole app. Catch where you can do something useful, like showing a message, not as deep as possible. Move the <code>catch</code> below and throw again.</p>`,
            code: `fun onSaveClicked() {
    try {
        val profile = loadProfile()
        show(profile)
    } catch (e: NumberFormatException) {
        showMessage("Age must be a number")
    }
}

fun loadProfile() = Profile(age = parseAge(field.text))

fun parseAge(text: String): Int {
    try {
        return text.toInt()             // throws on "abc"
    } finally {
        log("parse done")
    }
}`,
            visual(el) {
              const frames = [
                { src: '"abc".toInt()', name: 'toInt' },
                { src: 'parseAge(text)', name: 'parseAge', fin: true },
                { src: 'loadProfile()', name: 'loadProfile' },
                { src: 'onSaveClicked()', name: 'onSaveClicked' },
              ];
              const places = [
                { label: 'catch in parseAge', at: 1 },
                { label: 'catch in onSaveClicked', at: 3 },
                { label: 'no catch', at: -1 },
              ];
              let place = places[1], busy = false;
              const rows = frames.map(() => h('div', { class: 'branch' }));
              const stack = h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('// call stack, newest on top') }), rows);
              const log = h('div', { class: 'out', 'aria-live': 'polite' });
              const o = out();
              const placeBtns = places.map(p => cmd(p.label, () => { if (busy) return; place = p; paint(); say(o, 'Press Throw.'); }));
              const tag = (t, cls = '') => `<span class="kt-d2-ex-tag ${cls}">${t}</span>`;
              function paint() {
                placeBtns.forEach((b, i) => b.setAttribute('aria-pressed', places[i] === place));
                frames.forEach((f, i) => {
                  rows[i].className = 'branch';
                  rows[i].innerHTML = hl(f.src) + (place.at === i ? ' ' + tag('try/catch', 'ok') : '') + (f.fin ? ' ' + tag('finally') : '');
                });
                log.replaceChildren();
              }
              const print = t => log.append(h('div', { class: 'line drop-in' }, t));
              async function run() {
                if (busy) return; busy = true;
                paint();
                for (let i = frames.length - 1; i >= 0; i--) {
                  rows[i].classList.add('kt-on');
                  say(o, `<span class="muted">calling ${frames[i].name}...</span>`);
                  await sleep(330); if (!log.isConnected) return;
                }
                rows[0].classList.replace('kt-on', 'kt-err'); replay(rows[0], 'shake');
                say(o, '<span class="bad">throws</span> NumberFormatException: For input string: "abc"');
                await sleep(650); if (!log.isConnected) return;
                for (let i = 1; i < frames.length; i++) {
                  if (place.at === i) {
                    rows[i].classList.replace('kt-on', 'hit');
                    print(`${frames[i].name}: catch runs`);
                    if (frames[i].fin) print(`${frames[i].name}: finally runs, "parse done"`);
                    say(o, i === 1
                      ? '<span class="good">handled in parseAge.</span> <span class="muted">It returns a fallback and the frames below carry on normally.</span>'
                      : '<span class="good">handled in onSaveClicked:</span> “Age must be a number”. <span class="muted">parseAge and loadProfile stopped mid-way.</span>');
                    busy = false; return;
                  }
                  rows[i].classList.replace('kt-on', 'kt-err');
                  if (frames[i].fin) print(`${frames[i].name}: finally runs, "parse done"`);
                  else print(`${frames[i].name}: stops, the rest of it is skipped`);
                  replay(rows[i], 'shake');
                  await sleep(550); if (!log.isConnected) return;
                }
                print('FATAL EXCEPTION: main');
                say(o, '<span class="bad">crash:</span> nothing caught it, so the main thread dies and the app closes.');
                busy = false;
              }
              paint();
              say(o, 'Pick where the catch lives, then throw.');
              el.append(
                h('div', { class: 'controls' }, placeBtns),
                stack,
                h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Throw from toInt()')),
                o, log);
            },
          },
          {
            title: 'throw is an expression of type Nothing',
            body: `<p><code>throw</code> can go anywhere a value is expected, most often after <code>?:</code>. Its type is <code>Nothing</code>, a type with no values, which tells the compiler that the code after it never runs. That is why <code>name</code> below is a plain <code>String</code>.</p>
<p>A function that declares <code>Nothing</code> as its return type, like <code>error()</code> or your own <code>fail()</code>, works the same way. <code>requireNotNull</code> and <code>checkNotNull</code> go one step further: after the call, the compiler treats the checked value as non-null.</p>`,
            code: `fun greet(raw: String?) {
    val name = raw ?: throw IllegalArgumentException("name missing")
    println(name.length)              // name is a String here
}

fun fail(message: String): Nothing = throw IllegalStateException(message)

val token: String? = prefs.getString("token", null)
requireNotNull(token) { "not logged in" }
api.call(token)                       // smart cast to String`,
          },
        ],
        underHood: {
          body: `<p>A <code>try</code> block costs nothing while nothing is thrown. The compiler records which range of bytecode each <code>catch</code> covers in the method’s exception table, and the JVM only reads that table when something is actually thrown. Throwing is the expensive part, mostly because an exception records the whole stack trace when it is created.</p>
<p>The code in <code>finally</code> is copied onto every way out of the block: the normal end, each <code>catch</code>, and a hidden catch-all that runs it and rethrows. Kotlin has no checked exceptions, so Java callers can only catch a checked exception from your function if you declare it with <code>@Throws</code>.</p>`,
          code: `// Kotlin, Config.kt
@Throws(IOException::class)
fun readConfig(file: File): String = file.readText()

// Java can now catch it
try {
    String text = ConfigKt.readConfig(file);
} catch (IOException e) {
    // without @Throws, javac rejects this catch
}`,
        },
        mistakes: [
          { title: 'Returning from finally', bad: 'fun save(): Boolean {\n    try {\n        db.write(data)\n        return true\n    } finally {\n        return false\n    }\n}', good: 'fun save(): Boolean {\n    try {\n        db.write(data)\n        return true\n    } finally {\n        db.close()   // clean up only\n    }\n}', why: 'A <code>return</code> in <code>finally</code> replaces the result of the <code>try</code>, and it also throws away any exception in flight. This function always returns false and hides every failure.' },
          { title: 'Catching the broad type first', bad: 'try {\n    upload(file)\n} catch (e: Exception) {\n    showError("Something went wrong")\n} catch (e: IOException) {\n    showError("Check your connection")\n}', good: 'try {\n    upload(file)\n} catch (e: IOException) {\n    showError("Check your connection")\n} catch (e: Exception) {\n    showError("Something went wrong")\n}', why: 'Catch blocks are tried top to bottom and the first matching type wins. <code>Exception</code> matches an <code>IOException</code> too, so the specific block can never run.' },
          { title: 'printStackTrace on Android', bad: 'catch (e: IOException) {\n    e.printStackTrace()\n}', good: 'catch (e: IOException) {\n    Log.w(TAG, "Upload failed", e)\n    _state.update { it.copy(error = R.string.upload_failed) }\n}', why: '<code>printStackTrace</code> writes to <code>System.err</code>, which lands in logcat with no tag of yours, and the user sees nothing. Log with a tag and the exception, and put the failure into the screen state.' },
        ],
        visual(el) {
          const src = [
            'val age = try {',
            '    input.trim().toInt()',
            '} catch (e: NumberFormatException) {',
            '    -1',
            '} finally {',
            '    println("parsed")',
            '}',
            'require(age >= 0) { "Age must be a number" }',
          ];
          const rows = src.map(s => h('div', { class: 'branch', html: hl(s) }));
          const well = h('div', { class: 'slot' });
          const con = h('div', { class: 'out', 'aria-live': 'polite' });
          const o = out();
          let busy = false;
          const inputs = ['"42"', '" 7 "', '"abc"', '"-3"'];
          const mark = async (i, cls = 'kt-on', ms = 420) => { rows[i].classList.add(cls); await sleep(ms); return rows[0].isConnected; };
          async function run(lit) {
            if (busy) return; busy = true;
            rows.forEach(r => { r.className = 'branch'; });
            well.replaceChildren(); con.replaceChildren();
            const text = JSON.parse(lit), t = text.trim();
            const ok = /^-?\d+$/.test(t);
            const value = ok ? parseInt(t, 10) : -1;
            say(o, hl(`val input = ${lit}`));
            if (!await mark(0)) return;
            if (!await mark(1)) return;
            if (ok) {
              rows[2].classList.add('kt-off'); rows[3].classList.add('kt-off');
              swap(well, String(value));
              say(o, `try block finished with ${hl(String(value))}, catch is skipped`);
              if (!await mark(1, 'kt-on', 500)) return;
            } else {
              rows[1].classList.add('kt-err'); replay(rows[1], 'shake');
              say(o, `<span class="bad">throws</span> NumberFormatException: For input string: ${lit}`);
              if (!await mark(1, 'kt-err', 700)) return;
              if (!await mark(2)) return;
              if (!await mark(3)) return;
              swap(well, '-1');
              say(o, `catch block gives ${hl('-1')}`);
            }
            if (!await mark(4)) return;
            if (!await mark(5)) return;
            con.append(h('div', { class: 'line drop-in' }, 'parsed'));
            if (!await mark(6)) return;
            if (value < 0) {
              rows[7].classList.add('kt-err'); replay(rows[7], 'shake');
              say(o, '<span class="bad">crash:</span> IllegalArgumentException: Age must be a number');
            } else {
              await mark(7);
              say(o, `<span class="good">ok:</span> age = ${value}  <span class="muted">// finally ran either way</span>`);
            }
            busy = false;
          }
          swap(well, '42');
          say(o, 'Pick an input and follow the path it takes.');
          el.append(
            h('div', { class: 'controls' }, inputs.map(lit => cmd(`input = ${lit}`, () => run(lit)))),
            h('div', { class: 'sealed-wrap' },
              h('div', { class: 'when' }, rows),
              h('div', { class: 'box val' }, h('span', { class: 'box-tag', html: hl('age') }), well)),
            o, con);
        },
        predict: {
          "q": "The input is <code>\"abc\"</code>. Which blocks run?",
          "options": [
            "try, then catch, then finally, and then require fails",
            "try, then finally: catch is skipped",
            "try, then catch: finally is skipped after a throw"
          ],
          "a": 0,
          "why": "<code>toInt()</code> throws, so catch gives -1. finally always runs. Then <code>require(age >= 0)</code> throws IllegalArgumentException."
        },
        play: `fun parseAge(input: String): Int {
    val age = try {
        input.trim().toInt()
    } catch (e: NumberFormatException) {
        -1
    } finally {
        println("parsed '$input'")
    }
    require(age >= 0) { "Age must be a number, got '$input'" }
    return age
}

fun main() {
    for (input in listOf("42", " 7 ", "abc")) {   // add "-3" to the list
        try {
            println("age = \${parseAge(input)}")
        } catch (e: IllegalArgumentException) {
            println("caught: \${e.message}")
        }
    }
}`
      },
    ],
  });
})();
