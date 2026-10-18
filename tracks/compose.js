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
        deeper: [
          {
            title: 'The smallest scope that read the state',
            body: `<p>Compose never reruns "the screen". It reruns the nearest <em>restart scope</em> that read the state. Every non-inline composable function is a restart scope, and so is every composable lambda.</p>
<p><code>Column</code>, <code>Row</code> and <code>Box</code> are <code>inline</code> functions, so their content lambdas are not scopes of their own. A read inside them belongs to the function around them. The content lambda of <code>Button</code> is a normal composable lambda, so a read there reruns only that lambda.</p>`,
            code: `@Composable
fun Screen() {
    var count by remember { mutableIntStateOf(0) }
    Column {                                    // inline: part of Screen's scope
        Header()
        Button(onClick = { count++ }) {
            Text("Clicked $count times")        // read here: only this lambda reruns
        }
    }
}`,
            visual(el) {
              const OPTS = [
                { src: 'val label = "Clicked $count"   // in Screen()', at: 'screen', note: 'The read sits in the Screen body, so Screen is the scope.' },
                { src: 'Column { val label = "Clicked $count" }', at: 'column', note: 'Column is inline. The read still belongs to Screen.' },
                { src: 'Button(onClick) { Text("Clicked $count") }', at: 'button', note: 'The Button content lambda is its own scope.' },
              ];
              let opt = OPTS[0], count = 0, busy = false;
              const mk = (label, kind) => {
                const badge = h('span', { class: 'cmp-badge', title: 'Times this has run' }, '1');
                const status = h('span', { class: 'cmp-status' }, kind);
                const read = h('span', { class: 'cmp-rs-read', hidden: true }, 'reads count');
                return { runs: 1, kind, badge, status, read, el: h('div', { class: 'cmp-node' }, h('span', { class: 'cmp-node-label' }, label), read, status, badge) };
              };
              const N = {
                screen: mk('Screen()', 'scope'),
                column: mk('Column { }', 'inline, no scope'),
                header: mk('Header()', 'scope'),
                button: mk('Button(onClick) { }', 'content lambda is a scope'),
                text: mk('Text(label)', 'scope'),
              };
              const o = out();
              const btns = OPTS.map(x => cmd(x.src, () => pick(x)));
              function pick(x) {
                if (busy) return;
                opt = x;
                btns.forEach((b, i) => b.setAttribute('aria-pressed', String(OPTS[i] === x)));
                Object.entries(N).forEach(([k, n]) => { n.read.hidden = k !== x.at; n.el.classList.remove('cmp-hit', 'cmp-skip'); n.status.textContent = n.kind; });
                replay(N[x.at].read, 'pop');
                say(o, `${esc(x.note)} <span class="muted">// press count++</span>`);
              }
              async function bump() {
                if (busy) return; busy = true;
                count++;
                Object.values(N).forEach(n => { n.el.classList.remove('cmp-hit', 'cmp-skip'); n.status.textContent = n.kind; });
                const ran = opt.at === 'button' ? ['button', 'text'] : ['screen', 'column', 'header', 'button', 'text'];
                say(o, `${hl(`count = ${count}`)} <span class="muted">// invalidates the scope that read it</span>`);
                for (const k of ['screen', 'column', 'header', 'button', 'text']) {
                  await sleep(300);
                  if (!el.isConnected) return;
                  const n = N[k];
                  if (!ran.includes(k)) { n.status.textContent = 'not visited'; n.el.classList.add('cmp-skip'); continue; }
                  if (k === 'header') { n.status.textContent = 'skipped, no inputs changed'; n.el.classList.add('cmp-skip'); continue; }
                  n.runs++; n.badge.textContent = n.runs; replay(n.badge, 'pop');
                  n.status.textContent = k === 'column' ? 'ran as part of Screen' : 'ran';
                  n.el.classList.add('cmp-hit'); replay(n.el, 'cmp-flash');
                }
                const hits = Object.values(N).filter(n => n.el.classList.contains('cmp-hit')).length;
                say(o, opt.at === 'button'
                  ? `<span class="good">${hits} of 5 ran.</span> Only the Button content lambda and its Text. Screen was never called.`
                  : `<span class="bad">${hits} of 5 ran.</span> Screen reran, so its Column body did too. Header skipped.`);
                busy = false;
              }
              el.append(
                h('div', { class: 'cmp-tree' }, N.screen.el,
                  h('div', { class: 'cmp-kids' }, N.column.el,
                    h('div', { class: 'cmp-kids' }, N.header.el, N.button.el, h('div', { class: 'cmp-kids' }, N.text.el)))),
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'controls' }, cmd('count++', bump)),
                o);
              pick(OPTS[0]);
            },
          },
          {
            title: 'Writes wait for the next frame',
            body: `<p>Writing a State value does not run anything right away. Compose marks the scopes that read it as invalid. Just before the next frame, the Recomposer reruns each invalid scope once, with the latest values.</p>
<p>So three writes in one click handler cost one recomposition, not three. Code in the same handler still sees the new value at once. Only the UI waits.</p>`,
            code: `Button(onClick = {
    likes++
    likes++
    likes++
    println(likes)   // already 3 here
}) { Text("Like x3") }
// LikeCount(likes) runs once, on the next frame, with 3`,
            visual(el) {
              let likes = 0, recomps = 0, busy = false;
              const writes = h('div', { class: 'cmp-rs-chips' });
              const frame = h('div', { class: 'cmp-rs-chips' }, h('span', { class: 'cmp-status' }, 'waiting'));
              const rc = h('span', { class: 'cmp-badge' }, '0');
              const shown = h('p', { class: 'cmp-pv-name' }, '0 likes');
              const o = out('Each click writes likes. Watch when LikeCount actually runs.');
              async function click(n, src) {
                if (busy) return; busy = true;
                writes.replaceChildren();
                frame.replaceChildren(h('span', { class: 'cmp-status' }, 'waiting'));
                say(o, `${hl(src)} <span class="muted">// writes happen now</span>`);
                for (let i = 0; i < n; i++) {
                  likes++;
                  writes.append(h('span', { class: 'cmp-obj cmp-new drop-in' }, `likes = ${likes}`));
                  await sleep(280);
                  if (!el.isConnected) return;
                }
                say(o, `${n} write${n > 1 ? 's' : ''} done. LikeCount is marked invalid. Nothing has run yet.`);
                await sleep(700);
                if (!el.isConnected) return;
                frame.replaceChildren(h('span', { class: 'cmp-obj cmp-reuse drop-in' }, `LikeCount(likes = ${likes})`));
                recomps++; rc.textContent = recomps; replay(rc, 'pop');
                shown.textContent = `${likes} like${likes === 1 ? '' : 's'}`; replay(shown, 'cmp-flash');
                say(o, `Next frame: ${n} write${n > 1 ? 's' : ''}, <span class="good">1 recomposition</span> with the latest value.`);
                busy = false;
              }
              el.append(
                h('div', { class: 'cmp-split' },
                  h('div', { class: 'cmp-rs-lanes' },
                    h('div', { class: 'cmp-rs-lane' }, h('span', { class: 'cmp-fx-name' }, 'in onClick'), writes),
                    h('div', { class: 'cmp-rs-lane' }, h('span', { class: 'cmp-fx-name' }, 'next frame'), frame),
                    h('div', { class: 'cmp-rs-lane' }, h('span', { class: 'cmp-fx-name' }, 'recompositions'), h('div', { class: 'cmp-rs-chips' }, rc))),
                  h('div', { class: 'phone cmp-rs-phone', role: 'img', 'aria-label': 'Like count preview' }, shown)),
                h('div', { class: 'controls' },
                  cmd('onClick = { likes++ }', () => click(1, 'likes++')),
                  cmd('onClick = { repeat(3) { likes++ } }', () => click(3, 'repeat(3) { likes++ }'))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>The Compose compiler plugin rewrites every <code>@Composable</code> function. It adds hidden parameters: a <code>Composer</code> that records what the function emits, and a <code>$changed</code> bit mask where the caller says which arguments it already knows are the same or different.</p>
<p>The body is wrapped in a <em>restart group</em>. If no argument changed and the composer allows skipping, the function jumps to the end of its group and its body never runs. At the end, it registers a lambda that calls the same function again with the same arguments. That lambda is the restart scope. When a State read inside it is invalidated, the Recomposer calls it on the next frame. The code below is simplified. The real output has more bookkeeping.</p>`,
          code: `// You write
@Composable
fun LikeCount(likes: Int) {
    Text("$likes likes")
}

// The compiler produces roughly this (simplified)
fun LikeCount(likes: Int, $composer: Composer, $changed: Int) {
    val composer = $composer.startRestartGroup(/* source key */ 0x5a1c)
    val likesChanged = /* bits in $changed, else */ composer.changed(likes)
    if (likesChanged || !composer.skipping) {
        Text("$likes likes", composer, 0)
    } else {
        composer.skipToGroupEnd()           // skipped: the body never runs
    }
    composer.endRestartGroup()?.updateScope { nextComposer, _ ->
        LikeCount(likes, nextComposer, $changed or 1)   // the restart scope
    }
}`,
        },
        mistakes: [
          {
            title: 'Heavy work in the body',
            bad: `@Composable
fun Contacts(contacts: List<Contact>) {
    val sorted = contacts.sortedBy { it.name }   // every recomposition
    LazyColumn {
        items(sorted, key = { it.id }) { ContactRow(it) }
    }
}`,
            good: `@Composable
fun Contacts(contacts: List<Contact>) {
    val sorted = remember(contacts) { contacts.sortedBy { it.name } }
    LazyColumn {
        items(sorted, key = { it.id }) { ContactRow(it) }
    }
}`,
            why: 'A composable can run on every frame of an animation. Cache derived data with <code>remember</code> keyed on its input, or better, prepare it in the ViewModel.',
          },
          {
            title: 'Writing state during composition',
            bad: `@Composable
fun Cart(items: List<Item>, vm: CartViewModel) {
    vm.total = items.sumOf { it.price }   // State write in the body
    Text("Total: \${vm.total}")
}`,
            good: `@Composable
fun Cart(items: List<Item>) {
    val total = items.sumOf { it.price }  // a plain local value
    Text("Total: $total")
}`,
            why: 'Composition should only read state. Writing a State that the same composition reads invalidates it again, which can loop and recompose on every frame.',
          },
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
        predict: {
          q: 'You change <code>name</code> from "Ada" to "Grace". Which composables run again?',
          options: ['All five', '<code>ProfileScreen</code> and <code>NameText</code>', 'Only <code>NameText</code>'],
          a: 1,
          why: '<code>ProfileScreen</code> reads <code>name</code>, so it runs again, and <code>NameText</code> gets a new parameter. The other three get equal inputs and are skipped.',
        },
      },

      // 2 ─────────────────────────────────────────────
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
        deeper: [
          {
            title: 'The first size wins',
            body: `<p>Layout modifiers pass <em>constraints</em> down the chain. Each one gets a min and max size from the modifier before it, and it has to answer with a size that fits. <code>size(100.dp)</code> sets the constraints to exactly 100 dp. A later <code>size(50.dp)</code> must fit inside those, so it is coerced up to 100.</p>
<p><code>requiredSize</code> ignores the incoming constraints. The content takes the size it asked for, the parent still sees the size it allowed, and Compose centers the content in that space. If the content is bigger, it spills over its neighbors.</p>`,
            code: `Box(Modifier.size(100.dp).size(50.dp))          // 100 dp: the first size wins
Box(Modifier.size(100.dp).requiredSize(50.dp))  // 50 dp content, centered in 100 dp
Box(Modifier.size(50.dp).requiredSize(100.dp))  // parent sees 50 dp, content draws 100 dp`,
            visual(el) {
              const CASES = [
                { src: '.size(100.dp).size(50.dp)', slot: 100, box: 100, note: 'The first size fixes the constraints at 100 dp. The second size must fit them, so it becomes 100.' },
                { src: '.size(50.dp).size(100.dp)', slot: 50, box: 50, note: 'Same rule the other way round. The first size wins, so the box is 50 dp.' },
                { src: '.size(100.dp).requiredSize(50.dp)', slot: 100, box: 50, note: 'requiredSize ignores the constraints. 50 dp of content, centered in the 100 dp slot.' },
                { src: '.size(50.dp).requiredSize(100.dp)', slot: 50, box: 100, note: 'The parent reserves 50 dp. The content insists on 100 and draws over A and C.' },
              ];
              const content = h('div', { class: 'cmp-d2m-box' }, 'B');
              const slotEl = h('div', { class: 'cmp-d2m-slot' }, content);
              const row = h('div', { class: 'cmp-d2m-row', role: 'img', 'aria-label': 'Row with A, B and C' },
                h('div', { class: 'cmp-d2m-nb' }, 'A'), slotEl, h('div', { class: 'cmp-d2m-nb' }, 'C'));
              const sizes = h('div', { class: 'cmp-d2m-sizes' });
              const o = out();
              const btns = CASES.map(c => cmd(`B(Modifier${c.src})`, () => pick(c)));
              function pick(c) {
                btns.forEach((b, i) => b.setAttribute('aria-pressed', String(CASES[i] === c)));
                slotEl.style.width = slotEl.style.height = `${c.slot}px`;
                const off = (c.slot - c.box) / 2;
                Object.assign(content.style, { width: `${c.box}px`, height: `${c.box}px`, left: `${off}px`, top: `${off}px` });
                content.classList.toggle('cmp-d2m-spill', c.box > c.slot);
                sizes.innerHTML = `<span><i class="cmp-d2m-k1"></i>parent sees ${c.slot} × ${c.slot} dp</span><span><i class="cmp-d2m-k2"></i>content draws ${c.box} × ${c.box} dp</span>`;
                replay(content, 'pop-soft');
                say(o, esc(c.note));
              }
              el.append(row, sizes, h('div', { class: 'controls' }, btns), o);
              pick(CASES[0]);
            },
          },
          {
            title: 'Take a modifier, apply it first',
            body: `<p>Every reusable composable should take <code>modifier: Modifier = Modifier</code> as its first optional parameter and apply it to its root, before its own modifiers. The caller then controls the outside: spacing, size, weight and clicks. Your component controls the inside.</p>
<p>If you add the caller’s modifier at the end with <code>.then(modifier)</code>, its padding lands inside your background. If you ignore it, the caller can’t place your component at all.</p>`,
            code: `@Composable
fun Tag(text: String, modifier: Modifier = Modifier) {
    Text(
        text,
        modifier                                  // the caller's part goes outside
            .background(MaterialTheme.colorScheme.primaryContainer, CircleShape)
            .padding(horizontal = 12.dp, vertical = 4.dp),
    )
}

Tag("New", Modifier.padding(end = 8.dp))      // spacing between tags`,
            visual(el) {
              const IMPL = [
                { src: 'Text(text, modifier.background(…).padding(…))', at: 'first', note: '<span class="good">Right.</span> The caller’s padding is outside the pill, so it spaces the tags apart.' },
                { src: 'Text(text, Modifier.background(…).padding(…).then(modifier))', at: 'last', note: '<span class="bad">Wrong place.</span> The caller’s padding ends up inside the pill. The tags get fatter and still touch.' },
                { src: 'Text(text, Modifier.background(…).padding(…))', at: 'none', note: '<span class="bad">Ignored.</span> The caller passed padding and nothing happened. There is no way to fix it from outside.' },
              ];
              const strip = h('div', { class: 'cmp-d2m-strip', role: 'img', 'aria-label': 'Three tags in a row' });
              const call = h('div', { class: 'kt' });
              const o = out();
              const btns = IMPL.map(x => cmd(x.src, () => pick(x)));
              function tag(label, at) {
                const pill = h('span', { class: 'cmp-d2m-pill' }, label);
                if (at === 'last') pill.classList.add('cmp-d2m-fat');
                return h('span', { class: `cmp-d2m-outer${at === 'first' ? ' cmp-d2m-gap' : ''}` }, pill);
              }
              function pick(x) {
                btns.forEach((b, i) => b.setAttribute('aria-pressed', String(IMPL[i] === x)));
                strip.replaceChildren(...['New', 'Sale', 'Hot'].map(t => tag(t, x.at)));
                strip.querySelectorAll('.cmp-d2m-pill').forEach(p => replay(p, 'pop-soft'));
                say(o, x.note);
              }
              call.innerHTML = hl('// the caller, the same in all three cases\nTag("New", Modifier.padding(end = 8.dp))');
              el.append(call, strip, h('div', { class: 'controls' }, btns), o);
              pick(IMPL[0]);
            },
          },
        ],
        underHood: {
          body: `<p>A <code>Modifier</code> is an immutable chain. Each call like <code>.padding(16.dp)</code> returns <code>this then PaddingElement(...)</code>. <code>then</code> builds a <code>CombinedModifier(outer, inner)</code>, so the order you write is the order stored.</p>
<p>The elements are cheap descriptions. When the layout node is created, each element creates a long-lived <code>Modifier.Node</code>. On recomposition Compose compares the new elements with the old ones and updates the existing nodes in place, instead of building new ones. During measure, each layout node calls the next one in the chain with its own constraints. That is why the first <code>size</code> decides what the later ones can do.</p>`,
          code: `// Roughly what the library does (simplified)
fun Modifier.padding(all: Dp): Modifier =
    this then PaddingElement(start = all, top = all, end = all, bottom = all, rtlAware = true)

infix fun Modifier.then(other: Modifier): Modifier =
    if (other === Modifier) this else CombinedModifier(this, other)`,
        },
        mistakes: [
          {
            title: 'No modifier parameter',
            bad: `@Composable
fun Avatar(painter: Painter) {
    Image(painter, null, Modifier.size(40.dp).clip(CircleShape))
}`,
            good: `@Composable
fun Avatar(painter: Painter, modifier: Modifier = Modifier) {
    Image(painter, null, modifier.size(40.dp).clip(CircleShape))
}`,
            why: 'Without a <code>modifier</code> parameter, callers can’t add padding, a click or a weight. Take one and put it first in the chain on the root element.',
          },
          {
            title: 'Passing the same modifier to the children',
            bad: `@Composable
fun Note(title: String, body: String, modifier: Modifier = Modifier) {
    Column(modifier) {
        Text(title, modifier)
        Text(body, modifier)
    }
}`,
            good: `@Composable
fun Note(title: String, body: String, modifier: Modifier = Modifier) {
    Column(modifier) {
        Text(title)
        Text(body)
    }
}`,
            why: 'The caller’s padding, size or click now applies three times. The <code>modifier</code> parameter belongs to the root only. Children get their own <code>Modifier</code> chains.',
          },
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
        predict: {
          q: 'The chain is <code>.padding(16.dp)</code> first, then <code>.size(96.dp)</code> later. How big is the whole Box?',
          options: ['96 × 96 dp', '128 × 128 dp', '64 × 64 dp'],
          a: 1,
          why: 'The first modifier is the outermost layer. Padding wraps the 96 dp box and adds 16 dp on every side: 96 + 32 = 128.',
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'layouts',
        title: 'Row, Column and Box',
        tagline: 'Arrangement spreads along the main axis. Alignment places across it.',
        body: `
<p><code>Column</code> stacks children top to bottom. <code>Row</code> puts them side by side. <code>Box</code> stacks them on top of each other. Most screens are these three, nested.</p>
<p>Row and Column each take two knobs. <em>Arrangement</em> works along the main axis and decides how leftover space is shared. <em>Alignment</em> works across it and decides where each child sits in the other direction. A Row has <code>horizontalArrangement</code> and <code>verticalAlignment</code>. A Column has the opposite pair. A Box has one <code>contentAlignment</code>.</p>
<p><code>Modifier.weight(1f)</code> gives a child a share of the leftover space. Once a child has weight, nothing is left over, so arrangement has nothing to spread. A <code>Spacer</code> with weight pushes the children after it to the far end.</p>`,
        code: `@Composable
fun MessageRow(name: String, preview: String, time: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Avatar(Modifier.size(40.dp))
        Column(Modifier.weight(1f)) {          // takes all the leftover width
            Text(name, style = MaterialTheme.typography.titleMedium)
            Text(preview, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text(time, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
fun BellWithCount(count: Int) {
    Box(contentAlignment = Alignment.Center) {  // children stack, last on top
        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
        Text("$count", Modifier.align(Alignment.TopEnd))
    }
}`,
        remember: 'Arrangement spreads along the main axis. Alignment places across it. weight takes what is left.',
        level: 'beginner',
        terms: [
          { term: 'Arrangement', def: 'How a Row or Column places its children along its main axis and shares the leftover space, such as Start, SpaceBetween or spacedBy.' },
          { term: 'Alignment', def: 'Where a child sits on the cross axis of a Row or Column, or anywhere inside a Box.' },
          { term: 'Modifier.weight', def: 'A Row or Column child modifier that gives the child a share of the space left after the unweighted children are measured.' },
          { term: 'Spacer', def: 'An empty composable that only takes up space, often sized with a modifier like width, height or weight.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Center both children vertically and push the Delete button to the right end.', code: 'Row(\n    modifier = Modifier.fillMaxWidth(),\n    [[verticalAlignment]] = Alignment.CenterVertically,\n) {\n    Text("Draft")\n    Spacer(Modifier.[[weight]](1f))\n    TextButton(onClick = onDelete) { Text("Delete") }\n}', why: 'A Row aligns on the vertical axis with <code>verticalAlignment</code>. The weighted Spacer eats the free space, so Delete lands at the end.' },
          { type: 'bug', prompt: 'This Row should spread its buttons to both ends, but it does not compile. Tap the broken line.', code: 'Row(\n    modifier = Modifier.fillMaxWidth(),\n    horizontalAlignment = Arrangement.SpaceBetween,\n) {\n    TextButton(onClick = onBack) { Text("Back") }\n    Button(onClick = onNext) { Text("Next") }\n}', bug: 2, fix: '    horizontalArrangement = Arrangement.SpaceBetween,', why: 'A Row spreads children along its main axis with <code>horizontalArrangement</code>. <code>horizontalAlignment</code> belongs to Column.' },
        ],
        quiz: [
          { q: 'In a <code>Row</code>, which parameter moves the children up and down?', options: ['<code>horizontalArrangement</code>', '<code>verticalAlignment</code>', '<code>contentAlignment</code>'], a: 1, why: 'Up and down is the cross axis of a Row, and the cross axis is set by alignment.' },
          { q: 'One child of a Row has <code>Modifier.weight(1f)</code>. What does <code>Arrangement.SpaceBetween</code> do now?', options: ['Spreads the children to both ends', 'Nothing visible, because the weight used up the leftover space', 'It throws at runtime'], a: 1, why: 'Arrangement only shares leftover space. A weighted child already took all of it.' },
          { q: 'Which layout draws its children on top of each other?', options: ['<code>Row</code>', '<code>Column</code>', '<code>Box</code>'], a: 2, why: 'A Box stacks its children. The last one draws on top.' },
        ],
        deeper: [
          {
            title: 'How weight shares the space',
            body: `<p>A Row measures in two rounds. First it measures every child without weight, one after another, each with whatever width is still free. Then it takes the leftover width and splits it between the weighted children by their weights: <code>weight(2f)</code> gets twice what <code>weight(1f)</code> gets.</p>
<p>By default a weighted child must fill its share exactly. With <code>weight(1f, fill = false)</code> the share is only a maximum, so a small child stays small and the rest of its share stays empty.</p>`,
            code: `Row(Modifier.width(300.dp)) {
    A(Modifier.width(60.dp))           // round 1: 60 dp
    B(Modifier.weight(1f))             // round 2: 240 × 1/3 = 80 dp
    C(Modifier.weight(2f))             // round 2: 240 × 2/3 = 160 dp
}`,
            visual(el) {
              const W = 300, A = 60, NAT = { B: 80, C: 50 };
              const B_OPTS = [['B()', 0, true], ['B(Modifier.weight(1f))', 1, true], ['B(Modifier.weight(2f))', 2, true]];
              const C_OPTS = [['C()', 0, true], ['C(Modifier.weight(1f))', 1, true], ['C(Modifier.weight(1f, fill = false))', 1, false]];
              let b = B_OPTS[1], c = C_OPTS[1], busy = false;
              const seg = n => h('div', { class: `cmp-d2l-seg cmp-d2l-${n.toLowerCase()}` }, h('b', {}, n), h('small', {}));
              const S = { A: seg('A'), B: seg('B'), C: seg('C') };
              const left = h('div', { class: 'cmp-d2l-left' });
              const track = h('div', { class: 'cmp-d2l-track', role: 'img', 'aria-label': 'Row 300 dp wide' }, S.A, S.B, S.C, left);
              const steps = h('ol', { class: 'cmp-d2l-steps' });
              const o = out();
              const bBtns = B_OPTS.map(x => cmd(x[0], () => set(() => { b = x; })));
              const cBtns = C_OPTS.map(x => cmd(x[0], () => set(() => { c = x; })));
              const pct = dp => `${(dp / W) * 100}%`;
              function setW(n, dp, label) {
                S[n].style.width = pct(dp);
                S[n].querySelector('small').textContent = label === '' ? '' : `${Math.round(dp)} dp`;
                S[n].classList.toggle('cmp-d2l-tiny', dp < 34);
              }
              async function run() {
                busy = true;
                const kids = [['A', 0, true, A], ['B', b[1], b[2], NAT.B], ['C', c[1], c[2], NAT.C]];
                bBtns.forEach((x, i) => x.setAttribute('aria-pressed', String(B_OPTS[i] === b)));
                cBtns.forEach((x, i) => x.setAttribute('aria-pressed', String(C_OPTS[i] === c)));
                steps.replaceChildren();
                left.style.width = '0'; left.style.left = '0';
                for (const [n] of kids) { setW(n, 0, ''); S[n].classList.remove('cmp-d2l-on'); }
                await sleep(350); if (!el.isConnected) return;
                let used = 0;
                const fixed = kids.filter(k => !k[1]);
                for (const [n, , , nat] of fixed) {
                  setW(n, nat); S[n].classList.add('cmp-d2l-on'); used += nat;
                  await sleep(380); if (!el.isConnected) return;
                }
                steps.append(h('li', { class: 'drop-in' }, `Round 1: measure ${fixed.map(k => k[0]).join(', ')} without weight → ${used} dp used`));
                const rest = W - used, weighted = kids.filter(k => k[1]), total = weighted.reduce((s, k) => s + k[1], 0);
                left.style.left = pct(used); left.style.width = pct(rest);
                await sleep(450); if (!el.isConnected) return;
                if (!weighted.length) {
                  steps.append(h('li', { class: 'drop-in' }, `No weights. ${rest} dp stays free for Arrangement to place.`));
                  say(o, `Nothing has weight, so ${rest} dp is left over. Arrangement decides where it goes.`);
                  busy = false; return;
                }
                steps.append(h('li', { class: 'drop-in' }, `Leftover: ${W} − ${used} = ${rest} dp, total weight ${total}`));
                let unused = 0;
                for (const [n, w, fill, nat] of weighted) {
                  const share = rest * w / total, got = fill ? share : Math.min(nat, share);
                  unused += share - got;
                  setW(n, got); S[n].classList.add('cmp-d2l-on');
                  steps.append(h('li', { class: 'drop-in' }, `Round 2: ${n} gets ${rest} × ${w}/${total} = ${Math.round(share)} dp${fill ? '' : `, fill = false so it keeps ${nat} dp`}`));
                  await sleep(450); if (!el.isConnected) return;
                }
                left.style.left = pct(W - unused); left.style.width = pct(unused);
                say(o, unused > 0.5
                  ? `<span class="muted">fill = false:</span> C took only ${NAT.C} dp of its share. ${Math.round(unused)} dp stays empty.`
                  : `<span class="good">All ${W} dp used.</span> Weighted children split the leftover by weight.`);
                busy = false;
              }
              function set(fn) { if (busy) return; fn(); run(); }
              el.append(track, steps,
                h('div', { class: 'cmp-ly-group' }, h('span', { class: 'cmp-label' }, 'B'), h('div', { class: 'controls' }, bBtns)),
                h('div', { class: 'cmp-ly-group' }, h('span', { class: 'cmp-label' }, 'C'), h('div', { class: 'controls' }, cBtns)),
                o);
              say(o, 'A is always 60 dp. Pick weights for B and C and watch the two rounds.');
              setTimeout(() => { if (el.isConnected) run(); }, 60);
            },
          },
          {
            title: 'Match the tallest child with IntrinsicSize',
            body: `<p>Compose measures each child only once per pass, so a child can’t simply ask “how tall is my sibling?”. Say you want a divider between two texts that is exactly as tall as the taller text. With <code>fillMaxHeight()</code> alone, the divider fills the Row’s maximum height, which can be the whole screen.</p>
<p><code>Modifier.height(IntrinsicSize.Min)</code> on the Row fixes it. Before measuring, the Row asks each child for its <em>intrinsic</em> height: the smallest height that shows its content. It takes the largest answer as its own height, and then <code>fillMaxHeight()</code> means “as tall as the tallest text”. Intrinsic queries cost an extra pass over the children, so use them where you need them.</p>`,
            code: `Row(Modifier.height(IntrinsicSize.Min)) {
    Text(left, Modifier.weight(1f))
    VerticalDivider(Modifier.fillMaxHeight())     // as tall as the taller Text
    Text(right, Modifier.weight(1f))
}`,
            visual(el) {
              let on = false;
              const div = h('div', { class: 'cmp-d2l-div' });
              const row = h('div', { class: 'cmp-d2l-irow' },
                h('div', { class: 'cmp-d2l-txt' }, 'Departs 08:40', h('small', {}, 'Lisbon')),
                div,
                h('div', { class: 'cmp-d2l-txt' }, 'Arrives 11:55', h('small', {}, 'Berlin, Terminal 1, Gate B12')));
              const screen = h('div', { class: 'cmp-d2l-screen', role: 'img', 'aria-label': 'Row with a divider inside a screen' }, row, h('div', { class: 'cmp-d2l-below' }, 'Next item'));
              const code = h('div', { class: 'kt' });
              const o = out();
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2l-intr' });
              function paint() {
                row.classList.toggle('cmp-d2l-fit', on);
                code.innerHTML = hl(`Row(${on ? 'Modifier.height(IntrinsicSize.Min)' : ''}) {\n    Text(left, Modifier.weight(1f))\n    VerticalDivider(Modifier.fillMaxHeight())\n    Text(right, Modifier.weight(1f))\n}`);
                replay(div, 'pop-soft');
                say(o, on
                  ? '<span class="good">IntrinsicSize.Min:</span> the Row asked both texts for their height first. The divider matches the taller one.'
                  : '<span class="bad">No intrinsics:</span> fillMaxHeight takes the Row’s max height, so the divider and the Row grow to fill the screen.');
              }
              sw.addEventListener('change', () => { on = sw.checked; paint(); });
              el.append(screen, h('label', { class: 'switch', for: 'cmp-d2l-intr' }, sw, 'Modifier.height(IntrinsicSize.Min)'), code, o);
              paint();
            },
          },
        ],
        underHood: {
          body: `<p><code>Row</code>, <code>Column</code> and <code>Box</code> are inline functions that call <code>Layout</code> with a <code>MeasurePolicy</code>. Layout in Compose is a single pass down and up the tree: a parent passes constraints down, each child returns its size, and the parent places the children. Measuring the same child twice in one pass throws an exception, which keeps deep trees fast.</p>
<p>Row’s policy measures the children without weight first, then gives each weighted child its share of the rest, then places them all with the arrangement and alignment you passed. Box measures every child and takes the size of the largest. If you need a different rule, you write your own <code>Layout</code>, which the Compose, advanced track covers.</p>`,
          code: `// Row's measure policy, heavily simplified
var used = 0
for (child in unweightedChildren) {
    used += child.measure(Constraints(maxWidth = constraints.maxWidth - used)).width
}
val remaining = constraints.maxWidth - used
for (child in weightedChildren) {
    val share = (remaining * child.weight / totalWeight).roundToInt()
    child.measure(
        if (child.fill) Constraints.fixedWidth(share)   // weight(1f)
        else Constraints(maxWidth = share)              // weight(1f, fill = false)
    )
}
// then: place along the main axis with arrangement, across it with alignment`,
        },
        mistakes: [
          {
            title: 'fillMaxWidth on two children of a Row',
            bad: `Row {
    Text(from, Modifier.fillMaxWidth())
    Text(to, Modifier.fillMaxWidth())   // gets 0 dp
}`,
            good: `Row {
    Text(from, Modifier.weight(1f))
    Text(to, Modifier.weight(1f))
}`,
            why: 'The Row measures children in order. The first one fills all the width and leaves nothing for the second. <code>weight</code> splits the space instead.',
          },
          {
            title: 'A long text pushes the icon out',
            bad: `Row(verticalAlignment = Alignment.CenterVertically) {
    Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis)
    Icon(painterResource(R.drawable.ic_chevron), contentDescription = null)
}`,
            good: `Row(verticalAlignment = Alignment.CenterVertically) {
    Text(title, Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
    Icon(painterResource(R.drawable.ic_chevron), contentDescription = null)
}`,
            why: 'Without weight, the Text is measured first and takes all the width it wants. The icon gets what is left, which can be 0. A weighted Text is measured last, with only the leftover space, so it ellipsizes and the icon stays.',
          },
        ],
        visual(el) {
          const ARR = ['Start', 'Center', 'End', 'SpaceBetween', 'SpaceAround', 'SpaceEvenly'];
          const JUST = { Start: 'flex-start', Center: 'center', End: 'flex-end', SpaceBetween: 'space-between', SpaceAround: 'space-around', SpaceEvenly: 'space-evenly' };
          const ALIGN = { Row: ['Top', 'CenterVertically', 'Bottom'], Column: ['Start', 'CenterHorizontally', 'End'] };
          const CROSS = ['flex-start', 'center', 'flex-end'];
          const BOX = ['TopStart', 'TopCenter', 'TopEnd', 'CenterStart', 'Center', 'CenterEnd', 'BottomStart', 'BottomCenter', 'BottomEnd'];
          let kind = 'Row', arr = 'Start', align = 1, boxAlign = 4, weight = false, spacer = false, busy = false;
          const [a, b, c] = ['A', 'B', 'C'].map(n => h('div', { class: `cmp-ly-item cmp-ly-${n.toLowerCase()}` }, n));
          const bNote = h('small', {});
          b.append(bNote);
          const spacerEl = h('div', { class: 'cmp-ly-spacer' }, h('span', {}, 'Spacer'));
          const tag = h('span', { class: 'cmp-ly-tag' });
          const parent = h('div', { class: 'cmp-ly-parent', role: 'img', 'aria-label': 'Layout preview' });
          const code = h('div', { class: 'kt' });
          const o = out();
          const kindBtns = ['Row', 'Column', 'Box'].map(k => cmd(`${k} { A(); B(); C() }`, () => change(() => { kind = k; }, `${k}: ${k === 'Box' ? 'children stack on top of each other. The last one draws on top.' : `the main axis is ${k === 'Row' ? 'horizontal' : 'vertical'}.`}`)));
          const arrGroup = h('div', { class: 'controls' });
          const alignGroup = h('div', { class: 'controls' });
          const weightIn = h('input', { type: 'checkbox', id: 'cmp-ly-weight' });
          const spacerIn = h('input', { type: 'checkbox', id: 'cmp-ly-spacer' });
          const switches = h('div', { class: 'controls' },
            h('label', { class: 'switch', for: 'cmp-ly-weight' }, weightIn, 'B: Modifier.weight(1f)'),
            h('label', { class: 'switch', for: 'cmp-ly-spacer' }, spacerIn, 'Spacer(Modifier.weight(1f)) before C'));

          // FLIP: measure, change the layout, then slide every child from its old spot.
          function slide(mutate) {
            const before = new Map([...parent.children].map(k => [k, k.getBoundingClientRect()]));
            mutate();
            for (const k of parent.children) {
              const r = before.get(k); if (!r) continue;
              const n = k.getBoundingClientRect(), dx = r.left - n.left, dy = r.top - n.top;
              if (dx || dy) k.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
            }
          }
          function apply() {
            const box = kind === 'Box';
            parent.className = `cmp-ly-parent cmp-ly-${box ? 'box' : kind === 'Row' ? 'row' : 'col'}`;
            tag.textContent = kind;
            b.classList.toggle('cmp-ly-w', weight && !box);
            bNote.textContent = weight && !box ? 'weight(1f)' : '';
            const kids = [a, b];
            if (spacer && !box) kids.push(spacerEl);
            kids.push(c);
            if (!box) {
              parent.style.justifyContent = JUST[arr]; parent.style.alignItems = CROSS[align];
              kids.forEach(k => { k.style.alignSelf = ''; k.style.justifySelf = ''; });
            } else {
              parent.style.justifyContent = ''; parent.style.alignItems = '';
              const r = Math.floor(boxAlign / 3), col = boxAlign % 3;
              kids.forEach(k => { k.style.alignSelf = ['start', 'center', 'end'][r]; k.style.justifySelf = ['start', 'center', 'end'][col]; });
            }
            parent.replaceChildren(tag, ...kids);
            paintCode(); paintControls();
          }
          function paintCode() {
            const lines = [];
            if (kind === 'Box') lines.push('Box(', `    contentAlignment = Alignment.${BOX[boxAlign]},`, ') {', '    A()', '    B()', '    C()', '}');
            else {
              lines.push(`${kind}(`, `    ${kind === 'Row' ? 'horizontal' : 'vertical'}Arrangement = Arrangement.${arr},`, `    ${kind === 'Row' ? 'vertical' : 'horizontal'}Alignment = Alignment.${ALIGN[kind][align]},`, ') {', '    A()');
              lines.push(weight ? '    B(Modifier.weight(1f))' : '    B()');
              if (spacer) lines.push('    Spacer(Modifier.weight(1f))');
              lines.push('    C()', '}');
            }
            code.innerHTML = hl(lines.join('\n'));
          }
          let builtFor = '';
          function paintControls() {
            kindBtns.forEach((k, i) => k.setAttribute('aria-pressed', String(['Row', 'Column', 'Box'][i] === kind)));
            if (builtFor === kind) {
              arrGroup.querySelectorAll('.cmd').forEach((x, i) => x.setAttribute('aria-pressed', String(ARR[i] === arr)));
              alignGroup.querySelectorAll('.cmd, .cmp-ly-cell').forEach((x, i) => x.setAttribute('aria-pressed', String(i === (kind === 'Box' ? boxAlign : align))));
              return;
            }
            builtFor = kind;
            if (kind === 'Box') {
              arrGroup.replaceChildren(h('span', { class: 'cmp-label' }, 'A Box has no arrangement. Pick its contentAlignment below.'));
              alignGroup.replaceChildren(h('div', { class: 'cmp-ly-grid', role: 'group', 'aria-label': 'contentAlignment' },
                BOX.map((n, i) => h('button', { class: 'cmp-ly-cell', 'aria-label': `Alignment.${n}`, 'aria-pressed': String(i === boxAlign), onclick: () => change(() => { boxAlign = i; }, `${hl(`contentAlignment = Alignment.${n}`)} <span class="muted">// every child moves to the same spot</span>`) }))));
            } else {
              arrGroup.replaceChildren(...ARR.map(x => cmd(x, () => pickArr(x), { 'aria-pressed': String(x === arr), 'aria-label': `Arrangement.${x}` })));
              alignGroup.replaceChildren(...ALIGN[kind].map((x, i) => cmd(x, () => change(() => { align = i; }, `${hl(`Alignment.${x}`)} <span class="muted">// moves each child across the main axis</span>`), { 'aria-pressed': String(i === align), 'aria-label': `Alignment.${x}` })));
            }
            weightIn.disabled = spacerIn.disabled = kind === 'Box';
          }
          function pickArr(x) {
            const used = weight || spacer;
            change(() => { arr = x; }, used
              ? `${hl(`Arrangement.${x}`)} <span class="bad">has nothing to spread.</span> <span class="muted">A weighted child already took the leftover space.</span>`
              : `${hl(`Arrangement.${x}`)} <span class="muted">// shares the leftover space along the main axis</span>`);
          }
          function change(mutate, msg) {
            if (busy) return;
            busy = true;
            slide(() => { mutate(); apply(); });
            say(o, msg);
            setTimeout(() => { busy = false; }, 200);
          }
          weightIn.addEventListener('change', () => {
            weight = weightIn.checked; apply(); replay(b, 'pop-soft');
            say(o, weight ? `${hl('B(Modifier.weight(1f))')} <span class="muted">// B grows into all the free space</span>` : 'B is back to its own width. Arrangement works again.');
          });
          spacerIn.addEventListener('change', () => {
            if (busy) { spacerIn.checked = spacer; return; }
            spacer = spacerIn.checked;
            if (spacer) {
              spacerEl.classList.remove('cmp-ly-grow'); apply();
              requestAnimationFrame(() => requestAnimationFrame(() => spacerEl.classList.add('cmp-ly-grow')));
              say(o, `${hl('Spacer(Modifier.weight(1f))')} <span class="muted">// fills the gap and pushes C to the far end</span>`);
            } else {
              busy = true; spacer = true; spacerEl.classList.remove('cmp-ly-grow');
              setTimeout(() => { spacer = false; apply(); busy = false; }, 460);
              say(o, 'Spacer removed. C slides back.');
            }
          });
          apply();
          say(o, 'Pick an arrangement and an alignment. Each box is a real flex layout.');
          el.append(
            parent,
            h('div', { class: 'cmp-ly-group' }, h('span', { class: 'cmp-label' }, 'Main axis · Arrangement.'), arrGroup),
            h('div', { class: 'cmp-ly-group' }, h('span', { class: 'cmp-label' }, 'Cross axis · Alignment.'), alignGroup),
            switches,
            h('div', { class: 'cmp-ly-group' }, h('span', { class: 'cmp-label' }, 'Container'), h('div', { class: 'controls' }, kindBtns)),
            code, o);
        },
        predict: {
          q: 'A Row holds A, then a <code>Spacer(Modifier.weight(1f))</code>, then B and C. Where do B and C end up?',
          options: ['Right next to A', 'Pushed to the far end of the Row', 'Spread evenly across the Row'],
          a: 1,
          why: 'The weighted Spacer takes all the leftover space, so everything after it is pushed to the end.',
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'scaffold',
        title: 'Scaffold and Material 3 structure',
        tagline: 'Slots for the bars, and innerPadding to keep content clear of them.',
        body: `
<p><code>Scaffold</code> lays out the standard parts of a Material 3 screen: <code>topBar</code>, <code>bottomBar</code>, <code>floatingActionButton</code>, <code>snackbarHost</code>, and your content in the middle. It knows where each part goes. The FAB sits above the bottom bar, and a snackbar appears above the FAB.</p>
<p>The content lambda gets one parameter, <code>innerPadding</code>. It holds the space taken by the bars and by the system bars. Apps that target Android 15 draw edge to edge, so if you drop <code>innerPadding</code>, your first and last items slide under the bars. Apply it with <code>Modifier.padding(innerPadding)</code>, or pass it as <code>contentPadding</code> to a lazy list so items still scroll behind the bars.</p>
<p>A snackbar needs a <code>SnackbarHostState</code>. Its <code>showSnackbar</code> is a suspend function, so you call it from a coroutine. It shows one message at a time, and the rest wait in line.</p>`,
        code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InboxScreen(messages: List<Message>, onCompose: () -> Unit) {
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = { TopAppBar(title = { Text("Inbox") }) },
        bottomBar = { NavigationBar { /* NavigationBarItem(...) */ } },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                onCompose()
                scope.launch { snackbarHostState.showSnackbar("Draft saved") }
            }) {
                Icon(Icons.Default.Add, contentDescription = "Compose")
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        LazyColumn(contentPadding = innerPadding) {
            items(messages, key = { it.id }) { MessageRow(it) }
        }
    }
}`,
        remember: 'Scaffold places the bars. innerPadding tells your content where they are. Always use it.',
        level: 'beginner',
        terms: [
          { term: 'Scaffold', def: 'A Material 3 layout with slots for a top bar, bottom bar, floating action button, snackbar host and the main content.' },
          { term: 'innerPadding', def: 'The PaddingValues that Scaffold passes to its content, covering the space used by its bars and the system bars.' },
          { term: 'SnackbarHostState', def: 'The state object that queues snackbar messages; its suspend showSnackbar shows one message and waits until it is dismissed.' },
          { term: 'Edge-to-edge', def: 'Drawing the app behind the status bar and navigation bar, which is the default for apps that target Android 15.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the first and last notes clear of the bars while the list still scrolls behind them.', code: 'Scaffold(topBar = { TopAppBar(title = { Text("Notes") }) }) { [[innerPadding]] ->\n    LazyColumn([[contentPadding]] = innerPadding) {\n        items(notes, key = { it.id }) { NoteRow(it) }\n    }\n}', why: 'The lambda parameter carries the bar sizes. As <code>contentPadding</code> it pads the list content, so items can still scroll under the bars.' },
          { type: 'bug', prompt: 'Tapping Save never shows a snackbar. Tap the line that causes it.', code: '@Composable\nfun NoteScreen(onSave: () -> Unit) {\n    val snackbarHostState = remember { SnackbarHostState() }\n    val scope = rememberCoroutineScope()\n    Scaffold(\n        snackbarHost = { SnackbarHost(remember { SnackbarHostState() }) },\n        floatingActionButton = {\n            FloatingActionButton(onClick = {\n                onSave()\n                scope.launch { snackbarHostState.showSnackbar("Saved") }\n            }) { Icon(Icons.Default.Check, contentDescription = "Save") }\n        },\n    ) { innerPadding -> NoteEditor(Modifier.padding(innerPadding)) }\n}', bug: 5, fix: '        snackbarHost = { SnackbarHost(snackbarHostState) },', why: 'The host watches a second, empty state object. Messages go to <code>snackbarHostState</code>, which no host is showing.' },
        ],
        quiz: [
          { q: 'What does <code>innerPadding</code> contain?', options: ['Padding you set on the Scaffold yourself', 'The space taken by the Scaffold bars and the system bars', 'Always 16.dp on every side'], a: 1, why: 'Scaffold measures its bars and the window insets, then tells your content how much room they take.' },
          { q: 'You call <code>showSnackbar</code> twice in quick succession. What happens?', options: ['The second replaces the first at once', 'The second waits until the first is dismissed', 'Both show, stacked'], a: 1, why: 'SnackbarHostState shows one message at a time and queues the rest.' },
          { q: 'Why can’t you call <code>showSnackbar</code> straight from <code>onClick</code>?', options: ['It is a suspend function, so it needs a coroutine', 'It only works inside a ViewModel', 'It has to run on a background thread'], a: 0, why: 'It suspends until the snackbar is dismissed. Launch it with <code>rememberCoroutineScope()</code>.' },
          { q: 'You add <code>TopAppBarDefaults.enterAlwaysScrollBehavior()</code> and pass it to the <code>TopAppBar</code>. The list scrolls but the bar never moves. What is missing?', options: ['<code>Modifier.nestedScroll(scrollBehavior.nestedScrollConnection)</code> on the Scaffold', '<code>contentPadding = innerPadding</code> on the LazyColumn', 'A <code>LargeTopAppBar</code> instead of a <code>TopAppBar</code>'], a: 0, why: 'The nested scroll connection is the link: the list reports scroll deltas to its parents, and the connection uses them to move the bar. Without it the bar never hears about the scroll.' },
        ],
        deeper: [
          {
            title: 'Top bars that react to scrolling',
            body: `<p>A top app bar can collapse while the content scrolls. Create a scroll behavior from <code>TopAppBarDefaults</code>, pass it to the bar, and connect it to the scroll with <code>Modifier.nestedScroll(scrollBehavior.nestedScrollConnection)</code> on the Scaffold.</p>
<p>That modifier is the link. A lazy list reports every scroll delta to its nested scroll parents, and the connection takes part of each delta to move or shrink the bar. Forget it and the bar never hears about the scroll. <code>enterAlwaysScrollBehavior</code> hides the bar on the way down and brings it back as soon as you scroll up. <code>exitUntilCollapsedScrollBehavior</code>, used with <code>MediumTopAppBar</code> or <code>LargeTopAppBar</code>, shrinks the bar to its small size and grows it again only at the top of the list.</p>`,
            code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(posts: List<Post>) {
    val scrollBehavior = TopAppBarDefaults.enterAlwaysScrollBehavior()
    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = { TopAppBar(title = { Text("Feed") }, scrollBehavior = scrollBehavior) },
    ) { innerPadding ->
        LazyColumn(contentPadding = innerPadding) {
            items(posts, key = { it.id }) { PostRow(it) }
        }
    }
}`,
            visual(el) {
              const MODES = {
                pinned: { src: 'pinnedScrollBehavior()', bar: 'TopAppBar', max: 64, min: 64 },
                always: { src: 'enterAlwaysScrollBehavior()', bar: 'TopAppBar', max: 64, min: 0 },
                exit: { src: 'exitUntilCollapsedScrollBehavior()', bar: 'LargeTopAppBar', max: 112, min: 64 },
              };
              let mode = 'always', nested = true, offset = 0, lastTop = 0;
              const PX = 0.75;
              const title = h('span', { class: 'cmp-d2s-title' }, 'Feed');
              const bar = h('div', { class: 'cmp-d2s-bar' }, title);
              const inner = h('div', { class: 'cmp-d2s-inner' });
              for (let i = 1; i <= 24; i++) inner.append(h('div', { class: 'cmp-d2s-row' }, `Post ${i}`));
              const scroller = h('div', { class: 'cmp-d2s-scroll', tabindex: '0', 'aria-label': 'Scrollable feed' }, inner);
              const phone = h('div', { class: 'cmp-d2s-phone' }, scroller, bar);
              const read = h('div', { class: 'kt' });
              const o = out();
              const modeBtns = Object.entries(MODES).map(([k, m]) => cmd(`TopAppBarDefaults.${m.src}`, () => setMode(k)));
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2s-nested', checked: true });
              function paint() {
                const m = MODES[mode];
                let height = m.max, shift = 0;
                if (nested && mode === 'always') shift = offset;
                if (nested && mode === 'exit') height = Math.max(m.min, m.max - scroller.scrollTop / PX);
                bar.style.height = `${height * PX}px`;
                bar.style.transform = `translateY(${shift * PX}px)`;
                bar.classList.toggle('cmp-d2s-large', mode === 'exit' && height > m.min + 20);
                const hOff = mode === 'always' ? shift : height - m.max, limit = mode === 'always' ? -64 : m.min - m.max;
                const frac = limit ? Math.min(1, hOff / limit) : 0;
                read.innerHTML = hl(`${m.bar}(scrollBehavior = ${m.src.replace('()', '')})\nstate.heightOffset = ${Math.round(hOff)}f\nstate.collapsedFraction = ${frac.toFixed(2)}f`);
              }
              function setMode(k) {
                mode = k; offset = 0;
                modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(MODES)[i] === k)));
                inner.style.paddingTop = `${MODES[k].max * PX + 6}px`;
                title.textContent = k === 'exit' ? 'Large feed' : 'Feed';
                scroller.scrollTop = 0; lastTop = 0;
                paint();
                say(o, k === 'pinned' ? 'Pinned: the bar never moves. Content scrolls under it.' : k === 'always' ? 'enterAlways: scroll down to hide the bar, scroll up a little to bring it back.' : 'exitUntilCollapsed: the large bar shrinks to 64 dp and grows back only at the top.');
              }
              scroller.addEventListener('scroll', () => {
                const dy = (scroller.scrollTop - lastTop) / PX;
                lastTop = scroller.scrollTop;
                offset = Math.max(-64, Math.min(0, offset - dy));
                paint();
              }, { passive: true });
              sw.addEventListener('change', () => {
                nested = sw.checked; offset = 0; paint(); replay(bar, 'shake');
                say(o, nested ? `${hl('Modifier.nestedScroll(scrollBehavior.nestedScrollConnection)')} <span class="muted">// the bar hears the scroll again</span>` : '<span class="bad">No nestedScroll:</span> the list scrolls, but the bar never receives the deltas. It stays put.');
              });
              const by = d => scroller.scrollBy({ top: d, behavior: 'smooth' });
              el.append(
                h('div', { class: 'cmp-sc-wrap' }, phone, h('div', { class: 'cmp-sc-side' }, read,
                  h('label', { class: 'switch', for: 'cmp-d2s-nested' }, sw, 'Modifier.nestedScroll(...)'),
                  h('div', { class: 'controls' }, act('Scroll down', () => by(150)), act('Scroll up a little', () => by(-50))))),
                h('div', { class: 'controls' }, modeBtns), o);
              setMode('always');
            },
          },
          {
            title: 'Snackbar results and Undo',
            body: `<p><code>showSnackbar</code> returns a <code>SnackbarResult</code>: <code>ActionPerformed</code> if the user tapped the action, or <code>Dismissed</code> if it timed out or was closed. That makes Undo simple. Hide the item right away, show the snackbar, and only delete for real when the result is <code>Dismissed</code>.</p>
<p>Watch the duration. When you pass an <code>actionLabel</code>, the default duration is <code>SnackbarDuration.Indefinite</code>, so the snackbar stays until the user acts, and every other message waits behind it. Pass <code>SnackbarDuration.Short</code> or <code>Long</code> if it should go away on its own. When an accessibility service is on, the system can make these times longer.</p>`,
            code: `fun onDelete(photo: Photo) {
    vm.hide(photo.id)                         // gone from the list, still in storage
    scope.launch {
        val result = snackbarHostState.showSnackbar(
            message = "Photo deleted",
            actionLabel = "Undo",
            duration = SnackbarDuration.Short,   // with an action the default is Indefinite
        )
        when (result) {
            SnackbarResult.ActionPerformed -> vm.restore(photo.id)
            SnackbarResult.Dismissed -> vm.deleteForever(photo.id)
        }
    }
}`,
            visual(el) {
              const PHOTOS = ['Beach.jpg', 'Dog.jpg', 'Cake.jpg', 'Snow.jpg'];
              let short = true, storage = PHOTOS.length, showing = null, timer = 0, logN = 0;
              const queue = [], rows = new Map();
              const list = h('div', { class: 'cmp-d2s-list' });
              PHOTOS.forEach(n => {
                const r = h('div', { class: 'cmp-d2s-item' }, h('span', {}, n), act('Delete', () => del(n)));
                rows.set(n, r); list.append(r);
              });
              const snackText = h('span', { class: 'cmp-d2s-msg' });
              const fill = h('i', { class: 'cmp-d2s-fill' });
              const snack = h('div', { class: 'cmp-d2s-snack', 'aria-live': 'polite' }, snackText,
                h('button', { class: 'cmp-d2s-undo', type: 'button', onclick: () => finish('ActionPerformed') }, 'Undo'),
                h('button', { class: 'cmp-d2s-x', type: 'button', 'aria-label': 'Dismiss', onclick: () => finish('Dismissed') }, '×'), fill);
              const box = h('div', { class: 'cmp-d2s-box' }, list, snack);
              const store = h('div', { class: 'cmp-label' });
              const log = h('div', { class: 'cmp-gs-log', 'aria-live': 'polite' });
              const o = out();
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2s-short', checked: true });
              function addLog(html) {
                log.prepend(h('div', { class: 'drop-in', html: `<span class="muted">${++logN}</span> ${html}` }));
                while (log.children.length > 4) log.lastElementChild.remove();
              }
              const paintStore = () => { store.textContent = `In storage: ${storage} · waiting in SnackbarHostState: ${queue.length}`; };
              function del(n) {
                const r = rows.get(n);
                if (!r || r.classList.contains('cmp-d2s-gone')) return;
                r.classList.add('cmp-d2s-gone');
                queue.push(n); paintStore();
                addLog(`${hl(`vm.hide("${n}")`)} <span class="muted">// still in storage</span>`);
                if (showing) say(o, `${hl('showSnackbar')} suspends. ${esc(n)} waits until the current snackbar is done.`);
                pump();
              }
              function pump() {
                if (showing || !queue.length || !el.isConnected) return;
                const n = showing = queue.shift(); paintStore();
                snackText.textContent = `${n} deleted`;
                snack.classList.add('cmp-on');
                fill.style.transition = 'none'; fill.style.width = '100%'; void fill.offsetWidth;
                if (short) {
                  fill.style.transition = 'width 4s linear'; fill.style.width = '0';
                  timer = setTimeout(() => { if (el.isConnected && showing === n) finish('Dismissed'); }, 4000);
                  say(o, `${hl('duration = SnackbarDuration.Short')} <span class="muted">// about 4 s. Tap Undo, or wait.</span>`);
                } else {
                  fill.style.width = '0';
                  say(o, '<span class="bad">Indefinite:</span> no timer. The snackbar waits for Undo or ×, and every other message waits behind it.');
                }
              }
              function finish(result) {
                if (!showing) return;
                clearTimeout(timer);
                const n = showing; showing = null;
                snack.classList.remove('cmp-on');
                const r = rows.get(n);
                if (result === 'ActionPerformed') {
                  r.classList.remove('cmp-d2s-gone'); replay(r, 'pop-soft');
                  addLog(`result = ${hl('ActionPerformed')} → ${hl(`vm.restore("${n}")`)}`);
                  say(o, `<span class="good">Undo:</span> ${esc(n)} was never deleted, so it simply comes back.`);
                } else {
                  storage--; r.remove(); rows.delete(n);
                  addLog(`result = ${hl('Dismissed')} → ${hl(`vm.deleteForever("${n}")`)}`);
                  say(o, `Dismissed. Now ${esc(n)} is deleted for real.`);
                }
                paintStore();
                setTimeout(pump, 350);
              }
              sw.addEventListener('change', () => {
                short = sw.checked;
                say(o, short ? `${hl('duration = SnackbarDuration.Short')} <span class="muted">// times out on its own</span>` : `${hl('showSnackbar("…", actionLabel = "Undo")')} <span class="muted">// no duration: Indefinite</span>`);
              });
              paintStore();
              addLog('<span class="muted">// results show up here</span>');
              say(o, 'Delete a photo. It disappears at once, but storage only changes when the snackbar is dismissed.');
              el.append(box,
                h('label', { class: 'switch', for: 'cmp-d2s-short' }, sw, 'duration = SnackbarDuration.Short'),
                store, log, o);
            },
          },
        ],
        underHood: {
          body: `<p><code>Scaffold</code> is built on <code>SubcomposeLayout</code>, a layout that can compose its children during measure. It first composes and measures the top bar, bottom bar, snackbar host and FAB. From their sizes and the <code>contentWindowInsets</code> (system bars by default) it computes a <code>PaddingValues</code>. Only then does it compose your content lambda and hand it that value as <code>innerPadding</code>.</p>
<p>That order is why <code>innerPadding</code> is a lambda parameter and not something you read from a state object. It also means a bar that changes height, like a collapsing top bar, produces a new <code>innerPadding</code> on the next layout.</p>`,
        },
        mistakes: [
          {
            title: 'Deleting before the Undo answer',
            bad: `onDelete = { photo ->
    repository.delete(photo)
    scope.launch {
        snackbarHostState.showSnackbar("Deleted", actionLabel = "Undo")
    }
}`,
            good: `onDelete = { photo ->
    vm.hide(photo.id)
    scope.launch {
        val result = snackbarHostState.showSnackbar(
            "Deleted", actionLabel = "Undo", duration = SnackbarDuration.Short,
        )
        if (result == SnackbarResult.ActionPerformed) vm.restore(photo.id)
        else vm.deleteForever(photo.id)
    }
}`,
            why: 'The data is gone before the user can say Undo, and the result is ignored. Without a duration, the snackbar with an action also stays until the user acts.',
          },
          {
            title: 'Hard-coding the bar heights',
            bad: `Scaffold(topBar = { TopAppBar(title = { Text("Notes") }) }) { _ ->
    LazyColumn(Modifier.padding(top = 88.dp)) { /* ... */ }
}`,
            good: `Scaffold(topBar = { TopAppBar(title = { Text("Notes") }) }) { innerPadding ->
    LazyColumn(contentPadding = innerPadding) { /* ... */ }
}`,
            why: 'Status bar and app bar heights change with the device, display cutouts, font size and collapsing bars. <code>innerPadding</code> is measured on every layout, so it is always right.',
          },
        ],
        visual(el) {
          const STATUS = 24, TOPBAR = 64, NAVBAR = 80, NAVINSET = 24, PX = 0.75;
          let hasTop = true, hasBottom = true, hasFab = true, usePad = true, drafts = 0, showing = false;
          const queue = [];
          const rows = h('div', {});
          const content = h('div', { class: 'cmp-sc-content' }, rows);
          const top = h('div', { class: 'cmp-sc-top' }, 'Inbox');
          const bottom = h('div', { class: 'cmp-sc-bottom' }, h('span'), h('span'), h('span'));
          const fab = h('button', { class: 'cmp-sc-fab', 'aria-label': 'Floating action button', onclick: () => tapFab() }, '+');
          const snackText = h('span', {});
          const snack = h('div', { class: 'cmp-sc-snack', 'aria-live': 'polite' }, snackText, h('b', {}, 'Undo'));
          const phone = h('div', { class: 'cmp-sc-phone' },
            h('div', { class: 'cmp-sc-status', 'aria-hidden': 'true' }, h('span', {}, '9:41'), h('span', {}, '5G')),
            content, top, bottom, snack, fab, h('div', { class: 'cmp-sc-pill', 'aria-hidden': 'true' }));
          const pad = h('div', { class: 'cmp-sc-pad' });
          const qLine = h('span', { class: 'cmp-sc-q' });
          const o = out();
          const sw = (id, label, on, fn) => {
            const i = h('input', { type: 'checkbox', id, checked: on });
            i.addEventListener('change', () => fn(i.checked));
            return h('label', { class: 'switch', for: id }, i, label);
          };
          const MESSAGES = ['Welcome to Inbox', 'Your order shipped', 'Team lunch on Friday', 'Invoice #2041', 'New sign-in on Pixel', 'Weekend plans?', 'Build passed', 'Design review notes', 'Flight check-in open', 'Last message'];
          function addRow(title, sub, first) {
            const r = h('div', { class: 'cmp-sc-row' }, title, h('small', {}, sub));
            if (first) { rows.prepend(r); r.classList.add('drop-in'); } else rows.append(r);
          }
          MESSAGES.forEach((m, i) => addRow(m, i === 0 ? 'First item' : i === MESSAGES.length - 1 ? 'Scroll down to reach it' : 'Tap to open'));
          const insets = () => ({ top: hasTop ? STATUS + TOPBAR : STATUS, bottom: hasBottom ? NAVBAR + NAVINSET : NAVINSET });
          function layout() {
            const p = insets();
            phone.classList.toggle('cmp-sc-notop', !hasTop);
            phone.classList.toggle('cmp-sc-nobottom', !hasBottom);
            phone.classList.toggle('cmp-sc-nopad', !usePad);
            content.style.paddingTop = usePad ? `${p.top * PX}px` : '0px';
            content.style.paddingBottom = usePad ? `${p.bottom * PX}px` : '0px';
            const base = p.bottom * PX;
            fab.style.bottom = `${base + 12}px`;
            snack.style.bottom = `${base + (hasFab ? 12 + fab.offsetHeight + 8 : 8)}px`;
            fab.classList.toggle('cmp-sc-hide', !hasFab);
            pad.innerHTML = hl(`innerPadding = PaddingValues(\n    top = ${p.top}.dp,     // ${hasTop ? 'status bar + TopAppBar' : 'status bar only'}\n    bottom = ${p.bottom}.dp,  // ${hasBottom ? 'NavigationBar + gesture bar' : 'gesture bar only'}\n)\n${usePad ? 'LazyColumn(contentPadding = innerPadding)' : 'LazyColumn()   // innerPadding ignored'}`);
            setTimeout(markUnder, 430);
          }
          function markUnder() {
            if (!el.isConnected) return 0;
            const cr = content.getBoundingClientRect(), p = insets();
            const first = rows.firstElementChild, last = rows.lastElementChild;
            const atTop = content.scrollTop < 2, atEnd = content.scrollTop + content.clientHeight >= content.scrollHeight - 2;
            for (const r of rows.children) r.classList.remove('cmp-sc-under');
            if (atTop && first.getBoundingClientRect().top < cr.top + p.top * PX - 2) first.classList.add('cmp-sc-under');
            if (atEnd && last.getBoundingClientRect().bottom > cr.bottom - p.bottom * PX + 2) last.classList.add('cmp-sc-under');
            return usePad ? 0 : 2;
          }
          content.addEventListener('scroll', () => requestAnimationFrame(markUnder), { passive: true });
          function setPart(fn, msg) {
            fn(); layout();
            setTimeout(() => {
              const n = markUnder();
              say(o, `${msg} ${n ? '<span class="bad">The first and last items stay under the bars, even at the ends of the scroll.</span>' : '<span class="good">The first and last items clear the bars.</span>'}`);
            }, 450);
          }
          async function pump() {
            if (showing) return;
            while (queue.length && el.isConnected) {
              showing = true;
              snackText.textContent = queue.shift();
              qLine.textContent = queue.length ? `${queue.length} waiting in SnackbarHostState` : 'Queue empty';
              snack.classList.add('cmp-on'); layout();
              await sleep(2400);
              snack.classList.remove('cmp-on'); showing = false; layout();
              await sleep(400);
            }
            showing = false;
            qLine.textContent = 'Queue empty';
          }
          function show(msg) {
            queue.push(msg);
            if (showing) qLine.textContent = `${queue.length} waiting in SnackbarHostState`;
            if (showing) say(o, `${hl(`showSnackbar("${msg}")`)} <span class="muted">// suspends and waits. One snackbar at a time.</span>`);
            pump();
          }
          function tapFab() {
            if (!hasFab) return;
            drafts++;
            addRow(`Draft ${drafts}`, 'Just now', true);
            content.scrollTo({ top: 0, behavior: 'smooth' });
            replay(fab, 'pop');
            say(o, `${hl('scope.launch { snackbarHostState.showSnackbar("Draft saved") }')} <span class="muted">// the snackbar appears above the FAB</span>`);
            show(`Draft ${drafts} saved`);
          }
          layout();
          say(o, 'Turn parts of the Scaffold on and off, then switch off innerPadding.');
          el.append(
            h('div', { class: 'cmp-sc-wrap' }, phone,
              h('div', { class: 'cmp-sc-side' },
                h('div', { class: 'controls' },
                  sw('cmp-sc-topbar', 'topBar', true, v => setPart(() => { hasTop = v; }, v ? 'TopAppBar is back. innerPadding.top grows.' : 'No topBar. innerPadding.top is just the status bar.')),
                  sw('cmp-sc-bottombar', 'bottomBar', true, v => setPart(() => { hasBottom = v; }, v ? 'NavigationBar is back. The FAB sits above it.' : 'No bottomBar. The FAB and snackbar drop to the gesture bar.')),
                  sw('cmp-sc-fabon', 'floatingActionButton', true, v => setPart(() => { hasFab = v; }, v ? 'FAB slot filled.' : 'FAB slot empty.')),
                  sw('cmp-sc-usepad', 'use innerPadding', true, v => setPart(() => { usePad = v; }, v ? 'Content padded by innerPadding.' : 'innerPadding ignored. Content starts at the very top of the window.'))),
                pad,
                h('div', { class: 'controls' },
                  act('Tap the FAB', tapFab),
                  cmd('showSnackbar("Synced")', () => { replay(snack, 'pop-soft'); show('Synced'); say(o, `${hl('showSnackbar("Synced")')} ${showing ? '<span class="muted">// queued behind the current one</span>' : ''}`); })),
                qLine)),
            o);
          qLine.textContent = 'Queue empty';
        },
        predict: {
          q: 'The app draws edge to edge and the content ignores <code>innerPadding</code>. Where does the first list item land?',
          options: ['Below the top bar, as usual', 'Under the status bar and top bar, partly hidden', 'Scaffold pads the content for you anyway'],
          a: 1,
          why: 'Scaffold only measures the bars and hands you <code>innerPadding</code>. If you drop it, the content starts at the very top of the window, behind the bars.',
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'theming',
        title: 'Theming with Material 3',
        tagline: 'Read colors from roles, then swap the whole scheme at once.',
        body: `
<p><code>MaterialTheme</code> hands three things down the tree: a <code>colorScheme</code>, a <code>typography</code> scale and a set of <code>shapes</code>. Material components take their colors and styles from it. Your own composables should too. Write <code>MaterialTheme.colorScheme.primary</code>, not a hard-coded <code>Color</code>.</p>
<p>A color scheme is a set of roles: <code>primary</code>, <code>onPrimary</code>, <code>primaryContainer</code>, <code>surface</code>, <code>onSurface</code> and more. Each “on” color is the one that reads well on top of its partner. Swap the scheme and every screen follows. Dark theme works this way: pick a dark scheme when <code>isSystemInDarkTheme()</code> is true.</p>
<p>On Android 12 (API 31) and up, <code>dynamicLightColorScheme</code> and <code>dynamicDarkColorScheme</code> build a scheme from the user’s wallpaper. Those functions require API 31, so check the API level and keep your own schemes as the fallback.</p>`,
        code: `@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors      // darkColorScheme(primary = ..., ...)
        else -> LightColors          // lightColorScheme(primary = ..., ...)
    }
    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        shapes = Shapes(medium = RoundedCornerShape(16.dp)),
        content = content,
    )
}

// Read roles from the theme, never fixed colors.
Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
    Text("Trip to Lisbon", style = MaterialTheme.typography.titleLarge)
}`,
        remember: 'Use color roles, not colors. Swap the scheme and everything follows: dark theme, dynamic color, all of it.',
        level: 'beginner',
        terms: [
          { term: 'MaterialTheme', def: 'The composable that provides a color scheme, typography and shapes to every Material component below it.' },
          { term: 'ColorScheme', def: 'A set of named Material 3 color roles, such as primary, onPrimary and surface, that components read instead of fixed colors.' },
          { term: 'Dynamic color', def: 'A color scheme generated from the user’s wallpaper, available through dynamicLightColorScheme and dynamicDarkColorScheme on Android 12 and up.' },
          { term: 'isSystemInDarkTheme', def: 'A composable function that returns true when the device is set to dark theme.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build the scheme from the wallpaper on Android 12 and up.', code: 'val colorScheme = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.[[S]]) {\n    val context = LocalContext.current\n    if (darkTheme) [[dynamicDarkColorScheme]](context) else dynamicLightColorScheme(context)\n} else {\n    if (darkTheme) DarkColors else LightColors\n}', why: '<code>VERSION_CODES.S</code> is Android 12, API 31. Below that, the dynamic functions can’t run, so fall back to your own schemes.' },
          { type: 'bug', prompt: 'In dark theme this title is dark gray on a dark background. Tap the line that causes it.', code: '@Composable\nfun SectionTitle(text: String) {\n    Text(\n        text = text,\n        style = MaterialTheme.typography.titleLarge,\n        color = Color(0xFF1B1A24),\n    )\n}', bug: 5, fix: '        color = MaterialTheme.colorScheme.onSurface,', why: 'A fixed color ignores the theme. <code>onSurface</code> is dark in the light scheme and light in the dark one.' },
        ],
        quiz: [
          { q: 'The app runs on Android 11 with <code>dynamicColor = true</code>. Which scheme does <code>AppTheme</code> use?', options: ['<code>dynamicLightColorScheme</code>', 'Your own <code>LightColors</code> or <code>DarkColors</code>', 'It crashes'], a: 1, why: 'The API check fails on Android 11, so the <code>when</code> falls through to your own schemes.' },
          { q: 'Text inside a filled <code>Button</code> should use which role?', options: ['<code>primary</code>', '<code>onPrimary</code>', '<code>surface</code>'], a: 1, why: 'The button is painted <code>primary</code>. The “on” partner is picked to read well on top of it.' },
          { q: 'How does a Compose app usually follow the system dark theme?', options: ['<code>isSystemInDarkTheme()</code> picks a dark color scheme for MaterialTheme', 'Android inverts the colors on its own', 'Each composable reads a setting and picks colors'], a: 0, why: 'One check at the theme level swaps the whole scheme. Components just read the roles.' },
          { q: 'What color is the text?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>Box(Modifier.background(MaterialTheme.colorScheme.primary)) {\n    Text("Pro")\n}</code></pre>', options: ['<code>onPrimary</code>, picked from the background', 'The content color from further up the tree, which may not read well on primary', 'Always white'], a: 1, why: 'A plain background only paints. <code>Surface(color = primary)</code> would also set <code>LocalContentColor</code> to <code>onPrimary</code> through <code>contentColorFor</code>.' },
        ],
        deeper: [
          {
            title: 'Surface picks the text color for you',
            body: `<p>A <code>Text</code> without a color reads <code>LocalContentColor</code>. <code>Surface</code> sets it: its <code>contentColor</code> defaults to <code>contentColorFor(color)</code>, which returns the matching “on” role. Put a <code>Surface(color = primary)</code> around a Text and it turns <code>onPrimary</code> without you saying so. Scaffold, Card and Button do the same.</p>
<p>A plain <code>Modifier.background</code> paints a color and nothing else. The Text keeps the content color from further up, which may be unreadable on the new background. And <code>contentColorFor</code> only knows the scheme’s own roles. For any other color it falls back to the current content color, so pass <code>contentColor</code> yourself.</p>`,
            code: `Box(Modifier.background(MaterialTheme.colorScheme.primary)) {
    Text("Pro")                 // keeps the outer content color
}

Surface(color = MaterialTheme.colorScheme.primary) {
    Text("Pro")                 // onPrimary, from contentColorFor(primary)
}

Surface(color = BrandPurple, contentColor = Color.White) {
    Text("Pro")                 // not a scheme role: say the content color
}`,
            visual(el) {
              const CASES = [
                { src: 'Box(Modifier.background(primary)) { Text("Pro") }', bg: 'var(--accent)', fg: 'var(--ink)', local: 'onSurface (from the Scaffold above)', ok: false, note: 'background only paints. The Text still uses the content color from the Scaffold above, and it is hard to read here.' },
                { src: 'Surface(color = primary) { Text("Pro") }', bg: 'var(--accent)', fg: 'var(--accent-ink)', local: 'onPrimary', ok: true, note: 'Surface set LocalContentColor to contentColorFor(primary), which is onPrimary.' },
                { src: 'Surface(color = primaryContainer) { Text("Pro") }', bg: 'var(--accent-soft)', fg: 'var(--accent)', local: 'onPrimaryContainer', ok: true, note: 'Each container role has its own “on” partner. contentColorFor finds it.' },
                { src: 'Surface(color = BrandPurple) { Text("Pro") }', bg: 'var(--t-f)', fg: 'var(--ink)', local: 'onSurface (fallback)', ok: false, note: 'BrandPurple is not a scheme role, so contentColorFor falls back to the current content color. In dark theme that is light text on a light purple.' },
              ];
              const badge = h('span', { class: 'cmp-d2t-pro' }, 'Pro');
              const card = h('div', { class: 'cmp-d2t-card' }, h('b', {}, 'Plan'), badge, h('span', { class: 'cmp-d2t-sub' }, 'Text on the Scaffold uses onSurface.'));
              const read = h('div', { class: 'kt' });
              const o = out();
              const btns = CASES.map(c => cmd(c.src, () => pick(c)));
              function pick(c) {
                btns.forEach((b, i) => b.setAttribute('aria-pressed', String(CASES[i] === c)));
                badge.style.background = c.bg; badge.style.color = c.fg;
                badge.classList.toggle('cmp-d2t-warn', !c.ok);
                replay(badge, 'pop');
                read.innerHTML = hl(`LocalContentColor = ${c.local}`);
                say(o, `${c.ok ? '<span class="good">Readable.</span>' : '<span class="bad">Check the contrast.</span>'} ${esc(c.note)}`);
              }
              el.append(card, read, h('div', { class: 'controls' }, btns), o);
              pick(CASES[0]);
            },
          },
          {
            title: 'Theme one part of the screen',
            body: `<p><code>MaterialTheme</code> can be nested. An inner <code>MaterialTheme</code> overrides only what you pass and inherits the rest. <code>ColorScheme.copy</code> changes a few roles, so a danger zone can make its buttons use error colors while the rest of the screen stays on brand.</p>
<p>The override only reaches the composables inside the inner call. For tokens Material doesn’t have, like a “success” color, create your own <code>CompositionLocal</code> next to your theme. The Compose, advanced track covers how.</p>`,
            code: `@Composable
fun DangerZone(content: @Composable () -> Unit) {
    val scheme = MaterialTheme.colorScheme
    MaterialTheme(
        colorScheme = scheme.copy(primary = scheme.error, onPrimary = scheme.onError),
        content = content,              // typography and shapes are inherited
    )
}

Column {
    Button(onClick = onExport) { Text("Export data") }          // brand primary
    DangerZone {
        Button(onClick = onDelete) { Text("Delete account") }   // error colors
    }
}`,
            visual(el) {
              let nested = false;
              const btn = (t, danger) => h('span', { class: `cmp-d2t-btn${danger ? ' cmp-d2t-dz' : ''}` }, t);
              const zone = h('div', { class: 'cmp-d2t-zone' }, h('span', { class: 'cmp-d2t-zlabel' }, 'Danger zone'), btn('Delete account', true), btn('Reset app', true));
              const screen = h('div', { class: 'cmp-d2t-screen', role: 'img', 'aria-label': 'Settings screen preview' },
                h('b', {}, 'Settings'), btn('Export data'), btn('Sync now'), zone);
              const code = h('div', { class: 'kt' });
              const o = out();
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2t-nest' });
              function paint() {
                zone.classList.toggle('cmp-d2t-on', nested);
                code.innerHTML = hl(nested ? 'MaterialTheme(colorScheme = scheme.copy(\n    primary = scheme.error, onPrimary = scheme.onError,\n)) {\n    DangerButtons()\n}' : 'DangerButtons()   // same theme as the rest');
                zone.querySelectorAll('.cmp-d2t-btn').forEach(b => replay(b, 'pop-soft'));
                say(o, nested ? 'Only the buttons inside the inner MaterialTheme switched to error colors. Export and Sync still read the outer primary.' : 'One theme for the whole screen. The dangerous buttons look like the safe ones.');
              }
              sw.addEventListener('change', () => { nested = sw.checked; paint(); });
              el.append(screen, h('label', { class: 'switch', for: 'cmp-d2t-nest' }, sw, 'Wrap in a nested MaterialTheme'), code, o);
              paint();
            },
          },
        ],
        underHood: {
          body: `<p><code>MaterialTheme</code> is a <code>CompositionLocalProvider</code>. It puts the color scheme, typography and shapes into a CompositionLocal created with <code>staticCompositionLocalOf</code>. <code>MaterialTheme.colorScheme</code> is a getter marked <code>@Composable @ReadOnlyComposable</code> that reads that local’s current value.</p>
<p>A static local does not track who read it, so changing the theme recomposes everything inside the provider. That trade is fine because a theme rarely changes, and it makes every read cheap. <code>ColorScheme</code> is an <code>@Immutable</code> class of plain <code>Color</code> values. <code>LocalContentColor</code> is a separate local with a default of black, which is why text outside any Surface or Scaffold shows black, even in dark theme.</p>`,
          code: `// Inside Surface (simplified)
CompositionLocalProvider(LocalContentColor provides contentColor) {
    content()
}

// Inside Text (simplified): explicit color, then style color, then content color
val textColor = color.takeOrElse { style.color.takeOrElse { LocalContentColor.current } }`,
        },
        mistakes: [
          {
            title: 'Checking dark theme in every composable',
            bad: `@Composable
fun Banner(text: String) {
    val bg = if (isSystemInDarkTheme()) Color(0xFF1B1B1F) else Color.White
    Text(text, Modifier.background(bg))
}`,
            good: `@Composable
fun Banner(text: String) {
    Surface(color = MaterialTheme.colorScheme.surfaceContainer) {
        Text(text)
    }
}`,
            why: 'Each hand-made check ignores dynamic color and any in-app theme switch. The theme already chose a scheme. Read its roles.',
          },
          {
            title: 'Hand-sized text instead of the type scale',
            bad: `Text("Trips", fontSize = 22.sp, fontWeight = FontWeight.Bold)`,
            good: `Text("Trips", style = MaterialTheme.typography.titleLarge)`,
            why: 'Fixed sizes drift apart across screens and ignore your <code>Typography</code>. Use the scale roles so one change in the theme updates every title.',
          },
          {
            title: 'No Surface at the root',
            bad: `setContent {
    AppTheme {
        Text("Hello")         // LocalContentColor is still the default: black
    }
}`,
            good: `setContent {
    AppTheme {
        Surface {             // provides surface color and onSurface text
            Text("Hello")
        }
    }
}`,
            why: 'Nothing has set a content color yet, so the text is black on a dark window. A root <code>Surface</code> or <code>Scaffold</code> paints the background and sets the matching text color.',
          },
        ],
        visual(el) {
          const SEEDS = { brand: 'var(--t-k)', 'wallpaper 1': 'var(--t-n)', 'wallpaper 2': 'var(--t-s)', 'wallpaper 3': 'var(--t-t)' };
          let dark = false, dynamic = true, api = 34, wall = 'wallpaper 1', square = false;
          const scope = h('div', { class: 'cmp-th-scope' });
          const phone = h('div', { class: 'cmp-th-phone', role: 'img', 'aria-label': 'Themed app preview' },
            h('div', { class: 'cmp-th-bar' }, 'Trips'),
            h('div', { class: 'cmp-th-body' },
              h('div', { class: 'cmp-th-card' }, h('b', {}, 'Lisbon'), h('span', {}, 'May 12 to 16 · 2 travelers')),
              h('div', { class: 'cmp-th-btns' }, h('span', { class: 'cmp-th-btn' }, 'Book'), h('span', { class: 'cmp-th-btn cmp-th-out' }, 'Share')),
              h('p', { class: 'cmp-th-text' }, 'bodyMedium on surface. Every color here comes from a role.'),
              h('div', { class: 'cmp-th-fab', 'aria-hidden': 'true' }, '+')));
          const ROLES = [['primary', '--cmp-primary'], ['onPrimary', '--cmp-on-primary'], ['primaryContainer', '--cmp-container'], ['onPrimaryContainer', '--cmp-on-container'], ['surface', '--cmp-bg'], ['onSurface', '--cmp-on']];
          const roles = h('div', { class: 'cmp-th-roles' }, ROLES.map(([n, v]) => h('span', { class: 'cmp-th-role' }, h('i', { style: `background: var(${v})` }), n)));
          const which = h('div', { class: 'kt' });
          const o = out();
          const darkIn = h('input', { type: 'checkbox', id: 'cmp-th-dark' });
          const dynIn = h('input', { type: 'checkbox', id: 'cmp-th-dyn', checked: true });
          const apiBtns = [[30, 'Android 11 (API 30)'], [34, 'Android 14 (API 34)']].map(([n, label]) => act(label, () => { api = n; paint(api < 31 && dynamic ? `${label}: the API check fails, so the theme falls back to your own scheme.` : `${label}.`); }));
          const wallBtns = Object.keys(SEEDS).filter(k => k !== 'brand').map(k => h('button', { class: 'cmd', onclick: () => pickWall(k) }, h('i', { class: 'cmp-th-swatch', style: `background:${SEEDS[k]}` }), k));
          const shapeBtns = [false, true].map(sq => cmd(`medium = RoundedCornerShape(${sq ? 4 : 16}.dp)`, () => { square = sq; paint(`${hl(`RoundedCornerShape(${sq ? 4 : 16}.dp)`)} <span class="muted">// Card reads shapes.medium</span>`); }));
          const usesDynamic = () => dynamic && api >= 31;
          function pickWall(k) {
            wall = k;
            if (!usesDynamic()) { replay(phone, 'shake'); paint(`The wallpaper changed, but ${dynamic ? 'Android 11 has no dynamic color' : 'dynamicColor is off'}. The app keeps its own scheme.`); return; }
            paint(`New wallpaper. The system rebuilds the dynamic scheme and the app follows. <span class="muted">// nothing in your code changed</span>`);
          }
          function paint(msg) {
            const seed = usesDynamic() ? SEEDS[wall] : SEEDS.brand;
            scope.style.setProperty('--cmp-seed', seed);
            scope.classList.toggle('cmp-th-dark', dark);
            scope.classList.toggle('cmp-th-square', square);
            const src = usesDynamic() ? `${dark ? 'dynamicDarkColorScheme' : 'dynamicLightColorScheme'}(context)` : (dark ? 'DarkColors' : 'LightColors');
            which.innerHTML = hl(`colorScheme = ${src}`);
            apiBtns.forEach((b, i) => b.setAttribute('aria-pressed', String([30, 34][i] === api)));
            wallBtns.forEach(b => b.setAttribute('aria-pressed', String(b.textContent.endsWith(wall))));
            shapeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String([false, true][i] === square)));
            replay(roles, 'pop-soft');
            if (msg) say(o, msg);
          }
          darkIn.addEventListener('change', () => { dark = darkIn.checked; paint(`${hl(`isSystemInDarkTheme() == ${dark}`)} <span class="muted">// every role swaps at once</span>`); });
          dynIn.addEventListener('change', () => { dynamic = dynIn.checked; paint(dynamic ? (api >= 31 ? 'dynamicColor on: the scheme comes from the wallpaper.' : 'dynamicColor on, but this is Android 11. The fallback still runs.') : 'dynamicColor off: your brand scheme everywhere.'); });
          scope.append(phone, h('div', { class: 'cmp-th-side' }, which, roles,
            h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-th-dark' }, darkIn, 'Dark theme'), h('label', { class: 'switch', for: 'cmp-th-dyn' }, dynIn, 'dynamicColor')),
            h('div', { class: 'controls' }, apiBtns)));
          paint('Android 14 with dynamic color. Flip dark theme, then pick another wallpaper.');
          el.append(scope,
            h('div', { class: 'controls' }, wallBtns),
            h('div', { class: 'controls' }, shapeBtns),
            o);
        },
        predict: {
          q: 'Android 14 with <code>dynamicColor</code> on. The user picks another wallpaper. What happens to the app’s <code>primary</code>?',
          options: ['It stays your brand color', 'It changes to a color built from the new wallpaper', 'It changes only in dark theme'],
          a: 1,
          why: '<code>dynamicLightColorScheme</code> and <code>dynamicDarkColorScheme</code> read the system palette, which is built from the wallpaper. Every role follows it.',
        },
      },

      // 6 ─────────────────────────────────────────────
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
        deeper: [
          {
            title: 'Keys: build it again when an input changes',
            body: `<p><code>remember(key) { }</code> keeps its value while the key stays equal. When the key changes, the old value is dropped and the block runs again. Use it for anything built from a parameter, like a formatter for a locale or a filtered list.</p>
<p>Without the key, the first value stays for the whole life of the composable, even after the parameter changes.</p>`,
            code: `@Composable
fun PriceTag(cents: Long, locale: Locale) {
    val format = remember(locale) { NumberFormat.getCurrencyInstance(locale) }
    Text(format.format(cents / 100.0))
}`,
            visual(el) {
              const LOC = { US: ['en-US', 'USD', 'Locale.US'], DE: ['de-DE', 'EUR', 'Locale.GERMANY'], UK: ['en-GB', 'GBP', 'Locale.UK'] };
              let loc = 'US', cents = 1250, addr = 0x31c0, busy = false;
              const next = () => '@' + (addr += 0x1b4).toString(16);
              const fmt = (l, c) => { try { return new Intl.NumberFormat(LOC[l][0], { style: 'currency', currency: LOC[l][1] }).format(c / 100); } catch (e) { return (c / 100).toFixed(2); } };
              const o = out();
              const card = keyed => {
                const c = { keyed, loc: 'US', id: next() };
                c.obj = h('span', { class: 'cmp-obj' }, `NumberFormat(${LOC.US[0]}) ${c.id}`);
                c.stack = h('div', { class: 'cmp-stack' }, c.obj);
                c.price = h('span', { class: 'cmp-zk-price' }, fmt('US', cents));
                c.el = h('div', { class: 'cmp-card' },
                  h('div', { class: 'kt', html: hl(keyed ? 'remember(locale) { NumberFormat... }' : 'remember { NumberFormat... }') }),
                  h('div', { class: 'cmp-mem' }, h('span', { class: 'cmp-label' }, 'slot'), c.stack),
                  h('div', { class: 'cmp-row' }, h('span', { class: 'cmp-label' }, 'On screen'), c.price));
                return c;
              };
              const A = card(false), B = card(true);
              const paint = c => {
                c.price.textContent = fmt(c.loc, cents);
                c.el.classList.toggle('cmp-zk-stale', c.loc !== loc);
                replay(c.price, 'cmp-flash');
              };
              async function setLocale(l) {
                if (busy) return;
                if (l === loc) { say(o, `${hl(`locale = ${LOC[l][2]}`)} <span class="muted">// same key: both slots reused</span>`); [A, B].forEach(c => replay(c.obj, 'pop')); return; }
                busy = true; loc = l;
                locBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(LOC)[i] === l)));
                A.obj.classList.add('cmp-reuse'); replay(A.obj, 'pop');
                const old = B.obj; old.classList.add('fly-out'); setTimeout(() => old.remove(), 400);
                B.loc = l; B.id = next();
                B.obj = h('span', { class: 'cmp-obj cmp-new drop-in' }, `NumberFormat(${LOC[l][0]}) ${B.id}`);
                B.stack.append(B.obj);
                await sleep(420);
                if (!el.isConnected) return;
                paint(A); paint(B);
                say(o, `Key changed to ${LOC[l][2]}. <span class="good">remember(locale)</span> built a new formatter. <span class="bad">remember { }</span> still formats for ${LOC[A.loc][2]}.`);
                busy = false;
              }
              function amount() {
                if (busy) return;
                cents += 100;
                [A, B].forEach(c => { replay(c.obj, 'pop'); paint(c); });
                say(o, `${hl('cents += 100')} <span class="muted">// a recomposition, keys unchanged: both slots reused</span>`);
              }
              const locBtns = Object.entries(LOC).map(([k, v]) => cmd(`locale = ${v[2]}`, () => setLocale(k)));
              locBtns[0].setAttribute('aria-pressed', 'true');
              say(o, 'Change the locale and compare the two slots.');
              el.append(h('div', { class: 'cmp-pair' }, A.el, B.el), h('div', { class: 'controls' }, locBtns, cmd('cents += 100', amount)), o);
            },
          },
          {
            title: 'Slots belong to a place in the tree',
            body: `<p>The composition stores remembered values by where the call sits. When an <code>if</code> stops calling a composable, its group and its slots are removed, and the remembered values go with them. When the branch comes back, <code>remember</code> runs its block again from scratch.</p>
<p>The same happens when a screen leaves navigation or a lazy row scrolls far away. State that must outlive a branch belongs higher up: hoisted into the parent, saved with <code>rememberSaveable</code>, or kept in a ViewModel.</p>`,
            code: `@Composable
fun Order(showNotes: Boolean) {
    if (showNotes) {
        NotesEditor()   // its remember { } is forgotten when showNotes turns false
    }
}

@Composable
fun NotesEditor() {
    var note by remember { mutableStateOf("") }
    TextField(note, onValueChange = { note = it })
}`,
            visual(el) {
              const NOTES = ['Gate code 41', 'Leave at the door', 'Ring twice'];
              let show = true, hoist = false, note = '', typed = 0, busy = false, prev = new Set();
              const table = h('div', { class: 'cmp-zt-table', 'aria-label': 'Slot table' });
              const field = h('div', { class: 'cmp-zt-field' });
              const toggle = h('input', { type: 'checkbox', id: 'cmp-rm-hoist' });
              const showBtn = cmd('showNotes = false', () => flip());
              const o = out();
              function rows() {
                const r = [{ k: 'order', d: 0, t: hoist ? 'group  Order(showNotes)' : 'group  Order(showNotes)' }];
                if (hoist) r.push({ k: 'hoisted', d: 1, t: `slot   MutableState("${note}")`, slot: true });
                if (show) {
                  r.push({ k: 'if', d: 1, t: 'group  if (showNotes)' });
                  r.push({ k: 'editor', d: 2, t: hoist ? 'group  NotesEditor(note, onNoteChange)' : 'group  NotesEditor()' });
                  if (!hoist) r.push({ k: 'local', d: 3, t: `slot   MutableState("${note}")`, slot: true });
                }
                return r;
              }
              function paint() {
                const r = rows(), now = new Set(r.map(x => x.k));
                table.replaceChildren(...r.map(x => h('div', { class: ['cmp-zt-row', x.slot && 'cmp-zt-slot', !prev.has(x.k) && 'drop-in'].filter(Boolean).join(' '), style: `--d:${x.d}` }, x.t)));
                prev = now;
                field.replaceChildren(show
                  ? h('span', {}, h('span', { class: 'cmp-label' }, 'Notes  '), note || h('span', { class: 'muted-text' }, '(empty)'))
                  : h('span', { class: 'muted-text' }, 'Notes hidden'));
                showBtn.innerHTML = hl(`showNotes = ${!show}`);
              }
              async function flip() {
                if (busy) return; busy = true;
                if (show) {
                  const gone = [...table.children].filter(x => /if \(|NotesEditor|slot/.test(x.textContent) && !(hoist && x.textContent.startsWith('slot')));
                  gone.forEach(x => x.classList.add('leave'));
                  await sleep(420);
                  if (!el.isConnected) return;
                  show = false;
                  if (!hoist) note = '';
                  paint();
                  say(o, hoist ? 'The NotesEditor group left. The note lives in Order, so it stays.' : '<span class="bad">The group left the table and took its slot with it.</span> The note is gone.');
                } else {
                  show = true; paint();
                  say(o, hoist ? `<span class="good">Back with "${esc(note)}".</span> The state never left.` : 'NotesEditor is back in a new group. remember ran its block again: the note starts empty.');
                }
                busy = false;
              }
              function type() {
                if (busy) return;
                if (!show) { replay(field, 'shake'); say(o, 'The editor is hidden. Show it first.'); return; }
                note = NOTES[typed++ % NOTES.length]; paint();
                replay(table.querySelector('.cmp-zt-slot'), 'pop');
                say(o, `${hl(`note = "${note}"`)} <span class="muted">// written into the slot</span>`);
              }
              toggle.addEventListener('change', () => {
                if (busy) { toggle.checked = hoist; return; }
                hoist = toggle.checked; show = true; note = ''; prev = new Set(); paint();
                say(o, hoist ? 'The state now sits in Order. NotesEditor only gets the value and a callback.' : 'The state sits inside NotesEditor again.');
              });
              paint();
              say(o, 'Type a note, then hide and show the editor.');
              el.append(
                h('div', { class: 'cmp-split' }, table, field),
                h('div', { class: 'controls' }, act('Type a note', type), showBtn, h('label', { class: 'switch', for: 'cmp-rm-hoist' }, toggle, 'Hoist note into Order')),
                o);
            },
          },
        ],
        underHood: {
          body: `<p><code>remember</code> is a small inline function. It asks the current <code>Composer</code> for the next slot in the <em>slot table</em>, the structure that stores groups and remembered values in the order your code ran. On the first composition the slot is empty, so the block runs and its result is written there. On later runs the same slot comes back. With keys, the composer first checks each key against the value it stored for that key last time.</p>
<p>That is why position matters: the composer finds your value by walking the same path of groups. Values that implement <code>RememberObserver</code> are told when they enter and leave the table, which is how effects start and stop.</p>`,
          code: `// Simplified from androidx.compose.runtime
@Composable
inline fun <T> remember(key1: Any?, crossinline calculation: () -> T): T =
    currentComposer.cache(currentComposer.changed(key1), calculation)

inline fun <T> Composer.cache(invalid: Boolean, block: () -> T): T {
    val stored = rememberedValue()                   // read the next slot
    return if (invalid || stored === Composer.Empty) {
        block().also { updateRememberedValue(it) }   // first run or new key
    } else {
        stored as T                                  // same object as last time
    }
}`,
        },
        mistakes: [
          {
            title: 'Copying a parameter into state and expecting updates',
            bad: `@Composable
fun NameField(initial: String) {
    var text by remember { mutableStateOf(initial) }
    TextField(text, onValueChange = { text = it })
}`,
            good: `@Composable
fun NameField(initial: String) {
    var text by remember(initial) { mutableStateOf(initial) }
    TextField(text, onValueChange = { text = it })
}`,
            why: 'The block runs once, so a later <code>initial</code> is ignored. Key it on the parameter if a new value should reset the field, or hoist the state so there is one source of truth.',
          },
          {
            title: 'Rebuilding a constant object on every run',
            bad: `@Composable
fun DayLabel(date: LocalDate) {
    val format = DateTimeFormatter.ofPattern("d MMM")
    Text(date.format(format))
}`,
            good: `private val DayFormat = DateTimeFormatter.ofPattern("d MMM")

@Composable
fun DayLabel(date: LocalDate) {
    Text(date.format(DayFormat))
}`,
            why: 'Anything built in the body is built again on every recomposition. A true constant goes in a top-level <code>val</code>. Use <code>remember</code> for things that depend on composition, like the current locale.',
          },
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
        predict: {
          q: 'In <code>Counter</code>, you tap <code>count++</code> and the composable runs again. Where does the new value live?',
          options: ['In a new <code>MutableIntState</code> made by this run', 'In the same object as before: <code>remember</code> hands it back', 'In a local variable that is copied over'],
          a: 1,
          why: '<code>remember</code> stores the object in a slot of the composition. Every later run gets that same object, now holding the new value.',
        },
      },

      // 7 ─────────────────────────────────────────────
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
          { q: 'Tabs switch with a plain <code>when (tab)</code>. Feed has a <code>rememberSaveable</code> search query. The user types, switches to Profile, then back to Feed. What is in the query?', options: ['The text they typed, because rememberSaveable survives everything', 'The text, but only after a rotation', 'Nothing: Feed left the composition, so its saved value was dropped'], a: 2, why: 'A composable that leaves the composition unregisters its saved values. Wrap each tab in <code>rememberSaveableStateHolder().SaveableStateProvider(key)</code> to keep them.' },
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>val FilterSaver = listSaver&lt;Filter, Any&gt;(\n    save = { listOf(it.tag, it.minPrice) },\n    restore = { Filter(it[1] as String, it[0] as Int) },\n)</code></pre>', options: ['The <code>save</code> line: lists cannot hold a String and an Int together', 'The <code>restore</code> line: it reads the values in the wrong order', 'The first line: a listSaver needs <code>@Parcelize</code>'], a: 1, why: 'save writes tag then price, so restore must read index 0 as the tag. The ClassCastException only shows when the screen is restored, so test with a rotation.' },
        ],
        deeper: [
          {
            title: 'A Saver for your own type',
            body: `<p>A Bundle only holds simple types: primitives, strings, arrays, <code>Parcelable</code> and a few more. For your own class you have two options. On Android, mark it <code>@Parcelize</code> with the <code>kotlin-parcelize</code> plugin. Anywhere, including shared KMP code, write a <code>Saver</code> that turns it into Bundle-friendly values and back.</p>
<p><code>mapSaver</code> and <code>listSaver</code> are the quick ways to build one. <code>save</code> runs when the state is about to be saved. <code>restore</code> runs only when the screen comes back, so a bug in it stays hidden until you rotate or the process dies.</p>`,
            code: `data class Filter(val tag: String, val minPrice: Int)

val FilterSaver = mapSaver(
    save = { mapOf("tag" to it.tag, "min" to it.minPrice) },
    restore = { Filter(it["tag"] as String, it["min"] as Int) },
)

var filter by rememberSaveable(stateSaver = FilterSaver) {
    mutableStateOf(Filter("all", 0))
}`,
            visual(el) {
              const TAGS = ['all', 'shoes', 'bags'];
              let tag = 'all', min = 0, saver = true, busy = false;
              const obj = h('div', { class: 'cmp-d2v-obj' });
              const phone = h('div', { class: 'cmp-d2v-proc' }, h('span', { class: 'cmp-label' }, 'App process'), obj);
              const bundle = h('div', { class: 'cmp-bundle' }, h('span', { class: 'cmp-bundle-title' }, 'Saved state Bundle'));
              const bundleBody = h('div', { class: 'cmp-d2v-entries' }, h('span', { class: 'tip' }, 'Empty'));
              bundle.append(bundleBody);
              const o = out();
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2v-saver', checked: true });
              const paintObj = () => { obj.innerHTML = hl(`Filter(tag = "${tag}", minPrice = ${min})`); };
              function change(fn, src) {
                if (busy) return;
                fn(); paintObj(); replay(obj, 'pop-soft');
                say(o, `${hl(src)} <span class="muted">// in memory only, nothing saved yet</span>`);
              }
              async function kill() {
                if (busy) return; busy = true;
                bundleBody.replaceChildren();
                say(o, 'The app goes to the background. The system asks every rememberSaveable for its value.');
                await sleep(700); if (!el.isConnected) return;
                if (!saver) {
                  replay(obj, 'shake'); phone.classList.add('cmp-d2v-crash');
                  bundleBody.replaceChildren(h('span', { class: 'cmp-d2v-err drop-in' }, 'IllegalArgumentException'));
                  say(o, '<span class="bad">crash:</span> a plain Filter can’t go into a Bundle. rememberSaveable needs a Saver or a Parcelable type.');
                  await sleep(1400); if (!el.isConnected) return;
                  phone.classList.remove('cmp-d2v-crash'); busy = false; return;
                }
                const entries = [`"tag" to "${tag}"`, `"min" to ${min}`];
                say(o, `${hl('FilterSaver.save(filter)')} <span class="muted">// becomes a map of simple values</span>`);
                for (const e of entries) {
                  bundleBody.append(h('span', { class: 'cmp-d2v-code drop-in', html: hl(e) }));
                  await sleep(380); if (!el.isConnected) return;
                }
                phone.classList.add('cmp-d2v-dead'); obj.textContent = 'process killed';
                say(o, 'The system kills the process to free memory. The Bundle is kept by the system.');
                await sleep(1100); if (!el.isConnected) return;
                phone.classList.remove('cmp-d2v-dead'); obj.textContent = 'new process…';
                say(o, 'The user comes back. A new process starts and gets the Bundle back.');
                await sleep(800); if (!el.isConnected) return;
                bundleBody.querySelectorAll('.cmp-d2v-code').forEach(x => replay(x, 'pop'));
                paintObj(); replay(obj, 'cmp-flash');
                say(o, `<span class="good">restored:</span> ${hl('FilterSaver.restore(map)')} built the same Filter again.`);
                busy = false;
              }
              sw.addEventListener('change', () => {
                if (busy) { sw.checked = saver; return; }
                saver = sw.checked;
                say(o, saver ? `${hl('rememberSaveable(stateSaver = FilterSaver)')} <span class="muted">// knows how to save Filter</span>` : `${hl('rememberSaveable { mutableStateOf(Filter(...)) }')} <span class="muted">// no Saver for a plain class</span>`);
              });
              paintObj();
              say(o, 'Change the filter, then send the app to the background.');
              el.append(
                h('div', { class: 'stage' }, phone, bundle),
                h('div', { class: 'controls' },
                  cmd('filter = filter.copy(tag = …)', () => change(() => { tag = TAGS[(TAGS.indexOf(tag) + 1) % TAGS.length]; }, `filter = filter.copy(tag = "${TAGS[(TAGS.indexOf(tag) + 1) % TAGS.length]}")`)),
                  cmd('filter = filter.copy(minPrice = minPrice + 10)', () => change(() => { min += 10; }, `filter = filter.copy(minPrice = ${min + 10})`)),
                  act('Background, then process death', kill)),
                h('label', { class: 'switch', for: 'cmp-d2v-saver' }, sw, 'stateSaver = FilterSaver'),
                o);
            },
          },
          {
            title: 'What survives what',
            body: `<p>Each place you can keep state has its own lifetime. <code>remember</code> lives as long as the composable stays in the composition. <code>rememberSaveable</code> also survives rotation and process death. A <code>ViewModel</code> survives rotation, but the system does not keep it through process death. <code>SavedStateHandle</code> is the ViewModel’s own small Bundle, so it survives both.</p>
<p>Two cases surprise people. When a composable leaves the composition, its <code>rememberSaveable</code> value is dropped too, because nothing is left to save. And when the user swipes the app away from Recents, saved state is cleared on purpose. Only storage on disk, like Room or DataStore, survives that.</p>`,
            visual(el) {
              const HOLDERS = ['remember', 'rememberSaveable', 'ViewModel', 'SavedStateHandle', 'Room / DataStore'];
              const EVENTS = [
                { src: 'Rotate the device', keep: [0, 1, 1, 1, 1], note: 'Rotation recreates the Activity. The ViewModel store is kept across it, and the Bundle carries the saved values.' },
                { src: 'Process death in the background', keep: [0, 1, 0, 1, 1], note: 'A new process starts. The old ViewModel is gone, but saved state is handed back.' },
                { src: 'Composable leaves the composition', keep: [0, 0, 1, 1, 1], note: 'An if turned false. Both remember and rememberSaveable belonged to that spot in the tree, so both are dropped.' },
                { src: 'User swipes the app from Recents', keep: [0, 0, 0, 0, 1], note: 'The user closed the app on purpose. Saved state is cleared too. Only data on disk is left.' },
              ];
              let busy = false, n = 7;
              const vals = HOLDERS.map(() => h('span', { class: 'cmp-d2v-val' }, '7'));
              const rows = HOLDERS.map((name, i) => h('div', { class: 'cmp-d2v-row' }, h('span', { class: 'cmp-d2v-name' }, name), vals[i]));
              const grid = h('div', { class: 'cmp-d2v-grid' }, rows);
              const o = out();
              function bump() {
                if (busy) return;
                n++; vals.forEach(v => { v.textContent = String(n); v.className = 'cmp-d2v-val'; replay(v, 'pop-soft'); });
                say(o, `${hl(`count = ${n}`)} <span class="muted">// written to all five places</span>`);
              }
              async function hit(ev) {
                if (busy) return; busy = true;
                say(o, `${esc(ev.src)}…`);
                for (let i = 0; i < HOLDERS.length; i++) {
                  await sleep(260); if (!el.isConnected) return;
                  const v = vals[i];
                  if (ev.keep[i]) { v.className = 'cmp-d2v-val cmp-d2v-kept'; replay(v, 'pop'); }
                  else { v.className = 'cmp-d2v-val cmp-d2v-lost'; v.textContent = '0'; replay(v, 'shake'); }
                }
                say(o, `${ev.keep.filter(Boolean).length} of 5 kept. ${esc(ev.note)}`);
                busy = false;
              }
              el.append(grid,
                h('div', { class: 'controls' }, cmd('count++', bump)),
                h('div', { class: 'controls' }, EVENTS.map(ev => act(ev.src, () => hit(ev)))),
                o);
              say(o, 'Each row holds the same count. Fire an event and see who keeps it.');
            },
          },
          {
            title: 'Keep state for screens that come back',
            body: `<p>Say you switch tabs with a plain <code>when (tab)</code>. The old tab leaves the composition, so its <code>rememberSaveable</code> values are gone when you return. <code>rememberSaveableStateHolder()</code> fixes that. Wrap each screen in <code>SaveableStateProvider(key)</code> and the holder keeps that screen’s saved values while it is away, then hands them back.</p>
<p>You use this more often than you think. Navigation Compose keeps one per back stack entry, which is why a screen you return to keeps its scroll and fields. Lazy lists keep one per item key, so <code>rememberSaveable</code> inside a row survives scrolling off screen. That is also why lazy item keys must be types a Bundle can hold.</p>`,
            code: `@Composable
fun HomeTabs(tab: Tab) {
    val holder = rememberSaveableStateHolder()
    holder.SaveableStateProvider(key = tab.name) {
        when (tab) {
            Tab.Feed -> FeedScreen()         // its rememberSaveable state is kept per key
            Tab.Profile -> ProfileScreen()
        }
    }
}`,
            visual(el) {
              let tab = 'Feed', held = false, busy = false;
              const counts = { Feed: 0, Profile: 0 }, stash = {};
              const num = h('b', { class: 'cmp-d2v-num' }, '0');
              const screen = h('div', { class: 'cmp-d2v-screen' }, h('span', { class: 'cmp-label' }), num);
              const store = h('div', { class: 'cmp-d2v-entries' });
              const holderBox = h('div', { class: 'cmp-bundle' }, h('span', { class: 'cmp-bundle-title' }, 'SaveableStateHolder'), store);
              const o = out();
              const tabBtns = ['Feed', 'Profile'].map(t => cmd(`tab = Tab.${t}`, () => go(t)));
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2v-holder' });
              function paint() {
                screen.firstElementChild.textContent = `${tab}Screen · rememberSaveable`;
                num.textContent = String(counts[tab]);
                tabBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(['Feed', 'Profile'][i] === tab)));
                const entries = Object.entries(stash);
                store.replaceChildren(...(entries.length
                  ? entries.map(([k, v]) => h('span', { class: 'cmp-d2v-code', html: hl(`"${k}" → likes = ${v}`) }))
                  : [h('span', { class: 'tip' }, held ? 'Empty' : 'Not used')]));
                holderBox.classList.toggle('cmp-d2v-off', !held);
              }
              async function go(t) {
                if (busy || t === tab) return; busy = true;
                const old = tab;
                if (held) { stash[old] = counts[old]; paint(); }
                screen.classList.add('cmp-fade');
                say(o, `${old}Screen leaves the composition.${held ? ' The holder keeps its saved values.' : ' Its rememberSaveable values are dropped.'}`);
                await sleep(450); if (!el.isConnected) return;
                if (!held) counts[old] = 0;
                tab = t;
                const back = held && stash[t] !== undefined;
                counts[t] = back ? stash[t] : (held ? counts[t] : 0);
                if (back) delete stash[t];
                screen.classList.remove('cmp-fade'); paint(); replay(num, back ? 'cmp-flash' : 'pop');
                say(o, back ? `<span class="good">restored:</span> ${t}Screen got likes = ${counts[t]} back from the holder.` : `${t}Screen starts fresh at ${counts[t]}.${held ? '' : ' <span class="muted">Anything it had before is gone.</span>'}`);
                busy = false;
              }
              function like() { if (busy) return; counts[tab]++; num.textContent = String(counts[tab]); replay(num, 'pop'); say(o, `${hl('likes++')} <span class="muted">// on ${tab}Screen</span>`); }
              sw.addEventListener('change', () => {
                if (busy) { sw.checked = held; return; }
                held = sw.checked; Object.keys(stash).forEach(k => delete stash[k]); paint(); replay(holderBox, 'pop-soft');
                say(o, held ? `${hl('holder.SaveableStateProvider(key = tab.name)')} <span class="muted">// like, switch tabs, come back</span>` : 'Plain when (tab). Like, switch tabs, come back.');
              });
              paint();
              say(o, 'Like a few times, switch to Profile, then come back to Feed.');
              el.append(
                h('div', { class: 'stage' }, screen, holderBox),
                h('div', { class: 'controls' }, tabBtns, cmd('likes++', like)),
                h('label', { class: 'switch', for: 'cmp-d2v-holder' }, sw, 'Wrap in SaveableStateProvider'),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>Every <code>rememberSaveable</code> registers a value provider with the nearest <code>SaveableStateRegistry</code>, found through <code>LocalSaveableStateRegistry</code>. If you don’t pass a key, the key comes from <code>currentCompositeKeyHash</code>, which describes the call’s position in the tree. On Android, the registry at the root is connected to the <code>SavedStateRegistry</code> of the owner that hosts the composition, usually the Activity or a navigation back stack entry.</p>
<p>When the Activity saves its state, the registry calls every provider, runs each value through its Saver, checks that the result can go into a Bundle, and stores everything as one map. On restore, the new registry starts with that map, and each <code>rememberSaveable</code> takes back the value under its key. When the composable leaves the composition, it unregisters its provider, so nothing is saved for it any more.</p>`,
          code: `// rememberSaveable, as a sketch
val registry = LocalSaveableStateRegistry.current
val key = currentCompositeKeyHash.toString(36)           // its position in the tree
val value = remember {
    registry?.consumeRestored(key)?.let { saver.restore(it) } ?: init()
}
DisposableEffect(registry, key) {
    val entry = registry?.registerProvider(key) { saver.save(value) }
    onDispose { entry?.unregister() }                    // left the tree: forgotten
}`,
        },
        mistakes: [
          {
            title: 'remember for what the user typed',
            bad: `var note by remember { mutableStateOf("") }
OutlinedTextField(value = note, onValueChange = { note = it })`,
            good: `var note by rememberSaveable { mutableStateOf("") }
OutlinedTextField(value = note, onValueChange = { note = it })`,
            why: 'Users rotate the phone and switch apps in the middle of typing. Input they made belongs in <code>rememberSaveable</code> or a <code>SavedStateHandle</code>.',
          },
          {
            title: 'A listSaver that restores in the wrong order',
            bad: `val FilterSaver = listSaver<Filter, Any>(
    save = { listOf(it.tag, it.minPrice) },
    restore = { Filter(it[1] as String, it[0] as Int) },
)`,
            good: `val FilterSaver = listSaver<Filter, Any>(
    save = { listOf(it.tag, it.minPrice) },
    restore = { Filter(it[0] as String, it[1] as Int) },
)`,
            why: '<code>restore</code> only runs when the screen comes back, so this <code>ClassCastException</code> hides during normal use. Rotate, or turn on “Don’t keep activities” in developer options, to test restore paths.',
          },
          {
            title: 'Saving the data instead of the key to it',
            bad: `var results by rememberSaveable {
    mutableStateOf(emptyList<Product>())   // 500 Parcelable products
}`,
            good: `var query by rememberSaveable { mutableStateOf("") }
val results by vm.results.collectAsStateWithLifecycle()   // loaded from query`,
            why: 'Saved state travels through a Binder transaction. Android recommends keeping it under 50 KB, and going past the 1 MB buffer throws <code>TransactionTooLargeException</code>. Save the query or an id and reload the data.',
          },
        ],
        visual(el) {
          const scr = (p, s) => `<div class="ui-m-bar">Counters</div><div class="ui-m-body"><div class="ui-m-row"><div>remember</div><b style="margin-left:auto">${p}</b></div><div class="ui-m-row"><div>rememberSaveable</div><b style="margin-left:auto">${s}</b></div><span class="ui-m-btn plus">+1 both</span></div>`;
          const home = '<div class="ui-m-body" style="background:var(--sunk)"><div class="ui-m-center ui-m-muted">Home screen</div></div>';
          Lab.ui.phone(el, {
            logTitle: 'What runs',
            predict: {
              q: 'When does <code>rememberSaveable</code> put its value into the saved-state Bundle?',
              options: ['On every change of the value', 'When the Activity saves its state, before it can be destroyed', 'Only when the process is killed'],
              a: 1,
              why: 'It registers with the saved-state registry. The registry asks for the value when the Activity saves its instance state, which happens before a rotation or a stop.',
            },
            frames: [
              { screen: scr(3, 3), log: '// remember and rememberSaveable, both at 3', say: 'Two counters. One uses <code>remember</code>, the other <code>rememberSaveable</code>.' },
              { tap: '.plus', screen: scr(4, 4), log: 'count++ on both', say: 'Both go to 4. While the Activity lives, they behave the same.' },
              { log: 'onSaveInstanceState(): Bundle { saved = 4 }', say: 'The user rotates. Before the old Activity goes, <code>rememberSaveable</code> writes its value into the Bundle. <code>remember</code> writes nothing.' },
              { screen: '<div class="ui-m-body"><div class="ui-m-center ui-m-muted">new Activity, new composition</div></div>', log: 'onDestroy() → new Activity: onCreate()', say: 'The old Activity and its whole composition are gone. A new one starts from scratch.' },
              { screen: scr(0, 4), log: ['remember { 0 }  // nothing to hand back', 'rememberSaveable: reads saved = 4'], say: '<code>remember</code> has no slot from before, so it starts at 0. <code>rememberSaveable</code> finds 4 in the Bundle.' },
              { screen: home, log: '// app in the background: the system kills the process', say: 'The user switches apps, and the system kills the process to free memory.' },
              { screen: scr(0, 4), log: 'new process: Bundle restored, saved = 4', say: 'The user comes back. A new process, a new Activity, and the same Bundle: the saved value survives process death too.' },
              { screen: scr(0, 0), log: '// swiped away from Recents, opened again: no Bundle', say: 'If the user swipes the app away, they closed it. The saved state is thrown away and both start fresh.' },
            ],
          });
        },
      },

      // 8 ─────────────────────────────────────────────
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
          { q: 'A search bar shares <code>query</code> and <code>expanded</code> between a field and a suggestions list. No business rule cares about <code>expanded</code>. Where should this state live?', options: ['In the screen’s ViewModel as two StateFlows', 'In a plain state holder class created with <code>rememberSearchBarState()</code>', 'In each composable’s own <code>remember</code>'], a: 1, why: 'Shared UI logic with no business rules fits a plain <code>@Stable</code> state holder. The ViewModel is for state that comes from or feeds the app’s logic.' },
          { q: 'Why should a leaf like <code>EmailField</code> take <code>value</code> and <code>onValueChange</code> instead of the <code>SignupViewModel</code>?', options: ['It then works in previews, tests and other screens with plain values and lambdas', 'ViewModels cannot be passed as parameters to composables', 'A ViewModel parameter makes the field recompose on every frame'], a: 0, why: 'A leaf that takes the ViewModel can only run where that ViewModel and its dependencies can be built. Values and lambdas work anywhere.' },
        ],
        deeper: [
          {
            title: 'Pick the right owner',
            body: `<p>Hoisting doesn’t mean “move everything to the ViewModel”. There are three common owners. State only one composable cares about, like whether its menu is open, stays in that composable with <code>remember</code>. State with UI logic that several composables share goes into a <em>plain state holder</em>: a small class you create with a <code>remember…State()</code> function, like <code>LazyListState</code> or your own <code>SearchBarState</code>. State that comes from or feeds business logic, like data from a repository, goes in the screen’s <code>ViewModel</code>.</p>
<p>Ask two questions: who reads it, and does the app’s logic care about it? Hoist to the lowest owner that answers both.</p>`,
            code: `@Stable
class SearchBarState(initialQuery: String = "") {
    var query by mutableStateOf(initialQuery)
        private set
    var expanded by mutableStateOf(false)
        private set

    fun onQueryChange(q: String) { query = q; expanded = q.isNotEmpty() }
    fun close() { expanded = false }
}

@Composable
fun rememberSearchBarState(): SearchBarState = remember { SearchBarState() }
// Add a Saver and rememberSaveable if the query should survive rotation.`,
            visual(el) {
              const OWNERS = [['local', 'remember in the composable'], ['holder', 'plain state holder class'], ['vm', 'ViewModel']];
              const CASES = [
                { q: 'Is this overflow menu open?', a: 'local', why: 'Only the menu reads it, and no business logic cares. Keep it inside.' },
                { q: 'Scroll position, so the screen can show “Back to top”', a: 'holder', why: 'LazyListState is a plain state holder. Hoist rememberLazyListState() to the screen so both the list and the button can use it.' },
                { q: 'Query text, suggestions shown, expanded: a search bar’s UI logic', a: 'holder', why: 'Several fields that change together, with UI rules. A SearchBarState class keeps them in one place and easy to test.' },
                { q: 'The list of orders loaded from the repository', a: 'vm', why: 'It comes from business logic and must survive rotation. That is the ViewModel’s job.' },
              ];
              let i = 0, busy = false;
              const cols = OWNERS.map(([k, label]) => h('div', { class: 'cmp-d2h-col', 'data-k': k }, h('span', { class: 'cmp-label' }, label), h('div', { class: 'cmp-d2h-drop' })));
              const card = h('div', { class: 'cmp-d2h-card' });
              const o = out();
              const btns = OWNERS.map(([k, label]) => act(label, () => answer(k)));
              function show() {
                if (i >= CASES.length) {
                  card.textContent = 'All placed. Reset to try again.'; card.classList.add('cmp-d2h-done');
                  btns.forEach(b => { b.disabled = true; });
                  return;
                }
                card.textContent = CASES[i].q; card.classList.remove('cmp-d2h-done');
                replay(card, 'drop-in');
              }
              async function answer(k) {
                if (busy || i >= CASES.length) return;
                const c = CASES[i];
                if (k !== c.a) {
                  replay(card, 'shake');
                  say(o, `<span class="bad">Not quite.</span> ${k === 'vm' ? 'A ViewModel would work, but this is pure UI state. Hoist only as high as its readers.' : k === 'local' ? 'Others need to read or drive it, so it can’t stay private.' : 'A class adds structure that this case doesn’t need, or lacks the lifetime it needs.'}`);
                  return;
                }
                busy = true;
                const col = cols[OWNERS.findIndex(x => x[0] === k)];
                const chip = h('span', { class: 'cmp-d2h-chip drop-in' }, c.q);
                col.querySelector('.cmp-d2h-drop').append(chip);
                replay(col, 'cmp-flash');
                say(o, `<span class="good">Yes.</span> ${esc(c.why)}`);
                i++;
                await sleep(500); if (!el.isConnected) return;
                show(); busy = false;
              }
              el.append(card, h('div', { class: 'controls' }, btns), h('div', { class: 'cmp-d2h-cols' }, cols), o);
              show();
              say(o, 'Where should this state live? Pick an owner.');
            },
          },
          {
            title: 'Pass values and lambdas, not the ViewModel',
            body: `<p>Only the screen-level composable should know about the ViewModel. It collects the state and passes plain values and lambdas down. A leaf like <code>EmailField(value, onValueChange)</code> then works anywhere: in a <code>@Preview</code> with fake data, in a UI test with a lambda that records calls, and on another screen with a different ViewModel.</p>
<p>A leaf that takes the ViewModel can only run where that ViewModel can be built, with its repository and everything behind it.</p>`,
            code: `@Composable
fun SignupRoute(vm: SignupViewModel = hiltViewModel()) {
    val email by vm.email.collectAsStateWithLifecycle()
    SignupScreen(email = email, onEmailChange = vm::onEmailChange, onSubmit = vm::submit)
}

@Preview
@Composable
fun SignupScreenPreview() {
    SignupScreen(email = "ada@lab.dev", onEmailChange = {}, onSubmit = {})
}`,
            visual(el) {
              const TRIES = [
                { k: 'preview', src: 'Render the @Preview', ok: 'Rendered with email = "ada@lab.dev". No ViewModel needed.', bad: 'The preview can’t build SignupViewModel. It needs a repository and a network client.' },
                { k: 'test', src: 'Run a UI test', ok: 'The test passed a lambda that records calls, typed, and checked it got "ada@". Done.', bad: 'The test has to build a fake repository and a whole ViewModel just to type into one field.' },
                { k: 'reuse', src: 'Reuse on the Profile screen', ok: 'ProfileScreen passes its own email and callback. Same field, different owner.', bad: 'EmailField only knows SignupViewModel. Profile can’t use it without that ViewModel.' },
              ];
              let plain = true, busy = false;
              const sig = h('div', { class: 'kt' });
              const rows = TRIES.map(t => ({ t, mark: h('span', { class: 'cmp-d2h-mark' }, '·'), line: h('span', { class: 'cmp-d2h-line' }, t.src) }));
              const list = h('div', { class: 'cmp-d2h-list' }, rows.map(r => h('div', { class: 'cmp-d2h-try' }, r.mark, r.line)));
              const o = out();
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2h-plain', checked: true });
              function paintSig() {
                sig.innerHTML = hl(plain ? '@Composable\nfun EmailField(value: String, onValueChange: (String) -> Unit)' : '@Composable\nfun EmailField(vm: SignupViewModel)');
                rows.forEach(r => { r.mark.textContent = '·'; r.mark.className = 'cmp-d2h-mark'; });
              }
              async function tryIt(r) {
                if (busy) return; busy = true;
                r.mark.textContent = '…'; r.mark.className = 'cmp-d2h-mark';
                await sleep(450); if (!el.isConnected) return;
                r.mark.textContent = plain ? '✓' : '✗';
                r.mark.className = `cmp-d2h-mark ${plain ? 'cmp-d2h-ok' : 'cmp-d2h-no'}`;
                replay(r.mark, 'pop');
                say(o, `${plain ? '<span class="good">Works.</span>' : '<span class="bad">Stuck.</span>'} ${esc(plain ? r.t.ok : r.t.bad)}`);
                busy = false;
              }
              sw.addEventListener('change', () => {
                if (busy) { sw.checked = plain; return; }
                plain = sw.checked; paintSig(); replay(sig, 'pop-soft');
                say(o, plain ? 'Stateless leaf: it takes a value and a lambda.' : 'The leaf takes the whole ViewModel. Try the same three things.');
              });
              paintSig();
              say(o, 'Try each use of EmailField. Then switch the signature and try again.');
              el.append(sig, list,
                h('div', { class: 'controls' }, rows.map(r => act(r.t.src, () => tryIt(r)))),
                h('label', { class: 'switch', for: 'cmp-d2h-plain' }, sw, 'value + onValueChange'),
                o);
            },
          },
          {
            title: 'Offer a stateful and a stateless version',
            body: `<p>A reusable component often comes in two layers. The stateless one takes the value and a callback, so callers keep full control. A stateful overload owns the state and calls the stateless one, for callers who don’t care. Material follows the same idea: a <code>Slider</code> takes <code>value</code> and <code>onValueChange</code>, and its state lives with the caller.</p>
<p>Write the stateless version first. The stateful one is then three lines, and tests and previews use the stateless one directly.</p>`,
            code: `// Stateless: the caller owns the value
@Composable
fun Stepper(value: Int, onValueChange: (Int) -> Unit, modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { onValueChange(value - 1) }) { Text("−") }
        Text("$value")
        IconButton(onClick = { onValueChange(value + 1) }) { Text("+") }
    }
}

// Stateful convenience overload
@Composable
fun Stepper(modifier: Modifier = Modifier) {
    var value by rememberSaveable { mutableIntStateOf(0) }
    Stepper(value = value, onValueChange = { value = it }, modifier = modifier)
}`,
          },
        ],
        underHood: {
          body: `<p>Hoisting is plain Kotlin: a value parameter and a function parameter. The interesting part is what happens to the lambda. Writing <code>onValueChange = { email = it }</code> inside a composable would create a new lambda object on every recomposition, and a new object would stop <code>EmailField</code> from skipping.</p>
<p>With strong skipping, the default since Kotlin 2.0.20, the Compose compiler wraps lambdas created in a composable in <code>remember</code>, keyed on the values they capture. Here the lambda captures the <code>MutableState</code> behind <code>email</code>, which is the same object every time, so the same lambda instance is reused and <code>EmailField</code> can skip. The Compose, advanced track goes deeper on stability.</p>`,
          code: `// You write
var email by remember { mutableStateOf("") }
EmailField(value = email, onValueChange = { email = it })

// With strong skipping, the compiler produces roughly
val emailState = remember { mutableStateOf("") }
EmailField(
    value = emailState.value,
    onValueChange = remember(emailState) { { text: String -> emailState.value = text } },
)`,
        },
        mistakes: [
          {
            title: 'Passing MutableState down',
            bad: `@Composable
fun EmailField(email: MutableState<String>) {
    OutlinedTextField(value = email.value, onValueChange = { email.value = it })
}`,
            good: `@Composable
fun EmailField(value: String, onValueChange: (String) -> Unit) {
    OutlinedTextField(value = value, onValueChange = onValueChange)
}`,
            why: 'The child can now write the state behind the owner’s back, so any trimming or validation in the owner is skipped. With a callback, every change goes through the owner.',
          },
          {
            title: 'Hoisting UI-only state into the ViewModel',
            bad: `class ProfileViewModel : ViewModel() {
    val menuExpanded = MutableStateFlow(false)
    fun toggleMenu() { menuExpanded.update { !it } }
}`,
            good: `@Composable
fun OverflowMenu(onSignOut: () -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    IconButton(onClick = { expanded = true }) { Icon(Icons.Default.MoreVert, "More") }
    DropdownMenu(expanded, onDismissRequest = { expanded = false }) { /* items */ }
}`,
            why: 'Hoist only as high as the readers. Nothing outside the menu reads <code>expanded</code>, and no business rule depends on it, so the ViewModel only adds plumbing.',
          },
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
        predict: {
          q: 'The state is hoisted. The user types “@” into <code>EmailField</code>. What changes the text shown in the field?',
          options: ['The field updates its own text, then tells the parent', 'The parent sets <code>email</code>, and the new value comes back down as <code>value</code>', 'Both update at the same time'],
          a: 1,
          why: 'A stateless field only reports the edit through <code>onValueChange</code>. The owner updates the state, and the field shows whatever comes back down.',
        },
      },

      // Overlays ─────────────────────────────────────────────
      {
        id: 'overlays',
        title: 'Dialogs, bottom sheets, snackbars and menus',
        tagline: 'A Boolean in state decides if the overlay exists. Your code turns it off.',
        level: 'beginner',
        body: `
<p>Material 3 gives you four everyday overlays. <code>AlertDialog</code> asks a short question with confirm and dismiss buttons. <code>ModalBottomSheet</code> slides up a panel of choices. <code>DropdownMenu</code> opens a small list next to the button that opened it. A snackbar shows a brief message at the bottom, through the <code>SnackbarHost</code> in your <code>Scaffold</code> (see the Scaffold lesson).</p>
<p>Dialogs, sheets and menus are not opened with a call. You keep a flag in state, like <code>var confirmDelete by remember { mutableStateOf(false) }</code>, and write <code>if (confirmDelete) AlertDialog(...)</code>. A tap sets the flag to <code>true</code> and the dialog enters composition. Setting it back to <code>false</code> removes it.</p>
<p>When the user taps outside or presses back, the component calls <code>onDismissRequest</code>. It does not close itself: your lambda must set the flag to <code>false</code>. Each button must do the same. Use <code>rememberSaveable</code> for the flag if the dialog should survive rotation.</p>`,
        code: `@OptIn(ExperimentalMaterial3Api::class)   // ModalBottomSheet is still experimental
@Composable
fun NoteActions(note: Note, onDelete: () -> Unit, onShare: (String) -> Unit) {
    var menuOpen by remember { mutableStateOf(false) }
    var confirmDelete by rememberSaveable { mutableStateOf(false) }
    var showShare by rememberSaveable { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()
    val scope = rememberCoroutineScope()

    Box {                                       // the menu anchors to this Box
        IconButton(onClick = { menuOpen = true }) {
            Icon(Icons.Default.MoreVert, contentDescription = "More options")
        }
        DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
            DropdownMenuItem(text = { Text("Share") }, onClick = { menuOpen = false; showShare = true })
            DropdownMenuItem(text = { Text("Delete") }, onClick = { menuOpen = false; confirmDelete = true })
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete note?") },
            text = { Text("“\${note.title}” will be removed from all your devices.") },
            confirmButton = { TextButton(onClick = { confirmDelete = false; onDelete() }) { Text("Delete") } },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        )
    }

    if (showShare) {
        ModalBottomSheet(onDismissRequest = { showShare = false }, sheetState = sheetState) {
            listOf("WhatsApp", "E-posta", "Copy link").forEach { target ->
                ListItem(
                    headlineContent = { Text(target) },
                    modifier = Modifier.clickable {
                        onShare(target)
                        scope.launch { sheetState.hide() }.invokeOnCompletion {
                            if (!sheetState.isVisible) showShare = false
                        }
                    },
                )
            }
        }
    }
}`,
        remember: 'A flag in state shows the overlay. onDismissRequest and every button must set it back to false.',
        terms: [
          { term: 'AlertDialog', def: 'A Material 3 dialog with a title, text and confirm and dismiss buttons, shown while it is in composition.' },
          { term: 'onDismissRequest', def: 'The callback a dialog, sheet or menu calls when the user taps outside or presses back. Your code decides whether to close it.' },
          { term: 'ModalBottomSheet', def: 'A panel that slides up from the bottom over a scrim. Its SheetState drives the show and hide animations.' },
          { term: 'DropdownMenu', def: 'A popup list anchored to its parent, open while expanded is true.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Open the menu from the button and close it when the user taps outside.', code: 'var expanded by remember { mutableStateOf(false) }\nBox {\n    IconButton(onClick = { expanded = true }) { Icon(Icons.Default.MoreVert, "More options") }\n    DropdownMenu(expanded = [[expanded]], onDismissRequest = { expanded = [[false]] }) {\n        DropdownMenuItem(text = { Text("Share") }, onClick = { expanded = false; onShare() })\n    }\n}', why: 'The menu shows while <code>expanded</code> is true. A tap outside calls <code>onDismissRequest</code>, and only your lambda turns the flag off.' },
          { type: 'bug', prompt: 'Tapping Delete removes the note, but the dialog stays on screen. Tap the wrong line.', code: 'var confirmDelete by rememberSaveable { mutableStateOf(false) }\nif (confirmDelete) {\n    AlertDialog(\n        onDismissRequest = { confirmDelete = false },\n        title = { Text("Delete note?") },\n        confirmButton = { TextButton(onClick = { onDelete() }) { Text("Delete") } },\n        dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },\n    )\n}', bug: 5, fix: '        confirmButton = { TextButton(onClick = { confirmDelete = false; onDelete() }) { Text("Delete") } },', why: 'The dialog is on screen because <code>confirmDelete</code> is true. Clicking a button does not change that. Each button must set the flag to false itself.' },
        ],
        quiz: [
          { q: 'The user taps the scrim outside an <code>AlertDialog</code>. What happens?', options: ['The dialog closes by itself', '<code>onDismissRequest</code> runs; the dialog closes only if your code sets the flag to false', 'Nothing, dialogs ignore outside taps'], a: 1, why: 'The dialog asks to be dismissed. It stays as long as the <code>if</code> around it is true.' },
          { q: 'Why call <code>sheetState.hide()</code> before setting <code>showShare = false</code>?', options: ['So the slide-down animation plays before the sheet leaves composition', 'Because <code>hide()</code> saves the state', 'It is not needed; the result is the same'], a: 0, why: 'Removing the sheet from composition takes it away at once. <code>hide()</code> animates it down first, and <code>invokeOnCompletion</code> removes it afterwards.' },
          { q: 'Where does a <code>DropdownMenu</code> appear?', options: ['Always at the top of the screen', 'Next to its parent, such as the Box that holds the button', 'In the middle of the screen'], a: 1, why: 'The menu is placed relative to its parent layout. Put it in the same <code>Box</code> as the button that opens it.' },
          { q: 'A list lets the user delete any note after confirming. Which state shape fits best?', options: ['<code>var pendingDelete by remember { mutableStateOf&lt;Note?&gt;(null) }</code>: non-null means the dialog is open', '<code>var confirm by remember { mutableStateOf(false) }</code> plus a separate <code>var selected: Note?</code>', 'A global <code>object DialogState</code> with the note inside'], a: 0, why: 'One nullable value cannot drift apart the way a Boolean and a selection can, and the dialog always has the right note.' },
        ],
        deeper: [
          {
            title: 'Hide the sheet, then remove it',
            body: `
<p><code>SheetState</code> has suspend functions <code>show()</code> and <code>hide()</code> that animate the sheet. If a button inside the sheet just sets <code>showShare = false</code>, the sheet leaves composition at once and the slide-down never plays.</p>
<p>The pattern from the docs: launch <code>sheetState.hide()</code>, and in <code>invokeOnCompletion</code> set the flag to <code>false</code> once <code>sheetState.isVisible</code> is false. Swipes down and taps on the scrim already animate before they call <code>onDismissRequest</code>.</p>`,
            code: `Button(onClick = {
    scope.launch { sheetState.hide() }.invokeOnCompletion {
        if (!sheetState.isVisible) showShare = false   // remove only after the animation
    }
}) { Text("Done") }`,
            visual(el) {
              let open = false, busy = false;
              const sheet = h('div', { class: 'cmp-ov-sheet' }, h('i', { class: 'cmp-ov-handle' }), h('div', { class: 'cmp-ov-sitem' }, 'WhatsApp'), h('div', { class: 'cmp-ov-sitem' }, 'E-posta'));
              const scrim = h('div', { class: 'cmp-ov-scrim' });
              const phone = h('div', { class: 'cmp-ov-phone cmp-ov-mini' }, h('div', { class: 'cmp-ov-bar' }, 'Notes'), h('div', { class: 'cmp-ov-note' }, 'Shopping list'), scrim, sheet);
              const read = h('div', { class: 'kt' });
              const o = out();
              const paint = (vis) => { read.innerHTML = hl(`showShare = ${open}\nsheetState.isVisible = ${vis}`); };
              const openSheet = async () => {
                if (busy || open) return; busy = true; open = true; paint(false);
                scrim.classList.add('cmp-on'); sheet.style.transition = ''; void sheet.offsetWidth; sheet.classList.add('cmp-on');
                await sleep(350); if (!el.isConnected) return; paint(true); busy = false;
                say(o, 'Sheet open. Close it both ways and compare.');
              };
              async function closeDirect() {
                if (busy || !open) return say(o, 'Open the sheet first.');
                open = false; paint(true);
                sheet.style.transition = 'none'; sheet.classList.remove('cmp-on'); scrim.classList.remove('cmp-on');
                paint(false);
                say(o, `${hl('showShare = false')} <span class="bad">// gone in one frame, no slide</span>`);
              }
              async function closeHide() {
                if (busy || !open) return say(o, 'Open the sheet first.');
                busy = true; sheet.style.transition = '';
                say(o, `${hl('scope.launch { sheetState.hide() }')} <span class="muted">// animating…</span>`);
                sheet.classList.remove('cmp-on'); scrim.classList.remove('cmp-on');
                await sleep(450); if (!el.isConnected) return;
                open = false; paint(false); replay(read, 'pop-soft');
                say(o, `${hl('invokeOnCompletion { if (!sheetState.isVisible) showShare = false }')} <span class="good">// removed after the slide</span>`);
                busy = false;
              }
              paint(false);
              say(o, 'Open the sheet, then close it.');
              el.append(h('div', { class: 'cmp-ov-wrap' }, phone, h('div', { class: 'cmp-ov-side' },
                h('div', { class: 'controls' }, act('Open sheet', openSheet)),
                h('div', { class: 'controls' }, cmd('showShare = false', closeDirect), cmd('sheetState.hide() then false', closeHide)),
                read)), o);
            },
          },
          {
            title: 'Keep the item, not just a Boolean',
            body: `
<p>A dialog that confirms an action on one item needs to know which item. Two separate variables, a Boolean and a selected note, can drift apart. Keep one nullable value instead: the note waiting for confirmation. Non-null means the dialog is open, and the dialog always has the right note.</p>
<p>When the dialog comes from data rather than a tap, such as “Your session expired”, put it in the ViewModel’s UI state and let the screen render it like everything else.</p>`,
            code: `var pendingDelete by remember { mutableStateOf<Note?>(null) }

NoteList(notes, onDeleteClick = { note -> pendingDelete = note })

pendingDelete?.let { note ->
    AlertDialog(
        onDismissRequest = { pendingDelete = null },
        title = { Text("Delete “\${note.title}”?") },
        confirmButton = { TextButton(onClick = { pendingDelete = null; vm.delete(note.id) }) { Text("Delete") } },
        dismissButton = { TextButton(onClick = { pendingDelete = null }) { Text("Cancel") } },
    )
}`,
          },
        ],
        underHood: {
          body: `
<p><code>AlertDialog</code> is built on <code>Dialog</code>, and <code>ModalBottomSheet</code> uses its own dialog. Both open a separate Android window above your activity’s window. <code>DropdownMenu</code> uses a <code>Popup</code>, which is also its own window. That is why they draw above everything, including the Scaffold bars, no matter where in the tree you write them.</p>
<p>The window lives exactly as long as the composable is in composition. The <code>if</code> around it is the switch: when it becomes false, Compose disposes the composable and the window is removed.</p>`,
        },
        mistakes: [
          {
            title: 'An empty onDismissRequest',
            bad: `if (confirmDelete) {
    AlertDialog(
        onDismissRequest = { },
        confirmButton = { TextButton(onClick = { confirmDelete = false; onDelete() }) { Text("Delete") } },
        title = { Text("Delete note?") },
    )
}`,
            good: `if (confirmDelete) {
    AlertDialog(
        onDismissRequest = { confirmDelete = false },
        confirmButton = { TextButton(onClick = { confirmDelete = false; onDelete() }) { Text("Delete") } },
        dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        title = { Text("Delete note?") },
    )
}`,
            why: 'With an empty lambda, back and outside taps do nothing, and with no Cancel button the only way out is to delete. Block dismissal only when you really must, and say why on screen.',
          },
          {
            title: 'Closing the sheet without hide()',
            bad: `ListItem(
    headlineContent = { Text("Copy link") },
    modifier = Modifier.clickable { copy(); showShare = false },
)`,
            good: `ListItem(
    headlineContent = { Text("Copy link") },
    modifier = Modifier.clickable {
        copy()
        scope.launch { sheetState.hide() }.invokeOnCompletion {
            if (!sheetState.isVisible) showShare = false
        }
    },
)`,
            why: 'Setting the flag removes the sheet in one frame. It looks like a glitch next to the smooth slide the user gets when they swipe it down.',
          },
          {
            title: 'remember for a dialog that must survive rotation',
            bad: `var confirmDelete by remember { mutableStateOf(false) }`,
            good: `var confirmDelete by rememberSaveable { mutableStateOf(false) }`,
            why: 'Rotation recreates the activity. A plain <code>remember</code> flag resets to false and the question the user was reading disappears.',
          },
        ],
        visual(el) {
          let menuOpen = false, confirm = false, share = false, dismissOk = true, snackT = 0;
          const notes = ['Shopping list', 'Meeting notes'];
          const list = h('div', { class: 'cmp-ov-list' });
          const moreBtn = h('button', { class: 'cmp-ov-more', type: 'button', 'aria-label': 'More options', onclick: () => setMenu(true) }, '⋮');
          const menu = h('div', { class: 'cmp-ov-menu', role: 'menu' },
            h('button', { type: 'button', class: 'cmp-ov-mi', onclick: () => { setMenu(false, true); setShare(true); } }, 'Share'),
            h('button', { type: 'button', class: 'cmp-ov-mi', onclick: () => { setMenu(false, true); setConfirm(true); } }, 'Delete'));
          const catcher = h('div', { class: 'cmp-ov-catch', onclick: () => dismiss('menu') });
          const scrim = h('div', { class: 'cmp-ov-scrim', onclick: () => dismiss(confirm ? 'dialog' : 'sheet') });
          const dlgText = h('p', {});
          const dialog = h('div', { class: 'cmp-ov-dialog', role: 'dialog' }, h('b', {}, 'Delete note?'), dlgText,
            h('div', { class: 'cmp-ov-btns' },
              h('button', { type: 'button', onclick: () => { setConfirm(false, 'Cancel'); } }, 'Cancel'),
              h('button', { type: 'button', onclick: () => { setConfirm(false, 'Delete'); remove(); } }, 'Delete')));
          const sheet = h('div', { class: 'cmp-ov-sheet' }, h('i', { class: 'cmp-ov-handle' }),
            ...['WhatsApp', 'E-posta', 'Copy link'].map(t => h('button', { type: 'button', class: 'cmp-ov-sitem', onclick: () => pick(t) }, t)));
          const snack = h('div', { class: 'cmp-ov-snack', 'aria-live': 'polite' });
          const phone = h('div', { class: 'cmp-ov-phone' },
            h('div', { class: 'cmp-ov-bar' }, h('span', {}, 'Notes'), moreBtn), list, catcher, menu, scrim, dialog, sheet, snack);
          const read = h('div', { class: 'kt' });
          const o = out();
          const paintList = () => list.replaceChildren(...notes.map(n => h('div', { class: 'cmp-ov-note' }, n)));
          const paint = () => {
            read.innerHTML = hl(`menuOpen = ${menuOpen}\nconfirmDelete = ${confirm}\nshowShare = ${share}`);
            replay(read, 'pop-soft');
            menu.classList.toggle('cmp-on', menuOpen); catcher.classList.toggle('cmp-on', menuOpen);
            scrim.classList.toggle('cmp-on', confirm || share);
            dialog.classList.toggle('cmp-on', confirm); sheet.classList.toggle('cmp-on', share);
          };
          function setMenu(v, quiet) {
            if (v && !notes.length) return say(o, 'No notes left. Reset below.');
            menuOpen = v; paint();
            if (!quiet) say(o, v ? `${hl('menuOpen = true')} <span class="muted">// DropdownMenu enters composition next to the ⋮ button</span>` : `${hl('onDismissRequest = { menuOpen = false }')}`);
          }
          function setConfirm(v, why) {
            confirm = v; dlgText.textContent = `“${notes[0] || ''}” will be removed from all your devices.`; paint();
            say(o, v ? `${hl('confirmDelete = true')} <span class="muted">// if (confirmDelete) AlertDialog(…) now runs</span>` : `${hl(`${why}: confirmDelete = false`)} <span class="muted">// the dialog leaves composition</span>`);
          }
          function setShare(v) {
            share = v; paint();
            if (v) say(o, `${hl('showShare = true')} <span class="muted">// ModalBottomSheet slides up</span>`);
          }
          async function pick(t) {
            say(o, `${hl(`onShare("${t}")`)} then ${hl('sheetState.hide()')} <span class="muted">// slide down…</span>`);
            sheet.classList.remove('cmp-on'); scrim.classList.remove('cmp-on');
            await sleep(420); if (!el.isConnected) return;
            share = false; paint();
            toast(`Shared to ${t}`);
          }
          function dismiss(what) {
            const flag = what === 'menu' ? 'menuOpen' : what === 'dialog' ? 'confirmDelete' : 'showShare';
            if (!dismissOk && what !== 'sheet') {
              replay(what === 'menu' ? menu : dialog, 'shake');
              say(o, `${hl('onDismissRequest = { }')} <span class="bad">// called, but nothing changes: ${flag} is still true</span>`);
              return;
            }
            if (what === 'menu') { menuOpen = false; paint(); }
            else if (what === 'dialog') { confirm = false; paint(); }
            else { share = false; paint(); }
            say(o, `${hl(`onDismissRequest = { ${flag} = false }`)} <span class="muted">// outside tap or back</span>`);
          }
          function back() {
            if (confirm) dismiss('dialog'); else if (share) dismiss('sheet'); else if (menuOpen) dismiss('menu');
            else say(o, 'Nothing is open. Back would leave the screen.');
          }
          function remove() {
            const n = notes.shift(); paintList();
            toast(`“${n}” deleted`);
          }
          function toast(msg) {
            clearTimeout(snackT);
            snack.textContent = msg; snack.classList.add('cmp-on');
            snackT = setTimeout(() => snack.classList.remove('cmp-on'), 2400);
          }
          const sw = h('input', { type: 'checkbox', id: 'cmp-ov-dismiss', checked: true });
          sw.addEventListener('change', () => {
            dismissOk = sw.checked;
            say(o, dismissOk ? `${hl('onDismissRequest = { confirmDelete = false }')} <span class="good">// outside taps and back close it</span>` : `${hl('onDismissRequest = { }')} <span class="bad">// open the dialog or menu, then tap outside</span>`);
          });
          paintList(); paint();
          say(o, 'Tap ⋮ in the phone. Open the dialog and the sheet, then tap outside or press back.');
          el.append(
            h('div', { class: 'cmp-ov-wrap' }, phone,
              h('div', { class: 'cmp-ov-side' }, read,
                h('label', { class: 'switch', for: 'cmp-ov-dismiss' }, sw, 'onDismissRequest sets the flag'),
                h('div', { class: 'controls' },
                  act('Press back', back),
                  act('Reset notes', () => { notes.splice(0, notes.length, 'Shopping list', 'Meeting notes'); menuOpen = confirm = share = false; paintList(); paint(); say(o, 'Notes restored.'); })))),
            o);
        },
        predict: {
          q: 'The dialog is open and <code>onDismissRequest = { }</code> is empty. The user presses back. What happens?',
          options: ['The dialog closes anyway', 'The dialog stays: only your code can set the flag to false', 'The whole screen is closed'],
          a: 1,
          why: 'Back calls <code>onDismissRequest</code>, nothing more. The dialog is on screen as long as your flag is true, so an empty lambda keeps it there.',
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'text-input',
        title: 'Text input',
        tagline: 'The field shows your state and reports every edit.',
        body: `
<p><code>TextField</code> and <code>OutlinedTextField</code> are the Material 3 inputs. In the classic form you pass <code>value</code> and <code>onValueChange</code>. The field never changes its own text. It reports each edit, and you write the new text into state. Ignore the callback and typing does nothing.</p>
<p><code>keyboardOptions</code> tells the soft keyboard what to show. <code>KeyboardType.Email</code> adds an @ key, <code>KeyboardType.Number</code> shows digits, and <code>imeAction</code> picks the action key, such as Next or Done. <code>keyboardActions</code> says what that key does. By default, Next moves focus to the next field. The keyboard type does not filter input, so validate the text yourself.</p>
<p>Show errors with <code>isError</code> and explain them in <code>supportingText</code>. Wait until the user has typed something before you complain. Material 3 also has a newer overload that takes a <code>TextFieldState</code> in place of value and callback. The next lesson, TextFieldState and transformations, covers it.</p>`,
        code: `@Composable
fun LoginForm(onSubmit: (String, String) -> Unit) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    val emailError = email.isNotEmpty() && "@" !in email

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            value = email,
            onValueChange = { email = it.trim() },
            label = { Text("Email") },
            singleLine = true,
            isError = emailError,
            supportingText = { if (emailError) Text("Enter a valid email") },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next,          // moves focus to Password
            ),
        )
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(onDone = { onSubmit(email, password) }),
        )
    }
}`,
        remember: 'The field shows value and reports edits. Your state decides what it shows next.',
        level: 'beginner',
        terms: [
          { term: 'OutlinedTextField', def: 'A Material 3 text input with an outlined border and a label that floats up when the field has focus or text.' },
          { term: 'KeyboardOptions', def: 'Settings for the soft keyboard of a text field, such as keyboardType, imeAction and capitalization.' },
          { term: 'ImeAction', def: 'The action key the soft keyboard shows for a field, such as Next, Search or Done.' },
          { term: 'VisualTransformation', def: 'A change to how a text field draws its text, like hiding a password, without changing the value in state.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show a number pad with a Done key for the PIN.', code: 'OutlinedTextField(\n    value = pin,\n    onValueChange = { pin = it.filter(Char::isDigit).take(4) },\n    label = { Text("PIN") },\n    keyboardOptions = KeyboardOptions(\n        keyboardType = KeyboardType.[[NumberPassword|Number]],\n        imeAction = ImeAction.[[Done]],\n    ),\n)', why: '<code>keyboardType</code> picks the keys and <code>imeAction</code> picks the action key. The filter in <code>onValueChange</code> does the real validation.' },
          { type: 'bug', prompt: 'Typing in this field shows nothing. Tap the broken line.', code: '@Composable\nfun NameField() {\n    var name by remember { mutableStateOf("") }\n    OutlinedTextField(\n        value = name,\n        onValueChange = { },\n        label = { Text("Name") },\n    )\n}', bug: 5, fix: '        onValueChange = { name = it },', why: 'The field only shows <code>value</code>. The callback has to write the new text into state, or the field stays empty.' },
        ],
        quiz: [
          { q: 'With <code>onValueChange = { }</code>, what happens when the user types?', options: ['The text appears anyway', 'Nothing changes, because the field keeps showing value'], a: 1, why: 'The field is controlled by your state. It never updates itself.' },
          { q: 'Which option adds an @ key to the soft keyboard?', options: ['<code>imeAction = ImeAction.Next</code>', '<code>keyboardType = KeyboardType.Email</code>', '<code>singleLine = true</code>'], a: 1, why: 'The keyboard type chooses the layout. The IME action only changes the action key.' },
          { q: 'You set <code>imeAction = ImeAction.Next</code> and no <code>keyboardActions</code>. What does the key do?', options: ['Submits the form', 'Moves focus to the next field', 'Nothing'], a: 1, why: 'Next moves focus by default. Pass <code>KeyboardActions(onNext = ...)</code> only to change that.' },
          { q: 'A search field’s <code>onValueChange</code> sends the text into a Flow with <code>debounce(300)</code>, and the field shows the debounced value. What does the user see?', options: ['Smooth typing, with searches every 300 ms', 'Lost letters and a jumping cursor, because the field shows an old value', 'A crash, because <code>onValueChange</code> must not suspend'], a: 1, why: 'The field shows whatever value comes back on the next frame. Write the text to state right away and debounce the search that observes it.' },
        ],
        deeper: [
          {
            title: 'Keep value updates synchronous',
            body: `<p>With <code>value</code> and <code>onValueChange</code>, the field reports an edit and then shows whatever <code>value</code> you pass back on the next frame. If that write is late, for example because it goes through a <code>Flow</code>, a debounce or a database first, the keyboard keeps typing on top of an old value. Letters get lost or the cursor jumps.</p>
<p>So write the new text to state right away, in <code>onValueChange</code>. Do slow work like searching after that, by observing the state. The <code>TextFieldState</code> API has no <code>onValueChange</code> at all, so it can’t get out of sync this way.</p>`,
            code: `class SearchViewModel(private val repo: SearchRepository) : ViewModel() {
    var query by mutableStateOf("")
        private set

    fun onQueryChange(q: String) {
        query = q                        // synchronous: the field shows it next frame
    }

    @OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
    val results = snapshotFlow { query }
        .debounce(300)                   // slow work happens after, not in between
        .mapLatest { repo.search(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}`,
            visual(el) {
              const DELAY = 160, GAP = 70, WORD = 'hello';
              let sync = true, value = '', busy = false, logN = 0;
              const shown = h('span', {});
              const field = h('div', { class: 'cmp-field cmp-d2i-field' }, h('span', { class: 'cmp-field-label' }, 'Search'), h('span', { class: 'cmp-field-line' }, shown, h('span', { class: 'cmp-caret' })));
              const log = h('div', { class: 'cmp-gs-log', 'aria-live': 'polite' });
              const o = out();
              const modeBtns = [[true, 'onValueChange = { query = it }'], [false, 'onValueChange = { queryFlow.emit(it) }  // arrives later']].map(([s, src]) => cmd(src, () => {
                if (busy) return;
                sync = s; modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === (s ? 0 : 1))));
                say(o, s ? 'Synchronous: state changes inside the callback.' : `Async: each update reaches the state ${DELAY} ms later. <span class="muted">A simplified model.</span>`);
              }));
              function addLog(html) {
                log.prepend(h('div', { class: 'drop-in', html: `<span class="muted">${++logN}</span> ${html}` }));
                while (log.children.length > 6) log.lastElementChild.remove();
              }
              const paint = () => { shown.textContent = value; };
              async function typeFast() {
                if (busy) return; busy = true;
                value = ''; paint(); log.replaceChildren(); logN = 0;
                say(o, `Typing ${hl(`"${WORD}"`)}, one key every ${GAP} ms…`);
                for (const ch of WORD) {
                  const proposed = value + ch;
                  addLog(`key ${hl(`'${ch}'`)} → ${hl(`onValueChange("${proposed}")`)}`);
                  if (sync) { value = proposed; paint(); replay(shown, 'pop-soft'); }
                  else setTimeout(() => { if (!el.isConnected) return; value = proposed; paint(); addLog(`<span class="muted">late update:</span> ${hl(`value = "${proposed}"`)}`); }, DELAY);
                  await sleep(GAP); if (!el.isConnected) return;
                }
                await sleep(DELAY + 120); if (!el.isConnected) return;
                const ok = value === WORD;
                replay(field, ok ? 'cmp-flash' : 'shake');
                say(o, ok ? `<span class="good">Typed "${WORD}", got "${value}".</span> Every edit was built on the latest value.` : `<span class="bad">Typed "${WORD}", got "${esc(value)}".</span> Each edit was built on a value that was already old.`);
                busy = false;
              }
              modeBtns[0].setAttribute('aria-pressed', 'true');
              paint();
              say(o, 'Type a word quickly, then switch to the late update and type again.');
              el.append(field, h('div', { class: 'controls' }, modeBtns), h('div', { class: 'controls' }, act(`Type “${WORD}” fast`, typeFast)), log, o);
            },
          },
          {
            title: 'Move focus from code',
            body: `<p>To put the cursor in a field when the screen opens, attach a <code>FocusRequester</code> with <code>Modifier.focusRequester</code> and call <code>requestFocus()</code> from an effect, after the field is in the composition. To close the keyboard after submit, clear focus with <code>LocalFocusManager</code>.</p>`,
            code: `val searchFocus = remember { FocusRequester() }
val focusManager = LocalFocusManager.current

OutlinedTextField(
    value = query,
    onValueChange = { query = it },
    modifier = Modifier.focusRequester(searchFocus),
    keyboardActions = KeyboardActions(onSearch = { focusManager.clearFocus(); search(query) }),
    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
)
LaunchedEffect(Unit) { searchFocus.requestFocus() }`,
          },
        ],
        underHood: {
          body: `<p>The soft keyboard is a separate app, the IME. It talks to the focused field through an input connection and sends edit commands: commit this text, set this composing text, delete around the cursor. The field applies them to its own editing buffer.</p>
<p>In the value-based API, the field then calls <code>onValueChange</code> and waits for you to pass the result back. The <code>TextFieldValue</code> form carries the text, the selection and the composition, the underlined word the keyboard is still working on. If the value you pass back differs from the buffer, the field resets the buffer and updates the keyboard to match. With <code>TextFieldState</code> there is no round trip. The state is the buffer, so the keyboard’s edits land in it directly, after your <code>InputTransformation</code> has seen them.</p>`,
          code: `// The value-based field reports the whole editing state
TextField(
    value = fieldValue,                       // TextFieldValue(text, selection, composition)
    onValueChange = { fieldValue = it },      // write it back, unchanged or filtered
)`,
        },
        mistakes: [
          {
            title: 'A password field with a text keyboard',
            bad: `OutlinedTextField(
    value = password,
    onValueChange = { password = it },
    visualTransformation = PasswordVisualTransformation(),
)`,
            good: `OutlinedTextField(
    value = password,
    onValueChange = { password = it },
    visualTransformation = PasswordVisualTransformation(),
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
)`,
            why: 'The dots only change the drawing. With a normal text keyboard, the IME may suggest words and learn what was typed. <code>KeyboardType.Password</code> tells it this is a password.',
          },
        ],
        visual(el) {
          let email = '', password = '', active = 'email', type = 'Email', ignore = false, hidePw = true, touched = false, logN = 0, kbSig = '';
          const log = h('div', { class: 'cmp-ti-log', 'aria-live': 'polite' });
          const stateBox = h('div', { class: 'cmp-ti-state' });
          const o = out();
          const field = (id, label) => {
            const input = h('input', { id, autocomplete: 'off', spellcheck: 'false' });
            const wrap = h('div', { class: 'cmp-ti-field' }, h('label', { class: 'cmp-ti-label', for: id }, label), input);
            return { input, wrap };
          };
          const em = field('cmp-ti-email', 'Email'), pw = field('cmp-ti-pass', 'Password');
          const eye = h('button', { class: 'cmp-ti-eye', type: 'button', 'aria-label': 'Toggle password visibility', onmousedown: e => e.preventDefault(), onclick: () => { hidePw = !hidePw; paint(); say(o, hidePw ? `${hl('PasswordVisualTransformation()')} <span class="muted">// draws dots. The value in state is unchanged.</span>` : `${hl('VisualTransformation.None')} <span class="muted">// same value, drawn as plain text</span>`); } }, 'show');
          pw.wrap.append(eye);
          const support = h('div', { class: 'cmp-ti-support' });
          const submit = h('span', { class: 'cmp-pv-btn', 'aria-disabled': 'true' }, 'Sign in');
          const form = h('div', { class: 'cmp-ti-form' }, em.wrap, support, pw.wrap, h('div', { class: 'cmp-ti-support' }), submit);
          const kb = h('div', { class: 'cmp-kb', 'aria-label': 'Soft keyboard preview' });
          const typeBtns = ['Text', 'Email', 'Number'].map(t => cmd(`KeyboardType.${t}`, () => { type = t; focus('email'); paint(); say(o, `${hl(`keyboardType = KeyboardType.${t}`)} <span class="muted">// ${t === 'Email' ? 'adds @ and . keys' : t === 'Number' ? 'digits only on screen. A hardware keyboard can still type letters.' : 'a plain letter layout'}</span>`); }));
          const ignoreIn = h('input', { type: 'checkbox', id: 'cmp-ti-ignore' });
          const valid = () => email.includes('@') && email.length > 2 && password.length >= 6;
          function addLog(html) {
            log.prepend(h('div', { class: 'drop-in', html: `<span class="muted">${++logN}</span> ${html}` }));
            while (log.children.length > 5) log.lastElementChild.remove();
          }
          function paint() {
            const err = touched && email.length > 0 && !email.includes('@');
            em.input.value = email; pw.input.value = password;
            pw.input.type = hidePw ? 'password' : 'text';
            eye.textContent = hidePw ? 'show' : 'hide';
            em.input.setAttribute('inputmode', type === 'Email' ? 'email' : type === 'Number' ? 'numeric' : 'text');
            em.wrap.classList.toggle('cmp-ti-up', !!email || document.activeElement === em.input);
            pw.wrap.classList.toggle('cmp-ti-up', !!password || document.activeElement === pw.input);
            em.wrap.classList.toggle('cmp-ti-err', err);
            support.textContent = err ? 'Enter a valid email' : '';
            const on = valid();
            if ((submit.getAttribute('aria-disabled') === 'false') !== on) replay(submit, 'pop');
            submit.setAttribute('aria-disabled', String(!on));
            stateBox.innerHTML = [
              `email = ${JSON.stringify(email)}`,
              `password = ${JSON.stringify(password)}`,
              `emailError = ${err}`,
            ].map(x => `<div>${hl(x)}</div>`).join('');
            paintKb();
          }
          function paintKb() {
            const letters = [['q', 'w', 'e', 'r', 't', 'y'], ['a', 'd', 'l', 'n', 'o', 's']];
            const action = active === 'email' ? 'Next →' : 'Done ✓';
            let rows;
            if (active === 'email' && type === 'Number') rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['0']];
            else if (active === 'email' && type === 'Email') rows = [...letters, ['@', '.', '.com']];
            else rows = [...letters, [',', 'space']];
            kb.classList.toggle('cmp-kb-off', !active);
            const sig = rows.flat().join() + action;
            if (sig === kbSig) return;
            kbSig = sig;
            kb.replaceChildren(...rows.map((r, i) => h('div', { class: 'cmp-kb-row' }, r.map(k => h('button', {
              class: `cmp-kb-key${k === 'space' ? ' cmp-kb-wide' : ''}${['@', '.com'].includes(k) ? ' cmp-kb-new' : ''}`,
              onmousedown: e => e.preventDefault(), onclick: () => key(k === 'space' ? ' ' : k),
            }, k)), i === rows.length - 1 ? h('button', { class: 'cmp-kb-key cmp-kb-act', onmousedown: e => e.preventDefault(), onclick: imeKey }, action) : null)));
          }
          function edit(which, proposed) {
            const cur = which === 'email' ? email : password;
            if (ignore) {
              paint(); replay((which === 'email' ? em : pw).wrap, 'shake');
              addLog(`${hl(`onValueChange(${JSON.stringify(proposed)})`)} <span class="bad">ignored</span>`);
              say(o, `The field asked for ${hl(JSON.stringify(proposed))}, but nothing wrote it to state. It still shows ${hl(JSON.stringify(cur))}.`);
              return;
            }
            if (which === 'email') { email = proposed.trim(); touched = true; } else password = proposed;
            addLog(`${hl(`onValueChange(${JSON.stringify(proposed)})`)} <span class="muted">→ state</span>`);
            paint();
            say(o, which === 'email' && email && !email.includes('@')
              ? `${hl('isError = true')} <span class="muted">// no @ yet, so supportingText explains</span>`
              : `${hl(`${which} = ${JSON.stringify(which === 'email' ? email : password)}`)} <span class="muted">// state changed, the field recomposed with it</span>`);
          }
          function focus(which) { active = which; (which === 'email' ? em : pw).input.focus(); paint(); }
          function key(k) {
            if (!active) focus('email');
            const f = active === 'email' ? em : pw, cur = active === 'email' ? email : password;
            if (cur.length > 24) { replay(f.wrap, 'shake'); return; }
            f.input.focus();
            edit(active, cur + k);
          }
          function imeKey() {
            if (active === 'email') {
              addLog(`${hl('ImeAction.Next')} <span class="muted">→ focus moves to Password</span>`);
              focus('password');
              say(o, 'Next did its default job: focus moved to the Password field.');
            } else {
              addLog(`${hl('KeyboardActions(onDone)')} <span class="muted">→ onSubmit()</span>`);
              pw.input.blur(); active = null; paint();
              if (valid()) { replay(submit, 'pop'); say(o, '<span class="good">onSubmit(email, password)</span> ran from the Done key. The keyboard closes.'); }
              else { replay(form, 'shake'); say(o, '<span class="bad">onDone ran, but the form is not valid yet.</span> It needs an email with @ and a 6+ character password.'); }
            }
          }
          for (const [which, f] of [['email', em], ['password', pw]]) {
            f.input.addEventListener('focus', () => { active = which; paint(); });
            f.input.addEventListener('input', () => edit(which, f.input.value));
            f.input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); active = which; imeKey(); } });
          }
          ignoreIn.addEventListener('change', () => {
            ignore = ignoreIn.checked;
            say(o, ignore ? `${hl('onValueChange = { }')} <span class="muted">// try typing now</span>` : `${hl('onValueChange = { email = it.trim() }')} <span class="muted">// state follows the edits again</span>`);
          });
          email = 'ada'; touched = true;
          log.append(h('div', {}, '// each onValueChange call shows up here'));
          paint();
          say(o, 'Type in the fields, or tap the keyboard keys below. Every edit goes through onValueChange.');
          el.append(
            h('div', { class: 'controls' }, typeBtns, h('label', { class: 'switch', for: 'cmp-ti-ignore' }, ignoreIn, 'ignore onValueChange')),
            h('div', { class: 'cmp-ti-wrap' }, form, h('div', { class: 'cmp-sc-side' }, stateBox, log)),
            kb, o);
          typeBtns[1].setAttribute('aria-pressed', 'true');
          typeBtns.forEach((b, i) => b.addEventListener('click', () => typeBtns.forEach((x, j) => x.setAttribute('aria-pressed', String(i === j)))));
        },
        predict: {
          q: 'The user types one letter in the email field. What happens before the new letter shows on screen?',
          options: ['The field draws the letter itself, then calls <code>onValueChange</code>', '<code>onValueChange</code> runs, your state changes, and the field recomposes with the new value', 'Nothing: the keyboard writes straight into the field'],
          a: 1,
          why: 'With the value and callback overload, the field shows only what you pass in. Each edit is a request through <code>onValueChange</code>.',
        },
      },

      // 9a ─────────────────────────────────────────────
      {
        id: 'text-field-state',
        title: 'TextFieldState and transformations',
        tagline: 'The state is the edit buffer: change it directly, and shape input before it lands.',
        level: 'intermediate',
        body: `
<p>The newer text field API takes a <code>TextFieldState</code> in place of <code>value</code> and <code>onValueChange</code>. Create it with <code>rememberTextFieldState()</code>, which also survives rotation and process death. Read the text with <code>state.text</code>, and change it with <code>state.edit { }</code>, <code>setTextAndPlaceCursorAtEnd()</code> or <code>clearText()</code>. There is no callback to forget, and no round trip that can fall behind the keyboard.</p>
<p>Two hooks shape the text. An <code>InputTransformation</code> runs right after each user edit, before it is stored. It can change the edit or reject it with <code>revertAllChanges()</code>, and <code>InputTransformation.maxLength(10)</code> is built in. An <code>OutputTransformation</code> only changes what is drawn. Below, the state holds 10 plain digits while the field shows a formatted phone number.</p>`,
        code: `object DigitsOnly : InputTransformation {
    override fun TextFieldBuffer.transformInput() {
        if (!asCharSequence().all { it.isDigit() }) revertAllChanges()
    }
}

object PhoneFormat : OutputTransformation {
    override fun TextFieldBuffer.transformOutput() {
        if (length > 0) insert(0, "(")
        if (length > 4) insert(4, ")")
        if (length > 8) insert(8, "-")
    }
}

val phone = rememberTextFieldState()
OutlinedTextField(
    state = phone,
    label = { Text("Phone") },
    lineLimits = TextFieldLineLimits.SingleLine,
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
    inputTransformation = InputTransformation.maxLength(10).then(DigitsOnly),
    outputTransformation = PhoneFormat,     // draws (555)123-4567, stores 5551234567
)`,
        remember: 'TextFieldState is the buffer. InputTransformation changes what is stored, OutputTransformation only what is drawn.',
        terms: [
          { term: 'TextFieldState', def: 'A snapshot-backed holder for a text field’s text and selection, edited directly instead of through onValueChange.' },
          { term: 'InputTransformation', def: 'A filter that runs on each user edit before it is saved to the TextFieldState. It can change or revert the edit.' },
          { term: 'OutputTransformation', def: 'A formatter that changes only how the text is drawn, while the stored text stays as it is.' },
          { term: 'TextFieldBuffer', def: 'The editable buffer passed to edit { } and to transformations, with insert, replace, append, delete and selection.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A 4-digit PIN field: digits only, at most 4.', code: 'val pin = [[rememberTextFieldState]]()\nOutlinedTextField(\n    state = pin,\n    label = { Text("PIN") },\n    inputTransformation = InputTransformation.[[maxLength]](4).then(DigitsOnly),\n    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),\n)', why: '<code>rememberTextFieldState</code> creates and saves the state. <code>maxLength</code> rejects the fifth digit before it is stored.' },
          { type: 'bug', prompt: 'This does not compile: <code>send</code> takes a String. Tap the line.', code: 'val message = rememberTextFieldState()\nOutlinedTextField(state = message, label = { Text("Message") })\nButton(onClick = {\n    chat.send(message.text)\n    message.clearText()\n}) { Text("Send") }', bug: 3, fix: '    chat.send(message.text.toString())', why: '<code>state.text</code> is a <code>CharSequence</code> snapshot, not a String. Call <code>toString()</code> when you hand it on.' },
        ],
        quiz: [
          { q: 'An OutputTransformation adds dashes to a card number. What does <code>state.text</code> hold?', options: ['The digits with dashes', 'Only the digits the user typed'], a: 1, why: 'Output transformations change the drawing only. The stored text stays plain.' },
          { q: 'You call <code>rememberTextFieldState(initialText = user.name)</code> and <code>user</code> loads later. What does the field show?', options: ['The loaded name', 'The value from the first composition'], a: 1, why: '<code>initialText</code> is used once, when the state is created. Set the text with an edit call when the data arrives.' },
          { q: 'Inside <code>transformInput()</code>, the buffer holds letters in a digits-only field. What do you call?', options: ['<code>revertAllChanges()</code>', '<code>clearText()</code> on the state', 'Nothing, the keyboard type filters it'], a: 0, why: '<code>revertAllChanges()</code> drops this edit and keeps the previous text. The keyboard type never filters input.' },
          { q: 'Which order is right for one keystroke in a field with an <code>InputTransformation</code> and an <code>OutputTransformation</code>?', options: ['Output transformation, then input transformation, then the state is stored', 'Keyboard edit, commit to the state, input transformation, output transformation', 'Keyboard edit, input transformation on the buffer, commit to the state, output transformation for drawing'], a: 2, why: 'The input transformation shapes the edit before it is committed. The output transformation only changes what is drawn from the stored text.' },
          { q: 'A <code>TextFieldState</code> lives in a ViewModel. The process is killed in the background. What happens to the text?', options: ['It is restored like <code>rememberTextFieldState()</code>', 'It is lost unless you save and restore it yourself', 'It is kept because TextFieldState is Parcelable'], a: 1, why: 'Only <code>rememberTextFieldState()</code> saves itself. A state created in a ViewModel needs your own saving, for example through SavedStateHandle.' },
        ],
        deeper: [
          {
            title: 'Change the text from code',
            body: `<p>Every change goes through the state. <code>edit { }</code> hands you a <code>TextFieldBuffer</code> with <code>insert</code>, <code>replace</code>, <code>append</code>, <code>delete</code> and <code>selectAll()</code>. Shortcuts cover the common cases: <code>setTextAndPlaceCursorAtEnd()</code> replaces everything and puts the cursor at the end, and <code>clearText()</code> empties the field. <code>state.selection</code> tells you where the cursor is.</p>`,
            code: `val state = rememberTextFieldState("Hello Android")

state.edit { insert(5, ",") }                    // "Hello, Android"
state.edit { replace(7, 14, "Compose") }         // "Hello, Compose"
state.edit { selectAll() }                       // selection = TextRange(0, 14)
state.setTextAndPlaceCursorAtEnd("Hello")        // selection = TextRange(5, 5)
state.clearText()                                // selection = TextRange(0, 0)`,
          },
          {
            title: 'Observe the text',
            body: `<p>With no <code>onValueChange</code>, you watch the state instead. In a composable, collect <code>snapshotFlow { state.text.toString() }</code> inside a <code>LaunchedEffect</code>. Or keep the <code>TextFieldState</code> in the ViewModel and build a Flow there. A state created in a ViewModel does not save itself the way <code>rememberTextFieldState()</code> does, so restore it yourself if it must survive process death.</p>`,
            code: `val username = rememberTextFieldState(initialUiState.username)
LaunchedEffect(username) {
    snapshotFlow { username.text.toString() }.collectLatest {
        loginViewModel.updateUsername(it)
    }
}
TextField(state = username)

// or hold it in the ViewModel
class LoginViewModel : ViewModel() {
    val username = TextFieldState()
    val password = TextFieldState()
}`,
          },
          {
            title: 'Passwords: SecureTextField',
            body: `<p>For passwords there is <code>SecureTextField</code>, built on the same state-based field. It hides the text for you, so you don't need <code>PasswordVisualTransformation</code>. It takes the same <code>TextFieldState</code>, so reading and clearing work as above.</p>`,
            code: `val password = rememberTextFieldState()
SecureTextField(state = password)`,
          },
        ],
        underHood: {
          body: `<p><code>TextFieldState</code> is a plain snapshot state holder, like <code>mutableStateOf</code>. Reading <code>state.text</code> during composition subscribes to it, and an edit from the keyboard or from your code is a snapshot write that triggers recomposition.</p>
<p>The keyboard's edit commands are applied to a <code>TextFieldBuffer</code>. Your <code>InputTransformation</code> runs on that buffer right away, and only the result is committed to the state. That is why transformations should only edit the buffer and never write other state: they run in the middle of committing an edit.</p>`,
          code: `// The order of one user edit
// keyboard command → TextFieldBuffer
//   → inputTransformation.transformInput()   (change or revert)
//   → committed to TextFieldState            (recomposition)
//   → outputTransformation.transformOutput() (drawing only)`,
        },
        mistakes: [
          {
            title: 'Expecting initialText to follow your data',
            bad: `val name = rememberTextFieldState(initialText = user.name)
// user loads later: the field stays empty`,
            good: `val name = rememberTextFieldState()
LaunchedEffect(user.id) {
    name.setTextAndPlaceCursorAtEnd(user.name)
}`,
            why: '<code>initialText</code> is used once, when the state is created. A different value on a later recomposition is ignored. Set the text with an edit call when the data arrives.',
          },
          {
            title: 'Writing other state inside transformInput',
            bad: `object CountingFilter : InputTransformation {
    override fun TextFieldBuffer.transformInput() {
        viewModel.charCount = length       // writes state mid-edit
    }
}`,
            good: `LaunchedEffect(state) {
    snapshotFlow { state.text.length }.collect { viewModel.charCount = it }
}`,
            why: 'The docs say not to change state inside a transformation. Edit the buffer there, and observe the committed text elsewhere.',
          },
        ],
        visual(el) {
          let text = '555', fmt = true;
          const shown = h('span', { class: 'cmp-d2i-shown' });
          const field = h('div', { class: 'cmp-field cmp-d2i-field' }, h('span', { class: 'cmp-field-label' }, 'Phone'), h('span', { class: 'cmp-field-line' }, shown, h('span', { class: 'cmp-caret' })));
          const read = h('div', { class: 'kt' });
          const o = out();
          const sw = h('input', { type: 'checkbox', id: 'cmp-d2i-fmt', checked: true });
          const format = s => {
            let b = s;
            if (b.length > 0) b = '(' + b;
            if (b.length > 4) b = b.slice(0, 4) + ')' + b.slice(4);
            if (b.length > 8) b = b.slice(0, 8) + '-' + b.slice(8);
            return b;
          };
          function paint() {
            shown.textContent = fmt ? format(text) : text;
            read.innerHTML = hl(`phone.text = "${text}"   // what is stored\nshown on screen = "${fmt ? format(text) : text}"`);
          }
          function edit(proposed, label) {
            if (proposed.length > 10) {
              replay(field, 'shake');
              say(o, `${hl('InputTransformation.maxLength(10)')} <span class="bad">rejected</span> ${esc(label)}. The state keeps 10 digits.`);
              return;
            }
            if (!/^\d*$/.test(proposed)) {
              replay(field, 'shake');
              say(o, `${hl('DigitsOnly')} called ${hl('revertAllChanges()')}: ${esc(label)} had characters that are not digits. <span class="muted">Nothing was stored.</span>`);
              return;
            }
            text = proposed; paint(); replay(shown, 'pop-soft');
            say(o, `${esc(label)} <span class="muted">→</span> ${hl(`phone.text = "${text}"`)}${fmt ? ' <span class="muted">// PhoneFormat only changes the drawing</span>' : ''}`);
          }
          const key = d => h('button', { class: 'cmp-kb-key', type: 'button', onclick: () => edit(text + d, `typed ${d}`) }, d);
          const pad = h('div', { class: 'cmp-d2i-pad' },
            ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key),
            h('button', { class: 'cmp-kb-key', type: 'button', 'aria-label': 'Delete', onclick: () => edit(text.slice(0, -1), 'backspace') }, '⌫'),
            key('0'));
          sw.addEventListener('change', () => {
            fmt = sw.checked; paint(); replay(shown, 'pop-soft');
            say(o, fmt ? `${hl('outputTransformation = PhoneFormat')} <span class="muted">// same state, formatted drawing</span>` : 'No OutputTransformation. The field draws exactly what is stored.');
          });
          paint();
          say(o, 'Type digits on the pad. Then try pasting a formatted number.');
          el.append(
            h('div', { class: 'cmp-ti-wrap' }, h('div', { class: 'cmp-ly-group' }, field, pad), read),
            h('div', { class: 'controls' },
              cmd('phone.setTextAndPlaceCursorAtEnd("")', () => { text = ''; paint(); say(o, `${hl('setTextAndPlaceCursorAtEnd("")')} <span class="muted">// code edits go through the state too</span>`); }),
              act('Paste "+1 (555) 010-9999"', () => edit('+1 (555) 010-9999', 'the paste'))),
            h('label', { class: 'switch', for: 'cmp-d2i-fmt' }, sw, 'outputTransformation = PhoneFormat'),
            o);
        },
        predict: {
          q: 'The field holds 555. The user pastes "+1 (555) 010-9999" into a field with <code>maxLength(10)</code> and a digits-only <code>InputTransformation</code>. What does <code>phone.text</code> hold after?',
          options: ['"15550109999"', '"555": the edit is rejected', '"+1 (555) 010-9999"'],
          a: 1,
          why: 'The InputTransformation runs on the proposed edit before it is stored. This paste is too long and has non-digits, so it is rejected and the state keeps its old text.',
        },
      },

      // 10 ─────────────────────────────────────────────
      {
        id: 'lists',
        title: 'Lists and grids',
        tagline: 'Compose only what is on screen.',
        body: `
<p>A <code>Column</code> composes every child, even the ones far off screen. For long lists, or lists of unknown length, use a lazy layout. <code>LazyColumn</code> and <code>LazyRow</code> compose only the items in view, plus a little ahead, and drop the ones that scroll away. <code>LazyVerticalGrid</code> does the same in columns.</p>
<p>You don’t call children directly. You describe them in a small DSL: <code>item { }</code> for one, <code>items(list) { }</code> for many, and <code>stickyHeader { }</code> for a header that pins to the top while its section scrolls past. In a grid, <code>GridCells.Fixed(3)</code> sets the column count and <code>GridCells.Adaptive(120.dp)</code> fits as many columns as it can.</p>
<p>Use <code>contentPadding</code> for space around the items. It pads the content, not the viewport, so items scroll through that space instead of being clipped at it. Scroll the list below and watch the composed count.</p>`,
        code: `@Composable
fun ContactList(groups: Map<Char, List<Contact>>) {
    LazyColumn(
        contentPadding = PaddingValues(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        groups.forEach { (letter, contacts) ->
            stickyHeader(key = letter) { LetterHeader(letter) }
            items(contacts, key = { it.id }) { contact ->
                ContactRow(contact)
            }
        }
    }
}

@Composable
fun PhotoGrid(photos: List<Photo>) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 120.dp),
        contentPadding = PaddingValues(8.dp),
    ) {
        items(photos, key = { it.id }) { photo -> PhotoTile(photo) }
    }
}`,
        remember: 'Lazy lists compose only what is on screen. Describe items with items { }, never a loop in a scrolling Column.',
        level: 'beginner',
        terms: [
          { term: 'LazyVerticalGrid', def: 'A lazy grid that lays items out in columns and composes only the rows on screen.' },
          { term: 'GridCells', def: 'The column rule for a lazy grid: Fixed for an exact count, Adaptive for as many columns of a minimum size as fit.' },
          { term: 'stickyHeader', def: 'A lazy list item that stays pinned to the top while the items after it scroll, until the next header pushes it away.' },
          { term: 'contentPadding', def: 'Padding around the content of a lazy list, inside the scroll area, so items can scroll through it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show photos in as many 120 dp columns as fit.', code: 'LazyVerticalGrid(\n    columns = GridCells.[[Adaptive]](minSize = 120.dp),\n) {\n    [[items]](photos, key = { it.id }) { PhotoTile(it) }\n}', why: '<code>Adaptive</code> picks the column count from the width. <code>items</code> describes one cell per photo.' },
          { type: 'bug', prompt: 'This screen crashes as soon as it opens. Tap the line that causes it.', code: '@Composable\nfun FeedScreen(posts: List<Post>) {\n    Column(Modifier.verticalScroll(rememberScrollState())) {\n        FeedHeader()\n        LazyColumn {\n            items(posts, key = { it.id }) { PostCard(it) }\n        }\n    }\n}', bug: 2, fix: '    Column {   // or move FeedHeader() into item { } inside the LazyColumn', why: 'A scrolling Column gives its children infinite height. A LazyColumn can’t measure in infinite height, so it throws.' },
        ],
        quiz: [
          { q: 'A LazyColumn has 10,000 items and 8 fit on screen. About how many are composed?', options: ['10,000', 'About 8 to 10', 'Exactly 1'], a: 1, why: 'Only visible items, plus one or two prefetched ahead, are composed.' },
          { q: 'What does <code>contentPadding</code> do that <code>Modifier.padding</code> on the list does not?', options: ['Items scroll through the padded space instead of being clipped at it', 'It adds space between items', 'Nothing, they are the same'], a: 0, why: '<code>Modifier.padding</code> shrinks the viewport. <code>contentPadding</code> pads the content inside it.' },
          { q: 'Which call adds one header that pins to the top while its section scrolls?', options: ['<code>item { }</code>', '<code>stickyHeader { }</code>', '<code>items(list) { }</code>'], a: 1, why: 'A sticky header stays at the top until the next header pushes it out.' },
          { q: 'A “Back to top” button reads <code>listState.firstVisibleItemIndex &gt; 0</code> directly in composition. What is the problem?', options: ['Nothing, the index rarely changes', 'The reader recomposes on every index change; <code>derivedStateOf</code> recomposes it only when the answer flips', 'It crashes, because LazyListState cannot be read in composition'], a: 1, why: 'Scroll values change very often. derivedStateOf turns them into a Boolean that changes only when it really flips.' },
        ],
        deeper: [
          {
            title: 'LazyListState: read and drive the scroll',
            body: `<p>Hoist <code>rememberLazyListState()</code> and pass it to the list as <code>state</code>. It tells you where the list is with <code>firstVisibleItemIndex</code> and <code>firstVisibleItemScrollOffset</code>, and it moves the list with <code>scrollToItem</code> and <code>animateScrollToItem</code>, which are suspend functions.</p>
<p>These values change very often. The offset changes on every frame of a scroll. If a composable reads them directly, it recomposes just as often. For a yes or no question like “show the Back to top button?”, wrap the read in <code>derivedStateOf</code>, so readers recompose only when the answer flips. The Compose, advanced track explains <code>derivedStateOf</code> in depth.</p>`,
            code: `val listState = rememberLazyListState()
val scope = rememberCoroutineScope()
val showTop by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}

Box {
    LazyColumn(state = listState) {
        items(posts, key = { it.id }) { PostRow(it) }
    }
    AnimatedVisibility(showTop, Modifier.align(Alignment.BottomEnd)) {
        FloatingActionButton(onClick = { scope.launch { listState.animateScrollToItem(0) } }) {
            Icon(Icons.Default.KeyboardArrowUp, contentDescription = "Back to top")
        }
    }
}`,
            visual(el) {
              const PITCH = 46;
              let idx = 0, off = 0, show = false, raf = 0;
              const counts = { offset: 0, index: 0, derived: 0 };
              const inner = h('div', { class: 'cmp-d2z-inner' });
              for (let i = 0; i < 40; i++) inner.append(h('div', { class: 'cmp-d2z-row' }, h('i', {}, String(i)), `Post ${i}`));
              const view = h('div', { class: 'cmp-d2z-view', tabindex: '0', 'aria-label': 'Scrollable list' }, inner);
              const fab = h('button', { class: 'cmp-d2z-fab', type: 'button', 'aria-label': 'Back to top', onclick: () => top() }, '↑');
              const frame = h('div', { class: 'cmp-d2z-frame' }, view, fab);
              const read = h('div', { class: 'kt' });
              const badge = () => h('span', { class: 'cmp-badge' }, '0');
              const B = { offset: badge(), index: badge(), derived: badge() };
              const meters = h('div', { class: 'cmp-d2z-meters' },
                h('div', {}, h('span', { class: 'cmp-fx-name' }, 'reads firstVisibleItemScrollOffset'), B.offset),
                h('div', {}, h('span', { class: 'cmp-fx-name' }, 'reads firstVisibleItemIndex'), B.index),
                h('div', {}, h('span', { class: 'cmp-fx-name' }, 'reads derivedStateOf { index > 0 }'), B.derived));
              const o = out();
              const hit = k => { counts[k]++; B[k].textContent = String(counts[k]); replay(B[k], 'pop'); };
              function update() {
                raf = 0;
                if (!el.isConnected) return;
                const st = Math.max(0, view.scrollTop - 8), ni = Math.floor(st / PITCH), no = Math.round(st - ni * PITCH);
                if (no !== off || ni !== idx) hit('offset');
                if (ni !== idx) hit('index');
                if ((ni > 0) !== show) { show = ni > 0; hit('derived'); fab.classList.toggle('cmp-on', show); }
                idx = ni; off = no;
                read.innerHTML = hl(`listState.firstVisibleItemIndex = ${idx}\nlistState.firstVisibleItemScrollOffset = ${off}\nshowTop = ${show}`);
              }
              view.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
              function top() {
                view.scrollTo({ top: 0, behavior: 'smooth' });
                say(o, `${hl('scope.launch { listState.animateScrollToItem(0) }')} <span class="muted">// back to the first item</span>`);
              }
              read.innerHTML = hl('listState.firstVisibleItemIndex = 0\nlistState.firstVisibleItemScrollOffset = 0\nshowTop = false');
              say(o, 'Scroll the list and compare how often each reader would recompose.');
              el.append(
                h('div', { class: 'cmp-d2z-wrap' }, frame, h('div', { class: 'cmp-ly-group' }, read, meters)),
                h('div', { class: 'controls' },
                  act('Scroll down', () => { view.scrollBy({ top: 200, behavior: 'smooth' }); say(o, 'Scrolling. Watch the three counters.'); }),
                  cmd('listState.animateScrollToItem(0)', top)),
                o);
            },
          },
          {
            title: 'Load more near the end',
            body: `<p>For long feeds you load data in pages. The list can tell you when to fetch the next one: <code>listState.layoutInfo</code> lists the visible items and the total count. When the last visible index gets close to the end, ask the ViewModel for more, and show a loading row as the last item.</p>
<p>Wrap the check in <code>derivedStateOf</code> so it is computed on scroll but only changes when the answer does, and react to it in a <code>LaunchedEffect</code>. For real network paging, the Paging 3 library does this for you, with <code>collectAsLazyPagingItems()</code>.</p>`,
            code: `val listState = rememberLazyListState()
val nearEnd by remember {
    derivedStateOf {
        val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
        last >= listState.layoutInfo.totalItemsCount - 3
    }
}
LaunchedEffect(nearEnd) {
    if (nearEnd) vm.loadNextPage()          // the ViewModel ignores calls while loading
}

LazyColumn(state = listState) {
    items(posts, key = { it.id }) { PostRow(it) }
    if (isLoading) item(key = "loading") { LoadingRow() }
}`,
            visual(el) {
              const PAGE = 10, MAX = 40;
              let total = 0, loading = false, raf = 0, ended = false;
              const inner = h('div', { class: 'cmp-d2z-inner' });
              const footer = h('div', { class: 'cmp-d2z-foot' });
              const view = h('div', { class: 'cmp-d2z-view', tabindex: '0', 'aria-label': 'Scrollable feed' }, inner, footer);
              const frame = h('div', { class: 'cmp-d2z-frame' }, view);
              const read = h('div', { class: 'kt' });
              const o = out();
              function addPage() {
                for (let i = 0; i < PAGE; i++) { total++; inner.append(h('div', { class: `cmp-d2z-row${loading ? ' cmp-ls-in' : ''}` }, h('i', {}, String(total - 1)), `Post ${total - 1}`)); }
              }
              function lastVisible() {
                const v = view.getBoundingClientRect();
                let last = 0;
                [...inner.children].forEach((r, i) => { if (r.getBoundingClientRect().top < v.bottom) last = i; });
                return last;
              }
              async function load() {
                loading = true;
                footer.replaceChildren(h('span', { class: 'cmp-d2z-spin', 'aria-hidden': 'true' }), 'Loading page…');
                say(o, `${hl('nearEnd = true')} → ${hl('vm.loadNextPage()')} <span class="muted">// the loading row shows as the last item</span>`);
                await sleep(900); if (!el.isConnected) return;
                addPage(); loading = false;
                if (total >= MAX) { ended = true; footer.textContent = 'End of feed'; } else footer.replaceChildren();
                say(o, `<span class="good">Page loaded.</span> ${total} items now.${ended ? ' No more pages.' : ' Keep scrolling.'}`);
                check();
              }
              function check() {
                raf = 0;
                if (!el.isConnected) return;
                const last = lastVisible(), near = last >= total - 3;
                read.innerHTML = hl(`lastVisibleIndex = ${last}\ntotalItemsCount = ${total}\nnearEnd = ${near}`);
                if (near && !loading && !ended) load();
              }
              view.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
              addPage();
              read.innerHTML = hl(`lastVisibleIndex = 0\ntotalItemsCount = ${total}\nnearEnd = false`);
              say(o, 'Scroll toward the end of the list. A new page loads before you reach it.');
              el.append(
                h('div', { class: 'cmp-d2z-wrap' }, frame, read),
                h('div', { class: 'controls' }, act('Scroll to the end', () => view.scrollTo({ top: view.scrollHeight, behavior: 'smooth' }))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>The <code>LazyColumn { }</code> block does not compose anything. It runs a small DSL that records <em>intervals</em>: “items 0 to 29 come from this list, with this key and this content lambda”. The list itself is a <code>LazyLayout</code>, built on <code>SubcomposeLayout</code>.</p>
<p>During measure, it starts at the first visible index, composes one item, measures it, and repeats until the viewport is full. Items that scroll away are disposed or kept for reuse: a new item of the same <code>contentType</code> can take over an old item’s composition instead of building one from scratch. Between frames, a prefetcher composes and measures the next item in the scroll direction, so it is ready before it appears.</p>`,
          code: `LazyColumn {
    item { Header() }                                   // interval: 1 item
    items(posts, key = { it.id }, contentType = { "post" }) { PostRow(it) }  // interval: posts.size
}
// Only the items that fit the viewport, plus the prefetched one, are composed.`,
        },
        mistakes: [
          {
            title: 'Items with zero height before they load',
            bad: `items(photos, key = { it.id }) { photo ->
    AsyncImage(model = photo.url, contentDescription = photo.title)
}`,
            good: `items(photos, key = { it.id }) { photo ->
    AsyncImage(
        model = photo.url,
        contentDescription = photo.title,
        modifier = Modifier.fillMaxWidth().aspectRatio(4f / 3f),
    )
}`,
            why: 'Before the images load, every item is 0 px tall, so all of them fit in the viewport and the list composes them all at once. Give items their size up front, or a placeholder of the right size.',
          },
          {
            title: 'animateItem without keys',
            bad: `LazyColumn {
    items(tasks) { task ->
        TaskRow(task, Modifier.animateItem())
    }
}`,
            good: `LazyColumn {
    items(tasks, key = { it.id }) { task ->
        TaskRow(task, Modifier.animateItem())
    }
}`,
            why: 'Without keys, items are tracked by position. When a task moves, the list sees new content at the old positions, so nothing slides. Keys let <code>animateItem</code> find where each item went.',
          },
        ],
        visual(el) {
          const FIRST = ['Ada', 'Alan', 'Anita', 'Arun', 'Ava', 'Ben', 'Bianca', 'Bo', 'Bruno', 'Bea', 'Carla', 'Chen', 'Cleo', 'Cyrus', 'Cora', 'Dana', 'Dev', 'Dina', 'Dmitri', 'Duke', 'Eli', 'Emma', 'Ezra', 'Esme', 'Eve', 'Farah', 'Felix', 'Fiona', 'Femi', 'Finn'];
          const DATA = FIRST.map((n, i) => ({ id: i + 1, name: n, letter: n[0] }));
          let mode = 'column', sticky = true, padded = false, raf = 0, busy = false;
          const inner = h('div', { class: 'cmp-ls-inner' });
          const view = h('div', { class: 'cmp-ls-view', tabindex: '0', 'aria-label': 'Scrollable lazy list' }, inner);
          const frame = h('div', { class: 'cmp-ls-frame' }, view, h('div', { class: 'cmp-ls-band cmp-b1' }), h('div', { class: 'cmp-ls-band cmp-b2' }));
          const map = h('div', { class: 'cmp-ls-map', 'aria-hidden': 'true' });
          const count = h('span', { class: 'cmp-ls-count' });
          const code = h('div', { class: 'kt' });
          const o = out();
          let nodes = [], ticks = [], seen = new Set();
          const modeBtns = [['column', 'LazyColumn'], ['row', 'LazyRow'], ['grid', 'LazyVerticalGrid(GridCells.Fixed(3))']].map(([m, src]) => cmd(src, () => setMode(m)));
          const stickyIn = h('input', { type: 'checkbox', id: 'cmp-ls-sticky', checked: true });
          const padIn = h('input', { type: 'checkbox', id: 'cmp-ls-pad' });
          function build() {
            nodes = [];
            const withHeads = mode === 'column' && sticky;
            let last = '';
            for (const d of DATA) {
              if (withHeads && d.letter !== last) { last = d.letter; nodes.push(h('div', { class: 'cmp-ls-head' }, d.letter)); }
              nodes.push(h('div', { class: 'cmp-ls-item', 'data-i': d.id - 1 }, h('i', {}, d.letter), h('span', {}, mode === 'column' ? `${d.name} · #${d.id}` : d.name)));
            }
            inner.replaceChildren(...nodes);
            ticks = nodes.map(n => h('span', { class: `cmp-ls-tick${n.classList.contains('cmp-ls-head') ? ' cmp-h' : ''}` }));
            map.replaceChildren(...ticks);
            frame.className = `cmp-ls-frame cmp-ls-${mode}${padded ? ' cmp-ls-padded' : ''}`;
            seen = new Set();
            view.scrollTo(0, 0);
            const lines = {
              column: `LazyColumn(${padded ? 'contentPadding = PaddingValues(vertical = 24.dp)' : ''}) {\n${withHeads ? '    groups.forEach { (letter, people) ->\n        stickyHeader { Header(letter) }\n        items(people, key = { it.id }) { Row(it) }\n    }' : '    items(people, key = { it.id }) { Row(it) }'}\n}`,
              row: `LazyRow(${padded ? 'contentPadding = PaddingValues(horizontal = 24.dp)' : ''}) {\n    items(people, key = { it.id }) { Card(it) }\n}`,
              grid: `LazyVerticalGrid(\n    columns = GridCells.Fixed(3),${padded ? '\n    contentPadding = PaddingValues(vertical = 24.dp),' : ''}\n) {\n    items(people, key = { it.id }) { Tile(it) }\n}`,
            };
            code.innerHTML = hl(lines[mode]);
            modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(['column', 'row', 'grid'][i] === mode)));
            stickyIn.disabled = mode !== 'column';
            update(true);
          }
          function update(quiet) {
            raf = 0;
            if (!el.isConnected && !quiet) return;
            const v = view.getBoundingClientRect(), horiz = mode === 'row', AHEAD = 40;
            let n = 0, added = 0;
            nodes.forEach((node, i) => {
              const r = node.getBoundingClientRect();
              const on = horiz ? r.right > v.left - AHEAD && r.left < v.right + AHEAD : r.bottom > v.top - AHEAD && r.top < v.bottom + AHEAD;
              node.classList.toggle('cmp-ls-off', !on);
              ticks[i].classList.toggle('cmp-on', on);
              if (on) {
                n++;
                if (!seen.has(i)) { seen.add(i); added++; if (!quiet) replay(node, 'cmp-ls-in'); }
              } else if (seen.has(i)) seen.delete(i);
            });
            count.textContent = `composed: ${n} of ${nodes.length}`;
            if (added && !quiet && !busy) say(o, `Composed ${added} new item${added > 1 ? 's' : ''} as they came into view. <span class="muted">Items that scrolled away were disposed.</span>`);
          }
          view.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => update(false)); }, { passive: true });
          function setMode(m) {
            mode = m; build();
            say(o, m === 'row' ? 'LazyRow: the same idea sideways. Scroll it horizontally.' : m === 'grid' ? 'LazyVerticalGrid: rows of three, still only the visible rows are composed.' : 'LazyColumn: scroll and watch the composed window slide over the map.');
          }
          async function scrollTo(i) {
            if (busy) return;
            const node = nodes.find(n => n.dataset.i === String(i));
            if (!node) return;
            busy = true;
            if (mode === 'row') view.scrollTo({ left: node.offsetLeft - (padded ? 24 : 0), behavior: 'smooth' });
            else view.scrollTo({ top: node.offsetTop - (padded ? 24 : 0) - (mode === 'column' && sticky ? 30 : 0), behavior: 'smooth' });
            say(o, `${hl(`scope.launch { listState.animateScrollToItem(${i}) }`)} <span class="muted">// scrolling…</span>`);
            await sleep(700);
            busy = false; update(false);
            say(o, `${hl(`animateScrollToItem(${i})`)} done. Still only ${seen.size} items composed, out of ${nodes.length}.`);
          }
          stickyIn.addEventListener('change', () => { sticky = stickyIn.checked; build(); say(o, sticky ? 'stickyHeader on: each letter pins to the top while its section scrolls.' : 'No headers. Just items(people).'); });
          padIn.addEventListener('change', () => {
            padded = padIn.checked; build();
            say(o, padded ? `${hl('contentPadding = 24.dp')} <span class="muted">// the shaded band is padding. Scroll: items pass under it, not clipped.</span>` : 'No contentPadding. The first item touches the edge.');
          });
          build();
          say(o, 'Scroll the list. Only items near the viewport are composed.');
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'cmp-ls-wrap' }, frame, h('div', { class: 'cmp-ly-group' }, count, map)),
            h('div', { class: 'controls' },
              h('label', { class: 'switch', for: 'cmp-ls-sticky' }, stickyIn, 'stickyHeader'),
              h('label', { class: 'switch', for: 'cmp-ls-pad' }, padIn, 'contentPadding'),
              cmd('animateScrollToItem(22)', () => scrollTo(22)), cmd('animateScrollToItem(0)', () => scrollTo(0))),
            code, o);
          requestAnimationFrame(() => update(true));
        },
        predict: {
          q: 'A LazyColumn holds 30 names. You scroll down by a screen. What happens to the rows that left the top?',
          options: ['They stay composed, just off screen', 'They are no longer composed. Only rows near the viewport are', 'All 30 were composed when the list first showed'],
          a: 1,
          why: 'Lazy layouts compose only what is visible plus a small margin. Rows that scroll away leave the composition, and new ones are composed as they come in.',
        },
      },

      // 11 ─────────────────────────────────────────────
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
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>LazyColumn {\n    items(todos, key = { it.hashCode() }) { todo -&gt;\n        TodoRow(todo, Modifier.animateItem())\n    }\n}</code></pre>', options: ['<code>LazyColumn {</code>: it needs a <code>state</code>', '<code>TodoRow(todo, Modifier.animateItem())</code>: animateItem needs a contentType', '<code>items(todos, key = { it.hashCode() })</code>: the hash changes whenever a field changes'], a: 2, why: 'Editing a todo changes its hash, so the list sees a removed and a new item: row state resets and it animates out and in. Key on the stable id.' },
          { q: 'A chat inserts new messages at the top while the user reads further down. With <code>key = { it.id }</code>, what happens to the message they are reading?', options: ['It slides down by one row per new message', 'It stays in place, because the list keeps the key of the first visible item', 'The list jumps to the top'], a: 1, why: 'LazyListState remembers the first visible item’s key and finds it again. Without keys it can only keep the index, so the content slides.' },
        ],
        deeper: [
          {
            title: 'Keys must be unique',
            body: `<p>Two items with the same key crash the list with <code>IllegalArgumentException: Key ... was already used</code>. Compose can’t tell which row owns which state. Ids from your database or server are unique. Names and titles are not.</p>
<p>On Android a key must also fit in a <code>Bundle</code>, so use an <code>Int</code>, <code>Long</code>, <code>String</code> or a <code>Parcelable</code>. The list saves keys to restore scroll position and <code>rememberSaveable</code> state.</p>`,
            visual(el) {
              let byName = false, items, nextId, crashed = false, busy = false;
              const toggle = h('input', { type: 'checkbox', id: 'cmp-dk-name' });
              const head = h('div', { class: 'kt' });
              const list = h('div', { class: 'cmp-lazy cmp-dk-list', role: 'list', 'aria-label': 'Grocery list' });
              const o = out();
              const keyOf = it => (byName ? `"${it.name}"` : String(it.id));
              function paint(fresh) {
                head.innerHTML = hl(`items(items, key = { it.${byName ? 'name' : 'id'} }) { ... }`);
                list.replaceChildren(...items.map(it => h('div', { class: 'cmp-item' + (it === fresh ? ' drop-in' : ''), role: 'listitem' },
                  h('span', { class: 'cmp-box', 'aria-hidden': 'true' }), h('span', { class: 'cmp-name' }, it.name), h('span', { class: 'cmp-tag' }, `key = ${keyOf(it)}`))));
              }
              function reset() {
                byName = toggle.checked; crashed = false;
                items = [{ id: 1, name: 'Milk' }, { id: 2, name: 'Eggs' }, { id: 3, name: 'Bread' }];
                nextId = 4; paint();
                say(o, byName ? 'Keyed by name. Fine while every name is different.' : 'Keyed by id. Every row has its own number.');
              }
              async function add(name) {
                if (busy) return;
                if (crashed) { replay(list, 'shake'); say(o, 'The app crashed. Reset the list.'); return; }
                if (items.length >= 6) { replay(list, 'shake'); say(o, 'Six rows is enough for this demo. Reset the list.'); return; }
                busy = true;
                const it = { id: nextId++, name };
                const clash = items.find(x => keyOf(x) === keyOf(it));
                items.push(it); paint(it);
                await sleep(450);
                if (!el.isConnected) return;
                if (clash) {
                  crashed = true;
                  list.append(h('div', { class: 'cmp-dk-crash drop-in' }, h('b', {}, 'FATAL EXCEPTION: main'), `IllegalArgumentException: Key ${keyOf(it)} was already used.`));
                  replay(list, 'shake');
                  say(o, `<span class="bad">Crash.</span> Two items share ${hl(`key = ${keyOf(it)}`)}. Turn off the name key and try again.`);
                } else say(o, `${hl(`add(Grocery(id = ${it.id}, name = "${name}"))`)} <span class="muted">→</span> <span class="good">new key ${esc(keyOf(it))}, no clash</span>`);
                busy = false;
              }
              toggle.addEventListener('change', () => { if (busy) { toggle.checked = byName; return; } reset(); });
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-dk-name' }, toggle, 'key = { it.name }'), head),
                list,
                h('div', { class: 'controls' }, cmd('items.add(Grocery(name = "Milk"))', () => add('Milk')), cmd('items.add(Grocery(name = "Tea"))', () => add('Tea')), act('Reset list', () => { if (!busy) reset(); })),
                o);
              reset();
            },
          },
          {
            title: 'Keys hold your scroll position',
            body: `<p><code>LazyListState</code> remembers the key of the first visible item, not just its index. When new items arrive above it, the list finds that key again and keeps it in place. Without keys it can only keep the index, so the content slides down under the reader.</p>
<p>This matters for chats and feeds that insert at the top while someone is reading.</p>`,
            visual(el) {
              const ROW = 40;
              let keyed = true, items, first, fresh, busy = false;
              const toggle = h('input', { type: 'checkbox', id: 'cmp-sa-key', checked: true });
              const col = h('div', { class: 'cmp-sa-col' });
              const view = h('div', { class: 'cmp-sa-view', role: 'img', 'aria-label': 'Feed viewport' }, col);
              const idx = h('div', { class: 'kt' });
              const o = out();
              const paintIdx = () => { idx.innerHTML = hl(`firstVisibleItemIndex = ${first}`); };
              function paint(newOnes) {
                col.replaceChildren(...items.map(it => h('div', { class: ['cmp-sa-row', it.read && 'cmp-sa-reading', newOnes && newOnes.includes(it) && 'cmp-ls-in'].filter(Boolean).join(' ') }, it.name, it.read ? h('span', { class: 'cmp-tag' }, 'reading') : null)));
              }
              const place = animate => {
                col.style.transition = animate ? 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
                col.style.transform = `translateY(${-first * ROW}px)`;
              };
              function reset() {
                keyed = toggle.checked; fresh = 0;
                items = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `Post ${i + 1}`, read: i === 4 }));
                first = 4; paint(); place(false); paintIdx();
                say(o, `You scrolled to Post 5 and are reading it. ${keyed ? 'Items have keys.' : 'No keys: the list only knows indexes.'}`);
              }
              async function arrive() {
                if (busy) return;
                if (fresh >= 6) { replay(view, 'shake'); say(o, 'Enough new posts. Reset to try again.'); return; }
                busy = true;
                const add = [1, 2, 3].map(() => ({ id: 100 + ++fresh, name: `New post ${fresh}` }));
                items = [...add, ...items];
                paint(add);
                if (keyed) first += 3;
                place(false); paintIdx(); replay(idx, 'pop-soft');
                if (!keyed) replay(view, 'shake');
                await sleep(450);
                if (!el.isConnected) return;
                say(o, keyed
                  ? `<span class="good">Post 5 stayed put.</span> The list found its key at index ${first} and moved the scroll there.`
                  : `<span class="bad">The content jumped.</span> The index stayed ${first}, which is now ${esc(items[first].name)}. Post 5 slid down.`);
                busy = false;
              }
              toggle.addEventListener('change', () => { if (busy) { toggle.checked = keyed; return; } reset(); });
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-sa-key' }, toggle, 'key = { it.id }'), idx),
                view,
                h('div', { class: 'controls' }, cmd('posts.addAll(0, newPosts)', arrive), act('Reset', () => { if (!busy) reset(); })),
                o);
              reset();
            },
          },
          {
            title: 'contentType for mixed rows',
            body: `<p>When rows of different shapes share one list, also pass <code>contentType</code>. A row that scrolls off is not thrown away at once. Compose keeps it to reuse for the next row coming in, but only for a row of the same type. A header is never rebuilt into a post.</p>`,
            code: `LazyColumn {
    items(
        feed,
        key = { it.id },
        contentType = { if (it is FeedItem.Header) "header" else "post" },
    ) { item ->
        when (item) {
            is FeedItem.Header -> SectionHeader(item)
            is FeedItem.Post -> PostCard(item)
        }
    }
}`,
          },
        ],
        underHood: {
          body: `<p><code>LazyColumn</code> is built on <code>SubcomposeLayout</code>. During measure it works out which items fit on screen and composes each one on demand as its own small piece of composition, tagged with the item’s key. If you pass no key, the key is a wrapper around the index.</p>
<p>On every measure pass the list rebuilds a map from key to index. When an item moves, its composition, its <code>remember</code> slots and its placement animation move with it. A <code>SaveableStateHolder</code> keyed the same way keeps the <code>rememberSaveable</code> values of rows that scrolled off, ready for when they come back.</p>`,
        },
        mistakes: [
          {
            title: 'Keying by hashCode or the whole item',
            bad: `LazyColumn {
    items(todos, key = { it.hashCode() }) { todo ->
        TodoRow(todo)
    }
}`,
            good: `LazyColumn {
    items(todos, key = { it.id }) { todo ->
        TodoRow(todo)
    }
}`,
            why: 'A data class hash changes when any field changes. Edit a todo and the list sees one item removed and a new one added, so its row state resets and it animates out and back in.',
          },
          {
            title: 'remember in a row for state that must last',
            bad: `items(posts, key = { it.id }) { post ->
    var expanded by remember { mutableStateOf(false) }
    PostCard(post, expanded, onToggle = { expanded = !expanded })
}`,
            good: `items(posts, key = { it.id }) { post ->
    var expanded by rememberSaveable { mutableStateOf(false) }
    PostCard(post, expanded, onToggle = { expanded = !expanded })
}`,
            why: 'Rows that scroll far off screen leave the composition, and their <code>remember</code> slots go with them. <code>rememberSaveable</code> keeps the value per key. State the app depends on belongs in the ViewModel.',
          },
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
        predict: {
          q: '<code>key = { it.id }</code> is on. You check Milk, then reverse the list. Where is the check mark?',
          options: ['On Milk, wherever it moved', 'On whatever row is now at index 0', 'Gone: reversing resets every row'],
          a: 0,
          why: 'With a stable key, Compose tracks each row by its id, so remembered state moves with its item.',
        },
      },

      // Images ─────────────────────────────────────────────
      {
        id: 'images',
        title: 'Loading images with Coil',
        tagline: 'AsyncImage downloads, sizes, caches and fades in a picture from a URL.',
        level: 'beginner',
        body: `
<p>Compose has no built-in way to show a picture from a URL. The common choice is Coil, a Kotlin image library built on coroutines. <code>AsyncImage</code> takes a <code>model</code> (a URL string or an <code>ImageRequest</code>), downloads it off the main thread, decodes it and draws it. In Coil 3 the network code is a separate artifact: add <code>coil-network-okhttp</code> next to <code>coil-compose</code>, or every URL ends in the error state.</p>
<p>While the image loads, <code>AsyncImage</code> draws your <code>placeholder</code>. If the request fails it draws <code>error</code>. If the model is <code>null</code>, no request runs and it draws <code>fallback</code>, which defaults to the error painter. <code>crossfade(true)</code> fades the picture in over the placeholder instead of popping it in.</p>
<p>Coil keeps two caches, both on by default. The memory cache holds decoded bitmaps, so a row you scroll back to shows its image at once. The disk cache holds the downloaded bytes, so after the app restarts Coil reads from disk instead of the network.</p>
<p>Give every meaningful image a <code>contentDescription</code> that TalkBack can read aloud. Pass <code>null</code> for pure decoration.</p>`,
        code: `// build.gradle.kts (check coil-kt.github.io for the latest version)
// implementation("io.coil-kt.coil3:coil-compose:3.6.3")
// implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")

@Composable
fun ArticleRow(article: Article, onClick: () -> Unit) {
    Row(Modifier.clickable(onClick = onClick).padding(12.dp)) {
        AsyncImage(
            model = ImageRequest.Builder(LocalPlatformContext.current)
                .data(article.imageUrl)              // String?; null shows the fallback
                .crossfade(true)
                .build(),
            contentDescription = article.imageAlt,   // "Lighthouse at dusk"
            placeholder = painterResource(R.drawable.image_placeholder),
            error = painterResource(R.drawable.image_broken),
            contentScale = ContentScale.Crop,
            modifier = Modifier.size(96.dp).clip(RoundedCornerShape(12.dp)),
        )
        Spacer(Modifier.width(12.dp))
        Text(article.title, style = MaterialTheme.typography.titleMedium)
    }
}`,
        remember: 'AsyncImage with a URL, a placeholder, an error painter and a real contentDescription. Coil sizes and caches it for you.',
        terms: [
          { term: 'AsyncImage', def: 'Coil’s composable that runs an image request in the background and draws the result, a placeholder or an error painter.' },
          { term: 'ImageRequest', def: 'A Coil object that describes one load: the data (URL), crossfade, size and cache options.' },
          { term: 'Memory cache', def: 'Coil’s in-memory store of recently decoded bitmaps. A hit draws the image in the same frame, with no crossfade.' },
          { term: 'Disk cache', def: 'Coil’s on-disk store of downloaded image bytes. It survives an app restart, so the network is not needed again.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show a grey box while loading, a broken-image icon on failure, and fill the square without stretching.', code: 'AsyncImage(\n    model = article.imageUrl,\n    contentDescription = article.imageAlt,\n    [[placeholder]] = painterResource(R.drawable.image_placeholder),\n    [[error]] = painterResource(R.drawable.image_broken),\n    contentScale = ContentScale.[[Crop]],\n    modifier = Modifier.size(96.dp),\n)', why: '<code>placeholder</code> draws during loading and <code>error</code> after a failure. <code>ContentScale.Crop</code> fills the square and trims the edges, keeping the aspect ratio.' },
          { type: 'bug', prompt: 'Every image shows the error painter, even with a working URL. Tap the wrong line.', code: 'AsyncImage(\n    model = ImageRequest.Builder(LocalPlatformContext.current)\n        .data(article.imageUrl)\n        .crossfade(true),\n    contentDescription = article.imageAlt,\n    modifier = Modifier.size(96.dp),\n)', bug: 3, fix: '        .crossfade(true).build(),', why: '<code>model</code> is <code>Any?</code>, so passing the builder compiles. Coil then treats the builder itself as the data, finds no fetcher for it, and the request fails. Call <code>build()</code>.' },
        ],
        quiz: [
          { q: 'You scroll an image off screen and straight back. Where does Coil get it?', options: ['From the network again', 'From the memory cache, drawn at once with no crossfade', 'From the disk cache, with a crossfade'], a: 1, why: 'The decoded bitmap is still in the memory cache. Coil skips the crossfade for memory hits because there is nothing to wait for.' },
          { q: 'The model is <code>null</code> and you set only <code>placeholder</code> and <code>error</code>. What is drawn?', options: ['The placeholder, forever', 'The error painter', 'Nothing'], a: 1, why: 'A null model shows <code>fallback</code>, and <code>fallback</code> defaults to <code>error</code>.' },
          { q: 'A Coil 3 app shows the error painter for every https URL. The URLs work in a browser. Likely cause?', options: ['The disk cache is full', 'The <code>coil-network-okhttp</code> (or Ktor) artifact is missing', 'crossfade is off'], a: 1, why: 'Since Coil 3 the core artifacts cannot load from the network. You add one of the network artifacts.' },
          { q: 'You show a 4000 × 3000 photo in a 96 dp box with <code>Image(rememberAsyncImagePainter(url), …)</code>. What does Coil decode?', options: ['About 96 dp worth of pixels, because the painter reads the box size', 'The full original size, because the painter cannot see the layout', 'Nothing until you add <code>crossfade(true)</code>'], a: 1, why: 'Without a size resolver the painter loads the original, about 48 MB decoded. <code>AsyncImage</code> waits for its constraints and decodes near the drawn size.' },
          { q: 'A row with an image scrolls out of a LazyColumn before the download finishes. What happens to the request?', options: ['Its job is cancelled when the painter leaves the composition', 'It finishes in the background and fills the disk cache', 'It is paused and resumes when the row returns'], a: 0, why: 'AsyncImagePainter launches the request when it enters composition and cancels it when it leaves, so fast flings do not finish unseen downloads.' },
        ],
        deeper: [
          {
            title: 'Decode at the size you draw',
            body: `
<p>A phone photo can be 4000 × 3000 pixels. At 4 bytes a pixel that is about 48 MB of memory once decoded, for a thumbnail that is 96 dp wide on screen.</p>
<p><code>AsyncImage</code> waits for its layout constraints and asks Coil to decode near that size, so the same photo costs well under 1 MB. <code>rememberAsyncImagePainter</code> cannot see the on-screen size and loads the image at its original dimensions unless you give it a size resolver. Use <code>AsyncImage</code> unless you have a reason not to.</p>`,
            code: `// Decodes near 96 dp × 96 dp: AsyncImage reads the constraints.
AsyncImage(model = url, contentDescription = null, modifier = Modifier.size(96.dp))

// Decodes at the original size: the painter cannot see the layout.
Image(painter = rememberAsyncImagePainter(url), contentDescription = null, modifier = Modifier.size(96.dp))`,
            visual(el) {
              const ROWS = 10, FULL = 48, SMALL = 0.6;
              let mode = 'async', rows = 1;
              const fill = h('span', { style: 'width:0%' });
              const meter = h('div', { class: 'meter cmp-im-meter' }, fill);
              const mb = h('div', { class: 'cmp-label' });
              const read = h('div', { class: 'kt' });
              const o = out();
              const btns = [
                cmd('AsyncImage(model = url)', () => set('async')),
                cmd('rememberAsyncImagePainter(url)', () => set('painter')),
              ];
              function paint() {
                const per = mode === 'async' ? SMALL : FULL;
                const total = per * rows;
                const cap = 256;
                fill.style.width = `${Math.min(100, (total / cap) * 100)}%`;
                meter.classList.toggle('cmp-im-hot', total > cap * 0.75);
                mb.textContent = `${rows} row${rows > 1 ? 's' : ''} × ${mode === 'async' ? 'under 1 MB' : 'about 48 MB'} = ${mode === 'async' ? `under ${rows} MB` : `about ${total} MB`} of bitmaps`;
                read.innerHTML = hl(mode === 'async'
                  ? '// size comes from the constraints (96.dp)\ndecoded ≈ thumbnail size'
                  : '// no size resolver\ndecoded = 4000 × 3000 (original)');
              }
              function set(m) {
                mode = m; btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === (m === 'async' ? 0 : 1)))); paint(); replay(meter, 'pop-soft');
                say(o, m === 'async'
                  ? '<span class="good">AsyncImage</span> decodes near the drawn size. Ten rows still fit easily.'
                  : '<span class="bad">rememberAsyncImagePainter</span> without a size decodes the full photo. Show ten rows and memory runs out.');
              }
              const more = act('Show 10 rows', () => { rows = rows === 1 ? ROWS : 1; more.textContent = rows === 1 ? 'Show 10 rows' : 'Show 1 row'; paint(); });
              el.append(h('div', { class: 'controls' }, btns, more), meter, mb, read, o);
              set('async');
            },
          },
          {
            title: 'Describe the picture, or say nothing',
            body: `
<p>TalkBack reads <code>contentDescription</code> aloud. Write what the image shows, in the user’s language, from a string resource so it gets translated. A news photo gets a description. A decorative divider or a background pattern gets <code>null</code>, so TalkBack skips it.</p>
<p>Don’t write “image” or the file name. When the text next to the image already says everything, the image is decoration too.</p>`,
            code: `// Meaningful: say what it shows
AsyncImage(
    model = author.photoUrl,
    contentDescription = stringResource(R.string.cd_author_photo, author.name),  // "Maya’s photo"
)

// Decorative: the headline next to it already says it all
AsyncImage(model = article.bannerUrl, contentDescription = null)`,
          },
          {
            title: 'One ImageLoader for the whole app',
            body: `
<p><code>AsyncImage</code> uses a singleton <code>ImageLoader</code>. Each loader owns its own memory cache, disk cache and HTTP client, so make one and share it. On Android, implement <code>SingletonImageLoader.Factory</code> on your <code>Application</code> to set app-wide defaults such as crossfade and the cache sizes.</p>`,
            code: `class NewsApp : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: PlatformContext): ImageLoader =
        ImageLoader.Builder(context)
            .crossfade(true)                               // default for every request
            .memoryCache {
                MemoryCache.Builder()
                    .maxSizePercent(context, 0.25)         // share of app memory
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(context.cacheDir.resolve("image_cache"))
                    .maxSizePercent(0.02)                  // share of free disk space
                    .build()
            }
            .build()
}`,
          },
        ],
        underHood: {
          body: `
<p><code>AsyncImage</code> creates an <code>AsyncImagePainter</code>. When the painter enters composition it launches the request in a coroutine. When it leaves composition, for example when a row scrolls out of a lazy list, that job is cancelled, so a fast fling does not finish downloads nobody will see.</p>
<p>The request walks the caches in order: memory cache (decoded bitmap), then disk cache (raw bytes, decoded again), then the network (bytes saved to disk, decoded, then saved in memory). The crossfade is skipped when the memory cache answers, because the image is ready on the first frame.</p>`,
        },
        mistakes: [
          {
            title: 'Only the Compose artifact',
            bad: `implementation("io.coil-kt.coil3:coil-compose:3.6.3")`,
            good: `implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")`,
            why: 'Coil 3 moved network loading out of the core. Without a network artifact every http and https URL fails and you only ever see the error painter.',
          },
          {
            title: 'SubcomposeAsyncImage in a long list',
            bad: `items(articles, key = { it.id }) { a ->
    SubcomposeAsyncImage(
        model = a.imageUrl,
        loading = { CircularProgressIndicator() },
        contentDescription = a.imageAlt,
    )
}`,
            good: `items(articles, key = { it.id }) { a ->
    AsyncImage(
        model = a.imageUrl,
        placeholder = painterResource(R.drawable.image_placeholder),
        contentDescription = a.imageAlt,
    )
}`,
            why: 'SubcomposeAsyncImage composes its slots during layout, which is slower than normal composition. Coil’s docs advise against it in performance-critical places such as lazy lists. A placeholder painter is cheap.',
          },
          {
            title: 'A useless description',
            bad: `AsyncImage(model = article.imageUrl, contentDescription = "image")`,
            good: `AsyncImage(model = article.imageUrl, contentDescription = article.imageAlt)`,
            why: 'TalkBack reads “image”, which tells the user nothing. Describe what the picture shows, or pass null if it is decoration.',
          },
        ],
        visual(el) {
          const URL = 'https://cdn.example.com/lighthouse.jpg';
          let ph = true, cf = true, busy = false, model = URL;
          const mem = new Set(), disk = new Set();
          const pic = h('div', { class: 'cmp-im-pic', 'aria-hidden': 'true' }, h('i', { class: 'cmp-im-sun' }), h('i', { class: 'cmp-im-tower' }));
          const phLayer = h('div', { class: 'cmp-im-ph' }, 'placeholder');
          const errLayer = h('div', { class: 'cmp-im-err' }, h('b', {}, '⚠'), 'error');
          const frame = h('div', { class: 'cmp-im-frame' }, phLayer, pic, errLayer);
          const row = h('div', { class: 'cmp-im-row' }, frame, h('div', { class: 'cmp-im-text' }, h('b', {}, 'Lighthouse at dusk'), h('small', {}, 'Travel · 3 min read')));
          const stage = (name, sub) => {
            const pill = h('span', { class: 'cmp-im-pill' }, 'empty');
            const n = h('div', { class: 'cmp-im-stage' }, h('b', {}, name), h('small', {}, sub), pill);
            return Object.assign(n, { pill });
          };
          const sMem = stage('Memory cache', 'decoded bitmaps');
          const sDisk = stage('Disk cache', 'downloaded bytes');
          const sNet = stage('Network', 'cdn.example.com');
          sNet.pill.textContent = 'origin';
          const stages = [sMem, sDisk, sNet];
          const stateLine = h('div', { class: 'cmp-label cmp-im-state' });
          const read = h('div', { class: 'kt' });
          const o = out();
          const paintRead = () => {
            read.innerHTML = hl(`AsyncImage(\n    model = ImageRequest.Builder(context)\n        .data(${model === null ? 'null' : model === 'bad' ? '"…/missing.jpg"' : 'url'})\n        .crossfade(${cf})\n        .build(),\n    placeholder = ${ph ? 'painterResource(R.drawable.ph)' : 'null'},\n    error = painterResource(R.drawable.broken),\n    contentDescription = "Lighthouse at dusk",\n)`);
          };
          const paintCaches = () => {
            sMem.pill.textContent = mem.size ? 'lighthouse.jpg' : 'empty';
            sDisk.pill.textContent = disk.size ? 'lighthouse.jpg' : 'empty';
            sMem.pill.classList.toggle('cmp-im-has', mem.size > 0);
            sDisk.pill.classList.toggle('cmp-im-has', disk.size > 0);
          };
          const setState = s => { stateLine.textContent = `painter.state = ${s}`; };
          const calm = () => stages.forEach(s => s.classList.remove('cmp-im-on', 'cmp-im-hit', 'cmp-im-miss'));
          function show(layer, fade) {
            [phLayer, pic, errLayer].forEach(l => { l.classList.remove('cmp-im-show'); l.style.transition = 'none'; });
            if (!layer) return;
            void layer.offsetWidth;
            layer.style.transition = fade ? 'opacity 0.9s ease' : 'none';
            layer.classList.add('cmp-im-show');
          }
          const check = async (s, ms, hit) => {
            calm(); s.classList.add('cmp-im-on');
            await sleep(ms);
            if (!el.isConnected) return false;
            s.classList.remove('cmp-im-on'); s.classList.add(hit ? 'cmp-im-hit' : 'cmp-im-miss');
            return true;
          };
          async function load(m) {
            if (busy) return; busy = true;
            model = m; paintRead(); calm();
            if (m === null) {
              show(errLayer, false); setState('Error (fallback)');
              say(o, `${hl('model = null')} <span class="muted">// no request at all. fallback defaults to the error painter.</span>`);
              busy = false; return;
            }
            const key = m === URL ? 'lighthouse' : 'bad';
            if (mem.has(key)) {
              await check(sMem, 160, true); if (!el.isConnected) return;
              show(pic, false); setState('Success(dataSource = MEMORY_CACHE)');
              say(o, '<span class="good">memory cache hit:</span> drawn in the first frame. No crossfade, because there was nothing to wait for.');
              busy = false; return;
            }
            show(ph ? phLayer : null, false); setState('Loading');
            if (!await check(sMem, 260, false)) return;
            if (disk.has(key)) {
              if (!await check(sDisk, 500, true)) return;
              mem.add(key); paintCaches();
              show(pic, cf); setState('Success(dataSource = DISK)');
              say(o, `<span class="good">disk cache hit:</span> no network. Coil decoded the saved bytes and put the bitmap in memory. ${cf ? '<span class="muted">Crossfade (slowed down here).</span>' : ''}`);
              busy = false; return;
            }
            if (!await check(sDisk, 260, false)) return;
            calm(); sNet.classList.add('cmp-im-on');
            say(o, `<span class="muted">downloading… ${ph ? 'the placeholder holds the space.' : 'no placeholder: the box is empty.'}</span>`);
            await sleep(1300); if (!el.isConnected) return;
            sNet.classList.remove('cmp-im-on');
            if (key === 'bad') {
              sNet.classList.add('cmp-im-miss'); replay(sNet, 'shake');
              show(errLayer, cf); setState('Error(HTTP 404)');
              say(o, '<span class="bad">404:</span> the error painter replaces the placeholder. Nothing is cached.');
              busy = false; return;
            }
            sNet.classList.add('cmp-im-hit');
            disk.add(key); mem.add(key); paintCaches();
            show(pic, cf); setState('Success(dataSource = NETWORK)');
            say(o, `<span class="good">network:</span> bytes saved to disk, bitmap saved in memory. ${cf ? 'The image fades in over the placeholder <span class="muted">(slowed down here)</span>.' : 'crossfade(false): the image pops in.'}`);
            busy = false;
          }
          function scrollBack() {
            if (busy) return;
            show(null); setState('Empty'); calm();
            say(o, '<span class="muted">The row left composition, then came back. AsyncImage asks again…</span>');
            setTimeout(() => load(URL), 350);
          }
          function restart() {
            if (busy) return;
            mem.clear(); paintCaches(); show(null); calm(); setState('Empty');
            replay(sMem, 'shake');
            say(o, 'The process died: the memory cache is gone. The disk cache is still there. Load the photo again.');
          }
          const sw = (id, label, on, fn) => {
            const i = h('input', { type: 'checkbox', id, checked: on });
            i.addEventListener('change', () => { fn(i.checked); paintRead(); });
            return h('label', { class: 'switch', for: id }, i, label);
          };
          paintRead(); paintCaches(); setState('Empty');
          say(o, 'Load the photo, scroll it away and back, then restart the app and load it again.');
          el.append(
            h('div', { class: 'controls' },
              cmd('load(url)', () => load(URL)),
              act('Scroll away and back', scrollBack),
              act('Restart the app', restart)),
            h('div', { class: 'controls' },
              cmd('load("…/missing.jpg")', () => load('bad')),
              cmd('load(null)', () => load(null)),
              sw('cmp-im-phon', 'placeholder', true, v => { ph = v; }),
              sw('cmp-im-cfon', 'crossfade(true)', true, v => { cf = v; })),
            h('div', { class: 'cmp-im-wrap' },
              h('div', { class: 'cmp-im-left' }, row, stateLine),
              h('div', { class: 'cmp-im-pipe' }, sMem, h('span', { class: 'arrow' }, '↓'), sDisk, h('span', { class: 'arrow' }, '↓'), sNet)),
            read, o);
        },
        predict: {
          q: 'You load the photo, then restart the app and load it again. Where does Coil get it this time?',
          options: ['The memory cache', 'The disk cache', 'The network again'],
          a: 1,
          why: 'The memory cache dies with the process. The disk cache keeps the downloaded bytes, so after a restart Coil reads and decodes them from disk.',
        },
      },

      // 12 ─────────────────────────────────────────────
      {
        id: 'gestures',
        title: 'Gestures and clicks',
        tagline: 'clickable for taps, pointerInput for everything else.',
        body: `
<p>For a plain tap, use <code>Modifier.clickable</code>. It handles the press, draws the ripple from the theme, and tells accessibility services the element can be clicked. You can pass <code>indication = null</code> to drop the ripple, but then users get no feedback when they press.</p>
<p><code>combinedClickable</code> adds <code>onDoubleClick</code> and <code>onLongClick</code>. There is a catch. Once you set <code>onDoubleClick</code>, a single tap has to wait out the double-tap timeout before <code>onClick</code> fires, because it might still turn into a double tap.</p>
<p>For raw gestures, use <code>Modifier.pointerInput</code> with a detector like <code>detectTapGestures</code>, which gives you the tap position, or <code>detectDragGestures</code>. These are low level: no ripple and no click semantics unless you add them. The key you pass to <code>pointerInput</code> restarts the detector when it changes.</p>`,
        code: `@Composable
fun PhotoCard(photo: Photo, onOpen: () -> Unit, onLike: () -> Unit, onMenu: () -> Unit) {
    Image(
        painter = painterResource(photo.res),
        contentDescription = photo.title,
        modifier = Modifier.combinedClickable(
            onClick = onOpen,              // waits out the double-tap timeout
            onDoubleClick = onLike,
            onLongClick = onMenu,
            onLongClickLabel = "Photo options",
        ),
    )
}

@Composable
fun DraggableDot() {
    var offset by remember { mutableStateOf(Offset.Zero) }
    Box(
        Modifier
            .offset { IntOffset(offset.x.roundToInt(), offset.y.roundToInt()) }
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    offset += dragAmount
                }
            }
            .size(56.dp)
            .background(MaterialTheme.colorScheme.primary, CircleShape)
    )
}`,
        remember: 'clickable for taps. combinedClickable for double and long press. pointerInput for raw gestures, with no ripple for free.',
        level: 'intermediate',
        terms: [
          { term: 'combinedClickable', def: 'A modifier like clickable that also reports double taps and long presses through onDoubleClick and onLongClick.' },
          { term: 'pointerInput', def: 'A modifier that runs a suspend block to read raw pointer events, restarting the block when its keys change.' },
          { term: 'Indication', def: 'The visual feedback a clickable element draws on press, such as the Material ripple.' },
          { term: 'detectDragGestures', def: 'A pointerInput detector that reports each drag movement as a change and a dragAmount offset.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Track a drag and move the box by it.', code: 'Modifier.pointerInput(Unit) {\n    [[detectDragGestures]] { change, dragAmount ->\n        change.[[consume]]()\n        offset += dragAmount\n    }\n}', why: 'The detector hands you each movement. Consuming the change stops parents, like a scrolling list, from also handling it.' },
          { type: 'bug', prompt: 'After a new video loads, taps still seek using the old duration. Tap the line that causes it.', code: '@Composable\nfun SeekBar(durationMs: Long, onSeek: (Float) -> Unit) {\n    Box(\n        Modifier\n            .fillMaxWidth()\n            .height(48.dp)\n            .pointerInput(Unit) {\n                detectTapGestures { offset ->\n                    onSeek(offset.x / size.width * durationMs)\n                }\n            }\n    )\n}', bug: 6, fix: '            .pointerInput(durationMs, onSeek) {', why: 'With <code>Unit</code> as the key, the detector never restarts and keeps the first <code>durationMs</code> it captured. Key it on the values it reads.' },
        ],
        quiz: [
          { q: 'You add <code>onDoubleClick</code> to a <code>combinedClickable</code>. What happens on a single tap?', options: ['<code>onClick</code> fires right away', '<code>onClick</code> fires once the double-tap timeout passes', '<code>onClick</code> never fires'], a: 1, why: 'Compose has to wait to see if a second tap is coming.' },
          { q: 'Which gives you the exact position of a tap?', options: ['<code>Modifier.clickable</code>', '<code>pointerInput</code> with <code>detectTapGestures</code>', 'Both'], a: 1, why: '<code>onTap</code> in <code>detectTapGestures</code> receives an <code>Offset</code>. <code>clickable</code> only says that a click happened.' },
          { q: 'Why prefer <code>clickable</code> over <code>pointerInput</code> for a button-like tap?', options: ['It is faster', 'It adds ripple feedback and click semantics for accessibility', '<code>pointerInput</code> can’t detect taps'], a: 1, why: 'A raw detector gives you neither feedback nor semantics. <code>clickable</code> includes both.' },
          { q: 'A row inside a vertical LazyColumn uses <code>detectDragGestures</code> for swipe-to-archive. Users cannot scroll the list from the rows. Which fix fits?', options: ['Use <code>detectHorizontalDragGestures</code>, which only claims horizontal movement', 'Call <code>change.consume()</code> less often', 'Put <code>pointerInput</code> after <code>offset</code> in the chain'], a: 0, why: 'detectDragGestures claims any direction past touch slop. The horizontal detector never claims a vertical swipe, so the list keeps it.' },
          { q: 'A swipe-to-archive row is built only with <code>pointerInput</code>. What do TalkBack users get?', options: ['The swipe as an action, because pointerInput adds semantics', 'A double-tap that triggers the swipe', 'Nothing: add a <code>CustomAccessibilityAction</code> in <code>semantics</code> so Archive shows up in the actions menu'], a: 2, why: 'Raw detectors add no semantics. Expose the same action through semantics so screen reader and Switch Access users can use it.' },
        ],
        deeper: [
          {
            title: 'Who gets the drag?',
            body: `<p>A swipeable row inside a scrolling list means two gesture handlers see the same finger. Each one waits until the finger has moved past the <em>touch slop</em>, a few dp, and the first one to claim the movement consumes it. The other then sees consumed changes and backs off.</p>
<p><code>detectDragGestures</code> claims a drag in any direction, so a vertical swipe on the row is eaten by the row, and the list can’t scroll from there. <code>detectHorizontalDragGestures</code> only claims horizontal movement. On a vertical swipe it never claims, and the list scrolls as usual. Pick the detector that matches the direction you need. <code>Modifier.draggable</code> works the same way with an <code>orientation</code>.</p>`,
            code: `Modifier.pointerInput(Unit) {
    detectHorizontalDragGestures { change, dragAmount ->
        change.consume()
        offsetX += dragAmount              // vertical swipes go to the list
    }
}`,
            visual(el) {
              let horiz = false, busy = false, scrollY = 0, rowX = 0;
              const rows = [];
              for (let i = 0; i < 9; i++) rows.push(h('div', { class: `cmp-d2g-row${i === 2 ? ' cmp-d2g-me' : ''}` }, i === 2 ? 'Swipeable row' : `Message ${i + 1}`));
              const col = h('div', { class: 'cmp-d2g-col' }, rows);
              const finger = h('span', { class: 'cmp-d2g-finger', 'aria-hidden': 'true' });
              const frame = h('div', { class: 'cmp-d2g-frame', role: 'img', 'aria-label': 'List with a swipeable row' }, col, finger);
              const code = h('div', { class: 'kt' });
              const o = out();
              const modeBtns = [[false, 'detectDragGestures'], [true, 'detectHorizontalDragGestures']].map(([v, src]) => cmd(src, () => {
                if (busy) return;
                horiz = v; paint();
                say(o, v ? 'The row only claims horizontal drags now.' : 'The row claims a drag in any direction.');
              }));
              function paint() {
                modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === (horiz ? 1 : 0))));
                code.innerHTML = hl(`Row(Modifier.pointerInput(Unit) {\n    ${horiz ? 'detectHorizontalDragGestures { change, dx ->' : 'detectDragGestures { change, dragAmount ->'}\n        change.consume()\n        offsetX += ${horiz ? 'dx' : 'dragAmount.x'}\n    }\n})`);
              }
              const place = () => { col.style.transform = `translateY(${-scrollY}px)`; rows[2].style.transform = `translateX(${rowX}px)`; };
              async function swipe(dir) {
                if (busy) return; busy = true;
                frame.classList.remove('cmp-d2g-win-row', 'cmp-d2g-win-list');
                scrollY = 0; rowX = 0; col.style.transition = rows[2].style.transition = 'transform 0.3s'; place();
                await sleep(320); if (!el.isConnected) return;
                col.style.transition = rows[2].style.transition = 'none';
                const r = rows[2].getBoundingClientRect(), f = frame.getBoundingClientRect();
                let x = r.left - f.left + r.width * 0.6, y = r.top - f.top + r.height / 2;
                finger.style.left = `${x}px`; finger.style.top = `${y}px`; finger.classList.add('cmp-on');
                const vertical = dir === 'up';
                const winner = vertical ? (horiz ? 'list' : 'row') : 'row';
                say(o, `Finger down on the row, moving ${vertical ? 'up' : 'left'}…`);
                for (let s = 1; s <= 12; s++) {
                  await sleep(55); if (!el.isConnected) return;
                  const dx = vertical ? 0 : -9, dy = vertical ? -9 : 0;
                  x += dx; y += dy;
                  finger.style.left = `${x}px`; finger.style.top = `${y}px`;
                  if (s === 2) {
                    frame.classList.add(winner === 'row' ? 'cmp-d2g-win-row' : 'cmp-d2g-win-list');
                    say(o, `Past touch slop: the ${winner === 'row' ? 'row' : 'list'} claims the gesture and consumes it.`);
                  }
                  if (s > 2) {
                    if (winner === 'list') scrollY = Math.min(140, scrollY - dy);
                    else rowX = Math.max(-110, rowX + dx);
                    place();
                  }
                }
                finger.classList.remove('cmp-on');
                if (vertical && !horiz) say(o, '<span class="bad">Stuck.</span> The row claimed a vertical drag, then only used dragAmount.x. The list never got to scroll.');
                else if (vertical) say(o, '<span class="good">The list scrolled.</span> The horizontal detector never claimed a vertical drag.');
                else say(o, `<span class="good">The row moved.</span> A horizontal swipe is the row’s, with either detector.`);
                busy = false;
              }
              paint();
              say(o, 'Pick a detector, then swipe up on the row.');
              el.append(
                h('div', { class: 'cmp-sc-wrap' }, frame, h('div', { class: 'cmp-sc-side' }, code,
                  h('div', { class: 'controls' }, act('Swipe up on the row', () => swipe('up')), act('Swipe left on the row', () => swipe('left'))))),
                h('div', { class: 'controls' }, modeBtns), o);
            },
          },
          {
            title: 'Settle on release with velocity',
            body: `<p>A swipe should finish on its own when the finger lifts. Move the item with an <code>Animatable</code>: <code>snapTo</code> while dragging, <code>animateTo</code> on release. Then decide where it settles. Distance alone feels wrong, because a short, fast flick clearly means “throw it away”.</p>
<p>A <code>VelocityTracker</code> collects recent pointer positions and estimates the speed at release. Archive if the item moved past half its width <em>or</em> the release was fast enough. Material’s <code>SwipeToDismissBox</code> packages the same idea for list items.</p>`,
            code: `val offsetX = remember { Animatable(0f) }
val scope = rememberCoroutineScope()
val currentOnArchive by rememberUpdatedState(onArchive)

Modifier
    .pointerInput(Unit) {                    // before offset: positions stay in the row's space
        val tracker = VelocityTracker()
        val minFling = 600.dp.toPx()
        detectHorizontalDragGestures(
            onDragStart = { tracker.resetTracking() },
            onDragEnd = {
                val v = tracker.calculateVelocity().x
                val gone = abs(offsetX.value) > size.width / 2f || abs(v) > minFling
                scope.launch {
                    if (gone) {
                        offsetX.animateTo(if (offsetX.value < 0f) -size.width.toFloat() else size.width.toFloat())
                        currentOnArchive()
                    } else offsetX.animateTo(0f, spring())
                }
            },
        ) { change, dragAmount ->
            change.consume()
            tracker.addPosition(change.uptimeMillis, change.position)
            scope.launch { offsetX.snapTo(offsetX.value + dragAmount) }
        }
    }
    .offset { IntOffset(offsetX.value.roundToInt(), 0) }`,
            visual(el) {
              const MIN_FLING = 600;
              let useVel = true, busy = false, x = 0, n = 1, drag = null;
              const card = h('div', { class: 'cmp-d2g-card' }, h('b', {}, 'Email 1'), h('small', {}, 'Drag me, or use the buttons'));
              const under = h('div', { class: 'cmp-d2g-under' }, 'Archive');
              const track = h('div', { class: 'cmp-d2g-track' }, under, card);
              const read = h('div', { class: 'kt' });
              const o = out();
              const sw = h('input', { type: 'checkbox', id: 'cmp-d2g-vel', checked: true });
              const W = () => track.clientWidth || 300;
              const setX = (v, ms) => { x = v; card.style.transition = ms ? `transform ${ms}ms cubic-bezier(0.2, 0.8, 0.2, 1)` : 'none'; card.style.transform = `translateX(${x}px)`; };
              function show(v) { read.innerHTML = hl(`offset = ${Math.round(x)} px (${Math.round(Math.abs(x) / W() * 100)}% of width)\nvelocity = ${Math.round(v)} dp/s   // fling at ${MIN_FLING}\nuseVelocity = ${useVel}`); }
              async function release(v) {
                const far = Math.abs(x) > W() / 2, fast = useVel && Math.abs(v) > MIN_FLING;
                show(v);
                if (far || fast) {
                  setX(x < 0 ? -W() - 20 : W() + 20, 320);
                  say(o, `<span class="good">Archived.</span> ${far ? 'It passed half the width.' : `Only ${Math.round(Math.abs(x) / W() * 100)}% of the width, but the release was fast.`}`);
                  await sleep(900); if (!el.isConnected) return;
                  n++; card.firstElementChild.textContent = `Email ${n}`;
                  setX(0, 0); replay(card, 'drop-in');
                } else {
                  setX(0, 450);
                  say(o, `<span class="muted">Sprang back.</span> ${!useVel && Math.abs(v) > MIN_FLING ? '<span class="bad">That flick was fast, but velocity is ignored, so it feels broken.</span>' : 'Not far enough and not fast enough.'}`);
                }
              }
              async function sim(frac, ms, label) {
                if (busy || drag) return; busy = true;
                say(o, `${esc(label)}…`);
                const target = -frac * W(), steps = Math.max(4, Math.round(ms / 30));
                for (let i = 1; i <= steps; i++) {
                  setX(target * i / steps, 0);
                  await sleep(ms / steps); if (!el.isConnected) return;
                }
                await release(-frac * W() / (ms / 1000));
                busy = false;
              }
              let hist = [];
              card.addEventListener('pointerdown', e => {
                if (busy) return;
                drag = { start: e.clientX - x }; hist = [{ t: performance.now(), x }];
                card.setPointerCapture && card.setPointerCapture(e.pointerId);
                card.classList.add('cmp-d2g-held');
              });
              card.addEventListener('pointermove', e => {
                if (!drag) return;
                setX(e.clientX - drag.start, 0);
                hist.push({ t: performance.now(), x }); hist = hist.filter(p => performance.now() - p.t < 100);
                show(0);
              });
              const up = () => {
                if (!drag) return;
                drag = null; card.classList.remove('cmp-d2g-held');
                const a = hist[0], b = hist[hist.length - 1], dt = (b.t - a.t) / 1000;
                busy = true;
                release(dt > 0 ? (b.x - a.x) / dt : 0).then(() => { busy = false; });
              };
              card.addEventListener('pointerup', up);
              card.addEventListener('pointercancel', up);
              sw.addEventListener('change', () => {
                useVel = sw.checked; show(0);
                say(o, useVel ? 'Distance or velocity: a fast flick counts.' : 'Distance only: try the quick flick now.');
              });
              show(0);
              say(o, 'Drag the card left and let go, or use a button.');
              el.append(track, read,
                h('div', { class: 'controls' },
                  act('Slow drag to 30%', () => sim(0.3, 900, 'Slow drag to 30%')),
                  act('Quick flick, 25%', () => sim(0.25, 90, 'Quick flick to 25%')),
                  act('Slow drag to 60%', () => sim(0.6, 1000, 'Slow drag to 60%'))),
                h('label', { class: 'switch', for: 'cmp-d2g-vel' }, sw, 'Use VelocityTracker'),
                o);
            },
          },
          {
            title: 'Give custom gestures a way in for everyone',
            body: `<p>A swipe made with <code>pointerInput</code> is invisible to TalkBack and Switch Access. Those users can’t perform the gesture, and nothing tells them it exists. Add the same action through semantics, so it shows up in the accessibility actions menu.</p>
<p><code>clickable</code> and <code>combinedClickable</code> add click semantics on their own. Raw detectors never do. The Accessibility track covers semantics in depth.</p>`,
            code: `Modifier
    .pointerInput(Unit) { detectHorizontalDragGestures(/* swipe to archive */) }
    .semantics {
        customActions = listOf(
            CustomAccessibilityAction(label = "Archive") { onArchive(); true },
        )
    }`,
          },
        ],
        underHood: {
          body: `<p>The block you pass to <code>pointerInput</code> is a suspend function. Compose runs it in a coroutine tied to the modifier and restarts it when a key changes. Inside, the detectors are ordinary loops that suspend until the next pointer event arrives.</p>
<p>Each event travels through the hit-tested elements in three passes: <code>Initial</code> from parent to child, <code>Main</code> from child to parent, and <code>Final</code> from parent to child again. Detectors normally act in the Main pass, so the innermost element gets the first chance. “Consuming” just sets a flag on the <code>PointerInputChange</code>. Other handlers check that flag and back off, which is how the row and the list in step 1 avoid fighting.</p>`,
          code: `// A tiny tap detector, written by hand
Modifier.pointerInput(Unit) {
    awaitEachGesture {
        awaitFirstDown()                         // suspends until a finger touches
        val up = waitForUpOrCancellation()       // null if another handler consumed it
        if (up != null) {
            up.consume()
            onTap(up.position)
        }
    }
}`,
        },
        mistakes: [
          {
            title: 'Moving with the value version of offset',
            bad: `var offsetX by remember { mutableFloatStateOf(0f) }
Box(
    Modifier
        .offset(x = offsetX.dp)
        .pointerInput(Unit) { detectHorizontalDragGestures { _, dx -> offsetX += dx } }
)`,
            good: `var offsetX by remember { mutableFloatStateOf(0f) }
Box(
    Modifier
        .offset { IntOffset(offsetX.roundToInt(), 0) }
        .pointerInput(Unit) { detectHorizontalDragGestures { _, dx -> offsetX += dx } }
)`,
            why: 'The value version reads the state during composition, so the Box recomposes on every frame of the drag. It also treats pixels as dp, so the box outruns the finger on dense screens. The lambda version reads in the layout phase, in pixels.',
          },
          {
            title: 'A tiny clickable icon',
            bad: `Icon(
    Icons.Default.Close,
    contentDescription = "Close",
    modifier = Modifier.size(24.dp).clickable { onClose() },
)`,
            good: `IconButton(onClick = onClose) {
    Icon(Icons.Default.Close, contentDescription = "Close")
}`,
            why: 'The touch target is only 24 dp, hard to hit. <code>IconButton</code> keeps the 24 dp icon but makes the target at least 48 dp and gives it the button role.',
          },
        ],
        visual(el) {
          const LONG = 400, DOUBLE = 300;
          const MODES = {
            click: { label: 'Modifier.clickable', src: 'Modifier.clickable { count++ }', hint: 'Tap the card.' },
            combined: { label: 'combinedClickable', src: 'combinedClickable(onClick, onDoubleClick, onLongClick)', hint: 'Tap, double tap, or press and hold the card.' },
            tap: { label: 'detectTapGestures', src: 'pointerInput(Unit) { detectTapGestures { offset -> } }', hint: 'Tap anywhere in the pad.' },
            drag: { label: 'detectDragGestures', src: 'pointerInput(Unit) { detectDragGestures { change, dragAmount -> } }', hint: 'Drag the dot.' },
          };
          let mode = 'click', ripple = true, count = 0, logN = 0, pos = { x: 40, y: 40 };
          let downAt = 0, longTimer = 0, tapTimer = 0, longFired = false, pendingTap = false, dragging = false, last = null, moved = { x: 0, y: 0 }, lastLog = 0;
          const pad = h('div', { class: 'cmp-gs-pad' });
          const num = h('b', {}, '0'), sub = h('small', {});
          const target = h('div', { class: 'cmp-gs-target', role: 'button', 'aria-label': 'Gesture target' }, num, sub);
          const meter = h('span', {});
          const meterBox = h('div', { class: 'cmp-gs-meter', 'aria-hidden': 'true' }, meter);
          const puck = h('div', { class: 'cmp-gs-puck' }, 'drag');
          const log = h('div', { class: 'cmp-gs-log', 'aria-live': 'polite' });
          const o = out();
          const rippleIn = h('input', { type: 'checkbox', id: 'cmp-gs-ripple', checked: true });
          const modeBtns = Object.entries(MODES).map(([k, m]) => cmd(m.label, () => setMode(k), { 'aria-label': m.src }));
          const clearTimers = () => { clearTimeout(longTimer); clearTimeout(tapTimer); longTimer = tapTimer = 0; };
          function addLog(html) {
            log.prepend(h('div', { class: 'drop-in', html: `<span class="muted">${++logN}</span> ${html}` }));
            while (log.children.length > 5) log.lastElementChild.remove();
          }
          function bar(ms, wait) {
            meter.className = wait ? 'cmp-gs-wait' : '';
            meter.style.transition = 'none'; meter.style.width = '0';
            void meter.offsetWidth;
            meter.style.transition = `width ${ms}ms linear`; meter.style.width = '100%';
          }
          function stopBar() { const w = getComputedStyle(meter).width; meter.style.transition = 'none'; meter.style.width = w; }
          function wave(e, host) {
            if (!ripple || mode === 'tap' || mode === 'drag') return;
            const r = host.getBoundingClientRect();
            const w = h('span', { class: 'cmp-gs-wave', style: `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px` });
            host.prepend(w); setTimeout(() => w.remove(), 650);
          }
          function bump(label) { count++; num.textContent = String(count); replay(num, 'pop'); sub.textContent = label; }
          function setMode(k) {
            clearTimers(); mode = k; pendingTap = false; longFired = false;
            modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(MODES)[i] === k)));
            rippleIn.disabled = k === 'tap' || k === 'drag';
            target.classList.toggle('cmp-gs-full', k === 'tap');
            count = 0; num.textContent = '0';
            sub.textContent = k === 'combined' ? 'tap · double · hold' : k === 'tap' ? 'onTap(offset)' : 'onClick';
            meter.style.transition = 'none'; meter.style.width = '0';
            const kids = [target];
            if (k === 'combined') kids.push(meterBox);
            if (k === 'drag') kids.splice(0, 1, puck);
            pad.replaceChildren(...kids);
            if (k === 'drag') place();
            num.style.display = k === 'tap' ? 'none' : '';
            log.replaceChildren();
            addLog(`${hl(MODES[k].src)}`);
            say(o, `${MODES[k].hint}${k === 'tap' || k === 'drag' ? ' <span class="muted">// pointerInput draws no ripple</span>' : ''}`);
          }
          function place() { puck.style.transform = `translate(${pos.x}px, ${pos.y}px)`; puck.textContent = `${Math.round(pos.x)}, ${Math.round(pos.y)}`; }
          target.addEventListener('pointerdown', e => {
            if (mode === 'drag') return;
            wave(e, target);
            if (mode !== 'combined') return;
            downAt = performance.now(); longFired = false;
            clearTimeout(longTimer);
            bar(LONG, false);
            longTimer = setTimeout(() => {
              if (!el.isConnected) return;
              longFired = true; pendingTap = false; clearTimeout(tapTimer);
              bump('onLongClick'); replay(target, 'shake');
              addLog(`<span class="good">onLongClick()</span> <span class="muted">held ${LONG} ms</span>`);
              say(o, `Held for ${LONG} ms: ${hl('onLongClick()')} fired while your finger was still down.`);
            }, LONG);
          });
          target.addEventListener('pointerup', e => {
            if (mode === 'drag') return;
            if (mode === 'click') {
              bump('onClick');
              addLog(`<span class="good">onClick()</span> <span class="muted">fires on release</span>`);
              say(o, `${hl('onClick()')} ran on release${ripple ? ', and the ripple showed the press.' : '. No ripple, so the press gave no feedback.'}`);
              return;
            }
            if (mode === 'tap') {
              const r = pad.getBoundingClientRect(), x = Math.round(e.clientX - r.left), y = Math.round(e.clientY - r.top);
              const dot = h('span', { class: 'cmp-gs-dot pop', style: `left:${x}px;top:${y}px` }, h('span', {}, `Offset(${x}, ${y})`));
              pad.append(dot);
              while (pad.querySelectorAll('.cmp-gs-dot').length > 3) pad.querySelector('.cmp-gs-dot').remove();
              addLog(`<span class="good">onTap</span>(${hl(`Offset(${x}.0, ${y}.0)`)})`);
              say(o, `${hl('detectTapGestures')} gave the exact position. <span class="muted">No ripple and no click semantics come with it.</span>`);
              return;
            }
            clearTimeout(longTimer); stopBar();
            if (longFired) { longFired = false; return; }
            if (pendingTap) {
              clearTimeout(tapTimer); pendingTap = false;
              bump('onDoubleClick'); replay(target, 'pop');
              addLog(`<span class="good">onDoubleClick()</span> <span class="muted">second tap inside ${DOUBLE} ms</span>`);
              say(o, `Two taps inside ${DOUBLE} ms: ${hl('onDoubleClick()')}. onClick never ran.`);
              return;
            }
            pendingTap = true;
            bar(DOUBLE, true);
            addLog(`<span class="muted">tap up · waiting ${DOUBLE} ms for a second tap…</span>`);
            tapTimer = setTimeout(() => {
              if (!el.isConnected || !pendingTap) return;
              pendingTap = false; bump('onClick');
              addLog(`<span class="good">onClick()</span> <span class="muted">${Math.round(performance.now() - downAt)} ms after the press</span>`);
              say(o, `${hl('onClick()')} ran late: Compose waited ${DOUBLE} ms in case it was a double tap.`);
            }, DOUBLE);
          });
          target.addEventListener('pointerleave', () => { if (mode === 'combined' && !longFired && longTimer) { clearTimeout(longTimer); stopBar(); } });
          puck.addEventListener('pointerdown', e => {
            dragging = true; last = { x: e.clientX, y: e.clientY }; moved = { x: 0, y: 0 };
            puck.setPointerCapture && puck.setPointerCapture(e.pointerId);
            puck.classList.add('cmp-gs-held');
            addLog(`<span class="good">onDragStart</span>`);
          });
          puck.addEventListener('pointermove', e => {
            if (!dragging) return;
            const dx = e.clientX - last.x, dy = e.clientY - last.y;
            last = { x: e.clientX, y: e.clientY };
            const maxX = pad.clientWidth - 60, maxY = pad.clientHeight - 60;
            pos = { x: Math.max(0, Math.min(maxX, pos.x + dx)), y: Math.max(0, Math.min(maxY, pos.y + dy)) };
            moved.x += dx; moved.y += dy;
            place();
            const now = performance.now();
            if (now - lastLog > 250) { lastLog = now; addLog(`dragAmount = ${hl(`Offset(${dx.toFixed(1)}, ${dy.toFixed(1)})`)} <span class="muted">→ offset += it</span>`); }
          });
          const endDrag = () => {
            if (!dragging) return;
            dragging = false; puck.classList.remove('cmp-gs-held');
            addLog(`<span class="good">onDragEnd</span> <span class="muted">moved ${Math.round(moved.x)}, ${Math.round(moved.y)}</span>`);
            say(o, `The dot sits at ${hl(`offset = Offset(${Math.round(pos.x)}, ${Math.round(pos.y)})`)}. <span class="muted">Each change was consumed so a parent would not also scroll.</span>`);
          };
          puck.addEventListener('pointerup', endDrag);
          puck.addEventListener('pointercancel', endDrag);
          rippleIn.addEventListener('change', () => {
            ripple = rippleIn.checked;
            say(o, ripple ? `${hl('indication = ripple()')} <span class="muted">// press feedback is back</span>` : `${hl('indication = null')} <span class="muted">// clicks still work, but nothing shows the press</span>`);
          });
          async function demoDouble() {
            if (mode !== 'combined') setMode('combined');
            const r = target.getBoundingClientRect();
            const ev = t => target.dispatchEvent(new PointerEvent(t, { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true }));
            ev('pointerdown'); await sleep(80); ev('pointerup'); await sleep(140); ev('pointerdown'); await sleep(80); ev('pointerup');
          }
          setMode('click');
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            pad,
            h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-gs-ripple' }, rippleIn, 'indication = ripple()'), act('Simulate a double tap', demoDouble)),
            log, o);
        },
        predict: {
          q: 'The card uses <code>Modifier.clickable</code> with <code>indication = null</code>. The user taps it. What happens?',
          options: ['Nothing: no ripple means no click', '<code>onClick</code> runs, but nothing shows the press', 'A default ripple is drawn anyway'],
          a: 1,
          why: 'The indication only draws the press feedback. The click handling and its semantics stay the same.',
        },
      },

      // 13 ─────────────────────────────────────────────
      {
        id: 'effects',
        title: 'Side effects: LaunchedEffect',
        tagline: 'Run a coroutine that follows a key.',
        body: `
<p>A composable can run at any time and many times, so it must not start work directly in its body. To run suspend code tied to the screen, use <code>LaunchedEffect(key) { ... }</code>.</p>
<p>When the effect enters the composition, it launches a coroutine. If a key changes, Compose <em>cancels</em> that coroutine and launches a new one with the new key. A recomposition with the same key leaves it alone. When the composable leaves the screen, the coroutine is cancelled.</p>
<p><code>LaunchedEffect</code> is a composable, so you can’t call it from an <code>onClick</code>. For work started by an event, get a scope with <code>rememberCoroutineScope()</code> and call <code>scope.launch</code>. Its jobs live until the composable leaves. Setup that is not a coroutine, like a listener, belongs in the next lesson, DisposableEffect and SideEffect.</p>`,
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
          { q: 'A splash runs <code>LaunchedEffect(Unit) { delay(3_000); onTimeout() }</code>. The parent passes a new <code>onTimeout</code> after one second. Which lambda runs?', options: ['The new one, because lambdas are read when called', 'Neither: the effect restarts and waits 3 more seconds', 'The first one, unless you read it through <code>rememberUpdatedState(onTimeout)</code>'], a: 2, why: 'The block captured the first lambda. rememberUpdatedState gives the effect the latest one without restarting the timer.' },
        ],
        deeper: [
          {
            title: 'rememberUpdatedState for long effects',
            body: `<p>Some effects should not restart, like a splash screen timeout, so they use a constant key. But the block captured the values from the first composition. If the parent later passes a new <code>onTimeout</code>, the effect still calls the old one.</p>
<p><code>rememberUpdatedState(onTimeout)</code> returns a State that always holds the latest value. Read it inside the effect and you get the current callback without restarting the timer.</p>`,
            code: `@Composable
fun Splash(onTimeout: () -> Unit) {
    val currentOnTimeout by rememberUpdatedState(onTimeout)
    LaunchedEffect(Unit) {
        delay(3_000)
        currentOnTimeout()   // the latest lambda, not the first one
    }
}`,
            visual(el) {
              const MS = 3000;
              let latest = 'goHome', captured = 'goHome', run = 0, live = false;
              const toggle = h('input', { type: 'checkbox', id: 'cmp-ru-on' });
              const fill = h('span', { class: 'cmp-job-fill' });
              const jobState = h('span', { class: 'cmp-job-state' }, 'running');
              const chip = h('span', { class: 'cmp-job' }, fill, h('span', { class: 'cmp-job-label' }, 'delay(3_000)'), jobState);
              const capEl = h('span', { class: 'cmp-obj' });
              const latEl = h('span', { class: 'cmp-obj' });
              const head = h('div', { class: 'kt' });
              const o = out();
              const paint = () => {
                capEl.textContent = `captured: ${captured}`;
                latEl.textContent = `latest: ${latest}`;
                head.innerHTML = hl(toggle.checked ? 'val current by rememberUpdatedState(onTimeout)\nLaunchedEffect(Unit) { delay(3_000); current() }' : 'LaunchedEffect(Unit) { delay(3_000); onTimeout() }');
              };
              function start() {
                const me = ++run; live = true; captured = latest;
                chip.classList.remove('cmp-done', 'cmp-cancel'); jobState.textContent = 'running';
                fill.style.transition = 'none'; fill.style.width = '0';
                void fill.offsetWidth;
                fill.style.transition = `width ${MS}ms linear`; fill.style.width = '100%';
                paint();
                say(o, `Splash entered the composition. The effect captured ${hl(`onTimeout = ${captured}`)}. Change it before the timer ends.`);
                setTimeout(() => {
                  if (me !== run || !el.isConnected) return;
                  live = false;
                  chip.classList.add('cmp-done'); jobState.textContent = 'done'; replay(chip, 'pop');
                  const called = toggle.checked ? latest : captured;
                  say(o, called === latest
                    ? `<span class="good">Called ${called}().</span> That is what the parent passed last.`
                    : `<span class="bad">Called ${called}().</span> The parent now passes ${latest}, but the block kept the lambda from the first composition.`);
                }, MS);
              }
              function setLatest(name) {
                if (latest === name) { replay(latEl, 'pop'); return; }
                latest = name; paint(); replay(latEl, 'pop');
                say(o, live
                  ? `Parent recomposed with ${hl(`onTimeout = ${name}`)}. Same key, so the timer keeps going.`
                  : `${hl(`onTimeout = ${name}`)} <span class="muted">// restart Splash to run the timer again</span>`);
              }
              toggle.addEventListener('change', start);
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-ru-on' }, toggle, 'rememberUpdatedState')),
                head,
                h('div', { class: 'cmp-fx' },
                  h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'LaunchedEffect(Unit)'), h('div', { class: 'cmp-jobs' }, chip)),
                  h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'onTimeout'), h('div', { class: 'cmp-jobs' }, capEl, latEl))),
                h('div', { class: 'controls' }, cmd('onTimeout = goLogin', () => setLatest('goLogin')), cmd('onTimeout = goHome', () => setLatest('goHome')), act('Restart Splash', start)),
                o);
              start();
            },
          },
          {
            title: 'produceState: an effect that returns State',
            body: `<p>A common pattern is a LaunchedEffect that loads something into a remembered State. <code>produceState</code> packs that up: it returns a State with an initial value and runs a producer coroutine that sets <code>value</code>. Keys work like LaunchedEffect keys, so a new <code>url</code> cancels the old producer and starts a new one. It is built from <code>remember { mutableStateOf() }</code> and a <code>LaunchedEffect</code>.</p>`,
            code: `@Composable
fun loadNetworkImage(url: String, repo: ImageRepository): State<Result<Image>> =
    produceState<Result<Image>>(initialValue = Result.Loading, url, repo) {
        val image = repo.load(url)
        value = if (image == null) Result.Error else Result.Success(image)
    }`,
          },
        ],
        underHood: {
          body: `<p><code>LaunchedEffect(key) { }</code> is little more than <code>remember(key) { LaunchedEffectImpl(context, block) }</code>. That object implements <code>RememberObserver</code>. After a composition is applied, Compose calls its <code>onRemembered()</code>, which launches your block in a scope built from the composition’s coroutine context, including its frame clock.</p>
<p>When the key changes, <code>remember</code> creates a new object. The old one gets <code>onForgotten()</code> and cancels its job, then the new one launches. <code>DisposableEffect</code> uses the same hooks and calls your <code>onDispose</code> from <code>onForgotten()</code>. Effects never run in the middle of composition. If a composition is abandoned, nothing launches.</p>`,
          code: `// Simplified from androidx.compose.runtime
@Composable
fun LaunchedEffect(key1: Any?, block: suspend CoroutineScope.() -> Unit) {
    val context = currentComposer.applyCoroutineContext
    remember(key1) { LaunchedEffectImpl(context, block) }
}

class LaunchedEffectImpl(
    context: CoroutineContext,
    private val task: suspend CoroutineScope.() -> Unit,
) : RememberObserver {
    private val scope = CoroutineScope(context)
    private var job: Job? = null
    override fun onRemembered() { job = scope.launch(block = task) }
    override fun onForgotten() { job?.cancel(); job = null }
    override fun onAbandoned() { job?.cancel(); job = null }
}`,
        },
        mistakes: [
          {
            title: 'Launching from the composable body',
            bad: `@Composable
fun Feed(vm: FeedViewModel) {
    val scope = rememberCoroutineScope()
    scope.launch { vm.refresh() }   // runs on every recomposition
    FeedList(vm.items)
}`,
            good: `@Composable
fun Feed(vm: FeedViewModel) {
    LaunchedEffect(Unit) { vm.refresh() }   // once per entry
    FeedList(vm.items)
}`,
            why: 'The body runs on every recomposition, so each one starts another refresh. An effect launches once when it enters. Loading that should survive rotation belongs in the ViewModel.',
          },
          {
            title: 'Collecting a Flow without the lifecycle',
            bad: `var messages by remember { mutableStateOf(emptyList<Message>()) }
LaunchedEffect(Unit) {
    vm.messages.collect { messages = it }
}`,
            good: `val messages by vm.messages.collectAsStateWithLifecycle()`,
            why: 'The composition stays alive while the app is in the background, so the effect keeps collecting. <code>collectAsStateWithLifecycle()</code> stops below STARTED and hands you State directly.',
          },
          {
            title: 'A key that is new on every run',
            bad: `class SearchRequest(val query: String, val page: Int)

LaunchedEffect(SearchRequest(query, page)) {
    results = repo.search(query, page)
}`,
            good: `LaunchedEffect(query, page) {
    results = repo.search(query, page)
}`,
            why: 'Keys are compared with <code>equals()</code>. A plain class without it is a new key on every recomposition, so the effect cancels and relaunches each time. Pass the values, or use a <code>data class</code>.',
          },
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
        predict: {
          q: 'A <code>LaunchedEffect</code> load and a <code>scope.launch</code> save are both running. The user leaves the screen. What happens to them?',
          options: ['Both keep running until they finish', 'Both are cancelled', 'Only the LaunchedEffect is cancelled'],
          a: 1,
          why: 'Both belong to the composable. The LaunchedEffect job and the <code>rememberCoroutineScope</code> scope are cancelled when it leaves the composition.',
        },
      },

      // 13a ────────────────────────────────────────────
      {
        id: 'disposable-effect',
        title: 'DisposableEffect and SideEffect',
        tagline: 'Effects that are not coroutines: register and clean up, or publish state after each composition.',
        level: 'intermediate',
        body: `
<p>Some setup is not a coroutine: adding a listener, a lifecycle observer or a sensor callback. <code>DisposableEffect(key) { }</code> runs its block when it enters the composition, and the block must end with <code>onDispose { }</code>. Compose calls <code>onDispose</code> before the effect restarts for a new key, and when the composable leaves.</p>
<p>So whatever the block registers, <code>onDispose</code> unregisters. Register in a <code>LaunchedEffect</code> or in the body instead, and nothing ever unregisters: each restart adds another listener, and they all keep firing and keep the old screen in memory.</p>
<p><code>SideEffect { }</code> is the other non-coroutine effect. It has no keys and no cleanup. It runs after every successful recomposition, and is meant for publishing Compose state to code that Compose doesn't manage.</p>`,
        code: `@Composable
fun ScreenAnalytics(onStart: () -> Unit, onStop: () -> Unit) {
    val lifecycleOwner = LocalLifecycleOwner.current
    val currentOnStart by rememberUpdatedState(onStart)
    val currentOnStop by rememberUpdatedState(onStop)

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_START) currentOnStart()
            else if (event == Lifecycle.Event.ON_STOP) currentOnStop()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }   // undo it
    }
}`,
        remember: 'DisposableEffect: what the block registers, onDispose removes. SideEffect: publish state after each successful composition.',
        terms: [
          { term: 'DisposableEffect', def: 'An effect for setup that needs cleanup. Its block must end with onDispose, which runs before a key restart and when the composable leaves.' },
          { term: 'onDispose', def: 'The cleanup block of a DisposableEffect, where you undo what the effect registered.' },
          { term: 'SideEffect', def: 'An effect that runs after every successful recomposition, used to publish Compose state to non-Compose objects.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Observe the lifecycle of the current owner and stop observing when it changes or the screen leaves.', code: 'val owner = LocalLifecycleOwner.current\n[[DisposableEffect]](owner) {\n    val observer = LifecycleEventObserver { _, e -> log(e) }\n    owner.lifecycle.addObserver(observer)\n    [[onDispose]] { owner.lifecycle.removeObserver(observer) }\n}', why: 'The owner is the key, so a new owner disposes the old observer first. <code>onDispose</code> is the last statement of the block.' },
          { type: 'bug', prompt: 'Open and leave this screen a few times. Every network change now fires several callbacks. Tap the line.', code: '@Composable\nfun OfflineBanner(manager: ConnectivityManager, onOnline: (Boolean) -> Unit) {\n    DisposableEffect(manager) {\n        val callback = bannerCallback(onOnline)\n        manager.registerDefaultNetworkCallback(callback)\n        onDispose { }\n    }\n}', bug: 5, fix: '        onDispose { manager.unregisterNetworkCallback(callback) }', why: 'An empty <code>onDispose</code> compiles, but nothing unregisters. Each visit adds another callback that outlives the screen.' },
        ],
        quiz: [
          { q: 'A <code>DisposableEffect(sensor)</code> is running. <code>sensor</code> changes. What runs, in order?', options: ['The new block only', 'onDispose of the old effect, then the block with the new sensor', 'The block, then onDispose'], a: 1, why: 'A key change disposes the old effect first, then starts the new one.' },
          { q: 'When does <code>SideEffect { }</code> run?', options: ['Once, when it enters the composition', 'After every successful recomposition', 'Only when its key changes'], a: 1, why: 'SideEffect has no keys. It runs each time a composition that contains it is applied.' },
          { q: 'You add a click listener to a classic View from Compose. Which effect?', options: ['<code>LaunchedEffect</code>', '<code>DisposableEffect</code>', '<code>SideEffect</code>'], a: 1, why: 'Registering needs a matching unregister, and only DisposableEffect has a cleanup block.' },
          { q: 'An analytics client must be tagged with the current user type. Which code fits?', options: ['<code>SideEffect { analytics.setUserProperty(...) }</code>', 'Write <code>analytics.setUserProperty(...)</code> straight in the composable body', '<code>DisposableEffect(Unit) { analytics.setUserProperty(...); onDispose { } }</code>'], a: 0, why: 'SideEffect runs only after a composition is applied, so the outside object always matches the screen. A body write can leak a value from a discarded composition.' },
          { q: 'You want a location listener on while the screen is started and off when it stops or leaves. Which is the shortest correct choice?', options: ['<code>LaunchedEffect(Unit) { manager.requestLocationUpdates(l) }</code>', '<code>SideEffect { manager.requestLocationUpdates(l) }</code>', '<code>LifecycleStartEffect(manager) { …; onStopOrDispose { manager.removeUpdates(l) } }</code>'], a: 2, why: 'LifecycleStartEffect runs on ON_START and its onStopOrDispose block runs on ON_STOP or when the composable leaves. The other two never unregister.' },
        ],
        deeper: [
          {
            title: 'SideEffect: publish state after a composition is applied',
            body: `<p>Sometimes an object outside Compose needs the current value, for example an analytics client that tags events with the user type. Writing it in the composable body looks the same, but a composition can be thrown away before it is applied. A write from the body then leaks a value the screen never showed.</p>
<p><code>SideEffect { }</code> runs only after a composition succeeds, so the outside object always matches the screen. Keep it cheap: it runs after every recomposition of that composable.</p>`,
            code: `@Composable
fun rememberAnalytics(user: User): Analytics {
    val analytics = remember { Analytics() }
    SideEffect {
        analytics.setUserProperty("userType", user.userType)
    }
    return analytics
}`,
            visual(el) {
              let inSide = true, screen = 'free', ext = 'free', runs = 0;
              const toggle = h('input', { type: 'checkbox', id: 'cmp-se-on', checked: true });
              const head = h('div', { class: 'kt' });
              const scrEl = h('span', { class: 'cmp-obj' }), extEl = h('span', { class: 'cmp-obj' }), runEl = h('span', { class: 'cmp-badge' }, '0');
              const o = out();
              function paint() {
                head.innerHTML = hl(inSide ? 'SideEffect { analytics.userType = user.type }' : 'analytics.userType = user.type   // in the body');
                scrEl.textContent = `screen: ${screen}`;
                extEl.textContent = `analytics: ${ext}`;
                extEl.className = 'cmp-obj ' + (ext === screen ? 'cmp-reuse' : 'cmp-new');
                runEl.textContent = runs; replay(runEl, 'pop');
              }
              function applied(v) {
                screen = v; ext = v; runs++; paint(); replay(scrEl, 'pop');
                say(o, `Recomposed with ${hl(`user.type = ${v}`)} and applied. ${inSide ? 'SideEffect ran after it.' : 'The body wrote it during composition.'} <span class="good">They match.</span>`);
              }
              function abandoned() {
                if (inSide) {
                  replay(scrEl, 'shake'); paint();
                  say(o, `A composition with ${hl('user.type = trial')} was thrown away. <span class="good">SideEffect never ran</span>, so analytics still says ${ext}.`);
                } else {
                  ext = 'trial'; runs++; paint(); replay(extEl, 'shake');
                  say(o, `A composition with ${hl('user.type = trial')} was thrown away, but <span class="bad">the body already wrote trial</span>. Events are now tagged with a value the screen never showed.`);
                }
              }
              toggle.addEventListener('change', () => { inSide = toggle.checked; screen = 'free'; ext = 'free'; runs = 0; paint(); say(o, inSide ? 'The write is in SideEffect. Reset to free.' : 'The write is in the body. Reset to free.'); });
              paint();
              say(o, 'Recompose a few times, then throw a composition away.');
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-se-on' }, toggle, 'write inside SideEffect')),
                head,
                h('div', { class: 'cmp-fx' },
                  h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'values'), h('div', { class: 'cmp-jobs' }, scrEl, extEl)),
                  h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'writes'), h('div', { class: 'cmp-jobs' }, runEl))),
                h('div', { class: 'controls' }, cmd('user.type = pro  // applied', () => applied('pro')), cmd('user.type = free  // applied', () => applied('free')), act('Throw away a composition', abandoned)),
                o);
            },
          },
          {
            title: 'Lifecycle effects do the observer for you',
            body: `<p>Lifecycle 2.7.0 added effects for the most common DisposableEffect: watching the lifecycle. <code>LifecycleStartEffect</code> runs its block on <code>ON_START</code> and needs an <code>onStopOrDispose</code> block, which runs on <code>ON_STOP</code> or when the composable leaves. <code>LifecycleResumeEffect</code> does the same for resume and pause. For a one-shot action with no cleanup, use <code>LifecycleEventEffect</code>.</p>`,
            code: `LifecycleStartEffect(locationManager) {
    val listener = LocationListener { location -> /* update UI */ }
    locationManager.requestLocationUpdates(listener)
    onStopOrDispose { locationManager.removeUpdates(listener) }
}

LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
    analytics.logView("article_detail")
}`,
          },
          {
            title: 'Pick the effect by the job',
            body: `<p>The question is what the work looks like. Suspend work tied to the screen: <code>LaunchedEffect</code>. Work started by a click: <code>rememberCoroutineScope</code>. Something you register and must unregister: <code>DisposableEffect</code>. A value an outside object should mirror: <code>SideEffect</code>. If a choice feels awkward, the work often belongs in a ViewModel instead.</p>`,
            code: `LaunchedEffect(id) { article = repo.load(id) }          // suspend, follows a key
val scope = rememberCoroutineScope()                      // for onClick
DisposableEffect(view) { view.add(l); onDispose { view.remove(l) } }
SideEffect { player.volume = volume }                     // mirror state outward`,
          },
        ],
        underHood: {
          body: `<p><code>DisposableEffect</code> is built like <code>LaunchedEffect</code>: a remembered object that implements <code>RememberObserver</code>. When the composition is applied, <code>onRemembered()</code> runs your block and keeps the result. When the key changes or the composable leaves, <code>onForgotten()</code> calls the <code>onDispose</code> you returned.</p>
<p>The block's type is <code>DisposableEffectScope.() -&gt; DisposableEffectResult</code>, and only <code>onDispose { }</code> creates that result. That is why it must be the last statement, and why the compiler complains when it is missing. <code>SideEffect</code> skips the remember step: it queues your block to run once the current composition has been applied.</p>`,
          code: `// Simplified from androidx.compose.runtime
@Composable
fun DisposableEffect(key1: Any?, effect: DisposableEffectScope.() -> DisposableEffectResult) {
    remember(key1) { DisposableEffectImpl(effect) }
}`,
        },
        mistakes: [
          {
            title: 'An empty onDispose',
            bad: `DisposableEffect(view) {
    view.viewTreeObserver.addOnGlobalLayoutListener(listener)
    onDispose { }
}`,
            good: `DisposableEffect(view) {
    view.viewTreeObserver.addOnGlobalLayoutListener(listener)
    onDispose { view.viewTreeObserver.removeOnGlobalLayoutListener(listener) }
}`,
            why: 'The docs call an empty onDispose a bad sign. If nothing needs undoing, you likely wanted LaunchedEffect or SideEffect. If something does, undo it here.',
          },
          {
            title: 'Keying on Unit when the object can change',
            bad: `val owner = LocalLifecycleOwner.current
DisposableEffect(Unit) {
    owner.lifecycle.addObserver(observer)
    onDispose { owner.lifecycle.removeObserver(observer) }
}`,
            good: `val owner = LocalLifecycleOwner.current
DisposableEffect(owner) {
    owner.lifecycle.addObserver(observer)
    onDispose { owner.lifecycle.removeObserver(observer) }
}`,
            why: 'With Unit, the effect keeps watching the first owner forever, even after the composable moves to a new one. Key on every object the block registers with.',
          },
          {
            title: 'Real work in SideEffect',
            bad: `SideEffect {
    repo.refresh()     // runs after every recomposition
}`,
            good: `LaunchedEffect(Unit) {
    repo.refresh()     // once per entry, cancelled on leave
}`,
            why: 'SideEffect runs after every successful recomposition, so a refresh there fires again and again. It is for cheap writes that mirror state.',
          },
        ],
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['key', 'DE', 'LE 1', 'LE 2', 'LE 3'],
            span: 10,
            unit: 's',
            predict: {
              q: 'The listener is registered in <code>LaunchedEffect(sensor)</code> with no cleanup. The sensor key changes twice. How many listeners are registered now?',
              options: ['1', '2', '3'],
              a: 2,
              why: 'Each key change cancels the coroutine and starts the block again. Cancelling a coroutine does not unregister a listener, so every restart adds one.',
            },
            frames: [
              { now: 0, say: 'The same screen written two ways. <b>DE</b>: <code>DisposableEffect(sensor)</code> with <code>onDispose</code>. <b>LE 1 to 3</b>: listeners registered by <code>LaunchedEffect(sensor)</code> with no cleanup.' },
              { bars: [{ lane: 0, from: 0, to: 3, label: 'acc', tone: 'muted' }, { lane: 1, from: 0, to: 3, label: 'acc', tone: 'ok' }, { lane: 2, from: 0, to: 3, label: 'acc' }], say: 'The screen enters the composition. Both versions register one accelerometer listener.' },
              { bars: [{ lane: 0, from: 3, to: 6, label: 'gyro', tone: 'muted' }, { lane: 1, from: 3, to: 6, label: 'gyro', tone: 'ok' }, { lane: 2, from: 3, to: 6, label: 'leak', tone: 'err' }, { lane: 3, from: 3, to: 6, label: 'gyro' }], marks: [{ at: 3, label: 'key', tone: 'muted' }], say: 'The key changes. <code>onDispose</code> unregisters the old listener first, then the block registers the new one. The LaunchedEffect only adds: the old listener stays.' },
              { bars: [{ lane: 0, from: 6, to: 8, label: 'acc', tone: 'muted' }, { lane: 1, from: 6, to: 8, label: 'acc', tone: 'ok' }, { lane: 2, from: 6, to: 8, label: 'leak', tone: 'err' }, { lane: 3, from: 6, to: 8, label: 'leak', tone: 'err' }, { lane: 4, from: 6, to: 8, label: 'acc' }], marks: [{ at: 6, label: 'key', tone: 'muted' }], say: 'Back to the accelerometer. Still one listener on the left. Three on the right, all firing for every event.' },
              { bars: [{ lane: 2, from: 8, to: 10, label: 'leak', tone: 'err' }, { lane: 3, from: 8, to: 10, label: 'leak', tone: 'err' }, { lane: 4, from: 8, to: 10, label: 'leak', tone: 'err' }], marks: [{ at: 8, label: 'leave', tone: 'err' }], say: 'The screen leaves the composition. <code>onDispose</code> runs one last time: nothing is registered. The three other listeners live on and keep the old screen in memory.' },
            ],
          });
        },
      },

      // 13b ────────────────────────────────────────────
      {
        id: 'snapshot-flow',
        title: 'snapshotFlow: from State to Flow',
        tagline: 'React to State changes with Flow operators, without restarting the effect.',
        level: 'intermediate',
        body: `
<p>Keying a <code>LaunchedEffect</code> on a value that changes all the time, like the scroll position, cancels and relaunches the coroutine on every change. Often you want one long collector instead. <code>snapshotFlow { }</code> turns Compose State into a cold <code>Flow</code>.</p>
<p>When collected, it runs the block, records which State objects it read, and emits the result. When one of them changes, it runs the block again and emits only if the result is different from the last one, like <code>distinctUntilChanged()</code>. From there you have every Flow operator: <code>map</code>, <code>filter</code>, <code>debounce</code>.</p>
<p>Collect it inside a <code>LaunchedEffect</code> keyed on the state holder, such as the <code>LazyListState</code>, so the collector starts once and lives with the screen. It works in a ViewModel too, for state the ViewModel owns.</p>`,
        code: `val listState = rememberLazyListState()

LaunchedEffect(listState) {
    snapshotFlow { listState.firstVisibleItemIndex }
        .map { index -> index > 0 }
        .distinctUntilChanged()
        .filter { it }
        .collect { analytics.log("scrolled_past_first") }
}

LazyColumn(state = listState) { /* ... */ }`,
        remember: 'snapshotFlow re-runs its block when a State it read changes, and emits only new values. One collector, no restarts.',
        terms: [
          { term: 'snapshotFlow', def: 'A function that turns the State objects read in its block into a cold Flow that emits when the result changes.' },
          { term: 'Conflation', def: 'Keeping only the latest value when several changes happen before the collector looks, so intermediate values can be skipped.' },
          { term: 'distinctUntilChanged', def: 'A Flow operator that drops a value equal to the one just emitted. snapshotFlow already behaves this way for its block.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the scroll-to-top button only once the user has scrolled, with one long collector.', code: 'LaunchedEffect(listState) {\n    [[snapshotFlow]] { listState.[[firstVisibleItemIndex]] }\n        .map { it > 0 }\n        .[[distinctUntilChanged]]()\n        .collect { showTop = it }\n}', why: 'The block reads State, so it re-runs on scroll. After <code>map</code> many indexes give the same Boolean, so <code>distinctUntilChanged</code> passes only the flips.' },
          { type: 'bug', prompt: 'This crashes with IllegalStateException as soon as it is collected. Tap the line.', code: 'var lastSeen by mutableStateOf(0)\n\nLaunchedEffect(listState) {\n    snapshotFlow { lastSeen = listState.firstVisibleItemIndex; lastSeen }\n        .collect { analytics.log("seen", it) }\n}', bug: 3, fix: '    snapshotFlow { listState.firstVisibleItemIndex }', why: 'The block runs in a read-only snapshot and must not write State. Read in the block, and do writes in <code>collect</code>.' },
        ],
        quiz: [
          { q: 'The block reads <code>count</code>. <code>count</code> goes 3 → 3. Does snapshotFlow emit?', options: ['Yes, every write emits', 'No, the result is equal to the last one'], a: 1, why: 'It emits only when the result differs from the previous one.' },
          { q: 'Why prefer snapshotFlow over <code>LaunchedEffect(listState.firstVisibleItemIndex)</code>?', options: ['It is the only way to read the index', 'The keyed effect cancels and relaunches on every scroll step', 'LaunchedEffect cannot read State'], a: 1, why: 'A fast-changing key restarts the coroutine constantly. snapshotFlow keeps one collector running.' },
          { q: '<code>count</code> is set to 1, 2, 3 in one click handler. A collector of <code>snapshotFlow { count }</code> is guaranteed to see', options: ['1, 2 and 3', 'At least the latest value, 3, but maybe not 1 and 2', 'Nothing'], a: 1, why: 'snapshotFlow is for state, not events. Changes made before the collector looks can be conflated to the latest value.' },
          { q: '<code>class Paging { var page = 0 }</code>. You collect <code>snapshotFlow { paging.page }</code> and later set <code>paging.page = 2</code>. What does the collector see?', options: ['2, on the next frame', 'An <code>IllegalStateException</code>', 'Only the first value, 0: a plain var is not snapshot State, so changes are not tracked'], a: 2, why: 'snapshotFlow only tracks snapshot State objects read in the block. A plain field can be read, but changing it never triggers an emission.' },
        ],
        deeper: [
          {
            title: 'State, not events: values can be skipped',
            body: `<p>snapshotFlow is conflated. It reacts when changes are applied, and the docs say the block may skip intermediate changes. Several writes in one click handler show up as one emission with the last value. Writes spread over separate frames usually show up one by one.</p>
<p>So use it for "what is the value now", never for "count every click". For events, call a function or send them through a Channel or a SharedFlow.</p>`,
            code: `var count by mutableIntStateOf(0)

Button(onClick = { count++; count++; count++ }) { Text("+3") }

LaunchedEffect(Unit) {
    snapshotFlow { count }.collect { println("count = $it") }
}
// one tap usually prints one line with the latest value, not three`,
            visual(el) {
              let count = 0;
              const log = h('div', { class: 'cmp-gs-log', 'aria-live': 'polite' });
              const val = h('span', { class: 'cmp-obj' });
              const o = out();
              const paint = () => { val.textContent = `count = ${count}`; };
              function emit(v) { log.prepend(h('div', { class: 'drop-in', html: hl(`collect: count = ${v}`) })); while (log.children.length > 6) log.lastElementChild.remove(); }
              async function sameFrame() {
                const from = count; count += 3; paint(); replay(val, 'pop');
                say(o, `${hl('count++; count++; count++')} in one handler: ${from + 1}, ${from + 2}, ${from + 3}. <span class="muted">The collector looks once.</span>`);
                await sleep(300); if (!el.isConnected) return;
                emit(count);
              }
              async function frames() {
                say(o, 'Three writes, one per frame. The collector catches up between them.');
                for (let i = 0; i < 3; i++) {
                  count++; paint(); replay(val, 'pop');
                  await sleep(260); if (!el.isConnected) return;
                  emit(count);
                }
              }
              function same() {
                replay(val, 'pop');
                say(o, `${hl(`count = ${count}`)} <span class="muted">// same value: the block re-runs, nothing is emitted</span>`);
              }
              paint(); emit(0);
              say(o, 'The first value is emitted as soon as collection starts.');
              el.append(val, h('div', { class: 'controls' }, cmd('count += 3 in one handler', sameFrame), cmd('count++ in three frames', frames), cmd('count = count', same)), log, o);
            },
          },
          {
            title: 'The block only reads',
            body: `<p>The block runs in a read-only snapshot. Writing State inside it fails with <code>IllegalStateException</code>. Keep the block a plain read with no side effects, because it can run more than once for the same inputs. Do writes and other work in <code>collect</code>.</p>
<p>Only snapshot State is tracked. A plain <code>var</code> or a field of a normal class can be read in the block, but changing it never makes the flow emit.</p>`,
            code: `// Good: read in the block, act in collect
snapshotFlow { listState.isScrollInProgress }
    .collect { scrolling -> player.dimControls(scrolling) }

// Never re-emits: page is not snapshot State
class Paging { var page = 0 }
snapshotFlow { paging.page }`,
          },
          {
            title: 'From a ViewModel',
            body: `<p>snapshotFlow is not tied to composition. A ViewModel that keeps its input in <code>mutableStateOf</code>, or a <code>TextFieldState</code>, can turn it into a Flow, add <code>debounce</code>, and expose results with <code>stateIn</code>.</p>`,
            code: `class SearchViewModel(private val repo: SearchRepository) : ViewModel() {
    val query = TextFieldState()

    @OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
    val results = snapshotFlow { query.text.toString() }
        .debounce(300)
        .mapLatest { repo.search(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}`,
          },
        ],
        underHood: {
          body: `<p>Compose State lives in snapshots. When snapshotFlow is collected, it runs the block in a read-only snapshot with a read observer, so it learns exactly which State objects the block touched. It also registers to hear when other snapshots are applied.</p>
<p>When an applied change touches one of the recorded objects, the block runs again, the read set is recorded again, and the new result is compared with the last one. Changes to objects the block didn't read are ignored. This is the same tracking that decides which composables recompose.</p>`,
          code: `// The idea, simplified
val reads = mutableSetOf<Any>()
var last = Snapshot.takeSnapshot { reads += it }.run { enter(block) }
emit(last)
// on every applied change that touches something in reads:
//     reads.clear(); val next = run block again; if (next != last) emit(next)`,
        },
        mistakes: [
          {
            title: 'Keying an effect on a fast-changing value',
            bad: `LaunchedEffect(listState.firstVisibleItemIndex) {
    if (listState.firstVisibleItemIndex > 0) analytics.log("scrolled")
}`,
            good: `LaunchedEffect(listState) {
    snapshotFlow { listState.firstVisibleItemIndex > 0 }
        .filter { it }
        .collect { analytics.log("scrolled") }
}`,
            why: 'The keyed version relaunches on every scroll step and logs again and again. The snapshotFlow version starts once and logs only when the Boolean becomes true.',
          },
          {
            title: 'Counting events with snapshotFlow',
            bad: `snapshotFlow { tapCount }.collect { sendTapToServer() }`,
            good: `Button(onClick = { viewModel.onTap() }) { Text("Like") }`,
            why: 'Several taps before the collector looks become one emission. Events should go through a callback, a Channel or a SharedFlow.',
          },
        ],
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['index', 'keyed', 'flow'],
            span: 10,
            unit: 's',
            predict: {
              q: 'The user flings through several items. With <code>LaunchedEffect(listState.firstVisibleItemIndex)</code>, how many coroutines get launched?',
              options: ['One for the whole screen', 'One for every index change', 'None until the fling stops'],
              a: 1,
              why: 'The key changes on every new index, and each change cancels the running coroutine and launches a new one.',
            },
            frames: [
              { now: 0, say: 'Goal: log “scrolled” once when the user leaves the top. Lane 1: <code>firstVisibleItemIndex</code>. Lane 2: <code>LaunchedEffect(index)</code>, keyed on it. Lane 3: one <code>snapshotFlow</code> collector.' },
              { bars: [{ lane: 0, from: 0, to: 2, label: '0', tone: 'muted' }, { lane: 1, from: 0, to: 2, label: '#1' }, { lane: 2, from: 0, to: 2, label: 'collect', tone: 'ok' }], say: 'Both start with the screen. The keyed effect runs coroutine #1. The other one starts a single <code>snapshotFlow</code> collector.' },
              { bars: [{ lane: 0, from: 2, to: 4, label: '1', tone: 'muted' }, { lane: 1, from: 2, to: 4, label: '#2', tone: 'warm' }, { lane: 2, from: 2, to: 4, label: 'log', tone: 'ok' }], marks: [{ at: 2, label: 'index 1', tone: 'muted' }], say: 'Index becomes 1. The keyed effect cancels #1 and launches #2, which logs. The flow maps 1 to <code>true</code>, emits, and logs once.' },
              { bars: [{ lane: 0, from: 4, to: 6, label: '2', tone: 'muted' }, { lane: 1, from: 4, to: 6, label: '#3', tone: 'warm' }, { lane: 2, from: 4, to: 6, label: 'collect', tone: 'ok' }], say: 'Index 2. The keyed effect restarts and logs again. The flow maps to <code>true</code> again, and <code>distinctUntilChanged</code> drops it.' },
              { bars: [{ lane: 0, from: 6, to: 10, label: '3 4 5 6', tone: 'muted' }, { lane: 1, from: 6, to: 7, label: '#4', tone: 'warm' }, { lane: 1, from: 7, to: 8, label: '#5', tone: 'warm' }, { lane: 1, from: 8, to: 9, label: '#6', tone: 'warm' }, { lane: 1, from: 9, to: 10, label: '#7', tone: 'warm' }, { lane: 2, from: 6, to: 10, label: 'collect', tone: 'ok' }], say: 'A fling changes the index four more times: four more launches and four more log events. The collector just keeps running.' },
              { now: 10, say: 'Keyed effect: 7 launches and 6 “scrolled” events. <code>snapshotFlow</code>: 1 collector and 1 event, which is what you wanted.' },
            ],
          });
        },
      },
    ],
  });
})();
