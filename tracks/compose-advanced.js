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
}
/* depth: stability */
.cx-lam { font: 600 0.74rem var(--mono); padding: 2px 8px; border-radius: 6px; background: var(--sunk); color: var(--ink); transition: background 0.25s, color 0.25s; }
.cx-lam.cx-lam-new { background: var(--warm-soft); color: var(--warm); }
.cx-editor { display: grid; gap: 6px; padding: 12px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.cx-props { display: grid; gap: 6px; padding-left: 16px; min-width: 0; }
.cx-props .cmd { justify-self: start; }
.cx-verdict { padding: 10px 12px; border-radius: 10px; border: 2px solid var(--warm); background: var(--warm-soft); color: var(--ink); font-size: 0.92rem; transition: background 0.25s, border-color 0.25s; }
.cx-verdict.cx-verdict-ok { border-color: var(--ok); background: var(--ok-soft); }
/* depth: derivedStateOf */
.cx-dv-form { width: min(260px, 100%); }
.cx-dv-in { width: 100%; min-width: 0; font: 500 0.9rem var(--mono); padding: 8px 10px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--bg); color: var(--ink); }
.cx-dv-in:focus { outline: none; border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.cx-dv-btn { justify-self: start; margin-top: 4px; padding: 8px 16px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font: 700 0.85rem var(--body); transition: background 0.25s, color 0.25s; }
.cx-dv-btn[aria-disabled="true"] { background: var(--sunk); color: var(--muted); }
/* depth: phases */
.cx-pp-rows { margin-left: 0; padding-left: 0; border-left: 0; }
.cx-pp { position: relative; width: 170px; height: 170px; border-radius: 18px; border: 6px solid var(--code-bg); background: var(--surface); overflow: hidden; justify-self: center; }
.cx-pp-hdr { position: absolute; top: 0; left: 0; right: 0; height: 54px; display: grid; place-items: center; background: var(--accent-soft); font: 700 0.9rem var(--display); z-index: 1; transition: transform 0.15s linear; }
.cx-pp-body { position: absolute; top: 62px; left: 8px; right: 8px; display: grid; gap: 8px; transition: transform 0.15s linear; }
.cx-pp-body i { display: block; height: 16px; border-radius: 6px; background: var(--sunk); }
.cx-dc-chip { width: 110px; height: 70px; display: grid; place-items: center; border-radius: 14px; border: 2px solid var(--line); background: var(--sunk); color: var(--ink); font: 700 1rem var(--body); justify-self: center; }
.cx-ph-grid { display: grid; grid-template-columns: 92px repeat(12, minmax(0, 1fr)); gap: 3px; align-items: center; padding: 12px; border-radius: 12px; background: var(--bg); min-width: 0; }
.cx-ph-name { font: 600 0.7rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cx-ph-cell { height: 18px; border-radius: 4px; background: var(--sunk); transition: background 0.15s; }
.cx-ph-cell.cx-on { background: var(--accent); }
.cx-ph-cell.cx-off { background: transparent; box-shadow: inset 0 0 0 1px var(--line); }
/* depth 2: locals */
.cx-tn.cx-d2-crash { border-color: var(--err); background: var(--err-soft); }
/* depth 2: animation */
.cx-d2-lane { display: grid; gap: 4px; min-width: 0; }
.cx-d2-rail { position: relative; height: 26px; border-radius: 999px; background: var(--sunk); min-width: 0; }
.cx-d2-dot { position: absolute; top: 2px; left: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); }
.cx-d2-dot-t { background: var(--warm); }
.cx-d2-plot { padding: 6px; border-radius: 10px; background: var(--bg); border: 1px solid var(--line); min-width: 0; }
.cx-d2-plot svg { display: block; width: 100%; height: auto; }
.cx-d2-axis { stroke: var(--line); stroke-width: 1; }
.cx-d2-flip { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 4 4; }
.cx-d2-sp, .cx-d2-tw { fill: none; stroke-width: 2.5; stroke-linejoin: round; }
.cx-d2-sp { stroke: var(--accent); }
.cx-d2-tw { stroke: var(--warm); }
.cx-d2-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; }
.cx-d2-key { font: 600 0.76rem var(--mono); color: var(--ink); }
.cx-d2-key::before { content: ""; display: inline-block; width: 18px; height: 3px; margin-right: 6px; vertical-align: middle; border-radius: 2px; background: var(--accent); }
.cx-d2-key-t::before { background: var(--warm); }
.cx-d2-rail-big { height: 54px; border-radius: 12px; }
.cx-d2-card { position: absolute; top: 5px; left: 0; width: 44px; height: 44px; border-radius: 10px; background: var(--accent); }
.cx-d2-read { font: 600 0.78rem var(--mono); color: var(--muted); white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.cx-d2-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; min-width: 0; }
.cx-d2-job { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 10px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font: 600 0.78rem var(--mono); min-width: 0; overflow-wrap: anywhere; }
.cx-d2-running .cx-tag { background: var(--accent-soft); color: var(--accent); }
.cx-d2-finished .cx-tag { background: var(--ok-soft); color: var(--ok); }
.cx-d2-cancelled .cx-tag { background: var(--err-soft); color: var(--err); }
.cx-d2-cancelled { opacity: 0.75; }
/* depth 2: layout */
.cx-d2-col { position: relative; height: 240px; box-sizing: border-box; padding: 28px 10px 10px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); min-width: 0; overflow: hidden; }
.cx-d2-max { position: absolute; top: 6px; left: 10px; font: 600 0.72rem var(--mono); color: var(--muted); }
.cx-d2-irow { display: grid; grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr); align-items: stretch; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; background: var(--surface); color: var(--ink); overflow: hidden; transition: height 0.4s ease, border-color 0.25s; }
.cx-d2-irow.cx-d2-over { border-color: var(--err); }
.cx-d2-icell { position: relative; display: grid; align-content: start; min-width: 0; }
.cx-d2-icell-d { justify-items: center; }
.cx-d2-it { padding: 8px 10px; font: 600 0.86rem/1.3 var(--body); overflow-wrap: anywhere; }
.cx-d2-div { display: block; width: 2px; height: 0; background: var(--accent); transition: height 0.4s ease; }
.cx-d2-q { position: absolute; right: 4px; bottom: 4px; padding: 1px 6px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font: 700 0.68rem var(--mono); opacity: 0; transition: opacity 0.2s; }
.cx-d2-icell-d .cx-d2-q { right: auto; bottom: auto; top: 4px; left: 50%; transform: translateX(-50%); }
.cx-d2-q.cx-d2-q-on { opacity: 1; }
.cx-d2-blwrap { padding: 40px 12px 18px; border-radius: 12px; background: var(--bg); min-width: 0; overflow: hidden; }
.cx-d2-bl { position: relative; box-sizing: content-box; width: min(260px, 100%); border: 2px dashed var(--muted); border-radius: 6px; transition: height 0.35s ease, border-color 0.25s; }
.cx-d2-bl.cx-d2-neg { border-color: var(--err); }
.cx-d2-blin { position: absolute; left: 8px; top: 0; transition: transform 0.35s ease; }
.cx-d2-bltext { position: relative; display: inline-block; font: 700 22px/30px var(--display); color: var(--ink); white-space: nowrap; }
.cx-d2-blmark { display: inline-block; width: 0; height: 0; vertical-align: baseline; }
.cx-d2-bline { position: absolute; left: -6px; right: -6px; height: 0; border-top: 2px solid var(--ok); transition: top 0.35s ease; }
.cx-d2-blabel { position: absolute; right: 4px; transform: translateY(4px); font: 600 0.66rem var(--mono); color: var(--ok); transition: top 0.35s ease; }
/* depth 2: navigation */
.cx-d2-nstack { min-height: 190px; }
.cx-d2-shelf { display: grid; gap: 4px; padding: 8px 10px; border-radius: 10px; border: 1px dashed var(--line); background: var(--surface); min-width: 0; }
.cx-d2-saved { display: flex; flex-wrap: wrap; gap: 2px 8px; font: 500 0.74rem var(--mono); color: var(--muted); overflow-wrap: anywhere; min-width: 0; }
.cx-d2-saved b { color: var(--ink); }
.cx-d2-saved-on span { color: var(--accent); }
.cx-d2-nphone { width: 190px; height: 250px; display: grid; grid-template-rows: minmax(0, 1fr) auto; border-radius: 26px; border: 8px solid var(--code-bg); background: var(--surface); color: var(--ink); overflow: hidden; justify-self: center; }
.cx-d2-nscreen { display: grid; place-items: center; padding: 10px; min-width: 0; overflow-wrap: anywhere; }
.cx-d2-tabs { display: flex; border-top: 1px solid var(--line); background: var(--bg); }
.cx-d2-tab { flex: 1 1 0; min-width: 0; padding: 9px 2px; border: 0; background: none; color: var(--muted); font: 600 0.7rem var(--mono); cursor: pointer; }
.cx-d2-tab.cx-d2-tab-on { color: var(--accent); box-shadow: inset 0 3px 0 var(--accent); }
.cx-d2-tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.cx-d2-pat { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 10px; border-radius: 9px; background: var(--code-bg); color: var(--code-ink); font: 600 0.8rem var(--mono); min-width: 0; overflow-wrap: anywhere; }
.cx-d2-pp { padding: 2px 4px; border-radius: 5px; min-width: 0; }
.cx-d2-pp.cx-d2-ok { color: var(--t-k); box-shadow: inset 0 -2px 0 currentColor; }
.cx-d2-pp.cx-d2-err { color: var(--t-e); box-shadow: inset 0 -2px 0 currentColor; }
.cx-d2-dstack { min-height: 100px; }
`;

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
        deeper: [
          {
            title: 'Lambdas: what they capture decides',
            body: `<p>With strong skipping, the compiler wraps each lambda you pass to a composable in <code>remember</code>, keyed on the values it captures. Stable captures are compared with <code>equals()</code>, unstable ones with <code>===</code>. Same captures give the same lambda instance, so the child can skip.</p>
<p>Capture something rebuilt on every run, like a fresh list, and the lambda is new each time. The child sees a changed parameter and runs again.</p>`,
            code: `@Composable
fun PostActions(vm: PostViewModel, post: Post, related: List<Post>) {
    // captures vm (same instance) and post.id (Int): the same lambda every run
    LikeButton(onClick = { vm.like(post.id) })

    // a new list on every run, so a new lambda, so ShareButton never skips
    val ids = related.map { it.id }
    ShareButton(onClick = { vm.share(ids) })

    // fixed: the list is rebuilt only when related changes
    val stableIds = remember(related) { related.map { it.id } }
    ShareButton(onClick = { vm.share(stableIds) })
}`,
            visual(el) {
              let fix = false, busy = false, addr = 0x2a40;
              const next = () => '@' + (addr += 0x58).toString(16);
              const rows = [
                { sig: 'LikeButton(onClick = { vm.like(post.id) })', caps: () => ['vm: same instance (===)', 'post.id: Int, equal'], fresh: () => false },
                { sig: 'ShareButton(onClick = { vm.share(ids) })', caps: () => ['vm: same instance (===)', fix ? 'ids: remembered, same instance' : 'ids: related.map { }, new list'], fresh: () => !fix },
              ];
              for (const r of rows) {
                r.runs = 1; r.id = next();
                r.badge = h('span', { class: 'cx-badge' }, '1');
                r.lam = h('span', { class: 'cx-lam' }, `Function0 ${r.id}`);
                r.capsEl = h('div', { class: 'cx-meta' });
                r.status = h('span', { class: 'cx-status' }, 'composed');
                r.el = h('div', { class: 'cx-row' }, h('span', { class: 'cx-sig' }, r.sig), r.badge, r.capsEl, h('div', { class: 'cx-meta' }, h('span', { class: 'cx-arg' }, 'lambda'), r.lam), r.status);
              }
              const paintCaps = () => rows.forEach(r => r.capsEl.replaceChildren(...r.caps().map(c => h('span', { class: `cx-tag ${/new list/.test(c) ? 'cx-unstable' : 'cx-stable'}` }, c))));
              const pBadge = h('span', { class: 'cx-badge' }, '1');
              const parent = h('div', { class: 'cx-parent' }, h('span', {}, 'PostActions()'), pBadge);
              const sw = h('input', { type: 'checkbox', id: 'cx-lc-fix' });
              const o = out('Recompose the parent and watch which lambda instances change.');
              let pr = 1;
              sw.addEventListener('change', () => { if (busy) { sw.checked = fix; return; } fix = sw.checked; paintCaps(); say(o, fix ? 'ids now comes from remember(related). Recompose again.' : 'ids is built in the body again.'); });
              async function run() {
                if (busy) return; busy = true;
                pBadge.textContent = ++pr; replay(pBadge, 'pop'); replay(parent, 'cx-flash');
                rows.forEach(r => { r.el.classList.remove('cx-ran', 'cx-skipped'); r.status.textContent = ''; });
                let ran = 0;
                for (const r of rows) {
                  await sleep(420);
                  if (!el.isConnected) return;
                  if (r.fresh()) {
                    r.id = next(); r.lam.textContent = `Function0 ${r.id}`; r.lam.classList.add('cx-lam-new'); replay(r.lam, 'pop');
                    ran++; r.el.classList.add('cx-ran'); bump(r.badge, ++r.runs); replay(r.el, 'cx-flash');
                    r.status.textContent = 'a capture changed: new lambda, so the child ran';
                  } else {
                    r.lam.classList.remove('cx-lam-new');
                    r.el.classList.add('cx-skipped');
                    r.status.textContent = 'captures equal: same lambda, child skipped';
                  }
                }
                say(o, ran ? '<span class="bad">ShareButton ran again</span> because its lambda captured a list built fresh on every run.' : '<span class="good">Both children skipped.</span> Every capture matched, so both lambdas were reused.');
                busy = false;
              }
              paintCaps();
              el.append(
                h('div', { class: 'cx-tree' }, parent, h('div', { class: 'cx-kids' }, rows.map(r => r.el))),
                h('div', { class: 'controls cx-ctl' }, cmd('refresh++', run), h('label', { class: 'switch', for: 'cx-lc-fix' }, sw, 'remember(related) { ... }')),
                o);
            },
          },
          {
            title: 'Ask the compiler',
            body: `<p>You don’t have to guess what is stable. Turn on compiler reports and the build writes what it inferred for every class and composable. Look for <code>unstable</code> on classes you pass into composables.</p>
<p>Edit the class below and watch the report line change.</p>`,
            code: `// build.gradle.kts of the module
composeCompiler {
    reportsDestination = layout.buildDirectory.dir("compose_compiler")
}
// Build a release variant, then open build/compose_compiler/<module>_release-classes.txt`,
            visual(el) {
              const P = {
                title: { on: false, a: 'val title: String', b: 'var title: String', ok: on => !on },
                tags: { on: false, a: 'val tags: List<String>', b: 'val tags: ImmutableList<String>', ok: on => on },
                author: { on: false, a: 'val author: Author   // :core, not in config', b: 'val author: Author   // listed in stability.conf', ok: on => on },
              };
              const rep = h('div', { class: 'kt' });
              const verdict = h('p', { class: 'cx-verdict' });
              const o = out('Tap a property to change it.');
              const btns = {};
              function report() {
                const tOk = P.title.ok(P.title.on), gOk = P.tags.ok(P.tags.on), aOk = P.author.ok(P.author.on);
                const stable = tOk && gOk && aOk;
                rep.innerHTML = hl([
                  `${stable ? 'stable' : 'unstable'} class Article {`,
                  `  stable ${P.title.on ? 'var' : 'val'} title: String`,
                  `  ${gOk ? 'stable' : 'unstable'} val tags: ${P.tags.on ? 'ImmutableList' : 'List'}<String>`,
                  `  ${aOk ? 'stable' : 'unstable'} val author: Author`,
                  `  <runtime stability> = ${stable ? 'Stable' : 'Unstable'}`,
                  '}',
                ].join('\n'));
                verdict.innerHTML = stable
                  ? '<b>ArticleCard(article)</b> skips when the new article <b>equals()</b> the old one.'
                  : '<b>ArticleCard(article)</b> skips only when it gets the <b>same instance</b> (===). An equal copy still runs it.';
                verdict.classList.toggle('cx-verdict-ok', stable);
                replay(rep, 'cx-flash');
                const why = !tOk ? 'a var property can change without telling Compose' : !gOk ? 'List could be a MutableList underneath' : !aOk ? 'Author comes from a module the Compose compiler did not build' : 'every property is a val of a stable type';
                return { stable, why };
              }
              for (const [k, p] of Object.entries(P)) {
                btns[k] = cmd(p.a, () => {
                  p.on = !p.on; btns[k].innerHTML = hl(p.on ? p.b : p.a);
                  const r = report();
                  say(o, `Article is <span class="${r.stable ? 'good' : 'bad'}">${r.stable ? 'stable' : 'unstable'}</span>: ${r.why}.`);
                });
              }
              report();
              el.append(
                h('div', { class: 'cx-editor' }, h('span', { class: 'cx-label' }, 'data class Article('), h('div', { class: 'cx-props' }, Object.values(btns)), h('span', { class: 'cx-label' }, ')')),
                h('span', { class: 'cx-label' }, 'classes.txt'),
                rep, verdict, o);
            },
          },
          {
            title: '@Stable for types that change through State',
            body: `<p><code>@Immutable</code> is for types that never change. <code>@Stable</code> is a looser promise: the object may change, but every change goes through Compose State, and <code>equals()</code> gives the same answer for the same two objects. State holders like <code>LazyListState</code> are built this way.</p>
<p>Readers of <code>query</code> below recompose when it changes, because it is a State read. The holder itself stays the same instance, so composables that take it can skip.</p>`,
            code: `@Stable
class SearchBarState(initial: String) {
    var query by mutableStateOf(initial)
        private set
    fun update(text: String) { query = text }
}

@Composable
fun rememberSearchBarState(initial: String = "") = remember { SearchBarState(initial) }`,
          },
        ],
        underHood: {
          body: `<p>The compiler decides stability per class at compile time and stores the result in a synthetic static field on the class, so other modules built with the Compose compiler can read it. For a generic class like <code>Box&lt;T&gt;</code>, part of the answer waits until runtime, when the type argument is known.</p>
<p>Each composable also gets a hidden <code>$changed</code> parameter with a few bits per argument. A caller that already knows an argument is the same, different or static passes that down, so the child can skip without comparing again. When the bits say "uncertain", the child checks itself: <code>composer.changed(arg)</code> uses <code>equals()</code> for stable types, and under strong skipping <code>composer.changedInstance(arg)</code> uses <code>===</code> for unstable ones.</p>`,
        },
        mistakes: [
          {
            title: 'Building a new collection for the child',
            bad: `@Composable
fun ArticleScreen(article: Article) {
    TagRow(tags = article.tags.filter { it.isNotBlank() })
}

@Composable
fun TagRow(tags: List<String>) { /* ... */ }`,
            good: `@Composable
fun ArticleScreen(article: Article) {
    val tags = remember(article.tags) { article.tags.filter { it.isNotBlank() } }
    TagRow(tags = tags)
}`,
            why: '<code>List</code> is unstable, so it is compared with <code>===</code>. <code>filter</code> returns a new list on every run, so <code>TagRow</code> never skips. Remember the result, or move the filtering into the ViewModel.',
          },
          {
            title: 'Passing the whole screen state to a leaf',
            bad: `@Composable
fun PriceLabel(state: ProductScreenState) {
    Text(state.product.price.formatted)
}`,
            good: `@Composable
fun PriceLabel(price: String) {
    Text(price)
}

PriceLabel(state.product.price.formatted)`,
            why: 'The leaf now depends on every field of the screen state. A change to any of them makes the state unequal, and the label runs again. Pass only what it shows.',
          },
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
        deeper: [
          {
            title: 'remember(key) is not the same thing',
            body: `<p>A common attempt is to key <code>remember</code> on the index: <code>remember(index) { ... }</code>. To pass the index as a key, the composable has to read it during composition. So it still recomposes on every index change, and the cached block saves nothing.</p>
<p><code>derivedStateOf</code> reads the index inside its own block, outside your composable. Your composable reads only the result. Use keys for plain parameters, and <code>derivedStateOf</code> for State that changes more often than the answer you need.</p>`,
            code: `// Recomposes on every scrolled item: the key is read in composition
val show = remember(listState.firstVisibleItemIndex) {
    listState.firstVisibleItemIndex > 0
}

// Recomposes only when the answer flips
val show by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }`,
            visual(el) {
              const SLOTS = 24;
              let index = 0, shown = false, t = 0, busy = false;
              const defs = [
                { name: 'direct read', fire: () => true },
                { name: 'remember(index)', fire: () => true },
                { name: 'derivedStateOf', fire: flip => flip },
              ];
              const lanes = defs.map(d => {
                const count = h('b', {}, '0');
                const track = h('div', { class: 'lane-track' });
                return { ...d, n: 0, count, track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, d.name, count), track) };
              });
              const idx = h('div', { class: 'kt' });
              const o = out('Each bar is one recomposition. Scroll and compare the lanes.');
              const paintIdx = () => { idx.innerHTML = hl(`index = ${index}   index > 0 = ${shown}`); };
              function clear() { t = 0; lanes.forEach(L => { L.n = 0; L.count.textContent = '0'; L.track.replaceChildren(); }); }
              function tick(to) {
                if (t >= SLOTS) clear();
                index = to;
                const s = index > 0, flip = s !== shown; shown = s;
                lanes.forEach(L => {
                  if (!L.fire(flip)) return;
                  L.track.append(h('span', { class: 'bar run', style: `left:${(t / SLOTS) * 100}%;width:${100 / SLOTS - 1}%` }));
                  L.count.textContent = ++L.n; replay(L.count, 'pop');
                });
                t++; paintIdx();
              }
              async function scroll(target) {
                if (busy) return;
                if (target === index) { say(o, 'No index change, so nobody recomposes.'); return; }
                busy = true;
                const a = lanes.map(L => L.n);
                while (index !== target) {
                  tick(index + Math.sign(target - index));
                  await sleep(150);
                  if (!el.isConnected) return;
                }
                const d = lanes.map((L, i) => L.n - a[i]);
                say(o, `direct <span class="bad">+${d[0]}</span>, remember(index) <span class="bad">+${d[1]}</span>, derivedStateOf <span class="good">+${d[2]}</span>`);
                busy = false;
              }
              paintIdx();
              el.append(idx, h('div', { class: 'timeline cx-tl' }, lanes.map(L => L.el)),
                h('div', { class: 'controls cx-ctl' }, act('Scroll down 6 items', () => scroll(index + 6)), act('Back to the top', () => scroll(0)), act('Clear', () => { if (!busy) { clear(); say(o, 'Cleared.'); } })),
                o);
            },
          },
          {
            title: 'Derived state in a state holder',
            body: `<p><code>derivedStateOf</code> also works outside composables. In a plain state holder class, it gives you a computed property that Compose observes like any other State. Each reader recomposes only when the result changes.</p>
<p>Below, the button reads only <code>canSubmit</code>. Every key you type writes a field, but the button hears about it only when the answer flips.</p>`,
            code: `@Stable
class SignUpFormState {
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    val canSubmit by derivedStateOf {
        "@" in email && password.length >= 8
    }
}

@Composable
fun SubmitButton(form: SignUpFormState, onSubmit: () -> Unit) {
    Button(onClick = onSubmit, enabled = form.canSubmit) { Text("Create account") }
}`,
            visual(el) {
              let writes = 0, recomps = 1, can = false, busy = false;
              const email = h('input', { id: 'cx-dv-email', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'email', class: 'cx-dv-in' });
              const pass = h('input', { id: 'cx-dv-pass', type: 'password', autocomplete: 'off', placeholder: 'password, 8+ characters', class: 'cx-dv-in' });
              const btn = h('span', { class: 'cx-dv-btn', 'aria-disabled': 'true' }, 'Create account');
              const wN = h('span', { class: 'cx-big' }, '0'), rN = h('span', { class: 'cx-big' }, '1');
              const o = out('Type in either field, or let the demo type for you.');
              function changed() {
                writes++; wN.textContent = writes;
                const c = email.value.includes('@') && pass.value.length >= 8;
                if (c !== can) {
                  can = c; recomps++; rN.textContent = recomps; replay(rN, 'pop'); replay(btn, 'pop');
                  btn.setAttribute('aria-disabled', String(!c));
                  say(o, `canSubmit flipped to <span class="${c ? 'good' : 'bad'}">${c}</span>. SubmitButton recomposed. ${writes} field writes so far.`);
                }
              }
              email.addEventListener('input', changed);
              pass.addEventListener('input', changed);
              async function auto() {
                if (busy) return; busy = true;
                email.value = ''; pass.value = ''; changed();
                for (const [f, s] of [[email, 'ada@lab.dev'], [pass, 'hunter2024']]) {
                  for (const ch of s) {
                    f.value += ch; changed();
                    await sleep(90);
                    if (!el.isConnected) return;
                  }
                }
                say(o, `${writes} field writes. <span class="good">SubmitButton recomposed ${recomps - 1} time${recomps === 2 ? '' : 's'}</span> after the first run.`);
                busy = false;
              }
              function clear() {
                if (busy) return;
                email.value = ''; pass.value = ''; changed();
              }
              el.append(
                h('div', { class: 'cx-split' },
                  h('div', { class: 'cx-mini cx-dv-form' }, h('label', { class: 'cx-label', for: 'cx-dv-email' }, 'Email'), email, h('label', { class: 'cx-label', for: 'cx-dv-pass' }, 'Password'), pass, btn),
                  h('div', { class: 'cx-counters' },
                    h('div', { class: 'cx-counter' }, h('div', { class: 'cx-count-line' }, wN, h('span', { class: 'cx-label' }, 'field writes'))),
                    h('div', { class: 'cx-counter cx-good-c' }, h('div', { class: 'cx-count-line' }, rN, h('span', { class: 'cx-label' }, 'SubmitButton runs'))))),
                h('div', { class: 'controls cx-ctl' }, act('Type a valid sign-up', auto), act('Clear both fields', clear)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>When the block of <code>derivedStateOf</code> runs, Compose records every State object it reads. The result is cached together with that list of dependencies.</p>
<p>When one of the dependencies changes, Compose does not invalidate the readers right away. It first runs your block again and compares the new result with the cached one, using <code>==</code> unless you pass a different policy. Only if the result differs are the readers marked for recomposition. So a busy input costs one cheap run of your block per change, not one recomposition.</p>`,
        },
        mistakes: [
          {
            title: 'A plain collection as input',
            bad: `class CartState {
    val items = mutableListOf<CartItem>()
    val total by derivedStateOf { items.sumOf { it.price } }
}`,
            good: `class CartState {
    val items = mutableStateListOf<CartItem>()
    val total by derivedStateOf { items.sumOf { it.price } }
}`,
            why: '<code>derivedStateOf</code> only sees State reads. Adding to a plain <code>MutableList</code> changes nothing it tracks, so <code>total</code> stays stale.',
          },
          {
            title: 'Using it for a one-to-one mapping',
            bad: `val fullName by remember {
    derivedStateOf { "\${first.value} \${last.value}" }
}`,
            good: `val fullName = "\${first.value} \${last.value}"`,
            why: 'The result changes every time an input does, so there is no recomposition to save. You only add bookkeeping. Save <code>derivedStateOf</code> for answers that change less often than their inputs.',
          },
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
        deeper: [
          {
            title: 'Pass a lambda, not the value',
            body: `<p>Where the read happens is decided by the caller as much as by the child. If <code>ArticleScreen</code> reads <code>scroll.value</code> to pass an <code>Int</code>, the read is in <code>ArticleScreen</code>’s composition. Both the screen and the header recompose on every scrolled frame.</p>
<p>Pass <code>{ scroll.value }</code> instead. The screen never reads the value. The lambda captures only the stable <code>ScrollState</code>, so the header gets the same lambda and skips. The read happens inside the header’s <code>offset { }</code>, during layout.</p>`,
            visual(el) {
              const FRAMES = 10;
              let lazy = false, y = 0, busy = false;
              const rows = [
                { label: 'ArticleScreen()', what: 'recompositions' },
                { label: 'CollapsingHeader()', what: 'recompositions' },
                { label: 'offset { } in header', what: 'layout passes' },
              ].map(r => { const badge = h('span', { class: 'cx-badge' }, '0'); const status = h('span', { class: 'cx-status' }, r.what); return { ...r, n: 0, badge, status, el: h('div', { class: 'cx-row' }, h('span', { class: 'cx-sig' }, r.label), badge, status) }; });
              const hdr = h('div', { class: 'cx-pp-hdr' }, 'Header');
              const body = h('div', { class: 'cx-pp-body' }, Array.from({ length: 6 }, () => h('i')));
              const pv = h('div', { class: 'cx-pp', role: 'img', 'aria-label': 'Collapsing header preview' }, hdr, body);
              const btns = [
                cmd('CollapsingHeader(scroll = scroll.value)', () => pick(false)),
                cmd('CollapsingHeader(scrollProvider = { scroll.value })', () => pick(true)),
              ];
              const o = out();
              function pick(v) {
                if (busy) return;
                lazy = v; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === (v ? 1 : 0))));
                rows.forEach(r => { r.n = 0; r.badge.textContent = '0'; r.el.classList.remove('cx-ran', 'cx-skipped'); });
                say(o, v ? 'The screen passes a lambda. Press Scroll.' : 'The screen reads the value and passes an Int. Press Scroll.');
              }
              async function scroll() {
                if (busy) return; busy = true;
                rows.forEach(r => { r.n = 0; r.badge.textContent = '0'; r.el.classList.remove('cx-ran', 'cx-skipped'); });
                const dir = y > 0 ? -1 : 1;
                for (let f = 0; f < FRAMES; f++) {
                  y = Math.max(0, Math.min(FRAMES, y + dir));
                  hdr.style.transform = `translateY(${-y * 3}px)`; body.style.transform = `translateY(${-y * 6}px)`;
                  rows.forEach((r, i) => {
                    if (lazy && i < 2) { r.el.classList.add('cx-skipped'); r.status.textContent = 'skipped'; return; }
                    r.n++; bump(r.badge, r.n); r.el.classList.add('cx-ran'); r.status.textContent = r.what;
                  });
                  await sleep(160);
                  if (!el.isConnected) return;
                }
                const total = rows.reduce((s, r) => s + r.n, 0);
                say(o, lazy
                  ? `<span class="good">${total} units of work</span> for ${FRAMES} frames. Only layout ran.`
                  : `<span class="bad">${total} units of work</span> for ${FRAMES} frames. Two recompositions and a layout every frame.`);
                busy = false;
              }
              pick(false);
              el.append(
                h('div', { class: 'cx-split' }, h('div', { class: 'cx-kids cx-pp-rows' }, rows.map(r => r.el)), pv),
                h('div', { class: 'controls cx-ctl' }, btns),
                h('div', { class: 'controls cx-ctl' }, act(`Scroll ${FRAMES} frames`, scroll)),
                o);
            },
          },
          {
            title: 'Draw-only reads: drawBehind',
            body: `<p><code>Modifier.background(color)</code> takes the color as a value, so an animated color recomposes the composable on every frame. The new modifier only needs a redraw, so layout is skipped, but composition still runs.</p>
<p><code>drawBehind { drawRect(color) }</code> reads the color while drawing. Same pixels, and composition sits still. The same goes for <code>Modifier.alpha(a)</code> versus <code>graphicsLayer { alpha = a }</code>.</p>`,
            code: `val color by animateColorAsState(if (selected) Selected else Idle, label = "chip")

// Recomposes on every frame of the animation
Box(Modifier.size(80.dp).background(color))

// Draw phase only
Box(Modifier.size(80.dp).drawBehind { drawRect(color) })`,
            visual(el) {
              const FR = 12;
              let draw = false, sel = false, busy = false;
              const chip = h('div', { class: 'cx-dc-chip' }, 'Chip');
              const names = ['Composition', 'Layout', 'Drawing'];
              const grid = h('div', { class: 'cx-ph-grid', role: 'img', 'aria-label': 'Phases run per frame' });
              const cells = names.map(n => {
                grid.append(h('span', { class: 'cx-ph-name' }, n));
                return Array.from({ length: FR }, () => { const c = h('span', { class: 'cx-ph-cell' }); grid.append(c); return c; });
              });
              const btns = [cmd('Modifier.background(color)', () => pick(false)), cmd('Modifier.drawBehind { drawRect(color) }', () => pick(true))];
              const o = out();
              const runs = p => (p === 2 || (p === 0 && !draw));
              function pick(v) {
                if (busy) return;
                draw = v; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === (v ? 1 : 0))));
                cells.flat().forEach(c => c.classList.remove('cx-on', 'cx-off'));
                say(o, `${hl(v ? 'drawBehind { }' : 'background(color)')} <span class="muted">// press selected = !selected</span>`);
              }
              async function anim() {
                if (busy) return; busy = true;
                sel = !sel;
                cells.flat().forEach(c => c.classList.remove('cx-on', 'cx-off'));
                for (let f = 0; f < FR; f++) {
                  const p = Math.round(((f + 1) / FR) * 100);
                  chip.style.background = `color-mix(in srgb, var(--accent) ${sel ? p : 100 - p}%, var(--sunk))`;
                  chip.style.color = (sel ? p : 100 - p) > 50 ? 'var(--accent-ink)' : 'var(--ink)';
                  cells.forEach((row, ph) => row[f].classList.add(runs(ph) ? 'cx-on' : 'cx-off'));
                  await sleep(90);
                  if (!el.isConnected) return;
                }
                const work = [0, 1, 2].filter(runs).length * FR;
                say(o, draw
                  ? `<span class="good">${work} phase runs</span> for ${FR} frames: drawing only.`
                  : `<span class="bad">${work} phase runs</span> for ${FR} frames: composition and drawing. Layout skipped, since the size never changed.`);
                busy = false;
              }
              pick(false);
              el.append(
                h('div', { class: 'cx-split' }, grid, chip),
                h('div', { class: 'controls cx-ctl' }, btns),
                h('div', { class: 'controls cx-ctl' }, cmd('selected = !selected', anim)),
                o);
            },
          },
          {
            title: 'Backward writes cost a frame',
            body: `<p>The phases run in order inside a frame. If layout writes a State that composition already read, Compose can only act on it in the next frame. For one frame the screen shows the old layout, and the work runs twice.</p>
<p><code>onSizeChanged</code> feeding a <code>mutableStateOf</code> is the classic case. When one child’s size must shape its siblings, measure them together in a custom <code>Layout</code>, or use <code>SubcomposeLayout</code> when the content itself depends on a size.</p>`,
            code: `// One frame late: the height arrives after composition already ran
var headerHeight by remember { mutableIntStateOf(0) }
Header(Modifier.onSizeChanged { headerHeight = it.height })
Content(Modifier.padding(top = with(LocalDensity.current) { headerHeight.toDp() }))`,
          },
        ],
        underHood: {
          body: `<p>Compose finds out who read a State with snapshot read observers, and each phase installs its own. During composition, a read is recorded against the current recompose scope. During measure and layout, the reads are recorded against the layout node whose measure or placement block is running. During drawing, they are recorded against the node that draws.</p>
<p>When a write is applied, Compose looks up who read that State. A recompose scope is scheduled for the next frame. A layout node is asked to remeasure or to place again. A draw node only has its layer invalidated. So the place of the read decides how much work a change costs.</p>`,
        },
        mistakes: [
          {
            title: 'Animating alpha with the value modifier',
            bad: `val fade by animateFloatAsState(if (visible) 1f else 0f, label = "fade")
Image(painter, null, Modifier.alpha(fade))`,
            good: `val fade by animateFloatAsState(if (visible) 1f else 0f, label = "fade")
Image(painter, null, Modifier.graphicsLayer { alpha = fade })`,
            why: '<code>Modifier.alpha(fade)</code> reads <code>fade</code> while composing, so every animation frame recomposes. Inside <code>graphicsLayer { }</code> the read moves to the draw phase.',
          },
          {
            title: 'Deciding visibility from a raw scroll read',
            bad: `val showTitle = scrollState.value > 300   // every scrolled pixel
TopBar(showTitle = showTitle)`,
            good: `val showTitle by remember { derivedStateOf { scrollState.value > 300 } }
TopBar(showTitle = showTitle)`,
            why: 'The direct read recomposes on every pixel even though the answer flips once. <code>derivedStateOf</code> keeps the busy read out of composition.',
          },
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
        deeper: [
          {
            title: 'Dynamic or static: who recomposes',
            body: `<p>The two factories differ in what happens when the provided value changes. A <code>compositionLocalOf</code> local remembers who read it. Only those readers recompose. A <code>staticCompositionLocalOf</code> local keeps no list, so Compose recomposes everything inside the provider, and nothing in there can skip.</p>
<p>Static is cheaper to read and costs a lot to change. That fits a spacing scale or a <code>Context</code>, not a value that changes while the user looks at the screen.</p>`,
            code: `val LocalCurrency = compositionLocalOf { Currency.EUR }        // tracks readers
val LocalSpacing = staticCompositionLocalOf { Spacing() }         // no tracking

@Composable
fun Checkout(currency: Currency) {
    CompositionLocalProvider(LocalCurrency provides currency) {
        Header()          // does not read it
        ItemList()        // does not read it
        Total()           // LocalCurrency.current
        PayButton()       // LocalCurrency.current
    }
}`,
            visual(el) {
              let isStatic = false, cur = 'EUR', busy = false;
              const SYM = { EUR: '€', USD: '$' };
              const nodes = [
                { name: 'Header()', reads: false },
                { name: 'ItemList()', reads: false },
                { name: 'Total()', reads: true, show: () => `${SYM[cur]}42.00` },
                { name: 'PayButton()', reads: true, show: () => `Pay ${SYM[cur]}42.00` },
              ];
              for (const n of nodes) {
                n.runs = 1;
                n.badge = h('span', { class: 'cx-badge' }, '1');
                n.val = h('span', { class: 'cx-arg' }, n.reads ? n.show() : 'no read');
                n.el = h('div', { class: 'cx-row' }, h('span', { class: 'cx-sig' }, n.name), n.badge, h('div', { class: 'cx-meta' }, n.reads ? h('span', { class: 'cx-tag cx-stable' }, 'reads .current') : null, n.val));
              }
              const provLine = h('span', {});
              const prov = h('div', { class: 'cx-parent' }, provLine);
              const decl = h('div', { class: 'kt' });
              const o = out('Change the currency and count who runs again.');
              const kinds = [['compositionLocalOf', false], ['staticCompositionLocalOf', true]].map(([k, s]) => cmd(`${k} { }`, () => {
                if (busy) return; isStatic = s; paint(); say(o, s ? 'Static: reads are not tracked. A change recomposes the whole provider content.' : 'Dynamic: every .current read is tracked, like a State read.');
              }));
              function paint() {
                kinds.forEach((b, i) => b.setAttribute('aria-pressed', String(i === (isStatic ? 1 : 0))));
                decl.innerHTML = hl(`val LocalCurrency = ${isStatic ? 'staticCompositionLocalOf' : 'compositionLocalOf'} { Currency.EUR }`);
                provLine.textContent = `CompositionLocalProvider(LocalCurrency provides ${cur}) {`;
              }
              async function change() {
                if (busy) return; busy = true;
                cur = cur === 'EUR' ? 'USD' : 'EUR';
                paint(); replay(prov, 'cx-flash');
                nodes.forEach(n => n.el.classList.remove('cx-ran', 'cx-skipped'));
                let ran = 0;
                for (const n of nodes) {
                  await sleep(380);
                  if (!el.isConnected) return;
                  if (isStatic || n.reads) {
                    ran++; n.el.classList.add('cx-ran'); bump(n.badge, ++n.runs); replay(n.el, 'cx-flash');
                    n.val.textContent = n.reads ? n.show() : 'ran, same output';
                  } else { n.el.classList.add('cx-skipped'); n.val.textContent = 'untouched'; }
                }
                say(o, isStatic
                  ? `<span class="bad">${ran} of 4 recomposed.</span> A static local invalidates the whole content, even Header and ItemList.`
                  : `<span class="good">${ran} of 4 recomposed.</span> Only the two readers of LocalCurrency.current ran.`);
                busy = false;
              }
              paint();
              el.append(decl,
                h('div', { class: 'controls cx-ctl' }, kinds),
                h('div', { class: 'cx-tree' }, prov, h('div', { class: 'cx-kids' }, nodes.map(n => n.el))),
                h('div', { class: 'controls cx-ctl' }, cmd('currency = if (currency == EUR) USD else EUR', change)),
                o);
            },
          },
          {
            title: 'Missing provider: a default or a crash',
            body: `<p>A local only reaches code inside the same composition. <code>Dialog</code>, <code>Popup</code> and lazy list items are composed as children of your tree, so they see your providers. A second Activity that calls <code>setContent</code> starts a new root. It sees only the factory default.</p>
<p>A quiet default like a no-op logger hides that bug for months. When there is no sensible default, make the factory throw with a clear message, so the missing provider fails on the first run.</p>`,
            code: `val LocalAnalytics = staticCompositionLocalOf<Analytics> {
    error("No Analytics provided. Wrap the screen in AppTheme { }.")
}

class SettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme { SettingsScreen() }   // the provider lives in AppTheme
        }
    }
}`,
            visual(el) {
              let provided = true, strict = false, busy = false;
              const rows = [
                { id: 'a', label: 'MainActivity.setContent {', depth: 0 },
                { id: 'theme', label: 'AppTheme {  // provides RealAnalytics', depth: 1, prov: true },
                { id: 'home', label: 'HomeScreen()', depth: 2, reader: true, path: ['theme'] },
                { id: 'dlg', label: 'Dialog { ConfirmSheet() }', depth: 2, reader: true, path: ['theme'], note: 'child composition' },
                { id: 'lazy', label: 'LazyColumn { items { Row() } }', depth: 2, reader: true, path: ['theme'], note: 'child composition' },
                { id: 'b', label: 'SettingsActivity.setContent {  // no AppTheme', depth: 0, root2: true },
                { id: 'set', label: 'SettingsScreen()', depth: 1, reader: true, path: ['b'] },
              ];
              const by = Object.fromEntries(rows.map(r => [r.id, r]));
              for (const r of rows) {
                const pad = `margin-left:${r.depth * 14}px;width:calc(100% - ${r.depth * 14}px)`;
                const label = h('span', { class: 'cx-tn-label' }, r.label);
                if (r.reader) {
                  r.res = h('span', { class: 'cx-res' }, r.note || '');
                  r.el = h('button', { class: 'cx-tn', style: pad, onclick: () => lookup(r) }, label, r.res);
                } else r.el = h('div', { class: 'cx-tn' + (r.prov ? ' cx-prov' : '') + (r.root2 ? ' cx-def' : ''), style: pad }, label);
              }
              const fact = h('div', { class: 'kt' });
              const o = out('Tap a screen to read LocalAnalytics.current from there.');
              const provSw = h('input', { type: 'checkbox', id: 'cx-d2-ld-prov', checked: true });
              const strictSw = h('input', { type: 'checkbox', id: 'cx-d2-ld-strict' });
              function paint() {
                fact.innerHTML = hl(strict ? 'staticCompositionLocalOf<Analytics> { error("No Analytics provided") }' : 'staticCompositionLocalOf<Analytics> { NoOpAnalytics }');
                by.theme.el.classList.toggle('cx-off', !provided);
                rows.forEach(r => r.el.classList.remove('cx-walk', 'cx-found', 'cx-d2-crash'));
              }
              provSw.addEventListener('change', () => { if (busy) { provSw.checked = provided; return; } provided = provSw.checked; paint(); say(o, provided ? 'AppTheme provides RealAnalytics again.' : 'AppTheme no longer provides it. Every reader falls back to the factory.'); });
              strictSw.addEventListener('change', () => { if (busy) { strictSw.checked = strict; return; } strict = strictSw.checked; paint(); say(o, strict ? 'The factory now throws when nothing is provided.' : 'The factory now returns a silent no-op.'); });
              async function lookup(r) {
                if (busy) return; busy = true;
                paint();
                r.el.classList.add('cx-walk');
                await sleep(300);
                if (!el.isConnected) return;
                const p = by[r.path[0]];
                const hit = p.prov && provided;
                if (hit) { p.el.classList.add('cx-found'); replay(p.el, 'pop-soft'); }
                else { p.el.classList.add('cx-walk'); await sleep(300); if (!el.isConnected) return; }
                if (hit) say(o, `${hl(r.label)} <span class="muted">→</span> <span class="good">RealAnalytics</span>${r.note ? ' <span class="muted">// a child composition still sees your providers</span>' : ''}`);
                else if (strict) { r.el.classList.add('cx-d2-crash'); replay(r.el, 'shake'); say(o, `<span class="bad">IllegalStateException: No Analytics provided</span><br><span class="muted">// found on the first run, not in production</span>`); }
                else { r.el.classList.add('cx-found'); say(o, `${hl(r.label)} <span class="muted">→</span> <span class="bad">NoOpAnalytics</span> <span class="muted">// events vanish and nothing tells you</span>`); }
                busy = false;
              }
              paint();
              el.append(fact,
                h('div', { class: 'cx-tree' }, rows.map(r => r.el)),
                h('div', { class: 'controls cx-ctl' }, h('label', { class: 'switch', for: 'cx-d2-ld-prov' }, provSw, 'AppTheme provides it'), h('label', { class: 'switch', for: 'cx-d2-ld-strict' }, strictSw, 'default = error(...)')),
                o);
            },
          },
          {
            title: 'A local is a hidden parameter',
            body: `<p>Nothing in a signature shows that a composable reads a local. Previews and tests must provide it too, or they get the default. Keep locals for values that almost every composable could need and that have one obvious owner: theme tokens, <code>LocalContext</code>, <code>LocalLifecycleOwner</code>, <code>LocalUriHandler</code>. Data the screen shows goes in parameters.</p>`,
            code: `@Preview
@Composable
fun TotalPreview() {
    CompositionLocalProvider(LocalCurrency provides Currency.USD) {
        Total(amount = 42.0)
    }
}`,
          },
        ],
        underHood: {
          body: `<p>The tree walk in the demo is the mental model. The composer does not climb node by node. Each provider stores a persistent map from every local to its value, built from its parent’s map plus its own entries, in the slot table. <code>LocalX.current</code> looks the local up in the map for the current position, so a read costs the same at any depth.</p>
<p>For <code>compositionLocalOf</code>, the map holds a <code>State</code> for each value. A read is a State read, so Compose records the reader and invalidates only it when the value changes. For <code>staticCompositionLocalOf</code>, the map holds the plain value. A new value means a new map, and Compose marks the provider’s content as needing a full recompose with skipping turned off.</p>`,
        },
        mistakes: [
          {
            title: 'A static local for a value that changes every frame',
            bad: `val LocalScrollOffset = staticCompositionLocalOf { 0 }

CompositionLocalProvider(
    LocalScrollOffset provides listState.firstVisibleItemScrollOffset,
) {
    Feed()   // the whole feed recomposes on every scrolled pixel
}`,
            good: `// Pass a lambda: only the code that calls it reads the offset
Feed(scrollOffset = { listState.firstVisibleItemScrollOffset })`,
            why: 'Every change to a static local recomposes all of its content with skipping off. For fast-changing values, pass a lambda, or at least use <code>compositionLocalOf</code> so only readers update.',
          },
          {
            title: 'Screen data in a local',
            bad: `val LocalCurrentUser = compositionLocalOf<User> { error("No user") }

@Composable
fun AvatarBadge() {
    val user = LocalCurrentUser.current
    Text(user.initials)
}`,
            good: `@Composable
fun AvatarBadge(initials: String) {
    Text(initials)
}`,
            why: 'The badge now needs a provider in every preview, test and screen that uses it, and its signature does not say so. Data a screen shows belongs in parameters.',
          },
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
        deeper: [
          {
            title: 'Interrupted motion: spring vs tween',
            body: `<p>When a target changes mid-flight, <code>animate*AsState</code> starts a new animation from the current value and passes the current velocity along. A spring uses that velocity, so the motion bends toward the new target. A tween ignores it. It starts again at zero speed and runs its full duration, which shows up as a hard corner in the motion.</p>
<p>Run both, then flip the target while they are moving. Each line plots the value over time.</p>`,
            code: `val x by animateFloatAsState(
    targetValue = if (open) 1f else 0f,
    // keeps velocity when interrupted
    animationSpec = spring(Spring.DampingRatioLowBouncy, Spring.StiffnessLow),
    // tween(500, easing = FastOutSlowInEasing) would restart from zero speed
    label = "x",
)`,
            visual(el) {
              const K = 200, C = 2 * 0.75 * Math.sqrt(200), DUR = 0.5, T = 1.6, PW = 300, PH = 120;
              const bez = (x1, y1, x2, y2) => {
                const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
                const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
                return x => { let t = x; for (let i = 0; i < 8; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t = Math.min(1, Math.max(0, t - (X(t) - x) / d)); } return Y(t); };
              };
              const ease = bez(0.4, 0, 0.2, 1);
              const box = h('div', { class: 'cx-d2-plot', html: `<svg viewBox="0 0 ${PW} ${PH + 20}" role="img" aria-label="Value over time for spring and tween"><line class="cx-d2-axis" x1="0" y1="${PH + 10}" x2="${PW}" y2="${PH + 10}"/><line class="cx-d2-axis" x1="0" y1="10" x2="${PW}" y2="10" stroke-dasharray="3 4"/><line class="cx-d2-flip" x1="-10" y1="0" x2="-10" y2="${PH + 20}"/><polyline class="cx-d2-tw" points=""/><polyline class="cx-d2-sp" points=""/></svg>` });
              const svgFlip = box.querySelector('.cx-d2-flip'), plS = box.querySelector('.cx-d2-sp'), plT = box.querySelector('.cx-d2-tw');
              const dotS = h('span', { class: 'cx-d2-dot' }), dotT = h('span', { class: 'cx-d2-dot cx-d2-dot-t' });
              const lane = (name, dot) => h('div', { class: 'cx-d2-lane' }, h('span', { class: 'cx-label' }, name), h('div', { class: 'cx-d2-rail' }, dot));
              const o = out('Press target = 1f, then flip it back before it settles.');
              let run = null;
              const px = t => (t / T) * PW, py = x => 10 + (1 - x) * PH;
              const place = (dot, x) => { dot.style.left = `calc((100% - 22px) * ${Math.max(-0.1, Math.min(1.1, x)).toFixed(4)})`; };
              function frame(now) {
                if (!el.isConnected || !run) return;
                const t = Math.min(T, (now - run.t0) / 1000);
                const s = run.s, w = run.w;
                if (run.flipReq) {
                  run.flipReq = false;
                  const before = w.x;
                  const p0 = Math.min(1, (t - 0.01 - w.start) / w.dur), wPrev = w.from + (w.to - w.from) * ease(Math.max(0, p0));
                  run.flipT = t; s.target = 1 - s.target; w.from = before; w.to = s.target; w.start = t;
                  svgFlip.setAttribute('x1', px(t)); svgFlip.setAttribute('x2', px(t));
                  say(o, `<span class="muted">flip at ${Math.round(t * 1000)} ms:</span> spring keeps v = ${s.v.toFixed(1)}/s <span class="muted">·</span> tween had v = ${((before - wPrev) / 0.01).toFixed(1)}/s and drops to 0`);
                }
                while (run.simT < t) { const dt = 1 / 240; s.v += (-K * (s.x - s.target) - C * s.v) * dt; s.x += s.v * dt; run.simT += dt; }
                w.x = w.from + (w.to - w.from) * ease(Math.min(1, (t - w.start) / w.dur));
                run.ps.push(`${px(t).toFixed(1)},${py(s.x).toFixed(1)}`); run.pt.push(`${px(t).toFixed(1)},${py(w.x).toFixed(1)}`);
                plS.setAttribute('points', run.ps.join(' ')); plT.setAttribute('points', run.pt.join(' '));
                place(dotS, s.x); place(dotT, w.x);
                if (t < T) requestAnimationFrame(frame);
                else {
                  run.done = true;
                  if (run.flipT == null) say(o, 'No flip this time. Run again and press the flip while both are moving.');
                  else say(o, '<span class="good">Spring:</span> one smooth curve through the flip. <span class="bad">Tween:</span> a corner where it restarted from zero speed.');
                }
              }
              function start() {
                if (run && !run.done) { replay(box, 'shake'); return; }
                run = { t0: performance.now(), simT: 0, s: { x: 0, v: 0, target: 1 }, w: { x: 0, from: 0, to: 1, start: 0, dur: DUR }, ps: [], pt: [], flipReq: false, flipT: null, done: false };
                svgFlip.setAttribute('x1', -10); svgFlip.setAttribute('x2', -10);
                say(o, 'Both animate toward 1f. Flip now.');
                requestAnimationFrame(frame);
              }
              function flip() {
                if (!run || run.done) { say(o, 'Nothing is moving. Press target = 1f first.'); replay(o, 'shake'); return; }
                if (run.flipT != null) { say(o, 'One flip per run keeps the plot readable. Wait for it to finish, then run again.'); return; }
                run.flipReq = true;
              }
              place(dotS, 0); place(dotT, 0);
              el.append(
                lane('spring(LowBouncy, StiffnessLow)', dotS), lane('tween(500, FastOutSlowIn)', dotT),
                box,
                h('div', { class: 'cx-d2-legend' }, h('span', { class: 'cx-d2-key' }, 'spring'), h('span', { class: 'cx-d2-key cx-d2-key-t' }, 'tween'), h('span', { class: 'cx-label' }, 'time →')),
                h('div', { class: 'controls cx-ctl' }, cmd('target = 1f', start), cmd('target = 0f  // mid-flight', flip)),
                o);
            },
          },
          {
            title: 'Animatable: animations you drive from a coroutine',
            body: `<p>Under <code>animate*AsState</code> sits <code>Animatable</code>, which you can use directly for gestures. <code>animateTo</code> is a suspend function that returns when the animation ends. <code>snapTo</code> jumps without animating, which suits a drag that follows the finger.</p>
<p>Only one animation runs per <code>Animatable</code>. Starting <code>animateTo</code> or <code>snapTo</code> cancels the running one, and its coroutine gets a <code>CancellationException</code>. A new <code>animateTo</code> keeps the current velocity, so a flick back mid-flight stays smooth.</p>`,
            code: `val offset = remember { Animatable(0f) }
val scope = rememberCoroutineScope()

Box(
    Modifier
        .offset { IntOffset(offset.value.roundToInt(), 0) }
        .draggable(
            state = rememberDraggableState { delta ->
                scope.launch { offset.snapTo(offset.value + delta) }
            },
            orientation = Orientation.Horizontal,
            onDragStopped = { velocity ->
                offset.animateTo(0f, spring(), initialVelocity = velocity)
            },
        )
)`,
            visual(el) {
              const K = 260, C = 2 * 0.45 * Math.sqrt(260), MAX = 240;
              let x = 0, v = 0, target = null, job = null, nextId = 1, last = 0, looping = false;
              const card = h('span', { class: 'cx-d2-card' });
              const rail = h('div', { class: 'cx-d2-rail cx-d2-rail-big' }, card);
              const read = h('div', { class: 'cx-d2-read' });
              const log = h('ol', { class: 'cx-d2-log', 'aria-label': 'Coroutines' });
              const o = out('Launch an animation, then launch another before it ends.');
              const jobs = [];
              const paint = () => {
                card.style.left = `calc((100% - 44px) * ${(Math.max(-20, Math.min(MAX + 20, x)) / MAX).toFixed(4)})`;
                read.textContent = `offset.value = ${x.toFixed(0)}f   velocity = ${v.toFixed(0)}/s${job ? `   running: job #${job.id}` : ''}`;
              };
              const paintLog = () => log.replaceChildren(...jobs.slice(-5).map(j => h('li', { class: `cx-d2-job cx-d2-${j.state}` }, h('span', {}, `#${j.id} ${j.what}`), h('span', { class: 'cx-tag' }, j.state))));
              function cancelRunning(by) {
                if (!job) return null;
                const j = job; j.state = 'cancelled'; job = null; target = null;
                say(o, `job #${j.id} <span class="bad">cancelled</span> <span class="muted">(CancellationException)</span> by ${by}`);
                return j;
              }
              function loop(now) {
                if (!el.isConnected) { looping = false; return; }
                const dt = Math.min(0.05, (now - last) / 1000); last = now;
                if (job && target != null) {
                  let left = dt;
                  while (left > 0) { const s = Math.min(left, 1 / 240); v += (-K * (x - target) - C * v) * s; x += v * s; left -= s; }
                  if (Math.abs(x - target) < 0.4 && Math.abs(v) < 4) {
                    x = target; v = 0; job.state = 'finished';
                    say(o, `job #${job.id} <span class="good">finished</span>: animateTo returned, the next line of the coroutine runs`);
                    job = null; target = null; paintLog();
                  }
                }
                paint();
                if (job) requestAnimationFrame(loop); else looping = false;
              }
              function animateTo(t) {
                const prev = cancelRunning(`job #${nextId}`);
                job = { id: nextId++, what: `animateTo(${t}f)`, state: 'running' }; jobs.push(job); target = t;
                if (!prev) say(o, `job #${job.id} launched: ${hl(`animateTo(${t}f)`)} <span class="muted">starts with v = ${v.toFixed(0)}/s</span>`);
                else o.innerHTML += `<br><span class="muted">job #${job.id} starts from ${x.toFixed(0)}f, carrying v = ${v.toFixed(0)}/s</span>`;
                paintLog();
                if (!looping) { looping = true; last = performance.now(); requestAnimationFrame(loop); }
              }
              function snap() {
                const prev = cancelRunning('snapTo');
                x = Math.min(MAX, x + 40); v = 0;
                replay(card, 'pop'); paint(); paintLog();
                if (!prev) say(o, `${hl('snapTo')} <span class="muted">jumps to</span> ${x.toFixed(0)}f <span class="muted">with no animation and zero velocity, like a finger drag</span>`);
              }
              paint(); paintLog();
              el.append(rail, read,
                h('div', { class: 'controls cx-ctl' },
                  cmd('launch { offset.animateTo(240f) }', () => animateTo(MAX)),
                  cmd('launch { offset.animateTo(0f) }', () => animateTo(0)),
                  cmd('launch { offset.snapTo(offset.value + 40f) }', snap)),
                h('span', { class: 'cx-label' }, 'Coroutines, newest last'), log, o);
            },
          },
          {
            title: 'Lists: animateItem needs keys',
            body: `<p>In a lazy list, <code>Modifier.animateItem()</code> fades items in and out and slides them to new positions when the list changes. It matches old and new items by key. Without <code>key</code>, items are matched by index, so a move looks like every row changing its text in place.</p>`,
            code: `LazyColumn {
    items(tasks, key = { it.id }) { task ->
        TaskRow(task, Modifier.animateItem())
    }
}`,
          },
          {
            title: 'The system animation scale applies to you',
            body: `<p>Compose scales animation durations by the system animator duration scale. In Developer options you can slow every animation down 5 or 10 times to inspect it. The <em>Remove animations</em> accessibility setting sets the scale to 0, and animations jump to their end. So never put meaning only in motion, and test your screens with animations off.</p>
<p>In UI tests, take control of the clock to check a frame in the middle of an animation.</p>`,
            code: `composeTestRule.mainClock.autoAdvance = false
composeTestRule.onNodeWithText("Favorite").performClick()
composeTestRule.mainClock.advanceTimeBy(150)   // mid-animation
composeTestRule.onNodeWithTag("chip").assertIsDisplayed()`,
          },
        ],
        underHood: {
          body: `<p><code>animateFloatAsState</code> remembers an <code>Animatable</code> and a channel. Each new target goes into the channel, and a <code>LaunchedEffect</code> reads it and calls <code>animateTo</code>, which cancels the animation still running. That is how retargeting works.</p>
<p>The animation itself is a coroutine loop. Each step suspends in <code>withFrameNanos</code> until the next frame from the <code>MonotonicFrameClock</code>, which Choreographer drives on Android. It computes the value for that frame time from the spec and writes it into a snapshot <code>State</code>. Whoever read that State is invalidated: a composable if you read it in composition, only layout or draw if you read it inside a lambda modifier like <code>offset { }</code> or <code>graphicsLayer { }</code>.</p>`,
        },
        mistakes: [
          {
            title: 'An Animatable without remember',
            bad: `@Composable
fun Shake(trigger: Int) {
    val offset = Animatable(0f)
    LaunchedEffect(trigger) { offset.animateTo(12f); offset.animateTo(0f) }
    Box(Modifier.offset { IntOffset(offset.value.roundToInt(), 0) })
}`,
            good: `@Composable
fun Shake(trigger: Int) {
    val offset = remember { Animatable(0f) }
    LaunchedEffect(trigger) { offset.animateTo(12f); offset.animateTo(0f) }
    Box(Modifier.offset { IntOffset(offset.value.roundToInt(), 0) })
}`,
            why: 'Each recomposition builds a fresh <code>Animatable</code> at 0. The effect keeps animating the old one, so the box snaps back and stops following.',
          },
          {
            title: 'Force-unwrapping inside AnimatedVisibility',
            bad: `AnimatedVisibility(visible = error != null) {
    Text(error!!.message)
}`,
            good: `AnimatedContent(targetState = error, label = "error") { e ->
    if (e != null) Text(e.message)
}`,
            why: 'The content keeps composing during the exit animation, after <code>error</code> is already null, so <code>!!</code> crashes. <code>AnimatedContent</code> gives the leaving content its own old value.',
          },
          {
            title: 'Reading an animated value in composition',
            bad: `val x by animateDpAsState(if (open) 200.dp else 0.dp, label = "x")
Box(Modifier.offset(x = x))`,
            good: `val x by animateDpAsState(if (open) 200.dp else 0.dp, label = "x")
Box(Modifier.offset { IntOffset(x.roundToPx(), 0) })`,
            why: '<code>offset(x = x)</code> reads the value during composition, so the box recomposes on every frame. The lambda version reads it during layout and skips composition entirely.',
          },
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
            say(o, `${hl(`AnimatedVisibility(visible = ${visible})`)} <span class="muted">${visible ? 'default enter: fadeIn + expandIn' : 'default exit: shrinkOut + fadeOut, then leaves composition'}</span>`);
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
        deeper: [
          {
            title: 'Intrinsics: one question before the measure',
            body: `<p>A classic case: two texts in a <code>Row</code> with a divider between them. The divider uses <code>fillMaxHeight()</code>, but the Row only knows its height after measuring its children. So the divider takes the whole max height it was offered, and the Row grows with it.</p>
<p><code>Modifier.height(IntrinsicSize.Min)</code> fixes this. Before measuring, the Row asks each child for its <code>minIntrinsicHeight</code>: the smallest height it needs to show its content properly. The Row takes the largest answer as a fixed height, then measures each child once inside it. Asking is not measuring, so the one-measure rule still holds.</p>`,
            code: `Row(Modifier.height(IntrinsicSize.Min)) {
    Text("Kotlin", Modifier.weight(1f))
    VerticalDivider()                 // fillMaxHeight() inside
    Text("Coroutines\\nFlow\\nCompose", Modifier.weight(1f))
}`,
            visual(el) {
              let intrinsic = false, busy = false;
              const MAXH = 200;
              const left = h('div', { class: 'cx-d2-it' }, 'Kotlin');
              const div = h('span', { class: 'cx-d2-div' });
              const right = h('div', { class: 'cx-d2-it' }, 'Coroutines', h('br'), 'Flow', h('br'), 'Compose');
              const qs = [h('span', { class: 'cx-d2-q' }), h('span', { class: 'cx-d2-q' }), h('span', { class: 'cx-d2-q' })];
              const row = h('div', { class: 'cx-d2-irow' }, h('div', { class: 'cx-d2-icell' }, left, qs[0]), h('div', { class: 'cx-d2-icell cx-d2-icell-d' }, div, qs[1]), h('div', { class: 'cx-d2-icell' }, right, qs[2]));
              const col = h('div', { class: 'cx-d2-col' }, h('span', { class: 'cx-d2-max' }, `maxHeight = ${MAXH}`), row);
              const src = h('div', { class: 'kt' });
              const o = out('Measure the Row, then turn on IntrinsicSize.Min and measure again.');
              const sw = h('input', { type: 'checkbox', id: 'cx-d2-li-on' });
              const H = { l: 26, r: 74 };
              const paintSrc = () => { src.innerHTML = hl(`Row(Modifier${intrinsic ? '.height(IntrinsicSize.Min)' : ''}) { Text; VerticalDivider(); Text }`); };
              const setH = (rh, dh) => { row.style.height = rh + 'px'; div.style.height = dh + 'px'; };
              const clearQ = () => qs.forEach(q => { q.textContent = ''; q.classList.remove('cx-d2-q-on'); });
              sw.addEventListener('change', () => { if (busy) { sw.checked = intrinsic; return; } intrinsic = sw.checked; paintSrc(); clearQ(); setH(H.r, 0); say(o, intrinsic ? 'IntrinsicSize.Min is on. Measure again.' : 'Plain Row. Measure again.'); });
              async function measure() {
                if (busy) return; busy = true;
                clearQ(); setH(H.r, 0); row.classList.remove('cx-d2-over');
                const wait = async ms => { await sleep(ms); return el.isConnected; };
                if (intrinsic) {
                  say(o, 'Row asks each child: <span class="good">minIntrinsicHeight(width)?</span>');
                  const ans = [H.l, 0, H.r];
                  for (let i = 0; i < 3; i++) {
                    if (!await wait(420)) return;
                    qs[i].textContent = `${ans[i]}`; qs[i].classList.add('cx-d2-q-on'); replay(qs[i], 'pop');
                  }
                  if (!await wait(500)) return;
                  setH(H.r, 0); replay(row, 'cx-flash');
                  say(o, `Largest answer is ${H.r}. The Row measures every child once with <span class="good">minHeight = maxHeight = ${H.r}</span>.`);
                  if (!await wait(600)) return;
                  setH(H.r, H.r);
                  say(o, `<span class="good">The divider fills ${H.r}</span>, exactly as tall as the tallest text. One measure per child.`);
                } else {
                  say(o, `Row measures each child with maxHeight = ${MAXH}.`);
                  if (!await wait(500)) return;
                  qs[0].textContent = `${H.l}`; qs[0].classList.add('cx-d2-q-on'); replay(qs[0], 'pop');
                  if (!await wait(420)) return;
                  setH(MAXH, MAXH); qs[1].textContent = `${MAXH}`; qs[1].classList.add('cx-d2-q-on'); replay(qs[1], 'pop');
                  say(o, `${hl('fillMaxHeight()')} <span class="muted">takes the whole max:</span> ${MAXH}`);
                  if (!await wait(500)) return;
                  qs[2].textContent = `${H.r}`; qs[2].classList.add('cx-d2-q-on'); replay(qs[2], 'pop');
                  if (!await wait(500)) return;
                  row.classList.add('cx-d2-over');
                  say(o, `<span class="bad">Row height = ${MAXH}.</span> The divider stretched the Row to everything it was offered.`);
                }
                busy = false;
              }
              paintSrc(); setH(H.r, 0);
              el.append(src, col,
                h('div', { class: 'controls cx-ctl' }, cmd('measure(constraints)', measure), h('label', { class: 'switch', for: 'cx-d2-li-on' }, sw, 'height(IntrinsicSize.Min)')),
                o);
            },
          },
          {
            title: 'Modifier.layout: lay out one element',
            body: `<p>When only one element needs custom measuring, a full <code>Layout</code> is overkill. <code>Modifier.layout { measurable, constraints -> }</code> gives you that single element. It follows the same rules: measure once, report a size, place.</p>
<p>Designers often spec text by the distance from the top to the first baseline, not to the top of the text box. <code>padding(top = 24.dp)</code> puts the box 24 dp down, and the baseline lands lower. The modifier below reads the <code>FirstBaseline</code> alignment line and places the text so the baseline lands exactly where asked. If the target is smaller than the text’s own top-to-baseline distance, the offset goes negative and the text draws above its bounds.</p>`,
            code: `fun Modifier.firstBaselineToTop(distance: Dp) = layout { measurable, constraints ->
    val placeable = measurable.measure(constraints)
    check(placeable[FirstBaseline] != AlignmentLine.Unspecified)
    val y = distance.roundToPx() - placeable[FirstBaseline]
    layout(placeable.width, placeable.height + y) {
        placeable.placeRelative(0, y)
    }
}`,
            visual(el) {
              let mode = 0, base = null, tries = 0;
              const MODES = [
                { src: 'Modifier.padding(top = 24.dp)', pad: true, d: 24 },
                { src: 'Modifier.firstBaselineToTop(32.dp)', pad: false, d: 32 },
                { src: 'Modifier.firstBaselineToTop(12.dp)', pad: false, d: 12 },
              ];
              const mark = h('span', { class: 'cx-d2-blmark' });
              const txt = h('span', { class: 'cx-d2-bltext' }, 'Headline', mark);
              const inner = h('div', { class: 'cx-d2-blin' }, txt);
              const bline = h('span', { class: 'cx-d2-bline' });
              const blabel = h('span', { class: 'cx-d2-blabel' });
              const boxEl = h('div', { class: 'cx-d2-bl' }, inner, bline, blabel);
              const o = out('Pick a modifier. The green line is the first baseline.');
              const btns = MODES.map((m, i) => cmd(m.src, () => { mode = i; paint(true); }));
              function paint(anim) {
                btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === mode)));
                if (base == null) { if (!txt.isConnected) return; base = mark.offsetTop; }
                const m = MODES[mode], th = txt.offsetHeight;
                const y = m.pad ? m.d : m.d - base;
                const hgt = m.pad ? th + m.d : th + y;
                inner.style.transform = `translateY(${y}px)`;
                boxEl.style.height = Math.max(0, hgt) + 'px';
                bline.style.top = (y + base) + 'px'; blabel.style.top = (y + base) + 'px';
                blabel.textContent = `baseline ${y + base}`;
                boxEl.classList.toggle('cx-d2-neg', y < 0);
                if (anim) replay(boxEl, 'cx-flash');
                say(o, m.pad
                  ? `${hl(m.src)} <span class="muted">moves the box ${m.d} down, and the text’s own ${base} to its baseline comes on top:</span> <span class="bad">baseline at ${m.d + base}</span>`
                  : y < 0
                    ? `${hl(`y = ${m.d} - ${base} = ${y}`)} <span class="bad">negative: the text draws above its own bounds</span>`
                    : `${hl(`y = ${m.d} - ${base} = ${y}`)} <span class="good">baseline exactly ${m.d} from the top</span>, height ${hgt}`);
              }
              const settle = () => { if (base != null || tries++ > 120) return; if (txt.isConnected) paint(false); else requestAnimationFrame(settle); };
              el.append(h('div', { class: 'cx-d2-blwrap' }, boxEl), h('div', { class: 'controls cx-ctl' }, btns), o);
              settle();
            },
          },
          {
            title: 'SubcomposeLayout: compose after measuring',
            body: `<p>A normal layout composes its children first and measures them after. Sometimes what to show depends on the space, like a different item when the width is small. <code>SubcomposeLayout</code> composes children inside the measure step, once the constraints are known. <code>BoxWithConstraints</code> is built on it, and so is <code>LazyColumn</code>, which composes only the items that fit.</p>
<p>It costs more than a plain layout, and it does not support intrinsic measurements. So reach for it only when the content really depends on the size.</p>`,
            code: `BoxWithConstraints {
    if (maxWidth < 400.dp) CompactHeader() else WideHeader()
}`,
          },
        ],
        underHood: {
          body: `<p>Every composable that emits UI becomes a <code>LayoutNode</code> with a <code>MeasurePolicy</code>, the lambda you pass to <code>Layout</code>. Layout modifiers like <code>padding</code> or <code>layout { }</code> are wrapped around the node as a chain, so <code>measure()</code> on a child runs the outermost modifier first and ends in the node’s policy.</p>
<p>Results are cached per node. A node measures again only when its incoming constraints change or when a <code>State</code> it read during measure changes. In that case Compose re-runs layout without recomposing. <code>Constraints</code> itself is a value class that packs all four bounds into one <code>Long</code>, so passing it around allocates nothing.</p>`,
        },
        mistakes: [
          {
            title: 'Passing the parent’s minimums down to children',
            bad: `Layout(content, Modifier.fillMaxWidth()) { measurables, constraints ->
    val placeables = measurables.map { it.measure(constraints) }
    // ...
}`,
            good: `Layout(content, Modifier.fillMaxWidth()) { measurables, constraints ->
    val loose = constraints.copy(minWidth = 0, minHeight = 0)
    val placeables = measurables.map { it.measure(loose) }
    // ...
}`,
            why: '<code>fillMaxWidth()</code> sets minWidth equal to maxWidth. Passed straight down, every chip must be full width, so each one lands on its own row.',
          },
          {
            title: 'Reporting a size outside the constraints',
            bad: `layout(rowWidth, totalHeight) {
    placeables.forEach { it.placeRelative(x, y) }
}`,
            good: `layout(
    constraints.constrainWidth(rowWidth),
    constraints.constrainHeight(totalHeight),
) {
    placeables.forEach { it.placeRelative(x, y) }
}`,
            why: 'Compose clamps a size that breaks the constraints, and centers your content in the clamped space. Your edges end up cut or shifted. Constrain the size yourself.',
          },
          {
            title: 'Sizing one child from another with onSizeChanged',
            bad: `var labelWidth by remember { mutableIntStateOf(0) }
Text(label, Modifier.onSizeChanged { labelWidth = it.width })
HorizontalDivider(
    Modifier.width(with(LocalDensity.current) { labelWidth.toDp() })
)`,
            good: `Column(Modifier.width(IntrinsicSize.Max)) {
    Text(label)
    HorizontalDivider(Modifier.fillMaxWidth())
}`,
            why: 'The width arrives after the first frame, so the divider starts at 0 and then jumps, and each change costs an extra recomposition. Let layout answer it with intrinsics or a custom <code>Layout</code>.',
          },
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
        deeper: [
          {
            title: 'Bottom tabs: one back stack per tab',
            body: `<p>A bottom bar that calls <code>navigate(Search)</code> on each tap piles entries on one stack. After a few taps, back walks through every tab you ever visited. The standard fix uses three options together. <code>popUpTo</code> the start destination with <code>saveState = true</code> clears the current tab but saves its entries. <code>restoreState = true</code> brings back the saved entries of the tab you open. <code>launchSingleTop</code> avoids a second copy of a tab.</p>
<p>Open a few screens in each tab, switch tabs, and press back. Then turn on the options and try again.</p>`,
            code: `fun NavController.openTab(tab: Any) = navigate(tab) {
    popUpTo(graph.findStartDestination().id) { saveState = true }
    launchSingleTop = true
    restoreState = true
}

NavigationBarItem(
    selected = currentTab == Search,
    onClick = { navController.openTab(Search) },
    icon = { Icon(Icons.Default.Search, contentDescription = null) },
    label = { Text("Search") },
)`,
            visual(el) {
              const TABS = ['Home', 'Search', 'Profile'];
              const CHILD = { Home: n => `Article(${n})`, Search: n => `Results(page = ${n})`, Profile: n => `Settings(${n})` };
              let on = false, busy = false, stack, cur, saved, count;
              const stackEl = h('div', { class: 'cx-stack cx-d2-nstack', 'aria-label': 'Back stack, bottom first' });
              const shelf = h('div', { class: 'cx-d2-shelf' });
              const screen = h('p', { class: 'cx-scr-title' });
              const bar = h('div', { class: 'cx-d2-tabs' });
              const tabBtns = TABS.map(t => h('button', { class: 'cx-d2-tab', type: 'button', onclick: () => openTab(t) }, t));
              bar.append(...tabBtns);
              const phone = h('div', { class: 'cx-d2-nphone' }, h('div', { class: 'cx-d2-nscreen' }, screen), bar);
              const o = out('');
              const sw = h('input', { type: 'checkbox', id: 'cx-d2-nt-opts' });
              const entry = (route, tab) => ({ route, tab });
              function reset() { stack = [entry('Home', 'Home')]; cur = 'Home'; saved = { Home: [], Search: [], Profile: [] }; count = { Home: 0, Search: 0, Profile: 0 }; paint(); }
              function paint(fresh) {
                stackEl.replaceChildren(...stack.map((e, i) => h('div', { class: 'cx-entry' + (i === stack.length - 1 ? ' cx-top' : '') + (fresh && i === stack.length - 1 ? ' drop-in' : '') }, h('span', { class: 'cx-entry-route' }, e.route), h('span', { class: 'cx-entry-args' }, `${e.tab} tab`))));
                shelf.replaceChildren(h('span', { class: 'cx-label' }, 'Saved state'), ...TABS.map(t => h('div', { class: 'cx-d2-saved' + (saved[t].length ? ' cx-d2-saved-on' : '') }, h('b', {}, t), h('span', {}, saved[t].length ? saved[t].map(e => e.route).join(', ') : '(none)'))));
                shelf.hidden = !on;
                screen.textContent = stack[stack.length - 1].route;
                tabBtns.forEach((b, i) => { b.classList.toggle('cx-d2-tab-on', TABS[i] === cur); b.setAttribute('aria-pressed', String(TABS[i] === cur)); });
              }
              function openTab(t) {
                if (busy) return;
                if (!on) {
                  stack.push(entry(t, t)); cur = t; paint(true);
                  say(o, `${hl(`navigate(${t})`)} <span class="muted">pushed. Stack size:</span> ${stack.length}${stack.length > 5 ? ' <span class="bad">// back now walks through all of this</span>' : ''}`);
                  return;
                }
                if (t === cur) {
                  if (t === 'Home' && saved.Home.length) {
                    const n = saved.Home.length; stack.push(...saved.Home); saved.Home = []; paint(true);
                    say(o, `<span class="good">restored ${n} entr${n > 1 ? 'ies' : 'y'} of Home</span> <span class="muted">// restoreState</span>`); return;
                  }
                  replay(phone, 'pop-soft'); say(o, `Already on ${t}. launchSingleTop keeps one copy.`); return;
                }
                const leaving = stack.slice(1);
                saved[cur] = leaving;
                stack = [stack[0]];
                if (t !== 'Home') stack.push(...(saved[t].length ? saved[t] : [entry(t, t)]));
                else stack.push(...saved.Home);
                const restored = t === 'Home' ? saved.Home.length : Math.max(0, saved[t].length - 1);
                saved[t] = [];
                const from = cur; cur = t; paint(true); replay(shelf, 'pop-soft');
                say(o, `<span class="muted">saved ${from}:</span> ${leaving.length ? leaving.map(e => e.route).join(', ') : 'nothing above Home'} <span class="muted">·</span> ${restored ? `<span class="good">restored ${restored} entr${restored > 1 ? 'ies' : 'y'} of ${t}</span>` : `opened ${t}`}`);
              }
              function open() {
                if (busy) return;
                const n = ++count[cur];
                stack.push(entry(CHILD[cur](n), cur)); paint(true);
                say(o, `${hl(`navigate(${CHILD[cur](n)})`)} <span class="muted">inside the ${cur} tab</span>`);
              }
              async function back() {
                if (busy) return;
                if (stack.length === 1) { replay(stackEl.lastElementChild, 'shake'); say(o, 'Only Home is left. Back now leaves the app.'); return; }
                busy = true;
                const top = stackEl.lastElementChild; top.classList.add('leave');
                await sleep(380);
                if (!el.isConnected) return;
                const gone = stack.pop(); cur = stack[stack.length - 1].tab; paint();
                say(o, `${hl('popBackStack()')} <span class="muted">removed</span> ${gone.route}${!on && gone.tab !== cur ? ' <span class="bad">// back jumped to another tab</span>' : ''}`);
                busy = false;
              }
              sw.addEventListener('change', () => { if (busy) { sw.checked = on; return; } on = sw.checked; reset(); say(o, on ? 'Each tab now keeps its own stack. Open screens, switch tabs, come back.' : 'Plain navigate(tab). Watch the stack grow.'); });
              reset();
              say(o, 'Open a screen in Home, switch to Search, open one there, then press back a few times.');
              el.append(
                h('div', { class: 'cx-nav' }, h('div', { class: 'cx-tree' }, h('span', { class: 'cx-label' }, 'Back stack (top is current)'), stackEl, shelf), phone),
                h('div', { class: 'controls cx-ctl' }, cmd('navigate(child)', open), cmd('popBackStack()', back), h('label', { class: 'switch', for: 'cx-d2-nt-opts' }, sw, 'popUpTo + saveState + restoreState')),
                o);
            },
          },
          {
            title: 'Deep links from the route class',
            body: `<p><code>navDeepLink&lt;Product&gt;(basePath)</code> builds the URI pattern from the route’s properties. A property without a default value becomes a path segment. A property with a default value becomes an optional query parameter. When a link arrives, Navigation matches the pattern, parses each argument into its Kotlin type and opens the screen with a typed <code>Product</code>.</p>
<p>A value that can’t be parsed, like <code>abc</code> for an <code>Int</code>, does not match. You still need an <code>intent-filter</code> in the manifest for the scheme and host, since Navigation can’t add it from code.</p>`,
            code: `@Serializable
data class Product(val id: Int, val ref: String? = null)

composable<Product>(
    deepLinks = listOf(navDeepLink<Product>(basePath = "https://shop.example/product")),
) { entry ->
    val product: Product = entry.toRoute()
    ProductScreen(product.id, source = product.ref)
}
// Pattern: https://shop.example/product/{id}?ref={ref}`,
            visual(el) {
              const BASE = 'https://shop.example/product';
              const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
              const input = h('input', { class: 'cx-dv-in cx-d2-url', id: 'cx-d2-nd-url', type: 'text', spellcheck: 'false', autocomplete: 'off', value: `${BASE}/42` });
              const parts = [h('span', { class: 'cx-d2-pp' }, BASE), h('span', { class: 'cx-d2-pp' }, '/{id}'), h('span', { class: 'cx-d2-pp' }, '?ref={ref}')];
              const pat = h('div', { class: 'cx-d2-pat' }, ...parts);
              const res = h('div', { class: 'cx-stack cx-d2-dstack' });
              const o = out('Open a link to match it against the pattern.');
              let busy = false;
              const PRE = [`${BASE}/42`, `${BASE}/42?ref=mail`, `${BASE}/abc`, 'https://shop.example/products/42'];
              const presets = PRE.map(u => h('button', { class: 'cmd', type: 'button', onclick() { if (busy) return; input.value = u; go(); } }, u.replace('https://shop.example', '…')));
              const mark = (i, cls) => { parts[i].classList.remove('cx-d2-ok', 'cx-d2-err'); if (cls) { parts[i].classList.add(cls); replay(parts[i], 'pop'); } };
              async function go() {
                if (busy) return; busy = true;
                parts.forEach((_, i) => mark(i, null)); res.replaceChildren();
                const wait = async ms => { await sleep(ms); return el.isConnected; };
                let u = null;
                try { u = new URL(input.value.trim()); } catch (e) { u = null; }
                const fail = (i, msg) => { if (i != null) mark(i, 'cx-d2-err'); say(o, `<span class="bad">no match:</span> ${msg}<br><span class="muted">// the app opens on its start destination, Home</span>`); res.replaceChildren(h('div', { class: 'cx-entry cx-top drop-in' }, h('span', { class: 'cx-entry-route' }, 'Home'), h('span', { class: 'cx-entry-args' }, 'start destination'))); busy = false; };
                if (!u) return fail(null, 'not a valid URI');
                const segs = u.pathname.split('/').filter(Boolean);
                const baseOk = u.origin === 'https://shop.example' && segs.length === 2 && segs[0] === 'product';
                if (!await wait(300)) return;
                if (!baseOk) return fail(0, `${esc(u.origin + '/' + segs.slice(0, 1).join('/'))} is not the base path`);
                mark(0, 'cx-d2-ok');
                if (!await wait(380)) return;
                const raw = decodeURIComponent(segs[1]);
                if (!/^-?\d{1,10}$/.test(raw) || Math.abs(+raw) > 2147483647) return fail(1, `"${esc(raw)}" can’t be parsed as an Int`);
                mark(1, 'cx-d2-ok');
                if (!await wait(380)) return;
                const ref = u.searchParams.get('ref');
                mark(2, ref != null ? 'cx-d2-ok' : null);
                const route = `Product(id = ${+raw}, ref = ${ref == null ? 'null' : `"${ref}"`})`;
                res.replaceChildren(
                  h('div', { class: 'cx-entry drop-in' }, h('span', { class: 'cx-entry-route' }, 'Home'), h('span', { class: 'cx-entry-args' }, 'start destination, added below')),
                  h('div', { class: 'cx-entry cx-top drop-in' }, h('span', { class: 'cx-entry-route' }, route), h('span', { class: 'cx-entry-args' }, 'entry.toRoute<Product>()')));
                say(o, `<span class="good">match</span> ${hl(route)}${ref == null ? ' <span class="muted">// ref has a default, so it may be left out</span>' : ''}`);
                busy = false;
              }
              input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
              el.append(
                h('span', { class: 'cx-label' }, 'Generated pattern'), pat,
                h('label', { class: 'cx-label', for: 'cx-d2-nd-url' }, 'Incoming link'), input,
                h('div', { class: 'controls cx-ctl' }, cmd('handleDeepLink(intent)', go), presets),
                h('span', { class: 'cx-label' }, 'Back stack after the link'), res, o);
            },
          },
          {
            title: 'Send a result back',
            body: `<p>A picker screen often returns a value to the screen below it. Each back stack entry has its own <code>SavedStateHandle</code>. Write the result into the previous entry’s handle, then pop. The screen below observes its own handle as a flow. The value survives configuration changes and process death, so keep it small, like an id.</p>`,
            code: `// Picker
navController.previousBackStackEntry?.savedStateHandle?.set("colorId", picked.id)
navController.popBackStack()

// Editor, inside composable<Editor> { entry -> }
val colorId by entry.savedStateHandle
    .getStateFlow<Long?>("colorId", null)
    .collectAsStateWithLifecycle()`,
          },
        ],
        underHood: {
          body: `<p>The Kotlin serialization plugin generates a serializer for every <code>@Serializable</code> route. When you register <code>composable&lt;Product&gt;</code>, Navigation reads that serializer’s descriptor and builds an ordinary string route from the class’s serial name and its properties, picking a <code>NavType</code> for each property from its type. Under the typed API, destinations still have string routes.</p>
<p><code>navigate(Product(42))</code> encodes the object into that route and an argument <code>Bundle</code>, which the <code>NavBackStackEntry</code> keeps and which is saved with the rest of the back stack. <code>toRoute()</code> runs the serializer the other way and decodes the Bundle into a new <code>Product</code>.</p>`,
        },
        mistakes: [
          {
            title: 'Holding the NavController in a ViewModel',
            bad: `class LoginViewModel(private val nav: NavController) : ViewModel() {
    fun onLoggedIn() = nav.navigate(Home)
}`,
            good: `class LoginViewModel : ViewModel() {
    private val _loggedIn = MutableStateFlow(false)
    val loggedIn = _loggedIn.asStateFlow()
}

// In the screen, which owns navigation
LaunchedEffect(loggedIn) { if (loggedIn) onLoggedIn() }`,
            why: 'The ViewModel outlives a rotation. The NavController does not, and it holds the Activity. The old one leaks and navigates a graph nobody sees. Expose state and let the UI navigate.',
          },
          {
            title: 'popBackStack() from the start destination',
            bad: `IconButton(onClick = { navController.popBackStack() }) {
    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
}`,
            good: `IconButton(onClick = { navController.navigateUp() }) {
    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
}`,
            why: '<code>popBackStack()</code> pops whatever is on top, even the start destination. The NavHost is left with nothing to show and the screen goes blank. <code>navigateUp()</code> stops at the start destination.',
          },
          {
            title: 'A custom argument type without a NavType',
            bad: `@Serializable data class Filter(val query: String, val inStock: Boolean)
@Serializable data class Results(val filter: Filter)

composable<Results> { /* ... */ }`,
            good: `// Simplest: flatten the arguments
@Serializable data class Results(val query: String, val inStock: Boolean)

composable<Results> { /* ... */ }`,
            why: 'Navigation knows primitives, strings, enums and lists of them. Any other type needs a <code>NavType</code> in <code>typeMap</code>, or it throws at runtime. Flat arguments avoid the work.',
          },
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
