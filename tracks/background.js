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

/* promoted: Doze timeline and alarms */
.plt-dz-board { display: grid; gap: 6px; padding: 12px; border-radius: 12px; border: 1px dashed var(--line); background: var(--bg); min-width: 0; }
.plt-dz-lane { display: grid; grid-template-columns: minmax(0, 8.5em) minmax(0, 1fr); gap: 8px; align-items: center; min-width: 0; }
.plt-dz-name { font: 600 0.68rem/1.25 var(--mono); color: var(--muted); overflow-wrap: anywhere; min-width: 0; }
.plt-dz-track { position: relative; height: 22px; border-radius: 6px; background: var(--sunk); overflow: hidden; min-width: 0; }
.plt-dz-seg { position: absolute; top: 0; bottom: 0; }
.plt-dz-seg.plt-dz-awake { background: var(--warm-soft); }
.plt-dz-seg.plt-dz-doze { background: var(--accent-soft); }
.plt-dz-seg.plt-dz-win { background: var(--ok); }
.plt-dz-plan { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; box-sizing: border-box; border-radius: 50%; border: 2px solid var(--muted); }
.plt-dz-hit { position: absolute; top: 50%; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--ok); }
.plt-dz-hit.plt-dz-late { background: var(--warm); }
.plt-dz-hit.plt-dz-fail { background: var(--err); }
.plt-dz-cur { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--ink); opacity: 0.45; }
.plt-dz-axis { position: relative; height: 14px; overflow: hidden; font: 600 0.62rem var(--mono); color: var(--muted); min-width: 0; }
.plt-dz-axis span { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
.plt-dz-legend { display: flex; flex-wrap: wrap; gap: 6px 12px; font: 600 0.68rem var(--mono); color: var(--muted); }
.plt-dz-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; }
.plt-dz-kv { display: grid; grid-template-columns: minmax(0, 7em) minmax(0, 1fr); gap: 6px 10px; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); font-size: 0.86rem; min-width: 0; transition: border-color 0.2s; }
.plt-dz-kv b { font: 600 0.74rem var(--mono); color: var(--muted); }
.plt-dz-kv span { min-width: 0; overflow-wrap: anywhere; }
.plt-dz-wrap .cmd { white-space: normal; text-align: left; overflow-wrap: anywhere; }
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

  // ─── Promoted: Doze, App Standby buckets and alarms ────────────────────
  const bgAct = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const pct = (t, span) => `${(t / span) * 100}%`;
  const hhmm = (start, t) => { const m = (start + t) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  // One timeline row: a name, a track, the planned ring and the actual dot.
  function dzLane(name, span) {
    const track = h('div', { class: 'plt-dz-track' });
    const cur = h('span', { class: 'plt-dz-cur', style: 'left:0' });
    track.append(cur);
    return { el: h('div', { class: 'plt-dz-lane' }, h('span', { class: 'plt-dz-name' }, name), track), track, cur,
      plan(t) { track.append(h('span', { class: 'plt-dz-plan', style: `left:${pct(t, span)}` })); },
      hit(t, kind = '') { const d = h('span', { class: 'plt-dz-hit pop ' + kind, style: `left:${pct(t, span)}` }); track.append(d); return d; } };
  }
  function dzAxis(start, span, marks) {
    return h('div', { class: 'plt-dz-lane' }, h('span'), h('div', { class: 'plt-dz-axis' }, marks.map(t => h('span', { style: `left:${pct(t, span)}` }, hhmm(start, t)))));
  }

  const dozeLesson = {
    id: 'doze',
    title: 'Doze and App Standby buckets',
    tagline: 'When the phone sleeps or your app goes unused, the system decides when your code runs.',
    level: 'advanced',
    body: `
<p>When a phone is unplugged, still and has its screen off for a while, it enters <b>Doze</b>. Network access is suspended, wake locks are ignored, jobs and WorkManager work don't run, and normal alarms, even <code>setExact()</code>, wait. Every so often the system opens a short <b>maintenance window</b> and runs everything that waited. The windows come further apart the longer the phone sits. Doze ends when the user moves the phone, turns on the screen or plugs it in.</p>
<p>A few things still get through: FCM high priority messages, and alarms set with <code>setExactAndAllowWhileIdle()</code> or <code>setAlarmClock()</code>. The first two are meant for things the user must see now.</p>
<p>Since Android 9 there is also a per-app budget. The system puts every app into an <b>App Standby bucket</b> based on how recently and how often it is used: active, working set, frequent, rare, and since Android 12, restricted. The lower the bucket, the less often your jobs and alarms run. You can't opt out of either. Design for it: let WorkManager pick the time, and keep exact timing for things the user asked for.</p>`,
    code: `// Fine in Doze: it waits for a maintenance window, then runs.
val sync = PeriodicWorkRequestBuilder<SyncWorker>(6, TimeUnit.HOURS)
    .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
    .build()
WorkManager.getInstance(context).enqueueUniquePeriodicWork("sync", ExistingPeriodicWorkPolicy.KEEP, sync)

// A reminder the user set for 03:00 must fire on time, even in Doze.
alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminderAt, reminderIntent)

// Which bucket is this app in right now? (Android 9+)
val bucket = context.getSystemService(UsageStatsManager::class.java).appStandbyBucket
if (bucket > UsageStatsManager.STANDBY_BUCKET_ACTIVE) log("throttled: bucket $bucket")`,
    remember: 'Doze defers almost everything to maintenance windows. Only user-facing work should cut through.',
    deeper: [
      {
        title: 'Buckets set your budget',
        body: `<p>Buckets apply only while the phone runs on battery. On a charger, the system lifts them, except for the restricted bucket, whose limits are only loosened. The lower the bucket, the stronger the limits on jobs and alarms. In rare, the system also limits network access.</p>
<p>The restricted bucket is the hard one. Jobs run once a day in a 10-minute batch, and the app gets one alarm a day. On Android 13 and later, an app lands there when the user hasn't touched it for a number of days, or when it sends too many broadcasts or bindings in a day. Manufacturers can set their own rules for buckets, so don't try to game them. Being useful is what moves an app up.</p>`,
        code: `# Simulate battery power first, then pick a bucket and test your app.
adb shell dumpsys battery unplug
adb shell am set-standby-bucket com.example.news rare
adb shell am get-standby-bucket com.example.news
adb shell dumpsys battery reset`,
        visual(el) {
          const B = {
            active: { why: 'In use now, or used very recently. A tap on its notification also counts.', jobs: 'minimal limits', alarms: 'minimal limits', plug: 'no bucket limits', k: 'ok' },
            working_set: { why: 'Used regularly, but not right now.', jobs: 'mild limits', alarms: 'mild limits', plug: 'no bucket limits', k: 'ok' },
            frequent: { why: 'Used often, but not every day.', jobs: 'stronger limits', alarms: 'stronger limits', plug: 'no bucket limits', k: 'wait' },
            rare: { why: 'Not used often. Network access is limited too.', jobs: 'strict limits', alarms: 'strict limits', plug: 'no bucket limits', k: 'wait' },
            restricted: { why: 'Not opened for many days, or too many broadcasts or bindings (Android 13+).', jobs: 'once a day, in a 10-minute batch', alarms: 'one per day', plug: 'limits stay, only loosened', k: 'no' },
          };
          let cur = 'frequent';
          const src = h('div', { class: 'kt' });
          const kv = h('div', { class: 'plt-dz-kv' });
          const o = out();
          function paint(anim) {
            const b = B[cur];
            src.innerHTML = hl(`adb shell am set-standby-bucket com.example.news ${cur}`);
            kv.style.borderColor = `var(--${b.k === 'ok' ? 'ok' : b.k === 'wait' ? 'warm' : 'err'})`;
            kv.replaceChildren(h('b', {}, 'bucket'), h('span', {}, tag(cur, b.k)), h('b', {}, 'how you get here'), h('span', {}, b.why),
              h('b', {}, 'jobs'), h('span', {}, b.jobs), h('b', {}, 'alarms'), h('span', {}, b.alarms), h('b', {}, 'on a charger'), h('span', {}, b.plug));
            if (anim) replay(kv, 'pop-soft');
          }
          const pick = choice('bucket', Object.keys(B), cur, v => { cur = v; paint(true); say(o, `Moved to ${v}.`); });
          function open() { cur = 'active'; pick.set(cur); paint(true); say(o, '<span class="good">The user opened the app.</span> It goes straight to active.'); }
          function idle() {
            const order = Object.keys(B), i = order.indexOf(cur);
            if (i === order.length - 1) { replay(kv, 'shake'); say(o, 'Already restricted. Only real use moves it back up.'); return; }
            cur = order[i + 1]; pick.set(cur); paint(true); say(o, `Days pass without use: ${cur}.`);
          }
          paint(false);
          o.innerHTML = 'Pick a bucket, or let time pass.';
          el.append(pick.el, src, h('div', { class: 'controls' }, bgAct('Days pass, no use', idle), bgAct('User opens the app', open)), kv, o);
        },
      },
      {
        title: 'Test Doze with adb',
        body: `<p>You don't have to leave a phone on a desk overnight. Force Doze with <code>dumpsys deviceidle force-idle</code>, check what your app does, then wake the device with <code>unforce</code> and reset the battery state. App Standby has its own switch: mark the app inactive and see whether your jobs and notifications still behave.</p>
<p>Test both the deferred path (does sync catch up after a window?) and the user-facing path (does the 07:00 reminder still ring?).</p>`,
        code: `# Doze
adb shell dumpsys deviceidle force-idle
adb shell dumpsys deviceidle unforce
adb shell dumpsys battery reset

# App Standby
adb shell dumpsys battery unplug
adb shell am set-inactive com.example.news true
adb shell am get-inactive com.example.news
adb shell am set-inactive com.example.news false`,
      },
      {
        title: 'Battery optimization exemptions are not a fix',
        body: `<p>Users can put an app on the battery optimization exemption list. That only partly helps: the app may use the network and hold partial wake locks during Doze, but its regular alarms still don't fire.</p>
<p>Google Play policy doesn't let apps ask for this exemption directly unless Doze or App Standby breaks their core function. A chat app that can use FCM high priority messages doesn't qualify. Most apps should check with <code>isIgnoringBatteryOptimizations()</code> and, at most, point to the general settings screen.</p>`,
        code: `val pm = context.getSystemService(PowerManager::class.java)
if (!pm.isIgnoringBatteryOptimizations(context.packageName)) {
    // Most apps: the general list, where the user decides.
    context.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
    // ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: only for the use cases Play allows.
}`,
      },
    ],
    mistakes: [
      {
        title: 'A wake lock to keep syncing at night',
        bad: `val lock = powerManager.newWakeLock(PARTIAL_WAKE_LOCK, "news:sync")
lock.acquire(10 * 60 * 1000L)
syncAllFeeds()   // runs in Doze, right?`,
        good: `WorkManager.getInstance(context).enqueueUniqueWork("sync", ExistingWorkPolicy.KEEP,
    OneTimeWorkRequestBuilder<SyncWorker>()
        .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
        .build())`,
        why: 'Doze ignores wake locks and cuts the network anyway. WorkManager waits for a maintenance window and runs the work with network access.',
      },
      {
        title: 'High priority FCM for silent syncs',
        bad: `// Server: wake every device for a background refresh
message.setAndroidConfig(AndroidConfig.builder().setPriority(Priority.HIGH).build())
       .putData("type", "refresh_cache")`,
        good: `// Server: normal priority for background data, high only when a notification shows
message.setAndroidConfig(AndroidConfig.builder().setPriority(Priority.NORMAL).build())
       .putData("type", "refresh_cache")`,
        why: 'High priority is meant for messages that lead to a notification. On Android 12L and lower, misusing it can get your later messages deprioritized. Normal priority arrives in the next maintenance window.',
      },
      {
        title: 'Testing only on a charger',
        bad: `// Phone on USB all day while you test: everything runs on time.`,
        good: `adb shell dumpsys battery unplug
adb shell dumpsys deviceidle force-idle`,
        why: 'Plugged in, the phone never dozes and bucket limits are lifted. Simulate battery power, or the bug shows up only for users.',
      },
    ],
    terms: [
      { term: 'Doze', def: 'A power mode for an unplugged, still phone with the screen off that defers network, jobs, syncs and normal alarms.' },
      { term: 'Maintenance window', def: 'A short break from Doze where pending jobs, syncs and alarms run and apps get network access.' },
      { term: 'App Standby bucket', def: 'One of active, working set, frequent, rare or restricted (Android 9+); lower buckets get fewer jobs and alarms.' },
      { term: 'Restricted bucket', def: 'The lowest bucket (Android 12+): jobs once a day in a 10-minute batch and one alarm a day, even on a charger.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Put the test device into Doze, then bring it back.', code: 'adb shell dumpsys deviceidle [[force-idle]]\n# ... check the app ...\nadb shell dumpsys deviceidle [[unforce]]\nadb shell dumpsys battery reset', why: '<code>force-idle</code> enters Doze at once. <code>unforce</code> leaves it, and <code>battery reset</code> restores the real battery state.' },
      { type: 'bug', prompt: 'A medicine reminder set for 03:00 rings at 04:30 on phones left on the nightstand. Tap the line.', code: 'fun scheduleReminder(at: Long) {\n    if (!alarmManager.canScheduleExactAlarms()) return askForAlarmPermission()\n    val pi = PendingIntent.getBroadcast(context, REMINDER, reminderIntent, PendingIntent.FLAG_IMMUTABLE)\n    alarmManager.setExact(AlarmManager.RTC_WAKEUP, at, pi)\n}', bug: 3, fix: '    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)', why: 'Doze defers <code>setExact()</code> to the next maintenance window. <code>setExactAndAllowWhileIdle()</code> fires during Doze, at most once per nine minutes per app.' },
    ],
    quiz: [
      { q: 'The phone is in Doze. Your <code>CoroutineWorker</code> has a network constraint that is met. When does it run?', options: ['Right away', 'In the next maintenance window, or when Doze ends', 'Never, until the app is opened'], a: 1, why: 'Jobs, and so WorkManager work, don’t run in Doze. They run in the next window.' },
      { q: 'Which of these fires on time while the phone is in Doze?', options: ['<code>setExact()</code>', '<code>setWindow()</code>', '<code>setAlarmClock()</code>'], a: 2, why: 'The system leaves Doze shortly before an alarm clock alarm. setExact and setWindow wait for a window.' },
      { q: 'Your app is in the restricted bucket. How many alarms can it fire a day?', options: ['One', 'Ten', 'No limit while charging'], a: 0, why: 'Restricted apps get one alarm per day, and the limits stay even on a charger.' },
      { q: 'To sync at 03:00 you set a <code>setExact()</code> alarm and take a partial wake lock. The phone is in Doze. What happens?', options: ['The sync runs on time', 'The alarm waits for a maintenance window, and the wake lock is ignored', 'The alarm fires on time, but the sync fails without network'], a: 1, why: 'Doze defers setExact() and ignores wake locks. Let WorkManager run the sync in the next maintenance window.' },
      { q: 'You test your sync on a phone plugged into your laptop and it always runs on time. Users report delays. Why?', options: ['A charging phone never dozes and bucket limits are lifted', 'USB debugging turns off WorkManager’s scheduler', 'Debug builds always stay in the active bucket'], a: 0, why: 'Doze needs the phone unplugged, and buckets apply only on battery. Simulate battery power, or force idle with adb.' },
      { q: 'An app is on the battery optimization exemption list. It sets a regular <code>set()</code> alarm, and the phone enters Doze. Does it fire on time?', options: ['Yes, the exemption covers alarms', 'No: the exemption allows network and partial wake locks, not regular alarms', 'Only while the screen is on'], a: 1, why: 'The exemption only partly lifts Doze. Regular alarms still wait, which is why it is not a fix.' },
    ],
    predict: {
      q: "The phone is dozing. A WorkManager job, a normal priority FCM message and a <code>setExact()</code> alarm all come due in the night. When do they run?",
      options: ["Each at its own time", "Each waits for the next maintenance window, or for the phone to wake", "None of them run until the next morning’s unlock"],
      a: 1,
      why: "Doze holds jobs, normal FCM and ordinary alarms, then runs everything that waited in short maintenance windows.",
    },
    visual(el) {
      // 23:00 to 07:30. Doze from 23:30, windows at 00:30, 02:00 and 04:30, the user picks up the phone at 07:00.
      const START = 23 * 60, SPAN = 510, DOZE = 30, WAKE = 480, WIN = [[90, 105], [180, 195], [330, 345]];
      const ROWS = [
        { name: 'WorkManager job', at: 135, through: false },
        { name: 'FCM normal', at: 160, through: false },
        { name: 'FCM high', at: 160, through: true },
        { name: 'setExact()', at: 240, through: false },
        { name: 'setExactAndAllowWhileIdle()', at: 240, through: true },
        { name: 'set() alarm', at: 360, through: false },
        { name: 'setAlarmClock()', at: 450, through: true },
      ];
      let plugged = false, busy = false, lanes = [];
      const board = h('div', { class: 'plt-dz-board' });
      const clock = tag('23:00');
      const o = out();
      const fireAt = r => {
        if (plugged || r.through || r.at < DOZE) return r.at;
        const w = WIN.find(([a, b]) => b > r.at);
        return w ? Math.max(w[0], r.at) : WAKE;
      };
      function build() {
        const dev = dzLane('phone', SPAN);
        if (plugged) dev.track.prepend(h('span', { class: 'plt-dz-seg plt-dz-awake', style: 'left:0;width:100%' }));
        else {
          dev.track.prepend(h('span', { class: 'plt-dz-seg plt-dz-awake', style: `left:0;width:${pct(DOZE, SPAN)}` }),
            h('span', { class: 'plt-dz-seg plt-dz-doze', style: `left:${pct(DOZE, SPAN)};width:${pct(WAKE - DOZE, SPAN)}` }),
            ...WIN.map(([a, b]) => h('span', { class: 'plt-dz-seg plt-dz-win', style: `left:${pct(a, SPAN)};width:${pct(b - a, SPAN)}` })),
            h('span', { class: 'plt-dz-seg plt-dz-awake', style: `left:${pct(WAKE, SPAN)};width:${pct(SPAN - WAKE, SPAN)}` }));
        }
        lanes = [dev, ...ROWS.map(r => { const l = dzLane(r.name, SPAN); l.plan(r.at); l.row = r; l.when = fireAt(r); return l; })];
        board.replaceChildren(
          h('div', { class: 'plt-dz-legend' }, h('span', {}, h('i', { style: 'background:var(--warm-soft)' }), 'awake'), h('span', {}, h('i', { style: 'background:var(--accent-soft)' }), 'Doze'), h('span', {}, h('i', { style: 'background:var(--ok)' }), 'window'), h('span', {}, h('i', { style: 'border:2px solid var(--muted);border-radius:50%' }), 'asked for'), h('span', {}, h('i', { style: 'background:var(--warm);border-radius:50%' }), 'ran late')),
          ...lanes.map(l => l.el), dzAxis(START, SPAN, [60, 180, 300, 420]));
      }
      async function play() {
        if (busy) return; busy = true;
        try {
          build(); o.replaceChildren();
          const fired = new Set();
          for (let t = 0; t <= SPAN; t += 6) {
            lanes.forEach(l => { l.cur.style.left = pct(t, SPAN); });
            clock.textContent = hhmm(START, t);
            for (const l of lanes.slice(1)) {
              if (fired.has(l) || l.when > t) continue;
              fired.add(l);
              const late = l.when > l.row.at;
              l.hit(l.when, late ? 'plt-dz-late' : '');
              o.append(h('div', { class: 'line drop-in', html: `${hhmm(START, l.when)} ${l.row.name}: ${late ? `<span class="bad">asked for ${hhmm(START, l.row.at)}</span>, ${l.when === WAKE ? 'waited until the user picked up the phone' : 'ran in a maintenance window'}` : '<span class="good">on time</span>'}` }));
              while (o.children.length > 4) o.firstElementChild.remove();
            }
            await sleep(40); if (!el.isConnected) return;
          }
          o.append(h('div', { class: 'line drop-in', html: plugged ? 'On the charger: no Doze, everything on time.' : 'Only high priority FCM and the AllowWhileIdle and alarm clock alarms cut through.' }));
        } finally { busy = false; }
      }
      const tp = toggle('plt-dz-plug', 'phone on the charger all night', false, v => { if (busy) { tp.input.checked = plugged; return; } plugged = v; build(); say(o, v ? 'Plugged in: the phone never enters Doze.' : 'Unplugged on the nightstand. Doze starts at 23:30.'); });
      build();
      o.innerHTML = 'Rings show what the app asked for. Run the night to see when each one really runs.';
      el.append(h('div', { class: 'controls' }, bgAct('Run the night', play), tp.el, clock), board, o);
    },
  };

  const alarmsLesson = {
    id: 'alarms',
    title: 'Alarms and exact timing',
    tagline: 'AlarmManager runs your code at a time, even when the app is closed. Exact time costs a permission.',
    level: 'advanced',
    body: `
<p><code>AlarmManager</code> fires a <code>PendingIntent</code> at a time you choose, even if your process is gone. Most needs don't require precision. <code>set()</code> never fires early, and on Android 12+ it fires within an hour of the time you gave. <code>setWindow()</code> fires inside a window you give, at least 10 minutes long on Android 12+. For repeated background work, WorkManager is the better tool.</p>
<p>Exact alarms are for things the user set and expects on the minute: an alarm clock, a calendar reminder. <code>setExact()</code> is precise while the phone is awake. <code>setExactAndAllowWhileIdle()</code> also fires in Doze. <code>setAlarmClock()</code> is never moved, and the system leaves Doze for it.</p>
<p>Exact alarms need a permission. <code>SCHEDULE_EXACT_ALARM</code> is special access the user grants under <b>Alarms &amp; reminders</b>, and on Android 14 it is denied by default for new installs of apps targeting Android 13 or higher. <code>USE_EXACT_ALARM</code> is granted at install, but only alarm clock and calendar apps qualify, and Google Play checks. Call <code>canScheduleExactAlarms()</code> before every exact alarm. Without the permission, setting one throws <code>SecurityException</code>.</p>`,
    code: `// <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

class ReminderScheduler(private val context: Context) {
    private val alarmManager = context.getSystemService(AlarmManager::class.java)

    fun schedule(reminder: Reminder) {
        val pi = PendingIntent.getBroadcast(context, reminder.id,
            Intent(context, ReminderReceiver::class.java).putExtra("id", reminder.id),
            PendingIntent.FLAG_IMMUTABLE)
        if (alarmManager.canScheduleExactAlarms()) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminder.atMillis, pi)
        } else {
            // No permission: still remind, just less precisely.
            alarmManager.setWindow(AlarmManager.RTC_WAKEUP, reminder.atMillis, 10 * 60_000L, pi)
        }
    }

    fun cancel(reminder: Reminder) {
        val pi = PendingIntent.getBroadcast(context, reminder.id,
            Intent(context, ReminderReceiver::class.java),
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE) ?: return
        alarmManager.cancel(pi)
    }
}`,
    remember: 'Inexact by default. Exact only for what the user set, and only after canScheduleExactAlarms().',
    deeper: [
      {
        title: 'Ask, check and fall back',
        body: `<p>If the permission is missing, explain in your own UI why the reminder needs exact timing, then send the user to the settings screen with <code>ACTION_REQUEST_SCHEDULE_EXACT_ALARM</code>. Some users will say no, so keep a less precise fallback that still works.</p>
<p>The user can also take the permission away later. When that happens, the system stops your app and cancels all its future exact alarms. When it is granted, you receive <code>ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED</code>: check again and reschedule. Re-check in <code>onResume()</code> too, since the user comes back from settings there.</p>`,
        code: `fun askForExactAlarms(activity: Activity) {
    // Show your own explanation first, then:
    activity.startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
        "package:\${activity.packageName}".toUri()))
}

class ExactAlarmPermissionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED) return
        val am = context.getSystemService(AlarmManager::class.java)
        if (am.canScheduleExactAlarms()) RescheduleWork.enqueue(context)   // upgrade to exact alarms
    }
}`,
      },
      {
        title: 'Alarms are gone after a reboot',
        body: `<p>All alarms are cleared when the phone shuts down. Keep your reminders in storage, and set them again from a <code>BOOT_COMPLETED</code> receiver. That broadcast only reaches apps the user has opened at least once.</p>
<p>Leave the receiver disabled in the manifest, and enable it when the user creates their first reminder. Then the app isn't started at every boot for nothing.</p>`,
        code: `// <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
// <receiver android:name=".BootReceiver" android:enabled="false" android:exported="false">
//     <intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>
// </receiver>

fun enableBootReceiver(context: Context) {
    context.packageManager.setComponentEnabledSetting(
        ComponentName(context, BootReceiver::class.java),
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP,
    )
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        RescheduleWork.enqueue(context)   // reads saved reminders and sets them again
    }
}`,
      },
      {
        title: 'Elapsed time or wall clock',
        body: `<p>The alarm type decides which clock it follows. <code>ELAPSED_REALTIME</code> counts time since boot, so it doesn't care about time zones or the user changing the clock. Use it for "in 30 minutes". <code>RTC</code> uses the wall clock. Use it for "at 07:00".</p>
<p>The <code>_WAKEUP</code> variants wake the phone when the alarm is due. The plain ones wait until the phone is awake for some other reason. Since API 19 every repeating alarm is inexact, so prefer <code>setInexactRepeating()</code> and add a little random jitter if it triggers network calls.</p>`,
        code: `// "In 30 minutes": elapsed time, unaffected by clock changes
alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP,
    SystemClock.elapsedRealtime() + 30 * 60_000L, pi)

// "Every morning around 07:00": wall clock, inexact repeating
alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP,
    nextSevenAm(), AlarmManager.INTERVAL_DAY, digestIntent)`,
      },
    ],
    mistakes: [
      {
        title: 'Setting an exact alarm without checking',
        bad: `alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)`,
        good: `if (alarmManager.canScheduleExactAlarms()) {
    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
} else {
    alarmManager.setWindow(AlarmManager.RTC_WAKEUP, at, 10 * 60_000L, pi)
}`,
        why: 'On Android 14 the permission is off by default for most new installs, and users can revoke it. Without it the call throws <code>SecurityException</code>.',
      },
      {
        title: 'Exact alarms for background sync',
        bad: `alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,
    SystemClock.elapsedRealtime() + 15 * 60_000L, syncIntent)   // reschedules itself`,
        good: `WorkManager.getInstance(context).enqueueUniquePeriodicWork("sync",
    ExistingPeriodicWorkPolicy.KEEP, PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.HOURS).build())`,
        why: 'Nobody notices if a sync runs a few minutes late. Exact alarms wake the phone and drain the battery, and Play only lets alarm clock and calendar apps use USE_EXACT_ALARM.',
      },
      {
        title: 'A one-shot PendingIntent you want to cancel',
        bad: `val pi = PendingIntent.getBroadcast(context, id, intent,
    PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE)
alarmManager.set(AlarmManager.RTC_WAKEUP, at, pi)
// later: alarmManager.cancel(pi)  → the alarm still fires`,
        good: `val pi = PendingIntent.getBroadcast(context, id, intent, PendingIntent.FLAG_IMMUTABLE)
alarmManager.set(AlarmManager.RTC_WAKEUP, at, pi)
// later: alarmManager.cancel(pi)`,
        why: 'An alarm whose PendingIntent was created with <code>FLAG_ONE_SHOT</code> can’t be cancelled.',
      },
    ],
    terms: [
      { term: 'AlarmManager', def: 'The system service that fires a PendingIntent at a set time, even when the app isn’t running.' },
      { term: 'SCHEDULE_EXACT_ALARM', def: 'Special app access, shown as Alarms & reminders, that the user grants and can revoke; needed for exact alarms.' },
      { term: 'USE_EXACT_ALARM', def: 'An install-time permission for exact alarms (Android 13+), allowed on Google Play only for alarm clock and calendar apps.' },
      { term: 'setAlarmClock', def: 'The most visible exact alarm: the system never moves it and leaves Doze shortly before it fires.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Check before setting an exact alarm, and send the user to the right settings screen if needed.', code: 'if (alarmManager.[[canScheduleExactAlarms]]()) {\n    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)\n} else {\n    startActivity(Intent(Settings.[[ACTION_REQUEST_SCHEDULE_EXACT_ALARM]]))\n}', why: '<code>canScheduleExactAlarms()</code> tells you whether the permission is held right now. The settings action opens the Alarms &amp; reminders page.' },
      { type: 'bug', prompt: 'The wake-up reminder only appears when the user happens to turn on the screen. Tap the line.', code: 'fun scheduleWakeUp(at: Long) {\n    val pi = PendingIntent.getBroadcast(context, WAKE_UP, wakeIntent, PendingIntent.FLAG_IMMUTABLE)\n    if (!alarmManager.canScheduleExactAlarms()) return askForExactAlarms()\n    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC, at, pi)\n}', bug: 3, fix: '    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)', why: '<code>RTC</code> doesn’t wake the device. The alarm waits until something else wakes it. <code>RTC_WAKEUP</code> wakes the phone at the set time.' },
    ],
    quiz: [
      { q: 'Your app targets Android 14 and is freshly installed on an Android 14 phone. It is not an alarm clock or calendar app. Is <code>SCHEDULE_EXACT_ALARM</code> granted?', options: ['Yes, at install', 'No, the user must allow it in Alarms & reminders', 'Only after a reboot'], a: 1, why: 'Since Android 14 it is denied by default for new installs of apps targeting Android 13 or higher.' },
      { q: 'On Android 12+, <code>set(RTC_WAKEUP, 07:00, pi)</code>. When can it fire, battery savers aside?', options: ['Exactly at 07:00', 'Between 07:00 and about 08:00', 'Any time before 07:00'], a: 1, why: 'Inexact alarms never fire early, and on Android 12+ they fire within an hour of the time given.' },
      { q: 'The user revokes Alarms & reminders for your app. What happens to exact alarms already set?', options: ['They still fire', 'They become inexact', 'The app is stopped and future exact alarms are cancelled'], a: 2, why: 'Revoking the permission stops the app and cancels its future exact alarms.' },
      { q: 'A reminder should fire “in 30 minutes”, even if the user changes the time zone meanwhile. Which alarm type?', options: ['RTC_WAKEUP', 'ELAPSED_REALTIME_WAKEUP', 'RTC'], a: 1, why: 'ELAPSED_REALTIME counts time since boot and ignores clock and time zone changes. RTC follows the wall clock, which fits “at 07:00”.' },
      { q: '<code>canScheduleExactAlarms()</code> returns false for a reminder app. What is the best flow?', options: ['Call setExact() anyway inside try/catch and ignore the error', 'Explain why in your UI, open the Alarms & reminders settings screen, keep an inexact fallback, and check again in onResume()', 'Ask for SCHEDULE_EXACT_ALARM with the runtime permission dialog'], a: 1, why: 'SCHEDULE_EXACT_ALARM is special access granted in settings, not through a dialog. Some users say no, so the fallback keeps the feature working.' },
      { q: 'The user sets a reminder, then the phone restarts. What happens to the alarm?', options: ['AlarmManager restores it after boot', 'It is gone; set it again from a BOOT_COMPLETED receiver using your stored reminders', 'It fires right away when the phone boots'], a: 1, why: 'All alarms are cleared on shutdown. Keep reminders in storage and reschedule them at boot.' },
    ],
    predict: {
      q: "Your app has not been granted <b>Alarms &amp; reminders</b>. It calls <code>setExactAndAllowWhileIdle()</code>. What happens?",
      options: ["It fires on time anyway", "It fires late, like <code>set()</code>", "It throws <code>SecurityException</code>"],
      a: 2,
      why: "Exact alarms need <code>SCHEDULE_EXACT_ALARM</code> or <code>USE_EXACT_ALARM</code>. Without it, setting one throws, so check <code>canScheduleExactAlarms()</code> first.",
    },
    visual(el) {
      // 06:30 to 08:30. The user asks for 07:00.
      const START = 6 * 60 + 30, SPAN = 120, AT = 30, WINDOW_DOZE = 82;
      const M = {
        set: { exact: false, src: 'set(RTC_WAKEUP, 07:00, pi)' },
        setWindow: { exact: false, src: 'setWindow(RTC_WAKEUP, 07:00, 10 * 60_000L, pi)' },
        setExact: { exact: true, src: 'setExact(RTC_WAKEUP, 07:00, pi)' },
        allowIdle: { exact: true, idle: true, src: 'setExactAndAllowWhileIdle(RTC_WAKEUP, 07:00, pi)' },
        alarmClock: { exact: true, idle: true, src: 'setAlarmClock(AlarmClockInfo(07:00, showIntent), pi)' },
      };
      let m = 'allowIdle', granted = false, doze = true, busy = false, pending = false;
      const src = h('div', { class: 'kt' });
      const board = h('div', { class: 'plt-dz-board' });
      const o = out();
      let lane;
      const paintSrc = () => { src.innerHTML = hl('alarmManager.' + M[m].src); };
      function fresh() {
        lane = dzLane('alarm', SPAN);
        if (doze) lane.track.prepend(h('span', { class: 'plt-dz-seg plt-dz-doze', style: `left:0;width:${pct(WINDOW_DOZE, SPAN)}` }), h('span', { class: 'plt-dz-seg plt-dz-win', style: `left:${pct(WINDOW_DOZE, SPAN)};width:${pct(4, SPAN)}` }));
        board.replaceChildren(lane.el, dzAxis(START, SPAN, [30, 60, 90]),
          h('div', { class: 'plt-dz-legend' }, h('span', {}, h('i', { style: 'background:var(--accent-soft)' }), 'Doze'), h('span', {}, h('i', { style: 'background:var(--ok)' }), 'window'), h('span', {}, h('i', { style: 'border:2px solid var(--muted);border-radius:50%' }), '07:00 asked')));
        pending = false;
      }
      async function schedule() {
        if (busy) return; busy = true;
        try {
          fresh(); paintSrc();
          say(o, hl('alarmManager.' + M[m].src));
          if (M[m].exact && !granted) {
            lane.hit(AT, 'plt-dz-fail'); replay(board, 'shake');
            o.append(h('div', { class: 'line drop-in', html: '<span class="bad">SecurityException:</span> no SCHEDULE_EXACT_ALARM. Check canScheduleExactAlarms() first and fall back to setWindow().' }));
            return;
          }
          lane.plan(AT); pending = true;
          let when = AT, why = '';
          if (m === 'set') { when = AT + 8 + Math.floor(Math.random() * 45); why = 'inexact: any time within the hour'; }
          if (m === 'setWindow') { when = AT + Math.floor(Math.random() * 10); why = 'inside the 10-minute window'; }
          if (doze && !M[m].idle && when < WINDOW_DOZE) { when = WINDOW_DOZE; why = 'Doze held it until the maintenance window'; }
          if (M[m].idle && doze) why = m === 'alarmClock' ? 'the system left Doze just before it' : 'allowed in Doze (at most once per 9 minutes)';
          for (let t = 0; t <= when; t += 2) { lane.cur.style.left = pct(t, SPAN); await sleep(25); if (!el.isConnected) return; }
          if (!pending) return;
          lane.hit(when, when > AT + 10 ? 'plt-dz-late' : '');
          o.append(h('div', { class: 'line drop-in', html: `fired at ${hhmm(START, when)}: ${when === AT ? '<span class="good">on the minute</span>' : when > AT + 10 ? `<span class="bad">${when - AT} min late</span>` : `<span class="good">${when - AT} min after</span>`}${why ? `, ${why}` : ''}.` }));
        } finally { busy = false; }
      }
      function reboot() {
        if (busy) return;
        fresh();
        say(o, '<span class="bad">Rebooted. Every alarm is gone.</span> Save reminders and set them again from a BOOT_COMPLETED receiver.');
        replay(board, 'shake');
      }
      const pick = choice('method', Object.keys(M), m, v => { if (busy) return false; m = v; paintSrc(); fresh(); say(o, M[v].exact ? 'An exact alarm: needs the permission.' : 'Inexact: no permission needed.'); }, v => ({ allowIdle: 'setExactAndAllowWhileIdle', alarmClock: 'setAlarmClock' })[v] || v);
      const tg = toggle('plt-am-perm', 'Alarms & reminders allowed', false, v => { if (busy) { tg.input.checked = granted; return; } granted = v; fresh(); say(o, v ? 'The user allowed exact alarms in settings.' : 'New install on Android 14: exact alarms are denied by default.'); });
      const td = toggle('plt-am-doze', 'phone in Doze at 07:00', true, v => { if (busy) { td.input.checked = doze; return; } doze = v; fresh(); say(o, v ? 'The phone lies still and unplugged: Doze until a window at 07:52.' : 'The phone is awake.'); });
      paintSrc(); fresh();
      o.innerHTML = 'The user wants a reminder at 07:00. Pick a method and schedule it.';
      el.append(pick.el, src, h('div', { class: 'controls' }, tg.el, td.el), h('div', { class: 'controls' }, bgAct('Schedule for 07:00', schedule), bgAct('Reboot the phone', reboot)), board, o);
    },
  };

  Lab.addTrack({
    id: 'background',
    title: 'Background work',
    description: 'WorkManager, Doze and standby buckets, foreground services, broadcast receivers and alarms: the rules that decide when your code gets to run.',
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
          { q: '<code>beginWith(compress).then(upload).then(notify)</code> runs, and compress returns <code>Result.failure()</code>. What happens to upload and notify?', options: ['They run with empty input data', 'They are marked FAILED without running', 'They are marked CANCELLED'], a: 1, why: 'A chain stops at the first failure and marks every later worker FAILED. CANCELLED is what you get when you cancel the chain.' },
          { q: 'An upload worker’s file reached the server, then the process died before doWork() returned. What happens, and what protects you?', options: ['WorkManager marks it succeeded, so nothing is needed', 'It runs again from the start; an idempotency key lets the server spot the repeat', 'It is marked failed, and you must enqueue it again yourself'], a: 1, why: 'WorkManager never got a result, so it runs the work again. Send a key like the work id so the second attempt finds the first result.' },
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
        predict: {
          q: "A sync request needs network and charging. The phone is on Wi-Fi but unplugged. What state is the work in?",
          options: ["<code>RUNNING</code>: one constraint is enough", "<code>ENQUEUED</code>, waiting for charging", "<code>FAILED</code>: the constraints were not met"],
          a: 1,
          why: "Work starts only when every constraint holds. Until then it waits as ENQUEUED, and it is stopped again if a constraint breaks mid-run.",
        },
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

      // 1b: promoted from the gap audit
      dozeLesson,

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
          { q: 'Targeting Android 14, a high priority FCM message lets you start a foreground service from the background. You start one of type location. The user granted only while-in-use location. What happens?', options: ['It starts and gets location fixes', 'It throws SecurityException, because while-in-use types need the app in front', 'It starts, then onTimeout() stops it after 3 minutes'], a: 1, why: 'Camera, microphone and location services rely on while-in-use permissions. Start them while the user is looking at your app.' },
          { q: 'Targeting Android 15, a dataSync service uses up its 6 hour budget. The system calls onTimeout() and your code ignores it. What happens?', options: ['It keeps running in the background', 'The app crashes with RemoteServiceException', 'The system quietly turns it into a normal service'], a: 1, why: 'After onTimeout the service has a few seconds to stop. A dataSync service that keeps going crashes the app.' },
        ],
        deeper: fgsDepth.deeper,
        underHood: fgsDepth.underHood,
        mistakes: fgsDepth.mistakes,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['v1: service', 'v1: notification', 'v2: service'],
            span: 8,
            unit: 's',
            predict: {
              q: 'Two versions of a player service, both started with <code>startForegroundService()</code>. v1 calls <code>startForeground()</code> first thing. v2 downloads a file first and calls it after 6 seconds. Which version is still running at 8 s?',
              options: ['Both', 'Only v1', 'Only v2', 'Neither'],
              a: 1,
              why: 'After <code>startForegroundService()</code> the system waits only a few seconds for <code>startForeground()</code>. v2 misses that deadline and the app crashes.',
            },
            frames: [
              { now: 0, marks: [{ at: 5, label: 'deadline', tone: 'warm' }], say: 'Two versions of the same app, each run on its own. Both call <code>startForegroundService()</code>, and a clock starts: a few seconds to call <code>startForeground()</code>.' },
              { now: 0.4, bars: [{ lane: 0, from: 0, to: 0.4, label: 'start', tone: 'accent' }], say: 'In v1, <code>onStartCommand()</code> calls <code>startForeground(id, notification, type)</code> before anything else.' },
              { now: 3, bars: [{ lane: 0, from: 0.4, to: 3, label: 'playing', tone: 'ok' }, { lane: 1, from: 0.4, to: 3, label: 'shown', tone: 'ok' }], say: 'v1 is now a foreground service with its notification. The deadline no longer applies to it.' },
              { now: 3, marks: [{ at: 3, label: 'Home', tone: 'muted' }], say: 'The user presses Home. The app is in the background, but v1 keeps running: the user can see it.' },
              { now: 5, bars: [{ lane: 2, from: 0, to: 5, label: 'downloading…', tone: 'warm' }], say: 'In v2, <code>onStartCommand()</code> starts a download first. It plans to call <code>startForeground()</code> when it is done, at 6 s.' },
              { now: 5.4, bars: [{ lane: 2, from: 5, to: 5.4, label: '', tone: 'err' }], marks: [{ at: 5.4, label: 'crash', tone: 'err' }], say: 'The deadline passes first. The app crashes with <code>ForegroundServiceDidNotStartInTimeException</code>.' },
              { now: 8, bars: [{ lane: 0, from: 3, to: 8, label: 'playing', tone: 'ok' }, { lane: 1, from: 3, to: 8, label: 'shown', tone: 'ok' }], say: 'v1 is still playing. Make <code>startForeground()</code> the first call, then start the work. The exact limit depends on the Android version, so never cut it close.' },
            ],
          });
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
          { q: 'onReceive() launches a coroutine on GlobalScope for an 8 second upload and returns at once. Nothing else in your process is active. What is the risk?', options: ['None; the coroutine keeps the process alive', 'The system can kill the process after onReceive returns, and the upload is lost', 'An ANR, because onReceive took 8 seconds'], a: 1, why: 'Once onReceive returns, the receiver counts as finished. Use goAsync() for a few seconds of work, or WorkManager for work that must not be lost.' },
          { q: 'Only apps signed with your key should be able to send to your exported receiver. How?', options: ['Register it with RECEIVER_NOT_EXPORTED', 'Define a permission with protectionLevel="signature" and require it when you register', 'Check intent.getPackage() inside onReceive'], a: 1, why: 'Only apps signed with your key can hold a signature permission. NOT_EXPORTED would block your own other apps too, and the package field is set by the sender.' },
          { q: 'On Android 14 your app is cached. A system broadcast for your context-registered receiver arrives three times. The app then comes back to the foreground. How many times does onReceive run?', options: ['Exactly three', 'Possibly fewer, since queued copies can be merged; read the current state instead of counting', 'Zero, because broadcasts to cached apps are dropped'], a: 1, why: 'The system queues broadcasts for cached apps and may merge copies. Treat a broadcast as a signal to read state, not as a counter.' },
        ],
        deeper: receiversDepth.deeper,
        underHood: receiversDepth.underHood,
        mistakes: receiversDepth.mistakes,
        visual(el) {
          Lab.ui.graph(el, {
            height: 270,
            nodes: [
              { id: 'boot', label: 'Reboot<small>BOOT_COMPLETED</small>', x: 17, y: 14, tone: 'muted' },
              { id: 'power', label: 'Plug in<small>implicit</small>', x: 50, y: 14, tone: 'muted' },
              { id: 'partner', label: 'Other app<small>SYNC_DONE</small>', x: 83, y: 14, tone: 'warm' },
              { id: 'man', label: 'BootReceiver<small>manifest</small>', x: 25, y: 82 },
              { id: 'ctx', label: 'Context receiver<small>from onStart</small>', x: 75, y: 82 },
            ],
            predict: {
              q: 'Another app sends <code>com.partner.SYNC_DONE</code>. Your context receiver listens for it and was registered with <code>RECEIVER_NOT_EXPORTED</code>. Does it run?',
              options: ['Yes: it is registered for that action', 'No: not exported means other apps can’t reach it', 'Only if the other app is signed with your key'],
              a: 1,
              why: 'The exported flag decides who may send to a context-registered receiver. Not exported accepts only your own app and the system.',
            },
            frames: [
              { say: 'Two receivers. <code>BootReceiver</code> is declared in the manifest. <code>MainActivity</code> registers a second one from code while it is started.' },
              { add: [['boot', 'man', '', 'ok']], hl: ['man'], say: 'The phone restarts. <code>BOOT_COMPLETED</code> is on the exempt list, so the system starts your process just to deliver it.' },
              { add: [['power', 'man', 'blocked', 'err']], say: 'The user plugs in. Since Android 8, manifest receivers don’t get most implicit broadcasts, so <code>BootReceiver</code> never hears it.' },
              { add: [['power', 'ctx', '', 'ok']], hl: ['ctx'], say: 'The context receiver does get it, because it is registered right now.' },
              { add: [['partner', 'ctx', 'blocked', 'err']], say: 'Another app sends a custom broadcast. Registered with <code>RECEIVER_NOT_EXPORTED</code>, the receiver only accepts your app and the system.' },
              { add: [['partner', 'ctx', '', 'ok']], hl: ['ctx'], say: 'Registered with <code>RECEIVER_EXPORTED</code>, it arrives. Targeting Android 14 with neither flag, <code>registerReceiver</code> throws.' },
              { remove: [['power', 'ctx'], ['partner', 'ctx']], gone: ['ctx'], say: '<code>onStop()</code> calls <code>unregisterReceiver()</code>. From now on nothing in your app hears <code>POWER_CONNECTED</code>.' },
            ],
          });
        },
      },

      // 3b: promoted from the gap audit
      alarmsLesson,
    ],
  });
})();
