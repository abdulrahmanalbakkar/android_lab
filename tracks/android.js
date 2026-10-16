/* Android fundamentals track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed and- . */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const line = (el, html) => el.append(h('div', { class: 'line drop-in', html }));
  const note = text => `<span class="muted">// ${text}</span>`;
  const addr = () => '@' + (0x1000 + Math.floor(Math.random() * 0xefff)).toString(16);

  // A small phone used by several demos. view holds the current screen; dim is the "paused" overlay.
  function device(extra = '') {
    const view = h('div', { class: 'and-viewport' });
    const dim = h('div', { class: 'and-dim' });
    const dev = h('div', { class: 'and-dev ' + extra, role: 'img', 'aria-label': 'Phone screen' }, view, dim);
    return { dev, view, dim };
  }
  const appbar = text => h('div', { class: 'and-appbar' }, text);
  const bars = (...w) => w.map(x => h('span', { class: 'and-ln', style: `width:${x}%` }));
  const homeScreen = () => h('div', { class: 'and-home drop-in' }, Array.from({ length: 9 }, (_, i) => h('span', { class: i === 4 ? 'and-ico and-me' : 'and-ico' })));
  async function rotate(dev) {
    const toLand = !dev.classList.contains('and-land');
    dev.classList.add(toLand ? 'and-to-land' : 'and-to-port');
    await sleep(470);
    dev.classList.remove('and-to-land', 'and-to-port');
    dev.classList.toggle('and-land', toLand);
  }

  const css = `
.viz.and-viz { grid-template-columns: minmax(0, 1fr); }
.and-viz .cmd { min-width: 0; }
.and-hold { width: 264px; height: 264px; display: grid; place-items: center; flex: none; max-width: 100%; }
.and-dev { position: relative; flex: none; width: 160px; height: 250px; border-radius: 24px; border: 7px solid var(--code-bg); box-shadow: 0 0 0 1px var(--line); background: var(--surface); overflow: hidden; display: flex; flex-direction: column; }
.and-dev.and-land { width: 250px; height: 160px; }
.and-dev.and-tall { width: 180px; height: 290px; }
.and-dev.and-to-land { animation: and-to-land 0.46s ease-in-out forwards; }
.and-dev.and-to-port { animation: and-to-port 0.46s ease-in-out forwards; }
@keyframes and-to-land { to { transform: rotate(-90deg); } }
@keyframes and-to-port { to { transform: rotate(90deg); } }
.and-viewport { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.and-scr { flex: 1; display: flex; flex-direction: column; gap: 7px; padding: 9px; min-height: 0; font-size: 0.8rem; }
.and-appbar { font: 600 0.68rem var(--mono); background: var(--accent); color: var(--accent-ink); padding: 6px 8px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: none; }
.and-ln { display: block; height: 8px; border-radius: 4px; background: var(--sunk); flex: none; }
.and-home { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, 28px); justify-content: center; align-content: center; gap: 12px; padding: 12px; }
.and-ico { width: 28px; height: 28px; border-radius: 9px; background: var(--sunk); }
.and-ico.and-me { background: var(--accent); }
.and-dim { position: absolute; inset: 0; background: var(--ink); opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.and-dim.and-on { opacity: 0.28; }
.and-lbl { font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); }

/* lifecycle */
.and-states { display: grid; flex: 0 1 240px; min-width: 0; }
.and-states .and-lbl { text-align: center; margin-bottom: 6px; }
.and-st { font: 600 0.8rem var(--mono); text-align: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: background 0.25s, color 0.25s, border-color 0.25s; }
.and-st.and-on { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }
.and-st .and-cb { display: block; font-size: 0.68rem; }
.and-edge { display: flex; justify-content: space-between; gap: 8px; padding: 4px 6px; }
.and-cb { font: 500 0.72rem var(--mono); color: var(--muted); transition: color 0.2s; }
.and-cb.and-lit { color: var(--warm); font-weight: 700; }
.and-st.and-on .and-cb { color: var(--accent-ink); opacity: 0.75; }
.and-st.and-on .and-cb.and-lit { color: var(--accent-ink); text-decoration: underline; }

/* ViewModel */
.and-store { border: 2px dashed var(--line); border-radius: 14px; padding: 12px; display: grid; gap: 8px; justify-items: center; background: var(--surface); min-width: min(200px, 100%); }
.and-kv { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px; font: 500 0.66rem var(--mono); }
.and-v { font: 700 0.85rem var(--mono); min-width: 28px; text-align: center; padding: 2px 6px; border-radius: 6px; background: var(--sunk); color: var(--ink); }
.and-v.and-vm { background: var(--accent-soft); color: var(--accent); }
.and-user { font: 500 0.74rem var(--mono); color: var(--muted); }
.and-empty { font: 500 0.82rem var(--mono); color: var(--muted); padding: 22px 8px; }

/* saved state matrix */
.and-proc { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.and-pid { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--ok-soft); color: var(--ok); }
.and-pid.and-dead { background: var(--err-soft); color: var(--err); text-decoration: line-through; }
.and-mx { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(44px, 0.6fr) minmax(0, 1fr) minmax(0, 1fr); gap: 6px; }
.and-mx > div { padding: 8px; border-radius: 8px; background: var(--bg); border: 1px solid var(--line); font: 500 0.8rem var(--mono); display: flex; align-items: center; justify-content: center; gap: 6px; min-width: 0; overflow-wrap: anywhere; transition: background 0.25s, border-color 0.25s, color 0.25s; }
.and-mx > .and-hd { background: none; border-color: transparent; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); text-align: center; overflow-wrap: normal; }
@media (max-width: 520px) { .and-mx { gap: 4px; } .and-mx > div { padding: 6px 5px; font-size: 0.72rem; } .and-mx > .and-hd { font-size: 0.6rem; letter-spacing: 0; } }
.and-mx > .and-hd.and-on { color: var(--accent); border-color: var(--accent); }
.and-mx > .and-who { flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; }
.and-who b { font-weight: 600; color: var(--ink); }
.and-who small { font: 400 0.72rem var(--body); color: var(--muted); }
.and-mx > .and-val { font-size: 1rem; font-weight: 700; }
.and-mx > .and-kept { background: var(--ok-soft); border-color: var(--ok); color: var(--ok); }
.and-mx > .and-lost { background: var(--err-soft); border-color: var(--err); color: var(--err); }
.and-mx > .and-q { color: var(--muted); border-style: dashed; }

/* intents */
.and-sys { position: relative; display: grid; gap: 12px; padding: 14px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; overflow: hidden; }
.and-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.and-tile { padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); display: grid; gap: 2px; font-weight: 700; font-size: 0.88rem; line-height: 1.25; min-width: 0; transition: border-color 0.2s, opacity 0.2s, background 0.2s; }
.and-tile small { font: 500 0.68rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.and-tile.and-scan { border-color: var(--warm); }
.and-tile.and-match { border-color: var(--ok); background: var(--ok-soft); }
.and-tile.and-miss { opacity: 0.4; }
.and-tile.and-open { border-color: var(--accent); background: var(--accent-soft); }
.and-resolver { font: 600 0.78rem var(--mono); text-align: center; padding: 8px 10px; border-radius: 10px; background: var(--code-bg); color: var(--code-ink); border: 2px solid transparent; transition: border-color 0.2s; }
.and-resolver.and-on { border-color: var(--warm); }
.and-apps { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; }
.and-env { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); z-index: 2; padding: 4px 9px; border-radius: 6px; background: var(--warm); color: var(--accent-ink); font: 700 0.7rem var(--mono); white-space: nowrap; pointer-events: none; transition: left 0.55s cubic-bezier(0.5, 0, 0.3, 1), top 0.55s cubic-bezier(0.5, 0, 0.3, 1), opacity 0.3s; }
.and-env.and-notr { transition: none; }
.and-sheet { position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 3; background: var(--surface); border: 2px solid var(--accent); border-radius: 14px; padding: 12px; display: grid; gap: 8px; }
.and-sheet[hidden] { display: none; }

/* back stack */
.and-nav { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: center; }
.and-stackbox { display: grid; gap: 6px; flex: 0 1 220px; min-width: 0; }
.and-stack { display: flex; flex-direction: column-reverse; gap: 6px; min-height: 120px; justify-content: flex-start; }
.and-card { padding: 8px 12px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); font: 600 0.84rem var(--mono); display: flex; justify-content: space-between; align-items: center; gap: 8px; min-width: 0; }
.and-card small { font: 500 0.66rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.and-card.and-top { border-color: var(--accent); background: var(--accent-soft); }
.and-big { font: 700 1.05rem var(--display); }

/* permissions */
.and-ui { font: 700 0.74rem var(--body); padding: 7px 10px; border-radius: 8px; border: none; background: var(--accent); color: var(--accent-ink); cursor: pointer; text-align: center; }
.and-ui.and-ghost { background: var(--sunk); color: var(--ink); }
.and-ui:hover { filter: brightness(1.08); }
.and-dlg { position: absolute; left: 6px; right: 6px; bottom: 6px; z-index: 2; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 10px; display: grid; gap: 6px; font-size: 0.74rem; line-height: 1.35; }
.and-dlg b { font-size: 0.78rem; }
.and-cam { flex: 1; border-radius: 10px; background: var(--code-bg); display: grid; place-items: center; position: relative; color: var(--t-c); font: 500 0.72rem var(--mono); }
.and-cam::before { content: ""; position: absolute; inset: 18px; border: 2px dashed var(--t-s); border-radius: 8px; }
.and-steps { display: grid; gap: 6px; flex: 1 1 240px; max-width: 330px; min-width: 0; }
.and-step { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font: 500 0.74rem var(--mono); transition: background 0.25s, border-color 0.25s, opacity 0.25s; }
.and-step > span:first-child { min-width: 0; overflow-wrap: anywhere; }
.and-step.and-on { border-color: var(--accent); background: var(--accent-soft); }
.and-step.and-skip { opacity: 0.4; }
.and-res { font-weight: 700; flex: none; }
.and-res.and-ok { color: var(--ok); }
.and-res.and-no { color: var(--err); }
.and-perm { font: 600 0.78rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--muted); text-align: center; }
.and-perm.and-ok { background: var(--ok-soft); color: var(--ok); }
.and-perm.and-no { background: var(--err-soft); color: var(--err); }
.and-col { display: grid; gap: 10px; justify-items: center; }

/* depth: let long code scroll inside step and hood grids instead of widening the page (shell-level fix, harmless if duplicated) */
.step > pre.code, .hood > pre.code, .hood > .prose { min-width: 0; }
.hood::details-content { min-width: 0; }

/* depth: saved state */
.and-field { font: 600 0.8rem var(--mono); padding: 6px 8px; border-radius: 8px; border: 2px solid var(--accent); background: var(--bg); color: var(--ink); min-height: 1.9em; overflow-wrap: anywhere; }
.and-field.and-blank { border-color: var(--line); color: var(--muted); font-weight: 500; }
.and-bundle { display: grid; gap: 6px; flex: 0 1 220px; min-width: 0; }
.and-bundle .obj { min-width: 0; transition: border-color 0.25s, opacity 0.25s; }
.and-bundle .obj.and-gone { opacity: 0.4; border-style: dashed; border-color: var(--err); }
.and-ways { display: grid; gap: 6px; min-width: 0; }
.and-way { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); font: 500 0.8rem var(--mono); min-width: 0; transition: border-color 0.25s, background 0.25s; }
.and-way > .cmd { justify-self: start; text-align: left; }
.and-way.and-on { border-color: var(--accent); background: var(--accent-soft); }
.and-way small { grid-column: 1 / -1; font: 400 0.78rem var(--body); color: var(--muted); }

/* depth: permissions */
.and-tog { display: flex; gap: 4px; }
.and-tog .and-ui { flex: 1; font-size: 0.66rem; padding: 5px 4px; }
.and-tog .and-ui[aria-pressed="false"] { background: var(--sunk); color: var(--muted); }
.and-map { display: grid; gap: 4px; justify-items: stretch; min-width: 0; max-width: 100%; }
.and-sort { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; min-width: 0; }
.and-bin { display: grid; gap: 6px; align-content: start; padding: 8px; min-height: 92px; border-radius: 12px; border: 2px dashed var(--line); background: var(--bg); min-width: 0; }
.and-bin > .cmd { justify-content: center; text-align: center; white-space: normal; }
.and-bin .and-tile { font-size: 0.78rem; }
.and-tasks { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.and-tasks .cmd { white-space: normal; text-align: left; }
`;

  Lab.addTrack({
    id: 'android',
    title: 'Android fundamentals',
    description: 'How an app lives on the phone: screens, state, intents, navigation and permissions.',
    group: 'Building apps', requires: ['kotlin'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'lifecycle',
        title: 'Activity lifecycle',
        tagline: 'Six callbacks, always in the same order.',
        body: `
<p>An Activity is one screen of your app. You never call its lifecycle methods yourself. Android calls them as the user opens the app, leaves it and comes back.</p>
<p>Think of three nested pairs. <code>onCreate</code> and <code>onDestroy</code> bracket the life of the object. <code>onStart</code> and <code>onStop</code> bracket the time it is visible. <code>onResume</code> and <code>onPause</code> bracket the time it is in front and takes input. Every step up has a matching step down, and they always run in order.</p>
<p>Rotation is the surprise. By default Android destroys the Activity and creates a new instance for the new screen shape. Try each action below and watch the log and the states.</p>`,
        code: `class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)   // once per instance
        setContent { AppScreen() }
    }
    override fun onStart() { super.onStart() }      // visible
    override fun onResume() { super.onResume() }    // in front, takes input
    override fun onPause() { super.onPause() }      // losing focus
    override fun onStop() { super.onStop() }        // out of view
    override fun onDestroy() { super.onDestroy() }  // this instance is done
}

// In Compose, react to the lifecycle right where you need it
@Composable
fun CameraPreview(camera: Camera) {
    LifecycleStartEffect(camera) {
        camera.open()                         // after onStart
        onStopOrDispose { camera.close() }    // on onStop, or when it leaves the screen
    }
}`,
        remember: 'Up: onCreate, onStart, onResume. Down: onPause, onStop, onDestroy. Rotation goes all the way down and back up.',
        level: 'beginner',
        terms: [
          { term: 'Activity', def: 'An Android component that hosts one screen and receives lifecycle callbacks from the system.' },
          { term: 'Lifecycle callbacks', def: 'The methods onCreate, onStart, onResume, onPause, onStop and onDestroy that Android calls as a screen comes and goes.' },
          { term: 'LifecycleStartEffect', def: 'A Compose effect that runs its block after onStart and its cleanup on onStop or when it leaves the composition.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Hold the camera only while the screen is visible.', code: 'override fun [[onStart]]() {\n    super.onStart()\n    camera.open()\n}\noverride fun [[onStop]]() {\n    super.onStop()\n    camera.close()\n}', why: '<code>onStart</code> and <code>onStop</code> bracket the visible time, so other apps get the camera whenever yours is out of view.' },
          { type: 'bug', prompt: 'The app crashes as soon as the user leaves this screen. Tap the line.', code: 'class PlayerActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent { PlayerScreen(player) }\n    }\n    override fun onPause() = player.pause()\n}', bug: 5, fix: '    override fun onPause() { super.onPause(); player.pause() }', why: 'Every lifecycle override must call its <code>super</code> method. Skipping it throws <code>SuperNotCalledException</code>.' },
        ],
        quiz: [
          { q: 'Your Activity is in front. The user presses Home. Which callbacks run?', options: ['<code>onPause</code> only', '<code>onPause</code>, <code>onStop</code>', '<code>onPause</code>, <code>onStop</code>, <code>onDestroy</code>'], a: 1, why: 'The screen is out of view, so the Activity stops. It is not destroyed, because the user can come back to it.' },
          { q: 'The user comes back to a stopped Activity from Recents. What runs?', options: ['<code>onCreate</code>, <code>onStart</code>, <code>onResume</code>', '<code>onRestart</code>, <code>onStart</code>, <code>onResume</code>', '<code>onResume</code> only'], a: 1, why: 'The instance still exists, so there is no <code>onCreate</code>. <code>onRestart</code> marks the way back up from stopped.' },
          { q: 'Where should you release the camera so other apps can use it while yours is out of view?', options: ['<code>onCreate</code>', '<code>onStop</code>', '<code>onDestroy</code>'], a: 1, why: '<code>onStop</code> runs every time the screen leaves view. <code>onDestroy</code> may come much later, or never if the process is killed.' },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const TO = { onCreate: 'CREATED', onStart: 'STARTED', onResume: 'RESUMED', onPause: 'STARTED', onStop: 'CREATED', onDestroy: 'DESTROYED', onRestart: 'CREATED' };
          let st = 'RESUMED', id = addr(), busy = false, away = 'home', shown = '';
          const nodes = {}, cbs = {};
          const cb = (name, text) => (cbs[name] = h('span', { class: 'and-cb' }, text));
          const node = (s, ...kids) => (nodes[s] = h('div', { class: 'and-st' }, s, ...kids));
          const edge = (down, up) => h('div', { class: 'and-edge' }, cb(down, down + ' ↓'), cb(up, '↑ ' + up));
          const diagram = h('div', { class: 'and-states' },
            h('span', { class: 'and-lbl' }, 'Lifecycle.State'),
            node('DESTROYED'), edge('onCreate', 'onDestroy'),
            node('CREATED', cb('onRestart', '↻ onRestart')), edge('onStart', 'onStop'),
            node('STARTED'), edge('onResume', 'onPause'),
            node('RESUMED'));
          const { dev, view, dim } = device();
          const o = out();
          const appScreen = () => h('div', { class: 'and-scr drop-in' }, appbar(`MainActivity ${id}`), bars(90, 70, 80, 55, 75));
          function paint() {
            Object.entries(nodes).forEach(([s, n]) => n.classList.toggle('and-on', s === st));
            const visible = st === 'STARTED' || st === 'RESUMED';
            const kind = visible ? 'app' + id : away;
            if (kind !== shown) {
              shown = kind;
              view.replaceChildren(visible ? appScreen() : away === 'home' ? homeScreen() : h('div', { class: 'and-scr' }));
            }
            dim.classList.toggle('and-on', st === 'STARTED');
          }
          const logCb = (c, extra = '') => line(o, `${hl(c + '()')}  ${note(TO[c] + extra)}`);
          async function run(label, seq, opts = {}) {
            if (busy) return; busy = true;
            away = opts.via || 'home';
            say(o, note(label));
            if (opts.rot) await rotate(dev);
            for (const c of seq) {
              if (c === 'onCreate') id = addr();
              st = TO[c];
              Object.values(cbs).forEach(x => x.classList.remove('and-lit'));
              cbs[c].classList.add('and-lit'); replay(cbs[c], 'pop');
              logCb(c, c === 'onCreate' ? `, new instance ${id}` : '');
              paint();
              await sleep(560);
            }
            if (opts.tail) line(o, note(opts.tail));
            busy = false;
          }
          function nope(msg) {
            if (busy) return;
            replay(dev, 'shake');
            say(o, `<span class="bad">nothing fires:</span> ${msg}`);
          }
          const onScreen = 'The app is not on screen. Open it or come back first.';
          const actions = [
            ['open app', () => (st === 'DESTROYED' ? run('open app', ['onCreate', 'onStart', 'onResume'])
              : st === 'CREATED' ? run('open app: the stopped instance still exists', ['onRestart', 'onStart', 'onResume'])
                : nope('The app is already in front.'))],
            ['press Home', () => (st === 'RESUMED' ? run('press Home', ['onPause', 'onStop']) : nope(onScreen))],
            ['come back', () => (st === 'CREATED' ? run('come back from Recents', ['onRestart', 'onStart', 'onResume'])
              : st === 'DESTROYED' ? nope('That instance was destroyed. Tap open app to create a new one.')
                : nope('The app is already in front.'))],
            ['rotate', () => (st === 'RESUMED' ? run('rotate the phone', ['onPause', 'onStop', 'onDestroy', 'onCreate', 'onStart', 'onResume'], { rot: true, via: 'blank', tail: 'same screen, brand-new object: fields of the old one are gone' }) : nope(onScreen))],
            ['press Back', () => (st === 'RESUMED' ? run('press Back', ['onPause', 'onStop'], { tail: 'Android 12+: Back on the root launcher activity moves the app to the background. It stops, it is not destroyed.' }) : nope(onScreen))],
            ['finish()', () => (st === 'RESUMED' ? run('finish()', ['onPause', 'onStop', 'onDestroy'], { tail: 'the instance is gone for good' }) : nope(onScreen))],
          ];
          // Open on a running app, with the launch already in the log.
          paint();
          say(o, note('open app'));
          ['onCreate', 'onStart', 'onResume'].forEach(c => o.append(h('div', { class: 'line', html: `${hl(c + '()')}  ${note(TO[c])}` })));
          cbs.onResume.classList.add('and-lit');
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), diagram),
            h('div', { class: 'controls' }, actions.map(([label, f]) => cmd(label, f))),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'viewmodel',
        title: 'Configuration changes and ViewModel',
        tagline: 'Rotation rebuilds the Activity. The ViewModel stays.',
        body: `
<p>Rotating the phone, changing the language or switching to dark mode is a <em>configuration change</em>. By default Android destroys the Activity and creates a fresh one, so the new one can load resources for the new configuration.</p>
<p>A field in the old Activity dies with it. A <code>ViewModel</code> lives outside the Activity, in a <code>ViewModelStore</code> that Android keeps across the change. The new Activity asks for it with <code>by viewModels()</code> and gets the very same object back.</p>
<p>The ViewModel goes away only when the screen is gone for good, for example after <code>finish()</code>. That is when <code>onCleared()</code> runs. Because it outlives the Activity, a ViewModel must never hold a reference to an Activity, a View or a Context tied to one.</p>`,
        code: `class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()

    fun increment() = _count.update { it + 1 }

    override fun onCleared() { /* the screen is gone for good */ }
}

class MainActivity : ComponentActivity() {
    private var activityCount = 0                              // dies with this instance
    private val viewModel: CounterViewModel by viewModels()    // survives rotation

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val count by viewModel.count.collectAsStateWithLifecycle()
            CounterScreen(count = count, onTap = viewModel::increment)
        }
    }
}`,
        remember: 'Rotation destroys the Activity, not the ViewModel. Keep screen state in the ViewModel.',
        level: 'beginner',
        terms: [
          { term: 'ViewModel', def: 'A class that holds screen state and logic and survives configuration changes of its Activity or Fragment.' },
          { term: 'Configuration change', def: 'A change such as rotation, language or dark mode that by default destroys and recreates the Activity.' },
          { term: 'by viewModels()', def: 'A property delegate that returns the existing ViewModel for this owner, or creates it the first time.' },
          { term: 'onCleared()', def: 'Called once when a ViewModel’s owner is finished for good, so it can release resources.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare the ViewModel and get it in the Activity.', code: 'class TimerViewModel : [[ViewModel]]() {\n    val seconds = MutableStateFlow(0)\n}\n\nclass TimerActivity : ComponentActivity() {\n    private val vm: TimerViewModel by [[viewModels]]()\n}', why: 'Extend <code>ViewModel</code>, then <code>by viewModels()</code> hands back the same instance after rotation.' },
          { type: 'bug', prompt: 'After a few rotations, memory keeps growing. Tap the line that leaks.', code: 'class ProfileViewModel(\n    private val activity: Activity,\n    private val repo: ProfileRepository,\n) : ViewModel() {\n    val profile = repo.profile\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)\n}', bug: 1, fix: '    // remove it: a ViewModel must not hold an Activity', why: 'The ViewModel outlives each rotated Activity and keeps the old one, with its whole view tree, in memory.' },
        ],
        quiz: [
          { q: 'A counter is a plain <code>var</code> field in the Activity. The user rotates the phone. The counter', options: ['keeps its value', 'goes back to its initial value', 'crashes the app'], a: 1, why: 'Rotation creates a new Activity object, and its fields start fresh.' },
          { q: 'When does <code>onCleared()</code> run?', options: ['On every rotation', 'When the Activity finishes for good', 'In <code>onPause</code>'], a: 1, why: 'The ViewModel is kept across configuration changes and cleared only when its owner is finished.' },
          { q: 'Should a ViewModel keep a reference to the Activity?', options: ['Yes, it makes Toasts easier', 'No. It outlives the Activity and would leak the old one after rotation.'], a: 1, why: 'After rotation the ViewModel would still point at the destroyed Activity, keeping it and its whole view tree in memory.' },
        ],
        visual(el) {
          el.classList.add('and-viz');
          let busy = false, actCount = 3, vmCount = 3, actId = addr(), vmId = addr();
          let actV, vmV, vmVal, vmCard, vmUser;
          const { dev, view } = device();
          const store = h('div', { class: 'and-store' });
          const o = out();
          function activityScreen(anim) {
            actV = h('span', { class: 'and-v' }, String(actCount));
            vmV = h('span', { class: 'and-v and-vm' }, String(vmCount));
            return h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') },
              appbar(`MainActivity ${actId}`),
              h('div', { class: 'and-kv' }, h('span', {}, 'activityCount'), actV),
              h('div', { class: 'and-kv' }, h('span', {}, 'viewModel.count'), vmV),
              bars(80, 60));
          }
          function fillStore(anim) {
            vmVal = h('b', {}, String(vmCount));
            vmUser = h('span', { class: 'and-user' }, `used by MainActivity ${actId}`);
            vmCard = h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
              h('span', { class: 'obj-name' }, 'CounterViewModel'),
              h('span', { class: 'field' }, 'count = ', vmVal),
              h('span', { class: 'obj-addr' }, vmId));
            store.replaceChildren(h('span', { class: 'and-lbl' }, 'ViewModelStore'), vmCard, vmUser);
          }
          const bump = () => {
            if (busy) return;
            vmCount++; vmV.textContent = vmVal.textContent = String(vmCount);
            replay(vmV, 'pop'); replay(vmCard, 'pop');
            say(o, `${hl('viewModel.increment()')}  ${note(`count = ${vmCount}, stored in the ViewModel`)}`);
          };
          const bumpAct = () => {
            if (busy) return;
            actCount++; actV.textContent = String(actCount); replay(actV, 'pop');
            say(o, `${hl('activityCount++')}  ${note(`${actCount}, stored in MainActivity ${actId}`)}`);
          };
          async function rot() {
            if (busy) return; busy = true;
            say(o, note('rotate the phone'));
            await rotate(dev);
            line(o, `${hl('onPause() onStop() onDestroy()')}  ${note('isChangingConfigurations = true')}`);
            view.firstElementChild.classList.add('leave');
            await sleep(450);
            view.replaceChildren(h('div', { class: 'and-scr' }));
            replay(vmCard, 'pop');
            line(o, `<span class="good">kept:</span> CounterViewModel ${vmId} stays in the store`);
            await sleep(600);
            actId = addr(); actCount = 0;
            view.replaceChildren(activityScreen(true));
            line(o, `${hl('onCreate()')}  ${note(`new MainActivity ${actId}, activityCount = 0`)}`);
            await sleep(500);
            vmUser.textContent = `used by MainActivity ${actId}`; replay(vmUser, 'pop-soft');
            replay(vmV, 'pop');
            line(o, `${hl('by viewModels()')}  ${note(`same CounterViewModel ${vmId}, count = ${vmCount}`)}`);
            busy = false;
          }
          async function finish() {
            if (busy) return; busy = true;
            say(o, note('finish(): the user is done with this screen'));
            view.firstElementChild.classList.add('leave');
            line(o, `${hl('onPause() onStop() onDestroy()')}  ${note('isChangingConfigurations = false')}`);
            await sleep(500);
            view.replaceChildren(homeScreen());
            vmCard.classList.add('leave');
            line(o, `${hl('onCleared()')}  ${note('nobody needs the ViewModel any more')}`);
            await sleep(500);
            store.replaceChildren(h('span', { class: 'and-lbl' }, 'ViewModelStore'), h('span', { class: 'and-empty drop-in' }, 'empty'));
            await sleep(900);
            line(o, note('open the app again'));
            actId = addr(); vmId = addr(); actCount = 0; vmCount = 0;
            view.replaceChildren(activityScreen(true));
            fillStore(true);
            line(o, `${hl('onCreate()')}  ${note(`new MainActivity ${actId}`)}`);
            line(o, `${hl('by viewModels()')}  ${note(`new CounterViewModel ${vmId}, count = 0`)}`);
            busy = false;
          }
          view.replaceChildren(activityScreen());
          fillStore();
          say(o, 'Both counters are at 3. Rotate and see which one keeps its value.');
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-hold' }, dev), store),
            h('div', { class: 'controls' },
              cmd('activityCount++', bumpAct), cmd('viewModel.increment()', bump), cmd('rotate', rot), cmd('finish()', finish)),
            o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'savedstate',
        title: 'Process death and saved state',
        tagline: 'What survives when Android kills your app in the background.',
        body: `
<p>When your app sits in the background and the phone needs memory, Android can kill the whole process. No callback runs first. When the user comes back, Android starts a new process and recreates the Activity, and the user expects the screen exactly as they left it.</p>
<p>Everything in memory is gone, ViewModels included. What survives is a small saved-state <code>Bundle</code> that the system kept for you. Reach it with <code>SavedStateHandle</code> inside a ViewModel, or with <code>rememberSaveable</code> in Compose. Both survive rotation too.</p>
<p>Keep saved state small: an id, a search query, a selected tab. Reload big data from a database or the network. If the user swipes the app away from Recents, they closed it, so the saved state is thrown away as well.</p>`,
        code: `class SearchViewModel(private val state: SavedStateHandle) : ViewModel() {
    var results: List<Item> = emptyList()      // survives rotation only

    val query: StateFlow<String> = state.getStateFlow("query", "")   // survives process death too
    fun onQuery(text: String) { state["query"] = text }
}

@Composable
fun SearchBox() {
    var expanded by remember { mutableStateOf(false) }       // lost on rotation
    var draft by rememberSaveable { mutableStateOf("") }     // saved in the Bundle
}

// Test it: send the app to the background, then run
// adb shell am kill com.example.app      and open the app again`,
        remember: 'Rotation keeps the ViewModel. Process death keeps only the Bundle: SavedStateHandle and rememberSaveable.',
        level: 'intermediate',
        terms: [
          { term: 'Process death', def: 'When Android kills a background app’s process to free memory, without calling any lifecycle method first.' },
          { term: 'SavedStateHandle', def: 'A key-value map passed to a ViewModel that is saved in the instance state Bundle and restored after process death.' },
          { term: 'TransactionTooLargeException', def: 'Thrown when a Bundle sent through Binder, such as saved state, goes over the size limit of about 1 MB.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read and write the title through the saved state.', code: 'class EditorViewModel(private val state: [[SavedStateHandle]]) : ViewModel() {\n    val title = state.[[getStateFlow]]("title", "")\n    fun onTitle(text: String) = state.[[set]]("title", text)\n}', why: 'The handle is saved with the instance state, so the title comes back after rotation and after process death.' },
          { type: 'bug', prompt: 'This app can crash when it goes to the background. Tap the line.', code: 'class FeedViewModel(\n    private val state: SavedStateHandle,\n    private val repo: FeedRepository,\n) : ViewModel() {\n    fun onLoaded(posts: List<Post>) {\n        state["posts"] = posts\n    }\n    fun onScrolled(index: Int) { state["scroll"] = index }\n}', bug: 5, fix: '        // keep posts in the repository; save only small keys like scroll', why: 'A full feed in saved state can pass the Bundle limit and throw <code>TransactionTooLargeException</code>. Save small keys and reload data.' },
        ],
        quiz: [
          { q: 'The process is killed in the background and the user returns. A plain ViewModel property is', options: ['restored', 'lost: a new ViewModel is created', 'restored if it is a StateFlow'], a: 1, why: 'The ViewModel lived in the old process memory. Only what went into the saved-state Bundle comes back.' },
          { q: 'Which one survives both rotation and process death?', options: ['<code>remember { }</code>', 'a ViewModel property', '<code>rememberSaveable { }</code>'], a: 2, why: '<code>rememberSaveable</code> writes its value into the saved-state Bundle.' },
          { q: 'Should you put a list of 5,000 products into <code>SavedStateHandle</code>?', options: ['Yes, that is what it is for', 'No. Save an id or a query and reload the data.'], a: 1, why: 'The Bundle travels through Binder with a limit of about 1 MB. Too much data throws <code>TransactionTooLargeException</code>.' },
        ],
        deeper: [
          {
            title: 'The Bundle is a snapshot taken on the way out',
            body: `<p>Android does not watch your state all the time. It asks for it once, in <code>onSaveInstanceState</code>, when the Activity stops. For apps targeting Android 9 and later that call comes right after <code>onStop</code>. Whatever the handle holds at that moment goes into the Bundle.</p>
<p>A kill can only happen to a stopped app, so the snapshot is always there first. Type a few letters, leave, then kill the process and come back.</p>`,
            visual(el) {
              el.classList.add('and-viz');
              const WORD = 'kotlin flow';
              let query = 'ko', saved = null, phase = 'front', pid = 4127, busy = false;
              const { dev, view, dim } = device();
              const pidEl = h('span', { class: 'and-pid' }, `process ${pid}`);
              const phaseEl = h('span', { class: 'and-perm and-ok' }, 'RESUMED');
              const bVal = h('b', {}, 'null');
              const bObj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'saved Bundle'), h('span', { class: 'field' }, 'query = ', bVal), h('span', { class: 'obj-addr' }, 'held by the system, outside your process'));
              const o = out();
              const screen = anim => view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar('Search'),
                h('div', { class: 'and-field' + (query ? '' : ' and-blank') }, query || 'Search…'), bars(85, 60, 70)));
              const paintBundle = () => { bVal.textContent = saved == null ? 'null' : `"${saved}"`; replay(bObj, 'pop'); };
              const setPhase = (text, kind) => { phaseEl.textContent = text; phaseEl.className = 'and-perm' + (kind ? ' and-' + kind : ''); replay(phaseEl, 'pop-soft'); };
              const nope = msg => { replay(dev, 'shake'); say(o, `<span class="bad">not now:</span> ${msg}`); };
              function type() {
                if (busy) return;
                if (phase !== 'front') return nope('the app is not on screen. Open it first.');
                query = query.length >= WORD.length ? 'k' : WORD.slice(0, query.length + 1);
                screen();
                say(o, `${hl(`onQuery("${query}")`)}  ${note('in memory. The Bundle still says ' + (saved == null ? 'null' : `"${saved}"`))}`);
              }
              async function home() {
                if (busy) return;
                if (phase !== 'front') return nope('the app is already in the background.');
                busy = true;
                say(o, note('press Home'));
                for (const c of ['onPause()', 'onStop()']) { line(o, hl(c)); await sleep(380); }
                dim.classList.add('and-on');
                saved = query; paintBundle();
                line(o, `${hl('onSaveInstanceState(outState)')}  ${note(`snapshot: query = "${query}"`)}`);
                await sleep(380);
                dim.classList.remove('and-on');
                view.replaceChildren(homeScreen());
                phase = 'bg'; setPhase('STOPPED', '');
                busy = false;
              }
              async function kill() {
                if (busy) return;
                if (phase === 'front') return nope('the app in front is the last one Android kills. Press Home first.');
                if (phase === 'dead') return nope('the process is already gone.');
                busy = true;
                phase = 'dead'; pidEl.classList.add('and-dead'); replay(pidEl, 'shake'); setPhase('no process', 'no');
                say(o, `${note(`low memory: process ${pid} is killed. No callback runs.`)}`);
                await sleep(500);
                line(o, `<span class="good">safe:</span> the Bundle lives in the system, not in the dead process`);
                replay(bObj, 'pop');
                busy = false;
              }
              async function open() {
                if (busy) return;
                if (phase === 'front') return nope('the app is already in front.');
                busy = true;
                if (phase === 'bg') {
                  say(o, `${hl('onRestart() onStart() onResume()')}  ${note('same process: memory was never lost')}`);
                } else {
                  pid = 4128 + Math.floor(Math.random() * 3000);
                  pidEl.className = 'and-pid'; pidEl.textContent = `process ${pid}`; replay(pidEl, 'drop-in');
                  say(o, note(`new process ${pid}`));
                  await sleep(400);
                  query = saved || '';
                  line(o, `${hl('onCreate(savedInstanceState)')}  ${note(`Bundle is not null: query = "${query}"`)}`);
                }
                screen(true);
                phase = 'front'; setPhase('RESUMED', 'ok');
                busy = false;
              }
              screen();
              say(o, `${hl('onCreate(savedInstanceState = null)')}  ${note('first launch: nothing to restore')}`);
              el.append(
                h('div', { class: 'stage' }, h('div', { class: 'and-col' }, dev, phaseEl), h('div', { class: 'and-bundle' }, h('div', { class: 'and-proc' }, pidEl), bObj)),
                h('div', { class: 'controls' }, cmd('type a letter', type), cmd('press Home', home), cmd('system kills process', kill), cmd('open from Recents', open)),
                o);
            },
          },
          {
            title: 'Only the system’s kill keeps the Bundle',
            body: `<p>Saved state exists for one promise: if the user did not choose to leave, the screen comes back as they left it. When the user does choose to leave, Android throws the Bundle away.</p>
<p>Swiping the app out of Recents, Force stop, or a <code>finish()</code> all mean the user is done. The next launch starts fresh with <code>savedInstanceState == null</code>. A finishing Activity doesn’t even get <code>onSaveInstanceState</code>. Anything that must outlive those belongs in a database or DataStore.</p>`,
            visual(el) {
              el.classList.add('and-viz');
              const WAYS = [
                { label: 'system kills it in the background', keep: true, why: 'The user never chose to leave. The task stays in Recents with its Bundle.' },
                { label: 'user swipes it out of Recents', keep: false, why: 'Removing the task says “I am done”. Its saved state goes with it.' },
                { label: 'user taps Force stop in Settings', keep: false, why: 'Force stop clears the app’s tasks. Nothing is restored.' },
                { label: 'finish(), or Back on a screen you pushed', keep: false, why: 'A finishing Activity is not coming back, so onSaveInstanceState never runs for it.' },
              ];
              let busy = false;
              const { dev, view } = device();
              const bVal = h('b', {}, '"kotlin"');
              const bObj = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'saved Bundle'), h('span', { class: 'field' }, 'query = ', bVal));
              const o = out('The user searched for "kotlin" and left the app. Pick how it ends.');
              const screen = (q, anim) => view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') }, appbar('Search'),
                h('div', { class: 'and-field' + (q ? '' : ' and-blank') }, q || 'Search…'), bars(85, 60, 70)));
              const rows = WAYS.map(w => {
                const res = h('span', { class: 'and-res' }, '?');
                const btn = cmd(w.label, () => run(w));
                const row = h('div', { class: 'and-way' }, btn, res);
                return Object.assign(w, { res, row });
              });
              async function run(w) {
                if (busy) return; busy = true;
                rows.forEach(r => r.row.classList.remove('and-on'));
                w.row.classList.add('and-on');
                bObj.classList.remove('and-gone'); bVal.textContent = '"kotlin"';
                view.replaceChildren(homeScreen());
                say(o, note(w.label));
                await sleep(500);
                if (!w.keep) { bObj.classList.add('and-gone'); bVal.textContent = 'discarded'; replay(bObj, 'shake'); }
                else replay(bObj, 'pop');
                line(o, w.why);
                await sleep(700);
                if (!el.isConnected) return;
                line(o, `${hl(`onCreate(savedInstanceState = ${w.keep ? 'Bundle' : 'null'})`)}  ${note(w.keep ? 'query restored' : 'fresh start')}`);
                screen(w.keep ? 'kotlin' : '', true);
                w.res.textContent = w.keep ? '✓ restored' : '✗ fresh';
                w.res.className = 'and-res ' + (w.keep ? 'and-ok' : 'and-no');
                replay(w.res, 'pop');
                busy = false;
              }
              screen('kotlin');
              el.append(
                h('div', { class: 'stage' }, dev, h('div', { class: 'and-bundle' }, bObj)),
                h('div', { class: 'and-ways' }, rows.map(r => r.row)),
                o);
            },
          },
          {
            title: 'Your own types need a way into the Bundle',
            body: `<p>A Bundle holds primitives, Strings, Parcelables, Serializables and lists of those. <code>SavedStateHandle</code> has the same rules. For your own class, add <code>@Parcelize</code> from the <code>kotlin-parcelize</code> plugin.</p>
<p><code>rememberSaveable</code> needs the same, or a <code>Saver</code> that turns the value into something a Bundle can hold. Without one, saving a plain class throws <code>IllegalArgumentException</code>, and only at the moment Android saves state. So a missing Saver shows up on rotation or backgrounding, not when the screen first draws.</p>`,
            code: `@Parcelize
data class Filters(val minPrice: Int, val inStock: Boolean) : Parcelable

class ShopViewModel(state: SavedStateHandle) : ViewModel() {
    val filters = state.getStateFlow("filters", Filters(0, false))   // Parcelable: fine
}

data class PriceRange(val from: Int, val to: Int)   // not Parcelable
val PriceRangeSaver = listSaver<PriceRange, Int>(
    save = { listOf(it.from, it.to) },
    restore = { PriceRange(it[0], it[1]) },
)

@Composable
fun PriceSlider() {
    var range by rememberSaveable(stateSaver = PriceRangeSaver) { mutableStateOf(PriceRange(0, 100)) }
}`,
          },
        ],
        underHood: {
          body: `<p><code>ComponentActivity</code> owns a <code>SavedStateRegistry</code>. Anything that wants to be saved registers a provider under a key. In <code>onSaveInstanceState</code> the registry asks each provider for a Bundle and nests them all under their keys in <code>outState</code>.</p>
<p><code>SavedStateHandle</code> is one of those providers, with one entry per ViewModel. <code>rememberSaveable</code> writes into Compose’s <code>SaveableStateRegistry</code>, which <code>setContent</code> wires into the same registry. Android then sends the finished Bundle over Binder to <code>system_server</code>, which stores it with the Activity’s record in the task. That is why it outlives your process, and why the Binder size limit applies to it.</p>`,
          code: `// Roughly what SavedStateHandle does for you
savedStateRegistry.registerSavedStateProvider("search") {
    bundleOf("query" to query)              // asked once, in onSaveInstanceState
}

// After process death, in the new instance:
val restored = savedStateRegistry.consumeRestoredStateForKey("search")
query = restored?.getString("query").orEmpty()`,
        },
        mistakes: [
          {
            title: 'Saving in onCleared()',
            bad: `override fun onCleared() {
    draftStore.save(draft)   // never runs on process death
}`,
            good: `fun onDraftChanged(text: String) {
    state["draft"] = text                         // small: in the Bundle
    viewModelScope.launch { draftStore.save(text) } // durable: on disk
}`,
            why: 'Process death runs no callback at all, so <code>onCleared</code> and <code>onDestroy</code> never get their chance. Save as the value changes.',
          },
          {
            title: 'Reading the handle once, then writing to a local copy',
            bad: `var query = state.get<String>("query") ?: ""
fun onQuery(text: String) { query = text }`,
            good: `val query = state.getStateFlow("query", "")
fun onQuery(text: String) { state["query"] = text }`,
            why: 'The first death restores fine. After that, new values only live in the local <code>var</code>, so the next death loses them.',
          },
          {
            title: 'Testing process death with Don’t keep activities',
            bad: `// Developer options › Don't keep activities: on
// leave the app, come back: looks fine`,
            good: `// Leave the app with Home, then:
// adb shell am kill com.example.app
// and reopen it from Recents`,
            why: 'That option destroys Activities but keeps the process, so singletons and in-memory caches survive and hide bugs. <code>am kill</code> ends the process like the system does.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const rows = [
            { name: 'var count', where: 'field in the Activity', rot: false, death: false },
            { name: 'remember { }', where: 'Compose state', rot: false, death: false },
            { name: 'ViewModel', where: 'a plain property', rot: true, death: false },
            { name: 'SavedStateHandle', where: 'inside the ViewModel', rot: true, death: true },
            { name: 'rememberSaveable { }', where: 'Compose, in the Bundle', rot: true, death: true },
          ];
          let pid = 4127, busy = false;
          const hd = text => h('div', { class: 'and-hd' }, text);
          const hdRot = hd('rotate'), hdDeath = hd('process death');
          const grid = h('div', { class: 'and-mx' }, hd('holder'), hd('value'), hdRot, hdDeath);
          for (const r of rows) {
            r.v = 3;
            r.val = h('div', { class: 'and-val' }, '3');
            r.cells = { rot: h('div', { class: 'and-q' }, '?'), death: h('div', { class: 'and-q' }, '?') };
            grid.append(h('div', { class: 'and-who' }, h('b', {}, r.name), h('small', {}, r.where)), r.val, r.cells.rot, r.cells.death);
          }
          const pidEl = h('span', { class: 'and-pid' }, `process ${pid}`);
          const actEl = h('span', { class: 'and-pid' }, `MainActivity ${addr()}`);
          const proc = h('div', { class: 'and-proc' }, h('span', { class: 'and-lbl' }, 'running'), pidEl, actEl);
          const o = out('Every holder starts at 3. Guess each ? before you tap.');
          function inc() {
            if (busy) return;
            rows.forEach(r => { r.v++; r.val.textContent = String(r.v); r.val.className = 'and-val'; replay(r.val, 'pop'); });
            say(o, `${hl('count++')}  ${note('every holder gets the same new value')}`);
          }
          async function event(kind) {
            if (busy) return; busy = true;
            const head = kind === 'rot' ? hdRot : hdDeath;
            head.classList.add('and-on');
            if (kind === 'rot') {
              say(o, note('rotate: same process, new Activity'));
              actEl.classList.add('leave'); await sleep(420);
              actEl.textContent = `MainActivity ${addr()}`; actEl.classList.remove('leave'); replay(actEl, 'drop-in');
            } else {
              say(o, note(`app in the background. The system kills process ${pid}. No callback runs.`));
              pidEl.classList.add('and-dead'); actEl.classList.add('and-dead'); replay(pidEl, 'shake');
              await sleep(900);
              pid = 4128 + Math.floor(Math.random() * 3000);
              pidEl.className = 'and-pid'; pidEl.textContent = `process ${pid}`; replay(pidEl, 'drop-in');
              actEl.className = 'and-pid'; actEl.textContent = `MainActivity ${addr()}`; replay(actEl, 'drop-in');
              line(o, note(`user returns: new process ${pid}, Activity rebuilt from the saved Bundle`));
            }
            await sleep(300);
            for (const r of rows) {
              const kept = r[kind];
              if (!kept) r.v = 0;
              r.val.textContent = String(r.v);
              r.val.className = 'and-val ' + (kept ? 'and-kept' : 'and-lost');
              replay(r.val, kept ? 'pop' : 'shake');
              r.cells[kind].className = kept ? 'and-kept' : 'and-lost';
              r.cells[kind].replaceChildren(h('span', { class: 'drop-in' }, kept ? '✓ kept' : '✗ lost'));
              await sleep(260);
            }
            line(o, kind === 'rot'
              ? '<span class="good">kept:</span> the ViewModel and the Bundle. <span class="bad">lost:</span> the old Activity and its composition.'
              : '<span class="good">kept:</span> only the Bundle. <span class="bad">lost:</span> everything that lived in memory, ViewModel too.');
            head.classList.remove('and-on');
            busy = false;
          }
          el.append(proc, grid,
            h('div', { class: 'controls' }, cmd('count++', inc), cmd('rotate', () => event('rot')), cmd('process death', () => event('death'))),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'intents',
        title: 'Intents: explicit and implicit',
        tagline: 'Name the screen, or describe the job.',
        body: `
<p>An <code>Intent</code> is a message that asks Android to start something. An <em>explicit</em> intent names the exact class, as in <code>Intent(this, DetailActivity::class.java)</code>. Use it for screens inside your own app.</p>
<p>An <em>implicit</em> intent describes the job instead: an action like <code>ACTION_VIEW</code> or <code>ACTION_SEND</code>, plus data or a MIME type. Android compares it with the intent filters that apps declare in their manifests. One match opens directly. With several, the user picks. <code>Intent.createChooser()</code> always shows the picker.</p>
<p>No match throws <code>ActivityNotFoundException</code>, so wrap implicit <code>startActivity</code> calls in try/catch. Since Android 11, apps can’t see every other installed app by default, so catching the exception is more reliable than checking first.</p>`,
        code: `// Explicit: you name the class. Only your DetailActivity receives it.
startActivity(Intent(this, DetailActivity::class.java).putExtra("id", 42))

// Implicit: you describe the job. The system finds apps whose filters match.
val share = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "Look at this")
}
startActivity(Intent.createChooser(share, null))

try {
    startActivity(Intent(Intent.ACTION_VIEW, "geo:0,0?q=cafe".toUri()))
} catch (e: ActivityNotFoundException) {
    showMessage("No maps app installed")
}`,
        remember: 'Explicit names the class. Implicit names the job, and the system finds the app.',
        level: 'beginner',
        terms: [
          { term: 'Explicit intent', def: 'An Intent that names the exact component class to start, used for screens in your own app.' },
          { term: 'Implicit intent', def: 'An Intent that describes an action and data, so the system finds an app that can handle it.' },
          { term: 'Intent filter', def: 'A manifest declaration of the actions, categories and data types a component can handle.' },
          { term: 'ActivityNotFoundException', def: 'Thrown by startActivity when no installed app can handle the Intent.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Share some text and always show the app picker.', code: 'val send = Intent(Intent.[[ACTION_SEND]]).apply {\n    type = "text/plain"\n    putExtra(Intent.EXTRA_TEXT, "Hi")\n}\nstartActivity(Intent.[[createChooser]](send, null))', why: '<code>ACTION_SEND</code> describes the job. <code>createChooser</code> makes the system show the picker every time.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the wrong line.', code: 'fun openDetail(id: Int) {\n    val intent = Intent(this, DetailActivity::class)\n    intent.putExtra("id", id)\n    startActivity(intent)\n}', bug: 1, fix: '    val intent = Intent(this, DetailActivity::class.java)', why: 'The Intent constructor takes a Java <code>Class</code>. <code>::class</code> is a Kotlin <code>KClass</code>, so add <code>.java</code>.' },
        ],
        quiz: [
          { q: '<code>Intent(Intent.ACTION_VIEW, "https://example.com".toUri())</code> is', options: ['explicit', 'implicit'], a: 1, why: 'It names an action and data, not a class. The system picks the app.' },
          { q: 'An implicit intent matches no installed app. <code>startActivity()</code>', options: ['does nothing', 'throws <code>ActivityNotFoundException</code>', 'opens the Play Store'], a: 1, why: 'Nothing can handle it, so the call throws. Catch it and tell the user.' },
          { q: 'To open your own <code>SettingsActivity</code> from <code>MainActivity</code>, use', options: ['an explicit intent', 'an implicit intent with a custom action'], a: 0, why: 'Explicit is direct, and no other app can step in and receive it.' },
        ],
        visual(el) {
          el.classList.add('and-viz');
          const sendT = t => t && t.startsWith('text/');
          const apps = [
            { name: 'Browser', f: 'VIEW · https:', m: i => i.action === 'VIEW' && i.scheme === 'https' },
            { name: 'Phone', f: 'DIAL · tel:', m: i => i.action === 'DIAL' && i.scheme === 'tel' },
            { name: 'Mail', f: 'SEND · text/plain', m: i => i.action === 'SEND' && i.type === 'text/plain' },
            { name: 'Messages', f: 'SEND · text/plain', m: i => i.action === 'SEND' && i.type === 'text/plain' },
            { name: 'Notes', f: 'SEND · text/*', m: i => i.action === 'SEND' && sendT(i.type) },
            { name: 'Gallery', f: 'VIEW · image/*', m: i => i.action === 'VIEW' && (i.type || '').startsWith('image/') },
          ];
          const intents = [
            { src: 'Intent(this, DetailActivity::class.java)', tag: 'DetailActivity', explicit: true },
            { src: 'Intent(ACTION_VIEW, "https://developer.android.com".toUri())', tag: 'ACTION_VIEW https:', action: 'VIEW', scheme: 'https' },
            { src: 'Intent(ACTION_DIAL, "tel:5551234".toUri())', tag: 'ACTION_DIAL tel:', action: 'DIAL', scheme: 'tel' },
            { src: 'createChooser(Intent(ACTION_SEND).setType("text/plain"), null)', tag: 'ACTION_SEND text/plain', action: 'SEND', type: 'text/plain', chooser: true },
            { src: 'Intent(ACTION_VIEW, "geo:0,0?q=cafe".toUri())', tag: 'ACTION_VIEW geo:', action: 'VIEW', scheme: 'geo' },
          ];
          let busy = false, choosing = false;
          const tile = (name, f) => h('div', { class: 'and-tile' }, name, h('small', {}, f));
          const mainT = tile('MainActivity', 'sender'), detailT = tile('DetailActivity', 'no intent filter');
          apps.forEach(a => { a.el = tile(a.name, a.f); });
          const resolver = h('div', { class: 'and-resolver' }, 'Android: match action, data and type against intent filters');
          const env = h('div', { class: 'and-env' }, 'Intent');
          const sheet = h('div', { class: 'and-sheet', hidden: true });
          const sys = h('div', { class: 'and-sys' },
            h('span', { class: 'and-lbl' }, 'your app'), h('div', { class: 'and-row' }, mainT, detailT),
            resolver,
            h('span', { class: 'and-lbl' }, 'other installed apps'), h('div', { class: 'and-apps' }, apps.map(a => a.el)),
            env, sheet);
          const o = out('Send an intent. Watch who receives it.');
          function place(target, animate) {
            const s = sys.getBoundingClientRect(), r = target.getBoundingClientRect();
            env.classList.toggle('and-notr', !animate);
            env.style.left = (r.left - s.left + r.width / 2) + 'px';
            env.style.top = (r.top - s.top + r.height / 2) + 'px';
            void env.offsetWidth;
          }
          const fly = async target => { place(target, true); await sleep(600); };
          function clear() {
            [detailT, ...apps.map(a => a.el)].forEach(t => t.classList.remove('and-match', 'and-miss', 'and-open', 'and-scan'));
          }
          async function deliver(a) {
            await fly(a.el);
            a.el.classList.remove('and-match'); a.el.classList.add('and-open'); replay(a.el, 'pop');
            env.style.opacity = '0';
            line(o, `<span class="good">opened:</span> ${a.name}`);
            busy = false;
          }
          function choose(matches) {
            choosing = true;
            sheet.replaceChildren(
              h('b', {}, 'Share with'),
              h('div', { class: 'and-row' }, matches.map(a => h('button', { class: 'btn small and-pick', onclick: () => { sheet.hidden = true; choosing = false; deliver(a); } }, a.name))),
              h('button', { class: 'btn small', onclick: () => { sheet.hidden = true; choosing = false; env.style.opacity = '0'; line(o, note('user cancelled the chooser')); busy = false; } }, 'Cancel'));
            sheet.hidden = false; replay(sheet, 'drop-in');
            line(o, note(`${matches.length} apps match. The chooser lets the user pick.`));
          }
          async function send(it) {
            if (choosing) { replay(sheet, 'shake'); say(o, 'Pick an app in the chooser, or Cancel.'); return; }
            if (busy) return; busy = true;
            clear();
            env.textContent = it.tag; env.style.opacity = '1';
            place(mainT, false);
            say(o, hl(`startActivity(${it.src})`));
            await sleep(120);
            if (it.explicit) {
              await fly(detailT);
              detailT.classList.add('and-open'); replay(detailT, 'pop');
              env.style.opacity = '0';
              line(o, '<span class="good">opened:</span> DetailActivity. The class is named, so no filter matching happens.');
              busy = false; return;
            }
            await fly(resolver);
            resolver.classList.add('and-on');
            const matches = [];
            for (const a of apps) {
              a.el.classList.add('and-scan'); await sleep(190); a.el.classList.remove('and-scan');
              const ok = a.m(it);
              a.el.classList.add(ok ? 'and-match' : 'and-miss');
              if (ok) matches.push(a);
            }
            resolver.classList.remove('and-on');
            if (!matches.length) {
              replay(resolver, 'shake'); env.style.opacity = '0';
              line(o, '<span class="bad">ActivityNotFoundException:</span> no app has a filter for VIEW geo:. Catch it and tell the user.');
              busy = false; return;
            }
            if (matches.length === 1 && !it.chooser) { line(o, note('exactly one match, so it opens directly')); await deliver(matches[0]); return; }
            choose(matches);
          }
          requestAnimationFrame(() => place(mainT, false));
          el.append(sys, h('div', { class: 'controls' }, intents.map(it => cmd(it.src, () => send(it)))), o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'backstack',
        title: 'Tasks and the back stack',
        tagline: 'Navigate pushes, Back pops.',
        body: `
<p>A <em>task</em> is the stack of screens the user has walked through, newest on top. Opening a screen pushes it onto the stack. Back pops the top one and shows the one below.</p>
<p>In a Compose app with a single Activity, Navigation keeps this stack for you. <code>navController.navigate(route)</code> pushes, <code>popBackStack()</code> pops, and the system Back gesture pops too. Back on the start destination leaves the app.</p>
<p>Two options change a push. <code>launchSingleTop = true</code> skips the push when that destination is already on top, so a double tap can’t stack two copies. <code>popUpTo&lt;Home&gt;()</code> pops everything above Home first, which keeps the stack short. Activities have matching intent flags: <code>FLAG_ACTIVITY_SINGLE_TOP</code> and <code>FLAG_ACTIVITY_CLEAR_TOP</code>.</p>`,
        code: `@Serializable object Home
@Serializable object Search
@Serializable object Settings
@Serializable data class Detail(val id: Int)

NavHost(navController, startDestination = Home) {
    composable<Home> { HomeScreen() }
    composable<Search> { SearchScreen() }
    composable<Settings> { SettingsScreen() }
    composable<Detail> { entry -> DetailScreen(entry.toRoute<Detail>().id) }
}

navController.navigate(Detail(id = 7))                       // push
navController.popBackStack()                                 // pop, like Back
navController.navigate(Search) { launchSingleTop = true }    // no copy on top of a copy
navController.navigate(Settings) { popUpTo<Home>() }         // clear down to Home, then push`,
        remember: 'navigate pushes, Back pops. launchSingleTop stops duplicates. popUpTo clears down to a screen first.',
        level: 'intermediate',
        terms: [
          { term: 'Back stack', def: 'The stack of destinations the user has visited, where navigating pushes and Back pops the top one.' },
          { term: 'Task', def: 'The set of activities the user interacts with for one job, kept as a back stack.' },
          { term: 'launchSingleTop', def: 'A navigation option that reuses the destination when it is already on top instead of pushing a copy.' },
          { term: 'popUpTo', def: 'A navigation option that pops destinations off the stack down to a given one before pushing the new one.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Stop double taps from stacking Search, and make Home the only entry.', code: 'navController.navigate(Search) { [[launchSingleTop]] = true }\nnavController.navigate(Home) {\n    [[popUpTo]]<Home> { inclusive = true }\n}', why: 'Single top reuses Search when it is already on top. Popping Home inclusive, then pushing it, leaves one Home on the stack.' },
          { type: 'bug', prompt: 'After login, Back takes the user to the login screen again. Tap the line.', code: 'fun onLoggedIn() {\n    navController.navigate(Home) {\n        popUpTo<Login>()\n    }\n}', bug: 2, fix: '        popUpTo<Login> { inclusive = true }', why: 'Without <code>inclusive = true</code>, <code>popUpTo</code> stops at Login and keeps it under Home.' },
        ],
        quiz: [
          { q: 'The stack is Home, List, Detail. The user presses Back twice. What is on screen?', options: ['Home', 'List', 'The app closes'], a: 0, why: 'Each Back pops one entry: Detail, then List.' },
          { q: 'The stack is Home, Search. You call <code>navigate(Search) { launchSingleTop = true }</code>. The stack is now', options: ['Home, Search', 'Home, Search, Search', 'Search'], a: 0, why: 'Search is already on top, so single top reuses it instead of pushing a copy.' },
          { q: 'The stack is Home, A, B. You call <code>navigate(C) { popUpTo&lt;Home&gt;() }</code>. The stack is now', options: ['Home, A, B, C', 'Home, C', 'C'], a: 1, why: 'Everything above Home is popped, then C is pushed. Add <code>inclusive = true</code> to pop Home too.' },
        ],
        visual(el) {
          el.classList.add('and-viz');
          let stack = [], n = 2, busy = false;
          const col = h('div', { class: 'and-stack' });
          const { dev, view } = device();
          const o = out();
          const detailBtn = cmd('', () => push(`Detail(id=${n})`, () => { n++; detailBtn.innerHTML = hl(`navigate(Detail(id = ${n}))`); }));
          const entry = (route, anim) => ({ route, el: h('div', { class: 'and-card' + (anim ? ' drop-in' : '') }, h('span', {}, route), h('small', {})) });
          function paint(anim) {
            stack.forEach((e, i) => {
              const top = i === stack.length - 1;
              e.el.classList.toggle('and-top', top);
              e.el.lastChild.textContent = top ? 'on screen' : i === 0 ? 'start' : '';
            });
            const top = stack[stack.length - 1].route;
            view.replaceChildren(h('div', { class: 'and-scr' + (anim ? ' drop-in' : '') },
              appbar(stack.length > 1 ? `← ${top}` : top), h('span', { class: 'and-big' }, top.replace(/\(.*/, '')), bars(85, 60, 75)));
          }
          function push(route, after) {
            if (busy) return;
            if (stack.length >= 7) { replay(col, 'shake'); say(o, 'The stack is getting tall. Press Back or Reset.'); return; }
            const e = entry(route, true); stack.push(e); col.append(e.el);
            if (after) after();
            paint(true);
            say(o, `${hl(`navigate(${route})`)}  ${note(`push. Stack size ${stack.length}`)}`);
          }
          async function back() {
            if (busy) return;
            if (stack.length === 1) { replay(stack[0].el, 'shake'); say(o, `${hl('popBackStack()')}  ${note('Home is the start destination. Back here leaves the app.')}`); return; }
            busy = true;
            const e = stack.pop(); e.el.classList.add('leave');
            paint(true);
            say(o, `${hl('popBackStack()')}  ${note(`pop ${e.route}. Back to ${stack[stack.length - 1].route}`)}`);
            await sleep(450); e.el.remove();
            busy = false;
          }
          function single() {
            if (busy) return;
            const top = stack[stack.length - 1];
            if (top.route === 'Search') { replay(top.el, 'pop'); say(o, `${hl('navigate(Search) { launchSingleTop = true }')}  ${note('Search is already on top. Reused, no copy pushed.')}`); return; }
            push('Search');
            line(o, note('Search was not on top, so this is a normal push'));
          }
          async function clearTo() {
            if (busy) return; busy = true;
            const gone = stack.slice(1).reverse();
            for (const e of gone) { e.el.classList.add('leave'); await sleep(160); }
            await sleep(300);
            gone.forEach(e => e.el.remove());
            stack = stack.slice(0, 1);
            const e = entry('Settings', true); stack.push(e); col.append(e.el);
            paint(true);
            say(o, `${hl('navigate(Settings) { popUpTo<Home>() }')}  ${note(`popped ${gone.length}, pushed Settings. Back now goes straight to Home.`)}`);
            busy = false;
          }
          ['Home', 'Search', 'Detail(id=1)'].forEach(r => { const e = entry(r); stack.push(e); col.append(e.el); });
          detailBtn.innerHTML = hl(`navigate(Detail(id = ${n}))`);
          paint();
          say(o, 'Three screens deep. Push, pop, and try the two options.');
          el.append(
            h('div', { class: 'stage and-nav' }, h('div', { class: 'and-stackbox' }, col, h('span', { class: 'and-lbl' }, 'back stack: newest on top')), dev),
            h('div', { class: 'controls' },
              detailBtn, cmd('navigate(Search)', () => push('Search')), cmd('popBackStack()  // Back', back),
              cmd('navigate(Search) { launchSingleTop = true }', single), cmd('navigate(Settings) { popUpTo<Home>() }', clearTo)),
            o);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'permissions',
        title: 'Runtime permissions',
        tagline: 'Check, explain, ask, and respect the answer.',
        body: `
<p>Dangerous permissions like the camera, location or microphone need the user’s yes at runtime, on top of the line in the manifest. Ask at the moment the feature needs it, so the request makes sense.</p>
<p>The flow is always the same. Check with <code>checkSelfPermission</code>. If it is granted, go ahead. If <code>shouldShowRequest<wbr>PermissionRationale</code> returns true, the user said no before, so explain why first. Then launch the request through the Activity Result API: <code>rememberLauncherForActivityResult<wbr>(RequestPermission())</code> in Compose, or <code>registerForActivityResult</code> in an Activity or Fragment.</p>
<p>Since Android 11, two denials mean “don’t ask again”. The system stops showing the dialog and answers no at once. From then on only the app’s page in Settings can turn it back on. Keep the app usable without the permission.</p>`,
        code: `// AndroidManifest.xml: <uses-permission android:name="android.permission.CAMERA" />
import android.Manifest.permission.CAMERA
import android.content.pm.PackageManager.PERMISSION_GRANTED
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission

@Composable
fun TakePhotoButton(onReady: () -> Unit) {
    val context = LocalContext.current
    val activity = LocalActivity.current
    var showRationale by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(RequestPermission()) { granted ->
        when {
            granted -> onReady()
            activity?.shouldShowRequestPermissionRationale(CAMERA) == false ->
                showSettings = true     // "don't ask again": only Settings can help now
        }
    }

    Button(onClick = {
        when {
            ContextCompat.checkSelfPermission(context, CAMERA) == PERMISSION_GRANTED -> onReady()
            activity?.shouldShowRequestPermissionRationale(CAMERA) == true -> showRationale = true
            else -> launcher.launch(CAMERA)
        }
    }) { Text("Take photo") }
}`,
        remember: 'Check first. Explain if they said no before. After two denials, only Settings can turn it back on.',
        level: 'intermediate',
        terms: [
          { term: 'Runtime permission', def: 'A dangerous permission, like camera or location, that the user must grant while the app runs, on top of the manifest entry.' },
          { term: 'Permission rationale', def: 'A short explanation the app shows before asking again, when the system reports that the user denied the permission before.' },
          { term: 'Activity Result API', def: 'The registerForActivityResult and rememberLauncherForActivityResult way to start a request and get its result in a callback.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask for the camera from Compose.', code: 'val launcher = rememberLauncherForActivityResult([[RequestPermission]]()) { granted ->\n    if (granted) startCamera()\n}\nButton(onClick = {\n    launcher.[[launch]](Manifest.permission.CAMERA)\n}) { Text("Scan") }', why: '<code>RequestPermission</code> is the contract for one permission, and <code>launch</code> shows the system dialog.' },
          { type: 'bug', prompt: 'Tapping Scan throws <code>IllegalStateException</code>. Tap the line.', code: 'class ScanActivity : ComponentActivity() {\n    fun onScanClicked() {\n        val launcher = registerForActivityResult(RequestPermission()) { ok ->\n            if (ok) startScan()\n        }\n        launcher.launch(CAMERA)\n    }\n}', bug: 2, fix: '        // register as a class property instead, before the Activity starts', why: '<code>registerForActivityResult</code> must run before the Activity reaches STARTED, so declare the launcher as a property.' },
        ],
        quiz: [
          { q: 'On the first request the user taps Don’t allow. What does <code>shouldShowRequestPermissionRationale</code> return next time?', options: ['<code>true</code>', '<code>false</code>'], a: 0, why: 'The user said no once, so Android suggests you explain before asking again.' },
          { q: 'On Android 11+ the user has denied twice. What does <code>launcher.launch(CAMERA)</code> do?', options: ['Shows the dialog again', 'Calls back with false at once, no dialog', 'Crashes'], a: 1, why: 'Two denials count as don’t ask again. The result comes back false without any UI.' },
          { q: 'Which API is the current way to request a permission?', options: ['<code>registerForActivityResult<wbr>(RequestPermission())</code>', '<code>startActivityForResult()</code>', '<code>onActivityResult()</code>'], a: 0, why: 'The Activity Result API replaces the old request code and callback overrides. In Compose use <code>rememberLauncherForActivityResult</code>.' },
        ],
        deeper: [
          {
            title: 'Location: the user picks precise or approximate',
            body: `<p>On Android 12 and later the location dialog has a Precise and an Approximate choice. Ask for <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code> together with <code>RequestMultiplePermissions</code>. The result is a map, and the user may grant only the coarse one.</p>
<p>If you ask for fine alone, apps targeting Android 12+ get no dialog at all. Logcat says fine must be requested with coarse. Handle all three outcomes: precise, approximate and none.</p>`,
            code: `val launcher = rememberLauncherForActivityResult(RequestMultiplePermissions()) { result ->
    when {
        result[ACCESS_FINE_LOCATION] == true -> showNearby(precise = true)
        result[ACCESS_COARSE_LOCATION] == true -> showNearby(precise = false)
        else -> showCityPicker()
    }
}
launcher.launch(arrayOf(ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION))`,
            visual(el) {
              el.classList.add('and-viz');
              let fine = false, coarse = false, precise = true, busy = false, waiting = null;
              const { dev, view } = device('and-tall');
              const fineEl = h('span', { class: 'and-perm' }), coarseEl = h('span', { class: 'and-perm' });
              const o = out();
              const ui = (text, onclick, ghost) => h('button', { class: 'and-ui' + (ghost ? ' and-ghost' : ''), onclick }, text);
              const paintMap = (fresh) => {
                fineEl.textContent = `FINE: ${fine}`; fineEl.className = 'and-perm' + (fine ? ' and-ok' : '');
                coarseEl.textContent = `COARSE: ${coarse}`; coarseEl.className = 'and-perm' + (coarse ? ' and-ok' : '');
                if (fresh) { replay(fineEl, 'pop'); replay(coarseEl, 'pop'); }
              };
              const home = () => {
                const msg = fine ? 'Stores within 50 m of you' : coarse ? 'Stores in your area (approximate)' : 'Pick your city to see stores';
                view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Stores'), h('p', {}, msg), ...bars(80, 70, 55)));
              };
              function close() { waiting = null; view.querySelectorAll('.and-dlg, .and-dim').forEach(x => x.remove()); }
              function done(f, c, why) {
                close(); fine = f; coarse = c; paintMap(true); home();
                line(o, `${hl(`callback: { FINE = ${f}, COARSE = ${c} }`)}  ${note(why)}`);
                busy = false;
              }
              function dialog() {
                view.append(h('div', { class: 'and-dim and-on' }));
                const pBtn = ui('Precise', () => pick(true)), aBtn = ui('Approximate', () => pick(false));
                const pick = v => { precise = v; pBtn.setAttribute('aria-pressed', String(v)); aBtn.setAttribute('aria-pressed', String(!v)); };
                pick(true);
                const d = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Allow Stores to access this device’s location?'),
                  h('div', { class: 'and-tog' }, pBtn, aBtn),
                  ui('While using the app', () => done(precise, true, precise ? 'precise granted' : 'the user chose approximate')),
                  ui('Don’t allow', () => done(false, false, 'denied: fall back to a city picker'), true));
                view.append(d); waiting = d;
              }
              function upgrade() {
                view.append(h('div', { class: 'and-dim and-on' }));
                const d = h('div', { class: 'and-dlg drop-in' }, h('b', {}, 'Change Stores’ location access to precise?'),
                  ui('Change to precise', () => done(true, true, 'upgraded to precise')),
                  ui('Keep approximate', () => done(false, true, 'still approximate. Keep working with it.'), true));
                view.append(d); waiting = d;
              }
              function askBoth() {
                if (waiting) { replay(waiting, 'shake'); say(o, 'Answer the dialog on the phone first.'); return; }
                if (busy) return; busy = true;
                say(o, hl('launch(arrayOf(FINE, COARSE))'));
                if (fine) return done(true, true, 'already granted: no dialog');
                if (coarse) { line(o, note('approximate already granted: the system offers an upgrade')); upgrade(); return; }
                line(o, note('one dialog for both, with a precise switch'));
                dialog();
              }
              function askFine() {
                if (waiting) { replay(waiting, 'shake'); say(o, 'Answer the dialog on the phone first.'); return; }
                if (busy) return;
                replay(dev, 'shake');
                say(o, `${hl('launch(arrayOf(FINE))')}  <span class="bad">ignored:</span> no dialog`);
                line(o, note('Logcat: ACCESS_FINE_LOCATION must be requested with ACCESS_COARSE_LOCATION'));
              }
              paintMap(); home();
              say(o, 'Ask for both. In the dialog, try Approximate, then ask again.');
              el.append(
                h('div', { class: 'stage' }, dev, h('div', { class: 'and-map' }, h('span', { class: 'and-lbl' }, 'result map'), fineEl, coarseEl)),
                h('div', { class: 'controls' }, cmd('launch(arrayOf(FINE, COARSE))', askBoth), cmd('launch(arrayOf(FINE))', askFine)),
                o);
            },
          },
          {
            title: 'Background location is a second, separate step',
            body: `<p><code>ACCESS_BACKGROUND_LOCATION</code> lets the app read location while no screen is visible, for things like geofence reminders. Ask for it only after foreground location is granted, and never in the same request. A combined request is ignored.</p>
<p>On Android 11 and later, no dialog can grant it. Launching the request opens the app’s location page in Settings, where the user has to pick <em>Allow all the time</em>. Explain that in your own UI first. Google Play also reviews every app that declares it.</p>`,
            code: `// Only after FINE or COARSE is granted, and after your own explanation:
val bgLauncher = rememberLauncherForActivityResult(RequestPermission()) { granted ->
    if (granted) geofences.enable() else showAllTheTimeHelp()
}
bgLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)   // Android 11+: opens Settings`,
          },
          {
            title: 'Many features need no permission at all',
            body: `<p>Before you add a permission, check if a system UI can do the job. The photo picker and the camera app work for you without any grant, because the user picks the item themselves. Normal permissions like <code>INTERNET</code> are granted at install. A few special ones, like exact alarms, are toggled only on a Settings page.</p>
<p>Pick a task, then the bucket it belongs in.</p>`,
            visual(el) {
              el.classList.add('and-viz');
              const BINS = { none: 'no permission', install: 'granted at install', runtime: 'runtime dialog', special: 'special: Settings page' };
              const TASKS = [
                { t: 'Let the user pick a photo', b: 'none', api: 'PickVisualMedia', why: 'The photo picker runs in the system. Your app only gets the one photo the user chose.' },
                { t: 'Take one photo with the camera app', b: 'none', api: 'TakePicture', why: 'The camera app takes the picture. One catch: if your manifest declares CAMERA, you must hold it for this too.' },
                { t: 'Download a JSON feed', b: 'install', api: 'INTERNET', why: 'INTERNET is a normal permission. Declare it and it is granted at install.' },
                { t: 'Post a notification', b: 'runtime', api: 'POST_NOTIFICATIONS', why: 'A runtime permission since Android 13.' },
                { t: 'Record a voice note', b: 'runtime', api: 'RECORD_AUDIO', why: 'The microphone is a dangerous permission, so the user decides at runtime.' },
                { t: 'Ring at exactly 7:00', b: 'special', api: 'SCHEDULE_EXACT_ALARM', why: 'Exact alarms are a special permission. Check canScheduleExactAlarms() and send the user to Settings.' },
              ];
              let sel = null, left = TASKS.length;
              const o = out('Pick a task, then a bucket.');
              const bins = {};
              const taskRow = h('div', { class: 'and-tasks' });
              TASKS.forEach(x => {
                x.btn = h('button', { class: 'cmd', 'aria-pressed': 'false', onclick() {
                  sel = x; TASKS.forEach(y => y.btn && y.btn.setAttribute('aria-pressed', String(y === x)));
                  say(o, `${x.t}: which bucket?`);
                } }, x.t);
                taskRow.append(x.btn);
              });
              const sort = h('div', { class: 'and-sort' }, Object.entries(BINS).map(([k, label]) => {
                const bin = h('div', { class: 'and-bin' }, h('button', { class: 'cmd', onclick: () => drop(k) }, label));
                bins[k] = bin; return bin;
              }));
              function drop(k) {
                if (!sel) { replay(taskRow, 'shake'); say(o, left ? 'Pick a task first.' : 'All sorted. Press Reset to try again.'); return; }
                if (sel.b !== k) { replay(bins[k], 'shake'); say(o, `<span class="bad">not that one.</span> ${sel.t}: think about who picks or does the work.`); return; }
                sel.btn.remove(); sel.btn = null;
                bins[k].append(h('div', { class: 'and-tile and-match drop-in' }, sel.t, h('small', {}, sel.api)));
                say(o, `<span class="good">yes:</span> ${sel.why}`);
                sel = null; left--;
                if (!left) line(o, note('two of six needed a dialog'));
              }
              el.append(taskRow, sort, o);
            },
          },
        ],
        underHood: {
          body: `<p><code>launch()</code> goes through the Activity’s <code>ActivityResultRegistry</code>, which calls <code>requestPermissions</code>. The system then starts <code>GrantPermissionsActivity</code> from the PermissionController app on top of yours. It is a separate, translucent Activity, so yours gets <code>onPause</code> but not <code>onStop</code>.</p>
<p>The answer comes back as an Activity result, and the registry routes it to your callback by a key. The registry also keeps pending requests in the saved state, so an Activity recreated while the dialog is open still gets its result. That only works if the new instance registers the same launchers during creation. That is why <code>registerForActivityResult</code> must run before STARTED, and why <code>rememberLauncherForActivityResult</code> keeps its key in <code>rememberSaveable</code>.</p>`,
          code: `// Inside ComponentActivity, roughly
override fun <I, O> registerForActivityResult(contract: ActivityResultContract<I, O>, callback: ActivityResultCallback<O>) =
    activityResultRegistry.register("activity_rq#" + nextLocalRequestCode.getAndIncrement(), this, contract, callback)`,
        },
        mistakes: [
          {
            title: 'Asking for fine location alone',
            bad: `launcher.launch(arrayOf(ACCESS_FINE_LOCATION))`,
            good: `launcher.launch(arrayOf(ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION))`,
            why: 'Apps targeting Android 12+ get no dialog for fine alone. Ask for both and accept approximate.',
          },
          {
            title: 'Reading a false rationale as “blocked” before the first ask',
            bad: `onClick = {
    if (!activity.shouldShowRequestPermissionRationale(CAMERA)) openAppSettings()
    else launcher.launch(CAMERA)
}`,
            good: `onClick = { launcher.launch(CAMERA) }
// in the callback, after a denial:
if (!granted && !activity.shouldShowRequestPermissionRationale(CAMERA)) showSettingsHint()`,
            why: 'The rationale is also false when you have never asked. Only a false that follows a denial means the user said don’t ask again.',
          },
          {
            title: 'Asking for everything on first launch',
            bad: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    launcher.launch(arrayOf(CAMERA, RECORD_AUDIO, ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION))
}`,
            good: `// Ask for each one where the feature starts
Button(onClick = { cameraLauncher.launch(CAMERA) }) { Text("Scan receipt") }`,
            why: 'Requests without context get denied, and each denial counts toward don’t ask again.',
          },
        ],
        visual(el) {
          el.classList.add('and-viz');
          // perm: ask (never asked) · denied (once) · blocked (twice, don't ask again) · granted
          const LABEL = { ask: 'not requested yet', denied: 'denied once', blocked: 'denied, don’t ask again', granted: 'granted' };
          let perm = 'ask', busy = false, waiting = null;
          const { dev, view } = device('and-tall');
          const permEl = h('span', { class: 'and-perm' });
          const o = out();
          const steps = {};
          const list = h('div', { class: 'and-steps' },
            [['check', 'checkSelfPermission(CAMERA)'], ['why', 'shouldShowRequestPermissionRationale(CAMERA)'], ['rat', 'your rationale UI'],
              ['launch', 'launcher.launch(CAMERA)'], ['dlg', 'system dialog'], ['cb', 'callback: granted =']].map(([k, label]) => {
              const res = h('span', { class: 'and-res' });
              return (steps[k] = Object.assign(h('div', { class: 'and-step' }, h('span', {}, label), res), { res }));
            }));
          const paintPerm = () => { permEl.textContent = `CAMERA: ${LABEL[perm]}`; permEl.className = 'and-perm' + (perm === 'granted' ? ' and-ok' : perm === 'blocked' ? ' and-no' : ''); replay(permEl, 'pop-soft'); };
          const ui = (text, onclick, ghost) => h('button', { class: 'and-ui' + (ghost ? ' and-ghost' : ''), onclick }, text);
          const screen = (...kids) => view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Receipts'), ...kids));
          const home = (msg = 'Scan a receipt to add it.') => screen(h('p', {}, msg), ...bars(80, 60), ui('Take photo', tap));
          const overlay = (...kids) => { const d = h('div', { class: 'and-dlg drop-in' }, ...kids); view.append(d); waiting = d; return d; };
          async function step(k, text, cls = '') {
            steps[k].classList.add('and-on'); steps[k].res.textContent = text; steps[k].res.className = 'and-res ' + cls;
            replay(steps[k], 'pop-soft');
            await sleep(520);
          }
          const skip = (...ks) => ks.forEach(k => { steps[k].classList.add('and-skip'); steps[k].res.textContent = 'skipped'; });
          const clearSteps = () => Object.values(steps).forEach(s => { s.className = 'and-step'; s.res.textContent = ''; });
          async function tap() {
            if (waiting) { replay(waiting, 'shake'); say(o, 'Answer what is on the phone first.'); return; }
            if (busy) return; busy = true;
            clearSteps();
            say(o, note('user taps Take photo'));
            if (perm === 'granted') {
              await step('check', 'GRANTED', 'and-ok');
              skip('why', 'rat', 'launch', 'dlg', 'cb');
              view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Receipts'), h('div', { class: 'and-cam' }, 'camera preview')));
              line(o, '<span class="good">already granted:</span> open the camera, no dialog');
              busy = false; return;
            }
            await step('check', 'DENIED', 'and-no');
            const why = perm === 'denied';
            await step('why', String(why), why ? 'and-ok' : '');
            if (why) {
              await step('rat', 'shown');
              overlay(h('b', {}, 'Why the camera?'), h('span', {}, 'Receipts uses it to scan paper receipts. You can type them in instead.'),
                ui('Continue', () => { waiting = null; launch(); }),
                ui('Not now', () => { waiting = null; skip('launch', 'dlg', 'cb'); home('No problem. Type the receipt in.'); line(o, note('user said not now. Keep the app usable.')); busy = false; }, true));
              line(o, note('the user said no before, so explain first'));
              return;
            }
            skip('rat');
            await launch();
          }
          async function launch() {
            busy = true;
            await step('launch', 'called');
            if (perm === 'blocked') {
              steps.dlg.classList.add('and-skip'); steps.dlg.res.textContent = 'not shown';
              line(o, note('denied twice before: the system answers at once, no dialog'));
              await result(false);
              return;
            }
            await step('dlg', 'shown');
            view.append(h('div', { class: 'and-dim and-on' }));
            overlay(h('b', {}, 'Allow Receipts to take pictures and record video?'),
              ui('While using the app', () => answer(true, 'granted until the user revokes it')),
              ui('Only this time', () => answer(true, 'one-time grant: revoked soon after the app leaves the screen')),
              ui('Don’t allow', () => answer(false), true));
          }
          async function answer(ok, why) {
            waiting = null; view.querySelectorAll('.and-dlg, .and-dim').forEach(x => x.remove());
            perm = ok ? 'granted' : perm === 'ask' ? 'denied' : 'blocked';
            if (why) line(o, note(why));
            await result(ok);
          }
          async function result(ok) {
            await step('cb', String(ok), ok ? 'and-ok' : 'and-no');
            paintPerm();
            if (ok) {
              view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Receipts'), h('div', { class: 'and-cam' }, 'camera preview')));
              line(o, '<span class="good">granted:</span> open the camera');
            } else if (perm === 'blocked') {
              screen(h('p', {}, 'Camera is off for Receipts. Turn it on in Settings.'), ui('Open settings', openSettings));
              line(o, '<span class="bad">denied for good:</span> rationale is now false. Only Settings can help.');
            } else {
              home('No camera. Type the receipt in, or try again.');
              line(o, '<span class="bad">denied:</span> rationale is now true. Explain next time.');
            }
            busy = false;
          }
          function openSettings() {
            if (busy || waiting) return;
            view.replaceChildren(h('div', { class: 'and-scr drop-in' }, appbar('Settings › Receipts'),
              h('p', {}, 'Camera permission'),
              ui('Allow only while using the app', () => { waiting = null; perm = 'granted'; paintPerm(); clearSteps(); home('Back from Settings.'); say(o, note('user allowed Camera in Settings and came back. The next check says GRANTED.')); }),
              ui('Don’t allow', () => { waiting = null; home('Camera is still off.'); say(o, note('still blocked')); }, true)));
            waiting = view.firstElementChild;
            say(o, `${hl('startActivity(Intent(ACTION_APPLICATION_DETAILS_SETTINGS, packageUri))')}`);
          }
          home(); paintPerm();
          say(o, 'Tap Take photo, on the phone or below. Try saying no twice.');
          el.append(
            h('div', { class: 'stage' }, h('div', { class: 'and-col' }, dev, permEl), list),
            h('div', { class: 'controls' }, cmd('onClick: Take photo', tap)),
            o);
        },
      },
    ],
  });
})();
