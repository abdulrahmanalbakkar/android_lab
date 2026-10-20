/* Software engineering practice track. Same shape as tracks/kotlin.js.
   How a small app team plans, builds and ships: life cycle, iterations, estimation, design docs, code review,
   technical debt, teamwork. Every class is prefixed swe-. */
(() => {
  const { h, sleep, hl, replay } = Lab;
  const act = (label, onclick, props = {}) => h('button', { class: 'cmd', onclick, ...props }, label);
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const press = (btns, on) => btns.forEach(b => b.setAttribute('aria-pressed', String(b === on)));
  const label = text => h('span', { class: 'swe-label' }, text);
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  function picker(name, items, onPick, start = 0) {
    const btns = items.map((it, k) => act(it, () => { press(btns, btns[k]); onPick(k); }));
    press(btns, btns[start]);
    return h('div', { class: 'controls' }, label(name), btns);
  }

  const css = `
.swe-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.swe-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.swe-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.swe-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.swe-stat b { color: var(--ink); }
.swe-stats { display: flex; flex-wrap: wrap; gap: 4px 16px; min-width: 0; }
.swe-note { font-size: 0.85rem; color: var(--muted); margin: 0; overflow-wrap: anywhere; }

/* life cycle timeline */
.swe-tl { display: grid; gap: 4px; min-width: 0; }
.swe-tl-head { display: flex; justify-content: space-between; gap: 8px; font: 700 0.8rem var(--mono); color: var(--ink); min-width: 0; flex-wrap: wrap; }
.swe-cells { display: grid; grid-template-columns: repeat(14, minmax(0, 1fr)); gap: 2px; min-width: 0; }
.swe-cell { aspect-ratio: 1 / 1.25; display: grid; place-items: center; border-radius: 5px; border: 1.5px solid var(--line); background: var(--surface); font: 700 0.66rem var(--mono); color: var(--ink); opacity: 0.18; transition: opacity 0.25s, background 0.25s, border-color 0.25s; min-width: 0; }
.swe-cell.swe-lit { opacity: 1; }
.swe-cell.swe-none { visibility: hidden; }
.swe-ph-R { background: var(--accent-soft); border-color: var(--accent); }
.swe-ph-D { background: var(--warm-soft); border-color: var(--warm); }
.swe-ph-B { background: var(--sunk); border-color: var(--muted); }
.swe-ph-T { background: var(--ok-soft); border-color: var(--ok); }
.swe-ph-S { background: var(--ok); border-color: var(--ok); color: var(--bg); }
.swe-cell.swe-chg { box-shadow: 0 0 0 2px var(--err); }
.swe-legend { display: flex; flex-wrap: wrap; gap: 4px 10px; font: 600 0.72rem var(--mono); color: var(--muted); min-width: 0; }
.swe-legend span { display: inline-flex; align-items: center; gap: 4px; }
.swe-legend i { width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid; display: inline-block; }

/* board */
.swe-board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; min-width: 0; }
.swe-col { display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 12px; background: var(--sunk); border: 2px solid transparent; min-height: 150px; min-width: 0; transition: border-color 0.2s; }
.swe-col.swe-full { border-color: var(--warm); }
.swe-col-h { font: 700 0.72rem var(--mono); color: var(--muted); display: flex; justify-content: space-between; gap: 4px; flex-wrap: wrap; min-width: 0; }
.swe-col.swe-full .swe-col-h b { color: var(--warm); }
.swe-card { text-align: left; font-family: inherit; font-size: 0.78rem; font-weight: 600; line-height: 1.3; padding: 7px 8px; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; overflow-wrap: anywhere; min-width: 0; display: grid; gap: 2px; }
.swe-card:hover { border-color: var(--accent); }
.swe-card small { font: 600 0.66rem var(--mono); color: var(--muted); }
.swe-card.swe-old { border-color: var(--err); }
.swe-card.swe-done { opacity: 0.7; cursor: default; border-color: var(--ok); }
@media (max-width: 560px) { .swe-board { grid-template-columns: repeat(2, minmax(0, 1fr)); } .swe-col { min-height: 90px; } }

/* svg charts */
.swe-svg { display: block; width: 100%; max-width: 460px; height: auto; margin: 0 auto; overflow: visible; }
.swe-svg text { fill: var(--muted); font: 600 10px var(--mono); }
.swe-svg .swe-axis { stroke: var(--line); stroke-width: 1.5; }
.swe-svg .swe-one { stroke: var(--ink); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.6; }
.swe-svg .swe-cone { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 2; transition: all 0.4s; }
.swe-svg .swe-dot { fill: var(--warm); stroke: var(--surface); stroke-width: 1; animation: swe-drop 0.45s ease-out both; }
.swe-svg .swe-dot.swe-out { fill: var(--err); }
@keyframes swe-drop { from { opacity: 0; transform: translateY(-14px); } }
.swe-svg .swe-l1 { fill: none; stroke: var(--err); stroke-width: 3; stroke-linejoin: round; }
.swe-svg .swe-l2 { fill: none; stroke: var(--ok); stroke-width: 3; stroke-linejoin: round; }
.swe-svg .swe-p1 { fill: var(--err); }
.swe-svg .swe-p2 { fill: var(--ok); }
.swe-svg .swe-x { stroke: var(--warm); stroke-width: 1.5; stroke-dasharray: 4 3; }
.swe-key { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 600 0.75rem var(--mono); color: var(--ink); min-width: 0; }
.swe-key i { display: inline-block; width: 14px; height: 4px; border-radius: 2px; vertical-align: middle; margin-right: 5px; }

/* design doc */
.swe-doc { display: grid; gap: 8px; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: border-color 0.3s; }
.swe-doc.swe-ok { border-color: var(--ok); }
.swe-doc h4 { margin: 0; font: 700 0.95rem var(--display, inherit); color: var(--ink); overflow-wrap: anywhere; }
.swe-sec { display: grid; gap: 2px; padding: 6px 8px; border-left: 3px solid var(--accent); background: var(--bg); border-radius: 0 8px 8px 0; min-width: 0; }
.swe-sec b { font: 700 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); }
.swe-sec span { font-size: 0.85rem; color: var(--ink); overflow-wrap: anywhere; }
.swe-sec.swe-miss { border-left-color: var(--err); background: var(--err-soft); }
.swe-sec.swe-miss b { color: var(--err); }
.swe-empty { font-size: 0.85rem; color: var(--muted); font-style: italic; }

/* review diff */
.swe-diff { display: grid; background: var(--code-bg); border-radius: 12px; padding: 8px; min-width: 0; }
.swe-dl { display: grid; grid-template-columns: 2.2em minmax(0, 1fr); text-align: left; font: 500 0.78rem/1.55 var(--mono); color: var(--code-ink); background: transparent; border: 1px solid transparent; border-radius: 6px; padding: 1px 4px; cursor: pointer; min-width: 0; }
.swe-dl code { white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; font: inherit; }
.swe-dl .swe-ln { color: var(--code-ink); opacity: 0.45; user-select: none; }
.swe-dl:hover { border-color: rgba(227, 238, 231, 0.3); }
.swe-dl.swe-flag { background: rgba(255, 212, 121, 0.16); border-color: var(--t-f); }
.swe-dl.swe-hit { background: rgba(158, 223, 165, 0.18); border-color: var(--t-k); }
.swe-dl.swe-miss { background: rgba(255, 138, 155, 0.18); border-color: var(--t-e); }
.swe-dl.swe-false { opacity: 0.55; border-style: dashed; border-color: var(--code-ink); }
.swe-notes { display: grid; gap: 6px; margin: 0; padding-left: 1.2em; font-size: 0.86rem; color: var(--ink); min-width: 0; }
.swe-notes li { overflow-wrap: anywhere; }
.swe-sev { font: 700 0.7rem var(--mono); padding: 1px 6px; border-radius: 6px; margin-right: 4px; background: var(--err-soft); color: var(--err); }
.swe-sev.swe-nit { background: var(--sunk); color: var(--muted); }
.swe-sev.swe-should { background: var(--warm-soft); color: var(--warm); }

/* lists, messages and quotes */
.swe-pool { display: grid; gap: 6px; min-width: 0; }
.swe-ev { text-align: left; font-family: inherit; font-size: 0.82rem; font-weight: 600; line-height: 1.35; padding: 8px 10px; border-radius: 10px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; overflow-wrap: anywhere; min-width: 0; }
.swe-ev:hover { border-color: var(--accent); }
.swe-ev.swe-wrong { border-color: var(--err); }
.swe-tlist { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; min-width: 0; }
.swe-tlist li { display: grid; grid-template-columns: 4.4em minmax(0, 1fr); gap: 8px; padding: 6px 0 6px 10px; border-left: 3px solid var(--accent); font-size: 0.85rem; color: var(--ink); min-width: 0; overflow-wrap: anywhere; }
.swe-tlist li b { font: 700 0.76rem var(--mono); color: var(--accent); }
.swe-tlist li.swe-mit { border-left-color: var(--ok); }
.swe-tlist li.swe-mit b { color: var(--ok); }
.swe-tlist li.swe-bad { border-left-color: var(--err); }
.swe-tlist li.swe-bad b { color: var(--err); }
.swe-quote { margin: 0; padding: 10px 12px; border-radius: 10px; background: var(--surface); border: 2px solid var(--line); font-size: 0.88rem; color: var(--ink); overflow-wrap: anywhere; transition: border-color 0.3s; }
.swe-quote.swe-blame { border-color: var(--err); }
.swe-quote.swe-fair { border-color: var(--ok); }
`;

  Lab.addTrack({
    id: 'sweng', lang: 'text',
    title: 'Software engineering practice',
    description: 'How teams plan, build and ship software together: life cycle, agile, estimation, design docs, code review, technical debt and working in a team.',
    requires: ['kotlin', 'git'],
    css,
    lessons: [
      {
        id: 'sdlc',
        title: 'How software gets built',
        tagline: 'Every change goes through the same five phases, from an idea to users’ phones.',
        goals: ['Name the five phases: requirements, design, build, test, release', 'Say what each phase hands to the next', 'Explain why a mistake found late costs more'],
        level: 'beginner', introduces: [],
        body: `
<p>Ada, Sam and Lin make a small weather app. A user writes in: “I check Lisbon and Oslo every day. Can I keep them at the top?” Between that message and a new version on people’s phones, the work passes through five phases. Every software team has them, even when nobody names them. Together they are called the <em>software development life cycle</em>, or SDLC.</p>
<p><b>Requirements</b>: decide <em>what</em> it must do, in words anyone can check (“starred cities come first, and stay starred after the app restarts”). <b>Design</b>: plan <em>how</em>: sketch the screen, choose the classes and functions. <b>Build</b>: write the code, on a branch, through a pull request. <b>Test</b>: check that it does what the requirements say, on real phones. <b>Release</b>: publish a new version so users get it.</p>
<p>Each phase hands something to the next: a written list of requirements, a sketch, merged code, a tested version. And the later a mistake is found, the more finished work it undoes. A misunderstood requirement costs a short conversation in the first week. Found in testing, it also costs the design, the code and the tests built on it.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'req', label: 'Requirements', sub: 'what it must do' },
              { id: 'des', label: 'Design', sub: 'how it will work' },
              { id: 'bld', label: 'Build', sub: 'write the code' },
              { id: 'tst', label: 'Test', sub: 'does it work?' },
              { id: 'rel', label: 'Release', sub: 'to users' },
            ],
            predict: {
              q: 'In testing, Ada finds that the stars disappear when the app restarts. The requirements already said they must stay. Which phase does the work go back to?',
              options: ['Requirements: write them again', 'Build: fix the code, then test again', 'Release: ship it now, fix it later'],
              a: 1,
              why: 'The requirement was right; the code didn’t follow it. Going back only as far as the mistake keeps the cost small.',
            },
            frames: [
              { at: 'req', packet: '★', say: 'The idea: “keep my cities at the top”. Requirements turn it into three lines anyone can check: a star on each city; starred cities come first; stars stay after a restart.' },
              { at: 'des', packet: '★', mark: { req: 'ok' }, say: 'Design: Lin sketches a star at the end of each city row, and plans the code: the <code>City</code> class gets a new property, <code>starred</code>.' },
              { at: 'bld', packet: '★', mark: { des: 'ok' }, say: 'Build: Sam writes the code on a branch, opens a pull request, gets a review, and merges it into <code>main</code>.' },
              { at: 'tst', packet: '✗', tone: 'err', mark: { bld: 'ok', tst: 'err' }, say: 'Test: Ada checks each requirement on a phone. After a restart, the stars are gone. Requirement 3 fails.' },
              { at: 'bld', packet: 'fix', tone: 'warm', mark: { bld: 'warm' }, say: 'Back one phase, not to the start. The requirement was clear, so only the code changes: Sam saves the stars so they survive a restart.' },
              { at: 'tst', packet: '★', tone: 'ok', mark: { bld: 'ok', tst: 'ok' }, say: 'Tested again: all three requirements pass, on a small phone and a large one.' },
              { at: 'rel', packet: '1.4', tone: 'ok', mark: { rel: 'ok' }, say: 'Release: version 1.4 goes out. A user replies, “Can I put Oslo above Lisbon?” That becomes a new requirement, and the cycle starts again.' },
            ],
          });
        },
        code: `Feature: keep favourite cities at the top

Requirements  A star on each city. Starred cities come first.
              Stars stay after the app restarts.
Design        Sketch: a star at the end of each city row.
              Code plan: City gets a new property, starred.
Build         Branch star, pull request #12, reviewed and merged.
Test          Check all three requirements on a small and a large phone.
Release       Version 1.4, note for users: "Star your favourite cities."`,
        remember: 'Requirements, design, build, test, release: each phase hands something to the next, and a mistake costs less the earlier it is found.',
        mistakes: [
          { title: 'Testing only at the very end', bad: 'Months 1-3: build every feature\nLast week:  test everything\n            (40 bugs, no time left)', good: 'Build one feature, test it, release it.\nThen the next one.', why: 'Bugs found in the last week are found when there is no time to fix them well. Testing each piece as soon as it is built catches problems while the code is fresh in your head.' },
        ],
        terms: [
          { term: 'software development life cycle (SDLC)', def: 'The phases every change goes through: requirements, design, build, test, release.' },
          { term: 'requirement', def: 'A short statement of what the software must do, written so anyone can check it.' },
          { term: 'release', def: 'Publishing a new version of the app so users can install it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the missing phase.', code: 'Requirements\nDesign\n[[Build|build]]\nTest\nRelease', why: 'After the plan comes the code. Build sits between design and test.' },
          { type: 'bug', prompt: 'One line is in the wrong phase. Tap it.', code: 'Requirements: starred cities come first\nDesign: sketch a star at the end of each row\nBuild: write the code on a branch\nRelease: check the stars on a small phone\nRelease: publish version 1.4', bug: 3, fix: 'Test: check the stars on a small phone', why: 'Checking that it works is testing, and it happens before the release, not during it.' },
        ],
        quiz: [
          { q: 'Which phase decides <em>what</em> a feature must do?', options: ['Requirements', 'Design', 'Test'], a: 0, why: 'Requirements say what; design says how.' },
          { q: 'A requirement was misunderstood. When is it cheapest to find out?', options: ['While writing the requirements', 'During testing', 'After the release'], a: 0, why: 'Early, only a few sentences change. Later, the design, the code and the tests built on it change too.' },
          { q: 'What does the build phase hand to testing?', options: ['A list of what users asked for', 'Code that is written, reviewed and merged', 'A version in the app store'], a: 1, why: 'Each phase hands its result to the next. Build produces working code to test.' },
        ],
        docs: [['Fundamentals of testing Android apps', 'https://developer.android.com/training/testing/fundamentals'], ['Publish your app', 'https://developer.android.com/studio/publish']],
      },

      {
        id: 'agile',
        title: 'Working in iterations',
        tagline: 'Build a small piece, show it, learn, repeat.',
        goals: ['Explain why teams ship in short iterations', 'Use a backlog to choose what comes next', 'Give a short daily stand-up update'],
        level: 'beginner', introduces: [],
        body: `
<p>Ada’s team could plan the next six months of work up front and show users the result at the end. If users wanted something different, the team would find out after six months. So most teams work in <em>iterations</em> instead: they run the five phases from the last lesson on a small piece of work, every one or two weeks. Each piece reaches users (or at least testers), and what they say shapes the next piece. This way of working is called <em>agile</em>.</p>
<p>The <em>backlog</em> is the team’s to-do list for the app: every idea, request and bug, each written on a <em>ticket</em> (a short card for one piece of work), with the most important at the top. A <em>sprint</em> is one iteration with a fixed length, often two weeks. At sprint planning, the team pulls the top tickets it believes it can finish. At the end it shows what is done (the <em>sprint review</em>), then asks: what should we do differently next time? That last meeting is the <em>retrospective</em>.</p>
<p>Every day there is a <em>stand-up</em>: a 15-minute meeting, often held standing so it stays short. Each person says what they did yesterday, what they will do today, and whether anything blocks them. Problems are not solved there; the people involved talk right after.</p>`,
        visual(el) {
          const COLS = ['Backlog', 'Sprint', 'Doing', 'Done'];
          const T = { order: 'Reorder starred cities', lima: 'Wrong time in Lima', rain: 'Hourly rain chart', dark: 'Dark mode', mph: 'Wind in mph', widget: 'Home screen widget', see: 'Make the star easier to see' };
          const day = h('p', { class: 'swe-note' });
          const board = h('div', { class: 'swe-board' });
          const quote = h('p', { class: 'swe-quote' });
          const stage = h('div', { class: 'ui-stage swe-stage' }, day, board, quote);
          const frames = [
            { d: 'Monday, sprint planning', c: [['order', 'lima', 'rain', 'dark', 'mph'], [], [], []], q: 'Backlog, most important first.', say: 'The backlog, most important ticket on top. Monday morning: planning for a two-week sprint.' },
            { d: 'Monday, sprint planning', c: [['dark', 'mph'], ['order', 'lima', 'rain'], [], []], q: 'Team: “We can finish these three in two weeks.”', say: 'The team pulls the top three tickets, the ones it believes it can finish in two weeks. The rest stay in the backlog.' },
            { d: 'Day 1, stand-up', c: [['dark', 'mph'], ['rain'], ['order', 'lima'], []], who: { order: 'Sam', lima: 'Lin' }, q: 'Sam: “Today I start reordering cities.” Lin: “Today I fix the time in Lima.”', say: 'First stand-up. Each person picks a ticket and says what they will do today.' },
            { d: 'Day 3, stand-up', c: [['dark', 'mph'], [], ['order', 'rain'], ['lima']], who: { order: 'Sam', rain: 'Lin', lima: 'Lin' }, q: 'Lin: “Yesterday I fixed Lima. Today the rain chart. Blocked: I need the rain data format from Ada.”', say: 'Lin is blocked and says so out loud. Ada and Lin talk right after the stand-up, not during it.' },
            { d: 'Day 6', c: [['dark', 'mph', 'widget'], [], ['order', 'rain'], ['lima']], who: { order: 'Sam', rain: 'Lin', lima: 'Lin' }, q: 'Maya, who decides what the team builds: “Users want a home screen widget!”', say: 'A new idea arrives mid-sprint. It goes into the backlog, not into the sprint, so the plan stays steady. Planning will decide where it ranks.' },
            { d: 'Day 10, end of sprint', c: [['dark', 'mph', 'widget'], [], [], ['lima', 'order', 'rain']], who: { order: 'Sam', rain: 'Lin', lima: 'Lin' }, q: 'Testers: “The star is hard to see on a small phone in sunlight.”', say: 'All three are done. The team shows them to testers, who notice something nobody had thought of.' },
            { d: 'Day 10, retrospective, then next planning', c: [['see', 'widget', 'dark', 'mph'], [], [], ['lima', 'order', 'rain']], who: { order: 'Sam', rain: 'Lin', lima: 'Lin' }, q: 'Retrospective: “Next time, ask for data formats before the sprint starts.”', say: 'The feedback becomes a new ticket at the top of the backlog. One small change for next time is agreed. Then the next sprint begins.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Mid-sprint, someone has a new idea: a widget for the home screen. Where does it go?',
              options: ['Into the backlog, to be ranked for a later sprint', 'Straight into Doing, so it gets done now', 'Nowhere: new ideas wait until the app is finished'],
              a: 0,
              why: 'The sprint keeps its plan. New work joins the backlog, and the next planning decides where it ranks.',
            },
            draw(f, i) {
              day.textContent = f.d;
              board.replaceChildren(...COLS.map((name, k) => h('div', { class: 'swe-col' },
                h('div', { class: 'swe-col-h' }, h('span', {}, name), h('b', {}, String(f.c[k].length))),
                f.c[k].map(id => h('div', { class: 'swe-card' + (k === 3 ? ' swe-done' : '') }, T[id], f.who && f.who[id] && k > 1 ? h('small', {}, f.who[id]) : null)))));
              quote.textContent = f.q;
            },
          });
        },
        code: `Stand-up, sprint 7, day 3 (15 minutes)

Lin  Yesterday: fixed the wrong time shown for Lima.
     Today:     start the hourly rain chart.
     Blocked:   I need the rain data format from Ada.
Sam  Yesterday: moving a city up or down works, pull request #13 is open.
     Today:     answer the review comments on #13.
     Blocked:   nothing.

After the stand-up: Ada and Lin, 10 minutes on the rain data.`,
        remember: 'Work in short sprints: pull the top of the backlog, meet for 15 minutes a day, show the result, adjust.',
        mistakes: [
          { title: 'A stand-up that turns into a long meeting', bad: 'Lin: I’m blocked on the rain data.\nAda: Let’s work it out now...\n(40 minutes later, everyone is still there)', good: 'Lin: I’m blocked on the rain data.\nAda: Let’s talk right after.\n(stand-up ends after 15 minutes)', why: 'Most people don’t need the details. Name the problem in the stand-up; solve it afterwards with the people involved.' },
        ],
        terms: [
          { term: 'backlog', def: 'The ordered list of tickets the team might work on, most important first. A <em>ticket</em> is a card for one piece of work.' },
          { term: 'sprint', def: 'One <em>iteration</em> (a short round of requirements, design, build, test and release on a small piece of work) with a fixed length, often two weeks. It starts with planning and ends by showing the finished work, then a retrospective.' },
          { term: 'retrospective', def: 'A short meeting at the end of a sprint about what to do differently next time.' },
          { term: 'stand-up', def: 'A daily meeting of about 15 minutes: yesterday, today, and anything that blocks you.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete Sam’s stand-up update.', code: 'Yesterday: moving a city up or down works\nToday: answer the review comments\n[[Blocked|blocked]]: nothing', why: 'The third part of a stand-up update is what blocks you, even when the answer is “nothing”.' },
          { type: 'bug', prompt: 'This sprint plan breaks the idea of a sprint. Tap the line.', code: 'Sprint 8: two weeks, starts Monday\nPull the top three tickets from the backlog\nAdd every other ticket to this sprint too\nShow the finished work on the last Friday', bug: 2, fix: 'Leave the other tickets in the backlog', why: 'A sprint holds only what the team believes it can finish. The rest waits in the backlog, in order.' },
        ],
        quiz: [
          { q: 'What is the backlog?', options: ['The ordered list of work the team might do', 'The work finished last sprint', 'A list of bugs only'], a: 0, why: 'Ideas, requests and bugs all go in, most important first.' },
          { q: 'Lin is stuck waiting for the rain data. When should she say so?', options: ['At the next stand-up, or sooner', 'At the end of the sprint', 'Only if it lasts a week'], a: 0, why: 'A blocker said early can often be solved in minutes. Said late, it has cost days.' },
          { q: 'Why do teams work in short iterations?', options: ['Users see something early, and their feedback shapes the next piece', 'It skips the test phase', 'No planning is needed any more'], a: 0, why: 'Every phase still happens, on a small piece. The win is learning early.' },
        ],
        docs: [['Manifesto for Agile Software Development', 'https://agilemanifesto.org/'], ['The Scrum Guide', 'https://scrumguides.org/scrum-guide.html']],
      },

      {
        id: 'estimation', ignore: ['Text'],
        title: 'Estimating work',
        tagline: 'Break a job into small pieces, and answer with a range, not one number.',
        goals: ['Break a feature into small tasks you can picture', 'Give an estimate as a range', 'Spot the work that is easy to forget'],
        level: 'beginner', introduces: [],
        body: `
<p>Maya, who decides what the team builds next, asks Sam: “How long will the hourly rain chart take?” Sam has never built a chart in this app. Any single number he says now is a guess. If he says “two days”, the whole team plans around those two days.</p>
<p>An <em>estimate</em> is a best guess of how long work will take, and every estimate carries <em>uncertainty</em>: the things you don’t know yet. Big, vague jobs hide the most. So first, <em>break the work down</em>: split it into small tasks, each one you can picture from start to finish, ideally a day or less. Small tasks are easier to guess, and splitting often turns up work nobody had counted: tests, review comments, the screen when there is no data, small phones.</p>
<p>Then answer with a range, like “4 to 8 days”. The gap shows how unsure you are. Say what would make it narrower (“once I know the data format”) and update it as you learn. A range that turns out right helps the team more than an exact number that turns out wrong.</p>`,
        visual(el) {
          const TASKS = [
            ['Get the hourly rain data', 0.5, 2, 'unknown'],
            ['Draw one bar per hour', 0.5, 1],
            ['Bar colours and spacing', 0.5, 1],
            ['Hour labels under the bars', 0.5, 1],
            ['Message when there is no data', 0.5, 1],
            ['Tests', 0.5, 1, 'forgot'],
            ['Review comments', 0.5, 1, 'forgot'],
            ['Check on a small phone', 0.5, 1, 'forgot'],
          ];
          const n = x => String(x).replace('.5', '½').replace(/^0½/, '½');
          const head = h('p', { class: 'swe-note' });
          const list = h('ol', { class: 'swe-tlist' });
          const total = h('div', { class: 'swe-stats' });
          const stage = h('div', { class: 'ui-stage swe-stage' }, head, list, total);
          const frames = [
            { k: 0, guess: true, say: 'Sam’s first answer, off the top of his head: “About 2 days.” One number, and nothing written down behind it.' },
            { k: 4, say: 'Now he breaks it down. The four tasks he was picturing already add up to 2 to 5 days. Getting the data is the widest range: he doesn’t know its format yet.' },
            { k: 5, say: 'What does the screen show when there is no data? Nobody had thought of it. Another half day to a day.' },
            { k: 8, say: 'Then the work that is easy to forget, because it isn’t “the feature”: tests, answering review comments, checking a small phone.' },
            { k: 8, answer: true, say: 'His answer to Maya: “4 to 9 days. Most of the doubt is the data format; I’ll know more once Ada sends it.”' },
            { k: 8, known: true, say: 'Ada sends the format: it is the same as the daily data. The first task shrinks to ½ to 1 day, and the estimate narrows to 4 to 8 days. Sam tells Maya the new range.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Sam first guessed “2 days”. He then splits the work into small tasks and adds them up. The total is most likely…',
              options: ['Bigger: splitting shows work he hadn’t counted', 'Smaller: small tasks are quicker', 'Exactly 2 days again'],
              a: 0,
              why: 'A quick guess pictures only the main part. Writing every task down shows the rest.',
            },
            draw(f) {
              head.textContent = f.guess ? 'Hourly rain chart: how long?' : 'Hourly rain chart, broken down (days)';
              const rows = TASKS.slice(0, f.k).map(([name, lo, hi, tag], j) => {
                if (j === 0 && f.known) hi = 1;
                const cls = tag === 'unknown' && !f.known ? 'swe-bad' : tag === 'forgot' ? 'swe-mit' : null;
                return h('li', { class: cls }, h('b', {}, `${n(lo)}–${n(hi)}`), h('span', {}, name + (tag === 'unknown' && !f.known ? ' (format unknown)' : '')));
              });
              list.replaceChildren(...rows);
              list.hidden = f.guess;
              let lo = 0, hi = 0;
              TASKS.slice(0, f.k).forEach(([, a, b], j) => { lo += a; hi += j === 0 && f.known ? 1 : b; });
              total.replaceChildren(f.guess
                ? h('span', { class: 'swe-stat' }, 'Sam: ', h('b', {}, '“about 2 days”'))
                : h('span', { class: 'swe-stat' }, 'Total: ', h('b', {}, `${n(lo)} to ${n(hi)} days`)));
            },
          });
        },
        code: `Estimate: hourly rain chart (Sam, Tuesday)

Get the hourly rain data         0.5 - 1 day
Draw one bar per hour            0.5 - 1 day
Bar colours and spacing          0.5 - 1 day
Hour labels under the bars       0.5 - 1 day
Message when there is no data    0.5 - 1 day
Tests                            0.5 - 1 day
Review comments                  0.5 - 1 day
Check on a small phone           0.5 - 1 day
                                 -----------
Total                            4 - 8 days

Next update: Thursday, once the first bars are drawn.`,
        remember: 'Break the work into tasks of a day or less, count the work that isn’t code, and answer with a range you update as you learn.',
        mistakes: [
          { title: 'Estimating only the code', bad: 'Draw the chart: 2 days', good: 'Draw the bars:    0.5 - 1 day\nBar colours:      0.5 - 1 day\nTests:            0.5 - 1 day\nReview comments:  0.5 - 1 day', why: 'Tests, reviews and checks on real phones take real time. Leaving them out makes every estimate too small.' },
        ],
        terms: [
          { term: 'estimate', def: 'A best guess of how long a piece of work will take, best given as a range.' },
          { term: 'uncertainty', def: 'What you don’t know yet about a piece of work. The more there is, the wider the range.' },
          { term: 'breaking work down', def: 'Splitting a feature into small tasks you can each picture from start to finish.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add up Sam’s tasks to get the range.', code: 'Share button        0.5 - 1 day\nText to share       0.5 - 1 day\nTests               0.5 - 1 day\nReview comments     0.5 - 1 day\nTotal               [[2]] - [[4]] days', why: 'Four lows of 0.5 make 2; four highs of 1 make 4.' },
          { type: 'bug', prompt: 'Sam doesn’t know yet how sharing works on older phones. Tap the line that hides that.', code: 'Maya: How long for the share button?\nSam: Exactly 2 days.\nMaya: What could change that?\nSam: How sharing works on older phones.', bug: 1, fix: 'Sam: 2 to 4 days. I’ll know more by Thursday.', why: 'He has a real unknown, so one exact number is a promise he can’t keep. A range, plus when it will get narrower, is honest.' },
        ],
        quiz: [
          { q: 'Why break a feature into small tasks before estimating?', options: ['Small tasks are easier to picture, and splitting turns up forgotten work', 'It makes the work itself go faster', 'So that each person gets exactly one task'], a: 0, why: 'You can guess a one-day task far better than a vague two-week one.' },
          { q: 'Which answer is the most useful estimate?', options: ['“3 to 6 days; I’ll know more once I see the data.”', '“Exactly 4 days.”', '“No idea.”'], a: 0, why: 'A range shows the uncertainty, and saying what would narrow it gives the team a plan.' },
          { q: 'Which work is often left out of estimates?', options: ['Tests, review comments and checks on different phones', 'Writing the main code', 'Choosing a ticket'], a: 0, why: 'It doesn’t feel like “the feature”, but it takes real days.' },
        ],
        docs: [['Adding sub-issues', 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues'], ['About issues', 'https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues']],
      },

      {
        id: 'design-doc', ignore: ['take','plus'],
        title: 'Design documents',
        tagline: 'Write the plan down, compare the options, and decide before you build.',
        goals: ['Name the parts of a short design doc', 'Compare options by their trade-offs', 'Explain why the doc comes before the code'],
        level: 'beginner', introduces: [],
        body: `
<p>Users ask for their starred cities to come back when they get a new phone. Sam could keep the stars on the phone and use Android’s own backup, or store them in a user account online. Both work, and they mean very different amounts of work. If Sam picks alone and starts coding, the team may tell him in review, three weeks later, that they wanted the other one.</p>
<p>A <em>design document</em> (design doc) is a short proposal, one or two pages, written before the code. It says: the <b>problem</b>, the <b>goals</b>, the <b>non-goals</b> (what you deliberately won’t do, so the work doesn’t keep growing), the <b>options</b> you considered, and the <b>decision</b> with its reason. Teammates read it and comment, like a review of a pull request, but for a plan. Design docs are often written in <em>Markdown</em>, plain text where a line starting with <code>#</code> is a heading and <code>##</code> a smaller heading.</p>
<p>The heart of it is <em>trade-offs</em>: each option gains something and pays for it with something else. An online account follows the user everywhere, but needs sign-in, a server (a computer online that keeps everyone’s stars) and weeks of work. Writing the options side by side lets the team choose on purpose. Changing a paragraph takes minutes; changing finished code takes weeks.</p>`,
        visual(el) {
          const SECS = [
            ['Problem', 'Users who get a new phone lose their starred cities. 12 messages this month asked for them back.'],
            ['Goals', 'Stars still stay after a restart (true since 1.4). A user who moves to a new phone gets them back.'],
            ['Non-goals', 'No sharing stars with other people. No backing up other settings, like °C or °F.'],
            ['Options', 'A) Keep it as it is: 0 days, but stars are lost with the phone. B) Online account: follows the user anywhere, but 3 weeks, needs sign-in and a server. C) Phone plus Android’s backup: 3 days; needs backup turned on.'],
          ];
          const doc = h('div', { class: 'swe-doc' });
          const quote = h('p', { class: 'swe-quote' });
          const stage = h('div', { class: 'ui-stage swe-stage' }, doc, quote);
          const frames = [
            { k: 0, say: 'Sam starts with a title and a status: <b>Draft</b>. One page is enough.' },
            { k: 1, say: '<b>Problem</b>: what is wrong, for whom, and how we know. The 12 messages show it is real.' },
            { k: 2, say: '<b>Goals</b>: what must be true when the work is done, written so anyone can check it.' },
            { k: 3, say: '<b>Non-goals</b>: things that sound related but are not part of this work. They stop the work from growing during review.' },
            { k: 4, say: '<b>Options</b>, each with what it gains and what it costs. B gives users the most, and costs the most.' },
            { k: 4, bare: true, q: 'Lin: “Why C and not B? In a year someone will ask.”', say: 'The decision says <b>C</b>, but not why. Lin comments on it in the review.' },
            { k: 4, done: true, q: 'Lin: “Approved. Clear reason, and we know when to look again.”', say: 'Sam adds the reason. The team agrees, the status becomes <b>Accepted</b>, and only now does the coding start.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Option B, an online account, gives users the most. Why might the team still choose C?',
              options: ['It meets both goals for much less work: a trade-off', 'B is impossible to build', 'Teams always pick the last option'],
              a: 0,
              why: 'C meets both goals for most users in 3 days. B would take 3 weeks for a little more.',
            },
            draw(f) {
              const parts = [h('h4', {}, 'Design: starred cities on a new phone'), h('p', { class: 'swe-note' }, 'Author: Sam · Reviewers: Ada, Lin · Status: ' + (f.done ? 'Accepted' : 'Draft'))];
              SECS.slice(0, f.k).forEach(([k, t]) => parts.push(h('div', { class: 'swe-sec' }, h('b', {}, k), h('span', {}, t))));
              if (f.bare) parts.push(h('div', { class: 'swe-sec swe-miss' }, h('b', {}, 'Decision'), h('span', {}, 'Option C.')));
              if (f.done) parts.push(h('div', { class: 'swe-sec' }, h('b', {}, 'Decision'), h('span', {}, 'Option C: it meets both goals in 3 days. B would take 3 weeks for little more. We look at B again if the app ever gets accounts.')));
              if (!f.k) parts.push(h('p', { class: 'swe-empty' }, '(empty page)'));
              doc.replaceChildren(...parts);
              doc.classList.toggle('swe-ok', !!f.done);
              quote.hidden = !f.q;
              quote.className = 'swe-quote' + (f.done ? ' swe-fair' : f.bare ? ' swe-blame' : '');
              quote.textContent = f.q || '';
            },
          });
        },
        code: `# Design: starred cities on a new phone
Author: Sam   Reviewers: Ada, Lin   Status: Accepted

## Problem
Users who get a new phone lose their starred cities.
12 messages this month asked for them back.

## Goals
- Stars still stay after a restart (true since 1.4).
- A user who moves to a new phone gets them back.

## Non-goals
- No sharing stars with other people.
- No backing up other settings, like °C or °F.

## Options
A) Keep it as it is. 0 days. Stars are lost with the phone.
B) Online account. 3 weeks. Needs sign-in and a server.
C) Phone plus Android's backup. 3 days. Needs backup turned on.

## Decision
C: it meets both goals in 3 days. Look at B again if we add accounts.`,
        remember: 'Before big work, write one page: problem, goals, non-goals, options with their trade-offs, and a decision with its reason.',
        mistakes: [
          { title: 'A decision with no reason', bad: '## Decision\nOption C.', good: '## Decision\nOption C: it meets both goals in 3 days.\nB would take 3 weeks for little more.', why: 'In a year, someone will ask “why not B?”. The reason is the part of the decision that stays useful.' },
        ],
        terms: [
          { term: 'design doc', def: 'A short written proposal, made before the code: problem, goals, non-goals, options, decision.' },
          { term: 'non-goal', def: 'Something the team deliberately won’t do in this piece of work, written down so the work doesn’t keep growing.' },
          { term: 'trade-off', def: 'What an option gains, and what it pays for it, such as more features for more time.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the section that stops the work from growing.', code: '## Goals\nStars come back on a new phone.\n## [[Non-goals|Non-Goals|Non goals|Nongoals]]\nNo sharing stars with other people.', why: 'Non-goals say out loud what is not part of this work.' },
          { type: 'bug', prompt: 'One option hides its cost, so nobody can weigh it. Tap it.', code: 'A) Keep it as it is: 0 days. Lost with the phone.\nB) Online account: the best option.\nC) Phone plus backup: 3 days. Needs backup on.', bug: 1, fix: 'B) Online account: 3 weeks. Needs sign-in and a server.', why: 'Every option needs its gains and its costs, so the team can compare them fairly.' },
        ],
        quiz: [
          { q: 'When is a design doc most useful?', options: ['Before the code, while changing the plan is cheap', 'After the release, to describe what was built', 'Only when something breaks'], a: 0, why: 'Its value is the cheap disagreement before the expensive work.' },
          { q: 'What is a non-goal?', options: ['Something the team deliberately won’t do in this work', 'A goal that failed', 'A bug nobody fixed'], a: 0, why: 'Writing it down settles “are we also doing this?” questions before they come up in review.' },
          { q: 'What is a trade-off?', options: ['What an option gains, and what it pays for it', 'Swapping two tickets in the backlog', 'Always choosing the cheapest option'], a: 0, why: 'Good designs compare trade-offs; the cheapest option is not always right.' },
        ],
        docs: [['Kotlin KEEP: design proposals for the Kotlin language', 'https://github.com/Kotlin/KEEP'], ['Back up user data with Auto Backup', 'https://developer.android.com/identity/data/autobackup']],
      },

      {
        id: 'code-review', ignore: ['out'],
        title: 'Code review',
        tagline: 'Comment on the code, not the person, and take comments as help.',
        goals: ['Write review comments that are kind, specific and say why', 'Mark how much a comment matters', 'Answer the comments on your own pull request'],
        level: 'beginner', introduces: [],
        body: `
<p>In Pull requests and review you saw the steps: a teammate opens <b>Files changed</b>, comments on lines, and approves or requests changes. Sam’s new pull request has a bug that would crash the favourites screen for every user, with or without starred cities. Whether it gets caught depends on the review. Whether Sam fixes it gladly depends on how the comment is written.</p>
<p><b>Giving</b> a review: comment on the code, not the person: “this loop reads one past the end of the list”, not “you got the loop wrong”. Say why, and suggest a fix. Mark how much it matters: <b>Must:</b> for things that would break, <b>Suggestion:</b> for a better way, <b>Nit:</b> for a tiny point, like a name, that shouldn’t block the merge. And say what is good, so the author knows what to keep.</p>
<p><b>Receiving</b> a review: the comments are about the code, not about you. Thank the reviewer, fix, and reply to each comment so they know it is handled. If you disagree, explain your reason. If a reviewer misread the code, that is often a sign it could be clearer.</p>`,
        visual(el) {
          const OLD = ['fun printFavourites(c: List<String>) {', '    if (c.size == 0) println("No favourites yet")', '    for (i in 0..c.size) {', '        println(c[i])', '    }', '}'];
          const NEW = ['fun printFavourites(cities: List<String>) {', '    if (cities.size == 0) println("No favourites yet")', '    for (city in cities) {', '        println(city)', '    }', '}'];
          const NOTES = [
            ['must', 'Must', 3, 'Line 3: <code>0..c.size</code> includes <code>c.size</code>, so with 3 cities the loop reads <code>c[3]</code> and crashes: <code>Index 3 out of bounds for length 3</code>. Even an empty list crashes, at <code>c[0]</code>, right after the friendly message. A <code>for (city in c)</code> loop can’t go past the end.'],
            ['nit', 'Nit', 1, 'Line 1: name the parameter <code>cities</code>. <code>c</code> doesn’t say what it holds.'],
            ['good', 'Nice', 2, 'Line 2: a friendly message for the empty list. Good thinking.'],
          ];
          const diff = h('div', { class: 'swe-diff' });
          const notes = h('ul', { class: 'swe-notes' });
          const quote = h('p', { class: 'swe-quote' });
          const stage = h('div', { class: 'ui-stage swe-stage' }, h('span', { class: 'swe-label' }, 'Files changed: Favourites.kt'), diff, notes, quote);
          const frames = [
            { n: 0, say: 'Sam’s pull request adds one function that prints the starred cities, one per line. Ada reviews it in <b>Files changed</b>.' },
            { n: 0, hl: 3, q: 'Ada (draft): “This is wrong. Did you even run it?”', bad: true, say: 'Ada spots the problem on line 3. Her first draft is about Sam, not the code, and it doesn’t say what is wrong or how to fix it. She rewrites it before posting.' },
            { n: 1, hl: 3, say: 'The comment she posts: labelled <b>Must</b>, says exactly what happens and why, and suggests a fix.' },
            { n: 2, hl: 1, say: 'A <b>Nit</b>: worth saying, but it won’t block the merge.' },
            { n: 3, hl: 2, say: 'And one thing done well. Ada submits the review with <b>Request changes</b>.' },
            { n: 3, fixed: true, q: 'Sam: “Thanks, good catch! Fixed both in the latest commit.”', good: true, say: 'Sam doesn’t argue with the bug. He fixes it on the same branch, renames the parameter (and its uses), pushes, and replies to each comment.' },
            { n: 3, fixed: true, q: 'Ada: Approve. “Looks good, thanks for the quick fix.”', good: true, say: 'Ada looks again and approves. The crash never reached a single user.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Ada finds the bug in Sam’s loop. Which comment helps Sam most?',
              options: ['“This is wrong.”', '“Must: <code>0..c.size</code> goes one past the end and crashes. Use <code>for (city in c)</code>.”', 'None: approve, and let testing find it'],
              a: 1,
              why: 'It says what breaks, why, and how to fix it, and it is about the code.',
            },
            draw(f) {
              const src = f.fixed ? NEW : OLD;
              diff.replaceChildren(...src.map((s, k) => h('div', { class: 'swe-dl' + (f.fixed && k < 4 ? ' swe-hit' : f.hl === k + 1 ? (f.n ? ' swe-flag' : ' swe-miss') : '') },
                h('span', { class: 'swe-ln' }, String(k + 1)), h('code', { html: hl(s) }))));
              notes.replaceChildren(...NOTES.slice(0, f.n).map(([sev, lab, , t]) => h('li', {}, h('span', { class: 'swe-sev' + (sev === 'nit' ? ' swe-nit' : sev === 'good' ? ' swe-should' : '') }, lab), h('span', { html: t }))));
              notes.hidden = !f.n;
              quote.hidden = !f.q;
              quote.className = 'swe-quote' + (f.bad ? ' swe-blame' : f.good ? ' swe-fair' : '');
              quote.textContent = f.q || '';
            },
          });
        },
        code: `Review of pull request #14, Favourites.kt (by Ada)
The change: fun printFavourites(c: List<String>) prints each city.

line 1  Nit: name the parameter cities. "c" doesn't say what it holds.
line 2  Nice: a friendly message for the empty list.
line 3  Must: 0..c.size includes c.size, so with 3 cities the loop
        reads c[3] and the app crashes:
        Index 3 out of bounds for length 3
        Even an empty list crashes, at c[0], right after the
        friendly message. A for (city in c) loop can't go past the end.

Review: Request changes

Sam: Thanks, good catch! Fixed both in the latest commit.
Ada: Approve`,
        remember: 'Review the code, not the person: say what, why and a fix, and label it Must, Suggestion or Nit. When you receive one, thank, fix and reply.',
        terms: [
          { term: 'review comment', def: 'A note a reviewer leaves on a line of a pull request, ideally saying what, why and how to fix it.' },
          { term: 'nit', def: 'A tiny, optional point in a review, like a name or a space. Starting a comment with “Nit:” says it shouldn’t block the merge.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Label this comment so Sam knows it won’t block the merge.', code: '[[Nit|nit]]: add a space after the comma in listOf("Oslo","Lima").', why: 'A missing space doesn’t change what the code does, so it is a nit.' },
          { type: 'bug', prompt: 'One review comment is about the person, not the code. Tap it.', code: 'Must: this reads one past the end of any list and crashes.\nSuggestion: a loop over the list itself reads more clearly.\nDid you even run this?\nNit: name it cities, not c.', bug: 2, fix: 'Suggestion: check what the loop reads on its last round.', why: '“Did you even run this?” makes Sam defensive and helps him fix nothing. A comment about the code points him at the problem.' },
        ],
        quiz: [
          { q: 'Which comment follows the advice in this lesson?', options: ['“Must: this reads one past the end of the list and crashes. Use <code>for (city in cities)</code>.”', '“Wrong loop.”', '“Why would you write it like this?”'], a: 0, why: 'It is about the code, says why, and suggests a fix.' },
          { q: 'What does a comment that starts with “Nit:” mean?', options: ['A tiny point that shouldn’t block the merge', 'A bug that must be fixed', 'The reviewer is not sure'], a: 0, why: 'Labels tell the author which comments are required and which are optional.' },
          { q: 'A reviewer asks for a change you disagree with. What do you do?', options: ['Reply with your reason and talk it through', 'Ignore it and merge', 'Close the pull request'], a: 0, why: 'The reviewer may know something you don’t, or you may know something they don’t. Talking finds out which.' },
        ],
        docs: [['How to write code review comments', 'https://google.github.io/eng-practices/review/reviewer/comments.html'], ['How to handle reviewer comments', 'https://google.github.io/eng-practices/review/developer/handling-comments.html']],
      },

      {
        id: 'tech-debt',
        title: 'Technical debt',
        tagline: 'A shortcut saves time today and charges a little on every later change.',
        goals: ['Recognise a shortcut that becomes technical debt', 'Explain the “interest” it charges on later work', 'Pay it back in small steps, and write down what is left'],
        level: 'beginner', introduces: [],
        body: `
<p>The day before a release, Lin needs the temperature on three screens. The quickest way is to copy the same line onto all three. It works, and the release goes out on time. Two months later users ask for Fahrenheit, and Lin has to find and change every copy. She misses one.</p>
<p>That shortcut is <em>technical debt</em>: a quicker, messier way that saves time now and makes later changes slower. Like borrowed money, it charges <em>interest</em>: every later change that touches that code costs a bit extra. A little debt, taken on purpose and written down, can be a fair deal before a deadline. Debt that nobody remembers keeps growing.</p>
<p>Paying it back means cleaning up the code so the next change is easy again, here by moving the copied line into one function. Changing how code is built without changing what it does is called <em>refactoring</em>. Do it in small steps, next to the work that touches that code, and put the rest in the backlog as tickets, so it gets planned like any other work.</p>`,
        visual(el) {
          const b = (lane, from, to, label, tone) => ({ lane, from, to, label, tone });
          Lab.ui.timeline(el, {
            lanes: ['Copies', 'Cleaned up'],
            span: 10, unit: 'days',
            predict: {
              q: 'Team B spends one day cleaning up after the first change. After four changes, which team is done first?',
              options: ['Team A: it never lost a day', 'Team B: every later change is quicker', 'They finish at the same time'],
              a: 1,
              why: 'The cleanup costs one day once. The copies cost extra on every change that touches them.',
            },
            frames: [
              { now: 0, say: 'Two versions of the same team. Both need the temperature on three screens, then three more changes to it. Top lane: Team A keeps the copies. Bottom lane: Team B cleans up.' },
              { bars: [b(0, 0, 1, '1', 'warm'), b(1, 0, 1, '1', 'warm')], say: 'Change 1, day 1: both teams take the shortcut and copy the line onto three screens. The release goes out on time.' },
              { bars: [b(1, 1, 2, 'R', 'muted')], now: 2, say: 'Team B spends day 2 refactoring (bar R): moving the line into one function, <code>formatTemp</code>, and the three screens call it. Nothing new for users. Team A is ahead, for now.' },
              { bars: [b(0, 1, 4, '2 °F', 'err'), b(1, 2, 3, '2', 'ok')], say: 'Change 2, Fahrenheit. Team A changes three copies, misses one, and fixes the bug a user reports: 3 days. Team B changes one function: 1 day.' },
              { bars: [b(0, 4, 6.5, '3 feels like', 'err'), b(1, 3, 4, '3', 'ok')], say: 'Change 3, “feels like” temperatures. Team A again edits every copy. That extra time on every change is the interest.' },
              { bars: [b(0, 6.5, 9, '4 rounding', 'err'), b(1, 4, 5, '4', 'ok')], marks: [{ at: 5, label: 'B done', tone: 'ok' }, { at: 9, label: 'A done', tone: 'err' }], say: 'Change 4, rounding. After four changes, Team B is done on day 5, Team A on day 9. The day spent cleaning up paid for itself on the first change.' },
            ],
          });
        },
        code: `// Before: the same rule copied onto three screens
println("Now: " + temp + " °C")          // home screen
println("Today: " + max + " °C")         // daily screen
println("At 15:00: " + hourTemp + "°C")  // hourly screen: already different!

// After: one function, one place to change
fun formatTemp(celsius: Int): String = "$celsius °C"

println("Now: " + formatTemp(temp))      // Now: 21 °C
println("Today: " + formatTemp(max))     // Today: 24 °C
println("At 15:00: " + formatTemp(hourTemp))

// Not done yet? Write it down as a ticket instead of forgetting it:
// #41 Widget still builds its own temperature text. Use formatTemp.`,
        remember: 'Technical debt is a shortcut that makes later changes slower. Take it on purpose, write it down, and pay it back in small steps.',
        mistakes: [
          { title: 'Paying it all back with one big rewrite', bad: 'Stop all new features for two months\nand rewrite the whole app.', good: 'Clean up one piece at a time,\nnext to the feature that touches it.', why: 'A big rewrite delivers nothing to users for a long time and brings its own new bugs. Small clean-ups pay back the debt where the interest is highest: in the code you change most.' },
        ],
        terms: [
          { term: 'technical debt', def: 'A quicker, messier way of building something that saves time now and makes later changes slower.' },
          { term: 'interest (technical debt)', def: 'The extra time every later change costs because of the shortcut.' },
          { term: 'refactoring', def: 'Changing how code is built, without changing what it does, so it is easier to change next time.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pay back the debt: make both screens use the one function.', code: 'fun formatTemp(celsius: Int): String = "$celsius °C"\n\nprintln("Now: " + [[formatTemp]](temp))\nprintln("Today: " + [[formatTemp]](max))', why: 'Both screens call the same function, so a change to the format happens in one place.' },
          { type: 'bug', prompt: 'Lin paid back most of the debt, but one screen still has its own copy. Tap it.', code: 'fun formatTemp(celsius: Int): String = "$celsius °C"\nprintln("Now: " + formatTemp(temp))\nprintln("Today: " + max + " °C")\nprintln("At 15:00: " + formatTemp(hourTemp))', bug: 2, fix: 'println("Today: " + formatTemp(max))', why: 'This line still builds the text itself. When the format changes, it would be the one that gets missed.' },
        ],
        quiz: [
          { q: 'What is technical debt?', options: ['A shortcut that saves time now and makes later changes slower', 'Money the team owes for its tools', 'A bug that users reported'], a: 0, why: 'The “loan” is the time saved; the cost comes later.' },
          { q: 'What is the “interest” on technical debt?', options: ['The extra time every later change in that code costs', 'A fee paid every month', 'The time it took to write the shortcut'], a: 0, why: 'You pay it each time you touch the messy code, not on a calendar.' },
          { q: 'There is no time to clean up before tomorrow’s release. What is a good move?', options: ['Take the shortcut, and add a ticket to the backlog to pay it back', 'Take the shortcut and forget about it', 'Delay the release for a big rewrite'], a: 0, why: 'Debt taken on purpose and written down is a fair deal. Forgotten debt keeps growing.' },
        ],
        docs: [['Technical Debt (Martin Fowler)', 'https://martinfowler.com/bliki/TechnicalDebt.html'], ['Code refactoring in IntelliJ IDEA', 'https://www.jetbrains.com/help/idea/refactoring-source-code.html']],
      },

      {
        id: 'teamwork', ignore: ['out'],
        title: 'Working in a team',
        tagline: 'Give every job one owner, ask early, and say what you tried.',
        goals: ['Give every task one owner, and close the loop when it is done', 'Ask for help before you lose a day', 'Write a message someone can act on: what, what happened, what you tried'],
        level: 'beginner', introduces: [],
        body: `
<p>Ada’s team gets a report: “The app shows the wrong temperature in Oslo.” Three people read it. Each thinks someone else is on it. A week later, nobody has looked. Or the opposite: two people fix it at the same time, on two branches that conflict.</p>
<p><em>Ownership</em> fixes that. Every task has exactly one <em>owner</em>: the person who sees it through, or hands it on clearly. Saying “I’ll take this” and assigning the ticket to yourself (on GitHub, tickets are called <em>issues</em>, and the owner goes in the <b>Assignees</b> box) makes it visible to everyone. The owner doesn’t have to do it all alone. They make sure it isn’t dropped, and they <em>close the loop</em>: tell the person who asked when it is done.</p>
<p>Communication is mostly about the reader. When you are stuck, ask early: after trying for a while (half an hour is a good guide), not after two days. Write a message someone can act on without asking back: what you are trying to do, what happens instead, and what you already tried. Post it in the <em>team channel</em> (the team’s shared group chat), not in a private message, so whoever knows can answer, and the next person with the same problem can find it.</p>`,
        visual(el) {
          const ticket = h('div', { class: 'swe-doc' });
          const thread = h('div', { class: 'swe-pool' });
          const stage = h('div', { class: 'ui-stage swe-stage' }, ticket, h('span', { class: 'swe-label' }, 'Team channel'), thread);
          const MSG = {
            vague: ['Lin', 'Oslo is broken, help?', 'swe-blame'],
            clear: ['Lin', '#57: Oslo shows 9 °C, but the data says -9 °C. Lisbon (21 °C) is fine. So the minus sign gets lost on the way to the screen. Where do we turn the number into text?', 'swe-fair'],
            sam: ['Sam', 'That’s formatTemp in Temp.kt. I wrote it, so I’ll look with you for 10 minutes now.', ''],
            done: ['Lin', '#57 fixed in pull request #61, out in version 1.4.1. Maya, thanks for reporting!', 'swe-fair'],
          };
          const frames = [
            { owner: '', state: 'Open', m: [], say: 'A new ticket. Ada, Sam and Lin all read it, and each thinks someone else has it. With no owner, nothing happens.' },
            { owner: 'Lin', state: 'Open', m: [], say: 'Lin says “I’ll take this” at the stand-up and sets herself as the only assignee. Now everyone can see who has it.' },
            { owner: 'Lin', state: 'Open', m: ['vague'], say: 'After 30 minutes, Lin is stuck. Her first message gives the reader nothing to work with: what is broken? what did she see?' },
            { owner: 'Lin', state: 'Open', m: ['clear'], say: 'She rewrites it: what she sees, what she expected, what she checked, and one clear question. Posted in the team channel, where anyone can answer.' },
            { owner: 'Lin', state: 'Open', m: ['clear', 'sam'], say: 'Sam knows that code and answers in minutes. Lin is still the owner; Sam helps.' },
            { owner: 'Lin', state: 'Closed', m: ['clear', 'sam', 'done'], say: 'Fixed and released. Lin closes the loop: she tells Maya, who reported it, and closes the ticket.' },
          ];
          Lab.ui.player(el, {
            stage, frames,
            predict: {
              q: 'Lin is stuck on the Oslo bug. Which message gets her help fastest?',
              options: ['“Oslo is broken, help?”', '“#57: Oslo shows 9 °C, the data says -9 °C. Lisbon is fine. Where do we turn the number into text?”', 'No message: keep trying alone for two more days'],
              a: 1,
              why: 'It says what happens, what she checked and what she needs, so someone can answer without asking questions back.',
            },
            draw(f) {
              ticket.replaceChildren(
                h('h4', {}, '#57 Wrong temperature in Oslo'),
                h('div', { class: 'swe-stats' },
                  h('span', { class: 'swe-stat' }, 'Reported by: ', h('b', {}, 'Maya')),
                  h('span', { class: 'swe-stat' }, 'Assignees: ', h('b', {}, f.owner || 'No one')),
                  h('span', { class: 'swe-stat' }, 'Status: ', h('b', {}, f.state))));
              ticket.classList.toggle('swe-ok', f.state === 'Closed');
              thread.replaceChildren(...(f.m.length ? f.m.map(k => h('p', { class: 'swe-quote ' + MSG[k][2] }, h('b', {}, MSG[k][0] + ': '), MSG[k][1])) : [h('p', { class: 'swe-empty' }, '(no messages yet)')]));
            },
          });
        },
        code: `In the team channel, after 30 minutes stuck:

  #57 Wrong temperature in Oslo (owner: Lin)
  Trying to: show -9 °C for Oslo.
  Happens:   the screen shows 9 °C.
  Tried:     the data really says -9. Lisbon (21 °C) shows fine.
  Question:  where do we turn the number into text?

Later, on the ticket:

  Fixed in pull request #61, out in version 1.4.1.
  Maya, thanks for reporting! Closing.`,
        remember: 'Every task has one owner. Ask early, in the open, saying what you tried. Close the loop when it is done.',
        mistakes: [
          { title: 'A message that needs a second message', bad: 'Private message to Sam: "are you there?"', good: 'Team channel: "#57: Oslo shows 9 °C, the data\nsays -9 °C. Where do we turn the number into text?"', why: '“Are you there?” makes Sam stop and wait for the real question. Asking it straight away, in the open, lets anyone who knows answer.' },
        ],
        terms: [
          { term: 'owner', def: 'The one person responsible for seeing a task through, shown as its assignee.' },
          { term: 'close the loop', def: 'When a task is done, tell the person who asked for it, and close the ticket.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete Lin’s message so Sam can help without asking back.', code: 'Trying to: show -9 °C for Oslo\nHappens: the screen shows 9 °C\n[[Tried|tried]]: the data says -9; Lisbon shows fine', why: 'What you already tried saves the helper from suggesting it again.' },
          { type: 'bug', prompt: 'This ticket has an ownership problem. Tap the line that causes it.', code: '#57 Wrong temperature in Oslo\nAssignees: Lin, Sam, Ada\nLabel: bug\nReported by: Maya', bug: 1, fix: 'Assignees: Lin', why: 'Three owners means each can think another one has it. One owner is clear; others can still help.' },
        ],
        quiz: [
          { q: 'Three people read a bug report and each thinks someone else has it. What prevents this?', options: ['One named owner, visible on the ticket', 'More people reading it', 'Waiting for the next sprint'], a: 0, why: 'When the ticket shows one name, nobody has to guess.' },
          { q: 'You have been stuck for 30 minutes. What is a good next step?', options: ['Ask the team, saying what you tried', 'Keep trying alone for two more days', 'Start another task without telling anyone'], a: 0, why: 'A teammate who knows the code may answer in minutes.' },
          { q: 'The bug is fixed and released. What does “closing the loop” mean here?', options: ['Telling the person who reported it, and closing the ticket', 'Deleting the branch', 'Starting the next sprint'], a: 0, why: 'The person who asked shouldn’t have to wonder whether anything happened.' },
        ],
        docs: [['Assigning issues and pull requests to other GitHub users', 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/assigning-issues-and-pull-requests-to-other-github-users'], ['About issues', 'https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues']],
      },
    ],
  });
})();
