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
/* depth pass 2 */
.md-d2-list { display: grid; gap: 6px; min-width: 0; }
.md-d2-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s; }
.md-d2-item > .md-prog { grid-column: 1 / -1; }
.md-d2-item b { font: 600 0.84rem var(--mono); overflow-wrap: anywhere; min-width: 0; }
.md-d2-item.md-d2-cur { border-color: var(--accent); background: var(--accent-soft); }
.md-d2-vf { cursor: crosshair; }
.md-d2-vf:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.md-d2-vf .md-scene { transition: transform 0.35s ease, opacity 0.35s; }
.md-d2-vf .md-vf-label { position: absolute; left: 10px; top: 10px; }
.md-d2-ring { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.85); opacity: 0; pointer-events: none; z-index: 2; transition: opacity 0.3s, border-color 0.3s; }
.md-d2-ring.md-d2-seek { opacity: 1; animation: md-d2-seek 0.35s ease-in-out infinite alternate; }
.md-d2-ring.md-d2-lock { opacity: 1; border-color: var(--hi); transform: scale(0.8); }
@keyframes md-d2-seek { from { transform: scale(1.2); } to { transform: scale(0.85); } }
input#md-d2-zoom { flex: 1 1 140px; min-width: 0; accent-color: var(--accent); }
.md-d2-rot { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; justify-content: center; padding: 14px; border-radius: 12px; background: var(--bg); border: 1px dashed var(--line); min-width: 0; }
.md-d2-rot > .md-col { justify-items: center; min-height: 150px; align-content: start; }
.md-d2-hand { width: 64px; height: 108px; margin: 20px; border-radius: 12px; border: 5px solid var(--code-bg); background: var(--code-bg); display: grid; place-items: center; transition: transform 0.45s ease; }
.md-d2-sky { display: inline-block; font: 700 0.74rem var(--mono); color: var(--t-s); white-space: nowrap; transition: transform 0.45s ease; }
.md-d2-thumb { width: 40px; height: 40px; border-radius: 8px; background: var(--code-bg); display: grid; place-items: center; }
.md-d2-thumb .md-d2-sky { font-size: 1rem; transition: none; }
.md-d2-spark { position: absolute; inset: 0; width: 100%; height: 100%; }
.md-d2-spark polyline { fill: none; stroke: var(--accent); stroke-width: 2; vector-effect: non-scaling-stroke; }
.md-d2-spark polyline.md-d2-grav { stroke: var(--ok); }
.md-d2-spark polyline.md-d2-lin { stroke: var(--warm); }
.md-d2-dense { position: absolute; left: 0; top: 6px; bottom: 6px; background: repeating-linear-gradient(90deg, var(--accent) 0 1px, transparent 1px 4px); }
.md-d2-dense.md-d2-hot { background: repeating-linear-gradient(90deg, var(--err) 0 1px, transparent 1px 4px); }
/* promoted: video capture */
.md-vc-cmds .cmd { white-space: normal; text-align: left; overflow-wrap: anywhere; }
.md-vc-rec { position: absolute; top: 10px; left: 10px; z-index: 2; font: 700 0.74rem var(--mono); color: #fff; padding: 3px 8px; border-radius: 999px; background: rgba(0, 0, 0, 0.5); font-variant-numeric: tabular-nums; }
.md-vc-rec:empty { display: none; }
.md-vc-rec.md-vc-on { background: rgba(200, 30, 50, 0.85); }
`;

  // ─── Promoted from camerax: recording video ───────────────────────────
  const videoCaptureLesson = {
    id: 'video-capture',
    title: 'Recording video with CameraX',
    tagline: 'VideoCapture, a Recorder, and a stream of events that ends in Finalize.',
    level: 'intermediate',
    body: `
<p>Video is the fourth CameraX use case. <code>VideoCapture</code> wraps a <code>Recorder</code>, which encodes and writes the file. Ask for a quality with a <code>QualitySelector</code> and a fallback, because devices differ in what they can record. Then bind it like the other use cases, usually next to <code>Preview</code>.</p>
<p>A recording has three steps. <code>prepareRecording()</code> picks the output, such as MediaStore, and returns a <code>PendingRecording</code> that records nothing yet. <code>start()</code> returns an active <code>Recording</code> that you can pause, resume and stop. Along the way your listener receives <code>VideoRecordEvent</code>s: <code>Start</code>, a <code>Status</code> with the duration and size so far, and finally <code>Finalize</code>, which tells you the file is done, or why it stopped.</p>
<p>Sound needs the <code>RECORD_AUDIO</code> runtime permission before you call <code>withAudioEnabled()</code>. Saving to MediaStore needs no storage permission on Android 10 and higher. A Recorder handles one recording at a time.</p>`,
    code: `val recorder = Recorder.Builder()
    .setQualitySelector(
        QualitySelector.from(Quality.FHD, FallbackStrategy.lowerQualityOrHigherThan(Quality.FHD))
    )
    .build()
val videoCapture = VideoCapture.withOutput(recorder)
provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, videoCapture)

val output = MediaStoreOutputOptions.Builder(context.contentResolver, MediaStore.Video.Media.EXTERNAL_CONTENT_URI)
    .setContentValues(contentValuesOf(MediaStore.Video.Media.DISPLAY_NAME to "klip-\${System.currentTimeMillis()}"))
    .build()

var recording: Recording? = videoCapture.output
    .prepareRecording(context, output)
    .withAudioEnabled()                                   // only after RECORD_AUDIO is granted
    .start(ContextCompat.getMainExecutor(context)) { event ->
        when (event) {
            is VideoRecordEvent.Start -> showRecDot()
            is VideoRecordEvent.Status -> showTime(event.recordingStats.recordedDurationNanos)
            is VideoRecordEvent.Finalize ->
                if (event.hasError()) showError(event.error)
                else showSaved(event.outputResults.outputUri)
        }
    }

// later
recording?.stop()
recording = null`,
    remember: 'prepareRecording, start, and wait for Finalize. Check hasError() there before you tell the user the video is saved.',
    deeper: [
      {
        title: 'Quality, fallback and use case combinations',
        body: `<p>Not every camera records 4K. <code>QualitySelector.fromOrderedList()</code> takes your preferences in order, and a <code>FallbackStrategy</code> says what to do when none of them fit. The result is chosen when you bind.</p>
<p>The qualities listed by <code>getSupportedQualities()</code> are only guaranteed for <code>VideoCapture</code> alone or with <code>Preview</code>. Add <code>ImageCapture</code> or <code>ImageAnalysis</code> on top and binding can fail on some devices, so catch the exception from <code>bindToLifecycle()</code> and offer fewer features.</p>`,
        code: `val selector = QualitySelector.fromOrderedList(
    listOf(Quality.UHD, Quality.FHD, Quality.HD, Quality.SD),
    FallbackStrategy.lowerQualityOrHigherThan(Quality.SD),
)

try {
    provider.bindToLifecycle(owner, lens, preview, videoCapture, imageCapture)
} catch (e: IllegalArgumentException) {
    provider.bindToLifecycle(owner, lens, preview, videoCapture)   // no photos while filming
}`,
      },
      {
        title: 'A Finalize error does not always mean no file',
        body: `<p>Some errors still leave a usable video. With a size or duration limit, the data recorded before the limit is saved and Finalize reports <code>ERROR_FILE_SIZE_LIMIT_REACHED</code> or <code>ERROR_DURATION_LIMIT_REACHED</code>. If the camera closes mid-recording, you get <code>ERROR_SOURCE_INACTIVE</code> and a file with the frames up to that point. With <code>ERROR_NO_VALID_DATA</code> the file is not valid and you should delete it.</p>
<p>So read the error code instead of treating every error the same.</p>`,
        code: `val output = FileOutputOptions.Builder(file)
    .setFileSizeLimit(50L * 1024 * 1024)          // 50 MB
    .build()

is VideoRecordEvent.Finalize -> when (event.error) {
    VideoRecordEvent.Finalize.ERROR_NONE,
    VideoRecordEvent.Finalize.ERROR_FILE_SIZE_LIMIT_REACHED,
    VideoRecordEvent.Finalize.ERROR_SOURCE_INACTIVE -> showSaved(event.outputResults.outputUri)
    VideoRecordEvent.Finalize.ERROR_NO_VALID_DATA -> file.delete()
    else -> showError(event.error)
}`,
      },
      {
        title: 'Keep recording across a lens switch',
        body: `<p>Normally a recording stops when its <code>VideoCapture</code> is unbound, for example when the user flips to the front camera. <code>asPersistentRecording()</code> keeps it going until you call <code>stop()</code>. While nothing is bound, no video frames arrive, but audio keeps recording, so pause around the switch. The API is marked experimental, so you have to opt in.</p>`,
        code: `@OptIn(ExperimentalPersistentRecording::class)
val recording = videoCapture.output
    .prepareRecording(context, output)
    .asPersistentRecording()
    .start(executor, listener)

fun flip() {
    recording.pause()
    provider.unbindAll()
    provider.bindToLifecycle(owner, otherLens, preview, videoCapture)
    recording.resume()
}`,
      },
    ],
    mistakes: [
      {
        title: 'Recording sound without the permission',
        bad: `videoCapture.output.prepareRecording(context, output)
    .withAudioEnabled()            // SecurityException if RECORD_AUDIO is not granted
    .start(executor, listener)`,
        good: `val pending = videoCapture.output.prepareRecording(context, output)
val withSound = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
    PackageManager.PERMISSION_GRANTED
(if (withSound) pending.withAudioEnabled() else pending).start(executor, listener)`,
        why: '<code>withAudioEnabled()</code> requires RECORD_AUDIO and throws without it. Ask first, and record silent video if the user says no.',
      },
      {
        title: 'Starting a second recording',
        bad: `fun onRecordClick() {
    recording = videoCapture.output.prepareRecording(context, output).start(executor, listener)
}`,
        good: `fun onRecordClick() {
    recording?.let { it.stop(); recording = null; return }
    recording = videoCapture.output.prepareRecording(context, output).start(executor, listener)
}`,
        why: 'A Recorder has at most one active recording. <code>start()</code> throws IllegalStateException while the previous one is unfinished.',
      },
    ],
    terms: [
      { term: 'VideoCapture', def: 'The CameraX use case for video. It feeds camera frames to a video output such as a Recorder.' },
      { term: 'Recorder', def: 'The CameraX video output that encodes audio and video and writes the file. It runs one recording at a time.' },
      { term: 'PendingRecording', def: 'A prepared recording with its output chosen. Nothing is recorded until you call start(), which returns a Recording.' },
      { term: 'VideoRecordEvent', def: 'Events sent to the recording listener: Start, Status, Pause, Resume and Finalize.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Prepare a recording, start it, and save the file when it is done.', code: 'val recording = videoCapture.output\n    .[[prepareRecording]](context, output)\n    .withAudioEnabled()\n    .[[start]](ContextCompat.getMainExecutor(context)) { event ->\n        if (event is VideoRecordEvent.[[Finalize]] && !event.hasError())\n            save(event.outputResults.outputUri)\n    }', why: '<code>prepareRecording</code> picks the output, <code>start</code> begins recording, and <code>Finalize</code> is the last event.' },
      { type: 'bug', prompt: 'The app says “Video saved” even when the recording failed. Tap the line.', code: '.start(executor) { event ->\n    when (event) {\n        is VideoRecordEvent.Start -> showRecDot()\n        is VideoRecordEvent.Finalize -> showSaved(event.outputResults.outputUri)\n        else -> Unit\n    }\n}', bug: 3, fix: '        is VideoRecordEvent.Finalize -> if (event.hasError()) showError(event.error) else showSaved(event.outputResults.outputUri)', why: 'Finalize arrives for success and failure alike. Check <code>hasError()</code> and the error code before you report success.' },
    ],
    quiz: [
      { q: 'What does <code>prepareRecording()</code> give you?', options: ['A PendingRecording that records nothing until start()', 'A Recording that is already running', 'The finished file'], a: 0, why: 'Preparing only picks the output and options. start() returns the active Recording.' },
      { q: 'The user presses Home while recording (not a persistent recording). What does the listener get?', options: ['Pause, and recording resumes later', 'Finalize with ERROR_SOURCE_INACTIVE, and a file with the frames so far', 'Nothing until the app returns'], a: 1, why: 'The camera closes on ON_STOP, so the recording ends. The frames before that are saved.' },
      { q: 'You call <code>start()</code> while another recording on the same Recorder is still active. What happens?', options: ['Both record to separate files', 'The first one stops on its own', 'It throws IllegalStateException'], a: 2, why: 'A Recorder handles one recording at a time. Stop the first one before you start another.' },
      { q: 'Which order records a video with sound?', options: ['prepareRecording(output), withAudioEnabled(), start(listener), later stop(), then Finalize arrives', 'start(listener), prepareRecording(output), withAudioEnabled(), then Finalize arrives', 'prepareRecording(output), start(listener), withAudioEnabled(), later stop()'], a: 0, why: 'withAudioEnabled() is set on the PendingRecording before start(). start() returns the active Recording, and Finalize tells you the file is done.' },
      { q: 'Finalize reports ERROR_FILE_SIZE_LIMIT_REACHED. What should you do with the file?', options: ['Delete it, since any error means a broken file', 'Keep it: the data recorded before the limit is saved', 'Start a new recording into the same file to finish it'], a: 1, why: 'Size and duration limits still leave a usable video. ERROR_NO_VALID_DATA is the one where the file is not valid and should be deleted.' },
    ],
    visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['your code', 'Recorder', 'listener'],
            span: 12,
            unit: 's',
            predict: {
              q: 'You call <code>stop()</code> on an active <code>Recording</code>. When is the video file ready to use?',
              options: ['As soon as <code>stop()</code> returns', 'When the listener receives <code>VideoRecordEvent.Finalize</code>', 'After the next <code>Status</code> event'],
              a: 1,
              why: '<code>stop()</code> only asks the Recorder to finish. It still has to flush the encoder and close the file, then it reports <code>Finalize</code> with the URI or an error.',
            },
            frames: [
              { now: 0, say: '<code>VideoCapture</code> wraps a <code>Recorder</code>, bound next to <code>Preview</code>. Nothing records yet.' },
              { bars: [{ lane: 0, from: 0, to: 1, label: 'prepare', tone: 'accent' }], say: '<code>prepareRecording(context, MediaStoreOutputOptions)</code> picks the output and returns a <code>PendingRecording</code>. Still nothing records.' },
              { bars: [{ lane: 0, from: 1, to: 2, label: 'audio', tone: 'accent' }], say: '<code>withAudioEnabled()</code> adds sound. Call it only after <code>RECORD_AUDIO</code> is granted.' },
              { bars: [{ lane: 0, from: 2, to: 3, label: 'start()', tone: 'ok' }, { lane: 1, from: 3, to: 7, label: 'recording', tone: 'ok' }, { lane: 2, from: 3, to: 4, label: 'Start', tone: 'accent' }], now: 4, say: '<code>start(executor, listener)</code> returns an active <code>Recording</code>. The listener gets <code>Start</code>.' },
              { bars: [{ lane: 2, from: 4, to: 5, label: 'Status', tone: 'muted' }, { lane: 2, from: 5, to: 6, label: 'Status', tone: 'muted' }, { lane: 2, from: 6, to: 7, label: 'Status', tone: 'muted' }], now: 7, say: 'While it records, <code>Status</code> events report the duration and the bytes written so far.' },
              { bars: [{ lane: 0, from: 7, to: 8, label: 'pause()', tone: 'warm' }, { lane: 1, from: 7, to: 9, label: 'paused', tone: 'warm' }, { lane: 2, from: 7, to: 8, label: 'Pause', tone: 'warm' }], now: 9, say: '<code>pause()</code> holds the same recording. The file is not finished.' },
              { bars: [{ lane: 0, from: 9, to: 10, label: 'stop()', tone: 'err' }, { lane: 1, from: 9, to: 11, label: 'finishing', tone: 'muted' }], now: 10, say: '<code>stop()</code> returns at once, but the Recorder is still flushing the encoder and closing the file.' },
              { bars: [{ lane: 2, from: 11, to: 12, label: 'Finalize', tone: 'ok' }], now: 12, say: '<code>Finalize</code> arrives with the output URI, or with an error code if it stopped for a reason. Now the file is ready, and the Recorder can take a new recording.' },
            ],
          });
        },
  };

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
          { q: 'A playlist is 40 seconds into item 3. The user taps previous, which calls <code>seekToPrevious()</code>. What happens?', options: ['Playback moves to item 2', 'Item 3 restarts from the beginning', 'Playback moves to item 1'], a: 1, why: 'seekToPrevious() goes back an item only near the start. More than 3 seconds in, it restarts the current item.' },
          { q: 'onPlayerError() reports ERROR_CODE_IO_BAD_HTTP_STATUS for a 404. What should the app do?', options: ['Call prepare() again until it plays', 'Show a message, because a retry will fail the same way', 'Call play(), since the player is still READY'], a: 1, why: 'A missing file stays missing. Retry buttons fit network errors like ERROR_CODE_IO_NETWORK_CONNECTION_FAILED, where prepare() can continue from the same position.' },
        ],
        deeper: [
          {
            title: 'Playlists and transitions',
            body: `<p>A player holds a playlist, not just one item. <code>setMediaItems()</code> fills it, and the player moves on to the next item by itself. It starts loading the next item before the current one ends, so playback continues without a pause. <code>onMediaItemTransition()</code> tells you the item changed and why: it played to the end (<code>AUTO</code>), the user skipped (<code>SEEK</code>), it looped (<code>REPEAT</code>), or the playlist changed.</p>
<p><code>repeatMode</code> decides what happens at the end. <code>REPEAT_MODE_OFF</code> stops in STATE_ENDED after the last item, <code>REPEAT_MODE_ONE</code> loops the current item, and <code>REPEAT_MODE_ALL</code> wraps to the first. <code>seekToPrevious()</code> goes back an item only near the start; more than 3 seconds in, it restarts the current one.</p>`,
            code: `player.setMediaItems(
    listOf(MediaItem.fromUri(intro), MediaItem.fromUri(episode), MediaItem.fromUri(outro))
)
player.repeatMode = Player.REPEAT_MODE_ALL
player.prepare()
player.play()

player.addListener(object : Player.Listener {
    override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
        if (reason == Player.MEDIA_ITEM_TRANSITION_REASON_AUTO) analytics.finishedPrevious()
        showTitle(mediaItem?.mediaMetadata?.title)
    }
})`,
            visual(el) {
              const ITEMS = [['Intro', 6], ['Episode 12', 10], ['Outro', 5]];
              const S = { i: 0, pos: 0, pwr: true, ended: false, repeat: 'OFF' };
              const rows = ITEMS.map(([t, d]) => {
                const played = h('span', { class: 'md-played' }), pre = h('span', { class: 'md-buf' });
                return { played, pre, row: h('div', { class: 'md-d2-item' }, h('b', {}, t), h('span', { class: 'md-time' }, `0:${String(d).padStart(2, '0')}`), h('div', { class: 'md-prog', 'aria-hidden': 'true' }, pre, played)) };
              });
              const stTag = tag(''), rmTag = tag('');
              const { el: logEl, log } = logger(4);
              const last = ITEMS.length - 1;
              const nextAuto = () => S.repeat === 'ONE' ? S.i : S.i < last ? S.i + 1 : S.repeat === 'ALL' ? 0 : -1;
              function paint() {
                const d = ITEMS[S.i][1], n = nextAuto();
                rows.forEach((r, j) => {
                  r.row.classList.toggle('md-d2-cur', j === S.i);
                  r.played.style.width = j === S.i ? `${(S.pos / d) * 100}%` : '0%';
                  r.pre.style.width = j === S.i ? `${Math.min(100, ((S.pos + 3) / d) * 100)}%` : j === n && j !== S.i && d - S.pos < 3 && !S.ended ? '35%' : '0%';
                });
                setTag(stTag, S.ended ? 'STATE_ENDED' : S.pwr ? 'playing' : 'paused', S.ended ? 'no' : S.pwr ? 'ok' : 'wait');
                setTag(rmTag, `REPEAT_MODE_${S.repeat}`, 'acc');
              }
              function go(i, reason) {
                S.i = i; S.pos = 0; S.ended = false;
                log(`onMediaItemTransition(${ITEMS[i][0]}, <span class="good">${reason}</span>)`);
                replay(rows[i].row, 'pop-soft'); paint();
              }
              function tick() {
                if (!S.pwr || S.ended) return;
                S.pos += 0.2;
                if (S.pos >= ITEMS[S.i][1]) {
                  const n = nextAuto();
                  if (n < 0) { S.pos = ITEMS[S.i][1]; S.ended = true; log('onPlaybackStateChanged(<span class="good">STATE_ENDED</span>)'); }
                  else go(n, S.repeat === 'ONE' ? 'REPEAT' : 'AUTO');
                }
                paint();
              }
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, stTag, rmTag),
                h('div', { class: 'md-d2-list' }, rows.map(r => r.row)),
                h('div', { class: 'controls' },
                  cmd('seekToNextMediaItem()', () => {
                    const n = S.i < last ? S.i + 1 : S.repeat === 'ALL' ? 0 : -1;
                    if (n < 0) { log('<span class="muted">no next item: nothing happens</span>'); return; }
                    go(n, 'SEEK');
                  }),
                  cmd('seekToPrevious()', () => {
                    if (S.pos > 3 || S.ended) { S.pos = 0; S.ended = false; log('more than 3 s in: <span class="good">restart this item</span>'); paint(); return; }
                    const p = S.i > 0 ? S.i - 1 : S.repeat === 'ALL' ? last : -1;
                    if (p < 0) { S.pos = 0; log('first item: back to its start'); paint(); return; }
                    go(p, 'SEEK');
                  }),
                  cmd('play() / pause()', () => {
                    if (S.ended) { log('<span class="muted">STATE_ENDED: seek first, for example seekToPrevious()</span>'); return; }
                    S.pwr = !S.pwr; log(`playWhenReady = <span class="t-n">${S.pwr}</span>`); paint();
                  })),
                choice('repeatMode', ['OFF', 'ONE', 'ALL'], S.repeat, v => { S.repeat = v; log(`repeatMode = REPEAT_MODE_${v}`); paint(); }, v => `REPEAT_MODE_${v}`).el,
                logEl);
              el.append(root);
              log('setMediaItems(3 items), prepare(), play()');
              paint();
              every(root, 100, tick);
            },
          },
          {
            title: 'When playback fails',
            body: `<p>A dead network or a missing file ends in <code>onPlayerError()</code>. The loader can retry some failed loads by itself first. When the player gives up, it reports a <code>PlaybackException</code>, sets <code>playerError</code> and drops to STATE_IDLE. Nothing plays until you act.</p>
<p>Read <code>error.errorCode</code> to decide what to show. A network error such as <code>ERROR_CODE_IO_NETWORK_CONNECTION_FAILED</code> deserves a retry button: call <code>prepare()</code> again and playback continues from the same position. <code>ERROR_CODE_IO_BAD_HTTP_STATUS</code>, such as a 404, will fail again, so show a message instead.</p>`,
            code: `player.addListener(object : Player.Listener {
    override fun onPlayerError(error: PlaybackException) {
        when (error.errorCode) {
            PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_FAILED,
            PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT ->
                showRetry { player.prepare() }          // resumes where it stopped
            PlaybackException.ERROR_CODE_IO_BAD_HTTP_STATUS ->
                showMessage("This episode is not available")
            else -> showMessage("Playback failed")
        }
    }
})`,
            visual(el) {
              const DUR = 60;
              const S = { state: 'READY', pos: 12, buf: 20, net: true, bad: false, err: '', fails: 0, pwr: true };
              const buf = h('span', { class: 'md-buf' }), played = h('span', { class: 'md-played' });
              const time = h('span', { class: 'md-time' });
              const stTag = tag(''), netTag = tag(''), errTag = tag('');
              const { el: logEl, log } = logger(5);
              const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
              function setState(s) { if (S.state === s) return; S.state = s; log(`onPlaybackStateChanged(<span class="good">STATE_${s}</span>)`); }
              function fail(code) {
                S.err = code; S.fails = 0; setState('IDLE');
                log(`onPlayerError(<span class="bad">${code}</span>)`);
                replay(errTag, 'shake');
              }
              function paint() {
                buf.style.width = `${(S.buf / DUR) * 100}%`;
                played.style.width = `${(S.pos / DUR) * 100}%`;
                time.textContent = `${fmt(S.pos)} / ${fmt(DUR)}`;
                setTag(stTag, `STATE_${S.state}`, { READY: 'ok', BUFFERING: 'wait', IDLE: 'no', ENDED: '' }[S.state]);
                setTag(netTag, S.net ? 'network: up' : 'network: down', S.net ? '' : 'no');
                setTag(errTag, S.err ? `playerError: ${S.err}` : 'playerError: null', S.err ? 'no' : '');
              }
              function tick() {
                if (S.state === 'IDLE' || S.state === 'ENDED') { paint(); return; }
                if (S.bad) { if (++S.fails > 6) fail('ERROR_CODE_IO_BAD_HTTP_STATUS'); paint(); return; }
                if (S.net) { S.fails = 0; S.buf = Math.min(DUR, Math.max(S.buf, S.pos) + 0.5, S.pos + 12); }
                if (S.state === 'READY' && S.pwr) S.pos = Math.min(DUR, S.pos + 0.2);
                if (S.pos >= DUR) setState('ENDED');
                else if (S.state === 'READY' && S.buf < DUR && S.pos >= S.buf - 0.05) setState('BUFFERING');
                else if (S.state === 'BUFFERING' && S.buf - S.pos >= 2.5) setState('READY');
                if (S.state === 'BUFFERING' && !S.net) {
                  S.fails++;
                  if (S.fails % 7 === 0 && S.fails < 28) log(`<span class="muted">segment load failed, loader retry ${S.fails / 7}</span>`);
                  if (S.fails >= 28) fail('ERROR_CODE_IO_NETWORK_CONNECTION_FAILED');
                }
                paint();
              }
              let netBtn;
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, stTag, netTag),
                h('div', { class: 'md-tags' }, errTag),
                h('div', { class: 'md-prog', 'aria-hidden': 'true' }, buf, played),
                h('div', { class: 'md-meta' }, h('span', { class: 'md-label' }, 'Episode 12'), time),
                h('div', { class: 'controls' },
                  netBtn = act('Drop the network', () => {
                    S.net = !S.net; netBtn.textContent = S.net ? 'Drop the network' : 'Bring the network back';
                    log(S.net ? 'network is back' : '<span class="bad">network lost</span>: the buffer keeps playing until it runs out');
                    paint();
                  }),
                  cmd('player.prepare()', () => {
                    if (S.state !== 'IDLE') { log('<span class="muted">not in STATE_IDLE: prepare() does nothing</span>'); return; }
                    S.err = ''; S.fails = 0; S.buf = S.pos; setState('BUFFERING');
                    log(`prepare(): retry from <span class="good">${fmt(S.pos)}</span>`); paint();
                  }),
                  act('Open a missing episode (404)', () => {
                    Object.assign(S, { bad: true, err: '', pos: 0, buf: 0, fails: 0 }); S.state = 'IDLE';
                    log('setMediaItem(missing.mp3), prepare()'); setState('BUFFERING'); paint();
                  }),
                  act('Open a working episode', () => {
                    Object.assign(S, { bad: false, err: '', pos: 0, buf: 0, fails: 0 }); S.state = 'IDLE';
                    log('setMediaItem(episode12.mp3), prepare()'); setState('BUFFERING'); paint();
                  })),
                logEl);
              el.append(root);
              paint();
              log('Playing at 0:12. Drop the network and wait for the buffer to run dry.');
              every(root, 100, tick);
            },
          },
          {
            title: 'Adaptive streams and quality limits',
            body: `<p>For HLS or DASH, add the <code>media3-exoplayer-hls</code> or <code>media3-exoplayer-dash</code> module and pass the manifest URL as a normal <code>MediaItem</code>. The stream comes in several qualities, and ExoPlayer switches between them as the measured bandwidth changes.</p>
<p>Set limits with <code>trackSelectionParameters</code>: cap the video size on a metered network, or prefer an audio language. The player keeps adapting, inside your limits.</p>`,
            code: `// build.gradle.kts: implementation("androidx.media3:media3-exoplayer-hls:$media3Version")
player.setMediaItem(MediaItem.fromUri("https://example.com/show/master.m3u8"))

player.trackSelectionParameters = player.trackSelectionParameters
    .buildUpon()
    .setMaxVideoSizeSd()                 // below 720p, for example on mobile data
    .setPreferredAudioLanguage("es")
    .build()`,
          },
        ],
        underHood: {
          body: `<p>ExoPlayer works on several threads. Your calls run on the application thread, the one whose <code>Looper</code> the player was built with. Each call updates the player’s state there and posts a message to an internal playback thread. That thread runs the playback loop: it drives the renderers and asks the <code>LoadControl</code> whether to keep loading. The loading itself happens on separate loader threads.</p>
<p>The audio and video renderers feed Android’s <code>MediaCodec</code> decoders, usually hardware ones, and the audio output goes to an <code>AudioTrack</code>. State changes travel back to the application thread, where your listeners run. This is why a player must be used from one thread only, and why <code>release()</code> matters: it stops the playback thread and frees the decoders, which are a limited hardware resource.</p>`,
        },
        mistakes: [
          {
            title: 'Touching the player from a background thread',
            bad: `viewModelScope.launch(Dispatchers.IO) {
    val url = repository.streamUrl(id)
    player.setMediaItem(MediaItem.fromUri(url))   // wrong thread
    player.prepare()
}`,
            good: `viewModelScope.launch {                          // main thread
    val url = withContext(Dispatchers.IO) { repository.streamUrl(id) }
    player.setMediaItem(MediaItem.fromUri(url))
    player.prepare()
}`,
            why: 'A player belongs to the thread it was built on, usually main. Calls from another thread throw <code>IllegalStateException: Player is accessed on the wrong thread</code>. Do the slow work elsewhere, then call the player from its own thread.',
          },
          {
            title: 'Deriving the play button from the state alone',
            bad: `val showPauseButton = player.playbackState == Player.STATE_READY`,
            good: `// Util is @UnstableApi: add @OptIn(UnstableApi::class)
val showPlayButton = Util.shouldShowPlayButton(player)
// on click:
Util.handlePlayPauseButtonAction(player)`,
            why: 'READY says nothing about whether the user paused, and BUFFERING hides the pause button while playback is about to continue. The helpers look at <code>playWhenReady</code>, IDLE and ENDED for you, and the action also seeks back to the start after ENDED.',
          },
        ],
        predict: {
          q: "You call <code>prepare()</code> and <code>play()</code> on a slow network. Which state does the player reach first?",
          options: ["<code>STATE_READY</code>", "<code>STATE_BUFFERING</code>", "<code>STATE_ENDED</code>"],
          a: 1,
          why: "After prepare() the player waits for data in BUFFERING. It moves to READY, and isPlaying turns true, once enough is loaded.",
        },
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
          { q: 'Which lifecycle fits a MediaController in an Activity?', options: ['onStart: buildAsync(), use it when the future completes; onStop: MediaController.releaseFuture(future)', 'onCreate: buildAsync() and get() the future; onDestroy: release the player', 'onStart: buildAsync(); onStop: nothing, the service cleans up controllers'], a: 0, why: 'A connected controller keeps the service bound. Release it in onStop, or every visit leaves one more controller keeping the service and its player alive.' },
          { q: 'After a phone restart, the user taps play on your app in the Quick Settings media controls. You never implemented <code>onPlaybackResumption()</code>. What happens?', options: ['Media3 restores the last queue and position by itself', 'Nothing plays, because the default implementation fails', 'The system opens your Activity instead'], a: 1, why: 'The session remembers nothing across a restart. Save the queue and position as you play, and return them from onPlaybackResumption().' },
          { q: 'You add a “forward 15 s” CommandButton to the media notification and allow it in onConnect. Where does the press arrive?', options: ['onCustomCommand on the session callback', 'A BroadcastReceiver you register for the button', 'Player.Listener.onEvents on the controller'], a: 0, why: 'Media3 routes the SessionCommand to onCustomCommand. The same command works from the notification, Android Auto and your own UI.' },
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
          Lab.ui.graph(el, {
            height: 300,
            nodes: [
              { id: 'act', label: 'Activity<small>MediaController</small>', x: 17, y: 12, hidden: true },
              { id: 'noti', label: 'Notification<small>media controls</small>', x: 50, y: 12, hidden: true },
              { id: 'bt', label: 'Headset<small>Bluetooth</small>', x: 83, y: 12, hidden: true },
              { id: 'session', label: 'MediaSession', x: 50, y: 50 },
              { id: 'svc', label: 'Service<small>MediaSessionService</small>', x: 20, y: 88, tone: 'muted' },
              { id: 'player', label: 'ExoPlayer', x: 80, y: 88 },
            ],
            predict: {
              q: 'Music is playing. The user switches to another app, and your Activity stops and releases its <code>MediaController</code>. What happens to playback?',
              options: ['It stops with the controller', 'It keeps going: the service owns the player', 'It pauses until the app is opened again'],
              a: 1,
              why: 'The player lives in the <code>MediaSessionService</code>, not in the Activity. The Activity only held a controller.',
            },
            frames: [
              { add: [['svc', 'player', 'owns'], ['svc', 'session', 'owns'], ['session', 'player', 'controls']], say: 'The service owns the ExoPlayer and a <code>MediaSession</code> built around it. <code>onGetSession()</code> returns that session.' },
              { show: ['act'], add: [['act', 'session', 'SessionToken', 'accent']], say: 'The Activity builds a <code>MediaController</code> from a <code>SessionToken</code>. It connects to the session, never to the player.' },
              { hl: ['act', 'session', 'player'], add: [['act', 'session', 'play()', 'ok'], ['session', 'player', 'play()', 'ok']], say: 'The user taps play. <code>controller.play()</code> goes to the session, and the session calls <code>player.play()</code>.' },
              { show: ['noti'], add: [['noti', 'session', 'pause', 'accent']], say: 'While it plays, Media3 posts the media notification and keeps the service in the foreground. The notification’s buttons talk to the same session.' },
              { remove: [['act', 'session']], gone: ['act'], say: 'The user leaves the app and the Activity releases its controller. The service and the player keep going.' },
              { show: ['bt'], hl: ['bt', 'session', 'player'], add: [['bt', 'session', 'play / pause', 'ok']], say: 'A headset button arrives at the session too. Notification, lock screen, Bluetooth, Android Auto: every remote goes through this one door.' },
            ],
          });
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
          { q: 'An alarm clock app plays its ringtone with <code>USAGE_MEDIA</code>. At night the user turned media volume down to zero. What happens at 07:00?', options: ['It rings at alarm volume anyway', 'It stays silent, because it follows the media volume', 'It only vibrates'], a: 1, why: 'The usage picks the volume slider. USAGE_ALARM would follow the alarm volume and still sound when media is muted.' },
        ],
        deeper: [
          {
            title: 'Without ExoPlayer: request focus yourself',
            body: `<p>MediaPlayer, SoundPool, text to speech and your own audio code don’t manage focus. Build an <code>AudioFocusRequest</code> with the gain you need and pass it to <code>AudioManager.requestAudioFocus()</code>. <code>AUDIOFOCUS_GAIN</code> is for long playback, and the other app loses focus for good. <code>AUDIOFOCUS_GAIN_TRANSIENT</code> is for a short clip the other app should pause for. <code>AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK</code> lets it keep playing quietly.</p>
<p>When your sound ends, call <code>abandonAudioFocusRequest()</code>. That is the other app’s signal to resume or restore its volume. Forget it and the music stays paused or quiet long after your prompt is over.</p>`,
            code: `val audioManager = context.getSystemService<AudioManager>()!!
val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
    .setAudioAttributes(
        android.media.AudioAttributes.Builder()
            .setUsage(android.media.AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
            .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SPEECH)
            .build()
    )
    .build()

if (audioManager.requestAudioFocus(request) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
    tts.speak("In 200 meters, turn left", TextToSpeech.QUEUE_FLUSH, null, "turn")
}

// UtteranceProgressListener.onDone(): give focus back
audioManager.abandonAudioFocusRequest(request)`,
            visual(el) {
              const GAINS = { GAIN: 'AUDIOFOCUS_GAIN', TRANSIENT: 'AUDIOFOCUS_GAIN_TRANSIENT', MAY_DUCK: 'AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK' };
              const LOSS = { GAIN: 'AUDIOFOCUS_LOSS', TRANSIENT: 'AUDIOFOCUS_LOSS_TRANSIENT', MAY_DUCK: 'AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK' };
              const S = { gain: 'MAY_DUCK', abandon: true, music: 'playing', you: false, held: false, busy: false };
              const mus = h('span', { class: 'md-fill md-other' }), musL = h('span', { class: 'md-fill-label' });
              const you = h('span', { class: 'md-fill' }), youL = h('span', { class: 'md-fill-label' });
              const focusTag = tag('');
              const { el: logEl, log } = logger(5);
              function paint() {
                const v = { playing: 1, ducked: 0.2, paused: 0, stopped: 0 }[S.music];
                mus.style.width = `${v * 100}%`;
                musL.textContent = { playing: 'music 100%', ducked: 'music 20%', paused: 'music paused, waiting', stopped: 'music stopped' }[S.music];
                you.style.width = S.you ? '100%' : '0%';
                youL.textContent = S.you ? '“turn left”' : 'silent';
                setTag(focusTag, S.held ? 'your app holds focus' : 'music app holds focus', S.held ? (S.you ? 'ok' : 'no') : '');
              }
              async function speak() {
                if (S.busy) return; S.busy = true;
                log(`requestAudioFocus(${GAINS[S.gain]}): <span class="good">GRANTED</span>`);
                if (S.music === 'playing' || S.music === 'ducked') {
                  S.music = S.gain === 'MAY_DUCK' ? 'ducked' : S.gain === 'TRANSIENT' ? 'paused' : 'stopped';
                  log(`music app gets ${LOSS[S.gain]}: <span class="good">${{ ducked: 'ducks', paused: 'pauses', stopped: 'stops for good' }[S.music]}</span>`);
                }
                S.held = true; S.you = true; paint();
                await sleep(1600); if (!el.isConnected) return;
                S.you = false;
                if (S.abandon) giveBack();
                else log('<span class="bad">clip done, focus never abandoned:</span> the music app keeps waiting');
                paint(); S.busy = false;
              }
              function giveBack() {
                if (!S.held) { log('<span class="muted">you hold no focus</span>'); return; }
                S.held = false; log('abandonAudioFocusRequest(request)');
                if (S.music === 'stopped') log('music app lost focus for good: <span class="muted">it stays stopped until the user presses play</span>');
                else { S.music = 'playing'; log('music app gets AUDIOFOCUS_GAIN: <span class="good">back to full volume</span>'); }
              }
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, focusTag),
                h('div', { class: 'timeline' }, lane('Music app', musL, mus), lane('Your app', youL, you)),
                choice('request', Object.keys(GAINS), S.gain, v => { if (S.busy) return false; S.gain = v; log(`AudioFocusRequest.Builder(${GAINS[v]})`); }, v => GAINS[v]).el,
                h('div', { class: 'controls' },
                  cmd('speak the prompt', speak),
                  cmd('abandonAudioFocusRequest(request)', () => { if (S.busy) return; giveBack(); paint(); }),
                  act('Music app: play', () => {
                    if (S.busy) return;
                    if (S.music === 'playing') { log('<span class="muted">music is already playing</span>'); return; }
                    S.music = 'playing'; S.held = false; log('the user presses play: the music app requests AUDIOFOCUS_GAIN'); paint();
                  })),
                toggle('md-d2-abandon', 'abandon focus when the clip ends', true, v => { S.abandon = v; log(v ? 'onDone() will abandon focus' : 'onDone() will forget to abandon focus'); }),
                logEl);
              el.append(root);
              paint();
              log('Music is playing. Speak a prompt with each gain type.');
            },
          },
          {
            title: 'The usage picks the volume slider',
            body: `<p>The usage in <code>AudioAttributes</code> does more than focus. It decides which volume the sound follows. <code>USAGE_MEDIA</code> follows the media volume. <code>USAGE_NOTIFICATION</code> follows the notification volume and goes quiet when the phone is on silent or vibrate. <code>USAGE_ALARM</code> follows the alarm volume and still sounds on silent.</p>
<p>Pick the usage the user expects. An alarm clock that plays as media stays silent when media volume was turned down for the night. A chat sound that plays as media ignores silent mode and plays during a meeting.</p>`,
            code: `val alarmSound = AudioAttributes.Builder()          // androidx.media3.common
    .setUsage(C.USAGE_ALARM)
    .setContentType(C.AUDIO_CONTENT_TYPE_SONIFICATION)
    .build()

ExoPlayer.Builder(context)
    .setAudioAttributes(alarmSound, /* handleAudioFocus = */ true)
    .build()`,
            visual(el) {
              const U = { MEDIA: 'media', NOTIFICATION: 'notification', ALARM: 'alarm' };
              const S = { usage: 'MEDIA', media: true, silent: false };
              const spk = h('span', { class: 'md-fill' }), spkL = h('span', { class: 'md-fill-label' });
              const mTag = tag(''), rTag = tag(''), aTag = tag('');
              const { el: logEl, log } = logger(3);
              function level() {
                if (S.usage === 'MEDIA') return S.media ? 0.7 : 0;
                if (S.usage === 'NOTIFICATION') return S.silent ? 0 : 0.6;
                return 0.8;
              }
              function paint() {
                setTag(mTag, S.media ? 'media volume 70%' : 'media volume 0', S.media ? '' : 'no');
                setTag(rTag, S.silent ? 'ringer: silent' : 'ringer: normal', S.silent ? 'no' : '');
                setTag(aTag, 'alarm volume 80%');
              }
              function play() {
                const v = level();
                spk.style.width = '0%'; spkL.textContent = '';
                requestAnimationFrame(() => {
                  spk.style.width = `${v * 100}%`;
                  spkL.textContent = v ? `heard at ${Math.round(v * 100)}%` : 'silent';
                });
                if (!v) replay(spk.parentNode, 'shake');
                log(`USAGE_${S.usage} follows the <b>${U[S.usage]}</b> volume: ${v ? '<span class="good">heard</span>' : '<span class="bad">silent</span>'}`);
              }
              let mBtn, sBtn;
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, mTag, rTag, aTag),
                choice('usage', Object.keys(U), S.usage, v => { S.usage = v; play(); }, v => `USAGE_${v}`).el,
                h('div', { class: 'controls' },
                  mBtn = act('Night: media volume to 0', () => {
                    S.media = !S.media; mBtn.textContent = S.media ? 'Night: media volume to 0' : 'Morning: media volume back';
                    paint(); play();
                  }),
                  sBtn = act('Meeting: phone on silent', () => {
                    S.silent = !S.silent; sBtn.textContent = S.silent ? 'After the meeting: ringer on' : 'Meeting: phone on silent';
                    paint(); play();
                  }),
                  cmd('player.play()', play)),
                h('div', { class: 'timeline' }, lane('Speaker', spkL, spk)),
                logEl);
              el.append(root);
              paint(); play();
            },
          },
        ],
        underHood: {
          body: `<p>Focus lives in the system, not in your app. <code>AudioService</code> in the system process keeps a stack of focus requests. A new request goes on top, and the app that was on top gets a loss callback. When the top app abandons its request, the next one down gets <code>AUDIOFOCUS_GAIN</code>. Focus is a convention, not a lock: nothing stops an app from playing without it, which is why turning off focus handling in the main demo lets two apps play at once. Since Android 12 the system does step in a little: when an app takes focus, it fades out the app that lost it.</p>
<p>Since Android 8, the system also ducks apps for you when another app asks for <code>MAY_DUCK</code>, unless they set <code>setWillPauseWhenDucked(true)</code> and handle the loss themselves. ExoPlayer’s focus handling is a small class inside the player. It requests focus when <code>playWhenReady</code> becomes true, turns each focus change into play, wait or pause, and multiplies its volume by 0.2 to duck. For speech content it asks to pause instead of being ducked.</p>`,
        },
        mistakes: [
          {
            title: 'Ignoring the request result',
            bad: `audioManager.requestAudioFocus(request)
mediaPlayer.start()`,
            good: `when (audioManager.requestAudioFocus(request)) {
    AudioManager.AUDIOFOCUS_REQUEST_GRANTED -> mediaPlayer.start()
    AudioManager.AUDIOFOCUS_REQUEST_DELAYED -> startOnGain = true   // needs setAcceptsDelayedFocusGain(true)
    else -> showMessage("Can't play right now")
}`,
            why: 'The request can fail, for example during a phone call, or since Android 15 when your app is in the background. Playing anyway talks over the call.',
          },
          {
            title: 'Resuming on every focus gain',
            bad: `when (focusChange) {
    AudioManager.AUDIOFOCUS_LOSS, AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> player.pause()
    AudioManager.AUDIOFOCUS_GAIN -> player.start()
}`,
            good: `when (focusChange) {
    AudioManager.AUDIOFOCUS_LOSS -> { resumeOnGain = false; player.pause() }
    AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> { resumeOnGain = player.isPlaying; player.pause() }
    AudioManager.AUDIOFOCUS_GAIN -> if (resumeOnGain) { resumeOnGain = false; player.start() }
}`,
            why: 'Only resume what a transient loss paused. If the user had paused before the call, starting again when the call ends surprises them.',
          },
        ],
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['your player', 'other audio'],
            span: 60,
            unit: 's',
            predict: {
              q: 'Your music player uses <code>AUDIO_CONTENT_TYPE_MUSIC</code> and <code>handleAudioFocus = true</code>. A navigation app speaks a turn instruction. What does your player do?',
              options: ['Pauses until the prompt ends', 'Lowers its volume (ducks) and keeps playing', 'Keeps playing at full volume'],
              a: 1,
              why: 'A navigation prompt asks for short focus that allows ducking. Music still makes sense quietly, so ExoPlayer ducks. Speech content would pause instead.',
            },
            frames: [
              { now: 0, say: 'A music player built with <code>setAudioAttributes(attrs, handleAudioFocus = true)</code>. Watch who holds focus.' },
              { bars: [{ lane: 0, from: 0, to: 10, label: 'playing', tone: 'ok' }], say: '<code>play()</code> requests audio focus and gets it.' },
              { bars: [{ lane: 1, from: 10, to: 16, label: 'nav prompt', tone: 'accent' }, { lane: 0, from: 10, to: 16, label: 'ducked', tone: 'warm' }], say: 'A navigation app asks for short focus that may duck. ExoPlayer lowers the volume and keeps going.' },
              { bars: [{ lane: 0, from: 16, to: 26, label: 'playing', tone: 'ok' }], say: 'The prompt ends and gives focus back. Full volume again.' },
              { bars: [{ lane: 1, from: 26, to: 40, label: 'phone call', tone: 'err' }, { lane: 0, from: 26, to: 40, label: 'paused', tone: 'muted' }], say: 'A call takes focus for a while, with no ducking allowed. ExoPlayer pauses.' },
              { bars: [{ lane: 0, from: 40, to: 46, label: 'playing', tone: 'ok' }], say: 'The call ends and focus returns. Playback resumes on its own.' },
              { bars: [{ lane: 1, from: 46, to: 60, label: 'other music app', tone: 'accent' }, { lane: 0, from: 46, to: 60, label: 'paused for good', tone: 'muted' }], marks: [{ at: 46, label: 'focus lost', tone: 'err' }], say: 'Another music app takes focus for good. ExoPlayer pauses and stays paused until the user presses play again.' },
            ],
          });
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'camerax',
        title: 'CameraX basics',
        tagline: 'Pick use cases, bind them to a lifecycle, let CameraX open and close the camera.',
        level: 'intermediate',
        body: `
<p>CameraX wraps Camera2 in use cases. <code>Preview</code> streams frames to the screen. <code>ImageCapture</code> takes photos. <code>ImageAnalysis</code> and <code>VideoCapture</code> are the other two; video has its own lesson, <em>Recording video with CameraX</em>. You build the ones you need and hand them to the provider’s <code>bindToLifecycle()</code> with a <code>CameraSelector</code> such as <code>DEFAULT_BACK_CAMERA</code>.</p>
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
        deeper: [
          {
            title: 'Tap to focus and zoom',
            body: `<p><code>bindToLifecycle()</code> returns a <code>Camera</code>. Its <code>cameraControl</code> changes the running camera, and its <code>cameraInfo</code> says what the camera can do. <code>startFocusAndMetering()</code> focuses and meters on the point you pass, and cancels itself after 5 seconds by default, so the camera goes back to continuous focus. A new tap cancels the previous action.</p>
<p>Zoom has a range per camera. Read it from <code>cameraInfo.zoomState</code>. <code>setZoomRatio()</code> outside <code>minZoomRatio</code> to <code>maxZoomRatio</code> returns a failed future. A ratio below 1 means the device can switch to an ultra-wide lens. <code>setLinearZoom()</code> takes 0 to 1 across the whole range, which suits a slider.</p>`,
            code: `val camera = provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)

fun focusAt(point: MeteringPoint) {
    val action = FocusMeteringAction.Builder(point)          // AF, AE and AWB
        .setAutoCancelDuration(5, TimeUnit.SECONDS)          // the default
        .build()
    camera.cameraControl.startFocusAndMetering(action)
}

fun onPinch(scale: Float) {
    val zoom = camera.cameraInfo.zoomState.value ?: return
    val ratio = (zoom.zoomRatio * scale).coerceIn(zoom.minZoomRatio, zoom.maxZoomRatio)
    camera.cameraControl.setZoomRatio(ratio)
}

// In Compose, pass a MutableCoordinateTransformer to CameraXViewfinder to turn a tap
// into surface coordinates for a SurfaceOrientedMeteringPointFactory.`,
            visual(el) {
              const CAMS = { 'phone with ultra-wide': [0.6, 10], 'single-lens phone': [1, 4] };
              const S = { cam: 'phone with ultra-wide', zoom: 1, tok: 0, pending: false };
              const scene = h('div', { class: 'md-scene' });
              const ring = h('span', { class: 'md-d2-ring' });
              const zl = h('span', { class: 'md-vf-label' });
              const vf = h('div', { class: 'md-vf md-open md-d2-vf', role: 'button', tabindex: '0', 'aria-label': 'Viewfinder: tap to focus' }, scene, ring, zl);
              const afTag = tag(''), zTag = tag('');
              const slider = h('input', { type: 'range', id: 'md-d2-zoom', min: '0', max: '1', step: '0.05', value: '0', 'aria-label': 'Linear zoom' });
              const { el: logEl, log } = logger(4);
              const linToRatio = (v, mn, mx) => 1 / (1 / mn + (1 / mx - 1 / mn) * v);
              const ratioToLin = (r, mn, mx) => (1 / r - 1 / mn) / (1 / mx - 1 / mn);
              function paintZoom() {
                const [mn, mx] = CAMS[S.cam];
                scene.style.transform = `scale(${Math.sqrt(S.zoom).toFixed(3)})`;
                zl.textContent = `${S.zoom.toFixed(1)}x`;
                setTag(zTag, `zoomRatio ${S.zoom.toFixed(1)} (range ${mn} to ${mx})`, 'acc');
                slider.value = String(Math.max(0, Math.min(1, ratioToLin(S.zoom, mn, mx))).toFixed(2));
              }
              async function focus(x, y) {
                const my = ++S.tok;
                if (S.pending) log('previous action: <span class="muted">OperationCanceledException</span>');
                S.pending = true;
                ring.style.left = `${(x * 100).toFixed(1)}%`; ring.style.top = `${(y * 100).toFixed(1)}%`;
                ring.className = 'md-d2-ring md-d2-seek';
                setTag(afTag, 'AF: scanning', 'wait');
                log(`startFocusAndMetering(point ${x.toFixed(2)}, ${y.toFixed(2)})`);
                await sleep(700); if (my !== S.tok || !vf.isConnected) return;
                S.pending = false;
                ring.className = 'md-d2-ring md-d2-lock';
                setTag(afTag, 'AF: locked', 'ok'); log('isFocusSuccessful: <span class="good">true</span>');
                await sleep(5000); if (my !== S.tok || !vf.isConnected) return;
                ring.className = 'md-d2-ring';
                setTag(afTag, 'AF: continuous', ''); log('5 s auto-cancel: <span class="muted">back to continuous autofocus</span>');
              }
              function zoomTo(r, src) {
                const [mn, mx] = CAMS[S.cam];
                if (r < mn - 1e-6 || r > mx + 1e-6) { replay(vf, 'shake'); log(`${src}: <span class="bad">future failed</span>, ${r} is outside ${mn} to ${mx}`); return; }
                S.zoom = r; paintZoom(); log(`${src}: <span class="good">zoomRatio ${r.toFixed(1)}</span>`);
              }
              vf.addEventListener('click', e => { const r = vf.getBoundingClientRect(); focus((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
              vf.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus(0.5, 0.5); } });
              slider.addEventListener('input', () => { const [mn, mx] = CAMS[S.cam]; const v = +slider.value; S.zoom = linToRatio(v, mn, mx); paintZoom(); log(`setLinearZoom(${v.toFixed(2)}f): ratio ${S.zoom.toFixed(1)}`); });
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-split' },
                  h('div', { class: 'md-col' },
                    h('div', { class: 'md-tags' }, afTag, zTag),
                    choice('device', Object.keys(CAMS), S.cam, v => { S.cam = v; S.zoom = 1; paintZoom(); const [mn, mx] = CAMS[v]; log(`zoomState: min ${mn}, max ${mx}`); }).el,
                    h('div', { class: 'controls' },
                      cmd('startFocusAndMetering(center)', () => focus(0.5, 0.5)),
                      cmd('setZoomRatio(0.6f)', () => zoomTo(0.6, 'setZoomRatio(0.6f)')),
                      cmd('setZoomRatio(2f)', () => zoomTo(2, 'setZoomRatio(2f)')),
                      cmd('setZoomRatio(20f)', () => zoomTo(20, 'setZoomRatio(20f)'))),
                    h('div', { class: 'controls' }, h('label', { class: 'md-label', for: 'md-d2-zoom' }, 'setLinearZoom'), slider)),
                  vf),
                logEl);
              el.append(root);
              setTag(afTag, 'AF: continuous', ''); paintZoom();
              log('Tap the viewfinder to focus there. Then try the zoom calls.');
            },
          },
          {
            title: 'Upright photos when the UI is locked',
            body: `<p>CameraX records each photo’s orientation, as EXIF data or rotated pixels, from the use case’s <code>targetRotation</code>. By default that is the display rotation. If your activity is locked to portrait, the display never rotates, so a photo taken with the phone held sideways is saved as if it were portrait and shows up sideways in the gallery.</p>
<p>Follow the physical orientation with an <code>OrientationEventListener</code> and update <code>imageCapture.targetRotation</code> as the user turns the phone. The preview stays the same, but every saved photo comes out the right way up.</p>`,
            code: `val orientationListener = object : OrientationEventListener(context) {
    override fun onOrientationChanged(degrees: Int) {
        if (degrees == ORIENTATION_UNKNOWN) return
        imageCapture.targetRotation = when (degrees) {
            in 45 until 135 -> Surface.ROTATION_270
            in 135 until 225 -> Surface.ROTATION_180
            in 225 until 315 -> Surface.ROTATION_90
            else -> Surface.ROTATION_0
        }
    }
}
// enable() when the camera screen starts, disable() when it stops`,
            visual(el) {
              const POSES = { portrait: [0, 0, 'ROTATION_0'], 'turned left': [90, 270, 'ROTATION_90'], 'upside down': [180, 180, 'ROTATION_180'] };
              const S = { pose: 'turned left', track: false, shots: 0 };
              const sky = h('span', { class: 'md-d2-sky' }, '↑ sky');
              const hand = h('div', { class: 'md-d2-hand', role: 'img', 'aria-label': 'Phone held by the user' }, sky);
              const thumbs = h('div', { class: 'md-thumbs', 'aria-label': 'Photos as the gallery shows them' });
              const rTag = tag(''), oTag = tag('');
              const { el: logEl, log } = logger(3);
              function paint() {
                const [turn, deg, rot] = POSES[S.pose];
                hand.style.transform = `rotate(${-turn}deg)`;
                sky.style.transform = `rotate(${turn}deg)`;
                setTag(oTag, `onOrientationChanged(${deg})`, '');
                setTag(rTag, `targetRotation: ${S.track ? rot : 'ROTATION_0'}`, S.track || !turn ? 'ok' : 'no');
              }
              function shoot() {
                const [turn] = POSES[S.pose];
                const off = S.track ? 0 : turn;
                S.shots++;
                thumbs.prepend(h('span', { class: 'md-d2-thumb drop-in' }, h('span', { class: 'md-d2-sky', style: `transform: rotate(${off}deg)` }, '↑')));
                while (thumbs.children.length > 6) thumbs.lastElementChild.remove();
                log(off ? `saved as portrait: <span class="bad">the sky points ${off === 90 ? 'right' : 'down'} in the gallery</span>` : '<span class="good">saved upright</span>');
              }
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, h('span', { class: 'md-tag' }, 'activity locked to portrait'), oTag, rTag),
                h('div', { class: 'md-d2-rot' },
                  h('div', { class: 'md-col' }, h('span', { class: 'md-label' }, 'how the user holds it'), hand),
                  h('div', { class: 'md-col' }, h('span', { class: 'md-label' }, 'gallery'), thumbs)),
                choice('phone', Object.keys(POSES), S.pose, v => { S.pose = v; paint(); }).el,
                h('div', { class: 'controls' },
                  toggle('md-d2-orient', 'update <code>targetRotation</code> from OrientationEventListener', false, v => { S.track = v; paint(); log(v ? 'listener enabled' : 'listener off: targetRotation stays at the display rotation'); }),
                  cmd('imageCapture.takePicture(...)', shoot)),
                logEl);
              el.append(root);
              paint();
              log('The phone is turned sideways, the UI is locked. Take a picture.');
            },
          },
        ],
        underHood: {
          body: `<p>CameraX is a layer over Camera2. When you bind, it collects one output surface per use case: the preview surface from your <code>SurfaceRequest</code>, an <code>ImageReader</code> for <code>ImageCapture</code>, another for <code>ImageAnalysis</code>, an encoder surface for video. It picks a size for each from the stream combinations the device reports as supported, opens the <code>CameraDevice</code>, and creates one capture session with all of those surfaces.</p>
<p>Preview and analysis run as a repeating request. <code>takePicture()</code> sends extra capture requests, and focus, zoom and torch change the parameters of the repeating request. A lifecycle observer opens the device on ON_START and closes it on ON_STOP. Closing also resets zoom, focus, torch and exposure to their defaults.</p>`,
        },
        mistakes: [
          {
            title: 'Binding to the process lifecycle',
            bad: `provider.bindToLifecycle(ProcessLifecycleOwner.get(), CameraSelector.DEFAULT_BACK_CAMERA, preview)`,
            good: `val owner = LocalLifecycleOwner.current      // the camera screen's lifecycle
provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, preview)`,
            why: 'The process lifecycle only stops when the whole app goes to the background. The camera stays open while the user is on other screens of your app, and keeps draining the battery.',
          },
          {
            title: 'Flipping to a camera that isn’t there',
            bad: `fun flip() {
    provider.unbindAll()
    provider.bindToLifecycle(owner, CameraSelector.DEFAULT_FRONT_CAMERA, preview, imageCapture)
}`,
            good: `fun flip() {
    if (!provider.hasCamera(CameraSelector.DEFAULT_FRONT_CAMERA)) return
    provider.unbindAll()
    provider.bindToLifecycle(owner, CameraSelector.DEFAULT_FRONT_CAMERA, preview, imageCapture)
}`,
            why: '<code>bindToLifecycle()</code> throws <code>IllegalArgumentException</code> when no camera matches the selector, which happens on some tablets, TVs and Chromebooks. Check with <code>hasCamera()</code> and hide the flip button when there is only one camera.',
          },
        ],
        predict: {
          q: "Use cases are bound with <code>bindToLifecycle()</code>. The user presses Home and comes back. What does your code have to do?",
          options: ["Call <code>bindToLifecycle()</code> again in <code>onResume()</code>", "Nothing: CameraX reopens the camera when the lifecycle starts again", "Ask for the <code>CAMERA</code> permission again"],
          a: 1,
          why: "The binding follows the lifecycle owner. The camera closes on stop and opens again on start, with no code from you.",
        },
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

      videoCaptureLesson,

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
          { q: 'Text recognition finds nothing while the phone is held upright, but works when it is held sideways. What is the likely cause?', options: ['The analysis resolution is too high', 'The frames arrive sideways and rotationDegrees is not passed to the detector', 'KEEP_ONLY_LATEST drops the frames that contain text'], a: 1, why: 'The sensor is mounted in landscape and CameraX does not rotate pixels. Pass image.imageInfo.rotationDegrees to the detector.' },
          { q: 'Which line stops the analyzer from getting new frames?<pre class="code mini">setAnalyzer(exec) { image -&gt;\n  val buf = image.planes[0].buffer   // 1\n  if (!ready) return@setAnalyzer     // 2\n  detect(buf)                        // 3\n  image.close()                      // 4\n}</pre>', options: ['Line 1', 'Line 2', 'Line 3'], a: 1, why: 'The early return skips close(), so CameraX holds back the next frame. Close in a finally block, or on every path.' },
          { q: 'Your own model needs RGB pixels as a Bitmap. Which setup fits best?', options: ['Keep YUV_420_888 and write your own conversion', 'Ask for OUTPUT_IMAGE_FORMAT_RGBA_8888 and call toBitmap()', 'Take a photo with ImageCapture for every frame'], a: 1, why: 'CameraX converts each frame to RGBA for you, at some cost per frame. Keep the YUV default when ML Kit is the consumer.' },
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
        predict: {
          q: "The analyzer takes 120 ms per frame and uses <code>STRATEGY_BLOCK_PRODUCER</code> with a queue of 6. What happens to the delay between a frame and its result?",
          options: ["It stays the same", "It grows, until the queue is full and the camera stalls", "It shrinks as the queue warms up"],
          a: 1,
          why: "Frames arrive every 33 ms but leave every 120 ms, so the queue fills and each result is older than the last.",
        },
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
          { q: 'A phone lies flat and still on a table. What does TYPE_LINEAR_ACCELERATION report on z?', options: ['About 9.81 m/s²', 'About 0 m/s²', 'About -9.81 m/s²'], a: 1, why: 'Linear acceleration has gravity removed, so a still phone reads about 0. TYPE_GRAVITY would show the 9.81.' },
          { q: 'A tilt game reads x as left and right. It works in portrait, but in landscape the ball rolls the wrong way. Why?', options: ['The sampling rate is too slow for landscape', 'Sensor axes stay fixed to the natural orientation; remap them using the display rotation', 'Landscape mode needs TYPE_GRAVITY instead of the accelerometer'], a: 1, why: 'The screen rotates but the axes do not. Read the display rotation and remap, or use remapCoordinateSystem() for rotation matrices.' },
        ],
        deeper: [
          {
            title: 'Gravity and motion are separate sensors',
            body: `<p>The accelerometer mixes two things: gravity, which says how the phone is tilted, and the push of the user’s hand. Android splits them for you. <code>TYPE_GRAVITY</code> reports only gravity, and <code>TYPE_LINEAR_ACCELERATION</code> only the movement. The two add up to what the accelerometer reports. On devices with a gyroscope both are fused from several sensors, which is faster and cleaner than a low-pass filter you write yourself.</p>
<p>For angles, such as a compass heading, use <code>TYPE_ROTATION_VECTOR</code> with <code>getRotationMatrixFromVector()</code> and <code>getOrientation()</code>. Shake, tilt and lift the phone below, and watch the z axis of each sensor.</p>`,
            code: `val gravity = sensors.getDefaultSensor(Sensor.TYPE_GRAVITY)
val linear = sensors.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
val rotation = sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)

override fun onSensorChanged(event: SensorEvent) {
    if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
        val matrix = FloatArray(9)
        val angles = FloatArray(3)
        SensorManager.getRotationMatrixFromVector(matrix, event.values)
        SensorManager.getOrientation(matrix, angles)        // azimuth, pitch, roll in radians
        showHeading(Math.toDegrees(angles[0].toDouble()))
    }
}`,
            visual(el) {
              const N = 60, G = 9.81, LO = -8, HI = 16;
              const S = { target: 0, cur: 0, shake: 0, lift: 0, t: 0 };
              const KEYS = [['acc', 'accelerometer', ''], ['grav', 'gravity', 'md-d2-grav'], ['lin', 'linear accel.', 'md-d2-lin']];
              const data = { acc: [], grav: [], lin: [] };
              const NS = 'http://www.w3.org/2000/svg';
              const lines = {}, vals = {};
              const laneEls = KEYS.map(([k, name, cls]) => {
                const svg = document.createElementNS(NS, 'svg');
                svg.setAttribute('class', 'md-d2-spark'); svg.setAttribute('viewBox', `0 0 ${N - 1} ${HI - LO}`); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
                const pl = document.createElementNS(NS, 'polyline'); if (cls) pl.setAttribute('class', cls); svg.append(pl);
                lines[k] = pl; vals[k] = h('span', { class: 'md-kv' });
                return lane(name, svg);
              });
              const { el: logEl, log } = logger(3);
              function sample() {
                S.t++;
                const prev = S.cur;
                S.cur += (S.target - S.cur) * 0.18;
                const gz = G * Math.cos(S.cur);
                let lz = (S.cur - prev) * -14;
                if (S.shake > 0) { lz += 6 * Math.sin(S.t * 1.9); S.shake--; }
                if (S.lift > 0) { lz += S.lift > 6 ? 5 : -3.5; S.lift--; }
                const v = { acc: gz + lz, grav: gz, lin: lz };
                for (const [k] of KEYS) { data[k].push(v[k]); if (data[k].length > N) data[k].shift(); }
                for (const [k, name] of KEYS) {
                  lines[k].setAttribute('points', data[k].map((y, i) => `${i + N - data[k].length},${(HI - Math.max(LO, Math.min(HI, y))).toFixed(2)}`).join(' '));
                  vals[k].innerHTML = `${name} z <b>${v[k].toFixed(2)}</b>`;
                }
              }
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-kvs' }, KEYS.map(([k]) => vals[k])),
                h('div', { class: 'timeline' }, laneEls),
                h('div', { class: 'controls' },
                  act('Shake', () => { S.shake = 18; log('shake: the accelerometer and linear acceleration swing, <span class="good">gravity holds still</span>'); }),
                  act('Tilt 60°', () => { S.target = Math.PI / 3; log('tilt: gravity z drops to about 4.9, <span class="muted">linear only blips while it moves</span>'); }),
                  act('Lay flat', () => { S.target = 0; log('flat: gravity z back to 9.81'); }),
                  act('Lift quickly', () => { S.lift = 12; log('lift: linear z goes up, then down as you stop'); })),
                logEl);
              el.append(root);
              log('The phone lies flat. Try each motion.');
              every(root, 80, sample);
            },
          },
          {
            title: 'Batching: every sample, fewer wake-ups',
            body: `<p>Pass a <code>maxReportLatencyUs</code> to <code>registerListener()</code> and the sensor hardware stores events in its FIFO, then delivers them in bursts. You still get every sample with its original timestamp, but your app runs once per batch instead of once per event, and the main processor can sleep in between. Step counters and fitness tracking rely on this.</p>
<p>It only works if the device has a FIFO for that sensor. <code>sensor.fifoMaxEventCount</code> is 0 when it doesn’t, and events then arrive one by one as usual. Call <code>flush()</code> when you need the stored events right away, for example when the user opens the screen.</p>`,
            code: `val sensor = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) ?: return
sensors.registerListener(
    listener,
    sensor,
    20_000,         // sample every 20 ms
    5_000_000,      // but deliver at most every 5 s
)
val canBatch = sensor.fifoMaxEventCount > 0

// the user opened the screen: deliver what is stored now
sensors.flush(listener)`,
            visual(el) {
              const LAT = ['0', '1 s', '5 s'];
              const S = { lat: '5 s', fifo: true, t: 0, last: 0, wakes: 0, maxWait: 0, flushes: 0 };
              const evFill = h('span', { class: 'md-d2-dense' });
              const wakeTrack = h('div', { class: 'lane-track' });
              const evTrack = h('div', { class: 'lane-track' }, evFill);
              const cursor = h('div', { class: 'cursor', style: 'left:0' });
              evTrack.append(cursor);
              const stat = label => { const b = h('b', {}, '0'); return { b, box: h('div', { class: 'md-stat' }, b, h('small', {}, label)) }; };
              const sEv = stat('events delivered'), sWake = stat('app wake-ups'), sWait = stat('longest wait for an event');
              const { el: logEl, log } = logger(3);
              const latency = () => (S.fifo ? { '0': 0, '1 s': 1, '5 s': 5 }[S.lat] : 0);
              function reset() { S.t = 0; S.last = 0; S.wakes = 0; S.maxWait = 0; wakeTrack.replaceChildren(); }
              function deliver(note) {
                S.wakes++; S.maxWait = Math.max(S.maxWait, S.t - S.last); S.last = S.t;
                wakeTrack.append(h('span', { class: 'md-tick drop-in', style: `left:${(S.t * 10).toFixed(1)}%` }));
                if (note) log(note);
              }
              function tick() {
                S.t = Math.round((S.t + 0.1) * 10) / 10;
                if (S.t > 10) reset();
                const lat = latency();
                const dense = lat === 0;
                evFill.style.width = `${S.t * 10}%`;
                cursor.style.left = `${S.t * 10}%`;
                if (dense) {
                  S.wakes = Math.round(S.t * 50); S.last = S.t; S.maxWait = 0.02;
                  wakeTrack.replaceChildren(h('span', { class: 'md-d2-dense md-d2-hot', style: `width:${S.t * 10}%` }));
                } else if (S.t - S.last >= lat) deliver();
                const delivered = dense ? Math.round(S.t * 50) : Math.round(S.last * 50);
                sEv.b.textContent = String(delivered);
                sWake.b.textContent = String(S.wakes);
                sWait.b.textContent = S.maxWait < 0.1 ? '20 ms' : `${S.maxWait.toFixed(1)} s`;
                sWake.box.classList.toggle('md-bad', S.wakes > 50);
              }
              const root = h('div', { class: 'md-root' },
                choice('maxReportLatency', LAT, S.lat, v => { S.lat = v; reset(); log(v === '0' ? 'latency 0: <span class="bad">one wake-up per event</span>, 50 a second' : `latency ${v}: events wait in the FIFO, then arrive together`); }).el,
                h('div', { class: 'controls' },
                  toggle('md-d2-fifo', 'device has a sensor FIFO', true, v => { S.fifo = v; reset(); log(v ? 'fifoMaxEventCount > 0: batching works' : '<span class="bad">fifoMaxEventCount == 0:</span> the latency is ignored'); }),
                  cmd('sensors.flush(listener)', () => {
                    if (latency() === 0) { log('<span class="muted">nothing is waiting: events already arrive one by one</span>'); return; }
                    deliver('flush(): <span class="good">stored events delivered now</span>, then batching continues');
                  })),
                h('div', { class: 'timeline' },
                  h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'sensor 50 Hz'), evTrack),
                  h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'app runs'), wakeTrack)),
                h('div', { class: 'md-stats' }, sEv.box, sWake.box, sWait.box),
                logEl);
              el.append(root);
              log('Ten seconds of accelerometer data, batched every 5 s. Try a latency of 0.');
              every(root, 100, tick);
            },
          },
          {
            title: 'The axes don’t turn with the screen',
            body: `<p>Sensor axes are fixed to the device’s natural orientation. Turn a phone to landscape and the screen rotates, but x still runs along the phone’s short edge. A tilt game that reads x as left and right breaks in landscape. On a tablet whose natural orientation is landscape, it breaks in portrait.</p>
<p>Read the display rotation and remap the values before you use them. For rotation-vector math, <code>SensorManager.remapCoordinateSystem()</code> does the same for a rotation matrix.</p>`,
            code: `override fun onSensorChanged(event: SensorEvent) {
    val x = event.values[0]
    val y = event.values[1]
    val (screenX, screenY) = when (display.rotation) {   // context.display, API 30+
        Surface.ROTATION_90 -> -y to x
        Surface.ROTATION_180 -> -x to -y
        Surface.ROTATION_270 -> y to -x
        else -> x to y
    }
    moveBall(-screenX, screenY)
}`,
          },
        ],
        underHood: {
          body: `<p>Your app never talks to the hardware. <code>SensorService</code> in the system process owns the sensors, often running on a low-power sensor hub. It sets each sensor to the fastest rate and the shortest report latency that any app asked for, then sends every app its events over a channel that the app reads on its <code>Looper</code>. That is why the rate you ask for is a hint, and events can arrive faster than requested.</p>
<p>Without a <code>Handler</code>, <code>onSensorChanged()</code> runs on the main thread. The <code>SensorEvent</code> objects are recycled by the framework, so the values array can be overwritten after your callback returns. That is why the lesson’s flow sends a copy.</p>`,
        },
        mistakes: [
          {
            title: 'Heavy work in onSensorChanged on the main thread',
            bad: `sensors.registerListener(object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent) {
        _steps.value = model.classify(event.values)   // 8 ms, 50 times a second
    }
    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) = Unit
}, sensor, SensorManager.SENSOR_DELAY_GAME)`,
            good: `val thread = HandlerThread("sensors").apply { start() }
sensors.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_GAME, Handler(thread.looper))
// onSensorChanged now runs on "sensors". Quit the thread when you unregister.`,
            why: 'Without a Handler, events arrive on the main thread. At GAME rate that is 50 calls a second competing with drawing frames. Give heavy listeners their own thread and post only results to the UI.',
          },
          {
            title: 'Assuming the sensor exists',
            bad: `val gyro = sensors.getDefaultSensor(Sensor.TYPE_GYROSCOPE)!!`,
            good: `val gyro = sensors.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
if (gyro == null) showTiltButtons() else register(gyro)
// manifest: <uses-feature android:name="android.hardware.sensor.gyroscope" android:required="false" />`,
            why: 'Some phones, tablets and Chromebooks have no gyroscope, and the app crashes there. Plan a fallback, and mark the feature as optional so Google Play still offers the app on those devices.',
          },
          {
            title: 'Comparing sensor timestamps with wall time',
            bad: `val ageMs = System.currentTimeMillis() - event.timestamp`,
            good: `val ageMs = (SystemClock.elapsedRealtimeNanos() - event.timestamp) / 1_000_000`,
            why: '<code>event.timestamp</code> is in nanoseconds, on the same clock as <code>elapsedRealtimeNanos()</code>. It is not wall time, so mixing the two gives nonsense ages.',
          },
        ],
        predict: {
          q: "You switch the sampling rate from <code>SENSOR_DELAY_UI</code> to <code>SENSOR_DELAY_FASTEST</code>. What changes?",
          options: ["Readings arrive much more often and the sensor draws more power", "Readings get more accurate at the same power", "Nothing: the rate is fixed by the hardware"],
          a: 0,
          why: "The rate is how often events are delivered. Faster means more work for the sensor hub and your code.",
        },
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
    .setCircularRegion(51.5074, -0.1278, 150f)
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
          { q: 'Right after a phone restart, <code>lastLocation</code> returns null. Why?', options: ['The restart revoked the location permission', 'No fix has been computed since the restart; ask for a fresh one with getCurrentLocation()', 'lastLocation only works with ACCESS_FINE_LOCATION'], a: 1, why: 'lastLocation returns a cached fix and is null when nothing has asked for location yet. getCurrentLocation() computes a new one.' },
          { q: 'A run tracker sets a 10 second interval and <code>setMaxUpdateDelayMillis</code> of 2 minutes. How does the callback run?', options: ['Every 10 seconds with one location', 'About every 2 minutes with about 12 locations, oldest first', 'About every 2 minutes with only the newest location'], a: 1, why: 'The provider collects fixes and delivers them together in result.locations. The track is the same and the app wakes far less often.' },
          { q: 'Permission is granted, but the user switched off Location for the whole device. What should the app do?', options: ['Request the location permission again', 'Call checkLocationSettings() and launch the ResolvableApiException resolution', 'Fall back to PRIORITY_PASSIVE'], a: 1, why: 'With device location off, requests succeed but no fixes arrive. The resolution shows a system dialog that turns Location on without leaving your app.' },
        ],
        deeper: [
          {
            title: 'One fix: cached or fresh',
            body: `<p>For a single position there are two calls. <code>lastLocation</code> returns the most recent fix the device already has. It is instant and costs nothing, but it can be minutes old, and it is null after a restart or when nothing has asked for location yet. <code>getCurrentLocation()</code> computes a fresh fix, which can take seconds and turns the radios on.</p>
<p>A <code>CurrentLocationRequest</code> sits in between. <code>setMaxUpdateAgeMillis()</code> accepts a cached fix younger than that and only computes a new one when needed. Pass a <code>CancellationToken</code> and cancel it when the screen goes away, so a slow fix doesn’t keep the GPS on for nobody.</p>`,
            code: `// await() comes from kotlinx-coroutines-play-services
val cached: Location? = client.lastLocation.await()      // may be null, may be old

val request = CurrentLocationRequest.Builder()
    .setPriority(Priority.PRIORITY_BALANCED_POWER_ACCURACY)
    .setMaxUpdateAgeMillis(5 * 60_000L)                   // a fix up to 5 min old is fine
    .build()
val tokenSource = CancellationTokenSource()
val fix: Location? = client.getCurrentLocation(request, tokenSource.token).await()

// the screen closed before the fix arrived:
tokenSource.cancel()`,
            visual(el) {
              const S = { t: 0, x: 22, cache: { x: 22, y: 52, at: -4 }, tok: 0, pending: false };
              const Y = 52;
              const map = h('div', { class: 'md-map', 'aria-label': 'Map with your position and the returned fix' });
              const you = h('span', { class: 'md-you' });
              map.append(you, h('span', { class: 'md-scale' }, 'not to scale'));
              const circ = (cls, x, y, d) => h('div', { class: 'md-circ ' + cls, style: `left:${x}%;top:${y}%;width:${d}%;margin-left:${-d / 2}%;margin-top:${-d / 2}%` }, h('span', { class: 'md-c' }));
              let shown = null;
              const cTag = tag(''), rTag = tag('');
              const { el: logEl, log } = logger(4);
              const age = () => S.cache ? S.t - S.cache.at : null;
              function paint() {
                you.style.left = `${S.x}%`; you.style.top = `${Y}%`;
                setTag(cTag, S.cache ? `cached fix: ${age()} min old` : 'cached fix: none', S.cache ? (age() > 5 ? 'wait' : 'ok') : 'no');
                setTag(rTag, S.pending ? 'radios on: computing a fix' : 'radios idle', S.pending ? 'wait' : '');
              }
              function showFix(x, y, old) {
                if (shown) shown.remove();
                shown = circ('md-fix' + (old ? ' md-old' : ''), x, y, 10);
                map.insertBefore(shown, you);
              }
              async function fresh() {
                const my = ++S.tok; S.pending = true; paint();
                log('no usable cached fix: <span class="muted">turning radios on…</span>');
                await sleep(1800); if (my !== S.tok || !map.isConnected) return;
                S.pending = false; S.cache = { x: S.x, y: Y, at: S.t };
                showFix(S.x, Y, false); replay(shown, 'pop');
                log('<span class="good">fresh fix</span>, right where you are'); paint();
              }
              function current(maxAge) {
                if (S.pending) { log('<span class="muted">a request is already running</span>'); return; }
                if (maxAge > 0 && S.cache && age() <= maxAge) {
                  showFix(S.cache.x, S.cache.y, age() > 0);
                  log(`returned the cached fix, <span class="good">${age()} min old</span>, instantly`); return;
                }
                fresh();
              }
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-tags' }, cTag, rTag),
                map,
                h('div', { class: 'controls' },
                  cmd('lastLocation.await()', () => {
                    if (!S.cache) { replay(map, 'shake'); log('<span class="bad">null</span>: nothing cached since the restart'); return; }
                    showFix(S.cache.x, S.cache.y, age() > 0);
                    log(`instant, but ${age()} min old: ${Math.abs(S.cache.x - S.x) > 4 ? '<span class="bad">you are no longer there</span>' : 'still close to you'}`);
                  }),
                  cmd('getCurrentLocation(maxUpdateAge = 5 min)', () => current(5)),
                  cmd('getCurrentLocation(maxUpdateAge = 0)', () => current(0)),
                  cmd('tokenSource.cancel()', () => {
                    if (!S.pending) { log('<span class="muted">nothing to cancel</span>'); return; }
                    S.tok++; S.pending = false; paint();
                    log('request cancelled: <span class="good">radios off</span>, the task gets no result');
                  })),
                h('div', { class: 'controls' },
                  act('Walk for 3 minutes', () => {
                    S.t += 3; S.x = S.x >= 76 ? 22 : S.x + 18; paint();
                    log(`3 minutes later, ${S.cache ? `the cached fix is ${age()} min old` : 'still nothing cached'}`);
                  }),
                  act('Restart the phone', () => {
                    S.cache = null; S.tok++; S.pending = false; if (shown) { shown.remove(); shown = null; }
                    paint(); log('restarted: <span class="muted">no cached location</span>');
                  })),
                logEl);
              el.append(root);
              paint();
              log('A fix from 4 minutes ago is cached. Ask for a location.');
            },
          },
          {
            title: 'When device location is off',
            body: `<p>Permission is not enough. The user can switch off Location for the whole device. Your request still succeeds, but no fixes arrive, and <code>lastLocation</code> stays null.</p>
<p>Check first with <code>SettingsClient.checkLocationSettings()</code>. If a setting your request needs is off, the task fails with a <code>ResolvableApiException</code>. Launch its resolution, and the user gets a system dialog to turn Location on without leaving your app.</p>`,
            code: `val settingsLauncher = registerForActivityResult(
    ActivityResultContracts.StartIntentSenderForResult()
) { result -> if (result.resultCode == Activity.RESULT_OK) startUpdates() else showCityPicker() }

fun checkThenStart(request: LocationRequest) {
    val settings = LocationSettingsRequest.Builder().addLocationRequest(request).build()
    LocationServices.getSettingsClient(this).checkLocationSettings(settings)
        .addOnSuccessListener { startUpdates() }
        .addOnFailureListener { e ->
            if (e is ResolvableApiException) {
                settingsLauncher.launch(IntentSenderRequest.Builder(e.resolution).build())
            }
        }
}`,
            visual(el) {
              const S = { loc: false, updates: false, dialog: false, n: 0, quiet: 0 };
              const track = h('div', { class: 'lane-track' });
              const tile = tag('');
              const shade = h('div', { class: 'md-col' });
              const ph = h('div', { class: 'md-phone' }, h('div', { class: 'md-sb' }, h('span', {}, '9:41'), h('span', {}, '')), h('div', { class: 'md-pscreen' }, shade));
              const { el: logEl, log } = logger(4);
              function paint() {
                setTag(tile, S.loc ? 'device Location: on' : 'device Location: off', S.loc ? 'ok' : 'no');
                ph.querySelector('.md-sb').lastChild.textContent = S.loc && S.updates ? 'location' : '';
                shade.replaceChildren(...(S.dialog
                  ? [h('div', { class: 'md-noti drop-in' }, h('b', {}, 'Turn on device location?'), h('small', { class: 'muted-text' }, 'Asked by the system for this app.'),
                    h('div', { class: 'md-nbtns' },
                      h('button', { type: 'button', class: 'md-nbtn', onclick: () => answer(false) }, 'No thanks'),
                      h('button', { type: 'button', class: 'md-nbtn md-main', onclick: () => answer(true) }, 'Turn on')))]
                  : [h('div', { class: 'md-appui' }, h('b', {}, 'Run tracker'), h('span', { class: 'muted-text' }, S.updates ? (S.loc ? `${S.n} fixes so far` : 'waiting for a fix…') : 'Tap start'))]));
              }
              function answer(ok) {
                S.dialog = false;
                if (ok) { S.loc = true; S.updates = true; log('RESULT_OK: Location is on, <span class="good">startUpdates()</span>'); }
                else log('RESULT_CANCELED: <span class="muted">offer a fallback, such as picking a city</span>');
                paint();
              }
              function tick() {
                if (!S.updates) return;
                if (!S.loc) { if (++S.quiet === 8) log('<span class="bad">no fixes:</span> the request succeeded, but device location is off'); return; }
                S.quiet = 0; S.n++;
                track.append(h('span', { class: 'md-tick drop-in', style: `left:${((S.n % 24) * 4 + 2)}%` }));
                if (S.n % 24 === 0) track.replaceChildren();
                paint();
              }
              let qs;
              const root = h('div', { class: 'md-root' },
                h('div', { class: 'md-split' },
                  h('div', { class: 'md-col' },
                    h('div', { class: 'md-tags' }, tile),
                    h('div', { class: 'controls' },
                      cmd('requestLocationUpdates(request, callback, looper)', () => {
                        S.updates = true; S.quiet = 0; S.dialog = false;
                        log(S.loc ? 'updates requested: <span class="good">fixes flow</span>' : 'updates requested: <span class="muted">the call returns fine…</span>');
                        paint();
                      }),
                      cmd('checkLocationSettings(settings)', () => {
                        if (S.loc) { S.updates = true; log('onSuccess: settings are fine, <span class="good">startUpdates()</span>'); paint(); return; }
                        S.updates = false; S.dialog = true; replay(ph, 'pop');
                        log('onFailure: <span class="bad">ResolvableApiException</span>, launch its resolution'); paint();
                      }),
                      qs = act('Quick Settings: Location off', () => {
                        S.loc = !S.loc; qs.textContent = S.loc ? 'Quick Settings: Location off' : 'Quick Settings: Location on';
                        S.quiet = 0; log(S.loc ? 'the user turned Location on' : 'the user turned Location off'); paint();
                      }),
                      act('Stop', () => { S.updates = false; S.dialog = false; track.replaceChildren(); log('removeLocationUpdates(callback)'); paint(); })),
                    h('div', { class: 'timeline' }, h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, 'fixes'), track))),
                  ph),
                logEl);
              qs.textContent = 'Quick Settings: Location on';
              el.append(root);
              paint();
              log('Permission is granted, but device Location is off. Start updates both ways.');
              every(root, 400, tick);
            },
          },
          {
            title: 'Batch fixes you don’t need right away',
            body: `<p>A run tracker needs every point, but not the moment it is measured. <code>setMaxUpdateDelayMillis()</code> lets the provider collect fixes and deliver them together. With a 10 second interval and a 2 minute maximum delay, your callback runs about every 2 minutes with about 12 locations in <code>result.locations</code>, oldest first. The track is the same, and the app wakes up far less often.</p>`,
            code: `val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10_000L)
    .setMaxUpdateDelayMillis(120_000L)
    .build()

val callback = object : LocationCallback() {
    override fun onLocationResult(result: LocationResult) {
        track.addAll(result.locations)      // oldest first
    }
}`,
          },
        ],
        underHood: {
          body: `<p>The fused provider runs inside Google Play services, not in your app. It merges the requests of every app on the device and runs the hardware for the most demanding one. If a navigation app already runs GPS every second, your balanced request adds little: you get fixes from the same work, limited by your own interval settings. <code>PRIORITY_PASSIVE</code> is the extreme case, which only ever listens.</p>
<p>Approximate location is blurred before your app sees it. The fix is shifted by a random offset that changes only slowly and snapped to a coarse grid, so repeated requests can’t be averaged back into a precise position. Geofences are also checked by the system with low-power signals, which is why an enter event can arrive minutes late and why the docs recommend a radius of at least 100 to 150 meters.</p>`,
        },
        mistakes: [
          {
            title: 'Requesting precise location alone',
            bad: `launcher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION))`,
            good: `launcher.launch(
    arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
    )
)`,
            why: 'Apps targeting Android 12 or higher must ask for both. Alone, the system logs “ACCESS_FINE_LOCATION must be requested with ACCESS_COARSE_LOCATION”, and some Android 12 releases ignore the request entirely.',
          },
          {
            title: 'GPS every second for a city name',
            bad: `// weather screen
val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1_000L).build()
client.requestLocationUpdates(request, callback, Looper.getMainLooper())`,
            good: `// weather screen: one city-level fix is enough
val fix = client.getCurrentLocation(Priority.PRIORITY_LOW_POWER, tokenSource.token).await()`,
            why: 'A weather forecast needs the city, once. High accuracy at one second keeps GPS running and drains the battery. Match the priority and frequency to what the feature shows.',
          },
          {
            title: 'Starting the location service from the background',
            bad: `// BroadcastReceiver, while the app is in the background
override fun onReceive(context: Context, intent: Intent) {
    context.startForegroundService(Intent(context, TrackingService::class.java))
}`,
            good: `// Activity: the user tapped "Start run" while the app is visible
startRunButton.setOnClickListener {
    ContextCompat.startForegroundService(this, Intent(this, TrackingService::class.java))
}`,
            why: 'While-in-use location only carries over to a foreground service that starts while the app is visible. Started from the background, the service gets no location without <code>ACCESS_BACKGROUND_LOCATION</code>, and since Android 12 most background starts of foreground services are blocked anyway.',
          },
        ],
        predict: {
          q: "You change the request from <code>PRIORITY_BALANCED_POWER_ACCURACY</code> to <code>PRIORITY_HIGH_ACCURACY</code>. What do you expect?",
          options: ["Tighter fixes, and the battery drains faster", "The same fixes for less battery", "Fewer fixes, but each one is exact"],
          a: 0,
          why: "High accuracy turns on GPS, which costs the most. Balanced settles for about city-block accuracy from Wi-Fi and cell.",
        },
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
