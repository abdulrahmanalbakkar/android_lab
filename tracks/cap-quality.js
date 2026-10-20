/* Capstone project: a quality pass over the News app from the capapp project (same names, files and versions).
   A project is a track with kind: 'project'. Each lesson is one step of the pass and carries refs: ['track.lesson'].
   Steps: 1 unit-tests, 2 turbine, 3 ui-tests, 4 recomposition, 5 leak, 6 a11y-pass, 7 adaptive, 8 startup, 9 recap.
   Every step's demo is demo(el, { step, predict, panelTitle, frames }): a Lab.ui.player stage with the News app's phone
   mock, the quality board (one row per check the pass adds; the check of this step marked "this step") and a side panel.
   Frame keys: say; kept until changed: screen, panel, board, counts, talk ({ on, says }), big, wide, panes, sel, refreshBtn,
   refreshing, toast; this frame only: ping and fail (board keys), tap and find (a data-k target), rotate, dark. Classes start with cq-. */
(() => {
  const { h, sleep, hl, replay } = Lab;

  // ---------- the news in the app (the same stories as the capapp project) ----------
  const STORIES = [
    { id: 'a1', source: 'Local', title: 'Library extends weekend opening hours', summary: 'Branches stay open until 6 pm on Saturdays and Sundays from next month.' },
    { id: 'a2', source: 'Transport', title: 'Rail line reopens after two weeks of repairs', summary: 'Trains run the full timetable again, with slow sections near the bridge.' },
    { id: 'a3', source: 'Science', title: 'Researchers map a deep-sea reef', summary: 'A survey team charted the reef with an underwater drone over six dives.' },
    { id: 'a4', source: 'City Desk', title: 'City council approves new bike lanes', summary: 'Work on the first three kilometres starts in spring.' },
    { id: 'a5', source: 'Weather', title: 'Storm expected along the coast on Friday', summary: 'Forecasters expect strong wind and heavy rain from the afternoon.' },
    { id: 'a6', source: 'Sport', title: 'Home team wins the regional final', summary: 'A late goal settled the match in front of a full stadium.' },
  ];
  const story = id => STORIES.find(s => s.id === id);

  // ---------- phone mock: data-k on parts lets frames point at them (tap, TalkBack focus) ----------
  function phone() {
    const back = h('span', { class: 'cq-back', 'aria-hidden': 'true', hidden: true }, '‹');
    const title = h('span', { class: 'cq-title', 'data-k': 'title' }, 'News');
    const rbtn = h('span', { class: 'cq-rbtn', 'data-k': 'refresh', hidden: true }, 'Refresh');
    const scroll = h('div', { class: 'cq-scroll' });
    const ptr = h('div', { class: 'cq-ptr', 'aria-hidden': 'true' });
    const toast = h('div', { class: 'cq-toast', hidden: true });
    const talk = h('div', { class: 'cq-talk', hidden: true });
    const screen = h('div', { class: 'cq-screen' }, ptr, scroll, toast);
    const el = h('div', { class: 'cq-phone' },
      h('div', { class: 'cq-sb' }, h('span', {}, '9:41'), h('span', {}, '5G')),
      h('div', { class: 'cq-appbar' }, back, title, rbtn), screen, talk);
    return {
      el, scroll, title, back, rbtn,
      toast(t) { toast.hidden = !t; if (t && toast.textContent !== t) { toast.textContent = t; replay(toast, 'drop-in'); } if (!t) toast.textContent = ''; },
      talk(t) { talk.hidden = !t; talk.textContent = t || ''; },
      refreshing(on) { ptr.classList.toggle('on', !!on); },
      async rotate() { replay(el, 'cq-rot'); await sleep(1000); el.classList.remove('cq-rot'); },
      async dark(ms) { el.classList.add('cq-dark'); await sleep(ms); el.classList.remove('cq-dark'); },
    };
  }
  const card = (a, o = {}) => h('div', { class: 'cq-card' + ((o.fresh || []).includes(a.id) ? ' cq-fresh' : ''), 'data-k': 'row:' + a.id },
    h('b', {}, a.title), h('small', {}, a.source, o.tag ? h('i', { class: 'cq-tag' }, o.tag) : null),
    o.counts && o.counts[a.id] != null ? h('span', { class: 'cq-rc' + (o.counts[a.id] > 0 ? ' hot' : '') }, '↻ ' + o.counts[a.id]) : null);
  const detailView = a => h('div', { class: 'cq-detail drop-in', 'data-k': 'detail' }, h('small', {}, a.source), h('h4', { 'data-k': 'dtitle' }, a.title), h('p', {}, a.summary),
    h('div', { class: 'cq-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  const center = ({ spin, title, btn, note } = {}) => h('div', { class: 'cq-center' },
    spin ? h('span', { class: 'cq-spin', 'aria-hidden': 'true', 'data-k': 'spin' }) : null,
    title ? h('b', { 'data-k': 'msg' }, title) : null, note ? h('span', {}, note) : null,
    btn ? h('span', { class: 'cq-btn', 'data-k': 'retry' }, btn) : null);
  // screen: { blank } | { list: ids, fresh: ids, note, tag } | { detail: id } | { spin } | { msg: { title, btn } }
  function listNodes(s, counts) {
    return [s.note ? h('div', { class: 'cq-note', 'data-k': 'note' }, s.note) : null, ...s.list.map(id => card(story(id), { fresh: s.fresh, tag: s.tag, counts }))];
  }
  function paintScreen(ph, s = { blank: true }, st) {
    const show = (nodes, opts = {}) => {
      ph.scroll.replaceChildren(...[].concat(nodes).filter(Boolean));
      ph.title.textContent = opts.title || 'News';
      ph.back.hidden = !opts.back;
      ph.rbtn.hidden = !st.refreshBtn || !!opts.back;
    };
    if (st.wide && st.panes && s.list) {
      const a = story(st.sel);
      show(h('div', { class: 'cq-panes' },
        h('div', { class: 'cq-pane' }, listNodes(s, st.counts)),
        h('div', { class: 'cq-pane cq-dpane' }, h('div', { class: 'cq-pbar' }, 'Article'), a ? detailView(a) : h('div', { class: 'cq-center' }, h('span', {}, 'Pick an article')))));
    } else if (s.detail) {
      const a = story(s.detail);
      show(a ? detailView(a) : center({ title: 'Article not found' }), { title: 'Article', back: true });
    } else if (s.list) show(listNodes(s, st.counts));
    else if (s.spin) show(center({ spin: true }));
    else if (s.msg) show(center(s.msg));
    else show([]);
  }

  // ---------- the quality board: one row per check, and the step that adds it ----------
  const GATES = [
    ['unit', 'Unit tests', [[1, 'ViewModel · 3'], [2, 'with Turbine · 5']]],
    ['ui', 'UI tests', [[3, 'Screen tests · 3'], [6, 'with Refresh · 4']]],
    ['frames', 'Recomposition', [[4, 'rows skip']]],
    ['leaks', 'Leaks', [[5, 'LeakCanary: none']]],
    ['a11y', 'Accessibility', [[6, 'TalkBack pass']]],
    ['sizes', 'Window sizes', [[7, 'phone · tablet']]],
    ['start', 'Startup', [[8, 'baseline profile']]],
  ];
  function spec(step) {
    const s = {};
    for (const [k, , list] of GATES) {
      const got = list.filter(p => p[0] <= step).pop();
      s[k] = !got ? ['todo'] : [step === 9 ? 'lit' : got[0] === step ? 'new' : 'have', got[1]];
    }
    return s;
  }
  function board() {
    const rows = {};
    const el = h('div', { class: 'cq-board', 'aria-label': 'Quality board' }, GATES.map(([k, name]) => {
      const lab = h('span', {});
      const r = h('div', { class: 'cq-gate' }, h('b', {}, name), lab, h('em', {}, 'this step'));
      rows[k] = Object.assign(r, { lab });
      return r;
    }));
    return Object.assign(el, {
      set(k, state, label) { rows[k].className = `cq-gate ${state}`; rows[k].lab.textContent = label || 'not checked yet'; },
      ping(k) { replay(rows[k], 'ping'); },
      fail(k) { rows[k].classList.add('fail'); replay(rows[k], 'shake'); },
    });
  }

  // ---------- the step demo ----------
  const KEEP = ['screen', 'panel', 'board', 'counts', 'talk', 'big', 'wide', 'panes', 'sel', 'refreshBtn', 'refreshing', 'toast'];
  function demo(el, { step, predict, panelTitle = '', frames }) {
    const ph = phone();
    const base = spec(step);
    const B = board();
    const body = h('div', { class: 'cq-pbody' });
    const stage = h('div', { class: 'cq-top' }, ph.el, h('div', { class: 'cq-side' }, B,
      h('div', { class: 'cq-panel' }, h('span', { class: 'cq-cap' }, panelTitle), body)));
    Lab.ui.player(el, { frames, predict, stage, speed: 2600, draw(f, i) {
      const st = {};
      frames.slice(0, i + 1).forEach(x => KEEP.forEach(k => { if (x[k] !== undefined) st[k] = x[k]; }));
      GATES.forEach(([k]) => { const v = (st.board && st.board[k]) || base[k]; B.set(k, v[0], v[1]); });
      ph.el.classList.toggle('cq-big', !!st.big);
      ph.el.classList.toggle('cq-wide', !!st.wide);
      ph.refreshing(!!st.refreshing);
      paintScreen(ph, st.screen, st);
      ph.toast(st.toast);
      ph.talk(st.talk && st.talk.says);
      ph.el.querySelectorAll('.cq-focus, .cq-found').forEach(x => x.classList.remove('cq-focus', 'cq-found'));
      const at = k => k && ph.el.querySelector(`[data-k="${k}"]`);
      const foc = at(st.talk && st.talk.on);
      if (foc) foc.classList.add('cq-focus');
      const tap = at(f.tap);
      if (tap) replay(tap, 'cq-tapped');
      const found = at(f.find);
      if (found) found.classList.add('cq-found');
      [].concat(f.ping || []).forEach(k => B.ping(k));
      [].concat(f.fail || []).forEach(k => B.fail(k));
      body.replaceChildren();
      if (typeof st.panel === 'function') st.panel(body); else if (st.panel) body.innerHTML = st.panel;
      if (f.rotate) ph.rotate();
      if (f.dark) ph.dark(500);
    } });
  }

  // ---------- side panels: each returns node => { ... } for a frame's panel ----------
  // Code or a build file: hits are line numbers (0-based) to light up, bad ones to mark red.
  const file = (lines, hits = [], bad = []) => node => node.append(h('div', { class: 'cq-code' }, lines.map((l, i) =>
    h('div', { class: (l.startsWith('//') || l.startsWith('#') ? 'cq-chead' : 'cq-crow') + (hits.includes(i) ? ' on' : '') + (bad.includes(i) ? ' bad' : '') }, l))));
  // Test results: [name, state] with state '' (not run), 'run', 'pass', 'fail'; out: lines under the list.
  const tests = (list, out = []) => node => node.append(h('div', { class: 'cq-tests' },
    list.map(([n, s]) => h('div', { class: 'cq-t' }, h('span', { class: 'cq-dot ' + (s || '') }), h('span', {}, n),
      s === 'pass' ? h('small', {}, 'passed') : s === 'fail' ? h('small', { class: 'bad' }, 'failed') : null)),
    out.length ? h('div', { class: 'cq-tout' }, out.map(l => h('div', { class: l.startsWith('!') ? 'bad' : l.startsWith('+') ? 'ok' : '' }, l.replace(/^[!+]/, '')))) : null));
  // Terminal output: a line starting with $ is the command; ! marks a red line, + a green one.
  const term = lines => node => node.append(h('div', { class: 'cq-term' }, lines.map(l =>
    h('div', { class: l.startsWith('$') ? 'cmd' : l.startsWith('!') ? 'bad' : l.startsWith('+') ? 'ok' : '' }, l.replace(/^[!+]/, '')))));
  // The semantics tree: nodes { d: depth, t: text, hit, dim }.
  const tree = nodes => node => node.append(h('div', { class: 'cq-tree' }, nodes.map(n =>
    h('div', { class: 'cq-node' + (n.hit ? ' hit' : '') + (n.dim ? ' dim' : ''), style: `padding-left:${6 + n.d * 12}px` }, n.t))));
  // Layout Inspector's counts: rows [name, recompositions, skips]; hot rows are red.
  const inspector = rowsIn => node => node.append(h('div', { class: 'cq-insp' },
    h('div', { class: 'cq-ir cq-ih' }, h('span', {}, 'Composable'), h('span', {}, 'Recomp.'), h('span', {}, 'Skips')),
    rowsIn.map(([n, r, s]) => h('div', { class: 'cq-ir' + (r > 0 && /Row/.test(n) ? ' hot' : '') }, h('span', {}, n), h('span', {}, String(r)), h('span', {}, String(s))))));
  // Objects alive in memory: [name, note, tone] with tone '' | 'dead' | 'leak' | 'ok'.
  const heap = items => node => node.append(h('div', { class: 'cq-heap' }, items.map(([n, note, tone]) =>
    h('div', { class: 'cq-obj ' + (tone || '') }, h('b', {}, n), note ? h('small', { html: note }) : null))));
  // Bars for times: [label, ms, tone]; widths relative to the largest.
  const bars = list => node => {
    const max = Math.max(...list.map(b => b[1]));
    node.append(h('div', { class: 'cq-bars' }, list.map(([l, ms, tone]) => h('div', { class: 'cq-barrow' },
      h('span', { class: 'cq-bl' }, l), h('span', { class: 'cq-bt' }, h('i', { class: tone || '', style: `width:${Math.round(ms / max * 100)}%` })), h('span', { class: 'cq-bv' }, ms + ' ms')))));
  };
  // Quality gates on a pull request: [command, state, note] with state '' | 'run' | 'ok' | 'err'.
  const gates = list => node => node.append(h('div', { class: 'cq-gates' }, list.map(([c, s, note]) =>
    h('div', { class: 'cq-pr ' + (s || '') }, h('span', { class: 'cq-dot ' + (s === 'ok' ? 'pass' : s === 'err' ? 'fail' : s || '') }),
      h('span', {}, h('code', { html: hl(c) }), note ? h('small', { html: note }) : null)))));
  // Rows of code-like text; rows starting with * are lit.
  const rows = list => node => node.append(...list.map(r => h('div', { class: 'cq-row' + (r.startsWith('*') ? ' lit' : ''), html: hl(r.replace(/^\*/, '')) })));

  const css = `
.cq-top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: start; min-width: 0; }
.cq-side { display: grid; gap: 12px; min-width: 0; align-content: start; }
@media (max-width: 760px) { .cq-top { grid-template-columns: minmax(0, 1fr); } }

.cq-phone { --cq-fs: 1; width: 212px; height: 400px; box-sizing: border-box; justify-self: center; border: 8px solid var(--code-bg); border-radius: 30px; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 0 0 1px var(--line), var(--shadow); user-select: none; -webkit-user-select: none; transition: width 0.35s, height 0.35s, border-radius 0.35s; }
.cq-phone.cq-big { --cq-fs: 1.45; }
.cq-phone.cq-wide { width: min(100%, 440px); height: 300px; border-radius: 18px; }
.cq-phone.cq-dark { background: var(--code-bg); }
.cq-phone.cq-dark > * { visibility: hidden; }
.cq-rot { animation: cq-rot 1s ease-in-out; }
@keyframes cq-rot { 35%, 65% { transform: rotate(90deg) scale(0.56); } }
.cq-sb { display: flex; justify-content: space-between; padding: 5px 14px 3px; font: 600 0.62rem var(--mono); color: var(--muted); }
.cq-appbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px 8px 12px; min-height: 38px; box-sizing: border-box; font: 700 calc(1rem * var(--cq-fs)) var(--display); color: var(--ink); background: var(--surface); border-bottom: 1px solid var(--line); }
.cq-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cq-back { color: var(--ink); font: 700 1.3rem/1 var(--body); padding: 0 6px 2px 0; }
.cq-rbtn { flex: none; font: 700 calc(0.68rem * var(--cq-fs)) var(--body); color: var(--accent); padding: 6px 8px; border-radius: 999px; }
.cq-screen { flex: 1; position: relative; overflow: hidden; min-height: 0; }
.cq-scroll { display: grid; gap: 6px; padding: 8px; align-content: start; height: 100%; box-sizing: border-box; overflow: hidden; }
.cq-card { position: relative; display: grid; gap: 2px; width: 100%; box-sizing: border-box; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); transition: background 0.4s, border-color 0.4s; }
.cq-card b { font: 700 calc(0.74rem * var(--cq-fs))/1.25 var(--body); padding-right: 28px; }
.cq-card small { font-size: calc(0.64rem * var(--cq-fs)); color: var(--muted); display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cq-tag { font-style: normal; font-weight: 700; color: var(--warm); }
.cq-card.cq-fresh { border-color: var(--accent); background: var(--accent-soft); animation: drop-in 0.42s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
.cq-rc { position: absolute; top: 5px; right: 6px; font: 700 0.58rem var(--mono); padding: 1px 5px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.cq-rc.hot { background: var(--err); color: var(--surface); }
.cq-detail { display: grid; gap: 6px; padding: 4px 2px; align-content: start; }
.cq-detail small { font: 600 0.62rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.cq-detail h4 { margin: 0; font: 700 calc(0.95rem * var(--cq-fs))/1.25 var(--display); color: var(--ink); }
.cq-detail p { margin: 0; font-size: calc(0.74rem * var(--cq-fs)); line-height: 1.45; color: var(--ink); }
.cq-lines { display: grid; gap: 5px; margin-top: 4px; }
.cq-lines i { display: block; height: 6px; border-radius: 3px; background: var(--sunk); }
.cq-lines i:nth-child(2) { width: 85%; }
.cq-lines i:nth-child(3) { width: 60%; }
.cq-center { display: grid; gap: 8px; place-items: center; align-content: center; text-align: center; min-height: 100%; padding: 12px; box-sizing: border-box; font-size: calc(0.76rem * var(--cq-fs)); color: var(--muted); }
.cq-center b { color: var(--ink); font-size: calc(0.86rem * var(--cq-fs)); }
.cq-spin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.cq-btn { font: 700 calc(0.74rem * var(--cq-fs)) var(--body); padding: 5px 14px; border-radius: 999px; border: 1px solid var(--accent); color: var(--accent); }
.cq-note { padding: 6px 9px; border-radius: 8px; background: var(--warm-soft); color: var(--ink); font-size: calc(0.68rem * var(--cq-fs)); font-weight: 700; }
.cq-ptr { position: absolute; left: 50%; top: 0; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; transform: translateY(-36px); transition: transform 0.25s; z-index: 2; pointer-events: none; }
.cq-ptr::after { content: ""; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid var(--sunk); border-top-color: var(--accent); }
.cq-ptr.on { transform: translateY(10px); }
.cq-ptr.on::after { animation: spin 0.8s linear infinite; }
.cq-toast { position: absolute; z-index: 3; left: 12px; right: 12px; bottom: 12px; padding: 7px 10px; border-radius: 999px; background: var(--code-bg); color: var(--code-ink); font: 600 0.66rem var(--body); text-align: center; }
.cq-talk { position: absolute; z-index: 4; left: 6px; right: 6px; bottom: 6px; padding: 7px 9px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); font: 600 0.66rem/1.35 var(--mono); border: 1.5px solid var(--ok); }
.cq-talk::before { content: "TalkBack: "; color: var(--ok); }
.cq-focus { outline: 3px solid var(--ok); outline-offset: 1px; border-radius: 8px; }
.cq-found { outline: 3px solid var(--accent); outline-offset: 1px; border-radius: 8px; }
.cq-tapped { animation: cq-tap 0.6s ease-out; }
@keyframes cq-tap { from { box-shadow: 0 0 0 4px var(--hi); } to { box-shadow: 0 0 0 4px transparent; } }
.cq-panes { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 8px; height: 100%; min-height: 0; }
.cq-pane { display: grid; gap: 6px; align-content: start; min-width: 0; overflow: hidden; }
.cq-dpane { border-left: 1px solid var(--line); padding-left: 8px; }
.cq-pbar { font: 700 calc(0.82rem * var(--cq-fs)) var(--display); color: var(--ink); padding: 0 0 6px; border-bottom: 1px solid var(--line); }

.cq-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; padding: 10px; border-radius: 14px; background: var(--bg); min-width: 0; }
.cq-gate { display: grid; gap: 1px; padding: 6px 9px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; position: relative; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.cq-gate > b { font: 600 0.6rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cq-gate > span { font: 600 0.72rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cq-gate > em { display: none; justify-self: start; font: 600 0.56rem var(--mono); font-style: normal; padding: 1px 6px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.cq-gate.new, .cq-gate.lit { border-color: var(--accent); background: var(--accent-soft); }
.cq-gate.new > em { display: block; }
.cq-gate.todo { border-style: dashed; opacity: 0.5; }
.cq-gate.todo > span { color: var(--muted); font-style: italic; font-weight: 500; }
.cq-gate.fail { border-color: var(--err); background: var(--err-soft); opacity: 1; }
.cq-gate.fail > span { color: var(--err); font-style: normal; font-weight: 700; }
.cq-gate.ping { animation: cq-ping 0.6s ease-out; }
@keyframes cq-ping { 30% { box-shadow: 0 0 0 4px var(--hi); } }

.cq-panel { display: grid; gap: 8px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); min-width: 0; align-content: start; }
.cq-pbody { display: grid; gap: 6px; min-width: 0; }
.cq-cap { font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.cq-code { display: grid; gap: 2px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; overflow-x: auto; }
.cq-chead { font: 500 0.74rem/1.4 var(--mono); color: var(--t-c); padding: 2px 8px; white-space: pre-wrap; overflow-wrap: anywhere; }
.cq-crow { font: 500 0.74rem/1.4 var(--mono); color: var(--code-ink); border-radius: 6px; padding: 2px 8px 2px calc(8px + 2ch); text-indent: -2ch; white-space: pre-wrap; overflow-wrap: anywhere; transition: background 0.2s; }
.cq-crow.on, .cq-chead.on { background: rgba(126, 226, 168, 0.14); border-radius: 6px; }
.cq-crow.bad { background: rgba(255, 138, 155, 0.18); }
.cq-tests, .cq-term { display: grid; gap: 3px; padding: 8px 10px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.72rem/1.5 var(--mono); min-width: 0; overflow-x: auto; }
.cq-t { display: flex; gap: 8px; align-items: center; min-width: 0; }
.cq-t > span:nth-child(2) { overflow-wrap: anywhere; min-width: 0; }
.cq-t small { margin-left: auto; color: var(--t-k); font-size: 0.66rem; }
.cq-t small.bad { color: var(--t-e); }
.cq-dot { flex: none; width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
.cq-dot.run { background: var(--t-s); animation: pulse 0.6s infinite; }
.cq-dot.pass { background: var(--t-k); }
.cq-dot.fail { background: var(--t-e); }
.cq-tout { margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.12); display: grid; gap: 2px; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--t-c); }
.cq-tout .bad, .cq-term .bad { color: var(--t-e); }
.cq-tout .ok, .cq-term .ok { color: var(--t-k); }
.cq-term > div { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--t-c); }
.cq-term > .cmd { color: var(--code-ink); }
.cq-term > .cmd::before { content: ""; }
.cq-tree { display: grid; gap: 1px; padding: 8px 4px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); font: 500 0.7rem/1.5 var(--mono); min-width: 0; overflow-x: auto; }
.cq-node { padding-right: 6px; border-radius: 5px; color: var(--ink); overflow-wrap: anywhere; }
.cq-node.dim { color: var(--muted); }
.cq-node.hit { background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.cq-insp { display: grid; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); min-width: 0; }
.cq-ir { display: grid; grid-template-columns: minmax(0, 1fr) 4.4em 3.4em; gap: 6px; padding: 4px 9px; border-top: 1px solid var(--line); font: 500 0.72rem var(--mono); color: var(--ink); }
.cq-ir > span { overflow-wrap: anywhere; }
.cq-ir > span:not(:first-child) { text-align: right; }
.cq-ir.cq-ih { border-top: 0; font-weight: 700; color: var(--muted); background: var(--sunk); }
.cq-ir.hot { background: var(--err-soft); color: var(--err); font-weight: 700; }
.cq-heap { display: grid; gap: 6px; min-width: 0; }
.cq-obj { display: grid; gap: 1px; padding: 6px 9px; border-radius: 9px; border: 1.5px solid var(--accent); background: var(--surface); font: 600 0.74rem var(--mono); color: var(--ink); min-width: 0; overflow-wrap: anywhere; }
.cq-obj small { font: 500 0.66rem var(--body); color: var(--muted); }
.cq-obj.dead { border-style: dashed; border-color: var(--line); color: var(--muted); }
.cq-obj.leak { border-style: dashed; border-color: var(--err); background: var(--err-soft); color: var(--err); }
.cq-obj.ok { border-color: var(--ok); background: var(--ok-soft); }
.cq-bars { display: grid; gap: 8px; min-width: 0; }
.cq-barrow { display: grid; grid-template-columns: minmax(0, 7.5em) minmax(0, 1fr) auto; gap: 8px; align-items: center; font: 600 0.72rem var(--mono); color: var(--ink); }
.cq-bl { overflow-wrap: anywhere; }
.cq-bt { height: 12px; border-radius: 6px; background: var(--sunk); overflow: hidden; }
.cq-bt i { display: block; height: 100%; border-radius: 6px; background: var(--warm); transition: width 0.4s; }
.cq-bt i.ok { background: var(--ok); }
.cq-bv { color: var(--muted); }
.cq-gates { display: grid; gap: 6px; min-width: 0; }
.cq-pr { display: grid; grid-template-columns: 12px minmax(0, 1fr); gap: 8px; align-items: start; padding: 6px 9px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); min-width: 0; }
.cq-pr .cq-dot { margin-top: 4px; background: var(--sunk); }
.cq-pr .cq-dot.pass { background: var(--ok); }
.cq-pr .cq-dot.fail { background: var(--err); }
.cq-pr .cq-dot.run { background: var(--warm); }
.cq-pr > span:last-child { display: grid; gap: 2px; min-width: 0; }
.cq-pr code { font-size: 0.72rem; overflow-wrap: anywhere; }
.cq-pr small { font-size: 0.7rem; color: var(--muted); }
.cq-pr.ok { border-color: var(--ok); background: var(--ok-soft); }
.cq-pr.err { border-color: var(--err); background: var(--err-soft); }
.cq-row { font: 600 0.76rem/1.45 var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.cq-row.lit { color: var(--accent); }
`;

  Lab.addTrack({
    id: 'capquality',
    title: 'Quality pass',
    kind: 'project',
    description: 'Take the finished News app and make it tested, smooth, leak-free, accessible, adaptive and quick to start, one checked step at a time.',
    builds: 'The same News app, now with ViewModel and Flow tests, UI tests, rows that skip work they don’t need, no leaked Activity, a TalkBack-friendly Refresh button, a two-pane layout on wide screens, a Baseline Profile for a faster cold start, and a list of quality gates every change must pass.',
    group: 'Going deeper',
    requires: ['capapp', 'testing', 'perf', 'a11y'],
    css,
    lessons: [
      // 1 unit-tests ─────────────────────────────────────────────
      {
        id: 'unit-tests',
        title: 'Unit tests',
        tagline: 'Pin down what NewsViewModel does today, before the pass changes anything.',
        goals: ['Move FakeNewsRepository into src/test and give it switches for tests', 'Test NewsViewModel’s states with runTest and a test Main dispatcher', 'Catch a broken refresh() with a failing test'],
        level: 'intermediate', introduces: [],
        refs: ['testing.unit', 'testing.fakes', 'testing.coroutines', 'capapp.states'],
        body: `
<p>The News app from the last project works. This project gives it a <em>quality pass</em>: tests, smoother lists, no leaks, a better experience with TalkBack, a layout for wide screens and a faster start. Each of those changes can quietly break something that worked. So the first step changes nothing in the app: it writes tests that pin down what <code>NewsViewModel</code> does today. Every later step runs them again. The board in each demo shows the checks the pass has added so far.</p>
<p>The tests need a repository without a server or a database. <code>NewsViewModel</code> asks for the <code>NewsRepository</code> interface, so a test can hand it a fake, the payoff of the interface from the last project. <code>FakeNewsRepository</code> moves out of the app into <code>app/src/test</code> and gets switches: <code>table</code>, a <code>MutableStateFlow</code> that plays Room’s table; <code>failRefresh</code>, which makes <code>refresh()</code> throw like a phone with no signal; and <code>refreshCalls</code>, which counts the refreshes.</p>
<p><code>NewsViewModel</code> starts its work in <code>viewModelScope</code>, which runs on the Main dispatcher, and the computer has none. As in the testing track, <code>@Before</code> sets Main to a <code>StandardTestDispatcher</code> and <code>@After</code> resets it. Inside <code>runTest</code>, nothing the ViewModel launched has run until <code>advanceUntilIdle()</code> runs it all. Three tests cover the start: a spinner first, then the saved articles, and a message when the refresh fails. <code>./gradlew test</code> runs them in seconds.</p>`,
        visual(el) {
          const T = ['starts with a spinner', 'shows the saved articles', 'offline refresh ends with a message'];
          const fake = ['// app/src/test/java/com/example/news/data/FakeNewsRepository.kt', 'class FakeNewsRepository(saved: List<Article> = listOf()) : NewsRepository {', '    val table = MutableStateFlow(saved)', '    var refreshCalls = 0', '    var failRefresh = false',
            '    override val articles: Flow<List<Article>> = table', '    override suspend fun refresh() {', '        refreshCalls += 1', '        if (failRefresh) { throw IOException("offline") }', '    }', '}'];
          const refresh = end => ['// NewsViewModel.refresh(), inside viewModelScope.launch', 'var error: String? = null', 'try {', '    repository.refresh()', end ? '' : '    _uiState.value = _uiState.value.copy(isRefreshing = false, errorMessage = error)',
            '} catch (e: IOException) {', '    error = "No connection."', '}', '// the other two catch blocks, as before', end ? '_uiState.value = _uiState.value.copy(isRefreshing = false, errorMessage = error)' : ''].filter(l => l !== '');
          demo(el, {
            step: 1,
            panelTitle: 'Tests and code',
            predict: {
              q: 'A teammate moves the line that ends a refresh into the <code>try</code> block, right after <code>repository.refresh()</code>. Which test notices?',
              options: ['<code>offline refresh ends with a message</code>', '<code>shows the saved articles</code>', 'None: the app still compiles'],
              a: 0,
              why: 'Only that test makes the refresh fail. With the line inside <code>try</code>, a failure skips it, so the message never arrives.',
            },
            frames: [
              { screen: { list: ['a4', 'a3'] }, board: { unit: ['new', 'not written yet'] }, panel: file(fake, [2, 4]), say: 'News, as the last project left it. Before anything changes, tests pin down what <code>NewsViewModel</code> does. They hand it <code>FakeNewsRepository</code>: <code>table</code> plays Room’s table, and <code>failRefresh</code> plays a phone with no signal.' },
              { screen: { spin: true }, panel: tests([[T[0], 'pass'], [T[1], ''], [T[2], '']]), say: '<code>starts with a spinner</code>: build the ViewModel and read <code>uiState.value</code> at once. The test dispatcher hasn’t run what <code>init</code> launched, so <code>isLoading</code> is still <code>true</code>.' },
              { screen: { list: ['a4', 'a3'] }, panel: tests([[T[0], 'pass'], [T[1], 'pass'], [T[2], '']]), say: '<code>shows the saved articles</code>: the fake starts with two articles. <code>advanceUntilIdle()</code> runs everything <code>init</code> launched, and the state holds both, with <code>isLoading = false</code>.' },
              { screen: { list: ['a4'], note: 'No connection. Showing saved news.' }, board: { unit: ['new', 'ViewModel · 3'] }, ping: 'unit', panel: tests([[T[0], 'pass'], [T[1], 'pass'], [T[2], 'pass']], ['+BUILD SUCCESSFUL in 9s']), say: '<code>offline refresh ends with a message</code>: with <code>failRefresh = true</code>, the state ends with <code>errorMessage = "No connection."</code> and <code>isRefreshing = false</code>. The phone shows what the screen draws for it. <code>./gradlew test</code> runs all three on the computer.' },
              { screen: { list: ['a4'] }, refreshing: true, panel: file(refresh(false), [], [4]), say: 'Weeks later, a teammate tidies <code>refresh()</code> and moves the last line into <code>try</code>, after <code>repository.refresh()</code>. Online, nothing changes. Offline, that line never runs: the pull spinner turns forever and no note appears.' },
              { fail: 'unit', board: { unit: ['fail', '1 test failed'] }, panel: tests([[T[0], 'pass'], [T[1], 'pass'], [T[2], 'fail']], ['!java.lang.AssertionError: expected:<No connection.> but was:<null>', '!BUILD FAILED in 8s']), say: 'The tests run before the change is merged. <code>offline refresh ends with a message</code> fails: the message never came. The bug is caught on the computer, before any user waits for a spinner that never stops.' },
              { screen: { list: ['a4'], note: 'No connection. Showing saved news.' }, refreshing: false, board: { unit: ['new', 'ViewModel · 3'] }, panel: file(refresh(true), [8]), say: 'The line goes back after the <code>catch</code> blocks, where every path reaches it, and the tests pass again. From now on, every step of this project runs them.' },
            ],
          });
        },
        code: `// app/src/test/java/com/example/news/data/FakeNewsRepository.kt
class FakeNewsRepository(saved: List<Article> = listOf()) : NewsRepository {
    val table = MutableStateFlow(saved)        // plays Room's articles table
    var refreshCalls = 0
    var failRefresh = false                    // true: refresh() fails like a phone with no signal

    override val articles: Flow<List<Article>> = table
    override fun article(id: String): Flow<Article?> =
        table.map { list -> list.firstOrNull { it.id == id } }
    override suspend fun refresh() {
        refreshCalls += 1
        if (failRefresh) {
            throw IOException("offline")
        }
    }
}

// app/src/test/java/com/example/news/ui/NewsViewModelTest.kt
val bikeLanes = Article("a4", "City council approves new bike lanes", "City Desk", "Work on the first three kilometres starts in spring.", "2026-10-20T08:50:00Z")
val reef = Article("a3", "Researchers map a deep-sea reef", "Science", "A survey team charted the reef with an underwater drone over six dives.", "2026-10-20T08:15:00Z")

@OptIn(ExperimentalCoroutinesApi::class)
class NewsViewModelTest {
    @Before
    fun setUp() {
        Dispatchers.setMain(StandardTestDispatcher())   // viewModelScope runs here, on the test's clock
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun \`starts with a spinner\`() = runTest {
        val viewModel = NewsViewModel(FakeNewsRepository())
        assertTrue(viewModel.uiState.value.isLoading)          // init's coroutines haven't run yet
    }

    @Test
    fun \`shows the saved articles\`() = runTest {
        val viewModel = NewsViewModel(FakeNewsRepository(listOf(bikeLanes, reef)))
        advanceUntilIdle()                                       // run everything init launched
        assertEquals(listOf(bikeLanes, reef), viewModel.uiState.value.articles)
        assertEquals(false, viewModel.uiState.value.isLoading)
    }

    @Test
    fun \`offline refresh ends with a message\`() = runTest {
        val repository = FakeNewsRepository(listOf(bikeLanes))
        repository.failRefresh = true
        val viewModel = NewsViewModel(repository)
        advanceUntilIdle()
        assertEquals("No connection.", viewModel.uiState.value.errorMessage)
        assertEquals(false, viewModel.uiState.value.isRefreshing)
        assertEquals(1, repository.refreshCalls)
    }
}

// libs.versions.toml, new lines (the new project already had junit):
// [versions]   coroutines = "1.11.0"
// [libraries]  kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "coroutines" }
// app/build.gradle.kts: testImplementation(libs.junit) and testImplementation(libs.kotlinx.coroutines.test)`,
        remember: 'Hand NewsViewModel a fake through its interface, set a test Main dispatcher, run what it launched with advanceUntilIdle(), then check the state.',
        mistakes: [
          { title: 'Checking the state before anything ran', bad: `@Test
fun \`shows the saved articles\`() = runTest {
    val viewModel = NewsViewModel(FakeNewsRepository(listOf(bikeLanes, reef)))
    assertEquals(listOf(bikeLanes, reef), viewModel.uiState.value.articles)
}`, good: `@Test
fun \`shows the saved articles\`() = runTest {
    val viewModel = NewsViewModel(FakeNewsRepository(listOf(bikeLanes, reef)))
    advanceUntilIdle()
    assertEquals(listOf(bikeLanes, reef), viewModel.uiState.value.articles)
}`, why: 'A <code>StandardTestDispatcher</code> only queues what <code>init</code> launches. Until <code>advanceUntilIdle()</code> runs the queue, the state is still the first one, with an empty list.' },
        ],
        terms: [
          { term: 'quality pass', def: 'Going over a working app to make it tested, fast and usable by everyone, one checked change at a time.' },
          { term: 'switch (in a fake)', def: 'A property a test sets to steer the fake, like <code>failRefresh = true</code> to make <code>refresh()</code> throw.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give <code>viewModelScope</code> a Main dispatcher for each test, and take it away after.', code: `@Before
fun setUp() {
    Dispatchers.[[setMain]](StandardTestDispatcher())
}

@After
fun tearDown() {
    Dispatchers.[[resetMain]]()
}`, why: '<code>setMain</code> puts a test dispatcher where Main would be; <code>resetMain</code> puts things back so the next test starts clean.' },
          { type: 'bug', prompt: 'Every test crashes as soon as it builds a <code>NewsViewModel</code>: there is no Main dispatcher on the computer. Tap the line.', code: `@Before
fun setUp() {
    Dispatchers.resetMain()
}

@After
fun tearDown() {
    Dispatchers.resetMain()
}`, bug: 2, fix: '    Dispatchers.setMain(StandardTestDispatcher())', why: 'Before each test, Main must be set to a test dispatcher. Resetting it twice leaves the ViewModel’s <code>viewModelScope</code> with nothing to run on.' },
        ],
        quiz: [
          { q: 'Why can a test hand <code>NewsViewModel</code> a <code>FakeNewsRepository</code>?', options: ['The ViewModel asks for the <code>NewsRepository</code> interface, and the fake implements it', 'Hilt swaps it in during tests', 'Kotlin accepts any class as a parameter'], a: 0, why: 'Any class that implements the interface works. In the app Hilt binds <code>OfflineFirstNewsRepository</code>; in tests, the test passes the fake.' },
          { q: 'In <code>starts with a spinner</code>, why is <code>isLoading</code> still <code>true</code>?', options: ['The test dispatcher only queued what <code>init</code> launched; nothing has run it', 'The fake is slow', '<code>runTest</code> waits a second first'], a: 0, why: 'With a <code>StandardTestDispatcher</code>, launched coroutines wait in a queue until the test runs them, for example with <code>advanceUntilIdle()</code>.' },
          { q: 'Where do these tests run?', options: ['On the computer, with <code>./gradlew test</code>: no phone needed', 'On an emulator, with <code>./gradlew connectedAndroidTest</code>', 'Only inside the release app'], a: 0, why: 'They live in <code>app/src/test</code>: local tests that run on the computer in seconds.' },
        ],
        docs: [['Test Kotlin coroutines on Android', 'https://developer.android.com/kotlin/coroutines/test'], ['Fundamentals of testing Android apps', 'https://developer.android.com/training/testing/fundamentals']],
      },

      // 2 turbine ─────────────────────────────────────────────
      {
        id: 'turbine',
        title: 'Flow tests',
        tagline: 'Check every state the screen goes through, in order, with Turbine.',
        goals: ['Collect uiState with Turbine’s test { } and take each state with awaitItem()', 'Check the order of a first launch: spinner, list with the pull spinner, done', 'Catch a bug that a test of the end state misses'],
        level: 'intermediate', introduces: [],
        refs: ['testing.flows', 'flow.hot', 'capapp.states'],
        body: `
<p>The tests from step 1 read <code>uiState.value</code> once, at the end. But a user sees every state on the way: a spinner, then the saved list with the pull spinner on top, then the finished list. If <code>refresh()</code> forgot to set <code>isRefreshing</code>, the pull spinner would never show and a pull would look like it did nothing. The end state would be exactly the same, so step 1 would stay green.</p>
<p>Turbine, from the testing track, checks the whole stream. <code>viewModel.uiState.test { }</code> collects the flow into a queue, and each <code>awaitItem()</code> takes the next state, or fails after a few seconds if none comes. States left in the queue at the end fail the test too, so nothing slips by. A <code>StateFlow</code> hands a new collector its current value first, so the first <code>awaitItem()</code> is the state right now.</p>
<p>For a first launch with two saved articles, there are three states. First, <code>isLoading = true</code>, with <code>isRefreshing</code> already <code>true</code> because <code>init</code> called <code>refresh()</code>. Second, the articles arrive while the refresh still runs. Third, the refresh is done. A second test makes the refresh fail and checks that the third state carries the message.</p>`,
        visual(el) {
          const S1 = 'isLoading = true · isRefreshing = true';
          const S2 = 'articles = 2 · isLoading = false · isRefreshing = true';
          const S3 = 'articles = 2 · isRefreshing = false · errorMessage = null';
          const q = (n, lit) => rows([S1, S2, S3].slice(0, n).map((s, i) => `${i + 1 === lit ? '*' : ''}awaitItem() #${i + 1}: ${s}`));
          const T = ['starts with a spinner', 'shows the saved articles', 'offline refresh ends with a message', 'first launch goes spinner, list, done', 'offline launch ends with a message'];
          demo(el, {
            step: 2,
            panelTitle: 'States Turbine received',
            predict: {
              q: 'A bug: <code>refresh()</code> no longer sets <code>isRefreshing = true</code>. Do the three tests from step 1 notice?',
              options: ['No: they only check the end state, which is the same', 'Yes: all three fail', 'Only <code>starts with a spinner</code> fails'],
              a: 0,
              why: 'At the end, <code>isRefreshing</code> is <code>false</code> and the articles are there, with or without the bug. Only a test of the states on the way sees the missing spinner.',
            },
            frames: [
              { screen: { spin: true }, panel: q(1, 1), say: '<code>uiState.test { }</code> starts collecting. A <code>StateFlow</code> hands it the current value at once: <code>isLoading = true</code>, and <code>isRefreshing = true</code>, because <code>init</code> already called <code>refresh()</code>.' },
              { screen: { list: ['a4', 'a3'] }, refreshing: true, panel: q(2, 2), say: 'The next <code>awaitItem()</code> waits, and the test dispatcher runs what <code>init</code> launched. The fake’s two articles arrive while the refresh still runs: the list, with the pull spinner on top.' },
              { refreshing: false, ping: 'unit', panel: q(3, 3), say: 'The refresh finishes: <code>isRefreshing = false</code>, no message. Three states in order, none left over: the test passes.' },
              { panel: file(['fun refresh() {', '    if (_uiState.value.isRefreshing) return', '    _uiState.value = _uiState.value.copy(errorMessage = null)', '    // launch, try, catch and the last line, as before', '}'], [], [2]), say: 'Another tidy-up goes wrong: <code>refresh()</code> no longer sets <code>isRefreshing = true</code>. A pull shows no spinner, so it looks as if nothing happened. And the guard on the line above never stops a second refresh any more.' },
              { fail: 'unit', board: { unit: ['fail', '1 test failed'] }, panel: tests([[T[0], 'pass'], [T[1], 'pass'], [T[2], 'pass'], [T[3], 'fail'], [T[4], 'pass']], ['!java.lang.AssertionError']), say: 'The three end-state tests pass: the end is the same. <code>first launch goes spinner, list, done</code> fails at <code>assertTrue(loaded.isRefreshing)</code>: the second state never had the spinner.' },
              { board: { unit: ['new', 'with Turbine · 5'] }, ping: 'unit', panel: tests(T.map(t => [t, 'pass']), ['+BUILD SUCCESSFUL in 9s']), say: 'The line is fixed, and all five tests pass. Step 1’s tests check where the ViewModel ends; the Turbine tests check the way there.' },
            ],
          });
        },
        code: `// app/src/test/java/com/example/news/ui/NewsViewModelTest.kt, two more tests
@Test
fun \`first launch goes spinner, list, done\`() = runTest {
    val viewModel = NewsViewModel(FakeNewsRepository(listOf(bikeLanes, reef)))
    viewModel.uiState.test {
        assertTrue(awaitItem().isLoading)                   // 1: the spinner
        val loaded = awaitItem()                            // 2: Room's rows arrived...
        assertEquals(listOf(bikeLanes, reef), loaded.articles)
        assertTrue(loaded.isRefreshing)                     // ...while the refresh still runs
        val done = awaitItem()                              // 3: the refresh finished
        assertEquals(false, done.isRefreshing)
        assertEquals(null, done.errorMessage)
    }
}

@Test
fun \`offline launch ends with a message\`() = runTest {
    val repository = FakeNewsRepository(listOf(bikeLanes))
    repository.failRefresh = true
    val viewModel = NewsViewModel(repository)
    viewModel.uiState.test {
        awaitItem()                                         // the spinner
        awaitItem()                                         // the saved article, still refreshing
        val done = awaitItem()
        assertEquals("No connection.", done.errorMessage)
        assertEquals(listOf(bikeLanes), done.articles)      // the saved news stays
    }
}

// libs.versions.toml, new lines:
// [versions]   turbine = "1.2.1"
// [libraries]  turbine = { group = "app.cash.turbine", name = "turbine", version.ref = "turbine" }
// app/build.gradle.kts: testImplementation(libs.turbine)`,
        remember: 'uiState.test { } queues every state; awaitItem() takes them in order; a state left over at the end fails the test.',
        mistakes: [
          { title: 'Stopping before the last state', bad: `viewModel.uiState.test {
    assertTrue(awaitItem().isLoading)
    assertTrue(awaitItem().isRefreshing)
}   // the "done" state is still in the queue`, good: `viewModel.uiState.test {
    assertTrue(awaitItem().isLoading)
    assertTrue(awaitItem().isRefreshing)
    assertEquals(false, awaitItem().isRefreshing)
}`, why: 'At the end of <code>test { }</code>, Turbine checks that the queue is empty. A state nobody took fails the test, so you notice states you didn’t expect.' },
        ],
        terms: [
          { term: 'state sequence', def: 'The states a screen goes through, in order, like spinner, list with the pull spinner, finished list. Turbine tests check it one <code>awaitItem()</code> at a time.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Collect <code>uiState</code> with Turbine and take its three states in order.', code: `viewModel.uiState.[[test]] {
    assertTrue([[awaitItem]]().isLoading)
    assertTrue(awaitItem().isRefreshing)
    assertEquals(false, awaitItem().isRefreshing)
}`, why: '<code>test { }</code> collects into a queue, and each <code>awaitItem()</code> takes the next state from it.' },
          { type: 'bug', prompt: 'This test fails with the correct <code>NewsViewModel</code>. Tap the line that expects the wrong thing.', code: `viewModel.uiState.test {
    assertTrue(awaitItem().isLoading)
    val loaded = awaitItem()
    assertEquals(false, loaded.isRefreshing)
    assertEquals(false, awaitItem().isRefreshing)
}`, bug: 3, fix: '    assertTrue(loaded.isRefreshing)', why: 'When the articles first arrive, the refresh from <code>init</code> is still running. The second state has <code>isRefreshing = true</code>; only the third has it <code>false</code>.' },
        ],
        quiz: [
          { q: 'Inside <code>viewModel.uiState.test { }</code>, what does the first <code>awaitItem()</code> return?', options: ['The state <code>uiState</code> holds right now', 'Nothing, until the state changes', 'The last state the flow will ever have'], a: 0, why: 'A <code>StateFlow</code> always gives a new collector its current value first.' },
          { q: 'The block ends while one state is still in Turbine’s queue. What happens?', options: ['The test fails', 'The state is ignored', 'Turbine waits for more states'], a: 0, why: 'Turbine checks at the end that every state was taken, so an unexpected state can’t slip by.' },
          { q: 'Why did the missing spinner pass step 1’s tests?', options: ['They read the state once, at the end, and the end was the same', 'They ran on the wrong dispatcher', 'The fake hid the bug'], a: 0, why: 'A test of the end state can’t see what happened on the way. That is what a state sequence test is for.' },
        ],
        docs: [['Turbine', 'https://github.com/cashapp/turbine'], ['Testing Kotlin flows on Android', 'https://developer.android.com/kotlin/flow/test']],
      },

      // 3 ui-tests ─────────────────────────────────────────────
      {
        id: 'ui-tests',
        title: 'UI tests',
        tagline: 'Hand ArticleListScreen a state, find nodes by their text, tap, check.',
        goals: ['Show ArticleListScreen in a test with createComposeRule and a ready-made NewsUiState', 'Find nodes with onNodeWithText, tap with performClick, check with assertIsDisplayed', 'Check that taps send the right events up'],
        level: 'intermediate', introduces: [],
        refs: ['testing.compose-ui', 'capapp.states', 'arch.udf'],
        body: `
<p>The tests so far prove that the ViewModel’s states are right, not that the screen shows them. Remember why the order of the <code>when</code> matters: put <code>empty -&gt;</code> first, and an empty list with an error would say “No news yet.” instead of “No connection.” Every ViewModel test would stay green.</p>
<p><code>ArticleListScreen</code> is stateless: it takes a <code>NewsUiState</code> and two event lambdas. So a test can hand it any state directly, with no ViewModel, no Hilt, no server and no Room. <code>createComposeRule()</code> gives a blank screen, and <code>rule.setContent { }</code> puts the screen on it. In the testing track these ran on Robolectric. News has no Robolectric set up, and these tests should also pass on a real Android, so they go in <code>app/src/androidTest</code> and run on an emulator with <code>./gradlew connectedAndroidTest</code>. Their names are plain camelCase: spaces in test names only work in <code>src/test</code>.</p>
<p>Finders search the semantics tree. <code>ArticleRow</code> uses <code>Modifier.clickable</code>, which merges the row’s two texts into one node with a click action, so <code>onNodeWithText</code> with a headline finds the whole row, and <code>performClick()</code> taps it. The test’s lambdas write down what was sent up: a count of refreshes, or the id that was opened. Three tests: Retry when empty and offline, the note over saved news, and a tap that opens the right article.</p>`,
        visual(el) {
          const T = ['emptyAndOfflineOffersRetry', 'savedNewsShowsTheNote', 'tappingARowOpensThatArticle'];
          const treeA = hit => tree([{ d: 0, t: 'Root' }, { d: 1, t: 'Text "News"' }, { d: 1, t: 'Text "No connection."', hit: hit === 'msg' }, { d: 1, t: 'Button "Retry"  [OnClick]', hit: hit === 'retry' }]);
          const treeB = hit => tree([{ d: 0, t: 'Root' }, { d: 1, t: 'Text "News"' }, { d: 1, t: 'Text "No connection. Showing saved news."', hit: hit === 'note' }, { d: 1, t: 'LazyColumn  [Scroll]', dim: true },
            { d: 2, t: 'Node "City council approves new bike lanes", "City Desk"  [OnClick]', hit: hit === 'a4' }, { d: 2, t: 'Node "Researchers map a deep-sea reef", "Science"  [OnClick]', hit: hit === 'a3' }]);
          const saved = { list: ['a4', 'a3'], note: 'No connection. Showing saved news.' };
          demo(el, {
            step: 3,
            panelTitle: 'Semantics tree (simplified)',
            predict: {
              q: 'A teammate moves <code>empty -&gt;</code> to the top of the <code>when</code>. Which tests fail?',
              options: ['<code>emptyAndOfflineOffersRetry</code> only', 'Every ViewModel test', 'None: the screen still compiles'],
              a: 0,
              why: 'The ViewModel didn’t change, so its tests pass. For an empty list with an error the screen now says “No news yet.”, and the finder for “No connection.” finds nothing.',
            },
            frames: [
              { screen: { msg: { title: 'No connection.', btn: 'Retry' } }, board: { ui: ['new', 'not written yet'] }, panel: treeA(), say: 'Test 1 hands <code>ArticleListScreen</code> a ready-made state: empty, not loading, <code>errorMessage = "No connection."</code>. No ViewModel, no server: the screen draws the state it gets. The panel shows its semantics tree.' },
              { find: 'msg', panel: treeA('msg'), say: '<code>onNodeWithText("No connection.")</code> looks for a node with exactly that text, and <code>assertIsDisplayed()</code> checks that it is on screen.' },
              { tap: 'retry', panel: treeA('retry'), say: '<code>onNodeWithText("Retry").performClick()</code> taps the button. The test’s <code>onRefresh</code> adds one to <code>refreshes</code>, and <code>assertEquals(1, refreshes)</code> passes: the tap went up as an event.' },
              { screen: saved, find: 'note', panel: treeB('note'), say: 'Test 2: two saved articles and the same error. The finder for the note passes, and so does one for a headline. The list stays, with the note on top.' },
              { tap: 'row:a3', panel: treeB('a3'), say: 'Test 3: <code>onNodeWithText("Researchers map a deep-sea reef")</code> finds the whole row, because <code>clickable</code> merged its two texts into one node. <code>performClick()</code> taps it, and <code>onOpen</code> receives <code>"a3"</code>. Nothing navigates: in the test, <code>onOpen</code> only writes the id down.' },
              { screen: { msg: { title: 'No news yet.', btn: 'Refresh' } }, fail: 'ui', board: { ui: ['fail', '1 test failed'] }, panel: tests([[T[0], 'fail'], [T[1], 'pass'], [T[2], 'pass']]), say: 'Now the order mistake from the last project: <code>empty -&gt;</code> moves to the top of the <code>when</code>. Every ViewModel test still passes. Test 1 doesn’t: the screen says “No news yet.”, no node has the text “No connection.”, and the finder fails.' },
              { screen: { msg: { title: 'No connection.', btn: 'Retry' } }, ping: 'ui', board: { ui: ['new', 'Screen tests · 3'] }, panel: tests(T.map(t => [t, 'pass']), ['+BUILD SUCCESSFUL in 1m 12s']), say: 'The order is restored, and all three pass on the emulator with <code>./gradlew connectedAndroidTest</code>. Slower than the unit tests, so there are only a few, for the screen people use most.' },
            ],
          });
        },
        code: `// app/src/androidTest/java/com/example/news/ui/ArticleListScreenTest.kt
val bikeLanes = Article("a4", "City council approves new bike lanes", "City Desk", "Work on the first three kilometres starts in spring.", "2026-10-20T08:50:00Z")
val reef = Article("a3", "Researchers map a deep-sea reef", "Science", "A survey team charted the reef with an underwater drone over six dives.", "2026-10-20T08:15:00Z")

class ArticleListScreenTest {
    @get:Rule
    val rule = createComposeRule()

    @Test
    fun emptyAndOfflineOffersRetry() {
        var refreshes = 0
        rule.setContent {
            MaterialTheme {
                ArticleListScreen(
                    NewsUiState(isLoading = false, errorMessage = "No connection."),
                    onRefresh = { refreshes += 1 },
                    onOpen = {},
                )
            }
        }
        rule.onNodeWithText("No connection.").assertIsDisplayed()
        rule.onNodeWithText("Retry").performClick()
        assertEquals(1, refreshes)
    }

    @Test
    fun savedNewsShowsTheNote() {
        rule.setContent {
            MaterialTheme {
                ArticleListScreen(
                    NewsUiState(articles = listOf(bikeLanes, reef), isLoading = false, errorMessage = "No connection."),
                    onRefresh = {},
                    onOpen = {},
                )
            }
        }
        rule.onNodeWithText("No connection. Showing saved news.").assertIsDisplayed()
        rule.onNodeWithText("City council approves new bike lanes").assertIsDisplayed()
    }

    @Test
    fun tappingARowOpensThatArticle() {
        var opened = ""
        rule.setContent {
            MaterialTheme {
                ArticleListScreen(
                    NewsUiState(articles = listOf(bikeLanes, reef), isLoading = false),
                    onRefresh = {},
                    onOpen = { id -> opened = id },
                )
            }
        }
        rule.onNodeWithText("Researchers map a deep-sea reef").performClick()
        assertEquals("a3", opened)
    }
}

// The new project's catalog already has these, under the Compose BOM:
// androidx-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
// androidx-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
// app/build.gradle.kts: androidTestImplementation(platform(libs.androidx.compose.bom)),
//     androidTestImplementation(libs.androidx.ui.test.junit4), debugImplementation(libs.androidx.ui.test.manifest)`,
        remember: 'Hand the stateless screen a state, find nodes by text, act with perform…, check with assert…, and let the lambdas record the events.',
        mistakes: [
          { title: 'Testing the screen through the whole app', bad: `// start MainActivity, wait for Hilt, Room and the server,
// then hope the server is offline right now
rule.onNodeWithText("No connection.").assertIsDisplayed()`, good: `rule.setContent {
    ArticleListScreen(NewsUiState(isLoading = false, errorMessage = "No connection."), onRefresh = {}, onOpen = {})
}
rule.onNodeWithText("No connection.").assertIsDisplayed()`, why: 'Through the whole app, the test depends on the network and is slow and flaky. The stateless screen takes the exact state you want to check.' },
        ],
        terms: [
          { term: 'merged node', def: 'One semantics node that stands for a group, like a <code>clickable</code> row: its texts and its click action together. Finders find it by any of its texts.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Tap Retry, then check that the event went up once.', code: `rule.onNodeWithText("No connection.").[[assertIsDisplayed]]()
rule.onNodeWithText("Retry").[[performClick]]()
assertEquals(1, refreshes)`, why: 'Checks start with <code>assert</code>, actions with <code>perform</code>. The test’s <code>onRefresh</code> counts the taps.' },
          { type: 'bug', prompt: 'This test always fails, though tapping the reef row works in the app. Tap the line that checks the wrong thing.', code: `var opened = ""
rule.setContent {
    ArticleListScreen(NewsUiState(articles = listOf(bikeLanes, reef), isLoading = false), onRefresh = {}, onOpen = { id -> opened = id })
}
rule.onNodeWithText("Researchers map a deep-sea reef").performClick()
assertEquals("a4", opened)`, bug: 5, fix: 'assertEquals("a3", opened)', why: 'The reef article’s id is <code>"a3"</code>; <code>"a4"</code> is the bike lanes. The row reports its own <code>article.id</code>.' },
        ],
        quiz: [
          { q: 'Why can the test show <code>ArticleListScreen</code> without a ViewModel?', options: ['It is stateless: it takes a <code>NewsUiState</code> and lambdas', 'Compose tests make ViewModels by themselves', '<code>createComposeRule()</code> starts Hilt'], a: 0, why: 'State down, events up. The screen draws any state you hand it, which is exactly what a test needs.' },
          { q: 'Why does <code>onNodeWithText("Researchers map a deep-sea reef")</code> find something you can click?', options: ['<code>clickable</code> merged the row’s texts and its click into one node', 'Text is always clickable', 'The finder clicks the nearest button'], a: 0, why: 'The merged node carries the headline, the source and the click action, so <code>performClick()</code> taps the row.' },
          { q: 'Where do these tests live, and how do they run?', options: ['<code>app/src/androidTest</code>, on an emulator, with <code>./gradlew connectedAndroidTest</code>', '<code>app/src/test</code>, on the computer', 'Inside the release app'], a: 0, why: 'They run on an emulator or phone: instrumented tests, in <code>src/androidTest</code>.' },
        ],
        docs: [['Test your Compose layout', 'https://developer.android.com/develop/ui/compose/testing'], ['Semantics in Compose', 'https://developer.android.com/develop/ui/compose/accessibility/semantics']],
      },

      // 4 recomposition ─────────────────────────────────────────────
      {
        id: 'recomposition',
        title: 'Fixing recomposition',
        tagline: 'A small feature made every row run again on every pull. Measure it, then give each row less.',
        goals: ['Read recomposition counts in Layout Inspector', 'Explain why a row that takes the whole NewsUiState can never skip', 'Pass each row only what it shows, and measure again'],
        level: 'intermediate', introduces: [],
        refs: ['perf.compose-perf', 'perf.frame', 'compose.recomposition'],
        body: `
<p>A teammate added a small feature: when a refresh fails, every row says “Saved copy”, so readers know the story may be old. To do it, <code>ArticleList</code> and every <code>ArticleRow</code> now take the whole <code>NewsUiState</code>, and the row checks <code>state.errorMessage</code>. It works, and the tests pass. But on a cheaper phone, a pull now stutters.</p>
<p>Measure before changing anything. Layout Inspector in Android Studio, on the running debug app, shows for each composable how often it was recomposed and how often Compose skipped it. One pull online: every row recomposes three times, though no article changed. A pull changes the state three times: <code>isRefreshing</code> on, Room’s new list, <code>isRefreshing</code> off. Each is a new <code>NewsUiState</code> from <code>copy()</code>, and Compose skips a call only when every parameter equals the last one. A changed state never does. And <code>NewsUiState</code> holds a <code>List</code>, which Compose treats as unstable, so it compares the state by instance, not by its contents.</p>
<p>The fix: each row gets only what it shows. <code>ArticleListScreen</code> works out <code>savedCopy = error != null</code> once and passes that <code>Boolean</code> down. <code>Article</code> itself is stable, since it has only <code>val</code> <code>String</code> properties, so Compose compares it with <code>equals</code>: the new but equal articles Room hands back after a refresh still let the rows skip. Measure again: zero recompositions per row.</p>`,
        visual(el) {
          const five = ['a5', 'a4', 'a3', 'a2', 'a1'];
          const six = ['a6', ...five];
          const n = (v, extra = {}) => Object.assign(Object.fromEntries(five.map(id => [id, v])), extra);
          const insp = (scr, list, row, skip = 0) => inspector([['ArticleListScreen', scr, 0], ['ArticleList', list, list ? Math.max(0, scr - list) : 0], ['ArticleRow (a5)', row, skip], ['ArticleRow (a4)', row, skip], ['ArticleRow (a3)', row, skip]]);
          const before = ['// Before: every row gets the whole state', 'fun ArticleRow(article: Article, state: NewsUiState, onClick: () -> Unit) {', '    // title and source, as before', '    if (state.errorMessage != null) {', '        Text("Saved copy")', '    }', '}'];
          const after = ['// After: every row gets only what it shows', 'fun ArticleRow(article: Article, savedCopy: Boolean, onClick: () -> Unit) {', '    // title and source, as before', '    if (savedCopy) {', '        Text("Saved copy")', '    }', '}', '// in ArticleListScreen:', 'ArticleList(state.articles, savedCopy = error != null, onOpen)'];
          demo(el, {
            step: 4,
            panelTitle: 'Layout Inspector: recomposition counts',
            predict: {
              q: 'After the fix, a pull brings one new article. How many of the old rows recompose?',
              options: ['None: their parameters are equal to last time', 'All of them, once', 'All of them, three times'],
              a: 0,
              why: 'Each old row gets an equal <code>Article</code>, the same <code>savedCopy</code> and the same click lambda, so Compose skips it. Only the new row is composed.',
            },
            frames: [
              { screen: { list: five, note: 'No connection. Showing saved news.', tag: 'Saved copy' }, board: { frames: ['new', 'not measured yet'] }, panel: file(before, [1, 3]), say: 'The new feature, offline: every row says “Saved copy”. To know when, each <code>ArticleRow</code> now takes the whole <code>NewsUiState</code> and checks <code>errorMessage</code>.' },
              { screen: { list: five }, counts: n(0), panel: insp(0, 0, 0), say: 'Back online, after a successful refresh. Layout Inspector runs on the debug app with recomposition counts on: how often each composable ran again, and how often Compose skipped it. The counts are reset to zero.' },
              { refreshing: true, counts: n(1), panel: insp(1, 1, 1), say: 'The user pulls. <code>refresh()</code> sets <code>isRefreshing = true</code>: a new state from <code>copy()</code>. Every row recomposes, though no article changed.' },
              { screen: { list: six, fresh: ['a6'] }, counts: n(2, { a6: 0 }), panel: insp(2, 2, 2), say: 'Room writes the rows and emits a new list: another new state, another round for every row. (<code>a6</code> is new, so it is composed for the first time.)' },
              { refreshing: false, counts: n(3, { a6: 1 }), fail: 'frames', board: { frames: ['fail', 'rows: 3 per pull'] }, panel: insp(3, 3, 3), say: '<code>isRefreshing = false</code>: a third round. Three recompositions per row for one pull. On a slower phone, that is the stutter.' },
              { screen: { list: five }, counts: null, panel: file(after, [1, 3, 8]), say: 'Compose skips a call only when every parameter equals the last one, and a new state never does. So each row now gets <code>savedCopy</code>, a <code>Boolean</code> worked out once in <code>ArticleListScreen</code>.' },
              { screen: { list: six, fresh: ['a6'] }, counts: n(0, { a6: 0 }), ping: 'frames', board: { frames: ['new', 'rows skip'] }, panel: insp(3, 1, 0, 1), say: 'The same pull after the fix. <code>savedCopy</code> stayed <code>false</code>, and each <code>Article</code> from Room equals the old one, so the rows skip. Only <code>a6</code> is composed, because it is new. The list feels smooth again.' },
            ],
          });
        },
        code: `@Composable
fun ArticleRow(article: Article, savedCopy: Boolean, onClick: () -> Unit) {   // was: state: NewsUiState
    Column(modifier = Modifier.fillMaxWidth().clickable { onClick() }.padding(16.dp)) {
        Text(article.title, fontWeight = FontWeight.Bold)
        Text(article.source)
        if (savedCopy) {
            Text("Saved copy")
        }
    }
}

@Composable
fun ArticleList(articles: List<Article>, savedCopy: Boolean, onOpen: (String) -> Unit) {
    LazyColumn {
        items(articles, key = { article -> article.id }) { article ->
            ArticleRow(article, savedCopy, onClick = { onOpen(article.id) })
        }
    }
}

// ArticleListScreen, the last branch of the when:
//     else -> Column {
//         if (error != null) {
//             Text("$error Showing saved news.")
//         }
//         ArticleList(state.articles, savedCopy = error != null, onOpen)   // one Boolean for every row
//     }

// Why the rows can skip now:
// - savedCopy is a Boolean: equal unless the error appears or goes away
// - Article has only val String properties: a stable type, compared with equals,
//   so the new but equal articles Room emits after a refresh count as unchanged`,
        remember: 'Measure with Layout Inspector first; then give each composable only the values it shows, of stable types, so Compose can skip it.',
        mistakes: [
          { title: 'Handing a row the whole screen state', bad: `items(state.articles, key = { article -> article.id }) { article ->
    ArticleRow(article, state, onClick = { onOpen(article.id) })
}`, good: `items(articles, key = { article -> article.id }) { article ->
    ArticleRow(article, savedCopy, onClick = { onOpen(article.id) })
}`, why: 'Every change to the state, even one the row doesn’t show, makes a new <code>NewsUiState</code>, and every row runs again. A row should get only what it draws.' },
        ],
        terms: [
          { term: 'recomposition count', def: 'In Layout Inspector: how many times a composable ran again, next to how many times Compose skipped it.' },
          { term: 'stable type', def: 'A type Compose can compare by content, like <code>String</code>, <code>Boolean</code> or a data class with only <code>val</code>s of stable types. Unstable types, like <code>List</code>, are compared by instance.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give each row one <code>Boolean</code> instead of the whole state.', code: `@Composable
fun ArticleRow(article: Article, savedCopy: [[Boolean]], onClick: () -> Unit) { /* ... */ }

ArticleList(state.articles, savedCopy = state.[[errorMessage]] != null, onOpen)`, why: 'The row only needs to know whether to show “Saved copy”. A <code>Boolean</code> is equal from one state to the next unless that answer changes.' },
          { type: 'bug', prompt: 'After this change the rows recompose after every refresh again, though <code>savedCopy</code> is still a <code>Boolean</code>. Tap the line.', code: `@Entity(tableName = "articles")
data class Article(
    @PrimaryKey val id: String,
    var title: String,
    val source: String,
    val summary: String,
    val publishedAt: String,
)`, bug: 3, fix: '    val title: String,', why: 'A <code>var</code> makes <code>Article</code> unstable, so Compose compares it by instance. Room hands back new <code>Article</code> objects after every refresh, which are never the same instance.' },
        ],
        quiz: [
          { q: 'Why did a row that takes <code>NewsUiState</code> recompose three times per pull?', options: ['The pull made three new states, and a new state is never equal to the old one', 'Rows always recompose during a pull', 'Room deletes the rows first'], a: 0, why: '<code>isRefreshing</code> on, the new list, <code>isRefreshing</code> off: three <code>copy()</code> calls, three new parameters for every row.' },
          { q: 'Which tool shows how often each composable recomposed and skipped?', options: ['Layout Inspector', 'Logcat', 'The version catalog'], a: 0, why: 'With recomposition counts on, Layout Inspector shows both numbers for each composable on the running app.' },
          { q: 'After a refresh, Room returns new <code>Article</code> objects with the same values. Do the rows skip?', options: ['Yes: <code>Article</code> is stable, so Compose compares it with <code>equals</code>', 'No: they are new objects', 'Only if the list is sorted'], a: 0, why: 'A data class with only <code>val String</code> properties is stable. Equal values mean equal parameters.' },
        ],
        docs: [['Stability in Compose', 'https://developer.android.com/develop/ui/compose/performance/stability'], ['Debug your layout with Layout Inspector', 'https://developer.android.com/studio/debug/layout-inspector']],
      },

      // 5 leak ─────────────────────────────────────────────
      {
        id: 'leak',
        title: 'Fixing a leak',
        tagline: 'LeakCanary finds an old MainActivity that never went away. Pair every add with a remove.',
        goals: ['Add LeakCanary to debug builds and read its leak trace', 'Explain how a listener kept in an object holds on to a destroyed Activity', 'Add the listener in onStart, remove it in onStop, and check again'],
        level: 'intermediate', introduces: [],
        refs: ['perf.leaks', 'android.lifecycle', 'compose.disposable-effect'],
        body: `
<p>Another small feature: after a refresh, a toast says how many stories were updated. A teammate wrote an <code>object NewsEvents</code> that keeps a list of listeners. <code>OfflineFirstNewsRepository</code> calls <code>NewsEvents.updated(count)</code> after <code>upsertAll</code>, and <code>MainActivity.onCreate</code> adds a lambda that shows the toast, using <code>this</code>, the Activity, as its <code>Context</code>. The toast appears. Nothing looks wrong.</p>
<p><em>LeakCanary</em>, from the performance track, checks what we can’t see. Added to debug builds only, it watches every Activity that gets <code>onDestroy()</code>. If one is still in memory 5 seconds later, LeakCanary counts it as retained. Rotate twice, and its notification counts 2 retained objects; tap it (or press Home) and it saves the memory to a file and shows a <em>leak trace</em>: the chain of references from something that lives forever to the object that should be gone. Here it runs <code>NewsEvents</code> → its list → a lambda → the old <code>MainActivity</code>.</p>
<p>An <code>object</code> lives as long as the app. Its list keeps every lambda it was given, and each lambda keeps the Activity it uses. A rotation destroys Activity #1 and makes #2, which adds a second listener; #1 can never be freed, with its whole screen. The fix is the pairing you know from <code>DisposableEffect</code>: keep the lambda in a property, add it in <code>onStart</code>, and remove it in <code>onStop</code>. Rotate again: LeakCanary stays quiet.</p>`,
        visual(el) {
          const six = ['a6', 'a5', 'a4', 'a3', 'a2', 'a1'];
          const trace = ['…', '├─ com.example.news.NewsEvents class', '│    Leaking: NO (a class is never leaking)', '│    ↓ static NewsEvents.listeners', '│                        ~~~~~~~~~', '├─ java.util.ArrayList instance', '│    Leaking: UNKNOWN', '│    ↓ ArrayList.elementData', '…',
            '╰→ com.example.news.MainActivity instance', '!     Leaking: YES (ObjectWatcher was watching this because com.example.news.MainActivity received Activity#onDestroy() callback and Activity#mDestroyed is true)'];
          const fix = ['// MainActivity', 'private val showUpdated: (Int) -> Unit = { count ->', '    Toast.makeText(this, "$count stories updated", Toast.LENGTH_SHORT).show()', '}', 'override fun onStart() {', '    super.onStart()', '    NewsEvents.addListener(showUpdated)', '}', 'override fun onStop() {', '    super.onStop()', '    NewsEvents.removeListener(showUpdated)', '}'];
          demo(el, {
            step: 5,
            panelTitle: 'In memory',
            predict: {
              q: 'After the fix, the user rotates the phone three times. How many listeners does <code>NewsEvents</code> hold?',
              options: ['One: the visible Activity’s', 'Four: one per Activity', 'None'],
              a: 0,
              why: 'Each Activity removes its listener in <code>onStop</code> before it is destroyed, and the new one adds its own in <code>onStart</code>.',
            },
            frames: [
              { screen: { list: six.slice(1) }, board: { leaks: ['new', 'not checked yet'] }, panel: heap([['NewsEvents', 'listeners: 1'], ['MainActivity #1', 'on screen', 'ok']]), say: 'The app with the new feature. <code>onCreate</code> gave <code>NewsEvents</code> a listener: a lambda that shows a toast with <code>this</code>, Activity #1.' },
              { rotate: true, panel: heap([['NewsEvents', 'listeners: 2'], ['MainActivity #1', 'destroyed, but its listener still points at it', 'leak'], ['MainActivity #2', 'on screen', 'ok']]), say: 'Rotate. Android destroys Activity #1 and makes #2, whose <code>onCreate</code> adds a second listener. The first lambda still holds Activity #1, so it can’t be freed.' },
              { rotate: true, panel: heap([['NewsEvents', 'listeners: 3'], ['MainActivity #1', 'destroyed, still held', 'leak'], ['MainActivity #2', 'destroyed, still held', 'leak'], ['MainActivity #3', 'on screen', 'ok']]), say: 'Again. Every rotation leaves one more destroyed Activity in memory, each with its whole screen.' },
              { fail: 'leaks', board: { leaks: ['fail', 'MainActivity leaked'] }, panel: term(trace), say: 'LeakCanary counted the destroyed Activities as retained. A tap on its notification saves the memory and shows the leak trace: from <code>NewsEvents</code>, through the list, to <code>MainActivity</code>, <code>Leaking: YES</code>. The underlined reference, <code>NewsEvents.listeners</code>, is the one to cut. (Lines are cut where … stands.)' },
              { panel: file(fix, [1, 6, 10]), say: 'The fix: the lambda becomes a property, so the same one can be removed. It is added in <code>onStart</code> and removed in <code>onStop</code>, which runs before the Activity is destroyed.' },
              { rotate: true, ping: 'leaks', board: { leaks: ['new', 'LeakCanary: none'] }, panel: heap([['NewsEvents', 'listeners: 1'], ['MainActivity #1', 'destroyed and freed', 'dead'], ['MainActivity #2', 'destroyed and freed', 'dead'], ['MainActivity #3', 'on screen', 'ok']]), say: 'With the fix, start the app and rotate twice again. Each old Activity removed its listener in <code>onStop</code>, so nothing holds it: it is freed, and LeakCanary stays quiet.' },
              { screen: { list: six, fresh: ['a6'] }, toast: '6 stories updated', panel: heap([['NewsEvents', 'listeners: 1'], ['MainActivity #3', 'on screen: shows the toast', 'ok']]), say: 'And the feature still works: after a refresh, the Activity on screen shows the toast.' },
            ],
          });
        },
        code: `object NewsEvents {
    private val listeners = mutableListOf<(Int) -> Unit>()

    fun addListener(listener: (Int) -> Unit) {
        listeners.add(listener)
    }
    fun removeListener(listener: (Int) -> Unit) {
        listeners.remove(listener)
    }
    fun updated(count: Int) {
        for (listener in listeners) {
            listener(count)
        }
    }
}
// OfflineFirstNewsRepository.refresh(), after dao.upsertAll(...):
//     NewsEvents.updated(fresh.size)

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    // A property, so the same lambda can be added and removed
    private val showUpdated: (Int) -> Unit = { count ->
        Toast.makeText(this, "$count stories updated", Toast.LENGTH_SHORT).show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { NewsNavHost() } }
    }

    override fun onStart() {
        super.onStart()
        NewsEvents.addListener(showUpdated)
    }

    override fun onStop() {
        super.onStop()
        NewsEvents.removeListener(showUpdated)    // nothing in NewsEvents points at this Activity now
    }
}

// libs.versions.toml, new lines:
// [versions]   leakcanary = "2.14"
// [libraries]  leakcanary-android = { group = "com.squareup.leakcanary", name = "leakcanary-android", version.ref = "leakcanary" }
// app/build.gradle.kts: debugImplementation(libs.leakcanary.android)    // debug builds only`,
        remember: 'Anything that lives longer than an Activity must not keep it: pair every addListener with a removeListener, and let LeakCanary check.',
        mistakes: [
          { title: 'Adding in onCreate, never removing', bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    NewsEvents.addListener { count ->
        Toast.makeText(this, "$count stories updated", Toast.LENGTH_SHORT).show()
    }
}`, good: `override fun onStart() {
    super.onStart()
    NewsEvents.addListener(showUpdated)
}
override fun onStop() {
    super.onStop()
    NewsEvents.removeListener(showUpdated)
}`, why: 'A lambda written inline can’t be removed later, because nothing keeps a reference to it. Every Activity that adds one stays in memory for as long as the app runs.' },
        ],
        terms: [
          { term: 'leak trace', def: 'LeakCanary’s report: the chain of references from something that lives forever to the object that should have been freed, each marked <code>Leaking: NO</code>, <code>UNKNOWN</code> or <code>YES</code>.' },
          { term: 'retained object', def: 'An object LeakCanary expected to be freed, like an Activity after <code>onDestroy()</code>, that is still in memory.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add the listener when the Activity starts, and remove it when it stops.', code: `override fun [[onStart]]() {
    super.onStart()
    NewsEvents.addListener(showUpdated)
}

override fun onStop() {
    super.onStop()
    NewsEvents.[[removeListener]](showUpdated)
}`, why: '<code>onStart</code> and <code>onStop</code> come in pairs, like the add and the remove. The Activity always stops before it is destroyed.' },
          { type: 'bug', prompt: 'After a few rotations, LeakCanary still finds a leaked <code>MainActivity</code>. Tap the line.', code: `override fun onStart() {
    super.onStart()
    NewsEvents.addListener(showUpdated)
}

override fun onStop() {
    super.onStop()
    NewsEvents.addListener(showUpdated)
}`, bug: 7, fix: '    NewsEvents.removeListener(showUpdated)', why: '<code>onStop</code> adds the listener a second time instead of removing it, so the list keeps the Activity after it is destroyed.' },
        ],
        quiz: [
          { q: 'Why does the destroyed Activity stay in memory?', options: ['<code>NewsEvents</code> lives as long as the app, and its list holds a lambda that holds the Activity', 'Android keeps old Activities for rotation', 'The Toast is still on screen'], a: 0, why: 'Memory is freed only when nothing that is still alive points at it. The leak trace shows the chain.' },
          { q: 'Why is LeakCanary added with <code>debugImplementation</code>?', options: ['It is a tool for developers; the release app that users get shouldn’t include it', 'It only compiles in debug', 'It makes the release build faster'], a: 0, why: 'LeakCanary pauses the app to save its memory to a file. That is fine while you test, not for users.' },
          { q: 'Why is the lambda a property now?', options: ['So the same lambda can be removed later', 'Properties are faster', 'Toasts need a property'], a: 0, why: '<code>removeListener</code> needs the very lambda that was added. An inline lambda can’t be named again.' },
        ],
        docs: [['LeakCanary: getting started', 'https://square.github.io/leakcanary/getting_started/'], ['The activity lifecycle', 'https://developer.android.com/guide/components/activities/activity-lifecycle']],
      },

      // 6 a11y-pass ─────────────────────────────────────────────
      {
        id: 'a11y-pass',
        title: 'Accessibility pass',
        tagline: 'Go through News with TalkBack and large text, and fix what gets in the way.',
        goals: ['Walk through the app with TalkBack and the largest font size to find problems', 'Give pull to refresh a button, and give the rows a clear action label', 'Keep the fix with a UI test'],
        level: 'intermediate', introduces: [],
        refs: ['a11y.semantics', 'a11y.targets', 'a11y.text-scale', 'capapp.states'],
        body: `
<p>Sam uses TalkBack. Swiping right moves TalkBack from one item to the next and reads it aloud. On News, it reads each row as one item, “City council approves new bike lanes, City Desk”, because <code>clickable</code> merged the row: good. Then it adds “Double tap to activate”, which doesn’t say what a double tap does. (TalkBack says something like this; the exact words vary a little between versions and settings.) And refreshing is a problem: the only way is to pull the list down. With TalkBack on, a one-finger drag explores the screen instead of scrolling, and nothing on screen says a pull exists.</p>
<p>Two small fixes. First, a Refresh button in the top bar. <code>TopAppBar</code> has a second slot, <code>actions</code>, for buttons at its end. A <code>TextButton</code> there calls the same <code>onRefresh</code> as the pull; Material buttons keep a touch target of at least 48 dp, and TalkBack reads them as “Refresh, Button”. Second, <code>clickable(onClickLabel = "open article")</code> on the row: <code>onClickLabel</code> names the action, and TalkBack reads it as written after “Double tap to”, so it says “Double tap to open article”.</p>
<p>Two checks pass without changes. At the largest font size, every text grows because it is sized in <code>sp</code>, and the rows grow with it because none has a fixed height. The Retry button and the rows are at least 48 dp. Last, a fourth UI test keeps the button: it taps “Refresh” and checks that <code>onRefresh</code> ran.</p>`,
        visual(el) {
          const five = ['a5', 'a4', 'a3', 'a2', 'a1'];
          demo(el, {
            step: 6,
            panelTitle: 'What TalkBack users get',
            predict: {
              q: 'Before this step, how does a TalkBack user refresh the list?',
              options: ['There is no clear way: the only refresh is a pull that nothing announces', 'Double tap the title', 'TalkBack refreshes it by itself'],
              a: 0,
              why: 'The pull works with fingers on the glass, but TalkBack turns a one-finger drag into exploring. A button is something TalkBack can find and read.',
            },
            frames: [
              { screen: { list: five }, talk: { on: 'title', says: 'News' }, board: { a11y: ['new', 'not checked yet'], ui: ['have', 'Screen tests · 3'] }, panel: rows(['Swipe right: next item', 'Double tap: activate the item', 'One-finger drag: explore the screen']), say: 'TalkBack is on. It reads the item in focus (the green outline) aloud. Swiping right moves to the next item. First, the title: “News”.' },
              { talk: { on: 'row:a5', says: 'Storm expected along the coast on Friday, Weather. Double tap to activate' }, say: 'Swipe right: the first row, read as one item because <code>clickable</code> merged it. But “Double tap to activate” doesn’t say what happens.' },
              { talk: { on: 'row:a4', says: 'City council approves new bike lanes, City Desk. Double tap to activate' }, fail: 'a11y', board: { a11y: ['fail', 'no way to refresh'], ui: ['have', 'Screen tests · 3'] }, panel: rows(['*Refresh: only by pulling the list', 'Rows: “Double tap to activate”', 'Font size: not checked yet']), say: 'Sam wants fresh news. There is no button, and a one-finger drag explores instead of pulling. Nothing on screen says that a pull exists.' },
              { talk: null, big: true, panel: rows(['Refresh: only by pulling the list', 'Rows: “Double tap to activate”', '*Font size 200%: text grows, rows grow, nothing cut off']), say: 'Font size at its largest. Every text is in <code>sp</code>, so it grows, and the rows have no fixed height, so they grow too. Nothing is cut off: this check passes.' },
              { big: false, refreshBtn: true, talk: { on: 'refresh', says: 'Refresh, Button. Double tap to activate' }, board: { a11y: ['new', 'button added'], ui: ['have', 'Screen tests · 3'] }, panel: file(['TopAppBar(', '    title = { Text("News") },', '    actions = {', '        TextButton(onClick = onRefresh) { Text("Refresh") }', '    },', ')'], [2, 3]), say: 'The fix: a <code>TextButton</code> in the top bar’s <code>actions</code>. TalkBack finds it with a swipe and reads “Refresh, Button”. Material buttons keep a touch target of at least 48 dp.' },
              { screen: { list: ['a6', ...five], fresh: ['a6'] }, tap: 'refresh', talk: { on: 'refresh', says: 'Refresh, Button. Double tap to activate' }, say: 'A double tap calls the same <code>onRefresh</code> as the pull. The new story arrives.' },
              { talk: { on: 'row:a6', says: 'Home team wins the regional final, Sport. Double tap to open article' }, ping: ['a11y', 'ui'], board: {}, panel: file(['Column(', '    modifier = Modifier', '        .fillMaxWidth()', '        .clickable(onClickLabel = "open article") { onClick() }', '        .padding(16.dp),', ')'], [3]), say: 'And with <code>onClickLabel = "open article"</code>, each row says what a double tap does. A fourth UI test taps “Refresh” and checks <code>onRefresh</code>, so the button stays.' },
            ],
          });
        },
        code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleListScreen(state: NewsUiState, onRefresh: () -> Unit, onOpen: (String) -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("News") },
                actions = {                                            // buttons at the end of the bar
                    TextButton(onClick = onRefresh) { Text("Refresh") }   // the same event as the pull
                },
            )
        },
    ) { innerPadding ->
        // PullToRefreshBox and the when, as before
    }
}

@Composable
fun ArticleRow(article: Article, savedCopy: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClickLabel = "open article") { onClick() }   // TalkBack: "Double tap to open article"
            .padding(16.dp),
    ) {
        Text(article.title, fontWeight = FontWeight.Bold)
        Text(article.source)
        if (savedCopy) {
            Text("Saved copy")
        }
    }
}

// app/src/androidTest/.../ArticleListScreenTest.kt, a fourth test
@Test
fun refreshButtonSendsRefresh() {
    var refreshes = 0
    rule.setContent {
        MaterialTheme {
            ArticleListScreen(NewsUiState(articles = listOf(bikeLanes), isLoading = false), onRefresh = { refreshes += 1 }, onOpen = {})
        }
    }
    rule.onNodeWithText("Refresh").performClick()
    assertEquals(1, refreshes)
}`,
        remember: 'Try the app with TalkBack and the largest font: every gesture needs a button, every action a name, and a test keeps the fix.',
        mistakes: [
          { title: 'A clickable Text as a button', bad: `actions = {
    Text("Refresh", modifier = Modifier.clickable { onRefresh() })
}`, good: `actions = {
    TextButton(onClick = onRefresh) { Text("Refresh") }
}`, why: 'The clickable text is only as big as its letters, far below 48 dp, and TalkBack doesn’t read it as a button. <code>TextButton</code> has the 48 dp touch target and the Button role built in.' },
        ],
        terms: [
          { term: 'actions', def: 'The slot at the end of a <code>TopAppBar</code> for buttons: <code>actions = { TextButton(onClick = onRefresh) { Text("Refresh") } }</code>.' },
          { term: 'onClickLabel', def: 'A parameter of <code>clickable</code> that names what a click does. TalkBack reads it as written after “Double tap to”, so write it in lowercase.' },
          { term: 'accessibility pass', def: 'Going through an app with TalkBack and large text, fixing what gets in the way, and adding a test so it stays fixed.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put a Refresh button at the end of the top bar, and name what a tap on a row does.', code: `TopAppBar(
    title = { Text("News") },
    [[actions]] = { TextButton(onClick = onRefresh) { Text("Refresh") } },
)

Modifier.clickable([[onClickLabel]] = "open article") { onClick() }`, why: '<code>actions</code> holds the bar’s buttons. <code>onClickLabel</code> is what TalkBack says after “Double tap to”.' },
          { type: 'bug', prompt: 'The Refresh action is hard to hit, and TalkBack doesn’t call it a button. Tap the line.', code: `TopAppBar(
    title = { Text("News") },
    actions = {
        Text("Refresh", modifier = Modifier.clickable { onRefresh() })
    },
)`, bug: 3, fix: '        TextButton(onClick = onRefresh) { Text("Refresh") }', why: 'A <code>TextButton</code> has a 48 dp touch target and the Button role, so TalkBack reads “Refresh, Button”.' },
        ],
        quiz: [
          { q: 'What does <code>onClickLabel = "open article"</code> change?', options: ['TalkBack says “Double tap to open article” instead of “Double tap to activate”', 'The text on the row', 'The size of the row'], a: 0, why: 'It names the action for screen readers; nothing on screen changes.' },
          { q: 'Why isn’t pull to refresh enough?', options: ['With TalkBack, a one-finger drag explores the screen, and nothing announces the pull', 'Pulling is slower than a button', 'Pull to refresh doesn’t work offline'], a: 0, why: 'A gesture nobody can find doesn’t exist for that user. The button does the same thing and TalkBack can reach it.' },
          { q: 'At the largest font size, why are the rows still fine?', options: ['Text is in <code>sp</code> and the rows have no fixed height, so they grow', 'Android shrinks the text back', 'Rows ignore the font size'], a: 0, why: 'Sizes in <code>sp</code> follow the user’s font setting, and a row without a fixed height makes room for it.' },
        ],
        docs: [['Accessibility in Compose', 'https://developer.android.com/develop/ui/compose/accessibility'], ['Semantics in Compose', 'https://developer.android.com/develop/ui/compose/accessibility/semantics']],
      },

      // 7 adaptive ─────────────────────────────────────────────
      {
        id: 'adaptive',
        title: 'Adaptive layout',
        tagline: 'On a wide window, show the list and the article side by side.',
        goals: ['Read the window’s width class with currentWindowAdaptiveInfoV2()', 'Show list and article side by side from 840 dp up, and keep phones as they are', 'Keep the open article when the window rotates or changes size'],
        level: 'intermediate', introduces: [],
        refs: ['a11y.window-size', 'a11y.resizability', 'a11y.foldables', 'compose.saveable'],
        body: `
<p>On a tablet in landscape, an unfolded foldable or a wide desktop window, News stretches one column of headlines across the whole screen, and opening an article hides the list. Since <code>targetSdk</code> 36, Android lets people resize any app on large screens, so News will be shown in wide windows whether it plans for them or not.</p>
<p>The list destination in <code>NewsNavHost</code> asks how wide its window is, as in the accessibility track: <code>currentWindowAdaptiveInfoV2().windowSizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)</code> is <code>true</code> when the window is at least 840 dp wide. It is worked out again whenever the window changes: a rotation, folding, or the user resizing it.</p>
<p>Wide, the destination shows a <code>Row</code>: the list in a 360 dp column, the article in the rest. A tap sets <code>selectedId</code> instead of navigating, and <code>rememberSaveable</code> keeps it through a rotation. The article pane needs no ViewModel: <code>ArticleDetailScreen</code> takes an <code>Article?</code>, and the list’s state already holds every article. Narrow, nothing changes: a tap navigates to <code>ArticleDetail</code> as before.</p>`,
        visual(el) {
          const five = { list: ['a5', 'a4', 'a3', 'a2', 'a1'] };
          const info = (w, wide, how) => rows([`window width: ${w} dp`, `isWidthAtLeastBreakpoint(840): ${wide}`, '*' + how]);
          demo(el, {
            step: 7,
            panelTitle: 'The window',
            predict: {
              q: 'A foldable is unfolded, and News fills a window 900 dp wide. What does it show after this step?',
              options: ['The list and the article side by side', 'One list, stretched across the screen', 'A phone-sized column in the middle'],
              a: 0,
              why: '900 dp is at least 840 dp, so the check is <code>true</code> and the destination shows two panes.',
            },
            frames: [
              { screen: five, panel: info(411, 'false', 'one pane: a tap navigates'), say: 'On a phone in portrait, the window is 411 dp wide: narrower than 840 dp. News works as before.' },
              { screen: { detail: 'a4' }, tap: 'row:a4', say: 'A tap navigates to <code>ArticleDetail("a4")</code>, and the article fills the screen.' },
              { screen: five, wide: true, panes: false, fail: 'sizes', board: { sizes: ['fail', 'stretched on tablets'] }, panel: info(1280, 'true', 'but nothing uses it yet'), say: 'Before this step, on a tablet in landscape: 1280 dp of window, and one long line per headline. Opening an article would hide the list.' },
              { panes: true, sel: null, board: {}, panel: info(1280, 'true', 'two panes: list and article'), say: 'After: the check is <code>true</code>, so the destination shows a <code>Row</code>, the list in a 360 dp column and the article pane in the rest. Each pane keeps its own top bar: “News” over the list, “Article” over the article.' },
              { sel: 'a3', tap: 'row:a3', panel: info(1280, 'true', 'a tap sets selectedId = "a3"'), say: 'A tap sets <code>selectedId</code> instead of navigating. The article pane finds it in <code>state.articles</code> and shows it, and the list stays.' },
              { wide: false, rotate: true, screen: five, panel: info(800, 'false', 'one pane again; selectedId is kept'), say: 'Rotate the tablet to portrait: 800 dp, so one pane, and taps navigate. <code>rememberSaveable</code> keeps <code>selectedId</code>.' },
              { wide: true, rotate: true, ping: 'sizes', board: { sizes: ['new', 'phone · tablet'] }, panel: info(1280, 'true', 'two panes, "a3" still open'), say: 'And back to landscape: two panes, with the reef article still open. The same code fits a phone, a foldable and a tablet.' },
            ],
          });
        },
        code: `composable<ArticleList> {
    val viewModel: NewsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val wide = currentWindowAdaptiveInfoV2().windowSizeClass
        .isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)   // 840 dp or wider
    var selectedId by rememberSaveable { mutableStateOf<String?>(null) }           // kept through rotation

    if (wide) {
        Row {
            Box(modifier = Modifier.width(360.dp)) {
                ArticleListScreen(state, onRefresh = { viewModel.refresh() }, onOpen = { id -> selectedId = id })
            }
            Box(modifier = Modifier.fillMaxSize()) {                               // the rest of the width
                ArticleDetailScreen(state.articles.firstOrNull { it.id == selectedId })
            }
        }
    } else {
        ArticleListScreen(
            state,
            onRefresh = { viewModel.refresh() },
            onOpen = { id -> navController.navigate(ArticleDetail(id)) },
        )
    }
}
// composable<ArticleDetail> stays as it was, for narrow windows.

// libs.versions.toml, new lines:
// [versions]   adaptive = "1.3.0"
// [libraries]  androidx-compose-material3-adaptive = { group = "androidx.compose.material3.adaptive", name = "adaptive", version.ref = "adaptive" }
// app/build.gradle.kts: implementation(libs.androidx.compose.material3.adaptive)`,
        remember: 'Decide by the window’s width class, not the device: from 840 dp, list and article side by side; below, one pane and navigation.',
        mistakes: [
          { title: 'Keeping the selection in plain remember', bad: `var selectedId by remember { mutableStateOf<String?>(null) }`, good: `var selectedId by rememberSaveable { mutableStateOf<String?>(null) }`, why: 'Rotating or resizing makes a new Activity, and <code>remember</code> starts over: the open article disappears. <code>rememberSaveable</code> keeps it.' },
        ],
        terms: [
          { term: 'two-pane layout', def: 'A list and the item it opened, side by side in one window, used when the window is wide enough.' },
          { term: 'expanded width', def: 'The window size class for windows at least 840 dp wide. In code, that 840 is <code>WIDTH_DP_EXPANDED_LOWER_BOUND</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Check for a wide window, and keep the open article through a rotation.', code: `val wide = currentWindowAdaptiveInfoV2().windowSizeClass
    .[[isWidthAtLeastBreakpoint]](WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)
var selectedId by [[rememberSaveable]] { mutableStateOf<String?>(null) }`, why: 'The width check is <code>true</code> from 840 dp. <code>rememberSaveable</code> survives the new Activity a rotation makes.' },
          { type: 'bug', prompt: 'On a tablet, tapping a headline replaces the whole two-pane screen with the article. Tap the line.', code: `if (wide) {
    Row {
        Box(modifier = Modifier.width(360.dp)) {
            ArticleListScreen(state, onRefresh = { viewModel.refresh() }, onOpen = { id -> navController.navigate(ArticleDetail(id)) })
        }
        Box(modifier = Modifier.fillMaxSize()) {
            ArticleDetailScreen(state.articles.firstOrNull { it.id == selectedId })
        }
    }
}`, bug: 3, fix: '            ArticleListScreen(state, onRefresh = { viewModel.refresh() }, onOpen = { id -> selectedId = id })', why: 'In two panes, a tap should only choose the article for the right pane. Navigating puts a whole new destination on top.' },
        ],
        quiz: [
          { q: 'Which windows get two panes?', options: ['Windows at least 840 dp wide', 'Every tablet', 'Every phone in landscape'], a: 0, why: 'The check is about the window, not the device. A tablet in split screen can be narrow; a foldable can be wide.' },
          { q: 'Why not check “is this a tablet”?', options: ['The window can change size: split screen, folding, resizing', 'Android can’t tell tablets apart', 'Tablets don’t run Compose'], a: 0, why: 'What matters is the space the app has right now, and that can change while it runs.' },
          { q: 'Why does the article pane need no <code>ArticleViewModel</code>?', options: ['<code>ArticleDetailScreen</code> takes an <code>Article?</code>, and the list’s state already holds every article', 'Panes can’t have ViewModels', 'Hilt doesn’t work in a <code>Row</code>'], a: 0, why: 'The screen is stateless, so any caller can hand it the article it should show.' },
        ],
        docs: [['Use window size classes', 'https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes'], ['Support different display sizes', 'https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes']],
      },

      // 8 startup ─────────────────────────────────────────────
      {
        id: 'startup',
        title: 'Faster startup',
        tagline: 'Measure the cold start, record a Baseline Profile, and measure again.',
        goals: ['Measure News’s cold start with a Macrobenchmark before changing anything', 'Generate a Baseline Profile and ship it in the app', 'Report when the list is really drawn with ReportDrawnWhen'],
        level: 'intermediate', introduces: ['ReportDrawnWhen'],
        refs: ['testing.baseline', 'perf.startup', 'perf.profiler'],
        body: `
<p>The first launch after an install feels slow: a blank screen, the spinner, then the list. Right after installing, Android hasn’t translated News’s code into machine code yet, so it runs more slowly until the phone does that later. A <em>Baseline Profile</em> lists the code that startup runs, so Android translates that code when the app is installed.</p>
<p>Measure first. Android Studio’s <b>Baseline Profile Generator</b> module template adds a <code>:baselineprofile</code> module. In it, <code>BaselineProfileGenerator</code> launches News and records which code ran, and <code>StartupBenchmark</code> cold-starts the release build ten times each way: with nothing translated ahead, and with the profile. Before the profile exists, run only <code>startupNoCompilation</code>: that is the number to beat. It reports <code>timeToInitialDisplayMs</code>, the first frame, and, once the app reports it, <code>timeToFullDisplayMs</code>. The spinner is a first frame, but not a screen anyone wants. <code>ReportDrawnWhen { … }</code>, a composable from <code>activity-compose</code> (already in the app), tells Android the screen is fully drawn once its condition is <code>true</code>. So <code>ArticleListScreen</code> calls <code>ReportDrawnWhen { !state.isLoading }</code>: “fully drawn” means Room has answered and the real list screen replaces the first spinner.</p>
<p><code>./gradlew :app:generateBaselineProfile</code> runs the generator on a phone or emulator and writes the profile to <code>app/src/release/generated/baselineProfiles/baseline-prof.txt</code>. The <code>profileinstaller</code> library installs it with the app. Then run both tests of <code>StartupBenchmark</code> and compare the medians. The numbers below are from one test phone; yours will differ, but the comparison is what counts.</p>`,
        visual(el) {
          const out = (n, p) => [`StartupBenchmark_startupNoCompilation`, `timeToFullDisplayMs      min 702.3,   median 741.5,   max 799.0`, `timeToInitialDisplayMs   min 412.6,   median 438.2,   max 471.9`,
            ...(p ? [`StartupBenchmark_startupBaselineProfile`, `+timeToFullDisplayMs      min 531.8,   median 559.6,   max 590.3`, `+timeToInitialDisplayMs   min 301.4,   median 318.7,   max 342.0`] : [])].slice(0, n);
          const five = { list: ['a5', 'a4', 'a3', 'a2', 'a1'] };
          demo(el, {
            step: 8,
            panelTitle: 'Startup',
            predict: {
              q: 'When does the Baseline Profile help the most?',
              options: ['On the first launches after an install or an update', 'Only on the developer’s phone', 'Only when the phone is offline'],
              a: 0,
              why: 'Later, the phone translates the app’s often-used code by itself. The profile gets that code translated at install time, so even the first launch is quick.',
            },
            frames: [
              { screen: { blank: true }, dark: true, board: { start: ['new', 'not measured yet'] }, panel: rows(['StartupMode.COLD: the app’s process is stopped first', 'CompilationMode.None(): nothing translated ahead', 'iterations = 10']), say: 'A cold start: News’s process isn’t running, so Android starts it from nothing. <code>startupNoCompilation</code> does this ten times on the release build, before there is any profile.' },
              { screen: { spin: true }, panel: file(['@Composable', 'fun ArticleListScreen(state: NewsUiState, onRefresh: () -> Unit, onOpen: (String) -> Unit) {', '    ReportDrawnWhen { !state.isLoading }', '    // Scaffold, PullToRefreshBox and the when, as before', '}'], [2]), say: 'The first frame is the spinner. <code>ReportDrawnWhen { !state.isLoading }</code> tells Android when the screen is really ready: once Room has answered and the list screen replaces the spinner. On the test phone, which has saved news after the first run, that is the list.' },
              { screen: five, panel: term(out(3)), say: 'Before any change: a median of 438 ms to the first frame and 742 ms to the list. Measured, not guessed.' },
              { panel: term(['$ ./gradlew :app:generateBaselineProfile', 'BUILD SUCCESSFUL in 3m 48s']), say: 'The generator launches News on an emulator and records every class and method that ran, while the Gradle plugin writes them into the app’s source folder.' },
              { panel: file(['# app/src/release/generated/baselineProfiles/baseline-prof.txt', 'Lcom/example/news/ui/NewsViewModel;', 'HSPLcom/example/news/ui/NewsViewModel;-><init>(Lcom/example/news/data/NewsRepository;)V', '(thousands more lines)'], [1, 2]), say: 'The profile is a text file: one line per class or method that startup uses. The release build includes it, and <code>profileinstaller</code> has Android translate that code at install.' },
              { screen: five, panel: term(out(6, true)), say: 'Now run both tests of <code>StartupBenchmark</code>. With the profile, the median first frame drops from 438 to 319 ms, and the list from 742 to 560 ms.' },
              { ping: 'start', board: { start: ['new', 'baseline profile'] }, panel: bars([['list, before', 742], ['list, profile', 560, 'ok'], ['frame, before', 438], ['frame, profile', 319, 'ok']]), say: 'About a quarter faster on the first launch, and the benchmark stays in the project, so the next release can be compared with this one.' },
            ],
          });
        },
        code: `// baselineprofile/src/main/java/com/example/news/baselineprofile/BaselineProfileGenerator.kt
class BaselineProfileGenerator {
    @get:Rule
    val rule = BaselineProfileRule()

    @Test
    fun generate() = rule.collect(packageName = "com.example.news") {
        pressHome()
        startActivityAndWait()            // launch News and wait for its first frame
    }
}

// baselineprofile/src/main/java/com/example/news/baselineprofile/StartupBenchmark.kt
class StartupBenchmark {
    @get:Rule
    val rule = MacrobenchmarkRule()

    @Test
    fun startupNoCompilation() = startup(CompilationMode.None())          // run this one first: the number to beat

    @Test
    fun startupBaselineProfile() = startup(CompilationMode.Partial())            // needs the profile

    private fun startup(mode: CompilationMode) = rule.measureRepeated(
        packageName = "com.example.news",
        metrics = listOf(StartupTimingMetric()),
        compilationMode = mode,
        startupMode = StartupMode.COLD,
        iterations = 10,                       // ten starts each
    ) {
        pressHome()
        startActivityAndWait()
    }
}

// ArticleListScreen, first line:
//     ReportDrawnWhen { !state.isLoading }     // "fully drawn" = Room has answered, the list screen replaces the spinner

// The module template adds lines like these (the names may differ):
// [versions]   benchmark = "1.5.0"   profileinstaller = "1.4.1"
// [libraries]  androidx-benchmark-macro-junit4 = { group = "androidx.benchmark", name = "benchmark-macro-junit4", version.ref = "benchmark" }
//              androidx-profileinstaller = { group = "androidx.profileinstaller", name = "profileinstaller", version.ref = "profileinstaller" }
// [plugins]    androidx-baselineprofile = { id = "androidx.baselineprofile", version.ref = "benchmark" }
// app/build.gradle.kts: alias(libs.plugins.androidx.baselineprofile), implementation(libs.androidx.profileinstaller),
//     baselineProfile(project(":baselineprofile"))`,
        remember: 'Measure the cold start, generate the Baseline Profile, measure again, and keep the benchmark to compare the next release.',
        mistakes: [
          { title: 'Reporting “fully drawn” too early', bad: `ReportDrawnWhen { state.isLoading }`, good: `ReportDrawnWhen { !state.isLoading }`, why: 'With the condition the wrong way round, the app reports “fully drawn” on its first frame, while the spinner still shows. <code>timeToFullDisplayMs</code> then measures the spinner, not the list.' },
        ],
        terms: [
          { term: 'Baseline Profile', def: 'A list of the classes and methods an app runs at startup, shipped in the app so Android translates them into machine code when it is installed.' },
          { term: 'timeToFullDisplayMs', def: 'How long a cold start takes until the app reports it is fully drawn, here with <code>ReportDrawnWhen</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Record the profile while News starts.', code: `@Test
fun generate() = rule.[[collect]](packageName = "com.example.news") {
    pressHome()
    [[startActivityAndWait]]()
}`, why: '<code>collect</code> records the code that runs inside its block; <code>startActivityAndWait()</code> launches the app and waits for its first frame.' },
          { type: 'bug', prompt: '<code>timeToFullDisplayMs</code> comes out the same as the first frame, though the list appears much later. Tap the line.', code: `@Composable
fun ArticleListScreen(state: NewsUiState, onRefresh: () -> Unit, onOpen: (String) -> Unit) {
    ReportDrawnWhen { state.isLoading }
    // Scaffold, PullToRefreshBox and the when, as before
}`, bug: 2, fix: '    ReportDrawnWhen { !state.isLoading }', why: 'At the first frame <code>isLoading</code> is <code>true</code>, so the condition is met at once. “Fully drawn” should wait until loading is over.' },
        ],
        quiz: [
          { q: 'Why does <code>StartupBenchmark</code> have a test with <code>CompilationMode.None()</code>?', options: ['To have a number without the profile to compare with', 'Because the profile only works the second time', 'To make the build faster'], a: 0, why: 'Ten starts without the profile, ten with it: the difference between the medians is what the profile gives.' },
          { q: 'What does <code>ReportDrawnWhen { !state.isLoading }</code> add to the measurement?', options: ['A “fully drawn” time: when Room has answered and the list screen is drawn', 'A faster first frame', 'A crash report'], a: 0, why: 'Without it, only the first frame is measured, and that is the spinner.' },
          { q: 'Why measure the release build, not the debug one?', options: ['Users get the release build, and debug builds run differently and slower', 'Debug builds can’t start', 'The profile only exists in debug'], a: 0, why: 'Debug builds skip the work that makes release builds fast. Their numbers would mislead you.' },
        ],
        docs: [['Baseline Profiles overview', 'https://developer.android.com/topic/performance/baselineprofiles/overview'], ['Create Baseline Profiles', 'https://developer.android.com/topic/performance/baselineprofiles/create-baselineprofile']],
      },

      // 9 recap ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'Review',
        tagline: 'What the pass changed, and the quality gates that keep it that way.',
        goals: ['List what each step added and the check that keeps it fixed', 'Tell the gates that run on every change from the ones a person runs', 'Plan the next quality step the same way: measure, change, check'],
        level: 'intermediate', introduces: [],
        refs: ['testing.pyramid', 'capapp.recap', 'perf.profiler'],
        body: `
<p>News works the way it did before the pass, and it is better in ways a quick try doesn’t show. Five tests on the computer pin down <code>NewsViewModel</code>’s states and their order. Four UI tests check the list screen, including the Refresh button. Rows skip work they don’t need, rotating leaks nothing, TalkBack users can refresh and know what a tap does, wide windows get two panes, and a Baseline Profile makes the first start about a quarter faster.</p>
<p>A fix only lasts if something checks it. A <em>quality gate</em> is a check every change must pass before it joins the main branch. Two are automatic and run on every pull request: <code>./gradlew test</code> (seconds) and <code>./gradlew connectedAndroidTest</code> on an emulator (a minute or two). The others need a person, before a release or when something feels off: use the debug app for a while and watch for LeakCanary, look at Layout Inspector’s counts on a screen that stutters, try a narrow and a wide window, and run <code>StartupBenchmark</code> to compare with the last release.</p>
<p>The habit matters more than any one fix: measure, change one thing, measure again, and leave a check behind. Next ideas, each a step of its own: screenshot tests of the list in both window sizes, a Hilt test of the whole screen, and tests for <code>OfflineFirstNewsRepository</code> with MockK.</p>`,
        visual(el) {
          const g = (unit, ui, more) => gates([['./gradlew test', unit, unit === 'ok' ? '5 tests passed' : unit === 'run' ? 'running…' : ''], ['./gradlew connectedAndroidTest', ui, ui === 'err' ? 'refreshButtonSendsRefresh failed' : ui === 'ok' ? '4 tests passed' : ui === 'run' ? 'running on an emulator…' : ''],
            ...(more ? [['LeakCanary, Layout Inspector, window sizes, StartupBenchmark', more, 'by a person, before a release']] : [])]);
          const six = { list: ['a6', 'a5', 'a4', 'a3', 'a2', 'a1'] };
          demo(el, {
            step: 9,
            panelTitle: 'Pull request: “Tidy the top bar”',
            predict: {
              q: 'A teammate removes the Refresh button “to tidy the top bar” and opens a pull request. What stops it?',
              options: ['<code>refreshButtonSendsRefresh</code> fails in <code>connectedAndroidTest</code>, so the gate blocks the merge', 'Nothing: the app still works with a pull', 'LeakCanary'],
              a: 0,
              why: 'Step 6 left a test behind for exactly this. The UI test can’t find a node with the text “Refresh”.',
            },
            frames: [
              { screen: six, refreshBtn: true, panel: g('', ''), say: 'Every check the pass added, lit on the board. Now a change arrives: a pull request that “tidies” the top bar.' },
              { refreshBtn: false, panel: g('run', ''), say: 'The change removes the Refresh button. Pull to refresh still works, so in a quick try, nothing seems wrong. The automatic gates start.' },
              { panel: g('ok', 'run'), say: '<code>./gradlew test</code>: the five ViewModel tests pass in seconds. They don’t look at the screen.' },
              { fail: ['ui', 'a11y'], board: { ui: ['fail', 'with Refresh · 4'], a11y: ['fail', 'no way to refresh'] }, panel: g('ok', 'err'), say: '<code>./gradlew connectedAndroidTest</code>: <code>refreshButtonSendsRefresh</code> finds no node with the text “Refresh”. The gate fails, and the change can’t be merged as it is.' },
              { refreshBtn: true, board: {}, panel: g('ok', 'ok', ''), say: 'The teammate keeps the button and tidies something else. Both automatic gates pass.' },
              { ping: ['frames', 'leaks', 'sizes', 'start'], panel: g('ok', 'ok', 'ok'), say: 'Before the release, a person runs the rest: a while with the debug app and LeakCanary, Layout Inspector on the list, a narrow and a wide window, and <code>StartupBenchmark</code>.' },
              { board: {}, panel: rows(['1  measure', '2  change one thing', '3  measure again', '*4  leave a check behind']), say: 'That is the whole method of this project, and it works for the next feature too.' },
            ],
          });
        },
        code: `# What the quality pass added to News
# app/src/test/          FakeNewsRepository, NewsViewModelTest (3 end-state tests, 2 with Turbine)
# app/src/androidTest/   ArticleListScreenTest (4 tests, one for the Refresh button)
# baselineprofile/       BaselineProfileGenerator, StartupBenchmark
# app/src/release/generated/baselineProfiles/baseline-prof.txt
# debug builds only:     LeakCanary

# Automatic gates, on every pull request
./gradlew test                    # unit and Flow tests, on the computer
./gradlew connectedAndroidTest    # UI tests, on an emulator

# Gates a person runs, before a release or when something feels off
# LeakCanary:        use the debug app, rotate, open and close screens: no leak reported
# Layout Inspector:  pull and scroll the list: no row recomposes without a reason
# Window sizes:      a phone window and a window 840 dp or wider
# StartupBenchmark:  the median is no slower than the last release`,
        remember: 'Measure, change one thing, measure again, and leave a check behind; automatic gates run on every change, the rest before each release.',
        mistakes: [
          { title: 'Fixing without leaving a check', bad: `// Added a Refresh button for TalkBack users.
// (no test)`, good: `// Added a Refresh button for TalkBack users,
// and refreshButtonSendsRefresh to keep it.`, why: 'Without a check, the next tidy-up removes the fix and nobody notices until a user does. A test turns a fix into a gate.' },
        ],
        terms: [
          { term: 'quality gate', def: 'A check every change must pass before it is merged, like <code>./gradlew test</code> on every pull request.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The two automatic gates: one on the computer, one on an emulator.', code: `./gradlew [[test]]                    # unit and Flow tests
./gradlew [[connectedAndroidTest]]    # UI tests`, why: '<code>test</code> runs <code>src/test</code> on the computer; <code>connectedAndroidTest</code> runs <code>src/androidTest</code> on a connected phone or emulator.' },
          { type: 'bug', prompt: 'Users of the release app get LeakCanary’s notifications. Tap the line in the build file.', code: `dependencies {
    implementation(libs.androidx.profileinstaller)
    implementation(libs.leakcanary.android)
    testImplementation(libs.turbine)
}`, bug: 2, fix: '    debugImplementation(libs.leakcanary.android)', why: 'LeakCanary belongs in debug builds only. With <code>implementation</code> it ships to every user.' },
        ],
        quiz: [
          { q: 'What is a quality gate?', options: ['A check every change must pass before it is merged', 'A screen that blocks users until the app is fast', 'A Gradle plugin that writes tests'], a: 0, why: 'Gates catch a broken fix while it is still a pull request.' },
          { q: 'Which gates run automatically on every pull request?', options: ['<code>./gradlew test</code> and <code>./gradlew connectedAndroidTest</code>', 'LeakCanary and Layout Inspector', '<code>StartupBenchmark</code> only'], a: 0, why: 'Tests run without a person. LeakCanary and Layout Inspector need someone using the app.' },
          { q: 'A teammate says the list feels slow since last week. What comes first?', options: ['Measure: Layout Inspector’s counts, or the profiler', 'Rewrite the list', 'Turn off animations'], a: 0, why: 'Measure, then change one thing, then measure again. A guess may fix the wrong thing.' },
        ],
        docs: [['Fundamentals of testing Android apps', 'https://developer.android.com/training/testing/fundamentals'], ['App quality', 'https://developer.android.com/quality']],
      },
    ],
  });
})();
