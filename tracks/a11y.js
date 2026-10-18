/* Accessibility and adaptive UI track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed ay-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const sw = (id, label, checked) => {
    const input = h('input', { type: 'checkbox', id, checked: checked || null });
    return { input, el: h('label', { class: 'switch', for: id }, input, label) };
  };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  const ICON = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    bold: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    italic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4h8M6 20h8M15 4L9 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>',
  };

  const css = `
.ay-split { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; justify-content: center; min-width: 0; }
.ay-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); }
.ay-col { display: grid; gap: 8px; flex: 1 1 220px; min-width: 0; align-content: start; }

/* 1 why */
.ay-phone { position: relative; width: 230px; max-width: 100%; flex: none; display: grid; gap: 10px; padding: 14px 12px; border-radius: 26px; border: 8px solid var(--code-bg); background: var(--surface); color: var(--ink); overflow: hidden; }
.ay-phone.ay-curtain::after { content: "Screen curtain on"; position: absolute; inset: 0; display: grid; place-items: center; background: var(--code-bg); color: var(--t-c); font: 600 0.78rem var(--mono); z-index: 3; }
.ay-bar { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ay-between { justify-content: space-between; }
.ay-ico { width: 32px; height: 32px; flex: none; display: grid; place-items: center; border-radius: 50%; background: var(--sunk); color: var(--ink); }
.ay-ico svg { width: 18px; height: 18px; }
.ay-title { font: 700 1.05rem var(--display); min-width: 0; }
.ay-img { height: 78px; border-radius: 12px; background: linear-gradient(135deg, var(--accent-soft), var(--ok-soft)); }
.ay-price { font: 700 1rem var(--mono); }
.ay-stars { display: flex; gap: 2px; padding: 2px; border-radius: 6px; }
.ay-star { width: 16px; height: 16px; background: var(--warm); clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.ay-star.off { background: var(--line); }
.ay-pill { padding: 7px 14px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font: 700 0.85rem var(--body); white-space: nowrap; }
.ay-focus { outline: 3px solid var(--accent); outline-offset: 2px; box-shadow: 0 0 0 7px var(--accent-soft); border-radius: 8px; transition: outline-color 0.15s; }
.ay-order { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; min-width: 0; }
.ay-order li { display: flex; gap: 8px; align-items: baseline; padding: 4px 8px; border-radius: 8px; font: 500 0.8rem/1.45 var(--mono); color: var(--muted); min-width: 0; overflow-wrap: anywhere; transition: background 0.2s; }
.ay-order li.on { background: var(--accent-soft); color: var(--ink); }
.ay-num { flex: none; min-width: 1.9em; text-align: center; border-radius: 999px; background: var(--ok-soft); color: var(--ok); font-weight: 700; }
.ay-order li.ay-bad .ay-num { background: var(--err-soft); color: var(--err); }
.ay-order small { color: var(--err); font-size: 0.72rem; }

/* 2 semantics */
.ay-set { width: min(330px, 100%); display: grid; gap: 4px; padding: 10px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); min-width: 0; }
.ay-set-h { font: 700 0.76rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); padding: 4px 8px; }
.ay-set-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; min-width: 0; }
.ay-set-txt { display: grid; flex: 1 1 auto; min-width: 0; padding: 2px 4px; border-radius: 6px; }
.ay-set-txt span { padding: 0 3px; border-radius: 5px; }
.ay-set-txt small { color: var(--muted); }
.ay-sw { all: unset; flex: none; position: relative; width: 42px; height: 24px; border-radius: 999px; background: var(--line); cursor: pointer; transition: background 0.2s; }
.ay-sw::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--surface); transition: transform 0.2s; }
.ay-sw.on { background: var(--accent); }
.ay-sw.on::after { transform: translateX(18px); }
.ay-sw:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.ay-tree { display: grid; gap: 6px; min-width: 0; }
.ay-node { display: grid; gap: 4px; padding: 7px 10px; margin-left: calc(var(--d, 0) * 16px); border-radius: 10px; border: 2px solid var(--line); background: var(--bg); font: 500 0.78rem var(--mono); min-width: 0; transition: border-color 0.2s, opacity 0.2s, box-shadow 0.2s; }
.ay-node-h { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; min-width: 0; }
.ay-node-h b { overflow-wrap: anywhere; min-width: 0; }
.ay-props { display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; }
.ay-prop { padding: 1px 6px; border-radius: 6px; background: var(--sunk); color: var(--ink); overflow-wrap: anywhere; }
.ay-node.ay-stop { border-color: var(--accent); }
.ay-node.ay-merged { opacity: 0.6; border-style: dashed; }
.ay-node.ay-now { box-shadow: 0 0 0 4px var(--accent-soft); }
.ay-stopn { padding: 0 7px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-weight: 700; }
.ay-tag { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }

/* 3 touch targets + focus order */
.ay-tb { position: relative; width: 270px; max-width: 100%; height: 120px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); overflow: hidden; }
.ay-hit { position: absolute; border: 2px dashed var(--muted); border-radius: 8px; transition: left 0.35s, top 0.35s, width 0.35s, height 0.35s; }
.ay-tgt { position: absolute; display: grid; place-items: center; color: var(--ink); transition: left 0.35s, top 0.35s; }
.ay-tgt svg { width: 100%; height: 100%; }
.ay-touch { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; border: 2px solid var(--surface); animation: pop 0.3s ease-out; z-index: 2; }
.ay-touch.ok { background: var(--ok); }
.ay-touch.miss { background: var(--err); }
.ay-touch.wrong { background: var(--warm); }
.ay-score { display: flex; flex-wrap: wrap; gap: 6px 14px; font: 600 0.8rem var(--mono); color: var(--muted); }
.ay-score b { color: var(--ink); }
.ay-plans { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; width: min(330px, 100%); padding: 10px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }
.ay-plans.ay-grouped .ay-cell[data-col="0"] { background: var(--accent-soft); }
.ay-plans.ay-grouped .ay-cell[data-col="1"] { background: var(--ok-soft); }
.ay-cell { position: relative; padding: 10px; border-radius: 10px; background: var(--bg); font: 600 0.88rem var(--body); color: var(--ink); min-width: 0; overflow-wrap: anywhere; transition: background 0.25s; }
.ay-cell.ay-wide { grid-column: 1 / -1; text-align: center; background: var(--accent); color: var(--accent-ink); border-radius: 999px; }
.ay-badge-n { position: absolute; top: -8px; right: -4px; min-width: 22px; height: 22px; padding: 0 5px; display: grid; place-items: center; border-radius: 999px; background: var(--ink); color: var(--bg); font: 700 0.72rem var(--mono); }

/* 4 text scaling + contrast */
.ay-range { width: min(330px, 100%); accent-color: var(--accent); }
.ay-ts { width: min(330px, 100%); display: grid; gap: 8px; padding: 14px; border-radius: 16px; border: 1px solid var(--line); min-width: 0; overflow: hidden; transition: background-color 0.3s, color 0.3s; }
.ay-ts p { margin: 0; line-height: 1.25; overflow-wrap: anywhere; transition: font-size 0.25s; }
.ay-ts .ay-h { font-family: var(--display); font-weight: 700; }
.ay-btnbox { display: grid; place-items: center; text-align: center; max-width: 100%; align-self: start; justify-self: start; padding: 0 18px; border-radius: 20px; border: 2px solid currentColor; font-weight: 700; overflow: hidden; transition: height 0.25s, min-height 0.25s, font-size 0.25s; }
.ay-btnbox.ay-clip { outline: 2px dashed var(--err); outline-offset: 3px; }
.ay-scale-t { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; gap: 2px 16px; font: 500 0.8rem var(--mono); color: var(--muted); }
.ay-scale-t b { color: var(--ink); }
.ay-colors { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
.ay-colors label { display: inline-flex; align-items: center; gap: 6px; font: 600 0.82rem var(--mono); }
.ay-colors input { width: 44px; height: 32px; padding: 2px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
.ay-ratio { font: 800 1.8rem var(--display); font-variant-numeric: tabular-nums; }
.ay-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.ay-badge { font: 600 0.72rem var(--mono); padding: 3px 9px; border-radius: 999px; }
.ay-badge.pass { background: var(--ok-soft); color: var(--ok); }
.ay-badge.fail { background: var(--err-soft); color: var(--err); }

/* 5 window size classes */
.ay-win { justify-self: center; height: 230px; max-width: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); border: 2px solid var(--ink); border-radius: 12px; background: var(--surface); color: var(--ink); overflow: hidden; transition: width 0.3s ease-out; }
.ay-win-top { display: flex; gap: 6px; align-items: center; padding: 4px 8px; background: var(--sunk); font: 600 0.68rem var(--mono); color: var(--muted); white-space: nowrap; overflow: hidden; }
.ay-win-top i { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; }
.ay-app { display: flex; min-width: 0; min-height: 0; }
.ay-app.ay-compact { flex-direction: column-reverse; }
.ay-nav { display: flex; gap: 8px; padding: 6px; justify-content: center; background: var(--bg); flex: none; }
.ay-nav.ay-rail { flex-direction: column; justify-content: flex-start; border-right: 1px solid var(--line); }
.ay-nav i { display: block; width: 18px; height: 18px; border-radius: 6px; background: var(--line); }
.ay-nav i.on { background: var(--accent); }
.ay-panes { flex: 1 1 auto; display: flex; min-width: 0; min-height: 0; }
.ay-pane { flex: 1 1 0; min-width: 0; display: grid; align-content: start; gap: 5px; padding: 8px; overflow: hidden; }
.ay-pane + .ay-pane { flex-grow: 1.4; border-left: 1px solid var(--line); }
.ay-mail { all: unset; display: grid; gap: 1px; padding: 5px 8px; border-radius: 8px; background: var(--bg); border: 1px solid transparent; cursor: pointer; min-width: 0; }
.ay-mail b, .ay-mail small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ay-mail b { font: 700 0.76rem var(--body); }
.ay-mail small { font-size: 0.68rem; color: var(--muted); }
.ay-mail.on { border-color: var(--accent); background: var(--accent-soft); }
.ay-mail:focus-visible { outline: 2px solid var(--accent); }
.ay-detail-h { display: flex; align-items: center; gap: 6px; font: 700 0.86rem var(--display); min-width: 0; }
.ay-backbtn { all: unset; width: 24px; height: 24px; flex: none; display: grid; place-items: center; border-radius: 50%; background: var(--sunk); cursor: pointer; }
.ay-backbtn svg { width: 14px; height: 14px; }
.ay-lines { display: grid; gap: 5px; }
.ay-lines i { display: block; height: 6px; border-radius: 4px; background: var(--sunk); }
.ay-empty { color: var(--muted); font-size: 0.78rem; }
.ay-ruler { position: relative; display: flex; height: 28px; border-radius: 8px; overflow: hidden; font: 600 0.66rem var(--mono); min-width: 0; }
.ay-ruler span { display: grid; place-items: center; min-width: 0; overflow: hidden; white-space: nowrap; color: var(--muted); background: var(--sunk); border-right: 2px solid var(--bg); transition: background 0.2s, color 0.2s; }
.ay-ruler span.on { background: var(--accent); color: var(--accent-ink); }
.ay-mark { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1px; background: var(--ink); transition: left 0.3s ease-out; }

/* 6 foldables */
.ay-dev { display: grid; place-items: center; min-height: 260px; perspective: 760px; min-width: 0; }
.ay-fold { position: relative; display: grid; perspective: 700px; width: 270px; max-width: 100%; height: 200px; transition: width 0.45s, height 0.45s; }
.ay-fold.ay-cols { grid-template-columns: 1fr 1fr; }
.ay-fold.ay-rows { grid-template-rows: 1fr 1fr; width: 210px; height: 250px; }
.ay-fold.ay-narrow { width: 118px; height: 230px; }
.ay-half { position: relative; display: grid; gap: 5px; align-content: start; padding: 8px; min-width: 0; min-height: 0; overflow: hidden; background: var(--surface); color: var(--ink); border: 6px solid var(--code-bg); transition: transform 0.55s ease-in-out; }
.ay-cols .ay-half:first-child { border-right-width: 1px; border-radius: 16px 0 0 16px; }
.ay-cols .ay-half:nth-child(2) { border-left-width: 1px; border-radius: 0 16px 16px 0; transform-origin: left center; }
.ay-rows .ay-half:first-child { border-bottom-width: 1px; border-radius: 16px 16px 0 0; }
.ay-rows .ay-half:nth-child(2) { border-top-width: 1px; border-radius: 0 0 16px 16px; transform-origin: center top; }
.ay-fold.ay-book .ay-half:nth-child(2) { transform: rotateY(-38deg); }
.ay-fold.ay-table .ay-half:nth-child(2) { transform: rotateX(52deg); }
.ay-over { position: absolute; inset: 0; display: none; padding: 8px; border-radius: 16px; border: 6px solid var(--code-bg); background: var(--surface); color: var(--ink); overflow: hidden; z-index: 1; }
.ay-over.on { display: grid; }
.ay-over.ay-letter { padding: 0; background: var(--code-bg); justify-items: center; }
.ay-letter > div { width: 44%; height: 100%; background: var(--surface); padding: 8px; display: grid; gap: 5px; align-content: start; overflow: hidden; }
.ay-video { display: grid; place-items: center; min-height: 54px; border-radius: 8px; background: var(--code-bg); color: var(--code-ink); }
.ay-video svg { width: 20px; height: 20px; }
.ay-ctrls { display: grid; gap: 6px; padding: 6px; border-radius: 8px; background: var(--sunk); }
.ay-ctrls i { display: block; height: 5px; border-radius: 4px; background: var(--accent); width: 62%; }
.ay-ctrls span { display: flex; gap: 8px; justify-content: center; }
.ay-ctrls span b { width: 14px; height: 14px; border-radius: 50%; background: var(--ink); opacity: 0.75; }
.ay-other { display: grid; place-items: center; height: 100%; font: 600 0.72rem var(--mono); color: var(--muted); background: var(--sunk); border-radius: 6px; }

/* 7 edge-to-edge */
.ay-e2e { position: relative; width: 220px; height: 390px; flex: none; border-radius: 28px; border: 8px solid var(--code-bg); background: var(--bg); color: var(--ink); overflow: hidden; }
.ay-sbar { position: absolute; top: 0; left: 0; right: 0; height: 24px; display: flex; justify-content: space-between; align-items: center; padding: 0 14px; font: 700 0.62rem var(--mono); z-index: 4; pointer-events: none; }
.ay-cut { position: absolute; top: 6px; left: 50%; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: var(--code-bg); z-index: 5; }
.ay-nbar { position: absolute; bottom: 0; left: 0; right: 0; height: 18px; display: grid; place-items: center; z-index: 4; pointer-events: none; }
.ay-nbar::after { content: ""; width: 64px; height: 4px; border-radius: 99px; background: var(--ink); opacity: 0.7; }
.ay-kb { position: absolute; left: 0; right: 0; bottom: 0; height: 150px; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px; align-content: start; padding: 10px 6px 24px; background: var(--sunk); border-top: 1px solid var(--line); transform: translateY(100%); transition: transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 3; }
.ay-kb.up { transform: none; }
.ay-kb i { height: 24px; border-radius: 5px; background: var(--surface); }
.ay-content { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; transition: top 0.38s cubic-bezier(0.2, 0.8, 0.2, 1), bottom 0.38s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 1; }
.ay-chat-top { padding: 8px 12px; font: 700 0.92rem var(--display); background: var(--accent-soft); }
.ay-msgs { flex: 1 1 auto; display: flex; flex-direction: column; justify-content: flex-end; gap: 6px; padding: 8px; min-height: 0; overflow: hidden; }
.ay-msg { max-width: 82%; padding: 5px 10px; border-radius: 12px; background: var(--surface); font-size: 0.78rem; line-height: 1.35; }
.ay-msg.me { align-self: flex-end; background: var(--accent); color: var(--accent-ink); }
.ay-input { margin: 4px 8px 8px; padding: 7px 12px; border-radius: 999px; border: 2px solid var(--accent); background: var(--surface); font-size: 0.8rem; color: var(--muted); }
.ay-shade { position: absolute; left: 0; right: 0; z-index: 2; pointer-events: none; opacity: 0; background: repeating-linear-gradient(45deg, var(--warm-soft) 0 6px, transparent 6px 12px); border: 1px dashed var(--warm); transition: opacity 0.25s, height 0.38s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ay-e2e.ay-show .ay-shade { opacity: 0.9; }

/* depth: semantics */
.ay-cs-gauge { position: relative; flex: 1 1 auto; min-width: 0; padding: 14px 10px; border-radius: 10px; }
.ay-cs-track { position: relative; display: block; height: 8px; border-radius: 99px; background: var(--sunk); }
.ay-cs-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 99px; background: var(--accent); transition: width 0.25s; }
.ay-cs-thumb { position: absolute; top: 50%; width: 20px; height: 20px; margin: -10px 0 0 -10px; border-radius: 50%; background: var(--accent); border: 3px solid var(--surface); box-shadow: 0 0 0 1px var(--line); transition: left 0.25s; }
.ay-cs-done { justify-self: start; }
.ay-ca-list { width: min(300px, 100%); }
.ay-ca-row { display: grid; gap: 1px; padding: 8px 10px; border-radius: 10px; background: var(--bg); min-width: 0; }
.ay-ca-row b { font: 700 0.86rem var(--body); }
.ay-ca-row small { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ay-ca-row.ay-ca-read b { font-weight: 400; color: var(--muted); }
.ay-ca-menu { display: grid; gap: 6px; justify-items: start; padding: 10px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); min-width: 0; }
/* depth: insets */
.ay-ci-top { position: absolute; top: 24px; left: 0; right: 0; height: 40px; display: flex; align-items: center; padding: 0 12px; font: 700 0.92rem var(--display); background: var(--accent-soft); z-index: 2; }
.ay-ci-gap { flex: none; height: 0; transition: height 0.38s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ay-ci-gap.ay-ci-bad { background: var(--err-soft); box-shadow: inset 0 2px 0 var(--err); }
.ay-lp-view { position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow: hidden; z-index: 1; transition: top 0.3s, bottom 0.3s; }
.ay-lp-inner { display: grid; gap: 6px; padding: 0 8px; transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.3s; }
.ay-lp-row { display: flex; align-items: center; gap: 8px; height: 44px; flex: none; padding: 0 8px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font: 700 0.8rem var(--body); }
.ay-lp-row i { width: 32px; height: 32px; flex: none; border-radius: 8px; background: linear-gradient(135deg, var(--accent-soft), var(--warm-soft)); }
.ay-lp-phone.ay-show .ay-shade { opacity: 0.6; }
/* depth 2: why */
.ay-d2-wl-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: min(260px, 100%); padding: 10px 12px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); }
.ay-d2-col-btns .cmd { white-space: normal; overflow-wrap: anywhere; text-align: left; }
/* depth 2: targets */
.ay-d2-kf { position: relative; width: min(320px, 100%); height: 190px; }
.ay-d2-kf-item { position: absolute; box-sizing: border-box; display: flex; align-items: center; padding: 0 10px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--muted); font: 500 0.8rem var(--body); overflow: hidden; white-space: nowrap; transition: border-color 0.2s, box-shadow 0.2s; }
.ay-d2-kf-btn { justify-content: center; border-radius: 999px; background: var(--sunk); color: var(--ink); font-weight: 700; }
.ay-d2-kf-click { border-color: var(--warm); box-shadow: 0 0 0 3px var(--warm-soft); }
.ay-d2-chipui { width: min(300px, 100%); }
.ay-d2-chip { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; padding: 6px 10px; border-radius: 10px; background: var(--bg); font: 600 0.86rem var(--body); min-width: 0; transition: background 0.2s; }
.ay-d2-chip.ay-d2-chip-on { background: var(--accent-soft); }
/* depth 2: text-scale */
.ay-d2-tr-card { width: min(300px, 100%); padding: 6px 0; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); min-width: 0; }
.ay-d2-tr-row { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 6px 14px; min-width: 0; }
.ay-d2-tr-i { flex: none; width: 24px; height: 24px; border-radius: 6px; background: var(--accent-soft); }
.ay-d2-tr-txt { flex: 1 1 auto; display: flex; align-items: baseline; justify-content: space-between; gap: 2px 10px; min-width: 0; }
.ay-d2-tr-l, .ay-d2-tr-v { min-width: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: font-size 0.25s; }
.ay-d2-tr-l { flex: 1 1 auto; font-weight: 600; }
.ay-d2-tr-v { flex: 0 1 auto; color: var(--muted); }
.ay-d2-tr-flow .ay-d2-tr-txt { flex-wrap: wrap; }
.ay-d2-tr-flow .ay-d2-tr-l, .ay-d2-tr-flow .ay-d2-tr-v { flex: 0 0 auto; max-width: 100%; white-space: normal; overflow: visible; }
.ay-d2-tr-cut { box-shadow: inset 0 -2px 0 var(--err); }
.ay-d2-tc { width: min(300px, 100%); display: grid; gap: 10px; padding: 14px; border-radius: 14px; background: var(--surface); color: var(--ink); min-width: 0; transition: filter 0.3s; }
.ay-d2-tc.ay-d2-tc-gray { filter: grayscale(1); }
.ay-d2-tc-field { position: relative; display: grid; padding: 18px 40px 8px 12px; border-radius: 8px; border: 2px solid var(--line); min-width: 0; }
.ay-d2-tc-lab { position: absolute; top: 3px; left: 12px; font: 600 0.68rem var(--body); color: var(--muted); }
.ay-d2-tc-val { font: 500 0.9rem var(--body); overflow-wrap: anywhere; }
.ay-d2-tc-err { border-color: var(--err); }
.ay-d2-tc-err .ay-d2-tc-lab { color: var(--err); }
.ay-d2-tc-ico { display: none; position: absolute; right: 10px; top: 50%; width: 20px; height: 20px; margin-top: -10px; border-radius: 50%; background: var(--err); color: var(--surface); font: 800 0.8rem/20px var(--body); text-align: center; }
.ay-d2-tc-msg { display: none; margin: -6px 0 0 12px; font-size: 0.78rem; color: var(--err); }
.ay-d2-tc-words .ay-d2-tc-ico, .ay-d2-tc-words .ay-d2-tc-msg { display: block; }
/* depth 2: window-size */
.ay-d2-wh-stage { min-height: 290px; }
.ay-d2-wh-win { display: grid; grid-template-rows: auto minmax(0, 1fr); max-width: 100%; border: 2px solid var(--ink); border-radius: 10px; background: var(--surface); color: var(--ink); overflow: hidden; transition: width 0.35s ease, height 0.35s ease; }
.ay-d2-wh-top { padding: 3px 8px; font: 700 0.7rem var(--display); background: var(--accent-soft); white-space: nowrap; overflow: hidden; }
.ay-d2-wh-win .ay-app { min-height: 0; overflow: hidden; }
.ay-d2-wh-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.ay-d2-wa-win { width: min(340px, 100%); height: 170px; }
.ay-d2-wa-app { display: flex; min-width: 0; min-height: 0; }
.ay-d2-wa-app .ay-nav { box-sizing: border-box; padding: 6px 2px; align-items: center; }
.ay-d2-wa-app .ay-nav i { width: 12px; height: 12px; }
.ay-d2-wa-pane { flex: none; box-sizing: border-box; padding: 6px 4px; min-width: 0; overflow: hidden; border-left: 1px solid var(--line); }
.ay-d2-wa-card { display: grid; gap: 4px; box-sizing: border-box; padding: 4px; border-radius: 6px; border: 1.5px solid var(--line); background: var(--bg); transition: width 0.3s ease; }
.ay-d2-wa-img { display: block; height: 34px; border-radius: 4px; background: linear-gradient(135deg, var(--accent-soft), var(--ok-soft)); }
.ay-d2-wa-specs { display: grid; gap: 3px; min-width: 0; }
.ay-d2-wa-specs i { display: block; height: 5px; border-radius: 3px; background: var(--sunk); }
.ay-d2-wa-card.ay-d2-wa-wide { grid-template-columns: 40% minmax(0, 1fr); }
.ay-d2-wa-wide .ay-d2-wa-img { height: 48px; }
.ay-d2-wa-card.ay-d2-wa-over { border-color: var(--err); box-shadow: 0 0 0 2px var(--err-soft); }
/* depth 2: foldables */
.ay-d2-fh { position: relative; width: min(300px, 100%); height: 180px; box-sizing: border-box; border-radius: 16px; border: 6px solid var(--code-bg); background: var(--surface); color: var(--ink); overflow: hidden; }
.ay-d2-fh-content { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 6px; padding: 8px; }
.ay-d2-fh-split .ay-d2-fh-content { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 28px; }
.ay-d2-fh-pane { display: grid; gap: 6px; align-content: start; min-width: 0; }
.ay-d2-fh-photo { height: 76px; border-radius: 8px; background: linear-gradient(135deg, var(--accent-soft), var(--warm-soft)); }
.ay-d2-fh-info { display: grid; gap: 4px; font-size: 0.8rem; min-width: 0; }
.ay-d2-fh-buy { justify-self: center; }
.ay-d2-fh-hinge { position: absolute; top: 0; bottom: 0; left: 50%; width: 0; transform: translateX(-50%); pointer-events: none; z-index: 1; }
.ay-d2-fh-flat .ay-d2-fh-hinge { border-left: 1px dashed var(--line); }
.ay-d2-fh-book .ay-d2-fh-hinge { width: 16px; background: linear-gradient(90deg, transparent, var(--line), transparent); }
.ay-d2-fh-dual .ay-d2-fh-hinge { width: 18px; background: var(--code-bg); }
.ay-d2-fs-val { font: 600 0.8rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
/* promoted: Android 17 resizability */
.ay-rz-dev { position: relative; display: grid; place-items: center; box-sizing: border-box; border: 7px solid var(--code-bg); border-radius: 18px; background: repeating-linear-gradient(45deg, var(--sunk) 0 6px, var(--bg) 6px 12px); overflow: hidden; transition: width 0.35s, height 0.35s; }
.ay-rz-dev.ay-rz-tablet { width: min(260px, 100%); height: 170px; }
.ay-rz-dev.ay-rz-phone { width: 104px; height: 190px; border-radius: 20px; }
.ay-rz-app { display: grid; grid-template-rows: auto minmax(0, 1fr); width: 84px; height: 100%; background: var(--surface); box-shadow: 0 0 0 1px var(--line); }
.ay-rz-phone .ay-rz-app, .ay-rz-app.ay-rz-fill { width: 100%; }
.ay-rz-bar { padding: 5px 8px; background: var(--accent); color: var(--accent-ink); font: 700 0.72rem var(--body); }
.ay-rz-feed { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 5px; padding: 6px; align-content: start; }
.ay-rz-feed i { display: block; height: 26px; border-radius: 5px; background: var(--sunk); }
.ay-rz-mani { margin: 0; padding: 10px 12px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); font: 500 0.74rem/1.5 var(--mono); white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.ay-rz-win { display: grid; justify-items: stretch; align-content: start; box-sizing: border-box; padding: 10px; border: 6px solid var(--code-bg); border-radius: 14px; background: var(--surface); overflow: hidden; transition: width 0.3s, height 0.3s; }
.ay-rz-win.ay-rz-wide { width: min(300px, 100%); height: 170px; }
.ay-rz-win.ay-rz-short { width: min(220px, 100%); height: 110px; }
.ay-rz-win.ay-rz-fixed { justify-items: center; overflow-y: auto; }
.ay-rz-form { display: grid; gap: 6px; width: 100%; min-width: 0; }
.ay-rz-fixed .ay-rz-form { max-width: 150px; }
.ay-rz-field { display: block; padding: 4px 8px; border-radius: 6px; border: 1.5px solid var(--line); font: 500 0.72rem var(--body); color: var(--muted); }
.ay-rz-btn { justify-self: stretch; text-align: center; }
`;

  Lab.addTrack({
    id: 'a11y',
    title: 'Accessibility and adaptive UI',
    description: 'Make screens that work with TalkBack, large fonts, big windows, foldables and edge-to-edge.',
    group: 'Going deeper',
    requires: ['compose'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'why',
        title: 'Why accessibility',
        tagline: 'A screen reader walks your layout as one long line.',
        level: 'beginner',
        body: `
<p>Many people use Android without looking at the screen or tapping it the usual way. TalkBack is the built-in screen reader. It speaks one element at a time, and the user swipes right and left to move through them. Switch Access lets someone drive the phone with one or two buttons, stepping through every tappable thing in turn. Others set the font size to the maximum in Settings.</p>
<p>All of them walk your screen in a line. A card that looks obvious turns into a run of stops, each read aloud. An icon with no label is announced as just "Button". Five star icons become five stops that each say "Star".</p>
<p>Turn on TalkBack and the largest font size, then use your own app for five minutes. Accessibility Scanner from Google Play flags missing labels, small targets and low contrast. The next lessons fix each of these.</p>`,
        code: `@Composable
fun ProductCard(product: Product, onFavorite: () -> Unit, onAdd: () -> Unit) {
    Column(Modifier.padding(16.dp)) {
        Text(product.name, style = MaterialTheme.typography.titleLarge)
        Image(
            painterResource(product.imageRes),
            contentDescription = null,          // decorative: the title already says it
        )
        Text(product.price)
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onFavorite) {
                // An icon-only button needs words, or TalkBack says just "Button"
                Icon(Icons.Default.FavoriteBorder, contentDescription = "Add to favorites")
            }
            Button(onClick = onAdd) { Text("Add to cart") }  // its text is the label
        }
    }
}`,
        remember: 'TalkBack reads your screen one stop at a time. Every stop needs words, and decoration needs none.',
        terms: [
          { term: 'TalkBack', def: 'Android’s built-in screen reader, which speaks the focused element and moves focus with swipe gestures.' },
          { term: 'Switch Access', def: 'An Android accessibility service that lets people control the device with one or more switches instead of the touch screen.' },
          { term: 'contentDescription', def: 'The text an accessibility service reads for an Icon or Image; null marks it as decorative so it is skipped.' },
          { term: 'Accessibility Scanner', def: 'A Google app that inspects the current screen and suggests fixes for labels, touch target size and contrast.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Label the share button and mark the decorative star as something TalkBack should skip.', code: 'IconButton(onClick = onShare) {\n    Icon(Icons.Default.Share, [[contentDescription]] = "Share")\n}\nIcon(Icons.Default.Star, contentDescription = [[null]])', why: 'An icon that acts needs a description. A purely decorative one gets <code>null</code>, so it is not a focus stop.' },
          { type: 'bug', prompt: 'TalkBack users hear "Button" with no clue what it does. Tap the line that causes it.', code: '@Composable\nfun InboxHeader(onSearch: () -> Unit) {\n    Row(verticalAlignment = Alignment.CenterVertically) {\n        Text("Inbox", style = MaterialTheme.typography.titleLarge)\n        IconButton(onClick = onSearch) {\n            Icon(Icons.Default.Search, contentDescription = null)\n        }\n    }\n}', bug: 5, fix: '            Icon(Icons.Default.Search, contentDescription = "Search")', why: 'The icon is the only content of the button, so it is the label. <code>null</code> is for decoration next to text that already says the same thing.' },
        ],
        quiz: [
          { q: 'In what order does a swipe right in TalkBack move through a screen?', options: ['Top to bottom, start to end, through the elements in order', 'Largest element first', 'Only through buttons'], a: 0, why: 'TalkBack follows the semantics order, which by default is reading order. Lesson 3 shows how to change it.' },
          { q: 'A heart icon sits next to the text "Favorite" inside one button. What should the icon’s <code>contentDescription</code> be?', options: ['"Heart"', '"Favorite"', '<code>null</code>'], a: 2, why: 'The text already names the button. A description on the icon would make TalkBack say it twice.' },
          { q: 'A user sets the largest font size in Settings. What changes in your app?', options: ['Text sized in sp grows, dp sizes stay', 'Everything doubles in size', 'Nothing unless you opt in'], a: 0, why: 'Font scale multiplies sp only. Lesson 4 covers what that does to your layouts.' },
        ],
        deeper: [
          {
            title: 'Write labels that say what happens',
            body: `<p>A good <code>contentDescription</code> names the action or the content, in a few words. TalkBack adds the role and the hint itself, so leave out “button”, “icon” and “tap to”. Describe what the control does, not how it looks.</p>
<p>Labels are user-facing text, so they belong in <code>strings.xml</code> like any other text. A hardcoded English label is read in English on a Turkish phone, while TalkBack speaks the role in Turkish around it.</p>`,
            code: `IconButton(onClick = onFavorite) {
    Icon(
        Icons.Default.FavoriteBorder,
        contentDescription = stringResource(R.string.add_to_favorites),
    )
}
// values/strings.xml:     <string name="add_to_favorites">Add to favorites</string>
// values-tr/strings.xml:  <string name="add_to_favorites">Favorilere ekle</string>`,
            visual(el) {
              const OPTS = [
                { src: 'null', say: null, verdict: 'bad', note: 'no label: TalkBack can only say the role' },
                { src: '"Heart icon"', say: 'Heart icon', verdict: 'bad', note: 'describes the look, not what it does' },
                { src: '"Favorite button"', say: 'Favorite button', verdict: 'bad', note: 'TalkBack adds the role, so it says button twice' },
                { src: '"Tap to add to favorites"', say: 'Tap to add to favorites', verdict: 'bad', note: 'TalkBack users double-tap, and TalkBack adds its own hint' },
                { src: '"Add to favorites"', say: 'Add to favorites', verdict: 'good', note: 'the action, in a few words' },
              ];
              let pick = 4, tr = false, res = false;
              const heart = h('span', { class: 'ay-ico ay-focus', html: ICON.heart });
              const bar = h('div', { class: 'ay-d2-wl-bar', role: 'img', 'aria-label': 'Toolbar with a heart button in focus' }, h('span', { class: 'ay-title' }, 'Trail shoes'), heart);
              const line = h('div', { class: 'kt' });
              const o = out();
              const trSw = sw('ay-d2-wl-tr', 'Phone language: Turkish');
              const resSw = sw('ay-d2-wl-res', 'Label from strings.xml');
              const btns = OPTS.map((x, i) => cmd(`contentDescription = ${x.src}`, () => { pick = i; if (i !== 4 && res) { res = false; resSw.input.checked = false; } paint(true); }));
              function paint(anim) {
                press(btns, btns[pick]);
                const x = OPTS[pick];
                const useRes = res && pick === 4;
                line.innerHTML = hl(`Icon(Icons.Default.FavoriteBorder, contentDescription = ${useRes ? 'stringResource(R.string.add_to_favorites)' : x.src})`);
                const role = tr ? 'Düğme' : 'Button';
                const label = useRes && tr ? 'Favorilere ekle' : x.say;
                const spoken = label ? `${label}, ${role}` : role;
                let verdict = x.verdict, note = x.note;
                if (pick === 4 && tr && !useRes) { verdict = 'bad'; note = 'hardcoded English on a Turkish phone'; }
                if (pick === 4 && useRes) note = tr ? 'read from values-tr/strings.xml' : 'read from strings.xml';
                if (anim) replay(heart, 'pop');
                say(o, `TalkBack: <span class="good">"${esc(spoken)}"</span>  <span class="${verdict === 'good' ? 'good' : 'bad'}">// ${esc(note)}</span>`);
              }
              trSw.input.addEventListener('change', () => { tr = trSw.input.checked; paint(true); });
              resSw.input.addEventListener('change', () => { res = resSw.input.checked; if (res && pick !== 4) pick = 4; paint(true); });
              paint(false);
              el.append(
                h('div', { class: 'stage' }, bar), line,
                h('div', { class: 'controls ay-d2-col-btns' }, btns),
                h('div', { class: 'controls' }, trSw.el, resSw.el),
                o);
            },
          },
          {
            title: 'Let tests catch the basics',
            body: `<p>Manual checks with TalkBack and Accessibility Scanner find the most, but they don’t run on every change. Since Compose 1.8, UI tests can run the Accessibility Test Framework checks too. Add the <code>ui-test-junit4-accessibility</code> dependency and call <code>enableAccessibilityChecks()</code>. After that, every test action also checks for missing labels, small touch targets, low contrast and confusing traversal order, and fails the test when it finds one.</p>`,
            code: `@get:Rule
val composeTestRule = createAndroidComposeRule<ComponentActivity>()

@Test
fun productCard_isAccessible() {
    composeTestRule.setContent { AppTheme { ProductCard(sampleProduct, {}, {}) } }
    composeTestRule.enableAccessibilityChecks()
    composeTestRule.onRoot().tryPerformAccessibilityChecks()
}`,
          },
        ],
        underHood: {
          body: `<p>TalkBack is an <code>AccessibilityService</code> running in its own process. It never sees your pixels or your code. When it needs the screen, the system asks your app’s process for a tree of <code>AccessibilityNodeInfo</code> objects: each node carries text, a content description, a class name that TalkBack turns into a role, the bounds and the actions it supports. Your app also sends <code>AccessibilityEvent</code>s when focus or content changes.</p>
<p>A double-tap does not become a touch on your view. TalkBack asks the system to perform <code>ACTION_CLICK</code> on the focused node, and your app runs the click handler. Views build these nodes themselves. Compose builds them from its semantics tree, which the next lesson covers.</p>`,
        },
        mistakes: [
          {
            title: 'Text baked into an image, marked decorative',
            bad: `Image(
    painterResource(R.drawable.sale_banner),   // the bitmap says "50% off all shoes"
    contentDescription = null,
)`,
            good: `Image(
    painterResource(R.drawable.sale_banner),
    contentDescription = stringResource(R.string.sale_banner),  // "50% off all shoes until Sunday"
)`,
            why: '<code>null</code> tells TalkBack there is nothing to read, but the banner carries the main message. Better still, draw the words with <code>Text</code> so they also grow with the font size.',
          },
          {
            title: 'The same label on every row',
            bad: `items(cart, key = { it.id }) { item ->
    Row {
        Text(item.name)
        IconButton(onClick = { onRemove(item.id) }) {
            Icon(Icons.Default.Delete, contentDescription = "Remove")
        }
    }
}`,
            good: `items(cart, key = { it.id }) { item ->
    Row {
        Text(item.name)
        IconButton(onClick = { onRemove(item.id) }) {
            Icon(
                Icons.Default.Delete,
                contentDescription = stringResource(R.string.remove_item, item.name),
            )
        }
    }
}`,
            why: 'Swiping through the list, TalkBack says “Remove, Button” ten times. Put the item in the label, like “Remove Trail shoes”, so each stop makes sense on its own.',
          },
        ],
        visual(el) {
          const fix = sw('ay-why-fix', 'Add labels and merge the stars');
          const curtain = sw('ay-why-curtain', 'Screen curtain');
          const back = h('span', { class: 'ay-ico', html: ICON.back });
          const title = h('span', { class: 'ay-title' }, 'Trail shoes');
          const img = h('div', { class: 'ay-img' });
          const price = h('span', { class: 'ay-price' }, '$89');
          const stars = [0, 1, 2, 3, 4].map(i => h('span', { class: 'ay-star' + (i < 4 ? '' : ' off') }));
          const starRow = h('span', { class: 'ay-stars' }, stars);
          const heart = h('span', { class: 'ay-ico', html: ICON.heart });
          const add = h('span', { class: 'ay-pill' }, 'Add to cart');
          const phone = h('div', { class: 'ay-phone', role: 'img', 'aria-label': 'Product screen with TalkBack focus' },
            h('div', { class: 'ay-bar' }, back, title), img,
            h('div', { class: 'ay-bar ay-between' }, price, starRow),
            h('div', { class: 'ay-bar' }, heart, add));
          const BAD = [
            { el: back, text: 'Button', note: 'no label', act: 'Went back.' },
            { el: title, text: 'Trail shoes', note: 'not marked as a heading' },
            { el: img, text: 'image', note: 'describes nothing' },
            { el: price, text: '$89' },
            ...stars.map(s => ({ el: s, text: 'Star', note: 'one of five stops' })),
            { el: heart, text: 'Button', note: 'no label', act: 'Saved to favorites, but you could not know.' },
            { el: add, text: 'Add to cart, Button', act: 'Added to cart.' },
          ];
          const GOOD = [
            { el: back, text: 'Navigate up, Button', act: 'Went back.' },
            { el: title, text: 'Trail shoes, Heading' },
            { el: price, text: '$89' },
            { el: starRow, text: 'Rated 4 out of 5' },
            { el: heart, text: 'Add to favorites, Button', act: 'Added to favorites.' },
            { el: add, text: 'Add to cart, Button', act: 'Added to cart.' },
          ];
          const list = h('ol', { class: 'ay-order', 'aria-label': 'Focus order' });
          const o = out();
          let stops = BAD, at = 0, run = 0;
          function paintList() {
            list.replaceChildren(...stops.map((s, i) => h('li', { class: [i === at && 'on', s.note && 'ay-bad'].filter(Boolean).join(' ') || null },
              h('span', { class: 'ay-num' }, String(i + 1)), h('span', {}, `"${s.text}"`, s.note ? h('small', {}, `  ${s.note}`) : null))));
          }
          function focus(i) {
            at = (i + stops.length) % stops.length;
            [...BAD, ...GOOD].forEach(s => s.el.classList.remove('ay-focus'));
            const s = stops[at];
            s.el.classList.add('ay-focus');
            paintList();
            say(o, `TalkBack: <span class="good">"${esc(s.text)}"</span>${s.note ? `  <span class="bad">// ${esc(s.note)}</span>` : ''}`);
          }
          fix.input.addEventListener('change', () => { run++; stops = fix.input.checked ? GOOD : BAD; focus(0); replay(list, 'pop-soft'); });
          curtain.input.addEventListener('change', () => phone.classList.toggle('ay-curtain', curtain.input.checked));
          async function readAll() {
            const me = ++run;
            for (let i = 0; i < stops.length; i++) {
              if (me !== run || !el.isConnected) return;
              focus(i);
              await sleep(850);
            }
            if (me === run) say(o, `<span class="muted">// ${stops.length} stops to hear one product card.</span>`);
          }
          focus(0);
          el.append(
            h('div', { class: 'ay-split' }, phone,
              h('div', { class: 'ay-col' }, h('span', { class: 'ay-label' }, 'What TalkBack walks through'), list)),
            h('div', { class: 'controls' },
              act('Swipe left', () => { run++; focus(at - 1); }),
              act('Swipe right', () => { run++; focus(at + 1); }),
              act('Double-tap', () => {
                run++;
                const s = stops[at];
                if (s.act) { replay(s.el, 'pop'); say(o, `<span class="good">ok:</span> ${esc(s.act)}`); }
                else { replay(s.el, 'shake'); say(o, '<span class="muted">// nothing to activate here</span>'); }
              }),
              act('Read from top', readAll)),
            h('div', { class: 'controls' }, fix.el, curtain.el),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'semantics',
        title: 'Semantics in Compose',
        tagline: 'Decide what each focus stop says, and how many there are.',
        level: 'intermediate',
        body: `
<p>Compose builds a semantics tree next to the UI. Accessibility services and UI tests read it. <code>Text</code> adds its text, <code>Icon</code> and <code>Image</code> add their <code>contentDescription</code>, and <code>clickable</code> or <code>toggleable</code> add an action and a role. Pass <code>contentDescription = null</code> for decoration so TalkBack skips it.</p>
<p>Every node with an action is its own focus stop. To read a group as one stop, merge it with <code>Modifier.semantics(mergeDescendants = true)</code>, or put <code>clickable</code> or <code>toggleable</code> on the row, which merges for you. A child with its own click stays a separate stop. <code>clearAndSetSemantics { }</code> drops the children’s semantics and keeps only what you set, which suits custom drawing.</p>
<p><code>role</code> says what kind of control it is, and <code>stateDescription</code> puts its state into words, like "72 percent". Mark section titles with <code>heading()</code> so TalkBack users can jump from heading to heading.</p>`,
        code: `@Composable
fun WifiRow(enabled: Boolean, onToggle: (Boolean) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .toggleable(value = enabled, role = Role.Switch, onValueChange = onToggle)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text("Wi-Fi")
            Text(if (enabled) "Connected" else "Off")
        }
        Switch(checked = enabled, onCheckedChange = null)  // the row handles the tap
    }
}

Text("Network", Modifier.semantics { heading() })

// Drawn with Canvas, so there is no text to read. Say it yourself.
BatteryGauge(
    level = 0.72f,
    modifier = Modifier.clearAndSetSemantics {
        contentDescription = "Battery"
        stateDescription = "72 percent"
    },
)`,
        remember: 'Put the action on the row, not on the switch. One row, one stop, one sentence.',
        terms: [
          { term: 'mergeDescendants', def: 'A semantics flag that makes a node and its children one focus stop, reading their content together.' },
          { term: 'clearAndSetSemantics', def: 'A modifier that removes the semantics of all child nodes and replaces them with only the properties you set.' },
          { term: 'stateDescription', def: 'A semantics property that describes a control’s current state in words, such as "On" or "72 percent".' },
          { term: 'Role', def: 'A semantics property such as Role.Button or Role.Switch that tells accessibility services what kind of control an element is.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the card one focus stop and mark the section title as a heading.', code: 'Column(Modifier.semantics([[mergeDescendants]] = true) {}) {\n    Text(order.title)\n    Text(order.status)\n}\nText("Recent orders", Modifier.semantics { [[heading]]() })', why: '<code>mergeDescendants</code> reads both texts as one stop. <code>heading()</code> lets TalkBack users jump to the section.' },
          { type: 'bug', prompt: 'TalkBack reads "Dark theme, double tap to activate" and never says whether it is on. Tap the line to change.', code: '@Composable\nfun DarkThemeRow(enabled: Boolean, onToggle: (Boolean) -> Unit) {\n    Row(\n        Modifier\n            .fillMaxWidth()\n            .clickable { onToggle(!enabled) }\n            .padding(16.dp)\n    ) {\n        Text("Dark theme", Modifier.weight(1f))\n        Switch(checked = enabled, onCheckedChange = null)\n    }\n}', bug: 5, fix: '            .toggleable(value = enabled, role = Role.Switch, onValueChange = onToggle)', why: 'With <code>onCheckedChange = null</code> the Switch adds no state of its own. <code>toggleable</code> gives the row the switch role and the on or off state.' },
        ],
        quiz: [
          { q: 'A <code>Row</code> has <code>semantics(mergeDescendants = true)</code> and holds two <code>Text</code>s and a <code>Switch</code> with its own <code>onCheckedChange</code>. How many focus stops?', options: ['One', 'Two: the texts together, then the switch', 'Three'], a: 1, why: 'A child with its own action stays a separate stop. Move the action to the row with <code>toggleable</code> to get one stop.' },
          { q: 'What does <code>clearAndSetSemantics { contentDescription = "Battery" }</code> do to the children’s semantics?', options: ['Keeps them and adds a description', 'Removes them, so only "Battery" is read', 'Hides the composable from the screen'], a: 1, why: 'It clears everything below and uses only what you set in the block. The UI still draws as usual.' },
          { q: 'Which property makes a custom slider say "72 percent"?', options: ['<code>contentDescription</code>', '<code>stateDescription</code>', '<code>testTag</code>'], a: 1, why: '<code>stateDescription</code> is for the current state. <code>contentDescription</code> names the thing itself.' },
          { q: 'A cart total updates while TalkBack focus is on a product row. What makes TalkBack read the new total?', options: ['<code>Modifier.semantics { liveRegion = LiveRegionMode.Polite }</code> on the total', '<code>Modifier.semantics { heading() }</code> on the total', 'Requesting focus for the total on every change'], a: 0, why: 'Changes away from focus are silent by default. A polite live region is read once TalkBack finishes speaking. Moving focus would disorient the user.' },
        ],
        deeper: [
          {
            title: 'Custom controls need a value and an action',
            body: `<p>A slider drawn with <code>Canvas</code> has no text and no action, so TalkBack skips it. Describe it yourself. <code>progressBarRangeInfo</code> gives TalkBack the current value and the range. <code>setProgress</code> lets the user change it: with TalkBack, by swiping up or down while the slider has focus, or with the volume keys.</p>
<p>Use <code>clearAndSetSemantics</code> so anything drawn inside, like a label, does not become an extra stop.</p>`,
            code: `Canvas(
    Modifier
        .fillMaxWidth()
        .height(48.dp)
        .clearAndSetSemantics {
            contentDescription = "Volume"
            progressBarRangeInfo = ProgressBarRangeInfo(volume, 0f..1f, steps = 9)
            setProgress { target ->
                onVolumeChange(target.coerceIn(0f, 1f))
                true
            }
        }
) { /* draw the track and the thumb */ }`,
            visual(el) {
              let on = false, vol = 40, at = 0;
              const s = sw('ay-cs-sem', 'clearAndSetSemantics { ... }');
              const head = h('div', { class: 'ay-set-h' }, 'Sound');
              const fill = h('span', { class: 'ay-cs-fill' });
              const thumb = h('span', { class: 'ay-cs-thumb' });
              const gauge = h('div', { class: 'ay-cs-gauge' }, h('span', { class: 'ay-cs-track' }, fill, thumb));
              const done = h('span', { class: 'ay-pill ay-cs-done' }, 'Done');
              const ui = h('div', { class: 'ay-set' }, head, h('div', { class: 'ay-set-row' }, gauge), h('div', { class: 'ay-set-row' }, done));
              const o = out();
              const stops = () => [
                { el: head, text: 'Sound, Heading' },
                ...(on ? [{ el: gauge, text: () => `Volume, ${vol} percent, Slider`, adj: true }] : []),
                { el: done, text: 'Done, Button' },
              ];
              const txt = st => (typeof st.text === 'function' ? st.text() : st.text);
              function paintGauge() { fill.style.width = vol + '%'; thumb.style.left = vol + '%'; }
              function focus(i, quiet) {
                const list = stops();
                at = (i + list.length) % list.length;
                [head, gauge, done].forEach(x => x.classList.remove('ay-focus'));
                list[at].el.classList.add('ay-focus');
                if (!quiet) say(o, `TalkBack: <span class="good">"${esc(txt(list[at]))}"</span>${!on && at === 1 ? '  <span class="bad">// the slider was skipped</span>' : ''}`);
              }
              function adjust(d) {
                const st = stops()[at];
                if (!st.adj) { replay(st.el, 'shake'); say(o, on ? '<span class="muted">// focus is not on the slider. Swipe right to reach it.</span>' : '<span class="bad">// nothing here can be adjusted. To TalkBack, the slider does not exist.</span>'); return; }
                const nv = Math.max(0, Math.min(100, vol + d));
                if (nv === vol) { replay(gauge, 'shake'); say(o, `<span class="muted">// already at ${vol} percent</span>`); return; }
                vol = nv; paintGauge(); replay(thumb, 'pop');
                say(o, `setProgress(${(vol / 100).toFixed(1)}f) <span class="muted">→</span> TalkBack: <span class="good">"${vol} percent"</span>`);
              }
              s.input.addEventListener('change', () => { on = s.input.checked; focus(0); replay(ui, 'pop-soft'); });
              paintGauge(); focus(0, true);
              say(o, 'Swipe right through the screen. Then turn on the semantics and try again.');
              el.append(
                h('div', { class: 'ay-split' }, ui, h('div', { class: 'ay-col' }, h('span', { class: 'ay-label' }, 'TalkBack gestures'),
                  h('div', { class: 'controls' }, act('Swipe right', () => focus(at + 1)), act('Swipe up', () => adjust(10)), act('Swipe down', () => adjust(-10))),
                  s.el)),
                o);
            },
          },
          {
            title: 'Announce changes with liveRegion',
            body: `<p>Content that changes while focus stays elsewhere, like a cart total or an error under a form, is silent by default. Mark it with <code>liveRegion = LiveRegionMode.Polite</code> and TalkBack reads the new text once it finishes speaking. Use <code>Assertive</code> only for urgent changes, since it interrupts.</p>`,
            code: `Text(
    text = "Total: $total",
    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
)`,
          },
        ],
        underHood: {
          body: `<p>Compose does not create an Android View per composable, so TalkBack can’t walk a View tree. Instead, the one <code>AndroidComposeView</code> that hosts your UI installs an accessibility delegate. When TalkBack asks for nodes, the delegate builds virtual <code>AccessibilityNodeInfo</code> objects from the <em>merged</em> semantics tree, one per focus stop, and maps actions like click, set progress or a custom action back to your semantics lambdas.</p>
<p>Compose keeps two views of the same tree. The merged one is what accessibility services see. The unmerged one keeps every node, and UI tests can ask for it with <code>useUnmergedTree = true</code>.</p>`,
        },
        mistakes: [
          {
            title: 'A clickable icon instead of an IconButton',
            bad: `Icon(
    Icons.Default.Close,
    contentDescription = "Close",
    modifier = Modifier.clickable { onClose() },
)`,
            good: `IconButton(onClick = onClose) {
    Icon(Icons.Default.Close, contentDescription = "Close")
}`,
            why: '<code>IconButton</code> adds the button role and a 48 dp touch target. A bare clickable icon is announced without a role and is 24 dp, hard to hit.',
          },
          {
            title: 'Putting state into contentDescription',
            bad: `Icon(
    if (starred) Icons.Filled.Star else Icons.Outlined.Star,
    contentDescription = if (starred) "Starred" else "Not starred",
    modifier = Modifier.clickable { onStar(!starred) },
)`,
            good: `IconToggleButton(checked = starred, onCheckedChange = onStar) {
    Icon(
        if (starred) Icons.Filled.Star else Icons.Outlined.Star,
        contentDescription = "Star",
    )
}`,
            why: 'The description names the thing. <code>IconToggleButton</code> adds the checked state, a role and a 48 dp target, so TalkBack says the state in the user’s language and announces the change.',
          },
        ],
        visual(el) {
          const MODES = {
            none: { src: 'Row { Column { Text; Text }; Switch(checked, onCheckedChange) }', label: 'No merging' },
            merge: { src: 'Row(Modifier.semantics(mergeDescendants = true)) { ... }', label: 'mergeDescendants' },
            toggle: { src: 'Row(Modifier.toggleable(role = Role.Switch)) { ...; Switch(onCheckedChange = null) }', label: 'toggleable row' },
          };
          let mode = 'none', on = true, at = 0;
          const head = sw('ay-sem-head', 'heading() on "Network"');
          const hEl = h('div', { class: 'ay-set-h' }, 'Network');
          const tWifi = h('span', {}, 'Wi-Fi');
          const tSub = h('small', {}, 'Connected');
          const txt = h('div', { class: 'ay-set-txt' }, tWifi, tSub);
          const swEl = h('button', { class: 'ay-sw on', 'aria-label': 'Wi-Fi switch in the preview' });
          const row = h('div', { class: 'ay-set-row' }, txt, swEl);
          const ui = h('div', { class: 'ay-set' }, hEl, row);
          const tree = h('div', { class: 'ay-tree', 'aria-label': 'Semantics tree' });
          const code = h('div', { class: 'kt' });
          const o = out();
          const state = () => (on ? 'On' : 'Off');
          const sub = () => (on ? 'Connected' : 'Off');
          function model() {
            const heading = head.input.checked;
            const n = [{ name: 'Text', d: 0, props: [`Text="Network"`, heading && 'Heading'], stop: heading ? 'Network, Heading' : 'Network', el: hEl }];
            const swProps = ['Role=Switch', `ToggleableState=${state()}`, 'OnClick'];
            if (mode === 'none') {
              n.push({ name: 'Row', d: 0, props: [], note: 'no semantics of its own' },
                { name: 'Text', d: 1, props: ['Text="Wi-Fi"'], stop: 'Wi-Fi', el: tWifi },
                { name: 'Text', d: 1, props: [`Text="${sub()}"`], stop: sub(), el: tSub },
                { name: 'Switch', d: 1, props: swProps, stop: `Switch, ${state()}`, el: swEl, action: true });
            } else if (mode === 'merge') {
              n.push({ name: 'Row', d: 0, props: ['mergeDescendants'], stop: `Wi-Fi, ${sub()}`, el: txt },
                { name: 'Text', d: 1, props: ['Text="Wi-Fi"'], merged: true },
                { name: 'Text', d: 1, props: [`Text="${sub()}"`], merged: true },
                { name: 'Switch', d: 1, props: swProps, stop: `Switch, ${state()}`, el: swEl, action: true, note: 'has its own action, so not merged' });
            } else {
              n.push({ name: 'Row', d: 0, props: ['mergeDescendants', 'Role=Switch', `ToggleableState=${state()}`, 'OnClick'], stop: `Wi-Fi, ${sub()}, Switch, ${state()}`, el: row, action: true },
                { name: 'Text', d: 1, props: ['Text="Wi-Fi"'], merged: true },
                { name: 'Text', d: 1, props: [`Text="${sub()}"`], merged: true },
                { name: 'Switch', d: 1, props: [], merged: true, note: 'onCheckedChange = null: no action' });
            }
            return n;
          }
          let nodes = [], stops = [];
          function paint() {
            nodes = model(); stops = nodes.filter(x => x.stop);
            at = Math.min(at, stops.length - 1);
            swEl.classList.toggle('on', on); tSub.textContent = sub();
            code.innerHTML = hl(MODES[mode].src);
            [hEl, tWifi, tSub, txt, swEl, row].forEach(x => x.classList.remove('ay-focus'));
            const cur = stops[at];
            cur.el.classList.add('ay-focus');
            tree.replaceChildren(...nodes.map(x => {
              const k = stops.indexOf(x);
              return h('div', { class: ['ay-node', x.stop && 'ay-stop', x.merged && 'ay-merged', x === cur && 'ay-now'].filter(Boolean).join(' '), style: `--d:${x.d}` },
                h('div', { class: 'ay-node-h' }, k >= 0 ? h('span', { class: 'ay-stopn' }, String(k + 1)) : null, h('b', {}, x.name),
                  x.merged ? h('span', { class: 'ay-tag' }, 'merged into parent') : null, x.note ? h('span', { class: 'ay-tag' }, x.note) : null),
                x.props.filter(Boolean).length ? h('div', { class: 'ay-props' }, x.props.filter(Boolean).map(p => h('span', { class: 'ay-prop' }, p))) : null);
            }));
          }
          const speak = () => say(o, `Stop ${at + 1} of ${stops.length}: <span class="good">"${esc(stops[at].stop)}"</span>`);
          const modeBtns = Object.entries(MODES).map(([k, m]) => act(m.label, () => { mode = k; at = 0; press(modeBtns, modeBtns[Object.keys(MODES).indexOf(k)]); paint(); replay(tree, 'pop-soft'); speak(); }));
          head.input.addEventListener('change', () => { paint(); speak(); });
          const toggle = () => { on = !on; paint(); replay(swEl, 'pop'); speak(); };
          swEl.addEventListener('click', toggle);
          row.addEventListener('click', e => { if (mode === 'toggle' && e.target !== swEl) toggle(); });
          press(modeBtns, modeBtns[0]);
          paint(); speak();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            code,
            h('div', { class: 'ay-split' }, ui, tree),
            h('div', { class: 'controls' },
              act('Swipe right', () => { at = (at + 1) % stops.length; paint(); speak(); }),
              act('Double-tap', () => {
                if (stops[at].action) toggle();
                else { replay(stops[at].el, 'shake'); say(o, `<span class="bad">// "${esc(stops[at].stop)}" has no action. Double-tap does nothing.</span>`); }
              }),
              head.el),
            o,
            h('p', { class: 'tip' }, 'TalkBack’s exact wording varies by version. The number of stops and what each contains is what you control.'));
        },
      },

      // 2b ────────────────────────────────────────────
      {
        id: 'custom-actions',
        title: 'Custom accessibility actions',
        tagline: 'Give every hidden gesture a named action TalkBack and Switch Access can offer.',
        level: 'intermediate',
        body: `
<p>Swipe to archive, long-press menus and drag handles are hard for many users. With TalkBack on they often don’t work at all, because TalkBack uses swipes for its own navigation. A swipe left moves focus back instead of archiving the mail.</p>
<p>Offer the same actions as <code>customActions</code> in the element’s semantics. Each <code>CustomAccessibilityAction</code> has a label and a lambda that returns <code>true</code> when it handled the action. TalkBack tells the user more actions are available and lists them in its actions menu. Switch Access offers them too.</p>
<p>Keep the gesture for touch users. The custom action is a second way in, not a replacement.</p>`,
        code: `@Composable
fun MailRow(mail: Mail, onArchive: (Long) -> Unit, onMarkRead: (Long) -> Unit) {
    val dismissState = rememberSwipeToDismissBoxState()
    LaunchedEffect(dismissState.currentValue) {
        if (dismissState.currentValue == SwipeToDismissBoxValue.EndToStart) onArchive(mail.id)
    }
    SwipeToDismissBox(
        state = dismissState,
        backgroundContent = { ArchiveBackground() },
        modifier = Modifier.semantics {
            customActions = listOf(
                CustomAccessibilityAction("Archive") { onArchive(mail.id); true },
                CustomAccessibilityAction("Mark as read") { onMarkRead(mail.id); true },
            )
        },
    ) {
        MailSummary(mail)
    }
}`,
        remember: 'Every gesture-only action also needs a customActions entry with a clear label.',
        terms: [
          { term: 'CustomAccessibilityAction', def: 'A semantics action with a label and a lambda. Accessibility services offer it in their actions menu.' },
          { term: 'customActions', def: 'The semantics property that holds an element’s list of CustomAccessibilityAction objects.' },
          { term: 'Actions menu', def: 'The TalkBack menu that lists the actions available on the focused element, including custom actions.' },
          { term: 'Switch Access', def: 'An Android accessibility service that lets people use the device with one or more switches instead of the touch screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Offer Archive to TalkBack users and report that it was handled.', code: 'Modifier.semantics {\n    customActions = listOf(\n        [[CustomAccessibilityAction]]("Archive") {\n            onArchive(mail.id)\n            [[true]]\n        },\n    )\n}', why: 'Each action is a <code>CustomAccessibilityAction</code>. The lambda returns <code>true</code> when the action was performed.' },
          { type: 'bug', prompt: 'The row offers Open and Bookmark as actions, yet TalkBack still stops on the bookmark button too. Tap the line to change.', code: 'ArticleRow(\n    Modifier.semantics {\n        customActions = listOf(\n            CustomAccessibilityAction("Open article") { open(); true },\n            CustomAccessibilityAction("Add to bookmarks") { bookmark(); true },\n        )\n    }\n) {\n    ArticleText(article, Modifier.clearAndSetSemantics { })\n    BookmarkButton(onClick = bookmark)\n}', bug: 9, fix: '    BookmarkButton(onClick = bookmark, modifier = Modifier.clearAndSetSemantics { })', why: 'When you move children’s actions into custom actions on the container, clear the children’s own semantics. Otherwise the button is still a separate stop.' },
        ],
        quiz: [
          { q: 'TalkBack is on. The user swipes left on a mail row that archives on swipe. What happens?', options: ['TalkBack moves focus to the previous element', 'The mail is archived', 'Nothing'], a: 0, why: 'TalkBack takes swipes for navigation. The archive gesture never reaches your row, which is why the custom action is needed.' },
          { q: 'Which label is best for a custom action?', options: ['"Archive"', '"Swipe left"', '"Action 1"'], a: 0, why: 'Name what happens. The user is choosing a result from a menu, not a gesture.' },
          { q: 'You added <code>customActions</code>. Should the swipe gesture stay?', options: ['Yes, touch users still swipe', 'No, actions replace gestures', 'Only on tablets'], a: 0, why: 'Custom actions are an extra way in for people who can’t use the gesture.' },
          { q: 'Each article row has the summary, a bookmark button and a share button: three stops per row. Which change gives one stop with both actions available?', options: ['<code>mergeDescendants = true</code> on the row, keeping the buttons as they are', 'Add both as <code>customActions</code> on the row and clear the buttons’ semantics with <code>clearAndSetSemantics { }</code>', 'Set <code>contentDescription = null</code> on both buttons'], a: 1, why: 'Children with their own clicks stay separate stops even when merged. Moving their actions to the row and clearing them leaves one stop with an actions menu.' },
        ],
        deeper: [
          {
            title: 'Fewer stops: move inner buttons into the row',
            body: `<p>A list row with a title, a bookmark button and a share button is three focus stops per row. In a long list that is a lot of swiping. Put the actions on the row as custom actions instead, and clear the children’s semantics with <code>clearAndSetSemantics { }</code>, since their actions now live on the row.</p>
<p>TalkBack reads one stop per row and lists the actions in its menu. Switch Access opens the same list when the user selects the row.</p>`,
            code: `Row(
    Modifier
        .clickable(onClick = onOpen)
        .semantics {
            customActions = listOf(
                CustomAccessibilityAction("Add to bookmarks") { onBookmark(); true },
                CustomAccessibilityAction("Share") { onShare(); true },
            )
        },
) {
    ArticleSummary(article, Modifier.weight(1f))
    BookmarkButton(onClick = onBookmark, modifier = Modifier.clearAndSetSemantics { })
    ShareButton(onClick = onShare, modifier = Modifier.clearAndSetSemantics { })
}`,
          },
          {
            title: 'Name the result, not the gesture',
            body: `<p>The label is all the user hears. “Archive”, “Move up”, “Delete draft” say what will happen. “Swipe left” or “Long press” describe a gesture the user may not be able to make. Use the app’s language, so a Turkish build says “Arşivle”: pass a string resource, not a hard-coded English word.</p>`,
            code: `val archive = stringResource(R.string.action_archive)   // "Arşivle" in values-tr
Modifier.semantics {
    customActions = listOf(CustomAccessibilityAction(archive) { onArchive(); true })
}`,
          },
          {
            title: 'The same idea in Views',
            body: `<p>In a View-based list, <code>ViewCompat.addAccessibilityAction</code> adds a custom action to a view. It returns an id you can use to remove the action later, for example when the row is rebound to another item.</p>`,
            code: `override fun onBindViewHolder(holder: MailHolder, position: Int) {
    val mail = getItem(position)
    holder.archiveActionId?.let { ViewCompat.removeAccessibilityAction(holder.itemView, it) }
    holder.archiveActionId = ViewCompat.addAccessibilityAction(holder.itemView, "Archive") { _, _ ->
        onArchive(mail.id)
        true
    }
}`,
          },
        ],
        mistakes: [
          {
            title: 'A gesture as the only way',
            bad: `SwipeToDismissBox(state, backgroundContent = { DeleteBackground() }) {
    DraftRow(draft)   // swipe is the only way to delete
}`,
            good: `SwipeToDismissBox(
    state, backgroundContent = { DeleteBackground() },
    modifier = Modifier.semantics {
        customActions = listOf(CustomAccessibilityAction("Delete draft") { onDelete(); true })
    },
) { DraftRow(draft) }`,
            why: 'With TalkBack the swipe moves focus instead. Without a custom action, the draft can’t be deleted at all.',
          },
          {
            title: 'Labels that describe the gesture',
            bad: `CustomAccessibilityAction("Swipe left") { onArchive(); true }`,
            good: `CustomAccessibilityAction("Archive") { onArchive(); true }`,
            why: 'The menu is for people who can’t swipe. Tell them what the action does.',
          },
        ],
        visual(el) {
          const MAIL = [['Rami', 'Trail map for Saturday'], ['Ines', 'Invoice 1042'], ['Kai', 'Photos from the ridge']];
          let mails, at = 0, busy = false;
          const s = sw('ay-ca-on', 'customActions');
          const box = h('div', { class: 'ay-set ay-ca-list' });
          const menu = h('div', { class: 'ay-ca-menu', hidden: true });
          const o = out();
          function paint() {
            box.replaceChildren(...(mails.length ? mails.map((m, i) => h('div', { class: 'ay-ca-row' + (i === at ? ' ay-focus' : '') + (m.read ? ' ay-ca-read' : '') }, h('b', {}, m.from), h('small', {}, m.subject)))
              : [h('p', { class: 'ay-empty' }, 'Inbox empty.')]));
          }
          const label = m => `${m.from}, ${m.subject}${m.read ? '' : ', unread'}`;
          function reset() { mails = MAIL.map(([from, subject]) => ({ from, subject, read: false })); at = 0; menu.hidden = true; paint(); }
          function next() {
            if (busy || !mails.length) return;
            menu.hidden = true; at = (at + 1) % mails.length; paint();
            say(o, `TalkBack: <span class="good">"${esc(label(mails[at]))}"</span>`);
          }
          function swipeLeft() {
            if (busy || !mails.length) return;
            menu.hidden = true; at = (at - 1 + mails.length) % mails.length; paint();
            say(o, `<span class="bad">No archive.</span> With TalkBack on, a swipe left moves focus back: "${esc(label(mails[at]))}".`);
          }
          async function run(name) {
            if (busy) return; busy = true;
            menu.hidden = true;
            const row = box.children[at], m = mails[at];
            if (name === 'Archive') {
              row.classList.add('leave'); await sleep(420);
              if (!el.isConnected) return;
              mails.splice(at, 1); at = Math.min(at, Math.max(0, mails.length - 1)); paint();
              say(o, `<span class="good">Archived "${esc(m.subject)}".</span>${mails.length ? ` Focus moves to "${esc(label(mails[at]))}".` : ''}`);
            } else {
              m.read = true; paint(); replay(box.children[at], 'pop');
              say(o, `<span class="good">Marked as read.</span> TalkBack: "${esc(label(m))}"`);
            }
            busy = false;
          }
          function openMenu() {
            if (busy) return;
            if (!mails.length) { say(o, 'Nothing focused.'); return; }
            const acts = s.input.checked ? ['Archive', 'Mark as read'] : [];
            menu.replaceChildren(h('span', { class: 'ay-label' }, 'Actions'),
              ...(acts.length ? acts.map(a => act(a, () => run(a))) : [h('p', { class: 'ay-empty' }, 'No actions available')]));
            menu.hidden = false; replay(menu, 'drop-in');
            say(o, acts.length ? 'TalkBack’s actions menu lists your custom actions. Pick one.' : '<span class="bad">// the only way to archive is a swipe, which TalkBack takes for itself</span>');
          }
          s.input.addEventListener('change', () => { if (!busy) { reset(); say(o, s.input.checked ? 'Each row now carries Archive and Mark as read.' : 'Rows have only the swipe gesture.'); } });
          reset();
          say(o, 'Focus is on the first mail. Try to archive it with TalkBack on.');
          el.append(
            h('div', { class: 'ay-split' }, box, h('div', { class: 'ay-col' },
              h('div', { class: 'controls' }, act('Swipe right', next), act('Swipe left', swipeLeft), act('Open actions menu', openMenu)),
              menu, s.el)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'targets',
        title: 'Touch targets and focus order',
        tagline: '48 dp to hit, and an order that makes sense when read aloud.',
        level: 'intermediate',
        body: `
<p>Fingers are not precise. Material asks for touch targets of at least 48 by 48 dp, about 9 mm, even when the icon you see is 24 dp. <code>IconButton</code>, <code>Checkbox</code>, <code>RadioButton</code> and <code>Switch</code> reserve that space already. For your own tappable element, add the <code>minimumInteractiveComponentSize()</code> modifier. It grows the layout to 48 dp and keeps the visual size.</p>
<p>TalkBack, Switch Access and keyboards move through a screen in one order: top to bottom, then start to end. That breaks for side-by-side columns, which get read across in rows. Set <code>isTraversalGroup = true</code> on each column so one is read in full before the next. Inside a group, <code>traversalIndex</code> moves an element earlier or later. Lower values come first, and the default is 0.</p>
<p>Keyboard and D-pad users also need to see where focus is. Material components draw a focus state, and <code>clickable</code> shows one through its indication. Keep it visible on your custom controls. The next lesson, Keyboard and D-pad focus, shows how focus moves between them.</p>`,
        code: `// Material reserves 48.dp for touch around a 24.dp icon
IconButton(onClick = onClose) {
    Icon(Icons.Default.Close, contentDescription = "Close")
}

// Your own tappable element: bigger touch area, same look
Icon(
    Icons.Default.Info,
    contentDescription = "Details",
    modifier = Modifier
        .minimumInteractiveComponentSize()
        .clickable(onClick = onDetails),
)

// Read each column top to bottom before moving on
Row {
    PlanColumn(basic, Modifier.weight(1f).semantics { isTraversalGroup = true })
    PlanColumn(pro, Modifier.weight(1f).semantics { isTraversalGroup = true })
}

// Read the main action before the details
Button(onClick = onChoose, Modifier.semantics { traversalIndex = -1f }) {
    Text("Choose plan")
}`,
        remember: 'Make every target at least 48 dp. Group columns with isTraversalGroup so they are read top to bottom.',
        terms: [
          { term: 'minimumInteractiveComponentSize', def: 'A Material 3 modifier that reserves at least 48 dp of layout space for an interactive element that would otherwise measure smaller.' },
          { term: 'isTraversalGroup', def: 'A semantics flag that makes accessibility services finish a container’s children before moving to the next container.' },
          { term: 'traversalIndex', def: 'A semantics value that reorders an element within its traversal group; lower values are visited first and the default is 0.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the left column as a unit, and move the summary to the front of the order.', code: 'Column(Modifier.semantics { [[isTraversalGroup]] = true }) {\n    Text(plan.name)\n    Text(plan.price)\n}\nText(summary, Modifier.semantics { [[traversalIndex]] = -1f })', why: 'A traversal group is read in full before its siblings. A negative <code>traversalIndex</code> puts an element before the default 0.' },
          { type: 'bug', prompt: 'Users keep tapping Italic when they meant Bold. Tap the line that shrank the targets.', code: '@Composable\nfun FormatBar(onBold: () -> Unit, onItalic: () -> Unit) {\n    CompositionLocalProvider(LocalMinimumInteractiveComponentSize provides Dp.Unspecified) {\n        Row {\n            IconButton(onClick = onBold) { Icon(Icons.Default.FormatBold, contentDescription = "Bold") }\n            IconButton(onClick = onItalic) { Icon(Icons.Default.FormatItalic, contentDescription = "Italic") }\n        }\n    }\n}', bug: 2, fix: '    // remove the provider: keep Material’s 48.dp minimum', why: 'Providing <code>Dp.Unspecified</code> turns off the 48 dp minimum for every component inside, so the buttons shrink to their visual size and sit close together.' },
        ],
        quiz: [
          { q: 'What is the minimum touch target size Android recommends?', options: ['24 by 24 dp', '36 by 36 dp', '48 by 48 dp'], a: 2, why: '48 dp is about 9 mm, roughly the size of a fingertip.' },
          { q: 'Two plan cards sit side by side. Without traversal groups, how does TalkBack read "Basic / $5" and "Pro / $12"?', options: ['Basic, $5, Pro, $12', 'Basic, Pro, $5, $12', 'Pro, $12, Basic, $5'], a: 1, why: 'Default order goes row by row. <code>isTraversalGroup</code> on each card fixes it.' },
          { q: 'Which element is visited first?', options: ['<code>traversalIndex = 1f</code>', '<code>traversalIndex = 0f</code>', '<code>traversalIndex = -1f</code>'], a: 2, why: 'Lower values come first within the traversal group. The default is 0.' },
          { q: 'A row is built with <code>Modifier.pointerInput(Unit) { detectTapGestures { onOpen() } }</code>. What do keyboard and TalkBack users get?', options: ['The same as touch users', 'Focus, but no ripple', 'No focus, no role and no click action; <code>clickable</code> adds all three'], a: 2, why: 'A raw tap detector handles touch only. clickable adds keyboard focus, Enter handling, the click action for accessibility services and an indication.' },
        ],
        deeper: [
          {
            title: 'clickable gives more than a tap handler',
            body: `<p>A tap handler made with <code>pointerInput { detectTapGestures }</code> only handles touch. The element cannot take keyboard focus, has no role, and TalkBack does not offer to activate it. <code>clickable</code> adds focus, Enter key handling, the click action and an indication. For something with an on and off state, <code>toggleable</code> with a role also reports the state.</p>
<p>Pick an implementation, then reach the chip by touch, by keyboard and with TalkBack.</p>`,
            code: `Row(
    Modifier
        .toggleable(value = express, role = Role.Switch, onValueChange = onExpress)
        .minimumInteractiveComponentSize()
        .padding(horizontal = 12.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    Text("Express shipping")
    Spacer(Modifier.width(8.dp))
    Switch(checked = express, onCheckedChange = null)   // null: the Row handles input
}`,
            visual(el) {
              const IMPL = [
                { src: 'pointerInput { detectTapGestures { } }', focus: false, talk: () => 'Express shipping', note: 'no role, no action, no state' },
                { src: 'clickable { }', focus: true, talk: () => 'Express shipping, double-tap to activate', note: 'an action, but no state' },
                { src: 'toggleable(role = Role.Switch) { }', focus: true, talk: () => `Express shipping, ${on ? 'On' : 'Off'}, Switch`, note: 'role and state' },
              ];
              let impl = 0, on = false, kAt = null, tAt = null;
              const back = h('span', { class: 'ay-ico', html: ICON.back });
              const chip = h('span', { class: 'ay-d2-chip' }, h('span', {}, 'Express shipping'), h('span', { class: 'ay-sw' }));
              const pay = h('span', { class: 'ay-pill' }, 'Pay');
              const ui = h('div', { class: 'ay-set ay-d2-chipui' }, h('div', { class: 'ay-bar ay-between' }, back, h('span', { class: 'ay-title' }, 'Checkout')), h('div', { class: 'ay-set-row' }, chip), h('div', { class: 'ay-set-row' }, pay));
              const o = out();
              const els = { back, chip, pay };
              const kStops = () => ['back', ...(IMPL[impl].focus ? ['chip'] : []), 'pay'];
              const clear = () => Object.values(els).forEach(x => x.classList.remove('ay-focus'));
              const paintChip = () => { chip.lastChild.classList.toggle('on', on); chip.classList.toggle('ay-d2-chip-on', on); };
              const btns = IMPL.map((m, i) => cmd(`Modifier.${m.src}`, () => { impl = i; on = false; kAt = tAt = null; clear(); paintChip(); press(btns, btns[i]); say(o, `Chip now uses ${hl(m.src)}`); }));
              function tap() { on = !on; paintChip(); replay(chip, 'pop'); say(o, `Touch: <span class="good">toggled ${on ? 'on' : 'off'}</span> <span class="muted">// all three handle a tap</span>`); }
              function tabKey() {
                const s = kStops(); kAt = kAt == null ? 0 : (s.indexOf(kAt) + 1) % s.length; kAt = s[kAt]; clear(); els[kAt].classList.add('ay-focus');
                say(o, `Keyboard focus: <span class="good">${kAt === 'chip' ? 'the chip' : kAt === 'back' ? 'Back' : 'Pay'}</span>${!IMPL[impl].focus && kAt === 'pay' ? '  <span class="bad">// Tab skipped the chip: pointerInput is not focusable</span>' : ''}`);
              }
              function enter() {
                if (kAt !== 'chip') { say(o, `<span class="muted">Enter on ${kAt ? (kAt === 'back' ? 'Back' : 'Pay') : 'nothing'}. Tab to the chip first${IMPL[impl].focus ? '' : ', if you can'}.</span>`); return; }
                tap();
              }
              function talk() {
                const s = ['back', 'chip', 'pay']; tAt = tAt == null ? 0 : (s.indexOf(tAt) + 1) % s.length; tAt = s[tAt]; clear(); els[tAt].classList.add('ay-focus');
                const txt = tAt === 'back' ? 'Navigate up, Button' : tAt === 'pay' ? 'Pay, Button' : IMPL[impl].talk();
                say(o, `TalkBack: <span class="good">"${esc(txt)}"</span>${tAt === 'chip' ? `  <span class="${impl === 2 ? 'good' : 'bad'}">// ${IMPL[impl].note}</span>` : ''}`);
              }
              press(btns, btns[0]); paintChip();
              say(o, 'Try each way of reaching the chip, then switch the implementation.');
              el.append(
                h('div', { class: 'controls ay-d2-col-btns' }, btns),
                h('div', { class: 'ay-split' }, ui, h('div', { class: 'ay-col' },
                  h('span', { class: 'ay-label' }, 'Reach the chip'),
                  h('div', { class: 'controls' }, act('Tap it', tap), act('Tab', tabKey), act('Enter', enter), act('TalkBack: swipe right', talk)),
                  h('p', { class: 'tip' }, 'Exact TalkBack wording varies by version and language.'))),
                o);
            },
          },
          {
            title: 'Move focus on purpose',
            body: `<p>Sometimes the next step is obvious, like typing on a search screen. Request focus for it once the screen appears. Keep it to those cases: moving focus on every screen is disorienting with a keyboard and with a screen reader.</p>`,
            code: `val searchFocus = remember { FocusRequester() }

TextField(query, onQueryChange, Modifier.focusRequester(searchFocus))

LaunchedEffect(Unit) { searchFocus.requestFocus() }`,
          },
        ],
        underHood: {
          body: `<p><code>minimumInteractiveComponentSize()</code> is a layout modifier. It reads <code>LocalMinimumInteractiveComponentSize</code>, 48 dp by default, measures the content, then reports at least that size and centers the content inside. The extra space is real layout space, which is why it also makes the accessibility node bigger.</p>
<p>Compose has a second safety net at touch time. If a pointer input area ends up smaller than <code>ViewConfiguration.minimumTouchTargetSize</code>, the touch target is expanded evenly around it, as long as no other target is hit directly. That rescue only affects touch. It does not change layout or what TalkBack reports, so keep the real 48 dp size.</p>`,
        },
        mistakes: [
          {
            title: 'Padding before clickable',
            bad: `Row(
    Modifier
        .padding(16.dp)
        .clickable(onClick = onOpen)
) { Text(title) }`,
            good: `Row(
    Modifier
        .clickable(onClick = onOpen)
        .padding(16.dp)
) { Text(title) }`,
            why: 'Modifiers apply from the outside in. With padding first, the clickable area is only the inner content, and the 16 dp around it does nothing when tapped. Clickable first makes the whole row tappable and shows the ripple across it.',
          },
          {
            title: 'Removing the indication',
            bad: `Modifier.clickable(
    interactionSource = null,
    indication = null,
    onClick = onSelect,
)`,
            good: `Modifier.clickable(onClick = onSelect)
// or draw your own focus and pressed states from an InteractionSource`,
            why: 'The indication draws the pressed and focused states. Without it, keyboard and D-pad users cannot see which element has focus.',
          },
        ],
        visual(el) {
          // part 1: thumb taps on a toolbar
          const S = 1.8; // px per dp
          const big = sw('ay-tt-big', 'minimumInteractiveComponentSize()');
          const names = ['Bold', 'Italic', 'Link'];
          const bar = h('div', { class: 'ay-tb', role: 'img', 'aria-label': 'Toolbar with three icons and their touch areas' });
          const hits = names.map(() => h('span', { class: 'ay-hit' }));
          const icons = ['bold', 'italic', 'link'].map(k => h('span', { class: 'ay-tgt', html: ICON[k] }));
          bar.append(...hits, ...icons);
          let tally = { ok: 0, miss: 0, wrong: 0 };
          const score = h('div', { class: 'ay-score' });
          const o = out();
          const geo = () => {
            const box = big.input.checked ? 48 : 24, gap = big.input.checked ? 0 : 8;
            const total = 3 * box + 2 * gap, x0 = (270 / S - total) / 2, y0 = (120 / S - box) / 2;
            return names.map((_, i) => ({ x: x0 + i * (box + gap), y: y0, w: box, icon: 24 }));
          };
          function layout() {
            geo().forEach((g, i) => {
              Object.assign(hits[i].style, { left: g.x * S + 'px', top: g.y * S + 'px', width: g.w * S + 'px', height: g.w * S + 'px' });
              const ix = g.x + (g.w - 24) / 2, iy = g.y + (g.w - 24) / 2;
              Object.assign(icons[i].style, { left: ix * S + 'px', top: iy * S + 'px', width: 24 * S + 'px', height: 24 * S + 'px' });
            });
            bar.querySelectorAll('.ay-touch').forEach(t => t.remove());
            tally = { ok: 0, miss: 0, wrong: 0 }; paintScore();
          }
          const paintScore = () => score.replaceChildren(
            h('span', {}, 'hit ', h('b', {}, String(tally.ok))), h('span', {}, 'missed ', h('b', {}, String(tally.miss))), h('span', {}, 'wrong button ', h('b', {}, String(tally.wrong))));
          function tap(i) {
            const g = geo(), c = g[i];
            const r = Math.sqrt(Math.random()) * 15, a = Math.random() * Math.PI * 2; // thumb lands within ~15 dp
            const px = c.x + c.w / 2 + Math.cos(a) * r, py = c.y + c.w / 2 + Math.sin(a) * r;
            const j = g.findIndex(t => px >= t.x && px <= t.x + t.w && py >= t.y && py <= t.y + t.w);
            const kind = j === i ? 'ok' : j < 0 ? 'miss' : 'wrong';
            tally[kind]++; paintScore();
            const dots = bar.querySelectorAll('.ay-touch');
            if (dots.length >= 12) dots[0].remove();
            bar.append(h('span', { class: `ay-touch ${kind}`, style: `left:${px * S}px;top:${py * S}px` }));
            say(o, kind === 'ok' ? `<span class="good">ok:</span> ${names[i]} tapped` : kind === 'miss' ? `<span class="bad">missed:</span> the thumb landed between targets` : `<span class="bad">wrong:</span> you meant ${names[i]}, the app got ${names[j]}`);
          }
          big.input.addEventListener('change', () => { layout(); say(o, big.input.checked ? 'Each target is now 48 dp. The icons look the same.' : 'Each target is the 24 dp icon, 8 dp apart.'); });

          // part 2: traversal order
          const groups = sw('ay-tt-groups', 'isTraversalGroup on each column');
          const first = sw('ay-tt-first', 'traversalIndex = -1f on the button');
          const cells = [
            { text: 'Basic', col: 0, row: 0 }, { text: 'Pro', col: 1, row: 0 },
            { text: '$5 a month', col: 0, row: 1 }, { text: '$12 a month', col: 1, row: 1 },
            { text: 'Choose plan', col: -1, row: 2 },
          ];
          cells.forEach(c => { c.el = h('div', { class: 'ay-cell' + (c.col < 0 ? ' ay-wide' : ''), 'data-col': String(c.col) }, c.text); });
          const plans = h('div', { class: 'ay-plans', role: 'img', 'aria-label': 'Two plan columns and a button' }, cells.map(c => c.el));
          const o2 = out();
          let order = [], at = -1;
          function computeOrder() {
            let seq = groups.input.checked
              ? [...cells.filter(c => c.col === 0), ...cells.filter(c => c.col === 1), ...cells.filter(c => c.col < 0)]
              : [...cells].sort((a, b) => a.row - b.row || a.col - b.col);
            if (first.input.checked) seq = [seq.find(c => c.col < 0), ...seq.filter(c => c.col >= 0)];
            order = seq; at = -1;
            plans.classList.toggle('ay-grouped', groups.input.checked);
            cells.forEach(c => {
              c.el.classList.remove('ay-focus');
              c.el.querySelectorAll('.ay-badge-n').forEach(b => b.remove());
              c.el.append(h('span', { class: 'ay-badge-n drop-in' }, String(order.indexOf(c) + 1)));
            });
            say(o2, `Order: <span class="good">${order.map(c => esc(c.text)).join(', ')}</span>`);
          }
          groups.input.addEventListener('change', computeOrder);
          first.input.addEventListener('change', computeOrder);
          const step = () => {
            at = (at + 1) % order.length;
            cells.forEach(c => c.el.classList.remove('ay-focus'));
            order[at].el.classList.add('ay-focus');
            say(o2, `TalkBack ${at + 1}/${order.length}: <span class="good">"${esc(order[at].text)}${order[at].col < 0 ? ', Button' : ''}"</span>`);
          };
          layout(); computeOrder();
          say(o, 'Tap each button a few times. Red and orange dots are mistakes.');
          el.append(
            h('span', { class: 'ay-label' }, 'Touch targets (thumb taps land within about 15 dp)'),
            h('div', { class: 'stage' }, bar),
            h('div', { class: 'controls' }, names.map((n, i) => act(`Tap ${n}`, () => tap(i))), big.el),
            score, o,
            h('span', { class: 'ay-label' }, 'Focus order'),
            h('div', { class: 'stage' }, plans),
            h('div', { class: 'controls' }, act('Swipe right', step), groups.el, first.el),
            o2);
        },
      },

      // 3b ────────────────────────────────────────────
      {
        id: 'keyboard-nav',
        title: 'Keyboard and D-pad focus',
        tagline: 'Tab walks a line, arrow keys jump to the nearest neighbour.',
        level: 'intermediate',
        body: `
<p>Tablets with keyboards, Chromebooks and TVs move focus with keys. Compose supports two kinds of moves. <em>One-dimensional</em>: Tab and Shift+Tab go through the focusable elements in the order they appear on screen, and wrap from the last back to the first. <em>Two-dimensional</em>: arrow keys and the D-pad look at positions and go to the closest element in that direction. They don’t wrap. Down on the bottom element stays put.</p>
<p>A mouse click clears keyboard focus. The next Tab starts again from the first element, not from where focus was.</p>
<p>When the nearest element is the wrong one, override a direction with <code>focusProperties</code>. Attach a <code>FocusRequester</code> to the target and assign it to <code>down</code>, <code>up</code>, <code>left</code>, <code>right</code>, or to <code>next</code> and <code>previous</code> for Tab.</p>`,
        code: `@Composable
fun MessageForm(message: String, onMessage: (String) -> Unit, onSend: () -> Unit, onCancel: () -> Unit) {
    val send = remember { FocusRequester() }
    Column {
        OutlinedTextField(
            message, onMessage,
            Modifier.focusProperties { down = send },   // nearest is Cancel; Send is what users want
        )
        Row {
            TextButton(onClick = onCancel) { Text("Cancel") }
            Button(onClick = onSend, Modifier.focusRequester(send)) { Text("Send") }
        }
    }
}`,
        remember: 'Tab follows screen order and wraps. Arrows go to the nearest element and stop at the edge.',
        terms: [
          { term: 'One-dimensional traversal', def: 'Focus movement with Tab and Shift+Tab through focusable elements in their visual order. It wraps at the ends.' },
          { term: 'Two-dimensional traversal', def: 'Focus movement with arrow keys or a D-pad to the geometrically closest element in that direction. It does not wrap.' },
          { term: 'focusProperties', def: 'A Compose modifier that overrides where focus goes next in each direction, or blocks a direction with FocusRequester.Cancel.' },
          { term: 'focusGroup', def: 'A modifier that makes a set of children one navigation unit. Focus enters it, moves among its children, then leaves to the next element outside.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send Down from the field to the Send button.', code: 'val send = remember { [[FocusRequester]]() }\n\nOutlinedTextField(text, onText, Modifier.focusProperties { [[down]] = send })\nButton(onClick = onSend, Modifier.[[focusRequester]](send)) { Text("Send") }', why: 'The target holds a <code>FocusRequester</code>. The source names it as its <code>down</code> neighbour.' },
          { type: 'bug', prompt: 'Tab from First should jump to Third, but it still goes to Second. Tap the line.', code: 'val (first, second, third) = remember { FocusRequester.createRefs() }\nColumn {\n    Button(onClick = {}, Modifier.focusRequester(first)\n        .focusProperties { down = third }) { Text("First") }\n    Button(onClick = {}, Modifier.focusRequester(second)) { Text("Second") }\n    Button(onClick = {}, Modifier.focusRequester(third)) { Text("Third") }\n}', bug: 3, fix: '        .focusProperties { next = third }) { Text("First") }', why: 'Tab uses <code>next</code>. <code>down</code> only changes the arrow key and D-pad move.' },
        ],
        quiz: [
          { q: 'Focus is on the last element. The user presses Tab. Where does focus go?', options: ['The first element: Tab wraps', 'It stays on the last element', 'Nowhere, focus is cleared'], a: 0, why: 'One-dimensional traversal wraps from the end to the start. Shift+Tab goes the other way.' },
          { q: 'Focus is on the bottom-most button. The user presses Down. Where does focus go?', options: ['It stays on that button', 'The first element at the top', 'The next element in Tab order'], a: 0, why: 'Two-dimensional traversal does not wrap. There is nothing below, so nothing moves.' },
          { q: 'The user clicks a field with the mouse, then presses Tab. Where does focus go?', options: ['The first element on screen', 'The element after the clicked field', 'The element before it'], a: 0, why: 'A click clears keyboard focus, so Tab starts over from the first focus target.' },
          { q: 'A carousel’s last card should not jump into an unrelated side panel on Right, but Down should work as usual. Which <code>focusProperties</code> fits?', options: ['<code>right = FocusRequester.Cancel; down = FocusRequester.Default</code>', '<code>right = FocusRequester.Default; down = FocusRequester.Cancel</code>', '<code>canFocus = false</code> on the side panel'], a: 0, why: 'Cancel blocks the move in that direction. Default keeps the built-in search. Making the panel unfocusable would lock keyboard users out of it.' },
          { q: 'You draw a focus ring from <code>onFocusChanged</code>, but it never appears. The chain is <code>.clickable { }.onFocusChanged { … }.border(…)</code>. What is wrong?', options: ['border cannot read focus state', 'clickable elements are never focusable by keyboard', 'onFocusChanged must come before the modifier that makes the element focusable'], a: 2, why: 'onFocusChanged sees the focus of the focusable that follows it. Put it before <code>clickable</code> so it observes that element.' },
        ],
        deeper: [
          {
            title: 'Group controls with focusGroup',
            body: `<p>A <code>focusGroup()</code> turns its children into one unit for navigation. Focus enters the group, moves among its children, and leaves to the next element outside only after the last one. With Tab, focus enters at the first child. With arrows, it enters at the child closest to where you came from.</p>
<p>Add <code>focusProperties { onEnter = { ... } }</code> to send focus to the main action when the group is entered. <code>LazyColumn</code>, <code>LazyRow</code> and lazy grids are focus groups already.</p>`,
            code: `val confirm = remember { FocusRequester() }
Row(
    Modifier
        .focusGroup()
        .focusProperties { onEnter = { confirm.requestFocus() } },
) {
    TextButton(onClick = onCancel) { Text("Vazgeç") }
    Button(onClick = onConfirm, Modifier.focusRequester(confirm)) { Text("Onayla") }
}`,
          },
          {
            title: 'Block a direction, or keep the default',
            body: `<p>Sometimes a move should not happen at all, like Right from the last item of a carousel jumping into an unrelated panel. Assign <code>FocusRequester.Cancel</code> to that direction. Assign <code>FocusRequester.Default</code> to keep the built-in search for a direction after you changed others.</p>`,
            code: `Card(
    Modifier.focusProperties {
        right = FocusRequester.Cancel    // stay at the end of the row
        down = FocusRequester.Default    // normal search downward
    },
) { /* ... */ }`,
          },
          {
            title: 'Make focus visible',
            body: `<p>Keyboard users need to see where they are. Material components and <code>clickable</code> draw a focus state through their indication. For your own control, observe focus with <code>onFocusChanged</code> and draw a clear ring. Put <code>onFocusChanged</code> before the modifier that makes the element focusable, so it sees that element’s focus.</p>`,
            code: `var focused by remember { mutableStateOf(false) }
Box(
    Modifier
        .onFocusChanged { focused = it.isFocused }
        .border(if (focused) 3.dp else 1.dp, if (focused) MaterialTheme.colorScheme.primary else Color.Gray, RoundedCornerShape(12.dp))
        .clickable(onClick = onPick)
        .padding(16.dp),
) { Text(plan.name) }`,
          },
        ],
        mistakes: [
          {
            title: 'Making plain text focusable',
            bad: `Text(article.body, Modifier.focusable())   // an extra Tab stop with nothing to do`,
            good: `Text(article.body)   // screen readers still read it; keyboards skip it`,
            why: 'Keyboard focus is for things you can act on. Every extra stop makes Tab users press more keys to reach the controls.',
          },
          {
            title: 'Turning off the indication',
            bad: `Modifier.clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) { onPick() }`,
            good: `Modifier.clickable { onPick() }   // keeps the ripple and the focus highlight`,
            why: '<code>indication = null</code> also removes the focused look. A keyboard user can no longer tell which element Enter will press.',
          },
        ],
        visual(el) {
          const IT = [
            { id: 'name', label: 'Name', x: 0, y: 0, w: 40, h: 20 },
            { id: 'email', label: 'Email', x: 44, y: 0, w: 56, h: 20 },
            { id: 'msg', label: 'Message', x: 0, y: 28, w: 100, h: 32 },
            { id: 'cancel', label: 'Cancel', x: 40, y: 68, w: 28, h: 20, btn: true },
            { id: 'send', label: 'Send', x: 72, y: 68, w: 28, h: 20, btn: true },
          ];
          let at = null, lastPos = null, override = false;
          for (const it of IT) it.el = h('div', { class: 'ay-d2-kf-item' + (it.btn ? ' ay-d2-kf-btn' : ''), style: `left:${it.x}%;top:${it.y}%;width:${it.w}%;height:${it.h}%` }, it.label);
          const form = h('div', { class: 'ay-d2-kf', role: 'img', 'aria-label': 'Form with five focusable elements' }, IT.map(i => i.el));
          const o = out();
          const ov = sw('ay-d2-kf-ov', 'Message: focusProperties { down = send }');
          const cx = i => i.x + i.w / 2, cy = i => i.y + i.h / 2;
          function show(i, how) {
            IT.forEach(x => x.el.classList.remove('ay-focus', 'ay-d2-kf-click'));
            if (i == null) return;
            at = i; lastPos = i;
            IT[i].el.classList.add('ay-focus'); replay(IT[i].el, 'pop-soft');
            say(o, `${esc(how)} <span class="muted">→</span> <span class="good">${IT[i].label}</span>`);
          }
          function tab(dir) {
            const i = at == null ? (dir > 0 ? 0 : IT.length - 1) : (at + dir + IT.length) % IT.length;
            const wrapped = at != null && ((dir > 0 && i === 0) || (dir < 0 && i === IT.length - 1));
            show(i, `${dir > 0 ? 'Tab' : 'Shift+Tab'}${at == null ? ' (nothing focused, start from the first)' : wrapped ? ' (wraps around)' : ''}`);
          }
          function arrow(dx, dy, name) {
            const from = at != null ? at : lastPos;
            if (from == null) { say(o, 'Nothing focused yet. Press Tab first.'); return; }
            const c = IT[from];
            if (override && c.id === 'msg' && dy > 0) { show(IT.findIndex(x => x.id === 'send'), `${name} (focusProperties override)`); return; }
            let best = null, score = Infinity;
            IT.forEach((t, j) => {
              if (j === from) return;
              const major = dy > 0 ? t.y - (c.y + c.h) : dy < 0 ? c.y - (t.y + t.h) : dx > 0 ? t.x - (c.x + c.w) : c.x - (t.x + t.w);
              if (major < -0.01) return;
              const minor = dy ? Math.abs(cx(t) - cx(c)) : Math.abs(cy(t) - cy(c));
              const s = major * 2 + minor;
              if (s < score) { score = s; best = j; }
            });
            if (best == null) { replay(c.el, 'shake'); say(o, `${name}: <span class="muted">nothing further that way. 2D focus does not wrap.</span>`); at = from; c.el.classList.add('ay-focus'); return; }
            show(best, `${name} (closest in that direction)`);
          }
          function click() {
            IT.forEach(x => x.el.classList.remove('ay-focus'));
            at = null; lastPos = 1;
            IT[1].el.classList.add('ay-d2-kf-click'); replay(IT[1].el, 'pop');
            say(o, '<span class="muted">Mouse click on Email: keyboard focus is cleared. Tab restarts at the first element. Arrows start from where you clicked.</span>');
          }
          ov.input.addEventListener('change', () => { override = ov.input.checked; say(o, override ? 'Down from Message now goes to Send.' : 'Down from Message goes to the nearest element below.'); });
          say(o, 'Press Tab to start. Then try the arrows from Message.');
          el.append(
            h('div', { class: 'stage' }, form),
            h('div', { class: 'controls' }, act('Tab', () => tab(1)), act('Shift+Tab', () => tab(-1)), act('←', () => arrow(-1, 0, 'Left'), { 'aria-label': 'Arrow left' }), act('↑', () => arrow(0, -1, 'Up'), { 'aria-label': 'Arrow up' }), act('↓', () => arrow(0, 1, 'Down'), { 'aria-label': 'Arrow down' }), act('→', () => arrow(1, 0, 'Right'), { 'aria-label': 'Arrow right' }), act('Click Email with the mouse', click)),
            h('div', { class: 'controls' }, ov.el),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'text-scale',
        title: 'Text scaling and contrast',
        tagline: 'sp grows with the user’s font size. Colors need enough contrast to read.',
        level: 'intermediate',
        body: `
<p>Use <code>sp</code> for text and <code>dp</code> for everything else. A dp has the same physical size on every screen. An sp is a dp multiplied by the user’s font scale, so text grows when they pick a larger font in Settings, while icons and spacing stay put.</p>
<p>Since Android 14 users can go up to 200%, and the scaling is nonlinear. Small text grows the most and large text grows less, since it is already easy to read. At 200%, 14sp body text is drawn at 26dp and a 30sp headline at only 38dp. Text that grows needs room, so use <code>heightIn(min = ...)</code> in place of fixed heights, let text wrap, and check with <code>@PreviewFontScale</code>.</p>
<p>Text also needs contrast with its background. WCAG measures it as a ratio from 1:1 to 21:1. Body text needs at least 4.5:1. Large text (about 24sp, or 19sp bold) and icons need 3:1. Material 3 color pairs like <code>onSurface</code> on <code>surface</code> are built to pass.</p>`,
        code: `Text(
    text = article.title,
    fontSize = 22.sp,              // follows the user's font size
    lineHeight = 28.sp,
)

Row(
    Modifier
        .fillMaxWidth()
        .heightIn(min = 56.dp)     // a minimum, so the row can grow
        .padding(horizontal = 16.dp),
    verticalAlignment = Alignment.CenterVertically,
) {
    Icon(Icons.Default.Bookmark, contentDescription = null, Modifier.size(24.dp))
    Text(label, Modifier.padding(start = 16.dp), style = MaterialTheme.typography.bodyLarge)
}

@PreviewFontScale                  // one preview per font scale, 85% to 200%
@Composable
fun SavedRowPreview() {
    AppTheme { SavedRow(label = "Read later") }
}

val fontScale = LocalDensity.current.fontScale   // 1.0f is the default`,
        remember: 'Text in sp, everything else in dp. Give text minimum heights, never fixed ones. Body text needs 4.5:1 contrast.',
        terms: [
          { term: 'sp', def: 'Scale-independent pixels: a dp multiplied by the user’s font scale, used for text sizes.' },
          { term: 'Nonlinear font scaling', def: 'Android 14 behavior where small text grows by the full font scale and large text grows less, up to 200%.' },
          { term: 'Contrast ratio', def: 'The WCAG measure of luminance difference between two colors, from 1:1 to 21:1; body text needs at least 4.5:1.' },
          { term: '@PreviewFontScale', def: 'A Compose multipreview annotation that renders a composable at several font scales from 85% to 200%.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Size the text so it follows the font setting, and let the row grow with it.', code: 'Row(Modifier.[[heightIn]](min = 48.dp)) {\n    Text("Downloads", fontSize = 16.[[sp]])\n}', why: '<code>sp</code> follows the font scale. <code>heightIn(min = ...)</code> keeps the row at least 48 dp but lets it grow.' },
          { type: 'bug', prompt: 'At 200% font size the summary line is cut off. Tap the line that causes it.', code: '@Composable\nfun SettingRow(title: String, summary: String) {\n    Column(\n        Modifier\n            .fillMaxWidth()\n            .height(56.dp)\n            .padding(horizontal = 16.dp, vertical = 8.dp)\n    ) {\n        Text(title, style = MaterialTheme.typography.bodyLarge)\n        Text(summary, style = MaterialTheme.typography.bodyMedium)\n    }\n}', bug: 5, fix: '            .heightIn(min = 56.dp)', why: 'A fixed dp height does not grow when sp text grows, so the second line is clipped. A minimum height keeps the look at 100% and grows when needed.' },
        ],
        quiz: [
          { q: 'At 200% font scale, which grows more relative to its size?', options: ['14sp body text', '30sp headline', 'Both double'], a: 0, why: 'Android 14 scales nonlinearly. Body text nearly doubles while large headlines grow much less.' },
          { q: 'What contrast ratio does WCAG AA require for normal body text?', options: ['3:1', '4.5:1', '7:1'], a: 1, why: '4.5:1 for body text. 3:1 is the bar for large text and icons, and 7:1 is the stricter AAA level.' },
          { q: 'Which unit should an icon’s size use?', options: ['sp, so it grows with text', 'dp'], a: 1, why: 'Font scale is for text. Icons and spacing use dp so the layout doesn’t blow up.' },
          { q: 'A badge height is computed as <code>(16 * fontScale + 8).dp</code>. At 200% on Android 14 the badge is too tall for its text. Why?', options: ['fontScale is capped at 1.5', 'dp values are scaled by fontScale too', 'Scaling is nonlinear there, so 16sp is drawn at about 28 dp, not 32; use <code>16.sp.toDp()</code>'], a: 2, why: 'Android 14+ uses a lookup curve for sp, so large text grows less than the linear factor. <code>toDp()</code> uses the same converter as the text.' },
          { q: 'An email field shows an error only by turning its border red. Which fix meets the lesson’s rule?', options: ['Use a brighter red with 4.5:1 contrast', 'Add an error icon and a message in words, so color is not the only signal', 'Make the border thicker'], a: 1, why: 'Many users cannot tell the red apart. Every error needs a second cue that does not depend on color, such as text and an icon.' },
        ],
        deeper: [
          {
            title: 'Reflow instead of truncating',
            body: `<p>Rows built for 100% often hold a label and a value side by side. At 200% they no longer fit. With <code>maxLines = 1</code> and an ellipsis, the words that carry the meaning get cut: “Stora…” and “12 of…”. Truncation hides content from exactly the people who asked for bigger text.</p>
<p>Let the layout reflow instead. A <code>FlowRow</code> moves the value under the label when there is no room beside it. Text can wrap to a second line. Drag the font size to 200% and compare.</p>`,
            code: `FlowRow(
    Modifier.fillMaxWidth().heightIn(min = 56.dp).padding(horizontal = 16.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    itemVerticalAlignment = Alignment.CenterVertically,
) {
    Text("Storage used", style = MaterialTheme.typography.bodyLarge)
    Text("12 of 64 GB", style = MaterialTheme.typography.bodyMedium)
}`,
            visual(el) {
              const FROM = [8, 10, 12, 14, 18, 20, 24, 30, 100];
              const TABLES = { 1.15: [9.2, 11.5, 13.8, 16.4, 19.8, 21.8, 25.2, 30, 100], 1.3: [10.4, 13, 15.6, 18.8, 21.6, 23.6, 26.4, 30, 100], 1.5: [12, 15, 18, 22, 24, 26, 28, 30, 100], 1.8: [14.4, 18, 21.6, 24.4, 27.6, 30.8, 32.8, 34.8, 100], 2: [16, 20, 24, 26, 30, 34, 36, 38, 100] };
              const STEPS = [0.85, 1, 1.15, 1.3, 1.5, 1.8, 2];
              const conv = (sp, s) => { const t = TABLES[s]; if (!t) return sp * s; for (let i = 1; i < FROM.length; i++) if (sp <= FROM[i]) return t[i - 1] + (t[i] - t[i - 1]) * (sp - FROM[i - 1]) / (FROM[i] - FROM[i - 1]); return sp; };
              let flow = false, tick = 0;
              const range = h('input', { type: 'range', id: 'ay-d2-tr-scale', class: 'ay-range', min: '0', max: String(STEPS.length - 1), step: '1', value: '1' });
              const lbl = h('b', {});
              const label = h('span', { class: 'ay-d2-tr-l' }, 'Storage used');
              const value = h('span', { class: 'ay-d2-tr-v' }, '12 of 64 GB');
              const row = h('div', { class: 'ay-d2-tr-row' }, h('span', { class: 'ay-d2-tr-i', 'aria-hidden': 'true' }), h('div', { class: 'ay-d2-tr-txt' }, label, value));
              const card = h('div', { class: 'ay-d2-tr-card' }, row);
              const o = out();
              const modes = [['Row { Text(maxLines = 1, overflow = Ellipsis) }', false], ['FlowRow { Text(...); Text(...) }', true]].map(([src, f]) => cmd(src, () => { flow = f; paint(); }));
              function paint() {
                const s = STEPS[+range.value];
                press(modes, modes[flow ? 1 : 0]);
                lbl.textContent = `${Math.round(s * 100)}%`;
                label.style.fontSize = conv(16, s).toFixed(1) + 'px';
                value.style.fontSize = conv(14, s).toFixed(1) + 'px';
                row.classList.toggle('ay-d2-tr-flow', flow);
                const me = ++tick;
                setTimeout(() => {
                  if (me !== tick || !row.isConnected) return;
                  const cut = [label, value].filter(x => x.scrollWidth > x.clientWidth + 1).length;
                  [label, value].forEach(x => x.classList.toggle('ay-d2-tr-cut', x.scrollWidth > x.clientWidth + 1));
                  const wrapped = flow && value.offsetTop > label.offsetTop + 2;
                  say(o, cut
                    ? `<span class="bad">truncated:</span> ${cut === 2 ? 'both texts are' : 'a text is'} cut at ${Math.round(s * 100)}%. The meaning is gone.`
                    : wrapped
                      ? `<span class="good">reflowed:</span> the value moved under the label. Nothing is lost.`
                      : `<span class="muted">// fits at ${Math.round(s * 100)}%</span>`);
                }, 280);
              }
              range.addEventListener('input', paint);
              paint();
              el.append(
                h('div', { class: 'stage' }, card),
                h('label', { class: 'ay-label', for: 'ay-d2-tr-scale' }, 'Font size ', lbl), range,
                h('div', { class: 'controls ay-d2-col-btns' }, modes),
                o);
            },
          },
          {
            title: 'Don’t say it with color alone',
            body: `<p>Contrast is not only about text. Icons, field borders and other parts the user needs to see need 3:1 against what is next to them. And color can never be the only signal. About one in twelve men has some form of color vision deficiency, and a red border in a gray UI may not stand out at all.</p>
<p>Give every error a second cue: an icon and a message in words. Turn on the grayscale view below to see what the color-only version leaves.</p>`,
            code: `OutlinedTextField(
    value = email,
    onValueChange = onEmail,
    label = { Text("Email") },
    isError = emailError != null,
    supportingText = { emailError?.let { Text(it) } },
    trailingIcon = {
        if (emailError != null) Icon(Icons.Filled.Error, contentDescription = null)
    },
)`,
            visual(el) {
              let words = false;
              const field = h('div', { class: 'ay-d2-tc-field ay-d2-tc-err' },
                h('span', { class: 'ay-d2-tc-lab' }, 'Email'),
                h('span', { class: 'ay-d2-tc-val' }, 'ana@mail'),
                h('span', { class: 'ay-d2-tc-ico', 'aria-hidden': 'true' }, '!'));
              const msg = h('p', { class: 'ay-d2-tc-msg' }, 'Enter a full email address, like ana@mail.com');
              const ok = h('div', { class: 'ay-d2-tc-field' }, h('span', { class: 'ay-d2-tc-lab' }, 'Name'), h('span', { class: 'ay-d2-tc-val' }, 'Ana'));
              const form = h('div', { class: 'ay-d2-tc' }, ok, field, msg);
              const gray = sw('ay-d2-tc-gray', 'View in grayscale');
              const o = out();
              const modes = [['isError = true', false], ['isError + supportingText + trailingIcon', true]].map(([src, w]) => cmd(src, () => { words = w; paint(true); }));
              function paint(anim) {
                press(modes, modes[words ? 1 : 0]);
                form.classList.toggle('ay-d2-tc-words', words);
                form.classList.toggle('ay-d2-tc-gray', gray.input.checked);
                if (anim) replay(field, 'pop-soft');
                const g = gray.input.checked;
                say(o, words
                  ? `<span class="good">ok:</span> the icon and the message say it${g ? ', with or without color' : ''}`
                  : g ? '<span class="bad">lost:</span> in grayscale the error border looks like any other field' : '<span class="muted">// only the red color marks the error</span>');
              }
              gray.input.addEventListener('change', () => paint(true));
              paint(false);
              el.append(h('div', { class: 'stage' }, form), h('div', { class: 'controls ay-d2-col-btns' }, modes), h('div', { class: 'controls' }, gray.el), o);
            },
          },
          {
            title: 'Respect the contrast setting',
            body: `<p>Newer Android versions let users ask for higher color contrast in Settings. From API 34, <code>UiModeManager.getContrast()</code> returns that preference as a float, with 0 as the standard level and higher values for more contrast. Material Theme Builder can export medium and high contrast color schemes next to the standard ones, so you can switch schemes in your theme.</p>`,
            code: `@Composable
fun AppTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val contrast = if (Build.VERSION.SDK_INT >= 34) {
        context.getSystemService(UiModeManager::class.java).contrast
    } else 0f
    val scheme = when {
        contrast >= 0.66f -> highContrastLightColorScheme
        contrast >= 0.33f -> mediumContrastLightColorScheme
        else -> lightScheme
    }
    MaterialTheme(colorScheme = scheme, content = content)
}`,
          },
        ],
        underHood: {
          body: `<p>Compose turns <code>sp</code> into pixels through <code>Density</code>. On Android 14 and later, the <code>Density</code> Compose creates from your context carries a font scale converter. For each font scale step, the converter has a lookup table from sp to dp and interpolates between its entries, which is where the nonlinear curve comes from. Older versions multiply by <code>fontScale</code>.</p>
<p>So <code>with(LocalDensity.current) { 14.sp.toDp() }</code> gives the size the text will really have. Multiplying by <code>fontScale</code> yourself gives the old linear answer, which is too big for large text.</p>`,
          code: `val density = LocalDensity.current
val real = with(density) { 30.sp.toDp() }        // 38.dp at 200% on Android 14+
val naive = (30 * density.fontScale).dp           // 60.dp: wrong`,
        },
        mistakes: [
          {
            title: 'Cancelling the user’s font scale',
            bad: `val fontScale = LocalDensity.current.fontScale
Text("Total", fontSize = (16 / fontScale).sp)   // stays 16 at any setting`,
            good: `Text("Total", style = MaterialTheme.typography.bodyLarge)
// and make the layout around it able to grow`,
            why: 'Users picked a bigger font because they need it. Undoing the scale makes the text unreadable for them. Fix the layout that breaks, not the text size.',
          },
          {
            title: 'Computing scaled sizes by hand',
            bad: `val badgeHeight = (16 * LocalDensity.current.fontScale + 8).dp`,
            good: `val badgeHeight = with(LocalDensity.current) { 16.sp.toDp() } + 8.dp`,
            why: 'On Android 14 and later scaling is nonlinear, so <code>sp × fontScale</code> overshoots for text above about 12sp: 16sp at 200% is drawn at 28 dp, not 32. <code>toDp()</code> uses the same converter as the text itself.',
          },
        ],
        visual(el) {
          // Android 14 FontScaleConverterFactory tables (fromSp -> toSp) per font scale step.
          const FROM = [8, 10, 12, 14, 18, 20, 24, 30, 100];
          const TABLES = {
            1.15: [9.2, 11.5, 13.8, 16.4, 19.8, 21.8, 25.2, 30, 100],
            1.3: [10.4, 13, 15.6, 18.8, 21.6, 23.6, 26.4, 30, 100],
            1.5: [12, 15, 18, 22, 24, 26, 28, 30, 100],
            1.8: [14.4, 18, 21.6, 24.4, 27.6, 30.8, 32.8, 34.8, 100],
            2: [16, 20, 24, 26, 30, 34, 36, 38, 100],
          };
          const STEPS = [0.85, 1, 1.15, 1.3, 1.5, 1.8, 2];
          const conv = (sp, s) => {
            const t = TABLES[s];
            if (!t) return sp * s;
            for (let i = 1; i < FROM.length; i++) if (sp <= FROM[i]) return t[i - 1] + (t[i] - t[i - 1]) * (sp - FROM[i - 1]) / (FROM[i] - FROM[i - 1]);
            return sp;
          };
          const range = h('input', { type: 'range', id: 'ay-ts-scale', class: 'ay-range', min: '0', max: String(STEPS.length - 1), step: '1', value: '1' });
          const fixed = sw('ay-ts-fixed', 'Button uses .height(40.dp)');
          const scaleLabel = h('b', {});
          const hEl = h('p', { class: 'ay-h' }, 'Trail report');
          const bEl = h('p', {}, 'Mud on the north loop. The ridge path is dry and clear today.');
          const cEl = h('p', {}, 'Updated 2 hours ago');
          const btn = h('div', { class: 'ay-btnbox' }, 'Save this trail for later');
          const card = h('div', { class: 'ay-ts' }, hEl, bEl, cEl, btn);
          const table = h('div', { class: 'ay-scale-t' });
          const o = out();
          let tick = 0;
          const ROWS = [['Headline', 28, hEl], ['Body', 14, bEl], ['Caption', 12, cEl], ['Button', 14, btn]];
          function paintScale() {
            const s = STEPS[+range.value];
            scaleLabel.textContent = `${Math.round(s * 100)}%`;
            ROWS.forEach(([, sp, node]) => { node.style.fontSize = conv(sp, s).toFixed(1) + 'px'; });
            btn.style.height = fixed.input.checked ? '40px' : 'auto';
            btn.style.minHeight = fixed.input.checked ? '0' : '40px';
            const me = ++tick;
            table.replaceChildren(h('span', {}, 'style'), h('span', {}, 'linear'), h('span', {}, 'Android 14+'),
              ...ROWS.slice(0, 3).flatMap(([n, sp]) => [h('span', {}, `${n} ${sp}sp`), h('span', {}, `${+(sp * s).toFixed(1)}`), h('b', {}, `${+conv(sp, s).toFixed(1)}`)]));
            setTimeout(() => {
              if (me !== tick || !btn.isConnected) return;
              const clip = btn.scrollHeight > btn.clientHeight + 1;
              btn.classList.toggle('ay-clip', clip);
              say(o, clip ? '<span class="bad">clipped:</span> the label wrapped, and the 40.dp button can’t grow to fit it' : s > 1.13 ? `<span class="good">ok:</span> big text grows less than small text at ${Math.round(s * 100)}%` : `Font scale ${s}: every sp is multiplied by ${s}`);
            }, 300);
          }
          range.addEventListener('input', paintScale);
          fixed.input.addEventListener('change', paintScale);

          // contrast checker
          const fg = h('input', { type: 'color', id: 'ay-ts-fg', value: '#9e9e9e' });
          const bg = h('input', { type: 'color', id: 'ay-ts-bg', value: '#ffffff' });
          const ratioEl = h('span', { class: 'ay-ratio' });
          const badges = h('div', { class: 'ay-badges' });
          const lum = hex => {
            const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
            return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
          };
          function paintContrast(anim) {
            const a = lum(fg.value), b = lum(bg.value);
            const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            card.style.color = fg.value; card.style.backgroundColor = bg.value;
            ratioEl.textContent = `${r.toFixed(2)}:1`;
            badges.replaceChildren(...[['Body text AA', 4.5], ['Large text and icons', 3], ['AAA', 7]].map(([n, min]) => h('span', { class: `ay-badge ${r >= min ? 'pass' : 'fail'}` }, `${n} ${min}:1 ${r >= min ? 'pass' : 'fail'}`)));
            if (anim) replay(ratioEl, 'pop');
          }
          fg.addEventListener('input', () => paintContrast(false));
          bg.addEventListener('input', () => paintContrast(false));
          const PRESETS = [['Light gray on white', '#9e9e9e', '#ffffff'], ['Dark gray on white', '#5f6368', '#ffffff'], ['White on bright green', '#ffffff', '#3ddc84'], ['Dark on bright green', '#052012', '#3ddc84']];
          const presetBtns = PRESETS.map(([n, f, b]) => act(n, function () { fg.value = f; bg.value = b; press(presetBtns, this); paintContrast(true); }));
          press(presetBtns, presetBtns[0]);
          paintScale(); paintContrast(false);
          el.append(
            h('div', { class: 'ay-split' }, card,
              h('div', { class: 'ay-col' },
                h('label', { class: 'ay-label', for: 'ay-ts-scale' }, 'Font size ', scaleLabel), range, fixed.el, table)),
            o,
            h('span', { class: 'ay-label' }, 'Contrast'),
            h('div', { class: 'ay-colors' }, h('label', { for: 'ay-ts-fg' }, 'text', fg), h('label', { for: 'ay-ts-bg' }, 'background', bg), ratioEl),
            badges,
            h('div', { class: 'controls' }, presetBtns));
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'window-size',
        title: 'Window size classes and adaptive layouts',
        tagline: 'Pick a layout from the window’s width, and let list-detail do the rest.',
        level: 'advanced',
        body: `
<p>Phones, foldables, tablets, Chromebooks and desktop windows run the same APK. Design for the window you get. A tablet in split screen can hand you a phone-sized window. Window size classes put the width into buckets: Compact under 600dp (most phones in portrait), Medium from 600 to 839dp (unfolded foldables, small tablets in portrait) and Expanded from 840dp (tablets in landscape). Newer versions split off Large at 1200dp and Extra-large at 1600dp for big tablets and desktop windows. To get those two, pass <code>supportLargeAndXLargeWidth = true</code> to <code>currentWindowAdaptiveInfo()</code>.</p>
<p>Call <code>currentWindowAdaptiveInfo()</code> and read its <code>windowSizeClass</code>, then branch with <code>isWidthAtLeastBreakpoint(...)</code>. The value updates when the window resizes, and your layout follows.</p>
<p>For the common list and detail screen, <code>NavigableListDetailPaneScaffold</code> does the work. It shows both panes when there is room, and one pane with back navigation when there isn’t. <code>NavigationSuiteScaffold</code> does the same for navigation: a bottom bar on Compact, a rail on wider windows.</p>`,
        code: `@Composable
fun MailApp(mails: List<Mail>) {
    val navigator = rememberListDetailPaneScaffoldNavigator<Long>()
    val scope = rememberCoroutineScope()

    NavigableListDetailPaneScaffold(
        navigator = navigator,
        listPane = {
            AnimatedPane {
                MailList(mails, onOpen = { id ->
                    scope.launch { navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, id) }
                })
            }
        },
        detailPane = {
            AnimatedPane {
                val id = navigator.currentDestination?.contentKey
                if (id != null) MailDetail(id) else Text("Pick a message")
            }
        },
    )
}

// Branch on the window, never on "is this a tablet"
val sizeClass = currentWindowAdaptiveInfo().windowSizeClass
val wide = sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)`,
        remember: 'Compact under 600dp, Medium to 840dp, Expanded beyond. Size classes describe the window, not the device.',
        terms: [
          { term: 'Window size class', def: 'A bucket for the app window’s width or height (Compact, Medium, Expanded and larger) used to choose a layout.' },
          { term: 'currentWindowAdaptiveInfo', def: 'A Compose function that returns the current window size class and posture, and updates when either changes.' },
          { term: 'List-detail pane scaffold', def: 'NavigableListDetailPaneScaffold, a Material 3 adaptive layout that shows a list and its detail side by side or one at a time.' },
          { term: 'NavigationSuiteScaffold', def: 'A Material 3 adaptive scaffold that shows a navigation bar, rail or drawer depending on the window.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the size class and check for an expanded window.', code: 'val sizeClass = [[currentWindowAdaptiveInfo]]().windowSizeClass\nval twoPane = sizeClass.isWidthAtLeastBreakpoint(\n    WindowSizeClass.WIDTH_DP_[[EXPANDED]]_LOWER_BOUND\n)', why: '<code>currentWindowAdaptiveInfo()</code> gives the live size class. The expanded breakpoint is 840 dp.' },
          { type: 'bug', prompt: 'In split screen on a tablet, the app still shows two cramped panes. Tap the line that reads the wrong size.', code: '@Composable\nfun HomeScreen() {\n    val windowManager = LocalContext.current.getSystemService(WindowManager::class.java)\n    val widthPx = windowManager.maximumWindowMetrics.bounds.width()\n    val widthDp = widthPx / LocalDensity.current.density\n    if (widthDp >= 840f) TwoPaneHome() else SinglePaneHome()\n}', bug: 3, fix: '    val widthPx = windowManager.currentWindowMetrics.bounds.width()  // or use currentWindowAdaptiveInfo()', why: '<code>maximumWindowMetrics</code> is the largest the window could be, close to the whole display. Layout decisions need the current window.' },
        ],
        quiz: [
          { q: 'A window is 700 dp wide. Which width size class is it?', options: ['Compact', 'Medium', 'Expanded'], a: 1, why: 'Medium covers 600 to 839 dp.' },
          { q: 'A tablet runs your app in split screen at 400 dp wide. What should you show?', options: ['The tablet layout, since it is a tablet', 'The Compact layout'], a: 1, why: 'Size classes describe the window. A 400 dp window is Compact on any device.' },
          { q: 'On a Compact window, what does <code>NavigableListDetailPaneScaffold</code> do when the user opens an item?', options: ['Squeezes both panes in', 'Shows the detail pane alone, and back returns to the list', 'Opens a new Activity'], a: 1, why: 'With room for one pane it navigates between them and handles back for you.' },
          { q: 'A phone in landscape is 780 dp wide and 400 dp tall. Which size classes apply?', options: ['Expanded width, Medium height', 'Medium width, Compact height', 'Compact width, Compact height'], a: 1, why: '600–839 dp is Medium width, and under 480 dp is Compact height. On such a short window, move navigation to a rail and collapse the top bar.' },
          { q: 'A product card picks its wide layout when the window is Expanded. Inside a two-pane list-detail, it looks squeezed. What fixes it?', options: ['Decide inside the card from the space it gets, for example with <code>BoxWithConstraints</code>', 'Use Medium instead of Expanded as the breakpoint', 'Hide the list pane on Expanded windows'], a: 0, why: 'Size classes describe the whole window and fit top-level structure. A component should measure its own space, because a pane is narrower than the window.' },
        ],
        deeper: [
          {
            title: 'Height has size classes too',
            body: `<p>Width decides most layouts, since content scrolls vertically. Height matters when it is short. A phone in landscape is often Medium wide but Compact tall: under 480dp. A tall top app bar and a bottom bar then leave a thin strip for content. Height classes are Compact under 480dp, Medium from 480 to 899dp and Expanded from 900dp.</p>
<p>Check height with <code>isHeightAtLeastBreakpoint</code>. On a short window, hide or collapse the top app bar and move navigation to a rail at the side.</p>`,
            code: `val sizeClass = currentWindowAdaptiveInfo().windowSizeClass
val roomForTopBar = sizeClass.isHeightAtLeastBreakpoint(WindowSizeClass.HEIGHT_DP_MEDIUM_LOWER_BOUND)
val useRail = sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND) || !roomForTopBar`,
            visual(el) {
              const PRE = [['Phone portrait', 411, 891], ['Phone landscape', 800, 360], ['Foldable open', 673, 841], ['Tablet landscape', 1280, 800], ['Tablet portrait', 800, 1280]];
              let cur = 0;
              const S = 0.2;
              const winEl = h('div', { class: 'ay-d2-wh-win' });
              const chips = h('div', { class: 'ay-d2-wh-chips' });
              const o = out();
              const wc = w => (w < 600 ? 'Compact' : w < 840 ? 'Medium' : w < 1200 ? 'Expanded' : 'Large');
              const hc = v => (v < 480 ? 'Compact' : v < 900 ? 'Medium' : 'Expanded');
              const btns = PRE.map(([n, w, v], i) => act(`${n} ${w}×${v}`, () => { cur = i; paint(true); }));
              function paint(anim) {
                const [n, w, v] = PRE[cur];
                press(btns, btns[cur]);
                const topBar = v >= 480, rail = w >= 600 || !topBar, two = w >= 840;
                winEl.style.width = Math.round(w * S) + 'px'; winEl.style.height = Math.round(v * S) + 'px';
                const nav = h('div', { class: 'ay-nav' + (rail ? ' ay-rail' : '') }, h('i', { class: 'on' }), h('i'), h('i'));
                const content = h('div', { class: 'ay-panes' }, h('div', { class: 'ay-pane' }, h('div', { class: 'ay-lines' }, h('i', { style: 'width:80%' }), h('i', { style: 'width:60%' }), h('i', { style: 'width:70%' }))),
                  two ? h('div', { class: 'ay-pane' }, h('div', { class: 'ay-lines' }, h('i', { style: 'width:90%' }), h('i', { style: 'width:50%' }))) : null);
                const body = h('div', { class: 'ay-app' + (rail ? '' : ' ay-compact') }, nav, content);
                winEl.replaceChildren(topBar ? h('div', { class: 'ay-d2-wh-top' }, 'Inbox') : null, body);
                chips.replaceChildren(
                  h('span', { class: 'ay-badge pass' }, `width ${w} dp: ${wc(w)}`),
                  h('span', { class: `ay-badge ${v < 480 ? 'fail' : 'pass'}` }, `height ${v} dp: ${hc(v)}`));
                if (anim) replay(winEl, 'pop-soft');
                say(o, `${esc(n)}: top app bar <span class="${topBar ? 'good' : 'bad'}">${topBar ? 'shown' : 'hidden, height is Compact'}</span> · navigation: ${rail ? 'rail' : 'bottom bar'} · panes: ${two ? 2 : 1}`);
              }
              paint(false);
              el.append(h('div', { class: 'stage ay-d2-wh-stage' }, winEl), chips, h('div', { class: 'controls' }, btns), o);
            },
          },
          {
            title: 'Size classes pick the screen layout. Components measure their space',
            body: `<p>Window size classes describe the whole window. Inside a two-pane layout, the detail pane is much narrower than the window. A card that picks its wide layout because the window is Expanded gets squeezed into that pane.</p>
<p>Use size classes for the top-level structure: panes and navigation. Inside a component, decide from the space it actually gets, with <code>BoxWithConstraints</code> or a custom layout.</p>`,
            code: `@Composable
fun ProductCard(product: Product, modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier) {
        if (maxWidth >= 560.dp) WideProductCard(product) else NarrowProductCard(product)
    }
}`,
            visual(el) {
              const PRE = [720, 900, 1400];
              let w = 900, byWindow = true;
              const winEl = h('div', { class: 'ay-win ay-d2-wa-win' });
              const o = out();
              const btns = PRE.map(v => act(`Window ${v} dp`, () => { w = v; paint(true); }));
              const modes = [['if (windowSizeClass is Medium+) WideCard()', true], ['BoxWithConstraints { if (maxWidth >= 560.dp) ... }', false]].map(([src, b]) => cmd(src, () => { byWindow = b; paint(true); }));
              function paint(anim) {
                press(btns, btns[PRE.indexOf(w)]); press(modes, modes[byWindow ? 0 : 1]);
                const two = w >= 840, detail = w - 80 - (two ? 360 : 0) - 24;
                const wide = byWindow ? w >= 600 : detail >= 560;
                const scale = 100 / w;
                const card = h('div', { class: 'ay-d2-wa-card' + (wide ? ' ay-d2-wa-wide' : ''), style: `width:${((wide ? 560 : Math.min(detail, 360)) * scale).toFixed(2)}%` },
                  h('span', { class: 'ay-d2-wa-img' }), h('span', { class: 'ay-d2-wa-specs' }, h('i'), h('i'), wide ? h('i') : null));
                const over = wide && detail < 560;
                card.classList.toggle('ay-d2-wa-over', over);
                const detailPane = h('div', { class: 'ay-d2-wa-pane', style: `width:${((detail + 24) * scale).toFixed(2)}%` }, card);
                winEl.replaceChildren(h('div', { class: 'ay-win-top' }, h('i'), h('i'), h('i'), h('span', {}, `${w} dp`)),
                  h('div', { class: 'ay-d2-wa-app' },
                    h('div', { class: 'ay-nav ay-rail', style: `width:${(80 * scale).toFixed(2)}%` }, h('i', { class: 'on' }), h('i')),
                    two ? h('div', { class: 'ay-d2-wa-pane ay-d2-wa-list', style: `width:${(360 * scale).toFixed(2)}%` }, h('div', { class: 'ay-lines' }, h('i', { style: 'width:80%' }), h('i', { style: 'width:60%' }), h('i', { style: 'width:75%' }))) : null,
                    detailPane));
                if (anim) replay(card, 'pop-soft');
                say(o, `detail pane gets <b>${detail} dp</b> · card: ${wide ? 'WideCard (needs 560 dp)' : 'NarrowCard'} ${over ? '<span class="bad">// squeezed: the window is wide, the pane is not</span>' : '<span class="good">// fits</span>'}`);
              }
              paint(false);
              el.append(h('div', { class: 'stage' }, winEl), h('div', { class: 'controls' }, btns), h('div', { class: 'controls ay-d2-col-btns' }, modes), o);
            },
          },
          {
            title: 'Test every size without every device',
            body: `<p><code>@PreviewScreenSizes</code> renders a composable at phone, foldable, tablet and desktop sizes in one go. The resizable emulator switches between those sizes while the app runs. On a real tablet, drag the split-screen divider slowly and watch every size class transition. On tablets with desktop windowing, resize a free-form window too.</p>`,
            code: `@PreviewScreenSizes
@Composable
fun MailAppPreview() {
    AppTheme { MailApp(sampleMails) }
}`,
          },
        ],
        underHood: {
          body: `<p><code>currentWindowAdaptiveInfo()</code> reads the size of the current window from Compose, converts it to dp with the current density, and buckets the width and height against the breakpoint list. The result is a plain value. <code>isWidthAtLeastBreakpoint</code> just compares the window’s minimum width for its bucket with the breakpoint you pass. Because the size is read during composition, readers recompose when the window changes size.</p>
<p>The posture half comes from Jetpack WindowManager. It collects the window’s fold information as State, which the next lesson uses.</p>`,
        },
        mistakes: [
          {
            title: 'Branching on orientation',
            bad: `val landscape = LocalConfiguration.current.orientation ==
    Configuration.ORIENTATION_LANDSCAPE
if (landscape) TwoPane() else OnePane()`,
            good: `val sizeClass = currentWindowAdaptiveInfo().windowSizeClass
if (sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)) TwoPane()
else OnePane()`,
            why: 'A phone in landscape has no room for two panes, and a tablet in portrait has plenty. Orientation says nothing about size. Branch on the window width.',
          },
          {
            title: 'State that lives inside a layout branch',
            bad: `if (wide) {
    var selected by rememberSaveable { mutableStateOf<Long?>(null) }
    TwoPane(selected, onSelect = { selected = it })
} else {
    var selected by rememberSaveable { mutableStateOf<Long?>(null) }
    OnePane(selected, onSelect = { selected = it })
}`,
            good: `var selected by rememberSaveable { mutableStateOf<Long?>(null) }
if (wide) TwoPane(selected, onSelect = { selected = it })
else OnePane(selected, onSelect = { selected = it })`,
            why: 'Each branch has its own place in the composition. Crossing the breakpoint leaves one branch and enters the other, so the selection starts over. Hoist state above the branch.',
          },
        ],
        visual(el) {
          const MAILS = [
            { id: 1, from: 'Ada', subj: 'Standup notes', body: 3 },
            { id: 2, from: 'Grace', subj: 'Release 4.2 is out', body: 4 },
            { id: 3, from: 'Linus', subj: 'Lunch on Friday?', body: 2 },
          ];
          let w = 411, sel = null;
          const range = h('input', { type: 'range', id: 'ay-ws-w', class: 'ay-range', min: '320', max: '1400', step: '10', value: '411', 'aria-label': 'Window width in dp' });
          const winTitle = h('span', {});
          const app = h('div', { class: 'ay-app' });
          const win = h('div', { class: 'ay-win' }, h('div', { class: 'ay-win-top' }, h('i'), h('i'), h('i'), winTitle), app);
          const SEG = [['Compact', 320, 600], ['Medium', 600, 840], ['Expanded', 840, 1200], ['Large', 1200, 1400]];
          const segs = SEG.map(([n, a, b]) => h('span', { style: `flex:${b - a} 1 0` }, n));
          const mark = h('span', { class: 'ay-mark' });
          const ruler = h('div', { class: 'ay-ruler', 'aria-hidden': 'true' }, segs, mark);
          const o = out();
          const cls = () => (w < 600 ? 'Compact' : w < 840 ? 'Medium' : w < 1200 ? 'Expanded' : 'Large');
          function detail(m, withBack) {
            if (!m) return h('div', { class: 'ay-pane' }, h('p', { class: 'ay-empty' }, 'Pick a message'));
            return h('div', { class: 'ay-pane drop-in' },
              h('div', { class: 'ay-detail-h' }, withBack ? h('button', { class: 'ay-backbtn', 'aria-label': 'Back to list', html: ICON.back, onclick() { sel = null; paint(); say(o, 'Back: the scaffold returns to the list pane.'); } }) : null, m.subj),
              h('div', { class: 'ay-lines' }, Array.from({ length: m.body }, (_, i) => h('i', { style: `width:${90 - i * 15}%` }))));
          }
          function list() {
            return h('div', { class: 'ay-pane' }, MAILS.map(m => h('button', { class: 'ay-mail' + (m.id === sel ? ' on' : ''), onclick() {
              sel = m.id; paint();
              say(o, w >= 840 ? `navigateTo(Detail, ${m.id}): shown in the right pane` : `navigateTo(Detail, ${m.id}): the detail pane replaces the list`);
            } }, h('b', {}, m.from), h('small', {}, m.subj))));
          }
          function paint() {
            const two = w >= 840, compact = w < 600, m = MAILS.find(x => x.id === sel);
            win.style.width = `${40 + ((w - 320) / 1080) * 60}%`;
            winTitle.textContent = `${w} dp · ${cls()}`;
            app.className = 'ay-app' + (compact ? ' ay-compact' : '');
            const nav = h('div', { class: 'ay-nav' + (compact ? '' : ' ay-rail') }, h('i', { class: 'on' }), h('i'), h('i'));
            const panes = h('div', { class: 'ay-panes' }, two ? [list(), detail(m, false)] : m ? detail(m, true) : list());
            app.replaceChildren(nav, panes);
            segs.forEach((s, i) => s.classList.toggle('on', SEG[i][0] === cls()));
            mark.style.left = `${((w - 320) / 1080) * 100}%`;
            range.value = String(w);
          }
          const report = () => say(o, `windowSizeClass: <span class="good">${cls()}</span> · panes: ${w >= 840 ? 2 : 1} · navigation: ${w < 600 ? 'bottom bar' : 'rail'}${sel ? ' · selection kept' : ''}`);
          range.addEventListener('input', () => { w = +range.value; paint(); report(); press(presets, null); });
          const PRE = [['Phone', 411], ['Foldable open', 673], ['Tablet landscape', 1280]];
          const presets = PRE.map(([n, v]) => act(`${n} ${v} dp`, function () { w = v; press(presets, this); paint(); replay(win, 'pop-soft'); report(); }));
          press(presets, presets[0]);
          paint(); say(o, 'Open a message, then widen the window. The selection survives the resize.');
          el.append(
            h('div', { class: 'stage' }, win),
            ruler,
            h('label', { class: 'ay-label', for: 'ay-ws-w' }, 'Window width (not to scale)'), range,
            h('div', { class: 'controls' }, presets),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'foldables',
        title: 'Foldables and large screens',
        tagline: 'Postures, hinges and windows that change size while the app runs.',
        level: 'advanced',
        body: `
<p>A foldable has a hinge and a posture. Fully open, it is flat. Half open with the hinge horizontal is tabletop, like a small laptop. Half open with the hinge vertical is book posture. The <code>windowPosture</code> from <code>currentWindowAdaptiveInfo()</code> tells you <code>isTabletop</code> and where each hinge is, so a video player can put the picture above the fold and the controls below it. In Views, <code>WindowInfoTracker</code> reports the same thing as a <code>FoldingFeature</code>.</p>
<p>Folding, unfolding, rotating and resizing a multi-window split are all configuration changes. By default the Activity is recreated, so state that matters belongs in a ViewModel or <code>rememberSaveable</code>. Test each one: fold and unfold the emulator, and drag the split-screen divider.</p>
<p>Don’t lock orientation or mark activities non-resizable. On large screens a locked app gets letterboxed: a phone-shaped window with bars around it. From Android 16, for apps that target API 36, the system ignores <code>screenOrientation</code>, <code>resizeableActivity</code> and aspect ratio limits on displays with a smallest width of at least 600dp. Games are exempt. A temporary manifest opt-out exists, but it stops working once you target API 37. The next lesson covers that change.</p>`,
        code: `@Composable
fun PlayerScreen(player: Player) {
    val posture = currentWindowAdaptiveInfo().windowPosture

    if (posture.isTabletop) {
        // Hinge across the middle: picture on top, controls on the table
        Column(Modifier.fillMaxSize()) {
            VideoSurface(player, Modifier.weight(1f))
            PlayerControls(player, Modifier.weight(1f))
        }
    } else {
        Box(Modifier.fillMaxSize()) {
            VideoSurface(player, Modifier.fillMaxSize())
            PlayerControls(player, Modifier.align(Alignment.BottomCenter))
        }
    }
}

// The exact hinge position, in window coordinates
val hinges = currentWindowAdaptiveInfo().windowPosture.hingeList
val separating = hinges.firstOrNull { it.isSeparating }?.bounds

// Manifest: no android:screenOrientation lock, no resizeableActivity="false"`,
        remember: 'Read the posture, keep state through every fold, and never lock orientation.',
        terms: [
          { term: 'Tabletop posture', def: 'A foldable half open with a horizontal hinge, so the bottom half rests flat and the top half stands up.' },
          { term: 'FoldingFeature', def: 'A Jetpack WindowManager object that describes a fold or hinge: its bounds, orientation, state and whether it separates the screen.' },
          { term: 'Multi-window mode', def: 'Running two or more apps on screen at once, so your window can be resized while the app runs.' },
          { term: 'Letterboxing', def: 'What the system does to an app that locks orientation or aspect ratio on a large screen: it shows it in a smaller box with bars around it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the posture and switch to the tabletop layout.', code: 'val posture = currentWindowAdaptiveInfo().[[windowPosture]]\nif (posture.[[isTabletop]]) TabletopPlayer() else FullPlayer()', why: '<code>windowPosture</code> carries the fold state. <code>isTabletop</code> is true when the device is half open with a horizontal hinge.' },
          { type: 'bug', prompt: 'Unfolding the phone wipes the comment the user was typing. Tap the line that loses it.', code: '@Composable\nfun CommentBox(onPost: (String) -> Unit) {\n    var draft by remember { mutableStateOf("") }\n    Column {\n        TextField(value = draft, onValueChange = { draft = it })\n        Button(onClick = { onPost(draft) }) { Text("Post") }\n    }\n}', bug: 2, fix: '    var draft by rememberSaveable { mutableStateOf("") }', why: 'Unfolding is a configuration change that recreates the Activity. <code>remember</code> starts over. <code>rememberSaveable</code> restores the value.' },
        ],
        quiz: [
          { q: 'A foldable is half open with the hinge running left to right, bottom half on the table. What posture is that?', options: ['Book', 'Tabletop', 'Flat'], a: 1, why: 'A horizontal hinge with the device half open is tabletop.' },
          { q: 'Your app targets API 36 and sets <code>screenOrientation="portrait"</code>. What happens on a tablet with Android 16?', options: ['It stays portrait with bars around it', 'The lock is ignored and the app fills the screen', 'It crashes'], a: 1, why: 'Android 16 ignores orientation and resizability limits on displays with a smallest width of 600 dp or more, for apps targeting API 36. Older targets get letterboxed.' },
          { q: 'What happens to the Activity by default when the user unfolds the phone?', options: ['Nothing', 'It is recreated because of a configuration change', 'It is moved to the background'], a: 1, why: 'The screen size changes, and by default that recreates the Activity. Keep state in a ViewModel or rememberSaveable.' },
          { q: 'A flat, seamless foldable reports a <code>FoldingFeature</code> with <code>isSeparating = false</code>. How should a photo viewer lay out?', options: ['Treat it as one continuous screen; content may run across the fold', 'Split the panes at the hinge bounds', 'Fall back to the phone layout'], a: 0, why: 'A non-separating fold does not divide the screen. Split at the hinge only when it separates, like half open or on a dual-screen device.' },
          { q: 'A draft is kept in a ViewModel field. The user unfolds the phone, then leaves the app and the system kills the process. What survives?', options: ['The draft survives both', 'The draft is lost on unfold already', 'The draft survives the unfold, but is lost after process death unless it is in SavedStateHandle'], a: 2, why: 'A ViewModel survives the configuration change but not process death. Only saved state, like SavedStateHandle or rememberSaveable, comes back.' },
        ],
        deeper: [
          {
            title: 'Keep content off the hinge',
            body: `<p>Not every fold splits the screen. A <code>FoldingFeature</code> reports <code>isSeparating</code>. A flat seamless foldable is one continuous screen, so it is not separating, and content may run across the fold. Half open, the fold separates two areas. On a dual-screen device the hinge is a physical gap: <code>occlusionType</code> is <code>FULL</code> and nothing under it can be seen or tapped.</p>
<p>When the fold separates, split your panes at the hinge bounds, so nothing sits in the crease or under the gap.</p>`,
            code: `val hinge = currentWindowAdaptiveInfo().windowPosture.hingeList
    .firstOrNull { it.isSeparating && it.isVertical }

if (hinge != null) {
    // hinge.bounds is in window pixels
    val leftWidth = with(LocalDensity.current) { hinge.bounds.left.toDp() }
    val gap = with(LocalDensity.current) { hinge.bounds.width.toDp() }
    Row {
        PhotoPane(Modifier.width(leftWidth))
        Spacer(Modifier.width(gap))
        DetailsPane(Modifier.weight(1f))
    }
} else {
    SinglePane()
}`,
            visual(el) {
              const DEV = {
                flat: { label: 'Foldable, flat', cls: 'ay-d2-fh-flat', log: 'state = FLAT, isSeparating = false, occlusionType = NONE' },
                book: { label: 'Foldable, half open', cls: 'ay-d2-fh-book', log: 'state = HALF_OPENED, isSeparating = true, occlusionType = NONE' },
                dual: { label: 'Dual screen', cls: 'ay-d2-fh-dual', log: 'physical hinge: isSeparating = true, occlusionType = FULL' },
              };
              let dev = 'dual';
              const split = sw('ay-d2-fh-split', 'Split panes at hinge.bounds');
              const scr = h('div', { class: 'ay-d2-fh' });
              const o = out();
              const btns = Object.entries(DEV).map(([k, d]) => act(d.label, () => { dev = k; paint(true); }));
              function paint(anim) {
                const d = DEV[dev], sp = split.input.checked;
                press(btns, btns[Object.keys(DEV).indexOf(dev)]);
                scr.className = `ay-d2-fh ${d.cls}${sp ? ' ay-d2-fh-split' : ''}`;
                const photo = h('div', { class: 'ay-d2-fh-photo' });
                const info = h('div', { class: 'ay-d2-fh-info' }, h('b', {}, 'Ridge trail'), h('div', { class: 'ay-lines' }, h('i', { style: 'width:90%' }), h('i', { style: 'width:70%' })));
                const buy = h('span', { class: 'ay-pill ay-d2-fh-buy' }, 'Book');
                scr.replaceChildren(
                  h('div', { class: 'ay-d2-fh-content' }, sp ? [h('div', { class: 'ay-d2-fh-pane' }, photo), h('div', { class: 'ay-d2-fh-pane' }, info, buy)] : [photo, info, buy]),
                  h('span', { class: 'ay-d2-fh-hinge', 'aria-hidden': 'true' }));
                if (anim) replay(scr, 'pop-soft');
                let verdict;
                if (sp) verdict = '<span class="good">ok:</span> each pane sits on its own side of the hinge';
                else if (dev === 'flat') verdict = '<span class="good">ok:</span> a flat seamless fold is one screen, spanning is fine';
                else if (dev === 'book') verdict = '<span class="bad">awkward:</span> the photo bends over the crease and the button sits in it';
                else verdict = '<span class="bad">broken:</span> the hinge hides the middle of the photo and the button under it cannot be tapped';
                say(o, `<span class="muted">FoldingFeature:</span> ${esc(d.log)}<br>${verdict}`);
              }
              split.input.addEventListener('change', () => paint(true));
              paint(false);
              el.append(h('div', { class: 'stage' }, scr), h('div', { class: 'controls' }, btns), h('div', { class: 'controls' }, split.el), o);
            },
          },
          {
            title: 'What survives a fold, and what survives the process',
            body: `<p>Folding recreates the Activity. A plain <code>remember</code> starts over, while <code>rememberSaveable</code> and a ViewModel keep their values. There is a second event to plan for: when your app sits in the background, the system may kill the process to free memory. When the user comes back, the ViewModel is new. Only saved instance state comes back: <code>rememberSaveable</code> and a ViewModel’s <code>SavedStateHandle</code>.</p>
<p>Type a draft, then fold and kill the process.</p>`,
            code: `class DraftViewModel(private val handle: SavedStateHandle) : ViewModel() {
    val draft = handle.getStateFlow("draft", "")
    fun update(text: String) { handle["draft"] = text }
}
// Test process death: background the app, then
// adb shell am kill com.example.app`,
            visual(el) {
              const WORDS = ['Great ', 'trail ', 'today!'];
              const rows = [
                { src: 'remember { mutableStateOf("") }', config: false, death: false },
                { src: 'rememberSaveable { mutableStateOf("") }', config: true, death: true },
                { src: 'ViewModel: MutableStateFlow("")', config: true, death: false },
                { src: 'ViewModel: SavedStateHandle', config: true, death: true },
              ];
              let w = 0, busy = false;
              for (const r of rows) {
                r.val = ''; r.v = h('span', { class: 'ay-d2-fs-val' });
                r.tag = h('span', { class: 'ay-tag' }, '');
                r.el = h('div', { class: 'ay-node' }, h('div', { class: 'ay-node-h' }, h('b', {}, r.src), r.tag), r.v);
              }
              const o = out();
              const paint = () => rows.forEach(r => { r.v.textContent = r.val ? `"${r.val}"` : '""  (empty)'; });
              function type() {
                if (busy) return;
                const word = WORDS[w % WORDS.length]; w++;
                rows.forEach(r => { r.val = (r.val + word).slice(-24); r.el.classList.remove('ay-merged', 'ay-stop'); r.tag.textContent = ''; });
                paint(); rows.forEach(r => replay(r.v, 'pop-soft'));
                say(o, `typed "${esc(word.trim())}" into all four`);
              }
              async function event(kind) {
                if (busy) return; busy = true;
                const keyOf = kind === 'config' ? 'config' : 'death';
                for (const r of rows) {
                  await sleep(260);
                  if (!el.isConnected) return;
                  const kept = r[keyOf];
                  if (!kept) r.val = '';
                  r.el.classList.toggle('ay-merged', !kept); r.el.classList.toggle('ay-stop', kept);
                  r.tag.textContent = kept ? 'kept' : 'lost';
                  paint(); replay(r.el, kept ? 'pop-soft' : 'shake');
                }
                const lost = rows.filter(r => !r[keyOf]).length;
                say(o, kind === 'config'
                  ? `Unfold: configuration change, Activity recreated. <span class="bad">${lost} lost</span>: only plain remember.`
                  : `Process killed in the background, user returns. <span class="bad">${lost} lost</span>: remember and the plain ViewModel field. Saved state came back.`);
                busy = false;
              }
              paint();
              say(o, 'Type a few words, then fold. Type again, then kill the process.');
              el.append(
                h('div', { class: 'ay-tree' }, rows.map(r => r.el)),
                h('div', { class: 'controls' }, act('Type a word', type), act('Unfold the phone', () => event('config')), act('Process death, then return', () => event('death'))),
                o);
            },
          },
          {
            title: 'Keyboard, mouse and stylus',
            body: `<p>Large screens often come with a keyboard, a trackpad or a stylus. Add shortcuts for common actions, show a hand cursor over clickable things, and make sure right-click and hover don’t break your gestures. Text fields get stylus handwriting support from Compose on Android 14 and later.</p>`,
            code: `Box(
    Modifier
        .onPreviewKeyEvent { e ->
            if (e.type == KeyEventType.KeyDown && e.isCtrlPressed && e.key == Key.S) {
                onSave(); true
            } else false
        }
) {
    Button(onClick = onSave, Modifier.pointerHoverIcon(PointerIcon.Hand)) { Text("Save") }
}`,
          },
        ],
        underHood: {
          body: `<p>Fold data comes from Jetpack WindowManager. <code>WindowInfoTracker.windowLayoutInfo(activity)</code> is a Flow of <code>WindowLayoutInfo</code>. Behind it, the device maker ships a WindowManager Extensions library on the device, which knows the hardware. On a device without folds, or without extensions, the list of display features is simply empty.</p>
<p>Each <code>FoldingFeature</code> has bounds in window coordinates, a state (<code>FLAT</code> or <code>HALF_OPENED</code>), an orientation and an occlusion type. Only features that cross your window are reported, so a split-screen app on the other side of the fold sees none. Compose’s <code>currentWindowAdaptiveInfo()</code> collects this flow as State and derives the posture, such as <code>isTabletop</code> for a half-opened horizontal fold.</p>`,
        },
        mistakes: [
          {
            title: 'Detecting foldables by model name',
            bad: `val isFoldable = Build.MODEL in setOf("SM-F956B", "Pixel Fold")
if (isFoldable) BookLayout() else PhoneLayout()`,
            good: `val posture = currentWindowAdaptiveInfo().windowPosture
val hinge = posture.hingeList.firstOrNull { it.isSeparating }
if (hinge != null && hinge.isVertical) BookLayout(hinge) else PhoneLayout()`,
            why: 'New devices ship all the time, and the same foldable can be folded, open or in a split window. Read the posture of the window at runtime.',
          },
          {
            title: 'Saving whole data sets in saved state',
            bad: `// Photo is @Parcelize and holds its thumbnail bytes
var photos by rememberSaveable { mutableStateOf(loadedPhotos) }`,
            good: `var selectedId by rememberSaveable { mutableStateOf<Long?>(null) }
val photos by viewModel.photos.collectAsStateWithLifecycle()`,
            why: 'Saved state travels to the system in a Bundle, which has a small size limit. Too much data crashes with <code>TransactionTooLargeException</code> when the app goes to the background. Save ids and small UI state, and reload the data.',
          },
        ],
        visual(el) {
          const lock = sw('ay-fd-lock', 'screenOrientation="portrait"');
          const t36 = sw('ay-fd-36', 'targetSdk 36 on Android 16');
          const a = h('div', { class: 'ay-half' }), b = h('div', { class: 'ay-half' });
          const over = h('div', { class: 'ay-over' });
          const fold = h('div', { class: 'ay-fold' }, a, b, over);
          const o = out();
          const video = () => h('div', { class: 'ay-video', html: ICON.play });
          const ctrls = () => h('div', { class: 'ay-ctrls' }, h('i'), h('span', {}, h('b'), h('b'), h('b')));
          const comments = n => h('div', { class: 'ay-lines' }, Array.from({ length: n }, (_, i) => h('i', { style: `width:${92 - (i % 3) * 18}%` })));
          const MODES = {
            flat: { label: 'Flat', cls: 'ay-cols', fill: () => [[video(), ctrls()], [comments(7)]], log: 'FoldingFeature: FLAT, VERTICAL · window 840 dp: Expanded, two panes' },
            table: { label: 'Tabletop', cls: 'ay-rows ay-table', fill: () => [[video()], [ctrls()]], log: 'FoldingFeature: HALF_OPENED, HORIZONTAL · isTabletop = true: picture up, controls down' },
            book: { label: 'Book', cls: 'ay-cols ay-book', fill: () => [[video(), ctrls()], [comments(7)]], log: 'FoldingFeature: HALF_OPENED, VERTICAL · use the hinge as the divider' },
            folded: { label: 'Folded (outer screen)', cls: 'ay-narrow', fill: null, log: 'Outer screen · 411 dp wide: Compact · configuration change, Activity recreated' },
            split: { label: 'Split screen', cls: 'ay-cols', fill: () => [[video(), ctrls(), comments(3)], [h('div', { class: 'ay-other' }, 'other app')]], log: 'Multi-window · your window is 420 dp: Compact. The device didn’t change, your window did.' },
          };
          let mode = 'flat', changes = 0;
          function paint(changed) {
            const m = MODES[mode];
            const letter = lock.input.checked && !t36.input.checked && mode !== 'folded' && mode !== 'table';
            fold.className = 'ay-fold ' + m.cls;
            over.className = 'ay-over' + (mode === 'folded' || letter ? ' on' : '') + (letter ? ' ay-letter' : '');
            if (letter) over.replaceChildren(h('div', {}, video(), ctrls(), comments(4)));
            else if (mode === 'folded') over.replaceChildren(h('div', { style: 'display:grid;gap:5px;align-content:start' }, video(), ctrls(), comments(5)));
            else over.replaceChildren();
            if (m.fill) { const [x, y] = m.fill(); a.replaceChildren(...x); b.replaceChildren(...y); }
            if (changed) changes++;
            let note = '';
            if (lock.input.checked && mode !== 'folded' && mode !== 'table') note = t36.input.checked ? '<br><span class="good">// Android 16, API 36: the orientation lock is ignored on this large screen</span>' : '<br><span class="bad">// locked to portrait: letterboxed on the large screen</span>';
            say(o, `${esc(m.log)}${changes ? `<br><span class="muted">// configuration changes so far: ${changes}</span>` : ''}${note}`);
          }
          const btns = Object.entries(MODES).map(([k, m]) => act(m.label, function () { if (mode === k) { replay(fold, 'pop-soft'); return; } mode = k; press(btns, this); paint(true); }));
          lock.input.addEventListener('change', () => paint(false));
          t36.input.addEventListener('change', () => paint(false));
          press(btns, btns[0]);
          paint(false);
          el.append(
            h('div', { class: 'ay-dev' }, fold),
            h('div', { class: 'controls' }, btns),
            h('div', { class: 'controls' }, lock.el, t36.el),
            o);
        },
      },

      // 6b ────────────────────────────────────────────
      {
        id: 'resizability',
        title: 'Android 17: orientation locks are ignored on large screens',
        tagline: 'Target API 37 and your portrait lock no longer holds on tablets and foldables.',
        level: 'advanced',
        body: `
<p>Android 16 started it. For apps that target API 36, on displays whose smallest width is at least 600dp, the system ignores <code>screenOrientation</code>, <code>setRequestedOrientation()</code>, <code>resizeableActivity</code>, <code>minAspectRatio</code> and <code>maxAspectRatio</code>. The app fills the window instead of sitting in a letterbox. There was a temporary opt-out, a manifest property.</p>
<p>Android 17 (API 37) removes that opt-out. Once you target API 37, the opt-out property has no effect. On Google Play, new apps and updates must target API 37 by August 2027, so every app on Play meets this soon. The exceptions: games (by <code>android:appCategory</code>), screens smaller than sw600dp, and users who pick the app’s default behavior in the device’s aspect ratio settings.</p>
<p>So a phone-only, portrait-only design now has to work in landscape and in resizable windows on tablets and foldables. The usual breakages are stretched layouts, buttons pushed off screen, a stretched camera preview, and state lost when the Activity is recreated on rotation.</p>`,
        code: `<!-- AndroidManifest.xml: these no longer hold on sw600dp+ screens once you target API 37 -->
<activity
    android:name=".MainActivity"
    android:screenOrientation="portrait"
    android:resizeableActivity="false"
    android:maxAspectRatio="2.0" />

<!-- Android 16 only: a temporary opt-out. Ignored when targeting API 37. -->
<property
    android:name="android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY"
    android:value="true" />

<!-- Games are exempt -->
<application android:appCategory="game" ... />`,
        remember: 'Targeting API 37: no orientation or resize locks on sw600dp+ screens, and no opt-out. Build layouts for any window.',
        terms: [
          { term: 'sw600dp', def: 'A smallest width of at least 600dp: the line Android uses for large screens such as tablets and unfolded foldables.' },
          { term: 'Pillarboxing', def: 'Showing a narrow app in the middle of a wide screen with empty bars on the sides, as the system does for apps whose orientation lock is honored.' },
          { term: 'Resizability opt-out property', def: 'An Android 16 manifest property that temporarily opts an app out of ignored orientation and resizability limits. It has no effect once the app targets API 37.' },
          { term: 'android:appCategory', def: 'A manifest attribute that declares the app’s category. Apps that declare game are exempt from the large-screen rule.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn on the API 37 behavior for your debug build, without changing targetSdk.', code: 'adb shell am compat [[enable]] [[UNIVERSAL_RESIZABLE_BY_DEFAULT]] com.example.haber', why: 'The compat framework can switch the change on for a debuggable app. The app is killed so the override takes effect.' },
          { type: 'bug', prompt: 'On a tablet the app now opens in landscape, and the two-pane layout never appears in portrait split screen. Tap the line that decides the layout wrongly.', code: '@Composable\nfun NewsScreen(state: NewsState) {\n    val config = LocalConfiguration.current\n    val twoPane = config.orientation == Configuration.ORIENTATION_LANDSCAPE\n    if (twoPane) NewsTwoPane(state) else NewsList(state)\n}', bug: 3, fix: '    val twoPane = currentWindowAdaptiveInfo().windowSizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)', why: 'Orientation says nothing about how much room the window has. A wide portrait window and a narrow landscape split both exist. Decide from the window size class.' },
        ],
        quiz: [
          { q: 'Your app targets API 37 and sets <code>screenOrientation="portrait"</code>. A user opens it on a landscape tablet. What happens?', options: ['The lock is ignored and the app fills the screen in landscape', 'The app shows in a portrait box with bars', 'The app crashes on launch'], a: 0, why: 'On screens of sw600dp and larger, orientation locks are ignored for apps targeting API 37. There is no opt-out.' },
          { q: 'Which app keeps its orientation lock on a tablet, even targeting API 37?', options: ['One with <code>android:appCategory="game"</code>', 'One with the Android 16 opt-out property', 'One with <code>resizeableActivity="false"</code>'], a: 0, why: 'Games are exempt. The opt-out property only worked while targeting API 36, and resizeableActivity is one of the ignored attributes.' },
          { q: 'Does the change affect a phone with a smallest width of 411dp?', options: ['No, it only applies at sw600dp and above', 'Yes, on every device', 'Only in landscape'], a: 0, why: 'Screens smaller than sw600dp are exempt, so a phone keeps the lock.' },
          { q: 'Your app targets API 36 today. You want to see the API 37 large-screen behavior before raising targetSdk. What do you run?', options: ['Set <code>resizeableActivity="true"</code> and rebuild', 'Turn on Don’t keep activities in Developer options', '<code>adb shell am compat enable UNIVERSAL_RESIZABLE_BY_DEFAULT &lt;package&gt;</code> on a large-screen device'], a: 2, why: 'The app compatibility flag switches the behavior on for a debuggable build. The app is killed so the change applies on the next start.' },
          { q: 'A portrait-only signup form now opens in landscape on a tablet. Fields stretch across the screen and the button falls off the bottom. Which fix fits?', options: ['Add the opt-out property back to the manifest', 'Cap the content with <code>widthIn(max = …)</code>, center it and make the column scroll', 'Lock orientation in code with <code>setRequestedOrientation()</code>'], a: 1, why: 'Once you target API 37 the opt-out and orientation requests are ignored on sw600dp+ screens. The layout has to work in any window.' },
        ],
        deeper: [
          {
            title: 'Stretched layouts: cap the width, let it scroll',
            body: `<p>A form built for a portrait phone, with <code>fillMaxWidth()</code> fields and a button pinned at the bottom, looks odd on a landscape tablet. Fields stretch across the whole screen, and in a short window the bottom button can end up off screen. Cap the content width with <code>widthIn(max = ...)</code>, center it, and make the column scroll.</p>
<p>Switch the window shape and compare.</p>`,
            code: `Column(
    Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(16.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
) {
    Column(Modifier.widthIn(max = 560.dp).fillMaxWidth()) {
        OutlinedTextField(name, onName, Modifier.fillMaxWidth())
        OutlinedTextField(email, onEmail, Modifier.fillMaxWidth())
        Button(onClick = onSubmit, Modifier.fillMaxWidth()) { Text("Kaydol") }
    }
}`,
            visual(el) {
              let wide = true, fixed = false;
              const s = sw('ay-rz-fix', 'widthIn(max = 560.dp) + verticalScroll');
              const scr = h('div', { class: 'ay-rz-win' });
              const o = out();
              const btns = [act('Landscape tablet', () => { wide = true; paint(true); }), act('Short split-screen window', () => { wide = false; paint(true); })];
              function paint(anim) {
                fixed = s.input.checked;
                press(btns, btns[wide ? 0 : 1]);
                scr.className = 'ay-rz-win' + (wide ? ' ay-rz-wide' : ' ay-rz-short') + (fixed ? ' ay-rz-fixed' : '');
                scr.replaceChildren(h('div', { class: 'ay-rz-form' },
                  h('b', {}, 'Kaydol'), h('span', { class: 'ay-rz-field' }, 'Ad'), h('span', { class: 'ay-rz-field' }, 'E-posta'), h('span', { class: 'ay-rz-field' }, 'Şifre'),
                  h('span', { class: 'ay-pill ay-rz-btn' }, 'Kaydol')));
                if (anim) replay(scr, 'pop-soft');
                const msg = fixed
                  ? '<span class="good">ok:</span> fields keep a readable width, and the column scrolls to the button.'
                  : wide ? '<span class="bad">stretched:</span> each field runs across the whole tablet.' : '<span class="bad">cut off:</span> the button sits below the window and the column can’t scroll.';
                say(o, msg);
              }
              s.input.addEventListener('change', () => paint(true));
              paint(false);
              el.append(h('div', { class: 'stage' }, scr), h('div', { class: 'controls' }, btns), h('div', { class: 'controls' }, s.el), o);
            },
          },
          {
            title: 'Camera preview: let CameraX handle rotation',
            body: `<p>A common break on foldables, in multi-window and on desktop windows is a camera preview that is stretched, rotated or cropped. It happens when code assumes a fixed relation between the sensor orientation, the device’s natural orientation and the screen’s aspect ratio.</p>
<p>Use CameraX’s <code>PreviewView</code> first: it handles rotation and scaling for you. If you must draw the preview yourself with Camera2, compute sizes from the current window metrics, not from the display size or a fixed portrait assumption.</p>`,
            code: `// CameraX: PreviewView scales and rotates the preview for the window
val previewView = PreviewView(context).apply {
    scaleType = PreviewView.ScaleType.FILL_CENTER
}
val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
cameraProvider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview)`,
          },
          {
            title: 'Rotation recreates the Activity: keep the state',
            body: `<p>Apps that locked portrait never saw rotation on tablets. Now they do, and each rotation is a configuration change that recreates the Activity by default. Scroll positions jump to the top, half-filled forms are wiped and navigation history can be lost, unless the state is saved.</p>
<p>Keep screen state in a ViewModel, user input in <code>rememberSaveable</code> or a <code>SavedStateHandle</code>, and test by rotating on every screen.</p>`,
            code: `@Composable
fun SignUpForm(vm: SignUpViewModel = viewModel()) {
    var name by rememberSaveable { mutableStateOf("") }    // survives rotation
    val listState = rememberLazyListState()                 // saved by Compose
    val email by vm.email.collectAsStateWithLifecycle()     // lives in the ViewModel
    /* ... */
}`,
          },
          {
            title: 'Test it before you raise targetSdk',
            body: `<p>You don’t have to change <code>targetSdk</code> to see what happens. The app compatibility framework has a flag, <code>UNIVERSAL_RESIZABLE_BY_DEFAULT</code>, that switches the behavior on. Enable it for a debuggable build on a large-screen emulator or device. The app is killed so the change takes effect on the next start.</p>`,
            code: `# Turn the behavior on for your debug build
adb shell am compat enable UNIVERSAL_RESIZABLE_BY_DEFAULT com.example.haber

# Back to the normal behavior for your targetSdk
adb shell am compat reset UNIVERSAL_RESIZABLE_BY_DEFAULT com.example.haber`,
          },
        ],
        mistakes: [
          {
            title: 'Counting on the manifest lock',
            bad: `<activity android:name=".PlayerActivity"
    android:screenOrientation="portrait" />   <!-- "the tablet layout can wait" -->`,
            good: `<activity android:name=".PlayerActivity" />
<!-- and a layout that works in any window, chosen by window size class -->`,
            why: 'Targeting API 37, the lock is ignored on sw600dp+ screens. The tablet layout is needed now, not later.',
          },
          {
            title: 'Treating the opt-out as the fix',
            bad: `<property android:name="android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY"
    android:value="true" />   <!-- and targetSdk = 37 -->`,
            good: `// targetSdk = 37, no opt-out property.
// Layouts adapt to the window; state survives rotation.`,
            why: 'The property was a temporary bridge for API 36. Once you target API 37 it does nothing, and Play requires API 37 for new apps and updates by August 2027.',
          },
        ],
        visual(el) {
          let dev = 'tablet', sdk = 37;
          const opt = sw('ay-rz-opt', 'opt-out property = true');
          const game = sw('ay-rz-game', 'android:appCategory="game"');
          const screen = h('div', { class: 'ay-rz-dev' });
          const mani = h('pre', { class: 'ay-rz-mani' });
          const o = out();
          const devBtns = [act('Phone, sw 411dp', () => { dev = 'phone'; paint(true); }), act('Tablet, sw 800dp', () => { dev = 'tablet'; paint(true); })];
          const sdkBtns = [35, 36, 37].map(v => act(`targetSdk ${v}`, () => { sdk = v; paint(true); }));
          function rule() {
            const o2 = opt.input.checked, g = game.input.checked;
            if (dev === 'phone') return { honored: true, why: 'sw 411dp is below 600dp, so the lock is honored. The app is portrait, as asked.' };
            if (g) return { honored: true, why: 'Games are exempt. The lock is honored: portrait with bars on the sides.' };
            if (sdk < 36) return { honored: true, why: 'Below API 36 the old rules apply: the lock is honored and the app is pillarboxed.' };
            if (sdk === 36 && o2) return { honored: true, why: 'API 36 with the opt-out property: the lock still holds. This only works until you target API 37.' };
            if (sdk === 36) return { honored: false, why: 'API 36 on sw600dp+: orientation and resizability limits are ignored. The app fills the screen.' };
            return { honored: false, why: o2 ? 'API 37: the opt-out property has no effect. The app fills the screen in landscape.' : 'API 37 on sw600dp+: the portrait lock is ignored. The app fills the screen in landscape.' };
          }
          function paint(anim) {
            press(devBtns, devBtns[dev === 'phone' ? 0 : 1]);
            press(sdkBtns, sdkBtns[[35, 36, 37].indexOf(sdk)]);
            const r = rule();
            screen.className = `ay-rz-dev ay-rz-${dev}`;
            const app = h('div', { class: 'ay-rz-app' + (r.honored ? '' : ' ay-rz-fill') },
              h('div', { class: 'ay-rz-bar' }, 'Haber'),
              h('div', { class: 'ay-rz-feed' }, h('i'), h('i'), h('i'), h('i')));
            screen.replaceChildren(app);
            if (anim) replay(app, 'pop-soft');
            mani.innerHTML = `targetSdk = ${sdk}\n&lt;activity android:screenOrientation="portrait" /&gt;`
              + (opt.input.checked ? '\n&lt;property ...ALLOW_RESTRICTED_RESIZABILITY = true /&gt;' : '')
              + (game.input.checked ? '\n&lt;application android:appCategory="game" /&gt;' : '');
            say(o, `${r.honored ? '<span class="muted">lock honored</span>' : '<span class="good">lock ignored</span>'}: ${esc(r.why)}`);
          }
          opt.input.addEventListener('change', () => paint(true));
          game.input.addEventListener('change', () => paint(true));
          paint(false);
          el.append(
            h('div', { class: 'ay-split' }, h('div', { class: 'stage' }, screen), h('div', { class: 'ay-col' }, h('span', { class: 'ay-label' }, 'The app asks for'), mani)),
            h('div', { class: 'controls' }, devBtns),
            h('div', { class: 'controls' }, sdkBtns),
            h('div', { class: 'controls' }, opt.el, game.el),
            h('p', { class: 'tip' }, 'The device runs Android 17. Users can still choose the app’s default in the aspect ratio settings.'),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'insets',
        title: 'Edge-to-edge and insets',
        tagline: 'Draw behind the system bars, then pad content out of their way.',
        level: 'advanced',
        body: `
<p>Edge-to-edge means your app draws behind the status bar and the navigation bar. Apps that target Android 15 get it whether they ask or not, and apps that target Android 16 can no longer opt out. Call <code>enableEdgeToEdge()</code> in <code>onCreate</code> before <code>setContent</code>, so older versions behave the same and the bar icons get the right color.</p>
<p>Then keep content clear with insets. <code>WindowInsets</code> describes the areas system UI covers: <code>systemBars</code>, <code>displayCutout</code>, <code>ime</code> for the keyboard, and <code>safeDrawing</code>, which combines them. Apply them with <code>safeDrawingPadding()</code>, <code>imePadding()</code> or <code>windowInsetsPadding(...)</code>. Inside a <code>Scaffold</code>, <code>innerPadding</code> already includes the bars.</p>
<p>Insets modifiers consume what they apply, so a nested one doesn’t pad twice. Plain <code>padding(innerPadding)</code> consumes nothing, so don’t stack insets padding on top of it. The keyboard inset animates frame by frame and <code>imePadding()</code> follows it. Set the activity’s <code>windowSoftInputMode</code> to <code>adjustResize</code> so the keyboard inset is reported.</p>`,
        code: `class ChatActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()               // before setContent
        super.onCreate(savedInstanceState)
        setContent { AppTheme { ChatRoute() } }
    }
}

@Composable
fun ChatScreen(messages: List<Message>, onSend: (String) -> Unit) {
    Column(
        Modifier
            .fillMaxSize()
            .safeDrawingPadding()        // bars, cutout and keyboard
    ) {
        LazyColumn(Modifier.weight(1f), reverseLayout = true) {
            items(messages, key = { it.id }) { MessageRow(it) }
        }
        MessageInput(onSend, Modifier.fillMaxWidth())
    }
}

// Same thing in two steps: .systemBarsPadding().imePadding()
// Lists that scroll behind the bars: contentPadding = WindowInsets.safeDrawing.asPaddingValues()`,
        remember: 'enableEdgeToEdge() first, then safeDrawingPadding() or imePadding() where content must stay clear.',
        terms: [
          { term: 'enableEdgeToEdge', def: 'An Activity extension that makes the system bars transparent and lets the app draw behind them on every Android version.' },
          { term: 'WindowInsets', def: 'The sizes of the screen edges covered by system UI such as the status bar, navigation bar, display cutout and keyboard.' },
          { term: 'safeDrawing', def: 'The WindowInsets type that combines system bars, display cutout and the keyboard: everywhere content could be covered.' },
          { term: 'imePadding', def: 'A modifier that pads content by the keyboard’s height and animates with it as the keyboard opens and closes.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn on edge-to-edge and keep the input above the keyboard.', code: 'override fun onCreate(savedInstanceState: Bundle?) {\n    [[enableEdgeToEdge]]()\n    super.onCreate(savedInstanceState)\n    setContent {\n        MessageInput(Modifier.fillMaxWidth().[[imePadding]]())\n    }\n}', why: '<code>enableEdgeToEdge()</code> goes before <code>setContent</code>. <code>imePadding()</code> lifts the input by the keyboard’s height.' },
          { type: 'bug', prompt: 'There is an empty band under the top app bar, as tall as the status bar. Tap the line that adds it.', code: 'Scaffold(\n    topBar = { TopAppBar(title = { Text("Chat") }) },\n) { innerPadding ->\n    LazyColumn(\n        Modifier\n            .padding(innerPadding)\n            .statusBarsPadding()\n    ) {\n        items(messages, key = { it.id }) { MessageRow(it) }\n    }\n}', bug: 6, fix: '            // remove: innerPadding already includes the status bar', why: '<code>innerPadding</code> covers the top bar, which already sits below the status bar. <code>padding()</code> doesn’t consume insets, so <code>statusBarsPadding()</code> adds the status bar again.' },
        ],
        quiz: [
          { q: 'An app targets Android 15 and runs on Android 15, with no inset handling. What happens?', options: ['The system adds padding for you', 'Content draws behind the status and navigation bars', 'The app falls back to the old non-edge-to-edge layout'], a: 1, why: 'Edge-to-edge is enforced for apps targeting API 35. Handling insets is up to you.' },
          { q: 'Which insets include the keyboard?', options: ['<code>WindowInsets.systemBars</code>', '<code>WindowInsets.ime</code> and <code>WindowInsets.safeDrawing</code>', '<code>WindowInsets.displayCutout</code>'], a: 1, why: '<code>ime</code> is the keyboard alone. <code>safeDrawing</code> combines it with the bars and the cutout.' },
          { q: 'Where should <code>enableEdgeToEdge()</code> go?', options: ['In onCreate, before setContent', 'In onResume', 'Inside a composable'], a: 0, why: 'It configures the window, so call it once in onCreate before any content is set.' },
          { q: 'Which line is the bug?<pre style="white-space:pre-wrap;overflow-wrap:anywhere"><code>Box(\n    Modifier\n        .fillMaxSize()\n        .safeDrawingPadding()\n        .background(MaterialTheme.colorScheme.primaryContainer)\n)</code></pre>', options: ['<code>.fillMaxSize()</code>: edge-to-edge screens must not fill', '<code>.safeDrawingPadding()</code> comes before the background, so the bars show the window color instead of yours', '<code>.background(…)</code>: backgrounds cannot sit behind system bars'], a: 1, why: 'Modifiers apply in order. Paint full bleed first, then pad the content with the insets.' },
          { q: 'A Scaffold applies <code>Modifier.padding(innerPadding)</code>, and the input below uses <code>imePadding()</code>. With the keyboard open, a gap appears above it. What fixes it?', options: ['Add <code>consumeWindowInsets(innerPadding)</code> after the padding', 'Remove imePadding()', 'Use <code>systemBarsPadding()</code> on the input too'], a: 0, why: 'Plain padding consumes no insets, so imePadding() adds the full keyboard height again on top of the navigation bar already covered. Consuming tells it what is used.' },
        ],
        deeper: [
          {
            title: 'Consume what you already applied',
            body: `<p>Insets modifiers like <code>systemBarsPadding()</code> consume what they apply, so a nested insets modifier below them only adds what is left. Plain <code>padding(innerPadding)</code> is just padding and consumes nothing. Children further down still see the full insets and pad again.</p>
<p>After <code>padding(innerPadding)</code>, add <code>consumeWindowInsets(innerPadding)</code>. Now <code>imePadding()</code> on the input subtracts the navigation bar that is already covered, and the field sits right on the keyboard.</p>`,
            code: `Scaffold(topBar = { TopAppBar(title = { Text("Chat") }) }) { innerPadding ->
    Column(
        Modifier
            .padding(innerPadding)
            .consumeWindowInsets(innerPadding)
    ) {
        Messages(Modifier.weight(1f))
        MessageInput(Modifier.imePadding())   // keyboard height minus what is already used
    }
}`,
            visual(el) {
              const SB = 24, TB = 40, NB = 18, KB = 150;
              let consume = false, kb = false;
              const msgs = h('div', { class: 'ay-msgs' }, h('div', { class: 'ay-msg' }, 'Ridge path at 9?'), h('div', { class: 'ay-msg me' }, 'Sounds good'));
              const input = h('div', { class: 'ay-input' }, 'Message');
              const gap = h('div', { class: 'ay-ci-gap' });
              const content = h('div', { class: 'ay-content ay-ci-content' }, msgs, input, gap);
              const kbEl = h('div', { class: 'ay-kb', 'aria-hidden': 'true' }, Array.from({ length: 24 }, () => h('i')));
              const phone = h('div', { class: 'ay-e2e ay-show ay-ci-phone', role: 'img', 'aria-label': 'Chat screen inside a Scaffold' },
                h('div', { class: 'ay-ci-top' }, 'Chat'), content,
                h('div', { class: 'ay-shade', style: `top:0;height:${SB}px` }), h('div', { class: 'ay-shade', style: `bottom:0;height:${NB}px` }), kbEl,
                h('div', { class: 'ay-sbar' }, h('span', {}, '9:41'), h('span', {}, '5G 80%')), h('div', { class: 'ay-nbar' }));
              const code = h('div', { class: 'kt' });
              const o = out();
              const btns = [
                cmd('.padding(innerPadding)', () => { consume = false; press(btns, btns[0]); paint(); }),
                cmd('.padding(innerPadding).consumeWindowInsets(innerPadding)', () => { consume = true; press(btns, btns[1]); paint(); }),
              ];
              const kbBtn = act('Show keyboard', () => { kb = !kb; kbBtn.textContent = kb ? 'Hide keyboard' : 'Show keyboard'; paint(); });
              function paint() {
                const ime = kb ? (consume ? KB - NB : KB) : 0;
                const extra = kb && !consume ? NB : 0;
                content.style.top = SB + TB + 'px';
                content.style.bottom = NB + 'px';
                gap.style.height = ime + 'px';
                gap.classList.toggle('ay-ci-bad', extra > 0);
                kbEl.classList.toggle('up', kb);
                code.innerHTML = hl(`Column(Modifier${consume ? '.padding(innerPadding)\n  .consumeWindowInsets(innerPadding)' : '.padding(innerPadding)'}) {\n  MessageInput(Modifier.imePadding())\n}`);
                say(o, !kb
                  ? `innerPadding = top ${SB + TB} dp, bottom ${NB} dp. Open the keyboard.`
                  : consume
                    ? `<span class="good">imePadding() = ${KB} - ${NB} consumed = ${KB - NB} dp.</span> The field sits on the keyboard.`
                    : `<span class="bad">imePadding() = ${KB} dp on top of ${NB} dp of padding.</span> An empty ${NB} dp band opens above the keyboard.`);
              }
              press(btns, btns[0]);
              paint();
              el.append(
                h('div', { class: 'ay-split' }, phone,
                  h('div', { class: 'ay-col' }, h('span', { class: 'ay-label' }, 'Modifiers on the Scaffold content'), h('div', { class: 'controls' }, btns), h('div', { class: 'controls' }, kbBtn), code,
                    h('p', { class: 'tip' }, 'Red band: padding added twice for the same inset.'))),
                o);
            },
          },
          {
            title: 'Lists: contentPadding, not padding',
            body: `<p>Padding a <code>LazyColumn</code> shrinks its viewport. Rows stop at the edge of each bar and you see a hard cut. Pass the insets as <code>contentPadding</code> instead. The list still fills the screen and rows scroll behind the transparent bars, but the first and last row can always scroll clear of them.</p>`,
            code: `LazyColumn(
    contentPadding = WindowInsets.systemBars.asPaddingValues(),
) {
    items(photos, key = { it.id }) { PhotoRow(it) }
}`,
            visual(el) {
              const SB = 24, NB = 18;
              let cp = false, pos = 0, busy = false;
              const inner = h('div', { class: 'ay-lp-inner' }, Array.from({ length: 10 }, (_, i) => h('div', { class: 'ay-lp-row' }, h('i'), `Photo ${i + 1}`)));
              const view = h('div', { class: 'ay-lp-view' }, inner);
              const phone = h('div', { class: 'ay-e2e ay-show ay-lp-phone', role: 'img', 'aria-label': 'Photo list drawn edge to edge' },
                view, h('div', { class: 'ay-shade', style: `top:0;height:${SB}px` }), h('div', { class: 'ay-shade', style: `bottom:0;height:${NB}px` }),
                h('div', { class: 'ay-sbar' }, h('span', {}, '9:41'), h('span', {}, '5G 80%')), h('div', { class: 'ay-nbar' }));
              const code = h('div', { class: 'kt' });
              const o = out();
              const max = () => Math.max(0, inner.offsetHeight - view.clientHeight);
              function place() { inner.style.transform = `translateY(${-pos * max()}px)`; }
              function paint() {
                view.style.top = cp ? '0' : SB + 'px'; view.style.bottom = cp ? '0' : NB + 'px';
                inner.style.paddingTop = cp ? SB + 'px' : '0'; inner.style.paddingBottom = cp ? NB + 'px' : '0';
                code.innerHTML = hl(cp ? 'LazyColumn(contentPadding = WindowInsets.systemBars.asPaddingValues())' : 'LazyColumn(Modifier.windowInsetsPadding(WindowInsets.systemBars))');
                place();
              }
              async function scrollTo(p, label) {
                if (busy) return; busy = true;
                pos = p; place();
                await sleep(500);
                if (!el.isConnected) return;
                say(o, cp
                  ? `${label}: rows slide behind the bars, ${p === 1 ? 'and the last row stops above the gesture bar' : p === 0 ? 'and the first row starts below the status bar' : 'and you can see them through the transparent bars'}.`
                  : `${label}: rows are cut off at the bar edges. The bars show an empty strip.`);
                busy = false;
              }
              const modes = [
                cmd('Modifier.windowInsetsPadding(systemBars)', () => { if (busy) return; cp = false; press(modes, modes[0]); paint(); say(o, 'Padding: the viewport ends at the bars.'); }),
                cmd('contentPadding = systemBars', () => { if (busy) return; cp = true; press(modes, modes[1]); paint(); say(o, 'contentPadding: the viewport fills the screen, the content is inset.'); }),
              ];
              press(modes, modes[0]);
              el.append(
                h('div', { class: 'ay-split' }, phone,
                  h('div', { class: 'ay-col' }, h('div', { class: 'controls' }, modes), code,
                    h('div', { class: 'controls' }, act('Scroll to top', () => scrollTo(0, 'Top')), act('Scroll to middle', () => scrollTo(0.5, 'Middle')), act('Scroll to end', () => scrollTo(1, 'End'))))),
                o);
              paint();
              say(o, 'Compare the two ways and scroll the list.');
            },
          },
          {
            title: 'Cutouts move when you rotate',
            body: `<p>Rotate a phone with a camera hole and the cutout moves to a side edge. <code>systemBars</code> does not cover it there, so text can land under the camera. <code>safeDrawing</code> and <code>safeContent</code> include <code>displayCutout</code>. Apply only the sides you need with <code>only</code>.</p>`,
            code: `Column(
    Modifier.windowInsetsPadding(
        WindowInsets.safeDrawing.only(WindowInsetsSides.Horizontal + WindowInsetsSides.Top)
    )
) { /* ... */ }`,
          },
        ],
        underHood: {
          body: `<p><code>enableEdgeToEdge()</code> tells the window not to fit system windows, so your content gets the whole screen. It also makes the bars transparent, adds a scrim where the system needs one, and picks light or dark bar icons.</p>
<p>The view that hosts Compose then listens for window insets, including the per-frame updates while the keyboard animates, and stores them in snapshot State. A new inset value is a State write, so only the layouts that read those insets measure again. Insets padding modifiers pass the amount they consumed down the modifier tree through a modifier local, and each nested one subtracts it before it pads.</p>`,
        },
        mistakes: [
          {
            title: 'Hard-coded bar heights',
            bad: `Column(Modifier.padding(top = 24.dp, bottom = 48.dp)) {
    /* ... */
}`,
            good: `Column(Modifier.systemBarsPadding()) {
    /* ... */
}`,
            why: 'Bar heights differ by device, cutout, gesture or three-button navigation and orientation. Insets give you the real numbers, and they update when they change.',
          },
          {
            title: 'Padding before the background',
            bad: `Box(
    Modifier
        .fillMaxSize()
        .safeDrawingPadding()
        .background(MaterialTheme.colorScheme.primaryContainer)
)`,
            good: `Box(
    Modifier
        .fillMaxSize()
        .background(MaterialTheme.colorScheme.primaryContainer)
        .safeDrawingPadding()
)`,
            why: 'Modifiers apply in order. Padding first shrinks the area the background paints, so the bars show the window color instead of yours. Paint full bleed, then pad the content.',
          },
        ],
        visual(el) {
          const SB = 24, NB = 18, KB = 150;
          const MODES = [
            { src: 'Column(Modifier.fillMaxSize())', top: 0, bottom: () => 0 },
            { src: '.statusBarsPadding()', top: SB, bottom: () => 0 },
            { src: '.systemBarsPadding()', top: SB, bottom: () => NB },
            { src: '.safeDrawingPadding()', top: SB, bottom: k => (k ? KB : NB) },
          ];
          let mode = 0, kb = false;
          const ins = sw('ay-e2e-ins', 'Show insets', true);
          const kbEl = h('div', { class: 'ay-kb', 'aria-hidden': 'true' }, Array.from({ length: 24 }, () => h('i')));
          const content = h('div', { class: 'ay-content' },
            h('div', { class: 'ay-chat-top' }, 'Trail club'),
            h('div', { class: 'ay-msgs' },
              h('div', { class: 'ay-msg' }, 'Ridge path at 9?'),
              h('div', { class: 'ay-msg me' }, 'Sounds good'),
              h('div', { class: 'ay-msg' }, 'Bring water, it gets hot.')),
            h('div', { class: 'ay-input' }, 'Message'));
          const shTop = h('div', { class: 'ay-shade', style: `top:0;height:${SB}px` });
          const shBot = h('div', { class: 'ay-shade', style: `bottom:0;height:${NB}px` });
          const phone = h('div', { class: 'ay-e2e', role: 'img', 'aria-label': 'Chat screen drawn edge to edge' },
            content, shTop, shBot, kbEl,
            h('div', { class: 'ay-sbar' }, h('span', {}, '9:41'), h('span', {}, '5G 80%')), h('div', { class: 'ay-cut' }), h('div', { class: 'ay-nbar' }));
          const code = h('div', { class: 'kt' });
          const o = out();
          function paint() {
            const m = MODES[mode], bottom = m.bottom(kb), need = kb ? KB : NB;
            content.style.top = m.top + 'px'; content.style.bottom = bottom + 'px';
            kbEl.classList.toggle('up', kb);
            shBot.style.height = need + 'px';
            phone.classList.toggle('ay-show', ins.input.checked);
            code.innerHTML = hl(`setContent {\n  Column(Modifier.fillMaxSize()${mode ? m.src : ''}) { ... }\n}`);
            const issues = [];
            if (m.top < SB) issues.push('<span class="bad">the title sits under the status bar and the camera cutout</span>');
            if (bottom < need) issues.push(kb ? '<span class="bad">the keyboard covers the text field</span>' : '<span class="bad">the text field is under the gesture bar</span>');
            say(o, issues.length ? issues.join('<br>') : `<span class="good">ok:</span> nothing is covered${kb ? ', and the field rode up with the keyboard' : ''}`);
          }
          const btns = MODES.map((m, i) => cmd(m.src, function () { mode = i; press(btns, this); paint(); }));
          const kbBtn = act('Show keyboard', () => { kb = !kb; kbBtn.textContent = kb ? 'Hide keyboard' : 'Show keyboard'; paint(); });
          ins.input.addEventListener('change', paint);
          press(btns, btns[0]);
          paint();
          el.append(
            h('div', { class: 'ay-split' }, phone,
              h('div', { class: 'ay-col' },
                h('span', { class: 'ay-label' }, 'Padding on the root Column'),
                h('div', { class: 'controls' }, btns),
                h('div', { class: 'controls' }, kbBtn, ins.el),
                code,
                h('p', { class: 'tip' }, 'Striped areas are insets: status bar on top, gesture bar or keyboard at the bottom.'))),
            o);
        },
      },
    ],
  });
})();
