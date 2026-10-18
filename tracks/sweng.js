/* Software engineering practice track. Same shape as tracks/kotlin.js.
   The university software engineering course, made practical for a mobile team: life cycle, agile, estimation,
   design docs, code review, technical debt, incidents. Every class is prefixed swe-. */
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

/* incident timeline */
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

  const lessons = [];

  // 1 ─────────────────────────────────────────────
  lessons.push({
    id: 'sdlc',
    title: 'The software development life cycle',
    tagline: 'Every feature goes through the same phases. The question is how big a batch you push through them at once.',
    level: 'beginner',
    body: `
<p>Every piece of software moves through the same phases: <b>requirements</b> (what should it do), <b>design</b> (how will it work), <b>build</b> (write the code), <b>test</b> (does it work), <b>release</b> (get it to users) and <b>maintain</b> (fix, update, keep it running). This is the software development life cycle, or SDLC.</p>
<p>In <b>waterfall</b> you do each phase once, for the whole project, in order. It looks tidy on paper, but users see nothing until the end, and a requirement that changes late sends you back up the waterfall. In <b>iterative</b> development you run all the phases on a small slice, ship it, learn, and repeat. The phases don't go away; they just get short.</p>
<p>Mobile teams lean iterative because shipping is cheap to repeat, but not free: releases go through store review and staged rollouts, and old app versions keep running on phones for a long time. Run the demo with and without a late requirement change.</p>`,
    code: `# One small iteration on a mobile team, start to finish
git switch -c feature/save-article          # build: a short-lived branch
./gradlew testDebugUnitTest lintDebug       # test: unit tests and lint on every change
git push -u origin feature/save-article     # review: open a pull request, CI runs again

# after review and merge to main
./gradlew bundleRelease                     # release: build the signed App Bundle
git tag v5.12.0 && git push origin v5.12.0  # mark what shipped, so you can maintain it later`,
    remember: 'The phases never disappear. Iterative work just runs all of them on a small slice, so you learn before the big money is spent.',
    predict: {
      q: "No requirement changes this time. Which plan gets a first working slice to users first?",
      options: ["Waterfall, in month 11", "Iterative, in month 3", "Both in month 11"],
      a: 1,
      why: "Iterative work runs every phase on a small slice, so the first slice ships after one short cycle. Waterfall ships nothing until all phases are done.",
    },
    visual(el) {
      const W = 'RRDDBBBBTTS'.split(''), WC = 'RRDDBBBDBBBTTS'.split('');
      const I = 'DBSDBSDBSDBS'.split('');
      let change = false, tok = 0;
      const head = (name) => { const r = h('b', {}, ''); return [h('div', { class: 'swe-tl-head' }, h('span', {}, name), r), r]; };
      const [wh, wr] = head('Waterfall'), [ih, ir] = head('Iterative');
      const wrow = h('div', { class: 'swe-cells' }), irow = h('div', { class: 'swe-cells' });
      const month = h('b', {}, '0');
      const msg = out('Press Run to play a 14-month project, one month per step.');
      function draw(m) {
        const w = change ? WC : W;
        const fill = (row, plan, chgAt) => row.replaceChildren(...Array.from({ length: 14 }, (_, k) => {
          const p = plan[k];
          return h('div', { class: `swe-cell ${p ? 'swe-ph-' + p : 'swe-none'} ${k < m ? 'swe-lit' : ''} ${change && k === chgAt ? 'swe-chg' : ''}`, title: p ? `Month ${k + 1}` : null }, p === 'S' ? '▲' : p || '');
        }));
        fill(wrow, w, 7); fill(irow, I, 6);
        const ships = (plan) => plan.slice(0, m).filter(p => p === 'S').length;
        wr.textContent = `${ships(w)} release${ships(w) === 1 ? '' : 's'}`;
        ir.textContent = `${ships(I)} release${ships(I) === 1 ? '' : 's'}`;
        month.textContent = String(m);
      }
      async function run() {
        const t = ++tok;
        for (let m = 1; m <= 14; m++) {
          draw(m);
          if (change && m === 7) say(msg, 'Month 7: product changes a requirement. Waterfall is in the middle of building the old design, so it goes back to design. Iterative folds it into the next slice.');
          else if (m === 3) say(msg, 'Month 3: the iterative team ships its first slice and gets real feedback. The waterfall team is still designing.');
          await sleep(480);
          if (t !== tok || !el.isConnected) return;
        }
        say(msg, change
          ? 'With the change: waterfall ships once, in month 14, three months late. Iterative still ships every 3 months; the change cost one slice of planning.'
          : 'No change: waterfall ships once, in month 11. Iterative shipped 4 times, so users had the first slice 8 months earlier.');
      }
      const chg = act('Late requirement change: off', () => { change = !change; chg.textContent = `Late requirement change: ${change ? 'on' : 'off'}`; chg.setAttribute('aria-pressed', String(change)); tok++; draw(0); say(msg, change ? 'A requirement will change in month 7. Press Run.' : 'No changes this time. Press Run.'); }, { 'aria-pressed': 'false' });
      el.append(h('div', { class: 'swe-stage' },
        h('div', { class: 'swe-tl' }, wh, wrow), h('div', { class: 'swe-tl' }, ih, irow),
        h('div', { class: 'swe-legend' }, [['Requirements', 'accent'], ['Design', 'warm'], ['Build', 'muted'], ['Test', 'ok']].map(([n, c]) => h('span', {}, h('i', { style: `border-color:var(--${c})` }), n)), h('span', {}, '▲ Release')),
        h('span', { class: 'swe-stat' }, 'month ', month, ' of 14')),
        h('div', { class: 'controls' }, act('Run', run), chg), msg);
      draw(0);
    },
    deeper: [
      {
        title: 'Each phase hands something to the next',
        body: `<p>A phase is done when it produces something the next phase can use. Requirements produce user stories with acceptance criteria. Design produces a design doc or a screen spec. Build produces merged code. Test produces passing checks and a tested build. Release produces a version in users' hands. Maintain produces bug fixes and the next round of requirements, from crash reports and feedback.</p>
<p>If you can't name what a phase handed over, that phase was skipped, even if time passed.</p>`,
      },
      {
        title: 'Late changes touch more finished work',
        body: `<p>A wrong requirement caught while writing the story costs a conversation. Caught in design, it costs a redraw. Caught after the code is built and tested, it costs the code, the tests and the review. Caught after release, it also costs a new store release and support for the users who have the old version.</p>
<p>That is the real argument for iterating: each slice reaches the "real users" check early, so mistakes are found while the pile of work they touch is small.</p>`,
      },
      {
        title: 'Maintenance never ends on mobile',
        body: `<p>Once a version is out, it stays on some phones for a long time, because not everyone updates. Your backend has to keep serving old app versions, and a bug in an old version can't be fixed by a server deploy. Plan for it: version your APIs, use remote config or <a href="#launch.flags">feature flags</a> to switch behavior without a release, and consider <a href="#launch.updates">in-app updates</a> for versions you must retire.</p>`,
      },
    ],
    mistakes: [
      { title: 'Testing as the last phase', bad: 'Sprint 1-3: build the whole feature\nSprint 4:   QA tests everything\n            (finds 40 bugs, no time left)', good: 'Every story: code + unit tests + review\nDone means: tested on a real device\nCI runs the tests on every pull request', why: 'Test is a phase of every slice, not of the project. Bugs found late are found when there is no time left to fix them well. See <a href="#testing.pyramid">the testing pyramid</a> and <a href="#tools.ci">CI</a>.' },
      { title: 'Calling it iterative when only build is split', bad: 'Month 1: requirements for everything\nMonth 2-5: build in 2-week "sprints"\nMonth 6: release', good: 'Every 2 weeks: plan a slice, build it,\ntest it, ship it (to beta or internal\ntrack), learn from it', why: 'If nothing reaches a user until the end, it is still waterfall with shorter meetings. Iterative means each slice goes through release, even if the release is to an internal test track first.' },
    ],
    terms: [
      { term: 'SDLC', def: 'Software development life cycle: requirements, design, build, test, release and maintain.' },
      { term: 'Waterfall', def: 'Doing each life cycle phase once, for the whole project, in strict order.' },
      { term: 'Iterative development', def: 'Running all the phases repeatedly on small slices, and revising earlier work as you learn.' },
      { term: 'Increment', def: 'A working, usable slice of the product added in one iteration.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fill in the missing phases of the life cycle.', code: 'requirements -> [[design]] -> build -> [[test|testing]] -> release -> [[maintain|maintenance]]', why: 'Design comes before build, test before release, and maintain follows release, feeding the next round of requirements.' },
      { type: 'bug', prompt: 'This team says it works iteratively. Tap the line that breaks the idea.', code: 'Sprint 1: login screen, built, tested, on the beta track\nSprint 2: news feed, built, tested, on the beta track\nSprint 3: push settings, built, tested, on the beta track\nSprint 4: test everything from sprints 1-3\nSprint 5: profile screen, built, tested, on the beta track', bug: 3, fix: 'Sprint 4: saved articles, built, tested, on the beta track', why: 'Testing belongs to each slice. A "test everything" sprint means sprints 1-3 were not really done, and the bugs pile up for the end.' },
    ],
    quiz: [
      { q: 'A requirement changes in month 7 of a 12-month waterfall project, during build. What happens?', options: ['The team goes back to design, then reworks code that is already built', 'Nothing, build absorbs it for free', 'The change waits for version 2, at no cost'], a: 0, why: 'Waterfall designed everything up front, so a late change invalidates finished design and code. Iterative work only has one small slice in progress when the change arrives.' },
      { q: 'Which order is right?', options: ['Requirements, design, build, test, release, maintain', 'Design, requirements, build, release, test, maintain', 'Build, test, requirements, design, release, maintain'], a: 0, why: 'You decide what to build, then how, then build it, check it, ship it and keep it running. Iteration repeats this order on small slices.' },
      { q: 'Why does maintenance weigh more on mobile than on a website?', options: ['Old app versions keep running on phones, and you can\'t redeploy them', 'Mobile code never has bugs after release', 'Stores maintain the app for you'], a: 0, why: 'A website updates for everyone on deploy. An app update reaches people only when they install it, so the backend must keep supporting old versions.' },
    ],
  });

  // 2 ─────────────────────────────────────────────
  lessons.push({
    id: 'agile',
    title: 'Agile in practice: Scrum and Kanban',
    tagline: 'Short cycles, a visible board, and a limit on how much you start at once.',
    level: 'beginner',
    body: `
<p>The <a href="https://agilemanifesto.org/" target="_blank" rel="noopener">Agile Manifesto</a> (2001) values working software over comprehensive documentation and responding to change over following a plan. Scrum and Kanban are two common ways to put that into practice.</p>
<p><b>Scrum</b> works in fixed sprints of one month or less, often two weeks. Each sprint starts with Sprint Planning, has a 15-minute Daily Scrum (the stand-up), and ends with a Sprint Review (show what was built) and a Sprint Retrospective (improve how you work). The Scrum Guide names three accountabilities: Product Owner, Scrum Master and Developers. <b>Kanban</b> has no sprints. Work flows across a board, and the team controls how many items are in progress at once, so new work starts only when there is room.</p>
<p>Both use <b>stories</b>: a small piece of user value, with <b>acceptance criteria</b> that say exactly when it works. Move the cards in the demo. With WIP limits on, a full column refuses new work, and you'll see why that makes things finish sooner.</p>`,
    code: `// Story: As a reader, I want to save an article,
// so that I can read it on the metro without signal.
//
// Acceptance criteria, written as Given / When / Then:
// AC1 Given I am online, when I tap Save, then the article appears under "Saved".
// AC2 Given a saved article, when I go offline and open it, then the full text shows.
// AC3 Given a saved article, when I tap Save again, then it is removed.

class SaveArticleTest {
    private val repo = FakeArticleRepository()
    private val viewModel = ArticleViewModel(repo)

    @Test
    fun \`AC1 saved article is listed under saved\`() = runTest {
        viewModel.toggleSave(articleId = "a42")
        assertEquals(listOf("a42"), repo.savedIds())
    }

    @Test
    fun \`AC3 saving twice removes it\`() = runTest {
        viewModel.toggleSave("a42")
        viewModel.toggleSave("a42")
        assertTrue(repo.savedIds().isEmpty())
    }
}`,
    remember: 'Stop starting, start finishing. A story is done when its acceptance criteria pass, not when the code is written.',
    predict: {
      q: "WIP limits off: you start all six cards on day 1 and work on them a little each day. Compared with WIP limits on, what happens to the average cycle time?",
      options: ["It drops: more work started means more finished", "It rises: every started card keeps aging while it waits", "It stays the same"],
      a: 1,
      why: "Cycle time counts from start to finish. Starting everything at once makes every card wait longer for attention, so each one takes longer.",
    },
    visual(el) {
      const COLS = ['To do', 'Doing', 'Review', 'Done'], LIMIT = [0, 2, 1, 0];
      const NAMES = ['Login screen', 'Save article', 'Dark theme', 'Push opt-in', 'Search bar', 'Share button'];
      let cards, day, wip = true, done;
      const colEls = COLS.map(() => h('div', { class: 'swe-col' }));
      const st = { day: h('b', {}, '1'), wip: h('b', {}, '0'), done: h('b', {}, '0'), cycle: h('b', {}, '-') };
      const msg = out('');
      function reset() { cards = NAMES.map(t => ({ t, col: 0, age: 0 })); day = 1; done = []; paint(); say(msg, 'Tap a card to move it one column right. Press "Next day" to let time pass.'); }
      function paint() {
        colEls.forEach((c, k) => {
          const inCol = cards.filter(x => x.col === k);
          const lim = wip && LIMIT[k];
          c.classList.toggle('swe-full', !!lim && inCol.length >= lim);
          c.replaceChildren(h('div', { class: 'swe-col-h' }, h('span', {}, COLS[k]), h('b', {}, lim ? `${inCol.length}/${lim}` : String(inCol.length))),
            ...inCol.map(x => h('button', { class: `swe-card ${x.col === 3 ? 'swe-done' : x.age >= 4 ? 'swe-old' : ''}`, onclick: e => move(x, e.currentTarget) },
              x.t, x.col === 1 || x.col === 2 ? h('small', {}, `age ${x.age}d`) : x.col === 3 ? h('small', {}, `took ${x.age}d`) : null)));
        });
        st.day.textContent = String(day);
        st.wip.textContent = String(cards.filter(x => x.col === 1 || x.col === 2).length);
        st.done.textContent = String(done.length);
        st.cycle.textContent = done.length ? `${(done.reduce((s, x) => s + x.age, 0) / done.length).toFixed(1)}d` : '-';
      }
      function move(x, btn) {
        if (x.col === 3) return;
        const to = x.col + 1, lim = wip && LIMIT[to];
        if (lim && cards.filter(c => c.col === to).length >= lim) {
          replay(btn, 'shake');
          say(msg, `<b>${COLS[to]}</b> is full (${lim}/${lim}). Finish or review something already started before pulling more in.`);
          return;
        }
        if (to === 1) x.age = 1;
        x.col = to;
        if (to === 3) { done.push(x); say(msg, `"${x.t}" is done after ${x.age} day${x.age === 1 ? '' : 's'} in progress. That is its cycle time.`); }
        else if (to === 1) say(msg, `Started "${x.t}". Its age counts from today.`);
        else say(msg, `"${x.t}" waits for a reviewer. Review is part of the work, so it still counts as WIP.`);
        paint();
      }
      function nextDay() {
        day++;
        cards.forEach(x => { if (x.col === 1 || x.col === 2) x.age++; });
        const old = cards.filter(x => (x.col === 1 || x.col === 2) && x.age >= 4);
        say(msg, old.length ? `Day ${day}. ${old.map(x => `"${x.t}"`).join(', ')} ${old.length === 1 ? 'has' : 'have'} been in progress 4+ days (red). Old items are the first thing to discuss at stand-up.` : `Day ${day}. Every started card got one day older.`);
        paint();
      }
      const wipB = act('WIP limits: on', () => { wip = !wip; wipB.textContent = `WIP limits: ${wip ? 'on' : 'off'}`; wipB.setAttribute('aria-pressed', String(wip)); paint(); say(msg, wip ? 'Limits on: Doing holds 2, Review holds 1.' : 'Limits off. Try starting all six cards, then press Next day a few times and watch the ages and the cycle time.'); }, { 'aria-pressed': 'true' });
      el.append(h('div', { class: 'swe-stage' }, h('div', { class: 'swe-board' }, colEls),
        h('div', { class: 'swe-stats' }, h('span', { class: 'swe-stat' }, 'day ', st.day), h('span', { class: 'swe-stat' }, 'WIP ', st.wip), h('span', { class: 'swe-stat' }, 'throughput ', st.done), h('span', { class: 'swe-stat' }, 'avg cycle time ', st.cycle))),
        h('div', { class: 'controls' }, act('Next day', nextDay), wipB), msg);
      reset();
    },
    deeper: [
      {
        title: 'The Scrum events and their timeboxes',
        body: `<p>The 2020 Scrum Guide sets maximum lengths, given for a one-month sprint (shorter sprints usually use less): Sprint Planning up to 8 hours, Daily Scrum 15 minutes, Sprint Review up to 4 hours, Sprint Retrospective up to 3 hours. A Scrum Team is typically 10 or fewer people.</p>
<p>It also names three artifacts, each with a commitment: the Product Backlog (the Product Goal), the Sprint Backlog (the Sprint Goal) and the Increment (the Definition of Done).</p>`,
      },
      {
        title: 'Acceptance criteria vs Definition of Done',
        body: `<p>Acceptance criteria belong to one story: "saving twice removes the article". The Definition of Done applies to every story: "reviewed, unit tests pass, tested on a small and a large screen, strings translated, analytics events added". A story is done only when both hold.</p>
<p>Writing criteria as Given / When / Then makes them easy to turn into tests, like the code above.</p>`,
      },
      {
        title: 'Kanban measures flow',
        body: `<p>The Kanban Guide asks teams to track four measures: <b>WIP</b> (started, not finished), <b>throughput</b> (how many finish per period), <b>work item age</b> (how long a started item has been going) and <b>cycle time</b> (start to finish). The demo shows all four.</p>
<p>Work item age is the early warning: a card that keeps getting older is stuck, and you can act before its cycle time is ruined.</p>`,
      },
      {
        title: 'Make the retrospective change something',
        body: `<p>A retro that ends with ten complaints and no owner changes nothing. Pick one or two actions, give each an owner, and check them at the start of the next retro. "Ask backend for the API contract before sprint planning, owner: Maya" beats "communicate better".</p>`,
      },
    ],
    mistakes: [
      { title: 'A story that is a task', bad: 'Story: Add Room table for articles', good: 'Story: As a reader, I can save an article\nand read it offline.\nTasks: Room table, Save button, offline screen', why: 'A story describes user value, so the product owner can prioritize it and QA can check it. Technical steps are tasks inside the story.' },
      { title: 'Acceptance criteria nobody can test', bad: 'AC: Saving should be fast and easy.', good: 'AC: Given I am online, when I tap Save,\nthen the icon fills within 300 ms\nand the article is under "Saved".', why: '"Fast and easy" can\'t fail. Given / When / Then with a concrete result can, which is what makes it useful.' },
    ],
    terms: [
      { term: 'Sprint', def: 'A fixed-length Scrum iteration of one month or less in which the team builds a usable increment.' },
      { term: 'WIP limit', def: 'A cap on how many items can be in a workflow step at once, so the team finishes work before starting more.' },
      { term: 'Acceptance criteria', def: 'Concrete, testable conditions one story must meet to count as working.' },
      { term: 'Cycle time', def: 'The time from when work on an item starts to when it is finished.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Complete the acceptance criterion in the Given / When / Then form.', code: '[[Given]] I am offline and have a saved article,\n[[when|When]] I open it from "Saved",\n[[then|Then]] the full text and images show.', why: 'Given sets the starting state, When is the user action, Then is the result you can check.' },
      { type: 'bug', prompt: 'This is a team\'s Definition of Done. One line does not belong. Tap it.', code: 'Code reviewed and merged to main\nUnit tests pass in CI\nTested on a small phone and a tablet\nStrings added in English and Spanish\nWill be tested by QA next sprint', bug: 4, fix: 'Tested by QA on the release build', why: 'Done means done now. Pushing testing into a future sprint leaves the story unfinished and hides the bugs.' },
    ],
    quiz: [
      { q: 'Doing holds 2 cards and is at its WIP limit. A developer is free. What should they do first?', options: ['Help finish or review an item already in progress', 'Start a new card anyway, the limit is a suggestion', 'Wait idle until the next sprint'], a: 0, why: 'The limit pushes free people toward finishing started work, which lowers cycle time. Starting more just adds age to everything.' },
      { q: 'What is the maximum length of a Scrum sprint?', options: ['One month', 'Two weeks exactly', 'Three months'], a: 0, why: 'The Scrum Guide sets sprints at one month or less. Two weeks is common, but it is a team choice.' },
      { q: 'Which one is a good story?', options: ['As a reader, I want to save an article so I can read it offline', 'Refactor ArticleRepository', 'Make the app better'], a: 0, why: 'It names a user, a need and the value. A refactor is a task, and "make it better" has nothing to test.' },
      { q: 'The team finishes few items and every card stays "in progress" for weeks. Which change helps most?', options: ['Lower the WIP limit and swarm on the oldest card', 'Add more columns to the board', 'Make stand-ups longer'], a: 0, why: 'High WIP spreads attention thin, so everything ages. Fewer items in progress means each one finishes sooner.' },
    ],
  });

  // 3 ─────────────────────────────────────────────
  lessons.push({
    id: 'estimation',
    title: 'Requirements and estimation',
    tagline: 'Split work small, estimate in ranges, and expect early guesses to be far off.',
    level: 'intermediate',
    body: `
<p>A user story names who wants what and why. Before you estimate it, <b>split</b> it until each piece fits in a sprint. Bill Wake's INVEST checklist says a good story is Independent, Negotiable, Valuable, Estimable, Small and Testable. "Offline reading" is too big; "save one article", "list saved articles" and "open a saved article offline" are each small and still useful.</p>
<p>Teams estimate in <b>story points</b> (relative size: this is about twice that) or in time. Points avoid arguing about hours and, with <b>velocity</b> (points finished per sprint), give a forecast. Time estimates are easier to explain to people outside the team. Either way, estimates go wrong for the same reasons: unknowns nobody listed yet, optimism, and forgetting work that isn't code, like review, QA, translations, store review and waiting for an API.</p>
<p>Steve McConnell's <b>cone of uncertainty</b> shows that an estimate made at the very first idea can be off by a factor of 4 either way, and that the range narrows only as the team makes decisions that remove unknowns. Drop estimates at each stage in the demo, then turn decisions off.</p>`,
    code: `// Forecast with a range, from real velocity, not one hopeful number
fun forecastSprints(remainingPoints: Int, recentVelocities: List<Int>): IntRange {
    require(recentVelocities.isNotEmpty() && recentVelocities.all { it > 0 })
    fun sprintsAt(velocity: Int) = (remainingPoints + velocity - 1) / velocity   // round up
    val best = sprintsAt(recentVelocities.max())
    val worst = sprintsAt(recentVelocities.min())
    return best..worst
}

fun main() {
    val range = forecastSprints(remainingPoints = 55, recentVelocities = listOf(18, 12, 21, 15))
    println("Offline reading: ${'$'}{range.first} to ${'$'}{range.last} sprints")   // 3 to 5 sprints
}`,
    remember: 'Give a range, say what would narrow it, and re-estimate when you learn something. A single early number is a guess wearing a suit.',
    predict: {
      q: "Decisions are on. The team has split the stories and agreed on the design. What does a \"10 day\" estimate mean now?",
      options: ["2.5 to 40 days", "About 6.7 to 15 days", "Exactly 10 days"],
      a: 1,
      why: "Each decision removes unknowns, so the cone narrows. At the design stage it is about 1.5× either way, not 4×.",
    },
    visual(el) {
      const STAGES = ['Idea', 'Stories split', 'Design agreed', 'Half built', 'Nearly done'];
      const HI = [4, 2, 1.5, 1.25, 1.1];
      const W = 320, H = 210, X0 = 44, X1 = 300, Y = v => 105 - Math.log2(v) * 42;
      const xs = STAGES.map((_, k) => X0 + (X1 - X0) * k / (STAGES.length - 1));
      let decide = true, stage = 0;
      const svg = svgEl('svg', { class: 'swe-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Cone of uncertainty: actual effort divided by estimate, by project stage' });
      const cone = svgEl('polygon', { class: 'swe-cone' });
      const dots = svgEl('g', {});
      svg.append(cone);
      [4, 2, 1, 0.5, 0.25].forEach(v => {
        svg.append(svgEl('line', { class: v === 1 ? 'swe-one' : 'swe-axis', x1: X0 - 6, x2: X1 + 6, y1: Y(v), y2: Y(v), 'stroke-opacity': v === 1 ? 1 : 0.35 }));
        const t = svgEl('text', { x: 2, y: Y(v) + 3 }); t.textContent = `${v}x`; svg.append(t);
      });
      STAGES.forEach((s, k) => { const t = svgEl('text', { x: xs[k], y: H - 2, 'text-anchor': 'middle' }); t.textContent = String(k + 1); svg.append(t); });
      svg.append(dots);
      const bound = k => decide ? HI[k] : 4;
      function drawCone() {
        const top = xs.map((x, k) => `${x},${Y(bound(k))}`), bot = xs.map((x, k) => `${x},${Y(1 / bound(k))}`).reverse();
        cone.setAttribute('points', [...top, ...bot].join(' '));
      }
      const msg = out('');
      const range = h('b', {}, '');
      function info() {
        const b = bound(stage), lo = 10 / b, hi = 10 * b;
        range.textContent = `${(1 / b).toFixed(2)}x to ${b}x`;
        return `A "10 day" estimate here really means <b>${lo.toFixed(1)} to ${hi.toFixed(0)} days</b>.`;
      }
      function drop() {
        const b = bound(stage);
        for (let i = 0; i < 10; i++) {
          // ponytail: skew toward overruns, like real projects; uniform in log space inside the cone
          const r = Math.pow(2, (Math.random() * 2 - 0.75) * Math.log2(b));
          dots.append(svgEl('circle', { class: 'swe-dot', cx: xs[stage] + (Math.random() * 16 - 8), cy: Y(Math.min(b, Math.max(1 / b, r))), r: 3.6, style: `animation-delay:${i * 40}ms` }));
        }
        const late = decide ? '' : ' Decisions are off, so the team is no surer than on day one.';
        say(msg, `Stage ${stage + 1}, ${STAGES[stage]}: 10 estimates dropped. Each dot is actual ÷ estimate; 1x means spot on. ${info()}${late}`);
      }
      const stageP = picker('Stage', STAGES.map((s, k) => `${k + 1} ${s}`), k => { stage = k; say(msg, `Stage ${k + 1}: ${STAGES[k]}. ${info()} Press "Estimate 10 times".`); });
      const decB = act('Decisions made: yes', () => {
        decide = !decide; decB.textContent = `Decisions made: ${decide ? 'yes' : 'no'}`; decB.setAttribute('aria-pressed', String(decide));
        dots.replaceChildren(); drawCone();
        say(msg, decide ? 'Decisions on: each stage answers open questions, so the cone narrows.' : 'Decisions off: the team keeps building without settling scope or design. The cone stays as wide as on day one. It only narrows when you remove unknowns.');
      }, { 'aria-pressed': 'true' });
      el.append(h('div', { class: 'swe-stage' }, svg,
        h('div', { class: 'swe-stats' }, h('span', { class: 'swe-stat' }, 'range at this stage: ', range)),
        h('p', { class: 'swe-note' }, 'Ranges follow McConnell\'s cone (0.25x to 4x at the initial concept, down to 0.9x to 1.1x); the stage names are simplified and the dots are random.')),
        stageP, h('div', { class: 'controls' }, act('Estimate 10 times', drop), decB), msg);
      drawCone();
      say(msg, `Stage 1: Idea. ${info()} Press "Estimate 10 times".`);
    },
    deeper: [
      {
        title: 'Splitting a story',
        body: `<p>Split along the user's path, not along layers. "Backend, then UI" gives two halves that are each useless alone. Useful splits for a mobile feature:</p>
<ul><li><b>Happy path first:</b> save works online; errors and offline come next.</li><li><b>By operation:</b> save, list, remove.</li><li><b>By data:</b> text only first, images later.</li><li><b>By platform or screen size:</b> phone first, tablet layout as its own story.</li></ul>
<p>Each slice should still pass its own acceptance criteria and be shippable behind a <a href="#launch.flags">feature flag</a>.</p>`,
      },
      {
        title: 'Points, velocity and why points are relative',
        body: `<p>The Agile Alliance glossary describes story points as relative measures of effort, not fixed durations. The team picks a reference story ("Share button = 2") and sizes others against it. Velocity is how many points the team actually finishes per sprint. Dividing the remaining points by a range of past velocities gives a forecast range, like the code above.</p>
<p>Points stop working when they become targets. If velocity is a performance goal, estimates inflate and the forecast means nothing.</p>`,
      },
      {
        title: 'List the work that is not code',
        body: `<p>Most mobile estimates miss the same items. Before you give a number, walk this list:</p>
<ul><li>Code review rounds and CI fixes</li><li>Testing on small, large and old devices, light and dark</li><li>Strings in every language you ship (English and Spanish, say)</li><li>Analytics events and their dashboards</li><li>Waiting for a backend endpoint or a design</li><li>Store review and a staged rollout</li></ul>`,
      },
    ],
    mistakes: [
      { title: 'One number, given on day one', bad: 'PM: How long for offline reading?\nDev: Two weeks.', good: 'Dev: Between 2 and 6 weeks today.\nI can narrow it once we agree on\nimages and sync. I\'ll update Friday.', why: 'At the idea stage the cone is widest. A range is honest, and naming what would narrow it turns the estimate into a plan.' },
      { title: 'Splitting by layer', bad: 'Story 1: Saved articles API\nStory 2: Saved articles Room table\nStory 3: Saved articles screen', good: 'Story 1: Save one article and see it listed\nStory 2: Open a saved article offline\nStory 3: Remove a saved article', why: 'Layer slices deliver nothing to a user until all three are done. User-path slices each work end to end, so you can ship and learn after the first.' },
    ],
    terms: [
      { term: 'Story point', def: 'A relative unit of effort for a story, compared against reference stories, not a fixed number of hours.' },
      { term: 'Velocity', def: 'How many story points a team actually finishes in a sprint, used to forecast.' },
      { term: 'Cone of uncertainty', def: 'The range of estimate error over a project: widest at the start, narrowing only as decisions remove unknowns.' },
      { term: 'INVEST', def: 'Checklist for a good story: Independent, Negotiable, Valuable, Estimable, Small, Testable.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Round up, so 55 points at 18 per sprint is 4 sprints, not 3.', code: 'fun sprintsAt(points: Int, velocity: Int) =\n    (points + velocity - [[1]]) / [[velocity]]', why: 'Adding velocity - 1 before integer division rounds up. A partial sprint is still a sprint.' },
      { type: 'bug', prompt: 'This forecast should be a range from the best to the worst sprint. Tap the wrong line.', code: 'fun forecast(points: Int, velocities: List<Int>): IntRange {\n    val best = sprintsAt(points, velocities.max())\n    val worst = sprintsAt(points, velocities.max())\n    return best..worst\n}', bug: 2, fix: '    val worst = sprintsAt(points, velocities.min())', why: 'The worst case uses the lowest velocity. With max on both lines the range collapses to one hopeful number.' },
    ],
    quiz: [
      { q: 'At the idea stage you estimate 10 days. Using the cone, what range should you expect?', options: ['About 2.5 to 40 days', 'About 9 to 11 days', 'Exactly 10 days if the team is good'], a: 0, why: 'McConnell\'s cone starts at 0.25x to 4x. Skill doesn\'t remove unknowns that nobody has decided yet.' },
      { q: 'The team is halfway through but has not settled scope or design. What does the cone say?', options: ['The range is still wide, because it narrows only with decisions', 'It is narrow, because half the time has passed', 'It no longer applies after the start'], a: 0, why: 'Time passing doesn\'t remove uncertainty. Answering open questions does.' },
      { q: 'Which split of "offline reading" is best?', options: ['Save and list, then open offline, then remove', 'API, then database, then UI', 'Android first, tests later'], a: 0, why: 'Each slice works end to end for the user, so it can be tested and shipped alone.' },
      { q: 'Velocities were 18, 12, 21 and 15. 55 points remain. Which forecast is the most honest?', options: ['3 to 5 sprints', '3 sprints', '55 / 16.5 = 3.33 sprints'], a: 0, why: '55/21 rounds up to 3 and 55/12 rounds up to 5. A range shows the real spread; a precise decimal hides it.' },
    ],
  });

  // 4 ─────────────────────────────────────────────
  const DOC = [
    { k: 'Problem', t: 'Readers lose articles they meant to read later, and the app shows nothing on the metro without signal.', ask: 'What problem are we solving, and for whom? Is there data, like support tickets?' },
    { k: 'Goals', t: 'Save up to 200 articles; open any saved article offline with text and images.', ask: 'How will we know it worked? I need something measurable.' },
    { k: 'Non-goals', t: 'No sync across devices in v1. No saving videos.', ask: 'What are we explicitly not doing? Otherwise sync and video will creep in.' },
    { k: 'Options', t: 'A) Room + WorkManager prefetch. B) HTTP cache only. C) Do nothing, add a "read later" link to email.', ask: 'What else did you consider? Is "do nothing" on the list?' },
    { k: 'Decision', t: 'A: Room + WorkManager. HTTP cache can be evicted any time, so saved articles could vanish.', ask: 'Which option, and why that one over the others?' },
    { k: 'Risks', t: 'Storage use on small phones: cap images at 1 MB each, show storage used in settings. Backend must add an article-by-id endpoint.', ask: 'What could go wrong, and what do we need from other teams?' },
  ];
  lessons.push({
    id: 'design-doc',
    title: 'Writing a design doc or RFC',
    tagline: 'Write down the problem, the options and the decision before the code makes the decision for you.',
    level: 'intermediate',
    body: `
<p>A design doc (some teams call it an RFC, a "request for comments") is a short document you write before building something big or hard to undo. It makes the team agree on the problem and the approach while changing your mind costs a comment, not a rewrite.</p>
<p>A useful doc has six parts. <b>Problem</b>: what hurts, for whom. <b>Goals</b>: what success looks like, measurably. <b>Non-goals</b>: what you are deliberately not doing. <b>Options</b>: two or three real alternatives, including "do nothing". <b>Decision</b>: which one, and why it beat the others. <b>Risks</b>: what could go wrong and what you need from other teams.</p>
<p>Keep it to a few pages and share it early, while it is still a draft. The demo follows one feature built doc-first and code-first. Kotlin itself uses a public process like this: changes to the language are proposed and discussed as documents in the <a href="https://github.com/Kotlin/KEEP" target="_blank" rel="noopener">KEEP</a> repository.</p>`,
    code: `# Design: Offline saved articles            Status: In review
Author: Maya   Reviewers: Android, Backend, Product   Updated: 2026-10-18

## Problem
Readers lose articles they meant to read later. On the metro the app shows nothing.

## Goals
- Save up to 200 articles; open any saved one offline with text and images.
- 10% of weekly readers save at least one article within 2 months.

## Non-goals
- Sync across devices (v2). Saving videos.

## Options
A) Room tables + WorkManager prefetch of images
B) Rely on the HTTP cache
C) Do nothing; add "read later" by email

## Decision
A. The HTTP cache can evict entries at any time, so B could lose saved articles.
C does not work offline.

## Risks and dependencies
- Storage on small phones: cap images at 1 MB, show usage in Settings.
- Backend: needs GET /articles/{id} with full body. Owner: backend team, due sprint 41.

## Open questions
- Do saved articles count as "read" in analytics?`,
    remember: 'Problem, goals, non-goals, options, decision, risks. If you can\'t write the non-goals and the rejected options, you haven\'t designed it yet.',
    visual(el) {
      Lab.ui.timeline(el, {
        lanes: ['Doc first', 'Code first'],
        span: 26, unit: 'days',
        predict: {
          q: 'Both teams will hit the same surprise: the backend has no article-by-id endpoint yet. Which team pays more to deal with it?',
          options: ['The doc-first team: they have to rewrite the doc', 'The code-first team: they find out after the code is built', 'Both pay the same'],
          a: 1,
          why: 'In a draft, changing the plan costs a comment. After three weeks of code, it costs the code, the tests and the review.',
        },
        frames: [
          { now: 0, say: 'One feature, offline saved articles, built by two teams. The numbers are illustrative.' },
          { bars: [{ lane: 0, from: 0, to: 1, label: 'draft', tone: 'warm' }, { lane: 1, from: 0, to: 1, label: 'build' }], say: 'The first team writes a two-page draft: problem, goals, non-goals, options, decision, risks. The second starts coding.' },
          { bars: [{ lane: 0, from: 1, to: 3, label: 'review', tone: 'warm' }, { lane: 1, from: 1, to: 3, label: 'build' }], marks: [{ at: 2, label: 'found', tone: 'warm' }], say: 'In review, backend reads the Risks section and says the endpoint does not exist. The plan changes. It costs a few comments.' },
          { bars: [{ lane: 0, from: 3, to: 18, label: 'build agreed option', tone: 'ok' }, { lane: 1, from: 3, to: 15, label: 'build' }], say: 'The first team builds what everyone agreed on. The second team is still building on a guess.' },
          { bars: [{ lane: 1, from: 15, to: 17, label: 'PR review', tone: 'warm' }], marks: [{ at: 16, label: 'found', tone: 'err' }], say: 'The pull request reaches backend. Same surprise, found 14 days later, with the code already written.' },
          { bars: [{ lane: 1, from: 17, to: 25, label: 'rework', tone: 'err' }], now: 25, say: 'The second team reworks code, tests and review. The doc-first team shipped at day 18.' },
        ],
      });
    },
    deeper: [
      {
        title: 'Non-goals do the most work',
        body: `<p>Goals are easy to agree on. Non-goals are where scope fights get settled before they start. "No cross-device sync in v1" saves a week of review comments and stops the backend team from building an endpoint nobody will call yet.</p>
<p>A non-goal is not "never". It is "not in this doc". Point to where it will be handled, if anywhere.</p>`,
      },
      {
        title: 'Options need real trade-offs',
        body: `<p>Write each option so that a reasonable person could pick it. One strong option and two straw men is not a comparison. For each option, say what it costs (time, complexity, app size, battery, storage) and what it risks. Always include "do nothing" or "the smallest thing": sometimes it wins, and when it doesn't, saying why makes the case for the real work.</p>`,
      },
      {
        title: 'When a doc is worth writing',
        body: `<p>Not every change needs one. Write a doc when at least one of these is true:</p>
<ul><li>More than one team has to change something (app and backend, Android and iOS).</li><li>The decision is hard to undo: a database schema, a public API, a new library across all <a href="#arch.modularization-arch">modules</a>.</li><li>The work is more than a couple of weeks.</li><li>People already disagree about the approach.</li></ul>
<p>For a small, reversible change, a good pull request description is enough.</p>`,
      },
      {
        title: 'After the decision',
        body: `<p>Mark the doc's status (Draft, In review, Accepted, Superseded) and link it from the code or the module README. When the design changes later, update the doc or write a short new one that supersedes it. A design doc that silently disagrees with the code is worse than none, because people trust it.</p>`,
      },
    ],
    mistakes: [
      { title: 'Writing the doc after the code', bad: '1. Build the feature (3 weeks)\n2. Write a design doc describing it\n3. Review finds a backend conflict', good: '1. Write a 2-page draft (1 day)\n2. Review with backend and product\n3. Build the agreed option', why: 'A doc written afterwards documents a decision nobody could influence. Its value is the cheap disagreement before the expensive work.' },
      { title: 'A decision with no reason', bad: '## Decision\nWe will use Room.', good: '## Decision\nRoom, because the HTTP cache can evict\nentries at any time and saved articles\nmust not disappear.', why: 'In a year someone will ask "why not the cache?". The reason is the part of the decision that stays useful.' },
    ],
    terms: [
      { term: 'Design doc', def: 'A short document that states a problem, options and the chosen approach before building.' },
      { term: 'RFC', def: 'Request for comments: a proposal shared so others can review it before it is decided.' },
      { term: 'Non-goal', def: 'Something deliberately left out of the scope of a design, written down so nobody assumes it is included.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fill in the two missing section headings of the design doc template.', code: '## Problem\n## Goals\n## [[Non-goals|Non goals|Nongoals]]\n## Options\n## [[Decision]]\n## Risks', why: 'Non-goals fence the scope. Decision names the chosen option and why it beat the others.' },
      { type: 'bug', prompt: 'One "Goals" line is not a goal you can check. Tap it.', code: '## Goals\n- Save up to 200 articles per user\n- Open a saved article offline in under 1 s\n- Make reading delightful\n- 10% of weekly readers save one article in 2 months', bug: 3, fix: '- Saved articles survive app updates and restarts', why: 'A goal must be checkable. "Delightful" can\'t pass or fail, so it settles nothing in review.' },
    ],
    quiz: [
      { q: 'A reviewer asks "why not just use the HTTP cache?". Which section should already answer that?', options: ['Options and Decision', 'Problem', 'Goals'], a: 0, why: 'Options lists the alternatives and Decision says why the chosen one beat them, including the cache.' },
      { q: 'Which change most needs a design doc?', options: ['Changing the database schema used by app and backend', 'Renaming a private function', 'Fixing a typo in a string'], a: 0, why: 'It crosses teams and is hard to undo. The other two are small and reversible, so a PR description is enough.' },
      { q: 'Product keeps asking for cross-device sync during review. What should the doc have had?', options: ['A non-goal: no sync in v1, planned for v2', 'A longer Problem section', 'More code samples'], a: 0, why: 'Writing it as a non-goal settles the scope once, in writing, instead of in every meeting.' },
    ],
  });

  // 5 ─────────────────────────────────────────────
  const DIFF = [
    { s: 'class ArticleViewModel(' },
    { s: '    private val repo: ArticleRepository,' },
    { s: '    private val session: Session,' },
    { s: ') : ViewModel() {' },
    { s: '    private val _message = MutableStateFlow<String?>(null)' },
    { s: '    fun save(a: Article) {', sev: 'nit', note: 'Nit: name the parameter <code>article</code>; one letter tells the reader nothing.' },
    { s: '        GlobalScope.launch {', sev: 'must', note: '<code>GlobalScope</code> outlives the ViewModel, so the job keeps running after the screen closes. Use <code>viewModelScope</code>.' },
    { s: '            try {' },
    { s: '                repo.save(a.id, session.token!!)', sev: 'must', note: '<code>token!!</code> crashes for a logged-out reader. Handle the null case (show login, or disable Save).' },
    { s: '                Log.d("Save", "token=" + session.token)', sev: 'must', note: 'Logs the auth token. Anyone with logcat access, or a log upload, gets the session. Remove it.' },
    { s: '                _message.value = "Saved"', sev: 'should', note: 'Hard-coded UI text can\'t be translated. Expose a state or a string resource id and let the UI pick the text.' },
    { s: '            } catch (e: Exception) { }', sev: 'must', note: 'Swallows every error, so the reader sees nothing when saving fails. It also catches <code>CancellationException</code>. Show an error state and rethrow cancellation.' },
    { s: '        }' },
    { s: '    }' },
    { s: '}' },
  ];
  lessons.push({
    id: 'code-review',
    title: 'Code review',
    tagline: 'Look for what matters most first, keep pull requests small, and write comments a person is happy to receive.',
    level: 'intermediate',
    body: `
<p>Code review catches bugs, but it also spreads knowledge and keeps the codebase consistent. Google's public <a href="https://google.github.io/eng-practices/review/" target="_blank" rel="noopener">code review guide</a> sets the bar: approve a change once it definitely improves the overall health of the code, even if it isn't perfect. There is no perfect code, only better code.</p>
<p>Read in order of what matters. First the <b>design</b>: does this belong here, does it fit the <a href="#arch.layers">architecture</a>? Then <b>functionality</b> (does it do what the author meant, for every user), <b>complexity</b>, <b>tests</b>, and only then naming, comments and style. Lint and formatters should catch style, so humans don't have to.</p>
<p>Label each comment so the author knows what is required: <b>Nit:</b> for small polish, <b>Optional:</b> for ideas, plain comments for must-fix. Review the diff in the demo: tap every line you would comment on, then submit.</p>`,
    code: `// The same change after review
class ArticleViewModel(
    private val repo: ArticleRepository,
    private val session: Session,
) : ViewModel() {
    private val _state = MutableStateFlow<SaveState>(SaveState.Idle)
    val state: StateFlow<SaveState> = _state

    fun save(article: Article) {
        val token = session.token ?: run { _state.value = SaveState.NeedsLogin; return }
        viewModelScope.launch {
            _state.value = try {
                repo.save(article.id, token)
                SaveState.Saved                    // UI shows R.string.saved
            } catch (e: CancellationException) {
                throw e
            } catch (e: IOException) {
                SaveState.Failed                   // UI shows R.string.save_failed
            }
        }
    }
}`,
    remember: 'Design first, style last. Label nits as nits. Approve when the change makes the code healthier, not when it is perfect.',
    predict: {
      q: "Which line in this diff needs the most urgent comment?",
      options: ["<code>fun save(a: Article)</code>: the parameter name", "<code>Log.d(\"Save\", \"token=\" + session.token)</code>: it logs the auth token", "<code>_message.value = \"Saved\"</code>: hard-coded text"],
      a: 1,
      why: "A leaked session token is a security bug and must be fixed before merge. The name is a Nit and the text is a should-fix.",
    },
    visual(el) {
      const flagged = new Set();
      let submitted = false;
      const lines = DIFF.map((d, i) => h('button', { class: 'swe-dl', 'aria-pressed': 'false', onclick() {
        if (submitted) return;
        flagged.has(i) ? flagged.delete(i) : flagged.add(i);
        this.classList.toggle('swe-flag', flagged.has(i)); this.setAttribute('aria-pressed', String(flagged.has(i)));
        count.textContent = String(flagged.size);
      } }, h('span', { class: 'swe-ln' }, String(i + 1)), h('code', { html: hl(d.s) })));
      const count = h('b', {}, '0');
      const notes = h('ol', { class: 'swe-notes' });
      const msg = out('Tap each line you would leave a comment on. Tap again to unflag.');
      const SEV = { must: ['Must fix', ''], should: ['Should fix', 'swe-should'], nit: ['Nit', 'swe-nit'] };
      function submit(reveal) {
        submitted = true;
        let hit = 0, miss = 0, fals = 0;
        notes.replaceChildren();
        DIFF.forEach((d, i) => {
          const f = flagged.has(i) || reveal;
          lines[i].classList.remove('swe-flag');
          if (d.sev && f) { hit++; lines[i].classList.add('swe-hit'); }
          else if (d.sev) { miss++; lines[i].classList.add('swe-miss'); }
          else if (flagged.has(i)) { fals++; lines[i].classList.add('swe-false'); }
          if (d.sev) notes.append(h('li', { class: 'drop-in' }, h('span', { class: `swe-sev ${SEV[d.sev][1]}` }, SEV[d.sev][0]), `Line ${i + 1}: `, h('span', { html: d.note })));
        });
        const total = DIFF.filter(d => d.sev).length;
        say(msg, reveal ? `All ${total} comments shown. Green lines have a comment; the list below says why and how serious.`
          : `You found <b>${hit} of ${total}</b>${miss ? `; ${miss} missed (red)` : ''}${fals ? `; ${fals} flag${fals === 1 ? '' : 's'} on fine lines (dashed)` : ''}. ${hit === total && !fals ? 'A clean review.' : 'Read the notes, then Reset to try again.'} With four must-fix items, the verdict is "request changes".`);
      }
      el.append(h('div', { class: 'swe-stage' }, h('span', { class: 'swe-label' }, 'Pull request #318: save articles'), h('div', { class: 'swe-diff' }, lines),
        h('span', { class: 'swe-stat' }, 'flagged lines: ', count), notes),
        h('div', { class: 'controls' }, act('Submit review', () => submit(false)), act('Show all comments', () => submit(true))), msg);
    },
    deeper: [
      {
        title: 'Small pull requests get better reviews',
        body: `<p>Google's guide says about 100 lines is usually a reasonable size for a change, and 1,000 lines is usually too large, with the number of files mattering too. A big PR gets a skim and an approval; a small one gets real attention. It is also easier to revert.</p>
<p>Split by concern: one PR adds the Room table and its tests, the next adds the Save button behind a <a href="#launch.flags">flag</a>, the next wires the screen. Refactors go in their own PR, before the feature. See <a href="#git.pull-requests">pull requests</a> for the Git side.</p>`,
      },
      {
        title: 'Writing comments people can act on',
        body: `<p>Comment on the code, not the person: "this call can throw when the token is null" rather than "you forgot null". Say why, so the author learns the rule and not just the fix. Label severity, so a nit isn't mistaken for a blocker. Point out good things too.</p>
<p>If you have to explain a piece of code in the review thread, ask for the code to be clearer instead, or for a code comment, because the next reader won't see the thread.</p>`,
        code: `Must fix: GlobalScope keeps running after the screen closes,
so a slow save can update a dead ViewModel. viewModelScope
cancels with it.

Nit: \`a\` -> \`article\`.

Optional: this mapping looks like the one in FeedViewModel.
Worth a shared function in a follow-up?`,
      },
      {
        title: 'Receiving review',
        body: `<p>The comments are about the code. If you don't understand one, ask. If you disagree, explain your reasoning and the trade-off, and share context the reviewer may not have. When a reviewer misunderstood the code, that is a sign to make the code clearer, not only to reply.</p>
<p>Respond quickly in both directions. Google's guide sets one business day as the maximum time to respond to a review request; slow reviews push people toward bigger PRs, which makes reviews slower still.</p>`,
      },
      {
        title: 'A checklist for Android PRs',
        body: `<p>Keep a short team checklist for the things humans must judge and tools can't:</p>
<ul><li>Coroutines run in a lifecycle scope and handle cancellation.</li><li>No secrets or personal data in logs.</li><li>User-visible text is in string resources, in every language you ship.</li><li>New screens work in dark theme, large font and small screens.</li><li>Tests cover the new behavior; <a href="#tools.ci">CI</a> is green.</li></ul>`,
      },
    ],
    mistakes: [
      { title: 'Fifty style comments, no design comment', bad: 'Nit: trailing space (x23)\nNit: import order (x14)\nLGTM', good: 'Lint/formatter in CI handles style.\nComment: Should saved articles live in\nthe feed module? It pulls Room into it.', why: 'Humans are best at design and behavior. Automate style with <a href="#tools.lint">lint</a> and a formatter, so review time goes where only a person can help.' },
      { title: 'A 2,000-line PR', bad: 'PR #300: Offline reading (64 files, +2,113)', good: 'PR #301: Saved articles table + DAO tests\nPR #302: Save button behind a flag\nPR #303: Saved list screen', why: 'Large PRs get skimmed. Small, single-purpose PRs get real review and are easy to revert.' },
    ],
    terms: [
      { term: 'Pull request', def: 'A request to merge a branch, where teammates review the diff and CI runs checks.' },
      { term: 'Nit', def: 'A label for a small, optional polish comment that should not block approval.' },
      { term: 'LGTM', def: '"Looks good to me": the reviewer approves the change.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Fix the reviewed lines: use the lifecycle scope and keep cancellation working.', code: '[[viewModelScope]].launch {\n    try { repo.save(article.id, token) }\n    catch (e: [[CancellationException]]) { throw e }\n    catch (e: IOException) { _state.value = SaveState.Failed }\n}', why: '<code>viewModelScope</code> is cancelled with the ViewModel. Rethrowing <code>CancellationException</code> lets cancellation finish instead of being treated as a failed save.' },
      { type: 'bug', prompt: 'You are reviewing this diff. Which line must be fixed before merge?', code: 'fun refresh() {\n    viewModelScope.launch {\n        val user = repo.currentUser()\n        Log.i("Auth", "refreshing for " + user.email + " / " + user.token)\n        _state.value = repo.loadFeed(user.id)\n    }\n}', bug: 3, fix: '        Log.i("Auth", "refreshing feed")', why: 'It writes an email address and an auth token to logcat. Personal data and secrets never go in logs.' },
    ],
    quiz: [
      { q: 'You have limited time for a large PR. What do you look at first?', options: ['Design: does the change belong here and fit the architecture?', 'Import order', 'Whether variable names match your taste'], a: 0, why: 'A design problem makes the rest of the review moot. Style is last, and ideally automated.' },
      { q: 'Which comment is best written?', options: ['Must fix: token!! crashes for logged-out readers; show login when it is null.', 'This is wrong.', 'Why would you do this?'], a: 0, why: 'It says the severity, the problem, why it matters and a way forward, and it is about the code.' },
      { q: 'A change clearly improves the code but you would have named one class differently. What do you do?', options: ['Approve, with an optional "Nit:" about the name', 'Block until it is renamed', 'Rewrite it yourself in a new PR'], a: 0, why: 'The standard is "improves code health", not "matches my taste". A labeled nit lets the author choose.' },
      { q: 'Which PR is easiest to review well?', options: ['+90 lines: the saved articles table with its DAO tests', '+1,800 lines across 40 files: the whole feature', '+300 lines mixing a refactor with a new screen'], a: 0, why: 'It does one thing and is small. Google\'s guide calls about 100 lines usually reasonable and 1,000 usually too large.' },
      { q: 'A reviewer misunderstood your code and left a wrong comment. What helps most?', options: ['Make the code clearer, or add a comment, so the next reader won\'t trip either', 'Explain it only in the PR thread', 'Resolve the comment without replying'], a: 0, why: 'Future readers see the code, not the thread. Confusion in review predicts confusion later.' },
    ],
  });

  // 6 ─────────────────────────────────────────────
  lessons.push({
    id: 'tech-debt',
    title: 'Technical debt and refactoring',
    tagline: 'Messy code charges interest every time you change it. Pay it down where you change code most.',
    level: 'intermediate',
    body: `
<p>Technical debt is Martin Fowler's metaphor for internal quality problems, which he calls cruft. The <b>interest</b> is the extra time every change costs because of the cruft. The <b>principal</b> is what it costs to clean it up. In his example, a feature takes 6 days instead of 4 because of messy code, and cleaning up first would take 5 days.</p>
<p>Fowler sorts debt on two axes: <b>deliberate</b> or <b>inadvertent</b>, and <b>prudent</b> or <b>reckless</b>. "Ship now, clean up after the launch" with a plan is prudent and deliberate. "We have no time for design" is reckless. "Now we know how it should have been built" is prudent and inadvertent, and every good team makes some.</p>
<p>The key point: interest is only charged when you work in that code. Cruft in a module nobody touches costs almost nothing. The demo ships the same four features with and without paying down first.</p>`,
    code: `// Strangler fig: grow the new code next to the old, move callers one at a time.
interface ArticleSource {
    suspend fun article(id: String): Article
}

class LegacyArticleSource(private val api: OldNewsApi) : ArticleSource {
    override suspend fun article(id: String) = api.fetchJson(id).toArticleTheOldWay()
}

class ArticleRepository(                          // new, tested, offline-first
    private val dao: ArticleDao,
    private val api: ArticleApi,
) : ArticleSource {
    override suspend fun article(id: String): Article =
        dao.find(id) ?: api.article(id).also { dao.insert(it) }
}

// One switch decides who serves the call. Remove the legacy class when the flag is at 100%.
fun articleSource(flags: Flags, legacy: LegacyArticleSource, repo: ArticleRepository): ArticleSource =
    if (flags.isOn("new_article_repository")) repo else legacy`,
    remember: 'Pay down debt in code you change often, a little with every change. Replace big messes piece by piece, never in one rewrite.',
    visual(el) {
      Lab.ui.timeline(el, {
        lanes: ['Keep cruft', 'Clean first'],
        span: 24, unit: 'days',
        predict: {
          q: 'One team works around the messy code, the other spends 5 days cleaning first. Which team ships <b>feature 1</b> first?',
          options: ['Keep cruft: 6 days', 'Clean first: 9 days', 'Both on the same day'],
          a: 0,
          why: 'Paying down the principal costs time up front. It only pays back through cheaper features later, and only if those features touch this code.',
        },
        frames: [
          { now: 0, say: 'Fowler’s numbers: a feature takes 4 days in clean code, 6 with the cruft, and the clean-up takes 5. Every feature here touches the messy module.' },
          { bars: [{ lane: 0, from: 0, to: 6, label: 'F1', tone: 'warm' }, { lane: 1, from: 0, to: 5, label: 'clean up', tone: 'muted' }], say: 'The first team starts feature 1 at once. The second team cleans first.' },
          { bars: [{ lane: 1, from: 5, to: 9, label: 'F1', tone: 'ok' }], now: 9, say: 'Feature 1 ships at day 6 for the first team and day 9 for the second. Cleaning looks like a loss so far.' },
          { bars: [{ lane: 0, from: 6, to: 12, label: 'F2', tone: 'warm' }, { lane: 1, from: 9, to: 13, label: 'F2', tone: 'ok' }], now: 13, say: 'Each feature costs the first team 2 days of interest. The gap is shrinking.' },
          { bars: [{ lane: 0, from: 12, to: 18, label: 'F3', tone: 'warm' }, { lane: 1, from: 13, to: 17, label: 'F3', tone: 'ok' }], now: 17, say: 'After three features the clean team is ahead: day 17 against day 18.' },
          { bars: [{ lane: 0, from: 18, to: 24, label: 'F4', tone: 'warm' }, { lane: 1, from: 17, to: 21, label: 'F4', tone: 'ok' }], now: 21, say: 'From here every feature saves 2 more days. If the module were touched once a year, the 5 days would never come back.' },
        ],
      });
    },
    deeper: [
      {
        title: 'The camp-site rule',
        body: `<p>Most debt is paid in small amounts: leave the code a bit better than you found it every time you touch it. Fowler calls this opportunistic refactoring and quotes the camp-site rule; you'll also hear it called the boy-scout rule. Rename a confusing variable, extract the function you just had to read three times, add the missing test.</p>
<p>Because you only touch code you are changing anyway, this pays down debt exactly where the interest is highest. Keep these cleanups in their own commit or PR so review stays easy.</p>`,
      },
      {
        title: 'The strangler fig, for big messes',
        body: `<p>When a whole area is bad, the temptation is a rewrite. Big-bang rewrites tend to take longer than planned, users wait for features, and the team copies old behavior nobody needed. Fowler's <b>strangler fig</b> pattern grows the new code next to the old and moves behavior over piece by piece until the old code can be deleted.</p>
<p>On Android, the seam is usually an interface, as in the code above, plus a <a href="#launch.flags">remote flag</a> so you can move traffic gradually and switch back without a release. The same idea moves a <a href="#views.compose-in-views">View screen to Compose</a> one screen at a time.</p>`,
      },
      {
        title: 'Make debt visible',
        body: `<p>Debt nobody wrote down never gets prioritized. Keep it in the same backlog as features, phrased by its interest: "Every new feed card type takes 2 extra days because FeedAdapter mixes 6 view types" can be weighed against features. "Refactor FeedAdapter" cannot.</p>
<p>Measure where it hurts: files that change most often and also break most often are the best place to start.</p>`,
      },
      {
        title: 'Refactoring needs tests',
        body: `<p>Refactoring means changing structure without changing behavior. The only way to know behavior didn't change is to have tests around it first. If the messy code has no tests, write characterization tests that pin what it does today, even the odd parts, then refactor. See <a href="#testing.fakes">fakes</a> for testing code with dependencies.</p>`,
        code: `// Pin today's behavior before touching the legacy parser
@Test fun \`legacy parser keeps empty images as null\`() {
    val article = LegacyParser.parse(fixture("article_no_image.json"))
    assertNull(article.imageUrl)          // odd, but the UI relies on it
}`,
      },
    ],
    mistakes: [
      { title: 'The big rewrite', bad: 'Q1-Q3: rewrite the app from scratch\n(no features ship, old app still needs fixes)', good: 'Each sprint: move one screen or one data\nsource to the new code behind a flag,\ndelete the old path when it hits 100%', why: 'A rewrite delivers nothing until it is complete and must catch up with a moving target. The strangler approach ships value and reduces risk every sprint.' },
      { title: 'Refactoring and a feature in one PR', bad: 'PR: Add push opt-in + restructure\nSettingsViewModel (+900 / -700)', good: 'PR 1: Restructure SettingsViewModel\n      (no behavior change, tests pass)\nPR 2: Add push opt-in (+120)', why: 'Mixed PRs hide behavior changes inside moved code. A pure refactor PR can be reviewed for "nothing changed"; the feature PR stays small.' },
    ],
    terms: [
      { term: 'Technical debt', def: 'Internal quality problems that make every future change cost more, like interest on a loan.' },
      { term: 'Refactoring', def: 'Changing the structure of code without changing what it does.' },
      { term: 'Strangler fig', def: 'Replacing a legacy system gradually by growing new code beside it and moving behavior over piece by piece.' },
      { term: 'Characterization test', def: 'A test that records what existing code does today, so a refactor can prove it changed nothing.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Route callers through the seam, so the flag decides which implementation runs.', code: 'fun articleSource(flags: Flags): [[ArticleSource]] =\n    if (flags.isOn("new_article_repository")) [[repo]] else legacy', why: 'Callers depend on the interface, and the flag chooses the new repository or the legacy one. Turning the flag off is the rollback.' },
      { type: 'bug', prompt: 'This PR claims to be a pure refactor (no behavior change). Tap the line that breaks that promise.', code: 'fun formatDate(epochMs: Long): String {\n    val zone = ZoneId.of("Europe/Berlin")\n    val date = Instant.ofEpochMilli(epochMs).atZone(zone)\n    return date.format(DateTimeFormatter.ofPattern("d MMM", Locale.ENGLISH))\n}', bug: 3, fix: '    return date.format(DateTimeFormatter.ofPattern("d MMM", Locale.forLanguageTag("de")))', why: 'The old code formatted months in German ("5 Okt."). Switching the locale changes what users see, so it is a behavior change hiding inside a refactor.' },
    ],
    quiz: [
      { q: 'A messy module is touched by about one feature a year. What does the interest metaphor suggest?', options: ['Leave it for now; interest is only charged when you change it', 'Rewrite it this sprint', 'Delete it'], a: 0, why: 'Fowler notes that cruft in rarely touched code costs little. Spend cleanup effort where changes happen.' },
      { q: '"We know this is quick and dirty; we ship for the launch and clean up next sprint, ticket is filed." Which quadrant?', options: ['Prudent and deliberate', 'Reckless and inadvertent', 'Prudent and inadvertent'], a: 0, why: 'The team chose the debt knowingly and has a plan to repay it.' },
      { q: 'Put the strangler steps in order.', options: ['Add a seam, build the new path, move traffic with a flag, delete the old path', 'Delete the old path, build the new path, add a seam', 'Build the new path, switch everyone at once, write tests'], a: 0, why: 'The seam lets both paths coexist, the flag moves users gradually and allows rollback, and deletion comes last.' },
      { q: 'With Fowler\'s numbers (4 days clean, 6 with cruft, 5 to clean), when does cleaning first pay off if every feature touches the code?', options: ['From the 3rd feature', 'Never', 'From the 1st feature'], a: 0, why: 'After 2 features: 12 vs 13 days. After 3: 18 vs 17. The 2 days saved per feature repay the 5 days by feature 3.' },
    ],
  });

  // 7 ─────────────────────────────────────────────
  const EVENTS = [
    { t: '10:02', s: 'Version 5.12.0 reaches 20% of users in a staged rollout.', c: '' },
    { t: '10:40', s: 'Crash alert: crash-free users drop sharply on 5.12.0.', c: 'swe-bad' },
    { t: '10:45', s: 'On-call acknowledges, declares an incident and takes the incident commander role.', c: '' },
    { t: '10:52', s: 'Rollout halted in Play Console. No new users get 5.12.0.', c: 'swe-mit' },
    { t: '11:30', s: 'Cause found: the feed parser crashes when imageUrl is null.', c: '' },
    { t: '13:10', s: 'Fix 5.12.1, with a test for the null image, starts its staged rollout.', c: 'swe-mit' },
    { t: '15:00', s: 'Crash rate back to normal. Incident closed.', c: 'swe-mit' },
    { t: '+1 day', s: 'Blameless postmortem written and reviewed, with owned action items.', c: '' },
  ];
  lessons.push({
    id: 'teamwork',
    title: 'Working in a team: incidents, postmortems and communication',
    tagline: 'When production breaks, follow a plan, fix the system and not the person, and write it down.',
    level: 'intermediate',
    body: `
<p>Sooner or later a release breaks something for real users. Teams that handle it well decide the rules in advance: who is <b>on call</b>, what counts as an incident, and who does what. Google's SRE book suggests declaring an incident early and splitting roles: an <b>incident commander</b> who coordinates, people who work on the fix, and someone who keeps stakeholders updated. On mobile, your fastest lever is often to <a href="#build.tracks">halt a staged rollout</a> or turn off a <a href="#launch.flags">flag</a>: halting stops new users getting the version, but people who already have it keep it.</p>
<p>Afterwards, write a <b>postmortem</b>: what happened, the impact, what you did, the root causes and follow-up actions. Make it <b>blameless</b>. The SRE book describes this as assuming everyone acted with good intentions and the information they had, and fixing the systems that let the mistake through. People who fear blame hide problems; people who don't, report them early.</p>
<p>The same habits apply every day: agree on API contracts with backend before building, ask design about edge cases (empty, error, long German words), and keep docs short and current. The demo follows one incident from the first alert to resolution.</p>`,
    code: `// Postmortem action item #1: "The parser must accept a missing image."
// The fix ships with the test that would have caught it.
@Serializable
data class ArticleDto(
    val id: String,
    val title: String,
    val imageUrl: String? = null,        // was String: crashed on null from the CMS
)

class ArticleDtoTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun \`article without image parses\`() {
        val dto = json.decodeFromString<ArticleDto>("""{"id":"a1","title":"Deprem","imageUrl":null}""")
        assertNull(dto.imageUrl)
    }
}`,
    remember: 'Mitigate first, debug second. Then write a blameless postmortem whose action items have owners.',
    visual(el) {
      Lab.ui.timeline(el, {
        lanes: ['Alerts', 'Commander', 'Fix', 'Updates'],
        span: 120, unit: 'min',
        predict: {
          q: 'An incident is declared. Who should write the code fix?',
          options: ['The incident commander, because they know the most', 'Someone else, so the commander can keep coordinating', 'Nobody until the postmortem'],
          a: 1,
          why: 'The SRE book splits the roles. The commander coordinates and decides, others work on the fix, and one person keeps stakeholders updated.',
        },
        frames: [
          { now: 0, say: 'Version 5.12 is at 10% of a staged rollout. It is a normal morning.' },
          { bars: [{ lane: 0, from: 4, to: 14, label: 'crash rate up', tone: 'err' }], marks: [{ at: 4, label: 'page', tone: 'err' }], say: 'The crash-free rate drops on 5.12 and the on-call developer is paged.' },
          { bars: [{ lane: 1, from: 8, to: 12, label: 'declare', tone: 'warm' }], say: 'They declare an incident early and assign roles: a commander, people on the fix, one person on updates.' },
          { bars: [{ lane: 2, from: 12, to: 20, label: 'halt', tone: 'ok' }], say: 'Mitigate first: halt the rollout. New users stop getting 5.12. People who have it keep it.' },
          { bars: [{ lane: 3, from: 16, to: 22, label: 'update' }, { lane: 3, from: 46, to: 52, label: 'update' }, { lane: 3, from: 76, to: 82, label: 'update' }], say: 'Support and product get short updates on a fixed rhythm, so nobody interrupts the people fixing it.' },
          { bars: [{ lane: 2, from: 16, to: 90, label: 'find + fix', tone: 'accent' }, { lane: 2, from: 90, to: 110, label: '5.12.1', tone: 'ok' }], say: 'The fix ships as 5.12.1, with a higher <code>versionCode</code>, on a new staged rollout.' },
          { bars: [{ lane: 1, from: 110, to: 120, label: 'resolved', tone: 'ok' }], now: 120, say: 'The commander closes the incident. Next comes a blameless postmortem: impact, timeline, root causes, follow-up actions.' },
        ],
      });
    },
    deeper: [
      {
        title: 'When to call it an incident',
        body: `<p>Decide the triggers before you need them, so nobody debates it at 2 a.m. The SRE book suggests treating something as an incident if a second team must get involved, if customers can see it, or if it is still unsolved after an hour of focused work. For an app team, add your own: crash-free users below a threshold, login or payments failing, a push sent to the wrong audience.</p>`,
      },
      {
        title: 'What goes in a postmortem',
        body: `<p>Keep the shape fixed so they are quick to write and easy to compare:</p>
<ul><li><b>Summary and impact:</b> who was affected, how many, for how long.</li><li><b>Timeline:</b> like the demo, with detection and mitigation times.</li><li><b>Root causes:</b> usually several, and about systems: missing test, unclear contract, slow alert.</li><li><b>What went well:</b> the staged rollout limited it to 20%.</li><li><b>Action items:</b> each with an owner and a due date.</li></ul>
<p>Share it widely. Other teams learn from your incident for free.</p>`,
      },
      {
        title: 'Working with backend, product and design',
        body: `<p>Most cross-team pain comes from assumptions. Agree on the API contract in writing before either side builds: field names, which fields can be null, error codes, pagination. Ask design for the states they didn't draw: loading, empty, error, offline, a 40-character German headline at 200% font size. Tell product early when an estimate moves, with the reason and the new range.</p>
<p>Prefer written, searchable channels for decisions (the design doc, the ticket) and calls for untangling disagreement. After the call, write down what was decided.</p>`,
      },
      {
        title: 'Documentation that stays true',
        body: `<p>Google's documentation guide argues for minimum viable documentation: a small set of fresh, accurate docs beats a large pile of stale ones. Update the docs in the same change as the code, so review catches drift, and delete docs that are dead. A module README that says what the module owns and how to run its tests is worth more than a wiki nobody updates.</p>`,
      },
    ],
    mistakes: [
      { title: 'Debugging before mitigating', bad: '10:40 alert\n10:45-12:30 investigate the crash\n12:30 halt rollout (rollout kept growing)', good: '10:40 alert\n10:52 halt rollout\n10:52-11:30 investigate, calmly', why: 'Every minute of debugging with the rollout still running adds affected users. Stop the bleeding, then find the cause.' },
      { title: 'A root cause with a name in it', bad: 'Root cause: Omar forgot the null check.', good: 'Root causes: contract didn\'t say imageUrl\ncan be null; no parser test for optional\nfields; alert fired 38 min late.', why: 'Naming a person ends the analysis and teaches people to hide mistakes. Naming system gaps produces fixes that stop the next person too.' },
    ],
    terms: [
      { term: 'On-call', def: 'The person responsible, for a set period, for responding to alerts and incidents.' },
      { term: 'Incident commander', def: 'The person who coordinates an incident response, assigns roles and holds the overall picture.' },
      { term: 'Postmortem', def: 'A written record of an incident: impact, timeline, root causes and follow-up actions.' },
      { term: 'Blameless', def: 'Looking for the system causes of a failure without blaming individuals, assuming good intentions.' },
    ],
    challenges: [
      { type: 'blank', prompt: 'Make the DTO accept a missing image, which was the root cause of the crash.', code: 'data class ArticleDto(\n    val id: String,\n    val imageUrl: String[[?]] = [[null]],\n)', why: 'A nullable type with a default of <code>null</code> accepts both an explicit null and a missing field.' },
      { type: 'bug', prompt: 'One action item in this postmortem will not prevent anything. Tap it.', code: 'Action items\n1. Document nullable fields in the API contract (owner: backend, Nov 1)\n2. Add parser tests for every optional field (owner: Android, Nov 1)\n3. Everyone should be more careful (owner: team)\n4. Alert on crash rate at the 1% rollout stage (owner: on-call, Nov 8)', bug: 3, fix: '3. Run the release checklist in CI before promoting a rollout (owner: Android, Nov 8)', why: '"Be more careful" has no concrete change, no single owner and no date. Good action items change a system and can be checked off.' },
    ],
    quiz: [
      { q: 'The crash alert fires 10% into a staged rollout. What comes first?', options: ['Halt the rollout, then investigate', 'Find the root cause, then decide', 'Write the postmortem'], a: 0, why: 'Mitigation limits how many users are hurt. Investigation can then happen without the clock running.' },
      { q: 'You halt a staged rollout. What happens to users who already installed the version?', options: ['They keep it; halting only stops new users getting it', 'Play rolls them back automatically', 'The app is removed from their phones'], a: 0, why: 'Play Console\'s help says halting stops additional users; people who received it stay on that version. You still need a fix release.' },
      { q: 'Which postmortem root cause is blameless?', options: ['No test covered a null image, and the contract didn\'t mark it optional', 'The developer was careless', 'QA should have caught it'], a: 0, why: 'It names system gaps that can be fixed. The others blame people, which stops learning.' },
      { q: 'Backend and Android both start building "saved articles" next sprint. What prevents the classic mismatch?', options: ['Agree a written API contract, including nullable fields, before either builds', 'Each side builds and they align at the end', 'Android mocks whatever it guesses'], a: 0, why: 'A shared contract turns assumptions into decisions. This incident started with exactly such an unstated assumption.' },
    ],
  });

  Lab.addTrack({
    id: 'sweng',
    title: 'Software engineering practice',
    description: 'The university software engineering course made practical for a mobile team: life cycle, agile, estimation, design docs, code review, technical debt and incidents.',
    requires: [],
    css,
    lessons,
  });
})();
