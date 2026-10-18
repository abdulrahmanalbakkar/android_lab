/* Android fundamentals track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed and- . */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const line = (el, html) => el.append(h('div', { class: 'line drop-in', html }));
  const note = text => `<span class="muted">// ${text}</span>`;
  const addr = () => '@' + (0x1000 + Math.floor(Math.random() * 0xefff)).toString(16);

  // A small phone used by several demos. view holds the current screen; dim is the "paused" overlay.
  function device(extra = '') {
    const view = h('div', { class: 'and-viewport' });
    const dim = h('div', { class: 'and-dim' });
    const dev = h('div', { class: 'and-dev ' + extra, role: 'img', 'aria-label': 'Phone screen' }, view, dim);
    return { dev, view, dim };
  }
  const appbar = text => h('div', { class: 'and-appbar' }, text);
  const bars = (...w) => w.map(x => h('span', { class: 'and-ln', style: `width:${x}%` }));
  const homeScreen = () => h('div', { class: 'and-home drop-in' }, Array.from({ length: 9 }, (_, i) => h('span', { class: i === 4 ? 'and-ico and-me' : 'and-ico' })));
  async function rotate(dev) {
    const toLand = !dev.classList.contains('and-land');
    dev.classList.add(toLand ? 'and-to-land' : 'and-to-port');
    await sleep(470);
    dev.classList.remove('and-to-land', 'and-to-port');
    dev.classList.toggle('and-land', toLand);
  }

  const css = `
.viz.and-viz { grid-template-columns: minmax(0, 1fr); }
.and-viz .cmd { min-width: 0; }
.and-hold { width: 264px; height: 264px; display: grid; place-items: center; flex: none; max-width: 100%; }
.and-dev { position: relative; flex: none; width: 160px; height: 250px; border-radius: 24px; border: 7px solid var(--code-bg); box-shadow: 0 0 0 1px var(--line); background: var(--surface); overflow: hidden; display: flex; flex-direction: column; }
.and-dev.and-land { width: 250px; height: 160px; }
.and-dev.and-tall { width: 180px; height: 290px; }
.and-dev.and-to-land { animation: and-to-land 0.46s ease-in-out forwards; }
.and-dev.and-to-port { animation: and-to-port 0.46s ease-in-out forwards; }
@keyframes and-to-land { to { transform: rotate(-90deg); } }
@keyframes and-to-port { to { transform: rotate(90deg); } }
.and-viewport { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.and-scr { flex: 1; display: flex; flex-direction: column; gap: 7px; padding: 9px; min-height: 0; font-size: 0.8rem; }
.and-appbar { font: 600 0.68rem var(--mono); background: var(--accent); color: var(--accent-ink); padding: 6px 8px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: none; }
.and-ln { display: block; height: 8px; border-radius: 4px; background: var(--sunk); flex: none; }
.and-home { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, 28px); justify-content: center; align-content: center; gap: 12px; padding: 12px; }
.and-ico { width: 28px; height: 28px; border-radius: 9px; background: var(--sunk); }
.and-ico.and-me { background: var(--accent); }
.and-dim { position: absolute; inset: 0; background: var(--ink); opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.and-dim.and-on { opacity: 0.28; }
.and-lbl { font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); }

/* lifecycle */
.and-states { display: grid; flex: 0 1 240px; min-width: 0; }
.and-states .and-lbl { text-align: center; margin-bottom: 6px; }
.and-st { font: 600 0.8rem var(--mono); text-align: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.25s, color 0.25s, border-color 0.25s; }
.and-st.and-on { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }
.and-st .and-cb { display: block; font-size: 0.68rem; }
.and-edge { display: flex; justify-content: space-between; gap: 8px; padding: 4px 6px; }
.and-cb { font: 500 0.72rem var(--mono); color: var(--muted); transition: color 0.2s; }
.and-cb.and-lit { color: var(--warm); font-weight: 700; }
.and-st.and-on .and-cb { color: var(--accent-ink); opacity: 0.75; }
.and-st.and-on .and-cb.and-lit { color: var(--accent-ink); text-decoration: underline; }

/* ViewModel */
.and-store { border: 2px dashed var(--line); border-radius: 14px; padding: 12px; display: grid; gap: 8px; justify-items: center; background: var(--surface); min-width: min(200px, 100%); }
.and-kv { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px; font: 500 0.66rem var(--mono); }
.and-v { font: 700 0.85rem var(--mono); min-width: 28px; text-align: center; padding: 2px 6px; border-radius: 6px; background: var(--sunk); color: var(--ink); }
.and-v.and-vm { background: var(--accent-soft); color: var(--accent); }
.and-user { font: 500 0.74rem var(--mono); color: var(--muted); }
.and-empty { font: 500 0.82rem var(--mono); color: var(--muted); padding: 22px 8px; }

/* saved state matrix */
.and-proc { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.and-pid { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--ok-soft); color: var(--ok); }
.and-pid.and-dead { background: var(--err-soft); color: var(--err); text-decoration: line-through; }
.and-mx { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(44px, 0.6fr) minmax(0, 1fr) minmax(0, 1fr); gap: 6px; }
.and-mx > div { padding: 8px; border-radius: 8px; background: var(--bg); border: 1px solid var(--line); font: 500 0.8rem var(--mono); display: flex; align-items: center; justify-content: center; gap: 6px; min-width: 0; overflow-wrap: anywhere; transition: background 0.25s, border-color 0.25s, color 0.25s; }
.and-mx > .and-hd { background: none; border-color: transparent; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); text-align: center; overflow-wrap: normal; }
@media (max-width: 520px) { .and-mx { gap: 4px; } .and-mx > div { padding: 6px 5px; font-size: 0.72rem; } .and-mx > .and-hd { font-size: 0.6rem; letter-spacing: 0; } }
.and-mx > .and-hd.and-on { color: var(--accent); border-color: var(--accent); }
.and-mx > .and-who { flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; }
.and-who b { font-weight: 600; color: var(--ink); }
.and-who small { font: 400 0.72rem var(--body); color: var(--muted); }
.and-mx > .and-val { font-size: 1rem; font-weight: 700; }
.and-mx > .and-kept { background: var(--ok-soft); border-color: var(--ok); color: var(--ok); }
.and-mx > .and-lost { background: var(--err-soft); border-color: var(--err); color: var(--err); }
.and-mx > .and-q { color: var(--muted); border-style: dashed; }

/* intents */
.and-sys { position: relative; display: grid; gap: 12px; padding: 14px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; overflow: hidden; }
.and-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.and-tile { padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); display: grid; gap: 2px; font-weight: 700; font-size: 0.88rem; line-height: 1.25; min-width: 0; transition: border-color 0.2s, opacity 0.2s, background 0.2s; }
.and-tile small { font: 500 0.68rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.and-tile.and-scan { border-color: var(--warm); }
.and-tile.and-match { border-color: var(--ok); background: var(--ok-soft); }
.and-tile.and-miss { opacity: 0.4; }
.and-tile.and-open { border-color: var(--accent); background: var(--accent-soft); }
.and-resolver { font: 600 0.78rem var(--mono); text-align: center; padding: 8px 10px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); border: 2px solid transparent; transition: border-color 0.2s; }
.and-resolver.and-on { border-color: var(--warm); }
.and-apps { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; }
.and-env { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); z-index: 2; padding: 4px 9px; border-radius: 6px; background: var(--warm); color: var(--accent-ink); font: 700 0.7rem var(--mono); white-space: nowrap; pointer-events: none; transition: left 0.55s cubic-bezier(0.5, 0, 0.3, 1), top 0.55s cubic-bezier(0.5, 0, 0.3, 1), opacity 0.3s; }
.and-env.and-notr { transition: none; }
.and-sheet { position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 3; background: var(--surface); border: 2px solid var(--accent); border-radius: 14px; padding: 12px; display: grid; gap: 8px; }
.and-sheet[hidden] { display: none; }

/* back stack */
.and-nav { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: center; }
.and-stackbox { display: grid; gap: 6px; flex: 0 1 220px; min-width: 0; }
.and-stack { display: flex; flex-direction: column-reverse; gap: 6px; min-height: 120px; justify-content: flex-start; }
.and-card { padding: 8px 12px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 600 0.84rem var(--mono); display: flex; justify-content: space-between; align-items: center; gap: 8px; min-width: 0; }
.and-card small { font: 500 0.66rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.and-card.and-top { border-color: var(--accent); background: var(--accent-soft); }
.and-big { font: 700 1.05rem var(--display); }

/* permissions */
.and-ui { font: 700 0.74rem var(--body); padding: 7px 10px; border-radius: 8px; border: none; background: var(--accent); color: var(--accent-ink); cursor: pointer; text-align: center; }
.and-ui.and-ghost { background: var(--sunk); color: var(--ink); }
.and-ui:hover { filter: brightness(1.08); }
.and-dlg { position: absolute; left: 6px; right: 6px; bottom: 6px; z-index: 2; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 10px; display: grid; gap: 6px; font-size: 0.74rem; line-height: 1.35; }
.and-dlg b { font-size: 0.78rem; }
.and-cam { flex: 1; border-radius: 10px; background: var(--code-bg); display: grid; place-items: center; position: relative; color: var(--t-c); font: 500 0.72rem var(--mono); }
.and-cam::before { content: ""; position: absolute; inset: 18px; border: 2px dashed var(--t-s); border-radius: 8px; }
.and-steps { display: grid; gap: 6px; flex: 1 1 240px; max-width: 330px; min-width: 0; }
.and-step { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font: 500 0.74rem var(--mono); transition: background 0.25s, border-color 0.25s, opacity 0.25s; }
.and-step > span:first-child { min-width: 0; overflow-wrap: anywhere; }
.and-step.and-on { border-color: var(--accent); background: var(--accent-soft); }
.and-step.and-skip { opacity: 0.4; }
.and-res { font-weight: 700; flex: none; }
.and-res.and-ok { color: var(--ok); }
.and-res.and-no { color: var(--err); }
.and-perm { font: 600 0.78rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--muted); text-align: center; }
.and-perm.and-ok { background: var(--ok-soft); color: var(--ok); }
.and-perm.and-no { background: var(--err-soft); color: var(--err); }
.and-col { display: grid; gap: 10px; justify-items: center; }

/* depth: let long code scroll inside step and hood grids instead of widening the page (shell-level fix, harmless if duplicated) */

/* depth: saved state */
.and-field { font: 600 0.8rem var(--mono); padding: 6px 8px; border-radius: 8px; border: 2px solid var(--accent); background: var(--bg); color: var(--ink); min-height: 1.9em; overflow-wrap: anywhere; }
.and-field.and-blank { border-color: var(--line); color: var(--muted); font-weight: 500; }
.and-bundle { display: grid; gap: 6px; flex: 0 1 220px; min-width: 0; }
.and-bundle .obj { min-width: 0; transition: border-color 0.25s, opacity 0.25s; }
.and-bundle .obj.and-gone { opacity: 0.4; border-style: dashed; border-color: var(--err); }
.and-ways { display: grid; gap: 6px; min-width: 0; }
.and-way { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font: 500 0.8rem var(--mono); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.and-way > .cmd { justify-self: start; text-align: left; }
.and-way.and-on { border-color: var(--accent); background: var(--accent-soft); }
.and-way small { grid-column: 1 / -1; font: 400 0.78rem var(--body); color: var(--muted); }

/* depth: permissions */
.and-tog { display: flex; gap: 4px; }
.and-tog .and-ui { flex: 1; font-size: 0.66rem; padding: 5px 4px; }
.and-tog .and-ui[aria-pressed="false"] { background: var(--sunk); color: var(--muted); }
.and-map { display: grid; gap: 4px; justify-items: stretch; min-width: 0; max-width: 100%; }
.and-sort { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.and-bin { display: grid; gap: 6px; align-content: start; padding: 8px; min-height: 92px; border-radius: 12px; border: 2px dashed var(--line); background: var(--bg); min-width: 0; }
.and-bin > .cmd { justify-content: center; text-align: center; white-space: normal; }
.and-bin .and-tile { font-size: 0.78rem; }
.and-tasks { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.and-tasks .cmd { white-space: normal; text-align: left; }

/* depth pass 2 */
.and-d2-col { display: grid; gap: 6px; flex: 0 1 220px; min-width: 0; align-content: start; justify-items: stretch; }
.and-d2-col .and-perm, .and-d2-col .and-user { overflow-wrap: anywhere; }
.and-d2-obs { display: grid; gap: 6px; flex: 0 1 240px; min-width: 0; align-content: start; }
.and-d2-obs .obj { min-width: 0; }
.and-d2-evs { display: flex; flex-wrap: wrap; gap: 4px; min-height: 1.6em; }
.and-d2-ev { font: 600 0.7rem var(--mono); padding: 2px 6px; border-radius: 6px; background: var(--accent-soft); color: var(--accent); }
.and-perm.and-d2-mid { background: var(--warm-soft); color: var(--warm); }
.and-d2-mw { position: relative; flex: none; width: 170px; height: 260px; max-width: 100%; border-radius: 22px; border: 7px solid var(--code-bg); box-shadow: 0 0 0 1px var(--line); background: var(--surface); overflow: hidden; display: flex; flex-direction: column; gap: 4px; }
.and-d2-vid { position: relative; flex: 1; min-height: 0; background: var(--code-bg); color: var(--code-ink); display: grid; place-items: center; align-content: center; gap: 2px; font: 600 0.72rem var(--mono); }
.and-d2-time { font-size: 0.95rem; }
.and-d2-vlbl { color: var(--t-k); }
.and-d2-vid.and-d2-frozen .and-d2-vlbl { color: var(--t-e); }
.and-d2-track { position: absolute; left: 8px; right: 8px; bottom: 8px; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, 0.18); overflow: hidden; }
.and-d2-prog { display: block; height: 100%; width: 0; background: var(--accent); }
.and-d2-notes { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 7px; padding: 9px; font-size: 0.8rem; }
.and-d2-pip .and-d2-vid { position: absolute; right: 8px; bottom: 8px; width: 48%; height: 28%; border-radius: 8px; box-shadow: 0 0 0 2px var(--accent); z-index: 1; }
.and-d2-focus { outline: 3px solid var(--accent); outline-offset: -3px; }
.and-d2-bar { display: block; height: 8px; border-radius: 4px; background: var(--sunk); overflow: hidden; flex: none; }
.and-d2-fill { display: block; height: 100%; width: 0; background: var(--accent); transition: width 0.12s linear; }
.and-card.and-d2-graph { border-style: dashed; }
.and-card .and-d2-vmn { text-transform: none; letter-spacing: 0; overflow-wrap: anywhere; text-align: right; min-width: 0; }
.and-d2-photo { flex: 1; min-height: 60px; border-radius: 8px; display: grid; place-items: end start; padding: 6px; font: 600 0.66rem var(--mono); color: var(--accent-ink); background: linear-gradient(160deg, var(--accent) 0 45%, var(--warm) 45% 100%); }
.and-d2-broken { flex: 1; min-height: 60px; border-radius: 8px; display: grid; place-items: center; text-align: center; padding: 6px; font: 600 0.68rem var(--mono); color: var(--err); border: 2px dashed var(--err); }
.and-d2-map { flex: 1; min-height: 70px; border-radius: 8px; background: repeating-linear-gradient(90deg, var(--sunk) 0 18px, var(--surface) 18px 20px), var(--sunk); border: 2px solid var(--ok); }
.and-d2-saved { display: grid; gap: 4px; margin-top: 6px; min-width: 0; }
.and-d2-svd { display: grid; gap: 2px; padding: 6px 8px; border-radius: 8px; border: 1px dashed var(--accent); font: 500 0.72rem var(--mono); overflow-wrap: anywhere; }
.and-d2-tabs { display: flex; flex: none; border-top: 1px solid var(--line); }
.and-d2-tab { flex: 1; text-align: center; padding: 6px 2px; font: 600 0.62rem var(--mono); color: var(--muted); }
.and-d2-tab.and-on { color: var(--accent); background: var(--accent-soft); }
/* context and components */
.and-cx-heap { display: grid; gap: 6px; flex: 1 1 220px; max-width: 320px; min-width: 0; align-content: start; }
.and-cx-obj { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); font: 600 0.76rem var(--mono); min-width: 0; transition: border-color 0.25s, background 0.25s, color 0.25s; }
.and-cx-obj > span { min-width: 0; overflow-wrap: anywhere; }
.and-cx-obj small { font: 500 0.66rem var(--mono); color: var(--muted); text-align: right; }
.and-cx-obj.and-cx-app { border-color: var(--accent); background: var(--accent-soft); }
.and-cx-obj.and-cx-live { border-color: var(--ok); }
.and-cx-obj.and-cx-dead { border-style: dashed; color: var(--muted); }
.and-cx-obj.and-cx-leak { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.and-cx-obj.and-cx-leak small { color: var(--err); }
.and-cx-single { border: 2px solid var(--warm); border-radius: 10px; padding: 8px 10px; display: grid; gap: 2px; font: 600 0.76rem var(--mono); background: var(--warm-soft); min-width: 0; overflow-wrap: anywhere; }
.and-cx-single.and-cx-none { border-style: dashed; border-color: var(--line); background: none; color: var(--muted); }
.and-cx-mem { display: grid; gap: 4px; font: 500 0.72rem var(--mono); color: var(--muted); }
.and-cx-mem .and-d2-fill.and-cx-hot { background: var(--err); }
.and-cx-jobs { display: grid; gap: 6px; flex: 1 1 280px; max-width: 420px; min-width: 0; }

/* resources */
.and-rs-tree { display: grid; gap: 4px; flex: 1 1 200px; max-width: 290px; min-width: 0; align-content: start; }
.and-rs-dir { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 5px 9px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font: 600 0.74rem var(--mono); min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.and-rs-dir > span { min-width: 0; overflow-wrap: anywhere; }
.and-rs-dir small { font: 500 0.66rem var(--mono); color: var(--muted); text-align: right; }
.and-rs-dir.and-on { border-color: var(--accent); background: var(--accent-soft); }
.and-rs-dir.and-on small { color: var(--accent); }
.and-rs-dir.and-miss { opacity: 0.42; }
.and-dev.and-rs-tab { width: 236px; height: 220px; }
.and-dev.and-rs-night { background: var(--code-bg); color: var(--code-ink); }
.and-rs-night .and-ln, .and-rs-night .and-rs-item { background: rgba(255, 255, 255, 0.14); }
.and-rs-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
.and-rs-grid.and-rs-two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.and-rs-item { height: 30px; border-radius: 6px; background: var(--sunk); }
.and-rs-count { font: 600 0.74rem var(--body); overflow-wrap: anywhere; }
.and-rs-q { font: 600 0.64rem var(--mono); color: var(--warm); }
.and-rs-words { display: grid; gap: 6px; flex: 1 1 300px; max-width: 460px; min-width: 0; }

/* predictive back */
.and-pb-layers { position: relative; flex: 1; min-height: 0; overflow: hidden; background: var(--code-bg); }
.and-pb-under, .and-pb-top { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 7px; padding: 9px; background: var(--surface); font-size: 0.8rem; }
.and-pb-under { filter: brightness(0.92); }
.and-pb-top { transition: transform 0.35s ease, border-radius 0.35s ease, opacity 0.3s; box-shadow: 0 0 0 1px var(--line); }
.and-pb-top.and-pb-peek { transform: translateX(16%) scale(0.86); border-radius: 14px; }
.and-pb-top.and-pb-out { transform: translateX(110%) scale(0.86); border-radius: 14px; }
.and-pb-field { border: 2px solid var(--line); border-radius: 8px; padding: 6px; min-height: 52px; font: 500 0.7rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.and-pb-field.and-on { border-color: var(--accent); color: var(--ink); }
.and-pb-arrow { position: absolute; left: 4px; top: 45%; z-index: 2; width: 26px; height: 26px; border-radius: 50%; background: var(--ink); color: var(--bg); display: grid; place-items: center; font: 700 0.8rem var(--mono); }
.and-pb-arrow[hidden] { display: none; }
.and-pb-card { width: min(230px, 100%); border-radius: 14px; border: 2px solid var(--accent); background: var(--surface); padding: 12px; display: grid; gap: 7px; transform-origin: center; }
.and-pb-range { width: min(320px, 100%); accent-color: var(--accent); }

/* task affinity */
.and-ta-tasks { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; min-width: 0; width: 100%; }
.and-ta-task { flex: 1 1 130px; max-width: 200px; min-width: 0; display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 12px; border: 2px dashed var(--line); background: var(--surface); transition: border-color 0.25s; }
.and-ta-task.and-on { border-style: solid; border-color: var(--accent); }
.and-ta-task .and-stack { min-height: 60px; }
.and-ta-task .and-card { font-size: 0.74rem; padding: 6px 8px; }
.and-ta-task .and-lbl, .and-ta-task .and-user { overflow-wrap: anywhere; }
`;

  Lab.addTrack({
    id: 'android',
    title: 'Android fundamentals',
    description: 'How an app lives on the phone: components and Context, screens, state, resources, intents, navigation, Back and permissions.',
    group: 'Building apps', requires: ['kotlin'],
    css,
    lessons: [
      // 0 ─────────────────────────────────────────────
      {
        id: 'context',
        title: 'Context and app components',
        tagline: 'An app is a few components the system starts, and Context is their handle to the system.',
        level: 'beginner',
        body: `
<p>An Android app has no single <code>main()</code>. It is a set of <em>components</em> the system starts for you: activities (screens), services (work without a screen), broadcast receivers (react to events) and content providers (share data). You list them in <code>AndroidManifest.xml</code>, and the system reads that list to know what your app can do.</p>
<p>A <code>Context</code> is the handle a component uses to talk to the system. It loads resources, opens files and databases, starts activities and gets system services. Two kinds come up every day. The <em>Application</em> context lives as long as the app's process. An <em>Activity</em> context is the Activity itself: it lives only as long as that one screen, and it carries the screen's theme and window.</p>
<p>That difference causes the classic leak. Hand an Activity to something that lives longer, like a singleton, and the old screen can never be freed after a rotation. Below, a singleton holds the first Activity while the phone rotates twice, and you can see what each object points at.</p>`,
        code: `// A singleton lives as long as the process
object ImageCache {
    private lateinit var appContext: Context

    fun init(context: Context) {
        appContext = context.applicationContext   // never keep the Activity itself
    }

    fun dir(): File = File(appContext.cacheDir, "images")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ImageCache.init(this)    // safe: init keeps only the application context
        setContent { NewsApp() }
    }
}`,
        remember: 'Anything that outlives a screen gets applicationContext. Screen work (dialogs, themed views, starting activities) uses the Activity.',
        terms: [
          { term: 'Context', def: 'The handle a component uses to reach the system: resources, files, system services, starting other components.' },
          { term: 'Application context', def: 'The one Context for the whole process. Safe to keep in long-lived objects, but it has no window and no Activity theme.' },
          { term: 'App component', def: 'An entry point the system can start: Activity, Service, BroadcastReceiver or ContentProvider.' },
          { term: 'AndroidManifest.xml', def: 'The file that declares the app’s components, permissions and requirements to the system and to Google Play.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'This class is kept for the whole process. Store the right context.', code: 'class Analytics(context: Context) {\n    private val appContext = context.[[applicationContext]]\n}', why: '<code>applicationContext</code> lives as long as the process, so keeping it does not hold on to any screen.' },
          { type: 'bug', prompt: 'MainActivity calls <code>NewsRepository.get(this)</code>. After a rotation, the old MainActivity is reported as leaked. Tap the line.', code: 'class NewsRepository private constructor(private val context: Context) {\n    fun cacheFile() = File(context.cacheDir, "news.json")\n    companion object {\n        @Volatile private var instance: NewsRepository? = null\n        fun get(context: Context): NewsRepository = instance ?: synchronized(this) {\n            instance ?: NewsRepository(context).also { instance = it }\n        }\n    }\n}', bug: 5, fix: '            instance ?: NewsRepository(context.applicationContext).also { instance = it }', why: 'The singleton keeps the first Context it gets for ever. Passing <code>applicationContext</code> means it never holds a screen.' },
        ],
        quiz: [
          { q: 'Which of these needs an Activity context?', options: ['Reading a string resource', 'Showing an <code>AlertDialog</code>', 'Opening a Room database'], a: 1, why: 'A dialog is a window on top of a screen. It needs the Activity’s window and theme. The other two work with the application context.' },
          { q: 'A singleton stores the Activity it was given. The user rotates the phone. What happens to the old Activity?', options: ['The singleton switches to the new Activity by itself', 'It is destroyed but stays in memory with all its views', 'The app crashes at once'], a: 1, why: 'The singleton still points at it, so the garbage collector can’t free it. Each leaked screen keeps its whole view tree.' },
          { q: 'Which component can run without a line in the manifest?', options: ['An Activity', 'A BroadcastReceiver registered in code with <code>registerReceiver()</code>', 'A ContentProvider'], a: 1, why: 'Activities, services and providers that are not declared are invisible to the system and never run. Receivers can also be registered at runtime.' },
          { q: 'A <code>NewsRepository</code> is a Hilt singleton that needs <code>cacheDir</code>. Which constructor parameter fits?', options: ['<code>@ApplicationContext context: Context</code>', '<code>activity: MainActivity</code>, injected from the current screen', '<code>LocalContext.current</code>, passed down from the composable that first uses it'], a: 0, why: 'The repository outlives every screen, so it must hold the Application. Hilt passes it for <code>@ApplicationContext</code>; an Activity or <code>LocalContext.current</code> would leak the screen.' },
        ],
        deeper: [
          {
            title: 'Four components, all listed in the manifest',
            body: `<p>Each component is a door the system can open into your app. An <strong>Activity</strong> shows a screen. A <strong>Service</strong> does work without a screen, like music playback. A <strong>BroadcastReceiver</strong> reacts to an event, like the phone finishing boot. A <strong>ContentProvider</strong> serves data to other apps, like <code>FileProvider</code> handing a photo to the share sheet.</p>
<p>The system starts them, not your code, and it can do that while your process is not running. Then it starts the process first, creates your <code>Application</code>, and only then the component. That is why the manifest matters: activities, services and providers that are not declared there never run.</p>`,
            code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <application android:name=".NewsApp" android:label="@string/app_name">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <service android:name=".PlaybackService" android:exported="false"
            android:foregroundServiceType="mediaPlayback" />
        <receiver android:name=".BootReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
        <provider android:name="androidx.core.content.FileProvider"
            android:authorities="com.example.news.fileprovider"
            android:exported="false" android:grantUriPermissions="true">
            <meta-data android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>`,
            visual(el) {
              el.classList.add('and-viz');
              const COMP = [
                { k: 'act', name: 'MainActivity', kind: '<activity>', cb: 'MainActivity.onCreate()', ev: 'tap the launcher icon' },
                { k: 'svc', name: 'PlaybackService', kind: '<service>', cb: 'PlaybackService.onStartCommand()', ev: 'start playback, then lock the phone' },
                { k: 'rcv', name: 'BootReceiver', kind: '<receiver>', cb: 'BootReceiver.onReceive(BOOT_COMPLETED)', ev: 'phone finishes booting' },
                { k: 'prv', name: 'FileProvider', kind: '<provider>', cb: 'FileProvider.openFile(content://…/photo.jpg)', ev: 'another app opens a shared photo' },
              ];
              let alive = false, busy = false;
              const tiles = Object.fromEntries(COMP.map(c => [c.k, h('div', { class: 'and-tile' }, c.name, h('small', {}, c.kind))]));
              const pid = h('span', { class: 'and-pid and-dead' }, 'process not running');
              const appObj = h('span', { class: 'and-perm' }, 'NewsApp: not created');
              const o = out();
              function paint() {
                pid.className = 'and-pid' + (alive ? '' : ' and-dead');
                pid.textContent = alive ? 'process running' : 'process not running';
                appObj.className = 'and-perm' + (alive ? ' and-ok' : '');
                appObj.textContent = alive ? 'NewsApp: created' : 'NewsApp: not created';
              }
              async function fire(c) {
                if (busy) return; busy = true;
                Object.values(tiles).forEach(t => t.classList.remove('and-match', 'and-scan', 'and-miss'));
                say(o, note(c.ev));
                if (c.k === 'svc' && !alive) {
                  line(o, `<span class="bad">nothing to start:</span> ${note('your own code starts this service from a running app. Open the app first.')}`);
                  replay(tiles.svc, 'shake'); busy = false; return;
                }
                for (const x of COMP) { tiles[x.k].classList.add('and-scan'); await sleep(110); tiles[x.k].classList.remove('and-scan'); if (!el.isConnected) return; }
                line(o, `${hl('system')} ${note(`reads the manifest: ${c.kind} ${c.name}`)}`);
                COMP.forEach(x => tiles[x.k].classList.add(x === c ? 'and-match' : 'and-miss'));
                await sleep(380); if (!el.isConnected) return;
                if (!alive) {
                  alive = true; paint(); replay(pid, 'pop');
                  line(o, `${hl('fork process')}  ${note('the process was not running')}`);
                  await sleep(320); if (!el.isConnected) return;
                  replay(appObj, 'pop');
                  line(o, `${hl('NewsApp.onCreate()')}  ${note('Application first, once per process')}`);
                  await sleep(320); if (!el.isConnected) return;
                } else line(o, note('process already running: no new Application'));
                line(o, hl(c.cb));
                busy = false;
              }
              function kill() {
                if (busy) return;
                if (!alive) { replay(pid, 'shake'); say(o, note('the process is not running')); return; }
                alive = false; paint(); replay(pid, 'pop');
                Object.values(tiles).forEach(t => t.classList.remove('and-match', 'and-miss'));
                say(o, `${hl('am kill com.example.news')}  ${note('the system reclaims memory. All objects are gone.')}`);
              }
              paint();
              say(o, note('Nothing is running yet. Send the system an event.'));
              el.append(
                h('div', { class: 'and-sys' },
                  h('span', { class: 'and-lbl' }, 'AndroidManifest.xml'),
                  h('div', { class: 'and-apps' }, COMP.map(c => tiles[c.k])),
                  h('div', { class: 'and-row' }, pid, appObj)),
                h('div', { class: 'controls' }, COMP.map(c => cmd(c.ev, () => fire(c))), cmd('system kills the process', kill)),
                o);
            },
          },
          {
            title: 'Which context for which job',
            body: `<p>The two contexts are not interchangeable. An Activity context has a window and a theme, so dialogs and views need it. Starting an Activity from it simply adds the new screen to the current task. The application context has no window: a dialog fails with <code>BadTokenException</code>, and <code>startActivity</code> throws unless you add <code>FLAG_ACTIVITY_NEW_TASK</code>. Views inflated with it lose the Activity's theme.</p>
<p>The other way round, anything that lives longer than one screen, a database, a repository, WorkManager, a singleton, must get the application context. Pick a context below and see which jobs work.</p>`,
            code: `// Screen work: the Activity (in Compose, LocalContext.current)
AlertDialog.Builder(this).setMessage(R.string.delete_draft).show()
startActivity(Intent(this, SettingsActivity::class.java))

// Long-lived objects: the application
val db = Room.databaseBuilder(applicationContext, NewsDb::class.java, "news.db").build()
WorkManager.getInstance(applicationContext).enqueue(syncRequest)`,
            visual(el) {
              el.classList.add('and-viz');
              const JOBS = [
                { job: 'getString(R.string.title)', act: ['ok', 'works'], app: ['ok', 'works'] },
                { job: 'AlertDialog.Builder(ctx).show()', act: ['ok', 'works'], app: ['no', 'BadTokenException'] },
                { job: 'ctx.startActivity(intent)', act: ['ok', 'works'], app: ['no', 'needs FLAG_ACTIVITY_NEW_TASK'] },
                { job: 'LayoutInflater.from(ctx).inflate(…)', act: ['ok', 'themed'], app: ['mid', 'no Activity theme'] },
                { job: 'keep ctx in a singleton', act: ['no', 'leaks the screen'], app: ['ok', 'safe'] },
              ];
              let which = 'act';
              const rows = JOBS.map(j => { const res = h('span', { class: 'and-res' }); const r = h('div', { class: 'and-step' }, h('span', {}, j.job), res); r.res = res; return r; });
              const o = out();
              function paint() {
                JOBS.forEach((j, i) => {
                  const [k, txt] = j[which];
                  rows[i].res.textContent = txt;
                  rows[i].res.className = 'and-res ' + (k === 'ok' ? 'and-ok' : k === 'no' ? 'and-no' : '');
                  rows[i].className = 'and-step' + (k === 'ok' ? '' : ' and-on');
                  replay(rows[i], 'pop-soft');
                });
                btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === which)));
                say(o, which === 'act' ? note('ctx = this (the Activity): great for the screen, dangerous to keep') : note('ctx = applicationContext: safe to keep, but no window and no theme'));
              }
              const btns = [['act', 'ctx = this'], ['app', 'ctx = applicationContext']].map(([k, label]) => { const b = cmd(label, () => { which = k; paint(); }); b.dataset.k = k; return b; });
              el.append(h('div', { class: 'controls' }, btns), h('div', { class: 'stage' }, h('div', { class: 'and-cx-jobs' }, rows)), o);
              paint();
            },
          },
          {
            title: 'Context in Compose, ViewModels and Hilt',
            body: `<p>In Compose, <code>LocalContext.current</code> gives the context of the host, usually the Activity. Use it right there, for example to start the share sheet, and don't store it in anything that outlives the screen.</p>
<p>A ViewModel outlives its Activity, so it must never hold one. Better still, keep Context out of ViewModels: move file, database and system-service work into a repository that gets the application context. With Hilt, ask for <code>@ApplicationContext</code>. If a ViewModel truly needs one, <code>AndroidViewModel</code> receives the <code>Application</code>.</p>`,
            code: `@Composable
fun ShareButton(url: String) {
    val context = LocalContext.current          // the host Activity, use it and let go
    Button(onClick = {
        val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, url)
        context.startActivity(Intent.createChooser(send, null))
    }) { Text(stringResource(R.string.share)) }
}

class NewsRepository @Inject constructor(
    @ApplicationContext private val context: Context,   // Hilt passes the Application
) {
    fun cacheFile() = File(context.cacheDir, "news.json")
}`,
          },
        ],
        underHood: {
          body: `<p><code>Context</code> is an abstract class. <code>Application</code>, <code>Service</code> and <code>Activity</code> are all <code>ContextWrapper</code>s: they forward every call to a base <code>ContextImpl</code> the system creates for them. <code>Activity</code> goes through <code>ContextThemeWrapper</code>, which adds the theme. <code>applicationContext</code> returns the one <code>Application</code> object of the process.</p>
<p>When the process starts, <code>ActivityThread</code> creates the <code>Application</code>, then installs the app's content providers and calls their <code>onCreate</code>, and only then calls <code>Application.onCreate()</code>. Libraries used that order to initialize themselves through an empty provider. The App Startup library merges those providers into one.</p>`,
          code: `// The Context family
// Context (abstract)
//  └─ ContextWrapper            forwards to a ContextImpl
//      ├─ Application
//      ├─ Service
//      └─ ContextThemeWrapper   adds a theme
//          └─ Activity
//
// Process start: Application created → providers' onCreate → Application.onCreate() → your component`,
        },
        mistakes: [
          {
            title: 'Showing a dialog with the application context',
            bad: `AlertDialog.Builder(applicationContext)
    .setMessage(R.string.delete_draft)
    .show()   // WindowManager.BadTokenException`,
            good: `AlertDialog.Builder(this)   // the Activity
    .setMessage(R.string.delete_draft)
    .show()`,
            why: 'A dialog is a window that belongs to a screen. The application context has no window token, so adding the window fails.',
          },
          {
            title: 'Keeping the Activity in a companion object',
            bad: `class MainActivity : ComponentActivity() {
    companion object { lateinit var current: MainActivity }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        current = this
    }
}`,
            good: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ImageCache.init(applicationContext)   // share the app context, not the screen
    }
}`,
            why: 'A companion object is static: it lives as long as the process. It keeps the destroyed screen and its views in memory, and code that uses it later talks to a dead Activity.',
          },
        ],
        visual(el) {
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'root', label: 'GC root<small>static field</small>', x: 17, y: 12, tone: 'muted' },
              { id: 'cache', label: 'ImageCache<small>object</small>', x: 50, y: 12 },
              { id: 'app', label: 'NewsApp<small>Application</small>', x: 83, y: 12, tone: 'ok', hidden: true },
              { id: 'a1', label: 'Activity #1<small>views, theme</small>', x: 17, y: 55 },
              { id: 'a2', label: 'Activity #2', x: 50, y: 55, hidden: true },
              { id: 'a3', label: 'Activity #3', x: 83, y: 55, hidden: true },
              { id: 'sys', label: 'GC root<small>system</small>', x: 50, y: 90, tone: 'muted' },
            ],
            predict: {
              q: '<code>ImageCache.init(this)</code> stores the first Activity. The phone rotates twice, then the GC runs. How many destroyed <code>MainActivity</code> objects stay in memory?',
              options: ['None: destroyed screens are always freed', 'One: #1, the one the cache holds', 'Two: #1 and #2'],
              a: 1,
              why: 'The GC frees what nothing reachable points to. The cache keeps its first context, so #1 stays. Nobody points at #2 after the second rotation, so it is freed.',
            },
            frames: [
              { add: [['root', 'cache'], ['sys', 'a1']], say: 'MainActivity #1 is on screen, held by the system. <code>ImageCache</code> is an <code>object</code>: a static field keeps it alive as long as the process.' },
              { add: [['cache', 'a1', 'context']], say: '<code>ImageCache.init(this)</code>. The cache stores the Activity as its context.' },
              { show: ['a2'], remove: [['sys', 'a1']], add: [['sys', 'a2']], say: 'Rotate. Android destroys #1 and creates #2. The system lets go of #1.' },
              { show: ['a3'], remove: [['sys', 'a2']], add: [['sys', 'a3']], gone: ['a2'], say: 'Rotate again. #2 is destroyed too, and nothing points at it, so the GC frees it.' },
              { hl: ['root', 'cache', 'a1'], add: [['root', 'cache', '', 'err'], ['cache', 'a1', 'context', 'err']], say: 'But #1 is still reachable: root → <code>ImageCache</code> → #1. The GC cannot free it or its whole view tree. That is a leak.' },
              { show: ['app'], remove: [['cache', 'a1']], add: [['root', 'cache'], ['cache', 'app', 'context', 'ok']], gone: ['a1'], say: 'The fix: <code>ImageCache.init(applicationContext)</code>. The Application lives as long as the process anyway, and no destroyed screen is held.' },
            ],
          });
        },
      },

      // 1 ─────────────────────────────────────────────
      {
        id: 'lifecycle',
        title: 'Activity lifecycle',
        tagline: 'Six callbacks, always in the same order.',
        body: `
<p>An Activity is one screen of your app. You never call its lifecycle methods yourself. Android calls them as the user opens the app, leaves it and comes back.</p>
<p>Think of three nested pairs. <code>onCreate</code> and <code>onDestroy</code> bracket the life of the object. <code>onStart</code> and <code>onStop</code> bracket the time it is visible. <code>onResume</code> and <code>onPause</code> bracket the time it is in front and takes input. Every step up has a matching step down, and they always run in order.</p>
<p>Rotation is the surprise. By default Android destroys the Activity and creates a new instance for the new screen shape. Try each action below and watch the log and the states.</p>`,
        code: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)   // once per instance
        setContent { AppScreen() }
    }
    override fun onStart() { super.onStart() }      // visible
    override fun onResume() { super.onResume() }    // in front, takes input
    override fun onPause() { super.onPause() }      // losing focus
    override fun onStop() { super.onStop() }        // out of view
    override fun onDestroy() { super.onDestroy() }  // this instance is done
}

// In Compose, react to the lifecycle right where you need it
@Composable
fun CameraPreview(camera: Camera) {
    LifecycleStartEffect(camera) {
        camera.open()                         // after onStart
        onStopOrDispose { camera.close() }    // on onStop, or when it leaves the screen
    }
}`,
        remember: 'Up: onCreate, onStart, onResume. Down: onPause, onStop, onDestroy. Rotation goes all the way down and back up.',
        level: 'beginner',
        terms: [
          { term: 'Activity', def: 'An Android component that hosts one screen and receives lifecycle callbacks from the system.' },
          { term: 'Lifecycle callbacks', def: 'The methods onCreate, onStart, onResume, onPause, onStop and onDestroy that Android calls as a screen comes and goes.' },
          { term: 'LifecycleStartEffect', def: 'A Compose effect that runs its block after onStart and its cleanup on onStop or when it leaves the composition.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hold the camera only while the screen is visible.', code: 'override fun [[onStart]]() {\n    super.onStart()\n    camera.open()\n}\noverride fun [[onStop]]() {\n    super.onStop()\n    camera.close()\n}', why: '<code>onStart</code> and <code>onStop</code> bracket the visible time, so other apps get the camera whenever yours is out of view.' },
          { type: 'bug', prompt: 'The app crashes as soon as the user leaves this screen. Tap the line.', code: 'class PlayerActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent { PlayerScreen(player) }\n    }\n    override fun onPause() = player.pause()\n}', bug: 5, fix: '    override fun onPause() { super.onPause(); player.pause() }', why: 'Every lifecycle override must call its <code>super</code> method. Skipping it throws <code>SuperNotCalledException</code>.' },
        ],
        quiz: [
          { q: 'Your Activity is in front. The user presses Home. Which callbacks run?', options: ['<code>onPause</code> only', '<code>onPause</code>, <code>onStop</code>', '<code>onPause</code>, <code>onStop</code>, <code>onDestroy</code>'], a: 1, why: 'The screen is out of view, so the Activity stops. It is not destroyed, because the user can come back to it.' },
          { q: 'The user comes back to a stopped Activity from Recents. What runs?', options: ['<code>onCreate</code>, <code>onStart</code>, <code>onResume</code>', '<code>onRestart</code>, <code>onStart</code>, <code>onResume</code>', '<code>onResume</code> only'], a: 1, why: 'The instance still exists, so there is no <code>onCreate</code>. <code>onRestart</code> marks the way back up from stopped.' },
          { q: 'Where should you release the camera so other apps can use it while yours is out of view?', options: ['<code>onCreate</code>', '<code>onStop</code>', '<code>onDestroy</code>'], a: 1, why: '<code>onStop</code> runs every time the screen leaves view. <code>onDestroy</code> may come much later, or never if the process is killed.' },
          { q: 'Activity A is resumed and starts full-screen Activity B. In which order do the callbacks run?', options: ['A.onPause, A.onStop, B.onCreate, B.onStart, B.onResume', 'A.onPause, B.onCreate, B.onStart, B.onResume, A.onStop', 'B.onCreate, B.onStart, B.onResume, A.onPause, A.onStop'], a: 1, why: 'B waits for A’s <code>onPause</code> to return, and A is only stopped once B is in front and covers it.' },
          { q: 'A video player pauses in <code>onPause</code> and resumes in <code>onResume</code>. The user enters picture-in-picture. What happens?', options: ['The video freezes in the small window, because the Activity is paused while still visible', 'The video keeps playing in the small window', 'The Activity is stopped, so the video is released'], a: 0, why: 'In PiP the Activity is visible but cannot take focus, so it sits in the paused state. Pausing in <code>onStop</code> keeps it playing.' },
        ],
        deeper: [
          {
            title: 'Lifecycle states and events, and observers that catch up',
            body: `<p>Every Activity, Fragment and navigation entry has a <code>Lifecycle</code> object. It has five <em>states</em>: <code>INITIALIZED</code> (before <code>onCreate</code>), <code>CREATED</code>, <code>STARTED</code>, <code>RESUMED</code> and <code>DESTROYED</code>. The <em>events</em> are the moves between them, <code>ON_CREATE</code> through <code>ON_DESTROY</code>. There is no paused or stopped state: after <code>ON_PAUSE</code> you are back in <code>STARTED</code>, and after <code>ON_STOP</code> in <code>CREATED</code>. <code>onRestart</code> has no event at all.</p>
<p>A class that implements <code>DefaultLifecycleObserver</code> gets the events without the Activity forwarding each one. An observer added late catches up: add it while the screen is <code>RESUMED</code> and it gets <code>onCreate</code>, <code>onStart</code> and <code>onResume</code> at once, in order. States are ordered, so <code>currentState.isAtLeast(STARTED)</code> means "visible".</p>`,
            code: `class LocationTracker(private val updates: LocationUpdates) : DefaultLifecycleObserver {
    override fun onStart(owner: LifecycleOwner) = updates.start()
    override fun onStop(owner: LifecycleOwner) = updates.stop()
}

class MapActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycle.addObserver(LocationTracker(updates))   // the Activity forwards nothing
    }
}

// Ask the current state directly
if (lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)) showTooltip()`,
            visual(el) {
              el.classList.add('and-viz');
              const ORDER = ['DESTROYED', 'INITIALIZED', 'CREATED', 'STARTED', 'RESUMED'];
              const CB = { ON_CREATE: 'onCreate', ON_START: 'onStart', ON_RESUME: 'onResume', ON_PAUSE: 'onPause', ON_STOP: 'onStop', ON_DESTROY: 'onDestroy' };
              const AFTER = { ON_CREATE: 'CREATED', ON_START: 'STARTED', ON_RESUME: 'RESUMED', ON_PAUSE: 'STARTED', ON_STOP: 'CREATED', ON_DESTROY: 'DESTROYED' };
              const UP = ['ON_CREATE', 'ON_START', 'ON_RESUME'];
              let st = 'RESUMED', obs = null, busy = false, inst = addr();
              const chips = Object.fromEntries(ORDER.map(s => [s, h('span', { class: 'and-perm' }, s)]));
              const atLeast = h('span', { class: 'and-perm' });
              const instEl = h('span', { class: 'and-user' });
              const obsBox = h('div', { class: 'and-d2-obs' });
              const o = out();
              function paint() {
                ORDER.forEach(s => { chips[s].className = 'and-perm' + (s === st ? ' and-ok' : ''); });
                const ok = ORDER.indexOf(st) >= ORDER.indexOf('STARTED');
                atLeast.textContent = `isAtLeast(STARTED) = ${ok}`;
                atLeast.className = 'and-perm ' + (ok ? 'and-ok' : 'and-no');
                instEl.textContent = `MainActivity ${inst}`;
              }
              function paintObs() {
                if (!obs) { obsBox.replaceChildren(h('span', { class: 'and-lbl' }, 'observers'), h('span', { class: 'and-user' }, 'none')); return; }
                obs.card = h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, 'LocationTracker'), h('span', { class: 'obj-addr' }, 'DefaultLifecycleObserver'), obs.log);
                obsBox.replaceChildren(h('span', { class: 'and-lbl' }, 'observers'), obs.card);
              }
              function got(ev) {
                if (!obs) return;
                obs.log.append(h('span', { class: 'and-d2-ev drop-in' }, CB[ev] + '(owner)'));
                while (obs.log.children.length > 6) obs.log.firstElementChild.remove();
                replay(obs.card, 'pop-soft');
              }
              async function events(list) {
                for (const ev of list) {
                  const up = UP.includes(ev);
                  if (!up && obs) { got(ev); line(o, `${hl(`tracker.${CB[ev]}(owner)`)}  ${note(ev + ', before the Activity')}`); await sleep(280); }
                  line(o, hl(`MainActivity.${CB[ev]}()`));
                  st = AFTER[ev]; paint(); replay(chips[st], 'pop');
                  if (up && obs) { await sleep(280); got(ev); line(o, `${hl(`tracker.${CB[ev]}(owner)`)}  ${note(ev + ', after the Activity')}`); }
                  await sleep(420);
                  if (!el.isConnected) return false;
                }
                return true;
              }
              function nope(msg) { if (busy) return; replay(atLeast, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); }
              async function add() {
                if (busy) return;
                if (obs) return nope('tracker is already observing.');
                busy = true;
                obs = { log: h('div', { class: 'and-d2-evs' }) }; paintObs();
                say(o, `${hl('lifecycle.addObserver(tracker)')}  ${note('current state ' + st)}`);
                const catchUp = UP.slice(0, Math.max(0, ORDER.indexOf(st) - 1));
                if (!catchUp.length) line(o, note('the lifecycle is DESTROYED: no events, ever'));
                for (const ev of catchUp) {
                  await sleep(380); if (!el.isConnected) return;
                  got(ev); line(o, `${hl(`tracker.${CB[ev]}(owner)`)}  ${note('catch-up')}`);
                }
                busy = false;
              }
              function remove() {
                if (busy) return;
                if (!obs) return nope('there is no observer to remove.');
                obs = null; paintObs();
                say(o, `${hl('lifecycle.removeObserver(tracker)')}  ${note('no more events')}`);
              }
              async function go(label, list) {
                busy = true; say(o, note(label));
                if (!await events(list)) return;
                busy = false;
              }
              const home = () => (busy ? null : st === 'RESUMED' ? go('press Home', ['ON_PAUSE', 'ON_STOP']) : nope('the screen is not in front.'));
              const back = () => (busy ? null : st === 'CREATED' ? go('come back: onRestart() runs, but it has no Lifecycle event', ['ON_START', 'ON_RESUME']) : nope(st === 'DESTROYED' ? 'this instance is gone. Open it again.' : 'the screen is already in front.'));
              const fin = () => (busy ? null : st === 'RESUMED' ? go('finish()', ['ON_PAUSE', 'ON_STOP', 'ON_DESTROY']) : st === 'CREATED' ? go('finish() while stopped', ['ON_DESTROY']) : nope('already destroyed.'));
              async function reopen() {
                if (busy) return;
                if (st !== 'DESTROYED') return nope('the Activity still exists. finish() it first.');
                busy = true;
                inst = addr(); st = 'INITIALIZED'; paint();
                say(o, note('open again: a new MainActivity with a new Lifecycle'));
                if (obs) { obs = null; paintObs(); line(o, note('the old observer was registered on the old Lifecycle. Code in onCreate would add it again.')); }
                if (!await events(UP)) return;
                busy = false;
              }
              paint(); paintObs();
              say(o, note('MainActivity is RESUMED. Add an observer late and watch it catch up.'));
              el.append(
                h('div', { class: 'stage' },
                  h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'lifecycle.currentState'), ...ORDER.map(s => chips[s]), atLeast, instEl),
                  obsBox),
                h('div', { class: 'controls' }, cmd('lifecycle.addObserver(tracker)', add), cmd('lifecycle.removeObserver(tracker)', remove)),
                h('div', { class: 'controls' }, cmd('press Home', home), cmd('come back', back), cmd('finish()', fin), cmd('open again', reopen)),
                o);
            },
          },
          {
            title: 'Covered by a dialog, a see-through screen, or a full screen',
            body: `<p>What covers your Activity decides which callbacks run. A dialog you show, an <code>AlertDialog</code> or a Compose <code>Dialog</code>, is a window inside your own Activity. No lifecycle callback runs. The Activity stays <code>RESUMED</code> and only loses window focus.</p>
<p>Another Activity is different. If it is translucent, like the system's permission prompt, yours is still partly visible, so it only gets <code>onPause</code>. If it fills the screen, yours also gets <code>onStop</code>, but only once the new one is in front: A.onPause, B.onCreate, B.onStart, B.onResume, then A.onStop. The new screen waits for your <code>onPause</code> to return, so keep it short.</p>`,
            code: `// No lifecycle callback: a window inside this Activity
AlertDialog.Builder(this).setMessage("Delete draft?").show()

// onPause only: a translucent Activity on top
permissionLauncher.launch(Manifest.permission.CAMERA)

// onPause, then onStop after SettingsActivity is resumed
startActivity(Intent(this, SettingsActivity::class.java))`,
            visual(el) {
              el.classList.add('and-viz');
              let cover = null, busy = false;
              const { dev, view, dim } = device();
              const mainSt = h('span', { class: 'and-perm and-ok' }, 'RESUMED');
              const otherSt = h('span', { class: 'and-perm' }, '-');
              const otherName = h('span', { class: 'and-lbl' }, 'other Activity');
              const o = out();
              const mainScreen = () => h('div', { class: 'and-scr drop-in' }, appbar('MainActivity'), bars(90, 70, 80, 55, 75));
              const setSt = (elx, s) => { elx.textContent = s; elx.className = 'and-perm' + (s === 'RESUMED' ? ' and-ok' : s === '-' || s === 'DESTROYED' ? '' : ' and-d2-mid'); replay(elx, 'pop'); };
              let overlay = null;
              async function seq(steps) {
                for (const [who, cbName, state] of steps) {
                  line(o, hl(`${who}.${cbName}()`));
                  if (state) setSt(who === 'MainActivity' ? mainSt : otherSt, state);
                  await sleep(380);
                  if (!el.isConnected) return false;
                }
                return true;
              }
              function nope(msg) { if (busy) return; replay(dev, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); }
              function dialog() {
                if (busy) return;
                if (cover) return nope('something is already on top. Press Back first.');
                cover = 'dialog';
                overlay = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Delete draft?'), h('span', {}, 'This can’t be undone.'));
                dev.append(overlay); dim.classList.add('and-on');
                say(o, `${hl('AlertDialog.Builder(this).show()')}  ${note('a window in MainActivity')}`);
                line(o, `${hl('MainActivity.onWindowFocusChanged(false)')}  ${note('no lifecycle callback. Still RESUMED.')}`);
                replay(mainSt, 'pop');
              }
              async function perm() {
                if (busy) return;
                if (cover) return nope('something is already on top. Press Back first.');
                busy = true; cover = 'translucent';
                otherName.textContent = 'GrantPermissionsActivity';
                say(o, `${hl('permissionLauncher.launch(CAMERA)')}  ${note('the system starts a translucent Activity')}`);
                if (!await seq([['MainActivity', 'onPause', 'STARTED']])) return;
                dim.classList.add('and-on');
                overlay = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Allow camera?'), h('span', { class: 'and-row' }, h('span', { class: 'and-ui' }, 'Allow'), h('span', { class: 'and-ui and-ghost' }, 'Don’t allow')));
                dev.append(overlay);
                if (!await seq([['GrantPermissionsActivity', 'onCreate', 'CREATED'], ['GrantPermissionsActivity', 'onStart', 'STARTED'], ['GrantPermissionsActivity', 'onResume', 'RESUMED']])) return;
                line(o, note('MainActivity is still visible behind it: no onStop'));
                busy = false;
              }
              async function settings() {
                if (busy) return;
                if (cover) return nope('something is already on top. Press Back first.');
                busy = true; cover = 'opaque';
                otherName.textContent = 'SettingsActivity';
                say(o, hl('startActivity(Intent(this, SettingsActivity::class.java))'));
                if (!await seq([['MainActivity', 'onPause', 'STARTED'], ['SettingsActivity', 'onCreate', 'CREATED'], ['SettingsActivity', 'onStart', 'STARTED']])) return;
                view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('← Settings'), bars(70, 85, 60, 80)));
                if (!await seq([['SettingsActivity', 'onResume', 'RESUMED'], ['MainActivity', 'onStop', 'CREATED']])) return;
                line(o, note('MainActivity stopped only after Settings was in front'));
                busy = false;
              }
              async function back() {
                if (busy) return;
                if (!cover) return nope('nothing is on top of MainActivity.');
                busy = true;
                say(o, note('press Back'));
                if (cover === 'dialog') {
                  overlay.classList.add('fly-out'); dim.classList.remove('and-on');
                  line(o, `${hl('MainActivity.onWindowFocusChanged(true)')}  ${note('dialog dismissed. No lifecycle callback.')}`);
                  await sleep(400);
                } else if (cover === 'translucent') {
                  if (!await seq([['GrantPermissionsActivity', 'onPause', 'STARTED']])) return;
                  overlay.classList.add('fly-out'); dim.classList.remove('and-on');
                  if (!await seq([['MainActivity', 'onResume', 'RESUMED'], ['GrantPermissionsActivity', 'onStop', 'CREATED'], ['GrantPermissionsActivity', 'onDestroy', 'DESTROYED']])) return;
                } else {
                  if (!await seq([['SettingsActivity', 'onPause', 'STARTED'], ['MainActivity', 'onRestart', null], ['MainActivity', 'onStart', 'STARTED']])) return;
                  view.replaceChildren(mainScreen());
                  if (!await seq([['MainActivity', 'onResume', 'RESUMED'], ['SettingsActivity', 'onStop', 'CREATED'], ['SettingsActivity', 'onDestroy', 'DESTROYED']])) return;
                }
                if (overlay) { overlay.remove(); overlay = null; }
                cover = null;
                busy = false;
              }
              view.replaceChildren(mainScreen());
              say(o, note('MainActivity is RESUMED. Cover it three different ways.'));
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev),
                  h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'MainActivity'), mainSt, otherName, otherSt)),
                h('div', { class: 'controls' }, cmd('show AlertDialog', dialog), cmd('request CAMERA permission', perm), cmd('startActivity(Settings)', settings), cmd('press Back', back)),
                o);
            },
          },
          {
            title: 'Split screen and picture-in-picture',
            body: `<p>On Android 10 and later, every visible Activity in split screen is <code>RESUMED</code> at the same time, so tapping the other app does not pause yours. Only one of them is the <em>top resumed</em> Activity, and <code>onTopResumedActivityChanged()</code> tells you when that changes. It matters for things only one app can hold, like the camera. On Android 9 and lower, only the app last touched was resumed, and the other visible one sat in <code>STARTED</code>.</p>
<p>In picture-in-picture your Activity is visible but can't take focus, so it is paused. A video player that pauses in <code>onPause</code> freezes in its little window. Start playback in <code>onStart</code> and pause it in <code>onStop</code>.</p>`,
            code: `class PlayerActivity : ComponentActivity() {
    override fun onStart() { super.onStart(); player.play() }   // visible, even in PiP
    override fun onStop() { super.onStop(); player.pause() }    // really off screen

    override fun onUserLeaveHint() {                             // user pressed Home
        super.onUserLeaveHint()
        if (player.isPlaying) enterPictureInPictureMode(PictureInPictureParams.Builder().build())
    }

    override fun onTopResumedActivityChanged(isTopResumedActivity: Boolean) {
        super.onTopResumedActivityChanged(isTopResumedActivity)
        // true: this app has focus. false: another resumed app took it.
    }
}`,
            visual(el) {
              el.classList.add('and-viz');
              let mode = 'full', focus = 'video', api10 = true, onStopPause = false, busy = false, secs = 0, last = 0;
              const R = ['CREATED', 'STARTED', 'RESUMED'];
              const scr = h('div', { class: 'and-d2-mw' });
              const time = h('span', { class: 'and-d2-time' }, '0:00');
              const prog = h('span', { class: 'and-d2-prog' });
              const vidLbl = h('span', { class: 'and-d2-vlbl' }, 'playing');
              const vid = h('div', { class: 'and-d2-vid' }, vidLbl, time, h('span', { class: 'and-d2-track' }, prog));
              const notes = h('div', { class: 'and-d2-notes' }, appbar('Notes'), bars(80, 60, 75));
              const stEl = h('span', { class: 'and-perm and-ok' }, 'RESUMED');
              const topEl = h('span', { class: 'and-perm and-ok' }, 'top resumed');
              const playEl = h('span', { class: 'and-perm and-ok' }, 'video playing');
              const o = out();
              const stateOf = () => (mode === 'full' ? 'RESUMED' : mode === 'pip' ? 'STARTED' : api10 || focus === 'video' ? 'RESUMED' : 'STARTED');
              const isTop = () => stateOf() === 'RESUMED' && (mode === 'full' || focus === 'video');
              const playing = () => (onStopPause ? R.indexOf(stateOf()) >= 1 : stateOf() === 'RESUMED');
              function layout() {
                scr.className = 'and-d2-mw and-d2-' + mode;
                vid.classList.toggle('and-d2-focus', mode === 'split' && focus === 'video');
                notes.classList.toggle('and-d2-focus', mode === 'split' && focus === 'notes');
                scr.replaceChildren(...(mode === 'full' ? [vid] : mode === 'split' ? [vid, notes] : [notes, vid]));
              }
              function paint() {
                const s = stateOf();
                stEl.textContent = s; stEl.className = 'and-perm ' + (s === 'RESUMED' ? 'and-ok' : 'and-d2-mid');
                topEl.textContent = isTop() ? 'top resumed' : 'not top resumed'; topEl.className = 'and-perm ' + (isTop() ? 'and-ok' : '');
                const p = playing();
                playEl.textContent = p ? 'video playing' : 'video paused'; playEl.className = 'and-perm ' + (p ? 'and-ok' : 'and-no');
                vidLbl.textContent = p ? 'playing' : 'paused';
                vid.classList.toggle('and-d2-frozen', !p);
              }
              function tick(now) {
                if (!el.isConnected) return;
                if (last && playing()) { secs += (now - last) / 1000; time.textContent = `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`; prog.style.width = `${(secs % 30) / 30 * 100}%`; }
                last = now;
                requestAnimationFrame(tick);
              }
              async function to(nextMode, nextFocus, label) {
                if (busy) return; busy = true;
                const s0 = stateOf(), top0 = isTop(), p0 = playing();
                mode = nextMode; focus = nextFocus;
                const s1 = stateOf(), top1 = isTop();
                say(o, note(label));
                const i0 = R.indexOf(s0), i1 = R.indexOf(s1);
                const lines = [];
                if (api10 && top0 && !top1) lines.push(`${hl('onTopResumedActivityChanged(false)')}`);
                if (i1 < i0) { if (i0 === 2) lines.push(hl('onPause()')); if (i1 === 0) lines.push(hl('onStop()')); }
                if (i1 > i0) { if (i0 === 1) lines.push(hl('onResume()')); }
                if (api10 && !top0 && top1) lines.push(`${hl('onTopResumedActivityChanged(true)')}`);
                layout();
                if (!lines.length) line(o, note(`no callback: PlayerActivity stays ${s1}`));
                for (const l of lines) { line(o, l); await sleep(320); if (!el.isConnected) return; }
                paint(); replay(stEl, 'pop');
                const p1 = playing();
                if (p0 && !p1) line(o, `<span class="bad">video frozen</span> ${note('paused in onPause while still on screen')}`);
                else if (p1 && mode === 'pip') line(o, `<span class="good">still playing in PiP</span> ${note(onStopPause ? 'it only pauses in onStop' : '')}`);
                busy = false;
              }
              const full = () => (mode === 'full' ? null : to('full', 'video', 'back to full screen'));
              const split = () => (mode === 'split' ? null : to('split', 'video', 'enter split screen with Notes'));
              const tapNotes = () => (mode !== 'split' ? (busy ? null : (replay(scr, 'shake'), say(o, note('Notes is only on screen in split screen.')))) : to('split', 'notes', 'tap the Notes app'));
              const tapVideo = () => (mode !== 'split' ? (busy ? null : (replay(scr, 'shake'), say(o, note('Enter split screen first.')))) : to('split', 'video', 'tap the video app'));
              const pip = () => (mode === 'pip' ? null : to('pip', 'notes', 'enterPictureInPictureMode()'));
              const tApi = h('label', { class: 'switch', for: 'and-d2-mw-api' }, h('input', { type: 'checkbox', id: 'and-d2-mw-api', checked: true, onchange(e) {
                if (busy) { e.target.checked = api10; return; }
                api10 = e.target.checked; mode = 'full'; focus = 'video'; layout(); paint();
                say(o, note(api10 ? 'Android 10+: multi-resume' : 'Android 9: only the focused app is resumed'));
              } }), 'Android 10+');
              const tStop = h('label', { class: 'switch', for: 'and-d2-mw-stop' }, h('input', { type: 'checkbox', id: 'and-d2-mw-stop', onchange(e) {
                if (busy) { e.target.checked = onStopPause; return; }
                onStopPause = e.target.checked; paint();
                say(o, note(onStopPause ? 'player.play() in onStart, player.pause() in onStop' : 'player.play() in onResume, player.pause() in onPause'));
              } }), 'pause video in onStop');
              layout(); paint(); requestAnimationFrame(tick);
              say(o, note('The video plays full screen. Pause logic is in onPause for now.'));
              el.append(
                h('div', { class: 'stage' }, scr, h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'PlayerActivity'), stEl, topEl, playEl)),
                h('div', { class: 'controls' }, tApi, tStop),
                h('div', { class: 'controls' }, cmd('split screen', split), cmd('tap Notes', tapNotes), cmd('tap the video', tapVideo), cmd('enterPictureInPictureMode()', pip), cmd('full screen', full)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>The system process drives the lifecycle. <code>system_server</code> decides what is visible and sends your app a transaction such as "resume this Activity" or "stop that one". In your process, <code>ActivityThread</code> runs it on the main thread and calls the callbacks. When the target state is more than one step away, it walks every state in between: from stopped to resumed it calls <code>onRestart</code>, <code>onStart</code>, then <code>onResume</code>, so no step is ever skipped.</p>
<p>The Lifecycle library listens to those callbacks. <code>ComponentActivity</code> owns a <code>LifecycleRegistry</code>. On API 29 and higher it hooks the Activity's pre- and post-callbacks, and on older versions an invisible <code>ReportFragment</code> does the job. That fixes the order: <code>ON_CREATE</code>, <code>ON_START</code> and <code>ON_RESUME</code> reach observers after your <code>onCreate</code>, <code>onStart</code> and <code>onResume</code> return, and <code>ON_PAUSE</code>, <code>ON_STOP</code> and <code>ON_DESTROY</code> reach them before your <code>onPause</code>, <code>onStop</code> and <code>onDestroy</code> run.</p>`,
          code: `// The order you can rely on
// MainActivity.onCreate()   then  observer.onCreate(owner)
// MainActivity.onStart()    then  observer.onStart(owner)
// MainActivity.onResume()   then  observer.onResume(owner)
// observer.onPause(owner)   then  MainActivity.onPause()
// observer.onStop(owner)    then  MainActivity.onStop()
// observer.onDestroy(owner) then  MainActivity.onDestroy()`,
        },
        mistakes: [
          {
            title: 'Pausing video in onPause',
            bad: `override fun onPause() {
    super.onPause()
    player.pause()   // freezes in PiP and in older split screen
}`,
            good: `override fun onStop() {
    super.onStop()
    player.pause()   // only when it really leaves the screen
}`,
            why: 'In picture-in-picture, and in split screen on Android 9 and lower, your Activity is paused while the user still watches it. Pause playback when it leaves view.',
          },
          {
            title: 'Setup and teardown on different levels',
            bad: `override fun onStart() {
    super.onStart()
    sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_UI)
}
override fun onDestroy() {
    super.onDestroy()
    sensorManager.unregisterListener(this)
}`,
            good: `override fun onStart() {
    super.onStart()
    sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_UI)
}
override fun onStop() {
    super.onStop()
    sensorManager.unregisterListener(this)
}`,
            why: 'Going Home and back runs <code>onStart</code> again but not <code>onDestroy</code>, so the sensor keeps running in the background. Pair each setup with the callback on the same level: start with stop, resume with pause.',
          },
          {
            title: 'Using @OnLifecycleEvent',
            bad: `class Tracker : LifecycleObserver {
    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun start() { /* ... */ }
}`,
            good: `class Tracker : DefaultLifecycleObserver {
    override fun onStart(owner: LifecycleOwner) { /* ... */ }
}`,
            why: '<code>@OnLifecycleEvent</code> is deprecated. It needed reflection or annotation processing. <code>DefaultLifecycleObserver</code> uses plain interface methods the compiler checks.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const TO = { onCreate: 'CREATED', onStart: 'STARTED', onResume: 'RESUMED', onPause: 'STARTED', onStop: 'CREATED', onDestroy: 'DESTROYED', onRestart: 'CREATED' };
          let st = 'RESUMED', id = addr(), busy = false, away = 'home', shown = '';
          const nodes = {}, cbs = {};
          const cb = (name, text) => (cbs[name] = h('span', { class: 'and-cb' }, text));
          const node = (s, ...kids) => (nodes[s] = h('div', { class: 'and-st' }, s, ...kids));
          const edge = (down, up) => h('div', { class: 'and-edge' }, cb(down, down + ' ↓'), cb(up, '↑ ' + up));
          const diagram = h('div', { class: 'and-states' },
            h('span', { class: 'and-lbl' }, 'Lifecycle.State'),
            node('DESTROYED'), edge('onCreate', 'onDestroy'),
            node('CREATED', cb('onRestart', '↻ onRestart')), edge('onStart', 'onStop'),
            node('STARTED'), edge('onResume', 'onPause'),
            node('RESUMED'));
          const { dev, view, dim } = device();
          const o = out();
          const appScreen = () => h('div', { class: 'and-scr drop-in' }, appbar(`MainActivity ${id}`), bars(90, 70, 80, 55, 75));
          function paint() {
            Object.entries(nodes).forEach(([s, n]) => n.classList.toggle('and-on', s === st));
            const visible = st === 'STARTED' || st === 'RESUMED';
            const kind = visible ? 'app' + id : away;
            if (kind !== shown) {
              shown = kind;
              view.replaceChildren(visible ? appScreen() : away === 'home' ? homeScreen() : h('div', { class: 'and-scr' }));
            }
            dim.classList.toggle('and-on', st === 'STARTED');
          }
          const logCb = (c, extra = '') => line(o, `${hl(c + '()')}  ${note(TO[c] + extra)}`);
          async function run(label, seq, opts = {}) {
            if (busy) return; busy = true;
            away = opts.via || 'home';
            say(o, note(label));
            if (opts.rot) await rotate(dev);
            for (const c of seq) {
              if (c === 'onCreate') id = addr();
              st = TO[c];
              Object.values(cbs).forEach(x => x.classList.remove('and-lit'));
              cbs[c].classList.add('and-lit'); replay(cbs[c], 'pop');
              logCb(c, c === 'onCreate' ? `, new instance ${id}` : '');
              paint();
              await sleep(560);
            }
            if (opts.tail) line(o, note(opts.tail));
            busy = false;
          }
          function nope(msg) {
            if (busy) return;
            replay(dev, 'shake');
            say(o, `<span class="bad">nothing fires:</span> ${msg}`);
          }
          const onScreen = 'The app is not on screen. Open it or come back first.';
          const actions = [
            ['open app', () => (st === 'DESTROYED' ? run('open app', ['onCreate', 'onStart', 'onResume'])
              : st === 'CREATED' ? run('open app: the stopped instance still exists', ['onRestart', 'onStart', 'onResume'])
                : nope('The app is already in front.'))],
            ['press Home', () => (st === 'RESUMED' ? run('press Home', ['onPause', 'onStop']) : nope(onScreen))],
            ['come back', () => (st === 'CREATED' ? run('come back from Recents', ['onRestart', 'onStart', 'onResume'])
              : st === 'DESTROYED' ? nope('That instance was destroyed. Tap open app to create a new one.')
                : nope('The app is already in front.'))],
            ['rotate', () => (st === 'RESUMED' ? run('rotate the phone', ['onPause', 'onStop', 'onDestroy', 'onCreate', 'onStart', 'onResume'], { rot: true, via: 'blank', tail: 'same screen, brand-new object: fields of the old one are gone' }) : nope(onScreen))],
            ['press Back', () => (st === 'RESUMED' ? run('press Back', ['onPause', 'onStop'], { tail: 'Android 12+: Back on the root launcher activity moves the app to the background. It stops, it is not destroyed.' }) : nope(onScreen))],
            ['finish()', () => (st === 'RESUMED' ? run('finish()', ['onPause', 'onStop', 'onDestroy'], { tail: 'the instance is gone for good' }) : nope(onScreen))],
          ];
          // Open on a running app, with the launch already in the log.
          paint();
          say(o, note('open app'));
          ['onCreate', 'onStart', 'onResume'].forEach(c => o.append(h('div', { class: 'line', html: `${hl(c + '()')}  ${note(TO[c])}` })));
          cbs.onResume.classList.add('and-lit');
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), diagram),
            h('div', { class: 'controls' }, actions.map(([label, f]) => cmd(label, f))),
            o);
        },
        predict: {
          q: 'The app is in front and the user rotates the phone. What happens to the Activity?',
          options: ['Only <code>onPause</code> and <code>onResume</code> run', 'It steps all the way down to <code>onDestroy</code>, then a new instance runs <code>onCreate</code>, <code>onStart</code>, <code>onResume</code>', 'Nothing runs: the window just redraws'],
          a: 1,
          why: 'By default a configuration change destroys the Activity and builds a new one for the new screen shape, with every step down and back up in order.',
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'viewmodel',
        title: 'Configuration changes and ViewModel',
        tagline: 'Rotation rebuilds the Activity. The ViewModel stays.',
        body: `
<p>Rotating the phone, changing the language or switching to dark mode is a <em>configuration change</em>. By default Android destroys the Activity and creates a fresh one, so the new one can load resources for the new configuration.</p>
<p>A field in the old Activity dies with it. A <code>ViewModel</code> lives outside the Activity, in a <code>ViewModelStore</code> that Android keeps across the change. The new Activity asks for it with <code>by viewModels()</code> and gets the very same object back.</p>
<p>The ViewModel goes away only when the screen is gone for good, for example after <code>finish()</code>. That is when <code>onCleared()</code> runs. Because it outlives the Activity, a ViewModel must never hold a reference to an Activity, a View or a Context tied to one.</p>`,
        code: `class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()

    fun increment() = _count.update { it + 1 }

    override fun onCleared() { /* the screen is gone for good */ }
}

class MainActivity : ComponentActivity() {
    private var activityCount = 0                              // dies with this instance
    private val viewModel: CounterViewModel by viewModels()    // survives rotation

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val count by viewModel.count.collectAsStateWithLifecycle()
            CounterScreen(count = count, onTap = viewModel::increment)
        }
    }
}`,
        remember: 'Rotation destroys the Activity, not the ViewModel. Keep screen state in the ViewModel.',
        level: 'beginner',
        terms: [
          { term: 'ViewModel', def: 'A class that holds screen state and logic and survives configuration changes of its Activity or Fragment.' },
          { term: 'Configuration change', def: 'A change such as rotation, language or dark mode that by default destroys and recreates the Activity.' },
          { term: 'by viewModels()', def: 'A property delegate that returns the existing ViewModel for this owner, or creates it the first time.' },
          { term: 'onCleared()', def: 'Called once when a ViewModel’s owner is finished for good, so it can release resources.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the ViewModel and get it in the Activity.', code: 'class TimerViewModel : [[ViewModel]]() {\n    val seconds = MutableStateFlow(0)\n}\n\nclass TimerActivity : ComponentActivity() {\n    private val vm: TimerViewModel by [[viewModels]]()\n}', why: 'Extend <code>ViewModel</code>, then <code>by viewModels()</code> hands back the same instance after rotation.' },
          { type: 'bug', prompt: 'After a few rotations, memory keeps growing. Tap the line that leaks.', code: 'class ProfileViewModel(\n    private val activity: Activity,\n    private val repo: ProfileRepository,\n) : ViewModel() {\n    val profile = repo.profile\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)\n}', bug: 1, fix: '    // remove it: a ViewModel must not hold an Activity', why: 'The ViewModel outlives each rotated Activity and keeps the old one, with its whole view tree, in memory.' },
        ],
        quiz: [
          { q: 'A counter is a plain <code>var</code> field in the Activity. The user rotates the phone. The counter', options: ['keeps its value', 'goes back to its initial value', 'crashes the app'], a: 1, why: 'Rotation creates a new Activity object, and its fields start fresh.' },
          { q: 'When does <code>onCleared()</code> run?', options: ['On every rotation', 'When the Activity finishes for good', 'In <code>onPause</code>'], a: 1, why: 'The ViewModel is kept across configuration changes and cleared only when its owner is finished.' },
          { q: 'Should a ViewModel keep a reference to the Activity?', options: ['Yes, it makes Toasts easier', 'No. It outlives the Activity and would leak the old one after rotation.'], a: 1, why: 'After rotation the ViewModel would still point at the destroyed Activity, keeping it and its whole view tree in memory.' },
          { q: 'Two checkout steps, Address and Payment, each call <code>viewModel()</code> inside their own <code>composable&lt;…&gt;</code>. Address writes the address into its ViewModel. What does Payment see?', options: ['Nothing: each back stack entry is its own owner, so each gets its own ViewModel', 'The same address, because both live in the same Activity', 'A crash, because one ViewModel class can only be created once'], a: 0, why: 'A ViewModel lives in its <code>ViewModelStoreOwner</code>. To share, both screens must pass the parent graph’s entry as <code>viewModelStoreOwner</code>.' },
        ],
        deeper: [
          {
            title: 'viewModelScope: work that survives rotation',
            body: `<p>A ViewModel has its own coroutine scope, <code>viewModelScope</code>. Work launched there keeps running through a rotation, because the ViewModel does. When the ViewModel is cleared, the scope is cancelled, and every job in it stops.</p>
<p>Compare <code>lifecycleScope</code> in the Activity. It is cancelled in <code>onDestroy</code>, which happens on every rotation. A load started there is thrown away, and the new Activity starts it again from zero.</p>`,
            code: `class FeedViewModel(private val repo: FeedRepository) : ViewModel() {
    private val _state = MutableStateFlow<FeedState>(FeedState.Loading)
    val state: StateFlow<FeedState> = _state.asStateFlow()

    init {
        viewModelScope.launch {                       // survives rotation
            _state.value = FeedState.Ready(repo.loadFeed())
        }
    }
}

// In the Activity: cancelled on every rotation
lifecycleScope.launch { feed = repo.loadFeed() }`,
            visual(el) {
              el.classList.add('and-viz');
              let job = null, busy = false, actId = addr(), vmId = addr(), gen = 0;
              const { dev, view } = device();
              const fill = h('span', { class: 'and-d2-fill' });
              const pct = h('span', { class: 'and-v' }, '-');
              const jobTag = h('span', { class: 'and-perm' }, 'no job');
              const vmTag = h('span', { class: 'and-user' });
              const o = out();
              function screen(anim) {
                const done = job && job.state === 'done';
                view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar(`FeedActivity ${actId}`),
                  h('div', { class: 'and-kv' }, h('span', {}, 'loadFeed()'), pct), h('span', { class: 'and-d2-bar' }, fill),
                  ...(done ? bars(85, 70, 80, 60) : [h('span', { class: 'and-user' }, job ? 'loading…' : 'idle')])));
              }
              function paint() {
                const p = job ? job.p : 0;
                fill.style.width = p + '%'; pct.textContent = job ? p + '%' : '-';
                jobTag.textContent = job ? `${job.kind === 'vm' ? 'viewModelScope' : 'lifecycleScope'} · ${job.state}` : 'no job';
                jobTag.className = 'and-perm ' + (!job ? '' : job.state === 'done' ? 'and-ok' : job.state === 'cancelled' ? 'and-no' : 'and-d2-mid');
                vmTag.textContent = `FeedViewModel ${vmId}`;
              }
              async function loop(j) {
                while (el.isConnected && job === j && j.state === 'running') {
                  await sleep(130);
                  if (job !== j || j.state !== 'running') return;
                  j.p = Math.min(100, j.p + 4); paint();
                  if (j.p >= 100) { j.state = 'done'; paint(); screen(true); line(o, `<span class="good">loadFeed() returned</span> ${note('feed on screen')}`); }
                }
              }
              function start(kind) {
                if (busy) return;
                if (job && job.state === 'running') { replay(jobTag, 'shake'); say(o, `<span class="bad">already loading.</span> Rotate while it runs.`); return; }
                job = { kind, p: 0, state: 'running', id: ++gen };
                paint(); screen();
                say(o, `${hl(`${kind === 'vm' ? 'viewModelScope' : 'lifecycleScope'}.launch { loadFeed() }`)}  ${note('now rotate before it finishes')}`);
                loop(job);
              }
              async function rot() {
                if (busy) return; busy = true;
                say(o, note('rotate the phone'));
                await rotate(dev); if (!el.isConnected) return;
                line(o, `${hl('FeedActivity.onDestroy()')}  ${note('isChangingConfigurations = true')}`);
                if (job && job.kind === 'lc') {
                  const p = job.p, wasDone = job.state === 'done';
                  job.state = 'cancelled'; paint(); replay(jobTag, 'shake');
                  line(o, wasDone
                    ? `<span class="bad">result lost</span> ${note('it lived in a field of the old Activity')}`
                    : `<span class="bad">lifecycleScope cancelled</span> ${note(`load lost at ${p}%`)}`);
                } else if (job && job.state === 'running') {
                  line(o, `<span class="good">viewModelScope untouched</span> ${note(`load still running at ${job.p}%`)}`);
                }
                view.firstElementChild && view.firstElementChild.classList.add('leave');
                await sleep(420); if (!el.isConnected) return;
                actId = addr();
                if (job && job.kind === 'lc' && job.state === 'cancelled') {
                  job = { kind: 'lc', p: 0, state: 'running', id: ++gen };
                  line(o, `${hl('FeedActivity.onCreate()')}  ${note(`new Activity ${actId} launches loadFeed() again from 0%`)}`);
                  loop(job);
                } else line(o, `${hl('FeedActivity.onCreate()')}  ${note(`new Activity ${actId}, same FeedViewModel ${vmId}`)}`);
                paint(); screen(true);
                busy = false;
              }
              async function fin() {
                if (busy) return; busy = true;
                say(o, note('finish(): the user leaves the screen for good'));
                view.firstElementChild && view.firstElementChild.classList.add('leave');
                await sleep(400); if (!el.isConnected) return;
                view.replaceChildren(homeScreen());
                if (job && job.state === 'running') {
                  const p = job.p; job.state = 'cancelled'; paint(); replay(jobTag, 'shake');
                  line(o, `${hl('onCleared()')}  ${note(`${job.kind === 'vm' ? 'viewModelScope' : 'lifecycleScope'} cancelled at ${p}%: nobody needs the result`)}`);
                } else line(o, `${hl('onCleared()')}  ${note('nothing was running')}`);
                await sleep(1000); if (!el.isConnected) return;
                actId = addr(); vmId = addr(); job = null;
                line(o, note('open the screen again: new Activity, new ViewModel'));
                paint(); screen(true);
                busy = false;
              }
              paint(); screen();
              say(o, 'Start a load in one of the two scopes, then rotate before it finishes.');
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'job'), jobTag, vmTag)),
                h('div', { class: 'controls' }, cmd('viewModelScope.launch { loadFeed() }', () => start('vm')), cmd('lifecycleScope.launch { loadFeed() }', () => start('lc'))),
                h('div', { class: 'controls' }, cmd('rotate', rot), cmd('finish()', fin)),
                o);
            },
          },
          {
            title: 'The owner decides how long a ViewModel lives',
            body: `<p>A ViewModel lives exactly as long as its <code>ViewModelStoreOwner</code>. In a Compose app with Navigation, every back stack entry is an owner. <code>viewModel()</code> inside a destination gives that destination its own ViewModel, and popping the destination clears it, even though the Activity is still alive.</p>
<p>To share one ViewModel between the screens of a flow, such as the steps of a checkout, ask a parent graph's entry for it. It then lives as long as that graph is on the back stack, and is cleared when the last screen of the flow is popped.</p>`,
            code: `composable<Cart> {
    val vm: CartViewModel = viewModel()                     // scoped to this entry
}

navigation<Checkout>(startDestination = Address) {
    composable<Address> { entry ->
        val parent = remember(entry) { navController.getBackStackEntry<Checkout>() }
        val shared: CheckoutViewModel = viewModel(viewModelStoreOwner = parent)
    }
    composable<Payment> { entry ->
        val parent = remember(entry) { navController.getBackStackEntry<Checkout>() }
        val shared: CheckoutViewModel = viewModel(viewModelStoreOwner = parent)
    }
}`,
            visual(el) {
              el.classList.add('and-viz');
              let stack = [], busy = false;
              const col = h('div', { class: 'and-stack' });
              const o = out();
              const mkVm = name => ({ name, addr: addr() });
              const entry = (route, vm, opts = {}) => ({ route, vm, ...opts });
              function cardOf(e, top) {
                const vmText = e.vm ? `${e.vm.name} ${e.vm.addr}` : e.uses ? `uses ${e.uses.name} ${e.uses.addr}` : 'no ViewModel';
                return h('div', { class: 'and-card' + (top ? ' and-top' : '') + (e.graph ? ' and-d2-graph' : '') },
                  h('span', {}, e.graph ? `graph ${e.route}` : e.route), h('small', { class: 'and-d2-vmn' }, vmText));
              }
              function paint() { col.replaceChildren(...stack.map((e, i) => cardOf(e, i === stack.length - 1))); }
              const top = () => stack[stack.length - 1];
              const graphEntry = () => stack.find(e => e.graph);
              function nope(msg) { if (busy) return; replay(col, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); }
              function push(e, msg) {
                stack.push(e); paint(); replay(col.lastElementChild, 'drop-in');
                say(o, msg);
              }
              function cart() {
                if (busy) return;
                if (top().route === 'Cart') return nope('Cart is already on top.');
                if (graphEntry()) return nope('finish or leave the checkout first.');
                push(entry('Cart', mkVm('CartViewModel')), `${hl('navigate(Cart)')}  ${note('new entry, new CartViewModel')}`);
              }
              function address() {
                if (busy) return;
                if (graphEntry()) return nope('the checkout flow is already open.');
                const shared = mkVm('CheckoutViewModel');
                stack.push(entry('Checkout', shared, { graph: true }));
                push(entry('Address', null, { uses: shared }), `${hl('navigate(Checkout)')}  ${note(`graph entry holds CheckoutViewModel ${shared.addr}, Address uses it`)}`);
              }
              function payment() {
                if (busy) return;
                const g = graphEntry();
                if (!g || top().route !== 'Address') return nope('open the Address step first.');
                push(entry('Payment', null, { uses: g.vm }), `${hl('navigate(Payment)')}  ${note(`same CheckoutViewModel ${g.vm.addr}: the address is still there`)}`);
              }
              async function pop() {
                if (busy) return;
                if (stack.length === 1) return nope('Home is the start destination. Back here leaves the app.');
                busy = true;
                const e = stack.pop();
                col.lastElementChild.classList.add('leave');
                say(o, `${hl('popBackStack()')}  ${note(`pop ${e.route}`)}`);
                if (e.vm) line(o, `${hl(`${e.vm.name}.onCleared()`)}  ${note('its entry is gone')}`);
                else line(o, note(`${e.route} owned no ViewModel. The shared one lives on.`));
                await sleep(420); if (!el.isConnected) return;
                if (top().graph) {
                  const g = stack.pop(); paint();
                  col.lastElementChild && replay(col.lastElementChild, 'pop');
                  line(o, `${note(`graph ${g.route} has no screens left, so it is popped too`)}`);
                  line(o, `${hl(`${g.vm.name}.onCleared()`)}`);
                } else paint();
                busy = false;
              }
              stack = [entry('Home', mkVm('HomeViewModel'))];
              paint();
              say(o, 'One Activity the whole time. Each entry owns its ViewModels.');
              el.append(
                h('div', { class: 'stage and-nav' }, h('div', { class: 'and-stackbox' }, col, h('span', { class: 'and-lbl' }, 'back stack: newest on top')),
                  h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'MainActivity'), h('span', { class: 'and-perm and-ok' }, 'alive throughout'))),
                h('div', { class: 'controls' }, cmd('navigate(Cart)', cart), cmd('navigate(Checkout)', address), cmd('navigate(Payment)', payment), cmd('popBackStack()', pop)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>The ViewModel survives rotation without any special storage. While an Activity is destroyed for a configuration change, the framework asks it for <code>onRetainNonConfigurationInstance()</code>. <code>ComponentActivity</code> answers with an object that holds its <code>ViewModelStore</code>. The framework keeps that object in memory while it creates the new Activity, which reads it back through <code>getLastNonConfigurationInstance()</code>. Same process, same objects.</p>
<p><code>ComponentActivity</code> also observes its own <code>ON_DESTROY</code>. If <code>isChangingConfigurations</code> is false, the screen is really going away, so it calls <code>viewModelStore.clear()</code>. Each ViewModel then closes its closeables, including the scope behind <code>viewModelScope</code>, and runs <code>onCleared()</code>. Because all of this lives in memory, process death takes it with it.</p>`,
          code: `// Inside ComponentActivity, roughly
override fun onRetainNonConfigurationInstance(): Any =
    NonConfigurationInstances(viewModelStore)        // handed to the next instance

init {
    lifecycle.addObserver(LifecycleEventObserver { _, event ->
        if (event == Lifecycle.Event.ON_DESTROY && !isChangingConfigurations) {
            viewModelStore.clear()                   // cancels viewModelScope, calls onCleared()
        }
    })
}`,
        },
        mistakes: [
          {
            title: 'Exposing the mutable state',
            bad: `class CounterViewModel : ViewModel() {
    val count = MutableStateFlow(0)
}
// anywhere: vm.count.value = 99`,
            good: `class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()
    fun increment() = _count.update { it + 1 }
}`,
            why: 'With a public <code>MutableStateFlow</code>, any caller can write any value, and the ViewModel can no longer protect its rules. Expose a read-only <code>StateFlow</code> and named functions.',
          },
          {
            title: 'Loading in the Activity’s scope',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    lifecycleScope.launch { feed = repo.loadFeed() }   // again after every rotation
}`,
            good: `class FeedViewModel(repo: FeedRepository) : ViewModel() {
    val feed = flow { emit(repo.loadFeed()) }
        .stateIn(viewModelScope, SharingStarted.Lazily, null)
}`,
            why: 'The Activity’s scope is cancelled on every rotation, so the load starts over each time. Load in the ViewModel and the result is waiting for the new Activity.',
          },
          {
            title: 'Starting the load from composition',
            bad: `@Composable
fun FeedRoute(vm: FeedViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }   // runs again after rotation
    FeedScreen(vm.state.collectAsStateWithLifecycle().value)
}`,
            good: `class FeedViewModel(repo: FeedRepository) : ViewModel() {
    init { viewModelScope.launch { /* load once */ } }
}

@Composable
fun FeedRoute(vm: FeedViewModel = viewModel()) {
    FeedScreen(vm.state.collectAsStateWithLifecycle().value)
}`,
            why: 'Rotation builds a new composition, so <code>LaunchedEffect(Unit)</code> runs again and fetches data the ViewModel already has. Let the ViewModel start its own loading.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          let busy = false, actCount = 3, vmCount = 3, actId = addr(), vmId = addr();
          let actV, vmV, vmVal, vmCard, vmUser;
          const { dev, view } = device();
          const store = h('div', { class: 'and-store' });
          const o = out();
          function activityScreen(anim) {
            actV = h('span', { class: 'and-v' }, String(actCount));
            vmV = h('span', { class: 'and-v and-vm' }, String(vmCount));
            return h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') },
              appbar(`MainActivity ${actId}`),
              h('div', { class: 'and-kv' }, h('span', {}, 'activityCount'), actV),
              h('div', { class: 'and-kv' }, h('span', {}, 'viewModel.count'), vmV),
              bars(80, 60));
          }
          function fillStore(anim) {
            vmVal = h('b', {}, String(vmCount));
            vmUser = h('span', { class: 'and-user' }, `used by MainActivity ${actId}`);
            vmCard = h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
              h('span', { class: 'obj-name' }, 'CounterViewModel'),
              h('span', { class: 'field' }, 'count = ', vmVal),
              h('span', { class: 'obj-addr' }, vmId));
            store.replaceChildren(h('span', { class: 'and-lbl' }, 'ViewModelStore'), vmCard, vmUser);
          }
          const bump = () => {
            if (busy) return;
            vmCount++; vmV.textContent = vmVal.textContent = String(vmCount);
            replay(vmV, 'pop'); replay(vmCard, 'pop');
            say(o, `${hl('viewModel.increment()')}  ${note(`count = ${vmCount}, stored in the ViewModel`)}`);
          };
          const bumpAct = () => {
            if (busy) return;
            actCount++; actV.textContent = String(actCount); replay(actV, 'pop');
            say(o, `${hl('activityCount++')}  ${note(`${actCount}, stored in MainActivity ${actId}`)}`);
          };
          async function rot() {
            if (busy) return; busy = true;
            say(o, note('rotate the phone'));
            await rotate(dev);
            line(o, `${hl('onPause() onStop() onDestroy()')}  ${note('isChangingConfigurations = true')}`);
            view.firstElementChild.classList.add('leave');
            await sleep(450);
            view.replaceChildren(h('div', { class: 'and-scr' }));
            replay(vmCard, 'pop');
            line(o, `<span class="good">kept:</span> CounterViewModel ${vmId} stays in the store`);
            await sleep(600);
            actId = addr(); actCount = 0;
            view.replaceChildren(activityScreen(true));
            line(o, `${hl('onCreate()')}  ${note(`new MainActivity ${actId}, activityCount = 0`)}`);
            await sleep(500);
            vmUser.textContent = `used by MainActivity ${actId}`; replay(vmUser, 'pop-soft');
            replay(vmV, 'pop');
            line(o, `${hl('by viewModels()')}  ${note(`same CounterViewModel ${vmId}, count = ${vmCount}`)}`);
            busy = false;
          }
          async function finish() {
            if (busy) return; busy = true;
            say(o, note('finish(): the user is done with this screen'));
            view.firstElementChild.classList.add('leave');
            line(o, `${hl('onPause() onStop() onDestroy()')}  ${note('isChangingConfigurations = false')}`);
            await sleep(500);
            view.replaceChildren(homeScreen());
            vmCard.classList.add('leave');
            line(o, `${hl('onCleared()')}  ${note('nobody needs the ViewModel any more')}`);
            await sleep(500);
            store.replaceChildren(h('span', { class: 'and-lbl' }, 'ViewModelStore'), h('span', { class: 'and-empty drop-in' }, 'empty'));
            await sleep(900);
            line(o, note('open the app again'));
            actId = addr(); vmId = addr(); actCount = 0; vmCount = 0;
            view.replaceChildren(activityScreen(true));
            fillStore(true);
            line(o, `${hl('onCreate()')}  ${note(`new MainActivity ${actId}`)}`);
            line(o, `${hl('by viewModels()')}  ${note(`new CounterViewModel ${vmId}, count = 0`)}`);
            busy = false;
          }
          view.replaceChildren(activityScreen());
          fillStore();
          say(o, 'Both counters are at 3. Rotate and see which one keeps its value.');
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), store),
            h('div', { class: 'controls' },
              cmd('activityCount++', bumpAct), cmd('viewModel.increment()', bump), cmd('rotate', rot), cmd('finish()', finish)),
            o);
        },
        predict: {
          q: 'You rotate the phone. The new <code>MainActivity</code> calls <code>by viewModels()</code>. What does it get?',
          options: ['The same <code>CounterViewModel</code> object, at the same address', 'A copy of the old ViewModel with the same values', 'A fresh ViewModel with count = 0'],
          a: 0,
          why: 'The ViewModel lives in a <code>ViewModelStore</code> that Android keeps across the configuration change, so the new Activity is handed the very same object.',
        },
      },

      // 2b ────────────────────────────────────────────
      {
        id: 'resources',
        title: 'Resources and localization',
        tagline: 'Text and values live in res/, and Android picks the best folder for each phone.',
        level: 'beginner',
        body: `
<p>Text, colors, sizes and images live in <code>res/</code>, not in code. A folder name can carry <em>qualifiers</em>: <code>values-es/</code> holds Spanish strings, <code>values-night/</code> holds dark-theme values, <code>values-sw600dp/</code> holds values for screens at least 600 dp wide. At runtime Android picks the best match for the current configuration, and falls back to the plain <code>values/</code> folder.</p>
<p>That fallback is why <code>values/strings.xml</code> must hold every string. A translation may skip some, the default may not. A missing default means a crash on a phone set to a language you don't ship.</p>
<p>Counts need <code>&lt;plurals&gt;</code>, because languages split numbers differently. English has one and other. Arabic has six forms, and it reads right to left, so the whole layout mirrors. Change the phone below and watch which folder wins each value.</p>`,
        code: `<!-- res/values/strings.xml: the default, must have every string -->
<resources>
    <string name="title">News</string>
    <plurals name="new_articles">
        <item quantity="one">%d new article</item>
        <item quantity="other">%d new articles</item>
    </plurals>
</resources>

<!-- res/values-es/strings.xml -->
<resources>
    <string name="title">Noticias</string>
    <plurals name="new_articles">
        <item quantity="one">%d noticia nueva</item>
        <item quantity="other">%d noticias nuevas</item>
    </plurals>
</resources>

// Compose: the first count picks the form, the second fills %d
@Composable
fun Header(count: Int) {
    Text(stringResource(R.string.title))
    Text(pluralStringResource(R.plurals.new_articles, count, count))
}`,
        remember: 'values/ has every string; qualified folders override some. Counts use plurals, and the count goes in twice.',
        terms: [
          { term: 'Resource qualifier', def: 'A suffix on a res/ folder name, like -es, -night or -sw600dp, that says which configuration the folder is for.' },
          { term: 'Default resources', def: 'The folders without qualifiers, like values/. Android falls back to them, so they must contain every resource.' },
          { term: 'Plurals', def: 'A string resource with one item per quantity category (zero, one, two, few, many, other) that Android picks by the count and the language.' },
          { term: 'Per-app language', def: 'A language the user picks for one app, separate from the system language. Built into system settings since Android 13.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give English the two forms every language needs.', code: '<plurals name="comments">\n    <item quantity="[[one]]">%d comment</item>\n    <item quantity="[[other]]">%d comments</item>\n</plurals>', why: 'Always supply <code>one</code> and <code>other</code>. Translators add the extra categories their language needs.' },
          { type: 'bug', prompt: 'The app crashes with <code>Resources.NotFoundException</code> on a phone set to German. Tap the line.', code: 'res/\n    values-en/strings.xml      (every string)\n    values-es/strings.xml\n    values-night/colors.xml', bug: 1, fix: '    values/strings.xml         (every string)', why: 'German matches neither <code>-en</code> nor <code>-es</code>, and there is no unqualified <code>values/</code> to fall back to. Put the full set in <code>values/</code>.' },
        ],
        quiz: [
          { q: 'The app has <code>values/</code> and <code>values-es/</code>. The phone is set to German. Which strings show?', options: ['From <code>values-es/</code>', 'From <code>values/</code>', 'None: the app crashes'], a: 1, why: 'No folder matches German, so Android uses the default folder.' },
          { q: 'Which folder holds Spanish values for dark theme?', options: ['<code>values-night-es</code>', '<code>values-es-night</code>', 'Both work'], a: 1, why: 'Qualifiers must follow the order of the qualifier table, and language comes before night mode. A folder in the wrong order is ignored.' },
          { q: 'What does Kotlin’s <code>"bilgi".uppercase()</code> return on a Turkish phone?', options: ['<code>BILGI</code>', '<code>BİLGİ</code>', 'It depends on the app language'], a: 0, why: 'The no-argument <code>uppercase()</code> uses the invariant locale on every phone. For Turkish display text, pass a Turkish <code>Locale</code>.' },
          { q: 'A Java library calls <code>"title".toUpperCase()</code> to build a map key. On a phone set to Turkish the lookup fails. Why?', options: ['Java strings cannot hold Turkish letters', '<code>toUpperCase()</code> with no argument uses the phone’s default locale, so the key becomes <code>TİTLE</code>', 'It uses the invariant locale, which has no capital I'], a: 1, why: 'Java’s no-argument call follows the device locale. Kotlin’s <code>uppercase()</code> uses the invariant locale, which is what keys need.' },
          { q: 'A Compose app on <code>ComponentActivity</code> calls <code>AppCompatDelegate.setApplicationLocales()</code> from an in-app language picker. Nothing changes. What is the fix?', options: ['Make the Activity extend <code>AppCompatActivity</code>', 'Call <code>recreate()</code> right after it', 'Add a <code>values-es</code> folder for every screen'], a: 0, why: 'The call only takes effect through AppCompat, so a Compose host must be an <code>AppCompatActivity</code>. It then recreates the Activity itself.' },
        ],
        deeper: [
          {
            title: 'The Turkish dotted i',
            body: `<p>Turkish has two letter i's: dotted <code>i İ</code> and dotless <code>ı I</code>. So the uppercase of <code>i</code> is <code>İ</code> in Turkish and <code>I</code> everywhere else. Case conversion depends on a locale, and the bug is using the wrong one.</p>
<p>Kotlin's <code>uppercase()</code> and <code>lowercase()</code> without an argument use the invariant locale: the same on every phone. That is right for keys, ids and enum names, but wrong for Turkish text you show. Pass a locale there: <code>uppercase(Locale.forLanguageTag("tr"))</code>. Java's <code>toUpperCase()</code> without an argument is the opposite trap: it uses the phone's default locale, so on a Turkish phone <code>"title"</code> becomes <code>"TİTLE"</code> and a key lookup fails.</p>`,
            code: `val tr = Locale.forLanguageTag("tr")

// Text the user reads: use the language of the text
"bilgi".uppercase(tr)           // "BİLGİ" (Turkish for "info")
"bilgi".uppercase()             // "BILGI": wrong for a Turkish headline

// Keys, ids, enum names: invariant, the same on every phone
Category.valueOf(raw.uppercase())  // "sport" -> SPORT on every phone

// Java code, or Java libraries, without a Locale use the phone's default:
// on a Turkish phone "title".toUpperCase() == "TİTLE" and "ID".toLowerCase() == "ıd"`,
            visual(el) {
              el.classList.add('and-viz');
              const WORDS = [
                { w: 'bilgi', op: 'up', use: 'headline shown to a Turkish reader', want: 'BİLGİ' },
                { w: 'title', op: 'up', use: 'key compared with "TITLE"', want: 'TITLE' },
                { w: 'ID', op: 'low', use: 'key compared with "id"', want: 'id' },
              ];
              let word = WORDS[0], phone = 'tr';
              const conv = (s, op, loc) => (op === 'up' ? s.toLocaleUpperCase(loc) : s.toLocaleLowerCase(loc));
              const fn = op => (op === 'up' ? 'uppercase' : 'lowercase');
              const jfn = op => (op === 'up' ? 'toUpperCase' : 'toLowerCase');
              const rows = [0, 1, 2].map(() => { const res = h('span', { class: 'and-res' }); const lbl = h('span', {}); const r = h('div', { class: 'and-step' }, lbl, res); r.res = res; r.lbl = lbl; return r; });
              const useEl = h('span', { class: 'and-perm' });
              const o = out();
              function paint() {
                const calls = [
                  [`"${word.w}".${fn(word.op)}()`, conv(word.w, word.op, 'en'), 'Kotlin: invariant locale'],
                  [`"${word.w}".${fn(word.op)}(tr)`, conv(word.w, word.op, 'tr'), 'Kotlin: Turkish rules'],
                  [`"${word.w}".${jfn(word.op)}()  // Java`, conv(word.w, word.op, phone), `Java: phone default (${phone === 'tr' ? 'tr-TR' : 'en-US'})`],
                ];
                calls.forEach(([src, res], i) => {
                  const ok = res === word.want;
                  rows[i].lbl.innerHTML = hl(src);
                  rows[i].res.textContent = `"${res}" ${ok ? '✓' : '✗'}`;
                  rows[i].res.className = 'and-res ' + (ok ? 'and-ok' : 'and-no');
                  rows[i].className = 'and-step' + (ok ? '' : ' and-on');
                });
                useEl.textContent = `want "${word.want}": ${word.use}`;
                wBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(WORDS[i] === word)));
                pBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === phone)));
                say(o, note(word.op === 'up' && word.w === 'bilgi'
                  ? 'display text: only the explicit Turkish locale gets the dotted İ'
                  : `key: the invariant call is right everywhere. ${phone === 'tr' ? 'The Java call breaks on a Turkish phone.' : 'Switch the phone to Turkish and watch the Java call.'}`));
              }
              const wBtns = WORDS.map(x => cmd(`"${x.w}"`, () => { word = x; paint(); }));
              const pBtns = [['en', 'phone: English'], ['tr', 'phone: Turkish']].map(([p, label]) => { const b = cmd(label, () => { phone = p; paint(); }); b.dataset.p = p; return b; });
              el.append(
                h('div', { class: 'controls' }, wBtns),
                h('div', { class: 'controls' }, pBtns),
                h('div', { class: 'stage' }, h('div', { class: 'and-rs-words' }, useEl, rows)),
                o);
              paint();
            },
          },
          {
            title: 'Per-app language',
            body: `<p>Since Android 13, users can pick a language for one app in system settings. Your app shows up there only if it declares its languages. With Android Studio Giraffe and AGP 8.1 or newer, turn on <code>generateLocaleConfig</code> and name the default in <code>res/resources.properties</code>. Otherwise write <code>res/xml/locale_config.xml</code> by hand and point <code>android:localeConfig</code> at it.</p>
<p>For an in-app language picker, call <code>AppCompatDelegate.setApplicationLocales()</code>. With AppCompat 1.6.0 or newer it also works on Android 12 and lower, where you add the <code>autoStoreLocales</code> service so AndroidX remembers the choice. The call recreates the Activity. In a Compose app the Activity must extend <code>AppCompatActivity</code>, or it does nothing.</p>`,
            code: `// app/build.gradle.kts
android {
    androidResources { generateLocaleConfig = true }
}
// app/src/main/res/resources.properties
// unqualifiedResLocale=en-US

class MainActivity : AppCompatActivity()     // needed for setApplicationLocales with Compose

fun setAppLanguage(tag: String) {            // "es", "en", ...
    AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(tag))
}

fun followSystemLanguage() {
    AppCompatDelegate.setApplicationLocales(LocaleListCompat.getEmptyLocaleList())
}`,
          },
          {
            title: 'Right-to-left layouts',
            body: `<p>Arabic, Hebrew, Persian and Urdu read right to left. With <code>android:supportsRtl="true"</code> in the manifest, the layout mirrors: in Compose a <code>Row</code> starts on the right and <code>padding(start = …)</code> becomes right padding, all from <code>LocalLayoutDirection</code>.</p>
<p>Your part is to say <em>start</em> and <em>end</em>, never left and right, and to use auto-mirrored icons for anything with a direction, like a back arrow. Check it with a preview in an RTL locale.</p>`,
            code: `Row(Modifier.padding(start = 16.dp)) {      // right side in Arabic
    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back))
    Text(stringResource(R.string.title))
}

@Preview(locale = "ar")
@Composable
fun HeaderRtlPreview() = Header(count = 3)`,
          },
        ],
        underHood: {
          body: `<p>At build time AAPT2 compiles every value from every folder into one table, <code>resources.arsc</code>, and gives each resource a single id in <code>R</code>, like <code>R.string.title</code>. The id doesn't know about folders. Each table entry lists one value per configuration.</p>
<p>At lookup time, <code>Resources</code> asks the <code>AssetManager</code> for the value of that id in the current <code>Configuration</code>. It drops the folders that contradict the phone, then goes through the qualifiers in table order, so language outranks night mode. When the configuration changes, the Activity is recreated by default and the lookups run again with the new configuration.</p>`,
          code: `// One id, many values
// R.string.title  ->  values/        "News"
//                     values-es/     "Noticias"
//                     values-ar/     "الأخبار"
//
// Qualifier order matters: values-es-night is read, values-night-es is ignored`,
        },
        mistakes: [
          {
            title: 'Building sentences with +',
            bad: `Text("You have " + count + " new articles")`,
            good: `Text(pluralStringResource(R.plurals.new_articles, count, count))`,
            why: 'The text can’t be translated, word order differs between languages, and "1 new articles" is wrong even in English.',
          },
          {
            title: 'Left and right instead of start and end',
            bad: `Icon(Icons.Filled.ArrowBack, contentDescription = null)
Text(text, Modifier.absolutePadding(left = 16.dp))   // never flips`,
            good: `Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
Text(text, Modifier.padding(start = 16.dp))`,
            why: 'In Arabic the back arrow must point right and the padding must sit on the right. Start, end and auto-mirrored icons flip by themselves.',
          },
          {
            title: 'Uppercasing Turkish text without a locale',
            bad: `Text(headline.uppercase())   // "bilgi" -> "BILGI"`,
            good: `Text(headline.uppercase(Locale.forLanguageTag("tr")))   // "BİLGİ"`,
            why: 'The no-argument call uses the invariant locale. It is fine for keys, but Turkish readers see a misspelled word.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const STR = {
            en: { title: 'News', forms: { one: '%d new article', other: '%d new articles' } },
            es: { title: 'Noticias', forms: { one: '%d noticia nueva', other: '%d noticias nuevas' } },
            ar: { title: 'الأخبار', forms: { zero: 'لا توجد مقالات جديدة', one: 'مقال جديد واحد', two: 'مقالان جديدان', few: '%d مقالات جديدة', many: '%d مقالًا جديدًا', other: '%d مقال جديد' } },
          };
          const COUNTS = [0, 1, 2, 3, 11, 100];
          let lang = 'en', night = false, wide = false, ci = 1;
          const { dev, view } = device();
          const dirs = {};
          const dir = (name) => (dirs[name] = h('div', { class: 'and-rs-dir' }, h('span', {}, name + '/'), h('small', {})));
          const tree = h('div', { class: 'and-rs-tree' }, h('span', { class: 'and-lbl' }, 'res/'), dir('values'), dir('values-es'), dir('values-ar'), dir('values-night'), dir('values-sw600dp'));
          const o = out();
          const cat = (l, n) => { try { return new Intl.PluralRules(l).select(n); } catch (e) { return n === 1 ? 'one' : 'other'; } };
          function paint() {
            const n = COUNTS[ci];
            const S = STR[lang];
            const q = cat(lang, n);
            const form = S.forms[q] || S.forms.other;
            const strFrom = lang === 'en' ? 'values' : 'values-' + lang;
            const colorFrom = night ? 'values-night' : 'values';
            const colsFrom = wide ? 'values-sw600dp' : 'values';
            const got = { values: [], 'values-es': [], 'values-ar': [], 'values-night': [], 'values-sw600dp': [] };
            got[strFrom].push('title', 'new_articles');
            got[colorFrom].push('background');
            got[colsFrom].push('columns');
            const match = { values: true, 'values-es': lang === 'es', 'values-ar': lang === 'ar', 'values-night': night, 'values-sw600dp': wide };
            Object.entries(dirs).forEach(([k, d]) => {
              d.className = 'and-rs-dir' + (got[k].length ? ' and-on' : match[k] ? '' : ' and-miss');
              d.lastChild.textContent = got[k].length ? got[k].join(', ') : match[k] ? 'matches, nothing left to give' : 'does not match';
            });
            dev.className = 'and-dev' + (wide ? ' and-rs-tab' : '') + (night ? ' and-rs-night' : '');
            const rtl = lang === 'ar';
            const scr = h('div', { class: 'and-scr', dir: rtl ? 'rtl' : 'ltr' },
              appbar(`${rtl ? '→' : '←'} ${S.title}`),
              h('span', { class: 'and-rs-count' }, form.replace('%d', n)),
              h('span', { class: 'and-rs-q', dir: 'ltr' }, `quantity="${q}"`),
              h('div', { class: 'and-rs-grid' + (wide ? ' and-rs-two' : '') }, Array.from({ length: 4 }, () => h('span', { class: 'and-rs-item' }))));
            view.replaceChildren(scr);
            replay(view, 'pop-soft');
            lBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === lang)));
            nBtn.setAttribute('aria-pressed', String(night));
            wBtn.setAttribute('aria-pressed', String(wide));
            cBtn.innerHTML = hl(`count = ${n}`);
          }
          function explain(msg) { say(o, msg); }
          const lBtns = [['en', 'English'], ['es', 'Español'], ['ar', 'العربية']].map(([l, label]) => {
            const b = cmd(`language: ${label}`, () => { lang = l; paint(); explain(l === 'en' ? note('no values-en folder: English comes from the default values/') : l === 'es' ? note('values-es wins for strings. Spanish, like English, has one and other: "1 noticia nueva", "3 noticias nuevas".') : note('values-ar wins, the layout mirrors right to left, and Arabic plurals have six forms')); });
            b.dataset.l = l; return b;
          });
          const nBtn = cmd('dark theme', () => { night = !night; paint(); explain(note(night ? 'values-night supplies the background color. Strings still come from the language folder.' : 'back to values/ for colors')); });
          const wBtn = cmd('tablet (sw ≥ 600dp)', () => { wide = !wide; paint(); explain(note(wide ? 'values-sw600dp supplies columns = 2' : 'phone: columns = 1 from values/')); });
          const cBtn = cmd('', () => { ci = (ci + 1) % COUNTS.length; paint(); explain(`${hl(`pluralStringResource(R.plurals.new_articles, ${COUNTS[ci]}, ${COUNTS[ci]})`)}  ${note(`category "${cat(lang, COUNTS[ci])}" in ${lang}`)}`); });
          paint();
          explain(note('An English phone. Every value comes from the default folder.'));
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), tree),
            h('div', { class: 'controls' }, lBtns),
            h('div', { class: 'controls' }, nBtn, wBtn, cBtn),
            o);
        },
        predict: {
          q: 'The phone is set to Arabic and the count is 2. Which <code>&lt;plurals&gt;</code> quantity does Android pick?',
          options: ['<code>other</code>', '<code>two</code>', '<code>few</code>'],
          a: 1,
          why: 'Arabic has six plural categories: zero, one, two, few, many and other. The number 2 has its own form, so <code>values-ar</code> must supply it.',
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'savedstate',
        title: 'Process death and saved state',
        tagline: 'What survives when Android kills your app in the background.',
        body: `
<p>When your app sits in the background and the phone needs memory, Android can kill the whole process. No callback runs first. When the user comes back, Android starts a new process and recreates the Activity, and the user expects the screen exactly as they left it.</p>
<p>Everything in memory is gone, ViewModels included. What survives is a small saved-state <code>Bundle</code> that the system kept for you. Reach it with <code>SavedStateHandle</code> inside a ViewModel, or with <code>rememberSaveable</code> in Compose. Both survive rotation too.</p>
<p>Keep saved state small: an id, a search query, a selected tab. Reload big data from a database or the network. If the user swipes the app away from Recents, they closed it, so the saved state is thrown away as well.</p>`,
        code: `class SearchViewModel(private val state: SavedStateHandle) : ViewModel() {
    var results: List<Item> = emptyList()      // survives rotation only

    val query: StateFlow<String> = state.getStateFlow("query", "")   // survives process death too
    fun onQuery(text: String) { state["query"] = text }
}

@Composable
fun SearchBox() {
    var expanded by remember { mutableStateOf(false) }       // lost on rotation
    var draft by rememberSaveable { mutableStateOf("") }     // saved in the Bundle
}

// Test it: send the app to the background, then run
// adb shell am kill com.example.app      and open the app again`,
        remember: 'Rotation keeps the ViewModel. Process death keeps only the Bundle: SavedStateHandle and rememberSaveable.',
        level: 'intermediate',
        terms: [
          { term: 'Process death', def: 'When Android kills a background app’s process to free memory, without calling any lifecycle method first.' },
          { term: 'SavedStateHandle', def: 'A key-value map passed to a ViewModel that is saved in the instance state Bundle and restored after process death.' },
          { term: 'TransactionTooLargeException', def: 'Thrown when a Bundle sent through Binder, such as saved state, goes over the size limit of about 1 MB.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read and write the title through the saved state.', code: 'class EditorViewModel(private val state: [[SavedStateHandle]]) : ViewModel() {\n    val title = state.[[getStateFlow]]("title", "")\n    fun onTitle(text: String) = state.[[set]]("title", text)\n}', why: 'The handle is saved with the instance state, so the title comes back after rotation and after process death.' },
          { type: 'bug', prompt: 'This app can crash when it goes to the background. Tap the line.', code: 'class FeedViewModel(\n    private val state: SavedStateHandle,\n    private val repo: FeedRepository,\n) : ViewModel() {\n    fun onLoaded(posts: List<Post>) {\n        state["posts"] = posts\n    }\n    fun onScrolled(index: Int) { state["scroll"] = index }\n}', bug: 5, fix: '        // keep posts in the repository; save only small keys like scroll', why: 'A full feed in saved state can pass the Bundle limit and throw <code>TransactionTooLargeException</code>. Save small keys and reload data.' },
        ],
        quiz: [
          { q: 'The process is killed in the background and the user returns. A plain ViewModel property is', options: ['restored', 'lost: a new ViewModel is created', 'restored if it is a StateFlow'], a: 1, why: 'The ViewModel lived in the old process memory. Only what went into the saved-state Bundle comes back.' },
          { q: 'Which one survives both rotation and process death?', options: ['<code>remember { }</code>', 'a ViewModel property', '<code>rememberSaveable { }</code>'], a: 2, why: '<code>rememberSaveable</code> writes its value into the saved-state Bundle.' },
          { q: 'Should you put a list of 5,000 products into <code>SavedStateHandle</code>?', options: ['Yes, that is what it is for', 'No. Save an id or a query and reload the data.'], a: 1, why: 'The Bundle travels through Binder with a limit of about 1 MB. Too much data throws <code>TransactionTooLargeException</code>.' },
          { q: 'A user types a search query, then swipes the app away from Recents and opens it again. What does <code>state.getStateFlow("query", "")</code> hold?', options: ['An empty string, because the user closed the app and the Bundle was thrown away', 'The query they typed, from the saved Bundle', 'The last query written to disk by the ViewModel'], a: 0, why: 'Saved state only covers kills the user did not choose. Swiping away from Recents, Force stop or <code>finish()</code> start fresh with no Bundle.' },
          { q: '<code>data class PriceRange(val from: Int, val to: Int)</code> is not Parcelable. What happens with <code>rememberSaveable { mutableStateOf(PriceRange(0, 100)) }</code>?', options: ['It is silently dropped on process death', 'It works, because data classes are saved field by field', 'It throws <code>IllegalArgumentException</code> the first time the screen draws'], a: 2, why: 'rememberSaveable checks the value can go into a Bundle when it registers. Add <code>@Parcelize</code> or pass a Saver such as a <code>listSaver</code>.' },
        ],
        deeper: [
          {
            title: 'The Bundle is a snapshot taken on the way out',
            body: `<p>Android does not watch your state all the time. It asks for it once, in <code>onSaveInstanceState</code>, when the Activity stops. For apps targeting Android 9 and later that call comes right after <code>onStop</code>. Whatever the handle holds at that moment goes into the Bundle.</p>
<p>A kill can only happen to a stopped app, so the snapshot is always there first. Type a few letters, leave, then kill the process and come back.</p>`,
            visual(el) {
              el.classList.add('and-viz');
              const WORD = 'kotlin flow';
              let query = 'ko', saved = null, phase = 'front', pid = 4127, busy = false;
              const { dev, view, dim } = device();
              const pidEl = h('span', { class: 'and-pid' }, `process ${pid}`);
              const phaseEl = h('span', { class: 'and-perm and-ok' }, 'RESUMED');
              const bVal = h('b', {}, 'null');
              const bObj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'saved Bundle'), h('span', { class: 'field' }, 'query = ', bVal), h('span', { class: 'obj-addr' }, 'held by the system, outside your process'));
              const o = out();
              const screen = anim => view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar('Search'),
                h('div', { class: 'and-field' + (query ? '' : ' and-blank') }, query || 'Search…'), bars(85, 60, 70)));
              const paintBundle = () => { bVal.textContent = saved == null ? 'null' : `"${saved}"`; replay(bObj, 'pop'); };
              const setPhase = (text, kind) => { phaseEl.textContent = text; phaseEl.className = 'and-perm' + (kind ? ' and-' + kind : ''); replay(phaseEl, 'pop-soft'); };
              const nope = msg => { replay(dev, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); };
              function type() {
                if (busy) return;
                if (phase !== 'front') return nope('the app is not on screen. Open it first.');
                query = query.length >= WORD.length ? 'k' : WORD.slice(0, query.length + 1);
                screen();
                say(o, `${hl(`onQuery("${query}")`)}  ${note('in memory. The Bundle still says ' + (saved == null ? 'null' : `"${saved}"`))}`);
              }
              async function home() {
                if (busy) return;
                if (phase !== 'front') return nope('the app is already in the background.');
                busy = true;
                say(o, note('press Home'));
                for (const c of ['onPause()', 'onStop()']) { line(o, hl(c)); await sleep(380); }
                dim.classList.add('and-on');
                saved = query; paintBundle();
                line(o, `${hl('onSaveInstanceState(outState)')}  ${note(`snapshot: query = "${query}"`)}`);
                await sleep(380);
                dim.classList.remove('and-on');
                view.replaceChildren(homeScreen());
                phase = 'bg'; setPhase('STOPPED', '');
                busy = false;
              }
              async function kill() {
                if (busy) return;
                if (phase === 'front') return nope('the app in front is the last one Android kills. Press Home first.');
                if (phase === 'dead') return nope('the process is already gone.');
                busy = true;
                phase = 'dead'; pidEl.classList.add('and-dead'); replay(pidEl, 'shake'); setPhase('no process', 'no');
                say(o, `${note(`low memory: process ${pid} is killed. No callback runs.`)}`);
                await sleep(500);
                line(o, `<span class="good">safe:</span> the Bundle lives in the system, not in the dead process`);
                replay(bObj, 'pop');
                busy = false;
              }
              async function open() {
                if (busy) return;
                if (phase === 'front') return nope('the app is already in front.');
                busy = true;
                if (phase === 'bg') {
                  say(o, `${hl('onRestart() onStart() onResume()')}  ${note('same process: memory was never lost')}`);
                } else {
                  pid = 4128 + Math.floor(Math.random() * 3000);
                  pidEl.className = 'and-pid'; pidEl.textContent = `process ${pid}`; replay(pidEl, 'drop-in');
                  say(o, note(`new process ${pid}`));
                  await sleep(400);
                  query = saved || '';
                  line(o, `${hl('onCreate(savedInstanceState)')}  ${note(`Bundle is not null: query = "${query}"`)}`);
                }
                screen(true);
                phase = 'front'; setPhase('RESUMED', 'ok');
                busy = false;
              }
              screen();
              say(o, `${hl('onCreate(savedInstanceState = null)')}  ${note('first launch: nothing to restore')}`);
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-col' }, dev, phaseEl), h('div', { class: 'and-bundle' }, h('div', { class: 'and-proc' }, pidEl), bObj)),
                h('div', { class: 'controls' }, cmd('type a letter', type), cmd('press Home', home), cmd('system kills process', kill), cmd('open from Recents', open)),
                o);
            },
          },
          {
            title: 'Only the system’s kill keeps the Bundle',
            body: `<p>Saved state exists for one promise: if the user did not choose to leave, the screen comes back as they left it. When the user does choose to leave, Android throws the Bundle away.</p>
<p>Swiping the app out of Recents, Force stop, or a <code>finish()</code> all mean the user is done. The next launch starts fresh with <code>savedInstanceState == null</code>. A finishing Activity doesn’t even get <code>onSaveInstanceState</code>. Anything that must outlive those belongs in a database or DataStore.</p>`,
            visual(el) {
              el.classList.add('and-viz');
              const WAYS = [
                { label: 'system kills it in the background', keep: true, why: 'The user never chose to leave. The task stays in Recents with its Bundle.' },
                { label: 'user swipes it out of Recents', keep: false, why: 'Removing the task says “I am done”. Its saved state goes with it.' },
                { label: 'user taps Force stop in Settings', keep: false, why: 'Force stop clears the app’s tasks. Nothing is restored.' },
                { label: 'finish(), or Back on a screen you pushed', keep: false, why: 'A finishing Activity is not coming back, so onSaveInstanceState never runs for it.' },
              ];
              let busy = false;
              const { dev, view } = device();
              const bVal = h('b', {}, '"kotlin"');
              const bObj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'saved Bundle'), h('span', { class: 'field' }, 'query = ', bVal));
              const o = out('The user searched for "kotlin" and left the app. Pick how it ends.');
              const screen = (q, anim) => view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar('Search'),
                h('div', { class: 'and-field' + (q ? '' : ' and-blank') }, q || 'Search…'), bars(85, 60, 70)));
              const rows = WAYS.map(w => {
                const res = h('span', { class: 'and-res' }, '?');
                const btn = cmd(w.label, () => run(w));
                const row = h('div', { class: 'and-way' }, btn, res);
                return Object.assign(w, { res, row });
              });
              async function run(w) {
                if (busy) return; busy = true;
                rows.forEach(r => r.row.classList.remove('and-on'));
                w.row.classList.add('and-on');
                bObj.classList.remove('and-gone'); bVal.textContent = '"kotlin"';
                view.replaceChildren(homeScreen());
                say(o, note(w.label));
                await sleep(500);
                if (!w.keep) { bObj.classList.add('and-gone'); bVal.textContent = 'discarded'; replay(bObj, 'shake'); }
                else replay(bObj, 'pop');
                line(o, w.why);
                await sleep(700);
                if (!el.isConnected) return;
                line(o, `${hl(`onCreate(savedInstanceState = ${w.keep ? 'Bundle' : 'null'})`)}  ${note(w.keep ? 'query restored' : 'fresh start')}`);
                screen(w.keep ? 'kotlin' : '', true);
                w.res.textContent = w.keep ? '✓ restored' : '✗ fresh';
                w.res.className = 'and-res ' + (w.keep ? 'and-ok' : 'and-no');
                replay(w.res, 'pop');
                busy = false;
              }
              screen('kotlin');
              el.append(
                h('div', { class: 'stage' }, dev, h('div', { class: 'and-bundle' }, bObj)),
                h('div', { class: 'and-ways' }, rows.map(r => r.row)),
                o);
            },
          },
          {
            title: 'Your own types need a way into the Bundle',
            body: `<p>A Bundle holds primitives, Strings, Parcelables, Serializables and lists of those. <code>SavedStateHandle</code> has the same rules. For your own class, add <code>@Parcelize</code> from the <code>kotlin-parcelize</code> plugin.</p>
<p><code>rememberSaveable</code> needs the same, or a <code>Saver</code> that turns the value into something a Bundle can hold. Without one, <code>rememberSaveable</code> throws <code>IllegalArgumentException</code> as soon as it remembers a plain class, because it checks that the value can be saved when it registers. So a missing Saver crashes the screen the first time it draws.</p>`,
            code: `@Parcelize
data class Filters(val minPrice: Int, val inStock: Boolean) : Parcelable

class ShopViewModel(state: SavedStateHandle) : ViewModel() {
    val filters = state.getStateFlow("filters", Filters(0, false))   // Parcelable: fine
}

data class PriceRange(val from: Int, val to: Int)   // not Parcelable
val PriceRangeSaver = listSaver<PriceRange, Int>(
    save = { listOf(it.from, it.to) },
    restore = { PriceRange(it[0], it[1]) },
)

@Composable
fun PriceSlider() {
    var range by rememberSaveable(stateSaver = PriceRangeSaver) { mutableStateOf(PriceRange(0, 100)) }
}`,
          },
        ],
        underHood: {
          body: `<p><code>ComponentActivity</code> owns a <code>SavedStateRegistry</code>. Anything that wants to be saved registers a provider under a key. In <code>onSaveInstanceState</code> the registry asks each provider for a Bundle and nests them all under their keys in <code>outState</code>.</p>
<p><code>SavedStateHandle</code> is one of those providers, with one entry per ViewModel. <code>rememberSaveable</code> writes into Compose’s <code>SaveableStateRegistry</code>, which <code>setContent</code> wires into the same registry. Android then sends the finished Bundle over Binder to <code>system_server</code>, which stores it with the Activity’s record in the task. That is why it outlives your process, and why the Binder size limit applies to it.</p>`,
          code: `// Roughly what SavedStateHandle does for you
savedStateRegistry.registerSavedStateProvider("search") {
    bundleOf("query" to query)              // asked once, in onSaveInstanceState
}

// After process death, in the new instance:
val restored = savedStateRegistry.consumeRestoredStateForKey("search")
query = restored?.getString("query").orEmpty()`,
        },
        mistakes: [
          {
            title: 'Saving in onCleared()',
            bad: `override fun onCleared() {
    draftStore.save(draft)   // never runs on process death
}`,
            good: `fun onDraftChanged(text: String) {
    state["draft"] = text                         // small: in the Bundle
    viewModelScope.launch { draftStore.save(text) } // durable: on disk
}`,
            why: 'Process death runs no callback at all, so <code>onCleared</code> and <code>onDestroy</code> never get their chance. Save as the value changes.',
          },
          {
            title: 'Reading the handle once, then writing to a local copy',
            bad: `var query = state.get<String>("query") ?: ""
fun onQuery(text: String) { query = text }`,
            good: `val query = state.getStateFlow("query", "")
fun onQuery(text: String) { state["query"] = text }`,
            why: 'The first death restores fine. After that, new values only live in the local <code>var</code>, so the next death loses them.',
          },
          {
            title: 'Testing process death with Don’t keep activities',
            bad: `// Developer options › Don't keep activities: on
// leave the app, come back: looks fine`,
            good: `// Leave the app with Home, then:
// adb shell am kill com.example.app
// and reopen it from Recents`,
            why: 'That option destroys Activities but keeps the process, so singletons and in-memory caches survive and hide bugs. <code>am kill</code> ends the process like the system does.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const rows = [
            { name: 'var count', where: 'field in the Activity', rot: false, death: false },
            { name: 'remember { }', where: 'Compose state', rot: false, death: false },
            { name: 'ViewModel', where: 'a plain property', rot: true, death: false },
            { name: 'SavedStateHandle', where: 'inside the ViewModel', rot: true, death: true },
            { name: 'rememberSaveable { }', where: 'Compose, in the Bundle', rot: true, death: true },
          ];
          let pid = 4127, busy = false;
          const hd = text => h('div', { class: 'and-hd' }, text);
          const hdRot = hd('rotate'), hdDeath = hd('process death');
          const grid = h('div', { class: 'and-mx' }, hd('holder'), hd('value'), hdRot, hdDeath);
          for (const r of rows) {
            r.v = 3;
            r.val = h('div', { class: 'and-val' }, '3');
            r.cells = { rot: h('div', { class: 'and-q' }, '?'), death: h('div', { class: 'and-q' }, '?') };
            grid.append(h('div', { class: 'and-who' }, h('b', {}, r.name), h('small', {}, r.where)), r.val, r.cells.rot, r.cells.death);
          }
          const pidEl = h('span', { class: 'and-pid' }, `process ${pid}`);
          const actEl = h('span', { class: 'and-pid' }, `MainActivity ${addr()}`);
          const proc = h('div', { class: 'and-proc' }, h('span', { class: 'and-lbl' }, 'running'), pidEl, actEl);
          const o = out('Every holder starts at 3. Guess each ? before you tap.');
          function inc() {
            if (busy) return;
            rows.forEach(r => { r.v++; r.val.textContent = String(r.v); r.val.className = 'and-val'; replay(r.val, 'pop'); });
            say(o, `${hl('count++')}  ${note('every holder gets the same new value')}`);
          }
          async function event(kind) {
            if (busy) return; busy = true;
            const head = kind === 'rot' ? hdRot : hdDeath;
            head.classList.add('and-on');
            if (kind === 'rot') {
              say(o, note('rotate: same process, new Activity'));
              actEl.classList.add('leave'); await sleep(420);
              actEl.textContent = `MainActivity ${addr()}`; actEl.classList.remove('leave'); replay(actEl, 'drop-in');
            } else {
              say(o, note(`app in the background. The system kills process ${pid}. No callback runs.`));
              pidEl.classList.add('and-dead'); actEl.classList.add('and-dead'); replay(pidEl, 'shake');
              await sleep(900);
              pid = 4128 + Math.floor(Math.random() * 3000);
              pidEl.className = 'and-pid'; pidEl.textContent = `process ${pid}`; replay(pidEl, 'drop-in');
              actEl.className = 'and-pid'; actEl.textContent = `MainActivity ${addr()}`; replay(actEl, 'drop-in');
              line(o, note(`user returns: new process ${pid}, Activity rebuilt from the saved Bundle`));
            }
            await sleep(300);
            for (const r of rows) {
              const kept = r[kind];
              if (!kept) r.v = 0;
              r.val.textContent = String(r.v);
              r.val.className = 'and-val ' + (kept ? 'and-kept' : 'and-lost');
              replay(r.val, kept ? 'pop' : 'shake');
              r.cells[kind].className = kept ? 'and-kept' : 'and-lost';
              r.cells[kind].replaceChildren(h('span', { class: 'drop-in' }, kept ? '✓ kept' : '✗ lost'));
              await sleep(260);
            }
            line(o, kind === 'rot'
              ? '<span class="good">kept:</span> the ViewModel and the Bundle. <span class="bad">lost:</span> the old Activity and its composition.'
              : '<span class="good">kept:</span> only the Bundle. <span class="bad">lost:</span> everything that lived in memory, ViewModel too.');
            head.classList.remove('and-on');
            busy = false;
          }
          el.append(proc, grid,
            h('div', { class: 'controls' }, cmd('count++', inc), cmd('rotate', () => event('rot')), cmd('process death', () => event('death'))),
            o);
        },
        predict: {
          q: 'Your app is in the background and the system kills its process to free memory. Which callback does your code get at that moment?',
          options: ['<code>onDestroy()</code>', '<code>onCleared()</code> in the ViewModel', 'None: the process just ends'],
          a: 2,
          why: 'Process death sends no callback. What survives is the saved-state Bundle that was written earlier, when the Activity stopped.',
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'intents',
        title: 'Intents: explicit and implicit',
        tagline: 'Name the screen, or describe the job.',
        body: `
<p>An <code>Intent</code> is a message that asks Android to start something. An <em>explicit</em> intent names the exact class, as in <code>Intent(this, DetailActivity::class.java)</code>. Use it for screens inside your own app.</p>
<p>An <em>implicit</em> intent describes the job instead: an action like <code>ACTION_VIEW</code> or <code>ACTION_SEND</code>, plus data or a MIME type. Android compares it with the intent filters that apps declare in their manifests. One match opens directly. With several, the user picks. <code>Intent.createChooser()</code> always shows the picker.</p>
<p>No match throws <code>ActivityNotFoundException</code>, so wrap implicit <code>startActivity</code> calls in try/catch. Since Android 11, apps can’t see every other installed app by default, so catching the exception is more reliable than checking first. The next lesson, Package visibility, explains why.</p>`,
        code: `// Explicit: you name the class. Only your DetailActivity receives it.
startActivity(Intent(this, DetailActivity::class.java).putExtra("id", 42))

// Implicit: you describe the job. The system finds apps whose filters match.
val share = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "Look at this")
}
startActivity(Intent.createChooser(share, null))

try {
    startActivity(Intent(Intent.ACTION_VIEW, "geo:0,0?q=cafe".toUri()))
} catch (e: ActivityNotFoundException) {
    showMessage("No maps app installed")
}`,
        remember: 'Explicit names the class. Implicit names the job, and the system finds the app.',
        level: 'beginner',
        terms: [
          { term: 'Explicit intent', def: 'An Intent that names the exact component class to start, used for screens in your own app.' },
          { term: 'Implicit intent', def: 'An Intent that describes an action and data, so the system finds an app that can handle it.' },
          { term: 'Intent filter', def: 'A manifest declaration of the actions, categories and data types a component can handle.' },
          { term: 'ActivityNotFoundException', def: 'Thrown by startActivity when no installed app can handle the Intent.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Share some text and always show the app picker.', code: 'val send = Intent(Intent.[[ACTION_SEND]]).apply {\n    type = "text/plain"\n    putExtra(Intent.EXTRA_TEXT, "Hi")\n}\nstartActivity(Intent.[[createChooser]](send, null))', why: '<code>ACTION_SEND</code> describes the job. <code>createChooser</code> makes the system show the picker every time.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the wrong line.', code: 'fun openDetail(id: Int) {\n    val intent = Intent(this, DetailActivity::class)\n    intent.putExtra("id", id)\n    startActivity(intent)\n}', bug: 1, fix: '    val intent = Intent(this, DetailActivity::class.java)', why: 'The Intent constructor takes a Java <code>Class</code>. <code>::class</code> is a Kotlin <code>KClass</code>, so add <code>.java</code>.' },
        ],
        quiz: [
          { q: '<code>Intent(Intent.ACTION_VIEW, "https://example.com".toUri())</code> is', options: ['explicit', 'implicit'], a: 1, why: 'It names an action and data, not a class. The system picks the app.' },
          { q: 'An implicit intent matches no installed app. <code>startActivity()</code>', options: ['does nothing', 'throws <code>ActivityNotFoundException</code>', 'opens the Play Store'], a: 1, why: 'Nothing can handle it, so the call throws. Catch it and tell the user.' },
          { q: 'To open your own <code>SettingsActivity</code> from <code>MainActivity</code>, use', options: ['an explicit intent', 'an implicit intent with a custom action'], a: 0, why: 'Explicit is direct, and no other app can step in and receive it.' },
          { q: 'You share a photo from <code>cacheDir</code> with <code>putExtra(EXTRA_STREAM, Uri.fromFile(file))</code> in an app targeting Android 7.0 or later. What happens?', options: ['The receiving app reads it fine', 'The chooser shows no apps', '<code>FileUriExposedException</code>: expose it through a <code>FileProvider</code> content URI with <code>FLAG_GRANT_READ_URI_PERMISSION</code>'], a: 2, why: 'A <code>file://</code> URI leaving the app throws. A <code>content://</code> URI plus a read grant lets the receiver open that one file only.' },
        ],
        deeper: [
          {
            title: 'Sharing a file: content URIs and read grants',
            body: `<p>To share a photo you put a URI in <code>EXTRA_STREAM</code>. A <code>file://</code> URI does not work: other apps can't read your private files, and if your app targets Android 7.0 or later, a <code>file://</code> URI leaving your app throws <code>FileUriExposedException</code>.</p>
<p>Expose the file through a <code>FileProvider</code> as a <code>content://</code> URI instead, and add <code>FLAG_GRANT_READ_URI_PERMISSION</code>. The receiving app may then read that one URI and nothing else. The grant lasts while the receiving Activity's task is alive. When that task finishes, the access is gone.</p>`,
            code: `// manifest: <provider android:name="androidx.core.content.FileProvider"
//   android:authorities="\${applicationId}.fileprovider" android:exported="false"
//   android:grantUriPermissions="true"> with a file_paths.xml for cache/shared
val file = File(context.cacheDir, "shared/photo.jpg")
val uri = FileProvider.getUriForFile(context, "\${context.packageName}.fileprovider", file)

val send = Intent(Intent.ACTION_SEND).apply {
    type = "image/jpeg"
    putExtra(Intent.EXTRA_STREAM, uri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}
startActivity(Intent.createChooser(send, null))   // the chooser passes the grant on`,
            visual(el) {
              el.classList.add('and-viz');
              let busy = false, granted = false;
              const { dev, view } = device();
              const STEPS = ['sender: startActivity(...)', 'system: attach URI grant', 'Messages: openInputStream(uri)'];
              const rows = STEPS.map(s => { const res = h('span', { class: 'and-res' }, ''); const r = h('div', { class: 'and-step' }, h('span', {}, s), res); r.res = res; return r; });
              const o = out();
              const msgScreen = (kind, anim) => view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar('Messages'),
                kind === 'photo' ? h('div', { class: 'and-d2-photo drop-in' }, 'photo.jpg')
                  : kind === 'error' ? h('div', { class: 'and-d2-broken' }, 'can’t open attachment')
                    : h('span', { class: 'and-user' }, 'waiting for a share'),
                bars(70, 50)));
              function reset() { rows.forEach(r => { r.className = 'and-step'; r.res.textContent = ''; r.res.className = 'and-res'; }); }
              async function mark(i, ok, text) {
                const r = rows[i]; r.classList.add('and-on'); await sleep(420);
                r.classList.remove('and-on'); r.res.textContent = text; r.res.className = 'and-res ' + (ok ? 'and-ok' : 'and-no'); replay(r.res, 'pop');
                if (!ok) { replay(r, 'shake'); rows.slice(i + 1).forEach(x => x.classList.add('and-skip')); }
                return el.isConnected;
              }
              async function share(kind) {
                if (busy) return; busy = true; reset(); granted = false; msgScreen('idle');
                if (kind === 'file') {
                  say(o, hl('putExtra(EXTRA_STREAM, Uri.fromFile(file))'));
                  if (!await mark(0, false, '✗ crash')) return;
                  line(o, `<span class="bad">FileUriExposedException:</span> file:///…/photo.jpg exposed beyond app through ClipData.Item.getUri()`);
                  busy = false; return;
                }
                say(o, hl(kind === 'nogrant' ? 'putExtra(EXTRA_STREAM, contentUri)  // no flag' : 'putExtra(EXTRA_STREAM, contentUri) + FLAG_GRANT_READ_URI_PERMISSION'));
                if (!await mark(0, true, '✓ sent')) return;
                if (!await mark(1, kind === 'grant', kind === 'grant' ? '✓ read granted' : '✗ none')) return;
                rows[2].classList.remove('and-skip');
                if (!await mark(2, kind === 'grant', kind === 'grant' ? '✓ read' : '✗ denied')) return;
                if (kind === 'grant') { granted = true; msgScreen('photo', true); line(o, `<span class="good">Messages shows the photo</span> ${note('it can read this one URI, nothing else in your app')}`); }
                else { msgScreen('error', true); line(o, `<span class="bad">SecurityException:</span> Permission Denial: opening provider androidx.core.content.FileProvider … that is not exported`); }
                busy = false;
              }
              async function finish() {
                if (busy) return;
                if (!granted) { replay(dev, 'shake'); say(o, `${note('nothing is granted right now. Share with the flag first.')}`); return; }
                busy = true; granted = false;
                say(o, note('the user finishes in Messages: its task ends'));
                view.replaceChildren(homeScreen());
                await sleep(500); if (!el.isConnected) return;
                rows[1].res.textContent = '✗ revoked'; rows[1].res.className = 'and-res and-no'; replay(rows[1].res, 'pop');
                line(o, `<span class="good">grant revoked</span> ${note('the URI is unreadable again until you share it again')}`);
                busy = false;
              }
              msgScreen('idle');
              say(o, 'Share the same photo three ways.');
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), h('div', { class: 'and-steps' }, rows)),
                h('div', { class: 'controls' },
                  cmd('Uri.fromFile(file)', () => share('file')),
                  cmd('contentUri  // no flag', () => share('nogrant')),
                  cmd('contentUri + FLAG_GRANT_READ_URI_PERMISSION', () => share('grant')),
                  cmd('Messages task finishes', finish)),
                o);
            },
          },
          {
            title: 'Getting a result back',
            body: `<p>Some intents are questions: pick a file, take a photo. Start them through the Activity Result API and the answer comes back to a callback. <code>ActivityResultContracts.GetContent</code> wraps the implicit <code>ACTION_GET_CONTENT</code> intent and returns the chosen <code>Uri</code>, or <code>null</code> if the user backed out.</p>`,
            code: `@Composable
fun AttachButton(onPicked: (Uri) -> Unit) {
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) onPicked(uri)        // null: the user cancelled
    }
    Button(onClick = { pick.launch("application/pdf") }) { Text("Attach PDF") }
}`,
          },
        ],
        underHood: {
          body: `<p><code>startActivity</code> is a Binder call into <code>system_server</code>. There the activity manager asks the package manager to resolve the intent. An explicit intent is a lookup by class. For an implicit one it checks the filters of exported components: the action must match, every category in the intent must be in the filter, and the scheme, host and MIME type must fit. <code>startActivity</code> treats every implicit intent as if it carried <code>CATEGORY_DEFAULT</code>, so a filter without that category never matches it.</p>
<p>If several apps match and the user has no default, the system starts its own resolver Activity, the "open with" sheet. The chosen Activity runs in its own app's process, forked from the zygote if it isn't running yet. Extras ride along in the same Binder transaction as a parceled Bundle, which is where the size limit of about 1 MB comes from.</p>`,
          code: `// A filter that implicit startActivity calls can reach
// <activity android:name=".ShareTargetActivity" android:exported="true">
//     <intent-filter>
//         <action android:name="android.intent.action.SEND" />
//         <category android:name="android.intent.category.DEFAULT" />
//         <data android:mimeType="text/plain" />
//     </intent-filter>
// </activity>`,
        },
        mistakes: [
          {
            title: 'A custom implicit action for your own screen',
            bad: `// manifest: EditorActivity, exported="false",
//   with an intent filter for "com.example.OPEN_EDITOR"
startActivity(Intent("com.example.OPEN_EDITOR"))`,
            good: `startActivity(Intent(this, EditorActivity::class.java))`,
            why: 'For apps that target Android 14 or later, implicit intents are delivered only to exported components, so this throws <code>ActivityNotFoundException</code>. Inside your app, name the class.',
          },
          {
            title: 'A share target without the DEFAULT category',
            bad: `// <intent-filter>
//     <action android:name="android.intent.action.SEND" />
//     <data android:mimeType="text/plain" />
// </intent-filter>
// your app never appears in the share sheet`,
            good: `// <intent-filter>
//     <action android:name="android.intent.action.SEND" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <data android:mimeType="text/plain" />
// </intent-filter>`,
            why: 'Implicit <code>startActivity</code> calls only match filters that include <code>CATEGORY_DEFAULT</code>. Without it the filter is valid and silently unreachable.',
          },
          {
            title: 'Passing a big object through extras',
            bad: `startActivity(
    Intent(this, ReaderActivity::class.java)
        .putParcelableArrayListExtra("articles", ArrayList(allArticles))
)`,
            good: `startActivity(
    Intent(this, ReaderActivity::class.java).putExtra("articleId", article.id)
)
// ReaderActivity loads the article from the repository`,
            why: 'Extras cross Binder in one transaction with a limit of about 1 MB. A long list throws <code>TransactionTooLargeException</code>. Pass an id and load the data on the other side.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const sendT = t => t && t.startsWith('text/');
          const apps = [
            { name: 'Browser', f: 'VIEW · https:', m: i => i.action === 'VIEW' && i.scheme === 'https' },
            { name: 'Phone', f: 'DIAL · tel:', m: i => i.action === 'DIAL' && i.scheme === 'tel' },
            { name: 'Mail', f: 'SEND · text/plain', m: i => i.action === 'SEND' && i.type === 'text/plain' },
            { name: 'Messages', f: 'SEND · text/plain', m: i => i.action === 'SEND' && i.type === 'text/plain' },
            { name: 'Notes', f: 'SEND · text/*', m: i => i.action === 'SEND' && sendT(i.type) },
            { name: 'Gallery', f: 'VIEW · image/*', m: i => i.action === 'VIEW' && (i.type || '').startsWith('image/') },
          ];
          const intents = [
            { src: 'Intent(this, DetailActivity::class.java)', tag: 'DetailActivity', explicit: true },
            { src: 'Intent(ACTION_VIEW, "https://developer.android.com".toUri())', tag: 'ACTION_VIEW https:', action: 'VIEW', scheme: 'https' },
            { src: 'Intent(ACTION_DIAL, "tel:5551234".toUri())', tag: 'ACTION_DIAL tel:', action: 'DIAL', scheme: 'tel' },
            { src: 'createChooser(Intent(ACTION_SEND).setType("text/plain"), null)', tag: 'ACTION_SEND text/plain', action: 'SEND', type: 'text/plain', chooser: true },
            { src: 'Intent(ACTION_VIEW, "geo:0,0?q=cafe".toUri())', tag: 'ACTION_VIEW geo:', action: 'VIEW', scheme: 'geo' },
          ];
          let busy = false, choosing = false;
          const tile = (name, f) => h('div', { class: 'and-tile' }, name, h('small', {}, f));
          const mainT = tile('MainActivity', 'sender'), detailT = tile('DetailActivity', 'no intent filter');
          apps.forEach(a => { a.el = tile(a.name, a.f); });
          const resolver = h('div', { class: 'and-resolver' }, 'Android: match action, data and type against intent filters');
          const env = h('div', { class: 'and-env' }, 'Intent');
          const sheet = h('div', { class: 'and-sheet', hidden: true });
          const sys = h('div', { class: 'and-sys' },
            h('span', { class: 'and-lbl' }, 'your app'), h('div', { class: 'and-row' }, mainT, detailT),
            resolver,
            h('span', { class: 'and-lbl' }, 'other installed apps'), h('div', { class: 'and-apps' }, apps.map(a => a.el)),
            env, sheet);
          const o = out('Send an intent. Watch who receives it.');
          function place(target, animate) {
            const s = sys.getBoundingClientRect(), r = target.getBoundingClientRect();
            env.classList.toggle('and-notr', !animate);
            env.style.left = (r.left - s.left + r.width / 2) + 'px';
            env.style.top = (r.top - s.top + r.height / 2) + 'px';
            void env.offsetWidth;
          }
          const fly = async target => { place(target, true); await sleep(600); };
          function clear() {
            [detailT, ...apps.map(a => a.el)].forEach(t => t.classList.remove('and-match', 'and-miss', 'and-open', 'and-scan'));
          }
          async function deliver(a) {
            await fly(a.el);
            a.el.classList.remove('and-match'); a.el.classList.add('and-open'); replay(a.el, 'pop');
            env.style.opacity = '0';
            line(o, `<span class="good">opened:</span> ${a.name}`);
            busy = false;
          }
          function choose(matches) {
            choosing = true;
            sheet.replaceChildren(
              h('b', {}, 'Share with'),
              h('div', { class: 'and-row' }, matches.map(a => h('button', { class: 'btn small and-pick', onclick: () => { sheet.hidden = true; choosing = false; deliver(a); } }, a.name))),
              h('button', { class: 'btn small', onclick: () => { sheet.hidden = true; choosing = false; env.style.opacity = '0'; line(o, note('user cancelled the chooser')); busy = false; } }, 'Cancel'));
            sheet.hidden = false; replay(sheet, 'drop-in');
            line(o, note(`${matches.length} apps match. The chooser lets the user pick.`));
          }
          async function send(it) {
            if (choosing) { replay(sheet, 'shake'); say(o, 'Pick an app in the chooser, or Cancel.'); return; }
            if (busy) return; busy = true;
            clear();
            env.textContent = it.tag; env.style.opacity = '1';
            place(mainT, false);
            say(o, hl(`startActivity(${it.src})`));
            await sleep(120);
            if (it.explicit) {
              await fly(detailT);
              detailT.classList.add('and-open'); replay(detailT, 'pop');
              env.style.opacity = '0';
              line(o, '<span class="good">opened:</span> DetailActivity. The class is named, so no filter matching happens.');
              busy = false; return;
            }
            await fly(resolver);
            resolver.classList.add('and-on');
            const matches = [];
            for (const a of apps) {
              a.el.classList.add('and-scan'); await sleep(190); a.el.classList.remove('and-scan');
              const ok = a.m(it);
              a.el.classList.add(ok ? 'and-match' : 'and-miss');
              if (ok) matches.push(a);
            }
            resolver.classList.remove('and-on');
            if (!matches.length) {
              replay(resolver, 'shake'); env.style.opacity = '0';
              line(o, '<span class="bad">ActivityNotFoundException:</span> no app has a filter for VIEW geo:. Catch it and tell the user.');
              busy = false; return;
            }
            if (matches.length === 1 && !it.chooser) { line(o, note('exactly one match, so it opens directly')); await deliver(matches[0]); return; }
            choose(matches);
          }
          requestAnimationFrame(() => place(mainT, false));
          el.append(sys, h('div', { class: 'controls' }, intents.map(it => cmd(it.src, () => send(it)))), o);
        },
        predict: {
          q: 'You start <code>ACTION_DIAL</code> with a <code>tel:</code> number, and exactly one installed app has a matching filter. What happens?',
          options: ['A chooser with a single entry', 'That app opens directly', '<code>ActivityNotFoundException</code>'],
          a: 1,
          why: 'Android matches the intent against every app’s filters. With exactly one match and no chooser, it starts that Activity straight away.',
        },
      },

      // 4a ────────────────────────────────────────────
      {
        id: 'package-visibility',
        title: 'Package visibility',
        tagline: 'Since Android 11 your app sees only some installed apps, but it can still start any of them.',
        level: 'intermediate',
        body: `
<p>An app that targets Android 11 (API level 30) or higher no longer sees every installed app. <code>PackageManager</code> calls that return other apps, such as <code>queryIntentActivities()</code>, <code>getPackageInfo()</code> and <code>getInstalledApplications()</code>, leave out the ones you can't see. <code>intent.resolveActivity()</code> asks the same package manager, so a check can answer "no app" while a maps app is installed.</p>
<p>Starting an Activity is not filtered. You can start another app's Activity with an implicit or explicit intent whether or not that app is visible to you. So the usual answer is to call <code>startActivity</code> and catch <code>ActivityNotFoundException</code>.</p>
<p>When you must know in advance, for example to hide a button, declare what you need in a <code>&lt;queries&gt;</code> element in the manifest. Ask for the smallest set that works. Apps that target Android 10 or lower still see everything.</p>`,
        code: `// Works without any declaration
try {
    startActivity(Intent(Intent.ACTION_VIEW, "geo:0,0?q=cafe".toUri()))
} catch (e: ActivityNotFoundException) {
    showMessage("No maps app installed")
}

// Only to check in advance. AndroidManifest.xml:
// <queries>
//     <intent>
//         <action android:name="android.intent.action.VIEW" />
//         <data android:scheme="geo" />
//     </intent>
// </queries>
val canShowMap = Intent(Intent.ACTION_VIEW, "geo:0,0".toUri()).resolveActivity(packageManager) != null`,
        remember: 'Seeing other apps needs a queries entry. Starting them does not: call startActivity and catch ActivityNotFoundException.',
        terms: [
          { term: 'Package visibility', def: 'The Android 11+ rule that PackageManager results only include the other apps your app is allowed to see.' },
          { term: 'queries element', def: 'A manifest element that lists the packages, intents or provider authorities your app needs to see.' },
          { term: 'QUERY_ALL_PACKAGES', def: 'A permission that makes every installed app visible. Meant for rare cases, and limited by Google Play policy.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Your app needs to know whether the partner store app is installed.', code: '// AndroidManifest.xml\n// <[[queries]]>\n//     <[[package]] android:name="com.example.store" />\n// </queries>\n\nval hasStore = try {\n    packageManager.getPackageInfo("com.example.store", 0); true\n} catch (e: PackageManager.NameNotFoundException) { false }', why: 'A <code>&lt;package&gt;</code> entry inside <code>&lt;queries&gt;</code> makes that one app visible, so <code>getPackageInfo</code> can find it.' },
          { type: 'bug', prompt: 'targetSdk 35, no queries entry. The chat app is installed, but tapping Share does nothing. Tap the line.', code: 'fun shareToChat(text: String) {\n    val send = Intent(Intent.ACTION_SEND)\n        .setPackage("com.example.chat")\n        .setType("text/plain")\n        .putExtra(Intent.EXTRA_TEXT, text)\n    if (send.resolveActivity(packageManager) != null) startActivity(send)\n}', bug: 5, fix: '    try { startActivity(send) } catch (e: ActivityNotFoundException) { showMessage("Chat is not installed") }', why: '<code>resolveActivity</code> is filtered and returns null for an app you can’t see. <code>startActivity</code> is not filtered, so call it and catch the exception.' },
        ],
        quiz: [
          { q: 'targetSdk 34, no <code>&lt;queries&gt;</code>. A maps app is installed. What does <code>Intent(ACTION_VIEW, geoUri).resolveActivity(packageManager)</code> return?', options: ['The maps Activity', '<code>null</code>', 'It throws SecurityException'], a: 1, why: 'The maps app is not visible to you, so the package manager leaves it out of the answer.' },
          { q: 'Same app, same setup. What does <code>startActivity(Intent(ACTION_VIEW, geoUri))</code> do?', options: ['Opens the maps app', 'Throws ActivityNotFoundException', 'Asks for QUERY_ALL_PACKAGES'], a: 0, why: 'Starting an Activity is not filtered by package visibility.' },
          { q: 'Which app is visible to yours without any declaration?', options: ['Every app with a launcher icon', 'The app that installed your app', 'Any app that shares your signing key'], a: 1, why: 'The installer is on the automatic list, along with your own app, some system packages and apps that interact with yours.' },
          { q: 'Your app must check in advance if one specific app, <code>com.example.store</code>, is installed. Which manifest entry is the smallest that works?', options: ['<code>&lt;queries&gt;&lt;package android:name="com.example.store" /&gt;&lt;/queries&gt;</code>', '<code>&lt;uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" /&gt;</code>', 'Nothing: <code>getPackageInfo()</code> always sees installed apps'], a: 0, why: 'A <code>&lt;package&gt;</code> entry makes exactly that one app visible. QUERY_ALL_PACKAGES exposes every app and is reviewed on Play.' },
        ],
        deeper: [
          {
            title: 'Apps you see without asking',
            body: `<p>Some apps are always visible: your own app, some system packages (the set depends on the device), and the app that installed yours. An app also becomes visible when it interacts with yours: it starts your Activity with <code>startActivityForResult()</code>, starts or binds your service, uses your content provider, or owns a provider you were granted a URI permission for.</p>
<p>To see which system packages are always visible on a device, run <code>adb shell dumpsys package queries</code> and look for the <code>forceQueryable</code> section.</p>`,
            code: `# Packages every app can see on this device
adb shell dumpsys package queries
# look for the forceQueryable section`,
            visual(el) {
              el.classList.add('and-viz');
              const APPS = [
                { name: 'Play Store', btn: 'installs your app', ev: 'installed your app', why: 'the installer of your app' },
                { name: 'Mail', btn: 'startActivityForResult(yourIntent)', ev: 'starts your Activity with startActivityForResult()', why: 'it started your Activity for a result' },
                { name: 'Gallery', btn: 'queries your provider', ev: 'reads your content provider', why: 'it accessed your provider' },
                { name: 'Chat', ev: null, why: '' },
              ];
              const o = out();
              APPS.forEach(a => { a.seen = false; a.tile = h('div', { class: 'and-tile and-miss' }, a.name, h('small', {}, 'hidden')); });
              const youTile = h('div', { class: 'and-tile and-open' }, 'Your app', h('small', {}, 'always visible to itself'));
              function paint() { APPS.forEach(a => { a.tile.classList.toggle('and-miss', !a.seen); a.tile.classList.toggle('and-match', a.seen); a.tile.lastChild.textContent = a.seen ? `visible: ${a.why}` : 'hidden'; }); }
              function happen(a) {
                if (a.seen) { replay(a.tile, 'pop'); say(o, note(`${a.name} is already visible`)); return; }
                a.seen = true; paint(); replay(a.tile, 'pop');
                say(o, `${a.name} ${a.ev}. <span class="good">${a.name} is now visible to you</span> ${note('no queries entry needed')}`);
              }
              function chat() {
                replay(APPS[3].tile, 'shake');
                say(o, `${hl('getPackageInfo("com.example.chat", 0)')} <span class="bad">NameNotFoundException</span> ${note('no interaction, no queries entry: still hidden')}`);
              }
              function reset() { APPS.forEach(a => { a.seen = false; }); paint(); say(o, note('Before any interaction, other apps are hidden. Make something happen.')); }
              reset();
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'what your app can see (targetSdk 30+)'), youTile, APPS.map(a => a.tile))),
                h('div', { class: 'controls' }, APPS.slice(0, 3).map(a => cmd(`${a.name} ${a.btn}`, () => happen(a))), cmd('getPackageInfo("com.example.chat")', chat), cmd('reset', reset)),
                o);
            },
          },
          {
            title: 'Three ways to declare what you need',
            body: `<p><code>&lt;queries&gt;</code> takes three kinds of entries. <code>&lt;package&gt;</code> names one app. <code>&lt;intent&gt;</code> makes visible every app with a matching filter. <code>&lt;provider&gt;</code> names content provider authorities.</p>
<p>An <code>&lt;intent&gt;</code> entry needs exactly one <code>&lt;action&gt;</code>. Its <code>&lt;data&gt;</code> can't use <code>path</code>, <code>pathPrefix</code>, <code>pathPattern</code> or <code>port</code>. And <code>scheme</code>, <code>host</code> and <code>mimeType</code> may each appear once.</p>`,
            code: `<queries>
    <!-- one app by package name -->
    <package android:name="com.example.store" />

    <!-- every app that can view geo: links -->
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="geo" />
    </intent>

    <!-- apps that own these provider authorities -->
    <provider android:authorities="com.example.settings.files" />
</queries>`,
          },
          {
            title: 'QUERY_ALL_PACKAGES is for rare apps',
            body: `<p>The <code>QUERY_ALL_PACKAGES</code> permission makes every installed app visible. The docs call it not recommended and list the kinds of apps that may need it: browsers, accessibility, device management, security and antivirus apps. On Google Play, its use is subject to approval under Play policy.</p>
<p>A news or shopping app almost never needs it. If you know which apps or which kind of intent you care about, a <code>&lt;queries&gt;</code> entry is enough.</p>`,
            code: `<!-- Only for apps whose core feature needs the full list -->
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />`,
          },
        ],
        underHood: {
          body: `<p>The filtering happens in the system, for each calling app. When your app asks the package manager about another app, the system checks whether you may see it. If not, the answer simply leaves it out, as if it were not installed. Nothing throws, which is why visibility bugs are quiet.</p>
<p>To watch it happen, turn on visibility logging for your package. Each filtered call then shows up in logcat as an <code>AppsFilter</code> line ending in <code>BLOCKED</code>. The logging slows the app, so turn it off when you're done.</p>`,
          code: `adb shell pm log-visibility --enable com.example.myapp
adb logcat -s AppsFilter
# I/AppsFilter: interaction: PackageSetting{… com.example.myapp/…} -> PackageSetting{…} BLOCKED`,
        },
        mistakes: [
          {
            title: 'Hiding a feature behind resolveActivity',
            bad: `val canNavigate = Intent(Intent.ACTION_VIEW, geoUri).resolveActivity(packageManager) != null
if (canNavigate) NavigateButton()`,
            good: `NavigateButton(onClick = {
    try { startActivity(Intent(Intent.ACTION_VIEW, geoUri)) }
    catch (e: ActivityNotFoundException) { showMessage("No maps app installed") }
})`,
            why: 'Without a matching <code>&lt;queries&gt;</code> entry, the check returns null on Android 11+ even when a maps app is installed, and the button disappears for everyone. Either always show it and catch, or declare the intent in <code>&lt;queries&gt;</code>.',
          },
          {
            title: 'QUERY_ALL_PACKAGES to check one app',
            bad: `<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />`,
            good: `<queries>
    <package android:name="com.example.store" />
</queries>`,
            why: 'Seeing every app is a privacy cost the user pays, and Play reviews the permission. A <code>&lt;package&gt;</code> entry gives you exactly the one app you need.',
          },
          {
            title: 'Expecting a path to narrow an intent query',
            bad: `<intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="https" android:host="example.com" android:pathPrefix="/news" />
</intent>`,
            good: `<intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="https" android:host="example.com" />
</intent>`,
            why: 'Path and port attributes are not allowed in a queries intent. The system treats them as a wildcard, so the entry already means the whole host. Write it that way.',
          },
        ],
        visual(el) {
          const cafe = btn => `<div class="ui-m-bar">Café Lumen</div><div class="ui-m-body"><div class="ui-m-img"></div><b>Open daily, 8 to 18</b><div class="ui-m-line"></div><div class="ui-m-line short"></div>${btn}</div>`;
          const maps = '<div class="ui-m-bar">Maps</div><div class="ui-m-body"><div class="ui-m-img" style="aspect-ratio:1"></div><div class="ui-m-row"><span class="ui-m-av"></span><div>Café Lumen</div></div></div>';
          const btn = '<span class="ui-m-btn mp">Open in Maps</span>';
          Lab.ui.phone(el, {
            logTitle: 'What your code sees',
            predict: {
              q: 'You add a <code>&lt;queries&gt;</code> entry for <code>VIEW geo:</code> and call <code>resolveActivity</code> again. What comes back?',
              options: ['Still <code>null</code>', 'The Maps component', 'A list of every installed app'],
              a: 1,
              why: 'A <code>&lt;queries&gt;</code> entry makes apps that handle that intent visible to your package manager calls. It does not reveal anything else.',
            },
            frames: [
              { screen: cafe('<span class="ui-m-muted">Map button: not checked yet</span>'), log: '// targetSdk 34, no &lt;queries&gt;. Maps is installed.', say: 'The café screen wants a map button, but only if some app can show a map. Maps is installed.' },
              { screen: cafe('<span class="ui-m-muted">Map button hidden</span>'), log: 'intent.resolveActivity(packageManager) = null', say: 'The check answers <code>null</code>. Maps is installed, but since Android 11 your app cannot see it, so the button is hidden by mistake.' },
              { screen: cafe(btn), log: '// show the button and start the intent anyway', say: 'The usual answer: always show the button and just start the intent.' },
              { tap: '.mp', screen: maps, log: ['startActivity(Intent(ACTION_VIEW, geoUri))', '→ Maps opens'], say: 'It works. Starting an Activity is not filtered by package visibility. Catch <code>ActivityNotFoundException</code> for phones with no map app.' },
              { screen: cafe('<span class="ui-m-muted">Map button: not checked yet</span>'), log: '// manifest: &lt;queries&gt;&lt;intent&gt; VIEW, scheme geo &lt;/intent&gt;&lt;/queries&gt;', say: 'When you must know in advance, declare the smallest set you need: here, apps that handle <code>VIEW</code> with a <code>geo:</code> URI.' },
              { screen: cafe(btn), log: 'intent.resolveActivity(packageManager) = ComponentInfo{com.example.maps/.MapActivity}', say: 'Now the same check finds Maps, so the button shows for the right reason.' },
              { log: '// targetSdk 29 or lower: every app is visible, no &lt;queries&gt; needed', say: 'Apps that target Android 10 or lower still see every installed app. The filtering starts at targetSdk 30.' },
            ],
          });
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'backstack',
        title: 'Tasks and the back stack',
        tagline: 'Navigate pushes, Back pops.',
        body: `
<p>A <em>task</em> is the stack of screens the user has walked through, newest on top. Opening a screen pushes it onto the stack. Back pops the top one and shows the one below.</p>
<p>In a Compose app with a single Activity, Navigation keeps this stack for you. <code>navController.navigate(route)</code> pushes, <code>popBackStack()</code> pops, and the system Back gesture pops too. Back on the start destination leaves the app.</p>
<p>Two options change a push. <code>launchSingleTop = true</code> skips the push when that destination is already on top, so a double tap can’t stack two copies. <code>popUpTo&lt;Home&gt;()</code> pops everything above Home first, which keeps the stack short. Activities have matching intent flags: <code>FLAG_ACTIVITY_SINGLE_TOP</code> and <code>FLAG_ACTIVITY_CLEAR_TOP</code>. The next lesson, Launch modes and task affinity, covers how a stack of Activities behaves.</p>`,
        code: `@Serializable object Home
@Serializable object Search
@Serializable object Settings
@Serializable data class Detail(val id: Int)

NavHost(navController, startDestination = Home) {
    composable<Home> { HomeScreen() }
    composable<Search> { SearchScreen() }
    composable<Settings> { SettingsScreen() }
    composable<Detail> { entry -> DetailScreen(entry.toRoute<Detail>().id) }
}

navController.navigate(Detail(id = 7))                       // push
navController.popBackStack()                                 // pop, like Back
navController.navigate(Search) { launchSingleTop = true }    // no copy on top of a copy
navController.navigate(Settings) { popUpTo<Home>() }         // clear down to Home, then push`,
        remember: 'navigate pushes, Back pops. launchSingleTop stops duplicates. popUpTo clears down to a screen first.',
        level: 'intermediate',
        terms: [
          { term: 'Back stack', def: 'The stack of destinations the user has visited, where navigating pushes and Back pops the top one.' },
          { term: 'Task', def: 'The set of activities the user interacts with for one job, kept as a back stack.' },
          { term: 'launchSingleTop', def: 'A navigation option that reuses the destination when it is already on top instead of pushing a copy.' },
          { term: 'popUpTo', def: 'A navigation option that pops destinations off the stack down to a given one before pushing the new one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Stop double taps from stacking Search, and make Home the only entry.', code: 'navController.navigate(Search) { [[launchSingleTop]] = true }\nnavController.navigate(Home) {\n    [[popUpTo]]<Home> { inclusive = true }\n}', why: 'Single top reuses Search when it is already on top. Popping Home inclusive, then pushing it, leaves one Home on the stack.' },
          { type: 'bug', prompt: 'After login, Back takes the user to the login screen again. Tap the line.', code: 'fun onLoggedIn() {\n    navController.navigate(Home) {\n        popUpTo<Login>()\n    }\n}', bug: 2, fix: '        popUpTo<Login> { inclusive = true }', why: 'Without <code>inclusive = true</code>, <code>popUpTo</code> stops at Login and keeps it under Home.' },
        ],
        quiz: [
          { q: 'The stack is Home, List, Detail. The user presses Back twice. What is on screen?', options: ['Home', 'List', 'The app closes'], a: 0, why: 'Each Back pops one entry: Detail, then List.' },
          { q: 'The stack is Home, Search. You call <code>navigate(Search) { launchSingleTop = true }</code>. The stack is now', options: ['Home, Search', 'Home, Search, Search', 'Search'], a: 0, why: 'Search is already on top, so single top reuses it instead of pushing a copy.' },
          { q: 'The stack is Home, A, B. You call <code>navigate(C) { popUpTo&lt;Home&gt;() }</code>. The stack is now', options: ['Home, A, B, C', 'Home, C', 'C'], a: 1, why: 'Everything above Home is popped, then C is pushed. Add <code>inclusive = true</code> to pop Home too.' },
          { q: 'Bottom tabs switch with <code>navigate(tab) { popUpTo(start) }</code> and no other options. The user goes Feed › Article, taps Profile, then taps Feed again. Where do they land?', options: ['On Article, where they left Feed', 'On the first screen of Feed, because the popped Article was destroyed', 'On Profile, because Feed is no longer in the graph'], a: 1, why: 'Without <code>saveState = true</code> on popUpTo and <code>restoreState = true</code> on the navigate, the old tab’s screens are destroyed, not saved.' },
        ],
        deeper: [
          {
            title: 'Intercepting Back the modern way',
            body: `<p>Sometimes Back should not pop yet, for example when a form has unsaved changes. Don't override <code>onBackPressed()</code>. It is deprecated, and for apps that target Android 16 it is no longer called at all. Register a callback with the <code>OnBackPressedDispatcher</code>, or use <code>BackHandler</code> in Compose.</p>
<p>Enable the callback only while you need it. With predictive back, the system decides before the gesture ends whether Back stays in your app or shows the screen behind it. An always-enabled callback blocks that preview everywhere. Disable it as soon as the draft is saved.</p>`,
            code: `@Composable
fun EditorScreen(state: EditorState, onDiscard: () -> Unit) {
    var confirm by remember { mutableStateOf(false) }
    BackHandler(enabled = state.hasUnsavedChanges) { confirm = true }
    if (confirm) DiscardDialog(onDiscard = onDiscard, onKeep = { confirm = false })
}

// In an Activity or Fragment
val callback = onBackPressedDispatcher.addCallback(this, enabled = false) {
    showDiscardDialog()
}
callback.isEnabled = hasUnsavedChanges     // update it whenever that changes`,
          },
          {
            title: 'Bottom tabs keep their own stacks',
            body: `<p>With a bottom bar, each tab should remember where the user was. Navigation supports multiple back stacks. When switching tabs, pop up to the start destination with <code>saveState = true</code>, and navigate to the tab with <code>restoreState = true</code>. The popped entries are saved, with their state and ViewModels, and come back when the user returns to that tab.</p>
<p>Without those two flags, the popped screens of the old tab are simply destroyed. The user taps back to Feed and lands on its first screen again.</p>`,
            code: `fun NavController.switchTab(tab: Any) = navigate(tab) {
    popUpTo(graph.findStartDestination().id) { saveState = true }
    launchSingleTop = true
    restoreState = true
}

NavigationBarItem(
    selected = current == Feed,
    onClick = { navController.switchTab(Feed) },
    icon = { Icon(Icons.Default.Home, contentDescription = null) },
    label = { Text("Feed") },
)`,
            visual(el) {
              el.classList.add('and-viz');
              const TABS = ['Feed', 'Search', 'Profile'];
              const SUB = { Feed: k => `Article(${k})`, Search: k => `Results(page = ${k})`, Profile: k => `EditField(${k})` };
              let stack = ['Feed'], tab = 'Feed', saved = {}, k = 1, save = true, busy = false;
              const col = h('div', { class: 'and-stack' });
              const savedBox = h('div', { class: 'and-d2-saved' });
              const { dev, view } = device('and-tall');
              const o = out();
              function paint(anim) {
                col.replaceChildren(...stack.map((r, i) => h('div', { class: 'and-card' + (i === stack.length - 1 ? ' and-top' : '') + (anim && i === stack.length - 1 ? ' drop-in' : '') }, h('span', {}, r), h('small', {}, i === 0 ? 'start' : TABS.includes(r) ? 'tab' : ''))));
                const keys = Object.keys(saved).filter(t => saved[t] && saved[t].length);
                savedBox.replaceChildren(h('span', { class: 'and-lbl' }, 'saved stacks'), ...(keys.length ? keys.map(t => h('div', { class: 'and-d2-svd drop-in' }, h('b', {}, t), h('span', {}, saved[t].join(' › ')))) : [h('span', { class: 'and-user' }, 'none')]));
                const top = stack[stack.length - 1];
                view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar(stack.length > 1 && top !== tab ? `← ${top}` : top), h('span', { class: 'and-big' }, top.replace(/\(.*/, '')), bars(80, 60, 70)),
                  h('div', { class: 'and-d2-tabs' }, TABS.map(t => h('span', { class: 'and-d2-tab' + (t === tab ? ' and-on' : '') }, t))));
              }
              function nope(msg) { if (busy) return; replay(col, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); }
              function switchTab(t) {
                if (busy) return;
                if (t === tab) return nope(`${t} is already selected.`);
                const popped = stack.slice(1);
                if (save) { if (popped.length) saved[tab] = popped; }
                stack = ['Feed'];
                let restored = false;
                if (save && saved[t] && saved[t].length) {
                  stack = t === 'Feed' ? ['Feed', ...saved[t]] : ['Feed', ...saved[t]];
                  delete saved[t]; restored = true;
                } else if (t !== 'Feed') stack.push(t);
                tab = t; paint(true);
                say(o, `${hl(`switchTab(${t})`)}  ${note(`popped ${popped.length} ${save ? (popped.length ? '(saved)' : '') : '(destroyed)'}${restored ? `, restored ${t}’s stack` : ''}`)}`);
              }
              function push() {
                if (busy) return;
                if (stack.length >= 6) return nope('the stack is getting tall. Press Back.');
                const r = SUB[tab](k++); stack.push(r); paint(true);
                say(o, `${hl(`navigate(${r})`)}  ${note(`push inside the ${tab} tab`)}`);
              }
              async function back() {
                if (busy) return;
                if (stack.length === 1) return nope('Feed is the start destination. Back here leaves the app.');
                busy = true;
                const r = stack.pop();
                col.lastElementChild.classList.add('leave');
                await sleep(380); if (!el.isConnected) return;
                if (TABS.includes(r)) tab = 'Feed';
                paint(true);
                say(o, `${hl('popBackStack()')}  ${note(`pop ${r}${TABS.includes(r) ? ': back on the Feed tab' : ''}`)}`);
                busy = false;
              }
              const t = h('label', { class: 'switch', for: 'and-d2-tab-save' }, h('input', { type: 'checkbox', id: 'and-d2-tab-save', checked: true, onchange(e) {
                if (busy) { e.target.checked = save; return; }
                save = e.target.checked; saved = {}; stack = ['Feed']; tab = 'Feed'; k = 1; paint(true);
                say(o, note(save ? 'saveState and restoreState on. Stacks reset.' : 'saveState and restoreState off. Stacks reset.'));
              } }), 'saveState + restoreState');
              paint();
              say(o, 'Open an article in Feed, switch to Search, then come back to Feed.');
              el.append(
                h('div', { class: 'stage and-nav' }, h('div', { class: 'and-stackbox' }, col, h('span', { class: 'and-lbl' }, 'back stack'), savedBox), dev),
                h('div', { class: 'controls' }, t),
                h('div', { class: 'controls' }, TABS.map(x => cmd(`switchTab(${x})`, () => switchTab(x))), cmd('navigate(next screen)', push), cmd('popBackStack()', back)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>In Navigation Compose, the back stack is a list of <code>NavBackStackEntry</code> objects inside the <code>NavController</code>. Each entry is a small owner of its own: it has a <code>Lifecycle</code>, a <code>ViewModelStore</code> and a <code>SavedStateRegistry</code>. The top entry is <code>RESUMED</code>, entries under it are <code>CREATED</code>, and a popped entry moves to <code>DESTROYED</code> and has its ViewModels cleared, unless it was popped with <code>saveState</code>.</p>
<p>The <code>NavController</code> writes the whole stack, with each entry's arguments and saved state, into the Activity's saved-state Bundle. That is why the user lands on the same screen with the same stack under it after process death. Type-safe routes such as <code>Detail(id = 7)</code> are encoded with kotlinx.serialization into the entry's arguments, so they fit in that Bundle.</p>`,
          code: `val entry = navController.currentBackStackEntry ?: return
entry.lifecycle.currentState     // RESUMED for the top entry
entry.viewModelStore             // ViewModels scoped to this screen
entry.savedStateHandle           // per-screen saved state, also used for results`,
        },
        mistakes: [
          {
            title: 'Calling navigate() in the composable body',
            bad: `@Composable
fun LoginRoute(state: LoginState, navController: NavController) {
    if (state.loggedIn) navController.navigate(Home)   // runs on every recomposition
    LoginScreen(state)
}`,
            good: `@Composable
fun LoginRoute(state: LoginState, onLoggedIn: () -> Unit) {
    LaunchedEffect(state.loggedIn) { if (state.loggedIn) onLoggedIn() }
    LoginScreen(state)
}`,
            why: 'Composition can run many times, and each run pushes another Home. Navigate from an event callback or an effect keyed on the change, and pass a lambda instead of the NavController.',
          },
          {
            title: 'Whole objects as route arguments',
            bad: `@Serializable data class Detail(val article: Article)

navController.navigate(Detail(article))`,
            good: `@Serializable data class Detail(val id: Long)

navController.navigate(Detail(article.id))
// DetailViewModel reads the id from SavedStateHandle and loads the article`,
            why: 'Route arguments are saved with the back stack in the saved-state Bundle. A full article bloats it, goes stale, and needs a custom <code>NavType</code>. Pass the id and load the data from the repository.',
          },
          {
            title: 'popBackStack() from an Up arrow on the start screen',
            bad: `IconButton(onClick = { navController.popBackStack() }) {
    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
}`,
            good: `if (navController.previousBackStackEntry != null) {
    IconButton(onClick = { navController.navigateUp() }) {
        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
    }
}`,
            why: '<code>popBackStack()</code> happily pops the start destination too, which leaves an empty NavHost and a blank screen. <code>navigateUp()</code> never pops the last entry, and the arrow only shows when there is somewhere to go.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          let stack = [], n = 2, busy = false;
          const col = h('div', { class: 'and-stack' });
          const { dev, view } = device();
          const o = out();
          const detailBtn = cmd('', () => push(`Detail(id=${n})`, () => { n++; detailBtn.innerHTML = hl(`navigate(Detail(id = ${n}))`); }));
          const entry = (route, anim) => ({ route, el: h('div', { class: 'and-card' + (anim ? ' drop-in' : '') }, h('span', {}, route), h('small', {})) });
          function paint(anim) {
            stack.forEach((e, i) => {
              const top = i === stack.length - 1;
              e.el.classList.toggle('and-top', top);
              e.el.lastChild.textContent = top ? 'on screen' : i === 0 ? 'start' : '';
            });
            const top = stack[stack.length - 1].route;
            view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') },
              appbar(stack.length > 1 ? `← ${top}` : top), h('span', { class: 'and-big' }, top.replace(/\(.*/, '')), bars(85, 60, 75)));
          }
          function push(route, after) {
            if (busy) return;
            if (stack.length >= 7) { replay(col, 'shake'); say(o, 'The stack is getting tall. Press Back or Reset.'); return; }
            const e = entry(route, true); stack.push(e); col.append(e.el);
            if (after) after();
            paint(true);
            say(o, `${hl(`navigate(${route})`)}  ${note(`push. Stack size ${stack.length}`)}`);
          }
          async function back() {
            if (busy) return;
            if (stack.length === 1) { replay(stack[0].el, 'shake'); say(o, `${hl('popBackStack()')}  ${note('Home is the start destination. Back here leaves the app.')}`); return; }
            busy = true;
            const e = stack.pop(); e.el.classList.add('leave');
            paint(true);
            say(o, `${hl('popBackStack()')}  ${note(`pop ${e.route}. Back to ${stack[stack.length - 1].route}`)}`);
            await sleep(450); e.el.remove();
            busy = false;
          }
          function single() {
            if (busy) return;
            const top = stack[stack.length - 1];
            if (top.route === 'Search') { replay(top.el, 'pop'); say(o, `${hl('navigate(Search) { launchSingleTop = true }')}  ${note('Search is already on top. Reused, no copy pushed.')}`); return; }
            push('Search');
            line(o, note('Search was not on top, so this is a normal push'));
          }
          async function clearTo() {
            if (busy) return; busy = true;
            const gone = stack.slice(1).reverse();
            for (const e of gone) { e.el.classList.add('leave'); await sleep(160); }
            await sleep(300);
            gone.forEach(e => e.el.remove());
            stack = stack.slice(0, 1);
            const e = entry('Settings', true); stack.push(e); col.append(e.el);
            paint(true);
            say(o, `${hl('navigate(Settings) { popUpTo<Home>() }')}  ${note(`popped ${gone.length}, pushed Settings. Back now goes straight to Home.`)}`);
            busy = false;
          }
          ['Home', 'Search', 'Detail(id=1)'].forEach(r => { const e = entry(r); stack.push(e); col.append(e.el); });
          detailBtn.innerHTML = hl(`navigate(Detail(id = ${n}))`);
          paint();
          say(o, 'Three screens deep. Push, pop, and try the two options.');
          el.append(
            h('div', { class: 'stage and-nav' }, h('div', { class: 'and-stackbox' }, col, h('span', { class: 'and-lbl' }, 'back stack: newest on top')), dev),
            h('div', { class: 'controls' },
              detailBtn, cmd('navigate(Search)', () => push('Search')), cmd('popBackStack()  // Back', back),
              cmd('navigate(Search) { launchSingleTop = true }', single), cmd('navigate(Settings) { popUpTo<Home>() }', clearTo)),
            o);
        },
        predict: {
          q: 'The stack is Home, Search, Detail(id=1). You call <code>navigate(Detail(id = 2))</code> with no options. How many entries are on the stack?',
          options: ['3: Detail(2) replaces Detail(1)', '4: a new entry is pushed on top', '2: Search is popped first'],
          a: 1,
          why: 'A plain <code>navigate</code> always pushes, even to the same destination with new arguments. Only options like <code>launchSingleTop</code> or <code>popUpTo</code> change that.',
        },
      },

      // 5a ────────────────────────────────────────────
      {
        id: 'launch-modes',
        title: 'Launch modes and task affinity',
        tagline: 'With several Activities, the manifest and intent flags decide whether a screen is reused and which task it joins.',
        level: 'intermediate',
        body: `
<p>With one Activity and Compose, the Navigation back stack is all you manage. Once there are several Activities, or other apps start yours, the system's own stack matters too: a <em>task</em> of Activity instances, newest on top. What <code>startActivity</code> does to that task depends on the target's <em>launch mode</em> in the manifest, and on any intent flags.</p>
<p><code>standard</code>, the default, always creates a new instance on top of the caller's task. <code>singleTop</code> reuses the instance if it is already on top. <code>singleTask</code> keeps one instance: starting it again finishes every Activity above it. <code>singleInstance</code> works like <code>singleTask</code>, but the Activity is alone in its task.</p>
<p>A reused Activity doesn't run <code>onCreate</code> again. The new Intent arrives in <code>onNewIntent()</code>, and <code>getIntent()</code> keeps returning the old one until you call <code>setIntent()</code>. Most apps need only <code>standard</code>, plus an intent flag for the odd case.</p>`,
        code: `// AndroidManifest.xml
// <activity android:name=".ArticleActivity" android:launchMode="singleTop" />

class ArticleActivity : ComponentActivity() {
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)                          // otherwise getIntent() stays old
        show(intent.getLongExtra("id", -1))
    }
}

// Clear everything above MainActivity and reuse it, no manifest change
startActivity(Intent(this, MainActivity::class.java)
    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP))`,
        remember: 'standard always adds, singleTop reuses the top, singleTask keeps one and clears above it. A reused Activity gets onNewIntent, not onCreate.',
        terms: [
          { term: 'Launch mode', def: 'The manifest setting (standard, singleTop, singleTask, singleInstance, singleInstancePerTask) that decides how startActivity places an Activity in a task.' },
          { term: 'onNewIntent', def: 'The callback a reused Activity instance receives with the new Intent, instead of a fresh onCreate.' },
          { term: 'Task affinity', def: 'The task an Activity prefers to join. By default it is the app’s namespace, shared by all its Activities.' },
          { term: 'FLAG_ACTIVITY_CLEAR_TOP', def: 'An intent flag that finishes every Activity above the target when the target is already in the task.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Reuse ArticleActivity when it is on top, and keep getIntent() current.', code: '// <activity android:name=".ArticleActivity" android:launchMode="[[singleTop]]" />\n\noverride fun [[onNewIntent]](intent: Intent) {\n    super.onNewIntent(intent)\n    [[setIntent]](intent)\n    show(intent.getLongExtra("id", -1))\n}', why: '<code>singleTop</code> sends the Intent to the instance on top through <code>onNewIntent</code>. <code>setIntent</code> makes later <code>getIntent()</code> calls see it.' },
          { type: 'bug', prompt: 'Tapping a second article notification keeps showing the first article. Tap the line.', code: 'class ArticleActivity : ComponentActivity() {\n    override fun onNewIntent(intent: Intent) {\n        super.onNewIntent(intent)\n        val id = getIntent().getLongExtra("id", -1)\n        show(id)\n    }\n}', bug: 3, fix: '        val id = intent.getLongExtra("id", -1)', why: '<code>getIntent()</code> still returns the Intent that created the Activity. The new one is the parameter of <code>onNewIntent</code>.' },
        ],
        quiz: [
          { q: 'The task is Main, Article. Article is <code>singleTop</code>. You start Article again. What happens?', options: ['A second Article is pushed', 'The Article on top gets <code>onNewIntent()</code>', 'Article is finished and recreated'], a: 1, why: 'It is already on top, so singleTop reuses it and delivers the Intent to <code>onNewIntent()</code>.' },
          { q: 'The task is Main, Article, Settings. Article is <code>singleTask</code>. You start Article. The task becomes', options: ['Main, Article, Settings, Article', 'Main, Article', 'Article'], a: 1, why: 'singleTask keeps one instance and finishes everything above it. Article then gets <code>onNewIntent()</code>.' },
          { q: 'The manifest says <code>standard</code>, but the caller adds <code>FLAG_ACTIVITY_SINGLE_TOP</code>. Which wins?', options: ['The manifest', 'The intent flag'], a: 1, why: 'When both are set, the caller’s intent flags are honored over the manifest launch mode.' },
          { q: 'The task is List, Article, Settings, all <code>standard</code>. You start List with only <code>FLAG_ACTIVITY_CLEAR_TOP</code>. What happens?', options: ['Article and Settings finish, and the old List gets <code>onNewIntent()</code>', 'A second List is pushed on top of Settings', 'Article and Settings finish, then List is finished too and created again'], a: 2, why: 'CLEAR_TOP alone recreates a standard target. Add <code>FLAG_ACTIVITY_SINGLE_TOP</code> to keep the existing instance and get <code>onNewIntent()</code>.' },
          { q: 'Mail starts News’s <code>ReaderActivity</code> with a plain <code>startActivity</code>, no flags, and Reader is <code>standard</code>. Which task does Reader join?', options: ['A new task with News’s affinity', 'Mail’s task, on top of Mail’s screen', 'An existing News task, if one is running'], a: 1, why: 'A plain standard start ignores task affinity and goes on top of the caller’s task. Affinity only decides with <code>FLAG_ACTIVITY_NEW_TASK</code> or <code>singleTask</code>.' },
        ],
        deeper: [
          {
            title: 'Task affinity: which task an Activity joins',
            body: `<p>Every Activity has a <em>task affinity</em>, the task it prefers. By default it is the app's package name, so all screens of one app prefer the same task. A plain <code>standard</code> start ignores it: the new Activity goes on top of the task it was started from, even if it belongs to another app.</p>
<p>Affinity decides only when the system must pick a task. With <code>FLAG_ACTIVITY_NEW_TASK</code>, or the <code>singleTask</code> launch mode, the system puts the Activity into an existing task with the same affinity, or starts a new task if there is none. <code>singleInstance</code> goes further: the Activity is the only member of its own task. <code>singleInstancePerTask</code> must be the root of a task, but can have one instance in each of several tasks. Open an article from Mail below with each option, with and without News running.</p>`,
            code: `<!-- The News app's manifest: pick one -->
<activity android:name=".ReaderActivity" android:exported="true" />                            <!-- standard -->
<activity android:name=".ReaderActivity" android:exported="true" android:launchMode="singleTask" />
<activity android:name=".ReaderActivity" android:exported="true" android:launchMode="singleInstance" />
<activity android:name=".ReaderActivity" android:exported="true"
    android:taskAffinity="com.example.news.reader" />                                        <!-- its own affinity -->

// The Mail app: let the system pick the task by affinity
startActivity(Intent(Intent.ACTION_VIEW, articleUri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))`,
            visual(el) {
              el.classList.add('and-viz');
              const OPTS = { standard: 'standard', flag: 'FLAG_ACTIVITY_NEW_TASK', singleTask: 'launchMode="singleTask"', singleInstance: 'launchMode="singleInstance"' };
              let opt = 'standard', newsRunning = true, tasks = [], front = null, opened = false;
              const box = h('div', { class: 'and-ta-tasks' });
              const o = out();
              function reset() {
                tasks = [{ id: 'mail', aff: 'com.example.mail', stack: ['InboxActivity', 'MessageActivity'] }];
                if (newsRunning) tasks.push({ id: 'news', aff: 'com.example.news', stack: ['NewsHomeActivity'] });
                front = 'mail'; opened = false; paint();
              }
              function paint(newId) {
                box.replaceChildren(...tasks.map(t => h('div', { class: 'and-ta-task' + (t.id === front ? ' and-on' : '') + (t.id === newId ? ' drop-in' : '') },
                  h('span', { class: 'and-lbl' }, `${t.id === 'mail' ? 'Mail' : t.id === 'solo' ? 'Reader' : 'News'} task`), h('small', { class: 'and-user' }, `affinity ${t.aff}`),
                  h('div', { class: 'and-stack' }, t.stack.map((a, i) => h('div', { class: 'and-card' + (i === t.stack.length - 1 ? ' and-top' : '') }, h('span', {}, a.replace('Activity', '')), h('small', {}, i === 0 ? 'root' : '')))),
                  h('small', { class: 'and-user' }, t.id === front ? 'in front' : 'in Recents'))));
                oBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(Object.keys(OPTS)[i] === opt)));
                rBtn.setAttribute('aria-pressed', String(newsRunning));
              }
              function open() {
                if (opened) { replay(box, 'shake'); say(o, note('Reader is already open. Pick an option or reset to try again.')); return; }
                opened = true;
                const mail = tasks.find(t => t.id === 'mail');
                const news = tasks.find(t => t.aff === 'com.example.news');
                say(o, `${hl('startActivity(Intent(ACTION_VIEW, articleUri))')}  ${note(OPTS[opt])}`);
                if (opt === 'standard') {
                  mail.stack.push('ReaderActivity'); front = 'mail'; paint();
                  line(o, note('affinity ignored: Reader joins the Mail task. Back returns to the message.'));
                } else if (opt === 'singleInstance') {
                  tasks.push({ id: 'solo', aff: 'com.example.news', stack: ['ReaderActivity'] }); front = 'solo'; paint('solo');
                  line(o, note('a new task with Reader alone. Nothing else is ever launched into it.'));
                } else if (news) {
                  news.stack.push('ReaderActivity'); front = news.id; paint();
                  line(o, note('a task with affinity com.example.news exists: Reader goes on top of it. Back returns to News home, not to Mail.'));
                } else {
                  tasks.push({ id: 'news', aff: 'com.example.news', stack: ['ReaderActivity'] }); front = 'news'; paint('news');
                  line(o, note('no task with affinity com.example.news: a new task starts with Reader as its root'));
                }
              }
              const oBtns = Object.entries(OPTS).map(([k, label]) => cmd(label, () => { opt = k; reset(); say(o, note(`ReaderActivity: ${label}. Tasks reset.`)); }));
              const rBtn = cmd('News app is running', () => { newsRunning = !newsRunning; reset(); say(o, note(newsRunning ? 'News has a task in Recents' : 'News is not running: no task with its affinity')); });
              reset();
              say(o, note('Mail shows a message. Pick an option, then open the article.'));
              el.append(
                h('div', { class: 'controls' }, oBtns),
                h('div', { class: 'controls' }, rBtn),
                h('div', { class: 'stage' }, box),
                h('div', { class: 'controls' }, cmd('Mail: open the article in News', open), cmd('reset', reset)),
                o);
            },
          },
          {
            title: 'Intent flags override the manifest',
            body: `<p>The caller can ask for these behaviors per call. <code>FLAG_ACTIVITY_SINGLE_TOP</code> acts like <code>singleTop</code>. <code>FLAG_ACTIVITY_NEW_TASK</code> picks a task by affinity, like <code>singleTask</code> does. If the flags and the manifest disagree, the flags win.</p>
<p><code>FLAG_ACTIVITY_CLEAR_TOP</code> has no manifest twin. If the target is already in the task, every Activity above it is finished. A <code>standard</code> target is then finished too and created again, unless you also add <code>FLAG_ACTIVITY_SINGLE_TOP</code>, which keeps the instance and calls <code>onNewIntent()</code>. Try both on the list below.</p>`,
            code: `// Back to the list from deep inside, without a second List instance
startActivity(
    Intent(this, ListActivity::class.java)
        .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
)

// CLEAR_TOP alone on a standard Activity:
// Settings and Article finish, then List is finished and created again`,
            visual(el) {
              el.classList.add('and-viz');
              let stack = [], seq = 1, busy = false;
              const col = h('div', { class: 'and-stack' });
              const o = out();
              const mk = name => ({ name, no: seq++ });
              function paint(mark) {
                col.replaceChildren(...stack.map((a, i) => h('div', { class: 'and-card' + (i === stack.length - 1 ? ' and-top' : '') + (a === mark ? ' drop-in' : '') },
                  h('span', {}, `${a.name} #${a.no}`), h('small', {}, i === stack.length - 1 ? 'on screen' : i === 0 ? 'root' : ''))));
              }
              function reset() {
                if (busy) return;
                seq = 1; stack = ['MainActivity', 'ListActivity', 'ArticleActivity', 'SettingsActivity'].map(mk); paint();
                say(o, note('Four Activities deep. Go back to the list two ways.'));
              }
              async function clearTop(single) {
                if (busy) return;
                const li = stack.findIndex(a => a.name === 'ListActivity');
                if (li === stack.length - 1) { replay(col, 'shake'); say(o, note('List is already on top. Press reset to stack more screens.')); return; }
                busy = true;
                say(o, `${hl(`startActivity(List, ${single ? 'CLEAR_TOP or SINGLE_TOP' : 'CLEAR_TOP'})`)}`);
                for (const a of stack.slice(li + 1).reverse()) {
                  col.children[stack.indexOf(a)].classList.add('leave');
                  line(o, `${hl(`${a.name} #${a.no}.onDestroy()`)}  ${note('it was above List')}`);
                  await sleep(330); if (!el.isConnected) return;
                }
                stack = stack.slice(0, li + 1); paint();
                const list = stack[li];
                if (single) {
                  replay(col.lastElementChild, 'pop');
                  line(o, `${hl(`ListActivity #${list.no}.onNewIntent()`)}  <span class="good">same instance, its state kept</span>`);
                } else {
                  col.lastElementChild.classList.add('leave');
                  line(o, `${hl(`ListActivity #${list.no}.onDestroy()`)}  ${note('standard target: finished too')}`);
                  await sleep(380); if (!el.isConnected) return;
                  const fresh = mk('ListActivity'); stack[li] = fresh; paint(fresh);
                  line(o, `${hl(`ListActivity #${fresh.no}.onCreate()`)}  <span class="bad">a new instance: scroll position and state are gone</span>`);
                }
                busy = false;
              }
              reset();
              el.append(
                h('div', { class: 'stage and-nav' }, h('div', { class: 'and-stackbox' }, col, h('span', { class: 'and-lbl' }, 'task: newest on top'))),
                h('div', { class: 'controls' }, cmd('CLEAR_TOP', () => clearTop(false)), cmd('CLEAR_TOP or SINGLE_TOP', () => clearTop(true)), cmd('reset', reset)),
                o);
            },
          },
          {
            title: 'singleTask and singleInstance are for special screens',
            body: `<p>The docs mark <code>singleTask</code> as not for general use, and say <code>singleTask</code> and <code>singleInstance</code> should only be used on an Activity with an <code>ACTION_MAIN</code> and <code>CATEGORY_LAUNCHER</code> filter, so the user can always get back to that task from the launcher.</p>
<p>Back still pops one Activity at a time. But if a <code>singleTask</code> Activity already lives in a task in the background, that whole task comes forward, and Back walks through it before it reaches the app that started it. <code>singleInstancePerTask</code> is the newer middle ground: the Activity must be the root of its task, so there is one per task, but <code>FLAG_ACTIVITY_MULTIPLE_TASK</code> or <code>FLAG_ACTIVITY_NEW_DOCUMENT</code> can open it in several tasks.</p>`,
            code: `<!-- A launcher entry point that should exist once -->
<activity android:name=".HomeActivity" android:exported="true"
    android:launchMode="singleTask">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>

<!-- Everything else: leave launchMode out (standard) -->
<activity android:name=".ArticleActivity" />`,
          },
        ],
        underHood: {
          body: `<p>Tasks are kept by the system, not by your process. Recents shows tasks, so one app can appear twice if its Activities sit in two tasks. When your process dies, its tasks stay in Recents, and the top Activity is created again from its saved state when the user returns.</p>
<p>On Android 12 and higher, Back on the root Activity of a launcher task no longer finishes it. The task moves to the background, like Home, so the next launch is warm. To look at the real stacks on a device, dump them with adb.</p>`,
          code: `# Every task with its Activities, top first
adb shell dumpsys activity activities`,
        },
        mistakes: [
          {
            title: 'Reading getIntent() in onNewIntent',
            bad: `override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    render(getIntent().getStringExtra("q"))   // the old Intent
}`,
            good: `override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    render(intent.getStringExtra("q"))
}`,
            why: 'A reused instance keeps the Intent that created it. Use the parameter, and call <code>setIntent</code> so code that reads <code>intent</code> later, for example after rotation, sees the new one.',
          },
          {
            title: 'Starting an Activity from the application Context',
            bad: `class Router(private val app: Application) {
    fun openSettings() = app.startActivity(Intent(app, SettingsActivity::class.java))
}`,
            good: `class Router {
    fun openSettings(activity: Activity) =
        activity.startActivity(Intent(activity, SettingsActivity::class.java))
}`,
            why: 'Outside an Activity there is no task to join, so the call throws and asks for <code>FLAG_ACTIVITY_NEW_TASK</code>. Adding the flag hides the problem and can open the screen in another task. Start screens from an Activity.',
          },
          {
            title: 'singleInstance to avoid duplicate screens',
            bad: `<activity android:name=".ArticleActivity" android:launchMode="singleInstance" />`,
            good: `<activity android:name=".ArticleActivity" android:launchMode="singleTop" />
<!-- or keep standard and add FLAG_ACTIVITY_SINGLE_TOP when starting it -->`,
            why: 'A singleInstance Activity lives alone in its own task, and every Activity it starts opens in another task. Back and Recents then jump between tasks in ways users don’t expect. singleTop is enough to stop double taps.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const MODES = ['standard', 'singleTop', 'singleTask'];
          let mode = 'standard', stack = [], n = 2, seq = 1, busy = false;
          const col = h('div', { class: 'and-stack' });
          const o = out();
          const mk = (name, id) => ({ name, id, no: seq++ });
          function paint(mark) {
            col.replaceChildren(...stack.map((a, i) => {
              const top = i === stack.length - 1;
              return h('div', { class: 'and-card' + (top ? ' and-top' : '') + (mark === a ? ' drop-in' : '') },
                h('span', {}, `${a.name} #${a.no}`), h('small', {}, a.id != null ? `id=${a.id}` : top ? 'on screen' : ''));
            }));
          }
          function reset() {
            seq = 1; n = 2;
            stack = [mk('MainActivity', null), mk('ArticleActivity', 1)];
            paint(); press(); artBtn.innerHTML = hl(`startActivity(Article(id = ${n}))`);
          }
          const modeBtns = MODES.map(m => cmd(`launchMode="${m}"`, () => {
            if (busy) return;
            mode = m; reset();
            say(o, note(`ArticleActivity is now ${m}. The task was reset.`));
          }));
          const press = () => modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(MODES[i] === mode)));
          function nope(msg) { if (busy) return; replay(col, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); }
          async function openArticle() {
            if (busy) return;
            if (stack.length >= 7) return nope('the task is getting tall. Press Back or pick a mode to reset.');
            busy = true;
            const id = n++;
            artBtn.innerHTML = hl(`startActivity(Article(id = ${n}))`);
            say(o, `${hl(`startActivity(Article(id = ${id}))`)}  ${note(`launchMode = ${mode}`)}`);
            const top = stack[stack.length - 1];
            const existing = stack.findIndex(a => a.name === 'ArticleActivity');
            if (mode === 'singleTop' && top.name === 'ArticleActivity') {
              top.id = id; paint(); replay(col.lastElementChild, 'pop');
              line(o, `${hl(`ArticleActivity #${top.no}.onNewIntent(id = ${id})`)}  ${note('already on top: reused')}`);
            } else if (mode === 'singleTask' && existing >= 0) {
              const above = stack.slice(existing + 1).reverse();
              for (const a of above) {
                col.children[stack.indexOf(a)].classList.add('leave');
                line(o, `${hl(`${a.name} #${a.no}.onDestroy()`)}  ${note('cleared: it was above ArticleActivity')}`);
                await sleep(320); if (!el.isConnected) return;
              }
              stack = stack.slice(0, existing + 1);
              const t = stack[existing]; t.id = id; paint(); replay(col.lastElementChild, 'pop');
              line(o, `${hl(`ArticleActivity #${t.no}.onNewIntent(id = ${id})`)}  ${note('the one instance, brought to the top')}`);
            } else {
              const a = mk('ArticleActivity', id); stack.push(a); paint(a);
              line(o, `${hl(`ArticleActivity #${a.no}.onCreate()`)}  ${note(mode === 'standard' ? 'standard: always a new instance' : 'not on top, so a new instance')}`);
            }
            busy = false;
          }
          function openSettings() {
            if (busy) return;
            if (stack.length >= 7) return nope('the task is getting tall. Press Back or pick a mode to reset.');
            const a = mk('SettingsActivity', null); stack.push(a); paint(a);
            say(o, `${hl('startActivity(Settings)')}  ${note(`SettingsActivity #${a.no}.onCreate()`)}`);
          }
          async function back() {
            if (busy) return;
            if (stack.length === 1) return nope('MainActivity is the root. On Android 12+, Back here moves the task to the background.');
            busy = true;
            const a = stack.pop();
            col.lastElementChild.classList.add('leave');
            say(o, `${note('press Back')}`);
            line(o, `${hl(`${a.name} #${a.no}.onDestroy()`)}`);
            await sleep(420); if (!el.isConnected) return;
            paint(); busy = false;
          }
          const artBtn = cmd('', openArticle);
          reset();
          say(o, note('MainActivity, then an article. Pick a launch mode, then open another article.'));
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            h('div', { class: 'stage and-nav' }, h('div', { class: 'and-stackbox' }, col, h('span', { class: 'and-lbl' }, 'task: newest on top'))),
            h('div', { class: 'controls' }, artBtn, cmd('startActivity(Settings)', openSettings), cmd('press Back', back)),
            o);
        },
        predict: {
          q: 'ArticleActivity is <code>standard</code> and already on top of the task. You start it again. What runs?',
          options: ['<code>onNewIntent()</code> on the same instance', '<code>onCreate()</code> on a second ArticleActivity', 'Nothing: it is already on screen'],
          a: 1,
          why: '<code>standard</code> always creates a new instance on top of the caller, even when one is already on top. Reuse needs <code>singleTop</code> or a flag.',
        },
      },

      // 5b ────────────────────────────────────────────
      {
        id: 'predictive-back',
        title: 'Predictive back',
        tagline: 'The system previews where Back leads, so it must know before the swipe ends.',
        level: 'intermediate',
        body: `
<p>With predictive back, the user starts the back swipe and sees where it leads, the previous screen or the home screen, before letting go. They can still cancel. To draw that preview, the system must know <em>when the gesture starts</em> whether your app wants Back for itself. A method that runs after the fact, like the old <code>onBackPressed()</code>, can't tell it that.</p>
<p>So you register an <code>OnBackPressedCallback</code> and keep it enabled only while Back must do something else, for example while a draft is unsaved. In Compose that is <code>BackHandler(enabled = …)</code>. When no callback is enabled, the system handles Back and animates the preview.</p>
<p>For apps that target Android 16 (API 36) and run on Android 16 or higher, this is the default: the system animations are on, <code>onBackPressed()</code> is not called, and <code>KEYCODE_BACK</code> is not dispatched. Switch the target and the implementation below, then try the gesture with and without a draft.</p>`,
        code: `class EditorActivity : ComponentActivity() {
    private val discardCallback = object : OnBackPressedCallback(false) {   // starts disabled
        override fun handleOnBackPressed() = showDiscardDialog()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        onBackPressedDispatcher.addCallback(this, discardCallback)
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.hasUnsavedChanges.collect { discardCallback.isEnabled = it }
            }
        }
    }
}

// The same in Compose
@Composable
fun EditorScreen(state: EditorState) {
    var confirm by remember { mutableStateOf(false) }
    BackHandler(enabled = state.hasUnsavedChanges) { confirm = true }
    if (confirm) DiscardDialog(onDismiss = { confirm = false })
}`,
        remember: 'Never override onBackPressed. Enable a back callback only while Back must do something else; otherwise let the system animate.',
        terms: [
          { term: 'Predictive back', def: 'A back gesture that shows a preview of the destination while the user swipes, and can be cancelled.' },
          { term: 'OnBackPressedCallback', def: 'An AndroidX callback that handles Back while its isEnabled is true.' },
          { term: 'OnBackPressedDispatcher', def: 'The Activity’s list of back callbacks. It asks the most recently added enabled callback first.' },
          { term: 'enableOnBackInvokedCallback', def: 'A manifest attribute on <application> or <activity> that opts in to, or temporarily out of, predictive back.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Register a callback that handles Back.', code: 'val callback = object : OnBackPressedCallback(false) {\n    override fun [[handleOnBackPressed]]() = showDiscardDialog()\n}\nonBackPressedDispatcher.[[addCallback]](this, callback)', why: 'The dispatcher calls <code>handleOnBackPressed()</code> on the latest enabled callback. Passing <code>this</code> ties the callback to the Activity’s lifecycle.' },
          { type: 'bug', prompt: 'Before the user types anything, Back already shows the discard dialog and there is no back preview. Tap the line.', code: 'class EditorActivity : ComponentActivity() {\n    private val discardCallback = object : OnBackPressedCallback(true) {\n        override fun handleOnBackPressed() = showDiscardDialog()\n    }\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        onBackPressedDispatcher.addCallback(this, discardCallback)\n        editor.doAfterTextChanged { discardCallback.isEnabled = true }\n    }\n}', bug: 1, fix: '    private val discardCallback = object : OnBackPressedCallback(false) {', why: 'The callback starts enabled, so the app claims Back from the first frame. Start it disabled and enable it when there is something to lose.' },
        ],
        quiz: [
          { q: 'An app targets API 36, runs on Android 16, and overrides <code>onBackPressed()</code> to show a dialog. The user presses Back.', options: ['The dialog shows, as before', '<code>onBackPressed()</code> is not called and the screen closes', 'The app crashes'], a: 1, why: 'For these apps the system no longer calls <code>onBackPressed()</code>. Use an <code>OnBackPressedCallback</code> or <code>BackHandler</code>.' },
          { q: 'Why keep a back callback disabled when it has nothing to do?', options: ['It saves battery', 'An enabled callback tells the system the app takes Back, so no preview can be shown', 'Disabled callbacks run faster'], a: 1, why: 'The system decides at the start of the gesture. An enabled callback means "my app handles this", which rules out the preview animation.' },
          { q: 'The Activity added a callback, then a Fragment added one. Both are enabled. Back is pressed. Which runs?', options: ['The Activity’s', 'The Fragment’s, the one added last', 'Both, in order'], a: 1, why: 'Callbacks are asked in reverse order of adding, and only the first enabled one runs.' },
          { q: 'You want a sheet to shrink with the finger during the back swipe. Which API fits?', options: ['<code>BackHandler</code>, reading the progress in its lambda', '<code>PredictiveBackHandler</code>, collecting the <code>Flow&lt;BackEventCompat&gt;</code> progress', 'Overriding <code>onBackPressed()</code> and animating there'], a: 1, why: '<code>BackHandler</code> runs once, when the user lets go. <code>PredictiveBackHandler</code> streams progress from 0 to 1, completes on commit and throws on cancel.' },
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>override fun handleOnBackPressed() {\n    saveDraft()\n    onBackPressedDispatcher.onBackPressed()\n}</code></pre>', options: ['<code>onBackPressedDispatcher.onBackPressed()</code>: the callback is still enabled, so Back comes straight back to it', '<code>saveDraft()</code>: saving must happen in <code>onStop</code>', '<code>override fun handleOnBackPressed()</code>: it should be <code>onBackPressed()</code>'], a: 0, why: 'While enabled, the callback is first in line. Set <code>isEnabled = false</code> before dispatching so Back moves on to the next callback or the system.' },
        ],
        deeper: [
          {
            title: 'Several callbacks: the last added is asked first',
            body: `<p>An Activity, its Fragments and open sheets can all register callbacks with the same dispatcher. On Back, the dispatcher asks them in reverse order of adding, and the first <em>enabled</em> one handles it. If none is enabled, Back goes to the system.</p>
<p>Use <code>addCallback(lifecycleOwner, callback)</code>: the callback is only active while that owner is at least <code>STARTED</code>, and it is removed when the owner is destroyed. To pause a callback for a while, flip <code>isEnabled</code> rather than removing and adding it again, which would change its place in the order.</p>`,
            code: `// The Activity adds first
onBackPressedDispatcher.addCallback(this, closeSearchCallback)

// The Fragment adds later, so it is asked first
requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner, discardDraftCallback)

discardDraftCallback.isEnabled = false   // now Back reaches closeSearchCallback`,
            visual(el) {
              el.classList.add('and-viz');
              const CBS = [
                { who: 'MainActivity', name: 'closeSearch', on: false, act: 'close the search bar' },
                { who: 'EditorFragment', name: 'discardDraft', on: true, act: 'show the discard dialog' },
                { who: 'BottomSheet', name: 'collapseSheet', on: false, act: 'collapse the sheet' },
              ];
              let busy = false;
              const rows = CBS.map(c => {
                const tog = cmd('', () => { if (busy) return; c.on = !c.on; paint(); say(o, `${hl(`${c.name}.isEnabled = ${c.on}`)}`); });
                const r = h('div', { class: 'and-step' }, h('span', {}, `${c.who}: ${c.name}`), tog);
                r.tog = tog; return r;
              });
              const sys = h('div', { class: 'and-step' }, h('span', {}, 'system: animate and go back'), h('span', { class: 'and-res' }, 'fallback'));
              const o = out();
              function paint() {
                CBS.forEach((c, i) => { rows[i].tog.textContent = c.on ? 'enabled' : 'disabled'; rows[i].tog.setAttribute('aria-pressed', String(c.on)); rows[i].className = 'and-step'; });
                sys.className = 'and-step';
              }
              async function back() {
                if (busy) return; busy = true;
                paint();
                say(o, note('press Back: ask the newest callback first'));
                for (let i = CBS.length - 1; i >= 0; i--) {
                  const c = CBS[i];
                  rows[i].classList.add(c.on ? 'and-on' : 'and-skip');
                  replay(rows[i], 'pop-soft');
                  await sleep(380); if (!el.isConnected) return;
                  if (c.on) { line(o, `${hl(`${c.name}.handleOnBackPressed()`)}  ${note(c.act + '. Nobody else is asked.')}`); busy = false; return; }
                  line(o, note(`${c.name} is disabled: skip`));
                }
                sys.classList.add('and-on'); replay(sys, 'pop');
                line(o, `<span class="good">no enabled callback:</span> ${note('the system owns Back and can show the preview')}`);
                busy = false;
              }
              paint();
              say(o, note('Three callbacks, added top to bottom. Toggle them and press Back.'));
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-cx-jobs' }, h('span', { class: 'and-lbl' }, 'callbacks, oldest first'), rows, h('span', { class: 'and-lbl' }, 'none enabled'), sys)),
                h('div', { class: 'controls' }, cmd('press Back', back)),
                o);
            },
          },
          {
            title: 'Move the UI with the finger',
            body: `<p><code>BackHandler</code> runs once, when the user lets go. To animate your own UI during the swipe, use <code>PredictiveBackHandler</code> from <code>activity-compose</code> 1.8.0 or newer. It hands you a <code>Flow&lt;BackEventCompat&gt;</code> with the swipe <code>progress</code> from 0 to 1, the touch position and the swipe edge.</p>
<p>When the flow completes, the user committed: do the back action. When the user cancels, the collection throws <code>CancellationException</code>: animate back to rest. In Views, the same events arrive in <code>handleOnBackStarted</code>, <code>handleOnBackProgressed</code> and <code>handleOnBackCancelled</code> of <code>OnBackPressedCallback</code> (AndroidX Activity 1.8.0 or newer), on Android 14 and higher.</p>`,
            code: `@Composable
fun FilterSheet(onClose: () -> Unit) {
    var progress by remember { mutableFloatStateOf(0f) }
    PredictiveBackHandler { events ->
        try {
            events.collect { progress = it.progress }   // 0f..1f while swiping
            onClose()                                   // committed
        } catch (e: CancellationException) {
            progress = 0f                               // cancelled: back to rest
            throw e
        }
    }
    Sheet(Modifier.graphicsLayer {
        scaleX = 1f - progress * 0.1f
        scaleY = 1f - progress * 0.1f
        translationX = progress * 48.dp.toPx()
    })
}`,
            visual(el) {
              el.classList.add('and-viz');
              el.style.overflowX = 'clip'; // the closed sheet slides off to the right
              let p = 0, open = true, events = 0;
              const card = h('div', { class: 'and-pb-card' }, h('span', { class: 'and-lbl' }, 'FilterSheet'), ...bars(80, 60, 70));
              const range = h('input', { type: 'range', min: '0', max: '100', value: '0', class: 'and-pb-range', 'aria-label': 'back swipe progress' });
              const o = out();
              function draw() {
                card.style.transform = open ? `translateX(${p * 48}px) scale(${1 - p * 0.1})` : 'translateX(120%) scale(0.9)';
                card.style.opacity = open ? '1' : '0';
              }
              range.addEventListener('input', () => {
                if (!open) { range.value = '0'; return; }
                p = range.value / 100; events++; draw();
                if (events % 4 === 1) say(o, `${hl(`BackEventCompat(progress = ${p.toFixed(2)}, swipeEdge = EDGE_LEFT)`)}  ${note('emitted to the flow')}`);
              });
              function commit() {
                if (!open) return say(o, note('the sheet is closed. Reset to open it.'));
                open = false; card.style.transition = 'transform 0.35s, opacity 0.35s'; draw();
                say(o, `${note('the user lets go')}`);
                line(o, `${hl('onClose()')}  ${note('the flow completed: committed')}`);
              }
              function cancel() {
                if (!open) return say(o, note('the sheet is closed. Reset to open it.'));
                card.style.transition = 'transform 0.35s'; p = 0; range.value = '0'; draw();
                say(o, `${hl('catch (e: CancellationException)')}  ${note('the user swiped back to the edge: animate to rest')}`);
              }
              function reset() { open = true; p = 0; range.value = '0'; events = 0; card.style.transition = 'transform 0.35s, opacity 0.35s'; draw(); say(o, note('sheet open again. Drag the slider like a back swipe.')); }
              range.addEventListener('pointerdown', () => { card.style.transition = 'none'; });
              draw();
              say(o, note('Drag the slider like a back swipe, then let go or cancel.'));
              el.append(
                h('div', { class: 'stage' }, card),
                h('div', { class: 'controls' }, range),
                h('div', { class: 'controls' }, cmd('let go (commit)', commit), cmd('swipe back to the edge (cancel)', cancel), cmd('reset', reset)),
                o);
            },
          },
          {
            title: 'What changed, release by release',
            body: `<ul>
<li><strong>Android 13</strong> introduced predictive back as an opt-in with <code>android:enableOnBackInvokedCallback="true"</code>. On Android 13 and 14 the back-to-home animation showed only with a developer option.</li>
<li><strong>Android 14</strong> added in-app progress: predictive back transitions and the progress callbacks work on Android 14 and higher.</li>
<li><strong>Android 15</strong> removed the developer option. The back-to-home, cross-task and cross-activity animations show for apps that opted in.</li>
<li><strong>Target Android 16 (API 36)</strong> and run on Android 16 or higher: the animations are on by default, <code>onBackPressed()</code> is not called, and <code>KEYCODE_BACK</code> is not dispatched. If you still rely on them, migrate, or opt out <em>temporarily</em> with <code>enableOnBackInvokedCallback="false"</code> on <code>&lt;application&gt;</code> or one <code>&lt;activity&gt;</code>.</li>
</ul>`,
            code: `<!-- Temporary opt-out while you migrate, for the whole app -->
<application android:enableOnBackInvokedCallback="false">

    <!-- Or keep predictive back on, and opt out one screen -->
    <activity android:name=".LegacyEditorActivity"
        android:enableOnBackInvokedCallback="false" />
</application>`,
          },
        ],
        underHood: {
          body: `<p>Since Android 13 the platform has its own <code>OnBackInvokedDispatcher</code> on each window. The AndroidX <code>OnBackPressedDispatcher</code> sits on top of it. While at least one AndroidX callback is enabled, it registers a single platform callback, which tells the system "this app handles Back". When the last one is disabled, it unregisters that callback, and the system is free to play its own animation.</p>
<p>That is why <code>isEnabled</code> matters more than what happens inside the callback: the system reads the registration when the gesture starts, long before your code would run.</p>`,
          code: `// Roughly what androidx.activity does on Android 13+
// any AndroidX callback enabled?  -> register one OnBackInvokedCallback with the window
// none enabled?                   -> unregister it: the system owns Back and can animate`,
        },
        mistakes: [
          {
            title: 'Overriding onBackPressed()',
            bad: `override fun onBackPressed() {
    if (hasUnsavedChanges) showDiscardDialog() else super.onBackPressed()
}`,
            good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val discard = onBackPressedDispatcher.addCallback(this, enabled = false) { showDiscardDialog() }
    viewModel.hasUnsavedChanges.observe(this) { discard.isEnabled = it }
}`,
            why: 'It is deprecated, and for apps targeting Android 16 it is not called at all, so the dialog silently disappears and drafts are lost.',
          },
          {
            title: 'A callback that is always on',
            bad: `onBackPressedDispatcher.addCallback(this) {
    if (hasUnsavedChanges) showDiscardDialog()
    else finish()          // Back never reaches the system
}`,
            good: `val cb = onBackPressedDispatcher.addCallback(this, enabled = false) {
    showDiscardDialog()
}
cb.isEnabled = hasUnsavedChanges`,
            why: 'The always-enabled callback takes every Back, so the user never gets the preview, and you re-implement what the system does better.',
          },
          {
            title: 'Calling the dispatcher from your own callback',
            bad: `override fun handleOnBackPressed() {
    saveDraft()
    onBackPressedDispatcher.onBackPressed()   // calls this same callback again
}`,
            good: `override fun handleOnBackPressed() {
    saveDraft()
    isEnabled = false
    onBackPressedDispatcher.onBackPressed()   // now reaches the next one, or the system
}`,
            why: 'While the callback is enabled, the dispatcher sends Back straight back to it. Disable it first so Back moves on.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const IMPL = { override: 'override onBackPressed()', always: 'callback, always enabled', toggle: 'callback, enabled while unsaved' };
          let t36 = true, impl = 'toggle', unsaved = false, phase = 'idle', busy = false;
          const { dev, view } = device('and-tall');
          const field = h('div', { class: 'and-pb-field' }, 'Write a comment…');
          const top = h('div', { class: 'and-pb-top' }, appbar('← New comment'), field, ...bars(70, 50));
          const under = h('div', { class: 'and-pb-under' }, appbar('Article'), ...bars(90, 70, 85, 60, 75, 55));
          const layers = h('div', { class: 'and-pb-layers' }, under, top);
          const arrow = h('span', { class: 'and-pb-arrow', hidden: true }, '‹');
          const cbEl = h('span', { class: 'and-perm' });
          const obpEl = h('span', { class: 'and-perm' });
          const draftEl = h('span', { class: 'and-perm' });
          const o = out();
          const enabled = () => (impl === 'always' ? true : impl === 'toggle' ? unsaved : false);
          const preview = () => t36 && !enabled();
          function paint() {
            cbEl.textContent = impl === 'override' ? 'no callback' : `callback.isEnabled = ${enabled()}`;
            cbEl.className = 'and-perm' + (impl === 'override' ? '' : enabled() ? ' and-d2-mid' : ' and-ok');
            obpEl.textContent = impl !== 'override' ? 'onBackPressed(): not used' : t36 ? 'onBackPressed(): never called' : 'onBackPressed(): called';
            obpEl.className = 'and-perm' + (impl === 'override' ? (t36 ? ' and-no' : ' and-ok') : '');
            draftEl.textContent = unsaved ? 'draft: unsaved' : 'draft: empty or saved';
            draftEl.className = 'and-perm' + (unsaved ? ' and-d2-mid' : '');
            field.textContent = unsaved ? 'Great article, thanks!' : 'Write a comment…';
            field.classList.toggle('and-on', unsaved);
            Object.keys(IMPL).forEach((k, i) => iBtns[i].setAttribute('aria-pressed', String(k === impl)));
            tBtn.setAttribute('aria-pressed', String(t36));
            tBtn.innerHTML = hl(t36 ? 'targetSdk = 36, Android 16' : 'targetSdk = 35, Android 16');
          }
          function clearOverlays() { dev.querySelectorAll('.and-dlg').forEach(x => x.remove()); }
          function reopen() {
            if (busy) return;
            phase = 'idle'; unsaved = false; clearOverlays(); arrow.hidden = true;
            top.className = 'and-pb-top'; paint();
            say(o, note('the editor is open on top of the article'));
          }
          function closeEditor(how) {
            phase = 'gone'; top.className = 'and-pb-top and-pb-out'; arrow.hidden = true;
            line(o, `${hl('EditorActivity.finish()')}  ${note(how)}`);
            if (unsaved) line(o, '<span class="bad">draft lost</span>');
            unsaved = false; paint();
          }
          function dialog() {
            phase = 'dialog';
            const d = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Discard comment?'),
              h('span', { class: 'and-row' },
                h('button', { class: 'and-ui', onclick() { d.remove(); unsaved = false; closeEditor('user chose Discard'); } }, 'Discard'),
                h('button', { class: 'and-ui and-ghost', onclick() { d.remove(); phase = 'idle'; say(o, note('keep editing: the draft is safe')); } }, 'Keep')));
            dev.append(d);
          }
          function nope(msg) { if (busy) return; replay(dev, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); }
          function type() {
            if (phase !== 'idle') return nope('the editor is not in front.');
            unsaved = true; paint(); replay(field, 'pop-soft');
            say(o, note(impl === 'toggle' ? 'text changed: callback.isEnabled = true' : 'text changed'));
          }
          function save() {
            if (phase !== 'idle') return nope('the editor is not in front.');
            if (!unsaved) return nope('nothing to save.');
            unsaved = false; paint();
            say(o, note(impl === 'toggle' ? 'saved: callback.isEnabled = false. Back belongs to the system again.' : 'saved'));
          }
          function swipe() {
            if (phase !== 'idle') return nope(phase === 'gone' ? 'the editor is closed. Open it again.' : 'finish the current gesture or dialog first.');
            phase = 'swipe';
            say(o, note('the user starts a back swipe'));
            if (preview()) {
              top.classList.add('and-pb-peek');
              line(o, `<span class="good">preview:</span> ${note('no enabled callback, so the system shows the article behind')}`);
            } else {
              arrow.hidden = false;
              line(o, note(!t36 ? 'targetSdk 35: no predictive animation, just the back arrow' : 'a callback is enabled: the app claimed Back, so no preview'));
            }
          }
          function cancel() {
            if (phase !== 'swipe') return nope('start a back swipe first.');
            phase = 'idle'; top.classList.remove('and-pb-peek'); arrow.hidden = true;
            say(o, note('the user swipes back to the edge: cancelled, nothing happens'));
          }
          function release() {
            if (phase !== 'swipe') return nope('start a back swipe first.');
            top.classList.remove('and-pb-peek'); arrow.hidden = true;
            say(o, note('the user lets go'));
            if (impl === 'override') {
              if (t36) { line(o, `<span class="bad">onBackPressed() not called</span> ${note('targetSdk 36: the system handles Back')}`); closeEditor('by the system'); return; }
              line(o, hl('onBackPressed()'));
              if (unsaved) { dialog(); return; }
              closeEditor('super.onBackPressed()'); return;
            }
            if (enabled()) {
              line(o, hl('callback.handleOnBackPressed()'));
              if (unsaved) { dialog(); return; }
              closeEditor('the callback calls finish() itself, without a preview'); return;
            }
            closeEditor(t36 ? 'by the system, after the preview' : 'by the system');
          }
          const iBtns = Object.entries(IMPL).map(([k, label]) => cmd(label, () => { if (busy) return; impl = k; reopen(); say(o, note(`implementation: ${label}`)); }));
          const tBtn = cmd('', () => { if (busy) return; t36 = !t36; reopen(); say(o, note(t36 ? 'targetSdk 36 on Android 16: predictive back on by default' : 'targetSdk 35 without opt-in: the old behavior')); });
          view.replaceChildren(layers);
          dev.append(arrow);
          reopen();
          say(o, note('Try the swipe with an empty draft, then type and try again.'));
          el.append(
            h('div', { class: 'controls' }, tBtn),
            h('div', { class: 'controls' }, iBtns),
            h('div', { class: 'stage' }, dev, h('div', { class: 'and-d2-col' }, h('span', { class: 'and-lbl' }, 'EditorActivity'), cbEl, obpEl, draftEl)),
            h('div', { class: 'controls' }, cmd('type a comment', type), cmd('save draft', save), cmd('open editor again', reopen)),
            h('div', { class: 'controls' }, cmd('start back swipe', swipe), cmd('let go', release), cmd('swipe back to the edge', cancel)),
            o);
        },
        predict: {
          q: 'targetSdk 36. The draft is unsaved, so the back callback is enabled. The user starts a back swipe. What do they see?',
          options: ['The system preview of the article behind', 'No preview: the app has claimed Back', 'The app closes at once'],
          a: 1,
          why: 'The system can preview going back only when no enabled callback will intercept Back. An enabled callback means your code decides, so there is no preview.',
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'permissions',
        title: 'Runtime permissions',
        tagline: 'Check, explain, ask, and respect the answer.',
        body: `
<p>Dangerous permissions like the camera, location or microphone need the user’s yes at runtime, on top of the line in the manifest. Ask at the moment the feature needs it, so the request makes sense.</p>
<p>The flow is always the same. Check with <code>checkSelfPermission</code>. If it is granted, go ahead. If <code>shouldShowRequest<wbr>PermissionRationale</code> returns true, the user said no before, so explain why first. Then launch the request through the Activity Result API: <code>rememberLauncherForActivityResult<wbr>(RequestPermission())</code> in Compose, or <code>registerForActivityResult</code> in an Activity or Fragment.</p>
<p>Since Android 11, two denials mean “don’t ask again”. The system stops showing the dialog and answers no at once. From then on only the app’s page in Settings can turn it back on. Keep the app usable without the permission.</p>`,
        code: `// AndroidManifest.xml: <uses-permission android:name="android.permission.CAMERA" />
import android.Manifest.permission.CAMERA
import android.content.pm.PackageManager.PERMISSION_GRANTED
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission

@Composable
fun TakePhotoButton(onReady: () -> Unit) {
    val context = LocalContext.current
    val activity = LocalActivity.current
    var showRationale by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(RequestPermission()) { granted ->
        when {
            granted -> onReady()
            activity?.shouldShowRequestPermissionRationale(CAMERA) == false ->
                showSettings = true     // "don't ask again": only Settings can help now
        }
    }

    Button(onClick = {
        when {
            ContextCompat.checkSelfPermission(context, CAMERA) == PERMISSION_GRANTED -> onReady()
            activity?.shouldShowRequestPermissionRationale(CAMERA) == true -> showRationale = true
            else -> launcher.launch(CAMERA)
        }
    }) { Text("Take photo") }
}`,
        remember: 'Check first. Explain if they said no before. After two denials, only Settings can turn it back on.',
        level: 'intermediate',
        terms: [
          { term: 'Runtime permission', def: 'A dangerous permission, like camera or location, that the user must grant while the app runs, on top of the manifest entry.' },
          { term: 'Permission rationale', def: 'A short explanation the app shows before asking again, when the system reports that the user denied the permission before.' },
          { term: 'Activity Result API', def: 'The registerForActivityResult and rememberLauncherForActivityResult way to start a request and get its result in a callback.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask for the camera from Compose.', code: 'val launcher = rememberLauncherForActivityResult([[RequestPermission]]()) { granted ->\n    if (granted) startCamera()\n}\nButton(onClick = {\n    launcher.[[launch]](Manifest.permission.CAMERA)\n}) { Text("Scan") }', why: '<code>RequestPermission</code> is the contract for one permission, and <code>launch</code> shows the system dialog.' },
          { type: 'bug', prompt: 'Tapping Scan throws <code>IllegalStateException</code>. Tap the line.', code: 'class ScanActivity : ComponentActivity() {\n    fun onScanClicked() {\n        val launcher = registerForActivityResult(RequestPermission()) { ok ->\n            if (ok) startScan()\n        }\n        launcher.launch(CAMERA)\n    }\n}', bug: 2, fix: '        // register as a class property instead, before the Activity starts', why: '<code>registerForActivityResult</code> must run before the Activity reaches STARTED, so declare the launcher as a property.' },
        ],
        quiz: [
          { q: 'On the first request the user taps Don’t allow. What does <code>shouldShowRequestPermissionRationale</code> return next time?', options: ['<code>true</code>', '<code>false</code>'], a: 0, why: 'The user said no once, so Android suggests you explain before asking again.' },
          { q: 'On Android 11+ the user has denied twice. What does <code>launcher.launch(CAMERA)</code> do?', options: ['Shows the dialog again', 'Calls back with false at once, no dialog', 'Crashes'], a: 1, why: 'Two denials count as don’t ask again. The result comes back false without any UI.' },
          { q: 'Which API is the current way to request a permission?', options: ['<code>registerForActivityResult<wbr>(RequestPermission())</code>', '<code>startActivityForResult()</code>', '<code>onActivityResult()</code>'], a: 0, why: 'The Activity Result API replaces the old request code and callback overrides. In Compose use <code>rememberLauncherForActivityResult</code>.' },
          { q: 'An app targeting Android 12 launches <code>RequestMultiplePermissions</code> with <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code>. The user picks Approximate. What arrives in the result map?', options: ['FINE false, COARSE true', 'FINE true, COARSE true', 'Both false, because the user did not allow precise'], a: 0, why: 'The user can grant only the coarse one. Handle precise, approximate and none as three separate outcomes.' },
          { q: 'A geofence feature needs background location. Which order is right?', options: ['Request FINE, COARSE and BACKGROUND in one call', 'Request BACKGROUND first, then foreground if it is denied', 'Grant foreground location first, explain in your own UI, then request BACKGROUND, which opens Settings'], a: 2, why: 'A combined request is ignored. On Android 11+ background location is granted only on the Settings page, after foreground access.' },
        ],
        deeper: [
          {
            title: 'Location: the user picks precise or approximate',
            body: `<p>On Android 12 and later the location dialog has a Precise and an Approximate choice. Ask for <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code> together with <code>RequestMultiplePermissions</code>. The result is a map, and the user may grant only the coarse one.</p>
<p>If you ask for fine alone, apps targeting Android 12+ get no dialog at all. Logcat says fine must be requested with coarse. Handle all three outcomes: precise, approximate and none.</p>`,
            code: `val launcher = rememberLauncherForActivityResult(RequestMultiplePermissions()) { result ->
    when {
        result[ACCESS_FINE_LOCATION] == true -> showNearby(precise = true)
        result[ACCESS_COARSE_LOCATION] == true -> showNearby(precise = false)
        else -> showCityPicker()
    }
}
launcher.launch(arrayOf(ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION))`,
            visual(el) {
              el.classList.add('and-viz');
              let fine = false, coarse = false, precise = true, busy = false, waiting = null;
              const { dev, view } = device('and-tall');
              const fineEl = h('span', { class: 'and-perm' }), coarseEl = h('span', { class: 'and-perm' });
              const o = out();
              const ui = (text, onclick, ghost) => h('button', { class: 'and-ui' + (ghost ? ' and-ghost' : ''), onclick }, text);
              const paintMap = (fresh) => {
                fineEl.textContent = `FINE: ${fine}`; fineEl.className = 'and-perm' + (fine ? ' and-ok' : '');
                coarseEl.textContent = `COARSE: ${coarse}`; coarseEl.className = 'and-perm' + (coarse ? ' and-ok' : '');
                if (fresh) { replay(fineEl, 'pop'); replay(coarseEl, 'pop'); }
              };
              const home = () => {
                const msg = fine ? 'Stores within 50 m of you' : coarse ? 'Stores in your area (approximate)' : 'Pick your city to see stores';
                view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Stores'), h('p', {}, msg), ...bars(80, 70, 55)));
              };
              function close() { waiting = null; view.querySelectorAll('.and-dlg, .and-dim').forEach(x => x.remove()); }
              function done(f, c, why) {
                close(); fine = f; coarse = c; paintMap(true); home();
                line(o, `${hl(`callback: { FINE = ${f}, COARSE = ${c} }`)}  ${note(why)}`);
                busy = false;
              }
              function dialog() {
                view.append(h('div', { class: 'and-dim and-on' }));
                const pBtn = ui('Precise', () => pick(true)), aBtn = ui('Approximate', () => pick(false));
                const pick = v => { precise = v; pBtn.setAttribute('aria-pressed', String(v)); aBtn.setAttribute('aria-pressed', String(!v)); };
                pick(true);
                const d = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Allow Stores to access this device’s location?'),
                  h('div', { class: 'and-tog' }, pBtn, aBtn),
                  ui('While using the app', () => done(precise, true, precise ? 'precise granted' : 'the user chose approximate')),
                  ui('Don’t allow', () => done(false, false, 'denied: fall back to a city picker'), true));
                view.append(d); waiting = d;
              }
              function upgrade() {
                view.append(h('div', { class: 'and-dim and-on' }));
                const d = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Change Stores’ location access to precise?'),
                  ui('Change to precise', () => done(true, true, 'upgraded to precise')),
                  ui('Keep approximate', () => done(false, true, 'still approximate. Keep working with it.'), true));
                view.append(d); waiting = d;
              }
              function askBoth() {
                if (waiting) { replay(waiting, 'shake'); say(o, 'Answer the dialog on the phone first.'); return; }
                if (busy) return; busy = true;
                say(o, hl('launch(arrayOf(FINE, COARSE))'));
                if (fine) return done(true, true, 'already granted: no dialog');
                if (coarse) { line(o, note('approximate already granted: the system offers an upgrade')); upgrade(); return; }
                line(o, note('one dialog for both, with a precise switch'));
                dialog();
              }
              function askFine() {
                if (waiting) { replay(waiting, 'shake'); say(o, 'Answer the dialog on the phone first.'); return; }
                if (busy) return;
                replay(dev, 'shake');
                say(o, `${hl('launch(arrayOf(FINE))')}  <span class="bad">ignored:</span> no dialog`);
                line(o, note('Logcat: ACCESS_FINE_LOCATION must be requested with ACCESS_COARSE_LOCATION'));
              }
              paintMap(); home();
              say(o, 'Ask for both. In the dialog, try Approximate, then ask again.');
              el.append(
                h('div', { class: 'stage' }, dev, h('div', { class: 'and-map' }, h('span', { class: 'and-lbl' }, 'result map'), fineEl, coarseEl)),
                h('div', { class: 'controls' }, cmd('launch(arrayOf(FINE, COARSE))', askBoth), cmd('launch(arrayOf(FINE))', askFine)),
                o);
            },
          },
          {
            title: 'Background location is a second, separate step',
            body: `<p><code>ACCESS_BACKGROUND_LOCATION</code> lets the app read location while no screen is visible, for things like geofence reminders. Ask for it only after foreground location is granted, and never in the same request. A combined request is ignored.</p>
<p>On Android 11 and later, no dialog can grant it. Launching the request opens the app’s location page in Settings, where the user has to pick <em>Allow all the time</em>. Explain that in your own UI first. Google Play also reviews every app that declares it.</p>`,
            code: `// Only after FINE or COARSE is granted, and after your own explanation:
val bgLauncher = rememberLauncherForActivityResult(RequestPermission()) { granted ->
    if (granted) geofences.enable() else showAllTheTimeHelp()
}
bgLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)   // Android 11+: opens Settings`,
          },
          {
            title: 'Many features need no permission at all',
            body: `<p>Before you add a permission, check if a system UI can do the job. The photo picker and the camera app work for you without any grant, because the user picks the item themselves. Normal permissions like <code>INTERNET</code> are granted at install. A few special ones, like exact alarms, are toggled only on a Settings page.</p>
<p>Pick a task, then the bucket it belongs in.</p>`,
            visual(el) {
              el.classList.add('and-viz');
              const BINS = { none: 'no permission', install: 'granted at install', runtime: 'runtime dialog', special: 'special: Settings page' };
              const TASKS = [
                { t: 'Let the user pick a photo', b: 'none', api: 'PickVisualMedia', why: 'The photo picker runs in the system. Your app only gets the one photo the user chose.' },
                { t: 'Take one photo with the camera app', b: 'none', api: 'TakePicture', why: 'The camera app takes the picture. One catch: if your manifest declares CAMERA, you must hold it for this too.' },
                { t: 'Download a JSON feed', b: 'install', api: 'INTERNET', why: 'INTERNET is a normal permission. Declare it and it is granted at install.' },
                { t: 'Post a notification', b: 'runtime', api: 'POST_NOTIFICATIONS', why: 'A runtime permission since Android 13.' },
                { t: 'Record a voice note', b: 'runtime', api: 'RECORD_AUDIO', why: 'The microphone is a dangerous permission, so the user decides at runtime.' },
                { t: 'Ring at exactly 7:00', b: 'special', api: 'SCHEDULE_EXACT_ALARM', why: 'Exact alarms are a special permission. Check canScheduleExactAlarms() and send the user to Settings.' },
              ];
              let sel = null, left = TASKS.length;
              const o = out('Pick a task, then a bucket.');
              const bins = {};
              const taskRow = h('div', { class: 'and-tasks' });
              TASKS.forEach(x => {
                x.btn = h('button', { class: 'cmd', 'aria-pressed': 'false', onclick() {
                  sel = x; TASKS.forEach(y => y.btn && y.btn.setAttribute('aria-pressed', String(y === x)));
                  say(o, `${x.t}: which bucket?`);
                } }, x.t);
                taskRow.append(x.btn);
              });
              const sort = h('div', { class: 'and-sort' }, Object.entries(BINS).map(([k, label]) => {
                const bin = h('div', { class: 'and-bin' }, h('button', { class: 'cmd', onclick: () => drop(k) }, label));
                bins[k] = bin; return bin;
              }));
              function drop(k) {
                if (!sel) { replay(taskRow, 'shake'); say(o, left ? 'Pick a task first.' : 'All sorted. Press Reset to try again.'); return; }
                if (sel.b !== k) { replay(bins[k], 'shake'); say(o, `<span class="bad">not that one.</span> ${sel.t}: think about who picks or does the work.`); return; }
                sel.btn.remove(); sel.btn = null;
                bins[k].append(h('div', { class: 'and-tile and-match drop-in' }, sel.t, h('small', {}, sel.api)));
                say(o, `<span class="good">yes:</span> ${sel.why}`);
                sel = null; left--;
                if (!left) line(o, note('two of six needed a dialog'));
              }
              el.append(taskRow, sort, o);
            },
          },
        ],
        underHood: {
          body: `<p><code>launch()</code> goes through the Activity’s <code>ActivityResultRegistry</code>, which calls <code>requestPermissions</code>. The system then starts <code>GrantPermissionsActivity</code> from the PermissionController app on top of yours. It is a separate, translucent Activity, so yours gets <code>onPause</code> but not <code>onStop</code>.</p>
<p>The answer comes back as an Activity result, and the registry routes it to your callback by a key. The registry also keeps pending requests in the saved state, so an Activity recreated while the dialog is open still gets its result. That only works if the new instance registers the same launchers during creation. That is why <code>registerForActivityResult</code> must run before STARTED, and why <code>rememberLauncherForActivityResult</code> keeps its key in <code>rememberSaveable</code>.</p>`,
          code: `// Inside ComponentActivity, roughly
override fun <I, O> registerForActivityResult(contract: ActivityResultContract<I, O>, callback: ActivityResultCallback<O>) =
    activityResultRegistry.register("activity_rq#" + nextLocalRequestCode.getAndIncrement(), this, contract, callback)`,
        },
        mistakes: [
          {
            title: 'Asking for fine location alone',
            bad: `launcher.launch(arrayOf(ACCESS_FINE_LOCATION))`,
            good: `launcher.launch(arrayOf(ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION))`,
            why: 'Apps targeting Android 12+ get no dialog for fine alone. Ask for both and accept approximate.',
          },
          {
            title: 'Reading a false rationale as “blocked” before the first ask',
            bad: `onClick = {
    if (!activity.shouldShowRequestPermissionRationale(CAMERA)) openAppSettings()
    else launcher.launch(CAMERA)
}`,
            good: `onClick = { launcher.launch(CAMERA) }
// in the callback, after a denial:
if (!granted && !activity.shouldShowRequestPermissionRationale(CAMERA)) showSettingsHint()`,
            why: 'The rationale is also false when you have never asked. Only a false that follows a denial means the user said don’t ask again.',
          },
          {
            title: 'Asking for everything on first launch',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    launcher.launch(arrayOf(CAMERA, RECORD_AUDIO, ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION))
}`,
            good: `// Ask for each one where the feature starts
Button(onClick = { cameraLauncher.launch(CAMERA) }) { Text("Scan receipt") }`,
            why: 'Requests without context get denied, and each denial counts toward don’t ask again.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          // perm: ask (never asked) · denied (once) · blocked (twice, don't ask again) · granted
          const LABEL = { ask: 'not requested yet', denied: 'denied once', blocked: 'denied, don’t ask again', granted: 'granted' };
          let perm = 'ask', busy = false, waiting = null;
          const { dev, view } = device('and-tall');
          const permEl = h('span', { class: 'and-perm' });
          const o = out();
          const steps = {};
          const list = h('div', { class: 'and-steps' },
            [['check', 'checkSelfPermission(CAMERA)'], ['why', 'shouldShowRequestPermissionRationale(CAMERA)'], ['rat', 'your rationale UI'],
              ['launch', 'launcher.launch(CAMERA)'], ['dlg', 'system dialog'], ['cb', 'callback: granted =']].map(([k, label]) => {
              const res = h('span', { class: 'and-res' });
              return (steps[k] = Object.assign(h('div', { class: 'and-step' }, h('span', {}, label), res), { res }));
            }));
          const paintPerm = () => { permEl.textContent = `CAMERA: ${LABEL[perm]}`; permEl.className = 'and-perm' + (perm === 'granted' ? ' and-ok' : perm === 'blocked' ? ' and-no' : ''); replay(permEl, 'pop-soft'); };
          const ui = (text, onclick, ghost) => h('button', { class: 'and-ui' + (ghost ? ' and-ghost' : ''), onclick }, text);
          const screen = (...kids) => view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Receipts'), ...kids));
          const home = (msg = 'Scan a receipt to add it.') => screen(h('p', {}, msg), ...bars(80, 60), ui('Take photo', tap));
          const overlay = (...kids) => { const d = h('div', { class: 'and-dlg drop-in' }, ...kids); view.append(d); waiting = d; return d; };
          async function step(k, text, cls = '') {
            steps[k].classList.add('and-on'); steps[k].res.textContent = text; steps[k].res.className = 'and-res ' + cls;
            replay(steps[k], 'pop-soft');
            await sleep(520);
          }
          const skip = (...ks) => ks.forEach(k => { steps[k].classList.add('and-skip'); steps[k].res.textContent = 'skipped'; });
          const clearSteps = () => Object.values(steps).forEach(s => { s.className = 'and-step'; s.res.textContent = ''; });
          async function tap() {
            if (waiting) { replay(waiting, 'shake'); say(o, 'Answer what is on the phone first.'); return; }
            if (busy) return; busy = true;
            clearSteps();
            say(o, note('user taps Take photo'));
            if (perm === 'granted') {
              await step('check', 'GRANTED', 'and-ok');
              skip('why', 'rat', 'launch', 'dlg', 'cb');
              view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Receipts'), h('div', { class: 'and-cam' }, 'camera preview')));
              line(o, '<span class="good">already granted:</span> open the camera, no dialog');
              busy = false; return;
            }
            await step('check', 'DENIED', 'and-no');
            const why = perm === 'denied';
            await step('why', String(why), why ? 'and-ok' : '');
            if (why) {
              await step('rat', 'shown');
              overlay(h('b', {}, 'Why the camera?'), h('span', {}, 'Receipts uses it to scan paper receipts. You can type them in instead.'),
                ui('Continue', () => { waiting = null; launch(); }),
                ui('Not now', () => { waiting = null; skip('launch', 'dlg', 'cb'); home('No problem. Type the receipt in.'); line(o, note('user said not now. Keep the app usable.')); busy = false; }, true));
              line(o, note('the user said no before, so explain first'));
              return;
            }
            skip('rat');
            await launch();
          }
          async function launch() {
            busy = true;
            await step('launch', 'called');
            if (perm === 'blocked') {
              steps.dlg.classList.add('and-skip'); steps.dlg.res.textContent = 'not shown';
              line(o, note('denied twice before: the system answers at once, no dialog'));
              await result(false);
              return;
            }
            await step('dlg', 'shown');
            view.append(h('div', { class: 'and-dim and-on' }));
            overlay(h('b', {}, 'Allow Receipts to take pictures and record video?'),
              ui('While using the app', () => answer(true, 'granted until the user revokes it')),
              ui('Only this time', () => answer(true, 'one-time grant: revoked soon after the app leaves the screen')),
              ui('Don’t allow', () => answer(false), true));
          }
          async function answer(ok, why) {
            waiting = null; view.querySelectorAll('.and-dlg, .and-dim').forEach(x => x.remove());
            perm = ok ? 'granted' : perm === 'ask' ? 'denied' : 'blocked';
            if (why) line(o, note(why));
            await result(ok);
          }
          async function result(ok) {
            await step('cb', String(ok), ok ? 'and-ok' : 'and-no');
            paintPerm();
            if (ok) {
              view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Receipts'), h('div', { class: 'and-cam' }, 'camera preview')));
              line(o, '<span class="good">granted:</span> open the camera');
            } else if (perm === 'blocked') {
              screen(h('p', {}, 'Camera is off for Receipts. Turn it on in Settings.'), ui('Open settings', openSettings));
              line(o, '<span class="bad">denied for good:</span> rationale is now false. Only Settings can help.');
            } else {
              home('No camera. Type the receipt in, or try again.');
              line(o, '<span class="bad">denied:</span> rationale is now true. Explain next time.');
            }
            busy = false;
          }
          function openSettings() {
            if (busy || waiting) return;
            view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Settings › Receipts'),
              h('p', {}, 'Camera permission'),
              ui('Allow only while using the app', () => { waiting = null; perm = 'granted'; paintPerm(); clearSteps(); home('Back from Settings.'); say(o, note('user allowed Camera in Settings and came back. The next check says GRANTED.')); }),
              ui('Don’t allow', () => { waiting = null; home('Camera is still off.'); say(o, note('still blocked')); }, true)));
            waiting = view.firstElementChild;
            say(o, `${hl('startActivity(Intent(ACTION_APPLICATION_DETAILS_SETTINGS, packageUri))')}`);
          }
          home(); paintPerm();
          say(o, 'Tap Take photo, on the phone or below. Try saying no twice.');
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-col' }, dev, permEl), list),
            h('div', { class: 'controls' }, cmd('onClick: Take photo', tap)),
            o);
        },
        predict: {
          q: 'The user granted the camera last week. They tap Take photo again. What happens?',
          options: ['The system dialog asks again', '<code>checkSelfPermission</code> returns GRANTED and the camera opens with no dialog', 'Your rationale UI shows first'],
          a: 1,
          why: 'Always check first. A granted permission stays granted until the user revokes it, so there is nothing to request.',
        },
      },
    ],
  });
})();
