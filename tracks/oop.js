/* OOP and SOLID track. Same shape as tracks/kotlin.js.
   Principles, not syntax: Kotlin class/interface syntax lives in the Kotlin track.
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

/* 5 single responsibility */
.oo-classes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 10px; min-width: 0; }

/* 7 liskov */
.oo-canvas { display: grid; place-items: center; min-height: 190px; padding: 12px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.oo-shape { display: grid; place-items: center; background: var(--accent-soft); border: 3px solid var(--accent); border-radius: 6px; font: 700 0.8rem var(--mono); color: var(--ink); transition: width 0.5s cubic-bezier(0.3, 1.3, 0.5, 1), height 0.5s cubic-bezier(0.3, 1.3, 0.5, 1), border-color 0.3s, background 0.3s; overflow: hidden; }
.oo-shape.oo-fail { border-color: var(--err); background: var(--err-soft); }
.oo-shape.oo-pass { border-color: var(--ok); background: var(--ok-soft); }

/* 9 dependency inversion */
.oo-layers { display: grid; gap: 6px; justify-items: center; min-width: 0; }
.oo-layers .oo-card { width: min(100%, 420px); }
.oo-arrow { font: 600 0.78rem var(--mono); color: var(--muted); text-align: center; }
.oo-arrow.oo-hot { color: var(--err); }

/* depth steps */
.phone.oo-mini-phone { height: 200px; width: min(190px, 100%); }
.oo-matrix { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)); gap: 6px 8px; align-items: center; min-width: 0; }
.oo-matrix.oo-scopes { grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr)); }
.oo-matrix .oo-label { overflow-wrap: anywhere; }
.oo-matrix .oo-pill { justify-self: start; font-size: 0.74rem; }
.oo-col { display: grid; gap: 2px; min-width: 0; }
.oo-cell { display: grid; place-items: center; min-height: 30px; border-radius: 8px; background: var(--sunk); font: 600 0.74rem var(--mono); color: var(--muted); transition: background 0.2s, color 0.2s; }
.oo-cell.oo-pass { background: var(--ok-soft); color: var(--ok); }
.oo-cell.oo-fail { background: var(--err-soft); color: var(--err); }
.oo-cell.oo-na { opacity: 0.5; border: 1px dashed var(--line); background: transparent; }
`;

  Lab.addTrack({
    id: 'oop',
    title: 'OOP and SOLID',
    description: 'The design principles behind classes that stay easy to change, with Kotlin and Android examples.',
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

      // 5 ─────────────────────────────────────────────
      {
        id: 'srp',
        title: 'S: Single responsibility',
        tagline: 'A class should have one reason to change.',
        level: 'intermediate',
        body: `
<p>The single responsibility principle says a class should answer to one kind of change. A useful test is to ask <em>who</em> asks for changes. The backend team changes the API. Designers change how dates look. Analytics renames events. If all of them edit the same file, that file has too many jobs.</p>
<p>The usual Android offender is a “god” Activity or ViewModel that fetches, caches, formats, validates and logs. Every change touches it, merge conflicts pile up, and testing one part means setting up all of them.</p>
<p>Split by reason to change: a repository for data, a formatter for display text, a validator for rules, a small analytics wrapper. The ViewModel then just coordinates. Send a change request below, before and after the split.</p>`,
        code: `// Before: one class, many reasons to change
class ProfileViewModel : ViewModel() {
    fun load() { /* Retrofit call, Room cache, date formatting, analytics... */ }
}

// After: each class has one job
class ProfileRepository(private val api: ProfileApi, private val dao: ProfileDao) {
    fun observe(id: String): Flow<Profile> = dao.observe(id)
    suspend fun refresh(id: String) = dao.upsert(api.profile(id))
}

class ProfileFormatter(private val locale: Locale) {
    fun joined(p: Profile): String =
        DateTimeFormatter.ofPattern("MMM yyyy", locale).format(p.joinedOn)
}

class ProfileViewModel(
    private val repo: ProfileRepository,
    private val formatter: ProfileFormatter,
    private val analytics: ProfileAnalytics,
) : ViewModel() {
    val joined: StateFlow<String> = repo.observe("me")
        .map { formatter.joined(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), "")

    init { analytics.screenViewed() }
}`,
        remember: 'Ask who would ask for a change. One answer per class.',
        terms: [
          { term: 'Single responsibility principle', def: 'The rule that a class should have only one reason to change, meaning it serves one kind of concern.' },
          { term: 'God class', def: 'A class that has collected many unrelated jobs, so almost every change has to touch it.' },
          { term: 'Cohesion', def: 'How closely the members of a class belong together; a cohesive class has members that all serve the same purpose.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The ViewModel gets data from the repository and display text from the formatter. Fill in who does each job.', code: 'class ProfileViewModel(\n    private val repo: ProfileRepository,\n    private val formatter: ProfileFormatter,\n) : ViewModel() {\n    val joined: StateFlow<String> = [[repo]].observe("me")\n        .map { [[formatter]].joined(it) }\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), "")\n}', why: 'The ViewModel only connects the pieces. Data comes from the repository, text comes from the formatter.' },
          { type: 'bug', prompt: 'Designers want a new headline style, and the data layer has to change. Tap the line that doesn’t belong here.', code: 'class ProfileRepository(\n    private val api: ProfileApi,\n    private val dao: ProfileDao,\n) {\n    suspend fun refresh(id: String) = dao.upsert(api.profile(id))\n    fun observe(id: String): Flow<Profile> = dao.observe(id)\n    fun headline(p: Profile) = p.name.uppercase() + " · " + p.city\n}', bug: 6, fix: '    // move headline() to a ProfileFormatter in the UI layer', why: 'Display formatting changes for design reasons. Data loading changes for backend reasons. Keeping both here gives the repository two reasons to change.' },
        ],
        quiz: [
          { q: 'What is a practical test for “one responsibility”?', options: ['The class has under 100 lines', 'Only one kind of stakeholder would ask to change it', 'It has one public method'], a: 1, why: 'Size and method count are side effects. The principle is about reasons to change.' },
          { q: 'Designers change the date format. After a good split, which class changes?', options: ['ProfileViewModel', 'ProfileRepository', 'ProfileFormatter'], a: 2, why: 'Formatting is the formatter’s only job, so the change lands there and nowhere else.' },
        ],
        visual(el) {
          const methods = [
            { m: 'fetchProfile()', r: 'api', home: 'ProfileRepository' },
            { m: 'cacheInRoom()', r: 'api', home: 'ProfileRepository' },
            { m: 'formatJoinDate()', r: 'design', home: 'ProfileFormatter' },
            { m: 'validateEmail()', r: 'rules', home: 'EmailValidator' },
            { m: 'trackScreenView()', r: 'analytics', home: 'ProfileAnalytics' },
            { m: 'uiState', r: 'screen', home: 'ProfileViewModel' },
          ];
          const homes = ['ProfileViewModel', 'ProfileRepository', 'ProfileFormatter', 'EmailValidator', 'ProfileAnalytics'];
          const asks = [
            { r: 'api', label: 'Backend adds a field' },
            { r: 'design', label: 'Design changes the date format' },
            { r: 'rules', label: 'Product tightens email rules' },
            { r: 'analytics', label: 'Analytics renames an event' },
          ];
          let split = false, busy = false, pills = [], cards = {};
          const area = h('div', {});
          const o = out('Send a change request. Count how much code it touches.');
          function render(animate) {
            pills = methods.map(x => { const p = pill(x.m, 'oo-acc'); p.r = x.r; return p; });
            cards = {};
            if (!split) {
              const c = h('div', { class: `oo-card oo-on${animate ? ' drop-in' : ''}` }, h('span', { class: 'oo-title' }, 'class ProfileViewModel'), h('span', { class: 'oo-stat' }, '612 lines · 6 jobs'), h('div', { class: 'oo-row' }, pills));
              homes.forEach(n => { cards[n] = c; });
              area.replaceChildren(c);
            } else {
              const grid = h('div', { class: 'oo-classes' });
              homes.forEach((n, i) => {
                const own = pills.filter((p, j) => methods[j].home === n);
                const c = h('div', { class: `oo-card oo-on${animate ? ' drop-in' : ''}`, style: animate ? `animation-delay:${i * 90}ms` : null }, h('span', { class: 'oo-title' }, n), h('div', { class: 'oo-row' }, own));
                cards[n] = c; grid.append(c);
              });
              area.replaceChildren(grid);
            }
          }
          async function change(a) {
            if (busy) return; busy = true;
            const hit = new Set(methods.filter(x => x.r === a.r).map(x => x.home));
            const touched = [...new Set([...hit].map(n => cards[n]))];
            Object.values(cards).forEach(c => c.classList.remove('oo-warn'));
            touched.forEach(c => { c.classList.add('oo-warn'); replay(c, 'shake'); });
            pills.forEach(p => { if (p.r === a.r) { p.className = 'oo-pill oo-warn'; replay(p, 'pop'); } });
            if (!split) {
              say(o, `${a.label}. <span class="bad">edit ProfileViewModel.kt:</span> the file every other feature also lives in. Re-test all 6 jobs.`);
            } else {
              say(o, `${a.label}. <span class="good">edit ${[...hit].join(', ')}:</span> one small class. The other ${homes.length - hit.size} are untouched.`);
            }
            await sleep(1300);
            if (!el.isConnected) return;
            touched.forEach(c => c.classList.remove('oo-warn'));
            pills.forEach(p => { p.className = 'oo-pill oo-acc'; });
            busy = false;
          }
          const splitBtn = act('Split by reason to change', async () => {
            if (busy) return; busy = true;
            if (!split) { pills.forEach((p, i) => { p.style.animationDelay = `${i * 60}ms`; p.classList.add('leave'); }); await sleep(700); }
            split = !split; render(true);
            splitBtn.textContent = split ? 'Merge back into one class' : 'Split by reason to change';
            say(o, split ? 'Five focused classes. The ViewModel keeps only uiState and coordinates the rest.' : 'Back to one god class.');
            busy = false;
          });
          render(false);
          el.append(
            h('div', { class: 'stage' }, area),
            h('div', { class: 'controls' }, asks.map(a => act(a.label, () => change(a)))),
            h('div', { class: 'controls' }, splitBtn),
            o);
          area.style.cssText = 'width:100%;min-width:0;display:grid';
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'open-closed',
        title: 'O: Open/closed',
        tagline: 'Add behaviour by adding code, not by editing code that works.',
        level: 'intermediate',
        body: `
<p>The open/closed principle says code should be open for extension and closed for modification. You add a new payment method by writing a new class, not by editing five <code>when</code> blocks that already work and are already tested.</p>
<p>An open hierarchy (an interface any class can implement) makes adding <em>types</em> cheap. Each type carries its own <code>fee()</code> and <code>label</code>. But adding a new <em>operation</em> means editing every class.</p>
<p>A <code>sealed</code> hierarchy flips the trade-off. Adding an operation is one new function with a <code>when</code>. Adding a type breaks every <code>when</code>, and the compiler lists each one, which is safe but not closed. Pick by what changes more often in your app. Try both below.</p>`,
        code: `// Sealed: a fixed set of types. New operations are cheap.
sealed interface Payment
data class Card(val last4: String) : Payment
data object GooglePay : Payment

fun fee(p: Payment): Int = when (p) {
    is Card -> 30
    GooglePay -> 0
}   // add PayPal and the compiler flags every when that needs a branch

// Open: any class can join. New types are cheap.
interface PaymentMethod {
    val label: String
    fun fee(): Int
}
class PayPal(val email: String) : PaymentMethod {
    override val label = "PayPal"
    override fun fee() = 25
}

fun checkoutTotal(amount: Int, method: PaymentMethod) = amount + method.fee()`,
        remember: 'Open hierarchy: new types are cheap. Sealed: new operations are cheap. Pick by what changes more.',
        terms: [
          { term: 'Open/closed principle', def: 'The rule that you should be able to add behaviour by adding new code, without modifying code that already works.' },
          { term: 'Expression problem', def: 'The trade-off where a design makes either new types or new operations easy to add, but not both.' },
          { term: 'Exhaustive when', def: 'A when over a sealed type that covers every subtype, so the compiler reports an error when a new subtype is added.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the set of payments closed so <code>label()</code> needs no <code>else</code>.', code: '[[sealed]] interface Payment\ndata class Card(val last4: String) : Payment\ndata object GooglePay : Payment\n\nfun label(p: Payment) = [[when]] (p) {\n    is Card -> "Card ${p.last4}"\n    GooglePay -> "Google Pay"\n}', why: 'With <code>sealed</code> the compiler knows every subtype, so a <code>when</code> that covers them all is exhaustive.' },
          { type: 'bug', prompt: 'PayPal was added last sprint and is charged no fee by mistake. Nothing warned anyone. Tap the line to blame.', code: 'sealed interface Payment\ndata class Card(val last4: String) : Payment\ndata object GooglePay : Payment\ndata class PayPal(val email: String) : Payment\n\nfun fee(p: Payment): Int = when (p) {\n    is Card -> 30\n    GooglePay -> 0\n    else -> 0\n}', bug: 8, fix: '    is PayPal -> 25   // no else: new types become compile errors', why: 'An <code>else</code> branch over a sealed type swallows every future subtype. Listing each type keeps the compiler checking for you.' },
        ],
        quiz: [
          { q: 'With an open <code>PaymentMethod</code> interface, what does adding Klarna take?', options: ['One new class', 'Editing every function that handles payments', 'Changing the interface'], a: 0, why: 'Each implementation carries its own behaviour, so existing code stays as it is.' },
          { q: 'With a sealed <code>Payment</code>, what does adding a <code>refund()</code> operation take?', options: ['Editing every subtype', 'One new function with a when', 'It is impossible'], a: 1, why: 'Operations live in functions outside the types, so a new one is a single new function.' },
          { q: 'Why avoid <code>else</code> in a <code>when</code> over a sealed type?', options: ['It is slower', 'It hides new subtypes from the compiler', 'It doesn’t compile'], a: 1, why: 'Without <code>else</code>, adding a subtype turns every incomplete <code>when</code> into a compile error.' },
        ],
        visual(el) {
          const fees = { Card: 30, GooglePay: 0, PayPal: 25, Klarna: 40, Bank: 10 };
          const typePool = ['PayPal', 'Klarna', 'Bank'], opPool = ['refund', 'icon', 'limit'];
          let types = ['Card', 'GooglePay'], ops = ['fee', 'label'], mode = 'sealed', busy = false;
          const area = h('div', { class: 'oo-classes' });
          const stat = h('span', { class: 'oo-stat' });
          const o = out('Pick a design, then add a type or an operation.');
          let edits = 0, added = 0;
          const branch = (t, op) => mode === 'sealed' ? `    ${t === 'GooglePay' ? t : 'is ' + t} -> …` : `    override fun ${op}() = …`;
          function cardFor(head, rows) {
            const lines = rows.map(([t, op]) => h('div', { class: 'oo-line', html: hl(branch(t, op)) }));
            const box = h('div', { class: 'oo-code' }, h('div', { class: 'oo-line', html: hl(head) }), ...lines, h('div', { class: 'oo-line' }, '}'));
            const c = h('div', { class: 'oo-card oo-on' }, box);
            c.box = box; return c;
          }
          function render() {
            area.replaceChildren(...(mode === 'sealed'
              ? ops.map(op => cardFor(`fun ${op}(p: Payment) = when (p) {`, types.map(t => [t, op])))
              : types.map(t => cardFor(`class ${t} : PaymentMethod {`, ops.map(op => [t, op])))));
            stat.innerHTML = `existing code edited: <b>${edits}</b> · new code added: <b>${added}</b>`;
          }
          async function grow(kind) {
            if (busy) return;
            const pool = kind === 'type' ? typePool : opPool, have = kind === 'type' ? types : ops;
            const next = pool.find(x => !have.includes(x));
            if (!next) { say(o, `No more ${kind}s to add. Press Reset to start over.`); return; }
            busy = true;
            // Does this addition need a new card, or a new row in every existing card?
            const newCard = (mode === 'sealed') === (kind === 'op');
            if (newCard) {
              have.push(next); added++; render();
              const c = area.lastElementChild; c.classList.add('drop-in', 'oo-good');
              say(o, `<span class="good">added ${kind === 'type' ? 'class ' + next : 'fun ' + next + '()'}:</span> one new block. Nothing that already works was opened.`);
              await sleep(900); if (el.isConnected) c.classList.remove('oo-good');
            } else {
              const old = [...area.children];
              have.push(next);
              old.forEach((c, i) => {
                const row = mode === 'sealed' ? [next, ops[i]] : [types[i], next];
                const ln = h('div', { class: 'oo-line oo-ln-err drop-in', html: hl(mode === 'sealed' ? `    // missing: is ${next}` : `    // missing: override fun ${next}()`) });
                c.box.lastElementChild.before(ln); c.ln = ln; c.row = row;
                c.classList.replace('oo-on', 'oo-bad'); replay(c, 'shake');
              });
              say(o, mode === 'sealed'
                ? `<span class="bad">compile error ×${old.length}:</span> 'when' expression must be exhaustive. Add the 'is ${next}' branch.`
                : `<span class="bad">compile error ×${old.length}:</span> Class is not abstract and does not implement abstract member '${next}'.`);
              await sleep(1100);
              for (const c of old) {
                if (!el.isConnected) return;
                c.ln.className = 'oo-line oo-ln-ok'; c.ln.innerHTML = hl(branch(...c.row));
                c.classList.replace('oo-bad', 'oo-warn'); edits++;
                stat.innerHTML = `existing code edited: <b>${edits}</b> · new code added: <b>${added}</b>`;
                await sleep(380);
              }
              say(o, `<span class="bad">fixed by editing ${old.length} existing ${mode === 'sealed' ? 'functions' : 'classes'}.</span> Safe, because the compiler found them all, but not closed.`);
              await sleep(500); if (el.isConnected) render();
            }
            busy = false;
          }
          const modeBtns = [
            cmd('sealed interface Payment', () => setMode('sealed')),
            cmd('interface PaymentMethod', () => setMode('open')),
          ];
          function setMode(m) {
            if (busy) return;
            mode = m; press(modeBtns, modeBtns[m === 'sealed' ? 0 : 1]); edits = 0; added = 0; render(); replay(area, 'pop-soft');
            say(o, m === 'sealed' ? 'Sealed: operations are functions with a when. Each card is one function.' : 'Open: each type is a class that carries its own operations. Each card is one class.');
          }
          press(modeBtns, modeBtns[0]); render();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            area, stat,
            h('div', { class: 'controls' }, act('Add a payment type', () => grow('type')), act('Add an operation', () => grow('op'))),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'liskov',
        title: 'L: Liskov substitution',
        tagline: 'A subtype must keep every promise its parent made.',
        level: 'advanced',
        body: `
<p>The Liskov substitution principle says that anywhere code expects a type, any subtype must work without surprises. Compiling is not enough. The subtype has to keep the parent’s behaviour: the same rules on inputs, the same guarantees on results, no new exceptions.</p>
<p>The classic case is <code>Square</code> extending <code>Rectangle</code>. A square must keep both sides equal, so setting the width also sets the height. Code written for rectangles assumes the two are independent, and it breaks.</p>
<p>The Android flavour is an implementation that throws <code>UnsupportedOperationException</code> for half its interface, like a read-only <code>Settings</code> whose <code>put()</code> throws. If a type can’t keep a promise, it should implement a smaller interface. Run the same caller with each object below.</p>`,
        code: `open class Rectangle(width: Int, height: Int) {
    open var width = width
    open var height = height
    val area: Int get() = width * height
}

class Square(side: Int) : Rectangle(side, side) {
    override var width: Int
        get() = super.width
        set(value) { super.width = value; super.height = value }
    override var height: Int
        get() = super.height
        set(value) { super.width = value; super.height = value }
}

fun stretch(r: Rectangle) {
    r.width = 10
    r.height = 4
    check(r.area == 40)   // fails for a Square: area is 16
}

// Fix: no shared mutable parent. Each shape keeps its own promise.
sealed interface Shape { val area: Int }
data class Rect(val w: Int, val h: Int) : Shape { override val area get() = w * h }
data class Sq(val side: Int) : Shape { override val area get() = side * side }`,
        remember: 'If it compiles but surprises the caller, it is not a real subtype.',
        terms: [
          { term: 'Liskov substitution principle', def: 'The rule that objects of a subtype must be usable anywhere the parent type is expected without breaking the caller.' },
          { term: 'Contract', def: 'The promises a type makes about inputs, results and side effects that every implementation must keep.' },
          { term: 'Refused bequest', def: 'A subclass that inherits methods it can’t support and stubs them out or throws.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Model both shapes as immutable values behind one interface.', code: 'interface Shape { val area: Int }\ndata class Rect(val w: Int, val h: Int) : Shape {\n    override val area: Int get() = w * h\n}\ndata class Square(val side: Int) : [[Shape]] {\n    override val area: Int get() = [[side * side|side*side]]\n}', why: 'Neither shape inherits setters it can’t honour. Each one only promises an area, and keeps that promise.' },
          { type: 'bug', prompt: 'A settings screen crashes when it saves to the defaults object. Tap the line that breaks the contract.', code: 'interface Settings {\n    fun get(key: String): String?\n    fun put(key: String, value: String)\n}\nclass BundledDefaults(private val map: Map<String, String>) : Settings {\n    override fun get(key: String) = map[key]\n    override fun put(key: String, value: String) = throw UnsupportedOperationException()\n}', bug: 6, fix: '    // can’t honour put(): implement a read-only interface instead of Settings', why: 'Any caller holding a <code>Settings</code> may call <code>put()</code>. A type that throws there is not a valid substitute. Split out a read-only interface.' },
        ],
        quiz: [
          { q: 'Square extends Rectangle and compiles. Why can it still break LSP?', options: ['Squares are slower', 'It changes behaviour callers rely on: width and height are no longer independent', 'It needs an interface'], a: 1, why: 'LSP is about behaviour. The compiler checks signatures, not promises.' },
          { q: 'Which of these breaks LSP?', options: ['An override that returns a more specific type', 'An override that throws for inputs the parent accepted', 'An override that logs extra info'], a: 1, why: 'Rejecting input the parent accepted strengthens the precondition, and callers written for the parent will fail.' },
        ],
        deeper: [
          {
            title: 'Accept more, promise more, never the reverse',
            body: `<p>A contract has two sides. The precondition is what the method accepts. The postcondition is what it guarantees back. A valid subtype may accept <em>more</em> than the parent, and may promise <em>more</em>. It may not accept less or promise less.</p>
<p>Here the parent <code>Uploader</code> accepts files up to 10 MB and returns an https URL. The caller uploads a 5 MB avatar and loads the URL. Try each implementation.</p>`,
            code: `interface Uploader {
    /** Accepts files up to 10 MB. Returns an https URL. */
    suspend fun upload(file: File): Uri
}

class CdnUploader : Uploader { /* up to 100 MB: accepts more, fine */ }
class TinyUploader : Uploader {
    override suspend fun upload(file: File): Uri {
        require(file.length() <= 1_000_000)   // accepts less: breaks callers
        TODO()
    }
}`,
            visual(el) {
              const IMPLS = [
                { name: 'CdnUploader', max: 100, url: 'https://cdn.example.com/a.jpg', note: 'accepts up to 100 MB' },
                { name: 'SigningUploader', max: 10, url: 'https://img.example.com/a.jpg?sig=9f', note: 'adds a signature' },
                { name: 'TinyUploader', max: 1, url: '', note: 'accepts up to 1 MB' },
                { name: 'MirrorUploader', max: 10, url: 'http://mirror.example.com/a.jpg', note: 'returns http' },
              ];
              let pick = IMPLS[0], busy = false;
              const steps = ['val url = uploader.upload(avatar)   // 5 MB', 'check(url.scheme == "https")', 'imageLoader.load(url)'].map(t => h('div', { class: 'oo-line', html: hl(t) }));
              const pre = h('span', { class: 'oo-pill' }), post = h('span', { class: 'oo-pill' });
              const o = out('');
              const btns = IMPLS.map(x => cmd(x.name, () => { if (busy) return; pick = x; press(btns, btns[IMPLS.indexOf(x)]); paint(); }));
              function paint() {
                steps.forEach(s => s.classList.remove('oo-cur', 'oo-ln-ok', 'oo-ln-err'));
                pre.textContent = `accepts ≤ ${pick.max} MB`; pre.className = 'oo-pill ' + (pick.max >= 10 ? 'oo-ok' : 'oo-err');
                post.textContent = pick.url ? (pick.url.startsWith('https') ? 'returns https' : 'returns http') : 'returns https';
                post.className = 'oo-pill ' + (!pick.url || pick.url.startsWith('https') ? 'oo-ok' : 'oo-err');
                say(o, `${pick.name}: ${pick.note}. Run the caller.`);
              }
              async function run() {
                if (busy) return; busy = true; paint();
                steps[0].classList.add('oo-cur'); await sleep(600); if (!el.isConnected) return;
                steps[0].classList.remove('oo-cur');
                if (pick.max < 5) {
                  steps[0].classList.add('oo-ln-err'); replay(pre, 'shake');
                  say(o, '<span class="bad">IllegalArgumentException:</span> Failed requirement. <span class="muted">The parent accepts 5 MB, so the caller had every right to send it.</span>');
                  busy = false; return;
                }
                steps[0].classList.add('oo-ln-ok'); steps[1].classList.add('oo-cur');
                await sleep(500); if (!el.isConnected) return;
                steps[1].classList.remove('oo-cur');
                if (!pick.url.startsWith('https')) {
                  steps[1].classList.add('oo-ln-err'); replay(post, 'shake');
                  say(o, `<span class="bad">IllegalStateException: Check failed.</span> got ${pick.url} <span class="muted">The parent promised https and this one promises less.</span>`);
                  busy = false; return;
                }
                steps[1].classList.add('oo-ln-ok'); steps[2].classList.add('oo-ln-ok'); replay(steps[2], 'pop');
                say(o, `<span class="good">works:</span> ${pick.max > 10 ? 'accepting more than the parent never hurts a caller.' : 'promising more than the parent never hurts a caller.'}`);
                busy = false;
              }
              press(btns, btns[0]); paint();
              el.append(
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'oo-pair' },
                  h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'parent contract'), h('div', { class: 'oo-row' }, pill('accepts ≤ 10 MB', 'oo-acc'), pill('returns https', 'oo-acc')), h('span', { class: 'oo-label' }, 'this implementation'), h('div', { class: 'oo-row' }, pre, post)),
                  h('div', { class: 'oo-code' }, steps)),
                h('div', { class: 'controls' }, cmd('uploadAvatar(uploader)', run)),
                o);
            },
          },
          {
            title: 'Write the contract once as tests',
            body: `<p>Promises in a doc comment are easy to break. Put them in an abstract test class instead, with one abstract factory method. Each implementation gets a tiny subclass that runs every contract test against it.</p>
<p>A type that fails the contract is not a valid substitute. Often the fix is a smaller interface that it can fully honour, and a smaller contract to match.</p>`,
            code: `abstract class SettingsContract {
    abstract fun create(): Settings

    @Test fun getReturnsWhatPutStored() {
        val s = create()
        s.put("theme", "dark")
        assertEquals("dark", s.get("theme"))
    }
    @Test fun missingKeyIsNull() = assertNull(create().get("nope"))
}

class InMemorySettingsTest : SettingsContract() { override fun create() = InMemorySettings() }
class DataStoreSettingsTest : SettingsContract() { override fun create() = DataStoreSettings(testStore()) }`,
            visual(el) {
              const TESTS = [{ n: 'get returns what put stored', w: true }, { n: 'missing key is null', w: false }, { n: 'put overwrites', w: true }];
              const IMPLS = ['InMemory', 'DataStore', 'BundledDefaults'];
              let split = false, busy = false;
              const cells = [];
              const grid = h('div', { class: 'oo-matrix', role: 'table', 'aria-label': 'Contract test results' });
              const o = out('Run the contract suite against every implementation.');
              function build() {
                grid.replaceChildren(h('span', { class: 'oo-label' }, 'test'), ...IMPLS.map(i => h('span', { class: 'oo-label oo-raw' }, i)));
                cells.length = 0;
                TESTS.forEach((t, r) => {
                  grid.append(h('span', { class: 'oo-stat' }, t.n));
                  cells[r] = IMPLS.map((im, c) => { const skip = split && c === 2 && t.w; const x = h('span', { class: 'oo-cell' + (skip ? ' oo-na' : '') }, skip ? 'n/a' : ''); grid.append(x); return x; });
                });
              }
              const sw = h('input', { type: 'checkbox', id: 'oo-lsp-split' });
              sw.addEventListener('change', () => { if (busy) { sw.checked = split; return; } split = sw.checked; build(); say(o, split ? 'BundledDefaults now implements ReadOnlySettings. Only the read tests apply to it.' : 'BundledDefaults claims to be a full Settings again.'); });
              async function run() {
                if (busy) return; busy = true; build();
                let fails = 0;
                for (let c = 0; c < IMPLS.length; c++) for (let r = 0; r < TESTS.length; r++) {
                  const x = cells[r][c];
                  if (x.classList.contains('oo-na')) continue;
                  x.textContent = '…'; await sleep(170); if (!el.isConnected) return;
                  const ok = !(c === 2 && TESTS[r].w);
                  if (!ok) fails++;
                  x.textContent = ok ? 'pass' : 'fail'; x.classList.add(ok ? 'oo-pass' : 'oo-fail'); replay(x, ok ? 'pop-soft' : 'shake');
                }
                say(o, fails ? `<span class="bad">${fails} failed:</span> BundledDefaults.put() throws UnsupportedOperationException. It is not a valid Settings.` : '<span class="good">all green:</span> every type keeps every promise it makes.');
                busy = false;
              }
              build();
              el.append(grid,
                h('label', { class: 'switch', for: 'oo-lsp-split' }, sw, 'BundledDefaults implements ReadOnlySettings instead'),
                h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: run }, 'Run contract tests')),
                o);
            },
          },
          {
            title: 'Read-only is not immutable',
            body: `<p>Kotlin's <code>MutableList</code> is a subtype of <code>List</code>, and that is a valid substitution. <code>List</code> only promises that <em>you</em> can read. It never promised that nobody else can write.</p>
<p>So a function that keeps a <code>List</code> it was given may see it change later. If you need a value that can't change, copy it with <code>toList()</code>, or use a truly immutable type such as <code>PersistentList</code> from kotlinx.collections.immutable.</p>`,
            code: `class Playlist(songs: List<Song>) {
    private val songs = songs.toList()   // own copy: callers can't change it later
}

val source = mutableListOf(song1)
val p = Playlist(source)
source += song2          // p.songs is unaffected`,
          },
        ],
        mistakes: [
          { title: 'Narrowing what an override accepts', bad: 'open class Player {\n    open fun setVolume(level: Int) { /* 0..100 */ }\n}\nclass KidsPlayer : Player() {\n    override fun setVolume(level: Int) {\n        require(level <= 50)\n    }\n}', good: 'class KidsPlayer : Player() {\n    override fun setVolume(level: Int) {\n        super.setVolume(level.coerceAtMost(50))\n    }\n}', why: 'Code written for <code>Player</code> may pass 80 and crash. Accept the same range and handle it, here by capping.' },
          { title: 'A silent no-op override', bad: 'class GuestAccount : Account {\n    override suspend fun syncFavorites() {\n        // guests have no server account\n    }\n}', good: 'interface Account { val name: String }\ninterface SyncedAccount : Account {\n    suspend fun syncFavorites()\n}\nclass GuestAccount : Account', why: 'A caller that syncs and then shows "Saved" now lies to the user. Doing nothing breaks the promise as surely as throwing. Leave the method out of types that can’t do it.' },
          { title: 'Casting a read-only list to mutable', bad: 'fun addDefault(tags: List<String>) {\n    (tags as MutableList).add("news")\n}\naddDefault(listOf("kotlin", "android"))   // throws', good: 'fun withDefault(tags: List<String>): List<String> =\n    tags + "news"', why: 'The cast compiles and even succeeds, but <code>listOf</code> returns a fixed-size list. <code>add</code> throws <code>UnsupportedOperationException</code>. Return a new list instead.' },
        ],
        visual(el) {
          const U = 16;
          const subs = {
            rect: { src: 'Rectangle(2, 2)', set: (s, k, v) => { s[k] = v; } },
            square: { src: 'Square(2)', set: (s, k, v) => { s.w = v; s.h = v; } },
            sq2: { src: 'Sq(2)', decl: 'val r: Shape = Sq(2)', immut: true },
          };
          let pick = 'rect', busy = false, s = { w: 2, h: 2 };
          const lines = ['fun stretch(r: Rectangle) {', '    r.width = 10', '    r.height = 4', '    check(r.area == 40)', '}'].map(t => h('div', { class: 'oo-line', html: hl(t) }));
          const shape = h('div', { class: 'oo-shape' });
          const o = out('Pick an object and pass it to stretch().');
          function paint() { shape.style.width = `${s.w * U}px`; shape.style.height = `${s.h * U}px`; shape.textContent = s.w >= 3 && s.h >= 2 ? `${s.w}×${s.h}` : ''; }
          const btns = Object.entries(subs).map(([k, x]) => cmd(x.decl || `val r = ${x.src}`, () => { if (busy) return; pick = k; s = { w: 2, h: 2 }; shape.className = 'oo-shape'; lines.forEach(l => l.classList.remove('oo-cur', 'oo-ln-ok', 'oo-ln-err')); paint(); press(btns, btns[Object.keys(subs).indexOf(k)]); say(o, `${hl(x.src)} ready. Run stretch(r).`); }));
          async function run() {
            if (busy) return; busy = true;
            const x = subs[pick];
            s = { w: 2, h: 2 }; paint(); shape.className = 'oo-shape';
            lines.forEach(l => l.classList.remove('oo-cur', 'oo-ln-ok', 'oo-ln-err'));
            if (x.immut) {
              lines[0].classList.add('oo-ln-err'); replay(lines[0], 'shake');
              say(o, `<span class="bad">compile error:</span> Argument type mismatch: actual type is 'Shape', but 'Rectangle' was expected. <span class="muted">An immutable Sq never promised setters, so it can’t be misused.</span>`);
              busy = false; return;
            }
            lines[0].classList.add('oo-cur'); await sleep(450);
            for (const [i, k, v] of [[1, 'w', 10], [2, 'h', 4]]) {
              if (!el.isConnected) return;
              lines[i - 1].classList.remove('oo-cur'); lines[i].classList.add('oo-cur');
              x.set(s, k, v); paint();
              say(o, `${hl(lines[i].textContent.trim())} <span class="muted">→ now ${s.w} × ${s.h}</span>`);
              await sleep(800);
            }
            lines[2].classList.remove('oo-cur');
            const area = s.w * s.h, ok = area === 40;
            lines[3].classList.add(ok ? 'oo-ln-ok' : 'oo-ln-err');
            shape.classList.add(ok ? 'oo-pass' : 'oo-fail');
            if (!ok) replay(shape, 'shake'); else replay(shape, 'pop');
            say(o, ok ? `<span class="good">ok:</span> area = ${area}. Rectangle kept its promise.` : `<span class="bad">IllegalStateException: Check failed.</span> area = ${area}, expected 40. Setting height also changed width.`);
            busy = false;
          }
          press(btns, btns[0]); paint();
          el.append(
            h('div', { class: 'oo-pair' }, h('div', { class: 'oo-code' }, lines), h('div', { class: 'oo-canvas' }, shape)),
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'controls' }, cmd('stretch(r)', run)),
            o);
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'isp',
        title: 'I: Interface segregation',
        tagline: 'Many small interfaces beat one fat one.',
        level: 'intermediate',
        body: `
<p>The interface segregation principle says no class should be forced to depend on methods it doesn’t use. A fat <code>MediaPlayer</code> interface with <code>play</code>, <code>pause</code>, <code>seek</code> and <code>download</code> forces a live radio stream to “implement” seeking and downloading. It ends up with <code>TODO()</code> stubs that crash at runtime.</p>
<p>Split the fat interface into small roles: <code>Playable</code>, <code>Seekable</code>, <code>Downloadable</code>. Each class implements only what it can really do. Each function asks only for the role it needs, so <code>skipIntro(p: Seekable)</code> can’t even be handed a radio.</p>
<p>The bug moves from a crash in a user’s hands to a red line in your editor. Try the same calls with both designs below.</p>`,
        code: `// Fat: every player must pretend it can do everything
interface MediaPlayer {
    fun play(); fun pause(); fun seek(ms: Long); fun download()
}

// Split: small roles. Implement only what you can do.
interface Playable { fun play(); fun pause() }
interface Seekable { fun seek(ms: Long) }
interface Downloadable { suspend fun download() }

class LiveRadio(private val player: ExoPlayer) : Playable {
    override fun play() = player.play()
    override fun pause() = player.pause()
}

class Podcast(
    private val player: ExoPlayer,
    private val downloads: EpisodeDownloads,
) : Playable, Seekable, Downloadable {
    override fun play() = player.play()
    override fun pause() = player.pause()
    override fun seek(ms: Long) = player.seekTo(ms)
    override suspend fun download() = downloads.save()
}

fun skipIntro(p: Seekable) = p.seek(30_000)   // LiveRadio can't be passed in`,
        remember: 'Ask for the smallest interface you need. Implement only the roles you can really fill.',
        terms: [
          { term: 'Interface segregation principle', def: 'The rule that clients should not be forced to depend on methods they do not use, so large interfaces are split into small roles.' },
          { term: 'Role interface', def: 'A small interface that describes one capability, such as Seekable, rather than everything a class can do.' },
          { term: 'Fat interface', def: 'An interface with so many methods that most implementations can only support part of it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give each class only the roles it can fill, and ask only for the role you need.', code: 'interface Playable { fun play() }\ninterface Seekable { fun seek(ms: Long) }\n\nclass Podcast : Playable, [[Seekable]] { /* ... */ }\nclass LiveRadio : [[Playable]] { /* ... */ }\n\nfun skipIntro(p: [[Seekable]]) = p.seek(30_000)', why: 'A podcast can seek, a live stream can’t. <code>skipIntro</code> needs only seeking, so it asks for <code>Seekable</code>.' },
          { type: 'bug', prompt: 'The player screen calls <code>seek()</code> on any MediaPlayer, and live radio crashes. Tap the line that crashes.', code: 'interface MediaPlayer {\n    fun play()\n    fun seek(ms: Long)\n}\nclass LiveRadio(private val stream: ExoPlayer) : MediaPlayer {\n    override fun play() = stream.play()\n    override fun seek(ms: Long) = TODO("live radio can\'t seek")\n}', bug: 6, fix: '    // drop seek(): split Seekable out of MediaPlayer and don’t implement it here', why: '<code>TODO()</code> throws <code>NotImplementedError</code> when called. The fat interface forced a promise LiveRadio can’t keep.' },
        ],
        quiz: [
          { q: 'Why is <code>override fun seek(ms: Long) = TODO()</code> a design smell?', options: ['TODO is deprecated', 'The class was forced to promise something it can’t do', 'It is slower'], a: 1, why: 'A stub that throws means the interface asks for more than this class supports. It also breaks Liskov.' },
          { q: 'After splitting, what happens if you call <code>skipIntro(radio)</code>?', options: ['It crashes at runtime', 'It does not compile', 'It silently does nothing'], a: 1, why: 'LiveRadio is not Seekable, so the compiler rejects the call.' },
        ],
        visual(el) {
          const caps = { LiveRadio: ['play'], Podcast: ['play', 'seek', 'download'] };
          const roles = { play: 'Playable', seek: 'Seekable', download: 'Downloadable' };
          let mode = 'fat', who = 'LiveRadio', busy = false;
          const decl = h('div', { class: 'kt oo-wrap' });
          const mlist = h('div', { class: 'oo-row' });
          const card = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'Implementation'), decl, mlist);
          const now = h('p', { class: 'phone-note' }, 'Stopped');
          const screen = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Player screen'), now);
          const o = out('Pick a design and an object, then call things on it.');
          function paint() {
            const can = caps[who];
            decl.innerHTML = hl(mode === 'fat' ? `class ${who} : MediaPlayer` : `class ${who} : ${can.map(c => roles[c]).join(', ')}`);
            const ms = mode === 'fat' ? ['play', 'seek', 'download'] : can;
            mlist.replaceChildren(...ms.map(m => pill(can.includes(m) ? `${m}()` : `${m}() = TODO()`, can.includes(m) ? 'oo-acc' : 'oo-err')));
            card.classList.toggle('oo-bad', mode === 'fat' && can.length < 3); card.classList.toggle('oo-on', !(mode === 'fat' && can.length < 3));
          }
          const modeBtns = [cmd('interface MediaPlayer', () => setMode('fat')), cmd('Playable / Seekable / Downloadable', () => setMode('split'))];
          const whoBtns = Object.keys(caps).map(k => cmd(`val p = ${k}()`, () => { if (busy) return; who = k; press(whoBtns, whoBtns[Object.keys(caps).indexOf(k)]); now.textContent = 'Stopped'; screen.className = 'oo-card'; paint(); replay(card, 'pop-soft'); say(o, `${k} ready.`); }));
          function setMode(m) { if (busy) return; mode = m; press(modeBtns, modeBtns[m === 'fat' ? 0 : 1]); screen.className = 'oo-card'; now.textContent = 'Stopped'; paint(); replay(card, 'pop-soft'); say(o, m === 'fat' ? 'One fat interface: every class must list every method.' : 'Small roles: each class lists only what it can do.'); }
          const calls = [
            { cap: 'play', src: 'p.play()', fn: 'play()', done: () => `Playing ${who === 'LiveRadio' ? 'Radio live' : 'Episode 12'}` },
            { cap: 'seek', src: 'skipIntro(p)', fn: 'skipIntro(p: Seekable)', done: () => 'Skipped to 0:30' },
            { cap: 'download', src: 'saveOffline(p)', fn: 'saveOffline(p: Downloadable)', done: () => 'Saved for offline' },
          ];
          async function call(c) {
            if (busy) return; busy = true;
            const can = caps[who].includes(c.cap);
            screen.className = 'oo-card';
            if (can) { now.textContent = c.done(); screen.classList.add('oo-good'); replay(screen, 'pop'); say(o, `${hl(c.src)} <span class="muted">→</span> <span class="good">ok</span>`); }
            else if (mode === 'fat') {
              now.textContent = 'App stopped'; screen.classList.add('oo-bad'); replay(screen, 'shake');
              say(o, `${hl(c.src)} <span class="muted">→ compiled fine, then at runtime:</span> <span class="bad">NotImplementedError: An operation is not implemented.</span>`);
            } else {
              replay(decl, 'shake'); screen.classList.add('oo-warn');
              say(o, `${hl(c.src)} <span class="muted">→</span> <span class="bad">compile error:</span> Argument type mismatch: actual type is '${who}', but '${roles[c.cap]}' was expected. <span class="muted">Caught before it ships.</span>`);
            }
            await sleep(500); busy = false;
          }
          press(modeBtns, modeBtns[0]); press(whoBtns, whoBtns[0]); paint();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'controls' }, whoBtns),
            h('div', { class: 'oo-pair' }, card, screen),
            h('div', { class: 'controls' }, calls.map(c => cmd(c.src, () => call(c)))),
            o);
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'dip',
        title: 'D: Dependency inversion',
        tagline: 'High-level code depends on interfaces. Details plug in from outside.',
        level: 'advanced',
        body: `
<p>The dependency inversion principle says high-level policy should not depend on low-level details. Both should depend on an abstraction. A <code>NewsViewModel</code> should not build a Retrofit client. It should ask for a <code>NewsRepository</code>, and something else decides which one.</p>
<p>“Inversion” is about the arrows. Without it, the ViewModel points down at the network class. With it, the ViewModel points at the interface, and the network class points <em>up</em> at the same interface by implementing it. Details now depend on policy.</p>
<p>On Android, Hilt does the wiring. A <code>@Binds</code> line in a module is the one place that names the concrete class. Swapping to an offline-first repository changes that line only, and a unit test can pass a fake by hand. Try both setups below.</p>`,
        code: `// High level: knows only the abstraction
interface NewsRepository {
    fun headlines(): Flow<List<Article>>
}

@HiltViewModel
class NewsViewModel @Inject constructor(
    repo: NewsRepository,
) : ViewModel() {
    val headlines: StateFlow<List<Article>> = repo.headlines()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

// Low level: implements the abstraction
class OfflineFirstNewsRepository @Inject constructor(
    private val dao: ArticleDao,
) : NewsRepository {
    override fun headlines() = dao.observeAll()
}

// Wiring: the only place that names the concrete class
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    abstract fun bindNews(impl: OfflineFirstNewsRepository): NewsRepository
}

// Test: no network, no Hilt
val vm = NewsViewModel(FakeNewsRepository(listOf(sampleArticle)))`,
        remember: 'Policy and details both point at the interface. Only the DI module names the concrete class.',
        terms: [
          { term: 'Dependency inversion principle', def: 'The rule that high-level code and low-level details should both depend on abstractions, not on each other.' },
          { term: 'Dependency injection', def: 'Passing an object its dependencies from outside, usually through the constructor, instead of letting it create them.' },
          { term: '@Binds', def: 'A Hilt or Dagger annotation on an abstract module function that tells the graph which implementation to supply for an interface.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tell Hilt which class to provide when someone asks for <code>NewsRepository</code>.', code: '@Module\n@InstallIn(SingletonComponent::class)\nabstract class DataModule {\n    @[[Binds]]\n    abstract fun bindNews(impl: NetworkNewsRepository): [[NewsRepository]]\n}', why: '<code>@Binds</code> maps the interface in the return type to the implementation in the parameter.' },
          { type: 'bug', prompt: 'The binding exists, but tests can’t swap in a fake and moving to offline-first means editing the ViewModel. Tap the line that couples it to a detail.', code: '@Module\n@InstallIn(SingletonComponent::class)\nabstract class DataModule {\n    @Binds\n    abstract fun bindNews(impl: NetworkNewsRepository): NewsRepository\n}\n@HiltViewModel\nclass NewsViewModel @Inject constructor(\n    private val repo: NetworkNewsRepository,\n) : ViewModel()', bug: 8, fix: '    private val repo: NewsRepository,', why: 'Asking for the concrete class skips the abstraction, so the <code>@Binds</code> line has no effect on this ViewModel. Depend on the interface.' },
        ],
        quiz: [
          { q: 'What gets “inverted” in dependency inversion?', options: ['The order of constructor parameters', 'The direction of the arrow: the detail now depends on an abstraction the high-level code owns', 'The call stack'], a: 1, why: 'The low-level class points up at the interface by implementing it, instead of the high-level class pointing down at it.' },
          { q: 'You switch from a network repository to an offline-first one. With DIP and Hilt, what changes?', options: ['NewsViewModel', 'The @Binds line in the module', 'Every screen'], a: 1, why: 'The module is the one place that names the concrete class.' },
          { q: 'Why does DIP make ViewModel tests easier?', options: ['Tests can pass a fake repository through the constructor', 'Hilt runs faster in tests', 'ViewModels don’t need tests'], a: 0, why: 'The ViewModel only needs something that implements the interface, so a fake with fixed data works.' },
        ],
        deeper: [
          {
            title: 'A fake you can drive',
            body: `<p>The interface is the seam a test uses. A hand-written fake backed by a <code>MutableStateFlow</code> lets the test push any data it likes, at any moment, and check how the ViewModel reacts.</p>
<p>Fakes are usually clearer than mocks here. They behave like a tiny real repository, so one fake serves every test and reads like normal code.</p>`,
            code: `class FakeNewsRepository : NewsRepository {
    private val flow = MutableStateFlow<List<Article>>(emptyList())
    fun emit(articles: List<Article>) { flow.value = articles }
    override fun headlines(): Flow<List<Article>> = flow
}

@get:Rule val mainRule = MainDispatcherRule()   // Dispatchers.Main for viewModelScope

@Test fun showsHeadlinesWhenTheRepoEmits() = runTest {
    val repo = FakeNewsRepository()
    val vm = NewsViewModel(repo)
    backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { vm.headlines.collect() }

    assertEquals(emptyList<Article>(), vm.headlines.value)
    repo.emit(listOf(sampleArticle))
    assertEquals(listOf(sampleArticle), vm.headlines.value)
}`,
            visual(el) {
              const SAMPLES = [['Rain all weekend', 'Ferry times change'], [], ['New park opens', 'Tram extended', 'Market moves']];
              let busy = false;
              const phone = h('div', { class: 'phone oo-mini-phone' });
              const assertLine = h('div', { class: 'oo-line', html: hl('// no assertion yet') });
              const fake = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'test controls the fake'), kt('class FakeNewsRepository : NewsRepository'));
              const vmCard = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'real NewsViewModel'), kt('vm.headlines: StateFlow<List<Article>>'), phone);
              const o = out('');
              function show(list) {
                phone.replaceChildren(...(list.length ? list.map(t => h('div', { class: 'item drop-in' }, t)) : [h('p', { class: 'phone-note drop-in' }, 'No news yet')]));
              }
              async function emit(i) {
                if (busy) return; busy = true;
                const list = SAMPLES[i];
                replay(fake, 'oo-flash');
                say(o, `${hl(`repo.emit(${list.length ? `listOf(${list.length} articles)` : 'emptyList()'})`)} <span class="muted">→ flows into the ViewModel</span>`);
                await sleep(450); if (!el.isConnected) return;
                vmCard.classList.add('oo-on'); show(list);
                assertLine.className = 'oo-line oo-ln-ok';
                assertLine.innerHTML = hl(`assertEquals(${list.length ? `${list.length} articles` : 'emptyList()'}, vm.headlines.value)  // passes`);
                replay(assertLine, 'pop');
                await sleep(400); vmCard.classList.remove('oo-on'); busy = false;
              }
              show([]);
              say(o, 'You are the test. Push data through the fake.');
              el.append(
                h('div', { class: 'oo-pair' }, fake, vmCard),
                h('div', { class: 'oo-code' }, assertLine),
                h('div', { class: 'controls' }, cmd('repo.emit(two articles)', () => emit(0)), cmd('repo.emit(emptyList())', () => emit(1)), cmd('repo.emit(three articles)', () => emit(2))),
                o);
            },
          },
          {
            title: '@Binds for your classes, @Provides for theirs',
            body: `<p><code>@Binds</code> maps an interface to a class you wrote, whose constructor already has <code>@Inject</code>. It is just a declaration, so the module is abstract.</p>
<p>Classes from libraries, like Retrofit or Room, have no <code>@Inject</code> constructor and are made by builders. Build them in a <code>@Provides</code> function. Hilt calls it when something needs the type.</p>`,
            code: `@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun retrofit(client: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(client)
        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
        .build()

    @Provides
    fun newsApi(retrofit: Retrofit): NewsApi = retrofit.create()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds abstract fun news(impl: OfflineFirstNewsRepository): NewsRepository
}`,
          },
          {
            title: 'Scopes decide how long an object lives',
            body: `<p>Without a scope, Hilt builds a new object every time something asks for one. A scope annotation keeps one instance per component: <code>@Singleton</code> for the app, <code>@ActivityRetainedScoped</code> across rotations of one Activity, <code>@ActivityScoped</code> for one Activity instance, and <code>@ViewModelScoped</code> for one ViewModel.</p>
<p>Pick the shortest life that works. A wider scope keeps memory and state around longer than anyone expects. Watch which instances survive each event below.</p>`,
            visual(el) {
              const ROWS = [
                { k: 'none', label: 'ArticleFormatter', scope: 'no scope', two: true },
                { k: 'vm', label: 'NewsPager', scope: '@ViewModelScoped', two: true },
                { k: 'act', label: 'Navigator', scope: '@ActivityScoped' },
                { k: 'ret', label: 'SessionCache', scope: '@ActivityRetainedScoped' },
                { k: 'app', label: 'NewsRepository', scope: '@Singleton' },
              ];
              const RESETS = {
                rotate: ['act'],
                screen: ['none', 'vm'],
                reopen: ['none', 'vm', 'act', 'ret'],
                process: ['none', 'vm', 'act', 'ret', 'app'],
              };
              let n = 0x2a0, busy = false;
              const id = () => '@' + (n += 0x35).toString(16);
              const ids = {};
              const chips = {};
              const grid = h('div', { class: 'oo-matrix oo-scopes' });
              const o = out('');
              function fresh(k) { const r = ROWS.find(x => x.k === k); ids[k] = r.two ? [id(), k === 'none' ? id() : null] : [id()]; if (k === 'vm') ids.vm[1] = ids.vm[0]; }
              function build() {
                grid.replaceChildren(h('span', { class: 'oo-label' }, 'binding'), h('span', { class: 'oo-label' }, 'in ViewModel'), h('span', { class: 'oo-label' }, 'in a use case'));
                ROWS.forEach(r => {
                  grid.append(h('div', { class: 'oo-col' }, h('span', { class: 'oo-title' }, r.label), h('span', { class: 'oo-stat' }, r.scope)));
                  chips[r.k] = [pill('', 'oo-acc'), r.two ? pill('', 'oo-acc') : h('span', { class: 'oo-stat' }, '-')];
                  grid.append(chips[r.k][0], chips[r.k][1]);
                });
              }
              function paint(changed) {
                ROWS.forEach(r => {
                  ids[r.k].forEach((v, i) => { if (!v) return; const c = chips[r.k][i]; c.textContent = v; c.className = 'oo-pill ' + (changed.includes(r.k) ? 'oo-warn' : 'oo-acc'); replay(c, changed.includes(r.k) ? 'drop-in' : 'pop-soft'); });
                });
              }
              const MSG = {
                rotate: 'Rotation: a new Activity, so a new @ActivityScoped Navigator. The ViewModel survived, and so did everything scoped to it or wider.',
                screen: 'A new screen gets a new ViewModel: new NewsPager, new formatters. Activity and app objects stay.',
                reopen: 'The Activity finished and started again. Everything below @Singleton is new.',
                process: 'The process died. Even the @Singleton is rebuilt from scratch.',
              };
              async function ev(k) {
                if (busy) return; busy = true;
                RESETS[k].forEach(fresh); paint(RESETS[k]);
                say(o, MSG[k]);
                await sleep(500); busy = false;
              }
              build(); ROWS.forEach(r => fresh(r.k)); paint([]);
              say(o, 'Unscoped: the ViewModel and the use case each got their own formatter. @ViewModelScoped: they share one pager.');
              el.append(grid,
                h('div', { class: 'controls' }, act('Rotate', () => ev('rotate')), act('Open another news screen', () => ev('screen')), act('Back out, then reopen the app', () => ev('reopen')), act('Process death', () => ev('process'))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Hilt runs at compile time, through KSP or kapt. For each Hilt component it generates a Dagger component that knows how to build every binding installed in it. For each <code>@Inject</code> constructor it generates a small factory class.</p>
<p>The Hilt Gradle plugin also rewrites your <code>@AndroidEntryPoint</code> Activity to extend a generated <code>Hilt_HomeActivity</code>, which injects fields in <code>onCreate</code>. A scoped binding is wrapped in a <code>DoubleCheck</code> provider, which creates the object once and caches it. An unscoped binding calls the factory every time.</p>`,
          code: `// Generated for: class OfflineFirstNewsRepository @Inject constructor(dao: ArticleDao)
public final class OfflineFirstNewsRepository_Factory implements Factory<OfflineFirstNewsRepository> {
    private final Provider<ArticleDao> daoProvider;
    @Override public OfflineFirstNewsRepository get() {
        return new OfflineFirstNewsRepository(daoProvider.get());
    }
}

// In the component, a @Singleton binding is cached:
newsProvider = DoubleCheck.provider(OfflineFirstNewsRepository_Factory.create(daoProvider));`,
        },
        mistakes: [
          { title: 'An interface that leaks the detail', bad: 'interface NewsRepository {\n    fun dao(): ArticleDao\n    fun api(): NewsApi\n}', good: 'interface NewsRepository {\n    fun headlines(): Flow<List<Article>>\n    suspend fun refresh()\n}', why: 'Returning the DAO and the API ties every caller to Room and Retrofit again. The interface should speak the caller’s language, in domain types.' },
          { title: 'Field injection on a class you build yourself', bad: 'class Uploader {\n    @Inject lateinit var api: UploadApi\n}\nval u = Uploader()\nu.api   // UninitializedPropertyAccessException', good: 'class Uploader @Inject constructor(\n    private val api: UploadApi,\n)\n// ask Hilt for an Uploader instead of calling the constructor', why: 'Hilt only fills fields of objects it creates or entry points it knows. Constructor injection makes the dependency impossible to forget.' },
          { title: 'A scope wider than the state', bad: '@Singleton\nclass CheckoutForm @Inject constructor() {\n    var address = ""\n    var coupon = ""\n}', good: '@ViewModelScoped\nclass CheckoutForm @Inject constructor() {\n    var address = ""\n    var coupon = ""\n}', why: 'As a singleton, the half-filled form follows the user into the next checkout, and into the next account after a logout. Scope state to the screen that owns it.' },
        ],
        visual(el) {
          const impls = ['NetworkNewsRepository', 'OfflineFirstNewsRepository'];
          let mode = 'direct', impl = 0, busy = false, vmEdits = 0;
          const vmLine = h('div', { class: 'kt oo-wrap' });
          const vmStat = h('span', { class: 'oo-stat' });
          const vm = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'High level'), h('span', { class: 'oo-title' }, 'class NewsViewModel'), vmLine, vmStat);
          const arrow1 = h('div', { class: 'oo-arrow' });
          const iface = h('div', { class: 'oo-card oo-on' }, h('span', { class: 'oo-label' }, 'Abstraction'), kt('interface NewsRepository'));
          const arrow2 = h('div', { class: 'oo-arrow' }, '↑ implements');
          const implName = h('span', { class: 'oo-title' });
          const binds = h('div', { class: 'kt oo-wrap' });
          const low = h('div', { class: 'oo-card' }, h('span', { class: 'oo-label' }, 'Low level'), implName, binds);
          const o = out('Pick a setup, then swap the data source or run a unit test.');
          function paint() {
            const dir = mode === 'direct';
            vmLine.innerHTML = hl(dir ? `private val repo = ${impls[impl]}(api)` : '@Inject constructor(repo: NewsRepository)');
            vmStat.innerHTML = `edits to NewsViewModel.kt: <b>${vmEdits}</b>`;
            arrow1.textContent = dir ? `↓ creates and depends on ${impls[impl]}` : '↓ depends on';
            arrow1.classList.toggle('oo-hot', dir);
            iface.hidden = dir; arrow2.hidden = dir;
            implName.textContent = `class ${impls[impl]}${dir ? '' : ' : NewsRepository'}`;
            binds.hidden = dir;
            binds.innerHTML = hl(`@Binds fun bind(impl: ${impls[impl]}): NewsRepository`);
          }
          const modeBtns = [cmd('val repo = NetworkNewsRepository(api)', () => setMode('direct')), cmd('@Inject constructor(repo: NewsRepository)', () => setMode('inverted'))];
          function setMode(m) { if (busy) return; mode = m; impl = 0; vmEdits = 0; press(modeBtns, modeBtns[m === 'direct' ? 0 : 1]); [vm, low].forEach(c => c.classList.remove('oo-warn', 'oo-good', 'oo-bad')); paint(); say(o, m === 'direct' ? 'The ViewModel builds its own repository. The arrow points down at a detail.' : 'Both sides point at the interface. Hilt picks the class.'); }
          async function swap() {
            if (busy) return; busy = true;
            impl = 1 - impl;
            if (mode === 'direct') {
              vmEdits++; paint(); vm.classList.add('oo-warn'); replay(vm, 'shake');
              say(o, `<span class="bad">edit NewsViewModel.kt:</span> the screen logic had to change just to switch to ${impls[impl]}.`);
            } else {
              paint(); low.classList.add('oo-good'); replay(binds, 'pop'); replay(vm, 'oo-flash');
              say(o, `<span class="good">edit DataModule only:</span> one @Binds line now names ${impls[impl]}. NewsViewModel is untouched.`);
            }
            await sleep(1000);
            if (el.isConnected) { vm.classList.remove('oo-warn'); low.classList.remove('oo-good'); }
            busy = false;
          }
          async function test() {
            if (busy) return; busy = true;
            say(o, `${hl('@Test fun showsHeadlines()')} <span class="muted">running on the JVM…</span>`);
            await sleep(700);
            if (!el.isConnected) return;
            if (mode === 'direct') {
              vm.classList.add('oo-bad'); replay(vm, 'shake');
              say(o, `<span class="bad">FAILED</span> UnknownHostException: the ViewModel made a real network call. <span class="muted">There is no seam to pass a fake.</span>`);
            } else {
              implName.textContent = 'class FakeNewsRepository : NewsRepository'; binds.hidden = true;
              low.classList.add('oo-good'); replay(low, 'pop');
              say(o, `<span class="good">PASSED</span> in 4 ms. ${hl('NewsViewModel(FakeNewsRepository(sample))')}`);
            }
            await sleep(1300);
            if (el.isConnected) { vm.classList.remove('oo-bad'); low.classList.remove('oo-good'); paint(); }
            busy = false;
          }
          press(modeBtns, modeBtns[0]); paint();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'oo-layers' }, vm, arrow1, iface, arrow2, low),
            h('div', { class: 'controls' }, act('Switch to the other data source', swap), act('Run the ViewModel unit test', test)),
            o);
        },
      },
    ],
  });
})();
