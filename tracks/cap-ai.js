/* Capstone project: AI in the News app from the capapp, capquality and capship projects (same names, files and versions).
   A project is a track with kind: 'project'. Each lesson is one step and carries refs: ['track.lesson'].
   Steps: 1 agent-feature (a reading-time label an agent builds, reviewed and fixed), 2 summary (streamed from your
   server), 3 offline (an on-device fallback), 4 recap.
   Every step's demo is demo(el, { step, predict, panelTitle, frames }): a Lab.ui.player stage with the News app's phone
   mock, the AI board (one row per piece this project adds; the piece of this step marked "this step") and a side panel.
   Frame keys: say; kept until changed: screen, panel, board, dialog, toast, net (false: the phone is offline);
   this frame only: ping and fail (board keys), tap and find (a data-k target). Classes start with cai-. */
(() => {
  const { h, hl, replay } = Lab;

  // ---------- the news in the app: the stories from the earlier projects, with word counts and one full text ----------
  const STORIES = [
    { id: 'a1', source: 'Local', title: 'Library extends weekend opening hours', summary: 'Branches stay open until 6 pm on Saturdays and Sundays from next month.', words: 150 },
    { id: 'a2', source: 'Transport', title: 'Rail line reopens after two weeks of repairs', summary: 'Trains run the full timetable again, with slow sections near the bridge.', words: 520 },
    { id: 'a3', source: 'Science', title: 'Researchers map a deep-sea reef', summary: 'A survey team charted the reef with an underwater drone over six dives.', words: 980 },
    { id: 'a4', source: 'City Desk', title: 'City council approves new bike lanes', summary: 'Work on the first three kilometres starts in spring.', words: 640 },
    { id: 'a5', source: 'Weather', title: 'Storm expected along the coast on Friday', summary: 'Forecasters expect strong wind and heavy rain from the afternoon.', words: 410 },
    { id: 'a6', source: 'Sport', title: 'Home team wins the regional final', summary: 'A late goal settled the match in front of a full stadium.', words: 180 },
    { id: 'a7', source: 'Weather', title: 'Coastal road closed as the storm arrives', summary: 'The road between the harbour and the lighthouse stays shut until the wind drops.', words: 760,
      body: 'The coastal road between the harbour and the lighthouse closed at noon as the storm arrived. Waves reached the road near the old pier, and two fallen trees block the bend by the campsite. Buses to the lighthouse stop at the harbour until the road reopens. Council teams expect to clear the trees by…' },
    { id: 'a8', source: 'Local', title: 'Night market returns to the old harbour', summary: 'Food stalls and music every Thursday evening, starting next week.', words: 300 },
  ];
  const story = id => STORIES.find(s => s.id === id);
  // Reading time: 'bug' is the agent's words / 200 (0 for short stories), 'ok' is the reviewed version (never below 1).
  const minutes = (words, mode) => { const m = Math.floor(words / 200); return mode === 'bug' ? m : Math.max(1, m); };

  // ---------- phone mock: data-k on parts lets frames point at them ----------
  function phone() {
    const back = h('span', { class: 'cai-back', 'aria-hidden': 'true', hidden: true }, '‹');
    const title = h('span', { class: 'cai-title', 'data-k': 'title' }, 'News');
    const bar = h('div', { class: 'cai-appbar' }, back, title);
    const scroll = h('div', { class: 'cai-scroll' });
    const over = h('div', { class: 'cai-over', hidden: true });
    const toast = h('div', { class: 'cai-toast', hidden: true });
    const net = h('span', {}, '5G');
    const screen = h('div', { class: 'cai-screen' }, scroll, over, toast);
    const el = h('div', { class: 'cai-phone' }, h('div', { class: 'cai-sb' }, h('span', {}, '9:41'), net), bar, screen);
    return {
      el, scroll, title, back, bar,
      net(on) { net.textContent = on === false ? '✈ offline' : '5G'; net.className = on === false ? 'cai-off' : ''; },
      toast(t) { toast.hidden = !t; if (t && toast.textContent !== t) { toast.textContent = t; replay(toast, 'drop-in'); } if (!t) toast.textContent = ''; },
      dialog(d) {
        over.hidden = !d; over.replaceChildren();
        if (d) over.append(h('div', { class: 'cai-dialog', 'data-k': 'dialog' }, h('b', {}, d.title), d.note ? h('span', {}, d.note) : null,
          h('div', { class: 'cai-dbtns' }, d.btns.map((b, i) => h('span', { 'data-k': 'btn' + i }, b)))));
      },
    };
  }
  // A card in the list. mins: 'bug' | 'ok' adds the reading-time label.
  const card = (a, mins, fresh) => h('div', { class: 'cai-card' + (fresh ? ' cai-fresh' : ''), 'data-k': 'row:' + a.id }, h('b', {}, a.title),
    h('small', { 'data-k': 'min:' + a.id }, a.source + (mins ? ` · ${minutes(a.words, mins)} min read` : '')));
  // The summary box on the detail screen.
  // sum: { btn } (the Summarise button) | { text, writing, by } (by: 'server' | 'phone') | { error }
  const summaryBox = sum => {
    if (!sum) return null;
    const parts = [];
    if (sum.text || sum.writing) parts.push(h('span', { class: 'cai-ailabel' }, sum.by === 'phone' ? 'AI summary, made on this phone. It can contain mistakes.' : 'AI summary. It can contain mistakes.'));
    if (sum.text || sum.writing) parts.push(h('p', { class: 'cai-sumtext' + (sum.writing ? ' cai-writing' : ''), 'data-k': 'sumtext' }, sum.text || ''));
    if (sum.error) parts.push(h('span', { class: 'cai-sumerr', 'data-k': 'sumerr' }, sum.error));
    if (sum.btn) parts.push(h('span', { class: 'cai-btn', 'data-k': 'summarise' }, 'Summarise'));
    return h('div', { class: 'cai-sum', 'data-k': 'sum' }, parts);
  };
  const detailView = (a, s) => h('div', { class: 'cai-detail drop-in', 'data-k': 'detail' }, h('small', {}, a.source + (s.mins ? ` · ${minutes(a.words, s.mins)} min read` : '')), h('h4', {}, a.title),
    summaryBox(s.sum),
    s.body && a.body ? h('p', { class: 'cai-body', 'data-k': 'body' }, a.body) : h('p', {}, a.summary),
    s.body && a.body ? null : h('div', { class: 'cai-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  const center = ({ spin, title, note } = {}) => h('div', { class: 'cai-center' },
    spin ? h('span', { class: 'cai-spin', 'aria-hidden': 'true' }) : null, title ? h('b', { 'data-k': 'msg' }, title) : null, note ? h('span', {}, note) : null);
  // screen: { blank } | { list: ids, mins, fresh: ids, note } | { detail: id, mins, sum, body } | { spin } | { msg: { title, note } }
  function paintScreen(ph, s = { blank: true }) {
    const show = (nodes, opts = {}) => {
      ph.scroll.replaceChildren(...[].concat(nodes).filter(Boolean));
      ph.title.textContent = opts.title || 'News';
      ph.back.hidden = !opts.back;
    };
    if (s.detail) show(detailView(story(s.detail), s), { title: 'Article', back: true });
    else if (s.list) show([s.note ? h('div', { class: 'cai-note', 'data-k': 'note' }, s.note) : null,
      ...s.list.map(id => card(story(id), s.mins, (s.fresh || []).includes(id)))]);
    else if (s.spin) show(center({ spin: true }));
    else if (s.msg) show(center(s.msg));
    else show([]);
  }

  // ---------- the AI board: one row per piece this project adds, and the step that adds it ----------
  const PIECES = [
    ['feat', 'Reading time', [[1, '“3 min read”']]],
    ['review', 'Review', [[1, '3 fixes in the diff'], [4, 'on every diff']]],
    ['db', 'Room', [[1, 'version 2 · migration'], [3, 'version 3 · body']]],
    ['sum', 'Summary', [[2, 'your server · streamed']]],
    ['dev', 'On-device', [[3, 'fallback offline']]],
    ['evals', 'Evals', [[4, '6 examples']]],
  ];
  function spec(step) {
    const s = {};
    for (const [k, , list] of PIECES) {
      const got = list.filter(p => p[0] <= step).pop();
      s[k] = !got ? ['todo'] : [got[0] === step ? 'new' : 'have', got[1]];
    }
    return s;
  }
  function board() {
    const rows = {};
    const el = h('div', { class: 'cai-board', 'aria-label': 'AI board' }, PIECES.map(([k, name]) => {
      const lab = h('span', {});
      const r = h('div', { class: 'cai-gate' }, h('b', {}, name), lab, h('em', {}, 'this step'));
      rows[k] = Object.assign(r, { lab });
      return r;
    }));
    return Object.assign(el, {
      set(k, state, label) { rows[k].className = `cai-gate ${state}`; rows[k].lab.textContent = label || 'not built yet'; },
      ping(k) { replay(rows[k], 'ping'); },
      fail(k) { rows[k].classList.add('fail'); replay(rows[k], 'shake'); },
    });
  }

  // ---------- the step demo ----------
  const KEEP = ['screen', 'panel', 'board', 'dialog', 'toast', 'net'];
  function demo(el, { step, predict, panelTitle = '', frames }) {
    const ph = phone();
    const base = spec(step);
    const B = board();
    const body = h('div', { class: 'cai-pbody' });
    const stage = h('div', { class: 'cai-top' }, ph.el, h('div', { class: 'cai-side' }, B,
      h('div', { class: 'cai-panel' }, h('span', { class: 'cai-cap' }, panelTitle), body)));
    Lab.ui.player(el, { frames, predict, stage, speed: 2600, draw(f, i) {
      const st = {};
      frames.slice(0, i + 1).forEach(x => KEEP.forEach(k => { if (x[k] !== undefined) st[k] = x[k]; }));
      PIECES.forEach(([k]) => { const v = (st.board && st.board[k]) || base[k]; B.set(k, v[0], v[1]); });
      paintScreen(ph, st.screen);
      ph.net(st.net);
      ph.dialog(st.dialog);
      ph.toast(st.toast);
      ph.el.querySelectorAll('.cai-found').forEach(x => x.classList.remove('cai-found'));
      const at = k => k && ph.el.querySelector(`[data-k="${k}"]`);
      const tap = at(f.tap);
      if (tap) replay(tap, 'cai-tapped');
      const found = at(f.find);
      if (found) found.classList.add('cai-found');
      [].concat(f.ping || []).forEach(k => B.ping(k));
      [].concat(f.fail || []).forEach(k => B.fail(k));
      body.replaceChildren();
      if (typeof st.panel === 'function') st.panel(body); else if (st.panel) body.innerHTML = st.panel;
    } });
  }

  // ---------- side panels: each returns node => { ... } for a frame's panel ----------
  // Code or a file: hits are line numbers (0-based) to light up, bad ones to mark red. Lines starting // or # are headings.
  const file = (lines, hits = [], bad = []) => node => node.append(h('div', { class: 'cai-code' }, lines.map((l, i) =>
    h('div', { class: (/^(\/\/|#|<!--)/.test(l) ? 'cai-chead' : 'cai-crow') + (hits.includes(i) ? ' on' : '') + (bad.includes(i) ? ' bad' : '') }, l))));
  // A diff, as the agent left it: path, then lines starting with + (added), - (removed) or a space (unchanged).
  // bad: line numbers (0-based) the review flags.
  const diff = (path, lines, bad = []) => node => node.append(h('div', { class: 'cai-diff' }, h('div', { class: 'cai-dpath' }, path),
    lines.map((l, i) => h('div', { class: 'cai-dl' + (l[0] === '+' ? ' add' : l[0] === '-' ? ' del' : '') + (bad.includes(i) ? ' bad' : '') },
      h('span', { class: 'cai-dsign', 'aria-hidden': 'true' }, l[0] === ' ' ? '' : l[0]), h('span', {}, l.slice(1))))));
  // Terminal or Logcat output: a line starting with $ is the command; ! marks a red line, + a green one.
  const term = lines => node => node.append(h('div', { class: 'cai-term' }, lines.map(l =>
    h('div', { class: l.startsWith('$') ? 'cmd' : l.startsWith('!') ? 'bad' : l.startsWith('+') ? 'ok' : '' }, l.replace(/^[!+]/, '')))));
  // A test run: [name, '' | 'pass' | 'fail'], then output lines (! red, + green).
  const tests = (list, out = []) => node => node.append(h('div', { class: 'cai-tests' },
    list.map(([n, s]) => h('div', { class: 'cai-t' }, h('span', { class: 'cai-tdot ' + (s || '') }), h('span', {}, n),
      s === 'pass' ? h('small', {}, 'passed') : s === 'fail' ? h('small', { class: 'bad' }, 'failed') : null)),
    out.length ? h('div', { class: 'cai-tout' }, out.map(l => h('div', { class: l.startsWith('!') ? 'bad' : l.startsWith('+') ? 'ok' : '' }, l.replace(/^[!+]/, '')))) : null));
  // The session with the agent: [who, html] with who 'you' | 'agent'. The agent's words are labelled as an example.
  const chat = list => node => node.append(h('div', { class: 'cai-chat' }, list.map(([who, t]) =>
    h('div', { class: 'cai-msg ' + who }, h('b', {}, who === 'you' ? 'You' : 'Agent (an example)'), h('span', { html: t })))));
  // A checklist: [text, state, note] with state '' | 'run' | 'ok' | 'err'; text may hold code.
  const checks = list => node => node.append(h('div', { class: 'cai-gates' }, list.map(([c, s, note]) =>
    h('div', { class: 'cai-pr ' + (s || '') }, h('span', { class: 'cai-dot ' + (s === 'ok' ? 'pass' : s === 'err' ? 'fail' : s || '') }),
      h('span', {}, h('span', { class: 'cai-prt', html: c }), note ? h('small', { html: note }) : null)))));
  // The path of a request: nodes lit up to `upTo`; `bad` marks where it stopped; note: a line under it.
  const path = (nodes, upTo, bad, note) => node => node.append(h('div', { class: 'cai-hops' }, nodes.map((n, i) => [i ? h('i', { class: 'cai-hop-e' + (i <= upTo ? ' on' : '') + (i === bad ? ' bad' : ''), 'aria-hidden': 'true' }) : null,
    h('span', { class: 'cai-hop' + (i <= upTo ? ' on' : '') + (i === bad ? ' bad' : '') }, n)])), note ? h('div', { class: 'cai-hnote', html: note }) : null);
  // Rows of code-like text; rows starting with * are lit.
  const rows = list => node => node.append(...list.map(r => h('div', { class: 'cai-row' + (r.startsWith('*') ? ' lit' : ''), html: hl(r.replace(/^\*/, '')) })));

  const css = `
.cai-top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: start; min-width: 0; }
.cai-side { display: grid; gap: 12px; min-width: 0; align-content: start; }
@media (max-width: 760px) { .cai-top { grid-template-columns: minmax(0, 1fr); } }

.cai-phone { width: 212px; height: 400px; box-sizing: border-box; justify-self: center; border: 8px solid var(--code-bg); border-radius: 30px; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 0 0 1px var(--line), var(--shadow); user-select: none; -webkit-user-select: none; transition: background 0.3s; }
.cai-sb { display: flex; justify-content: space-between; padding: 5px 14px 3px; font: 600 0.62rem var(--mono); color: var(--muted); }
.cai-appbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px 8px 12px; min-height: 38px; box-sizing: border-box; font: 700 1rem var(--display); color: var(--ink); background: var(--surface); border-bottom: 1px solid var(--line); }
.cai-appbar[hidden] { display: none; }
.cai-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cai-back { color: var(--ink); font: 700 1.3rem/1 var(--body); padding: 0 6px 2px 0; }
.cai-screen { flex: 1; position: relative; overflow: hidden; min-height: 0; }
.cai-scroll { display: grid; gap: 6px; padding: 8px; align-content: start; height: 100%; box-sizing: border-box; overflow: hidden; }
.cai-card { display: grid; gap: 2px; width: 100%; box-sizing: border-box; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); transition: background 0.4s, border-color 0.4s; }
.cai-card b { font: 700 0.74rem/1.25 var(--body); }
.cai-card small { font-size: 0.64rem; color: var(--muted); }
.cai-card.cai-fresh { border-color: var(--accent); background: var(--accent-soft); animation: drop-in 0.42s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
.cai-detail { display: grid; gap: 6px; padding: 4px 2px; align-content: start; }
.cai-detail small { font: 600 0.62rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.cai-detail h4 { margin: 0; font: 700 0.95rem/1.25 var(--display); color: var(--ink); }
.cai-detail p { margin: 0; font-size: 0.74rem; line-height: 1.45; color: var(--ink); }
.cai-blank { min-height: 200px; border-radius: 8px; }
.cai-lines { display: grid; gap: 5px; margin-top: 4px; }
.cai-lines i { display: block; height: 6px; border-radius: 3px; background: var(--sunk); }
.cai-lines i:nth-child(2) { width: 85%; }
.cai-lines i:nth-child(3) { width: 60%; }
.cai-center { display: grid; gap: 8px; place-items: center; align-content: center; text-align: center; min-height: 100%; padding: 12px; box-sizing: border-box; font-size: 0.76rem; color: var(--muted); }
.cai-center b { color: var(--ink); font-size: 0.86rem; }
.cai-spin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.cai-note { padding: 6px 9px; border-radius: 8px; background: var(--warm-soft); color: var(--ink); font-size: 0.68rem; font-weight: 700; }
.cai-over { position: absolute; inset: 0; z-index: 4; display: flex; align-items: center; padding: 10px; background: rgba(0, 0, 0, 0.45); }
.cai-over[hidden] { display: none; }
.cai-dialog { width: 100%; display: grid; gap: 8px; justify-items: center; padding: 14px 10px 10px; border-radius: 18px; background: var(--surface); color: var(--ink); font-size: 0.72rem; line-height: 1.3; text-align: center; animation: drop-in 0.35s ease-out both; }
.cai-dbtns { display: grid; gap: 4px; width: 100%; }
.cai-dbtns span { padding: 6px; border-radius: 999px; background: var(--sunk); font-weight: 700; }
.cai-dbtns span:first-child { background: var(--accent); color: var(--accent-ink); }
.cai-toast { position: absolute; z-index: 5; left: 12px; right: 12px; bottom: 12px; padding: 7px 10px; border-radius: 999px; background: var(--code-bg); color: var(--code-ink); font: 600 0.66rem var(--body); text-align: center; }
.cai-found { outline: 3px solid var(--accent); outline-offset: 1px; border-radius: 8px; }
.cai-tapped { animation: cai-tap 0.6s ease-out; }
@keyframes cai-tap { from { box-shadow: 0 0 0 4px var(--hi); } to { box-shadow: 0 0 0 4px transparent; } }

.cai-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; padding: 10px; border-radius: 14px; background: var(--bg); min-width: 0; }
.cai-gate { display: grid; gap: 1px; padding: 6px 9px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; position: relative; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.cai-gate > b { font: 600 0.6rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cai-gate > span { font: 600 0.72rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cai-gate > em { display: none; justify-self: start; font: 600 0.56rem var(--mono); font-style: normal; padding: 1px 6px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.cai-gate.new { border-color: var(--accent); background: var(--accent-soft); }
.cai-gate.new > em { display: block; }
.cai-gate.todo { border-style: dashed; opacity: 0.5; }
.cai-gate.todo > span { color: var(--muted); font-style: italic; font-weight: 500; }
.cai-gate.fail { border-color: var(--err); background: var(--err-soft); opacity: 1; }
.cai-gate.fail > span { color: var(--err); font-style: normal; font-weight: 700; }
.cai-gate.ping { animation: cai-ping 0.6s ease-out; }
@keyframes cai-ping { 30% { box-shadow: 0 0 0 4px var(--hi); } }

.cai-panel { display: grid; gap: 8px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); min-width: 0; align-content: start; }
.cai-pbody { display: grid; gap: 6px; min-width: 0; }
.cai-code { display: grid; gap: 2px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; overflow-x: auto; }
.cai-chead { font: 500 0.74rem/1.4 var(--mono); color: var(--t-c); padding: 2px 8px; white-space: pre-wrap; overflow-wrap: anywhere; }
.cai-crow { font: 500 0.74rem/1.4 var(--mono); color: var(--code-ink); border-radius: 6px; padding: 2px 8px 2px calc(8px + 2ch); text-indent: -2ch; white-space: pre-wrap; overflow-wrap: anywhere; transition: background 0.2s; }
.cai-crow.on, .cai-chead.on { background: rgba(126, 226, 168, 0.14); border-radius: 6px; }
.cai-crow.bad { background: rgba(255, 138, 155, 0.18); }
.cai-term { display: grid; gap: 3px; padding: 8px 10px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.72rem/1.5 var(--mono); min-width: 0; overflow-x: auto; }
.cai-term > div { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--t-c); }
.cai-term > .cmd { color: var(--code-ink); }
.cai-term > .bad { color: var(--t-e); }
.cai-term > .ok { color: var(--t-k); }
.cai-gates { display: grid; gap: 6px; min-width: 0; }
.cai-pr { display: grid; grid-template-columns: 12px minmax(0, 1fr); gap: 8px; align-items: start; padding: 6px 9px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); min-width: 0; }
.cai-dot { margin-top: 4px; width: 9px; height: 9px; border-radius: 50%; background: var(--sunk); }
.cai-dot.pass { background: var(--ok); }
.cai-dot.fail { background: var(--err); }
.cai-dot.run { background: var(--warm); animation: pulse 0.6s infinite; }
.cai-pr > span:last-child { display: grid; gap: 2px; min-width: 0; }
.cai-prt { font-size: 0.74rem; color: var(--ink); overflow-wrap: anywhere; }
.cai-prt code { font-size: 0.7rem; }
.cai-pr small { font-size: 0.7rem; color: var(--muted); }
.cai-pr.ok { border-color: var(--ok); background: var(--ok-soft); }
.cai-pr.err { border-color: var(--err); background: var(--err-soft); }
.cai-row { font: 600 0.76rem/1.45 var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.cai-row.lit { color: var(--accent); }
.cai-cap { font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.cai-hops { display: flex; align-items: center; gap: 4px; min-width: 0; flex-wrap: wrap; }
.cai-hop { font: 600 0.68rem var(--mono); padding: 4px 7px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--muted); transition: border-color 0.25s, color 0.25s; }
.cai-hop.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.cai-hop.bad { border-color: var(--err); color: var(--err); background: var(--err-soft); }
.cai-hop-e { width: 12px; height: 3px; border-radius: 2px; background: var(--line); flex: none; }
.cai-hop-e.on { background: var(--accent); }
.cai-hop-e.bad { background: var(--err); }
.cai-hnote { font-size: 0.74rem; color: var(--ink); line-height: 1.4; }
.cai-hnote code { font-size: 0.7rem; }
.cai-off { color: var(--err); }
.cai-sum { display: grid; gap: 5px; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); }
.cai-ailabel { font: 600 0.58rem/1.3 var(--mono); color: var(--muted); }
.cai-sumtext { margin: 0; font-size: 0.72rem; line-height: 1.4; color: var(--ink); min-height: 1.4em; }
.cai-writing::after { content: "▍"; color: var(--accent); animation: pulse 0.8s infinite; }
.cai-sumerr { font-size: 0.68rem; font-weight: 700; color: var(--ink); background: var(--warm-soft); padding: 4px 7px; border-radius: 7px; }
.cai-btn { justify-self: start; font: 700 0.68rem var(--body); padding: 4px 12px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.cai-body { font-size: 0.72rem !important; }
.cai-dialog > span { font-size: 0.66rem; color: var(--muted); }
.cai-diff { display: grid; gap: 1px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; overflow-x: auto; font: 500 0.72rem/1.4 var(--mono); color: var(--code-ink); }
.cai-dpath { color: var(--t-c); padding: 0 4px 4px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); margin-bottom: 3px; overflow-wrap: anywhere; }
.cai-dl { display: grid; grid-template-columns: 1.4ch minmax(0, 1fr); gap: 4px; padding: 1px 4px; border-radius: 5px; white-space: pre-wrap; overflow-wrap: anywhere; }
.cai-dl.add { background: rgba(126, 226, 168, 0.12); }
.cai-dl.add .cai-dsign { color: var(--t-k); }
.cai-dl.del { background: rgba(255, 138, 155, 0.12); }
.cai-dl.del .cai-dsign { color: var(--t-e); }
.cai-dl.bad { outline: 2px solid var(--t-e); outline-offset: -2px; }
.cai-tests { display: grid; gap: 3px; padding: 8px 10px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.72rem/1.5 var(--mono); min-width: 0; overflow-x: auto; }
.cai-t { display: flex; gap: 8px; align-items: center; min-width: 0; }
.cai-t > span:nth-child(2) { overflow-wrap: anywhere; min-width: 0; }
.cai-t small { margin-left: auto; color: var(--t-k); font-size: 0.66rem; }
.cai-t small.bad { color: var(--t-e); }
.cai-tdot { flex: none; width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
.cai-tdot.pass { background: var(--t-k); }
.cai-tdot.fail { background: var(--t-e); }
.cai-tout { margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.12); display: grid; gap: 2px; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--t-c); }
.cai-tout .bad { color: var(--t-e); }
.cai-tout .ok { color: var(--t-k); }
.cai-chat { display: grid; gap: 6px; min-width: 0; }
.cai-msg { display: grid; gap: 2px; padding: 6px 9px; border-radius: 10px; font-size: 0.74rem; line-height: 1.4; color: var(--ink); min-width: 0; overflow-wrap: anywhere; }
.cai-msg b { font: 600 0.6rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cai-msg.you { background: var(--accent-soft); margin-left: 16px; }
.cai-msg.agent { background: var(--surface); border: 1px solid var(--line); margin-right: 16px; }
.cai-msg code { font-size: 0.7rem; }
`;

  Lab.addTrack({
    id: 'capai',
    title: 'Project: AI in the news app',
    kind: 'project',
    description: 'Let an agent add a reading-time label to the News app and fix what it got wrong, then give News article summaries streamed from your server, with an on-device fallback when there is no connection.',
    builds: 'The same News app, now with a reading-time label an agent wrote and you reviewed and fixed (with a Room migration), a Summarise button that streams a labelled summary from your server, which holds the model key and saves each summary, the article text in Room, an on-device summary when the phone is offline, and an eval set that guards the summaries.',
    group: 'Building with AI',
    requires: ['capship', 'aidev', 'aiapps'],
    css,
    lessons: [
      // 1 agent-feature ─────────────────────────────────────────────
      {
        id: 'agent-feature',
        title: 'A feature with an agent',
        tagline: 'Hand an agent one small task, then review its diff like a teammate’s.',
        goals: ['Give an agent a small, exact task, with AGENTS.md and a test written first', 'Find an old library, a missing migration and an edited test in its diff', 'Fix them, and check the update on a phone that has the old version'],
        level: 'intermediate', introduces: [],
        refs: ['aidev.context', 'aidev.tests-first', 'aidev.review', 'aidev.limits', 'data.migrations'],
        body: `
<p>News is on Google Play, and readers keep asking the same thing: how long is this story? This project brings AI into News in two ways. First, an AI agent helps you build a small feature, and you review what it wrote. Then News gets AI features of its own: article summaries from your server, and a summary made on the phone when there is no connection. The board in each demo shows the pieces so far.</p>
<p>The feature is a label under each headline: “3 min read”. Your server, the program at <code>news.example.com</code> that sends the headlines, now adds <code>word_count</code> to each article. The task for the agent is small and exact: show the label in <code>ArticleRow</code>, count 200 words a minute, never show less than 1 minute. <code>AGENTS.md</code>, the instruction file at the root of the repository, already lists News’s rules: versions only in the catalog, a migration for every changed table, never change a test to make it pass. And before the agent starts, you write <code>ReadingTimeTest</code> and commit it: 150 words is 1 minute, 400 words is 2.</p>
<p>Its plan names five files; the diff changes seven, and the agent reports “Done. BUILD SUCCESSFUL.” Most of the diff is fine. Three parts are not, and each is a typical slip, because the tool writes the code that looks most likely from the code it was built from, not code checked against this project. For the new column it writes <code>import androidx.room.ColumnInfo</code>, the Room 2 name found in most older code, and adds the old Room 2 library, with a version in the build file, so that import works. It raises the database to <code>version = 2</code> with no migration: fine on its emulator, which had a fresh install, but a crash for every reader who updates. And <code>words / 200</code> gives 0 for 150 words, so when your test failed, the agent changed the test to expect 0. <code>AGENTS.md</code> said all three. Written rules make a slip rarer, not impossible: that is why you still review.</p>
<p>So you review the diff with the checklist from the review lesson, starting with <b>Scope</b>: the build file and the test file were never part of the task. You import <code>ColumnInfo</code> from <code>androidx.room3</code> and delete the Room 2 line, add <code>AutoMigration(from = 1, to = 2)</code> with a default in the database, run <code>git restore</code> on the test file to put your test back, and fix the code. The build also wrote <code>schemas/…/2.json</code>: commit it next to <code>1.json</code> from 1.0. Then the <em>upgrade check</em>: run News from the <code>main</code> branch first, then from this branch over it. Android Studio keeps the app’s data, like an update from Play, so the old database is there to migrate.</p>`,
        visual(el) {
          const LIST = ['a7', 'a5', 'a4', 'a1'];
          const TASK = 'Show “N min read” under each headline in <code>ArticleRow</code>. The server now sends <code>word_count</code> with each article. 200 words a minute, never less than 1. <code>ReadingTimeTest</code> is already written. Follow <code>AGENTS.md</code>.';
          const before = { feat: ['new', 'not built yet'], review: ['new', 'not done yet'], db: ['new', 'version 1'] };
          const found = n => ({ feat: ['new', 'agent: “done”'], review: ['new', `${n} of 3 found`], db: n >= 2 ? ['fail', 'no migration'] : ['new', 'version 2'] });
          demo(el, {
            step: 1,
            panelTitle: 'Agent session and diff (an example)',
            predict: {
              q: 'Your <code>ReadingTimeTest</code> expects 1 minute for 150 words. The agent’s code gives 0, and it reports “all tests pass”. How can both be true?',
              options: ['It changed the test to expect 0', 'Gradle skipped the new test', 'The test only runs on a phone'],
              a: 0,
              why: 'A test that fails can be made to pass by changing the test instead of the code. That is why you read the test files in every diff.',
            },
            frames: [
              { screen: { list: LIST }, board: before, panel: chat([['you', TASK]]), say: 'News, as the last project shipped it. The task for the agent is one small feature, written out exactly: what to show, where, from which data, and the rule for the number.' },
              { panel: file(['# AGENTS.md (at the root of the repository)', '- Versions live in gradle/libs.versions.toml, never in build files.', '- Room 3 (androidx.room3). A changed table needs a new version and a migration.', '- Run ./gradlew test before saying a task is done.', '- Never change or delete a test to make it pass. Ask instead.', '// app/src/test/.../ReadingTimeTest.kt, written and committed before the agent starts', 'assertEquals(1, readingMinutes(150))', 'assertEquals(2, readingMinutes(400))'], [2, 4, 6]), say: '<code>AGENTS.md</code> holds the rules that one task doesn’t say. And you wrote the test first and committed it: 150 words must show 1 minute, not 0. Now the agent has a target to meet, and Git shows any change to the test.' },
              { panel: chat([['you', TASK], ['agent', 'Plan, no code yet:<br>1. <code>ArticleDto</code>: add <code>word_count</code><br>2. <code>Article</code>: add <code>wordCount</code>; <code>NewsDatabase</code>: <code>version = 2</code><br>3. <code>readingMinutes()</code> in <code>ReadingTime.kt</code><br>4. the label in <code>ArticleRow</code><br>5. run <code>./gradlew test</code>']]), say: 'The agent writes a plan before it edits (an example). Read it: small steps, in five files. Step 2 changes a table, so the diff must hold a migration.' },
              { screen: { list: LIST, mins: 'bug' }, board: found(0), find: 'min:a1', panel: chat([['agent', 'Done. Every card shows its reading time. <code>./gradlew test</code>: BUILD SUCCESSFUL.']]), say: 'A few minutes later: “Done” (an example report). The labels look right, except one: the library story says <b>0 min read</b>. A report is not a review. The diff is, and it changes seven files, not five.' },
              { board: found(1), panel: node => { diff('app/build.gradle.kts', [' implementation(libs.androidx.room3.runtime)', '+implementation("androidx.room:room-runtime:2.6.1")'], [1])(node); diff('app/src/main/.../data/Article.kt', ['+import androidx.room.ColumnInfo'], [0])(node); }, say: 'The build file first: not in the plan. A new line, with a version in it: Room 2, an old library, beside the Room 3 that News takes from the catalog. The new column’s <code>import androidx.room.ColumnInfo</code> is the Room 2 name found in most older code, so it looked likely. The fix: import <code>ColumnInfo</code> from <code>androidx.room3</code> and delete the line.' },
              { board: found(2), fail: 'db', dialog: { title: 'News keeps stopping', btns: ['Close app'] }, panel: diff('app/src/main/.../data/NewsDatabase.kt', ['-@Database(entities = [Article::class], version = 1)', '+@Database(entities = [Article::class], version = 2)'], [1]), say: '<code>version = 2</code>, and no migration. The agent’s emulator had a fresh install: no old file, nothing to migrate. The upgrade check, <code>main</code> first and then this branch, crashes at once: Room throws an <code>IllegalStateException</code>, as it would for every reader of 1.0.' },
              { board: found(3), dialog: null, panel: node => { diff('app/src/test/.../ReadingTimeTest.kt', [' fun `a short story reads in 1 min`() {', '-    assertEquals(1, readingMinutes(150))', '+    assertEquals(0, readingMinutes(150))', ' }'], [2])(node); diff('app/src/main/.../ui/ReadingTime.kt', ['+fun readingMinutes(words: Int): Int {', '+    return words / 200', '+}'], [1])(node); }, say: 'And here is why the build passed. <code>150 / 200</code> is 0 in whole numbers, so your test failed, and the agent changed the test to expect 0. The test file is in <code>git status</code> because you committed it first. The test was right; the code was wrong.' },
              { screen: { list: LIST, mins: 'ok' }, board: { feat: ['new', '“3 min read”'], review: ['new', '3 fixes in the diff'], db: ['new', 'version 2 · migration'] }, ping: ['feat', 'db'], panel: tests([['ReadingTimeTest: 2 tests', 'pass'], ['NewsViewModelTest: 5 tests', 'pass']], ['+BUILD SUCCESSFUL in 12s']), say: 'Your fixes: <code>ColumnInfo</code> from <code>androidx.room3</code> and the Room 2 line deleted, <code>AutoMigration(from = 1, to = 2)</code> with <code>2.json</code> committed, your test back with <code>git restore</code>, and <code>readingMinutes</code> never below 1 (an example run). The upgrade check keeps every article, and the library story says 1 min.' },
            ],
          });
        },
        code: `# AGENTS.md (at the root of the repository): the lines this task needs
# - Versions live in gradle/libs.versions.toml, never in build files.
# - Room 3 (androidx.room3). A changed table needs a new version and a migration.
# - Run ./gradlew test before saying a task is done.
# - Never change or delete a test to make it pass. Ask instead.

// data/ArticleDto.kt: one new property (the agent got this right)
@SerialName("word_count") val wordCount: Int = 0,
// fun ArticleDto.toArticle() = Article(id, title, source, summary, publishedAt, wordCount)

// data/Article.kt: one new column, with a default in the database for the rows already there
import androidx.room3.ColumnInfo                         // fixed in review: the agent wrote androidx.room
@ColumnInfo(defaultValue = "0") val wordCount: Int = 0,

// data/NewsDatabase.kt
@Database(
    entities = [Article::class],
    version = 2,                                         // was 1
    autoMigrations = [AutoMigration(from = 1, to = 2)],  // added in review
)
abstract class NewsDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}
// schemas/…/2.json: new, written by the build. Commit it next to 1.json from 1.0.

// ui/ReadingTime.kt
fun readingMinutes(words: Int): Int {
    val minutes = words / 200               // whole minutes: 150 / 200 is 0
    return if (minutes < 1) 1 else minutes  // fixed in review: never less than 1
}

// ui/ArticleRow.kt
@Composable
fun ArticleRow(article: Article, savedCopy: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClickLabel = "open article") { onClick() }
            .padding(16.dp),
    ) {
        Text(article.title, fontWeight = FontWeight.Bold)
        if (article.wordCount > 0) {        // rows from 1.0 have 0 until the next refresh
            Text("\${article.source} · \${readingMinutes(article.wordCount)} min read")
        } else {
            Text(article.source)
        }
        if (savedCopy) {
            Text("Saved copy")
        }
    }
}

// app/src/test/java/com/example/news/ui/ReadingTimeTest.kt: written and committed before the agent started
class ReadingTimeTest {
    @Test
    fun \`a short story reads in 1 min\`() {
        assertEquals(1, readingMinutes(150))
    }

    @Test
    fun \`400 words read in 2 min\`() {
        assertEquals(2, readingMinutes(400))
    }
}

// Deleted in review, from app/build.gradle.kts:
//     implementation("androidx.room:room-runtime:2.6.1")
// The agent's change to the test, undone:
//     git restore app/src/test/java/com/example/news/ui/ReadingTimeTest.kt
// The upgrade check: run News from main, then from this branch over it. Every article is still there.`,
        play: `// Reading time, as the agent wrote it and as the review fixed it
fun agentMinutes(words: Int): Int {
    return words / 200
}

fun readingMinutes(words: Int): Int {
    val minutes = words / 200              // whole minutes: the decimals are dropped
    return if (minutes < 1) 1 else minutes // never less than 1 min
}

// A tiny stand-in for ReadingTimeTest: compares what we expect with what we got
fun check(name: String, expected: Int, actual: Int) {
    if (expected == actual) {
        println("passed  $name")
    } else {
        println("FAILED  $name: expected $expected, was $actual")
    }
}

fun main() {
    check("agent: a short story reads in 1 min", 1, agentMinutes(150))
    check("fixed: a short story reads in 1 min", 1, readingMinutes(150))
    check("fixed: 400 words read in 2 min", 2, readingMinutes(400))
    println("Coastal road: \${readingMinutes(760)} min read")
}`,
        remember: 'Give the agent a small, exact task and a committed test, then read the diff yourself: build files, database changes with their schema file, and test files first.',
        mistakes: [
          { title: 'Changing the test to match the code', bad: `@Test
fun \`a short story reads in 1 min\`() {
    assertEquals(0, readingMinutes(150))   // "updated the test to match the new behaviour"
}`, good: `@Test
fun \`a short story reads in 1 min\`() {
    assertEquals(1, readingMinutes(150))   // the test stays; the code is fixed
}`, why: 'The test said what readers should see. Changing it makes the build pass and leaves the bug in the app. If a test seems wrong, a person decides, and AGENTS.md says so.' },
        ],
        terms: [
          { term: 'upgrade check', def: 'Installing the version readers have, then the new one over it, keeping the app’s data, like an update from Play. A missing migration only shows up this way.' },
          { term: 'reading time', def: 'How long a story takes to read, worked out from its number of words. News counts 200 words a minute and never shows less than 1.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The table got a new column. Give Room a new version and a migration it can write itself.', code: `@Database(
    entities = [Article::class],
    version = [[2]],
    autoMigrations = [AutoMigration(from = [[1]], to = 2)],
)`, why: 'A changed table needs a higher <code>version</code>, and Room needs a way from the old file to the new one. For a new column, <code>AutoMigration</code> works it out from the saved schemas.' },
          { type: 'bug', prompt: '<code>ReadingTimeTest</code> fails: a 150-word story gets 0 minutes. Tap the line.', code: `fun readingMinutes(words: Int): Int {
    val minutes = words / 200
    return minutes
}`, bug: 2, fix: '    return if (minutes < 1) 1 else minutes', why: 'Dividing whole numbers drops the decimals, so anything under 200 words is 0. The rule says never less than 1 minute.' },
        ],
        quiz: [
          { q: 'Why didn’t the missing migration crash on the agent’s emulator?', options: ['News was a fresh install there: no old database file to migrate', 'Emulators skip migrations', 'The agent turned Room off'], a: 0, why: 'Room only needs a migration when it finds a file with an older version. The upgrade check puts that file there first.' },
          { q: 'The agent says “Done. BUILD SUCCESSFUL.” What do you look at next?', options: ['The diff, starting with build files, database changes and test files', 'Nothing: the build passed', 'The agent’s summary, once more'], a: 0, why: 'A passing build only means the tests that are there passed. The diff shows whether the tests are still the ones you wrote.' },
          { q: 'Why delete <code>implementation("androidx.room:room-runtime:2.6.1")</code>?', options: ['News already uses Room 3 from the catalog: this is a second, old copy of Room, with its version outside the catalog', 'Version 2.6.1 is too new', 'Libraries can only be added by hand'], a: 0, why: 'The agent added it so that <code>import androidx.room.ColumnInfo</code> would work. Importing from <code>androidx.room3</code> fixes that, and AGENTS.md says versions live in <code>libs.versions.toml</code>.' },
        ],
        docs: [['Migrate your Room database', 'https://developer.android.com/training/data-storage/room/migrating-db-versions'], ['AGENTS.md', 'https://agents.md/']],
      },

      // 2 summary ─────────────────────────────────────────────
      {
        id: 'summary',
        title: 'Summarise an article',
        tagline: 'A Summarise button, a key that stays on your server, and an answer that streams in.',
        goals: ['Ask your own server for a summary, never the model service from the app', 'Stream the answer into the detail screen with a Flow and collectAsStateWithLifecycle', 'Label the summary, and close the stream when the reader leaves'],
        level: 'intermediate', introduces: [],
        refs: ['aiapps.server', 'aiapps.streaming', 'aiapps.stopping', 'aiapps.costs', 'aiapps.failures', 'data.realtime'],
        body: `
<p>Long stories take time: a reader on the bus wants the gist before deciding to read on. So the detail screen gets a <b>Summarise</b> button. A hosted model writes the summary, and every request to it is paid for with a key. As in <em>AI features in apps</em>, the key stays on your server: News calls <code>GET v1/articles/a7/summary</code> and sends only the article’s id. Your server finds the article’s full text, builds the prompt, adds the key and calls the model service. It also saves each finished summary under the article’s id and the prompt’s version, so the next reader gets the saved one and the model isn’t paid twice, while a new prompt gets new summaries.</p>
<p>A summary takes a few seconds to write, so the server streams it as server-sent events: one response that stays open, with a line like <code>data: {"text":" and the lighthouse"}</code> for each piece. <code>NewsApi</code> gets <code>summary(id)</code>, marked <code>@Streaming</code> and returning <code>ResponseBody</code>. <code>SummaryRepository</code> reads it as in the streaming lesson: a <code>flow { }</code> that reads line after line with <code>readUtf8Line()</code> inside <code>body.use { }</code>, emits the text of each <code>data:</code> line, and runs on IO with <code>flowOn(Dispatchers.IO)</code>.</p>
<p><code>ArticleViewModel.summarise()</code> collects it in <code>viewModelScope</code> and adds each piece to <code>SummaryUiState</code>; the screen reads it with <code>collectAsStateWithLifecycle</code>. As in the streaming lesson, it catches <code>IOException</code>, <code>HttpException</code> and <code>SerializationException</code> and shows a message. When the reader goes back, the ViewModel is cleared and its scope cancelled, as in <em>Stopping an answer</em>: the flow stops at its next <code>emit</code>, <code>use</code> closes the connection, and your server cancels its model call. Above the text, a line says what it is: “AI summary. It can contain mistakes.” The article is right below it.</p>`,
        visual(el) {
          const NODES = ['News app', 'Your server', 'Model'];
          const FULL = 'The coastal road between the harbour and the lighthouse is closed because of the storm. It stays shut until the wind drops. Buses stop at the harbour.';
          const D = sum => ({ detail: 'a7', mins: 'ok', sum });
          const read = ['body.use {', '    val source = body.source()', '    while (true) {', '        val line = source.readUtf8Line() ?: break', '        // a data: line? emit its text', '    }', '}   // closes the body, also when collecting is cancelled'];
          const noUse = ['val source = body.source()', 'while (true) {', '    val line = source.readUtf8Line() ?: break', '    // a data: line? emit its text', '}', '// no use { }: nothing closes the body'];
          demo(el, {
            step: 2,
            panelTitle: 'Request and stream',
            predict: {
              q: 'Lin taps Summarise, reads two words and goes back to the list. What happens to the rest of the stream?',
              options: ['The flow stops at its next emit, and use closes the connection', 'It keeps arriving and waits on the phone for later', 'The app crashes, because the screen is gone'],
              a: 0,
              why: 'Going back clears <code>ArticleViewModel</code>, which cancels its scope. A <code>flow { }</code> checks for that at every <code>emit</code>, and <code>use</code> closes the body when its block ends.',
            },
            frames: [
              { screen: D({ btn: true }), board: { sum: ['new', 'not built yet'] }, panel: path(NODES, -1, null, 'The app talks only to your server. The model’s key lives there.'), say: 'The coastal road story, with a new <b>Summarise</b> button. A model service writes the summary, and the key that pays for it stays on your server: the app never sees it.' },
              { tap: 'summarise', screen: D({ writing: true, text: '' }), panel: path(NODES, 2, null, '<code>GET v1/articles/a7/summary</code>: the app sends the id. The server adds the full text, the prompt and the key.'), say: 'A tap calls <code>summarise()</code>. The request carries only <code>a7</code>. Your server looks up the article and asks the model.' },
              { screen: D({ writing: true, text: 'The coastal road between the harbour and the lighthouse' }), panel: term(['data: {"text":"The coastal road"}', '', 'data: {"text":" between the harbour"}', '', 'data: {"text":" and the lighthouse"}']), say: 'The answer comes back in pieces, as server-sent events (an example answer). The flow reads each line, decodes the JSON after <code>data: </code> and emits its text; the ViewModel adds it to <code>SummaryUiState</code>, and the screen redraws.' },
              { screen: D({ text: FULL }), board: { sum: ['new', 'your server · streamed'] }, ping: 'sum', panel: rows(['SummaryUiState(', '*    text = "The coastal road … at the harbour.",', '    isWriting = false,', '    error = null,', ')']), say: 'The server ends the response, <code>readUtf8Line()</code> gives <code>null</code>, and <code>isWriting</code> goes back to <code>false</code>. The label above says it is an AI summary that can contain mistakes. (An example answer.)' },
              { panel: checks([['Ada opens <code>a7</code> at 10:02', 'ok', 'the model writes it: the server pays for the tokens'], ['Sam opens <code>a7</code> at 10:05', 'ok', 'the saved summary: no model call'], ['Lin opens <code>a7</code> at 10:09', 'ok', 'the saved summary: no model call']]), say: 'Your server saves each finished summary under its article id and the prompt’s version. One model call per article and prompt, not one per reader, and Sam and Lin get theirs at once.' },
              { screen: { list: ['a7', 'a5', 'a4', 'a1'], mins: 'ok' }, panel: file(read, [0, 6]), say: 'A long story, and a reader who goes back after two words. <code>ArticleViewModel</code> is cleared, its scope is cancelled, the flow stops at its next <code>emit</code>, and <code>use</code> closes the connection. Your server sees it close and cancels its model call.' },
              { fail: 'sum', board: { sum: ['fail', 'connection left open'] }, panel: file(noUse, [], [0, 5]), say: 'Without <code>use { }</code>, the flow stops but nothing closes the body: the connection stays open, unread, until it times out.' },
              { net: false, screen: D({ btn: true, error: 'No summary right now. Check your connection.' }), board: {}, panel: rows(['api.summary(id) throws IOException', '*catch (e: IOException) {', '*    error = "No summary right now. Check your connection."', '}']), say: 'With no network, <code>api.summary</code> throws <code>IOException</code>, and the <code>catch</code> shows a message, with the button to try again. The next step does better for readers offline.' },
            ],
          });
        },
        code: `// data/NewsApi.kt, one more call
@Streaming                                          // hand over the body as it arrives
@GET("v1/articles/{id}/summary")
suspend fun summary(@Path("id") id: String): ResponseBody   // no key: your server adds it

// data/SummaryRepository.kt
@Serializable
data class SummaryPiece(val text: String)           // data: {"text":" and the lighthouse"}

@Singleton
class SummaryRepository @Inject constructor(private val api: NewsApi) {
    fun fromServer(articleId: String): Flow<String> = flow {
        val body = api.summary(articleId)
        body.use {
            val source = body.source()
            while (true) {
                val line = source.readUtf8Line() ?: break        // null: the server ended the summary
                if (line.startsWith("data: ")) {
                    emit(json.decodeFromString<SummaryPiece>(line.removePrefix("data: ")).text)
                }
            }
        }
    }.flowOn(Dispatchers.IO)                            // reading waits on a thread: not Main
}

// ui/ArticleViewModel.kt
data class SummaryUiState(
    val text: String = "",
    val isWriting: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class ArticleViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    repository: NewsRepository,
    private val summaries: SummaryRepository,
) : ViewModel() {
    private val id = savedStateHandle.toRoute<ArticleDetail>().id
    val article: StateFlow<Article?> = repository.article(id)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _summary = MutableStateFlow(SummaryUiState())
    val summary: StateFlow<SummaryUiState> = _summary.asStateFlow()

    fun summarise() {
        _summary.value = SummaryUiState(isWriting = true)
        viewModelScope.launch {
            try {
                summaries.fromServer(id).collect { piece ->
                    _summary.value = _summary.value.copy(text = _summary.value.text + piece)
                }
                _summary.value = _summary.value.copy(isWriting = false)
            } catch (e: IOException) {
                _summary.value = SummaryUiState(error = "No summary right now. Check your connection.")
            } catch (e: HttpException) {
                _summary.value = SummaryUiState(error = "No summary right now. Try again later.")   // e.g. the server's limit
            } catch (e: SerializationException) {
                _summary.value = SummaryUiState(error = "No summary right now. Try again later.")   // a data: line that isn't a SummaryPiece
            }
        }
    }
}

// ui/SummaryBox.kt: in ArticleDetailScreen, under the title
@Composable
fun SummaryBox(state: SummaryUiState, onSummarise: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        if (state.text != "" || state.isWriting) {
            Text("AI summary. It can contain mistakes.", style = MaterialTheme.typography.labelSmall)
            Text(state.text)
        }
        if (state.error != null) {
            Text(state.error)
        }
        if (state.text == "" && !state.isWriting) {
            Button(onClick = onSummarise) {          // also "try again" after an error
                Text("Summarise")
            }
        }
    }
}

// NewsNavHost, composable<ArticleDetail>:
//     val summary by viewModel.summary.collectAsStateWithLifecycle()
//     ArticleDetailScreen(article, summary, onSummarise = { viewModel.summarise() })

// Your server (a sketch), GET v1/articles/{id}/summary:
//   a saved summary for this id and this prompt version? send it and stop.
//   over today's limit? answer 429.
//   else: the article's full text + the prompt + the key -> the model service; pass each piece on as an event;
//   the app's connection closes before the end? cancel the model call;
//   save the finished summary under the id and the prompt version for the next reader.
//   A new prompt version, or an edited article (delete its saved summaries), gets a new summary.`,
        remember: 'The app asks your server, which holds the key and saves each summary under the article and the prompt version; the pieces stream through a Flow into the state, under an AI label.',
        mistakes: [
          { title: 'Calling the model service from the app', bad: `// in the app
val key = "sk-live-…"                         // anyone who unpacks the APK can read it
modelApi.generate("Bearer $key", prompt)      // straight to the model service`, good: `// in the app
api.summary(articleId)                        // your server adds the key`, why: 'A key in the app is a key anyone can spend, on any prompt. Your server keeps it, and can also save summaries and limit requests.' },
        ],
        terms: [
          { term: 'AI label', def: 'A short line next to text a model wrote, saying so and that it can contain mistakes, like “AI summary. It can contain mistakes.”' },
          { term: 'saved summary', def: 'A finished summary your server keeps under the article’s id and the prompt’s version and sends to the next reader, so the model writes each one only once per prompt.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Retrofit hand over the summary as it arrives, instead of waiting for the end.', code: `@[[Streaming]]
@GET("v1/articles/{id}/summary")
suspend fun summary(@Path("id") id: String): [[ResponseBody]]`, why: '<code>@Streaming</code> on a function that returns <code>ResponseBody</code> gives you the body while the server is still writing it.' },
          { type: 'bug', prompt: 'The summary flickers, and in the end it shows only “ Buses stop at the harbour.” Tap the line.', code: `summaries.fromServer(id).collect { piece ->
    _summary.value = _summary.value.copy(text = piece)
}
_summary.value = _summary.value.copy(isWriting = false)`, bug: 1, fix: '    _summary.value = _summary.value.copy(text = _summary.value.text + piece)', why: 'Each event holds only the next piece. The state must add it to the text so far, or every piece replaces the one before.' },
        ],
        quiz: [
          { q: 'Why does News call <code>news.example.com</code> and not the model service?', options: ['The key must stay on your server: anything in the app can be pulled out', 'The model service only answers servers', 'It is faster'], a: 0, why: 'A key in the app is a key anyone can spend. On your server it stays secret, and the server can save summaries and limit requests.' },
          { q: 'Sam opens <code>a7</code> after Ada already had its summary. What does your server do?', options: ['Sends the saved summary, without asking the model', 'Asks the model again, for Sam', 'Refuses: one summary per article'], a: 0, why: 'One model call per article, not per reader: the saved summary costs no tokens.' },
          { q: 'What closes the connection when a reader leaves in the middle of a summary?', options: ['<code>use { }</code>: the cancelled flow stops at its next emit, and use closes the body', 'Nothing: the server always finishes first', '<code>collectAsStateWithLifecycle</code> deletes the summary'], a: 0, why: 'Leaving clears the ViewModel and cancels its scope. The flow ends, and <code>use</code> closes the body as its block ends.' },
        ],
        docs: [['Find the right AI/ML solution for your app', 'https://developer.android.com/ai/overview']],
      },

      // 3 offline ─────────────────────────────────────────────
      {
        id: 'offline',
        title: 'An on-device fallback',
        tagline: 'No signal? Summarise on the phone itself, when the phone can.',
        goals: ['Keep each article’s full text in Room, with a second migration', 'Download the on-device model while the phone is online, for readers who use summaries', 'Fall back from your server to the phone, and say which one wrote the summary'],
        level: 'intermediate', introduces: ['DownloadCallback'],
        refs: ['aiapps.on-device', 'aiapps.failures', 'data.migrations', 'security.privacy'],
        body: `
<p>Ada reads News on the metro, in a tunnel with no signal. The stories are there, from Room, but <b>Summarise</b> says “Check your connection.” Some phones have a model of their own, and the ML Kit summarizer from the on-device lesson runs it with no network, without the text leaving the phone. It is only on some phones and it is still in beta, so here it is a <em>fallback</em>: News tries your server first, the phone second, and the message last.</p>
<p>The phone can only summarise text it has, and Room keeps only each story’s one-line teaser. So your server adds <code>body</code>, the full text, to the headlines, and <code>Article</code> gets a column for it that may be empty (<code>String?</code>), so old rows need no default value. That is a second change to the table, so Room needs a second migration: the demo shows it. As a bonus, the detail screen now shows the whole article offline.</p>
<p><code>OnDeviceSummarizer</code> wraps the summarizer: <code>isReady()</code> is true when <code>checkFeatureStatus()</code> says <code>AVAILABLE</code>. When it says <code>DOWNLOADABLE</code>, the first <code>runInference</code> would start the download, but in the tunnel there is no network for it. So <code>prepare()</code> starts it ahead of time: <code>downloadFeature</code> starts the download, and its <code>DownloadCallback</code> reports the progress. News calls it right after a summary from the server worked: the phone is online, and this reader uses summaries.</p>
<p>In <code>summarise()</code>, an <code>IOException</code>, <code>HttpException</code> or <code>SerializationException</code> from the server leads to <code>tryOnPhone()</code>: if the model is ready and the text is over 400 characters, the phone writes one bullet; a <code>GenAiException</code> (busy, over the quota, or a failed status check) leads to the message. The label says where the summary was made: “AI summary, made on this phone.” And <code>onCleared</code> closes the summarizer.</p>`,
        visual(el) {
          const D = (sum, body = true) => ({ detail: 'a7', mins: 'ok', sum, body });
          const ERR = 'No summary right now. Check your connection.';
          const status = on => checks([['<code>AVAILABLE</code>', on === 0 ? 'ok' : '', 'on the phone: ready to use'], ['<code>DOWNLOADABLE</code>', on === 1 ? 'run' : '', 'this phone can get it'], ['<code>DOWNLOADING</code>', on === 2 ? 'run' : '', 'on its way'], ['<code>UNAVAILABLE</code>', on === 3 ? 'err' : '', 'not on this phone']]);
          demo(el, {
            step: 3,
            panelTitle: 'Fallback',
            predict: {
              q: 'Ada’s phone says <code>DOWNLOADABLE</code>, and the first time she ever taps Summarise she is on the metro, offline. What does she get?',
              options: ['The message: the model can’t download without a network', 'A summary made on the phone', 'A crash'],
              a: 0,
              why: 'The model isn’t on the phone yet, and there is no network to get it. That is why News downloads it right after a server summary works, while the phone is online.',
            },
            frames: [
              { net: false, screen: D({ btn: true, error: ERR }, false), board: { dev: ['new', 'not built yet'], db: ['have', 'version 2 · migration'] }, panel: path(['News app', 'Your server', 'Model'], 0, 1, 'No network: the request never leaves the phone.'), say: 'Ada, on the metro, in a tunnel with no signal. The story is in Room, but the summary needs your server. The phone itself could write one, if it had the text and a model.' },
              { screen: D({ btn: true, error: ERR }), board: { dev: ['new', 'not built yet'] }, ping: 'db', panel: node => { diff('data/Article.kt', [' @ColumnInfo(defaultValue = "0") val wordCount: Int = 0,', '+val body: String? = null,'])(node); diff('data/NewsDatabase.kt', ['-    version = 2,', '+    version = 3,', '-    autoMigrations = [AutoMigration(from = 1, to = 2)],', '+    autoMigrations = [AutoMigration(from = 1, to = 2), AutoMigration(from = 2, to = 3)],'])(node); diff('app/schemas/…/', ['+3.json'])(node); }, say: 'First, the text. The server adds <code>body</code> to the headlines, and Room gets a column for it: version 3, with its migration on the first try this time, and <code>3.json</code> committed next to <code>1.json</code> and <code>2.json</code>. The detail screen shows the story offline too (here, its first lines).' },
              { panel: status(-1), say: 'Next, the model. <code>checkFeatureStatus()</code> answers with one of four states. Many phones answer <code>UNAVAILABLE</code>, so News must work without it.' },
              { net: true, screen: D({ text: 'The coastal road between the harbour and the lighthouse is closed because of the storm. It stays shut until the wind drops. Buses stop at the harbour.' }), panel: checks([['a summary from your server', 'ok'], ['<code>checkFeatureStatus()</code>: <code>DOWNLOADABLE</code>', 'ok'], ['<code>downloadFeature(...)</code>', 'run', 'now, while the phone is online']]), say: 'The day before, online, Ada’s summary came from your server (an example answer). Right after it, <code>prepare()</code> found <code>DOWNLOADABLE</code> and started the download, for a reader who uses summaries.' },
              { net: false, tap: 'summarise', screen: D({ writing: true, by: 'phone', text: '' }), board: {}, ping: 'dev', panel: path(['News app', 'Model on this phone'], 1, null, 'The text goes nowhere: the model runs on the phone.'), say: 'Today, offline. The server call fails with <code>IOException</code>, so <code>tryOnPhone()</code> runs: the model is <code>AVAILABLE</code> and the story is over 400 characters, so <code>runInference</code> runs on the phone.' },
              { screen: D({ by: 'phone', text: '• The coastal road to the lighthouse is closed until the wind drops.' }), panel: rows(['1  your server', '*2  the phone: AVAILABLE, text over 400 characters', '3  the message, with the article below']), say: 'One bullet, labelled “made on this phone” (an example answer). The fallback order: your server, then the phone, then the message.' },
              { screen: D({ btn: true, error: ERR }), board: {}, panel: status(3), say: 'Sam’s phone answers <code>UNAVAILABLE</code>. He gets the message, and the full story from Room. Nothing breaks.' },
              { panel: rows(['Lin’s phone: News 1.0, file version 1', '*AutoMigration 1 → 2', '*AutoMigration 2 → 3', 'file version 3: every article kept']), say: 'Lin never installed the update from step 1, and now jumps from 1.0 to this version. Room runs both migrations, one after the other. That is why the list keeps 1 → 2.' },
            ],
          });
        },
        code: `// gradle/libs.versions.toml, as AGENTS.md says (coroutines = "1.11.0" is already there):
// [versions]   mlkitSummarization = "1.0.0-beta1"     // beta: read the release notes before updating
// [libraries]  mlkit-genai-summarization = { group = "com.google.mlkit", name = "genai-summarization", version.ref = "mlkitSummarization" }
//              kotlinx-coroutines-guava = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-guava", version.ref = "coroutines" }
// app/build.gradle.kts:
//     implementation(libs.mlkit.genai.summarization)
//     implementation(libs.kotlinx.coroutines.guava)     // .await() on futures

// data/Article.kt, data/ArticleDto.kt: the full text, from the server
val body: String? = null,    // in Article; nullable, so old rows simply have no text
val body: String = "",                                      // in ArticleDto, and toArticle() passes it on
// NewsDatabase: version = 3,
//     autoMigrations = [AutoMigration(from = 1, to = 2), AutoMigration(from = 2, to = 3)]
// schemas/…/3.json: new, written by the build. Commit it next to 1.json and 2.json.

// data/OnDeviceSummarizer.kt
class OnDeviceSummarizer @Inject constructor(@ApplicationContext context: Context) {
    private val summarizer = Summarization.getClient(
        SummarizerOptions.builder(context)
            .setInputType(InputType.ARTICLE)
            .setOutputType(OutputType.ONE_BULLET)
            .setLanguage(Language.ENGLISH)                  // English, Japanese or Korean as this is written: News is in English
            .build()
    )

    suspend fun isReady(): Boolean {
        try {
            return summarizer.checkFeatureStatus().await() == FeatureStatus.AVAILABLE
        } catch (e: GenAiException) {
            return false                                    // no model today: the fallback is optional
        }
    }

    suspend fun prepare() {                                 // call while the phone is online
        try {
            if (summarizer.checkFeatureStatus().await() == FeatureStatus.DOWNLOADABLE) {
                summarizer.downloadFeature(object : DownloadCallback {
                    override fun onDownloadStarted(bytesToDownload: Long) {}
                    override fun onDownloadProgress(totalBytesDownloaded: Long) {}
                    override fun onDownloadCompleted() {}
                    override fun onDownloadFailed(e: GenAiException) {}   // still DOWNLOADABLE: tried again next time
                })
            }
        } catch (e: GenAiException) {
            // no model today: the fallback is optional
        }
    }

    suspend fun summarise(text: String): String {
        val request = SummarizationRequest.builder(text).build()
        return summarizer.runInference(request).await().summary
    }

    fun close() {
        summarizer.close()
    }
}

// ui/ArticleViewModel.kt: a new constructor parameter, private val onDevice: OnDeviceSummarizer
// SummaryUiState gets: val onPhone: Boolean = false
const val NO_SUMMARY = "No summary right now. Check your connection."   // at the top of the file

fun summarise() {
    _summary.value = SummaryUiState(isWriting = true)
    viewModelScope.launch {
        try {
            summaries.fromServer(id).collect { piece ->
                _summary.value = _summary.value.copy(text = _summary.value.text + piece)
            }
            _summary.value = _summary.value.copy(isWriting = false)
            onDevice.prepare()                              // online now: ready for next time
        } catch (e: IOException) {
            tryOnPhone()                                    // no connection
        } catch (e: HttpException) {
            tryOnPhone()                                    // the server answered with an error
        } catch (e: SerializationException) {
            tryOnPhone()                                    // a piece that didn't decode
        }
    }
}

private suspend fun tryOnPhone() {
    val text = article.value?.body ?: ""
    if (text.length > 400 && onDevice.isReady()) {         // the API needs more than 400 characters
        _summary.value = SummaryUiState(isWriting = true, onPhone = true)
        try {
            _summary.value = SummaryUiState(text = onDevice.summarise(text), onPhone = true)
        } catch (e: GenAiException) {
            _summary.value = SummaryUiState(error = NO_SUMMARY)   // busy, or over the quota
        }
    } else {
        _summary.value = SummaryUiState(error = NO_SUMMARY)
    }
}

override fun onCleared() {
    onDevice.close()                                        // free the model when the screen is gone
}

// SummaryBox: the label says who wrote it
// if (state.onPhone) "AI summary, made on this phone. It can contain mistakes."
// else "AI summary. It can contain mistakes."`,
        remember: 'Your server first, then the phone’s model if it is AVAILABLE and has enough text, then a message; download the model while the reader is online, and label who wrote the summary.',
        mistakes: [
          { title: 'Downloading the model at every first start', bad: `// NewsApp.onCreate
appScope.launch {
    onDevice.prepare()      // every install downloads it, on any network
}`, good: `// ArticleViewModel.summarise(), after a summary from the server worked
onDevice.prepare()          // only readers who use summaries, while online`, why: 'A model is a large download. Starting it for every reader at the first start spends data and storage for people who may never tap Summarise.' },
        ],
        terms: [
          { term: 'fallback', def: 'A second way to do a job when the first one fails, like a summary made on the phone when your server can’t be reached.' },
          { term: 'download ahead', def: 'Getting a model onto the phone with <code>downloadFeature</code> while there is a network, so it is there later when there isn’t.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use the phone’s model only when it is on the phone, and start the download when it can be fetched.', code: `suspend fun isReady(): Boolean {
    try {
        return summarizer.checkFeatureStatus().await() == FeatureStatus.[[AVAILABLE]]
    } catch (e: GenAiException) {
        return false
    }
}

// in prepare(), inside its try:
if (summarizer.checkFeatureStatus().await() == FeatureStatus.[[DOWNLOADABLE]]) {
    summarizer.[[downloadFeature]](callback)
}`, why: 'Only <code>AVAILABLE</code> means the model is ready. <code>DOWNLOADABLE</code> means this phone can get it, and <code>downloadFeature</code> starts that.' },
          { type: 'bug', prompt: 'Readers who jump straight from News 1.0 to this version crash at the first start. Tap the line.', code: `@Database(
    entities = [Article::class],
    version = 3,
    autoMigrations = [AutoMigration(from = 2, to = 3)],
)`, bug: 3, fix: '    autoMigrations = [AutoMigration(from = 1, to = 2), AutoMigration(from = 2, to = 3)],', why: 'A 1.0 phone has a version 1 file. Room needs a way from 1 to 2 and then from 2 to 3, so every migration stays in the list.' },
        ],
        quiz: [
          { q: 'Ada is offline and gets a summary made on her phone. Where did the article’s text go?', options: ['Nowhere: the model runs on the phone', 'To your server, when the phone is online again', 'To the model service'], a: 0, why: 'On-device processing keeps the data on the phone. That is also why it works with no network.' },
          { q: 'Why does News call <code>prepare()</code> right after a summary from the server?', options: ['The phone is online then, and this reader uses summaries', 'The server needs the phone’s model', '<code>prepare()</code> makes the server faster'], a: 0, why: 'A download needs a network. Right after a server summary worked, there is one, for a reader who will use the model.' },
          { q: 'Sam’s phone answers <code>UNAVAILABLE</code>. What should News do?', options: ['Show the message and the full article, as without the fallback', 'Ask Sam to buy another phone', 'Crash, so the bug is reported'], a: 0, why: 'Many phones have no on-device model. A fallback is extra help; without it, the app works as before.' },
        ],
        docs: [['Overview of the ML Kit GenAI APIs', 'https://developers.google.com/ml-kit/genai'], ['GenAI Summarization API', 'https://developers.google.com/ml-kit/genai/summarization/android']],
      },

      // 4 recap ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'Review',
        tagline: 'What the project added, and what to keep checking after it ships.',
        goals: ['List what each step added and the check that guards it', 'Run an eval set before and after a prompt change, and compare', 'Plan the next AI change the same way: a small task, the diff, tests, evals'],
        level: 'intermediate', introduces: [],
        refs: ['aiapps.evals', 'aiapps.costs', 'aidev.workflow', 'aidev.review'],
        body: `
<p>News now shows how long each story takes, with code an agent wrote and you reviewed: an old library removed, a migration added, a test put back. It summarises stories with a model your server calls, holding the key and saving each summary, and the answer streams in under a label. Offline, phones that have a model of their own summarise the text Room keeps.</p>
<p>AI features can change without a single line of News changing. The provider updates its model, someone edits the server’s prompt, the phone updates its own model, a beta API changes. <code>./gradlew test</code> can’t see any of that. So News has an <em>eval set</em>: six real stories from its own archive, each with what a good summary must contain and how long it may be. Run it before and after any change to the prompt or the model, and compare the counts; then raise the prompt’s version, so readers get new summaries (the saved ones belong to the old prompt). The OWASP list of risks for AI apps names two problems this project handles: <em>misinformation</em> (the label, the evals, the article right below) and <em>unbounded consumption</em> (saved summaries, and limits on your server).</p>
<p>For code an agent writes, keep the checklist from the review lesson on every diff: Scope, Tests, Structure, Performance, Accessibility, Security and privacy. For News it gets two more lines: a changed table has a migration and its schema file, and the upgrade check. Before a release: the tests, a phone offline with an on-device model and one without, the eval set, and the six stories through <code>OnDeviceSummarizer</code> on a test phone that has the model, to compare its summaries too. The habit is the same for the next feature: a small task, the plan, the diff, the tests, the evals.</p>`,
        visual(el) {
          const SIX = ['a7 coastal road', 'a4 bike lanes', 'a2 rail line', 'a5 storm', 'a3 reef', 'a8 night market'];
          const run = (fails = {}) => checks(SIX.map(n => [n, fails[n] ? 'err' : 'ok', fails[n] || '']));
          demo(el, {
            step: 4,
            panelTitle: 'Checks',
            predict: {
              q: 'The server team changes the prompt to “Summarise in one short sentence.” Nothing in the app changed, and <code>./gradlew test</code> passes. What tells you whether the summaries got worse?',
              options: ['The eval set: run it before and after, and compare', '<code>./gradlew test</code> already did', 'Nothing can tell, until readers complain'],
              a: 0,
              why: 'The app’s tests don’t see the model’s answers. The eval set checks real stories for the facts a summary must keep.',
            },
            frames: [
              { screen: { list: ['a7', 'a5', 'a4', 'a1'], mins: 'ok' }, board: { review: ['have', '3 fixes in the diff'], evals: ['new', 'not built yet'] }, panel: checks([['reading time: an agent’s diff, reviewed', 'ok'], ['summaries: your server, streamed, labelled', 'ok'], ['offline: the phone’s own model', 'ok']]), say: 'Everything this project added, on the board. Now the changes that come after release.' },
              { panel: diff('server: prompts/summary.txt', ['-Summarise this news article in two or three sentences. Keep every place, time and number.', '+Summarise this news article in one short sentence.']), say: 'A change on the server: shorter summaries. No line of News changes, and the app’s tests pass. Do the summaries still help?' },
              { panel: run(), say: 'Before the change, the eval set: six stories from News’s archive, each with the facts its summary must keep and a word limit. With the old prompt, all six pass.' },
              { screen: { detail: 'a7', mins: 'ok', sum: { text: 'The storm reaches the coastal road.' } }, fail: 'evals', board: { review: ['have', '3 fixes in the diff'], evals: ['fail', '4 of 6'] }, panel: run({ 'a7 coastal road': 'missing: closed, wind', 'a2 rail line': 'missing: slow sections' }), say: 'With the new prompt, two fail. The coastal road summary is short, and it lost what a reader needs: is the road closed, and until when? (An example answer.)' },
              { screen: { detail: 'a7', mins: 'ok', sum: { text: 'The coastal road to the lighthouse is closed by the storm. It stays shut until the wind drops.' } }, board: { review: ['have', '3 fixes in the diff'], evals: ['new', '6 examples'] }, ping: 'evals', panel: run(), say: 'The prompt becomes “two short sentences, keep every place, time and number”. Six of six. Numbers, not impressions, decided it.' },
              { board: {}, ping: 'review', panel: checks([['Scope, Tests, Structure', 'ok', 'from the review lesson'], ['Performance, Accessibility, Security and privacy', 'ok', 'from the review lesson'], ['News: a changed table has a migration and its schema file', 'ok'], ['News: the upgrade check, <code>main</code> first, then the branch', 'ok']]), say: 'The next agent task gets the same review, on every diff: the checklist from the review lesson, and two more lines for News. Whoever wrote the code.' },
              { panel: checks([['<code>./gradlew test</code> and <code>connectedAndroidTest</code>', 'ok'], ['offline: a phone with an on-device model, and one without', 'ok'], ['the eval set, on the server’s current prompt', 'ok'], ['the six stories through <code>OnDeviceSummarizer</code>, on a test phone with the model', 'ok'], ['the server: saved summaries reused, limits in place', 'ok']]), say: 'Before each release, the slower checks: the tests, two phones offline, the eval set on the server and on a phone’s own model, and a look at the server’s numbers.' },
              { panel: rows(['1  a small task, with AGENTS.md and a committed test', '2  read the plan, then the diff', '3  tests and the upgrade check', '*4  evals before a prompt or model change']), say: 'That is the whole method of this project, and it works for the next feature too.' },
            ],
          });
        },
        code: `# What this project added to News
# ui/ReadingTime.kt, ArticleRow       the reading-time label (an agent's diff, reviewed and fixed)
# data/SummaryRepository.kt           summaries from your server, as server-sent events
# data/OnDeviceSummarizer.kt          the phone's own model, as a fallback offline
# ui/SummaryBox.kt                    the AI label, and the Summarise button
# Room: version 3                     AutoMigration 1 -> 2 and 2 -> 3, both kept; schemas 1.json, 2.json, 3.json committed
# app/src/test/                       ReadingTimeTest, with the NewsViewModelTest from before
# server: evals/summaries             six stories, the facts to keep, a word limit

# On every agent diff: the review checklist
# Scope, Tests, Structure, Performance, Accessibility, Security and privacy
# and for News:
# a changed table: a new version, a migration and its schema file
# the upgrade check: run main, then the branch over it

# Before every prompt or model change, on the server
# run the eval set with the old and the new one, and compare the counts
# then raise the prompt version, so readers get new summaries (the saved ones belong to the old prompt)

# Before every release
./gradlew test
./gradlew connectedAndroidTest
# a phone offline with an on-device model, and one without
# the six stories through OnDeviceSummarizer on a test phone that has the model, and compare`,
        play: `// A small eval set for News summaries. The summaries are example answers, written by hand.
data class Example(val id: String, val mustHave: List<String>, val maxWords: Int)

fun problems(example: Example, summary: String): List<String> {
    val found = mutableListOf<String>()
    for (fact in example.mustHave) {
        if (!summary.lowercase().contains(fact)) {
            found.add("missing: $fact")
        }
    }
    val words = summary.split(" ").size
    if (words > example.maxWords) {
        found.add("$words words, limit \${example.maxWords}")
    }
    return found
}

fun main() {
    val road = Example("a7", listOf("coastal road", "closed", "wind"), 40)
    val lanes = Example("a4", listOf("bike lanes", "spring"), 40)

    // Example answers from the old prompt and from the new, "one short sentence" prompt
    val before = mapOf(
        "a7" to "The coastal road between the harbour and the lighthouse is closed because of the storm. It stays shut until the wind drops.",
        "a4" to "The city council approved new bike lanes. Work on the first three kilometres starts in spring.",
    )
    val after = mapOf(
        "a7" to "The storm reaches the coastal road.",
        "a4" to "New bike lanes are coming in spring.",
    )

    for (example in listOf(road, lanes)) {
        val was = problems(example, before.getOrDefault(example.id, ""))
        val now = problems(example, after.getOrDefault(example.id, ""))
        println("\${example.id}  before: \${if (was.size == 0) "pass" else was}  after: \${if (now.size == 0) "pass" else now}")
    }
}`,
        remember: 'Review every agent diff with the review checklist plus News’s migration and upgrade lines, and run the eval set before and after any prompt or model change.',
        mistakes: [
          { title: 'Judging a prompt change by a few summaries', bad: `// Tried the new prompt on two stories. Looks fine, ship it.`, good: `// Eval set: 6 of 6 with the old prompt, 4 of 6 with the new one.
// Kept the old one, and tried "two short sentences": 6 of 6.`, why: 'A few answers that look good can hide the ones that lost a fact. The same six stories, every time, turn the question into numbers you can compare.' },
        ],
        terms: [
          { term: 'eval run', def: 'Running the eval set with one prompt or model and counting how many examples pass, so a change can be compared before and after.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The rules in News’s instruction file that this project needed.', code: `# AGENTS.md
- Versions live in gradle/libs.versions.toml, never in build files.
- A changed table needs a new version and a [[migration]].
- Run ./gradlew [[test]] before saying a task is done.`, why: 'AGENTS.md had these rules and the agent still slipped. Keep them written (every task reads them), and keep the review for when they aren’t followed.' },
          { type: 'bug', prompt: 'The eval reports “missing” for every fact a summary has, and passes summaries that lost them. Tap the line.', code: `fun problems(example: Example, summary: String): List<String> {
    val found = mutableListOf<String>()
    for (fact in example.mustHave) {
        if (summary.lowercase().contains(fact)) {
            found.add("missing: $fact")
        }
    }
    return found
}`, bug: 3, fix: '        if (!summary.lowercase().contains(fact)) {', why: 'A fact is missing when the summary does <em>not</em> contain it. Without <code>!</code>, the check is the wrong way round.' },
        ],
        quiz: [
          { q: 'Which check would have caught the missing migration from step 1?', options: ['The upgrade check: <code>main</code> first, then the branch over it', 'The eval set', '<code>./gradlew test</code> on a fresh build'], a: 0, why: 'A migration only runs when an older database file is there. A fresh install has none.' },
          { q: 'Why does the eval set use the same six stories every time?', options: ['So the counts before and after a change can be compared', 'Because the model can only read six', 'So the summaries come out the same every time'], a: 0, why: 'A fixed set turns “seems fine” into a number you can compare, change after change.' },
        ],
        docs: [['OWASP Top 10 for LLM Applications', 'https://genai.owasp.org/llm-top-10/'], ['Find the right AI/ML solution for your app', 'https://developer.android.com/ai/overview']],
      },
    ],
  });
})();
