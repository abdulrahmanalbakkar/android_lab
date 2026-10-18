/* Operating systems track. Same shape as tracks/kotlin.js.
   University OS course topics (kernel, processes, threads, memory, IPC, files, power), each followed by where
   the idea shows up on Android, which runs on a Linux kernel. Every class is prefixed osy-. */
(() => {
  const { h, sleep, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const label = text => h('span', { class: 'osy-label' }, text);
  const pill = (text, cls = '') => h('span', { class: `osy-pill ${cls}` }, String(text));
  function stats(names) {
    const vals = {};
    const root = h('div', { class: 'osy-stats' }, names.map(n => { const b = h('b', {}, '-'); vals[n] = b; return h('span', { class: 'osy-stat' }, `${n} `, b); }));
    root.set = (n, v) => { if (vals[n].textContent !== String(v)) { vals[n].textContent = String(v); replay(vals[n], 'pop-soft'); } };
    return root;
  }
  // One running animation per demo: start() bumps a token, live(t) says whether that run should keep going.
  function runner(el) {
    let tok = 0;
    return { start: () => ++tok, live: t => t === tok && el.isConnected, stop: () => { tok++; } };
  }

  const css = `
.osy-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.osy-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.osy-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.osy-stats { display: flex; flex-wrap: wrap; gap: 4px 16px; min-width: 0; }
.osy-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.osy-stat b { color: var(--ink); display: inline-block; }
.osy-pill { font: 600 0.78rem var(--mono); padding: 2px 8px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s; }
.osy-pill.osy-acc { border-color: var(--accent); background: var(--accent-soft); }
.osy-pill.osy-warm { border-color: var(--warm); background: var(--warm-soft); }
.osy-pill.osy-ok { border-color: var(--ok); background: var(--ok-soft); }
.osy-pill.osy-err { border-color: var(--err); background: var(--err-soft); }
.osy-pill.osy-ghost { border-style: dashed; color: var(--muted); background: transparent; }
.osy-note { font-size: 0.85rem; color: var(--muted); margin: 0; overflow-wrap: anywhere; }

/* layer stack */
.osy-stack { display: grid; gap: 4px; min-width: 0; }
.osy-layer { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; align-items: center; padding: 7px 12px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.2s, background 0.2s, transform 0.2s; }
.osy-layer b { font: 700 0.9rem var(--display); color: var(--ink); overflow-wrap: anywhere; }
.osy-layer small { grid-column: 1 / -1; font: 500 0.74rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.osy-layer.osy-kern { background: var(--sunk); }
.osy-layer.osy-on { border-color: var(--accent); background: var(--accent-soft); transform: translateX(4px); }
.osy-layer.osy-kon { border-color: var(--warm); background: var(--warm-soft); transform: translateX(4px); }
.osy-layer.osy-seen { border-color: var(--accent); }
.osy-gap { font: 600 0.68rem var(--mono); color: var(--warm); text-align: center; border-top: 2px dashed var(--warm); padding-top: 3px; margin-top: 3px; overflow-wrap: anywhere; }

/* process tree */
.osy-tree { display: grid; gap: 5px; min-width: 0; }
.osy-proc { display: grid; gap: 2px; padding: 6px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-width: 0; margin-left: calc(var(--d, 0) * 18px); transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.osy-proc.osy-new { border-style: dashed; border-color: var(--accent); animation: osy-grow 0.45s ease-out; }
.osy-proc.osy-hot { border-color: var(--accent); background: var(--accent-soft); }
.osy-proc.osy-dead { opacity: 0.45; border-style: dashed; }
.osy-proc.osy-deny { border-color: var(--err); background: var(--err-soft); }
.osy-ptop { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; min-width: 0; }
.osy-pname { font: 700 0.85rem var(--mono); color: var(--ink); overflow-wrap: anywhere; min-width: 0; }
.osy-pmeta { font: 500 0.72rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
@keyframes osy-grow { from { transform: translateY(-8px) scale(0.96); opacity: 0; } }

/* timelines */
.osy-tl { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 2px; min-width: 0; }
.osy-cell { height: 20px; border-radius: 3px; background: var(--sunk); min-width: 0; font: 700 0.55rem/20px var(--mono); text-align: center; color: var(--ink); overflow: hidden; transition: background 0.15s; }
.osy-cell.osy-c-main { background: var(--accent); color: var(--accent-ink); }
.osy-cell.osy-c-work { background: var(--ok); color: var(--surface); }
.osy-cell.osy-c-other { background: var(--muted); color: var(--surface); }
.osy-cell.osy-c-block { background: var(--err-soft); box-shadow: inset 0 0 0 2px var(--err); }
.osy-cell.osy-c-wait { background: var(--warm-soft); box-shadow: inset 0 0 0 2px var(--warm); }
.osy-cell.osy-c-ok { background: var(--ok-soft); box-shadow: inset 0 0 0 2px var(--ok); }
.osy-cell.osy-c-miss { background: var(--err); color: var(--surface); }
.osy-cell.osy-c-active { background: var(--err); }
.osy-cell.osy-c-idle { background: var(--warm); }
.osy-cell.osy-c-sleep { background: var(--ok-soft); box-shadow: inset 0 0 0 1px var(--ok); }
.osy-cell.osy-c-lock { background: var(--err-soft); box-shadow: inset 0 0 0 2px var(--err); }
.osy-tlrow { display: grid; gap: 3px; min-width: 0; }
.osy-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font: 500 0.72rem var(--mono); color: var(--muted); }
.osy-key { display: inline-flex; gap: 5px; align-items: center; }
.osy-key i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }

/* memory */
.osy-vm { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-width: 0; }
.osy-col { display: grid; gap: 5px; align-content: start; min-width: 0; }
.osy-vpage { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0 8px; text-align: left; padding: 5px 8px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); font: 600 0.74rem var(--mono); cursor: pointer; min-width: 0; transition: border-color 0.2s, background 0.2s; }
.osy-vpage:hover { border-color: var(--accent); }
.osy-vpage span { overflow-wrap: anywhere; min-width: 0; }
.osy-vpage em { grid-column: 2; font-style: normal; font-weight: 500; color: var(--muted); font-size: 0.68rem; overflow-wrap: anywhere; }
.osy-vpage.osy-hit { border-color: var(--ok); background: var(--ok-soft); }
.osy-vpage.osy-fault { border-color: var(--warm); background: var(--warm-soft); }
.osy-frames { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; min-width: 0; }
.osy-frame { display: grid; gap: 1px; padding: 5px 7px; border-radius: 8px; border: 2px solid var(--line); background: var(--sunk); min-height: 44px; min-width: 0; font: 600 0.68rem var(--mono); color: var(--muted); transition: border-color 0.2s, background 0.2s; }
.osy-frame b { color: var(--ink); overflow-wrap: anywhere; font-size: 0.7rem; }
.osy-frame.osy-f-shared { border-color: var(--accent); background: var(--accent-soft); }
.osy-frame.osy-f-a { border-color: var(--warm); background: var(--warm-soft); }
.osy-frame.osy-f-b { border-color: var(--ok); background: var(--ok-soft); }
.osy-frame.osy-f-file { border-color: var(--muted); background: var(--surface); }
.osy-frame.osy-flash { animation: osy-grow 0.4s ease-out; }
@media (max-width: 460px) { .osy-frames { grid-template-columns: minmax(0, 1fr); } }

/* RAM bar and process list */
.osy-ram { display: flex; height: 26px; border-radius: 8px; overflow: hidden; background: var(--sunk); border: 2px solid var(--line); min-width: 0; }
.osy-seg { height: 100%; min-width: 0; transition: width 0.35s ease-out, background 0.2s; border-right: 1px solid var(--bg); font: 700 0.6rem/22px var(--mono); color: var(--surface); text-align: center; overflow: hidden; white-space: nowrap; }
.osy-seg.osy-s-sys { background: var(--muted); }
.osy-seg.osy-s-fg { background: var(--accent); color: var(--accent-ink); }
.osy-seg.osy-s-mid { background: var(--ok); }
.osy-seg.osy-s-cache { background: var(--warm); }
.osy-plist { display: grid; gap: 4px; min-width: 0; }
.osy-prow { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 4px 8px; align-items: center; padding: 5px 9px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface); font: 600 0.76rem var(--mono); color: var(--ink); min-width: 0; transition: border-color 0.2s, background 0.2s, opacity 0.3s; }
.osy-prow > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.osy-prow.osy-killed { border-color: var(--err); background: var(--err-soft); opacity: 0.6; text-decoration: line-through; }
.osy-prow.osy-fresh { border-color: var(--accent); background: var(--accent-soft); }
.osy-adj { font-variant-numeric: tabular-nums; color: var(--muted); }

/* IPC */
.osy-ipc { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; min-width: 0; }
.osy-box { display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); min-height: 150px; min-width: 0; transition: border-color 0.2s, background 0.2s; }
.osy-box.osy-kbox { background: var(--sunk); }
.osy-box.osy-on { border-color: var(--accent); }
.osy-box.osy-kon { border-color: var(--warm); }
.osy-box h4 { margin: 0; font: 700 0.78rem var(--display); color: var(--ink); overflow-wrap: anywhere; }
.osy-slot { min-height: 32px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; min-width: 0; }
.osy-parcel { font: 700 0.7rem var(--mono); padding: 3px 7px; border-radius: 6px; background: var(--warm); color: var(--surface); max-width: 100%; overflow-wrap: anywhere; animation: osy-grow 0.35s ease-out; }
.osy-parcel.osy-reply { background: var(--ok); }
.osy-parcel.osy-big { background: var(--err); }
.osy-meter { height: 12px; border-radius: 6px; background: var(--sunk); overflow: hidden; border: 1px solid var(--line); min-width: 0; }
.osy-meter i { display: block; height: 100%; width: 0; background: var(--accent); transition: width 0.35s ease-out, background 0.2s; }
.osy-meter i.osy-over { background: var(--err); }
.osy-meter i.osy-low { background: var(--ok); }
@media (max-width: 460px) { .osy-ipc { grid-template-columns: minmax(0, 1fr); } .osy-box { min-height: 0; } }

/* fd table */
.osy-fdt { display: grid; gap: 3px; min-width: 0; }
.osy-fd { display: grid; grid-template-columns: 2.4em minmax(0, 1fr); gap: 8px; padding: 4px 8px; border-radius: 6px; background: var(--surface); border: 1.5px solid var(--line); font: 600 0.74rem var(--mono); color: var(--ink); min-width: 0; }
.osy-fd span:last-child { overflow-wrap: anywhere; min-width: 0; }
.osy-fd.osy-fd-std { color: var(--muted); }
.osy-fd.osy-fd-new { border-color: var(--accent); background: var(--accent-soft); animation: osy-grow 0.35s ease-out; }
.osy-fd.osy-fd-leak { border-color: var(--err); background: var(--err-soft); }
.osy-fd b { color: var(--accent); }
`;

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  lessons.push({
    id: 'kernel',
    title: 'What an operating system does',
    tagline: 'The kernel owns the hardware; your app asks it for things through system calls.',
    level: 'beginner',
    body: `
<p>An operating system shares one machine between many programs and keeps them from hurting each other. The core part is the <em>kernel</em>. It runs with full control of the CPU, memory and devices. Everything else, including your app, runs in <em>user space</em> with fewer rights: it cannot touch hardware or another program's memory directly.</p>
<p>When user code needs something only the kernel can do, like reading a file, opening a socket or starting a thread, it makes a <em>system call</em>. The CPU switches into kernel mode, the kernel checks that the request is allowed, does the work and switches back. Most of your code never does this: sorting a list or building a <code>String</code> stays in user space.</p>
<p>Android is a stack on top of a Linux kernel. From the bottom: the Linux kernel, the hardware abstraction layer (HAL), the Android Runtime (ART) with native C/C++ libraries, the Java API framework, and apps. Each app runs in its own process with its own instance of the runtime (ART since Android 5.0, Dalvik before that). Pick an action in the demo and follow it down the stack.</p>`,
    code: `// Pure user space: no system call at all
val titles = headlines.map { it.title.uppercase() }

// These end in system calls that libc makes for you
val text = File(context.filesDir, "cache.json").readText()   // openat, read, close
Thread.sleep(100)                                            // the kernel parks this thread for 100 ms

// Ids handed out by the kernel
Log.d("OS", "pid=\${Process.myPid()} tid=\${Process.myTid()} uid=\${Process.myUid()}")`,
    remember: 'The kernel owns the hardware. Your app gets anything real (files, network, threads, memory) only by asking through a system call.',
    visual(el) {
      const LAYERS = [
        ['app', 'Your app', 'Kotlin compiled to DEX, in its own process'],
        ['fw', 'Java API framework', 'Activity, CameraManager, java.io'],
        ['rt', 'ART and native libraries', 'runtime, garbage collector, libc'],
        ['hal', 'Hardware abstraction layer', 'camera, audio, sensor modules'],
        ['kernel', 'Linux kernel', 'scheduler, memory, file systems, drivers, Binder'],
        ['hw', 'Hardware', 'CPU, RAM, flash storage, camera sensor'],
      ];
      const rows = {};
      const stack = h('div', { class: 'osy-stack' }, LAYERS.map(([id, name, sub]) => {
        const r = h('div', { class: `osy-layer ${id === 'kernel' || id === 'hw' ? 'osy-kern' : ''}` }, h('b', {}, name), h('small', {}, sub));
        rows[id] = r;
        return id === 'kernel' ? [h('div', { class: 'osy-gap' }, 'system call boundary · user space above, kernel below'), r] : r;
      }));
      const mode = pill('user', 'osy-acc');
      const st = stats(['system calls']);
      st.set('system calls', 0);
      const msg = out('Pick an action. Each one lights the layers it passes through.');
      const R = runner(el);
      const PATHS = {
        file: [
          ['app', '<code>File(path).readText()</code> runs in your process, in user mode.'],
          ['fw', 'java.io opens a <code>FileInputStream</code> and asks for bytes.'],
          ['rt', 'libc turns that into the system calls <code>openat()</code> and <code>read()</code>.'],
          ['kernel', 'Trap into kernel mode. The kernel checks your UID may read the file, finds it in the file system and asks the storage driver for the blocks.', 1],
          ['hw', 'Flash storage returns the blocks. If the file was read recently, the kernel already had it in RAM (the page cache) and skips this.'],
          ['kernel', 'The kernel copies the bytes into your buffer and returns to user mode.'],
          ['app', '<code>readText()</code> returns a String. Two layers were never involved: the HAL and the framework’s system services.'],
        ],
        camera: [
          ['app', 'CameraX asks for a picture.'],
          ['fw', 'The Camera2 framework API sends the request to the camera service, another process.'],
          ['kernel', 'The request crosses processes through the Binder driver in the kernel.', 1],
          ['hal', 'The camera service calls the camera HAL module, the vendor’s code behind a standard interface.'],
          ['kernel', 'The HAL talks to the vendor’s camera driver in the kernel.', 1],
          ['hw', 'The driver programs the sensor and the image data flows back up.'],
          ['app', 'Your callback gets the image. Your app never touched the camera hardware itself.'],
        ],
        list: [
          ['app', '<code>listOf(1, 2, 3).sum()</code> runs in your process.'],
          ['rt', 'ART allocates the list on heap memory the process already owns. No system call.'],
          ['app', 'Done in well under a microsecond, all in user mode. Most of your code works like this.'],
        ],
      };
      let calls = 0;
      async function go(name) {
        const t = R.start();
        Object.values(rows).forEach(r => r.classList.remove('osy-on', 'osy-kon', 'osy-seen'));
        for (const [id, text, sys] of PATHS[name]) {
          Object.values(rows).forEach(r => { if (r.classList.contains('osy-on') || r.classList.contains('osy-kon')) { r.classList.remove('osy-on', 'osy-kon'); r.classList.add('osy-seen'); } });
          const kern = id === 'kernel' || id === 'hw';
          rows[id].classList.add(kern ? 'osy-kon' : 'osy-on');
          mode.textContent = kern ? 'kernel' : 'user';
          mode.className = `osy-pill ${kern ? 'osy-warm' : 'osy-acc'}`;
          if (sys) st.set('system calls', ++calls);
          say(msg, text);
          await sleep(1300);
          if (!R.live(t)) return;
        }
      }
      el.append(h('div', { class: 'osy-stage' }, h('div', { class: 'osy-row' }, label('CPU mode'), mode, st), stack),
        h('div', { class: 'controls' }, act('Read a file', () => go('file')), act('Take a photo', () => go('camera')), act('Sum a list', () => go('list'))), msg);
    },
    deeper: [
      {
        title: 'Two CPU modes',
        body: `<p>The CPU itself enforces the split. In kernel mode every instruction is allowed. In user mode, instructions that touch devices or change memory mappings fault. That is why a bug in your app crashes only your process: it cannot scribble over the kernel or another app.</p>
<p>A system call is the one controlled door between the modes. On arm64 Linux, libc puts a call number in a register and runs the <code>svc</code> instruction. The CPU jumps to a fixed kernel entry point, so user code cannot choose where in the kernel it lands.</p>`,
      },
      {
        title: 'System calls cost time',
        body: `<p>Each system call switches modes and back, which costs far more than a normal function call. Code that reads a file one byte at a time makes one call per byte. A buffer makes one call per few kilobytes and does the rest in user space.</p>`,
        code: `// One read() system call per byte
FileInputStream(file).use { input ->
    while (input.read() != -1) count++
}

// One read() per 8 KB chunk; the rest is plain memory access
file.inputStream().buffered().use { input ->
    while (input.read() != -1) count++
}`,
      },
      {
        title: 'Android narrows the door',
        body: `<p>Android adds its own limits on top of Linux. Since Android 8.0 apps run with a seccomp filter that blocks system calls apps have no reason to make. SELinux policy adds rules the kernel checks on every access, and since Android 9 each app that targets API 28 or higher gets its own SELinux sandbox. The <a href="#android.permissions">runtime permissions</a> you request sit higher up, in the framework, but they end up as checks like these.</p>`,
      },
    ],
    underHood: {
      body: `<p>Follow <code>File.readText()</code> down: Kotlin calls <code>FileInputStream.read(buffer)</code>, which calls into native code in the runtime, which calls the C library function <code>read()</code>. That function is a thin wrapper that loads the system call number and arguments into registers and traps into the kernel. The kernel's <code>read</code> handler finds the open file from the file descriptor, copies data into your buffer and returns a byte count, or a negative error that libc turns into <code>errno</code> and Java turns into an <code>IOException</code>.</p>`,
    },
    mistakes: [
      { title: 'Unbuffered I/O in a loop', bad: 'val input = FileInputStream(file)\nwhile (input.read() != -1) count++   // a system call per byte', good: 'file.inputStream().buffered().use { input ->\n    while (input.read() != -1) count++\n}', why: 'Every unbuffered <code>read()</code> crosses into the kernel. A buffered stream fetches 8 KB per call, so a 1 MB file takes about 128 system calls instead of a million.' },
    ],
    terms: [
      { term: 'Kernel', def: 'The part of the OS that runs with full hardware access and manages CPU time, memory, devices and security.' },
      { term: 'User space', def: 'Where ordinary programs run, with restricted rights. Apps, ART and the framework all live here.' },
      { term: 'System call', def: 'A request from user code to the kernel, such as <code>read</code>, <code>mmap</code> or <code>clone</code>. The CPU switches to kernel mode to handle it.' },
      { term: 'HAL', def: 'Hardware abstraction layer: standard interfaces that let Android talk to each vendor’s camera, audio or sensor code the same way.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fill in the Android stack from top to bottom.', code: 'Apps\nJava API [[framework]]\nART and native libraries\n[[HAL|Hardware abstraction layer]]\nLinux [[kernel]]', why: 'Apps call the framework, which runs on ART and native libraries. The HAL wraps vendor hardware code, and the Linux kernel sits under everything.' },
      { type: 'bug', prompt: 'Counting lines in a 20 MB log file takes seconds. Tap the line that makes millions of system calls.', code: 'fun countLines(file: File): Int {\n    var lines = 0\n    val input = FileInputStream(file)\n    var b = input.read()\n    while (b != -1) { if (b == 10) lines++; b = input.read() }\n    input.close()\n    return lines\n}', bug: 2, fix: '    val input = file.inputStream().buffered()', why: 'A raw <code>FileInputStream</code> makes one <code>read()</code> system call per byte. Wrapping it in a buffer reads 8 KB per call and serves the rest from memory.' },
    ],
    quiz: [
      { q: 'Which of these runs entirely in user space, with no system call?', options: ['<code>File(path).readText()</code>', '<code>Thread.sleep(100)</code>', '<code>list.sortedBy { it.date }</code>', '<code>Socket(host, 443)</code>'], a: 2, why: 'Sorting works on memory the process already has. Reading files, sleeping and opening sockets all need the kernel.' },
      { q: 'Why can’t a buggy app overwrite the kernel’s memory?', options: ['Kotlin has no pointers', 'The CPU runs app code in user mode, where those memory accesses fault', 'ART checks every write', 'The kernel is stored in flash, not RAM'], a: 1, why: 'Protection comes from the hardware: kernel pages are not accessible in user mode. This holds for native code too, which can use pointers.' },
      { q: 'Your app takes a photo with CameraX. In what order does the request travel?', options: ['App → framework → Binder to camera service → camera HAL → kernel driver → sensor', 'App → kernel driver → HAL → sensor', 'App → HAL → framework → sensor', 'App → ART → sensor'], a: 0, why: 'Apps never talk to hardware or the HAL directly. The framework asks a system service in another process over Binder, and that service uses the HAL, which uses the kernel driver.' },
      { q: 'Since which Android version does each app process run on ART instead of Dalvik?', options: ['Android 2.3', 'Android 5.0 (API 21)', 'Android 10', 'Android 14'], a: 1, why: 'ART replaced Dalvik as the runtime in Android 5.0 (API 21). Each app process has its own runtime instance, as it did with Dalvik before.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  lessons.push({
    id: 'processes',
    title: 'Processes, zygote and the app sandbox',
    tagline: 'A process is a running program with its own memory, ids and rights.',
    level: 'intermediate',
    body: `
<p>A <em>process</em> is a program while it runs. The kernel gives each one a process id (PID), its own virtual address space, a table of open files, one or more threads, and the user id (UID) whose rights it has. Two processes cannot see each other's memory.</p>
<p>On Unix, new processes come from <code>fork()</code>: the kernel copies the parent, and the child usually calls <code>exec()</code> to load a different program. Android does it differently for apps. At boot, <code>init</code> starts the <em>zygote</em>, which loads the framework code and resources once. When an app needs a process, system_server asks the zygote over a socket, the zygote forks, and the child becomes your app. Most framework pages stay shared between all apps.</p>
<p>Then the child drops its rights to a UID that belongs only to your app. That is the <em>app sandbox</em>: each app has its own Linux user, and the kernel's normal file permissions plus SELinux keep apps out of each other's data. Launch two apps in the demo and try to cross the line.</p>`,
    code: `// Every process has kernel-assigned ids
val pid = Process.myPid()
val uid = Process.myUid()            // 10145 is shown as u0_a145: app UIDs start at 10000
Log.d("Proc", "pid=$pid uid=$uid")

// Your private files belong to your UID only
val db = File(context.filesDir, "news.db")   // /data/user/0/com.example.news/files/news.db

// A component can run in a second process (rarely needed). Application.onCreate runs again there.
// <service android:name=".PlayerService" android:process=":player" />`,
    remember: 'Each app is its own Linux process with its own UID, forked from the zygote. Separate processes means separate memory: nothing is shared unless the OS carries it.',
    visual(el) {
      const procs = [
        { id: 'init', name: 'init', pid: 1, uid: 'root', d: 0, state: 'native' },
        { id: 'lmkd', name: 'lmkd', pid: 288, uid: 'lmkd', d: 1, state: 'native' },
        { id: 'zygote', name: 'zygote64', pid: 612, uid: 'root', d: 1, state: 'waiting for fork requests' },
        { id: 'system', name: 'system_server', pid: 1405, uid: 'system', d: 2, state: 'system' },
        { id: 'launcher', name: 'launcher', pid: 2210, uid: 'u0_a62', d: 2, state: 'foreground' },
      ];
      const APPS = {
        news: { name: 'com.example.news', pid: 4821, uid: 'u0_a145' },
        maps: { name: 'com.example.maps', pid: 5307, uid: 'u0_a146' },
      };
      const tree = h('div', { class: 'osy-tree' });
      const st = stats(['processes']);
      const msg = out('Launch an app. Watch the zygote fork a child and the child take on its own UID.');
      const R = runner(el);
      const cards = {};
      function paint(hot) {
        tree.replaceChildren(...procs.map(p => {
          const stCls = p.state === 'foreground' ? 'osy-acc' : p.state === 'cached' ? 'osy-warm' : p.state === 'denied' ? 'osy-err' : 'osy-ghost';
          const c = h('div', { class: `osy-proc ${p.cls || ''} ${hot === p.id ? 'osy-hot' : ''}`, style: `--d:${p.d}` },
            h('div', { class: 'osy-ptop' }, h('span', { class: 'osy-pname' }, p.name), pill(p.state, stCls)),
            h('span', { class: 'osy-pmeta' }, `pid ${p.pid} · ppid ${p.ppid ?? (p.d === 0 ? 0 : p.d === 1 ? 1 : 612)} · uid ${p.uid}`));
          cards[p.id] = c;
          return c;
        }));
        st.set('processes', procs.length);
      }
      const find = id => procs.find(p => p.id === id);
      async function launch(key) {
        const t = R.start();
        const a = APPS[key];
        procs.filter(p => p.state === 'foreground').forEach(p => { p.state = p.id === 'launcher' ? 'home' : 'cached'; });
        const have = find(key);
        if (have) {
          have.state = 'foreground'; have.cls = '';
          paint(key);
          say(msg, `${a.name} is still alive, so this is a warm start: no fork needed. The other app moved to the background (cached).`);
          return;
        }
        paint('zygote');
        say(msg, 'system_server asks the zygote, over a Unix socket, for a new app process. The zygote calls <code>fork()</code>.');
        await sleep(1300); if (!R.live(t)) return;
        const p = { id: key, name: 'zygote64 (child)', pid: a.pid, ppid: 612, uid: 'root', d: 2, state: 'forked', cls: 'osy-new' };
        procs.push(p); paint(key);
        say(msg, `The child, pid ${a.pid}, starts as a copy of the zygote. ART and the framework are already loaded, and those memory pages are shared with every other app.`);
        await sleep(1700); if (!R.live(t)) return;
        p.uid = a.uid; p.name = a.name; p.state = 'specializing'; paint(key);
        say(msg, `The child drops root and becomes UID ${a.uid}, enters the app’s SELinux domain, then loads the app’s own code. It does not exec a new program.`);
        await sleep(1700); if (!R.live(t)) return;
        p.state = 'foreground'; p.cls = ''; paint(key);
        say(msg, `<span class="good">${a.name}</span> is running as pid ${a.pid}, uid ${a.uid}. <code>Application.onCreate()</code> runs now, once for this process.`);
      }
      function home() {
        R.stop();
        procs.forEach(p => { if (p.state === 'foreground' && p.id !== 'launcher') p.state = 'cached'; p.cls = ''; });
        find('launcher').state = 'foreground';
        paint('launcher');
        say(msg, 'The apps keep running as cached processes. Their memory stays, so coming back is fast, until the system needs that memory.');
      }
      function peek() {
        R.stop();
        const me = find('news');
        if (!me) { say(msg, 'Launch News first.'); return; }
        const them = find('maps');
        me.cls = 'osy-deny'; paint(); me.cls = '';
        say(msg, `<code>open("/data/data/com.example.maps/files/home.db")</code> from uid ${me.uid}: <span class="bad">EACCES, permission denied</span>. That directory belongs to ${them ? them.uid : 'u0_a146'} with mode 700, and SELinux blocks it too. To share data, Maps has to offer it through a ContentProvider, a service or an Intent.`);
      }
      paint();
      el.append(h('div', { class: 'osy-stage' }, st, tree),
        h('div', { class: 'controls' }, act('Launch News', () => launch('news')), act('Launch Maps', () => launch('maps')), act('Press Home', home), act('News reads Maps’ files', peek)), msg);
    },
    deeper: [
      {
        title: 'fork, exec and copy-on-write',
        body: `<p><code>fork()</code> returns twice: 0 in the child, the child's PID in the parent. The kernel does not copy all memory at fork time. Parent and child share every page read-only, and a page is copied only when one of them writes to it. This is <em>copy-on-write</em>, and it is why forking the zygote is cheap and why the framework pages stay shared.</p>`,
        code: `pid_t pid = fork();                   // one process becomes two
if (pid == 0) {
    execv("/system/bin/ls", argv);    // child: replace the program
} else {
    waitpid(pid, &status, 0);         // parent: wait for the child to exit
}`,
      },
      {
        title: 'Why the zygote exists',
        body: `<p>Starting a runtime and loading thousands of framework classes for every app would make every launch slow and every app pay for its own copy in RAM. The zygote does that work once at boot. A fork gives each new app a warm runtime, and copy-on-write keeps the untouched pages shared. Some devices go one step further and keep a small pool of pre-forked, not yet specialized processes ready. This is part of why a <a href="#perf.startup">cold start</a> still costs more than a warm one: your own code and data still have to load.</p>`,
      },
      {
        title: 'You can see it with ps',
        body: `<p>Every app's parent process id is the zygote. The user column shows the per-app UID.</p>`,
        code: `$ adb shell ps -A -o PID,PPID,USER,NAME | grep -E "zygote|example"
  612     1 root      zygote64
 4821   612 u0_a145   com.example.news
 5307   612 u0_a146   com.example.maps`,
      },
      {
        title: 'Process state is not Activity state',
        body: `<p>In OS terms a process is created, then its threads move between ready, running and blocked until it exits. Android adds an importance ranking on top (foreground, visible, service, cached) that decides who dies first when memory runs short. The <a href="#android.lifecycle">Activity lifecycle</a> is a separate, higher layer: a process can be alive with no visible Activity, and an Activity can be recreated in a brand new process. More on that in <a href="#os.low-memory">Running out of memory</a>.</p>`,
      },
    ],
    mistakes: [
      { title: 'Treating a singleton as permanent', bad: 'object Session {\n    var user: User? = null   // set once at login\n}', good: 'object Session {\n    var user: User? = null   // a cache only\n}\n// Source of truth: DataStore, reloaded when a new process starts', why: 'A singleton lives exactly as long as the process. When Android kills the process and the user comes back, a new process forks from the zygote and <code>user</code> is null again. See <a href="#android.savedstate">saved state</a>.' },
      { title: 'Expecting one Application per app', bad: '<service android:name=".PlayerService"\n    android:process=":player" />\n// Application.onCreate() starts analytics, opens the DB', good: '<service android:name=".PlayerService" />\n// Only use android:process when you need the isolation,\n// and check the process name before heavy init', why: 'Each process gets its own <code>Application</code> instance and its own copy of every singleton. Two processes opening the same database without coordination is a common source of bugs.' },
    ],
    terms: [
      { term: 'Process', def: 'A running program: an address space, threads, open files and the credentials (UID) it runs with.' },
      { term: 'PID', def: 'Process id, a number the kernel assigns to each process.' },
      { term: 'Zygote', def: 'The Android process that preloads the runtime and framework and forks every app process.' },
      { term: 'App sandbox', def: 'Android’s isolation model: each app runs as its own Linux UID in its own process, with file permissions and SELinux keeping apps apart.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Log the ids the kernel gave this process.', code: 'val pid = Process.[[myPid]]()\nval uid = Process.[[myUid]]()\nLog.d("Proc", "pid=$pid uid=$uid")', why: '<code>android.os.Process</code> exposes the calling process’s PID and UID. App UIDs are 10000 and up.' },
      { type: 'bug', prompt: 'This compiles but always fails on a real device. Tap the line that breaks the sandbox rules.', code: 'fun loadMapsHome(context: Context): String? {\n    val f = File("/data/data/com.example.maps/files/home.json")\n    return if (f.exists()) f.readText() else null\n}', bug: 1, fix: '    val uri = Uri.parse("content://com.example.maps.provider/home")   // read via the app’s ContentProvider', why: 'Another app’s private directory belongs to its UID. The kernel refuses the access. Data crosses apps only through something the other app exposes, such as a ContentProvider.' },
    ],
    quiz: [
      { q: 'Two apps are open. App A has a global <code>val cache = HashMap()</code>. Can App B read it?', options: ['Yes, if both are written in Kotlin', 'Yes, through reflection', 'No, each app is a separate process with its own address space', 'Only when both are in the foreground'], a: 2, why: 'Separate processes have separate virtual memory. B could only get the data if A sends it, for example over Binder.' },
      { q: 'What is the parent process of a normal Android app?', options: ['init', 'system_server', 'zygote', 'The launcher'], a: 2, why: 'system_server asks for it, but the zygote calls <code>fork()</code>, so the zygote is the parent. <code>ps</code> shows the zygote’s PID as the PPID.' },
      { q: 'Put the start of an app process in order.', options: ['zygote forks → child sets its UID and SELinux domain → app code loads → Application.onCreate()', 'exec() the APK → zygote forks → Application.onCreate()', 'Application.onCreate() → zygote forks → UID is set', 'Launcher forks itself → loads the APK → sets UID'], a: 0, why: 'The forked child first drops to the app’s identity, then loads the app’s code, and only then runs your Application.' },
      { q: 'Why does forking the zygote save memory across apps?', options: ['Apps share one heap', 'Copy-on-write keeps preloaded framework pages shared until someone writes to them', 'The zygote compresses each app', 'Apps run inside the zygote process'], a: 1, why: 'After fork, parent and child point at the same physical pages. Framework code is rarely written to, so it stays shared by every app.' },
      { q: 'A second app tries to open the login token file in the first app’s <code>filesDir</code>. What stops it?', options: ['Only Google Play Protect', 'The kernel’s file permissions for the owning UID, plus SELinux', 'Nothing, files are public', 'ART’s bytecode verifier'], a: 1, why: 'The file is owned by the first app’s UID in a mode-700 directory. The kernel checks the caller’s UID on <code>open()</code>, and SELinux adds a second check.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  lessons.push({
    id: 'threads',
    title: 'Threads and scheduling',
    tagline: 'The scheduler hands out CPU time in slices; a blocked main thread draws nothing.',
    level: 'intermediate',
    body: `
<p>A <em>thread</em> is one line of execution inside a process. Threads of the same process share its memory, but each has its own stack and registers. The kernel schedules threads, not processes: it keeps a list of runnable threads and gives each a <em>time slice</em> on a CPU core. When the slice ends, or the thread blocks, the kernel saves its registers and loads another thread. That swap is a <em>context switch</em>.</p>
<p>A thread is always in one of three states: running on a core, runnable and waiting for a core, or blocked waiting for something like disk, network or a lock. A blocked thread uses no CPU at all. It just doesn't move.</p>
<p>Every Android app has one <em>main thread</em>. It handles input, runs your UI code and produces each frame. At 60 Hz it has about 16 ms per frame. If you block it with disk or network I/O, or keep it busy with heavy work, frames are missed (<a href="#perf.frame">jank</a>), and if input waits 5 seconds you get an <a href="#perf.anr">ANR</a>. The fixes are in <a href="#perf.main-thread">keeping the main thread free</a>. Run the scenarios and compare the main thread row.</p>`,
    code: `class ArticleViewModel(private val repo: ArticleRepository) : ViewModel() {
    val state = MutableStateFlow<ArticleState>(ArticleState.Loading)

    fun load(id: Long) {
        viewModelScope.launch {                           // starts on the main thread
            val article = withContext(Dispatchers.IO) {   // a pool thread can block on disk/network
                repo.fetch(id)
            }
            state.value = ArticleState.Ready(article)     // back on main
        }
    }
}`,
    remember: 'The main thread must never wait. Blocking I/O and heavy work go to another thread; only short UI work stays on main.',
    visual(el) {
      const N = 40, W = 4;
      // c: who is on the CPU, m: main thread state, w: worker state. Letters: M main, W worker, O other app, '-' idle.
      // main/worker: R running, Q runnable, B blocked, S sleeping until the next frame, '' none.
      function scenario(name) {
        const c = [], m = [], w = [], f = [];
        for (let i = 0; i < N; i++) {
          const k = i % W;
          let cc = k < 2 ? 'M' : k === 2 ? 'O' : '-', mm = k < 2 ? 'R' : 'S', ww = '';
          if (name === 'block' && i >= 4 && i < 28) { mm = 'B'; cc = k === 2 ? 'O' : '-'; }
          if (name === 'busy' && i >= 4 && i < 28) { cc = k === 2 ? 'O' : 'M'; mm = k === 2 ? 'Q' : 'R'; }
          if (name === 'worker') {
            if (i === 7) ww = 'R';
            else if (i > 7 && i < 24) ww = 'B';
            else if (i >= 24 && i < 36) ww = k === 3 ? 'R' : 'Q';
            if (ww === 'R') cc = 'W';
          }
          c.push(cc); m.push(mm); w.push(ww);
        }
        for (let j = 0; j < N / W; j++) f.push(j >= 1 && j < 7 && (name === 'block' || name === 'busy') ? 'miss' : 'ok');
        return { c, m, w, f };
      }
      const row = n => { const cells = Array.from({ length: n }, () => h('div', { class: 'osy-cell' })); return { cells, el: h('div', { class: 'osy-tl', style: `--n:${n}` }, cells) }; };
      const cpu = row(N), main = row(N), work = row(N), frames = row(N / W);
      const st = stats(['frames drawn', 'missed', 'context switches']);
      const msg = out('Pick a scenario. Each cell is 4 ms; a frame is due every 16 ms.');
      const R = runner(el);
      const CC = { M: 'osy-c-main', W: 'osy-c-work', O: 'osy-c-other', '-': '' };
      const TC = { R: 'osy-c-main', Q: 'osy-c-wait', B: 'osy-c-block', S: '', '': '' };
      const END = {
        smooth: 'Main runs 8 ms per frame, then sleeps until the next frame is due. Another app gets the CPU in between. Every frame on time.',
        block: 'Main called a blocking disk read. It sat in the <span class="bad">blocked</span> state for 96 ms while the CPU was mostly <em>idle</em>: the phone was not busy, your thread was waiting. Six frames missed. Keep it up for 5 s of pending input and Android shows an ANR.',
        busy: 'Main parsed a big JSON for 96 ms. It ran almost nonstop; the scheduler still preempted it so the other app got its slices (yellow: runnable, waiting for the core). Busy or blocked, the result is the same: missed frames.',
        worker: 'Main only posts the work. A worker thread blocks on the disk read, then parses when it gets CPU time. Main keeps its 8 ms per frame and every frame is on time. This is what <code>withContext(Dispatchers.IO)</code> does.',
      };
      async function play(name) {
        const t = R.start();
        const s = scenario(name);
        [cpu, main, work, frames].forEach(r => r.cells.forEach(x => { x.className = 'osy-cell'; x.textContent = ''; }));
        let ok = 0, miss = 0, sw = 0;
        st.set('frames drawn', 0); st.set('missed', 0); st.set('context switches', 0);
        say(msg, 'Running…');
        for (let i = 0; i < N; i++) {
          cpu.cells[i].className = `osy-cell ${CC[s.c[i]]}`;
          main.cells[i].className = `osy-cell ${TC[s.m[i]]}`;
          work.cells[i].className = `osy-cell ${s.w[i] === 'R' ? 'osy-c-work' : TC[s.w[i]]}`;
          if (i > 0 && s.c[i] !== s.c[i - 1] && s.c[i] !== '-' ) st.set('context switches', ++sw);
          if (i % W === W - 1) {
            const j = (i + 1) / W - 1, good = s.f[j] === 'ok';
            frames.cells[j].className = `osy-cell ${good ? 'osy-c-ok' : 'osy-c-miss'}`;
            frames.cells[j].textContent = good ? '✓' : '×';
            good ? st.set('frames drawn', ++ok) : st.set('missed', ++miss);
          }
          await sleep(55);
          if (!R.live(t)) return;
        }
        say(msg, END[name]);
      }
      const key = (cls, text) => h('span', { class: 'osy-key' }, h('i', { class: `osy-cell ${cls}`, style: 'height:12px' }), text);
      el.append(h('div', { class: 'osy-stage' },
        h('div', { class: 'osy-tlrow' }, label('CPU core: who runs'), cpu.el),
        h('div', { class: 'osy-tlrow' }, label('main thread'), main.el),
        h('div', { class: 'osy-tlrow' }, label('worker thread'), work.el),
        h('div', { class: 'osy-tlrow' }, label('frames (every 16 ms)'), frames.el),
        h('div', { class: 'osy-legend' }, key('osy-c-main', 'main running'), key('osy-c-work', 'worker running'), key('osy-c-other', 'other app'), key('osy-c-wait', 'runnable, waiting'), key('osy-c-block', 'blocked on I/O')),
        st),
        h('div', { class: 'controls' }, act('Smooth', () => play('smooth')), act('Disk read on main', () => play('block')), act('Heavy work on main', () => play('busy')), act('Move it to a worker', () => play('worker'))), msg);
    },
    deeper: [
      {
        title: 'Threads versus processes',
        body: `<p>Creating a thread is cheaper than creating a process, and threads share memory, so they can pass objects with no copying. The price is that shared memory needs care: two threads writing the same object without a lock or an atomic is a data race. Processes are the opposite trade: strong isolation, but any data passed between them has to be copied through the kernel.</p>
<p>On Linux both are created with the same <code>clone()</code> system call. A thread is a task that shares its parent's address space; a process is a task that gets its own.</p>`,
      },
      {
        title: 'Context switches are not free',
        body: `<p>A switch saves one thread's registers, loads another's, and often leaves the CPU caches full of the wrong data. A few hundred threads all fighting for 8 cores spend real time switching. That is why coroutines map many tasks onto a small pool of threads: <code>Dispatchers.Default</code> has about one thread per core, and suspending a coroutine does not block its thread. See <a href="#coroutines.dispatchers">dispatchers</a>.</p>`,
      },
      {
        title: 'Priorities',
        body: `<p>The scheduler gives more CPU to higher-priority threads. On Linux, a normal thread's priority is its <em>nice</em> value: lower is more important. Android sets the main thread of the foreground app high and lets you lower your own background threads so they don't steal time from drawing.</p>`,
        code: `thread(name = "thumbnail-cache") {
    Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND)  // nice +10: yield to UI work
    warmThumbnailCache()
}`,
      },
    ],
    underHood: {
      body: `<p>The main thread runs a loop: a <code>Looper</code> takes the next message from its <code>MessageQueue</code> and runs it. Input events, lifecycle callbacks, <code>Handler.post</code> and frame callbacks are all messages. When the queue is empty, the thread blocks in the kernel (an <code>epoll</code> wait) and uses no CPU until a message or an input event wakes it. While one message runs, every other message waits, which is exactly how a slow <code>onClick</code> delays drawing.</p>`,
      code: `// Roughly what Looper.loop() does
while (true) {
    val msg = queue.next()   // blocks in the kernel when there is nothing to do
    msg.target.dispatchMessage(msg)   // your code runs here; everything else waits
}`,
    },
    mistakes: [
      { title: 'runBlocking on the main thread', bad: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    val user = runBlocking { repo.loadUser() }   // main thread blocks\n}', good: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    lifecycleScope.launch { show(repo.loadUser()) }   // main is free while it suspends\n}', why: '<code>runBlocking</code> blocks the calling thread until the coroutine ends. On main that freezes input and drawing for the whole load.' },
      { title: 'Sleeping to wait for something', bad: 'button.setOnClickListener {\n    Thread.sleep(300)   // "let the animation finish"\n    openDetail()\n}', good: 'button.setOnClickListener {\n    lifecycleScope.launch { delay(300); openDetail() }\n}', why: '<code>Thread.sleep</code> blocks the thread in the kernel: no frames for 300 ms. <code>delay</code> suspends the coroutine and leaves the thread free to draw.' },
    ],
    terms: [
      { term: 'Thread', def: 'A unit of execution the kernel schedules. Threads in one process share memory and each has its own stack.' },
      { term: 'Time slice', def: 'The stretch of CPU time a thread gets before the scheduler may switch to another runnable thread.' },
      { term: 'Context switch', def: 'Saving one thread’s CPU state and loading another’s so the other can run.' },
      { term: 'Main thread', def: 'The app thread that handles input, lifecycle callbacks and drawing. Also called the UI thread.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Move the blocking database read off the main thread.', code: 'viewModelScope.launch {\n    val rows = withContext(Dispatchers.[[IO]]) { dao.loadAll() }\n    _state.value = UiState.Ready(rows)\n}', why: '<code>Dispatchers.IO</code> runs blocking calls on a shared pool so the main thread stays free. The assignment after <code>withContext</code> runs back on main.' },
      { type: 'bug', prompt: 'This crashes with <code>NetworkOnMainThreadException</code> on startup. Tap the line that runs on the wrong thread.', code: 'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    val json = URL("https://api.example.com/manset").readText()\n    adapter.submit(parse(json))\n}', bug: 2, fix: '    lifecycleScope.launch { val json = withContext(Dispatchers.IO) { URL("https://api.example.com/manset").readText() }; adapter.submit(parse(json)) }', why: '<code>onCreate</code> runs on the main thread. A network read there would block drawing and input, so Android throws <code>NetworkOnMainThreadException</code>. Do the read on an I/O thread and come back to main.' },
    ],
    quiz: [
      { q: 'The main thread is blocked on a slow disk read. What is the CPU doing?', options: ['Spinning at 100% on the main thread', 'Running other threads, or idle; the blocked thread uses no CPU', 'Waiting for the main thread to finish its slice', 'Reading the disk byte by byte'], a: 1, why: 'A blocked thread is off the CPU until the I/O completes. The UI freezes because the thread that draws is waiting, not because the CPU is busy.' },
      { q: 'At 60 Hz, roughly how long does the main thread have to produce each frame?', options: ['1 ms', '16 ms', '100 ms', '5 s'], a: 1, why: '1000 ms / 60 ≈ 16.7 ms. At 120 Hz it is about 8 ms. 5 seconds is the input timeout for an ANR, a far worse failure.' },
      { q: 'Which change fixes jank caused by parsing a 2 MB JSON file in a click handler?', options: ['Raise the main thread’s priority', 'Parse it on <code>Dispatchers.Default</code> and post the result to main', 'Call <code>Thread.yield()</code> during parsing', 'Use <code>runBlocking</code> around the parse'], a: 1, why: 'Parsing is CPU work, so <code>Default</code> (sized to the cores) fits. The main thread only applies the result.' },
      { q: 'What do two threads of the same process share?', options: ['Nothing', 'Their stacks', 'The heap and all of the process’s memory, but not stacks or registers', 'Only open files'], a: 2, why: 'Threads share the address space, so heap objects are visible to both. Each thread has its own stack and its own register state.' },
      { q: 'Your app starts 500 threads for 500 image downloads. What goes wrong first?', options: ['Nothing, threads are free', 'Each thread reserves stack memory and the scheduler spends time switching; a bounded pool or coroutines is better', 'The kernel refuses to create more than 8 threads', 'Downloads run in sequence anyway'], a: 1, why: 'Threads cost memory and switching time. Downloads mostly wait on the network, so a few threads with suspending I/O handle them better.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  lessons.push({
    id: 'memory',
    title: 'Virtual memory, stack and heap',
    tagline: 'Every process sees its own address space; the kernel maps it onto real RAM page by page.',
    level: 'intermediate',
    body: `
<p>A process never sees physical RAM addresses. It sees a private <em>virtual address space</em>, split into fixed-size <em>pages</em> (4 KB on most Android devices today; some newer devices use 16 KB). A per-process <em>page table</em> maps each virtual page to a physical <em>frame</em> in RAM, and the CPU's MMU does the lookup on every memory access, with a small cache (the TLB) to make it fast.</p>
<p>A page does not need a frame until it is used. The first touch causes a <em>page fault</em>: the kernel finds a free frame, fills it (with zeros, or with data from a file) and updates the table. The same frame can appear in many page tables, which is how all apps share the zygote's framework pages. Files can be mapped straight into memory with <code>mmap</code>; Android maps app code this way.</p>
<p>Inside the address space, each thread has a <em>stack</em> for function calls and local variables, and objects live on the <em>heap</em>, which ART manages with its garbage collector. Android caps each app's heap, because many processes share one device's RAM and pages you write to stay in RAM. Tap pages in the demo to see hits, faults and sharing.</p>`,
    code: `// How much heap this device gives a normal app, in MB
val am = context.getSystemService(ActivityManager::class.java)
val heapLimitMb = am.memoryClass

// What the ART heap holds right now
val rt = Runtime.getRuntime()
val usedMb = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024)
Log.d("Mem", "heap used $usedMb MB of $heapLimitMb MB")

fun render(item: Article) {          // \`item\` reference and locals live on this thread’s stack
    val card = ArticleCard(item)     // the ArticleCard object lives on the heap
}`,
    remember: 'Addresses are virtual. Pages get real RAM only when touched, shared pages count once, and every page you write stays in RAM until you drop the objects on it.',
    visual(el) {
      const PAGES = [
        { n: 0, name: 'code: libart.so', kind: 'shared' },
        { n: 1, name: 'framework (zygote)', kind: 'shared' },
        { n: 2, name: 'heap', kind: 'anon' },
        { n: 3, name: 'heap', kind: 'anon' },
        { n: 4, name: 'mmap: articles.db', kind: 'file' },
        { n: 5, name: 'stack', kind: 'anon' },
      ];
      const OWN = { A: 'News', B: 'Maps' };
      let frames, pt, cur = 'A', zram;
      function reset() {
        frames = Array.from({ length: 8 }, () => null);
        frames[0] = { label: 'libart.so code', cls: 'osy-f-shared', key: 'shared0' };
        frames[1] = { label: 'framework', cls: 'osy-f-shared', key: 'shared1' };
        frames[2] = { label: 'News stack', cls: 'osy-f-a', key: 'A5' };
        frames[3] = { label: 'Maps stack', cls: 'osy-f-b', key: 'B5' };
        pt = { A: { 0: 0, 1: 1, 5: 2 }, B: { 0: 0, 1: 1, 5: 3 } };
        zram = 0;
      }
      const left = h('div', { class: 'osy-col' });
      const right = h('div', { class: 'osy-frames' });
      const st = stats(['free frames', 'page faults', 'in ZRAM']);
      const msg = out('Tap a virtual page. Its address is page number × 4 KB + offset 0xA10.');
      let faults = 0, flashF = -1, mark = {};
      const hex = n => '0x' + n.toString(16).toUpperCase();
      const procBtns = ['A', 'B'].map(p => act(`Process ${OWN[p]}`, () => { cur = p; mark = {}; paint(); say(msg, `Now looking at ${OWN[p]}’s page table. Pages 0 and 1 point at the same frames as in the other process.`); }));
      function entry(p, n) { const e = pt[p][n]; return e === undefined ? 'not present' : e === 'z' ? 'in ZRAM' : `→ frame ${e}`; }
      function paint() {
        procBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(['A', 'B'][i] === cur)));
        left.replaceChildren(label(`${OWN[cur]}: virtual pages`), ...PAGES.map(pg => h('button', { class: `osy-vpage ${mark[pg.n] || ''}`, onclick: () => touch(pg) },
          h('span', {}, String(pg.n)), h('span', {}, pg.name), h('em', {}, entry(cur, pg.n)))));
        right.replaceChildren(...frames.map((f, i) => h('div', { class: `osy-frame ${f ? f.cls : ''} ${i === flashF ? 'osy-flash' : ''}` }, `frame ${i}`, h('b', {}, f ? f.label : 'free'))));
        st.set('free frames', frames.filter(f => !f).length);
        st.set('page faults', faults);
        st.set('in ZRAM', zram);
        flashF = -1;
      }
      function freeFrame() {
        let i = frames.findIndex(f => !f);
        if (i >= 0) return { i, note: '' };
        // Prefer dropping a clean file page: it can be read back from the file.
        i = frames.findIndex(f => f.cls === 'osy-f-file');
        if (i >= 0) {
          for (const p of ['A', 'B']) if (pt[p][4] === i) delete pt[p][4];
          frames[i] = null;
          return { i, note: ' RAM was full, so the kernel first <b>dropped a clean file page</b> (it can be re-read from articles.db).' };
        }
        i = frames.findIndex((f, k) => f && f.key && /^[AB][23]$/.test(f.key) && f.key[0] !== cur);
        if (i < 0) i = frames.findIndex(f => f && f.key && /^[AB][23]$/.test(f.key));
        if (i >= 0) {
          const k = frames[i].key; pt[k[0]][k[1]] = 'z'; zram++;
          frames[i] = null;
          return { i, note: ` RAM was full and no clean page was left, so the kernel <b>compressed ${OWN[k[0]]}’s heap page ${k[1]} into ZRAM</b>.` };
        }
        return { i: -1, note: '' };
      }
      function touch(pg) {
        const e = pt[cur][pg.n];
        const va = hex(pg.n * 0x1000 + 0xA10);
        mark = { [pg.n]: '' };
        if (typeof e === 'number') {
          mark[pg.n] = 'osy-hit'; paint();
          say(msg, `Hit. Virtual ${va} = page ${pg.n}, offset 0xA10 → frame ${e} → physical ${hex(e * 0x1000 + 0xA10)}. No kernel involvement.${pg.kind === 'shared' ? ' This frame is shared by both processes.' : ''}`);
          return;
        }
        faults++;
        if (pg.kind === 'file') {
          const other = cur === 'A' ? 'B' : 'A', f = pt[other][4];
          if (typeof f === 'number') {
            pt[cur][4] = f; mark[pg.n] = 'osy-fault'; flashF = f; paint();
            say(msg, `Page fault, but articles.db page 4 is already in RAM (the page cache) for ${OWN[other]}. The kernel just maps frame ${f} into ${OWN[cur]} too. One copy, two processes.`);
            return;
          }
        }
        const { i, note } = freeFrame();
        if (i < 0) { paint(); say(msg, 'No frame can be freed. On Android, this is where lmkd starts killing processes.'); return; }
        const wasZ = e === 'z';
        if (wasZ) zram--;
        frames[i] = pg.kind === 'file' ? { label: 'articles.db p4', cls: 'osy-f-file', key: 'F4' } : { label: `${OWN[cur]} ${pg.name}`, cls: cur === 'A' ? 'osy-f-a' : 'osy-f-b', key: cur + pg.n };
        pt[cur][pg.n] = i; mark[pg.n] = 'osy-fault'; flashF = i;
        paint();
        const how = wasZ ? 'decompresses it from ZRAM' : pg.kind === 'file' ? 'reads that part of articles.db from storage' : 'fills it with zeros';
        say(msg, `<span class="bad">Page fault</span> at ${va}: page ${pg.n} had no frame. The kernel picks frame ${i}, ${how}, and updates the page table.${note}`);
      }
      reset(); paint();
      el.append(h('div', { class: 'osy-stage' }, h('div', { class: 'controls' }, procBtns), st,
        h('div', { class: 'osy-vm' }, left, h('div', { class: 'osy-col' }, label('physical RAM frames'), right))), msg);
    },
    deeper: [
      {
        title: 'Stack versus heap',
        body: `<p>The stack is a block of memory per thread. Each function call pushes a frame with its parameters and local variables, and returning pops it. It is fast and needs no garbage collection, but it is small; recursion that never stops ends in <code>StackOverflowError</code>.</p>
<p>The heap holds every object you create with a constructor call. Objects live as long as something references them, and ART's garbage collector frees the rest. In Kotlin a local <code>val</code> of an object type is a reference on the stack pointing at an object on the heap.</p>`,
        code: `fun depth(c: Comment): Int {                 // each call adds a stack frame
    var max = 0                              // local Int: in the frame
    for (reply in c.replies) max = maxOf(max, depth(reply))
    return max + 1                           // frame popped on return
}
val thread = Comment(text = "Great news")  // the object is on the heap`,
      },
      {
        title: 'Memory-mapped files',
        body: `<p><code>mmap</code> maps a file into the address space. Reading the memory reads the file, through page faults, and pages the app never modifies are <em>clean</em>: under pressure the kernel can drop them and read them again later. Android maps app code (DEX, compiled OAT files and native libraries) like this, which is why code is cheaper on RAM than heap objects. Pages you modify are <em>dirty</em> and stay in RAM, or go to ZRAM, a compressed area in RAM.</p>`,
        code: `RandomAccessFile(file, "r").use { raf ->
    val map = raf.channel.map(FileChannel.MapMode.READ_ONLY, 0, raf.length())
    val first = map.get(0)   // a page fault loads the first page; no read() call
}`,
      },
      {
        title: 'Why apps have a heap limit',
        body: `<p>Android sets a hard limit on each app's heap, which depends on the device's RAM. <code>ActivityManager.getMemoryClass()</code> tells you the number in MB. Go past it and the allocation throws <code>OutOfMemoryError</code>, even if the phone has free RAM, because the limit protects every other process. A leaked Activity, a cache with no bound, or a full-size bitmap are the usual causes. See <a href="#perf.leaks">memory leaks</a>.</p>`,
      },
      {
        title: 'Shared pages and PSS',
        body: `<p>If 20 apps map the same framework frame, whose memory is it? Android reports <em>PSS</em>, proportional set size: each shared page is split evenly between the processes that map it. So your app's PSS includes 1/20 of that frame. Your private dirty pages, mostly your heap, are the part you control.</p>`,
        code: `$ adb shell dumpsys meminfo com.example.news
#   Pss Total, Private Dirty and the Java Heap / Native Heap rows are the ones to watch`,
      },
    ],
    underHood: {
      body: `<p>Translation is plain arithmetic. With 4 KB pages (2<sup>12</sup> bytes), the low 12 bits of a virtual address are the offset inside the page and the rest is the page number. The MMU looks up the page number (on arm64 through a tree of page tables, three or four levels deep depending on how the kernel is configured), finds the frame, and puts the same offset on the end. A TLB hit skips the table walk entirely.</p>`,
      code: `virtual 0x3A10  →  page 0x3, offset 0xA10
page table[0x3] =  frame 0x7
physical         =  0x7 * 0x1000 + 0xA10 = 0x7A10`,
    },
    mistakes: [
      { title: 'Decoding a full-size photo for a thumbnail', bad: 'val bmp = BitmapFactory.decodeFile(path)   // 4000 × 3000 × 4 bytes ≈ 48 MB', good: 'val opts = BitmapFactory.Options().apply { inSampleSize = 8 }\nval bmp = BitmapFactory.decodeFile(path, opts)   // 500 × 375 ≈ 0.75 MB', why: 'A decoded bitmap costs width × height × 4 bytes of RAM, whatever the file size. A few of those hit the heap limit. Image libraries like Coil sample down to the view size for you.' },
      { title: 'A cache with no limit', bad: 'object Thumbs { val cache = HashMap<String, Bitmap>() }', good: 'object Thumbs {\n    val cache = object : LruCache<String, Bitmap>(16 * 1024 * 1024) {\n        override fun sizeOf(key: String, value: Bitmap) = value.byteCount\n    }\n}', why: 'A static map keeps every entry reachable forever, so the GC can never free them. An <code>LruCache</code> with a byte budget drops the oldest entries.' },
    ],
    terms: [
      { term: 'Virtual memory', def: 'Each process’s private view of memory; the kernel and MMU map it onto physical RAM.' },
      { term: 'Page', def: 'A fixed-size block of virtual memory, usually 4 KB, that is mapped as one unit.' },
      { term: 'Page fault', def: 'The trap a CPU raises when a page has no frame mapped. The kernel fixes the mapping or kills the access.' },
      { term: 'Heap', def: 'Memory for objects. On Android, ART manages the app heap and frees unreachable objects with garbage collection.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Pages are 4 KB (0x1000 bytes). Split the virtual address 0x3A10.', code: '// virtual 0x3A10\nval page = [[3|0x3]]\nval offset = [[0xA10|A10|0xa10]]', why: 'The low 12 bits (three hex digits) are the offset, 0xA10. What remains, 0x3, is the page number.' },
      { type: 'bug', prompt: 'Opening a long comment thread crashes with <code>StackOverflowError</code>. Tap the line that recurses forever.', code: 'fun depth(c: Comment): Int {\n    var max = 0\n    for (reply in c.replies) max = maxOf(max, depth(reply))\n    return depth(c) + 1\n}', bug: 3, fix: '    return max + 1', why: '<code>depth(c)</code> calls itself with the same argument, so each call pushes another stack frame until the thread’s stack runs out. Return the computed <code>max + 1</code> instead.' },
    ],
    quiz: [
      { q: 'News and Maps both use the framework classes the zygote preloaded. How many copies of those pages are in RAM?', options: ['One per app', 'One, mapped into both page tables', 'None, they are read from flash every time', 'Two, one per CPU core'], a: 1, why: 'The pages came from the zygote and nobody wrote to them, so both page tables point at the same physical frames.' },
      { q: 'An app allocates a 50 MB array but never touches most of it. What happens to physical RAM?', options: ['50 MB is used at once', 'Pages get frames only as they are first written; untouched pages may cost nothing yet', 'The array goes to flash', 'The kernel refuses the allocation'], a: 1, why: 'The kernel assigns frames lazily, on the first touch, through page faults. Do not count on this for Java objects: the app’s heap limit counts the full 50 MB the moment you allocate it.' },
      { q: 'RAM is tight. Which page can the kernel drop without losing data?', options: ['A heap page your app wrote to', 'A clean page of a memory-mapped file, like app code', 'A thread’s stack page', 'Any page, then it asks the app to rebuild it'], a: 1, why: 'A clean file page is identical to the file on disk, so it can be read back. Dirty pages have no other copy; on Android they can only be compressed into ZRAM.' },
      { q: 'The device has 2 GB free, yet your app throws <code>OutOfMemoryError</code>. Why?', options: ['A bug in ART', 'The app hit its per-app heap limit, which is far lower than total RAM', 'ZRAM is full', 'The stack is too small'], a: 1, why: 'Android limits each app’s heap to protect other processes. <code>getMemoryClass()</code> gives the limit. Look for leaks or oversized bitmaps.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  lessons.push({
    id: 'low-memory',
    title: 'Running out of memory',
    tagline: 'When RAM runs out, Android kills the least important process and expects you to restore state.',
    level: 'advanced',
    body: `
<p>A desktop OS can swap pages to disk. A phone mostly can't afford to, so Linux on Android first reclaims what it can: it drops clean file pages and compresses dirty anonymous pages into ZRAM. If memory pressure keeps rising, something has to die. The Linux kernel has an OOM killer for the very last moment, but Android acts earlier, in user space, with the <em>low memory killer daemon</em>, <code>lmkd</code>.</p>
<p>Every process has an <code>oom_score_adj</code> value from -1000 to 1000. Android's activity manager keeps it updated from the process's importance: the foreground app is 0, a visible app 100, a foreground service around 200, the previous app 700, cached apps 900 and above. When lmkd sees pressure, it kills the process with the highest score first. Since Android 10 it measures pressure with the kernel's pressure stall information (PSI).</p>
<p>So a background app can be killed at any time with no callback. When the user returns, Android starts a fresh process and recreates the Activity with its <a href="#android.savedstate">saved state</a>. ViewModels and singletons are gone. Open apps in the demo until lmkd steps in, then go back to News.</p>`,
    code: `class SearchViewModel(private val handle: SavedStateHandle) : ViewModel() {
    // Survives process death: SavedStateHandle is written to the saved-state Bundle
    val query: StateFlow<String> = handle.getStateFlow("query", "")

    // Does not survive process death: rebuild it from the query
    val results = query.flatMapLatest { repo.search(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun onQuery(q: String) { handle["query"] = q }
}`,
    remember: 'A background process can die at any moment without notice. Keep small UI state in saved state, real data on disk, and treat everything in memory as a cache.',
    visual(el) {
      const TOTAL = 30, RESERVE = 2;
      const IMP = { 0: 'foreground', 100: 'visible', 200: 'perceptible', 600: 'home', 700: 'previous', '-900': 'system', '-1000': 'native' };
      const name = adj => IMP[adj] || (adj >= 900 ? 'cached' : '');
      let procs, queue, killedNews;
      function reset() {
        procs = [
          { id: 'native', name: 'kernel + native daemons', mem: 6, adj: -1000, sys: true },
          { id: 'system', name: 'system_server', mem: 4, adj: -900, sys: true },
          { id: 'launcher', name: 'launcher', mem: 2, adj: 600 },
          { id: 'news', name: 'com.example.news', mem: 3, adj: 0 },
        ];
        queue = [['maps', 'com.example.maps', 5], ['camera', 'com.example.camera', 6], ['game', 'com.example.game', 9], ['browser', 'com.example.browser', 5], ['video', 'com.example.video', 7]];
        killedNews = false;
      }
      const bar = h('div', { class: 'osy-ram', role: 'img', 'aria-label': 'RAM use' });
      const list = h('div', { class: 'osy-plist' });
      const st = stats(['used', 'free', 'killed']);
      const msg = out('News is in the foreground. Open more apps and watch free RAM shrink. (A made-up 3 GB phone; sizes are illustrative.)');
      const R = runner(el);
      let killed = 0, fresh = null, dead = [];
      const used = () => procs.reduce((s, p) => s + p.mem, 0);
      function paint() {
        const u = used();
        bar.replaceChildren(...procs.map(p => h('div', { class: `osy-seg ${p.sys ? 'osy-s-sys' : p.adj === 0 ? 'osy-s-fg' : p.adj >= 900 ? 'osy-s-cache' : 'osy-s-mid'}`, style: `width:${(p.mem / TOTAL) * 100}%`, title: p.name }, p.mem >= 3 ? (p.sys ? p.id : p.name.replace('com.example.', '')) : '')));
        list.replaceChildren(...[...procs].sort((a, b) => b.adj - a.adj).map(p => h('div', { class: `osy-prow ${p.id === fresh ? 'osy-fresh' : ''}` },
          h('span', {}, p.name), pill(name(p.adj), p.adj === 0 ? 'osy-acc' : p.adj >= 900 ? 'osy-warm' : p.adj < 0 ? 'osy-ghost' : 'osy-ok'), h('span', { class: 'osy-adj' }, `adj ${p.adj}`))),
        ...dead.map(d => h('div', { class: 'osy-prow osy-killed' }, h('span', {}, d.name), pill('killed', 'osy-err'), h('span', { class: 'osy-adj' }, `adj ${d.adj}`))));
        st.set('used', `${(u / 10).toFixed(1)} of ${TOTAL / 10} GB`);
        st.set('free', `${(Math.max(0, TOTAL - u) / 10).toFixed(1)} GB`);
        st.set('killed', killed);
      }
      // Re-rank: newest foreground 0, the one before is "previous" 700, older apps cached 900, 910, ...
      function rank(fg) {
        const apps = procs.filter(p => !p.sys && p.id !== 'launcher' && p.adj !== 200);
        apps.sort((a, b) => (b.t || 0) - (a.t || 0));
        let c = 900;
        apps.forEach(p => { p.adj = p.id === fg ? 0 : p === apps.find(x => x.id !== fg) ? 700 : (c += 10) - 10; });
      }
      let clock = 1;
      async function lmkd(t) {
        while (used() > TOTAL - RESERVE) {
          const victims = procs.filter(p => p.adj > 0).sort((a, b) => b.adj - a.adj || b.mem - a.mem);
          if (!victims.length) { say(msg, 'Only the foreground and system are left. The next allocation fails.'); return; }
          const v = victims[0];
          say(msg, `Memory pressure is high (PSI). <b>lmkd</b> picks the highest oom_score_adj: <span class="bad">kill ${v.name}</span> (adj ${v.adj}, ${v.mem * 100} MB). No callback runs in that app.`);
          await sleep(1500); if (!R.live(t)) return;
          procs = procs.filter(p => p !== v); dead.push({ name: v.name, adj: v.adj }); killed++;
          if (v.id === 'news') killedNews = true;
          paint();
          await sleep(500); if (!R.live(t)) return;
        }
      }
      async function open() {
        const t = R.start();
        if (!queue.length) { say(msg, 'No more apps in this demo. Press Reset.'); return; }
        const [id, nm, mem] = queue.shift();
        procs.push({ id, name: nm, mem, adj: 0, t: ++clock });
        rank(id); fresh = id; dead = dead.slice(-3);
        paint();
        say(msg, `${nm} opens (${mem * 100} MB) and becomes the foreground app, adj 0. The app before it is now "previous" (700); older ones are cached (900+).`);
        await sleep(1500); if (!R.live(t)) return;
        if (used() > TOTAL - RESERVE) await lmkd(t);
        else if (R.live(t)) say(msg, `Still ${((TOTAL - used()) / 10).toFixed(1)} GB free. Nobody needs to die yet.`);
      }
      async function back() {
        const t = R.start();
        const p = procs.find(x => x.id === 'news');
        if (p) {
          p.t = ++clock; rank('news'); fresh = 'news'; paint();
          say(msg, 'The News process was still alive: a warm start. Everything in memory, including the ViewModel, is still there.');
          return;
        }
        say(msg, 'News has no process. Android asks the zygote for a new one: a <b>cold start</b>.');
        procs.push({ id: 'news', name: 'com.example.news', mem: 3, adj: 0, t: ++clock });
        dead = dead.filter(d => d.name !== 'com.example.news');
        rank('news'); fresh = 'news'; paint();
        await sleep(1600); if (!R.live(t)) return;
        say(msg, 'The Activity is recreated with its saved <code>Bundle</code>: <span class="good">the search query and scroll position come back</span>. The ViewModel is new and empty, so it reloads the article list from disk using that query.');
        await sleep(1800); if (!R.live(t)) return;
        if (used() > TOTAL - RESERVE) await lmkd(t);
      }
      async function music() {
        R.stop();
        if (procs.some(p => p.id === 'music')) { say(msg, 'Music is already playing.'); return; }
        procs.push({ id: 'music', name: 'com.example.music', mem: 2, adj: 200, t: ++clock });
        fresh = 'music'; paint();
        say(msg, 'A music app runs a foreground service with a notification. It is "perceptible", adj 200: the user would notice if it died, so lmkd leaves it for much later.');
        const t = R.start();
        await sleep(1200);
        if (R.live(t) && used() > TOTAL - RESERVE) await lmkd(t);
      }
      reset(); paint();
      el.append(h('div', { class: 'osy-stage' }, h('div', { class: 'osy-tlrow' }, label('RAM'), bar), st, list),
        h('div', { class: 'controls' }, act('Open next app', open), act('Start music (foreground service)', music), act('Back to News', back)), msg);
    },
    deeper: [
      {
        title: 'Reclaim comes before killing',
        body: `<p>When free memory drops, the kernel thread <code>kswapd</code> wakes up and reclaims pages in the background: clean file pages are dropped from the page cache, and anonymous pages are compressed into ZRAM. If an allocation can't wait, the allocating thread does the reclaim itself (direct reclaim), which shows up as jank. lmkd watches how long tasks stall on memory, and kills when the stalls cross its thresholds.</p>`,
      },
      {
        title: 'Importance becomes a number',
        body: `<p>The ranking you met in <a href="#os.processes">processes</a> turns into <code>oom_score_adj</code>. In AOSP the levels include foreground 0, visible 100, perceptible 200, service 500, home 600, previous 700, and cached 900 to 999. System processes are negative and are not killed this way. A started service that runs for a long time can be demoted toward cached. <code>dumpsys meminfo</code> groups processes by these levels.</p>`,
        code: `$ adb shell dumpsys meminfo
# Look for "Total PSS by OOM adjustment": Native, System, Persistent,
# Foreground, Visible, Perceptible, ... , Cached`,
      },
      {
        title: 'Test process death on purpose',
        body: `<p>Put your app in the background and kill it from adb. Then return to it from Recents. If the screen comes back empty or crashes, some state lived only in memory. Keep IDs and user input in saved state, and the data itself in Room or DataStore. See <a href="#android.viewmodel">ViewModel</a> and <a href="#android.savedstate">saved state</a>.</p>`,
        code: `# 1. open the app, type a search, press Home
$ adb shell am kill com.example.news
# 2. reopen from Recents: query and scroll position should be restored`,
      },
      {
        title: 'Give memory back before you are killed',
        body: `<p>Android tells you when it is a good time to shrink. <code>onTrimMemory</code> with <code>TRIM_MEMORY_UI_HIDDEN</code> means your UI is no longer visible: drop UI-only caches. <code>TRIM_MEMORY_BACKGROUND</code> means your process is a kill candidate: release what you can rebuild. A smaller cached process is a cheaper victim to keep around. From Android 14 the other legacy levels are no longer delivered.</p>`,
        code: `override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
    if (level >= ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN) imageCache.evictAll()
    if (level >= ComponentCallbacks2.TRIM_MEMORY_BACKGROUND) articleCache.clear()
}`,
      },
    ],
    mistakes: [
      { title: 'Holding user input only in the ViewModel', bad: 'class ComposeViewModel : ViewModel() {\n    var draft by mutableStateOf("")   // lost on process death\n}', good: 'class ComposeViewModel(handle: SavedStateHandle) : ViewModel() {\n    var draft by handle.saveable { mutableStateOf("") }\n}', why: 'A ViewModel survives rotation but not process death. <code>SavedStateHandle</code> writes into the saved-state Bundle that system_server keeps for the task.' },
      { title: 'Putting big data in saved state', bad: 'outState.putParcelableArrayList("articles", ArrayList(articles))   // 400 articles', good: 'outState.putLong("selectedId", selectedId)   // reload the list from Room', why: 'Saved state travels over Binder and is held by the system. Keep it small (the docs suggest under 50 KB). Store an ID and reload the data.' },
    ],
    terms: [
      { term: 'lmkd', def: 'Android’s low memory killer daemon. It watches memory pressure and kills the least important processes.' },
      { term: 'oom_score_adj', def: 'A per-process Linux value from -1000 to 1000. Higher means more likely to be killed when memory runs out.' },
      { term: 'PSI', def: 'Pressure stall information: kernel counters for how long tasks stall waiting on memory, CPU or I/O.' },
      { term: 'Process death', def: 'The system kills a background app’s process. The app gets no callback and must restore state on the next start.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Read the saved query as a flow that survives process death.', code: 'class SearchViewModel(private val handle: SavedStateHandle) : ViewModel() {\n    val query = handle.[[getStateFlow]]("query", "")\n    fun onQuery(q: String) { handle.[[set]]("query", q) }\n}', why: '<code>getStateFlow</code> reads the restored value, or the default, and emits on every write. <code>set</code> (or <code>handle["query"] = q</code>) stores it in saved state.' },
      { type: 'bug', prompt: 'After the system kills the app in the background, the search box comes back empty. Tap the line that ignores the restored value.', code: 'class SearchViewModel(private val handle: SavedStateHandle) : ViewModel() {\n    val query = MutableStateFlow("")\n    fun onQuery(q: String) {\n        query.value = q\n        handle["query"] = q\n    }\n}', bug: 1, fix: '    val query = MutableStateFlow(handle.get<String>("query") ?: "")', why: 'The query is saved, but the new ViewModel starts from an empty string and never reads it back. Start from the saved value, or use <code>getStateFlow</code>.' },
    ],
    quiz: [
      { q: 'Memory is short. Which process does lmkd kill first?', options: ['The foreground app (adj 0)', 'A music app with a foreground service (adj 200)', 'The previous app (adj 700)', 'A cached app the user hasn’t opened for an hour (adj 950)'], a: 3, why: 'lmkd picks the highest oom_score_adj first. The cached app is cheapest to lose, and the user may never come back to it.' },
      { q: 'Put what happens in order when the user returns to an app that was killed in the background.', options: ['zygote forks a new process → Application.onCreate → Activity recreated with saved Bundle → new ViewModel reloads data', 'Old process resumes → ViewModel restored → onResume', 'Activity recreated → zygote forks → Application.onCreate', 'onRestart → onStart → onResume in the old process'], a: 0, why: 'The old process is gone, so a new one starts from the zygote. The framework passes the saved Bundle to the recreated Activity; the ViewModel is brand new.' },
      { q: 'What does an app receive just before lmkd kills it?', options: ['onDestroy()', 'onTrimMemory(TRIM_MEMORY_COMPLETE)', 'Nothing; the process is killed with no callback', 'A broadcast'], a: 2, why: 'lmkd sends a kill signal. No code in the app runs. That is why state must already be saved by <code>onStop</code>.' },
      { q: 'Which of these survives process death?', options: ['A ViewModel field', 'A Kotlin <code>object</code>’s property', 'A value in <code>SavedStateHandle</code>', 'A coroutine launched in <code>viewModelScope</code>'], a: 2, why: 'Saved state is handed to the system and given back to the new process. Everything else lives in the old process’s memory and dies with it.' },
      { q: 'Your app has a 300 MB in-memory image cache while in the background. What is the trade-off?', options: ['None, cached apps are never killed', 'It makes your process a big, attractive victim; trimming it on TRIM_MEMORY_BACKGROUND helps you stay cached longer', 'It speeds up other apps', 'It moves the app to the foreground'], a: 1, why: 'Holding lots of memory in the background raises pressure and makes a cold start more likely. Release what you can rebuild.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  lessons.push({
    id: 'ipc',
    title: 'Interprocess communication and Binder',
    tagline: 'Processes can’t share memory by accident, so the kernel carries their messages.',
    level: 'advanced',
    body: `
<p>Processes are isolated, so any cooperation needs <em>interprocess communication</em> (IPC). Unix offers several kinds. A <em>pipe</em> is a one-way byte stream, as in <code>ls | grep</code>. A <em>socket</em> is a two-way channel, between machines or, as a Unix domain socket, on the same machine. <em>Shared memory</em> maps the same frames into both processes: the fastest option, but the two sides must synchronize themselves.</p>
<p>Android's main IPC is <em>Binder</em>, a kernel driver plus libraries for calling methods on objects in another process. The caller holds a proxy. A call packs the arguments into a <code>Parcel</code>, the driver copies it into the target process and tells it who the caller is (UID and PID), a thread from the target's Binder thread pool runs the method, and the reply comes back the same way.</p>
<p>Almost everything you do with the framework is a Binder call. <code>startActivity</code>, <a href="#android.intents">Intents</a>, <code>getSystemService</code> calls, and content providers all cross into system_server or another app this way. Watch an Intent travel in the demo, then send one that is too big.</p>`,
    code: `// IHeadlineService.aidl
interface IHeadlineService {
    List<String> latest(int count);
    oneway void markRead(long id);
}

// Client: once bound, call it like a local object
private val connection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName, binder: IBinder) {
        val service = IHeadlineService.Stub.asInterface(binder)
        lifecycleScope.launch(Dispatchers.IO) {
            val titles = service.latest(10)   // blocks this thread until the reply arrives
            service.markRead(42)              // oneway: returns at once
        }
    }
    override fun onServiceDisconnected(name: ComponentName) {}
}`,
    remember: 'A Binder call looks local but crosses processes: arguments are copied, the caller waits for the reply, and everything in flight shares a 1 MB buffer.',
    visual(el) {
      const mk = (title, kern) => { const slot = h('div', { class: 'osy-slot' }); const note = h('p', { class: 'osy-note' }); const box = h('div', { class: `osy-box ${kern ? 'osy-kbox' : ''}` }, h('h4', {}, title), slot, note); return { box, slot, note }; };
      const app = mk('Your app process'), drv = mk('Kernel: Binder driver', true), srv = mk('system_server');
      const thread = pill('main thread: running', 'osy-acc');
      const fill = h('i');
      const meter = h('div', { class: 'osy-meter', role: 'img', 'aria-label': 'Binder buffer use' }, fill);
      const used = h('span', { class: 'osy-stat' }, 'Binder buffer: 0 KB of 1 MB');
      const msg = out('Pick a call. The colored chip is the Parcel moving between processes.');
      const R = runner(el);
      const boxes = [app, drv, srv];
      function at(b, text, cls = '') {
        boxes.forEach(x => { x.slot.replaceChildren(); x.box.classList.remove('osy-on', 'osy-kon'); });
        if (b) { b.slot.append(h('span', { class: `osy-parcel ${cls}` }, text)); b.box.classList.add(b === drv ? 'osy-kon' : 'osy-on'); }
      }
      function buf(kb) {
        fill.style.width = `${Math.min(100, kb / 10.24)}%`;
        fill.className = kb > 1024 ? 'osy-over' : kb > 0 ? '' : 'osy-low';
        used.textContent = `Binder buffer: ${kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB'} of 1 MB`;
      }
      const setThread = (text, cls) => { thread.textContent = text; thread.className = `osy-pill ${cls}`; };
      async function call(kind) {
        const t = R.start();
        boxes.forEach(b => { b.note.textContent = ''; });
        const big = kind === 'big', one = kind === 'oneway';
        const size = big ? 2048 : 3;
        const label = one ? 'markRead(42)' : big ? 'Intent + 2 MB bitmap' : 'startActivity(Intent)';
        at(app, label, big ? 'osy-big' : '');
        app.note.innerHTML = 'The proxy writes the arguments into a Parcel.';
        say(msg, `The proxy in your process <b>marshals</b> the call: method id plus a flat copy of the arguments (${big ? '2 MB' : 'about 3 KB'}).`);
        await sleep(1300); if (!R.live(t)) return;
        at(drv, label, big ? 'osy-big' : ''); buf(size);
        if (big) {
          drv.note.textContent = 'Too big for the buffer.';
          await sleep(900); if (!R.live(t)) return;
          at(app, 'TransactionTooLargeException', 'osy-big'); buf(0);
          app.note.textContent = 'The call fails in your process.';
          say(msg, '<span class="bad">TransactionTooLargeException</span>. The Binder buffer is about 1 MB per process and is shared by every call in flight. Send a URI or an ID, not the bitmap.');
          return;
        }
        drv.note.textContent = 'Copies the Parcel into the target and stamps the caller’s UID 10145.';
        setThread(one ? 'main thread: running' : 'main thread: blocked, waiting', one ? 'osy-acc' : 'osy-err');
        say(msg, one ? 'A <code>oneway</code> call: the driver queues the transaction and your thread <b>returns immediately</b>. No reply will come.' : 'The driver copies the Parcel once, into system_server’s memory, and records who sent it. <b>Your calling thread now blocks</b> until the reply.');
        await sleep(1500); if (!R.live(t)) return;
        at(srv, label); buf(0);
        srv.note.textContent = one ? 'A Binder pool thread runs it later.' : 'A Binder pool thread checks Binder.getCallingUid(), resolves the Intent.';
        say(msg, one ? 'Later, a Binder thread in the target runs <code>markRead</code>. Your app has moved on.' : 'A thread from system_server’s Binder pool runs the activity manager: it checks the caller’s identity and permissions and resolves which Activity the Intent means.');
        await sleep(1700); if (!R.live(t)) return;
        if (one) { at(null); say(msg, 'Done. One-way calls are good for notifications, but you get no result and no exception from the other side.'); return; }
        at(drv, 'reply', 'osy-reply');
        drv.note.textContent = 'Copies the reply back.';
        await sleep(1100); if (!R.live(t)) return;
        at(app, 'reply', 'osy-reply'); setThread('main thread: running', 'osy-acc');
        app.note.textContent = 'startActivity() returns.';
        say(msg, '<span class="good">The reply arrives</span> and <code>startActivity</code> returns. system_server then makes its own Binder call into the target app’s process to create the Activity.');
      }
      buf(0);
      el.append(h('div', { class: 'osy-stage' }, h('div', { class: 'osy-row' }, thread), h('div', { class: 'osy-ipc' }, app.box, drv.box, srv.box), h('div', { class: 'osy-tlrow' }, used, meter)),
        h('div', { class: 'controls' }, act('startActivity(intent)', () => call('sync')), act('oneway call', () => call('oneway')), act('Intent with a 2 MB bitmap', () => call('big'))), msg);
    },
    deeper: [
      {
        title: 'Pipes and sockets',
        body: `<p>A pipe is a kernel buffer with a write end and a read end, both file descriptors. A reader blocks when it is empty and a writer blocks when it is full, which keeps two processes in step. Sockets work the same way but go both ways and can carry many connections. Android uses a Unix domain socket for system_server to ask the zygote for new processes.</p>`,
        code: `$ adb logcat | grep News      # the shell creates a pipe between two processes

// In app code, a socket to a local service
LocalSocket().use { s ->
    s.connect(LocalSocketAddress("news-debug"))
    s.outputStream.write("ping\\n".toByteArray())
}`,
      },
      {
        title: 'Shared memory',
        body: `<p>For large data, copying is the cost. Shared memory maps the same physical pages into both processes, so a write by one is instantly visible to the other, with no copy. The catch is that nothing orders the reads and writes for you. Android's <code>SharedMemory</code> class creates a region whose file descriptor can be sent over Binder; graphics buffers move between apps and the compositor in a similar way.</p>`,
      },
      {
        title: 'The server side is multithreaded',
        body: `<p>Incoming calls from other processes run on a pool of Binder threads in the receiving process, not on its main thread. Two clients can call the same method at the same moment, so the implementation must be thread-safe. Inside the call, <code>Binder.getCallingUid()</code> tells you who is calling, which the kernel guarantees.</p>`,
        code: `private val binder = object : IHeadlineService.Stub() {
    override fun latest(count: Int): List<String> {
        val caller = Binder.getCallingUid()        // set by the kernel, can’t be faked
        check(caller == allowedUid) { "not allowed" }
        return synchronized(lock) { headlines.take(count) }   // pool threads can race
    }
    override fun markRead(id: Long) { readIds.add(id) }       // a thread-safe set
}`,
      },
      {
        title: 'When the other process dies',
        body: `<p>The other side of a Binder can be killed at any time (see <a href="#os.low-memory">lmkd</a>). Calls to a dead process throw <code>DeadObjectException</code>, a <code>RemoteException</code>. <code>linkToDeath</code> lets you register a callback that runs when it happens, so you can rebind.</p>`,
      },
    ],
    mistakes: [
      { title: 'Big objects in Intent extras', bad: 'intent.putParcelableArrayListExtra("photos", ArrayList(bitmaps))', good: 'intent.putParcelableArrayListExtra("photoUris", ArrayList(uris))', why: 'Extras are copied through the Binder buffer, about 1 MB shared by the whole process. Send IDs or content URIs and let the other side load the data. See <a href="#data.share-files">sharing files</a>.' },
      { title: 'A slow remote call on the main thread', bad: 'button.setOnClickListener {\n    val titles = service.latest(50)   // remote: blocks until reply\n    show(titles)\n}', good: 'button.setOnClickListener {\n    lifecycleScope.launch {\n        val titles = withContext(Dispatchers.IO) { service.latest(50) }\n        show(titles)\n    }\n}', why: 'Binder calls are synchronous by default. If the other process is slow or busy, your main thread waits with it.' },
    ],
    terms: [
      { term: 'IPC', def: 'Interprocess communication: any way for separate processes to exchange data, such as pipes, sockets, shared memory or Binder.' },
      { term: 'Binder', def: 'Android’s IPC system: a kernel driver and libraries for calling methods on objects in another process.' },
      { term: 'Parcel', def: 'The flat container a Binder call packs its arguments into before the driver copies it across.' },
      { term: 'AIDL', def: 'Android Interface Definition Language. It generates the Stub (server) and proxy (client) code for a Binder interface.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make <code>markRead</code> fire-and-forget, and turn the raw binder into the interface.', code: 'interface IHeadlineService {\n    List<String> latest(int count);\n    [[oneway]] void markRead(long id);\n}\n\nval service = IHeadlineService.Stub.[[asInterface]](binder)', why: '<code>oneway</code> makes the call return as soon as the transaction is queued. <code>Stub.asInterface</code> wraps the <code>IBinder</code> in a proxy, or returns the local object if the service is in your own process.' },
      { type: 'bug', prompt: 'Sharing a gallery to the editor screen crashes with <code>TransactionTooLargeException</code>. Tap the line.', code: 'fun openEditor(context: Context, photos: List<Bitmap>) {\n    val intent = Intent(context, EditorActivity::class.java)\n    intent.putParcelableArrayListExtra("photos", ArrayList(photos))\n    context.startActivity(intent)\n}', bug: 2, fix: '    intent.putParcelableArrayListExtra("photoUris", ArrayList(photoUris))   // load bitmaps in EditorActivity', why: '<code>startActivity</code> sends the Intent through system_server over Binder. Full bitmaps blow past the 1 MB buffer. Pass URIs and decode on the other side.' },
    ],
    quiz: [
      { q: 'You call a normal (not oneway) AIDL method on a service in another app. What does your thread do while the service works?', options: ['Keeps running; the result arrives in a callback', 'Blocks until the reply comes back', 'Gets suspended like a coroutine', 'Is killed'], a: 1, why: 'Binder calls are synchronous by default. The caller blocks in the driver until the reply transaction arrives.' },
      { q: 'Which thread runs an incoming Binder call in your service process?', options: ['The main thread', 'A thread from the process’s Binder thread pool', 'A new thread per call that the client creates', 'The caller’s thread, moved across'], a: 1, why: 'Calls from other processes are dispatched on Binder pool threads in the receiving process, so the code must be thread-safe.' },
      { q: 'Two processes exchange 50 MB of video frames per second. Which IPC fits best?', options: ['Intent extras', 'A pipe, one byte at a time', 'Shared memory, with only a small Binder message to say a frame is ready', 'Writing each frame to a file'], a: 2, why: 'Copying that much data is the bottleneck. Shared memory avoids copies; Binder or a socket carries the small "frame ready" signal.' },
      { q: 'How does a service know which app is calling it?', options: ['The client passes its package name as an argument', '<code>Binder.getCallingUid()</code>, which the kernel driver fills in', 'It reads the Intent’s extras', 'It can’t know'], a: 1, why: 'The driver records the sender’s UID and PID with each transaction. An argument could be faked; the driver’s value can’t.' },
    ],
  });

  // 7 ─────────────────────────────────────────────
  lessons.push({
    id: 'files',
    title: 'Files, descriptors and storage',
    tagline: 'A file system turns names into blocks; a file descriptor is your handle to an open file.',
    level: 'intermediate',
    body: `
<p>A <em>file system</em> organizes storage into files and directories. Each file has an <em>inode</em> holding its owner, permissions, size and where its blocks are; a directory maps names to inodes. In Linux the <em>virtual file system</em> (VFS) layer gives one interface over many real file systems, so <code>open</code>, <code>read</code> and <code>write</code> work the same everywhere.</p>
<p><code>open()</code> returns a <em>file descriptor</em>: a small integer that indexes the process's table of open files. Every later call uses it, and <code>close()</code> frees the slot. Sockets, pipes and the Binder device are file descriptors too. A process has a limit on how many it can hold, so forgetting to close leaks them until calls start failing.</p>
<p>The kernel checks permissions on every open: owner, group and others, each with read, write and execute bits, plus SELinux. On Android your app-specific directory belongs to your UID and nobody else can enter it. Shared storage works differently: apps that target Android 10 or higher get <em>scoped storage</em> by default (Android 11 enforces it for apps that target 11+), with direct access only to their own directory and the media they created. Other files go through <code>MediaStore</code> or the system file picker. Try each kind of open in the demo.</p>`,
    code: `// App-specific storage: private to your UID, no permission needed
val file = File(context.filesDir, "articles.json")
file.writeText(json)

// use {} closes the file descriptor, even if an exception is thrown
val first = file.bufferedReader().use { it.readLine() }

// Shared media: go through MediaStore, not raw /sdcard paths
val values = ContentValues().apply {
    put(MediaStore.Images.Media.DISPLAY_NAME, "manset.jpg")
    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
}
val resolver = context.contentResolver
val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
uri?.let { resolver.openOutputStream(it)?.use { out -> bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out) } }`,
    remember: 'Open, use, close: always with use {}. Your files live in your app’s private directory; anything shared goes through MediaStore or the picker.',
    visual(el) {
      const LIMIT = 8;
      let fds;
      const table = h('div', { class: 'osy-fdt' });
      const meta = h('div', { class: 'osy-row' });
      const msg = out('This is com.example.news’s file descriptor table, running as uid u0_a145. The demo limit is 8 slots; real limits are much higher.');
      function reset() { fds = [{ fd: 0, path: 'standard input', std: true }, { fd: 1, path: 'standard output', std: true }, { fd: 2, path: 'standard error', std: true }]; }
      function paint(newFd) {
        table.replaceChildren(label('open files'), ...fds.map(f => h('div', { class: `osy-fd ${f.std ? 'osy-fd-std' : ''} ${f.leak ? 'osy-fd-leak' : ''} ${f.fd === newFd ? 'osy-fd-new' : ''}` }, h('b', {}, String(f.fd)), h('span', {}, f.path))));
      }
      const lowest = () => { for (let i = 0; ; i++) if (!fds.some(f => f.fd === i)) return i; };
      function showMeta(path, owner, mode, verdict, cls) {
        meta.replaceChildren(pill(path, 'osy-ghost'), pill(`owner ${owner}`), pill(mode), pill(verdict, cls));
      }
      function openOwn() {
        if (fds.length >= LIMIT) { say(msg, '<span class="bad">EMFILE: too many open files</span>. Every open fails now, even sockets. Close what you opened.'); return; }
        const fd = lowest();
        fds.push({ fd, path: '/data/user/0/com.example.news/files/cache.json' }); paint(fd);
        showMeta('files/cache.json', 'u0_a145', 'rw-------', 'allowed', 'osy-ok');
        say(msg, `<code>open()</code> returned <span class="good">fd ${fd}</span>, the lowest free slot. The kernel checked: owner u0_a145 is the caller, read and write allowed.`);
      }
      function read() {
        const f = [...fds].reverse().find(x => !x.std);
        if (!f) { say(msg, 'Nothing open to read. Open cache.json first.'); return; }
        paint(f.fd);
        say(msg, `<code>read(${f.fd}, buffer, 8192)</code>: the kernel looks up slot ${f.fd}, finds the open file and its current offset, and copies up to 8 KB. The offset moves forward, so the next read continues from there.`);
      }
      function close() {
        const i = fds.map(x => !x.std).lastIndexOf(true);
        if (i < 0) { say(msg, 'Nothing to close.'); return; }
        const [f] = fds.splice(i, 1); paint();
        say(msg, `<code>close(${f.fd})</code> frees the slot. The next <code>open()</code> can reuse number ${f.fd}.`);
      }
      function other() {
        paint();
        showMeta('/data/data/com.example.maps/files/home.db', 'u0_a146', 'rwx------ dir', 'EACCES', 'osy-err');
        say(msg, '<span class="bad">EACCES</span>: the directory belongs to u0_a146 with no rights for others. No file descriptor is created. This is the app sandbox doing its job.');
      }
      function dcim() {
        paint();
        showMeta('/sdcard/DCIM/Camera/IMG_0042.jpg', 'another app’s media', 'shared storage', 'not visible', 'osy-err');
        say(msg, 'Scoped storage (target Android 10+): a raw path into another app’s photos fails. Ask <code>MediaStore</code> (with the media permission) or let the user pick the file with the system picker, which hands you a <code>content://</code> URI.');
      }
      function leak() {
        let n = 0;
        while (fds.length < LIMIT) { fds.push({ fd: lowest(), path: 'files/cache.json (never closed)', leak: true }); n++; }
        paint();
        showMeta('files/cache.json', 'u0_a145', 'rw-------', 'table full', 'osy-err');
        say(msg, `A loop called <code>FileInputStream(file)</code> without closing it. ${n ? `${n} more slots` : 'The slots'} filled up. The next open, socket or even Binder call that needs a descriptor fails with <span class="bad">too many open files</span>. Press Close to release them one by one, or Reset.`);
      }
      reset(); paint(); showMeta('no file selected', '-', '-', 'idle', 'osy-ghost');
      el.append(h('div', { class: 'osy-stage' }, meta, table),
        h('div', { class: 'controls' }, act('open cache.json', openOwn), act('read', read), act('close', close), act('open Maps’ file', other), act('open /sdcard/DCIM photo', dcim), act('Leak in a loop', leak)), msg);
    },
    deeper: [
      {
        title: 'Writes go to RAM first',
        body: `<p><code>write()</code> usually returns once the data is in the kernel's page cache, not on flash. The kernel writes it out later. If the phone loses power in between, the file can be half old and half new. To be safe, write to a temporary file, flush it to storage with <code>fsync</code>, then rename it over the original. A rename within one file system is atomic: readers see either the old file or the new one. <code>AtomicFile</code> does all of that.</p>`,
        code: `val atomic = AtomicFile(File(context.filesDir, "settings.json"))
val out = atomic.startWrite()
try {
    out.write(json.toByteArray())
    atomic.finishWrite(out)   // syncs, then renames over the old file
} catch (e: IOException) {
    atomic.failWrite(out)     // the old file is untouched
}`,
      },
      {
        title: 'Everything is a file descriptor',
        body: `<p>Sockets, pipes, the Binder device and memory regions all live in the same descriptor table. That is why a leak of one kind (say, unclosed HTTP responses) can make an unrelated part fail. Binder can even send a descriptor to another process: <code>ParcelFileDescriptor</code> is how a <code>ContentProvider</code> hands you an open file you have no path to.</p>`,
        code: `resolver.openFileDescriptor(uri, "r")?.use { pfd ->
    FileInputStream(pfd.fileDescriptor).use { input -> decode(input) }
}`,
      },
      {
        title: 'Which storage to pick',
        body: `<p>App-specific files (<code>filesDir</code>, <code>cacheDir</code>) need no permission and are removed with the app. Shared media goes through <code>MediaStore</code>. Documents the user picks go through the Storage Access Framework. Structured data belongs in Room or DataStore. See <a href="#data.files">files</a>, <a href="#data.share-files">sharing files</a> and <a href="#security.at-rest">data at rest</a>.</p>`,
      },
    ],
    mistakes: [
      { title: 'Forgetting to close', bad: 'val text = FileInputStream(file).bufferedReader().readText()   // descriptor stays open', good: 'val text = file.bufferedReader().use { it.readText() }', why: 'The descriptor is freed only when the stream is closed or, much later, when the GC finalizes it. In a loop that leaks until opens start failing.' },
      { title: 'Hardcoded /sdcard paths', bad: 'File("/sdcard/Download/report.pdf").writeBytes(bytes)', good: 'val values = ContentValues().apply { put(MediaStore.Downloads.DISPLAY_NAME, "report.pdf") }\nval uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)\nuri?.let { resolver.openOutputStream(it)?.use { out -> out.write(bytes) } }', why: 'Under scoped storage, raw paths into shared folders don’t work for files you don’t own, and the path differs between devices and users. MediaStore gives you a URI that works.' },
    ],
    terms: [
      { term: 'File descriptor', def: 'A small integer that refers to an open file, socket or pipe in a process’s table.' },
      { term: 'Inode', def: 'The file system record for one file: owner, permissions, size and where the data blocks are.' },
      { term: 'Page cache', def: 'File data the kernel keeps in RAM so repeated reads skip storage and writes can be flushed later.' },
      { term: 'Scoped storage', def: 'The Android model, default for apps targeting Android 10+, that limits direct shared-storage access to the app’s own files.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Read the file and make sure the descriptor is closed even on an exception.', code: 'val text = File(context.[[filesDir]], "articles.json")\n    .bufferedReader()\n    .[[use]] { it.readText() }', why: '<code>filesDir</code> is your private app directory. <code>use</code> calls <code>close()</code> in a finally block.' },
      { type: 'bug', prompt: 'This saves a report to a hardcoded shared-storage path, which scoped storage does not support. Tap the line to replace.', code: 'fun saveReport(context: Context, bytes: ByteArray) {\n    val out = File("/sdcard/Download/news-report.pdf")\n    out.writeBytes(bytes)\n}', bug: 1, fix: '    val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, ContentValues().apply { put(MediaStore.Downloads.DISPLAY_NAME, "news-report.pdf") })', why: 'Under scoped storage, the <code>File</code> API is only guaranteed for your app-specific directory and media your app created, and <code>/sdcard</code> is not the same path on every device or user. Insert into <code>MediaStore.Downloads</code> and write through the returned URI.' },
    ],
    quiz: [
      { q: 'A new process has descriptors 0, 1 and 2 open. You open a file, then a socket, then close the file and open another file. What number does the last file get?', options: ['3', '4', '5', '6'], a: 0, why: 'The file got 3, the socket 4. Closing frees 3, and <code>open</code> returns the lowest free number, so the new file gets 3 again.' },
      { q: 'A crash log shows "Too many open files" in an HTTP call. What is the likely cause?', options: ['The disk is full', 'Something leaks descriptors, such as unclosed streams or responses; sockets share the same table', 'The network is down', 'The heap limit was hit'], a: 1, why: 'Sockets are descriptors too. A leak anywhere in the process fills the table and makes every new open fail.' },
      { q: 'Your app writes settings.json and the phone dies mid-write. How do you make sure the old file stays readable?', options: ['Write twice', 'Write to a temporary file, sync it, then rename it over the original (AtomicFile)', 'Use a bigger buffer', 'Write from the main thread'], a: 1, why: 'Rename within one file system is atomic, so readers see the old or the new version, never a half-written one.' },
      { q: 'Which access needs no permission at all?', options: ['Reading another app’s photos', 'Writing to your own <code>filesDir</code>', 'Reading /sdcard/DCIM by path', 'Listing another app’s private directory'], a: 1, why: 'Your app-specific directory belongs to your UID. The others are blocked by the sandbox or by scoped storage.' },
    ],
  });

  // 8 ─────────────────────────────────────────────
  lessons.push({
    id: 'power',
    title: 'Power, interrupts and wakelocks',
    tagline: 'A phone saves battery by sleeping; every wakeup you cause costs energy.',
    level: 'advanced',
    body: `
<p>The CPU talks to devices (network chip, touch screen, storage) through I/O. It could <em>poll</em>, asking a device again and again whether it has data, but that keeps the CPU busy. Instead a device raises an <em>interrupt</em>: a signal that makes the CPU stop what it is doing, run the kernel's handler, and go back. Devices can also copy data into RAM themselves (DMA) and interrupt only when done.</p>
<p>When there is nothing to run, the kernel puts a CPU core into an <em>idle state</em>. Deeper states save more power but take longer to wake from. With the screen off and nothing to do, Android goes further and <em>suspends</em> the whole system. An interrupt, such as a network packet or an alarm, wakes it.</p>
<p>A <em>wakelock</em> is a request to stay awake: with a partial wakelock the CPU keeps running with the screen off. That is why background limits exist. One app holding a wakelock or waking the phone every minute keeps it from sleeping, and the battery pays. Since Android 6.0, <a href="#background.doze">Doze</a> ignores app wakelocks and batches work into maintenance windows. Compare the battery meter across the buttons.</p>`,
    code: `// Prefer: let the system pick a good moment and batch with other apps
val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)
    .setRequiresBatteryNotLow(true)
    .build()
val sync = PeriodicWorkRequestBuilder<SyncWorker>(1, TimeUnit.HOURS)
    .setConstraints(constraints)
    .build()
WorkManager.getInstance(context)
    .enqueueUniquePeriodicWork("sync", ExistingPeriodicWorkPolicy.KEEP, sync)

// Only if you truly must keep the CPU on: short, tagged, with a timeout
val pm = context.getSystemService(PowerManager::class.java)
val lock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "news:export")
lock.acquire(60_000L)
try { exportArticles() } finally { if (lock.isHeld) lock.release() }`,
    remember: 'A sleeping phone is a happy battery. Let the system wake you (WorkManager, FCM, alarms) instead of keeping it awake yourself.',
    visual(el) {
      const N = 36;
      const cells = Array.from({ length: N }, () => h('div', { class: 'osy-cell' }));
      const tl = h('div', { class: 'osy-tl', style: `--n:${N}` }, cells);
      const fill = h('i', { class: 'osy-low' });
      const meter = h('div', { class: 'osy-meter', role: 'img', 'aria-label': 'Energy used' }, fill);
      const st = stats(['state', 'energy used', 'wakeups']);
      const msg = out('Each cell is a stretch of time with the screen off. Pick what happens. (Energy costs are illustrative units.)');
      const R = runner(el);
      const COST = { A: 6, I: 2, S: 0.2, L: 4 };
      const CLS = { A: 'osy-c-active', I: 'osy-c-idle', S: 'osy-c-sleep', L: 'osy-c-lock' };
      const NAME = { A: 'running', I: 'idle', S: 'suspended', L: 'awake (wakelock)' };
      let pos = 0, energy = 0, wakes = 0, doze = false;
      function reset() { pos = 0; energy = 0; wakes = 0; cells.forEach(c => { c.className = 'osy-cell'; }); fill.style.width = '0%'; st.set('state', 'suspended'); st.set('energy used', 0); st.set('wakeups', 0); }
      async function play(seq, text, end, t) {
        say(msg, text);
        if (pos + seq.length > N) { cells.forEach(c => { c.className = 'osy-cell'; }); pos = 0; }
        for (const s of seq) {
          cells[pos].className = `osy-cell ${CLS[s]}`;
          pos++;
          energy += COST[s];
          st.set('state', NAME[s]);
          st.set('energy used', Math.round(energy));
          fill.style.width = `${Math.min(100, energy / 2)}%`;
          fill.className = energy > 140 ? 'osy-over' : energy > 60 ? '' : 'osy-low';
          await sleep(110);
          if (!R.live(t)) return false;
        }
        say(msg, end);
        return true;
      }
      const go = (seq, text, end, wake) => { const t = R.start(); if (wake) st.set('wakeups', ++wakes); play(seq, text, end, t); };
      el.append(h('div', { class: 'osy-stage' },
        h('div', { class: 'osy-tlrow' }, label('CPU over time'), tl),
        h('div', { class: 'osy-legend' }, ...Object.keys(CLS).map(k => h('span', { class: 'osy-key' }, h('i', { class: `osy-cell ${CLS[k]}`, style: 'height:12px' }), NAME[k]))),
        h('div', { class: 'osy-tlrow' }, label('battery energy used'), meter), st),
        h('div', { class: 'controls' },
          act('Nothing to do', () => go(['A', 'I', 'I', 'S', 'S', 'S', 'S', 'S'], 'The last work finishes, cores go idle, and with no wakelock held the system suspends.', 'Suspended: almost no power. This is where a phone should spend most of the night.')),
          act('Packet arrives', () => go(['A', 'A', 'I', 'S', 'S', 'S'], 'The network chip raises an <b>interrupt</b>. The CPU wakes, the kernel handler runs, the packet is handed to the app (an FCM message, say).', 'Handled in a moment, then straight back to sleep. Short wakeups are cheap; frequent ones add up.', true)),
          act('App holds a wakelock', () => go(doze ? ['A', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] : ['L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L'], doze ? 'The app acquires a <code>PARTIAL_WAKE_LOCK</code>, but the device is in Doze.' : 'An app acquires a <code>PARTIAL_WAKE_LOCK</code> and polls a server in a loop. The system cannot suspend.', doze ? 'Doze <b>ignores app wakelocks</b>, so the system suspends anyway. The work waits for a maintenance window.' : '<span class="bad">The CPU never sleeps</span>. In this demo’s units, ten cells of this cost as much as two hundred cells of suspend. This is the battery drain background limits are there to stop.')),
          act(doze ? 'Leave Doze' : 'Enter Doze', function () {
            doze = !doze; this.textContent = doze ? 'Leave Doze' : 'Enter Doze';
            go(['I', 'S', 'S', 'S'], doze ? 'The screen has been off and the phone still for a while: <b>Doze</b> starts. Network off for apps, wakelocks ignored, jobs and alarms deferred.' : 'The user picks up the phone: Doze ends.', doze ? 'In Doze. Try the wakelock button again.' : 'Out of Doze. Apps run normally.');
          }),
          act('Maintenance window', () => go(['A', 'A', 'A', 'A', 'I', 'S', 'S', 'S'], 'Doze opens a short <b>maintenance window</b>: pending jobs, syncs and alarms from all apps run together, with network.', 'Batched: one wakeup did the work of many. The windows get further apart the longer the phone sits still.', true))),
        msg);
      reset();
    },
    deeper: [
      {
        title: 'Polling versus interrupts',
        body: `<p>Polling is simple and has low latency when data arrives constantly, but it burns CPU time when nothing happens. Interrupts cost a little per event and nothing while waiting. App code makes the same choice one level up: checking a server every minute is polling, while a push message from <a href="#push.fcm">FCM</a> is the interrupt version, one shared connection waking the phone only when there is news.</p>`,
      },
      {
        title: 'Idle states have a price',
        body: `<p>The kernel's idle governor picks a state for an idle core. Each state has an exit latency, how long it takes to resume, and a target residency, how long the core must stay there to save energy overall. A core woken every few milliseconds never reaches the deep states. That is why many small, scattered wakeups cost more than one batched burst.</p>`,
      },
      {
        title: 'Wakelocks in practice',
        body: `<p>Holding a wakelock needs the <code>WAKE_LOCK</code> permission. Always pass a timeout to <code>acquire</code>, release it in <code>finally</code>, and tag it with your package and class so it is easy to find in battery stats. Most of the time you don't need one: WorkManager holds one for you while a worker runs, and a <a href="#background.fgs">foreground service</a> is the tool for long user-visible work.</p>`,
        code: `<uses-permission android:name="android.permission.WAKE_LOCK" />

$ adb shell dumpsys power | grep -i wake_lock   # who is holding wakelocks now`,
      },
      {
        title: 'Why the limits keep growing',
        body: `<p>Each Android release has added limits on background work: Doze and App Standby in 6.0, background execution limits later, then standby buckets and restrictions on starting foreground services. The OS reason is always the same. The system can only sleep when no one is holding it awake, and one careless app can drain a whole battery. Work with the system: <a href="#background.workmanager">WorkManager</a> for deferrable work, <a href="#background.alarms">exact alarms</a> only when the time really matters.</p>`,
      },
    ],
    mistakes: [
      { title: 'A wakelock without timeout or finally', bad: 'lock.acquire()\nsyncAll()\nlock.release()', good: 'lock.acquire(60_000L)\ntry { syncAll() } finally { if (lock.isHeld) lock.release() }', why: 'If <code>syncAll</code> throws, the lock is never released and the phone stays awake. The timeout is a safety net; <code>finally</code> is the real fix.' },
      { title: 'Polling on a timer', bad: 'handler.postDelayed(object : Runnable {\n    override fun run() { checkForNews(); handler.postDelayed(this, 60_000) }\n}, 60_000)', good: '// Server sends an FCM message when there is news;\n// WorkManager runs a periodic catch-up sync with constraints', why: 'A check every minute wakes the radio and CPU 1,440 times a day, mostly for nothing. A push message wakes the phone only when there is something to show.' },
    ],
    terms: [
      { term: 'Interrupt', def: 'A signal from a device that makes the CPU pause and run a kernel handler.' },
      { term: 'Idle state', def: 'A low-power CPU state. Deeper states save more power but take longer to exit.' },
      { term: 'Wakelock', def: 'A request that keeps the CPU (or screen) awake. A partial wakelock keeps only the CPU on.' },
      { term: 'Doze', def: 'An Android mode, since 6.0, that defers background work into maintenance windows while the phone is unused.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Keep only the CPU awake, for at most one minute.', code: 'val lock = pm.newWakeLock(PowerManager.[[PARTIAL_WAKE_LOCK]], "news:export")\nlock.[[acquire]](60_000L)\ntry { export() } finally { if (lock.isHeld) lock.release() }', why: 'A partial wakelock keeps the CPU on while the screen can turn off. <code>acquire(timeout)</code> releases it automatically if your code never does.' },
      { type: 'bug', prompt: 'Battery stats show this app keeping the phone awake for hours after a failed export. Tap the line that causes it.', code: 'fun export() {\n    lock.acquire()\n    writeAllArticles()   // can throw IOException\n    lock.release()\n}', bug: 1, fix: '    lock.acquire(60_000L)   // and release it in a finally block', why: 'With no timeout, an exception in <code>writeAllArticles</code> skips <code>release()</code> and the lock is held forever. Add a timeout and release in <code>finally</code>.' },
    ],
    quiz: [
      { q: 'The phone is in Doze and your app holds a partial wakelock. What happens?', options: ['The wakelock keeps the CPU on as usual', 'Doze ignores the wakelock; the work waits for a maintenance window', 'The app is killed', 'The screen turns on'], a: 1, why: 'Doze ignores app wakelocks, cuts network access and defers jobs and alarms until the next maintenance window.' },
      { q: 'Why is waking the phone every minute worse than one sync every hour, even if each wakeup is short?', options: ['It isn’t; total CPU time is the same', 'Each wakeup costs fixed energy to exit idle states and power up the radio, and the CPU never reaches deep sleep', 'Short wakeups are blocked by Android', 'It uses more RAM'], a: 1, why: 'Waking has a fixed cost, and deep idle states need long quiet stretches to pay off. Batching saves both.' },
      { q: 'A news app must show breaking news within seconds, even at night. Which design fits the OS best?', options: ['A foreground service polling every 10 seconds', 'A partial wakelock held all night', 'A high-priority FCM message sent by the server when news breaks', 'An exact alarm every minute'], a: 2, why: 'The interrupt-style design: the system keeps one shared connection and wakes your app only when there is news. The others keep the phone awake for nothing.' },
      { q: 'What does an interrupt let the CPU avoid?', options: ['Running the kernel', 'Polling devices in a loop while waiting for data', 'Context switches', 'Using RAM'], a: 1, why: 'With interrupts the CPU can idle, or run other work, and the device signals when it needs attention.' },
    ],
  });

  Lab.addTrack({
    id: 'os',
    title: 'Operating systems',
    description: 'Kernel, processes, threads, memory, IPC, files and power the way a university OS course teaches them, and where each one shows up on Android.',
    requires: ['kotlin'],
    css,
    lessons,
  });
})();
