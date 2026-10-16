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
@media (max-width: 520px) {
  .sec-path { grid-template-columns: minmax(0, 1fr); }
  .sec-node:not(:last-child)::after { content: "↓"; right: 50%; top: auto; bottom: -18px; }
  .sec-bio { grid-template-columns: minmax(0, 1fr); }
  .sec-feat { grid-template-columns: minmax(0, 1fr); }
  .sec-feat .cmd { justify-self: start; }
}
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
