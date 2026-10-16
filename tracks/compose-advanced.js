/* Compose, advanced. Same shape as tracks/kotlin.js; builds on tracks/compose.js.
   Demo styles live in the css string below; every class is prefixed cx-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const bump = (badge, n) => { badge.textContent = n; replay(badge, 'pop'); };

  // spring(dampingRatio = 0.5, stiffness = 400) sampled into a CSS linear() easing, so the demo moves like Compose's spring.
  const SPRING = (() => {
    const z = 0.5, w = 20, wd = w * Math.sqrt(1 - z * z), D = 0.7, N = 40, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = (D * i) / N;
      pts.push(+(1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t))).toFixed(4));
    }
    pts[N] = 1;
    const s = `linear(${pts.join(', ')})`;
    return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('transition-timing-function', s) ? s : 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  })();

  const css = `
.cx-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: start; min-width: 0; }
.cx-label { font: 600 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cx-flash { animation: cx-flash 0.7s ease-out; }
@keyframes cx-flash { from { background: var(--accent-soft); box-shadow: 0 0 0 5px var(--accent-soft); } }
.cx-ctl { min-width: 0; }
.cx-badge { min-width: 2.2em; text-align: center; padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--ink); font: 700 0.8rem var(--mono); font-variant-numeric: tabular-nums; }

/* 1 stability */
.cx-parent { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--ink); background: var(--surface); font: 600 0.86rem var(--mono); min-width: 0; }
.cx-parent > span:first-child { flex: 1 1 160px; min-width: 0; overflow-wrap: anywhere; }
.cx-kids { display: grid; gap: 8px; margin-left: 12px; padding-left: 12px; border-left: 2px solid var(--line); min-width: 0; }
.cx-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, opacity 0.25s; }
.cx-sig { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.cx-meta { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; min-width: 0; }
.cx-arg { font: 500 0.76rem var(--mono); color: var(--muted); overflow-wrap: anywhere; min-width: 0; }
.cx-tag { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; }
.cx-stable { background: var(--ok-soft); color: var(--ok); }
.cx-unstable { background: var(--warm-soft); color: var(--warm); }
.cx-status { grid-column: 1 / -1; font: 600 0.76rem var(--mono); color: var(--muted); min-height: 1.3em; overflow-wrap: anywhere; }
.cx-row.cx-ran { border-color: var(--accent); }
.cx-row.cx-ran .cx-status { color: var(--accent); }
.cx-row.cx-ran .cx-badge { background: var(--accent); color: var(--accent-ink); }
.cx-row.cx-skipped { opacity: 0.6; }

/* 2 derivedStateOf */
.cx-scroll { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr); gap: 16px; align-items: start; }
.cx-view { position: relative; height: 204px; overflow: hidden; border-radius: 18px; border: 6px solid var(--code-bg); background: var(--surface); }
.cx-col { display: grid; gap: 6px; padding: 8px; transition: transform 0.14s linear; }
.cx-msg { height: 34px; display: flex; align-items: center; padding: 0 10px; border-radius: 8px; background: var(--sunk); font-weight: 700; font-size: 0.88rem; }
.cx-fab { position: absolute; right: 10px; bottom: 10px; width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); font: 800 1.2rem var(--body); transition: transform 0.35s cubic-bezier(0.2, 1.4, 0.4, 1), opacity 0.2s; }
.cx-fab.cx-off { transform: scale(0); opacity: 0; }
.cx-counters { display: grid; gap: 10px; min-width: 0; }
.cx-counter { display: grid; gap: 6px; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.cx-counter .kt { font-size: 0.76rem; }
.cx-count-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.cx-big { font: 800 2rem var(--display); font-variant-numeric: tabular-nums; }
.cx-counter.cx-bad-c { border-color: var(--err); }
.cx-counter.cx-good-c { border-color: var(--ok); }

/* 3 phases */
.cx-phases { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 14px; align-items: stretch; min-width: 0; }
.cx-pv { position: relative; min-height: 150px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); overflow: hidden; }
.cx-ball { position: absolute; left: 50%; top: 50%; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 12px; background: var(--accent); }
.cx-tl .lane { grid-template-columns: minmax(0, 108px) minmax(0, 1fr); }
.cx-tl .lane-name { overflow-wrap: anywhere; transition: color 0.2s; }
.cx-tl .lane-name b { display: block; font-size: 1rem; color: var(--ink); font-variant-numeric: tabular-nums; }
.cx-tl .lane.cx-lit .lane-name { color: var(--accent); }
.cx-tl .lane.cx-lit .lane-track { box-shadow: 0 0 0 2px var(--accent); }
.cx-tl .lane.cx-idle .lane-track { opacity: 0.5; }
.cx-skipnote { position: absolute; inset: 0; display: grid; place-items: center; font: 600 0.72rem var(--mono); color: var(--muted); }

/* 4 CompositionLocal */
.cx-tree { display: grid; gap: 4px; min-width: 0; }
.cx-tn { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; width: 100%; padding: 6px 10px; border-radius: 9px; border: 2px solid transparent; background: none; color: var(--ink); font: 500 0.82rem var(--mono); text-align: left; min-width: 0; transition: border-color 0.2s, background 0.2s; }
.cx-tn-label { flex: 1 1 170px; min-width: 0; overflow-wrap: anywhere; }
.cx-tn.cx-prov { background: var(--sunk); }
.cx-tn.cx-prov.cx-off .cx-tn-label { text-decoration: line-through; color: var(--muted); }
.cx-tn.cx-def { color: var(--muted); }
button.cx-tn { cursor: pointer; background: var(--surface); border-color: var(--line); }
button.cx-tn:hover { border-color: var(--accent); }
.cx-tn.cx-walk { border-color: var(--accent); background: var(--accent-soft); }
.cx-tn.cx-found { border-color: var(--ok); background: var(--ok-soft); }
.cx-res { display: inline-flex; align-items: center; gap: 6px; font: 600 0.72rem var(--mono); color: var(--muted); }
.cx-sw { width: 14px; height: 14px; border-radius: 4px; border: 1px solid var(--line); flex: none; transition: background 0.3s; }
.cx-tn .switch { padding: 0; font-size: 0.74rem; }
.cx-mini { display: grid; gap: 8px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); width: min(200px, 100%); }
.cx-mini p { font-weight: 700; transition: color 0.3s; }
.cx-mini-box { display: grid; gap: 6px; padding: 10px; border-radius: 10px; border: 1px dashed var(--line); background: var(--bg); }
.cx-star { font-size: 1.5rem; line-height: 1; transition: color 0.3s; }

/* 5 animations */
.cx-anim { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 12px; }
.cx-cell { display: grid; gap: 10px; align-content: start; padding: 12px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.cx-cell .kt { font-size: 0.74rem; }
.cx-cell .cmd { justify-self: start; }
.cx-mstage { position: relative; height: 110px; display: grid; place-items: center; border-radius: 10px; border: 1px dashed var(--line); background: var(--surface); overflow: hidden; }
.cx-sq { width: 40px; height: 40px; border-radius: 10px; background: var(--accent); }
.cx-banner { padding: 8px 14px; border-radius: 10px; background: var(--ok-soft); color: var(--ok); font-weight: 700; }
.cx-banner.cx-gone { opacity: 0; transform: translateY(26px) scale(0.5); }
.cx-numslot { display: grid; place-items: center; width: 90px; height: 64px; overflow: hidden; }
.cx-numslot > * { grid-area: 1 / 1; }
.cx-num { font: 800 2.1rem var(--display); font-variant-numeric: tabular-nums; }
.cx-chip { display: inline-flex; align-items: center; gap: 0; padding: 8px 14px; border-radius: 8px; border: 2px solid var(--line); background: var(--sunk); color: var(--ink); font-weight: 700; }
.cx-chip .cx-tick { display: inline-block; width: 0; overflow: hidden; }
.cx-chip.cx-sel { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); border-radius: 24px; transform: scale(1.12); }
.cx-chip.cx-sel .cx-tick { width: 1.1em; }

/* 6 custom layout */
.cx-tray { display: flex; flex-wrap: wrap; gap: 8px; min-height: 52px; align-items: center; padding: 10px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); }
.cx-kid { display: grid; place-items: center; height: 32px; border-radius: 8px; border: 2px dashed var(--muted); background: var(--surface); color: var(--muted); font: 600 0.72rem var(--mono); white-space: nowrap; transition: opacity 0.3s, border-color 0.3s; }
.cx-kid.cx-measured { border-style: solid; border-color: var(--accent); color: var(--ink); }
.cx-kid.cx-used { opacity: 0.35; }
.cx-pwrap { display: grid; gap: 6px; justify-items: start; padding: 14px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); min-width: 0; overflow-x: auto; }
.cx-pbox { position: relative; box-sizing: content-box; min-height: 32px; border: 2px solid var(--ink); border-radius: 8px; background: var(--surface); transition: width 0.4s, height 0.4s; }
.cx-pbox .cx-kid { position: absolute; border-style: solid; border-color: var(--accent); color: var(--ink); }
.cx-dim { font: 600 0.76rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cx-dim.cx-down { color: var(--accent); }
.cx-dim.cx-up { color: var(--warm); }

/* 7 navigation */
.cx-nav { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: start; min-width: 0; }
.cx-stack { display: flex; flex-direction: column-reverse; justify-content: flex-start; gap: 6px; min-height: 260px; padding: 12px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); min-width: 0; }
.cx-entry { display: grid; gap: 2px; padding: 8px 12px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s; }
.cx-entry-route { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; }
.cx-entry-args { font: 500 0.72rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cx-entry.cx-top { border-color: var(--accent); }
.cx-scr-title { font: 700 1.2rem var(--display); text-align: center; }
.cx-scr-code { font: 500 0.72rem var(--mono); color: var(--muted); text-align: center; overflow-wrap: anywhere; }

@media (max-width: 640px) {
  .cx-split, .cx-scroll, .cx-phases, .cx-nav { grid-template-columns: minmax(0, 1fr); }
  .cx-pv { min-height: 90px; }
  .cx-split .cx-mini { width: 100%; }
}`;

  Lab.addTrack({
    id: 'compose2',
    title: 'Compose, advanced',
    description: 'Make Compose fast and expressive: skipping, phases, locals, animation, custom layouts and typed navigation.',
    group: 'Going deeper', requires: ['compose'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'stability',
        title: 'Stability and skipping',
        tagline: 'Why a child skips, or runs again, when its parent recomposes.',
        level: 'advanced',
        body: `
<p>Compose skips a child when its inputs equal last time’s. To trust that check, the compiler sorts every parameter type into <em>stable</em> or <em>unstable</em>. Primitives, <code>String</code>, function types and <code>State</code> are stable, and so is a class whose properties are all <code>val</code> of stable types. <code>List</code> is unstable: the object behind the interface could be a <code>MutableList</code> that changes behind your back. So is a class with a <code>var</code>, or a class from a module the Compose compiler did not build.</p>
<p>Since Kotlin 2.0.20, <em>strong skipping mode</em> is on by default. Every restartable composable can skip. Stable parameters are compared with <code>equals()</code>, unstable ones by instance with <code>===</code>, and lambdas are remembered for you. Before that, one unstable parameter made a composable run every time its parent did.</p>
<p>So a fresh <code>listOf(...)</code> on every recomposition still defeats skipping. Switch to <code>ImmutableList</code> from kotlinx.collections.immutable, mark your own type <code>@Immutable</code> when it truly never changes, or list outside types in a stability config file. Compiler reports show what was inferred.</p>`,
        code: `// Unstable: List is an interface, so it might be a MutableList.
data class Article(val title: String, val tags: List<String>)

// Stable: an ImmutableList can't change after it is built.
data class ArticleUi(val title: String, val tags: ImmutableList<String>)

// Your promise to the compiler. Every property must really stay the same.
@Immutable
data class Author(val name: String, val links: List<String>)

@Composable
fun TagRow(tags: ImmutableList<String>, modifier: Modifier = Modifier) {
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        tags.forEach { tag -> AssistChip(onClick = {}, label = { Text(tag) }) }
    }
}

// build.gradle.kts: treat types from other modules as stable
composeCompiler {
    stabilityConfigurationFiles.add(rootProject.layout.projectDirectory.file("stability.conf"))
}`,
        remember: 'Stable params skip on equals(). Unstable params skip only on the same instance.',
        terms: [
          { term: 'Stability', def: 'Whether the Compose compiler can trust a type’s equals() and be told about every change to it; stable parameters let a composable skip on equal inputs.' },
          { term: 'Strong skipping mode', def: 'The Compose compiler default since Kotlin 2.0.20: every restartable composable can skip, unstable parameters are compared with ===, and lambdas are remembered automatically.' },
          { term: '@Immutable', def: 'An annotation promising that no public property of a type ever changes after construction, so Compose treats the type as stable.' },
          { term: 'ImmutableList', def: 'A read-only list from kotlinx.collections.immutable that the Compose compiler treats as stable.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>Author</code> and the <code>tags</code> parameter stable.', code: '@[[Immutable|Stable]]\ndata class Author(val name: String, val links: List<String>)\n\n@Composable\nfun TagRow(tags: [[ImmutableList|PersistentList]]<String>) { /* ... */ }\n\nTagRow(tags = article.tags.[[toImmutableList|toPersistentList]]())', why: 'The annotation is a promise about your own class. For collections, use the immutable types and convert with <code>toImmutableList()</code>.' },
          { type: 'bug', prompt: 'This state class lies to the compiler. Tap the line that breaks the promise.', code: '@Immutable\ndata class CartState(\n    val items: ImmutableList<CartItem>,\n    var total: Double,\n    val currency: String,\n)', bug: 3, fix: '    val total: Double,', why: '<code>@Immutable</code> says nothing ever changes. If code mutates <code>total</code> in place, Compose sees an equal object, skips, and shows a stale total. Make it a <code>val</code> and emit a new state with <code>copy()</code>.' },
        ],
        quiz: [
          { q: 'Strong skipping is on. <code>Tags(tags: List&lt;String&gt;)</code> receives the same list instance as last time. What happens?', options: ['It skips', 'It runs, because <code>List</code> is unstable', 'It fails to compile'], a: 0, why: 'Unstable parameters are compared with <code>===</code>. The same instance passes, so the composable skips.' },
          { q: 'Which parameter type is stable?', options: ['<code>List&lt;String&gt;</code>', '<code>ImmutableList&lt;String&gt;</code>', '<code>class User(var name: String)</code>'], a: 1, why: 'The compiler knows kotlinx immutable collections can’t change. A plain <code>List</code> might be mutable, and a <code>var</code> property can change without notice.' },
          { q: 'What does <code>@Immutable</code> promise?', options: ['No public property changes after the object is built', 'The class copies itself on every write', 'Compose will deep-copy it before each recomposition'], a: 0, why: 'It is a promise only. The compiler trusts it and compares with <code>equals()</code>, so breaking it shows stale UI.' },
        ],
        visual(el) {
          let strong = true, busy = false, parentRuns = 1;
          const rows = [
            { sig: 'Title(title: String)', arg: 'title = "Inbox"', stable: true, fresh: false },
            { sig: 'Tags(tags: List<String>)', arg: 'listOf("kotlin", "ui"), new list each run', stable: false, fresh: true },
            { sig: 'Tags(tags: ImmutableList<String>)', arg: 'persistentListOf("kotlin", "ui"), new but equal', stable: true, fresh: true },
            { sig: 'Profile(user: User)', arg: 'class User(var name), remembered, same instance', stable: false, fresh: false },
          ];
          for (const r of rows) {
            r.runs = 1;
            r.badge = h('span', { class: 'cx-badge', title: 'Times this composable has run' }, '1');
            r.status = h('span', { class: 'cx-status' }, 'composed');
            r.el = h('div', { class: 'cx-row' }, h('span', { class: 'cx-sig' }, r.sig), r.badge,
              h('div', { class: 'cx-meta' }, h('span', { class: `cx-tag ${r.stable ? 'cx-stable' : 'cx-unstable'}` }, r.stable ? 'stable' : 'unstable'), h('span', { class: 'cx-arg' }, r.arg)),
              r.status);
          }
          const decide = r => {
            if (r.stable) return [false, 'equals() is true, skipped'];
            if (!strong) return [true, 'unstable and not skippable, ran again'];
            return r.fresh ? [true, '=== is false (new instance), ran again'] : [false, '=== is true (same instance), skipped'];
          };
          const pBadge = h('span', { class: 'cx-badge' }, '1');
          const parent = h('div', { class: 'cx-parent' }, h('span', {}, 'Feed()  reads refresh'), pBadge);
          const o = out('Make the parent recompose and see which children skip.');
          const sw = h('input', { type: 'checkbox', id: 'cx-strong', checked: true, onchange() {
            strong = this.checked;
            say(o, strong ? 'Strong skipping on: unstable params are compared with ===.' : 'Strong skipping off (the pre-2.0.20 default): any unstable param makes the composable run every time.');
          } });
          async function run() {
            if (busy) return; busy = true;
            rows.forEach(r => { r.el.classList.remove('cx-ran', 'cx-skipped'); r.status.textContent = ''; });
            bump(pBadge, ++parentRuns); replay(parent, 'cx-flash');
            say(o, `${hl('refresh++')} <span class="muted">// Feed read it, so Feed runs and calls each child</span>`);
            let ran = 0;
            for (const r of rows) {
              await sleep(380);
              if (!el.isConnected) return;
              const [rerun, why] = decide(r);
              r.status.textContent = why;
              if (rerun) { ran++; r.el.classList.add('cx-ran'); bump(r.badge, ++r.runs); replay(r.el, 'cx-flash'); }
              else r.el.classList.add('cx-skipped');
            }
            say(o, `Feed ran. <span class="good">${4 - ran} of 4</span> children skipped, <span class="bad">${ran}</span> ran again${strong ? '' : '. Turn strong skipping back on and compare'}.`);
            busy = false;
          }
          el.append(
            h('div', { class: 'cx-tree' }, parent, h('div', { class: 'cx-kids' }, rows.map(r => r.el))),
            h('div', { class: 'controls cx-ctl' }, cmd('refresh++', run), h('label', { class: 'switch', for: 'cx-strong' }, sw, 'Strong skipping')),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'derived',
        title: 'derivedStateOf',
        tagline: 'Recompose when the answer changes, not every time the input does.',
        level: 'intermediate',
        body: `
<p>Some state changes far more often than your UI cares about. <code>listState.firstVisibleItemIndex</code> changes for every row that scrolls past. A “scroll to top” button needs one fact: is the index above 0?</p>
<p>Read the index directly and that composable recomposes on every change. <code>derivedStateOf { }</code> computes a new <code>State</code> from other state and tells its readers only when the result changes. Wrap it in <code>remember</code> so the same derived object survives recomposition.</p>
<p>Use it when the output changes less often than the input. A full name built from two text fields changes exactly as often as they do, so a plain expression is enough there. If the block also uses a plain parameter, pass that parameter as a <code>remember</code> key.</p>`,
        code: `@Composable
fun Inbox(messages: List<Message>) {
    val listState = rememberLazyListState()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }
    val scope = rememberCoroutineScope()

    Box {
        LazyColumn(state = listState) {
            items(messages, key = { it.id }) { MessageRow(it) }
        }
        AnimatedVisibility(
            visible = showScrollToTop,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        ) {
            FloatingActionButton(onClick = { scope.launch { listState.animateScrollToItem(0) } }) {
                Icon(Icons.Filled.KeyboardArrowUp, contentDescription = "Scroll to top")
            }
        }
    }
}`,
        remember: 'derivedStateOf turns a busy state into a calm one. Readers hear only when the result flips.',
        terms: [
          { term: 'derivedStateOf', def: 'Creates a State computed from other State objects that notifies its readers only when the computed result changes.' },
          { term: 'LazyListState', def: 'The state holder of a LazyColumn or LazyRow, exposing the scroll position such as firstVisibleItemIndex and functions such as animateScrollToItem.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Recompose the header only when the list leaves or returns to the top.', code: 'val isAtTop by [[remember]] {\n    [[derivedStateOf]] { listState.firstVisibleItemIndex == 0 }\n}', why: '<code>remember</code> keeps one derived object. <code>derivedStateOf</code> notifies only when the Boolean flips.' },
          { type: 'bug', prompt: 'Change <code>threshold</code> and the header ignores it. Tap the broken line.', code: '@Composable\nfun Header(listState: LazyListState, threshold: Int) {\n    val collapsed by remember {\n        derivedStateOf { listState.firstVisibleItemIndex > threshold }\n    }\n    TopBar(collapsed = collapsed)\n}', bug: 2, fix: '    val collapsed by remember(threshold) {', why: '<code>threshold</code> is a plain parameter, not <code>State</code>, so the derived block can’t see it change. Without the key, <code>remember</code> keeps the first lambda with the first threshold forever.' },
        ],
        quiz: [
          { q: 'The list scrolls from item 0 to item 30. How many times does the reader of <code>showScrollToTop</code> recompose because of it?', options: ['30', '1', '0'], a: 1, why: 'The result flips from false to true once, at the first item. The other 29 index changes produce the same value.' },
          { q: 'Why wrap <code>derivedStateOf</code> in <code>remember</code>?', options: ['Otherwise every recomposition builds a new derived object and loses its caching', 'It only works on the main thread otherwise', 'remember moves the calculation to a background thread'], a: 0, why: 'The derived object must survive recompositions to compare old and new results. Lint flags it when it is not remembered.' },
          { q: 'Where is <code>derivedStateOf</code> the wrong tool?', options: ['A full name built from first and last name fields', 'Showing a button once a list scrolls past item 0', 'Collapsing a toolbar once the scroll passes a threshold'], a: 0, why: 'The full name changes every time either field does. Derived state adds overhead without saving a single recomposition.' },
        ],
        visual(el) {
          const ITEM = 40, MAX = 14;
          let index = 0, direct = 1, derived = 1, shown = false, busy = false;
          const col = h('div', { class: 'cx-col' }, Array.from({ length: 20 }, (_, i) => h('div', { class: 'cx-msg' }, `Message ${i + 1}`)));
          const fab = h('div', { class: 'cx-fab cx-off', 'aria-hidden': 'true' }, '↑');
          const view = h('div', { class: 'cx-view', role: 'img', 'aria-label': 'Scrolling list preview' }, col, fab);
          const counter = (src, note) => {
            const n = h('span', { class: 'cx-big' }, '1');
            const card = h('div', { class: 'cx-counter' }, h('div', { class: 'kt', html: hl(src) }), h('div', { class: 'cx-count-line' }, n, h('span', { class: 'cx-label' }, note)));
            return { n, card };
          };
          const A = counter('val i = listState.firstVisibleItemIndex', 'recompositions');
          const B = counter('val show by remember {\n    derivedStateOf { listState.firstVisibleItemIndex > 0 }\n}', 'recompositions');
          const idx = h('div', { class: 'kt' });
          const o = out('Scroll the list and compare the two counters.');
          const paintIdx = () => { idx.innerHTML = hl(`firstVisibleItemIndex = ${index}   show = ${shown}`); };
          function step(to) {
            index = to;
            col.style.transform = `translateY(${-index * ITEM}px)`;
            A.n.textContent = ++direct; replay(A.card, 'cx-flash');
            const s = index > 0;
            if (s !== shown) { shown = s; B.n.textContent = ++derived; replay(B.card, 'cx-flash'); replay(B.n, 'pop'); fab.classList.toggle('cx-off', !s); }
            paintIdx();
            A.card.classList.toggle('cx-bad-c', direct - derived > 2);
            B.card.classList.toggle('cx-good-c', direct - derived > 2);
          }
          async function scrollTo(target, label) {
            if (busy) return; busy = true;
            target = Math.max(0, Math.min(MAX, target));
            if (target === index) { replay(view, 'shake'); say(o, 'Already there. No index change, so nothing recomposes.'); busy = false; return; }
            const a0 = direct, b0 = derived;
            while (index !== target) {
              step(index + Math.sign(target - index));
              await sleep(130);
              if (!el.isConnected) return;
            }
            say(o, `${label}: direct reader <span class="bad">+${direct - a0}</span>, derived reader <span class="good">+${derived - b0}</span>`);
            busy = false;
          }
          paintIdx();
          el.append(
            h('div', { class: 'cx-scroll' }, view, h('div', { class: 'cx-counters' }, idx, A.card, B.card)),
            h('div', { class: 'controls cx-ctl' },
              act('Scroll 1 item', () => scrollTo(index + 1, 'Scroll 1 item')),
              act('Fling down', () => scrollTo(index + 8, 'Fling down')),
              cmd('listState.animateScrollToItem(0)', () => scrollTo(0, 'Back to top'))),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'phases',
        title: 'Phases and deferred reads',
        tagline: 'Read state as late as possible and skip whole phases.',
        level: 'advanced',
        body: `
<p>Compose builds each frame in three phases. <em>Composition</em> runs your composable functions and decides what UI exists. <em>Layout</em> measures and places every node. <em>Drawing</em> paints the pixels. Compose tracks each state read by the phase it happens in, and a change reruns that phase and the ones after it.</p>
<p>Read a scroll value in the composable body and every scrolled frame goes through all three phases. Move the read into a lambda that runs later and Compose skips the earlier work. The lambda form <code>Modifier.offset { }</code> reads during layout. <code>Modifier.graphicsLayer { }</code> and <code>drawBehind { }</code> read during drawing.</p>
<p>This is also why fast-changing values are often passed as <code>() -&gt; Int</code> instead of <code>Int</code>. The child calls the lambda inside its own layout or draw block, so the read never happens during composition.</p>`,
        code: `@Composable
fun CollapsingHeader(scrollProvider: () -> Int) {
    // Slow: Modifier.offset(y = (-scrollProvider()).dp) reads in composition,
    // so the header recomposes on every scrolled pixel.
    Image(
        painter = painterResource(R.drawable.header),
        contentDescription = null,
        modifier = Modifier
            .fillMaxWidth()
            .offset { IntOffset(x = 0, y = -scrollProvider() / 2) }           // layout only
            .graphicsLayer { alpha = (1f - scrollProvider() / 600f).coerceAtLeast(0f) } // draw only
    )
}

@Composable
fun ArticleScreen() {
    val scroll = rememberScrollState()
    Box {
        CollapsingHeader(scrollProvider = { scroll.value })
        Column(Modifier.verticalScroll(scroll)) { /* ... */ }
    }
}`,
        remember: 'A read reruns its own phase and everything after. Read in a lambda to skip composition.',
        terms: [
          { term: 'Compose phases', def: 'The three steps of every frame: composition decides what UI exists, layout measures and places it, drawing paints it.' },
          { term: 'Deferred state read', def: 'Reading State inside a lambda that runs in a later phase, such as Modifier.offset { } or graphicsLayer { }, so a change skips the earlier phases.' },
          { term: 'Modifier.graphicsLayer', def: 'A modifier that applies scale, rotation, translation, alpha and clipping on its own draw layer; its lambda form reads state only while drawing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Move the toolbar in the layout phase and fade it in the draw phase.', code: 'Box(\n    Modifier\n        .[[offset]] { IntOffset(x = 0, y = -scrollProvider()) }\n        .[[graphicsLayer]] { alpha = fadeProvider() }\n)', why: 'The lambda forms run after composition, so the reads inside them never trigger a recomposition.' },
          { type: 'bug', prompt: 'This toolbar recomposes on every scrolled pixel. Tap the line responsible.', code: '@Composable\nfun Toolbar(scrollProvider: () -> Int) {\n    Box(\n        Modifier\n            .fillMaxWidth()\n            .offset(y = (-scrollProvider()).dp)\n            .background(MaterialTheme.colorScheme.surface)\n    )\n}', bug: 5, fix: '            .offset { IntOffset(x = 0, y = -scrollProvider()) }', why: 'The value form of <code>offset</code> needs the number during composition, so the provider runs there. The lambda form reads it in layout.' },
        ],
        quiz: [
          { q: '<code>Modifier.graphicsLayer { alpha = fade() }</code>, and <code>fade()</code> reads changing state. Which phases rerun?', options: ['Drawing only', 'Layout and drawing', 'All three'], a: 0, why: 'The read happens while drawing, so only drawing has to run again.' },
          { q: 'Which modifier keeps a moving offset out of composition?', options: ['<code>Modifier.offset(y = offsetY.dp)</code>', '<code>Modifier.offset { IntOffset(0, offsetY) }</code>', '<code>Modifier.padding(top = offsetY.dp)</code>'], a: 1, why: 'The lambda runs during layout. The other two read the value while composing.' },
          { q: 'Why take <code>scrollProvider: () -&gt; Int</code> instead of <code>scroll: Int</code>?', options: ['The child can read it later, inside layout or draw, so composition is skipped', 'Lambdas are cheaper to copy than Ints', '<code>Int</code> parameters are unstable'], a: 0, why: 'An <code>Int</code> parameter must be read by the caller during composition. A lambda defers the read to wherever the child calls it.' },
        ],
        visual(el) {
          const FRAMES = 14;
          const modes = [
            { src: 'Modifier.offset(y = offsetY.dp)', from: 0, note: 'read in composition: all three phases every frame' },
            { src: 'Modifier.offset { IntOffset(0, offsetY) }', from: 1, note: 'read in layout: composition skipped' },
            { src: 'Modifier.graphicsLayer { translationY = offsetY }', from: 2, note: 'read while drawing: composition and layout skipped' },
          ];
          let mode = modes[0], busy = false;
          const names = ['Composition', 'Layout', 'Drawing'];
          const lanes = names.map(n => {
            const count = h('b', {}, '0');
            const track = h('div', { class: 'lane-track' });
            return { n: 0, count, track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, n, count), track) };
          });
          const ball = h('div', { class: 'cx-ball' });
          const pv = h('div', { class: 'cx-pv', role: 'img', 'aria-label': 'Moving box preview' }, ball);
          const o = out('');
          const buttons = modes.map(m => cmd(m.src, () => { if (busy) return; mode = m; reset(); say(o, `${hl(m.src)} <span class="muted">// ${m.note}. Press Play.</span>`); }));
          function reset() {
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', modes[i] === mode));
            lanes.forEach((L, p) => {
              L.n = 0; L.count.textContent = '0'; L.track.replaceChildren();
              L.el.classList.toggle('cx-idle', p < mode.from);
              if (p < mode.from) L.track.append(h('span', { class: 'cx-skipnote' }, 'skipped'));
            });
            ball.style.transform = '';
          }
          function frame(f, animate) {
            ball.style.transform = `translateY(${Math.sin((f / FRAMES) * Math.PI * 2) * 40}px)`;
            lanes.forEach((L, p) => {
              if (p < mode.from) return;
              L.track.append(h('span', { class: 'bar run', style: `left:${(f / FRAMES) * 100}%;width:${100 / FRAMES - 1.2}%` }));
              L.count.textContent = ++L.n;
              if (animate) { L.el.classList.add('cx-lit'); setTimeout(() => L.el.classList.remove('cx-lit'), 140); }
            });
          }
          async function play() {
            if (busy) return; busy = true; reset();
            for (let f = 0; f < FRAMES; f++) {
              frame(f, true);
              await sleep(170);
              if (!el.isConnected) return;
            }
            const work = lanes.reduce((s, L) => s + L.n, 0);
            say(o, `${FRAMES} frames, <span class="${mode.from ? 'good' : 'bad'}">${work} phase runs</span>. <span class="muted">${mode.note}.</span>`);
            busy = false;
          }
          reset();
          for (let f = 0; f < FRAMES; f++) frame(f, false);
          say(o, `${hl(mode.src)} <span class="muted">// 14 frames ran through all 3 phases. Pick a deferred read and press Play.</span>`);
          el.append(
            h('div', { class: 'cx-phases' }, pv, h('div', { class: 'timeline cx-tl' }, lanes.map(L => L.el))),
            h('div', { class: 'controls cx-ctl' }, buttons),
            h('div', { class: 'controls cx-ctl' }, h('button', { class: 'btn primary small', onclick: play }, 'Play 14 frames')),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'locals',
        title: 'CompositionLocal',
        tagline: 'Pass a value down the tree without threading it through every call.',
        level: 'intermediate',
        body: `
<p>Some values are needed deep in the tree but would clutter every signature: theme colors, a spacing scale, the current <code>Context</code>. A <code>CompositionLocal</code> passes such a value down implicitly. Any composable below a provider reads it with <code>LocalX.current</code>.</p>
<p>Provide a value with <code>CompositionLocalProvider(LocalX provides value) { }</code>. Providers can nest, and a read always gets the <em>nearest</em> provider above it. With no provider, it gets the default from the factory. Material relies on this: <code>Surface</code> provides <code>LocalContentColor</code>, so a <code>Text</code> or <code>Icon</code> inside it picks a readable color without being told.</p>
<p>Create a local with <code>compositionLocalOf</code> when the value can change and only its readers should recompose. Use <code>staticCompositionLocalOf</code> for values that almost never change; changing one recomposes everything inside the provider. Keep locals for cross-cutting values. Screen data belongs in parameters.</p>`,
        code: `data class Spacing(val small: Dp = 4.dp, val medium: Dp = 8.dp, val large: Dp = 16.dp)

val LocalSpacing = staticCompositionLocalOf { Spacing() }

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalSpacing provides Spacing(medium = 12.dp)) {
        MaterialTheme(content = content)
    }
}

@Composable
fun SavedBanner() {
    val spacing = LocalSpacing.current          // nearest provider: 12.dp
    Surface(color = MaterialTheme.colorScheme.primary) {
        // Surface provides LocalContentColor = onPrimary to everything inside
        Row(Modifier.padding(spacing.medium)) {
            Icon(Icons.Filled.Check, contentDescription = null)
            CompositionLocalProvider(LocalContentColor provides MaterialTheme.colorScheme.tertiary) {
                Text("Saved")                    // nearest provider wins: tertiary
            }
        }
    }
}`,
        remember: 'LocalX.current walks up the tree and takes the nearest provider. None? The default.',
        terms: [
          { term: 'CompositionLocal', def: 'A value passed implicitly down the composition tree and read with LocalX.current by any composable below its provider.' },
          { term: 'CompositionLocalProvider', def: 'A composable that binds values to CompositionLocals for all content inside it, overriding any provider further up.' },
          { term: 'staticCompositionLocalOf', def: 'Creates a CompositionLocal that does not track readers, so changing its value recomposes the whole provided subtree; best for values that rarely change.' },
          { term: 'LocalContentColor', def: 'The CompositionLocal that Material Text and Icon use as their default color; Surface and many components provide it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tint every icon in this block red, then read the color back.', code: 'CompositionLocalProvider(LocalContentColor [[provides]] Color.Red) {\n    Icon(Icons.Filled.Warning, contentDescription = null)\n    val tint = LocalContentColor.[[current]]\n}', why: '<code>provides</code> binds a value for the block. <code>.current</code> reads the nearest one.' },
          { type: 'bug', prompt: 'This does not compile. Tap the line in the wrong place.', code: '@Composable\nfun SaveButton(onSave: () -> Unit) {\n    Button(onClick = {\n        val context = LocalContext.current\n        onSave()\n        Toast.makeText(context, "Saved", Toast.LENGTH_SHORT).show()\n    }) {\n        Text("Save")\n    }\n}', bug: 3, fix: '// move it above Button: val context = LocalContext.current', why: '<code>.current</code> is a composable read. <code>onClick</code> is a plain lambda that runs later, outside composition. Read the local in the composable body and capture it.' },
        ],
        quiz: [
          { q: 'Purple is provided outside, Orange inside, and an <code>Icon</code> sits inside both. What tint does it get?', options: ['Orange, the nearest provider', 'Purple, the outermost provider', 'The default, because the providers conflict'], a: 0, why: 'A read walks up the tree and stops at the first provider it meets.' },
          { q: 'When does <code>staticCompositionLocalOf</code> fit better than <code>compositionLocalOf</code>?', options: ['For a value that almost never changes, like a spacing scale', 'For a value that changes every frame', 'Whenever the value is a data class'], a: 0, why: 'Static locals skip reader tracking, which is cheaper, but a change recomposes the whole subtree.' },
          { q: 'Where can you read <code>LocalContext.current</code>?', options: ['In a composable function body', 'In an <code>onClick</code> lambda', 'In a ViewModel'], a: 0, why: 'Locals are part of the composition. Only composable code can read them.' },
        ],
        visual(el) {
          const nodes = [
            { id: 'root', label: 'compositionLocalOf { Color.Black }  // default', kind: 'def', depth: 0, color: 'var(--ink)', name: 'the default' },
            { id: 'col', label: 'Column {', depth: 1, up: 'root' },
            { id: 'r1', label: 'Text("Title")', kind: 'reader', depth: 2, up: 'col', pv: 'Title' },
            { id: 'p1', label: 'CompositionLocalProvider(LocalContentColor provides Purple) {', kind: 'prov', depth: 2, up: 'col', color: 'var(--accent)', name: 'Purple', on: true },
            { id: 'r2', label: 'Text("Subtitle")', kind: 'reader', depth: 3, up: 'p1', pv: 'Subtitle' },
            { id: 'box', label: 'Box {', depth: 3, up: 'p1' },
            { id: 'p2', label: 'CompositionLocalProvider(LocalContentColor provides Orange) {', kind: 'prov', depth: 4, up: 'box', color: 'var(--warm)', name: 'Orange', on: true },
            { id: 'r3', label: 'Icon(Icons.Filled.Star)', kind: 'reader', depth: 5, up: 'p2', pv: 'Star' },
            { id: 'r4', label: 'Text("Body")', kind: 'reader', depth: 4, up: 'box', pv: 'Body' },
          ];
          const by = Object.fromEntries(nodes.map(n => [n.id, n]));
          let busy = false;
          const o = out('Tap a Text or Icon to watch its LocalContentColor.current lookup.');
          const resolve = n => { let p = by[n.up]; while (p && !(p.kind === 'def' || (p.kind === 'prov' && p.on))) p = by[p.up]; return p; };
          const pv = {
            r1: h('p', {}, 'Title'), r2: h('p', {}, 'Subtitle'),
            r3: h('span', { class: 'cx-star', 'aria-label': 'Star icon' }, '★'), r4: h('p', {}, 'Body'),
          };
          const mini = h('div', { class: 'cx-mini', role: 'img', 'aria-label': 'Rendered preview' }, h('span', { class: 'cx-label' }, 'Preview'), pv.r1, pv.r2, h('div', { class: 'cx-mini-box' }, pv.r3, pv.r4));
          for (const n of nodes) {
            const pad = `margin-left:${Math.min(n.depth, 5) * 12}px;width:calc(100% - ${Math.min(n.depth, 5) * 12}px)`;
            const label = h('span', { class: 'cx-tn-label' }, n.label);
            if (n.kind === 'reader') {
              n.sw = h('span', { class: 'cx-sw' }); n.res = h('span', { class: 'cx-res' }, n.sw, '');
              n.el = h('button', { class: 'cx-tn', style: pad, onclick: () => lookup(n) }, label, n.res);
            } else if (n.kind === 'prov') {
              const box = h('input', { type: 'checkbox', id: `cx-${n.id}`, checked: true, onchange() { if (busy) { this.checked = n.on; return; } n.on = this.checked; n.el.classList.toggle('cx-off', !n.on); nodes.forEach(x => x.el.classList.remove('cx-walk', 'cx-found')); paint(); say(o, `${n.name} provider ${n.on ? 'restored' : 'removed'}. Readers below it now fall back to the next provider up.`); } });
              n.el = h('div', { class: 'cx-tn cx-prov', style: pad }, label, h('label', { class: 'switch', for: `cx-${n.id}` }, box, 'on'));
            } else n.el = h('div', { class: `cx-tn${n.kind === 'def' ? ' cx-def' : ''}`, style: pad }, label);
          }
          function paint() {
            for (const n of nodes) if (n.kind === 'reader') {
              const p = resolve(n);
              n.sw.style.background = p.color; n.res.lastChild.textContent = p.name;
              pv[n.id].style.color = p.color;
            }
          }
          async function lookup(n) {
            if (busy) return; busy = true;
            nodes.forEach(x => x.el.classList.remove('cx-walk', 'cx-found'));
            const target = resolve(n);
            n.el.classList.add('cx-walk');
            let p = by[n.up], hops = 0;
            while (p) {
              await sleep(330);
              if (!el.isConnected) return;
              if (p === target) { p.el.classList.add('cx-found'); replay(p.el, 'pop-soft'); break; }
              p.el.classList.add('cx-walk'); hops++;
              p = by[p.up];
            }
            replay(pv[n.id], 'pop');
            say(o, `${hl(n.label)} <span class="muted">reads LocalContentColor.current, walks up ${hops + 1} level${hops ? 's' : ''} and gets</span> <span class="good">${target.name}</span>`);
            busy = false;
          }
          paint();
          el.append(h('div', { class: 'cx-split' }, h('div', { class: 'cx-tree' }, nodes.map(n => n.el)), mini), o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'animation',
        title: 'Animations',
        tagline: 'Set a target. Compose animates toward it.',
        level: 'intermediate',
        body: `
<p>Compose animations follow state. You change a target and Compose animates toward it. <code>animateDpAsState</code>, <code>animateColorAsState</code> and the other <code>animate*AsState</code> functions animate one value. <code>AnimatedVisibility</code> animates content in and out. <code>AnimatedContent</code> swaps one piece of content for another. <code>updateTransition</code> drives several values from one state so they start and finish together.</p>
<p>Each takes an <code>AnimationSpec</code>. <code>tween(durationMillis, easing)</code> runs for a fixed time along a curve. <code>spring(dampingRatio, stiffness)</code> is physics-based and is the default for <code>animate*AsState</code>. When the target changes mid-flight, a spring keeps its current velocity and bends toward the new target, so interrupted motion stays smooth.</p>
<p>Pick a spec, then trigger each demo. Tap again before it settles to see it retarget.</p>`,
        code: `@Composable
fun FavoriteChip(selected: Boolean, count: Int, onClick: () -> Unit) {
    val transition = updateTransition(targetState = selected, label = "chip")
    val bg by transition.animateColor(label = "bg") { on ->
        if (on) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
    }
    val corner by transition.animateDp(label = "corner") { on -> if (on) 24.dp else 8.dp }
    val scale by animateFloatAsState(
        targetValue = if (selected) 1.1f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "scale",
    )

    Surface(
        onClick = onClick,
        color = bg,
        shape = RoundedCornerShape(corner),
        modifier = Modifier.graphicsLayer { scaleX = scale; scaleY = scale },
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AnimatedVisibility(visible = selected) { Icon(Icons.Filled.Check, contentDescription = null) }
            AnimatedContent(
                targetState = count,
                transitionSpec = { (slideInVertically { it } + fadeIn()) togetherWith (slideOutVertically { -it } + fadeOut()) },
                label = "count",
            ) { value -> Text("$value") }
        }
    }
}`,
        remember: 'Change the target, not the frames. Springs keep their velocity when the target moves.',
        terms: [
          { term: 'animate*AsState', def: 'A family of functions such as animateDpAsState and animateColorAsState that return a State animating toward the latest target value.' },
          { term: 'AnimatedContent', def: 'A composable that animates from old content to new whenever targetState changes, using a transitionSpec built with togetherWith.' },
          { term: 'updateTransition', def: 'Creates a Transition that animates several child values from one target state, so they run in sync.' },
          { term: 'spring', def: 'A physics-based AnimationSpec set by dampingRatio and stiffness that preserves velocity when interrupted.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the press a bouncy spring and cross-fade the counter.', code: 'val scale by animateFloatAsState(\n    targetValue = if (pressed) 0.9f else 1f,\n    animationSpec = [[spring]](dampingRatio = Spring.DampingRatioMediumBouncy),\n    label = "scale",\n)\nAnimatedContent(\n    targetState = count,\n    transitionSpec = { fadeIn() [[togetherWith]] fadeOut() },\n    label = "count",\n) { value -> Text("$value") }', why: '<code>spring</code> takes a damping ratio. <code>togetherWith</code> pairs the enter and exit transitions into a <code>ContentTransform</code>.' },
          { type: 'bug', prompt: 'During the swap both halves show the new tab. Tap the broken line.', code: 'AnimatedContent(targetState = tab, label = "tab") { target ->\n    when (tab) {\n        Tab.Feed -> FeedScreen()\n        Tab.Profile -> ProfileScreen()\n    }\n}', bug: 1, fix: '    when (target) {', why: 'The lambda runs once for the old content and once for the new, each with its own <code>target</code>. Reading the outer <code>tab</code> makes both render the current value.' },
        ],
        quiz: [
          { q: 'A number should slide out while the new number slides in. Which API?', options: ['<code>AnimatedContent</code>', '<code>animateFloatAsState</code>', '<code>AnimatedVisibility</code>'], a: 0, why: '<code>AnimatedContent</code> keeps the old and new content on screen during the swap.' },
          { q: 'A spring animation is halfway when the target flips back. What happens?', options: ['It keeps its velocity and curves toward the new target', 'It jumps to the end, then starts over', 'It finishes the old animation first'], a: 0, why: 'Springs carry their velocity into the new target. That is why interrupted spring motion looks continuous.' },
          { q: 'Why use <code>updateTransition</code> for a chip’s color, corner and scale?', options: ['All values follow one state and stay in sync', 'It is the only API that can animate a color', 'It skips recomposition'], a: 0, why: 'One transition drives every child animation from the same target state.' },
        ],
        visual(el) {
          const specs = [
            { key: 'tween(300)', src: 'tween(durationMillis = 300, easing = FastOutSlowInEasing)', ms: 300, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' },
            { key: 'spring(MediumBouncy)', src: 'spring(Spring.DampingRatioMediumBouncy, Spring.StiffnessMediumLow)', ms: 700, ease: SPRING },
          ];
          let spec = specs[1], big = false, visible = true, count = 0, selected = false;
          const specLine = h('div', { class: 'kt' });
          const pick = specs.map(s => cmd(s.key, () => { spec = s; paint(); say(o, `animationSpec = ${hl(s.src)}`); }));
          const o = out('Pick a spec, then trigger each animation.');
          const tr = props => props.map(p => `${p} ${spec.ms}ms ${spec.ease}`).join(', ');

          const sq = h('div', { class: 'cx-sq' });
          const banner = h('div', { class: 'cx-banner' }, 'New message');
          const numSlot = h('div', { class: 'cx-numslot' }, h('span', { class: 'cx-num' }, '0'));
          const chip = h('span', { class: 'cx-chip' }, h('span', { class: 'cx-tick' }, '✓'), 'Favorite');
          const cell = (src, stage, button) => h('div', { class: 'cx-cell' }, h('div', { class: 'kt', html: hl(src) }), h('div', { class: 'cx-mstage' }, stage), button);

          function paint() {
            specLine.innerHTML = hl(`val spec = ${spec.src}`);
            pick.forEach((b, i) => b.setAttribute('aria-pressed', specs[i] === spec));
            sq.style.transition = tr(['width', 'height']);
            banner.style.transition = tr(['opacity', 'transform']);
            chip.style.transition = tr(['background-color', 'color', 'border-color', 'border-radius', 'transform']);
            chip.firstChild.style.transition = tr(['width']);
          }
          function grow() {
            big = !big;
            sq.style.width = sq.style.height = big ? '88px' : '40px';
            say(o, `${hl('animateDpAsState')} <span class="muted">target</span> ${hl(big ? '88.dp' : '40.dp')} <span class="muted">with ${spec.key}</span>`);
          }
          function toggle() {
            visible = !visible;
            banner.classList.toggle('cx-gone', !visible);
            say(o, `${hl(`AnimatedVisibility(visible = ${visible})`)} <span class="muted">${visible ? 'enter: fadeIn + scaleIn' : 'exit: fadeOut + scaleOut, then leaves composition'}</span>`);
          }
          function next() {
            count++;
            const old = numSlot.lastElementChild, fresh = h('span', { class: 'cx-num' }, String(count));
            numSlot.append(fresh);
            const opt = { duration: spec.ms, easing: spec.ease, fill: 'both' };
            if (old.animate) {
              old.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], opt).onfinish = () => old.remove();
              fresh.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], opt);
            } else old.remove();
            say(o, `${hl('AnimatedContent(targetState = count)')} <span class="muted">old ${count - 1} slides out togetherWith new ${count} sliding in</span>`);
          }
          function select() {
            selected = !selected;
            chip.classList.toggle('cx-sel', selected);
            say(o, `${hl(`updateTransition(targetState = ${selected})`)} <span class="muted">color, corner, scale and check animate as one</span>`);
          }
          paint();
          el.append(
            h('div', { class: 'controls cx-ctl' }, h('span', { class: 'cx-label' }, 'Spec'), pick), specLine,
            h('div', { class: 'cx-anim' },
              cell('val size by animateDpAsState(\n    if (big) 88.dp else 40.dp, spec)', sq, cmd('big = !big', grow)),
              cell('AnimatedVisibility(visible) {\n    Banner("New message")\n}', banner, cmd('visible = !visible', toggle)),
              cell('AnimatedContent(count) { n ->\n    Text("$n")\n}', numSlot, cmd('count++', next)),
              cell('val t = updateTransition(selected)\nval bg by t.animateColor { ... }', chip, cmd('selected = !selected', select))),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'layout',
        title: 'Custom layouts',
        tagline: 'Constraints go down, sizes come up, then the parent places.',
        level: 'advanced',
        body: `
<p>When <code>Row</code>, <code>Column</code>, <code>Box</code> and <code>FlowRow</code> can’t express a layout, write your own with the <code>Layout</code> composable. It hands you the children as <code>measurables</code> and the incoming <code>constraints</code>: the min and max width and height you may take.</p>
<p>Layout is a single pass in three steps. Constraints flow down: you measure each child once, with constraints you choose, and get a <code>Placeable</code> that knows its size. Sizes flow up: you pick your own size from those, inside your constraints. Then you place: in <code>layout(width, height) { }</code> you call <code>placeRelative(x, y)</code> on each child.</p>
<p>Measuring a child twice in one pass throws an exception. If you need a size before the real measure, ask for an intrinsic such as <code>maxIntrinsicWidth</code>. Change the parent’s max width below and run the pass.</p>`,
        code: `@Composable
fun TagFlow(modifier: Modifier = Modifier, spacing: Dp = 8.dp, content: @Composable () -> Unit) {
    Layout(content = content, modifier = modifier) { measurables, constraints ->
        val gap = spacing.roundToPx()
        // 1. Constraints down: each child may be as small as it likes.
        val placeables = measurables.map { it.measure(constraints.copy(minWidth = 0, minHeight = 0)) }

        // 2. Sizes up: work out rows from the measured widths.
        var x = 0; var y = 0; var rowHeight = 0
        val positions = placeables.map { p ->
            if (x > 0 && x + p.width > constraints.maxWidth) { x = 0; y += rowHeight + gap; rowHeight = 0 }
            IntOffset(x, y).also { x += p.width + gap; rowHeight = maxOf(rowHeight, p.height) }
        }
        val height = (y + rowHeight).coerceIn(constraints.minHeight, constraints.maxHeight)

        // 3. Report our size, then place every child.
        layout(constraints.maxWidth, height) {
            placeables.forEachIndexed { i, p -> p.placeRelative(positions[i]) }
        }
    }
}`,
        remember: 'Measure each child once, choose your size, then place. Down, up, place.',
        terms: [
          { term: 'Layout (composable)', def: 'The low-level composable for custom layouts; its measure block receives the children and constraints and must call layout(width, height) to place them.' },
          { term: 'Constraints', def: 'The minimum and maximum width and height a parent allows a child to take during measurement.' },
          { term: 'Measurable', def: 'A child in a layout that has not been measured yet; calling measure(constraints) on it returns a Placeable.' },
          { term: 'Placeable', def: 'A measured child with a known width and height that the parent positions with place or placeRelative inside layout { }.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish this vertical stack.', code: 'Layout(content) { measurables, constraints ->\n    val placeables = measurables.map { it.[[measure]](constraints) }\n    val height = placeables.sumOf { it.height }\n    [[layout]](constraints.maxWidth, height) {\n        var y = 0\n        placeables.forEach { it.[[placeRelative|place]](0, y); y += it.height }\n    }\n}', why: 'Measure turns a <code>Measurable</code> into a <code>Placeable</code>. <code>layout()</code> reports your size and opens the block where you place children.' },
          { type: 'bug', prompt: 'This crashes the first time it lays out. Tap the broken line.', code: 'Layout(content) { measurables, constraints ->\n    val widest = measurables.maxOf { it.measure(constraints).width }\n    val placeables = measurables.map {\n        it.measure(Constraints.fixedWidth(widest))\n    }\n    layout(widest, placeables.sumOf { it.height }) {\n        var y = 0\n        placeables.forEach { it.placeRelative(0, y); y += it.height }\n    }\n}', bug: 1, fix: '    val widest = measurables.maxOf { it.maxIntrinsicWidth(constraints.maxHeight) }', why: 'Each child is measured on line 2 and again on line 4. Compose allows one <code>measure()</code> per child per pass. Intrinsics answer “how wide would you be?” without measuring.' },
        ],
        quiz: [
          { q: 'How many times may you call <code>measure()</code> on one child in a layout pass?', options: ['Once', 'Twice: once for width, once for height', 'As often as you need'], a: 0, why: 'Single-pass measurement keeps deep trees fast. A second call throws.' },
          { q: 'In what order does a layout pass run?', options: ['Constraints down, sizes up, then placement', 'Placement first, then measurement', 'Sizes down, constraints up'], a: 0, why: 'A parent constrains its children, reads their sizes, picks its own, then places them.' },
          { q: 'Why call <code>placeRelative</code> rather than <code>place</code>?', options: ['It mirrors x in right-to-left layouts', 'It animates the move', 'It allows a second measure'], a: 0, why: '<code>placeRelative</code> flips the x position when the layout direction is RTL.' },
        ],
        visual(el) {
          const tags = [['Kotlin', 70], ['UI', 44], ['Compose', 92], ['Flow', 56], ['KMP', 50], ['Room', 62]];
          const GAP = 8, H = 32;
          let maxW = 280, busy = false;
          const src = [
            'Layout(content) { measurables, constraints ->',
            '    val placeables = measurables.map { it.measure(constraints) }',
            '    val positions = flowPositions(placeables, constraints.maxWidth)',
            '    layout(constraints.maxWidth, totalHeight) {',
            '        placeables.forEachIndexed { i, p -> p.placeRelative(positions[i]) }',
            '    }',
            '}',
          ];
          const lines = src.map(s => h('div', { class: 'branch', html: hl(s) }));
          const mark = i => lines.forEach((l, j) => l.classList.toggle('scan', j === i));
          const con = h('span', { class: 'cx-dim cx-down' });
          const size = h('span', { class: 'cx-dim cx-up' });
          const tray = h('div', { class: 'cx-tray', 'aria-label': 'Children' });
          const pbox = h('div', { class: 'cx-pbox' });
          const o = out('');
          const flow = () => {
            let x = 0, y = 0;
            const pos = tags.map(([, w]) => { if (x > 0 && x + w > maxW) { x = 0; y += H + GAP; } const p = [x, y]; x += w + GAP; return p; });
            return { pos, height: y + H };
          };
          const kid = (name, w, text, cls) => h('span', { class: `cx-kid ${cls || ''}`, style: `width:${w}px` }, text);
          const widthBtns = [280, 200, 140].map(w => cmd(`maxWidth = ${w}.dp`, () => { if (busy) return; maxW = w; run(); }));
          function paintStatic() {
            widthBtns.forEach((b, i) => b.setAttribute('aria-pressed', [280, 200, 140][i] === maxW));
            const { pos, height } = flow();
            tray.replaceChildren(...tags.map(([n, w]) => kid(n, w, `${w}×${H}`, 'cx-measured cx-used')));
            pbox.style.width = `${maxW}px`; pbox.style.height = `${height}px`;
            pbox.replaceChildren(...tags.map(([n, w], i) => Object.assign(kid(n, w, n), { style: `width:${w}px;left:${pos[i][0]}px;top:${pos[i][1]}px` })));
            con.textContent = `constraints ↓ maxWidth = ${maxW}, maxHeight = ∞`;
            size.textContent = `size ↑ ${maxW} × ${height}`;
          }
          async function run() {
            if (busy) return; busy = true;
            widthBtns.forEach((b, i) => b.setAttribute('aria-pressed', [280, 200, 140][i] === maxW));
            const { pos, height } = flow();
            const trayKids = tags.map(([n, w]) => kid(n, w, '?'));
            tray.replaceChildren(...trayKids);
            pbox.replaceChildren(); pbox.style.width = `${maxW}px`; pbox.style.height = `${H}px`;
            size.textContent = 'size ↑ not known yet';
            con.textContent = `constraints ↓ maxWidth = ${maxW}, maxHeight = ∞`;
            mark(0); replay(con, 'pop-soft');
            say(o, 'The parent receives its constraints and gets the children as measurables.');
            const wait = async ms => { await sleep(ms); return el.isConnected; };
            if (!await wait(700)) return;
            mark(1);
            for (let i = 0; i < tags.length; i++) {
              trayKids[i].textContent = `${tags[i][1]}×${H}`; trayKids[i].classList.add('cx-measured'); replay(trayKids[i], 'pop');
              say(o, `${hl(`measure(maxWidth = ${maxW})`)} <span class="muted">→ ${tags[i][0]} reports</span> ${tags[i][1]}×${H}`);
              if (!await wait(300)) return;
            }
            mark(2);
            say(o, `Rows worked out from the widths: ${pos[pos.length - 1][1] / (H + GAP) + 1} row(s).`);
            if (!await wait(600)) return;
            mark(3);
            pbox.style.height = `${height}px`; size.textContent = `size ↑ ${maxW} × ${height}`; replay(size, 'pop-soft');
            say(o, `${hl(`layout(${maxW}, ${height})`)} <span class="muted">reports the parent size to its own parent</span>`);
            if (!await wait(600)) return;
            mark(4);
            for (let i = 0; i < tags.length; i++) {
              const [n, w] = tags[i];
              pbox.append(h('span', { class: 'cx-kid drop-in', style: `width:${w}px;left:${pos[i][0]}px;top:${pos[i][1]}px` }, n));
              trayKids[i].classList.add('cx-used');
              if (!await wait(220)) return;
            }
            mark(-1);
            say(o, `<span class="good">Done.</span> One measure per child, one size up, ${tags.length} placements.`);
            busy = false;
          }
          paintStatic();
          say(o, 'Pick a max width to run a full layout pass.');
          el.append(
            h('div', { class: 'when' }, lines),
            h('div', { class: 'controls cx-ctl' }, widthBtns),
            h('span', { class: 'cx-label' }, 'measurables → placeables'), tray,
            h('div', { class: 'cx-pwrap' }, con, h('span', { class: 'cx-label' }, 'TagFlow'), pbox, size),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'navigation',
        title: 'Type-safe navigation',
        tagline: 'Routes are Kotlin types. The compiler checks every argument.',
        level: 'intermediate',
        body: `
<p>Navigation Compose 2.8 and later uses Kotlin types as routes. Mark each destination <code>@Serializable</code>: a <code>data object</code> when it takes no arguments, a <code>data class</code> when it does. A typo in a route or a missing argument is now a compile error.</p>
<p>Build the graph with <code>NavHost</code> and one <code>composable&lt;Route&gt;</code> per screen. Navigate with <code>navController.navigate(Product(id = 42))</code>. On the other side, <code>entry.toRoute&lt;Product&gt;()</code> gives you the typed object back, and a ViewModel can call <code>savedStateHandle.toRoute&lt;Product&gt;()</code>. Pass ids, then load the data from a repository.</p>
<p>Each <code>navigate</code> pushes an entry onto the back stack, and <code>popBackStack()</code> removes the top one. <code>launchSingleTop</code> and <code>popUpTo</code> keep the stack tidy. Navigation 3, a newer library where you hold the back stack as a plain list, keeps the same idea of typed keys.</p>`,
        code: `@Serializable data object Home
@Serializable data class Product(val id: Int)
@Serializable data object Cart

@Composable
fun ShopNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = Home) {
        composable<Home> {
            HomeScreen(onProductClick = { id -> navController.navigate(Product(id)) })
        }
        composable<Product> { entry ->
            val product: Product = entry.toRoute()
            ProductScreen(
                id = product.id,
                onOpenCart = { navController.navigate(Cart) { launchSingleTop = true } },
            )
        }
        composable<Cart> {
            CartScreen(onCheckoutDone = {
                navController.navigate(Home) { popUpTo<Home> { inclusive = true } }
            })
        }
    }
}

class ProductViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val productId = savedStateHandle.toRoute<Product>().id
}`,
        remember: '@Serializable route in, navigate(Route(args)) to go, toRoute<Route>() to read it back.',
        terms: [
          { term: 'Type-safe route', def: 'A @Serializable object or class used as a navigation destination, so the compiler checks its arguments.' },
          { term: 'NavHost', def: 'The composable that shows the current destination of a NavController’s back stack and declares the navigation graph.' },
          { term: 'composable<T>()', def: 'The NavGraphBuilder function that adds a destination for route type T and its screen content.' },
          { term: 'toRoute()', def: 'Rebuilds the typed route object, with its arguments, from a NavBackStackEntry or a SavedStateHandle.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a typed route and read its argument back.', code: '@[[Serializable]]\ndata class Product(val id: Int)\n\ncomposable<[[Product]]> { entry ->\n    val product = entry.[[toRoute]]<Product>()\n    ProductScreen(id = product.id)\n}', why: 'The route class must be serializable so Navigation can store it in the back stack. <code>toRoute</code> rebuilds it on the other side.' },
          { type: 'bug', prompt: 'After login the app floods the back stack with Home entries. Tap the broken line.', code: 'composable<Login> {\n    val viewModel: LoginViewModel = viewModel()\n    val loggedIn by viewModel.loggedIn.collectAsStateWithLifecycle()\n    if (loggedIn) navController.navigate(Home)\n    LoginScreen(onSubmit = viewModel::submit)\n}', bug: 3, fix: '    LaunchedEffect(loggedIn) { if (loggedIn) navController.navigate(Home) { popUpTo<Login> { inclusive = true } } }', why: '<code>navigate</code> is a side effect. Called in the composable body, it runs on every recomposition. Move it into an effect keyed on the state, and pop Login so back does not return to it.' },
        ],
        quiz: [
          { q: 'Inside <code>composable&lt;Product&gt; { entry -&gt; }</code>, how do you get the typed argument?', options: ['<code>entry.toRoute&lt;Product&gt;()</code>', '<code>entry.arguments?.getInt("id")</code>', '<code>navController.currentDestination</code>'], a: 0, why: '<code>toRoute</code> deserializes the whole route object, with every argument typed.' },
          { q: 'Stack: Home, Product(7), Cart. You call <code>navigate(Cart) { launchSingleTop = true }</code>. Result?', options: ['Home, Product(7), Cart', 'Home, Product(7), Cart, Cart', 'Home, Cart'], a: 0, why: 'Cart is already on top, so single-top reuses it instead of pushing a copy.' },
          { q: 'What should a route class carry?', options: ['Ids and small values, like <code>Product(id = 42)</code>', 'The whole <code>Product</code> object with its image bytes', 'A reference to the ViewModel'], a: 0, why: 'Routes are saved in the back stack state. Keep them small and load the data with the id.' },
        ],
        visual(el) {
          const ids = [42, 7, 108];
          let next = 0, busy = false;
          const mk = {
            home: () => ({ type: 'Home', route: 'Home', args: 'data object, no arguments', title: 'Home', read: 'composable<Home>' }),
            product: id => ({ type: 'Product', route: `Product(id = ${id})`, args: `toRoute<Product>().id == ${id}`, title: `Product #${id}`, read: `entry.toRoute<Product>().id = ${id}` }),
            cart: () => ({ type: 'Cart', route: 'Cart', args: 'data object, no arguments', title: 'Cart', read: 'composable<Cart>' }),
          };
          const stack = [];
          const stackEl = h('div', { class: 'cx-stack', 'aria-label': 'Back stack, bottom first' });
          const sTitle = h('p', { class: 'cx-scr-title' }), sCode = h('p', { class: 'cx-scr-code' });
          const phone = h('div', { class: 'phone', role: 'img', 'aria-label': 'Current screen' }, sTitle, sCode);
          const o = out('');
          const entryEl = e => h('div', { class: 'cx-entry drop-in' }, h('span', { class: 'cx-entry-route' }, e.route), h('span', { class: 'cx-entry-args' }, e.args));
          function paintTop() {
            stack.forEach((e, i) => e.el.classList.toggle('cx-top', i === stack.length - 1));
            const top = stack[stack.length - 1];
            sTitle.textContent = top.title; sCode.textContent = top.read;
            replay(phone, 'pop-soft');
            productBtn.innerHTML = hl(`navigate(Product(id = ${ids[next]}))`);
          }
          function push(e) { e.el = entryEl(e); stack.push(e); stackEl.append(e.el); paintTop(); }
          async function pop() {
            const e = stack.pop();
            e.el.classList.remove('drop-in'); e.el.classList.add('leave');
            await sleep(430);
            e.el.remove();
          }
          const guard = fn => async () => { if (busy) return; busy = true; await fn(); busy = false; };
          const productBtn = cmd('', guard(async () => {
            const id = ids[next]; next = (next + 1) % ids.length;
            push(mk.product(id));
            say(o, `${hl(`navigate(Product(id = ${id}))`)} <span class="muted">pushes a typed entry. The compiler checked id is an Int.</span>`);
          }));
          const cartBtn = cmd('navigate(Cart) { launchSingleTop = true }', guard(async () => {
            if (stack[stack.length - 1].type === 'Cart') { replay(stack[stack.length - 1].el, 'shake'); say(o, 'Cart is already on top. launchSingleTop reuses it, no duplicate.'); return; }
            push(mk.cart());
            say(o, `${hl('navigate(Cart)')} <span class="muted">pushed. Tap it again to see launchSingleTop.</span>`);
          }));
          const popBtn = cmd('popBackStack()', guard(async () => {
            if (stack.length === 1) { replay(stack[0].el, 'shake'); say(o, 'Only Home is left. Here system back would finish the activity instead.'); return; }
            const gone = stack[stack.length - 1].route;
            await pop(); if (!el.isConnected) return; paintTop();
            say(o, `${hl('popBackStack()')} <span class="muted">removed ${gone}. The screen below comes back with its state.</span>`);
          }));
          const homeBtn = cmd('navigate(Home) { popUpTo<Home> { inclusive = true } }', guard(async () => {
            const n = stack.length;
            while (stack.length) { await pop(); if (!el.isConnected) return; }
            push(mk.home());
            say(o, `Popped ${n} entr${n > 1 ? 'ies' : 'y'} up to and including Home, then pushed a fresh Home.`);
          }));
          push(mk.home()); push(mk.product(ids[next])); next = 1;
          paintTop();
          say(o, 'Start: Home, then Product(id = 42). Push, pop and clear the stack.');
          el.append(
            h('div', { class: 'cx-nav' }, h('div', { class: 'cx-tree' }, h('span', { class: 'cx-label' }, 'Back stack (top is current)'), stackEl), phone),
            h('div', { class: 'controls cx-ctl' }, productBtn, cartBtn, popBtn, homeBtn),
            o);
        },
      },
    ],
  });
})();
