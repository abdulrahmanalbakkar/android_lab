/* Views and Compose interop track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed vw-. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const stat = (label, value) => {
    const b = h('b', {}, String(value));
    const s = h('span', { class: 'vw-stat' }, label + ' ', b);
    s.set = v => { b.textContent = String(v); replay(b, 'pop'); };
    return s;
  };
  const toggle = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked, onchange });
    return { input, el: h('label', { class: 'switch', for: id }, input, h('span', { html: label })) };
  };

  const css = `
.vw-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 14px; align-items: start; min-width: 0; }
.vw-col { display: grid; gap: 10px; align-content: start; min-width: 0; }
.vw-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.vw-stats { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.vw-stat { font: 600 0.78rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--ink); font-variant-numeric: tabular-nums; }
.vw-stat b { display: inline-block; color: var(--accent); }
.vw-stat.vw-bad b { color: var(--err); }

/* phone-like screen with absolutely placed views */
.vw-screen { position: relative; width: 210px; max-width: 100%; height: 250px; border-radius: 24px; border: 8px solid var(--code-bg); background: var(--surface); overflow: hidden; justify-self: center; }
.vw-root { position: absolute; inset: 6px; border: 1.5px dashed var(--line); border-radius: 12px; }
.vw-v { position: absolute; top: 16px; left: 14px; max-width: calc(100% - 28px); font: 700 0.95rem var(--body); color: var(--ink); transition: top 0.45s cubic-bezier(0.2, 1.3, 0.4, 1), left 0.45s cubic-bezier(0.2, 1.3, 0.4, 1); }
.vw-v.vw-btn { top: 56px; padding: 6px 14px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-size: 0.85rem; }
.vw-v.vw-loose { top: 0; left: 0; outline: 2px dashed var(--err); outline-offset: 1px; }
.vw-idtag { display: block; font: 500 0.66rem var(--mono); color: var(--muted); }
.vw-v.vw-btn .vw-idtag { color: inherit; opacity: 0.75; }

/* measure, layout, draw */
.vw-phases { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.vw-phase { font: 600 0.8rem var(--mono); padding: 6px 12px; border-radius: 999px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.2s, border-color 0.2s, color 0.2s; }
.vw-phase.on { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); }
.vw-tree { display: grid; gap: 6px; min-width: 0; }
.vw-node { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 2px 10px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 500 0.84rem var(--mono); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.vw-node.vw-kid { margin-left: 18px; }
.vw-node.on { border-color: var(--accent); background: var(--accent-soft); }
.vw-note { color: var(--muted); font-size: 0.76rem; overflow-wrap: anywhere; }
.vw-prev { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); min-width: 0; }
.vw-prev b { font: 700 1rem var(--display); }
.vw-badge { display: inline-grid; place-items: center; height: 30px; padding: 0 10px; border-radius: 999px; font: 700 0.9rem var(--mono); color: var(--surface); transition: background 0.3s; }
.vw-badge.c0 { background: var(--err); } .vw-badge.c1 { background: var(--ok); } .vw-badge.c2 { background: var(--warm); }

/* RecyclerView */
.vw-rv { display: flex; flex-direction: column; gap: 6px; height: 268px; padding: 10px; border-radius: 14px; background: var(--bg); border: 2px solid var(--ink); overflow: hidden; min-width: 0; }
.vw-row { flex: none; display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; border-radius: 10px; background: var(--surface); border: 2px solid var(--line); min-width: 0; font-size: 0.92rem; transition: border-color 0.3s, background 0.3s; }
.vw-row > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vw-pos { margin-left: auto; flex: none; color: var(--muted); font: 500 0.74rem var(--mono); }
.vw-vh { flex: none; font: 600 0.72rem var(--mono); padding: 2px 7px; border-radius: 6px; border: 2px solid var(--ink); background: var(--sunk); color: var(--ink); }
.vw-vh.c0 { border-color: var(--accent); background: var(--accent-soft); }
.vw-vh.c1 { border-color: var(--warm); background: var(--warm-soft); }
.vw-vh.c2 { border-color: var(--ok); background: var(--ok-soft); }
.vw-vh.c3 { border-color: var(--err); background: var(--err-soft); }
.vw-vh.c4 { border-color: var(--ink); background: var(--sunk); }
.vw-vh.c5 { border-color: var(--muted); background: var(--surface); }
.vw-pool { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 44px; padding: 10px; border-radius: 12px; border: 2px dashed var(--line); min-width: 0; }

/* DiffUtil */
.vw-list { display: grid; gap: 6px; min-width: 0; }
.vw-list .vw-row { height: 40px; }
.vw-row.vw-ins { border-color: var(--accent); background: var(--accent-soft); }
.vw-row.vw-chg { border-color: var(--warm); background: var(--warm-soft); }
.vw-row.vw-mov { border-color: var(--ok); background: var(--ok-soft); }
.vw-row.vw-all { border-color: var(--warm); animation: pop-soft 0.6s ease-out; }
.vw-tag { flex: none; font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 7px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.vw-tag.vw-star { background: var(--warm-soft); color: var(--warm); }

/* Fragments */
.vw-stack { display: grid; gap: 8px; min-width: 0; }
.vw-frag { display: grid; gap: 6px; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.vw-frag.vw-top { border-color: var(--accent); }
.vw-frag-name { font: 700 0.9rem var(--mono); }
.vw-st { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 8px; font: 500 0.8rem var(--mono); }
.vw-s { padding: 1px 8px; border-radius: 999px; font-weight: 600; background: var(--ok-soft); color: var(--ok); }
.vw-s.vw-mid { background: var(--warm-soft); color: var(--warm); }
.vw-s.vw-dead { background: var(--err-soft); color: var(--err); }
.vw-log { display: grid; gap: 1px; align-content: start; font: 500 0.8rem/1.55 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 10px 12px; min-height: 10.5em; overflow-x: auto; min-width: 0; }
.vw-log div { white-space: pre; }

/* ComposeView */
.vw-bar { position: absolute; left: 0; right: 0; top: 0; height: 44px; display: flex; align-items: center; padding: 0 12px; background: var(--sunk); font: 700 0.85rem var(--body); }
.vw-bar small { margin-left: auto; font: 500 0.66rem var(--mono); color: var(--muted); }
.vw-cv { position: absolute; left: 10px; right: 10px; top: 56px; bottom: 10px; display: grid; place-items: center; align-content: center; gap: 8px; padding: 8px; border: 2px dashed var(--accent); border-radius: 12px; text-align: center; transition: opacity 0.3s, border-color 0.3s; }
.vw-cv.vw-off { opacity: 0.4; border-color: var(--muted); }
.vw-cv-name { font: 600 0.66rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.vw-cv.vw-off .vw-cv-name { color: var(--muted); }
.vw-count { font: 800 2rem var(--display); }
.vw-strats { display: grid; gap: 6px; min-width: 0; }
.vw-strats .cmd { text-align: left; min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.vw-strats { grid-template-columns: minmax(0, 1fr); }
.vw-screens { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.vw-scr { display: grid; gap: 1px; padding: 6px 12px; border-radius: 10px; border: 2px solid var(--warm); background: var(--warm-soft); font: 700 0.85rem var(--body); }
.vw-scr small { font: 600 0.66rem var(--mono); color: var(--warm); text-transform: uppercase; letter-spacing: 0.06em; }
.vw-scr.vw-done { border-color: var(--accent); background: var(--accent-soft); }
.vw-scr.vw-done small { color: var(--accent); }

/* AndroidView */
.vw-card { display: grid; gap: 8px; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); min-width: 0; transition: border-color 0.3s, opacity 0.3s; }
.vw-card.vw-stale { border-color: var(--err); }
.vw-card.vw-gone { opacity: 0.4; border-style: dashed; }
.vw-card-title { font: 700 0.88rem var(--mono); overflow-wrap: anywhere; }
.vw-gauge { height: 14px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.vw-gauge span { display: block; height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.45s ease-out; }
.vw-card.vw-stale .vw-gauge span { background: var(--err); }
.vw-big { font: 800 1.6rem var(--display); font-variant-numeric: tabular-nums; }

/* depth: shell-level fix so long code scrolls inside step and hood grids (harmless if duplicated) */

/* depth: RecyclerView */
.vw-row.vw-hdr { height: 30px; background: var(--sunk); border-style: dashed; font: 700 0.8rem var(--mono); }
.vw-pools { display: grid; gap: 8px; min-width: 0; }
.vw-pools .vw-pool { min-height: 40px; padding: 8px; }
.vw-ent { display: inline-flex; gap: 4px; align-items: center; font: 500 0.7rem var(--mono); color: var(--muted); }

/* depth: Fragments */
.vw-objs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.vw-objs .obj { min-width: 0; padding: 10px; font-size: 0.78rem; overflow-wrap: anywhere; transition: border-color 0.25s; }
.vw-objs .vw-tag { justify-self: start; }
.vw-objs .obj.vw-new { border-color: var(--warm); }
.vw-objs .obj.vw-kept { border-color: var(--ok); }
.vw-tag.vw-tnew { background: var(--warm-soft); color: var(--warm); }
.vw-tag.vw-tkept { background: var(--ok-soft); color: var(--ok); }
.vw-stores { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 8px; min-width: 0; }
.vw-store { display: grid; gap: 6px; align-content: start; min-height: 96px; padding: 10px; border-radius: 12px; border: 2px dashed var(--line); background: var(--bg); min-width: 0; }
.vw-store .obj { min-width: 0; padding: 8px 10px; font-size: 0.78rem; overflow-wrap: anywhere; }
/* depth 2: XML layouts */
.vw-node.vw-d2x-kid2 { margin-left: 36px; }
.vw-d2x-scr { transition: width 0.4s ease; }
.vw-d2x-scr.vw-d2x-tab { width: 300px; }
.vw-d2x-panes { position: absolute; inset: 8px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.vw-d2x-panes.vw-d2x-two { grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); }
.vw-d2x-pane { display: grid; align-content: start; gap: 6px; padding: 8px; border: 2px dashed var(--line); border-radius: 10px; min-width: 0; overflow: hidden; }
.vw-d2x-detail { align-content: center; justify-items: center; border-color: var(--accent); text-align: center; }
.vw-d2x-item { font: 600 0.8rem var(--body); padding: 6px 8px; border-radius: 8px; background: var(--sunk); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* depth 2: measure, layout, draw */
.vw-d2p-track { position: relative; display: grid; gap: 6px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; overflow: hidden; }
.vw-d2p-parent { height: 26px; display: flex; align-items: center; padding: 0 8px; border: 2px solid var(--ink); border-radius: 8px; transition: width 0.4s ease; min-width: 0; overflow: hidden; white-space: nowrap; }
.vw-d2p-parent.vw-d2p-open { border-style: dashed; border-right-color: transparent; }
.vw-d2p-child { height: 30px; display: flex; align-items: center; padding: 0 8px; border-radius: 8px; background: var(--accent-soft); border: 2px solid var(--accent); transition: width 0.45s cubic-bezier(0.2, 1.2, 0.4, 1); min-width: 36px; }
.vw-d2p-child.vw-d2p-over { background: var(--warm-soft); border-color: var(--warm); }
.vw-d2p-txt { font: 700 0.8rem var(--mono); }
.vw-d2p-nest { display: grid; min-width: 0; }
.vw-d2p-lvl { display: grid; gap: 6px; padding: 8px; border: 2px solid var(--line); border-radius: 10px; background: var(--surface); min-width: 0; }
.vw-d2p-lvl .vw-d2p-lvl { background: var(--bg); }
.vw-d2p-leaf { justify-self: start; font: 600 0.8rem var(--mono); padding: 6px 12px; border-radius: 8px; border: 2px solid var(--ink); background: var(--sunk); transition: background 0.15s, border-color 0.15s; }
.vw-d2p-leaf.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }

/* depth 2: DiffUtil */
.vw-d2d-rv { height: 206px; }
.vw-d2d-above { font: 500 0.74rem var(--mono); color: var(--muted); padding: 4px 8px; border-radius: 8px; background: var(--sunk); overflow-wrap: anywhere; }
.vw-d2d-above.vw-d2d-hid { color: var(--err); background: var(--err-soft); }
.vw-d2d-lanes { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 10px; align-items: center; }
.vw-d2d-lane { position: relative; height: 16px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.vw-d2d-lane i { position: absolute; top: 0; bottom: 0; left: 0; width: 0; border-radius: 99px; background: var(--accent); transition: width 0.35s ease, left 0.35s ease; }
.vw-d2d-lane i.vw-d2d-run { background: var(--warm); animation: pulse 0.8s ease-in-out infinite; }
.vw-row.vw-d2d-stale { border-color: var(--err); }

/* depth 2: ComposeView */
.vw-pos.vw-d2c-dead { color: var(--err); }
.vw-d2c-scr { height: 236px; }
.vw-d2c-stack { position: absolute; inset: 8px; display: grid; grid-template-rows: 1fr 1fr; gap: 8px; }
.vw-d2c-cv { display: grid; place-items: center; align-content: center; gap: 2px; border: 2px dashed var(--accent); border-radius: 12px; min-width: 0; text-align: center; }
.vw-count.vw-d2c-num { font-size: 1.6rem; }

/* depth 2: AndroidView */
.vw-d2a-spark { margin-left: auto; flex: none; display: flex; align-items: flex-end; gap: 3px; height: 24px; }
.vw-d2a-spark i { display: block; width: 6px; border-radius: 2px; background: var(--accent); }
/* promoted: ViewPager2 */
.vw-vp-view { width: 100%; max-width: 240px; height: 130px; justify-self: center; overflow: hidden; border-radius: 16px; border: 6px solid var(--code-bg); background: var(--surface); }
.vw-vp-strip { display: flex; height: 100%; transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.vw-vp-page { flex: 0 0 100%; display: grid; place-content: center; gap: 4px; text-align: center; font: 500 0.78rem var(--mono); color: var(--muted); }
.vw-vp-page b { font: 800 1.2rem var(--display); color: var(--ink); }
.vw-vp-chips { display: grid; gap: 4px; min-width: 0; }
.vw-vp-chip { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 10px; padding: 5px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font: 600 0.76rem var(--mono); min-width: 0; }
.vw-vp-name { color: var(--ink); }
.vw-vp-st { color: var(--muted); }
.vw-vp-chip.vw-vp-resumed { border-color: var(--ok); background: var(--ok-soft); }
.vw-vp-chip.vw-vp-resumed .vw-vp-st { color: var(--ok); }
.vw-vp-chip.vw-vp-started { border-color: var(--accent); }
.vw-vp-chip.vw-vp-started .vw-vp-st { color: var(--accent); }
.vw-vp-chip.vw-vp-none, .vw-vp-chip.vw-vp-saved { opacity: 0.6; }
.vw-vp-log { display: grid; gap: 4px; min-height: 1.6em; min-width: 0; }
.vw-vp-ev { padding: 4px 10px; border-radius: 8px; background: var(--sunk); font: 600 0.76rem var(--mono); overflow-wrap: anywhere; }
.vw-vp-ev.vw-vp-wrong { background: var(--err-soft); }
`;

  // ─── Depth pass 2: xml, passes, diff, compose-in-views, android-view ─────────────────
  const xmlDepth = {
    deeper: [
      {
        title: 'include and ViewStub',
        body: `<p><code>&lt;include&gt;</code> reuses a layout file inside another one. Give the include an id and the binding gets a nested binding for it, so <code>binding.header.title</code> is typed all the way down.</p>
<p>A <code>ViewStub</code> is an invisible, zero-size placeholder. Its layout is inflated only when you call <code>inflate()</code>, so a rarely shown error panel costs nothing until it is needed. After that the stub is gone from the tree, and calling <code>inflate()</code> again throws.</p>`,
        code: `// activity_inbox.xml:
//   <include android:id="@+id/header" layout="@layout/toolbar_header" />
//   <ViewStub android:id="@+id/errorStub" android:layout="@layout/panel_error" ... />

binding.header.title.text = "Inbox"            // nested binding: ToolbarHeaderBinding

fun showError(message: String) {
    val panel = PanelErrorBinding.bind(binding.errorStub.inflate())   // inflate once
    panel.message.text = message
}`,
        visual(el) {
          const XML = ['<LinearLayout ...>', '  <include android:id="@+id/header"', '      layout="@layout/toolbar_header" />', '  <RecyclerView android:id="@+id/list" />', '  <ViewStub android:id="@+id/errorStub"', '      android:layout="@layout/panel_error" />', '</LinearLayout>'];
          const lines = XML.map(t => h('div', { class: 'branch' }, t));
          const mk = (name, kid, note) => {
            const n = h('span', { class: 'vw-note' }, note || '');
            const e = h('div', { class: 'vw-node' + (kid ? ' vw-kid' : '') + (kid === 2 ? ' vw-d2x-kid2' : '') }, h('span', {}, name), n);
            return { e, n };
          };
          const tree = h('div', { class: 'vw-tree' });
          const sViews = stat('View objects', 0);
          const o = out();
          let views = 0, stub = 'stub', busy = false, nodes = {};
          function build() {
            nodes = {
              root: mk('LinearLayout', 0, 'binding.root'),
              header: mk('ConstraintLayout', 1, 'binding.header.root'),
              title: mk('TextView title', 2, 'binding.header.title'),
              list: mk('RecyclerView', 1, 'binding.list'),
              stub: mk('ViewStub', 1, 'binding.errorStub, 0 × 0'),
            };
            tree.replaceChildren(...['root', 'header', 'title', 'list', 'stub'].map(k => nodes[k].e));
            views = 5; stub = 'stub'; sViews.set(views);
          }
          build();
          say(o, 'Inflated. The error panel is still a stub. Try the nested binding, then inflate the stub.');
          async function inflate() {
            if (busy) return; busy = true;
            tree.replaceChildren();
            const order = ['root', 'header', 'title', 'list', 'stub'];
            build(); tree.replaceChildren();
            const at = [0, 1, 1, 3, 4];
            for (let i = 0; i < order.length; i++) {
              lines[at[i]].classList.add('scan');
              const n = nodes[order[i]].e; n.classList.add('drop-in'); tree.append(n);
              await sleep(300);
              lines[at[i]].classList.remove('scan');
              if (!el.isConnected) return;
            }
            say(o, '<span class="good">inflated:</span> 5 Views. The include brought its own ConstraintLayout and TextView. The stub is one empty View.');
            busy = false;
          }
          function nested() {
            if (busy) return;
            const t = nodes.title; t.n.textContent = 'text = "Inbox"'; t.e.classList.add('on'); replay(t.e, 'pop');
            setTimeout(() => t.e.classList.remove('on'), 700);
            say(o, '<span class="good">ok:</span> binding.header is a ToolbarHeaderBinding, so binding.header.title is a TextView. No lookup, no cast.');
          }
          async function inflateStub() {
            if (busy) return;
            if (stub === 'gone') {
              replay(tree, 'shake');
              say(o, '<span class="bad">crash:</span> IllegalStateException: ViewStub must have a non-null ViewGroup viewParent <span class="muted">// the stub already replaced itself</span>');
              return;
            }
            busy = true;
            const s = nodes.stub; s.e.classList.add('leave');
            await sleep(380); if (!el.isConnected) return;
            const panel = [mk('LinearLayout panel', 1, 'replaced the stub'), mk('TextView message', 2), mk('Button retry', 2)];
            s.e.replaceWith(...panel.map(p => { p.e.classList.add('drop-in'); return p.e; }));
            views += 2; sViews.set(views); stub = 'gone';
            say(o, '<span class="good">stub inflated:</span> panel_error.xml added 3 Views in the stub’s place. The stub itself left the tree.');
            busy = false;
          }
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'activity_inbox.xml'), h('div', { class: 'when' }, lines)),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'View tree'), tree)),
            h('div', { class: 'controls' },
              cmd('ActivityInboxBinding.inflate(layoutInflater)', inflate),
              cmd('binding.header.title.text = "Inbox"', nested),
              cmd('binding.errorStub.inflate()', inflateStub)),
            h('div', { class: 'vw-stats' }, sViews),
            o);
        },
      },
      {
        title: 'Alternative layouts make binding fields nullable',
        body: `<p>You can ship more than one version of a layout. On a device whose smallest width is at least 600dp, Android picks <code>layout-sw600dp/activity_main.xml</code> over <code>layout/activity_main.xml</code>. View binding still generates one class for both files.</p>
<p>A view that exists in only some versions becomes nullable in that class. On a tablet <code>binding.detail</code> is a pane. On a phone it is null. The compiler makes you handle both.</p>`,
        code: `// layout/activity_main.xml          : list only
// layout-sw600dp/activity_main.xml   : list + @+id/detail
val twoPane = binding.detail != null      // FrameLayout?

fun open(id: Long) {
    if (twoPane) showInPane(id) else startActivity(DetailActivity.intent(this, id))
}`,
        visual(el) {
          let tablet = false, opened = 0;
          const items = ['Ada', 'Grace', 'Linus'];
          const file = h('div', { class: 'kt' });
          const typeLine = h('div', { class: 'kt' });
          const listPane = h('div', { class: 'vw-d2x-pane' });
          const detailPane = h('div', { class: 'vw-d2x-pane vw-d2x-detail' }, h('span', { class: 'vw-note' }, 'detail pane'));
          const panes = h('div', { class: 'vw-d2x-panes' }, listPane, detailPane);
          const screen = h('div', { class: 'vw-screen vw-d2x-scr' }, panes);
          const o = out();
          listPane.append(...items.map((n, i) => h('span', { class: 'vw-d2x-item' }, n)));
          const paint = () => {
            screen.classList.toggle('vw-d2x-tab', tablet);
            detailPane.hidden = !tablet;
            panes.classList.toggle('vw-d2x-two', tablet);
            file.innerHTML = hl(tablet ? '// picked: res/layout-sw600dp/activity_main.xml' : '// picked: res/layout/activity_main.xml');
            typeLine.innerHTML = hl(`binding.detail: FrameLayout?  // ${tablet ? 'a pane' : 'null'}`);
          };
          const sw = toggle('vw-d2x-sw600', 'Smallest width ≥ 600dp (tablet)', false, () => {
            tablet = sw.input.checked; paint(); replay(screen, 'flip');
            say(o, tablet ? 'Tablet: the sw600dp file wins, so detail exists.' : 'Phone: the default file has no detail view, so the field is null.');
          });
          paint();
          say(o, 'A phone. Open a contact both ways, then switch to a tablet.');
          el.append(
            h('div', { class: 'vw-split' }, screen, h('div', { class: 'vw-col' }, file, typeLine, sw.el)),
            h('div', { class: 'controls' },
              cmd('binding.detail?.let { show(it) }', () => {
                const name = items[opened++ % items.length];
                if (tablet) { detailPane.replaceChildren(h('b', {}, name), h('span', { class: 'vw-note' }, 'shown in the pane')); replay(detailPane, 'pop-soft'); say(o, `<span class="good">two panes:</span> ${name} opened next to the list.`); }
                else { replay(listPane, 'pop-soft'); say(o, `<span class="good">safe:</span> detail is null on a phone, so the block is skipped. Start a DetailActivity instead.`); }
              }),
              cmd('binding.detail!!.show()', () => {
                if (tablet) { replay(detailPane, 'pop'); say(o, '<span class="muted">works here:</span> but the same code ships to phones.'); return; }
                replay(screen, 'shake'); say(o, '<span class="bad">crash on phones:</span> NullPointerException. The field was nullable for a reason.');
              })),
            o);
        },
      },
    ],
    underHood: {
      body: `<p>For each layout the build generates a Java class under <code>build/generated</code>. Its <code>inflate</code> calls <code>LayoutInflater.inflate</code> with the layout id, then <code>bind(root)</code>. <code>bind</code> looks each id up once, with a findViewById-style search, and stores the result in a final field. If a view it needs is missing, for example because you passed the wrong layout, it throws a <code>NullPointerException</code> that says “Missing required view with ID”.</p>
<p>Inflation itself reads the compiled binary XML from the APK and, for each tag, calls the View’s <code>(Context, AttributeSet)</code> constructor. <code>AppCompatActivity</code> installs a factory that swaps some tags for their AppCompat versions, so a <code>&lt;TextView&gt;</code> becomes an <code>AppCompatTextView</code>.</p>`,
      code: `// Roughly what the generated bind() does (the real class is Java)
fun bind(root: View): ActivityProfileBinding {
    val title = root.findViewById<TextView>(R.id.title)
        ?: throw NullPointerException("Missing required view with ID: ...")
    val follow = root.findViewById<Button>(R.id.follow)
        ?: throw NullPointerException("Missing required view with ID: ...")
    return ActivityProfileBinding(root as ConstraintLayout, title, follow)
}`,
    },
    mistakes: [
      {
        title: 'Using Kotlin synthetics from an old tutorial',
        bad: `import kotlinx.android.synthetic.main.activity_profile.*

title.text = "Hi, Ada"`,
        good: `binding = ActivityProfileBinding.inflate(layoutInflater)
setContentView(binding.root)
binding.title.text = "Hi, Ada"`,
        why: 'The <code>kotlin-android-extensions</code> plugin that made synthetics was removed in Kotlin 1.8. View binding is the replacement.',
      },
      {
        title: 'Looking up a view in a property initializer',
        bad: `class ProfileActivity : AppCompatActivity() {
    private val title: TextView = findViewById(R.id.title)
}`,
        good: `class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding
    // set in onCreate, after setContentView
}`,
        why: 'Property initializers run when the Activity object is created, before <code>onCreate</code>. There is no window or layout yet, so the lookup crashes.',
      },
      {
        title: 'Attaching the Fragment’s view to the container yourself',
        bad: `override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, s: Bundle?): View {
    _binding = FragmentProfileBinding.inflate(inflater, container, true)
    return binding.root
}`,
        good: `override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, s: Bundle?): View {
    _binding = FragmentProfileBinding.inflate(inflater, container, false)
    return binding.root
}`,
        why: 'The FragmentManager adds the returned view to the container. Attaching it first makes that add fail with “The specified child already has a parent”.',
      },
    ],
  };

  const passesDepth = {
    deeper: [
      {
        title: 'How layout params become a MeasureSpec',
        body: `<p>A parent turns each child’s <code>layout_width</code> into a MeasureSpec. A fixed size like <code>120dp</code> is always <code>EXACTLY</code>. <code>match_parent</code> takes the parent’s mode and size. <code>wrap_content</code> becomes <code>AT_MOST</code> the parent’s size, so the child can be smaller but not bigger.</p>
<p>Inside a horizontal <code>ScrollView</code> the parent has no width limit, so it passes <code>UNSPECIFIED</code>. Then <code>resolveSize</code> gives the child whatever it wants, which is how content can grow wider than the screen and scroll.</p>`,
        code: `// The child side: resolveSize() applies the spec to the size the view wants
val wanted = textWidth + paddingLeft + paddingRight
val width = when (MeasureSpec.getMode(widthMeasureSpec)) {
    MeasureSpec.EXACTLY -> MeasureSpec.getSize(widthMeasureSpec)
    MeasureSpec.AT_MOST -> minOf(wanted, MeasureSpec.getSize(widthMeasureSpec))
    else -> wanted                                   // UNSPECIFIED
}`,
        visual(el) {
          const P = 300;
          let parent = 'exactly', param = 'wrap', content = 180, busy = false;
          const PARENTS = { exactly: ['parent: EXACTLY 300', 'EXACTLY'], atmost: ['parent: AT_MOST 300', 'AT_MOST'], none: ['parent: ScrollView', 'UNSPECIFIED'] };
          const PARAMS = { match: 'match_parent', wrap: 'wrap_content', fixed: '120dp' };
          const lineSpec = h('div', { class: 'vw-node' }, h('span', {}, 'getChildMeasureSpec()'), h('span', { class: 'vw-note' }));
          const lineRes = h('div', { class: 'vw-node' }, h('span', {}, 'child onMeasure: resolveSize()'), h('span', { class: 'vw-note' }));
          const pBox = h('div', { class: 'vw-d2p-parent' }, h('span', { class: 'vw-note' }, 'parent'));
          const cBox = h('div', { class: 'vw-d2p-child' }, h('span', { class: 'vw-d2p-txt' }));
          const track = h('div', { class: 'vw-d2p-track' }, pBox, cBox);
          const o = out();
          const pct = v => (v / 400) * 100 + '%';
          function spec() {
            const pm = PARENTS[parent][1];
            if (param === 'fixed') return ['EXACTLY', 120];
            if (pm === 'UNSPECIFIED') return ['UNSPECIFIED', 0];
            if (param === 'match') return [pm, P];
            return ['AT_MOST', P];
          }
          const resolve = ([m, s]) => (m === 'EXACTLY' ? s : m === 'AT_MOST' ? Math.min(content, s) : content);
          function paintStatic() {
            pBox.style.width = pct(P);
            pBox.classList.toggle('vw-d2p-open', parent === 'none');
            pBox.firstChild.textContent = parent === 'none' ? 'parent: no width limit' : `parent: ${PARENTS[parent][1]} 300`;
          }
          function paintResult(animate) {
            const sp = spec(), w = resolve(sp);
            lineSpec.lastChild.textContent = `${PARAMS[param]} → ${sp[0]}${sp[0] === 'UNSPECIFIED' ? '' : ' ' + sp[1]}`;
            lineRes.lastChild.textContent = `wants ${content} → measured ${w}`;
            cBox.style.width = pct(Math.min(w, 400));
            cBox.classList.toggle('vw-d2p-over', w > P);
            cBox.firstChild.textContent = `${w}`;
            if (animate) replay(cBox, 'pop-soft');
            return { sp, w };
          }
          const pBtns = Object.keys(PARENTS).map(k => cmd(PARENTS[k][0], () => run(() => { parent = k; }, pBtns, Object.keys(PARENTS), k)));
          const cBtns = Object.keys(PARAMS).map(k => cmd(`layout_width="${PARAMS[k]}"`, () => run(() => { param = k; }, cBtns, Object.keys(PARAMS), k)));
          const press = (bs, ks, k) => bs.forEach((b, i) => b.setAttribute('aria-pressed', String(ks[i] === k)));
          async function run(setter, bs, ks, k) {
            if (busy) return; busy = true;
            setter(); press(bs, ks, k); paintStatic();
            lineSpec.classList.add('on'); lineSpec.lastChild.textContent = '…';
            await sleep(350); if (!el.isConnected) return;
            const { sp, w } = paintResult(false);
            lineSpec.classList.remove('on'); lineRes.classList.add('on');
            await sleep(350); if (!el.isConnected) return;
            paintResult(true); lineRes.classList.remove('on');
            const why = sp[0] === 'EXACTLY' ? 'EXACTLY: the view gets that size, whatever it wants.' : sp[0] === 'AT_MOST' ? `AT_MOST: the view takes what it wants, up to ${sp[1]}.` : 'UNSPECIFIED: no limit, so the view takes all it wants.';
            say(o, `${why}${w > P ? ' <span class="bad">wider than the parent:</span> it only fits because a ScrollView scrolls.' : ''}`);
            busy = false;
          }
          const textSw = toggle('vw-d2p-long', 'Long text: the view wants 360, not 180', false, () => {
            content = textSw.input.checked ? 360 : 180; paintResult(true);
            say(o, `The view now wants ${content}. ${spec()[0] === 'EXACTLY' ? 'EXACTLY ignores that.' : 'Watch the measured width.'}`);
          });
          press(pBtns, Object.keys(PARENTS), parent); press(cBtns, Object.keys(PARAMS), param);
          paintStatic(); paintResult(false);
          say(o, 'wrap_content under an EXACTLY parent becomes AT_MOST 300. Change either side.');
          el.append(
            h('div', { class: 'controls' }, pBtns),
            h('div', { class: 'controls' }, cBtns),
            h('div', { class: 'vw-tree' }, lineSpec, lineRes),
            track, textSw.el, o);
        },
      },
      {
        title: 'Nested weights measure twice per level',
        body: `<p>A <code>LinearLayout</code> with <code>layout_weight</code> measures its children once, then again to share out the space that is left. Put another weighted LinearLayout inside, and each of its children is measured twice for every time the outer one measures it. The cost doubles with each level.</p>
<p>Android’s performance docs call this double taxation. RelativeLayout does it too. A flat hierarchy, usually one <code>ConstraintLayout</code>, stops the multiplying.</p>`,
        visual(el) {
          let depth = 2, flat = false, busy = false;
          const sCalls = stat('leaf onMeasure calls', 0);
          const box = h('div', { class: 'vw-d2p-nest' });
          const o = out();
          let leaf;
          function build() {
            if (flat) {
              leaf = h('div', { class: 'vw-d2p-leaf' }, 'TextView');
              box.replaceChildren(h('div', { class: 'vw-d2p-lvl' }, h('span', { class: 'vw-note' }, 'ConstraintLayout'), leaf));
              return;
            }
            leaf = h('div', { class: 'vw-d2p-leaf' }, 'TextView');
            let inner = leaf;
            for (let d = depth; d >= 1; d--) inner = h('div', { class: 'vw-d2p-lvl' }, h('span', { class: 'vw-note' }, `LinearLayout, weight · level ${d}`), inner);
            box.replaceChildren(inner);
          }
          const depthBtns = [1, 2, 3, 4].map(d => cmd(`${d} level${d > 1 ? 's' : ''} deep`, () => { if (busy) return; depth = d; flat = false; build(); press(); sCalls.set(0); say(o, `${d} nested weighted LinearLayouts. Measure the frame.`); }));
          const press = () => depthBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(!flat && i + 1 === depth)));
          async function measure() {
            if (busy) return; busy = true;
            const n = flat ? 1 : 2 ** depth;
            sCalls.set(0);
            for (let i = 1; i <= n; i++) {
              leaf.classList.add('on'); sCalls.set(i);
              await sleep(n > 8 ? 110 : 220); if (!el.isConnected) return;
              leaf.classList.remove('on');
              await sleep(40);
            }
            say(o, flat
              ? '<span class="good">flat:</span> one parent, so nothing multiplies. The count no longer depends on how deep the old tree was.'
              : `<span class="${depth > 2 ? 'bad' : 'muted'}">${n} calls</span> for one TextView: 2 per level, ${depth} level${depth > 1 ? 's' : ''}. ${depth < 4 ? 'Add a level and it doubles.' : 'In a list row this runs for every row.'}`);
            busy = false;
          }
          build(); press();
          say(o, 'Two nested weighted LinearLayouts. Measure one frame and count.');
          el.append(
            h('div', { class: 'controls' }, depthBtns, cmd('flatten into ConstraintLayout', () => { if (busy) return; flat = true; build(); press(); sCalls.set(0); say(o, 'One flat ConstraintLayout. Measure again.'); })),
            box,
            h('div', { class: 'controls' }, act('Measure one frame', measure)),
            h('div', { class: 'vw-stats' }, sCalls),
            o);
        },
      },
      {
        title: 'Sizes are 0 until the first layout pass',
        body: `<p>In <code>onCreate</code> or <code>onViewCreated</code> nothing has been measured yet, so <code>view.width</code> is 0. Don’t read sizes there. <code>doOnLayout</code> from core-ktx runs your block right away if the view is already laid out, or after its next layout pass.</p>`,
        code: `override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    Log.d("Chart", "width now: \${binding.chart.width}")    // 0
    binding.chart.doOnLayout { chart ->
        drawBars(chart.width, chart.height)                // real sizes
    }
}`,
      },
    ],
    underHood: {
      body: `<p><code>requestLayout()</code> sets a flag on the view and walks up through its parents to <code>ViewRootImpl</code>, which asks the <code>Choreographer</code> for a callback on the next vsync. That callback runs <code>performTraversals</code>: measure from the root down, then layout, then draw. <code>View.measure</code> skips your <code>onMeasure</code> when the specs match last time and no layout was requested, so untouched branches stay cheap.</p>
<p><code>invalidate()</code> only marks the view dirty. With hardware acceleration, which is the default, the draw pass re-records just that view’s display list, and the separate RenderThread turns the display lists into GPU commands.</p>`,
      code: `// One frame, simplified from ViewRootImpl.performTraversals()
if (layoutRequested) {
    performMeasure(rootWidthSpec, rootHeightSpec)   // root.measure() → onMeasure down the tree
    performLayout()                                 // root.layout() → onLayout down the tree
}
performDraw()   // re-record dirty display lists, then the RenderThread draws`,
    },
    mistakes: [
      {
        title: 'Fixing the size after layout instead of in onMeasure',
        bad: `override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    layoutParams = layoutParams.apply { height = w }   // make it square
}`,
        good: `override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    setMeasuredDimension(measuredWidth, measuredWidth)  // square, in one pass
}`,
        why: 'Setting layout params requests another layout, so every frame that resizes runs two passes and the view can flicker. Decide the size in <code>onMeasure</code>.',
      },
      {
        title: 'Ignoring padding when measuring and drawing',
        bad: `val w = paint.measureText(text).toInt()
setMeasuredDimension(resolveSize(w, widthMeasureSpec), heightFor(heightMeasureSpec))
// onDraw: canvas.drawText(text, 0f, baseline, paint)`,
        good: `val w = paint.measureText(text).toInt() + paddingLeft + paddingRight
setMeasuredDimension(resolveSize(w, widthMeasureSpec), heightFor(heightMeasureSpec))
// onDraw: canvas.drawText(text, paddingLeft.toFloat(), baseline, paint)`,
        why: 'A custom view must handle <code>android:padding</code> itself. If not, padding set in XML does nothing and the text touches the edges.',
      },
      {
        title: 'Setting the measured size without the spec',
        bad: `override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(desiredWidth, desiredHeight)
}`,
        good: `override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(
        resolveSize(desiredWidth, widthMeasureSpec),
        resolveSize(desiredHeight, heightMeasureSpec),
    )
}`,
        why: 'Ignoring the spec breaks <code>match_parent</code> and fixed dp sizes, and the view can grow past the space its parent has.',
      },
    ],
  };

  const diffDepth = {
    deeper: [
      {
        title: 'submitList returns before the list changes',
        body: `<p><code>submitList</code> starts the diff on a background thread and returns at once. The rows change later, back on the main thread. Code on the next line still sees the old list.</p>
<p>Scrolling to the top right after inserting at position 0 is the classic case. RecyclerView keeps the row you were looking at in place, so the new item lands just above the screen. Pass a commit callback. It runs after the new list is applied.</p>`,
        code: `adapter.submitList(newList) {
    binding.list.scrollToPosition(0)   // runs after the diff is applied
}`,
        visual(el) {
          const base = ['Ada', 'Grace', 'Linus', 'Alan', 'Ken'];
          let list = base.slice(), busy = false;
          const rv = h('div', { class: 'vw-rv vw-d2d-rv' });
          const above = h('div', { class: 'vw-d2d-above' });
          const mainBar = h('i'), bgBar = h('i');
          const lanes = h('div', { class: 'vw-d2d-lanes' },
            h('span', { class: 'vw-label' }, 'main'), h('div', { class: 'vw-d2d-lane' }, mainBar),
            h('span', { class: 'vw-label' }, 'diff'), h('div', { class: 'vw-d2d-lane' }, bgBar));
          const log = h('div', { class: 'vw-log' });
          const o = out();
          const rowEl = (n, cls) => h('div', { class: 'vw-row' + (cls ? ' ' + cls : '') }, h('span', {}, n));
          const paint = (topIndex, newCls) => {
            rv.replaceChildren(...list.slice(topIndex, topIndex + 4).map(n => rowEl(n, n === 'Zoe' ? newCls : '')));
            above.textContent = topIndex > 0 ? `${topIndex} row above the screen: ${list.slice(0, topIndex).join(', ')}` : 'nothing above the screen';
            above.classList.toggle('vw-d2d-hid', topIndex > 0);
          };
          const line = t => { log.append(h('div', {}, t)); while (log.children.length > 5) log.firstElementChild.remove(); };
          const bar = (b, s, e) => { b.style.left = s + '%'; b.style.width = (e - s) + '%'; };
          function reset() { list = base.slice(); paint(0); log.replaceChildren(); bar(mainBar, 0, 0); bar(bgBar, 0, 0); }
          async function run(withCallback) {
            if (busy) return; busy = true;
            reset();
            line('submitList(listOf(Zoe) + old)'); bar(mainBar, 0, 8);
            await sleep(300); if (!el.isConnected) return;
            if (!withCallback) { line('scrollToPosition(0)   // still the old list'); bar(mainBar, 0, 20); replay(rv, 'pop-soft'); await sleep(400); if (!el.isConnected) return; }
            line('... diff on a background thread'); bgBar.classList.add('vw-d2d-run'); bar(bgBar, 20, 70);
            await sleep(700); if (!el.isConnected) return;
            bgBar.classList.remove('vw-d2d-run');
            list = ['Zoe', ...base];
            line('dispatch: notifyItemInserted(0)'); bar(mainBar, 0, 80);
            if (!withCallback) {
              paint(1, 'vw-ins');
              say(o, '<span class="bad">hidden:</span> the scroll ran before the insert. RecyclerView kept Ada in place, so Zoe went in above the screen.');
              busy = false; return;
            }
            paint(1, 'vw-ins');
            await sleep(450); if (!el.isConnected) return;
            line('commit callback: scrollToPosition(0)'); bar(mainBar, 0, 100);
            paint(0, 'vw-ins drop-in');
            say(o, '<span class="good">visible:</span> the callback ran after the insert, so the scroll brought Zoe on screen.');
            busy = false;
          }
          reset();
          line('// waiting for submitList()');
          say(o, 'The user is at the top. Insert Zoe at position 0 and scroll to it, two ways.');
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecyclerView'), above, rv),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Threads'), lanes, log)),
            h('div', { class: 'controls' },
              cmd('submitList(new); list.scrollToPosition(0)', () => run(false)),
              cmd('submitList(new) { list.scrollToPosition(0) }', () => run(true))),
            o);
        },
      },
      {
        title: 'Mutating an item hides the change from DiffUtil',
        body: `<p>DiffUtil compares the old list with the new one. If you change a property on an object that both lists share, old and new are the same object. <code>areContentsTheSame</code> returns true, and the row is not rebound.</p>
<p>The screen then shows the old state until that row is rebound for some other reason, like scrolling it off and back. Keep list items immutable and replace the one that changed with <code>copy</code>.</p>`,
        code: `// Before: class Contact(val id: Long, var starred: Boolean)
data class Contact(val id: Long, val name: String, val starred: Boolean)

fun star(id: Long) {
    adapter.submitList(adapter.currentList.map { if (it.id == id) it.copy(starred = true) else it })
}`,
        visual(el) {
          let data, shown, busy = false;
          const box = h('div', { class: 'vw-list' });
          const memo = h('div', { class: 'kt' });
          const o = out();
          function reset() {
            data = [{ id: 1, name: 'Ada', star: false }, { id: 2, name: 'Grace', star: false }, { id: 3, name: 'Linus', star: false }];
            shown = data.map(x => x.star);
            paint();
          }
          const row = (x, i, cls) => h('div', { class: 'vw-row' + (cls ? ' ' + cls : '') }, h('span', { class: 'vw-tag' }, `id ${x.id}`), h('span', {}, x.name),
            shown[i] ? h('span', { class: 'vw-tag vw-star' }, 'starred') : null);
          const paint = (cls = {}) => {
            box.replaceChildren(...data.map((x, i) => row(x, i, cls[i])));
            memo.innerHTML = hl(`// in memory: Grace.starred = ${data[1].star}`);
            box.children[1].classList.toggle('vw-d2d-stale', data[1].star !== shown[1]);
          };
          async function mutate() {
            if (busy) return; busy = true;
            data[1].star = !data[1].star;
            paint(); replay(memo, 'pop-soft');
            await sleep(350); if (!el.isConnected) return;
            say(o, `<span class="bad">no rebind:</span> both lists hold the same Grace object, so old == new. The row still shows ${shown[1] ? 'a star' : 'no star'}.`);
            replay(box.children[1], 'shake');
            busy = false;
          }
          async function copy() {
            if (busy) return; busy = true;
            const nw = { ...data[1], star: !data[1].star };
            data = data.map((x, i) => (i === 1 ? nw : x));
            await sleep(250); if (!el.isConnected) return;
            shown[1] = nw.star;
            paint({ 1: 'vw-chg pop' });
            say(o, `<span class="good">rebound:</span> a new Grace object (starred = ${nw.star}) differs from the old one, so DiffUtil sent a change for row 1.`);
            busy = false;
          }
          async function scrollAway() {
            if (busy) return; busy = true;
            const r = box.children[1]; r.classList.add('leave');
            await sleep(420); if (!el.isConnected) return;
            const stale = shown[1] !== data[1].star;
            shown[1] = data[1].star;
            paint({ 1: 'drop-in' });
            say(o, stale ? '<span class="muted">rebound by the scroll:</span> now the star shows. The bug looks random because it depends on scrolling.' : 'Rebound by the scroll. It already matched.');
            busy = false;
          }
          reset();
          say(o, 'Star Grace by mutating her, then by copying.');
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecyclerView'), box),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'The object'), memo, h('p', { class: 'tip' }, 'A red border means the row is out of date.'))),
            h('div', { class: 'controls' },
              cmd('items[1].starred = !starred; submitList(items.toList())', mutate),
              cmd('submitList(items.map { copy(starred = …) })', copy),
              act('Scroll row 1 off and back', scrollAway)),
            o);
        },
      },
    ],
    underHood: {
      body: `<p><code>ListAdapter</code> hands everything to an <code>AsyncListDiffer</code>. <code>submitList</code> returns at once if you pass the same list instance. If there is no current list yet, or the new one is null, it skips the diff and dispatches a plain insert or remove. Otherwise it bumps a generation counter and runs <code>DiffUtil.calculateDiff</code> on a background executor, a small fixed thread pool by default.</p>
<p>When the result comes back on the main thread, the differ checks that no newer list arrived in the meantime. A stale result is dropped. Then it swaps in the new list and calls <code>dispatchUpdatesTo</code>, which turns the result into <code>notifyItemRangeInserted</code>, <code>notifyItemRangeRemoved</code>, <code>notifyItemMoved</code> and <code>notifyItemRangeChanged</code> calls. DiffUtil uses Eugene Myers’ difference algorithm, plus an extra pass to detect moves.</p>`,
      code: `// The core of AsyncListDiffer.submitList, simplified
val runGeneration = ++maxScheduledGeneration
backgroundExecutor.execute {
    val result = DiffUtil.calculateDiff(callbackFor(oldList, newList))
    mainThreadExecutor.execute {
        if (maxScheduledGeneration == runGeneration) {   // no newer list since
            latchList(newList, result, commitCallback)     // swap + dispatchUpdatesTo
        }
    }
}`,
    },
    mistakes: [
      {
        title: 'Comparing a class without equals',
        bad: `class Contact(val id: Long, val name: String)

override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem`,
        good: `data class Contact(val id: Long, val name: String)

override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem`,
        why: 'A plain class compares by reference. Items mapped fresh from the database are always new objects, so every row rebinds and flashes on every update.',
      },
      {
        title: 'Calling notify methods on a ListAdapter',
        bad: `items[2] = updated              // the list you passed to submitList
adapter.notifyItemChanged(2)`,
        good: `adapter.submitList(adapter.currentList.toMutableList().apply { set(2, updated) })`,
        why: 'ListAdapter keeps the list you submitted as its old list. Change it in place and the next diff compares against data that already changed, so updates go missing. Size changes can even crash with “Inconsistency detected”.',
      },
      {
        title: 'Reading your own list field in onBindViewHolder',
        bad: `var contacts: List<Contact> = emptyList()

override fun onBindViewHolder(holder: Holder, position: Int) {
    holder.bind(contacts[position])
}`,
        good: `override fun onBindViewHolder(holder: Holder, position: Int) {
    holder.bind(getItem(position))
}`,
        why: 'Your field changes when you set it. The adapter’s list changes when the diff lands. Between the two, positions point at the wrong items. <code>getItem</code> always matches what RecyclerView shows.',
      },
    ],
  };

  const civDepth = {
    deeper: [
      {
        title: 'ComposeView rows in a RecyclerView',
        body: `<p>A ComposeView works as a RecyclerView row. Create it in <code>onCreateViewHolder</code> and call <code>setContent</code> in <code>onBindViewHolder</code>. With the default strategy, a row that scrolls off keeps its composition while it waits in the pool. When it is reused, the existing composition just recomposes with the new item.</p>
<p>The composition is disposed only when the holder is thrown away, for example when the pool is already full, or when the RecyclerView leaves the window. With <code>DisposeOnDetachedFromWindow</code> instead, every scroll throws compositions away and builds new ones.</p>`,
        code: `class RowHolder(val composeView: ComposeView) : RecyclerView.ViewHolder(composeView)

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = RowHolder(ComposeView(parent.context))

override fun onBindViewHolder(holder: RowHolder, position: Int) {
    val item = getItem(position)
    holder.composeView.setContent { AppTheme { ContactRow(item) } }   // recomposes a kept composition
}`,
        visual(el) {
          const NAMES = ['Ada', 'Alan', 'Barbara', 'Dennis', 'Edsger', 'Frances', 'Grace', 'Hedy', 'Ivan', 'Joan', 'Ken', 'Linus', 'Margaret', 'Niklaus', 'Radia', 'Shafi'];
          const SHOW = 4, POOL = 2;
          let pooled, top, rows, pool, comps, disposed, recomps, busy = false, vhN = SHOW, data = NAMES.slice();
          const rv = h('div', { class: 'vw-rv', style: 'height:220px' });
          const poolEl = h('div', { class: 'vw-pool' });
          const sC = stat('compositions created', 0), sD = stat('disposed', 0), sR = stat('recomposed', 0);
          const o = out();
          const strat = [cmd('DisposeOnDetachedFromWindowOrReleasedFromPool', () => setStrat(true)), cmd('DisposeOnDetachedFromWindow', () => setStrat(false))];
          const chip = r => h('span', { class: `vw-vh c${(r.vh - 1) % 6}` }, `VH${r.vh}`);
          const rowEl = r => h('div', { class: 'vw-row' }, chip(r), h('span', {}, data[r.pos]), h('span', { class: 'vw-pos' + (r.comp ? '' : ' vw-d2c-dead') }, r.comp ? `comp #${r.comp}` : 'no comp'));
          const paintPool = () => poolEl.replaceChildren(...(pool.length ? pool.map(r => h('span', { class: 'vw-ent' }, chip(r), r.comp ? `comp #${r.comp} kept` : 'disposed')) : [h('span', { class: 'vw-note' }, 'empty')]));
          const set = () => { sC.set(comps); sD.set(disposed); sR.set(recomps); };
          function setStrat(p) {
            if (busy) return;
            pooled = p; top = 0; rows = []; vhN = SHOW; data = NAMES.slice(); pool = []; comps = 0; disposed = 0; recomps = 0;
            strat.forEach((b, i) => b.setAttribute('aria-pressed', String((i === 0) === p)));
            for (let i = 0; i < SHOW; i++) { const r = { pos: i, vh: i + 1, comp: ++comps }; rows.push(r); }
            rv.replaceChildren(...rows.map(r => (r.el = rowEl(r))));
            paintPool(); set();
            say(o, `${p ? 'Default strategy' : 'DisposeOnDetachedFromWindow'}. 4 rows, 4 compositions. Scroll down.`);
          }
          async function scroll() {
            if (busy) return false;
            const pos = top + rows.length;
            if (pos >= data.length) { replay(rv, 'shake'); say(o, '<span class="muted">// end of list</span>'); return false; }
            busy = true;
            let r, msg;
            if (pool.length) {
              r = pool.shift(); r.pos = pos;
              if (r.comp) { recomps++; msg = `<span class="good">reused VH${r.vh}:</span> its composition #${r.comp} recomposed with ${data[pos]}`; }
              else { r.comp = ++comps; msg = `<span class="bad">reused VH${r.vh}:</span> its composition was disposed, so a new one (#${r.comp}) was built`; }
            } else { r = { pos, vh: ++vhN, comp: ++comps }; msg = `<span class="bad">created VH${r.vh}</span> and composition #${r.comp}`; }
            r.el = rowEl(r); r.el.classList.add('drop-in'); rows.push(r); rv.append(r.el);
            paintPool(); set(); say(o, msg);
            await sleep(320);
            const gone = rows.shift(); gone.el.classList.add('leave');
            await sleep(400);
            if (!el.isConnected) return false;
            gone.el.remove();
            if (!pooled) { gone.comp = 0; disposed++; o.append(h('span', {}, ` · VH${gone.vh} detached: composition disposed`)); }
            pool.push(gone); paintPool(); set();
            top++; busy = false;
            return true;
          }
          async function remove3() {
            if (busy) return; busy = true;
            const out3 = rows.splice(1, 3);
            data.splice(top + 1, 3);
            out3.forEach(r => r.el.classList.add('leave'));
            await sleep(420); if (!el.isConnected) return;
            out3.forEach(r => r.el.remove());
            let dropped = 0, killed = 0;
            for (const r of out3) {
              if (!pooled && r.comp) { r.comp = 0; disposed++; killed++; }
              if (pool.length < POOL) pool.push(r);
              else { dropped++; if (r.comp) { r.comp = 0; disposed++; } }
            }
            paintPool(); set();
            say(o, pooled
              ? `3 rows removed. This pool holds ${POOL}, so ${dropped ? `<span class="bad">${dropped} holder${dropped > 1 ? 's were' : ' was'} discarded and ${dropped > 1 ? 'their compositions' : 'its composition'} disposed</span>` : 'nothing was discarded'}. Pooled holders keep their compositions.`
              : `3 rows removed. <span class="bad">${killed} compositions disposed</span> the moment the rows detached.`);
            await sleep(500); if (!el.isConnected) return;
            busy = false;
            for (let i = 0; i < 3; i++) { if (!(await fill())) break; }
          }
          async function fill() {
            if (busy) return false;
            const pos = top + rows.length;
            if (pos >= data.length || rows.length >= SHOW) return false;
            busy = true;
            let r, msg;
            if (pool.length) {
              r = pool.shift(); r.pos = pos;
              if (r.comp) { recomps++; msg = `<span class="good">refill: VH${r.vh}</span> recomposed its kept composition #${r.comp}`; }
              else { r.comp = ++comps; msg = `<span class="bad">refill: VH${r.vh}</span> needed a new composition #${r.comp}`; }
            } else { r = { pos, vh: ++vhN, comp: ++comps }; msg = `<span class="bad">refill: created VH${r.vh}</span> and composition #${r.comp}`; }
            r.el = rowEl(r); r.el.classList.add('drop-in'); rows.push(r); rv.append(r.el);
            paintPool(); set(); o.append(h('span', { html: ' · ' + msg }));
            await sleep(380);
            busy = false;
            return el.isConnected;
          }
          setStrat(true);
          el.append(
            h('div', { class: 'vw-strats' }, strat),
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecyclerView of ComposeViews'), rv),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, `Pool (max ${POOL} for the demo)`), poolEl,
                h('p', { class: 'tip' }, 'Real pools hold 5 per view type unless you change it.'))),
            h('div', { class: 'controls' }, act('Scroll down 1 row', scroll), act('Remove 3 rows', remove3)),
            h('div', { class: 'vw-stats' }, sC, sR, sD),
            o);
        },
      },
      {
        title: 'Two ComposeViews need two ids',
        body: `<p><code>rememberSaveable</code> inside a ComposeView saves into the Activity or Fragment’s saved state. The key comes from the ComposeView’s id. If two ComposeViews on one screen have the same id, or no id at all, they share a key. Only the first one restores its state. The second starts over.</p>
<p>A ComposeView in XML usually has an id already. One you create in code does not, so give it one from <code>res/values/ids.xml</code>.</p>`,
        code: `// res/values/ids.xml: <item name="compose_header" type="id" />
//                      <item name="compose_footer" type="id" />
val header = ComposeView(context).apply {
    id = R.id.compose_header
    setContent { AppTheme { Header() } }
}
val footer = ComposeView(context).apply {
    id = R.id.compose_footer
    setContent { AppTheme { Footer() } }
}`,
        visual(el) {
          let ids = false, busy = false;
          const counts = [2, 5];
          const mk = (name) => {
            const num = h('span', { class: 'vw-count vw-d2c-num' }, '0');
            const idTag = h('span', { class: 'vw-cv-name' });
            const box = h('div', { class: 'vw-d2c-cv' }, idTag, num);
            return { name, num, idTag, box };
          };
          const cvs = [mk('header'), mk('footer')];
          const screen = h('div', { class: 'vw-screen vw-d2c-scr' }, h('div', { class: 'vw-d2c-stack' }, cvs.map(c => c.box)));
          const o = out();
          const paint = () => cvs.forEach((c, i) => { c.num.textContent = String(counts[i]); c.idTag.textContent = ids ? `id = compose_${c.name}` : 'id = NO_ID'; });
          const sw = toggle('vw-d2c-ids', 'Give each ComposeView its own <code>id</code>', false, () => { ids = sw.input.checked; paint(); say(o, ids ? 'Unique ids: two different keys in the saved state.' : 'No ids: both ComposeViews use the same key.'); });
          async function rotate() {
            if (busy) return; busy = true;
            replay(screen, 'flip');
            await sleep(450); if (!el.isConnected) return;
            if (!ids) counts[1] = 0;
            paint(); cvs.forEach(c => replay(c.num, 'pop'));
            say(o, ids
              ? `<span class="good">both restored:</span> header ${counts[0]}, footer ${counts[1]}.`
              : `<span class="bad">footer lost its state:</span> the header claimed the shared key first, so the footer started over at 0.`);
            busy = false;
          }
          paint();
          say(o, 'Both ComposeViews hold a rememberSaveable count. Bump them, then rotate.');
          el.append(
            h('div', { class: 'vw-split' }, screen, h('div', { class: 'vw-col' }, sw.el,
              h('div', { class: 'controls' },
                cmd('header: count++', () => { if (busy) return; counts[0]++; paint(); replay(cvs[0].num, 'pop'); }),
                cmd('footer: count++', () => { if (busy) return; counts[1]++; paint(); replay(cvs[1].num, 'pop'); }),
                act('Rotate the screen', rotate)))),
            o);
        },
      },
    ],
    underHood: {
      body: `<p><code>ComposeView</code> extends <code>AbstractComposeView</code>, a ViewGroup. <code>setContent</code> only stores your lambda. The composition is created when the view is attached to a window. At that point it looks up the view tree for a parent composition, or uses a Recomposer kept per window, and adds an <code>AndroidComposeView</code> child, which is the View that actually measures and draws the composable UI.</p>
<p>It also reads <code>ViewTreeLifecycleOwner</code> and <code>ViewTreeSavedStateRegistryOwner</code> from the view tree. <code>ComponentActivity</code> and <code>Fragment</code> set those on their views for you. If they are missing, attaching fails with an IllegalStateException that says the ViewTreeLifecycleOwner was not found.</p>`,
    },
    mistakes: [
      {
        title: 'A ComposeView in an Activity that is not a ComponentActivity',
        bad: `class LegacyActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(ComposeView(this).apply { setContent { Banner() } })
    }
}`,
        good: `class LegacyActivity : ComponentActivity() {   // or AppCompatActivity
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(ComposeView(this).apply { setContent { Banner() } })
    }
}`,
        why: 'A plain <code>Activity</code> sets no lifecycle owner on its views, so the ComposeView can’t find one and crashes when it attaches.',
      },
      {
        title: 'Forgetting the theme inside setContent',
        bad: `binding.rating.setContent {
    RatingBar(stars = 4)
}`,
        good: `binding.rating.setContent {
    AppTheme { RatingBar(stars = 4) }
}`,
        why: 'Each ComposeView is its own composition. Without your theme it falls back to MaterialTheme defaults, so colors and type don’t match the rest of the screen.',
      },
      {
        title: 'Adding a new ComposeView on every bind',
        bad: `override fun onBindViewHolder(holder: Holder, position: Int) {
    holder.container.removeAllViews()
    holder.container.addView(ComposeView(holder.itemView.context).apply {
        setContent { ContactRow(getItem(position)) }
    })
}`,
        good: `// one ComposeView per holder, created in onCreateViewHolder
override fun onBindViewHolder(holder: Holder, position: Int) {
    val item = getItem(position)
    holder.composeView.setContent { AppTheme { ContactRow(item) } }
}`,
        why: 'A new ComposeView means a new composition per bind, and the old one is thrown away. Keep one per holder so binding only recomposes.',
      },
    ],
  };

  const avDepth = {
    deeper: [
      {
        title: 'Reuse Views in lazy lists with onReset',
        body: `<p>In a <code>LazyColumn</code>, items that scroll off can be reused for items that scroll in. An AndroidView takes part only if you pass <code>onReset</code>. Then its View is kept, <code>onReset</code> clears it, and <code>update</code> fills it with the new item. No new View is built.</p>
<p>Without <code>onReset</code>, a View that scrolls off is released for good. <code>onRelease</code> runs and the next item pays for <code>factory</code> again. For heavy Views, like a chart or a map, that cost shows up as dropped frames while scrolling.</p>`,
        code: `LazyColumn {
    items(stocks, key = { it.id }) { stock ->
        AndroidView(
            factory = { ctx -> SparklineView(ctx) },
            update = { it.points = stock.prices },
            onReset = { it.points = emptyList() },   // makes the View reusable
            onRelease = { it.stopAnimations() },
            modifier = Modifier.fillMaxWidth().height(56.dp),
        )
    }
}`,
        visual(el) {
          const NAMES = ['AAPL', 'GOOG', 'MSFT', 'AMZN', 'NFLX', 'META', 'TSLA', 'NVDA', 'ADBE', 'ORCL', 'SAP', 'IBM', 'INTC', 'AMD'];
          const SHOW = 4;
          let reset = true, top, rows, kept, nF, nU, nR, nRel, made, busy = false;
          const rv = h('div', { class: 'vw-rv', style: 'height:220px' });
          const keptEl = h('div', { class: 'vw-pool' });
          const sF = stat('factory', 0), sU = stat('update', 0), sR = stat('onReset', 0), sRel = stat('onRelease', 0);
          const o = out();
          const chip = v => h('span', { class: `vw-vh c${(v - 1) % 6}` }, `View #${v}`);
          const rowEl = r => h('div', { class: 'vw-row' }, chip(r.v), h('span', {}, NAMES[r.pos % NAMES.length]), h('span', { class: 'vw-d2a-spark', 'aria-hidden': 'true' }, h('i', { style: `height:${30 + (r.pos * 37) % 60}%` }), h('i', { style: `height:${50 + (r.pos * 23) % 50}%` }), h('i', { style: `height:${20 + (r.pos * 53) % 70}%` })));
          const paintKept = () => keptEl.replaceChildren(...(kept.length ? kept.map(chip) : [h('span', { class: 'vw-note' }, reset ? 'empty' : 'nothing kept without onReset')]));
          const set = () => { sF.set(nF); sU.set(nU); sR.set(nR); sRel.set(nRel); };
          const sw = toggle('vw-d2a-reset', 'Pass <code>onReset</code>', true, () => { reset = sw.input.checked; start(); });
          function start() {
            top = 0; rows = []; kept = []; nF = 0; nU = 0; nR = 0; nRel = 0; made = 0;
            for (let i = 0; i < SHOW; i++) { const r = { pos: i, v: ++made }; nF++; nU++; rows.push(r); }
            rv.replaceChildren(...rows.map(r => (r.el = rowEl(r))));
            paintKept(); set();
            say(o, `${reset ? 'onReset is set.' : 'No onReset.'} 4 items, 4 Views. Scroll down.`);
          }
          async function scroll() {
            if (busy) return false;
            const pos = top + SHOW;
            if (pos >= NAMES.length) { replay(rv, 'shake'); say(o, '<span class="muted">// end of list</span>'); return false; }
            busy = true;
            let r, msg;
            if (reset && kept.length) { const v = kept.shift(); nR++; nU++; r = { pos, v }; msg = `<span class="good">reused View #${v}:</span> onReset, then update(${NAMES[pos]})`; }
            else { r = { pos, v: ++made }; nF++; nU++; msg = `<span class="bad">factory</span> built View #${r.v} for ${NAMES[pos]}`; }
            r.el = rowEl(r); r.el.classList.add('drop-in'); rows.push(r); rv.append(r.el);
            set(); paintKept(); say(o, msg);
            await sleep(320);
            const gone = rows.shift(); gone.el.classList.add('leave');
            await sleep(400); if (!el.isConnected) return false;
            gone.el.remove();
            if (reset) { kept.push(gone.v); o.append(h('span', {}, ` · View #${gone.v} kept for reuse`)); }
            else { nRel++; o.append(h('span', {}, ` · onRelease(View #${gone.v})`)); }
            paintKept(); set(); top++; busy = false;
            return true;
          }
          let multi = false;
          async function four() { if (multi || busy) return; multi = true; for (let i = 0; i < 4; i++) { if (!(await scroll())) break; await sleep(60); } multi = false; }
          start();
          el.append(
            sw.el,
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'LazyColumn'), rv),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Views kept for reuse'), keptEl)),
            h('div', { class: 'controls' }, act('Scroll down 1 item', scroll), act('Scroll down 4 items', four)),
            h('div', { class: 'vw-stats' }, sF, sU, sR, sRel),
            o);
        },
      },
      {
        title: 'How Compose constraints become a MeasureSpec',
        body: `<p>Compose measures with min and max constraints. Views measure with a MeasureSpec. AndroidView translates. Fixed constraints, where min equals max, become <code>EXACTLY</code>. Otherwise the View’s own layout params decide: <code>wrap_content</code> becomes <code>AT_MOST</code> the max, and <code>match_parent</code> becomes <code>EXACTLY</code> the max.</p>
<p>Inside a scrolling container the max is infinite, so either one becomes <code>UNSPECIFIED</code>. The View gets as big as it wants in that direction. This is the same table the View system uses, seen from the Compose side.</p>`,
        visual(el) {
          const AVAIL = 320;
          let mod = 'none', lp = 'wrap', busy = false;
          const wants = 180;
          const MODS = {
            none: ['Modifier', [0, AVAIL]],
            size: ['Modifier.width(160.dp)', [160, 160]],
            fill: ['Modifier.fillMaxWidth()', [AVAIL, AVAIL]],
            scroll: ['inside Row(Modifier.horizontalScroll(…))', [0, Infinity]],
          };
          const LPS = { wrap: 'WRAP_CONTENT', match: 'MATCH_PARENT' };
          const cons = h('div', { class: 'vw-node' }, h('span', {}, 'Constraints'), h('span', { class: 'vw-note' }));
          const spec = h('div', { class: 'vw-node' }, h('span', {}, 'MeasureSpec'), h('span', { class: 'vw-note' }));
          const res = h('div', { class: 'vw-node' }, h('span', {}, 'View measures'), h('span', { class: 'vw-note' }));
          const pBox = h('div', { class: 'vw-d2p-parent' }, h('span', { class: 'vw-note' }, `available: ${AVAIL}`));
          const cBox = h('div', { class: 'vw-d2p-child' }, h('span', { class: 'vw-d2p-txt' }));
          const track = h('div', { class: 'vw-d2p-track' }, pBox, cBox);
          const o = out();
          const pct = v => (v / 400) * 100 + '%';
          function compute() {
            const [min, max] = MODS[mod][1];
            if (min === max) return ['EXACTLY', max, 'fixed constraints'];
            if (max === Infinity) return ['UNSPECIFIED', 0, 'infinite max'];
            return lp === 'wrap' ? ['AT_MOST', max, 'WRAP_CONTENT, finite max'] : ['EXACTLY', max, 'MATCH_PARENT, finite max'];
          }
          function paint(anim) {
            const [min, max] = MODS[mod][1];
            const [m, s, why] = compute();
            const w = m === 'EXACTLY' ? s : m === 'AT_MOST' ? Math.min(wants, s) : wants;
            cons.lastChild.textContent = `minWidth ${min}, maxWidth ${max === Infinity ? '∞' : max}`;
            spec.lastChild.textContent = `${m}${m === 'UNSPECIFIED' ? '' : ' ' + s}  // ${why}`;
            res.lastChild.textContent = `wants ${wants} → ${w}`;
            cBox.style.width = pct(w); cBox.firstChild.textContent = String(w);
            pBox.classList.toggle('vw-d2p-open', max === Infinity);
            pBox.firstChild.textContent = max === Infinity ? 'available: no limit (scrolls)' : `available: ${AVAIL}`;
            if (anim) [cons, spec, res].forEach(n => replay(n, 'pop-soft'));
            return [m, w];
          }
          const press = (bs, ks, k) => bs.forEach((b, i) => b.setAttribute('aria-pressed', String(ks[i] === k)));
          async function pick(fn) {
            if (busy) return; busy = true;
            fn(); press(mBtns, Object.keys(MODS), mod); press(lBtns, Object.keys(LPS), lp);
            for (const n of [cons, spec, res]) { n.classList.add('on'); await sleep(220); if (!el.isConnected) return; n.classList.remove('on'); }
            const [m, w] = paint(true);
            say(o, m === 'EXACTLY' ? `EXACTLY ${w}: the View gets that width, whatever it wants.` : m === 'AT_MOST' ? `AT_MOST: the View takes the ${w} it wants.` : 'UNSPECIFIED: no limit, so the View takes all it wants.');
            busy = false;
          }
          const mBtns = Object.keys(MODS).map(k => cmd(MODS[k][0], () => pick(() => { mod = k; })));
          const lBtns = Object.keys(LPS).map(k => cmd(`layoutParams width = ${LPS[k]}`, () => pick(() => { lp = k; })));
          press(mBtns, Object.keys(MODS), mod); press(lBtns, Object.keys(LPS), lp); paint(false);
          say(o, 'No size modifier, a wrap_content View: AT_MOST 320. Try the others.');
          el.append(
            h('div', { class: 'controls' }, mBtns),
            h('div', { class: 'controls' }, lBtns),
            h('div', { class: 'vw-tree' }, cons, spec, res),
            track, o);
        },
      },
    ],
    underHood: {
      body: `<p>AndroidView creates a holder, a ViewGroup that wraps your View, and a <code>LayoutNode</code> that stands for it in the Compose layout tree. The holder is attached under the <code>AndroidComposeView</code> that hosts the whole composition. When Compose measures the node, the holder converts the constraints into MeasureSpecs, as in the table above, and measures your View. When Compose draws, the node’s draw modifier asks the host to draw the holder into the Compose canvas through <code>nativeCanvas</code>.</p>
<p><code>update</code> runs inside a snapshot read observer. When state it read changes, Compose posts a rerun of <code>update</code> to the main thread. That is how the gauge follows <code>speed</code> without the View knowing anything about Compose.</p>`,
    },
    mistakes: [
      {
        title: 'Capturing a callback in factory',
        bad: `@Composable
fun Volume(onChange: (Int) -> Unit) {
    AndroidView(factory = { ctx ->
        SeekBar(ctx).apply { setOnSeekBarChangeListener(listener { onChange(it) }) }
    })
}`,
        good: `@Composable
fun Volume(onChange: (Int) -> Unit) {
    val latest by rememberUpdatedState(onChange)
    AndroidView(factory = { ctx ->
        SeekBar(ctx).apply { setOnSeekBarChangeListener(listener { latest(it) }) }
    })
}`,
        why: '<code>factory</code> runs once, so the listener keeps the first <code>onChange</code> forever. If the caller passes a new lambda later, the View still calls the old one.',
      },
      {
        title: 'Doing expensive work in update every time',
        bad: `AndroidView(
    factory = { ctx -> WebView(ctx) },
    update = { web -> web.loadUrl(url) },
)`,
        good: `AndroidView(
    factory = { ctx -> WebView(ctx) },
    update = { web -> if (web.url != url) web.loadUrl(url) },
)`,
        why: '<code>update</code> can run many times, not only when <code>url</code> changes. An unguarded <code>loadUrl</code> reloads the page and loses the scroll position.',
      },
      {
        title: 'Not forwarding lifecycle events to a MapView',
        bad: `AndroidView(factory = { ctx -> MapView(ctx).apply { onCreate(null) } })`,
        good: `val context = LocalContext.current
val lifecycle = LocalLifecycleOwner.current.lifecycle
val map = remember { MapView(context).apply { onCreate(null) } }
DisposableEffect(lifecycle) {
    val obs = LifecycleEventObserver { _, e ->
        when (e) {
            Lifecycle.Event.ON_START -> map.onStart()
            Lifecycle.Event.ON_RESUME -> map.onResume()
            Lifecycle.Event.ON_PAUSE -> map.onPause()
            Lifecycle.Event.ON_STOP -> map.onStop()
            Lifecycle.Event.ON_DESTROY -> map.onDestroy()
            else -> Unit
        }
    }
    lifecycle.addObserver(obs)
    onDispose { lifecycle.removeObserver(obs) }
}
AndroidView(factory = { map })`,
        why: 'Some Views need the host’s lifecycle calls. A MapView that never gets <code>onStart</code> and <code>onResume</code> stays blank, and one that never gets <code>onDestroy</code> leaks.',
      },
    ],
  };

  Lab.addTrack({
    id: 'views',
    title: 'Views and Compose interop',
    description: 'Maintain View-based screens and move them to Compose one piece at a time.',
    group: 'Building apps',
    requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'xml',
        title: 'XML layouts and View binding',
        tagline: 'From an XML file to typed view references.',
        level: 'beginner',
        body: `
<p>A View-based screen starts as an XML layout. Inflation reads that file and builds real <code>View</code> objects, one per tag, nested like the XML.</p>
<p>View binding generates a class per layout, such as <code>ActivityProfileBinding</code>, with one typed field per view that has an id. <code>binding.title</code> is already a <code>TextView</code>. A wrong id fails at compile time. <code>findViewById</code> finds views by id at runtime, so a wrong id or a wrong type only shows up as a crash.</p>
<p><code>ConstraintLayout</code> places each child with constraints to the parent or to siblings. Every view needs at least one horizontal and one vertical constraint. Without them it jumps to the top left corner at runtime.</p>`,
        code: `// build.gradle.kts
android {
    buildFeatures { viewBinding = true }
}

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.title.text = getString(R.string.greeting, "Ada")  // TextView, no cast
        binding.follow.setOnClickListener { viewModel.follow() }   // Button
    }
}

// The old way: a lookup by id at runtime, typed by hand
val title = findViewById<TextView>(R.id.title)`,
        remember: 'Inflation turns XML into View objects. View binding gives you typed, null-safe fields for them.',
        terms: [
          { term: 'Layout inflation', def: 'Reading an XML layout and creating the View objects it describes.' },
          { term: 'View binding', def: 'A build feature that generates a class per layout with a typed field for every view that has an id.' },
          { term: 'findViewById', def: 'A runtime lookup that returns the view with a given id, or null, cast to whatever type you ask for.' },
          { term: 'ConstraintLayout', def: 'A ViewGroup that positions each child with constraints relative to the parent or to other children.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Inflate the layout through its binding and show it.', code: 'binding = ActivityProfileBinding.[[inflate]](layoutInflater)\nsetContentView(binding.[[root]])', why: '<code>inflate</code> builds the view tree. <code>root</code> is the top view of that tree, which you pass to <code>setContentView</code>.' },
          { type: 'bug', prompt: 'The screen shows up empty and the text never changes. Tap the line.', code: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    binding = ActivityProfileBinding.inflate(layoutInflater)\n    setContentView(R.layout.activity_profile)\n    binding.title.text = "Hi, Ada"\n}', bug: 3, fix: '    setContentView(binding.root)', why: 'Passing the layout id inflates a second, separate tree. The binding points at the first tree, which is never shown.' },
        ],
        quiz: [
          { q: 'You rename the id <code>title</code> to <code>heading</code> in XML. What happens to <code>binding.title</code>?', options: ['It returns null at runtime', 'The code stops compiling', 'It still finds the old view'], a: 1, why: 'The binding class is regenerated with a <code>heading</code> field, so <code>title</code> no longer exists.' },
          { q: '<code>findViewById&lt;Button&gt;(R.id.title)</code> where title is a TextView. What happens?', options: ['A compile error', 'A ClassCastException at runtime', 'It returns null'], a: 1, why: '<code>findViewById</code> trusts the type you ask for. The wrong type only fails when the code runs.' },
          { q: 'A Button in a ConstraintLayout has no vertical constraint. Where does it show at runtime?', options: ['Centered', 'At the top', 'Below the previous view'], a: 1, why: 'Unconstrained views go to the top left. The editor warns about it, but the build still succeeds.' },
          { q: '<code>layout-sw600dp/activity_main.xml</code> has a <code>@+id/detail</code> pane. <code>layout/activity_main.xml</code> does not. What type is <code>binding.detail</code>?', options: ['<code>FrameLayout?</code>: null on phones, a pane on tablets', '<code>FrameLayout</code>, and it crashes on phones', 'It is not generated, because the layouts differ'], a: 0, why: 'View binding makes one class for all versions of a layout. A view missing from some versions becomes nullable, so the compiler makes you handle both.' },
        ],
        deeper: xmlDepth.deeper,
        underHood: xmlDepth.underHood,
        mistakes: xmlDepth.mistakes,
        visual(el) {
          const xml = [
            '<ConstraintLayout ...>',
            '  <TextView android:id="@+id/title"',
            '      app:layout_constraintTop_toTopOf="parent" />',
            '  <Button android:id="@+id/follow"',
            '      app:layout_constraintTop_toBottomOf="@id/title" />',
            '</ConstraintLayout>',
          ];
          const lines = xml.map(t => h('div', { class: 'branch' }, t));
          const code = h('div', { class: 'when' }, lines);
          const screen = h('div', { class: 'vw-screen' });
          const titleText = h('span', {}, 'Profile');
          const title = h('div', { class: 'vw-v' }, titleText, h('span', { class: 'vw-idtag' }, 'binding.title'));
          const btn = h('div', { class: 'vw-v vw-btn' }, 'Follow', h('span', { class: 'vw-idtag' }, 'binding.follow'));
          const root = h('div', { class: 'vw-root' });
          const o = out('Inflated. Try the binding, then findViewById.');
          let busy = false, n = 0;
          const names = ['Hi, Ada', 'Hi, Grace', 'Hi, Linus'];
          const sw = toggle('vw-xml-constraint', 'Button has <code>constraintTop_toBottomOf</code>', true, () => {
            const on = sw.input.checked;
            btn.classList.toggle('vw-loose', !on);
            lines[4].classList.toggle('cut', !on);
            say(o, on ? '<span class="good">constrained:</span> follow sits below title'
              : '<span class="bad">no vertical constraint:</span> follow jumps to the top left at runtime');
          });
          screen.append(root, title, btn);
          async function inflate() {
            if (busy) return; busy = true;
            screen.replaceChildren();
            for (let i = 0; i < lines.length; i++) {
              lines[i].classList.add('scan');
              if (i === 0) screen.append(root);
              if (i === 1) { title.classList.add('drop-in'); screen.append(title); }
              if (i === 3) { btn.classList.add('drop-in'); screen.append(btn); }
              await sleep(360);
              lines[i].classList.remove('scan');
              if (!el.isConnected) return;
            }
            title.classList.remove('drop-in'); btn.classList.remove('drop-in');
            say(o, '<span class="good">inflated:</span> 3 View objects. The binding holds typed fields for the 2 with ids.');
            busy = false;
          }
          el.append(
            h('div', { class: 'vw-split' }, h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'activity_profile.xml'), code), screen),
            sw.el,
            h('div', { class: 'controls' },
              cmd('ActivityProfileBinding.inflate(layoutInflater)', inflate),
              cmd('binding.title.text = name', () => {
                if (busy) return;
                titleText.textContent = names[n++ % names.length]; replay(title, 'pop');
                say(o, `<span class="good">ok:</span> binding.title is a TextView, no cast, no null check`);
              }),
              cmd('binding.subtitle.text = name', () => { if (busy) return; replay(code, 'shake'); say(o, '<span class="bad">compile error:</span> Unresolved reference \'subtitle\' <span class="muted">// caught before the app runs</span>'); }),
              cmd('findViewById<Button>(R.id.title)', () => { if (busy) return; replay(title, 'shake'); say(o, '<span class="bad">crash:</span> ClassCastException: TextView cannot be cast to Button'); })),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'passes',
        title: 'The View lifecycle: measure, layout, draw',
        tagline: 'Three passes turn a tree of views into pixels.',
        level: 'intermediate',
        body: `
<p>Each frame that needs work goes through three passes, top down through the tree. <b>Measure</b> asks every view how big it wants to be, inside the limits its parent passes in a <code>MeasureSpec</code>. <b>Layout</b> gives every view its final position. <b>Draw</b> paints each view onto the canvas.</p>
<p>You never call these passes yourself. You ask for them. <code>requestLayout()</code> says the size or position may change, so the next frame runs measure and layout again. <code>invalidate()</code> says only the look changed, so the next frame redraws that view and skips measure and layout.</p>
<p>Pick the cheaper call when you can. A color change is a redraw. New text in a <code>wrap_content</code> view may change its size, so it needs a layout pass.</p>`,
        code: `class BadgeView @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null,
) : View(context, attrs) {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { textSize = 36f }
    private val pad = 24

    var count = 0
        set(value) {
            val sizeChanges = value.toString().length != field.toString().length
            field = value
            if (sizeChanges) requestLayout()   // measure + layout, then draw
            invalidate()                       // draw the new number
        }

    var badgeColor = Color.RED
        set(value) { field = value; invalidate() }   // looks only: draw pass

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = paint.measureText(count.toString()).toInt() + pad * 2
        val h = (paint.textSize + pad).toInt()
        setMeasuredDimension(resolveSize(w, widthMeasureSpec), resolveSize(h, heightMeasureSpec))
    }

    override fun onDraw(canvas: Canvas) {
        paint.color = badgeColor
        canvas.drawRoundRect(0f, 0f, width.toFloat(), height.toFloat(), height / 2f, height / 2f, paint)
        paint.color = Color.WHITE
        canvas.drawText(count.toString(), pad.toFloat(), height - pad / 2f, paint)
    }
}`,
        remember: 'Size or position changed: requestLayout(). Only the look changed: invalidate().',
        terms: [
          { term: 'Measure pass', def: 'The pass where each view reports the size it wants, within the constraints from its parent.' },
          { term: 'MeasureSpec', def: 'A packed int a parent passes to a child in onMeasure, holding a size and a mode: EXACTLY, AT_MOST or UNSPECIFIED.' },
          { term: 'requestLayout', def: 'Marks a view as needing a new measure and layout pass on the next frame.' },
          { term: 'invalidate', def: 'Marks a view as needing a redraw on the next frame, without measuring or laying it out again.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A new count can change the badge width. A new color can’t.', code: 'var count = 0\n    set(value) { field = value; [[requestLayout]](); invalidate() }\n\nvar badgeColor = Color.RED\n    set(value) { field = value; [[invalidate]]() }', why: 'A size change needs measure and layout. A color change only needs a redraw.' },
          { type: 'bug', prompt: 'This view works but stutters while it animates, and Lint flags one line. Tap it.', code: 'override fun onDraw(canvas: Canvas) {\n    val paint = Paint(Paint.ANTI_ALIAS_FLAG)\n    paint.color = badgeColor\n    canvas.drawCircle(width / 2f, height / 2f, width / 2f, paint)\n}', bug: 1, fix: '    // move the Paint to a property: private val paint = Paint(Paint.ANTI_ALIAS_FLAG)', why: '<code>onDraw</code> can run every frame. Allocating there creates garbage on each frame and triggers GC pauses.' },
        ],
        quiz: [
          { q: 'A custom view changes only its fill color. Which call fits?', options: ['<code>requestLayout()</code>', '<code>invalidate()</code>', 'Both'], a: 1, why: 'The size and position stay the same, so a redraw is enough.' },
          { q: 'In which order do the passes run?', options: ['Draw, measure, layout', 'Measure, layout, draw', 'Layout, measure, draw'], a: 1, why: 'Sizes come first, positions use those sizes, and drawing uses the final bounds.' },
          { q: 'Inside <code>onMeasure</code>, what must a view always do?', options: ['Call <code>invalidate()</code>', 'Call <code>setMeasuredDimension()</code>', 'Call <code>requestLayout()</code>'], a: 1, why: 'Without it the framework throws an IllegalStateException. Calling requestLayout from a pass would also loop.' },
          { q: 'A custom view’s text changes from "9" to "10" in a <code>wrap_content</code> parent. Which calls are needed?', options: ['Only <code>invalidate()</code>', '<code>requestLayout()</code> and <code>invalidate()</code>, because the width may change', 'Only <code>requestLayout()</code>, which never redraws'], a: 1, why: 'A longer number changes the measured width, so measure and layout must run, and the new digits must be drawn.' },
          { q: 'A child has <code>layout_width="wrap_content"</code> inside a horizontal ScrollView. Which MeasureSpec mode does it get for width?', options: ['<code>UNSPECIFIED</code>, so it can be as wide as it wants', '<code>EXACTLY</code> the screen width', '<code>AT_MOST</code> the screen width'], a: 0, why: 'A horizontal scroll container has no width limit, so it passes UNSPECIFIED. <code>resolveSize</code> then gives the child its wanted size, and the content scrolls.' },
        ],
        deeper: passesDepth.deeper,
        underHood: passesDepth.underHood,
        mistakes: passesDepth.mistakes,
        visual(el) {
          let count = 8, color = 0, busy = false;
          const colors = ['RED', 'GREEN', 'ORANGE'];
          const phases = ['measure', 'layout', 'draw'].map(p => h('span', { class: 'vw-phase' }, p));
          const mk = (name, kid) => {
            const note = h('span', { class: 'vw-note' }, 'ready');
            return { el: h('div', { class: 'vw-node' + (kid ? ' vw-kid' : '') }, h('span', {}, name), note), note };
          };
          const nodes = [mk('LinearLayout', false), mk('TextView title', true), mk('BadgeView badge', true)];
          const badge = h('span', { class: 'vw-badge c0' }, String(count));
          const width = () => 60 + 18 * (String(count).length - 1);
          const tally = { measure: stat('measure', 0), layout: stat('layout', 0), draw: stat('draw', 0) };
          const n = { measure: 0, layout: 0, draw: 0 };
          const o = out('Change the badge. Watch which passes run.');
          const notes = {
            measure: i => ['onMeasure: 240 × 52', 'onMeasure: 150 × 24', `onMeasure: ${width()} × 30`][i],
            layout: i => ['onLayout: 0, 0', 'onLayout: 12, 14', `onLayout: ${168 - width() + 60}, 11`][i],
            draw: () => 'onDraw',
          };
          async function frame(plan, apply) {
            busy = true;
            nodes.forEach(x => { x.note.textContent = 'skipped'; });
            for (const [p, which] of plan) {
              const pill = phases[['measure', 'layout', 'draw'].indexOf(p)];
              pill.classList.add('on');
              for (const i of which) {
                nodes[i].el.classList.add('on'); nodes[i].note.textContent = notes[p](i);
                if (p === 'draw' && i === 2) apply();
                await sleep(300);
                if (!el.isConnected) return;
                nodes[i].el.classList.remove('on');
              }
              n[p]++; tally[p].set(n[p]);
              pill.classList.remove('on');
            }
            busy = false;
          }
          async function inc() {
            if (busy) return;
            const before = String(count).length;
            count = count >= 999 ? 8 : count + 1;
            const grows = String(count).length !== before;
            if (grows) {
              say(o, `count = ${count}: digit count changed, size may change <span class="muted">// requestLayout() + invalidate()</span>`);
              await frame([['measure', [0, 1, 2]], ['layout', [0, 1, 2]], ['draw', [0, 2]]], () => { badge.textContent = String(count); replay(badge, 'pop'); });
            } else {
              say(o, `count = ${count}: same width <span class="muted">// invalidate() only</span>`);
              await frame([['draw', [2]]], () => { badge.textContent = String(count); replay(badge, 'pop'); });
            }
          }
          async function recolor() {
            if (busy) return;
            color = (color + 1) % colors.length;
            say(o, `badgeColor = Color.${colors[color]} <span class="muted">// invalidate(): draw only</span>`);
            await frame([['draw', [2]]], () => { badge.className = `vw-badge c${color}`; });
          }
          async function jump() {
            if (busy) return;
            count = count < 100 ? 128 : 8;
            say(o, `count = ${count} <span class="muted">// size changes: requestLayout() + invalidate()</span>`);
            await frame([['measure', [0, 1, 2]], ['layout', [0, 1, 2]], ['draw', [0, 2]]], () => { badge.textContent = String(count); replay(badge, 'pop'); });
          }
          el.append(
            h('div', { class: 'vw-phases' }, h('span', { class: 'vw-label' }, 'Next frame'), phases),
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-tree' }, nodes.map(x => x.el)),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), h('div', { class: 'vw-prev' }, h('b', {}, 'Inbox'), badge))),
            h('div', { class: 'controls' },
              cmd('badge.count++', inc),
              cmd('badge.count = 128', jump),
              cmd('badge.badgeColor = next', recolor)),
            h('div', { class: 'vw-stats' }, tally.measure, tally.layout, tally.draw),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'recycler',
        title: 'RecyclerView',
        tagline: 'A long list built from a handful of reused views.',
        level: 'intermediate',
        body: `
<p>A list of 10,000 rows can’t have 10,000 views. <code>RecyclerView</code> creates only enough rows to fill the screen, plus a few spare. When a row scrolls off, its view goes into a pool. The next row that scrolls in takes a view from that pool and gets new data.</p>
<p>Three parts split the work. The <code>Adapter</code> creates row views in <code>onCreateViewHolder</code> and fills them in <code>onBindViewHolder</code>. A <code>ViewHolder</code> wraps one row view and keeps references to its children. The <code>LayoutManager</code> decides where rows go: a vertical list, a grid, or a staggered grid.</p>
<p>Because views get reused, <code>onBindViewHolder</code> must set every field every time. If you show a star only when an item is starred and never hide it, a recycled row keeps the star from its last item.</p>`,
        code: `class ContactAdapter(
    private val items: List<Contact>,
    private val onClick: (Contact) -> Unit,
) : RecyclerView.Adapter<ContactAdapter.Holder>() {

    class Holder(val binding: ItemContactBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): Holder {
        val inflater = LayoutInflater.from(parent.context)
        return Holder(ItemContactBinding.inflate(inflater, parent, false))
    }

    override fun onBindViewHolder(holder: Holder, position: Int) {
        val item = items[position]
        holder.binding.name.text = item.name
        holder.binding.star.isVisible = item.starred      // set it both ways
        holder.binding.root.setOnClickListener { onClick(item) }
    }

    override fun getItemCount() = items.size
}

binding.list.layoutManager = LinearLayoutManager(requireContext())
binding.list.adapter = ContactAdapter(contacts) { openDetail(it.id) }`,
        remember: 'RecyclerView creates a screenful of rows and rebinds them. Bind every field, every time.',
        terms: [
          { term: 'ViewHolder', def: 'An object that wraps one row view of a RecyclerView and holds references to its child views.' },
          { term: 'onBindViewHolder', def: 'The adapter callback that fills an existing row view with the data for a given position.' },
          { term: 'LayoutManager', def: 'The RecyclerView component that measures and positions rows and decides which ones to recycle.' },
          { term: 'RecycledViewPool', def: 'The store of detached ViewHolders, kept by view type, that RecyclerView reuses before creating new ones.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Inflate a row without attaching it, and report how many rows there are.', code: 'override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =\n    Holder(ItemContactBinding.inflate(LayoutInflater.from(parent.context), parent, [[false]]))\n\noverride fun getItemCount() = items.[[size]]', why: 'RecyclerView attaches rows itself, so <code>attachToParent</code> must be false. Passing <code>parent</code> still gives the row the right layout params.' },
          { type: 'bug', prompt: 'After scrolling, stars show up on contacts that are not starred. Tap the line.', code: 'override fun onBindViewHolder(holder: Holder, position: Int) {\n    val item = items[position]\n    holder.binding.name.text = item.name\n    if (item.starred) holder.binding.star.isVisible = true\n}', bug: 3, fix: '    holder.binding.star.isVisible = item.starred', why: 'A recycled row still shows its last item’s star. Setting the field only one way never clears it.' },
        ],
        quiz: [
          { q: 'You scroll a 5,000 item list to the end. Roughly how often did <code>onCreateViewHolder</code> run?', options: ['About 5,000 times', 'About as many rows as fit on screen, plus a few', 'Once'], a: 1, why: 'After the first screenful, rows come from the pool and only <code>onBindViewHolder</code> runs.' },
          { q: 'Which part decides that rows form a 2 column grid?', options: ['The Adapter', 'The ViewHolder', 'The LayoutManager'], a: 2, why: '<code>GridLayoutManager(context, 2)</code> places the rows. The adapter stays the same.' },
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>override fun onBindViewHolder(holder: Holder, position: Int) {\n    val item = items[position]\n    holder.binding.name.text = item.name\n    if (item.starred) holder.binding.star.isVisible = true\n}</code></pre>', options: ['<code>if (item.starred) holder.binding.star.isVisible = true</code>: a recycled row keeps the star from its last item', '<code>val item = items[position]</code>: use <code>getItem()</code>', '<code>holder.binding.name.text = item.name</code>: text must be set in onCreateViewHolder'], a: 0, why: 'Views are reused, so every field must be set both ways on each bind: <code>star.isVisible = item.starred</code>.' },
          { q: 'You scroll one row off screen and straight back. Does <code>onBindViewHolder</code> run for it?', options: ['Yes, every row that appears is bound again', 'Only if the pool is empty', 'No: it waits in the small view cache, still bound to its position'], a: 2, why: 'Rows that just left go to a cache (two holders by default) before the pool. A cached holder for the same position comes back without a bind.' },
        ],
        deeper: [
          {
            title: 'A small cache sits in front of the pool',
            body: `<p>A row that just scrolled off does not go straight to the pool. It first waits in a small cache, two holders by default, still bound to its position. Scroll back and that row returns as it was, with no <code>onBindViewHolder</code> at all.</p>
<p>When the cache is full, its oldest holder moves to the pool and forgets its data. Anything from the pool must be bound again. That is why small back-and-forth scrolls are cheap.</p>`,
            visual(el) {
              const names = ['Ada', 'Alan', 'Barbara', 'Dennis', 'Edsger', 'Frances', 'Grace', 'Hedy', 'Ivan', 'Joan', 'Ken', 'Linus', 'Margaret', 'Niklaus', 'Radia', 'Shafi'];
              const SHOW = 4, CACHE = 2;
              let top = 0, created = 0, binds = 0, hits = 0, busy = false;
              const rows = [], cache = [], pool = [];
              const rv = h('div', { class: 'vw-rv', style: 'height:220px', 'aria-label': 'RecyclerView viewport' });
              const cacheEl = h('div', { class: 'vw-pool' }), poolEl = h('div', { class: 'vw-pool' });
              const sC = stat('created', 0), sB = stat('bound', 0), sH = stat('cache hits', 0);
              const o = out();
              const chip = vh => h('span', { class: `vw-vh c${(vh - 1) % 6}` }, `VH${vh}`);
              const rowEl = (vh, pos) => h('div', { class: 'vw-row' }, chip(vh), h('span', {}, names[pos]), h('span', { class: 'vw-pos' }, `pos ${pos}`));
              const paint = () => {
                cacheEl.replaceChildren(...(cache.length ? cache.map(c => h('span', { class: 'vw-ent' }, chip(c.vh), `pos ${c.pos}`)) : [h('span', { class: 'vw-note' }, 'empty')]));
                poolEl.replaceChildren(...(pool.length ? pool.map(chip) : [h('span', { class: 'vw-note' }, 'empty')]));
              };
              function holder(pos) {
                const i = cache.findIndex(c => c.pos === pos);
                if (i >= 0) { const [c] = cache.splice(i, 1); sH.set(++hits); return { vh: c.vh, msg: `<span class="good">cache hit</span> VH${c.vh} still shows pos ${pos}. No bind.` }; }
                if (pool.length) { const vh = pool.shift(); sB.set(++binds); return { vh, msg: `from the pool: VH${vh}, onBindViewHolder(VH${vh}, ${pos})` }; }
                const vh = ++created; sC.set(created); sB.set(++binds);
                return { vh, msg: `<span class="bad">created</span> VH${vh}, then bound to pos ${pos}` };
              }
              function park(r) {
                cache.push({ vh: r.vh, pos: r.pos });
                if (cache.length > CACHE) { const old = cache.shift(); pool.push(old.vh); return ` Cache full: VH${old.vh} moves to the pool and forgets pos ${old.pos}.`; }
                return '';
              }
              for (let p = 0; p < SHOW; p++) { const vh = ++created; binds++; const r = { pos: p, vh, el: rowEl(vh, p) }; rows.push(r); rv.append(r.el); }
              sC.set(created); sB.set(binds); paint();
              say(o, 'Scroll down a few rows, then back up.');
              async function scroll(dir) {
                if (busy) return;
                const pos = dir > 0 ? top + SHOW : top - 1;
                if (pos < 0 || pos >= names.length) { replay(rv, 'shake'); say(o, '<span class="muted">// end of list</span>'); return; }
                busy = true;
                const { vh, msg } = holder(pos);
                const r = { pos, vh, el: rowEl(vh, pos) };
                r.el.classList.add('drop-in');
                if (dir > 0) { rows.push(r); rv.append(r.el); } else { rows.unshift(r); rv.prepend(r.el); }
                paint(); say(o, msg);
                await sleep(320);
                const gone = dir > 0 ? rows.shift() : rows.pop();
                gone.el.classList.add('leave');
                await sleep(400);
                if (!el.isConnected) return;
                gone.el.remove();
                const extra = park(gone); paint();
                if (extra) o.append(h('span', {}, extra));
                top += dir;
                busy = false;
              }
              el.append(
                h('div', { class: 'vw-split' },
                  h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), rv),
                  h('div', { class: 'vw-col' },
                    h('span', { class: 'vw-label' }, 'View cache: bound, by position'), cacheEl,
                    h('span', { class: 'vw-label' }, 'Pool: needs a bind'), poolEl)),
                h('div', { class: 'controls' }, act('Scroll down 1 row', () => scroll(1)), act('Scroll up 1 row', () => scroll(-1))),
                h('div', { class: 'vw-stats' }, sC, sB, sH),
                o);
            },
          },
          {
            title: 'Rebind only what changed with payloads',
            body: `<p>A star toggle does not need the whole row rebound. Pass a payload with the change, and the three-argument <code>onBindViewHolder</code> receives it. Update just the star there, and fall back to a full bind when <code>payloads</code> is empty.</p>
<p>A payload also changes the animation. The default item animator reuses the same holder instead of cross-fading a copy, so the row doesn’t flicker. With <code>ListAdapter</code>, return the payload from <code>getChangePayload</code> in your <code>ItemCallback</code>.</p>`,
            code: `object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
    override fun getChangePayload(oldItem: Contact, newItem: Contact): Any? =
        if (oldItem.copy(starred = newItem.starred) == newItem) STAR_CHANGED else null
}

override fun onBindViewHolder(holder: Holder, position: Int, payloads: MutableList<Any>) {
    if (STAR_CHANGED in payloads) holder.binding.star.isVisible = getItem(position).starred
    else super.onBindViewHolder(holder, position, payloads)   // full bind
}`,
          },
        ],
        underHood: {
          body: `<p>When the LayoutManager needs a row, it calls <code>Recycler.getViewForPosition</code>. The Recycler looks in a fixed order: the scrap of rows detached during this layout pass, then the view cache by position, then by stable id if the adapter has stable ids, then an optional <code>ViewCacheExtension</code>, then the <code>RecycledViewPool</code> by view type. Only if all of those miss does it call <code>onCreateViewHolder</code>. A holder from the scrap or cache that is still valid skips the bind.</p>
<p>The pool keeps at most 5 holders per type by default. On top of this, a <code>GapWorker</code> prefetches the next rows in the idle time between frames on the UI thread, while the RenderThread draws, and parks them in the cache. So a fling often finds its next row already created and bound.</p>`,
          code: `binding.list.setItemViewCacheSize(4)                                 // default 2
binding.list.recycledViewPool.setMaxRecycledViews(TYPE_PERSON, 10)    // default 5 per type`,
        },
        mistakes: [
          {
            title: 'Capturing the bind-time position in a click listener',
            bad: `override fun onBindViewHolder(holder: Holder, position: Int) {
    holder.itemView.setOnClickListener { onClick(items[position]) }
}`,
            good: `// in onCreateViewHolder, once per holder
holder.itemView.setOnClickListener {
    val pos = holder.bindingAdapterPosition
    if (pos != RecyclerView.NO_POSITION) onClick(items[pos])
}`,
            why: 'An insert above shifts rows without rebinding them, so the captured <code>position</code> points at the wrong item. Ask the holder at click time.',
          },
          {
            title: 'Leaving a CheckBox listener attached while you set its state',
            bad: `val item = items[position]
holder.binding.done.isChecked = item.done
holder.binding.done.setOnCheckedChangeListener { _, c -> onToggle(item.id, c) }`,
            good: `val item = items[position]
holder.binding.done.setOnCheckedChangeListener(null)
holder.binding.done.isChecked = item.done
holder.binding.done.setOnCheckedChangeListener { _, c -> onToggle(item.id, c) }`,
            why: 'A recycled holder still has the previous item’s listener. Setting <code>isChecked</code> fires it and toggles that other item.',
          },
          {
            title: 'A new inner adapter on every bind',
            bad: `override fun onBindViewHolder(holder: RowHolder, position: Int) {
    holder.binding.tags.adapter = TagAdapter(items[position].tags)
}`,
            good: `private val tagPool = RecyclerView.RecycledViewPool()
// onCreateViewHolder: tags.setRecycledViewPool(tagPool) and set one TagAdapter
override fun onBindViewHolder(holder: RowHolder, position: Int) {
    (holder.binding.tags.adapter as TagAdapter).submitList(items[position].tags)
}`,
            why: 'Swapping the adapter throws away the inner rows, and each inner list has its own pool by default. Share one pool and keep one adapter per row.',
          },
        ],
        visual(el) {
          const names = ['Ada', 'Alan', 'Barbara', 'Dennis', 'Edsger', 'Frances', 'Grace', 'Hedy', 'Ivan', 'Joan', 'Ken', 'Linus', 'Margaret', 'Niklaus', 'Radia', 'Shafi', 'Tim', 'Yukihiro'];
          const N = 40, SHOW = 5;
          let top = 0, created = 0, binds = 0, busy = false;
          const rv = h('div', { class: 'vw-rv', 'aria-label': 'RecyclerView viewport' });
          const pool = h('div', { class: 'vw-pool' });
          const sCreate = stat('onCreateViewHolder', 0), sBind = stat('onBindViewHolder', 0), sItems = stat('items', N);
          const o = out();
          const rows = []; // { pos, vh, el }
          const poolList = [];
          const vhChip = vh => h('span', { class: `vw-vh c${(vh - 1) % 6}` }, `VH${vh}`);
          const rowEl = (vh, pos) => h('div', { class: 'vw-row' }, vhChip(vh), h('span', {}, names[pos % names.length]), h('span', { class: 'vw-pos' }, `pos ${pos}`));
          const paintPool = () => { pool.replaceChildren(...(poolList.length ? poolList.map(vhChip) : [h('span', { class: 'vw-note' }, 'empty')])); };
          function holderFor(pos) {
            let vh, msg;
            if (poolList.length) {
              vh = poolList.shift(); paintPool();
              msg = `<span class="good">reused</span> VH${vh} from the pool`;
            } else {
              vh = ++created; sCreate.set(created);
              msg = `<span class="bad">created</span> VH${vh}: pool was empty`;
            }
            binds++; sBind.set(binds);
            return { vh, msg: `${msg}, onBindViewHolder(VH${vh}, ${pos})` };
          }
          for (let p = 0; p < SHOW; p++) { const vh = ++created; binds++; const r = { pos: p, vh, el: rowEl(vh, p) }; rows.push(r); rv.append(r.el); }
          sCreate.set(created); sBind.set(binds); paintPool();
          say(o, `${SHOW} rows created to fill the screen. Scroll down.`);
          async function scroll(dir) {
            if (busy) return false;
            const pos = dir > 0 ? top + SHOW : top - 1;
            if (pos < 0 || pos >= N) { replay(rv, 'shake'); say(o, `<span class="muted">// end of list</span>`); return false; }
            busy = true;
            const { vh, msg } = holderFor(pos);
            const r = { pos, vh, el: rowEl(vh, pos) };
            r.el.classList.add('drop-in');
            if (dir > 0) { rows.push(r); rv.append(r.el); } else { rows.unshift(r); rv.prepend(r.el); }
            say(o, msg);
            await sleep(320);
            const gone = dir > 0 ? rows.shift() : rows.pop();
            gone.el.classList.add('leave');
            await sleep(420);
            gone.el.remove();
            poolList.push(gone.vh); paintPool(); replay(pool.lastElementChild, 'pop');
            top += dir;
            busy = false;
            return el.isConnected;
          }
          let flinging = false;
          async function fling() {
            if (flinging || busy) return; flinging = true;
            for (let i = 0; i < 8; i++) { if (!(await scroll(1))) break; await sleep(80); }
            flinging = false;
          }
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), rv),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecycledViewPool'), pool,
                h('p', { class: 'tip' }, 'Rows that scroll off wait here. The next row that scrolls in takes one and gets rebound.'))),
            h('div', { class: 'controls' },
              act('Scroll down 1 row', () => scroll(1)),
              act('Scroll up 1 row', () => scroll(-1)),
              act('Fling 8 rows', fling)),
            h('div', { class: 'vw-stats' }, sCreate, sBind, sItems),
            o);
        },
      },

      // 3b ────────────────────────────────────────────
      {
        id: 'view-types',
        title: 'Multiple view types in one list',
        tagline: 'Headers, rows and ads in one RecyclerView, each with its own layout and pool.',
        level: 'intermediate',
        body: `
<p>Real lists mix rows that look different: a letter header above a group of contacts, a banner every twenty items, a footer. Each layout is a <em>view type</em>. Override <code>getItemViewType(position)</code> to return an Int for each position. RecyclerView passes that Int to <code>onCreateViewHolder</code>, so you inflate the right layout.</p>
<p>The pool keeps a separate bin per view type. A header holder is never handed to a contact row, so <code>onBindViewHolder</code> can trust the holder’s class. If the contact bin is empty, a new contact holder is created, even when header holders are waiting.</p>
<p>A sealed class for the rows keeps this tidy. Each subclass maps to one view type, and <code>when</code> makes the compiler check that every kind is handled.</p>`,
        code: `sealed interface Row {
    data class Header(val letter: Char) : Row
    data class Person(val contact: Contact) : Row
}

class ContactsAdapter(private val rows: List<Row>) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    class HeaderHolder(val b: ItemHeaderBinding) : RecyclerView.ViewHolder(b.root)
    class PersonHolder(val b: ItemContactBinding) : RecyclerView.ViewHolder(b.root)

    override fun getItemViewType(position: Int) = when (rows[position]) {
        is Row.Header -> R.layout.item_header      // a layout id is a unique Int
        is Row.Person -> R.layout.item_contact
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            R.layout.item_header -> HeaderHolder(ItemHeaderBinding.inflate(inflater, parent, false))
            else -> PersonHolder(ItemContactBinding.inflate(inflater, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val row = rows[position]) {
            is Row.Header -> (holder as HeaderHolder).b.letter.text = row.letter.toString()
            is Row.Person -> (holder as PersonHolder).b.name.text = row.contact.name
        }
    }

    override fun getItemCount() = rows.size
}`,
        remember: 'One layout, one view type. The pool keeps a bin per type, so the holder always matches the row.',
        terms: [
          { term: 'View type', def: 'The Int that getItemViewType returns for a position. RecyclerView creates, pools and reuses holders separately for each one.' },
          { term: 'getItemViewType', def: 'The adapter method that tells RecyclerView which kind of row sits at a position. The default returns 0 for every row.' },
          { term: 'ConcatAdapter', def: 'An adapter that shows several adapters one after another in a single RecyclerView, such as a header adapter, a list adapter and a footer adapter.' },
          { term: 'SpanSizeLookup', def: 'A GridLayoutManager callback that says how many columns a position takes, used to make headers span the full width.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Report the row kind, then inflate by it.', code: 'override fun [[getItemViewType]](position: Int) = when (rows[position]) {\n    is Row.Header -> R.layout.item_header\n    is Row.Person -> R.layout.item_contact\n}\n\noverride fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = when ([[viewType]]) {\n    R.layout.item_header -> HeaderHolder.create(parent)\n    else -> PersonHolder.create(parent)\n}', why: 'RecyclerView asks for the type of each position, then hands that same Int to <code>onCreateViewHolder</code> when it has no holder of that type to reuse.' },
          { type: 'bug', prompt: 'Scrolling is slow and onCreateViewHolder runs for every single row. Tap the line.', code: 'override fun getItemViewType(position: Int): Int =\n    position\n\noverride fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =\n    if (viewType == TYPE_HEADER) HeaderHolder.create(parent) else PersonHolder.create(parent)', bug: 1, fix: '    if (rows[position] is Row.Header) TYPE_HEADER else TYPE_PERSON', why: 'Returning the position makes every row its own type with its own empty bin, so nothing is ever reused. Return one value per kind of layout.' },
        ],
        quiz: [
          { q: 'A contact row scrolls in. The pool has 3 header holders and 0 contact holders. What happens?', options: ['A new contact holder is created', 'A header holder is rebound as a contact', 'The row waits for a contact holder'], a: 0, why: 'Holders are pooled per view type. A header holder never fits a contact row.' },
          { q: 'What does the default <code>getItemViewType</code> return?', options: ['0 for every position', 'The position', 'The layout id of the row'], a: 0, why: 'By default the adapter assumes one view type. Override it once rows differ.' },
          { q: 'Why model rows as a sealed interface?', options: ['<code>when</code> must handle every kind, so a new row type can’t be forgotten', 'RecyclerView requires it', 'It makes DiffUtil faster'], a: 0, why: 'An exhaustive <code>when</code> turns a missing branch into a compile error.' },
          { q: 'A grid with <code>GridLayoutManager(context, 3)</code> shows letter headers squeezed into one cell. What fixes it?', options: ['A separate view type for headers is enough', 'Setting <code>layout_width="match_parent"</code> on the header layout', 'A <code>SpanSizeLookup</code> that returns <code>spanCount</code> for header positions'], a: 2, why: 'Each position takes one column by default. The span size lookup tells the grid how many columns a position spans.' },
        ],
        deeper: [
          {
            title: 'One adapter per section: ConcatAdapter',
            body: `<p>A header and a footer don’t have to live inside your list adapter. <code>ConcatAdapter</code> shows several adapters one after another in one RecyclerView. Each adapter keeps its own simple code, and by default each one gets its own view types and pools, so they can’t clash.</p>`,
            code: `val header = ProfileHeaderAdapter(user)
val posts = PostsAdapter()                 // any adapter, e.g. a ListAdapter
val footer = LoadingFooterAdapter()

binding.list.adapter = ConcatAdapter(header, posts, footer)

posts.submitList(newPosts)                 // each part updates on its own`,
          },
          {
            title: 'Full-width headers in a grid',
            body: `<p>In a <code>GridLayoutManager</code>, every row takes one column by default, so a header squeezes into a single cell. A <code>SpanSizeLookup</code> returns how many columns a position takes. Give headers the full span count.</p>`,
            code: `val grid = GridLayoutManager(requireContext(), 3)
grid.spanSizeLookup = object : GridLayoutManager.SpanSizeLookup() {
    override fun getSpanSize(position: Int) =
        if (adapter.getItemViewType(position) == R.layout.item_header) grid.spanCount else 1
}
binding.photos.layoutManager = grid`,
          },
          {
            title: 'With ListAdapter, diff each kind on its own terms',
            body: `<p><code>ListAdapter</code>, from the next lesson, works the same way with several types. The <code>DiffUtil.ItemCallback</code> just has to compare rows of the same kind: two headers by their letter, two people by their id. A header and a person are never the same item.</p>`,
            code: `object RowDiff : DiffUtil.ItemCallback<Row>() {
    override fun areItemsTheSame(old: Row, new: Row) = when {
        old is Row.Header && new is Row.Header -> old.letter == new.letter
        old is Row.Person && new is Row.Person -> old.contact.id == new.contact.id
        else -> false
    }
    override fun areContentsTheSame(old: Row, new: Row) = old == new
}`,
          },
        ],
        mistakes: [
          {
            title: 'Casting every holder to one class',
            bad: `override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
    val h = holder as PersonHolder              // crashes on the first header
    h.b.name.text = (rows[position] as Row.Person).contact.name
}`,
            good: `override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
    when (holder) {
        is HeaderHolder -> holder.bind(rows[position] as Row.Header)
        is PersonHolder -> holder.bind(rows[position] as Row.Person)
    }
}`,
            why: 'Holders come in several classes now. Branch on the holder, or on the row kind, so each one binds its own layout.',
          },
          {
            title: 'Hand-picked numbers that collide',
            bad: `const val TYPE_HEADER = 1
const val TYPE_PERSON = 1   // copy-paste: same number`,
            good: `override fun getItemViewType(position: Int) = when (rows[position]) {
    is Row.Header -> R.layout.item_header
    is Row.Person -> R.layout.item_contact
}`,
            why: 'Two kinds with the same number share one pool, and a header holder gets bound as a person. Layout ids are unique by construction.',
          },
        ],
        visual(el) {
          const DATA = ['A', 'Ada', 'Alan', 'B', 'Barbara', 'D', 'Dennis', 'E', 'Edsger', 'F', 'Frances', 'G', 'Grace', 'H', 'Hedy', 'I', 'Ivan', 'J', 'Joan', 'K', 'Ken'];
          const type = pos => (DATA[pos].length === 1 ? 'header' : 'person');
          const SHOW = 5;
          let top = 0, busy = false;
          const made = { header: 0, person: 0 }, pools = { header: [], person: [] };
          const rv = h('div', { class: 'vw-rv', 'aria-label': 'RecyclerView viewport' });
          const poolEls = { header: h('div', { class: 'vw-pool' }), person: h('div', { class: 'vw-pool' }) };
          const sH = stat('header holders', 0), sP = stat('person holders', 0);
          const o = out();
          const rows = [];
          const chip = vh => h('span', { class: 'vw-vh ' + (vh[0] === 'H' ? 'c1' : 'c0') }, vh);
          const rowEl = (vh, pos) => type(pos) === 'header'
            ? h('div', { class: 'vw-row vw-hdr' }, chip(vh), h('span', {}, DATA[pos]))
            : h('div', { class: 'vw-row' }, chip(vh), h('span', {}, DATA[pos]), h('span', { class: 'vw-pos' }, `pos ${pos}`));
          const paintPools = () => Object.entries(poolEls).forEach(([k, p]) => p.replaceChildren(h('span', { class: 'vw-label' }, k), ...(pools[k].length ? pools[k].map(chip) : [h('span', { class: 'vw-note' }, 'empty')])));
          function holder(pos) {
            const k = type(pos);
            if (pools[k].length) { const vh = pools[k].shift(); paintPools(); return { vh, msg: `<span class="good">reused</span> ${vh} from the ${k} pool` }; }
            const vh = (k === 'header' ? 'H' : 'P') + (++made[k]);
            (k === 'header' ? sH : sP).set(made[k]);
            const other = k === 'header' ? 'person' : 'header';
            return { vh, msg: `<span class="bad">created</span> ${vh}: the ${k} pool was empty` + (pools[other].length ? ` <span class="muted">// ${pools[other].length} ${other} holder${pools[other].length > 1 ? 's' : ''} can’t help</span>` : '') };
          }
          for (let p = 0; p < SHOW; p++) { const { vh } = holder(p); const r = { pos: p, vh, el: rowEl(vh, p) }; rows.push(r); rv.append(r.el); }
          paintPools();
          say(o, 'Headers and people use different layouts. Scroll down.');
          async function scroll() {
            if (busy) return false;
            const pos = top + SHOW;
            if (pos >= DATA.length) { replay(rv, 'shake'); say(o, '<span class="muted">// end of list</span>'); return false; }
            busy = true;
            const { vh, msg } = holder(pos);
            const r = { pos, vh, el: rowEl(vh, pos) };
            r.el.classList.add('drop-in'); rows.push(r); rv.append(r.el);
            say(o, `${msg}, bind ${type(pos)} "${DATA[pos]}"`);
            await sleep(320);
            const gone = rows.shift(); gone.el.classList.add('leave');
            await sleep(400);
            gone.el.remove();
            pools[type(gone.pos)].push(gone.vh); paintPools();
            top++;
            busy = false;
            return el.isConnected;
          }
          let multi = false;
          async function three() {
            if (multi || busy) return; multi = true;
            for (let i = 0; i < 3; i++) { if (!(await scroll())) break; await sleep(60); }
            multi = false;
          }
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'On screen'), rv),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecycledViewPool, one bin per type'), h('div', { class: 'vw-pools' }, poolEls.header, poolEls.person))),
            h('div', { class: 'controls' }, act('Scroll down 1 row', scroll), act('Scroll down 3 rows', three)),
            h('div', { class: 'vw-stats' }, sH, sP),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'diff',
        title: 'ListAdapter and DiffUtil',
        tagline: 'Hand over a new list, get only the changes.',
        level: 'intermediate',
        body: `
<p><code>notifyDataSetChanged()</code> tells RecyclerView that everything may have changed. It rebinds every visible row and plays no animations. <code>ListAdapter</code> does better: you call <code>submitList(newList)</code> and it diffs the old list against the new one on a background thread, then sends only the inserts, removes, moves and changes.</p>
<p>The diff needs two answers from a <code>DiffUtil.ItemCallback</code>. <code>areItemsTheSame</code> asks whether two entries are the same thing, usually by comparing ids. <code>areContentsTheSame</code> asks whether that thing looks different now. If you compare whole objects in the first one, an edited item looks like a removal plus an insert.</p>
<p>Always submit a new list. If you change the list you already submitted and pass the same instance again, ListAdapter sees the same reference and does nothing.</p>`,
        code: `data class Contact(val id: Long, val name: String, val starred: Boolean)

object ContactDiff : DiffUtil.ItemCallback<Contact>() {
    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
}

class ContactAdapter : ListAdapter<Contact, ContactAdapter.Holder>(ContactDiff) {
    class Holder(val binding: ItemContactBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        Holder(ItemContactBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: Holder, position: Int) {
        val item = getItem(position)
        holder.binding.name.text = item.name
        holder.binding.star.isVisible = item.starred
    }
}

// In the Fragment
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.contacts.collect { adapter.submitList(it) }
    }
}`,
        remember: 'Same id means same item. Same fields means same contents. Submit a new list every time.',
        terms: [
          { term: 'submitList', def: 'The ListAdapter method that takes a new list, diffs it against the current one and dispatches only the changes.' },
          { term: 'areItemsTheSame', def: 'The DiffUtil callback that decides whether two entries represent the same item, usually by id.' },
          { term: 'areContentsTheSame', def: 'The DiffUtil callback that decides whether an item that stayed has visible changes and needs a rebind.' },
          { term: 'notifyDataSetChanged', def: 'An adapter call that marks every item as changed, rebinding all rows with no item animations.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Match items by id, and compare contents with data class equality.', code: 'object ContactDiff : DiffUtil.ItemCallback<Contact>() {\n    override fun areItemsTheSame(oldItem: Contact, newItem: Contact) =\n        oldItem.[[id]] == newItem.[[id]]\n    override fun areContentsTheSame(oldItem: Contact, newItem: Contact) =\n        oldItem [[==]] newItem\n}', why: 'The id says which item it is. Data class <code>==</code> compares every field, so any visible change triggers a rebind.' },
          { type: 'bug', prompt: 'Tapping Add puts the contact in the list, but the screen never updates. Tap the line.', code: 'private val cache = mutableListOf<Contact>()\n\nfun add(contact: Contact) {\n    cache.add(contact)\n    adapter.submitList(cache)\n}', bug: 4, fix: '    adapter.submitList(cache.toList())', why: 'The adapter already holds this exact list instance. Submitting the same reference is ignored, so pass a fresh copy.' },
        ],
        quiz: [
          { q: 'A contact changes name but keeps its id. What does DiffUtil report?', options: ['A remove and an insert', 'A change at that position', 'Nothing'], a: 1, why: 'Same id, so it is the same item. Different contents, so that one row is rebound.' },
          { q: 'Where does ListAdapter compute the diff by default?', options: ['On the main thread', 'On a background thread', 'During onDraw'], a: 1, why: 'AsyncListDiffer runs the diff on a background executor and applies the result on the main thread.' },
          { q: 'Why avoid <code>notifyDataSetChanged()</code> for a single edit?', options: ['It crashes on large lists', 'It rebinds every row and skips the animations', 'It is not allowed with ListAdapter'], a: 1, why: 'RecyclerView can’t tell what changed, so it treats everything as changed.' },
          { q: 'You call <code>adapter.submitList(newList)</code> and on the next line <code>list.scrollToPosition(0)</code>. The new top item lands just above the screen. Why?', options: ['submitList diffs on a background thread and returns before the list changes', 'scrollToPosition only works with notifyDataSetChanged', 'ListAdapter ignores scroll calls while animating'], a: 0, why: 'The rows change later on the main thread. Pass a commit callback: <code>submitList(newList) { list.scrollToPosition(0) }</code>.' },
        ],
        deeper: diffDepth.deeper,
        underHood: diffDepth.underHood,
        mistakes: diffDepth.mistakes,
        visual(el) {
          let nextId = 5, byId = true, busy = false, binds = 4;
          const extras = ['Margaret', 'Barbara', 'Ken', 'Hedy', 'Radia', 'Dennis'];
          let list = [{ id: 1, name: 'Ada', star: false }, { id: 2, name: 'Grace', star: true }, { id: 3, name: 'Linus', star: false }, { id: 4, name: 'Alan', star: false }];
          const box = h('div', { class: 'vw-list' });
          const cb = h('div', { class: 'kt' });
          const sBind = stat('rows rebound', binds);
          const o = out('Submit a new list. Only the changes animate.');
          const keyOf = x => byId ? String(x.id) : `${x.id}|${x.name}|${x.star}`;
          const row = (x, cls) => h('div', { class: 'vw-row' + (cls ? ' ' + cls : '') },
            h('span', { class: 'vw-tag' }, `id ${x.id}`), h('span', {}, x.name),
            x.star ? h('span', { class: 'vw-tag vw-star' }, 'starred') : null);
          const paintCb = () => { cb.innerHTML = hl(byId ? 'areItemsTheSame = old.id == new.id' : 'areItemsTheSame = old == new  // whole object'); };
          box.append(...list.map(x => row(x)));
          paintCb();
          function lcs(a, b) {
            const m = a.map(() => b.map(() => 0));
            for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
              m[i][j] = a[i] === b[j] ? 1 + ((m[i + 1] || [])[j + 1] || 0) : Math.max((m[i + 1] || [])[j] || 0, m[i][j + 1] || 0);
            const keep = new Set(); let i = 0, j = 0;
            while (i < a.length && j < b.length) {
              if (a[i] === b[j]) { keep.add(a[i]); i++; j++; }
              else if (((m[i + 1] || [])[j] || 0) >= (m[i][j + 1] || 0)) i++; else j++;
            }
            return keep;
          }
          async function submit(next) {
            if (busy) return; busy = true;
            const oldK = list.map(keyOf), newK = next.map(keyOf);
            const removed = list.filter(x => !newK.includes(keyOf(x)));
            const inserted = new Set(next.filter(x => !oldK.includes(keyOf(x))).map(keyOf));
            const common = newK.filter(k => oldK.includes(k));
            const stay = lcs(oldK.filter(k => common.includes(k)), common);
            const oldBy = new Map(list.map(x => [keyOf(x), x]));
            const changed = new Set(next.filter(x => oldBy.has(keyOf(x)) && JSON.stringify(oldBy.get(keyOf(x))) !== JSON.stringify(x)).map(keyOf));
            const moved = new Set(common.filter(k => !stay.has(k)));
            [...box.children].forEach((r, i) => { if (removed.includes(list[i])) r.classList.add('leave'); });
            if (removed.length) await sleep(430);
            if (!el.isConnected) return;
            box.replaceChildren(...next.map(x => {
              const k = keyOf(x);
              if (inserted.has(k)) return row(x, 'vw-ins drop-in');
              if (changed.has(k)) return row(x, 'vw-chg pop');
              if (moved.has(k)) return row(x, 'vw-mov flip');
              return row(x);
            }));
            list = next;
            binds += inserted.size + changed.size; sBind.set(binds);
            const parts = [[inserted.size, 'insert'], [removed.length, 'remove'], [moved.size, 'move'], [changed.size, 'change']].filter(([c]) => c).map(([c, w]) => `${c} ${w}`);
            say(o, `DiffUtil: ${parts.join(', ') || 'no changes'} <span class="muted">// ${inserted.size + changed.size} row${inserted.size + changed.size === 1 ? '' : 's'} bound</span>` +
              (!byId && changed.size === 0 && removed.length && inserted.size ? ' <span class="bad">an edit became remove + insert</span>' : ''));
            await sleep(450);
            busy = false;
          }
          const sw = toggle('vw-diff-byid', 'Match items by <code>id</code>', true, () => {
            byId = sw.input.checked; paintCb(); replay(cb, 'pop-soft');
            say(o, byId ? 'Items match by id. An edit is a change.' : '<span class="bad">Items match by whole object.</span> Now try Star one.');
          });
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'RecyclerView'), box),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'ItemCallback'), cb, sw.el,
                h('p', { class: 'tip' }, 'Green: inserted. Orange: changed. Teal: moved.'))),
            h('div', { class: 'controls' },
              act('Add one', () => { if (list.length >= 7) { replay(box, 'shake'); return; } const next = list.slice(); next.splice(1, 0, { id: nextId, name: extras[(nextId - 5) % extras.length], star: false }); nextId++; submit(next); }),
              act('Remove one', () => { if (list.length <= 1) { replay(box, 'shake'); return; } submit(list.slice(0, -1)); }),
              act('Star one', () => { const i = Math.min(1, list.length - 1); submit(list.map((x, j) => j === i ? { ...x, star: !x.star } : x)); }),
              act('Move last to top', () => { if (list.length < 2) return; submit([list[list.length - 1], ...list.slice(0, -1)]); }),
              cmd('notifyDataSetChanged()', () => {
                if (busy) return;
                [...box.children].forEach(r => { r.className = 'vw-row'; replay(r, 'vw-all'); });
                binds += list.length; sBind.set(binds);
                say(o, `<span class="bad">all ${list.length} rows rebound</span> <span class="muted">// no item animations</span>`);
              })),
            h('div', { class: 'vw-stats' }, sBind),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'fragments',
        title: 'Fragments and their two lifecycles',
        tagline: 'The Fragment outlives its view.',
        level: 'advanced',
        body: `
<p>A Fragment has two lifecycles. The Fragment object lives from <code>onCreate</code> to <code>onDestroy</code>. Its view lives from <code>onCreateView</code> to <code>onDestroyView</code>. When you replace a Fragment and add the transaction to the back stack, its view is destroyed but the Fragment stays. Press Back and it builds a brand new view.</p>
<p>So anything that touches views belongs to the view lifecycle. Observe with <code>viewLifecycleOwner</code>, launch with <code>viewLifecycleOwner.lifecycleScope</code>, and set the binding to null in <code>onDestroyView</code>. If you observe with <code>this</code>, every return from the back stack adds another observer, and the old ones hold on to dead views.</p>
<p>The <code>FragmentManager</code> runs transactions and keeps the back stack. Writing those transactions by hand gets messy fast. The Navigation component puts destinations and arguments in one graph and handles the back stack for you.</p>`,
        code: `class ProfileFragment : Fragment(R.layout.fragment_profile) {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ProfileViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentProfileBinding.bind(view)
        viewModel.user.observe(viewLifecycleOwner) { binding.name.text = it.name }
        binding.open.setOnClickListener { openDetail() }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null            // the view is gone, the Fragment is not
    }

    // By hand, with FragmentManager
    private fun openDetail() = parentFragmentManager.commit {
        setReorderingAllowed(true)
        replace<DetailFragment>(R.id.container)
        addToBackStack("detail")
    }
}

// With Navigation and a type-safe route
@Serializable data class Detail(val userId: Long)
findNavController().navigate(Detail(userId = 42))`,
        remember: 'A Fragment can outlive its view. Tie view work to viewLifecycleOwner and clear the binding in onDestroyView.',
        terms: [
          { term: 'onDestroyView', def: 'The Fragment callback where its view is torn down, for example when it goes onto the back stack, while the Fragment object stays alive.' },
          { term: 'FragmentManager', def: 'The class that adds, replaces and removes Fragments in transactions and keeps their back stack.' },
          { term: 'addToBackStack', def: 'A FragmentTransaction call that records the transaction so pressing Back reverses it.' },
          { term: 'Navigation component', def: 'A Jetpack library that describes destinations in a graph and runs Fragment transactions and the back stack for you.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Observe on the view lifecycle and drop the binding when the view goes away.', code: 'viewModel.user.observe([[viewLifecycleOwner]]) { binding.name.text = it.name }\n\noverride fun onDestroyView() {\n    super.onDestroyView()\n    _binding = [[null]]\n}', why: 'The observer stops with the view, and the Fragment stops holding a view tree it no longer shows.' },
          { type: 'bug', prompt: 'LeakCanary reports a leaked view tree every time this Fragment sits on the back stack. Tap the line.', code: 'private var _binding: FragmentProfileBinding? = null\nprivate val binding get() = _binding!!\n\noverride fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n    _binding = FragmentProfileBinding.bind(view)\n}\n\noverride fun onDestroy() { super.onDestroy(); _binding = null }', bug: 7, fix: 'override fun onDestroyView() { super.onDestroyView(); _binding = null }', why: 'On the back stack the view is destroyed but <code>onDestroy</code> does not run, so the binding keeps the whole old view tree alive.' },
        ],
        quiz: [
          { q: 'Fragment A is replaced by B with <code>addToBackStack</code>. What happens to A?', options: ['A is destroyed completely', 'A’s view is destroyed, A stays created', 'Nothing, A stays resumed under B'], a: 1, why: 'A gets <code>onDestroyView</code> but not <code>onDestroy</code>. Back recreates its view.' },
          { q: 'A Fragment observes LiveData with <code>this</code> in <code>onViewCreated</code>. The user goes to B and back twice. How many observers now?', options: ['1', '2', '3'], a: 2, why: 'The Fragment never reached DESTROYED, so each new view adds one more observer.' },
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>override fun onViewCreated(view: View, s: Bundle?) {\n    _binding = FragmentProfileBinding.bind(view)\n    lifecycleScope.launch {\n        binding.name.text = repo.load().name\n    }\n}</code></pre>', options: ['<code>_binding = FragmentProfileBinding.bind(view)</code>: use inflate', '<code>lifecycleScope.launch {</code>: use <code>viewLifecycleOwner.lifecycleScope</code>, which is cancelled with the view', '<code>binding.name.text = …</code>: views can only be set in onCreateView'], a: 1, why: 'If the view is destroyed before load() returns, the Fragment scope is still alive and <code>binding</code> throws. The view scope stops with the view.' },
          { q: 'A list and a detail Fragment in the same Activity must share the selected item. Which ViewModel delegate fits?', options: ['<code>by activityViewModels()</code> in both', '<code>by viewModels()</code> in both', '<code>by viewModels()</code> in the list and pass the ViewModel to the detail’s constructor'], a: 0, why: 'viewModels() gives each Fragment its own instance. activityViewModels() scopes it to the Activity, so both get the same one.' },
          { q: '<code>class DetailFragment(private val userId: Long) : Fragment()</code>. The user rotates the phone. What happens?', options: ['The userId is kept by the FragmentManager', 'The Fragment is recreated with userId 0', 'A crash with <code>Fragment.InstantiationException</code>, because the default factory needs a no-argument constructor'], a: 2, why: 'The FragmentManager rebuilds Fragments by reflection through the no-argument constructor. Pass inputs in <code>arguments</code>, which are saved for you.' },
        ],
        deeper: [
          {
            title: 'Rotation and process death rebuild the Fragment too',
            body: `<p>The back stack destroys only the view. A configuration change goes further: the Activity is recreated, and its FragmentManager creates brand new Fragment objects for every Fragment it had. Their ViewModels survive. After process death even the ViewModels are new, and only the <code>arguments</code> Bundle and the saved state come back.</p>
<p>So a field you set on the Fragment by hand, or a constructor parameter, is gone after rotation. Put inputs in <code>arguments</code> and screen state in a ViewModel with a <code>SavedStateHandle</code>.</p>`,
            visual(el) {
              const nt = t => `<span class="muted">// ${t}</span>`;
              const addr = () => '@' + (0x1000 + Math.floor(Math.random() * 0xefff)).toString(16);
              const PARTS = [
                { k: 'frag', name: 'ProfileFragment' },
                { k: 'view', name: 'its View' },
                { k: 'vm', name: 'ProfileViewModel' },
                { k: 'args', name: 'arguments', fixed: 'userId = 42' },
              ];
              const PLAN = {
                back: { label: 'go to B, then press Back', fresh: ['view'], tail: 'Only the view was rebuilt. The Fragment and its fields stayed.' },
                rot: { label: 'rotate', fresh: ['frag', 'view'], tail: 'New Fragment and view. The ViewModel came from the store, the arguments from the saved Bundle.' },
                death: { label: 'process death, then return', fresh: ['frag', 'view', 'vm'], tail: 'Everything in memory is new. The arguments and saved state came back from the Bundle.' },
              };
              let busy = false;
              const o = out('Pick an event. Orange means a new object, teal means the same one.');
              const cards = PARTS.map(p => {
                const val = h('span', { class: 'obj-addr' }, p.fixed || addr());
                const t = h('span', { class: 'vw-tag' }, 'live');
                const box = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, p.name), val, t);
                return Object.assign(p, { val, t, box });
              });
              async function run(key) {
                if (busy) return; busy = true;
                const plan = PLAN[key];
                say(o, nt(plan.label));
                for (const c of cards) {
                  const fresh = plan.fresh.includes(c.k);
                  if (fresh) { c.val.textContent = addr(); c.box.className = 'obj vw-new'; replay(c.box, 'drop-in'); c.t.textContent = 'new'; c.t.className = 'vw-tag vw-tnew'; }
                  else { c.box.className = 'obj vw-kept'; replay(c.box, 'pop'); c.t.textContent = c.k === 'args' && key !== 'back' ? 'restored' : 'same'; c.t.className = 'vw-tag vw-tkept'; }
                  await sleep(300);
                  if (!el.isConnected) return;
                }
                o.append(h('div', { class: 'line drop-in' }, plan.tail));
                busy = false;
              }
              el.append(
                h('div', { class: 'vw-objs' }, cards.map(c => c.box)),
                h('div', { class: 'controls' }, Object.entries(PLAN).map(([k, p]) => act(p.label, () => run(k)))),
                o);
            },
          },
          {
            title: 'Pick the ViewModel’s scope on purpose',
            body: `<p><code>by viewModels()</code> scopes the ViewModel to this Fragment. <code>by activityViewModels()</code> scopes it to the Activity, so every Fragment in it gets the same instance. With Navigation, <code>navGraphViewModels(R.id.checkout)</code> shares one across the screens of a nested graph and clears it when the user leaves that graph.</p>
<p>A list and a detail screen that share a selection need the wider scope. Try both: select an item, then open the detail.</p>`,
            code: `class ListFragment : Fragment() {
    private val shared: SelectionViewModel by activityViewModels()
    fun onPick(id: Long) = shared.select(id)
}

class DetailFragment : Fragment() {
    private val shared: SelectionViewModel by activityViewModels()   // same instance
}`,
            visual(el) {
              const nt = t => `<span class="muted">// ${t}</span>`;
              let scope = 'activity', busy = false, picked = null, onDetail = false;
              const stores = { act: h('div', { class: 'vw-store' }), list: h('div', { class: 'vw-store' }), detail: h('div', { class: 'vw-store' }) };
              const LABEL = { act: 'Activity store', list: 'ListFragment store', detail: 'DetailFragment store' };
              const o = out();
              const vm = (sel, who) => h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, 'SelectionViewModel'), h('span', { class: 'field' }, 'selected = ', h('b', {}, sel || 'null')), h('span', { class: 'obj-addr' }, who));
              const where = () => (scope === 'activity' ? 'act' : 'list');
              function paint() {
                Object.entries(stores).forEach(([k, s]) => s.replaceChildren(h('span', { class: 'vw-label' }, LABEL[k])));
                stores[where()].append(vm(picked, scope === 'activity' ? 'used by List and Detail' : 'used by ListFragment'));
                if (onDetail && scope === 'fragment') stores.detail.append(vm(null, 'a second instance'));
              }
              const btns = {};
              const setScope = v => {
                if (busy) return;
                scope = v; picked = null; onDetail = false;
                Object.entries(btns).forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === v)));
                paint();
                say(o, v === 'activity' ? 'Both Fragments use by activityViewModels().' : 'Both Fragments use by viewModels().');
              };
              btns.activity = cmd('by activityViewModels()', () => setScope('activity'));
              btns.fragment = cmd('by viewModels()', () => setScope('fragment'));
              function pick() {
                if (busy) return;
                picked = 'Grace'; onDetail = false; paint();
                say(o, `${hl('shared.select("Grace")')}  ${nt(`stored in the ${LABEL[where()]}`)}`);
              }
              async function open() {
                if (busy) return; busy = true;
                onDetail = true; paint();
                say(o, nt('DetailFragment asks for SelectionViewModel'));
                await sleep(450);
                if (!el.isConnected) return;
                if (scope === 'activity') { replay(stores.act, 'pop'); o.append(h('div', { class: 'line drop-in', html: picked ? '<span class="good">same instance:</span> Detail shows Grace' : 'same instance, but nothing is selected yet' })); }
                else { replay(stores.detail, 'shake'); o.append(h('div', { class: 'line drop-in', html: '<span class="bad">new instance:</span> selected = null. Detail has nothing to show.' })); }
                busy = false;
              }
              setScope('activity');
              say(o, 'Select Grace in the list, then open the detail.');
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'vw-label' }, 'scope'), btns.activity, btns.fragment),
                h('div', { class: 'vw-stores' }, stores.act, stores.list, stores.detail),
                h('div', { class: 'controls' }, cmd('ListFragment: select("Grace")', pick), cmd('navigate to DetailFragment', open)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>When the Activity saves state, the FragmentManager writes a record for each Fragment: its class name, its <code>arguments</code>, its saved state and its place in the back stack. After a rotation or process death, it rebuilds each one from that record through a <code>FragmentFactory</code>. The default factory calls the no-argument constructor by reflection, which is why a Fragment must have one unless you install your own factory.</p>
<p><code>viewLifecycleOwner</code> is a separate object, created fresh in each <code>onCreateView</code> and moved to DESTROYED just before <code>onDestroyView</code>. LiveData and <code>repeatOnLifecycle</code> tied to it stop at that moment, which is what keeps them off dead views.</p>`,
          code: `class AppFragmentFactory(private val repo: ProfileRepository) : FragmentFactory() {
    override fun instantiate(classLoader: ClassLoader, className: String): Fragment =
        when (loadFragmentClass(classLoader, className)) {
            ProfileFragment::class.java -> ProfileFragment(repo)
            else -> super.instantiate(classLoader, className)
        }
}

// Set it before super.onCreate, so restored Fragments use it too
supportFragmentManager.fragmentFactory = AppFragmentFactory(repo)
super.onCreate(savedInstanceState)`,
        },
        mistakes: [
          {
            title: 'Adding the first Fragment on every onCreate',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    supportFragmentManager.commit { add<HomeFragment>(R.id.container) }
}`,
            good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (savedInstanceState == null) {
        supportFragmentManager.commit { add<HomeFragment>(R.id.container) }
    }
}`,
            why: 'After rotation the FragmentManager has already restored HomeFragment. Adding it again stacks a second copy on top.',
          },
          {
            title: 'Passing data through the constructor',
            bad: `class DetailFragment(private val userId: Long) : Fragment()

replace(R.id.container, DetailFragment(42))`,
            good: `class DetailFragment : Fragment() {
    private val userId get() = requireArguments().getLong("userId")
}
replace<DetailFragment>(R.id.container, args = bundleOf("userId" to 42L))`,
            why: 'On recreation the default factory calls a no-argument constructor, so this crashes with <code>Fragment.InstantiationException</code>. Arguments are saved and restored for you.',
          },
          {
            title: 'Touching views from the Fragment’s own scope',
            bad: `lifecycleScope.launch {
    val user = repo.load()
    binding.name.text = user.name
}`,
            good: `viewLifecycleOwner.lifecycleScope.launch {
    val user = repo.load()
    binding.name.text = user.name
}`,
            why: 'If the user moves on before <code>load()</code> returns, the view is gone but the Fragment scope is still alive, and <code>binding</code> throws. The view scope is cancelled with the view.',
          },
        ],
        visual(el) {
          let useView = true, busy = false, onB = false, observers = 1, aViewGen = 1;
          const log = h('div', { class: 'vw-log', 'aria-live': 'polite' });
          const line = (txt, cls) => { log.append(h('div', { class: cls ? cls + ' drop-in' : 'drop-in' }, txt)); while (log.children.length > 7) log.firstElementChild.remove(); };
          const chip = (txt, cls) => h('span', { class: 'vw-s' + (cls ? ' ' + cls : '') }, txt);
          const stack = h('div', { class: 'vw-stack' });
          const sObs = stat('observers on A', observers);
          const sGen = stat('A views built', aViewGen);
          const frag = (name, fState, vState, top, extra) => h('div', { class: 'vw-frag' + (top ? ' vw-top' : '') },
            h('span', { class: 'vw-frag-name' }, name),
            h('div', { class: 'vw-st' }, 'Fragment', chip(fState[0], fState[1])),
            h('div', { class: 'vw-st' }, 'View', chip(vState[0], vState[1])),
            extra || null);
          function paint() {
            const a = onB
              ? frag('ProfileFragment (A)', ['CREATED', 'vw-mid'], ['destroyed', 'vw-dead'], false)
              : frag('ProfileFragment (A)', ['RESUMED'], [`RESUMED #${aViewGen}`], true);
            const kids = onB ? [frag('DetailFragment (B)', ['RESUMED'], ['RESUMED'], true, h('span', { class: 'vw-note' }, 'top of the back stack')), a] : [a];
            stack.replaceChildren(...kids);
            sObs.classList.toggle('vw-bad', observers > 1 || (onB && !useView && observers > 0));
          }
          paint();
          line('A.onCreate', 'muted'); line('A.onCreateView, onViewCreated #1'); line('  observe(' + (useView ? 'viewLifecycleOwner' : 'this') + ')', 'good');
          async function step(lines) {
            for (const [t, c, fn] of lines) { line(t, c); if (fn) fn(); await sleep(330); if (!el.isConnected) return false; }
            return true;
          }
          async function push() {
            if (busy) return; if (onB) { replay(stack, 'shake'); line('B is already on top', 'muted'); return; }
            busy = true; log.replaceChildren();
            const ok = await step([
              ['replace(B).addToBackStack("detail")', 'muted'],
              ['B.onCreate, onCreateView, onViewCreated'],
              ['A.onPause, onStop'],
              ['A.onDestroyView', 'bad', () => { onB = true; if (useView) observers = 0; sObs.set(observers); paint(); }],
              [useView ? '  observer removed with the view' : `  ${observers} observer${observers > 1 ? 's' : ''} still attached to a dead view`, useView ? 'good' : 'bad'],
              ['B.onStart, onResume'],
            ]);
            if (ok) busy = false;
          }
          async function pop() {
            if (busy) return; if (!onB) { replay(stack, 'shake'); line('back stack is empty: Back would finish the Activity', 'muted'); return; }
            busy = true; log.replaceChildren();
            const ok = await step([
              ['popBackStack()', 'muted'],
              ['B.onPause, onStop'],
              [`A.onCreateView, onViewCreated #${aViewGen + 1}`, null, () => { aViewGen++; sGen.set(aViewGen); }],
              [`  observe(${useView ? 'viewLifecycleOwner' : 'this'})`, useView ? 'good' : 'bad', () => { observers++; sObs.set(observers); }],
              ['B.onDestroyView, onDestroy', null, () => { onB = false; paint(); }],
              ['A.onStart, onResume'],
              [useView ? `  1 observer, on view #${aViewGen}` : `  ${observers} observers: each update runs ${observers} times`, useView ? 'good' : 'bad'],
            ]);
            if (ok) busy = false;
          }
          const sw = toggle('vw-frag-owner', 'Observe with <code>viewLifecycleOwner</code>', true, () => {
            useView = sw.input.checked;
            line(`next observe uses ${useView ? 'viewLifecycleOwner' : 'this (the Fragment)'}`, useView ? 'good' : 'bad');
          });
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Back stack, top first'), stack),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Callbacks'), log)),
            sw.el,
            h('div', { class: 'controls' },
              cmd('commit { replace<DetailFragment>(...) }', push),
              cmd('popBackStack()', pop)),
            h('div', { class: 'vw-stats' }, sObs, sGen),
            h('p', { class: 'tip' }, 'Turn the switch off, then go to B and back a few times.'));
        },
      },

      // 5b ────────────────────────────────────────────
      {
        id: 'viewpager',
        title: 'ViewPager2 and FragmentStateAdapter',
        tagline: 'Swipe between Fragment pages, and know which one the user is looking at.',
        level: 'intermediate',
        body: `
<p><code>ViewPager2</code> shows pages the user swipes between, like onboarding screens or tabs of a news app. It is built on RecyclerView, so it takes an adapter. For Fragment pages, extend <code>FragmentStateAdapter</code>: <code>getItemCount()</code> returns the number of pages and <code>createFragment(position)</code> builds a new Fragment for a page.</p>
<p>The adapter keeps pages near the current one alive, so a swipe shows them at once. It caps every page except the current one at STARTED with <code>setMaxLifecycle</code>. Only the page on screen reaches RESUMED. Pages that scroll far away are removed, and their state is saved for when they come back.</p>
<p>So <code>onResume</code> means “this page is the one on screen”. Log a page view or start a video there, not in <code>onViewCreated</code>, which also runs for neighbour pages nobody has seen yet. For new Compose screens, <code>HorizontalPager</code> does the same job.</p>`,
        code: `class ArticlePagerFragment : Fragment(R.layout.fragment_pager) {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val pager = view.findViewById<ViewPager2>(R.id.pager)
        pager.adapter = ArticlePagerAdapter(this, ids = listOf(101L, 102L, 103L))
    }
}

class ArticlePagerAdapter(fragment: Fragment, private val ids: List<Long>) : FragmentStateAdapter(fragment) {
    override fun getItemCount() = ids.size
    override fun createFragment(position: Int): Fragment =
        ArticlePageFragment().apply { arguments = bundleOf("id" to ids[position]) }
}

class ArticlePageFragment : Fragment(R.layout.page_article) {
    override fun onResume() {
        super.onResume()
        analytics.pageView(requireArguments().getLong("id"))   // only the visible page
    }
}`,
        remember: 'Neighbour pages stop at STARTED. Only the page on screen is RESUMED, so react to “visible” in onResume.',
        terms: [
          { term: 'ViewPager2', def: 'A RecyclerView-based widget that shows pages the user swipes between, horizontally or vertically.' },
          { term: 'FragmentStateAdapter', def: 'The ViewPager2 adapter for Fragment pages. It creates them with createFragment, saves the state of removed pages and caps off-screen pages at STARTED.' },
          { term: 'setMaxLifecycle', def: 'A FragmentTransaction call that keeps a Fragment from moving past a given state, such as STARTED.' },
          { term: 'TabLayoutMediator', def: 'A Material class that links a TabLayout to a ViewPager2, so tabs and pages stay in sync.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete the adapter and link the tabs.', code: 'class PagesAdapter(f: Fragment) : FragmentStateAdapter(f) {\n    override fun getItemCount() = 3\n    override fun [[createFragment]](position: Int): Fragment = PageFragment.newInstance(position)\n}\n\nTabLayoutMediator(tabs, pager) { tab, position ->\n    tab.text = titles[position]\n}.[[attach]]()', why: '<code>createFragment</code> must build a new Fragment for the page. The mediator does nothing until you call <code>attach()</code>.' },
          { type: 'bug', prompt: 'This pager lives inside a Fragment. After a few trips through the back stack, pages show stale or duplicate content. Tap the line.', code: 'class HomeFragment : Fragment(R.layout.fragment_home) {\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        val pager = view.findViewById<ViewPager2>(R.id.pager)\n        pager.adapter = object : FragmentStateAdapter(requireActivity()) {\n            override fun getItemCount() = 3\n            override fun createFragment(position: Int) = PageFragment.newInstance(position)\n        }\n    }\n}', bug: 3, fix: '        pager.adapter = object : FragmentStateAdapter(this) {', why: 'With the Activity, the pages go into the Activity’s FragmentManager and outlive this Fragment’s view. Pass the Fragment, so pages are child Fragments tied to it.' },
        ],
        quiz: [
          { q: 'Page 2 of 5 is on screen. Pages 1 and 3 are alive next to it. Which page is RESUMED?', options: ['Only page 2', 'Pages 1, 2 and 3', 'None, ViewPager2 pages stay at STARTED'], a: 0, why: 'FragmentStateAdapter keeps the current page RESUMED and caps the others at STARTED.' },
          { q: 'Where should a page record a “page viewed” event?', options: ['<code>onResume</code>', '<code>onViewCreated</code>', '<code>createFragment</code>'], a: 0, why: '<code>onViewCreated</code> also runs for neighbours the user has not seen. <code>onResume</code> runs when the page becomes the current one.' },
          { q: 'Your pages can be added and removed while the pager is shown. What do you override?', options: ['<code>getItemId</code> and <code>containsItem</code>', 'Only <code>getItemCount</code>', '<code>onBindViewHolder</code>'], a: 0, why: 'The defaults only work for collections that never add, move or remove items. Stable ids let the adapter keep the right Fragment for each page.' },
          { q: 'A pager’s pages are topics that the user can add and remove. The adapter uses default ids. What can go wrong?', options: ['Nothing, positions are updated by notifyDataSetChanged', 'A Fragment can show the wrong topic, because pages are matched by position; override <code>getItemId</code> and <code>containsItem</code>', 'Removed pages stay RESUMED'], a: 1, why: 'By default the position is the page id, which only works for fixed collections. Stable ids let the adapter match each Fragment to its topic.' },
        ],
        deeper: [
          {
            title: 'Tabs: TabLayoutMediator',
            body: `<p>A <code>TabLayout</code> above the pager is the usual way to show where you are. <code>TabLayoutMediator</code> links the two: a tap on a tab scrolls the pager, and a swipe selects the tab. You only set each tab’s text or icon. For many tabs, set <code>app:tabMode="scrollable"</code>.</p>`,
            code: `val titles = listOf("Top stories", "Sports", "Business")
TabLayoutMediator(binding.tabs, binding.pager) { tab, position ->
    tab.text = titles[position]
}.attach()`,
          },
          {
            title: 'Pages that change need stable ids',
            body: `<p>By default the adapter uses the position as the page’s id. That only works for collections that never add, move or remove items. Remove page 2 and the Fragment that was page 3 can be shown with the wrong content, because the adapter matches Fragments by id.</p>
<p>Override <code>getItemId</code> to return a stable id for each page, and <code>containsItem</code> to say whether that id still exists. Always override both together.</p>`,
            code: `class TopicsAdapter(f: Fragment) : FragmentStateAdapter(f) {
    var topics: List<Topic> = emptyList()
        set(value) { field = value; notifyDataSetChanged() }

    override fun getItemCount() = topics.size
    override fun getItemId(position: Int) = topics[position].id
    override fun containsItem(itemId: Long) = topics.any { it.id == itemId }
    override fun createFragment(position: Int) = TopicFragment.newInstance(topics[position].id)
}`,
          },
          {
            title: 'React to the page from the host',
            body: `<p>Sometimes the host needs to know the page, not the page itself: to change the toolbar title or show a “Next” button on the last onboarding step. Register an <code>OnPageChangeCallback</code> and use <code>onPageSelected</code>. Unregister it when the view goes away.</p>`,
            code: `private val pageCallback = object : ViewPager2.OnPageChangeCallback() {
    override fun onPageSelected(position: Int) {
        binding.next.text = if (position == lastIndex) "Start" else "Next"
    }
}

override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    binding.pager.registerOnPageChangeCallback(pageCallback)
}

override fun onDestroyView() {
    binding.pager.unregisterOnPageChangeCallback(pageCallback)
    super.onDestroyView()
}`,
          },
        ],
        mistakes: [
          {
            title: 'Logging the page in onViewCreated',
            bad: `override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    analytics.pageView(articleId)   // also runs for the neighbour pages
}`,
            good: `override fun onResume() {
    super.onResume()
    analytics.pageView(articleId)   // only when this page is on screen
}`,
            why: 'The adapter creates neighbour pages before the user swipes to them. Their views exist, but they stay at STARTED. RESUMED is the signal for “visible”.',
          },
          {
            title: 'Keeping Fragment instances in a list',
            bad: `private val pages = listOf(NewsFragment(), SportsFragment())
override fun createFragment(position: Int) = pages[position]`,
            good: `override fun createFragment(position: Int): Fragment = when (position) {
    0 -> NewsFragment()
    else -> SportsFragment()
}`,
            why: 'After a rotation the adapter restores its own Fragments from saved state. Instances you built yourself are not the ones on screen, so calls on them do nothing. Create a new Fragment each time it is asked.',
          },
        ],
        visual(el) {
          const PAGES = ['Top stories', 'Sports', 'Business', 'Tech', 'Culture', 'Weather'];
          let cur = 0, mode = 'resume', busy = false;
          const state = PAGES.map(() => 'none');
          const logged = [];
          const strip = h('div', { class: 'vw-vp-strip' }, PAGES.map((p, i) => h('div', { class: 'vw-vp-page' }, h('b', {}, p), h('span', {}, `page ${i}`))));
          const view = h('div', { class: 'vw-vp-view', role: 'img', 'aria-label': 'ViewPager2 viewport' }, strip);
          const chips = PAGES.map(p => { const st = h('span', { class: 'vw-vp-st' }); return { st, el: h('div', { class: 'vw-vp-chip' }, h('span', { class: 'vw-vp-name' }, p), st) }; });
          const log = h('div', { class: 'vw-vp-log' });
          const o = out();
          const sLog = stat('pageView events', 0);
          const LABEL = { none: 'not created', STARTED: 'STARTED', RESUMED: 'RESUMED', saved: 'removed, state saved' };
          function paintChips() {
            chips.forEach((c, i) => { c.st.textContent = LABEL[state[i]]; c.el.className = 'vw-vp-chip vw-vp-' + state[i].toLowerCase(); });
          }
          function event(i, why) {
            logged.push(PAGES[i]); sLog.set(logged.length);
            log.append(h('div', { class: 'vw-vp-ev drop-in' + (i === cur ? '' : ' vw-vp-wrong') }, `pageView("${PAGES[i]}")`, h('span', { class: 'muted' }, ` // ${why}`)));
            while (log.children.length > 4) log.firstChild.remove();
          }
          function settle(first) {
            const prev = state.slice();
            PAGES.forEach((_, i) => {
              const d = Math.abs(i - cur);
              state[i] = d === 0 ? 'RESUMED' : d === 1 ? 'STARTED' : (prev[i] === 'none' ? 'none' : 'saved');
            });
            PAGES.forEach((_, i) => {
              const born = (prev[i] === 'none' || prev[i] === 'saved') && (state[i] === 'STARTED' || state[i] === 'RESUMED');
              if (mode === 'view' && born) event(i, i === cur ? 'onViewCreated, on screen' : 'onViewCreated, not on screen');
              if (mode === 'resume' && state[i] === 'RESUMED' && prev[i] !== 'RESUMED') event(i, 'onResume');
            });
            strip.style.transform = `translateX(${-cur * 100}%)`;
            paintChips();
            if (!first) chips.forEach((c, i) => { if (prev[i] !== state[i]) replay(c.el, 'pop-soft'); });
          }
          async function swipe(d) {
            if (busy) return;
            const n = cur + d;
            if (n < 0 || n >= PAGES.length) { replay(view, 'shake'); return; }
            busy = true; cur = n; settle(false);
            const wrong = log.querySelectorAll('.vw-vp-wrong').length;
            say(o, `Now on <b>${PAGES[cur]}</b>. ${mode === 'view' && wrong ? `<span class="bad">${wrong} event${wrong > 1 ? 's' : ''} for pages nobody saw</span>` : '<span class="good">one event per page actually shown</span>'}`);
            await sleep(380); busy = false;
          }
          const btns = [cmd('analytics in onViewCreated()', () => setMode('view')), cmd('analytics in onResume()', () => setMode('resume'))];
          function setMode(m) {
            if (busy) return;
            mode = m; cur = 0; state.fill('none'); logged.length = 0; sLog.set(0); log.replaceChildren();
            btns.forEach((b, i) => b.setAttribute('aria-pressed', String((i === 0) === (m === 'view'))));
            settle(true);
            say(o, m === 'view' ? 'The pager opened. Page 0 and its neighbour were created. Swipe right.' : 'Logging in onResume. Swipe and compare the event list.');
          }
          setMode('view');
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'ViewPager2'), view, h('div', { class: 'controls' }, act('‹ Swipe back', () => swipe(-1)), act('Swipe next ›', () => swipe(1)))),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Fragment state per page'), h('div', { class: 'vw-vp-chips' }, chips.map(c => c.el)))),
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'vw-stats' }, sLog),
            log,
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'compose-in-views',
        title: 'Compose inside Views',
        tagline: 'Drop a ComposeView into an existing screen.',
        level: 'intermediate',
        body: `
<p><code>ComposeView</code> is a regular Android View that hosts a composition. Put it in an XML layout or create it in code, then call <code>setContent { }</code>. Inside, everything is normal Compose: state, theming and <code>collectAsStateWithLifecycle</code>.</p>
<p>A ComposeView has to know when to dispose its composition. The default strategy disposes as soon as the view leaves the window, unless it sits in a pooling container like RecyclerView. In a Fragment, pass <code>DisposeOnViewTree&shy;LifecycleDestroyed</code> to <code>setViewCompositionStrategy</code>, so the composition lives exactly as long as the Fragment’s view.</p>
<p>This is how most teams migrate. Start with one leaf, like a rating bar or a list row. Then move whole screens: the Fragment returns a ComposeView and the screen becomes one composable. When every screen is Compose, replace the Fragments with Navigation Compose.</p>`,
        code: `// A whole screen: the Fragment stays, its view is Compose
class SettingsFragment : Fragment() {
    private val viewModel: SettingsViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?,
    ): View = ComposeView(requireContext()).apply {
        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
        setContent {
            AppTheme {
                val state by viewModel.state.collectAsStateWithLifecycle()
                SettingsScreen(state, onToggle = viewModel::toggle)
            }
        }
    }
}

// One piece of an XML screen:
// <androidx.compose.ui.platform.ComposeView android:id="@+id/rating" ... />
binding.rating.apply {
    setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
    setContent { AppTheme { RatingBar(stars = 4) } }
}`,
        remember: 'ComposeView hosts Compose in a View. In a Fragment, dispose with the view lifecycle.',
        terms: [
          { term: 'ComposeView', def: 'An Android View that hosts a Compose composition, set with setContent.' },
          { term: 'ViewCompositionStrategy', def: 'The rule that decides when a ComposeView disposes its composition, such as on detach or when its lifecycle is destroyed.' },
          { term: 'Incremental migration', def: 'Moving a View-based app to Compose one component or screen at a time while both systems run side by side.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Return a Compose screen from a Fragment.', code: 'override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View =\n    [[ComposeView]](requireContext()).apply {\n        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)\n        [[setContent]] { AppTheme { SettingsScreen() } }\n    }', why: '<code>ComposeView</code> is the View, <code>setContent</code> gives it the composable to show.' },
          { type: 'bug', prompt: 'This ComposeView sits in a Fragment. Its remembered state resets whenever the view is detached, even though the Fragment’s view is still alive. Tap the line.', code: 'override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View =\n    ComposeView(requireContext()).apply {\n        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)\n        setContent { AppTheme { SettingsScreen() } }\n    }', bug: 2, fix: '        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)', why: 'Detaching disposes the composition under this strategy. Following the view tree lifecycle keeps it until <code>onDestroyView</code>.' },
        ],
        quiz: [
          { q: 'What is <code>ComposeView</code>?', options: ['A composable that wraps Views', 'A View that hosts a composition', 'A Fragment subclass'], a: 1, why: 'It extends View, so it fits anywhere a View fits: XML, a ViewGroup, or a Fragment’s onCreateView.' },
          { q: 'Which strategy fits a ComposeView that is a Fragment’s view?', options: ['<code>DisposeOnDetachedFromWindow</code>', '<code>DisposeOnViewTreeLifecycleDestroyed</code>', 'None, it never disposes'], a: 1, why: 'The composition then ends with the Fragment’s view lifecycle, in onDestroyView.' },
          { q: 'What is a good first step in a migration?', options: ['Rewrite every screen at once', 'Convert one small component or a new screen', 'Replace Fragments with Navigation Compose first'], a: 1, why: 'Small steps keep the app shippable. Navigation Compose comes last, once the screens are Compose.' },
          { q: 'Two ComposeViews are created in code on one screen, with no ids. Both use <code>rememberSaveable</code>. After rotation, what happens?', options: ['Both restore their state', 'Neither restores, because ComposeView has no saved state', 'They share one key, so only the first restores; the second starts over'], a: 2, why: 'The saved-state key comes from the ComposeView’s id. Give each one its own id, for example from <code>res/values/ids.xml</code>.' },
        ],
        deeper: civDepth.deeper,
        underHood: civDepth.underHood,
        mistakes: civDepth.mistakes,
        visual(el) {
          const strategies = [
            { id: 'default', label: 'DisposeOnDetachedFromWindowOrReleasedFromPool', onDetach: true },
            { id: 'lifecycle', label: 'DisposeOnViewTreeLifecycleDestroyed', onDetach: false },
          ];
          let strat = strategies[0], count = 3, alive = true, attached = true, viewUp = true, busy = false;
          const num = h('span', { class: 'vw-count' }, String(count));
          const plus = h('button', { class: 'btn small primary', type: 'button', onclick() {
            if (!alive || !attached) { replay(cv, 'shake'); return; }
            count++; num.textContent = String(count); replay(num, 'pop');
          } }, 'count++');
          const cvName = h('span', { class: 'vw-cv-name' }, 'ComposeView');
          const cvNote = h('span', { class: 'vw-note' }, 'remember { count }');
          const cv = h('div', { class: 'vw-cv' }, cvName, num, plus, cvNote);
          const screen = h('div', { class: 'vw-screen' }, h('div', { class: 'vw-bar' }, 'Settings', h('small', {}, 'XML')), cv);
          const o = out();
          const btns = strategies.map(s => cmd(s.label, () => {
            if (busy) return;
            strat = s; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(strategies[i] === s)));
            say(o, `strategy: ${s.label}`);
          }, { 'aria-pressed': String(s === strat) }));
          const paint = () => {
            cv.classList.toggle('vw-off', !alive || !attached);
            cvName.textContent = !viewUp ? 'view destroyed' : !attached ? (alive ? 'detached, composition kept' : 'detached, disposed') : 'ComposeView';
            num.textContent = alive ? String(count) : '-';
          };
          function dispose() { alive = false; }
          function compose() { if (!alive) { alive = true; count = 0; } }
          const detachBtn = act('Detach from window', () => {
            if (busy || !viewUp) return;
            if (attached) {
              attached = false;
              if (strat.onDetach) { dispose(); say(o, '<span class="bad">detached: composition disposed</span>, the count is gone'); }
              else say(o, '<span class="good">detached: composition kept</span> <span class="muted">// the view lifecycle is still alive</span>');
              detachBtn.textContent = 'Attach again';
            } else {
              attached = true; compose();
              say(o, count === 0 ? '<span class="bad">attached: new composition</span>, count starts at 0' : `<span class="good">attached:</span> same composition, count is still ${count}`);
              detachBtn.textContent = 'Detach from window';
            }
            paint(); replay(cv, 'pop-soft');
          });
          const destroyBtn = act('Fragment onDestroyView', async () => {
            if (busy) return; busy = true;
            if (viewUp) {
              viewUp = false; attached = false; dispose();
              say(o, 'onDestroyView: <span class="good">composition disposed</span> under both strategies');
              destroyBtn.textContent = 'Back: onCreateView';
            } else {
              viewUp = true; attached = true; compose();
              say(o, 'onCreateView: a new ComposeView and a new composition');
              destroyBtn.textContent = 'Fragment onDestroyView';
            }
            detachBtn.textContent = 'Detach from window';
            paint(); replay(cv, 'pop-soft');
            await sleep(300); busy = false;
          });
          paint();
          say(o, 'Bump the count, then detach the view under each strategy.');
          // migration strip
          const names = ['Settings', 'Profile', 'Search', 'Detail', 'Home'];
          let migrated = 1;
          const scrs = names.map((n, i) => h('div', { class: 'vw-scr' + (i < migrated ? ' vw-done' : '') }, n, h('small', {}, i < migrated ? 'Compose' : 'XML')));
          const o2 = out('1 of 5 screens in Compose. Each one ships on its own.');
          const migrate = act('Migrate next screen', () => {
            if (migrated >= names.length) {
              scrs.forEach(s => replay(s, 'pop'));
              say(o2, '<span class="good">all Compose:</span> swap the Fragments for Navigation Compose, then drop the View deps');
              return;
            }
            const s = scrs[migrated];
            s.classList.add('vw-done'); s.lastElementChild.textContent = 'Compose'; replay(s, 'flip');
            migrated++;
            say(o2, `${migrated} of ${names.length} screens in Compose <span class="muted">// ${names[migrated - 1]}Fragment now returns a ComposeView</span>`);
          });
          el.append(
            h('div', { class: 'vw-split' }, screen,
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'setViewCompositionStrategy'), h('div', { class: 'vw-strats' }, btns),
                h('div', { class: 'controls' }, detachBtn, destroyBtn))),
            o,
            h('span', { class: 'vw-label' }, 'Migrating screen by screen'),
            h('div', { class: 'vw-screens' }, scrs),
            h('div', { class: 'controls' }, migrate),
            o2);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'android-view',
        title: 'Views inside Compose',
        tagline: 'Wrap a View you can’t rewrite yet.',
        level: 'advanced',
        body: `
<p>Some Views have no Compose version yet, or are too big to rewrite now: a map, an ad, a video player, an in-house chart. <code>AndroidView</code> puts one inside a composable.</p>
<p>It takes two lambdas with different jobs. <code>factory</code> creates the View once, when <code>AndroidView</code> enters the composition. <code>update</code> runs right after that and again whenever state it reads changes. Put one-time setup in <code>factory</code> and anything driven by state in <code>update</code>. A value you only set in <code>factory</code> never changes again.</p>
<p>Clean up in <code>onRelease</code>, which runs when the View leaves the composition. In a lazy list, pass <code>onReset</code> too, so the View can be reused for another item instead of being thrown away. For a whole XML layout, <code>AndroidViewBinding</code> inflates it through its binding class. Also keep the View inside the composable. Don’t store it in a ViewModel, because that leaks the Activity context.</p>`,
        code: `@Composable
fun SpeedGauge(speed: Int, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            GaugeView(context).apply { maxValue = 200 }   // once
        },
        update = { gauge ->
            gauge.value = speed                            // every time speed changes
        },
        onRelease = { gauge -> gauge.stopAnimations() },   // left the composition
        modifier = modifier.size(160.dp),
    )
}

// A whole XML layout, through its binding (ui-viewbinding)
@Composable
fun LegacyBanner(title: String) {
    AndroidViewBinding(BannerBinding::inflate) {
        bannerTitle.text = title                           // runs like update
    }
}`,
        remember: 'factory builds the View once. update pushes state into it. onRelease cleans up.',
        terms: [
          { term: 'AndroidView', def: 'A composable that creates an Android View with factory and keeps it in sync with state through update.' },
          { term: 'AndroidView update', def: 'The AndroidView lambda that runs after the View is created and again whenever the state it reads changes.' },
          { term: 'AndroidViewBinding', def: 'A composable from ui-viewbinding that inflates an XML layout through its generated binding class.' },
          { term: 'onRelease', def: 'The AndroidView callback that runs when the View leaves the composition for good, the place to free its resources.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Create the gauge once, and push the speed into it on every change.', code: 'AndroidView(\n    [[factory]] = { context -> GaugeView(context) },\n    [[update]] = { gauge -> gauge.value = speed },\n)', why: '<code>factory</code> runs once per entry into the composition. <code>update</code> reruns when <code>speed</code> changes.' },
          { type: 'bug', prompt: 'The gauge shows the first speed and never moves after that. Tap the line.', code: '@Composable\nfun SpeedGauge(speed: Int) {\n    AndroidView(\n        factory = { context -> GaugeView(context).apply { value = speed } },\n        modifier = Modifier.size(160.dp),\n    )\n}', bug: 3, fix: '        factory = { context -> GaugeView(context) }, update = { it.value = speed },', why: '<code>factory</code> runs only once, so the View never sees a new speed. State that changes belongs in <code>update</code>.' },
        ],
        quiz: [
          { q: '<code>speed</code> changes from 40 to 60. Which lambda runs?', options: ['<code>factory</code>', '<code>update</code>', 'Both'], a: 1, why: 'The View already exists. Only <code>update</code> reruns, because it read <code>speed</code>.' },
          { q: 'Where should you stop a View’s animations or listeners?', options: ['In <code>factory</code>', 'In <code>onRelease</code>', 'In <code>update</code>'], a: 1, why: '<code>onRelease</code> runs when the View leaves the composition for good.' },
          { q: 'Why not keep the View instance in a ViewModel?', options: ['Views are not Parcelable', 'It holds an Activity context and leaks it across rotation', 'Compose forbids it at compile time'], a: 1, why: 'A ViewModel outlives the Activity, and every View points at the context it was created with.' },
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>AndroidView(\n    factory = { ctx -&gt; WebView(ctx) },\n    update = { web -&gt; web.loadUrl(url) },\n)</code></pre>', options: ['<code>update = { web -&gt; web.loadUrl(url) }</code>: update can run many times, so guard it with <code>if (web.url != url)</code>', '<code>factory = { ctx -&gt; WebView(ctx) }</code>: a WebView must be created in remember', 'Neither: this is the recommended pattern'], a: 0, why: 'An unguarded loadUrl reloads the page and loses the scroll position every time update reruns.' },
          { q: 'A LazyColumn shows 200 rows, each with a heavy chart <code>AndroidView</code>. Scrolling drops frames. What helps most?', options: ['Move the chart View into the ViewModel', 'Call <code>invalidate()</code> in update', 'Pass <code>onReset</code>, so scrolled-off Views are reused instead of built again by factory'], a: 2, why: 'Without onReset, a View that scrolls off is released and the next item pays for factory again. With onReset the View is kept, cleared and refilled by update.' },
        ],
        deeper: avDepth.deeper,
        underHood: avDepth.underHood,
        mistakes: avDepth.mistakes,
        visual(el) {
          let speed = 40, viewVal = 40, inComp = true, inFactory = false, inst = 1, nF = 1, nU = 1, nR = 0, busy = false;
          const sF = stat('factory', nF), sU = stat('update', nU), sR = stat('onRelease', nR);
          const stateNum = h('span', { class: 'vw-big' }, String(speed));
          const comp = h('div', { class: 'vw-card' }, h('span', { class: 'vw-card-title', html: hl('var speed by remember') }), stateNum, h('span', { class: 'vw-note' }, 'Compose state'));
          const fill = h('span', { style: `width:${viewVal / 2}%` });
          const vTitle = h('span', { class: 'vw-card-title' });
          const vVal = h('span', { class: 'vw-note' });
          const view = h('div', { class: 'vw-card' }, vTitle, h('div', { class: 'vw-gauge' }, fill), vVal);
          const lam = h('div', { class: 'kt' });
          const o = out('Change the speed. Only update runs.');
          const paint = () => {
            stateNum.textContent = String(speed);
            vTitle.textContent = inComp ? `GaugeView #${inst}` : `GaugeView #${inst} (released)`;
            vVal.textContent = inComp ? `value = ${viewVal}` : 'detached';
            fill.style.width = `${viewVal / 2}%`;
            view.classList.toggle('vw-gone', !inComp);
            view.classList.toggle('vw-stale', inComp && viewVal !== speed);
            lam.innerHTML = hl(inFactory
              ? 'factory = { GaugeView(it).apply { value = speed } }\n// no update'
              : 'factory = { GaugeView(it) }\nupdate = { it.value = speed }');
          };
          paint();
          async function change(d) {
            if (busy) return; busy = true;
            speed = Math.max(0, Math.min(200, speed + d));
            replay(stateNum, 'pop'); paint();
            await sleep(250);
            if (!el.isConnected) return;
            if (!inComp) say(o, `speed = ${speed} <span class="muted">// no AndroidView in the composition</span>`);
            else if (inFactory) { replay(view, 'shake'); say(o, `recomposed, <span class="bad">nothing reached the View</span> <span class="muted">// factory already ran, value is still ${viewVal}</span>`); }
            else { viewVal = speed; nU++; sU.set(nU); replay(view, 'pop-soft'); say(o, `<span class="good">update</span> ran: gauge.value = ${speed} <span class="muted">// same View instance #${inst}</span>`); }
            paint(); busy = false;
          }
          async function showHide() {
            if (busy) return; busy = true;
            if (inComp) {
              inComp = false; nR++; sR.set(nR); replay(view, 'pop-soft');
              say(o, `if (showGauge) is false: <span class="good">onRelease</span> ran, View #${inst} is gone`);
              tgl.textContent = 'showGauge = true';
            } else {
              inComp = true; inst++; nF++; sF.set(nF); viewVal = speed;
              if (!inFactory) { nU++; sU.set(nU); }
              replay(view, 'drop-in');
              say(o, `<span class="good">factory</span> built View #${inst}${inFactory ? '' : ', then update set value'} = ${speed}`);
              tgl.textContent = 'showGauge = false';
            }
            paint(); await sleep(300); busy = false;
          }
          const tgl = cmd('showGauge = false', showHide);
          const sw = toggle('vw-av-factory', 'Set <code>value</code> only in <code>factory</code> (the bug)', false, () => {
            inFactory = sw.input.checked; paint(); replay(lam, 'pop-soft');
            say(o, inFactory ? '<span class="bad">No update lambda.</span> Change the speed now.' : 'update is back. The next change syncs the View.');
          });
          el.append(
            h('div', { class: 'vw-split' },
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Composable'), comp),
              h('div', { class: 'vw-col' }, h('span', { class: 'vw-label' }, 'Android View'), view)),
            lam, sw.el,
            h('div', { class: 'controls' },
              cmd('speed += 20', () => change(20)),
              cmd('speed -= 20', () => change(-20)),
              tgl),
            h('div', { class: 'vw-stats' }, sF, sU, sR),
            o);
        },
      },
    ],
  });
})();
