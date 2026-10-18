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
/* depth pass 2 */
.plt-ps2-wrap .cmd { white-space: normal; text-align: left; overflow-wrap: anywhere; }
.plt-ps2-set { all: unset; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font: 600 0.8rem var(--body); cursor: pointer; min-width: 0; overflow-wrap: anywhere; }
.plt-ps2-set:focus-visible { outline: 2px solid var(--accent); }
.plt-ps2-set.plt-ps2-hi { border: 2px solid var(--warm); background: var(--warm-soft); }
.plt-ps2-knob { flex: none; width: 30px; height: 16px; border-radius: 99px; background: var(--sunk); border: 1px solid var(--line); position: relative; transition: background 0.2s; }
.plt-ps2-knob::after { content: ""; position: absolute; top: 1px; left: 1px; width: 12px; height: 12px; border-radius: 50%; background: var(--muted); transition: transform 0.2s, background 0.2s; }
.plt-ps2-set[aria-pressed="true"] .plt-ps2-knob { background: var(--accent-soft); }
.plt-ps2-set[aria-pressed="true"] .plt-ps2-knob::after { transform: translateX(14px); background: var(--accent); }
.plt-ps2-dlg { display: grid; gap: 6px; padding: 12px; border-radius: 14px; background: var(--surface); border: 2px solid var(--accent); box-shadow: var(--shadow); font-size: 0.82rem; }
.plt-ps2-dlg button { all: unset; cursor: pointer; font: 700 0.82rem var(--body); color: var(--accent); padding: 4px 0; }
.plt-ps2-dlg button:focus-visible { outline: 2px solid var(--accent); }
.plt-ps2-url { font: 600 0.7rem var(--mono); padding: 5px 8px; border-radius: 8px; background: var(--sunk); overflow-wrap: anywhere; }
.plt-ps2-url.plt-ps2-evil { background: var(--err-soft); color: var(--err); }
.plt-ps2-crash { border: 2px solid var(--err); }

/* promoted: styles and actions */
.plt-sty-note { gap: 3px; }
.plt-sty-head { display: flex; justify-content: space-between; align-items: center; gap: 6px; min-width: 0; }
.plt-sty-chev { all: unset; cursor: pointer; font: 700 0.8rem var(--mono); color: var(--accent); padding: 0 4px; border-radius: 6px; }
.plt-sty-chev:focus-visible { outline: 2px solid var(--accent); }
.plt-sty-one { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.plt-sty-row { display: flex; gap: 6px; align-items: center; min-width: 0; }
.plt-sty-row > span:first-child { flex: 1; min-width: 0; }
.plt-sty-thumb { flex: none; width: 28px; height: 28px; border-radius: 6px; background: linear-gradient(135deg, var(--accent), var(--warm)); }
.plt-sty-pic { height: 64px; border-radius: 8px; background: linear-gradient(135deg, var(--accent), var(--warm)); }
.plt-sty-msg { display: block; font-size: 0.78rem; }
.plt-sty-acts { display: flex; flex-wrap: wrap; gap: 4px 10px; padding-top: 4px; margin-top: 3px; border-top: 1px solid var(--line); }
.plt-sty-act { all: unset; cursor: pointer; font: 700 0.72rem var(--body); color: var(--accent); }
.plt-sty-act:focus-visible { outline: 2px solid var(--accent); }
.plt-sty-input { display: flex; gap: 6px; align-items: center; padding: 4px 6px; border-radius: 8px; background: var(--sunk); min-width: 0; font-size: 0.76rem; }
.plt-sty-input span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.plt-sty-spin { display: inline-block; flex: none; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--line); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.plt-sty-bar { height: 6px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.plt-sty-bar span { display: block; height: 100%; width: 0; background: var(--accent); transition: width 0.3s; }

/* promoted: App Links */
.plt-al-hosts { display: grid; gap: 8px; min-width: 0; }
.plt-al-host { display: grid; gap: 6px; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s; }
.plt-al-host.plt-al-ok { border-color: var(--ok); }
.plt-al-host.plt-al-bad { border-color: var(--err); }
.plt-al-name { font: 700 0.8rem var(--mono); overflow-wrap: anywhere; }
.plt-al-wrap .cmd { white-space: normal; text-align: left; overflow-wrap: anywhere; }
`;

  // ─── Depth pass 2: channels, deep links ────────────────────────────────
  const channelsDepth = {
    deeper: [
      {
        title: 'Check before you rely on it',
        body: `<p>The user can switch off all of your notifications, or just one channel. Either way <code>notify()</code> returns normally and nothing appears. Before a feature that depends on alerts, check both levels: <code>areNotificationsEnabled()</code> for the app, and the channel's <code>importance</code>, which is <code>IMPORTANCE_NONE</code> when the user blocked it.</p>
<p>If something is off, say why it matters and open the exact settings screen. <code>ACTION_CHANNEL_NOTIFICATION_SETTINGS</code> with your package name and channel id goes straight to that channel.</p>`,
        code: `fun goalAlertsBlocked(context: Context): Boolean {
    val nm = context.getSystemService(NotificationManager::class.java)
    if (!nm.areNotificationsEnabled()) return true
    val channel = nm.getNotificationChannel(GOALS_CHANNEL) ?: return true   // minSdk 26
    return channel.importance == NotificationManager.IMPORTANCE_NONE
}

fun openGoalSettings(context: Context) {
    context.startActivity(Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        putExtra(Settings.EXTRA_CHANNEL_ID, GOALS_CHANNEL)
    })
}`,
        visual(el) {
          let appOn = true, goalsOn = false, transfersOn = true, screen = 'app', busy = false, n = 0;
          const GOALS = ['Goal! 1-0, 23’', 'Goal! 1-1, 51’', 'Goal! 2-1, 88’'];
          const ph = phone();
          const shade = h('div', { class: 'plt-shade' });
          const o = out();
          const sw = (label, on, onclick, hi) => h('button', { class: 'plt-ps2-set' + (hi ? ' plt-ps2-hi' : ''), 'aria-pressed': String(on), onclick }, h('span', {}, label), h('span', { class: 'plt-ps2-knob', 'aria-hidden': 'true' }));
          function paint(hiGoals) {
            if (screen === 'app') {
              ph.screen.replaceChildren(h('div', { class: 'plt-appbar' }, 'Scores'),
                h('div', { class: 'plt-note' }, h('b', {}, 'Team A'), h('span', {}, 'Following · goal alerts')),
                h('p', { class: 'plt-shade-title' }, 'Notification shade'), shade);
            } else {
              ph.screen.replaceChildren(h('div', { class: 'plt-appbar plt-ext' }, 'Settings · Scores'),
                sw('All Scores notifications', appOn, () => { appOn = !appOn; paint(hiGoals); }),
                sw('Goal alerts', goalsOn, () => { goalsOn = !goalsOn; paint(hiGoals); if (goalsOn) say(o, '<span class="good">The user turned Goal alerts back on.</span> Go back to the app.'); }, hiGoals),
                sw('Transfer news', transfersOn, () => { transfersOn = !transfersOn; paint(hiGoals); }),
                h('button', { class: 'plt-note plt-tap', onclick() { screen = 'app'; paint(); say(o, 'Back in the app.'); } }, h('b', {}, '← Back to Scores')));
            }
          }
          async function post() {
            if (busy) return; busy = true;
            try {
              const text = GOALS[n++ % GOALS.length];
              say(o, `${hl('notify(goalId, goal)')} <span class="muted">// returns normally</span>`);
              await sleep(300); if (!el.isConnected) return;
              if (!appOn || !goalsOn) { replay(ph.dev, 'shake'); o.append(h('div', { class: 'line drop-in', html: `<span class="bad">nothing shown:</span> ${!appOn ? 'the app’s notifications are off' : 'the goals channel is blocked'}. No exception, so your code can’t tell.` })); return; }
              if (screen !== 'app') { screen = 'app'; paint(); }
              shade.prepend(note('goals · HIGH', 'Team A', text, 'drop-in'));
              while (shade.children.length > 3) shade.lastElementChild.remove();
              o.append(h('div', { class: 'line drop-in', html: '<span class="good">shown.</span>' }));
            } finally { busy = false; }
          }
          function check() {
            if (busy) return;
            const blocked = !appOn || !goalsOn;
            say(o, `${hl('goalAlertsBlocked(context)')} = <span class="${blocked ? 'bad' : 'good'}">${blocked}</span> <span class="muted">// ${!appOn ? 'areNotificationsEnabled() is false' : !goalsOn ? 'channel importance is IMPORTANCE_NONE' : 'both levels are on'}</span>`);
            if (blocked) o.append(h('div', { class: 'line drop-in' }, 'Show a short explanation with a button to the settings.'));
          }
          function openSettings() {
            if (busy) return;
            screen = 'settings'; paint(true); replay(ph.dev, 'pop-soft');
            say(o, `${hl('openGoalSettings(context)')} <span class="muted">// lands on the channel. Tap the highlighted switch on the phone.</span>`);
          }
          paint();
          o.innerHTML = 'The user blocked the Goal alerts channel in Settings last week. Post a goal, then check.';
          el.append(h('div', { class: 'plt-split' },
            h('div', { class: 'plt-col' },
              h('div', { class: 'controls plt-row plt-ps2-wrap' }, cmd('notify(goalId, goal)', post), cmd('goalAlertsBlocked(context)', check), cmd('openGoalSettings(context)', openSettings)),
              o),
            ph.dev));
        },
      },
      {
        title: 'The permission dialog has two chances',
        body: `<p>On Android 13+, <code>POST_NOTIFICATIONS</code> follows the usual runtime permission rules. If the user denies it twice, the system stops showing the dialog, and every later request comes back denied at once. After the first denial, <code>shouldShowRequestPermissionRationale()</code> returns true. That is your moment to explain the value in your own UI before you ask again.</p>
<p>Once the dialog is gone for good, only the app's notification settings can turn it on, so link there instead of calling <code>launch()</code> again. Apps that still target Android 12L or lower get the dialog from the system when they create their first channel, at a moment they don't choose.</p>`,
        code: `fun onFollowClicked() {
    when {
        hasNotificationPermission() -> follow()
        shouldShowRequestPermissionRationale(POST_NOTIFICATIONS) -> showWhyAlertsDialog()
        askedBefore && !shouldShowRequestPermissionRationale(POST_NOTIFICATIONS) ->
            showOpenSettingsBanner()            // the dialog won't appear any more
        else -> { askedBefore = true; launcher.launch(POST_NOTIFICATIONS) }
    }
}`,
        visual(el) {
          let granted = false, denials = 0, dialog = false, settings = false;
          const ph = phone();
          const o = out();
          const st = { g: tag(''), d: tag(''), r: tag('') };
          function paintTags() {
            st.g.textContent = `granted: ${granted}`; st.g.className = 'plt-tag ' + (granted ? 'plt-ok' : 'plt-no');
            st.d.textContent = `denials: ${denials}`; st.d.className = 'plt-tag ' + (denials >= 2 ? 'plt-no' : denials ? 'plt-wait' : '');
            const r = !granted && denials === 1;
            st.r.textContent = `rationale: ${r}`; st.r.className = 'plt-tag ' + (r ? 'plt-acc' : '');
          }
          function paint() {
            const kids = [h('div', { class: 'plt-appbar' }, 'Scores'), h('div', { class: 'plt-note' }, h('b', {}, 'Team A'), h('span', {}, granted ? 'Goal alerts on' : 'Goal alerts need permission'))];
            if (settings) {
              ph.screen.replaceChildren(h('div', { class: 'plt-appbar plt-ext' }, 'App info · Notifications'),
                h('button', { class: 'plt-ps2-set', 'aria-pressed': String(granted), onclick() { granted = !granted; paintTags(); paint(); say(o, granted ? '<span class="good">Allowed from settings.</span> The only way back after two denials.' : 'Turned off again in settings.'); } }, h('span', {}, 'All Scores notifications'), h('span', { class: 'plt-ps2-knob', 'aria-hidden': 'true' })),
                h('button', { class: 'plt-note plt-tap', onclick() { settings = false; paint(); } }, h('b', {}, '← Back to Scores')));
              return;
            }
            if (dialog) kids.push(h('div', { class: 'plt-ps2-dlg drop-in', role: 'dialog' },
              h('b', {}, 'Allow Scores to send you notifications?'),
              h('button', { onclick: () => answer(true) }, 'Allow'),
              h('button', { onclick: () => answer(false) }, 'Don’t allow')));
            ph.screen.replaceChildren(...kids);
          }
          function answer(ok) {
            dialog = false;
            if (ok) granted = true; else denials++;
            paintTags(); paint();
            say(o, ok ? '<span class="good">callback: granted = true</span>' : denials === 1 ? '<span class="bad">callback: granted = false.</span> Rationale is now true: explain, then you get one more try.' : '<span class="bad">callback: granted = false.</span> Second denial. The system won’t show this dialog again.');
          }
          function ask() {
            if (dialog || settings) return;
            say(o, hl('launcher.launch(Manifest.permission.POST_NOTIFICATIONS)'));
            if (granted) { o.append(h('div', { class: 'line drop-in', html: '<span class="good">callback: granted = true</span>, at once. Already allowed.' })); return; }
            if (denials >= 2) { replay(ph.dev, 'shake'); o.append(h('div', { class: 'line drop-in', html: '<span class="bad">callback: granted = false</span>, at once. No dialog. Send the user to settings instead.' })); return; }
            dialog = true; paint();
            o.append(h('div', { class: 'line drop-in' }, 'The system dialog is up. Answer it on the phone.'));
          }
          function rationale() {
            const r = !granted && denials === 1;
            say(o, `${hl('shouldShowRequestPermissionRationale(POST_NOTIFICATIONS)')} = ${r}`);
            o.append(h('div', { class: 'line drop-in' }, granted ? 'Already granted: nothing to explain.' : denials === 0 ? 'Never denied: just ask.' : denials === 1 ? 'Denied once: show your explanation now.' : 'False again, but now because the user denied twice. Combine it with your own "asked before" flag.'));
          }
          function openSettings() { if (dialog) return; settings = true; paint(); say(o, 'App notification settings. Flip the switch on the phone.'); }
          paintTags(); paint();
          o.innerHTML = 'The user just tapped Follow. Ask for the permission.';
          el.append(h('div', { class: 'plt-split' },
            h('div', { class: 'plt-col' },
              h('div', { class: 'controls plt-row plt-ps2-wrap' }, cmd('launcher.launch(POST_NOTIFICATIONS)', ask), cmd('shouldShowRequestPermissionRationale(...)', rationale), act('Open notification settings', openSettings)),
              h('div', { class: 'plt-group' }, st.g, st.d, st.r),
              o),
            ph.dev));
        },
      },
    ],
    underHood: {
      body: `<p>Channels live in <code>system_server</code>, not in your app. The notification manager stores them per package and saves them to disk along with every change the user makes. When you call <code>createNotificationChannel()</code> for an id it already knows, it keeps the stored behavior, such as importance and sound, and only takes your new name and description.</p>
<p>When you post, the system looks up the channel by id. If the channel is missing or blocked, or the app's notifications are off, the post is dropped there, so your process never hears about it. Deleted channels are not forgotten either: the settings screen shows how many channels an app has deleted, as a guard against spam.</p>`,
    },
    mistakes: [
      {
        title: 'No small icon',
        bad: `val n = NotificationCompat.Builder(context, GOALS_CHANNEL)
    .setContentTitle("Goal!")
    .setContentText("Team A 1-0")
    .build()`,
        good: `val n = NotificationCompat.Builder(context, GOALS_CHANNEL)
    .setSmallIcon(R.drawable.ic_stat_goal)   // white shape on transparent
    .setContentTitle("Goal!")
    .setContentText("Team A 1-0")
    .build()`,
        why: 'Posting a notification without a small icon fails with <code>IllegalArgumentException: Invalid notification (no valid small icon)</code>. The status bar draws only the icon’s alpha, so use a flat vector shape.',
      },
      {
        title: 'One channel for everything',
        bad: `NotificationChannel("general", "Notifications", IMPORTANCE_HIGH)
// goals, transfer rumours and promotions all go here`,
        good: `NotificationChannel("goals", "Goal alerts", IMPORTANCE_HIGH)
NotificationChannel("transfers", "Transfer news", IMPORTANCE_DEFAULT)
NotificationChannel("promos", "Offers", IMPORTANCE_LOW)`,
        why: 'When one promotion annoys the user, they block the only channel and lose goal alerts too. Separate channels let them mute just the noise.',
      },
      {
        title: 'Asking for the permission on first launch',
        bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)   // before anything
}`,
        good: `fun onFollowTeam(team: Team) {
    viewModel.follow(team)
    if (Build.VERSION.SDK_INT >= 33 && !hasNotificationPermission()) {
        askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)   // the user just asked for alerts
    }
}`,
        why: 'With no context the user is likely to tap "Don’t allow", and you only get two dialogs. Ask right after an action that clearly needs notifications.',
      },
    ],
  };

  const deeplinksDepth = {
    deeper: [
      {
        title: 'Make each PendingIntent different where it counts',
        body: `<p>The system keeps one PendingIntent per key: your package, the request code, and the Intent as compared by <code>filterEquals()</code>, which looks at action, data, type, identifier, class and categories but not extras. Ask again with the same key and you get the existing one back. The flag decides what happens to it: <code>FLAG_UPDATE_CURRENT</code> swaps in the new extras, no flag keeps the old ones, and <code>FLAG_CANCEL_CURRENT</code> cancels the old one, so its notification stops working.</p>
<p>The cleanest fix is to put the id in the data URI. Then each article has its own Intent, whatever the request code.</p>`,
        code: `val intent = Intent(
    Intent.ACTION_VIEW,
    "https://news.example.com/article/$id".toUri(),   // different data: different PendingIntent
    context, ArticleActivity::class.java,
)
val pending = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)`,
        visual(el) {
          const KEYS = { rc0: 'request code 0, id in extras', rcid: 'request code = id', uri: 'id in the data URI' };
          const FLAGS = { none: 'FLAG_IMMUTABLE', upd: 'FLAG_UPDATE_CURRENT or FLAG_IMMUTABLE', cancel: 'FLAG_CANCEL_CURRENT or FLAG_IMMUTABLE' };
          let key = 'rc0', flag = 'upd', records = [], notes = {}, busy = false;
          const ph = phone();
          const shade = h('div', { class: 'plt-shade' });
          ph.screen.append(h('p', { class: 'plt-shade-title' }, 'Notification shade'), shade);
          const table = h('div', { class: 'plt-table' });
          const src = h('div', { class: 'kt' });
          const o = out();
          const keyOf = id => (key === 'rc0' ? 'rc 0 · /article' : key === 'rcid' ? `rc ${id} · /article` : `rc 0 · /article/${id}`);
          function paintSrc() {
            const rc = key === 'rcid' ? 'id' : '0';
            const intent = key === 'uri' ? 'Intent(ACTION_VIEW, ".../article/$id".toUri(), ctx, ArticleActivity::class.java)' : 'Intent(ctx, ArticleActivity::class.java).putExtra("id", id)';
            src.innerHTML = hl(`PendingIntent.getActivity(ctx, ${rc}, ${intent}, ${FLAGS[flag]})`);
          }
          function paintTable() {
            table.replaceChildren(h('div', { class: 'plt-tr plt-th' }, h('span', {}, 'key'), h('span', {}, 'opens'), h('span', {}, 'state')),
              ...(records.length ? records.map(r => h('div', { class: 'plt-tr' + (r.dead ? ' plt-gone' : '') }, h('span', {}, r.k), h('span', {}, `article ${r.id}`), r.dead ? tag('canceled', 'no') : tag('live', 'ok')))
                : [h('span', { class: 'plt-empty' }, 'no PendingIntents yet')]));
          }
          function get(id) {
            const k = keyOf(id), ex = records.find(r => r.k === k && !r.dead);
            if (!ex) { const r = { k, id }; records.push(r); return [r, 'new']; }
            if (flag === 'upd') { ex.id = id; return [ex, 'existing, extras replaced']; }
            if (flag === 'cancel') { ex.dead = true; const r = { k, id }; records.push(r); return [r, 'old one canceled, new one made']; }
            return [ex, 'existing, old extras kept'];
          }
          async function post() {
            if (busy) return; busy = true;
            try {
              records = []; notes = {}; shade.replaceChildren(); paintTable();
              say(o, 'Posting breaking news for article 41, then 42.');
              for (const id of [41, 42]) {
                await sleep(450); if (!el.isConnected) return;
                const [r, what] = get(id);
                notes[id] = r;
                const n = h('button', { class: 'plt-note plt-tap drop-in', onclick: () => tap(id) }, h('span', { class: 'plt-note-ch' }, 'news · tap to open'), h('b', {}, `Article ${id}`), h('span', {}, 'Breaking news'));
                shade.prepend(n);
                paintTable();
                o.append(h('div', { class: 'line drop-in' }, `article ${id}: ${what}`));
              }
              o.append(h('div', { class: 'line drop-in' }, 'Tap each notification on the phone.'));
            } finally { busy = false; }
          }
          function tap(id) {
            if (busy) return;
            const r = notes[id];
            if (!r) return;
            if (r.dead) { replay(ph.dev, 'shake'); say(o, `Article ${id} notification: <span class="bad">nothing happens.</span> Its PendingIntent was canceled.`); return; }
            const ok = r.id === id;
            say(o, `Article ${id} notification opens <span class="${ok ? 'good' : 'bad'}">article ${r.id}</span>${ok ? '.' : '. Wrong article.'}`);
          }
          const keys = choice('identity', Object.keys(KEYS), key, v => { if (busy) return false; key = v; paintSrc(); records = []; notes = {}; shade.replaceChildren(); paintTable(); }, v => KEYS[v]);
          const flags = choice('flags', Object.keys(FLAGS), flag, v => { if (busy) return false; flag = v; paintSrc(); records = []; notes = {}; shade.replaceChildren(); paintTable(); }, v => ({ none: 'none', upd: 'UPDATE_CURRENT', cancel: 'CANCEL_CURRENT' })[v]);
          paintSrc(); paintTable();
          o.innerHTML = 'Pick how the PendingIntent is made, then post two notifications.';
          el.append(keys.el, flags.el, src,
            h('div', { class: 'plt-split' },
              h('div', { class: 'plt-col' }, h('div', { class: 'controls plt-row' }, act('Post article 41, then 42', post)), h('span', { class: 'plt-label' }, 'PendingIntents the system holds'), table, o),
              ph.dev));
        },
      },
      {
        title: 'Treat deep link input as untrusted',
        body: `<p>Any app, web page or <code>adb</code> command can fire your exported deep link with whatever it likes in the URI. App Link verification decides which app opens your https links. It doesn't stop another app from sending your Activity a crafted Intent.</p>
<p>So parse defensively: check scheme, host and path, parse ids strictly, and never load a URL from a parameter into a WebView or a redirect unless its host is on an allowlist. Anything you don't recognize goes to the home screen.</p>`,
        code: `sealed interface Route {
    data class Article(val id: Long) : Route
    data class Web(val url: Uri) : Route
    data object Home : Route
}

fun parse(uri: Uri?): Route {
    if (uri == null || uri.scheme != "https" || uri.host != "news.example.com") return Route.Home
    val path = uri.pathSegments
    return when {
        path.size == 2 && path[0] == "article" ->
            path[1].toLongOrNull()?.let { Route.Article(it) } ?: Route.Home
        path == listOf("web") ->
            uri.getQueryParameter("url")?.toUri()
                ?.takeIf { it.scheme == "https" && it.host in TRUSTED_HOSTS }
                ?.let { Route.Web(it) } ?: Route.Home
        else -> Route.Home
    }
}`,
        visual(el) {
          const IN = [
            { uri: 'https://news.example.com/article/42', raw: ['article', 'Article 42'], safe: ['article', 'Article 42'] },
            { uri: 'https://news.example.com/article/42abc', raw: ['crash', 'NumberFormatException: For input string: "42abc"'], safe: ['home', 'not a number: home screen'] },
            { uri: 'https://news.example.com/web?url=https://evil.example/login', raw: ['web', 'evil.example/login'], safe: ['home', 'host not on the allowlist: home screen'] },
            { uri: 'https://news.example.com/web?url=https://news.example.com/help', raw: ['web', 'news.example.com/help'], safe: ['web', 'news.example.com/help'] },
          ];
          let validate = false;
          const ph = phone();
          const o = out();
          function show(kind, text) {
            const lines = () => [h('span', { class: 'plt-ln', style: 'width:90%' }), h('span', { class: 'plt-ln', style: 'width:70%' }), h('span', { class: 'plt-ln', style: 'width:80%' })];
            if (kind === 'article') ph.screen.replaceChildren(h('div', { class: 'plt-appbar drop-in' }, text), ...lines());
            else if (kind === 'home') ph.screen.replaceChildren(h('div', { class: 'plt-appbar drop-in' }, 'Home'), ...lines());
            else if (kind === 'web') ph.screen.replaceChildren(h('div', { class: 'plt-appbar drop-in' }, 'News'), h('div', { class: 'plt-ps2-url' + (text.startsWith('evil') ? ' plt-ps2-evil' : '') }, text), text.startsWith('evil') ? h('div', { class: 'plt-note' }, h('b', {}, 'Sign in'), h('span', {}, 'email · password')) : null, ...lines());
            else ph.screen.replaceChildren(h('div', { class: 'plt-note plt-ps2-crash drop-in' }, h('b', {}, 'Scores keeps stopping'), h('span', {}, 'Close app')));
          }
          function fire(x) {
            const [kind, text] = validate ? x.safe : x.raw;
            show(kind, text);
            say(o, `${hl('adb shell am start -a android.intent.action.VIEW -d')} "${x.uri}"`);
            const bad = kind === 'crash' || (kind === 'web' && text.startsWith('evil'));
            if (bad) replay(ph.dev, 'shake');
            o.append(h('div', { class: 'line drop-in', html: kind === 'crash' ? `<span class="bad">FATAL EXCEPTION: ${text}</span>` : kind === 'web' && bad ? '<span class="bad">your WebView shows a fake login page inside your app, under your app bar.</span>' : validate && kind === 'home' ? `<span class="good">rejected:</span> ${text}` : `<span class="good">opened:</span> ${text}` }));
          }
          const vt = toggle('plt-ps2-validate', 'parse with checks and an allowlist', false, v => { validate = v; say(o, v ? 'Routing through parse(). Fire the same links again.' : 'Raw handling: the code trusts every part of the URI.'); });
          show('home', '');
          o.innerHTML = 'The app reads ids and URLs straight from the URI. Fire some links at it.';
          el.append(h('div', { class: 'plt-split' },
            h('div', { class: 'plt-col' }, vt.el, h('div', { class: 'plt-events plt-ps2-wrap' }, IN.map(x => h('button', { class: 'cmd', onclick: () => fire(x) }, x.uri.replace('https://', '')))), o),
            ph.dev));
        },
      },
    ],
    underHood: {
      body: `<p>A PendingIntent is a handle to a record kept by the activity manager in <code>system_server</code>. The record holds the Intent, the flags and your app's identity. Your process can die and the notification still works, because the system keeps the record. On a tap the system starts the stored Intent as your app, with your permissions.</p>
<p><code>FLAG_IMMUTABLE</code> means whoever holds the handle can't fill in any part of the Intent when sending it. A mutable one lets the sender fill in missing fields, which inline reply needs to add the typed text. With an implicit Intent that is risky, since the holder could fill in where it goes. Apps targeting Android 14 get an exception when they create a mutable PendingIntent with an Intent that names no component or package.</p>`,
    },
    mistakes: [
      {
        title: 'A mutable PendingIntent with an implicit Intent',
        bad: `val reply = PendingIntent.getBroadcast(context, id,
    Intent(ACTION_REPLY),                                 // no component, no package
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)`,
        good: `val reply = PendingIntent.getBroadcast(context, id,
    Intent(context, ReplyReceiver::class.java).setAction(ACTION_REPLY),
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)   // RemoteInput fills it in`,
        why: 'Apps targeting Android 14 get an exception for the first form. Make the Intent explicit. Inline reply still needs <code>FLAG_MUTABLE</code> so the system can add the typed text.',
      },
      {
        title: 'A custom scheme for links people share',
        bad: `// <intent-filter>
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <category android:name="android.intent.category.BROWSABLE" />
//     <data android:scheme="newsapp" android:host="article" />
// </intent-filter>`,
        good: `// <intent-filter android:autoVerify="true">
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <category android:name="android.intent.category.BROWSABLE" />
//     <data android:scheme="https" android:host="news.example.com" android:pathPrefix="/article/" />
// </intent-filter>`,
        why: 'Any app can claim <code>newsapp://</code>, and the link is dead where your app isn’t installed. A verified https App Link opens your app when it’s there and your website when it isn’t.',
      },
      {
        title: 'A notification trampoline',
        bad: `// Tap goes to a receiver that logs, then starts the Activity
.setContentIntent(PendingIntent.getBroadcast(context, id,
    Intent(context, TapReceiver::class.java), PendingIntent.FLAG_IMMUTABLE))
// TapReceiver.onReceive: analytics.log(...); context.startActivity(articleIntent)`,
        good: `.setContentIntent(PendingIntent.getActivity(context, id,
    articleIntent, PendingIntent.FLAG_IMMUTABLE))
// ArticleActivity logs the open itself`,
        why: 'Apps targeting Android 12 can’t start an Activity from a service or receiver that a notification tap started. The tap then does nothing. Point the PendingIntent at the Activity.',
      },
    ],
  };

  // ─── Promoted: notification styles and actions ─────────────────────────
  const stylesLesson = {
    id: 'styles',
    title: 'Notification styles and actions',
    tagline: 'A style decides what the expanded notification shows. Actions let the user answer without opening the app.',
    level: 'intermediate',
    body: `
<p>A plain notification shows one line of text and cuts the rest. <code>setStyle()</code> gives it an expanded view that fits the content: <code>BigTextStyle</code> for a long paragraph, <code>BigPictureStyle</code> for an image, <code>InboxStyle</code> for a list of short lines (only the first six show), and <code>MessagingStyle</code> for a chat.</p>
<p><code>MessagingStyle</code> takes a <code>Person</code> for "me" and one per message, and it ignores <code>setContentTitle()</code> and <code>setContentText()</code>. Set a conversation title only for group chats: the system reads it as a hint that the chat is a group.</p>
<p><code>addAction()</code> adds a button with its own <code>PendingIntent</code>. A notification shows up to three of them. Don't repeat what a tap on the notification already does. An action can also carry a <code>RemoteInput</code>, which turns it into an inline reply box.</p>`,
    code: `fun reportNotification(context: Context, id: Int, report: Report): Notification =
    NotificationCompat.Builder(context, NEWS_CHANNEL)
        .setSmallIcon(R.drawable.ic_stat_news)
        .setContentTitle(report.title)
        .setContentText(report.summary)                       // the collapsed line
        .setStyle(NotificationCompat.BigTextStyle().bigText(report.fullText))
        .setContentIntent(openArticle(context, report.id))     // the tap opens the article
        .addAction(R.drawable.ic_bookmark, context.getString(R.string.read_later),
            PendingIntent.getBroadcast(context, id,
                Intent(context, ReadLaterReceiver::class.java).putExtra("id", report.id),
                PendingIntent.FLAG_IMMUTABLE))
        .setAutoCancel(true)
        .build()

// A chat: MessagingStyle ignores setContentTitle and setContentText.
val me = Person.Builder().setName("You").build()
val maya = Person.Builder().setName("Maya").build()
val chat = NotificationCompat.MessagingStyle(me)
    .addMessage("What time is the game?", t1, maya)
    .addMessage("9 pm. Are you coming?", t2, me)
    // no setConversationTitle(): this is a one-on-one chat`,
    remember: 'A style for the content, up to three actions, none that repeat the tap.',
    deeper: [
      {
        title: 'Inline reply with RemoteInput',
        body: `<p>A reply action carries a <code>RemoteInput</code> with a result key. When the user sends text, the system writes it into the action's Intent. That is why the reply <code>PendingIntent</code> must be <code>FLAG_MUTABLE</code> and explicit: an immutable one can't be filled in, and your receiver gets no text. Give each conversation its own request code, or replies can land in the wrong chat.</p>
<p>In the receiver, read the text with <code>RemoteInput.getResultsFromIntent()</code>. Then post the notification again with the same id. Until you do, the reply box keeps spinning, and the user can't tell whether the message went out.</p>`,
        code: `const val KEY_TEXT_REPLY = "key_text_reply"

val remoteInput = RemoteInput.Builder(KEY_TEXT_REPLY).setLabel("Reply").build()
val replyIntent = PendingIntent.getBroadcast(context, conversationId,   // one per conversation
    Intent(context, ReplyReceiver::class.java).putExtra("chat", conversationId),
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)    // the system adds the text
val reply = NotificationCompat.Action.Builder(R.drawable.ic_reply, "Reply", replyIntent)
    .addRemoteInput(remoteInput)
    .build()

class ReplyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val text = RemoteInput.getResultsFromIntent(intent)?.getCharSequence(KEY_TEXT_REPLY) ?: return
        val chat = intent.getIntExtra("chat", 0)
        ChatWork.send(context, chat, text.toString())
        // Same id: replaces the spinning reply box with the updated conversation.
        NotificationManagerCompat.from(context).notify(chat, chatNotification(context, chat))
    }
}`,
        visual(el) {
          let mutable = true, update = true, phase = 'idle';
          const msgs = [['Maya', 'What time is the game?'], ['You', '9 pm. Are you coming?'], ['Maya', 'Do you have the tickets?']];
          const ph = phone();
          const o = out();
          function paint() {
            const kids = [h('div', { class: 'plt-sty-head' }, h('span', { class: 'plt-note-ch' }, 'chat · Maya'))];
            msgs.forEach(([who, t]) => kids.push(h('span', { class: 'plt-sty-msg' }, h('b', {}, who + ': '), t)));
            if (phase === 'idle') kids.push(h('div', { class: 'plt-sty-acts' }, h('button', { class: 'plt-sty-act', onclick: openBox }, 'Reply'), h('button', { class: 'plt-sty-act', onclick: () => say(o, 'Mark as read: a second action. Try Reply.') }, 'Mark as read')));
            if (phase === 'typing') kids.push(h('div', { class: 'plt-sty-input drop-in' }, h('span', {}, 'Yes, I have them!'), h('button', { class: 'plt-sty-act', onclick: send }, 'Send')));
            if (phase === 'sending') kids.push(h('div', { class: 'plt-sty-input' }, h('span', {}, 'Yes, I have them!'), h('span', { class: 'plt-sty-spin', 'aria-label': 'sending' })));
            ph.screen.replaceChildren(h('p', { class: 'plt-shade-title' }, 'Notification shade'), h('div', { class: 'plt-note plt-sty-note' }, kids));
          }
          function openBox() { if (phase !== 'idle') return; phase = 'typing'; paint(); say(o, 'The reply box is open. Tap Send on the phone.'); }
          async function send() {
            if (phase !== 'typing') return;
            phase = 'sending'; paint();
            say(o, 'The system puts the typed text into the reply Intent and sends the PendingIntent.');
            await sleep(700); if (!el.isConnected) return;
            if (!mutable) {
              o.append(h('div', { class: 'line drop-in', html: `<span class="bad">getResultsFromIntent() = null.</span> An immutable PendingIntent can’t be filled in, so the text never arrived. The receiver returns and the box keeps spinning.` }));
              replay(ph.dev, 'shake'); return;
            }
            o.append(h('div', { class: 'line drop-in', html: `<span class="good">ReplyReceiver:</span> text = "Yes, I have them!" → ChatWork.send()` }));
            await sleep(700); if (!el.isConnected) return;
            if (!update) {
              o.append(h('div', { class: 'line drop-in', html: '<span class="bad">no notify() after the reply.</span> The message went out, but the box spins on. The user may send it twice.' }));
              replay(ph.dev, 'shake'); return;
            }
            msgs.push(['You', 'Yes, I have them!']); while (msgs.length > 4) msgs.shift();
            phase = 'idle'; paint();
            o.append(h('div', { class: 'line drop-in', html: '<span class="good">notify(chat, updated)</span> with the same id. The reply shows in the conversation.' }));
          }
          function reset() { phase = 'idle'; paint(); say(o, 'Maya wrote. Reply from the notification.'); }
          const tm = toggle('plt-sty-mut', 'reply PendingIntent is FLAG_MUTABLE', true, v => { mutable = v; reset(); });
          const tu = toggle('plt-sty-upd', 'notify() again after the reply', true, v => { update = v; reset(); });
          reset();
          el.append(h('div', { class: 'plt-split' },
            h('div', { class: 'plt-col' }, tm.el, tu.el, h('div', { class: 'controls plt-row' }, act('Reset', reset)), o),
            ph.dev));
        },
      },
      {
        title: 'Progress that doesn’t buzz every time',
        body: `<p>For a download or an upload, call <code>setProgress(max, progress, false)</code> and post the same id again as the work moves. Use <code>setProgress(0, 0, true)</code> while you don't know the size yet. When it finishes, <code>setProgress(0, 0, false)</code> removes the bar.</p>
<p>Every post on a channel that makes sound would alert again. <code>setOnlyAlertOnce(true)</code> makes only the first post alert. Don't post too often either: the system rate-limits updates, and many posts within one second can be dropped. A few steps per second is plenty.</p>`,
        code: `val builder = NotificationCompat.Builder(context, DOWNLOADS_CHANNEL)
    .setSmallIcon(R.drawable.ic_stat_download)
    .setContentTitle("Downloading episode 12")
    .setOngoing(true)
    .setOnlyAlertOnce(true)          // sound and vibration on the first post only

downloads.collect { p ->
    builder.setProgress(100, p.percent, false)
    manager.notify(DOWNLOAD_ID, builder.build())   // same id: an update, not a new card
}
builder.setContentTitle("Download complete")
    .setProgress(0, 0, false)                      // removes the bar
    .setOngoing(false)
manager.notify(DOWNLOAD_ID, builder.build())`,
        visual(el) {
          let once = true, busy = false, alerts = 0;
          const ph = phone();
          const bar = h('span');
          const title = h('b', {}, 'Episode 12');
          const pct = h('span', {}, 'Not started');
          const card = h('div', { class: 'plt-note plt-sty-note' }, h('span', { class: 'plt-note-ch' }, 'downloads · DEFAULT'), title, pct, h('div', { class: 'plt-sty-bar' }, bar));
          ph.screen.append(h('p', { class: 'plt-shade-title' }, 'Notification shade'), card);
          const count = tag('alerts: 0');
          const o = out();
          async function run() {
            if (busy) return; busy = true; alerts = 0;
            try {
              title.textContent = 'Downloading episode 12'; bar.parentElement.hidden = false;
              say(o, 'Posting an update every 20%.');
              for (let p = 0; p <= 100; p += 20) {
                bar.style.width = p + '%'; pct.textContent = p + '%';
                if (p === 0 || !once) { alerts++; replay(ph.dev, 'shake'); }
                count.textContent = `alerts: ${alerts}`; count.className = 'plt-tag ' + (alerts > 1 ? 'plt-no' : 'plt-ok');
                await sleep(550); if (!el.isConnected) return;
              }
              title.textContent = 'Download complete'; pct.textContent = 'Tap to watch'; bar.parentElement.hidden = true; replay(card, 'pop');
              o.append(h('div', { class: 'line drop-in', html: once ? '<span class="good">One alert</span> for the whole download. setProgress(0, 0, false) removed the bar.' : `<span class="bad">${alerts} alerts</span> for one download. Each update buzzed the phone.` }));
            } finally { busy = false; }
          }
          const t = toggle('plt-sty-once', 'setOnlyAlertOnce(true)', true, v => { once = v; });
          o.innerHTML = 'Start a download. The channel makes sound.';
          el.append(h('div', { class: 'plt-split' },
            h('div', { class: 'plt-col' }, t.el, h('div', { class: 'controls plt-row' }, cmd('notify(DOWNLOAD_ID, builder.build())', run)), h('div', { class: 'plt-group' }, count), o),
            ph.dev));
        },
      },
      {
        title: 'Live Updates on Android 16',
        body: `<p>Android 16 added <code>ProgressStyle</code> for start-to-end journeys like a delivery or a ride, with segments and milestone points on the bar. It also added Live Updates: a promoted notification that sits at the top of the shade and the lock screen and shows as a chip in the status bar.</p>
<p>To be promoted, the notification must be ongoing, have a title, request promotion, and use the standard style, <code>BigTextStyle</code>, <code>CallStyle</code>, <code>ProgressStyle</code> or <code>MetricStyle</code>. No custom views, no colorized notifications, no group summaries, and the channel can't be <code>IMPORTANCE_MIN</code>. The app also declares <code>POST_PROMOTED_NOTIFICATIONS</code>. Use it only for things the user started, that are happening now and need watching: a ride, a delivery, navigation. Not for ads, chat messages or reminders. The user can turn Live Updates off per app.</p>`,
        code: `// <uses-permission android:name="android.permission.POST_PROMOTED_NOTIFICATIONS" />

val delivery = NotificationCompat.Builder(context, DELIVERY_CHANNEL)   // not IMPORTANCE_MIN
    .setSmallIcon(R.drawable.ic_stat_delivery)
    .setContentTitle("Your order is on the way")       // a title is required
    .setContentText("Courier is 5 minutes away")
    .setOngoing(true)
    .setRequestPromotedOngoing(true)
    .build()
manager.notify(DELIVERY_ID, delivery)

// The user can switch Live Updates off for your app. Then it shows as a normal notification.
if (Build.VERSION.SDK_INT >= 36 && !manager.canPostPromotedNotifications()) {
    // offer Settings.ACTION_MANAGE_APP_PROMOTED_NOTIFICATIONS where it makes sense
}`,
      },
    ],
    mistakes: [
      {
        title: 'Setting a title on a chat notification',
        bad: `NotificationCompat.Builder(context, CHAT_CHANNEL)
    .setContentTitle("Maya")
    .setContentText("What time is the game?")
    .setStyle(NotificationCompat.MessagingStyle(me)
        .setConversationTitle("Maya")              // one-on-one chat
        .addMessage("What time is the game?", t, maya))`,
        good: `NotificationCompat.Builder(context, CHAT_CHANNEL)
    .setStyle(NotificationCompat.MessagingStyle(me)
        .addMessage("What time is the game?", t, maya))       // the sender Person names the chat`,
        why: 'MessagingStyle ignores the content title and text. A conversation title tells the system the chat is a group, so a one-on-one chat is shown as one.',
      },
      {
        title: 'An action that repeats the tap',
        bad: `.setContentIntent(openArticle)
.addAction(R.drawable.ic_open, "Open", openArticle)`,
        good: `.setContentIntent(openArticle)
.addAction(R.drawable.ic_bookmark, "Read later", readLater)`,
        why: 'Tapping the notification already opens the article. Use the few action slots for things the user can do without opening the app.',
      },
      {
        title: 'One reply PendingIntent for every chat',
        bad: `PendingIntent.getBroadcast(context, 0, replyIntent, FLAG_UPDATE_CURRENT or FLAG_MUTABLE)`,
        good: `PendingIntent.getBroadcast(context, conversationId, replyIntent, FLAG_UPDATE_CURRENT or FLAG_MUTABLE)`,
        why: 'Extras don’t make PendingIntents different. With request code 0, every chat shares one, and a reply can go to the wrong conversation.',
      },
    ],
    terms: [
      { term: 'NotificationCompat.Style', def: 'The expanded layout of a notification, such as BigTextStyle, BigPictureStyle, InboxStyle or MessagingStyle, set with setStyle().' },
      { term: 'Notification action', def: 'A button added with addAction() that fires its own PendingIntent; a notification shows up to three.' },
      { term: 'RemoteInput', def: 'An input attached to an action that lets the user type a reply in the notification; the text arrives in the action’s Intent.' },
      { term: 'Live Update', def: 'An Android 16 promoted ongoing notification shown at the top of the shade, on the lock screen and as a status bar chip.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Show the full match report when the user expands the notification.', code: 'NotificationCompat.Builder(context, NEWS_CHANNEL)\n    .setSmallIcon(R.drawable.ic_stat_news)\n    .setContentTitle("Derby report")\n    .setContentText(report.summary)\n    .[[setStyle]](NotificationCompat.[[BigTextStyle]]().bigText(report.fullText))\n    .build()', why: '<code>BigTextStyle</code> fills the expanded view with the long text. The content text stays as the collapsed line.' },
      { type: 'bug', prompt: 'Users type a reply in the notification and tap send. The receiver runs, but the text is always null. Tap the line.', code: 'val remoteInput = RemoteInput.Builder(KEY_TEXT_REPLY).setLabel("Reply").build()\nval intent = Intent(context, ReplyReceiver::class.java).putExtra("chat", chatId)\nval pending = PendingIntent.getBroadcast(context, chatId, intent,\n    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)\nval action = NotificationCompat.Action.Builder(R.drawable.ic_reply, "Reply", pending)\n    .addRemoteInput(remoteInput)\n    .build()', bug: 3, fix: '    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)', why: 'The system adds the typed text to the Intent when it sends the PendingIntent. An immutable one can’t be filled in, so <code>getResultsFromIntent()</code> finds nothing.' },
    ],
    quiz: [
      { q: 'You add five lines with <code>InboxStyle.addLine()</code>, then two more. How many show when expanded?', options: ['All seven', 'Six', 'Five'], a: 1, why: 'InboxStyle shows up to six lines. Put a "+1 more" in the summary text if it matters.' },
      { q: 'You set <code>setContentTitle("Maya")</code> on a <code>MessagingStyle</code> notification. What does the user see?', options: ['"Maya" as the title', 'The title is ignored; the style decides what shows', 'Both the title and the conversation'], a: 1, why: 'MessagingStyle ignores setContentTitle and setContentText. Senders come from the Person on each message.' },
      { q: 'A download notification on a sound-making channel is updated ten times. How do you make it alert only once?', options: ['Post each update with a new id', '<code>setOnlyAlertOnce(true)</code>', 'Use <code>IMPORTANCE_HIGH</code>'], a: 1, why: 'setOnlyAlertOnce lets only the first post make sound or vibrate. New ids would stack ten cards.' },
      { q: 'Inline replies arrive with no text. Which line is the bug?<pre class="code mini">val pi = PendingIntent.getBroadcast(\n  ctx, chatId,                    // 1\n  replyIntent,                    // 2\n  PendingIntent.FLAG_IMMUTABLE)   // 3\nbuilder.addRemoteInput(input)     // 4</pre>', options: ['Line 1', 'Line 3', 'Line 4'], a: 1, why: 'The system writes the reply into the action’s Intent, so the reply PendingIntent must be FLAG_MUTABLE and explicit. An immutable one cannot be filled in.' },
      { q: 'Your receiver reads the inline reply and sends it, but the reply box in the notification keeps spinning. What is missing?', options: ['setOnlyAlertOnce(true) on the original notification', 'Posting the notification again with the same id', 'Calling cancelAll() on the NotificationManager'], a: 1, why: 'The spinner stays until you update the notification. Post it again with the same id, for example with the sent message added.' },
    ],
    visual(el) {
      const STY = {
        plain: { label: 'none', src: '// no setStyle(): one line, the rest is cut' },
        big: { label: 'BigTextStyle', src: '.setStyle(NotificationCompat.BigTextStyle().bigText(report.fullText))' },
        pic: { label: 'BigPictureStyle', src: '.setLargeIcon(photo)\n.setStyle(NotificationCompat.BigPictureStyle().bigPicture(photo).bigLargeIcon(null as Bitmap?))' },
        inbox: { label: 'InboxStyle', src: '.setStyle(NotificationCompat.InboxStyle()\n    .addLine("Derby ends 2-1")\n    // ... 7 lines added: only the first six show\n    .setSummaryText("7 new"))' },
        msg: { label: 'MessagingStyle', src: '.setStyle(NotificationCompat.MessagingStyle(me)\n    .addMessage("What time is the game?", t1, maya)\n    .addMessage("9 pm. Are you coming?", t2, me)\n    .addMessage("Do you have the tickets?", t3, maya))' },
      };
      const STORY = 'Team A beat Team B 2-1. The winner came in the 88th minute after a long VAR check, and the visitors finished with ten men.';
      const LINES = ['Derby ends 2-1', 'Coach: “Best night of the season”', 'Transfer: keeper talks go on', 'Women’s league: 3-0 away win', 'Basketball preview', 'Volleyball cup final', 'U19: late equalizer'];
      const ACTIONS = ['Read later', 'Share', 'Mute team', 'Report'];
      let style = 'big', open = false, acts = 1;
      const ph = phone();
      const src = h('div', { class: 'kt' });
      const o = out();
      function content() {
        if (style === 'msg') {
          const m = [['Maya', 'What time is the game?'], ['You', '9 pm. Are you coming?'], ['Maya', 'Do you have the tickets?']];
          return open ? [h('b', {}, 'Maya'), ...m.map(([w, t]) => h('span', { class: 'plt-sty-msg' }, h('b', {}, w + ': '), t))]
            : [h('b', {}, 'Maya'), h('span', { class: 'plt-sty-one' }, m[2][1])];
        }
        if (style === 'inbox') return open ? [h('b', {}, 'Sports news'), ...LINES.slice(0, 6).map(l => h('span', { class: 'plt-sty-one' }, l))]
          : [h('b', {}, 'Sports news'), h('span', { class: 'plt-sty-one' }, '7 new')];
        if (style === 'pic') return open ? [h('b', {}, 'Derby report'), h('span', { class: 'plt-sty-one' }, 'The winner in the 88th minute'), h('div', { class: 'plt-sty-pic', role: 'img', 'aria-label': 'match photo' })]
          : [h('div', { class: 'plt-sty-row' }, h('span', {}, h('b', {}, 'Derby report'), h('span', { class: 'plt-sty-one' }, 'The winner in the 88th minute')), h('span', { class: 'plt-sty-thumb', role: 'img', 'aria-label': 'thumbnail' }))];
        if (style === 'big' && open) return [h('b', {}, 'Derby report'), h('span', {}, STORY)];
        return [h('b', {}, 'Derby report'), h('span', { class: 'plt-sty-one' }, STORY)];
      }
      function paint() {
        src.innerHTML = hl(STY[style].src + (acts ? '\n' + ACTIONS.slice(0, acts).map(a => `.addAction(icon, "${a}", pendingIntent)`).join('\n') : ''));
        const head = h('div', { class: 'plt-sty-head' }, h('span', { class: 'plt-note-ch' }, style === 'msg' ? 'chat' : 'news'),
          h('button', { class: 'plt-sty-chev', 'aria-label': open ? 'collapse' : 'expand', onclick: flip }, open ? '▴' : '▾'));
        const shown = Math.min(acts, 3);
        const actRow = open && shown ? h('div', { class: 'plt-sty-acts' }, ACTIONS.slice(0, shown).map(a => h('span', { class: 'plt-sty-act' }, a))) : null;
        ph.screen.replaceChildren(h('p', { class: 'plt-shade-title' }, 'Notification shade'), h('div', { class: 'plt-note plt-sty-note drop-in' }, head, ...content(), actRow));
      }
      function flip() {
        open = !open; paint();
        const notes = {
          plain: open ? 'Nothing more to show. Without a style, the cut text stays cut.' : 'Collapsed: one line.',
          big: open ? 'BigTextStyle: the whole paragraph in the expanded view.' : 'Collapsed: the content text, cut to one line.',
          pic: open ? 'BigPictureStyle: the image fills the card. bigLargeIcon(null) hides the thumbnail.' : 'Collapsed: the large icon works as a thumbnail.',
          inbox: open ? '<span class="bad">7 lines added, 6 shown.</span> InboxStyle cuts each line and stops at six.' : 'Collapsed: the summary.',
          msg: open ? 'MessagingStyle: each message with its sender. setContentTitle is ignored.' : 'Collapsed: the latest message.',
        };
        say(o, notes[style] + (open && acts ? ' Actions show under the content.' : ''));
      }
      function addAct() {
        if (acts >= 3) { acts = 4; open = true; paint(); replay(ph.dev, 'shake'); say(o, '<span class="bad">A fourth addAction().</span> A notification shows up to three action buttons. Pick the three that matter.'); return; }
        acts++; open = true; paint(); say(o, `addAction(): ${acts} action${acts > 1 ? 's' : ''}. Each has its own PendingIntent.`);
      }
      const styles = choice('setStyle', Object.keys(STY), style, v => { style = v; open = false; paint(); say(o, `${STY[v].label}. Tap ▾ on the phone to expand.`); }, v => STY[v].label);
      paint();
      o.innerHTML = 'Pick a style, then tap ▾ on the notification to expand it.';
      el.append(styles.el, src,
        h('div', { class: 'plt-split' },
          h('div', { class: 'plt-col' }, h('div', { class: 'controls plt-row' }, act('Expand / collapse', flip), cmd('addAction(...)', addAct), act('Clear actions', () => { acts = 0; paint(); say(o, 'No actions.'); })), o),
          ph.dev));
    },
  };

  // ─── Promoted: verified App Links ──────────────────────────────────────
  const appLinksLesson = {
    id: 'app-links',
    title: 'Verified App Links',
    tagline: 'Your website vouches for your app, so https links open it without a chooser.',
    level: 'intermediate',
    body: `
<p>Any app can declare an intent filter for <code>https://news.example.com</code>. Android App Links prove the site belongs to you. Add <code>android:autoVerify="true"</code> to the filter, and publish a Digital Asset Links file at <code>https://news.example.com/.well-known/assetlinks.json</code> that names your package and signing certificate fingerprint.</p>
<p>When the app is installed, the system fetches that file for every host in your filters. Since Android 12, a web link opens your app only if it is approved for that exact domain. Otherwise it opens in the default browser. So a broken file doesn't crash anything. Your links quietly go to the web.</p>
<p>The file must be served over HTTPS as <code>application/json</code>, with no redirects, on every host you list. On Android 14 and lower the result is checked at install or update. Android 15 and later also re-check in the background, and a change can take up to a week to reach devices.</p>`,
    code: `// AndroidManifest.xml
// <intent-filter android:autoVerify="true">
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <category android:name="android.intent.category.BROWSABLE" />
//     <data android:scheme="https" />
//     <data android:host="news.example.com" />
//     <data android:pathPrefix="/article/" />
// </intent-filter>

// https://news.example.com/.well-known/assetlinks.json
// [{
//   "relation": ["delegate_permission/common.handle_all_urls"],
//   "target": {
//     "namespace": "android_app",
//     "package_name": "com.example.news",
//     "sha256_cert_fingerprints": ["14:6D:E9:83:...:44:E5"]
//   }
// }]

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val route = parse(intent?.data)      // still validate: anyone can send this Intent
        setContent { NewsApp(start = route) }
    }
}`,
    remember: 'autoVerify in the manifest, assetlinks.json on every host, no redirects, the Play signing fingerprint.',
    deeper: [
      {
        title: 'Test it with adb',
        body: `<p>Don't wait for a release to learn the file is wrong. On Android 12 and later you can run verification by hand. Reset the app's state, ask for a re-verify, wait a little, then read the result per domain. Only <code>verified</code> means it worked. <code>none</code> usually means the check hasn't finished yet. Codes of 1024 and up are the verifier's own error codes.</p>
<p>Then fire a link the way a browser would, with the <code>BROWSABLE</code> category, and see what opens.</p>`,
        code: `adb shell pm set-app-links --package com.example.news 0 all     # reset
adb shell pm verify-app-links --re-verify com.example.news       # needs internet
adb shell pm get-app-links com.example.news                       # read the result

#   Domain verification state:
#     news.example.com: verified

adb shell am start -a android.intent.action.VIEW \\
    -c android.intent.category.BROWSABLE \\
    -d "https://news.example.com/article/42"`,
        visual(el) {
          let server = false, state = 'legacy', busy = false;
          const PKG = 'com.example.news';
          const o = out();
          const term = h('div', { class: 'plt-steps', 'aria-live': 'polite' });
          const ph = phone();
          const show = (kind) => ph.screen.replaceChildren(h('div', { class: 'plt-appbar drop-in' + (kind === 'app' ? '' : ' plt-ext') }, kind === 'app' ? 'News · Article 42' : kind === 'web' ? 'Browser · news.example.com' : 'Home screen'), h('span', { class: 'plt-ln', style: 'width:90%' }), h('span', { class: 'plt-ln', style: 'width:70%' }));
          const line = (k, who, text) => { term.append(h('div', { class: `plt-step drop-in ${k ? 'plt-' + k : ''}` }, h('b', {}, who), h('span', { html: text }))); while (term.children.length > 5) term.firstElementChild.remove(); };
          const stateHtml = () => state === 'verified' ? '<span class="good">verified</span>' : state === 'none' ? 'none' : `<span class="bad">${state === 'legacy' ? '1024' : state}</span>`;
          async function run(which) {
            if (busy) return; busy = true;
            try {
              if (which === 'get') { line('', 'get', `news.example.com: ${stateHtml()}`); say(o, state === 'verified' ? 'Verified. Links to this host open the app.' : state === 'none' ? 'Nothing recorded yet. Run verify-app-links.' : 'Failed. Fix the file on the server, reset, and verify again.'); }
              if (which === 'reset') { state = 'none'; line('', 'set', 'state reset for all domains'); say(o, 'State cleared. Now verify.'); }
              if (which === 'verify') {
                line('wait', 'verify', 'fetching https://news.example.com/.well-known/assetlinks.json …');
                await sleep(1100); if (!el.isConnected) return;
                state = server ? 'verified' : 'legacy';
                line(server ? 'good' : 'bad', 'verify', server ? '200, application/json, fingerprint matches' : '301 redirect to www: the file must be served without redirects');
                say(o, 'Done. Read the result with get-app-links.');
              }
              if (which === 'open') {
                const app = state === 'verified';
                show(app ? 'app' : 'web'); replay(ph.dev, app ? 'pop' : 'shake');
                line(app ? 'good' : 'bad', 'am start', app ? 'opened MainActivity in your app' : 'opened the browser: the domain isn’t verified');
                say(o, app ? '<span class="good">The link opens your app.</span>' : '<span class="bad">Browser.</span> On Android 12+ an unapproved domain goes to the default browser.');
              }
            } finally { busy = false; }
          }
          const fix = toggle('plt-al-fix', 'server fixed: no redirect for assetlinks.json', false, v => { server = v; say(o, v ? 'The file is fixed on the server. The device still has the old result until you verify again.' : 'The server redirects assetlinks.json to www again.'); });
          show('home');
          o.innerHTML = 'Links keep opening the browser. Read the current state first.';
          el.append(fix.el,
            h('div', { class: 'plt-split' },
              h('div', { class: 'plt-col' },
                h('div', { class: 'plt-events plt-al-wrap' },
                  cmd(`pm get-app-links ${PKG}`, () => run('get')),
                  cmd(`pm set-app-links --package ${PKG} 0 all`, () => run('reset')),
                  cmd(`pm verify-app-links --re-verify ${PKG}`, () => run('verify')),
                  cmd('am start -a VIEW -c BROWSABLE -d "https://news.example.com/article/42"', () => run('open'))),
                term, o),
              ph.dev));
        },
      },
      {
        title: 'Which fingerprint goes in the file',
        body: `<p>The fingerprint must match the certificate that signed the APK on the user's phone. With Play App Signing, Google re-signs your app, so the SHA-256 that <code>keytool</code> prints for your upload key usually doesn't match. Play Console shows the right fingerprint, and a ready-made assetlinks.json snippet, under <b>Release › Setup › App signing</b>.</p>
<p><code>sha256_cert_fingerprints</code> takes a list. Add your debug or internal build certificates next to the release one, so links also work on test builds.</p>`,
        code: `// https://news.example.com/.well-known/assetlinks.json
// [{
//   "relation": ["delegate_permission/common.handle_all_urls"],
//   "target": {
//     "namespace": "android_app",
//     "package_name": "com.example.news",
//     "sha256_cert_fingerprints": [
//       "AB:12:...:9F",      // Play app signing key (from Play Console)
//       "3C:77:...:01"       // debug key, for local builds
//     ]
//   }
// }]`,
      },
      {
        title: 'Dynamic rules on Android 15',
        body: `<p>Paths in the manifest only change with a new release. On Android 15 and later, with Google services, assetlinks.json can also carry <code>dynamic_app_link_components</code>: an ordered list of path, query and fragment rules. The first match wins, <code>"exclude": true</code> sends a match to the browser, and a URL that matches nothing doesn't open the app.</p>
<p>Dynamic rules can only narrow what the manifest declares, never widen it. Older Android versions ignore them, and a malformed block falls back to the manifest rules.</p>`,
        code: `// "relation_extensions": {
//   "delegate_permission/common.handle_all_urls": {
//     "dynamic_app_link_components": [
//       { "/": "/article/*/comments", "exclude": true },   // checked first: stays on the web
//       { "/": "/article/*" },
//       { "/": "*", "exclude": true }
//     ]
//   }
// }`,
      },
    ],
    mistakes: [
      {
        title: 'Redirecting the file',
        bad: `# news.example.com/.well-known/assetlinks.json
# 301 → https://www.news.example.com/.well-known/assetlinks.json`,
        good: `# news.example.com/.well-known/assetlinks.json
# 200, Content-Type: application/json, served from this host`,
        why: 'The file must be reachable without any 301 or 302. A site-wide redirect rule often catches it by accident, and verification fails for that host.',
      },
      {
        title: 'The upload key fingerprint',
        bad: `// keytool -list -v -keystore upload.jks  → copied into assetlinks.json`,
        good: `// Play Console › Release › Setup › App signing → copy the app signing key's SHA-256`,
        why: 'With Play App Signing, users get an APK signed by Google’s key. Your upload key’s fingerprint doesn’t match it, so verification fails only in the store build.',
      },
      {
        title: 'One file for several hosts',
        bad: `<data android:host="news.example.com" />
<data android:host="m.news.example.com" />
<!-- assetlinks.json only on news.example.com -->`,
        good: `<data android:host="news.example.com" />
<data android:host="m.news.example.com" />
<!-- assetlinks.json on both hosts -->`,
        why: 'Each host is checked on its own. Links to a host without the file open in the browser.',
      },
    ],
    terms: [
      { term: 'Android App Link', def: 'An https deep link whose domain is verified for your app, so it opens the app without a chooser.' },
      { term: 'autoVerify', def: 'An intent-filter attribute that asks the system to verify the hosts in your web intent filters when the app is installed.' },
      { term: 'assetlinks.json', def: 'The Digital Asset Links file at /.well-known/ on your domain that names the package and certificate fingerprints allowed to handle its links.' },
      { term: 'Domain verification state', def: 'The per-host result shown by pm get-app-links; only "verified" means the app is approved for that domain.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Complete the filter so the system verifies the domain and browsers can open it.', code: '<intent-filter android:[[autoVerify]]="true">\n    <action android:name="android.intent.action.VIEW" />\n    <category android:name="android.intent.category.DEFAULT" />\n    <category android:name="android.intent.category.[[BROWSABLE]]" />\n    <data android:scheme="https" android:host="news.example.com" />\n</intent-filter>', why: '<code>autoVerify</code> starts verification. <code>BROWSABLE</code> lets links from a browser or another app reach the filter.' },
      { type: 'bug', prompt: 'The file is served over HTTPS with no redirect, and the fingerprint is right. Verification still fails. Tap the line.', code: '[{\n  "relation": ["delegate_permission/common.handle_all_urls"],\n  "target": {\n    "namespace": "android",\n    "package_name": "com.example.news",\n    "sha256_cert_fingerprints": ["14:6D:E9:83:...:44:E5"]\n  }\n}]', bug: 3, fix: '    "namespace": "android_app",', why: 'An Android app target uses the namespace <code>android_app</code>. Any other value doesn’t describe your app, so the statement doesn’t match.' },
    ],
    quiz: [
      { q: 'On Android 13, your filter has <code>autoVerify</code> but assetlinks.json returns 404. A user taps your link in a chat app. What opens?', options: ['Your app', 'A chooser dialog', 'The default browser'], a: 2, why: 'Since Android 12, a web link opens an app only if it is approved for that domain.' },
      { q: 'Your app uses Play App Signing. Which fingerprint belongs in assetlinks.json?', options: ['The upload key from keytool', 'The app signing key shown in Play Console', 'Any key, the package name is enough'], a: 1, why: 'Users install an APK signed with Play’s app signing key. Its SHA-256 must be in the file.' },
      { q: '<code>pm get-app-links</code> shows <code>news.example.com: none</code> right after install. What does it most likely mean?', options: ['Verification failed for good', 'The verifier hasn’t finished yet', 'The user turned links off'], a: 1, why: '<code>none</code> means nothing is recorded yet. Wait, re-run verification, and check again.' },
      { q: 'Your filters list news.example.com and m.news.example.com. assetlinks.json is served only on news.example.com. On Android 13, a user taps a link to m.news.example.com. What opens?', options: ['The app, since one verified host covers the others', 'The browser, because each host is checked on its own', 'A dialog asking which app to use'], a: 1, why: 'Verification is per host. Serve the file on every host your filters list.' },
      { q: 'On Android 15 with Google services, dynamic_app_link_components lists first <code>/promo/*</code> with <code>"exclude": true</code>, then <code>/*</code>. A user taps /promo/sale. What opens?', options: ['The app, because /* matches', 'The browser, because the first match wins and it excludes', 'The app, because dynamic rules widen the manifest'], a: 1, why: 'Rules are checked in order and the first match decides. Dynamic rules can only narrow what the manifest declares.' },
    ],
    visual(el) {
      const HOSTS = ['news.example.com', 'm.news.example.com'];
      const PROB = { ok: 'file OK', missing: '404', redirect: '301 redirect', upload: 'upload key' };
      const WHY = {
        ok: ['good', '200, application/json, package and fingerprint match'],
        missing: ['bad', '404: no assetlinks.json on this host'],
        redirect: ['bad', '301: the file must be served without redirects'],
        upload: ['bad', 'fingerprint is the upload key, not Play’s app signing key'],
      };
      const prob = { [HOSTS[0]]: 'ok', [HOSTS[1]]: 'missing' };
      const state = {};
      let installed = false, busy = false;
      const ph = phone();
      const log = h('div', { class: 'plt-steps' });
      const o = out();
      const cards = {};
      const show = (kind, host) => ph.screen.replaceChildren(h('div', { class: 'plt-appbar drop-in' + (kind === 'app' ? '' : ' plt-ext') }, kind === 'app' ? 'News · Article 42' : kind === 'web' ? 'Browser · ' + host : 'Chat · link from a friend'), h('span', { class: 'plt-ln', style: 'width:90%' }), h('span', { class: 'plt-ln', style: 'width:70%' }), h('span', { class: 'plt-ln', style: 'width:80%' }));
      const step = (k, who, text) => { log.append(h('div', { class: `plt-step drop-in ${k ? 'plt-' + k : ''}` }, h('b', {}, who), h('span', {}, text))); while (log.children.length > 4) log.firstElementChild.remove(); };
      function paintHost(host) {
        const c = cards[host];
        const s = state[host];
        c.box.className = 'plt-al-host' + (s === 'verified' ? ' plt-al-ok' : s && s !== 'verified' ? ' plt-al-bad' : '');
        c.st.textContent = !installed ? 'app not installed' : s === 'verified' ? 'verified' : s ? 'not verified' : '…';
        c.st.className = 'plt-tag ' + (!installed ? '' : s === 'verified' ? 'plt-ok' : s ? 'plt-no' : 'plt-wait');
      }
      HOSTS.forEach(host => {
        const st = tag('');
        const pick = choice('server', Object.keys(PROB), prob[host], v => {
          if (busy) return false;
          prob[host] = v;
          say(o, installed ? 'The server changed. This device keeps its old result until the app is reinstalled or updated (Android 14 and lower), or re-checks in the background (Android 15+).' : 'Server set. Install the app to run verification.');
        }, v => PROB[v]);
        const box = h('div', { class: 'plt-al-host' }, h('div', { class: 'plt-group' }, h('span', { class: 'plt-al-name' }, host), st), pick.el,
          h('div', { class: 'controls plt-al-wrap' }, act(`Tap https://${host}/article/42`, () => tap(host))));
        cards[host] = { box, st };
      });
      async function install() {
        if (busy) return; busy = true;
        try {
          installed = true; HOSTS.forEach(hh => { delete state[hh]; paintHost(hh); });
          log.replaceChildren();
          say(o, 'Installed. autoVerify="true", so the system checks every host in the filters.');
          for (const host of HOSTS) {
            await sleep(500); if (!el.isConnected) return;
            step('wait', 'GET', `https://${host}/.well-known/assetlinks.json`);
            await sleep(600); if (!el.isConnected) return;
            const [k, text] = WHY[prob[host]];
            state[host] = k === 'good' ? 'verified' : 'failed';
            step(k, host.split('.')[0], text);
            paintHost(host); replay(cards[host].box, k === 'good' ? 'pop' : 'shake');
          }
          o.append(h('div', { class: 'line drop-in' }, 'Each host has its own result. Now tap the links.'));
        } finally { busy = false; }
      }
      function tap(host) {
        if (busy) return;
        if (!installed) { show('web', host); say(o, 'The app isn’t installed, so the link opens the website. That is the upside of https links.'); return; }
        const ok = state[host] === 'verified';
        show(ok ? 'app' : 'web', host); replay(ph.dev, ok ? 'pop' : 'shake');
        say(o, ok ? `<span class="good">${host} is verified:</span> the app opens straight away.` : `<span class="bad">${host} isn’t verified:</span> Android 12+ opens it in the browser. No error, no crash.`);
      }
      HOSTS.forEach(paintHost);
      show('chat');
      o.innerHTML = 'Set up each host’s server, then install the app.';
      el.append(
        h('div', { class: 'plt-split' },
          h('div', { class: 'plt-col' }, h('div', { class: 'plt-al-hosts' }, HOSTS.map(hh => cards[hh].box)), h('div', { class: 'controls plt-row' }, act('Install the app', install)), log, o),
          ph.dev));
    },
  };

  Lab.addTrack({
    id: 'push',
    title: 'Notifications and push',
    description: 'Notification channels, styles and actions, FCM tokens and messages, and deep links and App Links that land the user on the right screen.',
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
        deeper: channelsDepth.deeper,
        underHood: channelsDepth.underHood,
        mistakes: channelsDepth.mistakes,
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

      // 1b: promoted from the gap audit
      stylesLesson,

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
          { q: 'Your server stores tokens with an auto-increment row id and no unique key on the token. Bob signs in on Ada’s old phone. What happens?', options: ['Only Bob gets notifications on that phone', 'Two rows point at the phone, so Ada’s pushes keep landing on it', 'FCM rejects the second registration'], a: 1, why: 'A token belongs to one user at a time. Make the token the unique key and upsert on it, so Bob’s sign-in moves the row.' },
          { q: 'sendEach returns UNAVAILABLE for token A and UNREGISTERED for token B. What should the server do?', options: ['Delete both tokens', 'Retry A with exponential backoff, delete B', 'Retry both right away with the same request'], a: 1, why: 'UNAVAILABLE is temporary, so retry with backoff and honor Retry-After. UNREGISTERED means the token will never work again.' },
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
                { name: 'Cal, old phone in a drawer', off: 0, opens: false },
                { name: 'Dee, uninstalled the app', off: 1, opens: false, uninstall: true },
                { name: 'Eve, broke her phone', off: 3, opens: false },
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
          { q: 'The phone is offline. You send five live score updates with the same collapse_key. When it reconnects, what arrives?', options: ['All five, in order', 'Only the newest one', 'Nothing; onDeletedMessages() runs instead'], a: 1, why: 'FCM keeps just the newest message per collapse key. Non-collapsible messages would all be kept, up to 100.' },
          { q: 'Your launcher Activity is singleTask and already running. The user taps a background notification message. You read the extras only in onCreate. What happens?', options: ['The article opens as expected', 'The app comes forward but the article does not open, because the tap arrives in onNewIntent', 'The app crashes with a missing extra'], a: 1, why: 'With singleTop or singleTask, a running Activity gets the new Intent in onNewIntent. Handle it there too.' },
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
<p>Give each notification its own request code. The system matches PendingIntents by action, data, type, component and categories, not by extras, so two that differ only in extras become one. For https links shared outside the app, verify your domain so they open the app directly. On Android 12+, an unverified link opens in the browser. <a href="#push.app-links">Verified App Links</a> shows how.</p>`,
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
          { q: 'Notifications for articles 7 and 9 use the same action, request code 0 and <code>FLAG_UPDATE_CURRENT or FLAG_IMMUTABLE</code>. The id is only in the extras. Article 9 is posted second. The user taps article 7. What opens?', options: ['Article 7', 'Article 9, because both share one PendingIntent and the second call swapped in its extras', 'Nothing, because the first PendingIntent was cancelled'], a: 1, why: 'PendingIntents are matched without extras, so both posts got the same one. Put the id in the data URI or use a distinct request code.' },
        ],
        deeper: deeplinksDepth.deeper,
        underHood: deeplinksDepth.underHood,
        mistakes: deeplinksDepth.mistakes,
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

      // 4b: promoted from the gap audit
      appLinksLesson,
    ],
  });
})();
