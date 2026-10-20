/* Accessibility and adaptive UI track. Same shape as tracks/kotlin.js.
   Demos use the visual kit (Lab.ui). Phone screens are built from the kit's .ui-m-* parts plus the ay- classes
   below; window, fold and resize demos use Lab.ui.player with a custom stage. Every class is prefixed ay-. */
(() => {
  const { h } = Lab;

  // Small symbols for the phone screens. All decorative (aria-hidden), sized by .ay-ico.
  const SVG = {
    glass: '<svg viewBox="0 0 40 48" width="44" height="52" aria-hidden="true" style="color:var(--accent)"><path d="M10.6 22h18.8l-2.1 22H12.7z" fill="var(--accent-soft)"/><path d="M6 4h28l-4 40H10z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19l1-4L16 5l3 3L9 18z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    del: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  };
  // Mark the element whose key matches: 'ay-f' is TalkBack's focus frame, 'ay-k' the keyboard focus ring.
  const at = (key, f, cls = 'ay-f') => (key === f ? ' ' + cls : '');

  const css = `
.ay-f { outline: 2.5px solid var(--ok); outline-offset: 3px; border-radius: 6px; }
.ay-k { outline: 2.5px solid var(--accent); outline-offset: 2px; border-radius: 10px; box-shadow: 0 0 0 5px var(--accent-soft); }
.ay-ico { display: inline-grid; place-items: center; width: 22px; height: 22px; flex: none; color: var(--ink); }
.ay-ico svg { width: 18px; height: 18px; }
.ay-big { font-size: 1.05rem; font-weight: 800; justify-self: center; text-align: center; }
.ay-mid { justify-self: center; }
.ay-row { display: flex; align-items: center; gap: 4px; padding: 6px 0; border-bottom: 1px solid var(--line); min-width: 0; }
.ay-row > span:first-child { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ay-hit { position: relative; display: inline-grid; place-items: center; flex: none; border-radius: 6px; }
.ay-hit.ay-show { outline: 1.5px dashed var(--warm); outline-offset: -1px; background: color-mix(in srgb, var(--warm) 12%, transparent); }
.ay-finger { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; border-radius: 50%; background: color-mix(in srgb, var(--err) 25%, transparent); border: 2px solid var(--err); pointer-events: none; }
.ay-pair { position: relative; display: inline-flex; align-items: center; gap: 3px; flex: none; }
.ay-sm { width: 16px; height: 16px; } .ay-sm svg { width: 15px; height: 15px; }
.ay-lg { width: 30px; height: 30px; }
.ay-fixed { overflow: hidden; border-bottom: 1px solid var(--line); display: grid; align-content: start; }
.ay-fixed.ay-clip { box-shadow: inset 0 -3px 0 var(--err); }
.ay-menu { display: grid; gap: 6px; }
.ay-menu span { padding: 7px 10px; border-radius: 8px; background: var(--sunk); }
.ay-kbd { position: absolute; left: 0; right: 0; bottom: 0; height: 42%; background: var(--sunk); border-top: 1px solid var(--line); display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; padding: 10px 8px; align-content: start; }
.ay-kbd i { height: 22px; border-radius: 5px; background: var(--surface); }
.ay-gap { background: repeating-linear-gradient(45deg, color-mix(in srgb, var(--err) 18%, transparent) 0 6px, transparent 6px 12px); border-radius: 4px; }
.ay-scr { position: relative; flex: 1; display: flex; flex-direction: column; min-height: 0; }

/* window, fold and resize stages */
.ay-desk { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; justify-items: center; min-width: 0; }
.ay-win { height: 170px; border-radius: 12px; border: 3px solid var(--ink); background: var(--surface); color: var(--ink); display: flex; gap: 6px; padding: 6px; overflow: hidden; transition: width 0.4s; min-width: 0; max-width: 100%; }
.ay-pane { flex: 1 1 0; min-width: 0; border-radius: 8px; background: var(--sunk); padding: 6px; display: grid; gap: 4px; align-content: start; font-size: 0.72rem; overflow: hidden; }
.ay-pane b { font-size: 0.78rem; }
.ay-pane .ay-line { height: 6px; border-radius: 3px; background: var(--line); }
.ay-tag { font: 600 0.76rem var(--mono); color: var(--muted); text-align: center; }
.ay-tag b { color: var(--accent); }
.ay-track { width: 100%; max-width: 460px; display: grid; gap: 10px; justify-items: start; }
.ay-ruler { position: relative; width: 100%; height: 26px; border-top: 2px solid var(--line); font: 600 0.66rem var(--mono); color: var(--muted); }
.ay-ruler span { position: absolute; top: 2px; transform: translateX(-50%); white-space: nowrap; }
.ay-ruler span::before { content: ""; position: absolute; left: 50%; top: -8px; width: 2px; height: 8px; background: var(--muted); }
.ay-ruler .ay-now { color: var(--accent); top: -24px; }
.ay-ruler .ay-now::before { top: 14px; background: var(--accent); }
.ay-fold { display: grid; justify-items: center; perspective: 520px; min-height: 230px; align-content: center; }
.ay-half { width: 190px; max-width: 100%; height: 110px; border: 3px solid var(--ink); background: var(--surface); color: var(--ink); padding: 8px; display: grid; gap: 5px; align-content: start; justify-items: center; font-size: 0.78rem; overflow: hidden; transition: transform 0.4s; }
.ay-half.ay-top { border-radius: 12px 12px 2px 2px; border-bottom-style: dashed; }
.ay-half.ay-bottom { border-radius: 2px 2px 12px 12px; border-top: 0; transform-origin: top center; }
.ay-half.ay-flat { transform: rotateX(62deg); }
.ay-book { display: flex; perspective: 520px; }
.ay-book .ay-half { width: 110px; height: 190px; }
.ay-book .ay-half.ay-l { border-radius: 12px 2px 2px 12px; border-right-style: dashed; transform: rotateY(18deg); transform-origin: right center; }
.ay-book .ay-half.ay-r { border-radius: 2px 12px 12px 2px; border-left: 0; transform: rotateY(-18deg); transform-origin: left center; }
.ay-tablet { position: relative; width: 340px; max-width: 100%; aspect-ratio: 16 / 10; border-radius: 16px; border: 6px solid var(--ink); background: #000; display: flex; gap: 4px; justify-content: center; overflow: hidden; }
.ay-app { background: var(--surface); color: var(--ink); display: grid; gap: 5px; align-content: start; padding: 8px; font-size: 0.72rem; overflow: hidden; transition: width 0.4s; min-width: 0; }
.ay-app .ay-field { border: 1.5px solid var(--line); border-radius: 6px; padding: 3px 6px; color: var(--muted); }
.ay-app .ay-cap { width: min(100%, 150px); justify-self: center; display: grid; gap: 5px; }
.ay-other { flex: 1 1 0; background: var(--sunk); display: grid; place-items: center; color: var(--muted); font: 600 0.7rem var(--mono); }
`;

  Lab.addTrack({
    id: 'a11y',
    title: 'Accessibility and adaptive UI',
    description: 'Make the water tracker work for everyone: with TalkBack, a keyboard, large text, small and big windows, foldables, and edge to edge.',
    group: 'Going deeper',
    requires: ['compose'],
    css,
    lessons: [
      {
        id: 'why',
        title: 'Why accessibility',
        tagline: 'Some people hear your app, or use it with one switch or a keyboard. Make it work for them too.',
        goals: ['Name the ways people use Android without the usual touch and sight', 'Move through a screen the way TalkBack does', 'Give every button words a screen reader can say'],
        level: 'beginner', introduces: [],
        body: `
<p>Sam can’t see the screen well, and wants to track water like everyone else. Sam uses the phone with <b>TalkBack</b>, the screen reader you met in the images lesson. Other people use Android in other ways: <b>Switch Access</b> drives the phone with one or two big buttons, someone with a shaky hand needs things that are easy to hit, someone else picks the largest font, and a person with a keyboard on a tablet never touches the screen. Making an app work for all of them is called <em>accessibility</em>, often written <em>a11y</em>: an a, 11 letters, a y.</p>
<p>With TalkBack on, the phone works differently. Touching the screen doesn’t press anything: TalkBack reads what is under the finger. A swipe right moves to the next element and reads it aloud, a swipe left goes back, and a double-tap anywhere presses the element in focus. For each element, TalkBack says its words and what kind of thing it is: “Add a glass, Button”. The exact words vary a little between TalkBack versions and settings; the order is always words, kind, then a hint.</p>
<p>So everything that does something needs words. A <code>Text</code> brings its own. A button with only an <code>Icon</code> inside has none, unless the icon’s <code>contentDescription</code> gives them: with <code>null</code>, TalkBack can only say “Button”. Try it on a phone (Settings &gt; Accessibility &gt; TalkBack) and use your app with your eyes closed. <b>Accessibility Scanner</b>, a free app from Google, checks a screen for you and lists missing labels, targets that are too small and text that is hard to read.</p>`,
        visual(el) {
          const scr = (f, labeled) => `<div class="ui-m-bar"><span class="${at('bar', f)}">Water</span></div>` +
            `<div class="ui-m-body"><span class="ay-mid${at('glass', f)}" style="display:inline-flex">${SVG.glass}</span>` +
            `<div class="ay-big${at('count', f)}">3 of 8 glasses</div>` +
            `<div class="ui-m-row${at('d1', f)}"><div>#1: 250 ml</div></div><div class="ui-m-row${at('d2', f)}"><div>#2: 500 ml</div></div></div>` +
            `<span class="ui-m-fab${at('fab', f)}"><span class="ay-ico" style="color:inherit">${SVG.plus}</span></span>`;
          Lab.ui.phone(el, {
            logTitle: 'TalkBack says',
            predict: {
              q: 'The round add button holds only an <code>Icon</code>, and its <code>contentDescription</code> is <code>null</code>. What does TalkBack say when it reaches the button?',
              options: ['“Add a glass, Button”', '“Button”', 'Nothing: it skips the button'],
              a: 1,
              why: 'A button can’t be skipped: it does something. But with no words anywhere inside, TalkBack can only say what kind of thing it is. (Some TalkBack versions add “Unlabelled”, or guess from the icon’s shape, but they can’t know it adds a glass.)',
            },
            frames: [
              { screen: scr(null), say: 'The water screen, with TalkBack on. TalkBack reads one element at a time; a green frame will show which one.' },
              { screen: scr('bar'), log: '“Water”', say: 'The first swipe right puts focus on the first element, top left, and reads it aloud.' },
              { screen: scr('glass'), log: '“A glass of water, Image”', say: 'Each swipe right moves to the next element: top to bottom, start to end. For the picture, TalkBack reads its <code>contentDescription</code>, then that it is an image.' },
              { screen: scr('count'), log: '“3 of 8 glasses”', say: 'A <code>Text</code> needs nothing extra: TalkBack reads its words.' },
              { screen: scr('d1'), log: '“#1: 250 ml”', say: 'The drinks are read one by one.' },
              { screen: scr('fab'), log: '“Button”', say: 'The add button’s icon has <code>contentDescription = null</code>. TalkBack knows it is a button, and nothing more. Add? Delete? Sam has to guess.' },
              { screen: scr('fab', true), log: ['// contentDescription = "Add a glass"', '“Add a glass, Button”', '“Double tap to activate”'], say: 'With words on the icon, TalkBack reads them, then the kind of thing, then a hint: a double-tap anywhere presses the button in focus.' },
            ],
          });
        },
        code: `FloatingActionButton(onClick = onAdd) {
    Icon(
        painter = painterResource(R.drawable.ic_add),
        contentDescription = null           // TalkBack: "Button". Which button?
    )
}

FloatingActionButton(onClick = onAdd) {
    Icon(
        painter = painterResource(R.drawable.ic_add),
        contentDescription = "Add a glass"  // TalkBack: "Add a glass, Button"
    )
}

Text("3 of 8 glasses")                      // TalkBack: "3 of 8 glasses"`,
        remember: 'TalkBack reads one element at a time. Everything that does something needs words; pure decoration gets null.',
        mistakes: [
          {
            title: 'Saying “button” in the label',
            bad: `Icon(
    painter = painterResource(R.drawable.ic_add),
    contentDescription = "Add button"     // "Add button, Button"
)`,
            good: `Icon(
    painter = painterResource(R.drawable.ic_add),
    contentDescription = "Add a glass"    // "Add a glass, Button"
)`,
            why: 'TalkBack adds the kind of thing by itself. Use the words for what the button does.',
          },
        ],
        terms: [
          { term: 'accessibility', def: 'Making an app work for everyone, including people who use a screen reader, a switch, a keyboard or large text. Often written a11y.' },
          { term: 'TalkBack', def: 'Android’s screen reader. Swipe right or left to move between elements; it reads each one aloud. Double-tap anywhere to press the one in focus.' },
          { term: 'Switch Access', def: 'A way to use Android with one or two switches (big buttons) instead of the touch screen. It steps through everything that can be pressed.' },
          { term: 'Accessibility Scanner', def: 'A free app from Google that checks the screen in front of you and suggests fixes for missing labels, small targets and low contrast.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The History button shows only a clock icon. Give TalkBack the word “History” for it.', code: 'TextButton(onClick = onOpenHistory) {\n    Icon(\n        painter = painterResource(R.drawable.ic_history),\n        [[contentDescription]] = "[[History]]"\n    )\n}', why: 'The icon is all the button shows, so its <code>contentDescription</code> becomes the button’s label: “History, Button”.' },
          { type: 'bug', prompt: 'With TalkBack on, the add button is read only as “Button”. Tap the line to change.', code: 'FloatingActionButton(onClick = onAdd) {\n    Icon(\n        painter = painterResource(R.drawable.ic_add),\n        contentDescription = null\n    )\n}', bug: 3, fix: '        contentDescription = "Add a glass"', why: '<code>null</code> is for decoration. Here the icon is the only thing on the button, so it must carry the words.' },
        ],
        quiz: [
          { q: 'TalkBack is on and focus is on the add button. How does Sam press it?', options: ['Double-tap anywhere on the screen', 'Tap the button once', 'Swipe right'], a: 0, why: 'With TalkBack on, a touch only reads what is under the finger. A double-tap presses the element in focus.' },
          { q: 'Who does accessibility work help?', options: ['Only people who can’t see', 'People who use TalkBack, Switch Access, large fonts or a keyboard, and many others', 'Only people with old phones'], a: 1, why: 'People use Android in many ways. Clear labels, big targets and text that can grow help almost everyone.' },
          { q: 'TalkBack reaches <code>Text("3 of 8 glasses")</code>. What does it say?', options: ['“3 of 8 glasses”', '“Text”', 'Nothing'], a: 0, why: 'A Text brings its own words, so it needs no description.' },
        ],
        docs: [['Build accessible apps', 'https://developer.android.com/guide/topics/ui/accessibility']],
      },

      {
        id: 'semantics',
        title: 'Semantics',
        tagline: 'Tell TalkBack what each element is, what it does, and what belongs together.',
        goals: ['Explain where TalkBack gets its words from', 'Mark a title as a heading and read a group as one stop', 'Say what a tap does with <code>onClickLabel</code> and <code>role</code>'],
        level: 'intermediate', introduces: ['semantics', 'mergeDescendants', 'onClickLabel', 'role', 'Role'],
        body: `
<p>Sam swipes through the water screen. The counter takes two stops, “3 of 8 glasses” and then “Goal: 8”, though they belong together. The big glass picture adds a glass when tapped, but TalkBack only says “A glass of water, Image. Double tap to activate.” Activate what?</p>
<p>TalkBack never looks at the pixels. Next to what it draws, Compose keeps a description of the screen called the <em>semantics</em>: for every element, its words, what kind of thing it is, and what it does. A <code>Text</code> adds its words, an <code>Icon</code> its <code>contentDescription</code>, a <code>Button</code> or <code>clickable</code> adds “can be pressed”. TalkBack reads this description, and Compose UI tests find elements through it too. <code>Modifier.semantics { ... }</code> adds to it.</p>
<p><code>Modifier.semantics { heading() }</code> marks a title as a heading: TalkBack says “Today, Heading”, and its users can jump from heading to heading. <code>Modifier.semantics(mergeDescendants = true) {}</code> makes a <code>Column</code> and everything in it one stop, read in one go; the braces at the end are the usual block, empty because there is nothing else to add. <code>Button</code> and <code>clickable</code> merge what is inside them on their own.</p>
<p><code>clickable</code> takes words as well. <code>onClickLabel</code> says what a double-tap does, and <code>role</code> says what kind of thing it is: <code>Modifier.clickable(onClickLabel = "add a glass", role = Role.Button) { onAdd() }</code>. Now the picture is “A glass of water, Button. Double tap to add a glass”. TalkBack puts “Double tap to” in front of the label and reads it as written, so write it in lowercase, as the end of that sentence. <code>Role.Button</code> is one of a few kinds, like <code>Role.Checkbox</code> and <code>Role.Image</code>.</p>`,
        visual(el) {
          const scr = f => `<div class="ui-m-bar">Water</div><div class="ui-m-body">` +
            `<b class="${at('today', f)}" style="justify-self:start;font-size:1rem">Today</b>` +
            `<span class="ay-mid${at('glass', f)}" style="display:inline-flex">${SVG.glass}</span>` +
            `<div class="ui-m-card${at('card', f)}" style="justify-items:center"><span class="ay-big${at('count', f)}">3 of 8 glasses</span><span class="ui-m-muted${at('goal', f)}">Goal: 8</span></div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'TalkBack says',
            predict: {
              q: 'The counter is a <code>Column</code> with two <code>Text</code>s and <code>Modifier.semantics(mergeDescendants = true) {}</code>. How many swipes does TalkBack need to get through it?',
              options: ['One: both lines are one stop', 'Two: one per Text', 'None: merged elements are skipped'],
              a: 0,
              why: 'Merging makes the Column and everything in it a single stop. TalkBack reads both lines together.',
            },
            frames: [
              { screen: scr(null), say: 'The water screen as it was, with nothing added to its semantics. Sam swipes right through it.' },
              { screen: scr('today'), log: '“Today”', say: 'The title is read like any text. Nothing tells TalkBack that a section starts here.' },
              { screen: scr('glass'), log: ['“A glass of water, Image”', '“Double tap to activate”'], say: 'The picture is <code>clickable</code>, so TalkBack offers a double-tap. To do what?' },
              { screen: scr('count'), log: '“3 of 8 glasses”', say: 'The counter’s first line…' },
              { screen: scr('goal'), log: '“Goal: 8”', say: '…and its second line, one more swipe later. Two stops for one fact.' },
              { screen: scr('today'), log: ['// semantics { heading() }', '“Today, Heading”'], say: 'Now with semantics. The title is a heading: TalkBack says so, and Sam can jump straight to it.' },
              { screen: scr('glass'), log: ['// clickable(onClickLabel = "add a glass", role = Role.Button)', '“A glass of water, Button”', '“Double tap to add a glass”'], say: 'The role says it works like a button. The click label turns the hint into what will happen.' },
              { screen: scr('card'), log: ['// semantics(mergeDescendants = true) {}', '“3 of 8 glasses, Goal: 8”'], say: 'The merged Column is one stop, and both lines are read together.' },
            ],
          });
        },
        code: `Text(
    "Today",
    style = MaterialTheme.typography.headlineSmall,
    modifier = Modifier.semantics { heading() }
)
// TalkBack: "Today, Heading"

Image(
    painter = painterResource(R.drawable.glass),
    contentDescription = stringResource(R.string.glass_description),
    modifier = Modifier
        .size(96.dp)
        .clickable(onClickLabel = "add a glass", role = Role.Button) { onAdd() }
)
// TalkBack: "A glass of water, Button", then "Double tap to add a glass"

Column(modifier = Modifier.semantics(mergeDescendants = true) {}) {
    Text("$glasses of 8 glasses", fontSize = 28.sp)
    Text("Goal: 8")
}
// TalkBack: "3 of 8 glasses, Goal: 8", one stop`,
        remember: 'Compose describes the screen in its semantics. heading() marks titles, mergeDescendants makes one stop, onClickLabel and role say what a tap does.',
        mistakes: [
          {
            title: 'A click label about the gesture',
            bad: `Modifier.clickable(onClickLabel = "tap the glass") { onAdd() }
// "Double tap to tap the glass"`,
            good: `Modifier.clickable(onClickLabel = "add a glass") { onAdd() }
// "Double tap to add a glass"`,
            why: 'TalkBack puts “Double tap to” in front of the label. Say what happens, not how to touch.',
          },
        ],
        terms: [
          { term: 'semantics', def: 'The description of the screen that Compose keeps next to what it draws: each element’s words, what kind of thing it is and what it does. TalkBack and UI tests read it.' },
          { term: 'heading', def: '<code>Modifier.semantics { heading() }</code> marks a title, so TalkBack says “Heading” and users can jump between headings.' },
          { term: 'mergeDescendants', def: 'With <code>Modifier.semantics(mergeDescendants = true) {}</code>, an element and everything inside it become one TalkBack stop.' },
          { term: 'Role', def: 'What kind of control an element is, such as <code>Role.Button</code> or <code>Role.Checkbox</code>. TalkBack says it after the label.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Mark “History” as a heading, and read each day as one stop.', code: 'Text(\n    "History",\n    modifier = Modifier.semantics { [[heading]]() }\n)\nColumn(modifier = Modifier.semantics([[mergeDescendants]] = true) {}) {\n    Text("Monday")\n    Text("7 of 8 glasses")\n}', why: '<code>heading()</code> lets TalkBack users jump to the title. <code>mergeDescendants</code> reads “Monday, 7 of 8 glasses” in one stop.' },
          { type: 'bug', prompt: 'This row opens History when tapped, but TalkBack calls it an image. Tap the line to change.', code: 'Row(\n    modifier = Modifier.clickable(\n        onClickLabel = "open history",\n        role = Role.Image\n    ) { onOpenHistory() }\n) {\n    Text("History")\n}', bug: 3, fix: '        role = Role.Button', why: 'The row works like a button, so its role should say so. TalkBack then reads “History, Button. Double tap to open history”.' },
        ],
        quiz: [
          { q: 'Where does TalkBack get its words from?', options: ['From the semantics Compose keeps for the screen', 'From the pixels on the screen', 'From your Kotlin source code'], a: 0, why: 'Compose builds a description of every element next to what it draws. TalkBack reads that description.' },
          { q: 'What does <code>onClickLabel = "add a glass"</code> change?', options: ['The hint: “Double tap to add a glass”', 'The text drawn on the screen', 'What happens on a tap'], a: 0, why: 'It only changes what TalkBack says. The tap still runs the lambda you gave <code>clickable</code>.' },
          { q: 'What does <code>Modifier.semantics { heading() }</code> let TalkBack users do?', options: ['Jump from heading to heading', 'Make the text bigger', 'Skip the element'], a: 0, why: 'Headings split a screen into sections, and TalkBack can move between them, the way you skim titles with your eyes.' },
        ],
        docs: [['Semantics', 'https://developer.android.com/develop/ui/compose/accessibility/semantics'], ['Accessibility by default in Compose', 'https://developer.android.com/develop/ui/compose/accessibility/api-defaults']],
      },

      {
        id: 'custom-actions',
        title: 'Custom actions',
        tagline: 'Offer every gesture as a named action that TalkBack can list.',
        goals: ['Explain why drags and swipes don’t reach your app with TalkBack on', 'Add a named action with <code>customActions</code>', 'Hide a duplicate button from TalkBack with <code>clearAndSetSemantics</code>'],
        level: 'intermediate', introduces: ['customActions', 'CustomAccessibilityAction', 'clearAndSetSemantics'],
        body: `
<p>In the gestures lesson, a drink row slides to the left to show its Delete button. Sam can’t do that: with TalkBack on, a one-finger swipe moves TalkBack’s focus to the previous element, so the row never moves. Worse, TalkBack still finds the Delete button hidden behind the row, and reads “Delete, Button” without saying which drink.</p>
<p>Give the row the action itself. In its semantics, <code>customActions</code> takes a list of <code>CustomAccessibilityAction("Delete") { ... }</code>: a name to show, and a lambda to run. As in any lambda, the last value is the result: <code>true</code> tells TalkBack the action worked. TalkBack lists these actions in its menu: a three-finger tap (or a swipe down, then right, in one move) opens the TalkBack menu, and under Actions Sam finds Delete. Switch Access offers the same list, and so does Voice Access, which lets people control the phone by speaking.</p>
<p>The hidden button has to leave the semantics, or it stays a confusing extra stop. <code>Modifier.clearAndSetSemantics { }</code> removes an element’s semantics, and everything inside it, from what TalkBack sees. Its braces could set new properties; here they stay empty. The drag keeps working for touch: the action is a second way to the same result, not a replacement.</p>`,
        visual(el) {
          const DR = [['d1', '#1: 250 ml'], ['d2', '#2: 500 ml'], ['d3', '#3: 250 ml']];
          const scr = (f, { gone = false, menu = null } = {}) => `<div class="ui-m-bar">Water</div><div class="ui-m-body"><div class="ay-big">${gone ? 2 : 3} of 8 glasses</div>` +
            DR.filter(([k]) => !(gone && k === 'd2')).map(([k, t]) => `<div class="ui-m-row${at(k, f)}" style="justify-content:space-between"><div>${t}</div>${k === 'd2' && f === 'hid' ? '<span class="ay-f ui-m-muted">Delete</span>' : ''}</div>`).join('') + '</div>' +
            (menu === 'menu' ? '<div class="ui-m-sheet"><b>TalkBack menu</b><div class="ay-menu"><span class="ay-f">Actions</span><span class="ui-m-muted">…</span></div></div>' : '') +
            (menu === 'acts' ? '<div class="ui-m-sheet"><b>Actions</b><div class="ay-menu"><span class="ay-f del">Delete</span></div></div>' : '');
          Lab.ui.phone(el, {
            logTitle: 'TalkBack',
            predict: {
              q: 'TalkBack is on and focus is on drink #2. Sam swipes left on the row with one finger. What happens?',
              options: ['The row slides and shows Delete', 'TalkBack’s focus moves to the previous element', 'Drink #2 is deleted'],
              a: 1,
              why: 'TalkBack uses one-finger swipes to move its focus. The drag never reaches the row.',
            },
            frames: [
              { screen: scr(null), say: 'Touch users drag a drink row to the left to show its Delete button. Now TalkBack is on.' },
              { screen: scr('d2'), log: '“#2: 500 ml”', say: 'Focus is on drink #2.' },
              { screen: scr('d1'), log: ['// one-finger swipe left on #2', '“#1: 250 ml”'], say: 'Sam swipes left to delete it. TalkBack takes the swipe and moves focus back to drink #1. Nothing slides.' },
              { screen: scr('hid'), log: ['// swipe right, swipe right', '“Delete, Button”'], say: 'Swiping on, TalkBack stops on the Delete button hidden behind the row. Delete what?' },
              { screen: scr('d2'), log: ['// customActions on the row,', '// clearAndSetSemantics on the hidden button', '“#2: 500 ml”'], say: 'With the fix, the hidden button is gone from TalkBack, and the row carries a Delete action.' },
              { screen: scr('d2', { menu: 'menu' }), log: '// three-finger tap: TalkBack menu', say: 'A three-finger tap opens the TalkBack menu. Actions lists what the focused element can do.' },
              { screen: scr('d2', { menu: 'acts' }), tap: '.del', log: '// Actions: Delete', say: 'Each <code>CustomAccessibilityAction</code> shows up here by its name.' },
              { screen: scr(null, { gone: true }), log: ['// double-tap Delete', 'onDelete()   // the lambda returns true'], say: 'Picking Delete runs the same <code>onDelete</code> as the hidden button. Touch users can still drag.' },
            ],
          });
        },
        code: `@Composable
fun SwipeDrinkRow(drink: Drink, onDelete: () -> Unit) {
    var offsetX by remember { mutableFloatStateOf(0f) }
    Box(contentAlignment = Alignment.CenterEnd) {
        TextButton(
            onClick = onDelete,
            modifier = Modifier.clearAndSetSemantics { }   // not a stop: the row's action replaces it
        ) { Text("Delete") }
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .offset { IntOffset(offsetX.roundToInt(), 0) }
                .draggable(
                    orientation = Orientation.Horizontal,
                    state = rememberDraggableState { delta -> offsetX += delta },
                )
                .semantics(mergeDescendants = true) {
                    customActions = listOf(
                        CustomAccessibilityAction("Delete") {
                            onDelete()
                            true                        // the action worked
                        }
                    )
                },
        ) {
            Text("#\${drink.id}: \${drink.ml} ml", modifier = Modifier.padding(16.dp))
        }
    }
}
// TalkBack on the row: "#2: 500 ml". TalkBack menu > Actions: Delete`,
        remember: 'Every gesture needs a second way in: a CustomAccessibilityAction with a clear name, listed in TalkBack’s menu.',
        mistakes: [
          {
            title: 'Naming the gesture',
            bad: `CustomAccessibilityAction("Swipe left") {
    onDelete()
    true
}`,
            good: `CustomAccessibilityAction("Delete") {
    onDelete()
    true
}`,
            why: 'The menu is for people who can’t make the gesture. Name what the action does.',
          },
        ],
        terms: [
          { term: 'customActions', def: 'A semantics property with a list of extra actions an element offers. TalkBack shows them under Actions in its menu.' },
          { term: 'CustomAccessibilityAction', def: 'One extra action: <code>CustomAccessibilityAction("Delete") { ... }</code>, a name and a lambda that returns <code>true</code> when it worked.' },
          { term: 'clearAndSetSemantics', def: 'A modifier that removes an element’s semantics and its children’s, keeping only what you set in its braces. With empty braces, TalkBack doesn’t see it at all.' },
          { term: 'TalkBack menu', def: 'A menu TalkBack opens with a three-finger tap, or a swipe down then right. Its Actions entry lists what the focused element can do.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Offer “Mark as favorite” as an action, and report that it worked.', code: 'Modifier.semantics(mergeDescendants = true) {\n    customActions = listOf(\n        [[CustomAccessibilityAction]]("Mark as favorite") {\n            onFavorite()\n            [[true]]\n        }\n    )\n}', why: 'Each action is a <code>CustomAccessibilityAction</code> with a name. The lambda’s last value, <code>true</code>, says it worked.' },
          { type: 'bug', prompt: 'The row has a Delete action, yet TalkBack still stops on a “Delete, Button” hidden behind it. Tap the line to change.', code: 'Box(contentAlignment = Alignment.CenterEnd) {\n    TextButton(onClick = onDelete) { Text("Delete") }\n    Surface(\n        modifier = Modifier.semantics(mergeDescendants = true) {\n            customActions = listOf(\n                CustomAccessibilityAction("Delete") {\n                    onDelete()\n                    true\n                }\n            )\n        }\n    ) {\n        Text("#2: 500 ml", modifier = Modifier.padding(16.dp))\n    }\n}', bug: 1, fix: '    TextButton(onClick = onDelete, modifier = Modifier.clearAndSetSemantics { }) { Text("Delete") }', why: 'The hidden button is still part of the semantics. Clearing it leaves one stop per drink, with Delete in the actions.' },
        ],
        quiz: [
          { q: 'Why does dragging a row do nothing with TalkBack on?', options: ['TalkBack uses one-finger swipes to move its focus', 'TalkBack switches off all gestures in every app', 'The row is too small'], a: 0, why: 'TalkBack keeps those gestures for itself. A custom action gives Sam another way to the same result.' },
          { q: 'Which name is best for a custom action?', options: ['“Delete”', '“Swipe left”', '“Action 1”'], a: 0, why: 'The user picks a result from a list. Name the result.' },
          { q: 'What does <code>Modifier.clearAndSetSemantics { }</code> do to a button?', options: ['TalkBack no longer sees it; it still works for touch', 'It hides the button from the screen', 'It turns the button off'], a: 0, why: 'It only removes the description TalkBack reads. Drawing and taps are unchanged.' },
        ],
        docs: [['Semantics: custom actions', 'https://developer.android.com/develop/ui/compose/accessibility/semantics']],
      },

      {
        id: 'targets',
        title: 'Touch targets',
        tagline: 'At least 48 by 48 dp for every finger, whatever size the icon is.',
        goals: ['Explain the 48 dp rule for touch targets', 'Use <code>IconButton</code> for icons people tap', 'Give your own small clickable room with <code>minimumInteractiveComponentSize</code>'],
        level: 'intermediate', introduces: ['IconButton', 'minimumInteractiveComponentSize'],
        body: `
<p>Each drink row gets two small icons: a pencil to edit the drink and a bin to delete it. They are 24 dp each, side by side. Lin’s hand shakes a little, and she keeps deleting drinks she meant to edit. A fingertip covers about 48 dp, so it lands on both icons at once.</p>
<p>Material’s rule is a <em>touch target</em> of at least 48 by 48 dp, about 9 mm, even when the icon you see is smaller. <code>IconButton(onClick = onDelete) { Icon(...) }</code> is made for this: it draws the icon at its size and keeps 48 by 48 dp around it for the finger. It also tells TalkBack it is a button, and the icon’s <code>contentDescription</code> becomes its label.</p>
<p>For your own small clickable thing, add <code>Modifier.minimumInteractiveComponentSize()</code> before <code>clickable</code>. It makes the element at least 48 dp wide and tall in the layout, so its neighbours keep their distance, while what it draws keeps its size. Compose lets a tap just outside a small clickable count, but it can’t move the neighbours away; this modifier makes the room. Modifiers apply in order, first to last, so put it before any <code>size(...)</code>.</p>`,
        visual(el) {
          const ic = (k, svg, big, show) => big
            ? `<span class="ay-hit ay-lg${show ? ' ay-show' : ''} ${k}"><span class="ay-ico ay-sm">${svg}</span></span>`
            : `<span class="ay-hit ay-sm ${k}"><span class="ay-ico ay-sm">${svg}</span></span>`;
          const row = (t, big, show, finger, f) => `<div class="ay-row"><span>${t}</span><span class="ay-pair">${ic('ed', SVG.edit, big, show)}<span class="${f === 'del' && t === '#2: 500 ml' ? 'ay-f' : ''}" style="display:inline-flex">${ic('dl', SVG.del, big, show)}</span>${finger ? '<span class="ay-finger"></span>' : ''}</span></div>`;
          const scr = ({ big = false, show = false, finger = false, f = null, n = 3 } = {}) => `<div class="ui-m-bar">Water</div><div class="ui-m-body"><div class="ay-big">${n} of 8 glasses</div>` +
            (n === 3 ? row('#1: 250 ml', big, show, false, f) : '') + row('#2: 500 ml', big, show, finger, f) + row('#3: 250 ml', big, show, false, f) + '</div>';
          Lab.ui.phone(el, {
            logTitle: 'What happens',
            predict: {
              q: 'You swap the two 24 dp icons for <code>IconButton</code>s. What changes on the screen?',
              options: ['The icons are drawn at 48 dp', 'The icons look the same, but each one gets 48 by 48 dp of room', 'Nothing changes'],
              a: 1,
              why: 'IconButton keeps the icon’s size and reserves 48 by 48 dp around it, so the icons move apart.',
            },
            frames: [
              { screen: scr(), say: 'Each drink row has an edit icon and a delete icon, 24 dp each, almost touching.' },
              { screen: scr({ finger: true }), log: '// a fingertip: about 48 dp', say: 'The red circle is a fingertip, drawn to scale: about 48 dp, twice the size of an icon. It covers both.' },
              { screen: scr({ n: 2 }), log: ['// Lin taps to edit #1', 'onDelete()   // drink #1 is gone'], say: 'Lin aims for the pencil on drink #1, and the bin gets the tap. The drink is gone.' },
              { screen: scr({ big: true, show: true, n: 2 }), log: '// IconButton: 48 × 48 dp each', say: 'With <code>IconButton</code>, each icon keeps its look and gets 48 by 48 dp of room, the dashed boxes. The demo draws them; your app won’t.' },
              { screen: scr({ big: true, show: true, finger: true, n: 2 }), log: 'onEdit()', say: 'Now the fingertip fits inside one target. The tap goes where Lin meant it to.' },
              { screen: scr({ big: true, f: 'del', n: 2 }), log: 'TalkBack: “Delete, Button”', say: 'IconButton also tells TalkBack it is a button, named by its icon’s <code>contentDescription</code>.' },
            ],
          });
        },
        code: `@Composable
fun DrinkRow(drink: Drink, onEdit: () -> Unit, onDelete: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("#\${drink.id}: \${drink.ml} ml")
        IconButton(onClick = onEdit) {                 // 48 by 48 dp to touch
            Icon(painterResource(R.drawable.ic_edit), contentDescription = "Edit")
        }
        IconButton(onClick = onDelete) {
            Icon(painterResource(R.drawable.ic_delete), contentDescription = "Delete")
        }
    }
}

// Your own small tappable thing: at least 48 dp in the layout
Text(
    "+250 ml",
    modifier = Modifier
        .minimumInteractiveComponentSize()
        .clickable { onAdd(250) }
)`,
        remember: 'Every target at least 48 by 48 dp: IconButton for icons, minimumInteractiveComponentSize() for your own small clickables.',
        mistakes: [
          {
            title: 'Padding before clickable',
            bad: `Text(
    "History",
    modifier = Modifier
        .padding(16.dp)
        .clickable { onOpenHistory() }   // only the word reacts
)`,
            good: `Text(
    "History",
    modifier = Modifier
        .clickable { onOpenHistory() }   // the word and the space around it
        .padding(16.dp)
)`,
            why: 'Modifiers apply in order. With padding first, the clickable area is only the word. With clickable first, the 16 dp of space counts too, and the target is much bigger.',
          },
        ],
        terms: [
          { term: 'touch target', def: 'The area that reacts to a finger. It should be at least 48 by 48 dp, about 9 mm, even around a smaller icon.' },
          { term: 'IconButton', def: 'A button that shows one <code>Icon</code> and keeps 48 by 48 dp around it. TalkBack reads the icon’s <code>contentDescription</code> as its label.' },
          { term: 'minimumInteractiveComponentSize', def: 'A modifier that makes an element at least 48 dp wide and tall in the layout, without changing what it draws.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the bin a proper button, and give the small “+250 ml” text 48 dp of room.', code: '[[IconButton]](onClick = onDelete) {\n    Icon(painterResource(R.drawable.ic_delete), contentDescription = "Delete")\n}\nText(\n    "+250 ml",\n    modifier = Modifier\n        .[[minimumInteractiveComponentSize]]()\n        .clickable { onAdd(250) }\n)', why: 'IconButton reserves the room for you. For your own clickable, the modifier does it, placed before <code>clickable</code>.' },
          { type: 'bug', prompt: 'The bin icon is hard to hit, and the next row’s bin sits right under it. Tap the line to change.', code: 'Row(verticalAlignment = Alignment.CenterVertically) {\n    Text("#2: 500 ml")\n    Icon(\n        painterResource(R.drawable.ic_delete),\n        contentDescription = "Delete",\n        modifier = Modifier.size(24.dp).clickable { onDelete() }\n    )\n}', bug: 5, fix: '        modifier = Modifier.minimumInteractiveComponentSize().size(24.dp).clickable { onDelete() }', why: 'The icon is 24 dp and nothing keeps its neighbours away. <code>minimumInteractiveComponentSize()</code> first, before the size, reserves 48 dp around it. (An <code>IconButton</code> would do the same.)' },
        ],
        quiz: [
          { q: 'How big should a touch target be at least?', options: ['48 by 48 dp', '24 by 24 dp', '12 by 12 dp'], a: 0, why: '48 dp is about 9 mm, roughly a fingertip.' },
          { q: 'An <code>IconButton</code> holds a 24 dp icon. How big is the icon drawn?', options: ['24 dp, with 48 dp of room around it to touch', '48 dp', '12 dp'], a: 0, why: 'The icon keeps its size. The extra room is for the finger.' },
          { q: 'Where does <code>minimumInteractiveComponentSize()</code> go in the chain?', options: ['Before any <code>size(...)</code> on the element', 'At the very end', 'It doesn’t matter'], a: 0, why: 'Modifiers apply in order. A size that comes first would already limit the element, and the minimum couldn’t take effect.' },
        ],
        docs: [['Touch target size', 'https://developer.android.com/develop/ui/compose/accessibility/api-defaults']],
      },

      {
        id: 'keyboard-nav',
        title: 'Keyboard navigation',
        tagline: 'Tab to move, Enter to press: make the screen work without touching it.',
        goals: ['Move through a screen with Tab, the arrow keys and Enter', 'Tell which elements can take keyboard focus', 'Put focus where the user needs it with <code>FocusRequester</code>'],
        level: 'intermediate', introduces: ['FocusRequester', 'focusRequester', 'requestFocus'],
        body: `
<p>Lin uses the water tracker on a tablet with a keyboard, and her hands stay on the keys. Many people work like this: on Chromebooks, on tablets with keyboards, and on TVs, with the arrow pad of a remote called the <em>D-pad</em>. Some can’t use a touch screen at all. They all move a <em>focus</em> from element to element, and press the one in focus.</p>
<p>Compose does most of the work. Tab moves the focus to the next element that can take it, in the order they appear on screen; Shift+Tab goes back. The arrow keys and the D-pad move to the closest element in that direction, and stay put if there is none. Enter presses the element in focus. Buttons, text fields and anything <code>clickable</code> can take focus, and Material draws a highlight on the one that has it. A plain <code>Text</code> can’t: there is nothing to press.</p>
<p>Sometimes focus should start in a certain place. The Daily goal screen has one field, and the user came here to type. A <code>FocusRequester</code> is a handle you attach to an element with <code>Modifier.focusRequester(goalFocus)</code>; calling <code>goalFocus.requestFocus()</code> moves the focus there. Call it from <code>LaunchedEffect(Unit)</code>, which runs once the screen is shown. On the emulator, your computer’s keyboard acts as the phone’s keyboard, so you can try Tab and the arrows right away.</p>`,
        visual(el) {
          const today = (k, n) => `<div class="ui-m-bar">Water</div><div class="ui-m-body" style="justify-items:center">` +
            `<span class="${at('glass', k, 'ay-k')}" style="display:inline-flex">${SVG.glass}</span>` +
            `<div class="ay-big">${n} of 8 glasses</div>` +
            `<span class="ui-m-btn ay-mid${at('add', k, 'ay-k')}">Add a glass</span>` +
            `<span class="ui-m-btn ghost ay-mid${at('goal', k, 'ay-k')}">Change goal</span></div>`;
          const goal = k => `<div class="ui-m-bar">Daily goal</div><div class="ui-m-body"><span class="ui-m-muted">How many glasses a day?</span>` +
            `<div class="ui-m-field${k ? ' on ay-k' : ''}">Daily goal${k ? ' |' : ''}</div></div>`;
          Lab.ui.phone(el, {
            logTitle: 'Keys pressed',
            predict: {
              q: 'Focus is on the glass picture. Below it come the Text “3 of 8 glasses”, then the Add a glass button. Lin presses Tab. Where does focus go?',
              options: ['To the Text', 'To the Add a glass button', 'Nowhere: Tab only works in text fields'],
              a: 1,
              why: 'Tab goes to the next element that can take focus. A plain Text has nothing to press, so it is skipped.',
            },
            frames: [
              { screen: today(null, 3), say: 'A keyboard is connected. Nothing has focus yet.' },
              { screen: today('glass', 3), log: 'Tab', say: 'Tab: focus goes to the first element that can take it, the clickable glass. The ring shows where focus is.' },
              { screen: today('add', 3), log: 'Tab', say: 'The next Tab skips “3 of 8 glasses”, a plain Text, and lands on the button.' },
              { screen: today('add', 4), log: ['Enter', '// onClick runs: 4 of 8 glasses'], say: 'Enter presses the element in focus, as a tap would.' },
              { screen: today('goal', 4), log: 'Tab', say: 'Tab again: Change goal. Shift+Tab would go back to Add a glass.' },
              { screen: goal(false), log: ['Enter', '// the Daily goal screen opens', '// focus: nowhere yet'], say: 'Enter opens the Daily goal screen. Focus is nowhere, so Lin has to press Tab before she can type.' },
              { screen: goal(true), log: ['// with goalFocus.requestFocus()', '// in LaunchedEffect(Unit)', '// focus: the Daily goal field'], say: 'With a <code>FocusRequester</code>, the screen puts focus in the field when it opens. Lin types her goal at once.' },
            ],
          });
        },
        code: `@Composable
fun GoalScreen(goalState: TextFieldState) {
    val goalFocus = remember { FocusRequester() }
    TextField(
        state = goalState,
        label = { Text("Daily goal") },
        modifier = Modifier.focusRequester(goalFocus)
    )
    LaunchedEffect(Unit) {
        goalFocus.requestFocus()    // focus starts in the field: type right away
    }
}

// With a keyboard, on any screen:
// Tab        the next element that can take focus
// Shift+Tab  the one before
// arrows     the closest element in that direction
// Enter      presses the element in focus`,
        remember: 'Tab follows the screen order, arrows go to the nearest element, Enter presses. A FocusRequester puts focus where the user needs it.',
        terms: [
          { term: 'focus', def: 'The one element that keys act on. Tab and the arrow keys move it; Enter presses the element that has it.' },
          { term: 'D-pad', def: 'Direction pad: the up, down, left and right buttons on a TV remote or game controller. It moves focus like the arrow keys.' },
          { term: 'FocusRequester', def: 'A handle attached to an element with <code>Modifier.focusRequester(...)</code>. Its <code>requestFocus()</code> moves the focus to that element.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'When the screen opens, put the focus in the Name field.', code: 'val nameFocus = remember { [[FocusRequester]]() }\nTextField(\n    state = nameState,\n    label = { Text("Name") },\n    modifier = Modifier.[[focusRequester]](nameFocus)\n)\nLaunchedEffect(Unit) {\n    nameFocus.[[requestFocus]]()\n}', why: 'Create the handle, attach it to the field, and ask for focus once the screen is shown.' },
          { type: 'bug', prompt: 'The field should have focus when the screen opens, but it doesn’t. Tap the line to change.', code: '@Composable\nfun GoalScreen(goalState: TextFieldState) {\n    val goalFocus = remember { FocusRequester() }\n    goalFocus.requestFocus()\n    TextField(\n        state = goalState,\n        label = { Text("Daily goal") },\n        modifier = Modifier.focusRequester(goalFocus)\n    )\n}', bug: 3, fix: '    LaunchedEffect(Unit) { goalFocus.requestFocus() }', why: 'The composable’s body runs while the screen is being built, before the field is attached to the handle, so the request finds nothing. <code>LaunchedEffect</code> runs once the screen is shown.' },
        ],
        quiz: [
          { q: 'Focus is on a button. Lin presses Enter. What happens?', options: ['The button is pressed, as if tapped', 'Focus moves to the next element', 'Nothing: Enter only works in text fields'], a: 0, why: 'Enter presses the element in focus. Tab is the key that moves.' },
          { q: 'Which of these can take keyboard focus?', options: ['A <code>Button</code>', 'A plain <code>Text</code>', 'A decorative <code>Image</code>'], a: 0, why: 'Elements you can press or type into take focus. Text and pictures that do nothing are skipped.' },
          { q: 'Focus is on the bottom button and nothing is below it. Lin presses the down arrow. What happens?', options: ['Focus stays where it is', 'Focus jumps to the top', 'The app closes'], a: 0, why: 'The arrow keys look for the closest element in that direction. When there is none, focus doesn’t move.' },
        ],
        docs: [['Focus in Compose', 'https://developer.android.com/develop/ui/compose/touch-input/focus'], ['Change focus traversal order', 'https://developer.android.com/develop/ui/compose/touch-input/focus/change-focus-traversal-order']],
      },

      {
        id: 'text-scale',
        title: 'Large text',
        tagline: 'Text in sp grows with the user’s font size. Leave it room to grow.',
        goals: ['Explain what the font size setting changes, up to 200%', 'Let rows grow with their text using <code>heightIn</code>', 'Check a screen at 200% with <code>@Preview(fontScale = 2f)</code>'],
        level: 'intermediate', introduces: ['heightIn', 'fontScale'],
        body: `
<p>Lin’s grandfather sets the font size to the largest in Settings (Accessibility &gt; Display size and text). In the water tracker, the note under every drink, like “after my run”, is cut off at the bottom of its row.</p>
<p>Text sized in <code>sp</code> follows that setting; sizes in <code>dp</code> don’t. Since Android 14, the largest font size is 200%, and not all text grows the same: small text grows almost twice as big, while big text grows less, because it was easy to read already. The font size is part of the configuration, like the screen’s shape: changing it recreates the Activity, and the screen is drawn again with the new size.</p>
<p>Text that grows needs room to grow. A row with <code>.height(56.dp)</code> stays 56 dp tall at any font size, so bigger text runs out of it and is cut off. <code>Modifier.heightIn(min = 56.dp)</code> sets only a minimum: the row is 56 dp tall at the normal size, and taller when its text needs more. In the same way, let text wrap onto another line rather than squeezing it.</p>
<p>You can check without changing your phone’s settings. <code>@Preview(fontScale = 2f)</code> draws a preview with text at 200%. Put it under a normal <code>@Preview</code>, on the same function, to get both side by side.</p>`,
        visual(el) {
          const SIZE = { 1: ['0.82rem', '0.72rem', '1.05rem'], 1.5: ['1.12rem', '0.98rem', '1.25rem'], 2: ['1.4rem', '1.22rem', '1.45rem'] };
          const scr = (scale, grow) => {
            const [t, n, big] = SIZE[scale];
            const row = (title, note) => `<div class="ay-fixed${!grow && scale > 1 ? ' ay-clip' : ''}" style="${grow ? 'min-height:38px' : 'height:38px'};padding:3px 0"><span style="font-size:${t};line-height:1.15">${title}</span><span class="ui-m-muted" style="font-size:${n};line-height:1.15">${note}</span></div>`;
            return `<div class="ui-m-bar" style="font-size:${t}">Water</div><div class="ui-m-body" style="overflow:hidden"><span class="ay-mid" style="display:inline-flex">${SVG.glass}</span>` +
              `<div class="ay-big" style="font-size:${big}">3 of 8 glasses</div>` + row('#1: 250 ml', 'with lunch') + row('#2: 500 ml', 'after my run') + row('#3: 250 ml', 'at my desk') + '</div>';
          };
          Lab.ui.phone(el, {
            logTitle: 'Font size',
            predict: {
              q: 'The font size goes to 200%. Each drink row has <code>.height(56.dp)</code> and two lines of text. What happens to the second line?',
              options: ['The row grows to fit it', 'It is cut off: the row stays 56 dp tall', 'The text stays at its normal size'],
              a: 1,
              why: 'A fixed height in dp ignores the font size. The text grows, the row doesn’t.',
            },
            frames: [
              { screen: scr(1, false), log: '100%', say: 'Normal font size. Each drink row is a Column with <code>.height(56.dp)</code>: the drink, and a note under it.' },
              { screen: scr(1.5, false), log: '150%', say: 'At 150% the text grows, the rows don’t. The notes are pushed against the bottom edge. The red line marks where the row cuts its content.' },
              { screen: scr(2, false), log: '200%', say: 'At 200% the notes disappear: they are below the bottom of their rows. Lin’s grandfather never sees them.' },
              { screen: scr(2, true), log: ['200%', '// .heightIn(min = 56.dp)'], say: 'With <code>heightIn(min = 56.dp)</code> every row grows to fit its text. The screen is longer, and nothing is lost.' },
              { screen: scr(2, true), log: '// the glass picture: dp, same size', say: 'The glass picture and the spaces are in dp, so they keep their size. And the big counter grew less than the small notes did: big text is already easy to read.' },
              { screen: scr(1, true), log: ['100%', '// .heightIn(min = 56.dp)'], say: 'Back at 100%, the rows look exactly as before: 56 dp is still the minimum.' },
            ],
          });
        },
        code: `@Composable
fun DrinkRow(drink: Drink, note: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)        // at least 56 dp, taller when the text needs it
            .padding(8.dp)
    ) {
        Text("#\${drink.id}: \${drink.ml} ml", fontSize = 16.sp)
        Text(note, fontSize = 14.sp)
    }
}

@Preview(showBackground = true)
@Preview(showBackground = true, fontScale = 2f)   // the same row, text at 200%
@Composable
fun DrinkRowPreview() {
    DrinkRow(Drink(id = 2, ml = 500), note = "after my run")
}`,
        remember: 'Text in sp, everything else in dp. Give text minimum heights, never fixed ones, and check at 200%.',
        terms: [
          { term: 'font size setting', def: 'The text size a user picks in Settings, up to 200% since Android 14. It changes every size given in <code>sp</code>.' },
          { term: 'nonlinear font scaling', def: 'Since Android 14, small text grows almost by the full setting, while large text grows less.' },
          { term: 'heightIn', def: '<code>Modifier.heightIn(min = 56.dp)</code> sets a smallest height and lets the element grow taller when its content needs it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Size the text so it follows the font setting, and let the row grow with it.', code: 'Row(modifier = Modifier.[[heightIn]](min = 48.dp)) {\n    Text("History", fontSize = 16.[[sp]])\n}', why: '<code>sp</code> follows the user’s font size. <code>heightIn(min = ...)</code> keeps the row at least 48 dp tall and lets it grow.' },
          { type: 'bug', prompt: 'At the largest font size, the result under each day in History is cut off. Tap the line that causes it.', code: '@Composable\nfun DayRow(day: String, result: String) {\n    Column(\n        modifier = Modifier\n            .fillMaxWidth()\n            .height(56.dp)\n            .padding(8.dp)\n    ) {\n        Text(day, fontSize = 16.sp)\n        Text(result, fontSize = 14.sp)\n    }\n}', bug: 5, fix: '            .heightIn(min = 56.dp)', why: 'A fixed height doesn’t grow when the text does. A minimum height looks the same at 100% and grows when needed.' },
        ],
        quiz: [
          { q: 'The user picks a larger font size. What grows?', options: ['Sizes in sp: the text', 'Sizes in dp: spaces and pictures', 'Both'], a: 0, why: 'The setting is for text. Spaces, icons and pictures in dp stay the same.' },
          { q: 'At 200%, which grows more compared to its normal size?', options: ['14 sp body text', 'A 30 sp headline', 'Both double'], a: 0, why: 'Since Android 14 the growth is nonlinear: small text nearly doubles, big text grows less.' },
          { q: 'A row has <code>heightIn(min = 56.dp)</code>. Its text needs 80 dp at 200%. How tall is the row?', options: ['80 dp', '56 dp', '112 dp'], a: 0, why: 'The minimum is 56 dp. When the content needs more, the row grows to fit it.' },
        ],
        docs: [['Nonlinear font scaling to 200%', 'https://developer.android.com/about/versions/14/features']],
      },

      {
        id: 'window-size',
        title: 'Window sizes',
        tagline: 'Pick the layout from the width of the app’s window, not from the kind of device.',
        goals: ['Name the window size classes and their widths', 'Read the current size class with <code>currentWindowAdaptiveInfoV2</code>', 'Show one screen or two side by side, depending on the width'],
        level: 'intermediate', introduces: ['currentWindowAdaptiveInfoV2', 'windowSizeClass', 'isWidthAtLeastBreakpoint', 'WindowSizeClass', 'WIDTH_DP_EXPANDED_LOWER_BOUND', 'WIDTH_DP_MEDIUM_LOWER_BOUND'],
        body: `
<p>Lin opens the water tracker on a tablet held sideways. The Today screen is stretched across a screen as wide as two phones, with a big empty middle. There is room for Today and History side by side. But the same tablet can also show the app in half of a split screen, with only a phone’s width left.</p>
<p>So the layout should follow the size of the app’s <em>window</em>, not the device. Android sorts window widths into <em>window size classes</em>: <b>Compact</b> under 600 dp (most phones held upright), <b>Medium</b> from 600 to 839 dp (an unfolded foldable, a small tablet, often a phone on its side) and <b>Expanded</b> from 840 dp (a tablet on its side). Newer versions of the size classes add <b>Large</b> from 1200 dp and <b>Extra-large</b> from 1600 dp, for big tablets and desktop windows. Heights have classes too, with lines at 480 and 900 dp.</p>
<p>The <code>material3-adaptive</code> library works it out for you; its line for <code>build.gradle.kts</code> is at the end of the code. <code>currentWindowAdaptiveInfoV2().windowSizeClass</code> is the current class, and <code>isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)</code> is <code>true</code> from 840 dp up. When the window changes size, the class changes too, and Compose draws the other layout.</p>
<p>A note: there is also an older function without V2. It doesn’t know Large and Extra-large, and Android Studio shows it crossed out, as deprecated: kept only for old code.</p>`,
        visual(el) {
          const MAX = 1300;
          const win = h('div', { class: 'ay-win' });
          const tag = h('div', { class: 'ay-tag', 'aria-live': 'polite' });
          const now = h('span', { class: 'ay-now' });
          const ruler = h('div', { class: 'ay-ruler', 'aria-hidden': 'true' },
            ...[[600, '600'], [840, '840'], [1200, '1200 dp']].map(([v, t]) => h('span', { style: `left:${(v / MAX) * 100}%` }, t)), now);
          const pane = (title, lines) => `<div class="ay-pane"><b>${title}</b>${lines}</div>`;
          const todayP = more => pane('Today', '<span>3 of 8 glasses</span><div class="ay-line"></div><div class="ay-line" style="width:70%"></div>' + (more ? '<span class="ui-m-btn" style="font-size:0.66rem;padding:3px 8px">History</span>' : ''));
          const histP = pane('History', '<span>Mon · 7 of 8</span><span>Tue · 8 of 8</span><span>Wed · 5 of 8</span>');
          const stage = h('div', { class: 'ui-stage ay-desk' }, tag, h('div', { class: 'ay-track' }, win, ruler));
          const cls = dp => (dp >= 840 ? 'Expanded' : dp >= 600 ? 'Medium' : 'Compact');
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'A tablet shows the app in half of a split screen, about 640 dp wide. What does <code>WaterApp</code> show?',
              options: ['Today and History side by side: it is a tablet', 'One screen at a time: the window is Medium, under 840 dp', 'Nothing: split screen isn’t allowed'],
              a: 1,
              why: 'Size classes describe the window. 640 dp is Medium, so the check for Expanded is false.',
            },
            frames: [
              { dp: 411, who: 'a phone held upright', say: 'A phone held upright: 411 dp wide, Compact. One screen at a time, with a History button.' },
              { dp: 780, who: 'a phone on its side', say: 'The same phone on its side is about twice as wide, but still under 840 dp: Medium. Still one screen.' },
              { dp: 1280, who: 'a tablet on its side', say: 'A tablet on its side: Expanded. The check for Expanded is <code>true</code>, so Today and History sit side by side, and the History button isn’t needed.' },
              { dp: 640, who: 'the tablet, half a split screen', say: 'The same tablet in split screen gives the app only 640 dp: Medium. One screen again. The device didn’t change; the window did.' },
              { dp: 400, who: 'the tablet, a narrow split', say: 'Drag the divider further and the window is Compact, like a phone. The layout follows at once.' },
              { dp: 673, who: 'an unfolded foldable', say: 'An unfolded foldable is often Medium: more room than a phone, not quite enough for two panes here.' },
            ],
            draw(f) {
              const wide = f.dp >= 840;
              win.style.width = `${Math.max(26, (f.dp / MAX) * 100)}%`;
              win.innerHTML = wide ? todayP(false) + histP : todayP(true);
              tag.innerHTML = `${f.who}: <b>${f.dp} dp, ${cls(f.dp)}</b>`;
              now.style.left = `${(f.dp / MAX) * 100}%`;
              now.textContent = `${f.dp}`;
            },
          });
        },
        code: `@Composable
fun WaterApp() {
    val sizeClass = currentWindowAdaptiveInfoV2().windowSizeClass
    if (sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)) {
        Row {                                                // 840 dp or wider: side by side
            Box(modifier = Modifier.width(360.dp)) { TodayContent() }
            Box(modifier = Modifier.fillMaxWidth()) { HistoryContent() }   // the rest of the row
        }
    } else {
        WaterNavigation()    // the NavHost from the navigation lesson: one screen at a time
    }
}
// TodayContent() and HistoryContent() hold what the two screens show (their arguments are left out here).

// app/build.gradle.kts
// dependencies {
//     implementation("androidx.compose.material3.adaptive:adaptive:1.3.0")
// }`,
        remember: 'Compact under 600 dp, Medium to 839, Expanded from 840. Size classes describe the window, not the device.',
        terms: [
          { term: 'window size class', def: 'A group of window widths (or heights) used to pick a layout: Compact, Medium, Expanded, and Large and Extra-large for very wide windows.' },
          { term: 'breakpoint', def: 'The width where one size class ends and the next begins, such as 600 dp or 840 dp.' },
          { term: 'currentWindowAdaptiveInfoV2', def: 'A Compose function from <code>material3-adaptive</code>. Its <code>windowSizeClass</code> describes the app’s window right now, and changes when the window does.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the size class and check whether the window is at least Medium. (<code>WIDTH_DP_MEDIUM_LOWER_BOUND</code> is 600.)', code: 'val sizeClass = [[currentWindowAdaptiveInfoV2]]().windowSizeClass\nval roomy = sizeClass.[[isWidthAtLeastBreakpoint]](WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND)', why: 'The function gives the live size class. The check is true from 600 dp up.' },
          { type: 'bug', prompt: 'On a 700 dp window the two panes are squeezed together. Two panes should only start at Expanded. Tap the line to change.', code: 'val sizeClass = currentWindowAdaptiveInfoV2().windowSizeClass\nif (sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND)) {\n    TwoPanes()\n} else {\n    OnePane()\n}', bug: 1, fix: 'if (sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND)) {', why: 'Medium starts at 600 dp, so a 700 dp window got two panes. The Expanded line, 840 dp, leaves room for both.' },
        ],
        quiz: [
          { q: 'A window is 700 dp wide. Which width class is it?', options: ['Medium', 'Compact', 'Expanded'], a: 0, why: 'Medium covers 600 to 839 dp.' },
          { q: 'A tablet runs the app in split screen, 400 dp wide. Which layout fits?', options: ['The Compact one, like on a phone', 'The tablet one, since it is a tablet'], a: 0, why: 'Size classes describe the window. 400 dp is Compact on any device.' },
          { q: 'What happens to <code>windowSizeClass</code> when the user resizes the window?', options: ['It changes, and the screen is drawn with the new layout', 'It keeps the value from when the app started', 'The app must be restarted'], a: 0, why: 'The value follows the window, so <code>if</code> picks the other layout on its own.' },
        ],
        docs: [['Use window size classes', 'https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes'], ['Compose Material 3 Adaptive releases', 'https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive']],
      },

      {
        id: 'foldables',
        title: 'Foldables',
        tagline: 'A screen that bends: read the posture and keep the fold out of the way.',
        goals: ['Name the postures of a foldable: flat, tabletop and book', 'Split the screen at the fold with <code>windowPosture.isTabletop</code> and <code>weight</code>', 'Keep state when the phone folds and unfolds'],
        level: 'intermediate', introduces: ['windowPosture', 'isTabletop', 'weight'],
        body: `
<p>Lin stands a foldable phone half open on the kitchen table, like a tiny laptop, to log water while cooking. The water tracker is drawn right across the fold: the counter bends over the crease, and the button sits on it.</p>
<p>A foldable has a <em>hinge</em>, and the way it is held is its <em>posture</em>. Fully open, it is <b>flat</b>: one big screen. Half open with the fold running from side to side is <b>tabletop</b>: the bottom half lies on the table, the top half stands up. Half open with the fold running from top to bottom is <b>book</b> posture. <code>currentWindowAdaptiveInfoV2().windowPosture</code> describes it, and its <code>isTabletop</code> is <code>true</code> in tabletop posture.</p>
<p>In tabletop, put what people look at in the top half and what they press in the bottom half, away from the crease. <code>Modifier.weight(1f)</code> on two children of a <code>Column</code> shares the Column’s height between them equally, so with <code>fillMaxSize()</code> each gets one half of the screen.</p>
<p>Closing and opening the phone moves the app between the small outer screen and the big inner one. That changes the window’s size, so it is a configuration change: the Activity is recreated, as after a rotation. Just half-opening it is not: <code>windowPosture</code> gets a new value, and Compose redraws. Values in <code>rememberSaveable</code> or a ViewModel come back; plain <code>remember</code> starts over. Android Studio has foldable emulators with buttons to fold and unfold them.</p>`,
        visual(el) {
          const view = h('div', { class: 'ay-fold' });
          const tag = h('div', { class: 'ay-tag', 'aria-live': 'polite' });
          const stage = h('div', { class: 'ui-stage ay-desk' }, tag, view);
          const btn = '<span class="ui-m-btn" style="font-size:0.72rem;padding:5px 10px">Add a glass</span>';
          const glass = n => `<span style="display:inline-flex;transform:scale(0.7)">${SVG.glass}</span><b>${n} of 8 glasses</b>`;
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'Lin stands the phone half open on the table, with the fold running from side to side. What is <code>windowPosture.isTabletop</code>?',
              options: ['<code>true</code>', '<code>false</code>', 'It is only true on tablets'],
              a: 0,
              why: 'Half open with a fold from side to side is tabletop posture: one half on the table, one standing up.',
            },
            frames: [
              { p: 'flat', n: 3, t: 'flat: one big screen', say: 'Fully open: flat. The fold runs across the middle (the dashed line), but the screen is one flat surface. The usual layout is fine.' },
              { p: 'table', n: 3, t: 'half open · usual layout', say: 'Half open on the table, with the usual layout. The counter sits on the crease, half of it lying flat, and the button is on the bottom half’s edge.' },
              { p: 'table', n: 3, split: true, t: 'isTabletop = true', say: 'The code checks <code>isTabletop</code>. Two Boxes with <code>weight(1f)</code> share the height: the counter in the standing half, the button on the flat half.' },
              { p: 'table', n: 4, split: true, t: 'isTabletop = true', say: 'Lin taps the button where it lies, on the table, and reads the count on the standing half.' },
              { p: 'book', n: 4, t: 'book: isTabletop = false', say: 'Half open with the fold from top to bottom is book posture. <code>isTabletop</code> is false, so the usual layout shows.' },
              { p: 'flat', n: 4, t: 'closed, then opened: Activity recreated', say: 'Lin closes the phone and opens it again. The app moved to the outer screen and back, so the Activity was recreated. The count is in <code>rememberSaveable</code>, so it is still 4.' },
            ],
            draw(f) {
              tag.innerHTML = `<b>${f.t}</b>`;
              if (f.p === 'book') {
                view.innerHTML = `<div class="ay-book"><div class="ay-half ay-l">${glass(f.n)}</div><div class="ay-half ay-r" style="align-content:center">${btn}</div></div>`;
                return;
              }
              const top = f.split ? `<div class="ay-half ay-top" style="align-content:center">${glass(f.n)}</div>` : `<div class="ay-half ay-top" style="align-content:end">${glass(f.n).replace('<b>', '<b style="margin-bottom:-12px">')}</div>`;
              const bottom = f.split ? `<div class="ay-half ay-bottom${f.p === 'table' ? ' ay-flat' : ''}" style="align-content:center">${btn}</div>` : `<div class="ay-half ay-bottom${f.p === 'table' ? ' ay-flat' : ''}" style="align-content:start;padding-top:2px">${btn}</div>`;
              view.innerHTML = top + bottom;
            },
          });
        },
        code: `@Composable
fun TodayScreen(glasses: Int, onAdd: () -> Unit) {
    val posture = currentWindowAdaptiveInfoV2().windowPosture
    if (posture.isTabletop) {
        Column(modifier = Modifier.fillMaxSize()) {
            Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Text("$glasses of 8 glasses", fontSize = 28.sp)     // top half: to look at
            }
            Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Button(onClick = onAdd) { Text("Add a glass") }     // bottom half: to press
            }
        }
    } else {
        TodayContent(glasses, onAdd)    // the usual layout
    }
}
// glasses lives in rememberSaveable (or a ViewModel), so it survives folding.`,
        remember: 'Read the posture: in tabletop, content up, controls down. Every fold recreates the Activity, so keep state saveable.',
        terms: [
          { term: 'posture', def: 'How a foldable is held: flat (fully open), tabletop (half open, fold from side to side) or book (half open, fold from top to bottom).' },
          { term: 'tabletop posture', def: 'A foldable half open with the fold running side to side: the bottom half lies flat, the top half stands up.' },
          { term: 'windowPosture', def: 'Part of <code>currentWindowAdaptiveInfoV2()</code> that describes the fold. Its <code>isTabletop</code> is <code>true</code> in tabletop posture.' },
          { term: 'weight', def: 'In a Column (or Row), <code>Modifier.weight(1f)</code> gives a child a share of the free space. Two children with <code>1f</code> each get half.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the posture and switch to the tabletop layout.', code: 'val posture = currentWindowAdaptiveInfoV2().[[windowPosture]]\nif (posture.[[isTabletop]]) {\n    TabletopToday()\n} else {\n    TodayContent(glasses, onAdd)\n}', why: '<code>windowPosture</code> describes the fold, and <code>isTabletop</code> is true when the phone is half open with the fold from side to side.' },
          { type: 'bug', prompt: 'Unfolding the phone resets the count to 0. Tap the line that loses it.', code: '@Composable\nfun TodayScreen() {\n    var glasses by remember { mutableStateOf(0) }\n    Column {\n        Text("$glasses of 8 glasses")\n        Button(onClick = { glasses++ }) { Text("Add a glass") }\n    }\n}', bug: 2, fix: '    var glasses by rememberSaveable { mutableStateOf(0) }', why: 'Unfolding is a configuration change that recreates the Activity. <code>remember</code> starts over; <code>rememberSaveable</code> brings the value back.' },
        ],
        quiz: [
          { q: 'A foldable is half open, with the fold running top to bottom like a book. Which posture is it?', options: ['Book', 'Tabletop', 'Flat'], a: 0, why: 'Tabletop has the fold from side to side. Top to bottom is book posture.' },
          { q: 'What happens to the Activity when the user unfolds the phone?', options: ['It is recreated: a configuration change', 'Nothing', 'The app closes'], a: 0, why: 'The window’s size changes, and that recreates the Activity, as rotation does.' },
          { q: 'A Column with <code>fillMaxSize()</code> has two children, each with <code>Modifier.weight(1f)</code>. How tall is each?', options: ['Half the Column', 'As tall as its content', 'The whole Column'], a: 0, why: 'Equal weights share the space equally.' },
        ],
        docs: [['Learn about foldables', 'https://developer.android.com/develop/ui/compose/layouts/adaptive/foldables/learn-about-foldables']],
      },

      {
        id: 'resizability',
        title: 'Resizable apps',
        tagline: 'On big screens, Android ignores orientation locks. Build for any window.',
        goals: ['Explain what Android 16 does with orientation and resize locks on large screens', 'Remove locks from the manifest and keep state through resizing', 'Keep content readable on wide windows with <code>widthIn</code>'],
        level: 'intermediate', introduces: ['screenOrientation', 'resizeableActivity', 'widthIn', 'TopCenter'],
        body: `
<p>On a tablet held sideways, an app that only works upright used to appear in a narrow strip, with black bars on both sides. Many apps asked for that in the manifest: <code>android:screenOrientation="portrait"</code> locks the screen upright, and <code>android:resizeableActivity="false"</code> refuses to be resized.</p>
<p>Android 16 changed this for large screens. When an app targets API 36 (<code>targetSdk = 36</code>, as in your projects), then on screens whose smallest width is at least 600 dp, such as tablets and open foldables, the system ignores those locks: the app fills its window, in any orientation, and can be resized. Games are left alone, and phones keep their locks. A temporary way to opt out exists for API 36, but it stops working once an app targets API 37.</p>
<p>So every screen has to work in any window: tall, wide, half a tablet in split screen, or a window the user drags to any size. Each resize is a configuration change, so state has to survive recreation, as in the rotation lessons. And on a very wide window, a form shouldn’t stretch from edge to edge: <code>Modifier.widthIn(max = 480.dp)</code> lets content be at most 480 dp wide, and a <code>Box</code> with <code>contentAlignment = Alignment.TopCenter</code> keeps it in the middle at the top.</p>
<p>To try it, run the app on a tablet emulator, open the Recents screen, and choose split screen from the app’s menu there. Then drag the divider.</p>`,
        visual(el) {
          const tab = h('div', { class: 'ay-tablet' });
          const tag = h('div', { class: 'ay-tag', 'aria-live': 'polite' });
          const stage = h('div', { class: 'ui-stage ay-desk' }, tag, tab);
          const form = cap => `${cap ? '<div class="ay-cap">' : ''}<b>Daily goal</b><span class="ay-field">Glasses a day: 8</span><span class="ui-m-btn" style="font-size:0.66rem;padding:4px 8px;${cap ? 'justify-self:start' : 'justify-self:stretch;text-align:center'}">Save</span>${cap ? '</div>' : ''}`;
          Lab.ui.player(el, {
            stage,
            predict: {
              q: 'The app targets API 36 and locks itself to portrait. Lin opens it on an Android 16 tablet held sideways. What does she see?',
              options: ['A narrow upright strip with black bars', 'The app fills the whole sideways screen', 'The app refuses to open'],
              a: 1,
              why: 'On screens 600 dp and wider, Android 16 ignores the lock for apps that target API 36. The app gets the whole window.',
            },
            frames: [
              { w: '34%', cap: false, t: 'Android 15 · locked to portrait', say: 'Before Android 16: the app locks itself upright, so a sideways tablet shows it in a narrow strip with bars on both sides.' },
              { w: '100%', cap: false, t: 'Android 16, targets API 36 · lock ignored', say: 'Android 16, app targeting API 36: the lock is ignored and the app fills the screen. The field and button now stretch across 1280 dp.' },
              { w: '100%', cap: true, t: 'widthIn(max = 480.dp), TopCenter', say: '<code>widthIn(max = 480.dp)</code> caps the form, and <code>Alignment.TopCenter</code> keeps it in the middle. It reads like a form again.' },
              { w: '50%', cap: true, other: true, t: 'split screen · Activity recreated', say: 'Lin opens a second app beside it. The window shrinks to half: a configuration change, so the Activity is recreated. The goal she typed is in saved state and comes back.' },
              { w: '30%', cap: true, other: true, t: 'divider dragged · Compact width', say: 'She drags the divider. The window is now as narrow as a phone. The form fits, because it never relied on a fixed size.' },
            ],
            draw(f) {
              tag.innerHTML = `<b>${f.t}</b>`;
              tab.innerHTML = `<div class="ay-app" style="width:${f.w}">${form(f.cap)}</div>${f.other ? '<div class="ay-other">other app</div>' : ''}`;
            },
          });
        },
        code: `<!-- AndroidManifest.xml -->
<!-- Ignored on large screens when the app targets API 36: -->
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:screenOrientation="portrait"
    android:resizeableActivity="false" />

<!-- Better: no locks at all -->
<activity
    android:name=".MainActivity"
    android:exported="true" />

// GoalScreen.kt: readable in a window of any width
Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.TopCenter
) {
    Column(modifier = Modifier.widthIn(max = 480.dp).padding(16.dp)) {
        TextField(state = goalState, label = { Text("Daily goal") })
        Button(onClick = onSave) { Text("Save") }
    }
}`,
        remember: 'No orientation or resize locks: on large screens Android ignores them. Layouts that fit any window, state that survives resizing.',
        terms: [
          { term: 'smallest width', def: 'The shorter side of the screen, in dp. Android counts 600 dp or more (written sw600dp) as a large screen: tablets and open foldables.' },
          { term: 'split screen', def: 'Two apps on screen at once. The user drags the divider between them, so your window can change size while the app runs.' },
          { term: 'pillarboxing', def: 'Showing a narrow app in the middle of a wide screen with empty bars on both sides. Android 16 stops doing it on large screens for apps that target API 36.' },
          { term: 'widthIn', def: '<code>Modifier.widthIn(max = 480.dp)</code> lets an element be at most 480 dp wide, and narrower when there is less room.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the form at most 480 dp wide, centered at the top of a wide window.', code: 'Box(\n    modifier = Modifier.fillMaxSize(),\n    contentAlignment = Alignment.[[TopCenter]]\n) {\n    Column(modifier = Modifier.[[widthIn]](max = 480.dp)) {\n        GoalForm()\n    }\n}', why: '<code>widthIn(max = ...)</code> caps the width. <code>TopCenter</code> puts the Column in the middle, at the top.' },
          { type: 'bug', prompt: 'On a sideways tablet, the goal field stretches across the whole screen. Tap the line to change.', code: 'Box(\n    modifier = Modifier.fillMaxSize(),\n    contentAlignment = Alignment.TopCenter\n) {\n    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {\n        TextField(state = goalState, label = { Text("Daily goal") })\n        Button(onClick = onSave) { Text("Save") }\n    }\n}', bug: 4, fix: '    Column(modifier = Modifier.widthIn(max = 480.dp).padding(16.dp)) {', why: '<code>fillMaxWidth()</code> takes all 1280 dp. A maximum width keeps the form readable and still lets it shrink in a narrow window.' },
        ],
        quiz: [
          { q: 'The app targets API 36 and sets <code>screenOrientation="portrait"</code>. What happens on an Android 16 tablet held sideways?', options: ['The lock is ignored, and the app fills the screen', 'The app shows in an upright strip with bars', 'The app crashes'], a: 0, why: 'On screens with a smallest width of 600 dp or more, Android 16 ignores orientation locks for apps that target API 36.' },
          { q: 'Which app still keeps its orientation lock on a large screen?', options: ['A game', 'An app with <code>resizeableActivity="false"</code>', 'Every app that targets API 37'], a: 0, why: 'Games are left alone. <code>resizeableActivity</code> is one of the settings that are ignored.' },
          { q: 'The user drags the split screen divider. What happens to the Activity by default?', options: ['It is recreated: a configuration change', 'Nothing at all', 'It moves to the background'], a: 0, why: 'The window changes size, which recreates the Activity. State in rememberSaveable or a ViewModel survives it.' },
        ],
        docs: [['Android 16: ignore orientation and resizability restrictions', 'https://developer.android.com/about/versions/16/behavior-changes-16']],
      },

      {
        id: 'insets',
        title: 'Edge to edge',
        tagline: 'The bars and the keyboard cover parts of your window. Keep content out from under them.',
        goals: ['Name the insets: status bar, navigation bar, cutout and keyboard', 'Keep a field above the keyboard with <code>imePadding</code>', 'Combine Scaffold’s <code>innerPadding</code> with the keyboard using <code>consumeWindowInsets</code>'],
        level: 'intermediate', introduces: ['imePadding', 'consumeWindowInsets', 'windowSoftInputMode', 'adjustResize'],
        body: `
<p>The Daily goal field now sits at the bottom of the Today screen. Lin taps it, the keyboard slides up, and covers it: Lin types a goal without seeing a single digit.</p>
<p>Since the activity lesson, your app calls <code>enableEdgeToEdge()</code>: it draws on the whole screen, behind the status bar and the navigation bar. (Apps that target Android 16 can no longer turn this off.) The parts of the window that the system covers are called <em>insets</em>: the status bar at the top, the navigation bar at the bottom, a camera cutout, and, while it is open, the keyboard. <code>safeDrawingPadding()</code> from the layouts lesson keeps content clear of all of them, keyboard included. Scaffold’s <code>innerPadding</code> covers only the bars.</p>
<p>So inside a Scaffold, the keyboard needs its own padding. <code>Modifier.imePadding()</code> adds as much space at the bottom as the keyboard covers, and follows it as it slides (IME, input method editor, is Android’s word for a keyboard). One catch: plain <code>padding(innerPadding)</code> doesn’t tell the insets modifiers what it already covered, so <code>imePadding()</code> would add the navigation bar’s height a second time. <code>Modifier.consumeWindowInsets(innerPadding)</code> tells them.</p>
<p>For the keyboard’s size to reach your app, the activity needs <code>android:windowSoftInputMode="adjustResize"</code> in the manifest.</p>`,
        visual(el) {
          const scr = ({ kbd = false, pad = 14, gap = 0, f = false } = {}) => `<div class="ay-scr"><div class="ui-m-bar">Water</div><div class="ui-m-body" style="flex:1"><div class="ay-big">3 of 8 glasses</div>` +
            '<div class="ui-m-row"><div>#1: 250 ml</div></div><div class="ui-m-row"><div>#2: 500 ml</div></div><div class="ui-m-row"><div>#3: 250 ml</div></div></div>' +
            `<div style="padding:0 10px 6px"><div class="ui-m-field fld${f ? ' on' : ''}">Daily goal${f ? ': 1|' : ''}</div></div>` +
            (gap ? `<div class="ay-gap" style="height:${gap}px;margin:0 10px"></div>` : '') +
            `<div style="height:${pad}px;flex:none"></div>` +
            (kbd ? '<div class="ay-kbd" style="height:170px">' + '<i></i>'.repeat(15) + '</div>' : '') + '</div>';
          Lab.ui.phone(el, {
            logTitle: 'What changed',
            predict: {
              q: 'The Column has only <code>.padding(innerPadding)</code>. Lin taps the goal field and the keyboard opens. Where is the field?',
              options: ['Under the keyboard', 'Above the keyboard', 'The screen scrolls it into view'],
              a: 0,
              why: 'innerPadding covers the top bar and the navigation bar, not the keyboard. Edge to edge, nothing moves for you.',
            },
            frames: [
              { screen: scr(), log: 'Column: .padding(innerPadding)', say: 'Scaffold’s <code>innerPadding</code> keeps the content below the top bar and above the navigation bar. The goal field sits at the bottom.' },
              { screen: scr({ kbd: true, f: true }), tap: '.fld', log: '// keyboard opens: the field is under it', say: 'Lin taps the field. The keyboard covers the bottom of the window, and the field with it.' },
              { screen: scr({ kbd: true, f: true, pad: 170, gap: 14 }), log: '+ .imePadding()', say: '<code>imePadding()</code> lifts the content by the keyboard’s height. But it also counts the navigation bar again: the striped gap is space added twice.' },
              { screen: scr({ kbd: true, f: true, pad: 170 }), log: '+ .consumeWindowInsets(innerPadding), before it', say: '<code>consumeWindowInsets(innerPadding)</code> tells imePadding what innerPadding already covered. The field sits right on top of the keyboard.' },
              { screen: scr(), log: '// keyboard closed', say: 'When the keyboard slides away, imePadding follows it down, and the screen is as before.' },
            ],
          });
        },
        code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WaterScreen(drinks: List<Drink>, goalState: TextFieldState) {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Water") }) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .consumeWindowInsets(innerPadding)   // the bars are covered already
                .imePadding()                        // room for the keyboard while it is open
        ) {
            LazyColumn(modifier = Modifier.weight(1f)) {   // the list takes the free height
                items(drinks, key = { drink -> drink.id }) { drink ->
                    Text("#\${drink.id}: \${drink.ml} ml", modifier = Modifier.padding(16.dp))
                }
            }
            TextField(state = goalState, label = { Text("Daily goal") })   // stays above the keyboard
        }
    }
}

<!-- AndroidManifest.xml: the keyboard's size reaches the app -->
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:windowSoftInputMode="adjustResize" />`,
        remember: 'safeDrawingPadding() covers bars and keyboard. In a Scaffold: padding(innerPadding), consumeWindowInsets(innerPadding), then imePadding().',
        mistakes: [
          {
            title: 'Bar heights written by hand',
            bad: `Column(modifier = Modifier.padding(top = 24.dp, bottom = 48.dp)) {
    TodayContent()
}`,
            good: `Column(modifier = Modifier.safeDrawingPadding()) {
    TodayContent()
}`,
            why: 'Bars have different heights on different phones, with gesture or button navigation, and on their side. The insets modifiers use the real sizes, and update when they change.',
          },
        ],
        terms: [
          { term: 'insets', def: 'The parts of the window the system covers: status bar, navigation bar, camera cutout and, while open, the keyboard.' },
          { term: 'IME', def: 'Input method editor: Android’s word for a keyboard on the screen.' },
          { term: 'imePadding', def: '<code>Modifier.imePadding()</code> adds space at the bottom as tall as the keyboard, and follows it as it opens and closes.' },
          { term: 'consumeWindowInsets', def: '<code>Modifier.consumeWindowInsets(innerPadding)</code> tells the insets modifiers inside it which space is covered already, so they don’t add it twice.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Inside a Scaffold, keep the content above the keyboard without counting the navigation bar twice.', code: 'Column(\n    modifier = Modifier\n        .padding(innerPadding)\n        .[[consumeWindowInsets]](innerPadding)\n        .[[imePadding]]()\n) {\n    GoalField()\n}', why: 'First the bars from innerPadding, then tell the insets modifiers about them, then add the keyboard.' },
          { type: 'bug', prompt: 'In this Scaffold, the keyboard covers the goal field. Tap the line to change.', code: 'Scaffold(\n    topBar = { TopAppBar(title = { Text("Water") }) },\n) { innerPadding ->\n    Column(\n        modifier = Modifier\n            .fillMaxSize()\n            .padding(innerPadding)\n    ) {\n        Box(modifier = Modifier.weight(1f)) {}\n        TextField(state = goalState, label = { Text("Daily goal") })\n    }\n}', bug: 6, fix: '            .padding(innerPadding).consumeWindowInsets(innerPadding).imePadding()', why: '<code>innerPadding</code> covers only the bars. <code>imePadding()</code> adds the keyboard, and <code>consumeWindowInsets</code> keeps the navigation bar from being counted twice.' },
        ],
        quiz: [
          { q: 'Which of these keeps content clear of the keyboard too?', options: ['<code>safeDrawingPadding()</code>', 'Scaffold’s <code>innerPadding</code>', '<code>padding(16.dp)</code>'], a: 0, why: 'The safe drawing area includes the bars, the cutout and the keyboard. innerPadding covers the bars only.' },
          { q: 'The keyboard closes. What does <code>imePadding()</code> do?', options: ['Its space goes away with the keyboard', 'It keeps the space, in case the keyboard returns', 'It crashes'], a: 0, why: 'It follows the keyboard: as tall as what the keyboard covers, which is nothing once it is closed.' },
          { q: 'Your app targets Android 16 and runs on Android 16. Can it turn edge to edge off?', options: ['No: from Android 16 the opt-out is gone', 'Yes, with a setting in the theme', 'Only on tablets'], a: 0, why: 'Android 15 made edge to edge the default; for apps that target Android 16, the way to opt out no longer works.' },
        ],
        docs: [['Set up edge-to-edge', 'https://developer.android.com/develop/ui/compose/system/setup-e2e'], ['Set up window insets', 'https://developer.android.com/develop/ui/compose/system/insets-ui']],
      },
    ],
  });
})();
