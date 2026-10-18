/* Data and networking track. Same shape as tracks/kotlin.js.
   Room basics and Retrofit moved here from the architecture track; the repository and SSOT stay there.
   Demo styles live in the css string below; classes are prefixed dt-, and the Room and Retrofit demos keep their arc- classes. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const line = (el, html) => { el.append(h('div', { class: 'line drop-in', html })); el.scrollTop = el.scrollHeight; };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const toggle = (id, label, onchange) => {
    const input = h('input', { type: 'checkbox', id, onchange });
    return Object.assign(h('label', { class: 'switch', for: id }, input, label), { input });
  };

  // Used by the Room basics and Retrofit lessons (moved from the architecture track).
  // A labelled box with a slot that tokens land in.
  function node(name, sub, ...extra) {
    const slot = h('div', { class: 'arc-slot' });
    const el = h('div', { class: 'arc-node' }, h('b', {}, name), sub ? h('small', { html: sub }) : null, ...extra, slot);
    return Object.assign(el, { box: slot });
  }
  const switchEl = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked });
    input.addEventListener('change', () => onchange(input));
    return Object.assign(h('label', { class: 'switch', for: id }, input, label), { input });
  };

  const css = `
.dt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); }
.dt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 14px; min-width: 0; }
.dt-card { display: grid; gap: 10px; align-content: start; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.dt-card.dt-on { border-color: var(--accent); background: var(--accent-soft); }
.dt-head { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; justify-content: space-between; min-width: 0; }
.dt-title { font: 700 0.9rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.dt-sub { color: var(--muted); font-size: 0.86rem; overflow-wrap: anywhere; }
.dt-pill { font: 700 0.74rem var(--mono); padding: 2px 9px; border-radius: 999px; background: var(--sunk); color: var(--muted); white-space: nowrap; }
.dt-pill.dt-ok { background: var(--ok-soft); color: var(--ok); }
.dt-pill.dt-bad { background: var(--err-soft); color: var(--err); }
.dt-pill.dt-warn { background: var(--warm-soft); color: var(--warm); }
.dt-pill.dt-acc { background: var(--accent); color: var(--accent-ink); }

/* 1 choosing storage */
.dt-qs { display: grid; gap: 6px; min-width: 0; }
.dt-q { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font-size: 0.92rem; transition: opacity 0.25s, border-color 0.25s, background 0.25s; min-width: 0; }
.dt-q > span:first-child { min-width: 0; flex: 1 1 200px; }
.dt-q.dt-ask { border-color: var(--warm); background: var(--warm-soft); }
.dt-q.dt-skip { opacity: 0.38; }
.dt-bins { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 8px; }
.dt-bin { display: grid; gap: 2px; align-content: start; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.dt-bin b { font: 700 0.84rem var(--mono); overflow-wrap: anywhere; }
.dt-bin small { color: var(--muted); font-size: 0.8rem; }
.dt-bin.dt-on { border-color: var(--accent); background: var(--accent-soft); }
.dt-bin.dt-legacy { border-style: dashed; }
.dt-bin.dt-legacy b { text-decoration: line-through; color: var(--muted); }
.dt-bin.dt-from { border-color: var(--warm); }

/* 2 DataStore */
.dt-file { background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 12px 14px; font: 500 0.84rem/1.7 var(--mono); overflow-x: auto; white-space: pre; min-width: 0; }
.dt-file .dt-fname { color: var(--t-c); }
.dt-hit { background: rgba(255, 212, 121, 0.22); border-radius: 4px; padding: 0 2px; }
.dt-queue { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 40px; padding: 6px 8px; border-radius: 10px; background: var(--sunk); min-width: 0; }
.dt-queue:empty::before { content: "no edits running"; color: var(--muted); font: 500 0.8rem var(--mono); }
.dt-tx { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); }
.dt-tx.dt-run { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.dt-tx.dt-done { opacity: 0.45; }
.dt-ui { display: grid; gap: 8px; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); min-width: 0; transition: background 0.35s, color 0.35s; }
.dt-ui.dt-dark { background: var(--code-bg); color: var(--code-ink); border-color: var(--code-bg); }
.dt-ui-text { font-weight: 700; line-height: 1.3; transition: font-size 0.3s; overflow-wrap: anywhere; }
.dt-ui .dt-sub { color: inherit; opacity: 0.7; }
.dt-frame { background: var(--ok); }
.dt-frame.dt-lost { opacity: 0.15; }
.dt-grow { transition: width 0.9s linear; }

/* 3 relations, 4 migrations */
.dt-tables { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 10px; min-width: 0; }
.dt-table { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); font: 500 0.8rem var(--mono); min-width: 0; align-self: start; }
.dt-tname { padding: 6px 10px; background: var(--code-bg); color: var(--code-ink); font-weight: 600; }
.dt-tr { display: grid; grid-template-columns: var(--dt-cols, minmax(0, 1fr) minmax(0, 1fr)); gap: 8px; padding: 5px 10px; border-top: 1px solid var(--line); transition: background 0.25s; }
.dt-tr > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dt-th { color: var(--muted); font-weight: 600; }
.dt-tr.dt-hot { background: var(--accent-soft); }
.dt-tr.dt-new { background: var(--ok-soft); }
.dt-tr > .dt-newcol { color: var(--ok); font-weight: 700; }
.dt-empty { padding: 10px; color: var(--muted); border-top: 1px solid var(--line); }
.dt-results { display: flex; flex-wrap: wrap; gap: 10px; min-height: 70px; align-items: flex-start; min-width: 0; }
.dt-results:empty::before { content: "Run a query to build objects."; color: var(--muted); font-size: 0.9rem; }
.dt-results .obj { min-width: 0; flex: 1 1 210px; overflow-wrap: anywhere; font-size: 0.8rem; }
.dt-nest { display: flex; flex-wrap: wrap; gap: 4px; padding-left: 10px; border-left: 2px solid var(--line); }
.dt-mini { font: 600 0.74rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); }
.dt-crash { display: grid; justify-items: center; gap: 8px; padding: 18px 10px; text-align: center; border-top: 1px solid var(--line); }

/* 5 paging */
.dt-pg { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 16px; align-items: start; min-width: 0; }
.dt-feed { position: relative; height: 280px; overflow-y: auto; overscroll-behavior: contain; border-radius: 20px; border: 7px solid var(--code-bg); background: var(--surface); padding: 6px; display: grid; align-content: start; gap: 4px; min-width: 0; }
.dt-row { height: 36px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: 8px; background: var(--sunk); font-size: 0.86rem; white-space: nowrap; overflow: hidden; min-width: 0; }
.dt-row b { font: 600 0.72rem var(--mono); color: var(--muted); flex: none; width: 2.2em; }
.dt-row span { overflow: hidden; text-overflow: ellipsis; }
.dt-row.dt-odd { background: var(--accent-soft); }
.dt-foot { display: grid; justify-items: center; gap: 6px; padding: 8px; min-height: 46px; color: var(--muted); font-size: 0.85rem; text-align: center; }
.dt-spin { width: 22px; height: 22px; border-width: 3px; }
.dt-refresh { position: sticky; top: 0; z-index: 1; justify-self: center; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--surface); box-shadow: 0 4px 14px -6px rgba(20, 10, 60, 0.5); }
.dt-side { display: grid; gap: 10px; min-width: 0; }
.dt-states { display: grid; gap: 6px; }
.dt-state { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; font: 600 0.78rem var(--mono); padding: 6px 10px; border-radius: 8px; background: var(--sunk); color: var(--muted); transition: background 0.2s, color 0.2s; }
.dt-state.dt-loading { background: var(--warm-soft); color: var(--warm); }
.dt-state.dt-err { background: var(--err-soft); color: var(--err); }
.dt-state.dt-end { background: var(--ok-soft); color: var(--ok); }
.dt-pages { display: flex; flex-wrap: wrap; gap: 4px; }
.dt-page { width: 34px; height: 24px; border-radius: 6px; background: var(--sunk); font: 600 0.7rem var(--mono); display: grid; place-items: center; color: var(--muted); }
.dt-page.dt-in { background: var(--accent); color: var(--accent-ink); }
.dt-page.dt-wait { outline: 2px dashed var(--warm); outline-offset: -2px; color: var(--warm); }
.dt-page.dt-fail { background: var(--err-soft); color: var(--err); }

/* 6 files */
.dt-zones { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 10px; min-width: 0; }
.dt-zone { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s; }
.dt-zone.dt-on { border-color: var(--accent); }
.dt-path { font: 500 0.74rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.dt-files { display: flex; flex-wrap: wrap; gap: 6px; min-height: 32px; align-items: center; }
.dt-files:empty::before { content: "(empty)"; color: var(--muted); font: 500 0.78rem var(--mono); }
.dt-fileic { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; background: var(--bg); border: 1px solid var(--line); color: var(--ink); overflow-wrap: anywhere; }
.dt-fileic.dt-ours { border-color: var(--accent); color: var(--accent); }
.dt-fileic.dt-pending { border-style: dashed; opacity: 0.6; }
.dt-fileic.dt-orphan { border-color: var(--warm); color: var(--warm); }
.dt-sheet { display: grid; gap: 10px; padding: 14px; border-radius: 18px 18px 8px 8px; border: 2px solid var(--accent); background: var(--surface); min-width: 0; }
.dt-thumbs { display: flex; flex-wrap: wrap; gap: 8px; }
.dt-thumb { width: 76px; height: 64px; border-radius: 10px; border: 2px solid var(--line); background: linear-gradient(135deg, var(--accent-soft), var(--warm-soft)); color: var(--ink); font: 600 0.66rem var(--mono); cursor: pointer; display: grid; place-items: end center; padding: 4px; overflow: hidden; overflow-wrap: anywhere; }
.dt-thumb:hover { border-color: var(--accent); }

/* 7 caching */
.dt-screen { display: grid; gap: 6px; align-content: center; min-height: 92px; padding: 12px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.dt-screen .err-icon { width: 34px; height: 34px; font-size: 1.1rem; }
.dt-item { padding: 6px 10px; border-radius: 8px; background: var(--sunk); font-size: 0.86rem; font-weight: 700; overflow-wrap: anywhere; }
.bar.dt-bar-ok { background: var(--ok); }
.bar.dt-bar-stale { background: var(--warm); }
.legend .bar.dt-bar-ok, .legend .bar.dt-bar-stale { height: 12px; }

/* depth steps */
.dt-vers { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.dt-ver { font: 700 0.84rem var(--mono); padding: 6px 14px; border-radius: 999px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: border-color 0.25s, background 0.25s, color 0.25s; }
.dt-ver.dt-dev { outline: 2px dashed var(--warm); outline-offset: 2px; }
.dt-ver.dt-on { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); }
.dt-ver.dt-fail { border-color: var(--err); background: var(--err-soft); color: var(--err); }

/* Room basics and Retrofit: arc- rules copied from the architecture track */
.arc-fit, .arc-udf, .arc-db, .arc-map, .arc-wire-row { min-width: 0; }
.arc-node { flex: 1 1 150px; min-width: 0; background: var(--surface); border: 2px solid var(--line); border-radius: 12px; padding: 10px 12px; display: grid; gap: 6px; align-content: start; transition: border-color 0.2s, background 0.2s; }
.arc-node > b { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; }
.arc-node > small { color: var(--muted); font-size: 0.8rem; line-height: 1.35; }
.arc-node.on { border-color: var(--accent); background: var(--accent-soft); }
.arc-node.ask { border-style: dashed; border-color: var(--accent); }
.arc-node.ok { border-color: var(--ok); }
.arc-node.bad { border-color: var(--err); background: var(--err-soft); }
.arc-slot { min-height: 34px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.arc-slot .token { font-size: 0.8rem; padding: 4px 10px; max-width: 100%; overflow-wrap: anywhere; }
.token.arc-back { background: var(--ok); }
.arc-dir { text-align: center; font: 600 0.78rem var(--mono); color: var(--muted); padding: 2px; }
.arc-dir.bad { color: var(--err); }
.arc-mini { display: grid; gap: 4px; }
.arc-mini span { font-size: 0.8rem; padding: 4px 8px; border-radius: 6px; background: var(--sunk); overflow-wrap: anywhere; }
.arc-mini span.arc-new { background: var(--ok-soft); }
.arc-node .chip { height: 32px; min-width: 0; font-size: 0.82rem; padding: 0 10px; }
.arc-node .chip.total { justify-self: start; min-width: 80px; }
.phone .item.arc-small { padding: 7px 10px; font-size: 0.82rem; }
.phone.arc-top { justify-content: flex-start; gap: 6px; }

.arc-udf { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start; }
.arc-col { display: grid; gap: 10px; min-width: 0; }
.arc-lane { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; background: var(--bg); border: 1px dashed var(--line); min-height: 48px; }
.arc-lane-name { font: 600 0.74rem var(--mono); color: var(--muted); min-width: 6.5em; }
.arc-lane .token { font-size: 0.78rem; padding: 4px 10px; overflow-wrap: anywhere; max-width: 100%; }

.arc-db { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.arc-table { border: 2px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.arc-table.inval { border-color: var(--warm); }
.arc-tname { font: 600 0.74rem var(--mono); color: var(--muted); padding: 6px 10px; background: var(--sunk); }
.arc-tr { display: grid; grid-template-columns: 3em minmax(0, 1fr) 4.2em; gap: 6px; padding: 7px 10px; border-top: 1px solid var(--line); font: 500 0.84rem var(--mono); align-items: center; }
.arc-tr > span { overflow-wrap: anywhere; }
.arc-tr.arc-th { font-weight: 700; color: var(--muted); border-top: 0; }
.arc-tr.changed { background: var(--warm-soft); }
.arc-tr.added { background: var(--ok-soft); }
.arc-tr.bad { background: var(--err-soft); }
.arc-empty { padding: 12px 10px; color: var(--muted); font-size: 0.86rem; border-top: 1px solid var(--line); }
.arc-badge { justify-self: start; font: 600 0.72rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.arc-badge.hot { background: var(--warm); color: var(--accent-ink); }

.arc-wire-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; }
.arc-end { font: 700 0.8rem var(--mono); padding: 10px 12px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); text-align: center; }
.arc-end.bad { outline: 2px solid var(--err); }
.arc-wire { position: relative; height: 40px; border-radius: 999px; background: var(--sunk); overflow: hidden; }
.arc-wire::before { content: ""; position: absolute; left: 10px; right: 10px; top: 50%; border-top: 2px dashed var(--line); }
.arc-packet { position: absolute; top: 6px; left: 0; transform: translateX(0); transition: left 0.85s ease-in-out, transform 0.85s ease-in-out; font: 600 0.74rem var(--mono); padding: 5px 10px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.arc-packet.far { left: 100%; transform: translateX(-100%); }
.arc-packet.mid { left: 50%; transform: translateX(-50%); }
.arc-packet.okp { background: var(--ok); }
.arc-packet.errp { background: var(--err); }
.arc-map { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.arc-json { display: grid; background: var(--code-bg); border-radius: 12px; padding: 10px 6px; min-height: 150px; align-content: start; overflow-x: auto; }
.arc-json .branch::after { color: var(--t-c); }
.arc-json .branch.hit::after { content: "  ✓"; }
.arc-json .branch.ign { opacity: 0.45; text-decoration: line-through; }
.arc-json .branch.ign::after { content: "   ignored"; }
.arc-objslot { display: grid; min-height: 150px; place-items: center; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); padding: 10px; min-width: 0; }
.arc-objslot .obj { min-width: 0; width: 100%; }
.arc-cap { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 4px; }

@media (max-width: 860px) {
  .arc-udf, .arc-db, .arc-map { grid-template-columns: minmax(0, 1fr); }
  .arc-udf .phone { justify-self: center; }
}
@media (max-width: 520px) {
  .arc-wire-row { grid-template-columns: minmax(0, 1fr); }
}

/* depth pass 2 (dt-d2-) */
.dt-d2-what { font: 700 0.8rem var(--mono); }
.dt-d2-log { display: grid; gap: 2px; align-content: start; background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 10px 12px; font: 500 0.78rem/1.55 var(--mono); min-height: 96px; overflow-x: auto; min-width: 0; }
.dt-d2-log > div { white-space: pre; }
.dt-d2-log > .dt-d2-more { color: var(--t-c); }
.dt-d2-objslot { display: grid; align-content: start; min-width: 0; }
.dt-d2-objslot .obj { min-width: 0; overflow-wrap: anywhere; }
.obj.dt-d2-lost { border-color: var(--err); }
.dt-d2-chain { display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; min-width: 0; }
.dt-d2-chain > .arc-node { flex: 1 1 140px; }
.dt-d2-chain > .arrow { align-self: center; }
.arc-node.dt-d2-skip { opacity: 0.35; }
.meter.dt-d2-meter { height: 12px; }
.meter.dt-d2-meter span { transition: width 0.14s linear; }
.bar.dt-d2-bar { transition-property: width; transition-timing-function: linear; }
.dt-d2-split { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; min-width: 0; }
.dt-d2-split > .dt-side { flex: 1 1 200px; }
.phone .item.dt-d2-row { display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 8px 10px; font-size: 0.8rem; }
.dt-d2-star { border: 0; background: none; cursor: pointer; font: 700 1.1rem var(--body); color: var(--muted); padding: 0 4px; }
.dt-d2-star.dt-on { color: var(--warm); }
.dt-d2-star.dt-d2-pend { opacity: 0.45; }
.dt-d2-avatar { width: 84px; height: 84px; flex: none; border-radius: 50%; border: 2px solid var(--line); background: var(--sunk); display: grid; place-items: center; font: 600 0.7rem var(--mono); color: var(--muted); text-align: center; transition: border-color 0.25s, background 0.25s; }
.dt-d2-avatar.dt-on { background: linear-gradient(135deg, var(--accent-soft), var(--warm-soft)); border-color: var(--accent); color: var(--ink); }
.dt-d2-avatar.dt-bad { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.dt-file.dt-d2-tmp { transition: opacity 0.25s; }
.dt-file.dt-d2-off { opacity: 0.35; }
/* auth: interceptors and token refresh */
.dt-au-wrap { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; min-width: 0; }
.dt-au-vault { flex: 0 1 210px; display: grid; gap: 8px; padding: 12px; border-radius: 14px; border: 2px solid var(--line); background: var(--bg); min-width: 0; }
.dt-au-kv { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 8px; font: 500 0.8rem var(--mono); }
.dt-au-lanes { flex: 1 1 260px; display: grid; gap: 8px; min-width: 0; }
.dt-au-lane { display: grid; gap: 6px; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.dt-au-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px; }
.dt-au-head b { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; }
.dt-au-track { display: flex; flex-wrap: wrap; gap: 5px; min-height: 24px; min-width: 0; }
.dt-au-chip { max-width: 100%; padding: 2px 8px; border-radius: 6px; background: var(--sunk); color: var(--ink); font: 600 0.72rem var(--mono); overflow-wrap: anywhere; }
.dt-au-chip.dt-au-ok { background: var(--ok-soft); color: var(--ok); }
.dt-au-chip.dt-au-bad { background: var(--err-soft); color: var(--err); }
.dt-au-chip.dt-au-wait { background: var(--warm-soft); color: var(--warm); }
.dt-au-stats { display: flex; flex-wrap: wrap; gap: 24px; }
.dt-au-big { font: 700 1.8rem var(--mono); font-variant-numeric: tabular-nums; }
.meter.dt-au-meter span { transition: width 0.1s linear; }
.meter.dt-au-meter.dt-au-hot span { background: var(--err); }
/* share-files (dt-sh-) and realtime (dt-ws-) */
.dt-sh-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 10px; min-width: 0; }
.dt-sh-uri { font: 500 0.76rem var(--mono); padding: 6px 8px; border-radius: 8px; background: var(--sunk); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.dt-ws-board { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; min-width: 0; }
.dt-ws-board > .dt-side { flex: 1 1 160px; justify-items: start; }
.dt-ws-score { flex: 1 1 220px; display: grid; justify-items: center; gap: 6px; padding: 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); min-width: 0; }
.dt-ws-teams { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px 10px; font-weight: 700; font-size: 0.9rem; text-align: center; }
.dt-d2-log.dt-ws-log > div { white-space: normal; overflow-wrap: anywhere; }
.dt-ws-big { font: 700 1.9rem var(--mono); font-variant-numeric: tabular-nums; }
`;

  Lab.addTrack({
    id: 'data',
    title: 'Data and networking',
    description: 'Store data on the device with Room, DataStore and files, load it from the network with Retrofit, then cache and page it.',
    group: 'Building apps', requires: ['android', 'coroutines'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'choose',
        title: 'Choosing storage',
        tagline: 'Settings, rows, blobs and shared media each have a home.',
        level: 'beginner',
        body: `
<p>On the device you have four main places for data. DataStore holds a few small settings. Room holds structured rows you query. App-specific files hold blobs like PDFs and downloads. MediaStore holds media that the user expects to see in other apps, like Gallery.</p>
<p><code>SharedPreferences</code> is the old key-value API. It parses the whole file into memory, its first read can block the main thread, and <code>apply()</code> can still stall the app when an activity stops. For new code use DataStore. It reads through a <code>Flow</code> and writes inside a coroutine.</p>
<p>Ask a few questions in order. Is it a blob? Should other apps see it? Do you query it? Pick a piece of data below and follow the questions to its home.</p>`,
        code: `// A few small settings: Preferences DataStore
val DARK_MODE = booleanPreferencesKey("dark_mode")
context.dataStore.edit { it[DARK_MODE] = true }

// Many rows you search, sort or join: Room
@Query("SELECT * FROM articles WHERE title LIKE :pattern ORDER BY publishedAt DESC")
fun search(pattern: String): Flow<List<ArticleEntity>>

// A blob only your app needs: app-specific files
File(context.filesDir, "issue-42.pdf").outputStream().use { body.copyTo(it) }

// Media the user wants in Gallery: MediaStore
context.contentResolver.insert(MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), values)

// Legacy SharedPreferences: move the values into DataStore once
val Context.dataStore by preferencesDataStore(
    name = "settings",
    produceMigrations = { ctx -> listOf(SharedPreferencesMigration(ctx, "settings")) },
)`,
        remember: 'Settings go in DataStore, rows in Room, blobs in files, shared media in MediaStore.',
        terms: [
          { term: 'SharedPreferences', def: 'The legacy synchronous key-value store; DataStore replaces it for new code.' },
          { term: 'Room', def: 'The Jetpack library that wraps SQLite with typed entities, DAOs and compile-time checked queries.' },
          { term: 'SharedPreferencesMigration', def: 'A DataStore migration that copies values out of a SharedPreferences file the first time DataStore is read.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Store the dark-mode flag and the offline PDF in the right places.', code: '// a dark-mode flag\nval Context.dataStore by [[preferencesDataStore]](name = "settings")\n\n// a PDF only your app reads, kept until the user deletes it\nval pdf = File(context.[[filesDir]], "issue-42.pdf")', why: 'A flag is a small setting, so it goes in DataStore. A file the user expects to keep goes in <code>filesDir</code>. The system may clear <code>cacheDir</code> when space runs low.' },
          { type: 'bug', prompt: 'The feed screen gets slower with every sync. Tap the line that picked the wrong storage.', code: 'class FeedStore(\n    private val dao: ArticleDao,\n    private val dataStore: DataStore<Preferences>,\n) {\n    suspend fun saveFeed(articles: List<Article>) {\n        dataStore.edit { it[FEED_JSON] = Json.encodeToString(articles) }\n    }\n\n    suspend fun markSynced(at: Long) {\n        dataStore.edit { it[LAST_SYNC] = at }\n    }\n}', bug: 5, fix: '        dao.upsertAll(articles.map { it.toEntity() })', why: 'DataStore keeps its whole file in memory and rewrites all of it on every edit. Thousands of articles belong in Room, where you can update single rows and query them. The sync timestamp is a fine DataStore value.' },
        ],
        quiz: [
          { q: 'You cache 5,000 articles and need search by title. Where do they go?', options: ['Preferences DataStore', 'Room', 'A JSON file in <code>cacheDir</code>'], a: 1, why: 'Room gives you indexed queries, partial updates and Flow results. DataStore and a JSON file would load and rewrite everything.' },
          { q: 'Why is <code>SharedPreferences</code> a poor choice for new code?', options: ['It cannot store booleans', 'Its reads and writes can block the main thread, and it has no transactional updates', 'It was removed in Android 15'], a: 1, why: 'The first read is synchronous disk I/O, and even <code>apply()</code> can stall when an activity stops. DataStore uses coroutines and atomic edits.' },
          { q: 'A photo the user took in your app should show up in Gallery. Where do you save it?', options: ['<code>filesDir</code>', 'MediaStore', 'Room as a BLOB'], a: 1, why: 'Only shared storage through MediaStore is visible to other apps, and it stays after your app is uninstalled.' },
          { q: 'The user taps Clear storage in App info. Which data is still there afterwards?', options: ['The Room database', 'DataStore settings', 'Photos your app added to MediaStore'], a: 2, why: 'Clear storage deletes all app-specific data, Room and DataStore included. MediaStore items belong to the user, so they stay.' },
          { q: 'Your push token must not come back on a new phone through Auto Backup. Where do you keep it?', options: ['filesDir', 'noBackupFilesDir', 'A Room database'], a: 1, why: 'Auto Backup copies filesDir and databases, but skips noBackupFilesDir. A token that belongs to one device goes there.' },
        ],
        deeper: [
          {
            title: 'What survives Clear cache, Clear storage and low space',
            body: `
<p>The place you pick also decides when the data disappears. The system may delete files in <code>cacheDir</code> whenever the device runs low on space, and the user can wipe it with <b>Clear cache</b>. Treat everything there as rebuildable.</p>
<p><b>Clear storage</b> in App info goes further: it deletes all app-specific data, DataStore files and Room databases included, as if the app were new. Items your app added to MediaStore stay, because they belong to the user. Try each action below. Every run starts from a full set of data.</p>`,
            visual(el) {
              const ITEMS = [
                { k: 'ds', path: 'files/datastore/settings.preferences_pb', what: 'DataStore' },
                { k: 'db', path: 'databases/news.db', what: 'Room' },
                { k: 'pdf', path: 'files/issue-42.pdf', what: 'filesDir' },
                { k: 'thumbs', path: 'cache/thumbs/ (38 files)', what: 'cacheDir' },
                { k: 'photo', path: 'Pictures/News/card.jpg', what: 'MediaStore' },
              ];
              const ACTIONS = {
                cache: { label: 'App info › Clear cache', gone: ['thumbs'], note: 'Only cacheDir was emptied. Settings, rows and the PDF are untouched.' },
                low: { label: 'device low on space', gone: ['thumbs'], note: 'The system freed space by deleting cache files. Your app gets no warning, so code must expect cacheDir files to vanish.' },
                storage: { label: 'App info › Clear storage', gone: ['ds', 'db', 'pdf', 'thumbs'], note: 'Every app-specific file is gone, settings and database too. The photo in MediaStore stays: it belongs to the user.' },
              };
              const rows = {};
              let busy = false;
              const list = h('div', { class: 'dt-qs' }, ITEMS.map(it => {
                const pill = h('span', { class: 'dt-pill dt-ok' }, 'kept');
                const e = h('div', { class: 'dt-q' }, h('span', {}, h('b', { class: 'dt-d2-what' }, it.what), ' ', h('span', { class: 'dt-path' }, it.path)), pill);
                rows[it.k] = { e, pill };
                return e;
              }));
              const o = out();
              const fill = () => ITEMS.forEach(it => { const r = rows[it.k]; r.e.className = 'dt-q'; r.pill.className = 'dt-pill dt-ok'; r.pill.textContent = 'kept'; });
              async function run(key, btn) {
                if (busy) return; busy = true;
                press(btns, btn); fill();
                const a = ACTIONS[key];
                say(o, `<span class="muted">${a.label}…</span>`);
                await sleep(350); if (!o.isConnected) return;
                for (const k of a.gone) {
                  const r = rows[k];
                  r.e.classList.add('dt-ask'); replay(r.e, 'shake');
                  await sleep(260); if (!o.isConnected) return;
                  r.e.classList.remove('dt-ask'); r.e.classList.add('dt-skip');
                  r.pill.className = 'dt-pill dt-bad'; r.pill.textContent = 'deleted'; replay(r.pill, 'pop');
                }
                say(o, `<span class="${key === 'storage' ? 'bad' : 'good'}">${a.label}:</span> ${a.note}`);
                busy = false;
              }
              const btns = Object.keys(ACTIONS).map(k => act(ACTIONS[k].label, function () { run(k, this); }));
              say(o, 'Five pieces of data in five places. Pick what happens to the device.');
              el.append(h('div', { class: 'controls' }, btns), list, o);
            },
          },
          {
            title: 'Backups: what comes back on a new phone',
            body: `
<p>Auto Backup is on by default. It copies most app-specific data to the user’s Google account, up to 25 MB per app: shared preferences, <code>filesDir</code> (DataStore lives there), databases and <code>getExternalFilesDir()</code>. It skips <code>cacheDir</code>, <code>codeCacheDir</code> and <code>noBackupFilesDir</code>. On a new phone, the data comes back when the app is installed.</p>
<p>That is great for settings, and wrong for some files. A login token, a device id or a push token belongs to this one device. Exclude those with a rules file. Apps on Android 12 and later read <code>android:dataExtractionRules</code>; to support Android 11 and lower, also keep <code>android:fullBackupContent</code>.</p>`,
            code: `<!-- AndroidManifest.xml: <application android:dataExtractionRules="@xml/data_extraction_rules" ...> -->

<!-- res/xml/data_extraction_rules.xml -->
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="file" path="datastore/session.preferences_pb" />
        <exclude domain="database" path="push_queue.db" />
    </cloud-backup>
    <device-transfer>
        <exclude domain="file" path="datastore/session.preferences_pb" />
    </device-transfer>
</data-extraction-rules>`,
          },
        ],
        underHood: {
          body: `
<p>All of this is ordinary files in the app’s private directory. For the main user that is <code>/data/user/0/&lt;package&gt;</code>, and <code>/data/data/&lt;package&gt;</code> points to the same place. Each user or work profile gets its own copy under its own user id.</p>
<p>Room keeps a SQLite database in <code>databases/</code>. By default it opens it in write-ahead-log mode on most devices, so you see two extra files next to it: <code>-wal</code> holds recent writes, <code>-shm</code> is a shared index for the log. Preferences DataStore writes one protobuf file under <code>files/datastore/</code>. Legacy SharedPreferences are XML files under <code>shared_prefs/</code>.</p>`,
          code: `/data/user/0/com.example.news/
├── cache/thumbs/…                          (Clear cache, low space)
├── databases/news.db, news.db-wal, news.db-shm
├── files/datastore/settings.preferences_pb
├── files/issue-42.pdf
└── shared_prefs/legacy_settings.xml`,
        },
        mistakes: [
          {
            title: 'Hard-coding the data path',
            bad: `val draft = File("/data/data/com.example.news/files/draft.md")`,
            good: `val draft = File(context.filesDir, "draft.md")`,
            why: 'The real path depends on the user and profile: a work profile uses <code>/data/user/10/…</code>. <code>filesDir</code> always returns the right directory for the current user.',
          },
          {
            title: 'Storing images as BLOBs in Room',
            bad: `@Entity
data class Photo(@PrimaryKey val id: Long, val bytes: ByteArray)`,
            good: `@Entity
data class Photo(@PrimaryKey val id: Long, val fileName: String)
// the bytes live in File(context.filesDir, "photos/$fileName")`,
            why: 'Android reads query results through a cursor window of about 2 MB. A large row fails with <code>SQLiteBlobTooBigException</code>, and even smaller BLOBs make every query slow. Keep the file on disk and its name in the table.',
          },
        ],
        visual(el) {
          const Q = [
            { id: 'blob', text: 'Is it a blob, like an image, PDF or download?' },
            { id: 'shared', text: 'Should Gallery or other apps see it, even after uninstall?' },
            { id: 'query', text: 'Do you search, sort, page or join many records?' },
            { id: 'typed', text: 'Is it one small object with typed, nested fields?' },
          ];
          const BINS = [
            { id: 'prefs', title: 'Preferences DataStore', sub: 'a few keys and values' },
            { id: 'typed', title: 'Typed DataStore', sub: 'one small @Serializable object' },
            { id: 'room', title: 'Room', sub: 'tables, queries, relations' },
            { id: 'files', title: 'App-specific files', sub: 'filesDir, cacheDir' },
            { id: 'media', title: 'MediaStore', sub: 'shared Pictures, Music, Download' },
            { id: 'legacy', title: 'SharedPreferences', sub: 'legacy: migrate away' },
          ];
          const ITEMS = [
            { label: 'Dark mode on/off', a: { blob: 0, query: 0, typed: 0 }, bin: 'prefs', note: 'context.dataStore.edit { it[DARK_MODE] = true }' },
            { label: '5,000 articles you search', a: { blob: 0, query: 1 }, bin: 'room', note: '@Query("SELECT * FROM articles WHERE title LIKE :pattern")' },
            { label: 'Onboarding progress object', a: { blob: 0, query: 0, typed: 1 }, bin: 'typed', note: 'onboardingStore.updateData { it.copy(step = 3) }' },
            { label: 'PDF saved for offline reading', a: { blob: 1, shared: 0 }, bin: 'files', note: 'File(context.filesDir, "issue-42.pdf")' },
            { label: 'Photo taken in your camera screen', a: { blob: 1, shared: 1 }, bin: 'media', note: 'contentResolver.insert(imagesUri, values)' },
            { label: 'Settings an old version kept in SharedPreferences', a: { blob: 0, query: 0, typed: 0 }, bin: 'prefs', legacy: true, note: 'preferencesDataStore("settings", produceMigrations = { listOf(SharedPreferencesMigration(it, "settings")) })' },
          ];
          const rows = {};
          const qs = h('div', { class: 'dt-qs' }, Q.map(q => {
            const ans = h('span', { class: 'dt-pill' }, '?');
            const e = h('div', { class: 'dt-q' }, h('span', {}, q.text), ans);
            rows[q.id] = { el: e, ans };
            return e;
          }));
          const bins = {};
          const binBox = h('div', { class: 'dt-bins' }, BINS.map(b => (bins[b.id] = h('div', { class: 'dt-bin' + (b.id === 'legacy' ? ' dt-legacy' : '') }, h('b', {}, b.title), h('small', {}, b.sub)))));
          const o = out();
          let busy = false;
          const pathOf = it => (it.a.blob ? ['blob', 'shared'] : it.a.query ? ['blob', 'query'] : ['blob', 'query', 'typed']);
          const clear = () => {
            Object.values(bins).forEach(b => b.classList.remove('dt-on', 'dt-from'));
            Object.values(rows).forEach(r => { r.el.className = 'dt-q'; r.ans.className = 'dt-pill'; r.ans.textContent = '?'; });
          };
          const answer = (id, yes) => { const r = rows[id]; r.el.classList.remove('dt-ask'); r.ans.textContent = yes ? 'yes' : 'no'; r.ans.className = 'dt-pill ' + (yes ? 'dt-ok' : 'dt-bad'); };
          const land = it => {
            const path = pathOf(it);
            Q.filter(q => !path.includes(q.id)).forEach(q => rows[q.id].el.classList.add('dt-skip'));
            bins[it.bin].classList.add('dt-on'); replay(bins[it.bin], 'pop');
            if (it.legacy) { bins.legacy.classList.add('dt-from'); replay(bins.legacy, 'shake'); }
            say(o, `<span class="good">${BINS.find(b => b.id === it.bin).title}:</span> ${hl(it.note)}`);
          };
          async function run(it, btn) {
            if (busy) return; busy = true;
            press(btns, btn); clear();
            say(o, `Where should <b>${it.label}</b> live?`);
            for (const id of pathOf(it)) {
              rows[id].el.classList.add('dt-ask'); replay(rows[id].el, 'pop-soft');
              await sleep(520); if (!o.isConnected) return;
              answer(id, !!it.a[id]); replay(rows[id].ans, 'pop');
              await sleep(260); if (!o.isConnected) return;
            }
            land(it);
            busy = false;
          }
          const btns = ITEMS.map(it => act(it.label, function () { run(it, this); }));
          // open on a finished answer so the board is never blank
          press(btns, btns[1]);
          pathOf(ITEMS[1]).forEach(id => answer(id, !!ITEMS[1].a[id]));
          land(ITEMS[1]);
          el.append(h('div', { class: 'controls' }, btns), qs, binBox, o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'room',
        title: 'Room basics',
        tagline: 'A table, a DAO, and queries that keep watching.',
        body: `
<p>Room is a layer over SQLite. You describe a table with an <code>@Entity</code> data class, write queries in a <code>@Dao</code> interface, and list both in a <code>@Database</code> class. KSP generates the code that runs the SQL, and it checks your queries at compile time.</p>
<p>Write operations are <code>suspend</code> functions, so they run off the main thread. Queries can return a <code>Flow</code>. A Flow query doesn’t run once and stop: Room re-runs it every time its table changes and emits the new result.</p>
<p>Change the table below and watch both observers react on their own.</p>`,
        code: `@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: Int,
    val title: String,
    val read: Boolean = false,
)

@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles ORDER BY id")
    fun observeAll(): Flow<List<ArticleEntity>>

    @Query("SELECT COUNT(*) FROM articles WHERE read = 0")
    fun observeUnreadCount(): Flow<Int>

    @Insert suspend fun insert(article: ArticleEntity)
    @Update suspend fun update(article: ArticleEntity)
    @Delete suspend fun delete(article: ArticleEntity)
}

@Database(entities = [ArticleEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}

// build.gradle.kts
// ksp(libs.androidx.room.compiler)`,
        remember: '@Entity is the table, @Dao the queries, @Database ties them up. A Flow query re-emits on every change.',
        level: 'intermediate',
        terms: [
          { term: '@Entity', def: 'A Room annotation that turns a data class into a database table.' },
          { term: '@Dao', def: 'A Room annotation for an interface whose functions are the queries and writes for your tables.' },
          { term: '@Database', def: 'A Room annotation on an abstract RoomDatabase class that lists the entities and exposes the DAOs.' },
          { term: '@Upsert', def: 'A Room DAO annotation that inserts a row, or updates it if a row with the same primary key exists.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the table, its key, and a query that keeps emitting.', code: '@[[Entity]](tableName = "articles")\ndata class ArticleEntity(\n    @[[PrimaryKey]] val id: Int,\n    val title: String,\n)\n\n@Dao\ninterface ArticleDao {\n    @Query("SELECT * FROM articles")\n    fun observeAll(): [[Flow]]<List<ArticleEntity>>\n}', why: '<code>@Entity</code> makes the table, <code>@PrimaryKey</code> marks its key, and a <code>Flow</code> return type makes Room re-run the query on every change.' },
          { type: 'bug', prompt: 'Calling one of these from a button click crashes the app. Tap the line.', code: '@Dao\ninterface ArticleDao {\n    @Query("SELECT * FROM articles ORDER BY id")\n    fun observeAll(): Flow<List<ArticleEntity>>\n\n    @Insert\n    fun insert(article: ArticleEntity)\n\n    @Delete\n    suspend fun delete(article: ArticleEntity)\n}', bug: 6, fix: '    suspend fun insert(article: ArticleEntity)', why: 'A blocking DAO call on the main thread throws <code>IllegalStateException</code>. Mark writes <code>suspend</code> and Room runs them off the main thread.' },
        ],
        quiz: [
          { q: 'You collect <code>dao.observeAll()</code>, then insert a row. What happens?', options: ['Nothing until you call <code>observeAll()</code> again', 'The Flow re-runs the query and emits the new list'], a: 1, why: 'Room tracks which tables a query reads and re-runs it after any write to them.' },
          { q: 'Which annotation turns a data class into a table?', options: ['<code>@Dao</code>', '<code>@Entity</code>', '<code>@Database</code>'], a: 1, why: '<code>@Entity</code> describes a table. <code>@Dao</code> holds queries; <code>@Database</code> lists entities and DAOs.' },
          { q: 'A plain <code>@Insert</code> gets an id that already exists. What happens?', options: ['The row is replaced', 'It throws <code>SQLiteConstraintException</code>', 'It is skipped silently'], a: 1, why: 'The default conflict strategy is ABORT. Use <code>@Upsert</code> or <code>onConflict</code> to change that.' },
          { q: 'To refresh a list you call <code>dao.deleteAll()</code> and then <code>dao.insertAll(fresh)</code>. The screen briefly shows its empty state. Why, and what fixes it?', options: ['Room is slow, add a delay before showing empty', 'Each write is its own transaction, so observers see the empty table; wrap both in db.withTransaction { }', 'Flow queries skip emissions, use a suspend query instead'], a: 1, why: 'Room notifies observers when a transaction ends. One transaction around both writes means observers go straight from old rows to new rows.' },
          { q: 'A screen collects <code>dao.observeArticle(1)</code>. Another part of the app updates article 7. What happens?', options: ['Nothing, only row 1 is watched', 'The query re-runs and emits again, often the same value', 'The Flow completes'], a: 1, why: 'Room watches tables, not rows. Any write to articles re-runs every Flow on that table. Add distinctUntilChanged() if the collector does real work.' },
        ],
        deeper: [
          {
            title: 'Flow queries and one-shot queries',
            body: `
<p>The return type decides how a query behaves. A function that returns <code>Flow</code> is not <code>suspend</code>. It runs when collected and again after every change. A <code>suspend</code> function runs once and returns the result as it was at that moment.</p>
<p>Use a Flow for anything a screen shows. Use a one-shot query inside logic that needs a value now, like checking whether a row exists before a write.</p>`,
            code: `@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles ORDER BY id")
    fun observeAll(): Flow<List<ArticleEntity>>          // keeps emitting

    @Query("SELECT * FROM articles WHERE id = :id")
    suspend fun getById(id: Int): ArticleEntity?         // runs once

    @Query("SELECT * FROM articles WHERE id = :id")
    fun observeById(id: Int): Flow<ArticleEntity?>       // null while the row is missing
}`,
          },
          {
            title: 'Room watches tables, not rows',
            body: `
<p>Room knows which tables a query reads, not which rows. Any write to <code>articles</code> re-runs every Flow query on that table, even one that only reads the row with id 1. The query then emits again, often with the exact same value.</p>
<p>Usually that is cheap. When the collector does real work, like a redraw or a network call, add <code>distinctUntilChanged()</code> so equal results stop there. A <code>StateFlow</code> already does this for you.</p>`,
            code: `val article: Flow<ArticleEntity?> =
    dao.observeById(1)
        .distinctUntilChanged()   // drop results equal to the last one`,
            visual(el) {
              let rows, runs = 1, draws = 1, distinct = false, busy = false, t1 = 0;
              const body = h('div');
              const table = h('div', { class: 'arc-table' }, h('div', { class: 'arc-tname' }, 'table: articles'),
                h('div', { class: 'arc-tr arc-th' }, h('span', {}, 'id'), h('span', {}, 'title'), h('span', {}, 'edits')), body);
              const runBadge = h('span', { class: 'arc-badge' }), valChip = h('span', { class: 'token arc-back' });
              const drawBadge = h('span', { class: 'arc-badge' });
              const Q = node('observeById(1)', '<code>WHERE id = 1</code>', runBadge, valChip);
              const C = node('collector', 'redraws the detail screen', drawBadge);
              const filt = h('div', { class: 'arc-dir' });
              const o = out();
              const rowEl = new Map();
              function paint(mark) {
                rowEl.clear();
                body.replaceChildren(...rows.map(r => { const e = h('div', { class: 'arc-tr' + (mark === r.id ? ' changed' : '') }, h('span', {}, String(r.id)), h('span', {}, `"${r.title}"`), h('span', {}, String(r.n))); rowEl.set(r.id, e); return e; }));
                runBadge.textContent = `query ran ${runs}×`;
                drawBadge.textContent = `redrew ${draws}×`;
                valChip.textContent = `"${rows[0].title}"`;
                filt.textContent = distinct ? '↓ distinctUntilChanged()' : '↓';
              }
              async function write(id) {
                if (busy) return; busy = true;
                const r = rows.find(x => x.id === id), before = rows[0].title;
                r.n++;
                if (id === 1) r.title = ['Room 2.8', 'Room KMP', 'Room'][t1++ % 3];
                say(o, hl(`dao.update(article${id})`) + ` <span class="muted">// row ${id} changed</span>`);
                paint(id); replay(rowEl.get(id), 'pop-soft');
                await sleep(500); if (!el.isConnected) return;
                table.classList.add('inval');
                o.append(h('div', { class: 'line drop-in', html: '<span class="muted">table "articles" changed: re-run its queries</span>' }));
                await sleep(450); if (!el.isConnected) return;
                runs++; Q.classList.add('on'); paint(); replay(Q, 'pop');
                const same = rows[0].title === before;
                await sleep(450); if (!el.isConnected) return;
                Q.classList.remove('on'); table.classList.remove('inval');
                if (same && distinct) {
                  replay(filt, 'shake');
                  o.append(h('div', { class: 'line drop-in', html: '<span class="good">same result, dropped by distinctUntilChanged()</span>' }));
                } else {
                  draws++; C.classList.add(same ? 'bad' : 'ok'); paint(); replay(C, 'pop');
                  o.append(h('div', { class: 'line drop-in', html: same ? '<span class="bad">same result emitted again, the screen redrew for nothing</span>' : '<span class="good">row 1 really changed, the screen redrew</span>' }));
                  await sleep(500); if (!el.isConnected) return;
                  C.classList.remove('bad', 'ok');
                }
                busy = false;
              }
              const sw = switchEl('arc-d-distinct', '.distinctUntilChanged()', false, i => {
                if (busy) { i.checked = distinct; return; }
                distinct = i.checked; paint();
                say(o, distinct ? 'Equal results now stop before the collector.' : 'Every re-run reaches the collector again.');
              });
              rows = [{ id: 1, title: 'Room', n: 0 }, { id: 2, title: 'Flow', n: 0 }, { id: 3, title: 'KSP', n: 0 }];
              paint();
              say(o, 'The query only reads row 1. Update row 3 and watch it run anyway.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('dao.update(article3)', () => write(3)), cmd('dao.update(article1)', () => write(1)), sw),
                h('div', { class: 'arc-db' }, table, h('div', { class: 'arc-col' }, Q, filt, C)),
                o);
            },
          },
          {
            title: 'Group writes in one transaction',
            body: `
<p>Each DAO write is its own transaction, and Room notifies observers when a transaction ends. If you replace a list with <code>deleteAll()</code> and then <code>insertAll()</code>, an observer can see the empty table in between. The screen flashes its empty state.</p>
<p>Wrap related writes in a <code>@Transaction</code> DAO function, or in <code>db.withTransaction { }</code>. Observers then see one change, from the old rows straight to the new ones. If a write in the middle fails, the whole transaction rolls back.</p>`,
            code: `@Dao
abstract class ArticleDao {
    @Query("DELETE FROM articles")
    abstract suspend fun deleteAll()

    @Insert
    abstract suspend fun insertAll(rows: List<ArticleEntity>)

    @Transaction
    open suspend fun replaceAll(rows: List<ArticleEntity>) {
        deleteAll()
        insertAll(rows)
    }
}`,
            visual(el) {
              const SETS = [['Room', 'Flow', 'KSP'], ['Hilt', 'Paging', 'Coil'], ['Compose', 'DataStore', 'WorkManager']];
              let set = 0, tx = true, busy = false;
              const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'Screen preview' });
              const lane = h('div', { class: 'arc-lane' }, h('span', { class: 'arc-lane-name' }, 'emissions'));
              const o = out();
              const draw = (list, anim) => phone.replaceChildren(...(list.length
                ? list.map(t => h('div', { class: 'item arc-small' + (anim ? ' drop-in' : '') }, t))
                : [h('p', { class: 'phone-note pop' }, 'No articles yet.')]));
              const emit = (list) => {
                const toks = lane.querySelectorAll('.token');
                if (toks.length >= 5) toks[0].remove();
                lane.append(h('span', { class: `token drop-in ${list.length ? 'arc-back' : 'boom'}` }, `[${list.length}]`));
                draw(list, true); replay(phone, 'pop-soft');
              };
              const log = html => o.append(h('div', { class: 'line drop-in', html }));
              async function replace() {
                if (busy) return; busy = true;
                const next = SETS[(set = (set + 1) % SETS.length)];
                say(o, hl(tx ? 'dao.replaceAll(rows)  // @Transaction' : 'dao.deleteAll(); dao.insertAll(rows)'));
                const step = async html => { await sleep(500); if (!el.isConnected) return false; log(html); return true; };
                if (tx) {
                  if (!await step('BEGIN')) return;
                  if (!await step('DELETE FROM articles')) return;
                  if (!await step('INSERT INTO articles … (3 rows)')) return;
                  if (!await step('COMMIT <span class="muted">→ observers notified once</span>')) return;
                  await sleep(300); if (!el.isConnected) return;
                  emit(next);
                  log('<span class="good">one emission: the old list went straight to the new one</span>');
                } else {
                  if (!await step('DELETE FROM articles <span class="muted">→ commit, observers notified</span>')) return;
                  await sleep(250); if (!el.isConnected) return;
                  emit([]);
                  if (!await step('INSERT INTO articles … (3 rows) <span class="muted">→ commit, notified again</span>')) return;
                  await sleep(250); if (!el.isConnected) return;
                  emit(next);
                  log('<span class="bad">two emissions: the screen showed its empty state for a moment</span>');
                }
                busy = false;
              }
              const sw = switchEl('arc-d-tx', 'inside one @Transaction', true, i => {
                if (busy) { i.checked = tx; return; }
                tx = i.checked;
                say(o, tx ? 'Both writes run in one transaction again.' : 'Now each write commits on its own. Replace the list and watch the screen.');
              });
              draw(SETS[0]); lane.append(h('span', { class: 'token arc-back' }, '[3]'));
              say(o, 'Replace all rows. Then turn the transaction off and do it again.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('replaceAll(newRows)', replace), sw),
                h('div', { class: 'arc-udf' }, phone, h('div', { class: 'arc-col' }, lane, o)));
            },
          },
        ],
        underHood: {
          body: `
<p>KSP generates a class for every DAO and for the database, named like <code>ArticleDao_Impl</code> and <code>AppDatabase_Impl</code>. Each <code>@Query</code> becomes code that prepares the SQL statement, binds your arguments and reads each row’s columns into your entity’s constructor. Queries are checked against the schema while this code is generated, which is why a typo in a column name fails the build.</p>
<p>For Flow queries, Room registers the query’s table names with its <code>InvalidationTracker</code>. The tracker adds triggers to those tables that record each change in a small temporary table. When a write transaction ends, Room reads that record, finds the observers of the changed tables and re-runs their queries. That is the whole mechanism: table-level change tracking, with no knowledge of rows.</p>`,
          code: `// Simplified shape of the generated code, not the exact source
class ArticleDao_Impl(private val db: RoomDatabase) : ArticleDao {
    override fun observeAll(): Flow<List<ArticleEntity>> =
        db.createFlow(tables = arrayOf("articles")) {        // re-run when "articles" changes
            db.query("SELECT * FROM articles ORDER BY id") { row ->
                ArticleEntity(row.getInt("id"), row.getText("title"), row.getInt("read") != 0)
            }
        }

    override suspend fun insert(article: ArticleEntity) =
        db.writeTransaction { insertAdapter.insert(article) }   // off the main thread
}`,
        },
        mistakes: [
          {
            title: 'Building the database more than once',
            bad: `class NewsRepository(context: Context) {
    private val db = Room.databaseBuilder(context, AppDatabase::class.java, "news.db").build()
}`,
            good: `@Provides @Singleton
fun provideDb(@ApplicationContext context: Context): AppDatabase =
    Room.databaseBuilder(context, AppDatabase::class.java, "news.db").build()`,
            why: 'Each instance has its own invalidation tracker. A write through one instance doesn’t wake Flows from another, so screens go stale. Build one database for the app.',
          },
          {
            title: 'A field type Room can’t store',
            bad: `@Entity
data class ArticleEntity(
    @PrimaryKey val id: Int,
    val tags: List<String>,
)`,
            good: `class Converters {
    @TypeConverter fun fromTags(tags: List<String>): String = Json.encodeToString(tags)
    @TypeConverter fun toTags(value: String): List<String> = Json.decodeFromString(value)
}

@Database(entities = [ArticleEntity::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase()`,
            why: 'The build fails with “Cannot figure out how to save this field into database”. A <code>@TypeConverter</code> maps it to a column type. If you need to query by tag, use a separate table instead.',
          },
        ],
        visual(el) {
          const pool = ['Hilt', 'Retrofit', 'Paging', 'DataStore', 'WorkManager', 'Compose', 'Coil'];
          let rows = [{ id: 1, title: 'Room', read: false }, { id: 2, title: 'Flow', read: true }, { id: 3, title: 'KSP', read: false }];
          let nextId = 4, p = 0, busy = false, nAll = 1, nCount = 1;
          const body = h('div');
          const table = h('div', { class: 'arc-table' }, h('div', { class: 'arc-tname' }, 'table: articles'),
            h('div', { class: 'arc-tr arc-th' }, h('span', {}, 'id'), h('span', {}, 'title'), h('span', {}, 'read')), body);
          const allList = h('div', { class: 'arc-mini' });
          const allBadge = h('span', { class: 'arc-badge' });
          const cnt = h('span', { class: 'chip total' });
          const cntBadge = h('span', { class: 'arc-badge' });
          const obsAll = node('observeAll()', '<code>.collect { list -> … }</code>', allBadge, allList);
          const obsCnt = node('observeUnreadCount()', '<code>.collect { n -> … }</code>', cntBadge, cnt);
          const o = out();
          const rowEl = new Map();
          function paintTable(mark = {}) {
            rowEl.clear();
            body.replaceChildren(...(rows.length ? rows.map(r => {
              const e = h('div', { class: 'arc-tr' + (mark[r.id] ? ' ' + mark[r.id] : '') }, h('span', {}, String(r.id)), h('span', {}, `"${r.title}"`), h('span', {}, r.read ? '1' : '0'));
              rowEl.set(r.id, e); return e;
            }) : [h('div', { class: 'arc-empty' }, 'No rows. Insert one.')]));
          }
          function paintObs(hot) {
            allList.replaceChildren(...(rows.length ? rows.map(r => h('span', {}, `${r.read ? '✓' : '•'} ${r.title}`)) : [h('span', {}, '(empty list)')]));
            const unread = rows.filter(r => !r.read).length;
            const same = cnt.textContent === String(unread);
            cnt.textContent = String(unread);
            allBadge.textContent = `emission #${nAll}`; cntBadge.textContent = `emission #${nCount}${hot && same ? ' · same value' : ''}`;
            allBadge.classList.toggle('hot', !!hot); cntBadge.classList.toggle('hot', !!hot);
            if (hot) { replay(obsAll, 'pop'); replay(obsCnt, 'pop'); }
          }
          async function write(sql, change, mark) {
            if (busy) return; busy = true;
            say(o, hl(sql));
            change();
            paintTable(mark);
            const e = mark && rowEl.get(+Object.keys(mark)[0]);
            if (e) replay(e, 'drop-in');
            await sleep(450); if (!el.isConnected) return;
            table.classList.add('inval'); replay(table, 'pop-soft');
            o.append(h('div', { class: 'line drop-in', html: hl('// Room: table "articles" changed, re-running 2 queries') }));
            await sleep(450); if (!el.isConnected) return;
            nAll++; nCount++; paintObs(true);
            await sleep(500); if (!el.isConnected) return;
            table.classList.remove('inval'); paintTable();
            busy = false;
          }
          const insert = () => {
            const t = pool[p++ % pool.length], id = nextId++;
            write(`dao.insert(ArticleEntity(${id}, "${t}"))`, () => rows.push({ id, title: t, read: false }), { [id]: 'added' });
          };
          const markRead = () => {
            if (busy) return;
            const r = rows.find(x => !x.read);
            if (!r) { replay(table, 'shake'); say(o, '<span class="muted">Every row is already read. Insert one first.</span>'); return; }
            write(`dao.update(article${r.id}.copy(read = true))`, () => { r.read = true; }, { [r.id]: 'changed' });
          };
          const del = async () => {
            if (busy) return;
            const r = rows[rows.length - 1];
            if (!r) { replay(table, 'shake'); say(o, '<span class="muted">The table is empty. Insert a row first.</span>'); return; }
            busy = true;
            const e = rowEl.get(r.id); e.classList.add('leave');
            await sleep(420); if (!el.isConnected) return;
            busy = false;
            write(`dao.delete(article${r.id})`, () => { rows = rows.filter(x => x !== r); });
          };
          const dup = () => {
            if (busy) return;
            const r = rows[0];
            if (!r) { replay(table, 'shake'); say(o, '<span class="muted">The table is empty, so there is no id to clash with.</span>'); return; }
            paintTable({ [r.id]: 'bad' }); replay(rowEl.get(r.id), 'shake');
            say(o, `<span class="bad">SQLiteConstraintException:</span> UNIQUE constraint failed: articles.id <span class="muted">// nothing was written, so nothing emits</span>`);
          };
          paintTable(); paintObs(false);
          say(o, 'Both observers are collecting. Change the table and watch them re-emit.');
          el.append(
            h('div', { class: 'arc-db' }, table, h('div', { class: 'arc-col' }, obsAll, obsCnt)),
            h('div', { class: 'controls arc-fit' },
              cmd('dao.insert(…)', insert),
              cmd('dao.update(it.copy(read = true))', markRead),
              cmd('dao.delete(last)', del),
              cmd('dao.insert(ArticleEntity(1, "Dup"))', dup)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'relations',
        title: 'Room relations',
        tagline: 'Tables stay flat. Your objects come back nested.',
        level: 'intermediate',
        body: `
<p>SQL tables are flat, but your screens want an author with their books, or a book with its tags. Room builds those nested objects for you. You write a plain data class that is not an entity, put the parent in it with <code>@Embedded</code>, and describe the children with <code>@Relation</code>.</p>
<p>One-to-many needs a foreign key column on the child, like <code>authorId</code> on <code>Book</code>. Many-to-many needs a third table, a cross-reference with one row per pair, and <code>associateBy = Junction(...)</code> on the relation.</p>
<p>Room loads a relation with more than one query: the parents first, then the children <code>WHERE id IN (...)</code>. Mark the DAO function <code>@Transaction</code> so all queries read the same snapshot. Run the queries below and watch the rows turn into objects.</p>`,
        code: `@Entity(tableName = "authors")
data class Author(@PrimaryKey val authorId: Long, val name: String)

@Entity(
    tableName = "books",
    foreignKeys = [
        ForeignKey(
            entity = Author::class,
            parentColumns = ["authorId"],
            childColumns = ["authorId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("authorId")],
)
data class Book(@PrimaryKey val bookId: Long, val authorId: Long, val title: String)

@Entity(tableName = "tags")
data class Tag(@PrimaryKey val tagId: Long, val label: String)

@Entity(tableName = "book_tag", primaryKeys = ["bookId", "tagId"], indices = [Index("tagId")])
data class BookTagCrossRef(val bookId: Long, val tagId: Long)

// one-to-many
data class AuthorWithBooks(
    @Embedded val author: Author,
    @Relation(parentColumn = "authorId", entityColumn = "authorId")
    val books: List<Book>,
)

// many-to-many through the cross-ref table
data class BookWithTags(
    @Embedded val book: Book,
    @Relation(
        parentColumn = "bookId",
        entityColumn = "tagId",
        associateBy = Junction(BookTagCrossRef::class),
    )
    val tags: List<Tag>,
)

@Dao
interface LibraryDao {
    @Transaction
    @Query("SELECT * FROM authors")
    fun observeAuthorsWithBooks(): Flow<List<AuthorWithBooks>>

    @Transaction
    @Query("SELECT * FROM books")
    fun observeBooksWithTags(): Flow<List<BookWithTags>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun tag(ref: BookTagCrossRef)
}`,
        remember: '@Embedded the parent, @Relation the children, a Junction for many-to-many, @Transaction on the query.',
        terms: [
          { term: '@Relation', def: 'A Room annotation on a field of a result class that loads related entities by matching a parent column to an entity column.' },
          { term: '@Embedded', def: 'A Room annotation that flattens the fields of another class into the same row or result object.' },
          { term: 'Junction', def: 'The cross-reference table a many-to-many @Relation goes through, given as associateBy = Junction(...).' },
          { term: '@Transaction', def: 'A Room annotation that runs every query of a DAO function inside one database transaction.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Return each author with their books.', code: 'data class AuthorWithBooks(\n    @[[Embedded]] val author: Author,\n    @[[Relation]](parentColumn = "authorId", entityColumn = "authorId")\n    val books: List<Book>,\n)', why: '<code>@Embedded</code> puts the author columns in the object. <code>@Relation</code> loads every book whose <code>authorId</code> matches.' },
          { type: 'bug', prompt: 'This many-to-many relation does not compile. Tap the line.', code: 'data class BookWithTags(\n    @Embedded val book: Book,\n    @Relation(\n        parentColumn = "bookId",\n        entityColumn = "bookId",\n        associateBy = Junction(BookTagCrossRef::class),\n    )\n    val tags: List<Tag>,\n)', bug: 4, fix: '        entityColumn = "tagId",', why: '<code>entityColumn</code> names the key on the entity you collect, here <code>Tag</code>. <code>Tag</code> has no <code>bookId</code> column, so Room reports an error at build time.' },
        ],
        quiz: [
          { q: 'Why mark a DAO function that returns <code>AuthorWithBooks</code> with <code>@Transaction</code>?', options: ['Room needs it to write rows', 'Room runs several queries for it, and the transaction keeps them on one consistent snapshot', 'It makes the query run on the main thread'], a: 1, why: 'Parents and children come from separate queries. Without a transaction a write could land between them.' },
          { q: 'What do you need to model "a book has many tags, a tag has many books"?', options: ['A list column on <code>Book</code>', 'A cross-reference entity with one row per (bookId, tagId) pair', 'Two <code>@Embedded</code> fields'], a: 1, why: 'Many-to-many needs a junction table. The relation uses <code>associateBy = Junction(BookTagCrossRef::class)</code>.' },
          { q: 'Is <code>AuthorWithBooks</code> an <code>@Entity</code>?', options: ['Yes, Room creates a table for it', 'No, it is a result class Room fills from existing tables'], a: 1, why: 'Relation classes are read models. The data stays in the flat <code>authors</code> and <code>books</code> tables.' },
          { q: 'You load 200 authors, then call <code>dao.booksFor(author.id)</code> for each one in a loop. How many queries run, compared with an @Relation?', options: ['201 with the loop, 2 with @Relation', '200 with both', '2 with both, SQLite merges them'], a: 0, why: 'The loop is one query for the parents plus one per parent: N+1. @Relation collects all keys and loads every child with one IN (…) query.' },
          { q: 'When a user deletes their account, their comments should stay and show as “anonymous”. Which foreign key action fits Comment.userId?', options: ['CASCADE', 'SET_NULL, with a nullable userId', 'NO_ACTION, the default'], a: 1, why: 'SET_NULL keeps the child rows and clears the key. CASCADE would delete the comments, and NO_ACTION would make the user delete fail.' },
        ],
        deeper: [
          {
            title: 'Why @Relation beats a loop: the N+1 query trap',
            body: `
<p>Without <code>@Relation</code>, the natural code loads the authors and then asks for each author’s books in a loop. That is one query for the parents plus one per parent: N+1. With 200 authors it is 201 round trips through SQLite, and the cost grows with every row.</p>
<p>Room’s relation code does it in two queries, however many parents there are. It collects all parent keys and loads every matching child with one <code>IN (…)</code> query, then groups the children by key. Change the number of authors and compare.</p>`,
            code: `// N + 1: one query for the authors, then one per author
suspend fun loadSlow(): List<AuthorWithBooks> =
    dao.getAuthors().map { AuthorWithBooks(it, dao.getBooksBy(it.authorId)) }

// @Relation: two queries in total
@Transaction
@Query("SELECT * FROM authors")
suspend fun getAuthorsWithBooks(): List<AuthorWithBooks>`,
            visual(el) {
              let loop = true, n = 3, busy = false;
              const log = h('div', { class: 'dt-d2-log', 'aria-live': 'polite' });
              const count = h('span', { class: 'arc-badge' }, 'queries: 0');
              const o = out();
              const q = (html, cls = '') => { const d = h('div', { class: 'drop-in ' + cls, html }); log.append(d); return d; };
              async function run() {
                if (busy) return; busy = true;
                log.replaceChildren(); count.textContent = 'queries: 0';
                let total = 0;
                const bump = () => { total++; count.textContent = `queries: ${total}`; };
                say(o, `<span class="muted">loading ${n} authors with their books…</span>`);
                q(hl('SELECT * FROM authors')); bump();
                await sleep(260); if (!o.isConnected) return;
                if (loop) {
                  const shown = Math.min(n, 4);
                  for (let i = 1; i <= shown; i++) {
                    q(hl(`SELECT * FROM books WHERE authorId = ${i}`)); bump();
                    await sleep(220); if (!o.isConnected) return;
                  }
                  if (n > shown) {
                    q(`… ${n - shown} more, one per author`, 'dt-d2-more');
                    for (let i = shown; i < n; i++) { bump(); if (i % 20 === 0) { await sleep(30); if (!o.isConnected) return; } }
                  }
                  replay(count, 'shake');
                  say(o, `<span class="bad">${total} queries</span> for ${n} authors. Each one is a separate trip into SQLite, and the number grows with the table.`);
                } else {
                  const keys = n <= 4 ? Array.from({ length: n }, (_, i) => i + 1).join(', ') : `1, 2, 3, … ${n}`;
                  q(hl(`SELECT * FROM books WHERE authorId IN (${keys})`)); bump();
                  replay(count, 'pop');
                  say(o, `<span class="good">${total} queries</span> for ${n} authors. Room grouped the books by authorId in memory.`);
                }
                busy = false;
              }
              const sizes = [3, 200].map(v => act(`${v} authors`, function () { if (busy) return; n = v; press(sizes, this); run(); }));
              press(sizes, sizes[0]);
              const sw = switchEl('dt-d2-rel-loop', 'loop: one query per author', true, i => {
                if (busy) { i.checked = loop; return; }
                loop = i.checked; run();
              });
              [hl('SELECT * FROM authors'), hl('SELECT * FROM books WHERE authorId = 1'), hl('SELECT * FROM books WHERE authorId = 2'), hl('SELECT * FROM books WHERE authorId = 3')].forEach(x => log.append(h('div', { html: x })));
              count.textContent = 'queries: 4';
              say(o, '4 queries for 3 authors with the loop. Try 200 authors, then turn the loop off.');
              el.append(h('div', { class: 'controls' }, sizes, sw, count), log, o);
            },
          },
          {
            title: 'What a delete does: CASCADE, NO_ACTION, SET_NULL',
            body: `
<p>A foreign key says what happens to the books when their author row is deleted. <code>CASCADE</code> deletes them too. <code>SET_NULL</code> keeps them and clears <code>authorId</code>, which must then be nullable. The default, <code>NO_ACTION</code>, refuses: the delete fails with <code>SQLiteConstraintException</code> while any book still points at the author.</p>
<p>Pick the rule from the domain. Books of a deleted author should go away: <code>CASCADE</code>. Comments of a deleted user might stay as “anonymous”: <code>SET_NULL</code>. Data that must never be orphaned: keep the default and delete children first.</p>`,
            code: `@Entity(
    tableName = "books",
    foreignKeys = [
        ForeignKey(
            entity = Author::class,
            parentColumns = ["authorId"],
            childColumns = ["authorId"],
            onDelete = ForeignKey.SET_NULL,   // or CASCADE; the default is NO_ACTION
        ),
    ],
    indices = [Index("authorId")],
)
data class Book(@PrimaryKey val bookId: Long, val authorId: Long?, val title: String)`,
            visual(el) {
              const MODES = { CASCADE: 'CASCADE', NO_ACTION: 'NO_ACTION (default)', SET_NULL: 'SET_NULL' };
              let mode = 'CASCADE', busy = false, authors, books;
              const aBody = h('div'), bBody = h('div');
              const aT = h('div', { class: 'dt-table', style: '--dt-cols: 2.5em minmax(0, 1fr)' }, h('div', { class: 'dt-tname' }, 'authors'),
                h('div', { class: 'dt-tr dt-th' }, h('span', {}, 'id'), h('span', {}, 'name')), aBody);
              const bT = h('div', { class: 'dt-table', style: '--dt-cols: 2.5em 5.6em minmax(0, 1fr)' }, h('div', { class: 'dt-tname' }, 'books'),
                h('div', { class: 'dt-tr dt-th' }, h('span', {}, 'id'), h('span', {}, 'authorId'), h('span', {}, 'title')), bBody);
              const o = out();
              const reset = () => { authors = [[1, 'Le Guin'], [2, 'Herbert']]; books = [[10, 1, 'Earthsea'], [11, 1, 'The Dispossessed'], [12, 2, 'Dune']]; };
              const rowsA = {}, rowsB = {};
              function paint() {
                aBody.replaceChildren(...authors.map(([id, name]) => (rowsA[id] = h('div', { class: 'dt-tr' }, h('span', {}, String(id)), h('span', {}, name)))));
                bBody.replaceChildren(...books.map(([id, a, t]) => (rowsB[id] = h('div', { class: 'dt-tr' }, h('span', {}, String(id)), h('span', { class: a == null ? 'dt-newcol' : null }, a == null ? 'NULL' : String(a)), h('span', {}, t)))));
              }
              async function del() {
                if (busy) return;
                if (!authors.some(a => a[0] === 1)) { say(o, 'Author 1 is already gone. Press restore rows.'); return; }
                busy = true; paint();
                rowsA[1].classList.add('dt-hot');
                say(o, `${hl('dao.delete(author1)')} <span class="muted">// onDelete = ${mode}</span>`);
                await sleep(550); if (!o.isConnected) return;
                const kids = books.filter(b => b[1] === 1).map(b => b[0]);
                if (mode === 'NO_ACTION') {
                  kids.forEach(id => rowsB[id].classList.add('dt-hot'));
                  replay(aT, 'shake');
                  o.append(h('div', { class: 'line drop-in', html: '<span class="bad">SQLiteConstraintException:</span> FOREIGN KEY constraint failed (code 787 SQLITE_CONSTRAINT_FOREIGNKEY)' }));
                  o.append(h('div', { class: 'line drop-in', html: '<span class="muted">nothing was deleted: books 10 and 11 still point at author 1</span>' }));
                  await sleep(700); if (!o.isConnected) return;
                  paint(); busy = false; return;
                }
                rowsA[1].classList.add('leave');
                if (mode === 'CASCADE') kids.forEach(id => rowsB[id].classList.add('leave'));
                await sleep(420); if (!o.isConnected) return;
                authors = authors.filter(a => a[0] !== 1);
                books = mode === 'CASCADE' ? books.filter(b => b[1] !== 1) : books.map(b => (b[1] === 1 ? [b[0], null, b[2]] : b));
                paint();
                if (mode === 'SET_NULL') kids.forEach(id => { rowsB[id].classList.add('dt-new'); replay(rowsB[id], 'pop-soft'); });
                o.append(h('div', { class: 'line drop-in', html: mode === 'CASCADE'
                  ? '<span class="good">CASCADE:</span> SQLite deleted books 10 and 11 in the same statement.'
                  : '<span class="good">SET_NULL:</span> the books stay, now with authorId = NULL.' }));
                busy = false;
              }
              const modeBtns = Object.keys(MODES).map(m => act(MODES[m], function () {
                if (busy) return; mode = m; press(modeBtns, this); reset(); paint();
                say(o, `onDelete = ${m}. Now delete author 1.`);
              }));
              const restore = act('restore rows', () => { if (busy) return; reset(); paint(); say(o, 'Rows restored.'); });
              reset(); paint(); press(modeBtns, modeBtns[0]);
              say(o, 'Pick an onDelete rule, then delete Le Guin.');
              el.append(h('div', { class: 'controls' }, modeBtns), h('div', { class: 'controls' }, cmd('dao.delete(author1)', del), restore), h('div', { class: 'dt-tables' }, aT, bT), o);
            },
          },
          {
            title: 'Nested relations and projections',
            body: `
<p>A relation can contain another relation. To load authors with their books and each book’s tags, make the child type <code>BookWithTags</code> and tell Room which table to read with <code>entity = Book::class</code>. Room runs one more query per level, still not one per row.</p>
<p>When the screen needs only one column, <code>projection</code> loads just that column into a list of plain values.</p>`,
            code: `data class AuthorWithBooksAndTags(
    @Embedded val author: Author,
    @Relation(
        entity = Book::class,          // the table behind BookWithTags
        parentColumn = "authorId",
        entityColumn = "authorId",
    )
    val books: List<BookWithTags>,     // itself a relation class
)

data class AuthorWithTitles(
    @Embedded val author: Author,
    @Relation(
        entity = Book::class,
        parentColumn = "authorId",
        entityColumn = "authorId",
        projection = ["title"],
    )
    val titles: List<String>,
)`,
          },
        ],
        underHood: {
          body: `
<p>For each <code>@Relation</code>, Room’s annotation processor generates a helper in the DAO implementation. After the parent query, it puts every parent key into a map, binds the keys into one <code>SELECT … WHERE authorId IN (?, ?, …)</code>, and adds each child row to the list under its key. If there are more than 999 keys, the old SQLite limit for bound variables, it splits them into batches of 999.</p>
<p>Foreign keys are enforced by SQLite, not by Room. SQLite leaves them off by default, so when your entities declare foreign keys, Room turns them on with <code>PRAGMA foreign_keys = ON</code> each time it opens the database. That is why <code>CASCADE</code> and the <code>NO_ACTION</code> error work without any code of yours.</p>`,
        },
        mistakes: [
          {
            title: 'No index on the foreign key column',
            bad: `@Entity(
    foreignKeys = [ForeignKey(Author::class, ["authorId"], ["authorId"], onDelete = ForeignKey.CASCADE)],
)
data class Book(@PrimaryKey val bookId: Long, val authorId: Long, val title: String)`,
            good: `@Entity(
    foreignKeys = [ForeignKey(Author::class, ["authorId"], ["authorId"], onDelete = ForeignKey.CASCADE)],
    indices = [Index("authorId")],
)
data class Book(@PrimaryKey val bookId: Long, val authorId: Long, val title: String)`,
            why: 'Without an index, every delete of an author and every relation query scans the whole books table. Room warns about it at build time; read the warning.',
          },
          {
            title: 'Loading every child, then filtering in Kotlin',
            bad: `val result = dao.getAuthorsWithBooks().map { a ->
    a.copy(books = a.books.filter { it.published })
}`,
            good: `@Query("""
    SELECT * FROM authors
    JOIN books ON books.authorId = authors.authorId
    WHERE books.published = 1
""")
fun observePublished(): Flow<Map<Author, List<Book>>>`,
            why: '<code>@Relation</code> always loads all children. A JOIN with a multimap return type lets SQLite filter. Note that an inner join drops authors with no published books.',
          },
          {
            title: 'A list column instead of a cross-reference table',
            bad: `@Entity
data class Book(@PrimaryKey val bookId: Long, val title: String, val tagIds: List<Long>)
// stored as "3,7,9" through a TypeConverter`,
            good: `@Entity(primaryKeys = ["bookId", "tagId"], indices = [Index("tagId")])
data class BookTagCrossRef(val bookId: Long, val tagId: Long)`,
            why: 'SQLite sees one text value. You can’t index it, join on it or ask “which books have tag 7” without scanning and parsing every row, and nothing stops ids of deleted tags.',
          },
        ],
        visual(el) {
          const authors = [[1, 'Le Guin'], [2, 'Herbert']];
          const books = [[10, 1, 'Earthsea'], [11, 1, 'The Dispossessed'], [12, 2, 'Dune']];
          const tags = [[1, 'fantasy'], [2, 'sci-fi'], [3, 'classic']];
          let refs = [[10, 1], [10, 3], [11, 2], [12, 2]];
          const C2 = '2.2em minmax(0, 1fr)', C3 = '2.2em 2.6em minmax(0, 1fr)';
          function mkTable(name, heads, cols) {
            const body = h('div');
            const rows = new Map();
            const el2 = h('div', { class: 'dt-table' }, h('div', { class: 'dt-tname' }, name),
              h('div', { class: 'dt-tr dt-th', style: `--dt-cols:${cols}` }, heads.map(x => h('span', {}, x))), body);
            return {
              el: el2, rows,
              set(list, key = r => r[0]) {
                rows.clear();
                body.replaceChildren(...list.map(r => { const e = h('div', { class: 'dt-tr', style: `--dt-cols:${cols}` }, r.map(c => h('span', {}, String(c)))); rows.set(key(r), e); return e; }));
              },
              hot(keys) { rows.forEach((e, k) => e.classList.toggle('dt-hot', keys.includes(k))); },
            };
          }
          const tA = mkTable('authors', ['id', 'name'], C2);
          const tB = mkTable('books', ['id', 'aut', 'title'], C3);
          const tR = mkTable('book_tag', ['book', 'tag'], 'minmax(0, 1fr) minmax(0, 1fr)');
          const tT = mkTable('tags', ['id', 'label'], C2);
          const refKey = r => r.join('-');
          tA.set(authors); tB.set(books); tT.set(tags); tR.set(refs, refKey);
          const res = h('div', { class: 'dt-results' });
          const o = out();
          let busy = false, last = null;
          const tagsOf = id => refs.filter(r => r[0] === id).map(r => tags.find(t => t[0] === r[1]));
          const coolAll = () => [tA, tB, tR, tT].forEach(t => t.hot([]));
          const card = (name, embedded, rel, kids, fresh) => h('div', { class: 'obj' + (fresh ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, name),
            h('span', { class: 'field', html: `${hl('@Embedded')} ${embedded}` }),
            h('span', { class: 'field', html: `${hl('@Relation')} ${rel} =` }),
            h('div', { class: 'dt-nest' }, kids.length ? kids.map(k => h('span', { class: 'dt-mini' }, k)) : h('span', { class: 'dt-mini' }, 'empty list')));
          async function authorsWithBooks(fast) {
            const d = fast ? 120 : 1;
            res.replaceChildren(); coolAll();
            say(o, hl('SELECT * FROM authors'));
            tA.hot(authors.map(a => a[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            line(o, hl('SELECT * FROM books WHERE authorId IN (1, 2)'));
            tB.hot(books.map(b => b[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            for (const [id, name] of authors) {
              const mine = books.filter(b => b[1] === id);
              tA.hot([id]); tB.hot(mine.map(b => b[0]));
              res.append(card('AuthorWithBooks', `author = Author(${id}, "${name}")`, 'books', mine.map(b => b[2]), true));
              await sleep(fast ? d : 650); if (!o.isConnected) return;
            }
            coolAll();
            line(o, '<span class="good">emit</span> List&lt;AuthorWithBooks&gt; <span class="muted">// 2 queries, 1 transaction</span>');
          }
          async function booksWithTags(fast, changed) {
            res.replaceChildren(); coolAll();
            say(o, hl('SELECT * FROM books'));
            tB.hot(books.map(b => b[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            line(o, hl('SELECT tags.*, j.bookId FROM book_tag j JOIN tags ON tags.tagId = j.tagId WHERE j.bookId IN (10, 11, 12)'));
            tR.hot(refs.map(refKey)); tT.hot(tags.map(t => t[0]));
            await sleep(fast ? 150 : 600); if (!o.isConnected) return;
            for (const [id, , title] of books) {
              const mine = tagsOf(id);
              tB.hot([id]); tR.hot(refs.filter(r => r[0] === id).map(refKey)); tT.hot(mine.map(t => t[0]));
              const c = card('BookWithTags', `book = Book(${id}, "${title}")`, 'tags', mine.map(t => t[1]), !fast || id === changed);
              res.append(c);
              if (fast && id === changed) replay(c, 'pop');
              await sleep(fast ? 120 : 650); if (!o.isConnected) return;
            }
            coolAll();
            line(o, '<span class="good">emit</span> List&lt;BookWithTags&gt; <span class="muted">// via the book_tag junction</span>');
          }
          const go = (fn, which, btn) => async () => {
            if (busy) return; busy = true; press(qBtns, btn); last = which;
            await fn(false);
            busy = false;
          };
          const b1 = cmd('dao.observeAuthorsWithBooks()', () => go(authorsWithBooks, 'a', b1)());
          const b2 = cmd('dao.observeBooksWithTags()', () => go(booksWithTags, 'b', b2)());
          const qBtns = [b1, b2];
          const b3 = cmd('dao.tag(BookTagCrossRef(12, 3))', async () => {
            if (busy) return; busy = true;
            const has = refs.some(r => r[0] === 12 && r[1] === 3);
            if (has) {
              tR.rows.get('12-3').classList.add('leave');
              await sleep(420); if (!o.isConnected) return;
              refs = refs.filter(r => !(r[0] === 12 && r[1] === 3));
              tR.set(refs, refKey);
            } else {
              refs = [...refs, [12, 3]];
              tR.set(refs, refKey);
              const e = tR.rows.get('12-3'); e.classList.add('dt-new'); replay(e, 'drop-in');
            }
            b3.innerHTML = hl(has ? 'dao.tag(BookTagCrossRef(12, 3))' : 'dao.untag(BookTagCrossRef(12, 3))');
            say(o, `${hl(has ? 'DELETE FROM book_tag WHERE bookId = 12 AND tagId = 3' : 'INSERT OR IGNORE INTO book_tag VALUES (12, 3)')} <span class="muted">// table changed, observers re-run</span>`);
            await sleep(700); if (!o.isConnected) return;
            press(qBtns, b2); last = 'b';
            await booksWithTags(true, 12);
            busy = false;
          });
          el.append(
            h('div', { class: 'dt-tables' }, tA.el, tB.el, tR.el, tT.el),
            h('div', { class: 'controls' }, b1, b2, b3),
            res, o);
          // open with the one-to-many result already built
          press(qBtns, b1); last = 'a';
          for (const [id, name] of authors) res.append(card('AuthorWithBooks', `author = Author(${id}, "${name}")`, 'books', books.filter(b => b[1] === id).map(b => b[2]), false));
          say(o, 'Four flat tables. Run a query to see Room assemble the nested objects.');
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'migrations',
        title: 'Room migrations',
        tagline: 'Change the schema without losing anyone’s data.',
        level: 'advanced',
        body: `
<p>Users keep their database file when they update your app. When you add a column or table, you raise <code>version</code> in <code>@Database</code> and tell Room how to turn the old file into the new shape. That recipe is a migration.</p>
<p>For simple changes like a new column, an <code>AutoMigration(from = 1, to = 2)</code> lets Room write the SQL by comparing exported schema files. For renames or data changes you write a <code>Migration(1, 2)</code> with your own <code>execSQL</code> calls. Export schemas (the Room Gradle plugin's <code>schemaDirectory</code>) and commit them.</p>
<p>If Room finds no path from the old version, it throws on open, so the app crashes on launch. <code>fallbackToDestructiveMigration</code> with <code>dropAllTables = true</code> avoids the crash by deleting everything, which is fine for a pure cache and a disaster for user data. Pick a strategy below and install the update.</p>`,
        code: `@Database(
    entities = [Article::class],
    version = 3,
    autoMigrations = [AutoMigration(from = 1, to = 2)],   // 1 → 2 added a column: Room writes the SQL
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}

// 2 → 3 changes data, not only shape: write it yourself
val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE articles ADD COLUMN slug TEXT NOT NULL DEFAULT ''")
        db.execSQL("UPDATE articles SET slug = lower(replace(title, ' ', '-'))")
    }
}

val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_2_3)
    // .fallbackToDestructiveMigration(dropAllTables = true)  // only when the data is a throwaway cache
    .build()

// build.gradle.kts: export schemas so AutoMigration can diff them, and test with MigrationTestHelper
room { schemaDirectory("$projectDir/schemas") }`,
        remember: 'Changed the schema? Bump the version and ship a migration. No path means a crash on launch.',
        terms: [
          { term: 'Migration', def: 'A Room class that upgrades a database file from one version number to another with SQL you write.' },
          { term: 'AutoMigration', def: 'A migration Room generates at build time by comparing two exported schema JSON files.' },
          { term: 'Destructive migration', def: 'A fallback that drops and recreates the tables when no migration path exists, deleting all rows.' },
          { term: 'Schema export', def: 'JSON files Room writes for each database version, used by AutoMigration and migration tests.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a <code>read</code> column without losing rows.', code: 'val MIGRATION_1_2 = object : [[Migration]](1, 2) {\n    override fun migrate(db: SupportSQLiteDatabase) {\n        db.[[execSQL]]("ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0")\n    }\n}', why: 'A <code>Migration</code> takes the start and end versions. Inside, <code>execSQL</code> runs the schema change on the existing file.' },
          { type: 'bug', prompt: '<code>Article</code> just gained a <code>read</code> field and <code>MIGRATION_1_2</code> adds the column. Users who update crash on launch. Tap the line.', code: '@Database(\n    entities = [Article::class],\n    version = 1,\n)\nabstract class AppDatabase : RoomDatabase()\n\nval db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")\n    .addMigrations(MIGRATION_1_2)\n    .build()', bug: 2, fix: '    version = 2,', why: 'Room only runs migrations when the version goes up. With the schema changed and the version still 1, Room sees a hash mismatch and throws "Room cannot verify the data integrity".' },
        ],
        quiz: [
          { q: 'You ship version 2 of the schema with no migration and no fallback. A user updates. What happens?', options: ['Room adds the column for you', 'The app crashes when it opens the database', 'Room silently deletes the old data'], a: 1, why: 'Room throws <code>IllegalStateException</code>: a migration from 1 to 2 was required but not found.' },
          { q: 'When is <code>fallbackToDestructiveMigration</code> acceptable?', options: ['Always, it is the simplest option', 'When the database is a cache you can refetch from the server', 'Never, it does not compile'], a: 1, why: 'It deletes every row. That is fine for data you can download again, never for notes, drafts or settings.' },
          { q: 'What does <code>AutoMigration</code> need to work?', options: ['Exported schema files for both versions', 'Network access at build time', 'A <code>@Transaction</code> on every DAO'], a: 0, why: 'Room diffs the exported JSON schemas. Without <code>exportSchema</code> and a schema directory there is nothing to compare.' },
          { q: 'Your app is at schema version 4. You deleted MIGRATION_2_3 because it is old. Which users crash on update?', options: ['None, Room skips the gap', 'Users still on version 2', 'Users on version 1 and 2'], a: 1, why: 'Room needs a path from the file’s version to the new one. Version 2 now has no step to 3, so opening fails. Keep every migration you shipped.' },
          { q: 'You rename the column title to headline and use an AutoMigration(from = 3, to = 4). What happens?', options: ['Room renames it and keeps the data', 'The build fails until you add an AutoMigrationSpec with @RenameColumn', 'The old column is dropped and a new empty one is added'], a: 1, why: 'Room cannot tell a rename from a delete plus an add, and guessing wrong would lose data. The spec tells it what happened.' },
          { q: 'A manual Migration runs <code>ALTER TABLE article ADD COLUMN views INTEGER NOT NULL</code>. What happens on users’ phones?', options: ['Existing rows get 0', 'Existing rows get NULL', 'SQLite refuses and the app crashes on launch'], a: 2, why: 'Existing rows need a value for a NOT NULL column. Add DEFAULT 0 in SQL and declare the same default on the entity so validation passes.' },
        ],
        deeper: [
          {
            title: 'Migrations chain from any old version',
            body: `
<p>Users skip updates. One phone is on version 1, another on version 3, and both install the build with version 4. Room looks for a path from the file’s version to the new one. At each step it takes the migration that starts at the current version and jumps the furthest without passing the target.</p>
<p>So you keep every migration you ever shipped. Remove <code>MIGRATION_2_3</code> and every user still on version 2 crashes, even if version 1 users are fine through a direct <code>MIGRATION_1_3</code>.</p>`,
            code: `Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_1_2, MIGRATION_2_3, MIGRATION_3_4)
    // Optional shortcut. Room prefers it for version 1 users.
    .addMigrations(MIGRATION_1_3)
    .build()`,
            visual(el) {
              const TARGET = 4;
              const M = [[1, 2, true], [2, 3, true], [3, 4, true], [1, 3, false]].map(([from, to, on]) => ({ from, to, on }));
              let dev = 1, busy = false;
              const vers = [1, 2, 3, 4].map(v => h('span', { class: 'dt-ver' }, `v${v}`));
              const o = out();
              const migBtns = M.map(m => act(`Migration(${m.from}, ${m.to})`, function () {
                if (busy) return; m.on = !m.on; this.setAttribute('aria-pressed', String(m.on)); paint();
                say(o, `${m.on ? 'Added' : 'Removed'} MIGRATION_${m.from}_${m.to}.`);
              }, { 'aria-pressed': String(m.on) }));
              const devBtns = [1, 2, 3].map(v => act(`device on v${v}`, () => { if (busy) return; dev = v; press(devBtns, devBtns[v - 1]); paint(); }));
              function paint(on = [], fail) {
                vers.forEach((e, i) => { const v = i + 1; e.className = 'dt-ver' + (v === dev ? ' dt-dev' : '') + (on.includes(v) ? ' dt-on' : '') + (fail === v ? ' dt-fail' : ''); });
              }
              async function open() {
                if (busy) return; busy = true;
                let cur = dev; const path = [cur];
                paint(path);
                say(o, `Room opens app.db: file is v${dev}, @Database(version = ${TARGET})`);
                while (cur < TARGET) {
                  await sleep(550); if (!el.isConnected) return;
                  const next = M.filter(m => m.on && m.from === cur && m.to <= TARGET).sort((a, b) => b.to - a.to)[0];
                  if (!next) {
                    paint(path, cur + 1); replay(vers[cur], 'shake');
                    line(o, `<span class="bad">IllegalStateException:</span> A migration from ${cur} to ${cur + 1} was required but not found.`);
                    busy = false; return;
                  }
                  cur = next.to; path.push(cur); paint(path); replay(vers[cur - 1], 'pop');
                  line(o, hl(`MIGRATION_${next.from}_${next.to}.migrate(db)`));
                }
                line(o, `<span class="good">path ${path.map(v => 'v' + v).join(' → ')}. The file is on v${TARGET} with its rows.</span>`);
                busy = false;
              }
              press(devBtns, devBtns[0]); paint();
              say(o, 'Pick the version on the device and the migrations in the build, then open the database.');
              el.append(
                h('div', { class: 'dt-vers' }, h('span', { class: 'dt-label' }, 'versions'), vers),
                h('div', { class: 'controls' }, h('span', { class: 'dt-label' }, 'in the build'), migBtns),
                h('div', { class: 'controls' }, devBtns, act('open the database', open)),
                o);
            },
          },
          {
            title: 'AutoMigration can’t guess a rename',
            body: `
<p>AutoMigration compares two schema files. An added column is clear. A column that disappeared is not: was <code>title</code> renamed to <code>headline</code>, or deleted while a new column was added? Guessing wrong would lose data, so Room fails the build and asks you.</p>
<p>You answer with an <code>AutoMigrationSpec</code> class annotated with <code>@RenameColumn</code> or <code>@DeleteColumn</code> (and <code>@RenameTable</code> or <code>@DeleteTable</code> for tables). Room then copies the data across for you.</p>`,
            code: `@RenameColumn(tableName = "articles", fromColumnName = "title", toColumnName = "headline")
class RenameTitle : AutoMigrationSpec

@Database(
    entities = [Article::class],
    version = 2,
    autoMigrations = [AutoMigration(from = 1, to = 2, spec = RenameTitle::class)],
)
abstract class AppDatabase : RoomDatabase()`,
            visual(el) {
              const CH = {
                add: { label: 'add column read', spec: null, cols: ['id', 'title', 'summary', 'read'], note: 'an added column needs no spec' },
                ren: { label: 'rename title → headline', spec: '@RenameColumn(tableName = "articles",\n  fromColumnName = "title", toColumnName = "headline")\nclass RenameTitle : AutoMigrationSpec', cols: ['id', 'headline', 'summary'] },
                del: { label: 'delete column summary', spec: '@DeleteColumn(tableName = "articles", columnName = "summary")\nclass DropSummary : AutoMigrationSpec', cols: ['id', 'title'] },
              };
              const ROWS = [{ id: 1, title: 'Room notes', summary: 'Short intro' }, { id: 2, title: 'Paging tips', summary: 'Load in pages' }];
              let ch = 'ren', spec = false, busy = false;
              const dbBody = h('div');
              const verPill = h('span', { class: 'dt-pill dt-acc' });
              const kt = h('div', { class: 'kt' });
              const o = out();
              const W = { id: '2.2em', read: '3em' };
              function paintDb(cols, ver, fresh) {
                verPill.textContent = `version ${ver}`;
                const tpl = cols.map(c => W[c] || 'minmax(0, 1fr)').join(' ');
                const r = (cells, cls) => h('div', { class: 'dt-tr' + (cls || ''), style: `--dt-cols:${tpl}` }, cells.map((c, i) => h('span', { class: cols[i] === fresh ? 'dt-newcol pop' : null }, String(c))));
                dbBody.replaceChildren(r(cols, ' dt-th'), ...ROWS.map(x => r(cols.map(c => c === 'headline' ? x.title : c === 'read' ? 0 : x[c]))));
              }
              const needs = () => CH[ch].spec !== null;
              const paintKt = () => { kt.innerHTML = hl(needs() ? (spec ? CH[ch].spec : '// no AutoMigrationSpec') : '// AutoMigration(from = 1, to = 2)'); };
              const chBtns = Object.entries(CH).map(([k, c]) => act(c.label, () => { if (busy) return; ch = k; press(chBtns, chBtns[Object.keys(CH).indexOf(k)]); paintKt(); paintDb(['id', 'title', 'summary'], 1); }));
              async function build() {
                if (busy) return; busy = true;
                paintDb(['id', 'title', 'summary'], 1);
                say(o, '<span class="muted">KSP: diffing schemas/1.json and schemas/2.json…</span>');
                await sleep(650); if (!el.isConnected) return;
                if (needs() && !spec) {
                  const col = ch === 'ren' ? 'title' : 'summary';
                  replay(kt, 'shake');
                  line(o, `<span class="bad">error: AutoMigration Failure:</span> column '${col}' in 'articles' was either removed or renamed. Declare an AutoMigrationSpec with @RenameColumn or @DeleteColumn. <span class="muted">(shortened) The build stops, so no user ever runs a bad guess.</span>`);
                  busy = false; return;
                }
                line(o, `<span class="muted">generated AutoMigration_1_2_Impl, ${ch === 'add' ? 'ALTER TABLE … ADD COLUMN' : 'new table, copy rows, drop old, rename'}</span>`);
                await sleep(600); if (!el.isConnected) return;
                const fresh = ch === 'add' ? 'read' : ch === 'ren' ? 'headline' : null;
                paintDb(CH[ch].cols, 2, fresh);
                line(o, ch === 'del'
                  ? '<span class="good">installed:</span> the summary column is gone, on purpose. Every row kept its id and title.'
                  : `<span class="good">installed:</span> ${ch === 'ren' ? 'the titles moved into headline' : 'read was added with its default'}. All ${ROWS.length} rows kept.`);
                busy = false;
              }
              const sw = toggle('dt-d-spec', 'with AutoMigrationSpec', () => { if (busy) { sw.input.checked = spec; return; } spec = sw.input.checked; paintKt(); });
              press(chBtns, chBtns[1]); paintKt(); paintDb(['id', 'title', 'summary'], 1);
              say(o, 'Pick a schema change, decide on a spec, then build.');
              el.append(
                h('div', { class: 'controls' }, chBtns),
                h('div', { class: 'controls' }, sw, act('build and install', build)),
                h('div', { class: 'dt-grid' },
                  h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'app.db'), verPill), h('div', { class: 'dt-table' }, h('div', { class: 'dt-tname' }, 'articles'), dbBody)),
                  h('div', { class: 'dt-card' }, h('span', { class: 'dt-title' }, 'spec'), kt)),
                o);
            },
          },
          {
            title: 'Test every migration',
            body: `
<p>A migration runs once per user, on real data, and you can’t take it back. Test it. <code>MigrationTestHelper</code> creates a database at an old version from the exported schema, lets you insert rows with plain SQL, runs your migrations and checks the result against the new schema.</p>`,
            code: `@RunWith(AndroidJUnit4::class)
class MigrationTest {
    @get:Rule
    val helper = MigrationTestHelper(
        InstrumentationRegistry.getInstrumentation(),
        AppDatabase::class.java,
    )

    @Test
    fun migrate2To3_fillsSlug() {
        helper.createDatabase("test.db", 2).apply {
            execSQL("INSERT INTO articles (id, title, read) VALUES (1, 'Hello World', 0)")
            close()
        }
        val db = helper.runMigrationsAndValidate("test.db", 3, true, MIGRATION_2_3)
        db.query("SELECT slug FROM articles WHERE id = 1").use {
            it.moveToFirst()
            assertEquals("hello-world", it.getString(0))
        }
    }
}`,
          },
        ],
        underHood: {
          body: `
<p>SQLite keeps a version number in the file header, which you can read with <code>PRAGMA user_version</code>. Room also writes an identity hash of the schema into its own table, <code>room_master_table</code>. On open, a higher version in <code>@Database</code> makes SQLite call Room’s upgrade hook, inside a transaction. Room finds a migration path and runs each step.</p>
<p>After the last step, Room checks the result. The generated database class knows every table, column, type, nullability, default value and index your entities expect. Room reads the real schema from the file and compares. Any difference throws “Migration didn’t properly handle” with the expected and found table, and the transaction rolls back. If the version didn’t change but the hash did, you get “Room cannot verify the data integrity”.</p>`,
        },
        mistakes: [
          {
            title: 'NOT NULL without a default',
            bad: `db.execSQL("ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL")`,
            good: `db.execSQL("ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0")`,
            why: 'Existing rows need a value for the new column. SQLite refuses with “Cannot add a NOT NULL column with default value NULL”, and the app crashes on launch.',
          },
          {
            title: 'A default in SQL that the entity doesn’t declare',
            bad: `data class Article(
    @PrimaryKey val id: Int,
    val title: String,
    val read: Boolean = false,   // Kotlin default only
)
// migration: ADD COLUMN read INTEGER NOT NULL DEFAULT 0`,
            good: `data class Article(
    @PrimaryKey val id: Int,
    val title: String,
    @ColumnInfo(defaultValue = "0") val read: Boolean = false,
)`,
            why: 'Room compares column defaults too. The migrated table has <code>DEFAULT 0</code>, the entity says no default, and validation throws “Migration didn’t properly handle”. A Kotlin default is not a SQL default.',
          },
          {
            title: 'Using DAOs or entities inside a migration',
            bad: `override fun migrate(db: SupportSQLiteDatabase) {
    appDb.articleDao().getAll().forEach { /* fix titles */ }
}`,
            good: `override fun migrate(db: SupportSQLiteDatabase) {
    db.execSQL("UPDATE articles SET title = trim(title)")
}`,
            why: 'DAOs and entities describe the newest schema, not the one being migrated, and the database isn’t open yet. Migrations should be plain SQL on the <code>db</code> they receive, so they keep working after later schema changes.',
          },
        ],
        visual(el) {
          const START = [[1, 'Room 2.8 notes'], [2, 'Paging tips'], [3, 'KSP setup']];
          let rows, cols, ver, crashed, busy = false, strategy = 'none';
          const S = {
            none: { label: 'no migration', code: '@Database(entities = [Article::class], version = 2)\n// nothing describes 1 → 2' },
            manual: { label: 'Migration(1, 2)', code: 'val MIGRATION_1_2 = object : Migration(1, 2) {\n  override fun migrate(db: SupportSQLiteDatabase) =\n    db.execSQL("ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0")\n}\n.addMigrations(MIGRATION_1_2)' },
            auto: { label: 'AutoMigration(1, 2)', code: '@Database(\n  entities = [Article::class],\n  version = 2,\n  autoMigrations = [AutoMigration(from = 1, to = 2)],\n)' },
            wipe: { label: 'fallbackToDestructiveMigration', code: '@Database(entities = [Article::class], version = 2)\n.fallbackToDestructiveMigration(dropAllTables = true)' },
            forgot: { label: 'forgot version bump', code: '@Database(entities = [Article::class], version = 1)\n// Article gained `read`, version still 1' },
          };
          const verPill = h('span', { class: 'dt-pill dt-acc' });
          const dbBody = h('div');
          const device = h('div', { class: 'dt-table' }, h('div', { class: 'dt-tname' }, 'articles'), dbBody);
          const kt = h('div', { class: 'kt' });
          const o = out();
          const tpl = () => cols.map(c => (c === 'id' ? '2.2em' : c === 'read' ? '3.2em' : 'minmax(0, 1fr)')).join(' ');
          function paintDb(newCol) {
            verPill.textContent = `version ${ver}`;
            if (crashed) {
              dbBody.replaceChildren(h('div', { class: 'dt-crash drop-in' }, h('div', { class: 'err-icon' }, '!'), h('b', {}, 'News keeps stopping'), h('span', { class: 'dt-sub' }, 'The v1 file is still on disk, untouched.')));
              return;
            }
            const r = (cells, cls) => h('div', { class: 'dt-tr' + (cls || ''), style: `--dt-cols:${tpl()}` }, cells.map((c, i) => h('span', { class: cols[i] === newCol ? 'dt-newcol pop' : null }, String(c))));
            dbBody.replaceChildren(r(cols, ' dt-th'), ...(rows.length ? rows.map(x => r(x)) : [h('div', { class: 'dt-empty' }, 'No rows.')]));
          }
          function reset() {
            rows = START.map(r => [...r]); cols = ['id', 'title']; ver = 1; crashed = false;
            paintDb();
          }
          const pick = (k, btn) => {
            if (busy) return;
            strategy = k; press(sBtns, btn);
            kt.innerHTML = hl(S[k].code); replay(kt, 'pop-soft');
          };
          const sBtns = Object.entries(S).map(([k, s]) => act(s.label, function () { pick(k, this); }));
          async function install() {
            if (busy) return;
            if (ver === 2) { say(o, 'The device is already on version 2. Nothing to migrate. Reset the device to try another strategy.'); replay(device, 'shake'); return; }
            busy = true;
            if (crashed) { crashed = false; paintDb(); }
            const target = strategy === 'forgot' ? 1 : 2;
            say(o, `Room opens app.db: file says version 1, @Database says version ${target}`);
            await sleep(650); if (!o.isConnected) return;
            if (strategy === 'none' || strategy === 'forgot') {
              crashed = true; paintDb(); replay(device, 'shake');
              line(o, strategy === 'none'
                ? '<span class="bad">IllegalStateException:</span> A migration from 1 to 2 was required but not found. Please provide the necessary Migration path via RoomDatabase.Builder.addMigration(...) or allow for destructive migrations.'
                : '<span class="bad">IllegalStateException:</span> Room cannot verify the data integrity. Looks like you\'ve changed schema but forgot to update the version number.');
              busy = false; return;
            }
            if (strategy === 'wipe') {
              line(o, '<span class="muted">no migration found, fallback: DROP TABLE articles; CREATE TABLE articles (...)</span>');
              dbBody.querySelectorAll('.dt-tr:not(.dt-th)').forEach(r => r.classList.add('leave'));
              await sleep(500); if (!o.isConnected) return;
              rows = []; cols = ['id', 'title', 'read']; ver = 2; paintDb('read'); replay(verPill, 'pop');
              line(o, `<span class="bad">All ${START.length} rows deleted.</span> No crash, but the user's data is gone.`);
              busy = false; return;
            }
            line(o, strategy === 'auto'
              ? '<span class="muted">running generated AutoMigration_1_2_Impl (diff of schemas/1.json and 2.json)</span>'
              : '<span class="muted">running MIGRATION_1_2</span>');
            await sleep(550); if (!o.isConnected) return;
            line(o, hl('ALTER TABLE articles ADD COLUMN read INTEGER NOT NULL DEFAULT 0'));
            cols = ['id', 'title', 'read']; rows = rows.map(r => [...r, 0]); paintDb('read');
            await sleep(550); if (!o.isConnected) return;
            ver = 2; paintDb(); replay(verPill, 'pop');
            line(o, `<span class="good">schema matches @Entity, version 2.</span> All ${rows.length} rows kept.`);
            busy = false;
          }
          reset(); pick('manual', sBtns[1]);
          say(o, 'The device has version 1. The new build adds a <code>read</code> column. Pick a strategy and install.');
          el.append(
            h('div', { class: 'dt-grid' },
              h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'On the device: app.db'), verPill), device),
              h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'New build'), h('span', { class: 'dt-pill' }, 'val read: Boolean = false')), kt)),
            h('div', { class: 'controls' }, sBtns),
            h('div', { class: 'controls' },
              act('install update and open the db', install),
              act('reset device to v1', () => { if (busy) return; reset(); say(o, 'Back to version 1 with 3 rows.'); replay(device, 'pop-soft'); })),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'datastore',
        title: 'DataStore',
        tagline: 'Settings as a Flow, changed in safe transactions.',
        level: 'intermediate',
        body: `
<p>DataStore stores a small amount of data in one file. You read it through <code>data</code>, a <code>Flow</code> that emits the whole snapshot now and again after every change. You never read it synchronously, so the main thread never waits on disk.</p>
<p>You write with <code>edit { }</code> (Preferences DataStore) or <code>updateData { }</code> (typed DataStore). Each call is a transaction. DataStore reads the current value, runs your block, writes a temp file and renames it into place. Edits run one at a time, so two concurrent increments both count.</p>
<p>Preferences DataStore uses typed keys like <code>intPreferencesKey("font_size")</code>. Typed DataStore stores your own class through a <code>Serializer</code>, for example with kotlinx.serialization JSON or Protocol Buffers. Create one DataStore per file and keep it as a singleton. Two instances on the same file throw.</p>`,
        code: `// Preferences DataStore: one instance per file, declared once at the top level
val Context.dataStore by preferencesDataStore(name = "settings")

object Keys {
    val THEME = stringPreferencesKey("theme")
    val FONT_SIZE = intPreferencesKey("font_size")
}

class SettingsRepository(private val store: DataStore<Preferences>) {
    val theme: Flow<String> = store.data
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { it[Keys.THEME] ?: "system" }
        .distinctUntilChanged()

    // read and write in one transaction, so no update is lost
    suspend fun bumpFont() = store.edit { prefs ->
        prefs[Keys.FONT_SIZE] = (prefs[Keys.FONT_SIZE] ?: 16) + 1
    }
}

// Typed DataStore: your own class plus a Serializer
@Serializable
data class UserSettings(val theme: String = "system", val fontSize: Int = 16)

object UserSettingsSerializer : Serializer<UserSettings> {
    override val defaultValue = UserSettings()

    override suspend fun readFrom(input: InputStream): UserSettings =
        try {
            Json.decodeFromString(input.readBytes().decodeToString())
        } catch (e: SerializationException) {
            throw CorruptionException("Cannot read settings", e)
        }

    override suspend fun writeTo(t: UserSettings, output: OutputStream) =
        output.write(Json.encodeToString(t).encodeToByteArray())
}

val Context.settingsStore by dataStore("user_settings.json", UserSettingsSerializer)

suspend fun goDark(store: DataStore<UserSettings>) = store.updateData { it.copy(theme = "dark") }`,
        remember: 'Read DataStore as a Flow, write it in edit { }. One instance per file.',
        terms: [
          { term: 'Preferences DataStore', def: 'A DataStore that stores key-value pairs addressed by typed keys such as intPreferencesKey.' },
          { term: 'Typed DataStore', def: 'A DataStore that stores one object of your own type, turned into bytes by a Serializer you provide.' },
          { term: 'DataStore.edit', def: 'A suspend function that reads the current preferences, applies your changes and writes them atomically.' },
          { term: 'CorruptionException', def: 'The exception a DataStore Serializer throws when the file cannot be decoded, so a corruption handler can replace it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the key and bump it inside a transaction.', code: 'val FONT_SIZE = [[intPreferencesKey]]("font_size")\n\nsuspend fun bump(store: DataStore<Preferences>) {\n    store.[[edit]] { prefs ->\n        prefs[FONT_SIZE] = (prefs[FONT_SIZE] ?: 16) + 1\n    }\n}', why: 'Keys are typed, so <code>prefs[FONT_SIZE]</code> is an <code>Int?</code>. <code>edit</code> runs the read and the write as one atomic step.' },
          { type: 'bug', prompt: 'The app sometimes freezes on launch for a moment. Tap the line.', code: 'class MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        val theme = runBlocking { dataStore.data.first()[THEME] }\n        setContent {\n            AppTheme(theme) { App() }\n        }\n    }\n}', bug: 3, fix: '        // expose theme as a StateFlow in a ViewModel and use collectAsStateWithLifecycle() inside setContent', why: '<code>runBlocking</code> on the main thread waits for disk I/O and can drop frames or cause an ANR. Collect the Flow instead and show a default until the first value arrives.' },
        ],
        quiz: [
          { q: 'Two coroutines call <code>edit { it[COUNT] = (it[COUNT] ?: 0) + 1 }</code> at the same time, starting from 5. What is stored?', options: ['6, one update is lost', '7', 'It throws a concurrent modification error'], a: 1, why: 'DataStore runs edits one after another. The second edit reads the result of the first.' },
          { q: 'How do you read a DataStore value?', options: ['A synchronous <code>get()</code>', 'Collect the <code>data</code> Flow', 'Query it with SQL'], a: 1, why: '<code>data</code> emits the current snapshot and every later change. There is no synchronous getter.' },
          { q: 'Two classes each build their own DataStore for <code>settings.preferences_pb</code>. What happens?', options: ['They share the file safely', 'DataStore throws because more than one DataStore is active for the same file', 'The last writer wins silently'], a: 1, why: 'DataStore needs to be the only owner of its file. Declare it once with the top-level delegate or a DI singleton.' },
          { q: 'A typed DataStore file is damaged and the Serializer throws CorruptionException. There is no corruption handler. What happens?', options: ['DataStore resets the file to the default value', 'Every read and update throws, and the file stays broken', 'DataStore deletes the file on the next launch'], a: 1, why: 'Without a ReplaceFileCorruptionHandler nothing fixes the file. The handler returns a fresh value that DataStore writes, so the app works again.' },
          { q: 'An update adds <code>val theme: String</code> with no default to a @Serializable settings class stored as JSON. What happens for users with an old file?', options: ['theme is an empty string', 'Decoding throws MissingFieldException', 'The new key is ignored'], a: 1, why: 'kotlinx.serialization fills a missing key only from a property default. Give new properties a default value.' },
        ],
        deeper: [
          {
            title: 'A corrupt file needs a corruption handler',
            body: `
<p>Files get damaged: a full disk, a bad flash cell, a buggy old version that wrote garbage. When your <code>Serializer</code> can’t decode the bytes, it throws <code>CorruptionException</code>. Without a handler, DataStore throws that on every read and every <code>updateData</code>, and the file stays broken.</p>
<p>Pass a <code>ReplaceFileCorruptionHandler</code>. On corruption, DataStore calls it, writes the value it returns, and carries on. The user loses those settings, but the app works again. <code>CorruptionException</code> is an <code>IOException</code>, so a <code>catch</code> on the flow hides the symptom for reads but leaves writes failing.</p>`,
            code: `val Context.settingsStore by dataStore(
    fileName = "user_settings.json",
    serializer = UserSettingsSerializer,
    corruptionHandler = ReplaceFileCorruptionHandler { e ->
        Log.w("Settings", "Resetting corrupt settings", e)
        UserSettings()          // written to disk in place of the broken file
    },
)`,
            visual(el) {
              const GOOD = '{"theme":"dark","fontSize":18}';
              let handler = false, corrupt = false, data = { theme: '"dark"', fontSize: 18 }, busy = false, emits = 1;
              const file = h('div', { class: 'dt-file' });
              const obj = h('div', { class: 'dt-d2-objslot' });
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              function paint() {
                file.innerHTML = `<span class="dt-fname">files/datastore/user_settings.json</span>\n` + (corrupt ? '{"theme":"da<span class="dt-hit">\\x00\\x00\\x9f\\x03</span>' : data.fontSize === 16 && data.theme === '"system"' ? '{}  <span class="dt-fname">// all defaults: encodeDefaults is off</span>' : `{"theme":${data.theme},"fontSize":${data.fontSize}}`);
                obj.replaceChildren(h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, `UserSettings · emission ${emits}`), h('span', { class: 'field' }, `theme = ${data.theme}`), h('span', { class: 'field' }, `fontSize = ${data.fontSize}`)));
              }
              async function access(write) {
                if (busy) return; busy = true;
                say(o, write ? hl('store.updateData { it.copy(fontSize = it.fontSize + 1) }') : hl('store.data.first()'));
                await sleep(450); if (!o.isConnected) return;
                if (corrupt && !handler) {
                  replay(file, 'shake');
                  line('<span class="bad">CorruptionException:</span> Cannot read settings');
                  line(`<span class="muted">${write ? 'The write failed too: updateData has to read the current value first.' : 'Every read throws until the file is fixed. Nothing fixes it.'}</span>`);
                  busy = false; return;
                }
                if (corrupt) {
                  line('<span class="muted">decode failed → ReplaceFileCorruptionHandler { UserSettings() }</span>');
                  corrupt = false; data = { theme: '"system"', fontSize: 16 }; emits++; paint(); replay(file, 'pop');
                  await sleep(500); if (!o.isConnected) return;
                }
                if (write) { data.fontSize++; emits++; paint(); replay(obj, 'pop-soft'); line(`<span class="good">written:</span> fontSize = ${data.fontSize}`); }
                else line(`<span class="good">read:</span> UserSettings(theme=${data.theme}, fontSize=${data.fontSize})`);
                busy = false;
              }
              function breakIt() {
                if (busy) return;
                corrupt = true; paint(); replay(file, 'shake');
                say(o, '<span class="bad">the file is damaged.</span> Now read it or write it.');
              }
              const sw = toggle('dt-d2-ds-handler', 'corruptionHandler', function () { if (busy) { this.checked = handler; return; } handler = this.checked; say(o, handler ? 'A ReplaceFileCorruptionHandler is installed.' : 'No corruption handler.'); });
              paint();
              say(o, 'Settings read fine. Damage the file, then read and write with and without a handler.');
              el.append(
                h('div', { class: 'controls' }, act('damage the file', breakIt), cmd('store.data.first()', () => access(false)), cmd('updateData { fontSize + 1 }', () => access(true)), sw),
                h('div', { class: 'dt-grid' }, file, obj), o);
            },
          },
          {
            title: 'Change the class without losing users’ settings',
            body: `
<p>Typed DataStore with JSON keeps whatever your last version wrote. When an update changes <code>UserSettings</code>, the new code has to read the old file. kotlinx.serialization fills a missing key from the property’s default value. A new property without a default throws <code>MissingFieldException</code>. A key that no longer has a property throws too, unless the <code>Json</code> instance sets <code>ignoreUnknownKeys = true</code>.</p>
<p>With the corruption handler from the step before, either error turns into a silent reset, and the user’s dark theme is gone after an update. Give every new property a default, ignore unknown keys, and use a <code>DataMigration</code> for real renames.</p>`,
            code: `private val json = Json { ignoreUnknownKeys = true }   // removed keys don't break reads

@Serializable
data class UserSettings(
    val theme: String = "system",
    val fontSize: Int = 16,
    val compact: Boolean = false,   // new in v2: the default keeps v1 files readable
)`,
            visual(el) {
              const V1 = '{"theme":"dark","fontSize":18}';
              const UP = {
                add: { label: 'v2: val compact = false', cls: 'theme: String = "system"\nfontSize: Int = 16\ncompact: Boolean = false' },
                nodef: { label: 'v2: val compact (no default)', cls: 'theme: String = "system"\nfontSize: Int = 16\ncompact: Boolean' },
                drop: { label: 'v3: remove fontSize', cls: 'theme: String = "system"' },
              };
              let ignore = false, busy = false;
              const file = h('div', { class: 'dt-file' });
              const klass = h('div', { class: 'kt' });
              const obj = h('div', { class: 'dt-d2-objslot' });
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const card = (fields, cls = '') => h('div', { class: 'obj drop-in ' + cls }, h('span', { class: 'obj-name' }, 'UserSettings'), fields.map(f => h('span', { class: 'field' + (f[2] ? ' changed' : '') }, `${f[0]} = ${f[1]}`)));
              function v1() {
                file.innerHTML = `<span class="dt-fname">user_settings.json, written by v1</span>\n${V1}`;
                klass.textContent = 'data class UserSettings(theme, fontSize)';
                obj.replaceChildren(card([['theme', '"dark"'], ['fontSize', 18]]));
              }
              async function upgrade(k) {
                if (busy) return; busy = true;
                v1();
                klass.innerHTML = hl(`// app ${UP[k].label.split(':')[0]}\n` + UP[k].cls);
                replay(klass, 'pop-soft');
                say(o, `<span class="muted">update installed. Reading the v1 file with the ${UP[k].label.split(':')[0]} class…</span>`);
                await sleep(700); if (!o.isConnected) return;
                let err = null;
                if (k === 'nodef') err = 'MissingFieldException: Field \'compact\' is required for type with serial name \'com.example.UserSettings\', but it was missing';
                if (k === 'drop' && !ignore) err = 'SerializationException: Encountered an unknown key \'fontSize\'';
                if (err) {
                  replay(file, 'shake');
                  line(`<span class="bad">${err}</span>`);
                  await sleep(500); if (!o.isConnected) return;
                  line('<span class="muted">readFrom → CorruptionException → handler → UserSettings()</span>');
                  file.innerHTML = '<span class="dt-fname">user_settings.json, replaced</span>\n{}';
                  obj.replaceChildren(card(k === 'drop' ? [['theme', '"system"', 1]] : [['theme', '"system"', 1], ['fontSize', 16, 1], ['compact', false]], 'dt-d2-lost'));
                  line('<span class="bad">reset:</span> no crash, but the user’s dark theme and font size are gone.');
                } else {
                  obj.replaceChildren(card(k === 'add' ? [['theme', '"dark"'], ['fontSize', 18], ['compact', 'false', 1]] : [['theme', '"dark"']]));
                  line(k === 'add'
                    ? '<span class="good">kept:</span> "compact" was missing in the file, so the default filled it.'
                    : '<span class="good">kept:</span> ignoreUnknownKeys skipped "fontSize". The theme survived.');
                }
                busy = false;
              }
              const sw = toggle('dt-d2-ds-ignore', 'Json { ignoreUnknownKeys = true }', function () { if (busy) { this.checked = ignore; return; } ignore = this.checked; say(o, ignore ? 'Unknown keys are now skipped.' : 'Unknown keys throw again.'); });
              v1();
              say(o, 'v1 saved a dark theme. Install an update and see if it survives.');
              el.append(
                h('div', { class: 'controls' }, Object.keys(UP).map(k => act(UP[k].label, () => upgrade(k))), sw),
                h('div', { class: 'dt-grid' }, h('div', { class: 'dt-side' }, file, klass), obj), o);
            },
          },
          {
            title: 'More than one process needs the multi-process factory',
            body: `
<p>A normal DataStore caches the data in memory and assumes it is the only writer. If your app runs a second process, for example a service declared with <code>android:process=":sync"</code>, and both processes open the same file, neither sees the other’s writes and they can overwrite each other.</p>
<p><code>MultiProcessDataStoreFactory</code> creates a DataStore that coordinates through the file itself, so every process sees every change. It costs a little more per operation, so use it only when two processes really share the data.</p>`,
            code: `val settingsStore: DataStore<UserSettings> = MultiProcessDataStoreFactory.create(
    serializer = UserSettingsSerializer,
    produceFile = { File(context.filesDir, "datastore/user_settings.json") },
)`,
          },
        ],
        underHood: {
          body: `
<p>Inside, a DataStore keeps the latest value in memory and runs every write through one queue, one at a time. A write reads the current value, runs your transform, and compares the result. If nothing changed, it stops there. Otherwise it serializes the new value into a temporary file next to the real one, syncs it to disk, and renames it over the old file. A rename is atomic, so a crash leaves either the old file or the new one, never half of each.</p>
<p>The <code>data</code> flow emits from the in-memory value, which is why reads after the first one are fast and why equal values are not emitted twice. Preferences DataStore is the same machine with a built-in serializer: the keys and values are stored as a small protocol buffer, hence the <code>.preferences_pb</code> file name.</p>`,
        },
        mistakes: [
          {
            title: 'Reading outside the transaction',
            bad: `suspend fun bump() {
    val size = store.data.first()[FONT_SIZE] ?: 16
    store.edit { it[FONT_SIZE] = size + 1 }
}`,
            good: `suspend fun bump() {
    store.edit { it[FONT_SIZE] = (it[FONT_SIZE] ?: 16) + 1 }
}`,
            why: 'Two calls can both read 16 before either writes, and the result is 17 instead of 18. Inside <code>edit</code>, the read and the write happen as one step.',
          },
          {
            title: 'A mutable settings class',
            bad: `data class UserSettings(var fontSize: Int = 16)

store.updateData { it.apply { fontSize = 18 } }`,
            good: `data class UserSettings(val fontSize: Int = 16)

store.updateData { it.copy(fontSize = 18) }`,
            why: 'DataStore needs an immutable type. Changing the current object in place also changes the copy DataStore compares against, so it may see “no change” and skip the write.',
          },
          {
            title: 'Reusing a key name with another type',
            bad: `// v1
val FONT_SIZE = intPreferencesKey("font_size")
// v2
val FONT_SIZE = floatPreferencesKey("font_size")`,
            good: `// v2: a new name, and copy the old value once
val FONT_SCALE = floatPreferencesKey("font_scale")`,
            why: 'The file still holds an Int under "font_size". Reading it through a Float key fails with a <code>ClassCastException</code> on every launch for users who upgrade.',
          },
        ],
        visual(el) {
          const st = { theme: 'dark', font: 16 };
          let typed = false, emissions = 1, running = false, blocking = false;
          const queue = [];
          const file = h('div', { class: 'dt-file' });
          const txs = h('div', { class: 'dt-queue' });
          const uiText = h('p', { class: 'dt-ui-text' }, 'Derby tonight: kickoff at 20:00');
          const uiMeta = h('span', { class: 'dt-sub' });
          const ui = h('div', { class: 'dt-ui' }, h('span', { class: 'dt-label' }, 'UI collecting data'), uiText, uiMeta);
          const track = h('div', { class: 'lane-track' });
          const o = out();
          const paintFile = changed => {
            const mark = (k, v) => (k === changed ? `<span class="dt-hit">${v}</span>` : v);
            file.innerHTML = typed
              ? `<span class="dt-fname">files/datastore/user_settings.json</span>\n{ "theme": ${mark('theme', `"${st.theme}"`)}, "fontSize": ${mark('font', st.font)} }`
              : `<span class="dt-fname">files/datastore/settings.preferences_pb</span>\ntheme     = ${mark('theme', `"${st.theme}"`)}\nfont_size = ${mark('font', st.font)}`;
          };
          const paintUi = () => {
            ui.classList.toggle('dt-dark', st.theme === 'dark');
            uiText.style.fontSize = Math.min(st.font, 26) + 'px';
            uiMeta.textContent = `theme = ${st.theme} · fontSize = ${st.font} · emission #${emissions}`;
          };
          const frames = () => {
            track.replaceChildren(...Array.from({ length: 12 }, (_, i) => h('div', { class: 'bar dt-frame', style: `left:${i * 8.3 + 1}%;width:3%` })));
          };
          const labels = () => {
            const next = st.theme === 'dark' ? 'light' : 'dark';
            themeBtn.innerHTML = hl(typed ? `updateData { it.copy(theme = "${next}") }` : `edit { it[THEME] = "${next}" }`);
            fontBtn.innerHTML = hl(typed ? '2x launch { updateData { it.copy(fontSize = it.fontSize + 1) } }' : '2x launch { edit { it[FONT] = (it[FONT] ?: 16) + 1 } }');
          };
          async function drain() {
            if (running) return; running = true;
            while (queue.length) {
              const tx = queue[0];
              tx.chip.classList.add('dt-run'); replay(tx.chip, 'pop');
              line(o, `<span class="muted">${tx.name}:</span> read file, ${tx.key === 'font' ? 'fontSize' : 'theme'} = ${tx.key === 'font' ? st.font : `"${st.theme}"`}`);
              await sleep(420); if (!o.isConnected) return;
              tx.apply();
              line(o, `<span class="muted">${tx.name}:</span> block sets ${tx.key === 'font' ? `fontSize = ${st.font}` : `theme = "${st.theme}"`}`);
              await sleep(380); if (!o.isConnected) return;
              paintFile(tx.key); replay(file, 'pop-soft');
              line(o, `<span class="muted">${tx.name}:</span> write temp file, rename over the old one`);
              await sleep(380); if (!o.isConnected) return;
              emissions++; paintUi(); replay(ui, 'pop');
              line(o, `<span class="good">data emits</span> the new snapshot`);
              tx.chip.classList.remove('dt-run'); tx.chip.classList.add('dt-done');
              queue.shift();
              await sleep(260); if (!o.isConnected) return;
            }
            running = false;
            paintFile(); labels();
            await sleep(900); if (!o.isConnected || running) return;
            txs.replaceChildren();
          }
          let n = 0;
          const enqueue = (key, apply) => {
            const name = `edit #${++n}`;
            const chip = h('span', { class: 'dt-tx drop-in' }, name);
            txs.append(chip); queue.push({ name, key, apply, chip });
          };
          const themeBtn = cmd('', () => {
            if (queue.length >= 3) { replay(txs, 'shake'); return; }
            if (!running) say(o, 'One edit is one transaction:');
            enqueue('theme', () => { st.theme = st.theme === 'dark' ? 'light' : 'dark'; });
            drain();
          });
          const fontBtn = cmd('', () => {
            if (queue.length >= 3) { replay(txs, 'shake'); return; }
            if (!running) say(o, `Two coroutines edit at once. Start: fontSize = ${st.font}. They run one after the other:`);
            enqueue('font', () => { st.font += 1; });
            enqueue('font', () => { st.font += 1; });
            drain();
          });
          const blockBtn = cmd('runBlocking { dataStore.data.first() }', async () => {
            if (blocking) return; blocking = true;
            frames();
            const bar = h('div', { class: 'bar block', style: 'left:18%;width:0' });
            track.append(bar);
            say(o, '<span class="muted">main thread waits for disk...</span>');
            await sleep(40); if (!o.isConnected) return;
            bar.classList.add('dt-grow'); bar.style.width = '55%';
            await sleep(950); if (!o.isConnected) return;
            track.querySelectorAll('.dt-frame').forEach((f, i) => { if (i >= 2 && i <= 8) f.classList.add('dt-lost'); });
            say(o, '<span class="bad">Choreographer:</span> Skipped 34 frames! The application may be doing too much work on its main thread.');
            line(o, '<span class="muted">// fix: collect data in a ViewModel and show a default until it emits</span>');
            replay(ui, 'shake');
            blocking = false;
          });
          const typedSw = toggle('dt-ds-typed', 'typed DataStore (JSON Serializer)', () => {
            if (running) { typedSw.input.checked = typed; replay(txs, 'shake'); return; }
            typed = typedSw.input.checked;
            paintFile(); labels(); replay(file, 'flip');
            say(o, typed ? 'Same data, now one <code>UserSettings</code> object. You change it with <code>updateData { it.copy(...) }</code>.' : 'Back to key-value pairs with typed keys.');
          });
          frames(); paintFile(); paintUi(); labels();
          say(o, 'The UI is collecting <code>dataStore.data</code>. Change a value and watch the transaction.');
          el.append(
            h('div', { class: 'dt-grid' },
              h('div', { class: 'dt-card' }, h('span', { class: 'dt-label' }, 'On disk'), file, h('span', { class: 'dt-label' }, 'Edits, one at a time'), txs),
              ui),
            h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'main thread'), track)),
            h('div', { class: 'controls' }, themeBtn, fontBtn, blockBtn, typedSw),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'net',
        title: 'Retrofit and kotlinx.serialization',
        tagline: 'JSON in, a Kotlin object out, failures as values.',
        body: `
<p>Retrofit turns an interface into HTTP calls. Mark a function <code>suspend</code>, annotate it with <code>@GET</code> and the path, and Retrofit runs the request off the main thread and returns the parsed body.</p>
<p>kotlinx.serialization does the parsing. Mark the data class <code>@Serializable</code> and each JSON key fills the property with the same name. <code>@SerialName</code> handles keys like <code>published_at</code>. With <code>ignoreUnknownKeys = true</code>, extra fields from the server don’t break your app.</p>
<p>Calls fail. A 4xx or 5xx response throws <code>HttpException</code>. No connection throws an <code>IOException</code>. JSON that doesn’t match your class throws a <code>SerializationException</code>. Catch them in the repository and return a <code>Result</code>, so the ViewModel gets a value instead of a crash.</p>`,
        code: `@Serializable
data class ArticleDto(
    val id: Int,
    val title: String,
    @SerialName("published_at") val publishedAt: String,
)

interface NewsApi {
    @GET("articles/{id}")
    suspend fun getArticle(@Path("id") id: Int): ArticleDto
}

private val json = Json { ignoreUnknownKeys = true }

val api: NewsApi = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(NewsApi::class.java)

suspend fun loadArticle(id: Int): Result<ArticleDto> = try {
    Result.success(api.getArticle(id))
} catch (e: HttpException) {           // 404, 500, …
    Result.failure(e)
} catch (e: IOException) {             // offline, timeout
    Result.failure(e)
} catch (e: SerializationException) {  // JSON doesn't match
    Result.failure(e)
}`,
        remember: 'suspend fun in an interface, @Serializable on the class, and every failure caught and returned as a value.',
        level: 'intermediate',
        terms: [
          { term: 'Retrofit', def: 'A library that turns an annotated Kotlin interface into HTTP calls.' },
          { term: '@Serializable', def: 'A kotlinx.serialization annotation that generates the code to turn a class into JSON and back.' },
          { term: '@SerialName', def: 'A kotlinx.serialization annotation that maps a property to a JSON key with a different name.' },
          { term: 'HttpException', def: 'The exception Retrofit throws when a call returns a non-2xx status code.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Skip unknown JSON keys and declare a GET call that runs off the main thread.', code: 'private val json = Json { [[ignoreUnknownKeys]] = true }\n\ninterface NewsApi {\n    @[[GET]]("articles/{id}")\n    [[suspend]] fun getArticle(@Path("id") id: Int): ArticleDto\n}', why: '<code>ignoreUnknownKeys</code> stops extra server fields from throwing. A <code>suspend</code> Retrofit function runs the request off the main thread.' },
          { type: 'bug', prompt: 'Every response fails with <code>MissingFieldException</code> for <code>publishedAt</code>. Tap the wrong line.', code: '@Serializable\ndata class ArticleDto(\n    val id: Int,\n    val title: String,\n    @SerializedName("published_at") val publishedAt: String,\n)', bug: 4, fix: '    @SerialName("published_at") val publishedAt: String,', why: '<code>@SerializedName</code> is Gson’s annotation. kotlinx.serialization ignores it and looks for a <code>publishedAt</code> key, which the JSON doesn’t have.' },
        ],
        quiz: [
          { q: '<code>suspend fun getArticle(id: Int): ArticleDto</code> gets a 404. What happens?', options: ['It returns null', 'It throws <code>HttpException</code>', 'It returns an empty ArticleDto'], a: 1, why: 'When the return type is the body, Retrofit throws for any non-2xx response. Return <code>Response&lt;ArticleDto&gt;</code> if you want to inspect the code yourself.' },
          { q: 'The JSON has a <code>"views"</code> key your class doesn’t declare. With <code>ignoreUnknownKeys = true</code>:', options: ['The key is skipped', 'Parsing throws'], a: 0, why: 'Without that setting, an unknown key throws a <code>SerializationException</code>.' },
          { q: 'How do you map <code>"published_at"</code> to <code>publishedAt</code>?', options: ['<code>@SerialName("published_at")</code>', '<code>@Json(name = "published_at")</code>', 'Rename the property to <code>published_at</code>'], a: 0, why: '<code>@SerialName</code> is the kotlinx.serialization annotation. <code>@Json</code> belongs to Moshi.' },
          { q: 'The base URL is <code>https://api.example.com/v1/</code> and a method has <code>@GET("/articles")</code>. Which URL is requested?', options: ['https://api.example.com/v1/articles', 'https://api.example.com/articles', 'It fails to build'], a: 1, why: 'Retrofit resolves the path like a link. A leading slash means from the host root, so /v1/ is dropped. Write @GET("articles").' },
          { q: 'A server sends one byte every few seconds, so a download never trips the read timeout. You want the whole call to fail after 30 s. Which setting?', options: ['A longer connectTimeout', 'callTimeout(30, SECONDS)', 'A shorter writeTimeout'], a: 1, why: 'The read timeout is the longest wait for the next bytes, not for the whole response. callTimeout bounds the call from start to the last byte.' },
        ],
        deeper: [
          {
            title: 'Interceptors: one place for headers and logging',
            body: `
<p>Every request goes through OkHttp, so OkHttp is where cross-cutting work belongs: headers every call needs, auth tokens, logging. An <code>Interceptor</code> sees the request, may change it, calls <code>chain.proceed()</code> and gets the response back.</p>
<p>Where you add it matters. An <b>application interceptor</b> (<code>addInterceptor</code>) runs once per call, even when the response comes from the cache. A <b>network interceptor</b> (<code>addNetworkInterceptor</code>) runs once per real network request: not at all for a cache hit, and twice when the server redirects. Logging there shows exactly what went over the wire.</p>`,
            code: `class HeaderInterceptor(private val locale: () -> String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response =
        chain.proceed(
            chain.request().newBuilder()
                .header("Accept-Language", locale())
                .header("X-App-Version", BuildConfig.VERSION_NAME)
                .build(),
        )
}

val client = OkHttpClient.Builder()
    .addInterceptor(HeaderInterceptor { Locale.getDefault().toLanguageTag() })   // once per call
    .addNetworkInterceptor(HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.HEADERS else HttpLoggingInterceptor.Level.NONE
    })                                                                          // once per network request
    .cache(Cache(File(context.cacheDir, "http"), 20L * 1024 * 1024))
    .build()`,
            visual(el) {
              let busy = false;
              const tok = (n, text, cls = '') => { const t = h('span', { class: `token ${cls}` }, text); n.box.replaceChildren(t); replay(t, 'pop'); return t; };
              const cnt = { app: 0, net: 0 };
              const appB = h('span', { class: 'arc-badge' }, 'ran 0×'), netB = h('span', { class: 'arc-badge' }, 'ran 0×');
              const appI = node('HeaderInterceptor', 'application interceptor', appB);
              const cache = node('Cache', 'OkHttp disk cache');
              const netI = node('HttpLoggingInterceptor', 'network interceptor', netB);
              const server = node('api.example.com', 'the network');
              const all = [appI, cache, netI, server];
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const calm = () => all.forEach(n => { n.classList.remove('on', 'ok', 'dt-d2-skip'); n.box.replaceChildren(); });
              const bump = (k, b) => { cnt[k]++; b.textContent = `ran ${cnt[k]}×`; replay(b, 'pop'); };
              async function hit(n, text, cls = '') {
                all.forEach(x => x.classList.remove('on'));
                n.classList.add('on'); tok(n, text, cls);
                await sleep(480);
                return o.isConnected;
              }
              async function call(kind) {
                if (busy) return; busy = true;
                calm(); cnt.app = 0; cnt.net = 0; appB.textContent = netB.textContent = 'ran 0×';
                const path = kind === 'redirect' ? '/articles/7' : '/articles/42';
                say(o, `${hl(`api.getArticle(${kind === 'redirect' ? 7 : 42})`)} <span class="muted">→ GET ${path}</span>`);
                bump('app', appB);
                if (!await hit(appI, '+ Accept-Language')) return;
                if (kind === 'cache') {
                  if (!await hit(cache, 'fresh: max-age not over', 'arc-back')) return;
                  netI.classList.add('dt-d2-skip'); server.classList.add('dt-d2-skip');
                  if (!await hit(appI, '200 (from cache)', 'arc-back')) return;
                  line('<span class="good">cache hit:</span> the application interceptor ran once. The network interceptor never ran: no bytes went over the wire.');
                } else {
                  if (!await hit(cache, 'miss')) return;
                  bump('net', netB);
                  if (!await hit(netI, `log GET ${path}`)) return;
                  if (kind === 'redirect') {
                    if (!await hit(server, '301 → /v2/articles/7', 'boom')) return;
                    line('<span class="muted">OkHttp follows the redirect itself and sends a second request…</span>');
                    bump('net', netB);
                    if (!await hit(netI, 'log GET /v2/articles/7')) return;
                  }
                  if (!await hit(server, '200 OK', 'arc-back')) return;
                  if (!await hit(appI, '200 OK', 'arc-back')) return;
                  line(kind === 'redirect'
                    ? '<span class="good">redirect:</span> the network interceptor saw both requests. The application interceptor ran once and only saw the final response.'
                    : '<span class="good">network call:</span> each interceptor ran once.');
                }
                all.forEach(x => x.classList.remove('on'));
                busy = false;
              }
              say(o, 'Send three calls and count how often each interceptor runs.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('getArticle(42) // not cached', () => call('net')), cmd('getArticle(42) // cache hit', () => call('cache')), cmd('getArticle(7) // 301 redirect', () => call('redirect'))),
                h('div', { class: 'dt-d2-chain' }, appI, h('span', { class: 'arrow' }, '→'), cache, h('span', { class: 'arrow' }, '→'), netI, h('span', { class: 'arrow' }, '→'), server),
                o);
            },
          },
          {
            title: 'Leaving the screen cancels the request',
            body: `
<p>A request started in <code>viewModelScope</code> belongs to the screen. Press back, the ViewModel is cleared, its scope is cancelled, and the suspended Retrofit call is cancelled with it. Retrofit cancels the OkHttp <code>Call</code>, which closes the connection. The rest of a 2 MB download never happens.</p>
<p>Launch the same call in <code>GlobalScope</code> and nothing stops it. The download finishes and the result lands in a ViewModel no one shows. Work that must outlive the screen, like an upload, belongs in WorkManager, not in a stray scope.</p>`,
            code: `@HiltViewModel
class ArticleViewModel @Inject constructor(
    savedState: SavedStateHandle,
    private val api: NewsApi,
) : ViewModel() {
    private val id: Int = checkNotNull(savedState["id"])

    init {
        viewModelScope.launch {
            // Back pressed: the scope is cancelled, Retrofit cancels the OkHttp call,
            // and getArticle throws CancellationException here. Let it propagate.
            _state.value = ArticleState.Ready(api.getArticle(id))
        }
    }
}`,
            visual(el) {
              let global = false, dl = 0, open = false, cleared = false, gen = 0;
              const tok = (n, text, cls = '') => { const t = h('span', { class: `token ${cls}` }, text); n.box.replaceChildren(t); replay(t, 'pop'); return t; };
              const bar = h('span', { style: 'width:0%' });
              const meter = h('div', { class: 'meter dt-d2-meter' }, bar);
              const kb = h('span', { class: 'arc-badge' }, '0 KB of 2048 KB');
              const vm = node('ArticleViewModel', 'owns the scope');
              const call = node('OkHttp Call', 'GET /articles/42/full', meter, kb);
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const paint = () => { bar.style.width = `${dl}%`; kb.textContent = `${Math.round(dl * 20.48)} KB of 2048 KB`; };
              async function start() {
                if (open) { say(o, 'The article is already loading.'); return; }
                open = true; cleared = false; dl = 0; const g = ++gen;
                [vm, call].forEach(n => { n.classList.remove('bad', 'ok'); n.box.replaceChildren(); });
                vm.classList.add('on'); tok(vm, global ? 'GlobalScope.launch' : 'viewModelScope.launch');
                call.classList.add('on'); paint();
                say(o, '<span class="muted">downloading on a slow connection… press back while it runs.</span>');
                while (dl < 100) {
                  await sleep(140);
                  if (!o.isConnected || g !== gen) return;
                  dl = Math.min(100, dl + 4); paint();
                }
                call.classList.remove('on'); call.classList.add(cleared ? 'bad' : 'ok');
                tok(call, '200 OK', cleared ? 'boom' : 'arc-back');
                if (cleared) {
                  vm.classList.add('bad'); tok(vm, 'state set on a cleared ViewModel', 'boom');
                  line('<span class="bad">wasted:</span> GlobalScope kept the download going after the screen closed. 2 MB of data and battery for a result nobody will see.');
                } else {
                  vm.classList.remove('on'); tok(vm, 'ArticleState.Ready', 'arc-back');
                  line('<span class="good">loaded</span> while the screen was open.');
                }
                open = false;
              }
              async function back() {
                if (!open) { say(o, 'Nothing is loading. Open the article first.'); return; }
                if (cleared) return;
                cleared = true;
                vm.classList.remove('on'); vm.classList.add('bad'); tok(vm, 'onCleared()', 'boom'); replay(vm, 'shake');
                if (global) {
                  line('<span class="muted">The ViewModel is cleared, but GlobalScope is not tied to it…</span>');
                  return;
                }
                gen++; open = false;
                call.classList.remove('on'); call.classList.add('bad'); tok(call, 'Canceled', 'boom'); replay(call, 'shake');
                line(`<span class="good">cancelled:</span> viewModelScope was cancelled, Retrofit called call.cancel(), and the socket closed after ${Math.round(dl * 20.48)} KB. ${Math.round((100 - dl) * 20.48)} KB were never downloaded.`);
              }
              const sw = toggle('dt-d2-net-global', 'GlobalScope.launch instead', function () { if (open) { this.checked = global; return; } global = this.checked; say(o, global ? 'The call now runs in GlobalScope, tied to nothing.' : 'The call runs in viewModelScope again.'); });
              paint();
              say(o, 'Open the article, then press back before it finishes.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('open article (2 MB, slow network)', start), act('press back', back), sw),
                h('div', { class: 'dt-d2-chain' }, vm, h('span', { class: 'arrow' }, '→'), call),
                o);
            },
          },
          {
            title: 'Timeouts are per phase',
            body: `
<p>OkHttp has four timeouts. Connect, read and write default to 10 seconds each. The read timeout is the longest wait for the next bytes, not for the whole response, so a server that trickles one byte every few seconds never trips it. <code>callTimeout</code> bounds the whole call, from DNS to the last byte, and defaults to 0, which means no limit.</p>
<p>Every timeout surfaces as an <code>IOException</code> subclass, so the <code>catch (e: IOException)</code> in your repository already handles it. Set the timeouts once on the shared client.</p>`,
            code: `val client = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)   // default 10 s: open the TCP + TLS connection
    .readTimeout(10, TimeUnit.SECONDS)      // default 10 s: the gap between incoming bytes
    .writeTimeout(10, TimeUnit.SECONDS)     // default 10 s: the gap between outgoing bytes
    .callTimeout(30, TimeUnit.SECONDS)      // default 0 (none): the whole call
    .build()`,
          },
        ],
        underHood: {
          body: `
<p><code>retrofit.create(NewsApi::class.java)</code> returns a <code>java.lang.reflect.Proxy</code>. On the first call to a method, Retrofit reads its annotations once, builds a small request factory and caches it. Later calls skip the parsing.</p>
<p>The JVM sees a Kotlin <code>suspend</code> function as a normal method with one extra last parameter, a <code>Continuation</code>. Retrofit spots that parameter and adapts the call with <code>suspendCancellableCoroutine</code>: it enqueues the OkHttp call, resumes the coroutine from OkHttp’s callback, and registers <code>invokeOnCancellation { call.cancel() }</code>. That last line is the cancellation you saw above.</p>
<p>kotlinx.serialization does no reflection at run time. The compiler plugin generates a serializer for every <code>@Serializable</code> class, reachable as <code>ArticleDto.serializer()</code>, that reads the JSON keys in a loop and calls the constructor.</p>`,
        },
        mistakes: [
          {
            title: 'A new client for every call',
            bad: `suspend fun load(id: Int): ArticleDto {
    val api = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(OkHttpClient())
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(NewsApi::class.java)
    return api.getArticle(id)
}`,
            good: `@Provides @Singleton
fun newsApi(client: OkHttpClient): NewsApi = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .client(client)
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(NewsApi::class.java)`,
            why: 'Each <code>OkHttpClient</code> has its own connection pool, threads and cache. A new one per call reconnects every time and never reuses warm connections. Build one client and one API object, and share them.',
          },
          {
            title: 'Logging bodies in release builds',
            bad: `.addInterceptor(HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
})`,
            good: `.addInterceptor(HttpLoggingInterceptor().apply {
    level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
            else HttpLoggingInterceptor.Level.NONE
    redactHeader("Authorization")
})`,
            why: 'BODY logs every request and response in full, tokens and personal data included, into Logcat on users’ phones. It also buffers each body, which slows large downloads.',
          },
          {
            title: 'A leading slash in the path',
            bad: `// baseUrl("https://api.example.com/v1/")
@GET("/articles/{id}")    // → https://api.example.com/articles/42`,
            good: `// baseUrl("https://api.example.com/v1/")
@GET("articles/{id}")     // → https://api.example.com/v1/articles/42`,
            why: 'Retrofit resolves the path like a link in a web page. A leading slash means “from the host root”, so the <code>/v1/</code> part of the base URL is silently dropped.',
          },
        ],
        visual(el) {
          const ok = [['{', null], ['  "id": 42,', ['id', '42']], ['  "title": "Room with KSP",', ['title', '"Room with KSP"']], ['  "published_at": "2026-10-01",', ['publishedAt', '"2026-10-01"']], ['  "views": 1280', 'ign'], ['}', null]];
          const missing = [['{', null], ['  "id": 42,', ['id', '42']], ['  "published_at": "2026-10-01"', ['publishedAt', '"2026-10-01"']], ['}', null]];
          let busy = false;
          const app = h('div', { class: 'arc-end' }, 'App');
          const server = h('div', { class: 'arc-end' }, 'api.example.com');
          const wire = h('div', { class: 'arc-wire' });
          const jsonBox = h('div', { class: 'arc-json' });
          const objSlot = h('div', { class: 'arc-objslot' });
          const req = h('div', { class: 'kt' });
          const o = out();
          const packet = async (text, cls, to) => {
            wire.querySelectorAll('.arc-packet').forEach(p => p.remove());
            const p = h('span', { class: `arc-packet ${cls}${to === 'back' ? ' far' : ''}` }, text);
            wire.append(p); void p.offsetWidth;
            p.classList.remove('far');
            if (to === 'far') p.classList.add('far');
            else if (to === 'mid') p.classList.add('mid');
            await sleep(900);
            return el.isConnected;
          };
          const showObj = (fields, anim) => {
            const card = h('div', { class: 'obj' + (anim ? ' drop-in' : '') }, h('span', { class: 'obj-name' }, 'ArticleDto'));
            fields.forEach(([k, v]) => card.append(h('span', { class: 'field' }, `${k} = ${v}`)));
            objSlot.replaceChildren(card);
            return card;
          };
          const reset = () => { [app, server].forEach(x => x.classList.remove('bad')); jsonBox.replaceChildren(); objSlot.replaceChildren(h('span', { class: 'tip' }, 'waiting for a response')); };
          async function run(kind) {
            if (busy) return; busy = true;
            reset();
            req.innerHTML = hl('api.getArticle(42)') + '  <span class="muted">→ GET /articles/42</span>';
            say(o, '<span class="muted">request sent…</span>');
            if (kind === 'offline') {
              if (!await packet('GET /articles/42', '', 'mid')) return;
              const p = wire.querySelector('.arc-packet'); p.classList.add('errp'); replay(p, 'shake'); app.classList.add('bad');
              objSlot.replaceChildren(h('span', { class: 'build-fail' }, 'no object'));
              say(o, `<span class="bad">UnknownHostException</span> <span class="muted">is an IOException →</span> ${hl('Result.failure(e)')} <span class="muted">→ UiState.Error("No connection")</span>`);
              busy = false; return;
            }
            if (!await packet('GET /articles/42', '', 'far')) return;
            replay(server, 'pop');
            const status = kind === 'notfound' ? '404 Not Found' : '200 OK';
            if (!await packet(status, kind === 'notfound' ? 'errp' : 'okp', 'back')) return;
            const lines = kind === 'notfound' ? [['{ "error": "not found" }', null]] : kind === 'missing' ? missing : ok;
            const rowsEls = lines.map(([t]) => h('div', { class: 'branch', html: hl(t) }));
            for (const r of rowsEls) { jsonBox.append(r); replay(r, 'drop-in'); await sleep(120); }
            if (!el.isConnected) return;
            if (kind === 'notfound') {
              server.classList.add('bad');
              objSlot.replaceChildren(h('span', { class: 'build-fail' }, 'no object'));
              say(o, `<span class="bad">HttpException: HTTP 404</span> <span class="muted">Retrofit throws for any non-2xx →</span> ${hl('Result.failure(e)')}`);
              busy = false; return;
            }
            const card = showObj([], true);
            for (let i = 0; i < lines.length; i++) {
              const m = lines[i][1]; if (!m) continue;
              rowsEls[i].classList.add('scan'); await sleep(380); if (!el.isConnected) return;
              rowsEls[i].classList.remove('scan');
              if (m === 'ign') { rowsEls[i].classList.add('ign'); continue; }
              rowsEls[i].classList.add('hit');
              card.append(h('span', { class: 'field changed drop-in' }, `${m[0]} = ${m[1]}`));
            }
            if (kind === 'missing') {
              card.classList.add('shake'); card.style.borderColor = 'var(--err)';
              say(o, `<span class="bad">MissingFieldException:</span> Field 'title' is required for type with serial name 'com.example.ArticleDto', but it was missing. <span class="muted">A SerializationException: catch it too, or the app crashes.</span>`);
            } else {
              say(o, `${hl('Result.success(ArticleDto(id=42, title="Room with KSP", publishedAt="2026-10-01"))')} <span class="muted">// "views" was ignored</span>`);
            }
            busy = false;
          }
          // Open on a finished successful call.
          req.innerHTML = hl('api.getArticle(42)') + '  <span class="muted">→ GET /articles/42</span>';
          ok.forEach(([t, m]) => jsonBox.append(h('div', { class: 'branch' + (m === 'ign' ? ' ign' : m ? ' hit' : ''), html: hl(t) })));
          showObj(ok.filter(x => Array.isArray(x[1])).map(x => x[1]));
          wire.append(h('span', { class: 'arc-packet okp' }, '200 OK'));
          say(o, `${hl('Result.success(ArticleDto(id=42, …))')} <span class="muted">Replay it, or try a failure.</span>`);
          el.append(
            h('div', { class: 'controls arc-fit' },
              cmd('200 OK', () => run('ok')),
              cmd('404 Not Found', () => run('notfound')),
              cmd('no network', () => run('offline')),
              cmd('JSON without "title"', () => run('missing'))),
            req,
            h('div', { class: 'arc-wire-row' }, app, wire, server),
            h('div', { class: 'arc-map' },
              h('div', {}, h('div', { class: 'arc-cap' }, 'response body (JSON)'), jsonBox),
              h('div', {}, h('div', { class: 'arc-cap' }, 'Kotlin object'), objSlot)),
            o);
        },
      },

      // Auth ─────────────────────────────────────────────
      {
        id: 'auth',
        title: 'OkHttp interceptors and token refresh',
        tagline: 'Add the token in one place, refresh it once on 401, and never loop.',
        level: 'intermediate',
        body: `
<p>Most APIs want <code>Authorization: Bearer &lt;token&gt;</code> on every call. Don’t add it in each Retrofit method. An application interceptor, registered with <code>addInterceptor</code>, adds it in one place. It runs once per call, before OkHttp’s own retry, redirect and cache handling.</p>
<p>Access tokens expire, and the server then answers <code>401</code>. On a 401, OkHttp calls your <code>Authenticator</code> with that response. Return a new request carrying a fresh token and OkHttp sends it again. Return <code>null</code> and OkHttp gives up and hands the 401 to your code, which usually means “log the user out”.</p>
<p>A screen often fires several calls at once, so several 401s arrive together. If each one refreshes, you send several refresh calls. Many servers rotate refresh tokens, so each one works only once: the second refresh is rejected and the user is logged out for no reason. Put the refresh behind a <code>Mutex</code>. The first call refreshes. The others wait, see that the token already changed, and reuse it.</p>
<p>Two more rules. Give up after one retry, or a server that keeps answering 401 makes OkHttp try again and again. And never log the token: redact the <code>Authorization</code> header in your logging interceptor.</p>`,
        code: `interface TokenStore {
    fun accessToken(): String?           // in memory, cheap
    suspend fun refresh(): String?       // POST /token on a separate client; null if rejected (tokens cleared)
}

class AuthInterceptor(private val tokens: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokens.accessToken() ?: return chain.proceed(chain.request())
        return chain.proceed(
            chain.request().newBuilder().header("Authorization", "Bearer $token").build(),
        )
    }
}

class TokenAuthenticator(private val tokens: TokenStore) : Authenticator {
    private val mutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.responseCount >= 2) return null           // already retried once: give up
        val sent = response.request.header("Authorization")?.removePrefix("Bearer ")
        val fresh = runBlocking {                              // an OkHttp thread, never main
            mutex.withLock {
                val current = tokens.accessToken()
                if (current != null && current != sent) current   // another call already refreshed
                else tokens.refresh()
            }
        } ?: return null                                       // refresh failed: the 401 reaches the app
        return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()
    }

    private val Response.responseCount: Int
        get() = generateSequence(this) { it.priorResponse }.count()
}

val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor(tokens))
    .authenticator(TokenAuthenticator(tokens))
    .addNetworkInterceptor(HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.HEADERS else HttpLoggingInterceptor.Level.NONE
        redactHeader("Authorization")
    })
    .build()`,
        remember: 'Interceptor adds the token, Authenticator refreshes it on 401 behind a Mutex, and one retry is the limit.',
        terms: [
          { term: 'Interceptor', def: 'OkHttp code that sees each request on its way out and each response on its way back, and may change them.' },
          { term: 'Authenticator', def: 'An OkHttp callback that runs on a 401 and returns a new request to retry, or null to give up.' },
          { term: 'priorResponse', def: 'On an OkHttp Response, the earlier response that caused this request (a redirect or an auth retry), or null for the first one.' },
          { term: 'Mutex', def: 'A kotlinx.coroutines lock. withLock lets one coroutine at a time run a block; it is not reentrant.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add the token to every call, and refresh it when the server answers 401.', code: 'val client = OkHttpClient.Builder()\n    .[[addInterceptor]](AuthInterceptor(tokens))\n    .[[authenticator]](TokenAuthenticator(tokens))\n    .build()', why: '<code>addInterceptor</code> registers an application interceptor that runs once per call. <code>authenticator</code> registers the callback OkHttp runs on a 401.' },
          { type: 'bug', prompt: 'Three calls fail with 401 together. The server rotates refresh tokens, and the user gets logged out. Tap the wrong line.', code: 'override fun authenticate(route: Route?, response: Response): Request? {\n    if (response.responseCount >= 2) return null\n    val sent = response.request.header("Authorization")?.removePrefix("Bearer ")\n    val fresh = runBlocking {\n        mutex.withLock { tokens.refresh() }\n    } ?: return null\n    return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()\n}', bug: 4, fix: '        mutex.withLock { tokens.accessToken()?.takeIf { it != sent } ?: tokens.refresh() }', why: 'The lock makes the calls refresh one after another, but each still refreshes. The second refresh sends a refresh token that was already used, the server rejects it, and the tokens are cleared. Check first whether another call already got a new token.' },
        ],
        quiz: [
          { q: 'Five calls get 401 at the same moment. With the Mutex and the “did it change?” check, how many refresh calls go out?', options: ['5', '1', '0'], a: 1, why: 'The first call refreshes while holding the lock. The other four get the lock later, see a token different from the one they sent, and reuse it.' },
          { q: '<code>authenticate()</code> returns <code>null</code>. What happens?', options: ['OkHttp retries with the same request', 'OkHttp stops and returns the 401 response to the caller', 'OkHttp throws IllegalStateException'], a: 1, why: 'Null means “I can’t fix this”. Retrofit then throws <code>HttpException</code> with code 401 for a <code>suspend</code> function that returns the body.' },
          { q: 'After the Authenticator returns a new request, which interceptors run again for the retry?', options: ['Application and network interceptors', 'Only network interceptors', 'None'], a: 1, why: 'The retry starts inside OkHttp’s retry-and-follow-up step, which sits below the application interceptors and above the network interceptors.' },
          { q: 'Which order does a request pass through in OkHttp?', options: ['Application interceptors → retry and follow-up (Authenticator) → cache and connection → network interceptors → server', 'Network interceptors → application interceptors → Authenticator → server', 'Authenticator → application interceptors → network interceptors → cache → server'], a: 0, why: 'The retry step sits below your application interceptors. So a retry after the Authenticator does not run your AuthInterceptor again.' },
          { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">override fun authenticate(route: Route?, response: Response): Request? {\n    runBlocking { tokens.refresh() }\n    return response.request\n}</pre>What is the bug?', options: ['runBlocking is not allowed in OkHttp', 'It returns the old request, so the retry still carries the expired token', 'It should return null after refreshing'], a: 1, why: 'The retry starts below the application interceptors and is sent as you return it. Build a new request with the fresh Authorization header.' },
          { q: 'The refresh call goes through the same client that has the Authenticator, behind a Mutex. POST /token answers 401. What happens?', options: ['The Authenticator returns null and the user is logged out', 'The Authenticator runs again, waits for its own Mutex, and that thread is stuck', 'OkHttp skips the Authenticator for token calls'], a: 1, why: 'A Mutex is not reentrant. Send the refresh on a plain base client without the auth pieces.' },
        ],
        deeper: [
          {
            title: 'The retry starts below your interceptor',
            body: `
<p>OkHttp builds the chain in this order: your application interceptors, then its own retry-and-follow-up step (where the Authenticator is called), then the cache and connection steps, then your network interceptors, then the server. A retry starts at the retry step. Your <code>AuthInterceptor</code> does not run again.</p>
<p>So the Authenticator must put the new token on the request itself. If it returns <code>response.request</code> unchanged, the retry carries the same expired header and gets the same 401. The network logging interceptor, on the other hand, sees both requests.</p>`,
            code: `// Wrong: the retry still carries "Bearer abc1"
return response.request

// Right: replace the header on the request you return
return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()`,
            visual(el) {
              let busy = false, same = false;
              const tok = (n, text, cls = '') => { const t = h('span', { class: `token ${cls}` }, text); n.box.replaceChildren(t); replay(t, 'pop'); };
              const cnt = { app: 0, auth: 0, net: 0 };
              const appB = h('span', { class: 'arc-badge' }, 'ran 0×'), authB = h('span', { class: 'arc-badge' }, 'ran 0×'), netB = h('span', { class: 'arc-badge' }, 'ran 0×');
              const appI = node('AuthInterceptor', 'application interceptor', appB);
              const auth = node('Authenticator', 'inside retry-and-follow-up', authB);
              const netI = node('HttpLoggingInterceptor', 'network interceptor', netB);
              const server = node('api.example.com', 'access token def2 is valid');
              const all = [appI, auth, netI, server];
              const o = out();
              const bump = (k, b) => { cnt[k]++; b.textContent = `ran ${cnt[k]}×`; replay(b, 'pop'); };
              async function hit(n, text, cls = '') {
                all.forEach(x => x.classList.remove('on'));
                n.classList.add('on'); tok(n, text, cls);
                await sleep(560);
                return o.isConnected;
              }
              async function run() {
                if (busy) return; busy = true;
                cnt.app = cnt.auth = cnt.net = 0; [appB, authB, netB].forEach(b => { b.textContent = 'ran 0×'; });
                all.forEach(n => { n.classList.remove('on', 'bad', 'ok'); n.box.replaceChildren(); });
                say(o, `${hl('api.feed()')} <span class="muted">→ GET /feed with an expired token</span>`);
                bump('app', appB);
                if (!await hit(appI, '+ Bearer abc1')) return;
                bump('net', netB);
                if (!await hit(netI, 'log GET /feed')) return;
                if (!await hit(server, '401', 'boom')) return;
                bump('auth', authB);
                if (!await hit(auth, same ? 'return response.request' : '+ Bearer def2')) return;
                bump('net', netB);
                if (!await hit(netI, `log GET /feed (retry)`)) return;
                if (same) {
                  if (!await hit(server, '401 again', 'boom')) return;
                  bump('auth', authB);
                  if (!await hit(auth, 'responseCount = 2 → null')) return;
                  appI.classList.add('bad');
                  if (!await hit(appI, '401', 'boom')) return;
                  line(o, '<span class="bad">same request:</span> the retry went out with the old header, because AuthInterceptor never ran again. The guard stopped it after one lap.');
                } else {
                  if (!await hit(server, '200 OK', 'arc-back')) return;
                  appI.classList.add('ok');
                  if (!await hit(appI, '200 OK', 'arc-back')) return;
                  line(o, '<span class="good">fresh header:</span> AuthInterceptor ran once. The logging interceptor saw both the 401 and the retry.');
                }
                all.forEach(x => x.classList.remove('on'));
                busy = false;
              }
              const sw = toggle('dt-au-same', 'Authenticator returns response.request', function () { if (busy) { this.checked = same; return; } same = this.checked; say(o, same ? 'The Authenticator now returns the request unchanged.' : 'The Authenticator sets the new header again.'); });
              say(o, 'Send one call with an expired token and count who runs.');
              el.append(
                h('div', { class: 'controls arc-fit' }, cmd('api.feed() // token expired', run), sw),
                h('div', { class: 'dt-d2-chain' }, appI, h('span', { class: 'arrow' }, '→'), auth, h('span', { class: 'arrow' }, '→'), netI, h('span', { class: 'arrow' }, '→'), server),
                o);
            },
          },
          {
            title: 'Stop the loop',
            body: `
<p>Some 401s cannot be fixed by a refresh: the account was disabled, or the server rejects every token because of a bug. Without a limit, your Authenticator refreshes and returns a new request every time. OkHttp follows up to 20 times, then throws <code>ProtocolException: Too many follow-up requests: 21</code>. That is 21 requests and 21 refresh calls for one tap.</p>
<p>Count the earlier responses through <code>priorResponse</code>, as the OkHttp recipe does, and return <code>null</code> once you have already retried. The 401 then reaches your code, which can show the login screen.</p>`,
            code: `override fun authenticate(route: Route?, response: Response): Request? {
    if (response.responseCount >= 2) return null   // the retry with a fresh token failed too
    // ... refresh and return the new request
}

private val Response.responseCount: Int
    get() = generateSequence(this) { it.priorResponse }.count()`,
            visual(el) {
              let guard = true, busy = false;
              const n = h('b', { class: 'dt-au-big' }, '0');
              const r = h('b', { class: 'dt-au-big' }, '0');
              const bar = h('span', { style: 'width:0%' });
              const meter = h('div', { class: 'meter dt-au-meter' }, bar);
              const o = out();
              async function run() {
                if (busy) return; busy = true;
                n.textContent = '0'; r.textContent = '0'; bar.style.width = '0%'; meter.classList.remove('dt-au-hot');
                say(o, `${hl('api.feed()')} <span class="muted">// the server answers 401 to everything</span>`);
                let req = 0, ref = 0;
                for (;;) {
                  req++; n.textContent = req; bar.style.width = `${Math.min(100, req / 21 * 100)}%`;
                  await sleep(guard ? 450 : 110); if (!o.isConnected) return;
                  if (guard && req >= 2) {
                    line(o, `<span class="good">responseCount = 2 → return null.</span> 2 requests, 1 refresh. The 401 reaches the app, which shows login.`);
                    break;
                  }
                  ref++; r.textContent = ref;
                  if (req > 20) {
                    meter.classList.add('dt-au-hot'); replay(meter, 'shake');
                    line(o, `<span class="bad">ProtocolException: Too many follow-up requests: 21</span> <span class="muted">${req} requests and ${ref} refresh calls for one tap.</span>`);
                    break;
                  }
                }
                busy = false;
              }
              const sw = toggle('dt-au-guard', 'if (responseCount >= 2) return null', function () { if (busy) { this.checked = guard; return; } guard = this.checked; say(o, guard ? 'Guard on: one retry, then give up.' : 'Guard off: the Authenticator always returns a new request.'); });
              sw.input.checked = true;
              say(o, 'Send a call to a server that always says 401. Then turn the guard off and try again.');
              el.append(
                h('div', { class: 'controls' }, cmd('api.feed() // always 401', run), sw),
                h('div', { class: 'dt-au-stats' },
                  h('div', {}, h('div', { class: 'dt-label' }, 'requests sent'), n),
                  h('div', {}, h('div', { class: 'dt-label' }, 'refresh calls'), r)),
                meter, o);
            },
          },
          {
            title: 'Refresh on a client without the Authenticator',
            body: `
<p>The refresh call itself must not go through the client that has the Authenticator. If <code>POST /token</code> answers 401, the Authenticator runs again on the same thread while it still holds the <code>Mutex</code>. A <code>Mutex</code> is not reentrant, so <code>withLock</code> waits for itself forever and that OkHttp thread is stuck.</p>
<p>Build a plain base client and derive the API client from it with <code>newBuilder()</code>. Both share one connection pool, but only the API client has the auth pieces.</p>`,
            code: `val baseClient = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)
    .build()

// Refresh calls: no AuthInterceptor, no Authenticator
val authApi: AuthApi = retrofit(baseClient).create(AuthApi::class.java)

// Everything else: same pool, plus the auth pieces
val apiClient = baseClient.newBuilder()
    .addInterceptor(AuthInterceptor(tokens))
    .authenticator(TokenAuthenticator(tokens))
    .build()`,
          },
          {
            title: 'Logs that never show a token',
            body: `
<p><code>HttpLoggingInterceptor</code> prints whatever passes through it. With <code>Level.HEADERS</code> it prints the <code>Authorization</code> header unless you call <code>redactHeader("Authorization")</code>. With <code>Level.BODY</code> it also prints the refresh response, which holds both tokens in plain JSON.</p>
<p>Use <code>NONE</code> in release builds, redact the auth headers in debug, and keep BODY for short local debugging sessions only.</p>`,
            code: `HttpLoggingInterceptor().apply {
    level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.HEADERS
            else HttpLoggingInterceptor.Level.NONE
    redactHeader("Authorization")   // logged as Authorization: ██
    redactHeader("Cookie")
}`,
          },
        ],
        underHood: {
          body: `
<p>For every call, OkHttp builds a list of interceptors: yours from <code>addInterceptor</code>, then <code>RetryAndFollowUpInterceptor</code>, <code>BridgeInterceptor</code>, <code>CacheInterceptor</code>, <code>ConnectInterceptor</code>, yours from <code>addNetworkInterceptor</code>, and finally <code>CallServerInterceptor</code>, which writes to the socket.</p>
<p><code>RetryAndFollowUpInterceptor</code> runs a loop. When a response is a redirect or a 401, it asks for a follow-up request: the redirect target, or whatever your Authenticator returns. It links the old response as <code>priorResponse</code> of the new one and goes round again. A null follow-up ends the loop and returns the response. More than 20 follow-ups throws <code>ProtocolException</code>.</p>`,
        },
        mistakes: [
          {
            title: 'Refreshing on the main client',
            bad: `val client = OkHttpClient.Builder()
    .authenticator(TokenAuthenticator(tokens))
    .build()
val authApi = retrofit(client).create(AuthApi::class.java)   // refresh uses it too`,
            good: `val baseClient = OkHttpClient.Builder().build()
val authApi = retrofit(baseClient).create(AuthApi::class.java)
val client = baseClient.newBuilder()
    .authenticator(TokenAuthenticator(tokens))
    .build()`,
            why: 'A 401 from the refresh endpoint re-enters the Authenticator while it holds the non-reentrant Mutex, and the thread waits forever.',
          },
          {
            title: 'Returning the same request',
            bad: `override fun authenticate(route: Route?, response: Response): Request? {
    runBlocking { mutex.withLock { tokens.refresh() } }
    return response.request   // AuthInterceptor will add the new token… it won't
}`,
            good: `override fun authenticate(route: Route?, response: Response): Request? {
    val fresh = runBlocking { mutex.withLock { tokens.refresh() } } ?: return null
    return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()
}`,
            why: 'The retry starts below the application interceptors. The request you return is sent as it is, so it must carry the new header.',
          },
          {
            title: 'No retry limit',
            bad: `override fun authenticate(route: Route?, response: Response): Request? {
    val fresh = refreshBlocking() ?: return null
    return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()
}`,
            good: `override fun authenticate(route: Route?, response: Response): Request? {
    if (response.responseCount >= 2) return null
    val fresh = refreshBlocking() ?: return null
    return response.request.newBuilder().header("Authorization", "Bearer $fresh").build()
}`,
            why: 'If the server rejects even fresh tokens, OkHttp follows up to 20 times and then throws ProtocolException, after 21 refresh calls.',
          },
        ],
        visual(el) {
          const CALLS = ['GET /feed', 'GET /profile', 'GET /notifications'];
          let useMutex = true, busy = false, seq = 1;
          const v = { access: 'abc1', refresh: 'r1', calls: 0 };
          const srv = { access: null, refresh: 'r1' };
          const vAcc = h('span', { class: 'dt-pill' }), vRef = h('span', { class: 'dt-pill' }), vCalls = h('span', { class: 'dt-pill' });
          const vault = h('div', { class: 'dt-au-vault' },
            h('div', { class: 'dt-label' }, 'TokenStore'),
            h('div', { class: 'dt-au-kv' }, h('span', {}, 'access'), vAcc),
            h('div', { class: 'dt-au-kv' }, h('span', {}, 'refresh'), vRef),
            h('div', { class: 'dt-au-kv' }, h('span', {}, 'refresh calls'), vCalls));
          const lanes = CALLS.map(name => {
            const track = h('div', { class: 'dt-au-track' });
            const status = h('span', { class: 'dt-pill' }, 'idle');
            const row = h('div', { class: 'dt-au-lane' }, h('div', { class: 'dt-au-head' }, h('b', {}, name), status), track);
            return { row, track, status };
          });
          const o = out();
          const paintVault = (busyRefresh) => {
            vAcc.textContent = v.access ? `${v.access}${v.access === srv.access ? '' : ' (expired)'}` : 'none';
            vAcc.className = `dt-pill ${v.access && v.access === srv.access ? 'dt-ok' : v.access ? '' : 'dt-bad'}`;
            vRef.textContent = v.refresh || 'none';
            vRef.className = `dt-pill ${v.refresh ? '' : 'dt-bad'}`;
            vCalls.textContent = busyRefresh ? `${v.calls} (running…)` : String(v.calls);
            vCalls.className = `dt-pill ${v.calls > 1 ? 'dt-bad' : ''}`;
          };
          const chip = (L, text, cls = '') => { const c = h('span', { class: `dt-au-chip ${cls}` }, text); L.track.append(c); replay(c, 'drop-in'); };
          const setStatus = (L, text, cls = '') => { L.status.textContent = text; L.status.className = `dt-pill ${cls}`; };
          // A tiny FIFO lock that behaves like Mutex.withLock for the demo.
          let tail = Promise.resolve(), holders = 0;
          const lock = () => { let release; const next = new Promise(r => { release = r; }); const wait = tail; tail = tail.then(() => next); holders++; return wait.then(() => () => { holders--; release(); }); };
          let refreshing = 0;
          async function refresh(L) {
            if (!v.refresh) { chip(L, 'no refresh token → null'); return null; }
            const rt = v.refresh;
            v.calls++; refreshing++; paintVault(true);
            chip(L, `POST /token (${rt})`);
            await sleep(900);
            refreshing--;
            if (rt !== srv.refresh) {
              chip(L, '400 invalid_grant', 'dt-au-bad');
              v.access = null; v.refresh = null; paintVault(refreshing > 0);
              return null;
            }
            seq++;
            const acc = ['abc1', 'def2', 'ghi3', 'jkl4', 'mno5'][Math.min(seq - 1, 4)];
            srv.access = acc; srv.refresh = `r${seq}`;
            v.access = acc; v.refresh = `r${seq}`; paintVault(refreshing > 0);
            chip(L, `200: ${acc}, r${seq}`, 'dt-au-ok');
            return acc;
          }
          async function call(L, i) {
            await sleep(i * 120);
            const sent = v.access;
            setStatus(L, 'sending');
            chip(L, `Bearer ${sent}`);
            await sleep(420);
            if (sent && sent === srv.access) { chip(L, '200', 'dt-au-ok'); setStatus(L, '200', 'dt-ok'); return 'ok'; }
            chip(L, '401', 'dt-au-bad');
            await sleep(300);
            chip(L, 'authenticate()');
            let release = null;
            if (useMutex) {
              if (holders > 0) chip(L, 'waiting for lock…', 'dt-au-wait');
              release = await lock();
              chip(L, 'lock ✓');
            }
            let fresh;
            const current = v.access;
            if (useMutex && current && current !== sent) { chip(L, `changed → reuse ${current}`, 'dt-au-ok'); fresh = current; await sleep(250); }
            else fresh = await refresh(L);
            if (release) release();
            if (!fresh) { chip(L, 'return null'); setStatus(L, '401 → app', 'dt-bad'); return 'fail'; }
            await sleep(200);
            chip(L, `retry Bearer ${fresh}`);
            await sleep(420);
            if (fresh === srv.access) { chip(L, '200', 'dt-au-ok'); setStatus(L, '200', 'dt-ok'); return 'ok'; }
            chip(L, '401', 'dt-au-bad'); setStatus(L, '401 → app', 'dt-bad'); return 'fail';
          }
          function reset(revoked) {
            v.access = 'abc1'; v.refresh = 'r1'; v.calls = 0; seq = 1;
            srv.access = null; srv.refresh = revoked ? null : 'r1';
            lanes.forEach(L => { L.track.replaceChildren(); setStatus(L, 'idle'); });
            paintVault(false);
          }
          async function run(revoked) {
            if (busy) return; busy = true;
            reset(revoked);
            say(o, revoked
              ? '<span class="muted">The server revoked refresh token r1 (password changed on another device). Three calls start…</span>'
              : `<span class="muted">Token abc1 expired. The home screen starts three calls${useMutex ? '' : ', with no Mutex'}…</span>`);
            const res = await Promise.all(lanes.map((L, i) => call(L, i)));
            if (!el.isConnected) return;
            const fails = res.filter(x => x === 'fail').length;
            if (revoked) line(o, `<span class="good">refresh rejected:</span> ${v.calls} refresh call${v.calls > 1 ? 's' : ''}, tokens cleared, every call returned 401. The app shows login, which is right this time.`);
            else if (!fails) line(o, `<span class="good">${v.calls} refresh call.</span> The other calls waited for the lock, saw a new token and reused it.`);
            else line(o, `<span class="bad">${v.calls} refresh calls.</span> The first one rotated r1 → r2, so the others sent a used refresh token, got 400, and cleared the tokens. ${fails} call${fails > 1 ? 's' : ''} failed and the user is logged out.`);
            busy = false;
          }
          const sw = toggle('dt-au-mutex', 'mutex.withLock { … }', function () { if (busy) { this.checked = useMutex; return; } useMutex = this.checked; say(o, useMutex ? 'Refresh runs behind the Mutex, with the “did it change?” check.' : 'No Mutex: each 401 refreshes on its own.'); });
          sw.input.checked = true;
          reset(false);
          say(o, 'Run three calls with an expired token. Then turn the Mutex off and run them again.');
          el.append(
            h('div', { class: 'controls' }, cmd('3 calls, token expired', () => run(false)), cmd('refresh token revoked', () => run(true)), sw),
            h('div', { class: 'dt-au-wrap' }, vault, h('div', { class: 'dt-au-lanes' }, lanes.map(L => L.row))),
            o);
        },
      },

      // realtime ─────────────────────────────────────
      {
        id: 'realtime',
        title: 'Real-time data: WebSockets as a Flow',
        tagline: 'One open connection, wrapped in callbackFlow, closed when nobody listens.',
        level: 'advanced',
        body: `
<p>A Retrofit call is one question and one answer. Live scores, chat and stock prices need the server to speak first, many times. A <strong>WebSocket</strong> keeps one connection open, and either side can send a message at any time.</p>
<p>OkHttp opens one with <code>client.newWebSocket(request, listener)</code> and calls your <code>WebSocketListener</code> on its own background thread: <code>onOpen</code>, <code>onMessage</code>, then <code>onClosed</code> or <code>onFailure</code>. That is a callback API, so wrap it in <code>callbackFlow</code>. Each message goes in with <code>trySend</code>. A failure closes the flow with the error. <code>awaitClose</code> closes the socket when the collector leaves.</p>
<p>The result is a cold <code>Flow</code>: the socket opens when someone collects and closes when they stop. Server-Sent Events, a one-way stream over plain HTTP, fit the same shape; OkHttp’s <code>okhttp-sse</code> module gives you an <code>EventSourceListener</code> with an <code>onEvent</code> callback.</p>`,
        code: `class LiveScoreSocket(private val client: OkHttpClient) {
    fun messages(matchId: String): Flow<String> = callbackFlow {
        val request = Request.Builder()
            .url("wss://live.example.com/matches/$matchId")
            .build()
        val socket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                trySend(text)                         // from OkHttp's thread into the flow
            }
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                webSocket.close(1000, null)           // answer the server's close
            }
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                channel.close()                       // normal end
            }
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                channel.close(t)                      // an error, so retryWhen can reconnect
            }
        })
        awaitClose { socket.close(1000, "collector left") }
    }
}

class ScoreRepository(private val socket: LiveScoreSocket, private val json: Json) {
    fun score(matchId: String): Flow<ScoreEvent> = socket.messages(matchId)
        .map { json.decodeFromString<ScoreEvent>(it) }
        .retryWhen { cause, attempt ->
            if (cause !is IOException) return@retryWhen false
            delay(1_000L shl attempt.coerceAtMost(5).toInt())   // 1 s, 2 s, 4 s … 32 s
            true
        }
}`,
        remember: 'callbackFlow plus awaitClose { socket.close() }: the socket lives exactly as long as someone collects.',
        terms: [
          { term: 'WebSocket', def: 'A long-lived, two-way connection that starts as an HTTP request and then carries messages in both directions.' },
          { term: 'callbackFlow', def: 'A flow builder that turns a callback API into a cold Flow; values go in with trySend or send.' },
          { term: 'awaitClose', def: 'Suspends inside callbackFlow until the collector cancels or the channel closes, then runs your cleanup block.' },
          { term: 'Ping frame', def: 'A small control message that checks the connection is alive; OkHttp sends them when pingInterval is set.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Push each message into the flow and close the socket when the collector leaves.', code: 'callbackFlow {\n    val socket = client.newWebSocket(request, object : WebSocketListener() {\n        override fun onMessage(webSocket: WebSocket, text: String) {\n            [[trySend|trySendBlocking]](text)\n        }\n    })\n    [[awaitClose]] { socket.[[close]](1000, null) }\n}', why: '<code>trySend</code> works from any thread without suspending. <code>awaitClose</code> keeps the flow alive and runs its block when collection stops, which is where the socket must close.' },
          { type: 'bug', prompt: 'When Wi-Fi drops, the score freezes and never reconnects, although the flow uses <code>retryWhen</code>. Tap the line.', code: 'val socket = client.newWebSocket(request, object : WebSocketListener() {\n    override fun onMessage(webSocket: WebSocket, text: String) {\n        trySend(text)\n    }\n    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {\n        channel.close()\n    }\n})', bug: 5, fix: '        channel.close(t)', why: '<code>close()</code> without a cause ends the flow normally, and <code>retryWhen</code> only runs on an exception. Pass the error so the collector sees a failure and reconnects.' },
        ],
        quiz: [
          { q: 'When does the block inside <code>awaitClose { }</code> run?', options: ['After every message', 'When the collector cancels or the channel is closed', 'Only when the server closes the socket'], a: 1, why: 'It runs once, at the end, whichever side ends it. That makes it the one place to close the socket.' },
          { q: 'Two screens collect the same cold <code>messages()</code> flow. How many sockets are open?', options: ['1', '2'], a: 1, why: 'Each collector runs the <code>callbackFlow</code> block again. Share one with <code>shareIn</code> when several screens need the same stream.' },
          { q: 'Why call <code>trySend</code> instead of <code>emit</code> inside the listener?', options: ['emit is slower', 'The listener is a plain callback on OkHttp’s thread, not a suspend function in the flow’s coroutine', 'trySend retries on failure'], a: 1, why: '<code>emit</code> must be called from the flow’s own coroutine. <code>callbackFlow</code> gives you a channel that accepts values from any thread.' },
          { q: 'A WebSocket flow uses <code>retryWhen</code> to reconnect. Which failure should it retry?', options: ['IOException from a dropped connection', 'SerializationException from a bad message', 'Both, with no delay'], a: 0, why: 'A dropped connection can heal, so retry it with a growing, capped delay. A bad message format will fail again every time.' },
          { q: 'The mobile network drops the connection silently and the score feed just goes quiet. How does the app find out?', options: ['onClosed is called right away', 'Set pingInterval on the OkHttpClient so a missing pong fails the socket', 'socket.send() starts throwing'], a: 1, why: 'Nothing fails until something is sent. With pings, OkHttp cancels the socket when the server stops answering and calls onFailure, so backoff takes over.' },
        ],
        deeper: [
          {
            title: 'Reconnect with backoff',
            body: `
<p>Mobile connections drop all the time: a tunnel, a Wi-Fi handoff, a server deploy. Because <code>onFailure</code> closes the flow with the error, <code>retryWhen</code> sees it and can start the <code>callbackFlow</code> again, which opens a fresh socket.</p>
<p>Wait longer after each failure, and cap the wait. Retrying instantly in a loop drains the battery and hammers a server that is already struggling. Only retry errors that can heal, like <code>IOException</code>; a bad message format will fail the same way every time.</p>`,
            code: `fun <T> Flow<T>.retryWithBackoff(maxDelayMs: Long = 30_000): Flow<T> =
    retryWhen { cause, attempt ->
        if (cause !is IOException) return@retryWhen false   // a parse error won't heal
        val wait = (1_000L shl attempt.coerceAtMost(5).toInt()).coerceAtMost(maxDelayMs)
        delay(wait)
        true                                                // run the upstream again
    }`,
          },
          {
            title: 'One socket for every screen: shareIn',
            body: `
<p>A cold flow opens a new socket for each collector. If the match screen and a score banner both collect, the server sees two connections. Turn the stream into a hot <code>SharedFlow</code> in a long-lived scope with <code>shareIn</code>.</p>
<p><code>WhileSubscribed(5_000)</code> opens the socket when the first collector arrives and closes it 5 seconds after the last one leaves, so a rotation does not reconnect. <code>replay = 1</code> hands the latest score to a screen that subscribes late.</p>`,
            code: `@Singleton
class ScoreRepository @Inject constructor(
    socket: LiveScoreSocket,
    json: Json,
    @ApplicationScope scope: CoroutineScope,
) {
    val galatasarayFenerbahce: SharedFlow<ScoreEvent> = socket.messages("gs-fb")
        .map { json.decodeFromString<ScoreEvent>(it) }
        .retryWithBackoff()
        .shareIn(scope, SharingStarted.WhileSubscribed(5_000), replay = 1)
}`,
          },
          {
            title: 'Sending goes the other way',
            body: `
<p>A WebSocket is two-way. <code>socket.send(text)</code> queues a message and returns at once. It returns <code>false</code> once the socket is closing or closed, and that message is not sent.</p>
<p>The producer block of <code>callbackFlow</code> is a coroutine scope, so it can collect an outgoing flow and send each item on the same socket. When the collector leaves, that inner job is cancelled with the rest.</p>`,
            code: `fun chat(roomId: String, outgoing: Flow<String>): Flow<String> = callbackFlow {
    val socket = client.newWebSocket(request(roomId), listenerFor(this))
    launch {
        outgoing.collect { text ->
            if (!socket.send(text)) close(IOException("socket is closing"))
        }
    }
    awaitClose { socket.close(1000, null) }
}`,
          },
          {
            title: 'Find dead connections with pings',
            body: `
<p>A connection can die without either side noticing, for example when a mobile network silently drops it. Nothing fails until you try to send, so a quiet score feed would just look like a quiet match.</p>
<p>Set <code>pingInterval</code> on the <code>OkHttpClient</code>. OkHttp then sends ping frames on that interval. If the server does not answer in time, OkHttp cancels the socket and calls <code>onFailure</code>, and your backoff takes over. Pings are off by default.</p>`,
            code: `val wsClient = okHttpClient.newBuilder()
    .pingInterval(20, TimeUnit.SECONDS)   // default 0 = no pings
    .build()`,
          },
        ],
        underHood: {
          body: `
<p>A WebSocket starts as an ordinary HTTP request with an <code>Upgrade: websocket</code> header. The server answers <code>101 Switching Protocols</code>, which is the <code>Response</code> passed to <code>onOpen</code>, and from then on the same TCP connection carries small frames: text, binary, ping, pong and close.</p>
<p>OkHttp reads frames on a background thread and calls your listener there. <code>callbackFlow</code> puts a channel between that thread and your collector, with room for 64 items by default. <code>trySend</code> drops a value and returns a failure when the channel is full, so for a fast feed where only the newest value matters, add <code>.conflate()</code> or <code>.buffer(Channel.CONFLATED)</code>.</p>`,
        },
        mistakes: [
          {
            title: 'Forgetting awaitClose',
            bad: `fun messages() = callbackFlow {
    client.newWebSocket(request, listener)
}`,
            good: `fun messages() = callbackFlow {
    val socket = client.newWebSocket(request, listener)
    awaitClose { socket.close(1000, null) }
}`,
            why: 'Without <code>awaitClose</code> the block returns at once and <code>callbackFlow</code> throws <code>IllegalStateException</code>. Even if it did not, the socket would stay open after the screen is gone.',
          },
          {
            title: 'A socket per collector',
            bad: `// Match screen and score banner each call:
repository.score("gs-fb").collect { … }   // two sockets to one match`,
            good: `val score = repository.score("gs-fb")
    .shareIn(appScope, SharingStarted.WhileSubscribed(5_000), replay = 1)`,
            why: 'Every collector of a cold flow runs the producer again. Share one hot stream so each match has one connection, however many screens watch it.',
          },
        ],
        visual(el) {
          const TEAMS = ['Galatasaray', 'Fenerbahçe'];
          let collecting = false, open = false, leaked = 0, attempt = 0, epoch = 0, closeOn = true, busy = false;
          const goals = [0, 0];
          let minute = 12;
          const big = h('div', { class: 'dt-ws-big' }, '0 – 0');
          const minuteEl = h('span', { class: 'dt-pill' }, "12'");
          const status = h('span', { class: 'dt-pill' }, 'not collecting');
          const count = h('span', { class: 'dt-pill' }, 'open sockets: 0');
          const wire = h('div', { class: 'arc-wire' });
          const o = h('div', { class: 'dt-d2-log dt-ws-log', 'aria-live': 'polite' });
          const log = html => { o.append(h('div', { class: 'drop-in', html })); while (o.children.length > 7) o.firstChild.remove(); };
          const sockets = () => (open ? 1 : 0) + leaked;
          function paint() {
            const n = sockets();
            count.textContent = `open sockets: ${n}`;
            count.className = 'dt-pill ' + (n > (collecting ? 1 : 0) ? 'dt-bad' : n ? 'dt-ok' : '');
            status.textContent = collecting ? (open ? 'collecting · onOpen' : 'collecting · connecting…') : 'not collecting';
            status.className = 'dt-pill ' + (collecting ? (open ? 'dt-ok' : 'dt-warn') : '');
            big.textContent = `${goals[0]} – ${goals[1]}`;
            minuteEl.textContent = `${minute}'`;
          }
          async function packet(text, cls, back) {
            const p = h('span', { class: `arc-packet ${cls}${back ? ' far' : ''}` }, text);
            wire.append(p); void p.offsetWidth;
            p.classList.toggle('far', !back);
            await sleep(900); p.remove();
          }
          async function connect(my) {
            paint();
            log(`<span class="muted">newWebSocket(wss://live.example.com/matches/gs-fb)</span>`);
            await packet('GET  Upgrade: websocket', '', true);
            if (!el.isConnected || my !== epoch || !collecting) return;
            await packet('101 Switching Protocols', 'okp', false);
            if (!el.isConnected || my !== epoch || !collecting) return;
            open = true; paint();
            log('<span class="good">onOpen</span> the socket is live');
          }
          async function collect() {
            if (collecting) { log('<span class="muted">Already collecting.</span>'); return; }
            collecting = true; attempt = 0; epoch++;
            await connect(epoch);
          }
          async function goal() {
            if (busy) return;
            if (!sockets()) { log('<span class="muted">server: nobody is connected, the goal is not sent anywhere</span>'); return; }
            busy = true;
            const t = Math.random() < 0.55 ? 0 : 1;
            minute = Math.min(90, minute + 3 + Math.floor(Math.random() * 9));
            await packet(`{"goal":"${TEAMS[t]}","min":${minute}}`, '', false);
            if (!el.isConnected) return;
            if (open && collecting) {
              goals[t]++; paint(); replay(big, 'pop');
              log(`<span class="good">onMessage → trySend</span> GOL! ${TEAMS[t]} ${minute}'`);
            } else {
              paint();
              log('<span class="bad">onMessage on a leaked socket:</span> trySend fails, the channel is closed. The bytes still cost data and battery.');
            }
            busy = false;
          }
          async function drop() {
            if (!open) { log('<span class="muted">No live socket to drop.</span>'); return; }
            open = false; paint(); replay(wire, 'shake');
            log('<span class="bad">onFailure(SocketException)</span> → channel.close(t)');
            const my = epoch;
            while (collecting && my === epoch) {
              const wait = 1 << Math.min(attempt, 5);
              attempt++;
              status.textContent = `retryWhen: delay(${wait} s)`; status.className = 'dt-pill dt-warn';
              log(`<span class="muted">retryWhen: IOException, attempt ${attempt}, waiting ${wait} s (sped up here)</span>`);
              await sleep(500 + wait * 250);
              if (!el.isConnected || my !== epoch || !collecting) return;
              await connect(my);
              return;
            }
          }
          async function leave() {
            if (!collecting) { log('<span class="muted">Nothing is collecting.</span>'); return; }
            collecting = false; epoch++;
            if (!open) { paint(); log('Collector cancelled while reconnecting. The pending retry is cancelled too.'); return; }
            if (closeOn) {
              open = false; paint();
              log('<span class="good">awaitClose ran:</span> socket.close(1000, "collector left")');
              packet('close 1000', 'errp', true);
            } else {
              open = false; leaked++; paint(); replay(count, 'shake');
              log('<span class="bad">awaitClose { } is empty:</span> the flow ended, but the socket is still open.');
            }
          }
          const sw = toggle('dt-ws-close', 'awaitClose closes the socket', function () {
            closeOn = this.checked;
            log(closeOn ? 'awaitClose { socket.close(1000, null) } is back.' : '<span class="bad">bug mode:</span> awaitClose { } does nothing now. Collect, leave, collect again.');
          });
          sw.input.checked = true;
          paint();
          log('Collect to open the socket. Score goals, drop the network, then leave the screen.');
          el.append(
            h('div', { class: 'controls' }, cmd('scores.collect { }', collect), act('server: goal!', goal), act('drop the network', drop), act('leave the screen', leave)),
            h('div', { class: 'controls' }, sw),
            h('div', { class: 'arc-wire-row' }, h('span', { class: 'arc-end' }, 'server'), wire, h('span', { class: 'arc-end' }, 'app')),
            h('div', { class: 'dt-ws-board' },
              h('div', { class: 'dt-ws-score' }, h('div', { class: 'dt-ws-teams' }, h('span', {}, 'Galatasaray'), minuteEl, h('span', {}, 'Fenerbahçe')), big),
              h('div', { class: 'dt-side' }, status, count)),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'caching',
        title: 'Caching strategies',
        tagline: 'Show something now, fetch something fresh, and know when to skip the network.',
        level: 'advanced',
        body: `
<p>A cache answers two questions: what do I show right now, and when do I ask the network? Network-only shows a spinner until the server answers and an error when offline. Cache-then-network shows the stored copy at once, always fetches, and swaps in the fresh data when it arrives.</p>
<p>A time to live (TTL) adds a rule: while the cache is younger than, say, 10 minutes, skip the network. Stale-while-revalidate says what happens after that: keep showing the old copy and refresh in the background, instead of blocking the screen. With Room as the source of truth, the UI just observes the table and the refresh writes into it.</p>
<p>OkHttp can also cache whole HTTP responses. Give the client a <code>Cache</code> and it follows the server's <code>Cache-Control</code> headers. Within <code>max-age</code> it skips the network. After that it sends <code>If-None-Match</code>, and a <code>304 Not Modified</code> reply costs only headers.</p>`,
        code: `class ArticleRepository(
    private val dao: ArticleDao,
    private val api: NewsApi,
    private val now: () -> Long = System::currentTimeMillis,
) {
    // The UI always reads the cache, so stale rows show up at once.
    val articles: Flow<List<Article>> = dao.observeAll().map { rows -> rows.map { it.toModel() } }

    // TTL plus stale-while-revalidate: skip the network while the cache is young.
    suspend fun refreshIfStale(ttl: Duration = 10.minutes): Result<Unit> {
        val fetchedAt = dao.oldestFetchedAt() ?: 0L
        if (now() - fetchedAt < ttl.inWholeMilliseconds) return Result.success(Unit)
        return try {
            val fresh = api.latest()
            dao.replaceAll(fresh.map { it.toEntity(fetchedAt = now()) })   // one @Transaction
            Result.success(Unit)
        } catch (e: IOException) {
            Result.failure(e)   // the stale rows stay on screen; show a small offline banner
        }
    }
}

// HTTP-level cache: OkHttp follows Cache-Control and revalidates with ETags for you
val client = OkHttpClient.Builder()
    .cache(Cache(File(context.cacheDir, "http"), 20L * 1024 * 1024))
    .build()`,
        remember: 'Show the cache now, refresh when the TTL runs out, and never wipe good data because the network failed.',
        terms: [
          { term: 'Cache-then-network', def: 'A strategy that shows cached data immediately, always fetches from the network, and replaces the data when the response arrives.' },
          { term: 'Stale-while-revalidate', def: 'Serving an expired cached copy right away while a background request fetches a fresh one.' },
          { term: 'TTL', def: 'Time to live: how long cached data counts as fresh before the app asks the network again.' },
          { term: 'HTTP cache', def: 'OkHttp’s on-disk response cache that follows Cache-Control and ETag headers to skip or shrink requests.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give OkHttp a 20 MB disk cache in the right directory.', code: 'val client = OkHttpClient.Builder()\n    .[[cache]](Cache(File(context.[[cacheDir]], "http"), 20L * 1024 * 1024))\n    .build()', why: 'The HTTP cache is throwaway data, so it belongs in <code>cacheDir</code>, which the system may clear when space runs low.' },
          { type: 'bug', prompt: 'The app hits the network on every open but never refreshes old data. Tap the line.', code: 'suspend fun refreshIfStale(ttl: Duration = 10.minutes) {\n    val fetchedAt = dao.oldestFetchedAt() ?: 0L\n    val age = System.currentTimeMillis() - fetchedAt\n    if (age > ttl.inWholeMilliseconds) return\n    val fresh = api.latest()\n    dao.replaceAll(fresh.map { it.toEntity(fetchedAt = System.currentTimeMillis()) })\n}', bug: 3, fix: '    if (age < ttl.inWholeMilliseconds) return   // still fresh, skip the network', why: 'The early return should fire while the cache is young. With <code>&gt;</code> it skips exactly the stale case and fetches when the data is fresh.' },
        ],
        quiz: [
          { q: 'Cache-then-network, the device is offline, the cache has yesterday\'s articles. What does the user see?', options: ['A spinner forever', 'Yesterday\'s articles, plus an offline notice', 'An empty list'], a: 1, why: 'The cache shows at once. The failed fetch only adds a notice; it must not clear the stored rows.' },
          { q: 'The TTL is 10 minutes and the cache is 2 minutes old. What does a TTL strategy do on open?', options: ['Fetches anyway', 'Shows the cache and skips the network', 'Clears the cache'], a: 1, why: 'Young data counts as fresh, so there is no request at all.' },
          { q: 'OkHttp has a stale cached response with an ETag. What does it send?', options: ['Nothing, it serves the stale copy', 'A conditional request with <code>If-None-Match</code>; a 304 means the cached body is still good', 'A DELETE for the old response'], a: 1, why: 'Revalidation is cheap: a 304 has no body, and OkHttp serves the cached one.' },
          { q: 'The screen opens, the user pulls to refresh, and a worker syncs, all at once. The refresh holds a Mutex and checks the TTL inside the lock. How many network requests go out?', options: ['1', '3', '0, the TTL blocks all of them'], a: 0, why: 'The first caller fetches. The others wait for the lock, then find fresh data and return at once.' },
          { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">suspend fun refresh() {\n    dao.deleteAll()\n    val fresh = api.articles()\n    dao.insertAll(fresh)\n}</pre>The device is offline. What does the user see?', options: ['Yesterday’s articles', 'An empty screen', 'A crash'], a: 1, why: 'The delete runs before the fetch throws, so the cache is gone. Fetch first, then replace the rows in one transaction.' },
        ],
        deeper: [
          {
            title: 'Share one refresh between many callers',
            body: `
<p>Real apps refresh from several places. The screen refreshes when it opens, the user pulls to refresh, and a periodic worker syncs in the background. When they fire together, a naive repository sends three identical requests and writes the same rows three times.</p>
<p>Guard the refresh with a <code>Mutex</code> and check the TTL inside the lock. The first caller fetches. The others wait for the lock, then find fresh data and return at once. One request, three happy callers.</p>`,
            code: `private val refreshLock = Mutex()

suspend fun refreshIfStale(ttl: Duration = 10.minutes) = refreshLock.withLock {
    // A caller that waited here finds the data the first caller just wrote.
    val fetchedAt = dao.oldestFetchedAt() ?: 0L
    if (now() - fetchedAt < ttl.inWholeMilliseconds) return@withLock
    val fresh = api.latest()
    dao.replaceAll(fresh.map { it.toEntity(fetchedAt = now()) })
}`,
            visual(el) {
              const CALLERS = ['screen opens', 'pull to refresh', 'SyncWorker'];
              let locked = false, busy = false;
              const tracks = CALLERS.map(() => h('div', { class: 'lane-track' }));
              const tl = h('div', { class: 'timeline' }, CALLERS.map((c, i) => h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, c), tracks[i])));
              const reqs = h('span', { class: 'chip total' }, '0');
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const bar = (i, cls, left, width, ms) => {
                const b = h('span', { class: `bar ${cls} dt-d2-bar`, style: `left:${left}%;width:0;transition-duration:${ms}ms` });
                tracks[i].append(b); void b.offsetWidth; b.style.width = `${width}%`;
                return b;
              };
              async function fire() {
                if (busy) return; busy = true;
                tracks.forEach(t => t.replaceChildren()); reqs.textContent = '0';
                say(o, '<span class="muted">all three call refreshIfStale() within a few milliseconds…</span>');
                if (!locked) {
                  CALLERS.forEach((_, i) => bar(i, 'run', 2 + i * 3, 60, 900));
                  for (let i = 1; i <= 3; i++) { await sleep(120); if (!o.isConnected) return; reqs.textContent = String(i); replay(reqs, 'pop'); }
                  await sleep(800); if (!o.isConnected) return;
                  say(o, '<span class="bad">3 requests:</span> each caller saw stale data and fetched. The same rows were downloaded and written three times.');
                } else {
                  bar(0, 'run', 2, 60, 900);
                  bar(1, 'wait', 5, 57, 900); bar(2, 'wait', 8, 54, 900);
                  await sleep(120); if (!o.isConnected) return;
                  reqs.textContent = '1'; replay(reqs, 'pop');
                  line('<span class="muted">screen opens holds the lock and fetches. The others wait.</span>');
                  await sleep(900); if (!o.isConnected) return;
                  for (const i of [1, 2]) {
                    bar(i, 'run', 62 + (i - 1) * 5, 4, 150);
                    line(`<span class="good">${CALLERS[i]}:</span> got the lock, data is fresh, returned without a request`);
                    await sleep(300); if (!o.isConnected) return;
                  }
                  say(o, '<span class="good">1 request:</span> the lock turned three refreshes into one fetch and two cheap checks.');
                }
                busy = false;
              }
              const sw = toggle('dt-d2-ca-lock', 'Mutex + TTL check inside', function () { if (busy) { this.checked = locked; return; } locked = this.checked; say(o, locked ? 'refreshIfStale() now runs inside refreshLock.withLock { }.' : 'No lock: every caller checks and fetches on its own.'); });
              say(o, 'Fire all three refreshes at once and count the requests.');
              el.append(
                h('div', { class: 'controls' }, cmd('all three refresh at once', fire), sw, h('span', { class: 'dt-sub' }, 'network requests'), reqs),
                tl,
                h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'bar run' }), 'fetching'), h('span', {}, h('i', { class: 'bar wait' }), 'waiting for the lock')),
                o);
            },
          },
          {
            title: 'Optimistic writes: update the cache first, then the server',
            body: `
<p>Caching is not only for reads. When the user stars an article, write the change to Room right away. The screen observes Room, so the star turns on instantly, with no spinner. Then send the change to the server.</p>
<p>If the server refuses, roll the row back and tell the user. Apps that work offline go one step further: they mark the row as pending and let WorkManager retry until the server accepts it.</p>`,
            code: `suspend fun setSaved(id: Int, saved: Boolean) {
    dao.setSaved(id, saved)             // the UI updates now, from Room
    try {
        api.setSaved(id, saved)
    } catch (e: IOException) {
        dao.setSaved(id, !saved)        // roll back, then let the ViewModel show a message
        throw e
    }
}`,
            visual(el) {
              const ARTS = ['Compose tips', 'Derby tonight', 'Kotlin 2.3 notes'];
              const saved = [false, true, false];
              let fail = false, busy = false;
              const phone = h('div', { class: 'phone arc-top', role: 'img', 'aria-label': 'List preview' });
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const stars = [];
              function paint() {
                stars.length = 0;
                phone.replaceChildren(...ARTS.map((t, i) => {
                  const s = h('button', { class: 'dt-d2-star' + (saved[i] ? ' dt-on' : ''), 'aria-label': `${saved[i] ? 'Unsave' : 'Save'} ${t}`, onclick: () => star(i) }, saved[i] ? '★' : '☆');
                  stars.push(s);
                  return h('div', { class: 'item dt-d2-row' }, h('span', {}, t), s);
                }));
              }
              async function star(i) {
                if (busy) return; busy = true;
                const next = !saved[i];
                saved[i] = next; paint(); stars[i].classList.add('dt-d2-pend'); replay(stars[i], 'pop');
                say(o, `${hl(`dao.setSaved(${i + 1}, ${next})`)} <span class="muted">// the star changed instantly</span>`);
                await sleep(300); if (!o.isConnected) return;
                line(`<span class="muted">api.setSaved(${i + 1}, ${next})…</span>`);
                await sleep(900); if (!o.isConnected) return;
                if (fail) {
                  saved[i] = !next; paint(); replay(stars[i], 'shake');
                  line('<span class="bad">IOException:</span> rolled the row back. Show “Couldn’t save. Try again.”');
                } else {
                  stars[i].classList.remove('dt-d2-pend'); replay(stars[i], 'pop-soft');
                  line('<span class="good">200 OK:</span> the server agrees. Nothing else to do.');
                }
                busy = false;
              }
              const sw = toggle('dt-d2-ca-fail', 'the server rejects the change', function () { if (busy) { this.checked = fail; return; } fail = this.checked; say(o, fail ? 'The next api.setSaved() call will fail.' : 'The server accepts changes again.'); });
              paint();
              say(o, 'Tap a star. The screen changes before the server answers.');
              el.append(
                h('div', { class: 'controls' }, sw),
                h('div', { class: 'dt-d2-split' }, phone, h('div', { class: 'dt-side' },
                  h('span', { class: 'dt-label' }, 'faded star'), h('span', { class: 'dt-sub' }, 'written to Room, waiting for the server'))),
                o);
            },
          },
          {
            title: 'Steer the HTTP cache from the request',
            body: `
<p>The server’s headers decide caching by default, but a request can override them. <code>CacheControl.FORCE_CACHE</code> answers only from the cache, even if the copy is stale. Use it when you know the device is offline. If nothing is cached, OkHttp returns a <code>504 Unsatisfiable Request</code> without touching the network.</p>
<p><code>CacheControl.FORCE_NETWORK</code> skips the cached copy and asks the server, for example after pull-to-refresh. In Retrofit, put the same directives on a method with <code>@Headers</code>.</p>`,
            code: `// Offline: answer from the cache only, even if stale
val offline = Request.Builder()
    .url("https://api.example.com/articles/42")
    .cacheControl(CacheControl.FORCE_CACHE)    // 504 if nothing is cached
    .build()

// Pull-to-refresh: go to the server
val fresh = Request.Builder()
    .url("https://api.example.com/articles/42")
    .cacheControl(CacheControl.FORCE_NETWORK)
    .build()

// Retrofit: accept a cached copy up to an hour past its max-age
@Headers("Cache-Control: max-stale=3600")
@GET("articles/{id}")
suspend fun getArticleAllowStale(@Path("id") id: Int): ArticleDto`,
          },
        ],
        underHood: {
          body: `
<p>OkHttp’s <code>Cache</code> is a <code>DiskLruCache</code> in the directory you gave it. Each entry is keyed by an MD5 hash of the URL and holds the response headers and the body as separate files, plus a journal that tracks use, so the oldest entries go first when the size limit is reached. Only <code>GET</code> responses are stored.</p>
<p>Before each call, a cache strategy compares the stored response’s age with its freshness: <code>max-age</code>, or <code>Expires</code>. If the server sent neither but sent <code>Last-Modified</code>, OkHttp guesses a lifetime of 10% of the time since that date. A fresh entry is returned without a request. A stale entry with an <code>ETag</code> or <code>Last-Modified</code> becomes a conditional request with <code>If-None-Match</code> or <code>If-Modified-Since</code>. On a <code>304</code>, OkHttp merges the new headers into the stored ones and returns the cached body.</p>`,
        },
        mistakes: [
          {
            title: 'Clearing the cache before the fetch',
            bad: `suspend fun refresh() {
    dao.deleteAll()
    val fresh = api.latest()          // throws when offline
    dao.insertAll(fresh.map { it.toEntity() })
}`,
            good: `suspend fun refresh() {
    val fresh = api.latest()          // fetch first
    dao.replaceAll(fresh.map { it.toEntity() })   // delete + insert in one @Transaction
}`,
            why: 'Offline, the fetch throws after the delete, and the user is left with an empty screen instead of yesterday’s articles. Even online, the screen flashes empty between the two writes.',
          },
          {
            title: 'Keeping the fetch time in memory',
            bad: `private var lastFetch = 0L

suspend fun refreshIfStale() {
    if (now() - lastFetch < TTL) return
    /* fetch, then */ lastFetch = now()
}`,
            good: `suspend fun refreshIfStale() {
    val fetchedAt = dao.oldestFetchedAt() ?: 0L   // stored with the rows
    if (now() - fetchedAt < TTL) return
    /* fetch and store fetchedAt = now() */
}`,
            why: 'Every cold start and every process death resets the variable to 0, so the app refetches data it fetched a minute ago. Store the time next to the data it describes.',
          },
          {
            title: 'An in-memory cache with no limit',
            bad: `private val thumbnails = mutableMapOf<String, Bitmap>()`,
            good: `private val thumbnails = object : LruCache<String, Bitmap>(16 * 1024 * 1024) {
    override fun sizeOf(key: String, value: Bitmap) = value.byteCount
}`,
            why: 'A plain map only grows, until the app runs out of memory. <code>LruCache</code> has a size budget and drops the least recently used entries first.',
          },
        ],
        visual(el) {
          const STRATS = {
            net: 'network only',
            ctn: 'cache then network',
            ttl: 'TTL + stale-while-revalidate',
            http: 'OkHttp HTTP cache',
          };
          let strat = 'ctn', busy = false;
          const lanes = ['UI', 'cache', 'network'].map(n => {
            const track = h('div', { class: 'lane-track' });
            const cur = h('div', { class: 'cursor', style: 'left:0' });
            track.append(cur);
            return { n, track, cur, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, n), track) };
          });
          const L = { UI: lanes[0], cache: lanes[1], network: lanes[2] };
          const screen = h('div', { class: 'dt-screen', 'aria-live': 'polite' });
          const o = out();
          const offSw = toggle('dt-ca-off', 'offline', () => {});
          const oldSw = toggle('dt-ca-old', 'cache is 2 h old (TTL 10 min)', () => {});
          oldSw.input.checked = true;
          const ageText = () => (oldSw.input.checked ? '2 h old' : '2 min old');
          function show(kind, banner) {
            const list = tag => [h('div', { class: 'dt-head' }, h('b', {}, 'Top stories'), tag), h('div', { class: 'dt-item' }, kind === 'fresh' ? 'Derby tonight: line-ups are out' : 'Derby tonight: kickoff at 20:00'), h('div', { class: 'dt-item' }, kind === 'fresh' ? 'Weather: storm warning lifted' : 'Weather: storm warning')];
            const kids =
              kind === 'spin' ? [h('div', { class: 'spinner' }), h('span', { class: 'dt-sub' }, 'Loading...')] :
              kind === 'error' ? [h('div', { class: 'err-icon' }, '!'), h('b', {}, 'No connection'), h('span', { class: 'dt-sub' }, 'Nothing saved to show.')] :
              kind === 'blank' ? [h('span', { class: 'dt-sub' }, 'Screen not open yet.')] :
              list(h('span', { class: 'dt-pill ' + (kind === 'fresh' ? 'dt-ok' : 'dt-warn') }, kind === 'fresh' ? 'fresh' : `cached · ${ageText()}`));
            if (banner) kids.push(h('span', { class: 'dt-pill dt-bad' }, banner));
            screen.replaceChildren(...kids);
            screen.style.justifyItems = kind === 'spin' || kind === 'error' ? 'center' : '';
            replay(screen, 'pop-soft');
          }
          function plan() {
            const off = offSw.input.checked, old = oldSw.input.checked;
            const B = [], E = [];
            const bar = (lane, s, end, cls) => B.push({ lane, s, end, cls });
            const ev = (t, fn) => E.push({ t, fn });
            const log = (t, html) => ev(t, () => line(o, html));
            if (strat === 'net') {
              bar('UI', 0, off ? 40 : 62, 'wait');
              ev(0, () => show('spin')); log(0, 'no cache in this design: spinner until the server answers');
              if (off) { bar('network', 4, 40, 'block'); ev(40, () => show('error')); log(40, '<span class="bad">IOException:</span> Unable to resolve host "api.example.com"'); }
              else { bar('network', 4, 60, 'run'); bar('UI', 62, 100, 'dt-bar-ok'); ev(62, () => show('fresh')); log(60, '<span class="good">200 OK</span> after 1.3 s, the user waited the whole time'); }
            } else if (strat === 'http') {
              if (!old) {
                bar('UI', 0, 9, 'wait'); bar('cache', 2, 9, 'run'); bar('UI', 9, 100, 'dt-bar-ok');
                ev(0, () => show('spin')); ev(9, () => show('fresh'));
                log(9, '<span class="good">cache hit</span> within max-age=600: no network request' + (off ? ', so offline is fine' : ''));
              } else if (off) {
                bar('UI', 0, 32, 'wait'); bar('network', 3, 32, 'block');
                ev(0, () => show('spin')); ev(32, () => show('error'));
                log(32, '<span class="bad">IOException</span>: stale entry needs revalidation <span class="muted">// accept stale with CacheControl max-stale when offline</span>');
              } else {
                bar('UI', 0, 38, 'wait'); bar('network', 3, 30, 'run'); bar('cache', 30, 38, 'run'); bar('UI', 38, 100, 'dt-bar-ok');
                ev(0, () => show('spin'));
                log(3, `${hl('GET /latest')} <span class="muted">If-None-Match: "a1f9"</span>`);
                log(30, '<span class="good">304 Not Modified</span>: headers only, body comes from disk');
                ev(38, () => { show('fresh'); });
              }
            } else {
              bar('cache', 0, 8, 'run'); bar('UI', 0, 8, 'wait');
              ev(0, () => show('blank'));
              ev(8, () => show('stale')); log(8, `Room emits the cached rows (${ageText()}) at once`);
              const fetch = strat === 'ctn' || old;
              if (!fetch) { bar('UI', 8, 100, 'dt-bar-stale'); log(10, `<span class="good">age 2 min &lt; TTL 10 min:</span> no network call at all`); }
              else if (off) {
                bar('network', 8, 42, 'block'); bar('UI', 8, 100, 'dt-bar-stale');
                ev(42, () => show('stale', 'offline: showing saved copy'));
                log(42, '<span class="bad">IOException</span>: keep the cached rows, add a banner');
              } else {
                if (strat === 'ttl') log(9, '<span class="muted">age 2 h &gt; TTL: revalidate in the background, keep showing the stale copy</span>');
                else log(9, '<span class="muted">always fetch, even if the cache were 1 second old</span>');
                bar('network', 8, 58, 'run'); bar('cache', 58, 64, 'run'); bar('UI', 8, 64, 'dt-bar-stale'); bar('UI', 64, 100, 'dt-bar-ok');
                log(58, `<span class="good">200 OK</span> ${hl('dao.replaceAll(fresh)')}`);
                ev(64, () => show('fresh')); log(64, 'Room emits again, the screen swaps to fresh data');
              }
            }
            return { B, E, refreshed: !off && (strat === 'ctn' || (strat !== 'net' && old)) };
          }
          async function run() {
            if (busy) return; busy = true;
            const { B, E, refreshed } = plan();
            lanes.forEach(l => { l.track.querySelectorAll('.bar').forEach(b => b.remove()); l.cur.style.left = '0'; });
            const bars = B.map(b => { const node = h('div', { class: 'bar ' + b.cls, style: `left:${b.s}%;width:0` }); L[b.lane].track.insertBefore(node, L[b.lane].cur); return { ...b, node }; });
            say(o, `<b>${STRATS[strat]}</b>${offSw.input.checked ? ' · offline' : ''}: openScreen()`);
            const fired = new Set();
            for (let t = 0; t <= 100; t += 2) {
              lanes.forEach(l => { l.cur.style.left = t + '%'; });
              bars.forEach(b => { if (t >= b.s) b.node.style.width = Math.max(0.8, Math.min(t, b.end) - b.s) + '%'; });
              E.forEach((x, i) => { if (!fired.has(i) && x.t <= t) { fired.add(i); x.fn(); } });
              await sleep(40); if (!o.isConnected) return;
            }
            if (refreshed && oldSw.input.checked) { oldSw.input.checked = false; line(o, '<span class="muted">the cache is fresh now: open again to see the TTL skip the network</span>'); }
            busy = false;
          }
          const sBtns = Object.entries(STRATS).map(([k, label]) => act(label, function () { if (busy) return; strat = k; press(sBtns, this); run(); }));
          press(sBtns, sBtns[1]);
          el.append(
            h('div', { class: 'controls' }, sBtns),
            h('div', { class: 'controls' }, offSw, oldSw, cmd('openScreen()', run)),
            h('div', { class: 'dt-grid' },
              h('div', { class: 'timeline' }, lanes.map(l => l.el),
                h('div', { class: 'legend' },
                  h('span', {}, h('i', { class: 'bar wait' }), 'waiting'), h('span', {}, h('i', { class: 'bar run' }), 'working'),
                  h('span', {}, h('i', { class: 'bar block' }), 'failed'), h('span', {}, h('i', { class: 'bar dt-bar-stale' }), 'stale shown'),
                  h('span', {}, h('i', { class: 'bar dt-bar-ok' }), 'fresh shown'))),
              screen),
            o);
          show('blank');
          run();
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'paging',
        title: 'Paging 3',
        tagline: 'Load a long list one page at a time, as the user scrolls.',
        level: 'intermediate',
        body: `
<p>A feed can have thousands of items. Paging 3 loads them in pages. You write a <code>PagingSource</code> whose <code>load()</code> fetches one page for a key and returns the data plus the keys before and after it. A <code>Pager</code> turns that into a <code>Flow&lt;PagingData&gt;</code>, and <code>cachedIn(viewModelScope)</code> keeps loaded pages across configuration changes.</p>
<p>In Compose, <code>collectAsLazyPagingItems()</code> gives you <code>LazyPagingItems</code>. When the list scrolls within <code>prefetchDistance</code> of the end, Paging asks for the next page. <code>loadState</code> tells you whether refresh, prepend or append is loading, failed or done, so you can show a spinner or a retry row.</p>
<p>Note that <code>initialLoadSize</code> defaults to three times <code>pageSize</code>. With page-number keys, set them equal. For offline-first lists, a <code>RemoteMediator</code> fetches pages from the network into Room, and the Pager reads from Room's own <code>PagingSource</code>.</p>`,
        code: `class ArticlePagingSource(private val api: NewsApi) : PagingSource<Int, Article>() {
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Article> {
        val page = params.key ?: 1
        return try {
            val items = api.articles(page = page, pageSize = params.loadSize)
            LoadResult.Page(
                data = items,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (items.isEmpty()) null else page + 1,
            )
        } catch (e: IOException) {
            LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, Article>): Int? =
        state.anchorPosition?.let { pos ->
            state.closestPageToPosition(pos)?.let { it.prevKey?.plus(1) ?: it.nextKey?.minus(1) }
        }
}

class FeedViewModel(api: NewsApi) : ViewModel() {
    val articles: Flow<PagingData<Article>> = Pager(
        config = PagingConfig(pageSize = 20, initialLoadSize = 20),
        pagingSourceFactory = { ArticlePagingSource(api) },   // a new source on every refresh
        // offline-first: remoteMediator = ArticleRemoteMediator(api, db), source = { db.articleDao().pagingSource() }
    ).flow.cachedIn(viewModelScope)
}

@Composable
fun Feed(vm: FeedViewModel) {
    val items = vm.articles.collectAsLazyPagingItems()
    LazyColumn {
        items(count = items.itemCount, key = items.itemKey { it.id }) { index ->
            items[index]?.let { ArticleRow(it) }
        }
        when (val append = items.loadState.append) {
            is LoadState.Loading -> item { CircularProgressIndicator() }
            is LoadState.Error -> item { RetryRow(append.error, onRetry = items::retry) }
            is LoadState.NotLoading -> Unit
        }
    }
}`,
        remember: 'PagingSource loads one page, Pager makes the Flow, cachedIn keeps it, loadState drives the spinner.',
        terms: [
          { term: 'PagingSource', def: 'A class whose load function returns one page of data plus the keys of the previous and next pages.' },
          { term: 'Pager', def: 'The Paging 3 entry point that combines a PagingConfig and a PagingSource factory into a Flow of PagingData.' },
          { term: 'LazyPagingItems', def: 'The Compose-side handle from collectAsLazyPagingItems that exposes item count, items, loadState, retry and refresh.' },
          { term: 'RemoteMediator', def: 'A Paging component that loads pages from the network into a local database when the database runs out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep pages across rotation and collect them in Compose.', code: 'val articles = Pager(\n    config = PagingConfig(pageSize = 20),\n    pagingSourceFactory = { ArticlePagingSource(api) },\n).flow.[[cachedIn]](viewModelScope)\n\n// in the composable\nval items = vm.articles.[[collectAsLazyPagingItems]]()', why: '<code>cachedIn</code> shares and caches the loaded pages in the ViewModel scope. <code>collectAsLazyPagingItems</code> hands them to a <code>LazyColumn</code>.' },
          { type: 'bug', prompt: 'Pull-to-refresh crashes with "An instance of PagingSource was re-used". Tap the line.', code: 'class FeedViewModel(api: NewsApi) : ViewModel() {\n    private val source = ArticlePagingSource(api)\n\n    val articles = Pager(\n        config = PagingConfig(pageSize = 20),\n        pagingSourceFactory = { source },\n    ).flow.cachedIn(viewModelScope)\n}', bug: 5, fix: '        pagingSourceFactory = { ArticlePagingSource(api) },', why: 'A PagingSource is single-use. Each refresh invalidates it, so the factory must build a fresh one every time it is called.' },
        ],
        quiz: [
          { q: 'What triggers loading the next page?', options: ['A timer', 'The list scrolling within prefetchDistance of the last loaded item', 'Calling <code>load()</code> from the UI'], a: 1, why: 'Reading items near the end tells Paging the user is getting close, and it calls <code>load</code> with the next key.' },
          { q: 'An append load fails. How does the user try again?', options: ['<code>items.retry()</code>', 'Recreate the Pager', 'Call <code>invalidate()</code> on the Flow'], a: 0, why: '<code>retry()</code> re-runs only the failed load. <code>refresh()</code> would reload from scratch.' },
          { q: 'What does <code>RemoteMediator</code> add?', options: ['Faster JSON parsing', 'Pages fetched from the network land in Room, and the UI pages from Room, so the list works offline', 'Placeholders for missing items'], a: 1, why: 'The database becomes the single source of truth. The mediator fills it when Paging reaches the end of what is stored.' },
          { q: 'getRefreshKey() always returns null. The data changes while the user is at item 300. What happens?', options: ['The list reloads around item 300', 'The list jumps back to the top', 'Paging keeps the old source'], a: 1, why: 'A null refresh key makes the new PagingSource start from the first page. Return the key of the page around anchorPosition to keep the user’s place.' },
          { q: '<pre style="white-space:pre-wrap;overflow-wrap:anywhere">@Composable\nfun Feed(vm: FeedViewModel) {\n    val items = vm.pager().flow.collectAsLazyPagingItems()\n}</pre>What goes wrong?', options: ['Nothing', 'Each recomposition builds a new Pager and loads from page 1 again', 'Paging throws because the flow is not cached'], a: 1, why: 'pager() makes a new Pager on every call. Keep one flow in the ViewModel as a property, with cachedIn(viewModelScope).' },
        ],
        deeper: [
          {
            title: 'getRefreshKey keeps the user’s place',
            body: `
<p>A <code>PagingSource</code> is single-use. When data changes, it is invalidated and the Pager makes a new one. The new source has to start loading somewhere. Paging calls <code>getRefreshKey()</code> with the old state, including <code>anchorPosition</code>, the last index the UI read.</p>
<p>Return the key of the page around that index and the reload starts where the user is looking. Return <code>null</code> and it starts from the first page, so the list jumps back to the top.</p>`,
            code: `override fun getRefreshKey(state: PagingState<Int, Article>): Int? {
    val anchor = state.anchorPosition ?: return null          // last index the UI read
    val page = state.closestPageToPosition(anchor) ?: return null
    return page.prevKey?.plus(1) ?: page.nextKey?.minus(1)    // the key that loaded that page
}`,
            visual(el) {
              const PAGE = 10, MAXP = 8;
              let anchor = 47, loaded = [4, 5, 6], keyOn = true, busy = false, wait = null;
              const pages = h('div', { class: 'dt-pages' });
              const rows = h('div', { class: 'dt-screen' });
              const anc = h('span', { class: 'dt-pill' });
              const o = out();
              const pageOf = i => Math.floor((i - 1) / PAGE) + 1;
              function paint() {
                pages.replaceChildren(...Array.from({ length: MAXP }, (_, i) => h('span', { class: 'dt-page' + (loaded.includes(i + 1) ? ' dt-in' : wait === i + 1 ? ' dt-wait' : '') }, `p${i + 1}`)));
                anc.textContent = `anchorPosition = ${anchor} (page ${pageOf(anchor)})`;
                rows.replaceChildren(...(loaded.includes(pageOf(anchor))
                  ? Array.from({ length: 4 }, (_, i) => h('div', { class: 'dt-row' + (pageOf(anchor + i) % 2 ? '' : ' dt-odd') }, h('b', {}, `#${anchor + i}`), h('span', {}, `Article ${anchor + i}`)))
                  : [h('div', { class: 'spinner dt-spin' })]));
              }
              function scroll(to) {
                if (busy) return;
                anchor = to; const p = pageOf(to); loaded = [p - 1, p, p + 1].filter(x => x >= 1 && x <= MAXP);
                paint(); replay(rows, 'pop-soft');
                say(o, `Scrolled to #${to}. Pages ${loaded.join(', ')} are in memory.`);
              }
              async function invalidate() {
                if (busy) return; busy = true;
                say(o, '<span class="muted">The data changed: invalidate(). The old PagingSource is done; a new one is created.</span>');
                loaded = []; paint(); replay(pages, 'pop-soft');
                await sleep(600); if (!el.isConnected) return;
                const key = keyOn ? pageOf(anchor) : null;
                line(o, hl(`getRefreshKey(state) // anchorPosition = ${anchor}`) + ` → <b>${key}</b>`);
                const start = key || 1;
                if (!keyOn) anchor = 1;
                wait = start; paint();
                line(o, hl(`load(LoadParams.Refresh(key = ${key}))`));
                await sleep(700); if (!el.isConnected) return;
                wait = null; loaded = [start]; paint(); replay(rows, 'pop-soft');
                for (const p of [start - 1, start + 1].filter(x => x >= 1 && x <= MAXP)) {
                  await sleep(450); if (!el.isConnected) return;
                  loaded.push(p); loaded.sort((a, b) => a - b); paint();
                  line(o, `<span class="muted">${p < start ? 'prepend' : 'append'} page ${p}</span>`);
                }
                line(o, keyOn
                  ? `<span class="good">The user still sees #${anchor}. Only the pages around it were reloaded.</span>`
                  : '<span class="bad">getRefreshKey returned null, so the reload started at page 1. The user lost their place.</span>');
                busy = false;
              }
              const sw = toggle('dt-d-refkey', 'getRefreshKey uses the anchor', () => { if (busy) { sw.input.checked = keyOn; return; } keyOn = sw.input.checked; });
              sw.input.checked = true;
              paint();
              say(o, 'The user scrolled to #47. Now the server data changes.');
              el.append(
                h('div', { class: 'controls' }, act('scroll to #23', () => scroll(23)), act('scroll to #47', () => scroll(47)), cmd('invalidate()', invalidate), sw),
                h('div', { class: 'dt-pg' },
                  h('div', { class: 'dt-side' }, h('span', { class: 'dt-label' }, 'on screen'), rows),
                  h('div', { class: 'dt-side' }, h('span', { class: 'dt-label' }, 'pages in memory'), pages, anc)),
                o);
            },
          },
          {
            title: 'RemoteMediator: the network fills Room, Paging reads Room',
            body: `
<p>For an offline-first feed, the Pager reads pages from Room’s own <code>PagingSource</code>. When the user scrolls past the last row Room has, Paging calls your <code>RemoteMediator</code>. It fetches the next page from the network and writes it to Room in a transaction.</p>
<p>The write invalidates Room’s PagingSource, a new one is created, and the fresh rows reach the list. The network never talks to the UI. If the call fails, the list keeps every row already stored, and <code>loadState.mediator</code> reports the error.</p>`,
            code: `@OptIn(ExperimentalPagingApi::class)
class ArticleRemoteMediator(
    private val api: NewsApi,
    private val db: AppDatabase,
) : RemoteMediator<Int, ArticleEntity>() {
    override suspend fun load(loadType: LoadType, state: PagingState<Int, ArticleEntity>): MediatorResult {
        val page = when (loadType) {
            LoadType.REFRESH -> 1
            LoadType.PREPEND -> return MediatorResult.Success(endOfPaginationReached = true)
            LoadType.APPEND -> db.remoteKeys().nextPage() ?: return MediatorResult.Success(endOfPaginationReached = true)
        }
        return try {
            val items = api.articles(page = page, pageSize = state.config.pageSize)
            db.withTransaction {
                if (loadType == LoadType.REFRESH) db.articles().clearAll()
                db.remoteKeys().setNextPage(if (items.isEmpty()) null else page + 1)
                db.articles().insertAll(items.map { it.toEntity() })
            }
            MediatorResult.Success(endOfPaginationReached = items.isEmpty())
        } catch (e: IOException) {
            MediatorResult.Error(e)
        }
    }
}

// Pager(config, remoteMediator = ArticleRemoteMediator(api, db)) { db.articles().pagingSource() }`,
            visual(el) {
              const PAGE = 10, MAXP = 4;
              let room = 10, shown = 10, gen = 1, next = 2, offline = false, busy = false, med = 'NotLoading';
              const apiPill = h('span', { class: 'dt-pill' }), roomPill = h('span', { class: 'dt-pill' }), srcPill = h('span', { class: 'dt-pill' }), medPill = h('span', { class: 'dt-pill' });
              const cards = {
                api: h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'NewsApi'), apiPill), h('span', { class: 'dt-sub' }, 'GET /articles?page=n')),
                med: h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'RemoteMediator'), medPill), h('span', { class: 'dt-sub' }, 'called when Room runs out')),
                room: h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'Room · articles'), roomPill), h('span', { class: 'dt-sub' }, 'the single source of truth')),
                src: h('div', { class: 'dt-card' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'PagingSource'), srcPill), h('span', { class: 'dt-sub' }, 'Room’s, reads rows only')),
              };
              const feed = h('div', { class: 'dt-screen' });
              const o = out();
              const lit = (k, cls) => { Object.values(cards).forEach(c => c.classList.remove('dt-on')); if (k) { cards[k].classList.add(cls || 'dt-on'); replay(cards[k], 'pop-soft'); } };
              function paint() {
                apiPill.textContent = next > MAXP ? 'no more pages' : `next page ${next}`;
                roomPill.textContent = `${room} rows`;
                srcPill.textContent = `generation ${gen}`;
                medPill.textContent = `append: ${med}`;
                medPill.className = 'dt-pill' + (med === 'Error' ? ' dt-bad' : med === 'Loading' ? ' dt-warn' : med.startsWith('end') ? ' dt-ok' : '');
                feed.replaceChildren(...(shown
                  ? [h('span', { class: 'dt-sub' }, `${shown} items loaded`), ...[shown - 2, shown - 1, shown].filter(i => i > 0).map(i => h('div', { class: 'dt-item' }, `#${i} Article ${i}`))]
                  : [h('div', { class: 'spinner dt-spin' })]));
              }
              async function scrollEnd() {
                if (busy) return; busy = true;
                if (shown < room) {
                  lit('src'); line(o, hl(`PagingSource.load(Append) // from Room`));
                  await sleep(500); if (!el.isConnected) return;
                  shown = Math.min(room, shown + PAGE); paint(); replay(feed, 'pop-soft');
                  line(o, '<span class="good">read from disk, no network needed</span>');
                  busy = false; return;
                }
                lit('med'); med = 'Loading'; paint();
                line(o, `<span class="muted">Room has no more rows:</span> ${hl('mediator.load(LoadType.APPEND)')}`);
                await sleep(550); if (!el.isConnected) return;
                if (next > MAXP) {
                  med = 'end reached'; paint();
                  line(o, '<span class="good">MediatorResult.Success(endOfPaginationReached = true)</span>');
                  busy = false; return;
                }
                lit('api', offline ? 'dt-on' : 'dt-on');
                line(o, hl(`GET /articles?page=${next}`));
                await sleep(600); if (!el.isConnected) return;
                if (offline) {
                  med = 'Error'; paint(); replay(cards.api, 'shake'); lit(null);
                  line(o, `<span class="bad">MediatorResult.Error(IOException)</span> <span class="muted">The list keeps its ${shown} rows. Show a retry row from loadState.</span>`);
                  busy = false; return;
                }
                lit('room'); room += PAGE; next++; paint();
                line(o, `<span class="muted">withTransaction { insertAll(${PAGE} rows) }</span>`);
                await sleep(550); if (!el.isConnected) return;
                lit('src'); gen++; paint();
                line(o, `<span class="muted">table changed: PagingSource invalidated, generation ${gen} created</span>`);
                await sleep(550); if (!el.isConnected) return;
                shown = room; med = 'NotLoading'; lit(null); paint(); replay(feed, 'pop-soft');
                line(o, `<span class="good">${PAGE} new rows reached the list through Room.</span>`);
                busy = false;
              }
              async function reopen() {
                if (busy) return; busy = true;
                shown = 0; gen++; med = 'NotLoading'; paint();
                say(o, '<span class="muted">app restarted…</span>');
                await sleep(600); if (!el.isConnected) return;
                lit('src'); shown = Math.min(room, 2 * PAGE); paint(); replay(feed, 'pop-soft');
                line(o, `<span class="good">The first ${shown} rows came straight from Room${offline ? ', with the network off' : ''}.</span>`);
                busy = false;
              }
              const sw = toggle('dt-d-medoff', 'offline', () => { if (busy) { sw.input.checked = offline; return; } offline = sw.input.checked; say(o, offline ? 'Offline. Scroll to the end of what Room has.' : 'Back online.'); });
              paint();
              say(o, 'Room already holds page 1 from last time. Scroll to the end.');
              el.append(
                h('div', { class: 'controls' }, act('scroll to the end', scrollEnd), act('restart the app', reopen), sw),
                h('div', { class: 'dt-grid' }, cards.api, cards.med, cards.room, cards.src),
                h('span', { class: 'dt-label' }, 'the list'), feed,
                o);
            },
          },
          {
            title: 'Transform pages before you cache them',
            body: `
<p><code>PagingData</code> has its own <code>map</code>, <code>filter</code> and <code>insertSeparators</code>. They run on each page as it loads, so you can turn rows into UI items and add day headers without loading the whole list. Apply them inside the flow’s <code>map</code> and before <code>cachedIn</code>, so the result is cached and not computed again on every rotation.</p>`,
            code: `sealed interface FeedItem {
    data class Story(val article: Article) : FeedItem
    data class DayHeader(val day: String) : FeedItem
}

val feed: Flow<PagingData<FeedItem>> = pager.flow
    .map { page ->
        page.filter { !it.hidden }
            .map { FeedItem.Story(it) }
            .insertSeparators { before, after ->
                if (after != null && before?.article?.day != after.article.day) FeedItem.DayHeader(after.article.day)
                else null
            }
    }
    .cachedIn(viewModelScope)`,
          },
        ],
        underHood: {
          body: `
<p><code>Pager.flow</code> emits one <code>PagingData</code> per generation, which means per <code>PagingSource</code>. Inside it is a stream of events: insert a page, drop a page, update a load state. On the UI side a presenter applies those events to a snapshot list, which is what <code>LazyPagingItems</code> reads.</p>
<p>Reading <code>items[index]</code> does more than return an item. It tells the presenter which index the UI touched. That hint travels back to the fetcher, which compares it with <code>prefetchDistance</code> and calls <code>load</code> for the next or previous key. When <code>maxSize</code> is set, pages far from the hint are dropped to save memory. Room’s generated PagingSource listens to its invalidation tracker and calls <code>invalidate()</code> on any write to the table, which starts the next generation.</p>`,
        },
        mistakes: [
          {
            title: 'A next key that never ends',
            bad: `LoadResult.Page(
    data = items,
    prevKey = if (page == 1) null else page - 1,
    nextKey = page + 1,
)`,
            good: `LoadResult.Page(
    data = items,
    prevKey = if (page == 1) null else page - 1,
    nextKey = if (items.isEmpty()) null else page + 1,
)`,
            why: 'A <code>null</code> next key is how Paging learns the list is over. Without it, every scroll to the end requests another empty page, and the footer spinner never goes away.',
          },
          {
            title: 'An empty state that flashes during the first load',
            bad: `if (items.itemCount == 0) {
    EmptyState()
}`,
            good: `val refresh = items.loadState.refresh
if (refresh is LoadState.NotLoading && items.itemCount == 0) {
    EmptyState()
}`,
            why: 'Before the first page arrives, <code>itemCount</code> is 0 too. Check that the refresh finished before you tell the user there is nothing.',
          },
          {
            title: 'Building the Pager in a function the UI calls',
            bad: `fun articles() = Pager(PagingConfig(pageSize = 20)) { ArticlePagingSource(api) }.flow

// in a composable
val items = vm.articles().collectAsLazyPagingItems()`,
            good: `val articles = Pager(PagingConfig(pageSize = 20)) { ArticlePagingSource(api) }
    .flow
    .cachedIn(viewModelScope)`,
            why: 'Every recomposition gets a new Pager and loads from page 1 again. Keep one cached flow in the ViewModel as a property.',
          },
        ],
        visual(el) {
          const PAGE = 8, PREFETCH = 4, MAX = 6, ROW = 40;
          const TITLES = ['Derby tonight', 'Compose tips', 'Transfer news', 'Kotlin 2.3 notes', 'Weather alert', 'Market close', 'Paging deep dive', 'Room 2.8'];
          let items = [], pages = 0, refresh = 'idle', append = 'idle', failNext = false, gen = 0;
          const list = h('div', { class: 'dt-feed', tabindex: '0', 'aria-label': 'Paged feed' });
          const foot = h('div', { class: 'dt-foot' });
          const spinTop = h('div', { class: 'dt-refresh' }, h('div', { class: 'spinner dt-spin' }));
          const sRefresh = h('div', { class: 'dt-state' }), sPrepend = h('div', { class: 'dt-state' }), sAppend = h('div', { class: 'dt-state' });
          const pageMap = h('div', { class: 'dt-pages' });
          const o = out();
          const text = s => ({ idle: 'NotLoading', loading: 'Loading', error: 'Error', end: 'NotLoading(end)' }[s]);
          const cls = s => 'dt-state' + ({ loading: ' dt-loading', error: ' dt-err', end: ' dt-end' }[s] || '');
          function paintStates() {
            sRefresh.className = cls(refresh); sRefresh.innerHTML = `<span>refresh</span><span>${text(refresh)}</span>`;
            sPrepend.className = cls('end'); sPrepend.innerHTML = '<span>prepend</span><span>NotLoading(end)</span>';
            sAppend.className = cls(append); sAppend.innerHTML = `<span>append</span><span>${text(append)}</span>`;
            pageMap.replaceChildren(...Array.from({ length: MAX }, (_, i) => {
              const p = i + 1;
              const c = p <= pages ? ' dt-in' : p === pages + 1 && (append === 'loading' || refresh === 'loading') ? ' dt-wait' : p === pages + 1 && (append === 'error' || refresh === 'error') ? ' dt-fail' : '';
              return h('span', { class: 'dt-page' + c }, `p${p}`);
            }));
          }
          function paintFoot() {
            if (append === 'loading' && refresh !== 'loading') foot.replaceChildren(h('div', { class: 'spinner dt-spin' }), h('span', {}, `Loading page ${pages + 1}`));
            else if (append === 'error' || refresh === 'error') foot.replaceChildren(h('span', {}, `Couldn't load page ${pages + 1}.`), cmd('retry()', retry));
            else if (append === 'end') foot.replaceChildren(h('span', {}, `End of list · ${items.length} items`));
            else foot.replaceChildren();
          }
          function paintList() {
            const rows = items.map((t, i) => h('div', { class: 'dt-row' + (Math.floor(i / PAGE) % 2 ? ' dt-odd' : '') }, h('b', {}, `#${i + 1}`), h('span', {}, t)));
            list.replaceChildren(...(refresh === 'loading' ? [spinTop] : []), ...rows, foot);
          }
          const paint = () => { paintStates(); paintFoot(); paintList(); };
          async function load(kind) {
            const my = gen;
            const page = kind === 'refresh' ? 1 : pages + 1;
            if (kind === 'refresh') refresh = 'loading'; else append = 'loading';
            paint();
            line(o, hl(`load(LoadParams.${kind === 'refresh' ? 'Refresh' : 'Append'}(key = ${kind === 'refresh' ? 'null' : page}, loadSize = ${PAGE}))`));
            await sleep(750); if (!o.isConnected || my !== gen) return;
            if (failNext) {
              failNext = false; failSw.input.checked = false;
              if (kind === 'refresh') refresh = 'error'; else append = 'error';
              paint();
              line(o, '<span class="bad">LoadResult.Error</span>(IOException("timeout"))');
              return;
            }
            const fresh = Array.from({ length: PAGE }, (_, i) => TITLES[(page * 3 + i) % TITLES.length]);
            if (kind === 'refresh') { items = fresh; refresh = 'idle'; append = 'idle'; } else { items = items.concat(fresh); append = 'idle'; }
            pages = page;
            if (pages === MAX) append = 'end';
            paint();
            line(o, `<span class="good">LoadResult.Page</span>(${PAGE} items, prevKey = ${page === 1 ? 'null' : page - 1}, nextKey = ${page === MAX ? 'null' : page + 1})`);
            check();
          }
          function check() {
            if (refresh !== 'idle' || append !== 'idle') return;
            const lastVisible = Math.floor((list.scrollTop + list.clientHeight) / ROW);
            if (items.length - lastVisible <= PREFETCH) {
              line(o, `<span class="muted">item #${Math.min(lastVisible, items.length)} visible, ${Math.max(0, items.length - lastVisible)} left ≤ prefetchDistance ${PREFETCH}</span>`);
              load('append');
            }
          }
          function retry() {
            if (append === 'error') { say(o, 'retry() re-runs only the failed load:'); load('append'); }
            else if (refresh === 'error') { say(o, 'retry() re-runs the failed refresh:'); load('refresh'); }
            else { say(o, '<span class="muted">Nothing failed, so retry() does nothing.</span>'); replay(foot, 'shake'); }
          }
          list.addEventListener('scroll', check, { passive: true });
          const failSw = toggle('dt-pg-fail', 'next load fails', () => { failNext = failSw.input.checked; });
          el.append(
            h('div', { class: 'dt-pg' },
              list,
              h('div', { class: 'dt-side' },
                h('span', { class: 'dt-label' }, 'items.loadState'), h('div', { class: 'dt-states' }, sRefresh, sPrepend, sAppend),
                h('span', { class: 'dt-label' }, 'pages in memory'), pageMap,
                h('span', { class: 'tip' }, `PagingConfig(pageSize = ${PAGE}, initialLoadSize = ${PAGE}, prefetchDistance = ${PREFETCH})`))),
            h('div', { class: 'controls' },
              act('scroll down', () => { list.scrollBy({ top: 200, behavior: 'smooth' }); }),
              failSw,
              cmd('retry()', retry),
              cmd('refresh()', () => {
                gen++; list.scrollTop = 0; pages = 0; refresh = 'idle'; append = 'idle';
                say(o, 'refresh(): anchor at the top, getRefreshKey → 1, a new PagingSource');
                load('refresh');
              })),
            o);
          paint();
          say(o, 'Initial load:');
          load('refresh');
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'files',
        title: 'Files and MediaStore',
        tagline: 'Your app’s private files, shared media, and the Photo Picker.',
        level: 'intermediate',
        body: `
<p>App-specific storage is yours alone. <code>filesDir</code> and <code>cacheDir</code> need no permission, other apps cannot read them, and they are deleted when the app is uninstalled. <code>getExternalFilesDir()</code> is also app-specific, just on the larger shared volume.</p>
<p>Scoped storage (Android 10 and later) keeps apps out of each other's files on shared storage. To add a photo, song or download that the user keeps, insert it through MediaStore. Set <code>IS_PENDING</code> while you write, then clear it so Gallery can see the file. Your own MediaStore items need no permission.</p>
<p>To read the user's photos, use the Photo Picker. The system shows the picker, the user chooses, and you get a <code>content://</code> Uri for just that item, with no storage permission at all. Reading another app's file by path fails.</p>`,
        code: `// App-specific: no permission, removed on uninstall
File(context.filesDir, "draft.md").writeText(markdown)

// Shared: add a photo to Pictures/News through MediaStore (no permission on API 29+)
val resolver = context.contentResolver
val collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
val values = ContentValues().apply {
    put(MediaStore.Images.Media.DISPLAY_NAME, "news-card.jpg")
    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
    put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/News")
    put(MediaStore.Images.Media.IS_PENDING, 1)        // hidden from other apps while writing
}
val uri = resolver.insert(collection, values) ?: return
resolver.openOutputStream(uri)?.use { bitmap.compress(Bitmap.CompressFormat.JPEG, 90, it) }
resolver.update(uri, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 0) }, null, null)

// Reading the user's photos: the Photo Picker, no permission needed
val pickMedia = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
    if (uri != null) viewModel.attach(uri)
}
Button(onClick = {
    pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
}) { Text("Attach photo") }`,
        remember: 'Private files in filesDir, shared media through MediaStore, other people’s photos through the Photo Picker.',
        terms: [
          { term: 'App-specific storage', def: 'Directories like filesDir and cacheDir that only your app can access and that are deleted on uninstall.' },
          { term: 'Scoped storage', def: 'The Android 10+ model where each app sees only its own files and its own MediaStore items on shared storage.' },
          { term: 'MediaStore', def: 'The system content provider that indexes shared media such as images, video, audio and downloads.' },
          { term: 'Photo Picker', def: 'A system UI that lets the user choose photos or videos and gives your app a read Uri without storage permissions.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the user attach one image without asking for a permission.', code: 'val pickMedia = rememberLauncherForActivityResult(\n    ActivityResultContracts.[[PickVisualMedia]]()\n) { uri -> if (uri != null) onPicked(uri) }\n\npickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.[[ImageOnly]]))', why: '<code>PickVisualMedia</code> opens the system Photo Picker. <code>ImageOnly</code> limits it to images. The result is a Uri you can read right away.' },
          { type: 'bug', prompt: 'The save works, but the photo never appears in Gallery. Tap the line.', code: 'val values = ContentValues().apply {\n    put(MediaStore.Images.Media.DISPLAY_NAME, "card.jpg")\n    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")\n    put(MediaStore.Images.Media.IS_PENDING, 1)\n}\nval uri = resolver.insert(collection, values) ?: return\nresolver.openOutputStream(uri)?.use { bitmap.compress(Bitmap.CompressFormat.JPEG, 90, it) }\nresolver.update(uri, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 1) }, null, null)', bug: 7, fix: 'resolver.update(uri, ContentValues().apply { put(MediaStore.Images.Media.IS_PENDING, 0) }, null, null)', why: 'While <code>IS_PENDING</code> is 1, only your app sees the item. Set it back to 0 after writing so other apps can see it.' },
        ],
        quiz: [
          { q: 'What happens to files in <code>filesDir</code> when the user uninstalls your app?', options: ['They move to Download', 'They are deleted', 'They stay until the user clears them'], a: 1, why: 'App-specific storage belongs to the app and goes with it. Use MediaStore for anything the user should keep.' },
          { q: 'Your app needs one photo from the user\'s gallery. What is the simplest correct approach?', options: ['Request <code>READ_MEDIA_IMAGES</code> and scan the folder', 'Launch the Photo Picker with <code>PickVisualMedia</code>', 'Read <code>/sdcard/DCIM</code> by path'], a: 1, why: 'The picker needs no permission and the user chooses exactly what to share.' },
          { q: 'Why set <code>IS_PENDING = 1</code> before writing a MediaStore item?', options: ['It compresses the file', 'Other apps cannot see a half-written file', 'It makes the file private forever'], a: 1, why: 'Gallery and others skip pending items. Clear the flag when the bytes are complete.' },
          { q: 'You save a Photo Picker Uri as the user’s avatar. A week later loading it throws SecurityException. Which fix works?', options: ['Ask for the storage permission', 'Call takePersistableUriPermission(), or copy the bytes into filesDir right away', 'Save the Uri’s path instead'], a: 1, why: 'The picker’s read access lasts only until a restart or until your app stops. A persistable grant or your own copy survives that.' },
          { q: 'A draft is saved with <code>file.writeText(json)</code>. The process is killed in the middle of the write. What can the user end up with?', options: ['The old draft, always', 'Half a draft or an empty file', 'The new draft, always'], a: 1, why: 'writeText truncates and then writes. AtomicFile writes to a separate file and swaps it in only in finishWrite(), so the old version survives a crash.' },
        ],
        deeper: [
          {
            title: 'A picked Uri can stop working after a restart',
            body: `
<p>The Photo Picker gives you read access to the chosen item, but by default only until the device restarts or your app stops. Save that Uri as the user’s avatar and it may fail next week with a <code>SecurityException</code>.</p>
<p>You have two fixes. Call <code>takePersistableUriPermission()</code> to keep the grant across restarts; an app can hold up to 5,000 such media grants. Or copy the bytes into <code>filesDir</code> right away. The copy also survives the user deleting the original photo.</p>`,
            code: `val pickAvatar = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
    if (uri != null) {
        context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
        viewModel.setAvatar(uri.toString())   // safe to store in Room or DataStore now
    }
}

// Or keep your own copy
suspend fun copyAvatar(context: Context, uri: Uri): File = withContext(Dispatchers.IO) {
    val target = File(context.filesDir, "avatar.jpg")
    context.contentResolver.openInputStream(uri)!!.use { input ->
        target.outputStream().use { input.copyTo(it) }
    }
    target
}`,
            visual(el) {
              const MODES = { uri: 'store the Uri only', persist: 'takePersistableUriPermission()', copy: 'copy into filesDir' };
              const URI = 'content://media/picker/0/…/media/1000000041';
              let mode = 'uri', picked = false, restarted = false, busy = false;
              const avatar = h('div', { class: 'dt-d2-avatar' }, 'no avatar');
              const stored = h('div', { class: 'dt-path' }, 'avatar = null');
              const grant = h('span', { class: 'dt-pill' }, 'no grant');
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              function paintGrant() {
                if (!picked) { grant.className = 'dt-pill'; grant.textContent = 'no grant'; return; }
                if (mode === 'copy') { grant.className = 'dt-pill dt-ok'; grant.textContent = 'own file, no grant needed'; return; }
                const live = !restarted || mode === 'persist';
                grant.className = 'dt-pill ' + (live ? 'dt-ok' : 'dt-bad');
                grant.textContent = live ? (mode === 'persist' ? 'read grant: persisted' : 'read grant: until restart') : 'read grant: gone';
              }
              async function pick() {
                if (busy) return; busy = true;
                picked = true; restarted = false;
                avatar.className = 'dt-d2-avatar dt-on'; avatar.textContent = 'IMG_2041'; replay(avatar, 'pop');
                stored.textContent = mode === 'copy' ? 'avatar = files/avatar.jpg' : `avatar = ${URI}`;
                paintGrant();
                say(o, `<span class="good">picked:</span> ${mode === 'uri' ? 'the Uri went into Room as is.' : mode === 'persist' ? 'the grant was persisted, then the Uri was stored.' : 'the bytes were copied to filesDir.'}`);
                await sleep(300); busy = false;
              }
              async function restart() {
                if (busy) return; busy = true;
                if (!picked) { say(o, 'Pick a photo first.'); busy = false; return; }
                avatar.className = 'dt-d2-avatar'; avatar.textContent = '…';
                say(o, '<span class="muted">rebooting the phone…</span>');
                await sleep(800); if (!o.isConnected) return;
                restarted = true; paintGrant(); replay(grant, 'pop');
                avatar.textContent = 'not loaded';
                line('Back on. Now load the avatar from storage.');
                busy = false;
              }
              async function load() {
                if (busy) return; busy = true;
                if (!picked) { say(o, 'Nothing stored yet. Pick a photo first.'); busy = false; return; }
                say(o, hl(mode === 'copy' ? 'BitmapFactory.decodeFile(avatarFile.path)' : 'contentResolver.openInputStream(Uri.parse(avatar))'));
                await sleep(500); if (!o.isConnected) return;
                if (mode === 'uri' && restarted) {
                  avatar.className = 'dt-d2-avatar dt-bad'; avatar.textContent = 'failed'; replay(avatar, 'shake');
                  line('<span class="bad">SecurityException: Permission Denial</span> <span class="muted">the temporary grant ended with the restart</span>');
                } else {
                  avatar.className = 'dt-d2-avatar dt-on'; avatar.textContent = 'IMG_2041'; replay(avatar, 'pop');
                  line(`<span class="good">loaded:</span> ${mode === 'copy' ? 'from your own file. No grant involved.' : restarted ? 'the persisted grant survived the restart.' : 'the grant is still valid, but only until the next restart.'}`);
                }
                busy = false;
              }
              const modeBtns = Object.keys(MODES).map(m => act(MODES[m], function () {
                if (busy) return; mode = m; picked = false; restarted = false; press(modeBtns, this);
                avatar.className = 'dt-d2-avatar'; avatar.textContent = 'no avatar'; stored.textContent = 'avatar = null'; paintGrant();
                say(o, `Strategy: ${MODES[m]}. Pick, restart, load.`);
              }));
              press(modeBtns, modeBtns[0]);
              say(o, 'Choose a strategy, then pick a photo, restart the phone and load the avatar.');
              el.append(
                h('div', { class: 'controls' }, modeBtns),
                h('div', { class: 'controls' }, cmd('pickAvatar.launch(…)', pick), act('restart the phone', restart), cmd('loadAvatar()', load)),
                h('div', { class: 'dt-d2-split' }, avatar, h('div', { class: 'dt-side' }, h('span', { class: 'dt-label' }, 'stored in Room'), stored, grant)),
                o);
            },
          },
          {
            title: 'Write files atomically',
            body: `
<p><code>writeText</code> truncates the file and then writes it. If the process dies in between, from a crash, a low-memory kill or a dead battery, the user is left with half a draft, or an empty file.</p>
<p><code>AtomicFile</code> from AndroidX writes the new bytes to a separate file and swaps it in only in <code>finishWrite()</code>, after syncing it to disk. If the process dies before that, <code>readFully()</code> still returns the old, complete version. DataStore uses the same idea for its own file.</p>`,
            code: `private val draft = AtomicFile(File(context.filesDir, "draft.md"))

suspend fun save(text: String) = withContext(Dispatchers.IO) {
    val out = draft.startWrite()
    try {
        out.write(text.encodeToByteArray())
        draft.finishWrite(out)      // sync, then swap the new file in
    } catch (e: IOException) {
        draft.failWrite(out)        // the old file stays as it was
        throw e
    }
}

fun load(): String = draft.readFully().decodeToString()`,
            visual(el) {
              const V1 = '# Draft\nRoom notes, part one.';
              const V2 = '# Draft\nRoom notes, part one.\nPart two: migrations and testing.';
              let atomic = false, busy = false, content = V1, temp = null;
              const file = h('div', { class: 'dt-file' });
              const tmpBox = h('div', { class: 'dt-file dt-d2-tmp' });
              const o = out();
              const line = html => o.append(h('div', { class: 'line drop-in', html }));
              const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
              function paint() {
                file.innerHTML = `<span class="dt-fname">files/draft.md</span>\n${content === '' ? '<span class="dt-fname">(empty)</span>' : esc(content)}`;
                tmpBox.innerHTML = temp == null ? '<span class="dt-fname">new copy: none</span>' : `<span class="dt-fname">new copy (being written)</span>\n${esc(temp)}`;
                tmpBox.classList.toggle('dt-d2-off', !atomic);
              }
              async function save(killed) {
                if (busy) return; busy = true;
                content = V1; temp = null; paint();
                say(o, hl(atomic ? 'save(v2) // AtomicFile' : 'file.writeText(v2)'));
                const cut = killed ? Math.floor(V2.length * 0.45) : V2.length;
                if (!atomic) { content = ''; paint(); replay(file, 'pop-soft'); await sleep(250); if (!o.isConnected) return; }
                else { temp = ''; paint(); }
                for (let i = 6; i <= cut; i += 6) {
                  await sleep(70); if (!o.isConnected) return;
                  if (atomic) temp = V2.slice(0, Math.min(i, cut)); else content = V2.slice(0, Math.min(i, cut));
                  paint();
                }
                if (atomic) temp = V2.slice(0, cut); else content = V2.slice(0, cut);
                paint();
                if (killed) {
                  replay(atomic ? tmpBox : file, 'shake');
                  line('<span class="bad">process killed</span> halfway through the write');
                  await sleep(500); if (!o.isConnected) return;
                  if (atomic) line('<span class="good">draft.md is untouched.</span> finishWrite() never ran, so the half-written copy is never used.');
                  else line('<span class="bad">draft.md is broken:</span> the old text was truncated first, and only half of the new text made it.');
                } else if (atomic) {
                  await sleep(250); if (!o.isConnected) return;
                  content = V2; temp = null; paint(); replay(file, 'pop');
                  line('<span class="good">finishWrite():</span> synced and swapped in. Readers saw the old file or the new one, never a mix.');
                } else {
                  line('<span class="good">written.</span> It worked this time.');
                }
                busy = false;
              }
              async function read() {
                if (busy) return;
                say(o, `${hl('load()')} → <span class="${content === V2 || content === V1 ? 'good' : 'bad'}">${content === V1 ? 'v1, complete' : content === V2 ? 'v2, complete' : content === '' ? 'an empty file' : 'half of v2'}</span>`);
                replay(file, 'pop-soft');
              }
              const sw = toggle('dt-d2-fl-atomic', 'AtomicFile', function () { if (busy) { this.checked = atomic; return; } atomic = this.checked; temp = null; paint(); say(o, atomic ? 'Writes now go to a separate file first.' : 'Plain writeText(): truncate, then write.'); });
              paint();
              say(o, 'Save version 2 of the draft. Then save it again and kill the process halfway.');
              el.append(
                h('div', { class: 'controls' }, cmd('save(v2)', () => save(false)), cmd('save(v2) // killed halfway', () => save(true)), cmd('load()', read), sw),
                h('div', { class: 'dt-grid' }, file, tmpBox), o);
            },
          },
        ],
        underHood: {
          body: `
<p>Since Android 11, shared storage under <code>/storage/emulated/0</code> is served through FUSE. Every file open on that path goes to the MediaProvider process, which checks whether your app owns the file or holds a permission for it. That is why a plain <code>File</code> path to your own MediaStore item works on Android 11 and later, and why reading another app’s photo by path fails with <code>EACCES</code>.</p>
<p>MediaProvider also keeps the database behind MediaStore. <code>IS_PENDING = 1</code> is a column in that database: queries from other apps skip pending rows, so Gallery never shows a half-written file. Photo Picker Uris point to a separate provider that serves only the items the user picked.</p>`,
        },
        mistakes: [
          {
            title: 'Treating a content Uri as a file path',
            bad: `val bytes = File(uri.path!!).readBytes()`,
            good: `val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }`,
            why: 'A <code>content://</code> Uri names a row in a provider, not a file. Its path is not a place on disk, so <code>File</code> fails. The content resolver opens the stream for you.',
          },
          {
            title: 'File I/O on the main thread',
            bad: `Button(onClick = {
    File(context.filesDir, "draft.md").writeText(text)
}) { Text("Save") }`,
            good: `Button(onClick = { viewModel.save(text) }) { Text("Save") }

// ViewModel
fun save(text: String) = viewModelScope.launch {
    withContext(Dispatchers.IO) { File(filesDir, "draft.md").writeText(text) }
}`,
            why: 'Disk writes can take tens of milliseconds, much more on a busy or cheap device. On the main thread that drops frames, and StrictMode flags it in debug builds.',
          },
          {
            title: 'Forgetting to close the stream',
            bad: `val out = resolver.openOutputStream(uri)!!
bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)`,
            good: `resolver.openOutputStream(uri)?.use { out ->
    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
}`,
            why: 'Until the stream is closed, the last bytes may still sit in a buffer and the file descriptor stays open. <code>use</code> closes it even when an exception is thrown.',
          },
        ],
        visual(el) {
          let busy = false;
          const mkZone = (title, path, note) => {
            const files = h('div', { class: 'dt-files' });
            const e = h('div', { class: 'dt-zone' }, h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, title), h('span', { class: 'dt-pill' + (note === 'shared' ? ' dt-warn' : '') }, note)), h('span', { class: 'dt-path' }, path), files);
            return { el: e, files };
          };
          const zin = mkZone('filesDir', '/data/data/com.example.news/files', 'only your app');
          const zext = mkZone('getExternalFilesDir()', 'Android/data/com.example.news/files', 'only your app');
          const zpic = mkZone('Pictures (MediaStore)', 'Pictures/ and DCIM/', 'shared');
          const sheetSlot = h('div');
          const o = out();
          const file = (zone, name, extra = '') => { const f = h('span', { class: 'dt-fileic drop-in' + extra }, name); zone.files.append(f); return f; };
          const glow = z => { [zin, zext, zpic].forEach(x => x.el.classList.toggle('dt-on', x === z)); };
          const has = (z, name) => [...z.files.children].some(c => c.textContent === name);
          function init() {
            [zin, zext, zpic].forEach(z => z.files.replaceChildren());
            file(zin, 'datastore/settings.preferences_pb');
            file(zpic, 'DCIM/Camera/IMG_2041.jpg'); file(zpic, 'DCIM/Camera/IMG_2042.jpg');
            sheetSlot.replaceChildren(); glow(null);
          }
          const writeFile = cmd('File(filesDir, "draft.md").writeText(md)', () => {
            if (busy) return;
            glow(zin);
            if (has(zin, 'draft.md')) { say(o, 'draft.md is already there. writeText() overwrites it in place.'); replay(zin.el, 'pop-soft'); return; }
            file(zin, 'draft.md', ' dt-ours');
            say(o, '<span class="good">ok:</span> no permission needed. Other apps cannot read it. Deleted on uninstall.');
          });
          const writeExt = cmd('File(getExternalFilesDir(DIRECTORY_PICTURES), "thumb.jpg")', () => {
            if (busy) return;
            glow(zext);
            if (has(zext, 'Pictures/thumb.jpg')) { say(o, 'thumb.jpg already exists here.'); replay(zext.el, 'pop-soft'); return; }
            file(zext, 'Pictures/thumb.jpg', ' dt-ours');
            say(o, '<span class="good">ok:</span> still app-specific, just on the big volume. Gallery does not index it.');
          });
          const insert = cmd('resolver.insert(images, values)', async () => {
            if (busy) return;
            glow(zpic);
            if (has(zpic, 'Pictures/News/news-card.jpg')) { say(o, 'news-card.jpg is already in MediaStore.'); replay(zpic.el, 'pop-soft'); return; }
            busy = true;
            const f = file(zpic, 'Pictures/News/news-card.jpg', ' dt-ours dt-pending');
            say(o, `insert → ${hl('content://media/external_primary/images/media/1000000057')} <span class="muted">IS_PENDING = 1, hidden from others</span>`);
            await sleep(700); if (!o.isConnected) return;
            line(o, '<span class="muted">openOutputStream(uri): writing 182 KB...</span>');
            await sleep(700); if (!o.isConnected) return;
            f.classList.remove('dt-pending'); replay(f, 'pop');
            line(o, '<span class="good">update IS_PENDING = 0:</span> Gallery shows it now. No permission was needed.');
            busy = false;
          });
          const readPath = cmd('File("/sdcard/DCIM/Camera/IMG_2041.jpg").readBytes()', () => {
            if (busy) return;
            glow(zpic); replay(zpic.el, 'shake');
            say(o, '<span class="bad">FileNotFoundException:</span> /sdcard/DCIM/Camera/IMG_2041.jpg: open failed: EACCES (Permission denied) <span class="muted">// scoped storage: not your file</span>');
          });
          const picker = cmd('pickMedia.launch(PickVisualMediaRequest(ImageOnly))', () => {
            if (busy) return; busy = true;
            glow(zpic);
            const photos = [...zpic.files.children].map(c => c.textContent).filter(n => /\.jpg$/.test(n));
            const sheet = h('div', { class: 'dt-sheet drop-in', role: 'dialog', 'aria-label': 'Photo picker' },
              h('div', { class: 'dt-head' }, h('b', {}, 'Photo Picker (system UI)'), h('span', { class: 'dt-pill dt-ok' }, 'no permission')),
              h('div', { class: 'dt-thumbs' }, photos.map((n, i) => h('button', { class: 'dt-thumb', 'aria-label': `Pick ${n}`, onclick: () => choose(n, 1000000041 + i, sheet) }, n.split('/').pop()))),
              h('span', { class: 'dt-sub' }, 'Tap a photo. Your app sees only what the user picks.'));
            sheetSlot.replaceChildren(sheet);
            say(o, 'The system shows the picker. Your app cannot see this grid.');
          });
          async function choose(name, id, sheet) {
            sheet.classList.add('leave');
            await sleep(420); if (!o.isConnected) return;
            sheetSlot.replaceChildren();
            say(o, `<span class="good">uri =</span> ${hl(`content://media/picker/0/com.android.providers.media.photopicker/media/${id}`)} <span class="muted">// read access to ${name.split('/').pop()} only</span>`);
            busy = false;
          }
          const uninstall = act('uninstall the app', async () => {
            if (busy) return; busy = true; glow(null);
            const mine = [...zin.files.children, ...zext.files.children];
            mine.forEach(f => f.classList.add('leave'));
            say(o, 'Uninstalling com.example.news...');
            await sleep(450); if (!o.isConnected) return;
            zin.files.replaceChildren(); zext.files.replaceChildren();
            const card = [...zpic.files.children].find(c => c.textContent === 'Pictures/News/news-card.jpg');
            if (card) { card.classList.remove('dt-ours'); card.classList.add('dt-orphan'); replay(card, 'pop'); }
            line(o, card ? 'App-specific files are gone. <span class="good">news-card.jpg stays in Pictures:</span> MediaStore items belong to the user.' : 'App-specific files are gone. Nothing of yours was in shared storage.');
            busy = false;
          });
          init();
          say(o, 'Three places. Write to each, try to read someone else\'s photo, then uninstall.');
          el.append(
            h('div', { class: 'dt-zones' }, zin.el, zext.el, zpic.el),
            sheetSlot,
            h('div', { class: 'controls' }, writeFile, writeExt, insert, readPath, picker, uninstall),
            o);
        },
      },
      // share-files ──────────────────────────────────
      {
        id: 'share-files',
        title: 'Sharing files with FileProvider',
        tagline: 'Hand another app one file through a content:// Uri and a temporary grant.',
        level: 'intermediate',
        body: `
<p>Other apps can’t read your <code>filesDir</code>. To let the user mail an exported PDF or send a photo you made, you have to hand over one file without opening the folder. A <code>file://</code> Uri doesn’t work: apps that target Android 7.0 or later crash with <code>FileUriExposedException</code> when one leaves the app in an Intent.</p>
<p><code>FileProvider</code> is a ready-made <code>ContentProvider</code> from AndroidX. You declare it in the manifest, list the folders it may serve in <code>res/xml/file_paths.xml</code>, and call <code>FileProvider.getUriForFile()</code>. You get a <code>content://</code> Uri that names the file without showing its real path.</p>
<p>The Uri alone grants nothing. Add <code>FLAG_GRANT_READ_URI_PERMISSION</code> to the Intent, and the receiving app may read that one Uri. The grant is temporary: it ends when the receiving app’s task stack is finished.</p>`,
        code: `<!-- AndroidManifest.xml -->
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="\${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>

<!-- res/xml/file_paths.xml -->
<paths>
    <files-path name="exports" path="exports/" />
</paths>

// Kotlin: share filesDir/exports/issue-42.pdf
fun sharePdf(context: Context, file: File) {
    val uri = FileProvider.getUriForFile(context, "\${context.packageName}.fileprovider", file)
    // content://com.example.news.fileprovider/exports/issue-42.pdf

    val send = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(send, null))
}`,
        remember: 'Never send file://. Send a FileProvider content:// Uri with FLAG_GRANT_READ_URI_PERMISSION.',
        terms: [
          { term: 'FileProvider', def: 'An AndroidX ContentProvider that serves files from folders you list in XML through content:// Uris.' },
          { term: 'Content Uri', def: 'A content:// address that names data inside a provider. The receiver opens it through ContentResolver, not as a file path.' },
          { term: 'URI permission grant', def: 'Temporary access to one Uri for one receiving app, given with FLAG_GRANT_READ_URI_PERMISSION or FLAG_GRANT_WRITE_URI_PERMISSION on an Intent.' },
          { term: 'FileUriExposedException', def: 'The exception thrown when an app targeting Android 7.0+ lets a file:// Uri leave the app in an Intent.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the file into a shareable Uri and let the receiver read it.', code: 'val uri = FileProvider.[[getUriForFile]](context, "${context.packageName}.fileprovider", file)\n\nval send = Intent(Intent.ACTION_SEND).apply {\n    type = "application/pdf"\n    putExtra(Intent.EXTRA_STREAM, uri)\n    addFlags(Intent.[[FLAG_GRANT_READ_URI_PERMISSION]])\n}', why: '<code>getUriForFile</code> maps the file to a content Uri using your file_paths.xml. The flag gives the chosen app temporary read access to that Uri.' },
          { type: 'bug', prompt: 'Sharing crashes with “IllegalArgumentException: Failed to find configured root”. file_paths.xml has <code>&lt;files-path name="exports" path="exports/" /&gt;</code>. Tap the line.', code: 'fun shareIssue(context: Context) {\n    val file = File(context.cacheDir, "exports/issue-42.pdf")\n    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)\n    val send = Intent(Intent.ACTION_SEND).apply {\n        type = "application/pdf"\n        putExtra(Intent.EXTRA_STREAM, uri)\n        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)\n    }\n    context.startActivity(Intent.createChooser(send, null))\n}', bug: 1, fix: '    val file = File(context.filesDir, "exports/issue-42.pdf")', why: '<code>&lt;files-path&gt;</code> covers <code>filesDir</code> only. A file in <code>cacheDir</code> needs a <code>&lt;cache-path&gt;</code> entry; any file outside the listed folders makes <code>getUriForFile</code> throw.' },
        ],
        quiz: [
          { q: 'Your app targets Android 14 and puts <code>Uri.fromFile(pdf)</code> in a share Intent. What happens?', options: ['The receiver reads it normally', 'The app throws FileUriExposedException', 'Android converts it to a content Uri'], a: 1, why: 'Since Android 7.0, apps that target it or higher may not let a <code>file://</code> Uri leave the app. Use FileProvider.' },
          { q: 'How long can the receiving app read the Uri you granted with <code>FLAG_GRANT_READ_URI_PERMISSION</code>?', options: ['Forever', 'Until your app is uninstalled', 'Until the receiving app’s task stack is finished'], a: 2, why: 'Intent grants are temporary and expire on their own. That is why the docs prefer them to <code>Context.grantUriPermission()</code>.' },
          { q: 'What does the <code>name</code> attribute in <code>&lt;files-path name="exports" path="exports/" /&gt;</code> do?', options: ['It becomes the path segment in the content Uri, hiding the real folder', 'It renames the folder on disk', 'It sets the MIME type'], a: 0, why: 'The Uri reads <code>…fileprovider/exports/issue-42.pdf</code>. FileProvider maps that name back to the real folder when the Uri is opened.' },
          { q: 'You share a PDF with FileProvider and delete the file right after <code>startActivity()</code>. What does the receiving app get?', options: ['The PDF, the grant keeps a copy', 'A Uri that points at nothing', 'A SecurityException in your app'], a: 1, why: 'startActivity returns as soon as the share sheet opens, and the receiver reads later. Export into a cache folder and clean it up on the next export or start.' },
          { q: 'The user shares two JPEGs and one PNG at once. Which Intent fits?', options: ['ACTION_SEND with type image/jpeg', 'ACTION_SEND_MULTIPLE with an ArrayList&lt;Uri&gt; and type image/*', 'ACTION_SEND_MULTIPLE with type */*'], a: 1, why: 'Several files need ACTION_SEND_MULTIPLE. image/* covers mixed image types; use */* only when the types really differ.' },
        ],
        deeper: [
          {
            title: 'file_paths.xml maps folders to Uri names',
            body: `
<p>Each child of <code>&lt;paths&gt;</code> picks a base folder, and <code>path</code> picks a subfolder inside it. <code>&lt;files-path&gt;</code> is <code>filesDir</code>, <code>&lt;cache-path&gt;</code> is <code>cacheDir</code>, and <code>&lt;external-files-path&gt;</code> is <code>getExternalFilesDir()</code>. The <code>name</code> becomes the first segment of the Uri, so the receiver never sees your real path.</p>
<p>Share the smallest folder that works. <code>path="."</code> on <code>&lt;files-path&gt;</code> makes your whole <code>filesDir</code>, with everything else you keep there, reachable through the provider for anyone you grant a Uri to. A dedicated <code>exports/</code> folder keeps the rest private. You can’t add folders from code; the XML is the only list.</p>`,
            code: `<paths>
    <files-path name="exports" path="exports/" />      <!-- filesDir/exports -->
    <cache-path name="shared_images" path="images/" /> <!-- cacheDir/images -->
</paths>

// cacheDir/images/card.png → content://com.example.news.fileprovider/shared_images/card.png`,
          },
          {
            title: 'Share several files at once',
            body: `
<p>For more than one file, use <code>ACTION_SEND_MULTIPLE</code> and put an <code>ArrayList&lt;Uri&gt;</code> in <code>EXTRA_STREAM</code>. Set a MIME type that covers them all: <code>image/jpeg</code> for three JPEGs, <code>image/*</code> for mixed images, and <code>*/*</code> only when the types really differ.</p>`,
            code: `val uris = arrayListOf(
    FileProvider.getUriForFile(context, authority, File(exports, "card-1.jpg")),
    FileProvider.getUriForFile(context, authority, File(exports, "card-2.jpg")),
)
val send = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
    type = "image/jpeg"
    putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}
context.startActivity(Intent.createChooser(send, null))`,
          },
          {
            title: 'Don’t delete the file right after startActivity',
            body: `
<p><code>startActivity</code> returns as soon as the share sheet opens. The user may take a minute to pick an app, and the receiver reads the file after that, maybe in the background while it uploads.</p>
<p>Export shared files into a dedicated cache folder, such as <code>cacheDir/images</code>, and clean that folder up the next time you export, or on the next app start. Deleting the file in the same function that shares it leaves the receiver with a Uri that points at nothing.</p>`,
            code: `suspend fun exportCard(context: Context, bitmap: Bitmap): File = withContext(Dispatchers.IO) {
    val dir = File(context.cacheDir, "images").apply {
        deleteRecursively()                 // clean up last time's export, not this one
        mkdirs()
    }
    File(dir, "card.png").also { f ->
        f.outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
}`,
          },
        ],
        underHood: {
          body: `
<p>FileProvider is a normal <code>ContentProvider</code>. <code>getUriForFile</code> finds the <code>&lt;paths&gt;</code> entry whose folder contains your file and swaps that folder for its <code>name</code>. When the receiver calls <code>openInputStream(uri)</code>, the system routes the call into your app’s process, and FileProvider maps the name back to the real file and opens it.</p>
<p>The provider is declared with <code>exported="false"</code>, so no app can reach it by default, and <code>grantUriPermissions="true"</code>, which allows exceptions for single Uris. The grant flag on your Intent makes the system record one of those exceptions for that Uri and that receiving app, and it checks the record on every open.</p>`,
        },
        mistakes: [
          {
            title: 'Sending a file:// Uri',
            bad: `putExtra(Intent.EXTRA_STREAM, Uri.fromFile(pdf))`,
            good: `putExtra(Intent.EXTRA_STREAM, FileProvider.getUriForFile(context, authority, pdf))
addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)`,
            why: 'A <code>file://</code> Uri crashes apps that target Android 7.0 or later with <code>FileUriExposedException</code>, and the receiver could not read your private folder anyway.',
          },
          {
            title: 'Forgetting the grant flag',
            bad: `val send = Intent(Intent.ACTION_SEND).apply {
    type = "application/pdf"
    putExtra(Intent.EXTRA_STREAM, uri)
}`,
            good: `val send = Intent(Intent.ACTION_SEND).apply {
    type = "application/pdf"
    putExtra(Intent.EXTRA_STREAM, uri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}`,
            why: 'Without the flag the provider is still closed to everyone. The receiving app gets a <code>SecurityException</code> when it opens the Uri, and usually shows a vague “couldn’t attach file” error.',
          },
          {
            title: 'Granting with Context.grantUriPermission()',
            bad: `context.grantUriPermission("com.mail.app", uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)`,
            good: `send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)   // expires on its own`,
            why: 'A grant from <code>grantUriPermission()</code> lasts until you call <code>revokeUriPermission()</code>. Flags on the Intent expire when the receiver’s task stack finishes.',
          },
        ],
        visual(el) {
          const PATH = 'files/exports/issue-42.pdf';
          const URI = 'content://com.example.news.fileprovider/exports/issue-42.pdf';
          let uri = null, flag = false, granted = false, busy = false;
          const uriBox = h('div', { class: 'dt-sh-uri' }, 'uri = (none yet)');
          const grantPill = h('span', { class: 'dt-pill' }, 'no grant');
          const recv = h('div', { class: 'dt-files' });
          const sheetSlot = h('div');
          const o = out();
          const mine = h('div', { class: 'dt-zone' },
            h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'com.example.news'), h('span', { class: 'dt-pill' }, 'your app')),
            h('span', { class: 'dt-path' }, '/data/data/com.example.news/'),
            h('div', { class: 'dt-files' }, h('span', { class: 'dt-fileic dt-ours' }, PATH), h('span', { class: 'dt-fileic' }, 'databases/news.db')),
            uriBox);
          const them = h('div', { class: 'dt-zone' },
            h('div', { class: 'dt-head' }, h('span', { class: 'dt-title' }, 'com.mail.app'), grantPill),
            h('span', { class: 'dt-path' }, 'receiving app'),
            recv);
          function paintGrant() {
            grantPill.className = 'dt-pill ' + (granted ? 'dt-ok' : '');
            grantPill.textContent = granted ? 'read grant: issue-42.pdf' : 'no grant';
          }
          const fileUri = cmd('Uri.fromFile(pdf)', () => {
            if (busy) return;
            uri = 'file'; uriBox.textContent = 'uri = file:///data/data/com.example.news/files/exports/issue-42.pdf'; replay(uriBox, 'pop');
            say(o, 'A file:// Uri. Now try to share it.');
          });
          const getUri = cmd('FileProvider.getUriForFile(…)', () => {
            if (busy) return;
            uri = 'content'; uriBox.textContent = `uri = ${URI}`; replay(uriBox, 'pop');
            say(o, '<span class="good">ok:</span> "exports" is the name from file_paths.xml. The real folder stays hidden.');
          });
          const badPath = cmd('getUriForFile(…, dbFile)', () => {
            if (busy) return;
            replay(mine, 'shake');
            say(o, `${hl('val dbFile = getDatabasePath("news.db")')}<br><span class="bad">IllegalArgumentException:</span> Failed to find configured root that contains /data/data/com.example.news/databases/news.db <span class="muted">// only exports/ is listed</span>`);
          });
          const flagSw = toggle('dt-sh-flag', 'FLAG_GRANT_READ_URI_PERMISSION', function () { if (busy) { this.checked = flag; return; } flag = this.checked; say(o, flag ? 'The Intent will carry a read grant for its Uri.' : 'The Intent will carry the Uri but no grant.'); });
          const share = cmd('startActivity(chooser)', () => {
            if (busy) return;
            if (!uri) { say(o, 'Make a Uri first.'); return; }
            if (uri === 'file') {
              replay(mine, 'shake');
              say(o, '<span class="bad">FileUriExposedException:</span> file:///data/data/com.example.news/files/exports/issue-42.pdf exposed beyond app <span class="muted">// targetSdk ≥ 24</span>');
              return;
            }
            busy = true;
            const sheet = h('div', { class: 'dt-sheet drop-in', role: 'dialog', 'aria-label': 'Share sheet' },
              h('div', { class: 'dt-head' }, h('b', {}, 'Share sheet (system UI)'), h('span', { class: 'dt-pill' }, 'application/pdf')),
              h('div', { class: 'controls' }, act('Mail', () => pick(sheet)), act('Drive', () => pick(sheet))),
              h('span', { class: 'dt-sub' }, 'Pick the app that receives the file.'));
            sheetSlot.replaceChildren(sheet);
            say(o, 'startActivity() returned. The user is choosing an app.');
          });
          async function pick(sheet) {
            sheet.classList.add('leave');
            await sleep(400); if (!el.isConnected) return;
            sheetSlot.replaceChildren();
            granted = flag; paintGrant(); replay(grantPill, 'pop');
            line(o, `${hl('contentResolver.openInputStream(uri)')} <span class="muted">in the receiving app</span>`);
            await sleep(600); if (!el.isConnected) return;
            if (granted) {
              recv.replaceChildren(h('span', { class: 'dt-fileic dt-ours drop-in' }, 'issue-42.pdf · 84 KB'));
              line(o, '<span class="good">read 84 KB.</span> The receiver sees this one file and nothing else in your app.');
            } else {
              replay(them, 'shake');
              line(o, '<span class="bad">SecurityException: Permission Denial</span> <span class="muted">// the provider is not exported and no grant was given</span>');
            }
            busy = false;
          }
          const finish = act('receiver finishes its task', async () => {
            if (busy) return;
            if (!granted) { say(o, 'There is no grant to end.'); return; }
            busy = true;
            granted = false; paintGrant(); recv.replaceChildren();
            say(o, 'The mail app sent the message and its task finished. <span class="muted">The grant expired with it.</span>');
            await sleep(500); if (!el.isConnected) return;
            line(o, `<span class="bad">openInputStream(uri) later → SecurityException</span>`);
            busy = false;
          });
          say(o, 'Make a Uri, choose whether to grant, share, and pick an app.');
          el.append(
            h('div', { class: 'controls' }, fileUri, getUri, badPath),
            h('div', { class: 'controls' }, flagSw, share, finish),
            h('div', { class: 'dt-sh-wrap' }, mine, them),
            sheetSlot, o);
        },
      },
    ],
  });
})();
