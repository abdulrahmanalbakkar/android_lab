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

      // 9 ─────────────────────────────────────────────
      {
        id: 'text-input',
        title: 'Text input',
        tagline: 'The field shows your state and reports every edit.',
        body: `
<p><code>TextField</code> and <code>OutlinedTextField</code> are the Material 3 inputs. In the classic form you pass <code>value</code> and <code>onValueChange</code>. The field never changes its own text. It reports each edit, and you write the new text into state. Ignore the callback and typing does nothing.</p>
<p><code>keyboardOptions</code> tells the soft keyboard what to show. <code>KeyboardType.Email</code> adds an @ key, <code>KeyboardType.Number</code> shows digits, and <code>imeAction</code> picks the action key, such as Next or Done. <code>keyboardActions</code> says what that key does. By default, Next moves focus to the next field. The keyboard type does not filter input, so validate the text yourself.</p>
<p>Show errors with <code>isError</code> and explain them in <code>supportingText</code>. Wait until the user has typed something before you complain. Material 3 also has a newer overload that takes a <code>TextFieldState</code> in place of value and callback.</p>`,
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
      },

      // 13 ─────────────────────────────────────────────
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
            title: 'DisposableEffect: undo what you register',
            body: `<p>Some setup is not a coroutine: adding a listener, a lifecycle observer or a sensor callback. <code>DisposableEffect(key)</code> runs its block when it enters and must end with <code>onDispose { }</code>. Compose calls <code>onDispose</code> before the effect restarts for a new key, and when the composable leaves.</p>
<p>Register in a <code>LaunchedEffect</code> or <code>SideEffect</code> instead and nothing ever unregisters. Each restart adds another listener. They all keep firing and keep the old screen in memory.</p>`,
            code: `@Composable
fun TiltSensor(sensorManager: SensorManager, sensor: Sensor, onTilt: (Float) -> Unit) {
    val currentOnTilt by rememberUpdatedState(onTilt)
    DisposableEffect(sensor) {
        val listener = object : SensorEventListener {
            override fun onSensorChanged(e: SensorEvent) = currentOnTilt(e.values[0])
            override fun onAccuracyChanged(s: Sensor, accuracy: Int) = Unit
        }
        sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_UI)
        onDispose { sensorManager.unregisterListener(listener) }
    }
}`,
            visual(el) {
              let good = false, sensor = 'Accelerometer', onScreen = true, n = 0, listeners = [];
              const toggle = h('input', { type: 'checkbox', id: 'cmp-de-on' });
              const pool = h('div', { class: 'cmp-jobs cmp-de-pool' });
              const head = h('div', { class: 'kt' });
              const count = h('span', { class: 'cmp-badge' }, '0');
              const leaveBtn = act('Leave the screen', () => leave());
              const o = out();
              const paintHead = () => { head.innerHTML = hl(good ? 'DisposableEffect(sensor) {\n    register(listener)\n    onDispose { unregister(listener) }\n}' : 'LaunchedEffect(sensor) {\n    register(listener)   // no cleanup\n}'); };
              function paint() {
                pool.replaceChildren(...(listeners.length ? listeners.map(l => l.chip) : [h('span', { class: 'cmp-status' }, 'no listeners')]));
                count.textContent = listeners.length; replay(count, 'pop');
              }
              function register() {
                const chip = h('span', { class: 'cmp-job cmp-done drop-in' }, h('span', { class: 'cmp-job-label' }, `#${++n} ${sensor}`), h('span', { class: 'cmp-job-state' }, onScreen ? 'live' : ''));
                listeners.push({ n, sensor, chip });
              }
              function dispose() {
                listeners.forEach(l => { l.chip.classList.add('fly-out'); });
                const gone = listeners.length; listeners = [];
                return gone;
              }
              function markLeaks() {
                listeners.forEach((l, i) => { if (i < listeners.length - 1 || !onScreen) { l.chip.classList.remove('cmp-done'); l.chip.classList.add('cmp-cancel'); l.chip.lastChild.textContent = 'leaked'; } });
              }
              async function setSensor(s) {
                if (!onScreen) { replay(pool, 'shake'); say(o, 'The screen is gone. Come back first.'); return; }
                if (s === sensor) { say(o, `${hl(`sensor = ${s}`)} <span class="muted">// same key: nothing restarts</span>`); return; }
                if (listeners.length >= 6) { replay(pool, 'shake'); say(o, '<span class="bad">Six live listeners.</span> Reset by flipping the switch.'); return; }
                sensor = s;
                const removed = good ? dispose() : 0;
                if (removed) await sleep(380);
                if (!el.isConnected) return;
                register(); if (!good) markLeaks(); paint();
                say(o, good ? `Key changed. <span class="good">onDispose removed the old listener</span>, then the effect added one for ${s}.` : `Key changed. A new listener for ${s} was added. <span class="bad">The old one is still registered.</span>`);
              }
              async function leave() {
                if (onScreen) {
                  onScreen = false; leaveBtn.textContent = 'Come back';
                  if (good) { dispose(); await sleep(380); if (!el.isConnected) return; } else markLeaks();
                  paint();
                  say(o, good ? '<span class="good">Left the composition. onDispose ran.</span> Nothing is registered.' : `<span class="bad">Left the composition. ${listeners.length} listener${listeners.length === 1 ? '' : 's'} still registered</span>, holding the old screen.`);
                } else {
                  onScreen = true; leaveBtn.textContent = 'Leave the screen';
                  register(); if (!good) markLeaks(); paint();
                  say(o, 'Back on screen. The effect registered a listener again.');
                }
              }
              function shake() {
                if (!listeners.length) { replay(pool, 'shake'); say(o, 'Phone moved. No listener heard it.'); return; }
                listeners.forEach(l => replay(l.chip, 'pop'));
                say(o, `Phone moved: <span class="${listeners.length > 1 ? 'bad' : 'good'}">${listeners.length} callback${listeners.length === 1 ? '' : 's'}</span> for one event.`);
              }
              function reset() {
                good = toggle.checked; sensor = 'Accelerometer'; onScreen = true; listeners = []; leaveBtn.textContent = 'Leave the screen';
                paintHead(); register(); paint();
                say(o, good ? 'DisposableEffect registered one listener.' : 'LaunchedEffect registered one listener. Now change the key a few times.');
              }
              toggle.addEventListener('change', reset);
              el.append(
                h('div', { class: 'controls' }, h('label', { class: 'switch', for: 'cmp-de-on' }, toggle, 'DisposableEffect with onDispose')),
                head,
                h('div', { class: 'cmp-fx' }, h('div', { class: 'cmp-fx-lane' }, h('span', { class: 'cmp-fx-name' }, 'registered listeners'), h('div', { class: 'cmp-jobs' }, count, pool))),
                h('div', { class: 'controls' }, cmd('sensor = Gyroscope', () => setSensor('Gyroscope')), cmd('sensor = Accelerometer', () => setSensor('Accelerometer')), leaveBtn, act('Move the phone', shake)),
                o);
              reset();
            },
          },
          {
            title: 'snapshotFlow: turn State into a Flow',
            body: `<p>To react to State changes inside an effect, wrap the read in <code>snapshotFlow { }</code>. It emits each time the State it read changes, and you get every Flow operator. The effect itself keeps running, so nothing is cancelled or relaunched.</p>`,
            code: `LaunchedEffect(listState) {
    snapshotFlow { listState.firstVisibleItemIndex }
        .map { it > 0 }
        .distinctUntilChanged()
        .collect { scrolled -> analytics.log("scrolled", scrolled) }
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
      },
    ],
  });
})();
