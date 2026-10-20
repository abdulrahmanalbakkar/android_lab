/* Computer networks track. Same shape as tracks/kotlin.js.
   Beginner networking fundamentals (packets, IP, DNS, TCP/UDP, HTTP, TLS, HTTP versions, latency, debugging),
   each tied back to what happens inside an Android app. Every class is prefixed nw-.
   All IP addresses in demos come from the documentation ranges (RFC 5737) or private ranges (RFC 1918, RFC 6598). */
(() => {
  const { h, sleep, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = html => h('div', { class: 'out', 'aria-live': 'polite', html: html || '' });
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const label = text => h('span', { class: 'nw-label' }, text);
  const pill = (text, cls = '') => h('span', { class: `nw-pill ${cls}` }, String(text));
  const ms = v => `${Math.round(v).toLocaleString('en-US')} ms`;
  // Pressed-state button group. items: [{ label, ... }]
  function picker(name, items, onPick, start = 0) {
    const btns = items.map((it, k) => act(it.label, () => { press(btns, btns[k]); onPick(it, k); }));
    press(btns, btns[start]);
    return h('div', { class: 'controls' }, name ? label(name) : null, btns);
  }
  // On/off toggle button.
  function toggle(text, onChange, on = false) {
    const b = act(text, () => { on = !on; b.setAttribute('aria-pressed', String(on)); onChange(on); }, { 'aria-pressed': String(on) });
    return b;
  }
  // Step player. o.build() returns frames (frame 0 = start), o.paint(frame, i) draws one.
  function player(el, o) {
    let frames = [], i = 0, tok = 0;
    const msg = out('');
    const count = h('span', { class: 'nw-stat' });
    const runB = act('Run', run, { 'aria-pressed': 'false' });
    const stepB = act('Step', () => { tok++; runB.setAttribute('aria-pressed', 'false'); go(i + 1); });
    const resetB = act('Reset', reset);
    function go(n) {
      if (n >= frames.length) return;
      i = n;
      const f = frames[i];
      o.paint(f, i, frames);
      if (f.msg != null) say(msg, f.msg);
      count.textContent = `step ${i} of ${frames.length - 1}`;
      stepB.disabled = runB.disabled = i >= frames.length - 1;
    }
    async function run() {
      const t = ++tok;
      runB.setAttribute('aria-pressed', 'true');
      while (i < frames.length - 1) {
        go(i + 1);
        await sleep(o.speed || 1100);
        if (t !== tok || !el.isConnected) return;
      }
      runB.setAttribute('aria-pressed', 'false');
    }
    function reset() { tok++; runB.setAttribute('aria-pressed', 'false'); frames = o.build(); i = 0; go(0); }
    el.append(...[].concat(o.top || []), h('div', { class: 'nw-stage' }, o.view), h('div', { class: 'controls nw-ctl' }, stepB, runB, resetB, count), msg);
    reset();
    return { reset };
  }
  // A message arrow in a sequence diagram. dir: 'r' (phone to server) or 'l'. lost: stops halfway.
  function arrow(text, dir, cls = '') {
    const line = h('span', { class: 'nw-line' });
    const head = h('span', { class: 'nw-head', 'aria-hidden': 'true' }, cls.includes('nw-lost') ? '✕' : dir === 'r' ? '▶' : '◀');
    const t = h('span', { class: 'nw-msg-t', html: text });
    return h('div', { class: `nw-msg nw-${dir} ${cls}` }, dir === 'r' ? [t, line, head] : [head, line, t]);
  }
  const seqHead = (a = 'Phone', b = 'Server') => h('div', { class: 'nw-seq-head' }, h('span', {}, a), h('span', {}, b));

  const css = `
.nw-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.nw-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.nw-col { display: grid; gap: 6px; align-content: start; min-width: 0; }
.nw-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.nw-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.nw-stat b { color: var(--ink); }
.nw-ctl .cmd:disabled { opacity: 0.45; cursor: default; transform: none; }
.nw-pill { font: 600 0.78rem var(--mono); padding: 3px 9px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.nw-pill.nw-acc { border-color: var(--accent); background: var(--accent-soft); }
.nw-pill.nw-warm { border-color: var(--warm); background: var(--warm-soft); }
.nw-pill.nw-ok { border-color: var(--ok); background: var(--ok-soft); }
.nw-pill.nw-err { border-color: var(--err); background: var(--err-soft); }
.nw-pill.nw-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.nw-big { font: 700 1.5rem var(--display); color: var(--ink); font-variant-numeric: tabular-nums; }
.nw-note { font-size: 0.86rem; color: var(--muted); margin: 0; overflow-wrap: anywhere; }

/* layers + encapsulation */
.nw-split { display: grid; grid-template-columns: minmax(0, 150px) minmax(0, 1fr); gap: 14px; align-items: start; min-width: 0; }
.nw-layers { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; min-width: 0; }
.nw-layers li { font: 600 0.76rem/1.3 var(--mono); padding: 5px 8px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s, color 0.2s; }
.nw-layers li b { display: block; color: var(--ink); font-size: 0.82rem; }
.nw-layers li.nw-on { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); }
.nw-box { border: 2px solid var(--line); border-radius: 10px; padding: 6px; display: grid; gap: 5px; min-width: 0; background: var(--surface); }
.nw-box[data-l="1"] { border-color: var(--warm); }
.nw-box[data-l="2"] { border-color: var(--ok); }
.nw-box[data-l="3"] { border-color: var(--accent); }
.nw-box[data-l="4"] { border-color: var(--ink); border-style: dashed; }
.nw-tag { font: 600 0.7rem/1.35 var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.nw-tag b { color: var(--ink); }
.nw-payload { font: 600 0.78rem/1.4 var(--mono); padding: 6px 8px; border-radius: 7px; background: var(--sunk); color: var(--ink); overflow-wrap: anywhere; }
.nw-payload.nw-enc { color: var(--warm); letter-spacing: 0.04em; }

/* nodes and NAT */
.nw-net { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap: 8px; min-width: 0; }
.nw-node { display: grid; gap: 4px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.nw-node h4 { margin: 0; font: 700 0.9rem var(--display); color: var(--ink); }
.nw-node .nw-ip { font: 600 0.76rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.nw-node .nw-sub { font: 500 0.7rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.nw-node.nw-on { border-color: var(--accent); background: var(--accent-soft); }
.nw-node.nw-bad { border-color: var(--err); background: var(--err-soft); }
.nw-node.nw-good { border-color: var(--ok); background: var(--ok-soft); }
.nw-table { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2px 8px; font: 600 0.72rem var(--mono); color: var(--ink); min-width: 0; }
.nw-table span { overflow-wrap: anywhere; }
.nw-table .nw-th { color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.64rem; }
.nw-tuple { font: 600 0.76rem/1.5 var(--mono); color: var(--ink); overflow-wrap: anywhere; padding: 6px 8px; border-radius: 8px; background: var(--sunk); }

/* DNS hops */
.nw-hops { display: grid; gap: 4px; min-width: 0; }
.nw-hop { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; align-items: center; padding: 6px 10px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.2s; }
.nw-hop b { font: 700 0.84rem var(--display); color: var(--ink); }
.nw-hop small { grid-column: 1 / -1; font: 500 0.72rem/1.35 var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.nw-hop .nw-ms { font: 600 0.74rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.nw-hop.nw-on { border-color: var(--accent); background: var(--accent-soft); }
.nw-hop.nw-hit { border-color: var(--ok); background: var(--ok-soft); }
.nw-hop.nw-dim { opacity: 0.4; }
.nw-caches { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 8px; min-width: 0; }
.nw-cache { padding: 6px 10px; border-radius: 9px; border: 2px dashed var(--line); font: 600 0.74rem/1.5 var(--mono); color: var(--ink); min-width: 0; overflow-wrap: anywhere; }
.nw-cache .nw-th { display: block; color: var(--muted); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.05em; }

/* sequence diagrams */
.nw-seq { display: grid; gap: 5px; min-width: 0; }
.nw-seq-head { display: flex; justify-content: space-between; font: 700 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); padding: 0 2px 4px; border-bottom: 2px solid var(--line); }
.nw-msg { display: flex; align-items: center; gap: 6px; min-width: 0; color: var(--accent); animation: nw-in-r 0.45s ease-out; }
.nw-msg.nw-l { color: var(--ok); animation-name: nw-in-l; }
.nw-msg-t { font: 600 0.74rem/1.35 var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; max-width: 72%; }
.nw-msg.nw-r .nw-msg-t { text-align: left; }
.nw-msg.nw-l .nw-msg-t { text-align: right; }
.nw-line { flex: 1 1 24px; height: 2px; min-width: 16px; background: currentColor; border-radius: 2px; }
.nw-head { font-size: 0.7rem; line-height: 1; }
.nw-msg.nw-lost { color: var(--err); }
.nw-msg.nw-lost .nw-line { flex-grow: 0.45; background: repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 10px); }
.nw-msg.nw-lost .nw-msg-t { text-decoration: line-through; text-decoration-color: var(--err); }
.nw-msg.nw-warmc { color: var(--warm); }
.nw-msg.nw-note-row { color: var(--muted); justify-content: center; }
.nw-msg.nw-note-row .nw-msg-t { max-width: 100%; text-align: center; font-weight: 500; color: var(--muted); }
@keyframes nw-in-r { from { opacity: 0; transform: translateX(-14px); } }
@keyframes nw-in-l { from { opacity: 0; transform: translateX(14px); } }
.nw-slots { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.nw-slot { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 8px; border: 2px dashed var(--line); font: 700 0.84rem var(--mono); color: var(--muted); transition: border-color 0.2s, background 0.2s, color 0.2s; }
.nw-slot.nw-held { border-color: var(--warm); color: var(--warm); background: var(--warm-soft); }
.nw-slot.nw-got { border-style: solid; border-color: var(--ok); color: var(--ink); background: var(--ok-soft); }
.nw-slot.nw-gone { border-color: var(--err); color: var(--err); }

/* certificate chain */
.nw-chain { display: grid; gap: 4px; min-width: 0; }
.nw-cert { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 8px; align-items: center; padding: 6px 10px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.nw-cert b { font: 700 0.8rem var(--mono); color: var(--ink); overflow-wrap: anywhere; }
.nw-cert small { grid-column: 1 / -1; font: 500 0.7rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.nw-cert .nw-mark { font: 700 0.8rem var(--mono); color: var(--muted); }
.nw-cert.nw-good { border-color: var(--ok); background: var(--ok-soft); }
.nw-cert.nw-good .nw-mark { color: var(--ok); }
.nw-cert.nw-bad { border-color: var(--err); background: var(--err-soft); }
.nw-cert.nw-bad .nw-mark { color: var(--err); }
.nw-cert-link { justify-self: center; font: 600 0.66rem var(--mono); color: var(--muted); }

/* waterfall */
.nw-wf { display: grid; grid-template-columns: minmax(0, 92px) minmax(0, 1fr); gap: 5px 8px; align-items: center; min-width: 0; }
.nw-wf-name { font: 600 0.72rem var(--mono); color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nw-wf-track { position: relative; height: 18px; background: var(--sunk); border-radius: 5px; overflow: hidden; min-width: 0; }
.nw-seg { position: absolute; top: 2px; bottom: 2px; width: 0; border-radius: 4px; background: var(--accent); }
.nw-seg.nw-setup { background: var(--warm); }
.nw-seg.nw-stall { background: var(--err); }
.nw-axis { display: flex; justify-content: space-between; font: 500 0.64rem var(--mono); color: var(--muted); }
.nw-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 600 0.72rem var(--mono); color: var(--muted); }
.nw-legend span::before { content: ""; display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; background: var(--c); }

/* RTT simulator + radio strip */
.nw-slider { display: grid; grid-template-columns: minmax(0, 7.5em) minmax(0, 1fr) minmax(0, 5.5em); gap: 8px; align-items: center; font: 600 0.78rem var(--mono); color: var(--ink); min-width: 0; }
.nw-slider input { width: 100%; min-width: 0; accent-color: var(--accent); }
.nw-slider output { text-align: right; font-variant-numeric: tabular-nums; }
.nw-bar { display: flex; height: 26px; border-radius: 7px; overflow: hidden; background: var(--sunk); min-width: 0; }
.nw-bar span { display: grid; place-items: center; min-width: 0; overflow: hidden; white-space: nowrap; font: 700 0.62rem var(--mono); color: var(--ink); background: var(--c); border-right: 1px solid var(--bg); transition: flex-grow 0.35s ease-out; }
.nw-strip { display: grid; grid-template-columns: repeat(60, minmax(0, 1fr)); gap: 1px; height: 30px; min-width: 0; }
.nw-strip i { display: block; border-radius: 2px; background: var(--sunk); transition: background 0.2s; }
.nw-strip i.nw-full { background: var(--err); }
.nw-strip i.nw-low { background: var(--warm); }
.nw-strip i.nw-tx { background: var(--accent); }

/* timing breakdown */
.nw-log { display: grid; gap: 1px; font: 500 0.74rem/1.5 var(--mono); color: var(--code-ink); background: var(--code-bg); border-radius: 10px; padding: 8px 12px; min-height: 3em; min-width: 0; }
.nw-log div { display: flex; gap: 10px; animation: nw-in-r 0.3s ease-out; min-width: 0; }
.nw-log .nw-t { color: var(--t-c); min-width: 4.6em; text-align: right; font-variant-numeric: tabular-nums; }
.nw-log .nw-e { overflow-wrap: anywhere; min-width: 0; }
@media (max-width: 520px) { .nw-split { grid-template-columns: minmax(0, 1fr); } .nw-layers { grid-template-columns: repeat(auto-fit, minmax(min(100%, 112px), 1fr)); } .nw-layers li { overflow-wrap: normal; } .nw-wf { grid-template-columns: minmax(0, 70px) minmax(0, 1fr); } }
`;

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  

  // 2 ─────────────────────────────────────────────
  

  // 3 ─────────────────────────────────────────────
  

  // 4 ─────────────────────────────────────────────
  

  // 5 ─────────────────────────────────────────────
  

  // 6 ─────────────────────────────────────────────
  

  // 7 ─────────────────────────────────────────────
  

  // 8 ─────────────────────────────────────────────
  

  Lab.addTrack({
    id: 'net', lang: 'shell',
    title: 'Computer networks',
    description: 'What happens between your app and a server, step by step: packets, addresses, DNS, TCP and UDP, HTTP, HTTPS, HTTP versions, speed and finding what broke.',
    requires: ['kotlin'],
    css,
    lessons: [
      {
        id: 'what-network',
        title: 'What a network is',
        tagline: 'Computers passing small packets of data, one asking and one answering.',
        goals: ['Say what a network and a packet are', 'Tell the client from the server in a conversation', 'Ask a server for a page with <code>curl</code>'],
        level: 'beginner', introduces: ['curl', 'https'],
        body: `
<p>Ada taps Send on a photo for her friend Sam in Oslo. A second later it is on Sam’s phone. Almost every app does something like this: it sends data to another computer and gets data back. This track shows what happens in between.</p>
<p>A <em>network</em> is a group of computers connected so they can send each other data, by cable or by radio such as Wi-Fi. The internet is a huge network made of many smaller ones. Data does not travel in one big piece. It is cut into small <em>packets</em>, each holding at most about 1,500 bytes of data (roughly 1,500 letters’ worth). Each packet carries a label: where it is going and where it came from. Most packets also carry a number. Packets can take different roads and arrive in any order, and the numbers let the receiver put them back together.</p>
<p>Most conversations on a network have two roles. The <em>client</em> asks: the app on Ada’s phone. The <em>server</em> answers: a computer that is always on, waiting for requests, such as the one that stores the photos. It is a role, not a kind of machine: your laptop can be a server too.</p>
<p>In the terminal, <code>curl</code> is a small client. <code>curl https://example.com</code> asks the server at <code>example.com</code> for its page and prints the answer. The <code>https://</code> at the start says how to talk to the server; the s stands for secure. curl comes with macOS, Linux and Windows 10 or newer. In Windows PowerShell, type <code>curl.exe</code>, because there <code>curl</code> on its own starts a different command.</p>`,
        visual(el) {
          const slots = (list, cls) => h('div', { class: 'nw-slots' }, list.length ? list.map(n => h('span', { class: `nw-slot ${cls}` }, String(n))) : h('span', { class: 'nw-note' }, 'nothing yet'));
          const node = (title, sub, list, cls, on, extra) => h('div', { class: `nw-node${on ? ' nw-on' : ''}` }, h('h4', {}, title), h('span', { class: 'nw-sub' }, sub), slots(list, cls), extra || null);
          const box = h('div', { class: 'nw-net' });
          const stage = h('div', { class: 'ui-stage' }, h('div', { class: 'nw-stage' }, box));
          const frames = [
            { phone: [], net: [], srv: [], msg: 'photo_lisbon.jpg, 3 MB', on: 'phone', say: 'Ada’s app is the <b>client</b>. It wants to send a photo to the <b>server</b> that stores messages for Sam.' },
            { phone: [1, 2, 3, 4], net: [], srv: [], on: 'phone', say: 'The photo is cut into <b>packets</b>. Each one gets a label: to the server, from Ada’s phone, number 1 to 4. (A real photo needs thousands of packets.)' },
            { phone: [2, 4], net: [1, 3], srv: [], on: 'net', say: 'The packets leave one by one. In the network, each packet finds its own way.' },
            { phone: [], net: [4, 2], srv: [3, 1], on: 'srv', say: 'Packet 3 took a quicker road and arrived first. That is normal.' },
            { phone: [], net: [], srv: [3, 1, 4, 2], on: 'srv', say: 'All four are here, in the order they arrived: 3, 1, 4, 2.' },
            { phone: [], net: [], srv: [1, 2, 3, 4], done: true, on: 'srv', say: 'The numbers on the labels let the server put them back in order. The photo is whole again.' },
            { phone: [], net: [], srv: [1, 2, 3, 4], done: true, reply: true, on: 'phone', say: 'The server answers with a small packet: “Saved”. The client asked, the server answered.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'A photo is cut into 4 packets, and they take different roads. In what order do they arrive?',
              options: ['Always 1, 2, 3, 4', 'Maybe mixed up; the receiver puts them back in order', 'All at once, glued together'],
              a: 1,
              why: 'Each packet travels on its own, so a later one can overtake an earlier one. Their numbers let the receiver rebuild the data.',
            },
            draw(f) {
              box.replaceChildren(
                node('Ada’s phone', 'client', f.phone, 'nw-held', f.on === 'phone', f.reply ? pill('Saved', 'nw-ok') : f.msg ? pill(f.msg, 'nw-acc') : null),
                node('Network', 'many roads', f.net, 'nw-held', f.on === 'net'),
                node('Server', 'always on, waiting', f.srv, f.done ? 'nw-got' : 'nw-held', f.on === 'srv', f.done ? pill('photo_lisbon.jpg', 'nw-ok') : null));
            },
          });
        },
        code: `# curl is a client: it asks a server for a page.
curl https://example.com
# The server's answer is printed: the page's text
# (written in HTML, the language of web pages)

# In Windows PowerShell, add .exe:
curl.exe https://example.com`,
        remember: 'Data travels in small numbered packets. The client asks, the server answers.',
        terms: [
          { term: 'network', def: 'Computers connected so they can send each other data. The internet is a network of networks.' },
          { term: 'packet', def: 'A small piece of data with a label saying where it goes and where it came from, usually with a number too.' },
          { term: 'client', def: 'The side that asks, such as an app or <code>curl</code>.' },
          { term: 'server', def: 'The side that waits for requests and answers them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask the server at <code>example.com</code> for its page.', code: '[[curl]] https://example.com', why: '<code>curl</code> is a client: it sends the request and prints the answer.' },
          { type: 'bug', prompt: 'The second command prints <code>curl: (1) Protocol "htps" not supported or disabled in libcurl</code>. Tap the wrong line.', code: 'curl https://example.com\ncurl htps://example.org', bug: 1, fix: 'curl https://example.org', why: 'The address must start with <code>https://</code>. curl did not recognise <code>htps</code>, so it never contacted the server.' },
        ],
        quiz: [
          { q: 'Ada’s app asks for new messages, and a computer in a data centre (a building full of servers) sends them. Which one is the server?', options: ['Ada’s app', 'The computer in the data centre', 'Both are servers'], a: 1, why: 'The server is the side that waits and answers. The app that asks is the client.' },
          { q: 'Why do most packets carry a number?', options: ['So the receiver can put the pieces back in order', 'To make packets travel faster', 'To count how much the data costs'], a: 0, why: 'Packets can arrive in any order. The numbers let the receiver rebuild the original data.' },
          { q: 'Can a laptop be a server?', options: ['No, servers are special machines', 'Yes: any computer that waits for requests and answers them is a server'], a: 1, why: 'Client and server are roles in a conversation, not kinds of machines.' },
        ],
        docs: [['MDN: How does the Internet work?', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work']],
      },

      {
        id: 'ip', ignore: ['::'],
        title: 'Addresses and routing',
        tagline: 'Every device has an address, and routers pass packets along hop by hop.',
        goals: ['Read an IP address', 'Explain what a router does with a packet', 'List the hops to a server with <code>traceroute</code>'],
        level: 'beginner', introduces: ['traceroute', 'tracert'],
        body: `
<p>A letter needs an address on the envelope, or the post office can’t deliver it. A packet is the same. The label on every packet holds two addresses: where it goes and where it came from.</p>
<p>Every device on a network has an <em>IP address</em> (IP stands for Internet Protocol, the rules for addressing packets). The common kind is four numbers from 0 to 255 with dots between them, like <code>192.168.1.23</code>. There is also a newer, longer kind, IPv6, written like <code>2001:db8::1</code>. Most addresses in this track come from ranges set aside for examples, so yours will look different. Addresses starting with <code>192.168.</code> or <code>10.</code> are ranges used inside home and office networks, so your router may really be <code>192.168.1.1</code>.</p>
<p>Ada’s phone has no cable to every server in the world. It hands each packet to a <em>router</em>: the Wi-Fi box at home is one. A router looks at the destination address and passes the packet to the next router that is closer to it, like a signpost at a crossing. Each step from one router to the next is a <em>hop</em>. Reaching a server across the world can take 10 to 20 hops, in a fraction of a second.</p>
<p><code>traceroute example.com</code> lists every hop on the way, on macOS and Linux. On Windows the command is <code>tracert example.com</code>. If Linux says <code>command not found</code>, try <code>tracepath example.com</code>, which is usually installed. Some routers don’t reply to traceroute and show up as <code>* * *</code>. They still pass the packets along.</p>`,
        visual(el) {
          const hops = [
            ['Ada’s laptop', '192.168.1.23', 'the client'],
            ['Home router', '192.168.1.1', 'the Wi-Fi box'],
            ['Provider router', '100.64.0.1', 'her internet provider'],
            ['Silent router', '* * *', 'does not answer traceroute'],
            ['Router far away', '198.51.100.7', 'another network'],
            ['example.com', '203.0.113.10', 'the server'],
          ];
          const route = (upto, ms = {}) => el2 => el2.append(h('div', { class: 'nw-hops' }, hops.map(([n, ip, sub], k) => h('div', { class: `nw-hop${k === upto ? ' nw-on' : ''}${k > upto ? ' nw-dim' : ''}${k === 5 && upto === 5 ? ' nw-hit' : ''}` }, h('b', {}, k ? `${k}. ${n}` : n), h('span', { class: 'nw-ms' }, ms[k] || ''), h('small', {}, `${ip} · ${sub}`)))));
          Lab.ui.terminal(el, {
            panelTitle: 'The route',
            predict: {
              q: 'Hop 3 shows <code>* * *</code> instead of an address. Do Ada’s packets still reach the server?',
              options: ['No, the route is broken at hop 3', 'Yes: that router passes packets on, it only ignores traceroute', 'Only half of them'],
              a: 1,
              why: 'Many routers are set up not to answer traceroute’s test packets. The later hops still answer, so the road through hop 3 works.',
            },
            frames: [
              { panel: route(0), say: 'Ada’s laptop sits at home on Wi-Fi. Which routers do her packets pass on their way to <code>example.com</code>?' },
              { cmd: 'traceroute example.com', out: 'traceroute to example.com (203.0.113.10), 30 hops max, 60 byte packets', panel: route(0), say: 'First traceroute finds the server’s IP address, <code>203.0.113.10</code>. It will try at most 30 hops.' },
              { out: ' 1  192.168.1.1 (192.168.1.1)  1.912 ms  1.801 ms  1.756 ms', panel: route(1, { 1: '1.8 ms' }), say: 'Hop 1 is the home router. traceroute tests each hop three times and prints how long each answer took, in milliseconds (ms, thousandths of a second).' },
              { out: ' 2  100.64.0.1 (100.64.0.1)  8.934 ms  9.102 ms  8.877 ms', panel: route(2, { 1: '1.8 ms', 2: '9 ms' }), say: 'Hop 2 is a router at Ada’s internet provider. Farther away, so the times grow.' },
              { out: ' 3  * * *', panel: route(3, { 1: '1.8 ms', 2: '9 ms', 3: 'no reply' }), say: 'Hop 3 did not answer. Each <code>*</code> is a test with no reply.' },
              { out: ' 4  198.51.100.7 (198.51.100.7)  14.215 ms  14.098 ms  14.330 ms', panel: route(4, { 1: '1.8 ms', 2: '9 ms', 3: 'no reply', 4: '14 ms' }), say: 'Hop 4 answers, so packets did get past hop 3.' },
              { out: ' 5  203.0.113.10 (203.0.113.10)  15.402 ms  15.377 ms  15.519 ms', panel: route(5, { 1: '1.8 ms', 2: '9 ms', 3: 'no reply', 4: '14 ms', 5: '15 ms' }), say: 'Hop 5 is the server itself. Five hops, about 15 ms. To a server on another continent it can be 15 hops and 150 ms.' },
            ],
          });
        },
        code: `# macOS and Linux: list the hops to a server
traceroute example.com
# traceroute to example.com (203.0.113.10), 30 hops max, 60 byte packets
#  1  192.168.1.1 (192.168.1.1)  1.912 ms  1.801 ms  1.756 ms
#  2  100.64.0.1 (100.64.0.1)  8.934 ms  9.102 ms  8.877 ms
#  3  * * *
#  4  198.51.100.7 (198.51.100.7)  14.215 ms  14.098 ms  14.330 ms
#  5  203.0.113.10 (203.0.113.10)  15.402 ms  15.377 ms  15.519 ms

# Windows: the same idea, a slightly different layout
tracert example.com`,
        remember: 'Every device has an IP address. Routers pass each packet one hop closer to its destination.',
        terms: [
          { term: 'IP address', def: 'The number that identifies a device on a network, like <code>192.168.1.23</code>.' },
          { term: 'router', def: 'A device that passes packets on toward their destination. Your Wi-Fi box is one.' },
          { term: 'hop', def: 'One step of a packet’s trip. <code>traceroute</code> prints one line per hop, naming the router (or server) reached.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'On macOS or Linux, list the hops from your computer to <code>example.com</code>.', code: '[[traceroute]] example.com', why: '<code>traceroute</code> prints one line per hop. On Windows the command is <code>tracert</code>.' },
          { type: 'bug', prompt: 'These should all be IP addresses of the common kind. One of them can’t be. Tap it.', code: '192.168.1.1\n203.0.113.10\n192.168.1.300\n10.0.0.2', bug: 2, fix: '192.168.1.30', why: 'Each of the four numbers goes from 0 to 255, so <code>300</code> is not allowed.' },
        ],
        quiz: [
          { q: 'What does a router do with a packet?', options: ['Reads the data inside and answers it', 'Looks at the destination address and passes it one hop closer', 'Stores it until the server asks for it'], a: 1, why: 'A router is a signpost: it only needs the destination address to choose the next hop.' },
          { q: 'A traceroute ends with hop 12 being the server. How many routers did the packets pass before the server?', options: ['11', '12', '13'], a: 0, why: 'Hops 1 to 11 are routers; hop 12 is the server itself.' },
          { q: 'Which command lists the hops on Windows?', options: ['<code>traceroute</code>', '<code>tracert</code>', '<code>curl</code>'], a: 1, why: 'Windows names it <code>tracert</code>. macOS and Linux use <code>traceroute</code>.' },
        ],
        docs: [['MDN: IP address', 'https://developer.mozilla.org/en-US/docs/Glossary/IP_Address']],
      },

      {
        id: 'dns',
        title: 'Names to addresses',
        tagline: 'DNS turns a name like example.com into an IP address, and remembers it.',
        goals: ['Explain what a DNS lookup does', 'Look up a name with <code>nslookup</code>', 'Say why the second lookup is faster'],
        level: 'beginner', introduces: ['nslookup'],
        body: `
<p>You type <code>example.com</code>, not <code>203.0.113.10</code>. People remember names, but packets need IP addresses. So before your app can send anything, it has to find out which address belongs to the name.</p>
<p>That is the job of <em>DNS</em>, the Domain Name System: the internet’s phone book. A <em>DNS lookup</em> asks “what is the address of <code>example.com</code>?”. Your device asks a <em>resolver</em>, a DNS server run by your Wi-Fi router or your internet provider. If the resolver doesn’t know, it asks further DNS servers, step by step, until it reaches the one that is in charge of <code>example.com</code>.</p>
<p>Every answer comes with a <em>TTL</em> (time to live): how many seconds it may be kept. Your phone and the resolver keep answers in a <em>cache</em>, a short-term memory, so the next lookup of the same name takes no time at all.</p>
<p>Try <code>nslookup example.com</code>. It works on macOS, Linux and Windows. If you misspell the name, the answer is <code>NXDOMAIN</code>: no such name exists (Windows writes <code>Non-existent domain</code>).</p>`,
        visual(el) {
          const rows = [['Phone’s cache', 'on the phone itself'], ['Resolver', 'your router or provider'], ['Root servers', 'know where .com is'], ['.com servers', 'know where example.com is'], ['example.com’s DNS server', 'in charge of example.com']];
          const list = h('div', { class: 'nw-hops' });
          const caches = h('div', { class: 'nw-caches' });
          const total = h('div', { class: 'nw-row' });
          const stage = h('div', { class: 'ui-stage' }, h('div', { class: 'nw-stage' }, total, list, caches));
          const A = 'example.com → 203.0.113.10';
          const frames = [
            { on: [], ms: {}, pc: '', rc: '', t: '', say: 'Ada types <code>example.com</code>. Before her phone can connect, it needs the IP address. Both caches are empty.' },
            { on: [0], ms: { 0: 'empty' }, pc: '', rc: '', t: '', say: 'First the phone checks its own cache. Nothing there.' },
            { on: [1], ms: { 0: 'empty', 1: 'not cached' }, pc: '', rc: '', t: '', say: 'It asks the resolver. The resolver has never seen this name either.' },
            { on: [2, 3], ms: { 0: 'empty', 1: 'not cached', 2: '“ask .com”', 3: '“ask example.com’s server”' }, pc: '', rc: '', t: '', say: 'The resolver asks the root servers (the top of DNS, which know who handles <code>.com</code>), which send it to the <code>.com</code> servers, which send it to the server in charge of <code>example.com</code>.' },
            { on: [4], hit: 4, ms: { 0: 'empty', 1: 'not cached', 2: '“ask .com”', 3: '“ask example.com’s server”', 4: '203.0.113.10' }, pc: '', rc: '', t: '', say: 'That server knows: <code>203.0.113.10</code>, and it may be kept for 300 seconds. That is the TTL.' },
            { on: [1], ms: { 0: 'empty', 1: 'saved' }, pc: A + ' (300 s)', rc: A + ' (300 s)', t: '120 ms', say: 'The resolver saves the answer and passes it to the phone, which saves it too. The whole lookup took about 120 ms.' },
            { on: [0], hit: 0, dim: [1, 2, 3, 4], ms: { 0: 'found' }, pc: A + ' (240 s left)', rc: A + ' (240 s left)', t: '0 ms', say: 'A minute later Ada opens the site again. The phone’s cache has the answer: 0 ms, nobody is asked.' },
            { on: [1], hit: 1, dim: [2, 3, 4], ms: { 0: 'empty', 1: 'found' }, pc: '(Sam’s phone: empty)', rc: A + ' (230 s left)', t: '4 ms', say: 'Sam, on the same Wi-Fi, looks up the same name. His phone’s cache is empty, but the shared resolver remembers: 4 ms.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'The first lookup of <code>example.com</code> took 120 ms. One minute later Ada looks it up again (TTL 300 seconds). About how long does it take?',
              options: ['120 ms again', 'Almost 0 ms: the answer is still in the cache', 'Longer, the servers are busier'],
              a: 1,
              why: 'The answer may be kept for 300 seconds. After 60 seconds it is still fresh, so nobody needs to be asked.',
            },
            draw(f) {
              total.replaceChildren(label('lookup time'), h('span', { class: 'nw-big' }, f.t || '…'));
              list.replaceChildren(...rows.map(([n, sub], k) => h('div', { class: `nw-hop${f.hit === k ? ' nw-hit' : f.on.includes(k) ? ' nw-on' : ''}${(f.dim || []).includes(k) ? ' nw-dim' : ''}` }, h('b', {}, n), h('span', { class: 'nw-ms' }, f.ms[k] || ''), h('small', {}, sub))));
              caches.replaceChildren(
                h('div', { class: 'nw-cache' }, h('span', { class: 'nw-th' }, 'phone’s cache'), f.pc || '(empty)'),
                h('div', { class: 'nw-cache' }, h('span', { class: 'nw-th' }, 'resolver’s cache'), f.rc || '(empty)'));
            },
          });
        },
        code: `nslookup example.com
# Server:		192.168.1.1
# Address:	192.168.1.1#53
#
# Non-authoritative answer:
# Name:	example.com
# Address: 203.0.113.10

# The first two lines name the resolver that answered.
# "Non-authoritative" means the resolver passed the answer on;
# it did not come straight from the server in charge of example.com.`,
        remember: 'DNS turns a name into an IP address. Answers are cached for TTL seconds, so repeats are fast.',
        mistakes: [
          { title: 'A typo in the name', bad: `nslookup exmaple.com
# ** server can't find exmaple.com: NXDOMAIN`, good: `nslookup example.com
# Address: 203.0.113.10`, why: 'NXDOMAIN means “no such name”. DNS works fine; the name is wrong. An app shows this as “can’t reach server”, so check the spelling first.' },
        ],
        terms: [
          { term: 'DNS, DNS lookup', def: 'The Domain Name System. A lookup asks it for the IP address that belongs to a name.' },
          { term: 'resolver', def: 'The DNS server your device asks, usually run by your router or internet provider.' },
          { term: 'cache, TTL', def: 'A cache is a short-term memory of answers. The TTL says how many seconds an answer may stay in it.' },
          { term: 'NXDOMAIN', def: 'The DNS answer for a name that does not exist.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Look up the IP address of <code>example.com</code>.', code: '[[nslookup]] example.com', why: '<code>nslookup</code> asks your resolver and prints the address it gets back.' },
          { type: 'bug', prompt: 'Ada wants the address of <code>example.com</code>, but one command prints <code>** server can\'t find exmaple.com: NXDOMAIN</code>. Tap it.', code: 'nslookup example.org\nnslookup exmaple.com', bug: 1, fix: 'nslookup example.com', why: 'The letters <code>m</code> and <code>a</code> are swapped. DNS only knows names that really exist.' },
        ],
        quiz: [
          { q: 'An answer comes with a TTL of 300. What does that mean?', options: ['The server is 300 km away', 'The answer may be kept in a cache for 300 seconds', 'The lookup took 300 ms'], a: 1, why: 'TTL means time to live: how long a cache may keep the answer before asking again.' },
          { q: '<code>nslookup</code> prints <code>NXDOMAIN</code>. What happened?', options: ['The name does not exist', 'The server is down', 'The internet connection is broken'], a: 0, why: 'DNS answered, and the answer was “no such name”. Check the spelling.' },
          { q: 'Why does a DNS lookup happen before the app sends its request?', options: ['Packets need an IP address, not a name', 'To check the password', 'To make the request smaller'], a: 0, why: 'Routers only understand IP addresses, so the name must be turned into one first.' },
        ],
        docs: [['MDN: DNS', 'https://developer.mozilla.org/en-US/docs/Glossary/DNS']],
      },

      {
        id: 'tcp-udp',
        title: 'TCP and UDP',
        tagline: 'Two ways to send packets: carefully and complete, or fast and fire-and-forget.',
        goals: ['Explain what TCP adds: a connection, order and resending', 'Say when UDP is the better choice', 'Read the port number in an address'],
        level: 'beginner', introduces: ['-v', 'localhost'],
        body: `
<p>Packets get lost: a weak Wi-Fi signal, a busy router. For a chat message, every letter must arrive, in order. For a video call, a packet that comes back a second late is useless; the call should keep going. The two main ways of sending packets match these two needs.</p>
<p><em>TCP</em> is the careful one. Before any data, the two sides open a <em>connection</em> with three short messages, the handshake: “can we talk?”, “yes”, “great”. Then every packet is numbered, the receiver confirms what it got, and anything missing is sent again. The app on the other side always gets complete data, in order. Web pages, messages and almost all app traffic use TCP.</p>
<p><em>UDP</em> skips all that: no connection, no confirmations, no resending. Each packet is sent once. UDP packets carry no number for ordering, so the app gets them as they come. That makes it faster, so video calls, online games and DNS lookups use it.</p>
<p>One server can run many programs, so an address alone is not enough. A <em>port</em> number picks the program, like a flat number in a building: 443 for secure web pages, 80 for plain ones, 53 for DNS. <code>curl -v</code> (v for verbose, “tell me everything”) shows the connection being made. <code>localhost</code> is a name that always means your own computer.</p>`,
        visual(el) {
          const seq = h('div', { class: 'nw-seq' });
          const got = h('div', { class: 'nw-slots' });
          const head = h('div', { class: 'nw-row' });
          const stage = h('div', { class: 'ui-stage' }, h('div', { class: 'nw-stage' }, head, seq, h('div', { class: 'nw-row' }, label('the app on the server got'), got)));
          const hs = [['Can we talk?', 'r'], ['Yes, I hear you', 'l'], ['Great', 'r']];
          const frames = [
            { p: 'TCP', m: [], g: [], say: 'Ada’s phone sends three packets to a server with <b>TCP</b>. Watch what happens before the data.' },
            { p: 'TCP', m: hs, g: [], say: 'The handshake opens a connection. It costs one trip there and back before any data moves.' },
            { p: 'TCP', m: [...hs, ['packet 1', 'r'], ['packet 2', 'r', 'nw-lost'], ['packet 3', 'r']], g: [], say: 'Three packets go out. Packet 2 is lost on the way.' },
            { p: 'TCP', m: [...hs, ['packet 1', 'r'], ['packet 2', 'r', 'nw-lost'], ['packet 3', 'r'], ['Got 1 and 3. Where is 2?', 'l']], g: [], hold: true, say: 'The server confirms what arrived. It holds packet 3 back: the app must get the data in order.' },
            { p: 'TCP', m: [...hs, ['packet 1', 'r'], ['packet 2', 'r', 'nw-lost'], ['packet 3', 'r'], ['Got 1 and 3. Where is 2?', 'l'], ['packet 2, sent again', 'r', 'nw-warmc'], ['Got all 3', 'l']], g: [1, 2, 3], say: 'The phone sends packet 2 again. Now the app gets 1, 2, 3: complete, in order, a little later.' },
            { p: 'UDP', m: [['packet 1', 'r'], ['packet 2', 'r', 'nw-lost'], ['packet 3', 'r']], g: [1, '', 3], say: 'Now the same with <b>UDP</b>. No handshake: the packets go out at once. Packet 2 is lost again.' },
            { p: 'UDP', m: [['packet 1', 'r'], ['packet 2', 'r', 'nw-lost'], ['packet 3', 'r'], ['(nobody asks for packet 2)', 'l', 'nw-note-row']], g: [1, '', 3], say: 'Nobody notices and nothing is resent. In a video call that is a tiny glitch, better than freezing to wait.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'With TCP, packet 2 of 3 is lost on the way. What does the app on the server end up with?',
              options: ['Packets 1 and 3 only', 'All three, in order: the missing one is sent again', 'Nothing: the whole connection starts over'],
              a: 1,
              why: 'TCP notices the gap, asks again, and only hands data to the app once it is complete and in order.',
            },
            draw(f) {
              head.replaceChildren(pill(f.p, f.p === 'TCP' ? 'nw-acc' : 'nw-warm'), h('span', { class: 'nw-note' }, f.p === 'TCP' ? 'careful: connection, confirmations, resending' : 'fast: no connection, sent once'));
              seq.replaceChildren(seqHead('Phone', 'Server'), ...f.m.map(([t, d, c]) => arrow(t, d, c || '')));
              got.replaceChildren(...[0, 1, 2].map(k => {
                const v = f.g[k];
                if (f.hold && k === 0) return h('span', { class: 'nw-slot nw-held' }, '1');
                if (f.hold && k === 2) return h('span', { class: 'nw-slot nw-held' }, '3');
                return h('span', { class: `nw-slot${v ? ' nw-got' : f.g.length ? ' nw-gone' : ''}` }, v ? String(v) : f.g.length ? '✕' : '');
              }));
            },
          });
        },
        code: `# -v shows the connection being made (output shortened)
curl -v https://example.com
# * Host example.com:443 was resolved.
# * IPv6: (none)
# * IPv4: 203.0.113.10
# *   Trying 203.0.113.10:443...
# * Connected to example.com (203.0.113.10) port 443
# IPv4/IPv6: the addresses DNS found (this server has no IPv6 one)

# Nothing on your own computer listens on port 8080:
curl http://localhost:8080
# curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server`,
        remember: 'TCP: a connection, every packet confirmed and in order. UDP: sent once, fast. A port picks the program.',
        terms: [
          { term: 'TCP', def: 'A way of sending that opens a connection, confirms every packet and resends lost ones.' },
          { term: 'UDP', def: 'A way of sending without a connection: each packet is sent once, nothing is resent.' },
          { term: 'connection', def: 'An agreement between two sides to exchange data, opened by a handshake.' },
          { term: 'port', def: 'A number that picks a program on a computer, such as 443 for secure web pages.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Secure web pages use one port number. Fill it in.', code: 'curl -v https://example.com\n# * Connected to example.com (203.0.113.10) port [[443]]', why: '443 is the port for <code>https://</code> addresses. Plain <code>http://</code> uses 80.' },
          { type: 'bug', prompt: 'Ada runs a small test server (a program she wrote that answers requests) on her own computer, on port 8080. One command asks the wrong port. Tap it.', code: 'cd projects\ncurl http://localhost:8008', bug: 1, fix: 'curl http://localhost:8080', why: 'The port after <code>:</code> must match the one the server listens on. Nothing answers on 8008.' },
        ],
        quiz: [
          { q: 'A video call loses one packet. Which way of sending fits a call better?', options: ['TCP: wait until the packet is sent again', 'UDP: skip it and keep the call going'], a: 1, why: 'For live audio and video, late data is useless. UDP keeps things moving.' },
          { q: 'What does a port number choose?', options: ['The computer', 'The program on that computer', 'The router'], a: 1, why: 'The IP address finds the computer; the port finds the program on it.' },
          { q: 'Why does TCP cost a little time before the first data moves?', options: ['The handshake must go there and back first', 'TCP packets are bigger', 'The server must restart'], a: 0, why: 'The connection opens with a handshake, one trip there and back, before any data is sent.' },
        ],
        docs: [['MDN: TCP', 'https://developer.mozilla.org/en-US/docs/Glossary/TCP']],
      },

      {
        id: 'http',
        title: 'HTTP',
        tagline: 'The request and the response: how apps and servers talk.',
        goals: ['Name the parts of an HTTP request and response', 'Read status codes like 200 and 404', 'Send a GET and a POST with <code>curl</code>'],
        level: 'beginner', introduces: ['-i', '-d', 'GET', 'POST'], ignore: ['value'],
        body: `
<p>The connection is open. Now the app and the server need a shared language, so the server knows what is being asked. On the web and in almost every app, that language is <em>HTTP</em>.</p>
<p>The client sends a <em>request</em>. Its first line has a <em>method</em> and a path: <code>GET /weather?city=Oslo</code>. <code>GET</code> means “give me this”; <code>POST</code> means “here is something new, store it”. The part after <code>?</code> adds details, here which city. Then come <em>headers</em>, one per line in the form <code>Name: value</code>, with extra information such as which server the request is for.</p>
<p>The server sends back a <em>response</em>. Its first line has a <em>status code</em>: <code>200 OK</code> means it worked, <code>201 Created</code> that something new was stored, <code>404 Not Found</code> that the path doesn’t exist. Codes starting with 2 mean success, 4 a mistake in the request, 5 a problem on the server. Headers follow, such as <code>Content-Type</code>, then a blank line, then the body: the data itself.</p>
<p><code>curl -i</code> prints the response with its headers. <code>curl -v</code> also shows the request, with lines starting <code>&gt;</code> going out and <code>&lt;</code> coming back. <code>curl -d</code> sends data in a POST. Put addresses that contain <code>?</code> in quotes: some terminals treat <code>?</code> as a special character. This lesson uses <code>http://</code> to keep the output short; the next one explains <code>https://</code>. On Windows PowerShell, remember to type <code>curl.exe</code>.</p>`,
        visual(el) {
          const e = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const note = (t, d) => `<p class="nw-note"><b>${t}</b><br>${d}</p>`;
          Lab.ui.terminal(el, {
            panelTitle: 'What you see',
            predict: {
              q: 'Ada asks for <code>/wether</code>, a misspelled path. The server is running fine. What status code comes back?',
              options: ['<code>200 OK</code>', '<code>404 Not Found</code>', '<code>500</code>, a server error'],
              a: 1,
              why: 'The server works; it has nothing at that path. 4xx codes mean the request was wrong.',
            },
            frames: [
              { cmd: 'curl -v "http://example.com/weather?city=Oslo"', out: e('* Host example.com:80 was resolved.\n* IPv6: (none)\n* IPv4: 203.0.113.10\n*   Trying 203.0.113.10:80...\n* Connected to example.com (203.0.113.10) port 80'), panel: note('Lines with *', 'curl telling you what it does: DNS lookup, then a TCP connection to port 80.'), say: 'Ada asks for the weather in Oslo. First the steps from earlier lessons: the address, then the connection.' },
              { out: e('> GET /weather?city=Oslo HTTP/1.1\n> Host: example.com\n> User-Agent: curl/8.5.0\n> Accept: */*\n> '), panel: note('Lines with &gt;: the request', 'Method <code>GET</code>, the path, the HTTP version, then headers. The empty line ends the request.'), say: 'This is the request curl sends. Each header is <code>Name: value</code>. <code>Host</code> says which site the request is for. <code>User-Agent</code> names the client; <code>Accept: */*</code> says any kind of answer is fine.' },
              { out: e('< HTTP/1.1 200 OK'), panel: note('The status line', '<code>200 OK</code>: it worked.'), say: 'The response starts with the status code. 200 means success.' },
              { out: e('< Server: ExampleServer\n< Date: Mon, 19 Oct 2026 09:41:00 GMT\n< Content-Type: application/json\n< Content-Length: 25\n< '), panel: note('Response headers', '<code>Content-Type</code> says what kind of data follows; <code>Content-Length</code> how many bytes (characters) the body has.'), say: 'Response headers describe the answer. <code>application/json</code> is a text format for data that apps read easily.' },
              { out: e('{"city":"Oslo","temp":7}\n* Connection #0 to host example.com left intact'), panel: note('The body', 'The data itself: Oslo, 7 degrees.'), say: 'After the blank line comes the body. curl keeps the connection open in case another request follows.' },
              { cmd: 'curl -i http://example.com/wether', out: e('HTTP/1.1 404 Not Found\nServer: ExampleServer\nDate: Mon, 19 Oct 2026 09:41:00 GMT\nContent-Type: text/plain\nContent-Length: 10\n\nNot found'), panel: note('404 Not Found', 'The server answered fine. There is nothing at <code>/wether</code>.'), say: '<code>-i</code> shows only the response, with its headers. A typo in the path gives 404.' },
              { cmd: 'curl -i -d text=Hi http://example.com/messages', out: e('HTTP/1.1 201 Created\nServer: ExampleServer\nDate: Mon, 19 Oct 2026 09:41:00 GMT\nContent-Type: application/json\nContent-Length: 10\n\n{"id":42}'), panel: note('POST', '<code>-d</code> sends data, so curl uses <code>POST</code>. <code>201 Created</code>: stored as message 42.'), say: 'To send something new, use POST. curl switches to POST by itself when you add <code>-d</code>.' },
            ],
          });
        },
        code: `# Read: GET, response with headers
curl -i "http://example.com/weather?city=Oslo"
# HTTP/1.1 200 OK
# Server: ExampleServer
# Date: Mon, 19 Oct 2026 09:41:00 GMT
# Content-Type: application/json
# Content-Length: 25
#
# {"city":"Oslo","temp":7}

# Send: -d makes it a POST
curl -i -d text=Hi http://example.com/messages
# HTTP/1.1 201 Created
# ...
# {"id":42}`,
        remember: 'A request has a method, a path and headers. A response has a status code, headers and a body.',
        mistakes: [
          { title: 'A ? without quotes', bad: `curl -i http://example.com/weather?city=Oslo
# zsh: no matches found: http://example.com/weather?city=Oslo`, good: `curl -i "http://example.com/weather?city=Oslo"`, why: 'zsh, the program behind the macOS terminal, treats <code>?</code> as a pattern for file names. Quotes pass the address to curl exactly as written. (Other terminals may run the command fine, but the quotes never hurt.)' },
        ],
        terms: [
          { term: 'HTTP, request, response', def: 'HTTP is the language of the web. The client sends a request, the server sends back a response.' },
          { term: 'method', def: 'The first word of a request: <code>GET</code> to read, <code>POST</code> to send something new.' },
          { term: 'status code', def: 'The number at the start of a response: 2xx success, 4xx mistake in the request, 5xx problem on the server.' },
          { term: 'header', def: 'A line of extra information, <code>Name: value</code>, such as <code>Content-Type: application/json</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The server has nothing at the requested path. Fill in the status code.', code: 'HTTP/1.1 [[404]] Not Found', why: '404 means “not found”: the server works, the path does not exist.' },
          { type: 'bug', prompt: 'Ada wants to send a new message, but this request only reads. Tap the wrong line.', code: '> GET /messages HTTP/1.1\n> Host: example.com\n> Content-Length: 7', bug: 0, fix: '> POST /messages HTTP/1.1', why: 'GET reads; sending something new to store is a POST.' },
        ],
        quiz: [
          { q: 'A response starts with <code>HTTP/1.1 500 Internal Server Error</code>. Whose problem is it?', options: ['The request was wrong', 'Something broke on the server', 'The network is down'], a: 1, why: '5xx codes mean the server failed. The network worked: an answer came back.' },
          { q: 'Which method fits “show me today’s weather”?', options: ['<code>GET</code>', '<code>POST</code>'], a: 0, why: 'Reading something is a GET. POST sends something new.' },
          { q: 'What is <code>Content-Type: application/json</code>?', options: ['A header', 'A status code', 'The body'], a: 0, why: 'It has the form <code>Name: value</code>, so it is a header. It describes the body.' },
        ],
        docs: [['MDN: Overview of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview'], ['MDN: HTTP response status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status']],
      },

      {
        id: 'tls',
        title: 'HTTPS and TLS',
        tagline: 'Locking the conversation so only the two ends can read it.',
        goals: ['Explain what encryption and a certificate do', 'Follow a TLS handshake in <code>curl -v</code>', 'Recognise certificate errors'],
        level: 'beginner', introduces: ['-k'],
        body: `
<p>Ada sends a message from café Wi-Fi. On the way, her packets pass the café’s router and many others. Plain HTTP can be read by every one of them, password included. The <code>s</code> in <code>https://</code> fixes that.</p>
<p>HTTPS is HTTP inside <em>TLS</em> (Transport Layer Security). TLS uses <em>encryption</em>: it scrambles the data so that only the two ends hold the key to unscramble it. Everyone in between sees which server Ada talks to, but not what she sends or receives.</p>
<p>But how does the phone know it is really talking to <code>example.com</code> and not a fake? The server shows a <em>certificate</em>: a digital ID card that says “this is example.com”, with an expiry date, signed by a certificate authority, an organisation your device already trusts.</p>
<p>All of this happens in the TLS <em>handshake</em>, right after the TCP connection opens and before any HTTP: hello messages, the certificate, and agreeing on keys. If the certificate is expired, signed by someone unknown, or made for another name, curl stops with error 60 instead of sending anything.</p>`,
        visual(el) {
          const e = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const step = (n, on) => el2 => el2.append(h('div', { class: 'nw-hops' }, ['TCP connection', 'Hello messages, agree on keys', 'Check the certificate', 'Encrypted HTTP'].map((t, k) => h('div', { class: `nw-hop${k < n ? ' nw-hit' : k === n ? ' nw-on' : ' nw-dim'}${on === 'bad' && k === n ? ' nw-dim' : ''}` }, h('b', {}, t), h('span', { class: 'nw-ms' }, k < n ? 'done' : k === n ? (on === 'bad' ? 'failed' : 'now') : ''), h('small', {}, ['port 443, as in lesson 4', 'Client hello, Server hello', 'name, expiry date, who signed it', 'nobody in between can read it'][k])))));
          const fail = el2 => el2.append(h('div', { class: 'nw-chain' }, h('div', { class: 'nw-cert nw-bad' }, h('b', {}, 'Certificate rejected'), h('span', { class: 'nw-mark' }, '✕'), h('small', {}, 'curl stops before sending any HTTP'))));
          const tail = 'More details here: https://curl.se/docs/sslcerts.html';
          Lab.ui.terminal(el, {
            panelTitle: 'TLS steps',
            predict: {
              q: 'A server’s certificate expired yesterday. What does curl do?',
              options: ['Shows the page with a warning at the end', 'Stops before sending the request, with an error', 'Renews the certificate'],
              a: 1,
              why: 'An expired certificate can’t prove who the server is, so curl refuses to talk to it at all.',
            },
            frames: [
              { cmd: 'curl -v "https://example.com/weather?city=Oslo"', out: e('* Host example.com:443 was resolved.\n* IPv6: (none)\n* IPv4: 203.0.113.10\n*   Trying 203.0.113.10:443...\n* Connected to example.com (203.0.113.10) port 443'), panel: step(1), say: 'The same weather request, now with <code>https://</code>. The TCP connection opens on port 443. (Output shortened by removing some lines.)' },
              { out: e('* TLSv1.3 (OUT), TLS handshake, Client hello (1):\n* TLSv1.3 (IN), TLS handshake, Server hello (2):\n* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):'), panel: step(2), say: 'The TLS handshake begins. <code>OUT</code> is what curl sends, <code>IN</code> what it receives. The hellos agree on how to encrypt.' },
              { out: e('* TLSv1.3 (IN), TLS handshake, Certificate (11):\n* TLSv1.3 (IN), TLS handshake, CERT verify (15):\n* TLSv1.3 (IN), TLS handshake, Finished (20):\n* TLSv1.3 (OUT), TLS handshake, Finished (20):\n* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS'), panel: step(2), say: 'The server sends its certificate, and both sides finish the handshake. SSL is the old name of TLS; curl still uses both. The rest of that last line names the encryption methods; you can skip it.' },
              { out: e('* Server certificate:\n*  subject: CN=example.com\n*  start date: Oct 19 14:22:06 2026 GMT\n*  expire date: Jan 17 14:22:06 2027 GMT\n*  subjectAltName: host "example.com" matched cert\'s "example.com"\n*  issuer: O=Example Trust; CN=Example Trust Root CA\n*  SSL certificate verify ok.'), panel: step(3), say: 'The certificate. <code>subject</code> is who it is for, <code>issuer</code> who signed it; <code>CN</code> means name. It is for <code>example.com</code>, valid until January, signed by a certificate authority curl trusts: <code>verify ok</code>.' },
              { out: e('> GET /weather?city=Oslo HTTP/2\n> Host: example.com\n> User-Agent: curl/8.5.0\n> Accept: */*\n> \n< HTTP/2 200 \n< server: ExampleServer\n< date: Mon, 19 Oct 2026 09:41:00 GMT\n< content-type: application/json\n< content-length: 25\n< \n{"city":"Oslo","temp":7}'), panel: step(4), say: 'Only now does HTTP start, encrypted on the way. Over HTTPS this server speaks <code>HTTP/2</code>, a newer version of HTTP that writes header names in lower case. The request and response mean the same as before.' },
              { cmd: 'curl https://old.example.com', clear: true, out: e(`curl: (60) SSL certificate problem: certificate has expired\n${tail}`), panel: fail, say: 'Another server, whose certificate has expired. curl stops: error 60. Not a single HTTP line was sent.' },
              { cmd: 'curl https://shop.example.com', out: e(`curl: (60) SSL: no alternative certificate subject name matches target host name 'shop.example.com'\n${tail}`), panel: fail, say: 'Here the server shows a certificate made for a different name. It might be a fake, so curl stops again. (curl prints a few more lines of advice after each error.)' },
            ],
          });
        },
        code: `# https:// turns on TLS (output shortened)
curl -v https://example.com
# * TLSv1.3 (OUT), TLS handshake, Client hello (1):
# * TLSv1.3 (IN), TLS handshake, Server hello (2):
# * TLSv1.3 (IN), TLS handshake, Certificate (11):
# *  subject: CN=example.com
# *  expire date: Jan 17 14:22:06 2027 GMT
# *  SSL certificate verify ok.

# A server with an expired certificate:
curl https://old.example.com
# curl: (60) SSL certificate problem: certificate has expired`,
        remember: 'HTTPS = HTTP inside TLS: encrypted, and the certificate proves who the server is.',
        mistakes: [
          { title: 'Switching the check off', bad: `curl -k https://old.example.com
# -k skips the certificate check`, good: `curl https://old.example.com
# curl: (60) SSL certificate problem: certificate has expired
# Tell the people who run the server.`, why: '<code>-k</code> makes the error go away by trusting any server, including a fake one. The certificate is the problem; the server needs a new one.' },
        ],
        terms: [
          { term: 'TLS, HTTPS', def: 'TLS encrypts a connection and checks who the server is. HTTPS is HTTP sent inside TLS.' },
          { term: 'encryption', def: 'Scrambling data so only someone with the key can read it.' },
          { term: 'certificate', def: 'A server’s digital ID card: its name, an expiry date, and the signature of a trusted certificate authority.' },
          { term: 'handshake', def: 'The opening messages of a connection. In TLS they agree on keys and check the certificate.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fetch the page with encryption turned on.', code: 'curl [[https]]://example.com', why: 'The <code>s</code> in <code>https</code> means the request travels inside TLS.' },
          { type: 'bug', prompt: 'These commands fetch the weather and log Ada in. One sends her password where every router on the way can read it. Tap it.', code: 'curl https://example.com/weather\ncurl -d password=sesame http://example.com/login', bug: 1, fix: 'curl -d password=sesame https://example.com/login', why: 'With <code>http://</code> the password travels unencrypted. <code>https://</code> puts it inside TLS, so only the server can read it.' },
        ],
        quiz: [
          { q: 'Ada uses HTTPS on café Wi-Fi. What can the café’s router see?', options: ['Everything, including her messages', 'Which server she talks to, but not what she sends or receives', 'Nothing at all'], a: 1, why: 'The router must see the server’s address to pass the packets on, but the contents are encrypted.' },
          { q: 'What does a certificate prove?', options: ['That the server is fast', 'That the server really is the name you asked for', 'That the data has no viruses'], a: 1, why: 'It is an ID card signed by someone your device trusts.' },
          { q: 'When does the TLS handshake happen?', options: ['After the TCP connection opens, before any HTTP', 'After the HTTP response', 'Before the DNS lookup'], a: 0, why: 'Order: DNS, TCP, TLS, then HTTP inside the encrypted connection.' },
        ],
        docs: [['Android: Security with network protocols', 'https://developer.android.com/privacy-and-security/security-ssl']],
      },

      {
        id: 'http-versions',
        title: 'HTTP/1.1, 2 and 3',
        tagline: 'Same requests, faster delivery: sharing one connection, then moving to QUIC.',
        goals: ['Explain why HTTP/1.1 makes requests wait in line', 'Describe multiplexing in HTTP/2', 'Say what HTTP/3 and QUIC change'],
        level: 'beginner', introduces: ['-I', '--http1.1'], ignore: ['time'],
        body: `
<p>One screen of an app can need twenty images. How fast they all arrive depends a lot on which version of HTTP the app and the server speak.</p>
<p>With <em>HTTP/1.1</em>, one connection carries one request at a time: the next one waits until the previous answer is complete. Clients open a few connections side by side to cope, each with its own handshakes. <em>HTTP/2</em> sends many requests over a single connection at the same time, each in its own numbered stream. That is <em>multiplexing</em>: the pieces of different answers travel mixed together and are sorted out at the other end.</p>
<p>HTTP/2 still runs on TCP, and TCP hands over data only in order. If one packet is lost, every stream waits for it to be resent, even streams that had nothing to do with it. <em>HTTP/3</em> runs on <em>QUIC</em> instead, a newer protocol built on UDP that does the resending itself, for each stream separately. QUIC also sets up faster, because it does the connection and TLS handshakes together.</p>
<p>You don’t write requests differently: methods, headers and status codes stay the same. Client and server agree on the version by themselves. <code>curl -I</code> asks only for the status line and the headers, and its first line shows the version. In HTTP/2 the header names are written in lower case.</p>`,
        visual(el) {
          const span = 300;
          const pct = v => `${(v / span) * 100}%`;
          const names = ['image A', 'image B', 'image C'];
          const tracks = names.map(() => h('div', { class: 'nw-wf-track' }));
          const ver = h('div', { class: 'nw-row' });
          const wf = h('div', { class: 'nw-wf' }, names.map((n, k) => [h('span', { class: 'nw-wf-name' }, n), tracks[k]]));
          const legend = h('div', { class: 'nw-legend' }, h('span', { style: '--c: var(--accent)' }, 'downloading'), h('span', { style: '--c: var(--err)' }, 'waiting for a lost packet'));
          const stage = h('div', { class: 'ui-stage' }, h('div', { class: 'nw-stage' }, ver, wf, h('div', { class: 'nw-axis' }, h('span', {}, '0 ms'), h('span', {}, '150 ms'), h('span', {}, '300 ms')), legend));
          const frames = [
            { v: '', rows: [[], [], []], say: 'An app screen needs three images from the same server. Each one takes about 100 ms, mostly waiting for the answer to travel back.' },
            { v: 'HTTP/1.1', rows: [[[0, 100]], [], []], say: '<b>HTTP/1.1</b>, one connection: image A is requested and arrives.' },
            { v: 'HTTP/1.1', rows: [[[0, 100]], [[100, 200]], [[200, 300]]], say: 'B had to wait for A, and C for B. One at a time: 300 ms.' },
            { v: 'HTTP/2', rows: [[[0, 120]], [[0, 120]], [[0, 120]]], say: '<b>HTTP/2</b>: all three go out at once on one connection, in three streams. Done in about 120 ms.' },
            { v: 'HTTP/2, one packet lost', rows: [[[0, 40], [40, 140, 'nw-stall'], [140, 220]], [[0, 40], [40, 140, 'nw-stall'], [140, 220]], [[0, 40], [40, 140, 'nw-stall'], [140, 220]]], say: 'Now a packet of image A is lost. TCP delivers in order, so B and C wait too until it is resent: 220 ms.' },
            { v: 'HTTP/3 (QUIC), one packet lost', rows: [[[0, 40], [40, 140, 'nw-stall'], [140, 220]], [[0, 120]], [[0, 120]]], say: '<b>HTTP/3</b> on QUIC: only image A waits. B and C arrive at 120 ms as if nothing happened.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'With HTTP/2, one packet of image A is lost. What happens to images B and C on the same connection?',
              options: ['They keep arriving normally', 'They wait too, until the lost packet is resent', 'They are downloaded again from the start'],
              a: 1,
              why: 'HTTP/2 runs on TCP, which hands data over only in order. One gap holds up everything behind it.',
            },
            draw(f) {
              ver.replaceChildren(label('version'), f.v ? pill(f.v, 'nw-acc') : pill('none yet', 'nw-ghost'));
              tracks.forEach((t, k) => t.replaceChildren(...f.rows[k].map(([a, b, c]) => h('span', { class: `nw-seg${c ? ' ' + c : ''}`, style: `left:${pct(a)};width:${pct(b - a)}` }))));
            },
          });
        },
        code: `# -I asks only for the status line and headers.
# The first line shows the HTTP version.
curl -I https://example.com
# HTTP/2 200
# content-type: text/html
# ...

# Ask for HTTP/1.1 instead:
curl -I --http1.1 https://example.com
# HTTP/1.1 200 OK
# Content-Type: text/html
# ...`,
        remember: 'HTTP/1.1: one request at a time per connection. HTTP/2: many at once on one TCP connection. HTTP/3: the same on QUIC.',
        terms: [
          { term: 'multiplexing', def: 'Sending many requests and answers at the same time over one connection, each in its own stream.' },
          { term: 'HTTP/2', def: 'The HTTP version that multiplexes requests over a single TCP connection.' },
          { term: 'HTTP/3, QUIC', def: 'HTTP/3 runs on QUIC, a protocol built on UDP that resends lost packets per stream and sets up faster.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask only for the status line and headers, to see which HTTP version the server speaks.', code: 'curl [[-I]] https://example.com\n# HTTP/2 200', why: '<code>-I</code> asks for the headers only, and the first line names the version.' },
          { type: 'bug', prompt: 'One of these statements is wrong. Tap it.', code: 'HTTP/1.1: one request at a time per connection\nHTTP/2: many requests share one connection\nHTTP/2: runs on UDP\nHTTP/3: runs on QUIC', bug: 2, fix: 'HTTP/2: runs on TCP', why: 'HTTP/2 runs on TCP. That is why one lost packet holds up all of its streams.' },
        ],
        quiz: [
          { q: 'What does multiplexing mean in HTTP/2?', options: ['Many requests at once over one connection', 'Sending each request twice', 'Opening one connection per image'], a: 0, why: 'Each request gets its own stream, and all streams share the connection.' },
          { q: 'HTTP/3 runs on which protocol?', options: ['TCP', 'QUIC, built on UDP', 'DNS'], a: 1, why: 'QUIC brings its own resending per stream, on top of UDP.' },
          { q: 'The server switches from HTTP/1.1 to HTTP/2. What changes in the requests you write?', options: ['Every method gets a new name', 'Nothing: methods, headers and status codes stay the same', 'You must add a version header to each request'], a: 1, why: 'The version changes how requests travel, not what they mean.' },
        ],
        docs: [['MDN: Evolution of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP']],
      },

      {
        id: 'latency',
        title: 'Latency and bandwidth',
        tagline: 'Why a fast connection can still feel slow: round trips.',
        goals: ['Tell latency from bandwidth', 'Measure a round trip with <code>ping</code>', 'Count the round trips before a first response'],
        level: 'beginner', introduces: ['ping', '-c'], ignore: ['time', 'limit'],
        body: `
<p>At home on Wi-Fi, Ada’s app opens in a blink. On a train with mobile data, the same screen takes seconds, even though her plan promises a “fast” connection. The word fast hides two different things.</p>
<p><em>Bandwidth</em> is how much data can flow per second, like the width of a pipe. <em>Latency</em> is how long one packet takes to get there, like the length of the pipe. A trip there and back is a <em>round trip</em>, and its time is the RTT (round-trip time). On home Wi-Fi it is often 20 to 30 ms to a nearby server; on mobile data, often 50 to 150 ms, more on a weak signal.</p>
<p>Small requests are limited by round trips, not by bandwidth. Count them for a first request to a new server: one for DNS, one for the TCP handshake, one for TLS, one for the HTTP request and response. Four round trips: about 120 ms on Wi-Fi, 600 ms at 150 ms each. That is why apps reuse open connections and ask for several things in one request.</p>
<p><code>ping</code> sends a tiny packet and times the reply, so it measures the RTT. On macOS and Linux, <code>-c 4</code> stops after 4 packets (c for count). On Windows, <code>ping</code> sends 4 by default.</p>`,
        visual(el) {
          const B = (lane, from, to, label, tone) => ({ lane, from, to, label, tone });
          Lab.ui.timeline(el, {
            lanes: ['Wi-Fi<br>RTT 30 ms', 'Mobile<br>RTT 150 ms'], span: 800, unit: 'ms',
            predict: {
              q: 'A first request needs 4 round trips. On Wi-Fi each takes 30 ms. On mobile data each takes 150 ms, with the same bandwidth. About how long does the request take on mobile?',
              options: ['120 ms, the bandwidth is the same', '600 ms: four round trips of 150 ms', '150 ms, one round trip'],
              a: 1,
              why: 'Every round trip waits for the slow trip there and back. Bandwidth does not help with that.',
            },
            frames: [
              { say: 'The same first request to a new server, on Wi-Fi and on mobile data. Each bar is one round trip.' },
              { bars: [B(0, 0, 30, 'DNS', 'muted'), B(1, 0, 150, 'DNS', 'muted')], say: 'Round trip 1: the DNS lookup. 30 ms on Wi-Fi, 150 ms on mobile.' },
              { bars: [B(0, 30, 60, 'TCP', 'warm'), B(1, 150, 300, 'TCP', 'warm')], say: 'Round trip 2: the TCP handshake.' },
              { bars: [B(0, 60, 90, 'TLS', 'warm'), B(1, 300, 450, 'TLS', 'warm')], say: 'Round trip 3: the TLS handshake. Still no data for the app.' },
              { bars: [B(0, 90, 120, 'GET', 'accent'), B(1, 450, 600, 'GET', 'accent')], marks: [{ at: 600, label: '600 ms', tone: 'err' }], say: 'Round trip 4: the request and its response. Wi-Fi is done at 120 ms; mobile at 600 ms.' },
              { bars: [B(0, 120, 150, 'GET', 'ok'), B(1, 600, 750, 'GET', 'ok')], say: 'A second request on the same open connection needs only one round trip: no DNS, TCP or TLS again. Reusing connections saves a lot on mobile.' },
            ],
          });
        },
        code: `# Linux shown; macOS looks very similar. Windows: ping 192.168.1.1
ping -c 4 192.168.1.1
# PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.
# 64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=2.31 ms
# 64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.87 ms
# 64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=2.05 ms
# 64 bytes from 192.168.1.1: icmp_seq=4 ttl=64 time=1.96 ms
#
# --- 192.168.1.1 ping statistics ---
# 4 packets transmitted, 4 received, 0% packet loss, time 3005ms
# rtt min/avg/max/mdev = 1.874/2.049/2.312/0.164 ms
# icmp_seq numbers the pings. ttl here is a different thing from DNS:
# a hop limit on the packet. Last line: min, average and max time;
# mdev says how much they varied.

# A server on another continent: about 150 ms per round trip
ping -c 4 203.0.113.10
# 64 bytes from 203.0.113.10: icmp_seq=1 ttl=54 time=148 ms
# ...
# rtt min/avg/max/mdev = 148.214/152.674/161.390/5.236 ms`,
        remember: 'Bandwidth is how much per second; latency is how long each trip takes. Small requests wait on round trips.',
        terms: [
          { term: 'bandwidth', def: 'How much data a connection can carry per second.' },
          { term: 'latency', def: 'How long data takes to travel from one end to the other.' },
          { term: 'round trip, RTT', def: 'A trip there and back. The RTT is its time, measured by <code>ping</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'On macOS or Linux, ping the home router exactly 4 times.', code: 'ping [[-c]] 4 192.168.1.1', why: '<code>-c</code> sets the count. Without it, <code>ping</code> keeps going until you press <kbd>Ctrl</kbd>+<kbd>C</kbd> (hold Ctrl and press C, which stops a running command).' },
          { type: 'bug', prompt: 'Ada counts the round trips for a first request to a new server. One line is wrong. Tap it.', code: 'DNS lookup: 1 round trip\nTCP handshake: 1 round trip\nTLS handshake: 1 round trip\nHTTP request and response: 0 round trips', bug: 3, fix: 'HTTP request and response: 1 round trip', why: 'The request goes there and the response comes back: one more round trip, four in total.' },
        ],
        quiz: [
          { q: 'An app makes 30 tiny requests, one after another, on mobile data. What slows it down most?', options: ['Bandwidth', 'Latency: 30 round trips', 'The size of the images'], a: 1, why: 'Tiny requests carry little data. The time goes into waiting for 30 trips there and back.' },
          { q: 'What does <code>ping</code> measure?', options: ['Bandwidth', 'Round-trip time', 'The number of hops'], a: 1, why: 'It times a tiny packet there and back.' },
          { q: 'Why is a second request on an open connection faster than the first?', options: ['It skips the DNS, TCP and TLS round trips', 'The server remembers the answer', 'It uses UDP'], a: 0, why: 'The connection is already set up, so only the request’s own round trip is left.' },
        ],
        docs: [['MDN: Latency', 'https://developer.mozilla.org/en-US/docs/Glossary/Latency']],
      },

      {
        id: 'debugging',
        title: 'Seeing network traffic',
        tagline: 'When a request fails, find out which step broke.',
        goals: ['Match a curl error to the step that failed', 'Tell a network failure from an HTTP error status', 'Explain what a debugging proxy shows'],
        level: 'beginner', introduces: ['--connect-timeout'],
        body: `
<p>Ada’s app shows “Something went wrong”. That tells her nothing. Was the name wrong, the server off, the certificate expired, or did the server answer with an error? Each step of this track fails in its own way, and the error message says which one.</p>
<p>Run the same request with curl and read the error. <code>(6) Could not resolve host</code>: DNS failed, often a typo or no internet at all. <code>(7) Couldn't connect to server</code>: the TCP connection was refused, so nothing listens on that port. <code>(28) Timeout was reached</code>: packets went out but no answer came, for example when a network blocks them. <code>(60) SSL certificate problem</code>: TLS failed. A status code like 404 or 500 is different: the network worked, and the server answered.</p>
<p>To see the traffic itself, <code>curl -v</code> shows every step. For an app, developers use a <em>proxy</em>: a program in the middle that the device sends all its requests through, which records each request and response so you can read them. Android Studio, the program used to build Android apps, has a Network Inspector that shows an app’s requests the same way.</p>
<p><code>--connect-timeout 5</code> tells curl to give up after 5 seconds when no connection is made.</p>`,
        visual(el) {
          const e = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const steps = ['DNS', 'TCP', 'TLS', 'HTTP'];
          const board = (fail, msg) => el2 => el2.append(h('div', { class: 'nw-col' }, h('div', { class: 'nw-row' }, steps.map((s, k) => pill(s, fail < 0 ? 'nw-ghost' : k < fail ? 'nw-ok' : k === fail ? 'nw-err' : 'nw-ghost'))), h('p', { class: 'nw-note', html: msg })));
          const tail = 'More details here: https://curl.se/docs/sslcerts.html';
          Lab.ui.terminal(el, {
            panelTitle: 'Which step failed?',
            predict: {
              q: 'curl prints <code>curl: (6) Could not resolve host: exmaple.com</code>. Which step failed?',
              options: ['DNS', 'TCP', 'TLS', 'HTTP'],
              a: 0,
              why: '“Resolve” means turning the name into an address. The name has a typo, so DNS found nothing.',
            },
            frames: [
              { panel: board(-1, 'Every request goes through these steps in order: DNS, TCP, TLS, then HTTP.'), say: 'Five requests, each failing in a different place. Read the message, then find the step.' },
              { cmd: 'curl https://exmaple.com', out: e('curl: (6) Could not resolve host: exmaple.com'), panel: board(0, '<b>DNS</b>: the name could not be turned into an address. Check the spelling and the internet connection.'), say: 'Error 6: DNS. The name is misspelled.' },
              { cmd: 'curl http://localhost:8080', out: e("curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server"), panel: board(1, '<b>TCP</b>: the computer refused the connection. Nothing is listening on port 8080.'), say: 'Error 7: TCP. Ada forgot to start her test server.' },
              { cmd: 'curl --connect-timeout 5 https://example.com', out: e('curl: (28) Failed to connect to example.com port 443 after 5001 ms: Timeout was reached'), panel: board(1, '<b>TCP</b>, no answer at all: something on the way drops the packets.'), say: 'Error 28: the packets went out and nothing came back within 5 seconds. Here Ada’s network blocks the connection.' },
              { cmd: 'curl https://old.example.com', out: e(`curl: (60) SSL certificate problem: certificate has expired\n${tail}`), panel: board(2, '<b>TLS</b>: the certificate was rejected, so no HTTP was sent.'), say: 'Error 60: TLS. The server needs a new certificate.' },
              { cmd: 'curl -i https://example.com/wether', out: e('HTTP/2 404 \nserver: ExampleServer\ndate: Mon, 19 Oct 2026 09:41:00 GMT\ncontent-type: text/plain\ncontent-length: 10\n\nNot found'), panel: board(3, '<b>HTTP</b>: DNS, TCP and TLS all worked. The server answered 404: the path is wrong.'), say: 'No curl error here. A status code means the network did its job; the request itself needs fixing.' },
            ],
          });
        },
        code: `curl https://exmaple.com
# curl: (6) Could not resolve host: exmaple.com           -> DNS

curl http://localhost:8080
# curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server   -> TCP

curl --connect-timeout 5 https://example.com
# curl: (28) Failed to connect to example.com port 443 after 5001 ms: Timeout was reached   -> TCP: no answer

curl https://old.example.com
# curl: (60) SSL certificate problem: certificate has expired   -> TLS

curl -i https://example.com/wether
# HTTP/2 404      -> the network worked, the path is wrong`,
        remember: 'Find the failing step: DNS (6), TCP (7, 28), TLS (60). A status code means the server answered.',
        terms: [
          { term: 'timeout', def: 'Giving up after waiting a set time for an answer that never came.' },
          { term: 'proxy', def: 'A program in the middle that requests pass through. A debugging proxy records them so you can read them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Which step failed here?', code: 'curl: (6) Could not resolve host: exmaple.com\n# failed step: [[DNS]]', why: 'Resolving a host means a DNS lookup. The name has a typo.' },
          { type: 'bug', prompt: 'Ada’s cheat sheet has one wrong line. Tap it.', code: '(6) Could not resolve host -> DNS\n(7) Couldn\'t connect to server -> TCP\n(60) SSL certificate problem -> HTTP\n404 Not Found -> the server answered', bug: 2, fix: '(60) SSL certificate problem -> TLS', why: 'Certificates are checked in the TLS handshake, before any HTTP is sent.' },
        ],
        quiz: [
          { q: 'curl prints <code>HTTP/1.1 500 Internal Server Error</code>. Did the network work?', options: ['No, the connection failed', 'Yes: DNS, TCP and TLS worked, and the server answered with an error'], a: 1, why: 'Any status code means a response arrived. The problem is inside the server.' },
          { q: 'What does a debugging proxy do?', options: ['Makes requests faster', 'Sits in the middle and records each request and response', 'Fixes broken certificates'], a: 1, why: 'All traffic passes through it, so you can read every request and response.' },
          { q: '<code>curl http://localhost:8080</code> gives error 7. What is the likely cause?', options: ['A typo in the name', 'Nothing is running on port 8080', 'An expired certificate'], a: 1, why: '<code>localhost</code> always resolves, and plain <code>http://</code> has no certificate. The computer refused the connection: no program listens on that port.' },
        ],
        docs: [['Android Studio: Network Inspector', 'https://developer.android.com/studio/debug/network-profiler'], ['curl man page', 'https://curl.se/docs/manpage.html']],
      },
    ],
  });
})();
