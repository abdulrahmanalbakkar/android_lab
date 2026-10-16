/* Capstone: ship the news reader with breaking-news push.
   Builds on the 'capapp' project (offline-first reader: Compose, Room as the source of truth, Hilt,
   NewsRepository, NewsViewModel, ArticleList/ArticleDetail routes). Each step adds one piece of the push path and the release.
   Shared demo pieces live at the top: the delivery path diagram, the phone mock, the log. CSS prefix: cs-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const act = (label, onclick) => h('button', { class: 'cmd', type: 'button', onclick }, label);
  const tag = (text, cls) => h('span', { class: 'cs-tag' + (cls ? ' ' + cls : '') }, text);
  const box = (title, ...kids) => h('div', { class: 'cs-box' }, h('div', { class: 'cs-box-h' }, title), ...kids);
  const row = (...kids) => h('div', { class: 'cs-row' }, ...kids);
  const mono = text => h('code', { class: 'cs-code' }, text);
  let uid = 0;
  function toggle(label, on, onchange) {
    const id = `cs-sw-${++uid}`;
    const input = h('input', { type: 'checkbox', id, onchange() { onchange(this.checked); } });
    input.checked = on;
    return h('label', { class: 'switch', for: id }, input, label);
  }
  function seg(label, options, value, onpick) {
    const btns = options.map(([v, text]) => h('button', { class: 'cmd cs-segb', type: 'button', 'aria-pressed': String(v === value), onclick() {
      btns.forEach(b => b.setAttribute('aria-pressed', String(b === this)));
      onpick(v);
    } }, text));
    return h('div', { class: 'cs-seg', role: 'group', 'aria-label': label }, h('span', { class: 'cs-seg-l' }, label), btns);
  }

  // Stops an animation when the demo leaves the page, and runs one action at a time.
  const STOP = {};
  function runner(el) {
    let busy = false;
    const wait = async ms => { await sleep(ms); if (!el.isConnected) throw STOP; };
    const once = fn => async () => {
      if (busy) return;
      busy = true;
      try { await fn(); } catch (e) { if (e !== STOP) throw e; } finally { busy = false; }
    };
    return { wait, once };
  }

  function logger(first) {
    const el = h('div', { class: 'cs-log', 'aria-live': 'polite' });
    const add = (html, cls) => {
      el.append(h('div', { class: cls || null, html }));
      while (el.children.length > 4) el.firstElementChild.remove();
      replay(el.lastElementChild, 'pop-soft');
    };
    if (first) add(first, 'dim');
    return { el, add };
  }

  // ---------- the delivery path: your server -> FCM -> device -> app ----------
  const NODES = [['server', 'Your server'], ['fcm', 'FCM'], ['device', 'Device'], ['app', 'News app']];
  // [node, key, label, step that adds it]. Step 0 parts come from the news reader project.
  const PARTS = [
    ['server', 'api', 'News API', 0],
    ['server', 'tokens', 'Token table', 2],
    ['server', 'send', 'HTTP v1 send', 3],
    ['server', 'creds', 'Service account', 6],
    ['fcm', 'topics', 'Topics', 2],
    ['fcm', 'proj', 'dev + prod', 7],
    ['device', 'chan', 'Channels', 1],
    ['device', 'perm', 'Permission', 1],
    ['device', 'play', 'Play rollout', 8],
    ['app', 'room', 'Room + UI', 0],
    ['app', 'svc', 'Messaging service', 2],
    ['app', 'notify', 'Notifier', 3],
    ['app', 'link', 'Deep link', 4],
    ['app', 'worker', 'Sync worker', 5],
    ['app', 'netcfg', 'Net config', 6],
    ['app', 'flavor', 'Flavors', 7],
  ];
  function pathView(step, wait) {
    const nodes = {}, parts = {}, edges = [];
    const keys = NODES.map(n => n[0]);
    const rowEl = h('div', { class: 'cs-path-row' });
    NODES.forEach(([k, label], i) => {
      if (i) { const e = h('div', { class: 'cs-edge', 'aria-hidden': 'true' }); edges.push(e); rowEl.append(e); }
      const mine = PARTS.filter(p => p[0] === k && p[3] <= step);
      const built = mine.filter(p => p[3] < step).length;
      const node = h('div', { class: 'cs-node' }, h('div', { class: 'cs-node-h' }, label),
        mine.map(p => (parts[p[1]] = h('span', { class: 'cs-part ' + (p[3] === step ? 'new' : 'built') }, p[2]))),
        built ? h('span', { class: 'cs-more' }, `+${built} built`) : null);
      nodes[k] = node; rowEl.append(node);
    });
    const ret = step >= 2 ? h('div', { class: 'cs-ret' + (step === 2 ? ' new' : '') },
      h('span', { class: 'cs-ret-l' }, 'token: app → your server'), h('span', { class: 'cs-ret-bar', 'aria-hidden': 'true' })) : null;
    const el = h('div', { class: 'cs-path', role: 'group', 'aria-label': `Delivery path, step ${step}: your server, FCM, device, app. Highlighted parts are new in this step.` },
      h('div', { class: 'cs-path-cap' }, h('span', {}, 'Delivery path'), h('span', { class: 'cs-key' }, h('i', { class: 'cs-key-new' }), 'new in this step')), rowEl, ret);
    const clear = () => {
      Object.values(nodes).forEach(n => n.classList.remove('hot', 'skip', 'fail'));
      edges.forEach(e => e.classList.remove('go', 'back', 'bad'));
      if (ret) ret.classList.remove('go');
    };
    const fire = (e, cls) => { e.classList.remove('go', 'back', 'bad'); void e.offsetWidth; e.classList.add(cls); };
    // Lights the hops from one node to another. failAt stops at that node with a red edge.
    async function run(from, to, opt = {}) {
      if (!opt.keep) clear();
      let i = keys.indexOf(from);
      const end = keys.indexOf(to);
      nodes[keys[i]].classList.add('hot');
      while (i < end) {
        fire(edges[i], 'go');
        await wait(opt.fast ? 220 : 360);
        i++;
        if (opt.failAt === keys[i]) { edges[i - 1].classList.add('bad'); nodes[keys[i]].classList.add('fail'); return false; }
        nodes[keys[i]].classList.add('hot');
      }
      return true;
    }
    async function back(from, to) {
      clear();
      let i = keys.indexOf(from);
      const end = keys.indexOf(to);
      nodes[keys[i]].classList.add('hot');
      while (i > end) { fire(edges[i - 1], 'back'); await wait(320); i--; nodes[keys[i]].classList.add('hot'); }
    }
    async function token() {
      if (!ret) return;
      clear();
      nodes.app.classList.add('hot');
      ret.classList.remove('go'); void ret.offsetWidth; ret.classList.add('go');
      await wait(520);
      nodes.server.classList.add('hot');
    }
    const ping = k => { if (parts[k]) replay(parts[k], 'cs-ping'); };
    const mark = (k, cls) => nodes[k].classList.add(cls);
    return { el, run, back, token, clear, ping, mark };
  }

  // ---------- the phone: lock screen, home screen, app ----------
  const DATE = 'Friday 16 October';
  function phoneView() {
    const screen = h('div', { class: 'cs-screen' });
    const el = h('div', { class: 'cs-phone', role: 'group', 'aria-label': 'Phone preview' },
      h('div', { class: 'cs-bar', 'aria-hidden': 'true' }, h('span', {}, '9:41'), h('span', { class: 'cs-sig' }, h('i'), h('i'), h('i'))), screen);
    let notifs = [], mode = '';
    const card = (n, cls) => h('div', { class: 'cs-notif' + (cls ? ' ' + cls : '') + (n.fresh ? ' drop-in' : '') },
      h('div', { class: 'cs-n-top' }, h('span', { class: 'cs-n-icon' }), h('span', {}, 'News · now'), h('span', { class: 'cs-n-ch' }, n.ch || 'Breaking')),
      h('b', {}, n.title), n.text ? h('span', {}, n.text) : null);
    const P = { el };
    P.mode = () => mode;
    P.lock = () => {
      mode = 'lock'; el.classList.add('dark');
      screen.replaceChildren(h('div', { class: 'cs-clock' }, '9:41'), h('div', { class: 'cs-date' }, DATE),
        h('div', { class: 'cs-stack' }, notifs.length ? notifs.map(n => card(n)) : h('p', { class: 'cs-none' }, 'No notifications')));
      notifs.forEach(n => { n.fresh = false; });
    };
    P.home = () => {
      mode = 'home'; el.classList.add('dark');
      screen.replaceChildren(h('div', { class: 'cs-home' }, Array.from({ length: 11 }, () => h('span', { class: 'cs-ic' })), h('span', { class: 'cs-ic news' }, 'N')));
    };
    P.app = (title, kids, opt = {}) => {
      mode = 'app'; el.classList.remove('dark');
      screen.replaceChildren(
        h('div', { class: 'cs-appbar' }, opt.back ? h('span', { class: 'cs-back', 'aria-hidden': 'true' }, '←') : null, h('span', {}, title), opt.badge ? h('span', { class: 'cs-badge' }, opt.badge) : null),
        h('div', { class: 'cs-body' }, kids));
    };
    // Posts a notification. On the lock screen it joins the list; elsewhere a heads-up banner drops in.
    P.post = n => {
      n.fresh = true;
      notifs = [n, ...notifs.filter(x => x.id !== n.id)].slice(0, 3);
      if (mode === 'lock') P.lock();
      else if (n.heads !== false) {
        const c = card(n, 'cs-heads');
        screen.append(c);
        setTimeout(() => c.remove(), 2400);
      }
    };
    P.take = () => { const n = notifs[0]; notifs = notifs.slice(1); return n; };
    P.has = () => notifs.length > 0;
    P.clearAll = () => { notifs = []; };
    P.overlay = node => { const o = h('div', { class: 'cs-over' }, h('div', { class: 'cs-scrim' }), node); screen.append(o); return () => o.remove(); };
    P.toast = text => { const t = h('div', { class: 'cs-toast' }, text); screen.append(t); setTimeout(() => t.remove(), 2000); };
    P.shake = () => replay(el, 'shake');
    return P;
  }

  const FEED = [
    { id: 'a-81690', title: 'Council approves new tram line', cat: 'Local' },
    { id: 'a-81702', title: 'Chip makers report a record quarter', cat: 'Tech' },
    { id: 'a-81711', title: 'Derby ends 2-1 after late goal', cat: 'Sports' },
  ];
  const ALERTS = [
    { id: 'a-81723', title: 'Bridge closed after quake', cat: 'Breaking' },
    { id: 'a-81741', title: 'Central bank cuts rates', cat: 'Breaking' },
    { id: 'a-81760', title: 'Storm warning for the coast', cat: 'Breaking' },
  ];
  const feedItems = (list, fresh) => list.map(s => h('div', { class: 'cs-item' + (s.id === fresh ? ' fresh' : '') }, h('span', {}, s.title), h('small', {}, `${s.cat} · ${s.id}`)));
  const articleBody = (s, note, cls) => [
    h('div', { class: 'cs-art-h' }, s.title),
    h('div', {}, tag(note, cls)),
    h('i', { class: 'cs-line' }), h('i', { class: 'cs-line' }), h('i', { class: 'cs-line' }), h('i', { class: 'cs-line short' }),
  ];
  const alertOf = (s, opt = {}) => ({ id: s.id, title: s.title, text: opt.text || null, ch: opt.ch || 'Breaking', heads: opt.heads });

  function frame(el, path, phone, side, controls, log) {
    el.append(h('div', { class: 'cs-wrap' }, path.el, h('div', { class: 'cs-stage' }, phone.el, h('div', { class: 'cs-side' }, side)), h('div', { class: 'controls' }, controls), log.el));
  }

  const css = `
.cs-wrap { display: grid; gap: 12px; min-width: 0; }
.cs-path { display: grid; gap: 8px; padding: 10px 12px 12px; border-radius: 14px; background: var(--bg); min-width: 0; }
.cs-path-cap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; font: 600 0.68rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.cs-key { display: inline-flex; align-items: center; gap: 5px; text-transform: none; letter-spacing: 0; }
.cs-key-new { width: 10px; height: 10px; border-radius: 3px; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent); }
.cs-path-row { display: grid; grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr) 16px minmax(0, 1fr) 16px minmax(0, 1fr); align-items: stretch; min-width: 0; }
.cs-node { min-width: 0; display: flex; flex-direction: column; gap: 4px; padding: 7px; border-radius: 10px; border: 1.5px solid var(--line); background: var(--surface); transition: border-color 0.25s, box-shadow 0.25s, opacity 0.25s; }
.cs-node-h { font: 700 0.76rem/1.2 var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cs-part { font: 500 0.66rem/1.25 var(--mono); padding: 2px 5px; border-radius: 6px; background: var(--sunk); color: var(--muted); overflow-wrap: anywhere; }
.cs-part.new { background: var(--accent-soft); color: var(--accent); font-weight: 700; box-shadow: inset 0 0 0 1px var(--accent); }
.cs-part.cs-ping { animation: pop 0.45s ease-out; }
.cs-more { display: none; font: 500 0.6rem var(--mono); color: var(--muted); }
.cs-node.hot { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.cs-node.skip { border-style: dashed; opacity: 0.5; }
.cs-node.fail { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-soft); }
.cs-edge { align-self: center; height: 4px; margin: 0 2px; border-radius: 2px; background: var(--line); position: relative; overflow: hidden; }
.cs-edge::after { content: ""; position: absolute; inset: 0; background: var(--accent); transform: scaleX(0); transform-origin: left; }
.cs-edge.go::after { animation: cs-fill 0.34s ease-out forwards; }
.cs-edge.back::after { transform-origin: right; animation: cs-fill 0.3s ease-out forwards; }
.cs-edge.bad::after { background: var(--err); transform: scaleX(1); animation: none; }
@keyframes cs-fill { to { transform: scaleX(1); } }
.cs-ret { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cs-ret-bar { flex: 1 1 40px; min-width: 20px; height: 4px; border-radius: 2px; background: var(--line); position: relative; overflow: hidden; }
.cs-ret-bar::after { content: ""; position: absolute; inset: 0; background: var(--warm); transform: scaleX(0); transform-origin: right; }
.cs-ret.go .cs-ret-bar::after { animation: cs-fill 0.5s ease-out forwards; }
.cs-ret-l { font: 600 0.66rem var(--mono); color: var(--muted); min-width: 0; overflow-wrap: anywhere; }
.cs-ret.new .cs-ret-l { color: var(--warm); }
@media (max-width: 560px) {
  .cs-part.built { display: none; }
  .cs-more { display: block; }
  .cs-path-row { grid-template-columns: minmax(0, 1fr) 8px minmax(0, 1fr) 8px minmax(0, 1fr) 8px minmax(0, 1fr); }
  .cs-node { padding: 5px; }
  .cs-node-h { font-size: 0.66rem; }
  .cs-part { font-size: 0.6rem; padding: 2px 3px; }
}
.cs-stage { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; justify-content: center; padding: 14px; border-radius: 14px; background: var(--bg); min-width: 0; }
.cs-side { flex: 1 1 220px; min-width: 0; display: grid; gap: 10px; align-content: start; }
.cs-box { display: grid; gap: 6px; padding: 9px 11px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); min-width: 0; }
.cs-box-h { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.cs-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font: 500 0.76rem/1.4 var(--mono); color: var(--ink); min-width: 0; overflow-wrap: anywhere; }
.cs-rrow { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; }
.cs-row.gone { text-decoration: line-through; opacity: 0.5; }
.cs-row.fresh { animation: pop-soft 0.4s ease-out; }
.cs-code { font: 600 0.74rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.cs-tag { font: 600 0.66rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); white-space: nowrap; }
.cs-tag.on { background: var(--accent-soft); color: var(--accent); }
.cs-tag.ok { background: var(--ok-soft); color: var(--ok); }
.cs-tag.warn { background: var(--warm-soft); color: var(--warm); }
.cs-tag.bad { background: var(--err-soft); color: var(--err); }
.cs-json { margin: 0; font: 500 0.68rem/1.45 var(--mono); padding: 8px 10px; border-radius: 8px; background: var(--code-bg); color: var(--code-ink); overflow-x: auto; white-space: pre; max-width: 100%; }
.cs-phone { flex: none; width: 200px; height: 370px; border-radius: 30px; border: 7px solid var(--code-bg); background: var(--surface); display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: var(--shadow); transition: background 0.3s; }
.cs-phone.dark { background: var(--code-bg); }
.cs-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 14px 2px; font: 600 0.62rem var(--mono); color: var(--muted); }
.cs-phone.dark .cs-bar { color: var(--code-ink); }
.cs-sig { display: inline-flex; gap: 2px; align-items: flex-end; height: 9px; }
.cs-sig i { width: 3px; border-radius: 1px; background: currentColor; }
.cs-sig i:nth-child(1) { height: 4px; } .cs-sig i:nth-child(2) { height: 6px; } .cs-sig i:nth-child(3) { height: 9px; }
.cs-screen { flex: 1; min-height: 0; position: relative; display: flex; flex-direction: column; gap: 6px; padding: 6px 8px 10px; overflow: hidden; }
.cs-clock { margin-top: 10px; text-align: center; font: 700 2.3rem/1 var(--display); color: var(--code-ink); }
.cs-date { text-align: center; font-size: 0.66rem; color: var(--code-ink); opacity: 0.75; margin-bottom: 6px; }
.cs-stack { display: grid; gap: 6px; }
.cs-none { margin: 8px 0 0; text-align: center; font-size: 0.66rem; color: var(--code-ink); opacity: 0.6; }
.cs-notif { display: grid; gap: 2px; padding: 7px 9px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); font-size: 0.68rem; line-height: 1.3; min-width: 0; }
.cs-phone.dark .cs-notif { background: rgba(255, 255, 255, 0.1); border-color: transparent; color: var(--code-ink); }
.cs-n-top { display: flex; align-items: center; gap: 4px; font: 600 0.56rem var(--mono); opacity: 0.85; min-width: 0; }
.cs-n-icon { width: 11px; height: 11px; border-radius: 3px; background: var(--hi); flex: none; }
.cs-n-ch { margin-left: auto; padding: 0 5px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); white-space: nowrap; }
.cs-phone.dark .cs-n-ch { background: rgba(255, 255, 255, 0.14); color: var(--t-k); }
.cs-heads { position: absolute; left: 6px; right: 6px; top: 4px; z-index: 3; box-shadow: var(--shadow); animation: cs-down 0.35s ease-out; }
@keyframes cs-down { from { transform: translateY(-120%); } to { transform: none; } }
.cs-appbar { display: flex; align-items: center; gap: 6px; padding: 4px 2px 6px; border-bottom: 1px solid var(--line); font: 700 0.84rem var(--display); color: var(--ink); }
.cs-back { font-family: var(--mono); color: var(--muted); }
.cs-badge { margin-left: auto; font: 700 0.56rem var(--mono); padding: 1px 6px; border-radius: 999px; background: var(--warm-soft); color: var(--warm); }
.cs-body { display: grid; gap: 6px; align-content: start; min-height: 0; overflow: hidden; }
.cs-item { display: grid; gap: 2px; padding: 7px 8px; border-radius: 9px; background: var(--sunk); font-size: 0.68rem; font-weight: 700; color: var(--ink); line-height: 1.25; }
.cs-item small { font: 500 0.56rem var(--mono); color: var(--muted); }
.cs-item.fresh { box-shadow: inset 0 0 0 2px var(--accent); animation: pop 0.4s ease-out; }
.cs-card { display: grid; gap: 4px; padding: 8px; border-radius: 10px; background: var(--accent-soft); color: var(--ink); font-size: 0.68rem; line-height: 1.3; }
.cs-card.bad { background: var(--err-soft); }
.cs-card.warn { background: var(--warm-soft); }
.cs-card.ok { background: var(--ok-soft); }
.cs-pbtn { justify-self: start; padding: 3px 10px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-weight: 700; font-size: 0.64rem; }
.cs-art-h { font: 700 0.86rem/1.2 var(--display); color: var(--ink); }
.cs-line { display: block; height: 6px; border-radius: 3px; background: var(--sunk); }
.cs-line.short { width: 60%; }
.cs-over { position: absolute; inset: 0; z-index: 4; display: flex; align-items: flex-end; padding: 8px; }
.cs-scrim { position: absolute; inset: 0; background: var(--code-bg); opacity: 0.55; }
.cs-dialog { position: relative; width: 100%; display: grid; gap: 7px; padding: 12px 10px; border-radius: 16px; background: var(--surface); color: var(--ink); font-size: 0.7rem; line-height: 1.3; animation: cs-up 0.3s ease-out; }
.cs-dialog-b { display: grid; gap: 4px; }
.cs-dialog-b span { text-align: center; padding: 5px; border-radius: 999px; background: var(--sunk); font-weight: 700; }
.cs-dialog-b span:first-child { background: var(--accent); color: var(--accent-ink); }
@keyframes cs-up { from { transform: translateY(30%); opacity: 0; } to { transform: none; opacity: 1; } }
.cs-home { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding: 22px 6px; }
.cs-ic { aspect-ratio: 1; border-radius: 10px; background: rgba(255, 255, 255, 0.12); display: grid; place-items: center; font: 800 0.8rem var(--display); color: var(--code-bg); }
.cs-ic.news { background: var(--hi); }
.cs-set { display: flex; align-items: center; gap: 6px; padding: 7px 4px; border-bottom: 1px solid var(--line); font-size: 0.7rem; color: var(--ink); }
.cs-tog { margin-left: auto; width: 24px; height: 14px; border-radius: 999px; background: var(--line); position: relative; flex: none; transition: background 0.2s; }
.cs-tog::after { content: ""; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--surface); transition: transform 0.2s; }
.cs-tog.on { background: var(--accent); }
.cs-tog.on::after { transform: translateX(10px); }
.cs-toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 3; max-width: 90%; padding: 4px 10px; border-radius: 999px; background: var(--code-bg); color: var(--code-ink); font: 600 0.58rem var(--mono); text-align: center; animation: cs-up 0.3s ease-out; }
.cs-log { font: 500 0.8rem/1.55 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 8px 12px; min-height: 2.8em; overflow-x: auto; }
.cs-log > div { white-space: pre-wrap; overflow-wrap: anywhere; }
.cs-log > div::before { content: "> "; color: var(--t-c); }
.cs-log .ok { color: var(--t-k); }
.cs-log .er { color: var(--t-e); }
.cs-log .wa { color: var(--t-s); }
.cs-log .dim { color: var(--t-c); }
.cs-seg { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.cs-seg-l { font: 600 0.72rem var(--mono); color: var(--muted); margin-right: 2px; }
.cmd.cs-segb { padding: 6px 10px; font-size: 0.78rem; }
.cs-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 28px; }
.cs-chip { font: 600 0.72rem var(--mono); padding: 3px 8px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.cs-chip.top { border-color: var(--accent); color: var(--accent); }
.cs-arrow { color: var(--muted); font: 600 0.72rem var(--mono); }
.cs-dots { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 5px; }
.cs-dot { aspect-ratio: 1; border-radius: 50%; background: var(--sunk); border: 2px solid var(--line); }
.cs-dot.v42 { background: var(--accent); border-color: var(--accent); }
.cs-dot.hit { animation: pop 0.45s ease-out; }
.cs-dot.ign { border-color: var(--warm); }
.cs-legend { display: flex; flex-wrap: wrap; gap: 10px; font: 500 0.66rem var(--mono); color: var(--muted); }
.cs-legend i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; vertical-align: -1px; background: var(--sunk); border: 2px solid var(--line); }
.cs-legend i.v42 { background: var(--accent); border-color: var(--accent); }
.cs-steps { display: grid; gap: 4px; }
`;

  Lab.addTrack({
    id: 'capship',
    title: 'Ship the news reader',
    kind: 'project',
    group: 'Shipping',
    requires: ['capapp', 'platform', 'build'],
    description: 'Add breaking-news push to the offline-first news reader, harden it, and ship it to Play in stages.',
    builds: 'A signed, staged Play release of the news reader where a breaking story travels from your server through FCM to a notification that opens the right article, already synced into Room.',
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'channels',
        title: 'Channels and the permission ask',
        tagline: 'Make room for alerts on the device before the first push arrives.',
        level: 'intermediate',
        refs: ['platform.channels', 'android.permissions'],
        body: `
<p>We start on the device. The news reader from the last project shows headlines from Room. Now it gets two notification channels: <code>breaking</code> at high importance, so alerts pop up as heads-up banners, and <code>digest</code> at low importance for quiet updates. <code>NewsApp.onCreate()</code> creates both. Creating a channel that already exists never overrides what the user set, so the call runs on every launch.</p>
<p>On Android 13 and higher the app also needs <code>POST_NOTIFICATIONS</code>, and a new install starts without it. We don’t ask at launch. A card in the feed explains what alerts are for, and only a tap on <b>Turn on</b> starts the system dialog. After a second no, the dialog stops appearing, so the card switches to opening the app’s notification settings.</p>
<p>We also point FCM’s default channel at <code>breaking</code> in the manifest. Then a notification message sent from the Firebase console lands in a channel we control. Nothing here needs Firebase code yet. It applies channels and runtime permissions from earlier tracks.</p>`,
        code: `object NewsChannels {
    const val BREAKING = "breaking"
    const val DIGEST = "digest"

    fun create(context: Context) {
        val breaking = NotificationChannelCompat.Builder(BREAKING, NotificationManagerCompat.IMPORTANCE_HIGH)
            .setName(context.getString(R.string.channel_breaking))
            .setDescription(context.getString(R.string.channel_breaking_desc))
            .build()
        val digest = NotificationChannelCompat.Builder(DIGEST, NotificationManagerCompat.IMPORTANCE_LOW)
            .setName(context.getString(R.string.channel_digest))
            .build()
        NotificationManagerCompat.from(context).createNotificationChannelsCompat(listOf(breaking, digest))
    }
}

@HiltAndroidApp
class NewsApp : Application() {
    override fun onCreate() {
        super.onCreate()
        NewsChannels.create(this)   // safe on every launch: never overrides the user’s settings
    }
}

// AndroidManifest.xml
// <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
// <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id"
//            android:value="breaking" />

// The feed card is the explanation. The dialog only follows a tap.
@Composable
fun AlertsOptInCard(onEnabled: () -> Unit) {
    val context = LocalContext.current
    val activity = LocalActivity.current ?: return
    var blocked by rememberSaveable { mutableStateOf(false) }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) onEnabled()
        // A no without a rationale right after asking: the system won't show the dialog again.
        else blocked = !ActivityCompat.shouldShowRequestPermissionRationale(activity, POST_NOTIFICATIONS)
    }
    OptInCard(
        action = if (blocked) "Open settings" else "Turn on",
        onClick = {
            when {
                blocked -> context.startActivity(
                    Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                        .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName),
                )
                Build.VERSION.SDK_INT < 33 -> onEnabled()   // no runtime permission before Android 13
                else -> launcher.launch(POST_NOTIFICATIONS)
            }
        },
    )
}`,
        remember: 'Create channels at startup, ask for POST_NOTIFICATIONS after a tap, and send people to Settings after the second no.',
        challenges: [
          { type: 'blank', prompt: 'Create the breaking channel and ask for the permission.', code: 'val breaking = NotificationChannelCompat.Builder(BREAKING, NotificationManagerCompat.[[IMPORTANCE_HIGH]])\n    .setName(context.getString(R.string.channel_breaking))\n    .build()\nNotificationManagerCompat.from(context).[[createNotificationChannelsCompat]](listOf(breaking))\n\nlauncher.launch(Manifest.permission.[[POST_NOTIFICATIONS]])', why: 'High importance gives heads-up banners. The compat call works on every API level, and Android 13+ needs <code>POST_NOTIFICATIONS</code> before anything shows.' },
          { type: 'bug', prompt: 'Breaking alerts never appear on Android 8 and later, and nothing throws. Tap the line.', code: 'object NewsChannels { const val BREAKING = "breaking" }\n\nfun breakingAlert(context: Context, title: String): Notification =\n    NotificationCompat.Builder(context, "Breaking")\n        .setSmallIcon(R.drawable.ic_stat_news)\n        .setContentTitle(title)\n        .setAutoCancel(true)\n        .build()', bug: 3, fix: '    NotificationCompat.Builder(context, NewsChannels.BREAKING)', why: 'Channel ids are exact strings. No channel is called <code>"Breaking"</code>, so the system drops the notification. Use the constant everywhere.' },
        ],
        quiz: [
          { q: 'The app targets API 36 and runs on Android 14. Nobody has asked for the permission yet. What does <code>notify()</code> on the breaking channel do?', options: ['Shows the alert', 'Posts nothing and throws nothing', 'Throws a SecurityException'], a: 1, why: 'On Android 13+ a new install starts without <code>POST_NOTIFICATIONS</code>. The notification is dropped silently, so check the permission before you rely on it.' },
          { q: 'The user sets the breaking channel to Silent. Your next release creates it again with <code>IMPORTANCE_HIGH</code>. What happens?', options: ['It goes back to high', 'It stays silent: the user owns it now', 'The app crashes'], a: 1, why: 'Creating an existing channel can update its name and description, and can only lower an importance the user never touched. It can’t raise it or undo the user’s choice.' },
          { q: 'The user tapped Don’t allow twice. What does <code>launcher.launch(POST_NOTIFICATIONS)</code> do now?', options: ['Shows the dialog again', 'Returns false right away without a dialog', 'Opens Settings'], a: 1, why: 'Since Android 11 two denials stop the dialog. Only the app’s notification settings can turn it on, so link there.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(1, wait), P = phoneView();
          let a13 = true, granted = false, denials = 0, blocked = false, silent = false, closeDialog = null;
          const log = logger('The feed offers alerts. Nothing has been asked yet.');
          const permTag = h('span'), chTag = h('span');
          const paint = () => {
            permTag.replaceChildren(!a13 ? tag('not needed below 13', 'ok') : granted ? tag('granted', 'ok') : blocked ? tag('denied twice: no dialog', 'bad') : denials ? tag('denied once', 'warn') : tag('not asked'));
            chTag.replaceChildren(silent ? tag('user set: silent', 'warn') : tag('IMPORTANCE_HIGH', 'on'));
          };
          const enabled = () => !a13 || granted;
          const showFeed = () => P.app('News', [
            enabled() ? h('div', { class: 'cs-card ok' }, h('b', {}, 'Breaking news alerts are on')) :
              h('div', { class: 'cs-card' }, h('b', {}, 'Breaking news alerts'), h('span', {}, 'Get an alert when big news breaks.'), h('span', { class: 'cs-pbtn' }, blocked ? 'Open settings' : 'Turn on')),
            ...feedItems(FEED)]);
          const answer = yes => () => {
            if (!closeDialog) { log.add('No dialog on screen. Tap "Turn on" first.', 'dim'); return; }
            closeDialog(); closeDialog = null;
            if (yes) { granted = true; log.add('granted = true. onEnabled() follows the topic in step 2.', 'ok'); }
            else {
              denials++;
              blocked = denials >= 2;
              log.add(blocked ? 'granted = false, no rationale: the dialog is gone for good. The card now opens Settings.' : 'granted = false. The card stays; one more ask is allowed.', 'wa');
            }
            paint(); showFeed();
          };
          const turnOn = once(async () => {
            if (closeDialog) { log.add('The dialog is already showing.', 'dim'); return; }
            showFeed();
            path.clear(); path.mark('device', 'hot'); path.ping('perm');
            if (enabled()) { log.add(a13 ? 'Already granted. onEnabled() runs.' : 'Android 12 and lower: no runtime permission. Alerts are on.', 'ok'); return; }
            if (blocked) {
              log.add('startActivity(ACTION_APP_NOTIFICATION_SETTINGS)');
              P.app('Settings', [h('div', { class: 'cs-set' }, 'All News notifications', h('span', { class: 'cs-tog' }))], { back: true });
              await wait(900);
              P.app('Settings', [h('div', { class: 'cs-set' }, 'All News notifications', h('span', { class: 'cs-tog on' }))], { back: true });
              granted = true; blocked = false; paint();
              log.add('The user turns it on in Settings. That grants the permission.', 'ok');
              await wait(900);
              showFeed();
              return;
            }
            log.add('launcher.launch(POST_NOTIFICATIONS)');
            await wait(250);
            closeDialog = P.overlay(h('div', { class: 'cs-dialog' }, h('b', {}, 'Allow News to send you notifications?'), h('div', { class: 'cs-dialog-b' }, h('span', {}, 'Allow'), h('span', {}, 'Don’t allow'))));
          });
          const testAlert = once(async () => {
            if (closeDialog) { closeDialog(); closeDialog = null; }
            path.clear(); path.mark('app', 'hot'); path.mark('device', 'hot'); path.ping('chan');
            if (!enabled()) { P.shake(); log.add('notify() returned. Nothing posted, nothing thrown: no permission.', 'er'); return; }
            P.lock();
            await wait(300);
            P.post(alertOf(ALERTS[0], { heads: !silent, text: silent ? 'Silent: no sound, no banner' : null }));
            log.add(silent ? 'Posted quietly. The user turned the sound and banner off.' : 'Heads-up on the breaking channel, with sound.', 'ok');
          });
          const userSilent = () => {
            silent = !silent; paint();
            log.add(silent ? 'In Settings the user sets Breaking to Silent. Your code can’t raise it again.' : 'The user sets Breaking back to Alerting.', silent ? 'wa' : 'ok');
          };
          paint(); showFeed();
          frame(el, path, P, [
            box('Channels', row(mono('breaking'), chTag), row(mono('digest'), tag('IMPORTANCE_LOW'))),
            box('POST_NOTIFICATIONS', row(permTag)),
          ], [
            act('Tap "Turn on"', turnOn), act('Allow', answer(true)), act('Don’t allow', answer(false)),
            act('Post a test alert', testAlert), act('User makes Breaking silent', userSilent),
            toggle('Android 13+', true, v => {
              a13 = v; granted = false; denials = 0; blocked = false;
              if (closeDialog) { closeDialog(); closeDialog = null; }
              paint(); showFeed();
              log.add(v ? 'Android 13+: the permission starts off.' : 'Android 12: no runtime permission, notifications are on by default.', 'dim');
            }),
          ], log);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'tokens',
        title: 'Tokens and topics',
        tagline: 'Register each install with your server and let readers pick categories.',
        level: 'intermediate',
        refs: ['platform.fcm', 'platform.workmanager', 'data.datastore', 'arch.hilt'],
        body: `
<p>Now the app joins FCM. We add the Firebase BoM and <code>firebase-messaging</code>, whose Kotlin APIs now live in the main module, and declare <code>NewsMessagingService</code> with <code>exported="false"</code>. FCM gives each install a registration token and calls <code>onNewToken()</code> on first start and after every rotation. The callback only enqueues <code>TokenUploadWorker</code>, unique work with <code>REPLACE</code>, so an upload still waiting for a network is swapped for the newest token.</p>
<p>Categories use topics. When a reader turns on Tech, <code>AlertsRepository</code> saves it in DataStore and calls <code>subscribeToTopic("news-tech")</code>. Your server sends one message to the topic and FCM fans it out. Topics fit public news like this. FCM tunes them for throughput rather than latency, and an install can follow up to 2,000 of them. Anything personal, like a reply to the reader’s comment, goes to tokens.</p>
<p>Subscriptions belong to a token. So after uploading a new token, the worker applies the saved categories again; subscribing twice does no harm. On your server the token is the primary key: upsert on register, and delete the row when a send returns <code>404 UNREGISTERED</code>.</p>`,
        code: `// app/build.gradle.kts
plugins { alias(libs.plugins.google.services) }
dependencies {
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)
    implementation(libs.kotlinx.coroutines.play.services)   // Task.await()
}

// AndroidManifest.xml
// <service android:name=".push.NewsMessagingService" android:exported="false">
//     <intent-filter><action android:name="com.google.firebase.MESSAGING_EVENT" /></intent-filter>
// </service>

@AndroidEntryPoint
class NewsMessagingService : FirebaseMessagingService() {
    // First token and every rotation. Return fast: the worker does the network part.
    override fun onNewToken(token: String) = TokenUploadWorker.enqueue(applicationContext, token)
}

fun topicFor(category: String) = "news-$category"

@Singleton
class AlertsRepository @Inject constructor(private val store: DataStore<Preferences>) {
    val followed: Flow<Set<String>> = store.data.map { it[FOLLOWED] ?: setOf("breaking") }

    suspend fun setFollowed(category: String, on: Boolean) {
        store.edit { prefs ->
            val now = prefs[FOLLOWED] ?: setOf("breaking")
            prefs[FOLLOWED] = if (on) now + category else now - category
        }
        val topic = topicFor(category)
        if (on) Firebase.messaging.subscribeToTopic(topic).await()
        else Firebase.messaging.unsubscribeFromTopic(topic).await()
    }

    private companion object { val FOLLOWED = stringSetPreferencesKey("followed") }
}

@HiltWorker
class TokenUploadWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val api: DevicesApi,
    private val alerts: AlertsRepository,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val token = inputData.getString(KEY_TOKEN) ?: return Result.failure()
        return try {
            api.register(DeviceRegistration(token, locale = Locale.getDefault().toLanguageTag()))
            alerts.followed.first().forEach { Firebase.messaging.subscribeToTopic(topicFor(it)).await() }
            Result.success()
        } catch (e: IOException) {
            Result.retry()
        }
    }

    companion object {
        private const val KEY_TOKEN = "token"

        fun enqueue(context: Context, token: String) {
            val request = OneTimeWorkRequestBuilder<TokenUploadWorker>()
                .setInputData(workDataOf(KEY_TOKEN to token))
                .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
                .build()
            WorkManager.getInstance(context)
                .enqueueUniqueWork("fcm-token", ExistingWorkPolicy.REPLACE, request)
        }
    }
}

// Server: POST /v1/devices upserts by token. A send that returns 404 UNREGISTERED deletes the row.`,
        remember: 'onNewToken enqueues the upload, the upload re-applies the topics, and the server keys rows by token.',
        terms: [
          { term: 'FCM topic', def: 'A named group on FCM that app installs subscribe to, so one send from your server reaches every subscriber.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Forward new tokens and follow a category.', code: 'override fun [[onNewToken]](token: String) =\n    TokenUploadWorker.enqueue(applicationContext, token)\n\nsuspend fun follow(category: String) {\n    Firebase.messaging.[[subscribeToTopic]]("news-$category").[[await]]()\n}', why: '<code>onNewToken</code> fires for every new token. <code>subscribeToTopic</code> returns a Task, and <code>await()</code> from kotlinx-coroutines-play-services suspends until FCM confirms.' },
          { type: 'bug', prompt: 'A phone was offline when its token rotated twice. The server ends up with a dead token. Tap the line.', code: 'fun enqueue(context: Context, token: String) {\n    val request = OneTimeWorkRequestBuilder<TokenUploadWorker>()\n        .setInputData(workDataOf("token" to token))\n        .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))\n        .build()\n    WorkManager.getInstance(context)\n        .enqueueUniqueWork("fcm-token", ExistingWorkPolicy.KEEP, request)\n}', bug: 6, fix: '        .enqueueUniqueWork("fcm-token", ExistingWorkPolicy.REPLACE, request)', why: 'With <code>KEEP</code>, the first upload is still waiting for a network, so the newer request is dropped and the old token goes up. <code>REPLACE</code> swaps in the latest token.' },
        ],
        quiz: [
          { q: 'Why does <code>onNewToken</code> enqueue a worker instead of calling the API itself?', options: ['The callback runs on the main thread', 'The upload can fail offline; the worker waits for a network, retries with backoff and survives the process dying', 'FCM forbids network calls in the service'], a: 1, why: 'FirebaseMessagingService callbacks run on a background thread, but the process can die at any time. WorkManager makes the upload reliable.' },
          { q: 'A reader turns Tech off. What should the app call?', options: ['<code>unsubscribeFromTopic("news-tech")</code>', '<code>deleteToken()</code>', 'Nothing; the server filters'], a: 0, why: 'Unsubscribing removes this token from the topic. Deleting the token would stop every push to this install.' },
          { q: 'Which message fits a topic best?', options: ['Breaking news for everyone who follows Sports', 'A reply to the reader’s own comment', 'A sign-in code'], a: 0, why: 'Topics are for public messages to many installs. Personal or private messages go to that user’s tokens.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(2, wait), P = phoneView();
          const NAMES = ['fA3k…9Qz', 'c81T…pL0', 'Hq7e…2Wd', 'Zr40…kE5', 'pM2x…7Ya'];
          let gen = 0, token = null, tech = false;
          let rows = []; // { tok, gone }
          const subs = {}; // token -> Set(topic)
          const log = logger('The app has never started, so it has no token yet.');
          const rowsEl = h('div', { class: 'cs-steps' }), topicsEl = h('div', { class: 'cs-steps' });
          const paint = fresh => {
            rowsEl.replaceChildren(...(rows.length ? rows.map(r => h('div', { class: 'cs-row' + (r.gone ? ' gone' : '') + (r.tok === fresh ? ' fresh' : '') }, mono(r.tok),
              r.gone ? tag('404: deleted', 'bad') : r.tok === token ? tag('this install', 'ok') : tag('stale', 'warn'))) : [h('span', { class: 'cs-tag' }, 'no rows')]));
            const mine = token ? subs[token] || new Set() : new Set();
            topicsEl.replaceChildren(...['breaking', 'tech', 'sports'].map(c => row(mono(topicFor(c)), mine.has(c) ? tag('this token', 'on') : tag('-'))));
          };
          const topicFor = c => `news-${c}`;
          const showApp = () => P.app('Alerts', [
            h('div', { class: 'cs-set' }, 'Breaking', h('span', { class: 'cs-tog' + (token ? ' on' : '') })),
            h('div', { class: 'cs-set' }, 'Tech', h('span', { class: 'cs-tog' + (tech ? ' on' : '') })),
            h('div', { class: 'cs-set' }, 'Sports', h('span', { class: 'cs-tog' })),
            h('small', { class: 'cs-art-m' }, token ? `token ${token}` : 'no token yet'),
          ], { back: true });
          async function upload() {
            log.add(`onNewToken("${token}") → TokenUploadWorker`);
            await path.token();
            path.ping('tokens');
            rows = rows.filter(r => r.tok !== token).concat({ tok: token });
            paint(token);
            await wait(300);
            await path.back('app', 'fcm');
            subs[token] = new Set(['breaking', ...(tech ? ['tech'] : [])]);
            path.ping('topics'); paint();
            log.add(`POST /v1/devices, then re-subscribe: ${[...subs[token]].map(topicFor).join(', ')}`, 'ok');
          }
          const launch = once(async () => {
            if (token) { showApp(); log.add('Already running. onNewToken only fires for a new token.', 'dim'); return; }
            gen = 1; token = NAMES[0]; showApp();
            await path.back('device', 'fcm'); await path.run('fcm', 'app', { keep: true });
            path.ping('svc');
            await upload();
          });
          const toggleTech = once(async () => {
            if (!token) { log.add('Launch the app first: there is no token to subscribe.', 'dim'); return; }
            tech = !tech; showApp();
            await path.back('app', 'fcm');
            const s = subs[token] || (subs[token] = new Set());
            if (tech) s.add('tech'); else s.delete('tech');
            path.ping('topics'); paint();
            log.add(tech ? 'setFollowed("tech", true): DataStore, then subscribeToTopic("news-tech")' : 'setFollowed("tech", false): unsubscribeFromTopic("news-tech")', 'ok');
          });
          const sendTech = once(async () => {
            log.add('Server: send to topic "news-tech"');
            await path.run('server', 'fcm');
            path.ping('topics');
            if (!token || !(subs[token] || new Set()).has('tech')) { path.mark('device', 'skip'); path.mark('app', 'skip'); log.add('This token isn’t subscribed to news-tech. Nothing comes to this phone.', 'wa'); return; }
            await path.run('fcm', 'app', { keep: true });
            P.toast('message received');
            log.add('Delivered to onMessageReceived. Step 3 decides what it shows.', 'ok');
          });
          const rotate = once(async () => {
            if (!token) { log.add('Launch the app first.', 'dim'); return; }
            token = NAMES[gen % NAMES.length]; gen++; showApp();
            log.add('FCM rotates the token. The server still has the old row.', 'wa');
            paint();
            await path.back('device', 'fcm'); await path.run('fcm', 'app', { keep: true });
            await upload();
          });
          const sendAll = once(async () => {
            if (!rows.some(r => !r.gone)) { log.add('The token table is empty.', 'dim'); return; }
            for (const r of rows.filter(x => !x.gone)) {
              const live = r.tok === token;
              await path.run('server', 'fcm', { fast: true });
              if (live) { await path.run('fcm', 'app', { keep: true, fast: true }); log.add(`${r.tok}: 200 OK, delivered`, 'ok'); }
              else { path.mark('device', 'skip'); r.gone = true; paint(); log.add(`${r.tok}: 404 UNREGISTERED. Delete the row.`, 'er'); }
              await wait(250);
            }
            rows = rows.filter(r => !r.gone);
            await wait(500); paint();
          });
          paint(); P.home();
          frame(el, path, P, [
            box('Your server · device tokens', rowsEl),
            box('FCM topics', topicsEl),
          ], [
            act('Launch the app', launch), act('Toggle Tech', toggleTech), act('Send to news-tech', sendTech),
            act('Token rotates', rotate), act('Send to every stored token', sendAll),
          ], log);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'messages',
        title: 'Data messages for breaking news',
        tagline: 'Send data, post the notification yourself, and know when your code runs.',
        level: 'intermediate',
        refs: ['platform.messages', 'platform.fcm', 'platform.channels'],
        body: `
<p>Time to send. Your server calls the FCM HTTP v1 API with a data-only message to the topic <code>news-breaking</code>. It carries <code>type</code>, <code>article_id</code> and <code>title</code>, all strings, within the 4 KB limit. <code>android.priority</code> is <code>high</code> because every breaking message ends in a visible notification; FCM can downgrade high-priority messages that keep showing nothing. A <code>ttl</code> of one hour drops alerts that are no longer news, and a <code>collapse_key</code> means a phone that was offline gets only the newest one.</p>
<p>Why not a notification message? In the background the SDK would draw it for us and our code would never run. We couldn’t pick the channel, attach a deep link with a back stack, or start a sync. A data message reaches <code>onMessageReceived()</code> in the foreground, in the background, and after the user swipes the app away, because FCM starts the process. A force-stopped app gets nothing until the user opens it again.</p>
<p><code>onMessageReceived()</code> gets a short window, meant to be long enough to render a notification. So <code>BreakingNotifier</code> posts at once from the payload. It checks the permission first and uses the article id as the notification tag, so a repeat of the same story replaces its alert instead of stacking.</p>`,
        code: `// Server: POST https://fcm.googleapis.com/v1/projects/news-prod/messages:send
// {
//   "message": {
//     "topic": "news-breaking",
//     "data": { "type": "breaking", "article_id": "a-81723", "title": "Bridge closed after quake" },
//     "android": { "priority": "high", "ttl": "3600s", "collapse_key": "breaking" }
//   }
// }

@AndroidEntryPoint
class NewsMessagingService : FirebaseMessagingService() {
    @Inject lateinit var notifier: BreakingNotifier

    override fun onNewToken(token: String) = TokenUploadWorker.enqueue(applicationContext, token)

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        when (data["type"]) {
            "breaking" -> notifier.show(data["article_id"] ?: return, data["title"].orEmpty())
            else -> Unit   // a type this version doesn't know: ignore it
        }
    }
}

@Singleton
class BreakingNotifier @Inject constructor(@ApplicationContext private val context: Context) {

    fun show(articleId: String, title: String) {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(context, POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return
        val notification = NotificationCompat.Builder(context, NewsChannels.BREAKING)
            .setSmallIcon(R.drawable.ic_stat_news)
            .setContentTitle(context.getString(R.string.breaking_label))
            .setContentText(title)
            .setAutoCancel(true)
            .build()
        // Tag + id: the same story replaces its own alert.
        NotificationManagerCompat.from(context).notify(articleId, BREAKING_ID, notification)
    }

    private companion object { const val BREAKING_ID = 1 }
}`,
        remember: 'Breaking news is a high-priority data message. Your code posts the alert, so it runs in every state except force-stopped.',
        terms: [
          { term: 'Collapse key', def: 'An FCM option that keeps only the newest undelivered message with the same key for a device, up to four keys per device.' },
          { term: 'Original priority', def: 'The priority your server asked for, read with RemoteMessage.getOriginalPriority(); compare it with getPriority() to spot downgraded messages.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send a breaking alert to the topic with the Firebase Admin SDK.', code: 'val message = Message.builder()\n    .[[setTopic]]("news-breaking")\n    .putData("type", "breaking")\n    .putData("article_id", "a-81723")\n    .setAndroidConfig(\n        AndroidConfig.builder()\n            .setPriority(AndroidConfig.Priority.[[HIGH]])\n            .[[setCollapseKey]]("breaking")\n            .build())\n    .build()\nFirebaseMessaging.getInstance().send(message)', why: 'The topic picks the audience, <code>HIGH</code> lets it wake a dozing phone, and the collapse key keeps only the newest alert for a phone that was offline.' },
          { type: 'bug', prompt: 'Alerts sometimes show up a minute late or not at all. Tap the line.', code: 'override fun onMessageReceived(message: RemoteMessage) {\n    val id = message.data["article_id"] ?: return\n    val title = message.data["title"].orEmpty()\n    runBlocking { repository.refreshArticle(id) }\n    notifier.show(id, title)\n}', bug: 3, fix: '    // remove it: post first, fetch in WorkManager (step 5)', why: 'The window is meant for rendering a notification. A network call can outlast it, and the process may be stopped before <code>show()</code> runs.' },
        ],
        quiz: [
          { q: 'The app is in the background. The server sends a message with a <code>notification</code> block and <code>article_id</code> in <code>data</code>. Where does <code>article_id</code> end up?', options: ['In <code>onMessageReceived()</code>', 'In the launcher Activity’s intent extras, after the user taps', 'Nowhere, it is dropped'], a: 1, why: 'The SDK shows the notification itself. Its data rides along in the extras of the Intent that opens the launcher Activity.' },
          { q: 'The reader swiped the app away from Recents. A high-priority data message arrives. What happens?', options: ['Nothing until they open the app', 'FCM starts the process and <code>onMessageReceived()</code> runs', 'The system shows it without your code'], a: 1, why: 'Swiping away kills the process but is not a force stop. FCM can start the app to deliver. Only a force-stopped app gets nothing.' },
          { q: 'An install keeps getting high-priority data messages that never lead to a notification. What can FCM do?', options: ['Nothing changes', 'Deliver later messages to that install as normal priority', 'Unsubscribe it from the topic'], a: 1, why: 'FCM looks at recent behavior per install and may downgrade. Compare <code>getPriority()</code> with <code>getOriginalPriority()</code> to see it happen.' },
        ],
        mistakes: [
          { title: 'A notification message when you need your code', bad: '{ "message": {\n    "topic": "news-breaking",\n    "notification": { "title": "Bridge closed after quake" },\n    "data": { "article_id": "a-81723" }\n} }\n// In the background, onMessageReceived never runs', good: '{ "message": {\n    "topic": "news-breaking",\n    "data": { "type": "breaking", "article_id": "a-81723",\n              "title": "Bridge closed after quake" },\n    "android": { "priority": "high" }\n} }', why: 'With a <code>notification</code> block, the SDK draws the alert in the background and your service is skipped. No deep link with a back stack, no sync. Data-only keeps your code in charge.' },
          { title: 'High priority for messages that show nothing', bad: '// a silent "refresh the headlines" ping\n.setAndroidConfig(AndroidConfig.builder()\n    .setPriority(AndroidConfig.Priority.HIGH)\n    .build())', good: '// silent work can wait for the next maintenance window\n.setAndroidConfig(AndroidConfig.builder()\n    .setPriority(AndroidConfig.Priority.NORMAL)\n    .build())', why: 'FCM watches about a week of behavior per install. High-priority messages that never lead to a notification can be downgraded to normal, and then your real breaking alerts arrive late.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(3, wait), P = phoneView();
          let state = 'background', kind = 'data', high = true, doze = false;
          const log = logger('Pick the app state and the message type, then send.');
          const sdkTag = h('span'), svcTag = h('span');
          const json = h('pre', { class: 'cs-json' });
          const paintJson = () => {
            json.textContent = kind === 'data'
              ? `"data": {\n  "type": "breaking",\n  "article_id": "a-81723",\n  "title": "Bridge closed..."\n},\n"android": { "priority": "${high ? 'high' : 'normal'}" }`
              : `"notification": {\n  "title": "Bridge closed..."\n},\n"data": { "article_id": "a-81723" },\n"android": { "priority": "${high ? 'high' : 'normal'}" }`;
          };
          const who = (sdk, svc) => { sdkTag.replaceChildren(sdk ? tag('drew it', 'warn') : tag('-')); svcTag.replaceChildren(svc ? tag('ran', 'ok') : tag('not run', svc === false ? 'bad' : '')); };
          const showState = () => {
            P.clearAll();
            if (state === 'foreground') P.app('News', feedItems(FEED)); else if (state === 'stopped') P.home(); else P.lock();
          };
          const send = once(async () => {
            showState(); who(null, null);
            log.add(`Server → FCM: ${kind} message, priority ${high ? 'high' : 'normal'}`);
            path.ping('send');
            await path.run('server', 'fcm');
            if (doze && !high) { path.mark('device', 'skip'); log.add('Normal priority while dozing: FCM holds it until the next maintenance window.', 'wa'); return; }
            if (state === 'stopped') { await path.run('fcm', 'device', { keep: true, failAt: 'device' }); who(false, false); log.add('Force-stopped: nothing is delivered until the user opens the app again.', 'er'); return; }
            await path.run('fcm', 'device', { keep: true });
            if (kind === 'notification' && state !== 'foreground') {
              path.mark('app', 'skip');
              P.post(alertOf(ALERTS[0], { ch: 'Breaking' }));
              who(true, false);
              log.add('The SDK drew it from the notification block. Your code didn’t run; article_id waits in the launcher intent’s extras.', 'wa');
              return;
            }
            await path.run('device', 'app', { keep: true });
            path.ping('svc');
            if (kind === 'notification') { who(false, true); log.add('Foreground: onMessageReceived ran and nothing shows by itself. data["type"] is missing, so our code ignores it.', 'wa'); return; }
            path.ping('notify');
            P.post(alertOf(ALERTS[0]));
            who(false, true);
            log.add(state === 'swiped' ? 'FCM started the process: swiping away is not a force stop. BreakingNotifier posted it.' : 'onMessageReceived → BreakingNotifier.show() on the breaking channel.', 'ok');
          });
          paintJson(); who(null, null); showState();
          frame(el, path, P, [
            box('Payload', json),
            box('Who handled it', row('FCM SDK', sdkTag), row(mono('onMessageReceived'), svcTag)),
          ], [
            seg('App', [['foreground', 'Foreground'], ['background', 'Background'], ['swiped', 'Swiped away'], ['stopped', 'Force-stopped']], state, v => { state = v; showState(); who(null, null); }),
            seg('Message', [['data', 'Data'], ['notification', 'Notification']], kind, v => { kind = v; paintJson(); }),
            toggle('priority high', true, v => { high = v; paintJson(); }),
            toggle('Device dozing', false, v => { doze = v; log.add(v ? 'The phone is idle and in Doze.' : 'The phone is awake.', 'dim'); }),
            act('Send breaking news', send),
          ], log);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'deeplink',
        title: 'A tap opens the article',
        tagline: 'A deep link into the nav graph, with the feed underneath for Back.',
        level: 'intermediate',
        refs: ['platform.deeplinks', 'compose2.navigation', 'android.backstack'],
        body: `
<p>A tap on the alert should open that article, and Back should land on the feed, not the home screen. We give <code>ArticleDetail</code> a deep link in the nav graph with <code>navDeepLink&lt;ArticleDetail&gt;(basePath = ...)</code>. The required <code>id</code> becomes a path segment, so the pattern is <code>https://news.example.com/article/{id}</code>.</p>
<p><code>BreakingNotifier</code> now builds an <code>ACTION_VIEW</code> Intent for that URI, aimed at <code>MainActivity</code>, and wraps it with <code>TaskStackBuilder</code>. The PendingIntent starts a cleared task. When <code>NavHost</code> sets up its graph, it hands the launch Intent to <code>handleDeepLink()</code>, which puts <code>ArticleList</code>, the start destination, under the article. Each article has its own URI, so two alerts never share a PendingIntent. We pass <code>FLAG_IMMUTABLE</code>; Android 12+ requires choosing one.</p>
<p>The manifest needs no intent filter for this, because the Intent names its component. Add one only for links from the web. Keep <code>MainActivity</code> on the default <code>standard</code> launch mode. If you make it <code>singleTop</code>, an Intent that reaches the running activity arrives in <code>onNewIntent()</code>, and nothing navigates unless you pass it to <code>navController.handleDeepLink()</code>.</p>`,
        code: `const val ARTICLE_LINK_BASE = "https://news.example.com/article"

// Routes from the reader project, unchanged:
// @Serializable data object ArticleList
// @Serializable data class ArticleDetail(val id: String)

@Composable
fun NewsNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = ArticleList) {
        composable<ArticleList> { /* unchanged */ }
        composable<ArticleDetail>(
            deepLinks = listOf(navDeepLink<ArticleDetail>(basePath = ARTICLE_LINK_BASE)),   // .../article/{id}
        ) {
            val viewModel: ArticleViewModel = hiltViewModel()   // reads the id with toRoute<ArticleDetail>()
            val article by viewModel.article.collectAsStateWithLifecycle()
            ArticleDetailScreen(article, onBack = { navController.popBackStack() })
        }
    }
}

// BreakingNotifier: what a tap does
private fun openArticle(articleId: String): PendingIntent? {
    val intent = Intent(
        Intent.ACTION_VIEW,
        "$ARTICLE_LINK_BASE/$articleId".toUri(),
        context,
        MainActivity::class.java,
    )
    return TaskStackBuilder.create(context)
        .addNextIntentWithParentStack(intent)
        .getPendingIntent(articleId.hashCode(), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
}

// In show():
//     .setContentIntent(openArticle(articleId))`,
        remember: 'Deep link the route, wrap the Intent in TaskStackBuilder, keep MainActivity standard. The feed ends up under the article.',
        terms: [
          { term: 'handleDeepLink', def: 'The NavController method that matches an Intent’s URI against the graph’s deep links and builds the back stack for it; NavHost calls it for the launch Intent.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the route a deep link and build the tap target with a back stack.', code: 'composable<ArticleDetail>(\n    deepLinks = listOf([[navDeepLink]]<ArticleDetail>(basePath = "https://news.example.com/article")),\n) { ArticleDetailScreen() }\n\nval pending = TaskStackBuilder.create(context)\n    .[[addNextIntentWithParentStack]](intent)\n    .getPendingIntent(id.hashCode(), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.[[FLAG_IMMUTABLE]])', why: '<code>navDeepLink</code> registers the URI pattern, <code>TaskStackBuilder</code> starts a clean task, and Android 12+ needs an explicit mutability flag.' },
          { type: 'bug', prompt: 'Tapping an alert opens the feed instead of the article. Tap the line.', code: 'const val ARTICLE_LINK_BASE = "https://news.example.com/article"\ncomposable<ArticleDetail>(deepLinks = listOf(navDeepLink<ArticleDetail>(basePath = ARTICLE_LINK_BASE))) { ArticleDetailScreen() }\n\nfun openArticle(context: Context, id: String): PendingIntent? {\n    val uri = "https://news.example.com/article?id=$id".toUri()\n    val intent = Intent(Intent.ACTION_VIEW, uri, context, MainActivity::class.java)\n    return TaskStackBuilder.create(context)\n        .addNextIntentWithParentStack(intent)\n        .getPendingIntent(id.hashCode(), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)\n}', bug: 4, fix: '    val uri = "$ARTICLE_LINK_BASE/$id".toUri()', why: 'A required route argument is a path segment, so the pattern is <code>.../article/{id}</code>. A query parameter doesn’t match, and NavHost stays on the start destination.' },
        ],
        quiz: [
          { q: 'The app was not running. The reader taps the alert. What is on the back stack?', options: ['Only ArticleDetail, so Back exits', 'ArticleList, then ArticleDetail', 'Whatever screen was open last time, then ArticleDetail'], a: 1, why: 'For a deep link in a fresh task, Navigation adds the start destination under the target, so Back walks up to the feed.' },
          { q: 'Two alerts for different articles both use request code 0. Do their taps open the right articles?', options: ['No, the second PendingIntent replaces the first', 'Yes, their Intents have different data URIs, so they are different PendingIntents'], a: 1, why: 'PendingIntents match on action, data, type, component and categories. Different URIs make them distinct. Extras alone would not.' },
          { q: 'Why doesn’t the alert need an intent filter in the manifest?', options: ['The Intent names MainActivity explicitly, and NavHost matches the URI against the graph', 'Notifications skip the manifest', 'FLAG_IMMUTABLE replaces the filter'], a: 0, why: 'Filters are for implicit Intents, like a link tapped in the browser. An explicit Intent goes straight to the component.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(4, wait), P = phoneView();
          let running = false, stack = [], shortcut = false, next = 1;
          let current = ALERTS[0];
          const log = logger('The app is not running. A breaking alert is on the lock screen.');
          const stackEl = h('div', { class: 'cs-chips' }), intentEl = h('div', { class: 'cs-steps' });
          const paint = () => {
            stackEl.replaceChildren(...(stack.length ? stack.flatMap((s, i) => [i ? h('span', { class: 'cs-arrow' }, '›') : null, h('span', { class: 'cs-chip' + (i === stack.length - 1 ? ' top' : '') }, s)]).filter(Boolean) : [tag(running ? 'running' : 'no task')]));
          };
          const paintIntent = s => intentEl.replaceChildren(
            row(mono('ACTION_VIEW')), row(mono(`…/article/${s.id}`)),
            row(shortcut ? tag('getActivity(), singleTop', 'warn') : tag('TaskStackBuilder: NEW_TASK | CLEAR_TASK', 'on')));
          const showTop = () => {
            const top = stack[stack.length - 1] || '';
            if (top.startsWith('Article')) { const s = [...ALERTS, ...FEED].find(x => top.includes(x.id)) || current; P.app('Article', articleBody(s, 'from Room', 'ok'), { back: true }); }
            else P.app('News', feedItems(FEED));
          };
          const tap = once(async () => {
            if (!P.has() || P.mode() === 'app') { log.add('No alert waiting. Press Home first to get a new one.', 'dim'); return; }
            const n = P.take();
            const s = ALERTS.find(a => a.id === n.id) || current;
            paintIntent(s);
            path.clear(); path.mark('device', 'hot');
            await path.run('device', 'app', { keep: true });
            path.ping('link');
            if (shortcut && running) {
              P.shake(); showTop();
              log.add('singleTop: the running MainActivity gets onNewIntent(). Nothing calls handleDeepLink(), so the screen doesn’t change.', 'er');
              return;
            }
            stack = ['ArticleList', `ArticleDetail(${s.id})`]; running = true; paint();
            P.app('Article', articleBody(s, 'opened from alert', 'on'), { back: true });
            log.add(`Task cleared and rebuilt. NavHost matched …/article/${s.id} and put ArticleList underneath.`, 'ok');
          });
          const back = () => {
            if (!running) { log.add('You are on the home screen.', 'dim'); return; }
            if (P.mode() !== 'app') { log.add('The app is in the background. Tap the alert to bring it up.', 'dim'); return; }
            if (stack.length > 1) { stack.pop(); paint(); showTop(); log.add('popBackStack(): the feed, not the home screen.', 'ok'); }
            else { stack = []; running = false; paint(); P.home(); log.add('Back on the start destination finishes MainActivity.', 'dim'); }
          };
          const newAlert = once(async () => {
            current = ALERTS[next % ALERTS.length]; next++;
            P.lock();
            await path.run('server', 'device');
            P.post(alertOf(current));
            log.add(running ? `Home pressed; the app keeps running. A new alert, a new URI: …/article/${current.id}.` : `A new alert: …/article/${current.id}.`);
          });
          P.post(alertOf(current)); P.lock(); paint(); paintIntent(current);
          frame(el, path, P, [
            box('Back stack', stackEl),
            box('PendingIntent', intentEl),
          ], [
            act('Tap the alert', tap), act('Back', back), act('Press Home, new alert', newAlert),
            toggle('Shortcut: singleTop + plain getActivity()', false, v => { shortcut = v; paintIntent(current); log.add(v ? 'Now try: tap an alert, press Home, get a new alert, tap it.' : 'Back to TaskStackBuilder and standard launch mode.', 'dim'); }),
          ], log);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'sync',
        title: 'Prefetch with WorkManager',
        tagline: 'The push starts an expedited job, so the article is in Room before the tap.',
        level: 'advanced',
        refs: ['platform.workmanager', 'arch.ssot', 'arch.hilt', 'data.caching'],
        body: `
<p>The alert is up, but the article itself may not be in Room yet. If the reader taps it on a train with no signal, the screen is empty. So <code>onMessageReceived()</code> also enqueues <code>ArticleSyncWorker</code>, which calls a new <code>NewsRepository.refreshArticle(id)</code> to fetch that one story and upsert it into Room. Room stays the single source of truth: <code>NewsViewModel</code> and <code>ArticleViewModel</code> observe it and update on their own.</p>
<p>FCM gives a brief exemption to start an expedited job right after a high-priority message. So we call <code>setExpedited()</code> with <code>RUN_AS_NON_EXPEDITED_WORK_REQUEST</code> as the fallback when the quota runs out. On Android 11 and lower, WorkManager runs expedited work as a foreground service, so the worker overrides <code>getForegroundInfo()</code>. Unique work named after the article stops a repeated message from fetching twice, and the network constraint holds the job until the phone is online.</p>
<p>The service now handles a second type. A <code>refresh</code> message has normal priority and no alert, so it enqueues a regular, non-expedited refresh of the headlines. Hilt builds both workers through <code>HiltWorkerFactory</code>, which <code>NewsApp</code> hands to WorkManager.</p>`,
        code: `@HiltWorker
class ArticleSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val repository: NewsRepository,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val id = inputData.getString(KEY_ID)
        return try {
            if (id != null) repository.refreshArticle(id) else repository.refresh()
            Result.success()
        } catch (e: IOException) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    // Android 11 and lower run expedited work as a foreground service.
    override suspend fun getForegroundInfo() = ForegroundInfo(
        SYNC_NOTIFICATION_ID,
        NotificationCompat.Builder(applicationContext, NewsChannels.DIGEST)
            .setSmallIcon(R.drawable.ic_stat_news)
            .setContentTitle(applicationContext.getString(R.string.syncing))
            .build(),
    )

    companion object {
        private const val KEY_ID = "article_id"
        private const val SYNC_NOTIFICATION_ID = 7

        fun enqueueArticle(context: Context, id: String) =
            enqueue(context, "article-$id", workDataOf(KEY_ID to id), expedited = true)

        fun enqueueHeadlines(context: Context) =
            enqueue(context, "headlines", Data.EMPTY, expedited = false)

        private fun enqueue(context: Context, name: String, input: Data, expedited: Boolean) {
            val request = OneTimeWorkRequestBuilder<ArticleSyncWorker>()
                .setInputData(input)
                .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
                .apply { if (expedited) setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST) }
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork(name, ExistingWorkPolicy.KEEP, request)
        }
    }
}

// NewsRepository gains one method; OfflineFirstNewsRepository implements it.
override suspend fun refreshArticle(id: String) {
    dao.upsertAll(listOf(api.article(id).toEntity()))   // NewsApi: @GET("v1/articles/{id}")
}

// NewsMessagingService.onMessageReceived
when (data["type"]) {
    "breaking" -> {
        val id = data["article_id"] ?: return
        notifier.show(id, data["title"].orEmpty())        // first: visible inside the window
        ArticleSyncWorker.enqueueArticle(this, id)        // then: fetch into Room
    }
    "refresh" -> ArticleSyncWorker.enqueueHeadlines(this)   // normal priority, no alert
    else -> Unit
}

@HiltAndroidApp
class NewsApp : Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().setWorkerFactory(workerFactory).build()

    override fun onCreate() {
        super.onCreate()
        NewsChannels.create(this)
    }
}
// Manifest: remove androidx.work.WorkManagerInitializer from InitializationProvider (tools:node="remove").`,
        remember: 'Post the alert first, then let an expedited, unique worker pull the story into Room.',
        terms: [
          { term: 'Expedited work', def: 'WorkManager work marked with setExpedited() that starts as soon as possible within a quota; an expedited job on Android 12+, a foreground service before that.' },
          { term: 'HiltWorkerFactory', def: 'The WorkerFactory from androidx.hilt that creates @HiltWorker classes with their dependencies; you set it in WorkManager’s Configuration.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start the article fetch now, fall back to normal work without quota, and never run it twice.', code: 'val request = OneTimeWorkRequestBuilder<ArticleSyncWorker>()\n    .setInputData(workDataOf("article_id" to id))\n    .[[setExpedited]](OutOfQuotaPolicy.[[RUN_AS_NON_EXPEDITED_WORK_REQUEST]])\n    .build()\nWorkManager.getInstance(context)\n    .[[enqueueUniqueWork]]("article-$id", ExistingWorkPolicy.KEEP, request)', why: 'Expedited work starts at once while quota lasts; the fallback keeps it from being dropped. A unique name per article makes a repeated message a no-op.' },
          { type: 'bug', prompt: 'The build fails with a Hilt error about this worker. Tap the line.', code: '@HiltWorker\nclass ArticleSyncWorker @Inject constructor(\n    @Assisted context: Context,\n    @Assisted params: WorkerParameters,\n    private val repository: NewsRepository,\n) : CoroutineWorker(context, params) {\n    override suspend fun doWork(): Result = Result.success()\n}', bug: 1, fix: 'class ArticleSyncWorker @AssistedInject constructor(', why: 'WorkManager supplies the Context and WorkerParameters at runtime, so a <code>@HiltWorker</code> needs assisted injection: <code>@AssistedInject</code> on the constructor and <code>@Assisted</code> on those two.' },
        ],
        quiz: [
          { q: 'Why post the notification before the fetch finishes?', options: ['The callback window is short; the fetch can take longer or wait for a network', 'WorkManager can’t post notifications', 'Room needs the notification id first'], a: 0, why: 'Rendering fits the window. Network work goes to WorkManager, which survives the service finishing.' },
          { q: 'FCM delivers the same breaking message twice. What stops a second fetch?', options: ['<code>enqueueUniqueWork("article-&lt;id&gt;", KEEP, ...)</code>', '<code>setExpedited()</code>', 'The network constraint'], a: 0, why: 'KEEP ignores a new request while one with that name is pending or running.' },
          { q: 'On an Android 11 phone the expedited fetch fails with <code>IllegalStateException</code>. Why?', options: ['getForegroundInfo() is not overridden', 'Expedited work needs Android 12', 'Network constraints are not allowed'], a: 0, why: 'Before Android 12, WorkManager runs expedited work as a foreground service and asks the worker for its notification. CoroutineWorker’s default throws.' },
        ],
        mistakes: [
          { title: 'Expedited work without a notification for older phones', bad: 'class ArticleSyncWorker(ctx: Context, params: WorkerParameters) :\n    CoroutineWorker(ctx, params) {\n    override suspend fun doWork(): Result { /* ... */ }\n    // no getForegroundInfo(): fails on Android 11 and lower\n}', good: 'override suspend fun getForegroundInfo() = ForegroundInfo(\n    SYNC_NOTIFICATION_ID,\n    NotificationCompat.Builder(applicationContext, NewsChannels.DIGEST)\n        .setSmallIcon(R.drawable.ic_stat_news)\n        .setContentTitle(applicationContext.getString(R.string.syncing))\n        .build(),\n)', why: 'Testing only on new phones hides it. With minSdk below 31, every expedited worker needs <code>getForegroundInfo()</code>.' },
          { title: 'Expediting the quiet refresh too', bad: '"refresh" -> enqueue(context, "headlines", Data.EMPTY, expedited = true)', good: '"refresh" -> enqueue(context, "headlines", Data.EMPTY, expedited = false)', why: 'Expedited quota is small and shared. A normal-priority message gets no exemption, and spending quota on a background refresh can leave none for the next breaking story.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(5, wait), P = phoneView();
          let online = true, next = 0, freshId = null;
          const room = new Map(FEED.map(s => [s.id, s]));
          const works = []; // { name, state, exp, run }
          const log = logger('The app is in the background. Room holds three stories.');
          const workEl = h('div', { class: 'cs-steps' }), roomEl = h('div', { class: 'cs-steps' });
          const STATE = { ENQUEUED: 'warn', RUNNING: 'on', SUCCEEDED: 'ok' };
          const paint = () => {
            workEl.replaceChildren(...(works.length ? works.slice(-3).map(w => row(mono(w.name), tag(w.state, STATE[w.state]), tag(w.exp ? 'expedited' : 'regular'))) : [tag('no work')]));
            roomEl.replaceChildren(...[...room.values()].slice(-4).map(s => h('div', { class: 'cs-row' + (s.id === freshId ? ' fresh' : '') }, mono(s.id), h('span', {}, s.title))));
          };
          async function runWork(w) {
            w.state = 'RUNNING'; paint(); path.ping('worker');
            await wait(700);
            w.run(); w.state = 'SUCCEEDED'; paint(); path.ping('room');
            if (P.mode() === 'app') P.app('News', feedItems([...room.values()].reverse().slice(0, 4), freshId));
          }
          const sendBreaking = once(async () => {
            const s = ALERTS[next % ALERTS.length]; next++;
            if (P.mode() !== 'app') P.lock();
            await path.run('server', 'app');
            path.ping('notify');
            P.post(alertOf(s));
            const w = { name: `article-${s.id}`, state: 'ENQUEUED', exp: true, run: () => { room.set(s.id, s); freshId = s.id; log.add(`refreshArticle("${s.id}") upserted it. Room’s Flow emits.`, 'ok'); } };
            if (works.some(x => x.name === w.name && x.state !== 'SUCCEEDED')) { log.add('KEEP: that article is already queued.', 'dim'); return; }
            works.push(w); paint();
            log.add('Alert posted, then enqueueArticle(): expedited, unique, needs a network.');
            if (!online) { log.add('Offline: the constraint holds the job in ENQUEUED.', 'wa'); return; }
            await wait(300);
            await runWork(w);
          });
          const sendRefresh = once(async () => {
            await path.run('server', 'app');
            const w = { name: 'headlines', state: 'ENQUEUED', exp: false, run: () => {
              const extra = [{ id: `a-8177${works.length}`, title: 'Rail strike called off', cat: 'Local' }];
              extra.forEach(s => room.set(s.id, s)); freshId = extra[0].id;
              log.add('refresh() wrote new rows. No alert for a refresh.', 'ok');
            } };
            if (works.some(x => x.name === 'headlines' && x.state === 'ENQUEUED')) { log.add('KEEP: a headlines refresh is already pending.', 'dim'); return; }
            works.push(w); paint();
            log.add('type=refresh, normal priority: a regular, non-expedited request.');
            if (!online) { log.add('Offline: it waits for the network.', 'wa'); return; }
            await wait(500);
            await runWork(w);
          });
          const tap = once(async () => {
            if (!P.has() || P.mode() === 'app') { log.add('No alert to tap. Send breaking news first.', 'dim'); return; }
            const n = P.take();
            const s = room.get(n.id);
            await path.run('device', 'app');
            path.ping('link');
            if (s) { P.app('Article', articleBody(s, online ? 'from Room' : 'from Room, offline', 'ok'), { back: true }); log.add('The article was prefetched. It opens at once, even offline.', 'ok'); }
            else { P.app('Article', articleBody({ title: n.title }, 'waiting for network', 'warn'), { back: true }); log.add('Not in Room yet: the title from the alert, the body when the job runs.', 'wa'); }
          });
          const openApp = () => { P.app('News', feedItems([...room.values()].reverse().slice(0, 4), freshId)); log.add('The feed reads Room, newest first.', 'dim'); };
          const net = once(async () => {
            online = !online;
            log.add(online ? 'Back online. Waiting jobs start.' : 'Network off.', online ? 'ok' : 'wa');
            if (online) for (const w of works.filter(x => x.state === 'ENQUEUED')) await runWork(w);
          });
          P.lock(); paint();
          frame(el, path, P, [
            box('WorkManager', workEl),
            box('Room · articles', roomEl),
          ], [
            act('Send breaking (high)', sendBreaking), act('Send refresh (normal)', sendRefresh),
            act('Tap the alert', tap), act('Open the app', openApp), act('Network on/off', net),
          ], log);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'harden',
        title: 'Security hardening',
        tagline: 'Lock down the network and keep every secret on the server.',
        level: 'advanced',
        refs: ['security.network', 'security.secrets', 'security.threats'],
        body: `
<p>Before release we close the obvious holes. <code>network_security_config.xml</code> blocks cleartext and trusts only system CAs. A <code>debug-overrides</code> block lets debug builds trust a user-installed proxy certificate, so you can read your own traffic in development while release builds refuse it. If you pin at all, pin only your own API host in a <code>domain-config</code>, with a backup pin and an expiration date.</p>
<p>Then sort the secrets. The values in <code>google-services.json</code>, like the API key and project id, are identifiers, not secrets. Restrict that key in Cloud Console to your package name and signing certificate. The credential that can send pushes is a service account key. It lives only on your server, which trades it for short-lived OAuth 2.0 tokens to call the HTTP v1 API. The news provider’s key stays there too: the app talks to your backend, and the backend talks to the provider.</p>
<p>Finally, treat pushes and links as input. <code>NewsMessagingService</code> stays <code>exported="false"</code>, so other apps can’t start it; FCM still reaches it through the SDK’s own receiver. The service checks that <code>article_id</code> has the expected shape before it builds a URI, and R8 stays on for release.</p>`,
        code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />   <!-- debuggable builds only -->
        </trust-anchors>
    </debug-overrides>
</network-security-config>

<!-- AndroidManifest.xml -->
<application android:networkSecurityConfig="@xml/network_security_config">
    <service android:name=".push.NewsMessagingService" android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>

// NewsMessagingService: never trust payload text
private val ARTICLE_ID = Regex("[A-Za-z0-9_-]{1,64}")

override fun onMessageReceived(message: RemoteMessage) {
    val data = message.data
    when (data["type"]) {
        "breaking" -> {
            val id = data["article_id"]?.takeIf { ARTICLE_ID.matches(it) } ?: return
            notifier.show(id, data["title"].orEmpty().take(120))
            ArticleSyncWorker.enqueueArticle(this, id)
        }
        "refresh" -> ArticleSyncWorker.enqueueHeadlines(this)
        else -> Unit
    }
}

// Server only, never in the app: the key that can send pushes.
// GoogleCredentials.fromStream(serviceAccountJson)
//     .createScoped("https://www.googleapis.com/auth/firebase.messaging")`,
        remember: 'HTTPS only, user CAs only in debug, the send credential only on the server, and every payload checked.',
        terms: [
          { term: 'Service account', def: 'A Google Cloud identity for servers; its private key lets your backend get OAuth 2.0 tokens to call APIs such as FCM HTTP v1.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Block cleartext, trust system CAs, and trust user CAs in debug builds only.', code: '<network-security-config>\n    <base-config cleartextTrafficPermitted="[[false]]">\n        <trust-anchors><certificates src="[[system]]" /></trust-anchors>\n    </base-config>\n    <[[debug-overrides]]>\n        <trust-anchors><certificates src="user" /></trust-anchors>\n    </debug-overrides>\n</network-security-config>', why: 'Release builds use only the base config. <code>debug-overrides</code> applies only when the app is debuggable.' },
          { type: 'bug', prompt: 'A security review flags the push setup. Tap the line.', code: '<service\n    android:name=".push.NewsMessagingService"\n    android:exported="true">\n    <intent-filter>\n        <action android:name="com.google.firebase.MESSAGING_EVENT" />\n    </intent-filter>\n</service>', bug: 2, fix: '    android:exported="false">', why: 'An exported service can be started by any app with a crafted Intent. FCM delivers through the SDK’s own receiver, so the service doesn’t need to be exported.' },
        ],
        quiz: [
          { q: 'Which of these is fine to ship in the APK?', options: ['The google-services.json API key, restricted to your package and signing certificate', 'The Firebase service account JSON', 'The news provider’s API key'], a: 0, why: 'Firebase API keys identify your project. The service account and the provider key grant power, so they stay on the server.' },
          { q: 'A debug build trusts your proxy’s CA. Does the release build?', options: ['Yes, the CA is installed on the phone', 'No, debug-overrides apply only to debuggable builds'], a: 1, why: 'Release builds ignore user-installed CAs unless the base config trusts them, which it shouldn’t.' },
          { q: 'Why check <code>article_id</code> with a regex before building the URI?', options: ['Payload text is input: a bad value could point the deep link somewhere unexpected', 'FCM corrupts long strings', 'Navigation requires it'], a: 0, why: 'A leaked credential or a buggy server can send anything. Validate the shape before it reaches an Intent.' },
        ],
        mistakes: [
          { title: 'Shipping the credential that sends pushes', bad: '// "Send breaking news" for editors, inside the app\nval auth = GoogleCredentials\n    .fromStream(context.assets.open("service-account.json"))\n    .createScoped("https://www.googleapis.com/auth/firebase.messaging")', good: '// The app asks your server; the server checks the editor and sends\napi.publishBreaking(\n    PublishRequest(articleId, title),\n    session.accessToken,\n)', why: 'Anyone who unzips the APK gets the key and can push anything to every reader. Keep the service account on the server behind your own auth.' },
          { title: 'Building a link from raw payload text', bad: 'val uri = "$ARTICLE_LINK_BASE/\${data["article_id"]}".toUri()', good: 'val id = data["article_id"]?.takeIf { ARTICLE_ID.matches(it) } ?: return\nval uri = "$ARTICLE_LINK_BASE/$id".toUri()', why: 'An id like <code>../account</code> changes the path. Check the shape first, then build the URI.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(6, wait), P = phoneView();
          let debug = false, bad = false;
          const log = logger('A release build. Try each attack.');
          const cfgEl = h('div', { class: 'cs-steps' }), scanEl = h('div', { class: 'cs-steps' });
          const paintCfg = () => cfgEl.replaceChildren(
            row(mono('cleartext'), tag('blocked', 'ok')),
            row(mono('system CAs'), tag('trusted', 'ok')),
            row(mono('user CAs'), debug ? tag('trusted: debug build', 'warn') : tag('ignored', 'ok')),
            row(mono('service'), tag('exported=false', 'ok')));
          const scanRows = () => [
            row(mono('AIza… (google-services)'), tag('public id, restricted', 'ok')),
            bad ? row(mono('assets/service-account.json'), tag('can push to everyone', 'bad')) : row(mono('service account'), tag('not in APK', 'ok')),
            bad ? row(mono('BuildConfig.NEWS_API_KEY'), tag('readable', 'bad')) : row(mono('news provider key'), tag('not in APK', 'ok')),
          ];
          const result = (title, text, cls) => P.app('News', [h('div', { class: 'cs-card ' + cls }, h('b', {}, title), h('span', {}, text)), ...feedItems(FEED.slice(0, 2))]);
          const cleartext = once(async () => {
            path.clear(); path.mark('app', 'hot'); path.ping('netcfg');
            await wait(250);
            path.mark('app', 'fail');
            result('Couldn’t load', 'CLEARTEXT not permitted', 'bad');
            log.add('UnknownServiceException: CLEARTEXT communication to api.example.com not permitted by network security policy', 'er');
            log.add('Good: a stray http:// URL fails instead of leaking.', 'ok');
          });
          const proxy = once(async () => {
            path.clear(); path.mark('app', 'hot'); path.ping('netcfg');
            await wait(250);
            if (debug) { result('Loaded through the proxy', 'debug-overrides trusts the user CA', 'warn'); log.add('Debug build: the proxy’s CA is trusted. You can inspect your own traffic.', 'wa'); }
            else { path.mark('app', 'fail'); result('Couldn’t load', 'certificate not trusted', 'bad'); log.add('SSLHandshakeException: Trust anchor for certification path not found. Release ignores user CAs.', 'ok'); }
          });
          const scan = once(async () => {
            path.clear(); path.ping('creds');
            scanEl.replaceChildren(tag('unzipping…'));
            await wait(500);
            scanEl.replaceChildren(...scanRows());
            log.add(bad ? 'The shortcut build leaks two keys. Anyone can send pushes and spend your quota.' : 'Only identifiers in the APK. The secrets live on the server.', bad ? 'er' : 'ok');
          });
          const foreign = once(async () => {
            path.clear(); path.mark('app', 'hot'); path.ping('svc');
            await wait(250);
            log.add('Another app: startService(Intent("com.google.firebase.MESSAGING_EVENT").setClassName(…))');
            await wait(300);
            log.add('SecurityException: NewsMessagingService is not exported. No fake message gets in.', 'ok');
          });
          const badPayload = once(async () => {
            await path.run('server', 'app');
            log.add('data: { "type": "breaking", "article_id": "../account" }');
            await wait(300);
            log.add('ARTICLE_ID.matches() is false: return. No alert, no URI.', 'ok');
          });
          paintCfg(); scanEl.replaceChildren(tag('not scanned')); P.app('News', feedItems(FEED));
          frame(el, path, P, [
            box('Network security config', cfgEl),
            box('APK scan', scanEl),
          ], [
            act('GET http://api…', cleartext), act('Intercept with a proxy', proxy), act('Unzip the APK', scan),
            act('Another app starts the service', foreign), act('Push with a bad article_id', badPayload),
            toggle('Debug build', false, v => { debug = v; paintCfg(); log.add(v ? 'Debuggable: debug-overrides apply.' : 'Release: base-config only.', 'dim'); }),
            toggle('Shortcut build: keys in the APK', false, v => { bad = v; scanEl.replaceChildren(tag('not scanned')); log.add(v ? 'This build puts the service account and the provider key in the APK.' : 'Keys back on the server.', v ? 'wa' : 'dim'); }),
          ], log);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'release-build',
        title: 'Dev and prod, signed for Play',
        tagline: 'Two Firebase projects, one codebase, and an upload-signed bundle.',
        level: 'advanced',
        refs: ['build.variants', 'build.signing', 'build.bundles'],
        body: `
<p>Testing pushes against real readers is how a test alert reaches a million phones. So we use two Firebase projects. An <code>env</code> flavor dimension gives <code>dev</code>, with <code>applicationIdSuffix = ".dev"</code>, and <code>prod</code>. Each project registers its own package name, and each <code>google-services.json</code> goes in its flavor folder, <code>app/src/dev/</code> or <code>app/src/prod/</code>. The Google services plugin picks the one that matches each variant. A <code>buildConfigField</code> points each flavor at its own backend.</p>
<p>A token belongs to the project that issued it. A dev token sent from the prod project fails with <code>403 SENDER_ID_MISMATCH</code>, so the dev backend uses the dev project’s service account and its own token table. We also switch off <code>devRelease</code>, a variant nobody ships.</p>
<p>For the store we build <code>bundleProdRelease</code>, signed with the upload key from properties outside git. With Play App Signing, Google re-signs what phones install with the app signing key. So that key’s SHA-256 from Play Console goes into <code>assetlinks.json</code> and the API key restriction. The upload key’s fingerprint only matches builds you sign and install yourself.</p>`,
        code: `// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.google.services)
}

android {
    buildFeatures { buildConfig = true }

    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"   // com.example.news.dev, registered in news-dev
            versionNameSuffix = "-dev"
            buildConfigField("String", "API_BASE_URL", "\\"https://api.dev.example.com/\\"")
        }
        create("prod") {
            dimension = "env"             // com.example.news, registered in news-prod
            buildConfigField("String", "API_BASE_URL", "\\"https://api.example.com/\\"")
        }
    }

    signingConfigs {
        create("upload") {
            storeFile = providers.gradleProperty("news.upload.storeFile").orNull?.let(::file)
            storePassword = providers.environmentVariable("UPLOAD_STORE_PASSWORD").orNull
            keyAlias = "upload"
            keyPassword = providers.environmentVariable("UPLOAD_KEY_PASSWORD").orNull
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            signingConfig = signingConfigs.getByName("upload")
        }
    }
}

androidComponents {
    // Nobody ships a dev build to Play.
    beforeVariants(selector().withFlavor("env" to "dev").withBuildType("release")) { it.enable = false }
}

// app/src/dev/google-services.json    -> Firebase project news-dev
// app/src/prod/google-services.json   -> Firebase project news-prod
// ./gradlew :app:bundleProdRelease    -> app/build/outputs/bundle/prodRelease/app-prod-release.aab`,
        remember: 'One Firebase project per environment, one google-services.json per flavor, and the app signing key’s fingerprint wherever Play-installed builds are checked.',
        terms: [
          { term: 'SENDER_ID_MISMATCH', def: 'The FCM error, HTTP 403, returned when a server sends to a registration token that a different Firebase project issued.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add the dev flavor and put its Firebase config in the right folder.', code: 'android {\n    flavorDimensions += "env"\n    productFlavors {\n        create("dev") {\n            [[dimension]] = "env"\n            [[applicationIdSuffix]] = ".dev"\n        }\n        create("prod") { dimension = "env" }\n    }\n}\n// app/src/[[dev]]/google-services.json', why: 'Every flavor needs its dimension. The suffix gives dev its own package, which the dev Firebase project registers, and the flavor folder holds its config.' },
          { type: 'bug', prompt: 'After this change, <code>./gradlew :app:bundleProdRelease</code> says the task doesn’t exist. Tap the line.', code: 'android {\n    flavorDimensions += "env"\n    productFlavors {\n        create("dev") { dimension = "env"; applicationIdSuffix = ".dev" }\n        create("prod") { dimension = "env" }\n    }\n}\nandroidComponents {\n    // Nobody ships a dev build to Play\n    beforeVariants(selector().withBuildType("release")) { it.enable = false }\n}', bug: 9, fix: '    beforeVariants(selector().withFlavor("env" to "dev").withBuildType("release")) { it.enable = false }', why: 'The selector matches every release variant, so <code>prodRelease</code> disappears along with <code>devRelease</code>. Add the flavor to the selector.' },
        ],
        quiz: [
          { q: 'Where does the Google services plugin find the dev variant’s config?', options: ['<code>app/src/dev/google-services.json</code>, or a more specific variant folder', 'Only <code>app/google-services.json</code>', '<code>res/raw/</code>'], a: 0, why: 'The plugin checks variant, flavor and build type folders before <code>app/</code>, so each flavor can carry its own project.' },
          { q: 'Your prod server sends to a token from a dev build. What does FCM answer?', options: ['200, delivered', '403 SENDER_ID_MISMATCH', '404 UNREGISTERED'], a: 1, why: 'The token was issued by news-dev. Only that project’s credentials can send to it.' },
          { q: 'Notification links open the browser for Play installs but your own release build opens the app. Which fingerprint is in <code>assetlinks.json</code>?', options: ['The upload key’s', 'The app signing key’s', 'The debug key’s'], a: 0, why: 'Play-installed apps are signed with the app signing key. Add its SHA-256 from Play Console, and keep the upload key’s too if you also install builds you signed.' },
        ],
        mistakes: [
          { title: 'One Firebase project for testing and production', bad: '// app/google-services.json  (news-prod only)\n// Test sends from your laptop:\n//   topic "news-breaking"  -> every real reader', good: '// app/src/dev/google-services.json   (news-dev)\n// app/src/prod/google-services.json  (news-prod)\n// Test sends use news-dev: real readers never see them', why: 'A topic test in the production project reaches everyone subscribed. Separate projects make that mistake impossible from a dev machine.' },
          { title: 'The upload key in assetlinks.json', bad: '"sha256_cert_fingerprints": [\n  "UPLOAD:KEY:SHA256:..."\n]', good: '"sha256_cert_fingerprints": [\n  "APP:SIGNING:KEY:SHA256:...",\n  "UPLOAD:KEY:SHA256:..."\n]', why: 'Phones verify App Links against the certificate the installed app is signed with. Play installs carry the app signing key, so its fingerprint must be listed.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(7, wait), P = phoneView();
          const V = {
            devDebug: { id: 'com.example.news.dev', json: 'app/src/dev/', proj: 'news-dev', api: 'api.dev.example.com', key: 'debug key', name: 'News Dev', badge: 'DEV' },
            prodDebug: { id: 'com.example.news', json: 'app/src/prod/', proj: 'news-prod', api: 'api.example.com', key: 'debug key', name: 'News', badge: 'DEBUG' },
            prodRelease: { id: 'com.example.news', json: 'app/src/prod/', proj: 'news-prod', api: 'api.example.com', key: 'upload key', name: 'News', badge: null },
          };
          let cur = 'devDebug';
          const log = logger('Pick a variant. devRelease is switched off.');
          const factsEl = h('div', { class: 'cs-steps' }), relEl = h('div', { class: 'cs-steps' });
          const paint = () => {
            const v = V[cur];
            factsEl.replaceChildren(row('applicationId', mono(v.id)), row('config', mono(v.json + 'google-services.json')), row('Firebase', tag(v.proj, v.proj === 'news-dev' ? 'warn' : 'on')), row('API', mono(v.api)), row('signed with', tag(v.key)));
            P.app(v.name, feedItems(FEED), { badge: v.badge });
          };
          const sendFrom = proj => once(async () => {
            const v = V[cur];
            log.add(`${proj} server → token from ${cur}`);
            path.ping('proj');
            if (v.proj !== proj) {
              await path.run('server', 'fcm', { failAt: 'fcm' });
              log.add(`403 SENDER_ID_MISMATCH: this token belongs to ${v.proj}.`, 'er');
              return;
            }
            await path.run('server', 'app');
            P.post(alertOf(ALERTS[0], { text: proj === 'news-dev' ? 'test alert' : null }));
            log.add(`Delivered. ${proj === 'news-dev' ? 'Only dev installs can get this.' : 'Production readers only.'}`, 'ok');
          });
          const bundle = once(async () => {
            path.clear(); path.ping('flavor');
            const steps = [
              ['./gradlew :app:bundleProdRelease', ''],
              ['app-prod-release.aab, signed with the upload key', 'ok'],
              ['Uploaded to Play: upload signature checked', 'ok'],
              ['Play App Signing re-signs the APKs with the app signing key', 'on'],
              ['Copy that SHA-256 into assetlinks.json and the API key restriction', 'warn'],
            ];
            relEl.replaceChildren();
            for (const [text, cls] of steps) {
              relEl.append(h('div', { class: 'cs-row cs-rrow fresh' }, cls ? tag(cls === 'warn' ? 'todo' : 'done', cls) : tag('run'), h('span', {}, text)));
              await wait(450);
            }
            log.add('The bundle is in Play. Phones get APKs signed with the app signing key.', 'ok');
          });
          paint(); relEl.replaceChildren(tag('not built'));
          frame(el, path, P, [box('Variant', factsEl), box('Release', relEl)], [
            seg('Variant', [['devDebug', 'devDebug'], ['prodDebug', 'prodDebug'], ['prodRelease', 'prodRelease']], cur, v => { cur = v; paint(); log.add(`${v}: ${V[v].id}, Firebase ${V[v].proj}`, 'dim'); }),
            act('Prod server sends', sendFrom('news-prod')), act('Dev server sends', sendFrom('news-dev')),
            act('Build the bundle', bundle),
          ], log);
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'ship',
        title: 'Staged rollout and the whole path',
        tagline: 'Roll out in steps, keep old versions working, and watch it all run.',
        level: 'advanced',
        refs: ['build.tracks', 'platform.messages', 'arch.ssot'],
        body: `
<p>Upload the bundle to internal testing, send a breaking alert from the dev project to a dev build, and tap through on a real phone. Then release to production as a staged rollout: 5% first, then 20, 50 and 100 while Android vitals and your push numbers stay calm. If crashes spike, halt it. Phones that already updated keep the new version, so the fix is a release with a higher <code>versionCode</code>.</p>
<p>During a rollout, two app versions read the same pushes for days or weeks. Add payload keys, never rename or reuse them, and keep the <code>else -&gt; Unit</code> branch so older versions ignore types they don’t know. Send <code>appVersion</code> with each token registration, so the server knows which installs can handle a new message type.</p>
<p>That’s the whole app. A story breaks, your server sends one data message to <code>news-breaking</code>, and FCM fans it out. On each phone the service posts the alert on the <code>breaking</code> channel and starts an expedited sync into Room. A tap opens the article with the feed behind it, even offline. Stretch ideas: download a lead image in the worker and show it with <code>BigPictureStyle</code>; group several alerts under a summary notification; send personal alerts for followed stories by token; or export FCM delivery data to BigQuery and compare sends, deliveries and opens.</p>`,
        code: `// Token registration now says which payloads this install understands.
@Serializable
data class DeviceRegistration(
    val token: String,
    val locale: String,
    val appVersion: Int = BuildConfig.VERSION_CODE,   // new in this release
)

// Old and new versions read the same messages during the rollout.
override fun onMessageReceived(message: RemoteMessage) {
    val data = message.data
    when (data["type"]) {
        "breaking" -> {
            val id = data["article_id"]?.takeIf { ARTICLE_ID.matches(it) } ?: return
            notifier.show(id, data["title"].orEmpty().take(120))
            ArticleSyncWorker.enqueueArticle(this, id)
        }
        "refresh" -> ArticleSyncWorker.enqueueHeadlines(this)
        else -> Unit   // a type from a newer server: ignore, never crash
    }
}

// Play Developer API (or Play Console): production at 5%, then raise it.
// PUT .../applications/com.example.news/edits/{editId}/tracks/production
// { "releases": [{ "versionCodes": ["42"], "status": "inProgress", "userFraction": 0.05 }] }
// Halt: "status": "halted".  Finish: "status": "completed", without userFraction.`,
        remember: 'Ship in stages, fix forward, and keep every payload readable by the version before.',
        challenges: [
          { type: 'blank', prompt: 'Ignore unknown message types, and start production at 5%.', code: 'when (data["type"]) {\n    "breaking" -> handleBreaking(data)\n    "refresh" -> ArticleSyncWorker.enqueueHeadlines(this)\n    [[else]] -> Unit\n}\n\n// Play Developer API track release\n// { "versionCodes": ["42"], "status": "[[inProgress]]", "userFraction": [[0.05]] }', why: 'The <code>else</code> branch keeps old versions safe from new types. A staged release is <code>inProgress</code> with a fraction between 0 and 1.' },
          { type: 'bug', prompt: 'The server starts sending <code>"type": "live"</code>. Every phone still on the old version crashes. Tap the line.', code: 'enum class MessageType { BREAKING, REFRESH }\n\noverride fun onMessageReceived(message: RemoteMessage) {\n    val data = message.data\n    val type = MessageType.valueOf(data.getValue("type").uppercase())\n    when (type) {\n        MessageType.BREAKING -> handleBreaking(data)\n        MessageType.REFRESH -> ArticleSyncWorker.enqueueHeadlines(this)\n    }\n}', bug: 4, fix: '    val type = MessageType.entries.firstOrNull { it.name == data["type"]?.uppercase() } ?: return', why: '<code>valueOf</code> throws <code>IllegalArgumentException</code> for a name it doesn’t know. Old versions must treat new types as something to skip.' },
        ],
        quiz: [
          { q: 'During a 20% rollout, version 42 adds a message type <code>"live"</code>. What do phones on version 41 do with it?', options: ['Crash', 'Ignore it through the else branch', 'Show an empty alert'], a: 1, why: 'Version 41 shipped with <code>else -&gt; Unit</code>, so an unknown type is skipped.' },
          { q: 'Why send <code>appVersion</code> when registering a token?', options: ['So the server knows which installs can handle a new payload type', 'FCM needs it to route messages', 'It picks the Firebase project'], a: 0, why: 'FCM doesn’t know your app versions. Your token table does, so the server can target or hold back new types.' },
          { q: 'A reader never granted <code>POST_NOTIFICATIONS</code>. What happens when breaking news is sent?', options: ['Nothing reaches the phone', 'The data message still arrives and the sync runs; only the alert is skipped', '<code>notify()</code> crashes the app'], a: 1, why: 'Delivery doesn’t depend on the permission. <code>BreakingNotifier</code> returns early and the worker still fills Room. Over time FCM may treat that install’s high-priority messages as normal.' },
        ],
        visual(el) {
          const { wait, once } = runner(el);
          const path = pathView(8, wait), P = phoneView();
          const STAGES = [5, 20, 50, 100];
          const ORDER = [3, 17, 8, 12, 0, 19, 6, 14, 10, 1, 15, 4, 9, 18, 2, 7, 13, 11, 5, 16];
          let stage = -1, halted = false, roomHas = false;
          const log = logger('Version 41 is live. Version 42 is uploaded and ready to roll out.');
          const dots = Array.from({ length: 20 }, () => h('span', { class: 'cs-dot' }));
          const statusEl = h('div', { class: 'cs-row' });
          const pct = () => (stage < 0 ? 0 : STAGES[stage]);
          const paint = () => {
            const n = Math.round(pct() / 5);
            ORDER.forEach((d, i) => dots[d].classList.toggle('v42', i < n));
            statusEl.replaceChildren(tag(stage < 0 ? 'not started' : halted ? `halted at ${pct()}%` : pct() === 100 ? 'completed' : `inProgress ${pct()}%`, halted ? 'bad' : stage < 0 ? '' : 'on'));
          };
          const nextStage = () => {
            if (halted) { log.add('Halted. Resume, or upload versionCode 43 with the fix.', 'wa'); return; }
            if (stage >= STAGES.length - 1) { log.add('Already at 100%: the rollout is complete.', 'dim'); return; }
            stage++; paint(); path.ping('play');
            log.add(pct() === 100 ? '"status": "completed". Everyone gets version 42.' : `"userFraction": ${pct() / 100}. Watch Android vitals before the next step.`, 'ok');
          };
          const halt = () => {
            if (stage < 0) { log.add('Nothing to halt yet.', 'dim'); return; }
            if (pct() === 100 && !halted) { log.add('A completed rollout can’t be halted. Fix forward with a new versionCode.', 'wa'); return; }
            halted = !halted; paint();
            log.add(halted ? 'Halted: no new installs of 42. Phones on 42 keep it.' : 'Resumed at the same percentage.', halted ? 'wa' : 'ok');
          };
          const flashDots = (fn) => dots.forEach(d => { d.classList.remove('hit', 'ign'); void d.offsetWidth; fn(d); });
          const sendBreaking = once(async () => {
            P.lock();
            log.add('Server → topic news-breaking, data, priority high');
            await path.run('server', 'app');
            flashDots(d => d.classList.add('hit'));
            P.post(alertOf(ALERTS[0]));
            path.ping('notify');
            log.add('Versions 41 and 42 both post the alert and enqueue the sync.', 'ok');
            await wait(600);
            path.ping('worker'); path.ping('room'); roomHas = true;
            log.add('ArticleSyncWorker put a-81723 into Room.', 'ok');
          });
          const sendLive = once(async () => {
            if (stage < 0) { log.add('No phone has version 42 yet. Start the rollout first.', 'dim'); return; }
            log.add('Server → data { "type": "live", ... }');
            await path.run('server', 'device');
            flashDots(d => d.classList.add(d.classList.contains('v42') ? 'hit' : 'ign'));
            log.add('Version 42 handles it. Version 41 hits else -> Unit and ignores it.', 'ok');
          });
          const tap = once(async () => {
            if (!P.has() || P.mode() !== 'lock') { log.add('No alert to tap. Send breaking news first.', 'dim'); return; }
            P.take();
            await path.run('device', 'app');
            path.ping('link');
            P.app('Article', articleBody(ALERTS[0], roomHas ? 'from Room' : 'loading', roomHas ? 'ok' : 'warn'), { back: true });
            log.add('ArticleList › ArticleDetail(a-81723). Back goes to the feed.', 'ok');
          });
          const rotate = once(async () => {
            log.add('onNewToken → TokenUploadWorker: register with appVersion, re-subscribe topics');
            await path.token();
            path.ping('tokens');
            log.add('The server row now says which version this install runs.', 'ok');
          });
          P.lock(); paint();
          frame(el, path, P, [
            box('Production rollout', statusEl, h('div', { class: 'cs-dots', role: 'img', 'aria-label': 'Twenty phones; filled ones run version 42' }, dots),
              h('div', { class: 'cs-legend' }, h('span', {}, h('i'), 'v41'), h('span', {}, h('i', { class: 'v42' }), 'v42'))),
          ], [
            act('Next rollout stage', nextStage), act('Halt / resume', halt),
            act('Send breaking news', sendBreaking), act('Tap the alert', tap),
            act('Send a v42-only type', sendLive), act('Token rotates', rotate),
          ], log);
        },
      },
    ],
  });
})();
