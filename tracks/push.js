/* Notifications and push track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed plt-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const tag = (text, kind = '') => h('span', { class: 'plt-tag' + (kind ? ' plt-' + kind : '') }, text);
  const line = (el, html) => el.append(h('div', { class: 'line drop-in', html }));

  // A row of mutually exclusive options. onPick returning false keeps the old choice.
  function choice(label, values, cur, onPick, fmt = v => v) {
    const btns = values.map(v => h('button', { class: 'cmd', onclick() { if (onPick(v) === false) return; set(v); } }, fmt(v)));
    const set = v => btns.forEach((b, i) => b.setAttribute('aria-pressed', String(values[i] === v)));
    set(cur);
    return { el: h('div', { class: 'plt-group' }, h('span', { class: 'plt-label' }, label), btns), set };
  }
  function toggle(id, label, on, onChange) {
    const input = h('input', { type: 'checkbox', id, checked: on, onchange() { onChange(input.checked, input); } });
    return { el: h('label', { class: 'switch', for: id }, input, label), input };
  }
  // A small phone: status bar icons, an overlay for heads-up banners, and a screen.
  function phone() {
    const icons = h('span', { class: 'plt-sb-icons' });
    const banner = h('div', { class: 'plt-hu' });
    const screen = h('div', { class: 'plt-screen' });
    const dev = h('div', { class: 'plt-phone' }, h('div', { class: 'plt-sb' }, h('span', {}, '9:41'), icons), banner, screen);
    return { dev, icons, banner, screen };
  }
  const note = (channel, title, text, extra = '') => h('div', { class: 'plt-note ' + extra }, h('span', { class: 'plt-note-ch' }, channel), h('b', {}, title), h('span', {}, text));
  const rnd = n => Array.from({ length: n }, () => 'abcdefghijkmnpqrstuvwxyz0123456789'[Math.floor(Math.random() * 34)]).join('');
  const newToken = () => rnd(4) + '…:APA91b' + rnd(3);

  const css = `
.plt-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: start; min-width: 0; }
.plt-col { display: grid; gap: 12px; align-content: start; min-width: 0; }
.plt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.plt-row { min-width: 0; }
.plt-group { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.plt-tag { display: inline-block; font: 600 0.72rem var(--mono); padding: 3px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); overflow-wrap: anywhere; }
.plt-tag.plt-ok { background: var(--ok-soft); color: var(--ok); }
.plt-tag.plt-no { background: var(--err-soft); color: var(--err); }
.plt-tag.plt-wait { background: var(--warm-soft); color: var(--warm); }
.plt-tag.plt-acc { background: var(--accent-soft); color: var(--accent); }

/* phone */
.plt-phone { position: relative; width: 210px; height: 340px; flex: none; justify-self: center; border-radius: 28px; border: 8px solid var(--code-bg); background: var(--surface); overflow: hidden; display: flex; flex-direction: column; }
.plt-sb { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 26px; padding: 4px 12px; background: var(--sunk); font: 600 0.7rem var(--mono); color: var(--muted); }
.plt-sb-icons { display: flex; gap: 4px; align-items: center; }
.plt-ico { width: 10px; height: 10px; border-radius: 3px; background: var(--accent); }
.plt-ico.plt-ongoing { background: var(--warm); border-radius: 50%; }
.plt-hu { position: absolute; left: 6px; right: 6px; top: 30px; z-index: 2; display: grid; gap: 6px; }
.plt-screen { flex: 1; min-height: 0; padding: 10px; display: grid; align-content: start; gap: 8px; overflow: hidden; }
.plt-shade-title { font: 600 0.66rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.plt-shade { display: grid; gap: 6px; }
.plt-note { display: grid; gap: 1px; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); font-size: 0.8rem; line-height: 1.3; min-width: 0; overflow-wrap: anywhere; }
.plt-note b { font-size: 0.84rem; }
.plt-note-ch { font: 600 0.62rem var(--mono); text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.plt-hu .plt-note { background: var(--surface); border: 2px solid var(--accent); }
.plt-note.plt-min { opacity: 0.55; }
.plt-note.plt-fg { border-color: var(--warm); }
.plt-note.plt-tap { cursor: pointer; font: inherit; text-align: left; color: var(--ink); font-size: 0.8rem; }
.plt-note.plt-tap:hover { border-color: var(--accent); }
.plt-in { animation: plt-down 0.45s cubic-bezier(0.2, 1.2, 0.4, 1) both; }
.plt-out { animation: plt-up 0.4s ease-in forwards; }
@keyframes plt-down { from { transform: translateY(-130%); opacity: 0; } }
@keyframes plt-up { to { transform: translateY(-130%); opacity: 0; } }
.plt-appbar { padding: 8px 10px; border-radius: 10px; background: var(--accent); color: var(--accent-ink); font: 700 0.82rem var(--mono); overflow-wrap: anywhere; }
.plt-appbar.plt-ext { background: var(--sunk); color: var(--ink); }
.plt-ln { display: block; height: 8px; border-radius: 4px; background: var(--sunk); }
.plt-icons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 6px; }
.plt-icons span { aspect-ratio: 1; border-radius: 12px; background: var(--sunk); }

/* 2 FCM round trip */
.plt-net { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; padding: 12px 10px 42px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; overflow: hidden; min-width: 0; }
.plt-node { display: grid; gap: 6px; justify-items: center; align-content: start; text-align: center; padding: 10px 6px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.plt-node.plt-on { border-color: var(--accent); }
.plt-node-name { font: 700 0.82rem var(--mono); }
.plt-node-body { font: 500 0.72rem/1.45 var(--mono); color: var(--muted); overflow-wrap: anywhere; min-height: 4.4em; }
.plt-packet { position: absolute; bottom: 10px; transform: translateX(-50%); font: 600 0.68rem var(--mono); padding: 3px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); white-space: nowrap; transition: left 0.7s ease-in-out; }
.plt-packet.plt-bad { background: var(--err); }

/* 3 message matrix */
.plt-mx { display: grid; grid-template-columns: minmax(58px, auto) repeat(3, minmax(0, 1fr)); gap: 4px; font-size: 0.78rem; line-height: 1.25; min-width: 0; }
.plt-mx > * { padding: 6px 4px; border-radius: 8px; min-width: 0; overflow-wrap: anywhere; text-align: center; }
.plt-mh { font: 600 0.64rem var(--mono); text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); align-self: end; }
.plt-rh { font: 600 0.7rem var(--mono); color: var(--ink); text-align: left; align-self: center; }
.plt-cell { all: unset; box-sizing: border-box; min-width: 0; overflow-wrap: anywhere; padding: 6px 4px; border-radius: 8px; text-align: center; border: 2px solid var(--line); background: var(--bg); cursor: pointer; font-weight: 700; transition: border-color 0.2s, background 0.2s; }
.plt-cell:focus-visible { outline: 2px solid var(--accent); }
.plt-cell.plt-sys { color: var(--warm); }
.plt-cell.plt-app { color: var(--accent); }
.plt-cell.plt-none { color: var(--err); }
.plt-cell.plt-cur { border-color: var(--accent); background: var(--accent-soft); }
.plt-steps { display: grid; gap: 6px; padding: 12px; min-height: 110px; align-content: start; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.plt-step { display: flex; gap: 10px; align-items: baseline; padding: 7px 10px; border-radius: 9px; border: 1px solid var(--line); background: var(--surface); font-size: 0.9rem; line-height: 1.4; min-width: 0; }
.plt-step b { flex: none; width: 74px; font: 600 0.74rem var(--mono); color: var(--accent); }
.plt-step span { min-width: 0; overflow-wrap: anywhere; }
.plt-step.plt-good b { color: var(--ok); }
.plt-step.plt-bad b { color: var(--err); }
.plt-step.plt-wait b { color: var(--warm); }

/* 4 back stack */
.plt-stack { display: flex; flex-direction: column-reverse; justify-content: flex-start; gap: 6px; min-height: 160px; padding: 10px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.plt-act { display: grid; gap: 6px; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 600 0.8rem var(--mono); min-width: 0; overflow-wrap: anywhere; }
.plt-act.plt-top { border-color: var(--accent); }
.plt-act.plt-ext { border-style: dashed; color: var(--muted); }
.plt-empty { color: var(--muted); font-size: 0.88rem; text-align: center; margin: auto; }

/* depth: FCM tokens */
.plt-devs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.plt-node.plt-hitme { border-color: var(--ok); background: var(--ok-soft); }
.plt-node.plt-leak { border-color: var(--err); background: var(--err-soft); }
.plt-table { display: grid; gap: 4px; min-width: 0; }
.plt-tr { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 9px; border: 1px solid var(--line); background: var(--surface); font: 500 0.76rem var(--mono); min-width: 0; }
.plt-tr > span { min-width: 0; overflow-wrap: anywhere; }
.plt-tr.plt-th { background: none; border-color: transparent; font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.plt-tr.plt-gone { opacity: 0.4; text-decoration: line-through; }
.plt-stats { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }

/* depth: messages */
.plt-store { display: flex; flex-wrap: wrap; gap: 4px; align-content: start; min-height: 44px; padding: 8px; border-radius: 12px; border: 2px dashed var(--line); background: var(--bg); min-width: 0; }

@media (max-width: 640px) {
  .plt-split { grid-template-columns: minmax(0, 1fr); }
}
`;

  Lab.addTrack({
    id: 'push',
    title: 'Notifications and push',
    description: 'Notification channels, FCM tokens and messages, and deep links that land the user on the right screen.',
    group: 'Shipping', requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'channels',
        title: 'Notifications and channels',
        tagline: 'The channel decides how loud it is. The user decides after that.',
        level: 'beginner',
        body: `
<p>Since Android 8.0 every notification belongs to a <code>NotificationChannel</code>, and the channel sets how loud it is. <code>IMPORTANCE_HIGH</code> makes a sound and pops up as a heads-up banner. <code>DEFAULT</code> makes a sound without the banner. <code>LOW</code> is silent with a status bar icon. <code>MIN</code> is silent and only shows in the shade.</p>
<p>Create your channels at startup. Once a channel exists, the call only updates its name and description. From then on the user owns its importance and sound, and your code can’t raise them. To change a default, ship a new channel id and delete the old one.</p>
<p>On Android 13 and later, posting also needs the <code>POST_NOTIFICATIONS</code> runtime permission. Without it, <code>notify()</code> posts nothing and throws nothing. Ask when the user turns on something that sends notifications, like following a team.</p>`,
        code: `const val NEWS_CHANNEL = "news_alerts"

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // Safe on every launch: an existing channel only gets its name and description updated.
        val channel = NotificationChannel(
            NEWS_CHANNEL, getString(R.string.channel_news), NotificationManager.IMPORTANCE_HIGH,
        ).apply { description = getString(R.string.channel_news_desc) }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
}

// Android 13+: ask when it makes sense, e.g. right after "Follow this team".
val launcher = rememberLauncherForActivityResult(RequestPermission()) { granted -> /* update UI */ }
if (Build.VERSION.SDK_INT >= 33) launcher.launch(Manifest.permission.POST_NOTIFICATIONS)

fun showScore(context: Context, id: Int, text: String) {
    val granted = Build.VERSION.SDK_INT < 33 ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PERMISSION_GRANTED
    if (!granted) return
    val notification = NotificationCompat.Builder(context, NEWS_CHANNEL)
        .setSmallIcon(R.drawable.ic_stat_score)   // required
        .setContentTitle("Final score")
        .setContentText(text)
        .setAutoCancel(true)
        .build()
    NotificationManagerCompat.from(context).notify(id, notification)
}`,
        remember: 'You pick a channel’s importance once. After that it belongs to the user.',
        terms: [
          { term: 'NotificationChannel', def: 'A named category of notifications (Android 8.0+) that carries the importance, sound and vibration the user can change in Settings.' },
          { term: 'Notification importance', def: 'A channel level from IMPORTANCE_NONE to IMPORTANCE_HIGH that decides sound, status bar icon and heads-up display.' },
          { term: 'POST_NOTIFICATIONS', def: 'The runtime permission an app needs on Android 13+ to post notifications to the shade.' },
          { term: 'Heads-up notification', def: 'A banner that briefly floats over the current app, shown only for IMPORTANCE_HIGH channels.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Create a channel whose notifications make a sound and pop up as heads-up banners.', code: 'val channel = NotificationChannel(\n    "news_alerts", "News alerts",\n    NotificationManager.[[IMPORTANCE_HIGH]],\n)\ngetSystemService(NotificationManager::class.java)\n    .[[createNotificationChannel]](channel)', why: 'Only <code>IMPORTANCE_HIGH</code> gives heads-up. <code>createNotificationChannel</code> registers it, and repeating the call later is harmless.' },
          { type: 'bug', prompt: 'Version 1.0 shipped the <code>news</code> channel as <code>IMPORTANCE_LOW</code>. This 1.1 update ships, but existing users still get silent news. Tap the line that causes it.', code: '// v1.1: news alerts should now pop up as heads-up.\nval manager = context.getSystemService(NotificationManager::class.java)\nval channel = NotificationChannel("news", "News alerts", NotificationManager.IMPORTANCE_HIGH)\nmanager.createNotificationChannel(channel)\nmanager.deleteNotificationChannel("news_v0")', bug: 2, fix: 'val channel = NotificationChannel("news_alerts", "News alerts", NotificationManager.IMPORTANCE_HIGH)', why: 'The channel <code>news</code> already exists on those devices, so its importance stays LOW. Only a new channel id gets the new default. Then delete <code>news</code>.' },
        ],
        quiz: [
          { q: 'You shipped a channel as <code>IMPORTANCE_LOW</code>. The next release creates the same id with <code>IMPORTANCE_HIGH</code>. What do existing users get?', options: ['HIGH: the new code wins', 'LOW: once created, importance belongs to the user', 'A crash on startup'], a: 1, why: 'Recreating an existing channel only updates its name and description. Importance and sound stay as they are.' },
          { q: 'Which importance shows a heads-up banner?', options: ['<code>IMPORTANCE_HIGH</code>', '<code>IMPORTANCE_DEFAULT</code>', '<code>IMPORTANCE_LOW</code>'], a: 0, why: 'DEFAULT makes a sound but does not pop up. Only HIGH shows the banner.' },
          { q: 'On Android 14 the user denied <code>POST_NOTIFICATIONS</code>. Your code calls <code>notify()</code>. What happens?', options: ['The notification shows anyway', 'Nothing is posted and no exception is thrown', 'It throws <code>SecurityException</code>'], a: 1, why: 'The system drops it quietly. Check the permission yourself so the UI can tell the user.' },
        ],
        visual(el) {
          const SCORES = ['Derby ends 2-1', 'Late equalizer, 1-1', 'Away win, 0-3', 'Penalties: 5-4'];
          const MSG = {
            HIGH: 'IMPORTANCE_HIGH: sound and a heads-up banner over the current app.',
            DEFAULT: 'IMPORTANCE_DEFAULT: sound and a status bar icon. No banner.',
            LOW: 'IMPORTANCE_LOW: a status bar icon only. No sound.',
            MIN: 'IMPORTANCE_MIN: no sound, no status bar icon. It sits collapsed at the bottom of the shade.',
          };
          const channels = { news: 'HIGH' };
          let imp = 'HIGH', id = 'news', ver = 1, perm = true, busy = false, n = 0;
          const ph = phone();
          const shade = h('div', { class: 'plt-shade' });
          ph.screen.append(h('p', { class: 'plt-shade-title' }, 'Notification shade'), shade);
          const src = h('div', { class: 'kt' });
          const onDevice = h('div', { class: 'plt-group' });
          const alertTag = tag('waiting');
          const o = out('Channel "news" exists as HIGH. Post a notification, then try another importance.');
          const paint = () => {
            src.innerHTML = hl(`NotificationChannel("${id}", "News alerts", IMPORTANCE_${imp})`);
            const list = Object.entries(channels);
            onDevice.replaceChildren(h('span', { class: 'plt-label' }, 'Channels on device'),
              ...(list.length ? list.map(([k, v]) => tag(`${k}: ${v}`, 'acc')) : [tag('none')]));
          };
          function create() {
            if (busy) return;
            const have = channels[id];
            if (!have) {
              channels[id] = imp; paint(); replay(onDevice.lastElementChild, 'pop');
              say(o, `<span class="good">created:</span> "${id}" with IMPORTANCE_${imp}. From now on the user owns it.`);
            } else if (have === imp) {
              say(o, `<span class="muted">no-op:</span> "${id}" already exists with ${have}.`);
            } else {
              replay(onDevice, 'shake');
              say(o, `<span class="bad">ignored:</span> "${id}" keeps ${have}. Your code can’t change the importance of an existing channel. Ship a new id.`);
            }
          }
          function newId() {
            if (busy) return;
            const old = id;
            delete channels[old];
            id = `news_v${++ver}`; paint();
            say(o, `deleteNotificationChannel("${old}"). The code now uses "${id}". Tap createNotificationChannel.`);
          }
          const sbIcons = [];
          async function post() {
            if (busy) return;
            if (!perm) { replay(ph.dev, 'shake'); say(o, '<span class="bad">dropped:</span> POST_NOTIFICATIONS is not granted. notify() posts nothing and throws nothing.'); return; }
            const level = channels[id];
            if (!level) { replay(ph.dev, 'shake'); say(o, `<span class="bad">not shown:</span> no channel "${id}" on the device. Android 8+ drops the notification and logs a warning.`); return; }
            busy = true;
            const text = SCORES[n++ % SCORES.length];
            const make = () => note(`${id} · ${level}`, 'Final score', text, level === 'MIN' ? 'plt-min' : '');
            if (level !== 'MIN') {
              const ic = h('span', { class: 'plt-ico pop' });
              ph.icons.append(ic); sbIcons.push(ic);
              if (sbIcons.length > 4) sbIcons.shift().remove();
            }
            const loud = level === 'HIGH' || level === 'DEFAULT';
            alertTag.textContent = loud ? 'sound + vibrate' : 'silent';
            alertTag.className = 'plt-tag ' + (loud ? 'plt-wait' : '');
            replay(alertTag, 'pop');
            say(o, MSG[level]);
            if (level === 'HIGH') {
              const hu = make(); hu.classList.add('plt-in'); ph.banner.append(hu);
              await sleep(2000);
              hu.classList.replace('plt-in', 'plt-out'); await sleep(400); hu.remove();
            }
            const item = make(); item.classList.add('drop-in');
            if (level === 'MIN') shade.append(item); else shade.prepend(item);
            while (shade.children.length > 4) { const old = [...shade.children].filter(c => c !== item); old[old.length - 1].remove(); }
            busy = false;
          }
          const imps = choice('importance', ['HIGH', 'DEFAULT', 'LOW', 'MIN'], imp, v => { if (busy) return false; imp = v; paint(); });
          const perms = toggle('plt-perm', 'POST_NOTIFICATIONS granted', true, v => {
            perm = v;
            say(o, v ? 'Permission granted. notify() can post again.' : 'User tapped "Don’t allow". Try notify() now.');
          });
          paint();
          el.append(src,
            h('div', { class: 'plt-split' },
              h('div', { class: 'plt-col' },
                imps.el,
                h('div', { class: 'controls plt-row' }, cmd('createNotificationChannel(channel)', create), cmd('notify(id, notification)', post)),
                h('div', { class: 'controls plt-row' }, act('Ship a new channel id', newId), perms.el),
                onDevice,
                h('div', { class: 'plt-group' }, h('span', { class: 'plt-label' }, 'Last alert'), alertTag)),
              ph.dev),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'fcm',
        title: 'Firebase Cloud Messaging basics',
        tagline: 'A token per install, kept fresh on your server.',
        level: 'intermediate',
        body: `
<p>FCM identifies each app install by a registration token. The SDK creates one on first start and calls <code>onNewToken()</code>. Your job is to send it to your server and store it next to the user.</p>
<p>The token changes when the app is restored on a new device, reinstalled, or the user clears its data. FCM can also rotate it. Each time, <code>onNewToken()</code> fires again, so always forward it. Also send the current token from <code>FirebaseMessaging<wbr>.getInstance()<wbr>.token</code> at login, because a new user on the same install gets no callback.</p>
<p>Your server sends through the HTTP v1 API. When FCM answers <code>404 UNREGISTERED</code>, that token is dead, so delete it. On the device, <code>onMessageReceived()</code> runs with a short execution window. Hand anything longer than a few seconds to WorkManager (see the <a href="#background.workmanager">Background work track</a>).</p>
<p>Heads-up: firebase-messaging 25.1.0 (June 2026) deprecated <code>getToken()</code>, <code>deleteToken()</code> and <code>onNewToken()</code>. The replacement registers by Firebase Installation ID. Add the manifest flag <code>firebase_messaging<wbr>_installation_id<wbr>_enabled</code>, and <code>onRegistered<wbr>(installationId)</code> takes the place of <code>onNewToken</code>. The flag turns the token APIs off, so pick one mode. The rules here stay the same: forward every ID to your server, and delete it on <code>UNREGISTERED</code>.</p>`,
        code: `class PushService : FirebaseMessagingService() {

    // First token, and every rotation after that.
    override fun onNewToken(token: String) {
        TokenSync.enqueue(applicationContext, token)   // WorkManager job: POST to your server, with retries
    }

    // Short execution window. Keep it quick, hand long work to WorkManager.
    override fun onMessageReceived(message: RemoteMessage) {
        val articleId = message.data["article_id"] ?: return
        Notifier.showArticle(this, articleId, message.data["title"].orEmpty())
    }
}

// AndroidManifest.xml
// <service android:name=".PushService" android:exported="false">
//     <intent-filter><action android:name="com.google.firebase.MESSAGING_EVENT" /></intent-filter>
// </service>

// At login: link the current token to the user who just signed in.
suspend fun registerDevice(api: DeviceApi, userId: String) {
    val token = FirebaseMessaging.getInstance().token.await()
    api.register(DeviceRegistration(userId, token, updatedAt = System.currentTimeMillis()))
}

// Server: POST https://fcm.googleapis.com/v1/projects/{project_id}/messages:send
// On 404 UNREGISTERED (or 400 INVALID_ARGUMENT for a bad token), delete it.`,
        remember: 'Every onNewToken goes to your server. Every 404 UNREGISTERED gets deleted.',
        terms: [
          { term: 'FCM registration token', def: 'An id FCM gives one app install so a server can address messages to that device.' },
          { term: 'onNewToken', def: 'The FirebaseMessagingService callback that fires when a token is first created and whenever it changes. Deprecated since firebase-messaging 25.1.0 in favor of onRegistered.' },
          { term: 'onMessageReceived', def: 'The FirebaseMessagingService callback that receives data messages, and notification messages while the app is in the foreground.' },
          { term: 'FCM HTTP v1 API', def: 'The current server API for sending FCM messages, authorized with a short-lived OAuth 2.0 token from a service account.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the two callbacks and read the payload.', code: 'class PushService : FirebaseMessagingService() {\n    override fun [[onNewToken]](token: String) {\n        TokenSync.enqueue(applicationContext, token)\n    }\n    override fun [[onMessageReceived]](message: RemoteMessage) {\n        val id = message.[[data]]["article_id"] ?: return\n        Notifier.showArticle(this, id)\n    }\n}', why: '<code>onNewToken</code> forwards each new token. Custom key-value pairs arrive in <code>message.data</code>.' },
          { type: 'bug', prompt: 'After users clear app data, pushes stop for them for good. Tap the line that causes it.', code: 'override fun onNewToken(token: String) {\n    val prefs = getSharedPreferences("push", MODE_PRIVATE)\n    if (prefs.contains("token")) return\n    prefs.edit { putString("token", token) }\n    TokenSync.enqueue(applicationContext, token)\n}', bug: 2, fix: '    if (prefs.getString("token", null) == token) return', why: 'Any saved token makes the function return early, so a rotated token never reaches the server. Skip only when the token is the same one.' },
        ],
        quiz: [
          { q: 'Which of these does <em>not</em> give the app a new token?', options: ['The user clears app data', 'The app is reinstalled', 'The app is restored on a new phone', 'The app updates from the Play Store'], a: 3, why: 'A normal update keeps the token. Clearing data, reinstalling and restoring to a new device all create a new one.' },
          { q: 'Your server sends to a stored token and FCM answers <code>404 UNREGISTERED</code>. What should it do?', options: ['Retry with backoff', 'Delete the token', 'Ignore it and try again tomorrow'], a: 1, why: 'The install behind that token is gone or has a new token. Retrying never works.' },
          { q: 'Why also send the token at login, not only in <code>onNewToken</code>?', options: ['onNewToken only fires when the token changes, so a new user on the same install would never be linked', 'getToken is faster', 'onNewToken is deprecated'], a: 0, why: 'The token belongs to the install, not the user. Link it again whenever the signed-in user changes.' },
        ],
        deeper: [
          {
            title: 'A token belongs to an install, a user can have many',
            body: `<p>Your server needs two rules. One user can have many tokens, one per phone or tablet, and a send to that user goes to each of them. One token belongs to exactly one user at a time, so make the token the unique key and upsert on it.</p>
<p>Without that key, a shared or resold phone keeps the previous owner’s row. When Bob signs in on Ada’s old phone, Ada’s pushes keep landing on it. Turn the switch off and try it.</p>`,
            code: `-- One row per install. Signing in on a used device moves the row.
CREATE TABLE device_tokens (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
INSERT INTO device_tokens (token, user_id, updated_at) VALUES (?, ?, now())
ON CONFLICT (token) DO UPDATE SET user_id = excluded.user_id, updated_at = now();`,
            visual(el) {
              const devs = [
                { name: 'Phone', token: newToken(), user: null },
                { name: 'Tablet', token: newToken(), user: null },
              ];
              let rows = [], upsert = true, busy = false;
              const o = out('Nobody is signed in yet. Sign Ada in on both devices.');
              const table = h('div', { class: 'plt-table' });
              devs.forEach(d => {
                d.body = h('div', { class: 'plt-node-body' });
                d.node = h('div', { class: 'plt-node' }, h('span', { class: 'plt-node-name' }, d.name), d.body);
              });
              const paint = () => {
                devs.forEach(d => { d.body.innerHTML = `signed in: ${d.user || 'nobody'}<br>${d.token}`; });
                table.replaceChildren(h('div', { class: 'plt-tr plt-th' }, h('span', {}, 'user_id'), h('span', {}, 'token'), h('span', {}, '')),
                  ...(rows.length ? rows.map(r => h('div', { class: 'plt-tr' }, h('span', {}, r.user), h('span', {}, r.token), tag(devs.find(d => d.token === r.token).name))) : [h('span', { class: 'plt-empty' }, 'no rows')]));
              };
              function signIn(d, user) {
                if (busy) return;
                if (d.user === user) { replay(d.node, 'pop'); say(o, `${user} is already signed in on the ${d.name}.`); return; }
                d.user = user;
                const old = rows.find(r => r.token === d.token);
                const prev = old && old.user;
                if (upsert) {
                  if (old) old.user = user; else rows.push({ user, token: d.token });
                  say(o, old ? `<span class="good">upsert:</span> the ${d.name} token now points at ${user}. ${prev} no longer reaches it.` : `POST /devices: ${user} → ${d.name} token.`);
                } else {
                  const dup = rows.some(r => r.token === d.token && r.user === user);
                  if (!dup) rows.push({ user, token: d.token });
                  say(o, dup ? `${user}’s row for the ${d.name} is still there, next to the others.` : old ? `<span class="bad">insert:</span> a second row for the same token. ${prev} still owns it too.` : `POST /devices: ${user} → ${d.name} token.`);
                }
                paint(); replay(table, 'pop-soft');
              }
              async function sendTo(user) {
                if (busy) return;
                const targets = rows.filter(r => r.user === user);
                if (!targets.length) { replay(table, 'shake'); say(o, `No rows for ${user}. Nothing to send.`); return; }
                busy = true;
                say(o, `Fan out to ${user}: ${targets.length} token${targets.length > 1 ? 's' : ''}, one send each.`);
                for (const r of targets) {
                  const d = devs.find(x => x.token === r.token);
                  const leak = d.user !== user;
                  d.node.classList.add(leak ? 'plt-leak' : 'plt-hitme'); replay(d.node, leak ? 'shake' : 'pop');
                  o.append(h('div', { class: 'line drop-in', html: leak ? `<span class="bad">leak:</span> ${user}’s message shows on the ${d.name}, where ${d.user} is signed in` : `<span class="good">delivered</span> to the ${d.name}` }));
                  await sleep(600);
                  if (!el.isConnected) return;
                }
                devs.forEach(d => d.node.classList.remove('plt-leak', 'plt-hitme'));
                busy = false;
              }
              const sw = toggle('plt-fcm-upsert', 'token is the unique key (upsert)', true, v => {
                upsert = v; rows = []; devs.forEach(d => { d.user = null; }); paint();
                say(o, v ? 'Upsert on token. Rows cleared. Start again.' : 'Plain insert of (user, token). Rows cleared. Start again.');
              });
              paint();
              el.append(
                h('div', { class: 'plt-devs' }, devs.map(d => d.node)),
                h('div', { class: 'controls plt-row' }, act('Ada signs in on Phone', () => signIn(devs[0], 'ada')), act('Ada signs in on Tablet', () => signIn(devs[1], 'ada')), act('Bob signs in on Phone', () => signIn(devs[0], 'bob'))),
                h('div', { class: 'controls plt-row' }, act('Send to Ada', () => sendTo('ada')), act('Send to Bob', () => sendTo('bob')), sw.el),
                h('span', { class: 'plt-label' }, 'device_tokens on your server'), table,
                o);
            },
          },
          {
            title: 'Fresh timestamps tell live installs from dead ones',
            body: `<p>Tokens rarely die loudly. A phone in a drawer keeps a valid token for months, and FCM accepts sends to it that never arrive. For token-based registration, Firebase suggests refreshing each token on your server about once a month, with a periodic job that calls <code>getToken()</code> and posts it with a timestamp. Then a token that hasn’t been refreshed for a month really means an inactive install, and you can stop sending to it. FCM itself treats a registration as stale after a month without connecting, and on Android expires it after 270 days of inactivity. Sends to an expired token fail, usually with <code>UNREGISTERED</code>. With FID registration, <code>onRegistered()</code> already fires on routine syncs at app startup, so you don’t need your own job.</p>
<p>Without the monthly refresh, every row looks old, and the same cleanup would delete your most loyal users too. Advance the months and try pruning with the job on and off.</p>`,
            code: `class TokenRefreshWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result = try {
        val token = FirebaseMessaging.getInstance().token.await()
        api.register(DeviceRegistration(session.userId, token, updatedAt = System.currentTimeMillis()))
        Result.success()
    } catch (e: IOException) { Result.retry() }
}

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "fcm-token-refresh", ExistingPeriodicWorkPolicy.KEEP,
    PeriodicWorkRequestBuilder<TokenRefreshWorker>(30, TimeUnit.DAYS)
        .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
        .build(),
)`,
            visual(el) {
              const INSTALLS = [
                { name: 'Ada, phone, daily user', off: Infinity, opens: true },
                { name: 'Bob, phone, opens app rarely', off: Infinity, opens: false },
                { name: 'Cem, old phone in a drawer', off: 0, opens: false },
                { name: 'Dee, uninstalled the app', off: 1, opens: false, uninstall: true },
                { name: 'Eda, broke her phone', off: 3, opens: false },
              ];
              let month = 0, refresh = true, busy = false;
              const o = out('Month 0. Every install registered this month. Advance time.');
              const monthEl = h('span', { class: 'clock' }, 'month 0');
              const table = h('div', { class: 'plt-table' });
              const rows = INSTALLS.map(x => ({ ...x, updated: 0, deleted: false }));
              const alive = r => month < r.off;
              const lastSeen = r => Math.min(month, r.off);
              const expired = r => !alive(r) && !r.uninstall && month - lastSeen(r) >= 9;
              function paint() {
                monthEl.textContent = `month ${month}`;
                table.replaceChildren(h('div', { class: 'plt-tr plt-th' }, h('span', {}, 'install'), h('span', {}, 'updated_at'), h('span', {}, 'age')),
                  ...rows.map(r => {
                    const age = month - r.updated;
                    return h('div', { class: 'plt-tr' + (r.deleted ? ' plt-gone' : '') }, h('span', {}, r.name), h('span', {}, `month ${r.updated}`),
                      r.deleted ? tag('deleted', 'no') : age > 1 ? tag(`${age} mo, stale`, 'wait') : tag('fresh', 'ok'));
                  }));
              }
              function advance() {
                if (busy) return;
                if (month >= 12) { replay(monthEl, 'shake'); say(o, 'A year has passed. Press Reset to start over.'); return; }
                month++;
                for (const r of rows) if (alive(r) && (refresh || r.opens)) r.updated = month;
                paint(); replay(monthEl, 'pop');
                say(o, refresh ? `Month ${month}. The refresh job ran on every phone that is still on.` : `Month ${month}. No refresh job: only rows of users who changed something get a new timestamp.`);
                if (!refresh) line(o, 'Here: Ada re-registers at each login. Everyone else keeps month 0.');
              }
              async function send() {
                if (busy) return; busy = true;
                let ok = 0, wasted = 0, removed = 0;
                say(o, `Month ${month}: send a campaign to every row.`);
                for (const r of rows) {
                  if (r.deleted) continue;
                  let res;
                  if (alive(r)) { res = ['ok', 'delivered']; ok++; }
                  else if (r.uninstall || expired(r)) { res = ['no', '404 UNREGISTERED, row deleted']; r.deleted = true; removed++; }
                  else { res = ['wait', 'accepted, never delivered']; wasted++; }
                  o.append(h('div', { class: 'line drop-in' }, `${r.name}: `, tag(res[1], res[0])));
                  paint();
                  await sleep(320);
                  if (!el.isConnected) return;
                }
                o.append(h('div', { class: 'line', html: `<span class="good">${ok} delivered</span>, <span class="bad">${wasted} wasted</span>, ${removed} deleted` }));
                busy = false;
              }
              function prune() {
                if (busy) return;
                const gone = rows.filter(r => !r.deleted && month - r.updated > 1);
                if (!gone.length) { say(o, 'No row is older than a month. Nothing to prune.'); return; }
                gone.forEach(r => { r.deleted = true; });
                paint();
                const lost = gone.filter(alive);
                say(o, `Pruned ${gone.length} row${gone.length > 1 ? 's' : ''} not refreshed for over a month.`);
                line(o, lost.length ? `<span class="bad">lost live users:</span> ${lost.map(r => r.name.split(',')[0]).join(', ')} still use their phones` : '<span class="good">only dead installs removed.</span>');
              }
              const sw = toggle('plt-fcm-refresh', 'monthly token refresh job', true, v => {
                refresh = v; month = 0; rows.forEach(r => { r.updated = 0; r.deleted = false; }); paint();
                say(o, (v ? 'Refresh job on.' : 'Refresh job off.') + ' Back to month 0.');
              });
              paint();
              el.append(
                h('div', { class: 'controls plt-row' }, sw.el, monthEl),
                h('div', { class: 'controls plt-row' }, act('Advance 1 month', advance), act('Send a campaign', send), act('Prune rows older than a month', prune)),
                table, o);
            },
          },
          {
            title: 'Read every send result on the server',
            body: `<p>HTTP v1 sends one message per request, and the old batch endpoint is gone. The Admin SDK’s <code>sendEach</code> runs those requests for you and returns one result per message, in order. Act on each error code. <code>UNREGISTERED</code> and <code>SENDER_ID_MISMATCH</code> mean the token will never work for you: delete it. <code>INVALID_ARGUMENT</code> means the request is wrong, or the token is malformed. Fix the payload, and delete the token only if it is the bad part.</p>
<p><code>QUOTA_EXCEEDED</code>, <code>UNAVAILABLE</code> and <code>INTERNAL</code> are temporary. Retry with exponential backoff, and honor a <code>Retry-After</code> header when there is one. Don’t retry other 4xx errors unchanged.</p>`,
            code: `val batch = FirebaseMessaging.getInstance().sendEach(messages)   // results in the same order
batch.responses.forEachIndexed { i, result ->
    val code = result.exception?.messagingErrorCode ?: return@forEachIndexed
    val token = targets[i]
    when (code) {
        MessagingErrorCode.UNREGISTERED,
        MessagingErrorCode.SENDER_ID_MISMATCH -> tokens.delete(token)
        MessagingErrorCode.INVALID_ARGUMENT -> log.warn("Bad request or malformed token: $token")
        MessagingErrorCode.QUOTA_EXCEEDED,
        MessagingErrorCode.UNAVAILABLE,
        MessagingErrorCode.INTERNAL -> retryQueue.add(messages[i], backoff = exponential())
        else -> log.error("FCM $code for $token")
    }
}`,
          },
        ],
        underHood: {
          body: `<p>Your app does not hold its own connection. Google Play services keeps one persistent connection to FCM for every app on the device. When a message arrives, it sends an explicit broadcast to the <code>FirebaseInstanceIdReceiver</code> that the SDK adds to your manifest. That receiver is guarded by a permission only Google Play services holds. It hands the message to your <code>FirebaseMessagingService</code>, which is why your process starts and <code>Application.onCreate</code> runs first. For a high priority message the system also puts your app on a short power allowlist, which is what lets it start a foreground service or run expedited work from the background.</p>
<p>The token is tied to the install’s Firebase Installation ID, and current tokens start with that id and a colon. Deleting the installation or calling <code>deleteToken()</code> makes the old token invalid. The SDK creates a token on first launch unless you turn auto-init off, which is how apps wait for consent before registering.</p>`,
          code: `<!-- AndroidManifest.xml: no token until the user agrees -->
<meta-data android:name="firebase_messaging_auto_init_enabled" android:value="false" />

// After consent
FirebaseMessaging.getInstance().isAutoInitEnabled = true`,
        },
        mistakes: [
          {
            title: 'Signing out without detaching the token',
            bad: `fun signOut() {
    session.clear()
}`,
            good: `suspend fun signOut() {
    val token = FirebaseMessaging.getInstance().token.await()
    api.unregister(token)                                // server drops the row
    FirebaseMessaging.getInstance().deleteToken().await() // the install gets a new one later
    session.clear()
}`,
            why: 'The row still links this install to the old user, so their private notifications keep arriving after sign-out.',
          },
          {
            title: 'Posting the token straight from onNewToken',
            bad: `override fun onNewToken(token: String) {
    runBlocking { api.register(token) }   // offline? the token is lost
}`,
            good: `override fun onNewToken(token: String) {
    val work = OneTimeWorkRequestBuilder<TokenSyncWorker>()
        .setInputData(workDataOf("token" to token))
        .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
        .build()
    WorkManager.getInstance(this).enqueueUniqueWork("token-sync", ExistingWorkPolicy.REPLACE, work)
}`,
            why: 'The callback fires once per new token. If that one request fails, the server never learns the token. A unique work request retries until it lands, and REPLACE keeps only the newest token.',
          },
          {
            title: 'Blocking the main thread for the token',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val token = Tasks.await(FirebaseMessaging.getInstance().token)
}`,
            good: `lifecycleScope.launch {
    val token = FirebaseMessaging.getInstance().token.await()   // kotlinx-coroutines-play-services
    viewModel.onToken(token)
}`,
            why: '<code>Tasks.await</code> throws <code>IllegalStateException</code> on the main thread. The suspending <code>await()</code> waits without blocking it.',
          },
        ],
        visual(el) {
          const mk = name => { const body = h('div', { class: 'plt-node-body' }); return { node: h('div', { class: 'plt-node' }, h('span', { class: 'plt-node-name' }, name), body), body }; };
          const app = mk('App'), fcm = mk('FCM'), srv = mk('Your server');
          const net = h('div', { class: 'plt-net' }, app.node, fcm.node, srv.node);
          const o = out('The app is installed and its token is on your server. Send a push.');
          let token = newToken(), live = new Set([token]), stored = token, busy = false;
          const paint = () => {
            app.body.innerHTML = token ? `token<br>${token}` : 'no token<br>(data cleared)';
            fcm.body.innerHTML = `${live.size} live token${live.size === 1 ? '' : 's'}`;
            srv.body.innerHTML = stored ? `ada →<br>${stored}` : 'ada → none';
          };
          async function fly(a, b, label, bad) {
            const mid = x => x.node.offsetLeft + x.node.offsetWidth / 2;
            const p = h('span', { class: 'plt-packet' + (bad ? ' plt-bad' : '') }, label);
            p.style.left = mid(a) + 'px'; net.append(p); void p.offsetWidth;
            a.node.classList.add('plt-on'); p.style.left = mid(b) + 'px';
            await sleep(750);
            a.node.classList.remove('plt-on'); p.remove(); replay(b.node, 'pop');
            await sleep(150);
          }
          async function send() {
            if (busy) return;
            if (!stored) { replay(srv.node, 'shake'); say(o, 'The server has no token for ada. There is nobody to send to until the app registers again.'); return; }
            busy = true;
            say(o, `Server: POST messages:send with token ${stored}`);
            await fly(srv, fcm, 'send');
            if (!live.has(stored)) {
              await fly(fcm, srv, '404', true);
              stored = null; paint();
              say(o, '<span class="bad">404 UNREGISTERED:</span> that install has no such token any more. The server deletes the row.');
            } else {
              await fly(fcm, app, 'message');
              say(o, '<span class="good">delivered:</span> onMessageReceived() runs on the device.');
            }
            busy = false;
          }
          async function launch() {
            if (busy) return;
            if (token) { say(o, 'getToken() returns the same token. onNewToken() does not fire. Pass it to the server at login anyway.'); replay(app.node, 'pop'); return; }
            busy = true;
            await fly(app, fcm, 'register');
            token = newToken(); live.add(token); paint();
            await fly(fcm, app, 'token');
            say(o, `onNewToken("${token}") fires. Forward it.`);
            await sleep(500);
            await fly(app, srv, 'POST /devices');
            stored = token; paint();
            say(o, '<span class="good">stored:</span> the server replaced the old token. Pushes work again.');
            busy = false;
          }
          async function rotate() {
            if (busy || !token) return;
            busy = true;
            live.delete(token); token = newToken(); live.add(token); paint();
            await fly(fcm, app, 'new token');
            say(o, `FCM rotated the token. onNewToken("${token}") fires.`);
            await sleep(500);
            await fly(app, srv, 'POST /devices');
            stored = token; paint();
            say(o, '<span class="good">stored:</span> because onNewToken forwarded it, the server never had a stale token.');
            busy = false;
          }
          function clear() {
            if (busy) return;
            if (!token) { say(o, 'Already cleared. Launch the app to get a new token.'); return; }
            live.delete(token); token = null; paint(); replay(app.node, 'shake');
            say(o, 'Data cleared. FCM forgets the old token, but your server still stores it. Send a push now.');
          }
          paint();
          el.append(net,
            h('div', { class: 'controls plt-row' }, act('Server sends a push', send), act('Clear app data', clear), act('Launch app', launch), act('FCM rotates token', rotate)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'messages',
        title: 'Notification vs data messages',
        tagline: 'Who handles the push depends on the payload and the app state.',
        level: 'intermediate',
        body: `
<p>A <em>notification message</em> carries a <code>notification</code> block. When the app is in the background, the FCM SDK shows it in the tray for you and your code doesn’t run. Any <code>data</code> in it waits in the launcher Activity’s intent extras until the user taps. In the foreground, every message goes to <code>onMessageReceived()</code> and nothing shows on its own.</p>
<p>A <em>data message</em> has only <code>data</code>. It reaches <code>onMessageReceived()</code> in the foreground and the background, and you post the notification yourself. That gives you full control over the channel, grouping, images and the deep link.</p>
<p>Priority decides timing. <code>high</code> is delivered right away and can wake a device in Doze. <code>normal</code> is delivered right away while the device is awake, and waits for a maintenance window when it dozes. Notification messages default to high, data messages to normal. If high priority messages don’t lead to visible notifications, FCM may deprioritize them. A force-stopped app gets nothing until the user opens it again.</p>`,
        code: `// Server (Firebase Admin SDK): a data message that can wake the device.
val message = Message.builder()
    .setToken(token)
    .putData("article_id", "42")
    .putData("title", "Derby ends 2-1")
    .setAndroidConfig(
        AndroidConfig.builder()
            .setPriority(AndroidConfig.Priority.HIGH)   // only if it shows something
            .build()
    )
    .build()
FirebaseMessaging.getInstance().send(message)

// Device: data messages arrive here in foreground and background.
override fun onMessageReceived(message: RemoteMessage) {
    val id = message.data["article_id"] ?: return
    Notifier.showArticle(this, id, message.data["title"].orEmpty())
}

// Device: a background notification message puts its data in the launcher intent.
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        intent.extras?.getString("article_id")?.let(::openArticle)
    }
}`,
        remember: 'Background plus a notification block means the system shows it and your code never runs.',
        terms: [
          { term: 'Notification message', def: 'An FCM message with a notification block that the SDK displays automatically while the app is in the background.' },
          { term: 'Data message', def: 'An FCM message with only custom key-value data, always handed to onMessageReceived for your code to process.' },
          { term: 'FCM message priority', def: 'The android.priority field, high or normal, that decides whether FCM may wake a dozing device to deliver now.' },
          { term: 'Doze', def: 'An Android power mode for idle devices that defers network access and jobs to periodic maintenance windows.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Send a data message that can wake the device from Doze.', code: 'val message = Message.builder()\n    .setToken(token)\n    .[[putData]]("article_id", "42")\n    .setAndroidConfig(\n        AndroidConfig.builder()\n            .setPriority(AndroidConfig.Priority.[[HIGH]])\n            .build())\n    .build()', why: 'Data goes in with <code>putData</code>. Data messages default to normal, so ask for <code>HIGH</code> explicitly, and post a notification when it arrives.' },
          { type: 'bug', prompt: 'The server sends data-only messages with <code>title</code> and <code>article_id</code>. Nothing ever shows. Tap the line.', code: 'override fun onMessageReceived(message: RemoteMessage) {\n    val title = message.notification?.title ?: return\n    val id = message.data["article_id"] ?: return\n    Notifier.showArticle(this, id, title)\n}', bug: 1, fix: '    val title = message.data["title"] ?: return', why: 'A data message has no notification block, so <code>message.notification</code> is null and the function returns. Read the title from <code>data</code>.' },
        ],
        quiz: [
          { q: 'A message has both <code>notification</code> and <code>data</code>. The app is in the background. Does <code>onMessageReceived</code> run?', options: ['Yes, with both payloads', 'No: the system shows it, and the data goes into the launcher intent extras on tap', 'No, and the data is lost'], a: 1, why: 'In the background the notification block takes the system path. The data rides along in the launcher Activity’s intent.' },
          { q: 'A <code>normal</code> priority data message reaches a device in Doze. What happens?', options: ['Delivered at once', 'Held until a maintenance window or until the device wakes', 'Dropped'], a: 1, why: 'Only high priority can wake a dozing device. Normal waits.' },
          { q: 'The user force-stopped your app in Settings. A high priority data message arrives. What runs?', options: ['onMessageReceived', 'Nothing until the user opens the app again', 'The system shows it in the tray'], a: 1, why: 'Android does not deliver broadcasts, FCM included, to a force-stopped app.' },
        ],
        deeper: [
          {
            title: 'Offline devices: collapsible or every message',
            body: `<p>When the device is offline, FCM stores messages for it. By default each message is non-collapsible, so every one is kept and delivered. FCM keeps at most 100 of them per app on a device. Past that it drops them all, and on reconnect your app gets <code>onDeletedMessages()</code> instead.</p>
<p>A <code>collapse_key</code> says only the latest one matters, like a live score. FCM keeps just the newest message per key, with up to 4 different keys per device at once. Notification messages are collapsible by default. Send a few updates while the phone is offline, then bring it back.</p>`,
            visual(el) {
              const SCORES = ['1-0', '1-1', '2-1', '2-2', '3-2', '3-3', '4-3'];
              let online = false, collapse = false, held = [], dropped = false, n = 0, busy = false;
              const ph = phone();
              const shade = h('div', { class: 'plt-shade' });
              ph.screen.append(h('p', { class: 'plt-shade-title' }, 'Notification shade'), shade);
              const store = h('div', { class: 'plt-store' });
              const o = out('The phone is offline. Send a few score updates.');
              function paint() {
                if (dropped) { store.replaceChildren(tag('over 100: all dropped', 'no')); return; }
                const shown = held.slice(-6).map(m => tag(m.key ? `score ${m.text} · key` : `score ${m.text}`, m.key ? 'acc' : ''));
                store.replaceChildren(...(held.length ? shown : [h('span', { class: 'plt-empty' }, 'nothing stored')]), held.length > 6 ? tag(`+${held.length - 6} more`) : null);
              }
              function show(text) {
                shade.prepend(note('scores', 'Derby', `Score: ${text}`, 'drop-in'));
                while (shade.children.length > 4) shade.lastElementChild.remove();
              }
              function send() {
                if (busy) return;
                const text = SCORES[n++ % SCORES.length];
                const msg = { text, key: collapse ? 'score_derby' : null };
                if (online) { show(text); say(o, `Online: delivered at once. ${hl('onMessageReceived()')}`); return; }
                if (dropped) { say(o, 'FCM already dropped the backlog. Reconnect to see what happens.'); return; }
                if (msg.key) {
                  const had = held.some(m => m.key === msg.key);
                  held = held.filter(m => m.key !== msg.key);
                  say(o, had ? `collapse_key "score_derby": the older update is replaced by ${text}.` : `Stored with collapse_key "score_derby".`);
                } else say(o, `Stored. ${held.length + 1} non-collapsible message${held.length ? 's' : ''} waiting.`);
                held.push(msg); paint(); replay(store, 'pop-soft');
              }
              function flood() {
                if (busy) return;
                if (online) { say(o, 'Go offline first.'); return; }
                held = []; dropped = true; paint(); replay(store, 'shake');
                say(o, '<span class="bad">101 non-collapsible messages</span> while offline. FCM drops every stored message for this app.');
              }
              async function reconnect(v) {
                online = v;
                if (!v) { say(o, 'Offline. New messages wait at FCM.'); return; }
                busy = true;
                if (dropped) {
                  say(o, `Back online: ${hl('onDeletedMessages()')}  <span class="muted">// do a full sync from your server</span>`);
                  dropped = false;
                } else if (!held.length) say(o, 'Back online. Nothing was waiting.');
                else {
                  say(o, `Back online: ${held.length} message${held.length > 1 ? 's' : ''} delivered.`);
                  for (const m of held) { show(m.text); await sleep(350); if (!el.isConnected) return; }
                }
                held = []; paint();
                busy = false;
              }
              const net = toggle('plt-msg-online', 'phone online', false, (v, input) => { if (busy) { input.checked = online; return; } reconnect(v); });
              const keys = toggle('plt-msg-collapse', 'collapse_key = "score_derby"', false, v => { collapse = v; say(o, v ? 'New sends carry a collapse key.' : 'New sends are non-collapsible.'); });
              paint();
              el.append(
                h('div', { class: 'plt-split' },
                  h('div', { class: 'plt-col' },
                    h('div', { class: 'controls plt-row' }, net.el, keys.el),
                    h('div', { class: 'controls plt-row' }, cmd('send(scoreUpdate)', send), act('Send 101 while offline', flood)),
                    h('span', { class: 'plt-label' }, 'Stored at FCM for this device'), store),
                  ph.dev),
                o);
            },
          },
          {
            title: 'Update a notification instead of stacking new ones',
            body: `<p>When you post data messages yourself, the notification id decides what happens in the tray. <code>notify(id, …)</code> with an id that is already showing replaces that notification. A new id each time stacks a new one. For notification messages, the <code>android.notification.tag</code> field does the same job.</p>
<p>A replaced notification alerts again by default, with sound and a heads-up banner. <code>setOnlyAlertOnce(true)</code> keeps later updates quiet while the first one still alerts.</p>`,
            code: `fun showScore(context: Context, matchId: Int, score: String) {
    val n = NotificationCompat.Builder(context, SCORES_CHANNEL)
        .setSmallIcon(R.drawable.ic_stat_score)
        .setContentTitle("Derby")
        .setContentText(score)
        .setOnlyAlertOnce(true)        // updates don't buzz again
        .build()
    NotificationManagerCompat.from(context).notify(matchId, n)   // same match, same id
}`,
            visual(el) {
              const SCORES = ['1-0', '1-1', '2-1', '2-2', '3-2'];
              let same = true, once = false, n = 0, nextId = 100, busy = false;
              const ph = phone();
              const shade = h('div', { class: 'plt-shade' });
              ph.screen.append(h('p', { class: 'plt-shade-title' }, 'Notification shade'), shade);
              const posted = new Map();
              const o = out('Post a few score updates for the same match.');
              async function post() {
                if (busy) return; busy = true;
                const score = SCORES[n++ % SCORES.length];
                const id = same ? 7 : nextId++;
                const existing = posted.get(id);
                const card = note(`scores · id ${id}`, 'Derby', `Score: ${score}`);
                const alert = !existing || !once;
                if (existing) { existing.replaceWith(card); replay(card, 'pop'); }
                else { card.classList.add('drop-in'); shade.prepend(card); }
                posted.set(id, card);
                while (shade.children.length > 4) { const last = shade.lastElementChild; posted.forEach((v, k) => { if (v === last) posted.delete(k); }); last.remove(); }
                say(o, `${hl(`notify(${id}, n)`)}  ${existing ? 'replaced in place' : 'new entry'}${alert ? ', alerts' : ', silent update'}`);
                if (alert) {
                  const hu = note(`scores · id ${id}`, 'Derby', `Score: ${score}`); hu.classList.add('plt-in'); ph.banner.append(hu);
                  await sleep(1300);
                  hu.classList.replace('plt-in', 'plt-out'); await sleep(400); hu.remove();
                } else await sleep(300);
                busy = false;
              }
              const ids = choice('id', ['same id', 'new id'], 'same id', v => { if (busy) return false; same = v === 'same id'; });
              const quiet = toggle('plt-msg-once', 'setOnlyAlertOnce(true)', false, v => { once = v; });
              el.append(
                h('div', { class: 'plt-split' },
                  h('div', { class: 'plt-col' }, ids.el, quiet.el, h('div', { class: 'controls plt-row' }, cmd('showScore(context, matchId, score)', post)),
                    h('p', { class: 'tip' }, 'Try new id, then same id with setOnlyAlertOnce.')),
                  ph.dev),
                o);
            },
          },
          {
            title: 'Give time-bound messages a TTL',
            body: `<p>FCM keeps an undelivered message for 4 weeks by default, which is also the maximum. A goal alert that arrives a day late is worse than none, so set a <code>ttl</code>. With a TTL of 0 FCM tries once, right now, and discards the message if the device can’t be reached.</p>
<p>When FCM throws away messages it was holding, because of the 100 message limit or because the device stayed away for over a month, your app gets <code>onDeletedMessages()</code> on reconnect. Treat it as “your local state may be behind” and pull fresh data from your server.</p>`,
            code: `// Server: only the latest score matters, and only for 10 minutes
val android = AndroidConfig.builder()
    .setCollapseKey("score_$matchId")
    .setTtl(10 * 60 * 1000L)                       // milliseconds
    .setPriority(AndroidConfig.Priority.HIGH)
    .build()

// Device
override fun onDeletedMessages() {
    SyncWorker.enqueueFullSync(applicationContext)  // catch up from your server
}`,
          },
        ],
        underHood: {
          body: `<p>“Your code does not run” is about <code>onMessageReceived</code>, not your process. A background notification message still reaches your app as a broadcast, so the process starts and <code>Application.onCreate</code> runs. The FCM SDK inside your process checks whether the app is in the foreground. If not, it builds the notification itself and posts it.</p>
<p>It picks the channel from <code>android.notification.channel_id</code> in the payload, then from a default channel in your manifest. With neither, it creates a fallback channel the user sees as “Miscellaneous”. The tap opens your launcher Activity, or the Activity matching <code>click_action</code>, with the <code>data</code> pairs as String extras next to keys like <code>google.message_id</code>.</p>`,
          code: `<!-- AndroidManifest.xml, inside <application> -->
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="news_alerts" />
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_stat_news" />`,
        },
        mistakes: [
          {
            title: 'Reading the tap extras only in onCreate',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    intent.extras?.getString("article_id")?.let(::openArticle)
}`,
            good: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (savedInstanceState == null) handlePush(intent)
}
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    handlePush(intent)
}`,
            why: 'With a singleTop or singleTask launcher that is already running, the tap arrives in <code>onNewIntent</code> and <code>onCreate</code> never sees it. The saved state check stops a rotation from opening the article again.',
          },
          {
            title: 'High priority for silent syncs',
            bad: `Message.builder().setToken(token)
    .putData("sync", "inbox")
    .setAndroidConfig(AndroidConfig.builder().setPriority(AndroidConfig.Priority.HIGH).build())`,
            good: `Message.builder().setToken(token)
    .putData("sync", "inbox")
    .setAndroidConfig(AndroidConfig.builder().setPriority(AndroidConfig.Priority.NORMAL).build())`,
            why: 'High priority is for messages the user sees right away. If they rarely lead to a visible notification, FCM may start delivering them as normal priority.',
          },
          {
            title: 'Putting numbers and objects in data',
            bad: `{ "message": { "token": "…",
  "data": { "article_id": 42, "tags": ["derby", "live"] } } }`,
            good: `{ "message": { "token": "…",
  "data": { "article_id": "42", "tags": "derby,live" } } }`,
            why: 'Every <code>data</code> value must be a string. HTTP v1 rejects the first request with <code>INVALID_ARGUMENT</code>. Keep the whole payload under 4 KB.',
          },
        ],
        visual(el) {
          const TYPES = ['notification', 'data', 'both'];
          const STATES = ['foreground', 'background', 'stopped'];
          const STATE_LABEL = { foreground: 'Foreground', background: 'Background or swiped away', stopped: 'Force-stopped' };
          const RES = {
            notification: { foreground: ['app', 'Your code'], background: ['sys', 'System tray'] },
            data: { foreground: ['app', 'Your code'], background: ['app', 'Your code'] },
            both: { foreground: ['app', 'Your code'], background: ['sys', 'Tray + extras'] },
          };
          const res = (t, s) => (s === 'stopped' ? ['none', 'Not delivered'] : RES[t][s]);
          let type = 'notification', state = 'background', prio = 'high', doze = false, busy = false;
          const cells = {};
          const mx = h('div', { class: 'plt-mx', role: 'group', 'aria-label': 'Message type by app state' },
            h('span', { class: 'plt-mh' }, ''), STATES.map(s => h('span', { class: 'plt-mh' }, STATE_LABEL[s])),
            TYPES.flatMap(t => [h('span', { class: 'plt-rh' }, t), ...STATES.map(s => {
              const [k, label] = res(t, s);
              return (cells[t + s] = h('button', { class: `plt-cell plt-${k}`, onclick() { if (busy) return; pickType(t); pickState(s); send(); } }, label));
            })]));
          const steps = h('div', { class: 'plt-steps' });
          const step = (k, who, text) => steps.append(h('div', { class: `plt-step drop-in ${k ? 'plt-' + k : ''}` }, h('b', {}, who), h('span', { html: text })));
          const paint = () => { Object.values(cells).forEach(c => c.classList.remove('plt-cur')); const c = cells[type + state]; c.classList.add('plt-cur'); replay(c, 'pop'); };
          const types = choice('payload', TYPES, type, v => { if (busy) return false; pickType(v); });
          const states = choice('app', STATES, state, v => { if (busy) return false; pickState(v); });
          const prios = choice('priority', ['high', 'normal'], prio, v => { if (busy) return false; prio = v; });
          function pickType(v) {
            type = v; types.set(v);
            prio = v === 'data' ? 'normal' : 'high'; prios.set(prio);
            paint();
            steps.replaceChildren();
            step('', 'default', `${v === 'data' ? 'Data messages' : 'Messages with a notification block'} default to <b>${prio}</b> priority.`);
          }
          function pickState(v) { state = v; states.set(v); paint(); }
          const dozes = toggle('plt-doze', 'Device in Doze', false, v => { doze = v; });
          async function send() {
            if (busy) return; busy = true;
            steps.replaceChildren();
            const wait = () => sleep(550);
            step('', 'FCM', `sends a <code>${type}</code> message, priority <code>${prio}</code>.`); await wait();
            if (!el.isConnected) return;
            if (state === 'stopped') {
              step('bad', 'Device', 'The app is force-stopped. Nothing is delivered until the user opens it again.');
              replay(steps, 'shake'); busy = false; return;
            }
            if (doze && prio === 'normal') {
              step('wait', 'Doze', 'Normal priority waits for the next maintenance window.'); await sleep(1300);
              step('', 'Doze', 'Maintenance window opens. Delivered now.'); await wait();
            } else if (doze) {
              step('good', 'Doze', 'High priority wakes the device and delivers now.'); await wait();
            } else {
              step('good', 'Device', 'Awake. Delivered right away.'); await wait();
            }
            if (!el.isConnected) return;
            if (state === 'foreground') {
              step('', 'Your code', type === 'notification'
                ? '<code>onMessageReceived()</code> runs. <code>message.notification</code> has the title and body. Nothing shows unless you post it.'
                : '<code>onMessageReceived()</code> runs with the payload. Nothing shows unless you post it.');
            } else if (type === 'data') {
              step('', 'Your code', '<code>onMessageReceived()</code> runs in the background. You build and post the notification.');
              if (prio === 'high') { await wait(); step('wait', 'Note', 'Post a visible notification for high priority messages, or FCM may start treating them as normal.'); }
            } else {
              step('', 'System', 'The FCM SDK shows it in the tray. Your code does not run.'); await wait();
              step('', 'On tap', type === 'both' ? 'The launcher Activity opens. The <code>data</code> payload is in its intent extras.' : 'The launcher Activity opens.');
            }
            busy = false;
          }
          paint();
          step('', 'Ready', 'Pick a payload and an app state, or tap any cell in the table.');
          el.append(types.el, states.el,
            h('div', { class: 'controls plt-row' }, prios.el, dozes.el, cmd('send(message)', send)),
            mx, steps);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'deeplinks',
        title: 'Pending intents and deep links',
        tagline: 'A tap on a notification should land on the right screen with a sane Back.',
        level: 'intermediate',
        body: `
<p>A notification can’t start your Activity by itself. You hand it a <code>PendingIntent</code>, a token that lets the system launch an Intent later on your app’s behalf. On Android 12+ you must pass <code>FLAG_IMMUTABLE</code> or <code>FLAG_MUTABLE</code>. Choose immutable unless something like an inline reply has to fill in the Intent.</p>
<p>A plain <code>getActivity()</code> opens one screen in a new task, so Back drops the user on the home screen. <code>TaskStackBuilder</code> with <code>addNextIntentWithParentStack()</code> adds the parent Activities first, so Back walks up through your app. With Navigation, give the route a deep link and point the Intent at its URI. Navigation puts the start destination under it.</p>
<p>Give each notification its own request code. The system matches PendingIntents by action, data, type, component and categories, not by extras, so two that differ only in extras become one. For web links, Android App Links use <code>autoVerify</code> and an <code>assetlinks.json</code> file to open your app directly. On Android 12+, an unverified link opens in the browser.</p>`,
        code: `// Compose Navigation: the route accepts a deep link.
composable(
    route = "article/{id}",
    deepLinks = listOf(navDeepLink { uriPattern = "https://news.example.com/article/{id}" }),
) { entry -> ArticleScreen(entry.arguments?.getString("id")) }

fun articleNotification(context: Context, id: String, title: String): Notification {
    val intent = Intent(
        Intent.ACTION_VIEW,
        "https://news.example.com/article/$id".toUri(),
        context, MainActivity::class.java,
    )
    val pending = TaskStackBuilder.create(context)
        .addNextIntentWithParentStack(intent)
        .getPendingIntent(id.hashCode(), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    return NotificationCompat.Builder(context, NEWS_CHANNEL)
        .setSmallIcon(R.drawable.ic_stat_news)
        .setContentTitle(title)
        .setContentIntent(pending)
        .setAutoCancel(true)
        .build()
}

// App Links: verified with https://news.example.com/.well-known/assetlinks.json
// <intent-filter android:autoVerify="true">
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <category android:name="android.intent.category.BROWSABLE" />
//     <data android:scheme="https" android:host="news.example.com" android:pathPrefix="/article/" />
// </intent-filter>`,
        remember: 'Immutable, a unique request code, and a built back stack. Then the tap lands right.',
        terms: [
          { term: 'PendingIntent', def: 'A token that lets another process, such as the system UI, perform an Intent later with your app’s identity.' },
          { term: 'FLAG_IMMUTABLE', def: 'A PendingIntent flag that stops the receiver from filling in the wrapped Intent; one of it or FLAG_MUTABLE is required on Android 12+.' },
          { term: 'TaskStackBuilder', def: 'A helper that builds a synthetic back stack of parent Activities so Back works after opening a deep screen from outside.' },
          { term: 'Android App Links', def: 'Verified https deep links (autoVerify plus assetlinks.json) that open your app directly instead of the browser.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Build a PendingIntent that restores the parent screens and is safe to hand to the system.', code: 'val pending = TaskStackBuilder.create(context)\n    .[[addNextIntentWithParentStack]](intent)\n    .getPendingIntent(\n        articleId,\n        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.[[FLAG_IMMUTABLE]],\n    )', why: '<code>addNextIntentWithParentStack</code> adds the parents from the manifest. <code>FLAG_IMMUTABLE</code> is required on Android 12+ unless the Intent must be mutable.' },
          { type: 'bug', prompt: 'Two breaking-news notifications are showing. Tapping either one opens the same article. Tap the line.', code: '@RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)\nfun notifyArticle(context: Context, articleId: Int, title: String) {\n    val intent = Intent(context, ArticleActivity::class.java).putExtra("id", articleId)\n    val pending = PendingIntent.getActivity(context, 0, intent,\n        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)\n    val notification = NotificationCompat.Builder(context, NEWS_CHANNEL)\n        .setSmallIcon(R.drawable.ic_stat_news)\n        .setContentTitle(title)\n        .setContentIntent(pending)\n        .setAutoCancel(true)\n        .build()\n    NotificationManagerCompat.from(context).notify(articleId, notification)\n}', bug: 3, fix: '    val pending = PendingIntent.getActivity(context, articleId, intent,', why: 'Extras are not part of PendingIntent matching. With request code 0, both notifications share one PendingIntent, and FLAG_UPDATE_CURRENT gives it the latest id. A per-article request code keeps them apart.' },
        ],
        quiz: [
          { q: 'Your app targets Android 14. You call <code>PendingIntent.getActivity(ctx, 0, intent, FLAG_UPDATE_CURRENT)</code>. What happens?', options: ['It works', 'It throws <code>IllegalArgumentException</code>: specify FLAG_IMMUTABLE or FLAG_MUTABLE', 'It returns null'], a: 1, why: 'Since Android 12, every PendingIntent must declare its mutability.' },
          { q: 'A notification opens <code>ArticleActivity</code> through a plain <code>getActivity()</code>. The user presses Back. Where do they land?', options: ['On your home screen Activity', 'On the device home screen', 'On the previous article'], a: 1, why: 'The new task holds only ArticleActivity. Use TaskStackBuilder or a Navigation deep link to put your main screen under it.' },
          { q: 'Your App Link filter has <code>autoVerify</code>, but <code>assetlinks.json</code> is missing. A user taps the link in a chat app on Android 13. What opens?', options: ['Your app', 'A chooser dialog', 'The browser'], a: 2, why: 'Since Android 12, unverified web links go to the default browser.' },
        ],
        visual(el) {
          const MODES = {
            plain: { label: 'getActivity()', code: 'PendingIntent.getActivity(ctx, 42, Intent(ctx, ArticleActivity::class.java), FLAG_IMMUTABLE)' },
            parent: { label: 'TaskStackBuilder', code: 'TaskStackBuilder.create(ctx).addNextIntentWithParentStack(articleIntent)' },
            nav: { label: 'Navigation deep link', code: 'TaskStackBuilder.create(ctx).addNextIntentWithParentStack(Intent(ACTION_VIEW, "https://news.example.com/article/42".toUri(), ctx, MainActivity::class.java))' },
          };
          let mode = 'nav', verified = true, busy = false;
          let stack = [];
          const ph = phone();
          const src = h('div', { class: 'kt' });
          const stackEl = h('div', { class: 'plt-stack', 'aria-label': 'Task back stack' });
          const o = out('The app is not running. Tap the notification on the phone.');
          const label = a => a.dests ? `${a.name}: ${a.dests[a.dests.length - 1]}` : a.name;
          function paintPhone() {
            const top = stack[stack.length - 1];
            if (!top) {
              const tap = h('button', { class: 'plt-note plt-tap', onclick: open },
                h('span', { class: 'plt-note-ch' }, 'news_alerts · tap to open'), h('b', {}, 'Breaking news'), h('span', {}, 'Article 42: derby ends 2-1'));
              ph.screen.replaceChildren(h('p', { class: 'plt-shade-title' }, 'Home screen'), tap, h('div', { class: 'plt-icons' }, Array.from({ length: 6 }, () => h('span'))));
              return;
            }
            const title = top.dests ? top.dests[top.dests.length - 1] : top.name;
            ph.screen.replaceChildren(h('div', { class: 'plt-appbar drop-in' + (top.ext ? ' plt-ext' : '') }, title),
              h('span', { class: 'plt-ln', style: 'width:90%' }), h('span', { class: 'plt-ln', style: 'width:70%' }), h('span', { class: 'plt-ln', style: 'width:80%' }));
          }
          function paintStack(anim) {
            stackEl.replaceChildren(...(stack.length ? stack.map((a, i) => h('div', { class: ['plt-act', i === stack.length - 1 && 'plt-top', a.ext && 'plt-ext', anim && i === stack.length - 1 && 'drop-in'].filter(Boolean).join(' ') },
              h('span', {}, a.name),
              a.dests ? h('div', { class: 'plt-group' }, h('span', { class: 'plt-label' }, 'nav stack'), a.dests.map(d => tag(d, 'acc'))) : null))
              : [h('p', { class: 'plt-empty' }, 'No task. The user is on the home screen.')]));
            paintPhone();
          }
          const paintSrc = () => { src.innerHTML = hl(MODES[mode].code); };
          async function open() {
            if (busy) return;
            if (stack.length) { say(o, 'The app is open. Press Back until you are home, or Reset.'); return; }
            busy = true;
            if (mode === 'plain') {
              stack = [{ name: 'ArticleActivity (id=42)' }]; paintStack(true);
              say(o, 'getActivity() starts ArticleActivity alone in a new task. Press Back.');
            } else if (mode === 'parent') {
              stack = [{ name: 'MainActivity' }]; paintStack(true);
              say(o, 'TaskStackBuilder adds the parent from android:parentActivityName first.');
              await sleep(650);
              stack.push({ name: 'ArticleActivity (id=42)' }); paintStack(true);
              say(o, 'Then ArticleActivity on top. Back walks up to MainActivity.');
            } else {
              stack = [{ name: 'MainActivity', dests: ['home'] }]; paintStack(true);
              say(o, 'MainActivity starts with the URI. Navigation matches the deep link and puts the start destination first.');
              await sleep(700);
              stack[0].dests.push('article/42'); paintStack(false);
              replay(stackEl.lastElementChild, 'pop');
              say(o, 'Then article/42 on top. Back goes to home, inside your app.');
            }
            busy = false;
          }
          async function back() {
            if (busy) return;
            const top = stack[stack.length - 1];
            if (!top) { say(o, 'Already on the home screen. Tap the notification.'); return; }
            busy = true;
            const card = stackEl.lastElementChild;
            if (top.dests && top.dests.length > 1) {
              top.dests.pop(); paintStack(false);
              say(o, `Navigation pops to ${top.dests[top.dests.length - 1]}.`);
            } else {
              card.classList.add('leave'); await sleep(420);
              stack.pop(); paintStack(false);
              const now = stack[stack.length - 1];
              say(o, now ? `Back to ${label(now)}.` : (mode === 'plain' && !top.ext ? '<span class="bad">Out of the app.</span> The task held only ArticleActivity, so Back left to the home screen.' : 'Back to the home screen.'));
            }
            busy = false;
          }
          async function webLink() {
            if (busy) return;
            busy = true;
            stack = [{ name: 'Chat app', ext: true }]; paintStack(true);
            await sleep(600);
            if (verified) {
              stack.push({ name: 'MainActivity', dests: ['article/42'] }); paintStack(true);
              say(o, '<span class="good">verified:</span> Android opens your app straight away. Back returns to the chat app.');
            } else {
              stack.push({ name: 'Browser: news.example.com/article/42', ext: true }); paintStack(true);
              say(o, '<span class="bad">not verified:</span> on Android 12+ the link opens in the browser. Check with <code>adb shell pm get-app-links</code>.');
            }
            busy = false;
          }
          const modes = choice('PendingIntent', Object.keys(MODES), mode, v => {
            if (busy) return false;
            mode = v; stack = []; paintSrc(); paintStack(false);
            say(o, 'Fresh start: the app is not running. Tap the notification.');
          }, v => MODES[v].label);
          const ver = toggle('plt-verified', 'assetlinks.json verified', true, v => { verified = v; });
          paintSrc(); paintStack(false);
          el.append(modes.el, src,
            h('div', { class: 'plt-split' },
              h('div', { class: 'plt-col' },
                h('span', { class: 'plt-label' }, 'Task back stack (top first)'), stackEl,
                h('div', { class: 'controls plt-row' }, act('Tap notification', open), act('Back', back)),
                h('span', { class: 'plt-label' }, 'App Links'),
                h('div', { class: 'controls plt-row' }, act('Tap the link in a chat app', webLink), ver.el)),
              ph.dev),
            o);
        },
      },
    ],
  });
})();
