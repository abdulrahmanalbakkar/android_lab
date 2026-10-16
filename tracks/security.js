/* Security and privacy track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed sec-.
   Signing keys and upload keys live in the build track; runtime permissions basics live in the android track. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const line = (o, html, cls = '') => { const d = h('div', { class: `line drop-in ${cls}`, html }); o.append(d); return d; };
  const trim = (o, n) => { while (o.querySelectorAll('.line').length > n) o.querySelector('.line').remove(); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const toggle = (id, label, checked, onchange) => {
    const input = h('input', { type: 'checkbox', id, checked: checked || null, onchange() { onchange(input.checked); } });
    return { input, el: h('label', { class: 'switch', for: id }, input, h('span', { html: label })) };
  };
  // visual() runs before the page is attached, so loops wait for the node to appear and stop once it leaves.
  const alive = node => { let seen = false; const t0 = Date.now(); return () => { if (node.isConnected) { seen = true; return true; } return !seen && Date.now() - t0 < 5000; }; };
  const hex = n => Array.from({ length: n }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');

  const css = `
.sec-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); }
.sec-row { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; min-width: 0; }
.sec-stat { font: 600 0.85rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.sec-stat b { color: var(--ink); }
.sec-stat .sec-badnum { color: var(--err); }
.sec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr)); gap: 8px; min-width: 0; }
.sec-card { display: grid; gap: 4px; align-content: start; min-width: 0; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); transition: border-color 0.25s, background 0.25s; }
.sec-card b { font: 600 0.82rem var(--mono); overflow-wrap: anywhere; }
.sec-card small { color: var(--muted); font-size: 0.8rem; line-height: 1.35; }
.sec-state { justify-self: start; font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.sec-card.sec-bad { border-color: var(--err); background: var(--err-soft); }
.sec-card.sec-bad .sec-state { background: var(--err); color: var(--surface); }
.sec-card.sec-warn { border-color: var(--warm); background: var(--warm-soft); }
.sec-card.sec-warn .sec-state { background: var(--warm); color: var(--surface); }
.sec-card.sec-safe { border-color: var(--ok); }
.sec-card.sec-safe .sec-state { background: var(--ok-soft); color: var(--ok); }

/* two or three zones side by side */
.sec-zones { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; min-width: 0; }
.sec-zone { flex: 1 1 180px; min-width: 0; display: grid; gap: 10px; align-content: start; padding: 12px; border-radius: 14px; border: 1px solid var(--line); background: var(--bg); transition: border-color 0.25s, background 0.25s; }
.sec-zone.sec-hw { background: var(--code-bg); border-color: transparent; color: var(--code-ink); }
.sec-zone.sec-hw .sec-label { color: var(--t-c); }
.sec-zone.on { border-color: var(--accent); }
.sec-zone.sec-hw.on { box-shadow: 0 0 0 2px var(--hi); }
.sec-zone.sec-evil { border-color: var(--err); background: var(--err-soft); }
.sec-pile { display: flex; flex-wrap: wrap; gap: 6px; min-height: 40px; align-items: center; min-width: 0; }
.sec-pill { display: inline-block; max-width: 100%; font: 600 0.8rem var(--mono); padding: 6px 10px; border-radius: 9px; background: var(--surface); border: 2px solid var(--ink); color: var(--ink); overflow-wrap: anywhere; }
.sec-pill.sec-plain { border-color: var(--warm); color: var(--warm); }
.sec-pill.sec-cipher { border-color: var(--ok); color: var(--ok); }
.sec-pill.sec-leak { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.sec-key { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 1.5px dashed var(--t-k); font: 600 0.8rem var(--mono); color: var(--t-k); min-width: 0; }
.sec-key.sec-locked { border-color: var(--t-s); color: var(--t-s); }
.sec-lock { flex: none; position: relative; width: 14px; height: 11px; margin-top: 6px; border-radius: 2px; background: currentColor; }
.sec-lock::before { content: ""; position: absolute; left: 2px; top: -7px; width: 10px; height: 9px; border: 2px solid currentColor; border-bottom: 0; border-radius: 6px 6px 0 0; box-sizing: border-box; }
.sec-empty { color: var(--muted); font-size: 0.85rem; }
.sec-hw .sec-empty { color: var(--t-c); }
.sec-tag { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 1px 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); }

/* 3 at rest: ciphertext bytes */
.sec-file { display: grid; gap: 4px; min-width: 0; padding: 8px 10px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); font: 500 0.78rem/1.5 var(--mono); }
.sec-file > span:first-child { color: var(--t-c); overflow-wrap: anywhere; }
.sec-bytes { overflow-wrap: anywhere; word-break: break-all; }
.sec-hx-p { color: var(--t-f); } .sec-hx-n { color: var(--t-t); } .sec-hx-c { color: var(--code-ink); } .sec-hx-t { color: var(--t-k); }
.sec-hx-x { background: rgba(255, 138, 155, 0.35); color: var(--t-e); border-radius: 3px; }
.sec-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font: 500 0.74rem var(--mono); color: var(--muted); }
.sec-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; background: var(--code-bg); border: 1px solid var(--line); }

/* 4 network path */
.sec-path { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; min-width: 0; }
.sec-node { position: relative; display: grid; gap: 8px; justify-items: center; align-content: start; min-width: 0; padding: 10px 8px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); text-align: center; transition: border-color 0.25s, background 0.25s; }
.sec-node:not(:last-child)::after { content: "→"; position: absolute; right: -10px; top: 14px; transform: translateX(50%); color: var(--muted); font-weight: 700; }
.sec-node b { font: 600 0.78rem var(--mono); overflow-wrap: anywhere; }
.sec-node small { font-size: 0.76rem; color: var(--muted); line-height: 1.3; overflow-wrap: anywhere; }
.sec-node.on { border-color: var(--accent); }
.sec-node.sec-evil { border-color: var(--err); background: var(--err-soft); }
.sec-node.sec-ok { border-color: var(--ok); background: var(--ok-soft); }
.sec-well { min-height: 34px; display: grid; place-items: center; max-width: 100%; }
.sec-packet { font: 600 0.72rem var(--mono); padding: 4px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); max-width: 100%; overflow-wrap: anywhere; }
.sec-packet.sec-open { background: var(--err); color: var(--surface); }
.sec-packet.sec-dead { background: var(--sunk); color: var(--muted); text-decoration: line-through; }

/* 5 terminal */
.sec-term { font: 500 0.8rem/1.6 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 10px 14px; min-height: 9.5em; overflow-x: auto; }
.sec-term .line { white-space: pre; }
.sec-term .line::before { content: ""; }
.sec-term .sec-hit { background: rgba(255, 138, 155, 0.22); color: var(--t-e); border-radius: 4px; padding: 0 2px; }
.sec-flag { font: 600 0.74rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 10px; border-radius: 999px; background: var(--ok-soft); color: var(--ok); }
.sec-flag.sec-bad { background: var(--err-soft); color: var(--err); }

/* 6 biometric phone */
.sec-bio { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; min-width: 0; }
.sec-bio .phone { position: relative; justify-content: center; gap: 8px; text-align: center; }
.sec-ph-title { font: 700 1rem var(--display); }
.sec-ph-sub { font-size: 0.82rem; color: var(--muted); }
.sec-ph-big { font: 800 1.4rem var(--display); color: var(--accent); }
.sec-sheet { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 10px 14px; border-radius: 16px 16px 0 0; background: var(--sunk); display: grid; gap: 6px; justify-items: center; box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.18); animation: drop-in 0.35s ease-out both; }
.sec-sheet b { font: 700 0.86rem var(--display); }
.sec-sheet small { font-size: 0.74rem; color: var(--muted); }
.sec-sheet .cmd { font-size: 0.74rem; padding: 5px 9px; width: 100%; }
.sec-fp { width: 34px; height: 34px; border-radius: 50%; border: 3px double var(--accent); }
.sec-fp.sec-no { border-color: var(--err); }
.sec-bio .out { min-height: 6.5em; }

/* 7 privacy */
.sec-feat { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--warm); background: var(--surface); min-width: 0; transition: border-color 0.25s; }
.sec-feat.sec-lean { border-color: var(--ok); }
.sec-feat > div { display: grid; gap: 2px; min-width: 0; }
.sec-feat b { font: 700 0.92rem var(--body); }
.sec-feat small { color: var(--muted); font-size: 0.8rem; line-height: 1.35; overflow-wrap: anywhere; }
.sec-feat .cmd { justify-self: end; }
.sec-feats { display: grid; gap: 8px; min-width: 0; }
.sec-manifest { display: grid; gap: 2px; min-width: 0; padding: 10px 12px; border-radius: 12px; background: var(--code-bg); color: var(--code-ink); font: 500 0.76rem/1.6 var(--mono); overflow-x: auto; }
.sec-manifest span { white-space: pre; }
.sec-manifest .sec-gone { color: var(--t-c); text-decoration: line-through; }
.sec-ds { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.sec-ds span { font: 600 0.76rem var(--mono); padding: 3px 9px; border-radius: 999px; background: var(--warm-soft); color: var(--warm); }
.sec-ds span.sec-lite { background: var(--ok-soft); color: var(--ok); }
.sec-meter { height: 8px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.sec-meter span { display: block; height: 100%; background: var(--warm); border-radius: 99px; transition: width 0.5s, background 0.5s; }
.sec-meter span.sec-low { background: var(--ok); }
/* depth demos */
.sec-chks { display: grid; gap: 6px; min-width: 0; }
.sec-chk { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 10px; align-items: center; padding: 6px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font-size: 0.86rem; min-width: 0; transition: border-color 0.25s, background 0.25s; }
.sec-chk.sec-now { border-color: var(--accent); }
.sec-chk.sec-pass { border-color: var(--ok); }
.sec-chk.sec-pass .sec-state { background: var(--ok-soft); color: var(--ok); }
.sec-chk.sec-fail { border-color: var(--err); background: var(--err-soft); }
.sec-chk.sec-fail .sec-state { background: var(--err); color: var(--surface); }
.sec-recs { display: grid; gap: 6px; min-width: 0; }
.sec-rec { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center; padding: 6px 10px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); font: 500 0.78rem var(--mono); min-width: 0; transition: box-shadow 0.25s; }
.sec-rec > span { overflow-wrap: anywhere; min-width: 0; }
.sec-rec.sec-fail { box-shadow: inset 4px 0 0 var(--t-e); }
.sec-rs { margin-left: auto; font-weight: 600; }
.sec-rs.sec-y { color: var(--hi); }
.sec-rs.sec-n { color: var(--t-e); }
.sec-key.sec-prim { border-style: solid; }
.sec-key.sec-off { opacity: 0.45; text-decoration: line-through; }
@media (max-width: 520px) {
  .sec-path { grid-template-columns: minmax(0, 1fr); }
  .sec-node:not(:last-child)::after { content: "↓"; right: 50%; top: auto; bottom: -18px; }
  .sec-bio { grid-template-columns: minmax(0, 1fr); }
  .sec-feat { grid-template-columns: minmax(0, 1fr); }
  .sec-feat .cmd { justify-self: start; }
}
/* depth pass 2 */
.sec-chk.sec-d2-warn { border-color: var(--warm); background: var(--warm-soft); }
.sec-chk.sec-d2-warn .sec-state { background: var(--warm); color: var(--surface); }
.sec-d2-mono { font: 600 0.8rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.sec-state.sec-d2-ok { background: var(--ok-soft); color: var(--ok); }
.sec-d2-ui { justify-items: start; }
.sec-d2-sheet { justify-items: center; text-align: center; width: 100%; max-width: 340px; justify-self: center; }
.sec-d2-sheet .sec-meter { width: 100%; }
.sec-d2-map { position: relative; aspect-ratio: 2 / 1; min-height: 100px; border-radius: 10px; background-color: var(--surface); background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 25% 50%; overflow: hidden; }
.sec-d2-area { position: absolute; left: 50%; top: 0; width: 25%; height: 50%; box-sizing: border-box; background: var(--accent-soft); border: 2px solid var(--accent); opacity: 0; transition: opacity 0.3s; }
.sec-d2-dot { position: absolute; left: 61%; top: 33%; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 6px var(--accent-soft); opacity: 0; transition: opacity 0.3s; }
.sec-d2-map.sec-d2-fine .sec-d2-dot, .sec-d2-map.sec-d2-coarse .sec-d2-area { opacity: 1; }
/* credential manager */
.sec-cm { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: start; min-width: 0; }
.sec-cm-phone { position: relative; justify-content: flex-start; padding-top: 28px; text-align: center; }
.sec-cm-sheet { gap: 5px; }
.sec-cm-sheet .cmd { white-space: normal; overflow-wrap: anywhere; }
.sec-cm-store { display: grid; gap: 4px; min-width: 0; }
.sec-cm-chips { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.sec-cm-chip { font: 600 0.74rem var(--mono); padding: 3px 9px; border-radius: 999px; border: 1px dashed var(--line); color: var(--muted); overflow-wrap: anywhere; transition: background 0.25s, color 0.25s, border-color 0.25s; }
.sec-cm-chip.sec-cm-on { border-style: solid; border-color: var(--ok); background: var(--ok-soft); color: var(--ink); }
@media (max-width: 640px) { .sec-cm { grid-template-columns: minmax(0, 1fr); } .sec-cm-phone { order: -1; } }
`;

  Lab.addTrack({
    id: 'security',
    title: 'Security and privacy',
    description: 'Protect keys, data and traffic on devices you do not control, and collect only what you need.',
    group: 'Shipping',
    requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'threats',
        title: 'Threat model for mobile apps',
        tagline: 'Your app runs on the attacker’s phone. Plan for that.',
        level: 'intermediate',
        body: `
<p>A threat model is a short list: what you protect, who wants it, and what they can do. For a mobile app, assume three attackers. Anyone can download your APK and decompile it with free tools. Some users root their own phone, which lets them read your private files and change what your functions return at runtime. And anyone on the same Wi-Fi can try to read or alter your traffic.</p>
<p>Some things you can protect well. Keys in the Android Keystore stay in secure hardware. HTTPS keeps traffic private. Data in your app’s private storage is sandboxed from other apps. Other things you can’t protect at all. A string in your APK is public. A check in your code, like <code>if (user.isPremium)</code>, can be patched out. On a rooted phone, the owner can make your app do anything it is able to do.</p>
<p>So put every decision that matters on your server. The app shows UI and asks. The server checks the session, the subscription and the input, and says yes or no. Client-side checks are still worth having for user experience, just never as the only line.</p>`,
        code: `// Anyone can patch this out of the APK or flip it with Frida.
fun canDownload(user: User): Boolean = user.isPremium

// The server decides. The app only shows what it gets back.
interface TracksApi {
    @GET("v1/tracks/{id}/download")
    suspend fun downloadUrl(@Path("id") id: String): DownloadUrl   // 403 unless the server sees a subscription
}

class TracksRepository(private val api: TracksApi) {
    suspend fun download(id: String): Result<DownloadUrl> =
        runCatching { api.downloadUrl(id) }   // the session token rides in an OkHttp interceptor
}

// A one-screen threat model for a feature:
// Asset:    paid audio files
// Attacker: user with a rooted phone, anyone with the APK
// Can do:   read the APK, patch checks, replay requests
// Defense:  server checks the subscription on every download URL, URLs expire in 5 minutes`,
        remember: 'The APK is public and the phone may belong to the attacker. Decisions that matter run on the server.',
        terms: [
          { term: 'Threat model', def: 'A short list of what you protect, who might attack it, what they can do, and which defenses address each risk.' },
          { term: 'Rooted device', def: 'A phone where the owner has gained superuser access, so they can read any app’s files and change running code.' },
          { term: 'Frida', def: 'A dynamic instrumentation toolkit that injects scripts into a running app to read or replace what its functions do.' },
          { term: 'Decompiler', def: 'A tool such as jadx that turns the dex bytecode in an APK back into readable Java or Kotlin-like source.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'On the server (Ktor), refuse a request with no valid session, then refuse a user without a subscription.', code: 'post("/v1/redeem") {\n    val user = call.principal<UserPrincipal>()\n        ?: return@post call.respond(HttpStatusCode.[[Unauthorized]])\n    if (!subscriptions.isActive(user.id)) {\n        return@post call.respond(HttpStatusCode.[[Forbidden|PaymentRequired]])\n    }\n    call.respond(rewards.grant(user.id))\n}', why: '401 means “I don’t know who you are”. 403 means “I know you, and the answer is no”. Both checks live where the user can’t edit them.' },
          { type: 'bug', prompt: 'This screen leaks admin data to anyone with a rooted phone. Tap the line that trusts the wrong source.', code: 'suspend fun loadAdmin(api: Api, tokens: TokenStore, prefs: SharedPreferences): AdminData? {\n    val token = tokens.read() ?: return null\n    val role = prefs.getString("role", "user")\n    return if (role == "admin") api.adminData(token) else null\n}', bug: 2, fix: '    val role = api.me(token).role   // ask the server, and adminData() checks the role again', why: 'A rooted user can edit <code>shared_prefs/*.xml</code> and set <code>role</code> to <code>admin</code>. Ask the server who the user is, and make the admin endpoint enforce the role too.' },
        ],
        quiz: [
          { q: 'Where should the check “is this user allowed to download this file?” live?', options: ['In the app, behind R8 obfuscation', 'On the server, for every request', 'In EncryptedSharedPreferences'], a: 1, why: 'Code on the device can be patched or hooked. Only the server sees a request it can trust its own answer about.' },
          { q: 'What can the owner of a rooted phone do to your app?', options: ['Only read public files', 'Read your private files and change what your functions return', 'Nothing, because of the app sandbox'], a: 1, why: 'Root removes the sandbox for that user. Tools like Frida can hook any method while the app runs.' },
          { q: 'Which of these stays protected even on a rooted phone?', options: ['A string constant in your APK', 'Private key material in a hardware-backed Keystore', 'A boolean in DataStore'], a: 1, why: 'Hardware-backed keys can’t be copied out. The attacker can still ask your app to use the key while it runs, which is why server checks still matter.' },
        ],
        deeper: [
          {
            title: 'Signed in is not the same as allowed',
            body: `<p>Nobody needs root to send your server strange requests. A user can call your API with curl and their own valid session token, or replay a captured request with new values. So the server checks every field, not just the session: is this order theirs, does this price match the catalog, is this quantity positive.</p>
<p>The classic bug is an ID swap. <code>GET /v1/orders/1043</code> returns someone else’s order because the server checked that the caller is signed in, but not that they own order 1043. OWASP ranks this, broken object level authorization, as the top API security risk.</p>`,
            code: `// Ktor: authorize the object, and never take a price from the client
get("/v1/orders/{id}") {
    val user = call.principal<UserPrincipal>()!!
    val order = orders.find(call.parameters["id"]!!.toLong())
    if (order == null || order.ownerId != user.id) return@get call.respond(HttpStatusCode.NotFound)
    call.respond(order)
}

post("/v1/checkout") {
    val req = call.receive<CheckoutRequest>()            // { sku }, any price field is ignored
    val price = catalog.priceOf(req.sku) ?: return@post call.respond(HttpStatusCode.BadRequest)
    call.respond(payments.charge(call.principal<UserPrincipal>()!!.id, price))
}`,
            visual(el) {
              let oid = 1042, price = '49.99', busy = false;
              const term = h('div', { class: 'sec-term', 'aria-live': 'polite' });
              const flag = h('span', { class: 'sec-flag' }, 'nothing leaked');
              const srv = toggle('sec-d2-thr-srv', 'server checks owner and price', false, v => { term.replaceChildren(); tl(`<span class="muted"># server redeployed: ${v ? 'checks owner and price' : 'checks the session only'}</span>`); });
              const tl = (html, cls) => { line(term, html, cls); trim(term, 6); };
              const mark = (bad, msg) => { flag.textContent = msg; flag.classList.toggle('sec-bad', bad); replay(flag, 'pop'); };
              const idBtns = [1042, 1043].map((n, i) => act(n === 1042 ? '1042 (yours)' : '1043 (Ada’s)', () => { oid = n; press(idBtns, idBtns[i]); }));
              const prBtns = ['49.99', '0.01'].map((p, i) => act(`"price": ${p}`, () => { price = p; press(prBtns, prBtns[i]); }));
              press(idBtns, idBtns[0]); press(prBtns, prBtns[0]);
              const send = async (req, answer) => {
                if (busy) return; busy = true;
                tl(`$ curl -H "Authorization: Bearer eyJ…" ${req}`);
                await sleep(450); if (!term.isConnected) return;
                answer(); busy = false;
              };
              const getOrder = () => send(`https://api.shop.example/v1/orders/${oid}`, () => {
                if (oid === 1042) { tl('<span class="good">200 OK</span> {"id":1042,"owner":"you","address":"…"}'); mark(false, 'your own data'); }
                else if (srv.input.checked) { tl('<span class="good">404 Not Found</span> <span class="muted">// not yours, so it doesn’t exist for you</span>'); mark(false, 'nothing leaked'); }
                else { tl('<span class="bad">200 OK</span> {"id":1043,"owner":"ada","address":"<span class="sec-hit">12 Elm St</span>"}'); mark(true, 'leaked Ada’s address'); }
              });
              const checkout = () => send(`-d '{"sku":"pro_year","price":${price}}' …/v1/checkout`, () => {
                if (price === '49.99') { tl('<span class="good">200 OK</span> {"charged":49.99}'); mark(false, 'fair price'); }
                else if (srv.input.checked) { tl('<span class="good">200 OK</span> {"charged":49.99} <span class="muted">// price read from the catalog</span>'); mark(false, 'price field ignored'); }
                else { tl('<span class="bad">200 OK</span> {"charged":<span class="sec-hit">0.01</span>}'); mark(true, 'a year of Pro for 1 cent'); }
              });
              tl('<span class="muted"># a valid session token, copied from the app. No root needed.</span>');
              el.append(
                h('div', { class: 'controls' }, srv.el, flag),
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Order id'), idBtns, cmd('GET /v1/orders/{id}', getOrder)),
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Body'), prBtns, cmd('POST /v1/checkout', checkout)),
                term);
            },
          },
          {
            title: 'The fourth attacker: another app on the phone',
            body: `<p>Other apps can’t read your files, but they can talk to anything you export. An exported Activity, Service, BroadcastReceiver or ContentProvider accepts Intents from every app on the phone. Since Android 12, a component with an intent filter must declare <code>android:exported</code> explicitly, so make it a decision.</p>
<p>A deep link Activity has to be exported, or links from the browser and email can’t reach it. So treat every extra and every URL as untrusted input. Check the scheme and host before you load anything, and keep components that only your app uses unexported.</p>`,
            code: `class WebActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val uri = intent.data
        if (uri == null || uri.scheme != "https" || uri.host != "news.example.com") {
            finish()                     // not ours: refuse
            return
        }
        setContent { ArticleWebView(uri.toString()) }
    }
}`,
            visual(el) {
              let busy = false;
              const P = (t, d) => { const well = h('div', { class: 'sec-well' }); const s = h('small', {}, d); return Object.assign(h('div', { class: 'sec-node' }, h('b', {}, t), s, well), { well, s }); };
              const from = P('Sender', 'pick one below'), sys = P('Android', 'routes the Intent'), act0 = P('WebActivity', 'shows a web page');
              const o = out('Pick a sender.');
              const exp = toggle('sec-d2-thr-exp', 'android:exported="true"', true, () => o.replaceChildren('Manifest changed. Send again.'));
              const val = toggle('sec-d2-thr-val', 'check scheme and host', false, () => o.replaceChildren('Code changed. Send again.'));
              const reset = () => [from, sys, act0].forEach(n => { n.classList.remove('on', 'sec-evil', 'sec-ok'); n.well.replaceChildren(); });
              const pk = (t, c = '') => h('span', { class: `sec-packet pop ${c}` }, t);
              async function send(evil) {
                if (busy) return; busy = true; reset();
                from.s.textContent = evil ? 'com.evil.flashlight' : 'Gmail';
                from.classList.add('on', ...(evil ? ['sec-evil'] : [])); from.well.append(pk(evil ? 'evil.example/login' : 'news.example.com/a/42', evil ? 'sec-open' : ''));
                await sleep(500); if (!el.isConnected) return;
                sys.classList.add('on'); sys.well.append(pk('Intent'));
                await sleep(500); if (!el.isConnected) return;
                if (!exp.input.checked) {
                  sys.classList.add('sec-ok'); act0.well.append(pk('blocked', 'sec-dead'));
                  say(o, evil ? '<span class="good">SecurityException:</span> Permission Denial: WebActivity not exported. <span class="muted">But your real links are dead too. Try Gmail.</span>'
                    : '<span class="bad">No app matches.</span> Unexported components can’t be reached from other apps, so the link opens in the browser instead.');
                } else if (evil && !val.input.checked) {
                  act0.classList.add('sec-evil'); act0.well.append(pk('loads evil.example', 'sec-open')); replay(act0, 'shake');
                  say(o, '<span class="bad">Phishing inside your app.</span> A fake login page loads in your WebView, with your app’s name on top.');
                } else if (evil) {
                  act0.classList.add('sec-ok'); act0.well.append(pk('finish()', 'sec-dead'));
                  say(o, '<span class="good">Refused.</span> The host is not news.example.com, so WebActivity closes.');
                } else {
                  act0.classList.add('sec-ok'); act0.well.append(pk('article 42'));
                  say(o, '<span class="good">Opened.</span> A real link from an email reaches your article.');
                }
                busy = false;
              }
              el.append(
                h('div', { class: 'controls' }, exp.el, val.el),
                h('div', { class: 'sec-path' }, from, sys, act0),
                h('div', { class: 'controls' }, act('Tap a link in an email', () => send(false)), act('Malicious app sends an Intent', () => send(true))),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>On a rooted phone, <code>frida-server</code> runs as root and attaches to your app’s process. It loads an agent library into the process and runs JavaScript inside it. Through the ART runtime, that script can find any class and replace a method’s implementation, so <code>isPremium()</code> returns whatever the script says. Without root, an attacker can repackage your APK with the Frida gadget library, re-sign it, and get the same power inside their copy.</p>
<p>Decompiling needs no tricks at all. An APK is a zip file. jadx reads <code>classes.dex</code> and rebuilds Java-like source. R8 shortens names but keeps the logic and the strings.</p>`,
          code: `// hook.js, run with: frida -U -f com.shop -l hook.js
Java.perform(() => {
  const User = Java.use("com.shop.User");
  User.isPremium.implementation = function () {
    return true;
  };
});`,
        },
        mistakes: [
          {
            title: 'Root detection as the defense',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (isRooted()) { finish(); return }   // the only protection
    showPremiumContent()
}`,
            good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    lifecycleScope.launch {
        // The server checks the session, the subscription and an integrity verdict.
        api.premiumContent(integrityToken())
            .onSuccess(::show)
            .onFailure { showPaywall() }
    }
}`,
            why: '<code>isRooted()</code> is a function in your APK, and one Frida line makes it return false. A root check can raise the cost a little. The server decides what the user gets.',
          },
          {
            title: 'Shipping the dev menu in release builds',
            bad: `if (BuildConfig.DEBUG || prefs.getBoolean("dev_menu", false)) {
    showDevMenu()   // switch backend, skip paywall, fake purchases
}`,
            good: `// src/debug/kotlin/com/shop/DevMenu.kt holds the real menu.
// src/release/kotlin/com/shop/DevMenu.kt is empty:
object DevMenu {
    fun install(activity: Activity) = Unit
}`,
            why: 'A rooted user can set <code>dev_menu</code> in the prefs file, and the menu code is in the APK for anyone to call. Keep debug tools in the debug source set, so release builds don’t contain them.',
          },
        ],
        visual(el) {
          const assets = [
            { id: 'key', name: 'API key in BuildConfig', where: 'string in classes.dex' },
            { id: 'check', name: 'if (user.isPremium)', where: 'check in app code' },
            { id: 'prefs', name: 'Token in plain prefs', where: 'shared_prefs/session.xml' },
            { id: 'ks', name: 'Token sealed by a Keystore key', where: 'key in secure hardware' },
            { id: 'http', name: 'http:// request', where: 'on the network' },
            { id: 'https', name: 'https:// request', where: 'on the network' },
            { id: 'server', name: 'Check on your server', where: 'your backend' },
          ];
          const attacks = [
            { id: 'apk', label: 'Download your APK', src: '$ jadx app-release.apk', hits: { key: ['bad', 'read straight from the dex'], check: ['bad', 'patched out, app re-signed'] },
              say: 'An APK is a zip anyone can download. jadx turns it back into source. Strings, endpoints and logic are all readable, and a patched copy can skip any check.' },
            { id: 'root', label: 'Root a phone', src: '$ frida -U -f com.shop -l hook.js', hits: { prefs: ['bad', 'file copied out'], check: ['bad', 'hooked to return true'], ks: ['warn', 'usable while the app runs, never copied'] },
              say: 'Root opens every private file and lets Frida rewrite what functions return. The Keystore key stays in hardware, but the attacker can make your app use it.' },
            { id: 'wifi', label: 'Own the Wi-Fi', src: '$ mitmproxy --mode transparent', hits: { http: ['bad', 'read and changed in transit'], https: ['safe', 'sees only the host name'] },
              say: 'On a hostile network, plain HTTP is open to read and edit. HTTPS holds: the attacker sees which host you talk to, not what you send.' },
          ];
          const cards = {};
          const grid = h('div', { class: 'sec-grid' }, assets.map(a => {
            const state = h('span', { class: 'sec-state' }, 'untouched');
            const note = h('small', {}, a.where);
            const c = h('div', { class: 'sec-card' }, state, h('b', {}, a.name), note);
            cards[a.id] = { c, state, note, level: '' };
            return c;
          }));
          const stat = h('span', { class: 'sec-stat' });
          const o = out('Pick what the attacker can do. Watch which assets fall.');
          const used = new Set();
          let busy = false;
          const paintStat = () => {
            const bad = Object.values(cards).filter(x => x.level === 'bad').length;
            stat.innerHTML = `exposed: <span class="${bad ? 'sec-badnum' : ''}">${bad}</span> of ${assets.length} · attacks used: <b>${used.size}</b> of 3`;
          };
          const rank = { '': 0, safe: 1, warn: 2, bad: 3 };
          const btns = attacks.map(a => act(a.label, async function () {
            if (busy) return;
            busy = true; used.add(a.id); this.setAttribute('aria-pressed', 'true');
            say(o, `<span class="muted">${a.src}</span><br>${a.say}`);
            for (const [id, [lvl, why]] of Object.entries(a.hits)) {
              const x = cards[id];
              if (rank[lvl] >= rank[x.level]) {
                x.level = lvl;
                x.c.classList.remove('sec-bad', 'sec-warn', 'sec-safe');
                x.c.classList.add('sec-' + lvl);
                x.state.textContent = lvl === 'bad' ? 'exposed' : lvl === 'warn' ? 'weakened' : 'holds';
              }
              x.note.textContent = why;
              replay(x.c, lvl === 'bad' ? 'shake' : 'pop');
              paintStat();
              await sleep(320);
            }
            const s = cards.server;
            s.level = 'safe'; s.c.classList.add('sec-safe'); s.state.textContent = 'holds';
            s.note.textContent = `still decides after ${used.size} attack${used.size > 1 ? 's' : ''}`;
            replay(s.c, 'pop');
            if (used.size === 3) line(o, '<span class="good">Survives all three:</span> the check on your server. Put every decision that matters there.');
            paintStat();
            busy = false;
          }));
          paintStat();
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Attacker'), btns),
            grid,
            h('div', { class: 'sec-row' }, stat),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'keystore',
        title: 'Android Keystore',
        tagline: 'Keys that your app can use but never read.',
        level: 'advanced',
        body: `
<p>The Android Keystore holds cryptographic keys outside your app’s process. On almost every modern phone the keys live in a Trusted Execution Environment (TEE), a separate secure world on the main chip. Many phones also have StrongBox, a dedicated security chip; ask for it with <code>setIsStrongBoxBacked(true)</code> and fall back when it throws <code>StrongBoxUnavailableException</code>. Either way, your app gets a handle. It passes data in, gets results out, and never sees the key bytes. Even root can’t export them.</p>
<p>You create a key once with <code>KeyGenParameterSpec</code>, which fixes what it may do: encrypt and decrypt with AES-GCM, or sign with an EC key for a server to verify. Then you use it through the normal <code>Cipher</code> and <code>Signature</code> classes with the <code>"AndroidKeyStore"</code> provider. The Keystore picks a fresh random IV for each encryption, so you read it back from <code>cipher.iv</code> and store it next to the ciphertext.</p>
<p>A key can also require the user. With <code>setUserAuthenticationRequired(true)</code> and <code>setUserAuthenticationParameters(30, ...)</code>, the key works only for 30 seconds after the user unlocks with a strong biometric or their PIN. With a timeout of 0, each single use needs a BiometricPrompt. Keys disappear when the app is uninstalled, and an auth-bound key is invalidated if the user removes their screen lock.</p>`,
        code: `private const val ALIAS = "session_key"

fun getOrCreateKey(): SecretKey {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    (ks.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.let { return it.secretKey }

    val spec = KeyGenParameterSpec.Builder(
        ALIAS,
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .setUserAuthenticationRequired(true)
        .setUserAuthenticationParameters(        // API 30+
            30,
            KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL
        )
        .build()

    return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        .apply { init(spec) }
        .generateKey()
}

fun encrypt(plain: ByteArray): Pair<ByteArray, ByteArray> {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())     // Keystore picks the IV
    return cipher.iv to cipher.doFinal(plain)              // store both
}

fun decrypt(iv: ByteArray, data: ByteArray): ByteArray {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, iv))
    return cipher.doFinal(data)
}`,
        remember: 'Keystore keys never leave secure hardware. Your app sends data in and gets results out.',
        terms: [
          { term: 'Android Keystore', def: 'The system service that generates and stores cryptographic keys outside the app process and performs operations with them on the app’s behalf.' },
          { term: 'TEE', def: 'Trusted Execution Environment: an isolated secure area of the main processor where Keystore keys are stored and used.' },
          { term: 'StrongBox', def: 'A Keystore backed by a separate tamper-resistant security chip, available on many devices since Android 9.' },
          { term: 'Auth-bound key', def: 'A Keystore key that only works after the user authenticates, either per use or for a set number of seconds.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Load the Keystore and generate an AES key for GCM inside it.', code: 'val ks = KeyStore.getInstance("[[AndroidKeyStore]]").apply { load(null) }\nval spec = KeyGenParameterSpec.Builder("k", PURPOSE_ENCRYPT or PURPOSE_DECRYPT)\n    .setBlockModes(KeyProperties.BLOCK_MODE_[[GCM]])\n    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)\n    .build()', why: 'The provider name <code>"AndroidKeyStore"</code> is case sensitive. GCM gives encryption and an integrity check in one mode, and needs no padding.' },
          { type: 'bug', prompt: 'This throws on encrypt, and the idea behind it would break GCM anyway. Tap the line.', code: 'fun encrypt(plain: ByteArray): Pair<ByteArray, ByteArray> {\n    val cipher = Cipher.getInstance("AES/GCM/NoPadding")\n    cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, ByteArray(12)))\n    return cipher.iv to cipher.doFinal(plain)\n}', bug: 2, fix: '    cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())   // let the Keystore pick a random IV', why: 'Keystore keys require randomized encryption by default, so a caller-provided IV is rejected. A fixed IV with GCM is a real break: two messages under the same key and IV leak their XOR and let an attacker forge tags.' },
        ],
        quiz: [
          { q: 'What does <code>secretKey.encoded</code> return for a Keystore key?', options: ['The 32 key bytes', '<code>null</code>', 'A base64 string'], a: 1, why: 'The key material is not exportable. Your app holds a reference, and the operation runs inside the TEE or StrongBox.' },
          { q: 'Where does the IV come from when you encrypt with a Keystore AES-GCM key?', options: ['You pass a fixed one', 'The Keystore generates a random one; read it from <code>cipher.iv</code>', 'GCM does not use an IV'], a: 1, why: 'Randomized encryption is required by default. Store the IV with the ciphertext; it is not secret.' },
          { q: 'A key was made with <code>setUserAuthenticationParameters(30, AUTH_BIOMETRIC_STRONG)</code>. The user unlocked a minute ago. What happens on <code>cipher.init</code>?', options: ['It works', 'It throws <code>UserNotAuthenticatedException</code>', 'The key is deleted'], a: 1, why: 'The 30 second window has passed. Show a BiometricPrompt, then try again.' },
        ],
        deeper: [
          {
            title: 'The rules are sealed into the key',
            body: `<p>Everything you set on <code>KeyGenParameterSpec</code> becomes part of the key: purposes, block modes, paddings and the auth timeout. The secure hardware checks those rules on every operation. Ask for something the key was not made for and the Keystore refuses, even when your code compiles fine.</p>
<p>The rules can’t change later. Edit the spec and ship an update, and <code>getOrCreateKey()</code> still finds the old key under the same alias. To change the rules you delete the key and make a new one, and data sealed with the old key is gone with it.</p>`,
            visual(el) {
              const NAMES = { ENCRYPT: 'PURPOSE_ENCRYPT', DECRYPT: 'PURPOSE_DECRYPT', GCM: 'BLOCK_MODE_GCM', CBC: 'BLOCK_MODE_CBC' };
              const spec = { ENCRYPT: true, DECRYPT: true, GCM: true, CBC: false };
              let key = null, busy = false;
              const o = out('session_key exists with the rules shown. Try each operation, then edit the spec.');
              const rules = h('div', { class: 'sec-pile' });
              const hw = h('div', { class: 'sec-zone sec-hw' }, h('span', { class: 'sec-label' }, 'Keystore · rules inside session_key'), rules);
              const paint = anim => rules.replaceChildren(...(key
                ? Object.keys(key).filter(k => key[k]).map((k, i) => h('span', { class: 'sec-tag' + (anim ? ' drop-in' : ''), style: anim ? `animation-delay:${i * 80}ms` : null }, NAMES[k]))
                : [h('span', { class: 'sec-empty' }, 'no key with this alias')]));
              const specBtns = Object.keys(spec).map(k => act(NAMES[k], function () {
                if (busy) return;
                spec[k] = !spec[k]; this.setAttribute('aria-pressed', String(spec[k]));
                say(o, key ? 'Spec edited in your code. <span class="muted">The key in the Keystore still has its old rules.</span>' : 'Spec edited. Generate the key to use it.');
              }, { 'aria-pressed': String(spec[k]) }));
              const create = cmd('getOrCreateKey()', () => {
                if (busy) return;
                if (key) { replay(hw, 'pop'); say(o, 'Alias session_key already exists, so it comes back as is. <span class="muted">Your edited spec was never used.</span>'); return; }
                if (!(spec.ENCRYPT || spec.DECRYPT) || !(spec.GCM || spec.CBC)) { replay(hw, 'shake'); say(o, 'Pick at least one purpose and one block mode first.'); return; }
                key = { ...spec }; paint(true);
                say(o, '<span class="good">generated:</span> these rules are now part of the key. They can’t be edited.');
              });
              const del = cmd('ks.deleteEntry("session_key")', () => {
                if (busy) return;
                if (!key) { say(o, 'Nothing to delete.'); return; }
                key = null; paint(); replay(hw, 'shake');
                say(o, 'Deleted. <span class="bad">Anything sealed with it can never be decrypted again.</span>');
              });
              const use = (label, purpose, mode) => cmd(label, async () => {
                if (busy) return;
                if (!key) { replay(hw, 'shake'); say(o, '<span class="bad">error:</span> no key with alias session_key. Call getOrCreateKey().'); return; }
                busy = true; hw.classList.add('on');
                say(o, 'asking secure hardware…');
                await sleep(420);
                hw.classList.remove('on'); busy = false;
                const miss = !key[purpose] ? NAMES[purpose] : !key[mode] ? NAMES[mode] : null;
                if (miss) { replay(hw, 'shake'); say(o, `<span class="bad">InvalidKeyException:</span> Keystore operation failed. The key was not made with ${miss}.`); }
                else say(o, '<span class="good">ok:</span> the hardware checked the key’s rules and allowed it.');
              });
              key = { ...spec }; paint(false);
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Spec in code'), specBtns),
                hw,
                h('div', { class: 'controls' }, create, del),
                h('div', { class: 'controls' },
                  use('cipher.init(ENCRYPT_MODE, key) // GCM', 'ENCRYPT', 'GCM'),
                  use('cipher.init(DECRYPT_MODE, key, gcm) // GCM', 'DECRYPT', 'GCM'),
                  use('cipher.init(ENCRYPT_MODE, key) // CBC', 'ENCRYPT', 'CBC')),
                o);
            },
          },
          {
            title: 'Auth-bound keys can die',
            body: `<p>A key that needs the user is tied to the device’s lock screen. Remove the screen lock and every auth-bound key is invalidated for good. A key that needs a biometric for every use also dies when the user enrolls a new fingerprint or face, unless you build it with <code>setInvalidatedBy<wbr>BiometricEnrollment(false)</code>. The default exists so a finger added by someone else can’t open your data.</p>
<p>An invalid key throws <code>KeyPermanentlyInvalidatedException</code> on <code>cipher.init</code>. There is no repair. Catch it, delete the alias, make a new key once a lock screen is back, and get the data again, usually by signing the user in.</p>`,
            code: `fun unlockCipher(iv: ByteArray): Cipher? = try {
    Cipher.getInstance("AES/GCM/NoPadding").apply {
        init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, iv))
    }
} catch (e: KeyPermanentlyInvalidatedException) {
    KeyStore.getInstance("AndroidKeyStore").apply { load(null) }.deleteEntry(ALIAS)
    tokenStore.clear()   // the old ciphertext can never be opened again
    null                 // the caller shows the password sign-in
}`,
            visual(el) {
              let valid = true, lock = true, fps = 1, keep = false, token = true;
              const kState = h('span', { class: 'sec-state' }), tState = h('span', { class: 'sec-state' });
              const kCard = h('div', { class: 'sec-card' }, kState, h('b', {}, 'wallet_key'), h('small', {}, 'every use needs BIOMETRIC_STRONG'));
              const tCard = h('div', { class: 'sec-card' }, tState, h('b', {}, 'sealed token'), h('small', {}, 'iv + ciphertext in DataStore'));
              const dev = h('span', { class: 'sec-stat' });
              const o = out('The key works. Change the phone’s security settings and see what survives.');
              const paint = () => {
                kCard.className = 'sec-card ' + (valid ? 'sec-safe' : 'sec-bad');
                kState.textContent = valid ? 'valid' : 'permanently invalid';
                tCard.className = 'sec-card ' + (!token ? '' : valid ? 'sec-safe' : 'sec-bad');
                tState.textContent = !token ? 'empty' : valid ? 'opens after a prompt' : 'unreadable forever';
                dev.innerHTML = `screen lock: <b>${lock ? 'PIN' : 'none'}</b> · fingerprints: <b>${fps}</b>`;
              };
              const kill = why => { if (!valid) return; valid = false; replay(kCard, 'shake'); say(o, `<span class="bad">wallet_key invalidated:</span> ${why}`); };
              const keepSw = toggle('sec-ks2-keep', 'setInvalidatedBy<wbr>BiometricEnrollment(false)', false, v => {
                keep = v; valid = true; token = true; paint(); replay(kCard, 'pop');
                say(o, `The flag is part of the key, so the demo made a new key${v ? ' that survives new fingerprints' : ' with the default'} and sealed the token again.`);
              });
              const settings = [
                act('Add a fingerprint', () => {
                  if (!lock) { say(o, 'Android asks for a screen lock before it lets you add a fingerprint.'); return; }
                  fps++; paint();
                  if (!valid) { say(o, 'Fingerprint added. The key is still dead.'); return; }
                  if (keep) { replay(kCard, 'pop'); say(o, '<span class="good">key survives:</span> it was made with setInvalidatedByBiometricEnrollment(false).'); }
                  else { kill('a new biometric was enrolled.'); paint(); }
                }),
                act('Remove screen lock', () => {
                  if (!lock) { say(o, 'There is no screen lock to remove.'); return; }
                  lock = false; fps = 0;
                  if (valid) kill('the secure lock screen was turned off. This kills every auth-bound key, whatever the flags.');
                  else say(o, 'Screen lock and fingerprints removed.');
                  paint();
                }),
                act('Set a PIN', () => {
                  if (lock) { say(o, 'A PIN is already set.'); return; }
                  lock = true; paint();
                  say(o, `PIN set. ${valid ? '' : 'The old key stays dead. A new PIN does not bring it back.'}`);
                }),
              ];
              el.append(
                h('div', { class: 'sec-grid' }, kCard, tCard),
                h('div', { class: 'sec-row' }, dev),
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Settings'), settings),
                h('div', { class: 'controls' }, keepSw.el),
                h('div', { class: 'controls' },
                  cmd('unlockWallet()', () => {
                    if (!token) { say(o, 'Nothing stored. Sign in first.'); return; }
                    if (!valid) { replay(tCard, 'shake'); say(o, '<span class="bad">KeyPermanentlyInvalidatedException:</span> Key permanently invalidated'); return; }
                    replay(tCard, 'pop'); say(o, '<span class="good">BiometricPrompt ok:</span> cipher unlocked, token decrypted.');
                  }),
                  cmd('recover()', () => {
                    if (valid) { say(o, 'The key is fine. Nothing to recover.'); return; }
                    if (!lock) { replay(kCard, 'shake'); say(o, '<span class="bad">InvalidAlgorithmParameterException:</span> Secure lock screen must be enabled to create keys requiring user authentication'); return; }
                    if (!fps) { replay(kCard, 'shake'); say(o, '<span class="bad">InvalidAlgorithmParameterException:</span> At least one biometric must be enrolled to create keys requiring user authentication for every use'); return; }
                    valid = true; token = true; paint(); replay(kCard, 'pop'); replay(tCard, 'pop');
                    say(o, '<span class="good">recovered:</span> deleteEntry, new key, user signed in with the password, new token sealed. <span class="muted">The old ciphertext was thrown away.</span>');
                  })),
                o);
              paint();
            },
          },
          {
            title: 'Signing keys and attestation',
            body: `<p>The Keystore also holds key pairs. An EC private key signs inside secure hardware, and the public key is free to leave. Send the public key to your server at sign-in, then sign sensitive requests. A stolen session token alone can no longer approve a payment.</p>
<p>Add <code>setAttestationChallenge()</code> with a fresh nonce from your server, and the key comes with a certificate chain that leads up to a Google root. The server checks the chain and the nonce, and reads where the key lives: TEE or StrongBox. Treat it like Play Integrity: a strong signal, combined with your other checks.</p>`,
            code: `val spec = KeyGenParameterSpec.Builder("device_key", KeyProperties.PURPOSE_SIGN)
    .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
    .setDigests(KeyProperties.DIGEST_SHA256)
    .setAttestationChallenge(serverNonce)   // ties the chain to this request
    .build()

KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore")
    .apply { initialize(spec) }
    .generateKeyPair()

val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
val chain = ks.getCertificateChain("device_key")   // send to the server once

val signature = Signature.getInstance("SHA256withECDSA").run {
    initSign(ks.getKey("device_key", null) as PrivateKey)
    update(requestBody)
    sign()                                          // runs in the TEE
}`,
          },
        ],
        underHood: {
          body: `<p><code>"AndroidKeyStore"</code> selects a JCA provider that ships with Android. On Android 12 and later, each <code>cipher.init</code>, <code>update</code> and <code>doFinal</code> becomes a Binder call to <code>keystore2</code>, a system daemon. keystore2 forwards the operation to the KeyMint HAL, which runs inside the TEE, or to StrongBox. Older versions use the same design with the keystore daemon and Keymaster.</p>
<p>The key is saved on disk as a key blob, encrypted by a key that never leaves the secure hardware. A copied blob is useless anywhere else. The authorizations from <code>KeyGenParameterSpec</code> are bound into the blob, and KeyMint checks them on every operation, which is why they can’t change. Every call is a round trip into secure hardware, so keep Keystore work small: wrap a data key, sign a hash, not every record.</p>`,
          code: `val key = getOrCreateKey()
val info = SecretKeyFactory.getInstance(key.algorithm, "AndroidKeyStore")
    .getKeySpec(key, KeyInfo::class.java) as KeyInfo

val where = when (info.securityLevel) {   // API 31+
    KeyProperties.SECURITY_LEVEL_STRONGBOX -> "StrongBox chip"
    KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT -> "TEE"
    else -> "software or unknown"
}`,
        },
        mistakes: [
          {
            title: 'Generating a new key on every launch',
            bad: `// Application.onCreate()
val key = KeyGenerator.getInstance(KEY_ALGORITHM_AES, "AndroidKeyStore")
    .apply { init(spec) }
    .generateKey()   // same alias, replaces the old key`,
            good: `val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
val key = (ks.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.secretKey
    ?: KeyGenerator.getInstance(KEY_ALGORITHM_AES, "AndroidKeyStore")
        .apply { init(spec) }
        .generateKey()`,
            why: 'Generating under an existing alias replaces that key. Everything sealed in earlier sessions becomes unreadable. Look the alias up first.',
          },
          {
            title: 'Requiring StrongBox with no fallback',
            bad: `val spec = builder
    .setIsStrongBoxBacked(true)
    .build()
generator.init(spec)
generator.generateKey()   // throws on phones without StrongBox`,
            good: `val key = try {
    generate(builder.setIsStrongBoxBacked(true).build())
} catch (e: StrongBoxUnavailableException) {
    generate(builder.setIsStrongBoxBacked(false).build())   // TEE is still hardware
}`,
            why: 'Many phones have no StrongBox chip. There, key generation throws <code>StrongBoxUnavailableException</code>. Fall back to the TEE.',
          },
          {
            title: 'Encrypting every record with the Keystore',
            bad: `messages.forEach { msg ->
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, keystoreKey)   // IPC into the TEE
    dao.insert(msg.id, cipher.iv, cipher.doFinal(msg.bytes))
}`,
            good: `// One Keystore key wraps a Tink keyset; Tink encrypts in memory.
messages.forEach { msg ->
    dao.insert(msg.id, aead.encrypt(msg.bytes, msg.id.encodeToByteArray()))
}`,
            why: 'Every Keystore operation is a round trip into secure hardware, and StrongBox is slower still. Use the Keystore to protect a data key, then encrypt records with that key. The next lesson shows how.',
          },
        ],
        visual(el) {
          const root = h('div', { class: 'viz' });
          const live = alive(root);
          let key = null, authUntil = 0, n = 0, busy = false, ticking = false;
          const appPile = h('div', { class: 'sec-pile' }, h('span', { class: 'sec-pill sec-plain' }, '"4111 1111 1111"'));
          const hwWork = h('div', { class: 'sec-pile' });
          const keySlot = h('div', { class: 'sec-pile' });
          const app = h('div', { class: 'sec-zone' }, h('span', { class: 'sec-label' }, 'Your app process'), appPile);
          const hw = h('div', { class: 'sec-zone sec-hw' }, h('span', { class: 'sec-label' }, 'Keystore · TEE'), keySlot, hwWork);
          const clock = h('span', { class: 'clock' });
          const o = out();
          const authSw = toggle('sec-ks-auth', 'setUserAuthenticationRequired(true), 10 s', false, () => say(o, 'The spec changed. Generate the key again to apply it.'));
          const paintKey = anim => {
            keySlot.replaceChildren(key
              ? h('div', { class: 'sec-key' + (key.auth ? ' sec-locked' : '') + (anim ? ' drop-in' : '') }, h('span', { class: 'sec-lock', 'aria-hidden': 'true' }), 'AES-256 · session_key', key.auth ? h('span', { class: 'sec-tag' }, 'needs user') : null)
              : h('span', { class: 'sec-empty' }, 'no key yet'));
          };
          const tick = () => {
            if (!live()) { ticking = false; return; }
            const left = Math.ceil((authUntil - Date.now()) / 1000);
            clock.textContent = key && key.auth ? (left > 0 ? `unlocked for ${left} s` : 'locked: user must authenticate') : '';
            if (left > 0) setTimeout(tick, 250); else ticking = false;
          };
          const gen = (anim = true) => {
            key = { auth: authSw.input.checked }; authUntil = 0; paintKey(anim); tick();
          };
          const flash = async node => { node.classList.add('on'); await sleep(450); node.classList.remove('on'); };
          root.append(
            h('div', { class: 'sec-zones' }, app, hw),
            h('div', { class: 'controls' }, authSw.el, clock),
            h('div', { class: 'controls' },
              cmd('keyGenerator.generateKey()', () => { if (busy) return; gen(); say(o, `<span class="good">ok:</span> key created inside secure hardware${key.auth ? ', bound to the user' : ''}. The app gets an alias, not bytes.`); }),
              cmd('cipher.doFinal(card)', async () => {
                if (busy) return;
                if (!key) { replay(app, 'shake'); say(o, '<span class="bad">error:</span> no key with alias session_key. Generate it first.'); return; }
                if (key.auth && Date.now() > authUntil) { replay(hw, 'shake'); say(o, '<span class="bad">UserNotAuthenticatedException:</span> User not authenticated'); return; }
                busy = true;
                const plain = appPile.querySelector('.sec-plain') || h('span', { class: 'sec-pill sec-plain' }, '"4111 1111 1111"');
                plain.classList.add('fly-out');
                say(o, 'plaintext goes in…');
                await sleep(380); plain.remove();
                hwWork.replaceChildren(h('span', { class: 'sec-pill sec-plain pop' }, '"4111 1111 1111"'));
                await flash(hw);
                hwWork.firstElementChild.classList.add('fly-out');
                await sleep(380);
                hwWork.replaceChildren();
                n++;
                appPile.replaceChildren(h('span', { class: 'sec-pill sec-cipher drop-in' }, `iv ${hex(4)}… ct ${hex(6)}…`));
                say(o, `<span class="good">ok:</span> ciphertext #${n} back in the app. The key never moved.`);
                await sleep(1300);
                if (root.isConnected) appPile.append(h('span', { class: 'sec-pill sec-plain drop-in' }, '"4111 1111 1111"'));
                busy = false;
              }),
              cmd('secretKey.encoded', () => {
                if (!key) { say(o, 'No key yet. Generate one first.'); return; }
                replay(keySlot, 'pop');
                say(o, '<span class="good">null</span> <span class="muted">// the app holds a handle. The bytes stay in the TEE, even on a rooted phone.</span>');
              }),
              act('User authenticates', () => {
                if (!key || !key.auth) { say(o, 'This key works without the user. Turn on the switch and generate it again.'); return; }
                authUntil = Date.now() + 10000; replay(keySlot, 'pop');
                say(o, '<span class="good">BiometricPrompt ok:</span> the key works for the next 10 seconds.');
                if (!ticking) { ticking = true; tick(); }
              })),
            o);
          gen(false);
          o.textContent = 'A key already exists. Encrypt something, then try to read the key.';
          el.append(root);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'at-rest',
        title: 'Encrypting data at rest',
        tagline: 'Tink does the crypto. The Keystore guards Tink’s key.',
        level: 'advanced',
        body: `
<p>Files in your app’s private storage are already sandboxed from other apps, and the whole disk is encrypted while the phone is locked. Add your own encryption for data that would hurt if copied off a rooted phone or a backup: session and refresh tokens, health or financial records, private messages. Don’t bother for cache files or settings.</p>
<p>The Jetpack <code>security-crypto</code> library, with <code>EncryptedSharedPreferences</code> and <code>EncryptedFile</code>, is deprecated since 2025 and should not be used in new code. Use Tink directly. Tink’s <code>Aead</code> encrypts and authenticates in one call. <code>AndroidKeysetManager</code> keeps Tink’s keyset in a prefs file, wrapped by a master key in the Android Keystore. Store the sealed bytes wherever you like, for example in DataStore as base64.</p>
<p>AEAD means the ciphertext can’t be changed without detection. Flip one byte and <code>decrypt</code> throws. You can also pass associated data, like the field name. It is not stored inside the ciphertext, but decryption fails unless you pass the same value again, so nobody can move a sealed token into another field.</p>`,
        code: `// implementation(libs.tink.android)
class SessionCrypto(context: Context) {
    private val aead: Aead

    init {   // create once, off the main thread: this reads prefs and talks to the Keystore
        AeadConfig.register()
        aead = AndroidKeysetManager.Builder()
            .withSharedPref(context, "session_keyset", "crypto_prefs")
            .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
            .withMasterKeyUri("android-keystore://session_master_key")
            .build()
            .keysetHandle
            .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
    }

    fun seal(plain: ByteArray, field: String): ByteArray = aead.encrypt(plain, field.encodeToByteArray())
    fun open(sealed: ByteArray, field: String): ByteArray = aead.decrypt(sealed, field.encodeToByteArray())
}

private val TOKEN = stringPreferencesKey("token")

suspend fun saveToken(store: DataStore<Preferences>, crypto: SessionCrypto, token: String) {
    val sealed = crypto.seal(token.encodeToByteArray(), "token")
    store.edit { it[TOKEN] = Base64.encodeToString(sealed, Base64.NO_WRAP) }
}

fun tokenFlow(store: DataStore<Preferences>, crypto: SessionCrypto): Flow<String?> =
    store.data.map { prefs ->
        prefs[TOKEN]?.let { crypto.open(Base64.decode(it, Base64.NO_WRAP), "token").decodeToString() }
    }`,
        remember: 'EncryptedSharedPreferences is deprecated. Tink Aead with a Keystore master key, stored in DataStore.',
        terms: [
          { term: 'Tink', def: 'Google’s open-source crypto library that offers safe, high-level primitives such as Aead and manages keys as keysets.' },
          { term: 'AEAD', def: 'Authenticated encryption with associated data: encryption that also detects any change to the ciphertext or to the extra data bound to it.' },
          { term: 'Keyset', def: 'Tink’s container of one or more keys with ids, which lets you rotate keys while still decrypting old data.' },
          { term: 'Envelope encryption', def: 'Encrypting data with a data key and then encrypting that data key with a master key kept somewhere safer.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Wrap the keyset with a Keystore master key, then decrypt the sealed token.', code: 'val aead = AndroidKeysetManager.Builder()\n    .withSharedPref(context, "session_keyset", "crypto_prefs")\n    .withKeyTemplate(KeyTemplates.get("AES256_GCM"))\n    .withMasterKeyUri("[[android-keystore]]://session_master_key")\n    .build()\n    .keysetHandle\n    .getPrimitive(RegistryConfiguration.get(), Aead::class.java)\n\nval token = aead.[[decrypt]](sealed, "token".encodeToByteArray())', why: 'The <code>android-keystore://</code> URI tells Tink to wrap the keyset with a Keystore key. Without it, the keyset is written to prefs in plain form.' },
          { type: 'bug', prompt: 'Saving works, but reading the token back always throws. Tap the line.', code: 'suspend fun saveToken(store: DataStore<Preferences>, crypto: SessionCrypto, token: String) {\n    val sealed = crypto.seal(token.encodeToByteArray(), "token")\n    store.edit { it[TOKEN] = sealed.decodeToString() }\n}', bug: 2, fix: '    store.edit { it[TOKEN] = Base64.encodeToString(sealed, Base64.NO_WRAP) }', why: 'Ciphertext is random bytes, not UTF-8. <code>decodeToString()</code> replaces invalid sequences, so the bytes change and the AEAD check fails on decrypt. Encode binary as base64.' },
        ],
        quiz: [
          { q: 'What should replace <code>EncryptedSharedPreferences</code> in new code?', options: ['Plain SharedPreferences, the disk is encrypted anyway', 'Tink Aead with a Keystore-wrapped keyset, storing the result in DataStore or a file', 'Base64-encoding the values'], a: 1, why: '<code>security-crypto</code> is deprecated. Tink is the library it used inside, and you can call it directly. Base64 is an encoding, not encryption.' },
          { q: 'One byte of a sealed value changes on disk. What does <code>aead.decrypt</code> do?', options: ['Returns slightly wrong text', 'Throws <code>GeneralSecurityException</code>', 'Returns the original text'], a: 1, why: 'AEAD checks an authentication tag. Any change, even one bit, fails the check.' },
          { q: 'Someone copies the app’s files to a laptop. Why can’t they read the token?', options: ['The files are hidden', 'The keyset is wrapped by a master key that stays in this phone’s Keystore', 'Tink deletes them'], a: 1, why: 'The copied keyset is itself ciphertext. The key to unwrap it can’t leave the secure hardware of the original phone.' },
        ],
        deeper: [
          {
            title: 'Why two layers of keys',
            body: `<p>The setup above is envelope encryption. The Keystore master key encrypts one thing: Tink’s keyset. The keyset’s AES key encrypts your data. Why not encrypt the data with the Keystore key directly?</p>
<p>Speed. Each Keystore operation is a call into secure hardware, a few milliseconds in the TEE and far more in StrongBox. Tink unwraps the keyset once, then seals every record in memory in microseconds. The master key still never leaves the hardware, so a copied keyset is still useless.</p>`,
            visual(el) {
              const N = 40, COST = { TEE: 5, StrongBox: 40 }, FAST = 0.03;
              let hw = 'TEE', busy = false;
              const live = alive(el);
              const mkLane = name => { const track = h('div', { class: 'lane-track' }); return { track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track) }; };
              const A = mkLane('Keystore x40'), B = mkLane('Tink, 1 unwrap');
              const tA = h('b', {}, '0 ms'), tB = h('b', {}, '0 ms');
              const o = out('Seal 40 chat messages both ways. Timings are typical, not exact.');
              const hwBtns = Object.keys(COST).map((k, i) => act(k, () => { if (busy) return; hw = k; press(hwBtns, hwBtns[i]); run(); }));
              press(hwBtns, hwBtns[0]);
              const fmt = ms => (ms < 10 ? ms.toFixed(1) : Math.round(ms)) + ' ms';
              async function run() {
                if (busy) return;
                busy = true;
                const c = COST[hw], total = N * c;
                A.track.replaceChildren(); B.track.replaceChildren();
                tA.textContent = tB.textContent = '0 ms';
                say(o, `sealing 40 messages, master key in the <b>${hw}</b>…`);
                const pct = ms => (ms / total * 100).toFixed(2);
                const laneB = (async () => {
                  B.track.append(h('div', { class: 'bar run drop-in', style: `left:0;width:${pct(c)}%` }));
                  await sleep(220);
                  B.track.append(h('div', { class: 'bar wait drop-in', style: `left:${pct(c)}%;width:${Math.max(0.8, N * FAST / total * 100).toFixed(2)}%` }));
                  tB.textContent = fmt(c + N * FAST);
                })();
                for (let i = 0; i < N; i++) {
                  if (!live()) { busy = false; return; }
                  A.track.append(h('div', { class: 'bar run', style: `left:${pct(i * c)}%;width:${(c / total * 100 * 0.7).toFixed(2)}%` }));
                  tA.textContent = fmt((i + 1) * c);
                  await sleep(35);
                }
                await laneB;
                say(o, `<span class="bad">Keystore each time:</span> ${fmt(total)}. <span class="good">Tink:</span> ${fmt(c + N * FAST)}, one hardware call to unwrap the keyset, then pure memory work.`);
                busy = false;
              }
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Master key in'), hwBtns, cmd('seal(messages)', () => run())),
                h('div', { class: 'timeline' }, A.el, B.el),
                h('div', { class: 'sec-row' }, h('span', { class: 'sec-stat' }, 'Keystore each: ', tA), h('span', { class: 'sec-stat' }, 'Tink: ', tB)),
                h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'bar run' }), 'call into secure hardware'), h('span', {}, h('i', { class: 'bar wait' }), 'AES-GCM in memory')),
                o);
              run();
            },
          },
          {
            title: 'Rotating keys with a keyset',
            body: `<p>A keyset can hold several keys. One is the primary: new data is sealed with it. Every ciphertext starts with a 5-byte prefix that names the key that sealed it, so Tink knows which key to try on decrypt. Old data keeps working after you add a new primary.</p>
<p>That makes rotation safe. Add a key and make it primary. Re-encrypt old records in the background. Only then disable the old key. Disable it too early and the records that still point at it fail to open.</p>`,
            code: `manager.add(KeyTemplates.get("AES256_GCM"))        // new key, not primary yet
val handle = manager.keysetHandle
val newId = handle.getAt(handle.size() - 1).id
manager.setPrimary(newId)                           // new data uses it

// later, after every old record was opened and sealed again:
manager.disable(oldId)`,
            visual(el) {
              const NEXT = ['7be10d44', 'c90f3e12', '19ad77b0'];
              let keys = [{ id: 'a3f29c01', st: 'primary' }], recs = [], made = 0, busy = false;
              const keyPile = h('div', { class: 'sec-pile' });
              const zone = h('div', { class: 'sec-zone sec-hw' }, h('span', { class: 'sec-label' }, 'Keyset · wrapped by the master key'), keyPile);
              const list = h('div', { class: 'sec-recs' });
              const o = out('Three notes are sealed with key a3f29c01. Rotate.');
              const primary = () => keys.find(k => k.st === 'primary');
              const paintKeys = anim => keyPile.replaceChildren(...keys.map(k => h('span', { class: `sec-key${k.st === 'primary' ? ' sec-prim' : ''}${k.st === 'disabled' ? ' sec-off' : ''}${anim === k.id ? ' drop-in' : ''}` }, k.id, h('span', { class: 'sec-tag' }, k.st))));
              const row = r => {
                r.st = h('span', { class: 'sec-rs' }, '');
                r.pre = h('span', { class: 'sec-hx-p' }, `01 ${r.kid}`);
                r.el = h('div', { class: 'sec-rec drop-in' }, h('span', {}, r.name), r.pre, h('span', { class: 'sec-hx-n' }, hex(4) + '…'), r.st);
                return r.el;
              };
              const seal = name => { const r = { name, kid: primary().id }; recs.push(r); list.append(row(r)); };
              const opens = r => { const k = keys.find(x => x.id === r.kid); return k && k.st !== 'disabled'; };
              const guard = fn => async () => { if (busy) return; busy = true; await fn(); busy = false; };
              ['note 1', 'note 2', 'note 3'].forEach(seal);
              paintKeys();
              el.append(
                zone,
                h('div', { class: 'controls' },
                  cmd('manager.setPrimary(newId)', guard(() => {
                    if (!NEXT.length) { say(o, 'That is enough keys for one demo. Disable the old ones.'); return; }
                    primary().st = 'enabled';
                    const id = NEXT.shift(); keys.push({ id, st: 'primary' }); paintKeys(id);
                    say(o, `manager.add() made key <span class="good">${id}</span>, and it is the primary now. Old keys stay enabled for decrypt.`);
                  })),
                  cmd('crypto.seal(note)', guard(() => {
                    if (recs.length >= 8) { say(o, 'Plenty of notes. Try opening them.'); return; }
                    seal(`note ${recs.length + 1}`);
                    say(o, `sealed with the primary, prefix <span class="t-f">01 ${primary().id}</span>`);
                  }))),
                h('div', { class: 'controls' },
                  cmd('crypto.open(all)', guard(async () => {
                    let bad = 0;
                    for (const r of recs) {
                      if (!el.isConnected) return;
                      const ok = opens(r); bad += !ok;
                      r.st.textContent = ok ? 'opens' : 'fails'; r.st.className = 'sec-rs ' + (ok ? 'sec-y' : 'sec-n');
                      r.el.classList.toggle('sec-fail', !ok); replay(r.el, ok ? 'pop-soft' : 'shake');
                      await sleep(170);
                    }
                    say(o, bad ? `<span class="bad">${bad} record${bad > 1 ? 's' : ''} failed:</span> no enabled key matches the prefix. Re-encrypt before you disable.` : '<span class="good">all open:</span> each prefix found its key.');
                  })),
                  act('Re-encrypt old records', guard(async () => {
                    const p = primary().id; let n = 0;
                    for (const r of recs) {
                      if (!el.isConnected) return;
                      if (r.kid === p || !opens(r)) continue;
                      r.kid = p; r.pre.textContent = `01 ${p}`; r.st.textContent = 'resealed'; r.st.className = 'sec-rs sec-y';
                      replay(r.el, 'pop'); n++;
                      await sleep(200);
                    }
                    say(o, n ? `${n} record${n > 1 ? 's' : ''} opened and sealed again with ${p}.` : 'Nothing to re-encrypt that can still be opened.');
                  })),
                  cmd('manager.disable(oldestId)', guard(() => {
                    const k = keys.find(x => x.st === 'enabled');
                    if (!k) { say(o, keys.length > 1 ? 'Every old key is disabled already.' : '<span class="bad">GeneralSecurityException:</span> cannot disable the primary key. Add a new one first.'); return; }
                    k.st = 'disabled'; paintKeys();
                    const left = recs.filter(r => r.kid === k.id).length;
                    say(o, left ? `<span class="bad">${k.id} disabled</span> while ${left} record${left > 1 ? 's' : ''} still use it. Open all and see.` : `<span class="good">${k.id} disabled</span> and nothing points at it. Safe.`);
                  }))),
                list,
                o);
            },
          },
          {
            title: 'Large files: streaming AEAD',
            body: `<p><code>Aead</code> needs the whole plaintext in memory. For photos, audio or database exports, use <code>StreamingAead</code>. It splits the file into segments of a few KB, encrypts each one with its own tag, and lets you read and write through normal streams.</p>
<p>It still detects tampering, and it also detects a file cut short, because the last segment is marked as last. Keep a separate keyset for streaming, since the key templates differ.</p>`,
            code: `StreamingAeadConfig.register()
val streaming = AndroidKeysetManager.Builder()
    .withSharedPref(context, "files_keyset", "crypto_prefs")
    .withKeyTemplate(KeyTemplates.get("AES256_GCM_HKDF_4KB"))
    .withMasterKeyUri("android-keystore://files_master_key")
    .build()
    .keysetHandle
    .getPrimitive(RegistryConfiguration.get(), StreamingAead::class.java)

val ad = file.name.encodeToByteArray()
streaming.newEncryptingStream(FileOutputStream(file), ad).use { out ->
    source.copyTo(out)            // never holds the whole file in memory
}
streaming.newDecryptingStream(FileInputStream(file), ad).use { input ->
    input.copyTo(destination)     // throws IOException if a segment was changed
}`,
          },
        ],
        underHood: {
          body: `<p>A Tink <code>Aead</code> ciphertext for an <code>AES256_GCM</code> key has a fixed layout. One version byte <code>0x01</code> and the 4-byte key id come first. Then a random 12-byte IV, the encrypted bytes, and a 16-byte GCM tag. That is why a sealed 14-character token takes 47 bytes, and why the demo’s colored bytes come in four groups.</p>
<p><code>AndroidKeysetManager</code> stores the whole keyset as one encrypted blob, hex-encoded, in the SharedPreferences file you name. On first run it generates the keyset, asks the Keystore for an AES-GCM master key under the alias in the URI, and writes the wrapped keyset. On later runs it reads the blob and unwraps it with one Keystore call. Your primitives then work from memory.</p>`,
          code: `01 | a3 f2 9c 01 | 12 bytes IV | ciphertext (same length as plaintext) | 16 bytes tag
^    ^ key id: picks the key in the keyset on decrypt
version byte for the TINK prefix`,
        },
        mistakes: [
          {
            title: 'Building the Aead on every read',
            bad: `fun readToken(prefs: Preferences): String? {
    val aead = AndroidKeysetManager.Builder()
        .withSharedPref(context, "session_keyset", "crypto_prefs")
        .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
        .withMasterKeyUri("android-keystore://session_master_key")
        .build().keysetHandle
        .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
    return prefs[TOKEN]?.let { open(aead, it) }
}`,
            good: `@Singleton
class SessionCrypto @Inject constructor(@ApplicationContext context: Context) {
    private val aead: Aead = buildAead(context)   // once, off the main thread
    fun open(sealed: ByteArray, field: String) =
        aead.decrypt(sealed, field.encodeToByteArray())
}`,
            why: 'Each build reads prefs and calls the Keystore. On first launch, two callers racing can each create a keyset, and the loser’s ciphertext can’t be opened. Build it once and share it.',
          },
          {
            title: 'Sealing everything with no associated data',
            bad: `fun seal(plain: ByteArray) = aead.encrypt(plain, ByteArray(0))`,
            good: `fun seal(plain: ByteArray, field: String, userId: String) =
    aead.encrypt(plain, "$field:$userId".encodeToByteArray())`,
            why: 'With empty associated data, a sealed value from one field or one user can be copied into another and still decrypts. Bind each value to where it belongs.',
          },
          {
            title: 'Backing up the keyset without its master key',
            bad: `<!-- res/xml/data_extraction_rules.xml -->
<cloud-backup>
    <include domain="sharedpref" path="." />
</cloud-backup>`,
            good: `<cloud-backup>
    <exclude domain="sharedpref" path="crypto_prefs.xml" />
    <exclude domain="file" path="datastore/session.preferences_pb" />
</cloud-backup>`,
            why: 'Backup restores files on a new phone, but Keystore keys never travel. The restored keyset can’t be unwrapped there. Exclude the keyset and the sealed data, and sign the user in again.',
          },
        ],
        visual(el) {
          const TOKEN = 'ya29.a0AfB_byC';
          let sealed = null, tampered = -1, n = 0;
          const bytes = h('div', { class: 'sec-bytes' }, h('span', { class: 'muted' }, '(empty)'));
          const dsFile = h('div', { class: 'sec-file' }, h('span', {}, 'files/datastore/session.preferences_pb  token ='), bytes);
          const ksFile = h('div', { class: 'sec-file' }, h('span', {}, 'shared_prefs/crypto_prefs.xml  session_keyset ='), h('div', { class: 'sec-bytes' }, h('span', { class: 'sec-hx-c' }, `${hex(18)}… (wrapped)`)));
          const memPile = h('div', { class: 'sec-pile' }, h('span', { class: 'sec-pill sec-plain' }, `"${TOKEN}"`));
          const mem = h('div', { class: 'sec-zone' }, h('span', { class: 'sec-label' }, 'Memory'), memPile);
          const disk = h('div', { class: 'sec-zone' }, h('span', { class: 'sec-label' }, 'Disk'), dsFile, ksFile);
          const ks = h('div', { class: 'sec-zone sec-hw' }, h('span', { class: 'sec-label' }, 'Keystore'), h('div', { class: 'sec-key' }, h('span', { class: 'sec-lock', 'aria-hidden': 'true' }), 'session_master_key'), h('span', { class: 'sec-empty' }, 'wraps the Tink keyset'));
          const o = out('Seal the token. Each call uses a fresh nonce.');
          const paint = () => {
            if (!sealed) { bytes.replaceChildren(h('span', { class: 'muted' }, '(empty)')); return; }
            const parts = [['p', sealed.p], ['n', sealed.n], ['c', sealed.c], ['t', sealed.t]];
            let i = 0;
            bytes.replaceChildren(...parts.map(([k, s]) => h('span', { class: 'sec-hx-' + k }, ...s.match(/../g).map(b => {
              const node = i === tampered ? h('span', { class: 'sec-hx-x' }, b) : b;
              i++; return node;
            }))));
            replay(bytes, 'pop-soft');
          };
          const open = field => {
            if (!sealed) { replay(disk, 'shake'); say(o, 'Nothing stored yet. Seal the token first.'); return; }
            if (tampered >= 0) { replay(disk, 'shake'); say(o, '<span class="bad">GeneralSecurityException:</span> decryption failed. The tag no longer matches the bytes.'); return; }
            if (field !== 'token') { replay(disk, 'shake'); say(o, `<span class="bad">GeneralSecurityException:</span> decryption failed. It was sealed with "token", not "${field}".`); return; }
            memPile.replaceChildren(h('span', { class: 'sec-pill sec-plain drop-in' }, `"${TOKEN}"`));
            say(o, '<span class="good">ok:</span> tag verified, token back in memory.');
          };
          el.append(
            h('div', { class: 'sec-zones' }, mem, disk, ks),
            h('div', { class: 'sec-legend', 'aria-hidden': 'true' },
              h('span', {}, h('i', { style: 'background:var(--t-f)' }), 'key id'),
              h('span', {}, h('i', { style: 'background:var(--t-t)' }), 'nonce'),
              h('span', {}, h('i', { style: 'background:var(--code-ink)' }), 'ciphertext'),
              h('span', {}, h('i', { style: 'background:var(--t-k)' }), 'tag')),
            h('div', { class: 'controls' },
              cmd('crypto.seal(token, "token")', () => {
                n++; tampered = -1;
                sealed = { p: '01' + 'a3f29c01', n: hex(12), c: hex(TOKEN.length), t: hex(16) };
                memPile.replaceChildren();
                paint();
                say(o, `<span class="good">sealed #${n}:</span> same token, new nonce, completely different bytes. ${n > 1 ? 'Compare with the last one.' : 'Seal again to compare.'}`);
              }),
              cmd('crypto.open(sealed, "token")', () => open('token')),
              cmd('crypto.open(sealed, "refresh")', () => open('refresh'))),
            h('div', { class: 'controls' },
              act('Flip one byte on disk', () => {
                if (!sealed) { say(o, 'Seal something first.'); return; }
                tampered = 17 + Math.floor(Math.random() * TOKEN.length);
                paint(); replay(dsFile, 'shake');
                say(o, 'One ciphertext byte changed. Try to open it.');
              }),
              act('Copy files to a laptop', () => {
                if (!sealed) { say(o, 'Seal something first, then steal it.'); return; }
                replay(disk, 'pop');
                say(o, '<span class="muted">$ tinkey decrypt --keyset crypto_prefs.xml</span><br><span class="bad">error:</span> keyset is encrypted. Its master key never left the phone’s Keystore. <span class="good">The token stays sealed.</span>');
              })),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'network',
        title: 'Network security',
        tagline: 'HTTPS only, the right trust anchors, and pinning only if you can maintain it.',
        level: 'intermediate',
        body: `
<p>Send everything over HTTPS. Apps that target Android 9 (API 28) or higher block cleartext HTTP by default, so a stray <code>http://</code> URL fails with an error instead of leaking. Keep it that way. If one legacy host really needs HTTP, allow it for that domain only in <code>network_security_config.xml</code>.</p>
<p>Since Android 7, apps trust only system certificate authorities by default. A certificate the user installed, like the one from a debugging proxy, is ignored. That stops the most common man-in-the-middle setup. To inspect your own traffic, trust user CAs inside <code>&lt;debug-overrides&gt;</code>, which applies only to debuggable builds.</p>
<p>Certificate pinning goes further: the app accepts only certificates whose public key matches a hash you ship. It stops an attacker who got a rogue certificate into the system store. The cost is real. Rotate your server key without updating the pins and every installed copy stops working. Pin to an intermediate or your own key, always ship a backup pin, and set an <code>expiration</code>. On a rooted phone, Frida can still remove pinning, so it protects your users, not your API.</p>`,
        code: `<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <domain-config>
        <domain includeSubdomains="true">api.example.com</domain>
        <pin-set expiration="2027-06-01">
            <pin digest="SHA-256">7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=</pin>
            <!-- backup pin: a key you hold but have not deployed yet -->
            <pin digest="SHA-256">fwza0LRMXouZHRC8Ei+4PyuldPDcf3UKgO/04cDM1oE=</pin>
        </pin-set>
    </domain-config>

    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>

<!-- AndroidManifest.xml -->
<application android:networkSecurityConfig="@xml/network_security_config">`,
        remember: 'Cleartext is blocked, user CAs are ignored. Pin only with a backup pin and an expiry date.',
        terms: [
          { term: 'Network security config', def: 'An XML file referenced from the manifest that sets cleartext rules, trusted CAs and certificate pins per domain.' },
          { term: 'Man-in-the-middle', def: 'An attack where someone between the app and the server reads or changes traffic, usually by presenting their own certificate.' },
          { term: 'Certificate pinning', def: 'Accepting a server only if its certificate chain contains a public key whose hash the app already knows.' },
          { term: 'Trust anchor', def: 'A root certificate authority the app trusts; every server certificate must chain up to one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pin api.example.com in OkHttp with a primary and a backup key hash.', code: 'val client = OkHttpClient.Builder()\n    .certificatePinner(\n        CertificatePinner.Builder()\n            .add("api.example.com", "[[sha256]]/7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=")\n            .add("api.example.com", "sha256/fwza0LRMXouZHRC8Ei+4PyuldPDcf3UKgO/04cDM1oE=")\n            .[[build]]()\n    )\n    .build()', why: 'OkHttp pins are written as <code>sha256/</code> plus the base64 hash of the public key. Two pins for one host means either key is accepted, so you can rotate.' },
          { type: 'bug', prompt: 'A security review says release builds trust a debugging proxy. Tap the line.', code: '<network-security-config>\n    <base-config cleartextTrafficPermitted="false">\n        <trust-anchors>\n            <certificates src="system" />\n            <certificates src="user" />\n        </trust-anchors>\n    </base-config>\n</network-security-config>', bug: 4, fix: '            <!-- remove: trust user CAs only inside <debug-overrides> -->', why: 'In <code>base-config</code>, user CAs apply to release builds too. Anyone who tricks a user into installing a certificate can then read the app’s traffic. Move it to <code>&lt;debug-overrides&gt;</code>.' },
        ],
        quiz: [
          { q: 'Your app targets API 35 and calls <code>http://api.example.com</code>. What happens by default?', options: ['It works', 'The request fails: cleartext is not permitted', 'Android upgrades it to HTTPS'], a: 1, why: 'Since API 28 the default is <code>cleartextTrafficPermitted="false"</code>. OkHttp throws <code>UnknownServiceException</code>.' },
          { q: 'A user installs a proxy’s CA certificate in Settings. Does your release app trust it?', options: ['Yes, it’s in the device store', 'No, apps targeting API 24+ trust only system CAs unless you opt in', 'Only for HTTP'], a: 1, why: 'User CAs need an explicit <code>&lt;certificates src="user"/&gt;</code>. Put it in <code>debug-overrides</code> to keep release builds safe.' },
          { q: 'Why ship a backup pin?', options: ['To make pinning faster', 'So you can rotate the server key without breaking installed apps', 'Android rejects a single pin'], a: 1, why: 'Old app versions stay installed for years. If the only pinned key changes, every one of them fails to connect.' },
        ],
        deeper: [
          {
            title: 'What the handshake actually checks',
            body: `<p>The server sends a chain: its own leaf certificate, one or more intermediates, ending at a root. The platform trust manager checks that each certificate is signed by the next, that the chain ends at a trust anchor, and that every certificate is inside its validity dates. Then OkHttp checks that the leaf names the host you asked for.</p>
<p>Each check fails with its own error, and knowing which one saves hours. “Trust anchor not found” means an unknown root, often a missing intermediate on the server. An expired certificate fails chain validation. A wrong name fails only the host check.</p>`,
            visual(el) {
              const CASES = [['ok', 'Valid chain'], ['expired', 'Expired leaf'], ['host', 'Wrong host name'], ['root', 'Unknown root']];
              let cur = 'ok', busy = false;
              const cert = () => { const well = h('div', { class: 'sec-well' }); const b = h('b', {}), s = h('small', {}); return Object.assign(h('div', { class: 'sec-node' }, b, well, s), { b, s, well }); };
              const leaf = cert(), mid = cert(), root = cert();
              const chks = ['Chain ends at a trusted root', 'Every certificate is in date', 'Leaf names api.example.com'].map(t => {
                const st = h('span', { class: 'sec-state' }, 'not checked');
                return Object.assign(h('div', { class: 'sec-chk' }, h('span', {}, t), st), { st });
              });
              const o = out('Pick a server setup, then make the request.');
              const paint = () => {
                leaf.b.textContent = cur === 'host' ? 'CN=cdn.other.net' : 'CN=api.example.com';
                leaf.s.textContent = cur === 'expired' ? 'valid until 2025-03-01' : 'valid until 2027-01-10';
                mid.b.textContent = 'Example CA R1'; mid.s.textContent = `issued by ${cur === 'root' ? 'Unknown Root' : 'Example Root'}`;
                root.b.textContent = cur === 'root' ? 'Unknown Root' : 'Example Root';
                root.s.textContent = cur === 'root' ? 'not in the trust store' : 'in the system store';
                [leaf, mid, root].forEach(n => n.classList.remove('sec-evil', 'sec-ok', 'on'));
                chks.forEach(c => { c.className = 'sec-chk'; c.st.textContent = 'not checked'; });
              };
              const caseBtns = CASES.map(([id, label], i) => act(label, () => { if (busy) return; cur = id; press(caseBtns, caseBtns[i]); paint(); say(o, 'Server changed. Make the request.'); }));
              press(caseBtns, caseBtns[0]);
              const step = async (i, ok, node) => {
                const c = chks[i];
                c.className = 'sec-chk sec-now'; c.st.textContent = 'checking';
                node.classList.add('on');
                await sleep(450);
                node.classList.remove('on');
                c.className = 'sec-chk ' + (ok ? 'sec-pass' : 'sec-fail'); c.st.textContent = ok ? 'pass' : 'fail';
                if (!ok) { node.classList.add('sec-evil'); replay(node, 'shake'); }
                return ok;
              };
              const go = async () => {
                if (busy) return;
                busy = true; paint();
                say(o, '<span class="muted">GET https://api.example.com/v1/me</span>');
                if (!await step(0, cur !== 'root', root)) { say(o, '<span class="bad">SSLHandshakeException:</span> Trust anchor for certification path not found.'); busy = false; return; }
                if (!await step(1, cur !== 'expired', leaf)) { say(o, '<span class="bad">SSLHandshakeException:</span> Chain validation failed <span class="muted">(CertificateExpiredException)</span>'); busy = false; return; }
                if (!await step(2, cur !== 'host', leaf)) { say(o, '<span class="bad">SSLPeerUnverifiedException:</span> Hostname api.example.com not verified'); busy = false; return; }
                [leaf, mid, root].forEach(n => n.classList.add('sec-ok'));
                say(o, '<span class="good">200 OK:</span> all three checks passed, then the encrypted request went out.');
                busy = false;
              };
              paint();
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Server'), caseBtns),
                h('div', { class: 'sec-path' }, leaf, mid, root),
                h('div', { class: 'sec-chks' }, chks),
                h('div', { class: 'controls' }, cmd('client.newCall(request).execute()', go)),
                o);
            },
          },
          {
            title: 'Rotating a pinned key',
            body: `<p>Pins live in every installed copy of your app, and old copies stay around for years. So plan the server’s next key before you ship the first pin. Each release pins the current key and the next one. When the server switches, every version that knew the new key keeps working.</p>
<p>The <code>expiration</code> date is the safety net. After it, the platform stops checking that pin-set and falls back to normal CA checks. An app nobody updated still connects, with less protection.</p>`,
            visual(el) {
              const V = [{ v: 'v1.0', pins: ['A'], share: 15 }, { v: 'v2.0', pins: ['A', 'B'], share: 35 }, { v: 'v3.0', pins: ['B', 'C'], share: 50 }];
              let server = 'A', expired = false, busy = false;
              const cards = V.map(x => {
                const st = h('span', { class: 'sec-state' }, 'not tried'), note = h('small', {}, `pins ${x.pins.join(' + ')} · ${x.share}% of users`);
                return Object.assign(h('div', { class: 'sec-card' }, st, h('b', {}, x.v), note), { st, x });
              });
              const stat = h('span', { class: 'sec-stat' });
              const o = out('The server uses key A. Every version pins A. Rotate the server key.');
              const expSw = toggle('sec-nw2-exp', 'v1.0 pin-set <code>expiration</code> has passed', false, v => { expired = v; run(); });
              const run = async () => {
                if (busy) return;
                busy = true; let reach = 0;
                for (const c of cards) {
                  if (!el.isConnected) { busy = false; return; }
                  const off = expired && c.x.v === 'v1.0';
                  const ok = off || c.x.pins.includes(server);
                  c.className = 'sec-card ' + (off ? 'sec-warn' : ok ? 'sec-safe' : 'sec-bad');
                  c.st.textContent = off ? 'connects, CA check only' : ok ? 'connects' : 'pin mismatch';
                  replay(c, ok ? 'pop' : 'shake');
                  if (ok) reach += c.x.share;
                  await sleep(260);
                }
                stat.innerHTML = `users who can connect: <b class="${reach < 100 ? 'sec-badnum' : ''}">${reach}%</b>`;
                say(o, reach === 100 ? `<span class="good">Everyone connects</span> with server key ${server}.` : `<span class="bad">${100 - reach}% of users are locked out</span> until they update. They can’t even download the update notice from your API.`);
                busy = false;
              };
              const keyBtns = ['A', 'B', 'C'].map((k, i) => act(`Server key ${k}`, () => { if (busy) return; server = k; press(keyBtns, keyBtns[i]); run(); }));
              press(keyBtns, keyBtns[0]);
              stat.innerHTML = 'users who can connect: <b>?</b>';
              el.append(
                h('div', { class: 'controls' }, keyBtns),
                h('div', { class: 'sec-grid' }, cards),
                h('div', { class: 'controls' }, expSw.el, stat),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>When the app starts, the platform reads <code>network_security_config.xml</code> and installs a trust manager built from it as the app’s default. <code>HttpsURLConnection</code> and OkHttp both use that default, so trust anchors and pin-sets apply without extra code. For cleartext, OkHttp asks <code>NetworkSecurityPolicy</code> whether that host allows cleartext before it opens an <code>http://</code> connection.</p>
<p>Pins are checked inside that trust manager, against the public keys of the chain it built, so a pin on an intermediate matches too. Libraries that bring their own TLS stack and trust store skip the platform trust manager and ignore the file. Check how any networking SDK you add does TLS.</p>`,
          code: `// The same checks, readable from code
val policy = NetworkSecurityPolicy.getInstance()
policy.isCleartextTrafficPermitted("api.example.com")   // false
policy.isCleartextTrafficPermitted("legacy.example.net") // true if a domain-config allows it`,
        },
        mistakes: [
          {
            title: 'A trust-all TrustManager to get past a dev certificate',
            bad: `val trustAll = object : X509TrustManager {
    override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
    override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
    override fun getAcceptedIssuers() = arrayOf<X509Certificate>()
}
OkHttpClient.Builder()
    .sslSocketFactory(sslContext.socketFactory, trustAll)
    .hostnameVerifier { _, _ -> true }`,
            good: `<!-- network_security_config.xml: dev CA, debug builds only -->
<debug-overrides>
    <trust-anchors>
        <certificates src="@raw/dev_ca" />
    </trust-anchors>
</debug-overrides>`,
            why: 'The trust-all version accepts any certificate for any host in every build, release included. Play also flags apps that ship an unsafe TrustManager.',
          },
          {
            title: 'Turning on cleartext for the whole app',
            bad: `<application
    android:usesCleartextTraffic="true">`,
            good: `<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">legacy.example.net</domain>
</domain-config>`,
            why: 'The manifest flag opens every host to plain HTTP. On API 24 and up it is also ignored once a network security config exists, which confuses people the other way. Allow one domain in the config.',
          },
          {
            title: 'Pinning the leaf certificate',
            bad: `CertificatePinner.Builder()
    .add("api.example.com", "sha256/<leaf key hash>")   // renewed every 90 days
    .build()`,
            good: `CertificatePinner.Builder()
    .add("api.example.com", "sha256/<issuing CA key hash>")
    .add("api.example.com", "sha256/<backup CA key hash>")
    .build()`,
            why: 'Many renewals create a new leaf key, which breaks a leaf pin overnight. Pin a key that changes rarely, such as the issuing CA, and always add a backup from a different CA.',
          },
        ],
        visual(el) {
          let scheme = 'https', attacker = 'none', busy = false;
          const node = (title, sub) => {
            const well = h('div', { class: 'sec-well' });
            const note = h('small', {}, sub);
            return Object.assign(h('div', { class: 'sec-node' }, h('b', {}, title), well, note), { well, note, sub });
          };
          const phone = node('Your app', 'POST /login');
          const wifi = node('Café Wi-Fi', 'just forwards');
          const server = node('api.example.com', 'waiting');
          const nodes = [phone, wifi, server];
          const pin = toggle('sec-net-pin', 'pin-set for api.example.com', false, () => say(o, pin.input.checked ? 'Pins on: only the server’s real key is accepted.' : 'Pins off: any certificate from a trusted CA is accepted.'));
          const o = out('HTTPS, no attacker. Send the login request.');
          const schemeBtns = ['http', 'https'].map(s => act(`${s}://`, () => { if (busy) return; scheme = s; press(schemeBtns, schemeBtns[s === 'http' ? 0 : 1]); }));
          const attackers = [['none', 'No attacker'], ['user', 'Proxy + user-installed CA'], ['system', 'Proxy + CA in system store (root)']];
          const attBtns = attackers.map(([id, label], i) => act(label, () => {
            if (busy) return;
            attacker = id; press(attBtns, attBtns[i]);
            wifi.note.textContent = id === 'none' ? 'just forwards' : id === 'user' ? 'mitmproxy, user CA' : 'mitmproxy, system CA';
            wifi.classList.toggle('sec-evil', id !== 'none');
          }));
          const clear = () => nodes.forEach(n => { n.well.replaceChildren(); n.classList.remove('on', 'sec-ok'); });
          const put = (n, label, cls = '') => { nodes.forEach(x => x.well.replaceChildren()); n.well.append(h('span', { class: `sec-packet drop-in ${cls}` }, label)); n.classList.add('on'); };
          const send = async () => {
            if (busy) return;
            busy = true; clear(); server.note.textContent = 'waiting';
            const lock = scheme === 'https' ? 'TLS' : 'plain';
            put(phone, `${lock}: email + password`);
            await sleep(500);
            if (scheme === 'http') {
              phone.well.firstElementChild.classList.add('sec-dead'); replay(phone, 'shake');
              say(o, '<span class="bad">UnknownServiceException:</span> CLEARTEXT communication to api.example.com not permitted by network security policy<br><span class="good">Good:</span> the request never left the phone.');
              busy = false; return;
            }
            put(wifi, 'TLS ClientHello');
            await sleep(600);
            if (attacker === 'user') {
              put(phone, 'fake cert rejected', 'sec-dead'); replay(phone, 'shake');
              say(o, '<span class="bad">SSLHandshakeException:</span> Trust anchor for certification path not found.<br><span class="good">Good:</span> release apps ignore user-installed CAs.');
              busy = false; return;
            }
            if (attacker === 'system' && pin.input.checked) {
              put(phone, 'pin mismatch', 'sec-dead'); replay(phone, 'shake');
              say(o, '<span class="bad">SSLHandshakeException:</span> Pin verification failed<br><span class="good">Good:</span> the cert is from a trusted CA, but its key is not one you pinned.');
              busy = false; return;
            }
            if (attacker === 'system') {
              put(wifi, 'password=hunter2', 'sec-open'); replay(wifi, 'shake');
              say(o, '<span class="bad">read in transit:</span> the attacker’s cert chains to a CA in the system store, so TLS succeeds with the proxy. Turn on pinning.');
              await sleep(800);
              put(server, 'forwarded', 'sec-open'); server.note.textContent = '200 OK, unaware';
              busy = false; return;
            }
            put(server, 'TLS: email + password'); server.classList.add('sec-ok'); server.note.textContent = '200 OK';
            say(o, '<span class="good">200 OK:</span> encrypted end to end. The Wi-Fi only saw the host name.');
            busy = false;
          };
          press(schemeBtns, schemeBtns[1]); press(attBtns, attBtns[0]);
          el.append(
            h('div', { class: 'sec-path' }, nodes),
            h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'App'), schemeBtns, pin.el),
            h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Attacker'), attBtns),
            h('div', { class: 'controls' }, cmd('api.login(email, password)', send)),
            o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'secrets',
        title: 'Secrets in the app',
        tagline: 'If it ships in the APK, it is public.',
        level: 'intermediate',
        body: `
<p>Every string in your APK can be read. <code>local.properties</code> keeps a key out of Git, and <code>buildConfigField</code> moves it into <code>BuildConfig</code>, but both end as a plain constant in <code>classes.dex</code>. R8 renames classes and methods; it does not encrypt string constants. Keys in <code>strings.xml</code> sit in the resources table. Hiding one in native code or XOR-ing it slows an attacker down for an afternoon, because Frida can read the value when your code decodes it.</p>
<p>So sort your keys. Some are designed to be public and limited by other means, like a Maps key restricted to your package name and signing certificate in Cloud Console. Those may ship. A key that can spend money, read other users’ data or call a paid API must stay on your server. The app calls your backend with the user’s short-lived session token, and the backend calls the third party with the real key.</p>
<p>Your backend still wants to know the request comes from your real app on a real device. That is the Play Integrity API. The app asks Google Play for a signed integrity token tied to a hash of the request, and sends it along. Your server decrypts the verdict through Google’s API and checks that the app is genuine, from Play, and on a device that passes integrity checks. Treat the verdict as one signal for risk, not a lock.</p>`,
        code: `// build.gradle.kts: this does NOT hide anything
android {
    defaultConfig {
        buildConfigField("String", "PAY_KEY", "\\"\${localProps["PAY_KEY"]}\\"")  // a plain string in classes.dex
    }
}

// Instead: the secret lives on your server. The app proves who it is.
class CheckoutRepository(
    private val integrity: StandardIntegrityManager,
    private val api: ShopApi,
    private val cloudProjectNumber: Long,
) {
    private var provider: StandardIntegrityTokenProvider? = null

    suspend fun createPayment(cart: Cart): PaymentSession {
        val p = provider ?: integrity.prepareIntegrityToken(
            PrepareIntegrityTokenRequest.builder().setCloudProjectNumber(cloudProjectNumber).build()
        ).await().also { provider = it }

        val body = Json.encodeToString(cart)
        val token = p.request(
            StandardIntegrityTokenRequest.builder().setRequestHash(body.sha256Hex()).build()
        ).await().token()

        // Server: verify the token with Google, then call the payment API with its own secret key.
        return api.createPayment(body, integrityToken = token)
    }
}

private fun String.sha256Hex(): String =
    MessageDigest.getInstance("SHA-256").digest(encodeToByteArray()).joinToString("") { "%02x".format(it) }`,
        remember: 'Anything in the APK is public. Secrets stay on the server; the app sends a session token and a Play Integrity token.',
        terms: [
          { term: 'BuildConfig', def: 'A class generated at build time whose constant fields are compiled into the APK as readable values.' },
          { term: 'Play Integrity API', def: 'A Google Play service that returns a signed verdict about whether a request comes from your genuine app on a genuine Android device.' },
          { term: 'Request hash', def: 'A digest of the request you pass when asking for an integrity token, so the server can check the token belongs to that exact request.' },
          { term: 'Key restriction', def: 'A Cloud Console rule that limits an API key to a package name and signing certificate, or to specific APIs.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Warm up the Play Integrity provider once, then request a token bound to this request.', code: 'val provider = integrityManager.[[prepareIntegrityToken]](\n    PrepareIntegrityTokenRequest.builder()\n        .setCloudProjectNumber(PROJECT_NUMBER)\n        .build()\n).await()\n\nval token = provider.request(\n    StandardIntegrityTokenRequest.builder()\n        .setRequestHash(body.sha256Hex())\n        .build()\n).await().[[token]]()\napi.redeem(body, token)', why: 'Prepare once and keep the provider; each <code>request</code> after that is fast. The token is opaque to the app. Only your server, through Google’s API, can decode the verdict.' },
          { type: 'bug', prompt: 'Anyone who unzips the APK can now charge cards on your account. Tap the line.', code: 'val client = OkHttpClient.Builder()\n    .addInterceptor { chain ->\n        val req = chain.request().newBuilder()\n            .header("Authorization", "Bearer ${BuildConfig.PAYMENTS_SECRET_KEY}")\n            .build()\n        chain.proceed(req)\n    }\n    .build()', bug: 3, fix: '            .header("Authorization", "Bearer ${session.accessToken}")   // short-lived user token; the secret stays on your server', why: 'A <code>BuildConfig</code> field is a string constant in the dex. Send the user’s session token to your own backend, and let the backend hold the payment provider’s secret.' },
        ],
        quiz: [
          { q: 'Does R8 hide a secret stored in <code>BuildConfig</code>?', options: ['Yes, it obfuscates it', 'No, R8 renames code but leaves string constants readable', 'Only in release builds'], a: 1, why: 'Obfuscation changes names like <code>BuildConfig.PAY_KEY</code> to <code>a.b</code>. The value <code>"sk_live_..."</code> is still in the dex for anyone to grep.' },
          { q: 'Which key is fine to ship in the app?', options: ['A payment provider’s secret key', 'A Maps SDK key restricted to your package name and signing certificate', 'Your database password'], a: 1, why: 'Some keys are designed to be public and are limited by restrictions on the provider’s side. Keys that grant power must stay on a server.' },
          { q: 'Who decodes a Play Integrity token?', options: ['The app, before sending it', 'Your server, through Google’s API', 'Nobody, it’s just a random value'], a: 1, why: 'The app treats the token as opaque. The server sends it to Google’s decode endpoint and checks the verdict and the request hash.' },
        ],
        deeper: [
          {
            title: 'How far a key restriction goes',
            body: `<p>An Android restriction on a Google API key lists package names and signing certificate fingerprints. The SDK in your app sends both with each request, and Google refuses calls whose values don’t match. That stops another app from simply reusing your key.</p>
<p>The values travel as request headers, <code>X-Android-Package</code> and <code>X-Android-Cert</code>, and both are public: anyone can read them from your APK. A script that copies them passes the check. So also restrict the key to the APIs your app uses, and set quotas so abuse has a ceiling.</p>`,
            visual(el) {
              const CALLS = [
                { who: 'Your app', what: 'Maps SDK for Android', pkg: true, api: 'maps', mine: true },
                { who: 'Another app, copied key', what: 'Maps SDK for Android', pkg: false, api: 'maps' },
                { who: 'Script, copied headers', what: 'Maps SDK for Android', pkg: true, api: 'maps' },
                { who: 'Script, copied headers', what: 'Geocoding API', pkg: true, api: 'geo' },
              ];
              let busy = false;
              const rows = CALLS.map(c => {
                const st = h('span', { class: 'sec-state' }, 'not sent');
                const r = h('div', { class: 'sec-chk' }, h('span', {}, h('b', {}, c.who), ` → ${c.what}`), st);
                return { c, r, st };
              });
              const o = out('Turn on restrictions, then send all four requests.');
              const app = toggle('sec-d2-sec-app', 'Android apps: com.shop + SHA-1', true, () => clear());
              const api = toggle('sec-d2-sec-api', 'APIs: Maps SDK for Android only', false, () => clear());
              const quota = toggle('sec-d2-sec-quota', 'Quota: 25,000 requests a day', false, () => clear());
              const clear = () => rows.forEach(x => { x.r.className = 'sec-chk'; x.st.textContent = 'not sent'; });
              async function sendAll() {
                if (busy) return; busy = true; clear();
                let abuse = 0;
                for (const x of rows) {
                  x.r.classList.add('sec-now'); await sleep(420); if (!el.isConnected) return;
                  x.r.classList.remove('sec-now');
                  const blocked = (app.input.checked && !x.c.pkg) ? 'blocked: package or cert mismatch' : (api.input.checked && x.c.api !== 'maps') ? 'blocked: API not allowed' : null;
                  if (blocked) { x.st.textContent = blocked; x.r.classList.add(x.c.mine ? 'sec-fail' : 'sec-pass'); }
                  else if (x.c.mine) { x.st.textContent = 'served'; x.r.classList.add('sec-pass'); }
                  else if (quota.input.checked) { x.st.textContent = 'served, up to the quota'; x.r.classList.add('sec-d2-warn'); abuse++; }
                  else { x.st.textContent = 'served, you pay'; x.r.classList.add('sec-fail'); abuse++; replay(x.r, 'shake'); }
                }
                say(o, abuse ? `<span class="bad">${abuse} abusive request${abuse > 1 ? 's' : ''} got through.</span> ${!api.input.checked ? 'Restrict the APIs. ' : ''}${!quota.input.checked ? 'Add a quota. ' : ''}${api.input.checked && quota.input.checked ? 'The copied headers still pass, but the damage now has a ceiling.' : ''}`
                  : '<span class="good">Only your app got through.</span>');
                busy = false;
              }
              el.append(
                h('div', { class: 'controls' }, app.el, api.el, quota.el),
                h('div', { class: 'sec-chks' }, rows.map(x => x.r)),
                h('div', { class: 'controls' }, cmd('send all four requests', sendAll)),
                o);
            },
          },
          {
            title: 'What the server checks in a verdict',
            body: `<p>The integrity token is encrypted and signed. Your server sends it to Google’s <code>decodeIntegrityToken</code> endpoint and gets JSON back. Check it in order: <code>requestHash</code> matches the body you received, <code>timestampMillis</code> is recent, <code>appRecognitionVerdict</code> is <code>PLAY_RECOGNIZED</code>, and <code>deviceRecognitionVerdict</code> contains <code>MEETS_DEVICE_INTEGRITY</code>.</p>
<p>Don’t turn every failure into a hard no. Real users on old or custom phones fail device integrity. Use tiers: allow, allow with an extra step such as a password, or refuse the riskiest action.</p>`,
            visual(el) {
              const SC = {
                ok: { label: 'Genuine app, certified phone', hash: true, fresh: true, app: 'PLAY_RECOGNIZED', dev: '["MEETS_DEVICE_INTEGRITY"]' },
                resign: { label: 'Re-signed APK', hash: true, fresh: true, app: 'UNRECOGNIZED_VERSION', dev: '["MEETS_DEVICE_INTEGRITY"]' },
                root: { label: 'Rooted phone or emulator', hash: true, fresh: true, app: 'PLAY_RECOGNIZED', dev: '[]' },
                replay: { label: 'Old token, new cart', hash: false, fresh: false, app: 'PLAY_RECOGNIZED', dev: '["MEETS_DEVICE_INTEGRITY"]' },
              };
              let busy = false;
              const json = h('div', { class: 'sec-term', 'aria-label': 'Decoded verdict' });
              const CHK = [
                ['requestHash matches the body', s => s.hash, 'refuse'],
                ['timestampMillis is recent', s => s.fresh, 'refuse'],
                ['app is PLAY_RECOGNIZED', s => s.app === 'PLAY_RECOGNIZED', 'refuse'],
                ['device has MEETS_DEVICE_INTEGRITY', s => s.dev !== '[]', 'step up'],
              ];
              const chks = CHK.map(([t]) => { const st = h('span', { class: 'sec-state' }, 'waiting'); return { r: h('div', { class: 'sec-chk' }, h('span', {}, t), st), st }; });
              const o = out('Pick a request. The server decodes its token and checks it.');
              const show = s => json.replaceChildren(...[
                '{', '  "requestDetails": {', '    "requestPackageName": "com.shop",',
                `    "requestHash": "${s.hash ? '9f2c41…' : '<span class="sec-hit">03be7a…</span>'}",`,
                `    "timestampMillis": "${s.fresh ? '1792400000123' : '<span class="sec-hit">1792396123004</span>'}"`, '  },',
                `  "appIntegrity": { "appRecognitionVerdict": "${s.app === 'PLAY_RECOGNIZED' ? s.app : `<span class="sec-hit">${s.app}</span>`}" },`,
                `  "deviceIntegrity": { "deviceRecognitionVerdict": ${s.dev === '[]' ? '<span class="sec-hit">[]</span>' : s.dev} }`, '}',
              ].map(t => h('div', { class: 'line', html: t })));
              const btns = Object.entries(SC).map(([k, s]) => act(s.label, async () => {
                if (busy) return; busy = true;
                press(btns, btns[Object.keys(SC).indexOf(k)]);
                show(s); replay(json, 'pop-soft');
                chks.forEach(c => { c.r.className = 'sec-chk'; c.st.textContent = 'waiting'; });
                let verdict = 'allow';
                for (let i = 0; i < CHK.length; i++) {
                  const c = chks[i]; c.r.classList.add('sec-now');
                  await sleep(380); if (!el.isConnected) return;
                  c.r.classList.remove('sec-now');
                  const pass = CHK[i][1](s);
                  c.r.classList.add(pass ? 'sec-pass' : 'sec-fail'); c.st.textContent = pass ? 'pass' : 'fail';
                  if (!pass) { verdict = CHK[i][2]; if (verdict === 'refuse') break; }
                }
                say(o, verdict === 'allow' ? '<span class="good">Allow.</span> Every check passed.'
                  : verdict === 'step up' ? '<span class="bad">Step up.</span> The app is genuine but the phone fails device integrity. Ask for the password, or cap the amount.'
                  : `<span class="bad">Refuse.</span> ${s.hash ? 'This is not your app as Play distributes it.' : 'The token belongs to a different request. It was replayed.'}`);
                busy = false;
              }));
              show(SC.ok);
              el.append(
                h('div', { class: 'controls' }, btns),
                json,
                h('div', { class: 'sec-chks' }, chks.map(c => c.r)),
                o);
            },
          },
        ],
        underHood: {
          body: `<p>A <code>BuildConfig</code> string is a compile-time constant. Kotlin copies its value into every place that reads it, and D8 or R8 writes it once into the dex string table. A <code>const-string</code> instruction loads it. That is why a grep finds it, and why renaming classes hides nothing. R8 can even delete the <code>BuildConfig</code> class and leave the copied value behind.</p>
<p>Play Integrity works the other way round. <code>prepareIntegrityToken</code> lets Play services do the slow setup early. Each <code>request</code> then returns a token that Google encrypted and signed. By default only Google’s server can decrypt it for you, so the app can neither read nor forge the verdict.</p>`,
          code: `$ baksmali d classes.dex -o smali && grep -rn "sk_live" smali/
smali/p0/b.smali:41:    const-string v1, "sk_live_51Hq8zEXAMPLEk3y"`,
        },
        mistakes: [
          {
            title: 'Encoding the key and calling it hidden',
            bad: `private val key = String(Base64.decode("c2tfbGl2ZV81MUhx…", Base64.DEFAULT))
payments.charge(card, apiKey = key)`,
            good: `// The app asks your backend. The backend holds the key.
api.createCharge(cartId)   // Authorization: Bearer <user session token>`,
            why: 'Base64 is an encoding, not encryption. A hook on <code>charge()</code> prints the key the moment your code decodes it.',
          },
          {
            title: 'Judging the token in the app',
            bad: `val token = provider.request(request).await().token()
val deviceOk = token.isNotEmpty()        // "we got a token, so the phone is fine"
api.redeem(code, deviceOk = deviceOk)`,
            good: `val token = provider.request(request).await().token()
api.redeem(code, integrityToken = token) // the server decodes it and decides`,
            why: 'Anything the app computes, a hook can change. Send the raw token. Only the server, through Google, learns what the verdict says.',
          },
          {
            title: 'Reusing one token for every request',
            bad: `val token = provider.request(StandardIntegrityTokenRequest.builder().build()).await().token()
cache.save(token)                  // sent with every later call
api.redeem(code, cache.token())`,
            good: `val body = Json.encodeToString(RedeemRequest(code))
val token = provider.request(
    StandardIntegrityTokenRequest.builder().setRequestHash(body.sha256Hex()).build()
).await().token()
api.redeem(body, token)`,
            why: 'A token without a request hash proves nothing about this request, and a captured one can be replayed with a different body. Ask for a fresh token per sensitive action, bound to that body.',
          },
        ],
        visual(el) {
          const KEY = 'sk_live_51Hq8zEXAMPLEk3y';
          const places = [
            { id: 'bc', label: 'BuildConfig field' },
            { id: 'res', label: 'strings.xml' },
            { id: 'so', label: 'Native .so, XOR-ed' },
            { id: 'server', label: 'Your backend' },
          ];
          let where = 'bc', decompiled = false, leaked = false, busy = false;
          const term = h('div', { class: 'sec-term', 'aria-live': 'polite' });
          const flag = h('span', { class: 'sec-flag' }, 'key: not found yet');
          const r8 = toggle('sec-sec-r8', 'isMinifyEnabled = true (R8)', false, () => { decompiled = false; setLeak(false); term.replaceChildren(); tline(`<span class="muted"># rebuilt with R8 ${r8.input.checked ? 'on' : 'off'}. Decompile again.</span>`); });
          const tline = (html, cls) => { line(term, html, cls); trim(term, 8); };
          const setLeak = v => { leaked = v; flag.textContent = v ? 'key: leaked' : 'key: not found yet'; flag.classList.toggle('sec-bad', v); if (v) replay(flag, 'pop'); };
          const placeBtns = places.map((p, i) => act(p.label, () => {
            if (busy) return;
            where = p.id; press(placeBtns, placeBtns[i]); decompiled = false; setLeak(false);
            term.replaceChildren();
            tline(`<span class="muted"># key now lives in: ${p.label}. New release built.</span>`);
          }));
          const hit = s => `<span class="sec-hit">${s}</span>`;
          press(placeBtns, placeBtns[0]);
          tline('<span class="muted"># app-release.apk, downloaded from the store. Decompile it.</span>');
          el.append(
            h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Key lives in'), placeBtns),
            h('div', { class: 'controls' }, r8.el, flag),
            term,
            h('div', { class: 'controls' },
              cmd('jadx -d out app-release.apk', async () => {
                if (busy) return;
                busy = true; term.replaceChildren();
                tline('$ jadx -d out app-release.apk');
                const min = r8.input.checked;
                const files = min
                  ? ['out/sources/a/a.java', 'out/sources/p0/C0412b.java', 'out/resources/res/values/strings.xml']
                  : ['out/sources/com/shop/BuildConfig.java', 'out/sources/com/shop/CheckoutRepository.java', 'out/resources/res/values/strings.xml'];
                if (where === 'so') files.push('out/resources/lib/arm64-v8a/libkeys.so');
                for (const f of files) { await sleep(260); if (!term.isConnected) return; tline(`<span class="muted">INFO</span>  saved ${f}`); }
                await sleep(200);
                tline(`<span class="good">done</span> ${min ? '(names are short now, strings are not)' : ''}`);
                decompiled = true; busy = false;
              }),
              cmd('grep -rn "sk_live" out/', () => {
                if (busy) return;
                tline('$ grep -rn "sk_live" out/');
                if (!decompiled) { tline('<span class="bad">grep: out/: No such file or directory</span>'); return; }
                const min = r8.input.checked;
                if (where === 'bc') { tline(min ? `sources/p0/C0412b.java:31:  String str = "${hit(KEY)}";` : `sources/com/shop/BuildConfig.java:9:  public static final String PAY_KEY = "${hit(KEY)}";`); setLeak(true); }
                else if (where === 'res') { tline(`resources/res/values/strings.xml:12:  &lt;string name="pay_key"&gt;${hit(KEY)}&lt;/string&gt;`); setLeak(true); }
                else if (where === 'so') tline('<span class="muted">(no match: the bytes are XOR-ed. Try watching it at runtime.)</span>');
                else tline('<span class="good">(no match)</span> <span class="muted">only https://api.shop.example/ is in the app</span>');
              }),
              cmd('frida -U -f com.shop -l hook.js', async () => {
                if (busy) return;
                busy = true;
                tline('$ frida -U -f com.shop -l hook.js');
                await sleep(500); if (!term.isConnected) return;
                if (where === 'server') tline('<span class="good">[hook]</span> Authorization: Bearer eyJhbGciOi… <span class="muted">(this user’s 15-minute session token. No secret to steal.)</span>');
                else if (where === 'so') { tline(`[hook] Keys.decode() returned "${hit(KEY)}"`); setLeak(true); }
                else { tline(`[hook] OkHttp header Authorization: Bearer ${hit(KEY)}`); setLeak(true); }
                busy = false;
              })),
            h('p', { class: 'tip' }, 'Try every place. Only one keeps the key off the phone.'));
        },
      },

      // 5b ────────────────────────────────────────────
      {
        id: 'credential-manager',
        title: 'Sign-in with Credential Manager and passkeys',
        tagline: 'One request, one sheet: passkeys, saved passwords and Sign in with Google.',
        level: 'intermediate',
        body: `
<p>Credential Manager (<code>androidx.credentials</code>) is the Jetpack API for signing users in. You build one <code>GetCredentialRequest</code> with every option your app supports: passkeys, saved passwords and Sign in with Google. <code>getCredential()</code> shows one system bottom sheet with everything the user has saved for your app. You get back one credential and send it to your server.</p>
<p>A passkey is a key pair. The private key stays in a credential provider such as Google Password Manager and is unlocked with the screen lock. Your server keeps only the public key. To sign in, the server sends a fresh challenge, the phone signs it, and the server checks the signature. Nothing that crosses the network can be replayed, and a database leak gives away no passwords. A passkey belongs to one domain. Digital Asset Links tie that domain to your app’s signing certificate, so a copycat app never gets offered it. Passkeys through Credential Manager work on Android 9 (API 28) and up.</p>
<p>It replaces the older APIs. Smart Lock for Passwords was deprecated in 2022 and is gone from <code>play-services-auth</code> 21.0.0, so code that uses it no longer builds. The legacy Google Sign-In API is deprecated and will be removed in a future release. One Tap is listed with the legacy APIs too.</p>`,
        code: `// androidx.credentials:credentials, androidx.credentials:credentials-play-services-auth,
// com.google.android.libraries.identity.googleid:googleid
private val credentialManager = CredentialManager.create(context)

suspend fun signIn(activity: Activity) {
    val passkeyJson = api.passkeySignInOptions()       // your server makes a fresh challenge
    val request = GetCredentialRequest(
        listOf(
            GetPublicKeyCredentialOption(requestJson = passkeyJson),
            GetPasswordOption(),
            GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(true)   // accounts that used this app before
                .setServerClientId(WEB_CLIENT_ID)
                .setNonce(api.newNonce())
                .build(),
        )
    )
    try {
        val result = credentialManager.getCredential(context = activity, request = request)
        when (val c = result.credential) {
            is PublicKeyCredential -> api.finishPasskeySignIn(c.authenticationResponseJson)
            is PasswordCredential -> api.passwordSignIn(c.id, c.password)
            is CustomCredential ->
                if (c.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    api.googleSignIn(GoogleIdTokenCredential.createFrom(c.data).idToken)
                }
        }
    } catch (e: NoCredentialException) {
        showSignInForm()               // nothing saved for this app yet
    } catch (e: GetCredentialCancellationException) {
        // the user closed the sheet: don't open it again by yourself
    } catch (e: GetCredentialException) {
        showError(e)
    }
}`,
        remember: 'Ask for every credential type in one getCredential() call, and let the server verify what comes back. The phone proves, the server decides.',
        terms: [
          { term: 'Credential Manager', def: 'The Jetpack API (androidx.credentials) that gets and saves passkeys, passwords and federated sign-in credentials through one system UI.' },
          { term: 'Passkey', def: 'A WebAuthn key pair for one account on one domain. The private key stays with the credential provider and signs server challenges; the server stores only the public key.' },
          { term: 'Relying party ID (rpId)', def: 'The domain a passkey belongs to, such as haber.example. The provider only offers the passkey to that domain and to apps the domain vouches for.' },
          { term: 'Digital Asset Links', def: 'An assetlinks.json file on your domain that lists your app’s package name and signing certificate fingerprint. Required for passkeys.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Offer passkeys and saved passwords in one sheet.', code: 'val request = GetCredentialRequest(\n    listOf(GetPublicKeyCredentialOption(requestJson), [[GetPasswordOption]]())\n)\nval result = credentialManager.[[getCredential]](context = activity, request = request)', why: 'Every option goes in one request, so the user sees one sheet with all their credentials. <code>getCredential</code> is a suspend function that returns the one they picked.' },
          { type: 'bug', prompt: 'Anyone can sign in as anyone with this code. Tap the line.', code: 'when (val c = result.credential) {\n    is CustomCredential -> if (c.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {\n        val google = GoogleIdTokenCredential.createFrom(c.data)\n        session.signInLocally(email = google.id)\n    }\n}', bug: 3, fix: '        api.signInWithGoogle(idToken = google.idToken)', why: 'The app on a rooted phone can be made to report any email. Send the signed ID token to your server, which checks its signature, audience and nonce before it creates a session.' },
        ],
        quiz: [
          { q: 'What does your server store after a user creates a passkey?', options: ['The private key, encrypted', 'The public key and the credential ID', 'A hash of the user’s screen lock PIN'], a: 1, why: 'The private key never leaves the credential provider. The server only needs the public key to check signatures, so a database leak reveals nothing useful.' },
          { q: '<code>getCredential()</code> throws <code>NoCredentialException</code> on a new user’s phone. What should the app do?', options: ['Call getCredential() again in a loop', 'Show the normal sign-in or sign-up screen', 'Crash, the phone is misconfigured'], a: 1, why: 'Nothing is saved for this app yet. Show your regular form, and offer to create a passkey after the user is signed in.' },
          { q: 'Your app still calls Smart Lock for Passwords. What happens when you update to <code>play-services-auth</code> 21.0.0?', options: ['Nothing, it still works the same', 'The build fails: the Smart Lock API was removed, so migrate to Credential Manager', 'Passwords are deleted from users’ phones'], a: 1, why: 'Smart Lock was deprecated in 2022 and removed from the SDK. Versions already in the Play Store keep working, but new builds with 21.0.0 can’t use it.' },
        ],
        deeper: [
          {
            title: 'Creating a passkey',
            body: `<p>Offer a passkey right after the user signs in with a password or Google. Ask your server for creation options: a fresh challenge, your domain as the relying party, and a user ID. Make the user ID a random value, not an email. Pass the JSON to <code>createCredential()</code>. The user confirms with the screen lock, the provider makes the key pair, and you send <code>registrationResponseJson</code> to the server, which checks the challenge and stores the public key.</p>
<p>Before this works, host <code>https://your-domain/.well-known/assetlinks.json</code> with your package name and the SHA-256 fingerprint of each signing certificate, debug and release. Tell the user a passkey was made, for example with a snackbar.</p>`,
            code: `suspend fun offerPasskey(activity: Activity) {
    val request = CreatePublicKeyCredentialRequest(requestJson = api.passkeyCreationOptions())
    try {
        val response = credentialManager.createCredential(activity, request) as CreatePublicKeyCredentialResponse
        api.finishPasskeyRegistration(response.registrationResponseJson)
        snackbar("Passkey created. Next time, sign in with your screen lock.")
    } catch (e: CreateCredentialCancellationException) {
        // user said no: ask again later, not now
    } catch (e: CreateCredentialException) {
        log(e)
    }
}`,
          },
          {
            title: 'Sign in with Google, two passes and a button',
            body: `<p>First ask only for accounts that used your app before: <code>setFilterByAuthorizedAccounts(true)</code>. With <code>setAutoSelectEnabled(true)</code> a returning user with one account is signed in with no tap. If that throws <code>NoCredentialException</code>, ask again with the filter set to <code>false</code> to show every Google account on the phone, which is the sign-up path.</p>
<p>For an explicit “Sign in with Google” button, use <code>GetSignInWithGoogleOption</code>. Either way you get a <code>CustomCredential</code> holding an ID token. The app does not trust it. The server verifies the token and checks that its nonce matches the one it issued.</p>`,
            code: `// Pass 2, after NoCredentialException from pass 1
val signUp = GetGoogleIdOption.Builder()
    .setFilterByAuthorizedAccounts(false)
    .setServerClientId(WEB_CLIENT_ID)
    .setNonce(api.newNonce())
    .build()

// Behind your own "Sign in with Google" button
val button = GetSignInWithGoogleOption.Builder(serverClientId = WEB_CLIENT_ID)
    .setNonce(api.newNonce())
    .build()`,
          },
          {
            title: 'Signing out, and access to Google APIs',
            body: `<p>On sign-out, call <code>clearCredentialState()</code>. It tells every credential provider to forget the current session for your app, so the next sheet shows all options instead of auto-selecting the last account. Clear your own tokens too.</p>
<p>The legacy Google Sign-In mixed two jobs. Now they are split: Credential Manager signs the user in (authentication), and <code>AuthorizationClient</code> asks for access to things like the user’s Google Drive (authorization), at the moment the feature needs it.</p>`,
            code: `suspend fun signOut() {
    credentialManager.clearCredentialState(ClearCredentialStateRequest())
    tokenStore.clear()
}`,
          },
        ],
        underHood: {
          body: `<p>Passkeys are WebAuthn credentials. The sign-in options from your server hold a random <code>challenge</code> and the <code>rpId</code>. The provider finds a passkey for that rpId, but only if the domain’s <code>assetlinks.json</code> lists the calling app’s package and certificate. After the screen lock, it signs the authenticator data together with <code>clientDataJSON</code>, which contains the challenge and the origin.</p>
<p>For an Android app the origin is <code>android:apk-key-hash:</code> plus the base64url SHA-256 hash of your signing certificate. The server checks four things: the challenge is the one it issued and not used before, the origin is on its allow list, the rpId hash matches, and the signature verifies with the stored public key.</p>`,
          code: `// authenticationResponseJson, shortened
{
  "id": "KEDetxZcUfinhVi6Za5nZQ",
  "type": "public-key",
  "response": {
    "clientDataJSON": "...",     // type, challenge, origin: android:apk-key-hash:...
    "authenticatorData": "...",  // rpId hash, flags, sign counter
    "signature": "...",          // made with the private key
    "userHandle": "..."          // the random user ID from registration
  }
}`,
        },
        mistakes: [
          {
            title: 'Trusting the Google ID token on the phone',
            bad: `val google = GoogleIdTokenCredential.createFrom(c.data)
prefs.edit { putString("user", google.id) }   // "signed in"`,
            good: `val google = GoogleIdTokenCredential.createFrom(c.data)
val session = api.googleSignIn(google.idToken)  // server verifies signature, audience, nonce
tokenStore.save(session)`,
            why: 'Anything the app decides on its own can be patched or hooked. The ID token is signed by Google, but only your server can check it safely and turn it into your own session.',
          },
          {
            title: 'Calling getCredential with the application context',
            bad: `credentialManager.getCredential(context = applicationContext, request = request)`,
            good: `credentialManager.getCredential(context = activity, request = request)`,
            why: 'The call shows system UI on top of your screen. The docs ask for an activity-based context; with another context, how the UI launches is undefined.',
          },
          {
            title: 'Leaving out the Play services module',
            bad: `implementation("androidx.credentials:credentials:1.6.0")`,
            good: `implementation("androidx.credentials:credentials:1.6.0")
implementation("androidx.credentials:credentials-play-services-auth:1.6.0")`,
            why: '<code>credentials-play-services-auth</code> connects Credential Manager to the provider in Google Play services. Without it, calls fail with a <code>ProviderConfigurationException</code>.',
          },
        ],
        visual(el) {
          const opt = { passkey: true, password: true, google: true };
          const dev = { passkey: false, password: true };
          let user = null, busy = false, sheet = null;
          const o = h('div', { class: 'out', 'aria-live': 'polite' });
          const log = html => { line(o, html); trim(o, 7); };
          const title = h('div', { class: 'sec-ph-title' }, 'Haber+');
          const sub = h('div', { class: 'sec-ph-sub' }, 'Not signed in');
          const phone = h('div', { class: 'phone sec-cm-phone' }, title, sub);
          const saved = h('div', { class: 'sec-cm-chips' });
          const server = h('div', { class: 'sec-cm-chips' });
          const paint = () => {
            saved.replaceChildren(
              h('span', { class: 'sec-cm-chip' + (dev.passkey ? ' sec-cm-on' : '') }, dev.passkey ? 'passkey · ayse' : 'no passkey'),
              h('span', { class: 'sec-cm-chip sec-cm-on' }, 'password · ayse'),
              h('span', { class: 'sec-cm-chip sec-cm-on' }, 'Google · ayse.yilmaz'));
            server.replaceChildren(
              h('span', { class: 'sec-cm-chip sec-cm-on' }, 'password hash'),
              h('span', { class: 'sec-cm-chip' + (dev.passkey ? ' sec-cm-on' : '') }, dev.passkey ? 'passkey public key' : 'no public key'));
            sub.textContent = user ? `Hoş geldin, Ayşe (${user})` : 'Not signed in';
          };
          const close = () => { if (sheet) { sheet.remove(); sheet = null; } busy = false; };
          const wait = async ms => { await sleep(ms); return el.isConnected; };
          const openSheet = (heading, entries, onCancel) => {
            sheet = h('div', { class: 'sec-sheet sec-cm-sheet' }, h('b', {}, heading),
              entries.map(([label, fn]) => act(label, () => { if (sheet) { close(); busy = true; fn(); } })),
              act('Cancel', () => { if (sheet) { close(); onCancel(); } }));
            phone.append(sheet);
          };
          async function finish(kind) {
            if (kind === 'passkey') {
              log('screen lock: <span class="good">fingerprint ok</span> <span class="muted">// unlocks the private key</span>');
              if (!await wait(450)) return;
              log('PublicKeyCredential → <span class="muted">authenticationResponseJson: challenge signed</span>');
              if (!await wait(450)) return;
              log('<span class="good">server: signature checks out with the stored public key</span>');
            } else if (kind === 'password') {
              log('PasswordCredential(id = "ayse@ornek.com", password = ••••••)');
              if (!await wait(450)) return;
              log('<span class="good">server: password hash matches</span> <span class="muted">// a password can still be phished</span>');
            } else {
              log('CustomCredential <span class="muted">type = TYPE_GOOGLE_ID_TOKEN_CREDENTIAL</span>');
              if (!await wait(450)) return;
              log('GoogleIdTokenCredential.createFrom(data).idToken → server');
              if (!await wait(450)) return;
              log('<span class="good">server: token signature, audience and nonce ok</span>');
            }
            user = kind; paint(); replay(phone, 'pop-soft'); busy = false;
          }
          async function get(copycat) {
            if (busy) return; busy = true;
            o.replaceChildren();
            log(`getCredential(<span class="muted">${Object.keys(opt).filter(k => opt[k]).join(' + ') || 'no options'}</span>)${copycat ? ' <span class="muted">// from a copycat app</span>' : ''}`);
            if (!await wait(350)) return;
            const entries = [];
            if (copycat && (opt.passkey || opt.password)) log('<span class="muted">assetlinks.json for haber.example does not list this app’s certificate</span>');
            if (!copycat && opt.passkey && dev.passkey) entries.push(['Passkey · ayse@ornek.com', () => finish('passkey')]);
            if (!copycat && opt.password && dev.password) entries.push(['Password · ayse@ornek.com', () => finish('password')]);
            if (opt.google) entries.push(['Google · ayse.yilmaz@gmail.com', () => copycat ? copyGoogle() : finish('google')]);
            if (!entries.length) { log('<span class="bad">NoCredentialException</span> <span class="muted">// show the normal sign-in form</span>'); replay(phone, 'shake'); busy = false; return; }
            openSheet('Sign in to Haber+', entries, () => log('<span class="bad">GetCredentialCancellationException</span> <span class="muted">// don’t reopen it</span>'));
          }
          async function copyGoogle() {
            log('CustomCredential → idToken sent to the copycat’s server');
            if (!await wait(450)) return;
            log('<span class="good">Your server never sees it.</span> <span class="muted">// the token’s audience is the copycat’s client ID, not yours</span>');
            busy = false;
          }
          async function create() {
            if (busy) return;
            if (!user) { log('<span class="muted">Sign in first. A passkey is created for an account that already exists.</span>'); return; }
            if (dev.passkey) { log('<span class="muted">A passkey already exists for this account.</span>'); return; }
            busy = true; o.replaceChildren();
            log('createCredential(CreatePublicKeyCredentialRequest(<span class="muted">challenge, rpId = haber.example</span>))');
            if (!await wait(350)) return;
            openSheet('Create a passkey for ayse@ornek.com?', [['Create with screen lock', async () => {
              log('screen lock: <span class="good">fingerprint ok</span> <span class="muted">// provider makes the key pair</span>');
              if (!await wait(450)) return;
              log('registrationResponseJson → server <span class="muted">// public key only</span>');
              if (!await wait(450)) return;
              dev.passkey = true; paint();
              log('<span class="good">server stored the public key.</span> Sign out and sign in again.');
              busy = false;
            }]], () => log('<span class="bad">CreateCredentialCancellationException</span> <span class="muted">// ask again later</span>'));
          }
          async function signOut() {
            if (busy) return;
            if (!user) { log('<span class="muted">Not signed in.</span>'); return; }
            user = null; paint();
            log('clearCredentialState(ClearCredentialStateRequest()) <span class="muted">// providers forget the session</span>');
          }
          const sw = (k, label) => toggle('sec-cm-' + k, label, opt[k], v => { opt[k] = v; });
          paint();
          log('<span class="muted">Sign in, create a passkey, sign out, then sign in with the passkey.</span>');
          el.append(
            h('div', { class: 'sec-cm' },
              h('div', { class: 'viz' },
                h('div', { class: 'sec-row' }, h('span', { class: 'sec-label' }, 'Options in the request')),
                h('div', { class: 'sec-row' }, sw('passkey', 'Passkey').el, sw('password', 'Password').el, sw('google', 'Google').el),
                h('div', { class: 'sec-cm-store' }, h('span', { class: 'sec-label' }, 'On the phone'), saved),
                h('div', { class: 'sec-cm-store' }, h('span', { class: 'sec-label' }, 'On your server'), server),
                h('div', { class: 'controls' },
                  cmd('getCredential(request)', () => get(false)),
                  cmd('createCredential(passkey)', create),
                  cmd('clearCredentialState()', signOut),
                  act('Same call from a copycat app', () => get(true))),
                o),
              phone));
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'biometric',
        title: 'Biometric authentication',
        tagline: 'A fingerprint should unlock a key, not just a callback.',
        level: 'intermediate',
        body: `
<p><code>BiometricPrompt</code> from <code>androidx.biometric</code> shows the system’s own sheet for fingerprint, face or the device PIN. You never see the biometric data. First ask <code>BiometricManager.canAuthenticate()</code> whether the device has what you need enrolled, and always offer another way in, like a password.</p>
<p>Android rates sensors. <code>BIOMETRIC_STRONG</code> (Class 3) meets strict spoofing limits and can unlock Keystore keys. <code>BIOMETRIC_WEAK</code> (Class 2) includes many face unlock systems; it is fine for convenience but can’t unlock keys. <code>DEVICE_CREDENTIAL</code> means the screen lock PIN, pattern or password.</p>
<p>A prompt alone only gives you a callback, and on a rooted phone a hook can call <code>onAuthenticationSucceeded</code> for you. For anything that matters, pass a <code>CryptoObject</code> wrapping a <code>Cipher</code> from an auth-bound Keystore key. The secure hardware unlocks that one operation only after a real match, so a faked callback gets a cipher that still can’t decrypt. CryptoObject requires <code>BIOMETRIC_STRONG</code> (or <code>DEVICE_CREDENTIAL</code> on Android 11+). For signing in, look at passkeys with Credential Manager instead.</p>`,
        code: `fun unlockToken(activity: FragmentActivity, iv: ByteArray, sealed: ByteArray, onToken: (String) -> Unit) {
    val can = BiometricManager.from(activity).canAuthenticate(BIOMETRIC_STRONG)
    if (can != BiometricManager.BIOMETRIC_SUCCESS) return showPasswordLogin()

    // Key made with setUserAuthenticationParameters(0, AUTH_BIOMETRIC_STRONG): every use needs a prompt
    val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply {
        init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, iv))
    }

    val prompt = BiometricPrompt(activity, ContextCompat.getMainExecutor(activity),
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                val unlocked = result.cryptoObject?.cipher ?: return
                onToken(unlocked.doFinal(sealed).decodeToString())
            }
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                if (errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON) showPasswordLogin()
            }
            // onAuthenticationFailed(): a non-matching finger. The prompt stays open.
        })

    val info = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Unlock your wallet")
        .setNegativeButtonText("Use password")
        .setAllowedAuthenticators(BIOMETRIC_STRONG)
        .build()

    prompt.authenticate(info, BiometricPrompt.CryptoObject(cipher))
}`,
        remember: 'Pass a CryptoObject with BIOMETRIC_STRONG. A match unlocks the key, not just a callback.',
        terms: [
          { term: 'BiometricPrompt', def: 'The AndroidX API that shows the system authentication sheet for fingerprint, face or device credential and reports the result to a callback.' },
          { term: 'BIOMETRIC_STRONG', def: 'Class 3 biometrics: sensors that meet Android’s strictest spoofing limits and can unlock Keystore keys.' },
          { term: 'CryptoObject', def: 'A wrapper around a Cipher, Signature or Mac from an auth-bound key that BiometricPrompt authorizes for one operation.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Allow only Class 3 biometrics and tie the prompt to a cipher.', code: 'val info = BiometricPrompt.PromptInfo.Builder()\n    .setTitle("Confirm payment")\n    .setNegativeButtonText("Cancel")\n    .setAllowedAuthenticators([[BIOMETRIC_STRONG]])\n    .build()\n\nprompt.authenticate(info, BiometricPrompt.[[CryptoObject]](cipher))', why: 'Only Class 3 sensors can authorize Keystore operations, so CryptoObject needs <code>BIOMETRIC_STRONG</code>.' },
          { type: 'bug', prompt: '<code>build()</code> throws <code>IllegalArgumentException</code>. Tap the line.', code: 'val info = BiometricPrompt.PromptInfo.Builder()\n    .setTitle("Confirm transfer")\n    .setSubtitle("120 EUR to Ada")\n    .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)\n    .setNegativeButtonText("Cancel")\n    .build()\nprompt.authenticate(info, BiometricPrompt.CryptoObject(cipher))', bug: 4, fix: '    // remove it: with DEVICE_CREDENTIAL allowed, the sheet offers “Use PIN” instead of a negative button', why: 'When the device credential is allowed, the system provides the fallback itself. Setting a negative button as well is rejected.' },
        ],
        quiz: [
          { q: 'Why pass a <code>CryptoObject</code> instead of just checking <code>onAuthenticationSucceeded</code>?', options: ['It makes the prompt faster', 'The secure hardware unlocks the key only after a real match, so a hooked callback gets nothing useful', 'It allows face unlock'], a: 1, why: 'A callback is just code and can be called by a hook. A Keystore operation authorized by the TEE can’t be faked from the app process.' },
          { q: 'You call <code>authenticate(info, CryptoObject(cipher))</code> with <code>BIOMETRIC_WEAK</code>. What happens?', options: ['It works with face unlock', 'It throws: crypto-based auth is not supported for Class 2', 'It silently upgrades to STRONG'], a: 1, why: 'Class 2 sensors are not trusted to unlock keys. Use <code>BIOMETRIC_STRONG</code>, or drop the CryptoObject for convenience-only checks.' },
          { q: 'The user touches the sensor with the wrong finger. Which callback runs?', options: ['<code>onAuthenticationError</code>', '<code>onAuthenticationFailed</code>, and the prompt stays open', 'None'], a: 1, why: 'A non-match is not an error. Errors are for cancel, lockout or a missing sensor, and they close the prompt.' },
        ],
        deeper: [
          {
            title: 'Ask what this phone can do',
            body: `<p><code>canAuthenticate(authenticators)</code> answers for one exact set of authenticators. The same phone can say yes to <code>BIOMETRIC_WEAK</code> and no to <code>BIOMETRIC_STRONG</code>, for example when face unlock is Class 2 and no fingerprint is enrolled. Ask with the same set you will pass to the prompt.</p>
<p>Each answer needs its own UI. <code>BIOMETRIC_ERROR_NONE_ENROLLED</code> means the hardware is there, so offer setup: on Android 11 and later you can open <code>Settings.ACTION_BIOMETRIC_ENROLL</code>. <code>BIOMETRIC_ERROR_NO_HARDWARE</code> means hide the option. Either way, the password path stays.</p>`,
            code: `when (BiometricManager.from(context).canAuthenticate(BIOMETRIC_STRONG)) {
    BiometricManager.BIOMETRIC_SUCCESS -> showBiometricToggle()
    BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> showSetupButton {
        startActivity(Intent(Settings.ACTION_BIOMETRIC_ENROLL).putExtra(
            Settings.EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED, BIOMETRIC_STRONG))   // API 30+
    }
    else -> hideBiometricOption()   // no hardware, unavailable, update required…
}`,
            visual(el) {
              const AUTH = ['BIOMETRIC_STRONG', 'BIOMETRIC_WEAK', 'BIOMETRIC_STRONG or DEVICE_CREDENTIAL'];
              const DEV = [
                { label: 'Fingerprint enrolled', r: ['SUCCESS', 'SUCCESS', 'SUCCESS'] },
                { label: 'Face unlock (Class 2) only', r: ['ERROR_NONE_ENROLLED', 'SUCCESS', 'SUCCESS'] },
                { label: 'Sensor, nothing enrolled', r: ['ERROR_NONE_ENROLLED', 'ERROR_NONE_ENROLLED', 'SUCCESS'] },
                { label: 'No sensor', r: ['ERROR_NO_HARDWARE', 'ERROR_NO_HARDWARE', 'SUCCESS'] },
              ];
              const UI = { SUCCESS: ['Show “Unlock with fingerprint”', 'sec-safe'], ERROR_NONE_ENROLLED: ['Show “Set up fingerprint” → Settings', 'sec-warn'], ERROR_NO_HARDWARE: ['Hide the option, password only', ''] };
              let d = 0, a = 0;
              const grid = h('div', { class: 'sec-chks' });
              const o = out('');
              const paint = changed => {
                grid.replaceChildren(...AUTH.map((t, i) => {
                  const res = DEV[d].r[i];
                  return h('div', { class: 'sec-chk' + (i === a ? ' sec-now' : '') + (changed && i === a ? ' pop' : '') },
                    h('span', { class: 'sec-d2-mono' }, `canAuthenticate(${t})`),
                    h('span', { class: 'sec-state' + (res === 'SUCCESS' ? ' sec-d2-ok' : '') }, res));
                }));
                const res = DEV[d].r[a];
                say(o, `${hl('BiometricManager.BIOMETRIC_' + res)} <span class="muted">→ ${UI[res][0]}</span>`);
                phoneTxt.textContent = UI[res][0];
                phone.className = 'sec-card sec-d2-ui ' + UI[res][1];
                replay(phone, 'pop');
              };
              const phoneTxt = h('b', {});
              const phone = h('div', { class: 'sec-card sec-d2-ui' }, h('span', { class: 'sec-label' }, 'Settings screen in your app'), phoneTxt, h('small', {}, 'Password sign-in always stays available.'));
              const dBtns = DEV.map((x, i) => act(x.label, () => { d = i; press(dBtns, dBtns[i]); paint(true); }));
              const aBtns = AUTH.map((t, i) => act(t.replace('BIOMETRIC_', '').replace(' or DEVICE_CREDENTIAL', ' + PIN'), () => { a = i; press(aBtns, aBtns[i]); paint(true); }));
              press(dBtns, dBtns[0]); press(aBtns, aBtns[0]);
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Phone'), dBtns),
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'You ask'), aBtns),
                grid, phone, o,
                h('p', { class: 'tip' }, 'Every phone here has a PIN set. The + PIN row needs Android 11 or later.'));
              paint(false);
            },
          },
          {
            title: 'Failed tries and lockout',
            body: `<p>A wrong finger calls <code>onAuthenticationFailed</code>, and the prompt stays open. After too many failures in a row, the sensor locks. <code>ERROR_LOCKOUT</code> (7) is temporary and lifts after a short wait. Repeated lockouts lead to <code>ERROR_LOCKOUT_PERMANENT</code> (9): biometrics stay off until the user unlocks with their PIN, pattern or password.</p>
<p>Both are errors, so the prompt closes. Don’t reopen it in a loop. Say what happened and offer the password, or a prompt that allows <code>DEVICE_CREDENTIAL</code>.</p>`,
            visual(el) {
              const LOCK_AT = 5, PERM_AT = 10, WAIT = 8;
              let fails = 0, total = 0, until = 0, perm = false, ticking = false;
              const live = alive(el);
              const fp = h('span', { class: 'sec-fp', 'aria-hidden': 'true' });
              const meter = h('span', {});
              const stat = h('span', { class: 'sec-stat' });
              const clock = h('span', { class: 'clock' });
              const sheet = h('div', { class: 'sec-card sec-d2-sheet' }, h('b', {}, 'Confirm payment'), fp, stat, h('div', { class: 'sec-meter', 'aria-hidden': 'true' }, meter));
              const o = out('');
              const log = (html, cls) => { line(o, html, cls); trim(o, 4); };
              const locked = () => perm || Date.now() < until;
              const paint = () => {
                stat.innerHTML = `failed in a row: <b>${fails}</b> · total: <b>${total}</b>`;
                meter.style.width = `${Math.min(100, (total / PERM_AT) * 100)}%`;
                meter.classList.toggle('sec-low', !total);
                fp.classList.toggle('sec-no', locked());
                sheet.classList.toggle('sec-bad', perm);
                sheet.classList.toggle('sec-warn', !perm && locked());
              };
              const tick = () => {
                if (!live()) { ticking = false; return; }
                const left = Math.ceil((until - Date.now()) / 1000);
                clock.textContent = perm ? 'biometrics off until PIN' : left > 0 ? `locked for ${left} s` : '';
                if (left > 0 && !perm) setTimeout(tick, 250); else { ticking = false; paint(); }
              };
              const startTick = () => { if (!ticking) { ticking = true; tick(); } };
              const wrong = () => {
                if (perm) { log('<span class="muted">the sensor is disabled. Use the PIN.</span>'); return; }
                if (locked()) { log('<span class="muted">locked: the sensor ignores touches</span>'); replay(sheet, 'shake'); return; }
                fails++; total++;
                if (total >= PERM_AT) { perm = true; log('onAuthenticationError(<span class="bad">9</span>, "Too many attempts. Fingerprint sensor disabled.")'); replay(sheet, 'shake'); startTick(); }
                else if (fails >= LOCK_AT) { fails = 0; until = Date.now() + WAIT * 1000; log('onAuthenticationError(<span class="bad">7</span>, "Too many attempts. Try again later.")'); replay(sheet, 'shake'); startTick(); }
                else { log(`onAuthenticationFailed <span class="muted">// try ${fails} of ${LOCK_AT}, prompt stays open</span>`); replay(fp, 'shake'); }
                paint();
              };
              const right = () => {
                if (locked()) { log('<span class="muted">locked: even the right finger is ignored</span>'); replay(sheet, 'shake'); return; }
                fails = 0; paint(); replay(sheet, 'pop');
                log('<span class="good">onAuthenticationSucceeded</span> <span class="muted">// the failed-in-a-row count resets</span>');
              };
              const pin = () => {
                if (!locked()) { log('<span class="muted">nothing to unlock</span>'); return; }
                perm = false; until = 0; fails = 0; total = 0; paint(); clock.textContent = ''; replay(sheet, 'pop');
                log('<span class="good">PIN accepted.</span> Biometrics are back on.');
              };
              paint();
              el.append(
                sheet,
                h('div', { class: 'controls' }, act('Wrong finger', wrong), act('Right finger', right), act('Unlock with PIN', pin), clock),
                o,
                h('p', { class: 'tip' }, `This demo locks after ${LOCK_AT} failures in a row and turns biometrics off after ${PERM_AT} in total. Real limits and wait times depend on the device.`));
              log('<span class="muted">prompt open. Try the wrong finger a few times.</span>');
            },
          },
          {
            title: 'Sign a server challenge instead of decrypting',
            body: `<p>For actions a server must trust, like approving a payment, use a signature. At enrollment, create an EC key pair that needs a biometric for every use, and send the public key to the server. To approve, the server sends a random challenge. The prompt unlocks a <code>Signature</code> through a <code>CryptoObject</code>, the app signs the challenge, and the server verifies it with the stored public key.</p>`,
            code: `val spec = KeyGenParameterSpec.Builder("approve_key", KeyProperties.PURPOSE_SIGN)
    .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
    .setDigests(KeyProperties.DIGEST_SHA256)
    .setUserAuthenticationRequired(true)
    .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)   // every use
    .build()

val signature = Signature.getInstance("SHA256withECDSA").apply {
    initSign(keyStore.getKey("approve_key", null) as PrivateKey)
}
prompt.authenticate(info, BiometricPrompt.CryptoObject(signature))

// in onAuthenticationSucceeded(result)
val signer = result.cryptoObject?.signature ?: return
signer.update(challenge)
api.approve(paymentId, signer.sign())`,
          },
        ],
        underHood: {
          body: `<p>When you pass a <code>CryptoObject</code>, Keystore has already started the operation and given it a 64-bit challenge. BiometricPrompt hands that challenge to the biometric service, which passes it to the sensor’s trusted app in the TEE. After a real match, the trusted app creates a HardwareAuthToken: the challenge, the user’s secure ID, the authenticator type and a timestamp, sealed with an HMAC key that only secure hardware holds. The token goes to Keystore, and KeyMint lets <code>doFinal</code> run only if the token is genuine and carries that operation’s challenge.</p>
<p>Time-bound keys skip the challenge. KeyMint checks that the latest token is recent enough for the key’s timeout. Either way the proof never passes through your app’s code, so a hook on the callback can’t make one.</p>`,
        },
        mistakes: [
          {
            title: 'Checking with the deprecated no-argument call',
            bad: `if (BiometricManager.from(ctx).canAuthenticate() == BIOMETRIC_SUCCESS) {
    prompt.authenticate(strongInfo, BiometricPrompt.CryptoObject(cipher))
}`,
            good: `if (BiometricManager.from(ctx).canAuthenticate(BIOMETRIC_STRONG) == BIOMETRIC_SUCCESS) {
    prompt.authenticate(strongInfo, BiometricPrompt.CryptoObject(cipher))
}`,
            why: 'The old call checks for <code>BIOMETRIC_WEAK</code>. A phone with only Class 2 face unlock says yes, and then the crypto prompt fails. Ask with the exact authenticators you will use.',
          },
          {
            title: 'A CryptoObject with a time-bound key',
            bad: `// key made with setUserAuthenticationParameters(30, AUTH_BIOMETRIC_STRONG)
val cipher = Cipher.getInstance("AES/GCM/NoPadding")
cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))   // throws
prompt.authenticate(info, BiometricPrompt.CryptoObject(cipher))`,
            good: `// key made with setUserAuthenticationParameters(0, AUTH_BIOMETRIC_STRONG)
val cipher = Cipher.getInstance("AES/GCM/NoPadding")
cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))   // ok: unlocked per operation
prompt.authenticate(info, BiometricPrompt.CryptoObject(cipher))`,
            why: 'A key with a timeout above 0 checks the user at <code>init</code> and throws <code>UserNotAuthenticatedException</code> when no recent unlock exists. CryptoObject is for per-use keys. For a time-bound key, prompt without a CryptoObject, then init the cipher.',
          },
          {
            title: 'Device credential with crypto on old Android',
            bad: `// minSdk 24
val info = PromptInfo.Builder()
    .setTitle("Confirm payment")
    .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
    .build()
prompt.authenticate(info, BiometricPrompt.CryptoObject(cipher))`,
            good: `val withPin = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
val info = PromptInfo.Builder()
    .setTitle("Confirm payment")
    .setAllowedAuthenticators(if (withPin) BIOMETRIC_STRONG or DEVICE_CREDENTIAL else BIOMETRIC_STRONG)
    .apply { if (!withPin) setNegativeButtonText("Use password") }
    .build()
prompt.authenticate(info, BiometricPrompt.CryptoObject(cipher))`,
            why: 'Crypto with <code>DEVICE_CREDENTIAL</code> needs Android 11 (API 30). Below that, this combination is not supported and the call fails. Fall back to <code>BIOMETRIC_STRONG</code> with a negative button.',
          },
        ],
        visual(el) {
          let auth = 'STRONG', open = false;
          const title = h('span', { class: 'sec-ph-title' }, 'Wallet');
          const big = h('span', { class: 'sec-ph-big' }, 'Locked');
          const sub = h('span', { class: 'sec-ph-sub' }, 'token sealed by an auth-bound key');
          const phone = h('div', { class: 'phone', 'aria-live': 'polite' }, title, big, sub);
          const o = out('Pick authenticators, then authenticate.');
          const crypto = toggle('sec-bio-crypto', 'pass CryptoObject(cipher)', true, () => {});
          const log = (html, cls) => { line(o, html, cls); trim(o, 4); };
          const closeSheet = () => { const s = phone.querySelector('.sec-sheet'); if (s) s.remove(); open = false; };
          const lock = () => { big.textContent = 'Locked'; big.style.color = ''; sub.textContent = 'token sealed by an auth-bound key'; };
          const authBtns = ['STRONG', 'WEAK'].map((a, i) => act(`BIOMETRIC_${a}`, () => { auth = a; press(authBtns, authBtns[i]); closeSheet(); lock(); }));
          const success = sensor => {
            closeSheet();
            log(`onAuthenticationSucceeded <span class="muted">// ${sensor}</span>`);
            if (crypto.input.checked) {
              big.textContent = '1,240 EUR'; big.style.color = ''; sub.textContent = 'cipher.doFinal() decrypted the token';
              log('<span class="good">result.cryptoObject.cipher</span> unlocked by the TEE: token decrypted.');
            } else {
              big.textContent = 'Open'; big.style.color = 'var(--warm)'; sub.textContent = 'no key involved';
              log('<span class="bad">no CryptoObject:</span> the app trusted a callback. A Frida hook can call it too.');
            }
            replay(phone, 'pop');
          };
          const sheet = () => {
            const fp = h('span', { class: 'sec-fp', 'aria-hidden': 'true' });
            const s = h('div', { class: 'sec-sheet' }, h('b', {}, 'Unlock your wallet'), fp, h('small', {}, auth === 'WEAK' ? 'Fingerprint or face' : 'Touch the fingerprint sensor'),
              act('Fingerprint (Class 3)', () => success('fingerprint, Class 3')),
              auth === 'WEAK' ? act('Face (Class 2)', () => success('face, Class 2')) : null,
              act('Wrong finger', () => { fp.classList.add('sec-no'); replay(s, 'shake'); setTimeout(() => fp.classList.remove('sec-no'), 600); log('onAuthenticationFailed <span class="muted">// not recognized, prompt stays open</span>'); }),
              act('Use password', () => { closeSheet(); log('onAuthenticationError(<span class="bad">13</span>, "Use password") <span class="muted">// ERROR_NEGATIVE_BUTTON</span>'); }));
            phone.append(s);
          };
          press(authBtns, authBtns[0]);
          el.append(
            h('div', { class: 'sec-bio' },
              h('div', { class: 'viz' },
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'Allowed'), authBtns),
                h('div', { class: 'controls' }, crypto.el),
                h('div', { class: 'controls' }, cmd('prompt.authenticate(info, ...)', () => {
                  if (open) { log('<span class="muted">the prompt is already showing</span>'); return; }
                  lock(); o.replaceChildren();
                  if (auth === 'WEAK' && crypto.input.checked) {
                    replay(phone, 'shake');
                    log('<span class="bad">IllegalArgumentException:</span> Crypto-based authentication is not supported for Class 2 (Weak) biometrics.');
                    return;
                  }
                  open = true; sheet();
                  log(`authenticate(<span class="muted">${auth}${crypto.input.checked ? ', CryptoObject' : ''}</span>)`);
                })),
                o),
              phone));
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'privacy',
        title: 'Privacy and permissions hygiene',
        tagline: 'Ask for less, keep less, log nothing personal.',
        level: 'intermediate',
        body: `
<p>Each permission is something you have to protect, explain and declare. Start from the feature and pick the smallest access that does the job. For a profile photo, the photo picker returns the one image the user chose and needs no permission at all. To find nearby stores, <code>ACCESS_COARSE_LOCATION</code> gives a position within about 3 square kilometers. Since Android 12 the user can pick approximate even if you ask for fine, so the feature must work with it. To invite one friend, let the user pick a contact with <code>ACTION_PICK</code> instead of reading the whole address book.</p>
<p>Play makes you describe all of this in the Data safety section: which data you collect, which you share, why, and whether it is encrypted in transit. It must match what the app and every SDK in it actually do. Fewer permissions make that form shorter and more honest, and the install page less scary.</p>
<p>Logs are the leak people forget. Logcat output can end up in bug reports and crash tools. Never log emails, tokens, locations or message text. Log an opaque user id or nothing, and strip <code>Log.d</code> and <code>Log.v</code> from release builds with an R8 <code>-assumenosideeffects</code> rule.</p>`,
        code: `// 1. A profile photo: no permission, the user picks one image
val pickPhoto = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
    if (uri != null) viewModel.setAvatar(uri)
}
Button(onClick = {
    pickPhoto.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
}) { Text("Choose photo") }

// 2. Nearby stores: a city block is plenty
val askLocation = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
    if (granted) viewModel.loadNearbyStores()
}
Button(onClick = { askLocation.launch(Manifest.permission.ACCESS_COARSE_LOCATION) }) { Text("Find stores") }

// 3. Logs: an opaque id, never the email or the token
Log.i("Auth", "login ok for user \${session.userId}")

// proguard-rules.pro: drop debug logs from release
// -assumenosideeffects class android.util.Log { public static int d(...); public static int v(...); }`,
        remember: 'Smallest access that works: picker over storage, coarse over fine. No personal data in logs.',
        terms: [
          { term: 'Approximate location', def: 'A location estimate accurate to about 3 square kilometers, granted by ACCESS_COARSE_LOCATION or chosen by the user in the dialog.' },
          { term: 'Data safety section', def: 'The Play Store form and listing section where an app declares what user data it collects and shares, and why.' },
          { term: 'PII', def: 'Personally identifiable information: data such as a name, email, phone number or precise location that points to a specific person.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let the user pick one image with no storage permission.', code: 'val pick = rememberLauncherForActivityResult(\n    ActivityResultContracts.[[PickVisualMedia]]()\n) { uri -> uri?.let(viewModel::setAvatar) }\n\npick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.[[ImageOnly]]))', why: 'The photo picker runs in a system process and hands back a read-only Uri for what the user chose. No <code>READ_MEDIA_IMAGES</code> needed.' },
          { type: 'bug', prompt: 'This works, but it leaks personal data into every crash report. Tap the line.', code: 'suspend fun login(email: String, password: String): Result<Session> = runCatching {\n    val session = api.login(LoginRequest(email, password))\n    Log.i("Auth", "login ok: $email / ${session.accessToken}")\n    tokenStore.save(session)\n    session\n}', bug: 2, fix: '    Log.i("Auth", "login ok for user ${session.userId}")', why: 'The email is PII and the access token is a credential. Logs get copied into bug reports and crash tools. Log an opaque id instead.' },
        ],
        quiz: [
          { q: 'Your app lets users set a profile photo. Which permission do you need?', options: ['<code>READ_MEDIA_IMAGES</code>', '<code>READ_EXTERNAL_STORAGE</code>', 'None, use the photo picker'], a: 2, why: 'The photo picker gives you just the chosen image, without access to the rest of the library.' },
          { q: 'You request <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code> on Android 12+. What can the user do?', options: ['Only allow or deny', 'Grant approximate location only', 'Nothing, fine is granted automatically'], a: 1, why: 'The dialog lets the user pick approximate. Your feature has to handle that answer gracefully.' },
          { q: 'An analytics SDK in your app collects the device location. Does it go in your Data safety section?', options: ['No, it’s the SDK’s data', 'Yes, you declare everything your app and its SDKs collect', 'Only if you read it yourself'], a: 1, why: 'Play holds the app responsible for the data its SDKs collect and share.' },
        ],
        deeper: [
          {
            title: 'Ask in context, and handle no',
            body: `<p>Ask for a permission when the user taps the feature that needs it. If they deny once, <code>shouldShowRequestPermissionRationale()</code> returns true: explain why in your own UI, then ask again. On Android 11 and later, a second denial counts as “don’t ask again”. After that, launching the request returns false at once, and no dialog appears.</p>
<p>From then on, only the app’s settings page can grant it. Keep the rest of the app usable without the permission, and offer a button to settings instead of asking again and again.</p>`,
            code: `val askCamera = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
    when {
        granted -> openScanner()
        activity.shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) -> showWhyCamera()
        else -> showOpenSettings()   // denied twice: the dialog won't come back
    }
}

fun openAppSettings(context: Context) = context.startActivity(
    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", context.packageName, null))
)`,
            visual(el) {
              let denials = 0, granted = false, explained = false;
              const title = h('span', { class: 'sec-ph-title' }, 'Receipts');
              const big = h('span', { class: 'sec-ph-sub' }, 'Tap Scan to read a receipt.');
              const phone = h('div', { class: 'phone', 'aria-live': 'polite' }, title, big);
              const stat = h('div', { class: 'sec-stat' });
              const o = out('');
              const log = html => { line(o, html); trim(o, 3); };
              const rationale = () => denials === 1 && !granted;
              const paint = () => { stat.innerHTML = `granted: <b>${granted}</b> · denials: <b>${denials}</b> · shouldShowRationale: <b>${rationale()}</b>`; };
              const close = () => phone.querySelectorAll('.sec-sheet').forEach(s => s.remove());
              const sheet = (...kids) => { close(); phone.append(h('div', { class: 'sec-sheet' }, ...kids)); };
              const dialog = () => sheet(
                h('b', {}, 'Allow Receipts to take pictures and record video?'),
                act('While using the app', () => { granted = true; close(); big.textContent = 'Camera open. Point at a receipt.'; log('<span class="good">granted = true</span>'); paint(); replay(phone, 'pop'); }),
                act('Only this time', () => { granted = true; close(); big.textContent = 'Camera open, this session only.'; log('<span class="good">granted = true</span> <span class="muted">// revoked soon after the app leaves the screen</span>'); paint(); replay(phone, 'pop'); }),
                act('Don’t allow', () => {
                  denials++; explained = false; close(); paint();
                  big.textContent = denials >= 2 ? 'Scanning needs the camera.' : 'Tap Scan to read a receipt.';
                  log(`granted = false <span class="muted">// denial ${denials}${denials >= 2 ? ': the dialog won’t show again' : ''}</span>`);
                }));
              const scan = () => {
                if (granted) { big.textContent = 'Camera open. Point at a receipt.'; replay(phone, 'pop'); log('already granted: open the camera'); return; }
                if (denials >= 2) {
                  log('launch(CAMERA) → <span class="bad">false at once, no dialog</span>');
                  sheet(h('b', {}, 'Camera is off for Receipts'), h('small', {}, 'Turn it on in Settings to scan.'),
                    act('Open settings: allow camera', () => { granted = true; close(); big.textContent = 'Camera allowed from Settings.'; log('<span class="good">granted in Settings</span>'); paint(); replay(phone, 'pop'); }),
                    act('Not now', () => { close(); log('<span class="muted">the rest of the app keeps working</span>'); }));
                  replay(phone, 'shake'); return;
                }
                if (rationale() && !explained) {
                  log('shouldShowRequestPermissionRationale → <b>true</b>: explain first');
                  sheet(h('b', {}, 'Why the camera?'), h('small', {}, 'We read the total from a photo of the receipt. Nothing is uploaded.'),
                    act('Continue', () => { explained = true; dialog(); log('launch(CAMERA)'); }));
                  return;
                }
                log('launch(CAMERA)'); dialog();
              };
              paint();
              el.append(
                h('div', { class: 'sec-bio' },
                  h('div', { class: 'viz' }, h('div', { class: 'controls' }, cmd('scanButton.onClick()', scan)), stat, o),
                  phone));
              log('<span class="muted">nothing asked yet</span>');
            },
          },
          {
            title: 'Precise or approximate: read what you got',
            body: `<p>On Android 12 and later, request <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code> together. The dialog then lets the user pick Precise or Approximate, and While using the app or Only this time. Your callback gets a map. Precise means both entries are true. Approximate means only coarse is true.</p>
<p>A one-time grant lasts while the app is in use and is revoked soon after it goes to the background. So check the current state each time a feature needs it, instead of storing “has location” in your own prefs.</p>`,
            code: `val askLocation = rememberLauncherForActivityResult(
    ActivityResultContracts.RequestMultiplePermissions()
) { result ->
    when {
        result[Manifest.permission.ACCESS_FINE_LOCATION] == true -> startTurnByTurn()
        result[Manifest.permission.ACCESS_COARSE_LOCATION] == true -> showNearbyStores()
        else -> showCityPicker()
    }
}

askLocation.launch(arrayOf(
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_COARSE_LOCATION,
))`,
            visual(el) {
              let precise = true, grant = null, busy = false;
              const map = h('div', { class: 'sec-d2-map', 'aria-hidden': 'true' });
              const area = h('span', { class: 'sec-d2-area' }), dot = h('span', { class: 'sec-d2-dot' });
              map.append(area, dot);
              const res = h('div', { class: 'sec-manifest', 'aria-label': 'Permission result' });
              const o = out('Pick precision, then answer the dialog.');
              const precBtns = [[true, 'Precise'], [false, 'Approximate']].map(([v, t], i) => act(t, () => { if (busy) return; precise = v; press(precBtns, precBtns[i]); }));
              press(precBtns, precBtns[0]);
              const paint = () => {
                const fine = !!grant && precise, coarse = !!grant;
                res.replaceChildren(h('span', { class: 't-c' }, '// result map'),
                  h('span', { class: 'drop-in' }, `ACCESS_FINE_LOCATION   = ${fine}`),
                  h('span', { class: 'drop-in' }, `ACCESS_COARSE_LOCATION = ${coarse}`));
                map.className = 'sec-d2-map' + (!grant ? '' : fine ? ' sec-d2-fine' : ' sec-d2-coarse');
              };
              const answer = kind => () => {
                if (busy) return;
                grant = kind; paint(); replay(map, 'pop');
                say(o, !kind ? '<span class="bad">Denied.</span> Offer a city picker instead.'
                  : precise ? `<span class="good">Precise${kind === 'once' ? ', this session only' : ''}.</span> A position within about 50 m, often better.`
                  : `<span class="good">Approximate${kind === 'once' ? ', this session only' : ''}.</span> Only coarse is true: an area of about 3 km². Nearby stores still work. Turn-by-turn does not.`);
              };
              const bg = act('Send the app to the background', async () => {
                if (busy) return;
                if (grant !== 'once') { say(o, grant ? 'A “while using the app” grant stays after the app leaves the screen.' : 'Nothing granted yet.'); return; }
                busy = true; say(o, '<span class="muted">app in the background…</span>');
                await sleep(1200); if (!el.isConnected) return;
                grant = null; paint(); replay(map, 'shake');
                say(o, '<span class="bad">Revoked.</span> The one-time grant ended. The next request shows the dialog again.');
                busy = false;
              });
              paint();
              el.append(
                h('div', { class: 'controls' }, h('span', { class: 'sec-label' }, 'In the dialog'), precBtns),
                h('div', { class: 'controls' }, act('While using the app', answer('while')), act('Only this time', answer('once')), act('Don’t allow', answer(null))),
                h('div', { class: 'sec-zones' }, h('div', { class: 'sec-zone' }, h('span', { class: 'sec-label' }, 'What the app sees'), map), h('div', { class: 'sec-zone' }, res)),
                h('div', { class: 'controls' }, bg),
                o);
            },
          },
          {
            title: 'Audit what your SDKs access',
            body: `<p>Your Data safety answers must cover what SDKs do, and an SDK can read location or contacts using your app’s permissions. On Android 11 and later, data access auditing shows you. Register an <code>OnOpNotedCallback</code> in debug builds and log each access of private data with a stack trace. Attribution tags, set with <code>createAttributionContext()</code>, name the part of your app that made the call.</p>`,
            code: `class App : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getSystemService(AppOpsManager::class.java).setOnOpNotedCallback(mainExecutor,
                object : AppOpsManager.OnOpNotedCallback() {
                    override fun onNoted(op: SyncNotedAppOp) {
                        Log.d("DataAccess", "\${op.op} tag=\${op.attributionTag}", Throwable())
                    }
                    override fun onSelfNoted(op: SyncNotedAppOp) { onNoted(op) }
                    override fun onAsyncNoted(op: AsyncNotedAppOp) {
                        Log.d("DataAccess", "\${op.op} async: \${op.message}")
                    }
                })
        }
    }
}`,
          },
        ],
        underHood: {
          body: `<p>The photo picker runs in a system process, not in yours, so your app never sees the library. When the user picks an image, the system returns a <code>content://media/picker/…</code> Uri and grants your app read access to that one item. Where the system picker is missing, the AndroidX contract falls back to a backported picker or to <code>ACTION_OPEN_DOCUMENT</code>, still with no permission.</p>
<p>Approximate location is made inside the system too. The location service snaps the real position to a coarse grid and adds a random offset that drifts slowly, updated about once an hour, so averaging many fixes can’t recover the real spot. It also strips speed, bearing and altitude before your app gets the fix.</p>`,
        },
        mistakes: [
          {
            title: 'Asking for everything at launch',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    askAll.launch(arrayOf(CAMERA, ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION, READ_CONTACTS))
}`,
            good: `scanButton.setOnClickListener {
    if (ContextCompat.checkSelfPermission(this, CAMERA) == PERMISSION_GRANTED) openScanner()
    else askCamera.launch(CAMERA)
}`,
            why: 'At launch the user can’t tell why you need each one, so many say no. Two denials and the dialog is gone for good. Ask when the user taps the feature.',
          },
          {
            title: 'Treating any location grant as precise',
            bad: `{ result ->
    if (result.values.any { it }) startTurnByTurn()
}`,
            good: `{ result ->
    when {
        result[ACCESS_FINE_LOCATION] == true -> startTurnByTurn()
        result[ACCESS_COARSE_LOCATION] == true -> showNearbyStores()
        else -> showCityPicker()
    }
}`,
            why: 'Approximate grants only coarse. Turn-by-turn on a fix that is off by a kilometer is worse than no feature. Branch on what was actually granted.',
          },
          {
            title: 'Personal data in crash reports',
            bad: `Firebase.crashlytics.setUserId(user.email)
Firebase.crashlytics.setCustomKey("phone", user.phone)`,
            good: `Firebase.crashlytics.setUserId(user.id)   // opaque, no personal data`,
            why: 'Crash reports go to a third party and are kept for months. An email or phone number there is personal data you share, and it belongs in your Data safety form. An opaque id is enough to find a user’s reports.',
          },
        ],
        visual(el) {
          const feats = [
            { id: 'photo', name: 'Profile photo', heavy: { perm: 'READ_MEDIA_IMAGES', access: 'reads all 2,413 photos' }, light: { perm: null, access: 'gets the 1 photo the user picked', src: 'PickVisualMedia()' }, ds: null },
            { id: 'loc', name: 'Nearby stores', heavy: { perm: 'ACCESS_FINE_LOCATION', access: 'position within a few meters', ds: 'Precise location' }, light: { perm: 'ACCESS_COARSE_LOCATION', access: 'position within about 3 km²', ds: 'Approximate location', src: 'ACCESS_COARSE_LOCATION' } },
            { id: 'contacts', name: 'Invite a friend', heavy: { perm: 'READ_CONTACTS', access: 'reads all 812 contacts', ds: 'Contacts' }, light: { perm: null, access: 'gets the 1 contact the user picked', src: 'Intent(ACTION_PICK)' } },
            { id: 'logs', name: 'Login logging', heavy: { perm: null, access: 'Log.i("Auth", "login $email")', ds: 'Email address (crash logs)' }, light: { perm: null, access: 'Log.i("Auth", "login ${user.id}")', src: 'log user.id' } },
          ];
          const lean = {};
          const manifest = h('div', { class: 'sec-manifest', 'aria-label': 'AndroidManifest.xml permissions' });
          const ds = h('div', { class: 'sec-ds' });
          const meter = h('span', {});
          const stat = h('span', { class: 'sec-stat' });
          const o = out('Every feature uses the heavy option. Slim them down one at a time.');
          const rows = {};
          const paint = changed => {
            const perms = feats.map(f => [f, (lean[f.id] ? f.light : f.heavy).perm, f.heavy.perm]);
            manifest.replaceChildren(h('span', { class: 't-c' }, '// uses-permission in AndroidManifest.xml'),
              ...perms.flatMap(([f, p, hp]) => {
                const linesOut = [];
                if (hp && p !== hp) linesOut.push(h('span', { class: 'sec-gone' + (changed === f.id ? ' drop-in' : '') }, hp));
                if (p) linesOut.push(h('span', { class: changed === f.id ? 'drop-in' : null }, p));
                return linesOut;
              }));
            const types = feats.map(f => (lean[f.id] ? f.light : f.heavy).ds ? [(lean[f.id] ? f.light : f.heavy).ds, !!lean[f.id]] : null).filter(Boolean);
            ds.replaceChildren(...(types.length ? types.map(([t, lite]) => h('span', { class: lite ? 'sec-lite' : null }, t)) : [h('span', { class: 'sec-lite' }, 'nothing sensitive')]));
            const dangerous = feats.filter(f => (lean[f.id] ? f.light : f.heavy).perm).length;
            const score = feats.reduce((s, f) => s + (lean[f.id] ? (f.light.perm ? 1 : 0) : 3), 0);
            meter.style.width = `${(score / 12) * 100}%`;
            meter.classList.toggle('sec-low', score <= 3);
            stat.innerHTML = `permission prompts: <b>${dangerous}</b> · data exposure`;
          };
          const featRows = feats.map(f => {
            const note = h('small', {}, f.heavy.access);
            const btn = cmd(f.light.src, function () {
              lean[f.id] = !lean[f.id];
              this.setAttribute('aria-pressed', String(!!lean[f.id]));
              row.classList.toggle('sec-lean', !!lean[f.id]);
              note.textContent = (lean[f.id] ? f.light : f.heavy).access;
              replay(row, 'pop');
              paint(f.id);
              const done = feats.every(x => lean[x.id]);
              say(o, lean[f.id]
                ? `<span class="good">${f.name}:</span> ${f.light.access}.${done ? ' All lean: one permission prompt left, and a short Data safety form.' : ''}`
                : `<span class="bad">${f.name}:</span> back to ${f.heavy.access}.`);
            }, { 'aria-pressed': 'false' });
            const row = h('div', { class: 'sec-feat' }, h('div', {}, h('b', {}, f.name), note), btn);
            rows[f.id] = row;
            return row;
          });
          paint();
          el.append(
            h('div', { class: 'sec-feats' }, featRows),
            manifest,
            h('div', { class: 'sec-row' }, h('span', { class: 'sec-label' }, 'Data safety'), ds),
            h('div', { class: 'sec-row' }, stat),
            h('div', { class: 'sec-meter', 'aria-hidden': 'true' }, meter),
            o);
        },
      },
    ],
  });
})();
