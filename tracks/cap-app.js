/* Capstone project: an offline-first news reader, built step by step.
   A project is a track with kind: 'project'. Each lesson is one build step and carries refs: ['track.lesson'].
   Every step's demo shows the same phone mock (the app as of that step) next to an architecture diagram
   (UI / ViewModel / Repository / Room / API) where the parts added in that step are lit. Classes start with ca-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  let uid = 0;
  const switchEl = (label, checked, onchange) => {
    const id = `ca-sw-${++uid}`;
    const input = h('input', { type: 'checkbox', id, checked });
    input.addEventListener('change', () => onchange(input.checked));
    return Object.assign(h('label', { class: 'switch', for: id }, input, label), { input });
  };
  let seed = 0x2b1;
  const addr = () => '@' + (seed = (seed * 37 + 0x1f3) % 0xfff).toString(16).padStart(3, '0');
  const q = s => `"${s}"`;

  // ---------- the news the fake server publishes, oldest first ----------
  const STORIES = [
    { id: 'a1', t: '07:05', source: 'Local', title: 'Library extends weekend opening hours', summary: 'Branches stay open until 6 pm on Saturdays and Sundays from next month.' },
    { id: 'a2', t: '07:40', source: 'Transport', title: 'Rail line reopens after two weeks of repairs', summary: 'Trains run the full timetable again, with slow sections near the bridge.' },
    { id: 'a3', t: '08:15', source: 'Science', title: 'Researchers map a deep-sea reef', summary: 'A survey team charted the reef with an underwater drone over six dives.' },
    { id: 'a4', t: '08:50', source: 'City Desk', title: 'City council approves new bike lanes', summary: 'Work on the first three kilometres starts in spring.' },
    { id: 'a5', t: '09:20', source: 'Weather', title: 'Storm expected along the coast on Friday', summary: 'Forecasters expect strong wind and heavy rain from the afternoon.' },
    { id: 'a6', t: '09:45', source: 'Sport', title: 'Home team wins the regional final', summary: 'A late goal settled the match in front of a full stadium.' },
    { id: 'a7', t: '10:10', source: 'Local', title: 'New park opens by the river', summary: 'The park adds a playground, a cafe and a path along the water.' },
    { id: 'a8', t: '10:35', source: 'Culture', title: 'Museum shows a rare map collection', summary: 'Around forty maps go on display, some for the first time.' },
  ];
  const copy = a => ({ ...a });
  const newest = arr => arr.slice().sort((a, b) => b.t.localeCompare(a.t));

  // ---------- phone mock ----------
  function phone() {
    const net = h('span', { class: 'ca-net' }, '5G');
    const back = h('button', { class: 'ca-back', type: 'button', 'aria-label': 'Back', hidden: true }, '‹');
    const title = h('span', { class: 'ca-title' }, 'News');
    const scroll = h('div', { class: 'ca-scroll' });
    const ptr = h('div', { class: 'ca-ptr', 'aria-hidden': 'true' });
    const snack = h('div', { class: 'ca-snack', role: 'status', hidden: true });
    const screen = h('div', { class: 'ca-screen' }, ptr, scroll, snack);
    const el = h('div', { class: 'ca-phone' },
      h('div', { class: 'ca-sb' }, h('span', {}, '9:41'), net),
      h('div', { class: 'ca-appbar' }, back, title), screen);
    let snackTimer;
    return {
      el, screen, scroll, ptr,
      show(nodes, opts = {}) {
        scroll.replaceChildren(...[].concat(nodes).filter(Boolean));
        title.textContent = opts.title || 'News';
        back.hidden = !opts.onBack;
        back.onclick = opts.onBack || null;
      },
      offline(off) { net.textContent = off ? 'offline' : '5G'; net.classList.toggle('off', off); },
      refreshing(on) { ptr.classList.toggle('on', !!on); },
      snackbar(text) {
        snack.textContent = text; snack.hidden = false; replay(snack, 'drop-in');
        clearTimeout(snackTimer); snackTimer = setTimeout(() => { snack.hidden = true; }, 2600);
      },
      hideSnack() { clearTimeout(snackTimer); snack.hidden = true; },
      async rotate() { replay(el, 'ca-rot'); await sleep(1000); el.classList.remove('ca-rot'); },
      async dark(ms) { el.classList.add('ca-dark'); await sleep(ms); el.classList.remove('ca-dark'); },
    };
  }
  const card = (a, onOpen, fresh) => h('button', { class: 'ca-card' + (fresh ? ' ca-fresh' : ''), type: 'button', onclick: () => onOpen && onOpen(a) },
    h('b', {}, a.title), h('small', {}, `${a.source} · ${a.t}`));
  const listView = (arts, onOpen, fresh = []) => arts.map(a => card(a, onOpen, fresh.includes(a.id)));
  const detailView = a => h('div', { class: 'ca-detail drop-in' }, h('small', {}, a.source), h('h4', {}, a.title), h('p', {}, a.summary),
    h('div', { class: 'ca-lines', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  const center = ({ spin, title, note, btn } = {}) => h('div', { class: 'ca-center' },
    spin ? h('span', { class: 'ca-spin', 'aria-hidden': 'true' }) : null,
    title ? h('b', {}, title) : null, note ? h('span', {}, note) : null, btn || null);

  // ---------- architecture diagram ----------
  const LAYER = { ui: 'UI', vm: 'ViewModel', repo: 'Repository', db: 'Room', api: 'API' };
  // spec: { ui: [state, label], ... , hilt: 'new' | 'have' }   state: 'todo' | 'have' | 'new' | 'lit'
  function arch(spec) {
    const nodes = {}, wires = {};
    const node = k => {
      const [state, label] = spec[k] || ['todo'];
      const lab = h('span', {}, label || 'not built yet');
      const n = h('div', { class: `ca-node ${state}` }, h('b', {}, LAYER[k]), lab, h('em', {}, 'this step'));
      nodes[k] = Object.assign(n, { lab });
      return n;
    };
    const wire = (k, label) => {
      const pk = h('span', { class: 'ca-pk' });
      const w = h('div', { class: 'ca-wire' }, h('span', { class: 'ca-wl' }, label), pk);
      wires[k] = Object.assign(w, { pk });
      return w;
    };
    const el = h('div', { class: 'ca-arch' + (spec.hilt ? ' ca-hilt' : '') + (spec.hilt === 'new' ? ' ca-hilt-new' : ''), 'aria-label': 'App architecture' },
      spec.hilt ? h('span', { class: 'ca-hiltlab' }, spec.hilt === 'new' ? 'Hilt builds all of this · this step' : 'Wired by Hilt') : null,
      node('ui'), wire('uv', '↑ StateFlow · ↓ events'),
      node('vm'), wire('vr', '↑ Flow<List<Article>> · ↓ refresh()'),
      node('repo'),
      h('div', { class: 'ca-split' }, wire('rd', '↕ read / write'), wire('ra', '↕ suspend call')),
      h('div', { class: 'ca-split' }, node('db'), node('api')));
    return Object.assign(el, {
      nodes,
      ping(k) { replay(nodes[k], 'ping'); },
      pkt(k, text, cls = '') { wires[k].pk.replaceChildren(h('span', { class: `ca-pkt drop-in ${cls}` }, text)); },
      clear() { Object.values(wires).forEach(w => w.pk.replaceChildren()); Object.values(nodes).forEach(n => n.classList.remove('fail')); },
      fail(k) { nodes[k].classList.add('fail'); replay(nodes[k], 'shake'); },
      set(k, state, label) { nodes[k].className = `ca-node ${state}`; if (label) nodes[k].lab.textContent = label; },
    });
  }

  // Standard layout: phone on the left, diagram and a step panel on the right, controls and output below.
  const layout = (el, ph, ar, panel, controls, o) =>
    el.append(h('div', { class: 'ca-top' }, ph.el, h('div', { class: 'ca-side' }, ar, panel)), controls, o);
  const panelBox = (cap, ...kids) => h('div', { class: 'ca-panel' }, h('span', { class: 'ca-cap' }, cap), ...kids);

  // ---------- offline-first simulator, shared by the cache, states and recap steps ----------
  // mode 5: Room cache + repository. mode 7: full UiState + pull to refresh. mode 8: the whole app.
  function offlineApp(el, mode) {
    const full = mode >= 7;
    const S = { online: true, emptyServer: false, server: STORIES.slice(0, 4).map(copy), next: 4, db: [], running: true, loading: false, refreshing: false, error: null, screen: null, vm: addr(), avm: null, activity: 1 };
    S.db = newest(S.server).map(copy);
    let busy = false, rotating = false, dragged = false;
    const blocked = () => busy || S.refreshing;

    const specs = {
      5: { ui: ['have', 'ArticleListScreen'], vm: ['have', 'NewsViewModel'], repo: ['new', 'OfflineFirstNewsRepository'], db: ['new', 'ArticleDao · NewsDatabase'], api: ['have', 'NewsApi'] },
      7: { ui: ['new', 'PullToRefreshBox + when'], vm: ['new', 'NewsViewModel.refresh()'], repo: ['have', 'OfflineFirstNewsRepository'], db: ['have', 'ArticleDao'], api: ['have', 'NewsApi'], hilt: 'have' },
      8: { ui: ['lit', 'ArticleListScreen · ArticleDetailScreen'], vm: ['lit', 'NewsViewModel · ArticleViewModel'], repo: ['lit', 'OfflineFirstNewsRepository'], db: ['lit', 'ArticleDao'], api: ['lit', 'NewsApi'], hilt: 'have' },
    };
    const ph = phone();
    const A = arch(specs[mode]);
    const o = out(mode === 5 ? 'Room already holds 4 articles from an earlier refresh. Refresh, go offline, or edit a row.'
      : mode === 7 ? 'Drag the list down to refresh, or press onRefresh(). Then try offline, or clear the app data.'
        : 'The whole app. Pull to refresh, open an article, rotate, go offline, kill the process.');

    // panels
    let table, stateBox, whenBox, logEl, prevFields = null;
    const BR = ['state.isLoading -> Spinner', 'empty && isRefreshing -> Spinner', 'empty && errorMessage != null -> Error', 'articles.isEmpty() -> Empty', 'else -> List'];
    const branches = BR.map(b => h('div', { class: 'branch', html: hl(b) }));
    function paintTable(added = [], changed = []) {
      if (!table) return;
      table.replaceChildren(h('div', { class: 'ca-tr ca-th' }, h('span', {}, 'id'), h('span', {}, 'title')),
        ...(S.db.length ? S.db.map(r => h('div', { class: 'ca-tr' + (added.includes(r.id) ? ' add' : '') + (changed.includes(r.id) ? ' chg' : '') }, h('span', {}, r.id), h('span', {}, r.title)))
          : [h('div', { class: 'ca-tempty' }, 'No rows. The table is empty.')]));
    }
    function paintState() {
      if (!stateBox) return;
      const f = [['articles', `${S.db.length} items`], ['isLoading', String(S.loading)], ['isRefreshing', String(S.refreshing)], ['errorMessage', S.error ? q('No connection…') : 'null']];
      const changed = prevFields ? f.filter((x, i) => x[1] !== prevFields[i][1]).map(x => x[0]) : [];
      prevFields = f;
      stateBox.replaceChildren(h('div', { class: 'obj ca-obj' }, h('span', { class: 'obj-name' }, 'NewsUiState'),
        f.map(([k, v]) => h('span', { class: 'field' + (changed.includes(k) ? ' changed' : '') }, `${k} = ${v}`))));
    }
    function log(layer, html) {
      if (!logEl) return;
      logEl.prepend(h('div', { class: 'ca-li drop-in' }, h('span', { class: `ca-lt ca-lt-${layer}` }, LAYER[layer]), h('span', { html })));
      while (logEl.children.length > 6) logEl.lastChild.remove();
    }

    function paint(fresh = []) {
      if (!S.running) return;
      if (S.screen) {
        const a = S.db.find(x => x.id === S.screen);
        ph.show(a ? detailView(a) : center({ title: 'Article not found' }), { title: 'Article', onBack: back });
        ph.refreshing(false);
        return;
      }
      const rows = S.db;
      let b;
      if (S.loading) b = 0;
      else if (!full) b = rows.length ? 4 : 5;
      else if (!rows.length && S.refreshing) b = 1;
      else if (!rows.length && S.error) b = 2;
      else if (!rows.length) b = 3;
      else b = 4;
      const retry = h('button', { class: 'ca-btn', type: 'button', onclick: () => refresh() }, 'Retry');
      const views = [
        center({ spin: true }), center({ spin: true, note: 'Loading news…' }),
        center({ title: 'No connection', note: 'Nothing saved yet.', btn: retry }),
        center({ title: 'No news yet', note: 'Pull down to refresh.' }),
        listView(rows, openFromCard, fresh), [],
      ];
      ph.show(views[b], { title: 'News' });
      ph.refreshing(full && S.refreshing && rows.length > 0);
      branches.forEach((x, i) => { x.classList.toggle('ca-hit', i === b); x.classList.toggle('ca-dim', i !== b); });
    }

    const wait = async ms => { await sleep(ms); return el.isConnected; };

    async function refresh() {
      if (!S.running) return;
      if (busy) { say(o, 'Wait for the app to finish starting.'); return; }
      if (S.refreshing) { say(o, `refresh() returns early: ${hl('isRefreshing')} is already true.`); return; }
      S.refreshing = true; if (full) S.error = null;
      ph.hideSnack(); A.clear(); paint(); paintState();
      A.ping('vm'); A.pkt('uv', 'refresh()'); log('vm', 'refresh(): isRefreshing = true');
      if (!(await wait(350))) return;
      A.ping('repo'); A.pkt('vr', 'repository.refresh()');
      if (!(await wait(350))) return;
      A.ping('api'); A.pkt('ra', 'GET top-headlines'); log('api', 'GET v1/top-headlines');
      if (!(await wait(650))) return;
      if (!S.online) {
        A.fail('api'); A.pkt('ra', 'UnknownHostException', 'err'); log('api', '<span class="bad">UnknownHostException</span>');
        if (!(await wait(350))) return;
        A.ping('vm'); A.pkt('vr', 'throws IOException', 'err');
        S.refreshing = false;
        if (full) S.error = 'No connection. Showing saved news.';
        paint(); paintState();
        if (full && S.db.length && !S.screen) ph.snackbar('No connection. Showing saved news.');
        log('vm', full ? 'catch IOException: errorMessage set' : 'catch IOException: keep cached rows');
        say(o, S.db.length
          ? `<span class="bad">offline:</span> the request failed. The ${S.db.length} rows in Room stay on screen${full ? ', and a snackbar says why' : ''}.`
          : full ? '<span class="bad">offline:</span> nothing saved and no network, so the error screen offers Retry.'
            : '<span class="bad">offline:</span> nothing saved yet, so the list is blank. Step 7 adds proper empty and error screens.');
        return;
      }
      if (!S.emptyServer && S.next < STORIES.length) S.server.push(copy(STORIES[S.next++]));
      const resp = S.emptyServer ? [] : newest(S.server).map(copy);
      A.ping('repo'); A.pkt('ra', `200 OK · ${resp.length} articles`, 'ok');
      if (!(await wait(350))) return;
      const fresh = resp.filter(r => !S.db.some(d => d.id === r.id)).map(r => r.id);
      const changed = resp.filter(r => S.db.some(d => d.id === r.id && d.title !== r.title)).map(r => r.id);
      S.db = newest([...resp, ...S.db.filter(d => !resp.some(r => r.id === d.id))]);
      A.ping('db'); A.pkt('rd', `upsertAll(${resp.length})`); paintTable(fresh, changed);
      log('db', `upsertAll(${resp.length}): ${fresh.length} new row${fresh.length === 1 ? '' : 's'}`);
      if (!(await wait(420))) return;
      A.ping('repo'); A.pkt('rd', 'Flow emits', 'ok');
      if (!(await wait(300))) return;
      A.ping('vm'); A.pkt('vr', `List<Article>(${S.db.length})`, 'ok');
      S.refreshing = false;
      if (!(await wait(250))) return;
      A.ping('ui'); A.pkt('uv', 'NewsUiState', 'ok'); log('ui', `list shows ${S.db.length} articles`);
      paint(fresh); paintState();
      say(o, resp.length
        ? `<span class="good">ok:</span> ${fresh.length ? `${fresh.length} new article${fresh.length > 1 ? 's' : ''} written to Room.` : 'Room already had these rows.'} Room re-ran ${hl('observeAll()')} and the screen followed.${changed.length ? ' The upsert also replaced your edited title with the server’s.' : ''}`
        : `<span class="good">ok:</span> the server sent 0 articles. ${S.db.length ? 'Room keeps its rows, so the list stays.' : 'Room is empty too, so the screen shows the empty state.'}`);
    }

    async function launch(note) {
      busy = true; S.running = true; S.screen = null; S.loading = true; S.error = null; S.refreshing = false; S.vm = addr(); S.avm = null; prevFields = null;
      ph.hideSnack(); A.clear();
      await ph.dark(420); if (!el.isConnected) return;
      paint(); paintState();
      log('ui', `${note}: new process, NewsViewModel ${S.vm}`);
      A.ping('db'); A.pkt('rd', 'observeAll()');
      if (!(await wait(420))) return;
      S.loading = false; A.ping('vm'); A.pkt('vr', `List<Article>(${S.db.length})`, 'ok'); paint(); paintState();
      log('db', `Room emits ${S.db.length} saved row${S.db.length === 1 ? '' : 's'}`);
      say(o, S.db.length ? `Room had ${S.db.length} saved articles. They show at once, then ${hl('init { refresh() }')} asks the network.` : 'Room is empty: a first launch. The screen waits for the network.');
      if (!(await wait(700))) return;
      busy = false;
      await refresh();
    }

    function openFromCard(a) { if (dragged) { dragged = false; return; } open(a.id); }
    function open(id) {
      if (!S.running || busy) return;
      S.screen = id; ph.hideSnack(); paint(); A.ping('ui');
      if (mode === 8) {
        S.avm = addr();
        A.ping('vm'); A.pkt('vr', `observeArticle(${q(id)})`); A.pkt('rd', `observe(${q(id)})`);
        log('ui', `navigate(ArticleDetail(${q(id)})): ArticleViewModel ${S.avm}`);
        say(o, `${hl(`navigate(ArticleDetail(id = "${id}"))`)}. ArticleViewModel reads the id from SavedStateHandle and observes that row in Room. It works offline too.`);
      } else say(o, `Opened ${q(id)}. The detail screen reads the same row from Room.`);
    }
    function back() {
      if (!S.screen) return;
      S.screen = null; paint();
      if (mode === 8) { log('ui', `popBackStack(): ArticleViewModel ${S.avm} cleared`); S.avm = null; }
      say(o, `${hl('popBackStack()')}: back on the list.`);
    }

    // panels and controls per mode
    let panel, controls;
    const offSw = switchEl('Offline', false, v => {
      S.online = !v; ph.offline(v);
      say(o, v ? 'Network off. Requests now fail with an IOException.' : 'Network back on.');
    });
    if (mode === 5) {
      table = h('div', { class: 'ca-table' });
      panel = panelBox('Room table: articles', table);
      controls = h('div', { class: 'controls' },
        cmd('repository.refresh()', () => refresh()),
        offSw,
        cmd('Reopen app', () => { if (blocked()) { say(o, 'Wait for the current refresh to finish.'); return; } launch('Reopened'); }),
        cmd('dao.update(title)', async () => {
          if (blocked()) { say(o, 'Wait for the current refresh to finish.'); return; }
          const row = S.db.find(r => !r.title.endsWith('(updated)'));
          if (!row) { say(o, 'Every row is already edited. Refresh to get the server titles back.'); return; }
          busy = true; A.clear();
          row.title = row.title.split(' ').slice(0, 3).join(' ') + ' (updated)';
          A.ping('db'); A.pkt('rd', 'UPDATE articles'); paintTable([], [row.id]);
          if (!(await wait(420))) return;
          A.ping('repo'); A.pkt('rd', 'Flow emits', 'ok');
          if (!(await wait(300))) return;
          A.ping('vm'); A.pkt('vr', `List<Article>(${S.db.length})`, 'ok');
          if (!(await wait(250))) return;
          A.ping('ui'); A.pkt('uv', 'NewsUiState', 'ok'); paint([row.id]);
          say(o, `Nobody called refresh. The write touched ${hl('articles')}, Room re-ran the query, and the screen changed. That is the single source of truth at work.`);
          busy = false;
        }));
      paintTable();
    } else if (mode === 7) {
      stateBox = h('div', { class: 'ca-stateslot' });
      whenBox = h('div', { class: 'when ca-when' }, h('div', { class: 'branch head', html: hl('when {') }), branches, h('div', { class: 'branch head', html: hl('}') }));
      panel = h('div', { class: 'ca-panel ca-two' }, stateBox, whenBox);
      controls = h('div', { class: 'controls' },
        cmd('onRefresh()', () => refresh()),
        offSw,
        switchEl('Server returns 0 articles', false, v => { S.emptyServer = v; say(o, v ? 'The API now answers 200 OK with an empty list.' : 'The API sends articles again.'); }),
        cmd('Clear app data', () => {
          if (blocked()) { say(o, 'Wait for the current refresh to finish.'); return; }
          S.db = []; launch('Fresh install');
        }));
      paintState();
    } else {
      logEl = h('div', { class: 'ca-log', 'aria-live': 'polite' });
      panel = panelBox('What each layer did, newest first', logEl);
      controls = h('div', { class: 'controls' },
        cmd('onRefresh()', () => refresh()),
        cmd('open article', () => { if (S.screen) { say(o, 'Already on an article. Press the back arrow.'); return; } if (!S.db.length || S.loading) { say(o, 'No articles to open yet.'); return; } open(S.db[0].id); }),
        cmd('rotate()', async () => {
          if (rotating || busy) return;
          rotating = true; S.activity++;
          await ph.rotate(); if (!el.isConnected) return;
          paint();
          A.ping('ui');
          log('ui', `Activity #${S.activity}: same NewsViewModel ${S.vm}`);
          say(o, `Activity #${S.activity} drew the same state. NewsViewModel ${S.vm} survived${S.avm ? `, so did ArticleViewModel ${S.avm}` : ''}${S.refreshing ? ', and the running refresh kept going' : ''}. No new request.`);
          rotating = false;
        }),
        offSw,
        cmd('Kill process + reopen', () => {
          if (blocked()) { say(o, 'Wait for the current refresh to finish.'); return; }
          launch('Process killed and reopened');
        }));
      log('ui', `App running: NewsViewModel ${S.vm}`);
    }

    // Pull to refresh by dragging the list (modes 7 and 8).
    if (full) {
      ph.scroll.classList.add('ca-pull');
      let drag = null;
      ph.screen.addEventListener('pointerdown', e => {
        if (S.screen || !S.running || busy || S.refreshing) return;
        drag = { y: e.clientY, id: e.pointerId, moved: false }; dragged = false;
      });
      ph.screen.addEventListener('pointermove', e => {
        if (!drag) return;
        const dy = e.clientY - drag.y;
        if (dy > 8 && !drag.moved) { drag.moved = true; dragged = true; try { ph.screen.setPointerCapture(drag.id); } catch (err) { /* pointer already gone */ } ph.scroll.classList.add('ca-drag'); ph.ptr.classList.add('ca-drag'); }
        if (drag.moved) { const d = Math.max(0, Math.min(60, dy / 2)); ph.scroll.style.transform = `translateY(${d}px)`; ph.ptr.style.transform = `translateY(${d - 30}px) rotate(${dy * 2}deg)`; }
      });
      const end = e => {
        if (!drag) return;
        const dy = e.clientY - drag.y, moved = drag.moved;
        drag = null;
        ph.scroll.classList.remove('ca-drag'); ph.ptr.classList.remove('ca-drag');
        ph.scroll.style.transform = ''; ph.ptr.style.transform = '';
        if (moved && dy > 80) refresh();
        else if (moved) say(o, 'Pull a little further to trigger onRefresh().');
        setTimeout(() => { dragged = false; }, 0);
      };
      ph.screen.addEventListener('pointerup', end);
      ph.screen.addEventListener('pointercancel', end);
    }

    paint();
    layout(el, ph, A, panel, controls, o);
  }

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
.ca-back { border: 0; background: none; color: var(--ink); font: 700 1.3rem/1 var(--body); cursor: pointer; padding: 0 6px 2px 0; }
.ca-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-screen { flex: 1; position: relative; overflow: hidden; min-height: 0; }
.ca-scroll { display: grid; gap: 6px; padding: 8px; align-content: start; height: 100%; box-sizing: border-box; transition: transform 0.25s; }
.ca-scroll.ca-pull { touch-action: none; }
.ca-scroll.ca-drag, .ca-ptr.ca-drag { transition: none; }
.ca-card { display: grid; gap: 2px; width: 100%; text-align: left; padding: 7px 9px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; font: inherit; transition: background 0.4s, border-color 0.4s; }
.ca-card:hover { border-color: var(--accent); }
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
.ca-btn { font: 700 0.74rem var(--body); padding: 5px 14px; border-radius: 999px; border: 1px solid var(--accent); background: none; color: var(--accent); cursor: pointer; }
.ca-ptr { position: absolute; left: 50%; top: 0; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; transform: translateY(-36px); transition: transform 0.25s; z-index: 2; pointer-events: none; }
.ca-ptr::after { content: ""; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid var(--sunk); border-top-color: var(--accent); }
.ca-ptr.on { transform: translateY(10px); }
.ca-ptr.on::after { animation: spin 0.8s linear infinite; }
.ca-snack { position: absolute; left: 8px; right: 8px; bottom: 8px; padding: 8px 10px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: 0.7rem; font-weight: 700; z-index: 2; }

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

.ca-panel { display: grid; gap: 8px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); min-width: 0; align-content: start; }
.ca-panel.ca-two { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); align-items: start; }
@media (max-width: 1100px) { .ca-panel.ca-two { grid-template-columns: minmax(0, 1fr); } }
.ca-cap { font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.ca-obj { min-width: 0; font-size: 0.78rem; padding: 10px 12px; overflow-wrap: anywhere; }
.ca-stateslot { min-width: 0; display: grid; }
.ca-when { padding: 10px; }
.ca-when .branch { font-size: 0.74rem; padding: 3px 8px; }
.when .branch.ca-hit { background: rgba(126, 226, 168, 0.16); border-color: var(--t-k); }
.when .branch.ca-dim { opacity: 0.4; }

.ca-toml { display: grid; gap: 2px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; overflow-x: auto; }
.ca-thead { font: 500 0.74rem var(--mono); color: var(--t-c); padding: 2px 8px; }
.ca-trow { display: flex; justify-content: space-between; gap: 8px; width: 100%; text-align: left; font: 500 0.76rem var(--mono); color: var(--code-ink); background: none; border: 1px solid transparent; border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: background 0.2s, opacity 0.2s; }
.ca-trow:hover { border-color: rgba(126, 226, 168, 0.4); }
.ca-trow em { font-style: normal; color: var(--t-k); }
.ca-trow.on { background: rgba(126, 226, 168, 0.14); }
.ca-trow.bad { background: rgba(255, 138, 155, 0.18); }
.ca-trow.bad em { color: var(--t-e); }
.ca-trow.skip { opacity: 0.4; text-decoration: line-through; }

.ca-stack { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 34px; }
.ca-route { font: 600 0.74rem var(--mono); padding: 5px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; }
.ca-route.top { border-color: var(--accent); background: var(--accent-soft); }
.ca-sep { color: var(--muted); font: 600 0.8rem var(--mono); }

.ca-vms { display: flex; flex-wrap: wrap; gap: 6px; }
.ca-vm { font: 600 0.72rem var(--mono); padding: 3px 9px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.ca-vm.cur { background: var(--accent); color: var(--accent-ink); }
.ca-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font: 600 0.78rem var(--mono); color: var(--ink); }

.ca-json { display: grid; background: var(--code-bg); border-radius: 12px; padding: 8px 4px; overflow-x: auto; min-width: 0; }
.ca-jl { font: 500 0.72rem/1.55 var(--mono); color: var(--code-ink); white-space: pre; padding: 0 8px; border-radius: 4px; transition: background 0.2s, opacity 0.2s; }
.ca-jl.hit { background: rgba(126, 226, 168, 0.16); }
.ca-jl.ign { opacity: 0.45; text-decoration: line-through; }
.ca-jl.dead { opacity: 0.3; }
.ca-count { justify-self: start; font: 600 0.72rem var(--mono); padding: 2px 9px; border-radius: 999px; background: var(--sunk); color: var(--muted); }

.ca-table { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--surface); min-width: 0; }
.ca-tr { display: grid; grid-template-columns: 2.6em minmax(0, 1fr); gap: 6px; padding: 5px 9px; border-top: 1px solid var(--line); font: 500 0.74rem var(--mono); color: var(--ink); transition: background 0.4s; }
.ca-tr > span { overflow-wrap: anywhere; }
.ca-tr.ca-th { border-top: 0; font-weight: 700; color: var(--muted); background: var(--sunk); }
.ca-tr.add { background: var(--ok-soft); }
.ca-tr.chg { background: var(--warm-soft); }
.ca-tempty { padding: 10px 9px; font-size: 0.78rem; color: var(--muted); border-top: 1px solid var(--line); }

.ca-graph { display: grid; gap: 4px; min-width: 0; }
.ca-gh { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-top: 4px; }
.ca-gi { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 5px 9px; border-radius: 8px; border: 1px dashed var(--line); background: var(--surface); font: 600 0.74rem var(--mono); color: var(--muted); transition: border-color 0.25s, color 0.25s, opacity 0.25s; min-width: 0; }
.ca-gi > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.ca-gi.made { border-style: solid; border-color: var(--accent); color: var(--ink); }
.ca-gi.gone { opacity: 0.45; text-decoration: line-through; }
.ca-gi small { font: 500 0.66rem var(--mono); color: var(--muted); }
.ca-gi .ca-vm { margin-left: auto; }

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
    description: 'Build an offline-first news reader, from an empty project to a working app.',
    builds: 'A Compose app that lists headlines, opens articles, refreshes from an API with pull-to-refresh, and keeps working offline from a Room cache, all wired with Hilt.',
    group: 'Building apps',
    requires: ['compose', 'flow', 'arch'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'setup',
        title: 'Project setup and version catalog',
        tagline: 'One catalog, one app module, an empty screen that runs.',
        level: 'beginner',
        refs: ['build.catalogs', 'build.gradle', 'arch.layers'],
        body: `
<p>We are building <b>News</b>: an app that lists headlines, opens an article, and keeps working offline. This first step creates the project and lists every library it will use in <code>gradle/libs.versions.toml</code>, so the later steps only add code.</p>
<p>Each library serves one layer. Compose and Navigation draw the UI, Lifecycle holds the ViewModel, Retrofit and kotlinx.serialization talk to the API, Room stores the cache, and Hilt wires it together. Room and Hilt generate code with KSP. AGP 9 compiles Kotlin itself, so there is no <code>kotlin-android</code> plugin. You still apply the Compose and serialization compiler plugins.</p>
<p>The Compose BOM picks matching versions for every Compose library, so those entries have no version of their own. Tap a catalog entry to see which layer it feeds, sync the project, then run the empty app.</p>`,
        code: `# gradle/libs.versions.toml
[versions]
agp = "9.4.0"
kotlin = "2.4.21"
ksp = "2.3.11"
composeBom = "2026.09.00"
activity = "1.13.0"
lifecycle = "2.11.0"
navigation = "2.10.2"
room = "2.8.5"
hilt = "2.60.1"
androidxHilt = "1.4.0"
retrofit = "3.0.0"
serialization = "1.11.0"

[libraries]
compose-bom = { module = "androidx.compose:compose-bom", version.ref = "composeBom" }
compose-material3 = { module = "androidx.compose.material3:material3" }
activity-compose = { module = "androidx.activity:activity-compose", version.ref = "activity" }
lifecycle-runtime-compose = { module = "androidx.lifecycle:lifecycle-runtime-compose", version.ref = "lifecycle" }
lifecycle-viewmodel-compose = { module = "androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "lifecycle" }
navigation-compose = { module = "androidx.navigation:navigation-compose", version.ref = "navigation" }
room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }
room-compiler = { module = "androidx.room:room-compiler", version.ref = "room" }
hilt-android = { module = "com.google.dagger:hilt-android", version.ref = "hilt" }
hilt-compiler = { module = "com.google.dagger:hilt-compiler", version.ref = "hilt" }
hilt-viewmodel-compose = { module = "androidx.hilt:hilt-lifecycle-viewmodel-compose", version.ref = "androidxHilt" }
retrofit = { module = "com.squareup.retrofit2:retrofit", version.ref = "retrofit" }
retrofit-serialization = { module = "com.squareup.retrofit2:converter-kotlinx-serialization", version.ref = "retrofit" }
serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "serialization" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }

// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)   // AGP 9 compiles Kotlin itself
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

android {
    namespace = "com.example.news"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.example.news"
        minSdk = 26
        targetSdk = 36
    }
}

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.material3)
    implementation(libs.activity.compose)
    implementation(libs.lifecycle.runtime.compose)
    implementation(libs.lifecycle.viewmodel.compose)
    implementation(libs.navigation.compose)
    implementation(libs.room.runtime)
    ksp(libs.room.compiler)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.viewmodel.compose)
    implementation(libs.retrofit)
    implementation(libs.retrofit.serialization)
    implementation(libs.serialization.json)
}

// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme {
                Scaffold { padding ->
                    Text("Hello, News", Modifier.padding(padding))
                }
            }
        }
    }
}`,
        remember: 'Every version lives in libs.versions.toml. The Compose BOM picks the Compose versions.',
        terms: [
          { term: 'Compose BOM', def: 'A Bill of Materials artifact, androidx.compose:compose-bom, that sets matching versions for every Compose library you add without a version.' },
          { term: 'Built-in Kotlin', def: 'AGP 9 behaviour where the Android Gradle plugin compiles Kotlin sources itself, so modules no longer apply org.jetbrains.kotlin.android.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Apply KSP, pull Compose versions from the BOM, and run Room’s compiler.', code: 'plugins {\n    alias(libs.plugins.android.application)\n    alias(libs.plugins.[[ksp]])\n}\ndependencies {\n    implementation([[platform]](libs.compose.bom))\n    implementation(libs.compose.material3)\n    implementation(libs.room.runtime)\n    [[ksp]](libs.room.compiler)\n}', why: 'The BOM only works inside <code>platform(...)</code>. Annotation processors like Room’s compiler go in the <code>ksp</code> configuration that the KSP plugin creates.' },
          { type: 'bug', prompt: 'The build script won’t compile. Tap the line.', code: 'plugins {\n    alias(libs.plugins.android.application)\n    alias(libs.plugins.kotlin.compose)\n    alias(libs.plugins.ksp)\n}\ndependencies {\n    implementation(platform(libs.compose.bom))\n    implementation(libs.room.runtime)\n    kapt(libs.room.compiler)\n}', bug: 8, fix: '    ksp(libs.room.compiler)', why: 'The project applies KSP, not kapt, so there is no <code>kapt</code> configuration and the call is an unresolved reference. Room recommends KSP for Kotlin code.' },
        ],
        quiz: [
          { q: 'Why does <code>compose-material3</code> have no version in the catalog?', options: ['The BOM, added with <code>platform(...)</code>, supplies it', 'Gradle picks the newest release on its own', 'Material 3 is part of the Android SDK'], a: 0, why: 'The BOM is a list of matching versions. Libraries from it can leave their version out.' },
          { q: 'Which configuration adds Room’s compiler in this project?', options: ['<code>implementation</code>', '<code>ksp</code>', '<code>kapt</code>'], a: 1, why: 'The compiler is a code generator, so it runs in KSP. It doesn’t ship inside the app.' },
          { q: 'With AGP 9, what happens to the <code>org.jetbrains.kotlin.android</code> plugin?', options: ['You still need it for Kotlin files', 'You remove it: AGP compiles Kotlin itself', 'It is renamed to <code>kotlin-compose</code>'], a: 1, why: 'AGP 9 turns on built-in Kotlin by default. Compiler plugins like Compose and serialization are still applied on their own.' },
        ],
        visual(el) {
          const ENTRIES = [
            ['compose-bom', 'platform(libs.compose.bom)', ['ui'], 'one version for all Compose libraries'],
            ['compose-material3', 'libs.compose.material3', ['ui'], 'no version: the BOM picks it'],
            ['navigation-compose', 'libs.navigation.compose', ['ui'], 'NavHost and typed routes'],
            ['lifecycle-viewmodel-compose', 'libs.lifecycle.viewmodel.compose', ['vm'], 'ViewModels in composables'],
            ['retrofit', 'libs.retrofit', ['api'], 'HTTP calls from an interface'],
            ['serialization-json', 'libs.serialization.json', ['api'], 'JSON into Kotlin classes'],
            ['room-runtime', 'libs.room.runtime', ['db'], 'the local database, compiled by KSP'],
            ['hilt-android', 'libs.hilt.android', ['ui', 'vm', 'repo', 'db', 'api'], 'builds and connects every layer'],
          ];
          const ph = phone();
          ph.show(center({ title: 'Not built yet', note: 'Sync the project, then run it.' }));
          const A = arch({ ui: ['new', 'MainActivity'] });
          const o = out('Tap a catalog entry to see its accessor and the layer it feeds.');
          let bom = true, synced = false, busy = false;
          const rows = ENTRIES.map(([name, acc, layers, note]) => h('button', { class: 'ca-trow', type: 'button', onclick() {
            if (busy) return;
            rows.forEach(r => r.classList.remove('on')); this.classList.add('on');
            layers.forEach(k => A.ping(k));
            const call = name === 'compose-bom' ? 'implementation(platform(libs.compose.bom))' : `implementation(${acc})`;
            say(o, `${hl(call)} <span class="muted">// ${note}</span>`);
          } }, h('span', {}, name), h('em', {})));
          const bomSw = switchEl('platform(libs.compose.bom)', true, v => {
            bom = v; synced = false;
            rows.forEach(r => { r.classList.remove('ok', 'bad', 'skip', 'on'); r.lastChild.textContent = ''; });
            say(o, v ? 'BOM back in the dependencies. Sync again.' : 'BOM removed from the dependencies. Sync to see what breaks.');
          });
          async function sync() {
            if (busy) return;
            busy = true; synced = false; A.clear();
            rows.forEach(r => { r.classList.remove('ok', 'bad', 'skip', 'on'); r.lastChild.textContent = ''; });
            say(o, 'Syncing: Gradle reads the catalog and resolves each library…');
            for (let i = 0; i < rows.length; i++) {
              const r = rows[i], name = ENTRIES[i][0];
              r.classList.add('on');
              await sleep(200); if (!el.isConnected) return;
              r.classList.remove('on');
              if (name === 'compose-bom' && !bom) { r.classList.add('skip'); continue; }
              if (name === 'compose-material3' && !bom) {
                r.classList.add('bad'); r.lastChild.textContent = '✗'; replay(r, 'shake');
                say(o, '<span class="bad">Could not find androidx.compose.material3:material3:.</span> No version in the catalog and no BOM to supply one.');
                busy = false; return;
              }
              r.lastChild.textContent = '✓';
            }
            synced = true; busy = false;
            say(o, '<span class="good">BUILD SUCCESSFUL.</span> Gradle generated the type-safe <code>libs.*</code> accessors.');
          }
          async function run() {
            if (busy) return;
            if (!synced) { replay(ph.el, 'shake'); say(o, 'Sync the project first. The build can’t resolve its libraries yet.'); return; }
            busy = true;
            await ph.dark(450); if (!el.isConnected) return;
            ph.show(center({ title: 'Hello, News', note: 'One screen, no data yet.' }));
            A.ping('ui');
            say(o, `${hl('MainActivity.onCreate()')} called ${hl('setContent { }')}. The app runs. Next step: real screens.`);
            busy = false;
          }
          layout(el, ph, A, panelBox('libs.versions.toml', h('div', { class: 'ca-toml' }, h('div', { class: 'ca-thead' }, '[libraries]'), rows)),
            h('div', { class: 'controls' }, cmd('Sync project', sync), cmd('Run app', run), bomSw), o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'screens',
        title: 'List and detail screens with typed routes',
        tagline: 'Two screens, two routes, sample data for now.',
        level: 'beginner',
        refs: ['compose.lazy-keys', 'compose.hoisting', 'compose2.navigation'],
        body: `
<p>Now the app gets its two screens: a list of headlines and an article page. Both read from a hard-coded <code>sampleArticles</code> list, so you can build the UI before any data layer exists.</p>
<p>The list is a <code>LazyColumn</code> with <code>key = { it.id }</code>, so rows keep their identity when new articles arrive later. Each screen takes plain data and lambdas like <code>onArticleClick</code>. That is state hoisting: the screens know nothing about navigation or where the data comes from.</p>
<p>Navigation uses typed routes. <code>ArticleList</code> is a <code>data object</code>, <code>ArticleDetail(id)</code> is a <code>data class</code>, and both are <code>@Serializable</code>. Pass the id, not the whole article. Tap a headline below and watch the back stack.</p>`,
        code: `// Article.kt: the app's own model
data class Article(
    val id: String,
    val title: String,
    val source: String,
    val summary: String,
    val publishedAt: String,   // ISO 8601 in UTC, e.g. "2026-10-16T08:50:00Z"
)

// Routes
@Serializable data object ArticleList
@Serializable data class ArticleDetail(val id: String)

@Composable
fun NewsNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = ArticleList) {
        composable<ArticleList> {
            ArticleListScreen(
                articles = sampleArticles,
                onArticleClick = { id -> navController.navigate(ArticleDetail(id)) },
            )
        }
        composable<ArticleDetail> { entry ->
            val route: ArticleDetail = entry.toRoute()
            ArticleDetailScreen(
                article = sampleArticles.first { it.id == route.id },
                onBack = { navController.popBackStack() },
            )
        }
    }
}

@Composable
fun ArticleListScreen(articles: List<Article>, onArticleClick: (String) -> Unit) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(articles, key = { it.id }) { article ->
            Card(onClick = { onArticleClick(article.id) }, modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(12.dp)) {
                    Text(article.title, style = MaterialTheme.typography.titleMedium)
                    Text(article.source, style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

// MainActivity
setContent { MaterialTheme { NewsNavHost() } }`,
        remember: 'Screens take data and lambdas. Routes carry ids, not objects.',
        challenges: [
          { type: 'blank', prompt: 'Give the rows stable keys and register the typed detail route.', code: 'LazyColumn {\n    items(articles, [[key]] = { it.id }) { article ->\n        ArticleCard(article, onClick = { onArticleClick(article.id) })\n    }\n}\n\n// in NewsNavHost\ncomposable<[[ArticleDetail]]> { entry ->\n    val route: ArticleDetail = entry.[[toRoute]]()\n    ArticleDetailScreen(sampleArticles.first { it.id == route.id }, onBack = { navController.popBackStack() })\n}', why: '<code>key</code> ties each row to an article id. <code>composable&lt;ArticleDetail&gt;</code> registers the route type, and <code>toRoute()</code> rebuilds it with its id.' },
          { type: 'bug', prompt: 'The app crashes when NavHost first draws. Tap the line.', code: '@Composable\nfun NewsNavHost() {\n    val navController = NavHostController(LocalContext.current)\n    NavHost(navController, startDestination = ArticleList) {\n        composable<ArticleList> {\n            ArticleListScreen(sampleArticles, onArticleClick = { id -> navController.navigate(ArticleDetail(id)) })\n        }\n        composable<ArticleDetail> { entry ->\n            val route: ArticleDetail = entry.toRoute()\n            ArticleDetailScreen(sampleArticles.first { it.id == route.id }, onBack = { navController.popBackStack() })\n        }\n    }\n}', bug: 2, fix: '    val navController = rememberNavController()', why: 'A bare <code>NavHostController</code> has no Compose navigator registered, and a new one is built on every recomposition. <code>rememberNavController()</code> sets it up, keeps one instance, and saves the back stack across rotation.' },
        ],
        quiz: [
          { q: 'Why does <code>ArticleDetail</code> carry an id instead of the <code>Article</code>?', options: ['Routes are saved with the back stack, so keep them small and look the article up by id', 'Navigation can only pass Strings', 'Data classes can’t be routes'], a: 0, why: 'The route is serialized into saved state. An id is small and always fresh. The detail screen loads the article itself.' },
          { q: 'What does <code>key = { it.id }</code> give the list?', options: ['Rows keep their identity and state when items move or new ones arrive', 'Faster JSON parsing', 'Sorting by id'], a: 0, why: 'Without keys, rows are matched by position. A new article at the top would shift every row’s state.' },
          { q: '<code>id</code> is a String. What happens with <code>navigate(ArticleDetail(id = 42))</code>?', options: ['It compiles and converts to "42"', 'A compile error: argument type mismatch', 'A crash when you tap'], a: 1, why: 'Typed routes are plain Kotlin constructors, so the compiler checks every argument.' },
        ],
        visual(el) {
          const SAMPLE = newest(STORIES.slice(0, 5));
          const ph = phone();
          const A = arch({ ui: ['new', 'ArticleListScreen · ArticleDetailScreen'] });
          const o = out('Tap a headline, or use the commands below.');
          const stackEl = h('div', { class: 'ca-stack', 'aria-live': 'polite' });
          const stack = ['ArticleList'];
          const label = r => (r === 'ArticleList' ? 'ArticleList' : `ArticleDetail(id = "${r.id}")`);
          function paint(anim) {
            const top = stack[stack.length - 1];
            if (top === 'ArticleList') ph.show(listView(SAMPLE, a => open(a.id)), { title: 'News' });
            else ph.show(detailView(SAMPLE.find(a => a.id === top.id)), { title: 'Article', onBack: back });
            const kids = [];
            stack.forEach((r, i) => {
              if (i) kids.push(h('span', { class: 'ca-sep', 'aria-hidden': 'true' }, '›'));
              kids.push(h('span', { class: 'ca-route' + (i === stack.length - 1 ? ' top' : '') + (anim && i === stack.length - 1 ? ' drop-in' : '') }, label(r)));
            });
            stackEl.replaceChildren(...kids);
          }
          function open(id) {
            if (stack.length >= 4) { replay(stackEl, 'shake'); say(o, 'The stack is getting deep. Press Back first.'); return; }
            stack.push({ id }); A.ping('ui');
            paint(true);
            say(o, `${hl(`navController.navigate(ArticleDetail(id = "${id}"))`)} pushed a new entry. The detail screen got the id back with ${hl('toRoute()')}.`);
          }
          function back() {
            if (stack.length === 1) { replay(ph.el, 'shake'); say(o, 'Only ArticleList is left. Back on the start destination closes the app.'); return; }
            const gone = stack.pop(); A.ping('ui');
            paint(false);
            say(o, `${hl('popBackStack()')} removed ${hl(label(gone))}.`);
          }
          paint(false);
          layout(el, ph, A, panelBox('Back stack', stackEl),
            h('div', { class: 'controls' },
              cmd('navigate(ArticleDetail("a3"))', () => open('a3')),
              cmd('press Back', back),
              cmd('navigate(ArticleDetail(id = 42))', () => { replay(stackEl, 'shake'); A.fail('ui'); setTimeout(() => A.nodes.ui.classList.remove('fail'), 900); say(o, '<span class="bad">error:</span> Argument type mismatch: actual type is \'Int\', but \'String\' was expected.'); })),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'viewmodel',
        title: 'ViewModel and UiState with StateFlow',
        tagline: 'The screen observes one state object that survives rotation.',
        level: 'intermediate',
        refs: ['android.viewmodel', 'arch.udf', 'flow.hot', 'flow.lifecycle'],
        body: `
<p>The list screen shouldn’t own its data. This step adds <code>NewsViewModel</code>, which exposes one <code>StateFlow&lt;NewsUiState&gt;</code>. The screen collects it with <code>collectAsStateWithLifecycle()</code> and redraws on every new value.</p>
<p>The data comes through a <code>NewsRepository</code> interface. For now <code>FakeNewsRepository</code> implements it with a <code>MutableStateFlow</code> of sample articles. Later steps swap in the real one without touching the ViewModel. <code>stateIn</code> turns the repository’s Flow into a StateFlow, and <code>WhileSubscribed(5_000)</code> keeps it running through a rotation.</p>
<p>Rotate the phone below: the Activity is new, the ViewModel isn’t. Then switch off <code>viewModel { }</code> to build the ViewModel with a plain constructor call, and rotate again.</p>`,
        code: `interface NewsRepository {
    fun observeArticles(): Flow<List<Article>>
    fun observeArticle(id: String): Flow<Article?>
    suspend fun refresh()
}

// A stand-in until the real data layer exists. Tests keep using it.
class FakeNewsRepository : NewsRepository {
    private val articles = MutableStateFlow(sampleArticles)
    override fun observeArticles(): Flow<List<Article>> = articles
    override fun observeArticle(id: String): Flow<Article?> =
        articles.map { list -> list.find { it.id == id } }
    override suspend fun refresh() = Unit
}

data class NewsUiState(
    val articles: List<Article> = emptyList(),
    val isLoading: Boolean = true,
)

class NewsViewModel(private val repository: NewsRepository) : ViewModel() {
    val uiState: StateFlow<NewsUiState> = repository.observeArticles()
        .map { NewsUiState(articles = it, isLoading = false) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = NewsUiState(),
        )
}

// NewsNavHost
composable<ArticleList> {
    val viewModel = viewModel { NewsViewModel(FakeNewsRepository()) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ArticleListScreen(
        articles = state.articles,
        onArticleClick = { id -> navController.navigate(ArticleDetail(id)) },
    )
}`,
        remember: 'One StateFlow<UiState> out of the ViewModel. The screen only collects and draws.',
        challenges: [
          { type: 'blank', prompt: 'Turn the repository’s Flow into a StateFlow that lives in the ViewModel.', code: 'val uiState: StateFlow<NewsUiState> = repository.observeArticles()\n    .map { NewsUiState(articles = it, isLoading = false) }\n    .[[stateIn]](\n        scope = [[viewModelScope]],\n        started = SharingStarted.[[WhileSubscribed]](5_000),\n        initialValue = NewsUiState(),\n    )', why: '<code>stateIn</code> shares one upstream collection in <code>viewModelScope</code>. <code>WhileSubscribed(5_000)</code> stops it 5 seconds after the last collector leaves, which a rotation never reaches.' },
          { type: 'bug', prompt: 'After every rotation the list blinks empty and refills. Tap the line.', code: 'composable<ArticleList> {\n    val viewModel = NewsViewModel(FakeNewsRepository())\n    val state by viewModel.uiState.collectAsStateWithLifecycle()\n    ArticleListScreen(\n        articles = state.articles,\n        onArticleClick = { id -> navController.navigate(ArticleDetail(id)) },\n    )\n}', bug: 1, fix: '    val viewModel = viewModel { NewsViewModel(FakeNewsRepository()) }', why: 'A constructor call makes a new ViewModel on every recomposition and rotation, and none of them is ever cleared. <code>viewModel { }</code> stores one in the ViewModelStore and hands back the same instance.' },
        ],
        mistakes: [
          { title: 'Collecting a repository Flow straight in the composable', bad: '@Composable\nfun ArticleListRoute(repository: NewsRepository) {\n    val articles by repository.observeArticles()\n        .collectAsStateWithLifecycle(emptyList())\n    ArticleListScreen(articles, onArticleClick = {})\n}', good: 'composable<ArticleList> {\n    val viewModel = viewModel { NewsViewModel(FakeNewsRepository()) }\n    val state by viewModel.uiState.collectAsStateWithLifecycle()\n    ArticleListScreen(state.articles, onArticleClick = {})\n}', why: 'A real repository builds a new Flow on each call, so every recomposition restarts the collection, and a rotation starts it from scratch. The ViewModel holds one shared StateFlow instead.' },
          { title: 'Starting the load from LaunchedEffect(Unit)', bad: 'composable<ArticleList> {\n    val viewModel = viewModel { NewsViewModel(repository) }\n    LaunchedEffect(Unit) { viewModel.load() }   // again after every rotation\n}', good: 'class NewsViewModel(repository: NewsRepository) : ViewModel() {\n    // starts with the first collector, survives rotation\n    val uiState = repository.observeArticles()\n        .map { NewsUiState(articles = it, isLoading = false) }\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NewsUiState())\n}', why: 'A rotation rebuilds the composition, so <code>LaunchedEffect(Unit)</code> runs again and loads twice. Work that should happen once per screen belongs in the ViewModel.' },
        ],
        quiz: [
          { q: 'After a rotation, what does the list screen get first?', options: ['The current <code>NewsUiState</code>, straight from the StateFlow', 'An empty state while the repository reloads', 'Nothing until the next emission'], a: 0, why: 'The same ViewModel comes back, and a StateFlow always holds its latest value.' },
          { q: 'Why <code>WhileSubscribed(5_000)</code> and not <code>WhileSubscribed()</code>?', options: ['A rotation unsubscribes for a moment, and the 5 seconds keep the upstream from restarting', 'It refreshes every 5 seconds', 'It is a network timeout'], a: 0, why: 'With no delay, the upstream stops the moment the old Activity stops collecting and restarts for the new one.' },
          { q: 'Step 5 replaces <code>FakeNewsRepository</code>. What has to change in <code>uiState</code>?', options: ['Nothing: it only knows the <code>NewsRepository</code> interface', 'Its type', 'Every operator'], a: 0, why: 'Depending on the interface lets you swap the data source without touching the ViewModel’s state pipeline.' },
        ],
        visual(el) {
          const fake = newest(STORIES.slice(0, 4)).map(copy);
          let next = 4, activity = 1, retained = true, busy = false, empty = false;
          const vms = [addr()];
          const ph = phone();
          const A = arch({ ui: ['have', 'ArticleListScreen'], vm: ['new', 'NewsViewModel'], repo: ['new', 'FakeNewsRepository'] });
          const o = out('Rotate the phone, or let the fake repository publish an article.');
          const actEl = h('span', { class: 'ca-route' }, 'MainActivity #1');
          const vmsEl = h('div', { class: 'ca-vms' });
          const stateEl = h('div', { class: 'ca-stateslot' });
          function paintPanel(changed = []) {
            actEl.textContent = `MainActivity #${activity}`;
            vmsEl.replaceChildren(...vms.map((a, i) => h('span', { class: 'ca-vm' + (i === vms.length - 1 ? ' cur' : '') }, `NewsViewModel ${a}`)));
            stateEl.replaceChildren(h('div', { class: 'obj ca-obj' }, h('span', { class: 'obj-name' }, 'uiState.value'),
              h('span', { class: 'field' + (changed.includes('articles') ? ' changed' : '') }, `articles = ${empty ? 0 : fake.length} items`),
              h('span', { class: 'field' + (changed.includes('isLoading') ? ' changed' : '') }, `isLoading = ${empty}`)));
          }
          const paint = (fresh = []) => ph.show(empty ? [] : listView(fake, a => say(o, `Tapped ${q(a.id)}. The detail screen still reads sampleArticles until step 6.`), fresh), { title: 'News' });
          async function restart(why) {
            vms.push(addr()); empty = true; paint(); paintPanel(['articles', 'isLoading']);
            A.ping('vm'); A.pkt('uv', 'initialValue', 'err');
            await sleep(650); if (!el.isConnected) return false;
            empty = false; A.ping('repo'); A.pkt('vr', 'emit list', 'ok'); A.pkt('uv', 'NewsUiState', 'ok'); paint(); paintPanel(['articles', 'isLoading']);
            say(o, `${why} A new <span class="bad">NewsViewModel ${vms[vms.length - 1]}</span> started from <code>initialValue</code>, so the list blinked empty. ${vms.length - 1} old instance${vms.length > 2 ? 's are' : ' is'} never cleared.`);
            return true;
          }
          async function rotate() {
            if (busy) return;
            busy = true; A.clear();
            await ph.rotate(); if (!el.isConnected) return;
            activity++;
            if (retained) {
              paint(); paintPanel(); replay(vmsEl.lastChild, 'pop'); A.ping('ui'); A.pkt('uv', 'same StateFlow', 'ok');
              say(o, `MainActivity #${activity} is new. ${hl('viewModel { }')} returned the same NewsViewModel ${vms[vms.length - 1]}, and its StateFlow handed over the list at once.`);
            } else if (!(await restart(`MainActivity #${activity} is new.`))) return;
            busy = false;
          }
          async function publish() {
            if (busy) return;
            if (next >= STORIES.length) { say(o, 'No more sample stories. Press Reset to start over.'); return; }
            busy = true; A.clear();
            const s = copy(STORIES[next++]); fake.unshift(s);
            A.ping('repo'); A.pkt('vr', 'articles.value = …');
            await sleep(380); if (!el.isConnected) return;
            A.ping('vm'); A.pkt('uv', `NewsUiState(${fake.length})`, 'ok');
            await sleep(300); if (!el.isConnected) return;
            A.ping('ui'); paint([s.id]); paintPanel(['articles']);
            if (retained) say(o, `The MutableStateFlow in FakeNewsRepository changed. ${hl('map')} built a new NewsUiState, and only the list redrew.`);
            else { await sleep(500); if (!el.isConnected || !(await restart('The new state caused a recomposition, which ran the constructor again.'))) return; }
            busy = false;
          }
          paint(); paintPanel();
          layout(el, ph, A, panelBox('Instances', h('div', { class: 'ca-row' }, actEl), vmsEl, stateEl),
            h('div', { class: 'controls' }, cmd('rotate()', rotate), cmd('fake.publish()', publish),
              switchEl('viewModel { }', true, v => { retained = v; say(o, v ? `Back to ${hl('viewModel { NewsViewModel(…) }')}: one instance per screen.` : `Now the composable calls ${hl('NewsViewModel(FakeNewsRepository())')} directly. Rotate.`); })),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'network',
        title: 'Retrofit and kotlinx.serialization',
        tagline: 'Real headlines from the API, and what happens offline.',
        level: 'intermediate',
        refs: ['data.net', 'flow.cold', 'coroutines.dispatchers'],
        body: `
<p>Time for real data. <code>NewsApi</code> is a Retrofit interface with one <code>suspend</code> function. The JSON comes back as <code>ArticlesResponse</code>, a <code>@Serializable</code> DTO. <code>@SerialName</code> maps <code>published_at</code>, and <code>ignoreUnknownKeys</code> lets the server add fields without breaking the app. A small mapper turns each <code>ArticleDto</code> into our own <code>Article</code>.</p>
<p>To get it on screen, a temporary <code>OnlineNewsRepository</code> fetches inside a cold <code>flow { }</code>. Retrofit’s suspend calls are main-safe, so there is no <code>withContext</code>. Add the <code>INTERNET</code> permission, or every call fails.</p>
<p>Open the app below, switch the network off and open it again. Every launch needs the network, and offline there is nothing to show. The next step fixes that.</p>`,
        code: `@Serializable
data class ArticlesResponse(val articles: List<ArticleDto>)

@Serializable
data class ArticleDto(
    val id: String,
    val title: String,
    val source: String,
    val summary: String = "",
    @SerialName("published_at") val publishedAt: String,
)

fun ArticleDto.toArticle() = Article(id, title, source, summary, publishedAt)

interface NewsApi {
    @GET("v1/top-headlines")
    suspend fun topHeadlines(): ArticlesResponse
}

private val json = Json { ignoreUnknownKeys = true }

val newsApi: NewsApi = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create()

// Temporary: online only. Step 5 replaces it.
class OnlineNewsRepository(private val api: NewsApi) : NewsRepository {
    override fun observeArticles(): Flow<List<Article>> = flow {
        emit(api.topHeadlines().articles.map { it.toArticle() })
    }.catch { e ->
        if (e is IOException) emit(emptyList()) else throw e
    }
    override fun observeArticle(id: String): Flow<Article?> =
        observeArticles().map { list -> list.find { it.id == id } }
    override suspend fun refresh() = Unit
}

// AndroidManifest.xml
// <uses-permission android:name="android.permission.INTERNET" />`,
        remember: 'DTOs mirror the JSON. Map them to your own model at the edge.',
        terms: [
          { term: 'ignoreUnknownKeys', def: 'A kotlinx.serialization Json setting that skips JSON keys the class doesn’t declare instead of throwing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Map the snake_case key and declare the endpoint.', code: '@Serializable\ndata class ArticleDto(\n    val id: String,\n    val title: String,\n    @[[SerialName]]("published_at") val publishedAt: String,\n)\n\ninterface NewsApi {\n    @[[GET]]("v1/top-headlines")\n    [[suspend]] fun topHeadlines(): ArticlesResponse\n}', why: '<code>@SerialName</code> links a JSON key to a property with another name. A <code>suspend</code> function lets Retrofit run the call off the main thread and return the parsed body.' },
          { type: 'bug', prompt: 'The server added an <code>author</code> field, and now every request fails with a SerializationException. Tap the line.', code: 'val newsApi: NewsApi = Retrofit.Builder()\n    .baseUrl("https://api.example.com/")\n    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))\n    .build()\n    .create()', bug: 2, fix: '    .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType()))', why: 'The default <code>Json</code> throws on keys the class doesn’t declare. Configure it with <code>ignoreUnknownKeys = true</code> so new server fields are skipped.' },
        ],
        mistakes: [
          { title: 'Forgetting the INTERNET permission', bad: '<manifest>\n    <application android:label="News">\n        ...\n    </application>\n</manifest>', good: '<manifest>\n    <uses-permission android:name="android.permission.INTERNET" />\n    <application android:label="News">\n        ...\n    </application>\n</manifest>', why: 'Without it, every request fails on the device before it reaches the network, even with a working connection. The exception looks like a network error, which makes it easy to misread.' },
          { title: 'Catching Exception around a suspend call', bad: 'suspend fun loadHeadlines(): List<Article> = try {\n    api.topHeadlines().articles.map { it.toArticle() }\n} catch (e: Exception) {\n    emptyList()   // also swallows CancellationException\n}', good: 'suspend fun loadHeadlines(): List<Article> = try {\n    api.topHeadlines().articles.map { it.toArticle() }\n} catch (e: IOException) {\n    emptyList()   // offline or timeout\n}', why: 'Coroutines stop by throwing <code>CancellationException</code>. Catching every <code>Exception</code> hides it, so cancelled work keeps going. Catch the failures you expect, like <code>IOException</code> and <code>HttpException</code>.' },
        ],
        quiz: [
          { q: 'The server adds a new <code>author</code> key. What happens with <code>ignoreUnknownKeys = true</code>?', options: ['The key is skipped and decoding works', 'Decoding throws a SerializationException', 'Retrofit retries the request'], a: 0, why: 'That is the point of the setting. Without it, the unknown key is an error.' },
          { q: 'Why map <code>ArticleDto</code> to <code>Article</code>?', options: ['So the rest of the app doesn’t depend on the server’s JSON shape', 'Retrofit requires it', 'To make requests faster'], a: 0, why: 'If the API renames a field, only the DTO and the mapper change.' },
          { q: 'Offline, what does <code>OnlineNewsRepository</code> show at launch?', options: ['An empty list: nothing from earlier is kept', 'Yesterday’s articles', 'A crash'], a: 0, why: 'The IOException is caught and turned into an empty list. There is no local copy yet.' },
        ],
        visual(el) {
          const JSON_LINES = [
            ['{ "articles": [', ''],
            ['  { "id": "a4",', 'hit'],
            ['    "title": "City council approves…",', 'hit'],
            ['    "source": "City Desk",', 'hit'],
            ['    "published_at": "2026-10-16T08:50:00Z",', 'hit', 'publishedAt'],
            ['    "author_avatar": "https://…"', 'ign'],
            ['  }, …', ''],
            [']}', ''],
          ];
          const jls = JSON_LINES.map(([t]) => h('div', { class: 'ca-jl' }, t));
          const count = h('span', { class: 'ca-count' }, 'requests sent: 1');
          let online = true, busy = false, requests = 1;
          const ph = phone();
          const A = arch({ ui: ['have', 'ArticleListScreen'], vm: ['have', 'NewsViewModel'], repo: ['new', 'OnlineNewsRepository'], api: ['new', 'NewsApi (Retrofit)'] });
          const o = out('The app opened once and fetched 4 headlines. Open it again, or go offline first.');
          const items = () => newest(STORIES.slice(0, 4));
          const showList = () => ph.show(listView(items(), a => say(o, `Tapped ${q(a.id)}.`)), { title: 'News' });
          const markJson = () => JSON_LINES.forEach(([, c], i) => { jls[i].className = 'ca-jl' + (c ? ' ' + c : ''); });
          async function openApp() {
            if (busy) return;
            busy = true; A.clear();
            jls.forEach(j => { j.className = 'ca-jl dead'; });
            await ph.dark(380); if (!el.isConnected) return;
            ph.show(center({ spin: true }));
            A.ping('vm'); A.pkt('uv', 'collect');
            await sleep(300); if (!el.isConnected) return;
            A.ping('repo'); A.pkt('vr', 'observeArticles()');
            await sleep(300); if (!el.isConnected) return;
            requests++; count.textContent = `requests sent: ${requests}`; replay(count, 'pop');
            A.ping('api'); A.pkt('ra', 'GET v1/top-headlines');
            await sleep(650); if (!el.isConnected) return;
            if (!online) {
              A.fail('api'); A.pkt('ra', 'UnknownHostException', 'err');
              await sleep(400); if (!el.isConnected) return;
              A.ping('repo'); A.pkt('vr', 'catch → emptyList()', 'err');
              await sleep(300); if (!el.isConnected) return;
              A.ping('ui'); A.pkt('uv', 'NewsUiState(0)', 'err');
              ph.show([], { title: 'News' });
              say(o, '<span class="bad">offline:</span> the DNS lookup failed with an IOException. The repository emitted an empty list, and nothing from the last launch was kept. A blank screen.');
              busy = false; return;
            }
            A.pkt('ra', '200 OK · JSON', 'ok');
            for (let i = 0; i < jls.length; i++) {
              jls[i].className = 'ca-jl' + (JSON_LINES[i][1] ? ' ' + JSON_LINES[i][1] : '');
              await sleep(110); if (!el.isConnected) return;
            }
            A.ping('repo'); A.pkt('vr', 'map { it.toArticle() }', 'ok');
            await sleep(350); if (!el.isConnected) return;
            A.ping('vm'); A.ping('ui'); A.pkt('uv', 'NewsUiState(4)', 'ok');
            showList();
            say(o, `<span class="good">ok:</span> ${hl('published_at')} filled ${hl('publishedAt')}, ${hl('author_avatar')} was skipped by ${hl('ignoreUnknownKeys')}. Request number ${requests}: every launch downloads everything again.`);
            busy = false;
          }
          showList(); markJson();
          layout(el, ph, A, panelBox('Response body', h('div', { class: 'ca-json' }, jls), count),
            h('div', { class: 'controls' }, cmd('Open app', openApp),
              switchEl('Offline', false, v => { online = !v; ph.offline(v); say(o, v ? 'Network off. Now open the app.' : 'Network back on.'); })),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'cache',
        title: 'Room cache as the single source of truth',
        tagline: 'The screen reads Room. The network only writes to it.',
        level: 'advanced',
        refs: ['data.room', 'arch.ssot', 'data.caching', 'flow.operators'],
        body: `
<p>Now the app keeps what it downloads. <code>ArticleEntity</code> is the table, <code>ArticleDao</code> has a query that returns a <code>Flow</code>, and <code>NewsDatabase</code> ties them together. Room’s KSP processor writes the code behind them.</p>
<p><code>OfflineFirstNewsRepository</code> replaces the online one. <code>observeArticles()</code> reads only from Room. <code>refresh()</code> fetches from the API and upserts the rows. Room sees the write and re-runs the query, so new rows reach the screen through the same Flow. The ViewModel calls <code>refresh()</code> once in <code>init</code> and keeps the cached rows when it fails.</p>
<p>Refresh below and watch the rows land in the table first. Go offline and reopen the app: the saved news shows at once. Edit a row and the screen follows without any refresh.</p>`,
        code: `@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: String,
    val title: String,
    val source: String,
    val summary: String,
    val publishedAt: String,
)

@Dao
interface ArticleDao {
    // ISO 8601 strings in UTC sort in time order
    @Query("SELECT * FROM articles ORDER BY publishedAt DESC")
    fun observeAll(): Flow<List<ArticleEntity>>

    @Query("SELECT * FROM articles WHERE id = :id")
    fun observe(id: String): Flow<ArticleEntity?>

    @Upsert
    suspend fun upsertAll(articles: List<ArticleEntity>)
}

@Database(entities = [ArticleEntity::class], version = 1)
abstract class NewsDatabase : RoomDatabase() {
    abstract fun articleDao(): ArticleDao
}

fun ArticleDto.toEntity() = ArticleEntity(id, title, source, summary, publishedAt)
fun ArticleEntity.toArticle() = Article(id, title, source, summary, publishedAt)

class OfflineFirstNewsRepository(
    private val api: NewsApi,
    private val dao: ArticleDao,
) : NewsRepository {
    // Reads come only from Room
    override fun observeArticles(): Flow<List<Article>> =
        dao.observeAll().map { rows -> rows.map { it.toArticle() } }

    override fun observeArticle(id: String): Flow<Article?> =
        dao.observe(id).map { it?.toArticle() }

    // The network only writes into Room. Failures throw to the caller.
    override suspend fun refresh() {
        val fresh = api.topHeadlines().articles
        dao.upsertAll(fresh.map { it.toEntity() })
    }
}

// NewsViewModel: refresh once when the screen first opens
init {
    viewModelScope.launch {
        try {
            repository.refresh()
        } catch (e: IOException) {
            // offline: the cached rows stay on screen
        }
    }
}`,
        remember: 'UI ← Room ← network. Writes go into the database, reads come out of it.',
        terms: [
          { term: 'Invalidation tracker', def: 'The part of Room that records which tables a write touched and re-runs the observable queries that read them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the query observable and write the network result with an upsert.', code: '@Dao\ninterface ArticleDao {\n    @Query("SELECT * FROM articles ORDER BY publishedAt DESC")\n    fun observeAll(): [[Flow]]<List<ArticleEntity>>\n\n    @[[Upsert]]\n    suspend fun upsertAll(articles: List<ArticleEntity>)\n}\n\noverride suspend fun refresh() {\n    dao.[[upsertAll]](api.topHeadlines().articles.map { it.toEntity() })\n}', why: 'A <code>Flow</code> return type makes Room re-run the query after every write to the table. <code>@Upsert</code> inserts new ids and updates existing ones.' },
          { type: 'bug', prompt: 'Offline, the list is empty even though Room holds 40 articles. Tap the line.', code: 'class OfflineFirstNewsRepository(\n    private val api: NewsApi,\n    private val dao: ArticleDao,\n) : NewsRepository {\n    override fun observeArticles(): Flow<List<Article>> =\n        flow { emit(api.topHeadlines().articles.map { it.toArticle() }) }\n\n    override suspend fun refresh() {\n        dao.upsertAll(api.topHeadlines().articles.map { it.toEntity() })\n    }\n}', bug: 5, fix: '        dao.observeAll().map { rows -> rows.map { it.toArticle() } }', why: 'The screen reads the network response, so the cache is never shown. Read from the DAO’s Flow, and let <code>refresh()</code> be the only thing that touches the API.' },
        ],
        mistakes: [
          { title: 'Replacing the table in two separate writes', bad: 'override suspend fun refresh() {\n    val fresh = api.topHeadlines().articles\n    dao.deleteAll()                                  // the Flow emits an empty list\n    dao.upsertAll(fresh.map { it.toEntity() })       // then the new one\n}', good: '@Dao\ninterface ArticleDao {\n    @Query("DELETE FROM articles") suspend fun deleteAll()\n    @Upsert suspend fun upsertAll(articles: List<ArticleEntity>)\n\n    @Transaction\n    suspend fun replaceAll(articles: List<ArticleEntity>) {\n        deleteAll()\n        upsertAll(articles)\n    }\n}', why: 'Each write commits on its own, so observers see the empty table in between and the list flashes. Inside <code>@Transaction</code>, observers only see the final result.' },
          { title: 'A one-shot query for a screen that should update', bad: '@Query("SELECT * FROM articles ORDER BY publishedAt DESC")\nsuspend fun getAll(): List<ArticleEntity>   // read once', good: '@Query("SELECT * FROM articles ORDER BY publishedAt DESC")\nfun observeAll(): Flow<List<ArticleEntity>>   // re-emits after writes', why: 'A <code>suspend</code> query returns the rows once. After <code>refresh()</code> writes new rows, nothing tells the screen. A <code>Flow</code> query keeps watching.' },
        ],
        quiz: [
          { q: '<code>refresh()</code> just upserted 2 new rows. How do they reach the screen?', options: ['Room re-runs <code>observeAll()</code> and the Flow emits the new list', '<code>refresh()</code> returns them to the ViewModel', 'The screen polls the database'], a: 0, why: 'The invalidation tracker sees the write to <code>articles</code> and re-runs every Flow query on that table.' },
          { q: 'Offline, the user reopens the app. What do they see?', options: ['The articles saved by the last successful refresh', 'An empty list', 'A crash'], a: 0, why: 'Room is on disk. The query emits the saved rows, and the failed refresh only leaves them as they are.' },
          { q: 'What did <code>NewsViewModel</code> need for the cache?', options: ['Only an <code>init</code> block that calls <code>refresh()</code>', 'A new <code>uiState</code> pipeline', 'A reference to the DAO'], a: 0, why: 'It still reads <code>repository.observeArticles()</code>. Only the repository behind the interface changed.' },
        ],
        visual(el) { offlineApp(el, 5); },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'hilt',
        title: 'Wire it together with Hilt',
        tagline: 'One graph builds the API, the database and every ViewModel.',
        level: 'advanced',
        refs: ['arch.hilt', 'android.savedstate', 'compose2.navigation'],
        body: `
<p>Until now the pieces were built by hand. Hilt takes that over. <code>@HiltAndroidApp</code> on <code>NewsApp</code> creates the app-wide graph, and <code>@AndroidEntryPoint</code> on <code>MainActivity</code> lets its screens ask for ViewModels.</p>
<p><code>DataModule</code> provides what we can’t annotate: the Retrofit <code>NewsApi</code> and the Room database, both <code>@Singleton</code>, plus the DAO. <code>RepositoryModule</code> binds <code>NewsRepository</code> to <code>OfflineFirstNewsRepository</code>. The ViewModels get <code>@HiltViewModel</code> and an <code>@Inject</code> constructor, and the screens call <code>hiltViewModel()</code>.</p>
<p>The detail screen now has its own <code>ArticleViewModel</code>. Hilt hands it a <code>SavedStateHandle</code> that holds the route, so <code>toRoute&lt;ArticleDetail&gt;()</code> gives it the id. Below, open an article, rotate, go back, and restart the process.</p>`,
        code: `@HiltAndroidApp
class NewsApp : Application()          // android:name=".NewsApp" in the manifest

@AndroidEntryPoint
class MainActivity : ComponentActivity() { /* unchanged */ }

@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    @Provides @Singleton
    fun provideNewsApi(): NewsApi = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .addConverterFactory(
            Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType())
        )
        .build()
        .create()

    @Provides @Singleton
    fun provideDatabase(@ApplicationContext context: Context): NewsDatabase =
        Room.databaseBuilder(context, NewsDatabase::class.java, "news.db").build()

    @Provides
    fun provideArticleDao(db: NewsDatabase): ArticleDao = db.articleDao()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindNewsRepository(impl: OfflineFirstNewsRepository): NewsRepository
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
    private val id = savedStateHandle.toRoute<ArticleDetail>().id
    val article: StateFlow<Article?> = repository.observeArticle(id)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
}

// NewsNavHost: ask Hilt instead of building by hand
composable<ArticleList> {
    val viewModel: NewsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ArticleListScreen(state.articles, onArticleClick = { id -> navController.navigate(ArticleDetail(id)) })
}
composable<ArticleDetail> {
    val viewModel: ArticleViewModel = hiltViewModel()
    val article by viewModel.article.collectAsStateWithLifecycle()
    ArticleDetailScreen(article, onBack = { navController.popBackStack() })   // Article? now
}`,
        remember: 'Singletons for the API and the database, @Binds for the repository, hiltViewModel() for each screen.',
        terms: [
          { term: 'hiltViewModel()', def: 'A Compose function from androidx.hilt that gets or creates a @HiltViewModel scoped to the current navigation entry or activity.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Hilt create the list ViewModel.', code: '@[[HiltViewModel]]\nclass NewsViewModel @[[Inject]] constructor(\n    private val repository: NewsRepository,\n) : ViewModel()\n\ncomposable<ArticleList> {\n    val viewModel: NewsViewModel = [[hiltViewModel]]()\n}', why: '<code>@HiltViewModel</code> registers the class, <code>@Inject</code> tells Hilt how to build it, and <code>hiltViewModel()</code> gets it scoped to the navigation entry.' },
          { type: 'bug', prompt: 'A background sync worker injects its own <code>ArticleDao</code> and writes new rows. The list on screen doesn’t change until the app restarts. Tap the line.', code: '@Module\n@InstallIn(SingletonComponent::class)\nobject DataModule {\n    @Provides\n    fun provideDatabase(@ApplicationContext context: Context): NewsDatabase =\n        Room.databaseBuilder(context, NewsDatabase::class.java, "news.db").build()\n\n    @Provides\n    fun provideArticleDao(db: NewsDatabase): ArticleDao = db.articleDao()\n}', bug: 3, fix: '    @Provides @Singleton', why: 'Without a scope, every injection builds a new <code>NewsDatabase</code>. Each instance has its own invalidation tracker, so writes through one don’t wake the Flows of another. One <code>@Singleton</code> database fixes it.' },
        ],
        mistakes: [
          { title: 'Forgetting @AndroidEntryPoint on the Activity', bad: 'class MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent { NewsNavHost() }   // hiltViewModel() inside\n    }\n}', good: '@AndroidEntryPoint\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent { NewsNavHost() }\n    }\n}', why: 'Hilt can only create <code>@HiltViewModel</code>s for Android classes it generated code for. Without the annotation, creating the ViewModel throws at runtime, not at compile time.' },
          { title: 'Building the repository inside the ViewModel', bad: '@HiltViewModel\nclass NewsViewModel @Inject constructor(\n    api: NewsApi,\n    dao: ArticleDao,\n) : ViewModel() {\n    private val repository = OfflineFirstNewsRepository(api, dao)\n}', good: '@HiltViewModel\nclass NewsViewModel @Inject constructor(\n    private val repository: NewsRepository,\n) : ViewModel()', why: 'The ViewModel now knows the concrete class and its parts, and a test can’t pass <code>FakeNewsRepository</code>. Ask for the interface and let <code>@Binds</code> pick the implementation.' },
        ],
        quiz: [
          { q: 'Why is <code>NewsDatabase</code> a <code>@Singleton</code>?', options: ['One instance means one invalidation tracker, so every Flow sees every write', 'Room requires the annotation to compile', 'It makes queries faster'], a: 0, why: 'Several instances on the same file don’t notify each other’s observers by default, and each one holds its own connections.' },
          { q: 'Where does <code>ArticleViewModel</code> get the article id?', options: ['From <code>SavedStateHandle</code>, with <code>toRoute&lt;ArticleDetail&gt;()</code>', 'From the list ViewModel', 'From a global variable'], a: 0, why: 'The navigation entry’s arguments are in the SavedStateHandle Hilt passes in. They also survive process death.' },
          { q: 'You press back on the article. What happens to <code>ArticleViewModel</code>?', options: ['Its entry leaves the back stack, so it is cleared', 'It lives until the app closes', 'Hilt keeps it as a singleton'], a: 0, why: '<code>hiltViewModel()</code> scopes it to the navigation entry. Popping the entry clears its ViewModelStore.' },
        ],
        visual(el) {
          const db = newest(STORIES.slice(0, 5)).map(copy);
          const G = [
            ['api', 'NewsApi', '@Singleton · Retrofit'],
            ['dbi', 'NewsDatabase', '@Singleton · Room'],
            ['dao', 'ArticleDao', 'from NewsDatabase'],
            ['repo', 'NewsRepository', '@Binds → OfflineFirstNewsRepository'],
          ];
          const V = [['nvm', 'NewsViewModel', 'ArticleList entry'], ['avm', 'ArticleViewModel', 'ArticleDetail entry']];
          const items = {};
          const gi = ([k, name, note]) => {
            const chip = h('span', { class: 'ca-vm' });
            const lab = h('small', {}, note);
            const row = h('div', { class: 'ca-gi' }, h('span', {}, name), lab, chip);
            items[k] = Object.assign(row, { chip, lab });
            return row;
          };
          const ids = {};
          const make = (k, anim = true) => { ids[k] = addr(); const r = items[k]; r.classList.remove('gone'); r.classList.add('made'); r.chip.textContent = ids[k]; r.chip.className = 'ca-vm cur'; if (anim) replay(r, 'pop'); };
          const unmake = k => { const r = items[k]; r.classList.remove('made'); r.chip.textContent = ''; r.chip.className = 'ca-vm'; };
          const graph = h('div', { class: 'ca-graph' }, h('span', { class: 'ca-gh' }, 'SingletonComponent'), G.map(gi), h('span', { class: 'ca-gh' }, 'ViewModelComponent'), V.map(gi));
          const ph = phone();
          const A = arch({ ui: ['have', 'hiltViewModel()'], vm: ['new', 'NewsViewModel · ArticleViewModel'], repo: ['have', 'OfflineFirstNewsRepository'], db: ['have', 'ArticleDao'], api: ['have', 'NewsApi'], hilt: 'new' });
          const o = out('The graph is built and the list is on screen. Open an article, rotate, or restart.');
          let busy = false, activity = 1, openId = null;
          const showList = () => ph.show(listView(db, a => openArticle(a.id)), { title: 'News' });
          function openArticle(id) {
            if (busy || openId) return;
            openId = id;
            make('avm'); items.avm.lab.textContent = `id = "${id}"`;
            ph.show(detailView(db.find(a => a.id === id)), { title: 'Article', onBack: back });
            A.ping('ui'); A.ping('vm'); A.pkt('vr', `observeArticle("${id}")`);
            say(o, `${hl('hiltViewModel<ArticleViewModel>()')} built a new ViewModel ${ids.avm}. Hilt gave it the same NewsRepository ${ids.repo} and a SavedStateHandle holding ${hl(`ArticleDetail(id = "${id}")`)}.`);
          }
          function back() {
            if (busy || !openId) { if (!openId) say(o, 'Already on the list.'); return; }
            const gone = ids.avm; openId = null;
            items.avm.classList.add('gone'); items.avm.chip.className = 'ca-vm';
            showList(); A.ping('ui');
            say(o, `The ArticleDetail entry left the back stack, so ArticleViewModel ${gone} was cleared. The singletons stay.`);
          }
          async function rotate() {
            if (busy) return;
            busy = true; A.clear();
            await ph.rotate(); if (!el.isConnected) return;
            activity++;
            ['nvm', 'avm', 'repo', 'dbi'].forEach(k => { if (items[k].classList.contains('made')) replay(items[k], 'pop'); });
            A.ping('ui');
            say(o, `MainActivity #${activity} is new. NewsViewModel ${ids.nvm}${openId ? ` and ArticleViewModel ${ids.avm}` : ''} came back from their entries, and every singleton is the same object.`);
            busy = false;
          }
          async function restart() {
            if (busy) return;
            busy = true; A.clear(); openId = null;
            [...G, ...V].forEach(([k]) => { unmake(k); items[k].classList.remove('gone'); });
            items.avm.lab.textContent = 'ArticleDetail entry';
            await ph.dark(450); if (!el.isConnected) return;
            ph.show(center({ spin: true }));
            say(o, `New process. ${hl('@HiltAndroidApp')} creates the SingletonComponent. Asking for NewsViewModel pulls in everything below it.`);
            const order = [['api', 'api'], ['dbi', 'db'], ['dao', 'db'], ['repo', 'repo'], ['nvm', 'vm']];
            for (const [k, node] of order) {
              await sleep(380); if (!el.isConnected) return;
              make(k); A.ping(node);
            }
            await sleep(300); if (!el.isConnected) return;
            A.ping('ui'); showList();
            say(o, `<span class="good">ready:</span> built bottom-up, each piece once. NewsViewModel ${ids.nvm} got NewsRepository ${ids.repo}.`);
            busy = false;
          }
          ['api', 'dbi', 'dao', 'repo', 'nvm'].forEach(k => make(k, false));
          showList();
          layout(el, ph, A, panelBox('Hilt graph', graph),
            h('div', { class: 'controls' }, cmd('open article', () => (openId ? say(o, 'Already on an article. Press back.') : openArticle(db[1].id))), cmd('rotate()', rotate), cmd('press Back', back), cmd('Kill process + launch', restart)),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'states',
        title: 'Loading, error, empty and pull-to-refresh',
        tagline: 'Every state the screen can be in, and a gesture to refresh.',
        level: 'advanced',
        refs: ['arch.ui-state-patterns', 'flow.operators', 'compose.effects'],
        body: `
<p>A feed has more than one state. It can be loading for the first time, refreshing over saved news, failing while saved news is still useful, failing with nothing saved, or simply empty. <code>NewsUiState</code> grows to cover all of them: <code>isRefreshing</code> and <code>errorMessage</code> join <code>articles</code> and <code>isLoading</code>.</p>
<p>The ViewModel keeps the refresh flag and the error in two private <code>MutableStateFlow</code>s and <code>combine</code>s them with the articles from Room. <code>refresh()</code> catches network and HTTP errors and clears the flag in <code>finally</code>. The screen wraps everything in <code>PullToRefreshBox</code> and picks what to draw with one <code>when</code>. With saved news on screen, an error becomes a snackbar.</p>
<p>Drag the list down below to refresh. Then go offline, make the server return nothing, or clear the app data to see a first launch.</p>`,
        code: `data class NewsUiState(
    val articles: List<Article> = emptyList(),
    val isLoading: Boolean = true,       // Room hasn't answered yet
    val isRefreshing: Boolean = false,   // a network refresh is running
    val errorMessage: String? = null,    // the last refresh failed
)

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository,
) : ViewModel() {
    private val isRefreshing = MutableStateFlow(false)
    private val errorMessage = MutableStateFlow<String?>(null)

    val uiState: StateFlow<NewsUiState> = combine(
        repository.observeArticles(), isRefreshing, errorMessage,
    ) { articles, refreshing, error ->
        NewsUiState(articles, isLoading = false, isRefreshing = refreshing, errorMessage = error)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NewsUiState())

    init { refresh() }

    fun refresh() {
        if (isRefreshing.value) return
        viewModelScope.launch {
            isRefreshing.value = true
            errorMessage.value = null
            try {
                repository.refresh()
            } catch (e: IOException) {
                errorMessage.value = "No connection. Showing saved news."
            } catch (e: HttpException) {
                errorMessage.value = "Server error (\${e.code()})."
            } finally {
                isRefreshing.value = false
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleListScreen(
    state: NewsUiState,
    onRefresh: () -> Unit,
    onArticleClick: (String) -> Unit,
) {
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(state.errorMessage) {
        val message = state.errorMessage
        if (message != null && state.articles.isNotEmpty()) snackbarHostState.showSnackbar(message)
    }
    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        PullToRefreshBox(
            isRefreshing = state.isRefreshing,
            onRefresh = onRefresh,
            modifier = Modifier.padding(padding).fillMaxSize(),
        ) {
            when {
                state.isLoading -> LoadingSpinner()
                state.articles.isEmpty() && state.isRefreshing -> LoadingSpinner()
                state.articles.isEmpty() && state.errorMessage != null ->
                    FullScreenMessage(state.errorMessage, action = "Retry", onAction = onRefresh)
                state.articles.isEmpty() -> FullScreenMessage("No news yet. Pull down to refresh.")
                else -> ArticleList(state.articles, onArticleClick)   // the LazyColumn from step 2
            }
        }
    }
}

// Empty and error screens must scroll, or the pull gesture never starts
@Composable
fun FullScreenMessage(text: String, action: String? = null, onAction: () -> Unit = {}) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text)
        if (action != null) TextButton(onClick = onAction) { Text(action) }
    }
}`,
        remember: 'Saved articles beat error screens. Show the error over the content, not instead of it.',
        terms: [
          { term: 'PullToRefreshBox', def: 'A Material 3 container that shows a refresh indicator when the user pulls its scrollable content down, and calls onRefresh.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Merge the three sources into one state and hook up the gesture.', code: 'val uiState: StateFlow<NewsUiState> = [[combine]](\n    repository.observeArticles(), isRefreshing, errorMessage,\n) { articles, refreshing, error ->\n    NewsUiState(articles, isLoading = false, isRefreshing = refreshing, errorMessage = error)\n}.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NewsUiState())\n\nPullToRefreshBox(\n    isRefreshing = state.[[isRefreshing]],\n    onRefresh = [[onRefresh]],\n) { ArticleList(state.articles, onArticleClick) }', why: '<code>combine</code> emits a new state whenever any input changes. <code>PullToRefreshBox</code> shows the indicator from <code>isRefreshing</code> and calls <code>onRefresh</code> on a pull.' },
          { type: 'bug', prompt: 'Offline, the app hides 40 saved articles behind a full-screen error. Tap the line.', code: 'when {\n    state.isLoading -> LoadingSpinner()\n    state.errorMessage != null -> FullScreenMessage(state.errorMessage, action = "Retry", onAction = onRefresh)\n    state.articles.isEmpty() && state.isRefreshing -> LoadingSpinner()\n    state.articles.isEmpty() -> FullScreenMessage("No news yet. Pull down to refresh.")\n    else -> ArticleList(state.articles, onArticleClick)\n}', bug: 2, fix: '    state.articles.isEmpty() && state.errorMessage != null -> FullScreenMessage(state.errorMessage, action = "Retry", onAction = onRefresh)', why: 'Any error wins over the list here. Only show the full-screen error when there is nothing else to show. With saved rows, keep the list and use a snackbar.' },
        ],
        mistakes: [
          { title: 'An empty state that can’t be pulled', bad: 'PullToRefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {\n    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {\n        Text("No news yet. Pull down to refresh.")\n    }\n}', good: 'PullToRefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {\n    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {\n        Text("No news yet. Pull down to refresh.")\n    }\n}', why: 'The pull reaches <code>PullToRefreshBox</code> through nested scrolling. A plain <code>Box</code> never scrolls, so the text asks for a gesture that can’t happen.' },
          { title: 'Showing the snackbar from the composable body', bad: 'val scope = rememberCoroutineScope()\nif (state.errorMessage != null) {\n    scope.launch { snackbarHostState.showSnackbar(state.errorMessage) }\n}', good: 'LaunchedEffect(state.errorMessage) {\n    val message = state.errorMessage\n    if (message != null) snackbarHostState.showSnackbar(message)\n}', why: 'The body runs on every recomposition, so the same message is queued again and again. <code>LaunchedEffect</code> keyed on the message runs once per new error.' },
        ],
        quiz: [
          { q: 'Offline with 20 saved articles, the user pulls to refresh. What do they see?', options: ['The list stays, and a snackbar says there is no connection', 'A full-screen error with Retry', 'An empty screen'], a: 0, why: 'Saved news is still useful. The error goes on top of it.' },
          { q: 'Why is <code>isRefreshing.value = false</code> in <code>finally</code>?', options: ['So the indicator stops even when refresh throws something unexpected or the coroutine is cancelled', 'finally runs faster', 'Kotlin requires it after try'], a: 0, why: '<code>finally</code> runs on every exit path. Anywhere else, one uncaught exception leaves the spinner on forever.' },
          { q: 'First launch, offline, nothing saved. Which branch draws?', options: ['The loading spinner', 'The full-screen error with Retry', 'The empty state'], a: 1, why: 'Articles are empty, the refresh finished, and <code>errorMessage</code> is set, so the error branch matches before the empty one.' },
        ],
        visual(el) { offlineApp(el, 7); },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'recap',
        title: 'You built it: the app end to end',
        tagline: 'Every layer working together, online and off.',
        level: 'advanced',
        refs: ['arch.layers', 'arch.ssot', 'android.viewmodel'],
        body: `
<p>That’s the whole app. A pull goes from the Compose screen to <code>NewsViewModel</code>, into <code>OfflineFirstNewsRepository</code>, out to <code>NewsApi</code>, and into Room. Room’s Flow carries the result back up as a new <code>NewsUiState</code>. Rotation keeps the ViewModels. Process death keeps the database. Hilt built every piece once.</p>
<p>Use the full app below: pull to refresh, open an article, rotate, go offline, kill the process and reopen it. The log shows which layer did what.</p>
<p>Where to take it next:</p>
<ul>
<li><b>Background sync.</b> A periodic WorkManager job with a network constraint calls <code>repository.refresh()</code>, so news is fresh before the app opens.</li>
<li><b>Bookmarks.</b> Add a Saved tab. Keep bookmarks in their own table, so a refresh that upserts articles can’t overwrite them.</li>
<li><b>Endless feed.</b> Move the list to Paging 3, with a <code>RemoteMediator</code> that loads pages from the API into Room.</li>
<li><b>Tests.</b> Drive <code>NewsViewModel</code> with <code>FakeNewsRepository</code> in <code>runTest</code>, and check the empty and error screens with a Compose UI test.</li>
</ul>`,
        code: `// com.example.news
// ├─ NewsApp.kt                 @HiltAndroidApp
// ├─ MainActivity.kt            @AndroidEntryPoint, setContent { NewsNavHost() }
// ├─ ui/NewsNavHost.kt          ArticleList and ArticleDetail routes
// ├─ ui/ArticleListScreen.kt    PullToRefreshBox + one when for every state
// ├─ ui/ArticleDetailScreen.kt
// ├─ ui/NewsViewModel.kt        StateFlow<NewsUiState>, refresh()
// ├─ ui/ArticleViewModel.kt     SavedStateHandle.toRoute<ArticleDetail>()
// ├─ data/NewsRepository.kt     interface + OfflineFirstNewsRepository
// ├─ data/local/                ArticleEntity, ArticleDao, NewsDatabase
// ├─ data/remote/               ArticleDto, ArticlesResponse, NewsApi
// └─ di/                        DataModule, RepositoryModule

@Composable
fun NewsNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = ArticleList) {
        composable<ArticleList> {
            val viewModel: NewsViewModel = hiltViewModel()
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            ArticleListScreen(
                state = state,
                onRefresh = viewModel::refresh,
                onArticleClick = { id -> navController.navigate(ArticleDetail(id)) },
            )
        }
        composable<ArticleDetail> {
            val viewModel: ArticleViewModel = hiltViewModel()
            val article by viewModel.article.collectAsStateWithLifecycle()
            ArticleDetailScreen(article, onBack = { navController.popBackStack() })
        }
    }
}`,
        remember: 'Pull → ViewModel → repository → API → Room → Flow → UiState → screen.',
        challenges: [
          { type: 'blank', prompt: 'Fill in the path one pull-to-refresh takes.', code: '// 1. The gesture calls the ViewModel\nonRefresh = viewModel::[[refresh]]\n\n// 2. The repository writes the network result into Room\ndao.[[upsertAll]](api.topHeadlines().articles.map { it.toEntity() })\n\n// 3. Room re-emits, the ViewModel maps it, the screen collects it\nval state by viewModel.uiState.[[collectAsStateWithLifecycle]]()', why: 'The refresh only writes. The new rows travel back up through the same Flow the screen was already collecting.' },
          { type: 'bug', prompt: 'The app crashes on launch: Hilt says the Application isn’t set up. Tap the line.', code: '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <uses-permission android:name="android.permission.INTERNET" />\n    <application android:label="News">\n        <activity android:name=".MainActivity" android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>', bug: 2, fix: '    <application android:name=".NewsApp" android:label="News">', why: 'Hilt’s graph lives in the <code>@HiltAndroidApp</code> Application class. If the manifest doesn’t name it, Android starts a plain Application and the <code>@AndroidEntryPoint</code> activity can’t find its components.' },
        ],
        quiz: [
          { q: 'The process was killed. The user reopens the app offline. Which layer brings the articles back?', options: ['Room: the last refresh wrote them to disk', 'The ViewModel', 'SavedStateHandle'], a: 0, why: 'ViewModels die with the process. The database file doesn’t.' },
          { q: 'During a rotation, which objects are new?', options: ['The Activity and its composition. ViewModels and singletons stay.', 'Everything, including the database', 'Nothing'], a: 0, why: 'ViewModels survive configuration changes, and Hilt singletons live as long as the process.' },
          { q: 'A WorkManager sync job should call which function?', options: ['<code>NewsRepository.refresh()</code>', '<code>NewsViewModel.refresh()</code>', '<code>ArticleListScreen</code>'], a: 0, why: 'Workers run without a screen or a ViewModel. The repository writes to Room, and any open screen updates on its own.' },
        ],
        visual(el) { offlineApp(el, 8); },
      },
    ],
  });
})();
