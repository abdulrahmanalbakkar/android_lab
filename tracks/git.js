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
    group: 'Foundations', requires: [], lang: 'shell',
    css,
    lessons: [
      {
        id: 'terminal',
        title: 'The terminal',
        tagline: 'A window where you type commands instead of clicking.',
        goals: ['Open a terminal and run a command', 'Find out where you are with <code>pwd</code> and <code>ls</code>', 'Move between folders with <code>cd</code> and make one with <code>mkdir</code>'],
        level: 'beginner', introduces: ['pwd', 'ls', 'cd', 'mkdir', 'dir'],
        body: `
<p>Every Git lesson after this one happens in a window where you type instead of click. Developers like it because a typed command is exact: you can copy it from a guide, run it again tomorrow, and see precisely what happened.</p>
<p>That window is the <em>terminal</em>. On macOS and Linux, open the app called Terminal. Android Studio, the program you will use later in the course to build Android apps, has one too, in the Terminal tab at the bottom of its window. You type a <em>command</em> after the <em>prompt</em> (here a <code>$</code> sign; yours may also show your name and folder), press <kbd>Enter</kbd>, and the terminal prints the result.</p>
<p>The terminal always stands in one folder, the <em>working directory</em>. <code>pwd</code> prints which one (print working directory). <code>ls</code> lists what is inside it. <code>cd projects</code> moves into the folder <code>projects</code>, and <code>cd ..</code> moves up one level, to the folder that holds this one. <code>mkdir notes</code> makes a new folder named <code>notes</code> right here. A <em>path</em> such as <code>/home/ada/projects</code> names a folder by listing the folders that lead to it, separated by <code>/</code>.</p>
<p>On Windows, open PowerShell (it comes with Windows) or Git Bash (it comes with Git). <code>pwd</code>, <code>ls</code>, <code>cd</code> and <code>mkdir</code> work there too. In the older Command Prompt, type <code>dir</code> instead of <code>ls</code>, and <code>cd</code> on its own instead of <code>pwd</code>. Windows paths use <code>\\</code>, like <code>C:\\Users\\ada\\projects</code>.</p>`,
        visual(el) {
          const tree = (here, notes) => {
            const rows = [['ada', 0, true], ['Desktop', 1, true], ['Documents', 1, true], ['projects', 1, true]];
            if (notes) rows.push(['notes', 2, true]);
            return '<div class="gt-tree">' + rows.map(([n, d, dir]) => `<div class="gt-ti${dir ? '' : ' gt-fi'}${n === here ? ' gt-here' : ''}" style="padding-left:${8 + d * 14}px">${n}${dir ? '/' : ''}</div>`).join('') + '</div>';
          };
          Lab.ui.terminal(el, {
            panelTitle: 'Ada’s folders',
            predict: {
              q: 'Ada is in <code>/home/ada/projects</code>, where she just made a folder <code>notes</code>, and runs <code>cd notes</code>. What does <code>pwd</code> print next?',
              options: ['<code>/home/ada/projects</code>', '<code>/home/ada/projects/notes</code>', '<code>/notes</code>'],
              a: 1,
              why: '<code>cd</code> moves the terminal into <code>notes</code>, and <code>pwd</code> prints the folder it stands in now.',
            },
            frames: [
              { panel: tree('ada'), say: 'Ada opens a terminal. The panel shows her folders, and the highlight marks where the terminal stands.' },
              { cmd: 'pwd', out: '/home/ada', say: '<code>pwd</code> prints the working directory. A new terminal starts in your home folder, here <code>/home/ada</code>. (On macOS it looks like <code>/Users/ada</code>.)' },
              { cmd: 'ls', out: 'Desktop  Documents  projects', say: '<code>ls</code> lists what is inside the folder you stand in.' },
              { cmd: 'cd projects', panel: tree('projects'), say: '<code>cd</code> moves into <code>projects</code>. It printed nothing: many commands stay quiet when they work.' },
              { cmd: 'mkdir notes', panel: tree('projects', true), say: '<code>mkdir</code> makes a new folder here. It does not move you into it: the highlight stays on <code>projects</code>.' },
              { cmd: 'cd notes', panel: tree('notes', true), say: 'Now she moves into <code>notes</code>, the folder she just made.' },
              { cmd: 'pwd', out: '/home/ada/projects/notes', say: 'The path lists every folder on the way, from the top of the disk down to here.' },
              { cmd: 'cd ..', panel: tree('projects', true), say: '<code>cd ..</code> goes up one level, back to <code>projects</code>.' },
            ],
          });
        },
        code: `pwd              # /home/ada
ls               # Desktop  Documents  projects
cd projects      # move into projects (prints nothing)
mkdir notes      # make a folder named notes here
ls               # notes
cd notes         # move into notes
pwd              # /home/ada/projects/notes
cd ..            # up one level, back to /home/ada/projects`,
        remember: 'pwd says where you are, ls shows what is here, cd moves you, cd .. goes up one level.',
        mistakes: [
          { title: 'Moving to a folder that is not here', bad: `pwd              # /home/ada
cd notes
# bash: cd: notes: No such file or directory`, good: `cd projects
cd notes`, why: '<code>cd</code> only looks inside the folder you stand in. <code>notes</code> is inside <code>projects</code>, so go there first. (<code>bash</code> is the program running inside the terminal.) Run <code>ls</code> to see what is here. (macOS words the message a little differently.)' },
        ],
        terms: [
          { term: 'terminal, command', def: 'The terminal is a window where you type commands, such as <code>pwd</code>, run them with Enter, and read what they print.' },
          { term: 'prompt', def: 'The sign, here <code>$</code>, where the terminal waits for your next command.' },
          { term: 'working directory', def: 'The folder the terminal is standing in. Commands act on it.' },
          { term: 'path', def: 'The folders that lead to a place, separated by <code>/</code>, such as <code>/home/ada/projects</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'You are in your home folder. Move into <code>projects</code>, then print where you are.', code: '[[cd]] projects\n[[pwd]]', why: '<code>cd</code> moves you into a folder, and <code>pwd</code> prints the folder you stand in.' },
          { type: 'bug', prompt: 'Ada is in <code>/home/ada/projects/notes</code>. She wants a new folder <code>drafts</code> inside <code>projects</code>, next to <code>notes</code>. Tap the wrong line.', code: 'pwd\ncd drafts\nmkdir drafts\nls', bug: 1, fix: 'cd ..', why: 'There is no <code>drafts</code> folder yet, so <code>cd drafts</code> fails. <code>cd ..</code> goes up to <code>projects</code>, where <code>mkdir drafts</code> belongs.' },
        ],
        quiz: [
          { q: 'What does <code>cd ..</code> do?', options: ['Moves up one level, to the folder that holds this one', 'Runs the previous command again', 'Deletes the current folder'], a: 0, why: '<code>..</code> always means the folder one level up.' },
          { q: '<code>cd projects</code> printed nothing. What happened?', options: ['It failed', 'It worked: many commands print nothing when they succeed', 'The terminal froze'], a: 1, why: 'When something goes wrong, you get a message. Silence usually means it worked.' },
          { q: 'In the Windows Command Prompt, which command lists what is in a folder?', options: ['<code>pwd</code>', '<code>dir</code>', '<code>mkdir</code>'], a: 1, why: 'The Command Prompt uses <code>dir</code> where macOS, Linux and PowerShell use <code>ls</code>.' },
        ],
        docs: [['Pro Git: The Command Line', 'https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line']],
      },

      {
        id: 'what-git',
        title: 'What version control is',
        tagline: 'Keep every version of your project without a pile of copies.',
        goals: ['Explain what version control keeps for you', 'Say why copies named like <code>Main_final_v2.kt</code> stop working', 'Check that Git is installed'],
        level: 'beginner', introduces: ['git', '--version'],
        body: `
<p>You change a program, it stops working, and you can’t remember what it looked like an hour ago. Many people start making copies: <code>Main_old.kt</code>, <code>Main_final.kt</code>, <code>Main_final_v2.kt</code>. Soon nobody knows which copy is the newest, or what changed between two of them.</p>
<p><em>Version control</em> is a tool that keeps that history for you. You keep one copy of each file. Whenever you reach a good point, you save a <em>version</em>: a snapshot of the whole project, with a short note saying what changed, plus who saved it and when. Later you can look back at any version, compare two, or bring one back.</p>
<p><em>Git</em> is the version control tool almost every developer uses, and Android Studio and GitHub (a website for sharing Git projects) are built around it. Git is a program you run in the terminal. To check that it is installed, run <code>git --version</code>. A word that starts with <code>--</code> is an <em>option</em>: it changes what a command does, here “tell me your version”.</p>
<p>If the terminal prints a version number, you are ready. If it says the command was not found, install Git from git-scm.com. On macOS, running <code>git --version</code> the first time offers to install it for you.</p>`,
        visual(el) {
          const left = h('div', { class: 'gt-ig', 'aria-label': 'Folder without Git' });
          const files = h('div', { class: 'gt-ig', 'aria-label': 'Folder with Git' });
          const hist = h('pre', { class: 'ui-out', 'aria-label': 'Git history' });
          const stage = h('div', { class: 'ui-stage' }, h('div', { class: 'gt-split' },
            h('div', { class: 'gt-col' }, lab('without Git'), left),
            h('div', { class: 'gt-col' }, lab('with Git'), files, lab('saved versions'), hist)));
          const item = (n, bad) => `<div class="gt-ig-r${bad ? ' gt-warn' : ''}"><span>${n}</span>${bad ? '<span class="gt-tag">which one?</span>' : ''}</div>`;
          const frames = [
            { copies: ['Main.kt'], hist: [], say: 'The same Kotlin project, kept two ways. On the left, with copies. On the right, with Git.' },
            { copies: ['Main.kt', 'Main_old.kt'], hist: ['1  Add greeting       Ada  Mon 10:02'], say: 'Before a change, the left side copies the file. Git saves a version instead: a snapshot plus a short note.' },
            { copies: ['Main.kt', 'Main_old.kt', 'Main_v2.kt'], hist: ['1  Add greeting       Ada  Mon 10:02', '2  Greet Oslo too     Ada  Mon 11:40'], say: 'Another change, another copy. On the right, still one <code>Main.kt</code> and one more line in the list.' },
            { copies: ['Main.kt', 'Main_old.kt', 'Main_v2.kt', 'Main_final.kt', 'Main_final_v2.kt'], hist: ['1  Add greeting       Ada  Mon 10:02', '2  Greet Oslo too     Ada  Mon 11:40', '3  Greet Rome         Ada  Tue 09:15', '4  Fix Rome typo      Sam  Tue 14:30'], say: 'Two more changes, one of them by Ada’s friend Sam. The folder on the left keeps growing.' },
            { copies: ['Main.kt', 'Main_old.kt', 'Main_v2.kt', 'Main_final.kt', 'Main_final_v2.kt'], bad: true, hist: ['1  Add greeting       Ada  Mon 10:02', '2  Greet Oslo too     Ada  Mon 11:40', '3  Greet Rome         Ada  Tue 09:15', '4  Fix Rome typo      Sam  Tue 14:30'], say: 'Which copy is newest? Who changed what? The names can’t tell you. Each version on the right says what changed, who did it and when.' },
            { copies: ['Main.kt', 'Main_old.kt', 'Main_v2.kt', 'Main_final.kt', 'Main_final_v2.kt'], bad: true, pick: 1, hist: ['1  Add greeting       Ada  Mon 10:02', '2  Greet Oslo too     Ada  Mon 11:40', '3  Greet Rome         Ada  Tue 09:15', '4  Fix Rome typo      Sam  Tue 14:30'], say: 'If a change breaks the program, Git can bring back any saved version, such as version 2, and you still keep the rest of the list.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Ada has <code>Main_final.kt</code> and <code>Main_final_v2.kt</code>. Which one has her latest work?',
              options: ['<code>Main_final_v2.kt</code>, it says v2', '<code>Main_final.kt</code>, it says final', 'She can’t tell without opening both'],
              a: 2,
              why: 'File names are only guesses people make up. Nothing in them records when or what changed.',
            },
            draw(f) {
              left.innerHTML = f.copies.map(n => item(n, f.bad)).join('');
              files.innerHTML = item('Main.kt');
              hist.innerHTML = f.hist.length ? f.hist.map((l, k) => (k === f.pick ? `<b>${esc(l)}</b>` : esc(l))).join('\n') : '(nothing saved yet)';
            },
          });
        },
        code: `# Is Git installed? Ask for its version.
git --version
# git version 2.43.0   (your number may be different)`,
        remember: 'Version control keeps one copy of your files plus a list of saved versions, each with a note, an author and a time.',
        terms: [
          { term: 'version control', def: 'A tool that saves versions of a project and keeps the full history.' },
          { term: 'version', def: 'A saved snapshot of the whole project, with a note about what changed.' },
          { term: 'Git', def: 'The most used version control tool. You run it in the terminal with <code>git</code>.' },
          { term: 'option', def: 'A word starting with <code>-</code> or <code>--</code> that changes what a command does, like <code>--version</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Ask Git which version is installed.', code: '[[git]] [[--version]]', why: '<code>git</code> runs Git, and the option <code>--version</code> asks it to print its version.' },
          { type: 'bug', prompt: 'Git prints <code>unknown option: -version</code>. Tap the wrong line.', code: 'pwd\ngit -version', bug: 1, fix: 'git --version', why: 'Word options like <code>--version</code> start with two dashes.' },
        ],
        quiz: [
          { q: 'What does a saved version in Git hold?', options: ['Only the one file you changed', 'A snapshot of the project, plus what changed, who and when', 'A copy with <code>_v2</code> in its name'], a: 1, why: 'A version saves the whole project as it was, together with a note and its author and time.' },
          { q: 'You run <code>git --version</code> and see <code>git version 2.43.0</code>. What does it mean?', options: ['Git is installed and ready', 'Your project has 2.43 versions', 'Git must be updated first'], a: 0, why: 'The command only asks Git for its own version number. Getting one back means Git is there.' },
        ],
        docs: [['Pro Git: About Version Control', 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control'], ['Pro Git: Installing Git', 'https://git-scm.com/book/en/v2/Getting-Started-Installing-Git']],
      },

      {
        id: 'init',
        title: 'Starting a repository',
        tagline: 'Tell Git which folder to keep a history for.',
        goals: ['Tell Git your name and email, once per computer', 'Turn a folder into a repository with <code>git init</code>', 'Ask Git what it sees with <code>git status</code>'],
        level: 'beginner', introduces: ['config', 'init', 'status', '-a'], ignore: ['branch', 'pull', 'rebase'],
        body: `
<p>Git doesn’t watch your whole computer. You pick one project folder and tell Git: keep a history for this one. Ada wants one for her Kotlin program, in <code>/home/ada/projects/weather</code>.</p>
<p>First, once per computer, tell Git who you are, because every saved version records its author. The <code>git config --global</code> lines below set things for every project on this computer: your name, your email, and the name of your first line of work, <code>main</code>, the name most projects use today (more in Branches). The last one, <code>pull.rebase false</code>, is there so <code>git pull</code> merges; you will use <code>git pull</code> once your project is on GitHub.</p>
<p>Then <code>cd</code> into the project folder and run <code>git init</code>. Git creates a folder named <code>.git</code> inside it, where it will keep the whole history. Your own files are not touched. A folder with <code>.git</code> inside is a <em>repository</em>, or <em>repo</em>. Names that start with a dot are hidden, so <code>ls</code> doesn’t show <code>.git</code>; <code>ls -a</code> (a for all) does.</p>
<p><code>git status</code> is the question you will ask Git most: what do you see? It answers in sentences. <code>On branch main</code> names the line of work you are on, and <code>No commits yet</code> means nothing has been saved so far. In a folder without <code>.git</code>, it answers <code>fatal: not a git repository</code>: “fatal” only means the command stopped.</p>`,
        visual(el) {
          const view = (here, items) => '<div class="gt-tree">' +
            `<div class="gt-ti${here === 'projects' ? ' gt-here' : ''}">projects/</div>` +
            items.map(([n, d, dim]) => `<div class="gt-ti${dim ? ' gt-fi' : ''}${n === here ? ' gt-here' : ''}" style="padding-left:${8 + d * 14}px">${n}/${dim ? ' (hidden)' : ''}</div>`).join('') + '</div>';
          Lab.ui.terminal(el, {
            panelTitle: 'Folders',
            predict: {
              q: 'Ada runs <code>git status</code> in a folder where she has not run <code>git init</code>. What happens?',
              options: ['Git lists the files in the folder', 'An error: the folder is not a repository', 'Git starts a repository on its own'],
              a: 1,
              why: 'Git only works in folders you have turned into repositories with <code>git init</code>.',
            },
            frames: [
              { panel: view('projects', [['notes', 1]]), say: 'Ada stands in her <code>projects</code> folder. She makes a folder for the weather program.' },
              { cmd: 'mkdir weather', panel: view('projects', [['notes', 1], ['weather', 1]]), say: 'A new, empty folder.' },
              { cmd: 'cd weather', panel: view('weather', [['notes', 1], ['weather', 1]]), say: 'She moves into it. Git commands act on the folder you stand in.' },
              { cmd: 'git status', out: 'fatal: not a git repository (or any of the parent directories): .git', say: 'Git looked for a <code>.git</code> folder here and in the folders above, and found none.' },
              { cmd: 'git init', out: 'Initialized empty Git repository in /home/ada/projects/weather/.git/', panel: view('weather', [['notes', 1], ['weather', 1], ['.git', 2, true]]), say: 'Now <code>weather</code> is a repository. Git made <code>.git</code>, where it will keep the history.' },
              { cmd: 'ls -a', out: '.  ..  .git', say: '<code>-a</code> shows hidden names too. <code>.</code> is this folder and <code>..</code> the one above, as in <code>cd ..</code>.' },
              { cmd: 'git status', out: 'On branch main\n\nNo commits yet\n\nnothing to commit (create/copy files and use "git add" to track)', say: 'Git sees the repository, on <code>main</code>, with nothing saved yet. The text in brackets is Git suggesting a next step.' },
            ],
          });
        },
        code: `# Once per computer: who you are, and the name of your first line of work
git config --global user.name "Ada Lin"
git config --global user.email "ada@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false   # so git pull merges

# Once per project
cd projects
mkdir weather
cd weather
git init      # Initialized empty Git repository in /home/ada/projects/weather/.git/
git status    # On branch main
              # No commits yet`,
        remember: 'git init once per project folder, then git status any time you want to know what Git sees.',
        mistakes: [
          { title: 'Running git init in the wrong folder', bad: `pwd          # /home/ada
git init     # now Git keeps a history of your whole home folder`, good: `cd projects
cd weather
pwd          # /home/ada/projects/weather
git init`, why: '<code>git init</code> works on the folder you stand in. Check with <code>pwd</code> first, so the repository is your project and nothing more. Already did it? Delete the hidden <code>.git</code> folder from your home folder, for example in your file manager with hidden files shown. Your own files are not touched.' },
        ],
        terms: [
          { term: 'repository', def: 'A project folder that Git keeps a history for. Short: repo.' },
          { term: '.git', def: 'The hidden folder <code>git init</code> creates, where Git stores the history.' },
          { term: 'git status', def: 'Asks Git what it sees in the repository right now.' },
          { term: 'git config', def: 'Sets Git options, such as your name. <code>--global</code> means for every project on this computer.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the <code>weather</code> folder into a repository, then ask Git what it sees.', code: 'cd weather\ngit [[init]]\ngit [[status]]', why: '<code>git init</code> starts the repository; <code>git status</code> reports on it.' },
          { type: 'bug', prompt: 'Git answers <code>git: \'int\' is not a git command. See \'git --help\'.</code> Tap the wrong line.', code: 'cd weather\ngit int\ngit status', bug: 1, fix: 'git init', why: 'Git only knows exact command names. It even suggests the closest one: <code>init</code>.' },
        ],
        quiz: [
          { q: 'Where does Git keep a repository’s history?', options: ['In a hidden <code>.git</code> folder inside the project', 'In your home folder', 'In a file named history.txt'], a: 0, why: '<code>git init</code> creates <code>.git</code> inside the project folder, and everything Git saves goes there.' },
          { q: 'After <code>git init</code>, <code>ls</code> shows nothing. Did it work?', options: ['No, run it again', 'Yes: <code>.git</code> is hidden, and <code>ls -a</code> shows it'], a: 1, why: 'Names that start with a dot are hidden from a plain <code>ls</code>.' },
          { q: 'You set your name with <code>git config --global</code>. When do you need to do it again?', options: ['For every new project', 'Only on a new computer', 'Every day'], a: 1, why: '<code>--global</code> saves it for every project on this computer.' },
        ],
        docs: [['Pro Git: First-Time Git Setup', 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup'], ['git init', 'https://git-scm.com/docs/git-init']],
      },

      {
        id: 'commits',
        title: 'Saving a snapshot',
        tagline: 'Pick changes with git add, save them with git commit.',
        goals: ['Tell the working folder, the staging area and commits apart', 'Put a file in the staging area with <code>git add</code>', 'Save a commit with a clear message'],
        level: 'beginner', introduces: ['add', 'commit', '-m'],
        body: `
<p>Ada’s program now greets Lisbon, and it works. Before she changes anything else, she wants to save this point so she can always get back to it. In Git, a saved version is called a <em>commit</em>. To write <code>Main.kt</code> you need a code editor, a program for writing code. Any code editor works, for example Android Studio, which you’ll install later in the course; save the file inside the <code>weather</code> folder.</p>
<p>Your files live in three places. The <em>working folder</em> is your project as you see and edit it. The <em>staging area</em> is a waiting list for the next commit. And the <em>commits</em> are the saved snapshots. <code>git add Main.kt</code> puts <code>Main.kt</code> on the waiting list. <code>git commit -m "Add greeting"</code> saves everything on the list as one commit; <code>-m</code> stands for message, the text in quotes.</p>
<p>Why two steps? You might change three files but want to save only the two that belong together. A brand new file starts out <em>untracked</em>: Git sees it but won’t save it until you add it. After a commit, if you change the file again, <code>git status</code> calls it <code>modified</code>. Add it and commit again.</p>
<p>Write the message as a short line that says what the commit does, like “Add greeting” or “Greet Oslo too”. You will read these messages later when you look back.</p>`,
        visual(el) {
          const f = (n, cls, tag) => `<span class="gt-f ${cls}">${n} <small>${tag}</small></span>`;
          const box = (title, inner) => `<p class="gtk-h">${title}</p><div class="gt-files">${inner || '<span class="gt-empty">empty</span>'}</div>`;
          const panel = (work, stg, commits) => box('Working folder', work) + box('Staging area', stg) +
            `<p class="gtk-h">Commits</p><pre class="ui-out">${commits.length ? commits.join('\n') : '(none yet)'}</pre>`;
          const todo = f('todo.txt', 'gt-new', 'untracked');
          Lab.ui.terminal(el, {
            panelTitle: 'Where the files are',
            predict: {
              q: 'Ada has two new files, <code>Main.kt</code> and <code>todo.txt</code>. She runs <code>git add Main.kt</code>, then <code>git commit</code>. What does the commit hold?',
              options: ['Both files', 'Only <code>Main.kt</code>', 'Nothing, because todo.txt was left out'],
              a: 1,
              why: 'A commit saves only what is in the staging area, and only <code>Main.kt</code> was added.',
            },
            frames: [
              { panel: panel(f('Main.kt', 'gt-new', 'untracked') + todo, '', []), say: 'In her editor, Ada wrote <code>Main.kt</code> and a <code>todo.txt</code> with notes for herself, inside her repository.' },
              { cmd: 'git status', out: 'On branch main\n\nNo commits yet\n\nUntracked files:\n\tMain.kt\n\ttodo.txt\n\nnothing added to commit but untracked files present (use "git add" to track)', say: 'Untracked: Git sees both files but is not saving them. (We cut a hint line from Git’s answer here and below.)' },
              { cmd: 'git add Main.kt', panel: panel(todo, f('Main.kt', 'gt-stg', 'new file'), []), say: '<code>Main.kt</code> moves onto the waiting list. <code>todo.txt</code> stays behind.' },
              { cmd: 'git status', out: 'On branch main\n\nNo commits yet\n\nChanges to be committed:\n\tnew file:   Main.kt\n\nUntracked files:\n\ttodo.txt', say: '“Changes to be committed” is the staging area.' },
              { cmd: 'git commit -m "Add greeting"', out: '[main (root-commit) 14d1672] Add greeting\n 1 file changed, 3 insertions(+)\n create mode 100644 Main.kt', panel: panel(todo, '', ['14d1672 Add greeting']), say: 'Saved. <code>14d1672</code> is this commit’s id; every commit gets its own. “root-commit” means the first one, and “3 insertions” means three new lines. Ignore the <code>create mode</code> line.' },
              { cmd: 'git status', out: 'On branch main\nChanges not staged for commit:\n\tmodified:   Main.kt\n\nUntracked files:\n\ttodo.txt', panel: panel(f('Main.kt', 'gt-mod', 'modified') + todo, '', ['14d1672 Add greeting']), say: 'Ada adds a line that greets Oslo and saves the file. Git notices: <code>Main.kt</code> is now modified.' },
              { cmd: 'git add Main.kt', panel: panel(todo, f('Main.kt', 'gt-stg', 'modified'), ['14d1672 Add greeting']), say: 'Same two steps as before: add the change…' },
              { cmd: 'git commit -m "Greet Oslo too"', out: '[main 7e085e9] Greet Oslo too\n 1 file changed, 1 insertion(+)', panel: panel(todo, '', ['7e085e9 Greet Oslo too', '14d1672 Add greeting']), say: '…and commit it. Two snapshots now, newest on top. <code>todo.txt</code> was never added, so it is in neither.' },
            ],
          });
        },
        code: `git status                      # Main.kt and todo.txt are untracked
git add Main.kt                 # put Main.kt in the staging area
git commit -m "Add greeting"    # [main (root-commit) 14d1672] Add greeting

# edit Main.kt in your editor, then:
git status                      # modified:   Main.kt
git add Main.kt
git commit -m "Greet Oslo too"  # [main 7e085e9] Greet Oslo too`,
        remember: 'Edit, git add what belongs together, git commit -m "what it does".',
        mistakes: [
          { title: 'Committing without -m', bad: `git commit
# Git opens a text editor and waits for a message`, good: `git commit -m "Greet Oslo too"`, why: 'Without <code>-m</code>, Git opens a text editor inside the terminal for you to type the message, which is easy to get stuck in. Give the message right away with <code>-m</code>. Stuck? Press <kbd>Esc</kbd>, type <code>:q!</code> and press <kbd>Enter</kbd> (that’s the editor Vim); in the editor nano, press <kbd>Ctrl</kbd>+<kbd>X</kbd>.' },
        ],
        terms: [
          { term: 'commit', def: 'A saved snapshot of the project, with a message, an author and an id like <code>14d1672</code>.' },
          { term: 'staging area', def: 'The waiting list for the next commit. <code>git add</code> puts changes on it.' },
          { term: 'working tree', def: 'Git’s name for the working folder: your project as you see and edit it. Git prints it in messages like <code>working tree clean</code>.' },
          { term: 'untracked', def: 'A file Git sees but does not save, because it was never added.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Save <code>Main.kt</code> as a commit with the message “Add greeting”.', code: 'git [[add]] Main.kt\ngit [[commit]] -m "Add greeting"', why: '<code>add</code> puts the file in the staging area, and <code>commit</code> saves the staging area as a snapshot.' },
          { type: 'bug', prompt: 'Ada changed <code>Main.kt</code>, but Git answers <code>no changes added to commit</code>. Tap the wrong line.', code: 'git status\ngit status Main.kt\ngit commit -m "Greet Rome"', bug: 1, fix: 'git add Main.kt', why: 'A commit only saves what is in the staging area. <code>git add Main.kt</code> puts the change there first.' },
        ],
        quiz: [
          { q: 'What does <code>git add Main.kt</code> do?', options: ['Saves a commit', 'Puts Main.kt in the staging area for the next commit', 'Creates a file named Main.kt'], a: 1, why: '<code>add</code> only fills the waiting list. Nothing is saved until <code>git commit</code>.' },
          { q: 'Which commit message will help you most a month from now?', options: ['<code>"stuff"</code>', '<code>"Greet Oslo too"</code>', '<code>"changes"</code>'], a: 1, why: 'A good message says what the commit does.' },
          { q: '<code>git status</code> lists <code>todo.txt</code> under “Untracked files”. What does that mean?', options: ['Git sees it but won’t save it until you add it', 'The file is broken', 'It is already in a commit'], a: 0, why: 'Untracked files have never been added, so no commit holds them.' },
        ],
        docs: [['Pro Git: Recording Changes to the Repository', 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository']],
      },

      {
        id: 'history',
        title: 'Looking at history',
        tagline: 'See what changed, when, and why.',
        goals: ['List your commits with <code>git log</code>', 'See changes you have not added yet with <code>git diff</code>', 'Open one commit with <code>git show</code>'],
        level: 'beginner', introduces: ['log', '--oneline', 'diff', 'show', 'HEAD'],
        body: `
<p>Monday morning, Ada’s program prints something odd. What did she change this morning? She doesn’t have to remember: every commit is in the history, and Git can show it.</p>
<p><code>git log</code> lists the commits, newest first. Each one shows its full id (a long code called a <em>hash</em>), the author, the date and the message. <code>git log --oneline</code> shows one line per commit: the first 7 characters of the hash, which are enough to name it, and the message. The newest line also says <code>(HEAD -&gt; main)</code>, which marks the commit you are on right now. If the list is longer than the window, Git shows one page at a time: press <kbd>Space</kbd> for more and <kbd>q</kbd> to quit.</p>
<p><code>git diff</code> shows the changes in your folder that you have not added yet. Lines starting with <code>+</code> were added, lines starting with <code>-</code> were removed. Run it before <code>git add</code> to check your work. Once you add a change, <code>git diff</code> stops showing it.</p>
<p><code>git show 7e085e9</code> opens one commit: its message and exactly which lines it changed. Use a hash you see in <code>git log --oneline</code>.</p>`,
        visual(el) {
          Lab.ui.terminal(el, {
            predict: {
              q: 'Ada adds one line to <code>Main.kt</code> and runs <code>git diff</code> before <code>git add</code>. How is the new line shown?',
              options: ['With a <code>+</code> in front', 'With a <code>-</code> in front', 'It isn’t shown until she adds it'],
              a: 0,
              why: '<code>git diff</code> shows changes not added yet, and added lines start with <code>+</code>.',
            },
            frames: [
              { say: 'Ada’s repository has two commits. She asks Git about them.' },
              { cmd: 'git log', out: esc('commit 7e085e9ff863c986d29e61126ef9fe074f65790a (HEAD -> main)\nAuthor: Ada Lin <ada@example.com>\nDate:   Mon Oct 19 16:44:24 2026 +0300\n\n    Greet Oslo too\n\ncommit 14d167284edff8feed61173a3aa703e7f611493d\nAuthor: Ada Lin <ada@example.com>\nDate:   Mon Oct 19 16:44:24 2026 +0300\n\n    Add greeting'), say: 'Newest first: hash, author, date, message. <code>(HEAD -&gt; main)</code> marks the commit you are on.' },
              { clear: true, cmd: 'git log --oneline', out: esc('7e085e9 (HEAD -> main) Greet Oslo too\n14d1672 Add greeting'), say: 'The same history, one line each. <code>7e085e9</code> is the start of the long hash.' },
              { clear: true, cmd: 'git diff', out: esc('diff --git a/Main.kt b/Main.kt\nindex aee091b..8831498 100644\n--- a/Main.kt\n+++ b/Main.kt\n@@ -1,4 +1,5 @@\n fun main() {\n     println("Hello, Lisbon!")\n     println("Hello, Oslo!")\n+    println("Hello, Rome!")\n }'), say: 'Ada added a line that greets Rome, but has not run <code>git add</code>. The lines above the code are Git’s labels; read the <code>+</code> and <code>-</code> lines. The <code>+</code> marks the new line; the lines around it show where it is.' },
              { cmd: 'git add Main.kt', say: 'Now the change is in the staging area…' },
              { cmd: 'git diff', say: '…so <code>git diff</code> prints nothing. It only shows changes you have not added yet.' },
              { clear: true, cmd: 'git show 7e085e9', out: esc('commit 7e085e9ff863c986d29e61126ef9fe074f65790a\nAuthor: Ada Lin <ada@example.com>\nDate:   Mon Oct 19 16:44:24 2026 +0300\n\n    Greet Oslo too\n\ndiff --git a/Main.kt b/Main.kt\nindex aa1ded7..aee091b 100644\n--- a/Main.kt\n+++ b/Main.kt\n@@ -1,3 +1,4 @@\n fun main() {\n     println("Hello, Lisbon!")\n+    println("Hello, Oslo!")\n }'), say: 'One commit up close: its message, then the line it added. This is how you find out what changed, and when.' },
              { clear: true, cmd: 'git commit -m "Greet Rome"', out: '[main 27a0a6b] Greet Rome\n 1 file changed, 1 insertion(+)', say: 'Back to her own change: the Rome line is still in the staging area, so Ada commits it. Three commits now.' },
            ],
          });
        },
        code: `git log              # every commit, newest first: hash, author, date, message
git log --oneline    # 7e085e9 (HEAD -> main) Greet Oslo too
                     # 14d1672 Add greeting
git diff             # changes not added yet: + added lines, - removed lines
git show 7e085e9     # one commit: its message and the lines it changed`,
        remember: 'git log lists commits, git diff shows what you have not added yet, git show opens one commit.',
        mistakes: [
          { title: 'Stuck inside a long git log', bad: `git log
# the list fills the window, and the prompt is gone`, good: `q    # press q to leave the list and get the prompt back`, why: 'A long list opens one page at a time. <kbd>Space</kbd> shows more, <kbd>q</kbd> takes you back to the prompt.' },
        ],
        terms: [
          { term: 'hash', def: 'A commit’s unique id, a long code like <code>7e085e9...</code>. The first 7 characters are usually enough.' },
          { term: 'diff', def: 'A list of changed lines: <code>+</code> for added, <code>-</code> for removed.' },
          { term: 'git log', def: 'Lists the commits, newest first.' },
          { term: 'HEAD', def: 'Marks the commit you are on now. In <code>git log</code> it shows as <code>(HEAD -&gt; main)</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'List the history one line per commit, then open the commit <code>7e085e9</code>.', code: 'git log --[[oneline]]\ngit [[show]] 7e085e9', why: '<code>--oneline</code> makes the list short, and <code>show</code> opens one commit by its hash.' },
          { type: 'bug', prompt: 'Git answers <code>fatal: unrecognized argument: --online</code>. Tap the wrong line.', code: 'git status\ngit log --online\ngit show 14d1672', bug: 1, fix: 'git log --oneline', why: 'The option is <code>--oneline</code>, one line per commit. Git only knows exact option names.' },
        ],
        quiz: [
          { q: 'In <code>git log</code>, which commit is listed first?', options: ['The oldest', 'The newest'], a: 1, why: 'Newest first, so the latest work is at the top.' },
          { q: 'A line in <code>git diff</code> starts with <code>-</code>. What does it mean?', options: ['The line was removed', 'The line was added', 'The line has an error'], a: 0, why: '<code>-</code> marks removed lines and <code>+</code> marks added ones.' },
          { q: 'You changed <code>Main.kt</code> and ran <code>git add</code>. Now <code>git diff</code> prints nothing. Why?', options: ['The change was lost', '<code>git diff</code> only shows changes you have not added yet', 'Git is broken'], a: 1, why: 'The change is safe in the staging area. <code>git diff</code> shows only what is not added yet.' },
        ],
        docs: [['Pro Git: Viewing the Commit History', 'https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History']],
      },

      {
        id: 'ignore',
        title: 'Ignoring files',
        tagline: 'Keep secrets and generated files out of your history.',
        goals: ['Tell which files should never be committed', 'Write a <code>.gitignore</code> file', 'Check with <code>git status</code> that Git skips them'],
        level: 'beginner', introduces: ['.gitignore', '*'],
        body: `
<p>Ada’s folder now holds files she never wants saved. <code>build/</code> is where her tools put the compiled program. <code>debug.log</code> is notes her program writes while it runs. And <code>secrets.txt</code> holds a private key, like a password, for a weather service. A commit keeps its files for good, and when a project is shared, everything in it is shared too.</p>
<p>Two kinds of files don’t belong in commits. <em>Secrets</em>: passwords and keys. And <em>generated files</em>: anything a tool can make again, like compiled output and logs. They are often big, change every time you build, and can always be rebuilt.</p>
<p>A file named <code>.gitignore</code> in the project folder tells Git what to skip, one <em>pattern</em> per line. <code>secrets.txt</code> matches that one file. <code>build/</code>, ending in <code>/</code>, matches the folder and everything in it. <code>*.log</code> matches every name that ends in <code>.log</code>: <code>*</code> means “any text”. Ignored files disappear from <code>git status</code>, and <code>git add</code> refuses them.</p>
<p>Commit the <code>.gitignore</code> itself, so everyone on the project skips the same files. And write it early: once a secret is in a commit, it stays in the history even if you delete the file later.</p>`,
        visual(el) {
          const rows = (ign) => [['Main.kt', 'in a commit'], ['build/', 'new'], ['debug.log', 'new'], ['secrets.txt', 'new']].map(([n, t]) =>
            `<div class="gt-ig-r${ign && n !== 'Main.kt' ? ' gt-ign' : (n !== 'Main.kt' ? ' gt-warn' : '')}"><span>${n}</span><span class="gt-tag">${ign && n !== 'Main.kt' ? 'ignored' : t}</span></div>`).join('');
          const panel = (ign, gi) => `<p class="gtk-h">.gitignore</p><div class="gt-ignfile">${gi ? 'build/\nsecrets.txt\n*.log' : '(no file yet)'}</div>` +
            `<p class="gtk-h">Folder</p><div class="gt-ig">${rows(ign)}${gi ? `<div class="gt-ig-r${gi === 2 ? '' : ' gt-warn'}"><span>.gitignore</span><span class="gt-tag">${gi === 2 ? 'in a commit' : 'new'}</span></div>` : ''}</div>`;
          Lab.ui.terminal(el, {
            panelTitle: 'Ada’s project',
            predict: {
              q: 'Ada writes a <code>.gitignore</code> that lists <code>build/</code>, <code>secrets.txt</code> and <code>*.log</code>. What does <code>git status</code> list as untracked then?',
              options: ['build/, debug.log and secrets.txt', 'Only .gitignore', 'Nothing at all'],
              a: 1,
              why: 'The three listed files are now skipped. The new <code>.gitignore</code> file itself is untracked until she adds it.',
            },
            frames: [
              { panel: panel(false, 0), say: 'Ada built and ran her program. Three new things appeared in her folder.' },
              { cmd: 'git status', out: 'On branch main\nUntracked files:\n\tbuild/\n\tdebug.log\n\tsecrets.txt\n\nnothing added to commit but untracked files present (use "git add" to track)', say: 'Git offers all three. One careless <code>git add</code> and the secret key is in the history. (A hint line is cut from Git’s answer.)' },
              { panel: panel(true, 1), say: 'In her editor, she creates a file named <code>.gitignore</code> in the project folder, with three lines.' },
              { cmd: 'git status', out: 'On branch main\nUntracked files:\n\t.gitignore\n\nnothing added to commit but untracked files present (use "git add" to track)', say: 'The three files are gone from the list. Only the new <code>.gitignore</code> is left.' },
              { cmd: 'git add secrets.txt', out: 'The following paths are ignored by one of your .gitignore files:\nsecrets.txt\nhint: Use -f if you really want to add them.', say: 'Even asking directly, Git refuses and tells you why. (Two more hint lines are cut.)' },
              { cmd: 'git add .gitignore', say: 'The <code>.gitignore</code> itself should be saved, so the rules travel with the project.' },
              { cmd: 'git commit -m "Ignore build output and secrets"', out: '[main 19c0a81] Ignore build output and secrets\n 1 file changed, 3 insertions(+)\n create mode 100644 .gitignore', panel: panel(true, 2), say: 'Committed, like any other file.' },
              { cmd: 'git status', out: 'On branch main\nnothing to commit, working tree clean', say: 'Clean, even though <code>build/</code>, <code>debug.log</code> and <code>secrets.txt</code> are still in the folder. Git skips them.' },
            ],
          });
        },
        code: `# .gitignore: one pattern per line. Lines starting with # are notes.

# the build folder and everything in it
build/
# this one file
secrets.txt
# every file whose name ends in .log
*.log`,
        remember: 'Secrets and generated files go in .gitignore, and .gitignore goes in a commit.',
        mistakes: [
          { title: 'Writing .gitignore after the secret is saved', bad: `git add secrets.txt
git commit -m "Add key"
# later: secrets.txt goes into .gitignore`, good: `# first: secrets.txt goes into .gitignore
git add .gitignore
git commit -m "Ignore secrets"`, why: '<code>.gitignore</code> only skips files Git isn’t tracking yet. A file that is already in a commit stays in the history, so write the rule before the first <code>git add</code>. If it already happened, treat the key as leaked: get a new one from the service.' },
        ],
        terms: [
          { term: '.gitignore', def: 'A file listing what Git should skip, one pattern per line.' },
          { term: 'pattern', def: 'A line in <code>.gitignore</code> that matches names. <code>*</code> means any text, a trailing <code>/</code> means a folder.' },
          { term: 'generated file', def: 'A file a tool makes, such as compiled output or a log. It can always be made again.' },
          { term: 'secret', def: 'A password or private key. It must never be in a commit.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this <code>.gitignore</code> skip the <code>build</code> folder and every file ending in <code>.log</code>.', code: 'build[[/]]\n[[*]].log', why: 'A trailing <code>/</code> means a folder and everything in it, and <code>*</code> stands for any text.' },
          { type: 'bug', prompt: 'This <code>.gitignore</code> should skip <code>secrets.txt</code>, but <code>git status</code> still lists it. Tap the wrong line.', code: 'build/\nsecret.txt\n*.log', bug: 1, fix: 'secrets.txt', why: 'A plain name must match exactly. The file is <code>secrets.txt</code>, with an s.' },
        ],
        quiz: [
          { q: 'Which of these belongs in <code>.gitignore</code>?', options: ['<code>Main.kt</code>', '<code>secrets.txt</code> with a private key', '<code>.gitignore</code>'], a: 1, why: 'Secrets must never be saved. Your code and the <code>.gitignore</code> itself should be.' },
          { q: 'What does the pattern <code>*.log</code> match?', options: ['Only a file literally named *.log', 'Every file whose name ends in .log', 'Every folder'], a: 1, why: '<code>*</code> stands for any text, so <code>debug.log</code> and <code>run.log</code> both match.' },
          { q: 'Should you commit the <code>.gitignore</code> file?', options: ['Yes, so everyone on the project skips the same files', 'No, it is private to you'], a: 0, why: 'Once it is committed, the rules come with the project.' },
        ],
        docs: [['gitignore', 'https://git-scm.com/docs/gitignore']],
      },

      {
        id: 'branches',
        title: 'Branches',
        tagline: 'Try an idea on its own line while the working version stays safe.',
        goals: ['Explain a branch as a label on a commit', 'Make a branch and move to it with <code>git switch -c</code>', 'Read <code>HEAD</code> to see which branch you are on'],
        level: 'beginner', introduces: ['branch', 'switch', '-c'],
        body: `
<p>Ada wants her program to show a forecast. She isn’t sure her idea will work, and the version on <code>main</code> works today. A <em>branch</em> lets her try the idea on the side. If it goes wrong, <code>main</code> is untouched.</p>
<p>A branch is a label that points to a commit. <code>main</code> is a branch too: the label on Ada’s newest commit. When you commit, the label of the branch you are on moves forward to the new commit. Nothing is copied, so making a branch is instant.</p>
<p><code>HEAD</code> tells you which branch you are on: <code>HEAD -&gt; main</code> means “you are on main”. <code>git branch</code> lists the branches and puts a <code>*</code> next to yours. <code>git switch -c forecast</code> makes a new branch called <code>forecast</code> on the commit you are on and moves you to it (<code>-c</code> stands for create). <code>git switch main</code> takes you back.</p>
<p>When you switch, Git changes the files in your folder to match that branch. A file that exists only on <code>forecast</code> disappears from the folder when you switch to <code>main</code>, and comes back when you switch to <code>forecast</code> again. Commit your work before you switch, so nothing gets mixed up.</p>`,
        visual(el) {
          const G = graph({ lanes: 1, top: 92, minCols: 5, title: 'Commits and branch labels' });
          const base = [
            { id: 'A', p: [], msg: '14d1672 Add greeting' }, { id: 'B', p: ['A'], msg: '7e085e9 Greet Oslo too' },
            { id: 'C', p: ['B'], msg: '27a0a6b Greet Rome' }, { id: 'D', p: ['C'], msg: '19c0a81 Ignore build output and secrets' },
          ];
          const withE = [...base, { id: 'E', p: ['D'], msg: 'f752750 Add forecast', hl: true }];
          const legend = '<div class="gt-legend" style="margin-top:8px"><span><b>circle</b> commit</span><span><b>box</b> branch label</span><span><b>HEAD</b> where you are</span></div>';
          const show = st => n => { n.append(G.el); n.insertAdjacentHTML('beforeend', legend); G.set(st); };
          Lab.ui.terminal(el, {
            panelTitle: 'Commits (oldest on the left)',
            predict: {
              q: 'Ada is on <code>forecast</code> and makes a commit. Where is the <code>main</code> label afterwards?',
              options: ['It moved to the new commit too', 'It stayed on its old commit', 'It was deleted'],
              a: 1,
              why: 'Only the label of the branch you are on moves forward. <code>main</code> stays where it was.',
            },
            frames: [
              { panel: show({ commits: base, refs: [{ name: 'main', at: 'D' }], head: 'main' }), say: 'Ada’s four commits, oldest on the left (letters stand in for the hashes). <code>main</code> is a label on the newest one, and <code>HEAD</code> sits on <code>main</code>.' },
              { cmd: 'git branch', out: '* main', say: 'One branch so far. The <code>*</code> marks the one you are on.' },
              { cmd: 'git switch -c forecast', out: 'Switched to a new branch \'forecast\'', panel: show({ commits: base, refs: [{ name: 'main', at: 'D' }, { name: 'forecast', at: 'D' }], head: 'forecast' }), say: 'A new label on the same commit, and <code>HEAD</code> moves to it. No files were copied or changed.' },
              { cmd: 'git branch', out: '* forecast\n  main', say: 'Two branches now, and Ada is on <code>forecast</code>.' },
              { cmd: 'git add Forecast.kt', say: 'In her editor, Ada writes <code>Forecast.kt</code>, then adds it.' },
              { cmd: 'git commit -m "Add forecast"', out: '[forecast f752750] Add forecast\n 1 file changed, 1 insertion(+)\n create mode 100644 Forecast.kt', panel: show({ commits: withE, refs: [{ name: 'main', at: 'D' }, { name: 'forecast', at: 'E' }], head: 'forecast' }), say: 'The new commit goes on the branch she is on. <code>forecast</code> moves forward with it; <code>main</code> stays put.' },
              { cmd: 'git switch main', out: 'Switched to branch \'main\'', panel: show({ commits: withE, refs: [{ name: 'main', at: 'D' }, { name: 'forecast', at: 'E' }], head: 'main' }), say: '<code>HEAD</code> is back on <code>main</code>, and Git changed the folder to match: <code>Forecast.kt</code> is gone from it. It is safe on <code>forecast</code>.' },
              { cmd: 'git log --oneline', out: esc('19c0a81 (HEAD -> main) Ignore build output and secrets\n27a0a6b Greet Rome\n7e085e9 Greet Oslo too\n14d1672 Add greeting'), say: 'The history of <code>main</code> has no forecast commit. Ada can switch back to <code>forecast</code> whenever she wants to keep working on it.' },
            ],
          });
        },
        code: `git branch                    # * main
git switch -c forecast        # Switched to a new branch 'forecast'
git add Forecast.kt
git commit -m "Add forecast"  # [forecast f752750] Add forecast
git switch main               # Switched to branch 'main'
git log --oneline             # 19c0a81 (HEAD -> main) Ignore build output and secrets
git switch forecast           # back to the forecast work`,
        remember: 'A branch is a label on a commit. git switch -c makes one and moves you to it; HEAD shows where you are.',
        mistakes: [
          { title: 'Switching to a branch that doesn’t exist yet', bad: `git switch map
# fatal: invalid reference: map`, good: `git switch -c map`, why: 'Without <code>-c</code>, <code>git switch</code> only moves to branches that already exist. Add <code>-c</code> to create it.' },
        ],
        terms: [
          { term: 'branch', def: 'A label that points to a commit and moves forward when you commit on it.' },
          { term: 'HEAD', def: 'Marks where you are: <code>HEAD -&gt; main</code> means you are on the branch main.' },
          { term: 'main', def: 'The usual name of a project’s first branch, where the working version lives.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a new branch called <code>map</code> and move to it.', code: 'git [[switch]] [[-c]] map', why: '<code>git switch</code> moves you to a branch, and <code>-c</code> creates it first.' },
          { type: 'bug', prompt: 'Ada wants to go back to <code>main</code>. Git answers <code>fatal: a branch named \'main\' already exists</code>. Tap the wrong line.', code: 'git status\ngit switch -c main\ngit log --oneline', bug: 1, fix: 'git switch main', why: '<code>-c</code> tries to create a new branch. <code>main</code> already exists, so drop <code>-c</code> to move to it.' },
        ],
        quiz: [
          { q: 'What is a branch in Git?', options: ['A full copy of the project folder', 'A label that points to a commit', 'A backup on another computer'], a: 1, why: 'A branch is only a label, which is why making one is instant.' },
          { q: '<code>git branch</code> prints <code>* forecast</code> and <code>main</code>. What does the <code>*</code> mean?', options: ['forecast is the branch you are on', 'forecast has unsaved files', 'forecast is the oldest branch'], a: 0, why: 'The <code>*</code> marks your current branch, the same one <code>HEAD</code> points to.' },
          { q: 'You switch from <code>forecast</code> to <code>main</code>. What happens to <code>Forecast.kt</code>, which exists only on forecast?', options: ['It is deleted for good', 'It leaves the folder, and comes back when you switch to forecast', 'It stays in the folder'], a: 1, why: 'Git makes the folder match the branch you are on. The file is safe in the forecast commit.' },
        ],
        docs: [['Pro Git: Branches in a Nutshell', 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell'], ['git switch', 'https://git-scm.com/docs/git-switch']],
      },

      {
        id: 'merging',
        title: 'Merging',
        tagline: 'Bring the work from one branch into another.',
        goals: ['Bring a finished branch into <code>main</code> with <code>git merge</code>', 'Tell a fast-forward from a merge commit', 'Read what Git prints after a merge'],
        level: 'beginner', introduces: ['merge', '--no-edit'],
        body: `
<p>Ada’s forecast works on its own branch, <code>forecast</code>. Now <code>main</code> should get it too, because <code>main</code> is where the working version lives. Copying files over by hand would lose the history. Git has a command for this: <code>git merge</code>.</p>
<p>First be on the branch that should <em>receive</em> the work, then name the branch to bring in: <code>git switch main</code>, then <code>git merge forecast</code>. If <code>main</code> has no new commits since <code>forecast</code> started, Git slides the <code>main</code> label forward to the last commit of <code>forecast</code>. That is a <em>fast-forward</em>: no new commit is made.</p>
<p>If both branches got new commits, the label can’t slide, because each side has something the other lacks. Git then makes a <em>merge commit</em>: a new commit that combines both sides and has two parents, one on each branch. For its message, Git would open a text editor with one already written, like <code>Merge branch 'units'</code> for a branch named <code>units</code>. Adding <code>--no-edit</code> keeps that message and skips the editor.</p>
<p>A merge changes only the branch you are on. The branch you brought in stays where it was.</p>`,
        visual(el) {
          const g = graph({ lanes: 2, top: 92, title: 'Commits and branch labels' });
          const P = st => node => { node.append(g.el); g.set(st); };
          const line = [
            { id: 'A', p: [], msg: '14d1672 Add greeting' }, { id: 'B', p: ['A'], msg: '7e085e9 Greet Oslo too' }, { id: 'C', p: ['B'], msg: '27a0a6b Greet Rome' },
            { id: 'D', p: ['C'], msg: '19c0a81 Ignore build output and secrets' }, { id: 'E', p: ['D'], msg: 'f752750 Add forecast' },
          ];
          const fork = [
            { id: 'D', p: [], lane: 0, col: 0, msg: '19c0a81 Ignore build output and secrets' }, { id: 'E', p: ['D'], lane: 0, col: 1, msg: 'f752750 Add forecast' },
            { id: 'F', p: ['E'], lane: 1, col: 2, msg: '0602e79 Add units' }, { id: 'G', p: ['E'], lane: 0, col: 2, msg: 'e1f26e7 Add README' },
          ];
          const merged = fork.concat({ id: 'H', p: ['G', 'F'], lane: 0, col: 3, hl: true, msg: "487bc47 Merge branch 'units'" });
          Lab.ui.terminal(el, {
            panelTitle: 'Commits (oldest on the left)',
            predict: {
              q: 'Ada is on <code>main</code>, and <code>main</code> has no new commits since <code>forecast</code> started. What does <code>git merge forecast</code> do?',
              options: ['Makes a new commit that joins both branches', 'Moves the <code>main</code> label forward to the last commit of <code>forecast</code>', 'Moves <code>forecast</code> back to where <code>main</code> is'],
              a: 1,
              why: 'The commit on <code>forecast</code> already sits on top of <code>main</code>, so Git only has to move the label. That is a fast-forward.',
            },
            frames: [
              { panel: P({ commits: line, refs: [{ name: 'main', at: 'D' }, { name: 'forecast', at: 'E' }], head: 'main' }), say: 'Where the last lesson ended: Ada is on <code>main</code>, and <code>forecast</code> is one commit ahead. Letters stand in for the ids.' },
              { cmd: 'git merge forecast', out: 'Updating 19c0a81..f752750\nFast-forward\n Forecast.kt | 1 +\n 1 file changed, 1 insertion(+)\n create mode 100644 Forecast.kt', panel: P({ commits: line, refs: [{ name: 'main', at: 'E' }, { name: 'forecast', at: 'E' }], head: 'main' }), say: '<code>main</code> had nothing new, so Git slid the label forward. <b>Fast-forward</b>: no new commit. Below that, Git lists the files that changed: <code>Forecast.kt</code> is now on <code>main</code>.' },
              { clear: true, panel: P({ commits: fork, refs: [{ name: 'main', at: 'G' }, { name: 'units', at: 'F' }], head: 'main' }), say: 'Next, Ada made a branch <code>units</code> and committed “Add units” on it (F). Back on <code>main</code>, she committed “Add README” (G), which adds <code>README.md</code>, a short text that describes the project. Now both branches have new work.' },
              { cmd: 'git merge --no-edit units', out: "Merge made by the 'ort' strategy.\n Units.kt | 1 +\n 1 file changed, 1 insertion(+)\n create mode 100644 Units.kt", panel: P({ commits: merged, refs: [{ name: 'main', at: 'H' }, { name: 'units', at: 'F' }], head: 'main' }), say: 'The label can’t slide, so Git made a <b>merge commit</b> (H) with two parents, G and F. (<code>ort</code> is the name of the method Git uses to combine files.)' },
              { cmd: 'git log --oneline', out: "487bc47 (HEAD -> main) Merge branch 'units'\ne1f26e7 Add README\n0602e79 (units) Add units\nf752750 (forecast) Add forecast\n19c0a81 Ignore build output and secrets", say: 'The merge commit is on top, with the work of both branches below it (older lines cut). <code>units</code> did not move: a merge changes only the branch you are on.' },
            ],
          });
        },
        code: `git switch main              # be on the branch that receives the work
git merge forecast           # bring in the commits from forecast
# Updating 19c0a81..f752750
# Fast-forward
#  Forecast.kt | 1 +

git merge --no-edit units    # both branches have new commits
# Merge made by the 'ort' strategy.
#  Units.kt | 1 +`,
        remember: 'Be on the branch that receives the work, then git merge the other one: a fast-forward if only one side moved, a merge commit if both did.',
        mistakes: [
          { title: 'Merging in the wrong direction', bad: 'git switch forecast\ngit merge main        # brings main into forecast', good: 'git switch main\ngit merge forecast    # brings forecast into main', why: 'A merge changes the branch you are on. To give <code>main</code> the forecast, be on <code>main</code>.' },
        ],
        terms: [
          { term: 'merge', def: '<code>git merge name</code> brings the commits of branch <code>name</code> into the branch you are on.' },
          { term: 'fast-forward', def: 'A merge where Git only moves the branch label forward, because the branch you are on has no new commits of its own.' },
          { term: 'merge commit', def: 'A commit with two parents that joins two branches. Git makes one when both branches have new commits.' },
          { term: 'parent', def: 'The commit right before a commit. A merge commit has two.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Bring the finished <code>map</code> branch into <code>main</code>.', code: 'git [[switch]] main\ngit [[merge]] map', why: 'Be on the branch that receives the work, then merge the other branch into it.' },
          { type: 'bug', prompt: 'Ada wants <code>main</code> to get the work from <code>units</code>, but Git prints <code>Already up to date.</code> and <code>main</code> doesn’t change. Tap the wrong line.', code: 'git switch units\ngit merge units', bug: 0, fix: 'git switch main', why: 'She was on <code>units</code>, merging it into itself. Be on <code>main</code>, the branch that should receive the work.' },
        ],
        quiz: [
          { q: 'When does <code>git merge</code> do a fast-forward?', options: ['When the branch you are on has no new commits of its own', 'When none of the files changed', 'Every time'], a: 0, why: 'Then the other branch already contains everything, so Git only has to move the label forward.' },
          { q: 'How many parents does a merge commit have?', options: ['One', 'Two', 'None'], a: 1, why: 'It joins two branches, so it points back to the last commit of each.' },
          { q: 'You are on <code>main</code> and run <code>git merge units</code>. Which branch moves?', options: ['<code>main</code>', '<code>units</code>', 'Both'], a: 0, why: 'A merge changes only the branch you are on. <code>units</code> stays where it was.' },
        ],
        docs: [['Pro Git: Basic Branching and Merging', 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging'], ['git merge', 'https://git-scm.com/docs/git-merge']],
      },

      {
        id: 'conflicts',
        title: 'Merge conflicts',
        tagline: 'When both branches changed the same line, Git asks you to decide.',
        goals: ['Spot a conflict in what <code>git merge</code> and <code>git status</code> print', 'Read the conflict markers and write the right result', 'Finish the merge with <code>git add</code> and <code>git commit</code>, or cancel it'],
        level: 'beginner', introduces: ['--abort'],
        body: `
<p>On the <code>greeting</code> branch, Ada changed the Lisbon line of <code>Main.kt</code> to <code>"Welcome to Lisbon!"</code>. Later, on <code>main</code>, she changed the very same line to <code>"Good morning, Lisbon!"</code>. When she merges, which line should win? Git can’t know, so it stops and asks. That pause is a <em>merge conflict</em>. It is normal, and nothing is lost.</p>
<p>Git merges everything it can, then writes both versions of the disputed lines into the file between <em>conflict markers</em>. <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> starts your side (the branch you are on), <code>=======</code> separates the two sides, and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; greeting</code> ends the side being merged in. <code>git status</code> lists each such file as <code>both modified</code>.</p>
<p>To resolve the conflict, open the file in your editor and change those lines into the result you want: one side, the other, or a mix. Delete the three marker lines. Then <code>git add Main.kt</code> tells Git the file is fixed, and <code>git commit -m "Merge greeting"</code> makes the merge commit. Changed your mind? <code>git merge --abort</code> puts everything back the way it was before the merge.</p>`,
        visual(el) {
          const file = (title, rows) => `<p class="gtk-h">${title}</p><div class="gt-cf">` + rows.map(([t, k]) => `<div class="gt-cl${k ? ' gt-' + k : ''}">${esc(t)}</div>`).join('') + '</div>';
          const rest = [['    println("Hello, Oslo!")'], ['    println("Hello, Rome!")'], ['}']];
          const two = file('Main.kt on main', [['fun main() {'], ['    println("Good morning, Lisbon!")', 'ours'], ...rest]) + file('Main.kt on greeting', [['fun main() {'], ['    println("Welcome to Lisbon!")', 'theirs'], ...rest]);
          const marked = file('Main.kt', [['fun main() {'], ['<<<<<<< HEAD', 'mark'], ['    println("Good morning, Lisbon!")', 'ours'], ['=======', 'mark'], ['    println("Welcome to Lisbon!")', 'theirs'], ['>>>>>>> greeting', 'mark'], ...rest]);
          const fixed = file('Main.kt', [['fun main() {'], ['    println("Good morning, welcome to Lisbon!")'], ...rest]);
          Lab.ui.terminal(el, {
            panelTitle: 'The file',
            predict: {
              q: 'Both branches changed the Lisbon line of <code>Main.kt</code>, in different ways. What does <code>git merge greeting</code> do?',
              options: ['Keeps the newest change', 'Keeps the line from <code>main</code>, because you are on it', 'Stops and asks you to choose'],
              a: 2,
              why: 'Git never guesses which line is right. It marks the spot in the file and waits for you.',
            },
            frames: [
              { panel: two, say: 'Ada is on <code>main</code>. The Lisbon line of <code>Main.kt</code> is different on each branch; the other lines are the same.' },
              { cmd: 'git merge greeting', out: 'Auto-merging Main.kt\nCONFLICT (content): Merge conflict in Main.kt\nAutomatic merge failed; fix conflicts and then commit the result.', say: 'Git stops. The <code>CONFLICT</code> line names the file it couldn’t merge.' },
              { cmd: 'git status', out: esc('On branch main\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)\n\nUnmerged paths:\n  (use "git add <file>..." to mark resolution)\n\tboth modified:   Main.kt'), say: '<code>git status</code> says you are in the middle of a merge, lists <code>Main.kt</code> as <code>both modified</code>, and shows the way forward and the way out.' },
              { panel: marked, say: 'Ada opens <code>Main.kt</code>. Above <code>=======</code> is her side, <code>HEAD</code>. Below it is the side from <code>greeting</code>.' },
              { panel: fixed, say: 'She writes the line she wants, a mix of both, deletes all three marker lines, and saves the file.' },
              { cmd: 'git add Main.kt', say: '<code>git add</code> tells Git this file is resolved. It prints nothing.' },
              { cmd: 'git status', out: 'On branch main\nAll conflicts fixed but you are still merging.\n  (use "git commit" to conclude merge)\n\nChanges to be committed:\n\tmodified:   Main.kt', say: 'No conflicts left. One step remains: the commit.' },
              { cmd: 'git commit -m "Merge greeting"', out: '[main 5f1cfaa] Merge greeting', say: 'The merge commit is made, with two parents like any merge. Conflict resolved.' },
            ],
          });
        },
        code: `git merge greeting
# CONFLICT (content): Merge conflict in Main.kt
# Automatic merge failed; fix conflicts and then commit the result.

git status                       # Main.kt is listed as "both modified"
# open Main.kt, write the line you want, delete the marker lines
git add Main.kt                  # mark the file as fixed
git commit -m "Merge greeting"   # finish the merge

git merge --abort                # or: cancel, back to before the merge`,
        remember: 'Conflict: edit the file to the result you want, delete the markers, git add it, git commit. git merge --abort cancels.',
        mistakes: [
          { title: 'Leaving the markers in', bad: 'fun main() {\n<<<<<<< HEAD\n    println("Good morning, Lisbon!")\n=======\n    println("Welcome to Lisbon!")\n>>>>>>> greeting\n    println("Hello, Oslo!")\n    println("Hello, Rome!")\n}', good: 'fun main() {\n    println("Good morning, welcome to Lisbon!")\n    println("Hello, Oslo!")\n    println("Hello, Rome!")\n}', why: '<code>git add</code> doesn’t look inside the file. If the marker lines stay, the code no longer compiles. Delete all three before you add.' },
        ],
        terms: [
          { term: 'merge conflict', def: 'Both branches changed the same lines in different ways. Git stops the merge and asks you to choose.' },
          { term: 'conflict markers', def: 'The lines <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> that Git writes around the two versions.' },
          { term: 'resolve', def: 'Edit the file into its final form, remove the markers, and <code>git add</code> it.' },
          { term: '--abort', def: '<code>git merge --abort</code> cancels a merge that stopped, and puts your files back as they were.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'You fixed <code>Main.kt</code> and deleted the markers. Finish the merge.', code: 'git [[add]] Main.kt\ngit [[commit]] -m "Merge greeting"', why: '<code>git add</code> marks the file as resolved; <code>git commit</code> makes the merge commit.' },
          { type: 'bug', prompt: 'Ada fixed <code>Main.kt</code>, but the last line fails with <code>error: Committing is not possible because you have unmerged files.</code> Tap the wrong line.', code: 'git merge greeting\n# fix Main.kt and delete the markers\ngit status\ngit commit -m "Merge greeting"', bug: 2, fix: 'git add Main.kt', why: 'Git waits until you <code>git add</code> the file to know the conflict is resolved. Looking at the status doesn’t tell it that.' },
        ],
        quiz: [
          { q: 'What sits between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code>?', options: ['The version from the branch you are on', 'The version from the branch being merged in', 'The version from before both changes'], a: 0, why: '<code>HEAD</code> is where you are. The side being merged in comes after <code>=======</code>.' },
          { q: 'You edited the conflicted file into its final form. Which step tells Git it is fixed?', options: ['<code>git add Main.kt</code>', '<code>git status</code>', 'Saving the file'], a: 0, why: 'Saving changes the file, but Git keeps it marked as conflicted until you <code>git add</code> it.' },
          { q: 'The conflict is too big to fix right now. What gets you back to before the merge?', options: ['<code>git merge --abort</code>', 'Deleting <code>Main.kt</code>', '<code>git commit</code>'], a: 0, why: '<code>--abort</code> cancels the merge and puts your files back as they were.' },
        ],
        docs: [['Pro Git: Basic Merge Conflicts', 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts'], ['Resolving a merge conflict using the command line', 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line']],
      },

      {
        id: 'remotes',
        title: 'Working with GitHub',
        tagline: 'Keep a copy of your repository online, and stay in sync with it.',
        goals: ['Put a repository on GitHub with <code>git remote add</code> and <code>git push</code>', 'Copy a repository from GitHub with <code>git clone</code>', 'Bring in other people’s commits with <code>git fetch</code> and <code>git pull</code>'],
        level: 'beginner', introduces: ['remote', 'origin', 'push', '-u', 'clone', 'fetch', 'pull'], ignore: ['rebase'],
        body: `
<p>So far Ada’s repository lives in one folder on one laptop. If the laptop breaks, the history is gone, and Sam can’t work on the project with her. <em>GitHub</em> is a website that keeps copies of Git repositories online. A copy of your repository somewhere else is called a <em>remote</em>.</p>
<p>To start, sign in on github.com, open the <b>+</b> menu at the top right, choose <b>New repository</b>, type a name, leave all boxes unchecked so the repository starts empty, and click <b>Create repository</b>. GitHub then shows the repository’s address, like <code>https://github.com/ada/weather.git</code>. In your project folder, <code>git remote add origin</code> followed by that address saves it under the short name <code>origin</code>, the usual name for your main remote.</p>
<p><code>git push -u origin main</code> uploads the commits of <code>main</code>. The <code>-u</code> makes Git remember where <code>main</code> goes, so next time <code>git push</code> is enough. The first time, Git asks you to sign in to GitHub. Your GitHub password won’t work here; use the browser sign-in Git offers, or a personal access token (see GitHub’s guide below).</p>
<p>Three commands go the other way. <code>git clone</code> followed by an address copies a whole repository from GitHub into a new folder, with <code>origin</code> already set: that is how Sam gets the project. (So that Sam can push too, Ada added Sam under <b>Settings → Collaborators</b> on the repository’s page.) <code>git fetch</code> downloads new commits but leaves your files and your <code>main</code> alone; Git shows where GitHub’s <code>main</code> is with the label <code>origin/main</code>. <code>git pull</code> fetches, then merges those commits into your branch, so your files catch up. It merges because of the <code>pull.rebase false</code> setting from Starting a repository.</p>`,
        visual(el) {
          const g = graph({ lanes: 1, top: 92, title: 'Commits on Ada’s laptop' });
          const P = st => node => { node.append(g.el); g.set(st); };
          const two = [{ id: 'J', p: [], col: 0, msg: 'c60af31 Say good morning' }, { id: 'K', p: ['J'], col: 1, msg: '5f1cfaa Merge greeting' }];
          const ghost = two.concat({ id: 'L', p: ['K'], col: 3, ghost: true, msg: 'de94841 Greet Paris (only on GitHub)' });
          const three = two.concat({ id: 'L', p: ['K'], col: 3, hl: true, msg: 'de94841 Greet Paris' });
          const url = 'https://github.com/ada/weather.git';
          Lab.ui.terminal(el, {
            panelTitle: 'Commits (newest on the right)',
            predict: {
              q: 'Sam pushed a new commit to GitHub. Ada runs <code>git fetch</code>. What changes on her laptop?',
              options: ['Her files change to include Sam’s work', 'Git downloads the commit, but her <code>main</code> and her files stay the same', 'Nothing: fetch only checks whether there is news'],
              a: 1,
              why: '<code>fetch</code> only downloads. It moves <code>origin/main</code>, Git’s note of where GitHub’s <code>main</code> is. <code>pull</code> is what updates your branch.',
            },
            frames: [
              { panel: P({ commits: two, refs: [{ name: 'main', at: 'K' }], head: 'main' }), say: 'Ada’s newest commits (older ones are off to the left). They exist only on her laptop. On github.com she has created an empty repository called <code>weather</code>.' },
              { cmd: `git remote add origin ${url}`, say: 'Nothing printed and nothing uploaded yet. Git saved the address under the name <code>origin</code>.' },
              { cmd: 'git push -u origin main', out: `To ${url}\n * [new branch]      main -> main\nbranch 'main' set up to track 'origin/main'.`, panel: P({ commits: two, refs: [{ name: 'main', at: 'K' }, { name: 'origin/main', at: 'K', remote: true }], head: 'main' }), say: 'Uploaded, all commits of <code>main</code>. The new label <code>origin/main</code> shows where <code>main</code> is on GitHub. (Git first prints a few progress lines; they are cut here.)' },
              { panel: P({ commits: ghost, refs: [{ name: 'main', at: 'K' }, { name: 'origin/main', at: 'K', remote: true }], head: 'main' }), say: 'Meanwhile Sam cloned the repository, committed “Greet Paris” and pushed it. GitHub now has that commit (dashed); Ada’s laptop doesn’t know yet.' },
              { cmd: 'git fetch', out: 'From https://github.com/ada/weather\n   5f1cfaa..de94841  main       -> origin/main', panel: P({ commits: three, refs: [{ name: 'main', at: 'K' }, { name: 'origin/main', at: 'L', remote: true }], head: 'main' }), say: '<code>fetch</code> downloads Sam’s commit and moves <code>origin/main</code> to it. Ada’s <code>main</code> and her files stay the same.' },
              { cmd: 'git status', out: 'On branch main\nYour branch is behind \'origin/main\' by 1 commit, and can be fast-forwarded.\n  (use "git pull" to update your local branch)\n\nnothing to commit, working tree clean', say: '<code>git status</code> compares <code>main</code> with <code>origin/main</code>: one commit behind.' },
              { cmd: 'git pull', out: 'Updating 5f1cfaa..de94841\nFast-forward\n Main.kt | 1 +\n 1 file changed, 1 insertion(+)', panel: P({ commits: three, refs: [{ name: 'main', at: 'L' }, { name: 'origin/main', at: 'L', remote: true }], head: 'main' }), say: '<code>pull</code> is fetch plus merge. Here the merge is a fast-forward, and <code>Main.kt</code> now greets Paris too.' },
            ],
          });
        },
        code: `# put a project on GitHub (after creating an empty repository there)
git remote add origin https://github.com/ada/weather.git
git push -u origin main     # first time; afterwards: git push

# copy a repository from GitHub into a new folder
git clone https://github.com/ada/weather.git
# Cloning into 'weather'...

# stay up to date
git fetch                   # download only: moves origin/main
git pull                    # download and merge into your branch`,
        remember: 'push uploads your commits; clone copies a whole repository; fetch downloads; pull downloads and merges.',
        mistakes: [
          { title: 'Pushing when GitHub has newer commits', bad: 'git push\n#  ! [rejected]        main -> main (fetch first)\n# error: failed to push some refs to \'https://github.com/ada/weather.git\'', good: 'git fetch\ngit merge --no-edit origin/main\ngit push', why: 'Sam pushed while you were working, so GitHub has a commit you don’t have, and Git won’t overwrite it. Download it, merge it into your branch (a merge commit, since both sides moved), then push.' },
        ],
        terms: [
          { term: 'remote, origin', def: 'A copy of your repository somewhere else, such as GitHub. <code>origin</code> is the usual name for your main one.' },
          { term: 'push', def: '<code>git push</code> uploads your new commits to the remote.' },
          { term: 'clone', def: '<code>git clone</code> copies a whole repository from a remote into a new folder.' },
          { term: 'fetch, pull', def: '<code>git fetch</code> downloads new commits without touching your files. <code>git pull</code> fetches, then merges them into your branch.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Upload <code>main</code> to GitHub for the first time, so plain <code>git push</code> works afterwards.', code: 'git remote add origin https://github.com/ada/weather.git\ngit [[push]] [[-u]] origin main', why: '<code>-u</code> makes Git remember that <code>main</code> goes to <code>origin</code>.' },
          { type: 'bug', prompt: 'Ada created an empty repository on GitHub and wants to upload her commits. The middle line prints an error, and the push fails with <code>fatal: \'origin\' does not appear to be a git repository</code>. Tap the wrong line.', code: 'git commit -m "Add greeting"\ngit remote origin https://github.com/ada/weather.git\ngit push -u origin main', bug: 1, fix: 'git remote add origin https://github.com/ada/weather.git', why: 'The word <code>add</code> is missing, so no remote was saved and Git doesn’t know what <code>origin</code> is. <code>git remote add origin</code> saves the address first; then the push knows where to go.' },
        ],
        quiz: [
          { q: 'What does <code>git push</code> do?', options: ['Uploads your new commits to the remote', 'Downloads commits from the remote', 'Saves a snapshot on your laptop'], a: 0, why: 'Push sends your commits up. Fetch and pull bring commits down; commit saves a snapshot.' },
          { q: 'What is <code>origin</code>?', options: ['A short name for the remote’s address', 'The first commit', 'A branch on your laptop'], a: 0, why: '<code>git remote add origin</code> saved the GitHub address under that name.' },
          { q: 'Which command updates your files with commits from GitHub?', options: ['<code>git pull</code>', '<code>git fetch</code>', '<code>git push</code>'], a: 0, why: '<code>pull</code> downloads and merges. <code>fetch</code> only downloads.' },
        ],
        docs: [['About remote repositories', 'https://docs.github.com/en/get-started/git-basics/about-remote-repositories'], ['Pro Git: Working with Remotes', 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes']],
      },

      {
        id: 'pull-requests',
        title: 'Pull requests and review',
        tagline: 'Ask your team to look at a branch before it joins main.',
        goals: ['Open a pull request on GitHub from a branch you pushed', 'Review one: comment, approve or request changes', 'Merge it on GitHub and bring the result to your laptop'],
        level: 'beginner', introduces: [],
        body: `
<p>Merging straight into <code>main</code> works when you are alone. In a team, a second pair of eyes catches the typo or the bug before everyone gets it. A <em>pull request</em> (often called a PR) is a page on GitHub that says: “Here is my branch. Please look at it, then merge it into <code>main</code>.”</p>
<p>Push your branch with <code>git push -u origin wind</code>. On the repository’s page, GitHub then shows a yellow banner with a <b>Compare &amp; pull request</b> button. Click it, check that <b>base</b> is <code>main</code> and <b>compare</b> is your branch, write a title and a short description of what changed and why, and click <b>Create pull request</b>.</p>
<p>A teammate opens the <b>Files changed</b> tab to see every changed line, and can comment on any line. A <em>review</em> ends with <b>Review changes</b> (or <b>Submit review</b>) and one of three choices: <b>Comment</b>, <b>Approve</b> or <b>Request changes</b>. To fix something, commit on the same branch and <code>git push</code> again; the new commit shows up in the same pull request.</p>
<p>Once it is approved, click <b>Merge pull request</b>, then <b>Confirm merge</b>. GitHub makes a merge commit on <code>main</code>, and offers a <b>Delete branch</b> button for the finished branch. Back on your laptop, <code>git switch main</code> and <code>git pull</code> bring the result down.</p>`,
        visual(el) {
          const STEPS = ['Push', 'Open', 'Review', 'Merge'];
          const pr = ({ at, badge = '', tone = '', note = '', commits = 1, merged = false, dot = '' }) =>
            '<div class="gt-pipe">' + STEPS.map((s, k) => `<span class="gt-stp${k < at || merged ? ' gt-done' : k === at ? ' gt-now' : ''}">${s}</span>`).join('') + '</div>' +
            (!badge ? '' : `<div class="gt-pr${merged ? ' gt-merged' : ''}" style="margin-top:8px"><div class="gt-pr-t">Add wind #1</div>` +
              `<div class="gt-pr-m">ada ${merged ? 'merged' : 'wants to merge'} ${commits} commit${commits > 1 ? 's' : ''} into main from wind</div>` +
              `<span class="gt-badge${tone ? ' gt-b-' + tone : ''}">${badge}</span>` +
              (note ? `<div class="gt-chk"><span class="gt-dot${dot ? ' gt-' + dot : ''}"></span><span>${note}</span></div>` : '') + '</div>');
          const url = 'https://github.com/ada/weather.git';
          Lab.ui.terminal(el, {
            panelTitle: 'On github.com',
            predict: {
              q: 'Sam asked for a change in Ada’s pull request. Ada fixes it and runs <code>git push</code> on the same branch. What happens on GitHub?',
              options: ['The new commit appears in the same pull request', 'GitHub opens a second pull request', 'The push is refused until the pull request is closed'],
              a: 0,
              why: 'A pull request follows its branch. Every commit you push to that branch shows up in it.',
            },
            frames: [
              { cmd: 'git push -u origin wind', out: `remote: \nremote: Create a pull request for 'wind' on GitHub by visiting:\nremote:      https://github.com/ada/weather/pull/new/wind\nremote: \nTo ${url}\n * [new branch]      wind -> wind\nbranch 'wind' set up to track 'origin/wind'.`, panel: pr({ at: 1 }), say: 'Ada made a branch <code>wind</code> with one commit, “Add wind”, and pushes it. Lines starting with <code>remote:</code> come from GitHub: it even prints a link for opening a pull request.' },
              { panel: pr({ at: 2, badge: 'Open', tone: 'ok' }), say: 'On github.com she clicks <b>Compare &amp; pull request</b>, writes a title and a description, and clicks <b>Create pull request</b>.' },
              { panel: pr({ at: 2, badge: 'Changes requested', tone: 'err', note: 'Sam on Wind.kt line 1: “wnid” should be “wind”.', dot: 'fail' }), say: 'Sam opens <b>Files changed</b>, comments on the line, and submits the review with <b>Request changes</b>.' },
              { cmd: 'git commit -m "Fix typo"', out: '[wind 6385369] Fix typo\n 1 file changed, 1 insertion(+), 1 deletion(-)', say: 'Ada fixes the word in <code>Wind.kt</code>, runs <code>git add Wind.kt</code>, and commits on the same branch.' },
              { cmd: 'git push', out: `To ${url}\n   0c62d7c..6385369  wind -> wind`, panel: pr({ at: 2, badge: 'Open', tone: 'ok', commits: 2, note: 'New commit: Fix typo', dot: 'run' }), say: 'No new pull request needed. The commit shows up in the same one, and Sam looks again.' },
              { panel: pr({ at: 4, badge: 'Merged', tone: 'ok', commits: 2, merged: true, note: 'Sam approved these changes', dot: 'pass' }), say: 'Sam submits <b>Approve</b>. Ada clicks <b>Merge pull request</b>, then <b>Confirm merge</b>. GitHub makes a merge commit on its copy of <code>main</code>.' },
              { cmd: 'git switch main', out: "Switched to branch 'main'\nYour branch is up to date with 'origin/main'.", say: '“Up to date” means: up to date with what Git last downloaded. GitHub’s <code>main</code> has moved since.' },
              { cmd: 'git pull', out: 'From https://github.com/ada/weather\n   de94841..8d4aaf5  main       -> origin/main\nUpdating de94841..8d4aaf5\nFast-forward\n Wind.kt | 1 +\n 1 file changed, 1 insertion(+)\n create mode 100644 Wind.kt', say: 'Pulling brings the merged work, with GitHub’s merge commit <code>Merge pull request #1 from ada/wind</code>, onto Ada’s laptop.' },
            ],
          });
        },
        code: `git switch -c wind
# ...edit, git add, git commit...
git push -u origin wind
# on github.com: Compare & pull request, then Create pull request

# a reviewer asked for a change: fix it on the same branch
git add Wind.kt
git commit -m "Fix typo"
git push                       # appears in the same pull request

# after Merge pull request and Confirm merge on github.com
git switch main
git pull`,
        remember: 'Push a branch, open a pull request, fix review comments with more commits on that branch, merge on GitHub, then pull main.',
        terms: [
          { term: 'pull request', def: 'A page on GitHub that asks for a branch to be reviewed and merged into another branch, usually <code>main</code>.' },
          { term: 'review', def: 'A teammate reads the changes, comments, and then chooses Comment, Approve or Request changes.' },
          { term: 'base, compare', def: 'In a pull request, <b>base</b> is the branch that receives the work (<code>main</code>); <b>compare</b> is your branch.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A reviewer asked for a change, and you fixed <code>Wind.kt</code>. Update the pull request.', code: 'git add Wind.kt\ngit commit -m "Say breeze"\ngit [[push]]', why: 'Pushing to the same branch adds the commit to the pull request that is already open.' },
          { type: 'bug', prompt: 'The pull request was merged on GitHub, but Ada’s <code>main</code> still has no <code>Wind.kt</code>. Tap the wrong line.', code: 'git switch main\ngit fetch\ngit log --oneline', bug: 1, fix: 'git pull', why: 'The merge happened on GitHub. <code>git pull</code> downloads it and updates your <code>main</code> and your files; <code>fetch</code> only downloads.' },
        ],
        quiz: [
          { q: 'What is a pull request?', options: ['A request on GitHub to review a branch and merge it', 'A command that downloads commits', 'A copy of a repository'], a: 0, why: 'It is a page on GitHub around your branch. <code>git pull</code> is a different thing, despite the name.' },
          { q: 'A reviewer chose <b>Request changes</b>. What do you do?', options: ['Commit the fix on the same branch and push', 'Open a new pull request', 'Merge anyway'], a: 0, why: 'The pull request follows its branch, so new commits appear in it.' },
          { q: 'The pull request was merged on github.com. How does your laptop get it?', options: ['<code>git switch main</code>, then <code>git pull</code>', 'It arrives on its own', '<code>git push</code>'], a: 0, why: 'Your laptop changes only when you download. Pull brings GitHub’s new <code>main</code> into yours.' },
        ],
        docs: [['Creating a pull request', 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request'], ['Reviewing proposed changes in a pull request', 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request']],
      },

      {
        id: 'rebase',
        title: 'Rebase',
        tagline: 'Move your branch to the end of main, for a straight history.',
        goals: ['Replay your branch on top of <code>main</code> with <code>git rebase</code>', 'Compare a rebased history with a merged one', 'Know when not to rebase: commits others already have'],
        level: 'intermediate', introduces: ['rebase', '--continue'],
        body: `
<p>While Ada worked on her branch <code>rain</code>, Sam added “Greet Berlin” to <code>main</code>. A merge would work, but it adds a merge commit, and with every branch the history gets another side loop. Many teams prefer one straight line. <code>git rebase</code> gives you that.</p>
<p>On your branch, <code>git rebase main</code> takes the commits that are only on your branch, sets them aside, moves your branch to the end of <code>main</code>, then makes each commit again, one by one, on top. It is as if you had started your work today. First get the newest <code>main</code>: <code>git switch main</code> and <code>git pull</code>, then <code>git switch rain</code> and <code>git rebase main</code>. Afterwards, <code>main</code> can take your work with a fast-forward. If a replayed commit conflicts, fix the file as in Merge conflicts, <code>git add</code> it, then run <code>git rebase --continue</code> (or <code>git rebase --abort</code> to cancel).</p>
<p>The catch: replayed commits are <em>new</em> commits, with new ids. The old ones are left behind. That is fine while the commits are only on your laptop. But if you already pushed them, GitHub and your teammates still have the old ones, and your next <code>git push</code> is refused. The rule: rebase only commits nobody else has. For branches you share, merge.</p>`,
        visual(el) {
          const g = graph({ lanes: 2, top: 92, title: 'Commits and branch labels' });
          const P = st => node => { node.append(g.el); g.set(st); };
          const base = [{ id: 'O', p: [], lane: 0, col: 0, msg: '8d4aaf5 Merge pull request #1 from ada/wind' }, { id: 'Q', p: ['O'], lane: 0, col: 1, msg: '106e565 Greet Berlin' }];
          const before = base.concat({ id: 'P', p: ['O'], lane: 1, col: 1, msg: 'a5967b8 Add rain' });
          const after = base.concat({ id: 'P', p: ['O'], lane: 1, col: 1, ghost: true, msg: 'a5967b8 Add rain (old)' }, { id: 'P2', label: 'P′', p: ['Q'], lane: 0, col: 2, hl: true, msg: '6c5533b Add rain (replayed)' });
          const pushed = base.concat({ id: 'P', p: ['O'], lane: 1, col: 1, msg: 'a5967b8 Add rain (old, on GitHub)' }, { id: 'P2', label: 'P′', p: ['Q'], lane: 0, col: 2, hl: true, msg: '6c5533b Add rain (replayed)' });
          Lab.ui.terminal(el, {
            panelTitle: 'Commits (oldest on the left)',
            predict: {
              q: 'Ada is on <code>rain</code> and runs <code>git rebase main</code>. What happens to her commit “Add rain”?',
              options: ['It moves on top of <code>main</code> and keeps its id', 'It is made again on top of <code>main</code>, with a new id', 'It is merged into <code>main</code>'],
              a: 1,
              why: 'Rebase replays each commit as a new one. Same change, new parent, so a new id. <code>main</code> itself doesn’t move.',
            },
            frames: [
              { panel: P({ commits: before, refs: [{ name: 'main', at: 'Q' }, { name: 'rain', at: 'P' }], head: 'rain' }), say: 'Ada is on <code>rain</code> with one commit, “Add rain” (P). Since it started, <code>main</code> got Sam’s “Greet Berlin” (Q), which Ada has pulled.' },
              { cmd: 'git log --oneline', out: 'a5967b8 (HEAD -> rain) Add rain\n8d4aaf5 Merge pull request #1 from ada/wind', say: 'Note the id of her commit: <code>a5967b8</code>. (Older lines cut.)' },
              { cmd: 'git rebase main', out: 'Successfully rebased and updated refs/heads/rain.', panel: P({ commits: after, refs: [{ name: 'main', at: 'Q' }, { name: 'rain', at: 'P2' }], head: 'rain' }), say: 'Git replayed “Add rain” on top of <code>main</code>: the same change in a new commit, P′. The old P (dashed) is left behind. <code>refs/heads/rain</code> is Git’s full name for the branch <code>rain</code>.' },
              { cmd: 'git log --oneline', out: '6c5533b (HEAD -> rain) Add rain\n106e565 (origin/main, main) Greet Berlin\n8d4aaf5 Merge pull request #1 from ada/wind', say: 'One straight line. Her commit has a new id: <code>6c5533b</code>, not <code>a5967b8</code>.' },
              { cmd: 'git switch main', out: "Switched to branch 'main'\nYour branch is up to date with 'origin/main'.", panel: P({ commits: after, refs: [{ name: 'main', at: 'Q' }, { name: 'rain', at: 'P2' }], head: 'main' }), say: 'Now bring the work into <code>main</code> as usual.' },
              { cmd: 'git merge rain', out: 'Updating 106e565..6c5533b\nFast-forward\n Rain.kt | 1 +\n 1 file changed, 1 insertion(+)\n create mode 100644 Rain.kt', panel: P({ commits: after, refs: [{ name: 'main', at: 'P2' }, { name: 'rain', at: 'P2' }], head: 'main' }), say: 'A fast-forward: no merge commit, and the history stays straight.' },
              { clear: true, panel: P({ commits: pushed, refs: [{ name: 'main', at: 'Q' }, { name: 'rain', at: 'P2' }, { name: 'origin/rain', at: 'P', remote: true }], head: 'rain' }), say: 'Now picture another day: Ada had pushed <code>rain</code> before rebasing. GitHub still has the old commit P, shown by <code>origin/rain</code>.' },
              { cmd: 'git push', out: "To https://github.com/ada/weather.git\n ! [rejected]        rain -> rain (non-fast-forward)\nerror: failed to push some refs to 'https://github.com/ada/weather.git'\nhint: Updates were rejected because the tip of your current branch is behind\nhint: its remote counterpart. If you want to integrate the remote changes,\nhint: use 'git pull' before pushing again.", say: 'Refused. P′ doesn’t follow from P, and anyone who pulled P has the same mismatch. Don’t follow Git’s <code>git pull</code> hint here: it would merge the old P back in next to P′. That is why you rebase only commits nobody else has.' },
            ],
          });
        },
        code: `git switch main
git pull                 # get the newest main first
git switch rain
git rebase main          # replay my commits on top of main
# Successfully rebased and updated refs/heads/rain.

git switch main
git merge rain           # a fast-forward: history stays straight`,
        remember: 'git rebase main replays your branch on top of main as new commits. Rebase only commits nobody else has.',
        mistakes: [
          { title: 'Rebasing the shared branch', bad: 'git switch main\ngit rebase rain       # gives main’s shared commits new ids', good: 'git switch rain\ngit rebase main       # only your own commits get new ids', why: 'Rebase rewrites the branch you are on. Rebase your own branch onto <code>main</code>, never <code>main</code> itself.' },
        ],
        terms: [
          { term: 'rebase', def: '<code>git rebase main</code> replays the commits of your branch, one by one, on top of <code>main</code>.' },
          { term: 'replayed commit', def: 'A copy of a commit made by rebase: the same change on a new parent, so it gets a new id.' },
          { term: 'shared branch', def: 'A branch that is on GitHub and that others may have pulled, like <code>main</code>. Don’t rebase its commits.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put your branch <code>map</code> on top of the newest <code>main</code>, keeping the history straight.', code: 'git switch map\ngit [[rebase]] [[main]]', why: 'Be on your own branch, then rebase it onto <code>main</code>.' },
          { type: 'bug', prompt: 'Ada is on <code>rain</code> and wants it on top of the newest <code>main</code>, but Git prints <code>Current branch rain is up to date.</code> and nothing moves. Tap the wrong line.', code: 'git switch rain\ngit rebase rain', bug: 1, fix: 'git rebase main', why: 'Name the branch to move onto, <code>main</code>. Rebasing <code>rain</code> onto itself does nothing.' },
        ],
        quiz: [
          { q: 'What is different about your commits after a rebase?', options: ['They have new ids', 'They lose their messages', 'They are uploaded to GitHub'], a: 0, why: 'Rebase makes each commit again on a new parent, so each gets a new id.' },
          { q: 'Which branch is safe to rebase?', options: ['Your own branch that nobody else has pulled', '<code>main</code>, which the whole team uses', 'Any branch, at any time'], a: 0, why: 'Rebase replaces commits. Only do that with commits nobody else has.' },
          { q: 'You rebased <code>rain</code> onto <code>main</code>. On <code>main</code>, what does <code>git merge rain</code> make?', options: ['A fast-forward', 'A merge commit', 'A conflict'], a: 0, why: '<code>rain</code> now starts at the end of <code>main</code>, so Git only moves the label.' },
        ],
        docs: [['Pro Git: Rebasing', 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing'], ['git rebase', 'https://git-scm.com/docs/git-rebase']],
      },

      {
        id: 'undo',
        title: 'Undoing things',
        tagline: 'Throw away an edit, take back a commit, or cancel one that is already shared.',
        goals: ['Throw away changes you haven’t committed with <code>git restore</code>', 'Take back your last commit with <code>git reset HEAD~1</code>', 'Undo a pushed commit safely with <code>git revert</code>'],
        level: 'beginner', introduces: ['restore', '--staged', 'reset', 'HEAD~1', 'revert'],
        body: `
<p>Everyone makes changes they regret: an experiment that broke the program, a commit with a forgotten debug line, a pushed change that turned out wrong. Git can undo each of these. The right command depends on how far the change has gone.</p>
<p><b>Not committed yet?</b> <code>git restore Main.kt</code> throws away your edits and puts the file back the way it was when you last added or committed it. Those edits are gone for good, so be sure. If you only staged a file by mistake, <code>git restore --staged Main.kt</code> takes it out of the staging area and keeps your edits. <code>git status</code> suggests these commands in brackets.</p>
<p><b>Committed, but not pushed?</b> <code>git reset HEAD~1</code> moves your branch back one commit. <code>HEAD~1</code> means “one commit before <code>HEAD</code>”. The commit leaves the history, but its changes stay in your files, so you can fix them and commit again.</p>
<p><b>Already pushed?</b> Don’t take away commits that others may have; that is the same problem as with rebase. <code>git revert</code> followed by a commit id makes a <em>new</em> commit that does the opposite of that one. History only grows, so a normal push works. Add <code>--no-edit</code> to keep Git’s ready-made message.</p>`,
        visual(el) {
          const g = graph({ lanes: 1, top: 92, title: 'Commits and branch labels' });
          const P = st => node => { node.append(g.el); g.set(st); };
          const two = [{ id: 'Q', p: [], col: 0, msg: '106e565 Greet Berlin' }, { id: 'P2', label: 'P′', p: ['Q'], col: 1, msg: '6c5533b Add rain' }];
          const extra = two.concat({ id: 'S', p: ['P2'], col: 3, msg: '62b9961 Add debug line' });
          const gone = two.concat({ id: 'S', p: ['P2'], col: 3, ghost: true, msg: '62b9961 Add debug line (taken back)' });
          const later = two.concat({ id: 'T', p: ['P2'], col: 3, hl: true, msg: '4a7b8ed Use Fahrenheit' });
          const reverted = later.concat({ id: 'U', p: ['T'], col: 5, msg: 'f756d57 Revert "Use Fahrenheit"' });
          Lab.ui.terminal(el, {
            panelTitle: 'Commits (newest on the right)',
            predict: {
              q: 'Ada runs <code>git reset HEAD~1</code> right after a commit she hasn’t pushed. What happens to the change in that commit?',
              options: ['It is deleted', 'It stays in her files, no longer committed', 'It moves to a new branch'],
              a: 1,
              why: 'The branch moves back one commit, but the files keep the change, so she can fix it and commit again.',
            },
            frames: [
              { cmd: 'git status', out: esc('On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   Main.kt'), panel: P({ commits: two, refs: [{ name: 'main', at: 'P2' }, { name: 'origin/main', at: 'P2', remote: true }], head: 'main' }), say: 'Ada tried an idea in <code>Main.kt</code>, and now the program doesn’t compile. Nothing is committed. <code>git status</code> even suggests the fix.' },
              { cmd: 'git restore Main.kt', say: 'Nothing printed. <code>Main.kt</code> is back the way it was when she last committed it, and the edits are gone.' },
              { cmd: 'git log --oneline', out: '62b9961 (HEAD -> main) Add debug line\n6c5533b (origin/main, rain) Add rain\n106e565 Greet Berlin', panel: P({ commits: extra, refs: [{ name: 'main', at: 'S' }, { name: 'origin/main', at: 'P2', remote: true }], head: 'main' }), say: 'Next mistake: she committed a debug line, a <code>println</code> she only added to check something. It isn’t pushed: <code>origin/main</code> is one commit behind. (Older lines cut.)' },
              { cmd: 'git reset HEAD~1', out: 'Unstaged changes after reset:\nM\tMain.kt', panel: P({ commits: gone, refs: [{ name: 'main', at: 'P2' }, { name: 'origin/main', at: 'P2', remote: true }], head: 'main' }), say: '<code>main</code> moves back one commit. The commit is out of the history, but its change is still in <code>Main.kt</code> (<code>M</code> means modified). She removes the line in her editor.' },
              { clear: true, panel: P({ commits: later, refs: [{ name: 'main', at: 'T' }, { name: 'origin/main', at: 'T', remote: true }], head: 'main' }), say: 'Later: she committed “Use Fahrenheit” (T) and pushed it. Then the team decided to stay with Celsius. Taking T away would break everyone else’s copy.' },
              { cmd: 'git revert --no-edit 4a7b8ed', out: '[main f756d57] Revert "Use Fahrenheit"\n 1 file changed, 1 insertion(+), 1 deletion(-)', panel: P({ commits: reverted, refs: [{ name: 'main', at: 'U' }, { name: 'origin/main', at: 'T', remote: true }], head: 'main' }), say: 'Revert adds a new commit (U) that does the opposite of T: <code>Units.kt</code> says Celsius again. Nothing is taken away. (One line with the date is cut.)' },
              { cmd: 'git push', out: 'To https://github.com/ada/weather.git\n   4a7b8ed..f756d57  main -> main', panel: P({ commits: reverted, refs: [{ name: 'main', at: 'U' }, { name: 'origin/main', at: 'U', remote: true }], head: 'main' }), say: 'A normal push works, because history only grew. Sam gets the fix with <code>git pull</code>.' },
            ],
          });
        },
        code: `# not committed: throw away your edits to a file
git restore Main.kt
# staged by mistake: unstage it, keep the edits
git restore --staged Main.kt

# committed, not pushed: take back the last commit, keep the changes
git reset HEAD~1

# already pushed: add a commit that undoes an old one
git revert --no-edit 4a7b8ed
git push`,
        remember: 'Not committed: git restore. Committed but not pushed: git reset HEAD~1. Already pushed: git revert.',
        mistakes: [
          { title: 'Taking back a pushed commit', bad: 'git reset HEAD~1\ngit push       # rejected: GitHub has a commit you no longer have', good: 'git revert --no-edit HEAD   # instead of the reset\ngit push       # a new commit that undoes the last one', why: 'After a reset, your <code>main</code> no longer continues from GitHub’s, so the push is refused. Revert undoes the change by adding a commit instead. <code>HEAD</code> names your newest commit. Already reset? Run <code>git restore Main.kt</code> and <code>git pull</code> first to get the commit back, then revert.' },
        ],
        terms: [
          { term: 'restore', def: '<code>git restore file</code> throws away uncommitted edits. With <code>--staged</code> it only unstages the file.' },
          { term: 'reset', def: '<code>git reset HEAD~1</code> moves your branch back one commit and keeps its changes in your files.' },
          { term: 'revert', def: '<code>git revert id</code> makes a new commit that does the opposite of commit <code>id</code>. Safe for pushed commits.' },
          { term: 'HEAD~1', def: 'The commit one before <code>HEAD</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'You pushed commit <code>4a7b8ed</code>, and it was a mistake. Undo it without rewriting history, and share the fix.', code: 'git [[revert]] --no-edit 4a7b8ed\ngit [[push]]', why: 'Revert adds an undoing commit, so a normal push works.' },
          { type: 'bug', prompt: 'Ada wants to throw away her uncommitted edits to <code>Main.kt</code>, but this takes back her last commit instead. Tap the wrong line.', code: 'git status\ngit reset HEAD~1\ngit status', bug: 1, fix: 'git restore Main.kt', why: '<code>restore</code> is for edits that aren’t committed. <code>reset</code> works on commits.' },
        ],
        quiz: [
          { q: 'A wrong commit is already on GitHub. Which command undoes it without rewriting history?', options: ['<code>git revert</code>', '<code>git reset HEAD~1</code>', '<code>git restore</code>'], a: 0, why: 'Revert adds a new commit that undoes the old one, so history only grows.' },
          { q: 'What does <code>git restore Main.kt</code> do to your uncommitted edits in that file?', options: ['Throws them away', 'Commits them', 'Stages them'], a: 0, why: 'The file goes back to the way it was when you last added or committed it. Those edits can’t be brought back.' },
          { q: 'What does <code>HEAD~1</code> mean?', options: ['The commit one before <code>HEAD</code>', 'The very first commit', 'The next commit'], a: 0, why: '<code>~1</code> means one step back from <code>HEAD</code>.' },
        ],
        docs: [['Pro Git: Undoing Things', 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things'], ['git revert', 'https://git-scm.com/docs/git-revert']],
      },
    ],
  });
})();
