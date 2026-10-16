/* Media, camera and sensors track. Same shape as tracks/kotlin.js.
   Demo styles live in the css string below; every class is prefixed md-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const act = (label, onclick) => h('button', { class: 'cmd', onclick }, label);
  const tag = (text, kind = '') => h('span', { class: 'md-tag' + (kind ? ' md-' + kind : '') }, text);
  const setTag = (t, text, kind = '') => {
    const cls = 'md-tag' + (kind ? ' md-' + kind : '');
    if (t.dataset.v === text + '|' + cls) return;
    t.dataset.v = text + '|' + cls; t.textContent = text; t.className = cls; replay(t, 'pop');
  };
  // A small console: the newest line is bright, older ones fade, at most `max` lines.
  function logger(max = 4) {
    const el = h('div', { class: 'md-log', 'aria-live': 'polite' });
    const log = html => {
      el.append(h('div', { class: 'md-ln drop-in', html }));
      while (el.children.length > max) el.firstElementChild.remove();
    };
    return { el, log };
  }
  // A row of mutually exclusive options. onPick returning false keeps the old choice.
  function choice(label, values, cur, onPick, fmt = v => v) {
    const btns = values.map(v => h('button', { class: 'cmd', onclick() { if (onPick(v) === false) return; set(v); } }, fmt(v)));
    const set = v => btns.forEach((b, i) => b.setAttribute('aria-pressed', String(values[i] === v)));
    set(cur);
    return { el: h('div', { class: 'md-group' }, h('span', { class: 'md-label' }, label), btns), set };
  }
  function toggle(id, label, on, onChange) {
    const input = h('input', { type: 'checkbox', id, checked: on, onchange() { onChange(input.checked); } });
    return h('label', { class: 'switch', for: id }, input, h('span', { html: label }));
  }
  // Runs fn every ms while root is on the page. Stops once root leaves (Reset or navigation).
  function every(root, ms, fn) {
    let seen = false, idle = 0;
    const id = setInterval(() => {
      if (root.isConnected) { seen = true; fn(); return; }
      if (seen || ++idle > 40) clearInterval(id);
    }, ms);
  }
  const lane = (name, ...kids) => h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), h('div', { class: 'lane-track' }, kids));

  const css = `
.md-root { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; min-width: 0; }
.md-split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: start; min-width: 0; }
@media (max-width: 640px) { .md-split { grid-template-columns: minmax(0, 1fr); } .md-split > .md-phone, .md-split > .md-vf { order: -1; } }
.md-col { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; align-content: start; min-width: 0; }
.md-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.md-group { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.md-tag { display: inline-block; font: 600 0.72rem var(--mono); padding: 3px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); overflow-wrap: anywhere; }
.md-tag.md-ok { background: var(--ok-soft); color: var(--ok); }
.md-tag.md-no { background: var(--err-soft); color: var(--err); }
.md-tag.md-wait { background: var(--warm-soft); color: var(--warm); }
.md-tag.md-acc { background: var(--accent-soft); color: var(--accent); }
.md-tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.md-log { font: 500 0.82rem/1.6 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 10px 14px; min-height: calc(4 * 1.6em + 20px); display: grid; align-content: start; overflow-x: auto; min-width: 0; }
.md-ln { white-space: pre-wrap; overflow-wrap: anywhere; }
.md-ln::before { content: ">\\00a0"; color: var(--t-c); }
@media (max-width: 520px) { .md-log { font-size: 0.74rem; padding: 10px 12px; } }
.md-ln:not(:last-child) { opacity: 0.55; }

/* 1 player */
.md-states { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-width: 0; }
.md-state { font: 600 0.74rem var(--mono); padding: 5px 9px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--muted); transition: border-color 0.2s, background 0.2s, color 0.2s; }
.md-state.on { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); }
.md-arrow { color: var(--muted); font-size: 0.8rem; }
.md-screen { position: relative; width: 100%; max-width: 520px; justify-self: center; aspect-ratio: 16 / 9; border-radius: 12px; background: var(--code-bg); overflow: hidden; display: grid; place-items: center; }
.md-scene { position: absolute; inset: 0; background-image: radial-gradient(circle at 30% 40%, rgba(61, 220, 132, 0.38), transparent 42%), radial-gradient(circle at 72% 62%, rgba(124, 200, 245, 0.32), transparent 40%), radial-gradient(circle at 50% 18%, rgba(242, 196, 109, 0.26), transparent 34%); background-size: 200% 200%; animation: md-drift 5s linear infinite; animation-play-state: paused; opacity: 0.5; transition: opacity 0.3s; }
.md-scene.md-run { animation-play-state: running; opacity: 1; }
.md-screen[data-st="IDLE"] .md-scene, .md-screen[data-st="released"] .md-scene { opacity: 0; }
@keyframes md-drift { 0% { background-position: 0% 0%; } 50% { background-position: 100% 70%; } 100% { background-position: 0% 0%; } }
.md-badge { position: relative; z-index: 1; display: grid; justify-items: center; gap: 8px; font: 600 0.8rem var(--mono); color: var(--code-ink); padding: 6px 12px; border-radius: 12px; background: rgba(0, 0, 0, 0.45); }
.md-badge:empty { display: none; }
.md-badge .spinner { border-color: rgba(255, 255, 255, 0.15); border-top-color: var(--hi); width: 30px; height: 30px; }
.md-prog { position: relative; height: 8px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.md-prog span { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 99px; }
.md-buf { background: var(--muted); opacity: 0.35; }
.md-played { background: var(--accent); }
.md-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 12px; align-items: center; min-width: 0; }
.md-time { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.md-kvs { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.md-kv { font: 500 0.76rem var(--mono); padding: 3px 8px; border-radius: 8px; background: var(--sunk); color: var(--muted); }
.md-kv b { color: var(--ink); }
.md-kv b.md-yes { color: var(--accent); }

/* phone */
.md-phone { position: relative; width: 200px; height: 330px; flex: none; justify-self: center; border-radius: 28px; border: 8px solid var(--code-bg); background: var(--surface); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.25s; }
.md-sb { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 24px; padding: 4px 12px; background: var(--sunk); font: 600 0.68rem var(--mono); color: var(--muted); }
.md-pscreen { flex: 1; min-height: 0; padding: 10px; display: grid; align-content: start; gap: 10px; overflow: hidden; }
.md-noti { display: grid; gap: 6px; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); font-size: 0.78rem; line-height: 1.3; }
.md-noti-top { display: flex; gap: 8px; align-items: center; min-width: 0; }
.md-noti-top b { display: block; font-size: 0.8rem; }
.md-noti-top small { color: var(--muted); }
.md-art { width: 30px; height: 30px; border-radius: 8px; background: var(--accent-soft); border: 2px solid var(--accent); flex: none; }
.md-nbtns { display: flex; gap: 6px; justify-content: center; }
.md-nbtn { border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; font: 700 0.72rem var(--mono); padding: 5px 10px; border-radius: 999px; }
.md-nbtn.md-main { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.md-home { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding: 6px 4px; }
.md-app { aspect-ratio: 1; border-radius: 10px; background: var(--sunk); }
.md-appui { display: grid; gap: 8px; justify-items: center; text-align: center; padding-top: 4px; font-size: 0.82rem; }
.md-cover { width: 84px; height: 84px; border-radius: 14px; background: var(--accent-soft); border: 3px solid var(--accent); }
.md-cover.md-run { animation: md-breathe 1.6s ease-in-out infinite; }
@keyframes md-breathe { 50% { transform: scale(1.05); } }
.md-gone { opacity: 0.35; }

/* 3 audio focus */
.md-fill { position: absolute; left: 0; top: 4px; bottom: 4px; border-radius: 5px; background: var(--accent); transition: width 0.35s; }
.md-fill.md-other { background: var(--warm); }
.md-fill-label { position: absolute; left: 8px; top: 0; bottom: 0; display: flex; align-items: center; font: 600 0.72rem var(--mono); color: var(--ink); z-index: 1; white-space: nowrap; }

/* 4 camera */
.md-vf { position: relative; width: 200px; height: 270px; flex: none; justify-self: center; border-radius: 22px; border: 8px solid var(--code-bg); background: var(--code-bg); overflow: hidden; display: grid; place-items: center; }
.md-vf .md-scene { opacity: 0; transition: opacity 0.35s; }
.md-vf.md-open .md-scene { opacity: 1; animation-play-state: running; }
.md-vf[data-lens="FRONT"] .md-scene { transform: scaleX(-1); background-image: radial-gradient(circle at 50% 42%, rgba(242, 196, 109, 0.42), transparent 30%), radial-gradient(circle at 30% 80%, rgba(198, 168, 255, 0.3), transparent 40%), radial-gradient(circle at 80% 20%, rgba(124, 200, 245, 0.28), transparent 35%); }
.md-vf-label { position: relative; z-index: 1; font: 600 0.74rem var(--mono); color: var(--code-ink); padding: 4px 10px; border-radius: 999px; background: rgba(0, 0, 0, 0.45); }
.md-vf-label:empty { display: none; }
.md-flash { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.85); opacity: 0; pointer-events: none; z-index: 2; }
.md-flash.md-go { animation: md-flash 0.35s ease-out; }
@keyframes md-flash { from { opacity: 1; } to { opacity: 0; } }
.md-shutter { position: absolute; bottom: 12px; left: 50%; width: 44px; height: 44px; margin-left: -22px; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.8); background: rgba(255, 255, 255, 0.25); cursor: pointer; z-index: 3; padding: 0; }
.md-shutter:active { transform: scale(0.9); }
.md-thumbs { display: flex; flex-wrap: wrap; gap: 6px; min-height: 40px; align-items: center; }
.md-thumb { width: 38px; height: 38px; border-radius: 8px; background-color: var(--code-bg); background-image: radial-gradient(circle at 35% 40%, rgba(61, 220, 132, 0.5), transparent 50%), radial-gradient(circle at 70% 70%, rgba(124, 200, 245, 0.4), transparent 45%); }
.md-thumb.md-front { background-image: radial-gradient(circle at 50% 42%, rgba(242, 196, 109, 0.55), transparent 40%), radial-gradient(circle at 30% 80%, rgba(198, 168, 255, 0.4), transparent 45%); }

/* 5 image analysis */
.md-tick { position: absolute; top: 5px; bottom: 5px; width: 3px; margin-left: -1.5px; border-radius: 2px; background: var(--accent); }
.md-tick.md-drop { background: var(--err); top: 10px; bottom: 10px; opacity: 0.85; }
.md-tick.md-block { background: none; border-left: 2px dotted var(--muted); width: 0; }
.md-legend i.md-li-ok { background: var(--accent); width: 4px; }
.md-legend i.md-li-drop { background: var(--err); width: 4px; }
.md-legend i.md-li-block { border-left: 2px dotted var(--muted); width: 0; }
.md-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 8px; }
.md-stat { padding: 8px 10px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); display: grid; gap: 2px; min-width: 0; }
.md-stat b { font: 700 1.25rem var(--display); font-variant-numeric: tabular-nums; }
.md-stat small { color: var(--muted); font-size: 0.78rem; line-height: 1.3; }
.md-stat.md-bad b { color: var(--err); }

/* depth demos */
.md-a1-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; min-width: 0; }
.md-a1-box { aspect-ratio: 4 / 3; border-radius: 12px; background: var(--code-bg); display: grid; place-items: center; overflow: hidden; }
.md-a1-word { display: inline-block; font: 700 0.9rem var(--mono); color: var(--t-s); padding: 6px 10px; border: 2px dashed var(--t-s); border-radius: 8px; white-space: nowrap; transition: transform 0.45s ease; }

/* 6 sensors */
.md-pad { position: relative; width: 156px; max-width: 100%; aspect-ratio: 1; justify-self: center; border-radius: 16px; background-color: var(--bg); border: 2px solid var(--line); touch-action: none; cursor: grab; background-image: linear-gradient(var(--line), var(--line)), linear-gradient(var(--line), var(--line)); background-size: 100% 1px, 1px 100%; background-position: center; background-repeat: no-repeat; }
.md-ball { position: absolute; left: 50%; top: 50%; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; background: var(--accent); box-shadow: var(--shadow); transition: transform 50ms linear; }
.md-xyz { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.md-xyz .md-kv { text-align: center; }
.md-live { animation: md-blink 0.25s ease-out; }
@keyframes md-blink { from { background: var(--accent-soft); } }
.md-leak { background: var(--err-soft); }

/* 7 location */
.md-map { position: relative; width: 100%; max-width: 600px; justify-self: center; aspect-ratio: 16 / 10; border-radius: 14px; overflow: hidden; background-color: var(--bg); background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 12.5% 20%; }
.md-route { position: absolute; inset: 0; width: 100%; height: 100%; }
.md-route ellipse { fill: none; stroke: var(--muted); stroke-width: 2; stroke-dasharray: 6 6; opacity: 0.6; }
.md-circ { position: absolute; aspect-ratio: 1; }
.md-c { position: absolute; inset: 0; border-radius: 50%; }
.md-fix > .md-c { background: var(--accent-soft); border: 2px solid var(--accent); opacity: 0.85; animation: md-in 0.35s ease-out both; }
.md-fix > .md-c::after { content: ""; position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: var(--accent); }
.md-fix.md-old > .md-c { opacity: 0.3; }
.md-fix.md-coarse > .md-c { border-style: dashed; }
@keyframes md-in { from { transform: scale(0.2); opacity: 0; } }
.md-fence > .md-c { border: 2px dashed var(--warm); }
.md-fence.md-in > .md-c { background: var(--warm-soft); }
.md-fence.md-off > .md-c { opacity: 0.35; }
.md-fence-name { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font: 600 0.66rem var(--mono); color: var(--warm); white-space: nowrap; }
.md-you { position: absolute; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--ink); box-shadow: 0 0 0 3px var(--bg); z-index: 2; transition: left 0.25s linear, top 0.25s linear; }
.md-scale { position: absolute; right: 8px; bottom: 6px; font: 600 0.62rem var(--mono); color: var(--muted); }
`;

  Lab.addTrack({
    id: 'media',
    title: 'Media, camera and sensors',
    description: 'Play audio and video with Media3, capture and analyze frames with CameraX, and read sensors and location without draining the battery.',
    group: 'Going deeper',
    requires: ['android'],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'exoplayer',
        title: 'Playing media with Media3 ExoPlayer',
        tagline: 'Build, prepare, play, release. Four states in between.',
        level: 'intermediate',
        body: `
<p>Media3 ExoPlayer is the player Jetpack recommends. Build one with <code>ExoPlayer.Builder(context)</code>, give it a <code>MediaItem</code> and call <code>prepare()</code> to start loading. <code>play()</code> sets <code>playWhenReady</code> to true, so playback starts as soon as there is enough data.</p>
<p>The player moves through four states. <code>STATE_IDLE</code> means nothing is loading. <code>STATE_BUFFERING</code> means it waits for data. <code>STATE_READY</code> means it can play right away. <code>STATE_ENDED</code> means it reached the end. <code>isPlaying</code> is true only when the state is READY and playWhenReady is true. Watch both with a <code>Player.Listener</code>.</p>
<p>A player holds decoders, network connections and memory. Create it when the screen starts and call <code>release()</code> when it stops. In Compose, a <code>LifecycleStartEffect</code> does exactly that. Show video with <code>PlayerSurface</code> from <code>media3-ui-compose</code>, or wrap the classic <code>PlayerView</code> in an <code>AndroidView</code>.</p>`,
        code: `@Composable
fun VideoScreen(url: String) {
    val context = LocalContext.current
    var player by remember { mutableStateOf<ExoPlayer?>(null) }

    LifecycleStartEffect(url) {
        val exo = ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(url))
            prepare()               // IDLE -> BUFFERING -> READY
            playWhenReady = true    // same as play()
        }
        player = exo
        onStopOrDispose {
            exo.release()           // frees decoders and the network
            player = null
        }
    }

    player?.let { PlayerSurface(player = it, modifier = Modifier.aspectRatio(16f / 9f)) }
}

val listener = object : Player.Listener {
    override fun onPlaybackStateChanged(state: Int) {
        when (state) {
            Player.STATE_BUFFERING -> showSpinner()
            Player.STATE_READY -> hideSpinner()
            Player.STATE_ENDED -> showReplay()
            Player.STATE_IDLE -> Unit
        }
    }
    override fun onIsPlayingChanged(isPlaying: Boolean) { keepScreenOn(isPlaying) }
}`,
        remember: 'Build, setMediaItem, prepare, play. Release when the screen stops.',
        terms: [
          { term: 'ExoPlayer', def: 'The Media3 implementation of the Player interface that loads, decodes and plays audio and video.' },
          { term: 'MediaItem', def: 'A Media3 description of one piece of media to play, built from a URI plus optional metadata and settings.' },
          { term: 'playWhenReady', def: 'The player flag that says playback should run whenever the player is in STATE_READY; play() and pause() set it.' },
          { term: 'Playback state', def: 'One of STATE_IDLE, STATE_BUFFERING, STATE_READY or STATE_ENDED, reported to Player.Listener.onPlaybackStateChanged.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Load a URL and start playback.', code: 'val player = ExoPlayer.Builder(context).build()\nplayer.setMediaItem(MediaItem.[[fromUri]](url))\nplayer.[[prepare]]()\nplayer.[[play]]()', why: '<code>prepare()</code> starts loading. Without it the player stays in STATE_IDLE and <code>play()</code> does nothing visible.' },
          { type: 'bug', prompt: 'Every time the user leaves and comes back, memory and decoder use grows. Tap the line.', code: 'LifecycleStartEffect(url) {\n    val exo = ExoPlayer.Builder(context).build()\n    exo.setMediaItem(MediaItem.fromUri(url))\n    exo.prepare()\n    player = exo\n    onStopOrDispose {\n        exo.pause()\n        player = null\n    }\n}', bug: 6, fix: '        exo.release()', why: 'Each start builds a new player. Pausing the old one keeps its decoders and buffers alive. <code>release()</code> frees them.' },
        ],
        quiz: [
          { q: 'The state is <code>STATE_BUFFERING</code> and <code>playWhenReady</code> is true. What is <code>isPlaying</code>?', options: ['true', 'false', 'It depends on the network'], a: 1, why: '<code>isPlaying</code> needs STATE_READY too. Playback resumes on its own once enough data has loaded.' },
          { q: 'Where should a screen’s player be released?', options: ['In <code>onPause</code>', 'When the screen stops, such as <code>onStop</code> or <code>onStopOrDispose</code>', 'Never, the garbage collector handles it'], a: 1, why: 'Since Android 7 apps can be visible in multi-window while paused, so stop is the right moment. The garbage collector does not free codecs.' },
          { q: 'Playback reached <code>STATE_ENDED</code>. Your button calls <code>player.play()</code>. What happens?', options: ['It restarts from the beginning', 'playWhenReady becomes true but the state stays ENDED', 'It throws'], a: 1, why: 'Seek first, for example <code>seekTo(0)</code>. Media3’s <code>Util.handlePlayButtonAction()</code> does that for you.' },
        ],
        visual(el) {
          const DUR = 30;
          const S = { state: 'BUFFERING', pwr: false, pos: 0, buf: 0, item: true, released: false, slow: false, playing: false };
          const STATES = ['IDLE', 'BUFFERING', 'READY', 'ENDED'];
          const chips = STATES.map(s => h('span', { class: 'md-state' }, 'STATE_' + s));
          const row = h('div', { class: 'md-states', 'aria-label': 'Playback state' });
          chips.forEach((c, i) => { if (i) row.append(h('span', { class: 'md-arrow', 'aria-hidden': 'true' }, '→')); row.append(c); });
          const scene = h('div', { class: 'md-scene' });
          const badge = h('div', { class: 'md-badge' });
          const screen = h('div', { class: 'md-screen' }, scene, badge);
          const buf = h('span', { class: 'md-buf' }), played = h('span', { class: 'md-played' });
          const time = h('span', { class: 'md-time' });
          const kv = h('div', { class: 'md-kvs' });
          const { el: logEl, log } = logger();
          const fmt = s => `0:${String(Math.floor(s)).padStart(2, '0')}`;
          let lastBadge = '';
          function paint() {
            chips.forEach((c, i) => c.classList.toggle('on', !S.released && STATES[i] === S.state || S.released && i === 0));
            screen.dataset.st = S.released ? 'released' : S.state;
            scene.classList.toggle('md-run', S.playing);
            const b = S.released ? 'released' : S.state === 'IDLE' ? (S.item ? 'idle' : 'empty') : S.state === 'BUFFERING' ? 'buffering' : S.state === 'ENDED' ? 'ended' : S.playing ? '' : 'paused';
            if (b !== lastBadge) {
              lastBadge = b;
              const text = { released: 'Released', idle: 'Idle: call prepare()', empty: 'No MediaItem', ended: 'Ended', paused: 'Paused' }[b];
              badge.replaceChildren(...(b === 'buffering' ? [h('div', { class: 'spinner' }), 'Buffering'] : b ? [text] : []));
            }
            buf.style.width = `${(S.buf / DUR) * 100}%`;
            played.style.width = `${(S.pos / DUR) * 100}%`;
            time.textContent = `${fmt(S.pos)} / ${fmt(DUR)}`;
            kv.innerHTML = `<span class="md-kv">playWhenReady <b class="${S.pwr ? 'md-yes' : ''}">${S.pwr}</b></span><span class="md-kv">isPlaying <b class="${S.playing ? 'md-yes' : ''}">${S.playing}</b></span>`;
          }
          function setState(s) {
            if (S.state === s) return;
            S.state = s;
            log(`onPlaybackStateChanged(<span class="good">STATE_${s}</span>)`);
            replay(chips[STATES.indexOf(s)], 'pop');
          }
          function sync() {
            const p = !S.released && S.state === 'READY' && S.pwr;
            if (p !== S.playing) { S.playing = p; log(`onIsPlayingChanged(<span class="t-n">${p}</span>)`); }
            paint();
          }
          const gone = () => { if (!S.released) return false; replay(screen, 'shake'); log('<span class="bad">ignored:</span> this player was released. Build a new one.'); return true; };
          function tick() {
            if (S.released || S.state === 'IDLE' || S.state === 'ENDED') return;
            if (S.buf < DUR) S.buf = Math.max(S.buf, Math.min(DUR, S.pos + 6, S.buf + (S.slow ? 0.04 : 0.6))); // loads at most ~6 s ahead
            if (S.state === 'READY' && S.pwr) S.pos = Math.min(DUR, S.pos + 0.25);
            if (S.pos >= DUR) setState('ENDED');
            else if (S.state === 'READY' && S.buf < DUR && S.pos >= S.buf - 0.05) setState('BUFFERING');
            else if (S.state === 'BUFFERING' && (S.buf - S.pos >= 2.5 || S.buf >= DUR)) setState('READY');
            sync();
          }
          const root = h('div', { class: 'md-root' },
            row, screen,
            h('div', { class: 'md-prog', 'aria-hidden': 'true' }, buf, played),
            h('div', { class: 'md-meta' }, kv, time),
            h('div', { class: 'controls' },
              cmd('player.play()', () => {
                if (gone()) return;
                S.pwr = true; log('playWhenReady = <span class="t-n">true</span>');
                if (S.state === 'ENDED') log('<span class="muted">state stays ENDED: seek first</span>');
                if (S.state === 'IDLE') log('<span class="muted">still IDLE: nothing loads until prepare()</span>');
                sync();
              }),
              cmd('player.pause()', () => { if (gone()) return; S.pwr = false; log('playWhenReady = <span class="t-n">false</span>'); sync(); }),
              cmd('player.seekTo(0)', () => {
                if (gone()) return;
                S.pos = 0; S.buf = 0; log('seekTo(0): back buffer is gone, load again');
                if (S.state !== 'IDLE') setState('BUFFERING');
                sync();
              }),
              cmd('player.release()', () => {
                if (gone()) return;
                S.released = true; S.state = 'IDLE'; S.pwr = false;
                log('release(): <span class="good">decoders and network freed</span>');
                sync();
              }),
              cmd('ExoPlayer.Builder(context).build()', () => {
                Object.assign(S, { state: 'IDLE', pwr: false, pos: 0, buf: 0, item: false, released: false });
                log('new player in <span class="good">STATE_IDLE</span>, no media yet');
                sync();
              }),
              cmd('setMediaItem(MediaItem.fromUri(url))', () => {
                if (gone()) return;
                S.item = true; S.pos = 0; S.buf = 0; log('MediaItem set');
                if (S.state !== 'IDLE') setState('BUFFERING');
                sync();
              }),
              cmd('player.prepare()', () => {
                if (gone()) return;
                if (S.state !== 'IDLE') { log('<span class="muted">already prepared: no-op</span>'); return; }
                if (!S.item) { log('prepare() with an empty playlist'); setState('ENDED'); sync(); return; }
                S.buf = S.pos; setState('BUFFERING'); sync();
              })),
            h('div', { class: 'controls' }, toggle('md-player-slow', 'Slow network', false, v => { S.slow = v; log(v ? 'network slowed down' : 'network back to normal'); })),
            logEl,
            h('p', { class: 'tip' }, 'Press play, then turn on the slow network and watch READY fall back to BUFFERING.'));
          el.append(root);
          log('setMediaItem(...), prepare()');
          log('onPlaybackStateChanged(<span class="good">STATE_BUFFERING</span>)');
          paint();
          every(root, 100, tick);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'session',
        title: 'Background playback with MediaSessionService',
        tagline: 'The service owns the player. Everything else talks to the session.',
        level: 'advanced',
        body: `
<p>To keep audio going after the user leaves your screen, move the player into a <code>MediaSessionService</code>. The service owns the player and a <code>MediaSession</code>. The session is how the notification, the lock screen, Bluetooth headsets, Android Auto and Wear OS send play and pause to your player.</p>
<p>Return the session from <code>onGetSession()</code>. Media3 then posts the media notification and moves the service in and out of the foreground for you: foreground while playing, background while paused, with the notification still there. Declare the service with <code>foregroundServiceType="mediaPlayback"</code>, the <code>FOREGROUND_SERVICE_MEDIA_PLAYBACK</code> permission and the <code>MediaSessionService</code> intent filter.</p>
<p>Your UI talks to the service through a <code>MediaController</code> built from a <code>SessionToken</code>. The controller implements <code>Player</code>, so UI code looks the same as in the last lesson. Release the player and the session in <code>onDestroy()</code>. The Platform track’s foreground services lesson has the general rules.</p>`,
        code: `// AndroidManifest.xml
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
// <service android:name=".PlaybackService"
//     android:foregroundServiceType="mediaPlayback"
//     android:exported="true">
//     <intent-filter>
//         <action android:name="androidx.media3.session.MediaSessionService" />
//     </intent-filter>
// </service>

class PlaybackService : MediaSessionService() {
    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val player = ExoPlayer.Builder(this).build()
        mediaSession = MediaSession.Builder(this, player).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo) = mediaSession

    // Optional: stop even when playing if the user swipes the app away.
    override fun onTaskRemoved(rootIntent: Intent?) {
        pauseAllPlayersAndStopSelf()
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}

// In the UI (await() comes from kotlinx-coroutines-guava):
val token = SessionToken(context, ComponentName(context, PlaybackService::class.java))
val controller = MediaController.Builder(context, token).buildAsync().await()
controller.setMediaItem(MediaItem.fromUri(url))
controller.prepare()
controller.play()`,
        remember: 'Player and MediaSession live in the service. The UI holds a MediaController.',
        terms: [
          { term: 'MediaSession', def: 'A Media3 object that exposes a player to the system, notifications, headsets and other devices so they can control it.' },
          { term: 'MediaSessionService', def: 'A Media3 service base class that hosts MediaSessions, shows the media notification and manages its own foreground state.' },
          { term: 'MediaController', def: 'A Player implementation that sends commands to a MediaSession in another component or process.' },
          { term: 'SessionToken', def: 'A handle that identifies a MediaSession or MediaSessionService so a MediaController can connect to it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Create the session and hand it to controllers.', code: 'override fun onCreate() {\n    super.onCreate()\n    val player = ExoPlayer.Builder(this).build()\n    mediaSession = MediaSession.[[Builder]](this, player).build()\n}\n\noverride fun [[onGetSession]](controllerInfo: MediaSession.ControllerInfo) = mediaSession', why: 'Returning the session from <code>onGetSession()</code> is what lets controllers, the notification and headsets connect.' },
          { type: 'bug', prompt: 'After the service stops, the audio decoder is still held. Tap the line.', code: 'override fun onDestroy() {\n    mediaSession?.run {\n        release()\n        mediaSession = null\n    }\n    super.onDestroy()\n}', bug: 2, fix: '        player.release(); release()', why: 'Releasing the session does not release its player. Release the player first, then the session.' },
        ],
        quiz: [
          { q: 'The user pauses, then presses Home. What does Media3 do with the service?', options: ['Keeps it in the foreground forever', 'Takes it out of the foreground; the notification stays and can be dismissed', 'Destroys it at once'], a: 1, why: 'A paused service does not need foreground priority. The system may stop it later, so keep state you need to resume.' },
          { q: 'How does a Bluetooth headset’s play button reach your player?', options: ['A BroadcastReceiver you write', 'Through the MediaSession', 'Through the Activity’s onKeyDown'], a: 1, why: 'Media buttons go to the active MediaSession, which calls play or pause on its player.' },
          { q: 'What should the Activity use to control playback?', options: ['A second ExoPlayer', 'A <code>MediaController</code> built from a <code>SessionToken</code>', 'Static access to the service’s player field'], a: 1, why: 'The controller talks to the session, so the UI and the system share one player.' },
        ],
        deeper: [
          {
            title: 'Controllers connect, and must let go',
            body: `<p>Building a <code>MediaController</code> with <code>buildAsync()</code> returns a future. Connecting binds your UI to the service, which may create the service first. Build the controller in <code>onStart</code> and release it in <code>onStop</code> with <code>MediaController.releaseFuture(future)</code>.</p>
<p>A connected controller keeps the service bound. Forget to release it and every visit leaves one more controller behind. A paused service with leaked controllers stays alive, holding its player and buffers, long after the user is gone.</p>`,
            code: `class PlayerActivity : ComponentActivity() {
    private lateinit var future: ListenableFuture<MediaController>

    override fun onStart() {
        super.onStart()
        val token = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        future = MediaController.Builder(this, token).buildAsync()
        future.addListener({ bindUi(future.get()) }, ContextCompat.getMainExecutor(this))
    }

    override fun onStop() {
        MediaController.releaseFuture(future)   // also cancels a pending connect
        super.onStop()
    }
}`,
            visual(el) {
              const S = { started: false, ctl: 0, leaked: 0, playing: false, svc: 'none', release: true, busy: false };
              const { el: logEl, log } = logger(5);
              const aTag = tag(''), cTag = tag(''), sTag = tag('');
              const paint = () => {
                setTag(aTag, S.started ? 'activity: started' : 'activity: stopped', S.started ? 'acc' : '');
                setTag(cTag, `controllers bound: ${S.ctl}`, S.leaked ? 'no' : S.ctl ? 'ok' : '');
                setTag(sTag, { none: 'service: not created', bound: S.playing ? 'service: playing, foreground' : 'service: paused, kept alive', idle: 'service: paused, nothing binds it' }[S.svc], S.svc === 'bound' ? (S.playing ? 'ok' : S.leaked ? 'no' : 'wait') : S.svc === 'idle' ? 'wait' : '');
              };
              const settle = () => {
                if (S.svc === 'none') return;
                if (S.ctl === 0 && !S.playing) { S.svc = 'idle'; log('no controllers, not playing: <span class="muted">the system may stop the service</span>'); }
                else if (!S.started && S.leaked && !S.playing) { S.svc = 'bound'; log(`<span class="bad">${S.leaked} leaked controller${S.leaked > 1 ? 's' : ''}</span> keep the paused service and its player alive`); }
                else S.svc = 'bound';
              };
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, aTag, cTag, sTag),
                h('div', { class: 'controls' },
                  cmd('onStart() { buildAsync() }', async () => {
                    if (S.busy) return;
                    if (S.started) { log('<span class="muted">already started</span>'); return; }
                    S.busy = true; S.started = true; paint();
                    log('buildAsync(): binding to PlaybackService…');
                    await sleep(450); if (!root.isConnected) return;
                    S.ctl++; S.svc = 'bound';
                    log(`<span class="good">connected</span>, ${S.ctl} controller${S.ctl > 1 ? 's' : ''} bound`);
                    paint(); S.busy = false;
                  }),
                  cmd('onStop()', () => {
                    if (S.busy) return;
                    if (!S.started) { log('<span class="muted">already stopped</span>'); return; }
                    S.started = false;
                    if (S.release) { S.ctl--; log('MediaController.releaseFuture(future): <span class="good">unbound</span>'); }
                    else { S.leaked++; log('<span class="bad">no release:</span> the controller stays bound'); }
                    settle(); paint();
                  }),
                  cmd('controller.play() / pause()', () => {
                    if (S.busy) return;
                    if (!S.started) { log('<span class="bad">no live controller:</span> the activity is stopped'); return; }
                    S.playing = !S.playing; log(S.playing ? 'play(): service goes foreground' : 'pause(): service leaves foreground');
                    paint();
                  })),
                h('div', { class: 'controls' }, toggle('md-s1-release', 'release the controller in <code>onStop()</code>', true, v => { S.release = v; log(v ? 'onStop() will release the controller' : 'onStop() will forget to release'); })),
                logEl);
              el.append(root);
              paint();
              log('Start, pause, stop. Then turn the release off and repeat.');
            },
          },
          {
            title: 'Resuming after a restart',
            body: `<p>Since Android 11, the media controls in Quick Settings can show your app’s last session after the app was killed or the phone restarted. When the user taps play there, the system sends a media button event. Media3’s <code>MediaButtonReceiver</code> starts your service, and Media3 calls <code>onPlaybackResumption()</code> on your session callback.</p>
<p>The session doesn’t remember anything across a restart. You do. Save the queue and position as playback goes, and return them from <code>onPlaybackResumption()</code>. The default implementation fails, so without it the play button does nothing.</p>`,
            code: `// AndroidManifest.xml
// <receiver android:name="androidx.media3.session.MediaButtonReceiver" android:exported="true">
//     <intent-filter><action android:name="android.intent.action.MEDIA_BUTTON" /></intent-filter>
// </receiver>

override fun onPlaybackResumption(
    mediaSession: MediaSession,
    controller: MediaSession.ControllerInfo,
    isForPlayback: Boolean,                        // Media3 1.9+; older versions lack it
): ListenableFuture<MediaSession.MediaItemsWithStartPosition> =
    serviceScope.future {                          // kotlinx-coroutines-guava
        val saved = lastPlayedStore.read()         // written while playing
        MediaSession.MediaItemsWithStartPosition(saved.items, saved.index, saved.positionMs)
    }`,
            visual(el) {
              const S = { impl: true, saved: false, booted: false, playing: false, pos: '0:00' };
              const { el: logEl, log } = logger(4);
              const shade = h('div', { class: 'md-col' });
              const body = h('div', { class: 'md-col' });
              const sb = h('div', { class: 'md-sb' }, h('span', {}, '9:41'), h('span', {}, ''));
              const ph = h('div', { class: 'md-phone' }, sb, h('div', { class: 'md-pscreen' }, shade, body));
              const tapCard = () => {
                if (!S.booted || !S.saved) { replay(ph, 'shake'); log('<span class="muted">no resumption card is showing</span>'); return; }
                if (S.playing) { log('<span class="muted">already playing</span>'); return; }
                log('MEDIA_BUTTON: MediaButtonReceiver starts PlaybackService');
                if (S.impl) { S.playing = true; log(`onPlaybackResumption(): <span class="good">Episode 12 at ${S.pos}</span>, playing`); }
                else { replay(ph, 'shake'); log('onPlaybackResumption(): <span class="bad">UnsupportedOperationException</span> (default). Nothing plays.'); }
                paint();
              };
              function paint() {
                sb.lastChild.textContent = S.playing ? 'audio' : S.booted ? 'just restarted' : '';
                shade.replaceChildren(...(S.booted && S.saved ? [h('div', { class: 'md-noti drop-in' },
                  h('div', { class: 'md-noti-top' }, h('span', { class: 'md-art' }), h('span', {}, h('b', {}, 'Episode 12'), h('small', {}, S.playing ? `Playing from ${S.pos}` : 'Media controls'))),
                  h('div', { class: 'md-nbtns' }, h('button', { class: 'md-nbtn md-main', onclick: tapCard }, S.playing ? 'Playing' : 'Play')))] : []));
                body.replaceChildren(h('div', { class: 'md-home' }, Array.from({ length: 12 }, () => h('span', { class: 'md-app' }))));
              }
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-split' },
                  h('div', { class: 'md-col' },
                    h('div', { class: 'controls' },
                      cmd('listen, pause at 12:40', () => {
                        S.saved = true; S.booted = false; S.playing = false; S.pos = '12:40';
                        log('Player.Listener saves <span class="good">Episode 12, 12:40</span> to DataStore');
                        paint();
                      }),
                      act('Restart the phone', () => {
                        S.booted = true; S.playing = false;
                        log(S.saved ? 'restarted: Quick Settings shows the last session' : 'restarted: <span class="muted">nothing was played, no card</span>');
                        paint(); replay(ph, 'pop');
                      }),
                      cmd('tap play on the card', tapCard)),
                    toggle('md-s2-impl', 'override <code>onPlaybackResumption()</code>', true, v => { S.impl = v; S.playing = false; log(v ? 'callback returns the saved queue' : 'using the default callback'); paint(); })),
                  ph),
                logEl);
              el.append(root);
              paint();
              log('Listen to something first, then restart the phone.');
            },
          },
          {
            title: 'Your own buttons in the notification',
            body: `<p>The notification and the lock screen show play, pause, previous and next by default. To add “forward 15 s” or “like”, define a <code>SessionCommand</code>, show it as a <code>CommandButton</code>, and allow it for controllers in <code>onConnect</code>.</p>
<p>When a button is pressed, Media3 calls <code>onCustomCommand</code> on the session callback. The same command works from the notification, Android Auto and your own UI.</p>`,
            code: `// CommandButton.Builder(icon) and setMediaButtonPreferences are @UnstableApi:
// add @OptIn(UnstableApi::class) to the enclosing function (Media3 1.5+)
val skip15 = SessionCommand("SKIP_15", Bundle.EMPTY)
val button = CommandButton.Builder(CommandButton.ICON_SKIP_FORWARD_15)
    .setDisplayName("Forward 15 seconds")
    .setSessionCommand(skip15)
    .build()

mediaSession = MediaSession.Builder(this, player)
    .setMediaButtonPreferences(listOf(button))
    .setCallback(object : MediaSession.Callback {
        override fun onConnect(session: MediaSession, controller: MediaSession.ControllerInfo) =
            MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(
                    MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon().add(skip15).build()
                )
                .build()

        override fun onCustomCommand(
            session: MediaSession, controller: MediaSession.ControllerInfo,
            customCommand: SessionCommand, args: Bundle,
        ): ListenableFuture<SessionResult> {
            if (customCommand == skip15) session.player.seekTo(session.player.currentPosition + 15_000)
            return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
        }
    })
    .build()`,
          },
        ],
        underHood: {
          body: `<p><code>MediaSessionService</code> is a bound service. Controllers, System UI and other apps find it through its <code>MediaSessionService</code> intent filter and bind to it. Each Media3 session also creates a platform session (<code>android.media.session</code>), so the system media controls, Bluetooth headsets and older clients see it without knowing about Media3.</p>
<p>Media3 watches the player. When playback starts, it builds a MediaStyle notification through its <code>MediaNotification.Provider</code> and calls <code>startForeground()</code>. When playback pauses, it leaves the foreground but keeps the notification. Customize the notification by setting your own provider, not by posting a second one.</p>`,
        },
        mistakes: [
          {
            title: 'Missing the foreground service type',
            bad: `<service android:name=".PlaybackService" android:exported="true">
    <intent-filter>
        <action android:name="androidx.media3.session.MediaSessionService" />
    </intent-filter>
</service>`,
            good: `<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<service android:name=".PlaybackService"
    android:foregroundServiceType="mediaPlayback"
    android:exported="true">`,
            why: 'Apps targeting Android 14 or higher must declare a type for every foreground service. Without it, the service crashes the moment playback starts.',
          },
          {
            title: 'Blocking on the controller future',
            bad: `override fun onStart() {
    super.onStart()
    val controller = MediaController.Builder(this, token).buildAsync().get()   // main thread
    bindUi(controller)
}`,
            good: `override fun onStart() {
    super.onStart()
    future = MediaController.Builder(this, token).buildAsync()
    future.addListener({ bindUi(future.get()) }, ContextCompat.getMainExecutor(this))
}`,
            why: 'Connecting needs the main thread to deliver the result. <code>get()</code> on the main thread waits for something that can never arrive, and the app freezes.',
          },
          {
            title: 'Posting your own notification next to Media3’s',
            bad: `override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startForeground(1, buildMyPlayerNotification())
    return super.onStartCommand(intent, flags, startId)
}`,
            good: `override fun onCreate() {
    super.onCreate()
    setMediaNotificationProvider(
        DefaultMediaNotificationProvider.Builder(this).setChannelId("playback").build()
    )
}`,
            why: 'Media3 already manages the notification and the foreground state. A second one shows twice and fights over the foreground. Change Media3’s notification through its provider.',
          },
        ],
        visual(el) {
          const S = { playing: false, ready: false, app: 'visible', svc: 'none', stopOnSwipe: false };
          const { el: logEl, log } = logger(5);
          const svcTag = tag(''), appTag = tag(''), ctlTag = tag('');
          const shade = h('div', { class: 'md-col' });
          const body = h('div', { class: 'md-col' });
          const sb = h('div', { class: 'md-sb' }, h('span', {}, '9:41'), h('span', {}, ''));
          const ph = h('div', { class: 'md-phone' }, sb, h('div', { class: 'md-pscreen' }, shade, body));
          const notiShown = () => S.ready && (S.svc === 'fg' || S.svc === 'bg');
          function toggleViaSession(from) {
            if (!notiShown()) { replay(ph, 'shake'); log(`${from}: <span class="bad">no active session to receive it</span>`); return; }
            log(`${from} -> MediaSession -> player.${S.playing ? 'pause' : 'play'}()`);
            setPlaying(!S.playing);
          }
          function setPlaying(p) {
            S.playing = p;
            if (p && S.svc !== 'fg') { S.svc = 'fg'; log('Media3: <span class="good">startForeground(mediaPlayback)</span> + notification'); }
            if (!p && S.svc === 'fg') { S.svc = 'bg'; log('Media3: leaves foreground, <span class="muted">notification stays</span>'); }
            paint();
          }
          function paint() {
            setTag(svcTag, { none: 'service: not started', fg: 'service: foreground', bg: 'service: started, not foreground', stopped: 'service: stopped' }[S.svc], { fg: 'ok', bg: 'wait', stopped: 'no' }[S.svc]);
            setTag(appTag, { visible: 'app: visible', background: 'app: in background', removed: 'app: swiped away' }[S.app], S.app === 'visible' ? 'acc' : '');
            const live = S.svc === 'fg' || S.svc === 'bg';
            setTag(ctlTag, S.app === 'visible' && live ? 'controller: connected' : 'controller: none', S.app === 'visible' && live ? 'ok' : '');
            sb.lastChild.textContent = S.playing ? 'audio' : '';
            shade.replaceChildren(...(notiShown() ? [h('div', { class: 'md-noti' },
              h('div', { class: 'md-noti-top' }, h('span', { class: 'md-art' }), h('span', {}, h('b', {}, 'Episode 12'), h('small', {}, S.playing ? 'Playing' : 'Paused'))),
              h('div', { class: 'md-nbtns' }, h('button', { class: 'md-nbtn md-main', onclick: () => toggleViaSession('notification') }, S.playing ? 'Pause' : 'Play')))] : []));
            body.replaceChildren(S.app === 'visible'
              ? h('div', { class: 'md-appui' }, h('div', { class: 'md-cover' + (S.playing ? ' md-run' : '') }), h('b', {}, 'Episode 12'), h('span', { class: 'muted-text' }, S.playing ? 'Playing' : S.ready ? 'Paused' : 'Ready to play'))
              : h('div', { class: 'md-home' }, Array.from({ length: 12 }, () => h('span', { class: 'md-app' }))));
          }
          const needUi = () => { if (S.app === 'visible') return false; replay(ph, 'shake'); log('<span class="bad">the UI is gone:</span> use the notification or the headset'); return true; };
          const connect = () => {
            if (S.svc === 'fg' || S.svc === 'bg') return;
            log('MediaController connects: service onCreate(), onGetSession()');
            S.svc = 'bg'; S.ready = false;
          };
          const root = h('div', { class: 'md-root' },
            h('div', { class: 'md-split' },
              h('div', { class: 'md-col' },
                h('div', { class: 'md-tags' }, appTag, svcTag, ctlTag),
                h('span', { class: 'md-label' }, 'From the app'),
                h('div', { class: 'controls' },
                  cmd('controller.play()', () => { if (needUi()) return; connect(); S.ready = true; if (S.playing) { log('<span class="muted">already playing</span>'); return; } log('controller.play()'); setPlaying(true); }),
                  cmd('controller.pause()', () => { if (needUi()) return; if (!S.playing) { log('<span class="muted">already paused</span>'); return; } log('controller.pause()'); setPlaying(false); })),
                h('span', { class: 'md-label' }, 'From the system'),
                h('div', { class: 'controls' },
                  act('Notification: play/pause', () => toggleViaSession('notification')),
                  act('Headset button', () => toggleViaSession('headset'))),
                h('span', { class: 'md-label' }, 'The user'),
                h('div', { class: 'controls' },
                  act('Press Home', () => {
                    if (S.app !== 'visible') { log('<span class="muted">already in the background</span>'); return; }
                    S.app = 'background';
                    log(S.playing ? 'Home: <span class="good">audio keeps playing</span>, the service is in the foreground' : S.svc === 'bg' ? 'Home: paused service is not foreground, <span class="muted">the system may stop it</span>' : 'Home: nothing is playing');
                    paint();
                  }),
                  act('Swipe away in Recents', () => {
                    if (S.app === 'removed') { log('<span class="muted">already swiped away</span>'); return; }
                    S.app = 'removed';
                    if (S.svc === 'fg' || S.svc === 'bg') {
                      if (S.stopOnSwipe || !S.playing) {
                        log(S.stopOnSwipe ? 'onTaskRemoved: pauseAllPlayersAndStopSelf()' : 'onTaskRemoved (default): not playing, so stop');
                        S.playing = false; S.svc = 'stopped'; S.ready = false;
                        log('onDestroy(): <span class="good">player and session released</span>');
                      } else log('onTaskRemoved (default): <span class="good">still playing, keep going</span>');
                    } else log('task removed, no service running');
                    paint();
                  }),
                  act('Open the app', () => {
                    if (S.app === 'visible') { log('<span class="muted">already open</span>'); return; }
                    S.app = 'visible';
                    log(S.svc === 'fg' || S.svc === 'bg' ? 'new MediaController connects to the <span class="good">same session</span>' : 'app opened, no session yet');
                    paint();
                  })),
                toggle('md-session-swipe', 'Override onTaskRemoved with <code>pauseAllPlayersAndStopSelf()</code>', false, v => { S.stopOnSwipe = v; log(v ? 'swipe away will always stop playback' : 'default: swipe away keeps playing audio alive'); })),
              ph),
            logEl);
          el.append(root);
          paint();
          log('Tap controller.play(), then press Home.');
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'audiofocus',
        title: 'Audio focus and audio attributes',
        tagline: 'Pause for calls, duck for directions, stop when headphones come out.',
        level: 'intermediate',
        body: `
<p>Only one app should be heard at a time. Android coordinates this with audio focus. An app asks for focus before it plays. When another app takes focus, yours should pause, lower its volume (duck) or stop for good, depending on what kind of loss it is.</p>
<p>ExoPlayer does all of this for you. Pass <code>AudioAttributes</code> that describe the sound and <code>handleAudioFocus = true</code> to <code>setAudioAttributes()</code>. It then requests focus on play, pauses for a phone call and resumes after, stays paused when another music app takes over, and ducks for a navigation prompt. With <code>AUDIO_CONTENT_TYPE_SPEECH</code> it pauses instead of ducking, so a podcast never talks under the prompt.</p>
<p>Unplugging headphones sends <code>ACTION_AUDIO_BECOMING_NOISY</code>. Call <code>setHandleAudioBecomingNoisy(true)</code> so the player pauses instead of playing out loud from the speaker. For apps that target Android 15 (API 35) or higher, a focus request only succeeds while the app is the top app or runs a foreground service.</p>`,
        code: `val attributes = AudioAttributes.Builder()          // androidx.media3.common
    .setUsage(C.USAGE_MEDIA)
    .setContentType(C.AUDIO_CONTENT_TYPE_SPEECH)    // a podcast: pause, don't duck
    .build()

val player = ExoPlayer.Builder(context)
    .setAudioAttributes(attributes, /* handleAudioFocus = */ true)
    .setHandleAudioBecomingNoisy(true)
    .build()

player.addListener(object : Player.Listener {
    override fun onPlayWhenReadyChanged(playWhenReady: Boolean, reason: Int) {
        when (reason) {
            Player.PLAY_WHEN_READY_CHANGE_REASON_AUDIO_BECOMING_NOISY -> showMessage("Headphones disconnected")
            Player.PLAY_WHEN_READY_CHANGE_REASON_AUDIO_FOCUS_LOSS -> showMessage("Another app is playing")
        }
    }
    override fun onPlaybackSuppressionReasonChanged(reason: Int) {
        // PLAYBACK_SUPPRESSION_REASON_TRANSIENT_AUDIO_FOCUS_LOSS during a call
    }
})`,
        remember: 'Turn on handleAudioFocus and becoming-noisy handling, and ExoPlayer pauses, ducks and resumes for you.',
        terms: [
          { term: 'Audio focus', def: 'The Android system that decides which app should be heard and tells the others to pause, duck or stop.' },
          { term: 'Ducking', def: 'Lowering your playback volume for a short sound from another app, such as a navigation prompt, then restoring it.' },
          { term: 'AudioAttributes', def: 'A description of a sound’s usage and content type that the system uses for routing, volume and audio focus decisions.' },
          { term: 'Becoming noisy', def: 'The ACTION_AUDIO_BECOMING_NOISY broadcast sent when audio output is about to move to the speaker, for example when headphones are unplugged.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let ExoPlayer handle focus and headphone unplugging.', code: 'val player = ExoPlayer.Builder(context)\n    .setAudioAttributes(attributes, /* handleAudioFocus = */ [[true]])\n    .[[setHandleAudioBecomingNoisy]](true)\n    .build()', why: 'Both are off by default. Turn them on for any player that plays media the user listens to.' },
          { type: 'bug', prompt: 'Another music app starts and both play over each other. Tap the line.', code: 'val attributes = AudioAttributes.Builder()\n    .setUsage(C.USAGE_MEDIA)\n    .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)\n    .build()\nval player = ExoPlayer.Builder(context)\n    .setAudioAttributes(attributes, /* handleAudioFocus = */ false)\n    .setHandleAudioBecomingNoisy(true)\n    .build()', bug: 5, fix: '    .setAudioAttributes(attributes, /* handleAudioFocus = */ true)', why: 'With handleAudioFocus false the player never requests focus, so it is never told to pause.' },
        ],
        quiz: [
          { q: 'A phone call comes in during playback. <code>handleAudioFocus</code> is true. What happens?', options: ['Playback continues quietly', 'It pauses, then resumes when the call ends', 'It pauses and stays paused'], a: 1, why: 'A call is a transient loss. ExoPlayer suppresses playback and resumes on AUDIOFOCUS_GAIN.' },
          { q: 'Another music app starts playing. What does ExoPlayer do?', options: ['Ducks to 20%', 'Pauses and waits for the user to press play', 'Keeps playing'], a: 1, why: 'A permanent loss sets playWhenReady to false. Resuming later would surprise the user.' },
          { q: 'A podcast player uses <code>AUDIO_CONTENT_TYPE_SPEECH</code>. A navigation prompt asks other apps to duck. What does ExoPlayer do?', options: ['Ducks the volume', 'Pauses briefly instead of ducking', 'Ignores it'], a: 1, why: 'Lowered speech under another voice is hard to follow, so ExoPlayer pauses speech instead of ducking it.' },
        ],
        visual(el) {
          const S = { focus: true, noisy: true, type: 'MUSIC', playing: true, vol: 1, other: 0, otherName: '', out: 'headphones', permanent: false };
          let busy = false;
          const mine = h('span', { class: 'md-fill' }), mineL = h('span', { class: 'md-fill-label' });
          const oth = h('span', { class: 'md-fill md-other' }), othL = h('span', { class: 'md-fill-label' });
          const outTag = tag(''), focusTag = tag('');
          const { el: logEl, log } = logger();
          function paint() {
            const v = S.playing ? S.vol : 0;
            mine.style.width = `${v * 100}%`;
            mineL.textContent = S.playing ? `podcast ${Math.round(v * 100)}%` : 'paused';
            oth.style.width = `${S.other * 100}%`;
            othL.textContent = S.other ? S.otherName : 'silent';
            setTag(outTag, S.out === 'headphones' ? 'output: headphones' : 'output: speaker', S.out === 'speaker' ? 'wait' : '');
            setTag(focusTag, S.focus ? (S.permanent ? 'focus: lost' : 'focus: held') : 'focus: never requested', S.focus ? (S.permanent ? 'no' : 'ok') : 'wait');
          }
          async function transient(name, kind, ms) {
            if (busy) return; busy = true;
            S.other = 1; S.otherName = name; S.permanent = false;
            const wasPlaying = S.playing;
            if (!S.playing) log(`${name}: <span class="muted">you were not playing</span>`);
            else if (!S.focus) { log(`${name}: <span class="bad">your app never asked for focus, so it plays right over it</span>`); paint(); replay(mine.parentNode, 'shake'); }
            else if (kind === 'duck' && S.type === 'MUSIC') { S.vol = 0.2; log('AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK: <span class="good">volume 20%</span>'); }
            else { S.playing = false; log(`${kind === 'duck' ? 'CAN_DUCK, but content is SPEECH' : 'AUDIOFOCUS_LOSS_TRANSIENT'}: <span class="good">pause</span>`); }
            paint();
            await sleep(ms);
            S.other = 0;
            if (wasPlaying && S.focus) { S.vol = 1; S.playing = true; log('AUDIOFOCUS_GAIN: <span class="good">back to normal</span>'); }
            paint();
            busy = false;
          }
          let plug;
          const root = h('div', { class: 'md-root' },
            h('div', { class: 'md-tags' }, focusTag, outTag),
            h('div', { class: 'timeline' }, lane('Your app', mineL, mine), lane('Other', othL, oth)),
            h('div', { class: 'controls' },
              cmd('player.play()', () => {
                if (busy) return;
                if (S.playing) { log('<span class="muted">already playing</span>'); return; }
                if (S.focus) { log('requestAudioFocus(): <span class="good">GRANTED</span>'); if (S.permanent) { S.other = 0; log('the other music app loses focus and pauses'); } }
                S.permanent = false; S.playing = true; S.vol = 1; paint();
              }),
              act('Navigation prompt', () => transient('Maps prompt', 'duck', 1800)),
              act('Incoming call', () => transient('Ringtone', 'call', 2400)),
              act('Other music app plays', () => {
                if (busy) return;
                S.other = 1; S.otherName = 'Music app';
                if (S.focus && S.playing) { S.playing = false; S.permanent = true; log('AUDIOFOCUS_LOSS: <span class="good">pause, and stay paused</span>'); }
                else if (S.playing) { log('<span class="bad">no focus handling: both apps play at once</span>'); replay(mine.parentNode, 'shake'); }
                else log('<span class="muted">you were not playing</span>');
                paint();
              }),
              plug = act('Unplug headphones', () => {
                if (busy) return;
                if (S.out === 'speaker') { S.out = 'headphones'; plug.textContent = 'Unplug headphones'; log('headphones plugged in'); paint(); return; }
                S.out = 'speaker'; plug.textContent = 'Plug headphones in';
                if (!S.playing) log('ACTION_AUDIO_BECOMING_NOISY: <span class="muted">nothing playing</span>');
                else if (S.noisy) { S.playing = false; log('ACTION_AUDIO_BECOMING_NOISY: <span class="good">paused</span>'); }
                else { log('<span class="bad">keeps playing out loud from the speaker</span>'); replay(mine.parentNode, 'shake'); }
                paint();
              })),
            h('div', { class: 'controls' },
              toggle('md-focus-handle', 'handleAudioFocus', true, v => { S.focus = v; S.permanent = false; log(`setAudioAttributes(attrs, <span class="t-n">${v}</span>)`); paint(); }),
              toggle('md-focus-noisy', 'setHandleAudioBecomingNoisy', true, v => { S.noisy = v; log(`setHandleAudioBecomingNoisy(<span class="t-n">${v}</span>)`); })),
            choice('content type', ['MUSIC', 'SPEECH'], 'MUSIC', v => { S.type = v; log(`content type: C.AUDIO_CONTENT_TYPE_${v}`); }).el,
            logEl);
          el.append(root);
          paint();
          log('Playing with focus held. Try a navigation prompt with MUSIC, then with SPEECH.');
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'camerax',
        title: 'CameraX basics',
        tagline: 'Pick use cases, bind them to a lifecycle, let CameraX open and close the camera.',
        level: 'intermediate',
        body: `
<p>CameraX wraps Camera2 in use cases. <code>Preview</code> streams frames to the screen. <code>ImageCapture</code> takes photos. <code>ImageAnalysis</code> and <code>VideoCapture</code> are the other two. You build the ones you need and hand them to the provider’s <code>bindToLifecycle()</code> with a <code>CameraSelector</code> such as <code>DEFAULT_BACK_CAMERA</code>.</p>
<p>The lifecycle owner does the hard part. The camera opens when the owner is started and closes when it stops, so pressing Home frees the camera for other apps without any code from you. To switch lenses, call <code>unbindAll()</code> and bind again with the other selector. You still need the <code>CAMERA</code> runtime permission first.</p>
<p>In Compose, use <code>CameraXViewfinder</code> from <code>camera-compose</code>. <code>Preview</code> asks for a surface through its <code>SurfaceProvider</code>. Put the <code>SurfaceRequest</code> it gives you into state, and the viewfinder draws it. Get the provider with <code>awaitInstance(context)</code>, a suspend function on <code>ProcessCameraProvider</code>.</p>`,
        code: `class CameraViewModel : ViewModel() {
    private val _surfaceRequest = MutableStateFlow<SurfaceRequest?>(null)
    val surfaceRequest: StateFlow<SurfaceRequest?> = _surfaceRequest

    private val preview = Preview.Builder().build().apply {
        setSurfaceProvider { request -> _surfaceRequest.value = request }
    }
    val imageCapture = ImageCapture.Builder()
        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
        .build()

    suspend fun bindToCamera(appContext: Context, owner: LifecycleOwner) {
        val provider = ProcessCameraProvider.awaitInstance(appContext)
        provider.unbindAll()
        provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)
        try { awaitCancellation() } finally { provider.unbindAll() }
    }
}

@Composable
fun CameraScreen(viewModel: CameraViewModel = viewModel()) {
    val context = LocalContext.current
    val owner = LocalLifecycleOwner.current
    val request by viewModel.surfaceRequest.collectAsStateWithLifecycle()
    LaunchedEffect(owner) { viewModel.bindToCamera(context.applicationContext, owner) }
    request?.let { CameraXViewfinder(surfaceRequest = it, modifier = Modifier.fillMaxSize()) }
}

// Take a photo into MediaStore
viewModel.imageCapture.takePicture(outputOptions, ContextCompat.getMainExecutor(context),
    object : ImageCapture.OnImageSavedCallback {
        override fun onImageSaved(output: ImageCapture.OutputFileResults) { show(output.savedUri) }
        override fun onError(exception: ImageCaptureException) { showError(exception) }
    })`,
        remember: 'Build use cases, bindToLifecycle, and the lifecycle opens and closes the camera.',
        terms: [
          { term: 'ProcessCameraProvider', def: 'The CameraX singleton that binds use cases to a lifecycle and manages the cameras for the whole process.' },
          { term: 'Use case', def: 'A CameraX building block for one job, such as Preview, ImageCapture, ImageAnalysis or VideoCapture.' },
          { term: 'CameraSelector', def: 'A CameraX filter that picks which camera to use, such as DEFAULT_BACK_CAMERA or DEFAULT_FRONT_CAMERA.' },
          { term: 'CameraXViewfinder', def: 'The camera-compose composable that displays the frames of a Preview use case from its SurfaceRequest.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Bind a preview and photo capture to the back camera.', code: 'val provider = ProcessCameraProvider.awaitInstance(context)\nprovider.unbindAll()\nprovider.[[bindToLifecycle]](\n    lifecycleOwner,\n    CameraSelector.[[DEFAULT_BACK_CAMERA]],\n    preview, imageCapture,\n)', why: 'One call binds every use case you pass to the chosen camera and to the owner’s lifecycle.' },
          { type: 'bug', prompt: 'The flip button switches to the front camera, but binding fails because a use case is still attached to the back camera. Tap the line.', code: 'fun flip(owner: LifecycleOwner) {\n    lens = if (lens == CameraSelector.DEFAULT_BACK_CAMERA)\n        CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA\n    provider.unbind(imageCapture)\n    provider.bindToLifecycle(owner, lens, preview, imageCapture)\n}', bug: 3, fix: '    provider.unbindAll()', why: 'Only ImageCapture was unbound, so Preview is still bound to the back camera. Unbind everything before you bind to another lens.' },
        ],
        quiz: [
          { q: 'The viewfinder is open and the user presses Home. Use cases were bound to the Activity’s lifecycle. What happens to the camera?', options: ['It stays open until you close it', 'CameraX closes it on stop and reopens it on start', 'The app crashes'], a: 1, why: 'Binding to a lifecycle means CameraX follows ON_START and ON_STOP for you.' },
          { q: 'How do the frames from <code>Preview</code> reach <code>CameraXViewfinder</code>?', options: ['Through a Bitmap you post to state', 'Preview’s SurfaceProvider receives a SurfaceRequest, which the viewfinder draws into', 'The viewfinder opens the camera itself'], a: 1, why: 'The SurfaceRequest is the handoff. Keep it in state and pass it to the composable.' },
          { q: 'Which is the right way to switch from the back to the front camera?', options: ['Call bindToLifecycle again with the front selector', '<code>unbindAll()</code>, then bindToLifecycle with the front selector', 'Create a second ProcessCameraProvider'], a: 1, why: 'A use case can only be bound to one camera at a time. Unbind first, then bind to the new lens.' },
        ],
        visual(el) {
          const S = { fg: true, bound: true, lens: 'BACK', cam: 'OPEN', shots: 0 };
          let busy = false;
          const scene = h('div', { class: 'md-scene' });
          const label = h('span', { class: 'md-vf-label' });
          const flash = h('div', { class: 'md-flash' });
          const vf = h('div', { class: 'md-vf' }, scene, label, flash, h('button', { class: 'md-shutter', 'aria-label': 'Take picture', onclick: () => shoot() }));
          const lifeTag = tag(''), camTag = tag(''), ucTag = tag('');
          const thumbs = h('div', { class: 'md-thumbs', 'aria-label': 'Captured photos' });
          const { el: logEl, log } = logger();
          function paint() {
            vf.dataset.lens = S.lens;
            vf.classList.toggle('md-open', S.cam === 'OPEN');
            label.textContent = S.cam === 'OPEN' ? `${S.lens.toLowerCase()} camera` : S.cam === 'OPENING' ? 'opening…' : 'camera closed';
            setTag(lifeTag, S.fg ? 'lifecycle: RESUMED' : 'lifecycle: STOPPED', S.fg ? 'acc' : '');
            setTag(camTag, `camera: ${S.cam}`, { OPEN: 'ok', OPENING: 'wait', CLOSED: 'no' }[S.cam]);
            setTag(ucTag, S.bound ? `bound: Preview, ImageCapture (${S.lens})` : 'bound: nothing', S.bound ? 'acc' : '');
          }
          async function open() {
            if (!S.bound || !S.fg) { S.cam = 'CLOSED'; paint(); return; }
            busy = true; S.cam = 'OPENING'; paint();
            await sleep(450);
            busy = false;
            if (!S.bound || !S.fg) { S.cam = 'CLOSED'; paint(); return; }
            S.cam = 'OPEN'; log('camera <span class="good">OPEN</span>, preview streaming'); paint();
          }
          function shoot() {
            if (busy) return;
            if (!S.bound) { replay(vf, 'shake'); log('onError: <span class="bad">ImageCapture is not bound to a camera</span>'); return; }
            if (S.cam !== 'OPEN') { replay(vf, 'shake'); log('onError: <span class="bad">camera is closed</span>'); return; }
            replay(flash, 'md-go');
            S.shots++;
            thumbs.prepend(h('span', { class: 'md-thumb drop-in' + (S.lens === 'FRONT' ? ' md-front' : '') }));
            while (thumbs.children.length > 6) thumbs.lastElementChild.remove();
            log(`onImageSaved: <span class="good">content://media/…/images/${1000 + S.shots}</span>`);
          }
          const root = h('div', { class: 'md-root' },
            h('div', { class: 'md-split' },
              h('div', { class: 'md-col' },
                h('div', { class: 'md-tags' }, lifeTag, camTag, ucTag),
                h('div', { class: 'controls' },
                  cmd('imageCapture.takePicture(...)', shoot),
                  cmd('unbindAll(); bindToLifecycle(owner, other lens, ...)', async () => {
                    if (busy) return;
                    if (!S.bound) { log('<span class="muted">nothing bound yet: bind first</span>'); return; }
                    S.lens = S.lens === 'BACK' ? 'FRONT' : 'BACK';
                    log(`unbindAll(), bind to DEFAULT_${S.lens}_CAMERA`);
                    S.cam = 'CLOSED'; paint(); await open();
                  }),
                  act('Press Home (ON_STOP)', () => {
                    if (busy || !S.fg) return;
                    S.fg = false; S.cam = 'CLOSED';
                    log(S.bound ? 'ON_STOP: <span class="good">CameraX closes the camera</span>' : 'ON_STOP: nothing bound');
                    paint();
                  }),
                  act('Open app (ON_START)', async () => {
                    if (busy || S.fg) return;
                    S.fg = true;
                    log(S.bound ? 'ON_START: CameraX reopens the camera' : 'ON_START: nothing bound');
                    await open();
                  }),
                  cmd('provider.unbindAll()', () => {
                    if (busy) return;
                    S.bound = false; S.cam = 'CLOSED';
                    log('unbindAll(): use cases detached, <span class="good">camera closed</span>'); paint();
                  }),
                  cmd('provider.bindToLifecycle(owner, DEFAULT_BACK_CAMERA, preview, imageCapture)', async () => {
                    if (busy) return;
                    if (S.bound && S.lens === 'BACK') { log('<span class="muted">already bound: no change</span>'); return; }
                    if (S.bound) { replay(vf, 'shake'); log('<span class="bad">use cases are still bound to the front camera:</span> unbindAll() first'); return; }
                    S.bound = true; S.lens = 'BACK';
                    log(S.fg ? 'bound to the back camera' : 'bound, <span class="muted">camera opens at ON_START</span>');
                    await open();
                  })),
                h('span', { class: 'md-label' }, 'Captured'),
                thumbs),
              vf),
            logEl);
          el.append(root);
          paint();
          log('Bound and open. Tap the shutter, then press Home.');
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'analysis',
        title: 'CameraX ImageAnalysis',
        tagline: 'Thirty frames a second, one slow analyzer. Something has to give.',
        level: 'advanced',
        body: `
<p><code>ImageAnalysis</code> is the use case for reading pixels. It hands each frame to your <code>Analyzer</code> as an <code>ImageProxy</code>, on an executor you choose. Use it for barcode scanning, face detection or your own model. Bind it next to <code>Preview</code> so the viewfinder stays smooth while you analyze.</p>
<p>The camera makes about 30 frames a second. An analyzer that takes 100 ms can’t keep up, and the backpressure strategy decides what happens. <code>STRATEGY_KEEP_ONLY_LATEST</code> is the default. It drops frames and always hands you the newest one, so results stay fresh. <code>STRATEGY_BLOCK_PRODUCER</code> queues frames up to <code>setImageQueueDepth()</code>. Frames come in order, but results fall behind, and once the queue is full the camera stalls.</p>
<p>Call <code>image.close()</code> when you are done, also when processing fails. Until you do, CameraX holds back the next frame. With ML Kit, close the image in the task’s complete listener, or use <code>MlKitAnalyzer</code> from <code>camera-mlkit-vision</code>, which does it for you.</p>`,
        code: `val analysis = ImageAnalysis.Builder()
    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)   // the default
    .build()

val scanner = BarcodeScanning.getClient()
val analysisExecutor = Executors.newSingleThreadExecutor()

@OptIn(ExperimentalGetImage::class)
fun scan(image: ImageProxy) {
    val media = image.image ?: return image.close()
    val input = InputImage.fromMediaImage(media, image.imageInfo.rotationDegrees)
    scanner.process(input)
        .addOnSuccessListener { codes -> onCodes(codes) }
        .addOnCompleteListener { image.close() }    // only now can the next frame arrive
}

analysis.setAnalyzer(analysisExecutor, ::scan)
provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis)`,
        remember: 'KEEP_ONLY_LATEST keeps results fresh. Always close the ImageProxy.',
        terms: [
          { term: 'ImageAnalysis', def: 'The CameraX use case that delivers camera frames to your code for processing instead of to the screen.' },
          { term: 'ImageProxy', def: 'A CameraX wrapper around one camera frame; it must be closed so the buffer can be reused.' },
          { term: 'Backpressure strategy', def: 'The ImageAnalysis setting that decides whether frames are dropped (KEEP_ONLY_LATEST) or queued (BLOCK_PRODUCER) when the analyzer is slow.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Always analyze the newest frame and release each one.', code: 'val analysis = ImageAnalysis.Builder()\n    .setBackpressureStrategy(ImageAnalysis.[[STRATEGY_KEEP_ONLY_LATEST]])\n    .build()\nanalysis.setAnalyzer(executor) { image ->\n    try {\n        detect(image)\n    } finally {\n        image.[[close]]()\n    }\n}', why: '<code>finally</code> makes sure the frame is closed even when <code>detect()</code> throws.' },
          { type: 'bug', prompt: 'The scanner finds one barcode, then never sees another frame. Tap the line.', code: 'analysis.setAnalyzer(executor) { image ->\n    val media = image.image ?: return@setAnalyzer\n    val input = InputImage.fromMediaImage(media, image.imageInfo.rotationDegrees)\n    scanner.process(input)\n        .addOnSuccessListener { codes ->\n            onCodes(codes)\n            image.close()\n        }\n}', bug: 4, fix: '        .addOnCompleteListener { image.close() }', why: 'When the scan fails, the success listener never runs and the frame is never closed. Close it in the complete listener, which runs on success and on failure.' },
        ],
        quiz: [
          { q: 'The analyzer takes 100 ms and the camera runs at 30 fps with <code>KEEP_ONLY_LATEST</code>. What do you get?', options: ['All 30 frames, 3 seconds late', 'About 10 frames a second, each the newest one', 'Nothing, the camera stops'], a: 1, why: 'Frames that arrive while you are busy are dropped. When you finish, you get the latest one.' },
          { q: 'What happens if the analyzer never calls <code>image.close()</code>?', options: ['Nothing, the garbage collector closes it', 'CameraX stops delivering new frames to the analyzer', 'The preview turns black'], a: 1, why: 'The image buffer is not returned, so no new frame can be handed over.' },
          { q: 'When does <code>STRATEGY_BLOCK_PRODUCER</code> make sense?', options: ['A live barcode scanner', 'When you need consecutive frames and can accept growing delay', 'Always, it is faster'], a: 1, why: 'Queued frames keep their order, but every queued frame adds latency. Live UI usually wants KEEP_ONLY_LATEST.' },
        ],
        deeper: [
          {
            title: 'Frames arrive sideways',
            body: `<p>The camera sensor is mounted in landscape. Hold the phone upright and every frame still comes out of the sensor turned on its side. CameraX does not rotate the pixels for you, because that would cost time on every frame. It tells you the angle instead: <code>image.imageInfo.rotationDegrees</code>.</p>
<p>Pass that angle to your detector, as <code>InputImage.fromMediaImage</code> does, or rotate the bitmap yourself. Text and face models look for upright content. Hand them a sideways frame and they often find nothing.</p>`,
            visual(el) {
              const S = { pose: 'portrait', rot: true };
              const DEG = { portrait: 90, landscape: 0, 'reverse landscape': 180 };
              const raw = h('span', { class: 'md-a1-word' }, 'SALE 50%');
              const seen = h('span', { class: 'md-a1-word' }, 'SALE 50%');
              const deg = h('span', { class: 'md-kv' });
              const res = tag('');
              const { el: logEl, log } = logger(3);
              const paint = () => {
                const d = DEG[S.pose];
                raw.style.transform = `rotate(${-d}deg)`;
                seen.style.transform = `rotate(${S.rot ? 0 : -d}deg)`;
                deg.innerHTML = `rotationDegrees <b class="md-yes">${d}</b>`;
                const ok = S.rot || d === 0;
                setTag(res, ok ? 'text: "SALE 50%"' : 'text: none found', ok ? 'ok' : 'no');
              };
              const pose = choice('phone held', Object.keys(DEG), S.pose, v => { S.pose = v; paint(); log(`${v}: the buffer is ${DEG[v] ? `${DEG[v]}° off upright` : 'already upright'}`); });
              const root = h('div', { class: 'md-root' },
                pose.el,
                h('div', { class: 'md-a1-row' },
                  h('div', { class: 'md-col' }, h('span', { class: 'md-label' }, 'ImageProxy buffer'), h('div', { class: 'md-a1-box' }, raw)),
                  h('div', { class: 'md-col' }, h('span', { class: 'md-label' }, 'What the model gets'), h('div', { class: 'md-a1-box' }, seen))),
                h('div', { class: 'md-tags' }, deg, res),
                h('div', { class: 'controls' },
                  toggle('md-a1-rot', 'pass <code>rotationDegrees</code> to the detector', true, v => { S.rot = v; paint(); log(v ? 'InputImage.fromMediaImage(media, rotationDegrees)' : '<span class="bad">rotation ignored:</span> the model gets the raw buffer'); }),
                  cmd('scanner.process(input)', () => { paint(); replay(res, 'pop'); log(res.textContent.includes('none') ? '<span class="bad">empty result</span>: the text was sideways' : '<span class="good">found the text</span>'); })),
                logEl);
              el.append(root);
              paint();
              log('Hold the phone upright. The buffer is still landscape.');
            },
          },
          {
            title: 'Ask for a small analysis resolution',
            body: `<p>Analysis cost grows with the pixel count. A 1080p frame has more than six times the pixels of 640x480, and most detectors don’t need them. Pick the smallest size that still sees your target, with a <code>ResolutionSelector</code>.</p>
<p>Smaller frames mean a faster analyzer, and with KEEP_ONLY_LATEST that means more fresh results per second. Go bigger only when the target is small or far away, such as a tiny barcode.</p>`,
            code: `val analysis = ImageAnalysis.Builder()
    .setResolutionSelector(
        ResolutionSelector.Builder()
            .setResolutionStrategy(
                ResolutionStrategy(Size(1280, 720), ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER)
            )
            .build()
    )
    .build()`,
            visual(el) {
              const R = { '640x480': [0.31, 25, 'low'], '1280x720': [0.92, 60, 'medium'], '1920x1080': [2.07, 130, 'high'] };
              const track = h('div', { class: 'lane-track' });
              const sR = h('b', {}, '0'), sD = h('b', {}, '0');
              const mp = h('span', { class: 'md-kv' });
              const { el: logEl, log } = logger(2);
              const show = r => {
                const [px, cost, detail] = R[r];
                const GAP = 1000 / 30, bars = [];
                for (let t = 0; t < 1000;) { bars.push(t); const end = t + cost; t = Math.ceil(end / GAP) * GAP; }
                track.replaceChildren(...bars.map((t, i) => h('div', { class: 'bar run drop-in', style: `left:${(t / 10).toFixed(2)}%;width:${Math.max(0.6, Math.min(cost, 1000 - t) / 10 - 0.4).toFixed(2)}%;animation-delay:${i * 30}ms` })));
                sR.textContent = String(bars.length); sD.textContent = `${cost} ms`;
                mp.innerHTML = `${px} MP per frame · detail <b>${detail}</b>`;
                log(`${r}: <span class="${cost > 100 ? 'bad' : 'good'}">${bars.length} results a second</span>, each ${cost} ms old when it lands`);
              };
              const pick = choice('target size', Object.keys(R), '1920x1080', v => show(v));
              const root = h('div', { class: 'md-root' },
                pick.el,
                h('div', { class: 'md-tags' }, mp),
                h('div', { class: 'timeline' }, lane('Analyzer, 1 s')),
                h('div', { class: 'md-stats' },
                  h('div', { class: 'md-stat' }, sR, h('small', {}, 'results per second')),
                  h('div', { class: 'md-stat' }, sD, h('small', {}, 'analyzer time per frame'))),
                h('div', { class: 'controls' }, cmd('analysis.setAnalyzer(executor, ::scan)', () => { const cur = root.querySelector('.md-group [aria-pressed="true"]'); show(cur ? cur.textContent : '1920x1080'); })),
                logEl);
              root.querySelector('.timeline .lane-track').replaceWith(track);
              el.append(root);
              show('1920x1080');
            },
          },
          {
            title: 'YUV or RGBA',
            body: `<p>Frames come as <code>YUV_420_888</code> by default: a full-size brightness plane and two smaller color planes. ML Kit reads that format directly, so keep the default for ML Kit.</p>
<p>If your own model wants RGB pixels, ask CameraX for <code>OUTPUT_IMAGE_FORMAT_RGBA_8888</code>. CameraX converts each frame for you, which costs some time, and <code>toBitmap()</code> gives you a Bitmap without hand-written conversion code.</p>`,
            code: `val analysis = ImageAnalysis.Builder()
    .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
    .build()

analysis.setAnalyzer(executor) { image ->
    image.use {                                     // ImageProxy is AutoCloseable
        val bitmap = it.toBitmap()
        val m = Matrix().apply { postRotate(it.imageInfo.rotationDegrees.toFloat()) }
        val upright = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, m, true)
        classifier.run(upright)
    }
}`,
          },
        ],
        underHood: {
          body: `<p>Behind <code>ImageAnalysis</code> sits an <code>ImageReader</code> attached to the camera session as one output surface. It owns a small, fixed pool of image buffers. The camera writes each frame into a free buffer, and CameraX wraps it as an <code>ImageProxy</code> for your analyzer. <code>close()</code> hands the buffer back to the pool.</p>
<p>With KEEP_ONLY_LATEST, CameraX keeps at most one waiting frame and closes older ones itself, so a slow analyzer only ever sees the newest. With BLOCK_PRODUCER, frames wait in order until the queue depth is reached. Either way, a frame you never close is a buffer the camera can never write to again.</p>`,
        },
        mistakes: [
          {
            title: 'Analyzing on the main thread',
            bad: `analysis.setAnalyzer(ContextCompat.getMainExecutor(context)) { image ->
    detect(image)    // 60 ms on the UI thread, every frame
}`,
            good: `val analysisExecutor = Executors.newSingleThreadExecutor()
analysis.setAnalyzer(analysisExecutor) { image ->
    detect(image)
}`,
            why: 'The main executor runs your analyzer between frames of your UI. A slow detector then drops UI frames and can trigger an ANR.',
          },
          {
            title: 'Leaving the analyzer and executor running',
            bad: `DisposableEffect(Unit) {
    analysis.setAnalyzer(executor, ::scan)
    onDispose { }   // analyzer and thread live on
}`,
            good: `DisposableEffect(Unit) {
    analysis.setAnalyzer(executor, ::scan)
    onDispose {
        analysis.clearAnalyzer()
        executor.shutdown()
    }
}`,
            why: 'The analyzer holds references to your screen, and the executor holds a thread. Clear and shut them down when the screen goes away.',
          },
          {
            title: 'Assuming image rows are packed',
            bad: `val plane = image.planes[0]
val bytes = ByteArray(image.width * image.height)
plane.buffer.get(bytes)   // skewed image when rowStride > width`,
            good: `val plane = image.planes[0]
val bytes = ByteArray(image.width * image.height)
for (row in 0 until image.height) {
    plane.buffer.position(row * plane.rowStride)
    plane.buffer.get(bytes, row * image.width, image.width)
}`,
            why: 'Many devices pad each row, so <code>rowStride</code> is larger than the width. Copy row by row. The Y plane’s <code>pixelStride</code> is always 1.',
          },
        ],
        visual(el) {
          const S = { cost: 120, strat: 'KEEP_ONLY_LATEST', close: true };
          const FRAMES = 30, GAP = 1000 / 30, DEPTH = 6;
          const camTrack = h('div', { class: 'lane-track' });
          const anaTrack = h('div', { class: 'lane-track' });
          const cursor = h('div', { class: 'cursor', style: 'left:0' });
          const stat = (label) => { const b = h('b', {}, '0'); const box = h('div', { class: 'md-stat' }, b, h('small', {}, label)); return { box, b }; };
          const sOk = stat('frames analyzed'), sDrop = stat('frames dropped'), sLat = stat('avg delay to result');
          const { el: logEl, log } = logger(3);
          let runId = 0;
          function simulate() {
            const fr = Array.from({ length: FRAMES }, (_, i) => ({ t: i * GAP, fate: 'drop' }));
            const bars = [];
            const start = (f, at) => { f.fate = 'ok'; f.start = at; f.end = at + S.cost; bars.push(f); };
            if (S.strat === 'KEEP_ONLY_LATEST') {
              let free = 0, pending = null;
              const run = (f, at) => { start(f, at); free = S.close ? f.end : Infinity; };
              for (const f of fr) {
                if (pending && free <= f.t) { run(pending, free); pending = null; }
                if (free <= f.t) run(f, f.t);
                else pending = f;
              }
              if (pending && free < 1000) run(pending, free);
            } else {
              let free = 0; const open = [];
              for (const f of fr) {
                const held = open.filter(o => o.closeAt > f.t).length;
                if (held >= DEPTH) { f.fate = 'block'; continue; }
                start(f, Math.max(free, f.t)); free = f.end;
                f.closeAt = S.close ? f.end : Infinity;
                open.push(f);
              }
            }
            return { fr, bars };
          }
          async function run() {
            const my = ++runId;
            const { fr, bars } = simulate();
            camTrack.replaceChildren(cursor); anaTrack.replaceChildren();
            [sOk, sDrop, sLat].forEach(s => { s.b.textContent = '0'; s.box.classList.remove('md-bad'); });
            const ticks = fr.map(f => ({ f, el: h('span', { class: 'md-tick' + (f.fate === 'drop' ? ' md-drop' : f.fate === 'block' ? ' md-block' : ''), style: `left:${(f.t / 10).toFixed(2)}%` }) }));
            const barEls = bars.map(f => {
              const w = Math.max(0.6, (Math.min(f.end, 1000) - f.start) / 10 - 0.4);
              const els = [h('div', { class: 'bar run drop-in', style: `left:${(f.start / 10).toFixed(2)}%;width:${w.toFixed(2)}%` })];
              if (!S.close && f.end < 1000) els.push(h('div', { class: 'bar wait', style: `left:${(f.end / 10).toFixed(2)}%;width:${((1000 - f.end) / 10).toFixed(2)}%` }));
              return { f, els };
            });
            let ti = 0, bi = 0, ok = 0, drop = 0, lat = 0, latN = 0;
            for (let now = 0; now <= 1000; now += 20) {
              if (my !== runId || !root.isConnected) return;
              cursor.style.left = `${now / 10}%`;
              while (ti < ticks.length && ticks[ti].f.t <= now) {
                const { f, el: tk } = ticks[ti++]; camTrack.append(tk);
                if (f.fate !== 'ok') { drop++; sDrop.b.textContent = drop; }
              }
              while (bi < barEls.length && barEls[bi].f.start <= now) { anaTrack.append(...barEls[bi].els); bi++; }
              for (const f of bars) if (!f.counted && f.end <= now) { f.counted = true; ok++; lat += f.end - f.t; latN++; }
              sOk.b.textContent = ok;
              sLat.b.textContent = latN ? `${Math.round(lat / latN)} ms` : '–';
              await sleep(24);
            }
            if (my !== runId) return;
            sDrop.box.classList.toggle('md-bad', drop > FRAMES / 2);
            sLat.box.classList.toggle('md-bad', latN > 0 && lat / latN > 250);
            if (!S.close) log(S.strat === 'KEEP_ONLY_LATEST' ? '<span class="bad">no close():</span> the analyzer got one frame, then nothing' : `<span class="bad">no close():</span> ${DEPTH} frames fill the queue, then the camera stalls`);
            else if (S.strat === 'KEEP_ONLY_LATEST') log(`KEEP_ONLY_LATEST: <span class="good">${ok} fresh results</span>, ${drop} stale frames dropped`);
            else log(`BLOCK_PRODUCER: frames in order, but results arrive <span class="bad">${Math.round(lat / Math.max(1, latN))} ms</span> late on average`);
          }
          const root = h('div', { class: 'md-root' },
            choice('analyzer takes', [20, 50, 120], S.cost, v => { S.cost = v; run(); }, v => `${v} ms`).el,
            choice('strategy', ['KEEP_ONLY_LATEST', 'BLOCK_PRODUCER'], S.strat, v => { S.strat = v; run(); }, v => `STRATEGY_${v}`).el,
            h('div', { class: 'controls' },
              toggle('md-analysis-close', 'call <code>image.close()</code>', true, v => { S.close = v; run(); }),
              cmd('run 1 second', () => run())),
            h('div', { class: 'timeline' }, lane('Camera 30 fps'), lane('Analyzer')),
            h('div', { class: 'legend md-legend' },
              h('span', {}, h('i', { class: 'md-li-ok' }), 'analyzed'),
              h('span', {}, h('i', { class: 'md-li-drop' }), 'dropped'),
              h('span', {}, h('i', { class: 'md-li-block' }), 'camera stalled'),
              h('span', {}, h('i', { class: 'bar wait' }), 'image never closed')),
            h('div', { class: 'md-stats' }, sOk.box, sDrop.box, sLat.box),
            logEl);
          // Put the prepared tracks into the lanes built above.
          const lanes = root.querySelectorAll('.timeline .lane-track');
          lanes[0].replaceWith(camTrack); lanes[1].replaceWith(anaTrack);
          el.append(root);
          run();
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'sensors',
        title: 'Sensors',
        tagline: 'Register when the screen shows, unregister when it goes. Sample as slowly as you can.',
        level: 'intermediate',
        body: `
<p><code>SensorManager</code> gives you the hardware sensors: accelerometer, gyroscope, light, proximity and more. <code>getDefaultSensor()</code> with <code>TYPE_ACCELEROMETER</code> returns the sensor, or null if the device has none. Register a <code>SensorEventListener</code> and readings arrive in <code>onSensorChanged()</code>. The accelerometer reports x, y and z in m/s² with gravity included, so a phone lying flat reads about 9.81 on z.</p>
<p>A registered listener keeps the sensor powered, even after your screen is gone. Unregister when the UI stops. Wrap the listener in a <code>callbackFlow</code> with <code>awaitClose { unregisterListener(...) }</code> and collect it with <code>collectAsStateWithLifecycle()</code>. Leaving the screen, or the app going to the background, then unregisters for you.</p>
<p>The sampling period is a hint. <code>SENSOR_DELAY_NORMAL</code> is about 200 ms, <code>UI</code> about 60 ms, <code>GAME</code> 20 ms and <code>FASTEST</code> as fast as the hardware allows. Pick the slowest one that looks right. Since Android 12, rates above 200 Hz need the <code>HIGH_SAMPLING_RATE_SENSORS</code> permission.</p>`,
        code: `fun SensorManager.accelerometer(): Flow<FloatArray> = callbackFlow {
    val sensor = getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    if (sensor == null) { close(); return@callbackFlow }
    val listener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            trySend(event.values.copyOf())   // the event object is reused
        }
        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) = Unit
    }
    registerListener(listener, sensor, SensorManager.SENSOR_DELAY_UI)
    awaitClose { unregisterListener(listener) }   // runs when collection stops
}

@Composable
fun TiltBall() {
    val context = LocalContext.current
    val sensors = remember { context.getSystemService<SensorManager>()!! }
    val values by remember { sensors.accelerometer() }
        .collectAsStateWithLifecycle(initialValue = floatArrayOf(0f, 0f, 9.81f))
    val (x, y, _) = values
    Ball(offsetX = -x, offsetY = y)   // the ball rolls toward the lower edge
}`,
        remember: 'Unregister when the UI stops, and pick the slowest rate that looks right.',
        terms: [
          { term: 'SensorManager', def: 'The system service that lists device sensors and registers listeners for their readings.' },
          { term: 'Sampling period', def: 'The requested delay between sensor events, such as SENSOR_DELAY_UI; the system treats it as a hint.' },
          { term: 'Accelerometer', def: 'A sensor that reports acceleration along the device’s x, y and z axes in m/s², including gravity.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Register at a UI-friendly rate and unregister when collection stops.', code: 'registerListener(listener, sensor, SensorManager.[[SENSOR_DELAY_UI|SENSOR_DELAY_GAME|SENSOR_DELAY_NORMAL]])\n[[awaitClose]] { unregisterListener(listener) }', why: '<code>awaitClose</code> keeps the flow open and runs its block when the collector goes away.' },
          { type: 'bug', prompt: 'After leaving the tilt screen, the accelerometer keeps firing and the battery drains. Tap the line.', code: 'DisposableEffect(sensors) {\n    val listener = TiltListener { x, y -> ball = Offset(-x, y) }\n    sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)?.let {\n        sensors.registerListener(listener, it, SensorManager.SENSOR_DELAY_GAME)\n    }\n    onDispose { }\n}', bug: 5, fix: '    onDispose { sensors.unregisterListener(listener) }', why: 'Nothing unregisters the listener, so the sensor stays on after the composable leaves.' },
        ],
        quiz: [
          { q: 'A phone lies flat on a table, screen up. What does the accelerometer read?', options: ['x 0, y 0, z 0', 'x 0, y 0, z about 9.81', 'x 9.81, y 0, z 0'], a: 1, why: 'The accelerometer includes gravity, and z points out of the screen.' },
          { q: 'You navigate from the tilt screen to another screen. The listener was registered with no unregister. What happens?', options: ['Events stop on their own', 'Events keep coming and the sensor keeps drawing power', 'The app crashes'], a: 1, why: 'A registered listener keeps the sensor running. Unregister when the UI leaves.' },
          { q: 'Your app targets Android 12 and asks for <code>SENSOR_DELAY_FASTEST</code> without <code>HIGH_SAMPLING_RATE_SENSORS</code>.', options: ['It throws SecurityException', 'The rate is capped at 200 Hz', 'It falls back to NORMAL'], a: 1, why: 'Without the permission, listeners registered with SensorManager are limited to 200 Hz.' },
        ],
        visual(el) {
          const RATES = { NORMAL: 200, UI: 60, GAME: 20, FASTEST: 5 };
          const POWER = { NORMAL: 0.12, UI: 0.3, GAME: 0.6, FASTEST: 1 };
          const S = { rate: 'UI', screen: 'tilt', cleanup: true, tx: 0, ty: 0 };
          const G = 9.81;
          const stamps = [];
          const ball = h('span', { class: 'md-ball' });
          const pad = h('div', { class: 'md-pad', 'aria-label': 'Drag to tilt the phone' }, ball);
          const vx = h('span', { class: 'md-kv' }), vy = h('span', { class: 'md-kv' }), vz = h('span', { class: 'md-kv' });
          const rateEl = h('span', { class: 'md-kv' });
          const regTag = tag('');
          const pow = h('span', { class: 'md-fill' }), powL = h('span', { class: 'md-fill-label' });
          const screenBody = h('div', { class: 'md-col' });
          const ph = h('div', { class: 'md-phone' }, h('div', { class: 'md-sb' }, h('span', {}, '9:41'), h('span', {}, 'sensors')), h('div', { class: 'md-pscreen' }, screenBody));
          const { el: logEl, log } = logger(3);
          const active = () => S.screen === 'tilt' || !S.cleanup;
          let warned = false;
          function paintScreen() {
            screenBody.replaceChildren(S.screen === 'tilt'
              ? h('div', { class: 'md-col' }, h('span', { class: 'md-label' }, 'Tilt screen'), pad, h('div', { class: 'md-xyz' }, vx, vy, vz))
              : h('div', { class: 'md-col' }, h('span', { class: 'md-label' }, 'Settings screen'), ...['Notifications', 'Account', 'About'].map(t => h('div', { class: 'md-noti' }, t))));
            setTag(regTag, active() ? (S.screen === 'tilt' ? 'listener: registered' : 'listener: still registered') : 'listener: unregistered', active() ? (S.screen === 'tilt' ? 'ok' : 'no') : '');
            ph.style.transform = S.screen === 'tilt' ? `perspective(700px) rotateY(${(S.tx * 25).toFixed(1)}deg) rotateX(${(-S.ty * 25).toFixed(1)}deg)` : '';
          }
          function sample() {
            const ax = -G * Math.sin(S.tx), ay = -G * Math.sin(S.ty), az = G * Math.cos(S.tx) * Math.cos(S.ty);
            stamps.push(performance.now());
            vx.textContent = `x ${ax.toFixed(2)}`; vy.textContent = `y ${ay.toFixed(2)}`; vz.textContent = `z ${az.toFixed(2)}`;
            if (S.screen === 'tilt') ball.style.transform = `translate(${(-ax * 6.5).toFixed(1)}px, ${(ay * 6.5).toFixed(1)}px)`;
            else if (!warned) { warned = true; log('<span class="bad">onSensorChanged still firing</span> on the Settings screen'); }
          }
          function meter() {
            const now = performance.now();
            while (stamps.length && now - stamps[0] > 1000) stamps.shift();
            rateEl.textContent = `${stamps.length} events/s`;
            rateEl.classList.toggle('md-leak', S.screen !== 'tilt' && stamps.length > 0);
            const p = active() ? POWER[S.rate] : 0;
            pow.style.width = `${p * 100}%`;
            powL.textContent = p ? `sensor power ${Math.round(p * 100)}%` : 'sensor off';
          }
          // The fake sensor: fires at the chosen rate while registered.
          let seen = false;
          function loop() {
            if (!root.isConnected) { if (seen) return; } else seen = true;
            if (active()) sample();
            setTimeout(loop, RATES[S.rate]);
          }
          function tiltTo(tx, ty) { S.tx = Math.max(-0.7, Math.min(0.7, tx)); S.ty = Math.max(-0.7, Math.min(0.7, ty)); paintScreen(); }
          let dragging = false;
          const fromPointer = e => {
            const r = pad.getBoundingClientRect();
            const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
            tiltTo(nx * 0.7, -ny * 0.7);
          };
          pad.addEventListener('pointerdown', e => { dragging = true; pad.setPointerCapture(e.pointerId); fromPointer(e); });
          pad.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
          pad.addEventListener('pointerup', () => { dragging = false; });
          pad.addEventListener('pointercancel', () => { dragging = false; });
          const root = h('div', { class: 'md-root' },
            h('div', { class: 'md-split' },
              h('div', { class: 'md-col' },
                h('div', { class: 'md-tags' }, regTag, rateEl),
                h('div', { class: 'controls' },
                  act('Tilt left', () => tiltTo(-0.55, 0)),
                  act('Tilt right', () => tiltTo(0.55, 0)),
                  act('Tilt away', () => tiltTo(0, 0.55)),
                  act('Lay flat', () => tiltTo(0, 0))),
                choice('rate', Object.keys(RATES), S.rate, v => { S.rate = v; log(`registerListener(..., SENSOR_DELAY_${v})  <span class="muted">// ${v === 'FASTEST' ? 'capped at 200 Hz' : '~' + RATES[v] + ' ms'}</span>`); meter(); }, v => `SENSOR_DELAY_${v}`).el,
                choice('cleanup', ['awaitClose', 'none'], 'awaitClose', v => { S.cleanup = v === 'awaitClose'; warned = false; log(S.cleanup ? 'awaitClose { unregisterListener(listener) }' : '<span class="bad">onDispose { }</span>: nothing unregisters'); paintScreen(); }, v => (v === 'none' ? 'no unregister' : 'awaitClose unregisters')).el,
                h('div', { class: 'controls' },
                  cmd('navController.navigate("settings")', () => {
                    if (S.screen !== 'tilt') { log('<span class="muted">already on Settings</span>'); return; }
                    S.screen = 'settings'; warned = false;
                    log(S.cleanup ? 'collection stops: <span class="good">unregisterListener()</span>' : 'left the tilt screen, <span class="bad">listener still registered</span>');
                    paintScreen();
                  }),
                  cmd('navController.popBackStack()', () => {
                    if (S.screen === 'tilt') { log('<span class="muted">already on the tilt screen</span>'); return; }
                    S.screen = 'tilt'; log(S.cleanup ? 'collection starts: registerListener()' : 'back on the tilt screen');
                    paintScreen();
                  })),
                h('div', { class: 'timeline' }, lane('Battery', powL, pow))),
              ph),
            logEl,
            h('p', { class: 'tip' }, 'Drag inside the pad to tilt. At SENSOR_DELAY_NORMAL the ball steps five times a second.'));
          el.append(root);
          paintScreen(); meter();
          log('Registered at SENSOR_DELAY_UI. Drag the pad or tap a tilt button.');
          loop();
          every(root, 250, meter);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'location',
        title: 'Location',
        tagline: 'Ask for the accuracy you need, as often as you need it, only while you need it.',
        level: 'advanced',
        body: `
<p>Use <code>FusedLocationProviderClient</code> from Google Play services. It combines GPS, Wi-Fi, cell and motion sensors to give a good fix for the least power. <code>getCurrentLocation()</code> asks for one fresh fix. <code>requestLocationUpdates()</code> with a <code>LocationRequest</code> gives a stream. Call <code>removeLocationUpdates()</code> when you are done.</p>
<p>The request sets the trade-off. <code>PRIORITY_HIGH_ACCURACY</code> uses GPS and costs the most. <code>PRIORITY_BALANCED_POWER_ACCURACY</code> is about city-block accuracy, <code>PRIORITY_LOW_POWER</code> about city level, and <code>PRIORITY_PASSIVE</code> only receives fixes other apps asked for. The interval says how often you want updates, and <code>setMinUpdateIntervalMillis()</code> caps how fast they may come.</p>
<p>Permissions come in layers. <code>ACCESS_COARSE_LOCATION</code> gives an approximate location. Since Android 12 you request it together with <code>ACCESS_FINE_LOCATION</code>, and the user may still choose approximate. Both only work while your app is visible or runs a foreground service of type <code>location</code>. Background access, which geofences need, requires <code>ACCESS_BACKGROUND_LOCATION</code>. Ask for it separately and later; the user grants it in Settings.</p>`,
        code: `val client = LocationServices.getFusedLocationProviderClient(context)

val request = LocationRequest.Builder(Priority.PRIORITY_BALANCED_POWER_ACCURACY, 10_000L)
    .setMinUpdateIntervalMillis(5_000L)
    .setMinUpdateDistanceMeters(25f)
    .build()

val callback = object : LocationCallback() {
    override fun onLocationResult(result: LocationResult) {
        result.lastLocation?.let { show(it.latitude, it.longitude, it.accuracy) }
    }
}

// After ACCESS_COARSE_LOCATION or ACCESS_FINE_LOCATION is granted:
client.requestLocationUpdates(request, callback, Looper.getMainLooper())
// When the screen stops:
client.removeLocationUpdates(callback)

// Geofence: needs ACCESS_FINE_LOCATION and ACCESS_BACKGROUND_LOCATION
val fence = Geofence.Builder()
    .setRequestId("office")
    .setCircularRegion(41.0082, 28.9784, 150f)
    .setExpirationDuration(Geofence.NEVER_EXPIRE)
    .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
    .build()
LocationServices.getGeofencingClient(context).addGeofences(
    GeofencingRequest.Builder().addGeofence(fence).build(),
    geofencePendingIntent,   // FLAG_MUTABLE, targets a BroadcastReceiver
)`,
        remember: 'Lowest priority that works, longest interval that works, foreground unless you truly need background.',
        terms: [
          { term: 'Fused location provider', def: 'The Google Play services location API that combines GPS, Wi-Fi, cell and sensors to balance accuracy and battery.' },
          { term: 'Approximate location', def: 'A location fix granted by ACCESS_COARSE_LOCATION, deliberately blurred to an area of a few square kilometers.' },
          { term: 'Background location', def: 'Location access while the app is not visible and runs no location foreground service; it needs ACCESS_BACKGROUND_LOCATION.' },
          { term: 'Geofence', def: 'A circular region the system watches for you, sending an enter or exit event to a PendingIntent when the device crosses it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask for GPS-quality fixes every second, and stop them when you are done.', code: 'val request = LocationRequest.Builder(Priority.[[PRIORITY_HIGH_ACCURACY]], 1_000L).build()\nclient.requestLocationUpdates(request, callback, Looper.getMainLooper())\n// later\nclient.[[removeLocationUpdates]](callback)', why: 'High accuracy uses GPS. Removing the callback is what lets the GPS turn off again.' },
          { type: 'bug', prompt: 'On Android 11 and later the location dialog never offers “Allow all the time”, and the request fails. Tap the line.', code: 'launcher.launch(\n    arrayOf(\n        Manifest.permission.ACCESS_FINE_LOCATION,\n        Manifest.permission.ACCESS_COARSE_LOCATION,\n        Manifest.permission.ACCESS_BACKGROUND_LOCATION,\n    )\n)', bug: 4, fix: '        // remove: ask for background location later, in its own request', why: 'Background location must be requested on its own, after foreground access is granted. Asking for it together with foreground permissions gets the whole request ignored.' },
        ],
        quiz: [
          { q: 'You request FINE and COARSE together on Android 12. The user picks “Approximate”. What do you get?', options: ['Precise location anyway', 'Only ACCESS_COARSE_LOCATION, so fixes are approximate', 'Nothing, the request fails'], a: 1, why: 'The user decides the accuracy. Build features that still work with approximate location.' },
          { q: 'Your app has while-in-use permission only, no foreground service, and the user presses Home. What happens to <code>requestLocationUpdates</code>?', options: ['Updates continue as before', 'The app stops receiving updates while in the background', 'Updates switch to PASSIVE'], a: 1, why: 'While-in-use access ends when the app is no longer visible, unless a foreground service of type location is running.' },
          { q: '<code>addGeofences()</code> fails with <code>GEOFENCE_<wbr>INSUFFICIENT_<wbr>LOCATION_<wbr>PERMISSION</code>. Fine location is granted. What is missing?', options: ['ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION', 'POST_NOTIFICATIONS'], a: 1, why: 'Geofences fire while the app is not running, so they need background location access.' },
        ],
        visual(el) {
          const PRI = {
            HIGH_ACCURACY: { every: 1, acc: 3, m: '±5 m', power: 1 },
            BALANCED_POWER_ACCURACY: { every: 4, acc: 9, m: '±100 m', power: 0.35 },
            LOW_POWER: { every: 10, acc: 18, m: '±3 km', power: 0.12 },
            PASSIVE: { every: 0, acc: 9, m: 'whatever others got', power: 0.02 },
          };
          const FENCE = { x: 86, y: 50, d: 22 };
          const S = { pri: 'BALANCED_POWER_ACCURACY', precise: true, app: 'visible', bg: false, fence: false, inside: false, t: 0, n: 0, quiet: '' };
          const pos = () => { const a = (S.t / 40) * Math.PI * 2; return { x: 50 + 36 * Math.cos(a), y: 50 + 32 * Math.sin(a) }; };
          const map = h('div', { class: 'md-map', 'aria-label': 'Map with your position and reported fixes' });
          map.innerHTML = '<svg class="md-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="50" rx="36" ry="32" vector-effect="non-scaling-stroke"/></svg>';
          const circ = (cls, x, y, d) => h('div', { class: 'md-circ ' + cls, style: `left:${x}%;top:${y}%;width:${d}%;margin-left:${-d / 2}%;margin-top:${-d / 2}%` }, h('span', { class: 'md-c' }));
          const fence = circ('md-fence md-off', FENCE.x, FENCE.y, FENCE.d);
          fence.append(h('span', { class: 'md-fence-name' }, 'office'));
          const you = h('span', { class: 'md-you' });
          map.append(fence, you, h('span', { class: 'md-scale' }, 'not to scale'));
          const fixes = [];
          const appTag = tag(''), permTag = tag(''), accTag = tag('');
          const pow = h('span', { class: 'md-fill' }), powL = h('span', { class: 'md-fill-label' });
          const { el: logEl, log } = logger();
          const delivering = () => S.app === 'visible' || S.app === 'fgs';
          function paint() {
            const p = pos();
            you.style.left = `${p.x}%`; you.style.top = `${p.y}%`;
            setTag(appTag, { visible: 'app: visible', bg: 'app: background', fgs: 'app: background + FGS(location)' }[S.app], delivering() ? 'ok' : 'no');
            setTag(permTag, `${S.precise ? 'precise' : 'approximate'}${S.bg ? ' + all the time' : ', while in use'}`, S.precise ? 'acc' : 'wait');
            const pr = PRI[S.pri];
            setTag(accTag, S.precise ? pr.m : '±1–3 km (approximate)', '');
            const pw = delivering() ? pr.power : 0;
            pow.style.width = `${pw * 100}%`;
            powL.textContent = pw ? `location power ${Math.round(pw * 100)}%` : 'no location work';
            fence.classList.toggle('md-off', !S.fence);
            fence.classList.toggle('md-in', S.fence && S.inside);
          }
          function addFix() {
            const p = pos(), pr = PRI[S.pri];
            let x = p.x, y = p.y, d = pr.acc;
            if (!S.precise) { x = Math.round(p.x / 25) * 25 + 6; y = Math.round(p.y / 33) * 33 + 8; d = 30; }
            else { x += (Math.random() - 0.5) * d * 0.5; y += (Math.random() - 0.5) * d * 0.5; }
            fixes.forEach(f => f.classList.add('md-old'));
            const f = circ('md-fix' + (S.precise ? '' : ' md-coarse'), x.toFixed(1), y.toFixed(1), d);
            map.insertBefore(f, you); fixes.push(f);
            while (fixes.length > 4) fixes.shift().remove();
          }
          function tick() {
            S.t = (S.t + 1) % 40; S.n++;
            const pr = PRI[S.pri];
            if (delivering()) {
              S.quiet = '';
              const due = pr.every ? S.n % pr.every === 0 : Math.random() < 0.08;
              if (due) addFix();
            } else {
              const why = S.bg ? 'background: throttled to a few fixes per hour' : 'background with while-in-use only: no updates';
              if (S.quiet !== why) { S.quiet = why; log(`<span class="bad">${why}</span>`); }
            }
            if (S.fence) {
              const p = pos();
              const dx = p.x - FENCE.x, dy = (p.y - FENCE.y) * 0.625; // map is 16:10
              const inside = Math.hypot(dx, dy) < FENCE.d / 2;
              if (inside !== S.inside) { S.inside = inside; log(`GEOFENCE_TRANSITION_${inside ? 'ENTER' : 'EXIT'} <span class="good">-> your BroadcastReceiver</span>${delivering() ? '' : ' <span class="muted">(app not running)</span>'}`); }
            }
            paint();
          }
          const root = h('div', { class: 'md-root' },
            h('div', { class: 'md-tags' }, appTag, permTag, accTag),
            map,
            h('div', { class: 'timeline' }, lane('Battery', powL, pow)),
            choice('priority', Object.keys(PRI), S.pri, v => {
              S.pri = v; const pr = PRI[v];
              log(`LocationRequest.Builder(PRIORITY_${v}${pr.every ? `, ${pr.every * 1000}L` : ''})`);
              paint();
            }, v => `PRIORITY_${v}`).el,
            choice('user granted', ['precise', 'approximate'], 'precise', v => {
              S.precise = v === 'precise';
              log(S.precise ? 'ACCESS_FINE_LOCATION granted' : 'user picked <span class="t-s">Approximate</span>: COARSE only');
              if (!S.precise && S.fence) { S.fence = false; S.inside = false; log('<span class="bad">geofences removed:</span> they need precise location'); }
              paint();
            }).el,
            choice('app is', ['visible', 'bg', 'fgs'], 'visible', v => {
              S.app = v;
              if (v === 'visible') log('app visible: updates flow');
              if (v === 'fgs') log('foreground service, type <span class="t-s">location</span>, started while visible: <span class="good">updates keep flowing</span>');
              paint();
            }, v => ({ visible: 'visible', bg: 'in background', fgs: 'background + location FGS' }[v])).el,
            h('div', { class: 'controls' },
              toggle('md-loc-bg', 'ACCESS_BACKGROUND_LOCATION (“Allow all the time”)', false, v => {
                S.bg = v; S.quiet = '';
                log(v ? 'user chose “Allow all the time” in Settings' : 'background access revoked');
                if (!v && S.fence) { S.fence = false; S.inside = false; log('<span class="bad">geofences removed</span>'); }
                paint();
              }),
              cmd('geofencingClient.addGeofences(request, pendingIntent)', () => {
                if (S.fence) { log('<span class="muted">geofence "office" already added</span>'); return; }
                if (!S.precise || !S.bg) { replay(map, 'shake'); log(`onFailure: <span class="bad">GEOFENCE_INSUFFICIENT_LOCATION_PERMISSION</span> <span class="muted">// needs ${!S.precise ? 'FINE' : ''}${!S.precise && !S.bg ? ' + ' : ''}${!S.bg ? 'BACKGROUND' : ''}</span>`); return; }
                S.fence = true; S.inside = false; replay(fence, 'pop');
                log('geofence "office" added: <span class="good">the system watches it for you</span>');
                paint();
              })),
            logEl);
          el.append(root);
          paint();
          log('requestLocationUpdates(PRIORITY_BALANCED_POWER_ACCURACY, 10 s)');
          every(root, 250, tick);
        },
      },
    ],
  });
})();
