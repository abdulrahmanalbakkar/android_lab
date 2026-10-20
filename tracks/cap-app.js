/* Capstone project: a news reader app, built step by step.
   A project is a track with kind: 'project'. Each lesson is one build step of ONE growing app and carries refs: ['track.lesson'].
   Steps: 1 setup, 2 screens, 3 viewmodel, 4 network, 5 cache, 6 hilt, 7 states, 8 recap.
   Every step's demo is demo(el, { step, predict, panelTitle, frames }): a Lab.ui.player stage with the same phone mock
   (the app as of that step), the project map (UI / ViewModel / Repository / Room / API, parts of this step marked
   "this step") and a side panel. Frame keys: say; kept until changed: screen, offline, refreshing, note, panel, map;
   this frame only: pk (packets on wires), ping, fail, rotate, dark. Classes start with ca-. */
(() => {
  const { h, sleep, hl, replay } = Lab;

  // ---------- the news the fake server publishes, oldest first ----------
  const STORIES = [
    { id: 'a1', source: 'Local', title: 'Library extends weekend opening hours', summary: 'Branches stay open until 6 pm on Saturdays and Sundays from next month.' },
    { id: 'a2', source: 'Transport', title: 'Rail line reopens after two weeks of repairs', summary: 'Trains run the full timetable again, with slow sections near the bridge.' },
    { id: 'a3', source: 'Science', title: 'Researchers map a deep-sea reef', summary: 'A survey team charted the reef with an underwater drone over six dives.' },
    { id: 'a4', source: 'City Desk', title: 'City council approves new bike lanes', summary: 'Work on the first three kilometres starts in spring.' },
    { id: 'a5', source: 'Weather', title: 'Storm expected along the coast on Friday', summary: 'Forecasters expect strong wind and heavy rain from the afternoon.' },
    { id: 'a6', source: 'Sport', title: 'Home team wins the regional final', summary: 'A late goal settled the match in front of a full stadium.' },
  ];
  const story = id => STORIES.find(s => s.id === id);

  // ---------- phone mock ----------
  function phone() {
    const net = h('span', { class: 'ca-net' }, '5G');
    const back = h('span', { class: 'ca-back', 'aria-hidden': 'true', hidden: true }, '‹');
    const title = h('span', { class: 'ca-title' }, 'News');
    const scroll = h('div', { class: 'ca-scroll' });
    const ptr = h('div', { class: 'ca-ptr', 'aria-hidden': 'true' });
    const screen = h('div', { class: 'ca-screen' }, ptr, scroll);
    const el = h('div', { class: 'ca-phone' },
      h('div', { class: 'ca-sb' }, h('span', {}, '9:41'), net),
      h('div', { class: 'ca-appbar' }, back, title), screen);
    return {
      el,
      show(nodes, opts = {}) {
        scroll.replaceChildren(...[].concat(nodes).filter(Boolean));
        title.textContent = opts.title || 'News';
        back.hidden = !opts.back;
      },
      offline(off) { net.textContent = off ? 'offline' : '5G'; net.classList.toggle('off', off); },
      refreshing(on) { ptr.classList.toggle('on', !!on); },
      async rotate() { replay(el, 'ca-rot'); await sleep(1000); el.classList.remove('ca-rot'); },
      async dark(ms) { el.classList.add('ca-dark'); await sleep(ms); el.classList.remove('ca-dark'); },
    };
  }
  const card = (a, fresh) => h('div', { class: 'ca-card' + (fresh ? ' ca-fresh' : '') }, h('b', {}, a.title), h('small', {}, a.source));
  const detailView = a => h('div', { class: 'ca-detail drop-in' }, h('small', {}, a.source), h('h4', {}, a.title), h('p', {}, a.summary),
    h('div', { class: 'ca-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  const center = ({ spin, title, note, btn, hello } = {}) => h('div', { class: 'ca-center' },
    spin ? h('span', { class: 'ca-spin', 'aria-hidden': 'true' }) : null,
    hello ? h('span', { class: 'ca-hello' }, hello) : null,
    title ? h('b', {}, title) : null, note ? h('span', {}, note) : null,
    btn ? h('span', { class: 'ca-btn' }, btn) : null);
  // screen: { blank } | { hello } | { list: ids, fresh: ids } | { detail: id } | { spin, note } | { msg: { title, note, btn } }
  function paintScreen(ph, s = { blank: true }, note) {
    if (s.detail) {
      const a = story(s.detail);
      ph.show(a ? detailView(a) : center({ title: 'Article not found' }), { title: 'Article', back: true });
    } else if (s.list) {
      ph.show([note ? h('div', { class: 'ca-note' }, note) : null, ...s.list.map(id => card(story(id), (s.fresh || []).includes(id)))]);
    } else if (s.hello) ph.show(center({ hello: s.hello }));
    else if (s.spin) ph.show(center({ spin: true, note: s.note }));
    else if (s.msg) ph.show(center(s.msg));
    else ph.show([]);
  }

  // ---------- the project map: the app's parts, and the step that adds or changes each ----------
  const LAYER = { ui: 'UI', vm: 'ViewModel', repo: 'Repository', db: 'Room', api: 'API' };
  const PARTS = {
    ui: [[1, 'MainActivity'], [2, 'ArticleListScreen · ArticleDetailScreen'], [7, 'PullToRefreshBox · when']],
    vm: [[3, 'NewsViewModel · ArticleViewModel'], [7, 'NewsViewModel.refresh()']],
    repo: [[3, 'FakeNewsRepository'], [4, 'OnlineNewsRepository'], [5, 'OfflineFirstNewsRepository']],
    api: [[4, 'NewsApi']],
    db: [[5, 'ArticleDao · NewsDatabase']],
  };
  function spec(step) {
    const s = { hilt: step >= 6 ? (step === 6 ? 'new' : 'have') : null };
    for (const [k, list] of Object.entries(PARTS)) {
      const got = list.filter(p => p[0] <= step).pop();
      s[k] = !got ? ['todo'] : [step === 8 ? 'lit' : got[0] === step ? 'new' : 'have', got[1]];
    }
    return s;
  }
  function arch(sp) {
    const nodes = {}, wires = {};
    const node = k => {
      const lab = h('span', {});
      const n = h('div', { class: 'ca-node' }, h('b', {}, LAYER[k]), lab, h('em', {}, 'this step'));
      nodes[k] = Object.assign(n, { lab });
      return n;
    };
    const wire = (k, label) => {
      const pk = h('span', { class: 'ca-pk' });
      const w = h('div', { class: 'ca-wire' }, h('span', { class: 'ca-wl' }, label), pk);
      wires[k] = Object.assign(w, { pk });
      return w;
    };
    const el = h('div', { class: 'ca-arch' + (sp.hilt ? ' ca-hilt' : '') + (sp.hilt === 'new' ? ' ca-hilt-new' : ''), 'aria-label': 'Project map' },
      sp.hilt ? h('span', { class: 'ca-hiltlab' }, sp.hilt === 'new' ? 'Hilt builds all of this · this step' : 'Built by Hilt') : null,
      node('ui'), wire('uv', '↑ StateFlow · ↓ events'),
      node('vm'), wire('vr', '↑ Flow<List<Article>> · ↓ refresh()'),
      node('repo'),
      h('div', { class: 'ca-split' }, wire('rd', '↕ read / write'), wire('ra', '↕ suspend call')),
      h('div', { class: 'ca-split' }, node('db'), node('api')));
    return Object.assign(el, {
      ping(k) { replay(nodes[k], 'ping'); },
      pkt(k, text, cls = '') { wires[k].pk.replaceChildren(h('span', { class: `ca-pkt drop-in ${cls}` }, text)); },
      clear() { Object.values(wires).forEach(w => w.pk.replaceChildren()); },
      fail(k) { nodes[k].classList.add('fail'); replay(nodes[k], 'shake'); },
      set(k, state, label) { nodes[k].className = `ca-node ${state}`; nodes[k].lab.textContent = label || 'not built yet'; },
    });
  }

  // ---------- the step demo ----------
  const KEEP = ['screen', 'offline', 'refreshing', 'note', 'panel', 'map'];
  function demo(el, { step, predict, panelTitle = '', frames }) {
    const ph = phone();
    const base = spec(step);
    const A = arch(base);
    const body = h('div', { class: 'ca-pbody' });
    const stage = h('div', { class: 'ca-top' }, ph.el, h('div', { class: 'ca-side' }, A,
      h('div', { class: 'ca-panel' }, h('span', { class: 'ca-cap' }, panelTitle), body)));
    Lab.ui.player(el, { frames, predict, stage, speed: 2600, draw(f, i) {
      const st = {};
      frames.slice(0, i + 1).forEach(x => KEEP.forEach(k => { if (x[k] !== undefined) st[k] = x[k]; }));
      Object.keys(LAYER).forEach(k => { const v = (st.map && st.map[k]) || base[k]; A.set(k, v[0], v[1]); });
      A.clear();
      Object.entries(f.pk || {}).forEach(([k, v]) => { const [t, tone] = [].concat(v); A.pkt(k, t, tone); });
      [].concat(f.ping || []).forEach(k => A.ping(k));
      [].concat(f.fail || []).forEach(k => A.fail(k));
      ph.offline(!!st.offline);
      ph.refreshing(!!st.refreshing);
      paintScreen(ph, st.screen, st.note);
      body.replaceChildren();
      if (typeof st.panel === 'function') st.panel(body); else if (st.panel) body.innerHTML = st.panel;
      if (f.rotate) ph.rotate();
      if (f.dark) ph.dark(500);
    } });
  }

  // ---------- side panels: each returns node => { ... } for a frame's panel ----------
  // A file: lines starting with [ are section heads; hits are line numbers (0-based) to light up, bad ones to mark red.
  const file = (lines, hits = [], bad = []) => node => node.append(h('div', { class: 'ca-toml' }, lines.map((l, i) =>
    h('div', { class: (l.startsWith('[') || l.startsWith('//') || l.startsWith('#') ? 'ca-thead' : 'ca-trow') + (hits.includes(i) ? ' on' : '') + (bad.includes(i) ? ' bad' : '') }, l))));
  // The back stack, bottom first.
  const stack = routes => node => node.append(h('div', { class: 'ca-stack' },
    routes.flatMap((r, i) => [i ? h('span', { class: 'ca-sep' }, '›') : null, h('span', { class: 'ca-route' + (i === routes.length - 1 ? ' top' : ''), html: hl(r) })]).filter(Boolean)));
  // Rows of code-like text; rows starting with * are lit.
  const rows = list => node => node.append(...list.map(r => h('div', { class: 'ca-row' + (r.startsWith('*') ? ' ca-lit' : ''), html: hl(r.replace(/^\*/, '')) })));
  // A JSON body; marks: { line: 'hit' | 'ign' }
  const json = (lines, marks = {}) => node => node.append(h('div', { class: 'ca-json' }, lines.map((l, i) => h('div', { class: 'ca-jl' + (marks[i] ? ' ' + marks[i] : '') }, l))));
  // The articles table in Room.
  const table = (ids, added = []) => node => node.append(h('div', { class: 'ca-table' },
    h('div', { class: 'ca-tr ca-th' }, h('span', {}, 'id'), h('span', {}, 'title')),
    ids.length ? ids.map(id => h('div', { class: 'ca-tr' + (added.includes(id) ? ' add' : '') }, h('span', {}, id), h('span', {}, story(id).title)))
      : h('div', { class: 'ca-tempty' }, 'No rows. The table is empty.')));
  // What Hilt has built: items [name, note, made?]; a plain string is a group head.
  const graph = items => node => node.append(h('div', { class: 'ca-graph' }, items.map(it => typeof it === 'string'
    ? h('div', { class: 'ca-gh' }, it)
    : h('div', { class: 'ca-gi' + (it[2] ? ' made' : '') }, h('span', {}, it[0]), it[1] ? h('small', { html: it[1] }) : null))));
  // NewsUiState and the when that picks the screen; hit = the branch that runs.
  const BRANCHES = ['state.isLoading -> spinner', 'empty && state.isRefreshing -> spinner', 'empty && error != null -> Message(error, "Retry")', 'empty -> Message("No news yet.", "Refresh")', 'else -> note + ArticleList'];
  const uiState = (fields, changed = [], hit = -1) => node => node.append(h('div', { class: 'ca-two' },
    h('div', { class: 'obj ca-obj' }, h('span', { class: 'obj-name' }, 'NewsUiState'),
      fields.map(([k, v]) => h('span', { class: 'field' + (changed.includes(k) ? ' changed' : '') }, `${k} = ${v}`))),
    hit < 0 ? null : h('div', { class: 'when ca-when' }, h('div', { class: 'branch head', html: hl('when {') }),
      BRANCHES.map((b, i) => h('div', { class: 'branch' + (i === hit ? ' ca-hit' : ' ca-dim'), html: hl(b) })), h('div', { class: 'branch head', html: hl('}') }))));
  // A log, newest first: entries [layer, text].
  const log = entries => node => node.append(h('div', { class: 'ca-log' }, entries.slice().reverse().map(([k, t]) =>
    h('div', { class: 'ca-li' }, h('span', { class: `ca-lt ca-lt-${k}` }, LAYER[k]), h('span', { html: t })))));

  const css = `
.ca-top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: start; min-width: 0; }
.ca-side { display: grid; gap: 12px; min-width: 0; align-content: start; }
@media (max-width: 760px) { .ca-top { grid-template-columns: minmax(0, 1fr); } }

.ca-phone { width: 212px; height: 400px; box-sizing: border-box; justify-self: center; border: 8px solid var(--code-bg); border-radius: 30px; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 0 0 1px var(--line), var(--shadow); user-select: none; -webkit-user-select: none; transition: background 0.25s; }
.ca-phone.ca-dark { background: var(--code-bg); }
.ca-phone.ca-dark > * { visibility: hidden; }
.ca-rot { animation: ca-rot 1s ease-in-out; }
@keyframes ca-rot { 35%, 65% { transform: rotate(90deg) scale(0.56); } }
.ca-sb { display: flex; justify-content: space-between; padding: 5px 14px 3px; font: 600 0.62rem var(--mono); color: var(--muted); }
.ca-net.off { color: var(--err); }
.ca-appbar { display: flex; align-items: center; gap: 6px; padding: 6px 12px 8px; min-height: 38px; box-sizing: border-box; font: 700 1rem var(--display); color: var(--ink); background: var(--surface); border-bottom: 1px solid var(--line); }
.ca-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-screen { flex: 1; position: relative; overflow: hidden; min-height: 0; }
.ca-scroll { display: grid; gap: 6px; padding: 8px; align-content: start; height: 100%; box-sizing: border-box; transition: transform 0.25s; }
.ca-card { display: grid; gap: 2px; width: 100%; box-sizing: border-box; text-align: left; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: inherit; transition: background 0.4s, border-color 0.4s; }
.ca-card b { font: 700 0.74rem/1.25 var(--body); }
.ca-card small { font-size: 0.64rem; color: var(--muted); }
.ca-card.ca-fresh { border-color: var(--accent); background: var(--accent-soft); animation: drop-in 0.42s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
.ca-detail { display: grid; gap: 6px; padding: 4px 2px; }
.ca-detail small { font: 600 0.62rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.ca-detail h4 { margin: 0; font: 700 0.95rem/1.25 var(--display); color: var(--ink); }
.ca-detail p { margin: 0; font-size: 0.74rem; line-height: 1.45; color: var(--ink); }
.ca-lines { display: grid; gap: 5px; margin-top: 4px; }
.ca-lines i { display: block; height: 6px; border-radius: 3px; background: var(--sunk); }
.ca-lines i:nth-child(2) { width: 85%; }
.ca-lines i:nth-child(3) { width: 60%; }
.ca-center { display: grid; gap: 8px; place-items: center; align-content: center; text-align: center; min-height: 100%; padding: 12px; box-sizing: border-box; font-size: 0.76rem; color: var(--muted); }
.ca-center b { color: var(--ink); font-size: 0.86rem; }
.ca-hello { font: 700 1rem var(--display); color: var(--ink); }
.ca-spin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--sunk); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.ca-btn { font: 700 0.74rem var(--body); padding: 5px 14px; border-radius: 999px; border: 1px solid var(--accent); color: var(--accent); }
.ca-back { color: var(--ink); font: 700 1.3rem/1 var(--body); padding: 0 6px 2px 0; }
.ca-note { padding: 6px 9px; border-radius: 8px; background: var(--warm-soft); color: var(--ink); font-size: 0.68rem; font-weight: 700; }
.ca-ptr { position: absolute; left: 50%; top: 0; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; transform: translateY(-36px); transition: transform 0.25s; z-index: 2; pointer-events: none; }
.ca-ptr::after { content: ""; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid var(--sunk); border-top-color: var(--accent); }
.ca-ptr.on { transform: translateY(10px); }
.ca-ptr.on::after { animation: spin 0.8s linear infinite; }

.ca-arch { display: grid; gap: 2px; padding: 10px; border-radius: 14px; background: var(--bg); border: 2px dashed transparent; min-width: 0; position: relative; transition: border-color 0.3s; }
.ca-arch.ca-hilt { border-color: var(--line); padding-top: 28px; }
.ca-arch.ca-hilt-new { border-color: var(--accent); }
.ca-hiltlab { position: absolute; top: 7px; left: 12px; right: 12px; font: 600 0.64rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-hilt-new .ca-hiltlab { color: var(--accent); }
.ca-node { display: grid; gap: 1px; padding: 6px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; position: relative; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.ca-node > b { font: 600 0.62rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.ca-node > span { font: 600 0.76rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.ca-node > em { display: none; position: absolute; top: 5px; right: 7px; font: 600 0.58rem var(--mono); font-style: normal; padding: 1px 6px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); }
.ca-node.new, .ca-node.lit { border-color: var(--accent); background: var(--accent-soft); }
.ca-node.new > em { display: block; }
.ca-node.todo { border-style: dashed; opacity: 0.5; }
.ca-node.todo > span { color: var(--muted); font-style: italic; font-weight: 500; }
.ca-node.ping { animation: ca-ping 0.6s ease-out; }
@keyframes ca-ping { 30% { box-shadow: 0 0 0 4px var(--hi); } }
.ca-node.fail { border-color: var(--err); background: var(--err-soft); }
.ca-wire { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 3px 8px; min-height: 24px; padding: 2px 0; font: 500 0.64rem var(--mono); color: var(--muted); min-width: 0; text-align: center; }
.ca-wl { overflow-wrap: anywhere; min-width: 0; }
.ca-pk { display: inline-flex; min-width: 0; max-width: 100%; }
.ca-pkt { font: 600 0.64rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-pkt.ok { background: var(--ok); color: var(--surface); }
.ca-pkt.err { background: var(--err); color: var(--surface); }
.ca-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; min-width: 0; }

.ca-pbody { display: grid; gap: 6px; min-width: 0; }
.ca-two { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 8px; align-items: start; min-width: 0; }
@media (max-width: 1100px) { .ca-two { grid-template-columns: minmax(0, 1fr); } }
.ca-row.ca-lit { color: var(--accent); }
.ca-panel { display: grid; gap: 8px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); min-width: 0; align-content: start; }
.ca-cap { font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.ca-obj { min-width: 0; font-size: 0.78rem; padding: 10px 12px; overflow-wrap: anywhere; }
.ca-when { padding: 10px; }
.ca-when .branch { font-size: 0.74rem; padding: 3px 8px; }
.when .branch.ca-hit { background: rgba(126, 226, 168, 0.16); border-color: var(--t-k); }
.when .branch.ca-dim { opacity: 0.4; }

.ca-toml { display: grid; gap: 2px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; overflow-x: auto; }
.ca-thead { font: 500 0.74rem/1.4 var(--mono); color: var(--t-c); padding: 2px 8px; white-space: pre; }
.ca-thead.on { background: rgba(126, 226, 168, 0.14); border-radius: 6px; }
.ca-trow { font: 500 0.74rem/1.4 var(--mono); color: var(--code-ink); border-radius: 6px; padding: 2px 8px 2px calc(8px + 2ch); text-indent: -2ch; white-space: pre-wrap; overflow-wrap: anywhere; transition: background 0.2s; }
.ca-trow em { font-style: normal; color: var(--t-k); }
.ca-trow.on { background: rgba(126, 226, 168, 0.14); }
.ca-trow.bad { background: rgba(255, 138, 155, 0.18); }
.ca-trow.bad em { color: var(--t-e); }

.ca-stack { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 34px; }
.ca-route { font: 600 0.74rem var(--mono); padding: 5px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; }
.ca-route.top { border-color: var(--accent); background: var(--accent-soft); }
.ca-sep { color: var(--muted); font: 600 0.8rem var(--mono); }

.ca-row { font: 600 0.76rem/1.45 var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }

.ca-json { display: grid; background: var(--code-bg); border-radius: 12px; padding: 8px 4px; overflow-x: auto; min-width: 0; }
.ca-jl { font: 500 0.72rem/1.55 var(--mono); color: var(--code-ink); white-space: pre; padding: 0 8px; border-radius: 4px; transition: background 0.2s, opacity 0.2s; }
.ca-jl.hit { background: rgba(126, 226, 168, 0.16); }
.ca-jl.ign { opacity: 0.45; text-decoration: line-through; }

.ca-table { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); min-width: 0; }
.ca-tr { display: grid; grid-template-columns: 2.6em minmax(0, 1fr); gap: 6px; padding: 5px 9px; border-top: 1px solid var(--line); font: 500 0.74rem var(--mono); color: var(--ink); transition: background 0.4s; }
.ca-tr > span { overflow-wrap: anywhere; }
.ca-tr.ca-th { border-top: 0; font-weight: 700; color: var(--muted); background: var(--sunk); }
.ca-tr.add { background: var(--ok-soft); }
.ca-tempty { padding: 10px 9px; font-size: 0.78rem; color: var(--muted); border-top: 1px solid var(--line); }

.ca-graph { display: grid; gap: 4px; min-width: 0; }
.ca-gh { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-top: 4px; }
.ca-gi { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 5px 9px; border-radius: 8px; border: 1px dashed var(--line); background: var(--surface); font: 600 0.74rem var(--mono); color: var(--muted); transition: border-color 0.25s, color 0.25s, opacity 0.25s; min-width: 0; }
.ca-gi > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.ca-gi.made { border-style: solid; border-color: var(--accent); color: var(--ink); }
.ca-gi small { font: 500 0.66rem var(--mono); color: var(--muted); }

.ca-log { display: grid; gap: 4px; min-height: 120px; align-content: start; }
.ca-li { display: grid; grid-template-columns: 6.6em minmax(0, 1fr); gap: 8px; align-items: baseline; font: 500 0.74rem var(--mono); color: var(--ink); }
.ca-li > span:last-child { overflow-wrap: anywhere; }
.ca-lt { justify-self: start; font-size: 0.64rem; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.ca-lt-ui { background: var(--accent-soft); color: var(--accent); }
.ca-lt-vm { background: var(--ok-soft); color: var(--ok); }
.ca-lt-db, .ca-lt-repo { background: var(--warm-soft); color: var(--warm); }
.ca-lt-api { background: var(--err-soft); color: var(--err); }
`;

  Lab.addTrack({
    id: 'capapp',
    title: 'News reader',
    kind: 'project',
    description: 'Build one news reader app step by step, from an empty project to an app that keeps working offline.',
    builds: 'News: an Android app that lists headlines from a server, opens each article, refreshes with a pull, keeps working offline from a Room copy, shows clear loading, empty and error screens, and is wired together with Hilt.',
    group: 'Building apps',
    requires: ['compose', 'flow', 'arch'],
    css,
    lessons: [
      // 1 setup ─────────────────────────────────────────────
      {
        id: 'setup',
        title: 'Project setup',
        tagline: 'Plan the app, make the project, and list its libraries in one catalog file.',
        goals: ['Name what the News app must do and the eight steps that build it', 'Read a version catalog: versions, libraries and plugins', 'Add a library to the app through its libs. name'],
        level: 'intermediate', introduces: ['alias'],
        refs: ['android.project-files', 'android.first-app', 'arch.layers'],
        body: `
<p>In this project you build one whole app, from an empty project to something you could hand to a friend: <b>News</b>. It lists headlines from a server, opens an article when you tap it, and keeps working on a train with no signal. It needs every part of the data and architecture tracks: screens, ViewModels, a repository, Room, Retrofit and Hilt. Each of the eight steps adds a few of them and ends with an app that runs. The map in every demo shows the parts that exist so far.</p>
<p>Start in Android Studio with <b>New Project › Empty Activity</b>, named News, package <code>com.example.news</code>. The new project already has the file <code>gradle/libs.versions.toml</code> you saw in the Android track. It is the <em>version catalog</em>: one list of every library and plugin the app uses, with their versions. <code>[versions]</code> holds the numbers, <code>[libraries]</code> names each library and points to its number with <code>version.ref</code>, and <code>[plugins]</code> does the same for Gradle plugins. One more change from the new project: set <code>compileSdk</code> to 37, because the newer libraries this app adds need it. <code>targetSdk</code> stays 36.</p>
<p>In <code>app/build.gradle.kts</code> you then use the catalog by name: the entry <code>androidx-activity-compose</code> becomes <code>libs.androidx.activity.compose</code>, each dash turning into a dot, and a plugin is added with <code>alias(libs.plugins.…)</code>. To update a library later, you change one number in <code>[versions]</code>.</p>
<p>The Compose libraries are different: they have no version of their own. The <em>Compose BOM</em> (bill of materials) is a list of Compose versions that work together. Add it once with <code>platform(libs.androidx.compose.bom)</code>, and it fills in the version of every Compose library. Your new project may list a few more entries, for tests, and newer numbers; that’s fine. Each later step adds the lines it needs.</p>`,
        visual(el) {
          const toml = ['# gradle/libs.versions.toml', '[versions]', 'agp = "9.4.0"', 'kotlin = "2.4.21"', 'composeBom = "2026.09.00"', 'activityCompose = "1.13.0"',
            '[libraries]', 'androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }',
            'androidx-material3 = { group = "androidx.compose.material3", name = "material3" }',
            'androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }',
            '[plugins]', 'android-application = { id = "com.android.application", version.ref = "agp" }',
            'kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }'];
          const gradle = ['// app/build.gradle.kts', 'plugins {', '    alias(libs.plugins.android.application)', '    alias(libs.plugins.kotlin.compose)', '}',
            'dependencies {', '    implementation(platform(libs.androidx.compose.bom))', '    implementation(libs.androidx.material3)', '    implementation(libs.androidx.activity.compose)', '}'];
          demo(el, {
            step: 1,
            panelTitle: 'Build files',
            predict: {
              q: 'Months later, a newer <code>activity-compose</code> comes out. Where do you change its number?',
              options: ['On one line under <code>[versions]</code>', 'In every file that uses the library', 'In <code>MainActivity.kt</code>'],
              a: 0,
              why: 'The number lives once, under <code>[versions]</code>. Everything else points to it by name.',
            },
            frames: [
              { screen: { blank: true }, map: { ui: ['todo'] }, panel: file(toml), say: 'An empty project. The map shows the whole plan: five parts, all still dashed. Each step fills some in. The panel shows the version catalog. Long lines are wrapped to fit here; in the file, each entry is one line.' },
              { panel: file(toml, [5, 9]), say: '<code>androidx-activity-compose</code> names the library, and <code>version.ref = "activityCompose"</code> points to its number under <code>[versions]</code>.' },
              { panel: file(gradle, [8]), say: 'In <code>app/build.gradle.kts</code> the same entry is <code>libs.androidx.activity.compose</code>: each dash became a dot. Android Studio suggests these names as you type.' },
              { panel: file(gradle, [2, 3]), say: 'Plugins come from the catalog too, with <code>alias</code>. One builds the Android app; the other lets the Kotlin compiler handle <code>@Composable</code> functions. Its version is the Kotlin version.' },
              { panel: file(toml, [4, 7, 8]), say: '<code>androidx-material3</code> has no version. The BOM line, added with <code>platform(...)</code>, fills it in, together with every other Compose library.' },
              { screen: { hello: 'Hello, News' }, map: {}, ping: 'ui', panel: file(gradle, [6, 7, 8]), say: 'Sync, then Run. The app shows its first screen, and the map gets its first part: <code>MainActivity</code>.' },
              { panel: file(toml, [5]), say: 'To update a library, change its one line under <code>[versions]</code> and sync again. Every place that uses the name gets the new number.' },
            ],
          });
        },
        code: `# gradle/libs.versions.toml (# starts a comment in this file)
[versions]
agp = "9.4.0"                 # the Android Gradle plugin
kotlin = "2.4.21"
composeBom = "2026.09.00"
activityCompose = "1.13.0"

[libraries]
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }   # version from the BOM
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }

// build.gradle.kts of the project: every plugin, not applied here
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.compose) apply false
}

// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.news"
    compileSdk = 37                       // Navigation 2.10 and Lifecycle 2.11 (steps 2 and 3) need 37
    defaultConfig {
        applicationId = "com.example.news"
        minSdk = 26
        targetSdk = 36
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.activity.compose)
}

// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Text("Hello, News")
            }
        }
    }
}`,
        remember: 'Every library and version lives once in libs.versions.toml; build files use them as libs.…, and the Compose BOM picks the Compose versions.',
        mistakes: [
          { title: 'Leaving out the BOM', bad: `dependencies {
    implementation(libs.androidx.material3)   // no version anywhere
}`, good: `dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
}`, why: 'The catalog gives <code>material3</code> no version on purpose. Without the BOM nothing supplies one, and Gradle can’t download the library, so the sync fails.' },
        ],
        terms: [
          { term: 'version catalog', def: 'The file <code>gradle/libs.versions.toml</code>: every library and plugin the project uses, with its version, under one name.' },
          { term: 'libs', def: 'How build files read the catalog: <code>libs.androidx.material3</code> is the catalog entry <code>androidx-material3</code>.' },
          { term: 'alias', def: '<code>alias(libs.plugins.kotlin.compose)</code> adds a plugin from the catalog to a build file.' },
          { term: 'Compose BOM', def: 'A list of Compose versions that work together. Added with <code>platform(...)</code>, it gives every Compose library its version.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use the catalog entry <code>androidx-activity-compose</code>, and let the BOM pick the Compose versions.', code: `dependencies {
    implementation([[platform]](libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.[[activity]].compose)
}`, why: 'The BOM works only inside <code>platform(...)</code>. In the <code>libs</code> name, every dash of the catalog entry becomes a dot.' },
          { type: 'bug', prompt: 'Sync fails: Gradle can’t find what one line asks for. Tap it.', code: `[versions]
activityCompose = "1.13.0"

[libraries]
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activity" }`, bug: 4, fix: 'androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }', why: '<code>version.ref</code> must be the exact name of a line under <code>[versions]</code>. There is no version called <code>activity</code>.' },
        ],
        quiz: [
          { q: 'The catalog has the entry <code>androidx-navigation-compose</code>. How does <code>app/build.gradle.kts</code> name it?', options: ['<code>libs.androidx.navigation.compose</code>', '<code>libs.androidx-navigation-compose</code>', '<code>"androidx-navigation-compose"</code>'], a: 0, why: 'In the <code>libs</code> name each dash becomes a dot.' },
          { q: 'Why does <code>androidx-material3</code> have no version in the catalog?', options: ['The Compose BOM supplies it', 'Gradle always picks the newest one', 'Material 3 comes with Android Studio'], a: 0, why: 'The BOM, added with <code>platform(...)</code>, gives every Compose library a version that works with the others.' },
          { q: 'Why does every step of this project end with an app that runs?', options: ['When something breaks, the cause is in the few lines just added', 'Gradle can only build small apps', 'So the version catalog stays short'], a: 0, why: 'The same idea as in the budget tracker project: small steps, each one checked.' },
        ],
        docs: [['Migrate your build to version catalogs', 'https://developer.android.com/build/migrate-to-catalogs'], ['Use a Bill of Materials', 'https://developer.android.com/develop/ui/compose/bom']],
      },

      // 2 screens ─────────────────────────────────────────────
      {
        id: 'screens',
        title: 'Screens and navigation',
        tagline: 'A list of headlines and a detail screen, with made-up articles for now.',
        goals: ['Describe an article with a data class and fill the list with sample data', 'Build the list and detail screens and move between them with routes', 'Find one item in a list with firstOrNull'],
        level: 'intermediate', introduces: ['firstOrNull'],
        refs: ['compose.navigation', 'compose.lazy-keys', 'compose.scaffold', 'compose.hoisting'],
        body: `
<p>Before any server or database, the app needs screens to show. If the screens work with made-up data, every later step only changes where the data comes from. So this step writes <code>sampleArticles</code>: four articles typed into the code, as a stand-in.</p>
<p>An article is a data class: <code>Article(id, title, source, summary, publishedAt)</code>. <code>id</code> is a <code>String</code> like <code>"a3"</code>, because that is what the server will send. <code>publishedAt</code> is the time it came out, written like <code>"2026-10-20T08:50:00Z"</code> (year, month, day, then the time). The list screen is a <code>LazyColumn</code> with one row per article, keyed by its id. Tapping a row calls <code>onOpen(article.id)</code>: the screen only reports the event, as you did when hoisting state.</p>
<p>Two routes name the screens: <code>ArticleList</code>, and <code>ArticleDetail(val id: String)</code>, which carries the id of the article to open. A route carries the id, never the whole article: it stays small, and the detail screen looks the article up itself. <code>firstOrNull { it.id == route.id }</code> gives the first article for which the lambda is true, or <code>null</code> when there is none, so the detail screen takes an <code>Article?</code> and shows nothing for an unknown id.</p>`,
        visual(el) {
          const list = { list: ['a4', 'a3', 'a2', 'a1'] };
          demo(el, {
            step: 2,
            panelTitle: 'Back stack, bottom first',
            predict: {
              q: 'The user opens the reef article, then swipes Back. What is on the back stack after Back?',
              options: ['<code>ArticleList</code> only', '<code>ArticleList</code> and <code>ArticleDetail("a3")</code>', 'Nothing: the app closes'],
              a: 0,
              why: 'Back removes the top route. The list was underneath all along.',
            },
            frames: [
              { screen: list, panel: stack(['ArticleList']), say: '<code>NavHost</code> starts at <code>ArticleList</code>. The screen shows <code>sampleArticles</code>, the four made-up articles, newest first.' },
              { screen: { detail: 'a3' }, panel: stack(['ArticleList', 'ArticleDetail(id = "a3")']), ping: 'ui', say: 'A tap calls <code>onOpen("a3")</code>, and <code>NewsNavHost</code> calls <code>navController.navigate(ArticleDetail("a3"))</code>. The new route goes on top, carrying only the id.' },
              { say: '<code>composable&lt;ArticleDetail&gt;</code> reads the route with <code>toRoute()</code> and looks the id up: <code>sampleArticles.firstOrNull { it.id == route.id }</code>.' },
              { screen: list, panel: stack(['ArticleList']), say: 'Back removes <code>ArticleDetail</code> from the stack. The list underneath shows again.' },
              { screen: { detail: 'a4' }, panel: stack(['ArticleList', 'ArticleDetail(id = "a4")']), say: 'Another tap, another route: <code>ArticleDetail("a4")</code>. One detail screen shows any article; the id says which.' },
              { rotate: true, say: 'Turn the phone. The Activity is made again, but Navigation saved the stack (the routes are <code>@Serializable</code>), so the same article is still open.' },
            ],
          });
        },
        code: `data class Article(
    val id: String,            // like "a3"
    val title: String,
    val source: String,
    val summary: String,
    val publishedAt: String,   // like "2026-10-20T08:50:00Z"
)

val sampleArticles = listOf(
    Article("a4", "City council approves new bike lanes", "City Desk", "Work on the first three kilometres starts in spring.", "2026-10-20T08:50:00Z"),
    Article("a3", "Researchers map a deep-sea reef", "Science", "A survey team charted the reef with an underwater drone over six dives.", "2026-10-20T08:15:00Z"),
    // ... two more
)

@Serializable object ArticleList
@Serializable data class ArticleDetail(val id: String)

@Composable
fun NewsNavHost() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = ArticleList) {
        composable<ArticleList> {
            ArticleListScreen(sampleArticles, onOpen = { id -> navController.navigate(ArticleDetail(id)) })
        }
        composable<ArticleDetail> { entry ->
            val route: ArticleDetail = entry.toRoute()
            ArticleDetailScreen(sampleArticles.firstOrNull { it.id == route.id })   // null if no such id
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleListScreen(articles: List<Article>, onOpen: (String) -> Unit) {
    Scaffold(topBar = { TopAppBar(title = { Text("News") }) }) { innerPadding ->
        LazyColumn(modifier = Modifier.padding(innerPadding)) {
            items(articles, key = { article -> article.id }) { article ->
                ArticleRow(article, onClick = { onOpen(article.id) })
            }
        }
    }
}

@Composable
fun ArticleRow(article: Article, onClick: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().clickable { onClick() }.padding(16.dp)) {
        Text(article.title, fontWeight = FontWeight.Bold)
        Text(article.source)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleDetailScreen(article: Article?) {
    Scaffold(topBar = { TopAppBar(title = { Text("Article") }) }) { innerPadding ->
        if (article != null) {
            Column(modifier = Modifier.padding(innerPadding).padding(16.dp)) {
                Text(article.source)
                Text(article.title, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text(article.summary)
            }
        }
    }
}

// MainActivity: setContent { MaterialTheme { NewsNavHost() } }

// libs.versions.toml, new lines:
// [versions]   navigation = "2.10.2"
// [libraries]  androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigation" }
// [plugins]    kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
// app/build.gradle.kts: alias(libs.plugins.kotlin.serialization) and implementation(libs.androidx.navigation.compose)
// (and alias(libs.plugins.kotlin.serialization) apply false in the project's build.gradle.kts)`,
        remember: 'Build the screens with sample data first; a route carries only the id, and the detail screen looks the article up.',
        mistakes: [
          { title: 'Putting the whole article in the route', bad: `@Serializable data class ArticleDetail(
    val id: String,
    val title: String,
    val summary: String,   // the whole text travels with the route
)`, good: `@Serializable data class ArticleDetail(val id: String)

// the detail screen looks the article up by id`, why: 'Navigation saves every route on the back stack, so big routes cost memory. And a copy in the route goes stale when the article changes. The id is enough.' },
        ],
        terms: [
          { term: 'sample data', def: 'Made-up values typed into the code, like <code>sampleArticles</code>, so screens can be built before the real data exists.' },
          { term: 'firstOrNull', def: '<code>list.firstOrNull { it.id == "a3" }</code> gives the first item for which the lambda is <code>true</code>, or <code>null</code> if there is none.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the route, and find its article in the list (or <code>null</code>).', code: `composable<ArticleDetail> { entry ->
    val route: ArticleDetail = entry.[[toRoute]]()
    ArticleDetailScreen(sampleArticles.[[firstOrNull]] { it.id == route.id })
}`, why: '<code>toRoute()</code> gives back the route with its id. <code>firstOrNull</code> returns <code>null</code> for an id that isn’t in the list, instead of crashing.' },
          { type: 'bug', prompt: 'Tapping a row should open that article. Tap the line that breaks it.', code: `items(articles, key = { article -> article.id }) { article ->
    ArticleRow(article, onClick = { onOpen("a1") })
}`, bug: 1, fix: '    ArticleRow(article, onClick = { onOpen(article.id) })', why: 'Every row would report the same id, so every tap opens article a1. Each row must pass its own <code>article.id</code>.' },
        ],
        quiz: [
          { q: 'Why does <code>ArticleDetail</code> carry only the id?', options: ['A small route is cheap to save, and the screen looks up the current article', 'Routes can only hold one property', 'Strings are faster than data classes'], a: 0, why: 'Navigation keeps every route on the back stack. The id is all the detail screen needs to find the rest.' },
          { q: '<code>sampleArticles.firstOrNull { it.id == "zz" }</code>, and no article has that id. What do you get?', options: ['<code>null</code>', 'The first article', 'A crash'], a: 0, why: 'The <code>OrNull</code> in the name says it: when nothing matches, the answer is <code>null</code>.' },
          { q: 'Why does <code>ArticleRow</code> take <code>onClick</code> instead of the <code>navController</code>?', options: ['The row only reports the tap; <code>NewsNavHost</code> decides what happens', 'Rows can’t use objects', 'Compose forbids navigation in rows'], a: 0, why: 'Events go up, as with hoisting. Then the row works anywhere, and only one place knows the routes.' },
        ],
        docs: [['Type safety in Navigation Compose', 'https://developer.android.com/guide/navigation/design/type-safety'], ['Lists and grids', 'https://developer.android.com/develop/ui/compose/lists']],
      },

      // 3 viewmodel ─────────────────────────────────────────────
      {
        id: 'viewmodel',
        title: 'ViewModel and state',
        tagline: 'A repository interface, a fake behind it, and ViewModels that hold each screen’s state.',
        goals: ['Hide where articles come from behind a NewsRepository interface', 'Give the list a NewsViewModel with one NewsUiState, and the detail screen an ArticleViewModel', 'Show a spinner while the state is still loading'],
        level: 'intermediate', introduces: ['CircularProgressIndicator'],
        refs: ['arch.viewmodel', 'arch.ui-state', 'arch.udf', 'arch.repository', 'flow.lifecycle'],
        body: `
<p>Right now the screens read <code>sampleArticles</code> directly. In step 4 the articles come from a server, in step 5 from Room. If the screens knew about either, every step would rewrite them. So the screens get their data from ViewModels, and the ViewModels from a repository.</p>
<p>The repository is an interface, <code>NewsRepository</code>: <code>articles</code>, a <code>Flow</code> of the whole list, and <code>article(id)</code>, a <code>Flow</code> of one article. For now <code>FakeNewsRepository</code> keeps <code>sampleArticles</code> in a <code>MutableStateFlow</code>. Later steps add real repositories behind the same interface, and the ViewModels never notice.</p>
<p><code>NewsViewModel</code> holds the list screen’s state in one object, <code>NewsUiState(articles, isLoading)</code>. In <code>init</code> it collects <code>repository.articles</code> and writes a copy of the state with the list. <code>ArticleViewModel</code> is smaller: it turns <code>repository.article(id)</code> into a <code>StateFlow</code> with <code>stateIn</code>. Each screen makes its own with <code>viewModel { }</code>. The repository is built once, outside the screens and outside <code>onCreate</code>: a top-level <code>val newsRepository</code>, made once while the app runs, so a rotation doesn’t build another one.</p>
<p>While <code>isLoading</code> is true, the list screen shows <code>CircularProgressIndicator()</code>, Material’s spinning circle, in a small <code>Spinner()</code> function that puts it in the middle of the screen. With the fake, loading takes no time, but with a server it will.</p>`,
        visual(el) {
          demo(el, {
            step: 3,
            panelTitle: 'Alive right now',
            predict: {
              q: 'The list is on screen and the user turns the phone. What happens to <code>NewsViewModel</code>?',
              options: ['The same object stays, so the list shows at once', 'A new one is made and loads everything again', 'It is cleared and the list goes blank'],
              a: 0,
              why: 'A ViewModel outlives the Activity during rotation. <code>viewModel { }</code> hands back the one that already exists.',
            },
            frames: [
              { screen: { spin: true }, ping: 'vm', pk: { uv: 'isLoading = true' }, panel: rows(['Activity #1', '*NewsViewModel @4a1 (new)']), say: 'The list screen calls <code>viewModel { NewsViewModel(repository) }</code>. There is none yet, so the lambda runs. The first state has <code>isLoading = true</code>: a spinner.' },
              { screen: { list: ['a4', 'a3', 'a2', 'a1'] }, ping: ['repo', 'vm', 'ui'], pk: { vr: ['List<Article>(4)', 'ok'], uv: ['NewsUiState', 'ok'] }, panel: rows(['Activity #1', 'NewsViewModel @4a1', '*uiState: 4 articles, isLoading = false']), say: '<code>init</code> collects <code>repository.articles</code>. The fake hands over the four samples, the ViewModel writes a copy of the state with them, and the screen follows.' },
              { rotate: true, panel: rows(['*Activity #2 (new)', 'NewsViewModel @4a1 (the same)', 'uiState: 4 articles, isLoading = false']), say: 'Rotation: Activity #2 is new, but <code>viewModel { }</code> hands back the same @4a1 and skips the lambda. Its state is already there: no spinner, no new collecting.' },
              { screen: { detail: 'a3' }, ping: 'vm', pk: { vr: 'article("a3")' }, panel: rows(['Activity #2', 'NewsViewModel @4a1', '*ArticleViewModel @9c0 (new, id = "a3")']), say: 'Opening an article makes a second ViewModel, for that screen: <code>ArticleViewModel</code>, which watches <code>repository.article("a3")</code>.' },
              { screen: { list: ['a4', 'a3', 'a2', 'a1'] }, panel: rows(['Activity #2', 'NewsViewModel @4a1', '*ArticleViewModel @9c0: onCleared()']), say: 'Back: the detail screen leaves the stack for good, so its ViewModel is cleared and its <code>viewModelScope</code> is cancelled. The list’s ViewModel stays.' },
              { screen: { blank: true }, dark: true, panel: rows(['*Activity finished', '*NewsViewModel @4a1: onCleared()']), say: 'Back once more closes the app. The Activity finishes, so <code>NewsViewModel</code> is cleared too.' },
            ],
          });
        },
        code: `interface NewsRepository {
    val articles: Flow<List<Article>>
    fun article(id: String): Flow<Article?>
}

// A stand-in until step 4. The ViewModels can't tell the difference.
class FakeNewsRepository : NewsRepository {
    private val all = MutableStateFlow(sampleArticles)
    override val articles: Flow<List<Article>> = all
    override fun article(id: String): Flow<Article?> =
        all.map { list -> list.firstOrNull { it.id == id } }
}

data class NewsUiState(
    val articles: List<Article> = listOf(),
    val isLoading: Boolean = true,      // nothing has arrived yet
)

class NewsViewModel(private val repository: NewsRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(NewsUiState())
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.articles.collect { list ->
                _uiState.value = _uiState.value.copy(articles = list, isLoading = false)
            }
        }
    }
}

class ArticleViewModel(id: String, repository: NewsRepository) : ViewModel() {
    val article: StateFlow<Article?> = repository.article(id)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
}

@Composable
fun NewsNavHost(repository: NewsRepository) {
    val navController = rememberNavController()
    NavHost(navController, startDestination = ArticleList) {
        composable<ArticleList> {
            val viewModel = viewModel { NewsViewModel(repository) }
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            ArticleListScreen(state, onOpen = { id -> navController.navigate(ArticleDetail(id)) })
        }
        composable<ArticleDetail> { entry ->
            val route: ArticleDetail = entry.toRoute()
            val viewModel = viewModel { ArticleViewModel(route.id, repository) }
            val article by viewModel.article.collectAsStateWithLifecycle()
            ArticleDetailScreen(article)
        }
    }
}

@Composable
fun Spinner() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()             // Material's spinning circle, in the middle
    }
}

// ArticleListScreen now takes the state. Inside its Scaffold:
//     Box(modifier = Modifier.padding(innerPadding)) {   // keeps everything below the top bar
//         if (state.isLoading) {
//             Spinner()
//         } else {
//             ArticleList(state.articles, onOpen)     // the LazyColumn from step 2, moved into its own function
//         }
//     }

// One repository for the whole app. A top-level val is made once while the app runs,
// so a rotation (a new Activity, a new onCreate) doesn't build a second one.
val newsRepository: NewsRepository = FakeNewsRepository()

// MainActivity.onCreate:
//     setContent { MaterialTheme { NewsNavHost(newsRepository) } }

// libs.versions.toml, new lines:
// [versions]   lifecycle = "2.11.0"
// [libraries]  androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }
//              androidx-lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }
// app/build.gradle.kts: implementation(...) for both`,
        remember: 'Screens read state from their ViewModel; the ViewModel reads from a NewsRepository interface, so the data source can change behind it.',
        mistakes: [
          { title: 'Building the repository inside viewModel { }', bad: `composable<ArticleList> {
    val viewModel = viewModel { NewsViewModel(FakeNewsRepository()) }
}
composable<ArticleDetail> { entry ->
    val viewModel = viewModel { ArticleViewModel(id, FakeNewsRepository()) }
}`, good: `// top level: one repository for both screens, built once
val newsRepository: NewsRepository = FakeNewsRepository()

// onCreate
setContent { MaterialTheme { NewsNavHost(newsRepository) } }`, why: 'Each screen would get its own repository with its own copy of the articles. Once the articles change in one, the other screen never sees it.' },
        ],
        terms: [
          { term: 'fake repository', def: 'A class that implements the repository interface with ready-made data, like <code>FakeNewsRepository</code>. Useful before the real data exists, and later in tests.' },
          { term: 'CircularProgressIndicator', def: 'Material’s spinning circle. Without a value it spins until it leaves the screen.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the new list into a copy of the state.', code: `repository.articles.collect { list ->
    _uiState.value = _uiState.value.[[copy]](articles = list, isLoading = [[false]])
}`, why: '<code>copy</code> keeps every other field and changes the two you name. The articles are here, so loading is over.' },
          { type: 'bug', prompt: 'The screen code could change the state behind the ViewModel’s back. Tap the line that allows it.', code: `class NewsViewModel(private val repository: NewsRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(NewsUiState())
    val uiState = _uiState
}`, bug: 2, fix: '    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()', why: 'Without a type, <code>uiState</code> is the <code>MutableStateFlow</code> itself, and any screen could set its <code>value</code>. <code>asStateFlow()</code> hands out a read-only view.' },
        ],
        quiz: [
          { q: 'In step 5 a repository that reads from Room replaces the network one. Which classes change?', options: ['Only the new repository and the place that builds it', 'Both ViewModels and both screens', 'Every class in the app'], a: 0, why: 'The ViewModels ask for a <code>NewsRepository</code>, the interface. Any class behind it works.' },
          { q: 'The user opens an article, then goes Back. What happens to its <code>ArticleViewModel</code>?', options: ['It is cleared, and its <code>viewModelScope</code> is cancelled', 'It stays until the app closes', 'It moves to the list screen'], a: 0, why: 'A ViewModel lives as long as its screen’s place on the back stack. Back removes that place.' },
          { q: 'Why does <code>NewsUiState</code> start with <code>isLoading = true</code>?', options: ['Until the first list arrives, the screen should show a spinner, not an empty list', 'Kotlin requires a Boolean to start true', 'So the ViewModel loads twice'], a: 0, why: 'An empty list right at the start would look like “no news”. The spinner says “wait”.' },
        ],
        docs: [['ViewModel overview', 'https://developer.android.com/topic/libraries/architecture/viewmodel'], ['UI layer', 'https://developer.android.com/topic/architecture/ui-layer']],
      },

      // 4 network ─────────────────────────────────────────────
      {
        id: 'network',
        title: 'Loading from the network',
        tagline: 'Real headlines from news.example.com, through Retrofit and a new repository.',
        goals: ['Describe the server’s JSON with @Serializable classes, using @SerialName for a different key', 'Call the API with Retrofit from OnlineNewsRepository', 'Start a refresh from the ViewModel and catch network errors'],
        level: 'intermediate', introduces: ['SerialName'],
        refs: ['data.http-basics', 'data.retrofit', 'data.net', 'arch.repository'],
        body: `
<p>The sample articles never change, but real news does. The server at <code>https://news.example.com/</code> (made up for this project) answers <code>GET v1/headlines</code> with JSON: an object with a list called <code>"articles"</code>. You read that in the data track, so the new pieces here are small.</p>
<p><code>ArticleDto</code> describes one article as the server sends it. The server writes <code>"published_at"</code>, but a Kotlin property is named <code>publishedAt</code>. <code>@SerialName("published_at")</code> on the property links the two names. <code>HeadlinesResponse(val articles: List&lt;ArticleDto&gt;)</code> is the outer object. The server also sends an <code>"author"</code> that the app doesn’t use, so the reader is <code>Json { ignoreUnknownKeys = true }</code>. <code>toArticle()</code> turns each DTO into the app’s own <code>Article</code>.</p>
<p><code>NewsRepository</code> gets one more function, <code>suspend fun refresh()</code>: “get fresh articles now”. <code>OnlineNewsRepository</code> implements it: it calls the API and puts the result in a <code>MutableStateFlow</code> that <code>articles</code> hands out. The fake gets an empty <code>refresh()</code>. The top-level <code>newsRepository</code> is now an <code>OnlineNewsRepository</code>, built next to <code>newsApi</code>. <code>NewsViewModel</code> calls <code>refresh()</code> once in <code>init</code>, in a second <code>launch</code>, and catches the three failures from the data track, <code>IOException</code>, <code>HttpException</code> and <code>SerializationException</code>, so a failed call never crashes the app.</p>
<p>Try the app on a train, though, and the list is empty: the articles lived only in memory, and they were gone when Android closed the app.</p>`,
        visual(el) {
          const J = ['{', '  "articles": [', '    {', '      "id": "a5",', '      "title": "Storm expected along the coast on Friday",', '      "source": "Weather",',
            '      "summary": "Forecasters expect strong wind and heavy rain from the afternoon.",', '      "published_at": "2026-10-20T09:20:00Z",', '      "author": "Lin Park"', '    },', '    (4 more articles)', '  ]', '}'];
          const five = { list: ['a5', 'a4', 'a3', 'a2', 'a1'] };
          demo(el, {
            step: 4,
            panelTitle: 'The server’s answer',
            predict: {
              q: 'Yesterday the app showed five headlines. This morning, on a train with no signal, the user opens it again. What does the list show?',
              options: ['An empty list', 'Yesterday’s five headlines', 'The app crashes'],
              a: 0,
              why: 'The articles lived in memory. When the app closed, they went with it, and the new request fails. The catch stops a crash, but there is nothing to show.',
            },
            frames: [
              { screen: { list: [] }, ping: 'api', pk: { vr: 'refresh()', ra: 'GET v1/headlines' }, panel: json(J), say: 'Launch. <code>init</code> calls <code>repository.refresh()</code>, and Retrofit sends <code>GET https://news.example.com/v1/headlines</code>. Until the answer arrives, the list is empty.' },
              { pk: { ra: ['200 OK', 'ok'] }, panel: json(J, { 7: 'hit' }), say: 'The answer arrives as JSON. The key <code>"published_at"</code> fills the property <code>publishedAt</code>, thanks to <code>@SerialName("published_at")</code>.' },
              { panel: json(J, { 7: 'hit', 8: 'ign' }), say: '<code>"author"</code> isn’t in <code>ArticleDto</code>. The reader made with <code>ignoreUnknownKeys = true</code> skips it instead of failing.' },
              { screen: five, ping: ['repo', 'vm', 'ui'], pk: { vr: ['List<Article>(5)', 'ok'], uv: ['NewsUiState', 'ok'] }, say: 'Each <code>ArticleDto</code> becomes an <code>Article</code> with <code>toArticle()</code>. <code>refresh()</code> puts the list in the <code>MutableStateFlow</code>, it emits, and the screen shows five real headlines.' },
              { screen: { list: [] }, offline: true, dark: true, panel: json(['(no answer)']), say: 'The next morning, on a train. Android closed the app overnight, so it starts from nothing: the flow is empty again.' },
              { fail: 'api', pk: { ra: ['IOException', 'err'] }, say: 'The request fails with an <code>IOException</code>. The ViewModel catches it, so no crash, but there is nothing to show. Step 5 keeps a copy on the phone.' },
            ],
          });
        },
        code: `@Serializable
data class ArticleDto(
    val id: String,
    val title: String,
    val source: String,
    val summary: String,
    @SerialName("published_at") val publishedAt: String,   // the JSON key is published_at
)

@Serializable
data class HeadlinesResponse(val articles: List<ArticleDto>)

fun ArticleDto.toArticle() = Article(id, title, source, summary, publishedAt)

interface NewsApi {
    @GET("v1/headlines")                       // GET https://news.example.com/v1/headlines
    suspend fun headlines(): HeadlinesResponse
}

val json = Json { ignoreUnknownKeys = true }   // skips keys like "author"

val newsApi: NewsApi = Retrofit.Builder()
    .baseUrl("https://news.example.com/")
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(NewsApi::class.java)

interface NewsRepository {
    val articles: Flow<List<Article>>
    fun article(id: String): Flow<Article?>
    suspend fun refresh()                      // new: get fresh articles now
}

class OnlineNewsRepository(private val api: NewsApi) : NewsRepository {
    private val latest = MutableStateFlow(listOf<Article>())   // only in memory
    override val articles: Flow<List<Article>> = latest
    override fun article(id: String): Flow<Article?> =
        latest.map { list -> list.firstOrNull { it.id == id } }
    override suspend fun refresh() {
        latest.value = api.headlines().articles.map { it.toArticle() }
    }
}
// FakeNewsRepository gets: override suspend fun refresh() {}

// NewsViewModel, inside init, after the first launch:
viewModelScope.launch {
    try {
        repository.refresh()
    } catch (e: IOException) {
        // no connection: the list stays as it is (step 7 shows a message)
    } catch (e: HttpException) {
        // the server answered with an error code
    } catch (e: SerializationException) {
        // the JSON doesn't fit ArticleDto
    }
}

// Replaces the fake. Still one for the whole app, so every screen sees the same latest list.
val newsRepository: NewsRepository = OnlineNewsRepository(newsApi)
// AndroidManifest.xml, inside <manifest>:
// <uses-permission android:name="android.permission.INTERNET" />

// libs.versions.toml, new lines:
// [versions]   retrofit = "3.0.0"   serialization = "1.11.0"
// [libraries]  retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
//              retrofit-kotlinx-serialization = { group = "com.squareup.retrofit2", name = "converter-kotlinx-serialization", version.ref = "retrofit" }
//              kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "serialization" }
// app/build.gradle.kts: implementation(...) for all three`,
        remember: 'ArticleDto matches the server’s JSON (@SerialName for a different key); the repository calls the API, and the ViewModel catches what can fail.',
        mistakes: [
          { title: 'Using the server’s names in the app', bad: `@Serializable
data class ArticleDto(
    val id: String,
    val published_at: String,   // an underscore in a Kotlin name
)`, good: `@Serializable
data class ArticleDto(
    val id: String,
    @SerialName("published_at") val publishedAt: String,
)`, why: 'Kotlin names join words with a capital letter (<code>publishedAt</code>), not an underscore. <code>@SerialName</code> keeps the server’s spelling on the JSON side only, so the rest of the app reads <code>publishedAt</code>.' },
        ],
        terms: [
          { term: '@SerialName', def: '<code>@SerialName("published_at")</code> on a property says which JSON key fills it, when the key and the Kotlin name differ.' },
          { term: 'DTO', def: 'Data transfer object: a class shaped like the server’s data, like <code>ArticleDto</code>. The app turns it into its own <code>Article</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Link the JSON key <code>published_at</code> to the property, and declare the request.', code: `@Serializable
data class ArticleDto(
    val id: String,
    @[[SerialName]]("published_at") val publishedAt: String,
)

interface NewsApi {
    @[[GET]]("v1/headlines")
    suspend fun headlines(): HeadlinesResponse
}`, why: '<code>@SerialName</code> names the JSON key. <code>@GET</code> names the path, which Retrofit puts after the base URL.' },
          { type: 'bug', prompt: 'The request succeeds, but the list never changes. Tap the line to fix.', code: `class OnlineNewsRepository(private val api: NewsApi) : NewsRepository {
    private val latest = MutableStateFlow(listOf<Article>())
    override val articles: Flow<List<Article>> = latest
    override suspend fun refresh() {
        api.headlines().articles.map { it.toArticle() }
    }
}`, bug: 4, fix: '        latest.value = api.headlines().articles.map { it.toArticle() }', why: 'The new list is made and then thrown away. Only a new <code>value</code> makes the <code>MutableStateFlow</code> emit, and the screen follow.' },
        ],
        quiz: [
          { q: 'The server adds a new key, <code>"image"</code>, that <code>ArticleDto</code> doesn’t have. What happens with <code>Json { ignoreUnknownKeys = true }</code>?', options: ['The key is skipped and everything else is read', 'A <code>SerializationException</code>', 'Retrofit sends the request again'], a: 0, why: 'That is what <code>ignoreUnknownKeys</code> is for: a newer server doesn’t break an older app.' },
          { q: 'Which class had to change so that the ViewModel can ask for fresh articles?', options: ['The <code>NewsRepository</code> interface got <code>refresh()</code>', 'The screen got a Retrofit object', '<code>NewsUiState</code> got the API'], a: 0, why: 'The ViewModel talks only to the interface, so the new ability goes there. Each repository fills it in its own way.' },
          { q: 'Why is the list empty when the app is opened offline the next day?', options: ['The articles were only kept in memory, and the app was closed', 'Retrofit deletes old answers', 'The ViewModel clears the list at night'], a: 0, why: 'A <code>MutableStateFlow</code> lives in memory. When the app’s process ends, it is gone.' },
        ],
        docs: [['Data layer', 'https://developer.android.com/topic/architecture/data-layer'], ['Serialization', 'https://kotlinlang.org/docs/serialization.html']],
      },

      // 5 cache ─────────────────────────────────────────────
      {
        id: 'cache',
        title: 'Offline cache',
        tagline: 'Keep the articles in Room, and let the network only refresh them.',
        goals: ['Turn Article into a Room table with a DAO and a database', 'Write OfflineFirstNewsRepository: the screens read only Room, refresh() only writes to it', 'Explain why the app now works offline'],
        level: 'intermediate', introduces: [],
        refs: ['data.room', 'data.room-setup', 'data.caching', 'arch.ssot'],
        body: `
<p>On the train, the app showed nothing, though it had downloaded five headlines the day before. The fix is the one from the caching lesson: keep a copy in Room, and make Room the <em>single source of truth</em>. The screens read only from the database; the network has one job, writing fresh articles into it.</p>
<p><code>Article</code> becomes the table: <code>@Entity(tableName = "articles")</code>, with <code>@PrimaryKey</code> on <code>id</code>. The server’s ids are unique, so they make a good key. <code>ArticleDao</code> has three functions: <code>observeAll()</code>, a live query of every row, newest first; <code>observe(id)</code>, one row; and <code>upsertAll</code>, which updates the rows whose id exists and inserts the rest. Times written like <code>"2026-10-20T08:50:00Z"</code> sort as text in time order, so <code>ORDER BY publishedAt DESC</code> puts the newest first.</p>
<p><code>NewsDatabase</code> lists the table, and <code>NewsDb</code> opens it once for the whole app, like <code>RecipesDb</code> in the data track. Then the new repository, <code>OfflineFirstNewsRepository</code>: <code>articles</code> is <code>dao.observeAll()</code>, <code>article(id)</code> is <code>dao.observe(id)</code>, and <code>refresh()</code> downloads and calls <code>upsertAll</code>. When the download fails, it throws before writing anything, so the saved rows stay.</p>
<p>Look at what didn’t change: the ViewModels and the screens. Only the place that builds the repository changes. The new one needs the DAO, and opening the database needs a <code>Context</code>, so the top-level <code>val</code> becomes an object like <code>NewsDb</code>: <code>AppRepository.get(this)</code> builds the repository the first time and hands back the same one after that. That is the payoff of the interface from step 3.</p>`,
        visual(el) {
          const five = ['a5', 'a4', 'a3', 'a2', 'a1'];
          demo(el, {
            step: 5,
            panelTitle: 'Room table: articles',
            predict: {
              q: 'Yesterday the app saved five articles in Room. Today the phone is offline and the user opens the app. What shows?',
              options: ['The five saved articles', 'An empty list', 'A crash'],
              a: 0,
              why: 'The screens read only Room, and the rows are still on disk. The failed refresh writes nothing, so it removes nothing.',
            },
            frames: [
              { screen: { list: [] }, ping: 'db', pk: { rd: 'observeAll()' }, panel: table([]), say: 'First launch. <code>articles</code> is now <code>dao.observeAll()</code>: the screen reads only Room. The table is empty, so the list is too.' },
              { ping: ['api', 'db'], pk: { ra: ['200 OK · 5 articles', 'ok'], rd: 'upsertAll(5)' }, panel: table(five, five), say: '<code>refresh()</code> downloads the headlines and writes them with <code>upsertAll</code>. The network never hands anything to the screen; it only writes to Room.' },
              { screen: { list: five, fresh: five }, ping: ['repo', 'vm', 'ui'], pk: { rd: ['Flow emits', 'ok'], vr: ['List<Article>(5)', 'ok'] }, say: 'Room notices its table changed and runs <code>observeAll()</code> again. The new list flows up: repository, ViewModel, screen.' },
              { screen: { list: five }, offline: true, dark: true, ping: 'db', pk: { rd: ['observeAll(): 5 rows', 'ok'] }, panel: table(five), say: 'The next day, offline, the app starts again. The five rows are still in the database file, so they show at once.' },
              { fail: 'api', pk: { ra: ['IOException', 'err'] }, say: '<code>refresh()</code> fails with an <code>IOException</code> before writing anything. The list stays. (Step 7 adds a note that says the news is saved.)' },
              { screen: { list: ['a6', ...five], fresh: ['a6'] }, offline: false, ping: ['api', 'db', 'ui'], pk: { ra: ['200 OK · 6 articles', 'ok'], rd: 'upsertAll(6)' }, panel: table(['a6', ...five], ['a6']), say: 'Back online, a refresh brings six articles. Five ids are already in the table, so <code>upsertAll</code> updates those rows and inserts one: <code>a6</code>.' },
            ],
          });
        },
        code: `@Entity(tableName = "articles")
data class Article(
    @PrimaryKey val id: String,   // the server's id
    val title: String,
    val source: String,
    val summary: String,
    val publishedAt: String,
)

@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles ORDER BY publishedAt DESC")   // newest first
    fun observeAll(): Flow<List<Article>>

    @Query("SELECT * FROM articles WHERE id = :id")
    fun observe(id: String): Flow<Article?>

    @Upsert                       // same id: update the row; new id: insert it
    suspend fun upsertAll(articles: List<Article>)
}

@Database(entities = [Article::class], version = 1)
abstract class NewsDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}

object NewsDb {
    private var db: NewsDatabase? = null

    fun get(context: Context): NewsDatabase {
        val open = db ?: Room.databaseBuilder<NewsDatabase>(context.applicationContext, "news.db")
            .setDriver(AndroidSQLiteDriver())
            .build()
        db = open
        return open
    }
}

class OfflineFirstNewsRepository(
    private val api: NewsApi,
    private val dao: ArticleDao,
) : NewsRepository {
    override val articles: Flow<List<Article>> = dao.observeAll()     // reads come only from Room
    override fun article(id: String): Flow<Article?> = dao.observe(id)

    override suspend fun refresh() {
        val fresh = api.headlines().articles      // throws when offline: Room keeps its rows
        dao.upsertAll(fresh.map { it.toArticle() })
    }
}

// Replaces the top-level val newsRepository. One repository for the whole app, like NewsDb:
// built the first time, then the same one
object AppRepository {
    private var repository: NewsRepository? = null

    fun get(context: Context): NewsRepository {
        val made = repository ?: OfflineFirstNewsRepository(newsApi, NewsDb.get(context).articleDao())
        repository = made
        return made
    }
}

// MainActivity.onCreate:
//     setContent { MaterialTheme { NewsNavHost(AppRepository.get(this)) } }

// libs.versions.toml, new lines:
// [versions]   ksp = "2.3.10"   room3 = "3.0.3"   sqlite = "2.7.1"
// [libraries]  androidx-room3-runtime = { group = "androidx.room3", name = "room3-runtime", version.ref = "room3" }
//              androidx-room3-compiler = { group = "androidx.room3", name = "room3-compiler", version.ref = "room3" }
//              androidx-sqlite-framework = { group = "androidx.sqlite", name = "sqlite-framework", version.ref = "sqlite" }
// [plugins]    ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
//              room3 = { id = "androidx.room3", version.ref = "room3" }
// app/build.gradle.kts: alias(...) for both plugins, implementation(...) for runtime and sqlite-framework,
//     ksp(libs.androidx.room3.compiler), and room3 { schemaDirectory("$projectDir/schemas") }
// (and alias(libs.plugins.ksp) apply false, alias(libs.plugins.room3) apply false in the project's build.gradle.kts)`,
        remember: 'Room is the single source of truth: the screens read only the database, refresh() only writes to it, and a failed refresh leaves the saved rows alone.',
        mistakes: [
          { title: 'Emptying the table before downloading', bad: `override suspend fun refresh() {
    dao.deleteAll()                                     // the list goes blank
    dao.upsertAll(api.headlines().articles.map { it.toArticle() })
}`, good: `override suspend fun refresh() {
    val fresh = api.headlines().articles              // may throw: nothing deleted
    dao.upsertAll(fresh.map { it.toArticle() })
}`, why: 'Offline, the download throws after the table was emptied, and the saved news is gone. Download first; write only when you have something.' },
        ],
        terms: [
          { term: 'single source of truth', def: 'The one place the app reads a piece of data from. Here, the <code>articles</code> table: everything else only writes to it or shows it.' },
          { term: 'offline first', def: 'The screens show the local copy at once; the network only refreshes that copy.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the screens read only from Room, and write fresh articles into it.', code: `override val articles: Flow<List<Article>> = dao.[[observeAll]]()

override suspend fun refresh() {
    val fresh = api.headlines().articles
    dao.[[upsertAll]](fresh.map { it.toArticle() })
}`, why: 'The live query keeps the screen up to date. <code>upsertAll</code> updates rows that exist and inserts new ones, and Room’s Flow does the rest.' },
          { type: 'bug', prompt: 'The list doesn’t update after a refresh until the app is reopened. Tap the line.', code: `@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles ORDER BY publishedAt DESC")
    suspend fun observeAll(): List<Article>

    @Upsert
    suspend fun upsertAll(articles: List<Article>)
}`, bug: 3, fix: '    fun observeAll(): Flow<List<Article>>', why: 'A <code>suspend</code> query reads the rows once. A query that returns a <code>Flow</code> keeps watching the table and sends a new list after every write.' },
        ],
        quiz: [
          { q: 'The server sends an article whose id is already in the table, with a corrected title. What does <code>upsertAll</code> do?', options: ['Updates that row with the new title', 'Adds a second row with the same id', 'Throws, because the id exists'], a: 0, why: 'Upsert means update or insert: a row with the same primary key is updated.' },
          { q: 'Where does the list screen get its articles now?', options: ['Only from Room, through the repository', 'From the server, then from Room if offline', 'From <code>sampleArticles</code>'], a: 0, why: 'One source of truth. The server’s answer reaches the screen only by going through the table.' },
          { q: 'Which classes changed in this step, apart from <code>Article</code> and the new Room classes?', options: ['Only the repository and the place that builds it', 'Both ViewModels', 'Every screen'], a: 0, why: 'The ViewModels and screens only know <code>NewsRepository</code>, so they keep working with the new one.' },
        ],
        docs: [['Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'], ['Save data in a local database using Room', 'https://developer.android.com/training/data-storage/room']],
      },

      // 6 hilt ─────────────────────────────────────────────
      {
        id: 'hilt',
        title: 'Wiring with Hilt',
        tagline: 'Let Hilt build the API, the database, the repository and the ViewModels.',
        goals: ['Set Hilt up with an Application class and an entry point', 'Tell Hilt how to build NewsApi, NewsDatabase and ArticleDao in a module, and bind the repository', 'Read the route’s id in ArticleViewModel from SavedStateHandle'],
        level: 'intermediate', introduces: ['SavedStateHandle'],
        refs: ['arch.di', 'arch.hilt', 'arch.hilt-modules', 'arch.hilt-scopes', 'compose.navigation'],
        body: `
<p>Look at the wiring now: a top-level <code>val</code> for the API, an object for the database, another for the repository, every class built by hand in its own place. <code>NewsNavHost</code> has to pass the repository into every <code>viewModel { }</code>. A third screen would repeat all of it. This step hands the building to Hilt, as in the architecture track.</p>
<p>Setup: <code>@HiltAndroidApp</code> on a new <code>NewsApp</code> class (named in the manifest), and <code>@AndroidEntryPoint</code> on <code>MainActivity</code>. Then one module, <code>DataModule</code>, says how to make what the app doesn’t own: <code>@Provides</code> functions for <code>NewsApi</code> (the Retrofit code from step 4), <code>NewsDatabase</code> and <code>ArticleDao</code>. <code>@Singleton</code> means one for the whole app; that replaces <code>NewsDb</code> and <code>AppRepository</code>. <code>RepositoryModule</code> has one <code>@Binds</code>: when someone asks for a <code>NewsRepository</code>, hand them <code>OfflineFirstNewsRepository</code>.</p>
<p>Your own classes only need <code>@Inject constructor</code>. The ViewModels get <code>@HiltViewModel</code>, and the screens ask for them with <code>hiltViewModel()</code>. One thing is new: <code>ArticleViewModel</code> needs the article’s id, and nobody passes it in any more. Hilt gives every <code>@HiltViewModel</code> that asks for one a <code>SavedStateHandle</code>, which holds the arguments of its screen’s route. <code>savedStateHandle.toRoute&lt;ArticleDetail&gt;()</code> gives the route back, so <code>.id</code> is the id; the type in angle brackets says which route to read.</p>`,
        visual(el) {
          const five = { list: ['a6', 'a5', 'a4', 'a3', 'a2'] };
          const g = (made, extra = []) => graph(['App start', ['NewsApp', '@HiltAndroidApp', true], ['MainActivity', '@AndroidEntryPoint', true],
            'Asked for by the screens', ['NewsViewModel', '@HiltViewModel', made > 0], ['NewsRepository', '@Binds → OfflineFirstNewsRepository @2b8', made > 1],
            'From DataModule', ['NewsApi', '@Provides @Singleton', made > 2], ['NewsDatabase', '@Provides @Singleton', made > 2], ['ArticleDao', '@Provides', made > 2], ...extra]);
          demo(el, {
            step: 6,
            panelTitle: 'What Hilt has built',
            predict: {
              q: '<code>NewsViewModel</code> and <code>ArticleViewModel</code> both ask for a <code>NewsRepository</code>. How many repositories does Hilt make?',
              options: ['One, shared by both', 'Two, one per ViewModel', 'A new one after every rotation'],
              a: 0,
              why: '<code>OfflineFirstNewsRepository</code> is <code>@Singleton</code>: Hilt makes it once and hands the same one to everyone who asks.',
            },
            frames: [
              { screen: { spin: true }, panel: g(0), say: 'The app starts. <code>@HiltAndroidApp</code> sets Hilt up for the whole app, and <code>@AndroidEntryPoint</code> lets <code>MainActivity</code>’s screens ask Hilt for ViewModels. <code>onCreate</code> only calls <code>setContent</code> now.' },
              { ping: 'vm', panel: g(1), say: 'The list screen calls <code>hiltViewModel()</code>. <code>NewsViewModel</code>’s <code>@Inject constructor</code> needs a <code>NewsRepository</code>, which is an interface.' },
              { ping: 'repo', panel: g(2), say: '<code>@Binds</code> in <code>RepositoryModule</code> says which class to use: <code>OfflineFirstNewsRepository</code>. Its constructor needs a <code>NewsApi</code> and an <code>ArticleDao</code>.' },
              { ping: ['api', 'db'], panel: g(3), say: '<code>DataModule</code> tells Hilt how to make those: <code>provideNewsApi()</code>, and <code>provideArticleDao(db)</code>, which first needs <code>provideDatabase(context)</code>. Hilt calls each one in the right order.' },
              { screen: five, ping: 'ui', pk: { vr: ['List<Article>(6)', 'ok'], uv: ['NewsUiState', 'ok'] }, say: 'Everything is built, and the list shows, exactly as before. Only the wiring moved into Hilt.' },
              { screen: { detail: 'a4' }, ping: 'vm', panel: g(3, ['From the route', ['ArticleViewModel', 'SavedStateHandle: id = "a4"; the same repository @2b8', true]]), say: 'Opening an article: <code>hiltViewModel()</code> makes <code>ArticleViewModel</code>. Its <code>SavedStateHandle</code> holds the route’s id, and it gets the same repository, @2b8.' },
              { rotate: true, say: 'Turn the phone: Activity #2. The ViewModels survive as before, and Hilt builds no new repository: <code>@Singleton</code> now does the job <code>AppRepository</code> did by hand.' },
            ],
          });
        },
        code: `@HiltAndroidApp
class NewsApp : Application()
// AndroidManifest.xml: <application android:name=".NewsApp" ...>

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { NewsNavHost() } }   // nothing to build here any more
    }
}

@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    @Provides
    @Singleton
    fun provideNewsApi(): NewsApi = Retrofit.Builder()
        .baseUrl("https://news.example.com/")
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))   // json from step 4
        .build()
        .create(NewsApi::class.java)

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): NewsDatabase =   // Hilt hands in the app's Context
        Room.databaseBuilder<NewsDatabase>(context, "news.db")
            .setDriver(AndroidSQLiteDriver())
            .build()

    @Provides
    fun provideArticleDao(db: NewsDatabase): ArticleDao = db.articleDao()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindNewsRepository(repository: OfflineFirstNewsRepository): NewsRepository
}

@Singleton
class OfflineFirstNewsRepository @Inject constructor(
    private val api: NewsApi,
    private val dao: ArticleDao,
) : NewsRepository { /* unchanged */ }

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel() { /* unchanged */ }

@HiltViewModel
class ArticleViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    repository: NewsRepository,
) : ViewModel() {
    private val id = savedStateHandle.toRoute<ArticleDetail>().id   // the id from the route
    val article: StateFlow<Article?> = repository.article(id)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
}

// NewsNavHost() has no parameter now:
composable<ArticleList> {
    val viewModel: NewsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ArticleListScreen(state, onOpen = { id -> navController.navigate(ArticleDetail(id)) })
}
composable<ArticleDetail> {
    val viewModel: ArticleViewModel = hiltViewModel()
    val article by viewModel.article.collectAsStateWithLifecycle()
    ArticleDetailScreen(article)
}
// Deleted: NewsDb, AppRepository and the top-level val newsApi (json stays: DataModule uses it).

// libs.versions.toml, new lines:
// [versions]   hilt = "2.60.1"   androidxHilt = "1.4.0"
// [libraries]  hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
//              hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
//              androidx-hilt-lifecycle-viewmodel-compose = { group = "androidx.hilt", name = "hilt-lifecycle-viewmodel-compose", version.ref = "androidxHilt" }
// [plugins]    hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
// app/build.gradle.kts: alias(libs.plugins.hilt), implementation(libs.hilt.android), ksp(libs.hilt.compiler),
//     implementation(libs.androidx.hilt.lifecycle.viewmodel.compose)
// (and alias(libs.plugins.hilt) apply false in the project's build.gradle.kts)`,
        remember: 'Hilt builds the app: @Provides for what you don’t own, @Binds for an interface, @Inject constructor for your classes, and hiltViewModel() on each screen.',
        mistakes: [
          { title: 'Forgetting @AndroidEntryPoint', bad: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { NewsNavHost() } }   // hiltViewModel() inside
    }
}`, good: `@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { NewsNavHost() } }
    }
}`, why: 'The app still builds, but the first <code>hiltViewModel()</code> crashes at run time: Hilt can only make ViewModels for an Activity it was told about.' },
        ],
        terms: [
          { term: 'SavedStateHandle', def: 'Given by Hilt to a <code>@HiltViewModel</code> that asks for it. It holds its screen’s route arguments: <code>savedStateHandle.toRoute&lt;ArticleDetail&gt;()</code>.' },
          { term: 'wiring', def: 'The code that builds each object and hands it the objects it needs. With Hilt, the modules and <code>@Inject</code> constructors.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'When someone asks for a <code>NewsRepository</code>, hand them <code>OfflineFirstNewsRepository</code>.', code: `@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @[[Binds]]
    abstract fun bindNewsRepository(repository: OfflineFirstNewsRepository): [[NewsRepository]]
}`, why: '<code>@Binds</code> links an interface (the return type) to the class that implements it (the parameter).' },
          { type: 'bug', prompt: 'Hilt can’t build <code>NewsViewModel</code> at all. Tap the line.', code: `@HiltViewModel
class NewsViewModel(
    private val repository: NewsRepository,
) : ViewModel()`, bug: 1, fix: 'class NewsViewModel @Inject constructor(', why: 'Without <code>@Inject constructor</code>, Hilt doesn’t know how to call the constructor, and the build fails.' },
        ],
        quiz: [
          { q: 'Why does <code>NewsApi</code> come from a <code>@Provides</code> function instead of <code>@Inject constructor</code>?', options: ['Retrofit makes the class behind the interface; you can’t annotate its constructor', 'Interfaces can’t be used with Hilt', '<code>@Provides</code> is faster'], a: 0, why: 'You don’t own that class. A <code>@Provides</code> function tells Hilt how to get one: the Retrofit builder.' },
          { q: 'Where does <code>ArticleViewModel</code> get the article’s id now?', options: ['From <code>SavedStateHandle</code>, which holds the route’s arguments', 'From <code>MainActivity</code>', 'From the repository'], a: 0, why: '<code>savedStateHandle.toRoute&lt;ArticleDetail&gt;().id</code> reads the id the list screen navigated with.' },
          { q: 'What did this step change about what the app does?', options: ['Nothing: only how its parts are built', 'It now works offline', 'It loads faster from the network'], a: 0, why: 'Wiring is about who builds what. The app behaves the same, but adding a screen is now one <code>hiltViewModel()</code> call.' },
        ],
        docs: [['Dependency injection with Hilt', 'https://developer.android.com/training/dependency-injection/hilt-android'], ['Hilt Gradle setup', 'https://dagger.dev/hilt/gradle-setup']],
      },

      // 7 states ─────────────────────────────────────────────
      {
        id: 'states',
        title: 'Loading and errors',
        tagline: 'A spinner, a message, a note over saved news, and pull to refresh.',
        goals: ['Add isRefreshing and errorMessage to NewsUiState and set them in refresh()', 'Pick the right screen for every state with one when', 'Refresh with a pull, using PullToRefreshBox'],
        level: 'intermediate', introduces: ['PullToRefreshBox'],
        refs: ['arch.ui-state-patterns', 'data.net', 'kotlin.when', 'compose.scaffold'],
        body: `
<p>The app works, but it isn’t honest yet. On a first launch with no signal, the user sees an empty screen and can’t tell “no news” from “no connection”. When a refresh fails, the old list stays without a word. And the only refresh happens when the app starts.</p>
<p><code>NewsUiState</code> gets two fields: <code>isRefreshing</code>, true while a refresh runs, and <code>errorMessage</code>, why the last one failed, or <code>null</code>. The refresh moves from <code>init</code> into its own event function, <code>refresh()</code>. It returns at once if a refresh is already running, sets <code>isRefreshing</code>, and at the end writes the result: no message, or “No connection.” for an <code>IOException</code>, the status code for an <code>HttpException</code>, or “The news couldn’t be read.” for a <code>SerializationException</code>. <code>init</code> calls it once.</p>
<p>The screen decides with one <code>when</code>. Written without a value in brackets, <code>when { }</code> checks each condition in turn and runs the first branch that is true. The order matters: still loading, then empty and refreshing, then empty with an error, then empty, and last the list, with a small note above it when the refresh failed.</p>
<p><code>PullToRefreshBox(isRefreshing, onRefresh)</code> wraps the content: pulling the list down calls <code>onRefresh</code>, and its spinner shows while <code>isRefreshing</code> is true. Like <code>TopAppBar</code>, it may need <code>@OptIn(ExperimentalMaterial3Api::class)</code>, which the screen already has.</p>`,
        visual(el) {
          const S = (arts, loading, refreshing, err) => [['articles', `${arts} items`], ['isLoading', String(loading)], ['isRefreshing', String(refreshing)], ['errorMessage', err ? `"${err}"` : 'null']];
          const five = { list: ['a6', 'a5', 'a4', 'a3', 'a2'] };
          demo(el, {
            step: 7,
            panelTitle: 'NewsUiState and the when',
            predict: {
              q: 'Room has saved articles, the phone is offline, and the user pulls the list down. What does the screen show when the refresh fails?',
              options: ['The saved list, with the note “No connection. Showing saved news.”', 'The message “No connection.” with a Retry button', 'A spinner that never stops'],
              a: 0,
              why: 'The list isn’t empty, so the <code>when</code> reaches its last branch, which adds the note. The message screen is only for an empty list.',
            },
            frames: [
              { screen: { spin: true }, offline: true, panel: uiState(S(0, true, false), [], 0), say: 'A fresh install, offline. The first state: <code>isLoading = true</code>. The first branch wins: a spinner.' },
              { ping: ['db', 'vm'], pk: { vr: ['List<Article>(0)', 'ok'] }, panel: uiState(S(0, false, true), ['isLoading', 'isRefreshing'], 1), say: 'Room answers with an empty list, and <code>refresh()</code> from <code>init</code> is running. Empty and refreshing: still a spinner, not “no news”.' },
              { screen: { msg: { title: 'No connection.', btn: 'Retry' } }, fail: 'api', pk: { ra: ['IOException', 'err'] }, panel: uiState(S(0, false, false, 'No connection.'), ['isRefreshing', 'errorMessage'], 2), say: 'The request fails. <code>refresh()</code> writes <code>errorMessage = "No connection."</code>. Empty with an error: the message with a Retry button.' },
              { screen: { spin: true }, offline: false, ping: 'vm', pk: { uv: 'refresh()' }, panel: uiState(S(0, false, true), ['isRefreshing', 'errorMessage'], 1), say: 'The signal is back and the user taps Retry, which calls <code>refresh()</code>. It clears the message and sets <code>isRefreshing</code>.' },
              { screen: { list: five.list, fresh: five.list }, ping: ['api', 'db', 'ui'], pk: { ra: ['200 OK', 'ok'], rd: 'upsertAll(5)' }, panel: uiState(S(5, false, false), ['articles', 'isRefreshing'], 4), say: 'Success: Room gets five rows, its Flow emits, and the last branch shows the list.' },
              { screen: five, offline: true, refreshing: true, ping: 'vm', panel: uiState(S(5, false, true), ['isRefreshing'], 4), say: 'Later, offline again, the user pulls the list down. <code>PullToRefreshBox</code> calls <code>onRefresh</code>, and its spinner shows while <code>isRefreshing</code> is true.' },
              { refreshing: false, note: 'No connection. Showing saved news.', fail: 'api', pk: { ra: ['IOException', 'err'] }, panel: uiState(S(5, false, false, 'No connection.'), ['isRefreshing', 'errorMessage'], 4), say: 'It fails. The list isn’t empty, so the last branch runs: the saved news stays, with a note on top saying why it may be old.' },
            ],
          });
        },
        code: `data class NewsUiState(
    val articles: List<Article> = listOf(),
    val isLoading: Boolean = true,        // Room hasn't answered yet
    val isRefreshing: Boolean = false,    // a refresh is running
    val errorMessage: String? = null,     // why the last refresh failed
)

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(NewsUiState())
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.articles.collect { list ->
                _uiState.value = _uiState.value.copy(articles = list, isLoading = false)
            }
        }
        refresh()
    }

    fun refresh() {
        if (_uiState.value.isRefreshing) return          // one refresh at a time
        _uiState.value = _uiState.value.copy(isRefreshing = true, errorMessage = null)
        viewModelScope.launch {
            var error: String? = null
            try {
                repository.refresh()
            } catch (e: IOException) {
                error = "No connection."
            } catch (e: HttpException) {
                error = "Server problem (\${e.code()})."
            } catch (e: SerializationException) {
                error = "The news couldn't be read."
            }
            _uiState.value = _uiState.value.copy(isRefreshing = false, errorMessage = error)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleListScreen(state: NewsUiState, onRefresh: () -> Unit, onOpen: (String) -> Unit) {
    Scaffold(topBar = { TopAppBar(title = { Text("News") }) }) { innerPadding ->
        PullToRefreshBox(
            isRefreshing = state.isRefreshing,
            onRefresh = onRefresh,                       // a pull calls it
            modifier = Modifier.padding(innerPadding).fillMaxSize(),
        ) {
            val empty = state.articles.isEmpty()
            val error = state.errorMessage
            when {                                       // the first true branch runs
                state.isLoading -> Spinner()             // Spinner() from step 3: in the middle
                empty && state.isRefreshing -> Spinner()
                empty && error != null -> Message(error, button = "Retry", onClick = onRefresh)
                empty -> Message("No news yet.", button = "Refresh", onClick = onRefresh)
                else -> Column {
                    if (error != null) {
                        Text("$error Showing saved news.")
                    }
                    ArticleList(state.articles, onOpen)
                }
            }
        }
    }
}

@Composable
fun Message(text: String, button: String, onClick: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(text)
        Button(onClick = onClick) { Text(button) }
    }
}

// NewsNavHost:
//     ArticleListScreen(state, onRefresh = { viewModel.refresh() }, onOpen = { id -> navController.navigate(ArticleDetail(id)) })`,
        play: `data class Article(val id: String, val title: String)

data class NewsUiState(
    val articles: List<Article> = listOf(),
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
)

// The same decisions as the screen's when, as text
fun screenFor(state: NewsUiState): String {
    val empty = state.articles.isEmpty()
    val error = state.errorMessage
    return when {
        state.isLoading -> "spinner"
        empty && state.isRefreshing -> "spinner"
        empty && error != null -> "message: $error [Retry]"
        empty -> "message: No news yet. [Refresh]"
        error != null -> "note: $error Showing saved news. + \${state.articles.size} articles"
        else -> "\${state.articles.size} articles"
    }
}

fun main() {
    val saved = listOf(Article("a5", "Storm expected along the coast on Friday"), Article("a4", "City council approves new bike lanes"))
    println(screenFor(NewsUiState()))
    println(screenFor(NewsUiState(isLoading = false, isRefreshing = true)))
    println(screenFor(NewsUiState(isLoading = false, errorMessage = "No connection.")))
    println(screenFor(NewsUiState(isLoading = false)))
    println(screenFor(NewsUiState(articles = saved, isLoading = false, errorMessage = "No connection.")))
    println(screenFor(NewsUiState(articles = saved, isLoading = false)))
}`,
        remember: 'One NewsUiState describes every situation; one when, checked top to bottom, picks the screen; PullToRefreshBox turns a pull into refresh().',
        mistakes: [
          { title: 'Checking “empty” first', bad: `when {
    empty -> Message("No news yet.", button = "Refresh", onClick = onRefresh)
    state.isLoading -> Spinner()
    // ...
}`, good: `when {
    state.isLoading -> Spinner()
    empty && state.isRefreshing -> Spinner()
    // ... then the empty cases
}`, why: 'At launch the list is empty <em>and</em> loading. The first true branch wins, so “No news yet.” would flash before every first load.' },
        ],
        terms: [
          { term: 'PullToRefreshBox', def: 'A Material box around a scrolling list: pulling down calls <code>onRefresh</code>, and its spinner shows while <code>isRefreshing</code> is <code>true</code>.' },
          { term: 'when without a value', def: '<code>when { a -> ...; b -> ... }</code>: each branch is a condition, checked from the top; the first true one runs.' },
          { term: 'error state', def: 'What the screen shows when loading failed: a message with Retry when there is nothing saved, or a note over the saved data.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn a pull into a refresh, and show its spinner while one runs.', code: `PullToRefreshBox(
    isRefreshing = state.[[isRefreshing]],
    onRefresh = [[onRefresh]],
) {
    ArticleList(state.articles, onOpen)
}`, why: 'The box shows its spinner while <code>isRefreshing</code> is true and calls <code>onRefresh</code> when the user pulls. The screen passes the event up to the ViewModel.' },
          { type: 'bug', prompt: 'After one failed refresh, the spinner never goes away and pulling does nothing. Tap the line.', code: `viewModelScope.launch {
    try {
        repository.refresh()
        _uiState.value = _uiState.value.copy(isRefreshing = false)
    } catch (e: IOException) {
        _uiState.value = _uiState.value.copy(errorMessage = "No connection.")
    }
}`, bug: 5, fix: '        _uiState.value = _uiState.value.copy(isRefreshing = false, errorMessage = "No connection.")', why: 'On failure, <code>isRefreshing</code> stays <code>true</code>: the spinner keeps spinning, and <code>refresh()</code> returns early every time. Every path must set it back to <code>false</code>.' },
        ],
        quiz: [
          { q: 'At the very first launch, the list is empty and <code>isLoading</code> is <code>true</code>. Which branch runs?', options: ['The spinner: <code>state.isLoading</code> comes first', '“No news yet.”', 'The note over the list'], a: 0, why: 'A <code>when</code> without a value runs the first true branch, top to bottom.' },
          { q: 'Why does <code>refresh()</code> return at once when <code>isRefreshing</code> is already true?', options: ['So two pulls in a row don’t start two downloads', 'Because Room can only be written once', 'To hide the spinner'], a: 0, why: 'One refresh at a time. The second pull finds the first still running and does nothing.' },
          { q: 'The server answers 500 and Room has saved articles. What does the user see?', options: ['The saved list, with “Server problem (500). Showing saved news.”', 'The message screen with Retry', 'An empty list'], a: 0, why: 'An <code>HttpException</code> sets the message, but the list isn’t empty, so the last branch shows it with the note.' },
        ],
        docs: [['Pull to refresh', 'https://developer.android.com/develop/ui/compose/components/pull-to-refresh'], ['UI layer', 'https://developer.android.com/topic/architecture/ui-layer']],
      },

      // 8 recap ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'Putting it together',
        tagline: 'The whole app, one tap at a time, and what to build next.',
        goals: ['Follow one refresh through every layer of the app', 'Say what survives a rotation and what survives Android closing the app', 'Pick a next feature and add it the same way'],
        level: 'intermediate', introduces: [],
        refs: ['arch.layers', 'arch.ssot', 'arch.udf', 'arch.clean'],
        body: `
<p>You built a real app: <b>News</b> lists headlines from a server, opens each article, refreshes with a pull, and keeps working offline. Here it is, one refresh, <em>end to end</em>: a pull sends the event <code>onRefresh</code> up to <code>NewsViewModel.refresh()</code>. The ViewModel sets <code>isRefreshing</code> and calls <code>repository.refresh()</code>. The repository downloads with <code>NewsApi</code> and writes with <code>ArticleDao.upsertAll</code>. Room’s <code>observeAll()</code> emits the new rows, the ViewModel copies them into <code>NewsUiState</code>, and the screen draws the new state. Events go up, state comes down, and the data has one home.</p>
<p>Each part lives in its own folder: <code>ui</code> for screens and ViewModels, <code>data</code> for the repository, Room and the API, <code>di</code> for the Hilt modules. Dependencies only point down: the screens know the ViewModels, the ViewModels know <code>NewsRepository</code>, and nothing in <code>data</code> knows a screen exists.</p>
<p>Two kinds of interruption, two answers. A rotation keeps the ViewModels, so nothing loads again. When Android closes the app in the background to free memory, the ViewModels are gone too, but Room’s copy is on disk: the next launch shows it at once, and the open screen’s route is restored with it.</p>
<p>What next? Each idea is one more small step on the same app: a <code>source</code> filter (a new DAO query, a new field in the state), a “saved for later” star (a new column and a migration), a search route. Start each one the same way: write what it must do, change the lowest layer first, then the ViewModel, then the screen, run it, and commit.</p>`,
        visual(el) {
          const six = ['a6', 'a5', 'a4', 'a3', 'a2', 'a1'];
          const L = [['ui', 'App starts: Hilt builds <code>NewsViewModel</code>'], ['db', '<code>observeAll()</code>: 5 saved rows'], ['vm', '<code>isLoading = false</code>, 5 articles'],
            ['vm', '<code>refresh()</code>: <code>isRefreshing = true</code>'], ['api', 'GET v1/headlines: 200 OK, 6 articles'], ['db', '<code>upsertAll(6)</code>: 1 new row, Flow emits'],
            ['ui', '<code>navigate(ArticleDetail("a6"))</code>'], ['vm', '<code>ArticleViewModel</code> watches <code>observe("a6")</code>'],
            ['ui', 'Activity #2: same ViewModels, no new request'],
            ['ui', 'Process closed by Android, app reopened offline'], ['db', '<code>observeAll()</code>: 6 saved rows'], ['api', 'GET v1/headlines: <span class="bad">IOException</span>'], ['vm', '<code>errorMessage = "No connection."</code>']];
          demo(el, {
            step: 8,
            panelTitle: 'What each layer did, newest first',
            predict: {
              q: 'The user leaves the app in the background, and Android closes it to free memory. Later, with no signal, they open it again. What do they see?',
              options: ['The saved articles from Room, with the note about no connection', 'An empty screen: the ViewModel was lost', 'The “No connection.” message with Retry'],
              a: 0,
              why: 'The ViewModels are gone, but Room’s rows are on disk. The new ViewModel reads them at once; the failed refresh only adds the note.',
            },
            frames: [
              { screen: { spin: true }, ping: 'vm', panel: log(L.slice(0, 1)), say: 'The app starts. Hilt builds <code>NewsViewModel</code> and everything it needs. The first state is loading.' },
              { screen: { list: six.slice(1) }, ping: ['db', 'vm', 'ui'], pk: { rd: ['observeAll()', 'ok'], vr: ['List<Article>(5)', 'ok'] }, panel: log(L.slice(0, 3)), say: 'Room answers with the five rows saved last time. They show at once, before any network.' },
              { refreshing: true, ping: ['vm', 'api'], pk: { uv: 'onRefresh', vr: 'refresh()', ra: 'GET v1/headlines' }, panel: log(L.slice(0, 5)), say: 'A pull sends <code>onRefresh</code> up. <code>refresh()</code> sets <code>isRefreshing</code>, and the repository downloads.' },
              { screen: { list: six, fresh: ['a6'] }, refreshing: false, ping: ['db', 'repo', 'vm', 'ui'], pk: { rd: 'upsertAll(6)', vr: ['List<Article>(6)', 'ok'], uv: ['NewsUiState', 'ok'] }, panel: log(L.slice(0, 6)), say: 'The repository writes six articles to Room. The table changed, so <code>observeAll()</code> emits, and the new state comes down to the screen.' },
              { screen: { detail: 'a6' }, ping: ['ui', 'vm'], pk: { vr: 'article("a6")' }, panel: log(L.slice(0, 8)), say: 'A tap opens <code>a6</code>. Its <code>ArticleViewModel</code> reads the id from the route and watches that one row, so it works offline too.' },
              { rotate: true, panel: log(L.slice(0, 9)), say: 'Rotation: a new Activity, the same ViewModels, no new request.' },
              { screen: { list: six }, offline: true, dark: true, note: 'No connection. Showing saved news.', fail: 'api', pk: { ra: ['IOException', 'err'] }, panel: log(L), say: 'Back on the list, the user leaves the app, and Android closes it in the background. Later it opens offline. New ViewModels, but Room still has six rows: they show at once, with a note that the refresh failed.' },
            ],
          });
        },
        code: `// com.example.news
// ├─ NewsApp.kt                   @HiltAndroidApp
// ├─ MainActivity.kt              @AndroidEntryPoint, setContent { NewsNavHost() }
// ├─ ui/
// │  ├─ NewsNavHost.kt            routes ArticleList and ArticleDetail(id)
// │  ├─ ArticleListScreen.kt      PullToRefreshBox, one when for every state
// │  ├─ ArticleDetailScreen.kt
// │  ├─ NewsViewModel.kt          NewsUiState, refresh()
// │  └─ ArticleViewModel.kt       id from SavedStateHandle
// ├─ data/
// │  ├─ NewsRepository.kt         the interface, and OfflineFirstNewsRepository
// │  ├─ Article.kt, ArticleDao.kt, NewsDatabase.kt     Room
// │  └─ ArticleDto.kt, NewsApi.kt                      the server
// └─ di/
//    └─ DataModule.kt, RepositoryModule.kt             Hilt

@Composable
fun NewsNavHost() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = ArticleList) {
        composable<ArticleList> {
            val viewModel: NewsViewModel = hiltViewModel()
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            ArticleListScreen(
                state,
                onRefresh = { viewModel.refresh() },                                // event up
                onOpen = { id -> navController.navigate(ArticleDetail(id)) },
            )
        }
        composable<ArticleDetail> {
            val viewModel: ArticleViewModel = hiltViewModel()
            val article by viewModel.article.collectAsStateWithLifecycle()       // state down
            ArticleDetailScreen(article)
        }
    }
}`,
        remember: 'Events go up to the ViewModel, the repository writes to Room, Room’s Flow brings the state back down; Hilt builds it all.',
        mistakes: [
          { title: 'A shortcut from the screen to the data', bad: `@Composable
fun ArticleListScreen(state: NewsUiState, api: NewsApi) {
    val scope = rememberCoroutineScope()
    Button(onClick = { scope.launch { api.headlines() } }) { Text("Refresh") }
}`, good: `@Composable
fun ArticleListScreen(state: NewsUiState, onRefresh: () -> Unit) {
    Button(onClick = onRefresh) { Text("Refresh") }
}`, why: 'The screen’s download never reaches Room, so the list doesn’t change, and a rotation cancels it halfway. Send the event up; only the repository talks to the API.' },
        ],
        terms: [
          { term: 'end to end', def: 'Through every part of the app, from the user’s tap to the server and back to the screen.' },
          { term: 'process death', def: 'Android closing an app in the background to free memory. ViewModels are gone; data in Room, and the saved back stack, come back.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send the pull up as an event, and the tap as a navigation.', code: `ArticleListScreen(
    state,
    onRefresh = { viewModel.[[refresh]]() },
    onOpen = { id -> navController.[[navigate]](ArticleDetail(id)) },
)`, why: 'The screen only reports what happened. The ViewModel handles the refresh, and <code>NewsNavHost</code> owns the routes.' },
          { type: 'bug', prompt: 'The detail screen of an article doesn’t update when a refresh corrects its title. Tap the line.', code: `class OfflineFirstNewsRepository @Inject constructor(
    private val api: NewsApi,
    private val dao: ArticleDao,
) : NewsRepository {
    override val articles: Flow<List<Article>> = dao.observeAll()
    override fun article(id: String): Flow<Article?> = flow { emit(api.headlines().articles.firstOrNull { it.id == id }?.toArticle()) }
}`, bug: 5, fix: '    override fun article(id: String): Flow<Article?> = dao.observe(id)', why: 'That flow asks the server once and ignores Room. Offline it fails, and later writes never reach it. Reads come from Room: <code>dao.observe(id)</code>.' },
        ],
        quiz: [
          { q: 'The user turns the phone during a refresh. What happens to the refresh?', options: ['It keeps running in <code>viewModelScope</code> and finishes', 'It is cancelled and starts again', 'It is cancelled and lost'], a: 0, why: 'The ViewModel survives rotation, and so do the coroutines in its scope.' },
          { q: 'Which part is allowed to call <code>NewsApi</code>?', options: ['Only <code>OfflineFirstNewsRepository</code>', 'Any screen that needs fresh data', 'Both ViewModels'], a: 0, why: 'Dependencies point down. The ViewModels know the repository interface; only the repository knows the API.' },
          { q: 'You add a “saved for later” star to articles. Where do you start?', options: ['The lowest layer: a new column in Room, then the repository, the ViewModel, the screen', 'The screen, with a <code>remember</code> for each star', 'A new Activity'], a: 0, why: 'Data first, then upward, each layer tested by running the app. A star kept only in <code>remember</code> would vanish on the next launch.' },
        ],
        docs: [['Guide to app architecture', 'https://developer.android.com/topic/architecture'], ['Recommendations for Android architecture', 'https://developer.android.com/topic/architecture/recommendations']],
      },
    ],
  });
})();
