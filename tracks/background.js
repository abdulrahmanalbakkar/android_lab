/* Background work track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed plt-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
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
.plt-note.plt-fg { border-color: var(--warm); }

/* step log (also in the push track) */
.plt-steps { display: grid; gap: 6px; padding: 12px; min-height: 110px; align-content: start; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.plt-step { display: flex; gap: 10px; align-items: baseline; padding: 7px 10px; border-radius: 9px; border: 1px solid var(--line); background: var(--surface); font-size: 0.9rem; line-height: 1.4; min-width: 0; }
.plt-step b { flex: none; width: 74px; font: 600 0.74rem var(--mono); color: var(--accent); }
.plt-step span { min-width: 0; overflow-wrap: anywhere; }
.plt-step.plt-good b { color: var(--ok); }
.plt-step.plt-bad b { color: var(--err); }
.plt-step.plt-wait b { color: var(--warm); }

/* table and empty state (also in the push track) */
.plt-table { display: grid; gap: 4px; min-width: 0; }
.plt-tr { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 9px; border: 1px solid var(--line); background: var(--surface); font: 500 0.76rem var(--mono); min-width: 0; }
.plt-tr > span { min-width: 0; overflow-wrap: anywhere; }
.plt-tr.plt-th { background: none; border-color: transparent; font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.plt-tr.plt-gone { opacity: 0.4; text-decoration: line-through; }
.plt-empty { color: var(--muted); font-size: 0.88rem; text-align: center; margin: auto; }

/* 1 WorkManager */
.plt-queue { display: grid; gap: 8px; min-width: 0; }
.plt-work { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.plt-work.plt-running { border-color: var(--accent); }
.plt-work.plt-done { opacity: 0.7; }
.plt-work-name { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; }
.plt-work-info { grid-column: 1 / -1; font-size: 0.84rem; color: var(--muted); overflow-wrap: anywhere; }
.plt-prog { grid-column: 1 / -1; height: 6px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.plt-prog span { display: block; height: 100%; width: 0; background: var(--accent); transition: width 0.1s linear; }
.plt-prog span.plt-back { background: var(--warm); }

/* 2 foreground service */
.plt-deadline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--err); }
.plt-lane-note { font: 500 0.72rem var(--mono); color: var(--muted); display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }

/* 3 receivers */
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

/* depth: WorkManager chain */
.plt-chain { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.plt-chain .plt-work { grid-template-columns: minmax(0, 1fr); }
.plt-data { font: 500 0.72rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }

@media (max-width: 640px) {
  .plt-split { grid-template-columns: minmax(0, 1fr); }
}
/* depth pass 2 */
.plt-bg2-meter { height: 12px; border-radius: 99px; background: var(--sunk); overflow: hidden; min-width: 0; }
.plt-bg2-meter span { display: block; height: 100%; width: 0; background: var(--accent); border-radius: 99px; transition: width 0.1s linear, background 0.3s; }
.plt-bg2-meter.plt-bg2-full span { background: var(--err); }
.plt-bg2-mx { display: grid; grid-template-columns: minmax(70px, auto) repeat(2, minmax(0, 1fr)); gap: 6px; align-items: center; min-width: 0; }
.plt-bg2-rh { font: 600 0.76rem var(--mono); overflow-wrap: anywhere; }
.plt-bg2-cell { font: 700 0.78rem var(--mono); padding: 8px 6px; border-radius: 9px; border: 2px solid var(--line); background: var(--bg); color: var(--muted); cursor: pointer; min-width: 0; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s; }
.plt-bg2-cell:hover { border-color: var(--accent); }
.plt-bg2-cell:focus-visible { outline: 2px solid var(--accent); }
.plt-bg2-cell.plt-bg2-ok { border-color: var(--ok); background: var(--ok-soft); color: var(--ok); }
.plt-bg2-cell.plt-bg2-no { border-color: var(--err); background: var(--err-soft); color: var(--err); }
.plt-bg2-cell.plt-bg2-wait { border-color: var(--warm); background: var(--warm-soft); color: var(--warm); }
`;

  // ─── Depth pass 2: foreground services, receivers ──────────────────────
  const bgLine = (o, html) => o.append(h('div', { class: 'line drop-in', html }));
  const bgStep = (box, k, who, text) => {
    box.append(h('div', { class: `plt-step drop-in ${k ? 'plt-' + k : ''}` }, h('b', {}, who), h('span', { html: text })));
    while (box.children.length > 6) box.firstElementChild.remove();
  };

  const fgsDepth = {
    deeper: [
      {
        title: 'Some types run on a clock',
        body: `<p><code>shortService</code>, added in Android 14, is for short critical work such as finishing a save the user started. It runs about 3 minutes from <code>startForeground()</code>. Apps targeting Android 15 also get a budget for <code>dataSync</code> and <code>mediaProcessing</code>: 6 hours in any 24 hours, per type, shared by all your services of that type. The budget resets when the user brings your app to the foreground.</p>
<p>When the time is up, the system calls <code>onTimeout()</code> and the service has a few seconds to stop. A <code>dataSync</code> service that keeps going crashes the app with <code>RemoteServiceException</code>. A <code>shortService</code> that keeps going gets an ANR. Once the budget is gone, starting another <code>dataSync</code> service from the background throws <code>ForegroundServiceStartNotAllowedException</code>.</p>`,
        code: `class SyncService : Service() {
    // Android 15+: called when the dataSync or mediaProcessing budget runs out
    override fun onTimeout(startId: Int, fgsType: Int) {
        SyncCheckpoint.save()          // the next run picks up from here
        stopSelf(startId)
    }
    // Android 14: the variant shortService uses
    override fun onTimeout(startId: Int) = stopSelf(startId)
}`,
        visual(el) {
          const LIMIT = 360, SHORT = 3;
          let type = 'dataSync', used = 240, handle = true, busy = false;
          const fill = h('span');
          const meter = h('div', { class: 'plt-bg2-meter' }, fill);
          const meterLabel = h('span', { class: 'plt-label' });
          const steps = h('div', { class: 'plt-steps' });
          const step = (k, who, text) => bgStep(steps, k, who, text);
          const types = choice('type', ['dataSync', 'shortService'], type, v => { if (busy) return false; type = v; paint(); steps.replaceChildren(); step('', 'Ready', v === 'dataSync' ? 'Budget: 6 h of dataSync per 24 h.' : 'Limit: about 3 minutes from startForeground().'); });
          const tt = toggle('plt-bg2-ontimeout', 'onTimeout() calls stopSelf()', true, (v, input) => { if (busy) { input.checked = handle; return; } handle = v; });
          const hm = m => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min`;
          function paint(shortT = 0) {
            if (type === 'dataSync') { fill.style.width = (Math.min(used, LIMIT) / LIMIT) * 100 + '%'; meterLabel.textContent = `dataSync used today: ${hm(used)} of 6 h`; meter.classList.toggle('plt-bg2-full', used >= LIMIT); }
            else { fill.style.width = (Math.min(shortT, SHORT) / SHORT) * 100 + '%'; meterLabel.textContent = `shortService running: ${shortT.toFixed(1)} of about 3 min`; meter.classList.toggle('plt-bg2-full', shortT >= SHORT); }
          }
          async function animate(from, to, onT) {
            const t0 = performance.now(), D = 1400;
            for (;;) {
              const p = Math.min(1, (performance.now() - t0) / D);
              if (onT(from + (to - from) * p) === false) return true;
              if (p >= 1) return true;
              await sleep(30); if (!el.isConnected) return false;
            }
          }
          async function start() {
            if (busy) return; busy = true;
            try {
              steps.replaceChildren();
              if (type === 'dataSync') {
                if (used >= LIMIT) {
                  replay(meter, 'shake');
                  step('bad', 'System', 'ForegroundServiceStartNotAllowedException: Time limit already exhausted for foreground service type dataSync');
                  step('', 'Fix', 'Wait until the user opens the app, or move the sync to WorkManager.');
                  return;
                }
                step('', 'App', '<code>startForeground()</code> with type dataSync: a 2 hour sync');
                let hit = false;
                const ok = await animate(used, used + 120, m => { used = Math.min(m, LIMIT); paint(); if (m >= LIMIT) { hit = true; return false; } });
                if (!ok) return;
                if (!hit) { step('good', 'App', `Sync finished. ${hm(LIMIT - used)} of budget left today.`); return; }
                step('wait', 'System', '<code>onTimeout(startId, FOREGROUND_SERVICE_TYPE_DATA_SYNC)</code>: the budget is used up');
                await sleep(600); if (!el.isConnected) return;
                if (handle) step('good', 'App', 'Saved a checkpoint and called <code>stopSelf()</code>. The rest can run when the budget is back.');
                else { replay(meter, 'shake'); step('bad', 'System', 'RemoteServiceException: A foreground service of type dataSync did not stop within its timeout'); }
              } else {
                step('', 'App', '<code>startForeground()</code> with type shortService: a 4 minute upload');
                let hit = false;
                const ok = await animate(0, 4, m => { paint(Math.min(m, SHORT)); if (m >= SHORT) { hit = true; return false; } });
                if (!ok || !hit) return;
                step('wait', 'System', '<code>onTimeout(startId)</code> after about 3 minutes');
                await sleep(600); if (!el.isConnected) return;
                if (handle) step('good', 'App', 'Stopped in time. Hand the rest to WorkManager, which can resume it later.');
                else { replay(meter, 'shake'); step('bad', 'System', 'The app goes to the cached state, then gets an ANR that names FOREGROUND_SERVICE_TYPE_SHORT_SERVICE.'); }
              }
            } finally { busy = false; }
          }
          function openApp() {
            if (busy) return;
            if (type === 'dataSync') { used = 0; paint(); replay(meter, 'pop'); steps.replaceChildren(); step('good', 'User', 'Opened the app. The dataSync budget is back to 6 h.'); }
            else { steps.replaceChildren(); step('', 'User', 'Opened the app. Calling startForeground() again while visible would give another 3 minutes.'); }
          }
          paint();
          step('', 'Ready', '4 h of dataSync already used today. Start a 2 hour sync.');
          el.append(types.el,
            h('div', { class: 'controls plt-row' }, tt.el),
            h('div', { class: 'controls plt-row' }, cmd('startForeground(...)', start), cmd('// user opens the app', openApp)),
            meterLabel, meter, steps);
        },
      },
      {
        title: 'While-in-use types need the app in front',
        body: `<p><code>camera</code>, <code>microphone</code> and <code>location</code> services rely on while-in-use permissions, which your app only holds while it is in the foreground. On Android 14+, creating one of these services from the background throws <code>SecurityException</code>, even when the background start itself is allowed, such as after a high priority FCM message. Location is fine if the user granted background location.</p>
<p>On Android 13 and lower the service starts, but it gets no access, and the first camera or location call fails later. Either way, start these services while the user is looking at your app.</p>`,
        visual(el) {
          const TYPES = ['mediaPlayback', 'location', 'camera'];
          const SITS = { vis: 'App visible', bg: 'High priority FCM, app in background' };
          let bgLoc = false, a13 = false, busy = false;
          const cells = {};
          const steps = h('div', { class: 'plt-steps' });
          const step = (k, who, text) => bgStep(steps, k, who, text);
          function result(t, s) {
            if (s === 'vis') return ['ok', 'started', `<code>${t}</code> started. The app is visible, so it holds its permissions right now.`];
            if (t === 'mediaPlayback') return ['ok', 'started', 'Started. The high priority message allows the start, and playback needs no while-in-use permission.'];
            if (t === 'location' && bgLoc) return ['ok', 'started', 'Started. ACCESS_BACKGROUND_LOCATION is granted, so the app has location in the background.'];
            if (a13) return ['wait', 'no access', `Android 13: the service starts, but ${t === 'camera' ? 'opening the camera' : 'requesting location'} fails because the app has no access from the background.`];
            return ['no', 'SecurityException', `SecurityException at <code>startForeground()</code>: the app is in the background, so it doesn’t hold the ${t === 'camera' ? 'CAMERA' : 'location'} permission right now.`];
          }
          const grid = h('div', { class: 'plt-bg2-mx', role: 'group', 'aria-label': 'Service type by situation' },
            h('span', { class: 'plt-label' }, ''), Object.values(SITS).map(s => h('span', { class: 'plt-label' }, s)),
            TYPES.flatMap(t => [h('span', { class: 'plt-bg2-rh' }, t), ...Object.keys(SITS).map(s => (cells[t + s] = h('button', { class: 'plt-bg2-cell', onclick: () => run(t, s) }, '?')))]));
          function paint() {
            TYPES.forEach(t => Object.keys(SITS).forEach(s => { const c = cells[t + s]; if (c.dataset.done) { const [k, label] = result(t, s); c.textContent = label; c.className = `plt-bg2-cell plt-bg2-${k}`; } }));
          }
          async function run(t, s) {
            if (busy) return; busy = true;
            try {
              const [k, label, text] = result(t, s), c = cells[t + s];
              steps.replaceChildren();
              step('', 'App', `${s === 'bg' ? 'In <code>onMessageReceived()</code>: ' : 'On a button tap: '}<code>startForegroundService()</code>, type <code>${t}</code>`);
              await sleep(450); if (!el.isConnected) return;
              c.dataset.done = '1'; c.textContent = label; c.className = `plt-bg2-cell plt-bg2-${k}`; replay(c, k === 'ok' ? 'pop' : 'shake');
              step(k === 'ok' ? 'good' : k === 'no' ? 'bad' : 'wait', k === 'ok' ? 'System' : 'Result', text);
            } finally { busy = false; }
          }
          const tl = toggle('plt-bg2-bgloc', 'ACCESS_BACKGROUND_LOCATION granted', false, (v, input) => { if (busy) { input.checked = bgLoc; return; } bgLoc = v; paint(); });
          const ta = toggle('plt-bg2-a13', 'device runs Android 13', false, (v, input) => { if (busy) { input.checked = a13; return; } a13 = v; paint(); });
          step('', 'Ready', 'Each cell starts one service type in one situation. Tap a cell.');
          el.append(h('div', { class: 'controls plt-row' }, tl.el, ta.el), grid, steps);
        },
      },
      {
        title: 'Users can stop it, so save as you go',
        body: `<p>Since Android 13, users can stop any app that runs a foreground service from the Task Manager in quick settings. That stops the whole app, not just the service, and your code gets no callback first. Write progress as you go, so the next run resumes instead of starting over.</p>
<p>For a large transfer the user started, Android 14 adds user-initiated data transfer jobs. They run through <code>JobScheduler</code> with a notification, can run for a long time when the system allows it, and need no foreground service type. Schedule one while your app is visible.</p>`,
        code: `// Needs <uses-permission android:name="android.permission.RUN_USER_INITIATED_JOBS" />
val job = JobInfo.Builder(DOWNLOAD_JOB_ID, ComponentName(context, DownloadJobService::class.java))
    .setUserInitiated(true)                                  // Android 14+
    .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
    .setEstimatedNetworkBytes(downloadBytes, 0)
    .build()
context.getSystemService(JobScheduler::class.java).schedule(job)

// In DownloadJobService.onStartJob(), right away:
// setNotification(params, NOTIFICATION_ID, progressNotification(), JobService.JOB_END_NOTIFICATION_POLICY_REMOVE)`,
      },
    ],
    underHood: {
      body: `<p><code>startForegroundService()</code> goes to the activity manager in <code>system_server</code>. It records that this service still owes a <code>startForeground()</code> call and starts a timer. When the call arrives, it checks the type against your manifest and your current permissions, attaches the notification, and raises your process to foreground service priority, so the low memory killer leaves it alone almost as long as the visible app.</p>
<p>The type also turns on per-type bookkeeping in the system: the time budgets for <code>dataSync</code>, <code>mediaProcessing</code> and <code>shortService</code>, and the while-in-use permission checks for camera, microphone and location.</p>`,
    },
    mistakes: [
      {
        title: 'Starting a service from FCM without checking priority',
        bad: `override fun onMessageReceived(message: RemoteMessage) {
    ContextCompat.startForegroundService(this, playIntent)
}`,
        good: `override fun onMessageReceived(message: RemoteMessage) {
    if (message.priority == RemoteMessage.PRIORITY_HIGH) {
        ContextCompat.startForegroundService(this, playIntent)
    } else {
        Notifier.showTapToPlay(this, message)   // a tap is a user action, which allows the start
    }
}`,
        why: 'FCM can deliver a message sent as high priority as normal when the app rarely shows something for them. A downgraded message gives no exemption, and the start throws <code>ForegroundServiceStartNotAllowedException</code>.',
      },
      {
        title: 'A foreground service for work that can wait',
        bad: `// Every hour, while the app is in use
ContextCompat.startForegroundService(context, Intent(context, SyncService::class.java))`,
        good: `val sync = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.HOURS)
    .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
    .build()
WorkManager.getInstance(context)
    .enqueueUniquePeriodicWork("sync", ExistingPeriodicWorkPolicy.KEEP, sync)`,
        why: 'A sync the user doesn’t watch is not foreground work. It shows a notification for nothing, burns the dataSync budget, and Play asks you to justify each type. WorkManager runs it when conditions allow.',
      },
    ],
  };

  const receiversDepth = {
    deeper: [
      {
        title: 'goAsync for a few seconds of async work',
        body: `<p>When <code>onReceive()</code> returns, the system treats the receiver as finished. If nothing else in your process is active, the system can kill it at any moment to free memory, together with any thread or coroutine you started. <code>goAsync()</code> keeps the broadcast open until you call <code>finish()</code> on the result, so a short job can leave the main thread. The system still expects you to finish quickly, in under 10 seconds.</p>
<p>For longer work, or work that must not be lost, enqueue it with WorkManager. Run the same upload three ways.</p>`,
        code: `class ScoreReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val pending = goAsync()
        appScope.launch(Dispatchers.IO) {
            try {
                scoreCache.update(intent.getStringExtra("score"))
            } finally {
                pending.finish()               // always, or the broadcast times out
            }
        }
    }
}`,
        visual(el) {
          const SEC = 320, TOTAL = 6;
          const MODES = { launch: 'launch { } and return', async: 'goAsync() + finish()', work: 'WorkManager.enqueue()' };
          let mode = 'launch', pressure = true, busy = false;
          const mkLane = name => { const track = h('div', { class: 'lane-track' }); return { track, el: h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track) }; };
          const main = mkLane('onReceive'), bg = mkLane('upload');
          const proc = tag('process: idle');
          const clock = h('span', { class: 'clock' }, '0.0 s');
          const o = out('A manifest receiver woke the app. It has a 3 second upload to do. Pick a way and run.');
          const modes = choice('style', Object.keys(MODES), mode, v => { if (busy) return false; mode = v; }, v => MODES[v]);
          const pt = toggle('plt-bg2-pressure', 'memory pressure (cached processes get killed)', true, (v, input) => { if (busy) { input.checked = pressure; return; } pressure = v; });
          const bar = (lane, cls, s) => { const b = h('span', { class: `bar ${cls}`, style: `left:${(s / TOTAL) * 100}%;width:0` }); lane.track.append(b); return b; };
          const setProc = (t, k) => { if (proc.textContent !== 'process: ' + t) { proc.textContent = 'process: ' + t; proc.className = 'plt-tag ' + (k ? 'plt-' + k : ''); replay(proc, 'pop'); } };
          async function run() {
            if (busy) return; busy = true;
            try {
              [main, bg].forEach(l => l.track.replaceChildren());
              say(o, hl(mode === 'work' ? 'WorkManager.getInstance(context).enqueue(upload)' : mode === 'async' ? 'val pending = goAsync(); appScope.launch { upload(); pending.finish() }' : 'appScope.launch { upload() }'));
              const rx = bar(main, 'run', 0);
              const killAt = pressure && mode !== 'async' ? 1.5 : null;
              const ws = mode === 'work' ? (killAt ? 2.2 : 0.3) : 0.1, we = ws + 3;
              const up = bar(bg, 'run', ws);
              let killed = false, said = new Set();
              const once = (k, f) => { if (!said.has(k)) { said.add(k); f(); } };
              const t0 = performance.now();
              for (;;) {
                const t = Math.min((performance.now() - t0) / SEC, TOTAL);
                clock.textContent = t.toFixed(1) + ' s';
                rx.style.width = (Math.min(t, 0.1) / TOTAL) * 100 + '%';
                const upEnd = killed && mode === 'launch' ? killAt : Math.min(t, we);
                if (t >= ws) up.style.width = (Math.max(0, upEnd - ws) / TOTAL) * 100 + '%';
                if (t < 0.1) setProc('running a receiver', 'acc');
                else if (mode === 'async' && t < we) setProc('running a receiver (goAsync)', 'acc');
                else if (killAt && t >= killAt && (mode === 'launch' || t < ws)) {
                  once('kill', () => { killed = true; setProc('killed', 'no'); bgLine(o, `${killAt.toFixed(1)} s: <span class="bad">the system killed the cached process</span>`); if (mode === 'launch') { up.style.background = 'var(--err)'; bgLine(o, 'The upload stopped halfway and nothing will retry it.'); } });
                } else if (mode === 'work' && t >= ws && t < we) { once('job', () => bgLine(o, killAt ? `${ws.toFixed(1)} s: JobScheduler started the process again for the work` : 'WorkManager started the work right away in the live process')); setProc('running a job', 'acc'); }
                else if (t >= 0.1 && t < we) setProc('cached', 'wait');
                else if (t >= we) setProc('cached', 'wait');
                if (t >= we && (!killed || mode === 'work')) once('done', () => bgLine(o, mode === 'async' ? '<span class="good">finish() at 3.1 s.</span> The process stayed important until then.' : mode === 'work' ? '<span class="good">upload done.</span> WorkManager survives the process dying.' : '<span class="good">upload done, by luck:</span> nothing needed the memory.'));
                if (t >= TOTAL) break;
                await sleep(30); if (!el.isConnected) return;
              }
            } finally { busy = false; }
          }
          el.append(modes.el,
            h('div', { class: 'controls plt-row' }, pt.el, cmd('sendBroadcast(scoreIntent)', run)),
            h('div', { class: 'plt-group' }, proc, clock),
            h('div', { class: 'timeline' }, main.el, bg.el),
            o);
        },
      },
      {
        title: 'Restrict who sends and who receives',
        body: `<p>An exported receiver accepts broadcasts from any app. To accept them only from your own apps, define a permission with <code>protectionLevel="signature"</code> and require it when you register. Only apps signed with your key can hold it, so only they can send to you.</p>
<p>It works the other way too. <code>sendBroadcast(intent, permission)</code> delivers only to receivers in apps that hold the permission. Without it, any app that registers for your action reads your extras.</p>`,
        code: `// Both apps' AndroidManifest.xml
// <permission android:name="com.example.permission.SYNC" android:protectionLevel="signature" />
// <uses-permission android:name="com.example.permission.SYNC" />

// Receiver: only holders of the permission can send to it
ContextCompat.registerReceiver(context, receiver, IntentFilter(ACTION_SYNC_DONE),
    "com.example.permission.SYNC", null, ContextCompat.RECEIVER_EXPORTED)

// Sender: only holders of the permission receive it
context.sendBroadcast(Intent(ACTION_SYNC_DONE), "com.example.permission.SYNC")`,
        visual(el) {
          let req = false, send = false, busy = false;
          const mkRx = (name, sub) => { const log = h('div', { class: 'plt-log' }); return { log, box: h('div', { class: 'plt-rx' }, h('span', { class: 'plt-rx-name' }, name), h('span', { class: 'plt-filter' }, sub), log) }; };
          const mine = mkRx('Your app’s receiver', 'exported, action SYNC_DONE');
          const comp = mkRx('Your companion app', 'signed with your key, registered for SYNC_DONE');
          const spy = mkRx('Unknown app', 'different key, registered for SYNC_DONE');
          const o = out('Nothing is restricted yet. Send from both sides.');
          const put = (rx, ok, text) => {
            rx.box.classList.remove('plt-hit', 'plt-miss'); rx.box.classList.add(ok ? 'plt-hit' : 'plt-miss'); replay(rx.box, ok ? 'pop' : 'shake');
            rx.log.prepend(h('div', { class: 'drop-in' }, tag(ok ? 'delivered' : 'blocked', ok ? 'ok' : 'no'), h('span', {}, text)));
            while (rx.log.children.length > 2) rx.log.lastElementChild.remove();
          };
          async function inbound(fromCompanion) {
            if (busy) return; busy = true;
            try {
              say(o, `${fromCompanion ? 'companion app' : 'unknown app'}: ${hl('sendBroadcast(Intent(ACTION_SYNC_DONE))')}`);
              await sleep(350); if (!el.isConnected) return;
              const ok = !req || fromCompanion;
              put(mine, ok, ok ? (req ? 'sender holds the permission' : `anyone can reach it${fromCompanion ? '' : ', including this app'}`) : 'sender lacks com.example.permission.SYNC');
            } finally { busy = false; }
          }
          async function outbound() {
            if (busy) return; busy = true;
            try {
              say(o, hl(send ? 'sendBroadcast(Intent(ACTION_SYNC_DONE), "com.example.permission.SYNC")' : 'sendBroadcast(Intent(ACTION_SYNC_DONE).putExtra("userId", id))'));
              await sleep(350); if (!el.isConnected) return;
              put(comp, true, send ? 'holds the permission' : 'registered for the action');
              await sleep(250); if (!el.isConnected) return;
              put(spy, !send, send ? 'can’t hold a signature permission' : 'read your extras too');
            } finally { busy = false; }
          }
          const tr = toggle('plt-bg2-reqperm', 'receiver requires the SYNC permission', false, (v, input) => { if (busy) { input.checked = req; return; } req = v; });
          const ts = toggle('plt-bg2-sendperm', 'send with the SYNC permission', false, (v, input) => { if (busy) { input.checked = send; return; } send = v; });
          el.append(
            h('span', { class: 'plt-label' }, 'Who can send to you'),
            h('div', { class: 'controls plt-row' }, tr.el, h('button', { class: 'cmd', onclick: () => inbound(true) }, 'companion app sends'), h('button', { class: 'cmd', onclick: () => inbound(false) }, 'unknown app sends')),
            mine.box,
            h('span', { class: 'plt-label' }, 'Who receives what you send'),
            h('div', { class: 'controls plt-row' }, ts.el, cmd('sendBroadcast(...)', outbound)),
            h('div', { class: 'plt-pair' }, comp.box, spy.box),
            o);
        },
      },
      {
        title: 'Cached apps get some broadcasts late',
        body: `<p>On Android 14, when your app is cached in the background, the system can queue broadcasts for your context-registered receivers instead of delivering them right away. When the app leaves the cached state, for example by coming back to the foreground, it gets the queue, and several copies of some broadcasts may be merged into one. Manifest receivers are not queued.</p>
<p>So don't count events by counting broadcasts. When one arrives, read the current state.</p>`,
        code: `override fun onReceive(context: Context, intent: Intent) {
    // Don't do level += 1 per broadcast; ask for the current value
    val battery = context.getSystemService(BatteryManager::class.java)
    updateBadge(battery.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY))
}`,
      },
    ],
    underHood: {
      body: `<p>Broadcasts go through the activity manager in <code>system_server</code>. For each one it collects the matching receivers: registered ones from its own list, manifest ones from the package manager. A manifest receiver may need your process started first, and the system creates a new instance of the receiver class for every broadcast. Then it calls <code>onReceive()</code> on your main thread and starts the timeout clock.</p>
<p>While <code>onReceive()</code> runs, or until a <code>goAsync()</code> result is finished, your process counts as running a receiver and gets high priority. After that its priority falls back to whatever else it is doing, which after a manifest wake-up is usually nothing.</p>`,
    },
    mistakes: [
      {
        title: 'Broadcasting private data implicitly',
        bad: `sendBroadcast(Intent(ACTION_LOGIN_DONE).putExtra("token", session.token))`,
        good: `sendBroadcast(Intent(ACTION_LOGIN_DONE).setPackage(packageName))
// inside one process, a SharedFlow is simpler than any broadcast`,
        why: 'An implicit broadcast reaches every app that registered for that action. Set the package, keep secrets out of extras, and skip broadcasts entirely for in-process events.',
      },
      {
        title: 'Listening for connectivity in the manifest',
        bad: `// <receiver android:name=".NetReceiver" android:exported="false">
//     <intent-filter>
//         <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
//     </intent-filter>
// </receiver>`,
        good: `connectivityManager.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
    override fun onAvailable(network: Network) = retryPending()
})
// for background work: a WorkManager network constraint`,
        why: 'Apps targeting Android 7 or later don’t receive <code>CONNECTIVITY_ACTION</code> through manifest receivers, and the action is deprecated. Use a network callback while running, or a constraint for deferred work.',
      },
      {
        title: 'Trusting what an exported receiver gets',
        bad: `override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getStringExtra("article_id")!!
    context.startActivity(articleIntent(context, id))
}`,
        good: `override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != ACTION_OPEN_ARTICLE) return
    val id = intent.getStringExtra("article_id")?.toLongOrNull() ?: return
    ArticleWork.prefetch(context, id)
}`,
        why: 'Any app can send an exported receiver any Intent. Check the action, validate every extra, and don’t start Activities from a receiver: since Android 10 background Activity starts are blocked anyway.',
      },
    ],
  };

  Lab.addTrack({
    id: 'background',
    title: 'Background work',
    description: 'WorkManager, foreground services and broadcast receivers, and the rules that decide when your code gets to run.',
    group: 'Going deeper', requires: ['android', 'coroutines'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
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
        deeper: [
          {
            title: 'Chains pass data and share their fate',
            body: `<p><code>beginWith(a).then(b).then(c)</code> runs work in order. The output <code>Data</code> of one worker becomes the input of the next, so a compress step can hand the file path to the upload step.</p>
<p>A chain stops at the first problem. If a worker returns <code>failure()</code>, every worker after it is marked FAILED without running. Cancel the chain and the rest becomes CANCELLED. A <code>retry()</code> only delays that one link.</p>`,
            code: `class CompressWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val src = inputData.getString("src") ?: return Result.failure()
        val out = Images.compress(src)
        return Result.success(workDataOf("path" to out))   // becomes UploadWorker's inputData
    }
}

WorkManager.getInstance(context)
    .beginUniqueWork("photo-$id", ExistingWorkPolicy.KEEP, compress)
    .then(upload)
    .then(cleanup)
    .enqueue()`,
            visual(el) {
              const STEPS = [
                { name: 'CompressWorker', out: 'path = /cache/p42.jpg' },
                { name: 'UploadWorker', out: 'url = /photos/42' },
                { name: 'CleanupWorker', out: '' },
              ];
              let fail = false, runId = 0, running = false;
              const o = out('Enqueue the chain. Then try it with a failing first step, or cancel it halfway.');
              const cards = STEPS.map(s => {
                const t = tag('');
                const data = h('span', { class: 'plt-data' });
                const bar = h('span');
                const box = h('div', { class: 'plt-work' }, h('span', { class: 'plt-work-name' }, s.name), t, h('div', { class: 'plt-prog' }, bar), data);
                return Object.assign({}, s, { t, data, bar, box });
              });
              const KIND = { ENQUEUED: 'wait', BLOCKED: '', RUNNING: 'acc', SUCCEEDED: 'ok', FAILED: 'no', CANCELLED: 'no' };
              const set = (c, st, data) => {
                c.state = st; c.t.textContent = st; c.t.className = 'plt-tag plt-' + KIND[st]; replay(c.t, 'pop');
                c.box.classList.toggle('plt-running', st === 'RUNNING');
                if (data != null) c.data.textContent = data;
              };
              const idle = () => cards.forEach((c, i) => { set(c, i ? 'BLOCKED' : 'ENQUEUED', i ? 'waits for the step before' : 'input: src = IMG_42.jpg'); c.bar.style.width = '0%'; });
              async function start() {
                if (running) { say(o, 'The chain is still running. Cancel it or wait.'); return; }
                running = true; const me = ++runId;
                idle();
                say(o, hl('beginWith(compress).then(upload).then(cleanup).enqueue()'));
                for (let i = 0; i < cards.length; i++) {
                  const c = cards[i];
                  set(c, 'RUNNING');
                  for (let p = 0; p <= 100; p += 10) {
                    c.bar.style.width = p + '%';
                    await sleep(90);
                    if (!el.isConnected || me !== runId) return;
                  }
                  if (i === 0 && fail) {
                    set(c, 'FAILED', 'Result.failure()');
                    for (const d of cards.slice(1)) { set(d, 'FAILED', 'never ran'); await sleep(250); }
                    o.append(h('div', { class: 'line drop-in', html: '<span class="bad">failure()</span> fails every dependent. Upload and cleanup never run.' }));
                    running = false; return;
                  }
                  set(c, 'SUCCEEDED', c.out ? `output: ${c.out}` : 'Result.success()');
                  if (cards[i + 1]) { set(cards[i + 1], 'ENQUEUED', `input: ${c.out}`); o.append(h('div', { class: 'line drop-in' }, `${c.name} output → ${cards[i + 1].name} input`)); await sleep(350); }
                  if (me !== runId) return;
                }
                o.append(h('div', { class: 'line drop-in', html: '<span class="good">chain done</span>' }));
                running = false;
              }
              async function cancel() {
                if (!running) { say(o, 'Nothing is running.'); return; }
                runId++; running = false;
                say(o, hl('cancelUniqueWork("photo-42")'));
                for (const c of cards) if (!['SUCCEEDED', 'FAILED'].includes(c.state)) { set(c, 'CANCELLED', c.state === 'RUNNING' ? 'stopped mid-run' : 'never ran'); await sleep(200); }
              }
              const sw = toggle('plt-wm-fail', 'CompressWorker returns failure()', false, v => { fail = v; });
              idle();
              el.append(
                h('div', { class: 'controls plt-row' }, cmd('enqueue chain', start), cmd('cancelUniqueWork("photo-42")', cancel), sw.el),
                h('div', { class: 'plt-chain' }, cards.map(c => c.box)),
                o);
            },
          },
          {
            title: 'Expedited work starts now, within a quota',
            body: `<p>Normal work runs when the system finds a good moment. <code>setExpedited()</code> asks for it to start right away, for short jobs the user just triggered, like sending a message. On Android 12+ it runs as an expedited job, and each app gets a limited quota of those. The <code>OutOfQuotaPolicy</code> says what happens when the quota is used up: run as normal work, or drop the request.</p>
<p>Below Android 12, WorkManager runs expedited work as a foreground service, so your worker must override <code>getForegroundInfo()</code> to supply the notification.</p>`,
            code: `val send = OneTimeWorkRequestBuilder<SendMessageWorker>()
    .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
    .setInputData(workDataOf("draftId" to draft.id))
    .build()

class SendMessageWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    // Used below Android 12, where expedited work runs as a foreground service
    override suspend fun getForegroundInfo() = ForegroundInfo(SENDING_ID, sendingNotification())

    override suspend fun doWork(): Result = /* send it */ Result.success()
}`,
          },
          {
            title: 'A worker can run twice, so make it safe to repeat',
            body: `<p>WorkManager guarantees the work finishes, not that it runs once. If the process dies after your upload reached the server but before <code>doWork()</code> returned, WorkManager never got a result and runs the work again from the start. The same happens when a constraint breaks mid-run.</p>
<p>So send an idempotency key the server can recognise, like the work id or an id you generated when you enqueued. The second attempt then finds the first result instead of creating a duplicate.</p>`,
            code: `override suspend fun doWork(): Result {
    val key = inputData.getString("uploadKey") ?: id.toString()   // stable across retries
    api.uploadPhoto(path, idempotencyKey = key)                  // server ignores repeats of a key
    return Result.success()
}`,
            visual(el) {
              let keyed = false, kill = true, busy = false, n = 0;
              const srv = h('div', { class: 'plt-table' });
              const records = [];
              const steps = h('div', { class: 'plt-steps' });
              const step = (k, who, text) => { steps.append(h('div', { class: `plt-step drop-in ${k ? 'plt-' + k : ''}` }, h('b', {}, who), h('span', { html: text }))); while (steps.children.length > 7) steps.firstElementChild.remove(); };
              const paint = () => srv.replaceChildren(h('div', { class: 'plt-tr plt-th' }, h('span', {}, 'photo'), h('span', {}, 'key'), h('span', {}, '')),
                ...(records.length ? records.map((r, i) => h('div', { class: 'plt-tr' }, h('span', {}, `photo #${i + 1}`), h('span', {}, r.key || 'none'), r.dup ? tag('duplicate', 'no') : tag('ok', 'ok'))) : [h('span', { class: 'plt-empty' }, 'no photos yet')]));
              async function attempt(no, key) {
                step('', 'WorkManager', `attempt ${no}: <code>doWork()</code> starts`); await sleep(500);
                const hit = key && records.find(r => r.key === key);
                if (hit) step('good', 'Server', `key ${key} seen before: returns the existing photo`);
                else { records.push({ key, dup: records.length > 0 && !key }); paint(); replay(srv, 'pop-soft'); step(records.length > 1 && !key ? 'bad' : '', 'Server', 'POST /photos: new photo stored'); }
                await sleep(500);
                return el.isConnected;
              }
              async function run() {
                if (busy) return; busy = true;
                steps.replaceChildren();
                const key = keyed ? `u-${(++n).toString(16).padStart(3, '0')}` : null;
                if (!keyed) n++;
                if (!(await attempt(1, key))) return;
                if (kill) {
                  step('bad', 'System', 'process killed before <code>doWork()</code> returns'); await sleep(700);
                  step('wait', 'WorkManager', 'no result was recorded, so the work runs again'); await sleep(700);
                  if (!(await attempt(2, key))) return;
                }
                step('good', 'Worker', '<code>Result.success()</code>');
                busy = false;
              }
              const k = toggle('plt-wm-idem', 'send an idempotency key', false, v => { keyed = v; });
              const d = toggle('plt-wm-kill', 'process dies after the POST', true, v => { kill = v; });
              paint();
              el.append(
                h('div', { class: 'controls plt-row' }, k.el, d.el),
                h('div', { class: 'controls plt-row' }, cmd('enqueue(uploadRequest)', run)),
                h('div', { class: 'plt-split' }, steps, h('div', { class: 'plt-col' }, h('span', { class: 'plt-label' }, 'Server'), srv)));
            },
          },
        ],
        underHood: {
          body: `<p>WorkManager keeps every request in its own Room database inside your app. That is how work survives the app closing and the phone rebooting. On Android 6.0 and later it hands each request to <code>JobScheduler</code>, which wakes your process when the constraints hold. When the process is already running, an in-process scheduler can start work at once without waiting for the job.</p>
<p>After a reboot, a receiver in the library reschedules the jobs. A force stop cancels your jobs and alarms, and WorkManager notices on the next launch and schedules everything again. Each run gets about 10 minutes before the system stops it, and stopped work runs again later. WorkManager starts itself through App Startup, unless you remove that initializer and provide your own <code>Configuration</code>.</p>`,
          code: `// Custom setup, for example to give workers injected dependencies
class App : Application(), Configuration.Provider {
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().setWorkerFactory(workerFactory).build()
}
// and remove androidx.work.WorkManagerInitializer from the App Startup provider in the manifest`,
        },
        mistakes: [
          {
            title: 'Restarting the periodic clock on every launch',
            bad: `override fun onCreate() {
    super.onCreate()
    WorkManager.getInstance(this).enqueueUniquePeriodicWork(
        "daily-sync", ExistingPeriodicWorkPolicy.CANCEL_AND_REENQUEUE, daily)
}`,
            good: `override fun onCreate() {
    super.onCreate()
    WorkManager.getInstance(this).enqueueUniquePeriodicWork(
        "daily-sync", ExistingPeriodicWorkPolicy.UPDATE, daily)
}`,
            why: 'Cancel and re-enqueue throws the schedule away on every launch and cancels a sync that is mid-run, so the period follows app opens instead of the clock. <code>UPDATE</code> keeps the existing schedule and applies your new request settings.',
          },
          {
            title: 'Passing the payload itself in inputData',
            bad: `val request = OneTimeWorkRequestBuilder<UploadWorker>()
    .setInputData(workDataOf("json" to bigReport.toJson()))
    .build()`,
            good: `val request = OneTimeWorkRequestBuilder<UploadWorker>()
    .setInputData(workDataOf("reportId" to bigReport.id))   // worker loads it from Room
    .build()`,
            why: '<code>Data</code> is capped at 10 KB, and a bigger one throws <code>IllegalStateException</code>. Pass an id or a file path.',
          },
          {
            title: 'Observing a request id you no longer have',
            bad: `// ViewModel builds a new request object, then observes its id
val request = OneTimeWorkRequestBuilder<UploadWorker>().build()
val status = workManager.getWorkInfoByIdFlow(request.id)`,
            good: `val status = workManager.getWorkInfosForUniqueWorkFlow("upload")
    .map { it.firstOrNull()?.state }`,
            why: 'After process death the new id matches nothing that was enqueued, so the UI shows no progress. Observe the unique name, which stays the same.',
          },
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

      // 2 ─────────────────────────────────────────────
      {
        id: 'fgs',
        title: 'Foreground services',
        tagline: 'Long work the user can see, with a type and a deadline.',
        level: 'advanced',
        body: `
<p>A foreground service is work the user is aware of and expects to continue, like playback, navigation, a call or a workout. It must show an ongoing notification. For deferrable jobs, use WorkManager instead.</p>
<p>Apps targeting Android 14 must give every foreground service a type. Declare <code>android:foregroundServiceType</code> on the <code>&lt;service&gt;</code>, request the matching permission such as <code>FOREGROUND_SERVICE_MEDIA_PLAYBACK</code>, and pass the type to <code>startForeground()</code>. After <code>startForegroundService()</code>, the service has only a few seconds to call <code>startForeground()</code>, or the app crashes. The exact limit depends on the Android version and device, so make it the first thing you do.</p>
<p>Since Android 12 you can’t start one while the app is in the background, apart from a few exemptions. A high priority FCM message is one of them (see <a href="#push.messages">Notification vs data messages</a>). Normal priority is not. Apps targeting Android 15 also can’t start types like <code>mediaPlayback</code> from <code>BOOT_COMPLETED</code>. For audio, Media3’s <code>MediaSessionService</code> handles the foreground part for you.</p>`,
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
        remember: 'Declare the type, start from the foreground, call startForeground right away.',
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
          { q: '<code>onStartCommand</code> launches a coroutine that downloads for a minute and only then calls <code>startForeground()</code>. What happens?', options: ['Nothing special', 'The app crashes with <code>ForegroundService<wbr>DidNotStartInTime<wbr>Exception</code>', 'It quietly becomes a background service'], a: 1, why: 'The service has only a few seconds after startForegroundService(). Go foreground first, then do the work.' },
          { q: 'Targeting Android 14, the <code>&lt;service&gt;</code> has no <code>foregroundServiceType</code>. <code>startForeground()</code> is called.', options: ['It works as before', 'It throws <code>MissingForeground<wbr>ServiceType<wbr>Exception</code>', 'The type defaults to dataSync'], a: 1, why: 'Android 14 requires a declared type for every foreground service.' },
        ],
        deeper: fgsDepth.deeper,
        underHood: fgsDepth.underHood,
        mistakes: fgsDepth.mistakes,
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
            say(o, `${f.ok} onStartCommand() runs. The deadline clock is ticking.`);
            const callAt = quick ? 0.4 : 6;
            for (let s = 0; ; s += 0.2) {
              setT(s);
              if (s >= LIMIT && !quick) { fail('ForegroundServiceDidNotStartInTimeException: startForeground() was not called in time.'); return; }
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
                  h('div', { class: 'plt-lane-note' }, h('span', {}, 'red line: the deadline (a few seconds, varies by version)'), clock))),
              ph.dev),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
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
        deeper: receiversDepth.deeper,
        underHood: receiversDepth.underHood,
        mistakes: receiversDepth.mistakes,
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
