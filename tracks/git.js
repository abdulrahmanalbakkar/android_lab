/* Git and the command line track. Same shape as tracks/kotlin.js.
   For someone who has never used Git: the terminal, commits, branches, merging, rebasing, GitHub, pull requests, undoing.
   Code snippets are shell. Demos draw commit graphs with SVG (graph() below). Every class is prefixed gt-. */
(() => {
  const { h, sleep, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = (text = '') => h('div', { class: 'out gt-pre', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (...kids) => h('div', { class: 'controls' }, ...kids);
  const lab = t => h('span', { class: 'gt-label' }, t);
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  // ---------- commit graph (SVG) ----------
  // g.set({ commits: [{ id, p: [parent ids], lane?, col?, label?, ghost?, hl?, msg? }], refs: [{ name, at, remote? }],
  //         head: branch name | commit id | null, auto: tip id (lane 0 = first-parent chain of tip, everything else lane 1) })
  // Nodes and labels are keyed, so moving a branch or HEAD slides it with a CSS transition.
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs = {}, text) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
    if (text != null) e.textContent = text;
    return e;
  };
  function graph({ lanes = 2, top = 70, minCols = 5, title = 'Commit graph' } = {}) {
    const DX = 56, DY = 70, PX = 32;
    const svg = sv('svg', { class: 'gt-graph', role: 'img', 'aria-label': title });
    const gE = sv('g'), gN = sv('g'), gL = sv('g');
    svg.append(gE, gN, gL);
    const nodes = new Map(), lbls = new Map();
    let seen = new Set();
    const H = top + (lanes - 1) * DY + (lanes > 1 ? 66 : 26);
    const move = (el, x, y) => { el.style.transform = `translate(${x}px, ${y}px)`; };
    function set(st) {
      const cs = st.commits;
      const byId = Object.fromEntries(cs.map(c => [c.id, c]));
      let laneOf = id => (byId[id] && byId[id].lane) || 0;
      if (st.auto) {
        const chain = new Set();
        for (let c = st.auto; c && byId[c]; c = byId[c].p[0]) chain.add(c);
        laneOf = id => (chain.has(id) ? 0 : 1);
      }
      const P = {};
      let cols = 0;
      cs.forEach((c, i) => { const col = c.col != null ? c.col : i; cols = Math.max(cols, col + 1); P[c.id] = [PX + col * DX, top + laneOf(c.id) * DY]; });
      const W = PX * 2 + (Math.max(cols, minCols) - 1) * DX;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.style.maxWidth = Math.round(W * 1.35) + 'px';

      gE.replaceChildren();
      const now = new Set();
      for (const c of cs) for (const p of c.p) {
        if (!P[p]) continue;
        const k = p + '>' + c.id; now.add(k);
        const [x1, y1] = P[p], [x2, y2] = P[c.id], mx = (x1 + x2) / 2;
        const d = y1 === y2 ? `M${x1} ${y1}L${x2} ${y2}` : `M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
        gE.append(sv('path', { d, class: `gt-edge${c.ghost ? ' gt-ghost' : ''}${seen.has(k) ? '' : ' gt-edge-in'}` }));
      }
      seen = now;

      for (const c of cs) {
        let g = nodes.get(c.id);
        if (!g) {
          g = sv('g', { class: 'gt-node' });
          const inner = sv('g', { class: 'gt-pop' });
          inner.append(sv('circle', { r: 14 }), sv('text', { y: 4, 'text-anchor': 'middle' }, c.label || c.id));
          g.append(sv('title', {}, c.msg || c.label || c.id), inner);
          move(g, ...P[c.id]);
          gN.append(g); nodes.set(c.id, g);
        } else move(g, ...P[c.id]);
        g.classList.toggle('gt-ghost', !!c.ghost);
        g.classList.toggle('gt-merge', c.p.length > 1);
        g.classList.toggle('gt-hl', !!c.hl);
      }
      for (const [id, g] of nodes) if (!byId[id]) { nodes.delete(id); g.classList.add('gt-gone'); setTimeout(() => g.remove(), 350); }

      const stacks = {};
      for (const r of st.refs) if (P[r.at]) (stacks[r.at] = stacks[r.at] || []).push(r);
      if (st.head != null) {
        const br = st.refs.find(r => r.name === st.head && !r.remote);
        const at = br ? br.at : st.head;
        if (P[at]) { const arr = (stacks[at] = stacks[at] || []); arr.splice(br ? arr.indexOf(br) + 1 : 0, 0, { name: 'HEAD', head: true, at }); }
      }
      const live = new Set();
      for (const [at, arr] of Object.entries(stacks)) {
        const [x, y] = P[at], up = laneOf(at) === 0;
        arr.forEach((r, k) => {
          live.add(r.name);
          const ly = up ? y - 31 - k * 20 : y + 31 + k * 20;
          const w = r.name.length * 6.9 + 14, lx = Math.min(Math.max(x, w / 2 + 2), W - w / 2 - 2);
          let g = lbls.get(r.name);
          if (!g) {
            g = sv('g', { class: 'gt-lbl gt-lbl-in' });
            g.append(sv('rect', { x: -w / 2, y: -9, width: w, height: 18, rx: 5 }), sv('text', { y: 4 }, r.name));
            move(g, lx, ly); gL.append(g); lbls.set(r.name, g);
          } else move(g, lx, ly);
          g.classList.toggle('gt-lbl-head', !!r.head);
          g.classList.toggle('gt-lbl-remote', !!r.remote);
          g.classList.toggle('gt-lbl-on', !r.head && !r.remote && r.name === st.head);
        });
      }
      for (const [name, g] of lbls) if (!live.has(name)) { lbls.delete(name); g.remove(); }
    }
    return { el: h('div', { class: 'gt-gwrap' }, svg), set };
  }
  const isAnc = (all, a, b) => { const st = [b], seenIds = new Set(); while (st.length) { const x = st.pop(); if (x === a) return true; if (seenIds.has(x) || !all[x]) continue; seenIds.add(x); st.push(...all[x].p); } return false; };

  const css = `
.gt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.gt-pre { white-space: pre-wrap; overflow-wrap: anywhere; }
.gt-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 12px; min-width: 0; }
.gt-col { display: grid; gap: 8px; align-content: start; min-width: 0; }

/* commit graph */
.gt-gwrap { min-width: 0; background: var(--surface); border: 1.5px solid var(--line); border-radius: 12px; padding: 6px; }
.gt-graph { display: block; width: 100%; height: auto; margin: 0 auto; overflow: visible; }
.gt-edge { fill: none; stroke: var(--muted); stroke-width: 2.5; }
.gt-edge.gt-ghost { stroke-dasharray: 4 4; opacity: 0.45; }
.gt-edge-in { animation: gt-fade 0.5s ease-out; }
.gt-node { transition: transform 0.5s cubic-bezier(0.3, 0.7, 0.3, 1), opacity 0.3s; }
.gt-node circle { fill: var(--bg); stroke: var(--accent); stroke-width: 3; transition: stroke 0.3s, fill 0.3s; }
.gt-node text { font: 700 10px var(--mono); fill: var(--ink); }
.gt-node.gt-merge circle { stroke: var(--warm); }
.gt-node.gt-hl circle { fill: var(--accent-soft); }
.gt-node.gt-ghost { opacity: 0.45; }
.gt-node.gt-ghost circle { stroke: var(--muted); stroke-dasharray: 4 3; }
.gt-node.gt-gone { opacity: 0; }
.gt-pop { animation: gt-pop 0.45s ease-out; transform-box: fill-box; transform-origin: center; }
@keyframes gt-pop { 0% { transform: scale(0.2); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: none; } }
@keyframes gt-fade { from { opacity: 0; } }
.gt-lbl { transition: transform 0.5s cubic-bezier(0.3, 0.7, 0.3, 1); }
.gt-lbl-in { animation: gt-fade 0.4s ease-out; }
.gt-lbl rect { fill: var(--surface); stroke: var(--ink); stroke-width: 1.5; transition: fill 0.3s, stroke 0.3s; }
.gt-lbl text { font: 600 11px var(--mono); fill: var(--ink); text-anchor: middle; }
.gt-lbl.gt-lbl-on rect { fill: var(--accent-soft); stroke: var(--accent); }
.gt-lbl.gt-lbl-head rect { fill: var(--accent); stroke: var(--accent); }
.gt-lbl.gt-lbl-head text { fill: var(--bg); }
.gt-lbl.gt-lbl-remote rect { fill: var(--warm-soft); stroke: var(--warm); stroke-dasharray: 3 2; }
.gt-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 500 0.74rem var(--mono); color: var(--muted); }
.gt-legend b { color: var(--ink); }

/* 1 terminal */
.gt-term { background: var(--code-bg); color: var(--code-ink); border-radius: 12px; padding: 10px 12px; font: 500 0.8rem/1.55 var(--mono); min-height: 10em; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.gt-ps { color: var(--t-k); }
.gt-terr { color: var(--t-e); }
.gt-tout { color: var(--t-t); }
.gt-tree { display: grid; gap: 2px; align-content: start; font: 500 0.8rem var(--mono); padding: 10px; border-radius: 12px; background: var(--surface); border: 1.5px solid var(--line); min-width: 0; }
.gt-ti { padding: 2px 8px; border-radius: 6px; border: 1.5px solid transparent; overflow-wrap: anywhere; transition: border-color 0.25s, background 0.25s; }
.gt-ti.gt-here { border-color: var(--accent); background: var(--accent-soft); font-weight: 700; }
.gt-ti.gt-fi { color: var(--muted); }
.gt-anat { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; border-radius: 12px; background: var(--code-bg); min-width: 0; }
.gt-tok { font: 600 0.84rem var(--mono); color: var(--code-ink); background: transparent; border: 1.5px dashed var(--t-c); border-radius: 7px; padding: 4px 8px; cursor: pointer; max-width: 100%; overflow-wrap: anywhere; text-align: left; }
.gt-tok[aria-pressed="true"] { border-style: solid; border-color: var(--t-k); color: var(--t-k); }

/* 2 three areas */
.gt-boxes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 10px; min-width: 0; }
.gt-box { display: grid; gap: 8px; align-content: start; padding: 10px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; min-height: 104px; transition: border-color 0.25s, box-shadow 0.25s; }
.gt-box.gt-on { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.gt-box-h { font: 700 0.78rem var(--mono); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 8px; }
.gt-box-h small { font-weight: 500; color: var(--muted); }
.gt-files { display: flex; flex-wrap: wrap; gap: 6px; align-content: start; min-width: 0; }
.gt-f { font: 600 0.76rem var(--mono); padding: 4px 8px; border-radius: 8px; border: 2px solid var(--line); background: var(--bg); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: opacity 0.25s; }
.gt-f small { font-weight: 500; color: var(--muted); }
.gt-f.gt-mod { border-color: var(--warm); background: var(--warm-soft); }
.gt-f.gt-new { border-color: var(--ok); background: var(--ok-soft); }
.gt-f.gt-stg { border-color: var(--accent); background: var(--accent-soft); }
.gt-f.gt-bad { border-color: var(--err); background: var(--err-soft); }
.gt-f.gt-dim { opacity: 0.55; }
.gt-empty { font: 500 0.75rem var(--mono); color: var(--muted); }
.gt-diff { display: grid; background: var(--code-bg); border-radius: 10px; padding: 8px 4px; min-width: 0; }
.gt-dl { font: 500 0.76rem/1.55 var(--mono); color: var(--code-ink); padding: 0 8px; white-space: pre-wrap; overflow-wrap: anywhere; }
.gt-dl.gt-minus { color: var(--t-e); }
.gt-dl.gt-plus { color: var(--t-k); }
.gt-dl.gt-meta { color: var(--t-c); }

/* 3 gitignore */
.gt-ig { display: grid; gap: 4px; min-width: 0; }
.gt-ig-r { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; align-items: center; padding: 5px 8px; border-radius: 8px; border: 1.5px solid var(--line); background: var(--surface); font: 500 0.78rem var(--mono); min-width: 0; transition: opacity 0.25s, border-color 0.25s, background 0.25s; }
.gt-ig-r > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.gt-ig-r.gt-ign { opacity: 0.5; }
.gt-ig-r.gt-warn { border-color: var(--warm); background: var(--warm-soft); }
.gt-ig-r.gt-err { border-color: var(--err); background: var(--err-soft); opacity: 1; }
.gt-tag { font: 600 0.68rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.gt-ignfile { font: 500 0.8rem/1.6 var(--mono); background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: 8px 12px; min-height: 2.6em; white-space: pre-wrap; overflow-wrap: anywhere; }
.gt-msg { display: block; width: 100%; text-align: left; font: 500 0.82rem var(--mono); background: var(--code-bg); color: var(--code-ink); border: 2px solid transparent; border-radius: 10px; padding: 8px 12px; cursor: pointer; white-space: pre-wrap; overflow-wrap: anywhere; }
.gt-msg.gt-right { border-color: var(--ok); }
.gt-msg.gt-wrong { border-color: var(--err); }

/* 5 conflict */
.gt-cf { display: grid; background: var(--code-bg); border-radius: 12px; padding: 8px 0; min-width: 0; }
.gt-cl { font: 500 0.78rem/1.6 var(--mono); color: var(--code-ink); white-space: pre-wrap; overflow-wrap: anywhere; padding: 0 10px; border-left: 3px solid transparent; }
.gt-cl.gt-ours { border-left-color: var(--t-t); background: rgba(124, 200, 245, 0.1); }
.gt-cl.gt-theirs { border-left-color: var(--t-f); background: rgba(198, 168, 255, 0.1); }
.gt-cl.gt-mark { color: var(--t-e); font-weight: 700; }

/* 6 interactive rebase */
.gt-todo { display: grid; gap: 4px; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; }
.gt-todo-r { display: flex; gap: 8px; align-items: center; font: 500 0.78rem var(--mono); color: var(--code-ink); min-width: 0; }
.gt-todo-r > span { overflow-wrap: anywhere; min-width: 0; }
.gt-verb { font: 700 0.76rem var(--mono); min-width: 64px; padding: 3px 6px; border-radius: 6px; border: 1px solid var(--t-c); background: transparent; color: var(--t-k); cursor: pointer; flex: none; }
.gt-verb.gt-v-drop { color: var(--t-e); }
.gt-verb.gt-v-squash, .gt-verb.gt-v-fixup { color: var(--t-s); }
.gt-verb.gt-v-reword { color: var(--t-t); }

/* 7 remotes */
.gt-place { display: grid; gap: 6px; min-width: 0; }

/* 8 pull request */
.gt-pipe { display: flex; flex-wrap: wrap; gap: 6px; }
.gt-stp { font: 600 0.72rem var(--mono); padding: 4px 9px; border-radius: 99px; border: 1.5px solid var(--line); color: var(--muted); transition: background 0.25s, border-color 0.25s, color 0.25s; }
.gt-stp.gt-done { border-color: var(--ok); background: var(--ok-soft); color: var(--ink); }
.gt-stp.gt-now { border-color: var(--accent); background: var(--accent-soft); color: var(--ink); }
.gt-stp.gt-stop { border-color: var(--err); background: var(--err-soft); color: var(--ink); }
.gt-pr { display: grid; gap: 8px; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.25s; }
.gt-pr.gt-merged { border-color: var(--ok); }
.gt-pr-t { font-weight: 700; overflow-wrap: anywhere; }
.gt-pr-m { font: 500 0.75rem var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.gt-chk { display: flex; gap: 8px; align-items: center; font: 500 0.8rem var(--mono); min-width: 0; overflow-wrap: anywhere; }
.gt-dot { width: 12px; height: 12px; border-radius: 50%; flex: none; border: 2px solid var(--muted); }
.gt-dot.gt-run { border-color: var(--warm); border-top-color: transparent; animation: spin 0.8s linear infinite; }
.gt-dot.gt-pass { background: var(--ok); border-color: var(--ok); }
.gt-dot.gt-fail { background: var(--err); border-color: var(--err); }
.gt-badge { justify-self: start; font: 700 0.72rem var(--mono); padding: 3px 9px; border-radius: 99px; background: var(--sunk); color: var(--ink); overflow-wrap: anywhere; }
.gt-badge.gt-b-ok { background: var(--ok-soft); }
.gt-badge.gt-b-err { background: var(--err-soft); }
.gt-badge.gt-b-warn { background: var(--warm-soft); }

/* 9 undo */
.gt-ver { font: 700 0.9rem var(--mono); padding: 6px 10px; border-radius: 8px; border: 2px solid var(--ink); background: var(--bg); color: var(--ink); justify-self: start; }
.gt-ver.gt-lost { border-color: var(--err); background: var(--err-soft); text-decoration: line-through; }
.gt-ver.gt-chg { animation: pop 0.4s ease-out; }

/* kit terminal panels */
.gtk-h { margin: 0 0 4px; font: 600 0.7rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.gtk-h ~ .gtk-h { margin-top: 10px; }
`;

  Lab.addTrack({
    id: 'git',
    title: 'Git and the command line',
    description: 'Save, share and undo your work: the terminal, commits, branches, merging, rebasing, GitHub and pull requests, from zero.',
    group: 'Foundations', requires: [],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'terminal',
        title: 'The terminal',
        tagline: 'A text window where you type commands. Every Git command runs here.',
        level: 'beginner',
        body: `
<p>The terminal is a program that runs commands you type. On macOS it is called Terminal, on Windows you can use PowerShell or Git Bash, and Android Studio has one built in at the bottom of the window. You type a command, press <kbd>Enter</kbd>, and it prints the result.</p>
<p>The terminal is always "standing" in one folder, the <em>working directory</em>. <code>pwd</code> prints where you are, <code>ls</code> lists what is there, <code>cd</code> moves you, and <code>mkdir</code> makes a new folder. Git commands act on the folder you are standing in, so knowing where you are is step one.</p>
<p>Why not just click? Commands are exact, you can repeat them, copy them from docs, and put them in scripts and CI. Every Git feature exists on the command line, while most apps only show some of them. Try the commands below and watch the highlight move in the folder tree.</p>`,
        predict: {
          q: 'You stand in <code>~/projects</code> and run <code>cd NewsApp</code>, then <code>ls</code>. What does <code>ls</code> list?',
          options: ['What is in <code>~/projects</code>', 'What is in NewsApp: <code>app/</code> and the two Gradle files', 'Every file on the disk'],
          a: 1,
          why: '<code>cd</code> changes the working directory, and <code>ls</code> with no argument lists the folder you are standing in.',
        },
        visual(el) {
          const FS = { projects: { NewsApp: { app: { src: {} }, 'build.gradle.kts': null, 'settings.gradle.kts': null }, 'notes.txt': null } };
          let cwd = ['projects'];
          const dirAt = p => p.reduce((d, k) => d[k], FS);
          const tilde = p => '~' + p.map(x => '/' + x).join('');
          const term = h('div', { class: 'gt-term', 'aria-live': 'polite' });
          const tree = h('div', { class: 'gt-tree', 'aria-label': 'Folders on disk' });
          const o = out('');
          const log = [];
          const NOTES = {
            pwd: 'pwd = print working directory. It is the folder every relative path starts from.',
            ls: 'ls lists the folder you are standing in. Folders end with a slash here.',
            'cd ..': 'cd .. moves up one level, to the parent folder.',
            'cd ~': 'cd ~ jumps to your home folder from anywhere.',
            'mkdir docs': 'mkdir makes a folder inside the current one. It does not move you into it.',
          };
          function drawTree() {
            const items = [h('div', { class: 'gt-ti' + (cwd.length === 0 ? ' gt-here' : '') }, '~ (home)')];
            (function walk(d, path, depth) {
              for (const [k, v] of Object.entries(d)) {
                const p = [...path, k], dir = v && typeof v === 'object';
                const here = dir && p.join('/') === cwd.join('/');
                items.push(h('div', { class: `gt-ti${dir ? '' : ' gt-fi'}${here ? ' gt-here' : ''}`, style: `padding-left:${8 + depth * 14}px` }, dir ? k + '/' : k));
                if (dir) walk(v, p, depth + 1);
              }
            })(FS, [], 1);
            tree.replaceChildren(...items);
          }
          function drawTerm() {
            term.replaceChildren(...log.slice(-6).flatMap(e => [
              h('div', {}, h('span', { class: 'gt-ps' }, e.ps + ' '), e.cmd),
              ...e.res.map(r => h('div', { class: e.err ? 'gt-terr' : 'gt-tout' }, r)),
            ]));
          }
          function run(c) {
            const ps = `sam@laptop:${tilde(cwd)}$`;
            const [name, arg] = c.split(' ');
            let res = [], err = false, note = NOTES[c] || '';
            const d = dirAt(cwd);
            if (name === 'pwd') res = ['/home/sam' + cwd.map(x => '/' + x).join('')];
            else if (name === 'ls') { const ks = Object.keys(d); if (ks.length) res = [ks.map(k => (d[k] ? k + '/' : k)).join('  ')]; else note = 'ls printed nothing: this folder is empty.'; }
            else if (name === 'cd') {
              if (arg === '..') { if (cwd.length) cwd = cwd.slice(0, -1); else note = 'In the real terminal this goes to /home. The demo stops at your home folder.'; }
              else if (arg === '~') cwd = [];
              else if (d[arg] && typeof d[arg] === 'object') { cwd = [...cwd, arg]; note = `You are now inside ${arg}. The prompt shows the new path.`; }
              else { res = [`bash: cd: ${arg}: No such file or directory`]; err = true; note = `There is no ${arg} folder here. cd looks inside the current folder, so check where you are with pwd and ls.`; }
            } else if (name === 'mkdir') {
              if (arg in d) { res = [`mkdir: cannot create directory '${arg}': File exists`]; err = true; note = 'That folder already exists here.'; }
              else d[arg] = {};
            }
            log.push({ ps, cmd: c, res, err });
            drawTerm(); drawTree();
            say(o, esc(note));
          }
          drawTree();
          log.push({ ps: 'sam@laptop:~/projects$', cmd: '', res: [], err: false });
          drawTerm();
          say(o, 'The prompt shows who you are, the computer, and the folder you are in. Run a command.');
          el.append(
            row(...['pwd', 'ls', 'cd NewsApp', 'cd app', 'cd ..', 'mkdir docs', 'cd ~'].map(c => act(c, () => run(c)))),
            h('div', { class: 'gt-split' }, h('div', { class: 'gt-col' }, lab('terminal'), term), h('div', { class: 'gt-col' }, lab('folders'), tree)),
            o);
        },
        code: `# Where am I, and what is here?
pwd                      # /home/sam/projects
ls                       # NewsApp/  notes.txt

# Move around
cd NewsApp            # into a folder (relative path)
cd app/src               # several levels at once
cd ..                    # up one level
cd ~/projects            # from home, wherever you are now

# Make things
mkdir docs               # new folder
touch docs/notes.md      # new empty file (macOS / Linux / Git Bash)

# Is Git installed?
git --version`,
        remember: 'Know where you are before you run anything: pwd, then ls, then the command.',
        deeper: [
          {
            title: 'Reading a command: program, subcommand, flags, arguments',
            body: `<p>Most commands follow one pattern. First the <em>program</em> (<code>git</code>), then often a <em>subcommand</em> (<code>commit</code>), then <em>flags</em> that start with dashes, then <em>arguments</em>, the things to act on. Short flags use one dash (<code>-m</code>), long flags two (<code>--message</code>). Quotes keep words with spaces together as one argument.</p>
<p>Tap each part of the command below.</p>`,
            visual(el) {
              const parts = [
                ['git', 'Program: the tool to run. The shell finds it on your PATH.'],
                ['commit', 'Subcommand: which of git\'s many jobs to do.'],
                ['-m', 'Flag (short form of --message): the next argument is the commit message.'],
                ['"Add login screen"', 'Argument: the value for -m. The quotes make three words one argument.'],
                ['--verbose', 'Long flag with no value: switches a behaviour on.'],
              ];
              const o = out('');
              const btns = parts.map(([t, d]) => h('button', { class: 'gt-tok', onclick() { press(btns, this); say(o, esc(d)); } }, t));
              say(o, 'Tap a part of the command.');
              el.append(h('div', { class: 'gt-anat' }, btns), o);
            },
          },
          {
            title: 'Absolute and relative paths',
            body: `<p>A path that starts with <code>/</code> (or <code>~</code>, your home folder) is <em>absolute</em>: it works from anywhere. Any other path is <em>relative</em> to where you stand. <code>.</code> means "this folder" and <code>..</code> means "the parent". If a folder name has spaces, put it in quotes.</p>`,
            code: `cd /home/sam/projects/NewsApp   # absolute: works from anywhere
cd ~/projects/NewsApp             # same place, shorter
cd app                               # relative: only if app is right here
cd ../..                             # up two levels
cd "Android Projects"                # quotes for spaces`,
          },
          {
            title: 'Set Git up once: your name and email',
            body: `<p>Every commit records an author. Tell Git who you are once per computer with <code>git config --global</code>. Use the same email as your GitHub account so your commits link to your profile. Press <kbd>Tab</kbd> to complete file and folder names, and the up arrow to bring back the previous command.</p>`,
            code: `git config --global user.name "Sam Lee"
git config --global user.email "sam@example.com"
git config --global init.defaultBranch main   # new repos start on "main"
git config --list                             # check what is set`,
          },
        ],
        underHood: {
          body: `<p>The terminal window runs a <em>shell</em> (bash, zsh or PowerShell). When you type <code>git status</code>, the shell splits the line into words, looks for a program called <code>git</code> in the folders listed in the <code>PATH</code> variable, starts it, and passes it the other words. When the program ends it returns an <em>exit code</em>: 0 means success, anything else means failure. Scripts and CI use exit codes to decide whether to stop.</p>`,
          code: `which git        # /usr/bin/git: where the shell found it
echo $PATH       # the folders it searches, separated by :
git status
echo $?          # exit code of the last command: 0 = success`,
        },
        mistakes: [
          { title: 'Running Git in the wrong folder', bad: `cd ~
git init        # turns your whole home folder into a repository`, good: `cd ~/projects/NewsApp
pwd             # check first
git init`, why: 'Git acts on the current folder. Running <code>git init</code> in your home folder makes Git track everything under it. Check with <code>pwd</code> first.' },
          { title: 'Spaces in paths without quotes', bad: `cd Android Projects
# bash: cd: too many arguments`, good: `cd "Android Projects"`, why: 'The shell splits words on spaces, so <code>Android</code> and <code>Projects</code> become two arguments. Quotes keep them together.' },
        ],
        terms: [
          { term: 'Terminal', def: 'A window where you type text commands and see their output.' },
          { term: 'Working directory', def: 'The folder the terminal is currently in. Relative paths and most Git commands start from it.' },
          { term: 'Flag', def: 'An option that starts with - or --, such as -m or --verbose, that changes what a command does.' },
          { term: 'Exit code', def: 'The number a program returns when it ends. 0 means success.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print where you are, then move into the <code>app</code> folder inside <code>NewsApp</code>.', code: '[[pwd]]\n[[cd]] NewsApp/app', why: '<code>pwd</code> prints the working directory. <code>cd</code> changes it, and one path can go down several levels.' },
          { type: 'bug', prompt: 'You start in <code>~/projects</code> and want to end in <code>~/projects/NewsApp/app</code>. Tap the wrong line.', code: 'cd NewsApp\nls\ncd ../app\npwd', bug: 2, fix: 'cd app', why: '<code>..</code> goes up to <code>projects</code> first, where there is no <code>app</code> folder. <code>app</code> is right here inside <code>NewsApp</code>, so a plain relative path works.' },
        ],
        quiz: [
          { q: 'What does <code>cd ..</code> do?', options: ['Goes to your home folder', 'Moves up one level to the parent folder', 'Lists hidden files'], a: 1, why: '<code>..</code> always means the parent of the current folder.' },
          { q: 'In <code>git commit -m "Fix crash"</code>, what is <code>"Fix crash"</code>?', options: ['A subcommand', 'A flag', 'An argument, the value of -m'], a: 2, why: 'The quoted text is the argument that <code>-m</code> expects. Quotes keep the two words together.' },
          { q: 'A command printed nothing at all. What most likely happened?', options: ['It failed', 'It succeeded and had nothing to report', 'The terminal froze'], a: 1, why: 'Many commands stay silent on success. Check the exit code with <code>echo $?</code> if you are unsure.' },
          { q: 'You are in <code>/home/sam/projects/NewsApp/app/src</code> and run <code>cd ../..</code>. Where are you now?', options: ['<code>/home/sam/projects</code>', '<code>/home/sam/projects/NewsApp/app</code>', '<code>/home/sam/projects/NewsApp</code>'], a: 2, why: 'Each .. goes up one level: first to app, then to NewsApp.' },
          { q: '<code>cd Android Projects</code> fails, but the folder exists. Why?', options: ['Folder names can’t contain spaces', 'The shell split the name into two arguments; quote it: <code>cd "Android Projects"</code>', 'cd only accepts absolute paths'], a: 1, why: 'The shell splits words on spaces before the program sees them. Quotes keep the folder name together as one argument.' },
        ],
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'commits',
        title: 'Repositories and commits',
        tagline: 'Pick changes into the staging area, then save them as a snapshot in history.',
        level: 'beginner',
        body: `
<p><code>git init</code> turns a folder into a <em>repository</em>: Git adds a hidden <code>.git</code> folder where it keeps all history. Your files stay where they are. From now on, Git compares them with the last saved version.</p>
<p>Saving takes two steps. <code>git add</code> copies a change into the <em>staging area</em>, a draft of your next commit. <code>git commit</code> saves everything in the staging area as a <em>commit</em>: a snapshot of the project with a message, an author and a unique id. The two steps let you edit five files but commit only the two that belong together.</p>
<p><code>git status</code> tells you which files are changed, which are staged, and which Git has never seen (<em>untracked</em>). Run it often. Below, edit files, stage them and commit, and watch them move between the three areas.</p>`,
        predict: {
          q: 'You edited <code>MainActivity.kt</code> and <code>README.md</code>, but run <code>git add</code> only on MainActivity.kt before <code>git commit</code>. Where does the README edit end up?',
          options: ['In the commit too', 'Still in your files, changed but not committed', 'Gone: Git discards edits that were not added'],
          a: 1,
          why: 'A commit saves exactly what is in the staging area. The README edit stays in the working tree for a later commit.',
        },
        visual(el) {
          const F = [
            { n: 'MainActivity.kt', w: 1, i: 1, c: 1 },
            { n: 'strings.xml', w: 1, i: 1, c: 1 },
            { n: 'README.md', w: 1, i: 0, c: 0 },
          ];
          const IDS = ['5b2f7d4', 'a90c13e', '71d4be2', 'c08f5a9', '2e6b9d1', '9fd0a37', '4c1e8b2', 'd37a0f5'];
          const hist = [{ id: 'e3a91c0', msg: 'Initial commit' }];
          let fresh = new Set();
          const wt = h('div', { class: 'gt-files' }), st = h('div', { class: 'gt-files' }), hi = h('div', { class: 'gt-files' });
          const bW = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, '1 Working tree', h('small', {}, 'your files')), wt);
          const bS = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, '2 Staging area', h('small', {}, 'next commit')), st);
          const bH = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, '3 History', h('small', {}, 'commits')), hi);
          const o = out('');
          const kind = f => (f.c === 0 && f.i === 0 ? 'untracked' : f.w !== f.i ? 'modified' : f.i !== f.c ? 'staged' : 'unchanged');
          function draw(on) {
            wt.replaceChildren(...F.map(f => {
              const k = kind(f);
              const cls = k === 'untracked' ? 'gt-new' : k === 'modified' ? 'gt-mod' : 'gt-dim';
              return h('span', { class: `gt-f ${cls}${fresh.has('w' + f.n) ? ' drop-in' : ''}` }, f.n, ' ', h('small', {}, k));
            }));
            const staged = F.filter(f => f.i !== f.c);
            st.replaceChildren(...(staged.length ? staged.map(f => h('span', { class: `gt-f gt-stg${fresh.has('s' + f.n) ? ' drop-in' : ''}` }, f.n, ' ', h('small', {}, f.c === 0 ? 'new file' : 'modified'))) : [h('span', { class: 'gt-empty' }, 'empty')]));
            hi.replaceChildren(...hist.slice(-4).reverse().map((c, j) => h('span', { class: `gt-f${j === 0 && fresh.has('h') ? ' pop' : ''}` }, h('small', {}, c.id + ' '), c.msg)));
            [bW, bS, bH].forEach(b => b.classList.toggle('gt-on', b === on));
            fresh = new Set();
          }
          function edit(f) { f.w++; fresh.add('w' + f.n); draw(bW); say(o, `You saved ${esc(f.n)} in the editor. Git notices it differs from the last commit: <span class="bad">modified</span>.`); }
          function add(list) {
            const ch = list.filter(f => f.w !== f.i);
            if (!ch.length) { draw(bS); say(o, '<span class="muted">Nothing new to stage. git add only copies changes that are not staged yet.</span>'); return; }
            ch.forEach(f => { f.i = f.w; fresh.add('s' + f.n); fresh.add('w' + f.n); });
            draw(bS);
            say(o, `Staged ${esc(ch.map(f => f.n).join(', '))}. A copy of the file as it is now sits in the staging area. Edit it again and you would need to add again.`);
          }
          function commit() {
            const staged = F.filter(f => f.i !== f.c);
            if (!staged.length) {
              draw(bS);
              const dirty = F.some(f => kind(f) === 'modified'), untr = F.some(f => kind(f) === 'untracked');
              say(o, `<span class="bad">${dirty ? 'no changes added to commit (use "git add")' : untr ? 'nothing added to commit but untracked files present (use "git add" to track)' : 'nothing to commit, working tree clean'}</span>`);
              return;
            }
            const msg = staged.length === 1 ? `${staged[0].c === 0 ? 'Add' : 'Update'} ${staged[0].n}` : `Update ${staged.length} files`;
            const id = IDS[(hist.length - 1) % IDS.length];
            staged.forEach(f => { f.c = f.i; });
            hist.push({ id, msg }); fresh.add('h');
            draw(bH);
            say(o, `[main ${id}] ${esc(msg)}\n<span class="muted">${staged.length} file(s) saved as a new snapshot. Changes you did not stage stay in the working tree.</span>`);
          }
          function status() {
            const L = ['On branch main'];
            const staged = F.filter(f => f.i !== f.c), mod = F.filter(f => kind(f) === 'modified' && f.c !== 0), untr = F.filter(f => f.c === 0 && f.i === 0);
            if (staged.length) L.push('Changes to be committed:', ...staged.map(f => `<span class="good">    ${f.c === 0 ? 'new file' : 'modified'}:   ${esc(f.n)}</span>`));
            if (mod.length) L.push('Changes not staged for commit:', ...mod.map(f => `<span class="bad">    modified:   ${esc(f.n)}</span>`));
            if (untr.length) L.push('Untracked files:', ...untr.map(f => `<span class="bad">    ${esc(f.n)}</span>`));
            if (L.length === 1) L.push('nothing to commit, working tree clean');
            draw(null);
            say(o, L.join('\n'));
          }
          draw(null);
          say(o, 'A repository with one commit. README.md is new, so Git does not track it yet.');
          el.append(
            row(act('edit MainActivity.kt', () => edit(F[0])), act('edit strings.xml', () => edit(F[1]))),
            row(act('git add MainActivity.kt', () => add([F[0]])), act('git add .', () => add(F)), act('git commit -m "…"', commit), act('git status', status)),
            h('div', { class: 'gt-boxes' }, bW, bS, bH), o);
        },
        code: `cd ~/projects/NewsApp
git init                         # creates .git/, starts on the default branch
git status                       # what changed, what is staged, what is new

git add app/src/main/java/com/example/news/MainActivity.kt
git add .                        # stage every change under this folder
git commit -m "Add news list screen"

git log --oneline                # one line per commit, newest first
# 5b2f7d4 (HEAD -> main) Add news list screen
# e3a91c0 Initial commit`,
        remember: 'Edit, git add the changes that belong together, git commit. Run git status between every step.',
        deeper: [
          {
            title: 'git diff: what exactly changed?',
            body: `<p><code>git diff</code> compares two of the three areas. With no options it shows what you changed but have not staged. <code>git diff --staged</code> shows what the next commit will contain. <code>git diff HEAD</code> shows everything since the last commit. Lines with <code>-</code> were removed, lines with <code>+</code> were added.</p>`,
            visual(el) {
              const V = { w: 'News Pro', s: 'News App', c: 'News' };
              const mk = (t, k) => h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, t), h('span', { class: 'gt-f' }, 'app_name = ', h('small', {}, V[k])));
              const bW = mk('Working tree', 'w'), bS = mk('Staging area', 's'), bC = mk('Last commit', 'c');
              const diff = h('div', { class: 'gt-diff' });
              const MODES = {
                'git diff': [bS, bW, 's', 'w', 'Unstaged changes: staging area → working tree.'],
                'git diff --staged': [bC, bS, 'c', 's', 'What the next commit will add: last commit → staging area.'],
                'git diff HEAD': [bC, bW, 'c', 'w', 'Everything since the last commit.'],
              };
              const o = out('');
              const btns = Object.keys(MODES).map(m => act(m, function () {
                const [a, b, va, vb, note] = MODES[m];
                press(btns, this);
                [bW, bS, bC].forEach(x => x.classList.toggle('gt-on', x === a || x === b));
                diff.replaceChildren(
                  h('div', { class: 'gt-dl gt-meta' }, '@@ res/values/strings.xml @@'),
                  h('div', { class: 'gt-dl gt-minus' }, `-    <string name="app_name">${V[va]}</string>`),
                  h('div', { class: 'gt-dl gt-plus' }, `+    <string name="app_name">${V[vb]}</string>`));
                replay(diff, 'pop-soft');
                say(o, note);
              }));
              say(o, 'Each area holds a different version of the app name. Pick a diff.');
              el.append(row(btns), h('div', { class: 'gt-boxes' }, bW, bS, bC), diff, o);
            },
          },
          {
            title: 'Reading history with git log',
            body: `<p><code>git log</code> lists commits newest first: id, author, date and message. <code>--oneline</code> keeps one line each. <code>-p</code> shows the diff of each commit. Add a file path to see only the commits that touched that file. Press <kbd>q</kbd> to leave the log viewer.</p>`,
            code: `git log --oneline -5                     # last 5 commits
git log -p -- app/src/main/res/values/strings.xml   # every change to one file
git show 5b2f7d4                         # one commit in full
git log --author="Sam" --since="1 week ago"`,
          },
          {
            title: 'Commit ids are hashes',
            body: `<p>The id of a commit, like <code>5b2f7d4…</code>, is a hash computed from its content: the snapshot, the parent commit, the author, the time and the message. Change any of these and you get a different id. That is why ids are unique, and why "changing" an old commit really makes a new one. Git usually shows only the first 7 characters, and that is enough to name a commit.</p>`,
          },
        ],
        underHood: {
          body: `<p>Everything lives in <code>.git/objects</code>. A <em>blob</em> holds one file's content, a <em>tree</em> lists the files and folders of a snapshot, and a <em>commit</em> points to one tree, its parent commit(s), and has the author and message. Each object is stored under its hash (SHA-1 by default). Files that did not change between commits are not copied again: the new tree just points to the same blob.</p>`,
          code: `git cat-file -p HEAD
# tree 9c3e5a1f...
# parent e3a91c0b...
# author Sam Lee <sam@example.com> 1760600000 +0000
# committer Sam Lee <sam@example.com> 1760600000 +0000
#
# Add news list screen`,
        },
        mistakes: [
          { title: 'Committing without staging', bad: `# edited MainActivity.kt
git commit -m "Fix crash"
# no changes added to commit`, good: `git add MainActivity.kt
git commit -m "Fix crash"`, why: '<code>git commit</code> only saves what is in the staging area. Stage first, or use <code>git commit -am</code> to stage changes to files Git already tracks (not new files).' },
          { title: 'git add . without looking', bad: `git add .
git commit -m "Stuff"`, good: `git status
git diff
git add app/src/main/java/com/example/news/NewsAdapter.kt
git commit -m "Show source name on news cards"`, why: '<code>git add .</code> stages everything, including debug logs, keys and unrelated edits. Look at <code>git status</code> and <code>git diff</code> first, and add what belongs together.' },
        ],
        terms: [
          { term: 'Repository', def: 'A project folder plus the .git folder that holds its full history.' },
          { term: 'Staging area', def: 'The draft of your next commit. git add puts changes in it. Also called the index.' },
          { term: 'Commit', def: 'A saved snapshot of the project with a message, an author, a parent and a unique id.' },
          { term: 'Untracked file', def: 'A file in the folder that Git has never been told to track.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Stage one file, then save it as a commit.', code: 'git [[add]] MainActivity.kt\ngit [[commit]] -m "Add login screen"', why: '<code>add</code> puts the change in the staging area, <code>commit</code> saves the staging area into history.' },
          { type: 'bug', prompt: 'Git replies "nothing added to commit but untracked files present". Tap the line to change.', code: 'cd NewsApp\ngit init\ngit commit -m "Initial commit"\ngit log --oneline', bug: 2, fix: 'git add . && git commit -m "Initial commit"', why: 'A new repository tracks nothing yet. Stage the files first, then commit.' },
        ],
        quiz: [
          { q: 'You changed 3 files but want only 2 in the next commit. How?', options: ['git commit -m with the 2 names in the message', 'git add the 2 files, then git commit', 'Delete the third file'], a: 1, why: 'The staging area exists for exactly this. Only staged changes go into the commit.' },
          { q: 'After git add, you edit the same file again. What does git commit save?', options: ['The newest version', 'The version you staged', 'Both versions'], a: 1, why: 'git add copies the file as it was at that moment. The later edit is unstaged until you add again.' },
          { q: 'Where does Git store the history of a repository?', options: ['On GitHub only', 'In the hidden .git folder', 'In each file'], a: 1, why: 'Everything Git knows is in <code>.git</code>. Delete it and the folder is no longer a repository.' },
          { q: 'You staged a file, then edited it again. Which command shows only that second, unstaged edit?', options: ['<code>git diff --staged</code>', '<code>git diff</code>', '<code>git log -p</code>'], a: 1, why: 'Plain git diff compares your files with the staging area. --staged shows what the next commit will contain.' },
          { q: 'You created a new file Search.kt and edited a tracked file. What does <code>git commit -am "Add search"</code> commit?', options: ['Both files', 'Nothing, because Search.kt is not staged', 'Only the edit to the tracked file'], a: 2, why: '-a stages changes to files Git already tracks. A new file stays untracked until you git add it.' },
        ],
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'ignore',
        title: 'Good commits and .gitignore',
        tagline: 'Commit one idea at a time, and never commit files a machine can rebuild or a stranger should not see.',
        level: 'beginner',
        body: `
<p>A good commit holds one logical change and builds on its own. Its message has a short summary line, 50 characters or less, that says what the change does, like <code>Fix crash when the feed is empty</code>. Small commits are easier to review, easier to revert, and make <code>git log</code> readable months later.</p>
<p>Some files must never be committed. An Android project creates <code>build/</code> folders and a <code>.gradle/</code> cache on every build. <code>local.properties</code> holds the SDK path of your own machine. Keystores (<code>.jks</code>) sign your releases and are secret. Most of <code>.idea/</code> is your personal Android Studio state. A <code>.gitignore</code> file lists patterns, and Git stops showing matching untracked files.</p>
<p>Be careful with broad patterns. <code>gradle/wrapper/gradle-wrapper.jar</code> must be committed, so that teammates and CI can run <code>./gradlew</code>. Turn the patterns on below and watch which files Git would still offer to commit.</p>`,
        predict: {
          q: 'You add the line <code>build/</code> to .gitignore. Which paths does it hide?',
          options: ['Only a <code>build</code> folder at the project root', 'Every folder named <code>build</code> at any depth, like <code>app/build/</code>', 'Every file with build in its name, like <code>build.gradle.kts</code>'],
          a: 1,
          why: 'A pattern with no slash except at the end matches a folder with that name anywhere below the .gitignore. The trailing slash means folders only.',
        },
        visual(el) {
          const FILES = [
            ['app/src/main/java/com/example/news/MainActivity.kt', 'keep'],
            ['app/build.gradle.kts', 'keep'],
            ['gradle/wrapper/gradle-wrapper.jar', 'keep'],
            ['app/build/outputs/apk/debug/app-debug.apk', 'junk'],
            ['.gradle/ (Gradle cache)', 'junk'],
            ['.idea/workspace.xml', 'junk'],
            ['local.properties', 'private'],
            ['release.jks', 'private'],
          ];
          const PATS = [
            ['build/', p => /(^|\/)build\//.test(p)],
            ['.gradle/', p => p.startsWith('.gradle/')],
            ['local.properties', p => p === 'local.properties'],
            ['*.jks', p => p.endsWith('.jks')],
            ['.idea/workspace.xml', p => p === '.idea/workspace.xml'],
            ['*.jar', p => p.endsWith('.jar')],
          ];
          const on = new Set();
          const file = h('div', { class: 'gt-ignfile', 'aria-label': '.gitignore contents' });
          const list = h('div', { class: 'gt-ig' });
          const o = out('');
          const btns = PATS.map(([p]) => act(p, function () { on.has(p) ? on.delete(p) : on.add(p); this.setAttribute('aria-pressed', String(on.has(p))); draw(p); }, { 'aria-pressed': 'false' }));
          function draw(changed) {
            file.textContent = on.size ? PATS.filter(([p]) => on.has(p)).map(([p]) => p).join('\n') : '# .gitignore is empty';
            let leaks = 0, junk = 0, broken = 0, shown = 0;
            list.replaceChildren(...FILES.map(([path, kind]) => {
              const hit = PATS.find(([p, f]) => on.has(p) && f(path.split(' ')[0]));
              let cls = '', tag;
              if (hit) {
                if (kind === 'keep') { cls = 'gt-err'; tag = `ignored by ${hit[0]}, but the team needs it`; broken++; }
                else { cls = 'gt-ign'; tag = `ignored by ${hit[0]}`; }
              } else {
                shown++;
                if (kind === 'junk') { cls = 'gt-warn'; tag = 'generated: would be committed'; junk++; }
                else if (kind === 'private') { cls = 'gt-err'; tag = 'private: would be committed'; leaks++; }
                else tag = 'tracked';
              }
              const r = h('div', { class: `gt-ig-r ${cls}` }, h('span', {}, path), h('span', { class: 'gt-tag' }, tag));
              if (changed && hit && hit[0] === changed) replay(r, 'pop-soft');
              return r;
            }));
            replay(file, 'pop-soft');
            if (broken) say(o, `<span class="bad">*.jar also hides gradle-wrapper.jar.</span> A fresh clone could not run ./gradlew. Remove that pattern.`);
            else if (!leaks && !junk) say(o, `<span class="good">Clean.</span> git status now offers only the ${shown} files that belong in the repository.`);
            else say(o, `git status would offer ${shown} files: ${leaks ? `<span class="bad">${leaks} private</span>` : '0 private'}, ${junk ? `<span class="bad">${junk} generated</span>` : '0 generated'}.`);
          }
          draw();
          el.append(row(lab('add a line'), ...btns), h('div', { class: 'gt-split' }, h('div', { class: 'gt-col' }, lab('.gitignore'), file), h('div', { class: 'gt-col' }, lab('files in the project'), list)), o);
        },
        code: `# .gitignore for an Android project (in the project root)
build/                 # every build output folder, at any depth
.gradle/               # Gradle's local cache
local.properties       # sdk.dir=/Users/sam/Library/Android/sdk
*.jks
*.keystore             # signing keys never go in Git
.idea/workspace.xml
.idea/caches/
captures/
.DS_Store

# then
git add .gitignore
git commit -m "Ignore build outputs and local files"`,
        remember: 'One idea per commit, a short summary line, and a .gitignore before the first git add.',
        deeper: [
          {
            title: 'Pick the better commit message',
            body: `<p>The summary line is what people see in <code>git log --oneline</code>, on GitHub and in review tools. Say what the change does, in the imperative ("Fix", "Add", "Remove"), and keep it short. Put the why in the body, after a blank line.</p>`,
            visual(el) {
              const ROUNDS = [
                ['fixed stuff', 'Fix crash when the news feed is empty', 1, 'It names the change. "fixed stuff" tells a reader nothing.'],
                ['Add pull-to-refresh to the news list', 'Add pull-to-refresh, dark mode and new onboarding, fix 3 crashes', 0, 'One idea per commit. The second one should be four commits.'],
                ['Update NewsViewModel.kt', 'Retry the feed request once on timeout', 1, 'The file name is already in the diff. Say what changed in behaviour.'],
              ];
              let i = 0, score = 0;
              const box = h('div', { class: 'gt-col' });
              const o = out('');
              function show() {
                if (i >= ROUNDS.length) { box.replaceChildren(); say(o, `${score} of ${ROUNDS.length}. Press Reset to try again.`); return; }
                const [a, b, good, why] = ROUNDS[i];
                const opts = [a, b].map((m, j) => h('button', { class: 'gt-msg', onclick() {
                  if (box.dataset.done) return; box.dataset.done = '1';
                  opts[good].classList.add('gt-right'); if (j !== good) this.classList.add('gt-wrong'); else score++;
                  say(o, `${j === good ? '<span class="good">Yes.</span>' : '<span class="bad">Not this one.</span>'} ${esc(why)}`);
                  setTimeout(() => { if (!el.isConnected) return; delete box.dataset.done; i++; show(); }, 2200);
                } }, m));
                box.replaceChildren(lab(`round ${i + 1} of ${ROUNDS.length}`), ...opts);
              }
              show(); say(o, 'Which message would you rather read in the log?');
              el.append(box, o);
            },
          },
          {
            title: 'Already committed it? Untrack it',
            body: `<p><code>.gitignore</code> only affects untracked files. If <code>local.properties</code> is already in a commit, adding it to <code>.gitignore</code> changes nothing. Remove it from the index with <code>git rm --cached</code>; the file stays on your disk.</p>`,
            code: `echo "local.properties" >> .gitignore
git rm --cached local.properties     # stop tracking, keep the file
git commit -m "Stop tracking local.properties"
git check-ignore -v local.properties # which rule ignores it?`,
          },
          {
            title: 'Pushed a secret? Rotate it',
            body: `<p>If a key, password or keystore reached a shared repository, treat it as public. Deleting it in a new commit does not remove it from history, and anyone may already have a copy. Revoke or rotate the key first, then clean up. For patterns that are only yours, like your editor's files, use <code>.git/info/exclude</code> or a global ignore file instead of the shared <code>.gitignore</code>.</p>`,
            code: `# personal ignores, not shared with the team
echo ".vscode/" >> .git/info/exclude
git config --global core.excludesFile ~/.gitignore_global`,
          },
        ],
        mistakes: [
          { title: 'Ignoring all jars', bad: `*.jar`, good: `# no *.jar rule: gradle/wrapper/gradle-wrapper.jar must be committed
build/
.gradle/`, why: 'The Gradle wrapper jar lets anyone build the project with <code>./gradlew</code> without installing Gradle. A broad <code>*.jar</code> rule hides it.' },
          { title: 'Adding .gitignore after the fact', bad: `git add .
git commit -m "Initial commit"   # build/ and local.properties are in
echo "build/" >> .gitignore`, good: `# write .gitignore first
git add .gitignore
git add .
git commit -m "Initial commit"`, why: 'Ignore rules do not untrack files that are already committed. Write <code>.gitignore</code> before the first <code>git add .</code>, or untrack with <code>git rm --cached</code>.' },
        ],
        terms: [
          { term: '.gitignore', def: 'A file of patterns. Untracked files that match are hidden from git status and git add.' },
          { term: 'local.properties', def: 'A file Android Studio writes with your machine’s SDK path. It differs per computer, so it is not committed.' },
          { term: 'Keystore', def: 'A file (.jks or .keystore) holding the keys that sign your app. Keep it out of Git.' },
          { term: 'Gradle wrapper', def: 'gradlew scripts plus gradle-wrapper.jar that download and run the right Gradle version. Commit them.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ignore every build output folder, and the file with your SDK path.', code: '[[build/|build|/build/|**/build/]]\n.gradle/\n[[local.properties|/local.properties]]\n*.jks', why: '<code>build/</code> with a trailing slash matches a folder named build at any depth. <code>local.properties</code> holds a path that only exists on your machine.' },
          { type: 'bug', prompt: 'With this .gitignore, a fresh clone on CI cannot run <code>./gradlew</code>. Tap the line.', code: 'build/\n.gradle/\nlocal.properties\n*.jar\n.idea/workspace.xml', bug: 3, fix: '*.jks', why: '<code>*.jar</code> also ignores <code>gradle/wrapper/gradle-wrapper.jar</code>. You probably meant <code>*.jks</code>, the keystore.' },
        ],
        quiz: [
          { q: 'Why is <code>local.properties</code> not committed?', options: ['It is too big', 'It holds a path that is only valid on your computer', 'Gradle forbids it'], a: 1, why: 'It points to your own SDK folder. A teammate’s machine needs its own value.' },
          { q: 'You add <code>secrets.txt</code> to .gitignore, but it was committed last week. What happens?', options: ['Git deletes it from history', 'Nothing: Git keeps tracking it', 'Git untracks it automatically'], a: 1, why: '.gitignore only affects untracked files. Use <code>git rm --cached</code>, and rotate any secret that was pushed.' },
          { q: 'Which is the best commit summary line?', options: ['changes', 'Fix login button doing nothing on Android 14', 'Updated LoginScreen.kt, LoginViewModel.kt and strings.xml with fixes'], a: 1, why: 'Short, imperative, and it says what the change does. The file list is already in the diff.' },
          { q: 'local.properties is already committed. Which command stops tracking it but keeps the file on your disk?', options: ['<code>git rm local.properties</code>', '<code>git rm --cached local.properties</code>', '<code>git restore local.properties</code>'], a: 1, why: 'git rm --cached removes the file from the index only. Plain git rm also deletes it from your disk.' },
          { q: 'A signing keystore password was pushed to the shared GitHub repository. What do you do first?', options: ['Delete it in a new commit', 'Revoke or rotate the key and password', 'Add it to .gitignore'], a: 1, why: 'Anything that reached a shared repository may already be copied, and a new commit doesn’t remove it from history. Make the leaked secret useless first, then clean up.' },
        ],
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'branches',
        title: 'Branches',
        tagline: 'A branch is a movable label on a commit. HEAD says which label you are on.',
        level: 'beginner',
        body: `
<p>Each commit points back to its parent, so history forms a chain. A <em>branch</em> is just a name that points to one commit, like <code>main</code>. When you commit, the branch you are on moves forward to the new commit. Nothing is copied, so creating a branch is instant.</p>
<p><code>HEAD</code> is Git's "you are here". It normally points to a branch. <code>git branch feature</code> creates a new label on the current commit but does not move you. <code>git switch feature</code> moves HEAD to it and updates your files to match. <code>git switch -c feature</code> does both.</p>
<p>Branches let you start a feature, park it, fix a crash on <code>main</code>, and come back, without the work getting mixed. Commit a few times below, create a branch, switch, and commit again. Watch which label moves.</p>`,
        visual(el) {
          const log = s => '<pre class="ui-out">' + s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
          Lab.ui.terminal(el, {
            panelTitle: 'git log --oneline --graph --all',
            predict: {
              q: 'You are on <code>feature/search</code> and run <code>git commit</code>. Which label moves to the new commit?',
              options: ['Both <code>main</code> and <code>feature/search</code>', 'Only <code>feature/search</code>', 'Only <code>main</code>', 'Neither, only HEAD moves'],
              a: 1,
              why: 'A commit moves the branch HEAD points to, and only that one.',
            },
            frames: [
              { panel: log('* b2f41c9 (HEAD -> main) Add home screen\n* a19e0d3 Initial commit'), say: 'Two commits on <code>main</code>. HEAD points to <code>main</code>: that is where you are.' },
              { cmd: 'git branch feature/search', panel: log('* b2f41c9 (HEAD -> main, feature/search) Add home screen\n* a19e0d3 Initial commit'), say: 'A new label on the same commit. Nothing is copied, and HEAD did not move.' },
              { cmd: 'git switch feature/search', out: "Switched to branch 'feature/search'", panel: log('* b2f41c9 (HEAD -> feature/search, main) Add home screen\n* a19e0d3 Initial commit'), say: 'Now HEAD points to <code>feature/search</code>. Both labels are still on the same commit.' },
              { cmd: 'git commit -am "Add search box"', out: '[feature/search 7c10a2e] Add search box\n 1 file changed, 12 insertions(+)', panel: log('* 7c10a2e (HEAD -> feature/search) Add search box\n* b2f41c9 (main) Add home screen\n* a19e0d3 Initial commit'), say: 'Only the branch HEAD points to moves forward. <code>main</code> stays where it was.' },
              { cmd: 'git switch main', out: "Switched to branch 'main'", panel: log('* 7c10a2e (feature/search) Add search box\n* b2f41c9 (HEAD -> main) Add home screen\n* a19e0d3 Initial commit'), say: 'Your files go back to how they are on <code>main</code>. The search box is safe on its branch.' },
              { cmd: 'git commit -am "Fix crash on launch"', out: '[main e45d8b1] Fix crash on launch\n 1 file changed, 2 insertions(+), 1 deletion(-)', panel: log('* e45d8b1 (HEAD -> main) Fix crash on launch\n| * 7c10a2e (feature/search) Add search box\n|/\n* b2f41c9 Add home screen\n* a19e0d3 Initial commit'), say: 'History forks. Each branch has its own new commit, and both share <code>b2f41c9</code>. Merging joins them again.' },
            ],
          });
        },
        code: `git branch                       # list branches, * marks the current one
git switch -c feature/search     # create and switch in one step
# ...edit, add, commit...
git switch main                  # back to main: files change to main's version
git switch feature/search        # and back again
git log --oneline --graph --all  # draw every branch in the terminal
git branch -d feature/search     # delete a merged branch`,
        remember: 'A branch is a pointer, HEAD points to the branch you are on, and a commit moves only that branch.',
        deeper: [
          {
            title: 'Detached HEAD: on a commit, not a branch',
            body: `<p>You can switch to a commit instead of a branch to look at old code: <code>git switch --detach C2</code>. Now HEAD points straight at a commit. You can even commit, but no branch moves to remember it. Switch away and those commits are left behind. To keep them, create a branch while you are there with <code>git switch -c</code>.</p>`,
            visual(el) {
              const g = graph({ lanes: 2, title: 'Detached HEAD' });
              const o = out('');
              let cs, br, head, n;
              const reach = (withHead) => { const r = new Set(); [...Object.values(br), ...(withHead && !br[head] ? [head] : [])].forEach(t => { for (let c = t; c; c = (cs.find(x => x.id === c) || { p: [] }).p[0]) r.add(c); }); return r; };
              const draw = () => { const r = reach(true); g.set({ commits: cs.map(c => ({ ...c, ghost: !r.has(c.id) })), refs: Object.entries(br).map(([name, at]) => ({ name, at })), head }); };
              cs = [{ id: 'C1', p: [] }, { id: 'C2', p: ['C1'] }, { id: 'C3', p: ['C2'] }]; br = { main: 'C3' }; head = 'main'; n = 0;
              const isBranch = () => !!br[head];
              draw(); say(o, 'HEAD points at main. Detach to look at an older commit.');
              el.append(row(
                act('git switch --detach C2', () => { head = 'C2'; draw(); say(o, "HEAD is now at C2. You are in 'detached HEAD' state: HEAD points at a commit, not a branch."); }),
                act('git commit', () => {
                  if (isBranch()) { say(o, 'You are on a branch, so this would be a normal commit. Detach first to see the difference.'); return; }
                  if (n >= 2) { say(o, 'Two detached commits is enough. Switch away or save them.'); return; }
                  const id = 'X' + (++n); cs.push({ id, p: [head], lane: 1 }); head = id; draw();
                  say(o, `New commit ${id}. Only HEAD points at it. No branch remembers it.`);
                }),
                act('git switch main', () => {
                  const lost = !isBranch() && !reach().has(head) ? head : null;
                  head = 'main'; draw();
                  say(o, lost ? `<span class="bad">Warning: you are leaving ${n} commit(s) behind, not connected to any of your branches.</span>\n<span class="muted">They still exist for a while (see reflog in the last lesson), but nothing points at them.</span>` : 'Back on main.');
                }),
                act('git switch -c rescue', () => {
                  if (br.rescue) { say(o, "fatal: a branch named 'rescue' already exists"); return; }
                  br.rescue = isBranch() ? br[head] : head; head = 'rescue'; draw();
                  say(o, 'rescue now points where HEAD was, and HEAD points at rescue. Those commits are safe.');
                })), g.el, o);
            },
          },
          {
            title: 'A branch is a tiny file',
            body: `<p>Inside <code>.git</code>, a branch is a file under <code>refs/heads/</code> that contains one commit id. <code>.git/HEAD</code> usually contains the name of a branch. That is why branches cost nothing to create and delete: Git writes or removes a few bytes.</p>`,
            code: `cat .git/HEAD
# ref: refs/heads/main
cat .git/refs/heads/main
# 5b2f7d4c9e0a1f3b8d6e2c4a7f9b1d3e5c7a9b2f
git branch -v                    # each branch with its commit and message`,
          },
          {
            title: 'Naming and cleaning up',
            body: `<p>Teams usually prefix branch names by kind: <code>feature/search</code>, <code>fix/empty-feed-crash</code>. Use lowercase and dashes. Delete a branch after it is merged with <code>-d</code>; Git refuses if the branch has commits that are not merged anywhere. <code>-D</code> forces it, so use it only when you mean to throw that work away.</p>`,
            code: `git switch -c fix/empty-feed-crash
git branch --merged main          # branches already merged into main
git branch -d fix/empty-feed-crash
git branch -D experiment/old-idea # force: deletes unmerged work`,
          },
        ],
        underHood: {
          body: `<p><code>git switch</code> does three things: it points HEAD at the branch, updates the staging area to that commit's snapshot, and rewrites the files in your working tree that differ. If you have uncommitted changes that would be overwritten, Git refuses to switch rather than lose them. Commit or stash them first.</p>`,
          code: `git switch main
# error: Your local changes to the following files would be overwritten ...
#         app/src/main/res/values/strings.xml
# Please commit your changes or stash them before you switch branches.`,
        },
        mistakes: [
          { title: 'Creating a branch but not switching to it', bad: `git branch feature/search
git commit -am "Add search bar"   # lands on main`, good: `git switch -c feature/search
git commit -am "Add search bar"`, why: '<code>git branch</code> only creates the label. HEAD stays on main, so the commit moves main. <code>git switch -c</code> creates and switches.' },
          { title: 'Working directly on main', bad: `git switch main
# a week of commits for a big feature`, good: `git switch -c feature/offline-mode
# commit freely here, merge when it is ready`, why: 'Main should stay releasable. A feature branch lets you push half-done work, get review, and fix a crash on main in the meantime.' },
        ],
        terms: [
          { term: 'Branch', def: 'A movable name that points to one commit. It moves forward when you commit on it.' },
          { term: 'HEAD', def: 'Git’s pointer to where you are, normally to the current branch.' },
          { term: 'Detached HEAD', def: 'HEAD pointing straight at a commit instead of a branch. New commits there are not on any branch.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Create a branch and switch to it in one command, then list all branches.', code: 'git switch [[-c|--create]] feature/login\ngit [[branch]]', why: '<code>-c</code> creates the branch at the current commit and switches to it. <code>git branch</code> with no arguments lists branches.' },
          { type: 'bug', prompt: 'The search work was meant to go on its own branch, but the commit landed on main. Tap the line to fix.', code: 'git switch main\ngit branch feature/search\n# edit SearchBar.kt\ngit add SearchBar.kt\ngit commit -m "Add search bar"', bug: 1, fix: 'git switch -c feature/search', why: '<code>git branch</code> creates the label but leaves HEAD on main. <code>git switch -c</code> creates it and moves HEAD there.' },
        ],
        quiz: [
          { q: 'What happens to <code>main</code> when you commit while on <code>feature</code>?', options: ['main moves too', 'main stays where it was', 'main is deleted'], a: 1, why: 'Only the branch HEAD points to moves forward.' },
          { q: 'How much does creating a branch copy?', options: ['The whole project', 'Only changed files', 'Nothing, it writes one commit id'], a: 2, why: 'A branch is a small file holding a commit id. That is why branching is instant.' },
          { q: 'What does HEAD usually point to?', options: ['The newest commit in the repository', 'The branch you are on', 'The remote server'], a: 1, why: 'HEAD points to the current branch, which points to a commit. In detached HEAD it points to a commit directly.' },
          { q: 'You are on main and run <code>git branch feature</code>, then <code>git commit -m "Add search"</code>. Which branch has the new commit?', options: ['feature', 'Both', 'main'], a: 2, why: 'git branch only creates the label. HEAD stays on main, so main moves. git switch -c feature creates and switches.' },
          { q: 'In detached HEAD you make a commit, then run <code>git switch main</code>. What happens to that commit?', options: ['No branch points to it, so it is left behind unless you create a branch for it', 'It is added to main', 'Git deletes it immediately'], a: 0, why: 'A commit in detached HEAD moves no branch. Create a branch with git switch -c while you are there, or find it later in the reflog.' },
        ],
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'merging',
        title: 'Merging and conflicts',
        tagline: 'Bring a branch back: Git slides the label forward or makes a merge commit, and asks you when both sides changed the same lines.',
        level: 'beginner',
        body: `
<p>To bring work from <code>feature</code> into <code>main</code>, switch to main and run <code>git merge feature</code>. If main has not moved since feature started, Git just slides the <code>main</code> label forward. This is a <em>fast-forward</em>: no new commit is needed.</p>
<p>If both branches have new commits, Git makes a <em>merge commit</em> with two parents. It combines the changes from both sides since the commit where they split (the <em>merge base</em>). Most of the time this is automatic.</p>
<p>When both sides changed the same lines of the same file, Git cannot pick for you. It stops with a <em>conflict</em> and writes both versions into the file between markers. You edit the file to the right result, delete the markers, <code>git add</code> it, and <code>git commit</code> to finish. Step through both kinds of merge below.</p>`,
        visual(el) {
          const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const pane = (t, s) => `<p class="gtk-h">${t}</p><pre class="ui-out">${esc(s)}</pre>`;
          const log = s => pane('git log --oneline --graph --all', s);
          const file = s => pane('app/src/main/res/values/strings.xml', s);
          const path = 'app/src/main/res/values/strings.xml';
          Lab.ui.terminal(el, {
            predict: {
              q: 'Both <code>main</code> and <code>feature/title</code> changed the same line of <code>strings.xml</code>. What does <code>git merge feature/title</code> do?',
              options: ['Keeps the newer change', 'Stops with a conflict and writes both versions into the file', 'Keeps main’s version, since you are on main'],
              a: 1,
              why: 'Git combines changes line by line from the merge base. When both sides changed the same lines, it cannot choose, so it marks the spot and waits for you.',
            },
            frames: [
              { panel: log('* 9d2c4a1 (feature/search) Add search results\n* 5f1b7e3 Add search box\n* b2f41c9 (HEAD -> main) Add home screen\n* a19e0d3 Initial commit'), say: 'You are on <code>main</code>. It has not moved since <code>feature/search</code> started.' },
              { cmd: 'git merge feature/search', out: 'Updating b2f41c9..9d2c4a1\nFast-forward\n .../example/news/SearchBar.kt | 40 ++++++++++++++++++++\n 1 file changed, 40 insertions(+)', panel: log('* 9d2c4a1 (HEAD -> main, feature/search) Add search results\n* 5f1b7e3 Add search box\n* b2f41c9 Add home screen\n* a19e0d3 Initial commit'), say: 'Fast-forward: Git slides the <code>main</code> label up to the feature’s tip. No new commit.' },
              { clear: true, panel: log('* e45d8b1 (HEAD -> main) Rename app\n| * 7c10a2e (feature/title) Change title text\n|/\n* b2f41c9 Add home screen'), say: 'A new case. Both branches have a commit since they split at <code>b2f41c9</code>, and both edited the app name.' },
              { cmd: 'git merge feature/title', out: `Auto-merging ${path}\nCONFLICT (content): Merge conflict in ${path}\nAutomatic merge failed; fix conflicts and then commit the result.`, panel: file('<<<<<<< HEAD\n<string name="app_name">Daily News</string>\n=======\n<string name="app_name">News Today</string>\n>>>>>>> feature/title'), say: 'Git merged what it could and stopped. Your side is above <code>=======</code>, theirs below.' },
              { cmd: 'git status', out: `On branch main\nYou have unmerged paths.\n\nUnmerged paths:\n\tboth modified:   ${path}`, say: '<code>git status</code> lists every file that still needs you.' },
              { panel: file('<string name="app_name">News Today</string>'), say: 'Edit the file to the result you want and delete all three marker lines.' },
              { cmd: `git add ${path}`, out: '', say: '<code>git add</code> marks the conflict as resolved.' },
              { cmd: 'git commit --no-edit', out: "[main 3a7f0c2] Merge branch 'feature/title'", panel: log("*   3a7f0c2 (HEAD -> main) Merge branch 'feature/title'\n|\\\n| * 7c10a2e (feature/title) Change title text\n* | e45d8b1 Rename app\n|/\n* b2f41c9 Add home screen"), say: 'The merge commit has two parents and joins both lines of history.' },
            ],
          });
        },
        code: `git switch main
git pull                         # get the latest main first (lesson 7)
git merge feature/search

# when there is a conflict:
# CONFLICT (content): Merge conflict in app/src/main/res/values/strings.xml
# Automatic merge failed; fix conflicts and then commit the result.
git status                       # lists "both modified" files
# edit the file, delete <<<<<<< ======= >>>>>>> markers
git add app/src/main/res/values/strings.xml
git commit                       # finishes the merge

git merge --abort                # or: give up and go back to before the merge`,
        remember: 'Merge into the branch you are on. On conflict: edit, delete markers, git add, git commit.',
        deeper: [
          {
            title: 'Resolve a conflict by hand',
            body: `<p>Both branches renamed the app in <code>strings.xml</code>. Between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code> is your side (the branch you are on). Between <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> is the incoming side. Decide the result, then mark it resolved.</p>`,
            visual(el) {
              const ours = '    <string name="app_name">News App</string>', theirs = '    <string name="app_name">Daily News</string>';
              const box = h('div', { class: 'gt-cf', 'aria-label': 'strings.xml' });
              const o = out('');
              let body = null, added = false;
              const L = (t, c = '') => h('div', { class: `gt-cl ${c}` }, t);
              function draw() {
                const mid = body || [L('<<<<<<< HEAD', 'gt-mark'), L(ours, 'gt-ours'), L('=======', 'gt-mark'), L(theirs, 'gt-theirs'), L('>>>>>>> feature/rename', 'gt-mark')];
                box.replaceChildren(L('<resources>'), ...mid, L('</resources>'));
                replay(box, 'pop-soft');
              }
              const pick = (lines, note) => () => { body = lines.map(([t, c]) => L(t, c)); added = false; draw(); say(o, note); };
              draw(); say(o, 'CONFLICT (content): Merge conflict in strings.xml. Pick a result.');
              el.append(
                row(act('keep HEAD', pick([[ours, 'gt-ours']], 'Kept your side. Markers are gone.')),
                  act('keep feature', pick([[theirs, 'gt-theirs']], 'Kept the incoming side. Markers are gone.')),
                  act('keep both', pick([[ours, 'gt-ours'], [theirs, 'gt-theirs']], '<span class="bad">Two strings named app_name: the Android build fails with a duplicate resource error.</span> Keeping both is right for lists, not here.'))),
                row(act('git add strings.xml', () => {
                  added = true;
                  say(o, body ? 'strings.xml marked as resolved.' : '<span class="bad">Git accepted it, markers and all.</span> git add does not check the content. Always remove the markers first.');
                }), act('git commit', () => {
                  if (!added) { say(o, '<span class="bad">error: Committing is not possible because you have unmerged files.</span>\n<span class="muted">git add the file to mark it resolved.</span>'); return; }
                  say(o, body ? '<span class="good">Merge commit created.</span> The conflict is resolved.' : '<span class="bad">Committed with conflict markers in strings.xml.</span> The next build will fail.');
                })), box, o);
            },
          },
          {
            title: 'Keep a merge commit with --no-ff',
            body: `<p>Some teams want every feature to show up as a merge commit, even when a fast-forward was possible, so the branch stays visible in history. <code>git merge --no-ff</code> always creates one. <code>--ff-only</code> does the opposite: merge only if it can fast-forward, otherwise stop.</p>`,
            code: `git merge --no-ff feature/search     # always a merge commit
git merge --ff-only origin/main      # only slide forward, never create a merge
git log --oneline --graph`,
          },
          {
            title: 'Fewer conflicts',
            body: `<p>Conflicts grow with time apart. Keep branches short, merge or rebase the latest main into your branch often, and avoid reformatting whole files in the same branch as a feature. A conflict is not an error, it is Git asking a question only you can answer.</p>`,
          },
        ],
        underHood: {
          body: `<p>A three-way merge compares three snapshots: the merge base, your side and their side. For each piece of a file: if only one side changed it, take that change; if both made the same change, take it once; if both changed it differently, it is a conflict. Since Git 2.34 the default strategy is called <code>ort</code>, which is why you see "Merge made by the 'ort' strategy."</p>`,
          code: `git merge-base main feature/search   # the commit where they split
git diff $(git merge-base main feature/search) feature/search   # what feature changed`,
        },
        mistakes: [
          { title: 'Merging in the wrong direction', bad: `git switch feature/search
git merge main          # brings main into feature`, good: `git switch main
git merge feature/search`, why: 'Merge changes the branch you are on. To land a feature on main, be on main. (Merging main into your feature to stay up to date is fine, but it is a different thing.)' },
          { title: 'Committing conflict markers', bad: `git add .
git commit -m "Merge"    # file still has <<<<<<< HEAD`, good: `git diff --check        # warns about leftover markers
git add strings.xml
git commit`, why: '<code>git add</code> marks a file resolved without looking inside. Search for <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> or run <code>git diff --check</code> before you commit.' },
        ],
        terms: [
          { term: 'Fast-forward', def: 'A merge where the branch label just moves ahead, because the other branch already contains it.' },
          { term: 'Merge commit', def: 'A commit with two parents that joins two lines of history.' },
          { term: 'Merge conflict', def: 'Both sides changed the same lines differently. Git stops and asks you to choose.' },
          { term: 'Merge base', def: 'The most recent commit two branches have in common.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Land <code>feature/login</code> on main.', code: 'git switch [[main]]\ngit [[merge]] feature/login', why: 'Merge pulls the named branch into the branch you are on, so switch to main first.' },
          { type: 'bug', prompt: 'You fixed the conflict in strings.xml, but this sequence goes wrong. Tap the line.', code: 'git merge feature/rename\n# CONFLICT in strings.xml: edit it and delete the markers\ngit rm strings.xml\ngit commit', bug: 2, fix: 'git add strings.xml', why: '<code>git add</code> marks the resolved file. <code>git rm</code> would delete the file from the project.' },
        ],
        quiz: [
          { q: 'When does <code>git merge</code> fast-forward?', options: ['When there are no conflicts', 'When the current branch has no commits the other branch lacks', 'Always'], a: 1, why: 'If your branch is fully contained in the other one, Git can just move the label ahead.' },
          { q: 'How many parents does a merge commit have?', options: ['One', 'Two (or more)', 'None'], a: 1, why: 'It joins two lines of history, so it points back to both.' },
          { q: 'In a conflict, what sits between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code>?', options: ['The incoming branch', 'Your current branch', 'The merge base'], a: 1, why: 'HEAD is the branch you are on. The incoming side is after <code>=======</code>.' },
          { q: 'main and feature both have new commits. What does <code>git merge --ff-only feature</code> do?', options: ['Creates a merge commit', 'Rebases feature onto main', 'Stops without merging'], a: 2, why: '--ff-only only slides the branch forward. When the histories have split, a fast-forward is impossible, so Git refuses.' },
          { q: 'A merge stopped with a conflict in strings.xml. Which order finishes it?', options: ['git commit → git add → edit the file', 'git add → edit the file → git commit', 'Edit the file and remove the markers → git add → git commit'], a: 2, why: 'git add marks the file as resolved without looking inside, so fix it first. git commit then creates the merge commit.' },
        ],
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'rebase',
        title: 'Rebase vs merge',
        tagline: 'Rebase replays your commits on top of another branch: a straight line, but brand new commits.',
        level: 'intermediate',
        body: `
<p>Your feature branch started at B, and main has moved on to C. You can bring main's work in two ways. <code>git merge main</code> adds a merge commit that joins both lines. <code>git rebase main</code> takes your commits D and E, and replays them one by one on top of C, as if you had started there.</p>
<p>The result of a rebase is a straight history, but the replayed commits are <em>new commits</em> (D′, E′) with new ids. The old D and E are left behind. That is fine for commits only you have. It is a problem for commits others already pulled: their copies still point at the old ones.</p>
<p>The golden rule: <strong>do not rebase commits that exist outside your repository and that people may have based work on.</strong> Rebase your own feature branch to tidy it up; never rebase main. The demo below does both, on the same branch.</p>`,
        visual(el) {
          const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const log = s => `<p class="gtk-h">git log --oneline --graph --all</p><pre class="ui-out">${esc(s)}</pre>`;
          const start = log('* c81f2d0 (main) Fix crash on launch\n| * 4e9a1b7 (HEAD -> feature/search) Add search results\n| * 2d6c3f8 Add search box\n|/\n* b2f41c9 Add home screen');
          Lab.ui.terminal(el, {
            predict: {
              q: 'You run <code>git merge main</code> on <code>feature/search</code>. How many new commits does that make?',
              options: ['None: it only moves a label', 'One merge commit, with two parents', 'Two: one per feature commit'],
              a: 1,
              why: 'Both lines have commits the other lacks, so a fast-forward is impossible. Git records the join as one merge commit.',
            },
            frames: [
              { panel: start, say: 'Your branch started at <code>b2f41c9</code>. Since then <code>main</code> got a crash fix. Bring it in, first with a merge.' },
              { cmd: 'git merge main --no-edit', out: "Merge made by the 'ort' strategy.\n .../example/news/MainActivity.kt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)", panel: log("*   f3e8d21 (HEAD -> feature/search) Merge branch 'main' into feature/search\n|\\\n| * c81f2d0 (main) Fix crash on launch\n* | 4e9a1b7 Add search results\n* | 2d6c3f8 Add search box\n|/\n* b2f41c9 Add home screen"), say: 'A merge commit joins both lines. Nothing is rewritten, so it is always safe.' },
              { cmd: 'git reset --hard ORIG_HEAD', out: 'HEAD is now at 4e9a1b7 Add search results', panel: start, say: 'Undo that merge (it was never pushed) and try the other way.' },
              { cmd: 'git rebase main', out: 'Successfully rebased and updated refs/heads/feature/search.', panel: log('* 9b0e5a4 (HEAD -> feature/search) Add search results\n* 6a3d7c1 Add search box\n* c81f2d0 (main) Fix crash on launch\n* b2f41c9 Add home screen'), say: 'Rebase replays your two commits on top of <code>c81f2d0</code>. A straight line, but look at the ids: these are new commits.' },
              { cmd: 'git push', out: "To github.com:sam/news-app.git\n ! [rejected]        feature/search -> feature/search (non-fast-forward)\nerror: failed to push some refs to 'github.com:sam/news-app.git'", say: 'You had pushed the old <code>4e9a1b7</code> before. GitHub’s branch is not an ancestor of the new one, so a plain push is refused.' },
              { cmd: 'git push --force-with-lease', out: 'To github.com:sam/news-app.git\n + 4e9a1b7...9b0e5a4 feature/search -> feature/search (forced update)', say: 'Fine for your own feature branch. On a branch others build on, like <code>main</code>, this would pull the ground from under them.' },
            ],
          });
        },
        code: `# bring the latest main into your own feature branch
git switch feature/search
git fetch origin
git rebase origin/main            # replay your commits on top
# on conflict: fix the file, then
git add SearchBar.kt
git rebase --continue             # or: git rebase --abort

# you had already pushed this branch, so its history changed:
git push --force-with-lease`,
        remember: 'Rebase only commits nobody else has. Never rebase main or any branch others build on.',
        deeper: [
          {
            title: 'Interactive rebase: clean up before review',
            body: `<p><code>git rebase -i HEAD~4</code> opens a list of your last 4 commits, oldest first. Change the word in front of each line: <code>pick</code> keeps it, <code>reword</code> changes the message, <code>squash</code> melds it into the one above and combines messages, <code>fixup</code> melds it and drops its message, <code>drop</code> removes it. Tap the words below, then run it.</p>`,
            visual(el) {
              const VERBS = ['pick', 'reword', 'squash', 'fixup', 'drop'];
              const C = [['1a2f3c4', 'Add news list screen'], ['3b4e5d6', 'wip'], ['5c6a7b8', 'fix typo'], ['7d8c9e0', 'Add pull to refresh']];
              const v = C.map(() => 'pick');
              const todo = h('div', { class: 'gt-todo', 'aria-label': 'Rebase todo list' });
              const o = out('');
              function draw() {
                todo.replaceChildren(...C.map(([id, m], i) => h('div', { class: 'gt-todo-r' },
                  h('button', { class: `gt-verb gt-v-${v[i]}`, 'aria-label': `Change action for ${m}`, onclick() { v[i] = VERBS[(VERBS.indexOf(v[i]) + 1) % VERBS.length]; draw(); } }, v[i]),
                  h('span', {}, `${id} ${m}`))));
              }
              function runIt() {
                const res = [];
                for (let i = 0; i < C.length; i++) {
                  const [, m] = C[i], verb = v[i];
                  if (verb === 'drop') continue;
                  if (verb === 'squash' || verb === 'fixup') {
                    if (!res.length) { say(o, `<span class="bad">error: cannot '${verb}' without a previous commit</span>`); return; }
                    if (verb === 'squash') res[res.length - 1].msg += ` + ${m}`;
                    res[res.length - 1].n++;
                    continue;
                  }
                  res.push({ msg: verb === 'reword' ? `${m} (new message)` : m, n: 1 });
                }
                if (!res.length) { say(o, 'Every commit dropped: the branch would be back at its base.'); return; }
                const ids = ['e1f2a3b', '9c8d7e6', '4b5a6c7', '0f1e2d3'];
                say(o, 'Successfully rebased.\n<span class="muted">git log --oneline</span>\n' + res.slice().reverse().map((r, i) => `${ids[i]} ${esc(r.msg)}${r.n > 1 ? ` <span class="muted">(${r.n} commits)</span>` : ''}`).join('\n') +
                  `\n<span class="muted">${C.length} commits became ${res.length}. All of them have new ids.</span>`);
              }
              draw(); say(o, 'Tip: fixup "wip" and "fix typo" into the commit above them.');
              el.append(todo, row(act('run rebase', runIt), act('reset list', () => { v.fill('pick'); draw(); say(o, 'All back to pick.'); })), o);
            },
          },
          {
            title: '--force-with-lease, not --force',
            body: `<p>After rebasing a branch you already pushed, a normal push is rejected, because the remote has the old commits. <code>--force</code> overwrites the remote branch no matter what. <code>--force-with-lease</code> overwrites it only if it still points where you last saw it, so you do not wipe out a commit a teammate pushed in the meantime.</p>`,
            code: `git push --force-with-lease origin feature/search`,
          },
          {
            title: 'git pull --rebase',
            body: `<p>If you made local commits on a branch and a teammate pushed to it too, a plain <code>git pull</code> makes a merge commit. <code>git pull --rebase</code> replays your unpushed commits on top instead, which keeps the history straight. Your unpushed commits are only yours, so this follows the golden rule.</p>`,
            code: `git pull --rebase
git config --global pull.rebase true   # make it the default`,
          },
        ],
        underHood: {
          body: `<p>A rebase saves your commits as patches, resets the branch to the new base, and applies each patch, creating a new commit every time. A commit's id depends on its parent, so a new parent means a new id, even if the change is identical. The old commits are not deleted right away: the reflog still remembers them.</p>`,
          code: `git reflog
# e7f8a9b HEAD@{0}: rebase (finish): returning to refs/heads/feature/search
# 1a2b3c4 HEAD@{3}: commit: Add search bar   <- the old commit, before the rebase`,
        },
        mistakes: [
          { title: 'Rebasing a shared branch', bad: `git switch main
git rebase feature/search
git push --force`, good: `git switch main
git merge feature/search
git push`, why: 'Everyone else’s main still has the old commits. After your force push, their next pull mixes old and new copies of the same changes.' },
          { title: 'Plain --force after a rebase', bad: `git push --force`, good: `git push --force-with-lease`, why: 'If a teammate pushed to the branch since your last fetch, <code>--force</code> silently deletes their commit from the remote. <code>--force-with-lease</code> refuses instead.' },
        ],
        terms: [
          { term: 'Rebase', def: 'Replaying your commits on top of another commit, creating new commits with new ids.' },
          { term: 'Interactive rebase', def: 'git rebase -i: edit a list of commits to reorder, reword, squash or drop them.' },
          { term: 'Squash', def: 'Combine a commit into the one before it.' },
          { term: 'Force-with-lease', def: 'A force push that only succeeds if the remote branch has not changed since you last fetched.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Replay your branch on the latest main, then clean up your last 3 commits.', code: 'git [[rebase]] origin/main\ngit rebase [[-i|--interactive]] HEAD~3', why: '<code>rebase</code> moves your commits onto a new base. <code>-i</code> opens the todo list to edit them.' },
          { type: 'bug', prompt: 'You rebased your already-pushed feature branch. Tap the line that could delete a teammate’s work.', code: 'git switch feature/search\ngit rebase -i HEAD~3\ngit push --force', bug: 2, fix: 'git push --force-with-lease', why: '<code>--force</code> overwrites whatever is on the remote. <code>--force-with-lease</code> checks that nobody pushed in the meantime.' },
        ],
        quiz: [
          { q: 'After <code>git rebase main</code>, what happens to your commits’ ids?', options: ['They stay the same', 'They change: the commits are recreated', 'Only the last one changes'], a: 1, why: 'Each commit gets a new parent, so it is a new commit with a new id.' },
          { q: 'Which is safe?', options: ['Rebasing main after others pulled it', 'Rebasing your own unpushed feature commits', 'Rebasing a teammate’s branch you both push to'], a: 1, why: 'Nobody else has those commits, so rewriting them hurts no one.' },
          { q: 'In <code>git rebase -i</code>, what does <code>fixup</code> do?', options: ['Fixes merge conflicts', 'Melds the commit into the one above and drops its message', 'Deletes the commit'], a: 1, why: 'fixup is like squash without keeping the message. drop deletes.' },
          { q: 'In the list that <code>git rebase -i HEAD~4</code> opens, in what order are the commits shown?', options: ['Newest first, like git log', 'Oldest first', 'In alphabetical order of their messages'], a: 1, why: 'The list is the order in which the commits will be replayed, so it starts with the oldest. That is the reverse of git log.' },
          { q: 'You rebased your feature branch, which you had already pushed. The push is rejected. What do you run?', options: ['<code>git push --force-with-lease</code>', '<code>git push --force</code>', '<code>git pull</code>, then push'], a: 0, why: '--force-with-lease overwrites only if the remote still points where you last saw it. git pull would merge the old copies of your commits back in.' },
          { q: 'You have two unpushed commits, and a teammate pushed to the same branch. What does <code>git pull --rebase</code> do?', options: ['Makes a merge commit joining both', 'Replays your two commits on top of the teammate’s', 'Throws away your two commits'], a: 1, why: 'Your unpushed commits are only yours, so rewriting them is safe and keeps the history straight.' },
        ],
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'remotes',
        title: 'Remotes and GitHub',
        tagline: 'Your laptop and GitHub each hold a full copy. fetch, pull and push move commits between them.',
        level: 'beginner',
        body: `
<p>A <em>remote</em> is another copy of the repository, usually on GitHub. <code>git clone</code> downloads a full copy, history included, and names the source <code>origin</code>. Git also keeps <em>remote-tracking branches</em> like <code>origin/main</code>: your last known position of main on GitHub. They only update when you talk to the server.</p>
<p><code>git fetch</code> downloads new commits and moves <code>origin/main</code>, but leaves your own <code>main</code> and your files alone. <code>git pull</code> is fetch plus merge into your current branch. <code>git push</code> uploads your commits and moves the branch on GitHub.</p>
<p>A push is rejected if GitHub has commits you do not have yet, so Git never overwrites a teammate's work silently. Pull first, then push. Below, a teammate pushes first, then you try to push your own commit.</p>`,
        visual(el) {
          const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const two = (gh, me) => `<p class="gtk-h">GitHub (origin)</p><pre class="ui-out">${esc(gh)}</pre><p class="gtk-h">Your laptop</p><pre class="ui-out">${esc(me)}</pre>`;
          const GH1 = '* b2f41c9 (main) Add home screen', GH2 = '* 7d3e9f0 (main) Add dark theme\n* b2f41c9 Add home screen';
          const R = 'github.com:sam/news-app';
          Lab.ui.terminal(el, {
            panelTitle: 'Two copies of the repository',
            predict: {
              q: 'A teammate pushes a new commit to GitHub. Before you run any command, where does <code>origin/main</code> on your laptop point?',
              options: ['Still at the old commit', 'At the teammate’s new commit', 'Nowhere: it is removed until you fetch'],
              a: 0,
              why: '<code>origin/main</code> is your last known position of GitHub’s main. Git only updates it when it talks to the server, with fetch, pull or push.',
            },
            frames: [
              { panel: two(GH1, '* b2f41c9 (HEAD -> main, origin/main) Add home screen'), say: 'You cloned the repository. Both copies have the same commits, and <code>origin/main</code> marks where GitHub’s main was.' },
              { panel: two(GH2, '* b2f41c9 (HEAD -> main, origin/main) Add home screen'), say: 'A teammate pushes <code>7d3e9f0</code>. Only GitHub has it.' },
              { cmd: 'git status', out: "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean", say: '“Up to date” compares with your last known <code>origin/main</code>, not with GitHub right now.' },
              { cmd: 'git commit -am "Fix typo in title"', out: '[main 1c4b8a2] Fix typo in title\n 1 file changed, 1 insertion(+), 1 deletion(-)', panel: two(GH2, '* 1c4b8a2 (HEAD -> main) Fix typo in title\n* b2f41c9 (origin/main) Add home screen'), say: 'You commit locally. Now both copies have a commit the other lacks.' },
              { cmd: 'git push', out: `To ${R}.git\n ! [rejected]        main -> main (fetch first)\nerror: failed to push some refs to '${R}.git'`, say: 'Rejected. GitHub has work you do not have, and Git never overwrites it silently.' },
              { cmd: 'git fetch', out: `From ${R}\n   b2f41c9..7d3e9f0  main       -> origin/main`, panel: two(GH2, '* 1c4b8a2 (HEAD -> main) Fix typo in title\n| * 7d3e9f0 (origin/main) Add dark theme\n|/\n* b2f41c9 Add home screen'), say: '<code>fetch</code> downloads the commit and moves <code>origin/main</code>. Your <code>main</code> and your files are untouched.' },
              { cmd: 'git pull --no-rebase', out: "Merge made by the 'ort' strategy.\n app/src/main/res/values/themes.xml | 12 ++++++++++++\n 1 file changed, 12 insertions(+)", panel: two(GH2, "*   5e2a9c3 (HEAD -> main) Merge branch 'main' of " + R + "\n|\\\n| * 7d3e9f0 (origin/main) Add dark theme\n* | 1c4b8a2 Fix typo in title\n|/\n* b2f41c9 Add home screen"), say: '<code>pull</code> is fetch plus merge. <code>--no-rebase</code> picks merge. Set <code>pull.rebase</code> once in your config and plain <code>git pull</code> works.' },
              { cmd: 'git push', out: `To ${R}.git\n   7d3e9f0..5e2a9c3  main -> main`, panel: two("*   5e2a9c3 (main) Merge branch 'main' of " + R + "\n|\\\n| * 7d3e9f0 Add dark theme\n* | 1c4b8a2 Fix typo in title\n|/\n* b2f41c9 Add home screen", "*   5e2a9c3 (HEAD -> main, origin/main) Merge branch 'main' of " + R + "\n|\\\n| * 7d3e9f0 Add dark theme\n* | 1c4b8a2 Fix typo in title\n|/\n* b2f41c9 Add home screen"), say: 'Now GitHub already has everything below your commit, so the push is accepted and both copies match.' },
            ],
          });
        },
        code: `git clone git@github.com:sam/news-app.git   # SSH
git clone https://github.com/sam/news-app.git   # or HTTPS
cd news-app
git remote -v                     # origin  git@github.com:sam/news-app.git

git fetch                         # download, update origin/*, touch nothing else
git status                        # Your branch is behind 'origin/main' by 2 commits
git pull                          # fetch + merge into the current branch
git push                          # upload main to origin

git switch -c feature/search
git push -u origin feature/search # first push of a new branch, sets upstream`,
        remember: 'fetch looks, pull brings in, push sends out. Pull before you push.',
        deeper: [
          {
            title: 'Tracking branches and ahead/behind',
            body: `<p>A local branch can <em>track</em> a remote branch, its <em>upstream</em>. Then plain <code>git pull</code> and <code>git push</code> know where to go, and <code>git status</code> tells you how far apart you are. Cloning sets this up for main. For a new branch, <code>git push -u</code> sets it on the first push. The counts are only as fresh as your last fetch.</p>`,
            code: `git status
# On branch main
# Your branch and 'origin/main' have diverged,
# and have 1 and 2 different commits each, respectively.

git branch -vv                    # every branch with its upstream and ahead/behind
git fetch --all && git branch -vv # refresh first`,
          },
          {
            title: 'SSH keys or HTTPS tokens',
            body: `<p>GitHub needs to know it is you. Over <strong>HTTPS</strong>, Git asks for a username and password, but password sign-in for Git was removed: you enter a <em>personal access token</em> instead, and a credential helper remembers it. Over <strong>SSH</strong>, you create a key pair once, add the public key to your GitHub account, and Git uses it silently. GitHub's docs suggest an Ed25519 key.</p>`,
            code: `ssh-keygen -t ed25519 -C "sam@example.com"
# add ~/.ssh/id_ed25519.pub in GitHub: Settings > SSH and GPG keys
ssh -T git@github.com             # test the connection
git remote set-url origin git@github.com:sam/news-app.git   # switch an HTTPS clone to SSH`,
          },
          {
            title: 'Push a new project to GitHub',
            body: `<p>Create an empty repository on GitHub (no README, so histories do not clash), then connect your local repository to it and push. <code>origin</code> is only a convention; you can name remotes anything.</p>`,
            code: `git remote add origin git@github.com:sam/news-app.git
git branch -M main                # make sure the branch is called main
git push -u origin main`,
          },
        ],
        underHood: {
          body: `<p><code>origin/main</code> is a ref stored in <code>.git/refs/remotes/origin/main</code> (or in <code>packed-refs</code>). You cannot commit on it; only fetch and push move it. <code>git pull</code> runs <code>git fetch</code> and then merges (or rebases, if configured) the upstream into your branch. When you push, the server accepts the update only if its current commit is an ancestor of yours, a fast-forward.</p>`,
          code: `git fetch origin
git log --oneline main..origin/main   # commits on GitHub you do not have
git log --oneline origin/main..main   # your commits GitHub does not have
git merge origin/main                 # what pull would do next`,
        },
        mistakes: [
          { title: 'Force-pushing over a rejection', bad: `git push
# ! [rejected] main -> main (fetch first)
git push --force`, good: `git pull
git push`, why: 'The rejection means a teammate pushed. <code>--force</code> deletes their commits from GitHub. Pull to combine the work, then push.' },
          { title: 'Thinking fetch updates your files', bad: `git fetch
# why are my files the same?`, good: `git fetch
git status          # see how far behind you are
git merge origin/main   # or: git pull`, why: 'fetch only downloads and moves <code>origin/*</code>. Your branch and files change when you merge or pull.' },
        ],
        terms: [
          { term: 'Remote', def: 'Another copy of the repository, usually on a server like GitHub. The default name is origin.' },
          { term: 'Remote-tracking branch', def: 'A read-only ref like origin/main: where a branch was on the remote at your last fetch.' },
          { term: 'Upstream', def: 'The remote branch a local branch tracks, used by plain git pull and git push.' },
          { term: 'Personal access token', def: 'A generated secret you use instead of a password when Git talks to GitHub over HTTPS.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Download a repository, and later push a new branch for the first time.', code: 'git [[clone]] git@github.com:sam/news-app.git\ngit push [[-u|--set-upstream]] origin feature/search', why: '<code>clone</code> copies the repository and sets up origin. <code>-u</code> remembers origin/feature/search as the upstream.' },
          { type: 'bug', prompt: 'Your push was rejected. Tap the line that loses your teammate’s work.', code: 'git switch main\ngit commit -am "Fix crash on empty feed"\ngit push origin main\n# ! [rejected] main -> main (fetch first)\ngit push --force origin main', bug: 4, fix: 'git pull --rebase origin main', why: 'The remote has a commit you do not. Pull it in (merge or rebase), then push again. Force pushing deletes it.' },
        ],
        quiz: [
          { q: 'What does <code>git fetch</code> change?', options: ['Your files and your main', 'Only remote-tracking branches like origin/main', 'Nothing at all'], a: 1, why: 'It downloads commits and moves origin/*. Your branches and files stay as they are.' },
          { q: 'Your push is rejected with "fetch first". Why?', options: ['Your SSH key expired', 'The remote has commits you do not have', 'The branch is protected'], a: 1, why: 'Git refuses to overwrite remote commits. Pull, then push.' },
          { q: '<code>git pull</code> is the same as…', options: ['git fetch followed by a merge (or rebase)', 'git push in reverse', 'git clone again'], a: 0, why: 'pull = fetch + integrate the upstream into your current branch.' },
          { q: '<code>git status</code> says your branch is up to date with origin/main, but a teammate pushed five minutes ago. Why?', options: ['The teammate’s push failed', 'status only compares local branches', 'status compares with origin/main as of your last fetch'], a: 2, why: 'origin/main only moves when you talk to the server. Run git fetch, and status will show you are behind.' },
          { q: 'Pushing over HTTPS, Git asks for a password. What do you enter?', options: ['Your GitHub account password', 'A personal access token', 'Your SSH key passphrase'], a: 1, why: 'GitHub removed password sign-in for Git operations. A token takes its place, and a credential helper can remember it.' },
        ],
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'pull-requests',
        title: 'Pull requests and code review',
        tagline: 'Push a branch, open a pull request, let CI and a teammate check it, then merge.',
        level: 'intermediate',
        body: `
<p>On a team, nobody pushes straight to <code>main</code>. You work on a branch, push it, and open a <em>pull request</em> (PR) on GitHub: a page that asks to merge your branch into main. It shows the diff, a description, and a place for discussion.</p>
<p>Two checks guard the merge. <em>CI</em> (for example GitHub Actions) builds the app and runs tests on every push, and reports status checks on the PR. A <em>reviewer</em> reads the diff and leaves a comment, approves, or requests changes. Repositories can require both before the merge button works. To address feedback, push more commits to the same branch; the PR updates itself.</p>
<p>Keep PRs small: one fix or one feature slice. A 200-line PR gets a careful review; a 2,000-line PR gets a skim. Walk a PR through the flow below. The first CI run has a failing test.</p>`,
        predict: {
          q: 'The CI check on your PR fails. You fix the code and push a new commit to the same branch. What happens to the PR?',
          options: ['You have to open a new PR', 'It picks up the commit and the checks run again', 'Nothing until a reviewer reruns it'],
          a: 1,
          why: 'A PR shows a branch, not a fixed set of commits. Every push to that branch updates it and triggers the checks.',
        },
        visual(el) {
          const STEPS = ['branch', 'push', 'PR open', 'checks', 'review', 'merged'];
          const pipe = h('div', { class: 'gt-pipe' });
          const card = h('div', { class: 'gt-pr' });
          const o = out('');
          let s;
          function reset() { s = { pushed: false, open: false, broken: true, checks: null, review: null, merged: false, running: false, commits: 2, deleted: false }; draw(); say(o, 'You have 2 commits on feature/date-format. Push the branch.'); }
          const checksOk = () => s.checks && s.checks.every(c => c[1] === 'pass');
          function draw() {
            const at = s.merged ? 5 : !s.pushed ? 1 : !s.open ? 2 : !checksOk() ? 3 : s.review !== 'approve' ? 4 : 5;
            const stop = s.checks && s.checks.some(c => c[1] === 'fail') ? 3 : s.review === 'changes' ? 4 : -1;
            pipe.replaceChildren(...STEPS.map((t, i) => h('span', { class: `gt-stp ${i < at || (s.merged && i === 5) ? 'gt-done' : i === stop ? 'gt-stop' : i === at ? 'gt-now' : ''}` }, t)));
            if (!s.open) { card.replaceChildren(h('div', { class: 'gt-pr-m' }, s.pushed ? 'Branch is on GitHub. No pull request yet.' : 'Nothing on GitHub yet.')); card.classList.remove('gt-merged'); return; }
            card.classList.toggle('gt-merged', s.merged);
            const canMerge = checksOk() && s.review === 'approve' && !s.merged;
            card.replaceChildren(
              h('div', { class: 'gt-pr-t' }, 'Show relative news dates #42'),
              h('div', { class: 'gt-pr-m' }, `sam wants to merge ${s.commits} commits into main from feature/date-format`),
              ...(s.checks || []).map(([n, st]) => h('div', { class: 'gt-chk' }, h('span', { class: `gt-dot gt-${st}` }), `${n} `, h('span', { class: 'gt-tag' }, st === 'run' ? 'in progress' : st === 'pass' ? 'passed' : st === 'fail' ? 'failed' : 'queued'))),
              h('span', { class: `gt-badge ${s.review === 'approve' ? 'gt-b-ok' : s.review === 'changes' ? 'gt-b-err' : 'gt-b-warn'}` }, s.review === 'approve' ? 'Approved by Maya' : s.review === 'changes' ? 'Maya requested changes' : 'Review required'),
              h('span', { class: `gt-badge ${s.merged ? 'gt-b-ok' : canMerge ? 'gt-b-ok' : ''}` }, s.merged ? (s.deleted ? 'Merged. Branch deleted.' : 'Merged') : canMerge ? 'Ready to merge' : 'Merging is blocked'));
          }
          async function ci() {
            s.running = true;
            const run = s.checks = [['build', 'idle'], ['unit tests', 'idle'], ['lint', 'idle']]; draw();
            for (let i = 0; i < 3; i++) {
              s.checks[i][1] = 'run'; draw();
              await sleep(550); if (!el.isConnected || s.checks !== run) return; // reset or a new run took over
              s.checks[i][1] = i === 1 && s.broken ? 'fail' : 'pass'; draw();
            }
            s.running = false;
            say(o, s.broken ? '<span class="bad">unit tests failed:</span> DateFormatterTest > formatsTodayRelative expected "Today 14:05" but was "Oct 18, 14:05".\n<span class="muted">Fix it on the branch and push again.</span>' : '<span class="good">All checks passed.</span>');
          }
          function push() {
            if (s.merged) { say(o, 'The PR is merged. Start a new branch for new work.'); return; }
            if (!s.pushed) { s.pushed = true; draw(); say(o, "To github.com:sam/news-app.git\n * [new branch]      feature/date-format -> feature/date-format\n<span class=\"muted\">Branch is on GitHub. Now open a pull request.</span>"); return; }
            if (s.running) { say(o, 'Wait for the current checks to finish.'); return; }
            s.commits++; const wasBroken = s.broken; s.broken = false;
            say(o, wasBroken ? 'Pushed a fix commit. The PR updates and CI runs again…' : 'Pushed another commit. CI runs again…');
            if (s.review === 'changes') s.review = null;
            if (s.open) ci(); else draw();
          }
          function open() {
            if (!s.pushed) { say(o, 'Push the branch first. A PR compares two branches on GitHub.'); return; }
            if (s.open) { say(o, 'The PR is already open.'); return; }
            s.open = true; say(o, 'PR #42 opened. CI starts on its own…'); ci();
          }
          function review(kind) {
            if (!s.open || s.merged) { say(o, 'Nothing to review yet.'); return; }
            s.review = kind; draw();
            say(o, kind === 'approve' ? 'Maya approved: "Looks good. Nice test."' : 'Maya requested changes: "Please use the device locale instead of hard-coding en-US." Push a commit to address it.');
          }
          function merge() {
            if (!s.open) { say(o, 'There is no pull request to merge.'); return; }
            if (s.merged) { if (!s.deleted) { s.deleted = true; draw(); say(o, 'Branch feature/date-format deleted. The PR and its commits stay in history.'); } return; }
            if (s.running || !checksOk()) { say(o, '<span class="bad">Merging is blocked:</span> required status checks have not passed.'); return; }
            if (s.review !== 'approve') { say(o, '<span class="bad">Merging is blocked:</span> at least 1 approving review is required.'); return; }
            s.merged = true; draw(); say(o, '<span class="good">Pull request #42 merged into main.</span> Press merge again to delete the branch.');
          }
          reset();
          el.append(
            row(act('git push', push), act('open pull request', open), act('merge', merge)),
            row(lab('reviewer'), act('request changes', () => review('changes')), act('approve', () => review('approve')), act('reset', reset)),
            pipe, card, o);
        },
        code: `git switch main && git pull
git switch -c feature/date-format
# ...small, focused commits...
git push -u origin feature/date-format
# GitHub shows "Compare & pull request": write what and why, link the issue

# review feedback? keep pushing to the same branch:
git commit -am "Use device locale for dates"
git push

# with the GitHub CLI, if you have it installed:
gh pr create --fill
gh pr checks`,
        remember: 'Small branch, clear description, green CI, one approval, then merge and delete the branch.',
        deeper: [
          {
            title: 'Three ways to merge a PR',
            body: `<p>GitHub's merge button has three modes. <strong>Create a merge commit</strong> keeps every commit and adds a merge commit. <strong>Squash and merge</strong> turns the whole PR into one commit on main. <strong>Rebase and merge</strong> replays each commit onto main with no merge commit. Teams usually pick one and stick to it.</p>`,
            visual(el) {
              const g = graph({ lanes: 3, title: 'Merge methods' });
              const o = out('');
              const base = () => [{ id: 'A', p: [] }, { id: 'B', p: ['A'] }, { id: 'C', p: ['B'] }, { id: 'D', p: ['B'], lane: 1 }, { id: 'E', p: ['D'], lane: 1 }];
              const MODES = {
                'merge commit': () => [[...base(), { id: 'M', p: ['C', 'E'] }], 'M', 'Every PR commit stays, plus merge commit M. Full detail, busier history.'],
                'squash and merge': () => [[...base().map(c => (c.lane ? { ...c, lane: 2, ghost: true } : c)), { id: 'S', p: ['C'], col: 5 }], 'S', 'One new commit S holds all of the PR. main reads as one line per PR. The branch commits (dashed) are not on main.'],
                'rebase and merge': () => [[...base().map(c => (c.lane ? { ...c, lane: 2, ghost: true } : c)), { id: "D'", p: ['C'], col: 5 }, { id: "E'", p: ["D'"], col: 6 }], "E'", 'Each commit is replayed on main with a new id. Straight history, no merge commit.'],
              };
              const btns = Object.keys(MODES).map(k => act(k, function () {
                press(btns, this);
                const [cs, tip, note] = MODES[k]();
                g.set({ commits: [], refs: [], head: null });
                g.set({ commits: cs, refs: [{ name: 'main', at: tip }], head: null });
                say(o, note);
              }));
              g.set({ commits: base(), refs: [{ name: 'main', at: 'C' }, { name: 'feature', at: 'E' }], head: null });
              say(o, 'A PR with commits D and E, while main moved to C. Pick a merge method.');
              el.append(row(btns), g.el, o);
            },
          },
          {
            title: 'Write a PR people want to review',
            body: `<p>The description answers three questions: what changed, why, and how to check it. Add screenshots for UI changes. Open a <em>draft</em> PR to share early work: drafts cannot be merged, and code owners are not asked to review until you mark them ready. Review your own diff first; you will catch half the comments yourself.</p>`,
            code: `## What
Show news dates as "Today 14:05" / "Yesterday".

## Why
Users read relative dates faster. Fixes #118.

## How to test
1. Set the device language to English
2. Open the news list: today's items show "Today"`,
          },
          {
            title: 'Reviewing someone else’s PR',
            body: `<p>A review ends in one of three states: <strong>Comment</strong> (feedback, no decision), <strong>Approve</strong>, or <strong>Request changes</strong>. Comment on the code, not the person. Say what and why: "This runs on the main thread; it can freeze the list. Move it to a coroutine?" Mark small style notes as optional so the author knows what blocks the merge.</p>`,
          },
        ],
        mistakes: [
          { title: 'Pushing straight to main', bad: `git switch main
git commit -am "Quick fix"
git push`, good: `git switch -c fix/quick-fix
git commit -am "Fix crash when feed is empty"
git push -u origin fix/quick-fix
# open a PR`, why: 'Even a one-line fix benefits from CI and a second pair of eyes. Many repositories protect main so that direct pushes are refused.' },
          { title: 'One giant PR', bad: `# feature/redesign: 64 files, +3,200 −1,900`, good: `# feature/redesign-colors     +120
# feature/redesign-news-card  +240
# feature/redesign-detail     +310`, why: 'Reviewers cannot hold thousands of lines in their head, so big PRs get rubber-stamped. Split by slice; each PR should build and pass tests on its own.' },
        ],
        terms: [
          { term: 'Pull request', def: 'A GitHub page asking to merge one branch into another, with the diff, checks and review.' },
          { term: 'Status check', def: 'A pass or fail result reported on a commit, usually by CI. Required checks must pass before merging.' },
          { term: 'Code review', def: 'A teammate reading your diff and commenting, approving or requesting changes.' },
          { term: 'Draft pull request', def: 'A PR marked as work in progress. It cannot be merged until marked ready for review.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Start a fix branch and publish it so you can open a PR.', code: 'git switch [[-c|--create]] fix/empty-feed-crash\ngit commit -am "Fix crash when the feed is empty"\ngit [[push]] -u origin fix/empty-feed-crash', why: 'A PR needs the branch on GitHub. <code>-u</code> sets the upstream so later pushes are just <code>git push</code>.' },
          { type: 'bug', prompt: 'You want to open a PR, but the fix never reaches GitHub. Tap the line.', code: 'git switch main\ngit pull\ngit switch -c fix/feed-crash\ngit commit -am "Fix crash when the feed is empty"\ngit push origin main', bug: 4, fix: 'git push -u origin fix/feed-crash', why: 'The commit is on <code>fix/feed-crash</code>. Pushing main sends nothing new. Push the branch, then open the PR from it.' },
        ],
        quiz: [
          { q: 'A reviewer asks for changes. What do you do?', options: ['Close the PR and open a new one', 'Push more commits to the same branch', 'Merge anyway'], a: 1, why: 'The PR follows the branch. New commits show up in it and CI runs again.' },
          { q: 'What do status checks on a PR usually come from?', options: ['The reviewer', 'CI, such as a build and test workflow', 'Git itself'], a: 1, why: 'CI systems report results on each commit. A repository can require them to pass before merging.' },
          { q: 'What does "Squash and merge" put on main?', options: ['Every commit of the PR', 'One commit containing all the PR changes', 'A merge commit plus every commit'], a: 1, why: 'Squash combines the PR into a single commit on the base branch.' },
          { q: 'You want feedback on half-done work, but it must not be merged yet. What do you open?', options: ['A draft pull request', 'A normal pull request with “WIP” in the title', 'Nothing: push to main and ask for review'], a: 0, why: 'Drafts can’t be merged, and code owners aren’t asked to review until you mark the PR ready.' },
          { q: 'Which merge mode puts every PR commit on main without adding a merge commit?', options: ['Squash and merge', 'Create a merge commit', 'Rebase and merge'], a: 2, why: 'Rebase and merge replays each commit onto main. Squash makes one commit, and a merge commit keeps the commits plus a merge commit.' },
        ],
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'undo',
        title: 'Undoing things',
        tagline: 'restore for files, reset to move your branch back, revert for shared history, and reflog when all else fails.',
        level: 'intermediate',
        body: `
<p>Pick the tool by what you want to undo. To throw away edits to a file, <code>git restore</code> copies it back from the staging area; <code>git restore --staged</code> unstages it. To undo commits that are only on your machine, <code>git reset</code> moves your branch back to an older commit.</p>
<p><code>reset</code> has three strengths. <code>--soft</code> only moves the branch: the undone changes stay staged. <code>--mixed</code> (the default) also resets the staging area: the changes stay in your files, unstaged. <code>--hard</code> also overwrites your files. It is the only one that destroys uncommitted work.</p>
<p>For commits already pushed, use <code>git revert</code>: it adds a new commit that does the opposite, so nobody's history is rewritten. And if you lose a commit, <code>git reflog</code> lists everywhere HEAD has been, so you can go back. Try each below. Your working file has an unsaved edit, v4.</p>`,
        predict: {
          q: 'You run <code>git revert</code> on the last commit. What happens to the history?',
          options: ['That commit is deleted', 'A new commit is added that undoes its changes', 'The branch moves back one commit'],
          a: 1,
          why: 'Revert never rewrites history. It records the opposite change as a new commit, which is why it is safe on shared branches.',
        },
        visual(el) {
          const g = graph({ lanes: 1, top: 56, title: 'History with HEAD' });
          const vH = h('span', { class: 'gt-ver' }), vI = h('span', { class: 'gt-ver' }), vW = h('span', { class: 'gt-ver' }), vX = h('span', { class: 'gt-ver gt-lost', hidden: true }, 'v4');
          const bH = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, 'HEAD commit', h('small', {}, 'history')), vH);
          const bI = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, 'Staging area', h('small', {}, 'index')), vI);
          const bW = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, 'Working tree', h('small', {}, 'NewsAdapter.kt')), h('div', { class: 'gt-files' }, vW, vX));
          const o = out('');
          let cs, main, idx, wt, lost, log, rid;
          const HASH = { A: '1f3a9c2', B: '7c4e0b8', C: 'e9b25d1', R: '4a8f6e3' };
          const ver = id => cs.find(c => c.id === id).v;
          function reset() {
            cs = [{ id: 'A', p: [], v: 'v1' }, { id: 'B', p: ['A'], v: 'v2' }, { id: 'C', p: ['B'], v: 'v3' }];
            main = 'C'; idx = 'v3'; wt = 'v4'; lost = false; rid = 0;
            log = [['C', 'commit: Sort news by date'], ['B', 'commit: Add source label'], ['A', 'commit (initial): Add news list']];
            draw(); say(o, 'main is at C (file v3). You have an unsaved edit: v4 in your working tree.');
          }
          function draw(changed = []) {
            const reach = new Set(); for (let c = main; c; c = (cs.find(x => x.id === c).p[0])) reach.add(c);
            g.set({ commits: cs.map(c => ({ ...c, label: c.id, ghost: !reach.has(c.id), msg: HASH[c.id] })), refs: [{ name: 'main', at: main }], head: 'main' });
            vH.textContent = `${main}: ${ver(main)}`; vI.textContent = idx; vW.textContent = wt;
            vX.hidden = !lost;
            [[vH, 'h'], [vI, 'i'], [vW, 'w']].forEach(([e, k]) => { e.classList.remove('gt-chg'); if (changed.includes(k)) replay(e, 'gt-chg'); });
          }
          function rst(mode) {
            const parent = cs.find(c => c.id === main).p[0];
            if (!parent) { say(o, "fatal: ambiguous argument 'HEAD~1': unknown revision\n<span class=\"muted\">There is no commit before the first one.</span>"); return; }
            const from = main; main = parent; log.unshift([parent, `reset: moving to HEAD~1`]);
            const ch = ['h'];
            if (mode !== 'soft') { idx = ver(parent); ch.push('i'); }
            let note;
            if (mode === 'hard') {
              const unsaved = !cs.some(c => c.v === wt);
              lost = unsaved; wt = ver(parent); ch.push('w');
              note = `HEAD is now at ${HASH[parent]}\n<span class="bad">--hard overwrote your files.</span>${unsaved ? ' <span class="bad">The uncommitted v4 is gone for good: it was never in a commit.</span>' : ''}\n<span class="muted">Commit ${from} still exists. git reflog can find it.</span>`;
            } else if (mode === 'mixed') note = `Unstaged changes after reset:\nM\tNewsAdapter.kt\n<span class="muted">main moved back to ${parent}. The staging area now matches ${parent}; your files still have ${wt}. Nothing lost.</span>`;
            else note = `<span class="muted">Only main moved, to ${parent}. The staging area still holds ${idx}: ready to commit again, for example with a better message.</span>`;
            draw(ch); say(o, note);
          }
          function revert() {
            if (wt !== idx || idx !== ver(main)) { say(o, '<span class="bad">error: your local changes would be overwritten by revert.\nhint: commit your changes or stash them to proceed.</span>'); return; }
            const head = cs.find(c => c.id === main);
            if (!head.p[0]) { say(o, 'Nothing before the first commit to go back to.'); return; }
            if (rid) { say(o, 'One revert is enough for this demo. Press "start over".'); return; }
            const v = ver(head.p[0]); rid = 1;
            cs.push({ id: 'R', p: [main], v }); log.unshift(['R', `revert: Revert "${head.id}"`]); main = 'R'; idx = v; wt = v;
            draw(['h', 'i', 'w']);
            say(o, `[main ${HASH.R}] Revert "${head.id}"\n<span class="muted">A new commit R undoes ${head.id}. History only grew, so it is safe to push on a shared branch.</span>`);
          }
          function restore() {
            if (wt === idx) { say(o, '<span class="muted">Your file already matches the staging area. Nothing to restore.</span>'); return; }
            wt = idx; lost = false; draw(['w']);
            say(o, 'NewsAdapter.kt copied back from the staging area. The edit is discarded: restore cannot be undone either.');
          }
          function reflog() {
            const canBack = log.length > 1 && log[1][0] !== main;
            say(o, log.slice(0, 5).map((l, i) => `${HASH[l[0]]} HEAD@{${i}}: ${esc(l[1])}`).join('\n') + (canBack ? `\n<span class="muted">HEAD@{1} is where HEAD was before the last step. git reset --hard HEAD@{1} goes back there.</span>` : ''));
            recover.hidden = !canBack;
          }
          const recover = act('git reset --hard HEAD@{1}', () => {
            const target = log[1] && log[1][0];
            if (!target || !cs.some(c => c.id === target)) return;
            main = target; idx = ver(target); wt = ver(target); log.unshift([target, 'reset: moving to HEAD@{1}']);
            recover.hidden = true; draw(['h', 'i', 'w']);
            say(o, `HEAD is now at ${HASH[target]}\n<span class="good">Commit ${target} is back.</span>${lost ? ' <span class="muted">The uncommitted v4 is not: reflog only knows commits.</span>' : ''}`);
          }, { hidden: true });
          reset();
          el.append(
            row(act('git reset --soft HEAD~1', () => rst('soft')), act('git reset --mixed HEAD~1', () => rst('mixed')), act('git reset --hard HEAD~1', () => rst('hard'))),
            row(act('git restore NewsAdapter.kt', restore), act('git revert HEAD', revert), act('git reflog', reflog), recover, act('start over', reset)),
            g.el, h('div', { class: 'gt-boxes' }, bH, bI, bW), o);
        },
        code: `# files
git restore NewsAdapter.kt              # discard unstaged edits (cannot be undone)
git restore --staged NewsAdapter.kt     # unstage, keep the edits

# last commit, not pushed yet
git commit --amend                      # fix its message or add a forgotten file
git reset --soft HEAD~1                 # undo commit, keep changes staged
git reset HEAD~1                        # undo commit, keep changes unstaged (--mixed)
git reset --hard HEAD~1                 # undo commit AND throw away the changes

# already pushed
git revert 9f1e2d0                      # new commit that undoes 9f1e2d0

# lost something?
git reflog
git reset --hard HEAD@{2}`,
        remember: 'Not pushed: reset. Pushed: revert. Before any --hard, commit or stash what you want to keep.',
        deeper: [
          {
            title: 'git stash: put work aside for a moment',
            body: `<p>A crash report arrives while you are halfway through a feature. <code>git stash</code> saves your uncommitted changes on a stack and cleans your working tree, so you can switch branches. Later, <code>git stash pop</code> brings them back and removes them from the stack; <code>apply</code> brings them back and keeps them. New untracked files are left behind unless you add <code>-u</code>.</p>`,
            visual(el) {
              const wt = h('div', { class: 'gt-files' }), sk = h('div', { class: 'gt-files' });
              const bW = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, 'Working tree', h('small', {}, 'on feature/search')), wt);
              const bS = h('div', { class: 'gt-box' }, h('div', { class: 'gt-box-h' }, 'Stash', h('small', {}, 'stack')), sk);
              const o = out('');
              let edits = ['SearchBar.kt', 'strings.xml'], stack = [], branch = 'feature/search';
              function draw(anim) {
                bW.querySelector('small').textContent = 'on ' + branch;
                wt.replaceChildren(...(edits.length ? edits.map(f => h('span', { class: `gt-f gt-mod${anim === 'w' ? ' drop-in' : ''}` }, f, ' ', h('small', {}, 'modified'))) : [h('span', { class: 'gt-empty' }, 'clean')]));
                sk.replaceChildren(...(stack.length ? stack.map((s, i) => h('span', { class: `gt-f gt-stg${anim === 's' && i === 0 ? ' drop-in' : ''}` }, `stash@{${i}}`, ' ', h('small', {}, s.files.join(', ')))) : [h('span', { class: 'gt-empty' }, 'empty')]));
              }
              draw(); say(o, 'Half-done search work. A crash needs fixing on main now.');
              el.append(row(
                act('git switch main', () => { if (branch === 'main') { say(o, "Already on 'main'"); return; } if (edits.length) { say(o, '<span class="bad">error: Your local changes to the following files would be overwritten…\n\tstrings.xml</span>\n<span class="muted">Stash or commit them first.</span>'); return; } branch = 'main'; draw(); say(o, "Switched to branch 'main'. Fix the crash here."); }),
                act('git stash', () => { if (!edits.length) { say(o, 'No local changes to save'); return; } stack.unshift({ files: edits, on: branch }); edits = []; draw('s'); say(o, `Saved working directory and index state WIP on ${branch}\n<span class="muted">Your tree is clean, safe to switch.</span>`); }),
                act('git switch feature/search', () => { if (branch === 'feature/search') { say(o, "Already on 'feature/search'"); return; } branch = 'feature/search'; draw(); say(o, "Switched to branch 'feature/search'."); }),
                act('git stash pop', () => { if (!stack.length) { say(o, 'No stash entries found.'); return; } const s = stack.shift(); edits = s.files; draw('w'); say(o, `Your edits are back${branch !== s.on ? ` (they were stashed on ${s.on}, now applied on ${branch})` : ''}. Dropped stash@{0}.`); })),
                h('div', { class: 'gt-boxes' }, bW, bS), o);
            },
          },
          {
            title: 'reset or revert?',
            body: `<p>The question is whether anyone else has the commit. <code>reset</code> rewrites history: the commit disappears from the branch, so it is only safe for commits you have not pushed. <code>revert</code> adds history: a new commit that undoes an old one. Everyone can pull it normally, and the record of what happened stays honest.</p>`,
            code: `git log --oneline origin/main..main   # commits not pushed yet: reset is fine
git revert HEAD                       # undo the last pushed commit
git revert -m 1 <merge-commit>        # undo a merge: keep parent 1 (main)`,
          },
          {
            title: 'reflog, the safety net',
            body: `<p>The reflog records every position HEAD has had on your machine: commits, resets, rebases, switches. If a reset or rebase "lost" a commit, it is still in the reflog for a long time (by default, unreachable entries expire after 30 days). Find it, then point a branch at it. The reflog is local: it is not pushed, and it cannot bring back changes that were never committed.</p>`,
            code: `git reflog
# 7c4e0b8 HEAD@{0}: reset: moving to HEAD~1
# e9b25d1 HEAD@{1}: commit: Sort news by date
git switch -c rescue e9b25d1          # or: git reset --hard HEAD@{1}`,
          },
        ],
        underHood: {
          body: `<p>Think of three trees: HEAD (the last commit), the index (staging area) and the working tree (your files). <code>reset</code> touches them in order and stops early: <code>--soft</code> moves only the branch HEAD points to, <code>--mixed</code> also copies that commit into the index, <code>--hard</code> also copies it into your files. <code>restore</code> works on files, not on branches: by default it copies from the index into the working tree, and with <code>--staged</code> from HEAD into the index.</p>`,
          code: `#                 HEAD/branch   index     working tree
# reset --soft       moves        -          -
# reset --mixed      moves        reset      -
# reset --hard       moves        reset      overwritten
# restore <file>      -            -         from index
# restore --staged    -           from HEAD   -`,
        },
        mistakes: [
          { title: 'Resetting a pushed commit', bad: `git reset --hard HEAD~1
git push --force`, good: `git revert HEAD
git push`, why: 'Teammates who pulled still have the commit, and their next push brings it back. revert undoes it with a new commit everyone can pull.' },
          { title: 'reset --hard with uncommitted work', bad: `git reset --hard origin/main   # "just start fresh"`, good: `git stash -u                   # or commit to a branch
git reset --hard origin/main`, why: 'Uncommitted changes are not in any commit, so reflog cannot bring them back. Stash or commit first.' },
        ],
        terms: [
          { term: 'git reset', def: 'Moves the current branch to another commit, and optionally resets the staging area and files.' },
          { term: 'git revert', def: 'Creates a new commit that undoes the changes of an earlier commit.' },
          { term: 'Reflog', def: 'A local log of every commit HEAD has pointed to. Used to find lost commits.' },
          { term: 'Stash', def: 'A stack where git stash saves uncommitted changes so you can come back to them later.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Undo your last local commit but keep its changes staged, then undo a pushed commit safely.', code: 'git reset [[--soft]] HEAD~1\ngit [[revert]] 9f1e2d0', why: '<code>--soft</code> moves only the branch, so the changes stay staged. <code>revert</code> adds an undo commit instead of rewriting shared history.' },
          { type: 'bug', prompt: 'The commit already went to GitHub and broke the app for everyone. Tap the line to change.', code: 'git log --oneline -1\n# 9f1e2d0 Change feed sorting (pushed)\ngit reset --hard HEAD~1\ngit push', bug: 2, fix: 'git revert HEAD', why: 'After a reset, the push is rejected (the remote is ahead), and forcing it rewrites shared history. revert makes a new commit that everyone can pull.' },
        ],
        quiz: [
          { q: 'Which reset keeps your changes in the files but unstaged?', options: ['--soft', '--mixed (the default)', '--hard'], a: 1, why: '--mixed moves the branch and resets the index, but leaves the working tree alone.' },
          { q: 'You ran <code>git reset --hard HEAD~2</code> by mistake. The commits were real commits. Are they lost?', options: ['Yes, permanently', 'No: git reflog shows them and you can reset back', 'Only if you pushed'], a: 1, why: 'Commits stay in the object store and the reflog for weeks. Uncommitted edits are the ones --hard truly destroys.' },
          { q: 'How do you undo a commit that teammates already pulled?', options: ['git reset --hard and force push', 'git revert', 'Delete the branch'], a: 1, why: 'revert adds a new commit, so nobody’s history is rewritten.' },
          { q: 'After <code>git reset --soft HEAD~1</code>, where are the changes from the undone commit?', options: ['In your files, unstaged', 'Staged, ready to commit again', 'Gone'], a: 1, why: '--soft only moves the branch. The index and your files keep the changes, so they stay staged.' },
          { q: 'You created a new file and edited a tracked one, then ran <code>git stash</code>. What happens to the new file?', options: ['It is stashed with the edit', 'Git deletes it', 'It stays in your working tree; add -u to stash it'], a: 2, why: 'git stash saves changes to tracked files by default. Untracked files are left behind unless you pass -u.' },
          { q: 'You had uncommitted edits and ran <code>git reset --hard</code>. Can <code>git reflog</code> bring them back?', options: ['Yes, for 30 days', 'No: they were never in a commit', 'Yes, with git stash pop'], a: 1, why: 'The reflog records positions of HEAD, which are commits. Edits that were never committed are not in any of them.' },
        ],
      },
    ],
  });
})();
