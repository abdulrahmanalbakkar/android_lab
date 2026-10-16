/* OOP basics track. Same shape as tracks/kotlin.js.
   Principles, not syntax: Kotlin class/interface syntax lives in the Kotlin track. SOLID lives in tracks/solid.js.
   Demo styles live in the css string below; every class is prefixed oo-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const kt = src => h('div', { class: 'kt', html: hl(src) });
  const pill = (text, cls = '') => h('span', { class: `oo-pill ${cls}` }, text);
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  const css = `
.oo-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 14px; min-width: 0; }
.oo-card { display: grid; gap: 10px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, opacity 0.25s; }
.oo-card.oo-on { border-color: var(--accent); }
.oo-card.oo-bad { border-color: var(--err); }
.oo-card.oo-good { border-color: var(--ok); }
.oo-card.oo-warn { border-color: var(--warm); }
.oo-card.oo-dim { opacity: 0.5; }
.oo-title { font: 700 0.9rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.oo-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.oo-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.oo-pill { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: opacity 0.25s, border-color 0.25s, background 0.25s; }
.oo-pill.oo-acc { border-color: var(--accent); background: var(--accent-soft); }
.oo-pill.oo-warn { border-color: var(--warm); background: var(--warm-soft); }
.oo-pill.oo-err { border-color: var(--err); background: var(--err-soft); }
.oo-pill.oo-ok { border-color: var(--ok); background: var(--ok-soft); }
.oo-pill.oo-ghost { border-style: dashed; border-color: var(--muted); color: var(--muted); background: transparent; }
.oo-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.oo-stat b { color: var(--ink); }
.oo-flash { animation: oo-flash 0.8s ease-out; }
@keyframes oo-flash { from { box-shadow: 0 0 0 6px var(--accent-soft); background: var(--accent-soft); } }
.oo-code { display: grid; background: var(--code-bg); border-radius: 12px; padding: 10px; overflow-x: auto; min-width: 0; }
.oo-line { font: 500 0.82rem/1.6 var(--mono); color: var(--code-ink); white-space: pre; padding: 1px 8px; border-radius: 6px; border: 1px solid transparent; transition: background 0.2s, border-color 0.2s; }
.oo-line.oo-cur { background: rgba(255, 212, 121, 0.14); border-color: var(--t-f); }
.oo-line.oo-ln-ok { background: rgba(158, 223, 165, 0.15); border-color: var(--t-k); }
.oo-line.oo-ln-err { background: rgba(255, 138, 155, 0.18); border-color: var(--t-e); }
.oo-label.oo-raw { text-transform: none; letter-spacing: 0; }
.kt.oo-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
.oo-switches { display: flex; flex-wrap: wrap; gap: 4px 16px; }

/* 1 encapsulation */
.oo-vault { display: grid; gap: 8px; padding: 10px; border-radius: 10px; border: 2px dashed var(--accent); background: var(--surface); min-width: 0; }
.oo-vault.oo-open { border-color: var(--err); }
.oo-items { display: flex; flex-wrap: wrap; gap: 6px; min-height: 34px; align-items: center; }

/* 2 composition */
.oo-tree { display: grid; gap: 6px; min-width: 0; }
.oo-node { font: 500 0.78rem var(--mono); padding: 5px 9px; border-radius: 8px; background: var(--surface); border: 1.5px solid var(--line); overflow-wrap: anywhere; min-width: 0; transition: border-color 0.25s, background 0.25s; }
.oo-node.oo-sub { margin-left: 18px; position: relative; }
.oo-node.oo-sub::before { content: ""; position: absolute; left: -12px; top: 50%; width: 9px; border-top: 1.5px solid var(--line); }
.oo-node.oo-cur { border-color: var(--accent); background: var(--accent-soft); }
.oo-node.oo-hot { border-color: var(--warm); background: var(--warm-soft); }

/* 3 polymorphism */
.oo-impls { display: grid; gap: 8px; min-width: 0; }
.oo-impl { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 500 0.78rem var(--mono); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.oo-impl b { overflow-wrap: anywhere; }
.oo-impl.oo-hit { border-color: var(--accent); background: var(--accent-soft); }
.oo-impl .oo-sent { color: var(--muted); min-height: 1.4em; overflow-wrap: anywhere; }
/* depth pass 2: encapsulation, composition, abstraction */
.oo-enc-grid { display: grid; gap: 6px; min-width: 0; }
.oo-enc-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) auto; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 10px; background: var(--surface); border: 1.5px solid var(--line); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.oo-enc-row .kt { padding: 4px 8px; font-size: 0.78rem; }
.oo-enc-row.oo-enc-yes { border-color: var(--ok); }
.oo-enc-row.oo-enc-no { border-color: var(--err); background: var(--err-soft); }
@media (max-width: 600px) { .oo-enc-row { grid-template-columns: minmax(0, 1fr) auto; } .oo-enc-row .kt { grid-column: 1 / -1; grid-row: 2; } }
.phone.oo-cps-phone { justify-content: flex-start; align-items: stretch; height: 250px; gap: 6px; }
.phone.oo-cps-phone .item { font-size: 0.8rem; padding: 7px 9px; }
.oo-cps-bar { font: 700 0.72rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; overflow-wrap: anywhere; }
.oo-cps-spin { align-self: center; margin-top: 36px; width: 28px; height: 28px; border-radius: 50%; border: 4px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.7s linear infinite; }
/* depth pass 3: objects, identity, inheritance, delegation, choosing, cohesion, domain */
.oo-obj-heap { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap: 10px; min-width: 0; min-height: 60px; align-items: start; }
.oo-obj { display: grid; gap: 6px; padding: 10px; border-radius: 12px; border: 2px solid var(--accent); background: var(--surface); min-width: 0; }
.oo-obj-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; align-items: center; min-width: 0; }
.oo-obj-field { font: 500 0.8rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.oo-id-buckets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; min-width: 0; }
.oo-id-bucket { display: grid; gap: 6px; align-content: start; justify-items: start; min-height: 64px; padding: 6px; border-radius: 10px; border: 1.5px dashed var(--line); background: var(--surface); min-width: 0; }
.oo-id-bucket .oo-label { font-size: 0.65rem; }
.oo-id-list { display: grid; gap: 6px; min-width: 0; align-content: start; }
.oo-id-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px; padding: 8px 10px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--surface); min-width: 0; transition: opacity 0.4s, transform 0.4s; }
.oo-id-row.oo-id-gone { opacity: 0; transform: translateX(30px); }
.oo-inh-trace { max-height: 230px; overflow-y: auto; }
.oo-inh-trace .oo-line, .oo-dlg-log .oo-line, .oo-id-list + .oo-code .oo-line { white-space: pre-wrap; overflow-wrap: anywhere; }
.oo-dlg-stack { min-width: 0; }
.oo-dlg-layer { display: grid; gap: 6px; padding: 8px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.oo-dlg-layer .oo-dlg-layer { background: var(--surface); }
.oo-dlg-layer .oo-dlg-layer .oo-dlg-layer { background: var(--bg); }
.oo-dlg-layer.oo-dlg-core { border-style: dashed; }
.oo-dlg-layer.oo-dlg-hot { border-color: var(--accent); background: var(--accent-soft); }
.oo-dlg-head { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; min-width: 0; }
.oo-dlg-head .oo-title { font-size: 0.78rem; }
.oo-dlg-log { max-height: 240px; overflow-y: auto; align-content: start; }
.oo-ia-qs { display: grid; gap: 2px; }
.oo-ia-q { align-items: flex-start; font-weight: 500; }
.oo-ia-row { grid-template-columns: minmax(0, 1fr) auto; }
.oo-coh-grid { display: grid; gap: 3px; align-items: center; min-width: 0; }
.oo-coh-f { writing-mode: vertical-rl; transform: rotate(180deg); font: 600 0.68rem var(--mono); color: var(--muted); justify-self: center; padding: 2px 0; transition: color 0.2s; }
.oo-coh-f.oo-coh-hotf { color: var(--err); }
.oo-coh-m { font: 500 0.7rem var(--mono); overflow-wrap: anywhere; min-width: 0; padding: 2px 4px; border-radius: 6px; }
.oo-coh-m.oo-coh-hotm { background: var(--err-soft); }
.oo-coh-cell { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 5px; background: var(--surface); }
.oo-coh-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--ink); transition: background 0.3s, transform 0.3s; }
.oo-coh-dot.oo-coh-hotd { background: var(--err); transform: scale(1.3); }
.oo-coh-dot.oo-coh-g0 { background: var(--accent); }
.oo-coh-dot.oo-coh-g1 { background: var(--ok); }
.oo-coh-dot.oo-coh-g2 { background: var(--warm); }
.oo-coh-dot.oo-coh-g3 { background: var(--muted); }
.oo-coh-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 10px; min-width: 0; }
.oo-card.oo-coh-cls { gap: 6px; padding: 10px; background: var(--bg); }
.oo-card.oo-coh-b0 { border-color: var(--accent); }
.oo-card.oo-coh-b1 { border-color: var(--ok); }
.oo-card.oo-coh-b2 { border-color: var(--warm); }
.oo-card.oo-coh-b3 { border-color: var(--muted); }
.oo-coh-mods { display: grid; gap: 6px; min-width: 0; }
.oo-dom-spec { margin: 0; line-height: 2; font-size: 0.95rem; overflow-wrap: anywhere; }
.oo-dom-word { font: inherit; font-weight: 600; color: var(--ink); background: var(--warm-soft); border: 1.5px dashed var(--warm); border-radius: 6px; padding: 0 5px; cursor: pointer; }
.oo-dom-word:hover { border-style: solid; }
.oo-dom-word.oo-dom-done { background: var(--ok-soft); border: 1.5px solid var(--ok); }
.oo-dom-model { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 10px; min-width: 0; }
.oo-card.oo-dom-card { gap: 8px; padding: 10px; }
.oo-dom-card .kt { font-size: 0.78rem; }
`;

  Lab.addTrack({
    id: 'oop',
    title: 'OOP basics',
    description: 'How to think in objects: identity, encapsulation, polymorphism, inheritance versus composition, abstraction, cohesion and domain modelling, with Kotlin and Android examples.',
    group: 'Foundations',
    requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'objects',
        title: 'Objects: state, behaviour, identity',
        tagline: 'A class is the blueprint. Each object has its own data, its own methods and its own identity.',
        level: 'beginner',
        body: `
<p>An object bundles three things. <em>State</em> is the data it holds right now, like an article's title and like count. <em>Behaviour</em> is what it can do, its methods, which read and change that state. <em>Identity</em> means it is one particular thing in memory, separate from every other object, even one with the same data.</p>
<p>A class describes the shape. It holds no article data by itself. Each call like <code>Article("Derbi 2-2")</code> builds a new <em>instance</em> with its own copy of the state. Liking one article does not touch another.</p>
<p>A variable does not contain the object. It holds a <em>reference</em> to it. <code>val c = a</code> copies the reference, so <code>a</code> and <code>c</code> are two names for one object. Build a few objects below and watch which ones change.</p>`,
        code: `class Article(val title: String) {      // the blueprint
    var likes = 0                         // state
        private set

    fun like() { likes++ }                // behaviour that changes the state
    fun isPopular() = likes >= 100        // behaviour that reads it
}

val a = Article("Derbi 2-2")              // instance 1
val b = Article("Derbi 2-2")              // instance 2, same data, different object
val c = a                                 // no new object: a second reference

c.like()
println(a.likes)   // 1: a and c point to the same object
println(b.likes)   // 0: b is a different object`,
        remember: 'State plus the methods that use it, in one object. Variables hold references, not objects.',
        terms: [
          { term: 'Object (instance)', def: 'One concrete thing built from a class, with its own state and identity.' },
          { term: 'State', def: 'The values an object’s properties hold at a given moment.' },
          { term: 'Behaviour', def: 'The methods an object offers, which read or change its state.' },
          { term: 'Reference', def: 'What a variable holds: a pointer to an object, not the object itself. Copying it gives another name for the same object.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>b</code> a second name for the article <code>a</code>, so the like shows up through <code>a</code>.', code: 'val a = [[Article]]("Derbi 2-2")\nval b = [[a]]\nb.like()\nprintln(a.likes)   // 1', why: '<code>Article(...)</code> builds an object. <code>val b = a</code> copies only the reference, so both names reach the same object.' },
          { type: 'bug', prompt: 'Two counters should count separately, but <code>first.count</code> prints 1. Tap the line that causes it.', code: 'class Counter {\n    var count = 0\n    fun inc() { count++ }\n}\nval first = Counter()\nval second = first\nsecond.inc()\nprintln(first.count)   // expected 0', bug: 5, fix: 'val second = Counter()', why: '<code>val second = first</code> creates no object. Call the constructor to get a second, independent counter.' },
        ],
        quiz: [
          { q: '<code>val x = Article("A")</code> then <code>val y = x</code>. How many Article objects exist?', options: ['Two', 'One, with two references to it', 'None until you call a method'], a: 1, why: 'Only a constructor call builds an object. Assigning copies the reference.' },
          { q: 'Where does the data of an article live?', options: ['In the class', 'In each object', 'In the variable'], a: 1, why: 'The class only describes the shape. Each instance holds its own values, and a variable points at one instance.' },
          { q: '<code>val a = Article("A")</code>. Can you call <code>a.like()</code> and change its likes?', options: ['No, a is a val', 'Yes: val fixes the reference, not the object'], a: 1, why: '<code>val</code> means <code>a</code> always points at the same object. Whether that object can change depends on its own properties.' },
        ],
        deeper: [
          {
            title: 'Tell the object, don’t ask for its data',
            body: `<p>When a decision only needs an object's own data, put the method on the object. Code that pulls fields out and decides elsewhere spreads the rule across many screens, and each copy can drift.</p>
<p>Here the paywall rule lives in <code>Article</code>. The list screen, the detail screen and the share sheet all ask the same question the same way.</p>`,
            code: `// Asking: every caller re-implements the rule
if (article.isPremium && !user.hasSubscription && article.freeViewsLeft == 0) showPaywall()

// Telling: the object that owns the data decides
class Article(/* ... */) {
    fun canBeReadBy(user: User): Boolean =
        !isPremium || user.hasSubscription || freeViewsLeft > 0
}

if (!article.canBeReadBy(user)) showPaywall()`,
          },
          {
            title: 'Passing an object passes the reference',
            body: `<p>A function parameter gets a copy of the reference, never a copy of the object. If the function changes the object, the caller sees it. Kotlin parameters are always read-only, so the function can't point the caller's variable somewhere else, but it can still change what is inside.</p>
<p>That is why it pays to make objects that cross layers immutable. A <code>data class</code> with only <code>val</code> properties can be passed anywhere without surprises.</p>`,
            code: `class Draft(var title: String)

fun clean(d: Draft) {
    d.title = d.title.trim()     // changes the caller's object
    // d = Draft("x")            // error: parameters are val
}

val draft = Draft("  Derbi 2-2 ")
clean(draft)
println("[" + draft.title + "]")   // [Derbi 2-2]`,
          },
          {
            title: 'An object lives while something points to it',
            body: `<p>Nobody frees objects by hand on Android. The garbage collector removes an object once nothing reachable refers to it any more. So an object's lifetime is decided by who holds references to it.</p>
<p>This is how memory leaks happen. A singleton that keeps a reference to an Activity keeps the whole screen, its views and their bitmaps alive after the user leaves it. Hold the application context, or better, don't hold a context in long-lived objects at all.</p>`,
            code: `object ImageCache {
    var context: Context? = null      // set from an Activity: leaks it
}

// Better: keep only the application context, which lives as long as the app
class ImageCache(context: Context) {
    private val appContext = context.applicationContext
}`,
          },
        ],
        underHood: {
          body: `<p>On the JVM, <code>Article("Derbi")</code> compiles to three steps: allocate memory for a new object on the heap, then call its constructor (<code>&lt;init&gt;</code>) to fill in the fields. The variable gets a reference to that heap object.</p>
<p>Each object stores its own fields plus a small header the runtime uses for things like its class. Methods are not copied into each object. They live once with the class, and a call passes the object in as <code>this</code>.</p>`,
          code: `// Kotlin
val a = Article("Derbi")

// Bytecode, simplified
NEW Article                    // allocate, fields zeroed
DUP
LDC "Derbi"
INVOKESPECIAL Article.<init>(String)   // run the constructor
ASTORE a                       // a now holds the reference`,
        },
        mistakes: [
          { title: 'Thinking val freezes the object', bad: 'class Settings { var darkMode = false }\n\nval settings = Settings()\nsettings.darkMode = true   // compiles: the object changed', good: 'data class Settings(val darkMode: Boolean = false)\n\nval settings = Settings()\nval dark = settings.copy(darkMode = true)', why: '<code>val</code> only stops the variable from pointing elsewhere. To make the object itself unchangeable, give it <code>val</code> properties.' },
          { title: 'Data in one class, behaviour in a helper', bad: 'class Article(var likes: Int)\n\nobject ArticleUtils {\n    fun like(a: Article) { a.likes++ }\n    fun isPopular(a: Article) = a.likes >= 100\n}', good: 'class Article {\n    var likes = 0\n        private set\n    fun like() { likes++ }\n    fun isPopular() = likes >= 100\n}', why: 'Splitting state from the methods that use it forces the state to be public, and anyone can change it without going through the rules.' },
        ],
        visual(el) {
          const ADDR = ['@1a2f', '@7c40'];
          let objs = [], vars = {}, busy = false;
          const cls = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'the class: shape only, no data'),
            kt('class Article(val title: String) {\n    var likes = 0\n    fun like() { likes++ }\n}'));
          const heap = h('div', { class: 'oo-obj-heap' });
          const o = out('');
          function paint(hot) {
            heap.replaceChildren();
            if (!objs.length) { heap.append(h('span', { class: 'tip' }, 'No objects yet. The class alone holds no titles or likes.')); return; }
            objs.forEach(ob => {
              const refs = Object.keys(vars).filter(v => vars[v] === ob);
              const box = h('div', { class: `oo-obj${hot === ob ? ' oo-flash' : ''}` },
                h('div', { class: 'oo-obj-head' }, h('span', { class: 'oo-title' }, `Article ${ob.addr}`), h('span', { class: 'oo-row' }, refs.length ? refs.map(r => pill(r, 'oo-acc')) : pill('no refs', 'oo-ghost'))),
                h('div', { class: 'oo-obj-field', html: hl(`title = "${ob.title}"`) }),
                h('div', { class: 'oo-obj-field', html: hl(`likes = ${ob.likes}`) }));
              heap.append(box);
              if (hot === ob) replay(box, 'pop');
            });
          }
          function declare(name, make) {
            if (busy) return;
            if (vars[name]) { replay(heap, 'shake'); say(o, `<span class="bad">compile error:</span> Conflicting declarations: val ${name}`); return; }
            const r = make();
            if (!r) return;
            vars[name] = r.obj; paint(r.obj); say(o, r.msg);
          }
          const newObj = name => () => {
            const ob = { addr: ADDR[objs.length], title: 'Derbi 2-2', likes: 0 };
            objs.push(ob);
            return { obj: ob, msg: `${hl(`val ${name} = Article("Derbi 2-2")`)} <span class="muted">→</span> <span class="good">new object ${ob.addr}</span> <span class="muted">with its own likes</span>` };
          };
          const alias = () => {
            if (!vars.a) { replay(heap, 'shake'); say(o, `<span class="bad">compile error:</span> Unresolved reference 'a'. Declare it first.`); return null; }
            return { obj: vars.a, msg: `${hl('val c = a')} <span class="muted">→ no new object. c points at</span> ${vars.a.addr}<span class="muted">, the same one as a.</span>` };
          };
          function like(name) {
            if (busy) return;
            const ob = vars[name];
            if (!ob) { replay(heap, 'shake'); say(o, `<span class="bad">compile error:</span> Unresolved reference '${name}'.`); return; }
            ob.likes++; paint(ob);
            const others = Object.keys(vars).filter(v => v !== name && vars[v] === ob);
            const diff = Object.keys(vars).filter(v => vars[v] !== ob);
            say(o, `${hl(`${name}.like()`)} <span class="muted">→</span> ${ob.addr}.likes = ${ob.likes}` +
              (others.length ? ` <span class="good">${others.join(', ')} see${others.length > 1 ? '' : 's'} it too: same object.</span>` : '') +
              (diff.length ? ` <span class="muted">${diff.join(', ')} unchanged: another object.</span>` : ''));
          }
          paint();
          say(o, 'Build objects, alias one, then like them through different names.');
          el.append(
            cls,
            h('div', { class: 'controls' }, cmd('val a = Article("Derbi 2-2")', () => declare('a', newObj('a'))), cmd('val b = Article("Derbi 2-2")', () => declare('b', newObj('b'))), cmd('val c = a', () => declare('c', alias))),
            h('span', { class: 'oo-label' }, 'objects in memory'),
            heap,
            h('div', { class: 'controls' }, ['a', 'b', 'c'].map(n => cmd(`${n}.like()`, () => like(n)))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'identity',
        title: 'Identity vs equality',
        tagline: 'Same object, or same value? === asks the first, == asks the second.',
        level: 'beginner',
        body: `
<p>Two questions sound alike but are not. <em>Identity</em>: are these the same object in memory? Kotlin asks it with <code>===</code>. <em>Equality</em>: do these two objects mean the same thing? Kotlin asks it with <code>==</code>, which calls <code>equals()</code>.</p>
<p>A plain class inherits <code>equals()</code> from <code>Any</code>, and that version only checks identity. Two <code>Tag("kotlin")</code> objects are then not equal. A <code>data class</code> generates <code>equals()</code> and <code>hashCode()</code> from its constructor properties, so the same two tags are equal.</p>
<p>Hash-based collections ask <code>hashCode()</code> first to pick a bucket, then <code>equals()</code> inside it. So the rule is: equal objects must return the same hash code. Break it and a <code>HashSet</code> keeps “duplicates”. Switch the class below and run each check.</p>`,
        code: `class Tag(val name: String)                 // equals = identity
data class Label(val name: String)          // equals = same name

val a = Tag("kotlin"); val b = Tag("kotlin")
a == b        // false: Any.equals compares identity
a === b       // false: two objects

val x = Label("kotlin"); val y = Label("kotlin")
x == y        // true: generated equals compares name
x === y       // false: still two objects
hashSetOf(x, y).size   // 1

// Lists on screen ask both questions
object ArticleDiff : DiffUtil.ItemCallback<Article>() {
    override fun areItemsTheSame(old: Article, new: Article) = old.id == new.id   // same item?
    override fun areContentsTheSame(old: Article, new: Article) = old == new      // same content?
}`,
        remember: '=== asks “same object?”, == asks “same value?”. Override equals and hashCode together, or use a data class.',
        terms: [
          { term: 'Referential equality (===)', def: 'True only when both references point to the same object.' },
          { term: 'Structural equality (==)', def: 'Calls equals() to decide whether two objects mean the same value.' },
          { term: 'equals/hashCode contract', def: 'If two objects are equal, their hashCode() results must be equal too, or hash-based collections misbehave.' },
          { term: 'Stable key', def: 'A value, usually an id, that names one item for its whole life, used by lists to track items across updates.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tell DiffUtil how to recognise the same article, and when its row needs a rebind.', code: 'override fun areItemsTheSame(old: Article, new: Article) =\n    old.[[id]] == new.id\noverride fun areContentsTheSame(old: Article, new: Article) =\n    old [[==]] new', why: 'Same item means same id, even if the title changed. Same content is full equality, which a data class gives you.' },
          { type: 'bug', prompt: '<code>ArticleId("42") in read</code> prints <code>false</code>. Tap the line that breaks the contract.', code: 'class ArticleId(val raw: String) {\n    override fun equals(other: Any?) =\n        other is ArticleId && other.raw == raw\n    override fun hashCode() = System.identityHashCode(this)\n}\nval read = hashSetOf(ArticleId("42"))\nprintln(ArticleId("42") in read)', bug: 3, fix: '    override fun hashCode() = raw.hashCode()', why: 'The two ids are equal but hash to different buckets, so the set never compares them. Hash from the same fields equals uses.' },
        ],
        quiz: [
          { q: '<code>class User(val id: Int)</code>. What is <code>User(1) == User(1)</code>?', options: ['true', 'false'], a: 1, why: 'A plain class inherits equals() from Any, which compares identity. These are two objects.' },
          { q: 'Which pair is correct for DiffUtil?', options: ['areItemsTheSame: ==, areContentsTheSame: id', 'areItemsTheSame: id, areContentsTheSame: ==', 'both: ==='], a: 1, why: 'Items match by a stable id. Then full equality decides whether the row must be redrawn.' },
          { q: 'You override equals() but not hashCode(). What breaks first?', options: ['== between two objects', 'HashSet and HashMap lookups', 'toString()'], a: 1, why: '== uses only equals(). Hash collections look in a bucket chosen by hashCode() first, so equal objects can be missed.' },
        ],
        deeper: [
          {
            title: 'Writing equals by hand: the contract',
            body: `<p>Most of the time a data class is the answer. When you do write <code>equals()</code>, it must be reflexive (<code>a == a</code>), symmetric (if <code>a == b</code> then <code>b == a</code>), transitive, consistent over time, and false for <code>null</code>. And <code>hashCode()</code> must use the same fields.</p>
<p>The signature matters. <code>==</code> only calls <code>equals(other: Any?)</code>. A method named <code>equals(other: Tag)</code> is just an overload, and <code>==</code> ignores it.</p>`,
            code: `class Tag(val name: String) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true          // fast path: identity
        if (other !is Tag) return false          // also handles null
        return name.equals(other.name, ignoreCase = true)
    }
    override fun hashCode() = name.lowercase().hashCode()   // same rule as equals
}

Tag("Kotlin") == Tag("kotlin")             // true
hashSetOf(Tag("Kotlin"), Tag("kotlin")).size   // 1`,
          },
          {
            title: 'Same item, new content: DiffUtil',
            body: `<p>A list adapter must tell an <em>edited</em> item from a <em>different</em> item. DiffUtil asks <code>areItemsTheSame</code> first. If that says yes, it asks <code>areContentsTheSame</code> to decide whether to rebind the row.</p>
<p>Compare items with full equality and every edit looks like “old item removed, new item inserted”. The row animates out and back in and loses its state. Give an article a like below with each rule.</p>`,
            visual(el) {
              const base = [{ id: 1, title: 'Metro hattı açıldı', likes: 4 }, { id: 2, title: 'Derbi 2-2 bitti', likes: 10 }, { id: 3, title: 'Cuma yağmur var', likes: 1 }];
              let list = base.map(x => ({ ...x })), rule = 'id', busy = false;
              const rows = h('div', { class: 'oo-id-list' });
              const ops = h('div', { class: 'oo-code' });
              const o = out('');
              const ruleLine = h('div', { class: 'kt oo-wrap' });
              const btns = [cmd('old.id == new.id', () => setRule('id')), cmd('old == new', () => setRule('eq'))];
              function paint() {
                rows.replaceChildren(...list.map(a => { const r = h('div', { class: 'oo-id-row' }, h('span', { class: 'oo-title' }, a.title), pill(`♥ ${a.likes}`)); r.dataset.id = a.id; return r; }));
                ruleLine.innerHTML = hl(`override fun areItemsTheSame(old: Article, new: Article) =\n    ${rule === 'id' ? 'old.id == new.id' : 'old == new'}`);
                press(btns, btns[rule === 'id' ? 0 : 1]);
              }
              function setRule(r) { if (busy) return; rule = r; paint(); ops.replaceChildren(); say(o, 'Now give article 2 a like.'); }
              async function likeTwo() {
                if (busy) return; busy = true;
                const next = list.map(a => a.id === 2 ? { ...a, likes: a.likes + 1 } : a);
                ops.replaceChildren();
                const row = [...rows.children].find(r => r.dataset.id === '2');
                const line = (t, cls = '') => ops.append(h('div', { class: `oo-line ${cls} drop-in`, html: hl(t) }));
                if (rule === 'id') {
                  line('areItemsTheSame(2, 2) = true');
                  await sleep(350); if (!el.isConnected) return;
                  line('areContentsTheSame = false  // likes changed', 'oo-cur');
                  await sleep(350); if (!el.isConnected) return;
                  list = next; row.lastChild.textContent = `♥ ${list[1].likes}`; row.classList.add('oo-flash'); replay(row.lastChild, 'pop');
                  line('notifyItemChanged(1)', 'oo-ln-ok');
                  say(o, '<span class="good">one change:</span> the same row is rebound in place. Scroll position and row state stay.');
                } else {
                  line('areItemsTheSame(old 2, new 2) = false  // likes differ');
                  await sleep(350); if (!el.isConnected) return;
                  row.classList.add('oo-id-gone');
                  line('notifyItemRemoved(1)', 'oo-ln-err');
                  await sleep(500); if (!el.isConnected) return;
                  list = next; paint();
                  const fresh = [...rows.children].find(r => r.dataset.id === '2'); fresh.classList.add('drop-in');
                  line('notifyItemInserted(1)', 'oo-ln-err');
                  say(o, '<span class="bad">remove + insert:</span> DiffUtil thinks this is a different article. The row animates out and in, and any state in it is gone.');
                }
                busy = false;
              }
              function reset() { if (busy) return; list = base.map(x => ({ ...x })); paint(); ops.replaceChildren(); say(o, 'Likes reset.'); }
              paint();
              say(o, 'Pick a rule for areItemsTheSame, then submit a list where article 2 has one more like.');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'same item if'), btns),
                ruleLine,
                h('div', { class: 'oo-pair' }, rows, ops),
                h('div', { class: 'controls' }, cmd('submitList(newList)', likeTwo), act('Reset likes', reset)),
                o);
            },
          },
          {
            title: 'Compose keys are identity for rows',
            body: `<p>A <code>LazyColumn</code> ties each item's remembered state to its position by default. Insert an article at the top and every row's state shifts by one. A <code>key</code> tells Compose which item is which, so state moves with the item.</p>
<p>The key must be stable and unique, so use the id, not the index or the whole object. Its type must also be one <code>Bundle</code> can store, such as a <code>String</code>, <code>Long</code> or <code>Int</code>, so that <code>rememberSaveable</code> inside the row can be restored.</p>`,
            code: `LazyColumn {
    items(articles, key = { it.id }) { article ->   // id: same item across updates
        var expanded by rememberSaveable { mutableStateOf(false) }
        ArticleRow(article, expanded, onToggle = { expanded = !expanded })
    }
}`,
          },
          {
            title: 'Value classes have no identity',
            body: `<p>A <code>value class</code> may be stored as the bare underlying value in one place and as a wrapper object in another. Asking “same object?” has no stable answer, so Kotlin forbids <code>===</code> on value classes. Only <code>==</code> is allowed.</p>
<p>That is a hint about modelling. An id or an amount of money has no identity of its own: two equal ones are interchangeable. An article does have identity, which its id stands for.</p>`,
            code: `@JvmInline
value class ArticleId(val raw: String)

val a = ArticleId("42"); val b = ArticleId("42")
a == b      // true
a === b     // compile error: identity is not defined for value classes`,
          },
        ],
        underHood: {
          body: `<p><code>a == b</code> compiles to a null-safe call: <code>a?.equals(b) ?: (b === null)</code>. <code>===</code> compiles to a direct reference comparison, one JVM instruction (<code>if_acmpne</code>). For a type that is a primitive at runtime, like <code>Int</code>, <code>===</code> behaves the same as <code>==</code>.</p>
<p>A data class's generated <code>hashCode()</code> combines each constructor property's hash as <code>result * 31 + next</code>. Properties declared in the class body are left out of both <code>equals()</code> and <code>hashCode()</code>.</p>`,
          code: `data class Label(val name: String, val color: Int)

// generated, simplified
override fun hashCode(): Int {
    var result = name.hashCode()
    result = result * 31 + color.hashCode()
    return result
}
override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (other !is Label) return false
    return name == other.name && color == other.color
}`,
        },
        mistakes: [
          { title: 'An array inside a data class', bad: 'data class Gallery(val urls: Array<String>)\n\nGallery(arrayOf("a.jpg")) == Gallery(arrayOf("a.jpg"))   // false', good: 'data class Gallery(val urls: List<String>)\n\nGallery(listOf("a.jpg")) == Gallery(listOf("a.jpg"))     // true', why: 'Arrays don’t override <code>equals()</code>, so the generated check compares array identity. Use a <code>List</code>, or compare arrays with <code>contentEquals()</code>.' },
          { title: 'An equals overload instead of an override', bad: 'class Tag(val name: String) {\n    fun equals(other: Tag) = name == other.name\n}\nTag("a") == Tag("a")   // false', good: 'class Tag(val name: String) {\n    override fun equals(other: Any?) = other is Tag && other.name == name\n    override fun hashCode() = name.hashCode()\n}', why: '<code>==</code> only calls <code>equals(other: Any?)</code>. A method with another parameter type is a separate overload and never runs.' },
          { title: 'Using the position as a list key', bad: 'items(articles.size, key = { index -> index }) { i ->\n    ArticleRow(articles[i])\n}', good: 'items(articles, key = { it.id }) { article ->\n    ArticleRow(article)\n}', why: 'An index names a slot, not an article. After an insert, every row’s key points at a different article and state lands on the wrong row.' },
        ],
        visual(el) {
          const jhash = s => { let x = 0; for (const ch of s) x = (Math.imul(31, x) + ch.charCodeAt(0)) | 0; return x; };
          const KINDS = {
            plain: { src: 'class Tag(val name: String)', eq: false, sameHash: false },
            data: { src: 'data class Tag(val name: String)', eq: true, sameHash: true },
            half: { src: 'class Tag(val name: String) {\n    override fun equals(o: Any?) =\n        o is Tag && o.name == name\n    // no hashCode()\n}', eq: true, sameHash: false },
          };
          const IDH = { a: 0x1b6d3586, b: 0x4554617c };
          let kind = 'plain', busy = false;
          const decl = h('div', { class: 'kt oo-wrap' });
          const card = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'the class'), decl,
            kt('val a = Tag("kotlin")\nval b = Tag("kotlin")\nval c = a'));
          const hashes = h('div', { class: 'oo-row' });
          const buckets = h('div', { class: 'oo-id-buckets' });
          const o = out('');
          const kBtns = [['plain', 'class'], ['data', 'data class'], ['half', 'equals only']].map(([k, label]) => act(label, () => { if (busy) return; kind = k; paint(); say(o, k === 'half' ? 'equals() compares names, but hashCode() is still the identity hash. Try the set.' : 'Run the checks.'); }));
          const hashOf = v => KINDS[kind].sameHash ? jhash('kotlin') : IDH[v];
          function paint() {
            press(kBtns, kBtns[Object.keys(KINDS).indexOf(kind)]);
            decl.innerHTML = hl(KINDS[kind].src);
            hashes.replaceChildren(pill(`a.hashCode() = ${hashOf('a')}`), pill(`b.hashCode() = ${hashOf('b')}`), pill('c is a', 'oo-ghost'));
            card.className = `oo-card ${kind === 'half' ? 'oo-warn' : 'oo-on'}`;
            buckets.replaceChildren(...[0, 1, 2, 3].map(i => h('div', { class: 'oo-id-bucket' }, h('span', { class: 'oo-label' }, `bucket ${i}`))));
          }
          const show = (expr, val, note, good) => say(o, `${hl(expr)} <span class="muted">→</span> <span class="${good ? 'good' : 'bad'}">${val}</span> <span class="muted">${note}</span>`);
          function check(op) {
            if (busy) return;
            const k = KINDS[kind];
            if (op === 'ac') show('a === c', 'true', 'c holds the same reference as a', true);
            if (op === 'ab') show('a === b', 'false', 'two constructor calls, two objects. Always.', false);
            if (op === 'eq') show('a == b', String(k.eq), k.eq ? 'equals() compares the names' : 'Any.equals() only checks identity', k.eq);
          }
          async function toSet() {
            if (busy) return; busy = true;
            paint();
            const bs = buckets.children;
            const place = async (v) => {
              const i = hashOf(v) & 3;
              await sleep(350); if (!el.isConnected) return null;
              return i;
            };
            const ia = await place('a'); if (ia == null) return;
            bs[ia].append(pill('a', 'oo-acc drop-in'));
            say(o, `${hl('hashSetOf(a, b)')} <span class="muted">→ a.hashCode() picks bucket ${ia}</span>`);
            const ib = await place('b'); if (ib == null) return;
            if (ib === ia) {
              const k = KINDS[kind];
              await sleep(250); if (!el.isConnected) return;
              if (k.eq) { const p = pill('b', 'oo-ghost drop-in'); bs[ib].append(p); replay(bs[ib], 'pop'); say(o, `${hl('hashSetOf(a, b).size')} <span class="muted">→</span> <span class="good">1</span> <span class="muted">same bucket, then a.equals(b) is true, so b is a duplicate and is dropped</span>`); }
              else { bs[ib].append(pill('b', 'oo-acc drop-in')); say(o, `${hl('hashSetOf(a, b).size')} <span class="muted">→ 2</span>`); }
            } else {
              bs[ib].append(pill('b', `${kind === 'half' ? 'oo-err' : 'oo-acc'} drop-in`));
              if (kind === 'half') { replay(buckets, 'shake'); say(o, `${hl('hashSetOf(a, b).size')} <span class="muted">→</span> <span class="bad">2, even though a == b</span> <span class="muted">b landed in bucket ${ib}, so equals() was never asked. The contract is broken.</span>`); }
              else say(o, `${hl('hashSetOf(a, b).size')} <span class="muted">→</span> 2 <span class="muted">different buckets, and they aren’t equal anyway: two distinct tags</span>`);
            }
            busy = false;
          }
          paint();
          say(o, 'Pick how Tag is declared, then compare a, b and c.');
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'Tag is a'), kBtns),
            card, hashes,
            h('div', { class: 'controls' }, cmd('a === c', () => check('ac')), cmd('a === b', () => check('ab')), cmd('a == b', () => check('eq')), cmd('hashSetOf(a, b).size', toSet)),
            h('span', { class: 'oo-label' }, 'hashSetOf buckets, simplified to 4'),
            buckets, o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'encapsulation',
        title: 'Encapsulation',
        tagline: 'Hide the state. Expose a read-only view and a few safe methods.',
        level: 'beginner',
        body: `
<p>Encapsulation means a class owns its state. Outside code can read it, but only the class's own methods can change it. Those methods are where the rules live, like "a cart holds at most 3 items".</p>
<p>In Kotlin the usual pattern is a <em>backing property</em>: a <code>private</code> mutable value, plus a public read-only view of it. A ViewModel keeps a <code>private val _state = MutableStateFlow(...)</code> and exposes <code>val state: StateFlow</code>. A plain class keeps a private <code>MutableList</code> and exposes a <code>List</code>.</p>
<p>A read-only view is a promise at compile time. If callers need a snapshot that can never change under them, return <code>_items.toList()</code>. Flip the switch below to see what goes wrong when the mutable list leaks out.</p>`,
        code: `class CartViewModel : ViewModel() {
    private val _items = MutableStateFlow<List<Item>>(emptyList())
    val items: StateFlow<List<Item>> = _items.asStateFlow()

    fun add(item: Item) {
        if (_items.value.size >= MAX_ITEMS) return   // the rule lives here
        _items.update { it + item }
    }

    companion object { const val MAX_ITEMS = 3 }
}

class Playlist {
    private val _songs = mutableListOf<Song>()
    val songs: List<Song> get() = _songs   // read-only view

    fun add(song: Song) { if (song !in _songs) _songs += song }
}`,
        remember: 'Private mutable inside, read-only view outside. Every change goes through a method that checks the rules.',
        terms: [
          { term: 'Encapsulation', def: 'Keeping a class’s state private so that only its own methods can change it.' },
          { term: 'Backing property', def: 'A private mutable property, often named with an underscore, that a public read-only property exposes.' },
          { term: 'Invariant', def: 'A rule about an object’s state that must always hold, such as a cart never holding more than three items.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hide the mutable list and expose a read-only view.', code: 'class Playlist {\n    [[private]] val _songs = mutableListOf<Song>()\n    val songs: [[List]]<Song> get() = _songs\n}', why: 'The <code>private</code> list can only be changed inside <code>Playlist</code>. The public type <code>List</code> has no <code>add</code> or <code>remove</code>.' },
          { type: 'bug', prompt: 'A screen calls <code>vm.items.value = emptyList()</code> and wipes the cart. Tap the line that allows it.', code: 'class CartViewModel : ViewModel() {\n    private val _items = MutableStateFlow<List<Item>>(emptyList())\n    val items: MutableStateFlow<List<Item>> = _items\n\n    fun add(item: Item) {\n        _items.update { it + item }\n    }\n}', bug: 2, fix: '    val items: StateFlow<List<Item>> = _items.asStateFlow()', why: 'Typing the public property as <code>MutableStateFlow</code> hands out write access. Expose <code>StateFlow</code>, and use <code>asStateFlow()</code> so callers can’t cast it back.' },
        ],
        quiz: [
          { q: 'Why expose <code>StateFlow</code> instead of <code>MutableStateFlow</code> from a ViewModel?', options: ['StateFlow is faster', 'Only the ViewModel should be able to change the state', 'Compose can’t collect a MutableStateFlow'], a: 1, why: 'The read-only type lets the UI observe the state while every change still goes through the ViewModel’s methods.' },
          { q: '<code>val songs: List&lt;Song&gt; get() = _songs</code>. Can the list a caller holds change later?', options: ['No, List is immutable', 'Yes, it is a read-only view of the same MutableList'], a: 1, why: '<code>List</code> only hides the write methods. The object behind it is still <code>_songs</code>. Return <code>_songs.toList()</code> for a frozen snapshot.' },
          { q: 'Where should a rule like “at most 3 items” live?', options: ['In every screen that adds items', 'In the method of the class that owns the items', 'In a comment'], a: 1, why: 'If only the owning class can change the list, its <code>add</code> method is the one place the rule has to be checked.' },
        ],
        deeper: [
          {
            title: 'private set: one value, read-only from outside',
            body: `<p>A backing property is the tool for collections and flows. For a single value there is a shorter form: a public <code>var</code> with a <code>private set</code>. Everyone can read it, and only the class can assign it.</p>
<p>The rule still lives in a method. Here <code>withdraw()</code> refuses to go below zero, and no caller can skip it by writing <code>balance = -50</code>.</p>`,
            code: `class Wallet {
    var balance: Long = 0
        private set

    fun deposit(cents: Long) {
        require(cents > 0)
        balance += cents
    }

    fun withdraw(cents: Long): Boolean {
        if (cents > balance) return false   // the rule
        balance -= cents
        return true
    }
}

wallet.balance           // ok: anyone can read it
wallet.balance = -50     // error: the setter is private in 'Wallet'`,
          },
          {
            title: 'Four levels of visibility',
            body: `<p>Kotlin has four visibility modifiers. <code>private</code> means inside this class, or inside this file for a top-level declaration. <code>protected</code> adds subclasses. <code>internal</code> means anywhere in the same Gradle module. <code>public</code> is the default and means everywhere.</p>
<p>Unlike Java, <code>protected</code> does not open a member to the rest of the package. In a multi-module app, <code>internal</code> is how a <code>:feature:cart</code> module keeps its helpers away from <code>:app</code>. Pick a modifier for <code>reset()</code> and see who may call it.</p>`,
            visual(el) {
              const MODS = ['private', 'protected', 'internal', 'public'];
              const CALLERS = [
                { where: 'inside Cart', src: 'fun clearAll() = reset()', rank: 0 },
                { where: 'subclass PromoCart, same module', src: 'fun expire() = reset()', rank: 1 },
                { where: 'CartScreen.kt in :feature:cart', src: 'cart.reset()', rank: 2 },
                { where: 'MainActivity.kt in :app', src: 'cart.reset()', rank: 3 },
              ];
              let mod = 'private', busy = false;
              const decl = h('div', { class: 'kt' });
              const rows = CALLERS.map(c => {
                const res = h('span', { class: 'oo-pill oo-ghost' }, '?');
                const r = h('div', { class: 'oo-enc-row' }, h('span', { class: 'oo-label oo-raw' }, c.where), h('div', { class: 'kt', html: hl(c.src) }), res);
                r.res = res; return r;
              });
              const o = out('');
              const btns = MODS.map(m => cmd(m, () => pick(m)));
              async function pick(m) {
                if (busy) return; busy = true;
                mod = m; press(btns, btns[MODS.indexOf(m)]);
                decl.innerHTML = hl(`// module :feature:cart\nopen class Cart {\n    ${m} fun reset() { /* ... */ }\n}`);
                replay(decl, 'pop-soft');
                rows.forEach(r => { r.className = 'oo-enc-row'; r.res.className = 'oo-pill oo-ghost'; r.res.textContent = '?'; });
                const reach = MODS.indexOf(m);
                let ok = 0;
                for (let i = 0; i < rows.length; i++) {
                  await sleep(220); if (!el.isConnected) return;
                  const yes = CALLERS[i].rank <= reach;
                  if (yes) ok++;
                  rows[i].classList.add(yes ? 'oo-enc-yes' : 'oo-enc-no');
                  rows[i].res.className = `oo-pill ${yes ? 'oo-ok' : 'oo-err'}`;
                  rows[i].res.textContent = yes ? 'compiles' : 'error';
                  replay(rows[i].res, yes ? 'pop' : 'shake');
                }
                say(o, ok === rows.length
                  ? `<span class="good">public:</span> every caller in every module can reach reset().`
                  : `${hl(`${m} fun reset()`)} <span class="muted">→ ${ok} of ${rows.length} callers compile. The others get:</span> <span class="bad">Cannot access 'reset': it is ${m} in 'Cart'</span>`);
                busy = false;
              }
              decl.innerHTML = hl('// module :feature:cart\nopen class Cart {\n    private fun reset() { /* ... */ }\n}');
              press(btns, btns[0]);
              say(o, 'Pick a modifier for reset(). Each caller then tries to compile.');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'modifier'), btns),
                decl,
                h('div', { class: 'oo-enc-grid' }, rows),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Visibility is checked by the compiler, and most of it is also written into the bytecode. A <code>private</code> member is a JVM private member. For a private property with default accessors, Kotlin generates no getter or setter at all and the class uses the field directly. <code>private set</code> keeps the public getter and hides only the setter.</p>
<p><code>internal</code> has no JVM equivalent. It compiles to <code>public</code>, and the JVM names of internal members get the module name appended, which keeps Java code from calling them by accident. <code>asStateFlow()</code> wraps the flow in a separate read-only class, so casting it back to <code>MutableStateFlow</code> fails at runtime.</p>`,
          code: `// Kotlin
class Cart {
    var count = 0
        private set
    internal fun reset() { count = 0 }
}

// JVM, simplified
public final class Cart {
    private int count;
    public final int getCount()           // public getter
    // no public setter for count
    public final void reset$<module>()    // internal: public, but renamed
}`,
        },
        mistakes: [
          { title: 'A read-only list of mutable items', bad: 'data class Item(val name: String, var price: Int)\n\nclass Cart {\n    private val _items = mutableListOf<Item>()\n    val items: List<Item> get() = _items\n}\ncart.items[0].price = 0   // free shopping', good: 'data class Item(val name: String, val price: Int)\n\nclass Cart {\n    private val _items = mutableListOf<Item>()\n    val items: List<Item> get() = _items\n    fun reprice(name: String, price: Int) { /* checks */ }\n}', why: 'A read-only <code>List</code> stops callers from adding or removing, but not from changing what is inside. Make the items immutable too, and route changes through the owner.' },
          { title: 'A public var with the rule in every caller', bad: 'class Account { var balance = 0L }\n\n// in three different screens\nif (account.balance >= cost) account.balance -= cost', good: 'class Account {\n    var balance = 0L\n        private set\n    fun pay(cost: Long): Boolean {\n        if (cost > balance) return false\n        balance -= cost\n        return true\n    }\n}', why: 'Each caller copies the check, and one day a new screen forgets it. Put the rule in the class and make the setter private.' },
          { title: 'Handing out an array', bad: 'class Scores {\n    private val _top = IntArray(3)\n    val top: IntArray get() = _top\n}\nscores.top[0] = 999   // compiles', good: 'class Scores {\n    private val _top = IntArray(3)\n    val top: List<Int> get() = _top.toList()\n}', why: 'Arrays have no read-only type, so every reference to one can write to it. Expose a <code>List</code> copy instead.' },
        ],
        visual(el) {
          const MAX = 3, pool = ['Tea', 'Eggs', 'Bread', 'Cake', 'Jam', 'Rice'];
          let items = ['Milk'], leak = false, k = 0;
          const list = h('div', { class: 'oo-items' });
          const vault = h('div', { class: 'oo-vault' }, h('span', { class: 'oo-label oo-raw' }, 'private val _items: MutableList<String>'), list);
          const decl = h('div', { class: 'kt oo-wrap' });
          const rule = h('span', { class: 'oo-pill oo-ok' });
          const card = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-title' }, 'class Cart'), vault,
            h('span', { class: 'oo-label' }, 'what outside code sees'), decl, h('div', { class: 'oo-row' }, h('span', { class: 'oo-label' }, 'rule'), rule));
          const o = out('Add items through the method, then try reaching into the list from outside.');
          const sw = h('input', { type: 'checkbox', id: 'oo-enc-leak' });
          const next = () => pool[k++ % pool.length];
          function paint() {
            decl.innerHTML = hl(leak ? 'val items: MutableList<String> = _items' : 'val items: List<String> get() = _items');
            vault.classList.toggle('oo-open', leak);
            const broken = items.length > MAX;
            rule.textContent = broken ? `broken: ${items.length} items > ${MAX}` : `at most ${MAX} items: holds`;
            rule.className = `oo-pill ${broken ? 'oo-err' : 'oo-ok'}`;
            card.classList.toggle('oo-bad', broken); card.classList.toggle('oo-on', !broken);
          }
          function addChip(name, cls) { const c = pill(name, `${cls} drop-in`); list.append(c); }
          sw.addEventListener('change', () => { leak = sw.checked; paint(); say(o, leak ? '<span class="bad">warning:</span> the mutable list is now public. Outside code can skip add().' : '<span class="good">ok:</span> outside code only gets a read-only List.'); });
          function viaMethod() {
            const name = next();
            if (items.length >= MAX) { replay(card, 'shake'); say(o, `${hl(`cart.add("${name}")`)} <span class="muted">→</span> <span class="bad">rejected:</span> add() checked the rule, cart is full`); return; }
            items.push(name); addChip(name, 'oo-acc'); paint();
            say(o, `${hl(`cart.add("${name}")`)} <span class="muted">→</span> <span class="good">ok:</span> ${items.length} of ${MAX}`);
          }
          function fromOutside() {
            const name = next();
            if (!leak) { replay(decl, 'shake'); say(o, `${hl(`cart.items.add("${name}")`)} <span class="muted">→</span> <span class="bad">compile error:</span> Unresolved reference 'add'. List is read-only.`); return; }
            items.push(name); addChip(name, items.length > MAX ? 'oo-err' : 'oo-warn'); paint();
            if (items.length > MAX) replay(card, 'shake');
            say(o, `${hl(`cart.items.add("${name}")`)} <span class="muted">→</span> ${items.length > MAX ? '<span class="bad">compiles and runs:</span> the rule in add() never ran' : '<span class="bad">compiles:</span> it skipped add(), and nothing checked'}`);
          }
          function clear() { items = []; list.replaceChildren(); paint(); say(o, `${hl('cart.clear()')} <span class="muted">→</span> empty`); }
          items.forEach(n => addChip(n, 'oo-acc')); paint();
          el.append(
            h('div', { class: 'stage' }, card),
            h('label', { class: 'switch', for: 'oo-enc-leak' }, sw, 'Expose _items as a public MutableList'),
            h('div', { class: 'controls' }, cmd('cart.add("Tea")', viaMethod), cmd('cart.items.add("Cake")', fromOutside), cmd('cart.clear()', clear)),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'polymorphism',
        title: 'Polymorphism',
        tagline: 'One call, many behaviours. The object decides at runtime.',
        level: 'beginner',
        body: `
<p>Polymorphism lets code call a method on a type without knowing which class is behind it. <code>broadcast()</code> takes a <code>List&lt;Sender&gt;</code> and calls <code>send()</code> on each. A push sender sends a push, an email sender sends an email.</p>
<p>The choice happens at runtime and is called <em>dynamic dispatch</em>. The variable’s declared type decides which methods you may call. The object’s real class decides which body runs.</p>
<p>Android uses this everywhere. The framework holds your screen as an <code>Activity</code> and calls <code>onCreate()</code>, and your <code>override</code> runs. One limit: extension functions are picked from the declared type at compile time, so they don’t dispatch like members.</p>`,
        code: `interface Sender {
    fun send(msg: String)
}
class PushSender(private val fcm: FcmClient) : Sender {
    override fun send(msg: String) = fcm.notify(msg)
}
class EmailSender(private val mail: MailApi) : Sender {
    override fun send(msg: String) = mail.post(msg)
}

fun broadcast(senders: List<Sender>, msg: String) {
    senders.forEach { it.send(msg) }   // which send()? decided at runtime
}

broadcast(listOf(PushSender(fcm), EmailSender(mail)), "Sale ends tonight")`,
        remember: 'The declared type decides what you can call. The real object decides what runs.',
        terms: [
          { term: 'Polymorphism', def: 'Using one interface or base type to work with objects of many classes, each with its own behaviour.' },
          { term: 'Dynamic dispatch', def: 'Choosing which override of a method to run at runtime, based on the object’s actual class.' },
          { term: 'Static dispatch', def: 'Choosing which function to call at compile time from the declared type, as Kotlin does for extension functions.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>SmsSender</code> a real implementation and hold both senders in one list.', code: 'interface Sender { fun send(msg: String) }\nclass SmsSender : Sender {\n    [[override]] fun send(msg: String) = println("sms: $msg")\n}\nval senders: List<[[Sender]]> = listOf(SmsSender(), PushSender())\nsenders.forEach { it.send("Hi") }', why: '<code>override</code> marks the body that dispatch will pick. A <code>List&lt;Sender&gt;</code> can hold any implementation.' },
          { type: 'bug', prompt: 'This prints <code>generic</code>, but it should print <code>push</code>. Tap the line that can never take part in dispatch.', code: 'open class Sender {\n    open fun label() = "generic"\n}\nclass PushSender : Sender()\nfun PushSender.label() = "push"\nval s: Sender = PushSender()\nprintln(s.label())', bug: 4, fix: '// move it into PushSender as: override fun label() = "push"', why: 'An extension is chosen from the declared type, and a member with the same signature always wins over it. Only an <code>override</code> joins dynamic dispatch.' },
        ],
        quiz: [
          { q: '<code>val s: Sender = EmailSender()</code>. Which <code>send()</code> runs for <code>s.send("Hi")</code>?', options: ['Sender’s, because that is the declared type', 'EmailSender’s, because that is the real object', 'It does not compile'], a: 1, why: 'Member calls dispatch on the runtime class of the object.' },
          { q: 'You add a <code>ChatSender</code>. What changes in <code>broadcast()</code>?', options: ['A new branch for ChatSender', 'Nothing', 'Its parameter type'], a: 1, why: 'It calls <code>send()</code> through the interface, so any new implementation works without touching it.' },
        ],
        deeper: [
          {
            title: 'Overloads are picked at compile time',
            body: `<p>Overriding and overloading look alike, but they are decided at different moments. An override is picked at runtime from the real object. An overload, meaning two functions with the same name and different parameter types, is picked at compile time from the declared type.</p>
<p>So with <code>val x: Animal = Cat()</code>, <code>x.speak()</code> runs the cat's code, but <code>greet(x)</code> calls the <code>Animal</code> overload. Change the declared type below and compare both calls.</p>`,
            code: `open class Animal { open fun speak() = "..." }
class Cat : Animal() { override fun speak() = "Meow" }

fun greet(a: Animal) = "Hello, animal"
fun greet(c: Cat) = "Hello, cat"

val x: Animal = Cat()
x.speak()     // "Meow": override, chosen at runtime
greet(x)      // "Hello, animal": overload, chosen at compile time`,
            visual(el) {
              const DECLS = [
                { src: 'val x: Animal = Cat()', decl: 'Animal', obj: 'Cat' },
                { src: 'val x: Cat = Cat()', decl: 'Cat', obj: 'Cat' },
                { src: 'val x: Animal = Animal()', decl: 'Animal', obj: 'Animal' },
              ];
              let d = DECLS[0], busy = false;
              const card = (src, when) => { const c = h('div', { class: 'oo-impl' }, h('b', { html: hl(src) }), h('span', { class: 'oo-sent' }, when)); return c; };
              const F = {
                speakA: card('Animal.speak() = "..."', 'override, runtime'),
                speakC: card('Cat.speak() = "Meow"', 'override, runtime'),
                greetA: card('greet(a: Animal)', 'overload, compile time'),
                greetC: card('greet(c: Cat)', 'overload, compile time'),
              };
              const o = out('');
              const dBtns = DECLS.map(x => cmd(x.src, () => { if (busy) return; d = x; press(dBtns, dBtns[DECLS.indexOf(x)]); Object.values(F).forEach(c => c.classList.remove('oo-hit')); say(o, `Declared type <b>${x.decl}</b>, real object <b>${x.obj}</b>.`); }));
              async function call(kind) {
                if (busy) return; busy = true;
                Object.values(F).forEach(c => c.classList.remove('oo-hit'));
                const pick = kind === 'speak' ? (d.obj === 'Cat' ? F.speakC : F.speakA) : (d.decl === 'Cat' ? F.greetC : F.greetA);
                await sleep(250); if (!el.isConnected) return;
                pick.classList.add('oo-hit'); replay(pick, 'pop');
                if (kind === 'speak') say(o, `${hl('x.speak()')} <span class="muted">→ looks at the object:</span> <b>${d.obj}</b> <span class="muted">→</span> ${hl(d.obj === 'Cat' ? '"Meow"' : '"..."')}`);
                else say(o, `${hl('greet(x)')} <span class="muted">→ looks at the declared type:</span> <b>${d.decl}</b> <span class="muted">→</span> ${hl(d.decl === 'Cat' ? '"Hello, cat"' : '"Hello, animal"')}${d.decl !== d.obj ? ' <span class="bad">even though x is a Cat</span>' : ''}`);
                await sleep(300); busy = false;
              }
              press(dBtns, dBtns[0]);
              say(o, 'Pick a declaration, then call both functions.');
              el.append(
                h('div', { class: 'controls' }, dBtns),
                h('div', { class: 'oo-pair' },
                  h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'members (dynamic)'), h('div', { class: 'oo-impls' }, F.speakA, F.speakC)),
                  h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'overloads (static)'), h('div', { class: 'oo-impls' }, F.greetA, F.greetC))),
                h('div', { class: 'controls' }, cmd('x.speak()', () => call('speak')), cmd('greet(x)', () => call('greet'))),
                o);
            },
          },
          {
            title: 'super: run the parent body too',
            body: `<p>An override replaces the parent's body. If the parent did real work, call it with <code>super.method()</code>. Every layer of the class tree then runs, from the top down.</p>
<p>Android checks this for lifecycle methods. An Activity whose <code>onCreate</code> skips <code>super.onCreate()</code> throws <code>SuperNotCalledException</code>, because the framework's own setup never ran. Turn off a <code>super</code> call below and create the screen.</p>`,
            visual(el) {
              const LAYERS = [
                { name: 'HomeActivity', body: 'setContentView(...)', sup: 'home' },
                { name: 'BaseActivity', body: 'analytics.screen(name)', sup: 'base' },
                { name: 'AppCompatActivity', body: 'restore state, set up window', sup: null },
              ];
              const calls = { home: true, base: true };
              let busy = false;
              const nodes = LAYERS.map(l => h('div', { class: 'oo-node' + (l.sup ? '' : '') }, `${l.name}.onCreate(): ${l.body}`));
              nodes.slice(1).forEach(n => n.classList.add('oo-sub'));
              const log = h('div', { class: 'oo-code' });
              const o = out('Both super calls are on. Create the Activity.');
              const toggles = ['home', 'base'].map(k => {
                const id = `oo-poly-super-${k}`;
                const inp = h('input', { type: 'checkbox', id, checked: true });
                inp.addEventListener('change', () => { if (busy) { inp.checked = calls[k]; return; } calls[k] = inp.checked; say(o, `${k === 'home' ? 'HomeActivity' : 'BaseActivity'} ${inp.checked ? 'calls' : 'skips'} super.onCreate().`); });
                return h('label', { class: 'switch', for: id }, inp, `${k === 'home' ? 'HomeActivity' : 'BaseActivity'} calls super`);
              });
              const line = (t, cls = '') => { const l = h('div', { class: `oo-line ${cls} drop-in`, html: hl(t) }); log.append(l); };
              async function create() {
                if (busy) return; busy = true;
                nodes.forEach(n => n.classList.remove('oo-cur', 'oo-hot'));
                log.replaceChildren();
                let i = 0;
                for (; i < LAYERS.length; i++) {
                  nodes[i].classList.add('oo-cur'); replay(nodes[i], 'pop');
                  line(`${LAYERS[i].name}.onCreate()`);
                  await sleep(450); if (!el.isConnected) return;
                  if (!LAYERS[i].sup || !calls[LAYERS[i].sup]) break;
                }
                for (let j = i + 1; j < LAYERS.length; j++) nodes[j].classList.add('oo-hot');
                if (i === LAYERS.length - 1) {
                  line('// every layer ran', 'oo-ln-ok');
                  say(o, '<span class="good">created:</span> each override did its part, then handed up with super.');
                } else {
                  line('SuperNotCalledException', 'oo-ln-err'); replay(nodes[0], 'shake');
                  say(o, `<span class="bad">SuperNotCalledException:</span> Activity HomeActivity did not call through to super.onCreate() <span class="muted">(${LAYERS.slice(i + 1).map(l => l.name).join(' and ')} never ran)</span>`);
                }
                busy = false;
              }
              el.append(
                h('div', { class: 'oo-pair' }, h('div', { class: 'oo-tree' }, nodes), log),
                h('div', { class: 'oo-switches' }, toggles),
                h('div', { class: 'controls' }, cmd('startActivity(homeIntent)', create)),
                o);
            },
          },
          {
            title: 'final override: make the order impossible to forget',
            body: `<p>An <code>override</code> is itself open, so a subclass of a subclass can override it again. Write <code>final override</code> to stop that. A base class can then run the fixed steps itself and offer a separate hook for the part that varies.</p>
<p>This is the template method idea. The base class owns the order, and subclasses can't forget <code>super</code> because they never override the method that calls it.</p>`,
            code: `abstract class TrackedActivity : AppCompatActivity() {
    final override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        analytics.screen(screenName)
        onCreateScreen(savedInstanceState)     // the part subclasses fill in
    }
    protected abstract val screenName: String
    protected abstract fun onCreateScreen(savedInstanceState: Bundle?)
}

class HomeActivity : TrackedActivity() {
    override val screenName = "home"
    override fun onCreateScreen(savedInstanceState: Bundle?) = setContent { HomeRoute() }
}`,
          },
        ],
        underHood: {
          body: `<p>A member call compiles to <code>invokevirtual</code>, or <code>invokeinterface</code> for an interface type. The JVM looks the method up on the object's runtime class, using a per-class method table. The JIT often turns a call site that only ever sees one class into a direct call, so dispatch is usually cheap.</p>
<p>An extension function compiles to a static method that takes the receiver as its first parameter. The call is <code>invokestatic</code>, fixed at compile time from the declared type. That is why extensions never dispatch like members.</p>`,
          code: `// Kotlin
s.send("Hi")       // s: Sender, an interface
p.label()          // label() is an extension on PushSender

// Bytecode, simplified
invokeinterface Sender.send(String)          // resolved on the object at runtime
invokestatic  SendersKt.label(PushSender)    // fixed when compiled`,
        },
        mistakes: [
          { title: 'Type checks instead of an override', bad: 'fun icon(s: Sender): Int = when (s) {\n    is PushSender -> R.drawable.ic_bell\n    is EmailSender -> R.drawable.ic_mail\n    else -> R.drawable.ic_unknown\n}', good: 'interface Sender {\n    val icon: Int\n    fun send(msg: String)\n}\nclass PushSender : Sender {\n    override val icon = R.drawable.ic_bell\n    override fun send(msg: String) { /* ... */ }\n}', why: 'Every new sender falls into <code>else</code> and quietly gets the wrong icon. Put the behaviour on the type, and the compiler asks each new class for it.' },
          { title: 'Overriding equals without hashCode', bad: 'class Tag(val name: String) {\n    override fun equals(other: Any?) =\n        other is Tag && other.name == name\n}\nsetOf(Tag("kt"), Tag("kt")).size   // 2', good: 'data class Tag(val name: String)\n\nsetOf(Tag("kt"), Tag("kt")).size   // 1', why: '<code>HashSet</code> calls the overridden <code>hashCode</code> first. Equal objects with different hash codes land in different buckets. Override both, or use a data class.' },
        ],
        visual(el) {
          const impls = [
            { name: 'PushSender', out: m => `bell icon: "${m}"` },
            { name: 'EmailSender', out: m => `inbox: Subject "${m}"` },
            { name: 'SmsSender', out: m => `sms to +90 5xx: ${m}` },
          ];
          const extra = { name: 'ChatSender', out: m => `chat bubble: ${m}` };
          let list = [0, 1, 2], busy = false;
          const callLine = h('div', { class: 'oo-line', html: hl('senders.forEach { it.send("Hi") }') });
          const declLine = h('div', { class: 'oo-line', html: hl('val senders: List<Sender> = listOf(...)') });
          const objRow = h('div', { class: 'oo-row' });
          const implBox = h('div', { class: 'oo-impls' });
          const o = out('Send through one object, or run the whole list.');
          const cards = [];
          function implCard(x) {
            const sent = h('span', { class: 'oo-sent' }, '');
            const c = h('div', { class: 'oo-impl' }, h('b', { html: hl(`class ${x.name} : Sender`) }), h('span', { html: hl('override fun send(msg: String)') }), sent);
            c.sent = sent; return c;
          }
          impls.forEach(x => { const c = implCard(x); cards.push(c); implBox.append(c); });
          const chips = [];
          function paintObjs() {
            objRow.replaceChildren(...list.map(i => { const c = pill(`${impls[i].name}()`, 'oo-acc'); chips[i] = c; return c; }));
          }
          async function dispatch(i) {
            const x = impls[i];
            callLine.classList.add('oo-cur'); replay(chips[i], 'pop');
            await sleep(350);
            cards.forEach(c => c.classList.remove('oo-hit'));
            cards[i].classList.add('oo-hit'); cards[i].sent.textContent = x.out('Hi'); replay(cards[i], 'pop');
            await sleep(450);
            callLine.classList.remove('oo-cur');
          }
          async function one(i) {
            if (busy) return; busy = true;
            say(o, `${hl(`val s: Sender = ${impls[i].name}()`)} <span class="muted">→ s.send("Hi") runs ${impls[i].name}.send</span>`);
            await dispatch(i);
            busy = false;
          }
          async function all() {
            if (busy) return; busy = true;
            cards.forEach(c => { c.sent.textContent = ''; c.classList.remove('oo-hit'); });
            say(o, `One line of code, ${list.length} different bodies:`);
            for (const i of list) { if (!el.isConnected) return; await dispatch(i); }
            say(o, `<span class="good">done:</span> the same call ran ${list.map(i => impls[i].name).join(', ')}`);
            busy = false;
          }
          const addBtn = cmd('senders += ChatSender()', async () => {
            if (busy) return;
            if (impls.includes(extra)) { replay(callLine, 'shake'); say(o, 'ChatSender is already in the list.'); return; }
            busy = true;
            impls.push(extra); const c = implCard(extra); c.classList.add('drop-in'); cards.push(c); implBox.append(c);
            list = [...list, impls.length - 1]; paintObjs(); replay(chips[impls.length - 1], 'drop-in');
            callLine.classList.add('oo-ln-ok');
            say(o, `<span class="good">new class added.</span> The forEach line did not change at all.`);
            await sleep(900); callLine.classList.remove('oo-ln-ok');
            busy = false;
          });
          paintObjs();
          el.append(
            h('div', { class: 'oo-pair' },
              h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Call site'), h('div', { class: 'oo-code' }, declLine, callLine), h('span', { class: 'oo-label' }, 'Objects in the list at runtime'), objRow),
              h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Implementations'), implBox)),
            h('div', { class: 'controls' }, impls.slice(0, 3).map((x, i) => cmd(`${x.name}().send("Hi")`, () => one(i)))),
            h('div', { class: 'controls' }, cmd('senders.forEach { it.send("Hi") }', all), addBtn),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'composition',
        title: 'Inheritance vs composition',
        tagline: 'Build behaviour from parts you plug in, not from a deep class tree.',
        level: 'beginner',
        body: `
<p>Inheritance says “a <code>TrackedScreen</code> <em>is a</em> <code>BaseScreen</code>”. The subclass gets all the parent’s code and is tied to every detail of it. Composition says “a <code>Screen</code> <em>has</em> a logger and an analytics tracker”. The class holds parts and calls them.</p>
<p>Trees break down when features combine. Logging, analytics and pull-to-refresh in any mix need a subclass per mix, and every subclass depends on the base. Change the base and all of them can break. This is the <em>fragile base class</em> problem.</p>
<p>Kotlin nudges you toward composition: classes and members are <code>final</code> unless you mark them <code>open</code>. Inherit when there is a real “is a” relationship you control, like your own <code>sealed</code> hierarchy or a framework class such as <code>ViewModel</code>. Toggle features below and compare how both designs grow.</p>`,
        code: `// Inheritance: behaviour baked into a class tree
open class BaseScreen {
    open fun onShown() { Log.d("Screen", "shown") }
}
class TrackedScreen : BaseScreen() {
    override fun onShown() { super.onShown(); Analytics.track("view") }
}

// Composition: behaviour plugged in as parts
fun interface ScreenPart { fun onShown(screen: String) }

class Screen(private val name: String, private val parts: List<ScreenPart>) {
    fun onShown() = parts.forEach { it.onShown(name) }
}

val logging = ScreenPart { name -> Log.d("Screen", "$name shown") }
val analytics = ScreenPart { name -> Analytics.track("screen_view", name) }

val home = Screen("home", listOf(logging, analytics))
val settings = Screen("settings", listOf(analytics))`,
        remember: 'Has-a beats is-a. Plug parts into a class instead of growing a subclass for every combination.',
        terms: [
          { term: 'Composition', def: 'Building a class’s behaviour by holding other objects and calling them, instead of inheriting from a parent class.' },
          { term: 'Fragile base class', def: 'The problem where a change in a parent class silently breaks subclasses that depend on its details.' },
          { term: 'Final by default', def: 'Kotlin’s rule that classes and members can’t be subclassed or overridden unless they are marked open.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Kotlin classes are final by default. Allow <code>Circle</code> to extend <code>Shape</code> and override <code>draw()</code>.', code: '[[open]] class Shape {\n    [[open]] fun draw() {}\n}\nclass Circle : Shape() {\n    override fun draw() {}\n}', why: 'Both the class and the member need <code>open</code>. Each one is an explicit decision to let subclasses depend on it.' },
          { type: 'bug', prompt: 'Creating a <code>ProfileScreen</code> crashes with a NullPointerException. Tap the line that causes it.', code: 'open class Screen {\n    init {\n        render()\n    }\n    open fun render() {}\n}\nclass ProfileScreen : Screen() {\n    private val title = "Profile"\n    override fun render() {\n        println(title.length)\n    }\n}', bug: 2, fix: '        // remove it: call render() after the object is built', why: 'The base class runs <code>init</code> first, so the override runs before <code>title</code> is set. Calling open members from a constructor is a classic fragile base class trap.' },
        ],
        quiz: [
          { q: 'You need screens with any mix of logging, analytics and refresh. How many subclasses can a pure inheritance design need?', options: ['3', 'Up to 8, one per combination', '1'], a: 1, why: 'Three on/off features give 2 × 2 × 2 = 8 combinations. Composition needs one Screen class and three parts.' },
          { q: 'What does “fragile base class” describe?', options: ['A base class with too few methods', 'A change in a parent class breaking subclasses that rely on its details', 'A class marked final'], a: 1, why: 'Subclasses see the parent’s internals, so a change there can ripple into every one of them.' },
          { q: 'Without any modifier, can you subclass a Kotlin class?', options: ['Yes', 'No, it is final until you mark it open'], a: 1, why: 'Kotlin makes inheritance opt-in with <code>open</code>.' },
        ],
        deeper: [
          {
            title: 'Swap a part at runtime',
            body: `<p>Inherited behaviour is fixed the moment you write <code>class X : Y()</code>. A part is just a property, so you choose it when the object is built, or swap it later. Tests rely on this: pass a fake part and the screen never touches the network.</p>
<p>Plug different loaders into the same <code>FeedScreen</code> and refresh. The screen's own code stays the same.</p>`,
            code: `interface FeedLoader { suspend fun load(): List<String> }

class FeedScreen(private var loader: FeedLoader) {
    fun use(other: FeedLoader) { loader = other }
    suspend fun refresh(): List<String> = loader.load()
}

val screen = FeedScreen(NetworkLoader(api))
screen.use(CacheLoader(dao))                  // swap at runtime

val fake = object : FeedLoader {
    override suspend fun load() = listOf("Fake 1", "Fake 2")
}
val underTest = FeedScreen(fake)              // no network in tests`,
            visual(el) {
              const LOADERS = [
                { name: 'NetworkLoader', ms: 1100, note: 'fresh from the server', items: ['New metro line opens', 'Derby ends 2-2', 'Rain expected Friday'] },
                { name: 'CacheLoader', ms: 150, note: 'cached 2 h ago', items: ['New metro line opens', 'Derby ends 2-2'] },
                { name: 'FakeLoader', ms: 60, note: 'fixed test data', items: ['Fake 1', 'Fake 2'] },
              ];
              let cur = LOADERS[0], busy = false;
              const code = h('div', { class: 'oo-code' });
              const phone = h('div', { class: 'phone oo-cps-phone', 'aria-label': 'Feed screen preview' });
              const o = out('');
              function paintCode(fresh) {
                code.replaceChildren(
                  h('div', { class: 'oo-line', html: hl('class FeedScreen(private var loader: FeedLoader)') }),
                  h('div', { class: `oo-line${fresh ? ' oo-ln-ok drop-in' : ''}`, html: hl(`loader = ${cur.name}()`) }),
                  h('div', { class: 'oo-line', html: hl('suspend fun refresh() = loader.load()') }));
              }
              const phoneBar = () => h('span', { class: 'oo-cps-bar' }, `Feed · ${cur.name}`);
              function paintPhone(items, note) {
                phone.replaceChildren(phoneBar(), ...items.map((t, i) => h('div', { class: 'item drop-in', style: `animation-delay:${i * 80}ms` }, t)), h('span', { class: 'phone-note' }, note));
              }
              const btns = LOADERS.map(L => cmd(`screen.use(${L.name}())`, () => {
                if (busy) return;
                cur = L; press(btns, btns[LOADERS.indexOf(L)]); paintCode(true);
                phone.firstElementChild.replaceWith(phoneBar());
                say(o, `<span class="good">swapped:</span> FeedScreen now holds a ${L.name}. Same object, same code, new part.`);
              }));
              async function refresh() {
                if (busy) return; busy = true;
                phone.replaceChildren(phoneBar(), h('div', { class: 'oo-cps-spin', 'aria-label': 'Loading' }));
                code.children[2].classList.add('oo-cur');
                say(o, `${hl('screen.refresh()')} <span class="muted">→ calls</span> ${hl(`${cur.name}.load()`)}`);
                await sleep(cur.ms + 250); if (!el.isConnected) return;
                code.children[2].classList.remove('oo-cur');
                paintPhone(cur.items, cur.note);
                say(o, `${hl(`${cur.name}.load()`)} <span class="muted">→</span> ${cur.items.length} items, ${cur.note}.`);
                busy = false;
              }
              press(btns, btns[0]); paintCode(false); paintPhone(LOADERS[0].items, LOADERS[0].note);
              say(o, 'Swap the loader, then refresh.');
              el.append(
                h('div', { class: 'oo-pair' }, h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'one class'), code), phone),
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'controls' }, cmd('screen.refresh()', refresh)),
                o);
            },
          },
          {
            title: 'Delegation with by: composition without the boilerplate',
            body: `<p>Sometimes a class should <em>be</em> an interface and hand most of the work to a part. Writing a forwarding method for every member is tedious. <code>by</code> makes the compiler write them, and you override only what you change.</p>
<p>This is still composition. <code>LoggingList</code> holds a list. It does not extend any list class, so it can't break when one changes. The Delegation and decorators lesson in this track goes further.</p>`,
            code: `class LoggingList<T>(private val inner: MutableList<T> = mutableListOf()) :
    MutableList<T> by inner {

    override fun add(element: T): Boolean {
        Log.d("List", "add $element")
        return inner.add(element)
    }
}`,
          },
        ],
        underHood: {
          body: `<p>Kotlin compiles classes and members as <code>final</code> unless you write <code>open</code>, so nothing outside your control can override them. A part is a private field, and calling it is one ordinary method call that the JIT can often inline.</p>
<p>For <code>MutableList&lt;T&gt; by inner</code>, the compiler generates a method for every interface member you didn't write yourself. Each one forwards to the delegate, which is stored in a field. You get composition with about as little source code as inheritance.</p>`,
          code: `// What "by inner" generates, simplified
class LoggingList<T>(private val inner: MutableList<T>) : MutableList<T> {
    override val size: Int get() = inner.size
    override fun get(index: Int): T = inner.get(index)
    override fun remove(element: T): Boolean = inner.remove(element)
    // ...one forwarder per member you did not override
    override fun add(element: T): Boolean { /* yours */ }
}`,
        },
        mistakes: [
          { title: 'Extending a class to reuse its code', bad: 'open class HttpClient {\n    fun get(url: String): String = TODO()\n    fun post(url: String, body: String): String = TODO()\n}\nclass UserRepository : HttpClient() {\n    fun user(id: String) = get("/users/$id")\n}\nrepo.post("/admin/reset", "")   // also part of the API now', good: 'class UserRepository(private val http: HttpClient) {\n    fun user(id: String) = http.get("/users/$id")\n}', why: 'Inheriting for reuse makes every public method of the parent part of your class. Holding the client exposes only what you choose.' },
          { title: 'Subclassing a view to add one helper', bad: 'class MyRecyclerView(context: Context, attrs: AttributeSet?) :\n    RecyclerView(context, attrs) {\n    fun scrollToTopSmooth() = smoothScrollToPosition(0)\n}', good: 'fun RecyclerView.scrollToTopSmooth() =\n    smoothScrollToPosition(0)', why: 'To get one helper, every layout has to switch to <code>MyRecyclerView</code>. An extension function adds it to every <code>RecyclerView</code> without inheriting anything.' },
        ],
        visual(el) {
          const feats = [{ k: 'Logging', part: 'LoggerPart' }, { k: 'Analytics', part: 'AnalyticsPart' }, { k: 'Refresh', part: 'RefreshPart' }];
          const on = new Set(['Logging']);
          const nameOf = set => (feats.filter(f => set.has(f.k)).map(f => f.k).join('') || 'Plain') + 'Screen';
          const seen = new Map();
          const tree = h('div', { class: 'oo-tree' }, h('div', { class: 'oo-node' }, 'open class BaseScreen'));
          const treeStat = h('span', { class: 'oo-stat' });
          const treeCard = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Inheritance: a subclass per mix'), tree, treeStat);
          const parts = feats.map(f => pill(f.part));
          const compUse = h('div', { class: 'kt oo-wrap' });
          const compStat = h('span', { class: 'oo-stat' });
          const compCard = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'Composition: one class, plug parts'),
            kt('class Screen(parts: List<ScreenPart>)'), h('div', { class: 'oo-row' }, parts), compUse, compStat);
          const o = out('Toggle features. The tree grows a class per new mix. The composed screen only swaps parts.');
          let busy = false;
          function paint(fresh) {
            const name = nameOf(on);
            if (!seen.has(name)) {
              const node = h('div', { class: 'oo-node oo-sub drop-in' }, `class ${name} : BaseScreen()`);
              seen.set(name, node); tree.append(node); fresh = true;
            }
            seen.forEach((n, nm) => n.classList.toggle('oo-cur', nm === name));
            if (!fresh) replay(seen.get(name), 'pop');
            parts.forEach((p, i) => { const plugged = on.has(feats[i].k); p.className = `oo-pill ${plugged ? 'oo-acc' : 'oo-ghost'}`; });
            const used = feats.filter(f => on.has(f.k)).map(f => f.part.replace('Part', '').toLowerCase());
            compUse.innerHTML = hl(`Screen("home", listOf(${used.join(', ')}))`);
            treeStat.innerHTML = `classes: <b>${seen.size + 1}</b> <span>(max ${2 ** feats.length + 1})</span>`;
            compStat.innerHTML = `classes: <b>${feats.length + 1}</b> <span>(always)</span>`;
            return fresh;
          }
          const boxes = feats.map(f => {
            const id = `oo-cmp-${f.k.toLowerCase()}`;
            const inp = h('input', { type: 'checkbox', id, checked: on.has(f.k) });
            inp.addEventListener('change', () => {
              if (inp.checked) on.add(f.k); else on.delete(f.k);
              const fresh = paint(false);
              const p = parts[feats.indexOf(f)]; replay(p, 'pop');
              say(o, fresh ? `<span class="bad">tree:</span> new subclass ${nameOf(on)}. <span class="good">composed:</span> ${inp.checked ? 'plugged in' : 'unplugged'} ${f.part}.` : `<span class="muted">tree:</span> reuses ${nameOf(on)}. <span class="good">composed:</span> ${inp.checked ? 'plugged in' : 'unplugged'} ${f.part}.`);
            });
            return h('label', { class: 'switch', for: id }, inp, f.k);
          });
          async function editLogging() {
            if (busy) return; busy = true;
            const nodes = [tree.firstElementChild, ...seen.values()];
            nodes.forEach(n => { n.classList.add('oo-hot'); replay(n, 'shake'); });
            parts[0].className = 'oo-pill oo-warn'; replay(parts[0], 'shake');
            say(o, `Logging code changed. <span class="bad">tree:</span> it lives in BaseScreen, so all ${nodes.length} classes need retesting. <span class="good">composed:</span> only LoggerPart.`);
            await sleep(1600);
            nodes.forEach(n => n.classList.remove('oo-hot'));
            if (el.isConnected) paint(true);
            busy = false;
          }
          paint(true);
          el.append(
            h('div', { class: 'oo-pair' }, treeCard, compCard),
            h('div', { class: 'oo-switches' }, boxes),
            h('div', { class: 'controls' }, act('Change the logging code', editLogging)),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'inheritance',
        title: 'Inheritance done right',
        tagline: 'Inherit only for a real is-a, and design the base class for it, or keep it final.',
        level: 'intermediate',
        body: `
<p>Inheritance shares two things at once: a type (“a <code>HomeViewModel</code> is a <code>ViewModel</code>”) and code. The type part is the reason to use it. If you only want the code, hold an object instead, as the composition lesson showed.</p>
<p>A real is-a holds everywhere the parent is used, and for the object's whole life. A subclass also depends on <em>how</em> the parent calls its own methods. When the parent's <code>addAll()</code> happens to call <code>add()</code>, an override of <code>add()</code> runs inside <code>addAll()</code> too. That hidden detail is called <em>self-use</em>, and when the parent changes it, subclasses break without any change of their own.</p>
<p>That is why Kotlin makes classes and members <code>final</code> unless marked <code>open</code>. Each <code>open</code> is a promise to keep that behaviour stable. Below, a subclass counts added articles. Switch the library version and the override style: no choice works for both versions.</p>`,
        code: `// A base class designed for inheritance: few, documented hooks
abstract class ArticleStore {
    private val items = mutableListOf<Article>()
    val size: Int get() = items.size

    fun add(a: Article) {            // final: subclasses can't change the order
        items += a
        onAdded(a)
    }
    fun addAll(list: List<Article>) = list.forEach { add(it) }   // documented: calls add()

    protected open fun onAdded(a: Article) {}   // the one hook
}

class CountingStore : ArticleStore() {
    var count = 0
        private set
    override fun onAdded(a: Article) { count++ }   // right for add() and addAll()
}`,
        remember: 'Inherit for a lasting is-a. Make the base final, or open a few documented hooks and keep the rest final.',
        terms: [
          { term: 'Is-a relationship', def: 'A subtype that can stand in for its parent everywhere, for its whole lifetime.' },
          { term: 'Self-use', def: 'A class calling its own overridable methods internally, which makes subclasses depend on that call pattern.' },
          { term: 'Hook method', def: 'A protected open method a base class calls at a documented point, so subclasses can add behaviour without overriding the main logic.' },
          { term: 'Sealed hierarchy', def: 'A class or interface whose direct subtypes are all known at compile time, so the set of cases is closed.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let subclasses react to each added article without overriding <code>add()</code> itself.', code: 'abstract class ArticleStore {\n    private val items = mutableListOf<Article>()\n    fun add(a: Article) { items += a; onAdded(a) }\n    protected [[open]] fun onAdded(a: Article) {}\n}', why: '<code>add()</code> stays final, so the order of steps can’t be broken. The hook is the only thing a subclass can change.' },
          { type: 'bug', prompt: 'The base <code>addAll()</code> calls <code>add()</code> for each item. After <code>addAll()</code> of 3 articles, <code>count</code> is 6. Tap the line that double counts.', code: 'class CountingStore : ArticleStore() {\n    var count = 0\n    override fun add(a: Article) { count++; super.add(a) }\n    override fun addAll(list: List<Article>) {\n        count += list.size\n        super.addAll(list)\n    }\n}', bug: 4, fix: '        // remove: the base addAll() already calls add() for each item', why: 'Self-use: <code>super.addAll()</code> calls the overridden <code>add()</code>, which counts again. And if the base ever stops calling <code>add()</code>, removing this line breaks it the other way. That is why a final method with a hook is safer.' },
        ],
        quiz: [
          { q: 'A free user can upgrade to premium while the app runs. How should you model it?', options: ['class PremiumUser : User()', 'class User(val plan: Plan) with plan as state', 'open class User and cast'], a: 1, why: 'An object can’t change its class. A role that changes over time is state, not a subclass.' },
          { q: 'Why does Kotlin make classes final by default?', options: ['Final classes use less memory', 'So that every place a subclass can hook in is a deliberate choice', 'Because Kotlin has no inheritance'], a: 1, why: 'An open member is a promise to subclasses. Opt-in keeps those promises few and intentional.' },
          { q: 'What is the safest way to let subclasses add behaviour to <code>add()</code>?', options: ['Make add() open', 'Keep add() final and call a protected open hook from it', 'Make every method open'], a: 1, why: 'The base keeps control of the order of steps, and subclasses get one documented place to plug in.' },
        ],
        deeper: [
          {
            title: 'A role that changes is state, not a subclass',
            body: `<p>The is-a test has a time part. A premium user can cancel, and a draft article gets published. An object can't change its class, so modelling these as subclasses forces you to build a new object and copy everything over, and every reference to the old one is now stale.</p>
<p>Keep the thing as one class and make the role a property. A sealed type or an enum lists the possible roles.</p>`,
            code: `// Fragile: the type is frozen at construction
open class User(val id: UserId)
class PremiumUser(id: UserId) : User(id)

// Better: one user, a plan that can change
enum class Plan { Free, Premium }
data class User(val id: UserId, val plan: Plan) {
    val showsAds: Boolean get() = plan == Plan.Free
}

val upgraded = user.copy(plan = Plan.Premium)`,
          },
          {
            title: 'Sealed: inheritance with a closed list',
            body: `<p>Inheritance is safest when you own every subclass. A <code>sealed</code> class or interface allows subtypes only in the same module and package, so the compiler knows the full list. A <code>when</code> over it needs no <code>else</code>, and adding a case makes every incomplete <code>when</code> fail to compile.</p>
<p>This is the is-a you can trust: a <code>Loading</code> really is a <code>FeedState</code>, and nobody outside can add a surprise case.</p>`,
            code: `sealed interface FeedState {
    data object Loading : FeedState
    data class Content(val articles: List<Article>) : FeedState
    data class Error(val message: String) : FeedState
}

fun render(s: FeedState) = when (s) {     // exhaustive, no else
    FeedState.Loading -> showSpinner()
    is FeedState.Content -> showList(s.articles)
    is FeedState.Error -> showError(s.message)
}`,
          },
          {
            title: 'Framework base classes are built for it',
            body: `<p>Android's own base classes are designed for inheritance. <code>ViewModel</code>, <code>CoroutineWorker</code> and <code>FirebaseMessagingService</code> each document the methods you override and when they are called. That is the hook pattern from this lesson, done by the library authors.</p>
<p>Inherit from these, override the documented hooks, and keep your own code in parts you hold. A <code>BaseActivity</code> full of shared helpers is where inheritance in apps usually goes wrong.</p>`,
            code: `@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val repo: NewsRepository,
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result =       // the documented hook
        runCatching { repo.sync() }
            .fold({ Result.success() }, { Result.retry() })
}`,
          },
        ],
        underHood: {
          body: `<p>A subclass object contains the parent's fields too. Its constructor first runs the parent's constructor, then its own initialisers, which is why a parent that calls an open method from <code>init</code> can reach a subclass field before it is set.</p>
<p>Kotlin marks classes and methods without <code>open</code> as <code>final</code> in the bytecode. A call to a final method can't be redirected by a subclass, so the JIT can call it directly or inline it.</p>`,
          code: `// Kotlin
class CountingStore : ArticleStore() { var count = 0 }

// JVM, simplified
public final class CountingStore extends ArticleStore {
    private int count;
    public CountingStore() {
        super();          // ArticleStore's fields and init run first
        this.count = 0;   // then ours
    }
}`,
        },
        mistakes: [
          { title: 'A BaseActivity grab bag', bad: 'open class BaseActivity : AppCompatActivity() {\n    protected fun showToast(msg: String) { /* ... */ }\n    protected fun track(event: String) { /* ... */ }\n    protected fun hideKeyboard() { /* ... */ }\n}\nclass HomeActivity : BaseActivity()', good: 'fun Activity.hideKeyboard() { /* ... */ }\n\nclass HomeActivity : AppCompatActivity() {\n    @Inject lateinit var analytics: Analytics\n}', why: 'Every screen inherits every helper, and the base grows forever. Extension functions and injected parts give each screen only what it uses.' },
          { title: 'Overriding to switch a feature off', bad: 'open class Player {\n    open fun seek(ms: Long) { /* ... */ }\n}\nclass LivePlayer : Player() {\n    override fun seek(ms: Long) = throw UnsupportedOperationException()\n}', good: 'interface Player { fun play() }\ninterface Seekable { fun seek(ms: Long) }\nclass LivePlayer : Player\nclass VodPlayer : Player, Seekable', why: 'If a subclass has to refuse a parent method, it is not really an is-a. Split the ability into its own type.' },
        ],
        visual(el) {
          let lib = 'v1', sub = 'both', count = 0, size = 0, busy = false;
          const baseCode = h('div', { class: 'kt oo-wrap' });
          const subCode = h('div', { class: 'kt oo-wrap' });
          const trace = h('div', { class: 'oo-code oo-inh-trace' });
          const cPill = h('span', { class: 'oo-pill' }), sPill = h('span', { class: 'oo-pill' }), verdict = h('span', { class: 'oo-pill' });
          const o = out('');
          const libBtns = [act('library v1', () => setLib('v1')), act('library v2', () => setLib('v2'))];
          const subBtns = [act('override add + addAll', () => setSub('both')), act('override add only', () => setSub('add'))];
          function paint() {
            press(libBtns, libBtns[lib === 'v1' ? 0 : 1]); press(subBtns, subBtns[sub === 'both' ? 0 : 1]);
            baseCode.innerHTML = hl(`// ${lib}\nopen class ArticleStore {\n    open fun add(a: Article) {\n        items += a\n    }\n    open fun addAll(list: List<Article>) =\n        ${lib === 'v1' ? 'list.forEach { add(it) }' : 'items.addAll(list)'}\n        ${lib === 'v1' ? '// calls add()' : '// bulk, no add()'}\n}`);
            subCode.innerHTML = hl(`class CountingStore :\n    ArticleStore() {\n    override fun add(a: Article) {\n        count++\n        super.add(a)\n    }${sub === 'both' ? '\n    override fun addAll(\n        list: List<Article>,\n    ) {\n        count += list.size\n        super.addAll(list)\n    }' : ''}\n}`);
            cPill.textContent = `count = ${count}`; sPill.textContent = `items.size = ${size}`;
            const ok = count === size;
            verdict.textContent = ok ? 'count matches' : 'count is wrong';
            verdict.className = `oo-pill ${ok ? 'oo-ok' : 'oo-err'}`; cPill.className = `oo-pill ${ok ? 'oo-acc' : 'oo-err'}`;
          }
          function fresh(msg) { count = 0; size = 0; trace.replaceChildren(); paint(); if (msg) say(o, msg); }
          function setLib(v) { if (busy) return; lib = v; fresh(v === 'v2' ? 'Library v2 made addAll() faster: it no longer calls add(). Your subclass did not change.' : 'Library v1: addAll() calls add() for each item.'); }
          function setSub(s) { if (busy) return; sub = s; fresh(s === 'add' ? 'CountingStore now counts only in add().' : 'CountingStore counts in add() and in addAll().'); }
          const steps = n => {
            const st = [];
            if (sub === 'both') st.push(['CountingStore.addAll: count += ' + n, n, 0], ['super.addAll(list)', 0, 0]);
            if (lib === 'v1') for (let i = 0; i < n; i++) st.push(['ArticleStore.addAll → add(item)   // self-use', 0, 0], ['CountingStore.add: count++', 1, 0], ['ArticleStore.add: items += item', 0, 1]);
            else st.push(['ArticleStore.addAll: items.addAll(list)', 0, n]);
            return st;
          };
          async function run(st, label) {
            if (busy) return; busy = true;
            trace.replaceChildren();
            say(o, `${hl(label)} <span class="muted">→ watch the calls</span>`);
            for (const [t, dc, ds] of st) {
              const line = h('div', { class: `oo-line drop-in${dc ? ' oo-cur' : ''}`, html: hl(t) });
              trace.append(line);
              count += dc; size += ds; paint();
              if (dc) replay(cPill, 'pop');
              await sleep(260); if (!el.isConnected) return;
            }
            const ok = count === size;
            if (!ok) replay(verdict, 'shake');
            say(o, ok ? `<span class="good">correct:</span> count ${count}, size ${size}. <span class="muted">Now switch the library version.</span>`
              : `<span class="bad">count ${count}, size ${size}:</span> ${count > size ? 'the base addAll() called the overridden add(), so items were counted twice.' : 'the base addAll() stopped calling add(), so nothing counted them.'}`);
            busy = false;
          }
          paint();
          say(o, 'Call addAll() with 3 articles. Then switch the library version and try again.');
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'base'), libBtns),
            h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'subclass'), subBtns),
            h('div', { class: 'oo-pair' },
              h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'library code (not yours)'), baseCode),
              h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'your subclass'), subCode)),
            h('div', { class: 'controls' }, cmd('store.addAll(listOf(a1, a2, a3))', () => { if (busy) return; fresh(); run(steps(3), 'store.addAll(listOf(a1, a2, a3))'); }), cmd('store.add(a4)', () => run([['CountingStore.add: count++', 1, 0], ['ArticleStore.add: items += item', 0, 1]], 'store.add(a4)'))),
            h('div', { class: 'oo-row' }, cPill, sPill, verdict),
            trace, o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'delegation',
        title: 'Delegation and decorators',
        tagline: 'Wrap an object behind the same interface, forward to it, and change only what you need.',
        level: 'intermediate',
        body: `
<p>Delegation is composition with the same face. A wrapper implements an interface, holds another object of that interface, and forwards calls to it. Callers can't tell the difference, so a wrapper can go anywhere the original could.</p>
<p>A <em>decorator</em> is a wrapper that adds one thing before or after forwarding: logging, caching, retrying. Each decorator is a small class with one job, and you stack them in any order. Kotlin's <code>by</code> writes the forwarding for every member you don't override.</p>
<p>Unlike a subclass, a wrapper sees only the interface. It can't depend on the inner object's private call pattern, so the self-use trap from the inheritance lesson can't reach it. Turn layers on and off below and follow one call.</p>`,
        code: `interface NewsRepository {
    suspend fun latest(): List<Article>
    suspend fun byId(id: ArticleId): Article?
}

class CachingNewsRepository(private val inner: NewsRepository) : NewsRepository by inner {
    private var cache: List<Article>? = null
    override suspend fun latest() = cache ?: inner.latest().also { cache = it }
    // byId() is forwarded to inner by the compiler
}

class LoggingNewsRepository(private val inner: NewsRepository) : NewsRepository by inner {
    override suspend fun latest(): List<Article> {
        val started = System.nanoTime()
        return inner.latest().also {
            Log.d("News", "latest(): " + it.size + " in " + (System.nanoTime() - started) / 1_000_000 + " ms")
        }
    }
}

// Stack them where the app is wired, for example in a Hilt module
val repo: NewsRepository = LoggingNewsRepository(CachingNewsRepository(NetworkNewsRepository(api)))`,
        remember: 'Same interface outside, the real object inside. Override what you add, let by forward the rest.',
        terms: [
          { term: 'Delegation', def: 'Handing a call to another object that does the work, instead of inheriting the code.' },
          { term: 'Decorator', def: 'A wrapper with the same interface as the object it wraps, adding one behaviour around the forwarded call.' },
          { term: 'Delegate', def: 'The inner object a wrapper forwards to. With by, the compiler stores it and writes the forwarding methods.' },
          { term: 'Forwarding method', def: 'A method whose whole body calls the same method on the delegate.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Forward every member of <code>NewsRepository</code> to <code>inner</code>, except the ones you override.', code: 'class CachingRepo(private val inner: NewsRepository) :\n    NewsRepository [[by]] [[inner]] {\n    override suspend fun latest() = cache ?: inner.latest().also { cache = it }\n}', why: '<code>NewsRepository by inner</code> makes the compiler write forwarders for every member you didn’t write yourself.' },
          { type: 'bug', prompt: 'Calling <code>latest()</code> on this wrapper crashes with <code>StackOverflowError</code>. Tap the line.', code: 'class LoggingRepo(private val inner: NewsRepository) : NewsRepository by inner {\n    override suspend fun latest(): List<Article> {\n        Log.d("Repo", "latest()")\n        return latest()\n    }\n}', bug: 3, fix: '        return inner.latest()', why: 'Inside the override, <code>latest()</code> means <code>this.latest()</code>, the override itself, so it calls itself forever. Forward to the delegate explicitly.' },
        ],
        quiz: [
          { q: 'A delegate’s <code>refresh()</code> calls its own <code>latest()</code>. Your wrapper overrides <code>latest()</code>. Which one runs inside <code>refresh()</code>?', options: ['The wrapper’s override', 'The delegate’s own latest()'], a: 1, why: 'The delegate knows nothing about the wrapper. Overrides in the wrapper are not called from the delegate’s members.' },
          { q: 'Why can decorators be stacked in any combination?', options: ['They all extend the same base class', 'Each one takes and implements the same interface', 'Kotlin sorts them automatically'], a: 1, why: 'Every layer is a NewsRepository that wraps a NewsRepository, so any layer can wrap any other.' },
          { q: 'Where should the stack of decorators be built?', options: ['Inside each ViewModel', 'In one wiring place, such as a DI module', 'Inside NetworkNewsRepository'], a: 1, why: 'Callers just ask for a NewsRepository. One place decides which layers it has.' },
        ],
        deeper: [
          {
            title: 'The delegate never calls your overrides',
            body: `<p>This is the opposite of inheritance. With a subclass, the parent's internal calls can land in your overrides. With <code>by</code>, the delegate is a separate object. When its <code>refresh()</code> calls <code>latest()</code>, it calls its own <code>latest()</code>, never the wrapper's.</p>
<p>That makes wrappers predictable, but it also means an override only affects calls that come <em>through the wrapper</em>. If you need the inner object's own calls to change, decorating is not enough.</p>`,
            code: `interface Feed {
    fun latest(): List<String>
    fun refresh() = println("refreshed " + latest().size)   // calls latest()
}
class RemoteFeed : Feed { override fun latest() = listOf("a", "b", "c") }

class FilteredFeed(inner: Feed) : Feed by inner {
    override fun latest() = listOf("a")
}

val f = FilteredFeed(RemoteFeed())
f.latest().size   // 1: the override
f.refresh()       // "refreshed 3": forwarded, and RemoteFeed uses its own latest()`,
          },
          {
            title: 'The delegate is fixed when the object is built',
            body: `<p><code>by inner</code> evaluates <code>inner</code> once, in the constructor, and stores it in a hidden field. Forwarded calls always go to that stored object. If the constructor parameter is a <code>var</code> and you assign a new value later, the forwarders don't follow.</p>
<p>When the target really has to change at runtime, write the forwarding by hand against a <code>var</code>, or hold the switch inside the delegate.</p>`,
            code: `class SwitchableRepo(var current: NewsRepository) : NewsRepository by current

val repo = SwitchableRepo(networkRepo)
repo.current = offlineRepo
repo.latest()     // still networkRepo: the forwarders use the value from construction`,
          },
          {
            title: 'Android ships decorators too',
            body: `<p><code>ContextWrapper</code> holds a base <code>Context</code> and forwards to it, and its subclasses change a few things. <code>ContextThemeWrapper</code> swaps the theme and forwards everything else. An <code>Activity</code> is itself one of these wrappers.</p>
<p>So when a dialog or a Compose <code>AndroidView</code> needs a different theme, you wrap the context instead of changing the original.</p>`,
            code: `val darkContext = ContextThemeWrapper(context, R.style.Theme_App_Dark)
val view = LayoutInflater.from(darkContext).inflate(R.layout.card, parent, false)
// Same Context interface, different theme. The original context is unchanged.`,
          },
        ],
        underHood: {
          body: `<p>For <code>NewsRepository by inner</code>, the compiler adds a private final field (named like <code>$$delegate_0</code>) and sets it in the constructor. For each interface member you didn't override, it writes an ordinary method that calls the same member on that field. There is no reflection and no proxy at runtime.</p>
<p>This also explains the two rules above. The field is set once, so reassigning the constructor property does nothing. And the delegate is a separate object, so its own <code>this</code> is itself, not the wrapper.</p>`,
          code: `// JVM, simplified
public final class CachingNewsRepository implements NewsRepository {
    private final NewsRepository inner;
    private final NewsRepository $$delegate_0;   // set once in the constructor

    public Object byId(ArticleId id, Continuation c) {
        return $$delegate_0.byId(id, c);          // generated forwarder
    }
    public Object latest(Continuation c) { /* your override */ }
}`,
        },
        mistakes: [
          { title: 'A decorator that extends the concrete class', bad: 'open class NetworkNewsRepository(api: NewsApi) : NewsRepository { /* ... */ }\n\nclass CachingNewsRepository(api: NewsApi) : NetworkNewsRepository(api) {\n    override suspend fun latest() = cache ?: super.latest()\n}', good: 'class CachingNewsRepository(private val inner: NewsRepository) :\n    NewsRepository by inner {\n    override suspend fun latest() = cache ?: inner.latest()\n}', why: 'The subclass version can only cache the network repository, and only once. The wrapper caches any NewsRepository, including another decorator or a fake.' },
          { title: 'Forwarding by hand and forgetting one', bad: 'class LoggingPrefs(private val inner: SharedPreferences) : SharedPreferences {\n    override fun getString(k: String?, d: String?) = inner.getString(k, d)\n    override fun getInt(k: String?, d: Int) = inner.getInt(k, d)\n    // ...12 more, one of them copied wrong\n}', good: 'class LoggingPrefs(private val inner: SharedPreferences) :\n    SharedPreferences by inner {\n    override fun edit(): SharedPreferences.Editor =\n        inner.edit().also { Log.d("Prefs", "edit") }\n}', why: 'Hand-written forwarders are noise where copy-paste bugs hide. With <code>by</code>, only the method you change is in the file.' },
        ],
        visual(el) {
          const LAYERS = [{ k: 'Logging', on: true }, { k: 'Caching', on: true }, { k: 'Retry', on: false }];
          let flaky = false, cache = null, busy = false;
          const stackBox = h('div', { class: 'oo-dlg-stack' });
          const expr = h('div', { class: 'kt oo-wrap' });
          const log = h('div', { class: 'oo-code oo-dlg-log' });
          const o = out('');
          let boxes = {};
          const chain = () => [...LAYERS.filter(l => l.on).map(l => l.k), 'Network'];
          function paint() {
            const c = chain();
            expr.innerHTML = hl('val repo: NewsRepository =\n' + c.map((k, i) => ' '.repeat(2 * (i + 1)) + `${k}NewsRepository(` + (i === c.length - 1 ? 'api' + ')'.repeat(c.length) : '')).join('\n'));
            boxes = {};
            let inner = null;
            for (let i = c.length - 1; i >= 0; i--) {
              const k = c[i];
              const note = { Logging: 'logs each call and its time', Caching: cache ? `holds ${cache} articles` : 'cache empty', Retry: 'retries once on IOException', Network: flaky ? 'first attempt fails' : 'calls the API' }[k];
              const b = h('div', { class: `oo-dlg-layer${k === 'Network' ? ' oo-dlg-core' : ''}` }, h('div', { class: 'oo-dlg-head' }, h('span', { class: 'oo-title' }, `${k}NewsRepository`), h('span', { class: 'oo-stat' }, note)), inner);
              boxes[k] = b; inner = b;
            }
            stackBox.replaceChildren(inner);
          }
          const line = (t, cls = '') => { log.append(h('div', { class: `oo-line ${cls} drop-in`, html: hl(t) })); log.scrollTop = log.scrollHeight; };
          const hot = async (k, on) => { boxes[k].classList.toggle('oo-dlg-hot', on); if (on) await sleep(330); };
          async function visit(c, i, attempt) {
            const k = c[i];
            await hot(k, true); if (!el.isConnected) throw new Error('gone');
            try {
              if (k === 'Network') {
                if (flaky && attempt === 0) { line('Network: IOException', 'oo-ln-err'); throw new Error('io'); }
                line('Network: GET /headlines → 3 articles'); return 3;
              }
              if (k === 'Logging') {
                line('Logging: → latest()');
                try { const n = await visit(c, i + 1, attempt); line(`Logging: ← ${n} articles`, 'oo-ln-ok'); return n; }
                catch (e) { if (e.message === 'gone') throw e; line('Logging: ✗ IOException', 'oo-ln-err'); throw e; }
              }
              if (k === 'Caching') {
                if (cache) { line(`Caching: hit, ${cache} articles, inner not called`, 'oo-ln-ok'); return cache; }
                line('Caching: miss, ask inner');
                const n = await visit(c, i + 1, attempt); cache = n; return n;
              }
              if (k === 'Retry') {
                try { return await visit(c, i + 1, 0); }
                catch (e) { if (e.message === 'gone') throw e; line('Retry: attempt 1 failed, trying again', 'oo-cur'); return await visit(c, i + 1, 1); }
              }
            } finally { if (boxes[k]) boxes[k].classList.remove('oo-dlg-hot'); }
          }
          async function call() {
            if (busy) return; busy = true;
            log.replaceChildren();
            try {
              const n = await visit(chain(), 0, 0);
              paint();
              say(o, `${hl('repo.latest()')} <span class="muted">→</span> <span class="good">${n} articles</span>`);
            } catch (e) {
              if (e.message === 'gone') return;
              paint();
              say(o, `${hl('repo.latest()')} <span class="muted">→</span> <span class="bad">IOException reached the ViewModel.</span> <span class="muted">Add the Retry layer.</span>`);
            }
            busy = false;
          }
          const toggles = LAYERS.map(l => {
            const id = `oo-dlg-${l.k.toLowerCase()}`;
            const inp = h('input', { type: 'checkbox', id, checked: l.on });
            inp.addEventListener('change', () => { if (busy) { inp.checked = l.on; return; } l.on = inp.checked; if (l.k === 'Caching') cache = null; paint(); log.replaceChildren(); say(o, `${l.k} layer ${l.on ? 'added' : 'removed'}. Nothing else changed: each layer only knows the interface.`); });
            return h('label', { class: 'switch', for: id }, inp, l.k);
          });
          const fl = h('input', { type: 'checkbox', id: 'oo-dlg-flaky' });
          fl.addEventListener('change', () => { if (busy) { fl.checked = flaky; return; } flaky = fl.checked; cache = null; paint(); say(o, flaky ? 'The network now fails on the first attempt of each call. Cache cleared.' : 'The network is healthy again.'); });
          paint();
          say(o, 'Call latest() twice. Then make the network flaky and try with and without Retry.');
          el.append(
            h('div', { class: 'oo-switches' }, toggles, h('label', { class: 'switch', for: 'oo-dlg-flaky' }, fl, 'Flaky network')),
            expr,
            h('div', { class: 'oo-pair' }, stackBox, log),
            h('div', { class: 'controls' }, cmd('repo.latest()', call)),
            o);
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'abstraction',
        title: 'Abstraction',
        tagline: 'Depend on what something does, not how it does it.',
        level: 'intermediate',
        body: `
<p>Abstraction means showing callers only the part they need. Pull-to-refresh code needs something it can <code>refresh()</code>. It does not care whether that thing is a news screen, a cache or a sync job.</p>
<p>Kotlin gives you two tools. An <em>interface</em> is a contract: methods and abstract properties, optionally with default bodies, and no stored state. A class can implement many. An <em>abstract class</em> can hold state, take constructor parameters and share code. A class can extend only one.</p>
<p>Reach for an interface first. Use an abstract class when several subclasses truly share state or a fixed sequence of steps. Build a class below and see what the compiler allows and what each caller gets to see.</p>`,
        code: `// Interface: a contract. No state, many per class.
interface Refreshable {
    suspend fun refresh()
}

// Abstract class: shared state and code. Only one per class.
abstract class BaseScreen(protected val name: String) {
    private var shownCount = 0
    fun onShown() { shownCount++; Log.d("Screen", "$name shown $shownCount times") }
    abstract fun render()
}

class HomeScreen(private val repo: NewsRepository) : BaseScreen("home"), Refreshable {
    override fun render() { /* draw headlines */ }
    override suspend fun refresh() = repo.sync()
}

// The pull-to-refresh code only knows "what", never "how"
suspend fun onPull(target: Refreshable) = target.refresh()`,
        remember: 'Interface: a contract, many per class, no state. Abstract class: shared state and code, only one.',
        terms: [
          { term: 'Abstraction', def: 'Exposing only what callers need to use something while hiding how it works.' },
          { term: 'Interface vs abstract class', def: 'An interface is a stateless contract a class can implement many of, while an abstract class can hold state and a class can extend only one.' },
          { term: 'Abstract member', def: 'A method or property declared without a body that every concrete subclass must implement.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Share the dispatcher across repositories and force each one to implement <code>refresh()</code>.', code: '[[abstract]] class Repository(protected val dispatcher: CoroutineDispatcher) {\n    [[abstract]] suspend fun refresh()\n}', why: 'An abstract class can take a constructor parameter and keep it as state. The abstract method has no body, so every subclass must provide one.' },
          { type: 'bug', prompt: 'This interface won’t compile. Tap the wrong line.', code: 'interface Cache {\n    val size: Int = 0\n    fun put(key: String, value: String)\n    fun get(key: String): String?\n}', bug: 1, fix: '    val size: Int   // each implementation provides it', why: 'Interfaces can’t store state, so a property initializer is not allowed. Declare it abstract, or give it a getter like <code>get() = 0</code>.' },
        ],
        quiz: [
          { q: 'Can a class extend two abstract classes?', options: ['Yes', 'No, only one class can appear in the supertype list', 'Only if both are open'], a: 1, why: 'A class has one superclass. It can implement any number of interfaces.' },
          { q: 'A function takes <code>target: Refreshable</code>. What can it call on a <code>HomeScreen</code> passed in?', options: ['Everything HomeScreen has', 'Only what Refreshable declares'], a: 1, why: 'The parameter type is the caller’s view. It sees <code>refresh()</code> and nothing else.' },
          { q: 'When is an abstract class the better fit?', options: ['When subclasses share state or a fixed sequence of steps', 'Whenever you need a contract', 'When you want many supertypes'], a: 0, why: 'Shared state and constructor logic are what an abstract class adds over an interface.' },
        ],
        deeper: [
          {
            title: 'Default methods and the diamond',
            body: `<p>Interface methods can have a default body. An implementing class gets it for free and may override it. The interface still holds no state, so a default body can only use other members of the interface.</p>
<p>If a class implements two interfaces with the same default method, Kotlin won't pick one for you. The class must override it, and it can call either parent with <code>super&lt;Name&gt;.method()</code>.</p>`,
            code: `interface Clickable { fun describe() = "clickable" }
interface Focusable { fun describe() = "focusable" }

class ChipView : Clickable, Focusable {
    override fun describe() =
        super<Clickable>.describe() + " and " + super<Focusable>.describe()
}`,
            visual(el) {
              const BODIES = [
                { src: '// no override', uses: null },
                { src: 'override fun describe() = super<Clickable>.describe()', uses: ['c'], out: '"clickable"' },
                { src: 'override fun describe() = super<Focusable>.describe()', uses: ['f'], out: '"focusable"' },
                { src: 'override fun describe() =\n    super<Clickable>.describe() + " and " + super<Focusable>.describe()', uses: ['c', 'f'], out: '"clickable and focusable"' },
                { src: 'override fun describe() = "chip"', uses: [], out: '"chip"' },
              ];
              let body = BODIES[0], busy = false;
              const ifc = (name, ret) => h('div', { class: 'oo-impl' }, h('b', { html: hl(`interface ${name}`) }), h('span', { html: hl(`fun describe() = "${ret}"`) }));
              const C = ifc('Clickable', 'clickable'), F = ifc('Focusable', 'focusable');
              const cls = h('div', { class: 'kt oo-wrap' });
              const clsCard = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'your class'), cls);
              const o = out('');
              const LABELS = ['none', 'super<Clickable>', 'super<Focusable>', 'both', 'own body'];
              const btns = BODIES.map((b, i) => act(LABELS[i], () => { if (busy) return; body = b; paint(); say(o, b.uses ? 'Now call it.' : 'No override. Try calling it.'); }));
              function paint() {
                press(btns, btns[BODIES.indexOf(body)]);
                cls.innerHTML = hl(`class ChipView : Clickable, Focusable {\n    ${body.src.replace(/\n/g, '\n    ')}\n}`);
                clsCard.className = `oo-card ${body.uses ? 'oo-on' : 'oo-bad'}`;
                [C, F].forEach(x => x.classList.remove('oo-hit'));
              }
              async function call() {
                if (busy) return; busy = true;
                [C, F].forEach(x => x.classList.remove('oo-hit'));
                if (!body.uses) {
                  replay(clsCard, 'shake'); replay(C, 'pop'); replay(F, 'pop');
                  say(o, `<span class="bad">compile error:</span> Class 'ChipView' must override 'describe' because it inherits multiple implementations of it.`);
                  await sleep(400); busy = false; return;
                }
                replay(clsCard, 'pop');
                for (const u of body.uses) {
                  await sleep(350); if (!el.isConnected) return;
                  const t = u === 'c' ? C : F; t.classList.add('oo-hit'); replay(t, 'pop');
                }
                await sleep(300); if (!el.isConnected) return;
                say(o, `${hl('ChipView().describe()')} = ${hl(body.out)}${body.uses.length ? '' : ' <span class="muted">(neither default ran)</span>'}`);
                busy = false;
              }
              paint();
              say(o, 'Both interfaces bring a describe() body. Choose what ChipView does.');
              el.append(
                h('div', { class: 'oo-pair' }, h('div', { class: 'oo-impls' }, C, F), clsCard),
                h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'override'), btns),
                h('div', { class: 'controls' }, cmd('ChipView().describe()', call)),
                o);
            },
          },
          {
            title: 'Leaky abstractions',
            body: `<p>An abstraction leaks when its signature tells callers how it works. <code>suspend fun fetch(): Response&lt;List&lt;ArticleDto&gt;&gt;</code> says "Retrofit" to everyone. The day you add a Room cache, the cache has to pretend to be an HTTP response, and every caller keeps handling HTTP status codes.</p>
<p>Describe results in your own types. <code>suspend fun latest(): List&lt;Article&gt;</code> fits a network source, a database and a test fake equally well.</p>`,
            visual(el) {
              const IFACE = {
                leaky: 'interface NewsSource {\n    suspend fun fetch(): Response<List<ArticleDto>>\n}',
                clean: 'interface NewsSource {\n    suspend fun latest(): List<Article>\n}',
              };
              const IMPL = {
                leaky: {
                  Retrofit: [['override suspend fun fetch() = api.headlines()', 0]],
                  Room: [['override suspend fun fetch() =', 0], ['    Response.success(dao.all().map { it.toDto() })', 1]],
                  Fake: [['override suspend fun fetch() =', 0], ['    Response.success(listOf(ArticleDto("1", "Title")))', 1]],
                },
                clean: {
                  Retrofit: [['override suspend fun latest() =', 0], ['    api.headlines().map { it.toArticle() }', 0]],
                  Room: [['override suspend fun latest() =', 0], ['    dao.all().map { it.toArticle() }', 0]],
                  Fake: [['override suspend fun latest() =', 0], ['    listOf(Article("Title"))', 0]],
                },
              };
              const CALLER = {
                leaky: [['val res = source.fetch()', 0], ['if (res.isSuccessful) show(res.body().orEmpty().map { it.toArticle() })', 1], ['else showError(res.code())', 1]],
                clean: [['show(source.latest())', 0]],
              };
              let style = 'leaky', impl = 'Retrofit';
              const iBox = h('div', { class: 'kt oo-wrap' });
              const implBox = h('div', { class: 'oo-code' });
              const callBox = h('div', { class: 'oo-code' });
              const stat = h('span', { class: 'oo-stat' });
              const o = out('');
              const render = (box, rows, leakOk) => box.replaceChildren(...rows.map(([t, leak]) => h('div', { class: `oo-line${leak && !leakOk ? ' oo-ln-err' : ''} drop-in`, html: hl(t) })));
              const sBtns = [cmd('fun fetch(): Response<...>', () => setStyle('leaky')), cmd('fun latest(): List<Article>', () => setStyle('clean'))];
              const iBtns = ['Retrofit', 'Room', 'Fake'].map(k => cmd(`${k}NewsSource`, () => setImpl(k)));
              function paint() {
                press(sBtns, sBtns[style === 'leaky' ? 0 : 1]); press(iBtns, iBtns[['Retrofit', 'Room', 'Fake'].indexOf(impl)]);
                iBox.innerHTML = hl(IFACE[style]);
                render(implBox, IMPL[style][impl], impl === 'Retrofit');
                render(callBox, CALLER[style], false);
                const n = (impl === 'Retrofit' ? 0 : IMPL[style][impl].filter(r => r[1]).length) + CALLER[style].filter(r => r[1]).length;
                stat.innerHTML = `lines outside the network code that know about HTTP: <b>${n}</b>`;
              }
              function setStyle(s) {
                style = s; paint();
                say(o, s === 'leaky' ? 'The contract returns a Retrofit Response. Now plug in other sources.' : `<span class="good">The contract speaks in your own Article type.</span> ${impl}NewsSource fits, and the ViewModel shrinks to one line.`);
              }
              function setImpl(k) {
                impl = k; paint();
                if (style === 'leaky' && k !== 'Retrofit') { replay(implBox, 'shake'); say(o, `<span class="bad">compiles, but leaks:</span> ${k}NewsSource has to wrap its data in a fake HTTP Response, and the ViewModel still checks status codes that can't happen.`); }
                else if (style === 'leaky') say(o, 'With Retrofit behind it, the leak looks harmless. The red lines are the price every caller pays.');
                else say(o, `<span class="good">${k}NewsSource fits:</span> the ViewModel line never changes.`);
              }
              setStyle('leaky');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'contract'), sBtns), iBox,
                h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'implementation'), iBtns),
                h('div', { class: 'oo-pair' },
                  h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'implementation'), implBox),
                  h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'ViewModel'), callBox)),
                stat, o);
            },
          },
          {
            title: 'fun interface: an abstraction you can write as a lambda',
            body: `<p>An interface with exactly one abstract method can be declared <code>fun interface</code>. Then any lambda with the right shape can implement it, which makes small abstractions cheap to fake.</p>
<p>A clock is the classic case. Production code asks for a <code>Clock</code>, and a test passes a lambda that always returns the same time.</p>`,
            code: `fun interface Clock { fun now(): Instant }

class SessionTimer(private val clock: Clock) {
    private val start = clock.now()
    fun expired(): Boolean =
        Duration.between(start, clock.now()) > Duration.ofMinutes(30)
}

val real = SessionTimer { Instant.now() }
val frozen = SessionTimer { Instant.parse("2026-01-01T10:00:00Z") }`,
          },
        ],
        underHood: {
          body: `<p>A Kotlin interface compiles to a JVM interface. A property like <code>val size: Int</code> becomes an abstract <code>getSize()</code> method with no field behind it, which is why an interface property can't have an initializer.</p>
<p>Default bodies changed in Kotlin 2.2. They now compile to real JVM default methods, plus a <code>DefaultImpls</code> class kept for code compiled with older settings. Before 2.2 the body lived only in <code>DefaultImpls</code>, and each implementing class got a generated method that forwarded to it. An abstract class is an ordinary JVM abstract class, with fields and a constructor.</p>`,
          code: `// Kotlin
interface Cache {
    val size: Int
    fun isEmpty() = size == 0
}

// JVM, simplified (Kotlin 2.2 and later)
public interface Cache {
    int getSize();                                        // no field
    default boolean isEmpty() { return getSize() == 0; }
}`,
        },
        mistakes: [
          { title: 'An abstract class with no state', bad: 'abstract class Refreshable {\n    abstract suspend fun refresh()\n}\nclass NewsViewModel : ViewModel(), Refreshable()\n// error: only one class may appear in a supertype list', good: 'interface Refreshable {\n    suspend fun refresh()\n}\nclass NewsViewModel : ViewModel(), Refreshable {\n    override suspend fun refresh() { /* ... */ }\n}', why: 'A pure contract in an abstract class uses up the single superclass slot. With no shared state, make it an interface.' },
          { title: 'Casting back to the concrete class', bad: 'suspend fun onPull(target: Refreshable) {\n    target.refresh()\n    (target as HomeScreen).scrollToTop()\n}', good: 'interface Refreshable {\n    suspend fun refresh()\n    fun scrollToTop()\n}\nsuspend fun onPull(target: Refreshable) {\n    target.refresh()\n    target.scrollToTop()\n}', why: 'The cast ties the caller to one class again and throws <code>ClassCastException</code> for every other one. If callers need it, it belongs in the contract.' },
          { title: 'Providing the implementation type', bad: '@Provides\nfun newsRepository(db: AppDb): RoomNewsRepository =\n    RoomNewsRepository(db.newsDao())', good: '@Provides\nfun newsRepository(db: AppDb): NewsRepository =\n    RoomNewsRepository(db.newsDao())', why: 'With the concrete return type, every class that injects it asks for <code>RoomNewsRepository</code>. Declare the interface as the type, and the implementation stays swappable.' },
        ],
        visual(el) {
          const supers = [
            { id: 'base', src: 'BaseScreen()', kind: 'class', gives: [['val name', 'inherited'], ['fun onShown()', 'inherited'], ['fun render()', 'implement']] },
            { id: 'sync', src: 'BaseSyncer()', kind: 'class', gives: [['var lastSync', 'inherited'], ['fun sync()', 'implement']] },
            { id: 'refresh', src: 'Refreshable', kind: 'interface', gives: [['fun refresh()', 'implement']] },
            { id: 'track', src: 'Trackable', kind: 'interface', gives: [['val screenName', 'implement'], ['fun trackView()', 'inherited']] },
          ];
          const on = new Set(['base', 'refresh']);
          let viewAs = 'HomeScreen';
          const decl = h('div', { class: 'kt oo-wrap' });
          const status = h('span', { class: 'oo-pill' });
          const members = h('div', { class: 'oo-row' });
          const caller = h('div', { class: 'kt' });
          const sees = h('div', { class: 'oo-row' });
          const buildCard = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'Your class'), decl, status, h('span', { class: 'oo-label' }, 'members'), members);
          const viewCard = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'What a caller sees'), caller, sees);
          const o = out('Toggle supertypes. Then pick the type a caller holds.');
          const chosen = () => supers.filter(s => on.has(s.id));
          function paint() {
            const cs = chosen(), classes = cs.filter(s => s.kind === 'class');
            const list = [...classes, ...cs.filter(s => s.kind === 'interface')];
            decl.innerHTML = hl(`class HomeScreen${list.length ? ' : ' + list.map(s => s.src).join(', ') : ''}`);
            const bad = classes.length > 1;
            status.textContent = bad ? 'error: Only one class may appear in a supertype list' : 'compiles';
            status.className = `oo-pill ${bad ? 'oo-err' : 'oo-ok'}`;
            buildCard.classList.toggle('oo-bad', bad); buildCard.classList.toggle('oo-on', !bad);
            members.replaceChildren(...(cs.length ? cs.flatMap(s => s.gives.map(([m, how]) => pill(how === 'implement' ? `override ${m}` : m, how === 'implement' ? 'oo-warn' : 'oo-acc'))) : [h('span', { class: 'tip' }, 'No supertypes yet.')]));
            const opts = ['HomeScreen', ...cs.map(s => s.src.replace('()', ''))];
            if (!opts.includes(viewAs)) viewAs = 'HomeScreen';
            viewBtns.forEach(b => { b.hidden = !opts.includes(b.dataset.t); b.setAttribute('aria-pressed', String(b.dataset.t === viewAs)); });
            caller.innerHTML = hl(`fun use(x: ${viewAs})`);
            const src = viewAs === 'HomeScreen' ? cs : cs.filter(s => s.src.replace('()', '') === viewAs);
            const ms = src.flatMap(s => s.gives.map(g => g[0]));
            sees.replaceChildren(...(ms.length ? ms.map(m => pill(m.replace(/^(val|var|fun) /, 'x.'), 'oo-acc')) : [h('span', { class: 'tip' }, 'Only HomeScreen’s own members.')]));
            replay(sees, 'pop-soft');
          }
          const viewBtns = ['HomeScreen', ...supers.map(s => s.src.replace('()', ''))].map(t => {
            const b = cmd(`x: ${t}`, () => { viewAs = t; paint(); say(o, t === 'HomeScreen' ? 'Holding the concrete class: every member is visible, and the caller is tied to HomeScreen.' : `Holding ${t}: the caller sees only that contract, so any class with it would do.`); });
            b.dataset.t = t; return b;
          });
          const toggles = supers.map(s => {
            const id = `oo-abs-${s.id}`;
            const inp = h('input', { type: 'checkbox', id, checked: on.has(s.id) });
            inp.addEventListener('change', () => {
              if (inp.checked) on.add(s.id); else on.delete(s.id);
              paint(); replay(decl, 'pop-soft');
              const classes = chosen().filter(x => x.kind === 'class').length;
              if (classes > 1) { replay(buildCard, 'shake'); say(o, '<span class="bad">compile error:</span> a class extends at most one class. Make one of them an interface or a part you hold.'); }
              else say(o, `${s.kind === 'class' ? 'abstract class' : 'interface'} ${s.src.replace('()', '')} ${inp.checked ? 'added' : 'removed'}. <span class="muted">Orange members are yours to implement.</span>`);
            });
            return h('label', { class: 'switch', for: id }, inp, h('span', { html: hl(s.kind === 'class' ? `abstract class ${s.src.replace('()', '')}` : `interface ${s.src}`) }));
          });
          paint();
          el.append(
            h('div', { class: 'oo-switches' }, toggles),
            h('div', { class: 'oo-pair' }, buildCard, viewCard),
            h('div', { class: 'controls' }, viewBtns),
            o);
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'interface-or-abstract',
        title: 'Interfaces vs abstract classes: choosing',
        tagline: 'Answer four questions about state, setup, supertypes and change, and the choice mostly makes itself.',
        level: 'intermediate',
        body: `
<p>The abstraction lesson showed what each one can hold. This one is about picking. Ask four questions. Does the shared code need stored state? Does setup need constructor parameters or checks in <code>init</code>? Will implementers already have a superclass, like <code>ViewModel</code> or <code>Activity</code>? Will one class need to play several roles?</p>
<p>A class has one superclass slot, so the last two questions push hard toward an interface. The first two push toward an abstract class, because an interface can't store state or run a constructor.</p>
<p>When both pulls are real, use both: an interface as the type everyone depends on, plus an optional abstract class that implements it and holds the shared state. Implementers that can spare their superclass slot extend the helper. The rest implement the interface directly. Answer the questions below.</p>`,
        code: `// The type callers depend on
interface ArticleSource {
    val name: String
    suspend fun latest(): List<Article>
}

// Optional helper: shared state and a checked constructor
abstract class CachedArticleSource(
    final override val name: String,
    private val ttl: Duration,
) : ArticleSource {
    init { require(ttl.isPositive()) { "ttl must be positive" } }

    private var cached: List<Article> = emptyList()
    private var fetchedAt = TimeSource.Monotonic.markNow()

    final override suspend fun latest(): List<Article> {
        if (cached.isEmpty() || fetchedAt.elapsedNow() > ttl) {
            cached = fetch(); fetchedAt = TimeSource.Monotonic.markNow()
        }
        return cached
    }
    protected abstract suspend fun fetch(): List<Article>
}

class RssSource(private val rss: RssApi) : CachedArticleSource("RSS", 10.minutes) {
    override suspend fun fetch() = rss.items().map { it.toArticle() }
}

// Already has a superclass: implements the interface directly
class PinnedViewModel : ViewModel(), ArticleSource {
    private val pinned = MutableStateFlow(emptyList<Article>())
    override val name = "Pinned"
    override suspend fun latest() = pinned.value
}`,
        remember: 'Depend on an interface. Add an abstract helper class only when implementers truly share state or setup.',
        terms: [
          { term: 'Skeletal implementation', def: 'An abstract class that implements an interface and does most of the work, leaving a few abstract members to subclasses.' },
          { term: 'Superclass slot', def: 'The single place in a class header for a class to extend. Interfaces don’t use it, so a class can add as many as it needs.' },
          { term: 'Default method', def: 'An interface member with a body. Implementers get it for free and may override it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a read-only list of articles by implementing only <code>size</code> and <code>get</code>.', code: 'class Page(private val items: List<Article>) : [[AbstractList]]<Article>() {\n    override val [[size]]: Int get() = items.size\n    override fun get(index: Int) = items[index]\n}', why: '<code>AbstractList</code> is the standard library’s skeletal implementation of <code>List</code>. You write two members, and <code>contains</code>, <code>indexOf</code>, iteration and the rest come from the helper.' },
          { type: 'bug', prompt: 'You added <code>trending()</code> to an interface with 12 implementations, and none of them compile now. Tap the line to change so they all keep compiling.', code: 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n    suspend fun trending(): List<Article>\n}', bug: 2, fix: '    suspend fun trending(): List<Article> = latest().take(5)', why: 'A new abstract member is a new obligation for every implementer. A default body keeps old implementers compiling, and each can override it when it has something better.' },
        ],
        quiz: [
          { q: 'Implementers are ViewModels. Which do you use for the shared contract?', options: ['An abstract class', 'An interface', 'Either works'], a: 1, why: 'A ViewModel already uses its superclass slot on ViewModel. Only an interface still fits.' },
          { q: 'Every implementation needs the same cache field and a checked constructor. What fits?', options: ['An interface with a cache property', 'An abstract class (often implementing an interface)', 'An object'], a: 1, why: 'Stored state and init checks need a class. Keep the interface as the type if callers should not care.' },
          { q: 'You add a member with a default body to a widely used interface. What happens to existing implementers?', options: ['They all stop compiling', 'They keep compiling and inherit the default', 'They must be made abstract'], a: 1, why: 'Only new abstract members create new obligations. A default body is inherited.' },
        ],
        deeper: [
          {
            title: 'Evolving a contract',
            body: `<p>Interfaces outlive their first version. Adding an abstract member breaks every implementer at once. Adding a member with a body breaks nobody. An abstract class has the same choice: a new <code>abstract</code> method breaks subclasses, a new <code>open</code> method with a body does not.</p>
<p>So plan new members with a sensible default, built from members that already exist. Add <code>trending()</code> both ways below.</p>`,
            visual(el) {
              const IMPLS = ['RssSource', 'ApiSource', 'FakeSource'];
              let mode = 'none', busy = false;
              const iface = h('div', { class: 'kt oo-wrap' });
              const rows = IMPLS.map(n => { const r = h('div', { class: 'oo-enc-row oo-ia-row' }, h('span', { class: 'oo-title' }, `class ${n} : ArticleSource`), h('span', { class: 'oo-pill oo-ok' }, 'compiles')); return r; });
              const o = out('');
              const SRC = {
                none: 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n}',
                abs: 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n    suspend fun trending(): List<Article>\n}',
                def: 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n    suspend fun trending(): List<Article> = latest().take(5)\n}',
              };
              async function set(m) {
                if (busy) return; busy = true;
                mode = m; iface.innerHTML = hl(SRC[m]); replay(iface, 'pop-soft');
                for (const r of rows) {
                  await sleep(220); if (!el.isConnected) return;
                  const bad = m === 'abs';
                  r.className = `oo-enc-row oo-ia-row ${bad ? 'oo-enc-no' : 'oo-enc-yes'}`;
                  r.lastChild.className = `oo-pill ${bad ? 'oo-err' : 'oo-ok'}`;
                  r.lastChild.textContent = bad ? 'error: trending() not implemented' : (m === 'def' ? 'inherits default' : 'compiles');
                  replay(r.lastChild, bad ? 'shake' : 'pop');
                }
                say(o, m === 'abs' ? '<span class="bad">3 of 3 implementers fail.</span> In a real app this is every source, in every module.' : m === 'def' ? '<span class="good">all compile.</span> Each source can override trending() later, when it has real data.' : 'One method. All implementers compile.');
                busy = false;
              }
              iface.innerHTML = hl(SRC.none);
              say(o, 'Add trending() to the interface.');
              el.append(iface,
                h('div', { class: 'controls' }, cmd('suspend fun trending(): List<Article>', () => set('abs')), cmd('= latest().take(5)', () => set('def')), act('Undo', () => set('none'))),
                h('div', { class: 'oo-enc-grid' }, rows), o);
            },
          },
          {
            title: 'Only a class can guard its construction',
            body: `<p>An interface has no constructor, so it can't check its inputs. If every implementation must reject a blank name or a negative timeout, either repeat the check in each one, or put it in an abstract class's <code>init</code> where it runs for every subclass automatically.</p>
<p>The check in the base runs before the subclass's own initialisers, so it is safe to rely on in the subclass.</p>`,
            code: `abstract class Endpoint(val baseUrl: String) {
    init {
        require(baseUrl.startsWith("https://")) { "baseUrl must use https" }
    }
}

class NewsEndpoint : Endpoint("https://api.example.com/")   // ok
class DebugEndpoint : Endpoint("http://10.0.2.2:8080/")     // throws when built`,
          },
          {
            title: 'Sealed interface or sealed class?',
            body: `<p>The same choice shows up with sealed types. A <code>sealed interface</code> lets its cases be any kind of type, including enum classes and objects that already extend something else, and one class can belong to two sealed interfaces. A <code>sealed class</code> lets the cases share state through its constructor.</p>
<p>For UI state and results, a sealed interface is usually enough. Reach for a sealed class when every case carries the same field.</p>`,
            code: `sealed interface LoadError
enum class NetworkError : LoadError { Offline, Timeout }
data class ServerError(val code: Int) : LoadError

sealed class Notice(val id: Long) {          // every case has an id
    class Breaking(id: Long, val title: String) : Notice(id)
    class Promo(id: Long, val url: String) : Notice(id)
}`,
          },
        ],
        underHood: {
          body: `<p>In the class file, a class names exactly one superclass and a list of interfaces. That is the whole reason for the single slot. The superclass's constructor runs as the first step of the subclass's constructor. Interfaces have no constructor at all.</p>
<p>An abstract class's fields live inside each subclass object. An interface's properties are only abstract getter methods, so each implementer must supply its own storage, or a getter that computes the value.</p>`,
          code: `// JVM, simplified
public final class RssSource
    extends CachedArticleSource        // one superclass
    implements ArticleSource { ... }   // any number of interfaces

public interface ArticleSource {
    String getName();                  // no field behind it
    Object latest(Continuation c);
}`,
        },
        mistakes: [
          { title: 'An abstract class just to share helpers', bad: 'abstract class BaseRepository {\n    protected fun <T> retrying(block: () -> T): T = TODO()\n    protected fun log(msg: String) = Log.d("Repo", msg)\n}\nclass NewsRepository : BaseRepository()', good: 'suspend fun <T> retrying(times: Int = 2, block: suspend () -> T): T = TODO()\n\nclass NewsRepository(private val logger: Logger) {\n    suspend fun latest() = retrying { /* ... */ }\n}', why: 'There is no shared state, so the base class only burns the superclass slot and ties every repository to it. Top-level functions and injected parts do the same job.' },
          { title: 'Faking state in an interface', bad: 'interface Pageable {\n    val loaded: MutableList<Article>   // every implementer must expose one\n    fun loadMore() { loaded += fetchPage() }\n    fun fetchPage(): List<Article>\n}', good: 'abstract class Pager {\n    private val loaded = mutableListOf<Article>()\n    val items: List<Article> get() = loaded\n    fun loadMore() { loaded += fetchPage() }\n    protected abstract fun fetchPage(): List<Article>\n}', why: 'The interface forces each class to publish its mutable list, so anyone can change it. Real shared state belongs in a class that keeps it private.' },
        ],
        visual(el) {
          const Q = [
            { k: 'state', label: 'Shared code needs stored state' },
            { k: 'ctor', label: 'Setup needs constructor params or init checks' },
            { k: 'super', label: 'Implementers already extend a class' },
            { k: 'roles', label: 'One class plays several roles' },
          ];
          const on = new Set();
          const verdict = h('span', { class: 'oo-pill' });
          const why = h('div', { class: 'oo-row' });
          const sk = h('div', { class: 'kt oo-wrap' });
          const card = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'verdict'), verdict, why, sk);
          const o = out('');
          function decide() {
            const needClass = on.has('state') || on.has('ctor');
            const needIface = on.has('super') || on.has('roles');
            if (needClass && needIface) return { v: 'interface + abstract helper', cls: 'oo-warn',
              src: 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n}\n\nabstract class CachedSource(\n    ttl: Duration,\n) : ArticleSource {\n    private var cache = emptyList<Article>()\n    // ...shared caching\n}\n\nclass RssSource : CachedSource(10.minutes)\nclass PinnedViewModel :\n    ViewModel(), ArticleSource' };
            if (needClass) return { v: 'abstract class', cls: 'oo-acc',
              src: 'abstract class CachedSource(private val ttl: Duration) {\n    init { require(ttl.isPositive()) }\n    private var cached: List<Article> = emptyList()\n    protected abstract suspend fun fetch(): List<Article>\n}' };
            return { v: 'interface', cls: 'oo-ok',
              src: on.has('roles') ? 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n}\ninterface Searchable {\n    suspend fun search(q: String): List<Article>\n}\n\nclass ApiSource : ArticleSource, Searchable' : 'interface ArticleSource {\n    suspend fun latest(): List<Article>\n}' };
          }
          function paint(changed) {
            const d = decide();
            verdict.textContent = d.v; verdict.className = `oo-pill ${d.cls}`;
            sk.innerHTML = hl(d.src);
            const reasons = [];
            if (on.has('state')) reasons.push(['needs a class: interfaces store no state', 'oo-acc']);
            if (on.has('ctor')) reasons.push(['needs a class: interfaces have no constructor', 'oo-acc']);
            if (on.has('super')) reasons.push(['needs an interface: superclass slot taken', 'oo-ok']);
            if (on.has('roles')) reasons.push(['needs interfaces: one class, many types', 'oo-ok']);
            if (!reasons.length) reasons.push(['nothing forces a class: default to an interface', 'oo-ghost']);
            why.replaceChildren(...reasons.map(([t, c]) => pill(t, c)));
            if (changed) { replay(verdict, 'pop'); say(o, `<span class="muted">verdict:</span> <b>${d.v}</b>`); }
          }
          const boxes = Q.map(q => {
            const id = `oo-ia-${q.k}`;
            const inp = h('input', { type: 'checkbox', id });
            inp.addEventListener('change', () => { if (inp.checked) on.add(q.k); else on.delete(q.k); paint(true); });
            return h('label', { class: 'switch oo-ia-q', for: id }, inp, q.label);
          });
          const presets = [
            ['Implementers are ViewModels', ['super']],
            ['3 HTTP sources sharing a TTL cache', ['state', 'ctor']],
            ['Cached sources, one is a ViewModel', ['state', 'super']],
          ].map(([label, ks]) => act(label, () => { on.clear(); ks.forEach(k => on.add(k)); Q.forEach((q, i) => { boxes[i].firstChild.checked = on.has(q.k); }); paint(true); }));
          paint(false);
          say(o, 'Tick what is true for your case, or load an example.');
          el.append(
            h('div', { class: 'oo-ia-qs' }, boxes),
            h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'examples'), presets),
            card, o);
        },
      },

      // 10 ─────────────────────────────────────────────
      {
        id: 'cohesion-coupling',
        title: 'Cohesion and coupling',
        tagline: 'Keep together what changes together. Keep apart what doesn’t, and point dependencies at stable things.',
        level: 'intermediate',
        body: `
<p><em>Cohesion</em> is how much the parts of one class belong together. You can check it without opinions: list the methods, list the fields, and mark which method uses which field. If the methods fall into groups that never share a field, the class is several classes sharing a file.</p>
<p><em>Coupling</em> is how much a class knows about others: how many types it imports, and how deep it reaches into them. Each one is a reason it may have to change when someone else changes.</p>
<p>Aim for high cohesion and low coupling. The single responsibility lesson asked <em>who</em> requests changes. This one measures. Below is a <code>NewsViewModel</code> that grew. Group the matrix by shared fields and see the classes hiding in it.</p>`,
        code: `// Before: 4 groups of methods that share no fields
class NewsViewModel(
    private val api: NewsApi,
    private val dao: BookmarkDao,
    private val locale: Locale,
    private val analytics: FirebaseAnalytics,
) : ViewModel() {
    fun load() { /* api, articles */ }
    fun search(q: String) { /* articles, query */ }
    fun toggleBookmark(id: String) { /* dao, bookmarks */ }
    fun formatDate(t: Instant): String { /* locale */ TODO() }
    fun trackScroll(depth: Int) { /* analytics */ }
}

// After: each class is cohesive, and the ViewModel knows fewer types
class NewsViewModel(
    private val news: NewsRepository,
    private val bookmarks: BookmarkRepository,
    private val dates: ArticleDateFormatter,
    private val tracker: ScrollTracker,
) : ViewModel()`,
        remember: 'Methods that share fields belong together. Each type a class knows is one more reason for it to change.',
        terms: [
          { term: 'Cohesion', def: 'How closely the parts of a class or module relate. High cohesion: its methods work on the same data toward one purpose.' },
          { term: 'Coupling', def: 'How much one class or module depends on, and knows about, others.' },
          { term: 'Fan-in', def: 'How many modules depend on a given module. High fan-in means a change there ripples widely.' },
          { term: 'Law of Demeter', def: 'A guideline to talk only to your direct collaborators, not to the objects they return, so you don’t depend on their insides.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use <code>:core:data</code> inside this module without exposing it to modules that depend on you.', code: 'dependencies {\n    [[implementation]](project(":core:data"))\n}', why: '<code>implementation</code> keeps the dependency off the compile classpath of your consumers, so they can’t couple to it, and a change in it recompiles fewer modules. <code>api</code> would export it.' },
          { type: 'bug', prompt: 'This button knows the ViewModel, its repository and the database table. Tap the line that couples it too tightly.', code: 'class BookmarkButton(private val vm: NewsViewModel) {\n    fun onClick(id: String) {\n        vm.repository.dao.insert(BookmarkEntity(id))\n    }\n}', bug: 2, fix: '        vm.toggleBookmark(id)', why: 'The chain reaches through two objects into a Room entity. Any change to the repository or the table breaks a button. Ask your direct collaborator to do it.' },
        ],
        quiz: [
          { q: 'Two groups of methods in a class never touch the same field. What does that suggest?', options: ['High cohesion', 'Two classes in one file', 'Nothing, it is normal'], a: 1, why: 'Methods that share no data have no reason to live together. Split along the groups.' },
          { q: '<code>:core:model</code> is used by every other module. How often should it change?', options: ['Often, it is central', 'Rarely: every change ripples to all its dependents', 'It doesn’t matter'], a: 1, why: 'High fan-in makes a module expensive to change. Keep it small and stable, and keep volatile code where few depend on it.' },
          { q: 'Which is the loosest coupling?', options: ['Receiving an id String', 'Holding a concrete repository', 'Reaching into repo.dao'], a: 0, why: 'Plain data carries no behaviour to depend on. Each step down the list knows more about someone else’s internals.' },
        ],
        deeper: [
          {
            title: 'Point dependencies at stable things',
            body: `<p>A change ripples to everything that depends on what changed, directly or through others. So the cost of changing a module grows with how many modules sit above it.</p>
<p>Arrange modules so that the ones many others depend on are the ones that rarely change, like plain models. Code that changes every sprint, like a feature screen, should sit where almost nothing depends on it. Pick a module below and change it.</p>`,
            visual(el) {
              const MODS = [
                { k: ':app', deps: [':feature:news', ':feature:bookmarks'] },
                { k: ':feature:news', deps: [':core:data', ':core:ui', ':core:model'] },
                { k: ':feature:bookmarks', deps: [':core:data', ':core:ui', ':core:model'] },
                { k: ':core:data', deps: [':core:model'] },
                { k: ':core:ui', deps: [':core:model'] },
                { k: ':core:model', deps: [] },
              ];
              let busy = false;
              const nodes = {};
              const grid = h('div', { class: 'oo-coh-mods' }, MODS.map(m => { const n = h('div', { class: 'oo-node' }, h('b', {}, m.k), h('span', { class: 'oo-stat' }, m.deps.length ? ` → ${m.deps.join(', ')}` : ' → nothing')); nodes[m.k] = n; return n; }));
              const o = out('');
              const dependents = k => {
                const out2 = new Set(), todo = [k];
                while (todo.length) { const x = todo.pop(); MODS.forEach(m => { if (m.deps.includes(x) && !out2.has(m.k)) { out2.add(m.k); todo.push(m.k); } }); }
                return [...out2];
              };
              async function change(k) {
                if (busy) return; busy = true;
                Object.values(nodes).forEach(n => n.classList.remove('oo-cur', 'oo-hot'));
                nodes[k].classList.add('oo-cur'); replay(nodes[k], 'pop');
                const ds = dependents(k);
                for (const d of ds) { await sleep(220); if (!el.isConnected) return; nodes[d].classList.add('oo-hot'); replay(nodes[d], 'shake'); }
                say(o, ds.length ? `Change ${k} <span class="muted">→</span> <span class="${ds.length > 2 ? 'bad' : 'good'}">${ds.length} module${ds.length > 1 ? 's' : ''} to rebuild and retest</span> <span class="muted">(${ds.join(', ')})</span>` : `Change ${k} <span class="muted">→</span> <span class="good">nothing depends on it.</span>`);
                busy = false;
              }
              say(o, 'Change a module and see what has to be rebuilt.');
              el.append(grid, h('div', { class: 'controls' }, MODS.map(m => act(`change ${m.k}`, () => change(m.k)))), o);
            },
          },
          {
            title: 'Talk to friends, not to strangers',
            body: `<p>A chain like <code>article.author.profile.avatar.url</code> couples your code to four classes and the shape of each. If the profile moves the avatar, every chain in the app breaks.</p>
<p>Ask the nearest object for what you need, and let it decide where that comes from. This is the Law of Demeter. Data-only chains on your own immutable models are fine. The problem is reaching through objects that have behaviour and change.</p>`,
            code: `// Couples the screen to Author, Profile and Avatar
AsyncImage(model = article.author.profile.avatar.url, contentDescription = null)

// The mapper that builds UI state knows the structure, once
data class ArticleUi(val title: String, val authorAvatarUrl: String?)
fun Article.toUi() = ArticleUi(title, author.profile.avatar?.url)

AsyncImage(model = ui.authorAvatarUrl, contentDescription = null)`,
          },
          {
            title: 'Low cohesion across files: shotgun surgery',
            body: `<p>Cohesion can also be too low in the other direction. If one small rule is copied into six screens, a change to it means editing six files and hoping you found them all. That is <em>shotgun surgery</em>.</p>
<p>Code that always changes together should live together, even if it ends up in one larger class. File size is not the measure. What changes together is.</p>`,
            code: `// Spread over 6 screens
if (BuildConfig.FLAVOR == "tr" && user.isSignedIn && remoteConfig.getBoolean("live_scores")) { /* ... */ }

// One place owns the rule
class LiveScoresPolicy(private val config: FirebaseRemoteConfig, private val market: Market) {
    fun canShow(user: User): Boolean =
        market == Market.TR && user.isSignedIn && config.getBoolean("live_scores")
}`,
          },
        ],
        underHood: {
          body: `<p>Gradle makes module coupling concrete. With <code>implementation</code>, a dependency is visible only to the module that declares it. With <code>api</code>, it is exported to every module that depends on that module.</p>
<p>That changes build cost. If an <code>implementation</code> dependency changes its API, Gradle recompiles it and the modules that depend on it directly. If an <code>api</code> dependency changes, every module that can see it recompiles. Low coupling shows up as faster builds.</p>`,
          code: `// :core:data/build.gradle.kts
dependencies {
    api(project(":core:model"))        // consumers see Article: part of our API
    implementation(libs.retrofit)      // consumers can't import Retrofit types
    implementation(libs.room.runtime)
}`,
        },
        mistakes: [
          { title: 'A ViewModel that knows the libraries', bad: 'class NewsViewModel(\n    private val retrofit: Retrofit,\n    private val db: AppDatabase,\n    private val firebase: FirebaseAnalytics,\n) : ViewModel()', good: 'class NewsViewModel(\n    private val news: NewsRepository,\n    private val tracker: ScreenTracker,\n) : ViewModel()', why: 'Swapping Retrofit, the database or the analytics vendor now edits the ViewModel and every test that builds it. Depend on small types you own.' },
          { title: 'Grouping by kind instead of by purpose', bad: 'utils/\n    DateUtils.kt\n    StringUtils.kt\n    ViewUtils.kt\nhelpers/\n    BookmarkHelper.kt', good: 'news/\n    ArticleDateFormatter.kt\n    NewsRepository.kt\nbookmarks/\n    BookmarkRepository.kt', why: 'A utils folder collects unrelated code because it has the same shape. Put code next to the feature it serves, so one change stays in one place.' },
        ],
        visual(el) {
          const F = ['articles', 'locale', 'bookmarks', 'api', 'analytics', 'query', 'dao'];
          const M = [
            { k: 'load()', uses: ['articles', 'api'], g: 0 },
            { k: 'formatDate(t)', uses: ['locale'], g: 2 },
            { k: 'toggleBookmark(id)', uses: ['bookmarks', 'dao'], g: 1 },
            { k: 'search(q)', uses: ['articles', 'query'], g: 0 },
            { k: 'trackScroll(d)', uses: ['analytics'], g: 3 },
            { k: 'isBookmarked(id)', uses: ['bookmarks'], g: 1 },
            { k: 'refresh()', uses: ['articles', 'api'], g: 0 },
          ];
          const G = [['NewsViewModel', 'articles, query, api'], ['BookmarkRepository', 'bookmarks, dao'], ['ArticleDateFormatter', 'locale'], ['ScrollTracker', 'analytics']];
          const FG = { articles: 0, query: 0, api: 0, bookmarks: 1, dao: 1, locale: 2, analytics: 3 };
          const CHANGES = [
            { label: 'API v2 renames fields', f: ['api'] },
            { label: 'Bookmarks sync to server', f: ['bookmarks', 'dao'] },
            { label: '“Bugün” for today’s dates', f: ['locale'] },
            { label: 'New analytics vendor', f: ['analytics'] },
          ];
          let grouped = false, busy = false;
          const table = h('div', { class: 'oo-coh-grid' });
          const stat = h('div', { class: 'oo-row' });
          const split = h('div', { class: 'oo-coh-split' });
          const o = out('');
          const pairsShare = ms => { let s = 0, t = 0; for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) { t++; if (ms[i].uses.some(u => ms[j].uses.includes(u))) s++; } return t ? Math.round(100 * s / t) : 100; };
          function paint(hotF = []) {
            const fs = grouped ? [...F].sort((a, b) => FG[a] - FG[b]) : F;
            const ms = grouped ? [...M].sort((a, b) => a.g - b.g) : M;
            table.style.gridTemplateColumns = `minmax(0, 1fr) repeat(${fs.length}, 22px)`;
            table.replaceChildren(h('span', {}),
              ...fs.map(f => h('span', { class: `oo-coh-f${hotF.includes(f) ? ' oo-coh-hotf' : ''}` }, f)),
              ...ms.flatMap(m => {
                const hit = m.uses.some(u => hotF.includes(u));
                return [h('span', { class: `oo-coh-m${hit ? ' oo-coh-hotm' : ''}`, html: hl(m.k) }),
                  ...fs.map(f => h('span', { class: `oo-coh-cell${grouped ? ' oo-coh-g' + FG[f] : ''}` }, m.uses.includes(f) ? h('span', { class: `oo-coh-dot${grouped ? ' oo-coh-g' + m.g : ''}${hit && m.uses.includes(f) ? ' oo-coh-hotd' : ''}` }) : null))];
              }));
            stat.replaceChildren(pill(`method pairs sharing a field: ${pairsShare(M)}%`, pairsShare(M) < 50 ? 'oo-err' : 'oo-ok'), pill('outside types it knows: 4', 'oo-warn'));
          }
          async function group() {
            if (busy) return; busy = true;
            grouped = !grouped; paint(); replay(table, 'pop-soft');
            say(o, grouped ? 'Sorted by shared fields: <span class="good">four blocks</span> appear, and no block shares a field with another.' : 'Back to the order the methods were written in.');
            busy = false;
          }
          async function doSplit() {
            if (busy) return; busy = true;
            if (!grouped) { grouped = true; paint(); await sleep(400); if (!el.isConnected) return; }
            split.replaceChildren();
            for (let i = 0; i < G.length; i++) {
              const ms = M.filter(m => m.g === i);
              split.append(h('div', { class: `oo-card oo-coh-cls oo-coh-b${i} drop-in` }, h('span', { class: 'oo-title' }, G[i][0]), h('span', { class: 'oo-stat' }, G[i][1]), h('div', { class: 'oo-row' }, ms.map(m => pill(m.k))), pill(`pairs sharing: ${pairsShare(ms)}%`, 'oo-ok')));
              await sleep(260); if (!el.isConnected) return;
            }
            say(o, '<span class="good">Four cohesive classes.</span> The ViewModel now holds four small types it owns, instead of four libraries.');
            busy = false;
          }
          function change(c) {
            if (busy) return;
            paint(c.f);
            const hitM = M.filter(m => m.uses.some(u => c.f.includes(u)));
            say(o, `“${c.label}” <span class="muted">→ touches</span> ${hitM.map(m => hl(m.k)).join(', ')} <span class="muted">only. Yet the whole NewsViewModel gets edited, reviewed and retested.</span>`);
          }
          paint();
          say(o, 'Dots show which method uses which field. Group them, or send a change request.');
          el.append(
            h('div', { class: 'oo-card' }, h('span', { class: 'oo-label oo-raw' }, 'NewsViewModel: methods × fields'), table, stat),
            h('div', { class: 'controls' }, act('Group by shared fields', group), act('Split into classes', doSplit)),
            h('div', { class: 'controls' }, h('span', { class: 'oo-label' }, 'change request'), CHANGES.map(c => act(c.label, () => change(c)))),
            split, o);
        },
      },

      // 11 ─────────────────────────────────────────────
      {
        id: 'domain-modeling',
        title: 'Modeling a domain',
        tagline: 'Turn a feature description into types that make wrong states hard to write.',
        level: 'advanced',
        body: `
<p>Start from the words of the feature, not from the database or the screen. Nouns become types. Verbs become methods, usually on a repository or the object that owns the data. Rules like “never empty” become checks that run when an object is built.</p>
<p>Two kinds of types come out. An <em>entity</em> has identity that lasts while its data changes: an article is the same article after its headline is fixed, and its id says so. A <em>value object</em> is defined by its value alone: an <code>ArticleId</code> or a category slug. Value objects are small, immutable, and compared with <code>==</code>.</p>
<p>The payoff is that the compiler starts checking the business rules. An <code>ArticleId</code> can't be passed where a <code>UserId</code> is expected, and an <code>Article</code> with a blank title can't exist. Click the highlighted words below to build the model of a news app.</p>`,
        code: `@JvmInline value class ArticleId(val raw: String) {
    init { require(raw.isNotBlank()) { "ArticleId is blank" } }
}
@JvmInline value class CategorySlug(val raw: String)

data class Category(val slug: CategorySlug, val name: String)

data class Article(                      // entity: identified by id
    val id: ArticleId,
    val title: String,
    val publishedAt: Instant,
    val category: CategorySlug,
    val isBreaking: Boolean,
) {
    init { require(title.isNotBlank()) { "Article " + id.raw + " has a blank title" } }
}

data class Bookmark(val articleId: ArticleId, val savedAt: Instant)   // points by id

interface ArticleRepository {
    fun articles(category: CategorySlug): Flow<List<Article>>
}
interface BookmarkStore {                // local, so it works offline
    fun all(): Flow<List<Bookmark>>
    suspend fun toggle(id: ArticleId)
}`,
        remember: 'Nouns become types, rules become init checks, ids get their own types, and states become sealed cases.',
        terms: [
          { term: 'Entity', def: 'A domain object with lasting identity, usually an id, that stays the same thing while its data changes.' },
          { term: 'Value object', def: 'A small immutable type defined only by its value, such as an id or an amount, compared with ==.' },
          { term: 'Primitive obsession', def: 'Using raw String, Int or Boolean for domain ideas, so the compiler can’t tell them apart.' },
          { term: 'Illegal state', def: 'A combination of values that should never happen but that the types still allow.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make an article id a zero-cost wrapper that can never be blank.', code: '@JvmInline\n[[value]] class ArticleId(val raw: String) {\n    init { [[require]](raw.isNotBlank()) { "ArticleId is blank" } }\n}', why: 'A value class wraps one value with almost no runtime cost, and its <code>init</code> check runs every time one is built. <code>require</code> throws <code>IllegalArgumentException</code> when the condition is false.' },
          { type: 'bug', prompt: 'An editor fixes a headline, but the bookmarks screen keeps showing the old one. Tap the line that stores too much.', code: 'data class Bookmark(\n    val article: Article,\n    val savedAt: Instant,\n)', bug: 1, fix: '    val articleId: ArticleId,', why: 'The bookmark froze a copy of the article. Store the id and look the article up, so there is one source of truth for its data.' },
        ],
        quiz: [
          { q: 'Which is a value object in a news app?', options: ['Article', 'CategorySlug', 'BookmarkStore'], a: 1, why: 'Two equal slugs are interchangeable. An article has identity, and a store is a service with behaviour.' },
          { q: 'Where should “a title is never blank” be enforced?', options: ['In every screen that shows titles', 'In Article’s init block', 'In the database only'], a: 1, why: 'If the constructor checks it, no Article with a blank title can exist anywhere in the app.' },
          { q: 'Why model screen state as a sealed type instead of isLoading, error and articles fields together?', options: ['It is shorter to write', 'It rules out combinations like loading with an error at the same time', 'Compose requires it'], a: 1, why: 'Separate flags allow every combination. Sealed cases allow exactly the states you list.' },
        ],
        deeper: [
          {
            title: 'Give ids their own types',
            body: `<p>When every id is a <code>String</code>, swapping two arguments compiles and quietly writes the wrong row. A value class per id turns that into a compile error, and on the JVM it is usually stored as the bare string, so it costs almost nothing.</p>
<p>Call the bookmark function both ways, with and without value classes.</p>`,
            code: `@JvmInline value class UserId(val raw: String)
@JvmInline value class ArticleId(val raw: String)

fun saveBookmark(user: UserId, article: ArticleId) { /* ... */ }

saveBookmark(article.id, user.id)   // compile error: argument type mismatch`,
            visual(el) {
              let typed = false, busy = false;
              const sig = h('div', { class: 'kt oo-wrap' });
              const res = h('div', { class: 'oo-row' });
              const o = out('');
              const sw = h('input', { type: 'checkbox', id: 'oo-dom-typed' });
              function paint() { sig.innerHTML = hl(typed ? 'fun saveBookmark(user: UserId, article: ArticleId)' : 'fun saveBookmark(userId: String, articleId: String)'); res.replaceChildren(); }
              sw.addEventListener('change', () => { typed = sw.checked; paint(); say(o, typed ? 'Ids are now separate types.' : 'Ids are plain Strings.'); });
              async function callIt(swapped) {
                if (busy) return; busy = true;
                const expr = swapped ? 'saveBookmark(article.id, user.id)' : 'saveBookmark(user.id, article.id)';
                res.replaceChildren();
                await sleep(200); if (!el.isConnected) return;
                if (!swapped) { res.append(pill('user = "u-7"', 'oo-ok drop-in'), pill('article = "a-42"', 'oo-ok drop-in')); say(o, `${hl(expr)} <span class="muted">→</span> <span class="good">saved correctly</span>`); }
                else if (!typed) { res.append(pill('user = "a-42"', 'oo-err drop-in'), pill('article = "u-7"', 'oo-err drop-in')); replay(res, 'shake'); say(o, `${hl(expr)} <span class="muted">→</span> <span class="bad">compiles and runs.</span> <span class="muted">A bookmark for user "a-42" now exists. Nobody notices until a bug report.</span>`); }
                else { replay(sig, 'shake'); say(o, `${hl(expr)} <span class="muted">→</span> <span class="bad">compile error:</span> argument type mismatch, UserId expected but ArticleId given. <span class="good">Caught before it ships.</span>`); }
                busy = false;
              }
              paint();
              say(o, 'Call it the right way, then with the arguments swapped.');
              el.append(h('label', { class: 'switch', for: 'oo-dom-typed' }, sw, 'Use value classes for ids'), sig,
                h('div', { class: 'controls' }, cmd('saveBookmark(user.id, article.id)', () => callIt(false)), cmd('saveBookmark(article.id, user.id)', () => callIt(true))),
                res, o);
            },
          },
          {
            title: 'Check invariants in init, map at the edges',
            body: `<p>An <code>init</code> block with <code>require</code> runs on every construction, including <code>copy()</code>. Once the check passes, every function that receives an <code>Article</code> can trust it and skip its own checks.</p>
<p>Server data is not under your control, so don't let a bad JSON field crash the app. Convert DTOs to domain objects in one mapper, catch the failure there, and drop or report the bad item.</p>`,
            code: `fun ArticleDto.toDomainOrNull(): Article? = runCatching {
    Article(
        id = ArticleId(id),
        title = title.orEmpty(),
        publishedAt = Instant.parse(published_at),
        category = CategorySlug(category),
        isBreaking = flags.contains("breaking"),
    )
}.getOrNull()                       // bad item: skip it, log it

val articles = dtos.mapNotNull { it.toDomainOrNull() }`,
            visual(el) {
              const TRIES = [
                { src: 'Article(ArticleId("a-42"), title = "Derbi 2-2", ...)', ok: true, msg: 'built. Every function that gets it can trust the title.' },
                { src: 'Article(ArticleId("a-43"), title = "   ", ...)', ok: false, msg: 'IllegalArgumentException: Article a-43 has a blank title' },
                { src: 'ArticleId("")', ok: false, msg: 'IllegalArgumentException: ArticleId is blank' },
                { src: 'good.copy(title = "")', ok: false, msg: 'IllegalArgumentException: Article a-42 has a blank title  (copy() runs init too)' },
              ];
              const o = out('');
              const gate = h('div', { class: 'oo-vault' }, h('span', { class: 'oo-label oo-raw' }, 'init { require(title.isNotBlank()) }'), h('div', { class: 'oo-items' }));
              el.append(h('div', { class: 'controls' }, TRIES.map(t => cmd(t.src, () => {
                const box = gate.lastChild;
                if (t.ok) { box.append(pill('Article a-42', 'oo-ok drop-in')); replay(gate, 'pop'); }
                else { gate.classList.add('oo-open'); replay(gate, 'shake'); setTimeout(() => gate.classList.remove('oo-open'), 700); }
                say(o, `${hl(t.src)} <span class="muted">→</span> <span class="${t.ok ? 'good' : 'bad'}">${t.msg}</span>`);
              }))), gate, o);
              say(o, 'Try to build articles. Only valid ones get through.');
            },
          },
          {
            title: 'Make illegal states unrepresentable',
            body: `<p>A screen state with <code>isLoading</code>, <code>error</code> and <code>articles</code> as separate fields allows eight combinations, and only four make sense. Nothing stops a loading spinner on top of an error message.</p>
<p>A sealed interface lists the states that can really happen. Each case carries only the data it needs, and a <code>when</code> over it must handle every case.</p>`,
            code: `// 2 × 2 × 2 = 8 combinations, 4 of them nonsense
data class FeedUi(val isLoading: Boolean, val error: String?, val articles: List<Article>)

// Exactly the states that exist
sealed interface FeedUiState {
    data object Loading : FeedUiState
    data object Empty : FeedUiState
    data class Content(val articles: List<Article>, val refreshing: Boolean) : FeedUiState
    data class Error(val message: String) : FeedUiState
}`,
          },
        ],
        underHood: {
          body: `<p>A value class compiles to its underlying type wherever possible. A function that takes <code>ArticleId</code> takes a <code>String</code> in the bytecode, with a mangled name so it can't clash with a real <code>String</code> overload. The wrapper object is only allocated when the value is used as another type, for example as the element type of a <code>List&lt;ArticleId&gt;</code>.</p>
<p>The <code>init</code> block still runs. Construction goes through a static check method, so <code>ArticleId("")</code> throws even though no wrapper object is created.</p>`,
          code: `// Kotlin
fun open(id: ArticleId) { /* ... */ }

// JVM, simplified
public static final void open-<hash>(String id)   // takes the raw String
public static String constructor-impl(String raw) {
    require(!raw.isBlank())                       // init runs here
    return raw
}`,
        },
        mistakes: [
          { title: 'Strings for everything', bad: 'fun saveBookmark(userId: String, articleId: String)\nfun open(articleId: String, categorySlug: String)', good: 'fun saveBookmark(user: UserId, article: ArticleId)\nfun open(article: ArticleId, category: CategorySlug)', why: 'Every swap compiles. Value classes make each id a separate type at almost no runtime cost.' },
          { title: 'Modelling from the API response', bad: 'data class Article(\n    val id: String?,\n    val title: String?,\n    val published_at: String?,\n    val flags: List<String>?,\n)', good: 'data class Article(\n    val id: ArticleId,\n    val title: String,\n    val publishedAt: Instant,\n    val isBreaking: Boolean,\n)\n// ArticleDto keeps the server shape; a mapper converts it', why: 'The server’s nullable, stringly shape spreads into every screen, and each one handles nulls differently. Keep the DTO at the edge and give the app a clean model.' },
        ],
        visual(el) {
          const WORDS = {
            articles: { kind: 'entity', cls: 'oo-acc', src: 'data class Article(\n    val id: ArticleId,\n    val title: String,\n    val publishedAt: Instant,\n    val category: CategorySlug,\n    val isBreaking: Boolean,\n)' },
            id: { kind: 'value object', cls: 'oo-ok', src: '@JvmInline value class ArticleId(val raw: String)' },
            category: { kind: 'value object', cls: 'oo-ok', src: '@JvmInline value class CategorySlug(val raw: String)\ndata class Category(val slug: CategorySlug, val name: String)' },
            'never empty': { kind: 'invariant', cls: 'oo-warn', src: '// in Article\ninit { require(title.isNotBlank()) }' },
            breaking: { kind: 'state', cls: 'oo-acc', src: '// in Article\nval isBreaking: Boolean' },
            browse: { kind: 'behaviour', cls: 'oo-warn', src: 'interface ArticleRepository {\n    fun articles(category: CategorySlug): Flow<List<Article>>\n}' },
            bookmark: { kind: 'value object', cls: 'oo-ok', src: 'data class Bookmark(val articleId: ArticleId, val savedAt: Instant)' },
            offline: { kind: 'behaviour', cls: 'oo-warn', src: 'interface BookmarkStore {   // backed by Room\n    fun all(): Flow<List<Bookmark>>\n    suspend fun toggle(id: ArticleId)\n}' },
          };
          const found = new Set();
          const model = h('div', { class: 'oo-dom-model' });
          const count = h('span', { class: 'oo-stat' });
          const o = out('');
          const w = k => { const b = h('button', { class: 'oo-dom-word', type: 'button', onclick: () => pick(k, b) }, k); return b; };
          const spec = h('p', { class: 'oo-dom-spec' },
            'Readers ', w('browse'), ' ', w('articles'), ' by ', w('category'), '. Every article has its own ', w('id'), ', a title that is ', w('never empty'), ', a publish time and a category. ',
            'Articles marked ', w('breaking'), ' get a red badge. Readers can ', w('bookmark'), ' an article and see their bookmarks ', w('offline'), '.');
          function paintCount() { count.innerHTML = `found <b>${found.size}</b> of ${Object.keys(WORDS).length}`; }
          function pick(k, btn) {
            const d = WORDS[k];
            if (found.has(k)) { const c = model.querySelector(`[data-k="${k}"]`); if (c) { c.classList.add('oo-flash'); replay(c, 'oo-flash'); } return; }
            found.add(k); btn.classList.add('oo-dom-done');
            const card = h('div', { class: 'oo-card oo-dom-card drop-in', 'data-k': k }, h('div', { class: 'oo-row' }, pill(d.kind, d.cls), h('span', { class: 'oo-label oo-raw' }, `“${k}”`)), kt(d.src));
            card.querySelector('.kt').classList.add('oo-wrap');
            model.prepend(card); paintCount();
            const hint = { entity: 'a thing with its own identity: it gets an id and keeps it.', 'value object': 'defined by its value alone. Small, immutable, compared with ==.', invariant: 'a rule. It becomes a check in init, so no invalid object can exist.', state: 'data the object carries.', behaviour: 'a verb. It becomes a method on the type that owns the data.' }[d.kind];
            say(o, found.size === Object.keys(WORDS).length ? '<span class="good">Model complete.</span> Eight words, a handful of small types, and two rules the compiler and init enforce.' : `<b>${k}</b> <span class="muted">→</span> ${d.kind}: ${hint}`);
          }
          paintCount();
          say(o, 'Tap the highlighted words in the feature description.');
          el.append(h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'feature description'), spec, count), model, o);
        },
      },
    ],
  });
})();
