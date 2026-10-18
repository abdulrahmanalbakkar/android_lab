/* Performance and debugging track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed pf-.
   Baseline Profiles and Macrobenchmark live in the testing track. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const line = (o, html, cls = '') => { const d = h('div', { class: `line drop-in ${cls}`, html }); o.append(d); return d; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const toggle = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked: checked || null, onchange() { onchange(input.checked); } });
    return { input, el: h('label', { class: 'switch', for: id }, input, h('span', { html: label })) };
  };
  // visual() runs before the lesson page is attached, so loops wait for the node to appear and stop once it leaves.
  const alive = node => { let seen = false; const t0 = Date.now(); return () => { if (node.isConnected) { seen = true; return true; } return !seen && Date.now() - t0 < 5000; }; };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  const css = `
.pf-label { font: 600 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.pf-row { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; min-width: 0; }
.pf-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; min-width: 0; }
.out .pf-pre { white-space: pre; }
.pf-stat { font: 600 0.85rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.pf-stat b { color: var(--ink); }
.pf-stat .pf-badnum { color: var(--err); }

/* 1 frame budget */
.pf-graph { position: relative; height: 140px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; padding: 8px 10px 0; overflow: hidden; min-width: 0; }
.pf-frames { position: absolute; left: 10px; right: 10px; bottom: 0; height: 132px; display: flex; align-items: flex-end; justify-content: flex-end; gap: 3px; overflow: hidden; }
.pf-fbar { flex: 0 0 9px; display: flex; flex-direction: column-reverse; border-radius: 3px 3px 0 0; overflow: hidden; animation: drop-in 0.25s ease-out both; }
.pf-fbar i { display: block; }
.pf-fw { background: var(--accent); }
.pf-aw { background: var(--warm); }
.pf-fbar.pf-late .pf-aw, .pf-fbar.pf-late .pf-fw { background: var(--err); }
.pf-fbar.pf-miss { flex-basis: 9px; height: 4px; background: var(--line); border-radius: 2px; }
.pf-budget { position: absolute; left: 0; right: 0; border-top: 2px dashed var(--ok); pointer-events: none; transition: bottom 0.3s; }
.pf-budget span { position: absolute; left: 10px; bottom: 2px; font: 600 0.72rem var(--mono); color: var(--ok); background: var(--bg); padding: 0 4px; border-radius: 4px; }
.pf-rail { position: relative; height: 40px; background: var(--sunk); border-radius: 999px; min-width: 0; }
.pf-ball { position: absolute; top: 6px; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: var(--accent); }
.pf-rail.pf-stutter .pf-ball { background: var(--err); }

/* 2 ANR */
.pf-phone { position: relative; justify-content: flex-start; align-items: stretch; gap: 8px; }
.pf-app-title { font: 700 1rem var(--display); }
.pf-note { flex: 1; border-radius: 10px; background: var(--sunk); padding: 8px 10px; font-size: 0.86rem; color: var(--muted); }
.pf-pbtn { align-self: flex-start; padding: 6px 14px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-weight: 700; font-size: 0.86rem; }
.pf-pstatus { font: 600 0.78rem var(--mono); color: var(--muted); min-height: 1.4em; }
.pf-dialog { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); display: grid; place-items: center; padding: 10px; }
.pf-dialog[hidden] { display: none; }
.pf-dlg { background: var(--surface); color: var(--ink); border-radius: 14px; padding: 12px; display: grid; gap: 8px; font-size: 0.84rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35); }
.pf-dlg b { font-family: var(--display); font-size: 0.95rem; }
.pf-dlg button { all: unset; cursor: pointer; font: 700 0.82rem var(--body); color: var(--accent); padding: 2px 0; }
.pf-dlg button:focus-visible { outline: 2px solid var(--accent); }
.pf-tap { position: absolute; top: 3px; width: 8px; height: 22px; margin-left: -4px; border-radius: 4px; background: var(--warm); }
.pf-wait { position: absolute; top: 12px; height: 6px; border-radius: 3px; background: var(--warm); opacity: 0.55; }
.pf-limit { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--err); }
.pf-ioring { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; display: inline-block; vertical-align: -4px; margin-right: 6px; }

/* 3 leaks */
.pf-heap-stage { display: grid; grid-template-columns: minmax(0, 200px) minmax(0, 1fr); gap: 16px; padding: 16px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; align-items: start; min-width: 0; }
.pf-root { border: 2px solid var(--ink); border-radius: 12px; background: var(--surface); padding: 10px 12px; display: grid; gap: 6px; font: 500 0.82rem var(--mono); min-width: 0; }
.pf-root-name { font-weight: 700; color: var(--accent); overflow-wrap: anywhere; }
.pf-refs { display: flex; flex-wrap: wrap; gap: 4px; }
.pf-ref { padding: 1px 7px; border-radius: 999px; background: var(--err-soft); color: var(--err); font-weight: 600; }
.pf-acts { display: flex; flex-wrap: wrap; gap: 10px; align-content: flex-start; min-height: 96px; min-width: 0; }
.pf-act { min-width: 120px; flex: 0 1 140px; transition: border-color 0.2s, opacity 0.2s; }
.pf-act small { font-size: 0.72rem; color: var(--muted); }
.pf-act.pf-alive { border-color: var(--ok); }
.pf-act.pf-dead { border-style: dashed; opacity: 0.75; }
.pf-act.pf-leak { border-color: var(--err); background: var(--err-soft); opacity: 1; }
.pf-heap { display: grid; gap: 6px; }
.pf-heap-bar { height: 12px; background: var(--sunk); border-radius: 99px; overflow: hidden; }
.pf-heap-bar span { display: block; height: 100%; width: 0; background: var(--ok); border-radius: 99px; transition: width 0.5s, background 0.3s; }
.pf-heap-bar.pf-high span { background: var(--warm); }
.pf-heap-bar.pf-full span { background: var(--err); }

/* 4 flame chart */
.pf-flame { display: flex; flex-direction: column-reverse; gap: 2px; padding: 10px; background: var(--code-bg); border-radius: 12px; min-width: 0; position: relative; }
.pf-frow { position: relative; height: 26px; }
.pf-fl { all: unset; box-sizing: border-box; position: absolute; top: 0; bottom: 0; padding: 0 6px; border-radius: 4px; font: 500 0.74rem/26px var(--mono); color: var(--code-ink); background: rgba(169, 140, 255, 0.32); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; transition: left 0.35s, width 0.35s, opacity 0.3s; border: 1px solid rgba(0, 0, 0, 0.35); }
.pf-fl:hover { background: rgba(169, 140, 255, 0.5); }
.pf-fl:focus-visible { outline: 2px solid var(--t-f); }
.pf-fl.pf-warm { background: rgba(255, 156, 85, 0.45); }
.pf-fl.pf-hot { background: rgba(255, 113, 137, 0.6); }
.pf-fl.pf-sel { outline: 2px solid var(--t-f); outline-offset: -2px; }
.pf-fl.pf-grow { animation: pf-grow 0.5s ease-out both; transform-origin: left; }
@keyframes pf-grow { from { transform: scaleX(0); } }
.pf-fbudget { position: absolute; top: 4px; bottom: 4px; width: 0; border-left: 2px dashed var(--t-s); pointer-events: none; transition: left 0.35s, opacity 0.3s; }
.pf-fbudget span { position: absolute; top: 0; left: 4px; font: 600 0.68rem var(--mono); color: var(--t-s); white-space: nowrap; }

/* 5 compose inspector */
.pf-insp { display: grid; gap: 2px; padding: 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; min-width: 0; }
.pf-ihead, .pf-irow { display: grid; grid-template-columns: minmax(0, 1fr) 64px 64px; gap: 8px; align-items: center; padding: 5px 8px; border-radius: 8px; }
.pf-ihead { font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.pf-ihead span:not(:first-child), .pf-irow span:not(:first-child) { text-align: right; }
.pf-irow { font: 500 0.82rem var(--mono); transition: background 0.3s; }
.pf-irow > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.pf-irow .pf-rec { font-weight: 700; font-variant-numeric: tabular-nums; }
.pf-irow .pf-skp { color: var(--muted); font-variant-numeric: tabular-nums; }
.pf-irow.pf-hit { background: var(--warm-soft); }
.pf-irow.pf-hit .pf-rec { color: var(--warm); }
.pf-irow.pf-skipped { background: var(--ok-soft); }
.pf-irow.pf-new { background: var(--accent-soft); }
.pf-d1 > span:first-child { padding-left: 14px; }
.pf-d2 > span:first-child { padding-left: 28px; }
.pf-report { white-space: pre; }

/* 6 startup */
.pf-launcher { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
.pf-launcher i { aspect-ratio: 1; border-radius: 12px; background: var(--sunk); }
.pf-launcher i.pf-me { background: var(--accent); }
.pf-splash { width: 64px; height: 64px; border-radius: 50%; background: var(--accent); display: grid; place-items: center; color: var(--accent-ink); font: 800 1.4rem var(--display); }
.pf-content { width: 100%; display: grid; gap: 8px; }
.bar.pf-proc { background: var(--muted); }
.bar.pf-app { background: var(--warm); }
.bar.pf-appseg { background: var(--warm); border-right: 2px solid var(--bg); }
.bar.pf-actb { background: var(--accent); }
.bar.pf-frame { background: var(--ok); }
.pf-ttid { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--ok); }

/* 7 R8 */
.pf-dex { display: grid; gap: 1px; background: var(--code-bg); border-radius: 12px; padding: 10px 12px; overflow-x: auto; min-width: 0; }
.pf-dl { font: 500 0.82rem/1.65 var(--mono); color: var(--code-ink); white-space: pre; border-radius: 5px; padding: 0 6px; transition: opacity 0.3s, background 0.3s; }
.pf-dl.pf-cls { color: var(--t-t); }
.pf-dl.pf-gone { opacity: 0.3; text-decoration: line-through; }
.pf-dl.pf-inl { background: rgba(255, 212, 121, 0.12); }
.pf-dl.pf-ren { background: rgba(169, 140, 255, 0.14); }
.pf-dl.pf-kept { background: rgba(158, 223, 165, 0.14); }
.pf-dl .pf-why { color: var(--t-c); font-style: italic; }
.pf-size { font: 700 1.5rem var(--display); font-variant-numeric: tabular-nums; }

@media (max-width: 600px) {
  .pf-split { grid-template-columns: minmax(0, 1fr); }
  .pf-heap-stage { grid-template-columns: minmax(0, 1fr); }
  .pf-ihead, .pf-irow { grid-template-columns: minmax(0, 1fr) 46px 46px; padding: 5px 4px; }
}

/* depth steps */
.pf-dz-graph { display: grid; grid-template-columns: minmax(0, 190px) minmax(0, 1fr); gap: 14px; padding: 14px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; align-items: start; min-width: 0; }
.pf-dz-col { display: grid; gap: 8px; min-width: 0; }
.pf-dz-heap { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.obj.pf-dz-obj { min-width: 0; padding: 8px 10px; font-size: 0.78rem; transition: border-color 0.25s, background 0.25s, opacity 0.3s; }
.pf-dz-obj .obj-name { overflow-wrap: anywhere; }
.pf-dz-obj.pf-dz-root { border-color: var(--accent); }
.pf-dz-refs { color: var(--muted); font-size: 0.72rem; overflow-wrap: anywhere; }
.pf-dz-st { font: 600 0.7rem var(--mono); color: var(--muted); }
.pf-dz-mark { border-color: var(--ok) !important; background: var(--ok-soft); }
.pf-dz-free { opacity: 0.4; border-style: dashed !important; }
.pf-dz-free .obj-name { text-decoration: line-through; }
.pf-dz-kept { border-color: var(--err) !important; background: var(--err-soft); }
.pf-dz-kept .pf-dz-st { color: var(--err); }
.legend i.pf-dz-key { width: 14px; height: 14px; border-radius: 4px; border: 2px solid var(--line); }
.legend i.pf-dz-key.pf-dz-free { opacity: 1; border-style: dashed; border-color: var(--muted); }
.pf-dz-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 12px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.pf-dz-link { font: 600 0.76rem var(--mono); padding: 5px 9px; border-radius: 8px; border: 2px solid var(--ink); background: var(--surface); transition: opacity 0.3s, border-color 0.3s, background 0.3s; min-width: 0; overflow-wrap: anywhere; }
.pf-dz-link.pf-dz-gone { opacity: 0.35; border-style: dashed; text-decoration: line-through; }
.pf-dz-link.pf-dz-free { opacity: 0.45; border-style: dashed; }
.pf-dz-link.pf-dz-kept { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.pf-dz-arrow { font: 700 0.9rem var(--mono); color: var(--muted); }
.pf-dz-phases { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.pf-dz-phase { display: grid; gap: 2px; padding: 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); opacity: 0.55; transition: opacity 0.25s, border-color 0.25s; min-width: 0; }
.pf-dz-phase b { font: 700 1.4rem var(--display); font-variant-numeric: tabular-nums; }
.pf-dz-phase small { color: var(--muted); font-size: 0.74rem; }
.pf-dz-phase.pf-dz-on { opacity: 1; border-color: var(--warm); }
.pf-dz-phase.pf-dz-on b { color: var(--warm); }
@media (max-width: 600px) {
  .pf-dz-graph { grid-template-columns: minmax(0, 1fr); }
  .pf-dz-phase .pf-label { font-size: 0.62rem; letter-spacing: 0.02em; }
}
/* depth pass 2 */
.pf-d2-wrap .cmd { white-space: normal; text-align: left; }
.pf-d2-limit { position: absolute; top: 0; bottom: 0; width: 0; border-left: 2px dashed var(--ok); }
.pf-d2-val { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font: 600 0.74rem var(--mono); color: var(--ink); font-variant-numeric: tabular-nums; }
.legend i.pf-d2-key { height: 0; border-top: 2px dashed var(--ok); border-radius: 0; vertical-align: 3px; }
.pf-d2-stripbox { position: relative; height: 110px; padding: 6px 8px 0; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; overflow: hidden; min-width: 0; }
.pf-d2-strip { display: grid; grid-template-columns: repeat(100, minmax(0, 1fr)); gap: 1px; align-items: end; height: 100%; }
.pf-d2-f { display: block; background: var(--accent); border-radius: 1px 1px 0 0; animation: drop-in 0.25s ease-out both; }
.pf-d2-f.pf-d2-late { background: var(--err); }
.pf-d2-budget { position: absolute; left: 0; right: 0; border-top: 2px dashed var(--ok); pointer-events: none; }
.pf-d2-nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 96px), 1fr)); gap: 8px; min-width: 0; }
.pf-d2-num { display: grid; gap: 2px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); min-width: 0; }
.pf-d2-num b { font: 700 1.05rem var(--mono); font-variant-numeric: tabular-nums; }
.pf-d2-skel { min-height: 40px; opacity: 0.55; }
.pf-d2-mt { display: grid; gap: 6px; min-width: 0; }
.pf-d2-mrow { display: grid; grid-template-columns: minmax(0, 11em) minmax(0, 1fr) 6.5em 8em; gap: 4px 10px; align-items: center; padding: 6px 8px; border-radius: 10px; font: 500 0.8rem var(--mono); min-width: 0; transition: background 0.3s; }
.pf-d2-mrow.pf-d2-skew { background: var(--warm-soft); }
.pf-d2-mn { overflow-wrap: anywhere; min-width: 0; }
.pf-d2-mv { font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }
.pf-d2-mc { color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }
.pf-d2-states { position: relative; display: flex; height: 34px; border-radius: 8px; overflow: hidden; background: var(--sunk); min-width: 0; }
.pf-d2-st { height: 100%; border-right: 1px solid var(--bg); animation: pf-grow 0.5s ease-out both; transform-origin: left; }
.pf-d2-b16 { position: absolute; top: 0; bottom: 0; width: 0; border-left: 2px dashed var(--ink); }
@media (max-width: 600px) {
  .pf-d2-mrow { grid-template-columns: minmax(0, 1fr) auto auto; }
  .pf-d2-mrow .pf-heap-bar { grid-column: 1 / -1; grid-row: 2; }
}
/* gap lesson: main thread */
.pf-mt-wrapcmd .cmd { white-space: normal; text-align: left; overflow-wrap: anywhere; }
.pf-mt-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; min-width: 0; }
.pf-mt-box { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); min-width: 0; min-height: 150px; }
.pf-mt-q { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.pf-mt-msg { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); overflow-wrap: anywhere; }
.pf-mt-msg small { color: var(--muted); font-weight: 500; }
.pf-mt-msg.pf-mt-frame { border-color: var(--accent); background: var(--accent-soft); }
.pf-mt-msg.pf-mt-heavy { border-color: var(--err); background: var(--err-soft); }
.pf-mt-msg.pf-mt-tap { border-color: var(--warm); background: var(--warm-soft); }
.pf-mt-msg.pf-mt-later { border-style: dashed; opacity: 0.75; }
.pf-mt-run { font: 700 0.86rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.pf-mt-run.pf-mt-hot { color: var(--err); }
.pf-mt-bar { display: block; height: 8px; border-radius: 999px; background: var(--sunk); overflow: hidden; }
.pf-mt-fill { display: block; height: 100%; width: 0; background: var(--accent); }
.pf-mt-spin { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--line); }
.pf-mt-dot { display: block; width: 26px; height: 26px; border-radius: 50%; background: conic-gradient(var(--accent) 0 25%, transparent 25%); }
`;

  // ─── Depth: Go deeper, under the hood, common mistakes ─────────────────
  const leaksDepth = {
    deeper: [
      {
        title: 'The GC traces from roots, so cycles are fine',
        body: `<p>ART does not count references. It starts at the GC roots, marks everything it can reach, and frees the rest. Two objects that point at each other but that no root reaches are freed together. A cycle between an Activity and its presenter is not a leak.</p>
<p>A leak needs a path from a root. Toggle the stale listener, then run a GC and watch the mark phase.</p>`,
        visual(el) {
          const OBJS = {
            thread: { name: 'main thread', root: true, refs: ['act2'] },
            repo: { name: 'object LocationRepo', root: true, refs: [] },
            act2: { name: 'MapActivity #2', note: 'on screen', refs: ['pres2'] },
            pres2: { name: 'MapPresenter #2', refs: ['act2'] },
            act1: { name: 'MapActivity #1', note: 'destroyed', refs: ['pres1', 'bmp1'] },
            pres1: { name: 'MapPresenter #1', refs: ['act1'] },
            bmp1: { name: 'Bitmap 12 MB', refs: [] },
          };
          let busy = false, holds = false;
          const els = {};
          const o = out();
          const build = (id) => {
            const O = OBJS[id];
            const refs = h('span', { class: 'pf-dz-refs' });
            const st = h('span', { class: 'pf-dz-st' }, O.note || (O.root ? 'GC root' : ''));
            const box = h('div', { class: `obj pf-dz-obj${O.root ? ' pf-dz-root' : ''}` }, h('span', { class: 'obj-name' }, O.name), refs, st);
            els[id] = { box, refs, st };
            return box;
          };
          const roots = h('div', { class: 'pf-dz-col' }, h('span', { class: 'pf-label' }, 'roots'), build('thread'), build('repo'));
          const heap = h('div', { class: 'pf-dz-heap' }, ['act2', 'pres2', 'act1', 'pres1', 'bmp1'].map(build));
          function paint() {
            OBJS.repo.refs = holds ? ['act1'] : [];
            for (const [id, O] of Object.entries(OBJS)) {
              els[id].refs.textContent = O.refs.length ? '→ ' + O.refs.map(r => OBJS[r].name.replace(/ \d+ MB$/, '')).join(', ') : '→ nothing';
              els[id].box.classList.remove('pf-dz-mark', 'pf-dz-free', 'pf-dz-kept');
              els[id].st.textContent = O.note || (O.root ? 'GC root' : '');
            }
          }
          const sw = toggle('pf-dz-holds', 'LocationRepo still holds <b>#1’s listener</b>', false, v => { if (busy) { sw.input.checked = holds; return; } holds = v; paint(); say(o, v ? 'Now a root reaches MapActivity #1 through the forgotten listener. Run a GC.' : 'No root reaches MapActivity #1 any more. Run a GC.'); });
          async function gc() {
            if (busy) return; busy = true;
            try {
              paint();
              say(o, '<span class="muted">mark:</span> start at the roots and follow every reference…');
              const seen = new Set(), queue = Object.keys(OBJS).filter(k => OBJS[k].root);
              while (queue.length) {
                const id = queue.shift();
                if (seen.has(id)) continue;
                seen.add(id);
                els[id].box.classList.add('pf-dz-mark'); replay(els[id].box, 'pop');
                await sleep(380); if (!el.isConnected) return;
                OBJS[id].refs.forEach(r => { if (!seen.has(r)) queue.push(r); });
              }
              await sleep(300); if (!el.isConnected) return;
              const dead = Object.keys(OBJS).filter(k => !seen.has(k));
              dead.forEach(k => { els[k].box.classList.add('pf-dz-free'); els[k].st.textContent = 'freed'; });
              if (holds) {
                ['act1', 'pres1', 'bmp1'].forEach(k => { els[k].box.classList.add('pf-dz-kept'); els[k].st.textContent = 'leaked'; });
                say(o, '<span class="bad">leak:</span> LocationRepo is a root, and its listener reaches MapActivity #1, its presenter and its 12 MB bitmap. Nothing was freed.');
              } else {
                say(o, '<span class="good">sweep:</span> MapActivity #1 and its presenter point at each other, but no root reaches them. The cycle and the bitmap were freed together.');
              }
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'MapActivity #1 was destroyed by a rotation. It still forms a cycle with its presenter.';
          el.append(
            h('div', { class: 'controls' }, sw.el, act('Run GC', gc)),
            h('div', { class: 'pf-dz-graph' }, roots, heap),
            h('div', { class: 'legend' },
              h('span', {}, h('i', { class: 'pf-dz-key pf-dz-mark' }), 'reached from a root'),
              h('span', {}, h('i', { class: 'pf-dz-key pf-dz-free' }), 'freed'),
              h('span', {}, h('i', { class: 'pf-dz-key pf-dz-kept' }), 'leaked')),
            o);
        },
      },
      {
        title: 'Hidden references: lambdas and delayed messages',
        body: `<p>A lambda or anonymous object that uses the Activity captures it. Post it with <code>Handler.postDelayed</code> and the main thread’s message queue holds the Activity until the message runs. That queue is reachable from a root, so a rotation during the delay leaks the old Activity until then.</p>
<p>Remove the callback in <code>onDestroy</code>, or use <code>lifecycleScope</code> with <code>delay</code>, which is cancelled with the Activity.</p>`,
        code: `// Leaks for 30 s after a rotation
handler.postDelayed({ showTip() }, 30_000)

// Cancelled with the Activity
lifecycleScope.launch {
    delay(30_000)
    showTip()
}`,
        visual(el) {
          const MODES = [
            ['post', 'handler.postDelayed({ showTip() }, 30_000)', 'postDelayed(…, 30_000)'],
            ['remove', 'handler.removeCallbacksAndMessages(null) // in onDestroy', 'removeCallbacksAndMessages(null)'],
            ['scope', 'lifecycleScope.launch { delay(30_000); showTip() }', 'lifecycleScope.launch { delay(…) }'],
          ];
          const T = 6000;
          let mode = 'post', state = 'idle', t0 = 0;
          const chain = h('div', { class: 'pf-dz-chain' });
          const timer = h('span', { class: 'bar wait', style: 'left:0;width:0' });
          const countdown = h('span', { class: 'pf-stat' });
          const o = out();
          const modeBtns = MODES.map(([k, , label]) => cmd(label, () => { mode = k; reset(); }));
          const link = (txt, cls = '') => h('span', { class: `pf-dz-link ${cls}` }, txt);
          function paintChain() {
            const act1 = state === 'retained' ? 'pf-dz-kept' : state === 'freed' ? 'pf-dz-free' : '';
            const cut = state === 'freed' || state === 'idle';
            const holder = mode === 'scope' ? 'Job (lifecycleScope)' : 'Message in main queue';
            chain.replaceChildren(
              link('main Looper'), h('span', { class: 'pf-dz-arrow' }, '→'),
              link(holder, cut && state === 'freed' ? 'pf-dz-gone' : ''), h('span', { class: 'pf-dz-arrow' }, cut && state === 'freed' ? '×' : '→'),
              link('lambda { showTip() }', cut && state === 'freed' ? 'pf-dz-gone' : ''), h('span', { class: 'pf-dz-arrow' }, '→'),
              link(state === 'idle' ? 'MapActivity #1 (on screen)' : 'MapActivity #1 (destroyed)', act1));
          }
          function reset() {
            state = 'idle'; t0 = 0; timer.style.width = '0'; countdown.textContent = 'tip due in 30 s';
            press(modeBtns, modeBtns[MODES.findIndex(m => m[0] === mode)]);
            paintChain();
            say(o, `<span class="muted">mode:</span> ${hl(MODES.find(m => m[0] === mode)[1])}. The tip is scheduled. Rotate before it fires.`);
          }
          const isAlive = alive(chain);
          const tick = () => {
            if (!isAlive()) return;
            if (state === 'retained') {
              const p = Math.min(1, (performance.now() - t0) / T);
              timer.style.width = p * 100 + '%';
              countdown.textContent = `message runs in ${Math.ceil(30 * (1 - p))} s (sped up)`;
              if (p >= 1) {
                state = 'freed'; paintChain();
                countdown.textContent = 'message ran';
                say(o, '<span class="bad">late:</span> the message finally ran showTip() on a dead Activity, then the queue let go. For 30 s the old screen and its views stayed in memory.');
              }
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          reset();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            chain,
            h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'retained'), h('div', { class: 'lane-track' }, timer))),
            h('div', { class: 'pf-row' }, act('Rotate the phone', () => {
              if (state !== 'idle') { replay(chain, 'shake'); say(o, '<span class="muted">already rotated:</span> pick a mode to start over.'); return; }
              if (mode === 'post') {
                state = 'retained'; t0 = performance.now(); paintChain();
                say(o, '<span class="bad">retained:</span> MapActivity #1 is destroyed, but the pending message still reaches it through the lambda. LeakCanary would flag it 5 s from now.');
              } else {
                state = 'freed'; paintChain(); countdown.textContent = mode === 'scope' ? 'coroutine cancelled' : 'message removed';
                say(o, mode === 'scope'
                  ? '<span class="good">freed:</span> lifecycleScope was cancelled in onDestroy, so the coroutine and its lambda are gone. Nothing reaches MapActivity #1.'
                  : '<span class="good">freed:</span> onDestroy removed the pending message, which cut the only path to MapActivity #1.');
              }
            }), countdown),
            o);
        },
      },
      {
        title: 'Fragments: drop view references in onDestroyView',
        body: `<p>A Fragment on the back stack lives on after its view is destroyed. Any field that holds the binding or a View keeps the whole old view tree alive until the Fragment itself is destroyed. Clear such fields in <code>onDestroyView</code>.</p>`,
        code: `class FeedFragment : Fragment(R.layout.feed) {
    private var _binding: FeedBinding? = null
    private val binding get() = _binding!!

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FeedBinding.bind(view)
    }

    override fun onDestroyView() {
        _binding = null      // the view tree can be freed now
        super.onDestroyView()
    }
}`,
      },
    ],
    underHood: {
      body: `<p>LeakCanary hooks into the lifecycle callbacks. When an Activity, Fragment, Fragment view or ViewModel is destroyed, it wraps the object in a <code>WeakReference</code> tied to a <code>ReferenceQueue</code>. Five seconds later it checks the queue. If the reference was not enqueued, it forces a GC and checks again. An object that is still there is counted as retained.</p>
<p>When enough objects are retained (5 while the app is visible, 1 once it goes to the background), LeakCanary dumps the heap to an <code>.hprof</code> file. Its parser, Shark, finds the shortest path from a GC root to each retained object. That path is the leak trace you read.</p>`,
    },
    mistakes: [
      {
        title: 'A ViewModel that holds an Activity or View',
        bad: `class MapViewModel(
    private val activity: Activity,      // outlives rotation, keeps the old Activity
) : ViewModel() {
    fun permissionGranted() = ContextCompat.checkSelfPermission(
        activity, ACCESS_FINE_LOCATION) == PERMISSION_GRANTED
}`,
        good: `@HiltViewModel
class MapViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
) : ViewModel() {
    fun permissionGranted() = ContextCompat.checkSelfPermission(
        context, ACCESS_FINE_LOCATION) == PERMISSION_GRANTED
}`,
        why: 'A ViewModel survives rotation, so it keeps the destroyed Activity and its views. Hold the application context, or keep Context out of the ViewModel entirely.',
      },
      {
        title: 'Caching a View in a companion object',
        bad: `class PlayerActivity : ComponentActivity() {
    companion object {
        var progressBar: ProgressBar? = null   // static field, a GC root
    }
}`,
        good: `class PlayerActivity : ComponentActivity() {
    private val viewModel: PlayerViewModel by viewModels()
    // the ViewModel holds progress as state; the View reads it
}`,
        why: 'A static field lives as long as the process. A View knows its Context, so this pins the whole Activity. Share state, not Views.',
      },
    ],
  };

  const composePerfDepth = {
    deeper: [
      {
        title: 'Read state in the latest phase you can',
        body: `<p>Compose renders a frame in three phases: composition, layout and draw. A state read is tracked in the phase where it happens. Read an animated value in the composable body and every frame runs all three phases. Read it inside a lambda modifier like <code>offset { }</code> and only layout and draw run. Read it in <code>graphicsLayer { }</code> or <code>drawBehind { }</code> and only draw runs.</p>
<p>Switch modifiers and watch the per-second counts.</p>`,
        code: `val x by animateFloatAsState(if (moved) 300f else 0f, label = "x")

// Recomposes every frame
Box(Modifier.offset(x = x.dp))

// Only relayout and redraw
Box(Modifier.offset { IntOffset(x.roundToInt(), 0) })

// Only redraw
Box(Modifier.graphicsLayer { translationX = x })`,
        visual(el) {
          const MODES = [
            ['comp', 'Modifier.offset(x = x.dp)', [1, 1, 1]],
            ['layout', 'Modifier.offset { IntOffset(x, 0) }', [0, 1, 1]],
            ['draw', 'Modifier.graphicsLayer { translationX = x }', [0, 0, 1]],
          ];
          const NAMES = ['Composition', 'Layout', 'Draw'];
          let mode = 0, counts = [0, 0, 0], since = performance.now(), x = 0;
          const ball = h('span', { class: 'pf-ball', style: 'left:14px' });
          const rail = h('div', { class: 'pf-rail' }, ball);
          const phases = NAMES.map(n => {
            const num = h('b', {}, '0');
            const box = h('div', { class: 'pf-dz-phase' }, h('span', { class: 'pf-label' }, n), num, h('small', {}, 'runs per second'));
            return { box, num };
          });
          const o = out();
          const modeBtns = MODES.map(([, src], i) => cmd(src, () => {
            mode = i; counts = [0, 0, 0]; since = performance.now();
            press(modeBtns, modeBtns[i]);
            paintOn();
            say(o, [
              '<span class="bad">every phase, every frame:</span> x is read during composition, so the composable recomposes 60 times a second.',
              '<span class="good">layout and draw only:</span> the read moved into the offset lambda, which runs during layout. Composition stays at 0.',
              '<span class="good">draw only:</span> graphicsLayer reads x while drawing, so the box just moves on the GPU layer.',
            ][i]);
          }));
          const paintOn = () => phases.forEach((p, i) => p.box.classList.toggle('pf-dz-on', !!MODES[mode][2][i]));
          const isAlive = alive(rail);
          const frame = now => {
            if (!isAlive()) return;
            x = (Math.sin(now / 600) + 1) / 2;
            ball.style.left = `calc(14px + ${x} * (100% - 28px))`;
            MODES[mode][2].forEach((on, i) => { counts[i] += on; });
            if (now - since >= 500) {
              const k = 1000 / (now - since);
              phases.forEach((p, i) => { p.num.textContent = String(Math.round(counts[i] * k)); });
              counts = [0, 0, 0]; since = now;
            }
            requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
          press(modeBtns, modeBtns[0]); paintOn();
          o.innerHTML = 'The box is animating. Right now x is read in composition. Try the other two modifiers.';
          el.append(h('div', { class: 'controls' }, modeBtns), rail, h('div', { class: 'pf-dz-phases' }, phases.map(p => p.box)), o);
        },
      },
      {
        title: 'Never write state you just read during composition',
        body: `<p>Composition should only read state. If a composable reads a value and then writes it in the same pass, the write invalidates the composable it was just read in. Compose schedules it again, it writes again, and the loop never ends. This is called a <em>backwards write</em>.</p>
<p>Change state in event handlers or effects instead. Then it changes once per event.</p>`,
        code: `// Backwards write: recomposes forever
@Composable
fun Badge(count: MutableState<Int>) {
    Text("\${count.value}")
    count.value++                    // written after it was read
}

// Fine: the write happens in an event
@Composable
fun Badge(count: MutableState<Int>) {
    Text("\${count.value}", Modifier.clickable { count.value++ })
}`,
        visual(el) {
          let running = false, recs = 0, frames = 0, stopAt = 0;
          const recEl = h('b', {}, '0'), frameEl = h('b', {}, '0');
          const cpu = h('div', { class: 'pf-heap-bar' }, h('span'));
          const badge = h('span', { class: 'chip total' }, '0');
          const o = out();
          let value = 0;
          const paint = () => { recEl.textContent = recs; frameEl.textContent = frames; badge.textContent = value; };
          const isAlive = alive(badge);
          function loop() {
            if (!isAlive() || !running) return;
            if (performance.now() > stopAt) {
              running = false; cpu.className = 'pf-heap-bar'; cpu.firstChild.style.width = '6%';
              say(o, '<span class="bad">stopped by the demo:</span> on a phone this never stops. The UI thread spends every frame recomposing, and the app janks or freezes.');
              return;
            }
            recs++; frames++; value++; paint();
            requestAnimationFrame(loop);
          }
          paint(); cpu.firstChild.style.width = '6%';
          o.innerHTML = 'One badge, two ways to change its count.';
          el.append(
            h('div', { class: 'controls' },
              cmd('count.value++ // in the composable body', () => {
                if (running) return;
                running = true; stopAt = performance.now() + 3500;
                cpu.className = 'pf-heap-bar pf-full'; cpu.firstChild.style.width = '100%';
                say(o, '<span class="bad">loop:</span> read count, wrote count + 1, which invalidated the scope that read it. Compose recomposes, and it happens again…');
                requestAnimationFrame(loop);
              }),
              cmd('onClick = { count.value++ }', () => {
                if (running) { replay(badge, 'shake'); return; }
                recs++; frames++; value++; paint(); replay(badge, 'pop');
                cpu.className = 'pf-heap-bar'; cpu.firstChild.style.width = '12%';
                setTimeout(() => { if (cpu.isConnected && !running) cpu.firstChild.style.width = '6%'; }, 400);
                say(o, '<span class="good">one event, one recomposition:</span> the click changed the count, Compose redrew the badge once, then went idle.');
              })),
            h('div', { class: 'pf-split' },
              h('div', { class: 'pf-heap' },
                h('div', { class: 'pf-stat' }, 'recompositions ', recEl, ' · frames ', frameEl),
                h('span', { class: 'pf-label' }, 'main thread busy'), cpu),
              badge),
            o);
        },
      },
      {
        title: 'Measure a release build, not debug',
        body: `<p>Debug builds run Compose with extra checks and without R8 or a Baseline Profile, so they are much slower than what users get. Use the Layout Inspector in debug to find <em>what</em> recomposes. Measure <em>how long</em> things take with Macrobenchmark on a release-like build.</p>`,
        code: `@Test fun scrollFeed() = benchmarkRule.measureRepeated(
    packageName = "com.example.feed",
    metrics = listOf(FrameTimingMetric()),
    iterations = 5,
    startupMode = StartupMode.WARM,
) {
    startActivityAndWait()
    device.findObject(By.res("feed")).fling(Direction.DOWN)
}`,
      },
    ],
    underHood: {
      body: `<p>The Compose compiler rewrites every <code>@Composable</code> function. It adds a <code>Composer</code> parameter and a <code>$changed</code> bit mask that says which arguments are known to be unchanged. The body is wrapped in a restart group. If every parameter is unchanged, the function calls <code>skipToGroupEnd()</code> and does nothing.</p>
<p>At the end, the restart group registers a lambda that can call the function again. When a state object read inside it changes, the snapshot system marks that scope invalid and the Recomposer reruns only that lambda. Reads inside layout and draw lambdas are tracked by separate observers, which invalidate only layout or draw.</p>`,
      code: `// Simplified shape of what the compiler generates
@Composable
fun Greeting(name: String, $composer: Composer, $changed: Int) {
    $composer.startRestartGroup(/* key */)
    var dirty = $changed
    if (($changed and 0b0110) == 0) {
        dirty = dirty or if ($composer.changed(name)) 0b0100 else 0b0010
    }
    if ((dirty and 0b0011) != 0b0010 || !$composer.skipping) {
        Text("Hello $name", $composer, 0)
    } else {
        $composer.skipToGroupEnd()
    }
    $composer.endRestartGroup()?.updateScope { c, _ -> Greeting(name, c, $changed or 1) }
}`,
    },
    mistakes: [
      {
        title: 'Heavy work in the composable body',
        bad: `@Composable
fun Contacts(contacts: List<Contact>) {
    val sorted = contacts.sortedBy { it.name }   // on every recomposition
    LazyColumn { items(sorted, key = { it.id }) { ContactRow(it) } }
}`,
        good: `@Composable
fun Contacts(contacts: List<Contact>) {
    val sorted = remember(contacts) { contacts.sortedBy { it.name } }
    LazyColumn { items(sorted, key = { it.id }) { ContactRow(it) } }
}`,
        why: 'The body can run many times per second. <code>remember(contacts)</code> sorts once per new list. Sorting in the ViewModel is often even better.',
      },
      {
        title: 'Using the index as a lazy key',
        bad: `LazyColumn {
    itemsIndexed(messages, key = { index, _ -> index }) { _, m ->
        MessageRow(m)
    }
}`,
        good: `LazyColumn {
    items(messages, key = { it.id }) { m ->
        MessageRow(m)
    }
}`,
        why: 'Insert a message at the top and every index shifts, so every row gets a new key and its <code>remember</code> state moves to the wrong row. Use a stable id.',
      },
    ],
  };

  // ─── Depth pass 2: frame, anr, profiler, startup, r8 ───────────────────
  const frameDepth = {
    deeper: [
      {
        title: 'Two threads per frame: main and RenderThread',
        body: `<p>A frame passes through two threads. The main thread handles input, animation, measure and layout, then records drawing commands. RenderThread turns those commands into GPU work and hands the finished buffer to the system compositor. Either one can make a frame late.</p>
<p>So a light main thread is not enough. A new large bitmap has to be uploaded to the GPU, and many stacked full-screen layers or blurs cost GPU time, and both of those show up on RenderThread. In a system trace, look at both rows before you choose a fix.</p>`,
        visual(el) {
          const BUDGET = 16.7, SCALE = 34;
          const WORK = [
            { id: 'pf-d2-layout', label: 'deeply nested layout (+9 ms main)', th: 'main', ms: 9 },
            { id: 'pf-d2-upload', label: 'new 4K bitmap each frame (+11 ms RenderThread)', th: 'rt', ms: 11 },
            { id: 'pf-d2-blur', label: 'stacked full-screen blurs (+7 ms RenderThread)', th: 'rt', ms: 7 },
          ];
          const on = {};
          const root = h('div', { class: 'viz' });
          const live = alive(root);
          const mk = name => {
            const bar = h('span', { class: 'bar run', style: 'left:0;width:0' });
            const val = h('span', { class: 'pf-d2-val' });
            const track = h('div', { class: 'lane-track' }, bar, h('span', { class: 'pf-d2-limit', style: `left:${(BUDGET / SCALE) * 100}%` }), val);
            return { bar, val, late: 0, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track) };
          };
          const lanes = { main: mk('main'), rt: mk('RenderThread') };
          const stat = h('span', { class: 'pf-stat' });
          const o = out('Both threads fit the 16.7 ms budget. Add work to one of them.');
          let frames = 0;
          const extra = th => WORK.filter(w => on[w.id] && w.th === th).reduce((a, w) => a + w.ms, 0);
          function tick() {
            if (!live()) return;
            frames++;
            const ms = { main: 5 + Math.random() * 2 + extra('main'), rt: 3 + Math.random() * 1.5 + extra('rt') };
            for (const k of ['main', 'rt']) {
              const l = lanes[k], late = ms[k] > BUDGET;
              l.bar.style.width = (Math.min(ms[k], SCALE) / SCALE) * 100 + '%';
              l.bar.style.background = late ? 'var(--err)' : '';
              l.val.textContent = ms[k].toFixed(1) + ' ms';
              if (late) l.late++;
            }
            const worst = ms.main > ms.rt ? 'main' : 'RenderThread';
            stat.innerHTML = `frame ${frames}: ${Math.max(ms.main, ms.rt) > BUDGET ? `<span class="pf-badnum">late, ${worst} took ${Math.max(ms.main, ms.rt).toFixed(1)} ms</span>` : '<b>on time</b>'} · late so far: main <b>${lanes.main.late}</b>, RenderThread <b>${lanes.rt.late}</b>`;
            setTimeout(tick, 650);
          }
          const toggles = WORK.map(w => toggle(w.id, w.label, false, v => {
            on[w.id] = v; lanes.main.late = 0; lanes.rt.late = 0;
            say(o, !v ? 'Removed. Watch the bars settle.' : w.th === 'main'
              ? '<span class="bad">main thread</span> now runs past the budget. Fix: flatten the layout, or move the work off main.'
              : '<span class="bad">RenderThread</span> is the slow one now, while main stays light. Fix: smaller or reused bitmaps, fewer layers.');
          }));
          root.append(
            h('div', { class: 'controls' }, toggles.map(t => t.el)),
            h('div', { class: 'timeline' }, lanes.main.el, lanes.rt.el),
            h('div', { class: 'legend' }, h('span', {}, h('i', { style: 'background:var(--accent)' }), 'stage time'), h('span', {}, h('i', { style: 'background:var(--err)' }), 'over budget'), h('span', {}, h('i', { class: 'pf-d2-key' }), '16.7 ms budget')),
            h('div', { class: 'pf-row' }, stat),
            o);
          el.append(root);
          tick();
        },
      },
      {
        title: 'Judge jank by percentiles, not the average',
        body: `<p>An average hides stutter. A scroll with 95 frames at 8 ms and 5 frames at 60 ms averages 10.6 ms, well under budget, yet the user sees five hitches. Look at the slow end of the distribution instead.</p>
<p>Macrobenchmark's <code>FrameTimingMetric</code> reports percentiles (P50, P90, P95, P99) for <code>frameDurationCpuMs</code>, and on Android 12+ for <code>frameOverrunMs</code>: how far past its deadline each frame finished. A positive overrun is a frame the user could see as jank.</p>`,
        code: `@Test fun scrollFeed() = benchmarkRule.measureRepeated(
    packageName = "com.example.feed",
    metrics = listOf(FrameTimingMetric()),
    compilationMode = CompilationMode.Partial(),
    startupMode = StartupMode.WARM,
    iterations = 5,
) {
    startActivityAndWait()
    device.findObject(By.res("feed")).fling(Direction.DOWN)
}
// frameDurationCpuMs   P50 7.9   P90 9.1   P95 10.2   P99 58.4
// frameOverrunMs       P50 -8.6  P90 -7.4  P95 -6.1   P99 41.2`,
        visual(el) {
          const MAXMS = 70, N = 100, BUDGET = 16.7;
          let hitch = false, steady = false, busy = false;
          const strip = h('div', { class: 'pf-d2-strip', 'aria-hidden': 'true' });
          const line16 = h('span', { class: 'pf-d2-budget', style: `bottom:${(BUDGET / MAXMS) * 100}%` });
          const box = h('div', { class: 'pf-d2-stripbox' }, strip, line16);
          const nums = {};
          const statEl = h('div', { class: 'pf-d2-nums' }, ['average', 'P50', 'P90', 'P99', 'over 16.7 ms'].map(k => h('div', { class: 'pf-d2-num' }, h('span', { class: 'pf-label' }, k), (nums[k] = h('b', {}, '—')))));
          const o = out();
          function gen() {
            let seed = 7;
            const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
            return Array.from({ length: N }, (_, i) => {
              let ms = 7 + rnd() * 2;
              if (steady) ms += 6;
              if (hitch && [12, 33, 51, 70, 88].includes(i)) ms = 55 + rnd() * 10;
              return ms;
            });
          }
          function stats(fs) {
            const s = [...fs].sort((a, b) => a - b), avg = fs.reduce((a, b) => a + b, 0) / fs.length;
            const set = (k, v, bad) => { nums[k].textContent = v; nums[k].className = bad ? 'pf-badnum' : ''; };
            set('average', avg.toFixed(1) + ' ms', avg > BUDGET);
            set('P50', s[49].toFixed(1) + ' ms', s[49] > BUDGET);
            set('P90', s[89].toFixed(1) + ' ms', s[89] > BUDGET);
            set('P99', s[98].toFixed(1) + ' ms', s[98] > BUDGET);
            const over = fs.filter(x => x > BUDGET).length;
            set('over 16.7 ms', String(over), over > 0);
            return { avg, p99: s[98], over };
          }
          const bar = ms => h('span', { class: 'pf-d2-f' + (ms > BUDGET ? ' pf-d2-late' : ''), style: `height:${(Math.min(ms, MAXMS) / MAXMS) * 100}%` });
          async function record() {
            if (busy) return; busy = true;
            try {
              const fs = gen();
              strip.replaceChildren();
              Object.values(nums).forEach(n => { n.textContent = '—'; n.className = ''; });
              say(o, `${hl('fling(Direction.DOWN)')} <span class="muted">// recording 100 frames</span>`);
              for (let i = 0; i < N; i += 5) {
                strip.append(...fs.slice(i, i + 5).map(bar));
                await sleep(40); if (!el.isConnected) return;
              }
              const r = stats(fs);
              o.append(h('div', { class: 'line drop-in', html: r.over === 0 ? '<span class="good">smooth:</span> every frame fits.'
                : r.avg < BUDGET ? `<span class="bad">the average says fine (${r.avg.toFixed(1)} ms), P99 says ${r.p99.toFixed(0)} ms:</span> ${r.over} visible hitches.`
                : `<span class="bad">every frame is slower.</span> P50 moved, so this is steady extra work, not a hitch.` }));
            } finally { busy = false; }
          }
          const t1 = toggle('pf-d2-hitch', '5 hitches (GC, image decode)', false, v => { hitch = v; say(o, 'Record again to see the new numbers.'); });
          const t2 = toggle('pf-d2-steady', '+6 ms on every frame', false, v => { steady = v; say(o, 'Record again to see the new numbers.'); });
          const fs0 = gen(); strip.append(...fs0.map(bar)); stats(fs0);
          o.innerHTML = 'A smooth scroll of 100 frames. Add hitches or steady work, then record.';
          el.append(
            h('div', { class: 'controls' }, t1.el, t2.el, act('Record scroll', record)),
            box, statEl, o);
        },
      },
      {
        title: 'Tag frames with what the user was doing',
        body: `<p>JankStats in production tells you that frames were slow, not where. Add UI state to <code>PerformanceMetricsState</code>, such as the screen and whether the list is scrolling. Each <code>FrameData</code> that JankStats reports then carries the states that were active during that frame, so you can group jank by screen and action.</p>`,
        code: `val metrics = PerformanceMetricsState.getHolderForHierarchy(window.decorView)
metrics.state?.putState("screen", "feed")

recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
    override fun onScrollStateChanged(rv: RecyclerView, newState: Int) {
        if (newState == RecyclerView.SCROLL_STATE_IDLE) metrics.state?.removeState("scroll")
        else metrics.state?.putState("scroll", "dragging")
    }
})

JankStats.createAndTrack(window) { frame ->
    if (frame.isJank) analytics.logJank(frame.frameDurationUiNanos, frame.states)
}`,
      },
    ],
    underHood: {
      body: `<p>On every vsync the display system signals your app, and <code>Choreographer</code> runs its frame callbacks on the main thread in a fixed order: input, animation, insets animation, traversal, commit. Traversal is measure, layout and draw. Compose joins the same frame: its recomposer and animations wait on a frame clock that Choreographer drives.</p>
<p>Draw does not touch pixels. It records commands into display lists on <code>RenderNode</code>s. The main thread syncs the changed display lists to RenderThread and is free to start the next frame. RenderThread issues the GPU commands and queues the finished buffer, and SurfaceFlinger composites it onto the screen at a later vsync.</p>`,
    },
    mistakes: [
      {
        title: 'Moving things a fixed step per frame',
        bad: `override fun onDraw(canvas: Canvas) {
    x += 4f                       // 240 px/s at 60 Hz, 480 px/s at 120 Hz
    canvas.drawCircle(x, cy, r, paint)
    invalidate()
}`,
        good: `private val animator = ValueAnimator.ofFloat(0f, 600f).apply {
    duration = 1_000              // same speed at any refresh rate
    addUpdateListener { x = it.animatedValue as Float; invalidate() }
}
override fun onDraw(canvas: Canvas) { canvas.drawCircle(x, cy, r, paint) }`,
        why: 'Frame-counted motion runs twice as fast on a 120 Hz screen and slows down whenever frames drop. Drive motion by time.',
      },
      {
        title: 'Allocating objects in onDraw',
        bad: `override fun onDraw(canvas: Canvas) {
    val paint = Paint().apply { color = accent }   // every frame
    canvas.drawRect(bounds, paint)
}`,
        good: `private val paint = Paint()

override fun onDraw(canvas: Canvas) {
    paint.color = accent
    canvas.drawRect(bounds, paint)
}`,
        why: '<code>onDraw</code> can run every frame. New objects each time feed the garbage collector, and its work competes with your frames. Lint flags this as <code>DrawAllocation</code>.',
      },
    ],
  };

  const anrDepth = {
    deeper: [
      {
        title: 'Every component has a deadline',
        body: `<p>Input is one kind of ANR. The system also times the callbacks of your other components, all of which run on the main thread by default. A <code>BroadcastReceiver</code> must finish <code>onReceive()</code> within a set time, which is 5 seconds while your app has an Activity in the foreground. A service must get through <code>onCreate()</code> and <code>onStartCommand()</code> within a few seconds. For apps targeting Android 14, a <code>JobService</code> that doesn't return from <code>onStartJob()</code> or <code>onStopJob()</code> within a few seconds gets a reported ANR too.</p>
<p>The ANR title in Play Console tells you which deadline you missed. Block the main thread from two places and read the titles.</p>`,
        visual(el) {
          const SEC = 300, TOTAL = 8;
          const KINDS = {
            tap: { label: 'click handler', start: 0.5, block: 'exportNotes()  // 7 s on main', fix: 'scope.launch { withContext(Dispatchers.IO) { exportNotes() } }',
              anr: 'ANR in com.example.notes: Input dispatching timed out (Waited 5000ms for MotionEvent)' },
            rx: { label: 'BroadcastReceiver', start: 0, block: 'onReceive() { uploadLogs() }  // 7 s on main', fix: 'onReceive() { WorkManager.getInstance(context).enqueue(upload) }',
              anr: 'ANR in com.example.notes: Broadcast of Intent { act=com.example.SYNC_DONE cmp=com.example.notes/.SyncReceiver }' },
          };
          let kind = 'tap', fixed = false, busy = false;
          const root = h('div', { class: 'viz' });
          const mkLane = name => { const track = h('div', { class: 'lane-track' }); return { track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track) }; };
          const main = mkLane('main'), bg = mkLane('background');
          const limit = h('span', { class: 'pf-limit' });
          main.track.append(limit);
          const clock = h('span', { class: 'clock' }, '0.0 s');
          const src = h('div', { class: 'kt' });
          const o = out();
          const keys = Object.keys(KINDS);
          const kBtns = keys.map(k => act(KINDS[k].label, () => { if (busy) return; kind = k; paint(); }));
          const fixT = toggle('pf-d2-anrfix', 'Use the fix', false, v => { if (busy) { fixT.input.checked = fixed; return; } fixed = v; paint(); });
          function paint() {
            press(kBtns, kBtns[keys.indexOf(kind)]);
            const k = KINDS[kind];
            src.innerHTML = hl(fixed ? k.fix : k.block);
            limit.style.left = ((k.start + 5) / TOTAL) * 100 + '%';
            [main, bg].forEach(l => l.track.querySelectorAll('.bar').forEach(b => b.remove()));
            clock.textContent = '0.0 s';
            say(o, `Deadline: 5 s after the ${kind === 'tap' ? 'tap' : 'broadcast is delivered'}. Press Run.`);
          }
          const bar = (lane, cls, s) => { const b = h('span', { class: `bar ${cls}`, style: `left:${(s / TOTAL) * 100}%;width:0` }); lane.track.append(b); return b; };
          async function run() {
            if (busy) return; busy = true;
            try {
              paint();
              const k = KINDS[kind];
              say(o, hl(fixed ? k.fix : k.block));
              const blk = bar(main, fixed ? 'run' : 'block', k.start);
              const work = fixed ? bar(bg, 'run', k.start + 0.1) : null;
              let anr = false;
              const t0 = performance.now();
              for (;;) {
                const t = Math.min((performance.now() - t0) / SEC, 7.5);
                clock.textContent = t.toFixed(1) + ' s';
                if (fixed) { blk.style.width = (Math.max(0, Math.min(t, k.start + 0.1) - k.start) / TOTAL) * 100 + '%'; work.style.width = (Math.max(0, Math.min(t, k.start + 7) - k.start - 0.1) / TOTAL) * 100 + '%'; }
                else blk.style.width = (Math.max(0, Math.min(t, k.start + 7) - k.start) / TOTAL) * 100 + '%';
                if (!fixed && !anr && t >= k.start + 5) { anr = true; line(o, `<span class="bad">${k.anr}</span>`); replay(main.el, 'shake'); }
                if (t >= 7.5) break;
                await sleep(30); if (!root.isConnected) return;
              }
              line(o, fixed ? '<span class="good">main returned at once.</span> The slow part ran in the background, no ANR.' : 'main was blocked past the deadline. The title names the component, so you know where to look.');
            } finally { busy = false; }
          }
          paint();
          o.innerHTML = 'Pick where the slow call happens, then run it.';
          root.append(
            h('div', { class: 'controls' }, kBtns, fixT.el),
            src,
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'threads · red line: deadline'), clock),
            h('div', { class: 'timeline' }, main.el, bg.el),
            h('div', { class: 'controls' }, act('Run', run)),
            o);
          el.append(root);
        },
      },
      {
        title: 'Blocked on a lock, not on work',
        body: `<p>Many ANR traces show a main thread that does nothing at all. Its state is <code>Blocked</code>: it is waiting for a lock that a background thread holds while it does slow I/O. StrictMode doesn't catch this, because the main thread never touches the disk or network itself.</p>
<p>Never hold a lock across I/O. Do the slow part first, then take the lock only to swap in the result. Better still, publish the result through something the main thread can read without a lock, like a <code>StateFlow</code>.</p>`,
        code: `// Before: the lock is held for the whole download
fun refresh() = synchronized(lock) { articles = api.fetchAll() }
fun current(): List<Article> = synchronized(lock) { articles }    // main waits here

// After: slow part outside, a short lock (or a StateFlow) for the swap
fun refresh() {
    val fresh = api.fetchAll()
    synchronized(lock) { articles = fresh }
}`,
        visual(el) {
          const SEC = 320, TOTAL = 8;
          let fixed = false, busy = false;
          const root = h('div', { class: 'viz' });
          const mkLane = name => { const track = h('div', { class: 'lane-track' }); return { track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track) }; };
          const io = mkLane('IO thread'), main = mkLane('main');
          main.track.append(h('span', { class: 'pf-limit', style: `left:${(5.5 / TOTAL) * 100}%` }));
          const owner = h('span', { class: 'chip', style: 'height:36px;font-size:0.82rem' }, 'lock free');
          const clock = h('span', { class: 'clock' }, '0.0 s');
          const o = out();
          const fixT = toggle('pf-d2-shortlock', 'Swap the result under a short lock', false, v => { if (busy) { fixT.input.checked = fixed; return; } fixed = v; say(o, v ? 'Now the download runs outside the lock. Run it.' : 'The lock is held during the download. Run it.'); });
          const bar = (lane, cls, s) => { const b = h('span', { class: `bar ${cls}`, style: `left:${(s / TOTAL) * 100}%;width:0` }); lane.track.append(b); return b; };
          const W = (a, b) => (Math.max(0, b - a) / TOTAL) * 100 + '%';
          async function run() {
            if (busy) return; busy = true;
            try {
              [io, main].forEach(l => l.track.querySelectorAll('.bar').forEach(b => b.remove()));
              say(o, `${hl('refresh()')} on IO, then the user taps and main calls ${hl('current()')} at 0.5 s`);
              const dl = bar(io, fixed ? 'run' : 'block', 0), swap = fixed ? bar(io, 'block', 6) : null;
              const wait = bar(main, fixed ? 'run' : 'wait', 0.5);
              let anr = false, tapped = false;
              const t0 = performance.now();
              for (;;) {
                const t = Math.min((performance.now() - t0) / SEC, 7);
                clock.textContent = t.toFixed(1) + ' s';
                dl.style.width = W(0, Math.min(t, 6));
                if (swap) swap.style.width = W(6, Math.min(t, 6.08));
                owner.textContent = !fixed && t < 6 ? 'held by IO (download)' : fixed && t >= 6 && t < 6.08 ? 'held by IO (swap)' : 'lock free';
                if (t >= 0.5) {
                  if (fixed) { wait.style.width = W(0.5, Math.min(t, 0.56)); if (!tapped) { tapped = true; line(o, '<span class="good">0.5 s: main got the lock at once</span> and showed the old list. No waiting.'); } }
                  else wait.style.width = W(0.5, Math.min(t, 6));
                }
                if (!fixed && !anr && t >= 5.5) {
                  anr = true; replay(main.el, 'shake');
                  line(o, '<span class="bad">ANR: Input dispatching timed out</span>');
                  ['"main" prio=5 tid=1 Blocked', '  at com.example.news.ArticleCache.current(ArticleCache.kt:31)', '  - waiting to lock &lt;0x0b3c2e1f&gt; (a java.lang.Object) held by thread 14',
                    '"DefaultDispatcher-worker-2" prio=5 tid=14 Native', '  at java.net.SocketInputStream.socketRead0(Native method)', '  - locked &lt;0x0b3c2e1f&gt; (a java.lang.Object)'].forEach(s => line(o, s, 'pf-pre'));
                }
                if (t >= 7) break;
                await sleep(30); if (!root.isConnected) return;
              }
              if (fixed) line(o, '6.0 s: IO swapped in the new list in a few microseconds.');
            } finally { busy = false; }
          }
          o.innerHTML = 'The IO thread refreshes the cache while holding its lock. Run it.';
          root.append(
            h('div', { class: 'controls' }, fixT.el),
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'cache lock'), owner, clock),
            h('div', { class: 'timeline' }, io.el, main.el),
            h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'bar block' }), 'holds the lock'), h('span', {}, h('i', { class: 'bar wait' }), 'waiting for the lock'), h('span', {}, h('i', { class: 'bar run' }), 'running')),
            h('div', { class: 'controls' }, act('Run', run)),
            o);
          el.append(root);
        },
      },
      {
        title: 'Read your ANRs from the field',
        body: `<p>Play Console groups ANRs and shows the main thread's stack for each cluster. On Android 11 and later, your app can also read its own recent exits on the next launch with <code>ApplicationExitInfo</code>. For an ANR it includes the full thread dump, so you can send it to your own crash reporting.</p>`,
        code: `if (Build.VERSION.SDK_INT >= 30) {
    val am = getSystemService(ActivityManager::class.java)
    am.getHistoricalProcessExitReasons(packageName, 0, 5)
        .filter { it.reason == ApplicationExitInfo.REASON_ANR }
        .forEach { info ->
            val dump = info.traceInputStream?.bufferedReader()?.use { it.readText() }
            crashReporter.logAnr(info.timestamp, info.description, dump)
        }
}`,
      },
    ],
    underHood: {
      body: `<p>For input, the system's input dispatcher sends each event to your window and waits for the app to report that it finished handling it. If an event stays unfinished for 5 seconds, the dispatcher reports an ANR to the activity manager. Component timeouts work the same way: the system starts a timer when it hands your app the callback and cancels it when the app reports back.</p>
<p>On an ANR, the system sends your process <code>SIGQUIT</code>. ART's signal catcher thread then writes the stack of every thread to a trace file, which is what Play Console and <code>ApplicationExitInfo</code> show you. A foreground app then gets the "isn't responding" dialog. A background ANR usually ends with the process killed and no dialog.</p>`,
    },
    mistakes: [
      {
        title: 'commit() on the main thread',
        bad: `fun onSaveClicked(text: String) {
    prefs.edit().putString("draft", text).commit()   // waits for the disk
}`,
        good: `fun onSaveClicked(text: String) {
    scope.launch { dataStore.edit { it[DRAFT] = text } }   // writes off main
}`,
        why: '<code>commit()</code> writes the file before it returns. On slow or busy storage that can take hundreds of milliseconds or more. DataStore does its I/O on a background dispatcher.',
      },
      {
        title: 'Waiting on a Future from the main thread',
        bad: `button.setOnClickListener {
    val user = executor.submit(Callable { api.user(id) }).get()   // blocks main
    show(user)
}`,
        good: `button.setOnClickListener {
    lifecycleScope.launch {
        val user = withContext(Dispatchers.IO) { api.user(id) }
        show(user)
    }
}`,
        why: 'Moving work to another thread doesn’t help if main then waits for it. <code>get()</code>, <code>join()</code> and <code>runBlocking</code> all park the main thread.',
      },
      {
        title: 'Real work inside onReceive',
        bad: `override fun onReceive(context: Context, intent: Intent) {
    val report = LogCollector.buildReport(context)   // seconds of I/O
    api.upload(report)
}`,
        good: `override fun onReceive(context: Context, intent: Intent) {
    WorkManager.getInstance(context).enqueue(
        OneTimeWorkRequestBuilder<UploadLogsWorker>().build()
    )
}`,
        why: '<code>onReceive()</code> runs on the main thread with a short deadline. Hand anything slow to WorkManager, which also survives the process being killed.',
      },
    ],
  };

  const profilerDepth = {
    deeper: [
      {
        title: 'Call chart for order, flame chart for totals',
        body: `<p>One method recording has several views. The <em>call chart</em> is a timeline: x is time, so a function called three times shows up as three bars, in the order they ran. The <em>flame chart</em> merges identical call stacks, so those three calls become one wide bar and you see the total at a glance.</p>
<p>Use the call chart to see when things ran and what overlapped. Use the flame chart, or the top down and bottom up tables, to see where the time went. Switch views and click a bar.</p>`,
        visual(el) {
          const CALLS = [
            ['doFrame', 0, 0, 24], ['onBindViewHolder', 1, 1, 7], ['formatDate', 2, 2, 6],
            ['onBindViewHolder', 1, 8, 14], ['formatDate', 2, 9, 13],
            ['onBindViewHolder', 1, 15, 23], ['formatDate', 2, 16, 19], ['decodeBitmap', 2, 19, 23],
          ].map(([n, d, s, e]) => ({ n, d, s, e, ms: e - s }));
          const MERGED = [
            { n: 'doFrame', d: 0, s: 0, ms: 24, calls: 1 }, { n: 'onBindViewHolder', d: 1, s: 0, ms: 20, calls: 3 },
            { n: 'formatDate', d: 2, s: 0, ms: 11, calls: 3 }, { n: 'decodeBitmap', d: 2, s: 11, ms: 4, calls: 1 },
          ];
          const SPAN = 24;
          let view = 'call';
          const flame = h('div', { class: 'pf-flame', role: 'group', 'aria-label': 'Recording of one frame' });
          const axis = h('div', { class: 'pf-row' });
          const o = out();
          const vBtns = [act('Call chart', () => setView('call')), act('Flame chart', () => setView('flame'))];
          function render() {
            const rows = [0, 1, 2].map(() => h('div', { class: 'pf-frow' }));
            const items = view === 'call' ? CALLS : MERGED;
            items.forEach((c, i) => rows[c.d].append(h('button', {
              class: 'pf-fl pf-grow' + (c.n === 'decodeBitmap' || c.n === 'formatDate' ? ' pf-warm' : ''),
              style: `left:${(c.s / SPAN) * 100}%;width:calc(${(c.ms / SPAN) * 100}% - 2px);animation-delay:${i * 40}ms`,
              title: `${c.n}: ${c.ms} ms`, 'aria-label': `${c.n}, ${c.ms} ms`,
              onclick() { pick(c); },
            }, c.n)));
            flame.replaceChildren(...rows);
            axis.replaceChildren(h('span', { class: 'pf-label' }, view === 'call' ? 'x axis: time, 0 to 24 ms' : 'x axis: share of total time, not order'));
          }
          function setView(v) {
            view = v; press(vBtns, vBtns[v === 'call' ? 0 : 1]); render();
            say(o, v === 'call' ? 'Call chart: three separate onBindViewHolder calls, in order, with gaps between them.' : 'Flame chart: the three calls merged into one 20 ms bar. formatDate adds up to 11 ms across them.');
          }
          function pick(c) {
            if (view === 'call') {
              const nth = CALLS.filter(x => x.n === c.n).indexOf(c) + 1;
              say(o, `${hl(c.n)} <span class="muted">call ${nth}, ran from ${c.s} to ${c.e} ms</span> · ${c.ms} ms`);
            } else say(o, `${hl(c.n)} <span class="good">${c.ms} ms total</span> <span class="muted">across ${c.calls} call${c.calls > 1 ? 's' : ''}, ${Math.round((c.ms / SPAN) * 100)}% of the frame</span>`);
          }
          press(vBtns, vBtns[0]); render();
          o.innerHTML = 'One 24 ms frame binding three rows. Click a bar, then switch views.';
          el.append(h('div', { class: 'controls' }, vBtns), flame, axis, o);
        },
      },
      {
        title: 'Sampling and tracing change the numbers',
        body: `<p>A <em>traced</em> recording hooks every method entry and exit. It counts every call exactly, but each hook costs time, so tiny functions called thousands of times look much slower than they are. A <em>sampled</em> recording takes the call stacks at a fixed interval. Its overhead is low, but it estimates time from how often a function shows up, and very short calls may never be caught.</p>
<p>Sample to find where time goes. Trace when you need exact call counts. Neither is a stopwatch, so confirm a fix with a benchmark.</p>`,
        visual(el) {
          const FN = [
            { n: 'parseFeed()', calls: 1, ms: 40 },
            { n: 'Article.hashCode()', calls: 20000, ms: 10 },
            { n: 'formatDate()', calls: 60, ms: 6 },
            { n: 'onScrollTick()', calls: 30, ms: 0.6 },
          ];
          const COST = 0.001; // ms of hook overhead per traced call, illustrative
          let mode = 'real';
          const rows = FN.map(f => {
            const fill = h('span');
            const val = h('span', { class: 'pf-d2-mv' }), calls = h('span', { class: 'pf-d2-mc' });
            return { f, fill, val, calls, el: h('div', { class: 'pf-d2-mrow' }, h('span', { class: 'pf-d2-mn' }, f.n), h('div', { class: 'pf-heap-bar' }, fill), val, calls) };
          });
          const o = out();
          const MODES = [['real', 'what really happened'], ['trace', 'traced recording'], ['sample', 'sampled, every 1 ms']];
          const mBtns = MODES.map(([k, label]) => act(label, () => setMode(k)));
          const shown = f => mode === 'trace' ? f.ms + f.calls * COST : mode === 'sample' ? Math.floor(f.ms) : f.ms;
          function setMode(k) {
            mode = k; press(mBtns, mBtns[MODES.findIndex(m => m[0] === k)]);
            const max = Math.max(...FN.map(shown));
            rows.forEach(r => {
              const v = shown(r.f);
              r.fill.style.width = (v / max) * 100 + '%';
              r.val.textContent = mode === 'sample' ? (v ? `≈${v} ms` : 'not seen') : `${+v.toFixed(2)} ms`;
              r.calls.textContent = mode === 'sample' ? 'calls ?' : `${r.f.calls.toLocaleString('en-US')} calls`;
              r.el.classList.toggle('pf-d2-skew', mode === 'trace' && r.f.calls > 1000);
              replay(r.el, 'pop-soft');
            });
            say(o, {
              real: 'The truth: parseFeed is the cost. hashCode is cheap per call.',
              trace: '<span class="bad">hashCode looks three times slower:</span> 20,000 calls each paid the hook cost. The counts are exact, the time is inflated.',
              sample: 'Close to the truth for the big items. <span class="muted">onScrollTick runs 30 times for 0.02 ms each and fell between samples.</span>',
            }[k]);
          }
          setMode('real');
          el.append(h('div', { class: 'controls' }, mBtns), h('div', { class: 'pf-d2-mt' }, rows.map(r => r.el)),
            h('p', { class: 'tip' }, 'The overhead per call here is made up to show the effect. Real overhead depends on the device and the runtime.'), o);
        },
      },
      {
        title: 'Read thread states in a system trace',
        body: `<p>In a Perfetto system trace each thread's row is colored by state. <em>Running</em> means it has a CPU and does work. <em>Runnable</em> means it is ready but waits for a free CPU. <em>Sleeping</em> means it waits for something, like a lock, a binder reply or a message. <em>Uninterruptible sleep</em> usually means it waits for disk I/O.</p>
<p>A slow frame where main is mostly sleeping is a waiting problem, not a CPU problem, and a method trace won't show it. Pick a slow frame below.</p>`,
        visual(el) {
          const ST = { run: ['Running', 'var(--accent)'], rnbl: ['Runnable', 'var(--warm)'], sleep: ['Sleeping', 'var(--muted)'], io: ['Uninterruptible sleep', 'var(--err)'] };
          const SCEN = {
            cpu: { label: 'CPU-heavy bind', segs: [['run', 23]], diag: 'Running the whole time: your own code is the cost. Record a method trace or add trace sections to find it.' },
            busy: { label: 'busy device', segs: [['run', 6], ['rnbl', 8], ['run', 5], ['rnbl', 4]], diag: 'Runnable: ready to run but no free CPU. Other threads or apps compete. Check what else runs on the CPUs at that moment.' },
            lock: { label: 'lock or binder', segs: [['run', 4], ['sleep', 15], ['run', 4]], diag: 'Sleeping: waiting for a lock, a binder reply or a message. Select the slice to see which thread woke it up.' },
            disk: { label: 'disk read', segs: [['run', 3], ['io', 17], ['run', 3]], diag: 'Uninterruptible sleep: usually blocked on disk I/O. Move the read off the main thread.' },
          };
          const SPAN = 26;
          const strip = h('div', { class: 'pf-d2-states', 'aria-hidden': 'true' });
          const o = out();
          const keys = Object.keys(SCEN);
          const sBtns = keys.map(k => act(SCEN[k].label, () => pick(k)));
          function pick(k) {
            press(sBtns, sBtns[keys.indexOf(k)]);
            strip.replaceChildren(...SCEN[k].segs.map(([s, ms], i) => h('span', { class: 'pf-d2-st', style: `width:${(ms / SPAN) * 100}%;background:${ST[s][1]};animation-delay:${i * 80}ms`, title: `${ST[s][0]} ${ms} ms` })),
              h('span', { class: 'pf-d2-b16', style: `left:${(16.7 / SPAN) * 100}%` }));
            say(o, SCEN[k].diag);
          }
          pick('lock');
          el.append(h('div', { class: 'controls' }, sBtns),
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'main thread, one 23 ms frame · dashed line: 16.7 ms')),
            strip,
            h('div', { class: 'legend' }, Object.values(ST).map(([n, c]) => h('span', {}, h('i', { style: `background:${c}` }), n))),
            o);
        },
      },
    ],
    underHood: {
      body: `<p>A traced Java and Kotlin recording asks ART to call a hook on every method entry and exit, which is why it slows the app so much. A sampled recording asks ART to record the threads' stacks at a set interval. The callstack sample task uses <code>simpleperf</code>, which samples through the kernel's performance events and also sees native frames.</p>
<p>A system trace is a Perfetto recording of kernel events, like scheduler switches and CPU frequency, plus sections from the framework and your app. <code>trace("label") { }</code> calls <code>Trace.beginSection</code> and <code>endSection</code>, which check whether app tracing is on first, so they cost very little when nobody is recording.</p>`,
    },
    mistakes: [
      {
        title: 'Manual sections without finally',
        bad: `Trace.beginSection("loadFeed")
val feed = repo.load()          // throws: the section never ends
Trace.endSection()`,
        good: `val feed = trace("loadFeed") { repo.load() }   // ends in a finally block`,
        why: 'A section that never ends stretches to the end of the trace and hides everything after it. <code>trace { }</code> always closes it.',
      },
      {
        title: 'A trace section across a suspension point',
        bad: `suspend fun refresh() = trace("refresh") {
    api.fetch()                 // suspends, may resume on another thread
}`,
        good: `suspend fun refresh() = traceAsync("refresh", 1) {
    api.fetch()
}`,
        why: 'A normal section must begin and end on the same thread. After a suspension the coroutine can resume elsewhere and close the wrong slice. Async sections are matched by name and cookie instead.',
      },
      {
        title: 'Building section names in a hot path',
        bad: `fun bind(item: Article) = trace("bind \${item.id}") {
    title.text = item.title
}`,
        good: `fun bind(item: Article) = trace("ArticleAdapter.bind") {
    title.text = item.title
}`,
        why: 'The string template runs on every call, even when nobody is tracing. Constant names are free and group nicely in the trace.',
      },
    ],
  };

  const startupDepth = {
    deeper: [
      {
        title: 'First frame vs full display',
        body: `<p>Time to initial display (TTID) ends at the first frame, which may show only a skeleton. Time to full display (TTFD) ends when the content the user came for is on screen. You mark that moment with <code>reportFullyDrawn()</code>. Logcat then prints <code>Fully drawn</code>, and Macrobenchmark reports <code>timeToFullDisplayMs</code> next to <code>timeToInitialDisplayMs</code>.</p>
<p>In Compose, use <code>ReportDrawnWhen</code> or <code>ReportDrawnAfter</code> from activity-compose. Report too early and the number flatters you. Never report and there is no number at all.</p>`,
        code: `@Composable
fun FeedScreen(viewModel: FeedViewModel) {
    val feed by viewModel.feed.collectAsStateWithLifecycle()
    ReportDrawnWhen { feed.isNotEmpty() }      // reports once the feed is there
    if (feed.isEmpty()) FeedSkeleton() else FeedList(feed)
}`,
        visual(el) {
          const TOTAL = 1450, SLOW = 1.6;
          const MODES = { never: 'never called', early: 'right after setContent', when: 'ReportDrawnWhen { feed.isNotEmpty() }' };
          let mode = 'when', busy = false;
          const root = h('div', { class: 'viz' });
          const lanes = {};
          const tl = h('div', { class: 'timeline' }, [['main', 'main'], ['io', 'feed load'], ['mark', 'reported']].map(([k, n]) => {
            lanes[k] = h('div', { class: 'lane-track' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, n), lanes[k]);
          }));
          const clock = h('span', { class: 'clock' }, '0 ms');
          const screen = h('div', { class: 'phone' });
          const o = out();
          const keys = Object.keys(MODES);
          const mBtns = keys.map(k => act(MODES[k], () => { if (busy) return; mode = k; press(mBtns, mBtns[keys.indexOf(k)]); }));
          const show = w => screen.replaceChildren(w === 'home' ? h('div', { class: 'pf-launcher' }, Array.from({ length: 9 }, (_, i) => h('i', { class: i === 4 ? 'pf-me' : null })))
            : w === 'skel' ? h('div', { class: 'pf-content drop-in' }, [1, 2, 3].map(() => h('div', { class: 'item pf-d2-skel' }, ' ')))
            : h('div', { class: 'pf-content drop-in' }, ['Top stories', 'Markets', 'Sport'].map(t => h('div', { class: 'item' }, t))));
          const SEGS = [['main', 0, 200, 'pf-proc'], ['main', 200, 430, 'pf-actb'], ['main', 430, 460, 'pf-frame'], ['io', 460, 1250, 'run'], ['main', 1250, 1290, 'pf-frame']];
          const mark = at => lanes.mark.append(h('span', { class: 'pf-ttid', style: `left:${(at / TOTAL) * 100}%` }));
          async function launch() {
            if (busy) return; busy = true;
            try {
              Object.values(lanes).forEach(l => l.replaceChildren()); show('home');
              say(o, `cold start, reportFullyDrawn: ${MODES[mode]}`);
              const bars = SEGS.map(([l, s, e, c]) => { const b = h('span', { class: `bar ${c}`, style: `left:${(s / TOTAL) * 100}%;width:0` }); lanes[l].append(b); return { b, s, e }; });
              const t0 = performance.now();
              let skel = false, full = false, early = false;
              for (;;) {
                const t = Math.min((performance.now() - t0) / SLOW, 1300);
                clock.textContent = Math.round(t) + ' ms';
                bars.forEach(x => { x.b.style.width = (Math.max(0, Math.min(t, x.e) - x.s) / TOTAL) * 100 + '%'; });
                if (!skel && t >= 460) { skel = true; show('skel'); line(o, '<span class="good">Displayed com.example.news/.MainActivity: +460ms</span> <span class="muted">// TTID, a skeleton</span>'); }
                if (mode === 'early' && !early && t >= 460) { early = true; mark(460); line(o, 'Fully drawn com.example.news/.MainActivity: +460ms <span class="bad">// claims done while the skeleton shows</span>'); }
                if (!full && t >= 1290) {
                  full = true; show('content');
                  if (mode === 'when') { mark(1290); line(o, '<span class="good">Fully drawn com.example.news/.MainActivity: +1s290ms</span> <span class="muted">// TTFD, real content</span>'); }
                  if (mode === 'never') line(o, '<span class="muted">no Fully drawn line, and Macrobenchmark reports no timeToFullDisplayMs</span>');
                }
                if (t >= 1300) break;
                await sleep(30); if (!root.isConnected) return;
              }
            } finally { busy = false; }
          }
          press(mBtns, mBtns[2]); show('content');
          SEGS.forEach(([l, s, e, c]) => lanes[l].append(h('span', { class: `bar ${c}`, style: `left:${(s / TOTAL) * 100}%;width:${((e - s) / TOTAL) * 100}%` })));
          mark(1290); clock.textContent = '1290 ms';
          o.innerHTML = 'Last launch: skeleton at 460 ms, real feed at 1290 ms. Pick where reportFullyDrawn happens and launch.';
          root.append(h('div', { class: 'controls pf-d2-wrap' }, mBtns),
            h('div', { class: 'pf-split' }, h('div', { class: 'viz' }, h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'cold start'), clock), tl), screen),
            h('div', { class: 'controls' }, act('Cold start', launch)),
            o);
          el.append(root);
        },
      },
      {
        title: 'App Startup: an order, and a way out',
        body: `<p>Libraries used to add their own <code>ContentProvider</code> just to run setup code. Every provider is created before <code>Application.onCreate</code>, on the main thread. App Startup replaces them with one <code>InitializationProvider</code>. Each <code>Initializer</code> lists the initializers it depends on, and App Startup runs those first.</p>
<p>To take one off the startup path, remove its <code>meta-data</code> entry from the merged manifest and call <code>AppInitializer</code> on first use.</p>`,
        code: `class AnalyticsInitializer : Initializer<Analytics> {
    override fun create(context: Context): Analytics = Analytics.start(context, Logger.instance)
    override fun dependencies(): List<Class<out Initializer<*>>> =
        listOf(LoggerInitializer::class.java)       // runs before this one
}

// AndroidManifest.xml: take Ads off the startup path
// <provider android:name="androidx.startup.InitializationProvider"
//     android:authorities="\${applicationId}.androidx-startup"
//     tools:node="merge">
//     <meta-data android:name="com.example.AdsInitializer" tools:node="remove" />
// </provider>

// Later, on the first screen that shows an ad
AppInitializer.getInstance(context).initializeComponent(AdsInitializer::class.java)`,
        visual(el) {
          const TOTAL = 1050, SLOW = 2;
          let lazyAds = false, busy = false, adsDone = false, started = false, lastEnd = 790;
          const root = h('div', { class: 'viz' });
          const lanes = {};
          const tl = h('div', { class: 'timeline' }, [['prov', 'InitializationProvider'], ['app', 'Application.onCreate'], ['act', 'Activity'], ['later', 'on first use']].map(([k, n]) => {
            lanes[k] = h('div', { class: 'lane-track' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, n), lanes[k]);
          }));
          const clock = h('span', { class: 'clock' }, '0 ms');
          const o = out();
          const plan = () => {
            const p = [['prov', 'LoggerInitializer', 40, 'pf-appseg'], ['prov', 'AnalyticsInitializer', 180, 'pf-appseg'], ['prov', 'WorkManagerInitializer', 30, 'pf-appseg']];
            if (!lazyAds) p.push(['prov', 'AdsInitializer', 240, 'pf-appseg']);
            p.push(['app', 'CrashReporter.install', 40, 'pf-appseg'], ['act', 'onCreate + first frame', 260, 'pf-actb']);
            let t = 0; return p.map(([l, n, ms, c]) => { const s = t; t += ms; return { l, n, s, e: t, c }; });
          };
          const lazyT = toggle('pf-d2-lazyads', 'AdsInitializer: <code>tools:node="remove"</code>', false, v => { if (busy) { lazyT.input.checked = lazyAds; return; } lazyAds = v; say(o, v ? 'Ads is no longer in the merged manifest. Start the app again.' : 'Ads runs in the provider again.'); });
          async function coldStart() {
            if (busy) return; busy = true;
            try {
              Object.values(lanes).forEach(l => l.replaceChildren()); adsDone = false; started = false;
              const p = plan(), end = p[p.length - 1].e;
              say(o, 'cold start: the provider runs initializers before Application.onCreate');
              const bars = p.map(x => { const b = h('span', { class: `bar ${x.c}`, title: x.n, style: `left:${(x.s / TOTAL) * 100}%;width:0` }); lanes[x.l].append(b); return { ...x, b }; });
              const logged = new Set(), t0 = performance.now();
              for (;;) {
                const t = Math.min((performance.now() - t0) / SLOW, end);
                clock.textContent = Math.round(t) + ' ms';
                bars.forEach(x => {
                  x.b.style.width = (Math.max(0, Math.min(t, x.e) - x.s) / TOTAL) * 100 + '%';
                  if (t > x.s && !logged.has(x.n)) { logged.add(x.n); line(o, `${esc(x.n)} <span class="muted">${x.e - x.s} ms</span>${x.n === 'LoggerInitializer' ? ' <span class="muted">// first: Analytics depends on it</span>' : ''}`); }
                });
                if (t >= end) break;
                await sleep(30); if (!root.isConnected) return;
              }
              started = true; lastEnd = end;
              line(o, `<span class="good">first frame at ${end} ms</span>${lazyAds ? ', 240 ms sooner without Ads' : ''}`);
            } finally { busy = false; }
          }
          function openAds() {
            if (busy) return;
            if (!started) { say(o, 'Start the app first.'); return; }
            if (!lazyAds) { say(o, 'Ads already ran during startup, before the first frame.'); return; }
            if (adsDone) { say(o, 'initializeComponent() returns the instance it already created. It runs once.'); return; }
            adsDone = true;
            const s = lastEnd + 50;
            lanes.later.append(h('span', { class: 'bar pf-appseg drop-in', title: 'AdsInitializer', style: `left:${(s / TOTAL) * 100}%;width:${(240 / TOTAL) * 100}%` }));
            say(o, `${hl('AppInitializer.getInstance(context).initializeComponent(AdsInitializer::class.java)')} <span class="muted">// 240 ms, after startup, only for users who reach ads</span>`);
          }
          plan().forEach(x => lanes[x.l].append(h('span', { class: `bar ${x.c}`, title: x.n, style: `left:${(x.s / TOTAL) * 100}%;width:${((x.e - x.s) / TOTAL) * 100}%` })));
          clock.textContent = '790 ms'; started = true;
          o.innerHTML = 'Last cold start: four initializers in the provider, first frame at 790 ms.';
          root.append(h('div', { class: 'controls' }, lazyT.el),
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'main thread'), clock), tl,
            h('div', { class: 'controls' }, act('Cold start', coldStart), act('Open the screen with ads', openAds)),
            o);
          el.append(root);
        },
      },
      {
        title: 'Every process runs Application.onCreate',
        body: `<p>A component declared with <code>android:process</code>, like a <code>:sync</code> service or a library's separate crash-handler process, runs in its own process. That process creates your <code>Application</code> too, so its <code>onCreate</code> runs your whole startup again: analytics, the DI graph, the database. Check which process you are in and set up only what it needs.</p>`,
        code: `override fun onCreate() {
    super.onCreate()
    if (Build.VERSION.SDK_INT >= 28 && getProcessName() != packageName) {
        return                                   // a secondary process: skip app-wide setup
    }
    initMainProcess()
}`,
      },
    ],
    underHood: {
      body: `<p>The launcher asks <code>system_server</code> to start your Activity. With no process for your app, it asks Zygote to fork one. Zygote has already loaded the framework classes, which saves a lot of time. The new process runs <code>ActivityThread.main()</code> and attaches to the system, which answers with <code>bindApplication</code>.</p>
<p>On the main thread your app then runs, in this order: <code>Application.attachBaseContext()</code>, every <code>ContentProvider.onCreate()</code> (App Startup's included), then <code>Application.onCreate()</code>. Only after that is the Activity created, started, resumed, laid out and drawn. When that first frame is drawn, the system logs <code>Displayed</code>.</p>`,
    },
    mistakes: [
      {
        title: 'A splash condition that can wait forever',
        bad: `// MainActivity
splash.setKeepOnScreenCondition { !viewModel.feedLoaded.value }
// feedLoaded flips only after the network answers`,
        good: `// ViewModel: ready after the cached feed, or after 2 s at most
val isReady = MutableStateFlow(false)
init {
    viewModelScope.launch {
        withTimeoutOrNull(2_000) { repo.cachedFeed().first() }
        isReady.value = true
    }
}`,
        why: 'Offline or on a slow network the user stares at the logo forever. Gate the splash on local data with a timeout, and show loading states on the real screen.',
      },
      {
        title: 'Eager injection into Application',
        bad: `@HiltAndroidApp
class NewsApp : Application() {
    @Inject lateinit var ads: AdsSdk        // built during super.onCreate()
}`,
        good: `@HiltAndroidApp
class NewsApp : Application() {
    @Inject lateinit var ads: dagger.Lazy<AdsSdk>   // built on first ads.get()
}`,
        why: 'Hilt injects Application fields inside <code>super.onCreate()</code>, so every injected object and its dependencies are built before the first frame. <code>dagger.Lazy</code> or <code>Provider</code> defers that.',
      },
    ],
  };

  const r8Depth = {
    deeper: [
      {
        title: 'Pick the narrowest keep option',
        body: `<p><code>-keep</code> keeps a class and the members you list, with their names. <code>-keepclassmembers</code> keeps the listed members only if the class survives shrinking anyway. <code>-keepclasseswithmembers</code> keeps class and members only if all listed members exist. The modifier <code>allowobfuscation</code> keeps code but lets R8 rename it, and <code>allowshrinking</code> lets R8 remove it when unused.</p>
<p>Since AGP 9.0, <code>-keep class A</code> no longer keeps the default constructor too. Write <code>-keep class A { &lt;init&gt;(); }</code> when reflection creates it. Gson needs the field names below. Try each rule and read what Gson gets.</p>`,
        visual(el) {
          const RULES = [
            ['none', 'no rule'],
            ['keep', '-keep class ...UserDto'],
            ['keepf', '-keep class ...UserDto { <fields>; }'],
            ['members', '-keepclassmembers class ...UserDto { <fields>; }'],
            ['obf', '-keep,allowobfuscation class ...UserDto { <fields>; }'],
          ];
          let rule = 'none', used = true;
          const rows = {
            cls: h('div', { class: 'pf-dl pf-cls' }), name: h('div', { class: 'pf-dl' }), email: h('div', { class: 'pf-dl' }), dump: h('div', { class: 'pf-dl' }),
          };
          const dex = h('div', { class: 'pf-dex', 'aria-live': 'polite' }, Object.values(rows));
          const o = out();
          const rBtns = RULES.map(([k, src]) => h('button', { class: 'cmd', onclick() { rule = k; paint(true); } }, src));
          const usedT = toggle('pf-d2-used', 'ProfileScreen reads <code>user.name</code>', true, v => { used = v; paint(true); });
          function result() {
            // state per row: 'kept' | 'ren' | 'gone'
            const keepCls = ['keep', 'keepf', 'obf'].includes(rule);
            const clsLive = keepCls || used;
            const cls = !clsLive ? 'gone' : rule === 'keep' || rule === 'keepf' ? 'kept' : 'ren';
            const fieldsKept = rule === 'keepf' || (rule === 'members' && clsLive);
            const fieldsRen = rule === 'obf';
            const field = readByCode => !clsLive ? 'gone' : fieldsKept ? 'kept' : fieldsRen ? 'ren' : readByCode && used ? 'ren' : 'gone';
            return { cls, name: field(true), email: field(false), dump: 'gone' };
          }
          const TXT = {
            cls: { kept: 'class com.example.api.UserDto', ren: 'class a.c', gone: 'class com.example.api.UserDto', why: 'nothing references it' },
            name: { kept: '    val name: String', ren: '    val a: String', gone: '    val name: String', why: 'removed' },
            email: { kept: '    val email: String', ren: '    val b: String', gone: '    val email: String', why: 'only Gson reads it' },
            dump: { kept: '    fun debugDump()', ren: '    fun c()', gone: '    fun debugDump()', why: 'never called' },
          };
          function paint(anim) {
            press(rBtns, rBtns[RULES.findIndex(r => r[0] === rule)]);
            const r = result();
            for (const k of Object.keys(rows)) {
              const st = r[k], el2 = rows[k];
              el2.className = 'pf-dl' + (k === 'cls' ? ' pf-cls' : '') + (st === 'gone' ? ' pf-gone' : st === 'ren' ? ' pf-ren' : rule !== 'none' ? ' pf-kept' : '');
              el2.innerHTML = hl(TXT[k][st]) + (st === 'gone' ? `  <span class="pf-why">// ${TXT[k].why}</span>` : st === 'ren' ? '  <span class="pf-why">// renamed</span>' : '');
              if (anim) replay(el2, 'flip');
            }
            const n = Object.values(r).filter(s => s !== 'gone').length;
            const ok = r.name === 'kept' && r.email === 'kept';
            say(o, !used && r.cls === 'gone' ? '<span class="good">Nothing uses UserDto, so R8 removed all of it.</span> Correct and smallest.'
              : !used ? `<span class="muted">Nothing uses UserDto, but the rule keeps ${n} of 4 lines.</span> Dead weight.`
              : ok ? `<span class="good">Gson: name = "Ada", email = "ada@example.com".</span> ${n} of 4 lines kept.`
              : `<span class="bad">Gson: name = ${r.name === 'kept' ? '"Ada"' : 'null'}, email = null.</span> ${r.cls === 'kept' ? 'The class name survived, but Gson matches field names.' : 'Gson looks for fields named name and email.'}`);
          }
          paint(false);
          el.append(h('div', { class: 'controls' }, usedT.el), h('div', { class: 'controls pf-d2-wrap' }, rBtns), dex, o);
        },
      },
      {
        title: 'Library rules land in your app',
        body: `<p>Libraries ship consumer keep rules inside their AARs, and R8 merges them with yours. One broad rule, like <code>-keep class com.chart.** { *; }</code>, keeps a whole library at full size. Global options were worse: a library could add <code>-dontobfuscate</code> or <code>-dontoptimize</code> and switch that off for your entire app.</p>
<p>AGP 9.0 ignores such global options when they come from a prebuilt dependency, and fails the build when your own library module tries to publish them. To see what R8 really used, add <code>-printconfiguration</code> and read the merged file. To learn why a class stayed, use <code>-whyareyoukeeping</code>.</p>`,
        code: `# app/proguard-rules.pro
-printconfiguration build/outputs/logs/configuration.txt
-whyareyoukeeping class com.chart.internal.LegacyRenderer

# AGP 9 marks dropped global options in that file:
# # REMOVED CONSUMER RULE: -dontobfuscate`,
        visual(el) {
          let chart = true, legacy = true, agp = 8;
          const conf = h('div', { class: 'pf-dex' });
          const size = h('span', { class: 'pf-size' }, '—');
          const obf = h('span', { class: 'pf-stat' });
          const o = out();
          const aBtns = [8, 9].map(v => act(`AGP ${v}.x`, () => { agp = v; press(aBtns, aBtns[v - 8]); build(); }));
          const tc = toggle('pf-d2-libchart', 'charts library ships <code>-keep class com.chart.** { *; }</code>', true, v => { chart = v; build(); });
          const tl = toggle('pf-d2-liblegacy', 'old ads SDK ships <code>-dontobfuscate</code>', true, v => { legacy = v; build(); });
          function build() {
            const L = (cls, t) => h('div', { class: 'pf-dl drop-in ' + cls, html: t });
            const rows = [L('pf-why', '# from app/proguard-rules.pro'), L('', hl('-keep class com.example.api.UserDto { <fields>; }'))];
            if (chart) rows.push(L('pf-why', '# from com.chart:charts consumer rules'), L('pf-kept', hl('-keep class com.chart.** { *; }')));
            if (legacy) rows.push(L('pf-why', '# from com.legacy:ads-sdk consumer rules'), agp === 8 ? L('pf-inl', hl('-dontobfuscate')) : L('pf-gone', '# REMOVED CONSUMER RULE: -dontobfuscate'));
            conf.replaceChildren(...rows);
            const off = legacy && agp === 8;
            size.textContent = (6.9 + (chart ? 1.3 : 0) + (off ? 0.4 : 0)).toFixed(1) + ' MB';
            replay(size, 'pop');
            obf.innerHTML = off ? 'obfuscation: <span class="pf-badnum">off for the whole app</span>' : 'obfuscation: <b>on</b>';
            say(o, off ? '<span class="bad">One library turned off renaming for every class you ship.</span> Switch to AGP 9 or drop the SDK.'
              : chart ? 'Renaming works. The charts rule still keeps every class in that library, used or not.' : '<span class="good">Only your own narrow rule is left.</span>');
          }
          press(aBtns, aBtns[0]); build();
          el.append(h('div', { class: 'controls' }, aBtns), h('div', { class: 'controls' }, tc.el, tl.el),
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'configuration.txt'), size, obf), conf, o);
        },
      },
    ],
    underHood: {
      body: `<p>R8 reads your compiled classes and all library classes in one pass. AAPT2 writes keep rules for every class your manifest and layouts name, such as Activities, Services and custom Views, and AGP adds them to yours. Together these are the roots. R8 traces everything reachable from them and drops the rest. Then it optimizes what is left: it inlines, merges classes, removes unused parameters and turns enums into plain ints where it can. Last it renames, writes DEX directly, and records every rename in <code>mapping.txt</code>.</p>
<p>Since AGP 8.12, stack frames from an optimized build name the source file <code>r8-map-id-</code> plus an id instead of <code>SourceFile</code>. The id points at the exact mapping file, so retrace tools can pick the right one.</p>`,
    },
    mistakes: [
      {
        title: 'Keeping whole packages',
        bad: `-keep class com.example.** { *; }`,
        good: `-keep class com.example.api.UserDto { <fields>; }
# or switch the models to kotlinx.serialization, which needs no rule`,
        why: 'One wildcard rule switches R8 off for all your code: nothing is removed, renamed or inlined. Keep only what reflection touches.',
      },
      {
        title: 'Silencing every warning',
        bad: `-dontwarn **`,
        good: `# optional SLF4J binding, never loaded on Android
-dontwarn org.slf4j.impl.StaticLoggerBinder`,
        why: 'R8 warns when code refers to classes that are missing. Hiding all of them also hides the one that crashes at runtime with <code>NoClassDefFoundError</code>.',
      },
      {
        title: 'Using class names as data',
        bad: `analytics.log("screen_view", screen::class.simpleName)   // "a" in release`,
        good: `sealed interface Screen { val analyticsName: String }
data object Home : Screen { override val analyticsName = "home" }

analytics.log("screen_view", screen.analyticsName)`,
        why: 'Obfuscation renames classes, so <code>simpleName</code> becomes "a" or "b" in release builds. Use explicit strings for anything you store, log or send.',
      },
    ],
  };

  // ─── Gap lesson: the main thread's message loop ───────────────────────
  const mainThreadLesson = {
    id: 'main-thread',
    title: 'The main thread: Looper, Handler, MessageQueue',
    tagline: 'One thread, one queue, one message at a time.',
    level: 'intermediate',
    body: `
<p>When your app starts, the system creates one thread for it, the <em>main thread</em>. It is also called the UI thread, because it dispatches input to views and draws them. Under the hood it runs a <code>Looper</code>: an endless loop that takes the next message from a <code>MessageQueue</code> and runs it, one at a time, in order.</p>
<p>Everything on the main thread arrives as a message: a tap, the next frame from Choreographer, a lifecycle callback, and the <code>Runnable</code>s you post with a <code>Handler</code>. A <code>Handler</code> is bound to one Looper. <code>post</code> adds a message that is ready now, <code>postDelayed</code> one that becomes ready later, and <code>removeCallbacks</code> takes it out again.</p>
<p>Because there is only one loop, a slow message makes everything behind it wait. Post a 300 ms task below and watch the frames and your tap queue up behind it. That waiting is jank, and when it lasts seconds, an ANR.</p>`,
    code: `val mainHandler = Handler(Looper.getMainLooper())
val showTip = Runnable { tipView.isVisible = true }

// from any thread: run this on the main thread, after what is already queued
mainHandler.post { statusView.text = "Kaydedildi" }

// run later; the delay is a minimum, not a promise
mainHandler.postDelayed(showTip, 1_000)

// the screen is going away: take it out of the queue
mainHandler.removeCallbacks(showTip)

// Today you mostly write the same thing with coroutines
lifecycleScope.launch {                       // Dispatchers.Main
    val draft = withContext(Dispatchers.IO) { dao.loadDraft() }
    editor.setText(draft.text)                // back on the main queue
}`,
    remember: 'The main thread is a loop over one queue. Every message waits for the one before it, so keep each one short.',
    deeper: [
      {
        title: 'Your own Looper: HandlerThread',
        body: `<p>A plain <code>Thread</code> has no queue. <code>Looper.prepare()</code> creates one for the current thread and <code>Looper.loop()</code> runs it until you quit. <code>HandlerThread</code> does both for you. Post to it with a <code>Handler</code> built on its looper, and the work runs on that thread, one message at a time, in order.</p>
<p>When you are done, call <code>quitSafely()</code>: it handles the messages that are already due and drops the delayed ones. In new code a coroutine dispatcher usually does this job, but you will meet HandlerThread in camera, sensor and media APIs that take a Handler or Looper.</p>`,
        code: `val writer = HandlerThread("draft-writer").apply { start() }
val writerHandler = Handler(writer.looper)

writerHandler.post { dao.save(draft) }      // runs on draft-writer, in order

// when the screen is gone
writer.quitSafely()

// What Looper.prepare() and loop() look like inside a thread
thread {
    Looper.prepare()
    val handler = Handler(Looper.myLooper()!!)
    Looper.loop()                            // blocks here, handling messages
}`,
      },
      {
        title: 'Coroutines on Main post messages too',
        body: `<p><code>Dispatchers.Main</code> on Android is built on a Handler for the main Looper. When a coroutine on Main resumes after <code>withContext(Dispatchers.IO)</code> or a <code>delay</code>, the rest of it is posted as a message to the main queue. So the same rule holds: the code between two suspension points is one message, and it must be short.</p>
<p><code>Dispatchers.Main.immediate</code>, which <code>lifecycleScope</code> and <code>viewModelScope</code> use, skips the post when you are already on the main thread and runs the code right away. See <em>Dispatchers and withContext</em> in the coroutines track.</p>`,
        code: `viewModelScope.launch {                      // Main.immediate: starts inline
    _state.value = Loading
    val list = withContext(Dispatchers.IO) { repo.load() }
    _state.value = Success(list)            // resumed by a message on the main queue
}`,
      },
      {
        title: 'Three shortcuts to the same queue',
        body: `<p>You don’t always need your own Handler. <code>Activity.runOnUiThread</code>, <code>View.post</code> and <code>View.postDelayed</code> put a message on the main queue as well. <code>runOnUiThread</code> runs the action right away if you are already on the UI thread, and posts it otherwise.</p>`,
        code: `executor.execute {
    val bitmap = BitmapFactory.decodeFile(path)          // worker thread
    imageView.post { imageView.setImageBitmap(bitmap) }  // main thread
}

runOnUiThread { progress.isVisible = false }`,
      },
    ],
    mistakes: [
      {
        title: 'Handler() without a Looper',
        bad: `val handler = Handler()            // deprecated: takes the current thread's Looper`,
        good: `val handler = Handler(Looper.getMainLooper())`,
        why: 'The no-argument constructor picks a Looper implicitly. On a thread without one it crashes, and on the wrong thread your work runs somewhere you did not expect. Always pass the Looper.',
      },
      {
        title: 'Delayed posts that outlive the screen',
        bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handler.postDelayed({ showTip() }, 30_000)
}`,
        good: `override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    super.onDestroy()
}
// or: lifecycleScope.launch { delay(30_000); showTip() }`,
        why: 'The queue holds the Runnable, and the Runnable holds the Activity. After a rotation the old Activity stays in memory until the message runs. See <em>Memory leaks</em>.',
      },
      {
        title: 'Touching views from a worker thread',
        bad: `thread {
    val bitmap = download(url)
    avatarView.setImageBitmap(bitmap)     // CalledFromWrongThreadException
}`,
        good: `thread {
    val bitmap = download(url)
    avatarView.post { avatarView.setImageBitmap(bitmap) }
}`,
        why: 'Views are not thread-safe. Only the thread that created the view hierarchy may touch it, so hand the result back through the main queue.',
      },
    ],
    terms: [
      { term: 'Main thread', def: 'The thread the system creates for your app at launch. It dispatches input, runs lifecycle callbacks and draws the UI.' },
      { term: 'Looper', def: 'Runs a message loop for one thread: it takes messages from the thread’s MessageQueue and handles them one by one.' },
      { term: 'MessageQueue', def: 'The time-ordered list of messages and Runnables waiting to run on a Looper’s thread.' },
      { term: 'Handler', def: 'Posts messages and Runnables to one Looper’s queue, now or after a delay, and can remove them again.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Show a tip in one second on the main thread, and cancel it when the screen goes away.', code: 'val handler = Handler(Looper.[[getMainLooper]]())\nval showTip = Runnable { tipView.isVisible = true }\nhandler.[[postDelayed]](showTip, 1_000)\n// onDestroy\nhandler.[[removeCallbacks]](showTip)', why: 'The handler is bound to the main Looper. <code>postDelayed</code> queues the Runnable for later, and <code>removeCallbacks</code> takes it out again.' },
      { type: 'bug', prompt: 'This crashes with CalledFromWrongThreadException. Tap the line.', code: 'fun loadAvatar(url: String) {\n    thread {\n        val bitmap = download(url)\n        avatarView.setImageBitmap(bitmap)\n    }\n}', bug: 3, fix: '        avatarView.post { avatarView.setImageBitmap(bitmap) }', why: 'The download belongs on the worker thread. The view update must go back to the main queue, which <code>View.post</code> does.' },
    ],
    quiz: [
      { q: 'A 300 ms task is running on the main thread when the user taps. What happens to the tap?', options: ['It interrupts the task', 'It waits in the queue until the task finishes', 'It is dropped'], a: 1, why: 'The Looper runs one message at a time. Everything behind a slow message waits.' },
      { q: 'What does <code>postDelayed(r, 500)</code> promise?', options: ['r runs exactly 500 ms from now', 'r runs within 500 ms', 'r runs no earlier than 500 ms from now, later if the queue is busy'], a: 2, why: 'After 500 ms the message is ready, but it still waits for whatever is running.' },
      { q: 'Why is <code>Handler()</code> with no arguments deprecated?', options: ['It picks the current thread’s Looper implicitly, which causes bugs', 'Handlers are replaced by coroutines', 'It leaks memory on every post'], a: 0, why: 'Passing the Looper, like <code>Looper.getMainLooper()</code>, makes the target thread explicit.' },
      { q: 'This runs on the main thread inside an Activity. What is logged, in order?<pre class="code mini">handler.post { log("A") }\nlog("B")\nlifecycleScope.launch { log("C") }</pre>', options: ['A, B, C', 'B, A, C', 'B, C, A'], a: 2, why: 'post() queues A behind the current message. lifecycleScope uses Dispatchers.Main.immediate, so C runs right away because you are already on the main thread.' },
      { q: 'A HandlerThread has one message due now and one posted with a 5 second delay. You call <code>quitSafely()</code>. What happens?', options: ['Both messages run, then the thread ends', 'The due message runs; the delayed one is dropped', 'Both are dropped and the thread ends at once'], a: 1, why: 'quitSafely() handles the messages that are already due and drops the delayed ones. quit() would drop everything.' },
    ],
    visual(el) {
      const SLOW = 8, FRAME = 16.7, STEP = 5;
      const root = h('div', { class: 'viz' });
      const live = alive(root);
      let t = 0, nextVsync = FRAME, running = null, seq = 0, drawn = 0, missed = 0, spin = 0, lastTap = '';
      const queue = [];
      const runName = h('span', { class: 'pf-mt-run' }, 'idle');
      const runFill = h('span', { class: 'pf-mt-fill' });
      const qList = h('div', { class: 'pf-mt-q', 'aria-label': 'MessageQueue' });
      const dot = h('span', { class: 'pf-mt-dot' });
      const clock = h('span', { class: 'clock' });
      const stat = h('span', { class: 'pf-stat' });
      const o = out('Frames arrive every 16.7 ms. Post something.');
      const enqueue = (label, delay, cost, kind) => { const m = { id: ++seq, label, due: t + delay, cost, left: cost, kind, at: t }; queue.push(m); return m; };
      function step() {
        t += STEP;
        while (t >= nextVsync) {
          const pending = queue.some(m => m.kind === 'frame') || (running && running.kind === 'frame');
          if (pending) missed++;
          else { const f = enqueue('Choreographer: doFrame', 0, 3, 'frame'); f.due = nextVsync; }
          nextVsync += FRAME;
        }
        let budget = STEP;
        while (budget > 0) {
          if (!running) {
            const ready = queue.filter(m => m.due <= t).sort((a, b) => a.due - b.due || a.id - b.id)[0];
            if (!ready) break;
            queue.splice(queue.indexOf(ready), 1);
            running = ready;
          }
          const d = Math.min(budget, running.left);
          running.left -= d; budget -= d;
          if (running.left <= 0) {
            if (running.kind === 'frame') { drawn++; spin += 24; }
            if (running.kind === 'tap') {
              const waited = Math.round(t - running.at);
              lastTap = `${waited} ms`;
              o.append(h('div', { class: 'line drop-in', html: `tap handled after <span class="${waited > 100 ? 'bad' : 'good'}">${waited} ms</span>` }));
            }
            if (running.kind === 'tip') o.append(h('div', { class: 'line drop-in', html: `showTip ran at ${Math.round(t)} ms, <span class="muted">${Math.round(t - running.due)} ms after it became due</span>` }));
            if (running.kind === 'heavy') o.append(h('div', { class: 'line drop-in', html: '<span class="bad">parse(json) done.</span> Everything behind it waited 300 ms.' }));
            running = null;
          }
        }
        while (o.children.length > 4) o.firstElementChild.remove();
      }
      function paint() {
        runName.textContent = running ? running.label : 'idle: waiting for a message';
        runName.className = 'pf-mt-run' + (running && running.kind === 'heavy' ? ' pf-mt-hot' : '');
        runFill.style.width = running ? `${(1 - running.left / running.cost) * 100}%` : '0%';
        const shown = queue.slice().sort((a, b) => a.due - b.due || a.id - b.id);
        qList.replaceChildren(...shown.slice(0, 6).map(m => h('span', { class: `pf-mt-msg pf-mt-${m.kind}` + (m.due > t ? ' pf-mt-later' : '') },
          m.label, h('small', {}, m.due > t ? ` in ${Math.ceil(m.due - t)} ms` : ' ready'))),
          shown.length > 6 ? h('span', { class: 'pf-mt-msg' }, `+${shown.length - 6} more`) : '');
        dot.style.transform = `rotate(${spin}deg)`;
        clock.textContent = `${Math.round(t)} ms`;
        stat.innerHTML = `frames drawn <b>${drawn}</b> · vsyncs missed <span class="${missed ? 'pf-badnum' : ''}">${missed}</span>${lastTap ? ` · last tap waited <b>${lastTap}</b>` : ''}`;
      }
      function loop() { if (!live()) return; step(); paint(); setTimeout(loop, STEP * SLOW); }
      root.append(
        h('div', { class: 'controls pf-mt-wrapcmd' },
          cmd('handler.post { saveDraft() }', () => { enqueue('saveDraft()', 0, 2, 'post'); say(o, 'Posted. It runs after whatever is already ready.'); }),
          cmd('handler.postDelayed(showTip, 500)', () => { if (queue.some(m => m.kind === 'tip')) return; enqueue('showTip', 500, 1, 'tip'); say(o, 'Queued for 500 ms from now.'); }),
          cmd('handler.removeCallbacks(showTip)', () => { const i = queue.findIndex(m => m.kind === 'tip'); if (i >= 0) { queue.splice(i, 1); say(o, '<span class="good">removed</span> from the queue before it ran.'); } else say(o, '<span class="muted">nothing to remove</span>'); }),
          cmd('handler.post { parse(json) }  // 300 ms', () => { enqueue('parse(json)', 0, 300, 'heavy'); say(o, '<span class="bad">A 300 ms message is queued.</span> Tap the screen while it runs.'); }),
          act('Tap the screen', () => { enqueue('input: tap', 0, 1, 'tap'); })),
        h('div', { class: 'pf-mt-wrap' },
          h('div', { class: 'pf-mt-box' }, h('span', { class: 'pf-label' }, 'MessageQueue (by due time)'), qList),
          h('div', { class: 'pf-mt-box' }, h('span', { class: 'pf-label' }, 'Looper.loop() runs'), runName, h('span', { class: 'pf-mt-bar' }, runFill),
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-mt-spin', 'aria-hidden': 'true' }, dot), h('span', { class: 'pf-stat' }, 'animation: turns once per drawn frame')))),
        h('div', { class: 'pf-row' }, stat, clock),
        h('p', { class: 'tip' }, 'Shown 8x slower than real time.'),
        o);
      el.append(root);
      paint(); loop();
    },
  };

  Lab.addTrack({
    id: 'perf',
    title: 'Performance and debugging',
    description: 'Find out why an app janks, freezes, leaks or starts slowly, and fix it with the right tool.',
    group: 'Going deeper', requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'frame',
        title: 'The 16 ms frame',
        tagline: 'Every frame has a deadline. Miss it and the user sees a stutter.',
        level: 'intermediate',
        body: `
<p>The display refreshes on a fixed beat called vsync. At 60 Hz your app gets 16.7 ms to produce each frame. At 90 Hz it gets 11.1 ms, and at 120 Hz only 8.3 ms. If a frame is not ready in time, the screen shows the old frame again. That repeat is <em>jank</em>, and users feel it as a stutter in scrolling and animation.</p>
<p>Most of that budget is spent on the main thread. It handles input, runs animations, runs Compose composition and layout (or View measure and layout), and records the drawing commands. A separate RenderThread then sends them to the GPU. Your own code shares the main thread with all of that, so a 20 ms JSON parse or bitmap decode in a click handler or <code>onBindViewHolder</code> drops at least one frame.</p>
<p>The fix is to keep the main thread for UI work only. Move parsing, disk, network and heavy math to <code>Dispatchers.Default</code> or <code>Dispatchers.IO</code>, then post the small result back. JankStats can log slow frames from real users.</p>`,
        code: `// Before: 30 ms of work on the main thread drops two frames at 60 Hz
fun onSearch(query: String) {
    val results = index.search(query)
    _results.value = results
}

// After: the heavy part runs on a background thread
fun onSearch(query: String) {
    viewModelScope.launch {
        val results = withContext(Dispatchers.Default) { index.search(query) }
        _results.value = results            // back on main, cheap
    }
}

// Log frames that missed their deadline (androidx.metrics:metrics-performance)
val jankStats = JankStats.createAndTrack(window) { frame ->
    if (frame.isJank) Log.w("Jank", "\${frame.frameDurationUiNanos / 1_000_000} ms")
}`,
        remember: '60 Hz = 16.7 ms, 120 Hz = 8.3 ms. The main thread is for UI. Everything else goes off it.',
        terms: [
          { term: 'Frame budget', def: 'The time available to produce one frame: 1000 ms divided by the refresh rate, so 16.7 ms at 60 Hz.' },
          { term: 'Jank', def: 'A visible stutter caused by frames that miss their vsync deadline, so the screen repeats an old frame.' },
          { term: 'Vsync', def: 'The display refresh signal that marks each frame deadline; Choreographer schedules app frames on it.' },
          { term: 'RenderThread', def: 'A per-app thread that takes the drawing commands recorded on the main thread and sends them to the GPU.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Run the CPU-heavy search off the main thread.', code: 'viewModelScope.launch {\n    val results = [[withContext]](Dispatchers.[[Default|IO]]) {\n        index.search(query)\n    }\n    _results.value = results\n}', why: '<code>withContext</code> suspends the caller and runs the block on another dispatcher. <code>Default</code> fits CPU work like searching or sorting.' },
          { type: 'bug', prompt: 'Scrolling this photo list stutters. Tap the line that costs frames.', code: 'override fun onBindViewHolder(holder: PhotoHolder, position: Int) {\n    val photo = photos[position]\n    holder.title.text = photo.title\n    holder.image.setImageBitmap(BitmapFactory.decodeFile(photo.path))\n}', bug: 3, fix: '    holder.image.load(File(photo.path))   // Coil decodes off the main thread', why: 'Decoding a full photo takes tens of milliseconds and runs on the main thread during scroll. An image loader decodes in the background, downsamples, and caches.' },
        ],
        quiz: [
          { q: 'What is the frame budget at 120 Hz?', options: ['16.7 ms', '11.1 ms', '8.3 ms'], a: 2, why: '1000 ms / 120 = 8.3 ms. High refresh screens leave less room for main-thread work.' },
          { q: 'A frame takes 25 ms on a 60 Hz screen. What does the user see?', options: ['The frame shows 9 ms late but smoothly', 'The previous frame stays up for an extra vsync, a stutter', 'The app shows an ANR dialog'], a: 1, why: 'The frame missed its deadline, so the display repeats the old one. An ANR takes seconds, not milliseconds.' },
          { q: 'Which of these runs on the main thread?', options: ['Compose composition and layout', 'Sending draw commands to the GPU', 'Work inside <code>withContext(Dispatchers.IO)</code>'], a: 0, why: 'Composition, layout and recording draw commands are main-thread work. RenderThread talks to the GPU.' },
          { q: 'Put one frame in order, from the vsync signal to the screen.', options: ['Input, animation, traversal (measure, layout, draw) on main, then RenderThread issues GPU work, then SurfaceFlinger composites', 'Traversal on main, then input and animation, then RenderThread, then SurfaceFlinger composites', 'Input on main, then RenderThread draws pixels, then main runs layout, then SurfaceFlinger composites'], a: 0, why: 'Choreographer runs input, animation and traversal on the main thread. Draw only records display lists, RenderThread turns them into GPU work, and SurfaceFlinger puts the buffer on screen.' },
          { q: 'A scroll on a 60 Hz phone has 95 frames at 8 ms and 5 frames at 60 ms. The average is 10.6 ms. What is the right reading?', options: ['It is smooth, because the average is well under 16.7 ms', 'The user sees five hitches; look at P95 or P99 and frameOverrunMs, not the average', 'About 10% of the time is lost evenly across every frame'], a: 1, why: 'An average hides the slow end. Five frames far over budget are five visible stutters, which percentiles show and the mean does not.' },
        ],
        deeper: frameDepth.deeper,
        underHood: frameDepth.underHood,
        mistakes: frameDepth.mistakes,
        visual(el) {
          const SCALE = 3, MAXMS = 43, KEEP = 30;
          let hz = 60, work = 0, vsync = 0, pending = 0, pos = 0;
          const hist = [];
          const root = h('div', { class: 'viz' });
          const live = alive(root);
          const frames = h('div', { class: 'pf-frames' });
          const budgetTag = h('span');
          const budget = h('div', { class: 'pf-budget' }, budgetTag);
          const graph = h('div', { class: 'pf-graph', 'aria-hidden': 'true' }, frames, budget);
          const ball = h('span', { class: 'pf-ball' });
          const rail = h('div', { class: 'pf-rail', 'aria-hidden': 'true' }, ball);
          const stat = h('span', { class: 'pf-stat' });
          const o = out('Smooth: every frame fits the budget. Add work on the main thread.');
          const hzBtns = [60, 90, 120].map(v => act(`${v} Hz`, () => { hz = v; press(hzBtns, hzBtns[[60, 90, 120].indexOf(v)]); paintBudget(); say(o, `${v} Hz: each frame has <span class="good">${(1000 / v).toFixed(1)} ms</span>.${work ? ` Your ${work} ms of extra work still does not fit.` : ''}`); }));
          const paintBudget = () => { const b = 1000 / hz; budget.style.bottom = (b * SCALE) + 'px'; budgetTag.textContent = `${b.toFixed(1)} ms budget at ${hz} Hz`; };
          const addWork = (ms, src) => { work = Math.min(work + ms, 32); say(o, `${hl(src)} <span class="muted">// main thread now does +${work} ms of your work per frame</span>`); };
          function tick() {
            if (!live()) return;
            vsync++;
            const b = 1000 / hz;
            if (pending > 0) {
              pending--; hist.push(false);
              frames.append(h('div', { class: 'pf-fbar pf-miss', title: 'missed vsync' }));
              rail.classList.add('pf-stutter');
            } else {
              const fw = 2.5 + Math.random() * 1.5;
              const aw = work ? work * (0.85 + Math.random() * 0.3) : Math.random() * 1.2;
              const d = fw + aw, late = d > b;
              pending = Math.ceil(d / b) - 1;
              const cap = Math.min(d, MAXMS) / d;
              frames.append(h('div', { class: 'pf-fbar' + (late ? ' pf-late' : ''), title: `${d.toFixed(1)} ms` },
                h('i', { class: 'pf-fw', style: `height:${fw * SCALE * cap}px` }), h('i', { class: 'pf-aw', style: `height:${aw * SCALE * cap}px` })));
              hist.push(true);
              pos = (vsync * b * 0.3) % 100; // time-based animation: after a stall it jumps
              ball.style.left = `calc(14px + ${pos} * (100% - 28px) / 100)`;
              rail.classList.remove('pf-stutter');
            }
            while (frames.children.length > KEEP) frames.firstElementChild.remove();
            if (hist.length > 60) hist.shift();
            const missed = hist.filter(x => !x).length;
            stat.innerHTML = `last ${hist.length} vsyncs: <b>${hist.length - missed}</b> new frames, <span class="${missed ? 'pf-badnum' : ''}">${missed} repeats</span>`;
            setTimeout(tick, b * 8); // 8x slow motion
          }
          press(hzBtns, hzBtns[0]); paintBudget();
          root.append(
            h('div', { class: 'controls' }, h('span', { class: 'pf-label' }, 'Display'), hzBtns),
            graph,
            h('div', { class: 'legend' },
              h('span', {}, h('i', { style: 'background:var(--accent)' }), 'framework: input, layout, draw'),
              h('span', {}, h('i', { style: 'background:var(--warm)' }), 'your code on main'),
              h('span', {}, h('i', { style: 'background:var(--err)' }), 'late frame'),
              h('span', {}, h('i', { style: 'background:var(--line);height:4px' }), 'repeated frame')),
            rail,
            h('div', { class: 'pf-row' }, stat),
            h('div', { class: 'controls' },
              cmd('Json.decodeFromString(body)', () => addWork(12, 'Json.decodeFromString(body)')),
              cmd('BitmapFactory.decodeFile(path)', () => addWork(20, 'BitmapFactory.decodeFile(path)')),
              cmd('withContext(Dispatchers.Default) { ... }', () => { work = 0; say(o, '<span class="good">moved off main:</span> the main thread only does UI work again. Frames fit.'); })),
            o);
          el.append(root);
          tick();
        },
      },

      mainThreadLesson,

      // 2 ─────────────────────────────────────────────
      {
        id: 'anr',
        title: 'ANRs and StrictMode',
        tagline: 'Block the main thread for 5 seconds and Android offers to kill your app.',
        level: 'intermediate',
        body: `
<p>ANR means Application Not Responding. The most common one fires when the main thread does not handle an input event, like a tap or a key press, within 5 seconds. The system then shows a dialog that lets the user close your app. Other ANRs fire when a <code>BroadcastReceiver</code> or a <code>Service</code> does not finish its callback in time. Play Console counts them, and a high ANR rate hurts your store ranking.</p>
<p>ANRs come from the same mistakes as jank, only longer. Common causes are disk or database reads on the main thread, <code>runBlocking</code> on main, a lock held by a background thread, and a slow binder call to another process. Network on the main thread throws <code>NetworkOnMainThreadException</code> right away, so you find that one in testing.</p>
<p>StrictMode finds the rest before users do. Turn it on in debug builds. It reports every disk read, disk write or network call on the main thread with a stack trace, and its VM policy catches leaked Activities and unclosed resources. Pick a penalty: <code>penaltyLog()</code> writes to Logcat, <code>penaltyDeath()</code> crashes so nobody can miss it.</p>`,
        code: `class NotesApp : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(
                StrictMode.ThreadPolicy.Builder()
                    .detectDiskReads()
                    .detectDiskWrites()
                    .detectNetwork()
                    .penaltyLog()
                    .build()
            )
            StrictMode.setVmPolicy(
                StrictMode.VmPolicy.Builder()
                    .detectActivityLeaks()
                    .detectLeakedClosableObjects()
                    .penaltyLog()
                    .build()
            )
        }
    }
}

// The fix StrictMode points you to: do the read on an IO thread
suspend fun readDraft(): String = withContext(Dispatchers.IO) {
    draftFile.readText()
}`,
        remember: 'No input handled for 5 s = ANR. StrictMode in debug catches disk and network on main first.',
        terms: [
          { term: 'ANR', def: 'Application Not Responding: the system reports an app whose main thread failed to handle input or finish a component callback in time.' },
          { term: 'Input dispatch timeout', def: 'The 5 second limit for the main thread to handle a touch or key event before the system raises an ANR.' },
          { term: 'StrictMode', def: 'A developer tool that detects slow or risky calls, such as disk access on the main thread, and reports them with a stack trace.' },
          { term: 'NetworkOnMainThreadException', def: 'The exception Android throws when an app opens a network connection on the main thread.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Report disk reads on the main thread to Logcat.', code: 'StrictMode.setThreadPolicy(\n    StrictMode.ThreadPolicy.Builder()\n        .detect[[DiskReads]]()\n        .penalty[[Log]]()\n        .build()\n)', why: '<code>detectDiskReads()</code> picks what to watch and <code>penaltyLog()</code> picks what happens. Use <code>detectAll()</code> to watch everything.' },
          { type: 'bug', prompt: 'Users report an ANR when they tap this button on a slow network. Tap the line.', code: '@Composable\nfun ProfileButton(api: Api, id: String, onLoaded: (User) -> Unit) {\n    val scope = rememberCoroutineScope()\n    Button(onClick = { onLoaded(runBlocking { api.fetchUser(id) }) }) {\n        Text("Load profile")\n    }\n}', bug: 3, fix: '    Button(onClick = { scope.launch { onLoaded(api.fetchUser(id)) } }) {', why: '<code>runBlocking</code> parks the main thread until the request ends. If that takes 5 seconds, the next tap times out. <code>launch</code> suspends instead and keeps the main thread free.' },
        ],
        quiz: [
          { q: 'How long can the main thread leave a tap unhandled before an ANR?', options: ['16 ms', '1 second', '5 seconds'], a: 2, why: 'The input dispatch timeout is 5 seconds. 16 ms is the frame budget, which causes jank, not an ANR.' },
          { q: 'Where should StrictMode penalties be turned on?', options: ['Debug builds', 'Release builds, to catch users’ problems', 'Only in unit tests'], a: 0, why: 'StrictMode adds overhead and <code>penaltyDeath()</code> crashes on purpose. Use it while developing, and use Play Console vitals for release.' },
          { q: 'You call <code>URL(url).readText()</code> on the main thread. What happens?', options: ['It works but may jank', '<code>NetworkOnMainThreadException</code> is thrown', 'An ANR after 5 seconds, always'], a: 1, why: 'Android blocks network on the main thread by default for apps targeting API 11 and up. Disk reads are allowed, which is why StrictMode exists.' },
          { q: 'An ANR trace shows the main thread in state Blocked, waiting for a lock that a worker holds while it writes a file. StrictMode was on in that debug build and reported nothing. Why?', options: ['StrictMode only reports network calls', 'The main thread never touched the disk itself; it only waited on a lock', 'StrictMode only reports problems that last longer than 5 seconds'], a: 1, why: 'StrictMode flags disk and network calls made on the main thread. Waiting on a lock is not one of them. Do the I/O first and take the lock only to swap in the result.' },
          { q: 'Which line makes this screen prone to an ANR?<pre class="code mini">override fun onCreate(s: Bundle?) {   // 1\n  super.onCreate(s)                    // 2\n  val u = runBlocking { repo.load() }  // 3\n  setContent { Profile(u) }            // 4\n}</pre>', options: ['Line 2', 'Line 3', 'Line 4'], a: 1, why: 'runBlocking parks the main thread until the load finishes, so input and frames wait behind it. Load in a coroutine and show a loading state instead.' },
        ],
        deeper: anrDepth.deeper,
        underHood: anrDepth.underHood,
        mistakes: anrDepth.mistakes,
        visual(el) {
          const SEC = 380, TOTAL = 8; // ms of real time per simulated second, timeline length in s
          let busy = false, strict = true;
          const root = h('div', { class: 'viz' });
          const status = h('span', { class: 'pf-pstatus' }, 'Ready');
          const wait = h('button', { onclick() { dialog.hidden = true; status.textContent = 'Waiting…'; } }, 'Wait');
          const close = h('button', { onclick() { dialog.hidden = true; note.textContent = '(process killed, draft lost)'; status.textContent = 'App closed'; } }, 'Close app');
          const dialog = h('div', { class: 'pf-dialog', hidden: true }, h('div', { class: 'pf-dlg', role: 'dialog' }, h('b', {}, 'Notes isn’t responding'), wait, close));
          const note = h('div', { class: 'pf-note' }, 'Groceries: eggs, rice, lemons…');
          const phone = h('div', { class: 'phone pf-phone' }, h('span', { class: 'pf-app-title' }, 'Notes'), note, h('span', { class: 'pf-pbtn' }, 'Save'), status, dialog);
          const mkLane = name => { const track = h('div', { class: 'lane-track' }); return { track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track) }; };
          const main = mkLane('main'), io = mkLane('IO thread'), input = mkLane('tap waiting');
          input.track.append(h('span', { class: 'pf-limit', style: `left:${(5.5 / TOTAL) * 100}%`, title: '5 s after the tap' }));
          const clock = h('span', { class: 'clock' }, '0.0 s');
          const tl = h('div', { class: 'timeline' }, main.el, io.el, input.el);
          const o = out('StrictMode is on. Pick how the app reads the draft file.');
          const strictT = toggle('pf-strict', 'StrictMode (debug)', true, v => { strict = v; say(o, v ? 'StrictMode on: main-thread disk access gets logged.' : 'StrictMode off: nothing warns you.'); });
          const clear = () => { [main, io].forEach(l => l.track.replaceChildren()); input.track.querySelectorAll('.pf-tap, .pf-wait').forEach(x => x.remove()); dialog.hidden = true; clock.textContent = '0.0 s'; };
          const bar = (lane, cls, s, e) => { const b = h('span', { class: `bar ${cls}`, style: `left:${(s / TOTAL) * 100}%;width:${((e - s) / TOTAL) * 100}%` }); lane.track.append(b); return b; };
          async function animate(len, onT) {
            const t0 = performance.now();
            while (root.isConnected) {
              const t = Math.min((performance.now() - t0) / SEC, len);
              clock.textContent = t.toFixed(1) + ' s';
              onT(t);
              if (t >= len) return true;
              await sleep(30);
            }
            return false;
          }
          async function onMain() {
            if (busy) return; busy = true; clear();
            note.textContent = 'Groceries: eggs, rice, lemons…';
            status.textContent = 'Saving…';
            say(o, `${hl('draftFile.readText()')} <span class="muted">// on the main thread, slow storage: 7 s</span>`);
            if (strict) {
              line(o, '<span class="bad">D/StrictMode: StrictMode policy violation; ~duration=7012 ms: android.os.strictmode.DiskReadViolation</span>');
              line(o, '    at java.io.FileInputStream.&lt;init&gt;(FileInputStream.java:160)', 'pf-pre');
              line(o, '    at com.example.notes.DraftStore.read(DraftStore.kt:18)', 'pf-pre');
            }
            const blk = bar(main, 'block', 0, 0);
            const tap = h('span', { class: 'pf-tap', style: `left:${(0.5 / TOTAL) * 100}%`, hidden: true });
            const w = h('span', { class: 'pf-wait', style: `left:${(0.5 / TOTAL) * 100}%;width:0` });
            input.track.append(tap, w);
            let anr = false;
            const ok = await animate(7, t => {
              blk.style.width = (t / TOTAL) * 100 + '%';
              if (t >= 0.5) { tap.hidden = false; w.style.width = ((t - 0.5) / TOTAL) * 100 + '%'; }
              if (!anr && t >= 5.5) {
                anr = true; dialog.hidden = false; replay(phone, 'shake');
                line(o, '<span class="bad">ANR in com.example.notes: Input dispatching timed out. Waited 5000ms for MotionEvent</span>');
              }
            });
            if (!ok) return;
            bar(main, 'run', 7, 7.15);
            if (status.textContent !== 'App closed') status.textContent = 'Saved, 7 s late';
            line(o, 'main thread free at 7.0 s. The queued tap finally runs.');
            busy = false;
          }
          async function onIo() {
            if (busy) return; busy = true; clear();
            note.textContent = 'Groceries: eggs, rice, lemons…';
            status.innerHTML = '<span class="pf-ioring"></span>Saving…';
            say(o, `${hl('withContext(Dispatchers.IO) { draftFile.readText() }')}`);
            bar(main, 'run', 0, 0.1);
            const ioBar = bar(io, 'run', 0, 0);
            const tap = h('span', { class: 'pf-tap', style: `left:${(0.5 / TOTAL) * 100}%`, hidden: true });
            input.track.append(tap);
            let tapped = false;
            const ok = await animate(7, t => {
              ioBar.style.width = (t / TOTAL) * 100 + '%';
              if (!tapped && t >= 0.5) { tapped = true; tap.hidden = false; bar(main, 'run', 0.5, 0.6); line(o, '<span class="good">tap at 0.5 s handled in 10 ms.</span> The main thread was idle.'); }
            });
            if (!ok) return;
            bar(main, 'run', 7, 7.1);
            status.textContent = 'Saved';
            line(o, 'read done on IO. Result posted back to main. No StrictMode warning, no ANR.');
            busy = false;
          }
          function onNet() {
            if (busy) return; clear();
            status.textContent = 'Notes keeps stopping';
            bar(main, 'block', 0, 0.05);
            say(o, `${hl('URL(syncUrl).readText()')} <span class="muted">// on the main thread</span>`);
            line(o, '<span class="bad">FATAL EXCEPTION: main  android.os.NetworkOnMainThreadException</span>');
            line(o, 'Thrown with or without StrictMode. You find this one at once.');
            replay(phone, 'shake');
          }
          root.append(
            h('div', { class: 'controls' }, strictT.el),
            h('div', { class: 'pf-split' }, h('div', { class: 'viz' }, h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'Threads'), clock), tl), phone),
            h('div', { class: 'controls' },
              cmd('draftFile.readText()  // main', onMain),
              cmd('withContext(Dispatchers.IO) { ... }', onIo),
              cmd('URL(syncUrl).readText()  // main', onNet)),
            o);
          el.append(root);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'leaks',
        title: 'Memory leaks',
        tagline: 'A destroyed Activity that something still points at can never be freed.',
        level: 'intermediate',
        body: `
<p>The garbage collector frees an object once nothing reachable points at it. It starts from GC roots, such as static fields and running threads, and follows every reference. An Activity holds its whole view tree, its bitmaps and its context. On every rotation Android destroys the old Activity and creates a new one. If a longer-lived object still references the old one, all of that stays in memory. A few rotations later the app slows down from constant GC, then crashes with <code>OutOfMemoryError</code>.</p>
<p>The usual suspects: a singleton or <code>companion object</code> that stores an Activity, View or Context; a listener or callback registered with a long-lived object and never removed; a coroutine or thread that captures a View and outlives the screen. Fixes follow from that. Store <code>applicationContext</code> in singletons. Pair every register with an unregister in the matching lifecycle callback. Launch UI work in <code>lifecycleScope</code> or <code>viewLifecycleOwner.lifecycleScope</code> so it is cancelled with the screen.</p>
<p>LeakCanary finds leaks for you. Add it as a <code>debugImplementation</code> dependency and nothing else. It watches destroyed Activities, Fragments and ViewModels, dumps the heap when one stays alive, and prints a leak trace. Read the trace from the GC root down. The reference marked with <code>~~~</code> is the one to cut.</p>`,
        code: `// Leak: an object lives as long as the process and keeps an Activity
object LocationRepo {
    private val listeners = mutableListOf<(Location) -> Unit>()
    fun addListener(l: (Location) -> Unit) { listeners += l }
    fun removeListener(l: (Location) -> Unit) { listeners -= l }
}

class MapActivity : ComponentActivity() {
    private val onLocation: (Location) -> Unit = { showOnMap(it) }   // captures this Activity

    override fun onStart() {
        super.onStart()
        LocationRepo.addListener(onLocation)
    }
    override fun onStop() {
        LocationRepo.removeListener(onLocation)   // without this, every rotation leaks
        super.onStop()
    }
}

// Singletons keep the application context, never an Activity
object Analytics {
    private lateinit var appContext: Context
    fun init(context: Context) { appContext = context.applicationContext }
}

// build.gradle.kts: no code needed
// debugImplementation("com.squareup.leakcanary:leakcanary-android:2.14")`,
        remember: 'Long-lived things must not hold short-lived things. Register in onStart, unregister in onStop.',
        terms: [
          { term: 'Memory leak', def: 'Memory the app no longer needs that the garbage collector can’t free because a reachable object still references it.' },
          { term: 'GC root', def: 'A starting point for garbage collection, such as a static field or a live thread; anything reachable from one stays in memory.' },
          { term: 'LeakCanary', def: 'A debug-only library that detects retained Activities, Fragments and ViewModels and prints the reference chain that keeps them alive.' },
          { term: 'applicationContext', def: 'The Context of the Application object, which lives as long as the process and is safe to keep in singletons.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep only a safe context, and stop listening when the screen stops.', code: 'fun init(context: Context) {\n    appContext = context.[[applicationContext]]\n}\n\noverride fun onStop() {\n    LocationRepo.[[removeListener]](onLocation)\n    super.onStop()\n}', why: 'The application context never belongs to a destroyed screen. Removing the listener cuts the only path from the singleton to the Activity.' },
          { type: 'bug', prompt: 'LeakCanary reports a leaked <code>RecyclerView</code> after you navigate away from this Fragment. Tap the line.', code: 'class FeedFragment : Fragment(R.layout.feed) {\n    private val viewModel: FeedViewModel by viewModels()\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        super.onViewCreated(view, savedInstanceState)\n        val list = view.findViewById<RecyclerView>(R.id.list)\n        lifecycleScope.launch {\n            viewModel.items.collect { (list.adapter as FeedAdapter).submitList(it) }\n        }\n    }\n}', bug: 5, fix: '        viewLifecycleOwner.lifecycleScope.launch {', why: 'A Fragment outlives its view on the back stack. <code>lifecycleScope</code> keeps collecting and holds <code>list</code> after <code>onDestroyView</code>. The view lifecycle scope is cancelled with the view.' },
        ],
        quiz: [
          { q: 'Why does a singleton holding an Activity leak?', options: ['The singleton is reachable from a GC root, so the Activity it points at stays reachable too', 'Singletons copy the Activity on each rotation', 'The Activity holds the singleton'], a: 0, why: 'Reachability flows from the root through the singleton to the Activity, so the GC must keep it.' },
          { q: 'What should a long-lived object keep when it needs a Context?', options: ['The current Activity', '<code>context.applicationContext</code>', 'A View’s context'], a: 1, why: 'The application context lives as long as the process, so holding it leaks nothing.' },
          { q: 'In a LeakCanary trace, what does <code>Leaking: YES</code> on <code>MapActivity</code> mean?', options: ['It is destroyed but still reachable', 'It is still on screen', 'It threw an exception'], a: 0, why: 'LeakCanary knows the Activity was destroyed, so being reachable means it leaked. Look up the trace for the reference to cut.' },
          { q: 'An Activity and its presenter reference each other. After a rotation nothing else points at either of them. Is the old Activity leaked?', options: ['Yes, the cycle keeps both alive', 'No, the GC traces from roots, so an unreachable cycle is freed', 'Only until LeakCanary forces a GC'], a: 1, why: 'ART does not count references. It marks what it can reach from GC roots and frees the rest, cycles included. A leak needs a path from a root.' },
          { q: 'A Fragment keeps <code>private var binding: FeedBinding?</code> and goes onto the back stack. What prevents its old view tree from staying in memory?', options: ['Set binding = null in onDestroyView()', 'Set binding = null in onDestroy()', 'Nothing, the Fragment clears view fields itself'], a: 0, why: 'A back-stack Fragment outlives its view. Clearing the field in onDestroyView lets the old view tree go now, not when the Fragment is finally destroyed.' },
        ],
        deeper: leaksDepth.deeper,
        underHood: leaksDepth.underHood,
        mistakes: leaksDepth.mistakes,
        visual(el) {
          const MB = 14, LIMIT = 96;
          let n = 0, fixed = false, busy = false, oom = false;
          const acts = [], listeners = [];
          const root = h('div', { class: 'viz' });
          const refs = h('div', { class: 'pf-refs' });
          const gcRoot = h('div', { class: 'pf-root' }, h('span', { class: 'eyebrow' }, 'GC root'), h('span', { class: 'pf-root-name' }, 'object LocationRepo'), h('span', {}, 'listeners ='), refs);
          const actsBox = h('div', { class: 'pf-acts' });
          const heapNum = h('span', { class: 'pf-stat' });
          const heapFill = h('span');
          const heapBar = h('div', { class: 'pf-heap-bar' }, heapFill);
          const o = out('MapActivity #1 is on screen and registered with LocationRepo. Rotate the phone.');
          const fixT = toggle('pf-unreg', 'removeListener in <code>onStop()</code>', false, v => { fixed = v; say(o, v ? 'Fix on: the next Activity unregisters when it stops. Earlier leaks stay leaked.' : 'Fix off: Activities register and never unregister.'); });
          const used = () => acts.length * MB + 10;
          function paint() {
            refs.replaceChildren(...(listeners.length ? listeners.map(a => h('span', { class: 'pf-ref pop' }, `#${a.n}`)) : [h('span', { class: 'muted-text' }, '[ ]')]));
            acts.forEach(a => {
              a.el.className = 'obj pf-act ' + (a.alive ? 'pf-alive' : a.leak ? 'pf-leak' : 'pf-dead');
              a.state.textContent = a.alive ? 'on screen' : a.leak ? 'leaked, reachable' : 'destroyed';
            });
            const u = used();
            heapNum.innerHTML = `Java heap <b>${u} MB</b> of ${LIMIT} MB`;
            heapFill.style.width = Math.min(100, (u / LIMIT) * 100) + '%';
            heapBar.className = 'pf-heap-bar' + (u >= LIMIT - MB ? ' pf-full' : u > LIMIT / 2 ? ' pf-high' : '');
          }
          function create() {
            n++;
            const state = h('small');
            const a = { n, alive: true, leak: false, state, el: h('div', { class: 'obj pf-act drop-in' }, h('span', { class: 'obj-name' }, `MapActivity #${n}`), state, h('small', {}, `views + bitmaps ≈ ${MB} MB`)) };
            acts.push(a); actsBox.append(a.el); listeners.push(a);
            return a;
          }
          function rotate() {
            if (busy || oom) return;
            const cur = acts.find(a => a.alive);
            if (used() + MB > LIMIT) {
              oom = true; replay(root, 'shake');
              say(o, '<span class="bad">FATAL EXCEPTION: java.lang.OutOfMemoryError: Failed to allocate a 3145740 byte allocation</span>');
              line(o, 'Press Run GC to see what can be freed, or Reset.');
              return;
            }
            if (cur) {
              cur.alive = false;
              if (fixed) listeners.splice(listeners.indexOf(cur), 1);
            }
            const a = create();
            say(o, `rotation: #${cur ? cur.n : '?'} onStop, onDestroy. #${a.n} onCreate, onStart, ${hl('addListener(onLocation)')}${fixed ? ' <span class="good">#' + cur.n + ' removed itself in onStop</span>' : ''}`);
            paint();
          }
          async function gc() {
            if (busy) return; busy = true;
            const dead = acts.filter(a => !a.alive);
            const free = dead.filter(a => !listeners.includes(a)), kept = dead.filter(a => listeners.includes(a));
            say(o, `${hl('Runtime.getRuntime().gc()')} <span class="muted">// walk from GC roots</span>`);
            free.forEach(a => a.el.classList.add('leave'));
            kept.forEach(a => { a.leak = true; replay(a.el, 'shake'); });
            paint();
            await sleep(460); if (!root.isConnected) return;
            free.forEach(a => { a.el.remove(); acts.splice(acts.indexOf(a), 1); });
            if (free.length) oom = false;
            paint();
            line(o, `freed ${free.length * MB} MB. ${kept.length ? `<span class="bad">${kept.length} destroyed Activit${kept.length > 1 ? 'ies' : 'y'} still reachable from LocationRepo.</span>` : '<span class="good">Nothing destroyed is reachable.</span>'}`);
            busy = false;
          }
          function canary() {
            if (busy) return;
            const leaked = acts.filter(a => !a.alive && listeners.includes(a));
            if (!leaked.length) { say(o, 'LeakCanary: <span class="good">0 retained objects.</span> No heap dump needed.'); return; }
            const a = leaked[0];
            const i = listeners.indexOf(a);
            say(o, `LeakCanary: ${leaked.length} retained object${leaked.length > 1 ? 's' : ''}. Heap dump analyzed. First trace:`);
            ['┬───', '│ GC Root: System class', '│', '├─ com.example.LocationRepo class', '│    Leaking: NO (a class is never leaking)', '│    ↓ static LocationRepo.INSTANCE', '├─ com.example.LocationRepo instance', '│    ↓ LocationRepo.listeners', '│                   ~~~~~~~~~', '├─ java.util.ArrayList instance', `│    ↓ ArrayList[${i}]`, '├─ com.example.MapActivity$onLocation$1 instance', '│    ↓ MapActivity$onLocation$1.this$0', '╰→ com.example.MapActivity instance', `     Leaking: YES (Activity#mDestroyed is true) #${a.n}`]
              .forEach(s => line(o, esc(s), 'pf-pre'));
          }
          create(); paint();
          root.append(
            h('div', { class: 'controls' }, fixT.el),
            h('div', { class: 'pf-heap-stage' }, gcRoot, actsBox),
            h('div', { class: 'pf-heap' }, heapNum, heapBar),
            h('div', { class: 'controls' },
              act('Rotate the phone', rotate),
              cmd('Runtime.getRuntime().gc()', gc),
              act('LeakCanary: dump heap', canary)),
            o);
          el.append(root);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'profiler',
        title: 'Android Studio Profiler',
        tagline: 'Measure first. The slow part is rarely where you guess.',
        level: 'advanced',
        body: `
<p>The Profiler in Android Studio runs tasks against a live app. <em>Find CPU hotspots</em> records Java and Kotlin method calls, so you see which functions take the time. <em>Capture system activities</em> records a system trace with Perfetto: every thread, every frame, and when your process was waiting on the CPU, disk or a lock. Start there for jank and slow startup. <em>Heap dump</em> takes a snapshot of every object, and <em>Track memory consumption</em> records allocations over time.</p>
<p>Method traces come with a flame chart. Each bar is a function. Its callers sit below it and the functions it calls sit above. Width is total time spent in that call stack, merged across calls, so left to right is not a timeline. Look for wide bars with little on top of them: that time is spent in the function itself. Click a bar to zoom in.</p>
<p>Profile a build that behaves like release. Debuggable builds turn off optimizations and can run several times slower. Mark the release build <code>profileable</code> in the manifest, or use the Profiler's low overhead mode. Add your own trace sections with <code>trace("label") { }</code> so they show up by name in system traces. In a heap dump, sort by retained size and look for duplicate bitmaps, huge caches and destroyed Activities.</p>`,
        code: `// Name your own code in system traces (androidx.tracing:tracing-ktx)
fun bind(holder: ArticleHolder, item: Article) = trace("ArticleAdapter.bind") {
    holder.title.text = item.title
    holder.date.text = dateFormatter.format(item.publishedAt)
}

// The fix the flame chart pointed to: build the formatter once, not per row
private val dateFormatter = DateTimeFormatter.ofPattern("d MMM yyyy")
    .withZone(ZoneId.systemDefault())

// AndroidManifest.xml, inside <application>: profile a release build
// <profileable android:shell="true" />`,
        remember: 'System trace for jank and startup, method trace for hot code, heap dump for memory. Profile release-like builds.',
        terms: [
          { term: 'System trace', def: 'A Perfetto recording of all threads, CPU scheduling and frames over time, used to find jank and slow startup.' },
          { term: 'Method trace', def: 'A recording of which Java and Kotlin functions ran and for how long, shown as call charts and flame charts.' },
          { term: 'Flame chart', def: 'A chart that merges identical call stacks, with bar width showing total time, so the widest bars are the hottest code paths.' },
          { term: 'Heap dump', def: 'A snapshot of every object in the app heap with its size and references, used to find leaks and memory hogs.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Name this code in a system trace and make the release build profileable.', code: 'fun bind(item: Article) = [[trace]]("ArticleRow.bind") {\n    title.text = item.title\n}\n\n// AndroidManifest.xml\n// <[[profileable]] android:shell="true" />', why: '<code>trace</code> wraps the block in a named section. <code>profileable</code> lets the Profiler attach to a non-debuggable build.' },
          { type: 'bug', prompt: 'A heap dump shows <code>Bitmap</code> retained size climbing to 400 MB. Tap the line.', code: '// Thumbnail cache, sized to 1/8 of the heap in KB\nval maxKb = (Runtime.getRuntime().maxMemory() / 1024 / 8).toInt()\nval thumbCache = object : LruCache<String, Bitmap>(maxKb) {\n    override fun sizeOf(key: String, value: Bitmap): Int = 1\n}', bug: 3, fix: '    override fun sizeOf(key: String, value: Bitmap): Int = value.byteCount / 1024', why: 'The limit is in KB, but <code>sizeOf</code> counts every bitmap as 1. The cache keeps tens of thousands of bitmaps instead of a few megabytes.' },
        ],
        quiz: [
          { q: 'In a flame chart, what does a bar’s width show?', options: ['When the function ran', 'Total time spent in that call stack', 'How many objects it allocated'], a: 1, why: 'Flame charts merge identical stacks and size them by time. Use a call chart to see order over time.' },
          { q: 'Which recording shows dropped frames, every thread and waits on locks?', options: ['System trace', 'Heap dump', 'Allocation tracking'], a: 0, why: 'A system trace shows the timeline of all threads and frames. Method traces only show function timing.' },
          { q: 'Why profile a profileable release build instead of debug?', options: ['Debug builds skip optimizations and add overhead, so timings are wrong', 'The Profiler can’t attach to debug builds', 'Release builds log more'], a: 0, why: 'Debuggable builds run slower in ways users never see. You end up fixing the wrong thing.' },
          { q: 'In a system trace, a slow frame shows the main thread mostly Sleeping, not Running. What is the next step?', options: ['Record a method trace to find the slow function', 'Find what main waits for, like a lock, a binder reply or a message', 'Switch to a sampled recording with a shorter interval'], a: 1, why: 'Sleeping means the thread waits for something. That is a waiting problem, and a method trace of CPU work will not show it.' },
          { q: 'A traced recording says a one-line getter called 50,000 times takes 30% of the time. A sampled recording barely shows it. Which is closer to the truth?', options: ['The traced one, because it counts every call exactly', 'The sampled one, because tracing adds a hook cost to every call and inflates tiny functions', 'Neither; the getter is inlined and should not appear at all'], a: 1, why: 'Traced recordings hook every entry and exit, so many tiny calls look much slower than they are. Confirm with a benchmark before you optimize.' },
          { q: 'What is wrong with this trace section?<pre class="code mini">suspend fun load() = trace("load") {\n  val a = api.fetch()   // suspends\n  db.save(a)\n}</pre>', options: ['trace { } cannot be used from Kotlin', 'After fetch() suspends, the coroutine may resume on another thread and close the wrong slice', 'The label has to be built with a string template'], a: 1, why: 'A normal section must begin and end on the same thread. Across a suspension point, use an async section, which is matched by name and cookie.' },
        ],
        deeper: profilerDepth.deeper,
        underHood: profilerDepth.underHood,
        mistakes: profilerDepth.mistakes,
        visual(el) {
          const BUDGET = 16.7;
          const tree = cached => ({ n: 'Choreographer#doFrame', c: [
            { n: 'input', self: 1 },
            { n: 'ViewRootImpl.performTraversals', c: [
              { n: 'RecyclerView.onLayout', c: [
                { n: 'ArticleAdapter.onBindViewHolder', c: [
                  { n: 'DateUtils.format', c: [
                    cached ? null : { n: 'SimpleDateFormat.<init>', self: 1, c: [{ n: 'DateFormatSymbols.getInstance', self: 7 }, { n: 'Calendar.getInstance', self: 3 }] },
                    { n: cached ? 'DateTimeFormatter.format' : 'SimpleDateFormat.format', self: 3 }] },
                  { n: 'TextView.setText', self: 5 }] },
                { n: 'View.measure', self: 2 }] }] },
            { n: 'View.draw', self: 3 }] });
          let cached = false, zoom = null, sel = null, recording = false;
          const root = h('div', { class: 'viz' });
          const flame = h('div', { class: 'pf-flame', role: 'group', 'aria-label': 'Flame chart of one frame on the main thread' });
          const o = out();
          const budgetMark = h('span', { class: 'pf-fbudget' }, h('span', {}, '16.7 ms'));
          function build() {
            const t = tree(cached);
            // sizes bottom-up, then places children left to right
            const size = node => { node.c = (node.c || []).filter(Boolean); node.c.forEach(size); node.selfMs = node.self || 0; node.ms = (node.self || 0) + node.c.reduce((a, k) => a + k.ms, 0); };
            size(t);
            const place = (node, s, d, parent) => { node.s = s; node.e = s + node.ms; node.d = d; node.parent = parent; let x = s; node.c.forEach(k => { place(k, x, d + 1, node); x += k.ms; }); };
            place(t, 0, 0, null);
            return t;
          }
          let data = build();
          const all = () => { const xs = []; const go = n => { xs.push(n); n.c.forEach(go); }; go(data); return xs; };
          function render(grow) {
            const z = zoom || data, span = z.e - z.s;
            const nodes = all();
            const depth = Math.max(...nodes.map(n => n.d)) + 1;
            const rows = Array.from({ length: depth }, () => h('div', { class: 'pf-frow' }));
            nodes.forEach(n => {
              const l = (n.s - z.s) / span, w = n.ms / span;
              if (l + w <= 0.0001 || l >= 0.9999) return;
              const cl = Math.max(0, l), cw = Math.min(1, l + w) - cl;
              const heat = n.selfMs >= 5 ? ' pf-hot' : n.selfMs >= 2 ? ' pf-warm' : '';
              const b = h('button', { class: 'pf-fl' + heat + (n === sel ? ' pf-sel' : '') + (grow ? ' pf-grow' : ''), style: `left:${cl * 100}%;width:calc(${cw * 100}% - 2px)`, title: `${n.n}: ${n.ms} ms`, 'aria-label': `${n.n}, ${n.ms} ms`, onclick() { pick(n); } }, n.n);
              rows[n.d].append(b);
            });
            budgetMark.style.left = `${Math.min(100, (BUDGET - z.s) / span * 100)}%`;
            budgetMark.style.opacity = z === data ? '1' : '0';
            flame.replaceChildren(...rows);
            flame.append(budgetMark);
          }
          function info(n) {
            const pct = Math.round((n.ms / data.ms) * 100);
            return `${hl(n.n)}  total <span class="good">${n.ms} ms</span>  self ${n.selfMs} ms  <span class="muted">(${pct}% of the frame)</span>`;
          }
          function pick(n) {
            if (recording) return;
            sel = n; zoom = n.c.length ? n : n.parent || n;
            render(false);
            say(o, info(n));
            if (n.n === 'DateFormatSymbols.getInstance') line(o, 'Wide and nothing on top: self time. A new <code>SimpleDateFormat</code> per row loads locale data every time.');
          }
          function summary() {
            say(o, `${hl('Choreographer#doFrame')} <span class="${data.ms > BUDGET ? 'bad' : 'good'}">${data.ms} ms</span> <span class="muted">// budget ${BUDGET} ms at 60 Hz</span>`);
            line(o, data.ms > BUDGET ? 'Over budget. Click the widest bars to drill in.' : '<span class="good">Fits the budget.</span> The formatter is built once and reused.');
          }
          async function record() {
            if (recording) return; recording = true;
            zoom = null; sel = null;
            say(o, 'Find CPU hotspots: recording one scroll frame…');
            flame.replaceChildren();
            await sleep(500); if (!root.isConnected) return;
            render(true);
            await sleep(500);
            recording = false; summary();
          }
          const cacheT = toggle('pf-cache', 'Reuse one <code>DateTimeFormatter</code>', false, v => { cached = v; data = build(); zoom = null; sel = null; render(true); summary(); });
          render(false); summary();
          root.append(
            h('div', { class: 'controls' }, cacheT.el),
            h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'main thread · one frame · callers below, callees above')),
            flame,
            h('div', { class: 'legend' },
              h('span', {}, h('i', { style: 'background:rgba(169,140,255,0.6)' }), 'time in callees'),
              h('span', {}, h('i', { style: 'background:var(--warm)' }), 'some self time'),
              h('span', {}, h('i', { style: 'background:var(--err)' }), '5 ms+ self time')),
            h('div', { class: 'controls' },
              act('Record: Find CPU hotspots', record),
              act('Zoom out', () => { if (recording) return; zoom = null; sel = null; render(false); summary(); })),
            o);
          el.append(root);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'compose-perf',
        title: 'Compose performance debugging',
        tagline: 'Count recompositions, read the compiler’s verdict, then fix the one that matters.',
        level: 'advanced',
        body: `
<p>Before you change code, find which composables run too often. The Layout Inspector in Android Studio shows two counts per composable on a running debug app: how many times it recomposed and how many times it skipped. Interact with the screen and watch the counts. A row that recomposes on every keystroke or every scroll pixel is your lead. Composition tracing adds composable names to system traces, so you can see their cost in time too.</p>
<p>Then ask the compiler why. Compose compiler reports list every class as <em>stable</em> or <em>unstable</em> and every parameter that made a composable restart. The Compose, advanced track explains stability in depth. Here, read the report and act on it: an <code>unstable</code> parameter that gets a new instance each time can’t be skipped.</p>
<p>Three fixes cover most cases. Give lazy list items a <code>key</code> so inserting a row does not rebind every row below it. Wrap state that changes often but matters rarely, such as scroll position, in <code>derivedStateOf</code>. Make data classes stable with immutable collections or <code>@Immutable</code>. Strong skipping already remembers lambdas for you, so a lambda in a parameter is rarely the problem now. A lambda that captures a new unstable object each time still is.</p>`,
        code: `@Immutable   // tags is a List, so Item was unstable before this
data class Item(val id: Long, val title: String, val tags: List<String>)

@Composable
fun ItemList(items: List<Item>, onOpen: (Long) -> Unit) {
    val listState = rememberLazyListState()
    val showTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }
    Box {
        LazyColumn(state = listState) {
            items(items, key = { it.id }) { item ->
                ItemRow(item, onClick = { onOpen(item.id) })
            }
        }
        if (showTop) ScrollToTopButton(listState)
    }
}

// build.gradle.kts: write stability reports to build/compose_compiler
composeCompiler {
    reportsDestination = layout.buildDirectory.dir("compose_compiler")
    metricsDestination = layout.buildDirectory.dir("compose_compiler")
}`,
        remember: 'Inspector counts show what runs too often. Compiler reports show why. key, derivedStateOf and stable types fix most of it.',
        terms: [
          { term: 'Layout Inspector', def: 'An Android Studio tool that shows the live UI tree of a running app, including recomposition and skip counts per composable.' },
          { term: 'Recomposition count', def: 'How many times a composable has run again since it first appeared, as shown in the Layout Inspector.' },
          { term: 'Compose compiler reports', def: 'Text files from the Compose compiler that list each class’s stability and each composable’s skippable and restartable status.' },
          { term: 'Composition tracing', def: 'A runtime-tracing dependency that adds composable function names to system traces so you can see how long each one takes.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Stop rebinding every row on insert, and stop recomposing on every scroll step.', code: 'val showTop by remember {\n    [[derivedStateOf]] { listState.firstVisibleItemIndex > 0 }\n}\nLazyColumn(state = listState) {\n    items(items, key = { it.[[id]] }) { ItemRow(it) }\n}', why: '<code>derivedStateOf</code> only notifies readers when the Boolean flips. A stable <code>key</code> lets Compose move existing rows instead of rebinding them by position.' },
          { type: 'bug', prompt: 'The Layout Inspector shows <code>Feed</code> recomposing on every scroll step. Tap the line.', code: '@Composable\nfun Feed(listState: LazyListState, posts: List<Post>) {\n    val showTop = listState.firstVisibleItemIndex > 0\n    Box {\n        LazyColumn(state = listState) { items(posts, key = { it.id }) { PostRow(it) } }\n        if (showTop) ScrollToTop(listState)\n    }\n}', bug: 2, fix: '    val showTop by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }', why: 'Reading <code>firstVisibleItemIndex</code> in composition subscribes <code>Feed</code> to every index change. <code>derivedStateOf</code> narrows that to the moment the Boolean changes.' },
        ],
        quiz: [
          { q: 'Where do you see per-composable recomposition and skip counts?', options: ['Layout Inspector', 'Logcat', 'The APK Analyzer'], a: 0, why: 'The Layout Inspector shows both counts live while you use the app.' },
          { q: 'A compiler report shows <code>unstable item: Item</code>. What does that mean for <code>ItemRow</code>?', options: ['It skips only when it gets the same <code>Item</code> instance', 'It never compiles', 'It always skips'], a: 0, why: 'With strong skipping, unstable parameters are compared by instance. A new but equal object still triggers recomposition.' },
          { q: 'When does <code>derivedStateOf</code> help?', options: ['When the input changes much more often than the result', 'For every piece of state', 'Only for network results'], a: 0, why: 'Scroll position changes constantly, but “show the button” flips rarely. Readers only recompose when the derived value changes.' },
          { q: '<code>x</code> is an animated State that changes every frame. Which modifier runs only layout and draw, not composition, on each frame?', options: ['<code>Modifier.offset(x = x.value.dp)</code>', '<code>Modifier.offset { IntOffset(x.value.toInt(), 0) }</code>', '<code>Modifier.padding(start = x.value.dp)</code>'], a: 1, why: 'The lambda version reads the state during layout, so composition is skipped. The other two read it in the composable body, which runs all three phases.' },
          { q: 'Which line causes endless recomposition?<pre class="code mini">@Composable fun Seen() {\n  var n by remember { mutableIntStateOf(0) } // 1\n  Text("Seen $n times")                      // 2\n  n++                                        // 3\n}</pre>', options: ['Line 1', 'Line 2', 'Line 3'], a: 2, why: 'This is a backwards write: composition writes the state it just read, which schedules it again, forever. Change state in event handlers or effects.' },
        ],
        deeper: composePerfDepth.deeper,
        underHood: composePerfDepth.underHood,
        mistakes: composePerfDepth.mistakes,
        visual(el) {
          const pool = ['Kotlin', 'Compose', 'Flow', 'Room', 'Hilt', 'Ktor'];
          let imm = false, derived = false, keyed = false, busy = false, scrolled = false, next = 3, uid = 4;
          let items = [{ id: 1, t: 'Kotlin' }, { id: 2, t: 'Compose' }, { id: 3, t: 'Flow' }];
          const root = h('div', { class: 'viz' });
          const mk = (name, depth) => {
            const rec = h('span', { class: 'pf-rec' }, '0'), skp = h('span', { class: 'pf-skp' }, '0'), nm = h('span', {}, name);
            const r = { rec: 0, skp: 0, nm, el: h('div', { class: `pf-irow pf-d${depth}` }, nm, rec, skp) };
            r.paint = () => { rec.textContent = r.rec; skp.textContent = r.skp; };
            return r;
          };
          const screen = mk('FeedScreen', 0), search = mk('SearchBar', 1), list = mk('ItemList', 1);
          let rows = items.map(it => Object.assign(mk(`ItemRow("${it.t}")`, 2), { item: it }));
          const rowsBox = h('div', { style: 'display:grid;gap:2px' });
          const insp = h('div', { class: 'pf-insp' }, h('div', { class: 'pf-ihead' }, h('span', {}, 'Layout Inspector'), h('span', {}, 'Recomp.'), h('span', {}, 'Skipped')), screen.el, search.el, list.el, rowsBox);
          const report = h('div', { class: 'kt pf-report' });
          const o = out('Interact with the screen and watch the counts. Then turn on a fix and do it again.');
          const paintRows = () => { rowsBox.replaceChildren(...rows.map(r => r.el)); rows.forEach(r => { r.nm.textContent = `ItemRow("${r.item.t}")`; r.paint(); }); };
          const paintReport = () => {
            report.innerHTML = hl(imm
              ? 'stable class Item {\n  stable val id: Long\n  stable val title: String\n  runtime val tags: List<String>\n}\nrestartable skippable fun ItemRow(\n  stable item: Item\n  stable onClick: Function0<Unit>\n)'
              : 'unstable class Item {\n  stable val id: Long\n  stable val title: String\n  unstable val tags: List<String>\n}\nrestartable skippable fun ItemRow(\n  unstable item: Item\n  stable onClick: Function0<Unit>\n)');
          };
          const flash = (r, kind) => { r.el.classList.remove('pf-hit', 'pf-skipped', 'pf-new'); void r.el.offsetWidth; r.el.classList.add(kind); setTimeout(() => r.el.classList.remove(kind), 900); };
          const hit = r => { r.rec++; r.paint(); flash(r, 'pf-hit'); };
          const skip = r => { r.skp++; r.paint(); flash(r, 'pf-skipped'); };
          async function type() {
            if (busy) return; busy = true;
            items = items.map(it => ({ ...it }));
            say(o, `${hl('query = "k"')} <span class="muted">// ViewModel emits a new list of new Item objects</span>`);
            hit(screen); hit(search); hit(list);
            rows.forEach(r => { r.item = items[rows.indexOf(r)]; imm ? skip(r) : hit(r); });
            line(o, imm ? '<span class="good">Rows skipped:</span> Item is stable, so equal items compare with equals().' : '<span class="bad">Every row recomposed:</span> unstable Item compares by instance, and each one is new.');
            await sleep(900); busy = false;
          }
          async function scroll() {
            if (busy) return; busy = true;
            const steps = scrolled ? [2, 1, 0] : [1, 2, 3];
            say(o, `${hl(`scroll ${scrolled ? 'up' : 'down'} 3 rows`)} <span class="muted">// firstVisibleItemIndex: ${steps.join(', ')}</span>`);
            let runs = 0;
            for (const s of steps) {
              const flips = (s === 0) || (s === 1 && !scrolled);
              if (!derived || flips) { hit(screen); skip(search); skip(list); runs++; }
              await sleep(420); if (!root.isConnected) return;
            }
            scrolled = !scrolled;
            line(o, derived ? `<span class="good">FeedScreen ran ${runs} time.</span> showTop only flipped once.` : `<span class="bad">FeedScreen ran ${runs} times,</span> once per index change. Children skipped.`);
            busy = false;
          }
          async function insert() {
            if (busy) return; busy = true;
            const adding = rows.length < 4;
            if (adding) {
              const it = { id: uid++, t: pool[next++ % pool.length] };
              items = [it, ...items];
              say(o, `${hl(`items.add(0, Item("${it.t}"))`)}`);
            } else {
              items = items.slice(1);
              say(o, `${hl('items.removeAt(0)')}`);
            }
            hit(screen); skip(search); hit(list);
            if (keyed) {
              if (adding) { const r = Object.assign(mk('', 2), { item: items[0] }); rows.unshift(r); paintRows(); flash(r, 'pf-new'); rows.slice(1).forEach(skip); }
              else { const r = rows.shift(); r.el.classList.add('leave'); await sleep(420); paintRows(); rows.forEach(skip); }
              line(o, '<span class="good">With keys,</span> rows follow their item. Only the inserted or removed row changed.');
            } else {
              const old = rows.length;
              if (adding) { const r = Object.assign(mk('', 2), { item: items[old] }); rows.push(r); }
              else { const r = rows.pop(); r.el.classList.add('leave'); await sleep(420); }
              rows.forEach((r, i) => { r.item = items[i]; });
              paintRows();
              rows.forEach((r, i) => { if (i < (adding ? old : rows.length)) hit(r); else flash(r, 'pf-new'); });
              line(o, '<span class="bad">Without keys,</span> rows are tied to positions. Every row got a different item and recomposed.');
            }
            await sleep(500); busy = false;
          }
          const tImm = toggle('pf-imm', '<code>@Immutable</code> Item', false, v => { imm = v; paintReport(); replay(report, 'pop-soft'); });
          const tDer = toggle('pf-derived', '<code>derivedStateOf</code>', false, v => { derived = v; });
          const tKey = toggle('pf-key', '<code>key = { it.id }</code>', false, v => { keyed = v; });
          paintRows(); paintReport();
          root.append(
            h('div', { class: 'controls' }, tImm.el, tDer.el, tKey.el),
            insp,
            h('div', { class: 'controls' },
              act('Type in search', type),
              act('Scroll the list', scroll),
              act('Insert or remove top item', insert)),
            o,
            h('span', { class: 'pf-label' }, 'build/compose_compiler: <module>-classes.txt and <module>-composables.txt'),
            report);
          el.append(root);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'startup',
        title: 'App startup',
        tagline: 'Cold, warm, hot, and everything Application.onCreate makes the user wait for.',
        level: 'intermediate',
        body: `
<p>A <em>cold start</em> begins with no process: the system forks one, creates your <code>Application</code>, runs <code>Application.onCreate</code>, then creates the Activity and draws the first frame. A <em>warm start</em> reuses a live process but creates the Activity again, for example after the user backed out of it. A <em>hot start</em> just brings an existing Activity back to the front. Optimize cold start first, because it is the slowest and includes the other two. Android vitals flags cold starts of 5 seconds or more as excessive.</p>
<p>Everything in <code>Application.onCreate</code> runs before the first frame, on the main thread. Analytics, ads, crash reporting, image loaders and databases all like to init there. Ask for each one: does the first screen need it? If not, create it lazily with <code>by lazy</code>, inject it lazily, or start it on a background thread after the first frame. The App Startup library lets libraries share one <code>ContentProvider</code> and declare init order, instead of each library adding its own provider.</p>
<p>Show a branded screen right away with the SplashScreen API. Call <code>installSplashScreen()</code> before <code>super.onCreate()</code>, and keep it up only while you load what the first screen truly needs. Logcat prints <code>Displayed</code> with the time to initial display. Call <code>reportFullyDrawn()</code> when real content is shown, and Macrobenchmark from the Testing track reports both.</p>`,
        code: `class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()        // before super.onCreate
        super.onCreate(savedInstanceState)
        splash.setKeepOnScreenCondition { !viewModel.isReady.value }
        setContent { NewsApp(viewModel) }
    }
}

class NewsApplication : Application() {
    // Built the first time a screen asks for it, not during startup
    val imageLoader by lazy { ImageLoader.Builder(this).crossfade(true).build() }

    override fun onCreate() {
        super.onCreate()
        CrashReporter.install(this)               // must catch startup crashes: keep it
    }
}

// App Startup: run an initializer from one shared ContentProvider
class AnalyticsInitializer : Initializer<Analytics> {
    override fun create(context: Context): Analytics = Analytics.start(context.applicationContext)
    override fun dependencies(): List<Class<out Initializer<*>>> = emptyList()
}`,
        remember: 'Cold start pays for Application.onCreate. Init only what the first frame needs, the rest lazily.',
        terms: [
          { term: 'Warm start', def: 'A launch where the app process is still alive but the Activity has to be created again.' },
          { term: 'Hot start', def: 'A launch where the Activity is still in memory and only needs to come back to the foreground.' },
          { term: 'TTID', def: 'Time to initial display: from launch until the first frame, printed in Logcat as Displayed.' },
          { term: 'App Startup', def: 'A Jetpack library that runs component initializers from one shared ContentProvider in a declared order.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the splash screen and keep it until the first data is ready.', code: 'override fun onCreate(savedInstanceState: Bundle?) {\n    val splash = [[installSplashScreen]]()\n    super.onCreate(savedInstanceState)\n    splash.[[setKeepOnScreenCondition]] { !viewModel.isReady.value }\n    setContent { NewsApp(viewModel) }\n}', why: '<code>installSplashScreen()</code> must run before <code>super.onCreate()</code>. The keep condition is checked before each frame, so it should be a cheap state read.' },
          { type: 'bug', prompt: 'Cold start takes 3 seconds on a slow network. Tap the line.', code: 'class NewsApplication : Application() {\n    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)\n    private val remoteConfig by lazy { RemoteConfigClient(this) }\n    override fun onCreate() {\n        super.onCreate()\n        CrashReporter.install(this)\n        runBlocking { remoteConfig.fetchAndActivate() }\n    }\n}', bug: 6, fix: '        appScope.launch { remoteConfig.fetchAndActivate() }', why: '<code>runBlocking</code> holds the main thread in <code>Application.onCreate</code> until the network answers, so no Activity can start. Fetch in the background and use cached values for the first screen.' },
        ],
        quiz: [
          { q: 'The process is alive but the user backed out of the Activity. Next launch is a…', options: ['Cold start', 'Warm start', 'Hot start'], a: 1, why: 'The process survives, so the Application is reused, but the Activity is created again.' },
          { q: 'Where must <code>installSplashScreen()</code> be called?', options: ['Before <code>super.onCreate()</code>', 'In <code>onResume()</code>', 'In <code>Application.onCreate()</code>'], a: 0, why: 'It has to set up the splash theme before the Activity inflates its own.' },
          { q: 'Which belongs in <code>Application.onCreate</code>?', options: ['Crash reporting', 'Downloading the feed', 'Building every repository'], a: 0, why: 'Crash reporting must catch startup crashes. Everything else can wait for the screen that needs it.' },
          { q: 'In a cold start, which order does your code run in on the main thread?', options: ['attachBaseContext(), every ContentProvider.onCreate(), Application.onCreate(), then the Activity and its first frame', 'Application.onCreate(), every ContentProvider.onCreate(), attachBaseContext(), then the Activity', 'attachBaseContext(), Application.onCreate(), the Activity, then every ContentProvider.onCreate()'], a: 0, why: 'Providers, App Startup’s included, run after attachBaseContext and before Application.onCreate. All of it happens before the Activity draws.' },
          { q: 'Your app has a sync service declared with <code>android:process=":sync"</code>. Analytics shows two app starts every time it syncs. Why?', options: ['App Startup runs each initializer twice', 'The :sync process creates its own Application, so onCreate runs your startup again there', 'Hilt builds a second copy of every singleton on sync'], a: 1, why: 'Every process runs Application.onCreate. Check which process you are in and set up only what that process needs.' },
        ],
        deeper: startupDepth.deeper,
        underHood: startupDepth.underHood,
        mistakes: startupDepth.mistakes,
        visual(el) {
          const TOTAL = 1150, SLOW = 2.4;
          const plans = {
            cold: { label: 'Cold', eager: [['proc', 0, 180, 'pf-proc', 'fork + bindApplication'], ['app', 180, 400, 'pf-appseg', 'Analytics.init'], ['app', 400, 640, 'pf-appseg', 'AdsSdk.init'], ['app', 640, 730, 'pf-appseg', 'ImageLoader.build'], ['app', 730, 780, 'pf-appseg', 'CrashReporter.install'], ['act', 780, 1000, 'pf-actb', 'onCreate + setContent'], ['frame', 1000, 1080, 'pf-frame', 'first frame']],
              lazy: [['proc', 0, 180, 'pf-proc', 'fork + bindApplication'], ['app', 180, 230, 'pf-appseg', 'CrashReporter.install'], ['act', 230, 450, 'pf-actb', 'onCreate + setContent'], ['frame', 450, 530, 'pf-frame', 'first frame']], splash: true },
            warm: { label: 'Warm', eager: [['act', 0, 220, 'pf-actb', 'onCreate + setContent'], ['frame', 220, 300, 'pf-frame', 'first frame']], splash: true },
            hot: { label: 'Hot', eager: [['act', 0, 40, 'pf-actb', 'onStart + onResume'], ['frame', 40, 90, 'pf-frame', 'next frame']], splash: false },
          };
          let mode = 'cold', lazy = false, busy = false;
          const root = h('div', { class: 'viz' });
          const lanes = {};
          const tl = h('div', { class: 'timeline' }, [['proc', 'Process'], ['app', 'Application'], ['act', 'Activity'], ['frame', 'Frame']].map(([k, name]) => {
            lanes[k] = h('div', { class: 'lane-track' });
            return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), lanes[k]);
          }));
          const clock = h('span', { class: 'clock' }, '0 ms');
          const screen = h('div', { class: 'phone' });
          const o = out();
          const fmt = ms => ms >= 1000 ? `+${Math.floor(ms / 1000)}s${ms % 1000}ms` : `+${ms}ms`;
          const show = what => {
            if (what === 'home') screen.replaceChildren(h('div', { class: 'pf-launcher' }, Array.from({ length: 9 }, (_, i) => h('i', { class: i === 4 ? 'pf-me' : null }))));
            else if (what === 'splash') screen.replaceChildren(h('div', { class: 'pf-splash pop' }, 'N'));
            else screen.replaceChildren(h('div', { class: 'pf-content drop-in' }, ['Top stories', 'Markets', 'Sport'].map(t => h('div', { class: 'item' }, t))));
          };
          const segs = () => (mode === 'cold' && lazy ? plans.cold.lazy : plans[mode].eager);
          function clear() { Object.values(lanes).forEach(l => l.replaceChildren()); }
          const modeBtns = Object.entries(plans).map(([k, p]) => act(`${p.label} start`, () => launch(k)));
          const lazyT = toggle('pf-lazy', 'Init SDKs lazily, after the first frame', false, v => { lazy = v; say(o, v ? 'Only CrashReporter stays in Application.onCreate. Analytics, ads and the image loader start when needed.' : 'Every SDK initializes in Application.onCreate, on the main thread.'); });
          function launch(k) {
            if (busy) return; busy = true;
            mode = k; press(modeBtns, modeBtns[Object.keys(plans).indexOf(k)]);
            clear(); show('home');
            const ss = segs(), end = ss[ss.length - 1][2];
            const bars = ss.map(([lane, s, e, cls, label]) => { const b = h('span', { class: `bar ${cls}`, title: label, style: `left:${(s / TOTAL) * 100}%;width:0` }); lanes[lane].append(b); return { b, s, e, label }; });
            say(o, `${k} start${k === 'cold' ? (lazy ? ', lazy init' : ', eager init') : ''}: ${k === 'cold' ? 'no process yet' : k === 'warm' ? 'process alive, Activity recreated' : 'Activity still in memory'}`);
            const logged = new Set();
            const t0 = performance.now();
            let splashShown = false;
            const tick = now => {
              if (!root.isConnected) return;
              const t = Math.min((now - t0) / SLOW, end);
              clock.textContent = Math.round(t) + ' ms';
              if (plans[k].splash && !splashShown && t > 20) { splashShown = true; show('splash'); }
              bars.forEach(x => {
                x.b.style.width = (Math.max(0, Math.min(t, x.e) - x.s) / TOTAL) * 100 + '%';
                if (t > x.s && !logged.has(x) && x.label !== 'first frame' && x.label !== 'next frame') { logged.add(x); line(o, `${esc(x.label)} <span class="muted">${x.e - x.s} ms</span>`); }
              });
              if (t < end) { requestAnimationFrame(tick); return; }
              lanes.frame.append(h('span', { class: 'pf-ttid', style: `left:${(end / TOTAL) * 100}%` }));
              show('content');
              line(o, `<span class="good">ActivityTaskManager: Displayed com.example.news/.MainActivity ${fmt(end)}</span>`);
              busy = false;
            };
            requestAnimationFrame(tick);
          }
          // open on a finished cold start
          press(modeBtns, modeBtns[0]);
          plans.cold.eager.forEach(([lane, s, e, cls, label]) => lanes[lane].append(h('span', { class: `bar ${cls}`, title: label, style: `left:${(s / TOTAL) * 100}%;width:${((e - s) / TOTAL) * 100}%` })));
          lanes.frame.append(h('span', { class: 'pf-ttid', style: `left:${(1080 / TOTAL) * 100}%` }));
          clock.textContent = '1080 ms';
          show('content');
          o.innerHTML = 'Last cold start: <span class="bad">1080 ms</span> to first frame. 600 ms of it was SDK init in Application.onCreate.';
          root.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'controls' }, lazyT.el),
            h('div', { class: 'pf-split' }, h('div', { class: 'viz' }, h('div', { class: 'pf-row' }, h('span', { class: 'pf-label' }, 'main thread'), clock), tl,
              h('div', { class: 'legend' },
                h('span', {}, h('i', { class: 'bar pf-proc' }), 'process start'),
                h('span', {}, h('i', { class: 'bar pf-app' }), 'Application.onCreate'),
                h('span', {}, h('i', { class: 'bar pf-actb' }), 'Activity'),
                h('span', {}, h('i', { class: 'bar pf-frame' }), 'first frame'))), screen),
            o);
          el.append(root);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'r8',
        title: 'Shrinking with R8',
        tagline: 'Smaller, faster release builds, and the keep rules that stop them breaking.',
        level: 'advanced',
        body: `
<p>With <code>isMinifyEnabled = true</code>, R8 replaces D8 as the step that turns your release build's bytecode into DEX, and it does three jobs. <em>Shrinking</em> starts from entry points like your Activities and removes every class, method and field nothing reaches. <em>Optimization</em> inlines small methods, removes dead branches and merges classes. <em>Obfuscation</em> renames what is left to short names like <code>a.b</code>. Apps often lose a large part of their code size, and they start a little faster too. <code>isShrinkResources = true</code> then removes resources the remaining code no longer uses.</p>
<p>R8 can only see direct references. Code reached through reflection looks unused, so it gets removed or renamed. Typical victims: classes loaded with <code>Class.forName</code>, JSON models that Gson reads by field name, and classes named in XML or native code. Tell R8 about them with keep rules in <code>proguard-rules.pro</code>. Keep as little as you can. Prefer libraries that ship their own rules, and codegen-based ones like kotlinx.serialization, which need almost none.</p>
<p>Renamed code makes crash stack traces unreadable: <code>at a.b.c(r8-map-id-5f2c1a:12)</code>. Every build writes <code>mapping.txt</code>, which maps the short names back. Keep it for every release. Upload it to Play Console and Crashlytics, or run <code>retrace</code> on a trace by hand. Always test the minified release build before shipping, because keep rule bugs only show up there.</p>`,
        code: `// app/build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true      // R8: shrink, optimize, obfuscate code
            isShrinkResources = true    // then drop resources nothing uses
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

// proguard-rules.pro
// Gson reads these fields by name, so keep the class and its members
// -keep class com.example.api.UserDto { *; }
// Loaded with Class.forName("com.example.plugins.PdfPlugin")
// -keep class com.example.plugins.PdfPlugin { <init>(); }
// Keep line numbers so retrace can point at the right line
// -keepattributes SourceFile,LineNumberTable

// Output: app/build/outputs/mapping/release/mapping.txt`,
        remember: 'R8 removes and renames what it can’t see used. Reflection needs keep rules. Keep mapping.txt for every release.',
        terms: [
          { term: 'R8', def: 'The Android compiler step that shrinks, optimizes and obfuscates release code while converting it to DEX.' },
          { term: 'Keep rule', def: 'A line in a ProGuard rules file that stops R8 from removing or renaming the classes and members it matches.' },
          { term: 'Obfuscation', def: 'Renaming classes, methods and fields to short meaningless names to make code smaller and harder to read.' },
          { term: 'mapping.txt', def: 'The file R8 writes for each build that maps obfuscated names back to the original ones, used to retrace crash stack traces.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn on code and resource shrinking for release.', code: 'release {\n    is[[MinifyEnabled]] = true\n    is[[ShrinkResources]] = true\n    proguardFiles(\n        getDefaultProguardFile("proguard-android-optimize.txt"),\n        "proguard-rules.pro"\n    )\n}', why: '<code>isMinifyEnabled</code> runs R8 on code. <code>isShrinkResources</code> needs it, because it removes resources only after code shrinking shows they are unused.' },
          { type: 'bug', prompt: 'After enabling R8, every user’s name parses as <code>null</code>. Tap the rule that is wrong.', code: '# proguard-rules.pro\n# Gson reads UserDto fields by name\n-keep class com.example.api.UserDto\n-keepattributes Signature\n-keepattributes SourceFile,LineNumberTable', bug: 2, fix: '-keep class com.example.api.UserDto { *; }', why: 'Without a member block, <code>-keep class</code> keeps only the class name. R8 still renames <code>name</code> to <code>a</code>, so Gson finds no matching JSON key. <code>{ *; }</code> keeps the fields too.' },
        ],
        quiz: [
          { q: 'What is <code>mapping.txt</code> for?', options: ['Turning obfuscated stack traces back into real names', 'Listing which resources to keep', 'Signing the APK'], a: 0, why: 'It maps <code>a.b.c</code> back to your class and method names. Upload it with every release.' },
          { q: 'Why does a class loaded with <code>Class.forName</code> need a keep rule?', options: ['R8 can’t see reflection, so the class looks unused and is removed', 'Reflection only works in debug', 'Keep rules make reflection faster'], a: 0, why: 'R8 follows direct references from entry points. A class name in a string is invisible to it.' },
          { q: 'Which build should you test before shipping?', options: ['The minified release build', 'Debug is enough', 'Only unit tests'], a: 0, why: 'Missing keep rules only break the R8-processed build. Debug builds never run R8.' },
          { q: 'Gson parses a JSON response fine in debug. In the minified release build every field comes back null or default. What happened?', options: ['Gson does not run on release builds', 'R8 renamed the fields, so the JSON names no longer match them', 'isShrinkResources removed the JSON from the APK'], a: 1, why: 'Gson reads fields by name through reflection, which R8 cannot see. Keep the model’s field names, or use a codegen library like kotlinx.serialization.' },
          { q: 'A class is used normally, so R8 keeps it anyway. You only need its field names to stay unrenamed. Which option is the narrowest fit?', options: ['<code>-keep class Model { *; }</code>', '<code>-keepclassmembers class Model { &lt;fields&gt;; }</code>', '<code>-keepclasseswithmembers class Model { &lt;fields&gt;; }</code>'], a: 1, why: '-keepclassmembers keeps the listed members only if the class survives shrinking anyway. -keep would also force the class itself to stay.' },
        ],
        deeper: r8Depth.deeper,
        underHood: r8Depth.underHood,
        mistakes: r8Depth.mistakes,
        visual(el) {
          const base = [
            { k: 'cls', src: 'class com.example.news.ArticleRepository', ren: 'class a.a' },
            { src: '    fun load(): List<Article>', ren: '    fun a(): List' },
            { src: '    fun debugDump()', why: 'never called', drop: 'shrink' },
            { k: 'cls', src: 'class com.example.news.Session', ren: 'class a.b' },
            { src: '    fun isLoggedIn(): Boolean', why: 'inlined into callers', drop: 'optimize' },
            { k: 'cls', src: 'class com.example.news.LegacyExporter', why: 'nothing references it', drop: 'shrink' },
            { k: 'cls', src: 'class com.example.api.UserDto', ren: 'class a.c', keep: 'dto', why: 'read by Gson' },
            { src: '    val name: String', ren: '    val a: String', keep: 'dto' },
            { k: 'cls', src: 'class com.example.plugins.PdfPlugin', why: 'only via Class.forName', drop: 'shrink', keep: 'plugin' },
            { k: 'cls', src: 'class okhttp3.internal.ws.RealWebSocket', why: 'library code you never use', drop: 'shrink' },
          ];
          const SIZES = { before: 12.4, shrink: 8.1, optimize: 7.6, obfuscate: 6.9 };
          let keepDto = false, keepPlugin = false, phase = 'before', busy = false;
          const root = h('div', { class: 'viz' });
          const dex = h('div', { class: 'pf-dex', 'aria-live': 'polite' });
          const size = h('span', { class: 'pf-size' });
          const phaseTag = h('span', { class: 'pf-label' });
          const o = out('Debug build: no R8. Every class keeps its name and the APK is 12.4 MB.');
          const rows = base.map(r => ({ ...r, el: h('div', { class: 'pf-dl' + (r.k ? ' pf-cls' : '') }) }));
          dex.append(...rows.map(r => r.el));
          const kept = r => (r.keep === 'dto' && keepDto) || (r.keep === 'plugin' && keepPlugin);
          const order = ['before', 'shrink', 'optimize', 'obfuscate'];
          const reached = p => order.indexOf(phase) >= order.indexOf(p);
          function paint() {
            rows.forEach(r => {
              const gone = r.drop && reached(r.drop) && !kept(r);
              const renamed = r.ren && reached('obfuscate') && !kept(r);
              r.el.className = 'pf-dl' + (r.k ? ' pf-cls' : '') + (gone ? (r.drop === 'optimize' ? ' pf-inl pf-gone' : ' pf-gone') : renamed ? ' pf-ren' : (kept(r) && phase !== 'before') ? ' pf-kept' : '');
              r.el.innerHTML = hl(renamed ? r.ren : r.src) + (gone || (kept(r) && phase !== 'before' && r.k) ? `  <span class="pf-why">// ${gone ? r.why : 'kept by rule'}</span>` : '');
            });
            const extra = keepPlugin && reached('shrink') ? 0.1 : 0;
            size.textContent = (SIZES[phase] + extra).toFixed(1) + ' MB';
            phaseTag.textContent = phase === 'before' ? 'before R8' : `after ${phase}`;
          }
          const setRule = which => v => { if (which === 'dto') keepDto = v; else keepPlugin = v; phase = 'before'; paint(); say(o, 'Rules changed. Run R8 again.'); };
          const tDto = toggle('pf-keepdto', '<code>-keep class ...UserDto { *; }</code>', false, setRule('dto'));
          const tPlg = toggle('pf-keepplg', '<code>-keep class ...PdfPlugin</code>', false, setRule('plugin'));
          async function run() {
            if (busy) return; busy = true;
            phase = 'before'; paint();
            say(o, `${hl('./gradlew assembleRelease')} <span class="muted">// R8 runs</span>`);
            for (const p of ['shrink', 'optimize', 'obfuscate']) {
              await sleep(650); if (!root.isConnected) return;
              phase = p; paint(); replay(size, 'pop');
              rows.forEach(r => { if ((r.drop === p && !kept(r)) || (p === 'obfuscate' && r.ren && !kept(r))) replay(r.el, 'flip'); });
              line(o, { shrink: 'shrink: removed unreachable classes and methods', optimize: 'optimize: inlined small methods', obfuscate: 'obfuscate: renamed the rest, wrote mapping.txt' }[p]);
            }
            busy = false;
          }
          let crashed = false;
          function launch() {
            if (busy) return;
            crashed = false;
            if (phase !== 'obfuscate') { say(o, phase === 'before' ? 'Runs fine, but this is the unshrunk build. Run R8 first.' : 'R8 still running.'); return; }
            if (!keepPlugin) {
              crashed = true;
              say(o, '<span class="bad">FATAL EXCEPTION: main  java.lang.ClassNotFoundException: com.example.plugins.PdfPlugin</span>');
              ['    at a.d.a(r8-map-id-5f2c1a:23)', '    at a.e.onClick(r8-map-id-5f2c1a:41)'].forEach(s => line(o, s, 'pf-pre'));
              replay(dex, 'shake');
              return;
            }
            if (!keepDto) { say(o, 'App runs. Profile screen says <span class="bad">"Hello, null"</span>: Gson looks for field <code>name</code>, R8 renamed it to <code>a</code>.'); return; }
            say(o, `<span class="good">Release build works</span> and is ${size.textContent}, down from 12.4 MB.`);
          }
          function retrace() {
            if (!crashed) { say(o, 'No obfuscated crash to retrace. Launch a broken release build first.'); return; }
            say(o, `${hl('retrace mapping.txt stacktrace.txt')}`);
            line(o, '<span class="bad">java.lang.ClassNotFoundException: com.example.plugins.PdfPlugin</span>');
            ['    at com.example.news.PluginLoader.load(PluginLoader.kt:23)', '    at com.example.news.ExportMenu.onClick(ExportMenu.kt:41)'].forEach(s => replay(line(o, s, 'pf-pre'), 'flip'));
            line(o, 'Now you know where to look: add a keep rule for the reflected class.');
          }
          paint();
          root.append(
            h('div', { class: 'controls' }, tDto.el, tPlg.el),
            h('div', { class: 'pf-row' }, phaseTag, size),
            dex,
            h('div', { class: 'controls' },
              cmd('./gradlew assembleRelease', run),
              act('Launch release build', launch),
              act('Retrace with mapping.txt', retrace)),
            o);
          el.append(root);
        },
      },
    ],
  });
})();
