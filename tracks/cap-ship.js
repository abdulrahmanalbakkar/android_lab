/* Capstone project: ship the News app from the capapp and capquality projects (same names, files and versions).
   A project is a track with kind: 'project'. Each lesson is one step and carries refs: ['track.lesson'].
   Steps: 1 channels, 2 tokens (FCM registration), 3 messages, 4 deeplink, 5 sync, 6 harden, 7 release-build, 8 ship.
   Every step's demo is demo(el, { step, predict, panelTitle, frames }): a Lab.ui.player stage with the News app's phone
   mock, the ship board (one row per piece this project adds; the piece of this step marked "this step") and a side panel.
   Frame keys: say; kept until changed: screen, panel, board, dialog, toast; this frame only: heads (a heads-up alert),
   ping and fail (board keys), tap and find (a data-k target). Classes start with cs-. */
(() => {
  const { h, hl, replay } = Lab;

  // ---------- the news in the app: the capapp stories, plus the stories this project pushes ----------
  const STORIES = [
    { id: 'a1', source: 'Local', title: 'Library extends weekend opening hours', summary: 'Branches stay open until 6 pm on Saturdays and Sundays from next month.' },
    { id: 'a2', source: 'Transport', title: 'Rail line reopens after two weeks of repairs', summary: 'Trains run the full timetable again, with slow sections near the bridge.' },
    { id: 'a3', source: 'Science', title: 'Researchers map a deep-sea reef', summary: 'A survey team charted the reef with an underwater drone over six dives.' },
    { id: 'a4', source: 'City Desk', title: 'City council approves new bike lanes', summary: 'Work on the first three kilometres starts in spring.' },
    { id: 'a5', source: 'Weather', title: 'Storm expected along the coast on Friday', summary: 'Forecasters expect strong wind and heavy rain from the afternoon.' },
    { id: 'a6', source: 'Sport', title: 'Home team wins the regional final', summary: 'A late goal settled the match in front of a full stadium.' },
    { id: 'a7', source: 'Weather', title: 'Coastal road closed as the storm arrives', summary: 'The road between the harbour and the lighthouse stays shut until the wind drops.' },
    { id: 'a8', source: 'Local', title: 'Night market returns to the old harbour', summary: 'Food stalls and music every Thursday evening, starting next week.' },
  ];
  const story = id => STORIES.find(s => s.id === id);

  // ---------- phone mock: data-k on parts lets frames point at them ----------
  function phone() {
    const back = h('span', { class: 'cs-back', 'aria-hidden': 'true', hidden: true }, '‹');
    const title = h('span', { class: 'cs-title', 'data-k': 'title' }, 'News');
    const bar = h('div', { class: 'cs-appbar' }, back, title);
    const scroll = h('div', { class: 'cs-scroll' });
    const over = h('div', { class: 'cs-over', hidden: true });
    const heads = h('div', { class: 'cs-heads', hidden: true });
    const toast = h('div', { class: 'cs-toast', hidden: true });
    const screen = h('div', { class: 'cs-screen' }, scroll, heads, over, toast);
    const el = h('div', { class: 'cs-phone' },
      h('div', { class: 'cs-sb' }, h('span', {}, '9:41'), h('span', {}, '5G')), bar, screen);
    return {
      el, scroll, title, back, bar,
      toast(t) { toast.hidden = !t; if (t && toast.textContent !== t) { toast.textContent = t; replay(toast, 'drop-in'); } if (!t) toast.textContent = ''; },
      heads(n) { heads.hidden = !n; heads.replaceChildren(); if (n) { heads.append(alertCard(n, true)); replay(heads, 'cs-down'); } },
      dialog(d) {
        over.hidden = !d; over.replaceChildren();
        if (d) over.append(h('div', { class: 'cs-dialog', 'data-k': 'dialog' }, h('span', { class: 'cs-dbell', 'aria-hidden': 'true' }, '🔔'), h('b', {}, d.title),
          h('div', { class: 'cs-dbtns' }, d.btns.map((b, i) => h('span', { 'data-k': 'btn' + i }, b)))));
      },
    };
  }
  // A notification: { id (a story) or title, text, ch (channel name), app }
  function alertCard(n, banner) {
    const s = n.id ? story(n.id) : null;
    return h('div', { class: 'cs-notif' + (banner ? ' cs-banner' : '') + (n.fresh ? ' drop-in' : ''), 'data-k': 'alert:' + (n.id || n.title) },
      h('div', { class: 'cs-n-top' }, h('span', { class: 'cs-n-icon', 'aria-hidden': 'true' }), h('span', {}, 'News · now'), n.ch ? h('span', { class: 'cs-n-ch' }, n.ch) : null),
      h('b', {}, n.title || (s && s.title)), n.text ? h('span', {}, n.text) : null);
  }
  const card = (a, fresh) => h('div', { class: 'cs-card' + (fresh ? ' cs-fresh' : ''), 'data-k': 'row:' + a.id }, h('b', {}, a.title), h('small', {}, a.source));
  const detailView = a => h('div', { class: 'cs-detail drop-in', 'data-k': 'detail' }, h('small', {}, a.source), h('h4', {}, a.title), h('p', {}, a.summary),
    h('div', { class: 'cs-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  const center = ({ spin, title, note } = {}) => h('div', { class: 'cs-center' },
    spin ? h('span', { class: 'cs-spin', 'aria-hidden': 'true' }) : null, title ? h('b', { 'data-k': 'msg' }, title) : null, note ? h('span', {}, note) : null);
  // screen: { blank } | { list: ids, fresh: ids, ask: { title, btn }, note } | { detail: id } | { lock: [notification] }
  //         | { settings: [[name, note, on]] } | { spin } | { msg: { title, note } } | { home }
  function paintScreen(ph, s = { blank: true }) {
    const show = (nodes, opts = {}) => {
      ph.scroll.replaceChildren(...[].concat(nodes).filter(Boolean));
      ph.title.textContent = opts.title || 'News';
      ph.back.hidden = !opts.back;
      ph.bar.hidden = !!opts.nobar;
      ph.el.classList.toggle('cs-dark', !!opts.dark);
    };
    if (s.lock) show([h('div', { class: 'cs-clock' }, '9:41'), h('div', { class: 'cs-date' }, 'Friday 23 October'),
      ...(s.lock.length ? s.lock.map(n => alertCard(n)) : [h('p', { class: 'cs-none' }, 'No notifications')])], { nobar: true, dark: true });
    else if (s.home) show(h('div', { class: 'cs-home' }, Array.from({ length: 11 }, () => h('span', { class: 'cs-ic' })), h('span', { class: 'cs-ic news', 'data-k': 'icon' }, 'N')), { nobar: true, dark: true });
    else if (s.detail) {
      const a = story(s.detail);
      show(a && !s.missing ? detailView(a) : h('div', { class: 'cs-blank', 'data-k': 'detail' }), { title: 'Article', back: true });
    } else if (s.settings) show([h('div', { class: 'cs-sethead' }, 'Notifications'), ...s.settings.map(([name, note, on], i) =>
      h('div', { class: 'cs-set', 'data-k': 'set' + i }, h('span', {}, h('b', {}, name), note ? h('small', {}, note) : null), h('i', { class: 'cs-tog' + (on ? ' on' : ''), 'aria-hidden': 'true' })))], { title: 'Settings', back: true });
    else if (s.list) show([s.note ? h('div', { class: 'cs-note', 'data-k': 'note' }, s.note) : null,
      s.ask ? h('div', { class: 'cs-ask', 'data-k': 'ask' }, h('b', {}, s.ask.title), h('span', { class: 'cs-btn', 'data-k': 'turnon' }, s.ask.btn)) : null,
      ...s.list.map(id => card(story(id), (s.fresh || []).includes(id)))]);
    else if (s.spin) show(center({ spin: true }));
    else if (s.msg) show(center(s.msg));
    else show([]);
  }

  // ---------- the ship board: one row per piece this project adds, and the step that adds it ----------
  const PIECES = [
    ['chan', 'Channels', [[1, 'breaking · local']]],
    ['fcm', 'FCM', [[2, 'ID on the server']]],
    ['msg', 'Messages', [[3, 'data → alert']]],
    ['link', 'Deep link', [[4, 'alert → article']]],
    ['sync', 'Sync', [[5, 'WorkManager']]],
    ['harden', 'Hardening', [[6, 'HTTPS only']]],
    ['release', 'Release build', [[7, 'R8 · upload key']]],
    ['play', 'Google Play', [[8, 'testing → production']]],
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
    const el = h('div', { class: 'cs-board', 'aria-label': 'Ship board' }, PIECES.map(([k, name]) => {
      const lab = h('span', {});
      const r = h('div', { class: 'cs-gate' }, h('b', {}, name), lab, h('em', {}, 'this step'));
      rows[k] = Object.assign(r, { lab });
      return r;
    }));
    return Object.assign(el, {
      set(k, state, label) { rows[k].className = `cs-gate ${state}`; rows[k].lab.textContent = label || 'not built yet'; },
      ping(k) { replay(rows[k], 'ping'); },
      fail(k) { rows[k].classList.add('fail'); replay(rows[k], 'shake'); },
    });
  }

  // ---------- the step demo ----------
  const KEEP = ['screen', 'panel', 'board', 'dialog', 'toast'];
  function demo(el, { step, predict, panelTitle = '', frames }) {
    const ph = phone();
    const base = spec(step);
    const B = board();
    const body = h('div', { class: 'cs-pbody' });
    const stage = h('div', { class: 'cs-top' }, ph.el, h('div', { class: 'cs-side' }, B,
      h('div', { class: 'cs-panel' }, h('span', { class: 'cs-cap' }, panelTitle), body)));
    Lab.ui.player(el, { frames, predict, stage, speed: 2600, draw(f, i) {
      const st = {};
      frames.slice(0, i + 1).forEach(x => KEEP.forEach(k => { if (x[k] !== undefined) st[k] = x[k]; }));
      PIECES.forEach(([k]) => { const v = (st.board && st.board[k]) || base[k]; B.set(k, v[0], v[1]); });
      paintScreen(ph, st.screen);
      ph.dialog(st.dialog);
      ph.heads(f.heads);
      ph.toast(st.toast);
      ph.el.querySelectorAll('.cs-found').forEach(x => x.classList.remove('cs-found'));
      const at = k => k && ph.el.querySelector(`[data-k="${k}"]`);
      const tap = at(f.tap);
      if (tap) replay(tap, 'cs-tapped');
      const found = at(f.find);
      if (found) found.classList.add('cs-found');
      [].concat(f.ping || []).forEach(k => B.ping(k));
      [].concat(f.fail || []).forEach(k => B.fail(k));
      body.replaceChildren();
      if (typeof st.panel === 'function') st.panel(body); else if (st.panel) body.innerHTML = st.panel;
    } });
  }

  // ---------- side panels: each returns node => { ... } for a frame's panel ----------
  // Code, a build file or a message: hits are line numbers (0-based) to light up, bad ones to mark red.
  const file = (lines, hits = [], bad = []) => node => node.append(h('div', { class: 'cs-code' }, lines.map((l, i) =>
    h('div', { class: (/^(\/\/|#|<!--)/.test(l) ? 'cs-chead' : 'cs-crow') + (hits.includes(i) ? ' on' : '') + (bad.includes(i) ? ' bad' : '') }, l))));
  // Terminal or Logcat output: a line starting with $ is the command; ! marks a red line, + a green one.
  const term = lines => node => node.append(h('div', { class: 'cs-term' }, lines.map(l =>
    h('div', { class: l.startsWith('$') ? 'cmd' : l.startsWith('!') ? 'bad' : l.startsWith('+') ? 'ok' : '' }, l.replace(/^[!+]/, '')))));
  // The path of a push: nodes lit up to `upTo`; `bad` marks the node where it stopped. note: a line under it.
  const HOPS = ['Your server', 'FCM', 'Phone', 'News app'];
  const hops = (upTo, bad, note) => node => node.append(h('div', { class: 'cs-hops' }, HOPS.map((n, i) => [i ? h('i', { class: 'cs-hop-e' + (i <= upTo ? ' on' : '') + (i === bad ? ' bad' : ''), 'aria-hidden': 'true' }) : null,
    h('span', { class: 'cs-hop' + (i <= upTo ? ' on' : '') + (i === bad ? ' bad' : '') }, n)])), note ? h('div', { class: 'cs-hnote', html: note }) : null);
  // A table, like the server's list of installs: head is the first row; rows starting with '*' are new.
  const table = (head, list) => node => node.append(h('div', { class: 'cs-table', style: `--cols:${head.length}` },
    head.map(c => h('b', {}, c)), list.flatMap(r => { const fresh = String(r[0]).startsWith('*'); return r.map((c, j) => h('span', { class: fresh ? 'new' : '' }, j === 0 ? String(c).replace(/^\*/, '') : c)); })));
  // Percent bars, like a staged rollout: [label, percent, tone] with tone '' | 'ok' | 'bad'.
  const meter = list => node => node.append(h('div', { class: 'cs-bars' }, list.map(([l, p, tone]) => h('div', { class: 'cs-barrow' },
    h('span', { class: 'cs-bl' }, l), h('span', { class: 'cs-bt' }, h('i', { class: tone || '', style: `width:${p}%` })), h('span', { class: 'cs-bv' }, p + '%')))));
  // A checklist: [text, state, note] with state '' | 'run' | 'ok' | 'err'; text may hold code.
  const checks = list => node => node.append(h('div', { class: 'cs-gates' }, list.map(([c, s, note]) =>
    h('div', { class: 'cs-pr ' + (s || '') }, h('span', { class: 'cs-dot ' + (s === 'ok' ? 'pass' : s === 'err' ? 'fail' : s || '') }),
      h('span', {}, h('span', { class: 'cs-prt', html: c }), note ? h('small', { html: note }) : null)))));
  // Rows of code-like text; rows starting with * are lit.
  const rows = list => node => node.append(...list.map(r => h('div', { class: 'cs-row' + (r.startsWith('*') ? ' lit' : ''), html: hl(r.replace(/^\*/, '')) })));

  const css = `
.cs-top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: start; min-width: 0; }
.cs-side { display: grid; gap: 12px; min-width: 0; align-content: start; }
@media (max-width: 760px) { .cs-top { grid-template-columns: minmax(0, 1fr); } }

.cs-phone { width: 212px; height: 400px; box-sizing: border-box; justify-self: center; border: 8px solid var(--code-bg); border-radius: 30px; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 0 0 1px var(--line), var(--shadow); user-select: none; -webkit-user-select: none; transition: background 0.3s; }
.cs-phone.cs-dark { background: var(--code-bg); }
.cs-sb { display: flex; justify-content: space-between; padding: 5px 14px 3px; font: 600 0.62rem var(--mono); color: var(--muted); }
.cs-phone.cs-dark .cs-sb { color: var(--code-ink); }
.cs-appbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px 8px 12px; min-height: 38px; box-sizing: border-box; font: 700 1rem var(--display); color: var(--ink); background: var(--surface); border-bottom: 1px solid var(--line); }
.cs-appbar[hidden] { display: none; }
.cs-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-back { color: var(--ink); font: 700 1.3rem/1 var(--body); padding: 0 6px 2px 0; }
.cs-screen { flex: 1; position: relative; overflow: hidden; min-height: 0; }
.cs-scroll { display: grid; gap: 6px; padding: 8px; align-content: start; height: 100%; box-sizing: border-box; overflow: hidden; }
.cs-card { display: grid; gap: 2px; width: 100%; box-sizing: border-box; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); transition: background 0.4s, border-color 0.4s; }
.cs-card b { font: 700 0.74rem/1.25 var(--body); }
.cs-card small { font-size: 0.64rem; color: var(--muted); }
.cs-card.cs-fresh { border-color: var(--accent); background: var(--accent-soft); animation: drop-in 0.42s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
.cs-detail { display: grid; gap: 6px; padding: 4px 2px; align-content: start; }
.cs-detail small { font: 600 0.62rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.cs-detail h4 { margin: 0; font: 700 0.95rem/1.25 var(--display); color: var(--ink); }
.cs-detail p { margin: 0; font-size: 0.74rem; line-height: 1.45; color: var(--ink); }
.cs-blank { min-height: 200px; border-radius: 8px; }
.cs-lines { display: grid; gap: 5px; margin-top: 4px; }
.cs-lines i { display: block; height: 6px; border-radius: 3px; background: var(--sunk); }
.cs-lines i:nth-child(2) { width: 85%; }
.cs-lines i:nth-child(3) { width: 60%; }
.cs-center { display: grid; gap: 8px; place-items: center; align-content: center; text-align: center; min-height: 100%; padding: 12px; box-sizing: border-box; font-size: 0.76rem; color: var(--muted); }
.cs-center b { color: var(--ink); font-size: 0.86rem; }
.cs-spin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.cs-note { padding: 6px 9px; border-radius: 8px; background: var(--warm-soft); color: var(--ink); font-size: 0.68rem; font-weight: 700; }
.cs-ask { display: grid; gap: 6px; padding: 8px 9px; border-radius: 10px; background: var(--accent-soft); color: var(--ink); font-size: 0.72rem; line-height: 1.3; }
.cs-btn { justify-self: start; font: 700 0.68rem var(--body); padding: 4px 12px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.cs-clock { margin-top: 10px; text-align: center; font: 700 2.2rem/1 var(--display); color: var(--code-ink); }
.cs-date { text-align: center; font-size: 0.66rem; color: var(--code-ink); opacity: 0.75; margin-bottom: 6px; }
.cs-none { margin: 8px 0 0; text-align: center; font-size: 0.66rem; color: var(--code-ink); opacity: 0.6; }
.cs-notif { display: grid; gap: 2px; padding: 7px 9px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); font-size: 0.68rem; line-height: 1.3; min-width: 0; }
.cs-phone.cs-dark .cs-notif { background: rgba(255, 255, 255, 0.1); border-color: transparent; color: var(--code-ink); }
.cs-n-top { display: flex; align-items: center; gap: 4px; font: 600 0.56rem var(--mono); opacity: 0.85; min-width: 0; }
.cs-n-icon { width: 11px; height: 11px; border-radius: 3px; background: var(--hi); flex: none; }
.cs-n-ch { margin-left: auto; padding: 0 5px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); white-space: nowrap; }
.cs-phone.cs-dark .cs-n-ch { background: rgba(255, 255, 255, 0.14); color: var(--t-k); }
.cs-heads { position: absolute; left: 6px; right: 6px; top: 4px; z-index: 3; }
.cs-heads .cs-notif { box-shadow: var(--shadow); }
.cs-down { animation: cs-down 0.35s ease-out; }
@keyframes cs-down { from { transform: translateY(-120%); } to { transform: none; } }
.cs-home { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding: 22px 6px; }
.cs-ic { aspect-ratio: 1; border-radius: 10px; background: rgba(255, 255, 255, 0.12); display: grid; place-items: center; font: 800 0.8rem var(--display); color: var(--code-bg); }
.cs-ic.news { background: var(--hi); }
.cs-sethead { font: 700 0.8rem var(--display); color: var(--ink); padding: 2px 2px 4px; }
.cs-set { display: flex; align-items: center; gap: 8px; padding: 7px 4px; border-bottom: 1px solid var(--line); font-size: 0.7rem; color: var(--ink); }
.cs-set > span { display: grid; gap: 1px; min-width: 0; }
.cs-set small { font-size: 0.6rem; color: var(--muted); }
.cs-tog { margin-left: auto; width: 24px; height: 14px; border-radius: 999px; background: var(--line); position: relative; flex: none; }
.cs-tog::after { content: ""; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--surface); transition: transform 0.2s; }
.cs-tog.on { background: var(--accent); }
.cs-tog.on::after { transform: translateX(10px); }
.cs-over { position: absolute; inset: 0; z-index: 4; display: flex; align-items: center; padding: 10px; background: rgba(0, 0, 0, 0.45); }
.cs-over[hidden] { display: none; }
.cs-dialog { width: 100%; display: grid; gap: 8px; justify-items: center; padding: 14px 10px 10px; border-radius: 18px; background: var(--surface); color: var(--ink); font-size: 0.72rem; line-height: 1.3; text-align: center; animation: drop-in 0.35s ease-out both; }
.cs-dbell { font-size: 1rem; }
.cs-dbtns { display: grid; gap: 4px; width: 100%; }
.cs-dbtns span { padding: 6px; border-radius: 999px; background: var(--sunk); font-weight: 700; }
.cs-dbtns span:first-child { background: var(--accent); color: var(--accent-ink); }
.cs-toast { position: absolute; z-index: 5; left: 12px; right: 12px; bottom: 12px; padding: 7px 10px; border-radius: 999px; background: var(--code-bg); color: var(--code-ink); font: 600 0.66rem var(--body); text-align: center; }
.cs-found { outline: 3px solid var(--accent); outline-offset: 1px; border-radius: 8px; }
.cs-tapped { animation: cs-tap 0.6s ease-out; }
@keyframes cs-tap { from { box-shadow: 0 0 0 4px var(--hi); } to { box-shadow: 0 0 0 4px transparent; } }

.cs-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; padding: 10px; border-radius: 14px; background: var(--bg); min-width: 0; }
.cs-gate { display: grid; gap: 1px; padding: 6px 9px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; position: relative; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.cs-gate > b { font: 600 0.6rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cs-gate > span { font: 600 0.72rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cs-gate > em { display: none; justify-self: start; font: 600 0.56rem var(--mono); font-style: normal; padding: 1px 6px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.cs-gate.new { border-color: var(--accent); background: var(--accent-soft); }
.cs-gate.new > em { display: block; }
.cs-gate.todo { border-style: dashed; opacity: 0.5; }
.cs-gate.todo > span { color: var(--muted); font-style: italic; font-weight: 500; }
.cs-gate.fail { border-color: var(--err); background: var(--err-soft); opacity: 1; }
.cs-gate.fail > span { color: var(--err); font-style: normal; font-weight: 700; }
.cs-gate.ping { animation: cs-ping 0.6s ease-out; }
@keyframes cs-ping { 30% { box-shadow: 0 0 0 4px var(--hi); } }

.cs-panel { display: grid; gap: 8px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); min-width: 0; align-content: start; }
.cs-pbody { display: grid; gap: 6px; min-width: 0; }
.cs-cap { font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.cs-code { display: grid; gap: 2px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; overflow-x: auto; }
.cs-chead { font: 500 0.74rem/1.4 var(--mono); color: var(--t-c); padding: 2px 8px; white-space: pre-wrap; overflow-wrap: anywhere; }
.cs-crow { font: 500 0.74rem/1.4 var(--mono); color: var(--code-ink); border-radius: 6px; padding: 2px 8px 2px calc(8px + 2ch); text-indent: -2ch; white-space: pre-wrap; overflow-wrap: anywhere; transition: background 0.2s; }
.cs-crow.on, .cs-chead.on { background: rgba(126, 226, 168, 0.14); border-radius: 6px; }
.cs-crow.bad { background: rgba(255, 138, 155, 0.18); }
.cs-term { display: grid; gap: 3px; padding: 8px 10px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.72rem/1.5 var(--mono); min-width: 0; overflow-x: auto; }
.cs-term > div { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--t-c); }
.cs-term > .cmd { color: var(--code-ink); }
.cs-term > .bad { color: var(--t-e); }
.cs-term > .ok { color: var(--t-k); }
.cs-hops { display: flex; align-items: center; gap: 4px; min-width: 0; flex-wrap: wrap; }
.cs-hop { font: 600 0.68rem var(--mono); padding: 4px 7px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--muted); transition: border-color 0.25s, color 0.25s; }
.cs-hop.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.cs-hop.bad { border-color: var(--err); color: var(--err); background: var(--err-soft); }
.cs-hop-e { width: 12px; height: 3px; border-radius: 2px; background: var(--line); flex: none; }
.cs-hop-e.on { background: var(--accent); }
.cs-hop-e.bad { background: var(--err); }
.cs-hnote { font-size: 0.74rem; color: var(--ink); line-height: 1.4; }
.cs-hnote code { font-size: 0.7rem; }
.cs-table { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, auto)); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); font: 500 0.7rem var(--mono); color: var(--ink); min-width: 0; }
.cs-table > * { padding: 4px 8px; border-top: 1px solid var(--line); overflow-wrap: anywhere; min-width: 0; }
.cs-table > b { border-top: 0; background: var(--sunk); color: var(--muted); }
.cs-table > .new { background: var(--accent-soft); color: var(--accent); font-weight: 700; }
.cs-bars { display: grid; gap: 8px; min-width: 0; }
.cs-barrow { display: grid; grid-template-columns: minmax(0, 7.5em) minmax(0, 1fr) auto; gap: 8px; align-items: center; font: 600 0.72rem var(--mono); color: var(--ink); }
.cs-bl { overflow-wrap: anywhere; }
.cs-bt { height: 12px; border-radius: 6px; background: var(--sunk); overflow: hidden; }
.cs-bt i { display: block; height: 100%; border-radius: 6px; background: var(--accent); transition: width 0.4s; }
.cs-bt i.ok { background: var(--ok); }
.cs-bt i.bad { background: var(--err); }
.cs-bv { color: var(--muted); }
.cs-gates { display: grid; gap: 6px; min-width: 0; }
.cs-pr { display: grid; grid-template-columns: 12px minmax(0, 1fr); gap: 8px; align-items: start; padding: 6px 9px; border-radius: 9px; border: 1.5px solid var(--line); background: var(--surface); min-width: 0; }
.cs-dot { margin-top: 4px; width: 9px; height: 9px; border-radius: 50%; background: var(--sunk); }
.cs-dot.pass { background: var(--ok); }
.cs-dot.fail { background: var(--err); }
.cs-dot.run { background: var(--warm); animation: pulse 0.6s infinite; }
.cs-pr > span:last-child { display: grid; gap: 2px; min-width: 0; }
.cs-prt { font-size: 0.74rem; color: var(--ink); overflow-wrap: anywhere; }
.cs-prt code { font-size: 0.7rem; }
.cs-pr small { font-size: 0.7rem; color: var(--muted); }
.cs-pr.ok { border-color: var(--ok); background: var(--ok-soft); }
.cs-pr.err { border-color: var(--err); background: var(--err-soft); }
.cs-row { font: 600 0.76rem/1.45 var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.cs-row.lit { color: var(--accent); }
`;

  Lab.addTrack({
    id: 'capship',
    title: 'Ship it',
    kind: 'project',
    description: 'Give the News app breaking-news alerts that open the right story, keep it in sync in the background, harden it, and release it on Google Play.',
    builds: 'The same News app, now with two notification channels, FCM registration, breaking news as data messages, an alert that opens its article with the list behind it, a WorkManager sync that has the story ready, HTTPS-only networking, a signed release bundle shrunk by R8, and a release on Google Play that goes out in stages.',
    group: 'Shipping',
    requires: ['capquality', 'push', 'background', 'security', 'build', 'launch'],
    css,
    lessons: [
      // 1 channels ─────────────────────────────────────────────
      {
        id: 'channels',
        title: 'Notification channels',
        tagline: 'Make room for alerts on the phone, and ask for them at the right moment.',
        goals: ['Create a breaking and a local channel in NewsApp.onCreate', 'Ask for POST_NOTIFICATIONS from a card the reader taps', 'Pick each channel’s importance before the first release'],
        level: 'intermediate', introduces: [],
        refs: ['push.notifications', 'push.channels', 'security.privacy', 'capapp.hilt'],
        body: `
<p>The News app from the last two projects is tested and quick, but it only speaks when someone opens it. When a storm closes the coastal road, readers want to know at once, without opening anything. This project gives News alerts, keeps it in sync in the background, hardens it and ships it on Google Play. Each step adds one piece; the board in each demo shows the pieces so far. Step one makes room on the phone.</p>
<p>News sends two kinds of alerts, so it gets two channels. <code>breaking</code> is for big stories, as they happen: <code>IMPORTANCE_HIGH</code>, so it makes a sound and shows a heads-up banner. <code>local</code> is for news from the reader’s area, a few times a week: <code>IMPORTANCE_LOW</code>, silent, with an icon in the status bar. <code>NewsApp.onCreate</code> creates both on every start, which is safe. Choose the importances now: once a channel exists on a phone, the reader owns it. A later version can’t make it louder; only its name and description (and a lower importance, if the reader never touched it) can change.</p>
<p>On Android 13 and newer, a new install starts with notifications off, and News needs the <code>POST_NOTIFICATIONS</code> permission. Asking the moment the app opens means asking before the reader knows what for. So a card at the top of the list asks “Get an alert when big news breaks?”, and only a tap on <b>Turn on</b> starts Android’s dialog, through <code>rememberLauncherForActivityResult</code>. After “Don’t allow”, the card stays, News works as before, and <code>canNotify</code> makes sure nothing is posted.</p>`,
        visual(el) {
          const ch = hit => file(['// NewsApp.onCreate', 'val breaking = NotificationChannel(BREAKING, getString(R.string.channel_breaking), NotificationManager.IMPORTANCE_HIGH)', 'val local = NotificationChannel(LOCAL, getString(R.string.channel_local), NotificationManager.IMPORTANCE_LOW)', 'val manager = getSystemService(NotificationManager::class.java)', 'manager.createNotificationChannel(breaking)', 'manager.createNotificationChannel(local)'], hit);
          const can = (op, hit, bad) => file(['fun canNotify(context: Context): Boolean {', `    return Build.VERSION.SDK_INT ${op} Build.VERSION_CODES.TIRAMISU ||`, '        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED', '}'], hit, bad);
          const LIST = ['a5', 'a4', 'a3', 'a2'];
          const ASK = { title: 'Get an alert when big news breaks?', btn: 'Turn on' };
          demo(el, {
            step: 1,
            panelTitle: 'Code',
            predict: {
              q: 'News 1.0 creates <code>local</code> with <code>IMPORTANCE_LOW</code>. In 1.1 a teammate changes that line to <code>IMPORTANCE_HIGH</code>. What do readers who already had 1.0 get?',
              options: ['Silent alerts, as before: the channel on their phone keeps LOW', 'Heads-up alerts with a sound from now on', 'A crash when the app starts'],
              a: 0,
              why: 'Code can’t raise a channel’s importance once it exists on a phone: the reader decides how loud it is. So pick the importances before the first release.',
            },
            frames: [
              { screen: { list: LIST }, board: { chan: ['new', 'not built yet'] }, panel: ch([4, 5]), say: 'News, as the last project left it: it speaks only when you open it. This project gives it alerts and ships it. Step one makes room on the phone: two channels, created in <code>NewsApp.onCreate</code> on every start.' },
              { screen: { settings: [['Breaking news', 'Big stories, as they happen', true], ['Local news', 'News from your area, a few times a week', true]] }, panel: ch([1, 2]), say: 'Settings &gt; Apps &gt; News &gt; Notifications now lists both. Breaking is <code>IMPORTANCE_HIGH</code>: sound and a heads-up banner. Local is <code>IMPORTANCE_LOW</code>: silent, an icon in the status bar. The reader can switch each one off.' },
              { screen: { list: LIST, ask: ASK }, panel: file(['@Composable', 'fun AlertsCard() {', '    var allowed by remember { mutableStateOf(canNotify(context)) }', '    val ask = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->', '        allowed = granted', '    }', '    if (!allowed) { /* the text and the Turn on button */ }', '}'], [6]), say: 'On Android 13 and newer, a new install starts with notifications off. Instead of asking at once, a card at the top of the list says what the alerts are for. It shows while <code>allowed</code> is <code>false</code>.' },
              { tap: 'turnon', dialog: { title: 'Allow News to send you notifications?', btns: ['Allow', 'Don’t allow'] }, panel: file(['Button(onClick = {', '    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {', '        ask.launch(Manifest.permission.POST_NOTIFICATIONS)', '    }', '})'], [2]), say: 'A tap on <b>Turn on</b> launches the request, and Android shows its dialog. The reader knows exactly what they are saying yes to.' },
              { tap: 'btn0', dialog: null, screen: { list: LIST }, board: { chan: ['new', 'breaking · local'] }, ping: 'chan', panel: rows(['*allowed = granted          // true: the card goes', 'canNotify(context)         // true from now on']), say: '<b>Allow</b>: the launcher’s answer is <code>true</code>, <code>allowed</code> changes, and the card disappears. Channels and permission are ready for the first alert.' },
              { screen: { list: LIST, ask: ASK }, panel: rows(['*allowed = granted          // false: the card stays', 'canNotify(context)         // false: alerts are skipped']), say: 'Had the reader tapped <b>Don’t allow</b>, the answer is <code>false</code>. The card stays, News works as before, and every alert checks <code>canNotify</code> first, so nothing is posted.' },
              { screen: { list: LIST }, fail: 'chan', board: { chan: ['fail', 'card never shows'] }, panel: can('>=', [], [1]), say: 'A teammate “tidies” <code>canNotify</code> and flips <code>&lt;</code> into <code>&gt;=</code>. On Android 13 and newer it is now always <code>true</code>: the card never shows, nobody is asked, and Android drops every alert.' },
              { screen: { list: LIST, ask: ASK }, board: { chan: ['new', 'breaking · local'] }, panel: can('<', [1]), say: 'With <code>&lt;</code>, the check means: an older phone needs no permission; a newer one needs it granted. The card is back for readers who haven’t said yes.' },
            ],
          });
        },
        code: `// NewsApp.kt
const val BREAKING = "breaking"
const val LOCAL = "local"

@HiltAndroidApp
class NewsApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val breaking = NotificationChannel(BREAKING, getString(R.string.channel_breaking), NotificationManager.IMPORTANCE_HIGH)
        breaking.description = getString(R.string.channel_breaking_text)   // "Big stories, as they happen"
        val local = NotificationChannel(LOCAL, getString(R.string.channel_local), NotificationManager.IMPORTANCE_LOW)
        local.description = getString(R.string.channel_local_text)         // "News from your area, a few times a week"
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(breaking)                          // safe on every start
        manager.createNotificationChannel(local)
    }
}

// ui/Alerts.kt
fun canNotify(context: Context): Boolean {
    return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
}

// ui/AlertsCard.kt: at the top of the list until alerts are allowed
@Composable
fun AlertsCard() {
    val context = LocalContext.current
    var allowed by remember { mutableStateOf(canNotify(context)) }
    val ask = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        allowed = granted                    // "Don't allow": the card stays, News works as before
    }
    if (!allowed) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Text("Get an alert when big news breaks?")
            Button(onClick = {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    ask.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }) {
                Text("Turn on")
            }
        }
    }
}
// ArticleListScreen, in the last branch of the when: Column { AlertsCard(), the error line, ArticleList(...) }

// AndroidManifest.xml, next to INTERNET:
// <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`,
        remember: 'One channel per kind of alert, importances chosen before release, and the permission asked from a card the reader taps.',
        mistakes: [
          { title: 'Asking the moment the app opens', bad: `class MainActivity : ComponentActivity() {
    private val ask = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ask.launch(Manifest.permission.POST_NOTIFICATIONS)   // before the reader has seen any news
        setContent { MaterialTheme { NewsNavHost() } }
    }
}`, good: `// ArticleListScreen: AlertsCard() at the top of the list
// asks only when the reader taps "Turn on"`, why: 'A dialog before the first headline gives no reason to say yes, and many readers say no. A card that explains the alerts, and asks only on a tap, gets the question asked when it makes sense.' },
        ],
        terms: [
          { term: 'breaking news', def: 'A big story that is happening right now, worth an alert at once, like a road closed by a storm.' },
          { term: 'asking in context', def: 'Asking for a permission at the moment the user wants the feature that needs it, like a tap on <b>Turn on</b> under “Get an alert when big news breaks?”.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Breaking news should make a sound and show a heads-up banner. Local news should be silent, with an icon.', code: `val breaking = NotificationChannel(BREAKING, getString(R.string.channel_breaking), NotificationManager.[[IMPORTANCE_HIGH]])
val local = NotificationChannel(LOCAL, getString(R.string.channel_local), NotificationManager.[[IMPORTANCE_LOW]])`, why: '<code>IMPORTANCE_HIGH</code> is the loud one, with a banner; <code>IMPORTANCE_LOW</code> is silent with a status bar icon.' },
          { type: 'bug', prompt: 'On Android 13 phones, the card never appears and no alert ever shows. Tap the line.', code: `fun canNotify(context: Context): Boolean {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
}`, bug: 1, fix: '    return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||', why: 'Only phones older than Android 13 may skip the check. With <code>&gt;=</code>, every new phone counts as allowed, so the card never asks and Android drops the alerts.' },
        ],
        quiz: [
          { q: 'Why does News have two channels instead of one?', options: ['So a reader can keep breaking news and switch off local news, or the other way round', 'Android allows only one notification per channel', 'FCM needs a channel per message type'], a: 0, why: 'Settings lists each channel with its own switch. With one channel, the only choice is all or nothing.' },
          { q: 'When does News ask for <code>POST_NOTIFICATIONS</code>?', options: ['When the reader taps <b>Turn on</b> on the card', 'In <code>NewsApp.onCreate</code>', 'When the first push arrives'], a: 0, why: 'Asking in context: the card says what the alerts are for, and the tap starts the dialog.' },
          { q: 'News 1.0 is out. Can 1.1 make the <code>local</code> channel louder with a new importance?', options: ['No: the reader owns the channel now, and code can’t make it louder', 'Yes, the next start applies it', 'Yes, but only after a restart of the phone'], a: 0, why: 'That is why this step picks the importances before the first release. Changing one later needs a new channel with a new id.' },
        ],
        docs: [['Create and manage notification channels', 'https://developer.android.com/develop/ui/views/notifications/channels'], ['Notification runtime permission', 'https://developer.android.com/develop/ui/views/notifications/notification-permission']],
      },

      // 2 tokens: FCM registration ─────────────────────────────────────────────
      {
        id: 'tokens',
        title: 'FCM registration',
        tagline: 'Give your server every phone’s installation ID, and keep the list fresh.',
        goals: ['Add Firebase Cloud Messaging to News with the BoM and google-services.json', 'Send the installation ID from onRegistered to your server, in the app’s scope', 'Explain why every start calls register() again'],
        level: 'intermediate', introduces: [],
        refs: ['push.fcm', 'push.fcm-registration', 'arch.hilt-modules', 'data.net'],
        body: `
<p>A story breaks on your server while a reader’s phone is in a pocket and News isn’t running. FCM can deliver a message to that phone, but your server has to name the phone: by its <code>Firebase installation ID</code>. So before any alert, every install of News tells your server its ID. First, Firebase: create a project in the Firebase console, add the app as <code>com.example.news</code>, put <code>google-services.json</code> in the <code>app</code> folder, and add the <code>google-services</code> plugin, the Firebase BoM and <code>firebase-messaging</code>, as new lines in the version catalog.</p>
<p>The manifest gets two things: the <code>firebase_messaging_installation_id_enabled</code> meta-data, and <code>NewsMessagingService</code>, with <code>android:exported="false"</code> and the <code>MESSAGING_EVENT</code> action. In the service, <code>onRegistered(installationId)</code> sends the ID to a new call, <code>NewsApi.registerDevice</code>, which posts it to <code>v1/devices</code>. News has no accounts, so the server keeps a list of IDs, each with the time it last heard from it. When FCM later answers that an ID is no longer registered, the server deletes that row.</p>
<p>The upload is a suspend call, and Android stops the service as soon as <code>onRegistered</code> returns. So it runs in one scope for the whole app, <code>CoroutineScope(Dispatchers.IO)</code>, made once by a Hilt module, <code>AppModule</code>; <code>@AndroidEntryPoint</code> and <code>@Inject lateinit var</code> hand it to the service with <code>NewsApi</code>. If the upload fails, the <code>catch</code> blocks keep News running. <code>NewsApp.onCreate</code> calls <code>FirebaseMessaging.getInstance().register()</code> on every start, which runs <code>onRegistered</code> again, so a failed upload is repaired at the next start.</p>`,
        visual(el) {
          const svc = (hit, bad, reg = 'register') => file(['@AndroidEntryPoint', 'class NewsMessagingService : FirebaseMessagingService() {', '    override fun onRegistered(installationId: String) {', '        appScope.launch {', '            api.registerDevice(Device(installationId))   // in try, with two catch blocks', '        }', '    }', '}', '// NewsApp.onCreate, after the channels:', `FirebaseMessaging.getInstance().${reg}()`], hit, bad);
          const LIST = ['a5', 'a4', 'a3', 'a2'];
          const HEAD = ['installation ID', 'last heard'];
          demo(el, {
            step: 2,
            panelTitle: 'Code and server',
            predict: {
              q: 'On Ada’s first start of News, your server is down for an update, so the upload in <code>onRegistered</code> fails with <code>HttpException</code>. When does the server learn her phone’s ID?',
              options: ['At her next start: <code>register()</code> runs again, and so does <code>onRegistered</code>', 'Never: FCM hands out each ID once', 'Only when her ID changes'],
              a: 0,
              why: '<code>NewsApp.onCreate</code> calls <code>register()</code> on every start, and FCM answers with <code>onRegistered</code> each time. The <code>catch</code> kept the app running; the next start sends the ID again.',
            },
            frames: [
              { screen: { list: LIST }, board: { fcm: ['new', 'not built yet'] }, panel: file(['# libs.versions.toml, new lines', 'firebaseBom = "35.0.2"', 'googleServices = "4.5.0"', 'firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebaseBom" }', 'firebase-messaging = { group = "com.google.firebase", name = "firebase-messaging" }', 'google-services = { id = "com.google.gms.google-services", version.ref = "googleServices" }'], [4]), say: 'First, Firebase: a project in the Firebase console, News added as <code>com.example.news</code>, and <code>google-services.json</code> in the <code>app</code> folder. The catalog gets the BoM, <code>firebase-messaging</code> (no version: the BoM picks it) and the plugin.' },
              { panel: svc([2, 3, 4]), say: 'At the first start, FCM registers this install and calls <code>onRegistered("fWq3kR7…")</code>. The upload runs in <code>appScope</code>, the app’s own scope, because Android stops the service as soon as <code>onRegistered</code> returns.' },
              { panel: table(HEAD, [['*fWq3kR7…', 'Fri 09:41']]), board: { fcm: ['new', 'ID on the server'] }, ping: 'fcm', say: '<code>registerDevice</code> posts the ID to <code>v1/devices</code>. The server keeps it, with the time it last heard from it. Now the server can name this phone when news breaks.' },
              { panel: checks([['<code>onRegistered("cX81pLm…")</code>', 'ok', 'Ada’s first start'], ['upload to <code>v1/devices</code>', 'err', '<code>HttpException</code> 503: the server is being updated. <code>catch</code> keeps News running']]), say: 'Ada’s first start comes while the server is down for an update. The upload fails with <code>HttpException</code>; the <code>catch</code> block keeps News running, and the server has no row for her.' },
              { panel: table(HEAD, [['fWq3kR7…', 'Fri 09:41'], ['*cX81pLm…', 'Fri 10:05']]), say: 'Her next start calls <code>register()</code> again, FCM answers with <code>onRegistered</code>, and this time the upload works. That is why every start registers.' },
              { panel: table(HEAD, [['fWq3kR7…', 'Mon 08:12'], ['cX81pLm…', 'Fri 10:05'], ['*Lq0d2Ve…', 'Fri 10:30']]), say: 'Sam reinstalls News, so his install gets a new ID: a new row. His old one stays until a send to it fails because FCM says it is no longer registered; then the server deletes it.' },
              { panel: svc([], [9], 'unregister'), fail: 'fcm', board: { fcm: ['fail', 'no new IDs'] }, say: 'A teammate pastes the sign-out code from another app into <code>NewsApp.onCreate</code>: <code>unregister()</code>. Now every start removes the install from FCM, and nothing reaches the phone.' },
              { panel: svc([9]), board: { fcm: ['new', 'ID on the server'] }, say: 'Back to <code>register()</code>. News has no accounts, so it never needs <code>unregister()</code>: each start registers, and the server learns every ID.' },
            ],
          });
        },
        code: `// libs.versions.toml, new lines:
// [versions]   firebaseBom = "35.0.2"   googleServices = "4.5.0"
// [libraries]  firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebaseBom" }
//              firebase-messaging = { group = "com.google.firebase", name = "firebase-messaging" }   # version from the BoM
// [plugins]    google-services = { id = "com.google.gms.google-services", version.ref = "googleServices" }
// app/build.gradle.kts: alias(libs.plugins.google.services), implementation(platform(libs.firebase.bom)),
//     implementation(libs.firebase.messaging); google-services.json goes in the app folder
// (and alias(libs.plugins.google.services) apply false in the project's build.gradle.kts)

// AndroidManifest.xml, inside <application>:
// <meta-data android:name="firebase_messaging_installation_id_enabled" android:value="true" />
// <service android:name=".NewsMessagingService" android:exported="false">
//     <intent-filter>
//         <action android:name="com.google.firebase.MESSAGING_EVENT" />
//     </intent-filter>
// </service>

// di/AppModule.kt: one scope for the whole app
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideAppScope(): CoroutineScope = CoroutineScope(Dispatchers.IO)   // nothing cancels it
}

// data/NewsApi.kt: one more call
@Serializable
data class Device(val installationId: String)

interface NewsApi {
    @GET("v1/headlines")
    suspend fun headlines(): HeadlinesResponse

    @POST("v1/devices")                          // the server keeps the ID and the time
    suspend fun registerDevice(@Body device: Device)
}

// NewsMessagingService.kt
@AndroidEntryPoint
class NewsMessagingService : FirebaseMessagingService() {
    @Inject lateinit var api: NewsApi            // Hilt fills these in
    @Inject lateinit var appScope: CoroutineScope

    // The first registration, a new ID, a refresh, and after every register()
    override fun onRegistered(installationId: String) {
        appScope.launch {                        // keeps going after the service stops
            try {
                api.registerDevice(Device(installationId))
            } catch (e: IOException) {
                // offline: the next start sends it again
            } catch (e: HttpException) {
                // the server said no: the same
            }
        }
    }
}

// NewsApp.onCreate, after the channels: every start sends the ID again
FirebaseMessaging.getInstance().register()`,
        remember: 'onRegistered sends the installation ID to your server in the app’s scope; register() on every start repairs a failed upload.',
        mistakes: [
          { title: 'Uploading without catch', bad: `override fun onRegistered(installationId: String) {
    appScope.launch {
        api.registerDevice(Device(installationId))   // offline: IOException
    }
}`, good: `override fun onRegistered(installationId: String) {
    appScope.launch {
        try {
            api.registerDevice(Device(installationId))
        } catch (e: IOException) {
            // offline: the next start sends it again
        } catch (e: HttpException) {
            // the server said no: the same
        }
    }
}`, why: 'Nothing catches an exception that leaves a coroutine in <code>appScope</code>, so a first start without signal would crash News. With the <code>catch</code> blocks, the upload fails quietly, and the next start repairs it.' },
        ],
        terms: [
          { term: 'device list', def: 'The server’s table of installation IDs, each with the time it last heard from it. The server sends breaking news to every ID in it.' },
          { term: 'stale ID', def: 'An installation ID that no longer reaches a phone, for example after a reinstall. FCM says so when the server sends to it, and the server deletes the row.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send the ID to the server each time FCM hands it over, and ask FCM for it on every start.', code: `override fun [[onRegistered]](installationId: String) {
    appScope.launch {
        api.registerDevice(Device(installationId))
    }
}

// NewsApp.onCreate
FirebaseMessaging.getInstance().[[register]]()`, why: '<code>register()</code> makes FCM call <code>onRegistered</code>, which uploads the ID. Together they repair any upload that failed.' },
          { type: 'bug', prompt: 'After this change, no phone gets any message. Tap the line.', code: `override fun onCreate() {
    super.onCreate()
    // channels, as in step 1
    FirebaseMessaging.getInstance().unregister()
}`, bug: 3, fix: '    FirebaseMessaging.getInstance().register()', why: '<code>unregister()</code> stops FCM’s deliveries to this install, on every start. News has no sign-out, so it only ever registers.' },
        ],
        quiz: [
          { q: 'Why does <code>onRegistered</code> launch the upload in <code>appScope</code>?', options: ['Android stops the service when <code>onRegistered</code> returns; the app’s scope outlives it', 'Suspend calls are faster there', 'FCM requires <code>Dispatchers.IO</code>'], a: 0, why: 'A scope of the service would be cancelled with it. <code>AppModule</code> makes one scope for the whole app, and nothing cancels it.' },
          { q: 'Is the installation ID a secret?', options: ['No: it is an address for one install; only your Firebase project can send to it', 'Yes: anyone who has it can send alerts', 'Yes, so encrypt it in the Keystore'], a: 0, why: 'Sending needs your project’s server credentials, which never leave your server. Step 6 looks at those.' },
        ],
        docs: [['Get started with Firebase Cloud Messaging in Android apps', 'https://firebase.google.com/docs/cloud-messaging/android/get-started']],
      },

      // 3 messages ─────────────────────────────────────────────
      {
        id: 'messages',
        title: 'Handling messages',
        tagline: 'Breaking news arrives as a data message, and News posts the alert itself.',
        goals: ['Read a breaking or local data message in onMessageReceived', 'Post it on the right channel with one notification per story', 'Explain why News uses data messages, not notification messages'],
        level: 'intermediate', introduces: [],
        refs: ['push.messages', 'push.styles', 'push.notifications'],
        body: `
<p>The editors mark a story as breaking: “Coastal road closed as the storm arrives”, id <code>a7</code>. Your server sends a message to every ID in its list. It is a <code>data message</code>: only a <code>data</code> block, with <code>type</code>, <code>articleId</code> and <code>title</code>, all text. A notification message would be shown by Android itself while News is in the background, and none of your code would run: no choice of channel by type, no link to the article (step 4), no sync (step 5). A data message reaches <code>onMessageReceived</code> every time.</p>
<p><code>onMessageReceived</code> reads the data and returns if <code>articleId</code> or <code>title</code> is missing. A <code>when</code> on <code>type</code> picks the channel: <code>"breaking"</code> posts on <code>breaking</code>, <code>"local"</code> on <code>local</code>, and <code>else</code> ignores types this version doesn’t know, which a newer server may send one day. <code>showAlert</code> checks <code>canNotify</code>, builds the notification, and posts it with <code>notify(articleId, 0, notification)</code>: the article id is the notification’s <code>tag</code>, so each story has its own alert, and a corrected title for the same story replaces it.</p>
<p>The server sends breaking news with <code>"android": { "priority": "high" }</code>, so FCM delivers it at once, even to a sleeping phone. High priority is for messages that show the user something; FCM may lower the priority of an app whose high-priority messages show nothing. Local news goes with normal priority, and can wait. <code>onMessageReceived</code> gets only a few seconds, so it only posts. For notification messages sent from the Firebase console, a manifest meta-data line makes Android use <code>breaking</code>.</p>`,
        visual(el) {
          const post = (tag, hit, bad) => file(['fun showAlert(context: Context, channel: String, heading: String, articleId: String, title: String) {', '    if (!canNotify(context)) { return }', '    val notification = NotificationCompat.Builder(context, channel)', '        .setContentTitle(heading).setContentText(title)   // and the rest', '        .build()', tag ? '    NotificationManagerCompat.from(context).notify(articleId, 0, notification)' : '    NotificationManagerCompat.from(context).notify(1, notification)', '}'], hit, bad);
          const A7 = { id: 'a7', ch: 'Breaking news' };
          const A8 = { id: 'a8', ch: 'Local news' };
          demo(el, {
            step: 3,
            panelTitle: 'Message and code',
            predict: {
              q: 'Two breaking stories arrive a minute apart, and the code posts each one with <code>notify(1, notification)</code>. What is on the lock screen?',
              options: ['Only the second story', 'Both stories', 'Only the first story'],
              a: 0,
              why: 'Posting again with the same id replaces that notification. With the article id as the tag, each story gets its own alert.',
            },
            frames: [
              { screen: { lock: [] }, board: { msg: ['new', 'not built yet'] }, panel: file(['// What the server sends to each ID (the part that matters)', '{ "data": {', '    "type": "breaking",', '    "articleId": "a7",', '    "title": "Coastal road closed as the storm arrives" },', '  "android": { "priority": "high" } }']), say: 'The editors mark <code>a7</code> as breaking. Your server sends a data message to every ID in its list: only keys and values, all text. High priority, because it ends in an alert.' },
              { panel: hops(2, null, 'FCM delivers it at once, even to a sleeping phone. News isn’t running, so Android starts it in the background and FCM calls <code>onMessageReceived</code>.'), say: 'The message travels from your server through FCM to the phone. With a data message, your code runs whether News is open, in the background, or not running at all.' },
              { screen: { lock: [A7] }, board: { msg: ['new', 'data → alert'] }, ping: 'msg', panel: file(['override fun onMessageReceived(message: RemoteMessage) {', '    val articleId = message.data["articleId"]', '    val title = message.data["title"]', '    if (articleId == null || title == null) { return }', '    when (message.data["type"]) {', '        "breaking" -> showAlert(this, BREAKING, "Breaking news", articleId, title)', '        "local" -> showAlert(this, LOCAL, "Local news", articleId, title)', '        else -> return', '    }', '}'], [4, 5]), say: '<code>type</code> is <code>"breaking"</code>, so <code>showAlert</code> posts on the <code>breaking</code> channel: a sound, and the story on the lock screen.' },
              { screen: { list: ['a5', 'a4', 'a3'] }, heads: A7, say: 'With News open on screen, the message reaches <code>onMessageReceived</code> too, and the same alert appears as a heads-up banner over the app, because <code>breaking</code> is <code>IMPORTANCE_HIGH</code>.' },
              { screen: { lock: [A8, A7] }, panel: file(['{ "data": {', '    "type": "local",', '    "articleId": "a8",', '    "title": "Night market returns to the old harbour" } }'], [1]), say: 'A local story, with normal priority. It lands on the <code>local</code> channel, silently, next to the breaking one. Each alert keeps its own tag: <code>"a8"</code> and <code>"a7"</code>.' },
              { screen: { lock: [A8] }, fail: 'msg', board: { msg: ['fail', 'one alert at a time'] }, panel: post(false, [], [5]), say: 'An earlier draft posted every alert with <code>notify(1, notification)</code>. The local story replaced the breaking one: the road closure is gone from the lock screen.' },
              { screen: { lock: [A8, A7] }, board: { msg: ['new', 'data → alert'] }, panel: post(true, [5]), say: 'With <code>notify(articleId, 0, notification)</code>, the tag is the story’s id. Two stories, two alerts; the same story sent again with a corrected title replaces its own alert only.' },
            ],
          });
        },
        code: `// What the server sends to each installation ID (only the part that matters):
// breaking: { "data": { "type": "breaking", "articleId": "a7", "title": "Coastal road closed as the storm arrives" },
//             "android": { "priority": "high" } }
// local:    { "data": { "type": "local", "articleId": "a8", "title": "Night market returns to the old harbour" } }

@AndroidEntryPoint
class NewsMessagingService : FirebaseMessagingService() {
    // api, appScope and onRegistered as in step 2

    // Data messages arrive here every time: News open, in the background, or not running
    override fun onMessageReceived(message: RemoteMessage) {
        val articleId = message.data["articleId"]
        val title = message.data["title"]
        if (articleId == null || title == null) {
            return                                   // not a story
        }
        when (message.data["type"]) {
            "breaking" -> showAlert(this, BREAKING, "Breaking news", articleId, title)
            "local" -> showAlert(this, LOCAL, "Local news", articleId, title)
            else -> return                           // a type this version doesn't know
        }
    }
}

// ui/Alerts.kt
fun showAlert(context: Context, channel: String, heading: String, articleId: String, title: String) {
    if (!canNotify(context)) {
        return
    }
    val notification = NotificationCompat.Builder(context, channel)
        .setSmallIcon(R.drawable.ic_news)
        .setContentTitle(heading)                                   // "Breaking news"
        .setContentText(title)
        .setStyle(NotificationCompat.BigTextStyle().bigText(title))  // all of a long title
        .setAutoCancel(true)
        .build()
    NotificationManagerCompat.from(context).notify(articleId, 0, notification)   // tag "a7": one alert per story
}

// AndroidManifest.xml, inside <application>: the channel for notification messages
// that Android shows for you, such as a test from the Firebase console
// <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id"
//     android:value="breaking" />`,
        remember: 'Breaking news is a data message: onMessageReceived picks the channel by type and posts one alert per story, tagged with its id.',
        terms: [
          { term: 'message type', def: 'A key in the data, here <code>type</code>, that says what kind of message it is, so the app knows what to do: <code>"breaking"</code> or <code>"local"</code>.' },
          { term: 'notification tag', def: 'A text that, together with the number, names a posted notification. <code>notify("a7", 0, notification)</code> again replaces only the alert tagged <code>"a7"</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pick the channel from the message’s type, and ignore types this version doesn’t know.', code: `[[when]] (message.data["type"]) {
    "breaking" -> showAlert(this, BREAKING, "Breaking news", articleId, title)
    "local" -> showAlert(this, LOCAL, "Local news", articleId, title)
    [[else]] -> return
}`, why: 'The <code>else</code> branch keeps an older version calm when the server starts sending a new type.' },
          { type: 'bug', prompt: 'Every story replaces the alert before it, so readers only ever see the latest one. Tap the line.', code: `val notification = NotificationCompat.Builder(context, channel)
    .setSmallIcon(R.drawable.ic_news)
    .setContentTitle(heading)
    .setContentText(title)
    .build()
NotificationManagerCompat.from(context).notify(1, notification)`, bug: 5, fix: 'NotificationManagerCompat.from(context).notify(articleId, 0, notification)', why: 'Same id, same notification. With the article id as the tag, each story keeps its own alert.' },
        ],
        quiz: [
          { q: 'News is in the background. Why would a notification message be a problem?', options: ['Android shows it itself and none of News’s code runs', 'It can’t carry a title', 'FCM drops it'], a: 0, why: 'Android draws it for you, so News can’t pick the channel by type, link to the article, or start a sync. A data message always reaches <code>onMessageReceived</code>.' },
          { q: 'Why does the server send local news with normal priority?', options: ['It can wait; high priority is for messages that show the user something now', 'Normal priority skips the channel', 'High priority is only for paid apps'], a: 0, why: 'High priority wakes the phone. FCM may lower the priority of apps whose high-priority messages show nothing, so keep it for news that can’t wait.' },
        ],
        docs: [['Receive messages in an Android app', 'https://firebase.google.com/docs/cloud-messaging/android/receive-messages'], ['Message priority on Android', 'https://firebase.google.com/docs/cloud-messaging/android/message-priority']],
      },

      // 4 deeplink ─────────────────────────────────────────────
      {
        id: 'deeplink',
        title: 'Deep link to content',
        tagline: 'A tap on the alert opens that article, with the list behind it for Back.',
        goals: ['Give the ArticleDetail route a deep link with navDeepLink', 'Open it from the alert with TaskStackBuilder', 'Explain what the screen shows when the article isn’t in Room yet'],
        level: 'intermediate', introduces: [],
        refs: ['push.deeplinks', 'push.styles', 'capapp.screens', 'capapp.hilt'],
        body: `
<p>A reader taps “Coastal road closed as the storm arrives”, and News opens on the list of headlines; now they have to find the story themselves. The alert should open article <code>a7</code> directly, and Back should go to the list. Each article gets an address: <code>https://news.example.com/article/a7</code>, and a new constant, <code>WEB</code>, holds the start of it, <code>"https://news.example.com"</code>. In <code>NewsNavHost</code>, the <code>ArticleDetail</code> route gets <code>deepLinks = listOf(navDeepLink&lt;ArticleDetail&gt;(basePath = "$WEB/article"))</code>. Its <code>id</code> has no default value, so Navigation adds it to the path: the link matches <code>…/article/{id}</code>.</p>
<p>As in the push track, <code>MainActivity</code> gets an <code>&lt;intent-filter&gt;</code> for these links: the <code>VIEW</code> action, the <code>DEFAULT</code> and <code>BROWSABLE</code> categories, and <code>https</code>, <code>news.example.com</code> and the <code>pathPrefix</code> <code>/article</code>. In <code>showAlert</code>, an Intent names the link and <code>MainActivity</code>, and <code>TaskStackBuilder</code> wraps it: <code>addNextIntentWithParentStack</code> and <code>getPendingIntent</code>. The app starts in a fresh task, with <code>ArticleList</code>, the start destination, under the article. Every story has its own link, and Android compares the links of two PendingIntents (only extras don’t count), so the request code can stay <code>0</code>.</p>
<p>The article screen needs no change: <code>ArticleViewModel</code> reads the id from the route, as before, and asks Room for that row. That is also its weak spot. If the alert arrives before News has refreshed its list, Room has no <code>a7</code> yet, and the screen stays empty. The next step fixes that.</p>`,
        visual(el) {
          const nav = (links, hit, bad) => file(['composable<ArticleDetail>(', links ? '    deepLinks = listOf(navDeepLink<ArticleDetail>(basePath = "$WEB/article"))' : '    // no deepLinks', ') {', '    val viewModel: ArticleViewModel = hiltViewModel()', '    // as before', '}'], hit, bad);
          const A7 = { id: 'a7', ch: 'Breaking news' };
          demo(el, {
            step: 4,
            panelTitle: 'Code',
            predict: {
              q: 'The alert for <code>a7</code> arrives an hour after News last refreshed its list, so Room has no <code>a7</code> yet. The reader taps the alert. What does the article screen show?',
              options: ['An empty article screen: Room has no row for a7', 'The article, loaded from the server', 'The list, with a7 at the top'],
              a: 0,
              why: 'The link works: Navigation opens <code>ArticleDetail("a7")</code>. But <code>ArticleViewModel</code> only reads Room, and the row isn’t there. Step 5 fetches it in time.',
            },
            frames: [
              { screen: { lock: [A7] }, board: { link: ['new', 'not built yet'] }, panel: nav(true, [1]), say: 'Each article gets an address, <code>https://news.example.com/article/a7</code>. The <code>ArticleDetail</code> route answers to it: Navigation adds <code>id</code> to the base path, so the link matches <code>…/article/{id}</code>.' },
              { panel: file(['// showAlert: a tap opens the article', 'val link = Intent(Intent.ACTION_VIEW, Uri.parse("$WEB/article/$articleId"), context, MainActivity::class.java)', 'val tap = TaskStackBuilder.create(context)', '    .addNextIntentWithParentStack(link)', '    .getPendingIntent(0, PendingIntent.FLAG_IMMUTABLE)', 'builder.setContentIntent(tap)'], [1, 3]), say: '<code>showAlert</code> builds an Intent with the link that names <code>MainActivity</code>, and <code>TaskStackBuilder</code> wraps it. Each story has its own link, so each alert has its own PendingIntent.' },
              { tap: 'alert:a7', screen: { detail: 'a7' }, board: { link: ['new', 'alert → article'] }, ping: 'link', say: 'The reader taps the alert. News starts in a fresh task, Navigation matches the link and opens <code>ArticleDetail("a7")</code>, and <code>ArticleViewModel</code> reads the row from Room, which usually has it already.' },
              { screen: { list: ['a7', 'a5', 'a4', 'a3'] }, say: 'Back goes to the list, not out of the app: Navigation put <code>ArticleList</code>, the start destination, under the article.' },
              { screen: { lock: [A7] }, panel: nav(false, [], [1]), say: 'Had the route no <code>deepLinks</code>, the tap would still start News, but Navigation would find nothing that matches the link.' },
              { tap: 'alert:a7', screen: { list: ['a5', 'a4', 'a3'] }, fail: 'link', board: { link: ['fail', 'opens the list'] }, say: 'So it would show the start destination: the list. The reader would have to look for the road closure themselves.' },
              { screen: { detail: 'a7', missing: true }, board: { link: ['new', 'alert → article'] }, panel: rows(['ArticleDetail(id = "a7")', '*dao.observe("a7")     // null: Room has no a7 yet']), say: 'With <code>deepLinks</code> back, one case is left: the alert came before News refreshed. The link opens <code>a7</code>, but Room has no such row, so the screen stays empty. The next step fetches it in time.' },
            ],
          });
        },
        code: `// ui/NewsNavHost.kt
const val WEB = "https://news.example.com"

composable<ArticleDetail>(
    deepLinks = listOf(navDeepLink<ArticleDetail>(basePath = "$WEB/article"))   // matches …/article/{id}
) {
    val viewModel: ArticleViewModel = hiltViewModel()   // reads the id from the route, as before
    val article by viewModel.article.collectAsStateWithLifecycle()
    ArticleDetailScreen(article)
}

// AndroidManifest.xml, inside MainActivity's <activity>:
// <intent-filter>
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <category android:name="android.intent.category.BROWSABLE" />
//     <data android:scheme="https" android:host="news.example.com" android:pathPrefix="/article" />
// </intent-filter>

// ui/Alerts.kt, in showAlert: a tap opens the article, with the list under it for Back
val link = Intent(Intent.ACTION_VIEW, Uri.parse("$WEB/article/$articleId"), context, MainActivity::class.java)
val tap = TaskStackBuilder.create(context)
    .addNextIntentWithParentStack(link)
    .getPendingIntent(0, PendingIntent.FLAG_IMMUTABLE)   // each story's link differs, so 0 is fine
val notification = NotificationCompat.Builder(context, channel)
    .setSmallIcon(R.drawable.ic_news)
    .setContentTitle(heading)
    .setContentText(title)
    .setStyle(NotificationCompat.BigTextStyle().bigText(title))
    .setContentIntent(tap)
    .setAutoCancel(true)
    .build()

// Try a link from the terminal:
// adb shell am start -W -a android.intent.action.VIEW -d "https://news.example.com/article/a7" com.example.news`,
        remember: 'The route answers to a link with navDeepLink; the alert opens it through TaskStackBuilder, so Back goes to the list.',
        terms: [
          { term: 'parent stack', def: 'The screens put under the one a link opens, so Back works as if the user had come from the start. Here: <code>ArticleList</code> under <code>ArticleDetail("a7")</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start News in a fresh task, with the list under the article.', code: `val tap = TaskStackBuilder.create(context)
    .[[addNextIntentWithParentStack]](link)
    .[[getPendingIntent]](0, PendingIntent.FLAG_IMMUTABLE)`, why: '<code>addNextIntentWithParentStack</code> adds the link with its parents; <code>getPendingIntent</code> wraps it for the notification.' },
          { type: 'bug', prompt: 'A tap on any alert opens the list instead of the story. Tap the line.', code: `const val WEB = "https://news.example.com"

composable<ArticleDetail>(
    deepLinks = listOf(navDeepLink<ArticleDetail>(basePath = "$WEB/article"))
) { /* as before */ }

val link = Intent(Intent.ACTION_VIEW, Uri.parse("$WEB/articles/$articleId"), context, MainActivity::class.java)`, bug: 6, fix: 'val link = Intent(Intent.ACTION_VIEW, Uri.parse("$WEB/article/$articleId"), context, MainActivity::class.java)', why: 'The alert’s link says <code>/articles/</code>, the route answers to <code>/article/</code>. Nothing matches, so Navigation stays on the start destination.' },
        ],
        quiz: [
          { q: 'Why can every alert use request code <code>0</code>?', options: ['Each story’s Intent has its own link, and Android compares links; only extras don’t count', 'Request codes are ignored for activities', 'TaskStackBuilder picks a new code itself'], a: 0, why: 'Two PendingIntents are the same only if their Intents match apart from extras. Different links, different PendingIntents.' },
          { q: 'What does the reader see after pressing Back on the article?', options: ['The list of headlines', 'The home screen', 'The lock screen'], a: 0, why: 'The parent stack put <code>ArticleList</code>, the start destination, under the article.' },
        ],
        docs: [['Create a deep link for a destination', 'https://developer.android.com/guide/navigation/design/deep-link']],
      },

      // 5 sync ─────────────────────────────────────────────
      {
        id: 'sync',
        title: 'Background sync',
        tagline: 'WorkManager fetches the story as the alert arrives, and the headlines every few hours.',
        goals: ['Write SyncWorker as a @HiltWorker that calls refresh()', 'Book a one-time sync from onMessageReceived, waiting for a network', 'Keep the list fresh with a periodic sync'],
        level: 'intermediate', introduces: ['CONNECTED'],
        refs: ['background.workmanager', 'background.workmanager-hilt', 'background.receivers', 'capapp.cache'],
        body: `
<p>The last step left one gap: the alert can arrive before Room has the story, and the article screen stays empty. The message can’t carry the whole article, it is at most 4 KB, and <code>onMessageReceived</code> gets only a few seconds. So it books a job instead: fetch the news now, as soon as there is a network. That is work for WorkManager.</p>
<p><code>SyncWorker</code> is a <code>CoroutineWorker</code> whose <code>doWork()</code> calls <code>repository.refresh()</code>, the same call as a pull on the list. It needs <code>NewsRepository</code>, so it is a <code>@HiltWorker</code> with an <code>@AssistedInject</code> constructor, and <code>NewsApp</code> hands WorkManager Hilt’s factory: it implements <code>Configuration.Provider</code>, and the manifest switches off WorkManager’s default set-up, as in the background track. <code>refresh()</code> writes into Room, Room stays the single source of truth, and the list and the article screen update by themselves.</p>
<p>After posting the alert, <code>onMessageReceived</code> books <code>OneTimeWorkRequestBuilder&lt;SyncWorker&gt;()</code> with a constraint: <code>NetworkType.CONNECTED</code>, any working network, Wi-Fi or mobile data. It is unique work named <code>"push-sync"</code> with <code>ExistingWorkPolicy.REPLACE</code>, so three stories in a tunnel give one sync when the signal is back, and that one fetches all three. <code>NewsApp.onCreate</code> also books <code>"news-sync"</code> every 6 hours with <code>ExistingPeriodicWorkPolicy.KEEP</code>, so the list is fresh when the reader opens News.</p>`,
        visual(el) {
          const A7 = { id: 'a7', ch: 'Breaking news' };
          const job = (a, b, c, note) => checks([['post the alert', a], ['book <code>push-sync</code>', b], ['<code>SyncWorker.doWork()</code>', c, note]]);
          demo(el, {
            step: 5,
            panelTitle: 'The work',
            predict: {
              q: 'Three breaking stories arrive while the phone is in a tunnel. Each one books <code>push-sync</code> with <code>ExistingWorkPolicy.REPLACE</code> and a network constraint. How many syncs run when the signal is back?',
              options: ['One, which fetches all three stories', 'Three, one for each story', 'None: bookings made offline are lost'],
              a: 0,
              why: 'Each booking replaces the one still waiting, and WorkManager keeps it until the constraint holds. <code>refresh()</code> fetches all the headlines, so one run is enough.',
            },
            frames: [
              { screen: { detail: 'a7', missing: true }, board: { sync: ['new', 'not built yet'] }, panel: file(['@HiltWorker', 'class SyncWorker @AssistedInject constructor(', '    @Assisted context: Context,', '    @Assisted params: WorkerParameters,', '    private val repository: NewsRepository,', ') : CoroutineWorker(context, params) {', '    override suspend fun doWork(): Result {', '        try { repository.refresh(); return Result.success() }', '        catch (e: IOException) { return Result.retry() }', '    }', '}'], [7]), say: 'The gap from the last step: Room had no <code>a7</code>. <code>SyncWorker</code> fetches the news with the same <code>refresh()</code> as a pull on the list. Hilt hands it <code>NewsRepository</code>.' },
              { screen: { lock: [A7] }, panel: job('ok', 'ok', 'run', '<code>repository.refresh()</code>'), say: 'A breaking message arrives. <code>onMessageReceived</code> posts the alert, then books <code>push-sync</code> and returns, well inside its few seconds. WorkManager starts <code>SyncWorker</code> at once: the phone is online.' },
              { panel: job('ok', 'ok', 'ok', '<code>Result.success()</code>: <code>a7</code> is in Room'), board: { sync: ['new', 'WorkManager'] }, ping: 'sync', say: 'A second later, <code>refresh()</code> has written the new headlines into Room, <code>a7</code> among them. Nobody has tapped the alert yet.' },
              { tap: 'alert:a7', screen: { detail: 'a7' }, say: 'The reader taps the alert. The deep link opens <code>a7</code>, and this time Room has the row: the article is there at once.' },
              { screen: { lock: [{ id: 'a7', ch: 'Breaking news' }] }, toast: 'No signal', panel: job('ok', 'ok', '', 'waiting for <code>NetworkType.CONNECTED</code>'), say: 'In a tunnel, the alert still appears: posting needs no network. The job is booked, but its constraint, <code>NetworkType.CONNECTED</code>, doesn’t hold, so WorkManager keeps it waiting.' },
              { toast: null, panel: job('ok', 'ok', 'ok', 'one run, all the new stories'), say: 'Out of the tunnel, the network is back and the job runs. Had more stories come in meanwhile, each booking would have replaced the waiting one: still one run, which fetches them all.' },
              { screen: { list: ['a8', 'a7', 'a5', 'a4'], fresh: ['a8'] }, panel: file(['// NewsApp.onCreate', 'val request = PeriodicWorkRequestBuilder<SyncWorker>(6, TimeUnit.HOURS)', '    .setConstraints(online)', '    .build()', 'WorkManager.getInstance(this)', '    .enqueueUniquePeriodicWork("news-sync", ExistingPeriodicWorkPolicy.KEEP, request)'], [1, 5]), say: 'Stories without an alert need a sync too. <code>news-sync</code> runs <code>SyncWorker</code> about every 6 hours, so the morning list already has the night’s news. <code>KEEP</code> books it only once.' },
              { fail: 'sync', board: { sync: ['fail', 'worker not made'] }, panel: term(['WM-WorkerFactory  com.example.news  E  Could not instantiate com.example.news.data.SyncWorker']), say: 'Forget to hand WorkManager Hilt’s factory, and the default one can’t build a <code>SyncWorker</code> that wants a <code>NewsRepository</code>: no sync ever runs. <code>Configuration.Provider</code> and the manifest lines fix it.' },
            ],
          });
        },
        code: `// libs.versions.toml, new lines (androidxHilt = "1.4.0" is already there from the Hilt step):
// [versions]   work = "2.12.0"
// [libraries]  androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "work" }
//              androidx-hilt-work = { group = "androidx.hilt", name = "hilt-work", version.ref = "androidxHilt" }
//              androidx-hilt-compiler = { group = "androidx.hilt", name = "hilt-compiler", version.ref = "androidxHilt" }
// app/build.gradle.kts: implementation(libs.androidx.work.runtime.ktx), implementation(libs.androidx.hilt.work),
//     ksp(libs.androidx.hilt.compiler)

// data/SyncWorker.kt
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,                  // from WorkManager
    @Assisted params: WorkerParameters,          // from WorkManager
    private val repository: NewsRepository,      // from Hilt
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        try {
            repository.refresh()                 // writes into Room; the screens update by themselves
            return Result.success()
        } catch (e: IOException) {
            return Result.retry()
        } catch (e: HttpException) {
            return Result.retry()                // the server had a problem: try later
        }
    }
}

// NewsMessagingService.onMessageReceived, after the when that posts the alert:
val online = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)   // any working network
    .build()
val request = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(online)
    .build()
WorkManager.getInstance(this)
    .enqueueUniqueWork("push-sync", ExistingWorkPolicy.REPLACE, request)

// NewsApp.kt: Hilt's factory for WorkManager, and the periodic sync
@HiltAndroidApp
class NewsApp : Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().setWorkerFactory(workerFactory).build()

    override fun onCreate() {
        super.onCreate()
        // channels and register(), as before
        val online = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val request = PeriodicWorkRequestBuilder<SyncWorker>(6, TimeUnit.HOURS)
            .setConstraints(online)
            .build()
        WorkManager.getInstance(this)
            .enqueueUniquePeriodicWork("news-sync", ExistingPeriodicWorkPolicy.KEEP, request)
    }
}

// AndroidManifest.xml: switch off WorkManager's default set-up, as in the background track
// (the <provider> for androidx.startup.InitializationProvider, with the
//  androidx.work.WorkManagerInitializer meta-data marked tools:node="remove")`,
        remember: 'The push books a one-time SyncWorker that waits for a network; a periodic one keeps the list fresh; Room brings the result to the screens.',
        mistakes: [
          { title: 'Fetching inside onMessageReceived', bad: `override fun onMessageReceived(message: RemoteMessage) {
    // post the alert, then:
    appScope.launch {
        repository.refresh()         // no network now? the fetch just fails
    }
}`, good: `override fun onMessageReceived(message: RemoteMessage) {
    // post the alert, then book the work:
    WorkManager.getInstance(this)
        .enqueueUniqueWork("push-sync", ExistingWorkPolicy.REPLACE, request)
}`, why: 'A launched fetch runs once, right now: offline, it fails and nobody tries again. WorkManager keeps the job until there is a network, retries it, and survives the app being stopped.' },
        ],
        terms: [
          { term: 'push-triggered sync', def: 'A sync that a push message books, so the data the message talks about is on the phone before the user taps.' },
          { term: 'CONNECTED', def: '<code>NetworkType.CONNECTED</code>: a constraint that waits for any working network, Wi-Fi or mobile data. <code>UNMETERED</code> would wait for Wi-Fi.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Book the sync so it waits for any network, and so a new booking replaces one still waiting.', code: `val online = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.[[CONNECTED]])
    .build()
val request = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(online)
    .build()
WorkManager.getInstance(this)
    .enqueueUniqueWork("push-sync", ExistingWorkPolicy.[[REPLACE]], request)`, why: '<code>CONNECTED</code> accepts mobile data too: breaking news shouldn’t wait for Wi-Fi. <code>REPLACE</code> keeps one sync for many messages.' },
          { type: 'bug', prompt: 'When the server has a problem, the sync gives up for good. It should try again later. Tap the line.', code: `override suspend fun doWork(): Result {
    try {
        repository.refresh()
        return Result.success()
    } catch (e: IOException) {
        return Result.retry()
    } catch (e: HttpException) {
        return Result.failure()
    }
}`, bug: 7, fix: '        return Result.retry()', why: '<code>Result.failure()</code> tells WorkManager to give up. A server problem is usually brief, so <code>Result.retry()</code> tries again after a while.' },
        ],
        quiz: [
          { q: 'Why doesn’t the data message carry the whole article?', options: ['A message holds at most 4 KB, and the app should fetch the rest itself', 'FCM can’t carry text', 'Room only accepts rows from Retrofit'], a: 0, why: 'Send the id and the title; <code>SyncWorker</code> fetches the full story into Room.' },
          { q: 'How do the list and the article screen learn that <code>SyncWorker</code> wrote new rows?', options: ['They observe Room through Flow, so they update by themselves', 'The worker calls the ViewModels', 'The user has to pull to refresh'], a: 0, why: 'Room is the single source of truth. The worker writes to it; every screen that observes it gets the new rows.' },
        ],
        docs: [['Getting started with WorkManager', 'https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started'], ['Use Hilt with other Jetpack libraries', 'https://developer.android.com/training/dependency-injection/hilt-jetpack']],
      },

      // 6 harden ─────────────────────────────────────────────
      {
        id: 'harden',
        title: 'Hardening',
        tagline: 'Before strangers install News, check everything it holds, sends and accepts.',
        goals: ['Make News HTTPS-only with a network security config', 'Sort what may ship in the APK from what stays on the server', 'Check every way into the app: the service, links and messages'],
        level: 'intermediate', introduces: [],
        refs: ['security.threats', 'security.network', 'security.secrets', 'security.keystore'],
        body: `
<p>Soon anyone can install News, including people who take it apart. A <code>security pass</code> goes through what the app holds, what it sends, and how others can reach it, and fixes one thing at a time. What News holds is public: headlines in Room and an installation ID. It stores no passwords or tokens, so it has nothing to encrypt with the Keystore yet; if accounts come one day, the tokens go through a <code>TokenCipher</code>, as in the security track.</p>
<p>What it sends: requests to <code>https://news.example.com/</code>. Apps that target Android 9 or higher already block plain HTTP, and <code>res/xml/network_security_config.xml</code> writes it down: <code>&lt;base-config cleartextTrafficPermitted="false" /&gt;</code> for every address, and <code>&lt;debug-overrides&gt;</code> trusts certificates you installed yourself, only in the debug build. When a new call uses <code>http://</code>, it fails at once, and the fix is HTTPS on that server, never an exception in the config. Secrets: <code>google-services.json</code> holds identifiers, such as the Firebase API key, which may ship in the app. The <code>service account key</code> that lets your server send pushes never goes into the app or into Git: whoever has it can send alerts to every reader.</p>
<p>How others reach it: <code>NewsMessagingService</code> stays <code>android:exported="false"</code>, so only FCM can start it. A link like <code>…/article/anything</code> can come from any app on the phone (<code>MainActivity</code> is exported for its links); <code>ArticleViewModel</code> only looks the id up in Room with the <code>:id</code> parameter, so an unknown id shows an empty screen and nothing worse. And the release build gets R8, in the next step.</p>`,
        visual(el) {
          const pass = s => checks([['HTTPS only: <code>network_security_config.xml</code>', s[0]], ['Push key: on the server only', s[1], 'the service account key never ships'], ['Ways in: service, links, messages', s[2]], ['Stored data: nothing secret', s[3], 'no tokens, so no Keystore yet']]);
          demo(el, {
            step: 6,
            panelTitle: 'Security pass',
            predict: {
              q: 'Someone unzips the News APK and copies the API key from <code>google-services.json</code>. Can they send alerts to every News reader?',
              options: ['No: that key only names the Firebase project; the key that sends pushes is on your server', 'Yes: FCM checks that key before each send', 'Only to readers of old versions'],
              a: 0,
              why: 'Firebase API keys identify the project and may ship in apps. Sending needs the service account key, which lives on your server only.',
            },
            frames: [
              { screen: { list: ['a7', 'a5', 'a4', 'a3'] }, board: { harden: ['new', 'not checked yet'] }, panel: pass(['', '', '', '']), say: 'Before strangers install News, a security pass: what it holds, what it sends, and how others reach it. Four checks, one at a time.' },
              { panel: file(['<!-- res/xml/network_security_config.xml -->', '<network-security-config>', '    <base-config cleartextTrafficPermitted="false" />', '    <debug-overrides>', '        <trust-anchors><certificates src="user" /></trust-anchors>', '    </debug-overrides>', '</network-security-config>'], [2, 3]), say: 'Network: HTTPS only, for every address. In the debug build only, News also trusts certificates you installed on your test phone, so a debugging tool can show your own traffic.' },
              { screen: { list: ['a7', 'a5', 'a4', 'a3'], note: 'No connection. Showing saved news.' }, fail: 'harden', board: { harden: ['fail', 'a call over http://'] }, panel: term(['!java.net.UnknownServiceException: CLEARTEXT communication to tides.example.com not permitted by network security policy']), say: 'A teammate adds a tide table from a partner, at <code>http://tides.example.com/</code>. Android refuses the request. It is an <code>IOException</code>, so the list says “No connection.”' },
              { screen: { list: ['a7', 'a5', 'a4', 'a3'] }, board: { harden: ['new', 'checking'] }, panel: pass(['ok', '', '', '']), say: 'The fix is on the partner’s side: they serve the tides over <code>https://</code>. Allowing plain HTTP in the config would let anyone on the café Wi-Fi read and change those answers.' },
              { panel: pass(['ok', 'ok', '', '']), say: 'Secrets: <code>google-services.json</code> holds identifiers, fine inside the APK. The service account key, which signs your server’s requests to FCM, stays on the server and out of Git.' },
              { tap: 'row:a7', screen: { detail: 'a7' }, panel: file(['<!-- AndroidManifest.xml -->', '<service android:name=".NewsMessagingService" android:exported="false">', '// ArticleDao: the id is a parameter, never glued into the SQL', '@Query("SELECT * FROM articles WHERE id = :id")'], [1, 3]), say: 'Ways in: only FCM can start the service. Any app can open <code>…/article/anything</code>, but the id only goes into Room’s <code>:id</code> parameter: an unknown id shows an empty screen, nothing worse.' },
              { board: { harden: ['new', 'HTTPS only'] }, ping: 'harden', panel: pass(['ok', 'ok', 'ok', 'ok']), say: 'Stored data: headlines and an installation ID, nothing secret, so no Keystore yet. The pass is done; R8 in the release build comes next.' },
            ],
          });
        },
        code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <!-- HTTPS only, for every address -->
    <base-config cleartextTrafficPermitted="false" />

    <!-- Debug build only: also trust certificates installed on the test phone -->
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>

<!-- AndroidManifest.xml -->
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
    <!-- only FCM may start the service -->
    <service android:name=".NewsMessagingService" android:exported="false">
        ...
    </service>
</application>

<!-- May ship in the app: google-services.json (identifiers, such as the Firebase API key)
     Never in the app or in Git: the service account key your server uses to send pushes -->`,
        remember: 'HTTPS only, the push key only on the server, and every way in checked: exported="false", ids only as the query’s :id parameter.',
        mistakes: [
          { title: 'Allowing plain HTTP to “fix” a failing call', bad: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
</network-security-config>`, good: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
<!-- and the partner serves https://tides.example.com/ -->`, why: 'The error goes away, and so does the protection: anyone on the same Wi-Fi can read and change the answers. The real fix is HTTPS on that server.' },
        ],
        terms: [
          { term: 'security pass', def: 'Going over an app before release to check what it holds, what it sends and how others can reach it, and fixing one thing at a time.' },
          { term: 'service account key', def: 'The secret file your server uses to prove to Google that it may send messages for your Firebase project. It never goes into the app or into Git.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Allow HTTPS only, for every address.', code: `<network-security-config>
    <[[base-config]] cleartextTrafficPermitted="[[false]]" />
</network-security-config>`, why: '<code>base-config</code> sets the rule for every address; <code>false</code> blocks plain HTTP.' },
          { type: 'bug', prompt: 'Any app on the phone can start the messaging service and make News post fake alerts. Tap the line.', code: `<service android:name=".NewsMessagingService" android:exported="true">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>`, bug: 0, fix: '<service android:name=".NewsMessagingService" android:exported="false">', why: '<code>exported="true"</code> lets other apps start it. With <code>false</code>, only News and FCM, through Firebase’s own parts in the app, reach it.' },
        ],
        quiz: [
          { q: 'Why doesn’t News use the Keystore yet?', options: ['It stores nothing secret: headlines and an installation ID', 'The Keystore only works for Kotlin Multiplatform', 'R8 does the same'], a: 0, why: 'Encrypt what would hurt if copied, such as sign-in tokens. News has none; the day it gets accounts, the tokens go through a <code>TokenCipher</code>.' },
          { q: 'Another app on the phone starts <code>MainActivity</code> with <code>https://news.example.com/article/zzz</code>, as the <code>adb shell am start</code> line in step 4 does. What happens?', options: ['The article screen opens and stays empty: Room has no row zzz', 'News crashes', 'News runs the text as a database query'], a: 0, why: 'The id only goes into the <code>:id</code> parameter of the query. An unknown id finds nothing.' },
        ],
        docs: [['Network security configuration', 'https://developer.android.com/privacy-and-security/security-config'], ['Learn about using and managing API keys for Firebase', 'https://firebase.google.com/docs/projects/api-keys']],
      },

      // 7 release-build ─────────────────────────────────────────────
      {
        id: 'release-build',
        title: 'Release build',
        tagline: 'An upload key, R8 on, a signed bundle, and a test of what users will run.',
        goals: ['Create an upload key and keep it and its password out of Git', 'Sign the release build with it and build app-release.aab', 'Test the release build on a phone before uploading'],
        level: 'intermediate', introduces: [],
        refs: ['perf.r8', 'perf.keep-rules', 'build.signing', 'build.bundles', 'security.secrets'],
        body: `
<p>Google Play takes an app bundle, signed with your <code>upload key</code>. With Play App Signing, Google checks that signature, then signs what phones install with the app signing key, which it keeps for you. In the R8 lesson, Recipes turned on R8 with <code>optimization { enable = true }</code> and tried the release build with the debug key. News’s <code>release</code> block is still empty, so it gets both pieces now: R8 on, and a key of its own, because Play refuses a debug-signed upload. <code>keytool -genkeypair</code> makes <code>upload.jks</code>, valid for 25 years. Keep it outside the project and back it up. If you lose it, Play Console can reset the upload key; the app signing key, which phones check, doesn’t change.</p>
<p>The key and its password stay out of Git, like the map key in the security track: <code>local.properties</code> holds the path and the password (<code>keytool</code> uses one password for the file and the key), <code>Properties</code> reads them in <code>app/build.gradle.kts</code>, and <code>signingConfigs</code> gets an <code>upload</code> entry with <code>storeFile</code>, <code>storePassword</code>, <code>keyAlias</code> and <code>keyPassword</code>. <code>release</code> uses it, and turns R8 on. <code>versionCode = 1</code> is the number Play compares (each upload needs a higher one), and <code>versionName = "1.0"</code> is what readers see.</p>
<p><code>./gradlew bundleRelease</code> builds <code>app/build/outputs/bundle/release/app-release.aab</code>. Before uploading it, test what users will really run: <code>./gradlew assembleRelease</code> builds the same release code as an APK, signed with the same key, which <code>adb install</code> puts on a phone. R8 only runs here, so try every path: an alert, a tap that opens the article, a sync. Then keep <code>mapping.txt</code> from this build with the version: it turns the short names in crash reports back into real ones.</p>`,
        visual(el) {
          const grad = (debug, hit, bad) => file(['// app/build.gradle.kts', 'signingConfigs {', '    create("upload") {', '        storeFile = file(localProperties.getProperty("UPLOAD_STORE_FILE"))', '        storePassword = localProperties.getProperty("UPLOAD_PASSWORD")', '        keyAlias = "upload"', '        keyPassword = localProperties.getProperty("UPLOAD_PASSWORD")', '    }', '}', 'buildTypes {', '    release {', '        optimization { enable = true }', debug ? '        signingConfig = signingConfigs.getByName("debug")' : '        signingConfig = signingConfigs.getByName("upload")', '    }', '}'], hit, bad);
          demo(el, {
            step: 7,
            panelTitle: 'Build',
            predict: {
              q: 'A teammate copies the R8 lesson’s <code>signingConfig = signingConfigs.getByName("debug")</code> into News’s <code>release</code> block and uploads <code>app-release.aab</code>. What happens?',
              options: ['Play Console refuses it: it was signed in debug mode', 'Play accepts it and signs it again', 'It goes out only to testers'],
              a: 0,
              why: 'Play only takes bundles signed with a key of your own. The debug key is on every developer’s computer, so it proves nothing.',
            },
            frames: [
              { screen: { list: ['a7', 'a5', 'a4', 'a3'] }, board: { release: ['new', 'not built yet'] }, panel: term(['$ keytool -genkeypair -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 9125 -dname "CN=Ada Lind, O=News"', 'Generating 2,048 bit RSA key pair and self-signed certificate (SHA384withRSA) with a validity of 9,125 days', '	for: CN=Ada Lind, O=News']), say: 'First, the upload key. <code>keytool</code> asks for a password, twice; <code>-dname</code> gives it the name (CN) and the organization (O) on the command line. It makes <code>upload.jks</code>: 9,125 days is 25 years. It lives outside the project, with a backup.' },
              { panel: file(['# local.properties (already in .gitignore)', 'UPLOAD_STORE_FILE=/home/ada/keys/upload.jks', 'UPLOAD_PASSWORD=…']), say: 'Its path and password go in <code>local.properties</code>, which never reaches Git: <code>keytool</code> uses one password for the file and the key. <code>Properties</code> reads them in <code>app/build.gradle.kts</code>, as with the map key in the security track.' },
              { panel: grad(false, [2, 11, 12]), say: '<code>signingConfigs</code> gets an <code>upload</code> entry, and <code>release</code> uses it. R8 goes on, new for News: <code>optimization { enable = true }</code>. <code>defaultConfig</code> gets <code>versionCode = 1</code> and <code>versionName = "1.0"</code>.' },
              { panel: term(['$ ./gradlew bundleRelease', '+BUILD SUCCESSFUL in 1m 4s', '$ ls app/build/outputs/bundle/release/', 'app-release.aab']), board: { release: ['new', 'R8 · upload key'] }, ping: 'release', say: '<code>./gradlew bundleRelease</code> builds the bundle for Play (an example run, output shortened; the time will differ on your computer).' },
              { screen: { lock: [{ id: 'a7', ch: 'Breaking news' }] }, panel: checks([['<code>./gradlew assembleRelease</code>, then <code>adb install</code>', 'ok', 'the release code, signed with the upload key'], ['an alert arrives', 'ok'], ['the tap opens <code>a7</code>', 'run'], ['a sync runs', ''], ['<code>mapping.txt</code> kept for 1.0', '']]), say: 'Before uploading, test what users will run. <code>assembleRelease</code> builds the same code as an APK; <code>adb install</code> puts it on a phone. R8 only runs in release, so try every path.' },
              { tap: 'alert:a7', screen: { detail: 'a7' }, panel: checks([['<code>./gradlew assembleRelease</code>, then <code>adb install</code>', 'ok'], ['an alert arrives', 'ok'], ['the tap opens <code>a7</code>', 'ok'], ['a sync runs', 'ok'], ['<code>mapping.txt</code> kept for 1.0', 'ok', 'it turns crash reports’ short names back into real ones']]), say: 'The alert opens its article, the sync ran, nothing crashed. Libraries like Retrofit, kotlinx.serialization and Hilt bring their own keep rules. A copy of <code>mapping.txt</code> goes with version 1.0.' },
              { panel: grad(true, [], [12]), fail: 'release', board: { release: ['fail', 'debug-signed'] }, say: 'Had the <code>release</code> block used the debug key, as in the R8 lesson, the bundle would build fine, and then Play Console would refuse it.' },
              { panel: term(['!You uploaded an APK or Android App Bundle that was signed in debug mode. You need to sign your APK or Android App Bundle in release mode.']), board: { release: ['new', 'R8 · upload key'] }, say: 'Play Console shows this message (as developers report it). The fix is one line, <code>signingConfigs.getByName("upload")</code>, which News already has: its bundle passes this check.' },
            ],
          });
        },
        code: `// app/build.gradle.kts
import java.util.Properties            // at the very top of the file

val localProperties = Properties()
localProperties.load(rootProject.file("local.properties").inputStream())

android {
    defaultConfig {
        // applicationId, minSdk 26, targetSdk 36 as before
        versionCode = 1                // Play compares this: every upload needs a higher one
        versionName = "1.0"            // what readers see
    }
    signingConfigs {
        create("upload") {
            storeFile = file(localProperties.getProperty("UPLOAD_STORE_FILE"))
            storePassword = localProperties.getProperty("UPLOAD_PASSWORD")
            keyAlias = "upload"
            keyPassword = localProperties.getProperty("UPLOAD_PASSWORD")   // one password for both
        }
    }
    buildTypes {
        release {
            optimization {
                enable = true          // R8, as in the R8 lesson: new for News
            }
            signingConfig = signingConfigs.getByName("upload")
        }
    }
}

// local.properties (in .gitignore):
// UPLOAD_STORE_FILE=/home/ada/keys/upload.jks
// UPLOAD_PASSWORD=…

// Terminal
// keytool -genkeypair -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 9125 -dname "CN=Ada Lind, O=News"
//     (asks for a password, twice; an RSA key of 2048 bits, valid 9,125 days: 25 years)
// ./gradlew bundleRelease       -> app/build/outputs/bundle/release/app-release.aab, for Play
// ./gradlew assembleRelease     -> the same release code as an APK, to test
// adb install app/build/outputs/apk/release/app-release.apk
// keep app/build/outputs/mapping/release/mapping.txt with version 1.0`,
        remember: 'Sign the release with your own upload key, kept out of Git; build the bundle for Play and test the same release code on a phone first.',
        terms: [
          { term: 'release check', def: 'Installing the release build on a phone and trying every path before uploading it, because R8 only changes the release build.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Sign the release build with the upload key, and build the bundle for Play.', code: `buildTypes {
    release {
        optimization {
            enable = true
        }
        signingConfig = signingConfigs.getByName("[[upload]]")
    }
}
// Terminal: ./gradlew [[bundleRelease]]`, why: 'The <code>upload</code> entry holds your key. <code>bundleRelease</code> builds <code>app-release.aab</code>.' },
          { type: 'bug', prompt: 'This file is in Git, so everyone who can read the project has the upload key’s password. Tap the line.', code: `signingConfigs {
    create("upload") {
        storeFile = file(localProperties.getProperty("UPLOAD_STORE_FILE"))
        storePassword = "Harbour-1979"
        keyAlias = "upload"
        keyPassword = localProperties.getProperty("UPLOAD_PASSWORD")
    }
}`, bug: 3, fix: '        storePassword = localProperties.getProperty("UPLOAD_PASSWORD")', why: '<code>app/build.gradle.kts</code> goes into Git. The password belongs in <code>local.properties</code>, which doesn’t.' },
        ],
        quiz: [
          { q: 'You lose <code>upload.jks</code>. What now?', options: ['Ask for an upload key reset in Play Console; the app signing key phones check stays the same', 'Publish News as a new app', 'Nothing: Play doesn’t check the upload key'], a: 0, why: 'With Play App Signing, Google keeps the app signing key. The upload key only proves the upload is yours, so it can be replaced.' },
          { q: 'Why test with <code>assembleRelease</code> and not with Run in Android Studio?', options: ['Run installs the debug build, where R8 doesn’t run', 'Run can’t install on a phone', 'The debug build has no notifications'], a: 0, why: 'Only the release build is shrunk and renamed by R8, so only it shows what readers will get.' },
          { q: 'What is <code>versionCode</code> for?', options: ['Play compares it: each upload needs a higher number than the last', 'Readers see it in the store', 'It picks the signing key'], a: 0, why: 'Readers see <code>versionName</code>, like “1.0”. <code>versionCode</code> is the number that orders your uploads.' },
        ],
        docs: [['Sign your app', 'https://developer.android.com/studio/publish/app-signing'], ['Publish your app', 'https://developer.android.com/studio/publish']],
      },

      // 8 ship ─────────────────────────────────────────────
      {
        id: 'ship',
        title: 'Shipping',
        tagline: 'Testing tracks first, then production, then updates that go out in stages.',
        goals: ['Take News from internal testing to production', 'Roll out an update in stages and halt it when crashes rise', 'Keep older versions working with the server’s messages'],
        level: 'intermediate', introduces: [],
        refs: ['build.tracks', 'build.automation', 'launch.crashes', 'launch.policy'],
        body: `
<p>The bundle is ready; the readers are not on it yet. In Play Console, News 1.0 goes to the <code>internal testing</code> track first: up to 100 testers, the team, who get it within minutes. They install it from Play, which is the real path: Play’s own signature, real pushes, real links. A personal developer account created after 13 November 2023 must also run a closed test with at least 12 testers for 14 days before it can publish to production. Before the first release, Play Console also asks you to fill in the Data safety form, as in the launch track: what data the app collects and shares, such as the installation ID News sends to your server.</p>
<p>Then <code>production</code>. A first release goes out to everyone at once; staged rollouts are for updates. News 1.1, <code>versionCode = 2</code>, goes to 10% of readers first. Watch crashes in Android vitals, as in the launch track, then raise it to 50% and 100%. If crashes jump, <b>Halt rollout</b> stops new readers from getting 1.1. Readers who have it keep it, so the fix is a new release with a higher <code>versionCode</code>, rolled out the same way.</p>
<p>During a rollout, and for months after, several versions read the same pushes. So the server only adds keys, never renames or reuses them, and News’s <code>else</code> branch ignores types it doesn’t know. That is the whole path: a story breaks, your server sends one data message to each installation ID, FCM wakes the phone, News posts the alert on the right channel and books a sync, and a tap opens the article, already in Room, with the list behind it.</p>
<p>Updates don’t have to be built on your laptop. When they come often, News can get the <code>release.yml</code> workflow Recipes got in the build track, with the same three secret names (<code>UPLOAD_KEYSTORE_BASE64</code>, <code>UPLOAD_PASSWORD</code>, <code>PLAY_SERVICE_ACCOUNT_JSON</code>), holding News’s own upload key and password and a service account invited for News, and the same <code>setting</code> function in <code>app/build.gradle.kts</code>. Two lines change: News has no flavors, so the build step runs <code>./gradlew bundleRelease</code>, and <code>fastlane supply</code> uploads <code>app-release.aab</code> with <code>--package_name com.example.news</code>. News used versionCode 1 to 3 by hand, and 100 plus <code>github.run_number</code> stays above them. Then every push to <code>main</code> reaches the testers; production, and every staged rollout, stays your click in Play Console.</p>`,
        visual(el) {
          const tracks = s => checks([['Internal testing', s[0], 'up to 100 testers, within minutes'], ['Closed testing', s[1], 'new personal accounts: 12 testers, 14 days'], ['Production', s[2]]]);
          demo(el, {
            step: 8,
            panelTitle: 'Play Console',
            predict: {
              q: 'News 1.1 is out to 20% of readers when crashes jump. You halt the rollout. What happens to readers who already have 1.1?',
              options: ['They keep 1.1 until a fixed version with a higher versionCode reaches them', 'Play puts 1.0 back on their phones', '1.1 stops opening on their phones'],
              a: 0,
              why: 'Halting stops new readers from getting 1.1. Play can’t take an update back, so the fix is a new release with a higher <code>versionCode</code>.',
            },
            frames: [
              { screen: { list: ['a7', 'a5', 'a4', 'a3'] }, board: { play: ['new', 'not released yet'] }, panel: tracks(['run', '', '']), say: 'News 1.0 goes to internal testing first. The team installs it from Play, the real path: Play’s signature, real pushes from the server, real links.' },
              { screen: { lock: [{ id: 'a7', ch: 'Breaking news' }] }, panel: tracks(['ok', 'ok', '']), say: 'A test alert reaches every tester’s phone and opens its article. A new personal account also runs a closed test, at least 12 testers for 14 days, before production.' },
              { screen: { list: ['a7', 'a5', 'a4', 'a3'] }, board: { play: ['new', 'testing → production'] }, ping: 'play', panel: meter([['1.0', 100, 'ok']]), say: 'Production. A first release goes to everyone in the chosen countries at once: staged rollouts are only for updates. News is on Google Play.' },
              { panel: meter([['1.1', 10], ['1.0', 90, 'ok']]), say: 'Weeks later, News 1.1, <code>versionCode = 2</code>, goes out as a staged rollout: 10% of readers first, while you watch crashes in Android vitals.' },
              { fail: 'play', board: { play: ['fail', '1.1 halted'] }, panel: meter([['1.1', 20, 'bad'], ['1.0', 80, 'ok']]), say: 'You raise it to 20% with <b>Update rollout</b>. Then crashes jump. <b>Halt rollout</b> stops new readers from getting 1.1. The 20% who have it keep it: Play can’t take an update back.' },
              { panel: term(['!Version code 2 has already been used. Try another version code.']), say: 'A fixed bundle with the same number is refused. Every upload needs a higher <code>versionCode</code>.' },
              { board: { play: ['new', 'testing → production'] }, panel: meter([['1.2', 100, 'ok']]), say: 'News 1.2, <code>versionCode = 3</code>, has the fix. It rolls out the same way, 10%, then 50%, then 100%, and reaches the readers who had 1.1 too.' },
              { screen: { lock: [{ id: 'a7', ch: 'Breaking news' }] }, panel: file(['// News 1.0’s when: the server now also sends { "type": "live", ... }', 'when (message.data["type"]) {', '    "breaking" -> showAlert(this, BREAKING, "Breaking news", articleId, title)', '    "local" -> showAlert(this, LOCAL, "Local news", articleId, title)', '    else -> return          // 1.0 ignores "live"', '}'], [4]), say: 'Several versions read the same pushes for months. 1.2 handles the new <code>"live"</code> type; 1.0 ignores it in <code>else</code>. The server only adds keys and types, never renames them. The whole path works, from your server to the article.' },
            ],
          });
        },
        code: `# Shipping News, in order
# 1. Internal testing:  app-release.aab from step 7, up to 100 testers, available within minutes
#    Try it from Play: an alert, the tap to its article, a sync
# 2. Closed testing:    a personal account created after 13 November 2023 needs
#    at least 12 testers for 14 days before production
# 3. Production:        News 1.0 (versionCode 1), to everyone in the chosen countries
#    Before it: the Data safety form, which data the app collects and shares
#    (News sends an installation ID to your server)

# Updates go out in stages
# News 1.1, versionCode = 2:  10%, watch Android vitals, then 50%, then 100% (Manage rollout > Update rollout)
# Crashes jump: Halt rollout. Readers who have 1.1 keep it.
# The fix: News 1.2, versionCode = 3, rolled out the same way

# Messages stay compatible with every version
# The server adds keys and types; it never renames or reuses them
# The app's when (message.data["type"]) keeps its else branch

# Later updates: .github/workflows/release.yml, as for Recipes in the build track
# Secrets: UPLOAD_KEYSTORE_BASE64, UPLOAD_PASSWORD, PLAY_SERVICE_ACCOUNT_JSON
# app/build.gradle.kts: the setting function; versionCode = 100 + RUN_NUMBER (1 to 3 were by hand)
      # checkout, Java, Gradle and the decode step, as for Recipes
      - run: ./gradlew bundleRelease                # News has no flavors
        env:
          UPLOAD_STORE_FILE: \${{ runner.temp }}/upload.jks
          UPLOAD_PASSWORD: \${{ secrets.UPLOAD_PASSWORD }}
          RUN_NUMBER: \${{ github.run_number }}
      # ruby/setup-ruby and gem install fastlane, as for Recipes
      - run: fastlane supply --aab app/build/outputs/bundle/release/app-release.aab --track internal --package_name com.example.news
        env:
          SUPPLY_JSON_KEY_DATA: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}
# Production stays a person's click: Create new release > Add from library

# The whole path
# your server -> FCM -> NewsMessagingService.onMessageReceived
#   -> showAlert on breaking or local -> push-sync books SyncWorker -> Room
#   -> a tap: TaskStackBuilder opens https://news.example.com/article/a7, with the list behind it`,
        remember: 'Testing tracks first, a full first release, then every update in stages, halted when crashes rise and fixed with a higher versionCode.',
        terms: [
          { term: 'staged rollout', def: 'Releasing an update to a share of users first, like 10%, and raising it while crash numbers stay calm. Only for updates, not the first release.' },
          { term: 'halt (a rollout)', def: 'Stopping a staged rollout, so no more users get that version. Users who already have it keep it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'News 1.2 fixes the crash in 1.1, whose versionCode is 2. Give it a number Play accepts.', code: `defaultConfig {
    versionCode = [[3]]
    versionName = "1.2"
}`, why: 'Every upload needs a higher <code>versionCode</code> than the last one, and 2 is taken.' },
          { type: 'bug', prompt: 'The server starts sending <code>"type": "live"</code>. On News 1.0, this version of the code posts live updates on the breaking channel, with a heading that makes no sense. Tap the line.', code: `when (message.data["type"]) {
    "breaking" -> showAlert(this, BREAKING, "Breaking news", articleId, title)
    "local" -> showAlert(this, LOCAL, "Local news", articleId, title)
    else -> showAlert(this, BREAKING, "News", articleId, title)
}`, bug: 3, fix: '    else -> return', why: 'A type this version doesn’t know should be ignored. Guessing what it means sends readers alerts the server never meant for them.' },
        ],
        quiz: [
          { q: 'Why does News 1.0 go to internal testing before production?', options: ['The team tries the version Play really delivers, with Play’s signature, before readers get it', 'Production refuses apps that skipped it', 'Internal testing makes the bundle smaller'], a: 0, why: 'Internal testing reaches up to 100 testers within minutes, through Play: the same path readers will use.' },
          { q: 'Can News 1.0, the first release, use a staged rollout?', options: ['No: staged rollouts are for updates; a first release goes out to everyone at once', 'Yes, from 1%', 'Only in closed testing'], a: 0, why: 'Play offers staged rollouts for updates. That is one more reason to test well on the testing tracks first.' },
        ],
        docs: [['Release app updates with staged rollouts', 'https://support.google.com/googleplay/android-developer/answer/6346149'], ['Set up an open, closed, or internal test', 'https://support.google.com/googleplay/android-developer/answer/9845334']],
      },
    ],
  });
})();
