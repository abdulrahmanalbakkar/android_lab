/* Jetpack Compose track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed cmp-. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const act = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const css = `
.cmp-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; min-width: 0; }
.cmp-label { font: 600 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cmp-flash { animation: cmp-flash 0.7s ease-out; }
@keyframes cmp-flash { from { background: var(--accent-soft); box-shadow: 0 0 0 6px var(--accent-soft); } }

/* 1 recomposition */
.cmp-tree { display: grid; gap: 8px; min-width: 0; }
.cmp-kids { display: grid; gap: 8px; margin-left: 12px; padding-left: 12px; border-left: 2px solid var(--line); min-width: 0; }
.cmp-node { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 500 0.84rem var(--mono); min-width: 0; transition: opacity 0.25s, border-color 0.25s; }
.cmp-node-label { flex: 1 1 150px; min-width: 0; overflow-wrap: anywhere; }
.cmp-status { font: 600 0.7rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
.cmp-badge { min-width: 2.2em; text-align: center; padding: 2px 6px; border-radius: 999px; background: var(--sunk); font-weight: 700; font-variant-numeric: tabular-nums; }
.cmp-node.cmp-hit { border-color: var(--accent); }
.cmp-node.cmp-hit .cmp-status { color: var(--accent); }
.cmp-node.cmp-hit .cmp-badge { background: var(--accent); color: var(--accent-ink); }
.cmp-node.cmp-skip { opacity: 0.5; }
.cmp-avatar { width: 54px; height: 54px; border-radius: 50%; background: var(--accent-soft); border: 3px solid var(--accent); }
.cmp-pv-name { font: 700 1.15rem var(--display); padding: 0 6px; border-radius: 6px; }
.cmp-pv-count { color: var(--muted); padding: 0 6px; border-radius: 6px; }

/* 2 remember */
.cmp-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 14px; }
.cmp-card { display: grid; gap: 10px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.cmp-card-title { font: 700 0.95rem var(--mono); }
.cmp-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.cmp-row .slot { width: 72px; height: 56px; }
.cmp-mem { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 40px; }
.cmp-stack { display: grid; min-width: 0; }
.cmp-stack > * { grid-area: 1 / 1; }
.cmp-obj { font: 600 0.8rem var(--mono); padding: 5px 10px; border-radius: 8px; background: var(--surface); border: 2px solid var(--ink); color: var(--ink); white-space: nowrap; }
.cmp-obj.cmp-reuse { border-color: var(--ok); background: var(--ok-soft); }
.cmp-obj.cmp-new { border-color: var(--warm); background: var(--warm-soft); }

/* 3 rememberSaveable */
.cmp-rot-slot { width: 260px; height: 260px; max-width: 100%; display: grid; place-items: center; flex: none; }
.cmp-rot-slot .phone { width: 170px; height: 250px; padding: 14px 12px; transition: transform 0.55s cubic-bezier(0.5, 0, 0.3, 1), width 0s, height 0s; }
.cmp-rot-slot .phone.cmp-land { width: 250px; height: 170px; }
.cmp-prow { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; width: 100%; transition: opacity 0.3s; }
.cmp-prow .cmp-label { text-transform: none; letter-spacing: 0; font-size: 0.74rem; overflow-wrap: anywhere; }
.cmp-vslot { display: grid; place-items: center; width: 54px; height: 50px; overflow: hidden; }
.cmp-vslot > * { grid-area: 1 / 1; }
.cmp-fade { opacity: 0.12; }
.cmp-bundle { display: grid; gap: 8px; align-content: start; width: min(210px, 100%); min-height: 96px; padding: 12px; border-radius: 12px; border: 2px dashed var(--warm); background: var(--warm-soft); }
.cmp-bundle-title { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--warm); }
.cmp-entry { justify-self: start; font: 600 0.85rem var(--mono); padding: 4px 10px; border-radius: 6px; background: var(--surface); color: var(--ink); }

/* 4 state hoisting */
.cmp-flow { display: grid; min-width: 0; }
.cmp-comp { display: grid; gap: 8px; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); min-width: 0; }
.cmp-comp-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center; }
.cmp-comp-name { font: 700 0.88rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.cmp-state { justify-self: start; font: 600 0.84rem var(--mono); padding: 4px 10px; border-radius: 8px; background: var(--accent-soft); color: var(--ink); overflow-wrap: anywhere; max-width: 100%; }
.cmp-state.cmp-none { background: var(--sunk); color: var(--muted); font-weight: 500; }
.cmp-pv-btn { font: 700 0.85rem var(--body); padding: 6px 16px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); transition: background 0.25s, color 0.25s; }
.cmp-pv-btn[aria-disabled="true"] { background: var(--sunk); color: var(--muted); }
.cmp-lanes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); height: 104px; transition: opacity 0.3s; }
.cmp-lanes.cmp-off { opacity: 0.3; }
.cmp-lane { position: relative; overflow: hidden; min-width: 0; }
.cmp-lane::before { content: ""; position: absolute; left: 50%; top: 4px; bottom: 4px; width: 2px; margin-left: -1px; background: var(--line); }
.cmp-lane::after { content: ""; position: absolute; left: 50%; margin-left: -7px; border-style: solid; }
.cmp-down::after { bottom: 0; border-width: 9px 7px 0; border-color: var(--muted) transparent transparent; }
.cmp-up::after { top: 0; border-width: 0 7px 9px; border-color: transparent transparent var(--warm); }
.cmp-lane-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 2px 8px; border-radius: 6px; background: var(--surface); font: 600 0.74rem var(--mono); color: var(--muted); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.cmp-up .cmp-lane-label { color: var(--warm); }
.cmp-travel { position: absolute; left: 50%; transform: translateX(-50%); z-index: 1; max-width: calc(100% - 6px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font: 600 0.76rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.cmp-travel.cmp-ev { background: var(--warm); }
.cmp-go-down { animation: cmp-down 0.75s ease-in-out forwards; }
.cmp-go-up { animation: cmp-up 0.75s ease-in-out forwards; }
@keyframes cmp-down { from { top: 0; } to { top: calc(100% - 26px); } }
@keyframes cmp-up { from { top: calc(100% - 26px); } to { top: 0; } }
.cmp-field { display: grid; gap: 2px; padding: 6px 12px 8px; border-radius: 8px; border: 2px solid var(--accent); background: var(--bg); min-height: 54px; min-width: 0; }
.cmp-field-label { font-size: 0.74rem; color: var(--accent); font-weight: 700; }
.cmp-field-line { font: 500 1rem var(--mono); overflow-wrap: anywhere; }
.cmp-caret { display: inline-block; width: 2px; height: 1.1em; margin-left: 1px; vertical-align: -0.2em; background: var(--accent); animation: pulse 1s steps(1) infinite; }

/* 5 modifier order */
.cmp-mod-wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
.cmp-chain { display: grid; gap: 6px; align-content: center; background: var(--code-bg); border-radius: 14px; padding: 12px; min-width: 0; overflow-x: auto; }
.cmp-chain-head { font: 500 0.86rem/1.5 var(--mono); color: var(--code-ink); white-space: pre; }
.cmp-chain .cmd { justify-self: start; margin-left: 18px; border-color: rgba(255, 255, 255, 0.14); }
.cmp-preview { display: grid; place-items: center; min-height: 220px; padding: 20px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; overflow: hidden; }
.cmp-layer { display: grid; min-width: 0; min-height: 0; }
.cmp-l-padding { outline: 1px dashed var(--muted); outline-offset: -1px; }
.cmp-l-background { background: var(--accent); color: var(--accent-ink); }
.cmp-l-clickable { position: relative; overflow: hidden; outline: 2px dashed var(--warm); outline-offset: -2px; cursor: pointer; }
.cmp-content { display: grid; place-items: center; min-width: 26px; min-height: 26px; font: 700 1rem var(--body); }
.cmp-ripple { position: absolute; width: 20px; height: 20px; margin: -10px 0 0 -10px; border-radius: 50%; background: var(--warm); opacity: 0.5; pointer-events: none; animation: cmp-ripple 0.6s ease-out forwards; }
@keyframes cmp-ripple { to { transform: scale(16); opacity: 0; } }
.cmp-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 0.85rem; color: var(--muted); }
.cmp-legend i { display: inline-block; width: 18px; height: 12px; margin-right: 6px; vertical-align: -1px; border-radius: 3px; }
.cmp-legend .lg-bg { background: var(--accent); }
.cmp-legend .lg-click { outline: 2px dashed var(--warm); outline-offset: -2px; }
.cmp-legend .lg-pad { outline: 1px dashed var(--muted); outline-offset: -1px; }

/* 6 lazy keys */
.cmp-lazy { display: grid; gap: 8px; align-content: start; width: min(340px, 100%); min-height: 120px; padding: 12px; border-radius: 18px; border: 6px solid var(--code-bg); background: var(--surface); margin: 0 auto; }
.cmp-item { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; width: 100%; padding: 10px 12px; border-radius: 10px; border: 2px solid transparent; background: var(--sunk); color: var(--ink); font-weight: 700; text-align: left; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
.cmp-item:hover { border-color: var(--accent); }
.cmp-box { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--muted); display: grid; place-items: center; font-size: 0.85rem; color: var(--accent-ink); }
.cmp-item.cmp-on .cmp-box { background: var(--accent); border-color: var(--accent); }
.cmp-item.cmp-on .cmp-box::after { content: "✓"; }
.cmp-item.cmp-on .cmp-name { text-decoration: line-through; color: var(--muted); }
.cmp-tag { font: 600 0.72rem var(--mono); color: var(--muted); white-space: nowrap; }
.cmp-item.cmp-wrong { border-color: var(--err); background: var(--err-soft); }

/* 7 effects */
.cmp-fx { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); min-width: 0; }
.cmp-fx-lane { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 10px; align-items: center; min-width: 0; }
.cmp-fx-name { font: 600 0.78rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cmp-jobs { display: flex; flex-wrap: wrap; gap: 6px; min-height: 36px; align-items: center; min-width: 0; }
.cmp-job { position: relative; overflow: hidden; display: inline-flex; gap: 8px; align-items: center; padding: 5px 10px; border-radius: 999px; border: 2px solid var(--accent); background: var(--surface); font: 600 0.78rem var(--mono); color: var(--ink); }
.cmp-job > span { position: relative; }
.cmp-job > .cmp-job-fill { position: absolute; top: 0; bottom: 0; left: 0; width: 0; background: var(--accent-soft); }
.cmp-job-state { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); }
.cmp-job.cmp-done { border-color: var(--ok); background: var(--ok-soft); }
.cmp-job.cmp-done .cmp-job-fill { display: none; }
.cmp-job.cmp-done .cmp-job-state { color: var(--ok); }
.cmp-job.cmp-cancel { border-color: var(--err); background: var(--err-soft); }
.cmp-job.cmp-cancel .cmp-job-fill { background: var(--err-soft); }
.cmp-job.cmp-cancel .cmp-job-label { text-decoration: line-through; color: var(--muted); }
.cmp-job.cmp-cancel .cmp-job-state { color: var(--err); }
.cmp-screen { display: grid; gap: 2px; justify-items: start; padding: 12px 16px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); width: min(260px, 100%); transition: opacity 0.3s; }
.cmp-screen-title { font: 700 1.2rem var(--display); }
.cmp-screen.cmp-gone { opacity: 0.45; border-style: dashed; }

@media (max-width: 640px) {
  .cmp-split, .cmp-mod-wrap { grid-template-columns: minmax(0, 1fr); }
  .cmp-fx-lane { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}`;

  Lab.addTrack({
    id: 'compose',
    title: 'Jetpack Compose',
    description: 'Build Android UI with Kotlin functions that redraw themselves when state changes.',
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'recomposition',
        title: 'Composables and recomposition',
        tagline: 'UI = f(state). Change the state, the function runs again.',
        body: `
<p>A composable is a Kotlin function marked <code>@Composable</code>. It does not return a view. It describes what the screen should show for the data it gets.</p>
<p>When a <code>State</code> value changes, Compose runs again only the composables that read it. This is called <em>recomposition</em>. A child whose inputs are equal to last time gets <em>skipped</em>, so its code does not run at all.</p>
<p>Below, <code>ProfileScreen</code> reads both <code>name</code> and <code>likes</code> to pass them down. Each node counts how many times it has run. Change a value and see which counters move.</p>`,
        code: `@Composable
fun ProfileScreen() {
    var name by remember { mutableStateOf("Ada") }
    var likes by remember { mutableIntStateOf(0) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Avatar()
        NameText(name)
        LikeCount(likes)
        LikeButton(onClick = { likes++ })
    }
}

@Composable
fun LikeCount(likes: Int) {
    Text("$likes likes")   // runs again only when likes changes
}`,
        remember: 'Change state, and only the composables that read it run again. Equal inputs get skipped.',
        level: 'beginner',
        terms: [
          { term: '@Composable', def: 'An annotation that marks a function as a composable, which describes UI for its inputs and can only be called from other composables.' },
          { term: 'Recomposition', def: 'Compose running a composable again because a State value it read has changed.' },
          { term: 'Skipping', def: 'Compose leaving out a composable during recomposition because all its inputs are equal to last time.' },
          { term: 'mutableStateListOf', def: 'Creates a list that Compose observes, so adding or removing items triggers recomposition.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn this function into a composable that shows the name.', code: '[[@Composable]]\nfun Greeting(name: String) {\n    [[Text]]("Hello, $name")\n}', why: 'Only a function marked <code>@Composable</code> can call other composables like <code>Text</code>.' },
          { type: 'bug', prompt: 'Tapping Add never shows the new tag. Tap the line that causes it.', code: '@Composable\nfun TagList() {\n    val tags = remember { mutableListOf("kotlin") }\n    Column {\n        tags.forEach { Text(it) }\n        Button(onClick = { tags.add("compose") }) { Text("Add") }\n    }\n}', bug: 2, fix: '    val tags = remember { mutableStateListOf("kotlin") }', why: 'A plain <code>MutableList</code> is not State. Changing it does not tell Compose to recompose. <code>mutableStateListOf</code> does.' },
        ],
        quiz: [
          { q: 'What makes a composable recompose?', options: ['A <code>State</code> value it read has changed', 'Every new frame', 'Calling <code>invalidate()</code> on it'], a: 0, why: 'Compose tracks which state each composable reads and reruns only those when the state changes.' },
          { q: 'After <code>likes++</code>, <code>ProfileScreen</code> runs again. What happens to <code>Avatar()</code>, which takes no parameters?', options: ['It runs again too', 'It is skipped'], a: 1, why: 'Its inputs did not change, so Compose skips it.' },
          { q: 'What recomposes after <code>likes = likes</code>?', options: ['Everything', 'Only <code>LikeCount</code>', 'Nothing'], a: 2, why: 'Writing an equal value does not count as a change, so no reader is notified.' },
        ],
        visual(el) {
          let name = 'Ada', likes = 0, busy = false;
          const nodes = {
            screen: { label: () => 'ProfileScreen()' },
            avatar: { label: () => 'Avatar()' },
            name: { label: () => `NameText(name = "${name}")` },
            count: { label: () => `LikeCount(likes = ${likes})` },
            button: { label: () => 'LikeButton(onClick)' },
          };
          for (const n of Object.values(nodes)) {
            n.runs = 1;
            n.lab = h('span', { class: 'cmp-node-label' }, n.label());
            n.status = h('span', { class: 'cmp-status' }, 'composed');
            n.badge = h('span', { class: 'cmp-badge', title: 'Times this composable has run' }, '1');
            n.el = h('div', { class: 'cmp-node' }, n.lab, n.status, n.badge);
          }
          const pv = {
            avatar: h('div', { class: 'cmp-avatar', 'aria-hidden': 'true' }),
            name: h('p', { class: 'cmp-pv-name' }, name),
            count: h('p', { class: 'cmp-pv-count' }, '0 likes'),
            button: h('button', { class: 'btn small primary', onclick: () => act('likes') }, 'Like'),
          };
          const phone = h('div', { class: 'phone', role: 'img', 'aria-label': 'Screen preview' }, pv.avatar, pv.name, pv.count, pv.button);
          const o = out('Change a value and watch which counters go up.');
          const nameBtn = cmd('name = "Grace"', () => act('name'));

          async function rerun(k) {
            const n = nodes[k];
            n.runs++; n.badge.textContent = n.runs; replay(n.badge, 'pop');
            n.lab.textContent = n.label();
            n.status.textContent = 'recomposed';
            n.el.classList.add('cmp-hit'); replay(n.el, 'cmp-flash');
            if (k === 'name') { pv.name.textContent = name; replay(pv.name, 'cmp-flash'); }
            if (k === 'count') { pv.count.textContent = `${likes} like${likes === 1 ? '' : 's'}`; replay(pv.count, 'cmp-flash'); }
            await sleep(320);
          }
          async function act(kind) {
            if (busy) return; busy = true;
            Object.values(nodes).forEach(n => n.el.classList.remove('cmp-hit', 'cmp-skip'));
            if (kind === 'same') {
              Object.values(nodes).forEach(n => { n.status.textContent = 'not invalidated'; });
              replay(phone, 'shake');
              say(o, `${hl('likes = likes')} <span class="muted">// equal value, so nobody is told. 0 composables ran.</span>`);
              busy = false; return;
            }
            let changed, src;
            if (kind === 'likes') { likes++; changed = 'count'; src = 'likes++'; }
            else { src = `name = "${name === 'Ada' ? 'Grace' : 'Ada'}"`; name = name === 'Ada' ? 'Grace' : 'Ada'; changed = 'name'; nameBtn.innerHTML = hl(`name = "${name === 'Ada' ? 'Grace' : 'Ada'}"`); }
            say(o, `${hl(src)} <span class="muted">// ProfileScreen read this state, so it runs first</span>`);
            await rerun('screen');
            for (const k of ['avatar', 'name', 'count', 'button']) {
              await sleep(220);
              if (k === changed) await rerun(k);
              else { nodes[k].el.classList.add('cmp-skip'); nodes[k].status.textContent = 'skipped'; }
            }
            say(o, `${hl(src)} <span class="muted">→</span> 2 of 5 composables ran. <span class="muted">The other 3 got equal inputs and were skipped.</span>`);
            busy = false;
          }
          el.append(
            h('div', { class: 'cmp-split' },
              h('div', { class: 'cmp-tree' }, nodes.screen.el, h('div', { class: 'cmp-kids' }, nodes.avatar.el, nodes.name.el, nodes.count.el, nodes.button.el)),
              phone),
            h('div', { class: 'controls' }, cmd('likes++', () => act('likes')), nameBtn, cmd('likes = likes', () => act('same'))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'remember',
        title: 'State and remember',
        tagline: 'Keep a value alive between recompositions.',
        body: `
<p>A composable can run many times. Every local variable inside it starts fresh on each run. To keep a value from one run to the next, wrap it in <code>remember { }</code>.</p>
<p><code>remember</code> stores the object in the composition, in a slot tied to that spot in the code. The first run creates the value. Every later run gets the same object back. Pair it with <code>mutableStateOf</code> (or <code>mutableIntStateOf</code> for an Int) so that writing the value also triggers a recomposition.</p>
<p>Forget <code>remember</code> and each recomposition builds a brand-new state object set to 0. Lint flags this as an error. Click <code>count++</code> on both counters below.</p>`,
        code: `@Composable
fun Counter() {
    var count by remember { mutableIntStateOf(0) }
    Column {
        Text("Count: $count")
        Button(onClick = { count++ }) { Text("+1") }
    }
}

@Composable
fun BrokenCounter() {
    var count by mutableIntStateOf(0)   // no remember: a new state on every run
    Column {
        Text("Count: $count")           // always 0
        Button(onClick = { count++ }) { Text("+1") }
    }
}`,
        remember: 'mutableStateOf makes a value observable. remember keeps it alive across recompositions. You need both.',
        level: 'beginner',
        terms: [
          { term: 'remember', def: 'Stores a value in the composition so later recompositions get the same object back instead of a new one.' },
          { term: 'mutableStateOf', def: 'Creates an observable State holder; writing its value schedules a recomposition of everything that read it.' },
          { term: 'mutableIntStateOf', def: 'A State holder specialized for Int that avoids boxing the number on every read and write.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the count across recompositions and make writes update the screen.', code: 'var count by [[remember]] { [[mutableIntStateOf|mutableStateOf]](0) }\nButton(onClick = { count++ }) { Text("Count: $count") }', why: '<code>remember</code> keeps the state object alive. The state holder makes <code>count++</code> trigger a recomposition.' },
          { type: 'bug', prompt: 'The switch snaps back every time you flip it. Tap the broken line.', code: '@Composable\nfun Toggle() {\n    var on by mutableStateOf(false)\n    Switch(checked = on, onCheckedChange = { on = it })\n}', bug: 2, fix: '    var on by remember { mutableStateOf(false) }', why: 'Without <code>remember</code>, every recomposition builds a new state set to <code>false</code>.' },
        ],
        quiz: [
          { q: 'What does <code>remember { ... }</code> do?', options: ['Saves the value to disk', 'Runs the block once and returns the stored result on later recompositions', 'Makes the value observable'], a: 1, why: 'It caches the result in the composition. Observability comes from <code>mutableStateOf</code>.' },
          { q: 'You tap +1 on <code>BrokenCounter</code> three times. What does it show?', options: ['Count: 3', 'Count: 1', 'Count: 0'], a: 2, why: 'Each tap triggers a recomposition, which creates a fresh state set to 0.' },
          { q: 'Does a <code>remember</code>ed value survive rotating the phone?', options: ['Yes', 'No, the composition is rebuilt'], a: 1, why: 'Rotation recreates the Activity and its composition. The next lesson fixes that.' },
        ],
        visual(el) {
          let busy = false, addr = 0x4f1a;
          const newAddr = () => '@' + (addr += 0x2c3).toString(16);
          const o = out('Click count++ on each counter.');
          const make = good => {
            const c = { good, n: good ? 3 : 0, id: newAddr() };
            c.slot = h('div', { class: 'slot' }, h('span', { class: 'chip' }, String(c.n)));
            c.obj = h('span', { class: 'cmp-obj' }, `MutableIntState(${c.n}) ${c.id}`);
            c.stack = h('div', { class: 'cmp-stack' }, c.obj);
            c.note = h('span', { class: 'tip' }, good ? 'Lives in slot 0 of the composition.' : 'Not stored anywhere. Made during the run.');
            c.el = h('div', { class: 'cmp-card' },
              h('span', { class: 'cmp-card-title' }, good ? 'Counter()' : 'BrokenCounter()'),
              h('div', { class: 'kt', html: hl(good ? 'var count by remember { mutableIntStateOf(0) }' : 'var count by mutableIntStateOf(0)') }),
              h('div', { class: 'cmp-row' }, h('span', { class: 'cmp-label' }, 'On screen'), c.slot, cmd('count++', () => click(c))),
              h('div', { class: 'cmp-mem' }, h('span', { class: 'cmp-label' }, good ? 'remember slot' : 'state object'), c.stack),
              c.note);
            return c;
          };
          const good = make(true), bad = make(false);
          async function recompose(c) {
            replay(c.el, 'cmp-flash');
            await sleep(380);
            if (c.good) {
              c.obj.classList.remove('cmp-new'); c.obj.classList.add('cmp-reuse'); replay(c.obj, 'pop');
              c.note.textContent = 'remember handed back the same object.';
              if (c.slot.textContent !== String(c.n)) swap(c.slot, String(c.n));
            } else {
              const old = c.obj; old.classList.add('fly-out'); setTimeout(() => old.remove(), 400);
              c.n = 0; c.id = newAddr();
              c.obj = h('span', { class: 'cmp-obj cmp-new drop-in' }, `MutableIntState(0) ${c.id}`);
              c.stack.append(c.obj);
              c.note.textContent = 'A brand-new object, starting at 0.';
              replay(c.slot, 'shake');
            }
            await sleep(450);
          }
          async function click(c) {
            if (busy) return; busy = true;
            c.n++;
            c.obj.textContent = `MutableIntState(${c.n}) ${c.id}`; replay(c.obj, 'pop');
            say(o, `${hl(`count = ${c.n}`)} <span class="muted">// the write schedules a recomposition of ${c.good ? 'Counter' : 'BrokenCounter'}</span>`);
            await sleep(700);
            await recompose(c);
            say(o, c.good
              ? `<span class="good">Counter</span> ran again and remember returned the same object. Count: ${c.n}.`
              : `<span class="bad">BrokenCounter</span> ran again. ${hl('mutableIntStateOf(0)')} made a new object. Count: 0.`);
            busy = false;
          }
          async function both() {
            if (busy) return; busy = true;
            say(o, 'The parent recomposed, so both counters run again.');
            await Promise.all([recompose(good), recompose(bad)]);
            say(o, `Counter kept ${good.n}. BrokenCounter got a new object again, ${bad.id}.`);
            busy = false;
          }
          el.append(h('div', { class: 'cmp-pair' }, good.el, bad.el),
            h('div', { class: 'controls' }, act('Parent recomposes', both)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'saveable',
        title: 'rememberSaveable',
        tagline: 'State that survives rotation and process death.',
        body: `
<p>Rotating the phone is a configuration change. By default Android destroys the Activity and creates a new one, and Compose builds the whole composition again from scratch. Everything held by <code>remember</code> is gone.</p>
<p><code>rememberSaveable</code> works like <code>remember</code>, and it also writes its value into the saved instance state <code>Bundle</code>. The new Activity reads it back. The same Bundle also survives the system killing your app in the background.</p>
<p>A Bundle holds small, simple values: numbers, strings, <code>@Parcelize</code> classes. Use it for UI state like a text field or a selected tab. Keep big data in a ViewModel or a database.</p>`,
        code: `@Composable
fun Counters() {
    var plain by remember { mutableIntStateOf(0) }
    var saved by rememberSaveable { mutableIntStateOf(0) }

    Column {
        Button(onClick = { plain++ }) { Text("remember: $plain") }
        Button(onClick = { saved++ }) { Text("rememberSaveable: $saved") }
    }
}
// After rotation: plain is 0 again, saved keeps its value.
// Custom types need @Parcelize or a Saver.`,
        remember: 'remember lasts while the composition lives. rememberSaveable also survives rotation and process death.',
        level: 'intermediate',
        terms: [
          { term: 'rememberSaveable', def: 'Like remember, but it also saves the value in the saved instance state Bundle so it survives rotation and process death.' },
          { term: 'Saver', def: 'An object that tells rememberSaveable how to turn a custom type into Bundle-friendly values and back.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the search text when the user rotates the phone.', code: 'var query by [[rememberSaveable]] { mutableStateOf("") }\nTextField(value = query, onValueChange = { query = it })', why: '<code>rememberSaveable</code> writes the text into the saved state, so the new Activity gets it back.' },
          { type: 'bug', prompt: 'This crashes when the app goes to the background. Tap the line to fix.', code: 'data class Filter(val tag: String, val minPrice: Int)\n\n@Composable\nfun FilterBar() {\n    var filter by rememberSaveable { mutableStateOf(Filter("all", 0)) }\n    FilterChips(filter, onChange = { filter = it })\n}', bug: 0, fix: '@Parcelize data class Filter(val tag: String, val minPrice: Int) : Parcelable', why: 'A Bundle can’t hold a plain class. Make it <code>@Parcelize</code> and <code>Parcelable</code>, or pass a <code>Saver</code>.' },
        ],
        quiz: [
          { q: 'You rotate the phone. Which value is kept?', options: ['<code>remember</code>', '<code>rememberSaveable</code>', 'Both'], a: 1, why: 'Rotation recreates the Activity. Only the Bundle-backed value comes back.' },
          { q: 'Android kills your app in the background and the user returns to it. What happens to <code>rememberSaveable</code> state?', options: ['It is restored', 'It is lost'], a: 0, why: 'Saved instance state is written to disk by the system and restored with the new process.' },
          { q: 'Where should a list of 500 items from the network live?', options: ['<code>rememberSaveable</code>', 'A ViewModel or a database'], a: 1, why: 'The Bundle has a small size limit. Save an id or a query there, not the data itself.' },
        ],
        visual(el) {
          let plain = 3, saved = 3, land = false, busy = false;
          const pslot = h('div', { class: 'cmp-vslot' }, h('span', { class: 'chip' }, '3'));
          const sslot = h('div', { class: 'cmp-vslot' }, h('span', { class: 'chip' }, '3'));
          const rows = [
            h('div', { class: 'cmp-prow' }, h('span', { class: 'cmp-label' }, 'remember'), pslot),
            h('div', { class: 'cmp-prow' }, h('span', { class: 'cmp-label' }, 'rememberSaveable'), sslot),
          ];
          const phone = h('div', { class: 'phone', role: 'img', 'aria-label': 'Phone with two counters' }, rows);
          const bundleBody = h('div', { class: 'cmp-stack' }, h('span', { class: 'tip' }, 'Empty until the Activity is about to be destroyed.'));
          const bundle = h('div', { class: 'cmp-bundle' }, h('span', { class: 'cmp-bundle-title' }, 'Saved state Bundle'), bundleBody);
          const o = out('Bump the counters, then rotate.');
          const rotateBtn = act('Rotate the device', rotate);
          const bump = which => {
            if (busy) return;
            if (which === 'plain') { plain++; swap(pslot, String(plain)); } else { saved++; swap(sslot, String(saved)); }
            say(o, hl(`${which}++`) + ` <span class="muted">// ${which} = ${which === 'plain' ? plain : saved}</span>`);
          };
          async function rotate() {
            if (busy) return; busy = true;
            say(o, 'Activity is about to be destroyed. rememberSaveable writes its value into the Bundle.');
            bundleBody.replaceChildren(h('span', { class: 'cmp-entry drop-in' }, `saved = ${saved}`));
            await sleep(900);
            rows.forEach(r => r.classList.add('cmp-fade'));
            phone.style.transform = `rotate(${land ? -90 : 90}deg)`;
            await sleep(600);
            phone.style.transition = 'none'; phone.style.transform = '';
            land = !land; phone.classList.toggle('cmp-land', land);
            void phone.offsetWidth; phone.style.transition = '';
            plain = 0;
            pslot.replaceChildren(h('span', { class: 'chip drop-in' }, '0'));
            sslot.replaceChildren(h('span', { class: 'chip' }, '?'));
            rows.forEach(r => r.classList.remove('cmp-fade'));
            say(o, 'New Activity, new composition. remember has nothing to hand back, so plain starts at 0.');
            await sleep(900);
            replay(bundleBody.firstElementChild, 'pop');
            swap(sslot, String(saved));
            say(o, `<span class="good">restored:</span> rememberSaveable found ${hl(`saved = ${saved}`)} in the Bundle.`);
            rotateBtn.textContent = `Rotate back to ${land ? 'portrait' : 'landscape'}`;
            busy = false;
          }
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'cmp-rot-slot' }, phone), bundle),
            h('div', { class: 'controls' }, cmd('plain++', () => bump('plain')), cmd('saved++', () => bump('saved')), rotateBtn),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'hoisting',
        title: 'State hoisting',
        tagline: 'State flows down. Events flow up.',
        body: `
<p>A stateful composable keeps its own state inside. That is easy to call, but nobody else can read or change that state. <em>Hoisting</em> moves the state up to the caller and gives the composable two parameters instead: <code>value</code> to show, and <code>onValueChange</code> to report what the user did.</p>
<p>This gives you <em>unidirectional data flow</em>. State goes down as parameters. Events come up as lambda calls. The owner decides what the new state is. A stateless field does not even change its own text. It asks, and waits for the new value to come back down.</p>
<p>Hoist state to the lowest common parent of everything that reads it. Here both the field and the Sign up button need the email, so it lives in <code>SignupScreen</code>.</p>`,
        code: `@Composable
fun SignupScreen() {
    var email by rememberSaveable { mutableStateOf("") }

    Column {
        EmailField(value = email, onValueChange = { email = it })
        Button(onClick = { /* submit */ }, enabled = "@" in email) {
            Text("Sign up")
        }
    }
}

// Stateless: shows what it gets, reports what the user does.
@Composable
fun EmailField(value: String, onValueChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text("Email") },
    )
}`,
        remember: 'Hoist state to the lowest common parent. Pass value down, pass onValueChange up.',
        level: 'intermediate',
        terms: [
          { term: 'State hoisting', def: 'Moving state out of a composable into its caller and replacing it with a value parameter and an event callback.' },
          { term: 'Stateless composable', def: 'A composable that holds no state of its own and only shows its parameters and reports events.' },
          { term: 'Stateful composable', def: 'A composable that creates and owns its state internally, which makes it easy to call but hard to control from outside.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the signature of a stateless search field.', code: '@Composable\nfun SearchField(query: String, [[onQueryChange]]: (String) -> [[Unit]]) {\n    TextField(value = query, onValueChange = onQueryChange)\n}', why: 'A stateless field takes the value to show and a callback that reports the new text.' },
          { type: 'bug', prompt: 'Typing in the field does nothing. Tap the line that causes it.', code: '@Composable\nfun SignupScreen(vm: SignupViewModel) {\n    val email by vm.email.collectAsStateWithLifecycle()\n    Column {\n        EmailField(value = email, onValueChange = { vm.onEmailChange(email) })\n        Button(onClick = vm::submit, enabled = "@" in email) { Text("Sign up") }\n    }\n}', bug: 4, fix: '        EmailField(value = email, onValueChange = { vm.onEmailChange(it) })', why: 'The event carries the new text in <code>it</code>. Sending the old <code>email</code> back means the state never changes.' },
        ],
        quiz: [
          { q: 'In unidirectional data flow, which way do events travel?', options: ['Down, from parent to child', 'Up, from child to the state owner'], a: 1, why: 'State goes down as parameters. Events go up through callbacks like <code>onValueChange</code>.' },
          { q: 'What makes <code>EmailField(value, onValueChange)</code> stateless?', options: ['It has no parameters', 'It holds no state of its own and shows only what it is given', 'It uses <code>rememberSaveable</code>'], a: 1, why: 'The caller owns the state. The field just renders <code>value</code> and reports changes.' },
          { q: 'The field keeps its text in its own <code>remember</code>. Can the parent clear it?', options: ['Yes, by calling it again', 'No, the parent can’t reach that state'], a: 1, why: 'State inside a composable is private to it. Hoist it if anyone else needs to read or change it.' },
        ],
        visual(el) {
          let hoisted = true, text = 'ada', shown = 'ada', busy = false;
          const toggle = h('input', { type: 'checkbox', id: 'cmp-hoist', checked: true });
          const stateChip = h('span', { class: 'cmp-state' });
          const pvBtn = h('span', { class: 'cmp-pv-btn', 'aria-disabled': 'true' }, 'Sign up');
          const parent = h('div', { class: 'cmp-comp' },
            h('div', { class: 'cmp-comp-head' }, h('span', { class: 'cmp-comp-name' }, 'SignupScreen()'), pvBtn), stateChip);
          const downLane = h('div', { class: 'cmp-lane cmp-down' }, h('span', { class: 'cmp-lane-label' }, 'value'));
          const upLane = h('div', { class: 'cmp-lane cmp-up' }, h('span', { class: 'cmp-lane-label' }, 'onValueChange'));
          const lanes = h('div', { class: 'cmp-lanes' }, downLane, upLane);
          const fieldVal = h('span', {});
          const field = h('div', { class: 'cmp-field' }, h('span', { class: 'cmp-field-label' }, 'Email'), h('span', { class: 'cmp-field-line' }, fieldVal, h('span', { class: 'cmp-caret' })));
          const childSig = h('span', { class: 'cmp-comp-name' });
          const childState = h('span', { class: 'cmp-state' });
          const child = h('div', { class: 'cmp-comp' }, childSig, childState, field);
          const o = out();
          function paint() {
            if (hoisted) {
              stateChip.className = 'cmp-state'; stateChip.textContent = `var email = "${text}"`;
              childSig.textContent = 'EmailField(value, onValueChange)';
              childState.className = 'cmp-state cmp-none'; childState.textContent = 'no state inside';
              lanes.classList.remove('cmp-off');
            } else {
              stateChip.className = 'cmp-state cmp-none'; stateChip.textContent = 'no email state here';
              childSig.textContent = 'EmailField()';
              childState.className = 'cmp-state'; childState.textContent = `var text = "${text}"`;
              lanes.classList.add('cmp-off');
            }
            fieldVal.textContent = shown;
          }
          function paintButton() {
            const on = hoisted && text.includes('@');
            if ((pvBtn.getAttribute('aria-disabled') === 'false') !== on) replay(pvBtn, 'pop');
            pvBtn.setAttribute('aria-disabled', String(!on));
          }
          async function travel(lane, cls, label) {
            const c = h('span', { class: `cmp-travel ${cls}` }, label);
            lane.append(c); await sleep(800); c.remove();
          }
          async function type(s) {
            if (busy) return;
            if (text.length + s.length > 22) { replay(field, 'shake'); say(o, 'The field is full. Clear it first.'); return; }
            busy = true;
            const next = text + s;
            replay(field, 'pop-soft');
            if (hoisted) {
              say(o, `User typed ${hl(JSON.stringify(s))}. The field does not change itself. It calls ${hl(`onValueChange("${next}")`)}.`);
              await travel(upLane, 'cmp-ev cmp-go-up', `onValueChange("${next}")`);
              text = next; paint(); replay(stateChip, 'pop');
              say(o, `${hl(`email = "${next}"`)} <span class="muted">// the owner updates its state</span>`);
              await travel(downLane, 'cmp-go-down', `value = "${next}"`);
              shown = next; paint(); replay(field, 'cmp-flash'); paintButton();
              say(o, `EmailField recomposed with the new value. Sign up reads email too, so it is ${text.includes('@') ? '<span class="good">on</span>' : 'off until there is an @'}.`);
            } else {
              text = next; shown = next; paint(); replay(childState, 'pop'); paintButton();
              say(o, `EmailField changed its own ${hl('text')}. SignupScreen never hears about it, so Sign up stays off.`);
            }
            busy = false;
          }
          async function clear() {
            if (busy) return;
            if (!hoisted) {
              replay(parent, 'shake');
              say(o, `<span class="bad">error:</span> Unresolved reference: email. The text lives inside EmailField, out of the parent’s reach.`);
              return;
            }
            busy = true;
            text = ''; paint(); replay(stateChip, 'pop');
            say(o, `${hl('email = ""')} <span class="muted">// the parent resets its own state</span>`);
            await travel(downLane, 'cmp-go-down', 'value = ""');
            shown = ''; paint(); replay(field, 'cmp-flash'); paintButton();
            say(o, 'The field followed. One source of truth, so nothing can disagree.');
            busy = false;
          }
          toggle.addEventListener('change', () => {
            if (busy) { toggle.checked = hoisted; return; }
            hoisted = toggle.checked; text = 'ada'; shown = 'ada'; paint(); paintButton();
            replay(child, 'pop-soft'); replay(parent, 'pop-soft');
            say(o, hoisted ? 'Hoisted: SignupScreen owns email. Type and watch the round trip.' : 'Stateful: EmailField keeps its own text. Type, then try clearing it from the parent.');
          });
          paint(); paintButton();
          say(o, 'Type into the field. The event goes up, the new value comes down.');
          el.append(
            h('label', { class: 'switch', for: 'cmp-hoist' }, toggle, 'Hoist the state'),
            h('div', { class: 'cmp-flow' }, parent, lanes, child),
            h('div', { class: 'controls' }, act('Type “@”', () => type('@')), act('Type “lab.dev”', () => type('lab.dev')), act('Type “x”', () => type('x')), cmd('email = ""', clear)),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'modifiers',
        title: 'Modifier order',
        tagline: 'Each modifier wraps everything after it.',
        body: `
<p>A <code>Modifier</code> chain reads from the outside in. The first modifier is the outermost layer. Each one wraps all the modifiers that come after it, and the composable’s content sits in the middle.</p>
<p>So order changes the result. <code>.padding(16.dp).background(Purple)</code> leaves a clear ring and then paints inside it. <code>.background(Purple).padding(16.dp)</code> paints first, so the padding is purple too. Put <code>.clickable</code> before the padding and the whole area responds to taps. Put it after and only the inner part does.</p>
<p>Tap a modifier below to move it one step earlier, or pick a preset. Then tap inside the box to see the real touch area.</p>`,
        code: `val Purple = Color(0xFF6C44EC)

// A 96 dp purple square inside a clear 16 dp ring. Only the purple part is tappable.
Box(
    Modifier
        .padding(16.dp)
        .background(Purple)
        .clickable { onClick() }
        .size(96.dp)
)

// A 128 dp purple square. The whole square is tappable.
Box(
    Modifier
        .clickable { onClick() }
        .background(Purple)
        .padding(16.dp)
        .size(96.dp)
)`,
        remember: 'Modifiers apply outside in. The first one wraps everything after it.',
        level: 'beginner',
        terms: [
          { term: 'Modifier', def: 'An ordered chain of decorations like size, padding, background and click handling applied to a composable.' },
          { term: 'Modifier order', def: 'The rule that each modifier wraps all modifiers after it, so changing the order changes layout, drawing and touch area.' },
          { term: 'Touch target', def: 'The area that responds to taps, set by where clickable sits in the chain; Material asks for at least 48 dp.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the whole padded area tappable, not just the text.', code: 'Text(\n    "Retry",\n    Modifier\n        .[[clickable]] { retry() }\n        .[[padding]](12.dp)\n)', why: '<code>clickable</code> comes first, so it wraps the padding and the whole area responds.' },
          { type: 'bug', prompt: 'This should be a purple circle. It draws a purple square. Tap the line in the wrong place.', code: 'Box(\n    Modifier\n        .size(64.dp)\n        .background(Purple)\n        .clip(CircleShape)\n)', bug: 4, fix: '        // move .clip(CircleShape) above .background(Purple)', why: 'A clip only affects what comes after it. The background is already painted as a square when the clip arrives.' },
        ],
        quiz: [
          { q: 'Which chain paints the padding area purple?', options: ['<code>.padding(16.dp).background(Purple)</code>', '<code>.background(Purple).padding(16.dp)</code>'], a: 1, why: 'The background is outside the padding, so it covers the padded area too.' },
          { q: 'Which button has the bigger touch target?', options: ['<code>.clickable { }.padding(12.dp)</code>', '<code>.padding(12.dp).clickable { }</code>'], a: 0, why: 'When clickable comes first, it wraps the padding, so the padding area responds to taps.' },
          { q: 'How big is <code>Modifier.size(96.dp).padding(16.dp)</code>?', options: ['96 × 96 dp', '128 × 128 dp', '64 × 64 dp'], a: 0, why: 'The size is outermost. The padding eats into it and leaves 64 dp for the content.' },
        ],
        visual(el) {
          const MODS = { padding: '.padding(16.dp)', background: '.background(Purple)', clickable: '.clickable { onClick() }', size: '.size(96.dp)' };
          const PRESETS = [
            ['padding().background()', ['padding', 'background', 'clickable', 'size']],
            ['background().padding()', ['background', 'padding', 'clickable', 'size']],
            ['clickable().padding()', ['clickable', 'padding', 'background', 'size']],
            ['size().padding()', ['size', 'padding', 'background', 'clickable']],
          ];
          let order = PRESETS[0][1].slice();
          const chain = h('div', { class: 'cmp-chain' });
          const preview = h('div', { class: 'cmp-preview', onclick: () => { replay(preview, 'shake'); say(o, '<span class="bad">missed:</span> that tap landed outside the clickable area. Nothing ran.'); } });
          const o = out();
          const presetBtns = PRESETS.map(([src, ord]) => cmd(src, () => { order = ord.slice(); render(); }));
          function sizes() {
            let w = 26;
            for (const k of [...order].reverse()) { if (k === 'size') w = 96; if (k === 'padding') w += 32; }
            const total = w, at = {};
            for (const k of order) { at[k] = w; if (k === 'padding') w -= 32; }
            return { total, at };
          }
          function move(i) {
            const k = order.splice(i, 1)[0];
            if (i === 0) order.push(k); else order.splice(i - 1, 0, k);
            render();
          }
          function ripple(ev, layer) {
            ev.stopPropagation();
            const r = layer.getBoundingClientRect();
            layer.append(h('span', { class: 'cmp-ripple', style: `left:${ev.clientX - r.left}px;top:${ev.clientY - r.top}px` }));
            setTimeout(() => layer.querySelector('.cmp-ripple') && layer.querySelector('.cmp-ripple').remove(), 650);
            say(o, `<span class="good">onClick()</span> ran. <span class="muted">The touch area is ${sizes().at.clickable} × ${sizes().at.clickable} dp.</span>`);
          }
          function render() {
            presetBtns.forEach((b, i) => b.setAttribute('aria-pressed', PRESETS[i][1].join() === order.join()));
            chain.replaceChildren(
              h('div', { class: 'cmp-chain-head', html: hl('Box(Modifier') }),
              ...order.map((k, i) => h('button', { class: 'cmd', 'aria-label': `Move ${MODS[k]} ${i ? 'one step earlier' : 'to the end'}`, onclick: () => move(i), html: `<span class="muted">${i ? '↑' : '↓'}</span> ${hl(MODS[k])}` })),
              h('div', { class: 'cmp-chain-head', html: hl(') { Text("Hi") }') }));
            let node = h('div', { class: 'cmp-content' }, 'Hi');
            for (const k of [...order].reverse()) {
              const props = { class: `cmp-layer cmp-l-${k}` };
              if (k === 'padding') props.style = 'padding:16px';
              if (k === 'size') props.style = 'width:96px;height:96px';
              node = h('div', props, node);
              if (k === 'clickable') { const layer = node; layer.addEventListener('click', ev => ripple(ev, layer)); }
            }
            preview.replaceChildren(node); replay(node, 'pop');
            const s = sizes();
            say(o, `Box: ${s.total} × ${s.total} dp <span class="muted">·</span> purple: ${s.at.background} × ${s.at.background} <span class="muted">·</span> touch area: ${s.at.clickable} × ${s.at.clickable}`);
          }
          render();
          el.append(
            h('div', { class: 'controls' }, presetBtns),
            h('div', { class: 'cmp-mod-wrap' }, chain, preview),
            h('div', { class: 'cmp-legend' },
              h('span', {}, h('i', { class: 'lg-bg' }), 'background'),
              h('span', {}, h('i', { class: 'lg-click' }), 'touch area'),
              h('span', {}, h('i', { class: 'lg-pad' }), 'padding edge')),
            h('p', { class: 'tip' }, 'Tap a line in the chain to move it up one step. The first line jumps to the end.'),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'lazy-keys',
        title: 'LazyColumn and keys',
        tagline: 'Tie item state to the item, not its position.',
        body: `
<p><code>LazyColumn</code> composes only the rows that are on screen. Each row is its own little composition, and any <code>remember</code> inside it belongs to that row.</p>
<p>By default Compose identifies a row by its <em>position</em>. Remove the first item and the row at index 0 now shows the second item, but it still holds the first item’s remembered state. Your check mark lands on the wrong thing.</p>
<p>Pass <code>key = { it.id }</code> and Compose tracks rows by a stable id instead. State moves with its item, and <code>Modifier.animateItem()</code> can animate the move. Better still, keep data like <code>checked</code> in your list itself.</p>`,
        code: `data class Grocery(val id: Int, val name: String)

@Composable
fun GroceryList(items: List<Grocery>) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            var checked by rememberSaveable { mutableStateOf(false) }
            ListItem(
                headlineContent = { Text(item.name) },
                leadingContent = {
                    Checkbox(checked = checked, onCheckedChange = { checked = it })
                },
                modifier = Modifier.animateItem(),
            )
        }
    }
}`,
        remember: 'No key: state sticks to the position. key = { it.id }: state sticks to the item.',
        level: 'intermediate',
        terms: [
          { term: 'LazyColumn', def: 'A vertical list that composes only the rows currently on screen and reuses the space as you scroll.' },
          { term: 'Item key', def: 'A stable, unique id passed as key to a lazy list so each row’s state follows its item instead of its position.' },
          { term: 'Modifier.animateItem', def: 'A lazy list item modifier that animates rows appearing, disappearing and moving to a new position.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give each row a stable key so its state follows the todo.', code: 'LazyColumn {\n    items(todos, [[key]] = { it.[[id]] }) { todo ->\n        TodoRow(todo)\n    }\n}', why: 'A unique id that never changes is the right key. Positions shift when items move.' },
          { type: 'bug', prompt: 'Remove the first item and the check mark lands on the wrong row. Tap the line that causes it.', code: 'data class Grocery(val id: Int, val name: String)\n\n@Composable\nfun GroceryList(items: List<Grocery>) {\n    LazyColumn {\n        itemsIndexed(items, key = { index, _ -> index }) { _, item ->\n            var checked by remember { mutableStateOf(false) }\n            GroceryRow(item, checked, onCheckedChange = { checked = it })\n        }\n    }\n}', bug: 5, fix: '        itemsIndexed(items, key = { _, item -> item.id }) { _, item ->', why: 'An index key is the same as no key. State stays at the position. Key by <code>item.id</code>.' },
        ],
        quiz: [
          { q: 'No keys. Row 0 (“Milk”) is checked with <code>remember</code> state. You remove Milk. What is checked now?', options: ['Nothing', 'Eggs, the item that moved into row 0', 'Milk, still on screen'], a: 1, why: 'Row 0 keeps its remembered state and now shows Eggs.' },
          { q: 'Which makes a good key?', options: ['The list index', 'A stable unique id from the data', '<code>Random.nextInt()</code>'], a: 1, why: 'A key must stay the same for the same item and differ between items. Indexes shift; random values change on every run.' },
        ],
        visual(el) {
          const POOL = ['Milk', 'Eggs', 'Bread', 'Apples', 'Coffee', 'Rice', 'Tea', 'Butter', 'Honey'];
          let keyed, items, nextId, truth, slots, rowsById, rowEls, busy = false;
          const toggle = h('input', { type: 'checkbox', id: 'cmp-keys' });
          const head = h('div', { class: 'kt' });
          const list = h('div', { class: 'cmp-lazy', role: 'list', 'aria-label': 'Grocery list' });
          const o = out();
          function makeRow() {
            const r = h('button', { class: 'cmp-item', role: 'listitem' },
              h('span', { class: 'cmp-box', 'aria-hidden': 'true' }), h('span', { class: 'cmp-name' }), h('span', { class: 'cmp-tag' }));
            r.addEventListener('animationend', () => r.classList.remove('drop-in', 'flip', 'pop'));
            r.addEventListener('click', () => tap(r));
            return r;
          }
          function paintRow(r, item, i, checked) {
            r.dataset.name = item.name; r.dataset.id = item.id;
            r.children[1].textContent = item.name;
            r.children[2].textContent = keyed ? `key = ${item.id}` : `index ${i}`;
            r.classList.toggle('cmp-on', checked);
            r.classList.toggle('cmp-wrong', !keyed && checked !== !!truth[item.id]);
            r.setAttribute('aria-pressed', String(checked));
          }
          function tap(r) {
            if (busy) return;
            if (keyed) {
              const i = items.findIndex(x => String(x.id) === r.dataset.id);
              if (i < 0) return;
              truth[items[i].id] = !truth[items[i].id];
              paintRow(r, items[i], i, truth[items[i].id]);
            } else {
              const i = rowEls.indexOf(r);
              if (i < 0) return;
              slots[i] = !slots[i]; truth[items[i].id] = slots[i];
              rowEls.forEach((x, j) => paintRow(x, items[j], j, slots[j]));
            }
            replay(r.children[0], 'pop');
            say(o, `${r.dataset.name} is ${r.classList.contains('cmp-on') ? 'checked' : 'unchecked'}. Now change the list.`);
          }
          function reset() {
            keyed = toggle.checked;
            head.innerHTML = hl(keyed ? 'items(items, key = { it.id }) { item -> ... }' : 'items(items) { item -> ... }');
            items = POOL.slice(0, 4).map((name, i) => ({ id: i + 1, name }));
            nextId = 5; truth = { 1: true }; slots = [true, false, false, false];
            rowsById = new Map(); rowEls = [];
            list.replaceChildren(...items.map((it, i) => {
              const r = makeRow(); paintRow(r, it, i, !!truth[it.id]);
              if (keyed) rowsById.set(it.id, r); else rowEls.push(r);
              return r;
            }));
            say(o, `Milk is checked. Remove it and watch where the check mark goes. <span class="muted">// ${keyed ? 'keyed by id' : 'no key: rows are tracked by index'}</span>`);
          }
          async function keyedUpdate() {
            const alive = new Set(items.map(x => x.id));
            const gone = [...rowsById].filter(([id]) => !alive.has(id));
            if (gone.length) { gone.forEach(([, r]) => r.classList.add('leave')); await sleep(420); }
            const tops = new Map([...rowsById].map(([id, r]) => [id, r.getBoundingClientRect().top]));
            gone.forEach(([id, r]) => { r.remove(); rowsById.delete(id); tops.delete(id); });
            items.forEach((it, i) => {
              let r = rowsById.get(it.id);
              if (!r) { r = makeRow(); r.classList.add('drop-in'); rowsById.set(it.id, r); }
              paintRow(r, it, i, !!truth[it.id]);
            });
            list.replaceChildren(...items.map(it => rowsById.get(it.id)));
            for (const [id, top] of tops) {
              const r = rowsById.get(id), dy = top - r.getBoundingClientRect().top;
              if (!dy) continue;
              r.style.transition = 'none'; r.style.transform = `translateY(${dy}px)`;
            }
            void list.offsetWidth;
            for (const r of rowsById.values()) { r.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)'; r.style.transform = ''; }
            await sleep(480);
          }
          async function slotUpdate() {
            const n = Math.min(rowEls.length, items.length);
            for (let i = 0; i < n; i++) {
              const r = rowEls[i];
              if (r.dataset.name !== items[i].name) {
                setTimeout(() => { replay(r, 'flip'); setTimeout(() => paintRow(r, items[i], i, slots[i]), 200); }, i * 70);
              } else paintRow(r, items[i], i, slots[i]);
            }
            await sleep(n * 70 + 450);
            if (rowEls.length > items.length) {
              const r = rowEls.pop(); slots.pop();
              r.classList.add('leave'); await sleep(420); r.remove();
            }
            while (rowEls.length < items.length) {
              const i = rowEls.length, r = makeRow();
              slots.push(false); rowEls.push(r); r.classList.add('drop-in'); list.append(r);
              paintRow(r, items[i], i, false);
            }
            rowEls.forEach((r, i) => paintRow(r, items[i], i, slots[i]));
          }
          async function op(kind) {
            if (busy) return;
            if (kind === 'remove' && !items.length) { replay(list, 'shake'); say(o, '<span class="bad">IndexOutOfBoundsException:</span> the list is empty. Add an item first.'); return; }
            if (kind === 'add' && items.length >= 6) { replay(list, 'shake'); say(o, 'Six is enough for this demo. Remove one first.'); return; }
            busy = true;
            const src = { remove: 'items.removeAt(0)', add: 'items.add(0, newItem)', reverse: 'items.reverse()' }[kind];
            if (kind === 'remove') items.shift();
            else if (kind === 'add') { items.unshift({ id: nextId, name: POOL[(nextId - 1) % POOL.length] }); nextId++; }
            else items.reverse();
            if (keyed) await keyedUpdate(); else await slotUpdate();
            if (keyed) say(o, `${hl(src)} <span class="muted">→</span> <span class="good">each check mark moved with its item.</span> The key ties state to the id.`);
            else {
              const wrong = items.filter((it, i) => slots[i] !== !!truth[it.id]).map(it => it.name);
              say(o, `${hl(src)} <span class="muted">→</span> ${wrong.length
                ? `<span class="bad">state on the wrong item:</span> ${esc(wrong.join(', '))}. The remembered check stayed at its index.`
                : 'No mix-up this time, but the state still belongs to the index, not the item.'}`);
            }
            busy = false;
          }
          toggle.addEventListener('change', () => { if (busy) { toggle.checked = keyed; return; } reset(); });
          reset();
          el.append(
            h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-keys' }, toggle, 'key = { it.id }'), head),
            list,
            h('div', { class: 'controls' }, cmd('items.removeAt(0)', () => op('remove')), cmd('items.add(0, newItem)', () => op('add')), cmd('items.reverse()', () => op('reverse'))),
            h('p', { class: 'tip' }, 'Tap a row to check it. Red rows show a check that belongs to a different item.'),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'effects',
        title: 'Side effects: LaunchedEffect',
        tagline: 'Run a coroutine that follows a key.',
        body: `
<p>A composable can run at any time and many times, so it must not start work directly in its body. To run suspend code tied to the screen, use <code>LaunchedEffect(key) { ... }</code>.</p>
<p>When the effect enters the composition, it launches a coroutine. If a key changes, Compose <em>cancels</em> that coroutine and launches a new one with the new key. A recomposition with the same key leaves it alone. When the composable leaves the screen, the coroutine is cancelled.</p>
<p><code>LaunchedEffect</code> is a composable, so you can’t call it from an <code>onClick</code>. For work started by an event, get a scope with <code>rememberCoroutineScope()</code> and call <code>scope.launch</code>. Its jobs live until the composable leaves.</p>`,
        code: `@Composable
fun ProfileScreen(userId: Int, repo: UserRepository) {
    var user by remember { mutableStateOf<User?>(null) }
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    // Restarts whenever userId changes. The old load is cancelled.
    LaunchedEffect(userId) {
        user = null
        user = repo.loadUser(userId)
    }

    Column {
        Text(user?.name ?: "Loading…")
        Button(onClick = {
            scope.launch { snackbar.showSnackbar("Saved") }
        }) { Text("Save") }
    }
}`,
        remember: 'LaunchedEffect(key) cancels and relaunches when the key changes. Use rememberCoroutineScope for clicks.',
        level: 'intermediate',
        terms: [
          { term: 'LaunchedEffect', def: 'A composable that launches a coroutine when it enters the composition and cancels and relaunches it when a key changes.' },
          { term: 'rememberCoroutineScope', def: 'Returns a CoroutineScope tied to the composition, for launching coroutines from event handlers like onClick.' },
          { term: 'Side effect', def: 'Work that reaches outside a composable, like loading data or showing a snackbar, which must not run directly in the composable body.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Rerun the search when the query changes, and scroll to the top on a tap.', code: 'LaunchedEffect([[query]]) {\n    results = repo.search(query)\n}\nval scope = [[rememberCoroutineScope]]()\nButton(onClick = { scope.launch { listState.animateScrollToItem(0) } }) {\n    Text("Top")\n}', why: 'The key restarts the effect on a new query. A click needs a scope, since <code>LaunchedEffect</code> can’t run in <code>onClick</code>.' },
          { type: 'bug', prompt: 'Open user 1, then user 2. The screen still shows user 1. Tap the bug.', code: '@Composable\nfun ProfileScreen(userId: Int, repo: UserRepository) {\n    var user by remember { mutableStateOf<User?>(null) }\n    LaunchedEffect(Unit) {\n        user = repo.loadUser(userId)\n    }\n    Text(user?.name ?: "Loading…")\n}', bug: 3, fix: '    LaunchedEffect(userId) {', why: 'With <code>Unit</code> as the key, the effect never restarts. Key it on <code>userId</code> so a new id loads again.' },
        ],
        quiz: [
          { q: '<code>LaunchedEffect(userId)</code> is loading user 1 when <code>userId</code> becomes 2. What happens?', options: ['Both loads keep running', 'The load for 1 is cancelled and a load for 2 starts', 'Nothing until the first load ends'], a: 1, why: 'A new key cancels the old coroutine and launches a fresh one.' },
          { q: 'The screen recomposes but <code>userId</code> stays the same. Does the effect restart?', options: ['Yes', 'No'], a: 1, why: 'Only a key change restarts it. Recomposition alone does not.' },
          { q: 'You want to start a coroutine when a button is tapped. What do you use?', options: ['<code>LaunchedEffect</code> inside <code>onClick</code>', '<code>rememberCoroutineScope()</code> and <code>scope.launch</code>'], a: 1, why: '<code>onClick</code> is not a composable context, so <code>LaunchedEffect</code> can’t be called there.' },
        ],
        visual(el) {
          const NAMES = { 1: 'Ada', 2: 'Grace', 3: 'Linus' };
          const LOAD_MS = 2600, SAVE_MS = 1500;
          let userId = 1, onScreen = true, jobN = 0, effect = null, scopeJobs = [];
          const effLane = h('div', { class: 'cmp-jobs' }), scopeLane = h('div', { class: 'cmp-jobs' });
          const title = h('span', { class: 'cmp-screen-title' }), sub = h('span', { class: 'tip' });
          const screen = h('div', { class: 'cmp-screen' }, h('span', { class: 'cmp-status' }, 'ProfileScreen'), title, sub);
          const o = out();
          const idBtns = [1, 2, 3].map(id => cmd(`userId = ${id}`, () => setUser(id)));
          const leaveBtn = act('Leave the screen', toggleScreen);
          const paintIds = () => idBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i + 1 === userId)));
          function job(lane, label, ms, onDone) {
            const fill = h('span', { class: 'cmp-job-fill' });
            const state = h('span', { class: 'cmp-job-state' }, 'running');
            const chip = h('span', { class: 'cmp-job drop-in' }, fill, h('span', { class: 'cmp-job-label' }, `#${++jobN} ${label}`), state);
            lane.append(chip);
            while (lane.children.length > 4) lane.firstElementChild.remove();
            requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = `width ${ms}ms linear`; fill.style.width = '100%'; }));
            const j = { n: jobN, live: true };
            j.timer = setTimeout(() => {
              if (!j.live || !screen.isConnected) return;
              j.live = false; chip.classList.add('cmp-done'); state.textContent = 'done'; replay(chip, 'pop'); onDone();
            }, ms);
            j.cancel = () => {
              if (!j.live) return false;
              j.live = false; clearTimeout(j.timer);
              const w = getComputedStyle(fill).width;
              fill.style.transition = 'none'; fill.style.width = w;
              chip.classList.add('cmp-cancel'); state.textContent = 'cancelled'; replay(chip, 'shake');
              return true;
            };
            return j;
          }
          function startEffect() {
            const id = userId;
            title.textContent = 'Loading…'; sub.textContent = `userId = ${id}`; replay(screen, 'pop-soft');
            effect = job(effLane, `loadUser(${id})`, LOAD_MS, () => {
              title.textContent = NAMES[id]; replay(screen, 'cmp-flash');
              say(o, `<span class="good">done:</span> ${hl(`user = User("${NAMES[id]}")`)} <span class="muted">// coroutine #${effect.n} finished</span>`);
            });
            return effect;
          }
          function setUser(id) {
            if (!onScreen) { replay(screen, 'shake'); say(o, 'ProfileScreen is not in the composition. Come back to the screen first.'); return; }
            if (id === userId) {
              replay(screen, 'cmp-flash');
              say(o, `${hl(`userId = ${id}`)} <span class="muted">// same key: ProfileScreen recomposed, the effect was left alone</span>`);
              return;
            }
            const old = effect, cancelled = old && old.cancel();
            const from = userId; userId = id; paintIds();
            const j = startEffect();
            say(o, `Key changed ${from} → ${id}. ${cancelled ? `<span class="bad">Cancelled #${old.n}</span>, then launched` : 'Launched'} <span class="good">#${j.n}</span>.`);
          }
          function recompose() {
            if (!onScreen) { replay(screen, 'shake'); say(o, 'Nothing to recompose. ProfileScreen is not on screen.'); return; }
            replay(screen, 'cmp-flash');
            say(o, `${hl('count++')} <span class="muted">// ProfileScreen recomposed. userId is still ${userId}, so the effect keeps going.</span>`);
          }
          function save() {
            if (!onScreen) { replay(screen, 'shake'); say(o, 'The button is gone with the screen. Nothing to tap.'); return; }
            const j = job(scopeLane, 'showSnackbar("Saved")', SAVE_MS, () => {
              scopeJobs = scopeJobs.filter(x => x !== j);
              say(o, `<span class="good">done:</span> snackbar shown <span class="muted">// coroutine #${j.n} from rememberCoroutineScope</span>`);
            });
            scopeJobs.push(j);
            say(o, `${hl('scope.launch { snackbar.showSnackbar("Saved") }')} <span class="muted">// started by a click. A key change won’t cancel it.</span>`);
          }
          function toggleScreen() {
            if (onScreen) {
              onScreen = false;
              const c = [effect, ...scopeJobs].filter(j => j && j.cancel()).map(j => '#' + j.n);
              scopeJobs = [];
              screen.classList.add('cmp-gone'); title.textContent = 'Left the screen'; sub.textContent = 'not in the composition';
              leaveBtn.textContent = 'Come back';
              say(o, `ProfileScreen left the composition. ${c.length ? `<span class="bad">Cancelled ${c.join(', ')}</span>.` : 'No coroutines were running.'} <span class="muted">Every effect and scope job dies with it.</span>`);
            } else {
              onScreen = true;
              screen.classList.remove('cmp-gone');
              leaveBtn.textContent = 'Leave the screen';
              const j = startEffect();
              say(o, `Back in the composition. LaunchedEffect starts fresh: <span class="good">#${j.n}</span>.`);
            }
          }
          paintIds();
          const first = startEffect();
          say(o, `LaunchedEffect(1) launched <span class="good">#${first.n}</span>. Change userId before it finishes.`);
          el.append(
            h('div', { class: 'cmp-split' },
              h('div', { class: 'cmp-fx' },
                h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'LaunchedEffect(userId)'), effLane),
                h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'scope.launch'), scopeLane)),
              screen),
            h('div', { class: 'controls' }, idBtns, cmd('count++', recompose)),
            h('div', { class: 'controls' }, cmd('onClick = { scope.launch { ... } }', save), leaveBtn),
            o);
        },
      },
    ],
  });
})();
