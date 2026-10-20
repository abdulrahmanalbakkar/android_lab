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
}

/* layouts */
.cmp-ly-parent { position: relative; width: min(440px, 100%); height: 210px; margin: 0 auto; padding: 8px; border-radius: 12px; border: 2px dashed var(--accent); background: var(--surface); display: flex; gap: 8px; min-width: 0; overflow: hidden; }
.cmp-ly-parent.cmp-ly-col { flex-direction: column; }
.cmp-ly-parent.cmp-ly-box { display: grid; gap: 0; }
.cmp-ly-parent.cmp-ly-box > * { grid-area: 1 / 1; }
.cmp-ly-tag { position: absolute; top: 4px; right: 8px; font: 600 0.68rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; pointer-events: none; }
.cmp-ly-item { flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; border: 2px solid var(--ink); font: 700 0.9rem var(--mono); color: var(--ink); min-width: 0; min-height: 0; overflow: hidden; transition: flex-grow 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-ly-item small { display: block; font: 500 0.62rem var(--mono); color: var(--muted); }
.cmp-ly-a { width: 56px; height: 56px; background: var(--accent-soft); }
.cmp-ly-b { width: 76px; height: 40px; background: var(--warm-soft); }
.cmp-ly-c { width: 44px; height: 84px; background: var(--ok-soft); }
.cmp-ly-item.cmp-ly-w { flex-grow: 1; border-style: dashed; }
.cmp-ly-row .cmp-ly-item.cmp-ly-w { width: 76px; }
.cmp-ly-col .cmp-ly-item.cmp-ly-w { height: 40px; }
.cmp-ly-spacer { flex: 0 0 0; min-width: 0; min-height: 0; display: grid; place-items: center; border-radius: 8px; background: repeating-linear-gradient(45deg, var(--sunk) 0 6px, transparent 6px 12px); overflow: hidden; transition: flex-grow 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-ly-spacer.cmp-ly-grow { flex-grow: 1; }
.cmp-ly-spacer span { font: 600 0.62rem var(--mono); color: var(--muted); white-space: nowrap; }
.cmp-ly-grid { display: grid; grid-template-columns: repeat(3, 34px); gap: 4px; }
.cmp-ly-cell { width: 34px; height: 26px; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); cursor: pointer; padding: 0; }
.cmp-ly-cell::after { content: ""; display: block; width: 8px; height: 8px; margin: auto; border-radius: 50%; background: var(--muted); }
.cmp-ly-cell[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
.cmp-ly-cell[aria-pressed="true"]::after { background: var(--accent); }
.cmp-ly-group { display: grid; gap: 6px; min-width: 0; }

/* scaffold */
.cmp-sc-wrap { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start; min-width: 0; }
.cmp-sc-phone { position: relative; width: 230px; height: 400px; border-radius: 28px; border: 8px solid var(--code-bg); background: var(--bg); overflow: hidden; justify-self: center; }
.cmp-sc-status { position: absolute; top: 0; left: 0; right: 0; height: 18px; z-index: 4; display: flex; justify-content: space-between; align-items: center; padding: 0 14px; font: 600 0.6rem var(--mono); color: var(--muted); pointer-events: none; }
.cmp-sc-top { position: absolute; top: 0; left: 0; right: 0; height: 64px; padding: 18px 14px 0; z-index: 3; display: flex; align-items: center; font: 700 1rem var(--display); background: var(--accent-soft); transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-sc-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 66px; padding-bottom: 18px; z-index: 3; display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; background: var(--sunk); transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-sc-bottom span { justify-self: center; width: 34px; height: 8px; border-radius: 99px; background: var(--line); }
.cmp-sc-bottom span:first-child { background: var(--accent); }
.cmp-sc-phone.cmp-sc-notop .cmp-sc-top { transform: translateY(-100%); }
.cmp-sc-phone.cmp-sc-nobottom .cmp-sc-bottom { transform: translateY(100%); }
.cmp-sc-phone.cmp-sc-nopad .cmp-sc-top, .cmp-sc-phone.cmp-sc-nopad .cmp-sc-bottom { opacity: 0.72; }
.cmp-sc-pill { position: absolute; bottom: 6px; left: 50%; width: 70px; height: 4px; margin-left: -35px; border-radius: 99px; background: var(--muted); z-index: 5; }
.cmp-sc-content { position: absolute; inset: 0; overflow-y: auto; scrollbar-width: none; transition: padding 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-sc-content::-webkit-scrollbar { display: none; }
.cmp-sc-row { margin: 6px 10px; padding: 8px 10px; border-radius: 10px; background: var(--surface); border: 2px solid transparent; font: 700 0.82rem var(--body); transition: border-color 0.25s, background 0.25s; }
.cmp-sc-row small { display: block; font-weight: 400; color: var(--muted); }
.cmp-sc-row.cmp-sc-under { border-color: var(--err); background: var(--err-soft); }
.cmp-sc-fab { position: absolute; right: 14px; bottom: 30px; z-index: 3; width: 50px; height: 50px; border-radius: 16px; border: 0; background: var(--accent); color: var(--accent-ink); font: 700 1.5rem/1 var(--body); cursor: pointer; transition: bottom 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.3s; }
.cmp-sc-fab.cmp-sc-hide { transform: scale(0); }
.cmp-sc-snack { position: absolute; left: 10px; right: 10px; bottom: 26px; z-index: 3; padding: 10px 12px; border-radius: 8px; background: var(--code-bg); color: var(--code-ink); font: 500 0.8rem var(--body); display: flex; justify-content: space-between; gap: 8px; opacity: 0; transform: translateY(24px); pointer-events: none; transition: opacity 0.3s, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), bottom 0.35s; }
.cmp-sc-snack b { color: var(--t-k); }
.cmp-sc-snack.cmp-on { opacity: 1; transform: none; }
.cmp-sc-side { display: grid; gap: 10px; min-width: 0; }
.cmp-sc-pad { display: block; padding: 10px 12px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.82rem/1.5 var(--mono); overflow-x: auto; white-space: pre; }
.cmp-sc-q { font: 600 0.78rem var(--mono); color: var(--muted); }

/* theming */
.cmp-th-scope { --cmp-seed: var(--t-k); --cmp-bg: var(--code-ink); --cmp-on: var(--code-bg); --cmp-primary: color-mix(in srgb, var(--cmp-seed), var(--code-bg) 42%); --cmp-on-primary: var(--code-ink); --cmp-container: color-mix(in srgb, var(--cmp-seed) 45%, var(--code-ink)); --cmp-on-container: var(--code-bg); --cmp-surface-c: color-mix(in srgb, var(--cmp-seed) 16%, var(--code-ink)); --cmp-radius: 16px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: center; min-width: 0; }
.cmp-th-scope.cmp-th-dark { --cmp-bg: var(--code-bg); --cmp-on: var(--code-ink); --cmp-primary: var(--cmp-seed); --cmp-on-primary: var(--code-bg); --cmp-container: color-mix(in srgb, var(--cmp-seed) 34%, var(--code-bg)); --cmp-on-container: var(--code-ink); --cmp-surface-c: color-mix(in srgb, var(--cmp-seed) 12%, var(--code-bg)); }
.cmp-th-scope.cmp-th-square { --cmp-radius: 4px; }
.cmp-th-phone { width: 210px; height: 360px; border-radius: 28px; border: 8px solid var(--code-bg); background: var(--cmp-bg); color: var(--cmp-on); overflow: hidden; display: flex; flex-direction: column; justify-self: center; transition: background-color 0.5s, color 0.5s; }
.cmp-th-bar { display: flex; align-items: center; padding: 22px 14px 10px; font: 700 1.05rem var(--display); background: var(--cmp-surface-c); transition: background-color 0.5s; }
.cmp-th-body { flex: 1; display: grid; gap: 10px; align-content: start; padding: 12px; position: relative; }
.cmp-th-card { display: grid; gap: 4px; padding: 12px; border-radius: var(--cmp-radius); background: var(--cmp-container); color: var(--cmp-on-container); transition: background-color 0.5s, color 0.5s, border-radius 0.4s; }
.cmp-th-card b { font: 700 1.05rem var(--display); }
.cmp-th-card span { font-size: 0.8rem; }
.cmp-th-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.cmp-th-btn { padding: 7px 14px; border-radius: 999px; font: 700 0.78rem var(--body); background: var(--cmp-primary); color: var(--cmp-on-primary); transition: background-color 0.5s, color 0.5s; }
.cmp-th-btn.cmp-th-out { background: transparent; color: var(--cmp-primary); box-shadow: inset 0 0 0 1px var(--cmp-primary); }
.cmp-th-text { font-size: 0.8rem; opacity: 0.8; }
.cmp-th-fab { position: absolute; right: 12px; bottom: 12px; width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; font: 700 1.4rem/1 var(--body); background: var(--cmp-container); color: var(--cmp-on-container); transition: background-color 0.5s, color 0.5s, border-radius 0.4s; }
.cmp-th-roles { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr)); gap: 8px; min-width: 0; }
.cmp-th-role { display: flex; gap: 8px; align-items: center; font: 500 0.78rem var(--mono); min-width: 0; overflow-wrap: anywhere; }
.cmp-th-role i { flex: none; width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--line); transition: background-color 0.5s; }
.cmp-th-side { display: grid; gap: 12px; min-width: 0; }
.cmp-th-swatch { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }

/* text input */
.cmp-ti-wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; min-width: 0; }
.cmp-ti-form { display: grid; gap: 6px; padding: 16px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); min-width: 0; }
.cmp-ti-field { position: relative; display: flex; align-items: center; border: 1.5px solid var(--muted); border-radius: 6px; background: var(--surface); transition: border-color 0.2s, box-shadow 0.2s; min-width: 0; }
.cmp-ti-field:focus-within { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.cmp-ti-field.cmp-ti-err { border-color: var(--err); box-shadow: inset 0 0 0 1px var(--err); }
.cmp-ti-field input { flex: 1; min-width: 0; width: 100%; font: 500 1rem var(--mono); padding: 16px 12px 8px; border: 0; background: transparent; color: var(--ink); outline: none; }
.cmp-ti-label { position: absolute; left: 10px; top: 13px; padding: 0 4px; background: var(--surface); color: var(--muted); font-size: 0.95rem; pointer-events: none; transition: top 0.18s, font-size 0.18s, color 0.18s; }
.cmp-ti-field.cmp-ti-up .cmp-ti-label { top: -9px; font-size: 0.74rem; }
.cmp-ti-field:focus-within .cmp-ti-label { color: var(--accent); }
.cmp-ti-field.cmp-ti-err .cmp-ti-label { color: var(--err); }
.cmp-ti-eye { flex: none; margin-right: 6px; font: 600 0.72rem var(--mono); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); color: var(--muted); cursor: pointer; }
.cmp-ti-support { min-height: 1.3em; font-size: 0.78rem; color: var(--err); padding-left: 14px; }
.cmp-ti-state { display: grid; gap: 4px; padding: 10px 12px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.8rem/1.5 var(--mono); overflow-x: auto; min-width: 0; }
.cmp-ti-state div { white-space: pre; }
.cmp-ti-log { display: grid; gap: 2px; min-height: 60px; align-content: start; font: 500 0.76rem/1.45 var(--mono); color: var(--muted); overflow-x: auto; }
.cmp-ti-log div { white-space: nowrap; }
.cmp-kb { display: grid; gap: 6px; padding: 10px; border-radius: 14px; background: var(--sunk); min-width: 0; transition: opacity 0.25s; }
.cmp-kb.cmp-kb-off { opacity: 0.45; }
.cmp-kb-row { display: flex; justify-content: center; gap: 5px; flex-wrap: wrap; }
.cmp-kb-key { min-width: 34px; height: 36px; padding: 0 8px; border-radius: 7px; border: 0; background: var(--surface); color: var(--ink); font: 600 0.9rem var(--mono); cursor: pointer; box-shadow: 0 1px 0 var(--line); }
.cmp-kb-key.cmp-kb-wide { min-width: 96px; }
.cmp-kb-key.cmp-kb-act { background: var(--accent); color: var(--accent-ink); min-width: 70px; }
.cmp-kb-key.cmp-kb-new { animation: pop 0.35s ease-out; outline: 2px solid var(--accent); }

/* lists */
.cmp-ls-wrap { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; align-items: start; min-width: 0; }
.cmp-ls-frame { position: relative; min-width: 0; border-radius: 18px; border: 6px solid var(--code-bg); background: var(--surface); overflow: hidden; }
.cmp-ls-view { position: relative; height: 280px; overflow: auto; overscroll-behavior: contain; }
.cmp-ls-inner { display: grid; gap: 6px; padding: 0 8px; }
.cmp-ls-frame.cmp-ls-row .cmp-ls-view { height: 150px; }
.cmp-ls-frame.cmp-ls-row .cmp-ls-inner { display: flex; gap: 8px; padding: 8px 0; width: max-content; }
.cmp-ls-frame.cmp-ls-grid .cmp-ls-inner { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cmp-ls-frame.cmp-ls-padded .cmp-ls-inner { padding: 24px 8px; }
.cmp-ls-frame.cmp-ls-row.cmp-ls-padded .cmp-ls-inner { padding: 8px 24px; }
.cmp-ls-band { position: absolute; z-index: 2; pointer-events: none; background: var(--accent-soft); opacity: 0; transition: opacity 0.3s; }
.cmp-ls-frame.cmp-ls-padded .cmp-ls-band { opacity: 0.55; }
.cmp-ls-band.cmp-b1 { top: 0; left: 0; right: 0; height: 24px; }
.cmp-ls-band.cmp-b2 { bottom: 0; left: 0; right: 0; height: 24px; }
.cmp-ls-frame.cmp-ls-row .cmp-ls-band.cmp-b1 { right: auto; bottom: 0; width: 24px; height: auto; }
.cmp-ls-frame.cmp-ls-row .cmp-ls-band.cmp-b2 { left: auto; top: 0; width: 24px; height: auto; }
.cmp-ls-item { display: flex; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 10px; background: var(--sunk); font-weight: 700; font-size: 0.9rem; min-width: 0; min-height: 44px; border: 2px solid transparent; }
.cmp-ls-item i { flex: none; width: 26px; height: 26px; border-radius: 50%; background: var(--accent-soft); font: 700 0.8rem/26px var(--mono); text-align: center; font-style: normal; color: var(--accent); }
.cmp-ls-item span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cmp-ls-frame.cmp-ls-row .cmp-ls-item { flex-direction: column; justify-content: center; width: 96px; height: 120px; flex: none; }
.cmp-ls-frame.cmp-ls-grid .cmp-ls-item { flex-direction: column; justify-content: center; height: 86px; padding: 6px; }
.cmp-ls-frame.cmp-ls-grid .cmp-ls-item span, .cmp-ls-frame.cmp-ls-row .cmp-ls-item span { max-width: 100%; font-size: 0.78rem; }
.cmp-ls-head { position: sticky; top: 0; z-index: 1; padding: 4px 10px; border-radius: 6px; background: var(--surface); color: var(--accent); font: 700 0.8rem var(--mono); border-bottom: 2px solid var(--accent-soft); }
.cmp-ls-off { visibility: hidden; }
.cmp-ls-in { animation: cmp-ls-in 0.8s ease-out; }
@keyframes cmp-ls-in { from { border-color: var(--accent); background: var(--accent-soft); } }
.cmp-ls-map { display: grid; grid-template-columns: repeat(5, 12px); gap: 3px; align-content: start; padding: 8px; border-radius: 10px; background: var(--bg); border: 1px dashed var(--line); }
.cmp-ls-tick { width: 12px; height: 12px; border-radius: 3px; background: var(--sunk); transition: background 0.2s; }
.cmp-ls-tick.cmp-h { border-radius: 50%; }
.cmp-ls-tick.cmp-on { background: var(--accent); }
.cmp-ls-count { font: 600 0.8rem var(--mono); color: var(--accent); font-variant-numeric: tabular-nums; }

/* gestures */
.cmp-gs-pad { position: relative; height: 240px; border-radius: 14px; border: 1px dashed var(--line); background: var(--bg); overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; min-width: 0; }
.cmp-gs-target { position: absolute; left: 50%; top: 50%; width: 170px; height: 110px; margin: -55px 0 0 -85px; border-radius: 16px; background: var(--surface); border: 2px solid var(--ink); display: grid; place-items: center; align-content: center; gap: 4px; overflow: hidden; cursor: pointer; text-align: center; }
.cmp-gs-target b { font: 700 1.6rem var(--display); font-variant-numeric: tabular-nums; position: relative; }
.cmp-gs-target small { font: 600 0.72rem var(--mono); color: var(--muted); position: relative; }
.cmp-gs-target.cmp-gs-full { inset: 0; width: auto; height: auto; margin: 0; border: 0; border-radius: 0; background: transparent; }
.cmp-gs-wave { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; border-radius: 50%; background: var(--accent); opacity: 0.35; pointer-events: none; animation: cmp-gs-wave 0.6s ease-out forwards; }
@keyframes cmp-gs-wave { to { transform: scale(14); opacity: 0; } }
.cmp-gs-dot { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: var(--warm); pointer-events: none; }
.cmp-gs-dot span { position: absolute; left: 12px; top: -18px; font: 600 0.7rem var(--mono); color: var(--warm); white-space: nowrap; }
.cmp-gs-puck { position: absolute; left: 0; top: 0; width: 60px; height: 60px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; font: 700 0.72rem var(--mono); cursor: grab; touch-action: none; }
.cmp-gs-puck.cmp-gs-held { cursor: grabbing; box-shadow: 0 0 0 8px var(--accent-soft); }
.cmp-gs-meter { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 8px; border-radius: 99px; background: var(--sunk); overflow: hidden; pointer-events: none; }
.cmp-gs-meter span { display: block; height: 100%; width: 0; background: var(--warm); }
.cmp-gs-meter span.cmp-gs-wait { background: var(--muted); }
.cmp-gs-log { display: grid; gap: 2px; min-height: 104px; align-content: start; padding: 10px 12px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.8rem/1.5 var(--mono); overflow-x: auto; }
.cmp-gs-log div { white-space: nowrap; }

@media (max-width: 640px) {
  .cmp-sc-wrap, .cmp-th-scope, .cmp-ti-wrap { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 460px) {
  .cmp-ls-wrap { grid-template-columns: minmax(0, 1fr); }
  .cmp-ls-map { grid-template-columns: repeat(auto-fill, 12px); }
}
/* depth: recomposition */
.cmp-rs-read { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--warm-soft); color: var(--warm); }
.cmp-rs-lanes { display: grid; gap: 10px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); min-width: 0; }
.cmp-rs-lane { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 10px; align-items: center; min-width: 0; }
.cmp-rs-chips { display: flex; flex-wrap: wrap; gap: 6px; min-height: 34px; align-items: center; min-width: 0; }
.cmp-rs-phone { width: 170px; height: 130px; }
/* depth: remember */
.cmp-zk-price { font: 700 1.2rem var(--display); padding: 0 6px; border-radius: 6px; }
.cmp-card.cmp-zk-stale { border-color: var(--err); }
.cmp-card.cmp-zk-stale .cmp-zk-price { color: var(--err); }
.cmp-zt-table { display: grid; gap: 4px; align-content: start; min-width: 0; font: 500 0.8rem/1.4 var(--mono); }
.cmp-zt-row { margin-left: calc(var(--d, 0) * 14px); padding: 5px 9px; border-radius: 7px; border: 1px solid var(--line); background: var(--surface); white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.cmp-zt-row.cmp-zt-slot { border-color: var(--accent); background: var(--accent-soft); font-weight: 700; }
.cmp-zt-field { width: min(220px, 100%); min-height: 64px; display: grid; align-items: center; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--ink); background: var(--surface); font-weight: 700; overflow-wrap: anywhere; }
/* depth: lazy keys */
.cmp-dk-list { position: relative; }
.cmp-dk-crash { position: absolute; inset: 6px; display: grid; align-content: center; gap: 6px; padding: 14px; border-radius: 10px; background: var(--code-bg); color: var(--t-e); font: 600 0.8rem/1.5 var(--mono); overflow-wrap: anywhere; }
.cmp-sa-view { position: relative; height: 166px; width: min(300px, 100%); margin: 0 auto; overflow: hidden; border-radius: 14px; border: 6px solid var(--code-bg); background: var(--surface); }
.cmp-sa-col { display: grid; gap: 6px; padding: 0 8px; }
.cmp-sa-row { height: 34px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 10px; border-radius: 8px; border: 2px solid transparent; background: var(--sunk); font-weight: 700; font-size: 0.88rem; min-width: 0; }
.cmp-sa-row.cmp-sa-reading { border-color: var(--accent); background: var(--accent-soft); }
.cmp-de-pool { min-width: 0; }
@media (max-width: 640px) {
  .cmp-rs-lane { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}
/* depth 2: modifiers */
.cmp-d2m-row { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 160px; padding: 16px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); overflow: hidden; min-width: 0; }
.cmp-d2m-nb { position: relative; z-index: 1; flex: none; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 10px; border: 2px solid var(--ink); background: var(--surface); font: 700 0.9rem var(--mono); }
.cmp-d2m-slot { position: relative; z-index: 2; flex: none; width: 100px; height: 100px; outline: 2px dashed var(--warm); transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-d2m-box { position: absolute; display: grid; place-items: center; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font: 700 0.9rem var(--mono); opacity: 0.88; transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-d2m-box.cmp-d2m-spill { box-shadow: 0 0 0 3px var(--err); }
.cmp-d2m-sizes { display: flex; flex-wrap: wrap; gap: 6px 16px; font: 500 0.82rem var(--mono); color: var(--muted); }
.cmp-d2m-sizes i { display: inline-block; width: 16px; height: 12px; margin-right: 6px; vertical-align: -1px; border-radius: 3px; }
.cmp-d2m-k1 { outline: 2px dashed var(--warm); outline-offset: -2px; }
.cmp-d2m-k2 { background: var(--accent); }
.cmp-d2m-strip { display: flex; flex-wrap: wrap; align-items: center; min-height: 70px; padding: 14px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--line); min-width: 0; }
.cmp-d2m-outer { display: inline-flex; outline: 1px dashed var(--muted); outline-offset: -1px; transition: padding 0.3s; }
.cmp-d2m-outer.cmp-d2m-gap { padding-right: 8px; }
.cmp-d2m-pill { padding: 4px 12px; border-radius: 999px; background: var(--accent-soft); color: var(--ink); font: 700 0.9rem var(--body); transition: padding 0.3s; }
.cmp-d2m-pill.cmp-d2m-fat { padding: 4px 20px; }
/* depth 2: layouts */
.cmp-d2l-track { position: relative; display: flex; height: 74px; border-radius: 10px; border: 2px dashed var(--accent); background: var(--surface); overflow: hidden; min-width: 0; }
.cmp-d2l-seg { position: relative; z-index: 1; flex: none; width: 0; display: grid; place-items: center; align-content: center; overflow: hidden; border-radius: 8px; white-space: nowrap; font: 700 0.9rem var(--mono); color: var(--ink); opacity: 0.35; transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s; }
.cmp-d2l-seg.cmp-d2l-on { opacity: 1; }
.cmp-d2l-seg small { font: 500 0.66rem var(--mono); color: var(--muted); }
.cmp-d2l-seg.cmp-d2l-tiny small { display: none; }
.cmp-d2l-a { background: var(--accent-soft); box-shadow: inset 0 0 0 2px var(--ink); }
.cmp-d2l-b { background: var(--warm-soft); box-shadow: inset 0 0 0 2px var(--warm); }
.cmp-d2l-c { background: var(--ok-soft); box-shadow: inset 0 0 0 2px var(--ok); }
.cmp-d2l-left { position: absolute; top: 0; bottom: 0; left: 0; width: 0; background: repeating-linear-gradient(45deg, var(--sunk) 0 6px, transparent 6px 12px); pointer-events: none; transition: left 0.4s, width 0.4s; }
.cmp-d2l-steps { margin: 0; padding-left: 1.4em; display: grid; gap: 2px; min-height: 4.8em; font: 500 0.8rem/1.5 var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.cmp-d2l-screen { display: flex; flex-direction: column; width: min(320px, 100%); height: 220px; margin: 0 auto; border-radius: 18px; border: 6px solid var(--code-bg); background: var(--surface); overflow: hidden; }
.cmp-d2l-irow { display: flex; align-items: flex-start; gap: 8px; padding: 8px; flex: 1 0 auto; background: var(--bg); border-bottom: 1px dashed var(--line); transition: flex-grow 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.cmp-d2l-irow.cmp-d2l-fit { flex-grow: 0; }
.cmp-d2l-txt { flex: 1 1 0; min-width: 0; font: 700 0.85rem var(--body); overflow-wrap: anywhere; }
.cmp-d2l-txt small { display: block; font-weight: 400; color: var(--muted); }
.cmp-d2l-div { flex: none; width: 3px; align-self: stretch; border-radius: 2px; background: var(--accent); }
.cmp-d2l-below { padding: 8px; font: 600 0.8rem var(--body); color: var(--muted); }
/* depth 2: scaffold */
.cmp-d2s-phone { position: relative; width: 220px; height: 320px; border-radius: 26px; border: 8px solid var(--code-bg); background: var(--bg); overflow: hidden; justify-self: center; }
.cmp-d2s-scroll { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
.cmp-d2s-scroll::-webkit-scrollbar { display: none; }
.cmp-d2s-inner { display: grid; gap: 6px; padding: 0 10px 10px; }
.cmp-d2s-row { padding: 10px; border-radius: 10px; background: var(--surface); font: 700 0.82rem var(--body); }
.cmp-d2s-bar { position: absolute; top: 0; left: 0; right: 0; z-index: 2; display: flex; align-items: flex-end; padding: 0 14px 14px; background: var(--accent-soft); overflow: hidden; transition: transform 0.12s linear; }
.cmp-d2s-title { font: 700 1rem var(--display); transition: font-size 0.2s; }
.cmp-d2s-bar.cmp-d2s-large .cmp-d2s-title { font-size: 1.4rem; }
.cmp-d2s-box { position: relative; min-height: 250px; padding: 10px 10px 74px; border-radius: 14px; border: 1px dashed var(--line); background: var(--bg); overflow: hidden; min-width: 0; }
.cmp-d2s-list { display: grid; gap: 6px; }
.cmp-d2s-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 6px 6px 12px; border-radius: 10px; background: var(--surface); font: 700 0.88rem var(--body); min-width: 0; }
.cmp-d2s-item .cmd { padding: 5px 10px; font-size: 0.78rem; }
.cmp-d2s-item.cmp-d2s-gone { display: none; }
.cmp-d2s-snack { position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; align-items: center; gap: 6px; padding: 10px 8px 12px 14px; border-radius: 8px; background: var(--code-bg); color: var(--code-ink); font: 500 0.85rem var(--body); overflow: hidden; opacity: 0; transform: translateY(20px); pointer-events: none; transition: opacity 0.3s, transform 0.3s; }
.cmp-d2s-snack.cmp-on { opacity: 1; transform: none; pointer-events: auto; }
.cmp-d2s-msg { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.cmp-d2s-undo { border: 0; background: transparent; color: var(--t-k); font: 700 0.85rem var(--body); cursor: pointer; padding: 4px 6px; }
.cmp-d2s-x { border: 0; background: transparent; color: var(--code-ink); font: 700 1rem var(--body); cursor: pointer; padding: 2px 6px; }
.cmp-d2s-fill { position: absolute; left: 0; bottom: 0; height: 3px; width: 0; background: var(--t-k); }
/* depth 2: theming */
.cmp-d2t-card { display: grid; gap: 8px; justify-items: start; width: min(300px, 100%); margin: 0 auto; padding: 16px; border-radius: 16px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); }
.cmp-d2t-card b { font: 700 1.1rem var(--display); }
.cmp-d2t-pro { padding: 6px 16px; border-radius: 999px; font: 700 0.95rem var(--body); transition: background-color 0.4s, color 0.4s; }
.cmp-d2t-pro.cmp-d2t-warn { outline: 2px dashed var(--err); outline-offset: 3px; }
.cmp-d2t-sub { font-size: 0.8rem; color: var(--muted); }
.cmp-d2t-screen { display: grid; gap: 8px; justify-items: start; width: min(320px, 100%); margin: 0 auto; padding: 16px; border-radius: 16px; border: 1px solid var(--line); background: var(--surface); }
.cmp-d2t-screen > b { font: 700 1.1rem var(--display); }
.cmp-d2t-btn { padding: 7px 16px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font: 700 0.82rem var(--body); transition: background-color 0.4s, color 0.4s; }
.cmp-d2t-zone { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; width: 100%; padding: 10px; border-radius: 12px; border: 1px dashed var(--line); transition: border-color 0.4s; }
.cmp-d2t-zlabel { width: 100%; font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cmp-d2t-zone.cmp-d2t-on { border-color: var(--err); }
.cmp-d2t-zone.cmp-d2t-on .cmp-d2t-btn { background: var(--err); color: var(--surface); }
/* depth 2: rememberSaveable */
.cmp-d2v-proc { display: grid; gap: 8px; justify-items: start; align-content: start; width: min(260px, 100%); min-height: 96px; padding: 14px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); transition: opacity 0.4s, border-color 0.3s, background-color 0.3s; }
.cmp-d2v-proc.cmp-d2v-dead { opacity: 0.35; border-style: dashed; }
.cmp-d2v-proc.cmp-d2v-crash { border-color: var(--err); background: var(--err-soft); }
.cmp-d2v-obj { max-width: 100%; padding: 6px 10px; border-radius: 8px; background: var(--code-bg); color: var(--code-ink); font: 600 0.8rem var(--mono); overflow-wrap: anywhere; }
.cmp-d2v-entries { display: grid; gap: 6px; justify-items: start; }
.cmp-d2v-code { max-width: 100%; padding: 4px 10px; border-radius: 6px; background: var(--code-bg); color: var(--code-ink); font: 600 0.8rem var(--mono); overflow-wrap: anywhere; }
.cmp-d2v-err { font: 700 0.78rem var(--mono); color: var(--err); overflow-wrap: anywhere; }
.cmp-d2v-grid { display: grid; gap: 6px; padding: 12px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); }
.cmp-d2v-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 6px 10px; border-radius: 8px; background: var(--surface); }
.cmp-d2v-name { font: 600 0.82rem var(--mono); overflow-wrap: anywhere; }
.cmp-d2v-val { min-width: 2.4em; text-align: center; padding: 3px 8px; border-radius: 999px; background: var(--sunk); font: 700 0.85rem var(--mono); font-variant-numeric: tabular-nums; transition: background-color 0.3s, color 0.3s; }
.cmp-d2v-val.cmp-d2v-kept { background: var(--ok-soft); color: var(--ok); }
.cmp-d2v-val.cmp-d2v-lost { background: var(--err-soft); color: var(--err); }
.cmp-d2v-screen { display: grid; gap: 6px; justify-items: center; min-width: min(200px, 100%); padding: 16px 20px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); transition: opacity 0.3s; }
.cmp-d2v-screen .cmp-label { overflow-wrap: anywhere; text-align: center; }
.cmp-d2v-num { padding: 0 8px; border-radius: 8px; font: 700 2rem var(--display); font-variant-numeric: tabular-nums; }
.cmp-d2v-off { opacity: 0.5; }
/* depth 2: hoisting */
.cmp-d2h-card { display: grid; align-items: center; min-height: 3.2em; padding: 14px 16px; border-radius: 14px; border: 2px solid var(--accent); background: var(--surface); font: 700 0.95rem var(--body); overflow-wrap: anywhere; }
.cmp-d2h-card.cmp-d2h-done { border-color: var(--ok); color: var(--muted); }
.cmp-d2h-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.cmp-d2h-col { display: grid; gap: 6px; align-content: start; min-height: 90px; padding: 10px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); min-width: 0; }
.cmp-d2h-col .cmp-label { text-transform: none; letter-spacing: 0; overflow-wrap: anywhere; }
.cmp-d2h-drop { display: grid; gap: 6px; }
.cmp-d2h-chip { padding: 6px 8px; border-radius: 8px; background: var(--accent-soft); font: 600 0.78rem var(--body); overflow-wrap: anywhere; }
.cmp-d2h-list { display: grid; gap: 6px; }
.cmp-d2h-try { display: flex; gap: 10px; align-items: center; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font: 600 0.88rem var(--body); min-width: 0; }
.cmp-d2h-mark { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--sunk); color: var(--muted); font: 700 0.85rem var(--mono); }
.cmp-d2h-mark.cmp-d2h-ok { background: var(--ok-soft); color: var(--ok); }
.cmp-d2h-mark.cmp-d2h-no { background: var(--err-soft); color: var(--err); }
.cmp-d2h-line { min-width: 0; overflow-wrap: anywhere; }
/* depth 2: text input */
.cmp-d2i-field { min-width: 0; }
.cmp-d2i-pad { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; width: min(240px, 100%); }
.cmp-d2i-pad .cmp-kb-key { min-width: 0; }
/* depth 2: lists */
.cmp-d2z-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 14px; align-items: start; min-width: 0; }
.cmp-d2z-frame { position: relative; min-width: 0; border-radius: 18px; border: 6px solid var(--code-bg); background: var(--surface); overflow: hidden; }
.cmp-d2z-view { height: 250px; overflow: auto; overscroll-behavior: contain; }
.cmp-d2z-inner { display: grid; gap: 6px; padding: 8px; }
.cmp-d2z-row { display: flex; gap: 10px; align-items: center; height: 40px; padding: 0 10px; border-radius: 10px; border: 2px solid transparent; background: var(--sunk); font: 700 0.88rem var(--body); }
.cmp-d2z-row i { flex: none; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: var(--accent-soft); color: var(--accent); font: 700 0.72rem var(--mono); font-style: normal; }
.cmp-d2z-fab { position: absolute; right: 12px; bottom: 12px; width: 46px; height: 46px; border-radius: 14px; border: 0; background: var(--accent); color: var(--accent-ink); font: 700 1.3rem/1 var(--body); cursor: pointer; transform: scale(0); transition: transform 0.25s; }
.cmp-d2z-fab.cmp-on { transform: scale(1); }
.cmp-d2z-meters { display: grid; gap: 6px; }
.cmp-d2z-meters > div { display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); min-width: 0; }
.cmp-d2z-foot { display: flex; gap: 8px; align-items: center; justify-content: center; min-height: 40px; font: 600 0.8rem var(--mono); color: var(--muted); }
.cmp-d2z-spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--line); border-top-color: var(--accent); animation: cmp-d2z-spin 0.8s linear infinite; }
@keyframes cmp-d2z-spin { to { transform: rotate(360deg); } }
/* depth 2: gestures */
.cmp-d2g-frame { position: relative; width: 230px; height: 280px; border-radius: 24px; border: 8px solid var(--code-bg); background: var(--bg); overflow: hidden; justify-self: center; transition: box-shadow 0.3s; }
.cmp-d2g-frame.cmp-d2g-win-list { box-shadow: 0 0 0 3px var(--warm); }
.cmp-d2g-col { display: grid; gap: 6px; padding: 10px; }
.cmp-d2g-row { display: flex; align-items: center; height: 40px; padding: 0 12px; border-radius: 10px; border: 2px solid transparent; background: var(--surface); font: 700 0.82rem var(--body); }
.cmp-d2g-row.cmp-d2g-me { border-color: var(--accent); background: var(--accent-soft); }
.cmp-d2g-frame.cmp-d2g-win-row .cmp-d2g-me { border-color: var(--warm); background: var(--warm-soft); }
.cmp-d2g-finger { position: absolute; z-index: 3; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; background: var(--warm); opacity: 0; pointer-events: none; transition: opacity 0.2s; }
.cmp-d2g-finger.cmp-on { opacity: 0.6; }
.cmp-d2g-track { position: relative; height: 76px; border-radius: 14px; background: var(--sunk); overflow: hidden; min-width: 0; }
.cmp-d2g-under { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; padding-right: 18px; background: var(--ok-soft); color: var(--ok); font: 700 0.8rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; }
.cmp-d2g-card { position: absolute; inset: 0; display: grid; align-content: center; gap: 2px; padding: 0 16px; border-radius: 14px; border: 2px solid var(--ink); background: var(--surface); cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
.cmp-d2g-card b { font: 700 1rem var(--display); }
.cmp-d2g-card small { font-size: 0.78rem; color: var(--muted); }
.cmp-d2g-card.cmp-d2g-held { cursor: grabbing; border-color: var(--accent); }
/* images (Coil) */
.cmp-im-wrap { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; min-width: 0; }
.cmp-im-left { flex: 1 1 230px; display: grid; gap: 8px; min-width: 0; }
.cmp-im-row { display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.cmp-im-frame { position: relative; flex: none; width: 96px; height: 96px; border-radius: 12px; overflow: hidden; background: var(--bg); border: 1px dashed var(--line); }
.cmp-im-frame > * { position: absolute; inset: 0; opacity: 0; }
.cmp-im-frame > .cmp-im-show { opacity: 1; }
.cmp-im-ph { display: grid; place-items: center; background: var(--sunk); color: var(--muted); font: 600 0.66rem var(--mono); animation: cmp-im-shimmer 1.4s ease-in-out infinite; }
@keyframes cmp-im-shimmer { 50% { background: var(--line); } }
.cmp-im-pic { background: linear-gradient(180deg, var(--warm-soft), var(--accent-soft)); }
.cmp-im-sun { position: absolute; top: 16px; left: 14px; width: 26px; height: 26px; border-radius: 50%; background: var(--warm); }
.cmp-im-tower { position: absolute; bottom: 0; left: 50%; width: 24px; height: 66px; margin-left: -4px; background: var(--ink); opacity: 0.85; clip-path: polygon(50% 0, 78% 24%, 78% 100%, 22% 100%, 22% 24%); }
.cmp-im-err { display: grid; place-content: center; justify-items: center; gap: 2px; background: var(--err-soft); color: var(--err); font: 600 0.7rem var(--mono); }
.cmp-im-err b { font-size: 1.3rem; }
.cmp-im-text { display: grid; gap: 4px; min-width: 0; }
.cmp-im-text b { font: 700 0.95rem var(--display); overflow-wrap: anywhere; }
.cmp-im-text small { color: var(--muted); font-size: 0.8rem; }
.cmp-im-state { text-transform: none; letter-spacing: 0; overflow-wrap: anywhere; }
.cmp-im-pipe { flex: 1 1 200px; display: grid; gap: 4px; min-width: 0; }
.cmp-im-pipe .arrow { justify-self: center; }
.cmp-im-stage { display: flex; flex-wrap: wrap; gap: 2px 10px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.cmp-im-stage b { font: 600 0.82rem var(--mono); }
.cmp-im-stage small { flex: 1 1 90px; color: var(--muted); font-size: 0.76rem; }
.cmp-im-pill { font: 600 0.72rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.cmp-im-pill.cmp-im-has { background: var(--ok-soft); color: var(--ok); }
.cmp-im-stage.cmp-im-on { border-color: var(--accent); background: var(--accent-soft); }
.cmp-im-stage.cmp-im-hit { border-color: var(--ok); background: var(--ok-soft); }
.cmp-im-stage.cmp-im-miss { opacity: 0.55; }
.meter.cmp-im-meter span { transition: width 0.4s; }
.meter.cmp-im-meter.cmp-im-hot span { background: var(--err); }

/* dialogs, sheets, menus */
.cmp-ov-wrap { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; min-width: 0; }
.cmp-ov-side { flex: 1 1 220px; display: grid; gap: 10px; min-width: 0; }
.cmp-ov-phone { position: relative; flex: none; width: min(100%, 260px); height: 340px; border-radius: 26px; border: 8px solid var(--code-bg); background: var(--bg); overflow: hidden; }
.cmp-ov-phone.cmp-ov-mini { height: 220px; }
.cmp-ov-bar { display: flex; align-items: center; justify-content: space-between; height: 46px; padding: 0 6px 0 14px; background: var(--surface); border-bottom: 1px solid var(--line); font: 700 0.95rem var(--display); }
.cmp-ov-more { width: 36px; height: 36px; border: 0; border-radius: 50%; background: none; color: var(--ink); font: 700 1.2rem var(--body); cursor: pointer; }
.cmp-ov-more:hover, .cmp-ov-mi:hover, .cmp-ov-sheet button.cmp-ov-sitem:hover { background: var(--sunk); }
.cmp-ov-list { display: grid; gap: 8px; padding: 10px; }
.cmp-ov-note { padding: 12px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); font-weight: 600; font-size: 0.86rem; overflow-wrap: anywhere; }
.cmp-ov-mini .cmp-ov-note { margin: 10px; }
.cmp-ov-catch { position: absolute; inset: 0; z-index: 2; display: none; }
.cmp-ov-catch.cmp-on { display: block; }
.cmp-ov-menu { position: absolute; top: 40px; right: 8px; z-index: 3; display: grid; min-width: 130px; padding: 6px 0; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); box-shadow: 0 6px 20px rgb(0 0 0 / 0.25); transform-origin: top right; transform: scale(0.8); opacity: 0; pointer-events: none; transition: transform 0.15s, opacity 0.15s; }
.cmp-ov-menu.cmp-on { transform: none; opacity: 1; pointer-events: auto; }
.cmp-ov-mi, .cmp-ov-sitem { border: 0; background: none; text-align: left; padding: 10px 16px; font: 500 0.88rem var(--body); color: var(--ink); cursor: pointer; }
div.cmp-ov-sitem { cursor: default; }
.cmp-ov-scrim { position: absolute; inset: 0; z-index: 4; background: rgb(0 0 0 / 0.45); opacity: 0; pointer-events: none; transition: opacity 0.3s; }
.cmp-ov-scrim.cmp-on { opacity: 1; pointer-events: auto; }
.cmp-ov-dialog { position: absolute; z-index: 5; left: 14px; right: 14px; top: 50%; display: grid; gap: 8px; padding: 18px 16px 10px; border-radius: 22px; background: var(--surface); transform: translateY(-50%) scale(0.9); opacity: 0; pointer-events: none; transition: transform 0.2s, opacity 0.2s; }
.cmp-ov-dialog.cmp-on { transform: translateY(-50%); opacity: 1; pointer-events: auto; }
.cmp-ov-dialog b { font: 700 1rem var(--display); }
.cmp-ov-dialog p { margin: 0; font-size: 0.82rem; color: var(--muted); overflow-wrap: anywhere; }
.cmp-ov-btns { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px; }
.cmp-ov-btns button { border: 0; border-radius: 999px; background: none; color: var(--accent); font: 700 0.86rem var(--body); padding: 8px 10px; cursor: pointer; }
.cmp-ov-btns button:hover { background: var(--accent-soft); }
.cmp-ov-sheet { position: absolute; z-index: 5; left: 0; right: 0; bottom: 0; display: grid; padding: 8px 0 14px; border-radius: 18px 18px 0 0; background: var(--surface); transform: translateY(105%); transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1); }
.cmp-ov-sheet.cmp-on { transform: none; }
.cmp-ov-handle { justify-self: center; width: 32px; height: 4px; margin-bottom: 6px; border-radius: 2px; background: var(--line); }
.cmp-ov-snack { position: absolute; z-index: 6; left: 10px; right: 10px; bottom: 10px; padding: 10px 12px; border-radius: 6px; background: var(--ink); color: var(--bg); font-size: 0.8rem; overflow-wrap: anywhere; transform: translateY(160%); transition: transform 0.25s; }
.cmp-ov-snack.cmp-on { transform: none; }

@media (max-width: 560px) {
  .cmp-d2h-cols { grid-template-columns: minmax(0, 1fr); }
}
`;

  Lab.addTrack({
    id: 'compose',
    title: 'Jetpack Compose',
    description: 'Build Android UI with Kotlin functions that redraw themselves when state changes.',
    group: 'Building apps', requires: ['kotlin'],
    css,
    lessons: [
      {
        id: 'what-compose',
        title: 'What Compose is',
        tagline: 'Describe the screen in Kotlin functions, and Compose draws it.',
        goals: ['Explain what “declarative” means: describe the result, not the steps', 'Write a function marked <code>@Composable</code> that shows text', 'See a composable in the Preview without starting the emulator'],
        level: 'beginner', introduces: ['Composable', 'Preview', 'showBackground'],
        body: `
<p>In the Android lessons, <code>setContent { Text("Hello") }</code> put one line of text on the screen. A real screen has many parts, such as titles, numbers, buttons and pictures, and they change while the app runs. <em>Jetpack Compose</em> (Compose for short) is Android’s toolkit for building screens in Kotlin. <code>Text</code> is already part of it.</p>
<p>Compose is <em>declarative</em>: you describe what the screen should show, and Compose works out how to draw it. Take a water tracker that shows “3 of 8 glasses”. You don’t write steps like “find the label and change its 3 into a 4”. You write a function that says “show this many glasses”. Call it with 4, and Compose draws a screen that says 4.</p>
<p>Such a function is a <em>composable</em>. You mark it with <code>@Composable</code> on the line above <code>fun</code>. A word that starts with <code>@</code> is an <em>annotation</em>: a label that gives a function extra meaning, here “this function describes UI”. A composable returns nothing, its name starts with a capital letter (like <code>Text</code>), and it can only be called from another composable or from inside <code>setContent { }</code>.</p>
<p>You don’t have to start the emulator to see one. Write a second composable with no parameters that calls the first one with sample values, and put <code>@Preview</code> above it. Click <b>Split</b> at the top right of the editor, and Android Studio draws it next to your code (it may ask you to build the project first). <code>@Preview(showBackground = true)</code> gives the preview a white background, so the text is easy to read.</p>`,
        visual(el) {
          const scr = n => `<div class="ui-m-body"><div style="font-size:0.95rem">${n} of 8 glasses</div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: '<code>WaterCount(glasses = 3)</code> shows “3 of 8 glasses”. Now the app calls <code>WaterCount(glasses = 4)</code>. What else must you write to make the screen say 4?',
              options: ['Nothing: the function already describes the screen for any number', 'A line that finds the old text and replaces the 3', 'A second function for the number 4'],
              a: 0,
              why: 'That is what declarative means. The function describes the result for whatever number it gets, and Compose draws that.',
            },
            frames: [
              { screen: '<div class="ui-m-body"></div>', log: '@Composable\nfun WaterCount(glasses: Int) {\n    Text("$glasses of 8 glasses")\n}'.split('\n').map(l => l.replace(/ /g, '&nbsp;')), say: 'One composable, <code>WaterCount</code>. It describes a screen for any number of glasses. Nothing is on the screen yet, because nobody has called it.' },
              { screen: scr(3), log: 'setContent { WaterCount(glasses = 3) }', say: '<code>setContent</code> calls it with 3. Its <code>Text</code> puts one line on the screen.' },
              { screen: scr(4), log: 'WaterCount(glasses = 4)', say: 'Called with 4, the same description gives a new screen. You never told Compose to change the old text.' },
              { screen: scr(8), log: 'WaterCount(glasses = 8)', say: 'With 8, the screen says 8. One function, any number.' },
              { screen: `<div class="ui-m-bar" style="font-size:0.75rem">Preview</div>${scr(5)}`, log: ['@Preview(showBackground = true)', '@Composable', 'fun WaterCountPreview() {', '&nbsp;&nbsp;&nbsp;&nbsp;WaterCount(glasses = 5)', '}'], say: 'A preview function has no parameters. It calls the composable with a sample value, and Android Studio draws the result in the editor, without the emulator.' },
            ],
          });
        },
        code: `@Composable
fun WaterCount(glasses: Int) {
    Text("$glasses of 8 glasses")
}

@Preview(showBackground = true)
@Composable
fun WaterCountPreview() {
    WaterCount(glasses = 3)     // the preview shows: 3 of 8 glasses
}`,
        remember: 'A composable is a @Composable function that describes what to show for its inputs. @Preview draws one in Android Studio.',
        mistakes: [
          { title: 'Calling a composable from a normal function', bad: 'fun showCount() {\n    Text("3 of 8 glasses")   // doesn’t compile\n}', good: '@Composable\nfun ShowCount() {\n    Text("3 of 8 glasses")\n}', why: 'Only a composable, or the code inside <code>setContent { }</code>, can call <code>Text</code>. Add <code>@Composable</code>, and give it a capital first letter like every composable.' },
        ],
        terms: [
          { term: 'annotation', def: 'A word starting with <code>@</code> above a function, like <code>@Composable</code>, that gives it extra meaning.' },
          { term: 'declarative', def: 'Describing what the screen should show, instead of giving step-by-step changes to make.' },
          { term: '@Composable', def: 'An annotation that marks a function as a composable: a function that describes part of the UI.' },
          { term: '@Preview', def: 'An annotation on a composable with no parameters. Android Studio draws it in the editor.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a composable that shows a greeting, and a preview of it.', code: '@[[Composable]]\nfun Greeting(name: String) {\n    Text("Hello, $name")\n}\n\n@[[Preview]](showBackground = true)\n@Composable\nfun GreetingPreview() {\n    Greeting("Ada")\n}', why: '<code>@Composable</code> marks a function that describes UI. <code>@Preview</code> marks the one Android Studio should draw.' },
          { type: 'bug', prompt: 'Android Studio shows no preview for this, because a preview function can’t take parameters. Tap the line to change.', code: '@Preview(showBackground = true)\n@Composable\nfun CityPreview(city: String) {\n    Text("Weather in $city")\n}', bug: 2, fix: 'fun CityPreview() {', why: 'Android Studio has no value to pass in. Use a preview function without parameters, with a sample value inside: <code>Text("Weather in Oslo")</code> would work.' },
        ],
        quiz: [
          { q: 'What does “declarative” mean in Compose?', options: ['You describe what the screen should show, and Compose draws it', 'You give step-by-step orders to change each part of the screen', 'The screen is drawn once and never changes'], a: 0, why: 'You write what the result looks like for the current data. Compose does the drawing.' },
          { q: 'Which function can call <code>Text("Hi")</code>?', options: ['A function marked <code>@Composable</code>', 'Any Kotlin function', 'Only <code>fun main()</code>'], a: 0, why: 'Composables can only be called from other composables, or inside <code>setContent { }</code>.' },
          { q: 'What does <code>@Preview</code> do?', options: ['Android Studio draws that composable in the editor', 'It runs the app on the emulator', 'It hides the composable from the real app'], a: 0, why: 'It lets you see a composable while you write it. The app itself doesn’t change.' },
        ],
        docs: [['Thinking in Compose', 'https://developer.android.com/develop/ui/compose/mental-model'], ['Preview your UI with composable previews', 'https://developer.android.com/develop/ui/compose/tooling/previews']],
      },

      {
        id: 'text-and-modifiers',
        title: 'Text and modifiers',
        tagline: 'Make text bigger and bolder, and give it room.',
        goals: ['Change how text looks with <code>fontSize</code> and <code>fontWeight</code>', 'Add space and set a size with a <code>Modifier</code>', 'Tell <code>dp</code> and <code>sp</code> apart'],
        level: 'beginner', introduces: ['fontSize', 'sp', 'fontWeight', 'FontWeight', 'Bold', 'Modifier', 'padding', 'dp', 'fillMaxWidth', 'width', 'height'],
        body: `
<p>The water tracker says “3 of 8 glasses” in small letters, squeezed into the corner. That number is the most important thing on the screen. It should be big, bold, and have some room around it.</p>
<p><code>Text</code> takes more arguments than the text itself, and named arguments keep them readable: <code>Text("3 of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)</code>. <code>sp</code> is the unit for text size; <code>28.sp</code> reads “28 sp”. Text measured in sp grows when someone picks larger text in the phone’s settings, so everyone can read it.</p>
<p>Space and size come from a <code>Modifier</code>: a chain of instructions about size, space and more, that you hand to a composable through its <code>modifier</code> argument. (Later, modifiers also make things react to taps and drags.) Start with the word <code>Modifier</code> and add instructions with dots. <code>Modifier.padding(16.dp)</code> adds 16 dp of empty space on every side. <code>.fillMaxWidth()</code> makes the composable as wide as the space it is in. <code>.size(width = 160.dp, height = 80.dp)</code> gives it an exact size. You can put each instruction on its own line, starting with the dot.</p>
<p><code>dp</code> is the unit for sizes and spaces. 16 dp look about the same size on every phone, whether its screen has few pixels or many. A simple rule: <code>sp</code> for text size, <code>dp</code> for everything else.</p>`,
        visual(el) {
          const txt = (style, box) => `<div class="ui-m-body"><div style="justify-self:${box.includes('width:100%') ? 'stretch' : 'start'};outline:1.5px dashed var(--accent);${box}"><span style="${style}">3 of 8 glasses</span></div></div>`;
          const big = 'font-size:1.05rem;', bold = 'font-size:1.05rem;font-weight:800;';
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'You add <code>modifier = Modifier.padding(16.dp)</code> to the Text. What happens?',
              options: ['The letters get bigger', 'Empty space appears around the letters', 'The letters turn bold'],
              a: 1,
              why: 'Padding is empty space on every side. The letters keep their size; the Text takes up more room.',
            },
            frames: [
              { screen: txt('', ''), log: 'Text("3 of 8 glasses")', say: 'Plain text. The dashed line marks the edges of the Text. The demo draws it so you can see them; your app won’t.' },
              { screen: txt(big, ''), log: 'fontSize = 28.sp', say: '<code>fontSize</code> makes the letters bigger. The Text grows to fit them.' },
              { screen: txt(bold, ''), log: 'fontWeight = FontWeight.Bold', say: '<code>FontWeight.Bold</code> makes the letters thicker.' },
              { screen: txt(bold, 'padding:10px;'), log: 'modifier = Modifier.padding(16.dp)', say: 'Padding adds 16 dp of empty space inside the edges, on all four sides. The letters move away from the corner.' },
              { screen: txt(bold, 'padding:10px;width:100%;box-sizing:border-box;'), log: '&nbsp;&nbsp;&nbsp;&nbsp;.fillMaxWidth()', say: '<code>fillMaxWidth()</code>: the Text becomes as wide as the screen. The letters stay at the start; only the area grows.' },
              { screen: txt(bold, 'padding:10px;width:124px;height:75px;box-sizing:border-box;'), log: 'Modifier.padding(16.dp).size(width = 200.dp, height = 120.dp)', say: 'Swap <code>fillMaxWidth()</code> for <code>size(...)</code> and the Text gets exactly that size. The words no longer fit on one line, so they wrap onto two.' },
            ],
          });
        },
        code: `@Composable
fun WaterCount(glasses: Int) {
    Text(
        text = "$glasses of 8 glasses",
        fontSize = 28.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .padding(16.dp)          // 16 dp of space on every side
            .fillMaxWidth()          // as wide as the screen
    )
}

@Composable
fun Title() {
    Text(
        text = "Water today",
        modifier = Modifier.size(width = 160.dp, height = 40.dp)   // exactly 160 by 40 dp
    )
}`,
        remember: 'Text styles with fontSize (in sp) and fontWeight. A Modifier sets space and size (in dp), and more.',
        mistakes: [
          { title: 'Text size in dp', bad: 'Text("Water today", fontSize = 24.dp)   // type mismatch', good: 'Text("Water today", fontSize = 24.sp)', why: '<code>fontSize</code> needs a text size, so Kotlin refuses a <code>dp</code> value with a type mismatch error. Text size is always <code>sp</code>.' },
        ],
        terms: [
          { term: 'Modifier', def: 'A chain of instructions about size, space and more, passed to a composable as <code>modifier = Modifier...</code>.' },
          { term: 'padding', def: 'Empty space inside a composable’s edges: <code>Modifier.padding(16.dp)</code>.' },
          { term: 'dp', def: 'The unit for sizes and spaces. It looks about the same size on every screen.' },
          { term: 'sp', def: 'The unit for text size. It also grows with the text size someone picks in the phone’s settings.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the text 24 dp of empty space on every side.', code: 'Text(\n    text = "Water today",\n    modifier = [[Modifier]].[[padding]](24.[[dp]])\n)', why: 'A modifier starts with <code>Modifier</code>, then adds instructions with a dot. Space is measured in <code>dp</code>.' },
          { type: 'bug', prompt: 'This doesn’t compile. Tap the line with the wrong unit.', code: '@Composable\nfun Title() {\n    Text(\n        text = "Water today",\n        fontSize = 32.dp,\n        fontWeight = FontWeight.Bold\n    )\n}', bug: 4, fix: '        fontSize = 32.sp,', why: 'Text size is measured in <code>sp</code>. <code>dp</code> is for sizes and spaces.' },
        ],
        quiz: [
          { q: 'Which unit do you use for <code>fontSize</code>?', options: ['<code>sp</code>', '<code>dp</code>', 'Pixels'], a: 0, why: '<code>sp</code> is for text, and it grows with the phone’s text size setting.' },
          { q: 'What does <code>Modifier.fillMaxWidth()</code> do?', options: ['Makes the composable as wide as the space it is in', 'Makes the letters wider', 'Adds space on the left and right'], a: 0, why: 'The area of the composable grows. The letters keep their size.' },
          { q: 'Where does <code>Modifier.padding(16.dp)</code> add space?', options: ['On all four sides', 'Only on the left', 'Only above'], a: 0, why: 'With one value, padding adds the same space on every side.' },
        ],
        docs: [['Compose modifiers', 'https://developer.android.com/develop/ui/compose/modifiers'], ['Style text', 'https://developer.android.com/develop/ui/compose/text/style-text']],
      },

      {
        id: 'layouts',
        title: 'Arranging things',
        tagline: 'Put composables in a column, in a row, or on top of each other.',
        goals: ['Stack composables top to bottom with <code>Column</code> and side by side with <code>Row</code>', 'Center things and put even space between them', 'Layer composables on top of each other with <code>Box</code>'],
        level: 'beginner', introduces: ['Column', 'Row', 'Box', 'horizontalAlignment', 'verticalAlignment', 'Alignment', 'CenterHorizontally', 'CenterVertically', 'Center', 'verticalArrangement', 'horizontalArrangement', 'Arrangement', 'spacedBy', 'contentAlignment', 'fillMaxSize', 'safeDrawingPadding'],
        body: `
<p>Call two <code>Text</code>s one after the other, and Compose draws both in the same spot, on top of each other: a jumble. The water screen needs a title above the number, and more lines below. You have to say how things are arranged.</p>
<p>Three composables do the arranging. <code>Column</code> puts the composables you call inside its braces (its <em>children</em>) from top to bottom. <code>Row</code> puts them side by side. <code>Box</code> puts them on top of each other, which is useful for a number in the middle of an area, or a label over a picture. The braces are a trailing lambda, as in the Kotlin lessons, with one child on each line inside: <code>Column { ... }</code>.</p>
<p>Arguments decide where children go. In a <code>Column</code>, <code>horizontalAlignment = Alignment.CenterHorizontally</code> centers each child, and <code>verticalArrangement = Arrangement.spacedBy(8.dp)</code> puts 8 dp between each pair of children. A <code>Row</code> has the same pair turned around: <code>horizontalArrangement</code> spaces the children, and <code>verticalAlignment = Alignment.CenterVertically</code> lines them up through the middle. A <code>Box</code> takes <code>contentAlignment = Alignment.Center</code>.</p>
<p>A screen usually starts with a <code>Column</code> that fills it: <code>Modifier.fillMaxSize()</code>. On Android 15 and newer, apps draw edge to edge, right up behind the clock and battery icons at the top. Add <code>.safeDrawingPadding()</code> to the chain to keep your content clear of them.</p>`,
        visual(el) {
          const t1 = '<div style="font-size:0.95rem">Water today</div>', t2 = '<div style="font-size:1.05rem;font-weight:800">3 of 8 glasses</div>';
          const row = '<div style="display:flex;gap:10px;font-size:0.76rem"><span>Yesterday: 6</span><span>Best: 9</span></div>';
          const col = (kids, center, gap) => `<div class="ui-m-body" style="gap:${gap}px;${center ? 'justify-items:center;' : 'justify-items:start;'}">${kids}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Your code',
            predict: {
              q: 'You call <code>Text("Water today")</code> and then <code>Text("3 of 8 glasses")</code>, with nothing around them. Where does the second one appear?',
              options: ['Below the first', 'To the right of the first', 'In the same spot, on top of the first'],
              a: 2,
              why: 'Without a layout, Compose puts every child in the top corner. Column, Row and Box decide where they go.',
            },
            frames: [
              { screen: `<div class="ui-m-body">${t1.replace('style="', 'style="grid-area:1/1;')}${t2.replace('style="', 'style="grid-area:1/1;')}</div>`, log: ['Text("Water today")', 'Text("3 of 8 glasses")'], say: 'Two Texts with nothing around them land in the same corner, on top of each other.' },
              { screen: col(t1 + t2, false, 0), log: ['Column {', '&nbsp;&nbsp;&nbsp;&nbsp;Text("Water today")', '&nbsp;&nbsp;&nbsp;&nbsp;Text("3 of 8 glasses")', '}'], say: '<code>Column</code> stacks its children from top to bottom, in the order you call them.' },
              { screen: col(t1 + t2, true, 0), log: 'horizontalAlignment = Alignment.CenterHorizontally', say: 'Each child is now centered across the screen.' },
              { screen: col(t1 + t2, true, 12), log: 'verticalArrangement = Arrangement.spacedBy(8.dp)', say: '8 dp of space between each pair of children. None is added above the first or below the last.' },
              { screen: col(t1 + t2 + row, true, 12), log: ['Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {', '&nbsp;&nbsp;&nbsp;&nbsp;Text("Yesterday: 6")', '&nbsp;&nbsp;&nbsp;&nbsp;Text("Best: 9")', '}'], say: 'A <code>Row</code> as the third child. Its own children sit side by side, 16 dp apart. The Row itself is centered like the others.' },
              { screen: col(t1 + t2 + row + '<div style="width:60px;height:60px;outline:1.5px dashed var(--accent);display:grid;place-items:center;font-weight:800">8</div>', true, 12), log: ['Box(Modifier.size(96.dp), contentAlignment = Alignment.Center) {', '&nbsp;&nbsp;&nbsp;&nbsp;Text("8")', '}'], say: 'A <code>Box</code> of 96 dp (dashed) with its child in the middle. More children would stack on top of each other, all centered.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Water today", fontSize = 24.sp)
        Text("3 of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("Yesterday: 6")
            Text("Best: 9")
        }
    }
}`,
        remember: 'Column stacks down, Row goes across, Box layers on top. Alignment centers, Arrangement.spacedBy adds space between.',
        mistakes: [
          { title: 'No layout around several children', bad: '@Composable\nfun WaterScreen() {\n    Text("Water today")\n    Text("3 of 8 glasses")   // drawn on top of the title\n}', good: '@Composable\nfun WaterScreen() {\n    Column {\n        Text("Water today")\n        Text("3 of 8 glasses")\n    }\n}', why: 'Without a <code>Column</code> or <code>Row</code>, Compose places every child in the same corner.' },
        ],
        terms: [
          { term: 'Column', def: 'Puts its children from top to bottom.' },
          { term: 'Row', def: 'Puts its children side by side.' },
          { term: 'Box', def: 'Puts its children on top of each other.' },
          { term: 'children', def: 'The composables called inside a layout’s braces.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put the two texts side by side, with 12 dp between them.', code: '[[Row]](horizontalArrangement = Arrangement.[[spacedBy]](12.dp)) {\n    Text("Yesterday: 6")\n    Text("Best: 9")\n}', why: '<code>Row</code> goes across. <code>Arrangement.spacedBy</code> puts the same space between each pair of children.' },
          { type: 'bug', prompt: 'The title should sit above the number, but they sit side by side. Tap the line to change.', code: '@Composable\nfun WaterScreen() {\n    Row {\n        Text("Water today")\n        Text("3 of 8 glasses")\n    }\n}', bug: 2, fix: '    Column {', why: '<code>Row</code> places children across. <code>Column</code> stacks them from top to bottom.' },
        ],
        quiz: [
          { q: 'Which layout puts its children on top of each other?', options: ['<code>Box</code>', '<code>Column</code>', '<code>Row</code>'], a: 0, why: 'A Box layers its children. Column and Row put them next to each other.' },
          { q: 'In a <code>Column</code>, which argument centers the children across the screen?', options: ['<code>horizontalAlignment = Alignment.CenterHorizontally</code>', '<code>verticalArrangement = Arrangement.spacedBy(8.dp)</code>', '<code>Modifier.fillMaxSize()</code>'], a: 0, why: 'A Column stacks children downward; alignment decides where each one sits across.' },
          { q: 'A Column of three Texts has <code>Arrangement.spacedBy(8.dp)</code>. Where is the space?', options: ['8 dp between each pair: two gaps', '8 dp above, between and below every Text', '8 dp only below the last Text'], a: 0, why: '<code>spacedBy</code> only adds space between children, not at the edges.' },
        ],
        docs: [['Compose layout basics', 'https://developer.android.com/develop/ui/compose/layouts/basics']],
      },

      {
        id: 'images',
        title: 'Images and icons',
        tagline: 'Show pictures and small symbols from your drawables.',
        goals: ['Show a picture from <code>res/drawable</code> with <code>Image</code>', 'Describe a picture for people who can’t see it with <code>contentDescription</code>', 'Add a small symbol with <code>Icon</code>'],
        level: 'beginner', introduces: ['Image', 'painter', 'painterResource', 'contentDescription', 'stringResource', 'Icon'],
        body: `
<p>A picture of a glass above the number makes the water screen friendlier and easier to read at a glance. In the resources lesson, pictures went into <code>res/drawable</code>, and the code reached them through <code>R.drawable</code>. Compose shows them with <code>Image</code>.</p>
<p><code>Image(painter = painterResource(R.drawable.glass), contentDescription = "A glass of water")</code>. <code>painterResource</code> loads a drawable, such as a PNG, JPG or WEBP file or a vector drawable, and turns it into a <em>painter</em>: something Compose can paint on the screen. Give the image a size with <code>Modifier.size(120.dp)</code>, or it uses the picture’s own size.</p>
<p><code>contentDescription</code> is what a <em>screen reader</em> says aloud. A screen reader (TalkBack, on Android) reads the screen out loud for people who can’t see it well. Describe what matters: “A glass of water”, not “image”. If a picture is only decoration and the text next to it already says everything, pass <code>null</code>, and TalkBack skips it. Like any text, a description is best kept in <code>strings.xml</code>: <code>stringResource(R.string.glass_description)</code> reads a string resource inside a composable.</p>
<p><code>Icon</code> is for small symbols, like a star or a plus sign. It takes the color of the content around it, and the drawable’s own size. To get one, right-click the <b>res</b> folder in Android Studio and choose <b>New &gt; Vector Asset</b>, pick an icon under <b>Clip art</b>, and it is saved in <code>res/drawable</code> at 24 dp. Then: <code>Icon(painter = painterResource(R.drawable.ic_star), contentDescription = null)</code>. Give it <code>Modifier.size(...)</code> to change its size.</p>`,
        visual(el) {
          const glass = '<svg viewBox="0 0 40 48" width="54" height="64" aria-hidden="true" style="color:var(--accent)"><path d="M10.6 22h18.8l-2.1 22H12.7z" fill="var(--accent-soft)"/><path d="M6 4h28l-4 40H10z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>';
          const star = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/></svg>';
          const focus = 'outline:2.5px solid var(--ok);outline-offset:3px;border-radius:4px;';
          const scr = ({ img = false, icon = false, f = '' } = {}) => `<div class="ui-m-body" style="justify-items:center;gap:8px">${img ? `<span style="display:inline-flex;${f === 'img' ? focus : ''}">${glass}</span>` : ''}<div style="font-size:0.95rem">Water today</div><div style="font-size:1.05rem;font-weight:800${f === 'count' ? ';' + focus : ''}">3 of 8 glasses</div><div style="display:flex;gap:4px;align-items:center;font-size:0.8rem${f === 'best' ? ';' + focus : ''}">${icon ? star : ''}<span>Best: 9</span></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Code and TalkBack',
            predict: {
              q: 'TalkBack moves through the screen and reaches an <code>Icon</code> whose <code>contentDescription</code> is <code>null</code>. What does it say?',
              options: ['“Image”', 'Nothing: it skips the icon', 'The file name, “ic star”'],
              a: 1,
              why: '<code>null</code> means “decoration only”, so the screen reader leaves it out.',
            },
            frames: [
              { screen: scr(), log: '// the water screen so far', say: 'The screen from the last lesson: text only.' },
              { screen: scr({ img: true }), log: ['Image(', '&nbsp;&nbsp;painter = painterResource(R.drawable.glass),', '&nbsp;&nbsp;contentDescription = "A glass of water",', '&nbsp;&nbsp;modifier = Modifier.size(96.dp)', ')'], say: '<code>painterResource</code> loads <code>res/drawable/glass</code>. The <code>Image</code> draws it at 96 dp, above the title.' },
              { screen: scr({ img: true, f: 'img' }), log: 'TalkBack: “A glass of water, Image”', say: 'With TalkBack on, the green frame shows what is being read. For the picture, it reads the <code>contentDescription</code>, then that it is an image.' },
              { screen: scr({ img: true, f: 'count' }), log: 'TalkBack: “3 of 8 glasses”', say: 'A Text needs no description: TalkBack reads its words.' },
              { screen: scr({ img: true, icon: true }), log: ['Row(verticalAlignment = Alignment.CenterVertically) {', '&nbsp;&nbsp;Icon(painterResource(R.drawable.ic_star), contentDescription = null)', '&nbsp;&nbsp;Text("Best: 9")', '}'], say: 'A small star <code>Icon</code> before “Best: 9”, in a Row. It takes the color of the text around it.' },
              { screen: scr({ img: true, icon: true, f: 'best' }), log: 'TalkBack: “Best: 9”', say: 'The star has <code>null</code> as its description, so TalkBack skips it and reads only the text. Saying “star” would add nothing.' },
            ],
          });
        },
        code: `Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Image(
        painter = painterResource(R.drawable.glass),
        contentDescription = stringResource(R.string.glass_description),
        modifier = Modifier.size(96.dp)
    )
    Text("3 of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            painter = painterResource(R.drawable.ic_star),
            contentDescription = null       // decoration: the text says it all
        )
        Text("Best: 9")
    }
}
// res/values/strings.xml:
// <string name="glass_description">A glass of water</string>`,
        remember: 'Image(painter = painterResource(R.drawable.x), contentDescription = ...) shows a picture. Use null only for decoration.',
        mistakes: [
          { title: 'Leaving out contentDescription', bad: 'Image(painter = painterResource(R.drawable.glass))\n// None of the following candidates is applicable:', good: 'Image(\n    painter = painterResource(R.drawable.glass),\n    contentDescription = "A glass of water"\n)', why: '<code>Image</code> comes in three versions (for a painter, a bitmap and a vector), and the error lists them all. None fits, because each one needs a <code>contentDescription</code>. Kotlin asks you to decide: a description, or <code>null</code> for decoration.' },
        ],
        terms: [
          { term: 'painterResource', def: 'Loads a drawable from <code>res/drawable</code> so <code>Image</code> or <code>Icon</code> can draw it.' },
          { term: 'contentDescription', def: 'The words a screen reader says for an image. <code>null</code> means “skip it, it’s decoration”.' },
          { term: 'screen reader', def: 'A tool that reads the screen aloud for people who can’t see it well. On Android it is TalkBack.' },
          { term: 'Icon', def: 'A small symbol in the color of the content around it. It takes the drawable’s own size; icons from Vector Asset are 24 dp.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the drawable named sun, described as “Sunny”.', code: 'Image(\n    painter = [[painterResource]](R.drawable.sun),\n    [[contentDescription]] = "Sunny"\n)', why: '<code>painterResource</code> loads the drawable; <code>contentDescription</code> is what TalkBack says.' },
          { type: 'bug', prompt: 'This wave picture is only decoration, but TalkBack reads “decoration” aloud. Tap the line to fix.', code: 'Image(\n    painter = painterResource(R.drawable.waves),\n    contentDescription = "decoration",\n    modifier = Modifier.fillMaxWidth()\n)', bug: 2, fix: '    contentDescription = null,', why: 'Any text you pass is read aloud. <code>null</code> tells TalkBack to skip a decorative picture.' },
        ],
        quiz: [
          { q: 'What does <code>painterResource(R.drawable.glass)</code> do?', options: ['Loads the glass drawable so it can be drawn', 'Draws a new picture of a glass', 'Saves a picture into <code>res/drawable</code>'], a: 0, why: 'It reads the drawable you added to the project and gives Compose a painter for it.' },
          { q: 'A picture is pure decoration. Which <code>contentDescription</code> fits?', options: ['<code>null</code>', '<code>"image"</code>', '<code>""</code>'], a: 0, why: '<code>null</code> tells the screen reader to skip it. Any text would be read aloud.' },
          { q: 'You add a star with <b>New &gt; Vector Asset</b> and show it with <code>Icon</code>, with no size. How big is it?', options: ['24 dp', 'The whole screen width', '1 dp'], a: 0, why: 'Vector Asset saves icons at 24 dp, and an <code>Icon</code> takes its drawable’s own size. <code>Modifier.size(...)</code> changes it.' },
        ],
        docs: [['Loading images', 'https://developer.android.com/develop/ui/compose/graphics/images/loading'], ['Material icons', 'https://developer.android.com/develop/ui/compose/graphics/images/material']],
      },

      {
        id: 'buttons',
        title: 'Buttons and clicks',
        tagline: 'Run your own code when someone taps.',
        goals: ['Make a tappable button with <code>Button</code> and <code>onClick</code>', 'Put text and an icon inside a button', 'Pick a button style, and switch a button off with <code>enabled = false</code>'],
        level: 'beginner', introduces: ['Button', 'onClick', 'OutlinedButton', 'TextButton', 'enabled'],
        body: `
<p>The water tracker needs an “Add a glass” button. A button is two things: what it shows, and what happens when someone taps it.</p>
<p><code>Button(onClick = { Log.d("Hello", "Glass added") }) { Text("Add a glass") }</code>. <code>onClick</code> is a lambda, a function kept as a value, as in the Kotlin lessons: Compose holds on to it and runs it each time the button is tapped. The second pair of braces is a trailing lambda with what the button shows. Composables called there sit side by side, so an <code>Icon</code> and a <code>Text</code> make a button with a symbol. <code>Modifier.padding(end = 8.dp)</code> on the icon adds space on one side only; <code>end</code> is the side where text ends (the right, in languages written left to right).</p>
<p>As in the Android lessons, <code>Log.d("Hello", "Glass added")</code> writes a line to Logcat with the tag <code>Hello</code>, and <code>tag:Hello</code> in Logcat’s search box shows only your lines, so you can check that a tap really ran your code.</p>
<p>Buttons come in styles. <code>Button</code> is filled with color, for the main action on a screen. <code>OutlinedButton</code> has only a border, and <code>TextButton</code> is plain text, for less important actions. All of them take <code>onClick</code> and content the same way. Add <code>enabled = false</code> and a button turns grey and ignores taps, for when an action isn’t possible right now.</p>`,
        visual(el) {
          const plus = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="vertical-align:-2px;margin-right:6px"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor"/></svg>';
          const off = 'background:var(--sunk);color:var(--muted);';
          const scr = (styles, histOff) => `<div class="ui-m-body" style="justify-items:center;gap:10px"><div style="font-size:0.95rem">Water today</div><div style="font-size:1.05rem;font-weight:800">3 of 8 glasses</div><span style="justify-self:center" class="ui-m-btn b-add">${plus}Add a glass</span>${styles ? `<span style="justify-self:center" class="ui-m-btn ghost b-reset">Reset</span><span class="b-hist" style="padding:6px 12px;font-weight:700;font-size:0.8rem;border-radius:999px;color:${histOff ? 'var(--muted)' : 'var(--accent)'}">History</span>` : ''}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Logcat, message column',
            predict: {
              q: 'A button has <code>enabled = false</code>. Someone taps it. What does Logcat show?',
              options: ['The text from its <code>onClick</code>', 'Nothing: the tap is ignored', 'An error'],
              a: 1,
              why: 'A disabled button looks grey and doesn’t run <code>onClick</code> at all.',
            },
            frames: [
              { screen: scr(false), log: [], say: 'A <code>Button</code> with an <code>Icon</code> and a <code>Text</code> inside. Nothing has been tapped yet, so Logcat is empty.' },
              { tap: '.b-add', screen: scr(false), log: 'Glass added', say: 'A tap runs the lambda in <code>onClick</code>. Its <code>Log.d</code> line shows up in Logcat.' },
              { tap: '.b-add', screen: scr(false), log: 'Glass added', say: 'Each tap runs it again. The text on the screen stays the same: this code only writes to Logcat.' },
              { screen: scr(true), log: [], say: 'Two more styles: an <code>OutlinedButton</code> for Reset, and a <code>TextButton</code> for History, which is less important.' },
              { tap: '.b-reset', screen: scr(true), log: 'Reset', say: 'Every style works the same way: tap, and its <code>onClick</code> runs.' },
              { screen: scr(true, true), log: [], say: 'History gets <code>enabled = false</code>. It turns grey.' },
              { tap: '.b-hist', screen: scr(true, true), log: [], say: 'A tap on it does nothing: <code>onClick</code> doesn’t run, so Logcat stays the same.' },
            ],
          });
        },
        code: `Button(onClick = { Log.d("Hello", "Glass added") }) {
    Icon(
        painter = painterResource(R.drawable.ic_add),
        contentDescription = null,
        modifier = Modifier.padding(end = 8.dp)    // 8 dp after the icon, before the text
    )
    Text("Add a glass")
}

OutlinedButton(onClick = { Log.d("Hello", "Reset") }) {
    Text("Reset")
}

TextButton(onClick = { Log.d("Hello", "History") }, enabled = false) {
    Text("History")        // grey, and taps do nothing
}
// Tap "Add a glass" twice. Logcat, filtered with tag:Hello:
// Glass added
// Glass added`,
        remember: 'Button(onClick = { ... }) { Text("...") }: the first lambda runs on each tap, the second is what the button shows.',
        mistakes: [
          { title: 'Forgetting the braces in onClick', bad: 'Button(onClick = Log.d("Hello", "Glass added")) {\n    Text("Add a glass")\n}', good: 'Button(onClick = { Log.d("Hello", "Glass added") }) {\n    Text("Add a glass")\n}', why: 'Without braces, <code>Log.d</code> runs right away and its result is passed in. <code>onClick</code> needs a function to run later, so Kotlin refuses with a type mismatch error.' },
        ],
        terms: [
          { term: 'Button', def: 'A tappable composable. <code>onClick</code> says what happens, the trailing lambda what it shows.' },
          { term: 'onClick', def: 'The lambda a button runs each time it is tapped.' },
          { term: 'enabled', def: 'When <code>false</code>, the button turns grey and ignores taps.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write “Saved” to Logcat each time the button is tapped.', code: 'Button([[onClick]] = { Log.d("Hello", "Saved") }) {\n    [[Text]]("Save")\n}', why: '<code>onClick</code> holds the code to run on a tap. The trailing lambda holds what the button shows.' },
          { type: 'bug', prompt: 'Tapping should write “Reset” to Logcat, but this doesn’t compile. Tap the wrong line.', code: 'OutlinedButton(\n    onClick = Log.d("Hello", "Reset")\n) {\n    Text("Reset")\n}', bug: 1, fix: '    onClick = { Log.d("Hello", "Reset") }', why: '<code>onClick</code> needs a function. The braces turn the code into a lambda that runs on each tap.' },
        ],
        quiz: [
          { q: 'When does the code inside <code>onClick = { ... }</code> run?', options: ['Each time the button is tapped', 'Once, when the screen appears', 'Never, unless you call it yourself'], a: 0, why: 'Compose keeps the lambda and runs it for every tap.' },
          { q: 'Which style fits a less important action?', options: ['<code>TextButton</code>', '<code>Button</code>', 'Both are the same'], a: 0, why: '<code>Button</code> is filled and stands out, for the main action. <code>TextButton</code> is plain text.' },
          { q: 'In <code>Button(onClick = { ... }) { ... }</code>, what goes in the second pair of braces?', options: ['What the button shows', 'The code to run on a tap', 'The button’s color'], a: 0, why: 'The trailing lambda holds the content, like a <code>Text</code>. The code to run on a tap goes in <code>onClick</code>.' },
        ],
        docs: [['Button', 'https://developer.android.com/develop/ui/compose/components/button']],
      },

      {
        id: 'state',
        title: 'State',
        tagline: 'Values that update the screen when they change.',
        goals: ['Explain why a plain <code>var</code> doesn’t update the screen', 'Hold a changing value with <code>remember { mutableStateOf(...) }</code>', 'Change it in <code>onClick</code> and watch the screen follow'],
        level: 'beginner', introduces: ['remember', 'mutableStateOf', 'getValue', 'setValue'],
        body: `
<p>Tap “Add a glass” and the screen should say 4, then 5. Try it with a plain <code>var glasses = 3</code> and <code>glasses++</code> in <code>onClick</code>: the variable goes up, but the screen still says 3. Compose has no idea the variable changed, so it never draws the screen again.</p>
<p><em>State</em> is a value that Compose watches. <code>mutableStateOf(3)</code> makes a small box that holds 3. When a composable has read the box and its value changes, Compose runs that composable again, with the new value, and the screen updates. Running a composable again like this is called <em>recomposition</em>.</p>
<p>That brings a new problem. Each time <code>WaterScreen</code> runs again, <code>mutableStateOf(3)</code> would make a fresh box holding 3. <code>remember { }</code> fixes it: the first time, it runs the code in its braces and keeps the result; every time after that, it hands back the same box. Android Studio marks a <code>mutableStateOf</code> without <code>remember</code> as an error for this reason.</p>
<p>Together: <code>var glasses by remember { mutableStateOf(3) }</code>. <code>by</code> works like <code>by lazy</code> in the Kotlin lessons: you read and write <code>glasses</code> like a normal variable, and the reads and writes go to the box. Now <code>onClick = { glasses++ }</code> changes the state, and the screen follows. If <code>by</code> is underlined in red, add the two imports Android Studio suggests: <code>import androidx.compose.runtime.getValue</code> and <code>import androidx.compose.runtime.setValue</code>.</p>`,
        visual(el) {
          const scr = n => `<div class="ui-m-body" style="justify-items:center;gap:10px"><div style="font-size:0.95rem">Water today</div><div style="font-size:1.05rem;font-weight:800">${n} of 8 glasses</div><span style="justify-self:center" class="ui-m-btn b-add">Add a glass</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'With a plain <code>var glasses = 3</code>, you tap Add and <code>glasses++</code> runs. What does the screen show?',
              options: ['4 of 8 glasses', '3 of 8 glasses', 'An error'],
              a: 1,
              why: 'The variable is 4, but Compose isn’t watching a plain variable, so it never draws the screen again.',
            },
            frames: [
              { screen: scr(3), log: 'var glasses = 3', say: 'First try: a plain <code>var</code>, read by the Text.' },
              { tap: '.b-add', screen: scr(3), log: ['tap → glasses++', 'glasses is now 4', 'screen not redrawn'], say: 'The variable changed, the screen didn’t. Nothing told Compose to run <code>WaterScreen</code> again.' },
              { screen: scr(3), log: 'var glasses by mutableStateOf(3)   // no remember', say: 'Second try: state, but without <code>remember</code>.' },
              { tap: '.b-add', screen: scr(3), log: ['tap → glasses++ → 4', 'WaterScreen runs again', 'mutableStateOf(3) makes a new box: 3'], say: 'Compose noticed and ran <code>WaterScreen</code> again. But that run made a brand new box holding 3, so the screen still says 3.' },
              { screen: scr(3), log: 'var glasses by remember { mutableStateOf(3) }', say: 'Third try: <code>remember</code> keeps the box between runs.' },
              { tap: '.b-add', screen: scr(4), log: ['tap → glasses++ → 4', 'WaterScreen runs again', 'remember gives back the same box: 4'], say: 'Now it works. The state changed, Compose ran <code>WaterScreen</code> again, and <code>remember</code> handed back the box holding 4.' },
              { tap: '.b-add', screen: scr(5), log: ['tap → glasses++ → 5', 'WaterScreen runs again'], say: 'Every tap: change the state, and the screen follows.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    var glasses by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Water today", fontSize = 24.sp)
        Text("$glasses of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Button(onClick = { glasses++ }) {
            Text("Add a glass")
        }
        OutlinedButton(onClick = { glasses = 0 }) {
            Text("Reset")
        }
    }
}
// Tap "Add a glass" twice: 2 of 8 glasses. Tap "Reset": 0 of 8 glasses.`,
        remember: 'var x by remember { mutableStateOf(start) }: change x, and every composable that reads it runs again.',
        mistakes: [
          { title: 'A plain var for something on screen', bad: 'var glasses = 0\nButton(onClick = { glasses++ }) { Text("$glasses") }   // always shows 0', good: 'var glasses by remember { mutableStateOf(0) }\nButton(onClick = { glasses++ }) { Text("$glasses") }', why: 'Compose only redraws when a state it watches changes. A plain variable is not watched.' },
        ],
        terms: [
          { term: 'state', def: 'A value Compose watches, made with <code>mutableStateOf</code>. Changing it updates the screen.' },
          { term: 'recomposition', def: 'Compose running a composable again because a state it read has changed.' },
          { term: 'remember', def: 'Keeps a value between runs of a composable, instead of making it again each time.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a like counter that goes up on each tap.', code: 'var likes by [[remember]] { [[mutableStateOf]](0) }\nButton(onClick = { [[likes++]] }) {\n    Text("$likes likes")\n}', why: '<code>remember</code> keeps the box, <code>mutableStateOf</code> makes it watched, and <code>likes++</code> changes it.' },
          { type: 'bug', prompt: 'Each tap runs <code>WaterScreen</code> again, but the number always jumps back to 0. Tap the line to fix.', code: '@Composable\nfun WaterScreen() {\n    var glasses by mutableStateOf(0)\n    Button(onClick = { glasses++ }) {\n        Text("$glasses of 8 glasses")\n    }\n}', bug: 2, fix: '    var glasses by remember { mutableStateOf(0) }', why: 'Without <code>remember</code>, every run makes a new box holding 0.' },
        ],
        quiz: [
          { q: 'What does <code>mutableStateOf(0)</code> give you?', options: ['A box holding 0 that Compose watches', 'A plain number 0', 'A list of numbers'], a: 0, why: 'When its value changes, Compose runs the composables that read it again.' },
          { q: 'Why wrap it in <code>remember { }</code>?', options: ['So the same box is kept each time the composable runs again', 'So the value is saved to a file', 'So the button can be tapped'], a: 0, why: 'Without it, each run would make a fresh box with the starting value.' },
          { q: 'What is recomposition?', options: ['Compose running a composable again after a state it read changed', 'Restarting the whole app', 'Building the project in Android Studio'], a: 0, why: 'It is how the screen catches up with new state.' },
        ],
        docs: [['State and Jetpack Compose', 'https://developer.android.com/develop/ui/compose/state']],
      },

      {
        id: 'recomposition',
        title: 'How Compose redraws',
        tagline: 'Only the parts that read a changed state run again.',
        goals: ['Tell which composables run again after a state change', 'Explain why writing the same value changes nothing', 'Keep composables quick and free of side effects, because they can run often'],
        level: 'beginner', introduces: [],
        body: `
<p>Every tap on “Add a glass” makes Compose run code again. Which code: the whole screen, every time? Knowing the answer tells you where to put things, and keeps your app fast.</p>
<p>Split the screen into small composables: <code>Title()</code> shows “Water today”, and <code>GlassCount(glasses)</code> shows the number. When <code>glasses</code> changes, Compose runs again the composables that read it: <code>WaterScreen</code>, which reads <code>glasses</code> to pass it on, and <code>GlassCount</code>, which now gets a different value. <code>Title</code> gets nothing that changed, so Compose <em>skips</em> it: its code doesn’t run at all.</p>
<p>Recomposition only happens when a state’s value really changes. Setting <code>glasses = 0</code> when it is already 0 is no change, so nothing runs. Changing a plain variable doesn’t count either, because Compose isn’t watching it.</p>
<p>A composable can run often: after every tap, and during an animation even many times a second. Compose may also skip one you expected to run. So keep a composable’s body quick, and keep <em>side effects</em> out of it: work like writing to Logcat or saving a file. Put that work in <code>onClick</code>, which runs exactly once per tap.</p>`,
        visual(el) {
          const scr = n => `<div class="ui-m-body" style="justify-items:center;gap:10px"><div style="font-size:0.95rem">Water today</div><div style="font-size:1.05rem;font-weight:800">${n} of 8 glasses</div><span style="justify-self:center" class="ui-m-btn b-add">Add a glass</span><span style="justify-self:center" class="ui-m-btn ghost b-reset">Reset</span></div>`;
          const ran = n => [`— glasses = ${n} —`, 'WaterScreen ran', 'Title skipped', `GlassCount(${n}) ran`];
          Lab.ui.phone(el, {
            logTitle: 'What ran',
            predict: {
              q: 'You tap Add, and <code>glasses</code> goes from 3 to 4. Does <code>Title()</code>, which always shows “Water today”, run again?',
              options: ['Yes: the whole screen runs again', 'No: Compose skips it', 'Only if the phone is rotated'],
              a: 1,
              why: '<code>Title</code> has no inputs that changed, so Compose skips it.',
            },
            frames: [
              { screen: scr(3), log: ['WaterScreen ran', 'Title ran', 'GlassCount(3) ran'], say: 'The first time, everything runs once to build the screen.' },
              { tap: '.b-add', screen: scr(4), log: ran(4), say: '<code>glasses</code> changed. <code>WaterScreen</code> reads it, so it runs. <code>GlassCount</code> gets 4 instead of 3, so it runs. <code>Title</code> gets nothing new: skipped.' },
              { tap: '.b-add', screen: scr(5), log: ran(5), say: 'Same pattern on every tap. The parts that don’t depend on <code>glasses</code> are left alone.' },
              { tap: '.b-reset', screen: scr(0), log: ran(0), say: 'Reset sets <code>glasses = 0</code>. 5 to 0 is a change, so the same parts run.' },
              { tap: '.b-reset', screen: scr(0), log: ['— glasses = 0, it was already 0 —', 'nothing ran'], say: 'Reset again: the value is already 0. No change, so no composable runs at all.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    var glasses by remember { mutableStateOf(3) }
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Title()                    // skipped when glasses changes
        GlassCount(glasses)        // runs again when glasses changes
        Button(onClick = { glasses++ }) { Text("Add a glass") }
        OutlinedButton(onClick = { glasses = 0 }) { Text("Reset") }
    }
}

@Composable
fun Title() {
    Text("Water today", fontSize = 24.sp)
}

@Composable
fun GlassCount(glasses: Int) {
    Text("$glasses of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
}
// Reset when glasses is already 0: no change, nothing runs again.`,
        remember: 'When a state changes, only the composables that read it, or get a changed input, run again. The rest are skipped.',
        mistakes: [
          { title: 'Side effects in the body', bad: '@Composable\nfun GlassCount(glasses: Int) {\n    Log.d("Hello", "Glass added")   // runs whenever GlassCount runs\n    Text("$glasses of 8 glasses")\n}', good: 'Button(onClick = {\n    glasses++\n    Log.d("Hello", "Glass added")   // runs once per tap\n}) {\n    Text("Add a glass")\n}', why: 'A composable’s body can run any number of times, or be skipped. <code>onClick</code> runs exactly once for each tap.' },
        ],
        terms: [
          { term: 'skipping', def: 'Compose leaving a composable out of a recomposition because none of its inputs changed.' },
          { term: 'side effect', def: 'Work beyond describing the screen, like writing to Logcat or saving a file. It belongs in <code>onClick</code>, not in a composable’s body.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in what happens to each composable when glasses changes from 2 to 3.', code: '@Composable\nfun Header() {\n    Text("Water today")\n}\n\n@Composable\nfun Count(glasses: Int) {\n    Text("$glasses of 8 glasses")\n}\n// glasses changes from 2 to 3:\n// Header is [[skipped]]. Count runs [[again]].', why: '<code>Header</code> has no inputs, so nothing about it changed. <code>Count</code> gets a new value.' },
          { type: 'bug', prompt: 'The screen says “3 of 8 glasses”, and tapping Add never changes it: after a tap, no composable runs at all. Tap the line to fix.', code: '@Composable\nfun WaterScreen() {\n    var glasses by remember { mutableStateOf(3) }\n    Column {\n        GlassCount(glasses)\n        Button(onClick = { glasses = 3 }) {\n            Text("Add a glass")\n        }\n    }\n}', bug: 5, fix: '        Button(onClick = { glasses++ }) {', why: '<code>glasses</code> is already 3, so writing 3 again is no change, and Compose runs nothing. <code>glasses++</code> really changes the value, so <code>GlassCount</code> runs again with 4.' },
        ],
        quiz: [
          { q: '<code>glasses</code> is 0. You run <code>glasses = 0</code>. What runs again?', options: ['Nothing', 'Every composable', 'Only <code>WaterScreen</code>'], a: 0, why: 'The value didn’t change, so there is nothing to redraw.' },
          { q: 'Where should code that saves the count to a file go?', options: ['In <code>onClick</code>', 'In the body of <code>GlassCount</code>', 'In <code>Title</code>'], a: 0, why: 'A composable body can run many times or be skipped. <code>onClick</code> runs once per tap.' },
          { q: '<code>Title()</code> takes no parameters and reads no state. What happens to it when <code>glasses</code> changes?', options: ['It is skipped', 'It runs again', 'It disappears from the screen'], a: 0, why: 'Skipped composables stay on the screen as they were. Their code just doesn’t run.' },
        ],
        docs: [['Lifecycle of composables', 'https://developer.android.com/develop/ui/compose/lifecycle'], ['Thinking in Compose', 'https://developer.android.com/develop/ui/compose/mental-model']],
      },

      {
        id: 'hoisting',
        title: 'State hoisting',
        tagline: 'Move state up, so several composables can share it.',
        goals: ['Turn a composable with its own state into one that takes a value and an event', 'Pass state down and events up between composables', 'Preview a stateless composable with any value'],
        level: 'beginner', introduces: [],
        body: `
<p>The water screen grows. A <code>GlassCounter</code> shows the number and the Add button, and below it a <code>GoalMessage</code> says “Goal reached!” once you reach 8. But if <code>glasses</code> is remembered inside <code>GlassCounter</code>, the message can’t see it. State made inside a composable belongs to that composable alone.</p>
<p><em>State hoisting</em> means moving the state up, into the composable that calls both of them: here <code>WaterScreen</code>. <code>GlassCounter</code> then remembers nothing. Instead it gets two parameters: <code>glasses: Int</code>, the value to show, and <code>onAdd: () -&gt; Unit</code>, a function to call when the button is tapped. It hands that function on with <code>Button(onClick = onAdd)</code>. No braces here, and that is no mistake: <code>onAdd</code> already is a function, so you pass it on as it is. <code>onClick = { onAdd() }</code> does the same. A composable without state of its own is <em>stateless</em>; one that holds state is <em>stateful</em>.</p>
<p>Values flow down, as parameters: <code>WaterScreen</code> passes <code>glasses</code> to <code>GlassCounter</code> and to <code>GoalMessage</code>. Events flow up, as lambdas: <code>GlassCounter</code> calls <code>onAdd()</code>, and <code>WaterScreen</code> decides what that means, <code>glasses++</code>. Only one place holds the number, so the two can never disagree. Inside <code>GoalMessage</code>, a plain <code>if</code> decides whether its Text is shown at all.</p>
<p>Stateless composables are also easier to reuse and to check. A preview can show <code>GlassCounter(glasses = 8, onAdd = { })</code>, a full day, without tapping eight times. <code>{ }</code> is an empty lambda: in the preview, a tap does nothing.</p>`,
        visual(el) {
          const scr = (n, msg) => `<div class="ui-m-body" style="justify-items:center;gap:10px"><div style="font-size:1.05rem;font-weight:800">${n} of 8 glasses</div><span style="justify-self:center" class="ui-m-btn b-add">Add a glass</span>${msg ? '<div style="font-weight:700;color:var(--ok)">Goal reached!</div>' : ''}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'Down and up',
            predict: {
              q: '<code>glasses</code> is remembered inside <code>GlassCounter</code>. <code>GoalMessage</code> is called right next to it, in <code>WaterScreen</code>. Can <code>GoalMessage</code> read <code>glasses</code>?',
              options: ['Yes: they are on the same screen', 'No: it belongs to <code>GlassCounter</code> alone'],
              a: 1,
              why: 'A value remembered inside a function is local to it, like any local variable in Kotlin.',
            },
            frames: [
              { screen: scr(8, false), log: ['GlassCounter: glasses = 8 (its own)', 'GoalMessage: can’t see glasses'], say: 'Before hoisting: the counter reached 8, but the message never appears. Its state is locked inside <code>GlassCounter</code>.' },
              { screen: scr(7, false), log: ['WaterScreen: glasses = 7', '↓ GlassCounter(glasses = 7)', '↓ GoalMessage(glasses = 7)'], say: 'After hoisting: <code>WaterScreen</code> holds the state and passes the value down to both.' },
              { tap: '.b-add', screen: scr(7, false), log: '↑ GlassCounter calls onAdd()', say: 'A tap. <code>GlassCounter</code> changes nothing itself; it only reports the event upward.' },
              { screen: scr(7, false), log: 'WaterScreen: glasses++ → 8', say: 'The owner of the state makes the change.' },
              { screen: scr(8, true), log: ['↓ GlassCounter(glasses = 8)', '↓ GoalMessage(glasses = 8)'], say: 'Both get the new value. The number and the message update together, because they read the same state.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    var glasses by remember { mutableStateOf(0) }    // the one place that holds it
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        GlassCounter(glasses = glasses, onAdd = { glasses++ })
        GoalMessage(glasses = glasses)
    }
}

@Composable
fun GlassCounter(glasses: Int, onAdd: () -> Unit) {  // stateless
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("$glasses of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Button(onClick = onAdd) {
            Text("Add a glass")
        }
    }
}

@Composable
fun GoalMessage(glasses: Int) {
    if (glasses >= 8) {
        Text("Goal reached!")
    }
}

@Preview(showBackground = true)
@Composable
fun GlassCounterPreview() {
    GlassCounter(glasses = 8, onAdd = { })
}`,
        remember: 'Hoist state to the composable that calls everyone who needs it. Values go down as parameters, events go up as lambdas.',
        terms: [
          { term: 'state hoisting', def: 'Moving state up into a calling composable, and passing the value and an event function down instead.' },
          { term: 'stateless', def: 'A composable that holds no state of its own: it shows what it is given.' },
          { term: 'stateful', def: 'A composable that holds state with <code>remember</code>.' },
          { term: 'event', def: 'Something that happened, like a tap, reported upward by calling a lambda such as <code>onAdd()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this switch stateless: it gets the value and a function to call.', code: '@Composable\nfun LightButton(isOn: [[Boolean]], onToggle: () -> [[Unit]]) {\n    Button(onClick = [[onToggle]]) {\n        Text(if (isOn) "Turn off" else "Turn on")\n    }\n}', why: 'The value comes in as a normal parameter, the event as a function type. The button hands the event on.' },
          { type: 'bug', prompt: 'This stateless counter doesn’t compile: <code>\'val\' cannot be reassigned.</code> Tap the line to fix.', code: '@Composable\nfun GlassCounter(glasses: Int, onAdd: () -> Unit) {\n    Column {\n        Text("$glasses of 8 glasses")\n        Button(onClick = { glasses++ }) {\n            Text("Add a glass")\n        }\n    }\n}', bug: 4, fix: '        Button(onClick = onAdd) {', why: 'A parameter can’t be changed. A stateless composable reports the tap with <code>onAdd</code>, and the owner of the state changes it.' },
        ],
        quiz: [
          { q: 'Two composables need the same <code>glasses</code>. Where should the state live?', options: ['In the composable that calls both of them', 'Inside one of them', 'In both, one copy each'], a: 0, why: 'Hoisting it to the common caller gives one place for the value, shared by both.' },
          { q: 'In <code>GlassCounter(glasses: Int, onAdd: () -&gt; Unit)</code>, what is <code>onAdd</code> for?', options: ['Reporting a tap upward', 'Holding the number', 'Drawing the button'], a: 0, why: 'Events go up as lambdas. The owner of the state decides what to do.' },
          { q: 'Why are stateless composables easy to preview?', options: ['You can pass in any value, like 8 glasses', 'They don’t need <code>@Composable</code>', 'They have no parameters'], a: 0, why: 'The preview calls them with whatever value you want to see.' },
        ],
        docs: [['Where to hoist state', 'https://developer.android.com/develop/ui/compose/state-hoisting'], ['State and Jetpack Compose', 'https://developer.android.com/develop/ui/compose/state']],
      },

      {
        id: 'saveable',
        title: 'Surviving rotation',
        tagline: 'Keep state when the Activity is created again.',
        goals: ['Explain why <code>remember</code> loses its value when the phone rotates', 'Keep a value through rotation with <code>rememberSaveable</code>', 'Know which values it keeps, and when the app starts fresh'],
        level: 'beginner', introduces: ['rememberSaveable'],
        body: `
<p>You’ve had 5 glasses. You turn the phone sideways, and the counter says 0. The rotation lesson explains why: Android destroys the Activity and creates a new one. Everything <code>remember</code> kept belonged to the old Activity, so it starts over.</p>
<p><code>rememberSaveable</code> works like <code>remember</code>, and also writes the value into the Activity’s <em>saved state</em>: a small bag of values Android keeps for an Activity while it is recreated. It is the same <code>Bundle</code> that <code>onCreate</code> receives as <code>savedInstanceState</code>. When the new Activity builds the screen, <code>rememberSaveable</code> reads the value back. In code it is a one-word change: <code>var glasses by rememberSaveable { mutableStateOf(0) }</code>.</p>
<p>The saved state also brings the value back when Android closed your app in the background to free memory, and the person then returns to it. It is not kept when the person closes the app on purpose, for example by swiping it away from the Recents screen (the list of recently used apps). Then the app starts fresh, as people expect.</p>
<p><code>rememberSaveable</code> can keep simple values by itself: <code>Int</code>, <code>Double</code>, <code>String</code>, <code>Boolean</code> and the like. The Bundle is small, so save only what the screen needs to rebuild itself, such as a count or the text of a field, not long lists.</p>`,
        visual(el) {
          const scr = (n, side) => `<div class="ui-m-body" style="justify-items:center;gap:10px">${side ? '<span class="ui-m-chip">turned sideways</span>' : ''}<div style="font-size:1.05rem;font-weight:800">${n} of 8 glasses</div><span style="justify-self:center" class="ui-m-btn">Add a glass</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: '<code>glasses</code> is 5, kept with plain <code>remember</code>. You rotate the phone. What does the counter show?',
              options: ['5 of 8 glasses', '0 of 8 glasses', 'The app crashes'],
              a: 1,
              why: 'Rotation creates a new Activity. <code>remember</code> started over, so <code>mutableStateOf(0)</code> runs again.',
            },
            frames: [
              { screen: scr(5, false), log: 'var glasses by remember { mutableStateOf(0) }', say: 'Five glasses so far, kept with <code>remember</code>.' },
              { screen: scr(0, true), log: ['↻ rotated', 'old Activity destroyed, new one created', 'remember starts over: 0'], say: 'The new Activity builds the screen from scratch. The 5 is gone.' },
              { screen: scr(5, false), log: 'var glasses by rememberSaveable { mutableStateOf(0) }', say: 'Same app with one word changed: <code>rememberSaveable</code>.' },
              { screen: scr(5, true), log: ['↻ rotated', 'saved state: glasses = 5', 'new Activity reads it back: 5'], say: 'Before the old Activity went away, the value was saved. The new one reads it back.' },
              { screen: scr(5, false), log: ['app in the background, Android closes it to free memory', 'person comes back: glasses = 5'], say: 'The saved state also covers this: Android closed the app on its own, so it brings the value back.' },
              { screen: scr(0, false), log: ['swiped away from Recents', 'opened again: fresh start, 0'], say: 'The person closed the app on purpose. Nothing is restored, and the counter starts at 0.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    var glasses by rememberSaveable { mutableStateOf(0) }   // survives rotation
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        GlassCounter(glasses = glasses, onAdd = { glasses++ })
        GoalMessage(glasses = glasses)
    }
}
// 5 of 8 glasses, rotate the phone: still 5 of 8 glasses`,
        remember: 'remember forgets when the Activity is recreated; rememberSaveable puts simple values in the saved state and gets them back.',
        terms: [
          { term: 'rememberSaveable', def: 'Like <code>remember</code>, but the value also survives rotation and Android closing the app in the background.' },
          { term: 'saved state', def: 'A small bag of values Android keeps for an Activity while it is recreated: the <code>Bundle</code> that <code>onCreate</code> receives as <code>savedInstanceState</code>.' },
          { term: 'Recents screen', def: 'The phone’s list of recently used apps. Swiping an app away there closes it for good.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the selected day when the phone rotates.', code: 'var day by [[rememberSaveable]] { [[mutableStateOf]]("Mon") }', why: '<code>rememberSaveable</code> keeps the String in the saved state, so it comes back after rotation.' },
          { type: 'bug', prompt: 'The picked name jumps back to “Ada” whenever the phone rotates. Tap the line to change.', code: '@Composable\nfun NamePicker() {\n    var name by remember { mutableStateOf("Ada") }\n    Column {\n        Text("Picked: $name")\n        Button(onClick = { name = "Sam" }) { Text("Sam") }\n        Button(onClick = { name = "Lin" }) { Text("Lin") }\n    }\n}', bug: 2, fix: '    var name by rememberSaveable { mutableStateOf("Ada") }', why: 'Rotation creates a new Activity, and <code>remember</code> starts over. <code>rememberSaveable</code> restores the name.' },
        ],
        quiz: [
          { q: 'Why does <code>remember</code> lose its value when the phone rotates?', options: ['The Activity is destroyed and created again', 'Rotation clears the phone’s memory', 'Compose resets every value once a minute'], a: 0, why: 'What <code>remember</code> kept belonged to the old Activity.' },
          { q: 'Android closes your app in the background, and the person comes back. Which value is still there?', options: ['One kept with <code>rememberSaveable</code>', 'One kept with <code>remember</code>', 'Neither'], a: 0, why: 'The saved state is restored in this case too.' },
          { q: 'The person swipes the app away from Recents and opens it again. What does <code>rememberSaveable</code> give back?', options: ['The starting value: a fresh start', 'The last saved value'], a: 0, why: 'Closing an app on purpose throws its saved state away.' },
        ],
        docs: [['Save UI state in Compose', 'https://developer.android.com/develop/ui/compose/state-saving']],
      },

      {
        id: 'text-input',
        title: 'Text fields',
        tagline: 'Let people type, and use what they typed.',
        goals: ['Add a box people can type in with <code>TextField</code>', 'Keep what they type with <code>rememberTextFieldState</code>', 'Read the typed text and turn it into a number'],
        level: 'beginner', introduces: ['TextField', 'TextFieldState', 'rememberTextFieldState', 'state', 'label', 'keyboardOptions', 'KeyboardOptions', 'keyboardType', 'KeyboardType', 'Number', 'OutlinedTextField'],
        body: `
<p>Not everyone aims for 8 glasses a day. The water screen should let people type their own goal. That needs a <em>text field</em>: a box that brings up the keyboard when tapped and shows what is typed.</p>
<p>A text field needs a place to keep its text. <code>val goalState = rememberTextFieldState("8")</code> makes a <code>TextFieldState</code> that holds the text, starting as “8”, and remembers it. Then <code>TextField(state = goalState, label = { Text("Daily goal") })</code> draws the box. The field writes every key press into the state, and shows what the state holds. <code>label</code> is a small composable shown inside the field, so people know what to type.</p>
<p>Read what was typed with <code>goalState.text</code>. It holds the typed characters, but it isn’t a <code>String</code> yet, so call <code>.toString()</code> first. Then it’s the Kotlin you know: <code>goalState.text.toString().toIntOrNull() ?: 8</code> gives the number, or 8 if the field is empty or holds no number. <code>text</code> is watched like state, so whatever reads it updates after each key press.</p>
<p><code>rememberTextFieldState</code> uses <code>rememberSaveable</code> inside, so the typed text survives rotation too. <code>keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)</code> brings up a keyboard with digits. <code>OutlinedTextField</code> is the same field drawn with a border. In older code you may see <code>TextField(value = ..., onValueChange = ...)</code>: an earlier style that keeps the text in a <code>mutableStateOf</code> instead.</p>`,
        visual(el) {
          const keys = '<div style="position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px;background:var(--sunk)">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(k => `<span class="k-${k === '⌫' ? 'del' : k === '✓' ? 'ok' : k}" style="display:grid;place-items:center;padding:5px 0;border-radius:6px;background:var(--surface);font-weight:700;font-size:0.8rem">${k}</span>`).join('') + '</div>';
          const scr = (goalText, focused, kb) => {
            const goal = /^\d+$/.test(goalText) ? goalText : '8';
            return `<div class="ui-m-body" style="justify-items:center;gap:10px"><div style="font-size:1.05rem;font-weight:800">3 of ${goal} glasses</div><span style="justify-self:center" class="ui-m-btn">Add a glass</span><div class="ui-m-field f-goal${focused ? ' on' : ''}" style="justify-self:stretch;display:grid;gap:2px"><span style="font-size:0.66rem;color:${focused ? 'var(--accent)' : 'var(--muted)'}">Daily goal</span><span style="color:var(--ink);min-height:1.2em">${goalText}${focused ? '<span style="color:var(--accent)">|</span>' : ''}</span></div></div>${kb ? keys : ''}`;
          };
          Lab.ui.phone(el, {
            logTitle: 'State and code',
            predict: {
              q: 'The field is empty, so <code>goalState.text</code> is <code>""</code>. What does <code>goalState.text.toString().toIntOrNull() ?: 8</code> give?',
              options: ['<code>0</code>', '<code>8</code>', 'A crash'],
              a: 1,
              why: '<code>""</code> is not a number, so <code>toIntOrNull()</code> gives <code>null</code>, and the Elvis operator picks 8.',
            },
            frames: [
              { screen: scr('8', false, false), log: ['goalState.text = "8"', 'goal = 8'], say: 'The field starts with the text “8” from <code>rememberTextFieldState("8")</code>. The label tells people what it is for.' },
              { tap: '.f-goal', screen: scr('8', true, true), log: 'keyboard opens (digits only)', say: 'A tap on the field brings up the keyboard. <code>KeyboardType.Number</code> asks for one with digits.' },
              { tap: '.k-del', screen: scr('', true, true), log: ['goalState.text = ""', 'toIntOrNull() → null, so goal = 8'], say: 'Delete the 8. The field is empty, so the goal falls back to 8 and the line above still says 8.' },
              { tap: '.k-6', screen: scr('6', true, true), log: ['goalState.text = "6"', 'goal = 6'], say: 'Type 6. The field writes it into the state, and the Text that reads the goal updates right away.' },
              { screen: scr('6', false, false), log: ['↻ rotated', 'goalState.text = "6"'], say: 'Rotate the phone: the text is still 6, because <code>rememberTextFieldState</code> saves it.' },
            ],
          });
        },
        code: `@Composable
fun WaterScreen() {
    var glasses by rememberSaveable { mutableStateOf(0) }
    val goalState = rememberTextFieldState("8")
    val goal = goalState.text.toString().toIntOrNull() ?: 8

    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("$glasses of $goal glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Button(onClick = { glasses++ }) {
            Text("Add a glass")
        }
        TextField(
            state = goalState,
            label = { Text("Daily goal") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )
    }
}
// Type 6 in the field: 0 of 6 glasses`,
        remember: 'val s = rememberTextFieldState() and TextField(state = s): read the typed text with s.text.toString().',
        mistakes: [
          { title: 'A TextFieldState that isn’t remembered', bad: 'TextField(state = TextFieldState(), label = { Text("Daily goal") })', good: 'val goalState = rememberTextFieldState()\nTextField(state = goalState, label = { Text("Daily goal") })', why: 'A plain <code>TextFieldState()</code> is made again each time the composable runs, so the typed text vanishes after the next recomposition, for example after a tap on Add. <code>rememberTextFieldState</code> keeps it.' },
        ],
        terms: [
          { term: 'TextField', def: 'A box people can type in. It brings up the keyboard when tapped.' },
          { term: 'TextFieldState', def: 'Holds a text field’s text. Read it with <code>.text.toString()</code>.' },
          { term: 'rememberTextFieldState', def: 'Makes a <code>TextFieldState</code> and keeps it, through rotation too.' },
          { term: 'label', def: 'A small composable inside a text field that says what to type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a field for a name, labelled “Name”.', code: 'val nameState = [[rememberTextFieldState]]()\nTextField(\n    state = nameState,\n    [[label]] = { Text("Name") }\n)', why: '<code>rememberTextFieldState()</code> keeps the text, starting empty. <code>label</code> says what the field is for.' },
          { type: 'bug', prompt: 'This screen crashes as soon as it opens, because the field starts empty. Tap the line to fix.', code: '@Composable\nfun AgeField() {\n    val ageState = rememberTextFieldState()\n    val age = ageState.text.toString().toInt()\n    Column {\n        TextField(state = ageState, label = { Text("Age") })\n        Text("Age: $age")\n    }\n}', bug: 3, fix: '    val age = ageState.text.toString().toIntOrNull() ?: 0', why: '<code>"".toInt()</code> crashes. <code>toIntOrNull()</code> gives <code>null</code> instead, and <code>?: 0</code> picks a fallback.' },
        ],
        quiz: [
          { q: 'Why call <code>.toString()</code> on <code>goalState.text</code> before <code>toIntOrNull()</code>?', options: ['It holds typed characters, but isn’t a String yet', 'To delete the text', 'To show the keyboard'], a: 0, why: '<code>toIntOrNull()</code> works on a String, so turn the characters into one first.' },
          { q: 'The person types 12 and rotates the phone. What does the field show?', options: ['12', 'Nothing', 'The starting text'], a: 0, why: '<code>rememberTextFieldState</code> uses <code>rememberSaveable</code> inside.' },
          { q: 'What is <code>label = { Text("Daily goal") }</code> for?', options: ['Telling people what to type in the field', 'Setting the starting text', 'Choosing the keyboard'], a: 0, why: 'The label is shown inside the field as a hint about its purpose.' },
        ],
        docs: [['Configure text fields', 'https://developer.android.com/develop/ui/compose/text/user-input']],
      },

      {
        id: 'lists',
        title: 'Long lists',
        tagline: 'Show hundreds of rows, but build only the ones on screen.',
        goals: ['Show a scrolling list with <code>LazyColumn</code>', 'Add rows with <code>items</code> and a single row with <code>item</code>', 'Explain why a long list should not be a <code>Column</code>'],
        level: 'beginner', introduces: ['LazyColumn', 'LazyRow', 'items'],
        body: `
<p>The water tracker gets a History screen: one row for every day you tracked, like “Mon 19 Oct: 6 glasses”. After a year that is 365 rows, and only about seven fit on the screen at once. If you put all 365 in a <code>Column</code>, Compose builds every row before it shows anything, and a <code>Column</code> doesn’t scroll on its own either.</p>
<p><code>LazyColumn</code> is a column for long lists. It scrolls, and it is <em>lazy</em>: it builds only the rows you can see. When a row scrolls away, it is dropped. When a new row scrolls in, it is built at that moment. <code>LazyRow</code> does the same from left to right.</p>
<p>Inside the braces of a <code>LazyColumn</code> you don’t write composables directly. You describe the rows: <code>item { }</code> adds one row, and <code>items(days) { day -> ... }</code> adds one row for every value in the list. Like a <code>for</code> loop, it hands you each value in turn, here called <code>day</code>. If <code>items</code> is underlined in red, add the import Android Studio suggests: <code>import androidx.compose.foundation.lazy.items</code>.</p>`,
        visual(el) {
          const days = ['Mon 19 Oct: 6', 'Sun 18 Oct: 8', 'Sat 17 Oct: 5', 'Fri 16 Oct: 9', 'Thu 15 Oct: 7', 'Wed 14 Oct: 8', 'Tue 13 Oct: 4', 'Mon 12 Oct: 8', 'Sun 11 Oct: 6', 'Sat 10 Oct: 7', 'Fri 9 Oct: 8', 'Thu 8 Oct: 5'];
          const row = d => `<div class="ui-m-row"><div>${d} glasses</div></div>`;
          const list = (from, head) => `<div class="ui-m-bar">History</div><div class="ui-m-body">${head ? '<b>365 days</b>' : ''}${days.slice(from, from + (head ? 6 : 7)).map(row).join('')}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'What Compose builds',
            predict: {
              q: 'History has 365 days and about 7 rows fit on the screen. How many rows does <code>LazyColumn</code> build when the screen opens?',
              options: ['All 365', 'About the 7 on screen', 'Only the first one'],
              a: 1,
              why: 'Lazy means it builds only what you can see, and builds more as you scroll.',
            },
            frames: [
              { screen: list(0, true), say: '<code>item { }</code> made the heading, <code>items(days) { }</code> makes one row per day.' },
              { log: ['built: heading', 'built: Mon 19, Sun 18, Sat 17, Fri 16, Thu 15, Wed 14'], say: 'Only the rows that fit on the screen are built. The other 359 days are still only data in the list.' },
              { screen: list(2), log: ['dropped: heading, Mon 19', 'built: Tue 13, Mon 12'], say: 'The user scrolls down. Rows that leave the screen are dropped, new rows are built as they arrive.' },
              { screen: list(5), log: ['dropped: Sun 18, Sat 17, Fri 16', 'built: Sun 11, Sat 10, Fri 9'], say: 'However long the list, only a screenful of rows exists at any moment.' },
              { screen: list(0, true), log: ['dropped: …', 'built: heading, Mon 19, Sun 18 …'], say: 'Scroll back up and the first rows are built again, fresh.' },
              { log: '// a Column would build all 365 rows at the start, and not scroll', say: 'A <code>Column</code> builds every child right away. Fine for 5 rows, slow for 365. Use <code>LazyColumn</code> when a list is long or you don’t know its length.' },
            ],
          });
        },
        code: `@Composable
fun HistoryList(days: List<String>) {
    LazyColumn {
        item {
            Text("History", fontWeight = FontWeight.Bold)   // one row: a heading
        }
        items(days) { day ->                                // one row per day
            Text(day, modifier = Modifier.padding(16.dp))
        }
    }
}

// HistoryList(listOf("Mon 19 Oct: 6 glasses", "Sun 18 Oct: 8 glasses"))
// shows: History, Mon 19 Oct: 6 glasses, Sun 18 Oct: 8 glasses,
// and scrolls when the list is long`,
        remember: 'For a long list use LazyColumn { items(list) { value -> ... } }. It builds only the rows on screen.',
        mistakes: [
          { title: 'A long list in a Column', bad: `Column {
    for (day in days) {
        Text(day)
    }
}
// 365 days: all built at once, and no scrolling`, good: `LazyColumn {
    items(days) { day ->
        Text(day)
    }
}
// builds only what is on screen, and scrolls`, why: 'A <code>Column</code> builds every child before it shows anything. <code>LazyColumn</code> scrolls and builds rows as they appear.' },
        ],
        terms: [
          { term: 'LazyColumn', def: 'A scrolling column that builds only the rows on screen. <code>LazyRow</code> is the same, side to side.' },
          { term: 'lazy', def: 'Doing work only when it is needed. A lazy list builds a row when it scrolls into view.' },
          { term: 'items', def: 'Inside a <code>LazyColumn</code>: <code>items(list) { value -> ... }</code> adds one row for every value. <code>item { }</code> adds a single row.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show one row for every day in the history.', code: `@Composable
fun HistoryList(days: List<String>) {
    [[LazyColumn]] {
        [[items]](days) { day ->
            Text(day)
        }
    }
}`, why: '<code>LazyColumn</code> is the scrolling list. <code>items(days)</code> adds a row for each day and hands it to you as <code>day</code>.' },
          { type: 'bug', prompt: 'Android Studio marks one line red with <code>@Composable invocations can only happen from the context of a @Composable function</code>. Tap the line.', code: `@Composable
fun HistoryList(days: List<String>) {
    LazyColumn {
        Text("History")
        items(days) { day ->
            Text(day)
        }
    }
}`, bug: 3, fix: '        item { Text("History") }', why: 'Inside a <code>LazyColumn</code> you describe rows, you don’t draw them directly. A single row goes inside <code>item { }</code>.' },
        ],
        quiz: [
          { q: 'Why use <code>LazyColumn</code> instead of <code>Column</code> for two years of history?', options: ['It builds only the rows on screen, and it scrolls', 'It sorts the days', 'It makes the text bigger'], a: 0, why: 'A <code>Column</code> builds all 730 rows at once. <code>LazyColumn</code> builds what you can see.' },
          { q: 'In <code>items(days) { day -> Text(day) }</code>, what is <code>day</code>?', options: ['One value from the list, a different one for each row', 'The whole list', 'The number of rows'], a: 0, why: 'Like the variable in a <code>for</code> loop, it is the current value.' },
          { q: 'Which one shows a list that scrolls from left to right?', options: ['<code>LazyRow</code>', '<code>LazyColumn</code>', '<code>Row</code>'], a: 0, why: '<code>LazyRow</code> is the side-to-side version. A plain <code>Row</code> builds everything and doesn’t scroll.' },
        ],
        docs: [['Lists and grids', 'https://developer.android.com/develop/ui/compose/lists']],
      },

      {
        id: 'lazy-keys',
        title: 'Keys in lists',
        tagline: 'Give every row a name tag so its state stays with it.',
        goals: ['Explain why a row’s remembered state can jump to another row', 'Give list rows a <code>key</code>', 'Choose a key that is unique and never changes'],
        level: 'beginner', introduces: ['mutableStateListOf'],
        body: `
<p>The water screen now lists today’s drinks under the counter, and each row has a small Note field. You write “after my run” on drink #2, then delete drink #1. Suddenly the note sits on drink #3. You never touched the notes. What happened?</p>
<p>The drinks live in <code>WaterScreen</code> as <code>val drinks = remember { mutableStateListOf&lt;Drink&gt;() }</code>. <code>mutableStateListOf</code> makes a list that works like <code>mutableListOf</code>, with <code>add</code> and <code>remove</code>, and that Compose watches like state: change it, and the screen updates. Each row keeps its own note with <code>rememberTextFieldState()</code>. Without more information, a lazy list matches that remembered state by <em>position</em>: “the second row has a note”. When drink #1 is removed, every row moves up one place, but the notes stay at their old positions.</p>
<p>A <em>key</em> fixes this. <code>items(drinks, key = { drink -> drink.id }) { ... }</code> gives every row a name tag. Now Compose remembers “the row with id 2 has a note”, and the note moves with that row wherever it goes.</p>
<p>A good key is unique (no two rows share one) and never changes for the same item, like an id number. A size like 250 ml is a poor key, because two drinks can have the same size. A lazy list also saves each row’s state under its key, so it can give it back when the row scrolls away and returns. That works for <code>rememberSaveable</code> and <code>rememberTextFieldState</code>; plain <code>remember</code> inside a row starts fresh after scrolling. Saving is also why keys must be simple values such as an <code>Int</code> or a <code>String</code>.</p>`,
        visual(el) {
          const row = (id, ml, note) => `<div class="ui-m-row"><div style="flex:1">#${id} · ${ml} ml</div><span class="ui-m-chip"${note ? '' : ' style="color:var(--muted)"'}>${note || 'Note'}</span><span class="ui-m-chip del">✕</span></div>`;
          const scr = (rows, tag) => `<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>${rows.length} of 8 glasses</b><span class="ui-m-muted">${tag}</span>${rows.map(r => row(...r)).join('')}</div>`;
          const four = [[1, 250, ''], [2, 500, 'after my run'], [3, 250, ''], [4, 250, '']];
          Lab.ui.phone(el, {
            logTitle: 'Remembered notes',
            predict: {
              q: 'No keys. Drink #2 has the note “after my run”. The user deletes drink #1. Which drink shows the note now?',
              options: ['#2', '#3', 'None'],
              a: 1,
              why: 'Without keys the note belongs to position 2. After the delete, drink #3 is in position 2.',
            },
            frames: [
              { screen: scr(four, 'items(drinks), no key'), log: ['row 1: ""', 'row 2: "after my run"', 'row 3: ""', 'row 4: ""'], say: 'No key: each remembered note is stored by position.' },
              { tap: '.del', say: 'The user deletes drink #1, the first row.' },
              { screen: scr([[2, 500, ''], [3, 250, 'after my run'], [4, 250, '']], 'items(drinks), no key'), log: ['row 1: "" (was #1’s)', 'row 2: "after my run" (was #2’s)', 'row 3: ""'], say: 'Every drink moved up one place, but the notes stayed where they were. Drink #3 has the note by mistake.' },
              { screen: scr(four, 'items(drinks, key = { it.id })'), log: ['id 1: ""', 'id 2: "after my run"', 'id 3: ""', 'id 4: ""'], say: 'Same list with <code>key = { it.id }</code>. Now each note is stored by the drink’s id.' },
              { tap: '.del', say: 'The user deletes drink #1 again.' },
              { screen: scr([[2, 500, 'after my run'], [3, 250, ''], [4, 250, '']], 'items(drinks, key = { it.id })'), log: ['id 2: "after my run"', 'id 3: ""', 'id 4: ""'], say: 'Drink #1’s row and its state are gone. Drink #2 keeps its note, because the note belongs to id 2, not to a position.' },
            ],
          });
        },
        code: `data class Drink(val id: Int, val ml: Int)

// In WaterScreen:
val drinks = remember { mutableStateListOf<Drink>() }
DrinkList(drinks, onDelete = { drink -> drinks.remove(drink) })

@Composable
fun DrinkList(drinks: List<Drink>, onDelete: (Drink) -> Unit) {
    LazyColumn {
        items(drinks, key = { drink -> drink.id }) { drink ->
            DrinkRow(drink, onDelete = { onDelete(drink) })   // its note follows drink.id
        }
    }
}

@Composable
fun DrinkRow(drink: Drink, onDelete: () -> Unit) {
    val note = rememberTextFieldState()     // saved for this row's key
    Column(modifier = Modifier.padding(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("#\${drink.id}: \${drink.ml} ml")
            TextButton(onClick = onDelete) { Text("Delete") }
        }
        TextField(state = note, label = { Text("Note") })
    }
}`,
        remember: 'items(list, key = { it.id }): a unique id that never changes keeps each row’s state with its item.',
        mistakes: [
          { title: 'A key that is not unique', bad: `items(drinks, key = { drink -> drink.ml }) { ... }
// two drinks of 250 ml: the app crashes
// IllegalArgumentException: Key "250" was already used. If you are using
// LazyColumn/Row please make sure you provide a unique key for each item.`, good: `items(drinks, key = { drink -> drink.id }) { ... }
// every drink has its own id`, why: 'Sizes repeat. Two rows with the same key crash the list, so use an id that only one item has.' },
        ],
        terms: [
          { term: 'key', def: 'A value that names one row in a lazy list, given with <code>key = { ... }</code>. Remembered state follows the key.' },
          { term: 'unique', def: 'Not shared with anything else. No two rows may have the same key.' },
          { term: 'mutableStateListOf', def: 'Makes a list you can <code>add</code> to and <code>remove</code> from, which Compose watches like state.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give each day row its id as the key.', code: `data class Day(val id: Int, val text: String)

LazyColumn {
    items(days, [[key]] = { day -> day.[[id]] }) { day ->
        Text(day.text)
    }
}`, why: 'The key goes in <code>key = { ... }</code>. The id is unique and never changes, so it is a good key.' },
          { type: 'bug', prompt: 'Deleting a drink makes the notes jump to the wrong drinks. Tap the line to change.', code: `data class Drink(val id: Int, val ml: Int)

@Composable
fun DrinkList(drinks: List<Drink>, onDelete: (Drink) -> Unit) {
    LazyColumn {
        items(drinks) { drink ->
            DrinkRow(drink, onDelete = { onDelete(drink) })
        }
    }
}`, bug: 5, fix: '        items(drinks, key = { drink -> drink.id }) { drink ->', why: 'Without a key, remembered state stays at a position. With <code>key = { drink -> drink.id }</code> it follows the drink.' },
        ],
        quiz: [
          { q: 'Without keys, how does a lazy list match a row’s remembered state?', options: ['By the row’s position', 'By the row’s text', 'It doesn’t remember anything'], a: 0, why: 'By position, so state can land on the wrong item when rows move.' },
          { q: 'Which is the best key for today’s drinks?', options: ['The drink’s id number', 'The drink’s size in ml', 'The row’s position'], a: 0, why: 'An id is unique and stays the same. Sizes repeat, and positions change.' },
          { q: 'Two rows get the same key. What happens?', options: ['The app crashes', 'Compose picks one at random', 'Nothing'], a: 0, why: 'Keys must be unique. A repeated key throws <code>IllegalArgumentException: Key "..." was already used.</code>' },
        ],
        docs: [['Item keys', 'https://developer.android.com/develop/ui/compose/lists']],
      },

      {
        id: 'scaffold',
        title: 'Screen structure',
        tagline: 'A top bar, the content and an add button, each in its place.',
        goals: ['Build a screen with <code>Scaffold</code>', 'Add a top bar and a floating action button', 'Keep content clear of the bars with <code>innerPadding</code>'],
        level: 'beginner', introduces: ['Scaffold', 'TopAppBar', 'topBar', 'floatingActionButton', 'FloatingActionButton', 'innerPadding', 'OptIn', 'ExperimentalMaterial3Api', '::'],
        body: `
<p>Most app screens share one shape: a bar at the top with the screen’s title, the content in the middle, and often a square button with rounded corners at the bottom to add something. The water screen should look like that too: a “Water” bar on top, and “Add a glass” as that corner button. You could place these by hand with <code>Box</code>, but every screen would need the same fiddly work.</p>
<p><code>Scaffold</code> has a named place, a <em>slot</em>, for each part. <code>topBar = { TopAppBar(title = { Text("Water") }) }</code> fills the top. <code>floatingActionButton = { FloatingActionButton(onClick = { ... }) { ... } }</code> adds the corner button, called a <em>FAB</em>. Each slot takes a lambda with UI inside, like the content of a <code>Button</code>.</p>
<p>The content goes in the last lambda, which hands you <code>innerPadding</code>: how much room the bars take up, the phone’s status bar included. Apply it with <code>Modifier.padding(innerPadding)</code>, or the top bar will cover your first rows. Because it already includes the status bar, you don’t add <code>safeDrawingPadding()</code> inside a Scaffold.</p>
<p>In the current Material 3 version, <code>TopAppBar</code> is still marked <em>experimental</em>: its details may change. Android Studio asks you to accept that by writing <code>@OptIn(ExperimentalMaterial3Api::class)</code> above your function. <code>ExperimentalMaterial3Api::class</code> means “the marker called ExperimentalMaterial3Api”. If Android Studio later shows the <code>@OptIn</code> line in grey, it is no longer needed, and you can delete it.</p>`,
        visual(el) {
          const drinks = ['#1 · 250 ml', '#2 · 500 ml', '#3 · 250 ml', '#4 · 250 ml'];
          const body = n => `<div class="ui-m-body"><b>${n} of 8 glasses</b>${drinks.slice(0, n).map(t => `<div class="ui-m-row"><div>${t}</div></div>`).join('')}</div>`;
          const bar = '<div class="ui-m-bar">Water</div>';
          const fab = '<span class="ui-m-fab">+</span>';
          Lab.ui.phone(el, {
            logTitle: 'Scaffold slots',
            predict: {
              q: 'The content ignores <code>innerPadding</code>. What happens to the counter at the top?',
              options: ['It hides under the top bar', 'The app crashes', 'Compose adds the space anyway'],
              a: 0,
              why: 'Scaffold only tells you how much room the bars take. Your content has to use that number.',
            },
            frames: [
              { screen: body(3), log: 'Scaffold { innerPadding -> Column { ... } }', say: 'A Scaffold with only content: the counter and today’s drinks.' },
              { screen: `<div style="position:relative;flex:1;display:flex;flex-direction:column"><div class="ui-m-bar" style="position:absolute;left:0;right:0;top:0;z-index:1">Water</div>${body(3)}</div>`, log: 'topBar = { TopAppBar(title = { Text("Water") }) }', say: 'Add a top bar. It is drawn over the top of the content, and the counter disappears under it.' },
              { screen: `${bar}${body(3)}`, log: 'Column(modifier = Modifier.padding(innerPadding))', say: 'Pass <code>innerPadding</code> to the content. It starts below the bar now.' },
              { screen: `${bar}${body(3)}${fab}`, log: 'floatingActionButton = { FloatingActionButton(...) { ... } }', say: 'The FAB slot puts the button in the bottom corner, above the content.' },
              { tap: '.ui-m-fab', screen: `${bar}${body(4)}${fab}`, log: 'onClick → drinks.add(Drink(4, 250))', say: 'Tapping the FAB runs its <code>onClick</code>. It adds a drink, and the counter and the list show it.' },
            ],
          });
        },
        code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WaterScreen() {
    val drinks = remember { mutableStateListOf<Drink>() }
    var nextId by remember { mutableStateOf(1) }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Water") })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                drinks.add(Drink(id = nextId, ml = 250))
                nextId++                      // the next drink gets a new id
            }) {
                Icon(painterResource(R.drawable.ic_add), contentDescription = "Add a glass")
            }
        },
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding).padding(16.dp)) {
            Text("\${drinks.size} of 8 glasses", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            DrinkList(drinks, onDelete = { drink -> drinks.remove(drink) })
        }
    }
}
// (the goal field from the text fields lesson is left out to keep this short)`,
        remember: 'Scaffold(topBar = { ... }, floatingActionButton = { ... }) { innerPadding -> ... }, and always use innerPadding.',
        terms: [
          { term: 'Scaffold', def: 'A ready-made screen layout with slots for a top bar, a floating action button and the content.' },
          { term: 'slot', def: 'A parameter that takes a piece of UI as a lambda, like <code>topBar = { ... }</code>.' },
          { term: 'FAB', def: 'Floating action button: a square button with rounded corners for the screen’s main action, made with <code>FloatingActionButton</code>.' },
          { term: 'innerPadding', def: 'The space the bars take, status bar included, handed to the content. Apply it with <code>Modifier.padding(innerPadding)</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the History screen a top bar titled “History”.', code: `Scaffold(
    [[topBar]] = {
        [[TopAppBar]](title = { Text("History") })
    },
) { innerPadding ->
    LazyColumn(modifier = Modifier.padding(innerPadding)) {
        items(days) { day -> Text(day) }
    }
}`, why: 'The <code>topBar</code> slot holds a <code>TopAppBar</code>, whose <code>title</code> is another slot with a <code>Text</code>.' },
          { type: 'bug', prompt: 'The first day in the list is always hidden behind the top bar. Tap the line to change.', code: `Scaffold(
    topBar = { TopAppBar(title = { Text("History") }) },
) { innerPadding ->
    LazyColumn {
        items(days) { day -> Text(day) }
    }
}`, bug: 3, fix: '    LazyColumn(modifier = Modifier.padding(innerPadding)) {', why: 'The content must use <code>innerPadding</code>, or it starts at the very top, under the bar.' },
        ],
        quiz: [
          { q: 'What does <code>innerPadding</code> tell you?', options: ['How much room the bars take', 'The size of the FAB', 'The space between list rows'], a: 0, why: 'Apply it to the content so nothing hides behind the bars.' },
          { q: 'Where does a <code>FloatingActionButton</code> go?', options: ['In the <code>floatingActionButton</code> slot', 'Inside the <code>TopAppBar</code>', 'Anywhere in the content'], a: 0, why: 'The slot puts it in the bottom corner, above the content.' },
          { q: 'Inside a Scaffold, do you still need <code>safeDrawingPadding()</code> on the content?', options: ['No: <code>innerPadding</code> already includes the status bar', 'Yes, always', 'Only in dark mode'], a: 0, why: 'Scaffold works out the room for the bars and the status bar, and hands it to you as <code>innerPadding</code>.' },
        ],
        docs: [['Scaffold', 'https://developer.android.com/develop/ui/compose/components/scaffold'], ['App bars', 'https://developer.android.com/develop/ui/compose/components/app-bars']],
      },

      {
        id: 'theming',
        title: 'Theming',
        tagline: 'Pick colors and text styles once; the whole app follows, even in dark mode.',
        goals: ['Give the app its own colors with <code>lightColorScheme</code> and <code>darkColorScheme</code>', 'Read colors and text styles from <code>MaterialTheme</code>', 'Make a screen that really turns dark in dark mode'],
        level: 'beginner', introduces: ['MaterialTheme', 'colorScheme', 'typography', 'isSystemInDarkTheme', 'lightColorScheme', 'darkColorScheme', 'Color', 'Surface', 'dynamicColor'],
        body: `
<p>The water tracker should be water blue, and turn dark at night when the phone is in dark mode. Writing a color into every <code>Text</code> by hand means changing it in fifty places, and twice for dark mode.</p>
<p>A new Android Studio project already has a <em>theme</em> in <code>ui/theme/Theme.kt</code>, named after the project: <code>HelloTheme</code> in the Hello project from the Android lessons. For a project called Water it is <code>WaterTheme</code>, and <code>setContent</code> wraps your screen in it. Inside, it calls <code>MaterialTheme(colorScheme = ...)</code>. <code>lightColorScheme(primary = Color(0xFF00639B))</code> sets your own colors: <code>Color(0xFF00639B)</code> is a color written as a hex number, as on web pages (<code>FF</code> means fully visible, then red <code>00</code>, green <code>63</code>, blue <code>9B</code>). Roles you leave out keep Material’s default colors.</p>
<p>The colors have <em>roles</em> instead of names like “blue”: <code>primary</code> for the main accent, <code>surface</code> and <code>background</code> for what is behind your content, and <code>onPrimary</code> or <code>onSurface</code> for text drawn on top of them. Material parts like <code>Button</code> and <code>TopAppBar</code> use them on their own. Your own UI reads them: <code>color = MaterialTheme.colorScheme.primary</code>, <code>style = MaterialTheme.typography.headlineSmall</code>. Something must also paint the background: <code>Scaffold</code> and <code>Surface</code> do, and they make plain <code>Text</code> inside them use the matching “on” color.</p>
<p><code>isSystemInDarkTheme()</code> is <code>true</code> when the phone is in dark mode, and the theme then picks the dark set (<code>darkColorScheme</code>). A color written by hand, like <code>Color.Black</code>, never changes. One surprise: the template’s theme has <code>dynamicColor = true</code>, so on Android 12 and newer it takes its colors from the phone’s wallpaper instead of yours. Set it to <code>false</code> in <code>Theme.kt</code> to see your blue.</p>`,
        visual(el) {
          const L = { bg: '#F8F9FF', ink: '#191C20', pri: '#00639B', onPri: '#FFFFFF', fab: '#CEE5FF', onFab: '#001D33' };
          const D = { bg: '#101418', ink: '#E0E2E8', pri: '#94CCFF', onPri: '#003353', fab: '#004A76', onFab: '#CEE5FF' };
          const W = { bg: '#F7FBF1', ink: '#191D17', pri: '#3B6939', onPri: '#FFFFFF', fab: '#BCF0B4', onFab: '#002204' };
          // c: colors, black: add the hand-written line, fixed: that line uses a role, raw: no Scaffold (nothing paints)
          const scr = (c, { black, fixed, raw } = {}) => {
            const bg = raw ? '#FFFFFF' : c.bg, ink = raw ? '#000000' : c.ink;
            return `<div style="flex:1;position:relative;display:flex;flex-direction:column;background:${bg};color:${ink}">${raw ? '' : `<div class="ui-m-bar" style="background:${c.bg};color:${c.ink};border-bottom:1px solid rgba(127,127,127,0.25)">Water</div>`}<div class="ui-m-body"><b style="font-size:1.05rem">3 of 8 glasses</b><span style="color:${c.pri};font-weight:700">Goal: 8</span>${black ? `<span style="color:${fixed ? c.ink : '#000000'}">Best day: 9 glasses</span>` : ''}<span class="ui-m-btn" style="background:${c.pri};color:${c.onPri}">Reset</span></div>${raw ? '' : `<span class="ui-m-fab" style="background:${c.fab};color:${c.onFab}">+</span>`}</div>`;
          };
          Lab.ui.phone(el, {
            logTitle: 'Where the colors come from',
            predict: {
              q: 'One <code>Text</code> uses <code>color = Color.Black</code>. The phone switches to dark mode. What happens to that text?',
              options: ['It stays black, on a dark background', 'It turns white by itself', 'It disappears from the screen'],
              a: 0,
              why: 'A color written by hand never changes. Only colors read from the theme follow dark mode.',
            },
            frames: [
              { screen: scr(L), log: ['isSystemInDarkTheme() = false', 'colorScheme = WaterLight'], say: 'Light mode, inside a Scaffold. The goal uses <code>colorScheme.primary</code>, the Button and the FAB take theme colors by themselves.' },
              { screen: scr(D), log: ['isSystemInDarkTheme() = true', 'colorScheme = WaterDark'], say: 'The user turns on dark mode. The theme swaps the whole color scheme, and the Scaffold paints the dark background. No change to your screen code.' },
              { screen: scr(D, { raw: true }), log: '// same, without Scaffold or Surface', say: 'The same screen as a plain <code>Column</code>, with no Scaffold or Surface. Nothing paints the background, and plain Text stays black. Only the Button follows the theme.' },
              { screen: scr(L, { black: true }), log: '+ Text("Best day: 9 glasses", color = Color.Black)', say: 'Back in the Scaffold. Now add a line with a color written by hand. In light mode it looks fine.' },
              { screen: scr(D, { black: true }), log: 'Color.Black stays black', say: 'In dark mode it stays black on a near-black background: almost invisible.' },
              { screen: scr(D, { black: true, fixed: true }), log: 'color = MaterialTheme.colorScheme.onSurface', say: 'Use a role instead, or leave the color out. <code>onSurface</code> means “text on a surface”: dark in light mode, light in dark mode.' },
              { screen: scr(W, { black: true, fixed: true }), log: ['Android 12+, dynamicColor = true', 'colors from the wallpaper'], say: 'On a phone with a green wallpaper, the template’s <code>dynamicColor = true</code> picks green instead of your blue. Set it to <code>false</code> to use your own colors.' },
            ],
          });
        },
        code: `// ui/theme/Theme.kt (shortened)
private val WaterLight = lightColorScheme(
    primary = Color(0xFF00639B),             // water blue
    primaryContainer = Color(0xFFCEE5FF),    // the FAB's color
)
private val WaterDark = darkColorScheme(
    primary = Color(0xFF94CCFF),
    primaryContainer = Color(0xFF004A76),
)

@Composable
fun WaterTheme(content: @Composable () -> Unit) {   // content: the UI in its braces
    val colors = if (isSystemInDarkTheme()) WaterDark else WaterLight
    MaterialTheme(colorScheme = colors, content = content)
}
// The template's version also has dynamicColor = true, which uses the
// wallpaper's colors on Android 12 and newer. Set it to false.

// In MainActivity
setContent {
    WaterTheme {
        WaterScreen()      // its Scaffold paints the background
    }
}

// In WaterScreen
Text("\${drinks.size} of 8 glasses", style = MaterialTheme.typography.headlineSmall)
Text("Goal: 8", color = MaterialTheme.colorScheme.primary)`,
        remember: 'Read colors and text styles from MaterialTheme, put the screen in a Scaffold or Surface, and dark mode works.',
        mistakes: [
          { title: 'A screen with nothing behind it', bad: `setContent {
    WaterTheme {
        Column {
            Text("3 of 8 glasses")
        }
    }
}
// dark mode: white background, black text`, good: `setContent {
    WaterTheme {
        Surface {
            Column {
                Text("3 of 8 glasses")
            }
        }
    }
}
// dark mode: dark background, light text`, why: 'A <code>Column</code> paints nothing. <code>Surface</code> (or <code>Scaffold</code>) paints the theme’s color and makes the text inside it the matching “on” color.' },
        ],
        terms: [
          { term: 'theme', def: 'The colors and text styles of the whole app, set once with <code>MaterialTheme</code> and read everywhere inside it.' },
          { term: 'color role', def: 'A color named by its job, such as <code>primary</code> or <code>onSurface</code> (“text on a surface”), not by its shade.' },
          { term: 'Surface', def: 'A composable that paints a theme color behind its content and sets the text color to match. <code>Scaffold</code> does the same for a whole screen.' },
          { term: 'dynamic color', def: 'On Android 12 and newer, colors taken from the phone’s wallpaper. The template turns it on with <code>dynamicColor = true</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the counter in the theme’s headline style and the goal in the primary color.', code: `Text("3 of 8 glasses", style = MaterialTheme.[[typography]].headlineSmall)
Text("Goal: 8", color = MaterialTheme.[[colorScheme]].primary)`, why: 'Text styles live in <code>typography</code>, colors in <code>colorScheme</code>.' },
          { type: 'bug', prompt: 'In dark mode one line is almost invisible. Tap it.', code: `Column {
    Text("3 of 8 glasses", style = MaterialTheme.typography.headlineSmall)
    Text("Best day: 9 glasses", color = Color.Black)
    Button(onClick = onReset) { Text("Reset") }
}`, bug: 2, fix: '    Text("Best day: 9 glasses", color = MaterialTheme.colorScheme.onSurface)', why: '<code>Color.Black</code> never changes. <code>onSurface</code> is dark in light mode and light in dark mode.' },
        ],
        quiz: [
          { q: 'You set <code>primary</code> to water blue, but on your Android 14 phone the buttons are green. Why?', options: ['<code>dynamicColor</code> is on, so the colors come from the wallpaper', 'Android 14 can’t show blue', 'The hex number is wrong'], a: 0, why: 'The template turns on dynamic color for Android 12 and newer. Set <code>dynamicColor</code> to <code>false</code> to see your own colors.' },
          { q: 'What is <code>onPrimary</code> for?', options: ['Text and icons drawn on top of the primary color', 'A brighter primary color', 'The color of the top bar only'], a: 0, why: '“On” roles are for content that sits on top of the matching color, so it stays readable.' },
          { q: 'Dark mode is on, but your screen stays white. What is missing?', options: ['A <code>Scaffold</code> or <code>Surface</code> to paint the background', 'A call to <code>isSystemInDarkTheme()</code> in every Text', 'Nothing: screens are always white'], a: 0, why: 'The theme only holds the colors. <code>Scaffold</code> or <code>Surface</code> paints them behind your content.' },
        ],
        docs: [['Material Design 3 in Compose', 'https://developer.android.com/develop/ui/compose/designsystems/material3']],
      },

      {
        id: 'overlays',
        title: 'Dialogs and sheets',
        tagline: 'Ask before resetting, offer choices from the bottom.',
        goals: ['Show an <code>AlertDialog</code> controlled by a Boolean state', 'Close it from its buttons and from <code>onDismissRequest</code>', 'Show a <code>ModalBottomSheet</code> with a few choices'],
        level: 'beginner', introduces: ['AlertDialog', 'onDismissRequest', 'confirmButton', 'dismissButton', 'ModalBottomSheet'],
        body: `
<p>The water screen’s Reset button removes all of today’s drinks, and that can’t be undone. So the app should ask first: “Reset today?” That question appears in a <em>dialog</em>, a small box over the screen. And not every drink is a 250 ml glass: when the user taps the FAB, a <em>bottom sheet</em>, a panel that slides up from the bottom, can offer “Glass, 250 ml” or “Bottle, 500 ml”.</p>
<p>In Compose, a dialog is a composable like any other: it is on screen while you call it. So you control it with a Boolean state, <code>var showDialog by remember { mutableStateOf(false) }</code>, and write <code>if (showDialog) { AlertDialog(...) }</code>. The Reset button sets it to <code>true</code>.</p>
<p><code>AlertDialog</code> has slots for <code>title</code>, <code>text</code>, <code>confirmButton</code> and <code>dismissButton</code>, usually filled with a <code>TextButton</code>. <code>onDismissRequest</code> runs when the user taps outside the dialog or presses Back. Compose never closes the dialog for you: each of these must set <code>showDialog = false</code>.</p>
<p><code>ModalBottomSheet(onDismissRequest = { showSheet = false }) { ... }</code> works the same way. When the user swipes it down or taps outside, it slides away and then calls <code>onDismissRequest</code>. It is marked experimental, so it needs the <code>@OptIn</code> line from the Scaffold lesson.</p>`,
        visual(el) {
          const scr = (rows) => `<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>${rows.length} of 8 glasses</b>${rows.map(t => `<div class="ui-m-row"><div>${t}</div></div>`).join('')}<span class="ui-m-btn ghost rs">Reset</span></div><span class="ui-m-fab">+</span>`;
          const three = ['#1 · 250 ml', '#2 · 500 ml', '#3 · 250 ml'];
          const dialog = `<div class="ui-m-scrim out"><div class="ui-m-dialog"><b>Reset today?</b><span class="ui-m-muted">This removes all of today’s drinks.</span><div style="display:flex;justify-content:flex-end;gap:14px"><span class="cancel" style="color:var(--accent);font-weight:700">Cancel</span><span class="ok" style="color:var(--accent);font-weight:700">Reset</span></div></div></div>`;
          const sheet = `<div class="ui-m-scrim"></div><div class="ui-m-sheet"><b>Add a drink</b><div class="ui-m-row"><div style="color:var(--accent);font-weight:700">Glass, 250 ml</div></div><div class="ui-m-row b500"><div style="color:var(--accent);font-weight:700">Bottle, 500 ml</div></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'State and callbacks',
            predict: {
              q: 'Suppose <code>onDismissRequest = { }</code> is left empty. The user taps outside the dialog. What happens?',
              options: ['The dialog stays open', 'The dialog closes anyway', 'The app crashes'],
              a: 0,
              why: 'The dialog shows while <code>showDialog</code> is true. Only your code can set it back to false.',
            },
            frames: [
              { screen: scr(three), log: 'showDialog = false', say: 'Three drinks so far. The dialog isn’t called, because <code>showDialog</code> is false.' },
              { tap: '.rs', screen: scr(three) + dialog, log: ['Reset onClick → showDialog = true', 'if (showDialog) → AlertDialog(...) is called'], say: 'Reset sets the state to true. The screen recomposes, the <code>if</code> is true, and the dialog appears.' },
              { tap: '.out', screen: scr(three), log: ['tap outside → onDismissRequest()', 'showDialog = false'], say: 'A tap outside calls <code>onDismissRequest</code>. It sets the state to false, so the dialog is no longer called. The drinks are safe.' },
              { tap: '.rs', screen: scr(three) + dialog, log: 'Reset onClick → showDialog = true', say: 'The user taps Reset again.' },
              { tap: '.ok', screen: scr([]), log: ['confirmButton onClick:', 'showDialog = false', 'onReset() → drinks.clear()'], say: 'This time they confirm. The confirm button closes the dialog, then resets the day.' },
              { tap: '.ui-m-fab', screen: scr([]) + sheet, log: 'FAB onClick → showSheet = true', say: 'The FAB now opens a bottom sheet. It follows the same rule: on screen while <code>showSheet</code> is true.' },
              { tap: '.b500', screen: scr(['#4 · 500 ml']), log: ['onPick(500) → drinks.add(...)', 'showSheet = false'], say: 'Picking the bottle adds a 500 ml drink and sets <code>showSheet</code> to false. Swiping the sheet down would call its <code>onDismissRequest</code> instead.' },
            ],
          });
        },
        code: `@Composable
fun ResetButton(onReset: () -> Unit) {
    var showDialog by remember { mutableStateOf(false) }

    OutlinedButton(onClick = { showDialog = true }) { Text("Reset") }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },   // tap outside or Back
            title = { Text("Reset today?") },
            text = { Text("This removes all of today's drinks.") },
            confirmButton = {
                TextButton(onClick = {
                    showDialog = false
                    onReset()
                }) { Text("Reset") }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) { Text("Cancel") }
            },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SizeSheet(onPick: (Int) -> Unit, onDismiss: () -> Unit) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        TextButton(onClick = { onPick(250) }) { Text("Glass, 250 ml") }
        TextButton(onClick = { onPick(500) }) { Text("Bottle, 500 ml") }
    }
}

// In WaterScreen, the FAB sets showSheet = true, and:
// if (showSheet) {
//     SizeSheet(
//         onPick = { ml ->
//             drinks.add(Drink(id = nextId, ml = ml))
//             nextId++
//             showSheet = false
//         },
//         onDismiss = { showSheet = false },
//     )
// }
// ResetButton(onReset = { drinks.clear() })   // clear() empties the list`,
        remember: 'A dialog or sheet is on screen while you call it: if (show) { AlertDialog(...) }, and every way out sets show = false.',
        mistakes: [
          { title: 'Forgetting @OptIn for the sheet', bad: `@Composable
fun SizeSheet(onPick: (Int) -> Unit, onDismiss: () -> Unit) {
    ModalBottomSheet(onDismissRequest = onDismiss) { ... }
}
// error: This material API is experimental and is likely
// to change or to be removed in the future.`, good: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SizeSheet(onPick: (Int) -> Unit, onDismiss: () -> Unit) {
    ModalBottomSheet(onDismissRequest = onDismiss) { ... }
}`, why: 'Experimental parts don’t compile until you accept them with <code>@OptIn</code>. The error text is the warning the Material team wrote.' },
        ],
        terms: [
          { term: 'dialog', def: 'A small box over the screen that asks a question, made with <code>AlertDialog</code>.' },
          { term: 'bottom sheet', def: 'A panel that slides up from the bottom of the screen, made with <code>ModalBottomSheet</code>.' },
          { term: 'onDismissRequest', def: 'Runs when the user tries to close the dialog or sheet without a button: tapping outside, Back, or swiping a sheet down.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the dialog only while the state is true, and close it when the user taps outside.', code: `if ([[showDialog]]) {
    AlertDialog(
        onDismissRequest = { showDialog = [[false]] },
        title = { Text("Reset today?") },
        confirmButton = { TextButton(onClick = onConfirm) { Text("Reset") } },
    )
}`, why: 'The <code>if</code> decides whether the dialog is called. <code>onDismissRequest</code> must set the state back to false.' },
          { type: 'bug', prompt: 'The dialog pops up the moment the screen opens, before anyone taps Reset. Tap the line to change.', code: `@Composable
fun ResetButton(onReset: () -> Unit) {
    var showDialog by remember { mutableStateOf(true) }
    OutlinedButton(onClick = { showDialog = true }) { Text("Reset") }
    if (showDialog) {
        AlertDialog(onDismissRequest = { showDialog = false }, ...)
    }
}`, bug: 2, fix: '    var showDialog by remember { mutableStateOf(false) }', why: 'The state starts as <code>true</code>, so the <code>if</code> calls the dialog straight away. It should start closed.' },
        ],
        quiz: [
          { q: 'How do you close an <code>AlertDialog</code>?', options: ['Set the state that controls it to false', 'Call <code>close()</code> on it', 'Compose closes it after any tap'], a: 0, why: 'It is on screen while the <code>if</code> calls it. Change the state and it is gone.' },
          { q: 'When does <code>onDismissRequest</code> run?', options: ['When the user taps outside or presses Back', 'When the user taps the confirm button', 'When the dialog first appears'], a: 0, why: 'Buttons have their own <code>onClick</code>. <code>onDismissRequest</code> is for the other ways out.' },
          { q: 'Which line must sit above a function that uses <code>ModalBottomSheet</code>?', options: ['<code>@OptIn(ExperimentalMaterial3Api::class)</code>', '<code>@Preview</code>', 'None'], a: 0, why: 'The bottom sheet is marked experimental, so you opt in.' },
        ],
        docs: [['Dialog', 'https://developer.android.com/develop/ui/compose/components/dialog'], ['Bottom sheets', 'https://developer.android.com/develop/ui/compose/components/bottom-sheets']],
      },

      {
        id: 'gestures',
        title: 'Gestures',
        tagline: 'Make anything tappable, and let the user drag it.',
        goals: ['Make any element respond to taps with <code>clickable</code>', 'Follow a finger with <code>draggable</code>', 'Move an element with <code>offset</code>'],
        level: 'beginner', introduces: ['clickable', 'draggable', 'rememberDraggableState', 'Orientation', 'Horizontal', 'offset', 'IntOffset', 'roundToInt', 'Float', 'mutableFloatStateOf'],
        body: `
<p>People expect to tap the big glass picture to add a glass, not only the button. And a drink row should slide to the side when they drag it, to show a Delete button hidden behind it.</p>
<p>A <code>Modifier</code> does more than size and space: it can also add behaviour, like reacting to taps. <code>Modifier.clickable { ... }</code> makes any composable run your lambda when tapped. It also shows the ripple effect (a soft shading that spreads from the finger) and tells screen readers like TalkBack that the element can be tapped. For a real button, still use <code>Button</code>; <code>clickable</code> is for rows, cards and pictures.</p>
<p>For dragging, <code>Modifier.draggable(orientation = Orientation.Horizontal, state = rememberDraggableState { delta -> ... })</code> calls your lambda again and again while the finger moves. <code>delta</code> is how far it moved since the last call, in pixels: positive to the right, negative to the left. A swipe is a quick drag; making the row fly away or snap back when the finger lifts takes extra code.</p>
<p><code>draggable</code> only notices the movement. To move the row, add the distance up in a state and shift the row with <code>Modifier.offset { IntOffset(offsetX.roundToInt(), 0) }</code>: so many pixels to the side, 0 up or down. The distance is a <code>Float</code>, a decimal number like <code>Double</code> but smaller, written <code>0f</code>. <code>roundToInt()</code> turns it into the nearest <code>Int</code> (Android Studio offers its import, <code>kotlin.math.roundToInt</code>), and <code>mutableFloatStateOf(0f)</code> is <code>mutableStateOf</code> made for Floats.</p>`,
        visual(el) {
          const glass = '<svg class="gl" viewBox="0 0 40 48" width="44" height="52" aria-hidden="true" style="color:var(--accent);justify-self:center"><path d="M10.6 22h18.8l-2.1 22H12.7z" fill="var(--accent-soft)"/><path d="M6 4h28l-4 40H10z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>';
          const swipeRow = x => `<div style="position:relative;overflow:hidden"><span style="position:absolute;right:6px;top:50%;transform:translateY(-50%);color:var(--accent);font-weight:700" class="dl">Delete</span><div class="ui-m-row drag" style="background:var(--surface);transform:translateX(${Math.round(x / 2.6)}px);transition:transform 0.3s"><div>#2 · 500 ml</div></div></div>`;
          // a phone has about 2.6 pixels per dp, so the picture moves x / 2.6
          const scr = (n, x, gone) => `<div class="ui-m-bar">Water</div><div class="ui-m-body">${glass}<b style="justify-self:center">${n} of 8 glasses</b><div class="ui-m-row"><div>#1 · 250 ml</div></div>${gone ? '' : swipeRow(x)}${n > 2 || gone ? '<div class="ui-m-row"><div>#3 · 250 ml</div></div>' : ''}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'What your code sees',
            predict: {
              q: 'The user drags the row about 150 pixels to the left and lets go. Where does the row end up?',
              options: ['It stays 150 pixels to the left', 'It springs back to the start', 'It flies off the screen'],
              a: 0,
              why: '<code>offsetX</code> keeps its last value. Springing back would be extra code you write yourself.',
            },
            frames: [
              { screen: scr(2, 0), say: 'A glass picture with <code>clickable</code>, and drink rows with <code>draggable</code> and <code>offset</code>.' },
              { tap: '.gl', screen: scr(3, 0), log: 'clickable → onAdd()', say: 'A tap on the picture runs the <code>clickable</code> lambda, which adds a glass.' },
              { tap: '.drag', screen: scr(3, -48), log: 'delta = -48.0 → offsetX = -48', say: 'The finger starts moving left on drink #2. Each small movement calls the lambda with <code>delta</code>, and <code>offsetX += delta</code>.' },
              { screen: scr(3, -114), log: 'delta = -66.0 → offsetX = -114', say: 'The state changes, and <code>offset</code> moves the row to the new place. Delete starts to show behind it.' },
              { screen: scr(3, -150), log: 'delta = -36.0 → offsetX = -150', say: '-48, -66 and -36 add up to -150: the deltas add up to the full distance.' },
              { screen: scr(3, -150), log: '// finger lifted: no more calls', say: 'The finger lifts. No more calls, so <code>offsetX</code> stays at -150 and the row stays there, with Delete showing.' },
              { tap: '.dl', screen: scr(2, 0, true), log: 'Delete onClick → onDelete()', say: 'Tapping Delete removes drink #2.' },
            ],
          });
        },
        code: `// Tap the picture to add a glass
Image(
    painter = painterResource(R.drawable.glass),
    contentDescription = stringResource(R.string.glass_description),
    modifier = Modifier
        .size(96.dp)
        .clickable { onAdd() },
)

@Composable
fun SwipeDrinkRow(drink: Drink, onDelete: () -> Unit) {
    var offsetX by remember { mutableFloatStateOf(0f) }
    Box(contentAlignment = Alignment.CenterEnd) {               // CenterEnd: middle of the right edge
        TextButton(onClick = onDelete) { Text("Delete") }   // waits behind the row
        Surface(                                              // paints over Delete
            modifier = Modifier
                .fillMaxWidth()
                .offset { IntOffset(offsetX.roundToInt(), 0) }   // move it sideways
                .draggable(
                    orientation = Orientation.Horizontal,
                    state = rememberDraggableState { delta -> offsetX += delta },
                ),
        ) {
            Text("#\${drink.id}: \${drink.ml} ml", modifier = Modifier.padding(16.dp))
        }
    }
}`,
        remember: 'clickable { } for taps on anything; draggable reports how far the finger moved, and offset moves the element.',
        mistakes: [
          { title: 'Dragging, but nothing moves', bad: `var offsetX by remember { mutableFloatStateOf(0f) }
Text(
    "500 ml",
    modifier = Modifier.draggable(
        orientation = Orientation.Horizontal,
        state = rememberDraggableState { delta -> offsetX += delta },
    ),
)
// offsetX changes, but the row stays put`, good: `Text(
    "500 ml",
    modifier = Modifier
        .offset { IntOffset(offsetX.roundToInt(), 0) }
        .draggable(
            orientation = Orientation.Horizontal,
            state = rememberDraggableState { delta -> offsetX += delta },
        ),
)`, why: '<code>draggable</code> only measures the finger. <code>offset</code> is what moves the element on screen.' },
        ],
        terms: [
          { term: 'clickable', def: 'A modifier that runs a lambda when the element is tapped, with a ripple and screen reader support.' },
          { term: 'draggable', def: 'A modifier that reports finger movement in one direction, as <code>delta</code> pixels.' },
          { term: 'offset', def: 'A modifier that shifts an element by a number of pixels, with <code>IntOffset(x, y)</code>.' },
          { term: 'Float', def: 'A decimal number type like <code>Double</code>, but smaller. Written with an <code>f</code>: <code>0f</code>, <code>2.5f</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a glass when the user taps anywhere on the picture.', code: `Image(
    painterResource(R.drawable.glass),
    contentDescription = "A glass of water",
    modifier = Modifier.[[clickable]] { [[onAdd]]() },
)`, why: '<code>clickable</code> works on any composable, including an <code>Image</code>. Its lambda runs on each tap.' },
          { type: 'bug', prompt: 'While dragging, the row jitters near the start instead of following the finger. Tap the line to change.', code: `var offsetX by remember { mutableFloatStateOf(0f) }
Text(
    "500 ml",
    modifier = Modifier
        .offset { IntOffset(offsetX.roundToInt(), 0) }
        .draggable(
            orientation = Orientation.Horizontal,
            state = rememberDraggableState { delta -> offsetX = delta },
        ),
)`, bug: 7, fix: '            state = rememberDraggableState { delta -> offsetX += delta },', why: '<code>delta</code> is only the latest small movement. Add each one with <code>+=</code> to get the full distance.' },
        ],
        quiz: [
          { q: 'What does <code>delta</code> mean in <code>rememberDraggableState { delta -> ... }</code>?', options: ['How far the finger moved since the last call', 'The total distance from the start', 'Whether the finger is down'], a: 0, why: 'It is a small step. Adding them up gives the whole distance.' },
          { q: 'You want a whole card to open its details when tapped. What do you use?', options: ['<code>Modifier.clickable { ... }</code>', '<code>Modifier.draggable(...)</code>', '<code>Modifier.offset { ... }</code>'], a: 0, why: '<code>clickable</code> is for taps. <code>draggable</code> is for movement, <code>offset</code> moves things.' },
          { q: 'What is <code>2.7f.roundToInt()</code>?', options: ['<code>3</code>', '<code>2</code>', '<code>2.7</code>'], a: 0, why: 'It rounds to the nearest whole number, and 2.7 is closer to 3.' },
        ],
        docs: [['Tap and press', 'https://developer.android.com/develop/ui/compose/touch-input/pointer-input/tap-and-press'], ['Drag, swipe, and fling', 'https://developer.android.com/develop/ui/compose/touch-input/pointer-input/drag-swipe-fling']],
      },

      {
        id: 'effects',
        title: 'Side effects',
        tagline: 'Do something when a screen appears, not on every redraw.',
        goals: ['Explain why waiting doesn’t belong in a composable’s body', 'Run code when a composable appears with <code>LaunchedEffect</code>', 'Restart it by changing its key'],
        level: 'intermediate', introduces: ['LaunchedEffect', 'delay'],
        body: `
<p>If an hour goes by without a glass, the water screen should show “Time for a glass of water?”. Each new glass should start the hour again. That needs waiting, and the body of a composable is the wrong place: it runs again on every recomposition, maybe many times a second, and it must finish quickly so the screen can be drawn.</p>
<p>Anything a composable does besides describing the screen, such as waiting, saving or sending a message, is a <em>side effect</em>. <code>LaunchedEffect(key) { ... }</code> runs its block when it first appears on screen, and not again when the screen recomposes. Inside it, <code>delay(5000)</code> waits 5000 milliseconds (5 seconds) without freezing the screen. <code>delay</code> only works in places like this block that are allowed to wait. In Kotlin’s words, a function that can wait is a <code>suspend</code> function, and a place allowed to run one is a <em>coroutine</em>. The block of <code>LaunchedEffect</code> is a coroutine.</p>
<p>The <em>key</em> decides when to start over. When the key changes, the running block is stopped and starts again from the top. So <code>LaunchedEffect(glasses)</code> starts a fresh hour after every glass. When the composable leaves the screen, the block is stopped, so this reminder only runs while the water screen is shown. A key that never changes, such as <code>Unit</code> (<code>Unit</code> is also a value, the only one of its type), means “run once, while this is on screen”.</p>`,
        visual(el) {
          const scr = (n, remind) => `<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>${n} of 8 glasses</b>${remind ? '<div class="ui-m-card"><b>Time for a glass of water?</b></div>' : ''}<span class="ui-m-btn add">Add a glass</span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'LaunchedEffect(glasses)',
            predict: {
              q: 'The block waits 1 hour, then shows the reminder. 40 minutes in, the user adds a glass. When does the reminder show?',
              options: ['1 hour after that glass', '20 minutes after that glass', 'Never'],
              a: 0,
              why: 'Adding a glass changes <code>glasses</code>, the key. The old wait is stopped and a new 1-hour wait starts.',
            },
            frames: [
              { screen: scr(3), log: ['10:00  glasses = 3: block starts', '       delay(3600000)…'], say: 'The screen appears. <code>LaunchedEffect(glasses)</code> starts its block, which waits one hour.' },
              { tap: '.add', screen: scr(4), log: ['10:40  tap: glasses = 4', '       key 3 → 4: old wait stopped', '       block starts again, delay(3600000)…'], say: 'Forty minutes in, the user adds a glass. The key changes, the old wait is stopped, and a fresh hour begins.' },
              { log: '11:00  recomposition: block keeps waiting', say: 'Other state changes and the screen recomposes. The key is still 4, so the block is not restarted.' },
              { screen: scr(4, true), log: '11:40  wait over: showReminder = true', say: 'One hour after the last glass, the block sets <code>showReminder = true</code>, and the reminder appears.' },
              { tap: '.add', screen: scr(5), log: ['11:45  tap: glasses = 5', '       block starts again: showReminder = false'], say: 'A new glass changes the key again. The block starts from the top, hides the reminder and waits another hour.' },
              { screen: '<div class="ui-m-bar">History</div><div class="ui-m-body"><div class="ui-m-row"><div>Mon 19 Oct: 6 glasses</div></div><div class="ui-m-row"><div>Sun 18 Oct: 8 glasses</div></div></div>', log: '11:50  user leaves the screen: block stopped', say: 'The user opens another screen. The water screen leaves, so the block is stopped too. Nothing keeps running in the background.' },
            ],
          });
        },
        code: `@Composable
fun Reminder(glasses: Int) {
    var showReminder by remember { mutableStateOf(false) }

    LaunchedEffect(glasses) {         // starts again after every new glass
        showReminder = false
        delay(3600000)                // wait one hour (3,600,000 ms); the screen keeps working
        showReminder = true
    }

    if (showReminder) {
        Text("Time for a glass of water?")
    }
}

@Composable
fun Tip() {
    var visible by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {            // Unit never changes: run once
        delay(5000)
        visible = false
    }
    if (visible) {
        Text("Tip: drag a drink to the left to delete it")
    }
}`,
        remember: 'LaunchedEffect(key) { ... } runs when it appears, starts over when the key changes, and stops when it leaves the screen.',
        mistakes: [
          { title: 'Waiting in the body', bad: `@Composable
fun Tip() {
    var visible by remember { mutableStateOf(true) }
    delay(5000)
    visible = false
    ...
}
// error: Suspend function 'suspend fun delay(timeMillis: Long): Unit'
// can only be called from a coroutine or another suspend function.`, good: `@Composable
fun Tip() {
    var visible by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) {
        delay(5000)
        visible = false
    }
    ...
}`, why: '<code>delay</code> is a <code>suspend</code> function: it can only run in a coroutine, a place allowed to wait. The block of <code>LaunchedEffect</code> is one; the body of a composable is not.' },
        ],
        terms: [
          { term: 'side effect', def: 'Something a composable does besides describing the screen: waiting, saving, sending.' },
          { term: 'LaunchedEffect', def: 'Runs a block when it appears on screen, starts it over when its key changes, and stops it when it leaves.' },
          { term: 'key (of an effect)', def: 'The value in <code>LaunchedEffect(key)</code>. A new value restarts the block.' },
          { term: 'delay', def: '<code>delay(ms)</code> waits that many milliseconds without freezing the screen. It is a <code>suspend</code> function, so it runs inside a coroutine such as the block of <code>LaunchedEffect</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hide the tip 5 seconds after the screen opens.', code: `var visible by remember { mutableStateOf(true) }
[[LaunchedEffect]](Unit) {
    [[delay]](5000)
    visible = false
}`, why: '<code>LaunchedEffect(Unit)</code> runs once while the screen is shown. <code>delay(5000)</code> waits 5 seconds.' },
          { type: 'bug', prompt: 'The reminder shows one hour after the screen opens, even when the user had a glass five minutes ago. Tap the line to change.', code: `var showReminder by remember { mutableStateOf(false) }
LaunchedEffect(Unit) {
    showReminder = false
    delay(3600000)
    showReminder = true
}`, bug: 1, fix: 'LaunchedEffect(glasses) {', why: 'With <code>Unit</code> the block runs once and never starts over. With <code>glasses</code> as the key, every new glass starts a new hour.' },
        ],
        quiz: [
          { q: 'The screen recomposes because some other state changed. Does a <code>LaunchedEffect(Unit)</code> block start again?', options: ['No', 'Yes, every time', 'Only if it already finished'], a: 0, why: 'Recomposition doesn’t restart it. Only a new key, or leaving and coming back, does.' },
          { q: 'What happens to a running <code>LaunchedEffect</code> block when its key changes?', options: ['It is stopped and starts again from the top', 'It keeps going and a second copy starts', 'Nothing'], a: 0, why: 'One block per effect: the old one is stopped, a new one starts.' },
          { q: 'The user leaves the screen during <code>delay(5000)</code>. What happens to the block?', options: ['It is stopped', 'It finishes the wait in the background', 'The app waits before leaving'], a: 0, why: 'The effect left the screen, so its block is stopped.' },
        ],
        docs: [['Side-effects in Compose', 'https://developer.android.com/develop/ui/compose/side-effects']],
      },

      {
        id: 'disposable-effect',
        title: 'Cleaning up',
        tagline: 'Start listening when a screen appears, stop when it goes.',
        goals: ['Pair a start with a stop using <code>DisposableEffect</code>', 'Put the cleanup in <code>onDispose</code>', 'Predict when the cleanup runs'],
        level: 'intermediate', introduces: ['DisposableEffect', 'onDispose'],
        body: `
<p>Some people track water with a smart bottle that measures each sip. Your app has a <code>SmartBottle</code> class for it: the bottle calls your listener after every sip, like the Observer pattern. The water screen should listen while it is shown. When the user leaves the screen, it must stop listening. Otherwise the bottle keeps calling a screen that is gone, which wastes work and keeps memory busy.</p>
<p>Many things come in pairs like this: add a listener and remove it, start something and stop it. <code>DisposableEffect(key) { ... }</code> is made for pairs. Its block runs when it appears on screen, like <code>LaunchedEffect</code>, and must end with <code>onDispose { ... }</code>: the cleanup.</p>
<p>The cleanup runs when the composable leaves the screen. It also runs when the key changes, just before the block runs again with the new key: stop listening to the old bottle, then start listening to the new one. To <em>dispose</em> of something means to clean it up when you are done with it.</p>`,
        visual(el) {
          const scr = (bottle, msg) => `<div class="ui-m-bar">Water</div><div class="ui-m-body"><div class="ui-m-card"><span class="ui-m-muted">Bottle: ${bottle}</span><b>${msg}</b></div><span><span class="ui-m-chip">Home</span> <span class="ui-m-chip">Office</span></span></div>`;
          Lab.ui.phone(el, {
            logTitle: 'DisposableEffect(bottle)',
            predict: {
              q: 'The user switches from the Home bottle to the Office bottle. What runs first?',
              options: ['The cleanup for Home, then the block for Office', 'The block for Office, and Home keeps its listener', 'Both bottles get a new listener'],
              a: 0,
              why: 'A new key means: clean up the old effect, then start the new one.',
            },
            frames: [
              { screen: scr('Home', 'No sips yet'), log: 'block: home.addListener(listener)', say: 'The water screen appears with the Home bottle. The block adds a listener.' },
              { screen: scr('Home', 'Last sip: 120 ml'), log: 'home calls listener(120)', say: 'A sip is measured. The bottle calls the listener, which sets a state, and the screen shows it.' },
              { screen: scr('Office', 'No sips yet'), log: ['key home → office', 'onDispose: home.removeListener(listener)', 'block: office.addListener(listener)'], say: 'The user switches bottles. The key changed, so the cleanup runs first for Home, then the block runs for Office.' },
              { log: '// home has no listener from this screen now', say: 'Sips from the Home bottle no longer reach this screen. Only Office is heard.' },
              { screen: '<div class="ui-m-bar">History</div><div class="ui-m-body"><div class="ui-m-row"><div>Mon 19 Oct: 6 glasses</div></div><div class="ui-m-row"><div>Sun 18 Oct: 8 glasses</div></div></div>', log: 'leaves screen → onDispose: office.removeListener(listener)', say: 'The user leaves. The cleanup runs one last time. Nothing is left listening.' },
            ],
          });
        },
        code: `// SmartBottle comes from your app: it has a name, addListener and removeListener.
@Composable
fun BottleStatus(bottle: SmartBottle) {
    var lastSip by remember { mutableStateOf(0) }

    DisposableEffect(bottle) {
        val listener: (Int) -> Unit = { ml -> lastSip = ml }
        bottle.addListener(listener)            // start
        onDispose {
            bottle.removeListener(listener)     // stop: screen left, or bottle changed
        }
    }

    Text("\${bottle.name}: last sip $lastSip ml")
}`,
        remember: 'DisposableEffect(key) { start; onDispose { stop } }: the stop runs when the screen leaves or the key changes.',
        mistakes: [
          { title: 'Adding a listener in the body', bad: `@Composable
fun BottleStatus(bottle: SmartBottle) {
    var lastSip by remember { mutableStateOf(0) }
    bottle.addListener { ml -> lastSip = ml }
    Text("Last sip: $lastSip ml")
}
// every recomposition adds one more listener,
// and none is ever removed`, good: `DisposableEffect(bottle) {
    val listener: (Int) -> Unit = { ml -> lastSip = ml }
    bottle.addListener(listener)
    onDispose { bottle.removeListener(listener) }
}`, why: 'The body runs on every recomposition. <code>DisposableEffect</code> adds the listener once and removes it at the right moment.' },
        ],
        terms: [
          { term: 'DisposableEffect', def: 'An effect for start and stop pairs. Its block runs when it appears; <code>onDispose</code> runs when it leaves or its key changes.' },
          { term: 'onDispose', def: 'The cleanup block that must end every <code>DisposableEffect</code>.' },
          { term: 'dispose', def: 'To clean something up when you are done with it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Listen to the bottle while the screen is shown, and stop when it leaves.', code: `[[DisposableEffect]](bottle) {
    bottle.addListener(listener)
    [[onDispose]] {
        bottle.removeListener(listener)
    }
}`, why: '<code>DisposableEffect</code> holds the start; <code>onDispose</code> holds the matching stop.' },
          { type: 'bug', prompt: 'After switching to another bottle and back, each sip from the first bottle shows up three times. Tap the wrong line.', code: `DisposableEffect(bottle) {
    bottle.addListener(listener)
    onDispose {
        bottle.addListener(listener)
    }
}`, bug: 3, fix: '        bottle.removeListener(listener)', why: 'The cleanup must undo the start. Adding again in <code>onDispose</code> piles up listeners: the first bottle gets one at the start, one more when you switch away, and a third when you come back.' },
        ],
        quiz: [
          { q: 'When does <code>onDispose</code> run?', options: ['When the composable leaves the screen, or the key changes', 'Every time the screen recomposes', 'Only when the app closes'], a: 0, why: 'Those are the two moments when the old effect is no longer wanted.' },
          { q: 'Which job fits <code>DisposableEffect</code> better than <code>LaunchedEffect</code>?', options: ['Add a listener now and remove it later', 'Wait 5 seconds, then hide a tip', 'Show a dialog'], a: 0, why: 'It is made for start and stop pairs. Waiting belongs in <code>LaunchedEffect</code>.' },
          { q: 'The user switches from the Home bottle to the Office bottle. How many listeners from this screen does the Home bottle have afterwards?', options: ['None', 'One', 'Two'], a: 0, why: 'The key changed, so <code>onDispose</code> removed the Home listener before the block added one to Office.' },
        ],
        docs: [['DisposableEffect', 'https://developer.android.com/develop/ui/compose/side-effects']],
      },

      {
        id: 'snapshot-flow',
        title: 'Watching state over time',
        tagline: 'React each time a state changes, even one your code doesn’t change.',
        goals: ['Read a list’s scroll position with <code>rememberLazyListState</code>', 'Turn state changes into a stream of values with <code>snapshotFlow</code>', 'Handle each new value with <code>collect</code>'],
        level: 'intermediate', introduces: ['snapshotFlow', 'collect', 'rememberLazyListState', 'firstVisibleItemIndex', 'initialFirstVisibleItemIndex'],
        body: `
<p>The History list grows long. A user scrolls back to look at last month, leaves, and next time History should open at the same place. But the list scrolls by itself when the user swipes; there is no <code>onClick</code> where you could save the position.</p>
<p>First, get hold of the scroll position. <code>val listState = rememberLazyListState()</code> creates the list’s state, and <code>LazyColumn(state = listState)</code> uses it. <code>listState.firstVisibleItemIndex</code> is the index of the row at the top of the screen. To open at a saved place, pass it in: <code>rememberLazyListState(initialFirstVisibleItemIndex = lastSeen)</code>.</p>
<p><code>snapshotFlow { listState.firstVisibleItemIndex }</code> watches the state read inside its braces. Every time the result changes, it hands out the new value, so you get a <em>flow</em>: a stream of values that arrive one by one over time. If the value is the same as last time, it hands out nothing.</p>
<p><code>.collect { index -> saveLastSeen(index) }</code> runs its lambda for every value that arrives, and then keeps waiting for the next. Because it waits for as long as the screen is shown, it goes inside <code>LaunchedEffect(listState)</code>, which stops it when the screen leaves.</p>`,
        visual(el) {
          const days = ['Mon 19 Oct', 'Sun 18 Oct', 'Sat 17 Oct', 'Fri 16 Oct', 'Thu 15 Oct', 'Wed 14 Oct', 'Tue 13 Oct', 'Mon 12 Oct'];
          const scr = (top, nudge) => `<div class="ui-m-bar">History</div><div class="ui-m-body">${days.slice(top, top + 5).map((p, i) => `<div class="ui-m-row" style="${i === 0 && nudge ? 'padding-top:0' : ''}"><span class="ui-m-chip">${top + i}</span><div>${p}</div></div>`).join('')}</div>`;
          Lab.ui.phone(el, {
            logTitle: 'snapshotFlow → collect',
            predict: {
              q: 'The user scrolls a little, but row 2 is still the top row. Does <code>saveLastSeen</code> run again?',
              options: ['No, the value didn’t change', 'Yes, on every scroll', 'Yes, but with the old value'],
              a: 0,
              why: '<code>snapshotFlow</code> hands out a value only when the result is different from the last one.',
            },
            frames: [
              { screen: scr(0), log: ['LaunchedEffect starts', 'value 0 → saveLastSeen(0)'], say: 'History opens. <code>collect</code> gets the first value, 0, and saves it. Then it waits.' },
              { screen: scr(2), log: 'value 2 → saveLastSeen(2)', say: 'The user scrolls. The top row is now index 2. A new value arrives and is saved.' },
              { screen: scr(2, true), log: '// still 2: nothing handed out', say: 'A small scroll, but the top row is still index 2. Same value, so <code>collect</code> doesn’t run.' },
              { screen: scr(3), log: 'value 3 → saveLastSeen(3)', say: 'Row 3 reaches the top: a new value.' },
              { screen: scr(1), log: 'value 1 → saveLastSeen(1)', say: 'Scrolling back up works the same: every change of the top row arrives.' },
              { screen: '<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>3 of 8 glasses</b><div class="ui-m-row"><div>#1 · 250 ml</div></div></div>', log: 'leaves screen → LaunchedEffect stopped, collect stopped', say: 'The user goes back to the water screen. <code>LaunchedEffect</code> is stopped, and with it the waiting <code>collect</code>. The last saved index is 1.' },
            ],
          });
        },
        code: `@Composable
fun HistoryList(days: List<String>, lastSeen: Int, saveLastSeen: (Int) -> Unit) {
    val listState = rememberLazyListState(initialFirstVisibleItemIndex = lastSeen)

    LaunchedEffect(listState) {
        snapshotFlow { listState.firstVisibleItemIndex }   // watch the top row
            .collect { index -> saveLastSeen(index) }      // runs for each new value
    }

    LazyColumn(state = listState) {
        items(days) { day -> Text(day, modifier = Modifier.padding(16.dp)) }
    }
}`,
        remember: 'snapshotFlow { state } hands out a new value each time the state changes; collect { } handles each one, inside LaunchedEffect.',
        terms: [
          { term: 'snapshotFlow', def: 'Watches the state read inside its braces and hands out a new value each time the result changes.' },
          { term: 'flow', def: 'A stream of values that arrive one by one over time.' },
          { term: 'collect', def: 'Runs a lambda for every value of a flow, and keeps waiting for more. Lives inside <code>LaunchedEffect</code>.' },
          { term: 'firstVisibleItemIndex', def: 'On a list state: the index of the row at the top of the screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Save the top row’s index every time it changes.', code: `LaunchedEffect(listState) {
    [[snapshotFlow]] { listState.firstVisibleItemIndex }
        .[[collect]] { index -> saveLastSeen(index) }
}`, why: '<code>snapshotFlow</code> turns the changing state into values; <code>collect</code> handles each one.' },
          { type: 'bug', prompt: 'The app saves 0 once and never again, however far the user scrolls. Tap the wrong line.', code: `val listState = rememberLazyListState()
val top = listState.firstVisibleItemIndex
LaunchedEffect(listState) {
    snapshotFlow { top }
        .collect { index -> saveLastSeen(index) }
}`, bug: 3, fix: '    snapshotFlow { listState.firstVisibleItemIndex }', why: '<code>top</code> is a plain <code>Int</code> copied once. <code>snapshotFlow</code> only notices state read inside its braces, so read <code>listState</code> there.' },
        ],
        quiz: [
          { q: 'The top row stays index 4 while the user scrolls a little. How many new values does <code>snapshotFlow</code> hand out?', options: ['None', 'One per scroll movement', 'One per second'], a: 0, why: 'It hands out a value only when the result is different from the previous one.' },
          { q: 'Why does the <code>collect</code> go inside <code>LaunchedEffect</code>?', options: ['It keeps waiting for values, and must stop when the screen leaves', 'So it runs only once', 'It doesn’t need to'], a: 0, why: '<code>LaunchedEffect</code> is the place that may wait, and it stops when the screen goes. <code>collect</code> runs for every new value, not once.' },
          { q: 'What is <code>listState.firstVisibleItemIndex</code>?', options: ['The index of the row at the top of the screen', 'How many rows the list has', 'The last row the user tapped'], a: 0, why: 'It changes as the user scrolls, which is why it is worth watching.' },
        ],
        docs: [['Side-effects in Compose', 'https://developer.android.com/develop/ui/compose/side-effects'], ['Lists and grids', 'https://developer.android.com/develop/ui/compose/lists']],
      },

      {
        id: 'navigation',
        title: 'Moving between screens',
        tagline: 'One Activity, many screens, and a back stack that Compose keeps for you.',
        goals: ['Describe screens as routes with <code>@Serializable</code>', 'Set up a <code>NavHost</code> and move with <code>navigate</code>', 'Pass a value to the next screen and read it with <code>toRoute</code>'],
        level: 'beginner', introduces: ['Serializable', 'NavHost', 'rememberNavController', 'startDestination', 'composable', 'navigate', 'popBackStack', 'toRoute'],
        body: `
<p>The water tracker now has two screens: Today, with the counter and today’s drinks, and History, with the long list of past days. The History button on Today should open History; Back should return. In a Compose app each screen is a composable, all inside one Activity, and the <em>Navigation Compose</em> library switches between them and keeps a back stack, like the one you saw for Activities.</p>
<p>Each screen gets a <em>route</em>: a small type that names it. <code>@Serializable object Today</code> is a route without data. <code>@Serializable data class History(val goal: Int)</code> is a route that carries the daily goal, so History can mark the days that reached it. <code>@Serializable</code> lets Navigation store a route with its data and restore it, after rotation too. It needs two lines in the app’s <code>build.gradle.kts</code>, shown at the end of the code: the Kotlin serialization plugin and the <code>navigation-compose</code> library.</p>
<p><code>val navController = rememberNavController()</code> makes the object that moves between screens. <code>NavHost(navController, startDestination = Today) { ... }</code> shows the current screen; inside it, <code>composable&lt;Today&gt; { ... }</code> says what to show for each route. <code>navController.navigate(History(goal = 8))</code> puts History on top of the stack. The Back gesture removes it again, and so does <code>navController.popBackStack()</code> from your code.</p>
<p>On the History screen, <code>entry.toRoute()</code> gives back the route with its data, so you can read <code>goal</code>. Screens don’t get the <code>navController</code> itself: pass them a lambda like <code>onOpenHistory</code>, as you did when hoisting state. Google also makes a newer library, Navigation 3, in which the back stack is a list you change yourself; the Compose navigation guide recommends Navigation Compose for Compose apps, and many existing apps use it.</p>`,
        visual(el) {
          const today = '<div class="ui-m-bar">Water</div><div class="ui-m-body"><b>3 of 8 glasses</b><div class="ui-m-row"><div>#1 · 250 ml</div></div><div class="ui-m-row"><div>#2 · 500 ml</div></div><span class="hist" style="justify-self:start;padding:6px 12px;font-weight:700;font-size:0.8rem;color:var(--accent)">History</span></div><span class="ui-m-fab">+</span>';
          const history = '<div class="ui-m-bar">← History</div><div class="ui-m-body"><span class="ui-m-muted">Goal: 8 glasses</span><div class="ui-m-row"><div>Mon 19 Oct: 6</div></div><div class="ui-m-row"><div>Sun 18 Oct: 8 ✓</div></div><div class="ui-m-row"><div>Sat 17 Oct: 5</div></div><div class="ui-m-row"><div>Fri 16 Oct: 9 ✓</div></div></div>';
          Lab.ui.phone(el, {
            logTitle: 'Back stack (top last)',
            predict: {
              q: 'The user opens History, then makes the Back gesture. What do they see?',
              options: ['The Today screen', 'The phone’s home screen', 'History again'],
              a: 0,
              why: 'Back removes the top screen from the stack, which shows the one below: Today.',
            },
            frames: [
              { screen: today, log: 'stack: [Today]', say: 'The app starts on <code>startDestination = Today</code>. The back stack holds one screen.' },
              { tap: '.hist', log: 'onOpenHistory(8) → navController.navigate(History(goal = 8))', say: 'The user taps History. The Today screen calls <code>onOpenHistory(8)</code>, and the NavHost code navigates.' },
              { screen: history, log: 'stack: [Today, History(goal=8)]', say: 'History goes on top. Its <code>composable&lt;History&gt;</code> reads the goal with <code>toRoute()</code> and marks the days that reached 8.' },
              { screen: today, log: ['Back gesture → pop', 'stack: [Today]'], say: 'Back pops History off the stack. Today is shown again, with its drinks as they were.' },
              { screen: '<div class="ui-m-center"><span class="ui-m-muted">Home screen</span></div>', log: ['Back gesture on the start screen', 'nothing to pop → Android handles Back'], say: 'On the start screen there is nothing left to pop, so Navigation lets Android handle Back: the user leaves the app and sees the home screen.' },
            ],
          });
        },
        code: `@Serializable object Today
@Serializable data class History(val goal: Int)

@Composable
fun WaterApp() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = Today) {
        composable<Today> {
            WaterScreen(onOpenHistory = { goal -> navController.navigate(History(goal)) })
        }
        composable<History> { entry ->
            val route: History = entry.toRoute()
            HistoryScreen(goal = route.goal, onBack = { navController.popBackStack() })
        }
    }
}

// app/build.gradle.kts (the navigation-compose line is from its release page):
// plugins {
//     kotlin("plugin.serialization") version "2.4.21"   // your project's Kotlin version
// }
// dependencies {
//     implementation("androidx.navigation:navigation-compose:2.10.2")
// }`,
        remember: 'Routes are @Serializable types; NavHost maps each route to a screen; navigate(route) pushes, Back or popBackStack() pops.',
        mistakes: [
          { title: 'Handing the navController to a screen', bad: `@Composable
fun WaterScreen(navController: NavController) {
    ...
    navController.navigate(History(goal))
}`, good: `@Composable
fun WaterScreen(onOpenHistory: (Int) -> Unit) {
    ...
    onOpenHistory(goal)
}`, why: 'A screen that only reports “open History” is easier to preview and reuse. The NavHost decides where that leads. The Navigation guide warns against passing the controller.' },
        ],
        terms: [
          { term: 'route', def: 'A type that names a screen, and may carry its data, like <code>History(val goal: Int)</code>.' },
          { term: 'NavHost', def: 'Shows the screen for the current route. Each <code>composable&lt;Route&gt; { }</code> inside it says what to show.' },
          { term: 'navigate', def: '<code>navController.navigate(route)</code> puts that route’s screen on top of the back stack.' },
          { term: '@Serializable', def: 'Marks a class or object so it can be stored and restored. Navigation needs it on every route.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start on Today, and show the water screen for its route.', code: `NavHost(navController, [[startDestination]] = Today) {
    [[composable]]<Today> {
        WaterScreen(onOpenHistory = { goal -> navController.navigate(History(goal)) })
    }
}`, why: '<code>startDestination</code> is the first screen. <code>composable&lt;Today&gt;</code> says what to show for that route.' },
          { type: 'bug', prompt: 'Tapping History should open the history, but the Today screen opens again on top of itself. Tap the wrong line.', code: `NavHost(navController, startDestination = Today) {
    composable<Today> {
        WaterScreen(onOpenHistory = { goal -> navController.navigate(Today) })
    }
    composable<History> { entry ->
        HistoryScreen(goal = entry.toRoute<History>().goal)
    }
}`, bug: 2, fix: '        WaterScreen(onOpenHistory = { goal -> navController.navigate(History(goal)) })', why: 'The route decides which screen opens. <code>History(goal)</code> opens History and carries the goal.' },
        ],
        quiz: [
          { q: 'What does <code>navController.navigate(History(goal = 6))</code> do?', options: ['Puts the History screen, with goal 6, on top of the back stack', 'Replaces the whole app with a new Activity', 'Sets today’s goal to 6'], a: 0, why: 'Navigate pushes a screen. Back pops it.' },
          { q: 'Which route should carry data?', options: ['<code>@Serializable data class History(val goal: Int)</code>', '<code>@Serializable object History</code>', 'Neither can'], a: 0, why: 'A data class has properties for the data. An <code>object</code> is for screens that need none.' },
          { q: 'The user makes the Back gesture on the start screen. What happens?', options: ['They leave the app', 'Nothing', 'The start screen opens again'], a: 0, why: 'There is nothing left to pop, so Back leaves the app, as on any app’s first screen.' },
        ],
        docs: [['Navigation with Compose', 'https://developer.android.com/develop/ui/compose/navigation'], ['Design your navigation graph', 'https://developer.android.com/guide/navigation/design']],
      },
    ],
  });
})();
