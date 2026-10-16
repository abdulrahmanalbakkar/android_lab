/* Platform and push track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed plt-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const tag = (text, kind = '') => h('span', { class: 'plt-tag' + (kind ? ' plt-' + kind : '') }, text);

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

/* 5 WorkManager */
.plt-queue { display: grid; gap: 8px; min-width: 0; }
.plt-work { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.plt-work.plt-running { border-color: var(--accent); }
.plt-work.plt-done { opacity: 0.7; }
.plt-work-name { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; }
.plt-work-info { grid-column: 1 / -1; font-size: 0.84rem; color: var(--muted); overflow-wrap: anywhere; }
.plt-prog { grid-column: 1 / -1; height: 6px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.plt-prog span { display: block; height: 100%; width: 0; background: var(--accent); transition: width 0.1s linear; }
.plt-prog span.plt-back { background: var(--warm); }

/* 6 foreground service */
.plt-deadline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--err); }
.plt-lane-note { font: 500 0.72rem var(--mono); color: var(--muted); display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }

/* 7 receivers */
.plt-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; min-width: 0; }
.plt-rx { display: grid; gap: 8px; align-content: start; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.plt-rx.plt-hit { border-color: var(--ok); }
.plt-rx.plt-miss { border-color: var(--err); }
.plt-rx-name { font: 700 0.86rem var(--mono); overflow-wrap: anywhere; }
.plt-filter { font: 500 0.74rem/1.5 var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.plt-log { display: grid; gap: 4px; min-height: 2.6em; }
.plt-log > div { display: flex; gap: 6px; align-items: baseline; font-size: 0.84rem; line-height: 1.35; min-width: 0; }
.plt-log .plt-tag { flex: none; white-space: nowrap; }
.plt-log > div span:last-child { min-width: 0; overflow-wrap: anywhere; }
.plt-events { display: grid; gap: 6px; min-width: 0; }
.plt-events .cmd { text-align: left; }

@media (max-width: 640px) {
  .plt-split { grid-template-columns: minmax(0, 1fr); }
}
`;

  Lab.addTrack({
    id: 'platform',
    title: 'Platform and push',
    description: 'Notifications, FCM, deep links and the background rules that decide when your code gets to run.',
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
<p>Create your channels at startup. The call does nothing once a channel exists. From then on the user owns its importance and sound, and your code can’t raise them. To change a default, ship a new channel id and delete the old one.</p>
<p>On Android 13 and later, posting also needs the <code>POST_NOTIFICATIONS</code> runtime permission. Without it, <code>notify()</code> posts nothing and throws nothing. Ask when the user turns on something that sends notifications, like following a team.</p>`,
        code: `const val NEWS_CHANNEL = "news_alerts"

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // Safe on every launch: a no-op once the channel exists.
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
<p>Your server sends through the HTTP v1 API. When FCM answers <code>404 UNREGISTERED</code>, that token is dead, so delete it. On the device, <code>onMessageReceived()</code> runs with a short execution window. Hand anything longer than a few seconds to WorkManager.</p>`,
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
          { term: 'onNewToken', def: 'The FirebaseMessagingService callback that fires when a token is first created and whenever it changes.' },
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

      // 5 ─────────────────────────────────────────────
      {
        id: 'workmanager',
        title: 'WorkManager',
        tagline: 'Work that must finish, run when the conditions are right.',
        level: 'intermediate',
        body: `
<p>WorkManager runs deferrable work that must finish, even if the app closes or the phone reboots. Describe the job as a <code>OneTimeWorkRequest</code> or a <code>PeriodicWorkRequest</code> (15 minutes at the shortest), add constraints like network or charging, and enqueue it. WorkManager starts it when the constraints hold and stops it if they break mid-run.</p>
<p>Write the job as a <code>CoroutineWorker</code> and return <code>Result.success()</code>, <code>failure()</code> or <code>retry()</code>. A retry waits out the backoff: exponential by default, starting at 30 seconds and doubling each time. Use <code>runAttemptCount</code> to give up after a few tries.</p>
<p>Use unique work so repeated triggers don’t stack copies. <code>enqueueUniqueWork</code> with <code>KEEP</code> ignores the new request while one is still pending or running. <code>REPLACE</code> cancels the old one and enqueues the new one.</p>`,
        code: `class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result = try {
        ArticleRepository.sync()
        Result.success()
    } catch (e: IOException) {
        if (runAttemptCount < 5) Result.retry() else Result.failure()
    }
}

val request = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresCharging(true)
            .build()
    )
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
    .build()

WorkManager.getInstance(context)
    .enqueueUniqueWork("sync", ExistingWorkPolicy.KEEP, request)

// Roughly once a day. The shortest allowed interval is 15 minutes.
val daily = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.DAYS).build()
WorkManager.getInstance(context)
    .enqueueUniquePeriodicWork("daily-sync", ExistingPeriodicWorkPolicy.KEEP, daily)`,
        remember: 'Constraints decide when, backoff decides how often, unique work decides how many.',
        terms: [
          { term: 'CoroutineWorker', def: 'A WorkManager worker whose doWork is a suspend function, cancelled when the work is stopped.' },
          { term: 'Constraints', def: 'Conditions such as network type, charging or storage that must hold before WorkManager runs a request.' },
          { term: 'BackoffPolicy', def: 'LINEAR or EXPONENTIAL growth of the delay before WorkManager retries work that returned Result.retry().' },
          { term: 'ExistingWorkPolicy', def: 'What enqueueUniqueWork does when work with the same name exists: KEEP, REPLACE, APPEND or APPEND_OR_REPLACE.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Enqueue a one-time sync that needs a network and never runs twice at once.', code: 'val request = [[OneTimeWorkRequestBuilder]]<SyncWorker>()\n    .setConstraints(\n        Constraints.Builder()\n            .setRequiredNetworkType(NetworkType.[[CONNECTED|UNMETERED]])\n            .build())\n    .build()\nWorkManager.getInstance(context)\n    .enqueueUniqueWork("sync", ExistingWorkPolicy.[[KEEP|REPLACE]], request)', why: '<code>CONNECTED</code> means any network. <code>KEEP</code> leaves a pending sync alone, <code>REPLACE</code> restarts it. Both avoid duplicates.' },
          { type: 'bug', prompt: 'Uploads sometimes vanish, and failures never retry. Tap the line.', code: 'class UploadWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {\n    override suspend fun doWork(): Result {\n        val path = inputData.getString("path") ?: return Result.failure()\n        GlobalScope.launch { Uploader.upload(path) }\n        return Result.success()\n    }\n}', bug: 3, fix: '        Uploader.upload(path)', why: 'The worker reports success at once while the upload runs outside its scope. WorkManager may stop the process, and an exception never turns into a retry. Call the suspend function directly.' },
        ],
        quiz: [
          { q: 'Exponential backoff at 30 seconds. A worker returns <code>retry()</code> three times. What are the waits?', options: ['30 s, 30 s, 30 s', '30 s, 60 s, 120 s', '1 s, 2 s, 4 s'], a: 1, why: 'Exponential doubles the delay after each attempt, up to a 5 hour cap.' },
          { q: '<code>enqueueUniqueWork("sync", KEEP, r)</code> runs while an earlier "sync" is still ENQUEUED. What happens?', options: ['Both run', 'The new request is ignored', 'The old one is cancelled'], a: 1, why: 'KEEP keeps the existing pending or running work. REPLACE would cancel it.' },
          { q: 'What is the shortest repeat interval for a <code>PeriodicWorkRequest</code>?', options: ['1 minute', '15 minutes', '1 hour'], a: 1, why: 'Shorter intervals are raised to 15 minutes.' },
        ],
        visual(el) {
          const RUN = 12; // simulated seconds per run
          let t = 0, net = true, charging = false, policy = 'KEEP', seq = 0, seen = false, misses = 0;
          const works = [];
          const queue = h('div', { class: 'plt-queue' });
          const clock = h('span', { class: 'clock' }, 't = 0 s');
          const o = out('A sync is enqueued. It waits for charging. Plug in the phone.');
          const NEEDS = { sync: ['network', 'charging'], upload: ['network'] };
          const missing = w => NEEDS[w.kind].filter(c => (c === 'network' ? !net : !charging));
          const finished = w => ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(w.state);
          function add(kind) {
            const w = { id: ++seq, kind, state: 'ENQUEUED', attempts: 0, readyAt: t, run: 0, info: '' };
            w.name = h('span', { class: 'plt-work-name' });
            w.tag = tag('');
            w.bar = h('span');
            w.infoEl = h('span', { class: 'plt-work-info' });
            w.el = h('div', { class: 'plt-work drop-in' }, w.name, w.tag, h('div', { class: 'plt-prog' }, w.bar), w.infoEl);
            works.push(w); queue.prepend(w.el);
            const done = works.filter(finished);
            while (works.length > 5 && done.length) { const old = done.shift(); works.splice(works.indexOf(old), 1); old.el.remove(); }
            paint(w);
            return w;
          }
          function paint(w) {
            w.name.textContent = `${w.kind === 'sync' ? 'SyncWorker' : 'UploadWorker'} #${w.id} · needs ${NEEDS[w.kind].join(' + ')}`;
            const kind = { ENQUEUED: 'wait', RUNNING: 'acc', SUCCEEDED: 'ok', FAILED: 'no', CANCELLED: 'no' }[w.state];
            if (w.tag.textContent !== w.state) { w.tag.textContent = w.state; w.tag.className = 'plt-tag plt-' + kind; replay(w.tag, 'pop'); }
            w.el.classList.toggle('plt-running', w.state === 'RUNNING');
            w.el.classList.toggle('plt-done', finished(w));
            let info = w.info;
            if (w.state === 'ENQUEUED') {
              if (t < w.readyAt) {
                info = `${w.info} Retry in ${w.readyAt - t} s.`;
                w.bar.className = 'plt-back'; w.bar.style.width = `${100 - ((w.readyAt - t) / w.backoff) * 100}%`;
              } else {
                const m = missing(w);
                info = (w.info ? w.info + ' ' : '') + (m.length ? `Waiting for ${m.join(' and ')}.` : 'Constraints met.');
                w.bar.className = ''; w.bar.style.width = '0%';
              }
            } else if (w.state === 'RUNNING') {
              info = `doWork() running, runAttemptCount = ${w.attempts - 1}.`;
              w.bar.className = ''; w.bar.style.width = `${(w.run / RUN) * 100}%`;
            } else { w.bar.style.width = w.state === 'SUCCEEDED' ? '100%' : '0%'; }
            w.infoEl.textContent = info;
          }
          function tick() {
            t++;
            clock.textContent = `t = ${t} s`;
            for (const w of works) {
              if (w.state === 'ENQUEUED' && t >= w.readyAt && !missing(w).length) {
                w.state = 'RUNNING'; w.attempts++; w.run = 0; w.info = '';
              } else if (w.state === 'RUNNING') {
                if (missing(w).length) {
                  w.state = 'ENQUEUED'; w.info = 'Stopped: a constraint broke mid-run, so doWork() was cancelled.';
                  say(o, `${w.kind === 'sync' ? 'SyncWorker' : 'UploadWorker'} #${w.id} stopped. It runs again from the start when the constraints hold.`);
                  replay(w.el, 'shake');
                } else if ((w.run += 1) >= RUN) {
                  if (w.kind === 'upload' && w.attempts < 3) {
                    w.backoff = 30 * 2 ** (w.attempts - 1);
                    w.state = 'ENQUEUED'; w.readyAt = t + w.backoff; w.info = `Result.retry(), backoff ${w.backoff} s.`;
                    say(o, `UploadWorker #${w.id} returned retry(). Exponential backoff: ${w.backoff} s.`);
                  } else {
                    w.state = 'SUCCEEDED'; w.info = 'Result.success().';
                    say(o, `<span class="good">${w.kind === 'sync' ? 'SyncWorker' : 'UploadWorker'} #${w.id} succeeded</span> on attempt ${w.attempts}.`);
                  }
                }
              }
              paint(w);
            }
          }
          const timer = setInterval(() => {
            if (!el.isConnected) { if (seen || ++misses > 30) clearInterval(timer); return; }
            seen = true; tick();
          }, 100);
          function enqueueSync() {
            const live = works.find(w => w.kind === 'sync' && !finished(w));
            if (live && policy === 'KEEP') { replay(live.el, 'shake'); say(o, `KEEP: "sync" #${live.id} is still ${live.state}, so the new request is ignored.`); return; }
            if (live) { live.state = 'CANCELLED'; live.info = 'Cancelled by REPLACE.'; paint(live); }
            const w = add('sync');
            say(o, live ? `REPLACE: cancelled #${live.id} and enqueued #${w.id}.` : `Enqueued "sync" #${w.id}.`);
          }
          function enqueueUpload() {
            const w = add('upload');
            say(o, `Enqueued UploadWorker #${w.id}. This one fails twice, then succeeds. Watch the backoff.`);
          }
          const nets = toggle('plt-net', 'Network', true, v => { net = v; say(o, v ? 'Network back. Waiting work can start.' : 'Network lost. Running work that needs it is stopped.'); works.forEach(paint); });
          const chg = toggle('plt-charge', 'Charging', false, v => { charging = v; say(o, v ? 'Charging. The sync constraint is met.' : 'Unplugged.'); works.forEach(paint); });
          const pol = choice('policy', ['KEEP', 'REPLACE'], policy, v => { policy = v; });
          add('sync');
          el.append(
            h('div', { class: 'controls plt-row' }, nets.el, chg.el, clock),
            h('div', { class: 'controls plt-row' }, pol.el, cmd('enqueueUniqueWork("sync", policy, req)', enqueueSync), cmd('enqueue(uploadRequest)', enqueueUpload)),
            queue, o,
            h('p', { class: 'tip' }, 'Time runs ten times faster than real life here.'));
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'fgs',
        title: 'Foreground services',
        tagline: 'Long work the user can see, with a type and a deadline.',
        level: 'advanced',
        body: `
<p>A foreground service is work the user is aware of and expects to continue, like playback, navigation, a call or a workout. It must show an ongoing notification. For deferrable jobs, use WorkManager instead.</p>
<p>Apps targeting Android 14 must give every foreground service a type. Declare <code>android:foregroundServiceType</code> on the <code>&lt;service&gt;</code>, request the matching permission such as <code>FOREGROUND_SERVICE_MEDIA_PLAYBACK</code>, and pass the type to <code>startForeground()</code>. After <code>startForegroundService()</code>, the service has about 5 seconds to call <code>startForeground()</code>, or the app crashes.</p>
<p>Since Android 12 you can’t start one while the app is in the background, apart from a few exemptions. A high priority FCM message is one of them. Normal priority is not. Apps targeting Android 15 also can’t start types like <code>mediaPlayback</code> from <code>BOOT_COMPLETED</code>. For audio, Media3’s <code>MediaSessionService</code> handles the foreground part for you.</p>`,
        code: `// AndroidManifest.xml
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
// <service android:name=".BriefingService"
//     android:foregroundServiceType="mediaPlayback"
//     android:exported="false" />

class BriefingService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // First thing: go foreground. The clock started at startForegroundService().
        ServiceCompat.startForeground(
            this, NOTIFICATION_ID, playingNotification(),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
        )
        player.play()
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

// From a click while the app is visible, or from a high priority FCM message:
ContextCompat.startForegroundService(context, Intent(context, BriefingService::class.java))`,
        remember: 'Declare the type, start from the foreground, call startForeground within 5 seconds.',
        terms: [
          { term: 'Foreground service', def: 'A service that shows an ongoing notification while it does work the user is aware of.' },
          { term: 'foregroundServiceType', def: 'The manifest attribute naming what a foreground service does, such as mediaPlayback or location; required for apps targeting Android 14+.' },
          { term: 'Background start restriction', def: 'The Android 12+ rule that an app in the background can’t start a foreground service unless an exemption applies, such as a high priority FCM message.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the manifest and the code agree on the service type.', code: '// <service android:name=".BriefingService"\n//     android:foregroundServiceType="[[mediaPlayback]]"\n//     android:exported="false" />\nServiceCompat.startForeground(\n    this, NOTIFICATION_ID, notification,\n    ServiceInfo.[[FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK]],\n)', why: 'The type passed to <code>startForeground()</code> must be one the manifest declares.' },
          { type: 'bug', prompt: 'The service crashes the moment it starts. Tap the line.', code: '// <service android:name=".BriefingService"\n//     android:foregroundServiceType="mediaPlayback" android:exported="false" />\noverride fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {\n    ServiceCompat.startForeground(this, NOTIFICATION_ID, playingNotification(),\n        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)\n    player.play()\n    return START_NOT_STICKY\n}', bug: 4, fix: '        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)', why: 'The manifest declares only mediaPlayback. Passing a type outside the declared set throws <code>IllegalArgumentException</code>.' },
        ],
        quiz: [
          { q: 'Your app is in the background. A <code>normal</code> priority FCM message arrives and your code calls <code>startForegroundService()</code>. Target is Android 14.', options: ['The service starts', 'It throws <code>ForegroundService<wbr>StartNotAllowed<wbr>Exception</code>', 'It waits until the app is opened'], a: 1, why: 'Only some cases are exempt from the background start ban. A high priority message is one of them, normal priority is not.' },
          { q: '<code>onStartCommand</code> makes an 8 second network call before <code>startForeground()</code>. What happens?', options: ['Nothing special', 'The app crashes with <code>ForegroundService<wbr>DidNotStartInTime<wbr>Exception</code>', 'It quietly becomes a background service'], a: 1, why: 'The service has about 5 seconds after startForegroundService(). Go foreground first, then do the work.' },
          { q: 'Targeting Android 14, the <code>&lt;service&gt;</code> has no <code>foregroundServiceType</code>. <code>startForeground()</code> is called.', options: ['It works as before', 'It throws <code>MissingForeground<wbr>ServiceType<wbr>Exception</code>', 'The type defaults to dataSync'], a: 1, why: 'Android 14 requires a declared type for every foreground service.' },
        ],
        visual(el) {
          const FROM = {
            tap: { label: 'Button tap (app visible)', ok: 'The app is visible, so a foreground start is allowed.' },
            high: { label: 'High priority FCM (background)', ok: 'A high priority FCM message gives a short exemption from the background start ban.' },
            normal: { label: 'Normal priority FCM (background)', no: 'ForegroundServiceStartNotAllowedException: the app is in the background and a normal priority message gives no exemption.' },
            boot: { label: 'BOOT_COMPLETED receiver', no: 'ForegroundServiceStartNotAllowedException: apps targeting Android 15 can’t start a mediaPlayback service from BOOT_COMPLETED.' },
          };
          const MAX = 7, LIMIT = 5;
          let from = 'tap', declared = true, quick = true, running = false, busy = false;
          const ph = phone();
          const shade = h('div', { class: 'plt-shade' });
          ph.screen.append(h('p', { class: 'plt-shade-title' }, 'Notification shade'), shade);
          const bar = h('div', { class: 'bar run', style: 'left:0;width:0' });
          const cursor = h('div', { class: 'cursor', style: 'left:0' });
          const track = h('div', { class: 'lane-track' }, bar, h('div', { class: 'plt-deadline', style: `left:${(LIMIT / MAX) * 100}%` }), cursor);
          const clock = h('span', { class: 'clock' }, '0.0 s');
          const o = out('Pick where the start comes from, then call startForegroundService().');
          const setT = s => { const p = `${Math.min(s / MAX, 1) * 100}%`; cursor.style.left = p; bar.style.width = p; clock.textContent = `${s.toFixed(1)} s`; };
          let icon = null;
          function fail(msg) { replay(ph.dev, 'shake'); bar.style.background = 'var(--err)'; say(o, `<span class="bad">crash:</span> ${msg}`); busy = false; }
          async function start() {
            if (busy) return;
            if (running) { say(o, 'Already running. Calling it again just delivers another onStartCommand().'); return; }
            busy = true; bar.style.background = ''; setT(0);
            const f = FROM[from];
            if (f.no) { await sleep(300); fail(f.no); return; }
            say(o, `${f.ok} onStartCommand() runs. The 5 second clock is ticking.`);
            const callAt = quick ? 0.4 : 6;
            for (let s = 0; ; s += 0.2) {
              setT(s);
              if (s >= LIMIT && !quick) { fail('ForegroundServiceDidNotStartInTimeException: startForeground() was not called within 5 seconds.'); return; }
              if (s >= callAt) break;
              await sleep(80);
              if (!el.isConnected) return;
            }
            if (!declared) { fail('MissingForegroundServiceTypeException: apps targeting Android 14 must declare android:foregroundServiceType on the &lt;service&gt;.'); return; }
            running = true;
            bar.style.background = 'var(--ok)';
            icon = h('span', { class: 'plt-ico plt-ongoing pop' }); ph.icons.append(icon);
            shade.replaceChildren(note('ongoing · mediaPlayback', 'Morning briefing', 'Playing. Pause · Stop', 'plt-fg drop-in'));
            say(o, '<span class="good">foreground:</span> startForeground() in time, with the declared type. The ongoing notification shows while it runs.');
            busy = false;
          }
          function stop() {
            if (busy) return;
            if (!running) { say(o, 'Nothing is running.'); return; }
            running = false; if (icon) icon.remove();
            const n = shade.firstElementChild; if (n) { n.classList.add('leave'); setTimeout(() => n.remove(), 450); }
            setT(0); bar.style.background = '';
            say(o, 'stopSelf(): the service ends and its notification goes away.');
          }
          const froms = choice('started from', Object.keys(FROM), from, v => { if (busy) return false; from = v; }, v => FROM[v].label);
          const dec = toggle('plt-fgs-type', 'Manifest declares foregroundServiceType', true, v => { declared = v; });
          const fast = toggle('plt-fgs-quick', 'Call startForeground() first', true, v => { quick = v; });
          el.append(froms.el,
            h('div', { class: 'plt-split' },
              h('div', { class: 'plt-col' },
                h('div', { class: 'controls plt-row' }, dec.el, fast.el),
                h('div', { class: 'controls plt-row' }, cmd('startForegroundService(intent)', start), cmd('stopSelf()', stop)),
                h('div', { class: 'timeline' },
                  h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'clock'), track),
                  h('div', { class: 'plt-lane-note' }, h('span', {}, 'red line: 5 s limit'), clock))),
              ph.dev),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'receivers',
        title: 'Broadcast receivers and system events',
        tagline: 'Who hears a broadcast depends on how the receiver was registered.',
        level: 'advanced',
        body: `
<p>A <code>BroadcastReceiver</code> reacts to system events or to messages from apps. Declare it in the manifest and the system can start your process to deliver. Register it from code with a Context, and it hears broadcasts only while it is registered.</p>
<p>Since Android 8, manifest receivers don’t get most implicit broadcasts, such as <code>ACTION_POWER_CONNECTED</code>. A short exempt list remains, including <code>BOOT_COMPLETED</code> and <code>LOCALE_CHANGED</code>. Context-registered receivers still get them. Explicit broadcasts, sent to a package or class, are not limited.</p>
<p>For apps targeting Android 14, a context-registered receiver that listens for anything other than system broadcasts must pass <code>RECEIVER_EXPORTED</code> or <code>RECEIVER_NOT_EXPORTED</code>, or registering throws. Use not exported unless another app has to reach it. <code>onReceive()</code> runs on the main thread, so keep it short and hand real work to WorkManager.</p>`,
        code: `// Manifest receivers: only for exempt broadcasts like BOOT_COMPLETED.
// <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
// <receiver android:name=".BootReceiver" android:exported="false">
//     <intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>
// </receiver>
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        // Main thread, short window: hand real work to WorkManager.
        WorkManager.getInstance(context).enqueueUniqueWork("sync", ExistingWorkPolicy.KEEP, syncRequest)
    }
}

// Context-registered: lives exactly as long as the registration.
class MainActivity : ComponentActivity() {
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) = refreshBadges()
    }

    override fun onStart() {
        super.onStart()
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_POWER_CONNECTED)
            addAction(ACTION_REFRESH)               // your own app's broadcast
        }
        ContextCompat.registerReceiver(this, receiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
    }

    override fun onStop() {
        unregisterReceiver(receiver)
        super.onStop()
    }
}

// Talking to yourself: name the package so the broadcast is explicit.
sendBroadcast(Intent(ACTION_REFRESH).setPackage(packageName))`,
        remember: 'Manifest receivers wake you up for a short list. Context receivers hear more, only while registered.',
        terms: [
          { term: 'BroadcastReceiver', def: 'A component whose onReceive runs on the main thread when a matching broadcast Intent is sent.' },
          { term: 'Implicit broadcast', def: 'A broadcast that names no package or class, which manifest receivers mostly can’t receive since Android 8.' },
          { term: 'RECEIVER_NOT_EXPORTED', def: 'A registerReceiver flag that hides a context-registered receiver from other apps; it or RECEIVER_EXPORTED is required on Android 14+ for non-system broadcasts.' },
          { term: 'goAsync', def: 'A BroadcastReceiver call that keeps the broadcast alive after onReceive returns, for a short piece of async work.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Listen for your own app’s refresh broadcast while the screen is visible.', code: 'override fun onStart() {\n    super.onStart()\n    ContextCompat.[[registerReceiver]](this, receiver, IntentFilter(ACTION_REFRESH),\n        ContextCompat.[[RECEIVER_NOT_EXPORTED]])\n}\noverride fun [[onStop]]() {\n    unregisterReceiver(receiver)\n    super.onStop()\n}', why: 'Register and unregister in a matching pair of callbacks. Only your app sends this action, so keep it not exported.' },
          { type: 'bug', prompt: 'A partner app sends <code>com.partner.SYNC_DONE</code>, but your receiver never fires. Tap the line.', code: '// Partner app: sendBroadcast(Intent("com.partner.SYNC_DONE"))\noverride fun onStart() {\n    super.onStart()\n    val filter = IntentFilter("com.partner.SYNC_DONE")\n    ContextCompat.registerReceiver(this, receiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)\n}\noverride fun onStop() {\n    unregisterReceiver(receiver)\n    super.onStop()\n}', bug: 4, fix: '    ContextCompat.registerReceiver(this, receiver, filter, ContextCompat.RECEIVER_EXPORTED)', why: 'A not exported receiver ignores broadcasts from other apps. This one must be exported, and then you should check who sent it, for example with a signature permission.' },
        ],
        quiz: [
          { q: 'Your app targets Android 15 and declares a manifest receiver for <code>ACTION_POWER_CONNECTED</code>. The user plugs in. What happens?', options: ['onReceive never runs', 'onReceive runs', 'The app crashes'], a: 0, why: 'It is an implicit broadcast and not on the exempt list. Register it from code instead.' },
          { q: 'Targeting Android 14, you call <code>registerReceiver</code> for a custom action without an exported flag. What happens?', options: ['It defaults to exported', 'It throws <code>SecurityException</code>', 'It defaults to not exported'], a: 1, why: 'For non-system broadcasts, apps targeting Android 14 must choose RECEIVER_EXPORTED or RECEIVER_NOT_EXPORTED.' },
          { q: 'Which thread does <code>onReceive()</code> run on by default?', options: ['A background thread', 'The main thread', 'A coroutine on Dispatchers.IO'], a: 1, why: 'That is why long work there causes ANRs. Use goAsync for a few seconds of work, or WorkManager.' },
        ],
        visual(el) {
          let registered = true, flag = 'NOT_EXPORTED', busy = false;
          const mkRx = (name, filter) => {
            const log = h('div', { class: 'plt-log' });
            const box = h('div', { class: 'plt-rx' }, h('span', { class: 'plt-rx-name' }, name), h('span', { class: 'plt-filter' }, 'filter: ' + filter), log);
            return { box, log };
          };
          const man = mkRx('BootReceiver (manifest)', 'BOOT_COMPLETED, POWER_CONNECTED');
          const ctx = mkRx('receiver in MainActivity (context)', 'POWER_CONNECTED, ACTION_REFRESH, com.partner.SYNC_DONE');
          const status = tag('');
          const o = out('MainActivity is started and its receiver is registered. Send a broadcast.');
          const paintStatus = () => { status.textContent = registered ? `registered · ${flag}` : 'not registered'; status.className = 'plt-tag ' + (registered ? 'plt-ok' : 'plt-no'); };
          const flags = choice('flag', ['NOT_EXPORTED', 'EXPORTED', 'none'], flag, v => {
            flag = v;
            if (registered) { registered = false; register(true); }
          }, v => (v === 'none' ? 'no flag' : 'RECEIVER_' + v));
          const reg = toggle('plt-rx-reg', 'MainActivity started (registered)', true, (v, input) => {
            if (v) register(false); else { registered = false; paintStatus(); say(o, 'onStop(): unregisterReceiver(receiver).'); }
            input.checked = registered;
          });
          function register(re) {
            if (flag === 'none') {
              registered = false; paintStatus(); reg.input.checked = false; replay(ctx.box, 'shake');
              say(o, '<span class="bad">SecurityException:</span> one of RECEIVER_EXPORTED or RECEIVER_NOT_EXPORTED should be specified when a receiver isn’t registered only for system broadcasts.');
              return;
            }
            registered = true; reg.input.checked = true; paintStatus(); replay(status, 'pop');
            say(o, `${re ? 'Re-registered' : 'onStart(): registered'} with RECEIVER_${flag}.`);
          }
          const EVENTS = [
            { src: 'system: BOOT_COMPLETED', run() {
              const was = registered; registered = false; reg.input.checked = false; paintStatus();
              return [['ok', 'onReceive(). The system started your process for it. BOOT_COMPLETED is exempt.'],
                ['no', was ? 'Not registered: the reboot killed MainActivity and its registration.' : 'Not registered.']];
            } },
            { src: 'system: ACTION_POWER_CONNECTED', run: () => [
              ['no', 'Skipped: implicit broadcast, not exempt. Manifest receivers stopped getting it in Android 8.'],
              registered ? ['ok', 'onReceive(). System broadcast, so the exported flag doesn’t matter.'] : ['no', 'Not registered.']] },
            { src: 'sendBroadcast(Intent(ACTION_REFRESH).setPackage(packageName))', run: () => [
              ['', 'Not in this filter.'],
              registered ? ['ok', 'onReceive(). Your own app, so it arrives either way.'] : ['no', 'Not registered.']] },
            { src: 'partner app: sendBroadcast(Intent("com.partner.SYNC_DONE"))', run: () => [
              ['', 'Not in this filter.'],
              !registered ? ['no', 'Not registered.'] : flag === 'EXPORTED' ? ['ok', 'onReceive(). Exported, so other apps reach it. Check who sent it.'] : ['no', 'Blocked: RECEIVER_NOT_EXPORTED hides it from other apps.']] },
          ];
          async function fire(ev) {
            if (busy) return; busy = true;
            const results = ev.run();
            say(o, `${hl(ev.src)}`);
            for (const [i, rx] of [man, ctx].entries()) {
              const [k, text] = results[i];
              rx.box.classList.remove('plt-hit', 'plt-miss');
              if (k) { rx.box.classList.add(k === 'ok' ? 'plt-hit' : 'plt-miss'); replay(rx.box, k === 'ok' ? 'pop' : 'shake'); }
              rx.log.prepend(h('div', { class: 'drop-in' }, tag(k === 'ok' ? 'delivered' : k === 'no' ? 'missed' : 'n/a', k === 'ok' ? 'ok' : k === 'no' ? 'no' : ''), h('span', {}, text)));
              while (rx.log.children.length > 3) rx.log.lastElementChild.remove();
              await sleep(350);
            }
            busy = false;
          }
          paintStatus();
          el.append(
            h('div', { class: 'plt-events' }, h('span', { class: 'plt-label' }, 'Send a broadcast'), EVENTS.map(ev => cmd(ev.src, () => fire(ev)))),
            h('div', { class: 'controls plt-row' }, flags.el),
            h('div', { class: 'controls plt-row' }, reg.el, status),
            h('div', { class: 'plt-pair' }, man.box, ctx.box),
            o);
        },
      },
    ],
  });
})();
