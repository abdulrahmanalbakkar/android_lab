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
`;

  Lab.addTrack({
    id: 'oop',
    title: 'OOP basics',
    description: 'Encapsulation, composition, polymorphism and abstraction, the building blocks of classes that stay easy to change, with Kotlin and Android examples.',
    group: 'Foundations',
    requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
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

      // 2 ─────────────────────────────────────────────
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
<p>This is still composition. <code>LoggingList</code> holds a list. It does not extend any list class, so it can't break when one changes. The Kotlin, deeper track covers delegation in detail.</p>`,
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

      // 3 ─────────────────────────────────────────────
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

      // 4 ─────────────────────────────────────────────
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
    ],
  });
})();
