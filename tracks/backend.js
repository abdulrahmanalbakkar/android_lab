/* Backend with Kotlin track. Same shape as tracks/kotlin.js.
   Build the server side of your own app with Ktor 3, kotlinx.serialization, PostgreSQL and Exposed 1.x.
   Android-side networking lives in the data track (data.net, data.auth); this track is the other end of the wire.
   Demo styles live in the css string below; every class is prefixed be-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const label = text => h('div', { class: 'be-label' }, text);
  const pill = (text, cls = '') => h('span', { class: `be-pill ${cls}` }, text);
  // A run counter so a new click cancels the animation that is still playing.
  const runner = () => { let n = 0; return { next: () => ++n, live: id => id === n }; };

  const REASON = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 406: 'Not Acceptable', 409: 'Conflict', 415: 'Unsupported Media Type', 422: 'Unprocessable Content', 500: 'Internal Server Error', 503: 'Service Unavailable' };
  const sCls = s => s < 300 ? 'be-s2' : s < 500 ? 'be-s4' : 'be-s5';
  // Renders an HTTP response: status line, headers, body.
  function httpOut(box, status, headers = [], body = '') {
    box.replaceChildren(
      h('div', { class: `be-status ${sCls(status)}` }, `HTTP/1.1 ${status} ${REASON[status] || ''}`),
      ...headers.map(([k, v]) => h('div', { class: 'be-hdr' }, h('b', {}, k + ': '), v)),
      body ? h('div', { class: 'be-body' }, body) : null);
    replay(box, 'pop-soft');
  }
  const httpBox = () => h('div', { class: 'be-http', 'aria-live': 'polite' }, h('span', { class: 'be-muted' }, 'No response yet.'));
  const J = o => JSON.stringify(o, null, 2);

  const css = `
.be-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.be-col { display: grid; gap: 10px; min-width: 0; }
.be-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 12px; min-width: 0; }
.be-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.be-muted { color: var(--muted); }
.be-panel { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.be-panel.be-on { border-color: var(--accent); }
.be-panel.be-ok { border-color: var(--ok); }
.be-panel.be-bad { border-color: var(--err); }
.be-pill { font: 600 0.78rem var(--mono); padding: 3px 9px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.be-pill.be-acc { border-color: var(--accent); background: var(--accent-soft); }
.be-pill.be-okp { border-color: var(--ok); background: var(--ok-soft); }
.be-pill.be-errp { border-color: var(--err); background: var(--err-soft); }
.be-pill.be-warnp { border-color: var(--warm); background: var(--warm-soft); }
.be-pill.be-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.be-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.be-stat b { color: var(--ink); }
.be-http { font: 500 0.8rem/1.55 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 10px 12px; min-height: 3em; white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.be-http b { color: var(--t-t); font-weight: 600; }
.be-status { font-weight: 700; }
.be-status.be-s2 { color: var(--t-k); }
.be-status.be-s4 { color: var(--t-f); }
.be-status.be-s5 { color: var(--t-e); }
.be-body { margin-top: 6px; }
.be-req { font: 500 0.8rem/1.55 var(--mono); background: var(--sunk); color: var(--ink); border-radius: 10px; padding: 10px 12px; white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; border: 1.5px dashed var(--line); }
.be-log { display: grid; gap: 2px; font: 500 0.78rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 8px 10px; max-height: 220px; overflow-y: auto; min-width: 0; }
.be-log div { white-space: pre-wrap; overflow-wrap: anywhere; }
.be-log .be-l-ok { color: var(--t-k); }
.be-log .be-l-err { color: var(--t-e); }
.be-log .be-l-warn { color: var(--t-f); }
.be-log .be-l-dim { opacity: 0.65; }
.be-seg { display: inline-flex; flex-wrap: wrap; gap: 4px; }

/* 1 request pipeline */
.be-stages { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 112px), 1fr)); gap: 8px; min-width: 0; }
.be-stage { display: grid; gap: 4px; align-content: start; padding: 8px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-height: 92px; min-width: 0; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.be-stage b { font: 700 0.8rem var(--mono); }
.be-stage span { font-size: 0.78rem; color: var(--muted); overflow-wrap: anywhere; }
.be-stage.be-on { border-color: var(--accent); background: var(--accent-soft); }
.be-stage.be-on span, .be-stage.be-done span { color: var(--ink); }
.be-stage.be-done { border-color: var(--ok); }
.be-stage.be-fail { border-color: var(--err); background: var(--err-soft); }
.be-stage.be-skip { opacity: 0.4; }

/* 3 routing tree */
.be-tree { display: grid; gap: 5px; min-width: 0; }
.be-tn { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; font: 600 0.8rem var(--mono); padding: 5px 9px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); min-width: 0; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s; position: relative; }
.be-tn .be-m { font: 600 0.66rem var(--mono); padding: 1px 6px; border-radius: 6px; border: 1px solid var(--line); color: var(--muted); }
.be-tn .be-m.be-mhit { border-color: var(--ok); color: var(--ink); background: var(--ok-soft); }
.be-tn.be-hit { border-color: var(--accent); background: var(--accent-soft); }
.be-tn.be-end { border-color: var(--ok); background: var(--ok-soft); }
.be-tn.be-miss { border-color: var(--err); background: var(--err-soft); }
.be-d1 { margin-left: 14px; } .be-d2 { margin-left: 28px; } .be-d3 { margin-left: 42px; } .be-d4 { margin-left: 56px; }
.be-pipe { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.be-pipe .be-arrow { color: var(--muted); font-weight: 700; }

/* 5 sql */
.be-sql { font: 500 0.8rem/1.5 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 8px 12px; white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.be-qbtn { white-space: normal; text-align: left; overflow-wrap: anywhere; }
.be-tbl { width: 100%; border-collapse: collapse; table-layout: fixed; font: 500 0.74rem var(--mono); }
.be-tbl th { text-align: left; color: var(--muted); font-weight: 600; padding: 3px 5px; border-bottom: 1.5px solid var(--line); overflow-wrap: anywhere; }
.be-tbl td { padding: 3px 5px; border-bottom: 1px solid var(--line); overflow-wrap: anywhere; transition: background 0.15s; }
.be-tbl tr.be-scan td { background: var(--warm-soft); }
.be-tbl tr.be-match td { background: var(--ok-soft); }
.be-tbl tr.be-new td { background: var(--accent-soft); }
.be-tblwrap { min-width: 0; }

/* 6 jwt timeline */
.be-tl { position: relative; height: 74px; border-radius: 10px; background: var(--surface); border: 1.5px solid var(--line); overflow: hidden; min-width: 0; }
.be-tl-seg { position: absolute; height: 18px; border-radius: 6px; transition: left 0.4s, width 0.4s, background 0.3s; font: 600 0.66rem/18px var(--mono); padding-left: 6px; white-space: nowrap; overflow: hidden; color: var(--ink); }
.be-tl-acc { top: 10px; background: var(--accent-soft); border: 1.5px solid var(--accent); }
.be-tl-acc.be-dead { background: var(--err-soft); border-color: var(--err); }
.be-tl-ref { top: 34px; background: var(--ok-soft); border: 1.5px solid var(--ok); }
.be-tl-ref.be-dead { background: var(--err-soft); border-color: var(--err); }
.be-tl-now { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--ink); transition: left 0.4s; }
.be-tl-ticks { position: absolute; left: 0; right: 0; bottom: 2px; display: flex; justify-content: space-between; padding: 0 4px; font: 500 0.62rem var(--mono); color: var(--muted); }

/* 7 tests */
.be-tests { display: grid; gap: 6px; min-width: 0; }
.be-test { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px; align-items: start; padding: 7px 9px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--surface); font: 500 0.78rem var(--mono); transition: border-color 0.2s, background 0.2s; }
.be-test .be-ic { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--line); display: grid; place-items: center; font-size: 0.7rem; font-weight: 800; }
.be-test.be-run .be-ic { border-color: var(--accent); border-top-color: transparent; animation: spin 0.7s linear infinite; }
.be-test.be-pass { border-color: var(--ok); }
.be-test.be-pass .be-ic { border-color: var(--ok); background: var(--ok); color: var(--bg); }
.be-test.be-failt { border-color: var(--err); background: var(--err-soft); }
.be-test.be-failt .be-ic { border-color: var(--err); background: var(--err); color: var(--bg); }
.be-test small { display: block; color: var(--muted); overflow-wrap: anywhere; }
.be-test.be-failt small { color: var(--ink); }
.be-toggles { display: grid; gap: 4px; }
.be-toggles label { display: flex; gap: 8px; align-items: flex-start; font-size: 0.86rem; overflow-wrap: anywhere; }

/* 8 deploy */
.be-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 96px), 1fr)); gap: 6px; min-width: 0; }
.be-step { display: grid; gap: 2px; padding: 7px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 600 0.72rem var(--mono); text-align: center; overflow-wrap: anywhere; min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.be-step.be-on { border-color: var(--accent); background: var(--accent-soft); }
.be-step.be-done { border-color: var(--ok); background: var(--ok-soft); }
.be-step.be-fail { border-color: var(--err); background: var(--err-soft); }
.be-step.be-skip { opacity: 0.4; }

/* 9 end to end */
.be-flow { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.be-hop { display: grid; gap: 4px; align-content: start; padding: 9px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-height: 96px; min-width: 0; transition: border-color 0.25s, background 0.25s; }
.be-hop .be-label { font-size: 0.64rem; }
.be-hop .be-v { font: 600 0.78rem/1.45 var(--mono); overflow-wrap: anywhere; white-space: pre-wrap; }
.be-hop.be-on { border-color: var(--accent); background: var(--accent-soft); }
.be-hop.be-ui { background: var(--bg); }
.be-phone-msg { font-family: inherit; font-weight: 600; font-size: 0.9rem; overflow-wrap: anywhere; }
`;

  // ---------- 1: request pipeline ----------
  function pipelineDemo(el) {
    const STAGES = [['Client', 'The app builds the request'], ['Routing', 'Which handler owns this path?'], ['Handler', 'Your code runs'], ['Database', 'Read or write rows'], ['Response', 'Status, headers, body']];
    const SCEN = [
      { req: 'GET /api/haberler?limit=2', notes: ['Android app sends GET, Accept: application/json', 'Matches get("/api/haberler")', 'Reads limit = 2, calls the repository', 'SELECT … ORDER BY published_at DESC LIMIT 2 → 2 rows', '200 OK with a JSON list'], status: 200, body: '[{"id":12,"title":"Derbi 2-2"},{"id":11,"title":"Dolar rekor kırdı"}]' },
      { req: 'POST /api/yorumlar', notes: ['Sends JSON {"articleId":12,"text":"Harika maç"}', 'Matches post("/api/yorumlar")', 'receive<NewComment>(), checks the text is not blank', 'INSERT INTO comments … → new id 58', '201 Created, Location: /api/yorumlar/58'], status: 201, body: '{"id":58,"articleId":12,"text":"Harika maç"}' },
      { req: 'GET /api/haberler/999', notes: ['Asks for article 999', 'Matches get("/api/haberler/{id}"), id = 999', 'Parses id, asks the repository', 'SELECT … WHERE id = 999 → 0 rows', '404 Not Found with an error body'], status: 404, body: '{"code":"article_not_found","message":"No article with id 999."}' },
      { req: 'GET /api/yok', notes: ['Asks for a path nobody wrote', 'No route matches /api/yok', '', '', '404 Not Found, no handler ran'], status: 404, body: '', stopAt: 1 },
    ];
    const cards = STAGES.map(([t, d]) => h('div', { class: 'be-stage' }, h('b', {}, t), h('span', {}, d)));
    const res = httpBox();
    const r = runner();
    const btns = SCEN.map(s => cmd(s.req, () => go(s)));
    async function go(s) {
      const id = r.next(); press(btns, btns[SCEN.indexOf(s)]);
      cards.forEach((c, i) => { c.className = 'be-stage'; c.lastChild.textContent = STAGES[i][1]; });
      res.replaceChildren(h('span', { class: 'be-muted' }, 'Waiting…'));
      for (let i = 0; i < cards.length; i++) {
        if (!r.live(id)) return;
        const skipped = s.stopAt != null && i > s.stopAt && i < cards.length - 1;
        if (skipped) { cards[i].classList.add('be-skip'); cards[i].lastChild.textContent = 'Skipped'; continue; }
        cards[i].classList.add('be-on'); cards[i].lastChild.textContent = s.notes[i];
        await sleep(520);
        if (!r.live(id)) return;
        cards[i].classList.remove('be-on');
        cards[i].classList.add(s.stopAt === i || (i === cards.length - 1 && s.status >= 400) ? 'be-fail' : 'be-done');
      }
      httpOut(res, s.status, [['Content-Type', 'application/json']], s.body);
    }
    el.append(label('Pick a request'), h('div', { class: 'be-row' }, btns), h('div', { class: 'be-stages' }, cards), res);
  }

  // ---------- 2: HTTP simulator ----------
  function httpDemo(el) {
    let store = { 41: 'Derbi özeti' }, nextId = 43, sent = 0;
    let method = 'GET', accept = 'application/json';
    const preview = h('div', { class: 'be-req' });
    const res = httpBox();
    const state = h('div', { class: 'be-row' });
    const note = out('Pick a method, then send it. Send the same request twice and watch the server state.');
    const counter = h('span', { class: 'be-stat' });
    const path = () => method === 'POST' ? '/api/bookmarks' : '/api/bookmarks/42';
    function drawPreview() {
      const body = method === 'POST' || method === 'PUT' ? '\nContent-Type: application/json\n\n{"title":"Transfer haberi"}' : '';
      preview.textContent = `${method} ${path()} HTTP/1.1\nHost: api.ornek.com\nAccept: ${accept}${body}`;
    }
    function drawState(changed) {
      state.replaceChildren(...Object.entries(store).map(([k, v]) => pill(`#${k} ${v}`, 'be-acc')));
      if (!Object.keys(store).length) state.append(pill('empty', 'be-ghost'));
      counter.innerHTML = `requests sent: <b>${sent}</b>`;
      if (changed != null) replay(state, 'pop-soft');
    }
    function send() {
      sent++;
      const before = JSON.stringify(store);
      let st, hd = [], body = '';
      if (accept === 'application/xml' && method !== 'DELETE') {
        st = 406; body = 'This API only speaks application/json.';
      } else if (method === 'GET') {
        if (store[42]) { st = 200; hd = [['Content-Type', 'application/json'], ['Cache-Control', 'max-age=60']]; body = J({ id: 42, title: store[42] }); }
        else { st = 404; hd = [['Content-Type', 'application/json']]; body = '{"code":"not_found","message":"No bookmark 42."}'; }
      } else if (method === 'POST') {
        const id = nextId++; store[id] = 'Transfer haberi';
        st = 201; hd = [['Location', `/api/bookmarks/${id}`], ['Content-Type', 'application/json']]; body = J({ id, title: 'Transfer haberi' });
      } else if (method === 'PUT') {
        st = store[42] ? 200 : 201; store[42] = 'Transfer haberi';
        hd = [['Content-Type', 'application/json']]; body = J({ id: 42, title: 'Transfer haberi' });
      } else {
        if (store[42]) { delete store[42]; st = 204; } else { st = 404; body = '{"code":"not_found","message":"No bookmark 42."}'; }
      }
      httpOut(res, st, hd, body);
      const changed = before !== JSON.stringify(store);
      drawState(changed);
      const kind = { GET: 'safe and idempotent', PUT: 'idempotent', DELETE: 'idempotent', POST: 'neither safe nor idempotent' }[method];
      say(note, `${method} is ${kind}. This send <b>${changed ? 'changed' : 'did not change'}</b> the server state.` +
        (method === 'DELETE' && st === 404 ? ' The second DELETE got 404, but the state is the same as after the first: that is what idempotent means.' : '') +
        (method === 'POST' && changed ? ' Send it again: every POST adds another bookmark.' : '') +
        (st === 406 ? ' Content negotiation failed: the server has no XML version.' : ''));
    }
    const mBtns = ['GET', 'POST', 'PUT', 'DELETE'].map(m => act(m, () => { method = m; press(mBtns, mBtns[['GET', 'POST', 'PUT', 'DELETE'].indexOf(m)]); drawPreview(); }));
    const aBtns = ['application/json', 'application/xml'].map(a => act('Accept: ' + a.split('/')[1], () => { accept = a; press(aBtns, aBtns[a === 'application/json' ? 0 : 1]); drawPreview(); }));
    press(mBtns, mBtns[0]); press(aBtns, aBtns[0]);
    drawPreview(); drawState();
    el.append(
      h('div', { class: 'be-pair' },
        h('div', { class: 'be-col' }, label('Method'), h('div', { class: 'be-row' }, mBtns), label('Header'), h('div', { class: 'be-row' }, aBtns), preview,
          h('div', { class: 'be-row' }, h('button', { class: 'btn primary small', onclick: send }, 'Send'), counter)),
        h('div', { class: 'be-col' }, label('Response'), res, label('Server state: bookmarks'), state)),
      note);
  }

  // ---------- 3: routing tree ----------
  function routingDemo(el) {
    const NODES = [
      { id: 'root', text: '/', d: 0, m: [] },
      { id: 'health', text: 'health', d: 1, m: ['GET'] },
      { id: 'api', text: 'api', d: 1, m: [] },
      { id: 'articles', text: 'articles', d: 2, m: ['GET', 'POST'] },
      { id: 'aid', text: '{id}', d: 3, m: ['GET', 'DELETE'] },
      { id: 'comments', text: 'comments', d: 4, m: ['GET'] },
    ];
    const REQS = [
      { r: 'GET /health', path: ['root', 'health'], st: 200, body: 'OK' },
      { r: 'GET /api/articles', path: ['root', 'api', 'articles'], st: 200, body: '[{"id":7,"title":"Derbi 2-2"}, …]' },
      { r: 'POST /api/articles', path: ['root', 'api', 'articles'], st: 201, body: '{"id":8,"title":"Yeni haber"}' },
      { r: 'GET /api/articles/7', path: ['root', 'api', 'articles', 'aid'], st: 200, params: 'id = "7"', body: '{"id":7,"title":"Derbi 2-2"}' },
      { r: 'GET /api/articles/7/comments', path: ['root', 'api', 'articles', 'aid', 'comments'], st: 200, params: 'id = "7"', body: '[{"id":1,"text":"Harika maç"}]' },
      { r: 'GET /api/articles/abc', path: ['root', 'api', 'articles', 'aid'], st: 400, params: 'id = "abc"', body: '{"code":"bad_id","message":"id must be a number"}', why: 'The route matched, because {id} accepts any one segment. The handler’s toIntOrNull() returned null, so it answered 400.' },
      { r: 'GET /api/users', path: ['root', 'api'], miss: true, st: 404, body: '', why: 'No child of /api is called users, so routing gives up and Ktor answers 404. No handler ran.' },
    ];
    const els = {};
    const tree = h('div', { class: 'be-tree' }, NODES.map(n => {
      const node = h('div', { class: `be-tn be-d${n.d}` }, (n.d ? '└ ' : '') + n.text, n.m.map(m => h('span', { class: 'be-m', 'data-m': m }, m)));
      els[n.id] = node; return node;
    }));
    const res = httpBox();
    const params = h('div', { class: 'be-stat' }, 'call.parameters: —');
    const note = out('Send a request and follow the match through the tree.');
    const r = runner();
    const btns = REQS.map((q, i) => cmd(q.r, () => go(q, i)));
    async function go(q, i) {
      const id = r.next(); press(btns, btns[i]);
      Object.values(els).forEach(n => { n.classList.remove('be-hit', 'be-end', 'be-miss'); n.querySelectorAll('.be-m').forEach(m => m.classList.remove('be-mhit')); });
      params.textContent = 'call.parameters: —';
      res.replaceChildren(h('span', { class: 'be-muted' }, 'Matching…'));
      const method = q.r.split(' ')[0];
      for (const nid of q.path) {
        await sleep(380); if (!r.live(id)) return;
        els[nid].classList.add('be-hit');
      }
      await sleep(380); if (!r.live(id)) return;
      const last = els[q.path[q.path.length - 1]];
      if (q.miss) { last.classList.remove('be-hit'); last.classList.add('be-miss'); }
      else {
        last.classList.remove('be-hit'); last.classList.add('be-end');
        const m = last.querySelector(`.be-m[data-m="${method}"]`); if (m) m.classList.add('be-mhit');
      }
      if (q.params) params.innerHTML = `call.parameters["id"]: <b>${esc(q.params.split(' = ')[1])}</b>`;
      httpOut(res, q.st, q.body ? [['Content-Type', q.st === 200 && q.r === 'GET /health' ? 'text/plain' : 'application/json']] : [], q.body);
      say(note, q.why || `Matched ${q.path.length - 1} segment${q.path.length > 2 ? 's' : ''}, then the ${method} handler on that node ran.`);
    }
    el.append(label('Requests'), h('div', { class: 'be-row' }, btns),
      h('div', { class: 'be-pair' }, h('div', { class: 'be-col' }, label('Route tree'), tree, params), h('div', { class: 'be-col' }, label('Response'), res)), note);
  }

  function pluginDemo(el) {
    const CASES = [
      { b: 'handler returns Article', steps: ['ok', 'ok', 'ok', 'skip'], st: 200, body: '{"id":7,"title":"Derbi 2-2"}', n: 'ContentNegotiation turned the Article object into JSON because the client accepts application/json.' },
      { b: 'throws ArticleNotFound', steps: ['ok', 'fail', 'on', 'ok'], st: 404, body: '{"code":"article_not_found","message":""}', n: 'StatusPages caught your exception and mapped it to 404 with the same error shape every endpoint uses.' },
      { b: 'throws IllegalStateException', steps: ['ok', 'fail', 'on', 'ok'], st: 500, body: '{"code":"internal","message":""}', n: 'An unexpected crash. Your catch-all StatusPages handler logs the stack trace on the server and sends a bland 500. The client never sees internals.' },
    ];
    const NAMES = ['receive / route', 'your handler', 'StatusPages', 'error mapping'];
    const boxes = NAMES.map(n => h('span', { class: 'be-pill' }, n));
    const pipe = h('div', { class: 'be-pipe' }, boxes.flatMap((b, i) => i ? [h('span', { class: 'be-arrow', 'aria-hidden': 'true' }, '→'), b] : [b]));
    const res = httpBox(); const note = out('Pick what the handler does.');
    const r = runner();
    const btns = CASES.map((c, i) => act(c.b, async () => {
      const id = r.next(); press(btns, btns[i]);
      boxes.forEach(b => { b.className = 'be-pill'; });
      for (let k = 0; k < boxes.length; k++) {
        await sleep(330); if (!r.live(id)) return;
        boxes[k].className = 'be-pill ' + { ok: 'be-okp', fail: 'be-errp', on: 'be-acc', skip: 'be-ghost' }[c.steps[k]];
      }
      httpOut(res, c.st, [['Content-Type', 'application/json']], c.body); say(note, c.n);
    }));
    el.append(h('div', { class: 'be-row' }, btns), pipe, res, note);
  }

  // ---------- 4: REST console ----------
  function restDemo(el) {
    const ALL = ['Derbi 2-2 bitti', 'Dolar rekor kırdı', 'İstanbul’da yağmur', 'Yeni metro hattı', 'Konser iptal', 'Seçim anketi', 'Transfer dönemi', 'Deprem tatbikatı'];
    let items = ALL.map((t, i) => ({ id: ALL.length - i, title: t })), cursor = null;
    const ERR = (code, message, fields) => J(Object.assign({ code, message }, fields ? { fields } : {}));
    const page = after => {
      const start = after == null ? 0 : items.findIndex(x => x.id === after) + 1;
      const slice = items.slice(start, start + 3);
      const more = start + 3 < items.length;
      cursor = more ? slice[slice.length - 1].id : null;
      return { items: slice, nextCursor: more ? String(cursor) : null };
    };
    const CALLS = [
      { b: 'GET /v1/articles?limit=3', run: () => [200, [['Content-Type', 'application/json']], J(page(null))], n: 'First page. The server returns a cursor that points just past the last item it sent.' },
      { b: 'GET next page', run: () => cursor == null ? [200, [], J({ items: [], nextCursor: null })] : (c => [200, [['Content-Type', 'application/json']], J(page(c))])(cursor), n: 'The client sends ?cursor=… back unchanged. A null cursor means there is nothing more to load.', label: () => cursor == null ? 'GET next page' : `GET /v1/articles?limit=3&cursor=${cursor}` },
      { b: 'POST /v1/articles {"title":"Maç özeti"}', run: () => { const id = Math.max(...items.map(x => x.id)) + 1; items.unshift({ id, title: 'Maç özeti' }); return [201, [['Location', `/v1/articles/${id}`], ['Content-Type', 'application/json']], J({ id, title: 'Maç özeti' })]; }, n: '201 Created plus a Location header that names the new resource.' },
      { b: 'POST /v1/articles {"title":""}', run: () => [400, [['Content-Type', 'application/json']], ERR('validation_failed', 'Some fields are invalid.', { title: 'must not be blank' })], n: 'Validation failed. The body says which field and why, so the app can put the message next to the right input.' },
      { b: 'GET /v1/articles/999', run: () => [404, [['Content-Type', 'application/json']], ERR('not_found', 'No article with id 999.')], n: 'Same error shape as the 400. One shape for every error means one parser on the client.' },
      { b: 'DELETE /v1/articles/3 (no token)', run: () => [401, [['WWW-Authenticate', 'Bearer'], ['Content-Type', 'application/json']], ERR('unauthorized', 'Sign in first.')], n: '401 means “who are you?”. A 403 would mean “I know you, and you may not do this”.' },
    ];
    const res = httpBox(); const note = out('Try the calls in order: page 1, next page, next page again.');
    const list = h('div', { class: 'be-row' });
    const draw = () => list.replaceChildren(...items.map(x => pill(`${x.id} ${x.title}`)));
    const btns = CALLS.map((c, i) => cmd(c.b, () => {
      const [st, hd, body] = c.run(); press(btns, btns[i]);
      httpOut(res, st, hd, body); say(note, c.n); draw();
      btns[1].innerHTML = hl(CALLS[1].label());
    }));
    draw();
    el.append(label('Calls'), h('div', { class: 'be-row' }, btns), res, label('Rows on the server, newest first'), list, note);
  }

  // ---------- 5: SQL runner ----------
  function sqlDemo(el) {
    const USERS = [[1, 'Ayşe', 'İstanbul'], [2, 'Mehmet', 'Ankara'], [3, 'Zeynep', 'İzmir']];
    const START = [[1, 1, 'Derbi 2-2', 1200], [2, 2, 'Dolar rekor', 800], [3, 1, 'Hava durumu', 300], [4, 3, 'Konser', 150], [5, 2, 'Seçim anketi', 950], [6, 1, 'Transfer', 2200], [7, 3, 'Trafik', 90], [8, 2, 'Tatbikat', 400]];
    let arts = START.map(r => r.slice()), indexed = false, newId = 9;
    const aTbl = h('table', { class: 'be-tbl' }); const uTbl = h('table', { class: 'be-tbl' });
    const result = h('div', { class: 'be-tblwrap' }); const stats = h('div', { class: 'be-stat' }, 'Run a query.');
    const sqlBox = h('div', { class: 'be-sql' }, '-- pick a query');
    const head = cols => h('tr', {}, cols.map(c => h('th', {}, c)));
    function drawTables() {
      aTbl.replaceChildren(head(['id', 'user_id', 'title', 'views']), ...arts.map(r => h('tr', {}, r.map(v => h('td', {}, String(v))))));
      uTbl.replaceChildren(head(['id', 'name', 'city']), ...USERS.map(r => h('tr', {}, r.map(v => h('td', {}, String(v))))));
    }
    const rowsOf = t => [...t.querySelectorAll('tr')].slice(1);
    const showResult = (cols, rows) => result.replaceChildren(rows.length ? h('table', { class: 'be-tbl' }, head(cols), rows.map(r => h('tr', {}, r.map(v => h('td', {}, String(v)))))) : h('span', { class: 'be-muted' }, '(no rows returned)'));
    const r = runner();
    async function scan(id, tbl, test, useIndex) {
      const trs = rowsOf(tbl); let read = 0; const hits = [];
      for (let i = 0; i < trs.length; i++) {
        const hit = test(i);
        if (useIndex && !hit) continue;
        read++; trs[i].classList.add('be-scan');
        await sleep(useIndex ? 160 : 110); if (!r.live(id)) return null;
        trs[i].classList.remove('be-scan');
        if (hit) { trs[i].classList.add('be-match'); hits.push(i); }
      }
      return { read, hits };
    }
    const Q = [
      { sql: 'SELECT * FROM articles\nWHERE views > 500\nORDER BY views DESC;', async go(id) {
        const s = await scan(id, aTbl, i => arts[i][3] > 500); if (!s) return;
        const rows = s.hits.map(i => arts[i]).sort((a, b) => b[3] - a[3]);
        showResult(['id', 'user_id', 'title', 'views'], rows);
        stats.innerHTML = `rows read: <b>${s.read}</b> · returned: <b>${rows.length}</b>. No index on views, so every row was checked.`;
      } },
      { sql: 'SELECT title FROM articles\nWHERE user_id = 2;', async go(id) {
        const s = await scan(id, aTbl, i => arts[i][1] === 2, indexed); if (!s) return;
        showResult(['title'], s.hits.map(i => [arts[i][2]]));
        stats.innerHTML = indexed ? `rows read: <b>${s.read}</b> via articles_user_id_idx. The index jumped straight to the matches.` : `rows read: <b>${s.read}</b> · returned: <b>${s.hits.length}</b>. A full scan. Create the index and run this again.`;
      } },
      { sql: 'CREATE INDEX articles_user_id_idx\nON articles (user_id);', async go() {
        indexed = true; showResult([], []);
        stats.innerHTML = 'Index created. Reads by user_id get faster. Every INSERT and UPDATE now also updates the index.';
      } },
      { sql: "INSERT INTO articles (user_id, title, views)\nVALUES (3, 'Yeni haber', 0);", async go() {
        arts.push([newId++, 3, 'Yeni haber', 0]); drawTables();
        rowsOf(aTbl).at(-1).classList.add('be-new'); showResult([], []);
        stats.innerHTML = `1 row inserted. The database chose id <b>${newId - 1}</b>${indexed ? ' and updated the index too' : ''}.`;
      } },
      { sql: 'UPDATE articles\nSET views = views + 1\nWHERE id = 4;', async go(id) {
        const s = await scan(id, aTbl, i => arts[i][0] === 4, true); if (!s) return;
        s.hits.forEach(i => { arts[i][3]++; rowsOf(aTbl)[i].lastChild.textContent = String(arts[i][3]); });
        showResult([], []);
        stats.innerHTML = `1 row updated. The primary key has its own index, so finding id 4 read <b>${s.read}</b> row. Forget the WHERE and every row changes.`;
      } },
      { sql: "SELECT u.name, a.title\nFROM articles a\nJOIN users u ON a.user_id = u.id\nWHERE u.city = 'Ankara';", async go(id) {
        const su = await scan(id, uTbl, i => USERS[i][2] === 'Ankara'); if (!su) return;
        const uid = USERS[su.hits[0]][0];
        const sa = await scan(id, aTbl, i => arts[i][1] === uid, indexed); if (!sa) return;
        showResult(['name', 'title'], sa.hits.map(i => [USERS[su.hits[0]][1], arts[i][2]]));
        stats.innerHTML = `users read: <b>${su.read}</b>, articles read: <b>${sa.read}</b>. The join pairs each article with its author row.`;
      } },
    ];
    const btns = Q.map((q, i) => h('button', { class: 'cmd be-qbtn', onclick: async () => {
      const id = r.next(); press(btns, btns[i]);
      drawTables(); sqlBox.textContent = q.sql; stats.textContent = 'Running…'; result.replaceChildren();
      await q.go(id);
    } }, q.sql.split('\n')[0] + (q.sql.includes('\n') ? ' …' : '')));
    drawTables();
    el.append(label('Queries'), h('div', { class: 'be-row' }, btns), sqlBox,
      h('div', { class: 'be-pair' }, h('div', { class: 'be-col' }, label('articles'), aTbl), h('div', { class: 'be-col' }, label('users'), uTbl, label('Result'), result)),
      stats);
  }

  // ---------- 6: JWT timeline ----------
  function jwtDemo(el) {
    const ACCESS = 15;
    let now = 0, signed = false, access = null, refresh = null, used = [], fam = 1, refreshDead = false;
    const accSeg = h('div', { class: 'be-tl-seg be-tl-acc' }, 'access');
    const refSeg = h('div', { class: 'be-tl-seg be-tl-ref' }, 'refresh (30 days)');
    const nowLine = h('div', { class: 'be-tl-now' });
    const ticks = h('div', { class: 'be-tl-ticks' });
    const tl = h('div', { class: 'be-tl', role: 'img', 'aria-label': 'Token lifetimes on a timeline' }, accSeg, refSeg, nowLine, ticks);
    const log = h('div', { class: 'be-log', 'aria-live': 'polite' });
    const clock = h('span', { class: 'be-stat' });
    const tokens = h('div', { class: 'be-row' });
    const line = (t, c = '') => { log.append(h('div', { class: c }, `[${String(now).padStart(2, '0')} min] ${t}`)); log.scrollTop = log.scrollHeight; };
    function draw() {
      const start = Math.max(0, now - 30), span = 60, pct = m => ((m - start) / span * 100);
      ticks.replaceChildren(...[0, 15, 30, 45, 60].map(d => h('span', {}, `${start + d}m`)));
      nowLine.style.left = `calc(${pct(now)}% - 1px)`;
      if (access) {
        const l = Math.max(0, pct(access.iat)), rgt = Math.min(100, pct(access.exp));
        accSeg.style.display = rgt > 0 ? '' : 'none';
        accSeg.style.left = l + '%'; accSeg.style.width = Math.max(0, rgt - l) + '%';
        accSeg.classList.toggle('be-dead', now >= access.exp || refreshDead);
        accSeg.textContent = now >= access.exp ? 'access expired' : 'access';
      } else accSeg.style.display = 'none';
      if (refresh) { refSeg.style.display = ''; const l = Math.max(0, pct(refresh.iat)); refSeg.style.left = l + '%'; refSeg.style.width = (100 - l) + '%'; refSeg.classList.toggle('be-dead', refreshDead); refSeg.textContent = refreshDead ? 'refresh revoked' : 'refresh (30 days)'; }
      else refSeg.style.display = 'none';
      clock.innerHTML = `now: <b>${now} min</b>`;
      tokens.replaceChildren(
        pill(access ? `access #${access.n}` : 'no access token', access ? (now < access.exp && !refreshDead ? 'be-acc' : 'be-errp') : 'be-ghost'),
        pill(refresh ? `refresh R${fam}.${refresh.n}` : 'no refresh token', refresh ? (refreshDead ? 'be-errp' : 'be-okp') : 'be-ghost'));
      replayBtn.disabled = !used.length || !signed;
    }
    let accN = 0, refN = 0;
    const issue = () => { access = { iat: now, exp: now + ACCESS, n: ++accN }; };
    function login() {
      signed = true; refreshDead = false; used = []; fam++; refN = 0;
      issue(); refresh = { iat: now, n: ++refN };
      line('POST /auth/login → 200, access token (15 min) + refresh token', 'be-l-ok'); draw();
    }
    function doRefresh() {
      if (!refresh || refreshDead) { line('POST /auth/refresh → 401, refresh token revoked. Show the sign-in screen.', 'be-l-err'); signed = false; access = null; refresh = null; draw(); return false; }
      used.push(refresh.n);
      issue(); refresh = { iat: now, n: ++refN };
      line(`POST /auth/refresh → 200, new access #${access.n}, rotated refresh R${fam}.${refresh.n}; R${fam}.${refresh.n - 1} is now used`, 'be-l-ok'); return true;
    }
    async function me() {
      if (!signed || !access) { line('GET /me (no token) → 401', 'be-l-err'); draw(); return; }
      if (now < access.exp && !refreshDead) { line(`GET /me with access #${access.n} → 200 {"name":"Ayşe"}`, 'be-l-ok'); draw(); return; }
      line(`GET /me with access #${access.n} → 401, token expired`, 'be-l-warn'); draw();
      await sleep(450);
      if (doRefresh()) { draw(); await sleep(400); line(`retry GET /me with access #${access.n} → 200`, 'be-l-ok'); }
      draw();
    }
    function wait() { now += 10; line('… 10 minutes pass', 'be-l-dim'); draw(); }
    function logout() {
      if (!signed) return;
      line('POST /auth/logout → server deletes the refresh token row. Client wipes both tokens.', 'be-l-ok');
      signed = false; access = null; refresh = null; used = []; draw();
    }
    function replayOld() {
      const old = used[used.length - 1];
      line(`An attacker sends old refresh R${fam}.${old} → server sees it was already used → revokes the whole family → 401`, 'be-l-err');
      refreshDead = true; draw();
    }
    const replayBtn = act('Replay an old refresh token', replayOld);
    el.append(
      h('div', { class: 'be-row' }, act('Sign in', login), act('GET /me', me), act('Wait 10 min', wait), act('Sign out', logout), replayBtn),
      h('div', { class: 'be-row' }, clock, tokens), tl, log);
    draw(); line('Sign in, call /me, then let time pass and call it again.', 'be-l-dim');
  }

  // ---------- 7: test runner ----------
  function testDemo(el) {
    const BUGS = [
      { id: 'val', text: 'Remove the RequestValidation rule for blank titles' },
      { id: 'auth', text: 'Move get("/me") outside authenticate { }' },
      { id: 'shared', text: 'Share one database between tests (no reset)' },
    ];
    const on = {};
    const TESTS = [
      { name: 'GET /health returns 200', run: () => [true, 'status 200'] },
      { name: 'POST /v1/articles with blank title returns 400', run: () => on.val ? [false, 'expected 400 Bad Request, was 201 Created'] : [true, 'status 400, fields.title present'] },
      { name: 'GET /me without a token returns 401', run: () => on.auth ? [false, 'expected 401 Unauthorized, was 200 OK'] : [true, 'status 401'] },
      { name: 'GET /v1/articles on an empty database returns []', run: order => on.shared && on.val && order.indexOf(1) < order.indexOf(3) ? [false, 'expected [], got 1 item left over from the blank-title test'] : [true, 'body []'] },
    ];
    // Test 2 (blank title) inserts a row when validation is missing; with a shared database that row leaks into test 4.
    const rows = TESTS.map(t => h('div', { class: 'be-test' }, h('span', { class: 'be-ic', 'aria-hidden': 'true' }), h('div', {}, t.name, h('small', {}, 'not run'))));
    const summary = out('Run the suite, then switch on a bug and run it again.');
    const toggles = h('div', { class: 'be-toggles' }, BUGS.map(b => h('label', {}, h('input', { type: 'checkbox', onchange(e) { on[b.id] = e.target.checked; } }), b.text)));
    const r = runner();
    async function run(shuffle) {
      const id = r.next();
      let order = TESTS.map((_, i) => i);
      if (shuffle) for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      rows.forEach(x => { x.className = 'be-test'; x.querySelector('small').textContent = 'queued'; x.querySelector('.be-ic').textContent = ''; });
      let pass = 0;
      for (const i of order) {
        rows[i].classList.add('be-run'); rows[i].querySelector('small').textContent = 'running in testApplication { }';
        await sleep(420); if (!r.live(id)) return;
        const [ok, msg] = TESTS[i].run(order);
        rows[i].className = 'be-test ' + (ok ? 'be-pass' : 'be-failt');
        rows[i].querySelector('.be-ic').textContent = ok ? '✓' : '✕';
        rows[i].querySelector('small').textContent = msg; pass += ok;
      }
      say(summary, `${pass} of ${TESTS.length} passed in order ${order.map(i => i + 1).join(', ')}.` + (on.shared && !on.val ? ' Tip: the shared-database bug only shows when a test leaves rows behind. Combine it with the validation bug.' : '') + (on.shared && on.val ? ' Run in random order a few times: the leftover row makes test 4 pass or fail depending on order. That is a flaky test.' : ''));
    }
    el.append(label('Break the server'), toggles,
      h('div', { class: 'be-row' }, h('button', { class: 'btn primary small', onclick: () => run(false) }, 'Run tests'), act('Run in random order', () => run(true))),
      h('div', { class: 'be-tests' }, rows), summary);
  }

  // ---------- 8: deploy pipeline ----------
  function deployDemo(el) {
    const STEPS = ['git push', 'tests', 'buildFatJar', 'docker build', 'push image', 'deploy v2', 'health check', 'traffic → v2'];
    const opts = { tests: true, secret: true };
    const cells = STEPS.map(s => h('div', { class: 'be-step' }, s));
    const log = h('div', { class: 'be-log', 'aria-live': 'polite' });
    const live = h('span', { class: 'be-pill be-okp' }, 'live: v1');
    const add = (t, c = '') => { log.append(h('div', { class: c }, t)); log.scrollTop = log.scrollHeight; };
    const LOG = [
      ['CI: commit 3f2a9c1 on main', ''],
      ['CI: ./gradlew test → 42 tests passed', 'be-l-ok'],
      ['CI: ./gradlew buildFatJar → build/libs/server-all.jar', 'be-l-ok'],
      ['CI: docker build -t haber-api:3f2a9c1 .', 'be-l-ok'],
      ['CI: push registry/haber-api:3f2a9c1', 'be-l-ok'],
      ['host: start container with env DATABASE_URL, JWT_SECRET', ''],
      ['host: GET /health → 200 {"db":"up"}', 'be-l-ok'],
      ['host: v2 takes traffic, v1 drains and stops', 'be-l-ok'],
    ];
    const r = runner();
    async function go() {
      const id = r.next();
      cells.forEach(c => { c.className = 'be-step'; }); log.replaceChildren();
      for (let i = 0; i < STEPS.length; i++) {
        cells[i].classList.add('be-on'); await sleep(420); if (!r.live(id)) return;
        let fail = null;
        if (i === 1 && !opts.tests) fail = ['CI: ./gradlew test → 1 failed: blank title returns 400. Pipeline stops; nothing is deployed.'];
        if (i === 5 && !opts.secret) { add('host: start container with env DATABASE_URL', ''); }
        if (i === 6 && !opts.secret) fail = ['host: v2 exits at startup: Could not resolve substitution to a value: ${JWT_SECRET}', 'host: GET /health → no answer. v2 never becomes healthy, so it gets no traffic. v1 keeps serving.'];
        cells[i].classList.remove('be-on');
        if (fail) {
          cells[i].classList.add('be-fail'); fail.forEach(f => add(f, 'be-l-err'));
          cells.slice(i + 1).forEach(c => c.classList.add('be-skip')); return;
        }
        if (!(i === 5 && !opts.secret)) add(...LOG[i]);
        cells[i].classList.add('be-done');
      }
      live.textContent = 'live: v2'; replay(live, 'pop-soft');
    }
    const box = (k, text) => h('label', {}, h('input', { type: 'checkbox', checked: true, onchange(e) { opts[k] = e.target.checked; } }), text);
    el.append(h('div', { class: 'be-toggles' }, box('tests', 'All tests pass'), box('secret', 'JWT_SECRET is set on the host')),
      h('div', { class: 'be-row' }, h('button', { class: 'btn primary small', onclick: go }, 'Deploy'), live, h('button', { class: 'cmd', onclick() { live.textContent = 'live: v1'; cells.forEach(c => { c.className = 'be-step'; }); log.replaceChildren(); } }, 'Reset to v1')),
      h('div', { class: 'be-steps' }, cells), log);
  }

  // ---------- 9: end-to-end error mapping ----------
  function e2eDemo(el) {
    const CASES = [
      { b: '200 OK', server: '200\n{"id":7,"title":"Derbi 2-2"}', client: 'body<ArticleDto>()', repo: 'Result.Ok(Article(7, …))', ui: 'Shows the article', tone: 'ok' },
      { b: '400 validation', server: '400\n{"code":"validation_failed","fields":{"text":"must not be blank"}}', client: 'ClientRequestException\n→ read ApiError body', repo: 'AppError.Invalid(\n  field = "text")', ui: 'Yorum boş olamaz.\n(“Comment can’t be empty.” under the field)', tone: 'warn' },
      { b: '401 expired', server: '401\nWWW-Authenticate: Bearer', client: 'Auth plugin refreshes,\nretries once', repo: 'Result.Ok(…) after refresh\nor AppError.SignedOut', ui: 'Nothing visible, or the sign-in screen if refresh failed', tone: 'ok' },
      { b: '404', server: '404\n{"code":"not_found"}', client: 'ClientRequestException\nstatus = 404', repo: 'AppError.NotFound', ui: 'Bu haber kaldırılmış.\n(“This article was removed.”)', tone: 'warn' },
      { b: '500', server: '500\n{"code":"internal"}\n(stack trace stays in server logs)', client: 'ServerResponseException', repo: 'AppError.Server', ui: 'Bir sorun oluştu, tekrar dene.\n(“Something went wrong, try again.” + Retry)', tone: 'err' },
      { b: 'no network', server: '(request never arrived)', client: 'IOException', repo: 'AppError.Offline', ui: 'İnternet bağlantısı yok.\n(“No internet connection.” + cached data)', tone: 'err' },
    ];
    const NAMES = ['Server', 'HTTP client', 'Repository', 'Screen'];
    const vals = NAMES.map(() => h('div', { class: 'be-v' }, '—'));
    const hops = NAMES.map((n, i) => h('div', { class: 'be-hop' + (i === 3 ? ' be-ui' : '') }, h('div', { class: 'be-label' }, n), vals[i]));
    const note = out('Pick what happens on the server.');
    const r = runner();
    const btns = CASES.map((c, i) => act(c.b, async () => {
      const id = r.next(); press(btns, btns[i]);
      vals.forEach(v => { v.textContent = '…'; }); hops.forEach(x => x.classList.remove('be-on'));
      const parts = [c.server, c.client, c.repo, c.ui];
      for (let k = 0; k < 4; k++) {
        hops[k].classList.add('be-on'); vals[k].textContent = parts[k];
        if (k === 3) vals[k].className = 'be-v be-phone-msg';
        else vals[k].className = 'be-v';
        await sleep(430); if (!r.live(id)) return;
        if (k < 3) hops[k].classList.remove('be-on');
      }
      say(note, c.tone === 'ok' ? 'The happy path, or a problem the client fixes by itself.' : 'Each layer translates the error into its own words. The screen never sees an HTTP status code.');
    }));
    el.append(h('div', { class: 'be-row' }, btns), h('div', { class: 'be-flow' }, hops), note);
  }

  Lab.addTrack({
    id: 'backend',
    title: 'Backend with Kotlin',
    description: 'Build the server side of your own app in the language you already know: HTTP, Ktor, REST design, PostgreSQL, auth, tests, deployment and the Android client that talks to it.',
    requires: ['coroutines', 'data'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'what',
        title: 'What a backend does',
        tagline: 'A request comes in, routing picks a handler, the handler talks to a database, and a response goes back.',
        level: 'beginner',
        body: `
<p>Your app already talks to servers (see <a href="#data.net">Networking</a>). A backend is the other end of that call: a program that waits for HTTP requests, does the work only a central place can do, and answers.</p>
<p>Every request takes the same trip. <em>Routing</em> reads the method and path and picks a <em>handler</em>. The handler is your code: it checks the input, applies the rules and usually reads or writes a <em>database</em>. Then it builds a <em>response</em> with a status code, headers and a body.</p>
<p>What belongs on the server? Anything shared between users (comments, likes), anything secret (API keys, payment logic), and anything you must be able to trust. The phone is in the user's hands, so the server re-checks everything the app sends.</p>
<p>Pick a request below and follow it through each stage.</p>`,
        visual: pipelineDemo,
        code: `// One request, start to finish, in Ktor
routing {
    get("/api/haberler/{id}") {                                   // 1. routing matched
        val id = call.parameters["id"]?.toIntOrNull()            // 2. handler reads input
            ?: return@get call.respond(HttpStatusCode.BadRequest)
        val article = articleRepository.find(id)                 // 3. database
            ?: return@get call.respond(HttpStatusCode.NotFound)
        call.respond(article)                                    // 4. 200 + JSON body
    }
}`,
        remember: 'Request → routing → handler → database → response. Never trust what the client sends.',
        deeper: [
          {
            title: 'Where the server runs',
            body: `<p>A Ktor server is an ordinary JVM program. During development it runs on your laptop at <code>localhost:8080</code>. The Android emulator reaches your laptop at <code>10.0.2.2</code>, not <code>localhost</code>, because inside the emulator <code>localhost</code> is the emulator itself.</p>
<p>In production it runs on a machine you rent: a virtual server, a container platform, or a managed app host. The deploy lesson covers that. The code is the same in both places; only configuration changes.</p>`,
            code: `// Android, debug build only: talk to the server on your laptop
const val BASE_URL = "http://10.0.2.2:8080"

// Release build: the real host, always HTTPS
const val BASE_URL_RELEASE = "https://api.ornek.com"`,
          },
          {
            title: 'One server, many clients, all at once',
            body: `<p>Your app has one user at a time. A server has thousands. Ktor runs each request in a coroutine, so while one request waits for the database, the same thread serves others (see <a href="#coroutines.basics">Coroutines</a>).</p>
<p>That means shared mutable state in the server is shared between <em>users</em>. A <code>var</code> counter in a handler is a bug waiting for traffic. Keep state in the database, or guard it like any concurrent code.</p>`,
            code: `// Wrong: every user changes the same variable, without synchronization
var likes = 0
post("/like") { likes++; call.respond(likes) }

// Right: the database owns shared state and handles concurrent writes
post("/like/{id}") {
    val id = call.parameters["id"]!!.toInt()
    call.respond(likeRepository.increment(id))
}`,
          },
          {
            title: 'Stateless handlers scale',
            body: `<p>HTTP is stateless: each request carries everything the server needs, such as the token and the parameters. If your handlers keep nothing in memory between requests, you can run two or ten copies of the server behind a load balancer and any copy can answer any request.</p>`,
          },
        ],
        mistakes: [
          {
            title: 'Trusting the client to enforce rules',
            bad: `// The app hides the delete button for other people's comments,
// so the server just deletes whatever id it gets.
delete("/comments/{id}") {
    commentRepository.delete(call.parameters["id"]!!.toInt())
    call.respond(HttpStatusCode.NoContent)
}`,
            good: `delete("/comments/{id}") {
    val userId = call.principal<JWTPrincipal>()!!.subject!!
    val id = call.parameters["id"]!!.toInt()
    if (!commentRepository.isOwner(id, userId)) {
        return@delete call.respond(HttpStatusCode.Forbidden)
    }
    commentRepository.delete(id)
    call.respond(HttpStatusCode.NoContent)
}`,
            why: 'Anyone can call your API with curl, skipping the app. Hiding a button is UX. The check on the server is the real rule.',
          },
        ],
        terms: [
          { term: 'Backend', def: 'The server-side program that receives requests from your apps, applies the rules and owns the shared data.' },
          { term: 'Handler', def: 'The function that runs for one matched route and produces the response.' },
          { term: 'Routing', def: 'Choosing which handler runs, from the request’s method and path.' },
          { term: 'Stateless', def: 'Each request carries everything needed to answer it. The server keeps no per-client memory between requests.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Answer 404 when the repository finds nothing.', code: 'get("/api/haberler/{id}") {\n    val id = call.parameters["id"]!!.toInt()\n    val article = repo.find(id)\n        ?: return@get call.respond(HttpStatusCode.[[NotFound]])\n    call.[[respond]](article)\n}', why: '<code>HttpStatusCode.NotFound</code> is 404. <code>call.respond(article)</code> sends 200 with the object serialized as the body.' },
          { type: 'bug', prompt: 'This server counts page views for all users. Under load the number comes out too low. Tap the line that causes it.', code: 'var views = 0\n\nfun Application.module() {\n    routing {\n        get("/view") {\n            views++\n            call.respond(views)\n        }\n    }\n}', bug: 5, fix: '            call.respond(viewRepository.increment())  // atomic UPDATE in the database', why: 'Requests run concurrently. <code>views++</code> is a read and a write, so two requests can read the same value and one increment is lost. Let the database do the increment atomically.' },
        ],
        quiz: [
          { q: 'The app sends <code>GET /api/yok</code> and no route matches. Which stages run?', options: ['Routing, then the response (404). No handler, no database.', 'All five stages, with an empty database result', 'None: the request is dropped silently'], a: 0, why: 'Routing finds no match, so no handler code runs and Ktor answers 404 directly.' },
          { q: 'Which of these belongs on the server, not in the app?', options: ['The colour of the like button', 'Checking that a user may delete a comment', 'Showing a loading spinner'], a: 1, why: 'Permission checks must happen where the user cannot change the code. The app can hide a button, but only the server can refuse the request.' },
          { q: 'Your server runs on your laptop at port 8080. What URL does the Android emulator use?', options: ['http://localhost:8080', 'http://10.0.2.2:8080', 'http://127.0.0.1:8080'], a: 1, why: 'Inside the emulator, localhost and 127.0.0.1 point at the emulator itself. 10.0.2.2 is the emulator’s alias for the host machine.' },
        ],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'http',
        title: 'HTTP in depth',
        tagline: 'Methods say what you want, status codes say what happened, headers carry everything else.',
        level: 'beginner',
        body: `
<p>An HTTP request is text: a <em>method</em>, a path, headers, and an optional body. A response is a <em>status code</em>, headers, and an optional body. Your server's whole job is turning one into the other.</p>
<p>Methods carry meaning. <code>GET</code> reads and must not change anything (it is <em>safe</em>). <code>PUT</code> and <code>DELETE</code> change things but are <em>idempotent</em>: sending the same request twice leaves the server in the same state as sending it once. <code>POST</code> is neither, so two identical POSTs can create two rows.</p>
<p>Idempotency matters on phones. A request can time out after the server already handled it, and the app retries. Retrying a PUT is harmless. Retrying a POST can post the comment twice.</p>
<p>The <code>Accept</code> header says which format the client wants; <code>Content-Type</code> says what format the body is in. Choosing between formats is <em>content negotiation</em>.</p>`,
        visual: httpDemo,
        code: `// The same rules, in a Ktor server
routing {
    route("/api/bookmarks") {
        post {                                         // creates: not idempotent
            val b = call.receive<NewBookmark>()
            val saved = repo.insert(b)
            call.response.header(HttpHeaders.Location, "/api/bookmarks/" + saved.id)
            call.respond(HttpStatusCode.Created, saved)
        }
        put("/{id}") {                                 // create or replace: idempotent
            val id = call.parameters["id"]!!.toInt()
            val created = repo.upsert(id, call.receive<NewBookmark>())
            call.respond(if (created) HttpStatusCode.Created else HttpStatusCode.OK)
        }
        delete("/{id}") {                              // idempotent: gone stays gone
            val removed = repo.delete(call.parameters["id"]!!.toInt())
            call.respond(if (removed) HttpStatusCode.NoContent else HttpStatusCode.NotFound)
        }
    }
}`,
        remember: 'GET is safe. PUT and DELETE are idempotent. POST is neither, so retries need care.',
        deeper: [
          {
            title: 'Status code families',
            body: `<p>The first digit tells the client what to do. <b>2xx</b>: it worked. <b>3xx</b>: look elsewhere. <b>4xx</b>: the client got something wrong, so retrying the same request will not help. <b>5xx</b>: the server failed, so a retry later might work.</p>
<p>A few you will use every day: <code>200 OK</code>, <code>201 Created</code>, <code>204 No Content</code>, <code>400 Bad Request</code>, <code>401 Unauthorized</code> (really means unauthenticated: who are you?), <code>403 Forbidden</code> (I know who you are, and no), <code>404 Not Found</code>, <code>409 Conflict</code>, <code>429 Too Many Requests</code>, <code>500 Internal Server Error</code>.</p>`,
            code: `// Client side: the first digit decides whether to retry
fun shouldRetry(status: Int) = status >= 500 || status == 429`,
          },
          {
            title: 'Headers you will meet',
            body: `<p><code>Authorization: Bearer &lt;token&gt;</code> carries the access token. <code>Content-Type</code> and <code>Accept</code> carry formats. <code>Location</code> on a 201 names the new resource. <code>Cache-Control</code> tells the app and any proxy how long a response stays fresh. <code>Accept-Language: tr-TR</code> lets the server pick Turkish text for error messages.</p>`,
            code: `GET /api/haberler HTTP/1.1
Host: api.ornek.com
Accept: application/json
Accept-Language: tr-TR
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`,
          },
          {
            title: 'Making a POST safe to retry',
            body: `<p>When a POST must not run twice (a payment, a comment), let the app generate a unique key per action and send it in a header. The server stores keys it has seen and returns the saved result for a repeat instead of doing the work again. The header name is your choice; <code>Idempotency-Key</code> is a common convention.</p>`,
            code: `post("/api/yorumlar") {
    val key = call.request.headers["Idempotency-Key"]
        ?: return@post call.respond(HttpStatusCode.BadRequest)
    val earlier = idempotencyStore.find(key)
    if (earlier != null) return@post call.respond(HttpStatusCode.Created, earlier)
    val saved = comments.insert(call.receive<NewComment>())
    idempotencyStore.save(key, saved)
    call.respond(HttpStatusCode.Created, saved)
}`,
          },
        ],
        mistakes: [
          {
            title: 'Changing data in a GET',
            bad: `// "Easy to call from a link"
get("/api/articles/{id}/delete") {
    repo.delete(call.parameters["id"]!!.toInt())
    call.respond(HttpStatusCode.OK)
}`,
            good: `delete("/api/articles/{id}") {
    repo.delete(call.parameters["id"]!!.toInt())
    call.respond(HttpStatusCode.NoContent)
}`,
            why: 'Clients, caches and link previews assume GET is safe and may send it at any time, including prefetching it. Use the method that matches the effect.',
          },
          {
            title: 'Returning 200 with an error inside',
            bad: `call.respond(HttpStatusCode.OK, mapOf("success" to false, "error" to "not found"))`,
            good: `call.respond(HttpStatusCode.NotFound, ApiError("not_found", "No article with id 7."))`,
            why: 'Every HTTP client, log tool and retry rule reads the status code first. A 200 that means failure hides errors from all of them.',
          },
        ],
        terms: [
          { term: 'Safe method', def: 'A method that only reads: GET, HEAD, OPTIONS. Calling it must not change server state.' },
          { term: 'Idempotent', def: 'Sending the request several times has the same effect on the server as sending it once. GET, PUT and DELETE are; POST and PATCH are not guaranteed to be.' },
          { term: 'Content negotiation', def: 'Picking the response format from the client’s Accept header and the formats the server supports.' },
          { term: 'Status code', def: 'The three-digit number at the start of a response. The first digit gives its family: 2xx success, 4xx client error, 5xx server error.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A successful create answers 201 and names the new resource.', code: 'call.response.header(HttpHeaders.[[Location]], "/api/bookmarks/" + saved.id)\ncall.respond(HttpStatusCode.[[Created]], saved)', why: '<code>201 Created</code> plus a <code>Location</code> header tells the client where the new resource lives.' },
          { type: 'bug', prompt: 'The app retries this call when the network times out, and users see their comment twice. Which line is the problem?', code: 'suspend fun postComment(text: String) {\n    retry(times = 3) {\n        client.post("/api/yorumlar") {\n            setBody(NewComment(text))\n        }\n    }\n}', bug: 2, fix: '        client.post("/api/yorumlar") { header("Idempotency-Key", key); setBody(NewComment(text)) }', why: 'POST is not idempotent. A timed-out request may already have been saved. Send a key created once per action, outside the retry, so the server can spot the repeat.' },
        ],
        quiz: [
          { q: 'The app sends <code>DELETE /api/bookmarks/42</code> twice. The first returns 204, the second 404. Is DELETE still idempotent here?', options: ['No, the responses differ', 'Yes: the server state after both is the same as after one', 'Only if the server returns 204 both times'], a: 1, why: 'Idempotency is about the effect on the server, not the response. After one or two deletes, bookmark 42 is gone either way.' },
          { q: 'A token is missing from the request. Which status fits?', options: ['401 Unauthorized', '403 Forbidden', '400 Bad Request'], a: 0, why: '401 means the server does not know who you are. 403 is for a known user who lacks permission.' },
          { q: 'A request times out on a train. Which method can the app safely retry without extra work?', options: ['POST /comments', 'PUT /profile/name', 'Both'], a: 1, why: 'PUT replaces the value, so repeating it sets the same name again. A repeated POST may create a second comment.' },
          { q: 'The client sends <code>Accept: application/xml</code> to a JSON-only API. What may the server answer?', options: ['406 Not Acceptable', '415 Unsupported Media Type, because of the Accept header', '500 Internal Server Error'], a: 0, why: '406 says the server cannot produce any format the client accepts. 415 is about the format of the request body (Content-Type).' },
          { q: 'Which response tells the app that retrying later might work?', options: ['404 Not Found', '400 Bad Request', '503 Service Unavailable'], a: 2, why: '5xx means the server failed, not the request. A 4xx will fail the same way until the client changes the request.' },
        ],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'ktor',
        title: 'Your first Ktor server',
        tagline: 'An engine, a module function, plugins, and a routing tree of handlers.',
        level: 'beginner',
        body: `
<p>Ktor is JetBrains' Kotlin framework for servers (and clients). A Ktor server has three parts. An <em>engine</em> such as Netty listens on a port. A <em>module</em>, a function <code>Application.module()</code>, installs <em>plugins</em> and declares routes. And <em>routes</em> form a tree: each <code>route("/api")</code> adds a path segment, and <code>get</code>, <code>post</code> and friends attach handlers to a node.</p>
<p>Inside a handler, <code>call</code> is the current exchange. <code>call.parameters</code> holds path parameters like <code>{id}</code>, <code>call.receive&lt;T&gt;()</code> reads and decodes the body, and <code>call.respond(...)</code> sends the answer. Handlers are <code>suspend</code> lambdas, so you can call suspending code directly.</p>
<p>Plugins add behaviour around every request. <em>ContentNegotiation</em> with kotlinx.serialization turns <code>@Serializable</code> classes into JSON and back. <em>StatusPages</em> turns exceptions into proper error responses.</p>`,
        visual: routingDemo,
        code: `// build.gradle.kts: plugins id("io.ktor.plugin") and kotlin("plugin.serialization")
// deps: ktor-server-netty, ktor-server-content-negotiation,
//       ktor-serialization-kotlinx-json, ktor-server-status-pages

@Serializable
data class Article(val id: Int, val title: String)

@Serializable
data class ApiError(val code: String, val message: String = "")

fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module).start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) { json() }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.application.log.error("Unhandled", cause)
            call.respond(HttpStatusCode.InternalServerError, ApiError("internal"))
        }
    }
    routing {
        get("/health") { call.respondText("OK") }
        route("/api/articles") {
            get { call.respond(repo.all()) }
            get("/{id}") {
                val id = call.parameters["id"]?.toIntOrNull()
                    ?: return@get call.respond(HttpStatusCode.BadRequest, ApiError("bad_id", "id must be a number"))
                call.respond(repo.find(id) ?: throw ArticleNotFound(id))
            }
        }
    }
}`,
        remember: 'Module installs plugins and routes. Handlers read from call and answer with call.respond.',
        deeper: [
          {
            title: 'StatusPages: one place for errors',
            body: `<p>Instead of a try/catch in every handler, throw a domain exception and map it once. Your handlers stay about the happy path, and every endpoint returns the same error shape.</p>
<p>Add a catch-all <code>exception&lt;Throwable&gt;</code> as well. It logs the real cause on the server and sends a bland 500, so stack traces never reach clients.</p>`,
            visual: pluginDemo,
            code: `class ArticleNotFound(val id: Int) : RuntimeException("Article $id not found")

install(StatusPages) {
    exception<ArticleNotFound> { call, _ ->
        call.respond(HttpStatusCode.NotFound, ApiError("article_not_found"))
    }
    exception<Throwable> { call, cause ->
        call.application.log.error("Unhandled", cause)
        call.respond(HttpStatusCode.InternalServerError, ApiError("internal"))
    }
}`,
          },
          {
            title: 'EngineMain and a config file',
            body: `<p><code>embeddedServer</code> puts settings in code, which is quick to start. <code>EngineMain</code> reads them from <code>application.conf</code> (HOCON) or <code>application.yaml</code> instead, which makes it easy to change the port or switch modules per environment without rebuilding.</p>`,
            code: `// Application.kt
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() { /* plugins and routes */ }

// src/main/resources/application.yaml
// ktor:
//   deployment:
//     port: 8080
//   application:
//     modules:
//       - com.ornek.ApplicationKt.module`,
          },
          {
            title: 'Split routes into files',
            body: `<p>Routes are just extension functions on <code>Route</code>. Give each feature its own function and file, then call them from <code>routing { }</code>. Pass dependencies in as parameters so tests can swap them.</p>`,
            code: `fun Route.articleRoutes(repo: ArticleRepository) {
    route("/api/articles") {
        get { call.respond(repo.all()) }
        post { call.respond(HttpStatusCode.Created, repo.insert(call.receive())) }
    }
}

fun Application.module(repo: ArticleRepository = PostgresArticleRepository()) {
    install(ContentNegotiation) { json() }
    routing { articleRoutes(repo) }
}`,
          },
        ],
        underHood: {
          body: `<p>Ktor processes each call through a <em>pipeline</em> of phases. Plugins hook into phases: ContentNegotiation hooks into turning bodies into objects and back, StatusPages wraps the call so it can catch exceptions thrown further in, and authentication runs before your handler. Routing itself is resolved by walking the route tree segment by segment and picking the best matching node.</p>
<p>Each call runs in a coroutine on the engine's threads. Blocking calls (plain JDBC, file IO) inside a handler hold one of those threads, which is why database code goes to <code>Dispatchers.IO</code>.</p>`,
        },
        mistakes: [
          {
            title: 'Forgetting ContentNegotiation',
            bad: `fun Application.module() {
    routing {
        get("/api/articles") { call.respond(repo.all()) }  // fails at runtime
    }
}`,
            good: `fun Application.module() {
    install(ContentNegotiation) { json() }
    routing {
        get("/api/articles") { call.respond(repo.all()) }
    }
}`,
            why: 'Without a converter Ktor does not know how to turn a List&lt;Article&gt; into bytes. Install ContentNegotiation with json() and mark the classes @Serializable.',
          },
        ],
        terms: [
          { term: 'Ktor', def: 'JetBrains’ Kotlin framework for building HTTP servers and clients, built on coroutines.' },
          { term: 'Engine', def: 'The part that listens on a port and speaks HTTP, such as Netty or CIO.' },
          { term: 'Plugin (Ktor)', def: 'A reusable piece installed with install(...) that adds behaviour to every call, like ContentNegotiation or StatusPages.' },
          { term: 'call', def: 'The current request and response pair inside a handler.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the JSON body as a <code>NewArticle</code> and answer 201.', code: 'post("/api/articles") {\n    val input = call.[[receive]]<NewArticle>()\n    val saved = repo.insert(input)\n    call.respond(HttpStatusCode.[[Created]], saved)\n}', why: '<code>call.receive&lt;T&gt;()</code> decodes the body with the installed converter. 201 Created is the status for a new resource.' },
          { type: 'bug', prompt: '<code>GET /api/articles/abc</code> crashes with a 500 instead of a 400. Tap the line.', code: 'get("/api/articles/{id}") {\n    val id = call.parameters["id"]!!.toInt()\n    val article = repo.find(id)\n        ?: return@get call.respond(HttpStatusCode.NotFound)\n    call.respond(article)\n}', bug: 1, fix: '    val id = call.parameters["id"]?.toIntOrNull() ?: return@get call.respond(HttpStatusCode.BadRequest)', why: '<code>"abc".toInt()</code> throws NumberFormatException, which becomes a 500. Parse with <code>toIntOrNull()</code> and answer 400 for bad input.' },
        ],
        quiz: [
          { q: 'Routes: <code>route("/api") { route("/articles") { get("/{id}") { } } }</code>. Which path reaches the handler?', options: ['/articles/7', '/api/articles/7', '/api/{id}'], a: 1, why: 'Each nested route adds one path segment, so the full path is /api/articles/{id}.' },
          { q: 'Which plugin turns <code>call.respond(article)</code> into a JSON body?', options: ['StatusPages', 'ContentNegotiation with json()', 'Routing'], a: 1, why: 'ContentNegotiation picks a converter from the Accept header; json() registers kotlinx.serialization.' },
          { q: 'A handler throws <code>ArticleNotFound</code>. What turns it into a 404?', options: ['Ktor does it by name', 'A StatusPages exception&lt;ArticleNotFound&gt; handler', 'The client'], a: 1, why: 'StatusPages catches exceptions from handlers and lets you map each type to a status and body.' },
          { q: 'Put these in the order Ktor uses them for one request.', options: ['Engine receives → plugins and routing → handler → response', 'Handler → routing → engine → response', 'Routing → engine → plugins → handler'], a: 0, why: 'The engine accepts the connection, the pipeline runs plugins and resolves the route, your handler runs, and the response goes back out through the same pipeline.' },
        ],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'rest',
        title: 'Designing a REST API',
        tagline: 'Nouns for paths, methods for verbs, one error shape, and pages the app can load one by one.',
        level: 'intermediate',
        body: `
<p>A REST API is organised around <em>resources</em>: things with an id, named by nouns. <code>/v1/articles</code> is the collection, <code>/v1/articles/7</code> is one item, <code>/v1/articles/7/comments</code> is a sub-collection. The method says what to do with it, so you never need <code>/getArticles</code> or <code>/deleteComment</code>.</p>
<p>Decide three things once and use them everywhere. <em>Validation</em>: check every field on the server and answer 400 when input is wrong. <em>Errors</em>: one JSON shape for all failures, with a stable machine-readable <code>code</code> and a human message. <em>Pagination</em>: never return an unbounded list; return a page plus a way to ask for the next one.</p>
<p>Put a version in the path (<code>/v1</code>). Installed apps stay on old versions for months, and you cannot force an update. A version prefix lets you ship <code>/v2</code> while <code>/v1</code> keeps working.</p>`,
        visual: restDemo,
        code: `@Serializable
data class ApiError(val code: String, val message: String = "", val fields: Map<String, String> = emptyMap())

@Serializable
data class Page<T>(val items: List<T>, val nextCursor: String?)

fun Route.articleRoutes(repo: ArticleRepository) = route("/v1/articles") {
    get {
        val limit = (call.request.queryParameters["limit"]?.toIntOrNull() ?: 20).coerceIn(1, 50)
        val cursor = call.request.queryParameters["cursor"]?.toIntOrNull()
        val items = repo.olderThan(cursor, limit + 1)          // fetch one extra to know if more exist
        val page = items.take(limit)
        call.respond(Page(page, if (items.size > limit) page.last().id.toString() else null))
    }
    post {
        val input = call.receive<NewArticle>()                 // RequestValidation checks it first
        val saved = repo.insert(input)
        call.response.header(HttpHeaders.Location, "/v1/articles/" + saved.id)
        call.respond(HttpStatusCode.Created, saved)
    }
}`,
        remember: 'Nouns in paths, a version prefix, one error shape, and every list paginated.',
        deeper: [
          {
            title: 'Validate with RequestValidation',
            body: `<p>Ktor's RequestValidation plugin runs your checks when a handler calls <code>call.receive&lt;T&gt;()</code>. A failure throws <code>RequestValidationException</code>, and StatusPages turns it into your 400 error shape. Handlers then only ever see valid input.</p>`,
            code: `install(RequestValidation) {
    validate<NewArticle> { a ->
        when {
            a.title.isBlank() -> ValidationResult.Invalid("title must not be blank")
            a.title.length > 200 -> ValidationResult.Invalid("title is too long")
            else -> ValidationResult.Valid
        }
    }
}
install(StatusPages) {
    exception<RequestValidationException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, ApiError("validation_failed", cause.reasons.joinToString()))
    }
}`,
          },
          {
            title: 'Cursor beats offset for feeds',
            body: `<p>Offset paging (<code>?page=3</code>) skips N rows. If a new article is published while the user scrolls, every row shifts by one and the app shows a duplicate. A cursor says “items older than id 42”, so new rows at the top do not move the window. It is also faster: the database seeks to the cursor using an index instead of counting past skipped rows.</p>
<p>On the Android side, a cursor maps straight onto Paging 3's next key (see <a href="#data.paging">Paging</a>).</p>`,
            code: `-- offset: the database still walks past 40 rows
SELECT * FROM articles ORDER BY id DESC LIMIT 20 OFFSET 40;

-- cursor: jumps to id < 42 using the primary key index
SELECT * FROM articles WHERE id < 42 ORDER BY id DESC LIMIT 21;`,
          },
          {
            title: 'Evolving without breaking old apps',
            body: `<p>Adding a field to a response is safe if clients ignore unknown keys (configure <code>Json { ignoreUnknownKeys = true }</code> in the app). Removing or renaming a field, changing its type, or making an optional request field required breaks the versions already installed. Do those in <code>/v2</code>, keep <code>/v1</code> alive, and watch your logs for when old traffic stops.</p>`,
            code: `// Android client: tolerate new fields the server adds later
val json = Json { ignoreUnknownKeys = true }`,
          },
        ],
        mistakes: [
          {
            title: 'Verbs in paths',
            bad: `post("/getArticles") { … }
post("/deleteArticle") { … }
post("/updateArticleTitle") { … }`,
            good: `get("/v1/articles") { … }
delete("/v1/articles/{id}") { … }
patch("/v1/articles/{id}") { … }`,
            why: 'With verbs in paths everything is POST, so nothing is cacheable, safe or retryable by its method. Resources plus methods give clients and tools those rules for free.',
          },
          {
            title: 'Returning the whole table',
            bad: `get("/v1/articles") { call.respond(repo.all()) }`,
            good: `get("/v1/articles") {
    val limit = (call.request.queryParameters["limit"]?.toIntOrNull() ?: 20).coerceIn(1, 50)
    call.respond(repo.page(call.request.queryParameters["cursor"], limit))
}`,
            why: 'The list is small at launch and huge a year later. Unbounded responses get slower, use more memory on both sides and time out on mobile networks. Cap the limit on the server too.',
          },
        ],
        terms: [
          { term: 'Resource', def: 'A thing the API exposes, named by a noun path such as /v1/articles/7.' },
          { term: 'Cursor pagination', def: 'Paging by a marker of the last item seen (“after id 42”) instead of a row offset.' },
          { term: 'API versioning', def: 'Keeping old contracts alive under one prefix (/v1) while new ones ship under another (/v2).' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Cap the page size between 1 and 50, defaulting to 20.', code: 'val limit = (call.request.[[queryParameters]]["limit"]?.toIntOrNull() ?: 20)\n    .[[coerceIn]](1, 50)', why: 'Query parameters live in <code>call.request.queryParameters</code>. <code>coerceIn</code> stops a client from asking for a million rows.' },
          { type: 'bug', prompt: 'Each page has one item fewer than expected and the last item never shows. Tap the line.', code: 'val items = repo.olderThan(cursor, limit + 1)\nval page = items.take(limit - 1)\nval next = if (items.size > limit) page.last().id.toString() else null\ncall.respond(Page(page, next))', bug: 1, fix: 'val page = items.take(limit)', why: 'Fetch <code>limit + 1</code> only to learn whether more exist; return exactly <code>limit</code> items and use the last returned id as the cursor.' },
        ],
        quiz: [
          { q: 'Which path fits REST style for “comments on article 7”?', options: ['GET /getCommentsForArticle?id=7', 'GET /v1/articles/7/comments', 'POST /v1/comments/list'], a: 1, why: 'A sub-collection under the parent resource, read with GET.' },
          { q: 'Users scroll a feed while new articles arrive at the top. Offset paging shows duplicates. Why does a cursor fix it?', options: ['Cursors are cached', 'The cursor marks “older than id 42”, so new rows at the top do not shift the next page', 'Cursors return fewer items'], a: 1, why: 'An offset counts rows from the top, which moves when rows are added. A cursor is anchored to an item.' },
          { q: 'You need to rename <code>title</code> to <code>headline</code> in responses. Old app versions are still installed. What do you do?', options: ['Rename it in /v1 and force-update', 'Add headline to /v2, keep /v1 returning title', 'Return both and remove title next week'], a: 1, why: 'Installed apps keep calling /v1 for a long time. Breaking changes go into a new version.' },
          { q: 'Why give every error a stable <code>code</code> like <code>validation_failed</code> as well as a message?', options: ['Messages are translated and may change; the code is what client logic can switch on', 'Codes are shorter', 'HTTP requires it'], a: 0, why: 'The app maps codes to behaviour and its own Turkish text. Messages are for people and logs.' },
        ],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'sql',
        title: 'SQL with PostgreSQL',
        tagline: 'Tables, the four statements you use daily, joins, indexes, and calling it all from Kotlin.',
        level: 'intermediate',
        body: `
<p>A relational database stores rows in <em>tables</em> with fixed columns. Every row has a <em>primary key</em>, and a <em>foreign key</em> column such as <code>articles.user_id</code> points at a row in another table. PostgreSQL is a solid, free default for app backends.</p>
<p>You will write four statements most days: <code>SELECT</code> reads, <code>INSERT</code> adds, <code>UPDATE</code> changes, and <code>DELETE</code> removes. A <code>JOIN</code> combines rows from two tables on a matching column, such as each article with its author.</p>
<p>Without an <em>index</em> the database answers <code>WHERE user_id = 2</code> by reading every row. An index is a sorted lookup structure, so it can jump straight to the matches. It costs a little on every write, so index the columns you filter and join on, not all of them. If you know Room (see <a href="#data.room">Room</a>), this is the same SQL, just on a server shared by every user.</p>`,
        visual: sqlDemo,
        code: `// Exposed 1.x DSL (packages org.jetbrains.exposed.v1.*), JDBC driver org.postgresql:postgresql
object Users : Table("users") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 100)
    override val primaryKey = PrimaryKey(id)
}

object Articles : Table("articles") {
    val id = integer("id").autoIncrement()
    val userId = integer("user_id").references(Users.id).index()
    val title = varchar("title", 200)
    val views = integer("views").default(0)
    override val primaryKey = PrimaryKey(id)
}

class ArticleRepository(private val db: Database) {
    suspend fun byAuthor(userId: Int): List<String> = withContext(Dispatchers.IO) {
        transaction(db) {
            Articles.selectAll()
                .where { Articles.userId eq userId }
                .map { it[Articles.title] }
        }
    }

    suspend fun insert(userId: Int, title: String): Int = withContext(Dispatchers.IO) {
        transaction(db) {
            Articles.insert {
                it[Articles.userId] = userId
                it[Articles.title] = title
            } get Articles.id
        }
    }
}`,
        remember: 'Filter and join on indexed columns. JDBC blocks, so run it on Dispatchers.IO.',
        deeper: [
          {
            title: 'The same queries in plain SQL',
            body: `<p>Exposed writes SQL for you, but you should be able to read what it sends. Turn on <code>addLogger(StdOutSqlLogger)</code> inside a transaction during development to print every statement.</p>`,
            code: `CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
CREATE TABLE articles (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title   VARCHAR(200) NOT NULL,
  views   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX articles_user_id_idx ON articles (user_id);

SELECT u.name, a.title
FROM articles a JOIN users u ON a.user_id = u.id
WHERE u.name = 'Ayşe';`,
          },
          {
            title: 'Parameters, never string building',
            body: `<p>Building SQL by gluing strings lets a user's input become SQL: <em>SQL injection</em>. Exposed and JDBC's <code>PreparedStatement</code> send values separately from the statement, so input is always data.</p>`,
            code: `// Dangerous: name = "x' OR '1'='1" returns every row
val sql = "SELECT * FROM users WHERE name = '" + name + "'"

// Safe: the value travels as a parameter
connection.prepareStatement("SELECT * FROM users WHERE name = ?").use { st ->
    st.setString(1, name)
    st.executeQuery().use { rs -> /* read rows */ }
}`,
          },
          {
            title: 'Transactions keep changes together',
            body: `<p>A transaction makes several statements succeed or fail as one. If the second insert throws, the first is rolled back too. In Exposed, everything inside one <code>transaction { }</code> block is one transaction.</p>`,
            code: `transaction(db) {
    val id = Articles.insert { it[userId] = 1; it[title] = "Derbi 2-2" } get Articles.id
    Tags.insert { it[articleId] = id; it[name] = "spor" }
    // an exception here rolls back both inserts
}`,
          },
        ],
        underHood: {
          body: `<p>A PostgreSQL index is by default a B-tree: a balanced, sorted tree where finding a value takes a few page reads even in millions of rows. The query planner decides per query whether using it is cheaper than reading the table. <code>EXPLAIN</code> in front of a query shows what it chose, such as <code>Seq Scan</code> (read everything) or <code>Index Scan</code>.</p>
<p>Opening a database connection is slow, so servers keep a <em>connection pool</em> (HikariCP is the common choice on the JVM) and hand a connection to each transaction.</p>`,
          code: `EXPLAIN SELECT title FROM articles WHERE user_id = 2;
-- Index Scan using articles_user_id_idx on articles ...`,
        },
        mistakes: [
          {
            title: 'UPDATE without WHERE',
            bad: `UPDATE articles SET views = 0;`,
            good: `UPDATE articles SET views = 0 WHERE id = 4;`,
            why: 'Without WHERE the statement changes every row. Write the WHERE first, and try risky statements inside a transaction you can roll back.',
          },
          {
            title: 'Blocking JDBC on the request thread',
            bad: `get("/v1/articles") {
    call.respond(transaction { Articles.selectAll().map(::toArticle) })
}`,
            good: `get("/v1/articles") {
    val list = withContext(Dispatchers.IO) { transaction { Articles.selectAll().map(::toArticle) } }
    call.respond(list)
}`,
            why: 'JDBC calls block their thread. Moving them to Dispatchers.IO keeps the engine’s few threads free for other requests (see <a href="#coroutines.dispatchers">Dispatchers</a>).',
          },
        ],
        terms: [
          { term: 'Primary key', def: 'The column (or columns) that uniquely identifies each row.' },
          { term: 'Foreign key', def: 'A column whose value must match a primary key in another table, such as articles.user_id → users.id.' },
          { term: 'Index', def: 'A sorted lookup structure on columns that lets the database find rows without reading the whole table, at a small cost on writes.' },
          { term: 'JOIN', def: 'Combines rows from two tables where a condition matches, such as a.user_id = u.id.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read every title by author 2 with Exposed.', code: 'Articles.[[selectAll]]()\n    .[[where]] { Articles.userId eq 2 }\n    .map { it[Articles.title] }', why: '<code>selectAll()</code> starts the query and <code>where { }</code> adds the condition. Exposed sends the 2 as a parameter.' },
          { type: 'bug', prompt: 'A search box lets a user type <code>\' OR \'1\'=\'1</code> and see every user. Tap the line.', code: 'fun findByName(name: String): List<User> =\n    connection.createStatement().use { st ->\n        st.executeQuery("SELECT * FROM users WHERE name = \'" + name + "\'")\n            .use { rs -> rs.toUsers() }\n    }', bug: 2, fix: '        // prepareStatement("SELECT * FROM users WHERE name = ?").apply { setString(1, name) }.executeQuery()', why: 'Concatenating input into SQL is SQL injection. Use a prepared statement with ? and pass the value separately, or let Exposed do it.' },
        ],
        quiz: [
          { q: 'The articles table has 2 million rows and no index on user_id. What does <code>WHERE user_id = 2</code> do?', options: ['Reads only the matching rows', 'Reads every row to find the matches', 'Fails without an index'], a: 1, why: 'Without an index the only option is a sequential scan. An index on user_id lets it jump to the matches.' },
          { q: 'You add an index to every column “to be safe”. What gets worse?', options: ['Nothing', 'Every INSERT and UPDATE, because each index must be updated too', 'SELECT queries'], a: 1, why: 'Indexes speed up reads on the columns you search, but every write has to maintain every index. Add the ones your queries use.' },
          { q: 'Which query lists each article with its author name?', options: ['SELECT * FROM articles, users;', 'SELECT a.title, u.name FROM articles a JOIN users u ON a.user_id = u.id;', 'SELECT title, name FROM articles WHERE users;'], a: 1, why: 'The JOIN condition pairs each article with exactly its author. The first option pairs every article with every user.' },
          { q: 'Why wrap Exposed’s blocking <code>transaction { }</code> in <code>withContext(Dispatchers.IO)</code> inside a handler?', options: ['Exposed requires it to compile', 'JDBC blocks the thread; IO keeps the engine threads free for other requests', 'It makes the query faster'], a: 1, why: 'The query takes as long either way. The point is not to park one of the server’s request threads while it waits.' },
        ],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'auth',
        title: 'Authentication on the server',
        tagline: 'Hash passwords, hand out short access tokens and long refresh tokens, and verify Google sign-in on the server.',
        level: 'advanced',
        body: `
<p>Authentication answers “who is calling?”. Two common shapes exist. With <em>sessions</em> the server stores a session row and the client holds only a random id, usually in a cookie; revoking is just deleting the row. With <em>JWTs</em> the server signs a token that carries the user id and an expiry; any server instance can check the signature without a database lookup, but a signed token stays valid until it expires.</p>
<p>Mobile apps usually combine both ideas: a short-lived JWT <em>access token</em> (minutes) sent on every call, and a long-lived random <em>refresh token</em> stored in the database. When the access token expires, the app trades the refresh token for a new pair. Signing out or a stolen phone deletes the refresh row, and the damage window is only as long as the access token's lifetime.</p>
<p>Never store passwords. Store a slow, salted hash: Argon2id first, bcrypt where Argon2 is not available. For “Sign in with Google”, the app sends Google's ID token and the server verifies it before creating its own tokens. The Android side of this is in <a href="#data.auth">Auth</a>.</p>`,
        visual: jwtDemo,
        code: `// deps: ktor-server-auth, ktor-server-auth-jwt
fun Application.configureAuth(cfg: JwtConfig) {
    install(Authentication) {
        jwt("access") {
            realm = cfg.realm
            verifier(
                JWT.require(Algorithm.HMAC256(cfg.secret))
                    .withIssuer(cfg.issuer)
                    .withAudience(cfg.audience)
                    .build()
            )
            validate { cred -> if (cred.payload.subject != null) JWTPrincipal(cred.payload) else null }
            challenge { _, _ -> call.respond(HttpStatusCode.Unauthorized, ApiError("token_invalid", "Sign in again.")) }
        }
    }
}

fun issueAccessToken(cfg: JwtConfig, userId: String): String =
    JWT.create()
        .withIssuer(cfg.issuer)
        .withAudience(cfg.audience)
        .withSubject(userId)
        .withExpiresAt(Date(System.currentTimeMillis() + 15 * 60_000))   // 15 minutes
        .sign(Algorithm.HMAC256(cfg.secret))

routing {
    authenticate("access") {
        get("/me") {
            val userId = call.principal<JWTPrincipal>()!!.payload.subject
            call.respond(users.profile(userId))
        }
    }
}`,
        remember: 'Short access token, rotating refresh token in the database, slow password hash, and verify every third-party token on the server.',
        deeper: [
          {
            title: 'Refresh tokens: random, hashed, rotated',
            body: `<p>A refresh token does not need to be a JWT. Make it a long random string, store only its hash, and give each a family id. On every refresh, mark the old one used and issue a new one. If a used token ever shows up again, someone copied it: revoke the whole family so both the thief and the user must sign in again.</p>`,
            code: `post("/auth/refresh") {
    val presented = call.receive<RefreshRequest>().refreshToken
    val row = refreshTokens.findByHash(sha256(presented))
        ?: return@post call.respond(HttpStatusCode.Unauthorized)
    if (row.used) {                                   // reuse means theft
        refreshTokens.revokeFamily(row.familyId)
        return@post call.respond(HttpStatusCode.Unauthorized)
    }
    refreshTokens.markUsed(row.id)
    val next = randomToken()
    refreshTokens.insert(sha256(next), row.userId, row.familyId)
    call.respond(TokenPair(issueAccessToken(cfg, row.userId), next))
}`,
          },
          {
            title: 'Password hashing',
            body: `<p>A hash for passwords must be slow and salted, so a leaked table cannot be cracked quickly. OWASP recommends Argon2id (at least 19 MiB of memory, 2 iterations, parallelism 1) and bcrypt with a work factor of at least 10 for legacy systems. bcrypt only reads the first 72 bytes of input, so cap password length. Use a well-known library; never write the algorithm yourself, and never use a fast hash like SHA-256 for passwords.</p>`,
            code: `interface PasswordHasher {
    fun hash(password: CharArray): String           // includes salt and parameters
    fun verify(password: CharArray, stored: String): Boolean
}

post("/auth/login") {
    val req = call.receive<LoginRequest>()
    val user = users.byEmail(req.email)
    if (user == null || !hasher.verify(req.password.toCharArray(), user.passwordHash)) {
        return@post call.respond(HttpStatusCode.Unauthorized, ApiError("bad_credentials", "E-posta veya şifre hatalı."))
    }
    call.respond(newTokenPair(user.id))
}`,
          },
          {
            title: 'Sign in with Google: verify on the server',
            body: `<p>On Android, Credential Manager gives you a Google ID token (<code>GoogleIdTokenCredential.idToken</code>). Send it to your server. The server checks the signature against Google's public keys and checks the claims: <code>aud</code> must be your client ID, <code>iss</code> must be <code>accounts.google.com</code> or <code>https://accounts.google.com</code>, and <code>exp</code> must be in the future. Google's <code>GoogleIdTokenVerifier</code> does these checks. Key your account on the <code>sub</code> claim, not the email.</p>`,
            code: `private val verifier = GoogleIdTokenVerifier.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance())
    .setAudience(listOf(cfg.googleWebClientId))
    .build()

post("/auth/google") {
    val idToken = call.receive<GoogleSignIn>().idToken
    val token = withContext(Dispatchers.IO) { verifier.verify(idToken) }
        ?: return@post call.respond(HttpStatusCode.Unauthorized)
    val user = users.findOrCreateByGoogleSub(token.payload.subject, token.payload.email)
    call.respond(newTokenPair(user.id))
}`,
          },
          {
            title: 'Where the Android app keeps tokens',
            body: `<p>Keep tokens out of logs, crash reports and plain SharedPreferences. Store them encrypted with a key from the Android Keystore (see <a href="#security.at-rest">Data at rest</a>), keep the access token in memory while the app runs, and let the HTTP client's auth layer attach it and refresh it on 401. On sign-out, call the server's logout endpoint and then delete both tokens locally.</p>`,
          },
        ],
        mistakes: [
          {
            title: 'Long-lived access tokens',
            bad: `.withExpiresAt(Date(System.currentTimeMillis() + 30L * 24 * 60 * 60_000))  // 30 days`,
            good: `.withExpiresAt(Date(System.currentTimeMillis() + 15 * 60_000))  // 15 minutes, plus a refresh token`,
            why: 'A JWT cannot be recalled before it expires. A stolen 30-day token works for 30 days. Keep access tokens short and put revocation on the refresh token.',
          },
          {
            title: 'Trusting the email inside an unverified Google token',
            bad: `val email = decodeJwtWithoutVerifying(idToken).getClaim("email").asString()
users.signIn(email)`,
            good: `val token = verifier.verify(idToken) ?: return@post call.respond(HttpStatusCode.Unauthorized)
users.findOrCreateByGoogleSub(token.payload.subject, token.payload.email)`,
            why: 'Anyone can write a token with any email in it. Only a verified signature, audience and issuer prove Google issued it for your app.',
          },
        ],
        terms: [
          { term: 'Access token', def: 'A short-lived credential sent on every API call, often a signed JWT.' },
          { term: 'Refresh token', def: 'A long-lived secret the app trades for a new access token. Stored hashed on the server so it can be revoked.' },
          { term: 'JWT', def: 'JSON Web Token: a base64url header, a payload of claims and a signature. Anyone can read it; only the key holder can create a valid one.' },
          { term: 'Argon2id', def: 'A slow, memory-hard password hashing algorithm. OWASP’s first choice for storing passwords.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Protect <code>/me</code> with the <code>access</code> JWT provider and read the user id.', code: '[[authenticate]]("access") {\n    get("/me") {\n        val userId = call.[[principal]]<JWTPrincipal>()!!.payload.subject\n        call.respond(users.profile(userId))\n    }\n}', why: 'Routes inside <code>authenticate("access")</code> run only with a valid token. <code>call.principal&lt;JWTPrincipal&gt;()</code> returns what <code>validate</code> produced.' },
          { type: 'bug', prompt: 'A leaked database lets attackers recover most passwords within hours. Tap the line.', code: 'post("/auth/register") {\n    val req = call.receive<RegisterRequest>()\n    val hash = sha256(req.password)\n    users.insert(req.email, hash)\n    call.respond(HttpStatusCode.Created)\n}', bug: 2, fix: '    val hash = hasher.hash(req.password.toCharArray())  // Argon2id, salted', why: 'SHA-256 is fast and unsalted here, so attackers try billions of guesses per second and identical passwords share a hash. Use Argon2id (or bcrypt) through a vetted library.' },
        ],
        quiz: [
          { q: 'The access token lasts 15 minutes. The user signs out at minute 2 and the server deletes the refresh token. A copy of the access token leaked earlier. How long can it be used?', options: ['Not at all', 'Until it expires at minute 15', 'For 30 days'], a: 1, why: 'A JWT is checked by signature, not by a database lookup, so it works until exp. That is why access tokens are kept short.' },
          { q: 'A refresh token that was already used is presented again. What should the server do?', options: ['Issue a new pair, it is probably a retry', 'Revoke every token in that family and answer 401', 'Ignore it'], a: 1, why: 'With rotation, a reused token means two parties hold it. Revoking the family stops the attacker; the real user signs in again.' },
          { q: 'Which order fits Google sign-in from an Android app?', options: ['App gets ID token → sends to server → server verifies aud, iss, exp, signature → server issues its own tokens', 'App reads email from the ID token → sends email to server → server signs in by email', 'Server asks Google for the user’s password'], a: 0, why: 'The server must verify the token itself and then give the app your own access and refresh tokens.' },
          { q: 'You need instant “sign out everywhere” and run on one server with a database. Which trade-off fits best?', options: ['Server sessions: revocation is deleting rows', 'Long JWTs with no refresh token', 'Store the password on the phone'], a: 0, why: 'Sessions are checked on every request, so deleting them takes effect at once. JWTs trade that for lookup-free checks.' },
          { q: 'Which is a reason to cap password length with bcrypt?', options: ['bcrypt reads at most 72 bytes of input', 'Long passwords are insecure', 'The database column is small'], a: 0, why: 'Bytes after the 72nd are ignored by most bcrypt implementations, so a cap avoids surprising behaviour.' },
        ],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'testing',
        title: 'Testing the server',
        tagline: 'testApplication runs your whole module in memory, and a fresh database per test keeps results honest.',
        level: 'intermediate',
        body: `
<p>Ktor's <code>testApplication { }</code> starts your module without a real network: requests from its <code>client</code> go straight into the pipeline. You test what the Android app will see, routes, plugins, status codes and JSON, in milliseconds.</p>
<p>Test behaviour at the HTTP edge: “POST with a blank title returns 400”, “GET /me without a token returns 401”. Those tests survive refactoring, because they do not care which class does the work.</p>
<p>The database is the tricky part. Tests must not share rows, or one test's leftovers change another's result and the suite passes or fails depending on order. Give each test a clean database: an in-memory fake repository for fast route tests (see <a href="#testing.fakes">Fakes</a>), and a real, throwaway PostgreSQL for the repository tests.</p>`,
        visual: testDemo,
        code: `// deps: testImplementation("io.ktor:ktor-server-test-host"), kotlin("test")
class ArticleRoutesTest {
    @Test
    fun blankTitleIsRejected() = testApplication {
        application { module(repo = FakeArticleRepository()) }
        val client = createClient { install(ContentNegotiation) { json() } }

        val res = client.post("/v1/articles") {
            contentType(ContentType.Application.Json)
            setBody(NewArticle(title = ""))
        }

        assertEquals(HttpStatusCode.BadRequest, res.status)
        assertEquals("validation_failed", res.body<ApiError>().code)
    }

    @Test
    fun meNeedsAToken() = testApplication {
        application { module(repo = FakeArticleRepository()) }
        assertEquals(HttpStatusCode.Unauthorized, client.get("/me").status)
    }
}`,
        remember: 'Test at the HTTP edge with testApplication. Every test gets its own clean data.',
        deeper: [
          {
            title: 'Test configuration',
            body: `<p>Modules that read config (a JWT secret, a database URL) need values in tests too. Pass them with <code>environment { config = MapApplicationConfig(...) }</code> so tests never depend on your machine's environment variables.</p>`,
            code: `@Test
fun tokenFromLoginWorksOnMe() = testApplication {
    environment {
        config = MapApplicationConfig(
            "jwt.secret" to "test-secret",
            "jwt.issuer" to "test",
            "jwt.audience" to "test",
            "jwt.realm" to "test",
        )
    }
    application { module(repo = FakeArticleRepository()) }
    val client = createClient { install(ContentNegotiation) { json() } }
    val tokens = client.post("/auth/login") {
        contentType(ContentType.Application.Json)
        setBody(LoginRequest("ayse@ornek.com", "dogru-sifre"))
    }.body<TokenPair>()
    val me = client.get("/me") { bearerAuth(tokens.accessToken) }
    assertEquals(HttpStatusCode.OK, me.status)
}`,
          },
          {
            title: 'A real PostgreSQL for repository tests',
            body: `<p>An in-memory database such as H2 is fast but speaks a slightly different SQL dialect, so a query can pass in tests and fail in production. For repository code, run the real thing in a container. Testcontainers starts a PostgreSQL in Docker for the test run; you create the schema once and empty the tables before each test.</p>`,
            code: `// testImplementation("org.testcontainers:testcontainers-postgresql:<version>")
val db = Database.connect(
    url = "jdbc:tc:postgresql:18:///test",   // Testcontainers starts postgres:18 for this URL
    driver = "org.testcontainers.jdbc.ContainerDatabaseDriver",
)

@BeforeTest
fun clean() = transaction(db) {
    SchemaUtils.create(Users, Articles)
    Articles.deleteAll(); Users.deleteAll()
}`,
          },
        ],
        mistakes: [
          {
            title: 'One shared database for the whole suite',
            bad: `object TestDb { val repo = PostgresArticleRepository(sharedDb) }  // never cleaned

@Test fun listIsEmpty() = testApplication {
    application { module(TestDb.repo) }
    assertEquals("[]", client.get("/v1/articles").bodyAsText())  // depends on other tests
}`,
            good: `@Test fun listIsEmpty() = testApplication {
    application { module(FakeArticleRepository()) }   // fresh per test
    assertEquals("[]", client.get("/v1/articles").bodyAsText())
}`,
            why: 'Test order is not guaranteed. Leftover rows from another test make this one pass on your laptop and fail in CI. That is a flaky test.',
          },
        ],
        terms: [
          { term: 'testApplication', def: 'Ktor’s test entry point. It runs your modules in memory and gives you a client wired straight into them.' },
          { term: 'Flaky test', def: 'A test that passes or fails without code changes, often because of shared state, timing or test order.' },
          { term: 'Testcontainers', def: 'A library that starts real services such as PostgreSQL in Docker for the length of a test run.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start the module in a test and check the health endpoint.', code: '@Test\nfun health() = [[testApplication]] {\n    application { module() }\n    val res = client.get("/health")\n    assertEquals(HttpStatusCode.[[OK]], res.status)\n}', why: '<code>testApplication</code> runs the module in memory; <code>client</code> sends requests into it.' },
          { type: 'bug', prompt: 'This test throws before any request leaves the client: it cannot turn <code>NewArticle</code> into a request body. Tap the line that is missing something.', code: 'val client = createClient { install(ContentNegotiation) { json() } }\nval res = client.post("/v1/articles") {\n    setBody(NewArticle(title = "Derbi 2-2"))\n}\nassertEquals(HttpStatusCode.Created, res.status)', bug: 2, fix: '    contentType(ContentType.Application.Json); setBody(NewArticle(title = "Derbi 2-2"))', why: 'The client\'s ContentNegotiation picks a converter from the request\'s Content-Type. With none set, it skips the body and the client fails to send a plain object. Set <code>contentType(ContentType.Application.Json)</code> before <code>setBody</code>.' },
        ],
        quiz: [
          { q: 'Test 4 passes alone but fails when the whole suite runs. What is the most likely cause?', options: ['Ktor is slower in suites', 'Another test leaves rows in a shared database', 'The JIT compiler'], a: 1, why: 'Order-dependent results almost always mean shared state. Give each test clean data.' },
          { q: 'What does testApplication avoid compared with starting a real server?', options: ['Routing', 'Opening a real network port', 'Running plugins'], a: 1, why: 'The full pipeline runs, plugins and routes included, but requests go through memory instead of a socket.' },
          { q: 'Your queries use a PostgreSQL-only feature. Where should repository tests run?', options: ['H2 in-memory', 'A real PostgreSQL, for example via Testcontainers', 'Production'], a: 1, why: 'Only the same database engine proves the SQL works. H2 is fine for plain queries but differs in dialect.' },
        ],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'deploy',
        title: 'Deploying',
        tagline: 'Config from the environment, a fat JAR or image from the build, a host that checks health before it switches traffic.',
        level: 'intermediate',
        body: `
<p>Deploying means getting the same build running somewhere the app can reach it. Keep one artifact and change only configuration per environment. Ktor reads <code>application.conf</code> or <code>application.yaml</code>, and those can pull values from environment variables, so the port, the database URL and the JWT secret come from the host, never from the source code.</p>
<p>The Ktor Gradle plugin packages the server two ways. <code>buildFatJar</code> makes one JAR with every dependency inside (<code>build/libs/*-all.jar</code>), runnable with <code>java -jar</code>. <code>buildImage</code> makes a Docker image. Most managed hosts accept a container image and run it for you, with HTTPS, restarts and logs included.</p>
<p>A good host starts the new version, calls a health endpoint, and only then moves traffic. If the new version cannot start, users keep the old one. Try both failure switches below.</p>`,
        visual: deployDemo,
        code: `// build.gradle.kts
plugins {
    kotlin("jvm") version "<kotlin version>"
    id("io.ktor.plugin") version "3.6.0"
}
application { mainClass.set("com.ornek.ApplicationKt") }
// ./gradlew buildFatJar  ->  build/libs/<project>-all.jar

// src/main/resources/application.conf
// ktor {
//   deployment { port = 8080, port = \${?PORT} }
//   application { modules = [ com.ornek.ApplicationKt.module ] }
// }
// jwt { secret = \${JWT_SECRET} }        // no default: missing secret = no start
// db  { url = \${DATABASE_URL} }

fun Application.module() {
    val secret = environment.config.property("jwt.secret").getString()
    val dbUrl = environment.config.property("db.url").getString()
    // ...
    routing { get("/health") { call.respondText("OK") } }
}`,
        remember: 'One build, config from the environment, secrets never in git, health check before traffic.',
        deeper: [
          {
            title: 'A Dockerfile in three stages',
            body: `<p>Ktor's docs show a multi-stage Dockerfile: one stage caches Gradle dependencies, one builds the fat JAR, and a small runtime stage holds only a JRE and the JAR. The final image does not carry Gradle or your source.</p>`,
            code: `# Stage 1: cache Gradle dependencies
FROM gradle:latest AS cache
RUN mkdir -p /home/gradle/cache_home
ENV GRADLE_USER_HOME=/home/gradle/cache_home
COPY build.gradle.* gradle.properties /home/gradle/app/
COPY gradle /home/gradle/app/gradle
WORKDIR /home/gradle/app
RUN gradle dependencies --no-daemon

# Stage 2: build the fat JAR
FROM gradle:latest AS build
COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle buildFatJar --no-daemon

# Stage 3: small runtime image
FROM amazoncorretto:22 AS runtime
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*-all.jar /app/server.jar
ENTRYPOINT ["java", "-jar", "/app/server.jar"]`,
          },
          {
            title: 'Secrets live on the host',
            body: `<p>Anything in git is readable by everyone with repo access, forever, including old commits. Set secrets in the host's secret or environment settings, and in CI as encrypted variables. Use different secrets for staging and production, so a leaked staging key cannot sign production tokens. Leave the secret without a default value in the config file: a server that refuses to start is better than one running with <code>"changeme"</code>.</p>`,
          },
          {
            title: 'Logs you can search',
            body: `<p>On the JVM, Ktor logs through SLF4J; the usual backend is Logback, configured in <code>src/main/resources/logback.xml</code>. Log one line per request with the method, path, status and duration (the CallLogging plugin does this), plus your own errors with their stack traces. Never log tokens, passwords or full request bodies with personal data.</p>`,
            code: `// deps: ch.qos.logback:logback-classic, io.ktor:ktor-server-call-logging
install(CallLogging)

post("/auth/login") {
    val req = call.receive<LoginRequest>()
    call.application.log.info("login attempt for user hash {}", sha256(req.email).take(8))   // not the password, not the email
    // ...
}`,
          },
        ],
        mistakes: [
          {
            title: 'A secret in the source',
            bad: `val secret = "s3cr3t-jwt-key"   // committed to git`,
            good: `val secret = environment.config.property("jwt.secret").getString()
// application.conf: jwt { secret = \${JWT_SECRET} }`,
            why: 'Anyone who ever sees the repo can sign tokens as any user. Rotating it means a new deploy. Read it from the environment instead.',
          },
          {
            title: 'Binding to localhost in a container',
            bad: `embeddedServer(Netty, port = 8080, host = "127.0.0.1", module = Application::module)`,
            good: `embeddedServer(Netty, port = System.getenv("PORT")?.toInt() ?: 8080, host = "0.0.0.0", module = Application::module)`,
            why: 'Inside a container, 127.0.0.1 is only reachable from inside that container. Listen on 0.0.0.0 and take the port the host gives you.',
          },
        ],
        terms: [
          { term: 'Fat JAR', def: 'A single JAR that contains your code and all its dependencies, runnable with java -jar.' },
          { term: 'Container image', def: 'A packaged file system plus start command that a host can run the same way everywhere.' },
          { term: 'Health check', def: 'An endpoint the host calls to decide whether an instance is ready for traffic.' },
          { term: 'Environment variable', def: 'A named value set by the host for a process. The standard way to pass config and secrets to a server.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the port from the PORT variable, falling back to 8080 (HOCON).', code: 'ktor {\n    deployment {\n        port = [[8080]]\n        port = ${[[?PORT]]}\n    }\n}', why: 'HOCON sets the default first, then <code>${?PORT}</code> overrides it only when the variable exists.' },
          { type: 'bug', prompt: 'The new version starts on the host but every request times out. Tap the line.', code: 'fun main() {\n    val port = System.getenv("PORT")?.toInt() ?: 8080\n    embeddedServer(Netty, port = port, host = "127.0.0.1", module = Application::module)\n        .start(wait = true)\n}', bug: 2, fix: '    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)', why: 'Inside a container, 127.0.0.1 accepts connections only from the container itself. 0.0.0.0 listens on every interface.' },
        ],
        quiz: [
          { q: 'JWT_SECRET is missing on the host and the config has no default. What happens with a host that health-checks?', options: ['v2 starts with an empty secret', 'v2 fails to start, never passes the health check, and v1 keeps serving', 'Both versions go down'], a: 1, why: 'The config cannot resolve <code>${JWT_SECRET}</code>, so the server fails at startup. The host never routes traffic to an instance that is not healthy.' },
          { q: 'Which Gradle task from the Ktor plugin makes a single runnable JAR?', options: ['buildFatJar', 'assembleRelease', 'shadowRun'], a: 0, why: 'buildFatJar writes build/libs/*-all.jar with every dependency inside.' },
          { q: 'Put the deploy in order.', options: ['tests → build artifact → image → deploy → health check → traffic', 'deploy → tests → health check → build', 'build → traffic → tests → health check'], a: 0, why: 'Nothing reaches users before tests pass and the new instance reports healthy.' },
          { q: 'Where should the production database password live?', options: ['application.conf in git', 'The host’s secret settings, read through an environment variable', 'A comment in the Dockerfile'], a: 1, why: 'Secrets stay out of the repository and the image, and can be rotated without a code change.' },
        ],
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'client',
        title: 'Connecting the Android app',
        tagline: 'Share the models, call your own server, and turn every failure into a message the user understands.',
        level: 'advanced',
        body: `
<p>You own both ends now, so share what they agree on. Put the request and response classes (<code>@Serializable</code> DTOs and <code>ApiError</code>) in a Kotlin Multiplatform <code>shared</code> module that both the server and the app depend on. Rename a field once and both sides see the change at compile time. See <a href="#kmp.shares">What to share</a>.</p>
<p>On Android, call the server with the Ktor client or Retrofit, as in <a href="#data.net">Networking</a>. Ktor client fits naturally when the models are already in a KMP module, and it can live in shared code if an iOS app comes later.</p>
<p>Errors need a plan from end to end. The server sends a status and an <code>ApiError</code>. The HTTP layer turns that into an exception. The repository turns exceptions into a small sealed <code>AppError</code>. The screen turns <code>AppError</code> into a sentence in the user's language. Each layer speaks its own words, and the UI never sees a status code.</p>`,
        visual: e2eDemo,
        code: `// shared/src/commonMain: used by server AND app
@Serializable data class ArticleDto(val id: Int, val title: String)
@Serializable data class ApiError(val code: String, val message: String = "", val fields: Map<String, String> = emptyMap())

// app: one client for the whole app
val http = HttpClient(OkHttp) {
    expectSuccess = true                              // non-2xx throws
    install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
    install(HttpTimeout) { requestTimeoutMillis = 15_000 }
    defaultRequest { url("https://api.ornek.com/v1/") }
}

sealed interface AppError {
    data object Offline : AppError
    data object NotFound : AppError
    data object SignedOut : AppError
    data class Invalid(val fields: Map<String, String>) : AppError
    data object Server : AppError
}
class AppException(val error: AppError) : Exception()

class ArticleRepository(private val http: HttpClient) {
    suspend fun article(id: Int): Result<ArticleDto> = try {
        Result.success(http.get("articles/$id").body())
    } catch (e: ClientRequestException) {              // 4xx
        val err = runCatching { e.response.body<ApiError>() }.getOrNull()
        Result.failure(AppException(when (e.response.status) {
            HttpStatusCode.NotFound -> AppError.NotFound
            HttpStatusCode.Unauthorized -> AppError.SignedOut
            else -> AppError.Invalid(err?.fields.orEmpty())
        }))
    } catch (e: ServerResponseException) {             // 5xx
        Result.failure(AppException(AppError.Server))
    } catch (e: HttpRequestTimeoutException) {
        Result.failure(AppException(AppError.Offline))
    } catch (e: IOException) {                         // no network, DNS, connection reset
        Result.failure(AppException(AppError.Offline))
    }
}`,
        remember: 'Shared DTOs, one HTTP client, and errors translated at every layer: status → exception → AppError → user text.',
        deeper: [
          {
            title: 'A shared module in the build',
            body: `<p>Ktor's full-stack tutorial uses three Gradle modules: a <code>server</code>, a common module with the models in <code>commonMain</code>, and the app. Both <code>server</code> and the app add a project dependency on the common module, and the serialization plugin goes on the common module. One caveat: the Ktor Gradle plugin's fat JAR and Docker tasks are disabled in a module that also applies the Kotlin Multiplatform plugin, so keep <code>server</code> a plain JVM module that depends on the shared one.</p>`,
            code: `// settings.gradle.kts
include(":shared", ":server", ":app")

// server/build.gradle.kts  (kotlin("jvm") + id("io.ktor.plugin"))
dependencies { implementation(project(":shared")) }

// app/build.gradle.kts
dependencies { implementation(project(":shared")) }`,
          },
          {
            title: 'Refresh tokens with the Auth plugin',
            body: `<p>The Ktor client's Auth plugin attaches the bearer token to every request. When the server answers 401, it calls your <code>refreshTokens</code> block once, then retries the original request with the new token. Mark the refresh call itself with <code>markAsRefreshTokenRequest()</code> so a 401 from it does not loop.</p>`,
            code: `install(Auth) {
    bearer {
        loadTokens { tokenStore.read()?.let { BearerTokens(it.access, it.refresh) } }
        refreshTokens {
            val pair: TokenPair = client.post("auth/refresh") {
                markAsRefreshTokenRequest()
                contentType(ContentType.Application.Json)
                setBody(RefreshRequest(oldTokens?.refreshToken.orEmpty()))
            }.body()
            tokenStore.save(pair)
            BearerTokens(pair.accessToken, pair.refreshToken)
        }
    }
}`,
          },
          {
            title: 'From AppError to the screen',
            body: `<p>The ViewModel maps <code>AppError</code> to UI state, and the screen picks the string resource. Turkish text lives in <code>values-tr/strings.xml</code>, so the server's English <code>message</code> is only a fallback for logs. Offline errors are a good moment to show cached data (see <a href="#data.caching">Caching</a>).</p>`,
            code: `@StringRes
fun AppError.messageRes(): Int = when (this) {
    AppError.Offline -> R.string.error_offline          // "İnternet bağlantısı yok."
    AppError.NotFound -> R.string.error_article_removed // "Bu haber kaldırılmış."
    AppError.SignedOut -> R.string.error_signed_out
    is AppError.Invalid -> R.string.error_check_fields
    AppError.Server -> R.string.error_try_again         // "Bir sorun oluştu, tekrar dene."
}`,
          },
        ],
        mistakes: [
          {
            title: 'Catching everything, including cancellation',
            bad: `suspend fun article(id: Int) = try {
    Result.success(http.get("articles/$id").body<ArticleDto>())
} catch (e: Exception) {
    Result.failure(e)        // also swallows CancellationException
}`,
            good: `suspend fun article(id: Int) = try {
    Result.success(http.get("articles/$id").body<ArticleDto>())
} catch (e: CancellationException) {
    throw e                  // let structured concurrency work
} catch (e: Exception) {
    Result.failure(e.toAppException())
}`,
            why: 'When the user leaves the screen, the coroutine is cancelled with CancellationException. Swallowing it keeps dead work running. See <a href="#coroutines.cancellation">Cancellation</a>.',
          },
          {
            title: 'Two copies of the same model',
            bad: `// server/.../Article.kt
@Serializable data class Article(val id: Int, val title: String)
// app/.../ArticleDto.kt
@Serializable data class ArticleDto(val id: Int, val headline: String)   // drifted`,
            good: `// shared/src/commonMain/.../ArticleDto.kt, used by both
@Serializable data class ArticleDto(val id: Int, val title: String)`,
            why: 'Hand-copied models drift, and the mismatch only shows up at runtime as a parse error on users’ phones.',
          },
        ],
        terms: [
          { term: 'DTO', def: 'Data transfer object: a plain class that describes exactly what goes over the wire.' },
          { term: 'Shared module', def: 'A Kotlin Multiplatform module whose commonMain code is compiled into both the server and the app.' },
          { term: 'expectSuccess', def: 'Ktor client setting that makes non-2xx responses throw: ClientRequestException for 4xx, ServerResponseException for 5xx.' },
          { term: 'Error mapping', def: 'Translating a failure into the vocabulary of each layer, from HTTP status to domain error to user-facing text.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the client throw on 4xx and 5xx, and tolerate new JSON fields.', code: 'val http = HttpClient(OkHttp) {\n    [[expectSuccess]] = true\n    install(ContentNegotiation) { json(Json { [[ignoreUnknownKeys]] = true }) }\n}', why: 'With <code>expectSuccess</code> the client throws typed exceptions you can map. <code>ignoreUnknownKeys</code> keeps old app versions working when the server adds fields.' },
          { type: 'bug', prompt: 'Users with no network see “Bir sorun oluştu” instead of “İnternet bağlantısı yok”. Tap the line.', code: 'suspend fun load(id: Int): AppError? = try {\n    http.get("articles/$id"); null\n} catch (e: ClientRequestException) {\n    AppError.NotFound\n} catch (e: Exception) {\n    AppError.Server\n}', bug: 4, fix: '} catch (e: IOException) { AppError.Offline } catch (e: ServerResponseException) {', why: 'A missing network throws an IOException, not an HTTP error. The catch-all maps it to Server. Catch IOException first and map it to Offline.' },
        ],
        quiz: [
          { q: 'The server answers 400 with <code>{"code":"validation_failed","fields":{"text":"must not be blank"}}</code>. What should the screen show?', options: ['“HTTP 400”', 'A Turkish message under the text field, from AppError.Invalid(fields)', 'Nothing, and retry'], a: 1, why: 'The field map tells the UI where the problem is. The user sees their language, not a status code.' },
          { q: 'Where should <code>ArticleDto</code> live if you own both the server and the app?', options: ['Copied into each project', 'In a shared KMP module both depend on', 'Only on the server'], a: 1, why: 'One definition means a rename or type change breaks the build instead of breaking users’ apps at runtime.' },
          { q: 'With <code>expectSuccess = true</code>, the server returns 503. Which exception does the Ktor client throw?', options: ['ClientRequestException', 'ServerResponseException', 'IOException'], a: 1, why: 'ServerResponseException covers 5xx. ClientRequestException is 4xx; IOException is a network failure with no response at all.' },
          { q: 'The access token expired. With the Auth plugin’s bearer provider, what happens on the next call?', options: ['The call fails and the user signs in again', 'The server answers 401, the plugin calls refreshTokens, then retries the call once with the new token', 'The plugin refreshes before every call'], a: 1, why: 'The bearer provider reacts to 401: it refreshes and replays the request. Only if refresh fails do you send the user to sign-in.' },
          { q: 'Which line is the bug? <code>catch (e: Exception) { Result.failure(e) }</code> in a suspend function called from viewModelScope.', options: ['It hides CancellationException, so cancelled work looks like a failure', 'Result cannot hold exceptions', 'Nothing is wrong'], a: 0, why: 'Cancellation is a normal signal in coroutines. Rethrow CancellationException before a broad catch.' },
        ],
      },
    ],
  });
})();
