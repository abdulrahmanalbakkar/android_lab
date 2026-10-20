/* Kotlin track.
   A track is { id, title, description, lessons: [...] }.
   A lesson is { id, title, tagline, body (HTML), code (Kotlin), remember (one line),
                 quiz: [{ q, options, a (index of the right option), why }], visual(el) }.
   visual(el) receives an empty element and fills it with the interactive demo. */
(() => {
  const { h, sleep, hl, replay, swap } = Lab;
  const cmd = (src, onclick, props = {}) => h('button', { class: 'cmd', html: hl(src), onclick, ...props });
  const out = text => h('div', { class: 'out', 'aria-live': 'polite' }, text);
  const say = (el, html) => { el.innerHTML = html; replay(el, 'pop-soft'); };
  const show = v => (v == null ? 'null' : typeof v === 'string' ? `"${v}"` : String(v));

  // Demo styles for the newer lessons; every class is prefixed kt-.
  const css = `
.kt-type { justify-self: start; font: 600 0.74rem var(--mono); padding: 2px 8px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); }
.kt.kt-tpl { white-space: normal; }
.kt-tpl span { display: inline-block; white-space: pre; }
.kt-types .obj { min-width: 120px; }
.kt-tpl .kt-hole { color: var(--t-k); outline: 1.5px dashed var(--t-k); outline-offset: 1px; border-radius: 4px; transition: background 0.2s; }
.kt-tpl .kt-hole.on { background: rgba(200, 166, 255, 0.22); }
.kt-tpl .kt-filled { background: rgba(158, 223, 165, 0.14); border-radius: 4px; }
.kt-line { display: grid; grid-template-columns: repeat(11, minmax(0, 44px)); gap: 6px; justify-content: center; padding: 18px 10px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.kt-cell { aspect-ratio: 1; min-width: 0; display: grid; place-items: center; border-radius: 9px; border: 2px solid var(--line); background: var(--surface); font: 600 0.88rem var(--mono); color: var(--muted); transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.kt-cell.in { border-color: var(--accent); color: var(--ink); }
.kt-cell.skip { opacity: 0.35; }
.kt-cell.seen { background: var(--accent-soft); }
.kt-cell.at { background: var(--accent); color: var(--accent-ink); animation: pop 0.35s ease-out; }
.kt-printed { display: inline-block; white-space: pre; }
.when .branch.kt-on { background: rgba(127, 211, 255, 0.14); border-color: var(--t-t); }
.when .branch.kt-err { background: rgba(255, 138, 155, 0.16); border-color: var(--t-e); }
.when .branch.kt-off { opacity: 0.35; }
.kt-zone { flex: 1 1 200px; min-width: 0; display: grid; gap: 10px; justify-items: center; align-content: start; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); }
.kt-zone-title { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); text-align: center; }
.kt-zone .obj { min-width: 0; }
.kt-pile { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; min-height: 46px; min-width: 0; max-width: 100%; }
.kt-tree { flex-direction: column; flex-wrap: nowrap; gap: 8px; }
.kt-card { display: grid; gap: 6px; min-width: 0; max-width: 100%; }
.kt-card .kt { border: 2px solid transparent; }
.kt-card.broken .kt { border: 2px dashed var(--err); }
.kt-table { border-collapse: collapse; font-size: 0.9rem; max-width: 100%; }
.kt-table th, .kt-table td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; }
.kt-table thead th { background: var(--sunk); font-weight: 600; }
.kt-tag { justify-self: start; font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 8px; border-radius: 999px; background: var(--sunk); color: var(--muted); }
.kt-tag.final { background: var(--err-soft); color: var(--err); }
.kt-tag.open { background: var(--ok-soft); color: var(--ok); }
.kt-tag.abstract, .kt-tag.interface { background: var(--warm-soft); color: var(--warm); }
.kt-up { font: 600 0.8rem var(--mono); color: var(--muted); }
.kt-enum-wrap { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; justify-content: center; min-width: 0; }
.kt-enum-wrap .when { flex: 1 1 240px; }
.kt-light { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: var(--code-bg); }
.kt-lamp { width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); transition: background 0.25s, box-shadow 0.25s; }
.kt-lamp.on.r { background: var(--err); box-shadow: 0 0 22px var(--err); }
.kt-lamp.on.y { background: var(--warm); box-shadow: 0 0 22px var(--warm); }
.kt-lamp.on.g { background: var(--ok); box-shadow: 0 0 22px var(--ok); }
.station.kt-skip { opacity: 0.4; border-style: dashed; }
.slot.kt-slot { width: 72px; height: 56px; }
.kt-capture { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 6px 8px; border-radius: 8px; background: var(--sunk); }
.chip.kt-sm { min-width: 0; height: 34px; padding: 0 10px; font-size: 0.82rem; border-width: 1.5px; }
.stage.kt-refs { gap: 10px; }
.stage.kt-col { flex-direction: column; flex-wrap: nowrap; }
.stage.kt-twice { flex-wrap: nowrap; gap: 6px; padding: 16px 8px; }
.kt-twice .slot.kt-slot { width: 52px; height: 52px; flex: none; }
.kt-twice .machine { min-width: 0; padding: 10px; flex: none; }
.kt-twice .gear { width: 24px; height: 24px; border-width: 4px; }
.kt-twice .chip { min-width: 0; height: 38px; padding: 0 8px; font-size: 0.9rem; }
.kt-ref { display: grid; gap: 6px; justify-items: center; padding: 10px 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); font: 600 0.88rem var(--mono); min-width: 0; }
.obj .kt-pile { justify-content: flex-start; min-height: 0; }
.kt-shared { max-width: 100%; }
.stage.kt-buckets { align-items: flex-start; }
.kt-bucket { display: grid; gap: 8px; justify-items: center; padding: 10px; border: 1.5px dashed var(--line); border-radius: 12px; background: var(--surface); min-width: 0; max-width: 100%; }
.kt-bucket-key { font: 600 0.78rem var(--mono); color: var(--accent); }
.field.kt-unset { color: var(--muted); font-style: italic; }
.field.kt-stale { background: var(--err-soft); color: var(--err); font-weight: 600; }
.field.kt-ptr { color: var(--ok); font-weight: 600; }
.kt-body-prop { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed var(--line); }
.kt-card.kt-d2-on .kt { border-color: var(--t-k); }
.kt-zone.kt-d2-on { border-color: var(--accent); background: var(--accent-soft); }
.obj.kt-d2-ty-card { justify-items: start; min-width: 0; max-width: 100%; }
.kt-d2-ty-card .chip { max-width: 100%; overflow-wrap: anywhere; height: auto; min-height: 46px; }
.kt-d2-cf-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 44px)); gap: 6px; justify-content: center; padding: 14px 10px; background: var(--bg); border: 1px dashed var(--line); border-radius: 12px; min-width: 0; }
.kt-cell.kt-d2-cf-hit { background: var(--ok); color: var(--surface); border-color: var(--ok); }
.obj.kt-d2-ob-ghost { border-style: dashed; border-color: var(--muted); opacity: 0.7; }
.kt-d2-sc-pre { white-space: pre; }
.kt-type.kt-d2-sc-drop { justify-self: center; text-decoration: line-through; background: var(--sunk); color: var(--muted); }
.kt-d2-se-boxes { display: grid; gap: 2px; min-width: 0; }
.kt-d2-se-boxes .switch { font-weight: 500; overflow-wrap: anywhere; }
.kt-d2-se-leaf { font: 600 0.8rem var(--mono); padding: 4px 10px; border-radius: 999px; background: var(--sunk); color: var(--muted); transition: background 0.2s, color 0.2s; max-width: 100%; overflow-wrap: anywhere; }
.kt-d2-se-leaf.ok { background: var(--ok-soft); color: var(--ok); }
.kt-d2-se-leaf.bad { background: var(--err-soft); color: var(--err); }
.kt-d2-se-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 12px; min-width: 0; }
.kt-d2-se-col { display: grid; gap: 8px; min-width: 0; align-content: start; }
.kt-pile.kt-d2-se-head { justify-content: space-between; align-items: center; min-height: 0; }
.kt-d2-ex-tag { font: 600 0.7rem var(--mono); padding: 1px 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); color: var(--t-c); }
.kt-d2-ex-tag.ok { background: rgba(126, 226, 168, 0.18); color: var(--t-k); }
.kt-li-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 12px; min-width: 0; }
.obj.kt-li-obj { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.kt-li-count { font: 600 0.78rem var(--mono); color: var(--muted); }
.machine.kt-li-machine, .machine.kt-pr-machine { min-width: 0; max-width: 100%; padding: 10px 12px; }
.kt-li-machine .kt, .kt-pr-machine .kt { white-space: normal; overflow-wrap: anywhere; }
.kt-pr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 10px; min-width: 0; }
.kt-pr-cell { display: grid; gap: 4px; padding: 12px; border-radius: 12px; border: 2px solid var(--line); background: var(--surface); min-width: 0; transition: background 0.2s, border-color 0.2s; }
.kt-pr-cell.ok { border-color: var(--ok); background: var(--ok-soft); }
.kt-pr-cell.no { border-color: var(--err); background: var(--err-soft); }
.kt-pr-where { font: 600 0.82rem var(--mono); color: var(--ink); }
.kt-pr-mark { font-size: 0.85rem; color: var(--muted); }
.kt-pr-cell.ok .kt-pr-mark { color: var(--ok); }
.kt-pr-cell.no .kt-pr-mark { color: var(--err); }
.kt-ms-three { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 10px; min-width: 0; }
.kt-zone.kt-ms-zone { align-content: start; }
.kt-ms-map { display: grid; gap: 4px; justify-items: center; font: 500 0.85rem var(--mono); min-width: 0; }
.kt-ms-empty { font-size: 0.85rem; }
.slot.kt-ms-slot { width: auto; min-width: min(140px, 100%); max-width: 100%; padding: 0 12px; font: 600 0.95rem var(--mono); }
.kt-pile.kt-ms-res { min-height: 40px; }
`;

  Lab.addTrack({
    id: 'kotlin',
    title: 'Kotlin',
    description: 'The language Android is written in, from val to sealed classes and exceptions.',
    group: 'Foundations', requires: [],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      // + lateinit ────────────────────────────────────
      

      {
        id: 'val',
        title: 'Naming a value with val',
        tagline: 'Give a value a name, then use the name.',
        goals: ['Store a value under a name with <code>val</code>', 'Use the name to get the value back', 'Pick good names for your values'],
        level: 'beginner', introduces: ['val'],
        body: `
<p>Programs keep track of things: a user’s name, a score, a price. To keep a value and use it again, you give it a name. A named value is called a <em>variable</em>. Think of a box with a label on it.</p>
<p><code>val name = "Ada"</code> makes a box labelled <code>name</code> and puts <code>"Ada"</code> inside. From then on, writing <code>name</code> (no quotes) means “whatever is in that box”. <code>println(name)</code> prints <code>Ada</code>.</p>
<p><code>val</code> is short for <em>value</em>. A <code>val</code> is a variable whose value is set once and then stays the same. Names start with a letter and have no spaces; for several words, start each new word with a capital: <code>firstName</code>, <code>totalPrice</code>.</p>
<p>From here on, short examples sometimes leave out <code>fun main() { }</code> to save space. Imagine them inside it.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val name = "Ada"\n    val age = 36\n    println(name)\n    println("name")\n    println(age + 1)\n}',
            varsTitle: 'Boxes (variables)',
            predict: {
              q: 'What is the difference between <code>println(name)</code> and <code>println("name")</code>?',
              options: ['None, both print <code>Ada</code>', 'The first prints <code>Ada</code>, the second prints the word <code>name</code>', 'The second one is an error'],
              a: 1,
              why: 'Without quotes, <code>name</code> means the box. With quotes, it is just the text “name”.',
            },
            frames: [
              { line: 1, say: 'Watch the boxes on the right fill up.' },
              { line: 2, vars: { name: '"Ada"' }, say: 'A box labelled <code>name</code>, holding the text <code>"Ada"</code>.' },
              { line: 3, vars: { age: '36' }, say: 'Another box, <code>age</code>, holding the number 36.' },
              { line: 4, out: 'Ada', say: 'No quotes: Kotlin looks in the box called <code>name</code> and prints what is inside.' },
              { line: 5, out: 'name', say: 'With quotes it is plain text, so it prints the word <code>name</code>.' },
              { line: 6, out: '37', say: 'Variables work in maths too: the value of <code>age</code> plus 1. The box itself still holds 36.' },
            ],
          });
        },
        code: `fun main() {
    val name = "Ada"
    val age = 36
    println(name)       // Ada
    println(age + 1)    // 37
}`,
        play: `fun main() {
    val city = "Lisbon"
    val population = 545000
    println(city)
    println(population)
    // Put your own city and number in the boxes, then run.
}`,
        remember: 'val name = value makes a named box. Use the name without quotes to get the value back.',
        mistakes: [
          { title: 'Quotes around the name', bad: 'val color = "blue"\nprintln("color")   // prints: color', good: 'val color = "blue"\nprintln(color)     // prints: blue', why: 'Quotes make text. To read the box, write its name without quotes.' },
        ],
        terms: [
          { term: 'variable', def: 'A named box that holds a value.' },
          { term: 'val', def: 'Makes a variable whose value is set once and never replaced.' },
          { term: 'value', def: 'A piece of data, such as <code>"Ada"</code> or <code>36</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a box called <code>pet</code> holding <code>"cat"</code>, then print what is in it.', code: 'fun main() {\n    [[val]] pet = "cat"\n    println([[pet]])\n}', why: '<code>val</code> creates the box. Its name, without quotes, reads it back.' },
          { type: 'bug', prompt: 'This should print <code>Paris</code>. Tap the wrong line.', code: 'fun main() {\n    val capital = "Paris"\n    println("capital")\n}', bug: 2, fix: '    println(capital)', why: 'With quotes it prints the word <code>capital</code>. Without, it prints the box’s value.' },
        ],
        quiz: [
          { q: '<code>val x = 5</code>. What does <code>println(x * 2)</code> print?', options: ['<code>x * 2</code>', '<code>10</code>', '<code>5</code>'], a: 1, why: '<code>x</code> holds 5, so <code>x * 2</code> is 10.' },
          { q: 'Which is a valid variable name?', options: ['<code>first name</code>', '<code>firstName</code>', '<code>1stName</code>'], a: 1, why: 'Names can’t contain spaces or start with a digit. <code>firstName</code> is the usual Kotlin style.' },
        ],
        docs: [['Kotlin tour: Variables', 'https://kotlinlang.org/docs/kotlin-tour-hello-world.html#variables'], ['Basic syntax: Variables', 'https://kotlinlang.org/docs/basic-syntax.html#variables']],
      },

      {
        id: 'var',
        title: 'Values that change with var',
        tagline: 'Some boxes need new contents over time.',
        goals: ['Make a value that can change with <code>var</code>', 'Update a value with <code>+=</code>, <code>-=</code> and <code>++</code>', 'Choose between <code>val</code> and <code>var</code>'],
        level: 'beginner', introduces: ['var','+=','-=','++'],
        body: `
<p>Some things change while a program runs: a score goes up, a timer counts down. For those, use <code>var</code> (short for <em>variable</em>) instead of <code>val</code>.</p>
<p><code>var score = 0</code> makes the box. Later, <code>score = 10</code> puts a new value in it; the old one is gone. You can use the old value to make the new one: <code>score = score + 5</code> means “take what is in score, add 5, put the result back”.</p>
<p>That pattern is so common it has short forms: <code>score += 5</code> adds 5, <code>score -= 2</code> subtracts 2, and <code>score++</code> adds 1.</p>
<p>Try to change a <code>val</code>, though, and Kotlin stops you with an error. Use <code>val</code> by default and <code>var</code> only for things that really change: fewer moving parts, fewer surprises.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    var score = 0\n    score = score + 10\n    score += 5\n    score++\n    println(score)\n}',
            varsTitle: 'Boxes (variables)',
            predict: {
              q: 'What does this program print at the end?',
              options: ['<code>0</code>', '<code>15</code>', '<code>16</code>'],
              a: 2,
              why: '0, then +10 is 10, then +5 is 15, then ++ adds 1: 16.',
            },
            frames: [
              { line: 1, say: 'One box that changes. Watch its value.' },
              { line: 2, vars: { score: '0' }, say: '<code>var</code> makes a box that can change. It starts at 0.' },
              { line: 3, vars: { score: '10' }, say: 'Read score (0), add 10, put 10 back in the box. The old 0 is gone.' },
              { line: 4, vars: { score: '15' }, say: '<code>+=</code> is the short way to write the same thing: add 5.' },
              { line: 5, vars: { score: '16' }, say: '<code>++</code> adds exactly 1.' },
              { line: 6, out: '16', say: 'Printing reads whatever is in the box now.' },
            ],
          });
        },
        code: `fun main() {
    var lives = 3
    lives = lives - 1    // 2
    lives -= 1           // 1
    lives++              // 2
    println(lives)

    val name = "Ada"
    // name = "Grace"    // error: 'val' cannot be reassigned
}`,
        play: `fun main() {
    var steps = 0
    steps += 1200    // morning walk
    steps += 3500    // afternoon
    println(steps)
    // Add another line that adds your evening steps, then run.
    // Try changing var to val and read the error.
}`,
        remember: 'var can get a new value, val can’t. Start with val; switch to var only when the value must change.',
        mistakes: [
          { title: 'Using var for something that never changes', bad: 'var userName = "Ada"   // never changed later', good: 'val userName = "Ada"', why: 'A <code>val</code> tells readers “this stays the same”, and Kotlin enforces it.' },
        ],
        terms: [
          { term: 'var', def: 'Makes a variable that can be given a new value later.' },
          { term: 'reassign', def: 'Put a new value in an existing <code>var</code>: <code>score = 10</code>.' },
          { term: '+= and -=', def: 'Short for adding to or subtracting from a variable: <code>x += 2</code> means <code>x = x + 2</code>.' },
          { term: '++', def: 'Adds 1 to a variable: <code>count++</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The count starts at 0 and must go up.', code: 'fun main() {\n    [[var]] count = 0\n    count [[+=]] 1\n    println(count)\n}', why: 'It changes, so it needs <code>var</code>. <code>+=</code> adds to it.' },
          { type: 'bug', prompt: '<code>total</code> has to change on the last line, so the program won’t compile. Tap the line to fix.', code: 'fun main() {\n    val total = 10\n    var bonus = 5\n    bonus = 6\n    total = 12\n}', bug: 1, fix: '    var total = 10', why: 'A value that changes must be created with <code>var</code>.' },
        ],
        quiz: [
          { q: '<code>var x = 4</code>, then <code>x += 3</code>, then <code>x++</code>. What is <code>x</code>?', options: ['<code>7</code>', '<code>8</code>', '<code>5</code>'], a: 1, why: '4 + 3 is 7, and ++ adds 1: 8.' },
          { q: 'A person’s birth year in your program. val or var?', options: ['<code>val</code>, it never changes', '<code>var</code>, just in case'], a: 0, why: 'It doesn’t change, so <code>val</code>. Use <code>var</code> only when the program changes it.' },
        ],
        docs: [['Basic syntax: Variables', 'https://kotlinlang.org/docs/basic-syntax.html#variables']],
      },

      {
        id: 'types',
        title: 'Types',
        tagline: 'Every value is a kind of thing: text, whole number, decimal, yes/no.',
        goals: ['Name the four basic types, including <code>Boolean</code>', 'Write a type yourself after a colon', 'See how types catch mistakes before running'],
        level: 'beginner', introduces: ['Boolean','true','false'],
        body: `
<p>You have met three kinds of value: text, whole numbers and decimals. Kotlin calls these kinds <em>types</em>: <code>String</code>, <code>Int</code> and <code>Double</code>. Here is a fourth: <code>Boolean</code>, a value that is either <code>true</code> or <code>false</code>, like a yes/no answer.</p>
<p>Every box has a type, and it can only ever hold that type. Usually Kotlin works the type out from the first value: <code>val age = 30</code> is an <code>Int</code>. You can also write it yourself after a colon: <code>val age: Int = 30</code>.</p>
<p>Types catch mistakes early. Put text in an <code>Int</code> box and Kotlin refuses before the program runs, instead of crashing later.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val title = "Kotlin"\n    var age = 30\n    val price = 4.5\n    val isOpen = true\n    age = 31\n    age = "thirty"\n}',
            varsTitle: 'Boxes and their types',
            predict: {
              q: '<code>age</code> holds 30. What happens on <code>age = "thirty"</code>?',
              options: ['age now holds the text "thirty"', 'A compile error: age can only hold an Int', 'Kotlin turns "thirty" into 30'],
              a: 1,
              why: 'A box keeps its type for ever. Text doesn’t fit in an <code>Int</code> box.',
            },
            frames: [
              { line: 1, say: 'Four boxes, four types. Watch the type next to each name.' },
              { line: 2, vars: { 'title: String': '"Kotlin"' }, say: 'Quotes, so it is text: a <code>String</code>.' },
              { line: 3, vars: { 'age: Int': '30' }, say: 'A whole number: an <code>Int</code>.' },
              { line: 4, vars: { 'price: Double': '4.5' }, say: 'A decimal point: a <code>Double</code>.' },
              { line: 5, vars: { 'isOpen: Boolean': 'true' }, say: '<code>true</code> (no quotes) is a <code>Boolean</code>: yes or no, on or off.' },
              { line: 6, vars: { 'age: Int': '31' }, say: 'A new <code>Int</code> in an <code>Int</code> box: fine.' },
              { line: 7, out: 'error: Assignment type mismatch: actual type is \'String\', but \'Int\' was expected.', say: 'Text in an <code>Int</code> box: Kotlin refuses before the program even runs.' },
            ],
          });
        },
        code: `fun main() {
    val title: String = "Kotlin"
    val age: Int = 30
    val price: Double = 4.5
    val isOpen: Boolean = true

    val count = 3      // Kotlin works out: Int
}`,
        play: `fun main() {
    val item: String = "Coffee"
    val price: Double = 2.5
    val cups: Int = 3
    val paid: Boolean = false
    println(price * cups)
    // Try: change cups to 3.5 and run. An Int box can't hold a decimal.
}`,
        remember: 'Every value has a type: String, Int, Double, Boolean. A box keeps its type, so mistakes show up before running.',
        terms: [
          { term: 'type', def: 'The kind of a value: text, whole number, decimal, true/false.' },
          { term: 'Boolean', def: 'A type with two values: <code>true</code> and <code>false</code>.' },
          { term: 'type inference', def: 'Kotlin working out a variable’s type from its first value.' },
          { term: 'type mismatch', def: 'The error you get when a value doesn’t fit a variable’s type.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the types.', code: 'val city: [[String]] = "Oslo"\nval guests: [[Int]] = 12\nval rating: [[Double]] = 4.7\nval sold: [[Boolean]] = true', why: 'Text, whole number, decimal, true/false.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'fun main() {\n    var count = 10\n    count = 20\n    count = 2.5\n}', bug: 3, fix: '    count = 3', why: '<code>count</code> is an <code>Int</code>. A decimal doesn’t fit.' },
        ],
        quiz: [
          { q: 'What type is <code>val ready = false</code>?', options: ['<code>String</code>', '<code>Boolean</code>', '<code>Int</code>'], a: 1, why: '<code>true</code> and <code>false</code> are the two <code>Boolean</code> values.' },
          { q: 'What type is <code>val code = "42"</code>?', options: ['<code>Int</code>', '<code>String</code>'], a: 1, why: 'The quotes make it text, even though it looks like a number.' },
          { q: 'When does Kotlin report a type mismatch?', options: ['Before the program runs', 'Only when that line runs'], a: 0, why: 'It is a compile error, so you find it straight away.' },
        ],
        docs: [['Kotlin tour: Basic types', 'https://kotlinlang.org/docs/kotlin-tour-basic-types.html'], ['Basic types', 'https://kotlinlang.org/docs/basic-types.html']],
      },

      {
        id: 'templates',
        title: 'Putting values into text',
        tagline: 'Build sentences from variables with $.',
        goals: ['Put a variable into text with <code>$name</code>', 'Put a calculation into text with <code>${ }</code>', 'Join pieces of text with <code>+</code>'],
        level: 'beginner', introduces: ['$'],
        body: `
<p>Often you want a sentence with a value in the middle: “Ada has 16 points.” Kotlin makes that easy with <em>string templates</em>: inside a String, <code>$name</code> is replaced with the value of <code>name</code>.</p>
<p>For anything more than a single name, like a calculation, use curly brackets: <code>"\${score + 1}"</code>. Kotlin works out what is inside <code>\${ }</code> and puts the result into the text.</p>
<p>You can also join pieces of text with <code>+</code>: <code>"Hello, " + name</code>. Templates are usually easier to read.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val name = "Ada"\n    val score = 16\n    println("name has score points")\n    println("$name has $score points")\n    println("Next level at ${score + 4}")\n    println("Hello, " + name)\n}',
            predict: {
              q: 'What does <code>println("$name has $score points")</code> print?',
              options: ['<code>$name has $score points</code>', '<code>Ada has 16 points</code>', 'An error'],
              a: 1,
              why: 'In a String, <code>$</code> followed by a name is swapped for that variable’s value.',
            },
            frames: [
              { line: 1, say: 'Same sentence, built three ways.' },
              { line: 2, vars: { name: '"Ada"' }, say: 'A box with a name in it…' },
              { line: 3, vars: { score: '16' }, say: '…and one with a number. Both will go into text.' },
              { line: 4, out: 'name has score points', say: 'Plain text: the words <code>name</code> and <code>score</code> are just letters here.' },
              { line: 5, out: 'Ada has 16 points', say: '<code>$name</code> and <code>$score</code> are swapped for the values in the boxes.' },
              { line: 6, out: 'Next level at 20', say: '<code>${ }</code> works out a calculation first: 16 + 4.' },
              { line: 7, out: 'Hello, Ada', say: '<code>+</code> joins two pieces of text into one.' },
            ],
          });
        },
        code: `fun main() {
    val name = "Ada"
    val score = 16
    println("$name has $score points")      // Ada has 16 points
    println("Twice the score: \${score * 2}")  // Twice the score: 32
    println("Hello, " + name)               // Hello, Ada
}`,
        play: `fun main() {
    val item = "tickets"
    val count = 3
    val price = 12
    println("You bought $count $item.")
    println("Total: \${count * price} euros")
    // Change count and run again: the sentence updates itself.
}`,
        remember: '"$name" puts a variable into text; "${a + b}" puts a calculation in. + joins texts.',
        terms: [
          { term: 'string template', def: 'Text with <code>$name</code> or <code>${...}</code> inside, replaced by values when the program runs.' },
          { term: 'concatenation', def: 'Joining texts together with <code>+</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print <code>Sam is 9</code> using the two variables.', code: 'val name = "Sam"\nval age = 9\nprintln("[[$name]] is [[$age]]")', why: '<code>$</code> plus the variable name puts its value into the text.' },
          { type: 'bug', prompt: 'This should print <code>Total: 15</code>, but prints something else. Tap the line.', code: 'val a = 10\nval b = 5\nprintln("Total: $a + b")', bug: 2, fix: 'println("Total: ${a + b}")', why: 'For a calculation, wrap it in <code>${ }</code>. Otherwise only <code>$a</code> is replaced.' },
        ],
        quiz: [
          { q: '<code>val n = 3</code>. What does <code>println("Items: $n")</code> print?', options: ['<code>Items: $n</code>', '<code>Items: 3</code>', '<code>Items: n</code>'], a: 1, why: '<code>$n</code> is replaced with the value 3.' },
          { q: '<code>val n = 3</code>. What does <code>println("Next: ${n + 1}")</code> print?', options: ['<code>Next: 4</code>', '<code>Next: 3 + 1</code>', '<code>Next: 31</code>'], a: 0, why: 'The expression inside <code>${ }</code> is calculated first.' },
        ],
        docs: [['String templates', 'https://kotlinlang.org/docs/strings.html#string-templates']],
      },

      {
        id: 'conversion',
        title: 'Converting between types',
        tagline: '"5" is text. Turn it into a number before doing maths.',
        goals: ['Turn text into a number with <code>toInt()</code>', 'Turn numbers into text with <code>toString()</code>', 'Know when a conversion crashes'],
        level: 'beginner', introduces: ['toInt','toDouble','toString'],
        body: `
<p>Things people type, like an age in a form, usually reach your program as text. <code>"5"</code> looks like a number, but it is a <code>String</code>, and <code>"5" + 1</code> joins texts: you get <code>"51"</code>, not 6.</p>
<p>To do maths, convert first. Write a dot after the value, then the conversion and <code>()</code>: <code>"5".toInt()</code> gives the number 5. Similarly <code>toDouble()</code> makes a decimal, and <code>toString()</code> turns a number into text. A decimal converted with <code>toInt()</code> loses everything after the point: <code>3.9.toInt()</code> is 3. (In <code>3.9.toInt()</code> the first dot is the decimal point, the second one starts the conversion.)</p>
<p>Not all text can become a number. <code>"hello".toInt()</code> crashes the program, because there is no number in it.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val typed = "5"\n    println(typed + 1)\n    val number = typed.toInt()\n    println(number + 1)\n    println(3.9.toInt())\n    println("hello".toInt())\n}',
            predict: {
              q: '<code>typed</code> holds the text <code>"5"</code>. What does <code>println(typed + 1)</code> print?',
              options: ['<code>6</code>', '<code>51</code>', 'An error'],
              a: 1,
              why: 'With text on the left, <code>+</code> joins: the text "5" followed by 1.',
            },
            frames: [
              { line: 1, say: 'A value that looks like a number but is text.' },
              { line: 2, vars: { 'typed: String': '"5"' }, say: 'Quotes: this is a <code>String</code>.' },
              { line: 3, out: '51', say: 'Text plus something joins them. Not maths.' },
              { line: 4, vars: { 'number: Int': '5' }, say: '<code>toInt()</code> reads the text and makes a real number.' },
              { line: 5, out: '6', say: 'Now <code>+</code> is maths.' },
              { line: 6, out: '3', say: '<code>toInt()</code> on a decimal drops the decimals. It doesn’t round.' },
              { line: 7, out: 'Exception in thread "main" java.lang.NumberFormatException: For input string: "hello"', say: 'There is no number in <code>"hello"</code>, so the program crashes here.' },
            ],
          });
        },
        code: `fun main() {
    val typed = "5"
    println(typed + 1)           // 51 (text joined)
    println(typed.toInt() + 1)   // 6
    println("2.5".toDouble())    // 2.5
    println(42.toString() + "!") // 42!
    println(3.9.toInt())         // 3
}`,
        play: `fun main() {
    val first = "20"
    val second = "22"
    println(first + second)
    println(first.toInt() + second.toInt())
    // Change "22" to "twenty" and run. What kind of error is it?
}`,
        remember: 'Text that looks like a number is still text. Convert with toInt() / toDouble() before maths; toString() goes the other way.',
        terms: [
          { term: 'toInt()', def: 'Turns text like <code>"5"</code> (or a decimal) into an <code>Int</code>.' },
          { term: 'toDouble()', def: 'Turns text or a whole number into a <code>Double</code>.' },
          { term: 'toString()', def: 'Turns a value into text.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add the two typed numbers so it prints <code>7</code>.', code: 'val a = "3"\nval b = "4"\nprintln(a.[[toInt()]] + b.[[toInt()]])', why: 'Both are text. Convert both before adding.' },
          { type: 'bug', prompt: 'This should print <code>11</code> but prints <code>101</code>. Tap the line.', code: 'val age = "10"\nval nextYear = age + 1\nprintln(nextYear)', bug: 1, fix: 'val nextYear = age.toInt() + 1', why: '<code>age</code> is text, so <code>+ 1</code> joins. Convert it first.' },
        ],
        quiz: [
          { q: 'What does <code>println("2" + 2)</code> print?', options: ['<code>4</code>', '<code>22</code>', 'An error'], a: 1, why: 'Text on the left, so <code>+</code> joins: "2" then 2.' },
          { q: 'What is <code>7.8.toInt()</code>?', options: ['<code>8</code>', '<code>7</code>'], a: 1, why: 'Converting to <code>Int</code> drops the decimals; it doesn’t round.' },
          { q: 'What happens with <code>"ten".toInt()</code>?', options: ['It gives 10', 'The program crashes', 'It gives 0'], a: 1, why: 'There is no number in the text, so conversion fails while running.' },
        ],
        docs: [['Numbers: explicit conversions', 'https://kotlinlang.org/docs/numbers.html#explicit-number-conversions'], ['Strings', 'https://kotlinlang.org/docs/strings.html']],
      },

      {
        id: 'booleans',
        title: 'True or false',
        tagline: 'Comparisons answer yes-or-no questions.',
        goals: ['Compare values with <code>==</code>, <code>&lt;</code>, <code>&gt;</code> and friends', 'Get a <code>true</code> or <code>false</code> answer', 'Tell <code>=</code> and <code>==</code> apart'],
        level: 'beginner', introduces: ['==','!='],
        body: `
<p>Programs keep asking yes-or-no questions. Is the player out of lives? Is the password long enough? A <em>comparison</em> asks one, and the answer is a <code>Boolean</code>: <code>true</code> or <code>false</code>.</p>
<p>The comparisons are <code>==</code> equal, <code>!=</code> not equal, <code>&lt;</code> less than, <code>&gt;</code> greater than, <code>&lt;=</code> less or equal, and <code>&gt;=</code> greater or equal. They work on numbers, and <code>==</code> and <code>!=</code> work on text too.</p>
<p>Careful with <code>=</code> and <code>==</code>. One <code>=</code> puts a value in a box. Two <code>==</code> asks “are these equal?”.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val lives = 0\n    val name = "Ada"\n    println(lives == 0)\n    println(lives > 0)\n    println(name == "ada")\n    val canPlay = lives > 0\n    println(canPlay)\n}',
            predict: {
              q: 'What does <code>println(name == "ada")</code> print when <code>name</code> is <code>"Ada"</code>?',
              options: ['<code>true</code>', '<code>false</code>'],
              a: 1,
              why: 'Text must match exactly, including capital letters. "Ada" and "ada" are different.',
            },
            frames: [
              { line: 1, say: 'Questions about two boxes.' },
              { line: 2, vars: { lives: '0' }, say: 'No lives left.' },
              { line: 3, vars: { name: '"Ada"' }, say: 'And a name to compare.' },
              { line: 4, out: 'true', say: '“Is lives equal to 0?” Yes: <code>true</code>.' },
              { line: 5, out: 'false', say: '“Is lives greater than 0?” No: <code>false</code>.' },
              { line: 6, out: 'false', say: 'Capital A versus small a: not equal. Text comparison is exact.' },
              { line: 7, vars: { 'canPlay: Boolean': 'false' }, say: 'The answer is a value like any other, so you can keep it in a box.' },
              { line: 8, out: 'false', say: 'Printing the box shows its value: false.' },
            ],
          });
        },
        code: `fun main() {
    val age = 17
    println(age >= 18)        // false
    println(age != 18)        // true
    println("cat" == "cat")   // true
    val isAdult = age >= 18   // a Boolean in a box
}`,
        play: `fun main() {
    val passwordLength = 9
    println(passwordLength >= 8)   // long enough?
    val pin = 1234
    println(pin == 1234)           // correct PIN?
    // Change the numbers and run again.
}`,
        remember: 'Comparisons (== != < > <= >=) give true or false. = stores a value, == compares.',
        terms: [
          { term: 'comparison', def: 'A question like <code>a &gt; b</code> whose answer is <code>true</code> or <code>false</code>.' },
          { term: '==', def: 'Asks whether two values are equal. Not the same as <code>=</code>, which stores a value.' },
          { term: '!=', def: 'Asks whether two values are different.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print whether <code>score</code> is at least 100.', code: 'val score = 120\nprintln(score [[>=]] 100)', why: '<code>&gt;=</code> means “greater than or equal to”.' },
          { type: 'bug', prompt: 'This should print <code>true</code> or <code>false</code>, but it doesn’t compile. Tap the line.', code: 'val code = 42\nprintln(code = 42)', bug: 1, fix: 'println(code == 42)', why: 'To compare, use <code>==</code>. A single <code>=</code> stores a value.' },
        ],
        quiz: [
          { q: 'What is <code>5 != 5</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 1, why: '<code>!=</code> asks “are they different?”. They are not.' },
          { q: 'Which one compares two values?', options: ['<code>a = b</code>', '<code>a == b</code>'], a: 1, why: '<code>==</code> compares; <code>=</code> stores.' },
          { q: 'What is <code>10 &lt;= 10</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 0, why: '“Less than or equal”: they are equal, so yes.' },
        ],
        docs: [['Booleans', 'https://kotlinlang.org/docs/booleans.html'], ['Kotlin tour: Basic types', 'https://kotlinlang.org/docs/kotlin-tour-basic-types.html']],
      },

      {
        id: 'logic',
        title: 'Combining conditions',
        tagline: 'and, or, not.',
        goals: ['Combine conditions with <code>&amp;&amp;</code> and <code>||</code>', 'Flip a condition with <code>!</code>', 'Read combined conditions like a sentence'],
        level: 'beginner', introduces: ['&&','||'],
        body: `
<p>Real questions often have more than one part. “Is it the weekend <em>and</em> sunny?” “Is the user an admin <em>or</em> the owner?” Kotlin has three tools for combining <code>Boolean</code> values.</p>
<p><code>&amp;&amp;</code> means <b>and</b>: true only if both sides are true. <code>||</code> means <b>or</b>: true if at least one side is true. <code>!</code> means <b>not</b>: it flips true to false and false to true.</p>
<p>Comparisons like <code>&gt;=</code> are worked out before <code>&amp;&amp;</code> and <code>||</code>, so <code>age &gt;= 18 || withParent</code> means “(age is at least 18) or (with a parent)”. Add brackets whenever it helps you read it.</p>
<p>Read them out loud as words and the code reads like a sentence: <code>isWeekend &amp;&amp; isSunny</code> is “is weekend and is sunny”.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val isWeekend = true\n    val isSunny = false\n    println(isWeekend && isSunny)\n    println(isWeekend || isSunny)\n    println(!isSunny)\n    val stayIn = isWeekend && !isSunny\n}',
            predict: {
              q: 'It is the weekend but not sunny. What is <code>isWeekend && isSunny</code>?',
              options: ['<code>true</code>', '<code>false</code>'],
              a: 1,
              why: '<code>&amp;&amp;</code> needs both sides to be true. Not sunny, so false.',
            },
            frames: [
              { line: 1, say: 'Two yes/no facts to combine.' },
              { line: 2, vars: { isWeekend: 'true' } },
              { line: 3, vars: { isSunny: 'false' }, say: 'Weekend, but not sunny.' },
              { line: 4, out: 'false', say: '<b>and</b>: both must be true. One is false, so the answer is false.' },
              { line: 5, out: 'true', say: '<b>or</b>: one true side is enough.' },
              { line: 6, out: 'true', say: '<b>not</b> flips it: not sunny is true.' },
              { line: 7, vars: { stayIn: 'true' }, say: 'Mix them freely: weekend <b>and not</b> sunny. Both parts are true, so <code>stayIn</code> is true.' },
            ],
          });
        },
        code: `fun main() {
    val hasTicket = true
    val isLate = false
    println(hasTicket && !isLate)   // true: ticket and not late
    println(!hasTicket || isLate)   // false
}`,
        play: `fun main() {
    val age = 16
    val withParent = true
    val canEnter = age >= 18 || withParent
    println(canEnter)
    // Change withParent to false. Then change age to 20.
}`,
        remember: '&& is and (both true), || is or (at least one), ! is not (flips it).',
        terms: [
          { term: '&&', def: '“and”: true only if both sides are true.' },
          { term: '||', def: '“or”: true if at least one side is true.' },
          { term: '!', def: '“not”: turns true into false and false into true.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'You can drive if you have a licence <b>and</b> are 18 or older.', code: 'val hasLicence = true\nval age = 20\nval canDrive = hasLicence [[&&]] age >= 18', why: 'Both conditions must hold, so <code>&amp;&amp;</code>.' },
          { type: 'bug', prompt: 'The shop is open on weekdays <b>or</b> Saturday, but this says closed on Saturday. Tap the line.', code: 'val isWeekday = false\nval isSaturday = true\nval isOpen = isWeekday && isSaturday', bug: 2, fix: 'val isOpen = isWeekday || isSaturday', why: 'Either one is enough, so it needs <code>||</code>.' },
        ],
        quiz: [
          { q: 'What is <code>true || false</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 0, why: 'For <b>or</b>, one true side is enough.' },
          { q: 'What is <code>!(5 &gt; 3)</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 1, why: '5 &gt; 3 is true, and <code>!</code> flips it to false.' },
        ],
        docs: [['Booleans', 'https://kotlinlang.org/docs/booleans.html']],
      },

      {
        id: 'if',
        title: 'Making decisions with if',
        tagline: 'Run some steps only when a condition is true.',
        goals: ['Run steps only when a condition is true', 'Handle the other case with <code>else</code>', 'Check several cases with <code>else if</code>'],
        level: 'beginner', introduces: ['if','else'],
        body: `
<p>So far every line ran, top to bottom. Real programs choose: show “Game over” only when lives reach 0. That is what <code>if</code> does.</p>
<p><code>if (condition) { ... }</code> runs the steps in the curly brackets only when the condition is <code>true</code>. Add <code>else { ... }</code> for what to do otherwise. Chain more checks with <code>else if</code>; Kotlin tries them from the top and runs only the first one that is true.</p>
<p>(In these explanations, <code>...</code> stands for “some steps here”; you don’t type it.) The steps between <code>{</code> and <code>}</code> are called a <em>block</em>. Indent them, with four spaces, so you can see at a glance what belongs to which decision.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val temperature = 12\n    if (temperature > 25) {\n        println("Shorts")\n    } else if (temperature > 10) {\n        println("Light jacket")\n    } else {\n        println("Warm coat")\n    }\n    println("Have a nice day")\n}',
            predict: {
              q: 'The temperature is 12. Which line prints first?',
              options: ['<code>Shorts</code>', '<code>Light jacket</code>', '<code>Warm coat</code>'],
              a: 1,
              why: '12 is not above 25, but it is above 10, so the second branch runs. The rest is skipped.',
            },
            frames: [
              { line: 1, say: 'Three possible outfits; only one is chosen.' },
              { line: 2, vars: { temperature: '12' } },
              { line: 3, say: 'Is 12 greater than 25? No, so skip this block.' },
              { line: 5, say: 'Next check: is 12 greater than 10? Yes.' },
              { line: 6, out: 'Light jacket', say: 'Run this block…' },
              { line: 9, say: '…and skip every remaining branch. Only one branch of an if chain ever runs.' },
              { line: 10, out: 'Have a nice day', say: 'After the if, the program carries on as normal.' },
            ],
          });
        },
        code: `fun main() {
    val lives = 0
    if (lives == 0) {
        println("Game over")
    } else {
        println("Keep going")
    }
}`,
        play: `fun main() {
    val hour = 14
    if (hour < 12) {
        println("Good morning")
    } else if (hour < 18) {
        println("Good afternoon")
    } else {
        println("Good evening")
    }
    // Try hour = 9 and hour = 21.
}`,
        remember: 'if (condition) { ... } runs only when the condition is true. else covers the rest. Only one branch runs.',
        mistakes: [
          { title: 'Checks in the wrong order', bad: 'if (score > 50) {\n    println("Pass")\n} else if (score > 90) {\n    println("Excellent")   // never reached\n}', good: 'if (score > 90) {\n    println("Excellent")\n} else if (score > 50) {\n    println("Pass")\n}', why: 'Kotlin runs the first true branch. Put the most specific check first.' },
        ],
        terms: [
          { term: 'if', def: 'Runs a block only when its condition is true.' },
          { term: 'else', def: 'The block that runs when the <code>if</code> condition is false.' },
          { term: 'block', def: 'Steps grouped between <code>{</code> and <code>}</code>.' },
          { term: 'condition', def: 'A true/false question, like <code>age &lt; 6</code>, that decides which way to go.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print <code>Free</code> when age is under 6, otherwise <code>Paid</code>.', code: 'val age = 4\n[[if]] (age < 6) {\n    println("Free")\n} [[else]] {\n    println("Paid")\n}', why: '<code>if</code> checks the condition; <code>else</code> handles everything else.' },
          { type: 'bug', prompt: 'Someone who is exactly 18 is an adult, but this prints “Child”. Tap the line.', code: 'val age = 18\nif (age > 18) {\n    println("Adult")\n} else {\n    println("Child")\n}', bug: 1, fix: 'if (age >= 18) {', why: '18 is not greater than 18. “At least 18” is <code>&gt;=</code>.' },
        ],
        quiz: [
          { q: '<code>val x = 5</code>. What prints?<pre class="code"><code>if (x &gt; 10) {\n    println("big")\n} else {\n    println("small")\n}</code></pre>', options: ['<code>big</code>', '<code>small</code>', 'Both'], a: 1, why: '5 is not greater than 10, so the else block runs.' },
          { q: 'In an <code>if / else if / else</code> chain, how many blocks run?', options: ['Exactly one', 'Every block whose condition is true', 'None or all'], a: 0, why: 'Kotlin runs the first true branch, or <code>else</code>, and skips the rest.' },
        ],
        docs: [['Conditions and loops: if', 'https://kotlinlang.org/docs/control-flow.html#if-expression'], ['Kotlin tour: Control flow', 'https://kotlinlang.org/docs/kotlin-tour-control-flow.html']],
      },

      {
        id: 'if-expression',
        title: 'if gives back a value',
        tagline: 'Choose a value, not just an action.',
        goals: ['Pick one of two values with <code>if</code>', 'Know why this <code>if</code> needs an <code>else</code>', 'Explain what an expression is'],
        level: 'beginner', introduces: [],
        body: `
<p>Often an <code>if</code> exists only to pick a value: the label is “Free” or “Paid”. You could create a <code>var</code> and set it in each branch, but Kotlin has a neater way: an <code>if</code> can <em>give back</em> a value.</p>
<p><code>val label = if (age &lt; 6) "Free" else "Paid"</code>. Kotlin checks the condition and the whole <code>if</code> becomes one of the two values. With this form you always need the <code>else</code>, because the box must get a value either way.</p>
<p>Something that produces a value is called an <em>expression</em>. <code>2 + 3</code> is an expression, and so is this kind of <code>if</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val age = 30\n    val price = if (age < 12) 5 else 10\n    val label = if (price == 5) "Child" else "Adult"\n    println("$label ticket: $price euros")\n}',
            predict: {
              q: 'With <code>age = 30</code>, what goes into <code>price</code>?',
              options: ['<code>5</code>', '<code>10</code>', 'Nothing, if doesn’t give values'],
              a: 1,
              why: '30 is not under 12, so the <code>if</code> gives back the value after <code>else</code>: 10.',
            },
            frames: [
              { line: 1, say: 'Two decisions that each pick a value.' },
              { line: 2, vars: { age: '30' } },
              { line: 3, vars: { price: '10' }, say: 'Is 30 under 12? No, so the whole <code>if</code> becomes 10, and 10 goes in the box.' },
              { line: 4, vars: { label: '"Adult"' }, say: 'Same idea with text: <code>price</code> is not 5, so “Adult”.' },
              { line: 5, out: 'Adult ticket: 10 euros', say: 'Both boxes were filled with a <code>val</code>, no <code>var</code> needed.' },
            ],
          });
        },
        code: `fun main() {
    val temperature = 8
    val advice = if (temperature < 10) "Take a coat" else "No coat needed"
    println(advice)
}`,
        play: `fun main() {
    val number = 7
    val kind = if (number % 2 == 0) "even" else "odd"
    println("$number is $kind")
    // Try other numbers. (% gives the remainder: even numbers leave 0.)
}`,
        remember: 'val x = if (condition) a else b picks one of two values. The else is required.',
        mistakes: [
          { title: 'A var just to fill it from branches', bad: 'var label = ""\nif (count == 0) {\n    label = "Empty"\n} else {\n    label = "Not empty"\n}', good: 'val label = if (count == 0) "Empty" else "Not empty"', why: 'One line, and <code>label</code> can be a <code>val</code>.' },
        ],
        terms: [
          { term: 'expression', def: 'Code that produces a value, like <code>2 + 3</code> or <code>if (a) x else y</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pick <code>"Pass"</code> or <code>"Fail"</code>.', code: 'val score = 72\nval result = [[if]] (score >= 50) "Pass" [[else]] "Fail"', why: 'The <code>if</code> gives back one of the two texts.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'val hour = 20\nval greeting = if (hour < 12) "Morning"\nprintln(greeting)', bug: 1, fix: 'val greeting = if (hour < 12) "Morning" else "Evening"', why: 'When <code>if</code> gives a value, it needs an <code>else</code>, so there is always a value.' },
        ],
        quiz: [
          { q: '<code>val n = 4</code>. What is <code>if (n &gt; 3) "high" else "low"</code>?', options: ['<code>"high"</code>', '<code>"low"</code>'], a: 0, why: '4 is greater than 3, so the first value is chosen.' },
          { q: 'Why does <code>val x = if (c) 1</code> fail?', options: ['Missing else: x needs a value either way', 'if can’t give back numbers'], a: 0, why: 'Without <code>else</code>, there is no value when the condition is false.' },
        ],
        docs: [['if expression', 'https://kotlinlang.org/docs/control-flow.html#if-expression']],
      },

      {
        id: 'when',
        title: 'Choosing among many cases',
        tagline: 'when: a tidy way to write a long if chain.',
        goals: ['Replace a long <code>if</code> chain with <code>when</code>', 'Match several values or a range in one case', 'Get a value back from <code>when</code>'],
        level: 'beginner', introduces: ['when','in','..','->'],
        body: `
<p>A long chain of <code>else if</code> checks on the same value gets hard to read. <code>when</code> lists the cases instead: one per line, the value on the left, what to do after <code>-&gt;</code>.</p>
<p>Kotlin checks the cases from the top and uses the first that matches. <code>else</code> catches everything else. A case can list several values separated by commas: <code>2, 3, 4 -&gt; "Midweek"</code>.</p>
<p>A case can also be a <em>range</em>. <code>1..5</code> means “every number from 1 to 5, both included”, and <code>in 1..5 -&gt; ...</code> matches any of them.</p>
<p>Like <code>if</code>, a <code>when</code> can give back a value: <code>val name = when (day) { ... }</code>. Then, as with <code>if</code>, it needs an <code>else</code>, so there is a value in every case.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val day = 6\n    val name = when (day) {\n        1 -> "Monday"\n        2, 3, 4 -> "Midweek"\n        5 -> "Friday"\n        in 6..7 -> "Weekend"\n        else -> "Not a day"\n    }\n    println(name)\n}',
            predict: {
              q: '<code>day</code> is 6. Which case matches?',
              options: ['<code>5 -> "Friday"</code>', '<code>in 6..7 -> "Weekend"</code>', '<code>else</code>'],
              a: 1,
              why: '<code>6..7</code> is the range from 6 to 7, and 6 is in it.',
            },
            frames: [
              { line: 1, say: 'One value, many possible cases.' },
              { line: 2, vars: { day: '6' } },
              { line: 3, say: '<code>when (day)</code>: compare <code>day</code> with each case, from the top.' },
              { line: 4, say: 'Is it 1? No.' },
              { line: 5, say: 'Is it 2, 3 or 4? No.' },
              { line: 6, say: 'Is it 5? No.' },
              { line: 7, vars: { name: '"Weekend"' }, say: 'Is it in 6..7, from 6 to 7? Yes. This case wins, and the rest are skipped.' },
              { line: 10, out: 'Weekend' },
            ],
          });
        },
        code: `fun main() {
    val score = 7
    val grade = when (score) {
        10 -> "Perfect"
        in 7..9 -> "Good"
        in 4..6 -> "Okay"
        else -> "Try again"
    }
    println(grade)   // Good
}`,
        play: `fun main() {
    val month = 4
    val season = when (month) {
        12, 1, 2 -> "Winter"
        in 3..5 -> "Spring"
        in 6..8 -> "Summer"
        else -> "Autumn"
    }
    println(season)
    // Try month 1, 7 and 10.
}`,
        remember: 'when (x) { value -> result ... else -> fallback } picks the first matching case. a..b is a range, both ends included.',
        terms: [
          { term: 'when', def: 'Picks the first matching case from a list. Can give back a value.' },
          { term: 'range', def: '<code>a..b</code>: all numbers from a to b, both included.' },
          { term: '->', def: 'Separates a <code>when</code> case from its result.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Pick the action for the traffic light.', code: 'val light = "green"\nval action = [[when]] (light) {\n    "red" -> "Stop"\n    "green" -> "Go"\n    [[else]] -> "Careful"\n}', why: '<code>when</code> lists the cases; <code>else</code> catches the rest.' },
          { type: 'bug', prompt: 'A score of 5 should be “Medium”, but it prints “Low”. Tap the line.', code: 'val score = 5\nval level = when (score) {\n    in 0..5 -> "Low"\n    in 5..8 -> "Medium"\n    else -> "High"\n}', bug: 2, fix: '    in 0..4 -> "Low"', why: 'Ranges include both ends, so 5 is in <code>0..5</code>. The first match wins.' },
        ],
        quiz: [
          { q: 'Is 10 in <code>1..10</code>?', options: ['Yes', 'No'], a: 0, why: '<code>..</code> includes both ends.' },
          { q: 'Two cases match the value. Which one runs?', options: ['The first one', 'The last one', 'Both'], a: 0, why: '<code>when</code> stops at the first match.' },
        ],
        docs: [['When expressions and statements', 'https://kotlinlang.org/docs/control-flow.html#when-expressions-and-statements']],
      },

      {
        id: 'while',
        title: 'Repeating with while',
        tagline: 'Do the same steps again and again, as long as a condition is true.',
        goals: ['Repeat steps with a <code>while</code> loop', 'Use a counter to end the loop', 'Spot and avoid an infinite loop'],
        level: 'beginner', introduces: ['while'],
        body: `
<p>A rocket countdown says 3, 2, 1. A kettle keeps heating until the water is hot enough. Writing the same <code>println</code> again and again would be slow, and you often don’t know in advance how many times you need. A <em>loop</em> repeats steps for you.</p>
<p><code>while (condition) { ... }</code> checks the condition. If it is <code>true</code>, it runs the block, then goes back to the top and checks again. As soon as the condition is <code>false</code>, the loop ends and the program carries on below it.</p>
<p>Most loops use a <em>loop counter</em>: a <code>var</code> that changes each time round, such as <code>seconds -= 1</code>. Forget to change it and the condition stays <code>true</code> for ever. That is an <em>infinite loop</em>: the program never finishes, and you have to stop it yourself.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    var seconds = 3\n    while (seconds > 0) {\n        println(seconds)\n        seconds -= 1\n    }\n    println("Liftoff!")\n}',
            predict: {
              q: 'How many numbers does this countdown print before <code>Liftoff!</code>?',
              options: ['2', '3', '4'],
              a: 1,
              why: 'It prints 3, 2 and 1. When <code>seconds</code> reaches 0, <code>seconds &gt; 0</code> is false and the loop stops.',
            },
            frames: [
              { line: 2, vars: { seconds: '3' }, say: 'The loop counter starts at 3.' },
              { line: [3, 4], out: '3', say: 'Is 3 greater than 0? Yes, so the block runs and prints 3.' },
              { line: 5, vars: { seconds: '2' }, say: 'The counter goes down by one. Then back up to the <code>while</code> line.' },
              { line: [3, 4], out: '2', say: 'Check again: 2 &gt; 0 is true. Print 2.' },
              { line: [4, 5], out: '1', vars: { seconds: '0' }, say: 'Once more: print 1, and the counter drops to 0.' },
              { line: 3, say: 'Is 0 greater than 0? No. The condition is false, so the loop ends.' },
              { line: 7, out: 'Liftoff!', say: 'The program carries on with the first line after the loop.' },
            ],
          });
        },
        code: `fun main() {
    var balance = 100
    var years = 0
    while (balance < 200) {
        balance += 25
        years++
    }
    println("$years years")   // 4 years
}`,
        play: `fun main() {
    var cups = 0
    while (cups < 5) {
        cups++
        println("Cup $cups filled")
    }
    println("Tray full")
    // Change 5 to 8 and run again.
}`,
        remember: 'while (condition) { ... } repeats the block as long as the condition is true. Change the counter inside, or it never stops.',
        mistakes: [
          { title: 'Forgetting to change the counter', bad: 'var n = 1\nwhile (n <= 3) {\n    println(n)\n}   // prints 1 for ever', good: 'var n = 1\nwhile (n <= 3) {\n    println(n)\n    n++\n}', why: 'If nothing inside the loop changes <code>n</code>, <code>n &lt;= 3</code> stays true and the loop never ends.' },
        ],
        terms: [
          { term: 'loop', def: 'Code that repeats a block of steps.' },
          { term: 'while', def: 'Repeats a block as long as its condition is <code>true</code>. Checks before every round.' },
          { term: 'loop counter', def: 'A <code>var</code> that changes each round, so the loop knows when to stop.' },
          { term: 'infinite loop', def: 'A loop whose condition never becomes false, so it never ends.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print 1, 2 and 3, each on its own line.', code: 'var n = 1\n[[while]] (n [[<=]] 3) {\n    println(n)\n    n++\n}', why: '<code>while</code> repeats while <code>n &lt;= 3</code>. After 3, <code>n</code> becomes 4 and the loop stops.' },
          { type: 'bug', prompt: 'This loop never ends. Tap the line that should change the counter.', code: 'var n = 1\nwhile (n <= 3) {\n    println(n)\n    n + 1\n}', bug: 3, fix: '    n += 1', why: '<code>n + 1</code> works out a number and throws it away. <code>n += 1</code> puts the new value back in the box.' },
        ],
        quiz: [
          { q: '<code>var n = 10</code>, then <code>while (n &lt; 5) { println(n) }</code>. What is printed?', options: ['10', 'Nothing', '10, for ever'], a: 1, why: 'The condition is checked first. 10 &lt; 5 is false, so the block never runs.' },
          { q: 'What makes a <code>while</code> loop stop?', options: ['Its condition becomes false', 'It has run 10 times', 'The block reaches its <code>}</code>'], a: 0, why: 'At <code>}</code> it goes back up and checks again. Only a false condition ends it.' },
        ],
        docs: [['While loops', 'https://kotlinlang.org/docs/control-flow.html#while-loops']],
      },

      {
        id: 'for-ranges',
        title: 'Counting with for',
        tagline: 'Go through a range of numbers, one at a time.',
        goals: ['Count through numbers with <code>for</code> and <code>1..5</code>', 'Count down or skip with <code>downTo</code> and <code>step</code>', 'Leave out the end with <code>until</code>'],
        level: 'beginner', introduces: ['for', 'until', 'downTo', 'step'],
        body: `
<p>Counting with <code>while</code> takes three pieces: make a counter, check it, change it. Miss one and the loop goes wrong. Counting is so common that Kotlin has a loop that does all three for you: <code>for</code>.</p>
<p><code>for (lap in 1..3) { ... }</code> runs the block once for each number in the range <code>1..3</code>. Each round, <code>lap</code> holds the next number: 1, then 2, then 3. You choose the name, and you don’t write <code>val</code> or <code>var</code>: <code>for</code> makes the box itself.</p>
<p>A few words change the range. <code>1 until 4</code> stops before 4: 1, 2, 3. <code>3 downTo 1</code> counts backwards: 3, 2, 1. Add <code>step</code> to jump: <code>0..10 step 5</code> gives 0, 5, 10.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    for (lap in 1..3) {\n        println("Lap $lap")\n    }\n    println("Finished")\n}',
            predict: {
              q: 'What is the last lap this program prints?',
              options: ['<code>Lap 2</code>', '<code>Lap 3</code>', '<code>Lap 4</code>'],
              a: 1,
              why: '<code>1..3</code> includes both ends, so <code>lap</code> is 1, 2 and 3.',
            },
            frames: [
              { line: 2, vars: { lap: '1' }, say: 'First round: <code>for</code> puts the first number of the range, 1, in <code>lap</code>.' },
              { line: 3, out: 'Lap 1', say: 'The block runs with <code>lap</code> = 1.' },
              { line: 2, vars: { lap: '2' }, say: 'Back to the top. No counter to change by hand: <code>lap</code> gets the next number.' },
              { line: 3, out: 'Lap 2' },
              { line: [2, 3], vars: { lap: '3' }, out: 'Lap 3', say: 'Last number in the range: 3.' },
              { line: 5, vars: { lap: null }, out: 'Finished', say: 'No numbers left, so the loop ends. <code>lap</code> belonged to the loop, so it is gone too.' },
            ],
          });
        },
        code: `fun main() {
    for (n in 1 until 4) {
        println(n)    // 1, 2, 3 (4 is left out)
    }
    for (n in 3 downTo 1) {
        println(n)    // 3, 2, 1
    }
    for (n in 0..10 step 5) {
        println(n)    // 0, 5, 10
    }
}`,
        play: `fun main() {
    val number = 7
    for (i in 1..10) {
        println("$number x $i = \${number * i}")
    }
    // Change 1..10 to 10 downTo 1. Then try 1..10 step 2.
}`,
        remember: 'for (x in 1..5) runs once per number. until leaves out the end, downTo counts down, step jumps.',
        mistakes: [
          { title: 'Counting down with ..', bad: 'for (n in 5..1) {\n    println(n)   // prints nothing\n}', good: 'for (n in 5 downTo 1) {\n    println(n)   // 5, 4, 3, 2, 1\n}', why: '<code>5..1</code> counts up from 5 and 1 is already smaller, so the range is empty. Use <code>downTo</code> to count down.' },
        ],
        terms: [
          { term: 'for', def: 'Runs a block once for each value in a range. The name in brackets holds the current value.' },
          { term: 'until', def: '<code>a until b</code>: from a up to b, leaving b out.' },
          { term: 'downTo', def: '<code>a downTo b</code>: counts down from a to b, both included.' },
          { term: 'step', def: 'How far to jump each round: <code>0..10 step 2</code> gives 0, 2, 4, 6, 8, 10.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Count down from 10 to 1.', code: 'for (i in 10 [[downTo]] 1) {\n    println(i)\n}', why: '<code>downTo</code> counts backwards. <code>10..1</code> would print nothing.' },
          { type: 'bug', prompt: 'This should print 1 to 5, but 5 never appears. Tap the line.', code: 'for (i in 1 until 5) {\n    println(i)\n}', bug: 0, fix: 'for (i in 1..5) {', why: '<code>until</code> leaves out the end. <code>1..5</code> includes it.' },
        ],
        quiz: [
          { q: 'How many times does <code>for (i in 1 until 4)</code> run its block?', options: ['3', '4', '5'], a: 0, why: '1, 2, 3. <code>until</code> stops before 4.' },
          { q: 'Which numbers does <code>for (n in 0..6 step 3)</code> go through?', options: ['0, 3, 6', '0, 3', '3, 6'], a: 0, why: 'It starts at 0 and jumps by 3. The end, 6, is part of the range.' },
          { q: 'What does <code>for (n in 3..1) { println(n) }</code> print?', options: ['3, 2, 1', '1, 2, 3', 'Nothing'], a: 2, why: '<code>3..1</code> would have to go up from 3 to 1, which is impossible, so the range is empty. Use <code>downTo</code>.' },
        ],
        docs: [['For loops', 'https://kotlinlang.org/docs/control-flow.html#for-loops'], ['Ranges and progressions', 'https://kotlinlang.org/docs/ranges.html']],
      },

      {
        id: 'functions',
        title: 'Writing your own function',
        tagline: 'Give a group of steps a name, then use it as often as you like.',
        goals: ['Write your own function with <code>fun</code>', 'Call a function by its name', 'Reuse steps instead of copying them'],
        level: 'beginner', introduces: [],
        body: `
<p>Imagine a receipt program that prints a dividing line in five places. You copy the same <code>println</code> five times. Then someone wants a longer line, and you have to find and change all five. A <em>function</em> fixes that: write the steps once, give them a name, and use the name wherever you need them.</p>
<p><code>fun printLine() { ... }</code> <em>defines</em> a function called <code>printLine</code>: <code>fun</code>, a name, <code>()</code>, and the steps in a block. Write it outside <code>main</code>, next to it, not inside. Defining a function does not run it.</p>
<p>To run it, <em>call</em> it: write its name with brackets, <code>printLine()</code>. Kotlin jumps into the function, runs its steps, then comes back and carries on after the call. You have been doing this all along: <code>println</code> is a function someone else wrote, and <code>main</code> is the one Kotlin calls first.</p>
<p>Name functions after what they do, usually starting with a verb: <code>printLine</code>, <code>showMenu</code>. A good name makes <code>main</code> read like a list of steps.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun printLine() {\n    println("----------")\n}\n\nfun main() {\n    println("Receipt")\n    printLine()\n    println("Tea  2.50")\n    printLine()\n}',
            predict: {
              q: '<code>printLine</code> is written first, at the top. What is the first line of output?',
              options: ['<code>----------</code>', '<code>Receipt</code>', 'Nothing, the function is never used'],
              a: 1,
              why: 'The program always starts at <code>main</code>. A function’s steps run only when it is called.',
            },
            frames: [
              { line: 5, stack: ['main'], say: 'The program starts at <code>main</code>, as always. The <code>Call stack</code> panel shows which function is running.' },
              { line: 6, out: 'Receipt' },
              { line: 7, stack: ['main', 'printLine'], say: 'A call. Kotlin remembers its place in <code>main</code> and jumps into <code>printLine</code>.' },
              { line: 2, out: '----------', say: 'The function’s steps run.' },
              { line: 8, stack: ['main'], out: 'Tea  2.50', say: 'At the end of the function, Kotlin goes back to <code>main</code> and continues right after the call.' },
              { line: 9, stack: ['main', 'printLine'], say: 'Same function, called again.' },
              { line: 2, out: '----------', say: 'Same steps, same output. Written once, used twice.' },
              { line: 10, stack: ['main'], say: 'Back in <code>main</code>. Nothing left to do, so the program ends.' },
            ],
          });
        },
        code: `fun greet() {
    println("Hello!")
    println("Welcome to Android Lab.")
}

fun main() {
    greet()   // Hello!  Welcome to Android Lab.
    greet()   // the same two lines again
}`,
        play: `fun cheer() {
    println("Hip hip hooray!")
}

fun main() {
    println("Happy birthday, Lin!")
    cheer()
    cheer()
    cheer()
    // Change the text inside cheer once and run: all three lines change.
}`,
        remember: 'fun name() { ... } defines a function. name() calls it: the steps run, then the program continues after the call.',
        mistakes: [
          { title: 'Calling without brackets', bad: 'fun main() {\n    greet     // error: Function invocation \'greet()\' expected.\n}', good: 'fun main() {\n    greet()\n}', why: 'The brackets are what make it a call. Without them Kotlin sees only the name.' },
        ],
        terms: [
          { term: 'function', def: 'A named group of steps you can run whenever you need them.' },
          { term: 'define', def: 'Write a function with <code>fun</code>: its name and its steps. This does not run it.' },
          { term: 'call', def: 'Run a function by writing its name with brackets: <code>greet()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Define a function called <code>beep</code>, then call it from <code>main</code>.', code: '[[fun]] beep() {\n    println("Beep!")\n}\n\nfun main() {\n    [[beep()]]\n}', why: '<code>fun</code> defines it. The name with brackets calls it.' },
          { type: 'bug', prompt: 'This should print <code>Beep!</code>, but it won’t compile. Tap the line.', code: 'fun beep() {\n    println("Beep!")\n}\n\nfun main() {\n    beep\n}', bug: 5, fix: '    beep()', why: 'A call needs brackets: <code>beep()</code>.' },
        ],
        quiz: [
          { q: 'When do the steps inside a function run?', options: ['When the program starts', 'Each time the function is called', 'Once, where the function is written'], a: 1, why: 'Defining only describes the steps. Each call runs them.' },
          { q: '<code>main</code> calls <code>cheer()</code> three times. How many times do <code>cheer</code>’s steps run?', options: ['1', '3', '4'], a: 1, why: 'Once per call.' },
        ],
        docs: [['Functions', 'https://kotlinlang.org/docs/functions.html']],
      },

      {
        id: 'parameters',
        title: 'Giving a function inputs',
        tagline: 'Parameters let one function work with different values.',
        goals: ['Give a function inputs with parameters', 'Pass values to it as arguments', 'Match arguments to parameters in order and type'],
        level: 'beginner', introduces: [],
        body: `
<p>A function that always prints “Tea: 3 euros” is not much use in a café with ten drinks. You want one function that prints any item at any price. For that, the function needs <em>inputs</em>.</p>
<p>Write them in the brackets: <code>fun printPrice(item: String, euros: Int)</code>. Each input is a <em>parameter</em>: a name and its type, like a <code>val</code> without a starting value. Separate several with commas. Inside the function, use them like any other box.</p>
<p>When you call it, put values in the brackets: <code>printPrice("Tea", 3)</code>. These values are the <em>arguments</em>. They fill the parameters in order: the first argument goes into the first parameter, the second into the second.</p>
<p>The types must match. <code>printPrice(3, "Tea")</code> is a compile error, because 3 is not a <code>String</code>: “Argument type mismatch: actual type is 'Int', but 'String' was expected.”</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun printPrice(item: String, euros: Int) {\n    println("$item: $euros euros")\n}\n\nfun main() {\n    printPrice("Tea", 3)\n    printPrice("Cake", 5)\n}',
            predict: {
              q: 'What does the second call, <code>printPrice("Cake", 5)</code>, print?',
              options: ['<code>Tea: 3 euros</code>', '<code>Cake: 5 euros</code>', 'An error: <code>item</code> already holds "Tea"'],
              a: 1,
              why: 'Each call fills the parameters again with its own arguments.',
            },
            frames: [
              { line: 5, stack: ['main'], say: 'Start in <code>main</code>.' },
              { line: 6, stack: ['main', 'printPrice'], vars: { 'item: String': '"Tea"', 'euros: Int': '3' }, say: 'A call with two arguments. They go into the parameters in order: "Tea" into <code>item</code>, 3 into <code>euros</code>.' },
              { line: 2, out: 'Tea: 3 euros', say: 'Inside, the parameters are ordinary boxes.' },
              { line: 7, stack: ['main', 'printPrice'], vars: { 'item: String': '"Cake"', 'euros: Int': '5' }, say: 'Second call, new arguments. The same parameters get new values.' },
              { line: 2, out: 'Cake: 5 euros', say: 'Same steps, different result.' },
              { line: 8, stack: ['main'], vars: { 'item: String': null, 'euros: Int': null }, say: 'When the function ends, its parameters are gone. They exist only while it runs.' },
            ],
          });
        },
        code: `fun printArea(width: Int, height: Int) {
    println("Area: \${width * height}")
}

fun main() {
    printArea(3, 4)    // Area: 12
    printArea(10, 2)   // Area: 20
}`,
        play: `fun repeatWord(word: String, times: Int) {
    for (i in 1..times) {    // runs 'times' times; i isn't needed here
        println(word)
    }
}

fun main() {
    repeatWord("Hip hip hooray!", 3)
    // Add another call with your own word and number.
}`,
        remember: 'Parameters (name: Type) are a function’s inputs. Arguments are the values you pass in a call, in the same order.',
        mistakes: [
          { title: 'Arguments in the wrong order', bad: 'printPrice(3, "Tea")   // error: Argument type mismatch', good: 'printPrice("Tea", 3)', why: 'Arguments fill parameters in order. The first parameter, <code>item</code>, is a <code>String</code>, so the text comes first.' },
        ],
        terms: [
          { term: 'parameter', def: 'An input a function asks for, written <code>name: Type</code> in its brackets.' },
          { term: 'argument', def: 'The value you pass for a parameter when you call: the <code>"Tea"</code> in <code>printPrice("Tea", 3)</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give <code>welcome</code> a text parameter called <code>name</code>.', code: 'fun welcome([[name]]: [[String]]) {\n    println("Welcome, $name!")\n}\n\nfun main() {\n    welcome("Lin")\n}', why: 'A parameter is a name, a colon, and a type.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the call that is wrong.', code: 'fun printPrice(item: String, euros: Int) {\n    println("$item: $euros euros")\n}\n\nfun main() {\n    printPrice("Soup", 4)\n    printPrice(6, "Salad")\n}', bug: 6, fix: '    printPrice("Salad", 6)', why: 'The text has to come first, because the first parameter is a <code>String</code>.' },
        ],
        quiz: [
          { q: 'In <code>fun add(a: Int, b: Int)</code>, what are <code>a</code> and <code>b</code>?', options: ['Parameters', 'Arguments', 'Types'], a: 0, why: 'The names in the definition are parameters. The values in a call are arguments.' },
          { q: 'How many arguments does a call to <code>fun move(x: Int, y: Int, speed: Int)</code> need?', options: ['1', '2', '3'], a: 2, why: 'One for each parameter, separated by commas.' },
        ],
        docs: [['Function parameters', 'https://kotlinlang.org/docs/functions.html#parameters']],
      },

      {
        id: 'return',
        title: 'Getting a result back',
        tagline: 'return hands a value back to whoever called the function.',
        goals: ['Get a value back from a function with <code>return</code>', 'Write a function’s return type', 'Use the short <code>= value</code> form'],
        level: 'beginner', introduces: ['return', 'Unit'],
        body: `
<p>A function that prints the area of a room is handy, but what if you want to use that area, say to add up two rooms? Printed text can’t be added. You need the function to <em>give back</em> a number.</p>
<p>Write the result’s type after the brackets: <code>fun area(width: Int, height: Int): Int</code>. This is the <em>return type</em>. Inside, <code>return width * height</code> works out the value, hands it back and ends the function. Where you called it, the call is replaced by that value: <code>val room = area(4, 3)</code> puts 12 in <code>room</code>.</p>
<p>A function that gives nothing back, like <code>printLine</code>, has the return type <code>Unit</code>, which means “no useful value”. You don’t have to write it: leaving out the return type means <code>Unit</code>.</p>
<p>When the whole function is one calculation, there is a short form: <code>fun area(width: Int, height: Int) = width * height</code>. No block, no <code>return</code>: the value after <code>=</code> is the result, and Kotlin works out its type.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun area(width: Int, height: Int): Int {\n    return width * height\n}\n\nfun main() {\n    val room = area(4, 3)\n    println("Room: $room square metres")\n    println(area(2, 5) + 1)\n}',
            predict: {
              q: 'What does the last line, <code>println(area(2, 5) + 1)</code>, print?',
              options: ['<code>10</code>', '<code>11</code>', 'An error'],
              a: 1,
              why: '<code>area(2, 5)</code> gives back 10, and 10 + 1 is 11.',
            },
            frames: [
              { line: 6, stack: ['main'], say: 'To fill <code>room</code>, Kotlin first has to call <code>area</code>.' },
              { line: 2, stack: ['main', 'area'], vars: { width: '4', height: '3' }, say: '4 times 3 is 12. <code>return</code> hands 12 back and ends the function.' },
              { line: 6, stack: ['main'], vars: { width: null, height: null, room: '12' }, say: 'Back in <code>main</code>, the call is replaced by 12, which goes into <code>room</code>.' },
              { line: 7, out: 'Room: 12 square metres' },
              { line: 2, stack: ['main', 'area'], vars: { width: '2', height: '5' }, say: 'Another call: this one gives back 10.' },
              { line: 8, stack: ['main'], vars: { width: null, height: null }, out: '11', say: 'The result is used right away in a calculation: 10 + 1.' },
            ],
          });
        },
        code: `fun isAdult(age: Int): Boolean {
    return age >= 18
}

fun square(n: Int) = n * n    // short form: one calculation

fun main() {
    println(isAdult(15))        // false
    println(square(5))          // 25
    val total = square(2) + square(3)
    println(total)              // 13
}`,
        play: `fun toFahrenheit(celsius: Double): Double {
    return celsius * 9 / 5 + 32
}

fun main() {
    val today = toFahrenheit(20.0)
    println("20 degrees Celsius is $today Fahrenheit")
    // Call toFahrenheit with another temperature and print it.
}`,
        remember: 'fun f(...): Type { return value } gives a value back. No return type means Unit. Short form: fun f(...) = value.',
        mistakes: [
          { title: 'Returning a value without a return type', bad: 'fun area(width: Int, height: Int) {\n    return width * height   // error: Return type mismatch: expected \'Unit\', actual \'Int\'.\n}', good: 'fun area(width: Int, height: Int): Int {\n    return width * height\n}', why: 'Without <code>: Int</code> the function is a <code>Unit</code> function, which gives nothing back.' },
        ],
        terms: [
          { term: 'return', def: 'Ends the function and hands a value back to where it was called.' },
          { term: 'return type', def: 'The type of value a function gives back, written after its brackets: <code>): Int</code>.' },
          { term: 'Unit', def: 'The return type of a function that gives back no useful value. Used when you leave the return type out.' },
          { term: 'single-expression function', def: 'A short form, <code>fun f(n: Int) = n * 2</code>, where the value after <code>=</code> is the result.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>triple</code> give back three times its input.', code: 'fun triple(n: Int): [[Int]] {\n    [[return]] n * 3\n}', why: 'The return type goes after the brackets. <code>return</code> hands the value back.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the line to fix.', code: 'fun half(n: Int) {\n    return n / 2\n}\n\nfun main() {\n    println(half(10))\n}', bug: 0, fix: 'fun half(n: Int): Int {', why: 'To give back an <code>Int</code>, the function has to say so with <code>: Int</code>.' },
        ],
        quiz: [
          { q: 'What does <code>println(next(4))</code> print, with <code>fun next(n: Int) = n + 1</code>?', options: ['4', '5', 'Nothing'], a: 1, why: 'The short form gives back the value after <code>=</code>: 4 + 1.' },
          { q: 'A function has no return type written. What does it return?', options: ['<code>Int</code>', '<code>Unit</code>, no useful value', 'Whatever it prints'], a: 1, why: 'Leaving the return type out means <code>Unit</code>. Printing is not returning.' },
          { q: 'What happens to the lines after <code>return</code> in the same block?', options: ['They run after returning', 'They never run: return ends the function', 'They run first'], a: 1, why: '<code>return</code> leaves the function straight away.' },
        ],
        docs: [['Return types', 'https://kotlinlang.org/docs/functions.html#return-types'], ['Single-expression functions', 'https://kotlinlang.org/docs/functions.html#single-expression-functions']],
      },

      {
        id: 'default-args',
        title: 'Default and named arguments',
        tagline: 'Give parameters a usual value, and name arguments to make calls clear.',
        goals: ['Give a parameter a default value', 'Name arguments in a call to make it clear', 'Skip arguments that have a default'],
        level: 'beginner', introduces: [],
        body: `
<p>At a café, most people order a medium drink. Making everyone say “medium” every time is tiring. A function can work the same way: a parameter can have a <em>default value</em>, used whenever the call leaves it out.</p>
<p>Write it with <code>=</code> after the type: <code>fun order(drink: String, size: String = "medium")</code>. Now <code>order("tea")</code> is fine and <code>size</code> is <code>"medium"</code>. <code>order("coffee", "large")</code> gives a value, so the default is not used.</p>
<p>You can also write the parameter’s name in the call: <code>order(drink = "cocoa", size = "small")</code>. These are <em>named arguments</em>. With names, the order doesn’t matter, you can skip any parameter that has a default, and calls like <code>order(size = "large", drink = "tea")</code> say what each value means.</p>
<p>You can mix them: plain values first, then named ones: <code>order("tea", size = "large")</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun order(drink: String, size: String = "medium") {\n    println("$size $drink")\n}\n\nfun main() {\n    order("tea")\n    order("coffee", "large")\n    order(size = "small", drink = "cocoa")\n}',
            predict: {
              q: 'What does <code>order("tea")</code> print?',
              options: ['<code>medium tea</code>', 'An error: <code>size</code> is missing', '<code> tea</code>, with an empty size'],
              a: 0,
              why: 'The call leaves out <code>size</code>, so it gets its default, <code>"medium"</code>.',
            },
            frames: [
              { line: 5, stack: ['main'], say: 'Three calls to the same function, written three ways.' },
              { line: 6, stack: ['main', 'order'], vars: { drink: '"tea"', size: '"medium"' }, say: 'Only one argument. <code>size</code> wasn’t given, so it takes its default.' },
              { line: 2, out: 'medium tea' },
              { line: 7, stack: ['main', 'order'], vars: { drink: '"coffee"', size: '"large"' }, say: 'Both arguments given. The default is not used.' },
              { line: 2, out: 'large coffee' },
              { line: 8, stack: ['main', 'order'], vars: { drink: '"cocoa"', size: '"small"' }, say: 'Named arguments: each value goes to the parameter with that name, whatever the order.' },
              { line: 2, out: 'small cocoa' },
              { line: 9, stack: ['main'], vars: { drink: null, size: null } },
            ],
          });
        },
        code: `fun greet(name: String, greeting: String = "Hello") {
    println("$greeting, $name!")
}

fun main() {
    greet("Ada")                            // Hello, Ada!
    greet("Sam", "Good morning")            // Good morning, Sam!
    greet(greeting = "Hi", name = "Lin")    // Hi, Lin!
}`,
        play: `fun makeTea(cups: Int = 1, sugar: Boolean = false, milk: Boolean = false) {
    println("Cups: $cups, sugar: $sugar, milk: $milk")
}

fun main() {
    makeTea()
    makeTea(2)
    makeTea(milk = true)
    // Add a call that sets all three, using names.
}`,
        remember: 'name: Type = value gives a parameter a default. name = value in a call is a named argument: any order, skip what has a default.',
        mistakes: [
          { title: 'Skipping a parameter without its name', bad: 'makeTea(true)   // error: Argument type mismatch: actual type is \'Boolean\', but \'Int\' was expected.', good: 'makeTea(sugar = true)', why: 'Without a name, the first argument goes to the first parameter, <code>cups</code>. To skip ahead, name the one you mean.' },
        ],
        terms: [
          { term: 'default value', def: 'A value a parameter uses when the call leaves it out: <code>size: String = "medium"</code>.' },
          { term: 'named argument', def: 'An argument written with its parameter’s name, like <code>size = "large"</code>. Order doesn’t matter.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>minutes</code> default to 5, so <code>snooze()</code> works with no arguments.', code: 'fun snooze(minutes: Int [[=]] 5) {\n    println("Snoozing for $minutes minutes")\n}\n\nfun main() {\n    snooze()\n}', why: '<code>=</code> after the type gives the default value.' },
          { type: 'bug', prompt: 'This should book Oslo with breakfast, but it won’t compile. Tap the line.', code: 'fun book(city: String, nights: Int = 1, breakfast: Boolean = false) {\n    println("$city, nights: $nights, breakfast: $breakfast")\n}\n\nfun main() {\n    book("Oslo", true)\n}', bug: 5, fix: '    book("Oslo", breakfast = true)', why: 'The second argument goes to <code>nights</code>, an <code>Int</code>. Naming it sends <code>true</code> to <code>breakfast</code>.' },
        ],
        quiz: [
          { q: 'With <code>fun greet(name: String, greeting: String = "Hello")</code>, what does <code>greet("Ada")</code> print?', options: ['<code>Hello, Ada!</code>', '<code>Ada, Hello!</code>', 'An error'], a: 0, why: '<code>greeting</code> uses its default, <code>"Hello"</code>.' },
          { q: 'Is <code>greet(greeting = "Hi", name = "Lin")</code> allowed, with the names in a different order?', options: ['Yes, names decide where each value goes', 'No, arguments must follow the parameter order'], a: 0, why: 'With named arguments, the order doesn’t matter.' },
        ],
        docs: [['Parameters with default values', 'https://kotlinlang.org/docs/functions.html#parameters-with-default-values'], ['Named arguments', 'https://kotlinlang.org/docs/functions.html#named-arguments']],
      },

      {
        id: 'scope',
        title: 'Where a name exists',
        tagline: 'A box made inside a block lives only inside that block.',
        goals: ['Know where a name can be used', 'Use outer names from inside a block', 'Avoid confusing names that hide each other'],
        level: 'beginner', introduces: [],
        body: `
<p>Two functions in the same program can both have a box called <code>message</code>, and they don’t get mixed up. That is because every name has a <em>scope</em>: the part of the code where it exists.</p>
<p>A box made inside a block, between <code>{</code> and <code>}</code>, is a <em>local variable</em>. It exists from the line where it is made to the end of that block. A function’s parameters and boxes belong to that function; a box made inside an <code>if</code> or a loop disappears at its closing <code>}</code>. Use the name outside and Kotlin stops you: “Unresolved reference 'note'.”</p>
<p>Looking outwards works, though. Code inside a block can use boxes from the blocks around it. So if you need a value after a loop, make the box before the loop.</p>
<p>If an inner block makes a new box with the same name as an outer one, the inner one hides the outer one until its <code>}</code>. This is called <em>shadowing</em>, and it is easy to misread, so pick a different name instead.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val city = "Oslo"\n    if (city == "Oslo") {\n        val note = "Bring a coat"\n        println("$city: $note")\n    }\n    println(city)\n    println(note)\n}',
            predict: {
              q: 'What happens on the last line, <code>println(note)</code>?',
              options: ['It prints <code>Bring a coat</code>', 'An error: <code>note</code> doesn’t exist there', 'It prints nothing'],
              a: 1,
              why: '<code>note</code> was made inside the <code>if</code> block, so it only exists until that block’s <code>}</code>.',
            },
            frames: [
              { line: 2, vars: { city: '"Oslo"' }, say: 'Line 8 has a mistake Kotlin will reject; let’s see why. <code>city</code> is made in <code>main</code>’s block, so it exists until the end of <code>main</code>.' },
              { line: 4, vars: { note: '"Bring a coat"' }, say: 'Inside the <code>if</code> block, a new box: <code>note</code>.' },
              { line: 5, out: 'Oslo: Bring a coat', say: 'Inside the block both names work. Code can always see boxes from the blocks around it.' },
              { line: 6, vars: { note: null }, say: 'The block’s <code>}</code>. <code>note</code> lived only in this block, so it is gone.' },
              { line: 7, out: 'Oslo', say: '<code>city</code> still exists: we are still inside <code>main</code>.' },
              { line: 8, out: 'error: Unresolved reference \'note\'.', say: 'There is no <code>note</code> here. Kotlin catches this before the program starts, so in reality nothing runs until you fix it.' },
            ],
          });
        },
        code: `fun showPrice() {
    val price = 4
    println(price)        // 4
}

fun main() {
    showPrice()
    // println(price)     // error: Unresolved reference 'price'.

    var steps = 0         // made before the loop...
    for (day in 1..3) {
        steps += 1000
    }
    println(steps)        // ...so it still exists here: 3000
}`,
        play: `fun morning() {
    val message = "Good morning"
    println(message)
}

fun evening() {
    val message = "Good evening"
    println(message)
}

fun main() {
    morning()
    evening()
    // Add println(message) here and run. Read the error.
}`,
        remember: 'A name exists from where it is made to the end of its block. Inner blocks can see outer names, not the other way round.',
        mistakes: [
          { title: 'Making the total inside the loop', bad: 'for (day in 1..3) {\n    var steps = 0\n    steps += 1000\n}\nprintln(steps)   // error: Unresolved reference \'steps\'.', good: 'var steps = 0\nfor (day in 1..3) {\n    steps += 1000\n}\nprintln(steps)   // 3000', why: 'Inside the loop, <code>steps</code> is made again every round and is gone after the loop. Make it before the loop.' },
        ],
        terms: [
          { term: 'scope', def: 'The part of the code where a name exists and can be used.' },
          { term: 'local variable', def: 'A box made inside a block or function. It exists only until that block’s <code>}</code>.' },
          { term: 'shadowing', def: 'An inner box with the same name as an outer one, hiding it inside the inner block.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Only one of the two names still exists after the loop. Print it.', code: 'fun main() {\n    val greeting = "Hi"\n    for (i in 1..2) {\n        val name = "Sam"\n        println("$greeting, $name")\n    }\n    println([[greeting]])\n}', why: '<code>greeting</code> was made in <code>main</code>’s block. <code>name</code> belonged to the loop and is gone.' },
          { type: 'bug', prompt: 'This should print 6 (1 + 2 + 3), but it prints 0. Tap the line.', code: 'fun main() {\n    var total = 0\n    for (i in 1..3) {\n        val total = i\n    }\n    println(total)\n}', bug: 3, fix: '        total += i', why: '<code>val total</code> makes a new box that shadows the outer one, and it vanishes at the <code>}</code>. <code>total += i</code> changes the outer box.' },
        ],
        quiz: [
          { q: 'A box is made inside a <code>for</code> block. Can you use it after the loop?', options: ['Yes', 'No, it only exists inside the block'], a: 1, why: 'It is local to the block and disappears at its <code>}</code>.' },
          { q: 'Two different functions each make a <code>val message</code>. What happens?', options: ['A compile error: the name is taken', 'Nothing bad: each one is local to its own function', 'The second replaces the first'], a: 1, why: 'Each <code>message</code> lives only inside its own function, so they never meet.' },
        ],
        docs: [['Function scope', 'https://kotlinlang.org/docs/functions.html#function-scope']],
      },

      {
        id: 'null',
        title: 'When there might be no value',
        tagline: 'Sometimes there is nothing to put in the box. Kotlin calls that null.',
        goals: ['Explain what <code>null</code> means', 'Allow a missing value with a <code>?</code> type', 'Read a number safely with <code>toIntOrNull()</code>'],
        level: 'beginner', introduces: ['null', 'toIntOrNull'],
        body: `
<p>A sign-up form asks for a nickname, but it is optional, and many people leave it out. How does a program say “there is no nickname”? Kotlin has a special value for that: <code>null</code>, meaning “no value at all”. It is not 0 and not empty text; it is nothing.</p>
<p>A normal <code>String</code> box must always hold text, so <code>val nickname: String = null</code> is an error. To allow null, add a question mark to the type: <code>val nickname: String? = null</code>. Read <code>String?</code> as “a String, or nothing”. The same works for every type: <code>Int?</code>, <code>Double?</code>, <code>Boolean?</code>. A type with <code>?</code> is called a <em>nullable</em> type.</p>
<p>Null often comes back when something might not work. You saw that <code>"hello".toInt()</code> crashes. Its careful cousin <code>toIntOrNull()</code> gives <code>null</code> instead: <code>"42".toIntOrNull()</code> is 42, <code>"hello".toIntOrNull()</code> is null. So its result has the type <code>Int?</code>.</p>
<p>Why two kinds of type? So you always know which boxes might be empty. If <code>age</code> is an <code>Int?</code>, Kotlin won’t let you write <code>age + 1</code>: there might be no number to add to. A missing value can’t surprise you while the program runs, because Kotlin points it out first.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val typed = "hello"\n    val age: Int? = typed.toIntOrNull()\n    println(age)\n    val city: String = "Oslo"\n    val nickname: String? = null\n    println(age + 1)\n}',
            varsTitle: 'Boxes and their types',
            predict: {
              q: 'There is no number in <code>"hello"</code>. What does <code>println(age)</code> print?',
              options: ['<code>0</code>', '<code>null</code>', 'The program crashes'],
              a: 1,
              why: '<code>toIntOrNull()</code> gives back null when there is no number, and printing null shows the word null.',
            },
            frames: [
              { line: 1, say: 'Some boxes may end up empty. Watch for <code>null</code>.' },
              { line: 2, vars: { typed: '"hello"' }, say: 'Imagine someone typed this into an age field.' },
              { line: 3, vars: { 'age: Int?': 'null' }, say: 'No number in "hello", so <code>toIntOrNull()</code> gives back null instead of crashing. The <code>?</code> in <code>Int?</code> lets the box hold null.' },
              { line: 4, out: 'null', say: 'Printing null prints the word null.' },
              { line: 5, vars: { 'city: String': '"Oslo"' }, say: 'No question mark: this box must always hold real text.' },
              { line: 6, vars: { 'nickname: String?': 'null' }, say: '“No nickname” is written as null. Only a <code>String?</code> box may hold it.' },
              { line: 7, out: "error: Operator call is prohibited on a nullable receiver of type 'Int?'. Use '?.'-qualified call instead.", say: '<code>age</code> might be null, and you can’t add 1 to nothing. The receiver is the value before the +. <code>?.</code> comes in the next lesson. Kotlin refuses this before the program runs, so in reality nothing prints until you remove this line.' },
            ],
          });
        },
        code: `fun main() {
    val nickname: String? = null    // fine: String? may hold null
    // val name: String = null      // error: a String must hold text
    val age: Int? = "36".toIntOrNull()
    println(age)                    // 36
    println("abc".toIntOrNull())    // null
}`,
        play: `fun main() {
    val typed = "27"
    val number: Int? = typed.toIntOrNull()
    println("You typed: $typed")
    println("As a number: $number")
    // Change "27" to "twenty-seven" and run. What does number hold now?
}`,
        remember: 'null means “no value”. Only a type with ? (like String? or Int?) may hold it.',
        mistakes: [
          { title: 'Putting null in a normal type', bad: 'val middleName: String = null   // error', good: 'val middleName: String? = null', why: 'A plain <code>String</code> must always hold text. Add <code>?</code> when “nothing” is a real possibility.' },
        ],
        terms: [
          { term: 'null', def: 'A special value meaning “no value here”.' },
          { term: 'nullable type', def: 'A type with <code>?</code> after it, like <code>String?</code>. Its box may hold null.' },
          { term: 'toIntOrNull()', def: 'Turns text into an <code>Int</code>, or gives null if there is no number in it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'A middle name is optional. Let the box hold “nothing”.', code: 'val middleName: String[[?]] = [[null]]', why: 'The <code>?</code> makes the type nullable, and <code>null</code> is the “no value” value.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the line that needs a change.', code: 'fun main() {\n    val city: String = "Lisbon"\n    val street: String = null\n    println(city)\n}', bug: 2, fix: '    val street: String? = null', why: 'A plain <code>String</code> can’t hold null. <code>String?</code> can.' },
        ],
        quiz: [
          { q: 'Which line compiles?', options: ['<code>val a: Int = null</code>', '<code>val a: Int? = null</code>'], a: 1, why: 'Only a nullable type, with <code>?</code>, may hold null.' },
          { q: 'What is <code>"twelve".toIntOrNull()</code>?', options: ['<code>12</code>', '<code>0</code>', '<code>null</code>'], a: 2, why: 'There are no digits in the text, so it gives back null instead of crashing.' },
          { q: '<code>val score: Int? = 5</code>. Why does <code>score + 1</code> not compile?', options: ['The box is an <code>Int?</code>, so Kotlin must assume it might be null', 'You can’t add to 5'], a: 0, why: 'Kotlin goes by the type. <code>Int?</code> means “a number, or nothing”, and you can’t add 1 to nothing.' },
        ],
        docs: [['Kotlin tour: Null safety', 'https://kotlinlang.org/docs/kotlin-tour-null-safety.html'], ['Null safety', 'https://kotlinlang.org/docs/null-safety.html']],
      },

      {
        id: 'null-safety',
        title: 'Working safely with null',
        tagline: 'Use a value that might be missing, without crashing.',
        goals: ['Check for <code>null</code> before using a value', 'Use <code>?.</code> and <code>?:</code> to avoid crashes', 'Know why <code>!!</code> is risky'],
        level: 'beginner', introduces: ['?.', '?:', '!!'],
        body: `
<p>Your form gives you <code>typed</code>, a <code>String?</code>: maybe the person typed something, maybe it is null. You still want to do something useful with it, like turn it into a number or fall back to a default. Kotlin has a few small tools for this.</p>
<p><b>Check first.</b> Inside <code>if (typed != null) { ... }</code>, Kotlin knows the value is there, so you can use <code>typed</code> like a normal <code>String</code>. This is called a <em>smart cast</em>: the check changes what Kotlin allows.</p>
<p><b>Safe call</b> <code>?.</code>: <code>typed?.toIntOrNull()</code> makes the call only if <code>typed</code> is not null. If it is null, the call is skipped and the answer is null. <b>Elvis</b> <code>?:</code> gives a fallback: <code>a ?: b</code> is <code>a</code> when it isn’t null, otherwise <code>b</code>. Together: <code>val cups = typed?.toIntOrNull() ?: 1</code>. (Turn <code>?:</code> on its side and it looks like Elvis Presley’s hairstyle, which is where the name comes from.)</p>
<p><code>!!</code> means “trust me, it isn’t null”. If you are wrong, the program crashes with a <code>NullPointerException</code>. It throws away the protection you got from <code>?</code>, so prefer a check, <code>?.</code> or <code>?:</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val nickname: String? = null\n    val shown = nickname ?: "Guest"\n    println("Hello, $shown")\n    val typed: String? = "7"\n    val tickets = typed?.toIntOrNull() ?: 1\n    println(tickets * 2)\n    if (typed != null) {\n        println(typed.toInt() + 1)\n    }\n}',
            predict: {
              q: '<code>nickname</code> is null. What goes into <code>shown</code>?',
              options: ['<code>null</code>', '<code>"Guest"</code>', 'The program crashes'],
              a: 1,
              why: '<code>?:</code> means “or else”: the left side is null, so the fallback on the right is used.',
            },
            frames: [
              { line: 1, say: 'Three ways to handle a value that might be missing.' },
              { line: 2, vars: { 'nickname: String?': 'null' }, say: 'No nickname this time.' },
              { line: 3, vars: { shown: '"Guest"' }, say: '<code>?:</code> means “or else”. <code>nickname</code> is null, so the fallback <code>"Guest"</code> is used.' },
              { line: 4, out: 'Hello, Guest' },
              { line: 5, vars: { 'typed: String?': '"7"' }, say: 'This box might be null, but this time it holds text.' },
              { line: 6, vars: { tickets: '7' }, say: '<code>typed</code> is not null, so <code>?.</code> makes the call and gets 7. The fallback 1 is not needed.' },
              { line: 7, out: '14', say: '<code>tickets</code> is a plain <code>Int</code>, never null, so maths is allowed.' },
              { line: [8, 9], out: '8', say: 'Inside <code>if (typed != null)</code>, Kotlin knows <code>typed</code> holds text, so a normal call is allowed: a smart cast.' },
            ],
          });
        },
        code: `fun main() {
    val typed: String? = null
    println(typed?.toIntOrNull())         // null (no crash)
    println(typed?.toIntOrNull() ?: 0)    // 0
    if (typed != null) {
        println(typed.toInt())            // runs only when typed holds text
    }
    // println(typed!!.toInt())           // crash: NullPointerException
}`,
        play: `fun main() {
    val typed: String? = "3"
    val cups = typed?.toIntOrNull() ?: 1
    println("Making $cups cups of tea")
    // Change "3" to null (no quotes), then to "lots". Which value does cups get?
}`,
        remember: 'Check with if (x != null), call with ?., fall back with ?:. Avoid !!: it crashes when the value is null.',
        mistakes: [
          { title: 'Reaching for !!', bad: 'val age = typed!!.toInt()   // crashes when typed is null', good: 'val age = typed?.toIntOrNull() ?: 0', why: '<code>!!</code> switches off Kotlin’s check, so the problem becomes a crash while the program runs. A fallback keeps it running.' },
        ],
        terms: [
          { term: 'safe call (?.)', def: 'Makes the call only when the value is not null; otherwise the result is null.' },
          { term: 'Elvis (?:)', def: '<code>a ?: b</code> gives <code>a</code>, or <code>b</code> when <code>a</code> is null.' },
          { term: 'smart cast', def: 'After a check like <code>x != null</code>, Kotlin treats <code>x</code> as not null inside that block.' },
          { term: '!!', def: 'Says “this is not null”. Crashes with a <code>NullPointerException</code> if it is.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Use the name, or <code>"Guest"</code> when there is none.', code: 'val name: String? = null\nval shown = name [[?:]] "Guest"\nprintln(shown)', why: '<code>?:</code> picks the right side when the left side is null.' },
          { type: 'bug', prompt: 'This crashes when the code is missing. Make it print 0 instead. Tap the line.', code: 'fun main() {\n    val code: String? = null\n    val number = code!!.toInt()\n    println(number)\n}', bug: 2, fix: '    val number = code?.toIntOrNull() ?: 0', why: '<code>!!</code> crashes on null. <code>?.</code> skips the call and <code>?:</code> gives the fallback 0.' },
        ],
        quiz: [
          { q: '<code>val n: Int? = null</code>. What is <code>n ?: 5</code>?', options: ['<code>5</code>', '<code>null</code>', '<code>0</code>'], a: 0, why: 'The left side is null, so Elvis gives the right side.' },
          { q: '<code>val s: String? = null</code>. What does <code>println(s?.toIntOrNull())</code> print?', options: ['<code>null</code>', '<code>0</code>', 'It crashes'], a: 0, why: 'The safe call is skipped because <code>s</code> is null, and the whole thing becomes null.' },
          { q: 'What does <code>!!</code> do when the value is null?', options: ['Crashes the program', 'Gives back 0', 'Skips the line'], a: 0, why: 'It promises the value is not null. When that promise is broken, you get a <code>NullPointerException</code>.' },
        ],
        docs: [['Null safety: safe calls', 'https://kotlinlang.org/docs/null-safety.html#safe-call-operator'], ['Null safety: Elvis operator', 'https://kotlinlang.org/docs/null-safety.html#elvis-operator']],
      },

      {
        id: 'lists',
        title: 'Lists',
        tagline: 'Keep many values together, in order.',
        goals: ['Keep many values in order with <code>listOf</code>', 'Read an item by its index, starting at 0', 'Get a list’s length with <code>size</code>'],
        level: 'beginner', introduces: ['listOf', 'List', 'get', 'last'],
        body: `
<p>A shopping list, the songs in a playlist, this week’s temperatures: often you have many values of the same kind. One <code>val</code> per item (<code>song1</code>, <code>song2</code>, …) gets messy fast. A <em>list</em> keeps them all in one box, in order.</p>
<p><code>val fruits = listOf("apple", "pear", "plum")</code> makes a list. Each item has a position number, its <em>index</em>, and counting starts at 0: <code>fruits[0]</code> is <code>"apple"</code>, <code>fruits[2]</code> is <code>"plum"</code>. <code>fruits.get(0)</code> means the same as <code>fruits[0]</code>. <code>first()</code> and <code>last()</code> give the two ends.</p>
<p><code>fruits.size</code> tells you how many items there are: 3. It has no <code>()</code> because it is a value the list already knows, not an action. All items share one type; a list of Strings has the type <code>List&lt;String&gt;</code>, read “list of String”.</p>
<p>Ask for a position that doesn’t exist, like <code>fruits[3]</code> in a list of three, and the program crashes with an “out of bounds” error. The last index is always <code>size - 1</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val fruits = listOf("apple", "pear", "plum")\n    println(fruits)\n    println(fruits.size)\n    println(fruits[0])\n    println(fruits.last())\n    println(fruits[3])\n}',
            predict: {
              q: 'What does <code>println(fruits[0])</code> print?',
              options: ['<code>apple</code>', '<code>pear</code>', 'An error: there is no item 0'],
              a: 0,
              why: 'Counting starts at 0, so <code>[0]</code> is the first item.',
            },
            frames: [
              { line: 1, say: 'One box, three items. Watch the positions.' },
              { line: 2, vars: { fruits: '[0] "apple"  [1] "pear"  [2] "plum"' }, say: 'A list keeps its items in order. The positions start at 0, not 1.' },
              { line: 3, out: '[apple, pear, plum]', say: 'Printing a list shows every item, in square brackets.' },
              { line: 4, out: '3', say: '<code>size</code>: how many items.' },
              { line: 5, out: 'apple', say: '<code>[0]</code> is the first item.' },
              { line: 6, out: 'plum', say: '<code>last()</code> gives the item at the end, here at index 2.' },
              { line: 7, out: 'Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3', say: 'There is no index 3: the positions are 0, 1 and 2. The program crashes here.' },
            ],
          });
        },
        code: `fun main() {
    val temps: List<Int> = listOf(12, 15, 9, 14)
    println(temps.size)       // 4
    println(temps[1])         // 15
    println(temps.get(1))     // 15, same as temps[1]
    println(temps.first())    // 12
    println(temps.last())     // 14
}`,
        play: `fun main() {
    val songs = listOf("Intro", "Rain", "Night Bus")
    println("\${songs.size} songs")
    println("Now playing: \${songs[0]}")
    println("Last up: \${songs.last()}")
    // Add a fourth song to the list and run again.
}`,
        remember: 'listOf(a, b, c) keeps items in order. Indexes start at 0, so the last one is size - 1.',
        mistakes: [
          { title: 'Counting from 1', bad: 'val days = listOf("Mon", "Tue", "Wed")\nprintln(days[3])   // crash: there is no index 3', good: 'println(days[2])   // Wed, the third item', why: 'Indexes start at 0, so the last one is <code>size - 1</code>.' },
        ],
        terms: [
          { term: 'list', def: 'Several values kept in order in one box, made with <code>listOf(...)</code>.' },
          { term: 'index', def: 'An item’s position in a list, counting from 0.' },
          { term: 'List<String>', def: 'The type of a list whose items are all Strings.' },
          { term: 'out of bounds', def: 'Asking for an index the list doesn’t have. The program crashes.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print how many colors there are, then the first one.', code: 'val colors = [[listOf]]("red", "green", "blue")\nprintln(colors.[[size]])\nprintln(colors.[[first]]())', why: '<code>listOf</code> makes the list, <code>size</code> counts it, <code>first()</code> gives the item at index 0.' },
          { type: 'bug', prompt: 'This should print the last city, Oslo, but it crashes. Tap the wrong line.', code: 'fun main() {\n    val cities = listOf("Lisbon", "Rome", "Oslo")\n    println(cities[3])\n}', bug: 2, fix: '    println(cities[2])', why: 'Three items have the indexes 0, 1 and 2. <code>cities.last()</code> would work too.' },
        ],
        quiz: [
          { q: '<code>val n = listOf(5, 8, 2)</code>. What is <code>n[1]</code>?', options: ['<code>5</code>', '<code>8</code>', '<code>2</code>'], a: 1, why: 'Index 0 is 5, index 1 is 8.' },
          { q: 'A list has 4 items. What is its last index?', options: ['<code>4</code>', '<code>3</code>'], a: 1, why: 'Counting from 0: 0, 1, 2, 3.' },
          { q: 'What is <code>listOf(5, 8, 2).size</code>?', options: ['<code>3</code>', '<code>2</code>', '<code>15</code>'], a: 0, why: '<code>size</code> counts the items. It doesn’t add them up.' },
        ],
        docs: [['Kotlin tour: Lists', 'https://kotlinlang.org/docs/kotlin-tour-collections.html#list'], ['List-specific operations', 'https://kotlinlang.org/docs/list-operations.html']],
      },

      {
        id: 'list-loop',
        title: 'Going through a list',
        tagline: 'Do something with every item, one by one.',
        goals: ['Do something with every item using <code>for</code>', 'Get each item’s position with <code>indices</code>', 'Get item and position together with <code>withIndex()</code>'],
        level: 'beginner', introduces: ['indices', 'withIndex'],
        body: `
<p>You have a list of names and want to greet each person. Writing one <code>println</code> per name is tiring, and it breaks as soon as the list changes. A <code>for</code> loop runs the same steps once for every item.</p>
<p><code>for (name in names) { println("Hi, $name") }</code>. Each round, <code>name</code> holds the next item: first <code>"Ada"</code>, then <code>"Sam"</code>, and so on until the list ends. Pick a name that reads well: <code>for (price in prices)</code>, <code>for (city in cities)</code>.</p>
<p>Sometimes you need the position too. <code>names.indices</code> is the range of valid indexes (<code>0..2</code> for three items). Like <code>size</code>, it is a value the list knows, so no <code>()</code>. So <code>for (i in names.indices)</code> counts through them and <code>names[i]</code> reads each item.</p>
<p><code>withIndex()</code> gives both at once: <code>for ((i, name) in names.withIndex())</code>. The two names in the extra brackets receive the index and the item, every round.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val names = listOf("Ada", "Sam", "Lin")\n    for (name in names) {\n        println("Hi, $name")\n    }\n    for ((i, name) in names.withIndex()) {\n        println("${i + 1}. $name")\n    }\n}',
            predict: {
              q: 'How many times does <code>println("Hi, $name")</code> run?',
              options: ['Once', 'Three times', 'Never'],
              a: 1,
              why: 'The loop runs its block once per item, and there are three names.',
            },
            frames: [
              { line: 1, say: 'One list, two loops.' },
              { line: 2, vars: { names: '[0] "Ada"  [1] "Sam"  [2] "Lin"' } },
              { line: [3, 4], vars: { name: '"Ada"' }, out: 'Hi, Ada', say: 'Round 1: <code>name</code> holds the first item.' },
              { line: [3, 4], vars: { name: '"Sam"' }, out: 'Hi, Sam', say: 'Round 2: the same steps, with the next item.' },
              { line: [3, 4], vars: { name: '"Lin"' }, out: 'Hi, Lin', say: 'Round 3. That was the last item, so the loop ends.' },
              { line: [6, 7], vars: { i: '0', name: '"Ada"' }, out: '1. Ada', say: '<code>withIndex()</code> hands over two things each round: the index in <code>i</code>, the item in <code>name</code>.' },
              { line: [6, 7], vars: { i: '1', name: '"Sam"' }, out: '2. Sam' },
              { line: [6, 7], vars: { i: '2', name: '"Lin"' }, out: '3. Lin', say: '<code>i</code> starts at 0, so the program prints <code>i + 1</code> to number people from 1.' },
            ],
          });
        },
        code: `fun main() {
    val prices = listOf(4, 10, 6)
    var total = 0
    for (price in prices) {
        total += price
    }
    println(total)    // 20

    for (i in prices.indices) {
        println("Item $i costs \${prices[i]}")
    }
    // Item 0 costs 4
    // Item 1 costs 10
    // Item 2 costs 6
}`,
        play: `fun main() {
    val steps = listOf("Boil water", "Add tea", "Wait 3 minutes", "Pour")
    for ((i, step) in steps.withIndex()) {
        println("Step \${i + 1}: $step")
    }
    // Add "Add milk" to the end of the list and run again.
}`,
        remember: 'for (item in list) runs once per item. Use indices or withIndex() when you also need the position.',
        mistakes: [
          { title: 'Going one step too far', bad: 'for (i in 0..names.size) {\n    println(names[i])   // crashes on the last round\n}', good: 'for (i in names.indices) {\n    println(names[i])\n}', why: '<code>0..names.size</code> includes <code>size</code> itself, one past the last index. <code>indices</code> is always exactly right.' },
        ],
        terms: [
          { term: 'for (item in list)', def: 'A loop that runs its block once for every item, with <code>item</code> holding the current one.' },
          { term: 'indices', def: 'The range of valid indexes of a list, like <code>0..2</code>.' },
          { term: 'withIndex()', def: 'Lets a loop get the index and the item together: <code>for ((i, item) in list.withIndex())</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print every city.', code: 'val cities = listOf("Oslo", "Rome")\n[[for]] (city [[in]] cities) {\n    println(city)\n}', why: '<code>for (item in list)</code> visits each item in turn.' },
          { type: 'bug', prompt: 'This prints every score, then crashes. Tap the line to fix.', code: 'fun main() {\n    val scores = listOf(7, 9, 4)\n    for (i in 0..scores.size) {\n        println(scores[i])\n    }\n}', bug: 2, fix: '    for (i in scores.indices) {', why: '<code>0..3</code> includes 3, but the last index is 2. <code>indices</code> is <code>0..2</code>.' },
        ],
        quiz: [
          { q: 'What does this print?<pre class="code"><code>var total = 0\nfor (n in listOf(2, 3, 5)) {\n    total += n\n}\nprintln(total)</code></pre>', options: ['<code>10</code>', '<code>5</code>', '<code>2</code>'], a: 0, why: 'The loop adds every item: 2 + 3 + 5.' },
          { q: '<code>val names = listOf("Ada", "Sam", "Lin")</code>. What is <code>names.indices</code>?', options: ['<code>0..2</code>', '<code>1..3</code>', '<code>0..3</code>'], a: 0, why: 'Three items have the indexes 0, 1 and 2.' },
          { q: 'In <code>for ((i, name) in names.withIndex())</code>, what is <code>i</code> in the first round?', options: ['<code>0</code>', '<code>1</code>', '<code>"Ada"</code>'], a: 0, why: '<code>i</code> gets the index, and indexes start at 0. The item goes into <code>name</code>.' },
        ],
        docs: [['For loops', 'https://kotlinlang.org/docs/control-flow.html#for-loops']],
      },

      {
        id: 'mutable-lists',
        title: 'Lists that change',
        tagline: 'Add and remove items while the program runs.',
        goals: ['Make a list that can change with <code>mutableListOf</code>', 'Add, remove and replace items', 'Know when to stay with <code>listOf</code>'],
        level: 'beginner', introduces: ['mutableListOf', 'remove'],
        body: `
<p>A to-do app: tasks get added during the day and removed when they are done. A list made with <code>listOf</code> can only be read; you can’t add to it or take anything out. For a list that changes, use <code>mutableListOf</code>. (<em>Mutable</em> means “can be changed”.)</p>
<p><code>val tasks = mutableListOf("Shop")</code>. <code>tasks.add("Cook")</code> puts a new item at the end. <code>tasks.remove("Shop")</code> takes that item out, and the items after it move up one place. <code>tasks[0] = "Clean"</code> replaces the item at index 0. To start with an empty list, say what it will hold: <code>mutableListOf&lt;String&gt;()</code>.</p>
<p>Notice the <code>val</code>. It means this name always points at the same list; it doesn’t stop the list itself from changing. Think of a <code>val</code> box holding a notebook: you can’t swap the notebook for another one, but you can write in it.</p>
<p>When a list never changes, keep using <code>listOf</code>. Then nobody can change it by accident.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val tasks = mutableListOf("Shop", "Cook")\n    tasks.add("Read")\n    println(tasks)\n    tasks.remove("Shop")\n    println(tasks)\n    tasks[0] = "Clean"\n    println(tasks.size)\n}',
            predict: {
              q: 'After <code>tasks.remove("Shop")</code>, what is at index 0?',
              options: ['<code>"Shop"</code>', '<code>"Cook"</code>', 'Nothing, index 0 is empty'],
              a: 1,
              why: 'When an item is removed, the ones after it move up, so <code>"Cook"</code> becomes the first.',
            },
            frames: [
              { line: 1, say: 'A list that can grow and shrink.' },
              { line: 2, vars: { tasks: '[0] "Shop"  [1] "Cook"' }, say: 'Two tasks to start with.' },
              { line: 3, vars: { tasks: '[0] "Shop"  [1] "Cook"  [2] "Read"' }, say: '<code>add()</code> puts the new item at the end.' },
              { line: 4, out: '[Shop, Cook, Read]' },
              { line: 5, vars: { tasks: '[0] "Cook"  [1] "Read"' }, say: '<code>remove()</code> takes out <code>"Shop"</code>. Everything after it moves up: Cook is now at index 0.' },
              { line: 6, out: '[Cook, Read]' },
              { line: 7, vars: { tasks: '[0] "Clean"  [1] "Read"' }, say: '<code>tasks[0] = ...</code> replaces the item at index 0.' },
              { line: 8, out: '2', say: 'Still two items. The <code>val</code> box holds the same list the whole time; only its contents changed.' },
            ],
          });
        },
        code: `fun main() {
    val cart = mutableListOf<String>()   // empty, will hold Strings
    cart.add("bread")
    cart.add("milk")
    cart.add("eggs")
    cart.remove("milk")
    println(cart)         // [bread, eggs]
    println(cart.size)    // 2
}`,
        play: `fun main() {
    val guests = mutableListOf("Ada", "Sam")
    guests.add("Lin")
    guests.remove("Sam")
    println("Guests: $guests")
    println("Count: \${guests.size}")
    // Add yourself to the list with one more add() line.
}`,
        remember: 'mutableListOf can change: add() at the end, remove() an item, list[i] = x to replace. listOf can only be read.',
        mistakes: [
          { title: 'Changing a listOf list', bad: `val days = listOf("Mon")\ndays.add("Tue")   // error: Unresolved reference 'add'.`, good: 'val days = mutableListOf("Mon")\ndays.add("Tue")', why: 'A list made with <code>listOf</code> has no <code>add</code>. Make it with <code>mutableListOf</code> if it must change.' },
        ],
        terms: [
          { term: 'mutable', def: 'Can be changed after it is made.' },
          { term: 'mutableListOf', def: 'Makes a list you can add to, remove from and change.' },
          { term: 'add() / remove()', def: '<code>add(x)</code> puts <code>x</code> at the end; <code>remove(x)</code> takes the first <code>x</code> out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a list that can change, then add <code>"Rome"</code>.', code: 'val trips = [[mutableListOf]]("Oslo")\ntrips.[[add]]("Rome")\nprintln(trips)', why: 'Only a mutable list has <code>add</code>.' },
          { type: 'bug', prompt: 'This won’t compile. Tap the line to fix.', code: 'fun main() {\n    val colors = listOf("red")\n    colors.add("blue")\n    println(colors)\n}', bug: 1, fix: '    val colors = mutableListOf("red")', why: 'A <code>listOf</code> list can’t change. Make it with <code>mutableListOf</code>.' },
        ],
        quiz: [
          { q: '<code>val l = mutableListOf("a", "b")</code>, then <code>l.add("c")</code>, then <code>l.remove("a")</code>. What is <code>l</code>?', options: ['<code>[b, c]</code>', '<code>[a, b]</code>', '<code>[a, b, c]</code>'], a: 0, why: '"c" goes on the end, then "a" is taken out.' },
          { q: 'Can a <code>val</code> hold a mutable list that you add to?', options: ['Yes: val stops you replacing the list, not changing what is in it', 'No: you need var'], a: 0, why: 'The box keeps the same list. Adding items changes the list, not the box.' },
          { q: '<code>val l = mutableListOf("x")</code>. What does <code>l.remove("y")</code> do?', options: ['Nothing changes', 'The program crashes', 'It removes "x"'], a: 0, why: 'There is no "y" to remove, so the list stays as it is. (<code>remove</code> gives back <code>false</code> to say so.)' },
        ],
        docs: [['Kotlin tour: Lists', 'https://kotlinlang.org/docs/kotlin-tour-collections.html#list'], ['List write operations', 'https://kotlinlang.org/docs/list-operations.html#list-write-operations']],
      },

      {
        id: 'sets',
        title: 'Sets',
        tagline: 'A collection where every value appears only once.',
        goals: ['Keep each value once with <code>setOf</code>', 'Check if a value is there with <code>in</code>', 'Choose between a set and a list'],
        level: 'beginner', introduces: ['setOf', 'contains'],
        body: `
<p>Which cities has Ada visited? She went to Oslo twice, but Oslo should appear only once in the answer. A <em>set</em> is a collection that keeps each value once, however many times you put it in.</p>
<p><code>val visited = setOf("Oslo", "Rome", "Oslo")</code> holds two values: Oslo and Rome. The second Oslo is a <em>duplicate</em>, so it is dropped, and <code>visited.size</code> is 2.</p>
<p>A set is made for one question: is this value in here? <code>visited.contains("Rome")</code> gives <code>true</code>. A shorter way to ask is <code>"Rome" in visited</code>, the same <code>in</code> you used with ranges.</p>
<p>A set has no positions, so there is no <code>visited[0]</code>. Use a list when order and positions matter, and a set when you only care whether something is there.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val visited = setOf("Oslo", "Rome", "Oslo", "Lima")\n    println(visited)\n    println(visited.size)\n    println(visited.contains("Rome"))\n    println("Paris" in visited)\n}',
            predict: {
              q: 'Four values go into the set. What is <code>visited.size</code>?',
              options: ['<code>4</code>', '<code>3</code>', '<code>2</code>'],
              a: 1,
              why: '"Oslo" is there twice, but a set keeps each value once: Oslo, Rome, Lima.',
            },
            frames: [
              { line: 1, say: 'Four values go in. How many stay?' },
              { line: 2, vars: { visited: '"Oslo", "Rome", "Lima"' }, say: 'The second <code>"Oslo"</code> is dropped: a set keeps each value only once.' },
              { line: 3, out: '[Oslo, Rome, Lima]', say: 'Printed, a set looks like a list, but without any duplicates.' },
              { line: 4, out: '3', say: 'Three different cities.' },
              { line: 5, out: 'true', say: '<code>contains()</code> answers: is this value in the set?' },
              { line: 6, out: 'false', say: '<code>in</code> asks the same question in fewer letters. No Paris here.' },
            ],
          });
        },
        code: `fun main() {
    val tags = setOf("kotlin", "android", "kotlin")
    println(tags)                     // [kotlin, android]
    println(tags.size)                // 2
    println(tags.contains("java"))    // false
    println("android" in tags)        // true
}`,
        play: `fun main() {
    val allowed = setOf("Ada", "Sam", "Lin")
    val visitor = "Sam"
    if (visitor in allowed) {
        println("Welcome, $visitor")
    } else {
        println("Sorry, not on the list")
    }
    // Change visitor to your own name and run.
}`,
        remember: 'setOf keeps each value once. Ask contains(x), or x in set; there are no positions.',
        mistakes: [
          { title: 'Asking a set for a position', bad: 'val s = setOf("a", "b")\nprintln(s[0])   // error', good: 'println("a" in s)   // true', why: 'A set has no indexes. Ask whether a value is in it instead.' },
        ],
        terms: [
          { term: 'set', def: 'A collection where each value appears at most once, made with <code>setOf(...)</code>.' },
          { term: 'duplicate', def: 'The same value a second time.' },
          { term: 'contains()', def: 'Gives <code>true</code> if the value is in the collection. <code>x in s</code> means the same.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Check whether 7 is one of the lucky numbers.', code: 'val lucky = [[setOf]](3, 7, 21)\nprintln(lucky.[[contains]](7))', why: '<code>setOf</code> makes the set, <code>contains</code> asks the question.' },
          { type: 'bug', prompt: 'This should print 3, the number of different colors, but prints 4. Tap the wrong line.', code: 'fun main() {\n    val colors = listOf("red", "blue", "red", "green")\n    println(colors.size)\n}', bug: 1, fix: '    val colors = setOf("red", "blue", "red", "green")', why: 'A list keeps duplicates. A set drops the second "red".' },
        ],
        quiz: [
          { q: 'What is <code>setOf(1, 1, 2, 2, 2).size</code>?', options: ['<code>5</code>', '<code>2</code>', '<code>1</code>'], a: 1, why: 'Only two different values: 1 and 2.' },
          { q: '<code>val s = setOf("a", "b")</code>. What is <code>"c" in s</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 1, why: '"c" was never put in the set.' },
          { q: 'When is a set a better choice than a list?', options: ['When each value should appear once and you mainly ask “is it in there?”', 'When you need items by position'], a: 0, why: 'Sets drop duplicates and answer <code>contains</code>. Positions need a list.' },
        ],
        docs: [['Kotlin tour: Sets', 'https://kotlinlang.org/docs/kotlin-tour-collections.html#set']],
      },

      {
        id: 'maps',
        title: 'Maps',
        tagline: 'Look up a value by its key, like a word in a dictionary.',
        goals: ['Store key–value pairs with <code>mapOf</code>', 'Look up a value by its key', 'Handle a missing key without crashing'],
        level: 'beginner', introduces: ['mapOf', 'getOrDefault', 'mutableMapOf'],
        body: `
<p>A phone book: you know the name and want the number. A <em>map</em> stores pairs: a <em>key</em> you look things up by, and the value that belongs to it.</p>
<p><code>val ages = mapOf("Ada" to 36, "Sam" to 29)</code>. Each <code>key to value</code> is one pair. Read a value with the key in square brackets: <code>ages["Ada"]</code> is 36 (<code>ages.get("Ada")</code> means the same). Each key appears only once and has one value.</p>
<p>What if the key isn’t there? <code>ages["Lin"]</code> gives <code>null</code>, so a lookup has a nullable type, here <code>Int?</code>. Use what you know: <code>ages["Lin"] ?: 0</code>, or the built-in <code>ages.getOrDefault("Lin", 0)</code>.</p>
<p>Like <code>listOf</code>, a <code>mapOf</code> map can’t change. Make it with <code>mutableMapOf</code> and <code>ages["Lin"] = 41</code> adds a pair, or replaces the value if Lin is already a key.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val scores = mutableMapOf("Ada" to 3, "Sam" to 5)\n    println(scores["Sam"])\n    println(scores["Lin"])\n    println(scores.getOrDefault("Lin", 0))\n    scores["Lin"] = 2\n    scores["Ada"] = 4\n    println(scores)\n}',
            predict: {
              q: 'There is no key <code>"Lin"</code> yet. What does <code>println(scores["Lin"])</code> print?',
              options: ['<code>0</code>', '<code>null</code>', 'The program crashes'],
              a: 1,
              why: 'A missing key gives null. That is why map lookups have a nullable type.',
            },
            frames: [
              { line: 1, say: 'Names are the keys, points are the values.' },
              { line: 2, vars: { scores: '"Ada" to 3, "Sam" to 5' }, say: 'Two pairs. <code>to</code> joins each key to its value.' },
              { line: 3, out: '5', say: 'Look up by key: Sam has 5.' },
              { line: 4, out: 'null', say: 'No key <code>"Lin"</code>, so the answer is null.' },
              { line: 5, out: '0', say: '<code>getOrDefault()</code> gives the fallback 0 instead of null.' },
              { line: 6, vars: { scores: '"Ada" to 3, "Sam" to 5, "Lin" to 2' }, say: 'A new key: the pair is added.' },
              { line: 7, vars: { scores: '"Ada" to 4, "Sam" to 5, "Lin" to 2' }, say: 'Ada was already a key, so her value is replaced. A key never appears twice.' },
              { line: 8, out: '{Ada=4, Sam=5, Lin=2}', say: 'A printed map shows <code>key=value</code> pairs in curly brackets.' },
            ],
          });
        },
        code: `fun main() {
    val capitals = mapOf("Norway" to "Oslo", "Peru" to "Lima")
    println(capitals["Peru"])                       // Lima
    println(capitals["Chile"])                      // null
    println(capitals["Chile"] ?: "unknown")         // unknown
    println(capitals.getOrDefault("Chile", "?"))    // ?
    println(capitals.size)                          // 2
}`,
        play: `fun main() {
    val stock = mutableMapOf("apples" to 12, "pears" to 4)
    stock["plums"] = 9
    stock["pears"] = 0
    println(stock)
    val apples = stock.getOrDefault("apples", 0)
    println("Apples left: $apples")
    // Add a line that changes the number of apples, then run.
}`,
        remember: 'mapOf(key to value) looks values up by key. A missing key gives null, so use ?: or getOrDefault.',
        mistakes: [
          { title: 'Forgetting a key might be missing', bad: 'val points: Int = scores["Lin"]   // error: the lookup is Int?', good: 'val points: Int = scores["Lin"] ?: 0', why: 'Any key might be missing, so a lookup can be null. Give a fallback.' },
        ],
        terms: [
          { term: 'map', def: 'A collection of key-value pairs, made with <code>mapOf(...)</code>.' },
          { term: 'key', def: 'What you look a value up by. Each key appears once in a map.' },
          { term: 'to', def: 'Joins a key and its value into a pair: <code>"Ada" to 36</code>.' },
          { term: 'getOrDefault()', def: 'Looks up a key, or gives the fallback you pass when the key is missing.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Look up the price of tea, with 0 if it is missing.', code: 'val prices = mapOf("tea" [[to]] 3, "cake" [[to]] 5)\nprintln(prices.[[getOrDefault]]("tea", 0))', why: '<code>to</code> makes each pair; <code>getOrDefault</code> looks one up with a fallback.' },
          { type: 'bug', prompt: 'Lin should get 7 points, but this won’t compile. Tap the line to fix.', code: 'fun main() {\n    val points = mapOf("Ada" to 5)\n    points["Lin"] = 7\n    println(points)\n}', bug: 1, fix: '    val points = mutableMapOf("Ada" to 5)', why: 'A <code>mapOf</code> map can’t change. Adding a pair needs <code>mutableMapOf</code>.' },
        ],
        quiz: [
          { q: '<code>val m = mapOf("a" to 1, "b" to 2)</code>. What is <code>m["b"]</code>?', options: ['<code>2</code>', '<code>"b"</code>', '<code>null</code>'], a: 0, why: 'The key "b" belongs to the value 2.' },
          { q: 'Same map. What is <code>m["z"]</code>?', options: ['<code>null</code>', '<code>0</code>', 'The program crashes'], a: 0, why: 'There is no key "z", so the lookup gives null.' },
          { q: '<code>val m = mutableMapOf("a" to 1)</code>, then <code>m["a"] = 5</code>. What does <code>println(m)</code> print?', options: ['<code>{a=5}</code>', '<code>{a=1, a=5}</code>'], a: 0, why: 'A key appears only once. Setting it again replaces its value.' },
        ],
        docs: [['Kotlin tour: Maps', 'https://kotlinlang.org/docs/kotlin-tour-collections.html#map'], ['Map-specific operations', 'https://kotlinlang.org/docs/map-operations.html']],
      },

      {
        id: 'lambdas',
        title: 'Functions as values',
        tagline: 'A piece of code you can keep in a box and use later.',
        goals: ['Keep a piece of code in a <code>val</code> as a lambda', 'Call a lambda and read its type', 'Use <code>it</code> for a single parameter'],
        level: 'beginner', introduces: ['it'],
        body: `
<p>Sometimes you want to keep a job, not a value: “when the button is tapped, do this”. In Kotlin a function can be a value too, so you can put it in a <code>val</code> and run it when you need it. This is how Android apps say what a button does.</p>
<p>A <em>lambda</em> is a function without a name, written in curly brackets: <code>val double = { x: Int -&gt; x * 2 }</code>. Before the <code>-&gt;</code> come the parameters, after it the steps; the last value is the result. Here <code>-&gt;</code> has a different job than in <code>when</code>: it separates the inputs from the steps. Call a lambda like any function: <code>double(4)</code> is 8.</p>
<p>A lambda’s type is a <em>function type</em>: <code>(Int) -&gt; Int</code> means “takes an Int, gives back an Int”, and <code>() -&gt; Unit</code> means “takes nothing, gives nothing back”. Inputs go in the brackets on the left, the result type after the arrow.</p>
<p>When Kotlin already knows the lambda takes one parameter (from a written type, or from the function you pass it to), you don’t have to name it; you can call it <code>it</code>: <code>val double: (Int) -&gt; Int = { it * 2 }</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val double = { x: Int -> x * 2 }\n    println(double(4))\n    val addTen: (Int) -> Int = { it + 10 }\n    println(addTen(5))\n    val hello = { println("Hi") }\n    hello()\n}',
            predict: {
              q: 'What does <code>println(addTen(5))</code> print?',
              options: ['<code>15</code>', '<code>10</code>', '<code>it + 10</code>'],
              a: 0,
              why: 'Calling <code>addTen</code> runs its code with <code>it</code> = 5, and 5 + 10 is 15.',
            },
            frames: [
              { line: 1, say: 'Three lambdas. Watch when their code actually runs.' },
              { line: 2, vars: { double: '{ x: Int -> x * 2 }' }, say: '<code>double</code> holds a piece of code, not a number. Nothing runs yet.' },
              { line: 3, out: '8', say: 'Calling it runs the code with <code>x</code> = 4. The last value, 8, is the result.' },
              { line: 4, vars: { 'addTen: (Int) -> Int': '{ it + 10 }' }, say: 'The type <code>(Int) -&gt; Int</code> says: one Int in, an Int out. One parameter, so it can be called <code>it</code>.' },
              { line: 5, out: '15', say: 'Here <code>it</code> is 5.' },
              { line: 6, vars: { 'hello: () -> Unit': '{ println("Hi") }' }, say: 'No inputs, so no <code>-&gt;</code> is needed. Its type is <code>() -&gt; Unit</code>. Still nothing printed.' },
              { line: 7, out: 'Hi', say: 'Only the call, with <code>()</code>, runs the code inside.' },
            ],
          });
        },
        code: `fun main() {
    val greet = { name: String -> "Hello, $name" }
    println(greet("Ada"))    // Hello, Ada

    val isEven: (Int) -> Boolean = { it % 2 == 0 }
    println(isEven(4))       // true
    println(isEven(7))       // false
}`,
        play: `fun main() {
    val tip: (Int) -> Int = { it / 10 }
    val bill = 40
    println("Bill: $bill euros")
    println("Tip: \${tip(bill)} euros")
    // Change the lambda to { it / 5 } for a bigger tip.
}`,
        remember: '{ x: Int -> x * 2 } is a function you can keep in a val and call. (Int) -> Int is its type. With one known parameter, call it it.',
        mistakes: [
          { title: 'Forgetting to call the lambda', bad: 'val hello = { println("Hi") }\nhello      // does nothing', good: 'hello()    // prints Hi', why: '<code>hello</code> is a box holding a function, so naming it alone is allowed, but it doesn’t run. Add <code>()</code> to run it.' },
        ],
        terms: [
          { term: 'lambda', def: 'A function without a name, written in <code>{ }</code>, that you can keep in a variable.' },
          { term: 'it', def: 'The name you can use for a lambda’s only parameter when Kotlin already knows there is one.' },
          { term: 'function type', def: 'The type of a function value, like <code>(Int) -&gt; Int</code> or <code>() -&gt; Unit</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Finish the lambda so it adds 1, then call it with 5.', code: 'val plusOne: (Int) -> Int = { [[it]] + 1 }\nprintln([[plusOne]](5))', why: 'The only parameter is called <code>it</code>, and you call the lambda by its name with <code>()</code>.' },
          { type: 'bug', prompt: 'This should print 36, but it won’t compile. Tap the line.', code: 'fun main() {\n    val square: (Int) -> Int = { x * x }\n    println(square(6))\n}', bug: 1, fix: '    val square: (Int) -> Int = { it * it }', why: 'There is no parameter called <code>x</code>. An unnamed single parameter is called <code>it</code>.' },
        ],
        quiz: [
          { q: '<code>val f = { a: Int -&gt; a + 1 }</code>. What is <code>f(9)</code>?', options: ['<code>10</code>', '<code>9</code>', '<code>a + 1</code>'], a: 0, why: 'Calling <code>f</code> runs its code with <code>a</code> = 9.' },
          { q: 'What does the type <code>(String) -&gt; Int</code> mean?', options: ['Takes a String, gives back an Int', 'Takes an Int, gives back a String'], a: 0, why: 'Inputs are in the brackets on the left, the result is after the arrow.' },
          { q: 'In <code>val triple: (Int) -&gt; Int = { it * 3 }</code>, what is <code>it</code>?', options: ['The one value the lambda receives', 'A variable you must create first'], a: 0, why: 'The type says there is one Int parameter, so Kotlin lets you call it <code>it</code>.' },
        ],
        docs: [['Kotlin tour: Lambda expressions', 'https://kotlinlang.org/docs/kotlin-tour-functions.html#lambda-expressions'], ['Lambdas', 'https://kotlinlang.org/docs/lambdas.html']],
      },

      {
        id: 'function-params',
        title: 'Functions that take functions',
        tagline: 'Hand a function a job to do, written as a lambda.',
        goals: ['Write a function that takes another function', 'Pass a lambda as an argument', 'Write a lambda after the brackets'],
        level: 'beginner', introduces: [],
        body: `
<p>Say you want “do this three times”, but what “this” is changes: sometimes print a cheer, sometimes beep. One function can do the repeating if the job itself is an input. A lambda can be that input.</p>
<p>Give the function a parameter with a function type: <code>fun applyTo(n: Int, action: (Int) -&gt; Int)</code>. Inside, <code>action</code> is a box holding a function, so <code>action(n)</code> runs it. To call <code>applyTo</code>, pass a lambda as the argument: <code>applyTo(5, { it * it })</code>. Kotlin knows from the parameter type that the lambda takes one Int, so <code>it</code> works.</p>
<p>When the lambda is the last argument, you may write it after the round brackets: <code>applyTo(5) { it * it }</code>. That is called a <em>trailing lambda</em>, and it is the usual way to write it.</p>
<p>When the lambda is the only argument, the empty <code>()</code> can go too: <code>twice() { ... }</code> becomes <code>twice { ... }</code>. You will see this shape everywhere in Kotlin and Android.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun applyTo(n: Int, action: (Int) -> Int): Int {\n    return action(n)\n}\n\nfun main() {\n    val addTen: (Int) -> Int = { it + 10 }\n    println(applyTo(5, addTen))\n    println(applyTo(5, { it * it }))\n    println(applyTo(5) { it * it })\n}',
            predict: {
              q: '<code>addTen</code> adds 10 to its input. What does <code>applyTo(5, addTen)</code> give back?',
              options: ['<code>15</code>', '<code>10</code>', '<code>5</code>'],
              a: 0,
              why: '<code>applyTo</code> calls the lambda it was given with 5, and 5 + 10 is 15.',
            },
            frames: [
              { line: 5, stack: ['main'], say: 'The program starts in <code>main</code>, as always.' },
              { line: 6, stack: ['main'], vars: { addTen: '{ it + 10 }' }, say: 'A lambda in a box. Nothing runs yet.' },
              { line: [7, 2], stack: ['main', 'applyTo'], vars: { n: '5', action: 'addTen' }, say: 'Inside <code>applyTo</code>: the parameter <code>action</code> holds the lambda that was passed in, and <code>action(n)</code> runs it.' },
              { line: 7, stack: ['main'], vars: { n: null, action: null }, out: '15', say: '5 + 10 comes back and is printed.' },
              { line: [8, 2], stack: ['main', 'applyTo'], vars: { n: '5', action: '{ it * it }' }, say: 'This time the lambda is written right in the call, inside the brackets.' },
              { line: 8, stack: ['main'], vars: { n: null, action: null }, out: '25', say: '5 * 5.' },
              { line: 9, out: '25', say: 'The same call as a trailing lambda: written after the brackets because it is the last argument.' },
            ],
          });
        },
        code: `fun twice(action: () -> Unit) {
    action()
    action()
}

fun main() {
    twice() { println("Knock") }   // Knock, Knock (two lines)
    twice { println("Knock") }     // the same: the lambda is the only argument, so () can go
}`,
        play: `fun repeatTimes(times: Int, action: () -> Unit) {
    for (i in 1..times) {
        action()
    }
}

fun main() {
    repeatTimes(3) {
        println("Hip hip hooray!")
    }
    // Change 3 to another number, or change what the lambda prints.
}`,
        remember: 'A parameter like action: (Int) -> Int takes a function. Pass a lambda; when it is last, write it after the (); when it is the only argument, drop the ().',
        mistakes: [
          { title: 'A lambda that gives back the wrong type', bad: 'applyTo(4) { "four" }   // error: Return type mismatch: expected \'Int\', actual \'String\'.', good: 'applyTo(4) { it * 2 }', why: 'The parameter type <code>(Int) -&gt; Int</code> says the lambda must give back an Int. Its last value is the result.' },
        ],
        terms: [
          { term: 'function-type parameter', def: 'A parameter whose type is a function type, like <code>action: () -&gt; Unit</code>. It takes a lambda.' },
          { term: 'trailing lambda', def: 'A lambda written after the round brackets of a call, when it is the last argument. If it is the only one, the empty <code>()</code> can go.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>twice</code> run the job it is given two times.', code: 'fun twice(action: () -> Unit) {\n    [[action]]()\n    [[action]]()\n}\n\nfun main() {\n    twice { println("Hi") }\n}', why: '<code>action</code> holds the lambda; <code>action()</code> runs it.' },
          { type: 'bug', prompt: 'This should print 8, but it won’t compile. Tap the line.', code: 'fun applyTo(n: Int, action: (Int) -> Int): Int {\n    return action\n}\n\nfun main() {\n    println(applyTo(4) { it * 2 })\n}', bug: 1, fix: '    return action(n)', why: '<code>action</code> alone is the function itself. <code>action(n)</code> runs it with <code>n</code> and gives back an Int.' },
        ],
        quiz: [
          { q: 'With <code>fun applyTo(n: Int, action: (Int) -&gt; Int) = action(n)</code>, what is <code>applyTo(3) { it + 1 }</code>?', options: ['<code>4</code>', '<code>3</code>', '<code>1</code>'], a: 0, why: 'The lambda runs with <code>it</code> = 3, and 3 + 1 is 4.' },
          { q: 'Which call means the same as <code>twice({ println("Hi") })</code>?', options: ['<code>twice { println("Hi") }</code>', '<code>twice("Hi")</code>', '<code>twice() println("Hi")</code>'], a: 0, why: 'The lambda is the only argument, so it can go after the call and the empty <code>()</code> can be dropped.' },
          { q: 'In <code>applyTo(5) { it * 2 }</code>, how does Kotlin know the lambda has one parameter called <code>it</code>?', options: ['The parameter type <code>(Int) -&gt; Int</code> says it takes one Int', '<code>it</code> is always 5', 'It guesses from the <code>*</code>'], a: 0, why: 'The function you pass it to says what kind of lambda it expects.' },
        ],
        docs: [['Higher-order functions', 'https://kotlinlang.org/docs/lambdas.html#higher-order-functions'], ['Passing trailing lambdas', 'https://kotlinlang.org/docs/lambdas.html#passing-trailing-lambdas']],
      },

      {
        id: 'collection-ops',
        title: 'Transforming lists',
        tagline: 'Ask a list questions in one line: filter, map, sum and more.',
        goals: ['Keep matching items with <code>filter</code>', 'Change every item with <code>map</code>', 'Answer questions with <code>sum</code>, <code>count</code>, <code>any</code>, <code>all</code>'],
        level: 'beginner', introduces: ['filter', 'map', 'sum', 'any', 'all', 'sortedBy'],
        body: `
<p>You have a week of step counts and want to know: which days were over 8000? What is the total? Did you ever reach 10000? A <code>for</code> loop and a <code>var</code> could work it out, but lists come with ready-made functions that each do one job. Most take a lambda.</p>
<p><code>filter { }</code> keeps the items for which the lambda gives <code>true</code>: <code>steps.filter { it &gt; 8000 }</code>. The lambda is the only argument, so, as with <code>twice { }</code> in the last lesson, <code>filter() { }</code> becomes <code>filter { }</code>. <code>map { }</code> turns every item into something new: <code>prices.map { it * 2 }</code>. (Not the same as <code>mapOf</code>: here map means “change each item”.) Both give back a <em>new</em> list; the original stays as it was.</p>
<p>Others give one answer. <code>sum()</code> adds all the numbers. <code>count { }</code> counts the items that match. <code>any { }</code> is <code>true</code> if at least one item matches; <code>all { }</code> is <code>true</code> only if every item does.</p>
<p><code>sortedBy { }</code> gives a new list in order, smallest first, by whatever the lambda picks. You can also chain these: <code>prices.filter { it &lt; 10 }.sum()</code> filters first, then adds up what is left.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: 'fun main() {\n    val steps = listOf(6200, 9100, 4800, 10400)\n    val bigDays = steps.filter { it > 8000 }\n    println(bigDays)\n    println(steps.map { it / 1000 })\n    println(steps.sum())\n    println(steps.count { it < 5000 })\n    println(steps.any { it >= 10000 })\n    println(steps.sortedBy { it })\n}',
            predict: {
              q: 'What does <code>steps.filter { it &gt; 8000 }</code> keep?',
              options: ['<code>[9100, 10400]</code>', '<code>[6200, 4800]</code>', '<code>2</code>'],
              a: 0,
              why: '<code>filter</code> keeps the items where the lambda says true, and gives back a list of them.',
            },
            frames: [
              { line: 1, say: 'Four days of step counts. One question per line.' },
              { line: 2, vars: { steps: '6200, 9100, 4800, 10400' } },
              { line: 3, vars: { bigDays: '9100, 10400' }, say: '<code>filter</code> runs the lambda for every item and keeps those where it gives true: over 8000.' },
              { line: 4, out: '[9100, 10400]', say: '<code>steps</code> itself is unchanged; <code>bigDays</code> is a new list.' },
              { line: 5, out: '[6, 9, 4, 10]', say: '<code>map</code> turns each item into a new one: thousands of steps. Whole-number division drops the rest.' },
              { line: 6, out: '30500', say: '<code>sum()</code> adds them all up.' },
              { line: 7, out: '1', say: '<code>count</code>: how many items match. Only 4800 is under 5000.' },
              { line: [8, 9], out: 'true\n[4800, 6200, 9100, 10400]', say: '<code>any</code>: at least one day reached 10000. <code>sortedBy</code>: a new list, smallest first.' },
            ],
          });
        },
        code: `fun main() {
    val prices = listOf(4, 12, 7, 20)
    println(prices.filter { it < 10 })          // [4, 7]
    println(prices.map { it * 2 })              // [8, 24, 14, 40]
    println(prices.all { it > 0 })              // true
    println(prices.filter { it < 10 }.sum())    // 11

    val ages = mapOf("Ada" to 36, "Sam" to 29, "Lin" to 41)
    val names = listOf("Ada", "Sam", "Lin")
    println(names.sortedBy { ages.getOrDefault(it, 0) })   // [Sam, Ada, Lin]
}`,
        play: `fun main() {
    val temps = listOf(14, 21, 9, 25, 18)
    val warm = temps.filter { it >= 20 }
    println("Warm days: $warm")
    val frost = temps.any { it <= 0 }
    println("Any frost? $frost")
    println("Coldest first: \${temps.sortedBy { it }}")
    // Change 20 to 15 and run again.
}`,
        remember: 'filter keeps, map changes each item, sum/count/any/all give one answer, sortedBy puts in order. Each gives back something new.',
        mistakes: [
          { title: 'Expecting filter to change the list', bad: 'val nums = listOf(1, 5, 8)\nnums.filter { it > 4 }\nprintln(nums)   // [1, 5, 8]', good: 'val big = nums.filter { it > 4 }\nprintln(big)    // [5, 8]', why: '<code>filter</code> and <code>map</code> give back a new list. Keep the result in a <code>val</code>.' },
        ],
        terms: [
          { term: 'filter', def: 'Gives a new list with only the items where the lambda gives true.' },
          { term: 'map (on a list)', def: 'Gives a new list where every item has been turned into something else by the lambda.' },
          { term: 'any / all', def: '<code>any</code>: does at least one item match? <code>all</code>: do they all match?' },
          { term: 'sortedBy', def: 'Gives a new list in order, smallest first, by the value the lambda picks for each item.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep only the even numbers, then add them up. It should print 14.', code: 'val nums = listOf(3, 4, 7, 10)\nval even = nums.[[filter]] { it % 2 == 0 }\nprintln(even.[[sum]]())', why: '<code>filter</code> keeps 4 and 10; <code>sum()</code> adds them.' },
          { type: 'bug', prompt: 'This should print <code>[2, 4, 6]</code>, every number doubled. Tap the wrong line.', code: 'fun main() {\n    val nums = listOf(1, 2, 3)\n    println(nums.filter { it * 2 })\n}', bug: 2, fix: '    println(nums.map { it * 2 })', why: '<code>filter</code> needs a true/false answer. To change every item, use <code>map</code>.' },
        ],
        quiz: [
          { q: 'What is <code>listOf(1, 2, 3, 4).filter { it &gt; 2 }</code>?', options: ['<code>[3, 4]</code>', '<code>[1, 2]</code>', '<code>2</code>'], a: 0, why: 'Only 3 and 4 are greater than 2. <code>filter</code> gives back a list, not a count.' },
          { q: 'What is <code>listOf(1, 2, 3).map { it + 10 }</code>?', options: ['<code>[11, 12, 13]</code>', '<code>36</code>', '<code>[1, 2, 3, 10]</code>'], a: 0, why: '<code>map</code> adds 10 to each item and keeps them all in a new list.' },
          { q: 'What is <code>listOf(5, 8, 12).all { it &gt; 6 }</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 1, why: '5 is not greater than 6, so not all items match. (<code>any</code> would be true.)' },
        ],
        docs: [['Filtering collections', 'https://kotlinlang.org/docs/collection-filtering.html'], ['Collection transformations', 'https://kotlinlang.org/docs/collection-transformations.html']],
      },

      {
        id: 'classes',
        title: 'Your own types: classes',
        tagline: 'Bundle related values into one thing with its own name.',
        goals: ['Make your own type with <code>class</code>', 'Create objects from a class', 'Read and change an object’s properties'],
        level: 'beginner', introduces: ['class'],
        body: `
<p>A game keeps track of players. Each player has a name and a score. With two players you already need four separate boxes, and it gets messy fast. A <em>class</em> lets you make your own type, <code>Player</code>, that keeps a name and a score together.</p>
<p><code>class Player(val name: String, var score: Int)</code> describes what every player has. It is a plan, like a blank form: it doesn’t make a player yet. The part in parentheses (round brackets) is the <em>constructor</em>: the values you must hand over to make one. Each <code>val</code> or <code>var</code> in it becomes a <em>property</em>, a box that belongs to the player.</p>
<p><code>val ada = Player("Ada", 0)</code> fills in the form and makes one real player, called an <em>object</em>. Reach inside it with a dot: <code>ada.name</code> is <code>"Ada"</code>. A <code>var</code> property can change: <code>ada.score += 10</code>. A <code>val</code> property can’t.</p>
<p>Class names start with a capital letter. A class goes outside <code>fun main() { }</code>, usually above it. You can make as many objects from one class as you like, and each keeps its own values.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Player(val name: String, var score: Int)

fun main() {
    val ada = Player("Ada", 0)
    val sam = Player("Sam", 5)
    ada.score += 10
    println(ada.score)
    println(sam.score)
}`,
            predict: {
              q: 'Only <code>ada.score</code> gets 10 more. What does the last line, <code>println(sam.score)</code>, print?',
              options: ['<code>5</code>', '<code>15</code>', '<code>10</code>'],
              a: 0,
              why: 'Ada and Sam are two separate objects. Changing one leaves the other alone.',
            },
            frames: [
              { line: 1, say: 'The plan: every <code>Player</code> has a name and a score. No player exists yet.' },
              { line: 4, vars: { 'ada.name': '"Ada"', 'ada.score': '0' }, say: '<code>Player("Ada", 0)</code> makes one player object. Its two properties are filled in, in order.' },
              { line: 5, vars: { 'sam.name': '"Sam"', 'sam.score': '5' }, say: 'A second object from the same class, with its own values.' },
              { line: 6, vars: { 'ada.score': '10' }, say: 'The dot reaches inside <code>ada</code>. Only Ada’s score changes.' },
              { line: 7, out: '10' },
              { line: 8, out: '5', say: 'Sam’s score is still 5. Each object keeps its own properties.' },
            ],
          });
        },
        code: `class City(val name: String, val population: Int)

fun main() {
    val city = City("Oslo", 709000)
    println(city.name)          // Oslo
    println(city.population)    // 709000
}`,
        play: `class Pet(val name: String, var age: Int)

fun main() {
    val pet = Pet("Rex", 3)
    println("\${pet.name} is \${pet.age}")
    pet.age += 1
    println("\${pet.name} is now \${pet.age}")
    // Make a second Pet with your own name and age, and print it too.
}`,
        remember: 'class Name(val a: Type, var b: Type) is the plan; Name(x, y) makes an object; object.a reads a property.',
        mistakes: [
          { title: 'Changing a val property', bad: `class Pet(val name: String, var age: Int)

val pet = Pet("Rex", 3)
pet.name = "Max"   // error: 'val' cannot be reassigned.`, good: `class Pet(var name: String, var age: Int)

val pet = Pet("Rex", 3)
pet.name = "Max"   // fine`, why: 'A <code>val</code> property is set once, when the object is made. Use <code>var</code> for a property that must change.' },
        ],
        terms: [
          { term: 'class', def: 'A plan for your own type: which properties every object of that type has.' },
          { term: 'object', def: 'One real thing made from a class, like <code>Player("Ada", 0)</code>.' },
          { term: 'property', def: 'A value that belongs to an object, read with a dot: <code>ada.name</code>.' },
          { term: 'constructor', def: 'The parentheses after the class name: the values needed to make an object.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Describe a Song, make one, and print its title.', code: `[[class]] Song(val title: String, val minutes: Int)

fun main() {
    val song = Song("Rain", 4)
    println(song.[[title]])
}`, why: '<code>class</code> starts the plan. A dot and the property name read a value from the object.' },
          { type: 'bug', prompt: 'The lamp should switch on, but Kotlin says <code>\'val\' cannot be reassigned.</code> Tap the line that needs to change.', code: `class Lamp(val room: String, val on: Boolean)

fun main() {
    val lamp = Lamp("Kitchen", false)
    lamp.on = true
    println(lamp.on)
}`, bug: 0, fix: 'class Lamp(val room: String, var on: Boolean)', why: 'The error shows up where <code>on</code> is changed, but the fix is in the class: a property that changes must be a <code>var</code>.' },
        ],
        quiz: [
          { q: 'Given <code>class Dog(val name: String)</code>, how do you make a dog?', options: ['<code>Dog("Rex")</code>', '<code>class Dog("Rex")</code>', '<code>Dog.name = "Rex"</code>'], a: 0, why: 'Write the class name and pass the constructor values in parentheses.' },
          { q: '<code>class Counter(var count: Int)</code>. After <code>val a = Counter(0)</code>, <code>val b = Counter(0)</code> and <code>a.count += 1</code>, what is <code>b.count</code>?', options: ['<code>0</code>', '<code>1</code>', '<code>2</code>'], a: 0, why: '<code>a</code> and <code>b</code> are separate objects, each with its own <code>count</code>.' },
          { q: '<code>class Car(val color: String, var km: Int)</code> and <code>val car = Car("red", 0)</code>. Which line compiles?', options: ['<code>car.km = 100</code>', '<code>car.color = "blue"</code>', 'Both'], a: 0, why: '<code>km</code> is a <code>var</code>, so it can change. <code>color</code> is a <code>val</code>.' },
        ],
        docs: [['Classes', 'https://kotlinlang.org/docs/classes.html']],
      },

      {
        id: 'methods',
        title: 'Functions inside a class',
        tagline: 'Objects can do things, not only hold values.',
        goals: ['Write a function inside a class', 'Call it on an object with a dot', 'Use <code>this</code> to mean the object itself'],
        level: 'beginner', introduces: ['this'],
        body: `
<p>A player doesn’t only have a score; a player wins points. Instead of writing <code>ada.score += 10</code> all over the program, you can teach the <code>Player</code> class how to win, once, and then ask any player to do it: <code>ada.win(10)</code>.</p>
<p>Give the class a body in curly brackets, and write a function inside it. A function inside a class is called a <em>member function</em> (or <em>method</em>). Call it on an object with a dot, like a property, plus the parentheses and arguments. Inside it, <code>score</code> means the score of the object you called it on.</p>
<p>That is how objects keep their own <em>state</em>: <code>ada.win(10)</code> changes Ada’s score, <code>sam.win(3)</code> changes Sam’s, and each one remembers its value between calls.</p>
<p>Inside a member function, <code>this</code> means “the object this function was called on”. You need it when a parameter has the same name as a property: in <code>fun rename(name: String) { this.name = name }</code>, <code>this.name</code> is the property and <code>name</code> is the parameter.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Player(val name: String, var score: Int) {
    fun win(points: Int) {
        score += points
        println("$name: $score")
    }
}

fun main() {
    val ada = Player("Ada", 0)
    val sam = Player("Sam", 0)
    ada.win(10)
    sam.win(3)
    ada.win(5)
}`,
            predict: {
              q: 'What does the last call, <code>ada.win(5)</code>, print?',
              options: ['<code>Ada: 5</code>', '<code>Ada: 15</code>', '<code>Ada: 18</code>'],
              a: 1,
              why: 'Ada still has the 10 from her first win. Sam’s 3 points belong to Sam.',
            },
            frames: [
              { line: 1, say: '<code>Player</code> now has a body in <code>{ }</code>. Inside it, the function <code>win</code>: something every player can do.' },
              { line: [9, 10], vars: { 'ada.score': '0', 'sam.score': '0' }, say: 'Two players, both starting at 0.' },
              { line: 11, say: '<code>ada.win(10)</code>: run <code>win</code> for Ada. Inside it, <code>score</code> means Ada’s score.' },
              { line: [3, 4], vars: { 'ada.score': '10' }, out: 'Ada: 10' },
              { line: 12, say: 'Same function, other object. Now <code>score</code> means Sam’s score.' },
              { line: [3, 4], vars: { 'sam.score': '3' }, out: 'Sam: 3' },
              { line: [13, 3, 4], vars: { 'ada.score': '15' }, out: 'Ada: 15', say: 'Ada kept her 10. Each object remembers its own state between calls.' },
            ],
          });
        },
        code: `class Player(var name: String, var score: Int) {
    fun rename(name: String) {
        this.name = name     // this.name: the property. name: the parameter.
    }
    fun addPoints(points: Int) {
        score += points
    }
}

fun main() {
    val p = Player("Lin", 0)
    p.rename("Lina")
    p.addPoints(7)
    println("\${p.name} has \${p.score}")   // Lina has 7
}`,
        play: `class Pet(val name: String, var hunger: Int) {
    fun feed(food: Int) {
        hunger -= food
        println("$name ate. Hunger: $hunger")
    }
}

fun main() {
    val rex = Pet("Rex", 10)
    rex.feed(3)
    rex.feed(2)
    // Make a second pet and feed it. Does Rex's hunger change?
}`,
        remember: 'A function inside a class works on the object it is called on: object.doSomething(). this means that object.',
        mistakes: [
          { title: 'Forgetting this when the names match', bad: `fun rename(name: String) {
    name = name   // error: 'val' cannot be reassigned.
}`, good: `fun rename(name: String) {
    this.name = name
}`, why: 'Without <code>this</code>, both names mean the parameter, and a parameter can’t be changed. <code>this.name</code> points at the property.' },
        ],
        terms: [
          { term: 'member function', def: 'A function written inside a class and called on an object: <code>ada.win(10)</code>. Also called a method.' },
          { term: 'this', def: 'Inside a class: the object the function was called on.' },
          { term: 'state', def: 'The current values of an object’s properties. Each object keeps its own.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Give the light a function that switches it on, then call it.', code: `class Light(var isOn: Boolean) {
    [[fun]] switchOn() {
        isOn = true
    }
}

fun main() {
    val light = Light(false)
    light.[[switchOn]]()
    println(light.isOn)   // true
}`, why: 'A member function starts with <code>fun</code> like any function. Call it on the object with a dot.' },
          { type: 'bug', prompt: '<code>change</code> should store the new number, but it doesn’t compile. Tap the line.', code: `class Score(var points: Int) {
    fun change(points: Int) {
        points = points
    }
}`, bug: 2, fix: '        this.points = points', why: 'The parameter and the property share a name. <code>this.points</code> is the property; plain <code>points</code> is the parameter.' },
        ],
        quiz: [
          { q: '<code>class Cup(var ml: Int) { fun fill() { ml = 250 } }</code>. After <code>val a = Cup(0)</code>, <code>val b = Cup(0)</code> and <code>a.fill()</code>, what is <code>b.ml</code>?', options: ['<code>0</code>', '<code>250</code>', '<code>500</code>'], a: 0, why: '<code>fill</code> ran on <code>a</code>, so only <code>a.ml</code> changed.' },
          { q: 'Inside a member function, what does <code>this</code> mean?', options: ['The object the function was called on', 'The class itself, for every object at once', 'The <code>main</code> function'], a: 0, why: 'In <code>ada.win(10)</code>, <code>this</code> is <code>ada</code>.' },
          { q: 'How do you call <code>fill</code> on the cup <code>a</code>?', options: ['<code>a.fill()</code>', '<code>fill(a)</code>', '<code>Cup.fill()</code>'], a: 0, why: 'The object, a dot, then the function call.' },
        ],
        docs: [['Classes', 'https://kotlinlang.org/docs/classes.html'], ['This expressions', 'https://kotlinlang.org/docs/this-expressions.html']],
      },

      {
        id: 'encapsulation-basics',
        title: 'Hiding the inside',
        tagline: 'private: let a class guard its own data.',
        goals: ['Hide a class’s data with <code>private</code>', 'Let others read but not change with <code>private set</code>', 'Change data only through checking functions'],
        level: 'beginner', introduces: ['private', 'set'],
        body: `
<p>A wallet holds money. If any line of the program can write <code>wallet.balance = -500</code>, one slip anywhere breaks it, and you have to search the whole program to find who did it. Better: only the wallet changes its balance, through functions that check the amount first.</p>
<p>This <code>Wallet</code> has its property inside the class body, <code>var balance = 0</code>, instead of in the parentheses: every wallet starts at 0, so there is nothing to pass in. With no constructor values, make one with empty parentheses: <code>Wallet()</code>.</p>
<p><code>private</code> in front of a property or function means: only code inside this class can use it. Use it from outside the class and Kotlin refuses with a compile error that starts <code>Cannot access</code>. Keeping the inside hidden like this is called <em>encapsulation</em>.</p>
<p>Often others may read a value but not change it. <code>set</code> is the part of a property that changes its value. Put <code>private set</code> on the line under a <code>var</code> property: anyone can read <code>wallet.balance</code>, but only the class can change it. Reading the property is all you need; Kotlin doesn’t need a separate “get the balance” function.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Wallet {
    var balance = 0
        private set

    fun add(amount: Int) {
        if (amount > 0) {
            balance += amount
        }
    }
}

fun main() {
    val w = Wallet()
    w.add(20)
    w.add(-500)
    println(w.balance)
}`,
            predict: {
              q: 'Someone tries <code>w.add(-500)</code>. What does the last line print?',
              options: ['<code>20</code>', '<code>-480</code>', 'An error'],
              a: 0,
              why: '<code>add</code> only accepts amounts above 0, and nothing outside can change <code>balance</code> directly.',
            },
            frames: [
              { line: [2, 3], say: '<code>balance</code> starts at 0. <code>private set</code>: anyone can read it, only <code>Wallet</code>’s own code can change it.' },
              { line: 13, vars: { 'w.balance': '0' }, say: '<code>Wallet()</code> makes a wallet. No constructor values, so the parentheses are empty.' },
              { line: [14, 6], say: '<code>add</code> checks the amount first. Is 20 above 0? Yes.' },
              { line: 7, vars: { 'w.balance': '20' }, say: 'Code inside the class may change <code>balance</code>.' },
              { line: [15, 6], say: 'Is -500 above 0? No, so nothing changes. The wallet guards itself.' },
              { line: 16, out: '20', say: 'Reading <code>balance</code> from outside is fine. Writing <code>w.balance = -500</code> here would not compile.' },
            ],
          });
        },
        code: `class Door(private val code: Int) {
    var isOpen = false
        private set

    fun unlock(guess: Int) {
        if (guess == code) {
            isOpen = true
        }
    }
}

fun main() {
    val door = Door(1234)
    door.unlock(1111)
    println(door.isOpen)   // false
    door.unlock(1234)
    println(door.isOpen)   // true
    // println(door.code) would not compile: code is private
}`,
        play: `class Counter {
    var count = 0
        private set

    fun add() {
        count += 1
    }
}

fun main() {
    val clicks = Counter()
    clicks.add()
    clicks.add()
    println(clicks.count)
    // Add the line  clicks.count = 100  above println, run it and read the error.
}`,
        remember: 'private: only the class itself can use it. private set under a var: everyone can read it, only the class can change it.',
        mistakes: [
          { title: 'Leaving important state open', bad: `class Wallet {
    var balance = 0
}

val wallet = Wallet()
wallet.balance = -500   // allowed: the wallet is broken`, good: `class Wallet {
    var balance = 0
        private set
}

val wallet = Wallet()
wallet.balance = -500   // does not compile`, why: 'When only the class can change a value, every change goes through its own functions, which can check it.' },
        ],
        terms: [
          { term: 'private', def: 'Only code inside the same class can use this property or function.' },
          { term: 'private set', def: 'Written under a <code>var</code> property: anyone can read it, only the class can change it.' },
          { term: 'encapsulation', def: 'Keeping an object’s inside hidden, so outside code goes through its functions.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let everyone read <code>points</code>, but only the class change it.', code: `class Score {
    var points = 0
        [[private]] [[set]]

    fun win() {
        points += 10
    }
}`, why: '<code>private set</code> under a <code>var</code> keeps reading open and changing private.' },
          { type: 'bug', prompt: 'This doesn’t compile: <code>Cannot access \'sold\': it is private in \'Ticket\'.</code> Tap the line that breaks the rule.', code: `class Ticket(val price: Int) {
    var sold = false
        private set

    fun sell() {
        sold = true
    }
}

fun main() {
    val t = Ticket(12)
    t.sold = true
    println(t.sold)
}`, bug: 11, fix: '    t.sell()', why: 'Only <code>Ticket</code> may change <code>sold</code>. Outside code asks the ticket to do it, with <code>sell()</code>.' },
        ],
        quiz: [
          { q: 'Inside <code>class Phone</code> there is <code>private var pin = 0</code>. Where can <code>pin</code> be used?', options: ['Only inside <code>Phone</code>', 'Anywhere in the program', 'Only in <code>main</code>'], a: 0, why: '<code>private</code> limits it to the class it is written in.' },
          { q: '<code>var level = 1</code> with <code>private set</code> under it, in <code>class Game</code>. Outside, what does <code>println(game.level)</code> do?', options: ['Prints <code>1</code>', 'Compile error', 'Prints nothing'], a: 0, why: 'Only changing is private. Reading is open to everyone.' },
          { q: 'Why make a property private?', options: ['So every change goes through the class’s own functions', 'It makes the program run faster', 'Kotlin requires it for every property'], a: 0, why: 'The class can check each change and keep its data valid.' },
        ],
        docs: [['Visibility modifiers', 'https://kotlinlang.org/docs/visibility-modifiers.html'], ['Properties', 'https://kotlinlang.org/docs/properties.html']],
      },

      {
        id: 'data-classes',
        title: 'Data classes',
        tagline: 'One word gives you printing, comparing and copying.',
        goals: ['Make a class that only holds values with <code>data</code>', 'Print and compare objects by their values', 'Make a changed copy with <code>copy</code>'],
        level: 'beginner', introduces: ['data', 'copy', 'equals'],
        body: `
<p>Many classes exist only to hold values: a point on a map, a contact, a song. You want to print them and compare them. With a plain class, <code>println(point)</code> prints something like <code>Point@6d06d69c</code> (the class name and a code number), and two points with the same numbers are not <code>==</code>, because they are two different objects.</p>
<p>Put <code>data</code> in front: <code>data class Point(val x: Int, val y: Int)</code>. Kotlin then writes some functions for you. <code>toString</code> turns the object into readable text, <code>Point(x=1, y=2)</code>, and <code>println</code> uses it. <code>equals</code> makes <code>==</code> compare the property values, so two points with the same numbers are equal.</p>
<p>You also get <code>copy</code>: it makes a new object with the same values, changing only the ones you name. <code>point.copy(y = 5)</code> uses a named argument, as with default arguments earlier. The original stays as it was.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `data class Point(val x: Int, val y: Int)

fun main() {
    val a = Point(1, 2)
    val b = Point(1, 2)
    println(a)
    println(a == b)
    val c = a.copy(y = 5)
    println(c)
}`,
            predict: {
              q: '<code>a</code> and <code>b</code> are two objects with the same numbers. What does <code>a == b</code> print?',
              options: ['<code>true</code>', '<code>false</code>', 'An error'],
              a: 0,
              why: 'In a data class, <code>==</code> compares the property values, and they match.',
            },
            frames: [
              { line: 1, say: 'The word <code>data</code> asks Kotlin to write printing, comparing and copying for this class.' },
              { line: [4, 5], vars: { a: 'Point(x=1, y=2)', b: 'Point(x=1, y=2)' }, say: 'Two separate objects that hold the same values.' },
              { line: 6, out: 'Point(x=1, y=2)', say: 'Printing shows the class name and every property. That is <code>toString</code> at work.' },
              { line: 7, out: 'true', say: '<code>equals</code> compares x with x and y with y. All match, so <code>true</code>.' },
              { line: 8, vars: { c: 'Point(x=1, y=5)' }, say: '<code>copy</code>: a new point, same <code>x</code>, new <code>y</code>. <code>a</code> doesn’t change.' },
              { line: 9, out: 'Point(x=1, y=5)' },
            ],
          });
        },
        code: `data class Contact(val name: String, val city: String)

fun main() {
    val ada = Contact("Ada", "Lisbon")
    println(ada)                      // Contact(name=Ada, city=Lisbon)
    val moved = ada.copy(city = "Oslo")
    println(moved)                    // Contact(name=Ada, city=Oslo)
    println(ada == moved)             // false
}`,
        play: `data class Song(val title: String, val minutes: Int)

fun main() {
    val first = Song("Rain", 4)
    val second = Song("Rain", 4)
    println(first)
    println(first == second)
    // Delete the word data on the first line, run again and compare.
}`,
        remember: 'data class: readable printing (toString), == compares values (equals), and copy(name = value) for a changed copy.',
        mistakes: [
          { title: 'Comparing plain classes', bad: `class Point(val x: Int, val y: Int)

println(Point(1, 2) == Point(1, 2))   // false`, good: `data class Point(val x: Int, val y: Int)

println(Point(1, 2) == Point(1, 2))   // true`, why: 'A plain class only counts the very same object as equal. A data class compares the values.' },
        ],
        terms: [
          { term: 'data class', def: 'A class for holding values. Kotlin writes <code>toString</code>, <code>equals</code> and <code>copy</code> for it.' },
          { term: 'toString', def: 'Turns an object into text. <code>println</code> uses it.' },
          { term: 'equals', def: 'Decides whether two objects are equal. <code>==</code> uses it.' },
          { term: 'copy', def: 'Makes a new object with the same values, except the ones you name.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a bigger tea: the same item with a new price.', code: `[[data]] class Item(val name: String, val price: Int)

fun main() {
    val tea = Item("Tea", 3)
    val bigTea = tea.[[copy]](price = 5)
    println(bigTea)   // Item(name=Tea, price=5)
}`, why: '<code>data</code> gives the class <code>copy</code>; name the property you want to change.' },
          { type: 'bug', prompt: 'This should print <code>true</code>, but it prints <code>false</code>. Tap the line.', code: `class Color(val r: Int, val g: Int, val b: Int)

fun main() {
    val red = Color(255, 0, 0)
    println(red == Color(255, 0, 0))
}`, bug: 0, fix: 'data class Color(val r: Int, val g: Int, val b: Int)', why: 'Only a data class compares property values with <code>==</code>.' },
        ],
        quiz: [
          { q: '<code>data class Cat(val name: String, val age: Int)</code>. What does <code>println(Cat("Tom", 2))</code> print?', options: ['<code>Cat(name=Tom, age=2)</code>', '<code>Cat@1b6d3586</code>', '<code>Tom 2</code>'], a: 0, why: 'A data class prints its name and each property with its value.' },
          { q: '<code>val a = Cat("Tom", 2)</code>, then <code>val b = a.copy(age = 3)</code>. What is <code>a.age</code> now?', options: ['<code>2</code>', '<code>3</code>', 'An error'], a: 0, why: '<code>copy</code> makes a new object. The original keeps its values.' },
          { q: 'With the data class <code>Cat</code>, what is <code>Cat("Tom", 2) == Cat("Tom", 2)</code>?', options: ['<code>true</code>', '<code>false</code>'], a: 0, why: 'Same values in every property, so they are equal.' },
        ],
        docs: [['Data classes', 'https://kotlinlang.org/docs/data-classes.html']],
      },

      {
        id: 'enums',
        title: 'A fixed set of choices',
        tagline: 'enum class: a type with a short, fixed list of values.',
        goals: ['Make a type with a fixed list of values', 'Use an entry with a dot, like <code>Light.GREEN</code>', 'Cover every entry in a <code>when</code> without <code>else</code>'],
        level: 'beginner', introduces: ['enum'],
        body: `
<p>A traffic light is red, yellow or green. Nothing else. If you store it as text, a typo like <code>"gren"</code> compiles fine and quietly breaks the program. An <em>enum class</em> lists the only values allowed, and Kotlin rejects anything else.</p>
<p><code>enum class Light { RED, YELLOW, GREEN }</code> makes a type, <code>Light</code>, with exactly three values. Each one is called an <em>entry</em>, and by habit entries are written in capitals. Use one with a dot: <code>val now = Light.GREEN</code>. A typo such as <code>Light.GREN</code> is a compile error: <code>Unresolved reference 'GREN'.</code> Printing an entry prints its name: <code>GREEN</code>.</p>
<p><code>when</code> fits enums well: one case per entry. When the cases cover every entry, Kotlin knows nothing else can happen, so a <code>when</code> that gives back a value needs no <code>else</code>. Such a <code>when</code> is called <em>exhaustive</em>. If you add a new entry later, Kotlin points at every <code>when</code> that is now missing a case.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `enum class Light { RED, YELLOW, GREEN }

fun action(light: Light): String {
    return when (light) {
        Light.RED -> "Stop"
        Light.YELLOW -> "Wait"
        Light.GREEN -> "Go"
    }
}

fun main() {
    val now = Light.GREEN
    println(action(now))
    println(now)
}`,
            predict: {
              q: 'What does the last line, <code>println(now)</code>, print?',
              options: ['<code>GREEN</code>', '<code>Light.GREEN</code>', '<code>2</code>'],
              a: 0,
              why: 'Printing an entry prints its name, without the type in front.',
            },
            frames: [
              { line: 1, say: 'A new type, <code>Light</code>, with three entries. No other light can exist.' },
              { line: 12, vars: { now: 'Light.GREEN' }, say: '<code>now</code> holds one entry. Its type is <code>Light</code>.' },
              { line: [13, 4], say: '<code>action</code> gets the light, and <code>when</code> compares it with each entry from the top.' },
              { line: [5, 6], say: 'Not <code>RED</code>, not <code>YELLOW</code>.' },
              { line: 7, say: '<code>GREEN</code> matches. No <code>else</code> is needed: the three cases cover every possible <code>Light</code>.' },
              { line: 13, out: 'Go' },
              { line: 14, out: 'GREEN', say: 'Printing an entry prints its name.' },
            ],
          });
        },
        code: `enum class Size { SMALL, MEDIUM, LARGE }

fun price(size: Size): Int {
    return when (size) {
        Size.SMALL -> 2
        Size.MEDIUM -> 3
        Size.LARGE -> 4
    }
}

fun main() {
    val order = Size.MEDIUM
    println("$order costs \${price(order)} euros")   // MEDIUM costs 3 euros
}`,
        play: `enum class Weather { SUNNY, RAINY, SNOWY }

fun main() {
    val today = Weather.RAINY
    val advice = when (today) {
        Weather.SUNNY -> "Take sunglasses"
        Weather.RAINY -> "Take an umbrella"
        Weather.SNOWY -> "Take boots"
    }
    println(advice)
    // Add WINDY to the list on the first line and run: Kotlin says which case is missing.
}`,
        remember: 'enum class Name { A, B, C } is a type with only those values. A when that covers every entry needs no else.',
        mistakes: [
          { title: 'Using text for a fixed set of choices', bad: `val size = "medim"   // typo, but no error
val price = when (size) {
    "small" -> 2
    "medium" -> 3
    else -> 4          // the typo quietly lands here
}`, good: `val size = Size.MEDIUM   // a typo here will not compile
val price = when (size) {
    Size.SMALL -> 2
    Size.MEDIUM -> 3
    Size.LARGE -> 4
}`, why: 'With an enum, Kotlin knows every allowed value, so it catches typos and missing cases before the program runs.' },
        ],
        terms: [
          { term: 'enum class', def: 'A type with a fixed list of values, such as <code>enum class Light { RED, YELLOW, GREEN }</code>.' },
          { term: 'entry', def: 'One value of an enum class, used with a dot: <code>Light.RED</code>.' },
          { term: 'exhaustive', def: 'A <code>when</code> that covers every possible value, so it needs no <code>else</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make a type for the four directions and pick one.', code: `[[enum]] class Direction { NORTH, SOUTH, EAST, WEST }

fun main() {
    val way = [[Direction]].NORTH
    println(way)   // NORTH
}`, why: '<code>enum class</code> lists the entries. Use one as <code>Type.ENTRY</code>.' },
          { type: 'bug', prompt: 'This doesn’t compile: <code>\'when\' expression must be exhaustive. Add the \'HARD\' branch or an \'else\' branch.</code> Tap the line.', code: `enum class Level { EASY, HARD }

fun main() {
    val level = Level.HARD
    val lives = when (level) {
        Level.EASY -> 5
        Level.EASY -> 3
    }
    println(lives)
}`, bug: 6, fix: '        Level.HARD -> 3', why: '<code>EASY</code> is listed twice and <code>HARD</code> not at all. Cover every entry and the <code>when</code> is complete.' },
        ],
        quiz: [
          { q: '<code>enum class Coin { HEADS, TAILS }</code>. Which line is valid?', options: ['<code>val c = Coin.HEADS</code>', '<code>val c = Coin("HEADS")</code>', '<code>val c = HEADS</code>'], a: 0, why: 'Entries are used with the type name and a dot. You don’t create new ones.' },
          { q: 'A <code>when</code> that gives back a value covers every entry of an enum. Does it need <code>else</code>?', options: ['No', 'Yes, always'], a: 0, why: 'Kotlin can see that every possible value is handled.' },
          { q: 'What does <code>println(Coin.TAILS)</code> print?', options: ['<code>TAILS</code>', '<code>Coin.TAILS</code>', '<code>1</code>'], a: 0, why: 'An entry prints as its name.' },
        ],
        docs: [['Enum classes', 'https://kotlinlang.org/docs/enum-classes.html']],
      },

      {
        id: 'inheritance',
        title: 'Building on a class',
        tagline: 'A new class can start from an existing one and change what it needs.',
        goals: ['Build a class on another with <code>open</code> and <code>:</code>', 'Change a parent’s function with <code>override</code>', 'Run the parent’s version with <code>super</code>'],
        level: 'intermediate', introduces: ['open', 'override', 'super'],
        body: `
<p>A game has animals: dogs, cats, birds. Every animal has a name and can eat, but each one makes its own sound. Writing <code>name</code> and <code>eat</code> again in every class repeats code. <em>Inheritance</em> lets a new class build on an existing one and get everything it has.</p>
<p>In Kotlin a class is closed by default: nothing can build on it. Mark the parent with <code>open</code>: <code>open class Animal(val name: String)</code>. Then <code>class Dog(name: String) : Animal(name)</code> reads “a Dog is an Animal”. Animal is the <em>parent</em> class, Dog the <em>child</em> class. The <code>: Animal(name)</code> part passes the name up to Animal’s constructor. Dog’s own <code>name</code> has no <code>val</code>: it is only passed along, because Animal already makes the property.</p>
<p>Dog now has <code>name</code> and every function Animal has. To change one, the parent marks it <code>open fun sound()</code> and the child writes its own <code>override fun sound()</code>. On a Dog, Kotlin runs Dog’s version. Inside an override, <code>super.sound()</code> runs the parent’s version, in case you want to add to it rather than replace it.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `open class Animal(val name: String) {
    open fun sound(): String {
        return "(quiet)"
    }
    fun eat() {
        println("$name eats")
    }
}

class Dog(name: String) : Animal(name) {
    override fun sound(): String {
        return "Woof"
    }
}

fun main() {
    val rex = Dog("Rex")
    rex.eat()
    println(rex.sound())
}`,
            predict: {
              q: 'Animal and Dog both have a <code>sound</code>. What does <code>println(rex.sound())</code> print?',
              options: ['<code>Woof</code>', '<code>(quiet)</code>', 'Both, on two lines'],
              a: 0,
              why: 'Dog overrides <code>sound</code>, so a Dog uses its own version.',
            },
            frames: [
              { line: 1, say: '<code>open</code>: other classes may build on Animal. Every Animal has a name, a sound and can eat.' },
              { line: 10, say: '<code>: Animal(name)</code>: a Dog is an Animal. It passes its name up to Animal.' },
              { line: 17, vars: { 'rex.name': '"Rex"' }, say: 'A Dog object. Its <code>name</code> property comes from Animal.' },
              { line: [18, 6], out: 'Rex eats', say: 'Dog never wrote <code>eat</code>. It inherited it from Animal.' },
              { line: [19, 11], say: 'Dog overrides <code>sound</code>, so Kotlin runs Dog’s version, not Animal’s.' },
              { line: 19, out: 'Woof' },
            ],
          });
        },
        code: `open class Greeter {
    open fun greet() {
        println("Hello")
    }
}

class LoudGreeter : Greeter() {
    override fun greet() {
        super.greet()        // run Greeter's version first
        println("HELLO!")
    }
}

fun main() {
    val g = LoudGreeter()
    g.greet()
    // Hello
    // HELLO!
}`,
        play: `open class Vehicle(val wheels: Int) {
    open fun describe(): String {
        return "A vehicle with $wheels wheels"
    }
}

class Bike : Vehicle(2) {
    override fun describe(): String {
        return "A bike: " + super.describe()
    }
}

fun main() {
    println(Bike().describe())
    // Write class Car : Vehicle(4) with its own describe, and print it too.
}`,
        remember: 'open class Parent, then class Child : Parent(). Mark a function open in the parent to override it in the child; super calls the parent’s version.',
        mistakes: [
          { title: 'Forgetting open', bad: `class Animal(val name: String)
class Dog(name: String) : Animal(name)
// error: This type is final, so it cannot be extended.`, good: `open class Animal(val name: String)
class Dog(name: String) : Animal(name)`, why: 'Classes are closed (final) unless you mark them <code>open</code>. The same goes for functions you want to override.' },
        ],
        terms: [
          { term: 'inheritance', def: 'Making a new class from an existing one, so it gets the parent’s properties and functions.' },
          { term: 'open', def: 'Allows a class to be built on, or a function to be overridden.' },
          { term: 'override', def: 'Replaces an open function from the parent with the child’s own version.' },
          { term: 'super', def: 'Inside the child: the parent’s version, as in <code>super.greet()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let Square build on Shape and give its own name.', code: `[[open]] class Shape {
    open fun name(): String {
        return "shape"
    }
}

class Square : Shape() {
    [[override]] fun name(): String {
        return "square"
    }
}`, why: 'The parent must be <code>open</code>; the child marks its own version with <code>override</code>.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'move\' in \'Bird\' is final and cannot be overridden.</code> Tap the line to fix.', code: `open class Bird {
    fun move(): String {
        return "flies"
    }
}

class Penguin : Bird() {
    override fun move(): String {
        return "walks"
    }
}`, bug: 1, fix: '    open fun move(): String {', why: 'A function can only be overridden if the parent marks it <code>open</code>.' },
        ],
        quiz: [
          { q: '<code>class Base</code> has no <code>open</code>. Does <code>class Child : Base()</code> compile?', options: ['No: classes are closed unless marked open', 'Yes'], a: 0, why: 'Kotlin classes are final by default.' },
          { q: 'Dog overrides <code>sound()</code> from Animal. <code>val d = Dog("Rex")</code>. Which version does <code>d.sound()</code> run?', options: ['Dog’s', 'Animal’s', 'Both'], a: 0, why: 'The object is a Dog, so its own override runs.' },
          { q: 'Inside an override, what does <code>super.greet()</code> do?', options: ['Runs the parent’s <code>greet</code>', 'Runs the override again', 'Makes a new parent object'], a: 0, why: '<code>super</code> means the parent’s version of the function.' },
        ],
        docs: [['Inheritance', 'https://kotlinlang.org/docs/inheritance.html']],
      },

      {
        id: 'interfaces',
        title: 'Promises a class keeps',
        tagline: 'interface: different classes, one shared promise.',
        goals: ['Write a promise as an <code>interface</code>', 'Make a class keep it with <code>override</code>', 'Treat different classes the same through one interface'],
        level: 'intermediate', introduces: ['interface'],
        body: `
<p>A music app plays songs, podcasts and radio. They are very different things, but the player button needs only one promise from each: “I can play.” An <em>interface</em> is that promise, written down.</p>
<p><code>interface Speaker { fun speak(): String }</code> lists a function with no body: it says what, not how. A class keeps the promise with <code>: Speaker</code> and writes the function itself, marked <code>override</code>. No parentheses after <code>Speaker</code>: an interface has no constructor. Keeping the promise is called <em>implementing</em> the interface. If the class forgets a promised function, it doesn’t compile.</p>
<p>An interface is also a type. A function with a <code>Speaker</code> parameter accepts any class that keeps the promise, and one list can hold dogs and robots together. Call <code>speak()</code> on each item and each runs its own version.</p>
<p>The difference from inheritance: a class has at most one parent class, but it can keep several interfaces, separated by commas.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `interface Speaker {
    fun speak(): String
}

class Dog : Speaker {
    override fun speak() = "Woof"
}

class Robot : Speaker {
    override fun speak() = "Beep"
}

fun main() {
    val team = listOf(Dog(), Robot(), Dog())
    for (member in team) {
        println(member.speak())
    }
}`,
            predict: {
              q: 'The list mixes Dogs and a Robot. What does the loop print?',
              options: ['<code>Woof</code>, <code>Beep</code>, <code>Woof</code>', 'An error: a list can’t mix classes', '<code>Woof</code> three times'],
              a: 0,
              why: 'All three are Speakers, so they fit in one list, and each one runs its own <code>speak</code>.',
            },
            frames: [
              { line: [1, 2], say: 'The promise: every Speaker can <code>speak()</code> and gives back a String. No body here.' },
              { line: [5, 6], say: 'Dog keeps the promise: <code>: Speaker</code>, then its own <code>speak</code> with <code>override</code>.' },
              { line: [9, 10], say: 'Robot is a very different class, but it keeps the same promise.' },
              { line: 14, vars: { team: '[Dog, Robot, Dog]' }, say: 'One list, different classes. Kotlin sees them all as Speakers.' },
              { line: 16, vars: { member: 'Dog' }, out: 'Woof', say: '<code>member</code> is a Dog, so Dog’s <code>speak</code> runs.' },
              { line: 16, vars: { member: 'Robot' }, out: 'Beep', say: 'Same line of code, a Robot this time: Robot’s version runs.' },
              { line: 16, vars: { member: 'Dog' }, out: 'Woof' },
            ],
          });
        },
        code: `interface Shape {
    fun area(): Double
}

class Square(val side: Double) : Shape {
    override fun area() = side * side
}

class Circle(val radius: Double) : Shape {
    override fun area() = 3.14 * radius * radius
}

fun report(shape: Shape) {
    println("Area: \${shape.area()}")
}

fun main() {
    report(Square(2.0))   // Area: 4.0
    report(Circle(1.0))   // Area: 3.14
}`,
        play: `interface Greeter {
    fun greet(name: String): String
}
class English : Greeter {
    override fun greet(name: String) = "Hello, $name"
}
class Spanish : Greeter {
    override fun greet(name: String) = "Hola, $name"
}
fun main() {
    for (g in listOf(English(), Spanish())) {
        println(g.greet("Ada"))
    }
    // Add a class Norwegian that says "Hei, $name" and put it in the list.
}`,
        remember: 'interface lists what a class promises to do. class X : TheInterface keeps it with override. Code that needs the interface accepts any class that keeps it.',
        mistakes: [
          { title: 'Promising but not delivering', bad: `class Cat : Speaker { }
// error: Class 'Cat' is not abstract and does not implement abstract member: fun speak(): String`, good: `class Cat : Speaker {
    override fun speak() = "Meow"
}`, why: 'An “abstract member” is a promised function with no body. The error means: Cat promised <code>speak</code> but never wrote it. Every function in the interface needs an <code>override</code>.' },
        ],
        terms: [
          { term: 'interface', def: 'A list of functions a class promises to have, without saying how they work.' },
          { term: 'implement', def: 'To keep an interface’s promise: <code>class Dog : Speaker</code> plus an <code>override</code> for each function.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Write the promise, then let Cow keep it.', code: `[[interface]] Animal {
    fun sound(): String
}

class Cow : [[Animal]] {
    override fun sound() = "Moo"
}`, why: '<code>interface</code> writes the promise; <code>: Animal</code> says Cow keeps it.' },
          { type: 'bug', prompt: 'Kotlin says <code>\'draw\' hides member of supertype \'Drawable\' and needs an \'override\' modifier.</code> Tap the line.', code: `interface Drawable {
    fun draw(): String
}

class Star : Drawable {
    fun draw() = "*"
}`, bug: 5, fix: '    override fun draw() = "*"', why: 'The “supertype” is the interface (or parent) a class builds on, here Drawable. A function that keeps an interface’s promise must be marked <code>override</code>.' },
        ],
        quiz: [
          { q: 'What does an interface hold?', options: ['Functions a class promises to have', 'A finished object, ready to use', 'Only text values'], a: 0, why: 'It says what a class can do. Each class writes how.' },
          { q: '<code>Square</code> and <code>Circle</code> both keep the <code>Shape</code> interface. Which can you pass to <code>fun report(shape: Shape)</code>?', options: ['Both', 'Only <code>Square</code>', 'Neither'], a: 0, why: 'Any class that keeps the promise counts as a <code>Shape</code>.' },
          { q: 'Which line makes Dog keep the <code>Speaker</code> interface?', options: ['<code>class Dog : Speaker</code>', '<code>class Dog : Speaker()</code>', '<code>class Dog(Speaker)</code>'], a: 0, why: 'An interface has no constructor, so there are no parentheses after its name.' },
        ],
        docs: [['Interfaces', 'https://kotlinlang.org/docs/interfaces.html']],
      },

      {
        id: 'objects',
        title: 'One-of-a-kind objects',
        tagline: 'When there should be exactly one: object.',
        goals: ['Make exactly one of something with <code>object</code>', 'Use it by its name', 'Put shared things in a <code>companion object</code>'],
        level: 'intermediate', introduces: ['object', 'companion'],
        body: `
<p>Some things exist only once in a program: the app’s settings, or a scoreboard every part of the game adds to. With a class, someone could make a second scoreboard by mistake, and then points end up in two places. Kotlin has a way to say “there is exactly one of these”.</p>
<p>Write <code>object</code> instead of <code>class</code>: <code>object Scoreboard { var total = 0 }</code>. The keyword <code>object</code> writes the plan and makes its single object in one go. It has properties and functions like a class body, but no constructor, and you never write <code>Scoreboard()</code>. Kotlin makes the one and only Scoreboard for you. Use it by its name: <code>Scoreboard.total</code>, <code>Scoreboard.add(5)</code>. Every part of the program that writes <code>Scoreboard</code> reaches that same object.</p>
<p>Sometimes a class needs something that belongs to the class itself, not to each object made from it: a number shared by all players, or a function that makes a ready-to-use player. Put those inside the class in a <code>companion object { ... }</code>. You reach them through the class name, with no object needed: <code>Player.guest()</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `object Scoreboard {
    var total = 0
    fun add(points: Int) {
        total += points
    }
}

fun main() {
    Scoreboard.add(10)
    Scoreboard.add(5)
    println(Scoreboard.total)
}`,
            varsTitle: 'The one Scoreboard',
            predict: {
              q: 'There is no <code>Scoreboard()</code> anywhere in <code>main</code>. What happens?',
              options: ['A compile error: no Scoreboard was made', 'It prints <code>15</code>', 'It prints <code>5</code>'],
              a: 1,
              why: 'An <code>object</code> is made by Kotlin itself. Both calls reach the same one, so 10 + 5 is 15.',
            },
            frames: [
              { line: 1, say: '<code>object</code> instead of <code>class</code>: Kotlin makes exactly one Scoreboard, on its own.' },
              { line: 2, vars: { 'Scoreboard.total': '0' }, say: 'It has a property, like any object. It starts at 0.' },
              { line: 9, say: '<code>main</code> uses it by its name. No <code>Scoreboard()</code>, no <code>val</code>.' },
              { line: 4, vars: { 'Scoreboard.total': '10' }, say: 'Inside <code>add</code>, the total goes up by 10.' },
              { line: 10, vars: { 'Scoreboard.total': '15' }, say: 'The same Scoreboard again: it still holds 10, so now 15.' },
              { line: 11, out: '15', say: 'One scoreboard, so both calls added to the same total.' },
            ],
          });
        },
        code: `class Player(val name: String) {
    companion object {
        val maxLevel = 50
        fun guest() = Player("Guest")
    }
}

fun main() {
    val p = Player.guest()
    println(p.name)            // Guest
    println(Player.maxLevel)   // 50
}`,
        play: `object Settings {
    var darkMode = false
    var fontSize = 16
}

fun main() {
    println("Dark mode: \${Settings.darkMode}")
    Settings.darkMode = true
    Settings.fontSize += 2
    println("Dark mode: \${Settings.darkMode}, font \${Settings.fontSize}")
    // Add a third setting, such as var language = "English", and print it.
}`,
        remember: 'object Name { ... } makes exactly one, used by its name. A companion object holds what belongs to the class itself.',
        mistakes: [
          { title: 'Making an object with ()', bad: 'object Scoreboard {\n    var total = 0\n}\n\nval board = Scoreboard()   // error', good: 'Scoreboard.total += 5', why: 'An <code>object</code> already exists and has no constructor. Use its name on its own.' },
        ],
        terms: [
          { term: 'object declaration', def: '<code>object Name { ... }</code>: a type with exactly one object, made by Kotlin and used by its name.' },
          { term: 'companion object', def: 'A block inside a class for things that belong to the class itself. Reached with the class name: <code>Player.guest()</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make one shared counter and add a click to it.', code: `[[object]] Counter {
    var clicks = 0
}

fun main() {
    [[Counter]].clicks++
    println(Counter.clicks)
}`, why: '<code>object</code> makes the single Counter. Use it by its name.' },
          { type: 'bug', prompt: 'This doesn’t compile. Tap the wrong line.', code: `object Counter {
    var clicks = 0
}

fun main() {
    Counter().clicks++
    println(Counter.clicks)
}`, bug: 5, fix: '    Counter.clicks++', why: 'An <code>object</code> has no constructor, so <code>Counter()</code> doesn’t work. Write the name on its own.' },
        ],
        quiz: [
          { q: 'Five different functions all use <code>object Scoreboard</code>. How many Scoreboards are there?', options: ['Exactly one', 'Five', 'None until someone writes <code>Scoreboard()</code>'], a: 0, why: 'An <code>object</code> always has exactly one, and every use reaches that same one.' },
          { q: '<code>class Player(val name: String) { companion object { fun guest() = Player("Guest") } }</code>. How do you call <code>guest</code>?', options: ['<code>Player.guest()</code>', '<code>guest.Player()</code>', '<code>Player("Ada").guest</code>'], a: 0, why: 'What is in the companion object belongs to the class, so you reach it through the class name.' },
          { q: 'Which is a good fit for <code>object</code>?', options: ['The app’s settings', 'Each song in a playlist'], a: 0, why: 'There is one set of settings. There are many songs, so a song is a class.' },
        ],
        docs: [['Object declarations and expressions', 'https://kotlinlang.org/docs/object-declarations.html']],
      },

      {
        id: 'sealed',
        title: 'A closed family of types',
        tagline: 'sealed: every possible case, known in advance.',
        goals: ['Make a closed family of types with <code>sealed</code>', 'Check which type a value is with <code>is</code>', 'Handle every case in a <code>when</code> without <code>else</code>'],
        level: 'intermediate', introduces: ['sealed'],
        body: `
<p>A download is waiting, done, or failed. When it is done you want its size; when it failed you want the reason. An enum gives you a fixed list of choices, but every choice has the same shape. Here each case carries different information.</p>
<p>Mark an interface <code>sealed</code> and its family is closed: the only types that can keep its promise are the ones written next to it (Kotlin requires the same package and module; in this course we keep them in the same file). <code>sealed interface Download</code>, then <code>class Done(val size: Int) : Download</code>, <code>class Failed(val reason: String) : Download</code> and <code>object Waiting : Download</code>. Each member can be a class with its own properties, or an <code>object</code> when it needs no data. (<code>sealed class</code> works the same way.)</p>
<p><code>fun show(d: Download): String = when (d) { ... }</code> uses the short form from functions: the whole <code>when</code>, over several lines, is the one expression after <code>=</code>, and its value is the result. In a <code>when</code>, <code>is Done -&gt;</code> asks “is this value a Done?”. Inside that branch Kotlin knows it is one, so <code>d.size</code> works, like the smart cast you met after a null check. For an object, write its name: there is only one of it.</p>
<p>Because Kotlin knows every member, a <code>when</code> that handles them all needs no <code>else</code>. Add a new member later, and every <code>when</code> that forgets it stops compiling, pointing you to each place to update.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `sealed interface Download
class Done(val size: Int) : Download
class Failed(val reason: String) : Download
object Waiting : Download

fun show(d: Download): String = when (d) {
    is Done -> "Done: \${d.size} MB"
    is Failed -> "Failed: \${d.reason}"
    Waiting -> "Waiting..."
}

fun main() {
    println(show(Waiting))
    println(show(Failed("No network")))
}`,
            predict: {
              q: 'The <code>when</code> in <code>show</code> has no <code>else</code>. What happens?',
              options: ['A compile error: <code>else</code> is missing', 'It compiles: these are all the kinds of Download', 'It compiles, but may crash'],
              a: 1,
              why: 'The family is sealed, so Kotlin knows Done, Failed and Waiting are the only members, and all three are handled.',
            },
            frames: [
              { line: 1, say: '<code>sealed</code>: the Download family is closed. Its members are listed right here.' },
              { line: [2, 3, 4], say: 'Three members: two classes that carry different data, and one object that needs none.' },
              { line: 6, say: 'The <code>when</code> has no <code>else</code>. None is needed: every member is handled, and Kotlin checks that for you.' },
              { line: 13, vars: { d: 'Waiting' }, say: 'Call <code>show</code> with the Waiting object.' },
              { line: 9, out: 'Waiting...', say: 'Not a Done, not a Failed. It is Waiting, so this branch wins.' },
              { line: 14, vars: { d: 'Failed("No network")' }, say: 'Now a Failed, carrying a reason.' },
              { line: 8, out: 'Failed: No network', say: '<code>is Failed</code> matches. In this branch Kotlin knows <code>d</code> is a Failed, so <code>d.reason</code> works.' },
            ],
          });
        },
        code: `sealed interface Payment
class Card(val last4: String) : Payment
class Voucher(val code: String, val euros: Int) : Payment
object Cash : Payment

fun receipt(p: Payment): String = when (p) {
    is Card -> "Card ending \${p.last4}"
    is Voucher -> "Voucher \${p.code}: \${p.euros} euros"
    Cash -> "Paid in cash"
}

fun main() {
    println(receipt(Card("4821")))          // Card ending 4821
    println(receipt(Voucher("SPRING", 10))) // Voucher SPRING: 10 euros
}`,
        play: `sealed interface Shape
class Circle(val radius: Double) : Shape
class Square(val side: Double) : Shape

fun area(s: Shape): Double = when (s) {
    is Circle -> 3.14 * s.radius * s.radius
    is Square -> s.side * s.side
}

fun main() {
    println(area(Circle(2.0)))
    println(area(Square(3.0)))
    // Add class Triangle(val base: Double, val height: Double) : Shape and run. Read the error.
}`,
        remember: 'sealed closes a family of types. when over it uses is Type -> and needs no else when every member is handled.',
        mistakes: [
          { title: 'Adding else “just in case”', bad: 'when (d) {\n    is Done -> "Done"\n    else -> "Something else"\n}', good: 'when (d) {\n    is Done -> "Done"\n    is Failed -> "Failed"\n    Waiting -> "Waiting..."\n}', why: 'With <code>else</code>, a member you add later quietly falls into it. Without it, Kotlin shows you every <code>when</code> that needs a new branch.' },
        ],
        terms: [
          { term: 'sealed', def: 'Marks a class or interface whose members are all known: they are written next to it (same package and module; in this course, the same file).' },
          { term: 'is', def: 'Checks whether a value is of a type: <code>is Done</code>. After it, Kotlin treats the value as that type.' },
          { term: 'exhaustive', def: 'A <code>when</code> that covers every possible case, so it needs no <code>else</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Close the family, then check which member you have.', code: `[[sealed]] interface Light
object Red : Light
object Green : Light
class Blinking(val seconds: Int) : Light

fun action(l: Light): String = when (l) {
    Red -> "Stop"
    Green -> "Go"
    [[is]] Blinking -> "Careful for \${l.seconds} s"
}`, why: '<code>sealed</code> closes the family. A class member is matched with <code>is</code>; an object by its name.' },
          { type: 'bug', prompt: 'Kotlin says: <code>\'when\' expression must be exhaustive. Add the \'is Cat\' branch or an \'else\' branch.</code> Tap the line to fix.', code: `sealed interface Pet
class Dog(val name: String) : Pet
class Cat(val name: String) : Pet

fun sound(p: Pet): String = when (p) {
    is Dog -> "Woof"
    is Dog -> "Meow"
}`, bug: 6, fix: '    is Cat -> "Meow"', why: 'The second branch checks Dog again, so Cat is never handled. Kotlin notices because the family is sealed.' },
        ],
        quiz: [
          { q: 'Why can a <code>when</code> over a sealed type leave out <code>else</code>?', options: ['Kotlin knows every member, so it can check all are handled', '<code>else</code> is never allowed in <code>when</code>', 'Sealed types can’t be null'], a: 0, why: 'All members are written next to the sealed type, so Kotlin can see whether each one has a branch.' },
          { q: 'You add <code>class Paused : Download</code>. What happens to <code>show</code>, which has no <code>else</code>?', options: ['It stops compiling until it gets a Paused branch', 'Paused values print nothing', 'Nothing changes'], a: 0, why: 'The <code>when</code> is no longer exhaustive, and Kotlin points to it.' },
          { q: 'In <code>is Done -&gt; "\${d.size} MB"</code>, why does <code>d.size</code> work?', options: ['After <code>is Done</code>, Kotlin knows <code>d</code> is a Done', 'Every Download has a size', 'It doesn’t compile'], a: 0, why: 'The <code>is</code> check works like a null check: inside that branch, Kotlin treats <code>d</code> as a Done.' },
        ],
        docs: [['Sealed classes and interfaces', 'https://kotlinlang.org/docs/sealed-classes.html'], ['Sealed classes with when', 'https://kotlinlang.org/docs/sealed-classes.html#use-sealed-classes-with-when-expression']],
      },

      {
        id: 'exceptions',
        title: 'When something goes wrong at run time',
        tagline: 'Catch a problem instead of crashing.',
        goals: ['Catch a problem with <code>try</code> and <code>catch</code>', 'Run steps either way with <code>finally</code>', 'Report a problem yourself with <code>throw</code>'],
        level: 'intermediate', introduces: ['try', 'catch', 'finally', 'throw', 'Exception'],
        body: `
<p>Remember <code>"hello".toInt()</code>? It crashed the whole program. An app shouldn’t close because someone typed letters into an age field. It should say “please type a number” and carry on.</p>
<p>When something goes wrong while the program runs, Kotlin <em>throws</em> an <em>exception</em>: an object that describes the problem. If nothing catches it, the program stops. That is a crash. To catch it, put the risky code in <code>try { ... }</code> and add <code>catch (e: Exception) { ... }</code>. If a line in <code>try</code> throws, the rest of <code>try</code> is skipped and the <code>catch</code> block runs instead. <code>e</code> is a name for the exception, and <code>e.message</code> is its description.</p>
<p>A <code>finally { ... }</code> block after <code>catch</code> runs either way, problem or not. It is the place for steps that must always happen, like printing “check done”.</p>
<p>Your own code can throw too: <code>throw Exception("Age can't be negative")</code> stops the function right there and hands the problem to whoever called it.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `fun main() {
    val typed = "12a"
    try {
        val age = typed.toInt()
        println("Age: $age")
    } catch (e: Exception) {
        println("Not a number: $typed")
    } finally {
        println("Check done")
    }
    println("Still running")
}`,
            predict: {
              q: '<code>toInt()</code> fails on line 4. Does line 5 run?',
              options: ['Yes, it prints <code>Age: 12</code>', 'No, Kotlin jumps to <code>catch</code>', 'No, the program crashes'],
              a: 1,
              why: 'When a line in <code>try</code> throws, the rest of <code>try</code> is skipped and <code>catch</code> handles the problem.',
            },
            frames: [
              { line: 1, say: 'Text that should be an age, but has a letter in it.' },
              { line: 2, vars: { typed: '"12a"' } },
              { line: 4, say: '<code>toInt()</code> can’t read <code>"12a"</code>, so it throws an exception.' },
              { line: 6, vars: { e: 'NumberFormatException' }, say: 'Line 5 is skipped. Kotlin jumps to <code>catch</code>, and <code>e</code> holds the exception (NumberFormatException is the kind of exception <code>toInt()</code> throws).' },
              { line: 7, out: 'Not a number: 12a', say: 'Handle it: tell the user what went wrong.' },
              { line: 9, out: 'Check done', say: '<code>finally</code> runs whether or not something went wrong.' },
              { line: 11, out: 'Still running', say: 'The problem was caught, so no crash. The program carries on.' },
            ],
          });
        },
        code: `fun checkAge(age: Int) {
    if (age < 0) {
        throw Exception("Age can't be negative: $age")
    }
    println("Age $age is fine")
}

fun main() {
    try {
        checkAge(30)              // Age 30 is fine
        checkAge(-2)
        println("never printed")
    } catch (e: Exception) {
        println(e.message)        // Age can't be negative: -2
    }
}`,
        play: `fun main() {
    val inputs = listOf("4", "seven", "10")
    var total = 0
    for (text in inputs) {
        try {
            total += text.toInt()
        } catch (e: Exception) {
            println("Skipped: $text")
        }
    }
    println("Total: $total")
    // Change "seven" to "7" and run again.
}`,
        remember: 'try { risky } catch (e: Exception) { handle } stops a crash. finally always runs. throw reports a problem yourself.',
        mistakes: [
          { title: 'An empty catch', bad: 'var age = 0\ntry {\n    age = typed.toInt()\n} catch (e: Exception) {\n}', good: 'var age = 0\ntry {\n    age = typed.toInt()\n} catch (e: Exception) {\n    println("Please type a number")\n}', why: 'An empty <code>catch</code> hides the problem: nothing crashes, but nobody learns that something went wrong.' },
        ],
        terms: [
          { term: 'exception', def: 'An object describing a problem that happened while the program ran.' },
          { term: 'throw', def: 'Report a problem: stops the current code and hands the exception up to the caller.' },
          { term: 'try / catch', def: '<code>try</code> runs risky code; if it throws, <code>catch</code> runs instead of crashing.' },
          { term: 'finally', def: 'A block after <code>try</code>/<code>catch</code> that runs every time.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Read the number, and print a friendly message if it fails.', code: `fun main() {
    val typed = "ten"
    [[try]] {
        println(typed.toInt() * 2)
    } [[catch]] (e: Exception) {
        println("Please type digits")
    }
}`, why: 'Risky code goes in <code>try</code>; <code>catch</code> handles the exception.' },
          { type: 'bug', prompt: 'This doesn’t compile. Tap the wrong line.', code: `fun main() {
    try {
        println("10".toInt() + "x".toInt())
    } finally (e: Exception) {
        println("Please type numbers")
    }
}`, bug: 3, fix: '    } catch (e: Exception) {', why: 'Only <code>catch</code> takes an exception in parentheses. <code>finally</code> has no parentheses.' },
        ],
        quiz: [
          { q: 'What does this print?<pre class="code"><code>try {\n    println("A")\n    throw Exception("oops")\n    println("B")\n} catch (e: Exception) {\n    println("C")\n}</code></pre>', options: ['<code>A</code> then <code>C</code>', '<code>A</code>, <code>B</code>, <code>C</code>', 'Only <code>C</code>'], a: 0, why: '"A" prints first. The throw skips the rest of <code>try</code>, so "B" never prints, and <code>catch</code> prints "C".' },
          { q: 'When does a <code>finally</code> block run?', options: ['Every time', 'Only when something went wrong', 'Only when nothing went wrong'], a: 0, why: '<code>finally</code> runs whether an exception happened or not.' },
          { q: 'An exception is thrown and no <code>catch</code> handles it. What happens?', options: ['The program crashes', 'Kotlin ignores it', 'The line is tried again'], a: 0, why: 'An exception that is never caught stops the program: a crash.' },
        ],
        docs: [['Exception and error handling', 'https://kotlinlang.org/docs/exceptions.html']],
      },

      {
        id: 'extensions',
        title: 'Adding functions to existing types',
        tagline: 'Give Int or String a new function of your own.',
        goals: ['Add your own function to <code>Int</code> or <code>String</code>', 'Use <code>this</code> for the value before the dot'],
        level: 'intermediate', introduces: [],
        body: `
<p>You keep writing <code>n % 2 == 0</code> to check for even numbers. It would read better as <code>n.isEven()</code>, like <code>toInt()</code>. But <code>Int</code> is part of Kotlin, so you can’t open it up and add a function inside it.</p>
<p>An <em>extension function</em> does it from the outside. Put the type and a dot before the function name: <code>fun Int.isEven(): Boolean = this % 2 == 0</code>. Now every <code>Int</code> has it: <code>4.isEven()</code> is <code>true</code>.</p>
<p>Inside the function, <code>this</code> is the value it was called on, called the <em>receiver</em>. In <code>7.isEven()</code>, <code>this</code> is 7. It works like <code>this</code> inside a class’s own functions.</p>
<p>Nothing inside <code>Int</code> really changes. An extension is an ordinary function that you call with a dot, so it can’t reach anything <code>private</code> in the type. You can write extensions for your own classes too.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `fun Int.isEven(): Boolean = this % 2 == 0

fun String.exclaim(): String = "$this!"

fun main() {
    println(4.isEven())
    println(7.isEven())
    println("Well done".exclaim())
}`,
            predict: {
              q: 'When you call <code>7.isEven()</code>, what is <code>this</code> inside <code>isEven</code>?',
              options: ['<code>7</code>', 'The word <code>Int</code>', 'Nothing: <code>this</code> only works in a class'],
              a: 0,
              why: '<code>this</code> is the receiver, the value before the dot.',
            },
            frames: [
              { line: 1, say: '<code>Int.</code> before the name: this function is added to every Int.' },
              { line: 3, say: 'The same for String: every text gets an <code>exclaim()</code> function.' },
              { line: 6, vars: { this: '4' }, say: 'Called on 4, so inside the function <code>this</code> is 4.' },
              { line: 1, out: 'true', say: '4 % 2 is 0, so the answer is true.' },
              { line: 7, vars: { this: '7' }, out: 'false', say: 'Now <code>this</code> is 7. 7 % 2 is 1, so false.' },
              { line: 8, vars: { this: '"Well done"' }, out: 'Well done!', say: 'Called on a String: <code>"$this!"</code> puts the text in front of the <code>!</code>.' },
            ],
          });
        },
        code: `fun Int.minutesToText(): String {
    val hours = this / 60
    val minutes = this % 60
    return "\${hours}h \${minutes}min"   // braces needed: $hoursh would look for a box called hoursh
}

fun main() {
    println(135.minutesToText())    // 2h 15min
    val film = 98
    println(film.minutesToText())   // 1h 38min
}`,
        play: `fun Double.toEuros(): String = "$this euros"

fun Int.times10(): Int = this * 10

fun main() {
    println(4.5.toEuros())
    println(7.times10())
    // Write fun Int.half(): Int = this / 2 above main, then print 9.half().
}`,
        remember: 'fun Type.name() adds a function to an existing type. Inside, this is the value before the dot.',
        mistakes: [
          { title: 'Forgetting the type in front', bad: 'fun isEven(): Boolean = this % 2 == 0   // error', good: 'fun Int.isEven(): Boolean = this % 2 == 0', why: 'Without <code>Int.</code> there is no receiver, so <code>this</code> means nothing. Kotlin reports <code>\'this\' is not defined in this context.</code>' },
        ],
        terms: [
          { term: 'extension function', def: 'A function added to an existing type from outside it: <code>fun Int.isEven()</code>.' },
          { term: 'receiver', def: 'The value an extension is called on, the one before the dot. Inside, it is <code>this</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add <code>double()</code> to every Int, so <code>5.double()</code> is 10.', code: `fun [[Int]].double(): Int = [[this]] * 2

fun main() {
    println(5.double())
}`, why: 'The type goes before the dot. <code>this</code> is the number it was called on.' },
          { type: 'bug', prompt: 'This should print <code>Hello, Ada</code> but doesn’t compile. Tap the wrong line.', code: `fun String.greet(): String = "Hello, $this"

fun main() {
    println(greet("Ada"))
}`, bug: 3, fix: '    println("Ada".greet())', why: 'An extension is called on its receiver with a dot, not given it as an argument.' },
        ],
        quiz: [
          { q: '<code>fun Int.plusOne() = this + 1</code>. What is <code>5.plusOne()</code>?', options: ['<code>6</code>', '<code>5</code>', 'An error'], a: 0, why: '<code>this</code> is 5, so 5 + 1 is 6.' },
          { q: 'Does an extension function change the <code>String</code> type itself?', options: ['No, it is a function you call with a dot', 'Yes, it is added inside String'], a: 0, why: 'String stays as it is. You call your function as if it were part of it.' },
          { q: 'In <code>"Oslo".exclaim()</code>, what is the receiver?', options: ['<code>"Oslo"</code>', '<code>exclaim</code>', '<code>String</code>'], a: 0, why: 'The receiver is the value before the dot.' },
        ],
        docs: [['Extensions', 'https://kotlinlang.org/docs/extensions.html']],
      },

      {
        id: 'scope-functions',
        title: 'let, apply, also, run',
        tagline: 'Four small helpers that run a block on one object.',
        goals: ['Run a block on one object with <code>let</code>, <code>apply</code>, <code>also</code>, <code>run</code>', 'Tell <code>it</code> from <code>this</code> in each one', 'Know which ones give back the object'],
        level: 'intermediate', introduces: ['let', 'apply', 'also', 'run'],
        body: `
<p>Setting up an object often repeats its name on every line: <code>ticket.name = "Lin"</code>, <code>ticket.seat = 12</code>. And with a nullable value, you often want to do something only when it isn’t <code>null</code>. Kotlin has four small functions for moments like these, called <em>scope functions</em>.</p>
<p>Each one is called on an object with a dot and takes a lambda. They differ in two things. Inside the lambda, the object is either <code>it</code>, as in the lambdas you know, or <code>this</code>, as in an extension, so you can leave it out and write <code>name</code> on its own. And the whole call gives back either the lambda’s result (its last line) or the object itself.</p>
<table class="kt-table">
<thead><tr><th>Inside</th><th>gives back the result</th><th>gives back the object</th></tr></thead>
<tbody><tr><th><code>it</code></th><td><code>let</code></td><td><code>also</code></td></tr>
<tr><th><code>this</code></th><td><code>run</code></td><td><code>apply</code></td></tr></tbody>
</table>
<ul>
<li><code>let</code>: <code>it</code>, gives back the result. Most often after <code>?.</code>: <code>nick?.let { println(it) }</code> runs only when <code>nick</code> isn’t null.</li>
<li><code>apply</code>: <code>this</code>, gives back the object. For setting an object up.</li>
<li><code>also</code>: <code>it</code>, gives back the object. For an extra step on the way, like printing.</li>
<li><code>run</code>: <code>this</code>, gives back the result. For working something out from the object’s properties.</li>
</ul>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Ticket {
    var name = ""
    var seat = 0
}

fun main() {
    val t = Ticket().apply {
        name = "Lin"
        seat = 12
    }
    val label = t.run { "$name, seat $seat" }
    val nick: String? = "Lin"
    nick?.let { println("Hi, $it") }
    println(label)
}`,
            predict: {
              q: 'The <code>apply</code> block ends on line 10. What goes into <code>t</code>?',
              options: ['The ticket itself', 'The last value in the block, <code>12</code>', 'Nothing'],
              a: 0,
              why: '<code>apply</code> always gives back the object it was called on.',
            },
            frames: [
              { line: [1, 2, 3], say: 'A class with two properties that start empty.' },
              { line: 7, say: '<code>apply</code> runs the block on the new Ticket. Inside, <code>this</code> is that ticket.' },
              { line: 8, vars: { 'new ticket.name': '"Lin"' }, say: '<code>name</code> here means the ticket’s name. No <code>t.</code> needed.' },
              { line: 9, vars: { 'new ticket.seat': '12' } },
              { line: 10, vars: { t: 'the ticket' }, say: '<code>apply</code> gives back the ticket itself, so <code>t</code> is the set-up ticket.' },
              { line: 11, vars: { label: '"Lin, seat 12"' }, say: '<code>run</code> also uses <code>this</code>, but gives back the block’s last value: the text.' },
              { line: 13, out: 'Hi, Lin', say: '<code>nick</code> isn’t null, so <code>let</code> runs, with the value as <code>it</code>.' },
              { line: 14, out: 'Lin, seat 12' },
            ],
          });
        },
        code: `class Profile {
    var name = ""
    var city = ""
}

fun main() {
    val p = Profile().apply {
        name = "Sam"
        city = "Lisbon"
    }.also { println("Created \${it.name}") }   // Created Sam

    val intro = p.run { "$name from $city" }
    println(intro)                             // Sam from Lisbon

    val nickname: String? = null
    nickname?.let { println("Nick: $it") }     // prints nothing: it is null
}`,
        play: `class Lamp {
    var color = "white"
    var brightness = 50
}

fun main() {
    val lamp = Lamp().apply {
        color = "warm"
        brightness = 80
    }
    println(lamp.run { "$color at $brightness%" })
    // Change color inside apply to "blue" and run again.
}`,
        remember: 'let and also use it; apply and run use this. apply and also give back the object; let and run give back the block’s result.',
        mistakes: [
          { title: 'apply when you want a result', bad: 'val intro = p.apply { "$name from $city" }\n// intro is the Profile, not the text', good: 'val intro = p.run { "$name from $city" }', why: '<code>apply</code> always gives back the object. To get the block’s last value, use <code>run</code>.' },
        ],
        terms: [
          { term: 'let', def: 'Runs a block with the object as <code>it</code> and gives back the block’s result. Often used with <code>?.</code>.' },
          { term: 'apply', def: 'Runs a block with the object as <code>this</code> and gives back the object. Good for setting up.' },
          { term: 'also', def: 'Runs a block with the object as <code>it</code> and gives back the object. Good for an extra step, like printing.' },
          { term: 'run', def: 'Runs a block with the object as <code>this</code> and gives back the block’s result.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Set up the profile, then greet the nickname only if there is one.', code: `class Profile {
    var name = ""
}

fun main() {
    val p = Profile().[[apply]] {
        name = "Ada"
    }
    val nick: String? = "Addie"
    nick?.[[let]] { println("Hi, $it") }
}`, why: '<code>apply</code> sets the object up with <code>this</code>. <code>?.let</code> runs only when the value isn’t null.' },
          { type: 'bug', prompt: 'This doesn’t compile. Tap the wrong line.', code: `fun main() {
    val city: String? = "Oslo"
    city?.let { println("City: $this") }
}`, bug: 2, fix: '    city?.let { println("City: $it") }', why: 'Inside <code>let</code>, the value is <code>it</code>, not <code>this</code>.' },
        ],
        quiz: [
          { q: 'Which scope function uses <code>this</code> and gives back the object itself?', options: ['<code>apply</code>', '<code>let</code>', '<code>run</code>'], a: 0, why: '<code>apply</code>: <code>this</code> inside, the object out. Ideal for setting things up.' },
          { q: 'What is <code>val x = 10.let { it * 2 }</code>?', options: ['<code>20</code>', '<code>10</code>'], a: 0, why: '<code>let</code> gives back the block’s result: 10 * 2.' },
          { q: '<code>name</code> is <code>null</code>. What does <code>name?.let { println(it) }</code> do?', options: ['Nothing: the block doesn’t run', 'Prints <code>null</code>', 'Crashes'], a: 0, why: '<code>?.</code> stops at null, so <code>let</code> is never called.' },
        ],
        docs: [['Scope functions', 'https://kotlinlang.org/docs/scope-functions.html']],
      },

      {
        id: 'properties',
        title: 'Smarter properties',
        tagline: 'Properties that check new values or work themselves out.',
        goals: ['Check new values with a setter', 'Work a value out on every read with a getter', 'Use <code>field</code> to reach the property’s own box'],
        level: 'intermediate', introduces: ['get', 'field', 'const'],
        body: `
<p>A player’s health should never go below 0, even if some code tries <code>health = -30</code>. And “is the player alive?” shouldn’t be stored at all: it should always follow from the health. Properties can do both.</p>
<p>A <em>setter</em> runs every time a property is given a new value. Write <code>set(value) { ... }</code> on the line under the property. <code>value</code> is the new value, and <code>field</code> is the property’s own box: <code>field = if (value &lt; 0) 0 else value</code>. That box is called the <em>backing field</em>.</p>
<p>A <em>getter</em> runs every time a property is read. <code>val isAlive: Boolean get() = health &gt; 0</code> keeps no box of its own; it works out the answer again on every read, so it is never out of date.</p>
<p>A small side note: a fixed value known before the program runs, like the highest level, can be written <code>const val MAX_LEVEL = 50</code>, outside any class or inside an <code>object</code>.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Player(val name: String) {
    var health = 100
        set(value) {
            field = if (value < 0) 0 else value
        }
    val isAlive: Boolean
        get() = health > 0
}

fun main() {
    val p = Player("Ada")
    p.health = 40
    p.health = -30
    println(p.health)
    println(p.isAlive)
}`,
            predict: {
              q: 'After <code>p.health = -30</code>, what does <code>println(p.health)</code> print?',
              options: ['<code>-30</code>', '<code>0</code>', '<code>40</code>'],
              a: 1,
              why: 'The setter checks every new value. -30 is below 0, so it stores 0.',
            },
            frames: [
              { line: [2, 3, 4], say: '<code>health</code> has a setter: every new value passes through it first.' },
              { line: 11, vars: { 'p.health': '100' }, say: 'A new player starts at 100.' },
              { line: 12, vars: { value: '40' }, say: 'Assigning calls the setter. <code>value</code> is 40.' },
              { line: 4, vars: { 'p.health': '40' }, say: '40 isn’t below 0, so <code>field</code>, the real box, gets 40.' },
              { line: 13, vars: { value: '-30' }, say: 'Someone tries -30. The setter runs again.' },
              { line: 4, vars: { 'p.health': '0' }, say: '-30 is below 0, so the box gets 0 instead.' },
              { line: 14, vars: { value: null }, out: '0' },
              { line: [15, 7], out: 'false', say: '<code>isAlive</code> has no box. Its getter works it out now: 0 &gt; 0 is false.' },
            ],
          });
        },
        code: `class Hero {
    var level = 1
        set(value) {
            field = if (value > 50) 50 else value
        }
    val title: String
        get() = if (level >= 10) "Veteran" else "Rookie"
}

fun main() {
    val h = Hero()
    h.level = 12
    println(h.title)   // Veteran
    h.level = 99
    println(h.level)   // 50
}`,
        play: `class Rectangle(val width: Int, val height: Int) {
    val area: Int
        get() = width * height
    val isSquare: Boolean
        get() = width == height
}

fun main() {
    val r = Rectangle(4, 6)
    println("Area \${r.area}, square: \${r.isSquare}")
    // Make it Rectangle(5, 5) and run again.
}`,
        remember: 'set(value) { field = ... } checks new values; get() = ... works a value out on every read.',
        mistakes: [
          { title: 'Using the property name inside its own setter', bad: 'var level = 5\n    set(value) {\n        level = value\n    }', good: 'var level = 5\n    set(value) {\n        field = value\n    }', why: '<code>level = value</code> calls the setter again, which calls it again, until the program crashes with a <code>StackOverflowError</code>. Write to <code>field</code>.' },
        ],
        terms: [
          { term: 'setter', def: 'Code that runs whenever a property gets a new value: <code>set(value) { ... }</code>.' },
          { term: 'getter', def: 'Code that runs whenever a property is read: <code>get() = ...</code>.' },
          { term: 'backing field', def: 'The box that really holds a property’s value. In a setter or getter it is called <code>field</code>.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Never store a negative count, and work out <code>isZero</code> on every read.', code: `class Counter {
    var count = 0
        set(value) {
            [[field]] = if (value < 0) 0 else value
        }
    val isZero: Boolean
        [[get]]() = count == 0
}`, why: 'The setter stores into <code>field</code>. The getter, <code>get()</code>, works out the answer on every read.' },
          { type: 'bug', prompt: 'Setting the volume crashes the program. Tap the wrong line.', code: `class Volume {
    var level = 5
        set(value) {
            level = if (value > 10) 10 else value
        }
}`, bug: 3, fix: '            field = if (value > 10) 10 else value', why: 'Assigning to <code>level</code> inside its own setter calls the setter again, for ever. Store into <code>field</code>.' },
        ],
        quiz: [
          { q: 'Inside <code>set(value) { ... }</code>, what is <code>field</code>?', options: ['The box that really holds the property’s value', 'The new value being assigned', 'Another name for the class'], a: 0, why: '<code>value</code> is the new value; <code>field</code> is where the property keeps it.' },
          { q: '<code>val area: Int get() = width * height</code>. When is the area worked out?', options: ['Every time <code>area</code> is read', 'Once, when the object is made'], a: 0, why: 'A getter runs on every read, so it always matches the current values.' },
          { q: 'Does <code>val isAlive: Boolean get() = health &gt; 0</code> keep a box of its own?', options: ['No: the getter works the answer out on every read', 'Yes: it stores true or false once'], a: 0, why: 'A property with only a getter that never uses <code>field</code> has no backing field. It follows <code>health</code> automatically.' },
        ],
        docs: [['Properties: getters and setters', 'https://kotlinlang.org/docs/properties.html#custom-getters-and-setters'], ['Backing fields', 'https://kotlinlang.org/docs/properties.html#backing-fields']],
      },

      {
        id: 'late-init',
        title: 'Values that arrive later',
        tagline: 'lateinit and by lazy: no value yet, and that’s fine.',
        goals: ['Fill a property later with <code>lateinit var</code>', 'Work a value out on first use with <code>by lazy</code>', 'Choose between the two'],
        level: 'intermediate', introduces: ['lateinit', 'by', 'lazy'],
        body: `
<p>Sometimes a property can’t get its value when the object is made. A game’s player name arrives after the start menu. Or a value takes a lot of work, and the program might never need it. Making it nullable just to fill it later means <code>?.</code> everywhere. Kotlin has two better tools.</p>
<p><code>lateinit var player: String</code> has no starting value. It is a promise: “this gets a value before anyone reads it.” Keep the promise and it works like a normal <code>var</code>. Break it, and the program crashes with <code>UninitializedPropertyAccessException: lateinit property player has not been initialized</code>. It works only with <code>var</code>, not with nullable types, and not with <code>Int</code>, <code>Double</code> or <code>Boolean</code>; <code>String</code> and your own classes are fine.</p>
<p><code>val books by lazy { ... }</code> gives the work to a lambda. The lambda runs the first time <code>books</code> is read, and its last value is remembered and given back on every later read. <code>by lazy</code> means: let <code>lazy</code> produce this value when it’s first read.</p>
<p>Which one? <code>lateinit</code> when some other code will set the value later. <code>by lazy</code> when the property can work the value out itself, but should wait until it is needed.</p>`,
        visual(el) {
          Lab.ui.codeStepper(el, {
            code: `class Library {
    val books by lazy {
        println("Loading books...")
        listOf("Dune", "Emma", "Ulysses")
    }
}

fun main() {
    val lib = Library()
    println("Library open")
    println(lib.books.size)
    println(lib.books.first())
}`,
            predict: {
              q: 'When does <code>Loading books...</code> print?',
              options: ['When <code>Library()</code> is made', 'The first time <code>books</code> is read', 'Every time <code>books</code> is read'],
              a: 1,
              why: 'A lazy block waits until the property is first read, then remembers its value.',
            },
            frames: [
              { line: [2, 3, 4], say: '<code>by lazy</code>: the block is stored, not run yet.' },
              { line: 9, vars: { 'lib.books': '(not worked out yet)' }, say: 'The library exists, but <code>books</code> has no value yet.' },
              { line: 10, out: 'Library open', say: 'Still no loading.' },
              { line: 11, say: 'First read of <code>books</code>: now the lazy block runs.' },
              { line: 3, out: 'Loading books...' },
              { line: 4, vars: { 'lib.books': '[Dune, Emma, Ulysses]' }, say: 'The last value of the block becomes <code>books</code>, and is remembered.' },
              { line: 11, out: '3', say: 'Back on line 11: the list has 3 books.' },
              { line: 12, out: 'Dune', say: 'Second read: the remembered list. The block doesn’t run again.' },
            ],
          });
        },
        code: `class Game {
    lateinit var player: String

    fun start() {
        println("Welcome, $player")
    }
}

fun main() {
    val game = Game()
    game.player = "Lin"   // the promise is kept before start()
    game.start()          // Welcome, Lin
}`,
        play: `class Report {
    val summary by lazy {
        println("Working out the summary...")
        "3 sales, 120 euros"
    }
}

fun main() {
    val r = Report()
    println("Report ready")
    println(r.summary)
    println(r.summary)
    // Delete both println(r.summary) lines and run: the summary is never worked out.
}`,
        remember: 'lateinit var: set it before you read it. val x by lazy { ... }: worked out on first read, then remembered.',
        mistakes: [
          { title: 'lateinit on a number', bad: 'lateinit var score: Int   // error', good: 'var score = 0', why: '<code>lateinit</code> doesn’t work with <code>Int</code>, <code>Double</code> or <code>Boolean</code>. Kotlin says <code>\'lateinit\' modifier is not allowed on properties of primitive types.</code> Give a number a starting value instead.' },
        ],
        terms: [
          { term: 'lateinit', def: 'Marks a <code>var</code> that gets its value after the object is made, before anyone reads it.' },
          { term: 'by lazy', def: '<code>val x by lazy { ... }</code>: the block runs on the first read, and its value is remembered.' },
          { term: 'initialize', def: 'Give a variable or property its first value.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'The name is set later; the greeting is worked out only when first needed.', code: `class Visitor {
    [[lateinit]] var name: String
    val greeting [[by]] [[lazy]] {
        "Welcome, $name"
    }
}`, why: '<code>lateinit var</code> for a value set later. <code>by lazy</code> for one worked out on first read.' },
          { type: 'bug', prompt: 'This doesn’t compile. Tap the wrong line.', code: `class Profile {
    lateinit val email: String
}

fun main() {
    val p = Profile()
    p.email = "ada@example.com"
    println(p.email)
}`, bug: 1, fix: '    lateinit var email: String', why: 'A <code>lateinit</code> property gets its value later, so it must be a <code>var</code>.' },
        ],
        quiz: [
          { q: 'You read a <code>lateinit</code> property before giving it a value. What happens?', options: ['The program crashes', 'You get <code>null</code>', 'You get an empty text'], a: 0, why: 'It throws <code>UninitializedPropertyAccessException</code>, and if nothing catches it, the program stops.' },
          { q: 'A <code>by lazy</code> property is read three times. How many times does its block run?', options: ['Once', 'Three times', 'Never'], a: 0, why: 'It runs on the first read; the next reads get the remembered value.' },
          { q: 'Which line compiles?', options: ['<code>lateinit var name: String</code>', '<code>lateinit var age: Int</code>', '<code>lateinit val name: String</code>'], a: 0, why: '<code>lateinit</code> needs a <code>var</code>, and a type like <code>String</code>, not <code>Int</code>.' },
        ],
        docs: [['Late-initialized properties', 'https://kotlinlang.org/docs/properties.html#late-initialized-properties-and-variables'], ['Lazy properties', 'https://kotlinlang.org/docs/delegated-properties.html#lazy-properties']],
      },

      // + types ─────────────────────────────────────
      // + control ─────────────────────────────────────
      // 2 ─────────────────────────────────────────────
      // 3 ─────────────────────────────────────────────
      // 4 ─────────────────────────────────────────────
      // + maps-sets ───────────────────────────────────
      // 5 ─────────────────────────────────────────────
      // + classes ───────────────────────────────────
      // + properties ──────────────────────────────────
      // + inheritance ─────────────────────────────────
      // + objects ─────────────────────────────────────
      // + enums ───────────────────────────────────────
      // 6 ─────────────────────────────────────────────
      // 7 ─────────────────────────────────────────────
      // 8 ─────────────────────────────────────────────
      // 9 ─────────────────────────────────────────────
      // + exceptions ──────────────────────────────────
      ],
  });
})();
