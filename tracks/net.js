/* Computer networks track. Same shape as tracks/kotlin.js.
   University-style networking fundamentals (layers, IP, DNS, TCP/UDP, TLS, HTTP versions, latency, debugging),
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
  lessons.push({
    id: 'layers',
    title: 'Layers and packets',
    tagline: 'One API call becomes a stack of headers, each read by a different machine.',
    level: 'beginner',
    body: `
<p>Networks are built in <em>layers</em>. Each layer solves one problem and trusts the layer below it for the rest. The TCP/IP model, written down in RFC 1122, has four: <b>application</b> (HTTP, DNS), <b>transport</b> (TCP, UDP), <b>internet</b> (IP) and <b>link</b> (Wi-Fi, LTE, Ethernet). TLS sits between HTTP and TCP and encrypts what HTTP hands down.</p>
<p>Sending data means <em>encapsulation</em>. Each layer takes what the layer above gave it, adds its own header in front, and passes the bundle down. TCP adds ports and sequence numbers. IP adds source and destination addresses. The link layer adds the address of the next device only. A router opens the bundle down to the IP header, picks the next hop, and wraps it in a fresh link frame. It never reads your HTTP.</p>
<p>So when your app calls <code>api.getHeadlines()</code>, a lot happens below Retrofit: a DNS lookup, a TCP connection, a TLS handshake, then your JSON split into segments, packets and frames. Every later lesson in this track is one of those layers. (For the Retrofit side of the same call, see <a href="#data.net">Retrofit and kotlinx.serialization</a>.) Step through the demo and watch the request get wrapped, then unwrapped on the server.</p>`,
    code: `interface NewsApi {
    @GET("v1/haberler")
    suspend fun headlines(): List<Headline>        // what you write: application layer
}

// One client for the whole app. It owns DNS, sockets, TLS and the connection pool.
val client = OkHttpClient()

val api: NewsApi = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .client(client)
    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(NewsApi::class.java)

// What happens below this one call:
//   DNS:        api.example.com -> 198.51.100.80
//   Transport:  TCP connect to port 443
//   TLS:        handshake, then HTTP bytes go inside encrypted records
//   Internet:   records split into IP packets addressed to 198.51.100.80
//   Link:       each packet framed for Wi-Fi or LTE, one hop at a time
val headlines = api.headlines()`,
    remember: 'Each layer adds a header on the way down and strips it on the way up. Routers read only up to IP.',
    visual(el) {
      const L = [
        { name: 'Application', proto: 'HTTP' },
        { name: 'Security', proto: 'TLS' },
        { name: 'Transport', proto: 'TCP' },
        { name: 'Internet', proto: 'IP' },
        { name: 'Link', proto: 'Wi-Fi / LTE' },
      ];
      const TAGS = [
        null,
        '<b>TLS record</b> · 5 B header · encrypted data · 16 B auth tag',
        '<b>TCP segment</b> · 20 B header · port 51034 → 443 · seq 1',
        '<b>IPv4 packet</b> · 20 B header · 192.168.1.23 → 198.51.100.80 · TTL 64',
        '<b>Wi-Fi frame</b> · phone MAC → router MAC · checksum',
      ];
      const items = L.map(x => h('li', {}, h('b', {}, x.proto), x.name));
      const pkt = h('div', { class: 'nw-col' });
      const view = h('div', { class: 'nw-split' }, h('ol', { class: 'nw-layers', 'aria-label': 'Layers' }, items), pkt);
      let lastDepth = 0;
      player(el, {
        view,
        speed: 1500,
        build: () => [
          { depth: 1, on: 0, where: 'In the app', msg: 'The app builds an HTTP request: a method, a path, headers. To HTTP it is just text. Press Step.' },
          { depth: 2, on: 1, enc: true, msg: 'TLS encrypts the request into a <b>record</b>. Anyone on the path now sees random-looking bytes.' },
          { depth: 3, on: 2, enc: true, msg: 'TCP adds <b>ports</b> (which app on each machine) and a <b>sequence number</b> so the server can put bytes back in order.' },
          { depth: 4, on: 3, enc: true, msg: 'IP adds the <b>source and destination addresses</b>. This is the only header routers need.' },
          { depth: 5, on: 4, enc: true, msg: 'The link layer frames it for <b>one hop</b>: phone to Wi-Fi router. Then it goes out as radio waves.' },
          { depth: 5, on: 3, enc: true, hop: true, where: 'After the first router', msg: 'At the router: the Wi-Fi frame is thrown away, IP <b>TTL</b> drops to 63, a new frame is built for the next hop. TCP, TLS and HTTP are not touched. (Home routers also rewrite the source address: see the next lesson.)' },
          { depth: 1, on: 0, where: 'At the server', msg: 'At the server each layer strips its own header in reverse: link, IP, TCP (puts segments in order), TLS (decrypts). HTTP sees the exact text the app sent.' },
        ],
        paint(f) {
          items.forEach((li, k) => li.classList.toggle('nw-on', k === f.on));
          let node = h('div', { class: `nw-payload ${f.enc ? 'nw-enc' : ''}` }, f.enc ? '17 03 03 00 a1 · 9f 3c e0 71 b4 0d … (ciphertext)' : 'GET /v1/haberler HTTP/1.1  Host: api.example.com  Accept: application/json');
          for (let k = 1; k < f.depth; k++) {
            let tag = TAGS[k];
            if (f.hop && k === 3) tag = '<b>IPv4 packet</b> · 20 B header · 203.0.113.7 → 198.51.100.80 · TTL 63';
            if (f.hop && k === 4) tag = '<b>Fiber frame</b> · router → next router · new checksum';
            node = h('div', { class: 'nw-box', 'data-l': String(k) }, h('div', { class: 'nw-tag', html: tag }), node);
            if (k === f.depth - 1 && (f.depth > lastDepth || f.hop)) node.classList.add('drop-in');
          }
          lastDepth = f.depth;
          pkt.replaceChildren(label(f.where || 'On the wire'), node);
        },
      });
    },
    deeper: [
      {
        title: 'Why layers at all',
        body: `<p>Layers let each piece change on its own. Your phone moves from Wi-Fi to LTE and the link layer changes completely, but IP, TCP and HTTP do not care. Servers moved from HTTP/1.1 to HTTP/2 without any router being replaced. The rule that makes this work: a layer only talks to the same layer on the other side, through the services of the layer below.</p>
<p>The older OSI model has seven layers. Courses still use its numbers ("a layer 4 load balancer" means it works on TCP/UDP, "layer 7" means it reads HTTP). The internet itself runs on the four-layer TCP/IP model.</p>`,
      },
      {
        title: 'Overhead: headers cost bytes',
        body: `<p>Every packet pays for its headers. IPv4 and TCP headers are at least 20 bytes each, and TLS adds a few bytes per record plus an authentication tag. A packet on most links carries up to about 1500 bytes, so a large download is mostly payload. A tiny request like an analytics ping is mostly headers, and HTTP headers (cookies, user agent, auth tokens) are often bigger than the JSON body.</p>
<p>That is one reason to batch many small events into one request: you pay the header cost once.</p>`,
      },
      {
        title: 'Where your Android code sits',
        body: `<p>Your code lives at the application layer. OkHttp handles HTTP framing, TLS (through the platform's security provider) and connection reuse. The Android kernel runs TCP and IP. The modem and Wi-Fi chip run the link layer. You never build a TCP header, but you see each layer in errors: <code>UnknownHostException</code> is DNS, <code>ConnectException</code> and <code>SocketTimeoutException</code> are TCP, <code>SSLHandshakeException</code> is TLS, and a 500 status is HTTP.</p>`,
        code: `try {
    api.headlines()
} catch (e: UnknownHostException) {      // DNS: name did not resolve (often: offline)
} catch (e: SSLHandshakeException) {     // TLS: certificate or protocol problem
} catch (e: SocketTimeoutException) {    // TCP: connect or read took too long
} catch (e: IOException) {               // other transport failures
} catch (e: HttpException) {             // HTTP: server answered with 4xx or 5xx
}`,
      },
    ],
    underHood: {
      body: `<p>On the phone, OkHttp writes bytes into a socket. The kernel's TCP stack cuts them into segments sized to fit the path (the MSS: about 1460 bytes on a typical 1500-byte link), keeps a copy of each until it is acknowledged, and hands them to IP. IP picks the interface from the routing table (Wi-Fi or cellular) and the driver frames them. Receiving runs the same path backwards, and the kernel only wakes your read when bytes arrive in order.</p>`,
    },
    mistakes: [
      {
        title: 'Treating every IOException the same',
        bad: 'catch (e: IOException) {\n    showError("Server error")\n}',
        good: 'catch (e: UnknownHostException) {\n    showError("No connection")\n} catch (e: IOException) {\n    showError("Network problem, try again")\n}',
        why: 'An <code>IOException</code> means the request never got a full HTTP answer, so it is a network problem, not a server error. Knowing which layer failed lets you show the right message and decide whether a retry makes sense.',
      },
    ],
    terms: [
      { term: 'Encapsulation', def: 'Wrapping data from a higher layer with a lower layer’s header, layer by layer, on the way down.' },
      { term: 'TCP/IP model', def: 'The four-layer model the internet uses: application, transport, internet, link (RFC 1122).' },
      { term: 'Packet', def: 'A unit of data with an IP header. Routers forward packets one at a time, independently.' },
      { term: 'TTL', def: 'Time to live: a counter in the IP header that each router decrements, so lost packets do not loop forever.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fill in the layer that adds each header.', code: '// ports and sequence numbers -> [[TCP|transport]]\n// source and destination address -> [[IP|internet]]\n// encryption of the HTTP bytes -> [[TLS]]', why: 'TCP (transport) adds ports and sequence numbers, IP (internet) adds addresses, and TLS encrypts what HTTP hands down.' },
      { type: 'bug', prompt: 'The comment says which layer failed. One comment is wrong. Tap it.', code: 'try { api.headlines() }\ncatch (e: UnknownHostException) { } // DNS could not resolve the name\ncatch (e: SSLHandshakeException) { } // TLS handshake failed\ncatch (e: HttpException) { } // the TCP connection was refused', bug: 3, fix: 'catch (e: HttpException) { } // the server answered with an HTTP error status', why: 'Retrofit throws <code>HttpException</code> when a full HTTP response came back with a non-2xx code. A refused TCP connection is a <code>ConnectException</code>.' },
    ],
    quiz: [
      { q: 'A packet crosses three routers between your phone and the server. Which header do the routers read to forward it?', options: ['The HTTP request line', 'The IP header', 'The TLS record header', 'The TCP header'], a: 1, why: 'Routers work at the internet layer. They read the destination IP address and pick the next hop. Everything above IP is just payload to them.' },
      { q: 'Put the sending side in order for one HTTPS request.', options: ['HTTP → TLS → TCP → IP → link', 'IP → TCP → TLS → HTTP → link', 'HTTP → TCP → TLS → IP → link', 'link → IP → TCP → TLS → HTTP'], a: 0, why: 'Encapsulation goes down the stack. HTTP text is encrypted by TLS, TCP carries the TLS records, IP addresses the segments, and the link layer frames each packet.' },
      { q: 'Your phone switches from Wi-Fi to LTE. Which layer changes completely?', options: ['Application', 'Transport', 'Link', 'None of them'], a: 2, why: 'Wi-Fi and LTE are different link layers with different frames and radios. The layers above stay the same protocols, even though, as the next lesson shows, the IP address changes too.' },
      { q: 'A tiny analytics event of 40 bytes is sent as its own HTTPS request. What is true?', options: ['Most bytes on the wire are headers, not the event', 'Headers are compressed away, so only 40 bytes travel', 'TCP merges it with other apps’ data', 'IP removes HTTP headers to save space'], a: 0, why: 'IP, TCP and TLS overhead plus HTTP headers easily reach hundreds of bytes, so a 40-byte event is a small part of the packet. Batching events spreads that cost.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  lessons.push({
    id: 'ip-routing',
    title: 'IP addresses, NAT and switching networks',
    tagline: 'Your phone’s address is private, shared, and changes when you walk out the door.',
    level: 'beginner',
    body: `
<p>Every device on the internet is reached through an <b>IP address</b>. IPv4 addresses are 32 bits (<code>198.51.100.80</code>), which gives about 4 billion, too few for every phone. IPv6 addresses are 128 bits (<code>2001:db8::1</code>) and do not run out. Many mobile networks give phones an IPv6 address, often next to an IPv4 one.</p>
<p>The IPv4 shortage is solved with <b>NAT</b>. Your home router gives the phone a <em>private</em> address such as <code>192.168.1.23</code> (RFC 1918 reserves 10/8, 172.16/12 and 192.168/16 for this). When a packet leaves, the router rewrites the source to its one <em>public</em> address and a free port, and remembers the mapping so replies find their way back. Mobile carriers do the same at a larger scale (carrier-grade NAT), often with addresses from <code>100.64.0.0/10</code>.</p>
<p>A TCP connection is identified by four values: source IP, source port, destination IP, destination port. When you walk out of Wi-Fi onto cellular, your address changes, so the old connections stop matching and die. Android moves the <em>default network</em> and later closes connections on the old one. Your app has to open new ones; long-lived streams like the ones in <a href="#data.realtime">real-time updates</a> must reconnect themselves. Try it in the demo.</p>`,
    code: `// Watch the default network instead of polling "am I online?"
val cm = context.getSystemService(ConnectivityManager::class.java)

val callback = object : ConnectivityManager.NetworkCallback() {
    override fun onAvailable(network: Network) {
        // A new default network. Wait for capabilities before deciding anything.
    }

    override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {
        val online = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        val unmetered = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)
        _network.value = NetState(online, unmetered)   // e.g. pause big prefetches on metered
    }

    override fun onLost(network: Network) {
        _network.value = NetState(online = false, unmetered = false)
    }
}

cm.registerDefaultNetworkCallback(callback)
// ... and cm.unregisterNetworkCallback(callback) when you no longer need it`,
    remember: 'A connection is pinned to four values: two addresses, two ports. Change networks and you need new connections.',
    visual(el) {
      const NETS = {
        wifi: { name: 'Wi-Fi', phone: '192.168.1.23', natName: 'Home router (NAT)', pub: '203.0.113.7', sub: 'private range 192.168.0.0/16' },
        cell: { name: 'Cellular', phone: '100.64.23.7', natName: 'Carrier NAT', pub: '192.0.2.44', sub: 'shared range 100.64.0.0/10' },
      };
      let net = 'wifi', conn = null, port = 40112, tok = 0;
      const phoneIp = h('span', { class: 'nw-ip' }), phoneSub = h('span', { class: 'nw-sub' });
      const natTitle = h('h4', {}), natIp = h('span', { class: 'nw-ip' });
      const table = h('div', { class: 'nw-table' });
      const phone = h('div', { class: 'nw-node' }, h('h4', {}, 'Phone'), phoneIp, phoneSub);
      const nat = h('div', { class: 'nw-node' }, natTitle, natIp, table);
      const server = h('div', { class: 'nw-node' }, h('h4', {}, 'api.example.com'), h('span', { class: 'nw-ip' }, '198.51.100.80:443'), h('span', { class: 'nw-sub' }, 'public address'));
      const tuple = h('div', { class: 'nw-tuple' }, 'No connection yet.');
      const netPill = pill('', 'nw-acc');
      const msg = out('Open a connection to see how NAT rewrites your address.');
      function paint() {
        const n = NETS[net];
        phoneIp.textContent = n.phone; phoneSub.textContent = `${n.name} · ${n.sub}`;
        natTitle.textContent = n.natName; natIp.textContent = `public ${n.pub}`;
        netPill.textContent = `default network: ${n.name}`;
        table.replaceChildren(h('span', { class: 'nw-th' }, 'inside'), h('span', { class: 'nw-th' }, 'outside'),
          ...(conn && conn.net === net ? [h('span', {}, `${n.phone}:51034`), h('span', {}, `${n.pub}:${conn.port}`)] : [h('span', {}, '—'), h('span', {}, '—')]));
        if (!conn) tuple.textContent = 'No connection yet.';
        else {
          const c = NETS[conn.net];
          tuple.innerHTML = `TCP connection (as the server sees it):<br>${c.pub}:${conn.port} → 198.51.100.80:443 ${conn.dead ? '<span class="bad">· dead</span>' : '<span class="good">· open</span>'}`;
        }
      }
      const flash = (node, cls) => { node.classList.add(cls); setTimeout(() => node.classList.remove(cls), 900); };
      async function open() {
        const t = ++tok;
        conn = { net, port: port++, dead: false };
        flash(phone, 'nw-on'); paint();
        say(msg, `Phone sends SYN from <b>${NETS[net].phone}:51034</b>. A private address can’t be routed on the internet…`);
        await sleep(900); if (t !== tok || !el.isConnected) return;
        flash(nat, 'nw-on');
        say(msg, `…so the ${NETS[net].natName} rewrites the source to <b>${NETS[net].pub}:${conn.port}</b> and stores the mapping. Replies to that port go back to your phone.`);
        await sleep(900); if (t !== tok || !el.isConnected) return;
        flash(server, 'nw-good');
        say(msg, `Connected. The server only ever sees the public address. Now press <b>Send request</b>, or walk outside.`);
      }
      async function send() {
        if (!conn) return open();
        const t = ++tok;
        if (conn.dead) {
          flash(phone, 'nw-bad');
          say(msg, '<span class="bad">Request failed.</span> The connection belonged to the old network and was closed. OkHttp can retry on a <b>new</b> connection; an app that holds raw sockets (a WebSocket, a chat stream) must reconnect itself.');
          return;
        }
        flash(phone, 'nw-on'); await sleep(500); if (t !== tok || !el.isConnected) return;
        flash(server, 'nw-good');
        say(msg, `<span class="good">200 OK</span> over the existing connection. No new handshake was needed.`);
      }
      function walk() {
        tok++;
        net = net === 'wifi' ? 'cell' : 'wifi';
        if (conn && conn.net !== net) conn.dead = true;
        flash(phone, 'nw-on'); paint();
        say(msg, `New default network: <b>${NETS[net].name}</b>, new address <b>${NETS[net].phone}</b>. ${conn ? 'Packets from the new address don’t match the old connection’s four values, and Android closes connections on the old network. <span class="bad">The connection is dead.</span>' : 'Nothing was open, so nothing broke.'}`);
      }
      function reconnect() { conn = null; paint(); open(); }
      el.append(
        h('div', { class: 'nw-stage' }, h('div', { class: 'nw-row' }, netPill), h('div', { class: 'nw-net' }, phone, nat, server), tuple),
        h('div', { class: 'controls' }, act('Open connection', open), act('Send request', send), act('Walk outside (switch network)', walk), act('Reconnect', reconnect)),
        msg);
      paint();
    },
    deeper: [
      {
        title: 'Routing: one hop at a time',
        body: `<p>No device knows the whole path. Each router has a <em>routing table</em> that maps address prefixes to a next hop, and picks the longest prefix that matches the destination. Your phone's table is tiny: local network directly, everything else to the default gateway. Backbone routers learn routes from each other with BGP. Each hop is independent, so two packets of the same download can take different paths and arrive out of order. TCP fixes the order.</p>`,
      },
      {
        title: 'IPv6 and Happy Eyeballs',
        body: `<p>With IPv6 there is no address shortage, so phones get globally routable addresses and NAT is not needed for that reason. Many carriers run IPv6-only networks and translate to IPv4 servers at the edge (NAT64). A server can have both an IPv4 (A record) and an IPv6 (AAAA record) address. Clients race them: start one, start the other a moment later if the first is slow, keep whichever connects first. This is called <em>Happy Eyeballs</em> (RFC 8305), and it hides broken IPv6 paths from users.</p>`,
      },
      {
        title: 'Emulator addresses',
        body: `<p>The Android emulator has its own private network. Inside it, <code>10.0.2.2</code> is an alias for your computer's loopback (127.0.0.1), and <code>10.0.2.3</code> is the first DNS server. So a backend running on your laptop at <code>localhost:8080</code> is reached from the emulator at <code>http://10.0.2.2:8080</code>, not <code>localhost</code>, which would mean the emulator itself.</p>`,
        code: `// debug build only: talk to the server running on your laptop
val baseUrl = if (BuildConfig.DEBUG) "http://10.0.2.2:8080/" else "https://api.example.com/"`,
      },
    ],
    mistakes: [
      {
        title: 'Assuming Wi-Fi means free and fast',
        bad: 'val isWifi = caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)\nif (isWifi) prefetchAllVideos()',
        good: 'val unmetered = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)\nif (unmetered) prefetchAllVideos()',
        why: 'A phone hotspot is Wi-Fi but bills the user. Android’s docs say to check <code>NET_CAPABILITY_NOT_METERED</code> rather than the transport type, and to read bandwidth from the capabilities instead of guessing.',
      },
      {
        title: 'Calling localhost from the emulator',
        bad: 'val baseUrl = "http://localhost:8080/"',
        good: 'val baseUrl = "http://10.0.2.2:8080/"',
        why: 'Inside the emulator, <code>localhost</code> is the emulator. <code>10.0.2.2</code> is the alias for your computer’s loopback. Cleartext HTTP also needs a debug network security config if the app targets Android 9 (API 28) or higher.',
      },
    ],
    terms: [
      { term: 'NAT', def: 'Network address translation: a router rewrites private source addresses and ports to its public address, and maps replies back.' },
      { term: 'Private address', def: 'An address from a range reserved for local networks (10/8, 172.16/12, 192.168/16) that is not routed on the public internet.' },
      { term: 'Default network', def: 'The network Android uses for new connections; it can change at any time, for example from cellular to validated Wi-Fi.' },
      { term: 'Four-tuple', def: 'Source IP, source port, destination IP and destination port: the values that identify one TCP connection.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'React when the default network changes.', code: 'cm.[[registerDefaultNetworkCallback]](object : ConnectivityManager.NetworkCallback() {\n    override fun [[onLost]](network: Network) {\n        _online.value = false\n    }\n})', why: '<code>registerDefaultNetworkCallback</code> tracks whichever network is the default. <code>onLost</code> runs when that network stops being the default.' },
      { type: 'bug', prompt: 'This app prefetches large videos on networks that bill the user. Tap the broken line.', code: 'override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {\n    val validated = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)\n    val free = caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)\n    if (validated && free) prefetch()\n}', bug: 2, fix: '    val free = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)', why: 'Wi-Fi can be metered (a phone hotspot). Ask about the property you care about, <code>NOT_METERED</code>, not the radio type.' },
    ],
    quiz: [
      { q: 'Two phones on the same home Wi-Fi call the same API. What source address does the server see?', options: ['The same public address, with different ports', 'Each phone’s private 192.168.x.x address', 'The router’s private address', 'The phones’ MAC addresses'], a: 0, why: 'NAT rewrites both phones’ packets to the router’s one public address and gives each flow its own port, so replies can be told apart.' },
      { q: 'A user downloads a file on Wi-Fi, then walks out of range. What happens to the download’s TCP connection?', options: ['It moves to cellular automatically', 'It dies; the app must open a new connection and resume', 'It pauses until Wi-Fi comes back, then continues', 'NAT forwards it to the new network'], a: 1, why: 'The connection is tied to the old address and port. Android closes connections on the old network. To survive, the app reconnects, ideally with an HTTP Range request to resume.' },
      { q: 'Which check fits "only prefetch when it won’t cost the user money"?', options: ['Check for the <code>TRANSPORT_WIFI</code> transport', 'Check the <code>NOT_METERED</code> capability', 'Check the <code>INTERNET</code> capability', 'Ping a public server'], a: 1, why: '<code>NOT_METERED</code> describes billing directly. Wi-Fi can be a metered hotspot, and <code>INTERNET</code> only says the network is meant to reach the internet.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  lessons.push({
    id: 'dns',
    title: 'DNS: names to addresses',
    tagline: 'Before the first byte of your request, someone has to find the server.',
    level: 'intermediate',
    body: `
<p>Your code knows <code>api.example.com</code>. IP needs an address. <b>DNS</b> turns one into the other. It is a distributed, hierarchical database: the <em>root</em> servers know who runs <code>.com</code>, the <code>.com</code> servers know who runs <code>example.com</code>, and that domain's <em>authoritative</em> server knows the address of <code>api.example.com</code>.</p>
<p>Your phone does not walk that tree itself. It asks a <b>recursive resolver</b> (your carrier's, your router's, or a Private DNS provider), which does the walking and returns the final answer. Every answer carries a <b>TTL</b>, in seconds, that says how long it may be cached. The OS and the resolver both cache, so most lookups are answered without leaving the phone or the resolver.</p>
<p>That is why the first request after app start is slower: it may pay for a DNS lookup (one or more round trips) before TCP even starts. Look up once cold, then again, then let the TTL expire.</p>`,
    code: `// OkHttp asks a Dns for addresses. The default, Dns.SYSTEM, uses the OS resolver and its cache.
class TimedDns(private val delegate: Dns = Dns.SYSTEM) : Dns {
    override fun lookup(hostname: String): List<InetAddress> {
        val start = SystemClock.elapsedRealtime()
        try {
            return delegate.lookup(hostname)    // throws UnknownHostException if it fails
        } finally {
            val took = SystemClock.elapsedRealtime() - start
            Log.d("Net", "DNS " + hostname + " took " + took + " ms")
        }
    }
}

val client = OkHttpClient.Builder()
    .dns(TimedDns())
    .build()`,
    remember: 'DNS answers are cached for their TTL. The cold first lookup is the slow one.',
    visual(el) {
      const NAME = 'api.example.com';
      const TTL = 300;
      let osCache = null, resCache = null, total = 0, tok = 0, busy = false;
      const hop = (name, detail) => {
        const msEl = h('span', { class: 'nw-ms' }, '');
        const small = h('small', {}, detail);
        const n = h('div', { class: 'nw-hop' }, h('b', {}, name), msEl, small);
        n.set = (cls, d, t) => { n.className = `nw-hop ${cls || ''}`; if (d != null) small.innerHTML = d; if (t != null) msEl.textContent = t; };
        return n;
      };
      const H = {
        app: hop('App (OkHttp)', `needs an address for ${NAME}`),
        os: hop('Phone OS resolver', 'checks its cache first'),
        rec: hop('Recursive resolver', 'carrier, router or Private DNS'),
        root: hop('Root server (.)', 'knows who runs .com'),
        tld: hop('.com TLD server', 'knows who runs example.com'),
        auth: hop('example.com authoritative', 'has the record itself'),
      };
      const totalEl = h('b', {}, '0 ms');
      const osC = h('div', { class: 'nw-cache' }), resC = h('div', { class: 'nw-cache' });
      const msg = out('Press <b>Look up</b> to resolve the name with empty caches.');
      const paintCaches = () => {
        osC.innerHTML = `<span class="nw-th">Phone cache</span>${osCache ? `${NAME} → 198.51.100.80 · TTL ${osCache.ttl}s` : 'empty'}`;
        resC.innerHTML = `<span class="nw-th">Resolver cache</span>${resCache ? `${NAME} → 198.51.100.80 · TTL ${resCache.ttl}s<br>.com → TLD servers · TTL 2 days` : 'empty'}`;
      };
      const reset = () => { Object.values(H).forEach(x => x.set('', null, '')); totalEl.textContent = '0 ms'; total = 0; };
      async function step(node, cls, d, add, wait = 650) {
        total += add; node.set(cls, d, add ? `+${add} ms` : '0 ms'); totalEl.textContent = ms(total); replay(totalEl, 'pop-soft');
        await sleep(wait);
      }
      async function lookup() {
        if (busy) return;
        busy = true; const t = ++tok; const alive = () => t === tok && el.isConnected;
        reset();
        await step(H.app, 'nw-on', `getaddrinfo("${NAME}")`, 0); if (!alive()) return;
        if (osCache) {
          await step(H.os, 'nw-hit', `cache hit · ${osCache.ttl}s of TTL left`, 0); if (!alive()) return;
          Object.values(H).slice(2).forEach(x => x.set('nw-dim'));
          say(msg, '<span class="good">Answered from the phone’s cache in well under a millisecond.</span> No packet left the device. This is why the second request is faster.');
          busy = false; return;
        }
        await step(H.os, 'nw-on', 'cache miss → ask the recursive resolver', 0); if (!alive()) return;
        if (resCache) {
          await step(H.rec, 'nw-hit', `cache hit (another user asked recently) · TTL ${resCache.ttl}s`, 25); if (!alive()) return;
          Object.values(H).slice(3).forEach(x => x.set('nw-dim'));
          osCache = { ttl: resCache.ttl }; paintCaches();
          say(msg, `One round trip to the resolver: <b>${ms(total)}</b>. The resolver had it cached, so it hands back the record with the TTL that is <em>left</em>, not a fresh ${TTL}s.`);
          busy = false; return;
        }
        await step(H.rec, 'nw-on', 'cache miss → walk the tree from the top', 25); if (!alive()) return;
        await step(H.root, 'nw-on', 'referral: “ask the .com servers”', 20); if (!alive()) return;
        await step(H.tld, 'nw-on', 'referral: “ask ns1.example.com”', 30); if (!alive()) return;
        await step(H.auth, 'nw-hit', `answer: A 198.51.100.80 · TTL ${TTL}`, 35); if (!alive()) return;
        H.rec.set('nw-hit', 'caches the answer, returns it to the phone');
        osCache = { ttl: TTL }; resCache = { ttl: TTL }; paintCaches();
        say(msg, `Cold lookup: <b>${ms(total)}</b> before TCP can even start (example timings). Both the phone and the resolver now cache it for ${TTL}s. Press <b>Look up</b> again.`);
        busy = false;
      }
      function wait(sec) {
        tok++; busy = false;
        const tick = c => { if (!c) return null; const ttl = c.ttl - sec; return ttl > 0 ? { ttl } : null; };
        osCache = tick(osCache); resCache = tick(resCache);
        paintCaches(); reset();
        say(msg, `${sec / 60} minutes later. ${!osCache && !resCache ? 'Both entries expired. The next lookup is cold again.' : osCache ? 'Entries are still fresh.' : 'Expired on the phone. The resolver may still have it.'}`);
      }
      function clearPhone() { tok++; busy = false; osCache = null; paintCaches(); reset(); say(msg, 'Phone cache cleared (like a reboot or airplane-mode toggle). The resolver still remembers.'); }
      el.append(
        h('div', { class: 'nw-stage' }, h('div', { class: 'nw-hops' }, Object.values(H)), h('div', { class: 'nw-row' }, h('span', { class: 'nw-stat' }, 'DNS time: ', totalEl)), h('div', { class: 'nw-caches' }, osC, resC)),
        h('div', { class: 'controls' }, act('Look up', lookup), act('Wait 2 min', () => wait(120)), act('Wait 5 min', () => wait(300)), act('Clear phone cache', clearPhone)),
        msg);
      paintCaches();
    },
    deeper: [
      {
        title: 'What a DNS answer contains',
        body: `<p>DNS stores <em>records</em>. <code>A</code> holds an IPv4 address, <code>AAAA</code> an IPv6 address, <code>CNAME</code> says "this name is an alias of that one" (common with CDNs), <code>MX</code> is for mail, and <code>HTTPS</code>/<code>SVCB</code> records can tell a client up front that a server speaks HTTP/3. A lookup often returns several addresses. OkHttp tries them in order, and an address that fails becomes a different <em>route</em> for the next attempt.</p>`,
      },
      {
        title: 'Transport and privacy',
        body: `<p>Classic DNS sends questions in plain UDP to port 53. RFC 1035 limited UDP answers to 512 bytes and told clients to retry over TCP when an answer is truncated (EDNS raised that limit later). Plain DNS is readable by anyone on the path. Encrypted variants, DNS over TLS and DNS over HTTPS, hide which names you look up. Android's <em>Private DNS</em> setting (Android 9+) encrypts lookups for the whole phone, using DNS over TLS (newer versions can also use DNS over HTTPS with some providers), without any app change.</p>`,
      },
      {
        title: 'TTL is a trade-off for the server team',
        body: `<p>A long TTL means fewer lookups and faster apps, but when the backend moves to a new address, some users keep hitting the old one until their caches expire. A short TTL makes moves fast but costs more lookups. Teams often lower the TTL a day before a planned migration and raise it again after. For you, the client side: never cache an address yourself forever. Let the resolver honor the TTL.</p>`,
        code: `// Don't do this: the server may move, and this app will never know
val pinnedAddress = InetAddress.getByName("api.example.com")   // looked up once at startup
// Instead, give OkHttp the host name every time and let DNS caching work`,
      },
    ],
    underHood: {
      body: `<p>On Android, <code>InetAddress.getByName</code> and OkHttp's <code>Dns.SYSTEM</code> call into the system resolver, which caches answers for their TTL, so most of your app's lookups never leave the phone. Apps that do their own DNS (not through the system resolver) can check <code>LinkProperties.isPrivateDnsActive()</code> so they don’t send plain queries when the user asked for encrypted ones.</p>`,
    },
    mistakes: [
      {
        title: 'Building a new OkHttpClient per request',
        bad: 'suspend fun load() = OkHttpClient().newCall(req).await()',
        good: '// one client, injected everywhere\nclass Repo(private val client: OkHttpClient) {\n    suspend fun load() = client.newCall(req).await()\n}',
        why: 'A fresh client has an empty connection pool, so every call pays DNS, TCP and TLS again. One shared client reuses warm connections and skips all three.',
      },
    ],
    terms: [
      { term: 'Recursive resolver', def: 'The DNS server that walks the hierarchy on your behalf and returns the final answer, caching along the way.' },
      { term: 'Authoritative server', def: 'The DNS server that holds the actual records for a domain.' },
      { term: 'TTL (DNS)', def: 'How many seconds a DNS answer may be cached before it must be looked up again.' },
      { term: 'A / AAAA record', def: 'DNS records that map a name to an IPv4 (A) or IPv6 (AAAA) address.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Plug a custom DNS into OkHttp.', code: 'class LoggingDns : [[Dns]] {\n    override fun lookup(hostname: String): List<InetAddress> =\n        Dns.[[SYSTEM]].lookup(hostname).also { Log.d("Net", "resolved " + hostname) }\n}', why: 'OkHttp’s <code>Dns</code> interface has one method, <code>lookup</code>. <code>Dns.SYSTEM</code> is the default implementation backed by the OS resolver.' },
      { type: 'bug', prompt: 'After the backend moved to new servers, this app kept calling the old address. Tap the line that caused it.', code: 'object Backend {\n    private val address = InetAddress.getByName("api.example.com")\n    fun url(path: String) = "https://api.example.com/" + path\n    fun ip() = address\n}', bug: 1, fix: '    fun address(): InetAddress = InetAddress.getByName("api.example.com")', why: 'Resolving once and keeping the result ignores the TTL. Resolve when you connect (or let OkHttp do it) so cached answers expire as the server intends.' },
    ],
    quiz: [
      { q: 'The first API call after a cold start takes 400 ms longer than the rest. Which part of the delay is DNS most likely responsible for?', options: ['None; DNS is always cached', 'The lookup before TCP starts, since nothing is cached yet', 'Decoding the JSON', 'TLS certificate checking'], a: 1, why: 'A cold lookup may need round trips to the resolver, and the resolver may walk the tree. Later calls hit the cache. (TCP and TLS setup also add to the first call; the next lessons cover them.)' },
      { q: 'Order the servers a recursive resolver asks when nothing is cached.', options: ['Root → TLD → authoritative', 'Authoritative → TLD → root', 'TLD → root → authoritative', 'Only the authoritative server'], a: 0, why: 'Each level refers the resolver one step down the name: the root knows the TLD servers, the TLD knows the domain’s servers, and those hold the record.' },
      { q: 'A record has TTL 300. The resolver cached it 200 seconds ago and gives it to your phone. How long may your phone cache it?', options: ['300 seconds', 'About 100 seconds', 'Forever', '0 seconds'], a: 1, why: 'Resolvers hand out the remaining TTL. The record expires at the same moment everywhere, roughly 100 seconds from now.' },
      { q: 'A user turns on Private DNS in Android settings. What changes for your app?', options: ['You must switch to a DNS-over-HTTPS library', 'Nothing in your code; the system resolver encrypts lookups', 'Lookups stop being cached', 'The app needs a new permission'], a: 1, why: 'Private DNS is a system setting. The OS resolver sends queries encrypted, and apps using the system resolver get it for free.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  lessons.push({
    id: 'tcp-udp',
    title: 'TCP vs UDP',
    tagline: 'Reliable and ordered, or fast and on your own.',
    level: 'intermediate',
    body: `
<p><b>TCP</b> gives the app a reliable, ordered byte stream on top of IP, which loses, duplicates and reorders packets. It starts with a <em>three-way handshake</em> (SYN, SYN-ACK, ACK) that agrees on starting sequence numbers, so it costs one round trip before any data. Every byte is numbered. The receiver sends <em>acknowledgments</em>, and the sender retransmits what was not acknowledged.</p>
<p>TCP also runs <b>congestion control</b>. It starts slowly (<em>slow start</em>), grows its sending window while ACKs come back, and cuts the window when it sees loss, because loss usually means a queue somewhere is full. This keeps the internet from collapsing, but it also means a fresh connection cannot use the full bandwidth right away.</p>
<p>The price of order is <b>head-of-line blocking</b>: if packet 2 is lost, packets 3, 4 and 5 sit in the receiver's buffer until 2 is resent. <b>UDP</b> skips all of this: no handshake, no ACKs, no order, 8-byte header. Each datagram arrives or doesn't. That suits live audio, video calls and games, where late data is useless, and it is the base QUIC builds on. Lose a packet in both modes and compare.</p>`,
    code: `// TCP through OkHttp: tune how long each phase may take
val client = OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)    // TCP connect to the server
    .readTimeout(10, TimeUnit.SECONDS)       // max gap between incoming bytes
    .callTimeout(30, TimeUnit.SECONDS)       // the whole call, DNS to last byte
    .build()

// UDP: one datagram, no connection, no delivery guarantee
suspend fun sendPing(host: String, port: Int) = withContext(Dispatchers.IO) {
    DatagramSocket().use { socket ->
        val bytes = "ping".toByteArray()
        val packet = DatagramPacket(bytes, bytes.size, InetAddress.getByName(host), port)
        socket.send(packet)                     // returns at once; it may never arrive
    }
}`,
    remember: 'TCP buys order and reliability with a handshake, ACKs and head-of-line blocking. UDP gives you none of it.',
    visual(el) {
      let mode = 'tcp', lose = true, connected = false, tok = 0, busy = false;
      const seq = h('div', { class: 'nw-seq' });
      const slots = [1, 2, 3, 4, 5].map(n => h('span', { class: 'nw-slot' }, String(n)));
      const appLine = h('span', { class: 'nw-stat' }, 'nothing yet');
      const msg = out('Pick TCP or UDP, then press <b>Send 5 packets</b>.');
      const clear = () => { seq.replaceChildren(seqHead()); slots.forEach(s => { s.className = 'nw-slot'; }); appLine.textContent = 'nothing yet'; };
      const add = async (node, t, wait = 520) => { seq.append(node); await sleep(wait); return t === tok && el.isConnected; };
      const slot = (n, cls) => { slots[n - 1].className = `nw-slot ${cls}`; replay(slots[n - 1], 'pop-soft'); };
      const delivered = () => slots.filter(s => s.classList.contains('nw-got')).map(s => s.textContent).join(', ') || 'nothing yet';
      async function connect(t) {
        if (!(await add(arrow('SYN · seq=100', 'r'), t))) return false;
        if (!(await add(arrow('SYN,ACK · seq=300 ack=101', 'l'), t))) return false;
        if (!(await add(arrow('ACK · ack=301', 'r'), t))) return false;
        connected = true;
        return add(arrow('connection open: 1 round trip spent, no data sent yet', 'r', 'nw-note-row'), t, 300);
      }
      async function send() {
        if (busy) return;
        busy = true; const t = ++tok; clear();
        const done = () => { busy = false; };
        if (mode === 'tcp') {
          if (!connected) { say(msg, 'TCP must open a connection first: the three-way handshake.'); if (!(await connect(t))) return done(); }
          say(msg, 'Sending five segments…');
          for (let n = 1; n <= 5; n++) {
            const lost = lose && n === 2;
            if (!(await add(arrow(`segment ${n}${lost ? ' (lost on the way)' : ''}`, 'r', lost ? 'nw-lost' : ''), t, 380))) return done();
            if (lost) continue;
            if (!lose || n === 1) { slot(n, 'nw-got'); if (!(await add(arrow(`ACK ${n + 1}`, 'l'), t, 300))) return done(); }
            else { slot(n, 'nw-held'); if (!(await add(arrow(`ACK 2 (duplicate: still missing 2)`, 'l', 'nw-warmc'), t, 300))) return done(); }
            appLine.textContent = delivered();
          }
          if (lose) {
            say(msg, `The app has only segment 1. <b>3, 4 and 5 arrived</b> but wait in the buffer: TCP may only hand bytes up in order. That is head-of-line blocking.`);
            if (!(await add(arrow('3 duplicate ACKs → fast retransmit, window cut', 'r', 'nw-note-row'), t, 1400))) return done();
            if (!(await add(arrow('segment 2 (retransmit)', 'r', 'nw-warmc'), t, 450))) return done();
            [2, 3, 4, 5].forEach(n => slot(n, 'nw-got'));
            appLine.textContent = delivered();
            if (!(await add(arrow('ACK 6 (everything up to 5)', 'l'), t, 300))) return done();
            say(msg, '<span class="good">All five delivered, in order</span>, one extra round trip late. The sender also cut its congestion window roughly in half, so the next data goes out slower.');
          } else say(msg, '<span class="good">All five delivered in order.</span> Each ACK names the next byte expected. Turn on loss to see recovery.');
        } else {
          connected = false;
          say(msg, 'UDP: no handshake. Datagrams go out at once.');
          for (let n = 1; n <= 5; n++) {
            const lost = lose && n === 2;
            if (!(await add(arrow(`datagram ${n}${lost ? ' (lost)' : ''}`, 'r', lost ? 'nw-lost' : ''), t, 380))) return done();
            if (!lost) slot(n, 'nw-got');
            appLine.textContent = delivered();
          }
          if (lose) slot(2, 'nw-gone');
          say(msg, lose ? '1, 3, 4 and 5 reached the app <b>immediately</b>. 2 is gone for good and nobody will resend it. A voice call just plays 20 ms of silence; a file transfer would be corrupt.' : 'All arrived this time, with zero setup cost. Nothing guaranteed it.');
        }
        busy = false;
      }
      const modeP = picker('protocol', [{ label: 'TCP', v: 'tcp' }, { label: 'UDP', v: 'udp' }], it => { tok++; busy = false; mode = it.v; connected = false; clear(); say(msg, it.v === 'tcp' ? 'TCP: connection first, then numbered, acknowledged segments.' : 'UDP: independent datagrams, no connection.'); });
      const loseB = toggle('Lose packet 2', on => { lose = on; }, true);
      el.append(modeP,
        h('div', { class: 'nw-stage' }, seq, h('div', { class: 'nw-row' }, label('server app has'), h('div', { class: 'nw-slots' }, slots)), h('div', { class: 'nw-row' }, label('handed to app'), appLine)),
        h('div', { class: 'controls' }, act('Send 5 packets', send), loseB, act('Close connection', () => { tok++; busy = false; connected = false; clear(); say(msg, 'Closed. The next TCP send starts with a handshake again.'); })),
        msg);
      clear();
    },
    deeper: [
      {
        title: 'Slow start: why new connections are slow',
        body: `<p>A new TCP connection does not know how fast the path is. It starts with a small <em>congestion window</em> (a common initial window is 10 segments, about 14 KB) and roughly doubles it every round trip while ACKs arrive. So the first 14 KB arrive after one round trip, the next 28 KB after another, and so on. On a 100 ms mobile link, a fresh connection needs several round trips to get to full speed. A <em>reused</em> connection has already grown its window. This is a second big reason to keep connections alive and share one client.</p>`,
      },
      {
        title: 'When UDP wins',
        body: `<p>Pick UDP when late data is worthless or when you need your own rules for reliability. Voice and video calls (WebRTC) send media over UDP, because a resent audio frame would arrive after it should have played. Games send the latest position many times per second; a lost one is replaced by the next. QUIC, and so HTTP/3, runs on UDP but rebuilds reliability <em>per stream</em> in user space, which removes TCP's cross-stream blocking. For normal REST and file downloads in an Android app, you use TCP (or QUIC) through a library, never raw UDP.</p>`,
      },
      {
        title: 'Closing and timeouts',
        body: `<p>TCP closes with FIN segments from each side. The side that closes first waits in <code>TIME_WAIT</code> for twice the maximum segment lifetime, so late packets from the old connection cannot confuse a new one. Mobile networks add a twist: carrier NATs drop idle mappings after a while. A connection that was silent for minutes may be dead without either side knowing, and the next write just times out. OkHttp's pool evicts idle connections and retries a failed call on a new connection when it safely can.</p>`,
      },
    ],
    underHood: {
      body: `<p>RFC 5681 defines the classic algorithm. While the window is below a threshold, it grows by about one segment per ACK (exponential per round trip). Above it, it grows by about one segment per round trip. Three duplicate ACKs trigger <em>fast retransmit</em> of the missing segment and halve the threshold. A full timeout is worse: the window falls back to one segment. Modern stacks use variants such as CUBIC or BBR, but the shape is the same.</p>`,
      code: `// Rough model of slow start: segments in flight per round trip
var cwnd = 10                    // initial window (segments)
repeat(4) { rtt ->
    println("RTT " + rtt + ": " + cwnd + " segments")
    cwnd *= 2                    // every ACKed segment adds one
}
// RTT 0: 10, RTT 1: 20, RTT 2: 40, RTT 3: 80`,
    },
    mistakes: [
      {
        title: 'Using readTimeout as a total deadline',
        bad: 'OkHttpClient.Builder()\n    .readTimeout(15, TimeUnit.SECONDS)   // "the call ends after 15 s"',
        good: 'OkHttpClient.Builder()\n    .readTimeout(15, TimeUnit.SECONDS)\n    .callTimeout(30, TimeUnit.SECONDS)   // the real upper bound',
        why: 'The read timeout is the longest gap between bytes, so a server trickling one byte every 10 s never trips it. <code>callTimeout</code> bounds the whole call.',
      },
    ],
    terms: [
      { term: 'Three-way handshake', def: 'SYN, SYN-ACK, ACK: how TCP opens a connection and agrees on starting sequence numbers. Costs one round trip.' },
      { term: 'Congestion window', def: 'How much unacknowledged data a TCP sender allows in flight. It grows while ACKs arrive and shrinks on loss.' },
      { term: 'Head-of-line blocking', def: 'Later data waiting behind one lost or slow piece because delivery must stay in order.' },
      { term: 'UDP', def: 'A transport with no connection, no acknowledgments and no ordering, with an 8-byte header (RFC 768).' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Bound the whole call to 30 seconds, and the TCP connect to 10.', code: 'val client = OkHttpClient.Builder()\n    .[[connectTimeout]](10, TimeUnit.SECONDS)\n    .[[callTimeout]](30, TimeUnit.SECONDS)\n    .build()', why: '<code>connectTimeout</code> covers opening the TCP socket. <code>callTimeout</code> covers the entire call from DNS to the last byte.' },
      { type: 'bug', prompt: 'This sends a game position update. The comment states a wrong guarantee. Tap it.', code: 'DatagramSocket().use { socket ->\n    val data = encode(position)\n    socket.send(DatagramPacket(data, data.size, server, 7777))\n    // the server now has the position, in order with the previous ones\n}', bug: 3, fix: '    // the datagram may be lost, duplicated or reordered; the next update replaces it', why: 'UDP guarantees neither delivery nor order (RFC 768). Game protocols accept that and send fresh state often.' },
    ],
    quiz: [
      { q: 'Packet 2 of 5 is lost on a TCP connection. What does the receiving app see first?', options: ['Packets 1, 3, 4, 5, then 2', 'Packet 1, then nothing until 2 is resent, then 2–5 together', 'All five at once, after a timeout', 'An exception in the app'], a: 1, why: 'TCP hands bytes up in order. 3–5 are buffered until the retransmitted 2 arrives. That wait is head-of-line blocking.' },
      { q: 'How many round trips does a TCP handshake cost before the client can send its first data byte?', options: ['0', '1', '2', '3'], a: 1, why: 'SYN goes out, SYN-ACK comes back. The client can send its ACK together with the first data, so one round trip.' },
      { q: 'A video call app must choose a transport for live audio. Which fits best?', options: ['TCP, because audio must be complete', 'UDP, because a late audio frame is useless and retransmits add delay', 'HTTP/1.1 polling', 'Either; they behave the same on Wi-Fi'], a: 1, why: 'Retransmitting audio means it plays late or blocks newer audio. UDP lets the app skip losses and keep the call real-time.' },
      { q: 'A new connection downloads a 200 KB image slower than the same download on a reused connection. Why?', options: ['TLS encrypts the first bytes twice', 'Slow start: the new connection’s window starts small and grows each round trip', 'UDP is used for new connections', 'DNS runs again for every packet'], a: 1, why: 'Congestion control starts cautious and doubles the window per round trip. A reused connection has already grown its window.' },
      { q: 'What does TCP do when the sender sees three duplicate ACKs?', options: ['Closes the connection', 'Resends the missing segment right away and cuts its window', 'Ignores them', 'Switches to UDP'], a: 1, why: 'Duplicate ACKs mean later data arrived but one segment is missing. Fast retransmit resends it without waiting for a timeout, and congestion control backs off.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  lessons.push({
    id: 'tls',
    title: 'TLS and HTTPS',
    tagline: 'Encryption, integrity and proof that you are talking to the real server.',
    level: 'intermediate',
    body: `
<p><b>TLS</b> gives a connection three things: <em>confidentiality</em> (nobody on the path can read it), <em>integrity</em> (nobody can change it unnoticed) and <em>authentication</em> (the server proves who it is). HTTPS is just HTTP sent inside TLS.</p>
<p>Authentication works through <b>certificates</b>. The server sends a certificate for <code>api.example.com</code>, signed by an intermediate certificate authority, which is signed by a root CA. Android ships a set of trusted root CAs. The client checks every signature up the <em>chain of trust</em>, checks the dates, and checks that the name matches the host it dialed. If any check fails, the handshake fails with <code>SSLHandshakeException</code>.</p>
<p>In TLS 1.3 (RFC 8446, on by default since Android 10) the handshake costs one round trip: the client sends its key share in the first message, and both sides derive the same keys from that exchange. Run the handshake, then try an intercepting proxy, then a pinned app whose server changed keys. The <a href="#security.network">network security</a> lesson covers the app-side setup.</p>`,
    code: `// Pinning with OkHttp. Always ship a backup pin, and agree it with the server team.
val pinner = CertificatePinner.Builder()
    .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")  // current key
    .add("api.example.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")  // backup key
    .build()

val client = OkHttpClient.Builder()
    .certificatePinner(pinner)
    .build()

// A mismatch fails the call with SSLPeerUnverifiedException ("Certificate pinning failure!").
// Android's own guidance: pinning is not recommended for most apps, because a CA or key
// change on the server breaks every installed copy until users update.`,
    remember: 'The chain must reach a trusted root, match the host name and be in date. Pin only with backups and an expiry.',
    visual(el) {
      const SC = {
        normal: { root: 'Public root CA', where: 'in Android system store', ok: true },
        proxy: { root: 'Debug Proxy CA', where: 'user-installed certificate', ok: false },
        pinned: { root: 'Another public root CA', where: 'in Android system store', ok: true, pin: true },
      };
      let sc = 'normal';
      const seq = h('div', { class: 'nw-seq' });
      const cert = (name, sub) => {
        const mark = h('span', { class: 'nw-mark' }, '·');
        const small = h('small', {}, sub);
        const n = h('div', { class: 'nw-cert' }, h('b', {}, name), mark, small);
        n.set = (st, s) => { n.className = `nw-cert ${st === true ? 'nw-good' : st === false ? 'nw-bad' : ''}`; mark.textContent = st === true ? '✓' : st === false ? '✕' : '·'; if (s) small.textContent = s; };
        return n;
      };
      const leaf = cert('api.example.com', 'leaf certificate · not checked yet');
      const inter = cert('Intermediate CA', 'signed the leaf');
      const root = cert('Root CA', 'signed the intermediate');
      const chain = h('div', { class: 'nw-chain' }, leaf, h('span', { class: 'nw-cert-link' }, '↑ signed by'), inter, h('span', { class: 'nw-cert-link' }, '↑ signed by'), root);
      const rtt = h('b', {}, '0');
      const p = player(el, {
        top: picker('scenario', [{ label: 'Normal', v: 'normal' }, { label: 'Intercepting proxy', v: 'proxy' }, { label: 'Pinned, server changed CA', v: 'pinned' }], it => { sc = it.v; p.reset(); }),
        view: [seq, h('div', { class: 'nw-row' }, label('certificate chain'), h('span', { class: 'nw-stat' }, 'TLS round trips: ', rtt)), chain],
        speed: 1500,
        build() {
          const s = SC[sc];
          const fr = [
            { rows: [], msg: 'A TCP connection to api.example.com:443 is open. Nothing is encrypted yet. Press Step.' },
            { rows: [['ClientHello · TLS 1.3, cipher suites, key share, SNI=api.example.com, ALPN h2', 'r']], rtt: 0, msg: 'The client offers versions and ciphers and sends its half of a key exchange right away. SNI names the host; ALPN offers HTTP/2.' },
            { rows: [['ServerHello · chosen cipher, server key share', 'l']], rtt: 1, msg: 'The server picks and sends its key share. Both sides can now compute the same secret. <b>Everything after this is encrypted.</b>' },
            { rows: [['{EncryptedExtensions ALPN=h2} {Certificate} {CertificateVerify} {Finished}', 'l', 'nw-warmc']], rtt: 1, msg: 'In the same flight: the chosen protocol, the certificate chain, a signature proving the server holds the private key, and Finished.' },
            { chain: 'check', rtt: 1, msg: 'The client checks the chain: each signature, the dates, and that the leaf names <b>api.example.com</b>.' },
          ];
          if (!s.ok) {
            fr.push({ chain: 'badroot', rtt: 1, rows: [['alert: bad certificate', 'r', 'nw-lost']], msg: '<span class="bad">SSLHandshakeException.</span> The root is a <b>user-installed</b> CA. Apps targeting Android 7.0 (API 24) or later trust only system CAs by default. To debug with a proxy, trust it in <code>debug-overrides</code> of the network security config, which applies to debuggable builds only.' });
            return fr;
          }
          if (s.pin) {
            fr.push({ chain: 'ok', rtt: 1, msg: 'The chain is valid: it reaches a trusted system root. But this app pins keys…' });
            fr.push({ chain: 'pinfail', rtt: 1, rows: [['connection closed by the app', 'r', 'nw-lost']], msg: '<span class="bad">SSLPeerUnverifiedException: Certificate pinning failure!</span> The server team moved to a new CA and key. None of the pinned hashes match, so every installed copy of the app is cut off until users update. A backup pin they control would have avoided it.' });
            return fr;
          }
          fr.push({ chain: 'ok', rtt: 1, msg: '<span class="good">Chain trusted</span>: leaf → intermediate → a root in the Android system store, name matches, in date.' });
          fr.push({ chain: 'ok', rtt: 1, rows: [['{Finished} + GET /v1/haberler (encrypted)', 'r']], msg: 'The client sends Finished and its first request <b>in the same flight</b>. TLS 1.3 cost one round trip on top of TCP’s one.' });
          fr.push({ chain: 'ok', rtt: 1, rows: [['{HTTP/2 200 + JSON}', 'l']], msg: '<span class="good">Response.</span> Total before the first response byte on a fresh connection: TCP 1 RTT + TLS 1 RTT + request 1 RTT. A reused connection skips the first two.' });
          return fr;
        },
        paint(f, i, frames) {
          seq.replaceChildren(seqHead());
          frames.slice(0, i + 1).forEach(x => (x.rows || []).forEach(([t, d, c]) => seq.append(arrow(t, d, c || ''))));
          rtt.textContent = String(f.rtt || 0);
          const s = SC[sc];
          if (!f.chain) { leaf.set(null, 'leaf certificate · not checked yet'); inter.set(null, 'signed the leaf'); root.set(null, `${s.root} · ${s.where}`); return; }
          leaf.set(true, 'name matches · valid dates');
          inter.set(true, 'signature on leaf checks out');
          if (f.chain === 'check') root.set(null, `${s.root} · ${s.where}`);
          else if (f.chain === 'badroot') root.set(false, `${s.root} · user CA, not trusted by default`);
          else if (f.chain === 'pinfail') { root.set(true, `${s.root} · trusted`); leaf.set(false, 'public key hash not in the pin set'); }
          else root.set(true, `${s.root} · ${s.where}`);
        },
      });
    },
    deeper: [
      {
        title: 'Network security config',
        body: `<p>Android lets you set TLS rules in XML instead of code: <code>res/xml/network_security_config.xml</code>, referenced from the manifest with <code>android:networkSecurityConfig</code>. For apps that target Android 9 (API 28) or higher, cleartext HTTP is blocked by default, and for apps that target Android 7.0 (API 24) or higher, user-added CAs are not trusted by default. The config can allow cleartext for one debug host, add your own CA, trust a proxy only in debuggable builds, or pin keys with an expiry date.</p>`,
        code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <domain-config>
        <domain includeSubdomains="true">api.example.com</domain>
        <pin-set expiration="2027-06-01">
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
    </domain-config>
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />   <!-- lets a debugging proxy work in debug builds only -->
        </trust-anchors>
    </debug-overrides>
</network-security-config>`,
      },
      {
        title: 'Pinning: the trade-off',
        body: `<p>Pinning means the app accepts only certificates whose public key hash is in a list you ship. It defends against a wrongly issued certificate from a trusted CA. The cost is operational: if the server changes key or CA and the app was not updated in time, every installed copy stops working, and users on old versions stay broken. Android's documentation recommends against pinning for most apps. If you must: pin a backup key you control, set an expiration, and agree on it with whoever runs the servers. The expiration is a trade-off: after that date the app stops enforcing pins, so it keeps working, but it also loses the extra protection pinning gave.</p>`,
      },
      {
        title: 'Session resumption and 0-RTT',
        body: `<p>After a full handshake the server can give the client a ticket. Next time, the client resumes with it and skips the certificate work. TLS 1.3 also defines <em>0-RTT</em> early data, sent before the handshake finishes, but it can be replayed by an attacker, so it is only safe for idempotent requests. The practical speed-up for apps is connection reuse: a pooled connection pays zero handshakes.</p>`,
      },
    ],
    underHood: {
      body: `<p>The pin is a SHA-256 hash of the certificate's <em>SubjectPublicKeyInfo</em>, the encoded public key, not of the whole certificate. That is why a server can renew its certificate with the same key and keep pins valid. OkHttp checks pins after a successful TLS handshake and before the connection is used, and accepts if at least one pinned key appears in the server's chain.</p>`,
    },
    mistakes: [
      {
        title: 'Trusting every certificate to make an error go away',
        bad: 'val trustAll = object : X509TrustManager {\n    override fun checkServerTrusted(chain: Array<X509Certificate>, type: String) {}\n    // ...\n}',
        good: '// Fix the server chain (send the intermediate), or for a debug proxy:\n// <debug-overrides> in network_security_config.xml',
        why: 'An empty trust manager accepts any certificate, so anyone on the network can read and change traffic. A common real cause is a server that does not send its intermediate certificate; fix it on the server.',
      },
      {
        title: 'One pin, no expiry',
        bad: '.add("api.example.com", "sha256/AAAA...=")',
        good: '.add("api.example.com", "sha256/AAAA...=")   // current\n.add("api.example.com", "sha256/BBBB...=")   // backup you control',
        why: 'With one pin, any key change locks every user out. A backup pin (and an expiry, in the XML config) gives the server team a way to rotate safely.',
      },
    ],
    terms: [
      { term: 'TLS', def: 'Transport Layer Security: encrypts and authenticates a connection. HTTPS is HTTP over TLS.' },
      { term: 'Chain of trust', def: 'Leaf certificate signed by an intermediate CA, signed by a root CA the device already trusts.' },
      { term: 'Certificate pinning', def: 'Accepting only certificates whose public key hash is on a list shipped in the app.' },
      { term: 'Network security config', def: 'An XML file that sets an app’s TLS rules: cleartext, trusted CAs, debug overrides and pins.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Point the manifest at the security config, then allow a debugging proxy in debug builds only.', code: '<application android:[[networkSecurityConfig]]="@xml/network_security_config">\n\n<network-security-config>\n    <[[debug-overrides]]>\n        <trust-anchors><certificates src="user" /></trust-anchors>\n    </debug-overrides>\n</network-security-config>', why: 'The manifest attribute is <code>android:networkSecurityConfig</code>. <code>debug-overrides</code> is ignored unless the app is debuggable, so release builds stay strict.' },
      { type: 'bug', prompt: 'This pinning setup locks every user out the day the server rotates its key. Tap the line to change.', code: 'val pinner = CertificatePinner.Builder()\n    .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")\n    .build()\nval client = OkHttpClient.Builder().certificatePinner(pinner).build()', bug: 1, fix: '    .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")', why: 'A single pin has no plan B. Add a backup key the server team holds, so they can switch to it without breaking installed apps.' },
    ],
    quiz: [
      { q: 'You install a debugging proxy’s CA on your phone, but your app (target API 35) fails with SSLHandshakeException. Why?', options: ['The proxy uses UDP', 'Apps targeting API 24+ do not trust user-installed CAs by default', 'TLS 1.3 forbids proxies', 'The app needs the INTERNET permission'], a: 1, why: 'Since Android 7.0, user CAs are opt-in. Trust them in <code>debug-overrides</code> so only debuggable builds accept the proxy.' },
      { q: 'Put the TLS 1.3 server flight in order.', options: ['ServerHello → Certificate → CertificateVerify → Finished', 'Certificate → ServerHello → Finished → CertificateVerify', 'Finished → ServerHello → Certificate', 'CertificateVerify → Certificate → ServerHello'], a: 0, why: 'ServerHello carries the key share. Then, encrypted: EncryptedExtensions, Certificate, CertificateVerify (proof of the private key) and Finished.' },
      { q: 'Which check does NOT happen during normal certificate validation?', options: ['The leaf’s name matches the host', 'Each certificate is signed by the next one up', 'The root is in the trusted store', 'The server’s IP address is in the certificate’s country'], a: 3, why: 'Validation checks signatures up to a trusted root, validity dates and the host name. Location has nothing to do with it.' },
      { q: 'A news app with millions of users, many on old versions, asks whether to pin. Which answer fits Android’s guidance?', options: ['Pin one leaf certificate for maximum safety', 'Avoid pinning; if required, pin a backup key and set an expiry', 'Pin the root CA of every user', 'Disable certificate checks and rely on pinning only'], a: 1, why: 'Android recommends against pinning for most apps because a server change can break every old install. If pinning is required, backups and expiry limit the damage.' },
      { q: 'On a fresh connection, how many round trips pass before the first response byte with TCP + TLS 1.3?', options: ['1', '2', '3', '5'], a: 2, why: 'TCP handshake 1, TLS 1.3 handshake 1, then the request and response 1. Reusing a connection skips the first two.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  lessons.push({
    id: 'http-versions',
    title: 'HTTP/1.1, HTTP/2 and HTTP/3',
    tagline: 'Same requests and responses, very different use of the connection.',
    level: 'advanced',
    body: `
<p>All HTTP versions share the same meaning: methods, status codes, headers. What changes is how they use the connection. <b>HTTP/1.1</b> sends text, one request at a time per connection. Keep-alive lets the next request reuse the connection, but a slow response blocks everything queued behind it. Clients work around it by opening several connections, each with its own handshakes and slow start.</p>
<p><b>HTTP/2</b> (RFC 9113) is binary and <em>multiplexed</em>: many requests run as independent streams on <em>one</em> TCP connection, and headers are compressed (HPACK). One connection, one handshake, one warm congestion window. But all streams share one TCP byte stream, so a single lost packet stalls them all: TCP's head-of-line blocking is still there.</p>
<p><b>HTTP/3</b> (RFC 9114) runs on <b>QUIC</b> (RFC 9000) over UDP. QUIC combines the transport and TLS 1.3 handshakes into one round trip and recovers loss per stream, so one lost packet only delays the stream it belonged to. Its connection IDs also let a connection survive an address change. Compare the waterfalls, then add a lost packet.</p>`,
    code: `// One OkHttpClient for the app: one pool, warm connections, HTTP/2 when the server offers it.
@Provides @Singleton
fun okHttp(): OkHttpClient = OkHttpClient.Builder()
    .connectionPool(ConnectionPool())       // default: up to 5 idle connections, kept 5 minutes
    .build()

// See what was negotiated (ALPN in the TLS handshake picks h2 or http/1.1)
val response = client.newCall(request).execute()
Log.d("Net", "protocol=" + response.protocol)    // h2 or http/1.1

// Need a sibling client with other timeouts? Share the pool and dispatcher.
val uploads = client.newBuilder()
    .writeTimeout(2, TimeUnit.MINUTES)
    .build()`,
    remember: 'HTTP/2 multiplexes on one TCP connection; HTTP/3 does it on QUIC so one loss stalls one stream. Reuse beats any version.',
    visual(el) {
      const R = 100, SCALE = 2000;
      const names = ['/feed', '/user', '/ads', '/img/1.webp', '/img/2.webp', '/img/3.webp'];
      let mode = 'h1', warm = false, loss = false;
      function model() {
        const rows = names.map(() => []);
        let conns = 1;
        if (mode === 'h1') {
          let t = 0; conns = 6;
          rows.forEach((segs, i) => {
            segs.push({ s: t, e: t + 2 * R, c: 'nw-setup' }); t += 2 * R;
            segs.push({ s: t, e: t + R, c: '' }); t += R;
            if (loss && i === 2) { segs.push({ s: t, e: t + R, c: 'nw-stall' }); t += R; }
          });
        } else if (mode === 'ka') {
          let t = 0;
          if (!warm) { rows[0].push({ s: 0, e: 2 * R, c: 'nw-setup' }); t = 2 * R; }
          rows.forEach((segs, i) => {
            if (t > 0 && i > 0) segs.push({ s: 0, e: t, c: 'nw-wait' });
            segs.push({ s: t, e: t + R, c: '' }); t += R;
            if (loss && i === 2) { segs.push({ s: t, e: t + R, c: 'nw-stall' }); t += R; }
          });
        } else {
          const setup = warm ? 0 : mode === 'h2' ? 2 * R : R;
          if (setup) rows[0].push({ s: 0, e: setup, c: 'nw-setup' });
          rows.forEach((segs, i) => {
            segs.push({ s: setup, e: setup + R, c: '' });
            const stalled = loss && (mode === 'h2' || i === 2);
            if (stalled) segs.push({ s: setup + R, e: setup + 2 * R, c: 'nw-stall' });
          });
        }
        const end = Math.max(...rows.flat().map(s => s.e));
        return { rows, end, conns };
      }
      const tracks = names.map(() => h('div', { class: 'nw-wf-track' }));
      const wf = h('div', { class: 'nw-wf' }, names.map((n, i) => [h('span', { class: 'nw-wf-name', title: n }, n), tracks[i]]),
        h('span', {}), h('div', { class: 'nw-axis' }, ['0', '500', '1000', '1500', '2000 ms'].map(x => h('span', {}, x))));
      const total = h('b', { class: 'nw-big' }, '—');
      const meta = h('span', { class: 'nw-stat' });
      const msg = out('');
      const NOTES = {
        h1: 'HTTP/1.1, a new connection per request, one after another: every request pays TCP + TLS (2 RTT) again. Warm has no effect; nothing is reused.',
        ka: 'HTTP/1.1 keep-alive on one connection: one handshake, but requests queue <b>one at a time</b>. The grey part is waiting in line.',
        h2: 'HTTP/2: one connection, all six streams in flight together. One handshake, one warm window.',
        h3: 'HTTP/3 over QUIC: transport and TLS handshake in <b>one</b> round trip, then multiplexed streams like HTTP/2.',
      };
      function paint() {
        const m = model();
        tracks.forEach((tr, i) => {
          tr.replaceChildren(...m.rows[i].map(sg => {
            const seg = h('span', { class: `nw-seg ${sg.c}`, style: `left:${(sg.s / SCALE) * 100}%` });
            if (sg.c === 'nw-wait') seg.style.background = 'var(--line)';
            seg.dataset.w = `${((sg.e - sg.s) / SCALE) * 100}%`;
            seg.dataset.d = String(sg.c === 'nw-wait' ? 0 : sg.s);
            seg.dataset.ms = String(sg.c === 'nw-wait' ? sg.e : sg.e - sg.s);
            return seg;
          }));
        });
        requestAnimationFrame(() => requestAnimationFrame(() => tracks.forEach(tr => tr.querySelectorAll('.nw-seg').forEach(seg => {
          seg.style.transition = `width ${seg.dataset.ms}ms linear ${seg.dataset.d}ms`;
          seg.style.width = seg.dataset.w;
        }))));
        total.textContent = ms(m.end);
        const hs = mode === 'h1' ? 6 : warm ? 0 : 1;
        meta.textContent = `${m.conns} connection${m.conns > 1 ? 's' : ''} · ${hs} handshake${hs === 1 ? '' : 's'} · RTT ${R} ms`;
        let note = NOTES[mode];
        if (loss) note += mode === 'h2' ? ' <span class="bad">One lost packet stalls every stream</span>: they all share one TCP byte stream.' : mode === 'h3' ? ' <span class="good">The lost packet only stalls /ads</span>; QUIC recovers per stream.' : ' The lost packet delays /ads and everything queued after it.';
        say(msg, note);
      }
      const modeP = picker('version', [{ label: 'HTTP/1.1 new conns', v: 'h1' }, { label: 'HTTP/1.1 keep-alive', v: 'ka' }, { label: 'HTTP/2', v: 'h2' }, { label: 'HTTP/3', v: 'h3' }], it => { mode = it.v; paint(); });
      el.append(modeP,
        h('div', { class: 'nw-stage' }, h('div', { class: 'nw-row' }, total, meta), wf,
          h('div', { class: 'nw-legend' }, h('span', { style: '--c: var(--warm)' }, 'handshake'), h('span', { style: '--c: var(--accent)' }, 'request + response'), h('span', { style: '--c: var(--err)' }, 'stalled by loss'), h('span', { style: '--c: var(--line)' }, 'queued'))),
        h('div', { class: 'controls' }, toggle('Connection already warm', on => { warm = on; paint(); }), toggle('Lose one packet', on => { loss = on; paint(); }), act('Replay', paint)),
        msg);
      paint();
    },
    deeper: [
      {
        title: 'Why OkHttp keeps connections alive',
        body: `<p>Every new connection costs DNS, a TCP handshake, a TLS handshake and a cold congestion window. On a 100 ms mobile link that is easily 300 ms before the first useful byte. OkHttp's <code>ConnectionPool</code> keeps finished connections open (by default up to 5 idle connections for 5 minutes) and hands them to the next request for the same address. With HTTP/2, many concurrent calls share a single pooled connection. This only works if the whole app shares one <code>OkHttpClient</code>; use <code>newBuilder()</code> to make variants that share the pool.</p>`,
      },
      {
        title: 'How a client picks the version',
        body: `<p>HTTP/2 is negotiated inside the TLS handshake with <em>ALPN</em>: the client offers <code>h2, http/1.1</code> and the server picks. No extra round trip. HTTP/3 needs a different transport, so the client first learns about it, for example from an <code>Alt-Svc: h3=":443"</code> response header or a DNS HTTPS record, and then tries QUIC on a later connection. OkHttp itself negotiates HTTP/2 or HTTP/1.1; it does not implement QUIC. For HTTP/3 on Android, use Cronet (Chromium's network stack, available as a library), directly or through the Cronet transport for OkHttp.</p>`,
      },
      {
        title: 'QUIC connection migration',
        body: `<p>A TCP connection dies when the phone's address changes (lesson 2). A QUIC connection is identified by <em>connection IDs</em> chosen by the endpoints, not by the address and port. When the phone moves from Wi-Fi to cellular, the client can keep using the same connection from its new address (RFC 9000 lets only clients migrate). For a user walking out the door mid-download, that is the difference between a stall and a retry.</p>`,
      },
    ],
    underHood: {
      body: `<p>HTTP/2 splits each message into frames (HEADERS, DATA) tagged with a stream ID, and interleaves frames from different streams on the connection. Flow control works per stream and per connection. HPACK keeps a table of headers already sent on this connection, so a repeated <code>Authorization</code> or <code>User-Agent</code> becomes a one-byte index. RFC 9113 states plainly that it does not address TCP head-of-line blocking; that was the motivation for QUIC.</p>`,
    },
    mistakes: [
      {
        title: 'A new client per feature',
        bad: 'class NewsRepo { private val client = OkHttpClient() }\nclass UserRepo { private val client = OkHttpClient() }',
        good: 'class NewsRepo(private val client: OkHttpClient)\nclass UserRepo(private val client: OkHttpClient)   // same injected instance',
        why: 'Each client has its own pool and threads. Two clients to the same host means two connections, two handshakes and half the reuse.',
      },
      {
        title: 'Expecting HTTP/2 to fix a lossy network',
        bad: '// "We switched to HTTP/2, so stalls on bad 4G are gone"',
        good: '// HTTP/2 removes queuing, not TCP loss stalls.\n// HTTP/3 (QUIC) recovers loss per stream.',
        why: 'On HTTP/2 every stream shares one TCP byte stream, so a single lost packet holds all of them. That is the case HTTP/3 was designed for.',
      },
    ],
    terms: [
      { term: 'Multiplexing', def: 'Running many request/response exchanges at once over one connection, as interleaved streams.' },
      { term: 'QUIC', def: 'A transport over UDP with built-in TLS 1.3, per-stream loss recovery and connection IDs (RFC 9000). HTTP/3 runs on it.' },
      { term: 'ALPN', def: 'A TLS extension where the client offers application protocols (h2, http/1.1) and the server picks one during the handshake.' },
      { term: 'Connection pool', def: 'OkHttp’s store of open connections, reused by later requests to the same address.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make a client with a longer write timeout that still shares the app’s connection pool.', code: 'val uploads = client.[[newBuilder]]()\n    .writeTimeout(2, TimeUnit.MINUTES)\n    .[[build]]()', why: '<code>newBuilder()</code> copies the client’s settings and shares its connection pool and dispatcher, so warm connections are reused.' },
      { type: 'bug', prompt: 'Every image request opens a new connection. Tap the line that causes it.', code: 'class ImageLoader {\n    suspend fun load(url: String): ByteArray = withContext(Dispatchers.IO) {\n        val client = OkHttpClient()\n        client.newCall(Request.Builder().url(url).build()).execute().use { it.body.bytes() }\n    }\n}', bug: 2, fix: '        val client = sharedClient   // one OkHttpClient for the whole app', why: 'A client built inside the function has an empty pool each time, so nothing is reused. Inject or share one client.' },
    ],
    quiz: [
      { q: 'An app loads six small resources from one host on a warm HTTP/2 connection. Roughly how long does it take with RTT 100 ms?', options: ['About 100 ms', 'About 600 ms', 'About 300 ms', 'About 1800 ms'], a: 0, why: 'All six streams go out together on the existing connection, so they finish after about one round trip. On HTTP/1.1 keep-alive they would queue: about 600 ms.' },
      { q: 'On a lossy network, why can HTTP/3 beat HTTP/2?', options: ['It compresses more', 'QUIC recovers loss per stream, so one lost packet does not stall the others', 'It skips encryption', 'It uses more TCP connections'], a: 1, why: 'HTTP/2 shares one TCP byte stream, so a loss blocks all streams until the retransmit. QUIC streams are independent.' },
      { q: 'How does a client agree on HTTP/2 with a server, without an extra round trip?', options: ['ALPN inside the TLS handshake', 'A DNS TXT record', 'A first HTTP/1.1 request with Upgrade', 'It always tries HTTP/2 first over UDP'], a: 0, why: 'The client lists h2 and http/1.1 in ALPN, and the server picks in its reply. The TLS handshake already happens, so it is free.' },
      { q: 'Your app has a Retrofit service and a separate image loader, each with <code>OkHttpClient()</code>. What do you lose?', options: ['Nothing; OkHttp shares pools globally', 'Connection reuse between them: two pools, duplicate handshakes', 'HTTP/2 support', 'TLS 1.3'], a: 1, why: 'The pool belongs to the client. Share one instance (or derive with <code>newBuilder()</code>) so both use the same warm connections.' },
    ],
  });

  // 7 ─────────────────────────────────────────────
  lessons.push({
    id: 'latency',
    title: 'Latency, bandwidth and the radio',
    tagline: 'On mobile, round trips and radio wake-ups cost more than bytes.',
    level: 'intermediate',
    body: `
<p><b>Bandwidth</b> is how many bits per second a link carries. <b>Latency</b> is how long one bit takes to get there; the round-trip time (<b>RTT</b>) is there and back. A download takes roughly <em>round trips × RTT + size ÷ bandwidth</em>. On mobile, RTT is often tens to hundreds of milliseconds, and for the small JSON responses most apps fetch, the round trips dominate. More bandwidth does not help a chain of five dependent calls; fewer round trips does.</p>
<p>The radio adds a second cost: <b>battery</b>. A cellular radio has power states. It wakes to full power to transfer, then stays in high-power states for several seconds after the last byte (the <em>tail</em>) in case more data comes. Android's docs use a 3G example: about 5 seconds at full power and 12 more at low power after each transfer. So ten small requests spread over a minute keep the radio awake far longer than one batched request.</p>
<p>The rules follow: avoid sequential chains, send independent calls in parallel, batch small background work, prefetch what the user will likely need, compress, and cache. Play with RTT and strategy below.</p>`,
    code: `// Independent calls: run them in parallel, so the screen waits ~1 RTT instead of 3
suspend fun loadHome(): Home = coroutineScope {
    val feed = async { api.feed() }
    val weather = async { api.weather() }
    val user = async { api.me() }
    Home(feed.await(), weather.await(), user.await())
}

// Small background events: queue them and send in one request, at a time the system picks
val upload = OneTimeWorkRequestBuilder<UploadEventsWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .setInitialDelay(15, TimeUnit.MINUTES)     // collect more events per radio wake-up
    .build()
WorkManager.getInstance(context)
    .enqueueUniqueWork("upload-events", ExistingWorkPolicy.KEEP, upload)`,
    remember: 'Count round trips, not bytes. Parallelize what is independent, batch what can wait.',
    visual(el) {
      let rtt = 100, n = 5, bw = 10, strategy = 'seq', cold = true;
      const KB = 20;
      const slider = (name, min, max, step, val, fmt, on) => {
        const o = h('output', {}, fmt(val));
        const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': name, oninput() { o.textContent = fmt(+this.value); on(+this.value); paint(); } });
        return h('label', { class: 'nw-slider' }, h('span', {}, name), inp, o);
      };
      const bar = h('div', { class: 'nw-bar', role: 'img', 'aria-label': 'Time breakdown' });
      const total = h('b', { class: 'nw-big' }, '');
      const meta = h('span', { class: 'nw-stat' });
      const msg = out('');
      function paint() {
        const setup = cold ? 3 * rtt : 0;
        const trips = strategy === 'seq' ? n : 1;
        const reqs = strategy === 'batch' ? 1 : n;
        const lat = trips * rtt;
        const xfer = (n * KB * 8) / (bw * 1000) * 1000;
        const sum = setup + lat + xfer;
        const parts = [
          cold && { v: rtt, c: 'var(--warm-soft)', t: 'DNS' }, cold && { v: rtt, c: 'var(--warm)', t: 'TCP' }, cold && { v: rtt, c: 'var(--warm-soft)', t: 'TLS' },
          ...Array.from({ length: trips }, (_, k) => ({ v: rtt, c: k % 2 ? 'var(--accent)' : 'var(--accent-soft)', t: trips > 1 ? `RTT ${k + 1}` : 'RTT' })),
          { v: xfer, c: 'var(--ok-soft)', t: 'data' },
        ].filter(Boolean);
        bar.replaceChildren(...parts.map(p => h('span', { style: `flex-grow:${p.v};--c:${p.c}`, title: `${p.t}: ${ms(p.v)}` }, p.t)));
        total.textContent = ms(sum);
        meta.textContent = `${reqs} request${reqs > 1 ? 's' : ''} · ${trips} round trip${trips > 1 ? 's' : ''} after setup · ${n * KB} KB`;
        const share = Math.round(((setup + lat) / sum) * 100);
        say(msg, `<b>${share}%</b> of the time is waiting on round trips, ${100 - share}% is moving bytes. ${share > 70 ? 'More bandwidth would barely help here. Cut round trips: parallelize, batch, or reuse a warm connection.' : 'Here bandwidth matters: compress responses, request smaller images, or page the data.'}`);
      }
      el.append(
        h('div', { class: 'controls' }, label('network'), act('Wi-Fi ~20 ms', () => setRtt(20)), act('Good 4G ~60 ms', () => setRtt(60)), act('Weak signal ~400 ms', () => setRtt(400))),
        h('div', { class: 'nw-stage' },
          slider('RTT', 10, 800, 10, rtt, v => `${v} ms`, v => { rtt = v; }),
          slider('Requests', 1, 12, 1, n, v => String(v), v => { n = v; }),
          slider('Bandwidth', 1, 100, 1, bw, v => `${v} Mbps`, v => { bw = v; }),
          h('div', { class: 'nw-row' }, total, meta), bar),
        picker('strategy', [{ label: 'Sequential (each waits)', v: 'seq' }, { label: 'Parallel on HTTP/2', v: 'par' }, { label: 'One batched request', v: 'batch' }], it => { strategy = it.v; paint(); }),
        h('div', { class: 'controls' }, toggle('Cold start (DNS + TCP + TLS)', on => { cold = on; paint(); }, true)),
        msg);
      const rttIn = el.querySelector('input');
      function setRtt(v) { rtt = v; rttIn.value = v; rttIn.dispatchEvent(new Event('input')); }
      paint();
    },
    deeper: [
      {
        title: 'The radio tail, visualized',
        body: `<p>This strip is one minute, one cell per second, using the 3G example from Android's docs: each transfer keeps the radio at full power for its duration plus 5 s, then 12 s at low power. Compare six small requests every ten seconds with the same data sent at once. The numbers on a modern LTE or 5G network differ and are set by the carrier, but the shape, a long tail after each burst, is the same.</p>`,
        visual(el) {
          const cells = Array.from({ length: 60 }, () => h('i'));
          const stat = h('span', { class: 'nw-stat' });
          const msg = out('');
          function run(starts, dur) {
            const st = Array(60).fill('');
            for (const s of starts) for (let k = s; k < 60; k++) {
              if (k < s + dur) st[k] = 'nw-tx';
              else if (k < s + dur + 5) { if (st[k] !== 'nw-tx') st[k] = 'nw-full'; }
              else if (k < s + dur + 17) { if (!st[k]) st[k] = 'nw-low'; }
            }
            cells.forEach((c, k) => { c.className = ''; setTimeout(() => { c.className = st[k]; }, k * 25); });
            const tx = st.filter(x => x === 'nw-tx').length, full = st.filter(x => x === 'nw-full').length, low = st.filter(x => x === 'nw-low').length;
            stat.innerHTML = `transferring <b>${tx}s</b> · full-power tail <b>${full}s</b> · low power <b>${low}s</b> · idle <b>${60 - tx - full - low}s</b>`;
            say(msg, starts.length > 1 ? '<span class="bad">The radio never rests.</span> Each request starts before the previous tail ends.' : '<span class="good">One burst, one tail, then 40 s of standby.</span> Same data, a fraction of the radio time.');
          }
          el.append(h('div', { class: 'nw-stage' }, h('div', { class: 'nw-strip', role: 'img', 'aria-label': 'Radio state per second over one minute' }, cells), stat,
            h('div', { class: 'nw-legend' }, h('span', { style: '--c: var(--accent)' }, 'transfer'), h('span', { style: '--c: var(--err)' }, 'full power tail'), h('span', { style: '--c: var(--warm)' }, 'low power'), h('span', { style: '--c: var(--sunk)' }, 'standby'))),
          h('div', { class: 'controls' }, act('6 requests, every 10 s', () => run([0, 10, 20, 30, 40, 50], 1)), act('Batched: 1 request', () => run([0], 3))), msg);
          run([0, 10, 20, 30, 40, 50], 1);
        },
      },
      {
        title: 'Compression and payload size',
        body: `<p>Bytes still matter on slow links and metered plans. OkHttp adds <code>Accept-Encoding: gzip</code> to requests and transparently decompresses gzip responses, so text APIs are usually compressed already if the server agrees. Bigger wins come from sending less: request image sizes that match the view, use WebP or AVIF, page long lists, and use HTTP caching (<code>Cache-Control</code>, <code>ETag</code>) so a repeat request costs a 304 instead of the whole body.</p>`,
      },
      {
        title: 'Prefetch, but not blindly',
        body: `<p>Downloading what the user is likely to open next turns many small wake-ups into one. The trade-off is waste: data the user never looks at still costs battery and money. Android's guidance is to prefetch in larger, less frequent chunks, and to scale it to the connection, for example only prefetching videos on an unmetered network. Background prefetch belongs in <a href="#background.workmanager">WorkManager</a> with network constraints, so the system can line it up with other work. Repeat requests are cheapest when a <a href="#data.caching">cache</a> answers them.</p>`,
      },
    ],
    mistakes: [
      {
        title: 'Sequential awaits for independent data',
        bad: 'val feed = api.feed()\nval weather = api.weather()\nval user = api.me()          // three round trips, one after another',
        good: 'coroutineScope {\n    val feed = async { api.feed() }\n    val weather = async { api.weather() }\n    val user = async { api.me() }\n}',
        why: 'Each <code>await</code> in a row adds a full round trip. Independent calls started together share the time, and on HTTP/2 they share one connection too.',
      },
      {
        title: 'Uploading every analytics event at once',
        bad: 'fun track(event: Event) = scope.launch { api.send(event) }',
        good: 'fun track(event: Event) {\n    queue.add(event)          // send in batches with WorkManager\n}',
        why: 'Each tiny request wakes the radio and pays its tail. Batching sends the same data with far fewer wake-ups.',
      },
    ],
    terms: [
      { term: 'RTT', def: 'Round-trip time: how long a packet takes to reach the server and the reply to come back.' },
      { term: 'Bandwidth', def: 'How many bits per second a link can carry.' },
      { term: 'Radio tail', def: 'The seconds a cellular radio stays in a high-power state after the last transfer, waiting for more data.' },
      { term: 'Batching', def: 'Collecting several small transfers and sending them together, to pay round trips and radio wake-ups once.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Load two independent things in parallel.', code: 'suspend fun load() = coroutineScope {\n    val a = [[async]] { api.feed() }\n    val b = async { api.me() }\n    Home(a.[[await]](), b.await())\n}', why: '<code>async</code> starts each call immediately; <code>await</code> waits for the result. Both requests are in flight at once.' },
      { type: 'bug', prompt: 'This screen waits for three round trips although the calls don’t depend on each other. Tap the line that serializes them.', code: 'suspend fun loadHome() = coroutineScope {\n    val feed = async { api.feed() }.await()\n    val weather = async { api.weather() }\n    Home(feed, weather.await())\n}', bug: 1, fix: '    val feed = async { api.feed() }', why: 'Calling <code>await()</code> right after <code>async</code> waits for the feed before the weather call even starts. Start both, then await.' },
    ],
    quiz: [
      { q: 'RTT is 200 ms, bandwidth 50 Mbps. A screen makes 4 dependent calls with 5 KB responses each. What dominates the load time?', options: ['Bandwidth', 'Round trips (about 800 ms)', 'JSON parsing', 'DNS only'], a: 1, why: '20 KB at 50 Mbps is about 3 ms. Four sequential round trips at 200 ms are 800 ms. Cut round trips, not bytes.' },
      { q: 'Why does batching small background requests save battery on cellular?', options: ['Batched data is compressed better', 'Each wake-up keeps the radio in high-power states for seconds after the transfer; fewer wake-ups mean less tail time', 'The radio uses less power for big packets', 'Batches skip TLS'], a: 1, why: 'The tail after each transfer costs more than the transfer itself for small requests. One wake-up instead of ten removes nine tails.' },
      { q: 'A user is on a weak signal with a 400 ms RTT. Which change helps the home screen the most?', options: ['Doubling the server’s bandwidth', 'Starting the three independent calls in parallel on one warm connection', 'Switching JSON to XML', 'Adding a larger read timeout'], a: 1, why: 'At high RTT, each round trip costs 400 ms. Parallel calls on a reused connection turn three round trips (plus setup) into about one.' },
    ],
  });

  // 8 ─────────────────────────────────────────────
  lessons.push({
    id: 'debugging',
    title: 'Debugging the network',
    tagline: 'Split a slow call into DNS, connect, TLS and server time before you fix anything.',
    level: 'advanced',
    body: `
<p>"The app is slow" is never one problem. A call's time splits into phases: <b>DNS</b> lookup, TCP <b>connect</b>, <b>TLS</b> handshake, sending the request, waiting for the first response byte (<b>TTFB</b>, mostly server work plus one round trip), and downloading the body. Each phase points at a different fix: DNS and connect point at the network or at missing connection reuse, a long TTFB points at the server, a long download points at payload size or bandwidth.</p>
<p>Android Studio's <b>Network Inspector</b> (View › Tool Windows › App Inspection) shows each request your app makes through <code>HttpsURLConnection</code> or OkHttp, including Retrofit, with headers, bodies and timing, and lets you set rules that rewrite responses for testing. OkHttp's <code>EventListener</code> gives exact per-phase timestamps in code. A proxy like mitmproxy or Charles shows raw traffic (with a debug-only trust config), and <code>curl</code> reproduces a call outside the app.</p>
<p>Pick a scenario in the demo. The bar and the event log show where the time went, and the verdict says what to fix.</p>`,
    code: `// Log per-phase timings for every call. Use a factory: one listener per call.
class TimingListener : EventListener() {
    private var start = 0L
    private fun log(name: String) {
        val now = System.nanoTime()
        if (name == "callStart") start = now
        Log.d("Net", name + " +" + (now - start) / 1_000_000 + " ms")
    }
    override fun callStart(call: Call) = log("callStart")
    override fun dnsStart(call: Call, domainName: String) = log("dnsStart")
    override fun dnsEnd(call: Call, domainName: String, inetAddressList: List<InetAddress>) = log("dnsEnd")
    override fun connectStart(call: Call, inetSocketAddress: InetSocketAddress, proxy: Proxy) = log("connectStart")
    override fun secureConnectStart(call: Call) = log("secureConnectStart")
    override fun secureConnectEnd(call: Call, handshake: Handshake?) = log("secureConnectEnd")
    override fun connectionAcquired(call: Call, connection: Connection) = log("connectionAcquired")
    override fun responseHeadersStart(call: Call) = log("responseHeadersStart")   // ~TTFB
    override fun callEnd(call: Call) = log("callEnd")
}

val client = OkHttpClient.Builder()
    .eventListenerFactory { TimingListener() }     // debug builds only
    .build()`,
    remember: 'Measure the phases first: DNS, connect, TLS, TTFB, download. Each one has a different owner and fix.',
    visual(el) {
      const PH = [['dns', 'DNS', 'var(--warm-soft)'], ['conn', 'connect', 'var(--warm)'], ['tls', 'TLS', 'var(--err-soft)'], ['ttfb', 'wait (TTFB)', 'var(--accent)'], ['dl', 'download', 'var(--ok)']];
      const SC = [
        { label: 'Cold call', p: { dns: 45, conn: 60, tls: 65, ttfb: 140, dl: 30 }, verdict: 'Half the time is setup (DNS + connect + TLS). Normal for the first call; make sure later calls reuse the connection.' },
        { label: 'Warm call', p: { dns: 0, conn: 0, tls: 0, ttfb: 140, dl: 30 }, pooled: true, verdict: '<span class="good">No setup at all</span>: connectionAcquired came straight from the pool. This is what shared clients buy you.' },
        { label: 'Slow DNS', p: { dns: 1300, conn: 60, tls: 65, ttfb: 140, dl: 30 }, verdict: '<span class="bad">DNS took over a second.</span> A broken or distant resolver, or an IPv6 path timing out. Check on another network; it is not your server.' },
        { label: 'Slow server', p: { dns: 0, conn: 0, tls: 0, ttfb: 1600, dl: 30 }, pooled: true, verdict: '<span class="bad">Waiting for the first byte dominates.</span> The network is fine; the server is slow to answer. Send the server team this endpoint and timing.' },
        { label: 'Big response', p: { dns: 0, conn: 0, tls: 0, ttfb: 140, dl: 1900 }, pooled: true, verdict: '<span class="bad">The download dominates.</span> Too many bytes for this link: page the list, request smaller images, check gzip is on.' },
      ];
      let tok = 0;
      const bar = h('div', { class: 'nw-bar', role: 'img', 'aria-label': 'Call phases' });
      const total = h('b', { class: 'nw-big' }, '');
      const log = h('div', { class: 'nw-log', 'aria-live': 'polite' });
      const msg = out('');
      async function show(s) {
        const t = ++tok;
        const p = s.p, sum = PH.reduce((a, [k]) => a + p[k], 0);
        bar.replaceChildren(...PH.filter(([k]) => p[k] > 0).map(([k, name, c]) => h('span', { style: `flex-grow:${p[k]};--c:${c}`, title: `${name}: ${ms(p[k])}` }, p[k] / sum > 0.12 ? name : '')));
        total.textContent = ms(sum);
        log.replaceChildren();
        let at = 0;
        const ev = [['callStart', 0]];
        if (s.pooled) ev.push(['connectionAcquired (pooled)', 0]);
        else {
          ev.push(['dnsStart', 0], ['dnsEnd', p.dns], ['connectStart', 0], ['secureConnectStart', p.conn], ['secureConnectEnd', p.tls], ['connectEnd', 0], ['connectionAcquired', 0]);
        }
        ev.push(['requestHeadersEnd', 0], ['responseHeadersStart', p.ttfb], ['responseBodyEnd', p.dl], ['callEnd', 0]);
        msg.innerHTML = '';
        for (const [name, add] of ev) {
          at += add;
          log.append(h('div', {}, h('span', { class: 'nw-t' }, `+${Math.round(at)} ms`), h('span', { class: 'nw-e' }, name)));
          await sleep(160); if (t !== tok || !el.isConnected) return;
        }
        say(msg, s.verdict);
      }
      el.append(picker('scenario', SC, s => show(s)),
        h('div', { class: 'nw-stage' }, h('div', { class: 'nw-row' }, total, label('total')), bar,
          h('div', { class: 'nw-legend' }, PH.map(([, n, c]) => h('span', { style: `--c:${c}` }, n))), log),
        msg);
      show(SC[0]);
    },
    deeper: [
      {
        title: 'Network Inspector',
        body: `<p>Run a debuggable build, open <b>View › Tool Windows › App Inspection</b>, pick the <b>Network Inspector</b> tab and select your process. The timeline shows traffic over time; select a range to list the requests in it. Each request shows size, status, duration, headers and body, and the Thread View shows which thread made it, handy for spotting calls on the wrong dispatcher. <b>Rules</b> rewrite status codes, headers or bodies of matching responses, so you can test a 500 or an empty list without touching the server.</p>`,
      },
      {
        title: 'curl: reproduce outside the app',
        body: `<p>If a call is slow in the app, run the same request from your computer. If curl is slow too, it is not your app's code. curl's <code>-w</code> option prints timings measured from the start of the call, so subtract neighbours to get each phase. <code>time_starttransfer</code> minus <code>time_appconnect</code> is roughly the server's TTFB.</p>`,
        code: `curl -s -o /dev/null https://api.example.com/v1/haberler \\
  -H "Authorization: Bearer $TOKEN" \\
  -w "dns     %{time_namelookup}\\nconnect %{time_connect}\\ntls     %{time_appconnect}\\nttfb    %{time_starttransfer}\\ntotal   %{time_total}\\nproto   %{http_version}\\n"`,
      },
      {
        title: 'Proxies and logging',
        body: `<p>An intercepting proxy (mitmproxy, Charles, Proxyman) sits between the phone and the internet and decrypts HTTPS with its own CA. For your app to accept it, trust user CAs in <code>debug-overrides</code> only (lesson 5). For quick logs without a proxy, OkHttp's <code>HttpLoggingInterceptor</code> prints requests and responses to Logcat. Add it to debug builds only, and redact the <code>Authorization</code> header so tokens never land in logs (see <a href="#data.auth">auth tokens</a>).</p>`,
        code: `if (BuildConfig.DEBUG) {
    val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
        redactHeader("Authorization")
    }
    builder.addInterceptor(logging)
}`,
      },
    ],
    underHood: {
      body: `<p>OkHttp calls <code>EventListener</code> methods on the thread running the call, at fixed points: <code>callStart</code>, then <code>dnsStart</code>/<code>dnsEnd</code>, <code>connectStart</code>, <code>secureConnectStart</code>/<code>secureConnectEnd</code>, <code>connectEnd</code>, <code>connectionAcquired</code>, request and response header and body events, <code>connectionReleased</code> and <code>callEnd</code>. A pooled connection skips the DNS and connect events entirely, which is how you can count reuse in production metrics. Keep listeners cheap: they run inside every call.</p>`,
    },
    mistakes: [
      {
        title: 'One shared listener with a timing field',
        bad: 'object Timing : EventListener() {\n    var start = 0L      // overwritten by concurrent calls\n}\nbuilder.eventListener(Timing)',
        good: 'builder.eventListenerFactory { TimingListener() }   // one per call',
        why: 'Calls run at the same time. A single listener’s field is overwritten by each new call, so the timings mix. A factory makes a fresh listener per call.',
      },
      {
        title: 'Logging bodies and tokens in release',
        bad: 'builder.addInterceptor(HttpLoggingInterceptor().apply { level = Level.BODY })',
        good: 'if (BuildConfig.DEBUG) builder.addInterceptor(HttpLoggingInterceptor().apply {\n    level = Level.BASIC; redactHeader("Authorization")\n})',
        why: 'Body logging in release writes user data and tokens to Logcat and slows every call. Keep it to debug builds, with secrets redacted.',
      },
    ],
    terms: [
      { term: 'TTFB', def: 'Time to first byte: from sending the request to receiving the first byte of the response. Mostly server time plus one round trip.' },
      { term: 'Network Inspector', def: 'Android Studio’s App Inspection tool that lists an app’s HttpsURLConnection and OkHttp requests with timing, headers and bodies.' },
      { term: 'EventListener', def: 'An OkHttp callback interface that reports each phase of a call (DNS, connect, TLS, headers, body) as it happens.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Measure TLS time and attach a fresh listener to every call.', code: 'override fun [[secureConnectStart]](call: Call) = mark("tls start")\noverride fun secureConnectEnd(call: Call, handshake: Handshake?) = mark("tls end")\n\nOkHttpClient.Builder().[[eventListenerFactory]] { TimingListener() }', why: '<code>secureConnectStart</code>/<code>secureConnectEnd</code> bracket the TLS handshake. <code>eventListenerFactory</code> creates one listener per call so state does not mix.' },
      { type: 'bug', prompt: 'This log shows a "slow server", but one line is wrong about where the time went. Tap it.', code: '+0 ms     callStart\n+0 ms     connectionAcquired (pooled)\n+2 ms     requestHeadersEnd\n+1650 ms  responseHeadersStart   // slow DNS lookup\n+1680 ms  callEnd', bug: 3, fix: '+1650 ms  responseHeadersStart   // server took ~1.6 s to answer (TTFB)', why: 'The connection came from the pool, so there was no DNS or connect. The gap before the first response header is waiting for the server.' },
    ],
    quiz: [
      { q: 'A call shows: dns 0, connect 0, tls 0, TTFB 1800 ms, download 20 ms. Where is the problem?', options: ['The phone’s DNS resolver', 'The server’s processing time', 'Missing connection reuse', 'The response is too large'], a: 1, why: 'No setup means a pooled connection, and the download is tiny. Nearly all the time is waiting for the server’s first byte.' },
      { q: 'Your cold-start API call spends 60% in DNS + connect + TLS, and later calls do too. What do you check first?', options: ['Whether the app creates a new OkHttpClient per call', 'Whether JSON parsing is slow', 'The server’s database indexes', 'The image sizes'], a: 0, why: 'Setup on every call means nothing is reused. The usual cause is a client per call or per repository instead of one shared client.' },
    ],
  });

  Lab.addTrack({
    id: 'net',
    title: 'Computer networks',
    description: 'How data really moves under your app: layers, IP, DNS, TCP and UDP, TLS, HTTP/2 and HTTP/3, latency and debugging.',
    requires: ['kotlin'],
    css,
    lessons,
  });
})();
