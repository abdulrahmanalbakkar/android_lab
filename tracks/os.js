/* Operating systems track. Same shape as tracks/kotlin.js.
   Beginner lessons on what the OS does (kernel, processes, threads, memory, IPC, files, power), each followed by
   where the idea shows up on Android, which runs on a Linux kernel. Every class is prefixed osy-. */
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
  

  // 2 ─────────────────────────────────────────────
  

  // 3 ─────────────────────────────────────────────
  

  // 4 ─────────────────────────────────────────────
  

  // 5 ─────────────────────────────────────────────
  

  // 6 ─────────────────────────────────────────────
  

  // 7 ─────────────────────────────────────────────
  

  // 8 ─────────────────────────────────────────────
  

  Lab.addTrack({
    id: 'os', lang: 'shell',
    title: 'Operating systems',
    description: 'What happens inside your phone when apps run: how it shares out time, memory, files and battery between them, and why apps freeze or close. Tried with simple terminal commands, then linked to Android.',
    requires: ['kotlin'],
    css,
    lessons: [
      {
        id: 'what-os',
        title: 'What an operating system does',
        tagline: 'The program that runs all the other programs.',
        goals: ['Say what an operating system does for the apps on your phone', 'Explain what the kernel is', 'Find out which kernel a computer runs with <code>uname</code>'],
        level: 'beginner', introduces: ['uname', '-r'],
        body: `
<p>Your phone runs a camera app, a music app and a chat app, and none of them was written for your exact phone model. Yet each one can take a photo, play a sound and save a file. The program that makes this possible is the <em>operating system</em> (OS): Android or iOS on phones, Windows, macOS or Linux on computers.</p>
<p>The OS sits between the apps and the <em>hardware</em>, the physical parts: the processor (CPU) that runs instructions, the memory, the storage chip, the screen, the camera. An app never talks to the hardware itself. It asks the OS, “save this photo”, and the OS does it. This is <em>hardware abstraction</em>: the app only needs the simple request, not the details of this phone’s storage chip. For each part, the OS has a <em>driver</em>, a small piece of code that knows how to talk to that exact part.</p>
<p>The heart of the OS is the <em>kernel</em>: the part that controls the hardware and decides which program may do what. Android is built on the Linux kernel, the same kernel that runs on many computers and servers. The rest of the OS, like the home screen, the settings and the notifications, is made of programs that run on top of the kernel.</p>
<p>This track shows commands in the terminal of a Linux computer, because Android runs on Linux. Most also work on a Mac; on Windows, Git Bash has some of them, or you can read along. <code>uname</code> prints the name of the kernel, and <code>uname -r</code> prints its version (<code>-r</code> for release).</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'cam', label: 'Camera app', sub: 'a program' },
              { id: 'kern', label: 'Kernel', sub: 'heart of the OS' },
              { id: 'drv', label: 'Driver', sub: 'knows this chip' },
              { id: 'hw', label: 'Storage chip', sub: 'hardware' },
            ],
            predict: {
              q: 'The camera app has a photo to save on the phone’s storage chip. Who actually writes it onto the chip?',
              options: ['The camera app writes it directly', 'The operating system, after the app asks', 'The photo saves itself'],
              a: 1,
              why: 'Apps never touch the hardware. They ask the OS, and the kernel and its driver do the work.',
            },
            frames: [
              { say: 'You tap the shutter button, and the camera app has a photo to save. Follow the request.' },
              { at: 'cam', packet: 'photo', say: 'The photo starts inside the camera app. The app can’t reach the storage chip: it has to ask.' },
              { at: 'kern', packet: 'save photo', tone: 'warm', mark: { kern: 'warm' }, say: 'The app asks the kernel: “save this photo as a file”. The kernel checks that the camera app is allowed to save there.' },
              { at: 'drv', packet: 'write', tone: 'warm', say: 'The kernel hands the job to the driver for this phone’s storage chip. Another phone has a different chip and a different driver, but the app’s request is the same.' },
              { at: 'hw', packet: 'photo', tone: 'warm', mark: { hw: 'warm' }, say: 'The driver writes the photo onto the chip.' },
              { at: 'kern', packet: 'done', tone: 'ok', say: 'The answer travels back up: the kernel tells the app the file is saved.' },
              { at: 'cam', packet: 'saved', tone: 'ok', mark: { cam: 'ok' }, say: 'The app shows the photo in your gallery. It never touched the hardware. That is hardware abstraction.' },
            ],
          });
        },
        code: `uname          # the name of the kernel
# Linux
uname -r       # its version (r for release)
# 6.8.0-45-generic

# On a Mac, uname prints Darwin, the kernel of macOS.`,
        remember: 'Apps never touch the hardware. They ask the operating system, and its kernel does the work.',
        terms: [
          { term: 'operating system (OS)', def: 'The program that runs all the other programs and shares the hardware between them, such as Android, Windows or Linux.' },
          { term: 'kernel', def: 'The heart of the OS: it controls the hardware and decides which program may do what. Android uses the Linux kernel.' },
          { term: 'hardware', def: 'The physical parts of a device: CPU, memory, storage, screen, camera.' },
          { term: 'hardware abstraction, driver', def: 'Apps make simple requests like “save this file”, and the OS turns them into work on the real parts. A driver is the code that knows one exact part.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print the name of the kernel this computer runs.', code: '[[uname]]\n# Linux', why: '<code>uname</code> on its own prints the kernel’s name.' },
          { type: 'bug', prompt: 'Ada wants to see where she is, then the version of the kernel. The second command prints only <code>Linux</code>. Tap the line to fix.', code: 'pwd\nuname', bug: 1, fix: 'uname -r', why: '<code>uname</code> prints the name. Add <code>-r</code> (release) to get the version.' },
        ],
        quiz: [
          { q: 'A music app wants to play a sound. How does it reach the speaker?', options: ['It asks the OS, which uses the speaker’s driver', 'It sends electricity to the speaker itself', 'It needs a different version for every phone model'], a: 0, why: 'Hardware abstraction: the app asks, and the OS and its driver handle the real part.' },
          { q: 'Which part of the OS controls the hardware?', options: ['The home screen', 'The kernel', 'The settings app'], a: 1, why: 'The home screen and settings are programs on top of the kernel.' },
          { q: 'Android is built on which kernel?', options: ['Windows', 'Linux', 'Darwin'], a: 1, why: 'Android uses the Linux kernel. Darwin is the kernel of macOS.' },
        ],
        docs: [['Android platform architecture', 'https://developer.android.com/guide/platform'], ['uname(1) manual', 'https://man7.org/linux/man-pages/man1/uname.1.html']],
      },

      {
        id: 'processes',
        title: 'Processes',
        tagline: 'A running program, in its own walled-off space.',
        goals: ['Tell a program from a process', 'Explain why one app crashing doesn’t crash the others', 'List running processes with <code>ps</code>'],
        level: 'beginner', introduces: ['ps', '-e'],
        body: `
<p>When a chat app on your phone crashes, your music keeps playing. That is no accident: the operating system keeps every running app in its own separate space.</p>
<p>A <em>program</em> is the app as it is stored: a file of instructions. When you open it, the OS starts a <em>process</em>: that program running, with its own piece of memory to keep its values in, and a number called the <em>PID</em> (process ID). Open two apps and you have two processes. The OS builds a wall between them, called <em>memory isolation</em>: one process can’t read or change another one’s memory. If one crashes, only its own process ends.</p>
<p>Every process has a life, the <em>process lifecycle</em>. It is created when a program starts. It runs, and often waits (for a tap, a file, the network). Finally it ends: it finished, it crashed, or it was closed. Open the same app again and you get a brand-new process.</p>
<p>On a computer, <code>ps</code> (process status) lists the processes started from this terminal, and <code>ps -e</code> lists every process on the computer. Even <code>ps</code> shows up: while it runs, it is a process too. The PID column is the number, CMD is the program’s name, TTY is the terminal that started it (<code>?</code> means none), and TIME is how much CPU time it has used.</p>`,
        visual(el) {
          const list = h('div', { class: 'osy-tree' });
          const stage = h('div', { class: 'osy-stage' }, label('Processes on the phone'), list);
          const P = (name, pid, mem, state, cls = '') => ({ name, pid, mem, state, cls });
          const home = P('Home screen', 812, 'app icons', 'waiting');
          const notes = (state, cls = '') => P('Notes', 4821, '“Buy milk”', state, cls);
          const tone = { running: 'osy-acc', waiting: 'osy-ghost', blocked: 'osy-err', 'ended: crashed': 'osy-err' };
          const frames = [
            { procs: [home], say: 'The phone is on, showing the home screen. The home screen is a program too, so it has its own process. (The system’s own processes are left out.)' },
            { procs: [home, notes('running', 'osy-new')], say: 'You open Notes. The OS creates a process for it, with a PID and its own memory. Notes keeps your text there.' },
            { procs: [home, notes('waiting'), P('Music', 4907, 'song “Rain”, at 1:12', 'running', 'osy-new')], say: 'You open Music. One more program running, one more process, with its own memory. Notes has nothing to do, so it waits.' },
            { procs: [home, notes('running', 'osy-hot'), P('Music', 4907, 'song “Rain”, at 1:15', 'blocked', 'osy-deny')], say: 'A bug in Notes tries to reach Music’s memory, but Notes has no way in: the OS gives each process only its own memory. This is memory isolation.' },
            { procs: [home, notes('waiting'), P('Music', 4907, 'cleaned up', 'ended: crashed', 'osy-dead')], say: 'Then Music hits a bug of its own and crashes. Only its process ends, and the OS cleans up its memory.' },
            { procs: [home, notes('running', 'osy-hot')], say: 'Notes is untouched: your text is still in its memory. A crash stays inside one process.' },
            { procs: [home, notes('waiting'), P('Music', 5012, 'no song yet', 'running', 'osy-new')], say: 'Open Music again, and the OS starts a brand-new process, with a new PID and empty memory.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Notes and Music are both open. Music crashes. What happens to Notes?',
              options: ['Notes crashes too', 'Notes keeps running, with its text still there', 'Notes starts again from the beginning'],
              a: 1,
              why: 'Each app is its own process with its own memory. A crash ends only the process it happens in.',
            },
            draw(f) {
              list.replaceChildren(...f.procs.map(p => h('div', { class: `osy-proc ${p.cls}` },
                h('div', { class: 'osy-ptop' }, h('span', { class: 'osy-pname' }, p.name), pill(p.state, tone[p.state])),
                h('span', { class: 'osy-pmeta' }, `PID ${p.pid} · memory: ${p.mem}`))));
            },
          });
        },
        code: `ps        # the processes started from this terminal
#   PID TTY          TIME CMD
#  5645 pts/0    00:00:00 bash
#  5647 pts/0    00:00:00 ps

ps -e     # every process on the computer (lines cut)
#   PID TTY          TIME CMD
#     1 ?        00:00:02 systemd   # the first process Linux starts
#  5645 pts/0    00:00:00 bash
#  5651 pts/0    00:00:00 ps`,
        remember: 'A process is a running program with its own memory and PID. A crash ends only that process.',
        terms: [
          { term: 'process', def: 'A program that is running, with its own memory. Opening an app starts one.' },
          { term: 'PID (process ID)', def: 'The number the OS gives each process, such as <code>4821</code>.' },
          { term: 'memory isolation', def: 'The wall the OS builds between processes: one can’t read or change another one’s memory.' },
          { term: 'process lifecycle', def: 'The life of a process: created, running, often waiting, and finally ended.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'List every process on the computer, not only the ones from this terminal.', code: 'ps [[-e]]', why: '<code>ps</code> alone shows this terminal’s processes. <code>-e</code> means every process.' },
          { type: 'bug', prompt: 'Ada wants to list every process, but the terminal says <code>ls: invalid option -- \'e\'</code>. Tap the line to fix.', code: 'pwd\nls -e', bug: 1, fix: 'ps -e', why: '<code>ls</code> lists files in a folder. <code>ps</code> lists processes.' },
        ],
        quiz: [
          { q: 'What is the difference between a program and a process?', options: ['A process is a program that is running', 'They are two words for the same thing', 'A program is a process that has crashed'], a: 0, why: 'The program is the stored file of instructions. Running it starts a process.' },
          { q: 'A game crashes while a map app is open. What happens to the map app?', options: ['It crashes too', 'It keeps running: each process has its own memory', 'It loses everything in its memory'], a: 1, why: 'Memory isolation keeps a crash inside the process where it happened.' },
          { q: 'You close Music and open it again. Does the new process have the same PID?', options: ['Yes, always', 'No: the OS starts a new process, with a new PID'], a: 1, why: 'Every start is a new process, with a new number and empty memory.' },
        ],
        docs: [['Processes and app lifecycle', 'https://developer.android.com/guide/components/activities/process-lifecycle'], ['ps(1) manual', 'https://man7.org/linux/man-pages/man1/ps.1.html']],
      },

      {
        id: 'threads',
        title: 'Threads',
        tagline: 'Several jobs at once inside one process.',
        goals: ['Explain what a thread is', 'Say why an app freezes when its main thread is busy', 'List the threads of a process with <code>ps -T</code>'],
        level: 'beginner', introduces: ['-T', '-p'],
        body: `
<p>You tap Download in a music app. The song downloads, and meanwhile you can still scroll and tap. One process is doing two jobs at the same time, and each job runs on its own thread.</p>
<p>A <em>thread</em> is one line of work inside a process: it runs instructions one after another, like the programs you have written so far. A process starts with one thread and can start more. All threads of a process share its memory, so the download thread can put the finished song where the other threads can see it. Processes are walled off from each other; threads of the same process are not.</p>
<p>Every app starts with a <em>main thread</em>, which draws the screen and answers your taps. If the main thread itself spends three seconds downloading, it can’t do anything else for those three seconds: the app freezes, and your taps wait. That is why apps hand slow jobs to other threads and keep the main thread free.</p>
<p>On Linux, <code>ps -T -p 5996</code> lists the threads (<code>-T</code>) of the process whose PID is 5996 (<code>-p</code>). Every row has the same PID, because they belong to one process. SPID is each thread’s own number.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['1: main', '2: main', '2: extra'],
            span: 3500, unit: 'ms',
            predict: {
              q: 'The main thread draws the screen. If it spends 3 seconds downloading a song, what happens when you scroll?',
              options: ['The list scrolls normally', 'Nothing moves until the download ends', 'The download stops'],
              a: 1,
              why: 'A thread does one thing at a time. While the main thread downloads, it can’t answer your scroll.',
            },
            frames: [
              { now: 0, say: 'Two versions of the same music app: version 1 on the top lane, version 2 on the two lanes below. In each, you tap Download at 0 ms, then try to scroll at 800 ms.' },
              { bars: [{ lane: 0, from: 0, to: 3000, label: 'downloading', tone: 'warm' }], now: 0, say: 'Version 1 has only the main thread, and it does the download itself. For 3 seconds it does nothing else.' },
              { marks: [{ at: 800, label: 'scroll', tone: 'err' }], now: 800, say: 'You scroll at 800 ms. The main thread is busy downloading, so nothing moves. The app is frozen.' },
              { bars: [{ lane: 0, from: 3000, to: 3200, tone: 'accent' }], say: 'Only when the download ends does the main thread get to your scroll, far too late.' },
              { bars: [{ lane: 1, from: 0, to: 100, tone: 'accent' }, { lane: 2, from: 100, to: 3100, label: 'downloading', tone: 'warm' }], now: 100, say: 'Version 2: the main thread starts an extra thread for the download, and is free again right away.' },
              { bars: [{ lane: 1, from: 800, to: 950, tone: 'accent' }], now: 950, say: 'You scroll at 800 ms, and the main thread answers at once while the download keeps going.' },
              { bars: [{ lane: 1, from: 3100, to: 3300, tone: 'ok' }], say: 'The download thread puts the song in the memory both threads share, and the main thread shows “Downloaded”.' },
            ],
          });
        },
        code: `ps -T -p 5996    # the threads (-T) of process 5996 (-p), a music player
#   PID  SPID TTY          TIME CMD
#  5996  5996 pts/0    00:00:00 music
#  5996  5998 pts/0    00:00:00 download
#  5996  5999 pts/0    00:00:00 player

# One process (PID 5996), three threads, each with its own SPID.`,
        remember: 'A thread is one line of work inside a process. Threads of a process share its memory; a busy main thread freezes the app.',
        terms: [
          { term: 'thread', def: 'One line of work inside a process, running instructions one after another. A process can have many.' },
          { term: 'main thread', def: 'The thread an app starts with. It draws the screen and answers taps, so slow work belongs elsewhere.' },
          { term: 'SPID', def: 'The number of one thread, shown by <code>ps -T</code>. The PID says which process it belongs to.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show the threads of process 5996.', code: 'ps [[-T]] -p 5996', why: '<code>-T</code> shows threads, and <code>-p 5996</code> picks the process.' },
          { type: 'bug', prompt: 'Ada wants the threads of the music process. Her last command prints only the header line. Tap the line to fix.', code: 'ps -e\n#  5996 pts/0    00:00:00 music\nps -T -p 5998', bug: 2, fix: 'ps -T -p 5996', why: '5998 is a thread’s SPID, not a process’s PID, so <code>-p</code> finds no process. <code>ps -e</code> shows that music is 5996.' },
        ],
        quiz: [
          { q: 'What do threads of the same process share?', options: ['Its memory', 'Nothing: they are walled off like processes', 'Only the screen'], a: 0, why: 'Memory isolation is between processes. Threads inside one process share its memory.' },
          { q: 'An app freezes for a few seconds every time you tap Save. What is the likely cause?', options: ['The main thread is doing slow work itself', 'The app has too many threads', 'The phone has no kernel'], a: 0, why: 'While the main thread works, it can’t draw or answer taps.' },
          { q: 'In <code>ps -T</code> output, every row shows PID 5996. What does that tell you?', options: ['They are threads of one process', 'They are separate processes', 'The command failed'], a: 0, why: 'The PID names the process. The SPID column tells the threads apart.' },
        ],
        docs: [['Processes and threads overview', 'https://developer.android.com/guide/components/processes-and-threads']],
      },

      {
        id: 'scheduling',
        title: 'Sharing the CPU',
        tagline: 'Hundreds of threads, a few cores: the OS takes turns.',
        goals: ['Explain how a few CPU cores run hundreds of threads', 'Describe a time slice and a context switch', 'Count cores with <code>nproc</code> and watch processes with <code>top</code>'],
        level: 'beginner', introduces: ['nproc', 'top'],
        body: `
<p>A phone has around 8 CPU cores, yet hundreds of threads want to run: your apps, the clock, the keyboard, the system itself. It all feels smooth because the OS takes turns, very quickly.</p>
<p>A <em>CPU core</em> runs one thread at a time, so 8 cores run 8 threads at the very same moment, and the rest must wait. The part of the kernel that picks which thread runs next is the <em>scheduler</em>. It gives a thread a <em>time slice</em> of a few milliseconds (thousandths of a second), then pauses it and lets the next one run. Swapping one thread for another is a <em>context switch</em>: the kernel saves exactly where the paused thread was, so it can continue later as if nothing happened. This happens thousands of times a second, too fast to notice.</p>
<p>Most threads don’t want a turn most of the time. They are waiting for a tap, a timer or the network, and the scheduler skips them until that arrives. It also favors what you are looking at: the app on the screen gets its turns before work in the background.</p>
<p><code>nproc</code> prints how many cores a Linux computer has. <code>top</code> shows a live list of processes, busiest first, and keeps updating; press <kbd>q</kbd> to quit. Its second line counts them, and almost all are “sleeping”, which here means waiting.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Music', 'Maps', 'Notes'],
            span: 60, unit: 'ms',
            predict: {
              q: 'One CPU core, and three apps that want to run. What does the OS do?',
              options: ['Runs one app until it closes, then the next', 'Gives each a short turn, switching very fast', 'Runs all three at exactly the same moment on that core'],
              a: 1,
              why: 'One core runs one thread at a time. The scheduler hands out short time slices, so everything seems to run at once.',
            },
            frames: [
              { now: 0, say: 'One CPU core and three apps. Music and Maps have work to do. Notes is waiting for you to type.' },
              { bars: [{ lane: 0, from: 0, to: 10, label: 'run', tone: 'accent' }], say: 'The scheduler gives Music a time slice of 10 ms.' },
              { marks: [{ at: 10, label: 'switch', tone: 'warm' }], bars: [{ lane: 1, from: 10, to: 20, label: 'run', tone: 'accent' }], say: 'Time is up. Context switch: the kernel saves where Music was and lets Maps run.' },
              { bars: [{ lane: 0, from: 20, to: 30, tone: 'accent' }, { lane: 1, from: 30, to: 40, tone: 'accent' }], say: 'Back and forth. Each app continues exactly where it stopped. Notes gets no turns: it is waiting, so it doesn’t need any.' },
              { marks: [{ at: 42, label: 'key', tone: 'ok' }], bars: [{ lane: 2, from: 42, to: 46, tone: 'ok' }], say: 'You press a key. Notes stops waiting, and because it is the app on the screen, the scheduler lets it run first.' },
              { bars: [{ lane: 0, from: 46, to: 53, tone: 'accent' }, { lane: 1, from: 53, to: 60, tone: 'accent' }], say: 'Notes needed only 4 ms and waits again. Music and Maps go on taking turns. Real phones do this thousands of times a second.' },
            ],
          });
        },
        code: `nproc    # how many CPU cores (Linux)
# 8

top      # a live list of processes, busiest first; press q to quit
# Its second line:
# Tasks: 312 total,   1 running, 311 sleeping,   0 stopped,   0 zombie`,
        remember: 'A core runs one thread at a time. The scheduler gives out short time slices and switches so fast that everything seems to run at once.',
        terms: [
          { term: 'CPU core', def: 'One part of the processor that runs one thread at a time. Phones have several.' },
          { term: 'scheduler', def: 'The part of the kernel that picks which thread runs next on each core.' },
          { term: 'time slice', def: 'The few milliseconds a thread may run before the scheduler gives another one a turn.' },
          { term: 'context switch', def: 'Pausing one thread and running another. The kernel saves where the first one was, so it can continue later.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print how many CPU cores this Linux computer has.', code: '[[nproc]]\n# 8', why: '<code>nproc</code> prints the number of cores.' },
          { type: 'bug', prompt: 'Ada wants a live list of processes that shows how many are sleeping. Tap the line that won’t show it.', code: 'pwd\nnproc', bug: 1, fix: 'top', why: '<code>nproc</code> only prints the number of cores. <code>top</code> shows the live list and counts sleeping processes.' },
        ],
        quiz: [
          { q: 'What does the scheduler decide?', options: ['Which thread runs next on each core', 'Which files an app may open', 'How bright the screen is'], a: 0, why: 'It hands out time slices on the CPU cores.' },
          { q: '<code>top</code> says 311 of 312 processes are sleeping. What are they doing?', options: ['Waiting for something, without using the CPU', 'They are broken and need restarting', 'Running in secret'], a: 0, why: 'A sleeping process waits for a tap, a timer or data. It needs no turns until then.' },
          { q: 'What happens in a context switch?', options: ['The kernel saves where one thread was and runs another', 'The app starts again from the beginning', 'The phone switches to another network'], a: 0, why: 'Saving the paused thread’s place lets it continue later as if nothing happened.' },
        ],
        docs: [['CFS Scheduler (Linux kernel documentation)', 'https://docs.kernel.org/scheduler/sched-design-CFS.html'], ['top(1) manual', 'https://man7.org/linux/man-pages/man1/top.1.html']],
      },

      {
        id: 'memory',
        title: 'Memory',
        tagline: 'Where a running program keeps its values.',
        goals: ['Explain what RAM is and how it differs from storage', 'Tell the stack from the heap', 'Check how much RAM is free with <code>free -h</code>'],
        level: 'beginner', introduces: ['free', '-h'],
        body: `
<p>A phone might have 8 GB of RAM and 128 GB of storage. Your photos live in storage; the apps you have open live in RAM. <em>RAM</em> (random access memory) is fast working memory: every <code>val</code> and every list a running program makes is kept there. Switch the phone off and RAM is wiped, while storage keeps its files.</p>
<p>A process uses its memory in two main areas. The <em>stack</em> holds the values of the functions running right now: calling a function puts a new frame, with its local values, on top, and returning removes it. The <em>heap</em> holds objects, like lists and objects made from classes, which may live longer than the function that made them. A variable for a list doesn’t hold the list itself; it holds where the list is on the heap, so we say it <em>points to</em> the list. When nothing points to an object any more, the system frees it for you, a little later.</p>
<p>Each process also gets <em>virtual memory</em>: its own private set of addresses (numbers that name places in memory). The kernel maps them to real places in RAM behind the scenes. That is how memory isolation works: process A has no address that leads into process B’s memory.</p>
<p><code>free -h</code> shows how much RAM a Linux computer has and uses. <code>-h</code> makes the sizes human-readable: <code>Gi</code> is about a gigabyte and <code>Mi</code> about a megabyte. The available column is what new programs can still get.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            varsTitle: 'Heap (objects)',
            code: `fun total(prices: List<Int>): Int {
    val sum = prices.sum()
    return sum
}

fun main() {
    val prices = listOf(3, 5, 2)
    val t = total(prices)
    println(t)
}`,
            predict: {
              q: 'When <code>total</code> returns, what happens to its local value <code>sum</code>?',
              options: ['It stays on the stack until the program ends', 'It is removed together with <code>total</code>’s frame', 'It moves to the heap'],
              a: 1,
              why: 'Local values live in their function’s stack frame. Returning removes the frame, and the value with it.',
            },
            frames: [
              { line: 6, stack: ['main()'], say: 'The program starts in <code>main</code>. The stack gets a frame for <code>main</code>, with room for its values.' },
              { line: 7, stack: ['main(): prices → the list'], vars: { 'the list': '[3, 5, 2]' }, say: '<code>listOf</code> makes a list object on the heap. <code>main</code>’s frame only holds <code>prices</code>, which points to it.' },
              { line: 1, stack: ['main(): prices → the list', 'total(): prices → the list'], say: 'Calling <code>total</code> puts a new frame on top of the stack. Its <code>prices</code> points to the same list on the heap.' },
              { line: 2, stack: ['main(): prices → the list', 'total(): prices → the list, sum = 10'], say: '<code>sum</code> is a local value, so it lives in <code>total</code>’s frame.' },
              { line: 8, stack: ['main(): prices → the list, t = 10'], say: '<code>total</code> returns 10. Its frame is removed, and <code>sum</code> is gone with it. <code>main</code>’s <code>t</code> gets the 10.' },
              { line: 9, out: '10', say: 'The list is still on the heap, because <code>main</code> still points to it.' },
              { line: 10, stack: [], vars: { 'the list': null }, say: '<code>main</code> ends. Its frame goes, and nothing points to the list any more, so it can be freed. A helper called the garbage collector cleans it up soon after.' },
            ],
          });
        },
        code: `free -h    # RAM on this computer, in human-readable sizes (Linux; lines cut)
#                total        used        free      shared  buff/cache   available
# Mem:           7.8Gi       660Mi       6.4Gi        22Mi       738Mi       7.2Gi

# 7.8 GB in total, 660 MB used, and 7.2 GB still available for new programs.`,
        remember: 'RAM is fast working memory that is wiped when the power goes. Function values live on the stack, objects on the heap.',
        terms: [
          { term: 'RAM', def: 'Fast working memory where running programs keep their values. It is wiped when the device switches off.' },
          { term: 'stack', def: 'Memory for the functions running right now: each call adds a frame with its local values, and returning removes it.' },
          { term: 'heap', def: 'Memory for objects such as lists, which can outlive the function that made them.' },
          { term: 'virtual memory', def: 'The private addresses each process sees. The kernel maps them to real places in RAM.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Show how much RAM is free, with sizes like <code>7.8Gi</code> instead of long numbers.', code: 'free [[-h]]', why: '<code>-h</code> makes the sizes human-readable.' },
          { type: 'bug', prompt: 'This should show how much memory the computer has, but it lists the files in the folder. Tap the line to fix.', code: 'cd projects\nls -h', bug: 1, fix: 'free -h', why: '<code>ls</code> lists files. <code>free</code> reports memory.' },
        ],
        quiz: [
          { q: 'You switch the phone off and on again. What is gone?', options: ['What was in RAM', 'Your photos in storage', 'The installed apps'], a: 0, why: 'RAM needs power to keep its contents. Storage keeps files without power.' },
          { q: 'A function makes a local <code>val</code>, then returns. Where did the value live, and what happens to it?', options: ['On the stack; it is removed when the function returns', 'On the heap; it stays forever', 'In storage; it is saved as a file'], a: 0, why: 'Local values live in the function’s stack frame, which goes away on return.' },
          { q: 'Why can’t process A read process B’s memory?', options: ['A’s virtual addresses don’t lead into B’s memory', 'B hides its memory with a password', 'RAM is split into two halves'], a: 0, why: 'The kernel maps each process’s addresses only to that process’s own places in RAM.' },
        ],
        docs: [['Overview of memory management', 'https://developer.android.com/topic/performance/memory-overview'], ['free(1) manual', 'https://man7.org/linux/man-pages/man1/free.1.html']],
      },

      {
        id: 'low-memory',
        title: 'When memory runs out',
        tagline: 'Phones close apps you aren’t using to make room.',
        goals: ['Explain what happens when RAM is full', 'Predict which app a phone closes first', 'End a process yourself with <code>kill</code>'],
        level: 'beginner', introduces: ['kill', 'sleep'],
        body: `
<p>You switch to a game, play for a while, then go back to the chat app, and it opens on its first screen. Nothing broke: the phone needed RAM for the game, so it closed the chat app’s process while you weren’t looking.</p>
<p>RAM is limited. When an app needs memory and there is none left, the device is <em>out of memory</em>. A computer can borrow slow space on its storage, but a phone mostly frees memory by <em>killing</em> processes: ending them on purpose, without asking. Android keeps what you would notice: the app on the screen and music playing in the <em>background</em> (running while you look at something else) stay. Apps you left long ago go first.</p>
<p>For the killed app this is like a crash. Next time you open it, a new process starts with empty memory. That is why well-made apps save what matters, like the message you were typing, to storage: storage survives, and the RAM of a killed process doesn’t.</p>
<p>On a computer you can kill a process yourself. <code>sleep 600</code> starts a process that waits 600 seconds and does nothing else; the terminal gives you no prompt until it ends. In a second terminal window, find its PID with <code>ps -e</code> and end it with <code>kill</code> and that number. The first window prints <code>Terminated</code> (on a Mac: <code>zsh: terminated  sleep 600</code>).</p>`,
        visual(el) {
          const TOTAL = 6;
          const bar = h('div', { class: 'osy-ram', role: 'img', 'aria-label': 'RAM use' });
          const list = h('div', { class: 'osy-plist' });
          const st = stats(['used', 'free', 'killed']);
          const stage = h('div', { class: 'osy-stage' }, h('div', { class: 'osy-tlrow' }, label('RAM: 6 GB'), bar), st, list);
          const A = (name, mem, state, kind, cls = '') => ({ name, mem, state, kind, cls });
          const sys = A('System', 2, 'system', 'sys');
          const music = A('Music', 1, 'playing music', 'mid');
          const dead = name => A(name, 0, 'killed', 'dead', 'osy-killed');
          const frames = [
            { apps: [sys, A('Browser', 1, 'on screen', 'fg'), music, A('Maps', 1, 'left 10 min ago', 'cache'), A('Chat', 0.5, 'left 1 hour ago', 'cache')], killed: 0, say: 'A made-up phone with 6 GB of RAM. You are reading in Browser, Music is playing, and Maps and Chat are open from earlier.' },
            { apps: [sys, A('Browser', 1, 'on screen', 'fg'), music, A('Maps', 1, 'left 10 min ago', 'cache'), A('Chat', 0.5, 'left 1 hour ago', 'cache'), A('Game', 2, 'needs 2 GB', 'wait', 'osy-fresh')], killed: 0, say: 'You open a game that needs 2 GB. Only 0.5 GB is free: the phone is out of memory.' },
            { apps: [sys, A('Browser', 1, 'on screen', 'fg'), music, A('Maps', 1, 'left 10 min ago', 'cache'), A('Game', 2, 'needs 2 GB', 'wait', 'osy-fresh'), dead('Chat')], killed: 1, say: 'The phone kills the process you are least likely to miss: Chat, which you left an hour ago. Now 1 GB is free. Still not enough.' },
            { apps: [sys, A('Browser', 1, 'on screen', 'fg'), music, A('Game', 2, 'needs 2 GB', 'wait', 'osy-fresh'), dead('Chat'), dead('Maps')], killed: 2, say: 'Next in line is Maps. Now there is room.' },
            { apps: [sys, A('Game', 2, 'on screen', 'fg', 'osy-fresh'), music, A('Browser', 1, 'left just now', 'cache'), dead('Chat'), dead('Maps')], killed: 2, say: 'The game starts. Music kept playing the whole time: you would notice if it stopped.' },
            { apps: [sys, A('Chat', 0.5, 'on screen', 'fg', 'osy-fresh'), music, A('Game', 2, 'left just now', 'cache'), dead('Maps'), dead('Browser')], killed: 3, say: 'You go back to Chat. Its process is gone, so a new one starts, and the phone makes room by killing Browser, now the app you left longest ago.' },
            { apps: [sys, A('Chat', 0.5, 'on screen', 'fg'), music, A('Game', 2, 'left 1 min ago', 'cache'), dead('Maps'), dead('Browser')], killed: 3, say: 'The new Chat process has empty memory, so it opens on its first screen. Anything Chat saved to storage is still there.' },
          ];
          const seg = { sys: 'osy-s-sys', fg: 'osy-s-fg', mid: 'osy-s-mid', cache: 'osy-s-cache' };
          const tone = { sys: 'osy-ghost', fg: 'osy-acc', mid: 'osy-ok', cache: 'osy-warm', wait: 'osy-ghost', dead: 'osy-err' };
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'RAM is full and you open a game. Which app does the phone close first?',
              options: ['The app on the screen', 'The music that is playing', 'The app you left longest ago'],
              a: 2,
              why: 'The phone keeps what you would notice, and kills the app you are least likely to miss.',
            },
            draw(f) {
              const live = f.apps.filter(a => seg[a.kind]);
              const used = live.reduce((s, a) => s + a.mem, 0);
              bar.replaceChildren(...live.map(a => h('div', { class: `osy-seg ${seg[a.kind]}`, style: `width:${(a.mem / TOTAL) * 100}%`, title: a.name }, a.mem >= 1 ? a.name : '')));
              st.set('used', `${used} GB`);
              st.set('free', `${TOTAL - used} GB`);
              st.set('killed', f.killed);
              list.replaceChildren(...f.apps.map(a => h('div', { class: `osy-prow ${a.cls}` },
                h('span', {}, a.name), pill(a.state, tone[a.kind]), h('span', { class: 'osy-adj' }, a.mem ? `${a.mem} GB` : ''))));
            },
          });
        },
        code: `# Terminal window 1
sleep 600       # a process that waits 600 seconds; no prompt until it ends

# Terminal window 2
ps -e           # find its PID (lines cut)
#   PID TTY          TIME CMD
#  6120 pts/0    00:00:00 sleep
kill 6120       # end process 6120

# Back in window 1:
# Terminated      (on a Mac: zsh: terminated  sleep 600)`,
        remember: 'When RAM runs out, a phone kills the processes you are least likely to miss. A killed app starts over with empty memory.',
        terms: [
          { term: 'out of memory', def: 'When programs need more RAM than is free.' },
          { term: 'kill (a process)', def: 'End a process on purpose. Phones do it to free RAM; in a terminal, <code>kill</code> and a PID does it.' },
          { term: 'background', def: 'An app is in the background when it is open but not on the screen, like music playing while you read.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'End the process whose PID is 6120.', code: '[[kill]] 6120', why: '<code>kill</code> followed by a PID ends that process.' },
          { type: 'bug', prompt: 'Ada wants to end the waiting <code>sleep</code> process, but gets <code>bash: kill: sleep: arguments must be process or job IDs</code>. Tap the line to fix.', code: 'ps -e\n#  6120 pts/0    00:00:00 sleep\nkill sleep', bug: 2, fix: 'kill 6120', why: '<code>kill</code> needs the PID, not the program’s name. <code>ps -e</code> shows it is 6120.' },
        ],
        quiz: [
          { q: 'You come back to an app and it opens on its first screen. What probably happened?', options: ['The phone killed its process to free RAM', 'The app was deleted', 'The storage is full'], a: 0, why: 'A killed app starts again as a new process, with empty memory.' },
          { q: 'Which app is the phone least likely to kill?', options: ['A music app playing in the background', 'A chat app you left yesterday', 'A map you left an hour ago'], a: 0, why: 'You would notice the music stopping, so it is kept.' },
          { q: 'What does <code>kill 6120</code> do?', options: ['Ends the process with PID 6120', 'Deletes the file named 6120', 'Frees 6120 MB of RAM'], a: 0, why: '<code>kill</code> takes a PID.' },
        ],
        docs: [['Memory allocation among processes', 'https://developer.android.com/topic/performance/memory-management'], ['kill(1) manual', 'https://man7.org/linux/man-pages/man1/kill.1.html']],
      },

      {
        id: 'ipc',
        title: 'Processes talking',
        tagline: 'Walled-off processes still pass messages.',
        goals: ['Explain why processes need the kernel to talk', 'Describe how a phone app asks the system to show a notification', 'Connect two commands with a pipe <code>|</code>'],
        level: 'beginner', introduces: ['|', 'wc', '-l', 'grep'],
        body: `
<p>A chat app gets a message, and a notification slides down at the top of your screen. But the chat app can’t draw there: the top bar belongs to the system, which is a different process, and memory isolation keeps them apart. So the chat app sends the system a message.</p>
<p><em>Inter-process communication</em> (IPC) means processes passing data to each other through the kernel. The kernel is the one part that can reach both sides: it carries the message across the wall and tells the receiver who sent it, so the receiver can check that the sender is allowed. On Android, almost everything an app asks of the system travels this way: show a notification, use the camera, find your location. The app sends a request, and the system process does the work and sends an answer back.</p>
<p>In the terminal you can use a simple kind of IPC, the <em>pipe</em> <code>|</code>. <code>ps -e | wc -l</code> runs two processes at once, and the kernel passes everything <code>ps</code> prints into <code>wc</code> instead of onto the screen. <code>wc</code> (word count) counts, and with <code>-l</code> it counts lines, so you get the number of processes, plus one for the header line. <code>grep sleep</code> keeps only the lines that contain <code>sleep</code>, so <code>ps -e | grep sleep</code> finds a process by name.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'chat', label: 'Chat app', sub: 'one process' },
              { id: 'kern', label: 'Kernel', sub: 'carries messages' },
              { id: 'sys', label: 'System', sub: 'another process' },
              { id: 'bar', label: 'Top bar', sub: 'on the screen' },
            ],
            predict: {
              q: 'The chat app wants a notification in the top bar, which the system process owns. How does it get there?',
              options: ['The chat app draws it itself', 'It sends a message through the kernel to the system process', 'It copies itself into the system process'],
              a: 1,
              why: 'Processes can’t touch each other’s memory. The kernel carries a request to the process that owns the top bar.',
            },
            frames: [
              { say: 'A message from Sam arrives in Ada’s chat app. The app wants to show a notification in the top bar.' },
              { at: 'chat', packet: 'notify: Sam', say: 'The chat app writes a request. It can’t put it into the system’s memory itself.' },
              { at: 'kern', packet: 'notify: Sam', tone: 'warm', mark: { kern: 'warm' }, say: 'It hands the request to the kernel, which notes who sent it.' },
              { at: 'sys', packet: 'notify: Sam', tone: 'warm', say: 'The kernel delivers it to the system process, which checks that the chat app may post notifications.' },
              { at: 'bar', packet: 'Sam: hi!', tone: 'ok', mark: { bar: 'ok' }, say: 'The system draws the notification. It owns the top bar, so it is the one that may draw there.' },
              { at: 'kern', packet: 'shown', tone: 'ok', say: 'An answer goes back the same way, through the kernel.' },
              { at: 'chat', packet: 'shown', tone: 'ok', mark: { chat: 'ok' }, say: 'The chat app learns the notification is up. Two processes worked together without touching each other’s memory.' },
            ],
          });
        },
        code: `ps -e | wc -l          # pipe the process list into wc, which counts its lines
# 313
ps -e | grep sleep     # keep only the lines that contain "sleep"
#  6120 pts/0    00:00:00 sleep`,
        remember: 'Processes talk by passing messages through the kernel. In the terminal, a pipe | passes one command’s output to the next.',
        terms: [
          { term: 'inter-process communication (IPC)', def: 'Processes passing data to each other through the kernel, such as an app asking the system to show a notification.' },
          { term: 'pipe', def: 'The <code>|</code> between two commands: the kernel passes what the first prints into the second.' },
          { term: 'wc', def: 'Counts what it is given. <code>wc -l</code> counts lines.' },
          { term: 'grep', def: 'Keeps only the lines that contain a word, such as <code>grep sleep</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Count the lines that <code>ps -e</code> prints.', code: 'ps -e | [[wc]] -l', why: '<code>wc -l</code> counts lines, and the pipe feeds it the output of <code>ps -e</code>.' },
          { type: 'bug', prompt: 'Ada wants to find the <code>sleep</code> process, but nothing prints. Tap the line to fix.', code: 'pwd\nps -e | grep slep', bug: 1, fix: 'ps -e | grep sleep', why: '<code>grep</code> looks for exactly the letters you give it. No line contains “slep”.' },
        ],
        quiz: [
          { q: 'Why does a phone app ask the system to show a notification, instead of drawing it itself?', options: ['The top bar belongs to another process, the system', 'Apps can’t draw anything', 'Notifications are stored in a file'], a: 0, why: 'Memory isolation: only the system process may change what it owns, so the app sends it a request.' },
          { q: 'In <code>ps -e | wc -l</code>, what does <code>|</code> do?', options: ['Passes what <code>ps -e</code> prints into <code>wc</code>', 'Runs <code>ps</code>, then deletes its output', 'Means “or”, like <code>||</code> in Kotlin'], a: 0, why: 'A pipe connects two processes: the output of the first becomes the input of the second.' },
          { q: 'Who carries a message from one process to another?', options: ['The kernel', 'The screen', 'Nobody: processes read each other’s memory'], a: 0, why: 'Only the kernel can reach both sides of the wall.' },
        ],
        docs: [['Processes and threads overview', 'https://developer.android.com/guide/components/processes-and-threads'], ['Bash manual: Pipelines', 'https://www.gnu.org/software/bash/manual/bash.html#Pipelines']],
      },

      {
        id: 'files',
        title: 'Files and storage',
        tagline: 'How the OS keeps files in folders, and who may open them.',
        goals: ['Explain what a file system does', 'Tell an absolute path from a relative one', 'Read permissions like <code>-rw-r--r--</code> in <code>ls -l</code>'],
        level: 'beginner', introduces: ['cat'],
        body: `
<p>Your photos are still there after you switch your phone off, and a game you installed can’t open the files of your chat app. Both are the work of the file system.</p>
<p>A storage chip is one long row of bytes. The <em>file system</em> is the part of the OS that turns it into files with names, inside folders, inside other folders. A path names a file by the folders that lead to it. <code>/home/ada/notes.txt</code> starts at the very top, <code>/</code>, so it is an <em>absolute path</em> and works from any folder. <code>notes.txt</code> on its own is a <em>relative path</em>: it means “in the folder I am in now”. <code>cat notes.txt</code> prints the text of that file.</p>
<p>Every file has an owner and <em>permissions</em>: who may read it (<code>r</code>), write it, meaning change it (<code>w</code>), and, for programs, run it (<code>x</code>). For a folder, <code>r</code> means list what is inside and <code>x</code> means go into it. <code>ls -l</code> (<code>-l</code> for long) shows them. <code>-rw-r--r--</code> starts with <code>-</code> for a file (<code>d</code> would mean a folder), then three groups of three: the owner may read and write (<code>rw-</code>), the owner’s group of users may read (<code>r--</code>), and everyone else may read (<code>r--</code>). A <code>-</code> means “not allowed”. When you aren’t allowed, the kernel refuses with <code>Permission denied</code>.</p>
<p>Phones use the same idea. Android gives each app its own user and a private folder that only that app may open. That is why one app can’t read another app’s files, unless you share them on purpose.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'Sam’s folder shows <code>drwx------</code>. Ada runs <code>ls /home/sam</code>. What happens?',
              options: ['She sees Sam’s files', '<code>Permission denied</code>', 'Sam’s folder is deleted'],
              a: 1,
              why: '<code>rwx</code> is for Sam only, and <code>------</code> means nobody else may do anything, so the kernel refuses.',
            },
            frames: [
              { say: 'Ada and Sam share a Linux computer. Each has a home folder inside <code>/home</code>. Ada opens a terminal.' },
              { cmd: 'pwd', out: '/home/ada', say: 'She starts in her home folder.' },
              { cmd: 'cat notes.txt', out: 'Buy milk', say: 'A relative path: <code>notes.txt</code> in the folder she is in. <code>cat</code> prints its text.' },
              { cmd: 'ls -l notes.txt', out: '-rw-r--r-- 1 ada ada 9 Oct 19 09:30 notes.txt', say: 'A file (<code>-</code>). Ada may read and write it (<code>rw-</code>); everyone else may only read it. The owner is <code>ada</code> (the second <code>ada</code> is her group), and it is 9 bytes long. You can ignore the other numbers for now.' },
              { cmd: 'ls -l /home', out: 'total 8\ndrwxr-x--- 2 ada ada 4096 Oct 19 09:30 ada\ndrwx------ 2 sam sam 4096 Oct 18 17:05 sam', say: 'An absolute path, from the top. Both are folders (<code>d</code>). Sam’s folder: <code>rwx</code> for Sam, then <code>---</code> and <code>---</code>.' },
              { cmd: 'ls /home/sam', out: 'ls: cannot open directory \'/home/sam\': Permission denied', say: 'The kernel checks the permissions and says no. Phones keep each app’s files private the same way.' },
              { cmd: 'cat /home/ada/notes.txt', out: 'Buy milk', say: 'The absolute path to her notes works from any folder.' },
            ],
          });
        },
        code: `pwd                  # /home/ada
cat notes.txt        # relative path: notes.txt in this folder
# Buy milk
ls -l notes.txt      # -l: long form, with permissions and owner
# -rw-r--r-- 1 ada ada 9 Oct 19 09:30 notes.txt
ls /home/sam         # another user's private folder
# ls: cannot open directory '/home/sam': Permission denied`,
        remember: 'The file system keeps files in folders. Every file has an owner and permissions (r, w, x), and the kernel checks them.',
        terms: [
          { term: 'file system', def: 'The part of the OS that turns storage into named files inside folders.' },
          { term: 'absolute path, relative path', def: 'An absolute path starts at <code>/</code> and works anywhere. A relative path, like <code>notes.txt</code>, starts from the folder you are in.' },
          { term: 'permissions', def: 'Who may read (<code>r</code>), write (<code>w</code>) or run (<code>x</code>) a file. <code>ls -l</code> shows them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print the text of the file <code>notes.txt</code> in this folder.', code: '[[cat]] notes.txt', why: '<code>cat</code> prints what is in a file.' },
          { type: 'bug', prompt: 'Ada is in <code>/home</code> and wants to print her notes, which are in <code>/home/ada</code>. Tap the line to fix.', code: 'pwd\n# /home\ncat notes.txt\n# cat: notes.txt: No such file or directory', bug: 2, fix: 'cat /home/ada/notes.txt', why: 'A relative path looks in the folder you are in, and <code>/home</code> has no <code>notes.txt</code>. The absolute path works from anywhere.' },
        ],
        quiz: [
          { q: 'Which is an absolute path?', options: ['<code>/home/ada/notes.txt</code>', '<code>notes.txt</code>', '<code>ada/notes.txt</code>'], a: 0, why: 'An absolute path starts at the top, <code>/</code>.' },
          { q: 'A file shows <code>-rw-r--r--</code>. What may other users do with it?', options: ['Only read it', 'Read and change it', 'Nothing at all'], a: 0, why: 'The last group, <code>r--</code>, is for everyone else: read, but no write.' },
          { q: 'Why can’t one phone app open another app’s files?', options: ['Each app has its own user and a private folder, and the kernel checks permissions', 'Files are hidden behind the screen', 'Apps can’t use storage'], a: 0, why: 'It is the same owner-and-permissions idea as on a shared computer.' },
        ],
        docs: [['Data and file storage overview', 'https://developer.android.com/training/data-storage'], ['ls(1) manual', 'https://man7.org/linux/man-pages/man1/ls.1.html']],
      },

      {
        id: 'power',
        title: 'Power and battery',
        tagline: 'Why a phone sleeps, and why it limits apps that keep it awake.',
        goals: ['Explain why waiting costs almost no battery', 'Describe what a wake lock does', 'Say why phones limit apps in the background'],
        level: 'beginner', introduces: ['time'],
        body: `
<p>Your phone lasts a whole day, and it is never really off. Most of that time it is asleep: screen dark, CPU stopped, using a tiny trickle of power. One app that keeps it awake can empty the battery overnight.</p>
<p>When no thread has anything to do, the kernel puts the CPU into a <em>sleep state</em>, a low-power mode it leaves as soon as something happens: a message arrives, an alarm rings, you press the button. Waiting costs almost nothing. <code>time sleep 2</code> shows it: <code>time</code> runs a command and measures it. The real time is 2 seconds, but the CPU worked for only about 2 thousandths of a second.</p>
<p>An app that must finish a job with the screen off, like saving a long recording, can hold a <em>wake lock</em>: a request to the OS that says “don’t let the CPU sleep yet”. Held for a moment, that is fine. Forgotten, it keeps the CPU awake for hours. That is why Android limits apps in the background. After the phone has been still with its screen off for a while, it enters <em>Doze</em>: it ignores wake locks and lets apps do background work only in short, shared windows. Apps you rarely open get even fewer chances.</p>`,
        visual(el) {
          Lab.ui.timeline(el, {
            lanes: ['Screen', 'CPU, night 1', 'CPU, night 2'],
            span: 8, unit: 'h',
            predict: {
              q: 'The screen is off and no app has work to do. What does the CPU do?',
              options: ['Keeps running at full speed', 'Goes into a low-power sleep state until something happens', 'Switches the phone off'],
              a: 1,
              why: 'With nothing to run, the kernel puts the CPU to sleep, and wakes it when an event arrives.',
            },
            frames: [
              { now: 0, say: 'A phone from 23:00 (0 h) to 07:00 (8 h). Night 1 is a normal night; on night 2 an app forgets to let go.' },
              { bars: [{ lane: 0, from: 0, to: 0.3, tone: 'accent' }], say: 'You use the phone for a few minutes, then switch the screen off and go to sleep.' },
              { bars: [{ lane: 1, from: 0, to: 0.4, tone: 'warm' }, { lane: 1, from: 2, to: 2.1, tone: 'warm' }, { lane: 1, from: 4, to: 4.1, tone: 'warm' }, { lane: 1, from: 6, to: 6.1, tone: 'warm' }], say: 'Night 1: the CPU sleeps. Now and then it wakes for a moment, to receive a message or let apps do a little work, then sleeps again.' },
              { bars: [{ lane: 2, from: 0, to: 0.4, tone: 'warm' }, { lane: 2, from: 0.4, to: 8, label: 'wake lock held', tone: 'err' }], say: 'Night 2: an app takes a wake lock to save a file, and never releases it. The CPU can’t sleep all night.' },
              { marks: [{ at: 1, label: 'Doze', tone: 'ok' }], say: 'This is why Android has Doze. Once the phone has been still for a while, it ignores wake locks, so a forgotten one can’t keep the CPU awake all night.' },
              { say: 'Doze is one of several limits on background apps. Each one exists because a single careless app can drain everyone’s battery.' },
            ],
          });
        },
        code: `time sleep 2     # run sleep 2 and measure how long it took

# real\t0m2.003s
# user\t0m0.002s
# sys\t0m0.000s

# real: 2 seconds passed. user and sys: the CPU worked for about 0.002 seconds,
# running the program's own instructions (user) and the kernel's work for it (sys).`,
        remember: 'A waiting CPU sleeps and saves power. A wake lock keeps it awake, so Android limits apps in the background.',
        terms: [
          { term: 'sleep state', def: 'A low-power mode the CPU enters when nothing needs to run. It wakes up when something happens.' },
          { term: 'wake lock', def: 'An app’s request to the OS: “don’t let the CPU sleep yet”. Forgotten ones drain the battery.' },
          { term: 'Doze', def: 'Android’s mode for a phone left still with its screen off: background work waits for short, shared windows.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Measure how long <code>sleep 2</code> takes.', code: '[[time]] sleep 2', why: '<code>time</code> runs the command after it and reports how long it took.' },
          { type: 'bug', prompt: 'Ada wants to measure a 5-second wait. Tap the line to fix.', code: 'time sleep\n# sleep: missing operand', bug: 0, fix: 'time sleep 5', why: '<code>sleep</code> needs to know how many seconds to wait.' },
        ],
        quiz: [
          { q: 'Why does a sleeping CPU save battery?', options: ['It uses very little power until something wakes it', 'It charges the battery', 'It closes all the apps'], a: 0, why: 'A sleep state is a low-power mode that ends when an event arrives.' },
          { q: 'What does a wake lock ask the OS?', options: ['Don’t let the CPU sleep yet', 'Lock the screen', 'Wake me up at 07:00'], a: 0, why: 'It keeps the CPU awake so the app can finish a job.' },
          { q: '<code>time sleep 2</code> shows <code>real 0m2.003s</code> and <code>user 0m0.002s</code>. What does that tell you?', options: ['Waiting took real time but almost no CPU work', 'The computer is broken', '<code>sleep</code> ran for only 2 milliseconds'], a: 0, why: 'A waiting process doesn’t use the CPU, which is why waiting is cheap.' },
        ],
        docs: [['Optimize for Doze and App Standby', 'https://developer.android.com/training/monitoring-device-state/doze-standby'], ['Use wake locks', 'https://developer.android.com/develop/background-work/background-tasks/awake/wakelock']],
      },
    ],
  });
})();
