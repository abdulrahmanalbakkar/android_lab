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
`;

  Lab.addTrack({
    id: 'kotlin',
    title: 'Kotlin',
    description: 'The language Android is written in. From val to coroutines.',
    group: 'Foundations', requires: [],
    css,
    lessons: [
      // 1 ─────────────────────────────────────────────
      {
        id: 'vals',
        title: 'val and var',
        tagline: 'Names that can and can’t be reassigned.',
        body: `
<p><code>val</code> names a value that never gets replaced. <code>var</code> names something you can point at a new value later.</p>
<p>Start with <code>val</code>. Switch to <code>var</code> only when the value really has to change, like a counter or a score. Fewer things that change means fewer bugs to chase.</p>
<p>One catch: <code>val</code> locks the <em>name</em>, not the object behind it. A <code>val list = mutableListOf(1)</code> can still grow with <code>list.add(2)</code>.</p>`,
        code: `val name = "Ada"      // read-only
var score = 10        // mutable

score += 5            // fine: score is now 15
name = "Grace"        // error: Val cannot be reassigned

val items = mutableListOf(1)
items.add(2)          // fine: the list changes, the name doesn't`,
        remember: 'val can’t be reassigned, var can. Default to val.',
        level: 'beginner',
        terms: [
          { term: 'val', def: 'A read-only reference. It is set once and can’t point at a new value.' },
          { term: 'var', def: 'A mutable reference. You can assign it a new value later.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make <code>count</code> changeable and keep <code>title</code> fixed.', code: '[[val]] title = "Inbox"\n[[var]] count = 0\ncount += 1', why: 'Only <code>count</code> gets a new value, so only it needs <code>var</code>.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'val user = "Ada"\nvar visits = 0\nvisits = visits + 1\nuser = "Grace"', bug: 3, fix: '// remove it, or declare user with var on line 1', why: '<code>user</code> is a <code>val</code>, so it can’t be reassigned.' },
        ],
        quiz: [
          { q: 'Which of these compiles?', options: ['<code>val a = 1; a = 2</code>', '<code>var b = 1; b = 2</code>', 'Both'], a: 1, why: 'Only a <code>var</code> can take a new value after it is set.' },
          { q: '<code>val list = mutableListOf(1)</code>. Does <code>list.add(2)</code> compile?', options: ['Yes', 'No, val makes the list read-only'], a: 0, why: '<code>val</code> stops you from pointing <code>list</code> at a different list. The list object itself can still change.' },
        ],
        visual(el) {
          const box = (kw, name, value, note) => {
            const slot = h('div', { class: 'slot' }, h('span', { class: 'chip' }, value));
            return Object.assign(h('div', { class: `box ${kw}` }, h('span', { class: 'box-tag', html: hl(`${kw} ${name}`) }), slot, h('small', {}, note)), { well: slot });
          };
          const name = box('val', 'name', '"Ada"', 'read-only');
          const score = box('var', 'score', '10', 'mutable');
          const o = out('Try giving each one a new value.');
          let n = 10;
          el.append(
            h('div', { class: 'stage' }, name, score),
            h('div', { class: 'controls' },
              cmd('name = "Grace"', () => { replay(name, 'shake'); say(o, '<span class="bad">error:</span> Val cannot be reassigned'); }),
              cmd('score += 5', () => { n += 5; swap(score.well, String(n)); say(o, `<span class="good">ok:</span> score is now ${n}`); })),
            o);
        },
      },

      // + types ─────────────────────────────────────
      {
        id: 'types',
        title: 'Basic types and string templates',
        tagline: 'Int, Double, String, and values inside text.',
        body: `
<p>Kotlin works out a type from the value you assign. A whole number is an <code>Int</code>, or a <code>Long</code> when it is too big for Int or ends in <code>L</code>. A decimal is a <code>Double</code>, and <code>0.5f</code> is a <code>Float</code>. You also get <code>Boolean</code>, <code>Char</code> in single quotes and <code>String</code> in double quotes.</p>
<p>Numbers never convert on their own. An Int can’t go where a Long is expected, so you call <code>toLong()</code> or <code>toDouble()</code>. To read a number from text, <code>"42".toInt()</code> works but throws on bad input. <code>toIntOrNull()</code> gives null instead.</p>
<p>Put values inside a string with a template: <code>$name</code> for a plain name, <code>\${count + 1}</code> for any expression. Triple quotes make a raw string that keeps line breaks and needs no escapes.</p>`,
        code: `val count = 42                 // Int
val big = 3_000_000_000        // Long: too big for Int
val price = 9.99               // Double
val ratio = 0.5f               // Float
val done = false               // Boolean
val initial = 'A'              // Char
val name = "Ada"               // String

val total: Long = count.toLong()   // no automatic widening
val parsed = "42".toInt()          // 42
val safe = "4x".toIntOrNull()      // null

println("$name has \${count + 1} points")
val json = """
    {"name": "$name"}
""".trimIndent()`,
        remember: 'The value picks the type. Convert numbers with toX(). $name and ${expr} put values into text.',
        level: 'beginner',
        terms: [
          { term: 'Type inference', def: 'The compiler works out a variable’s type from the value assigned to it, so you don’t have to write it.' },
          { term: 'String template', def: 'A $name or ${expression} inside a string literal that is replaced by its value.' },
          { term: 'Raw string', def: 'A string in triple quotes that keeps line breaks and treats backslashes literally.' },
          { term: 'toIntOrNull', def: 'Parses a string as an Int and returns null instead of throwing when the text is not a number.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Turn the Int into a Long, then print it with a template.', code: 'val count: Int = 21\nval total: Long = count.[[toLong]]()\nprintln("Total: [[$]]total")', why: 'Kotlin never widens numbers for you, so <code>toLong()</code> is required. <code>$total</code> drops the value into the string.' },
          { type: 'bug', prompt: 'One line has a type mismatch. Tap it.', code: 'val count: Int = 10\nval total: Long = count\nval average = total / 2.0\nprintln("Average $average")', bug: 1, fix: 'val total: Long = count.toLong()', why: 'An Int is not a Long, even though every Int fits. Convert it with <code>toLong()</code>.' },
        ],
        quiz: [
          { q: 'What type does <code>val x = 3_000_000_000</code> get?', options: ['<code>Int</code>', '<code>Long</code>', '<code>Double</code>'], a: 1, why: 'The number is bigger than Int’s maximum of about 2.1 billion, so Kotlin picks Long.' },
          { q: '<code>val a = 1; val b = 2</code>. What does <code>"$a + $b"</code> contain?', options: ['<code>"1 + 2"</code>', '<code>"3"</code>', '<code>"$a + $b"</code>'], a: 0, why: 'Each <code>$name</code> is replaced on its own. To compute the sum, write <code>"${a + b}"</code>.' },
          { q: 'What does <code>"abc".toInt()</code> do?', options: ['Returns 0', 'Returns null', 'Throws NumberFormatException'], a: 2, why: '<code>toInt()</code> throws on text that is not a number. Use <code>toIntOrNull()</code> to get null instead.' },
        ],
        visual(el) {
          const decls = [
            { src: 'val a = 42', name: 'a', type: 'Int', value: '42' },
            { src: 'val b = 3_000_000_000', name: 'b', type: 'Long', value: '3000000000', note: 'too big for Int' },
            { src: 'val c = 9.99', name: 'c', type: 'Double', value: '9.99' },
            { src: "val d = 'K'", name: 'd', type: 'Char', value: "'K'" },
            { src: 'val e = "42".toInt()', name: 'e', type: 'Int', value: '42', note: 'parsed from text' },
            { src: 'val f = "4x".toIntOrNull()', name: 'f', type: 'Int?', value: 'null', note: 'not a number, so null' },
            { src: 'val g = "4x".toInt()', error: 'NumberFormatException: For input string: "4x"' },
          ];
          const stage = h('div', { class: 'stage kt-types' });
          const o = out();
          const shown = [];
          const card = (d, anim) => h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, `val ${d.name}`),
            h('span', { class: 'kt-type' }, d.type),
            h('span', { class: 'field' }, `= ${d.value}`));
          function declare(d, anim = true) {
            if (d.error) { replay(stage, 'shake'); say(o, `<span class="bad">crash:</span> ${d.error}`); return; }
            const old = shown.find(x => x.d === d);
            if (old) replay(old.el, 'pop');
            else {
              const c = card(d, anim); stage.append(c); shown.push({ d, el: c });
              if (shown.length > 4) shown.shift().el.remove();
            }
            say(o, `${hl(d.src)}  <span class="muted">// ${d.type}${d.note ? ', ' + d.note : ''}</span>`);
          }
          // String template part
          const count = 4;
          const nameIn = h('input', { id: 'kt-types-name', value: 'Ada', spellcheck: 'false', autocomplete: 'off', maxlength: '14' });
          const decl = h('div', { class: 'kt' });
          const tpl = h('div', { class: 'kt kt-tpl' });
          const o2 = out();
          const parts = [
            { html: hl('println(') + '<span class="t-s">"Hi, </span>' },
            { hole: '$name', val: () => nameIn.value },
            { html: '<span class="t-s">! You have </span>' },
            { hole: '${count + 1}', val: () => String(count + 1) },
            { html: '<span class="t-s"> new messages"</span>)' },
          ];
          let busy = false;
          const paintTpl = () => {
            decl.innerHTML = hl(`val name = ${JSON.stringify(nameIn.value)}\nval count = ${count}`);
            tpl.replaceChildren(...parts.map(p => (p.hole ? h('span', { class: 'kt-hole' }, p.hole) : h('span', { html: p.html }))));
          };
          async function evaluate() {
            if (busy) return; busy = true; paintTpl();
            const spans = [...tpl.children];
            for (let i = 0; i < parts.length; i++) {
              if (!parts[i].hole) continue;
              spans[i].classList.add('on'); await sleep(500);
              if (!tpl.isConnected) return;
              spans[i].textContent = parts[i].val(); spans[i].className = 't-s kt-filled'; replay(spans[i], 'flip');
              await sleep(380);
            }
            say(o2, `Hi, ${nameIn.value.replace(/[<&]/g, '')}! You have ${count + 1} new messages`);
            busy = false;
          }
          nameIn.addEventListener('input', () => { if (!busy) { paintTpl(); say(o2, 'Press Run to fill the template.'); } });
          declare(decls[0], false); declare(decls[2], false);
          say(o, 'Declare a value. Kotlin works out its type.');
          paintTpl(); say(o2, 'Press Run to fill the template.');
          el.append(
            stage,
            h('div', { class: 'controls' }, decls.map(d => cmd(d.src, () => declare(d)))),
            o,
            h('p', { class: 'tip' }, 'String templates: each hole is replaced by its value.'),
            h('label', { class: 'field-input', for: 'kt-types-name' }, 'name =', nameIn),
            decl, tpl,
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: evaluate }, 'Run println')),
            o2);
        },
      },

      // + control ─────────────────────────────────────
      {
        id: 'control',
        title: 'Control flow and ranges',
        tagline: 'if returns a value, for walks a range.',
        body: `
<p>In Kotlin <code>if</code> is an expression: it hands back a value. <code>val max = if (a > b) a else b</code> replaces the ternary operator other languages have.</p>
<p><code>for</code> walks over anything you can iterate, most often a range. <code>1..5</code> includes both ends. <code>0 until 5</code> (or <code>0..&lt;5</code>) stops before the end, which suits list indexes. <code>5 downTo 1</code> counts down, and <code>step 2</code> skips values.</p>
<p>Use <code>while</code> when you don’t know the count in advance, and <code>repeat(3) { }</code> when you just need something done n times. Pick a range below and walk it.</p>`,
        code: `val max = if (a > b) a else b      // if returns a value

for (i in 1..5) print(i)           // 12345
for (i in 0 until 5) print(i)      // 01234
for (i in 5 downTo 1) print(i)     // 54321
for (i in 0..10 step 3) print(i)   // 0369

for ((index, name) in names.withIndex()) {
    println("$index: $name")
}

var tries = 3
while (tries > 0) { tries-- }
repeat(3) { println("Hi") }`,
        remember: '.. includes the end, until stops before it. downTo counts down, step skips. if gives back a value.',
        level: 'beginner',
        terms: [
          { term: 'Range (..)', def: 'An inclusive sequence of values from a start to an end, like 1..5, which you can loop over or test with in.' },
          { term: 'until', def: 'Builds a range that stops before its end value, so 0 until 3 is 0, 1, 2.' },
          { term: 'downTo', def: 'Builds a range that counts down, like 5 downTo 1, and can be combined with step.' },
          { term: 'if expression', def: 'An if with an else branch that returns a value, so it can be assigned or returned.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print 10, 8, 6, 4, 2, 0.', code: 'for (i in 10 [[downTo]] 0 [[step]] 2) {\n    println(i)\n}', why: '<code>downTo</code> counts down from 10 to 0, and <code>step 2</code> skips every other value.' },
          { type: 'bug', prompt: 'This loop crashes with IndexOutOfBoundsException. Tap the line.', code: 'val items = listOf("a", "b", "c")\nfor (i in 0..items.size) {\n    println(items[i])\n}', bug: 1, fix: 'for (i in items.indices) {   // or 0 until items.size', why: '<code>..</code> includes the end, so the last round reads <code>items[3]</code>. Valid indexes stop at <code>size - 1</code>.' },
        ],
        quiz: [
          { q: 'How many times does <code>for (i in 1..3)</code> run?', options: ['2', '3', '4'], a: 1, why: '<code>1..3</code> includes both ends: 1, 2, 3.' },
          { q: '<code>(1 until 4).toList()</code> is', options: ['<code>[1, 2, 3]</code>', '<code>[1, 2, 3, 4]</code>', '<code>[2, 3]</code>'], a: 0, why: '<code>until</code> stops before the end value.' },
          { q: 'Does <code>val label = if (ok) "yes" else "no"</code> compile?', options: ['Yes, if is an expression', 'No, use a ternary <code>?:</code>'], a: 0, why: 'Kotlin has no ternary operator. <code>if</code> with an <code>else</code> returns a value.' },
        ],
        visual(el) {
          const ranges = [
            { src: '1..5', vals: [1, 2, 3, 4, 5] },
            { src: '0 until 5', vals: [0, 1, 2, 3, 4] },
            { src: '5 downTo 1', vals: [5, 4, 3, 2, 1] },
            { src: '0..10 step 3', vals: [0, 3, 6, 9] },
            { src: '10 downTo 0 step 2', vals: [10, 8, 6, 4, 2, 0] },
          ];
          let cur = ranges[0], busy = false;
          const cells = Array.from({ length: 11 }, (_, i) => h('span', { class: 'kt-cell' }, String(i)));
          const line = h('div', { class: 'kt-line', role: 'img', 'aria-label': 'Number line from 0 to 10' }, cells);
          const loop = h('div', { class: 'kt' });
          const ifLine = h('div', { class: 'kt' });
          const o = out();
          const buttons = ranges.map(r => cmd(r.src, () => { if (busy) return; cur = r; paint(); replay(line, 'pop-soft'); }));
          const ifSrc = 'val kind = if (i % 2 == 0) "even" else "odd"';
          function paint() {
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', ranges[i] === cur));
            loop.innerHTML = hl(`for (i in ${cur.src}) print("$i ")`);
            ifLine.innerHTML = hl(ifSrc);
            cells.forEach((c, i) => { c.className = 'kt-cell' + (cur.vals.includes(i) ? ' in' : ' skip'); });
            say(o, `<span class="muted">${cur.vals.length} values in the range. Press Run loop.</span>`);
          }
          async function walk() {
            if (busy) return; busy = true; paint(); o.replaceChildren();
            for (const v of cur.vals) {
              cells.forEach(c => c.classList.remove('at'));
              cells[v].classList.add('at', 'seen');
              o.append(h('span', { class: 'kt-printed drop-in' }, v + ' '));
              ifLine.innerHTML = hl(ifSrc) + `  <span class="t-c">// i = ${v} → "${v % 2 === 0 ? 'even' : 'odd'}"</span>`;
              await sleep(520);
              if (!line.isConnected) return;
            }
            cells.forEach(c => c.classList.remove('at'));
            o.append(h('span', { class: 'muted' }, ` // ran ${cur.vals.length} times`));
            busy = false;
          }
          paint();
          el.append(
            h('div', { class: 'controls' }, buttons),
            line, loop, ifLine,
            h('div', { class: 'controls' }, h('button', { class: 'btn primary small', onclick: walk }, 'Run loop')),
            o);
        },
      },

      // 2 ─────────────────────────────────────────────
      {
        id: 'nulls',
        title: 'Null safety',
        tagline: 'Maybe-missing values are part of the type.',
        body: `
<p>In Kotlin a <code>String</code> can never be null. If a value might be missing, you say so in the type with a question mark: <code>String?</code>.</p>
<p>The compiler then makes you deal with the missing case before you use the value. You have four tools: <code>?.</code> calls only when there is a value, <code>?:</code> (the Elvis operator) supplies a fallback, <code>if (x != null)</code> smart-casts, and <code>!!</code> says “trust me” and crashes if you are wrong.</p>
<p>Flip the value to <code>null</code> below and send it through each expression.</p>`,
        code: `val name: String? = null

name.length          // won't compile
name?.length         // null
name?.length ?: 0    // 0
name!!.length        // throws NullPointerException

if (name != null) {
    name.length      // smart cast: name is a String in here
}`,
        remember: 'Type? means maybe null. ?. skips, ?: falls back, !! crashes.',
        level: 'beginner',
        terms: [
          { term: 'Nullable type', def: 'A type ending in ?, like String?, that can also hold null.' },
          { term: 'Safe call (?.)', def: 'Calls a member only when the value is not null, and gives null otherwise.' },
          { term: 'Elvis operator (?:)', def: 'Returns the left side when it is not null, and the right side when it is.' },
          { term: 'Not-null assertion (!!)', def: 'Treats a nullable value as non-null and throws NullPointerException if it is null.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Get the length, or 0 when there is no input.', code: 'val input: String? = readlnOrNull()\nval len = input[[?.]]length [[?:]] 0', why: '<code>?.</code> gives null when <code>input</code> is null, and <code>?:</code> swaps that null for 0.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'fun greet(user: User?) {\n    val name = user?.name ?: "guest"\n    println("Hi, $name")\n    println(user.email)\n}', bug: 3, fix: '    println(user?.email ?: "no email")', why: '<code>user</code> is nullable, so a plain <code>.</code> call is not allowed. Use <code>?.</code> and give a fallback.' },
        ],
        quiz: [
          { q: '<code>val n: String? = null</code>. What is <code>n?.length ?: -1</code>?', options: ['<code>null</code>', '<code>-1</code>', '<code>0</code>', 'It throws'], a: 1, why: '<code>?.</code> produces null, so Elvis supplies -1.' },
          { q: 'When is <code>!!</code> a reasonable choice?', options: ['Whenever the compiler complains about nulls', 'When a null there would be a bug you want to see right away', 'Never, it does not compile'], a: 1, why: '<code>!!</code> turns null into a crash. Use it only where null means a programming mistake.' },
          { q: 'Which type can hold <code>null</code>?', options: ['<code>String</code>', '<code>String?</code>', 'Both'], a: 1, why: 'Only types with <code>?</code> allow null.' },
        ],
        visual(el) {
          let isNull = false, running = false;
          const track = h('div', { class: 'track' });
          const o = out('Pick an expression to watch the value travel.');
          const toggle = cmd('', () => { if (running) return; isNull = !isNull; paint(); }, { 'aria-label': 'Toggle the value of name' });
          const paint = () => { toggle.innerHTML = hl(`val name: String? = ${isNull ? 'null' : '"Kotlin"'}`) + '  <span class="muted">⇄ tap to flip</span>'; track.replaceChildren(); say(o, 'Pick an expression to watch the value travel.'); };
          const len = v => (v == null ? null : v.length);
          const exprs = [
            { src: 'name.length', error: 'Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type String?' },
            { src: 'name?.length', steps: [['?.length', len]] },
            { src: 'name?.length ?: 0', steps: [['?.length', len], ['?: 0', v => v ?? 0]] },
            { src: 'name!!.length', steps: [['!!.length', v => { if (v == null) throw new Error('NullPointerException'); return v.length; }]] },
          ];
          async function run(x) {
            if (running) return;
            track.replaceChildren();
            if (x.error) { say(o, `<span class="bad">compile error:</span> ${x.error}`); replay(o, 'shake'); return; }
            running = true;
            let v = isNull ? null : 'Kotlin';
            const labels = ['name', ...x.steps.map(s => s[0])];
            const stations = labels.map(label => h('div', { class: 'station' }, h('span', { class: 'st-label' }, label)));
            track.append(...stations);
            const token = h('span', { class: 'token' });
            for (let i = 0; i < stations.length; i++) {
              if (i > 0) {
                try { v = x.steps[i - 1][1](v); } catch (e) {
                  token.textContent = 'NPE'; token.className = 'token boom';
                  stations[i].append(token); replay(stations[i], 'shake');
                  say(o, `<span class="bad">crash:</span> ${e.message}`);
                  running = false; return;
                }
              }
              token.textContent = show(v);
              token.className = 'token' + (v == null ? ' is-null' : '');
              stations[i].classList.add('on'); stations[i].append(token); replay(token, 'pop');
              await sleep(650);
            }
            say(o, `<span class="good">result:</span> ${hl(x.src)} = ${hl(show(v))}`);
            running = false;
          }
          paint();
          el.append(h('div', { class: 'controls' }, toggle), track, h('div', { class: 'controls' }, exprs.map(x => cmd(x.src, () => run(x)))), o);
        },
      },

      // 3 ─────────────────────────────────────────────
      {
        id: 'lambdas',
        title: 'Functions and lambdas',
        tagline: 'Functions are values you can pass around.',
        body: `
<p>A function is declared with <code>fun</code>. When the body is a single expression, write it after <code>=</code> and skip the braces and <code>return</code>.</p>
<p>A lambda is a function without a name, written in braces: <code>{ x -> x * 2 }</code>. You can store it in a variable, pass it to another function, or return it. Its type reads like a tiny arrow diagram: <code>(Int) -> Int</code> takes an Int and gives back an Int.</p>
<p>When a lambda has exactly one parameter, you can drop the name and call it <code>it</code>. When it is the last argument, it moves outside the parentheses: <code>list.map { it * 2 }</code>.</p>`,
        code: `fun double(x: Int): Int = x * 2

val triple: (Int) -> Int = { x -> x * 3 }
val isEven: (Int) -> Boolean = { it % 2 == 0 }

double(4)      // 8
triple(4)      // 12
isEven(4)      // true

listOf(1, 2, 3).map { it * 10 }   // [10, 20, 30]`,
        remember: '{ x -> body } is a function value. One parameter? Call it it. Last argument? Move it outside ( ).',
        level: 'beginner',
        terms: [
          { term: 'Lambda', def: 'A function without a name, written in braces, that you can store or pass as a value.' },
          { term: 'Function type', def: 'A type like (Int) -> String that describes what a function takes and returns.' },
          { term: 'it', def: 'The implicit name of the single parameter of a lambda that doesn’t declare one.' },
          { term: 'Trailing lambda', def: 'A lambda passed as the last argument and written after the parentheses.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete the function type and the implicit parameter name.', code: 'val square: (Int) -> [[Int]] = { x -> x * x }\nval names = users.map { [[it]].name }', why: '<code>square</code> takes an Int and returns an Int. A one-parameter lambda can call its parameter <code>it</code>.' },
          { type: 'bug', prompt: 'This function won’t compile. Tap the wrong line.', code: 'fun doubled(prices: List<Int>): List<Int> {\n    return prices.map { p ->\n        return p * 2\n    }\n}', bug: 2, fix: '        p * 2   // the last expression is the result', why: 'A bare <code>return</code> inside a lambda returns from <code>doubled</code> itself, with an Int instead of a List. The last expression of a lambda is already its result.' },
        ],
        quiz: [
          { q: 'What is the type of <code>{ s: String -> s.length }</code>?', options: ['<code>(String) -> Int</code>', '<code>(Int) -> String</code>', '<code>String</code>'], a: 0, why: 'It takes a String and returns its length, an Int.' },
          { q: '<code>listOf(1, 2, 3).map { it + 1 }</code> returns', options: ['<code>[1, 2, 3]</code>', '<code>[2, 3, 4]</code>', '<code>6</code>'], a: 1, why: '<code>it</code> is each item in turn, so every item gets 1 added.' },
        ],
        visual(el) {
          const fns = [
            { src: '{ x -> x * 2 }', type: '(Int) -> Int', f: x => x * 2 },
            { src: '{ x -> x + 10 }', type: '(Int) -> Int', f: x => x + 10 },
            { src: '{ it * it }', type: '(Int) -> Int', f: x => x * x },
            { src: '{ it % 2 == 0 }', type: '(Int) -> Boolean', f: x => x % 2 === 0 },
          ];
          let cur = fns[0], x = 3, busy = false;
          const sig = h('div', { class: 'kt' });
          const body = h('div', { class: 'kt' });
          const machine = h('div', { class: 'machine' }, h('div', { class: 'gear' }), body);
          const inSlot = h('div', { class: 'slot' }), outSlot = h('div', { class: 'slot' });
          const o = out('Pick a lambda, then call it.');
          const buttons = fns.map(fn => cmd(fn.src, () => { if (busy) return; cur = fn; paint(); }));
          function paint() {
            sig.innerHTML = hl(`val f: ${cur.type} = ${cur.src}`);
            body.innerHTML = hl(cur.src);
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', fns[i] === cur));
            inSlot.replaceChildren(h('span', { class: 'chip' }, String(x)));
            outSlot.replaceChildren();
          }
          async function call() {
            if (busy) return; busy = true;
            const chip = inSlot.firstElementChild;
            chip.classList.add('feed'); machine.classList.add('busy');
            await sleep(500); chip.remove(); await sleep(450);
            machine.classList.remove('busy');
            const r = cur.f(x);
            outSlot.replaceChildren(h('span', { class: `chip drop-in${typeof r === 'boolean' ? ' bool' : ''}` }, String(r)));
            say(o, `${hl(`f(${x})`)} <span class="muted">returns</span> ${hl(String(r))}`);
            x = (x % 9) + 1;
            await sleep(300);
            inSlot.replaceChildren(h('span', { class: 'chip drop-in' }, String(x)));
            busy = false;
          }
          paint();
          el.append(sig,
            h('div', { class: 'stage' }, inSlot, h('span', { class: 'arrow' }, '→'), machine, h('span', { class: 'arrow' }, '→'), outSlot),
            h('div', { class: 'controls' }, buttons, h('button', { class: 'btn primary small', onclick: call }, 'Call f(x)')),
            o);
        },
      },

      // 4 ─────────────────────────────────────────────
      {
        id: 'collections',
        title: 'Collection operations',
        tagline: 'filter, map, take, sum: an assembly line for lists.',
        body: `
<p>Kotlin lists come with operations that take a lambda and return a <em>new</em> list. The original stays as it was.</p>
<p><code>filter</code> keeps the items where the lambda returns true. <code>map</code> turns each item into something else. <code>take(n)</code> keeps the first n. Terminal operations like <code>sum()</code> or <code>first()</code> collapse the list into a single value.</p>
<p>Read a chain top to bottom, one step at a time. Build one below and watch each step happen.</p>`,
        code: `val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8)

val result = numbers
    .filter { it % 2 == 0 }   // [2, 4, 6, 8]
    .map { it * it }          // [4, 16, 36, 64]
    .take(3)                  // [4, 16, 36]
    .sum()                    // 56`,
        remember: 'filter keeps, map transforms, take trims, sum collapses. Each step returns a new list.',
        level: 'beginner',
        terms: [
          { term: 'filter', def: 'Returns a new list with only the items for which the lambda returns true.' },
          { term: 'map', def: 'Returns a new list with the lambda applied to every item.' },
          { term: 'Terminal operation', def: 'An operation like sum(), first() or count() that turns a collection into a single value.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add up the amounts of paid orders only.', code: 'val total = orders\n    .[[filter]] { it.paid }\n    .[[map]] { it.amount }\n    .sum()', why: '<code>filter</code> drops unpaid orders, <code>map</code> turns each order into its amount, and <code>sum()</code> adds them.' },
          { type: 'bug', prompt: '<code>people</code> can be empty. One line crashes then.', code: 'fun summary(people: List<Person>): String {\n    val adults = people.filter { it.age >= 18 }\n    val youngest = adults.minBy { it.age }\n    return "${adults.size} adults, youngest ${youngest?.name}"\n}', bug: 2, fix: '    val youngest = adults.minByOrNull { it.age }', why: '<code>minBy</code> throws <code>NoSuchElementException</code> on an empty list. <code>minByOrNull</code> returns null instead.' },
        ],
        quiz: [
          { q: '<code>listOf(1, 2, 3, 4).filter { it > 2 }</code>', options: ['<code>[1, 2]</code>', '<code>[3, 4]</code>', '<code>[true, true]</code>'], a: 1, why: '<code>filter</code> keeps the items where the lambda is true.' },
          { q: 'After <code>val b = a.map { it * 2 }</code>, what is in <code>a</code>?', options: ['The doubled values', 'The original values', 'Nothing'], a: 1, why: 'Collection operations return a new list and leave the original alone.' },
          { q: '<code>listOf(1, 2, 3).map { it * 2 }.sum()</code>', options: ['<code>6</code>', '<code>12</code>', '<code>[2, 4, 6]</code>'], a: 1, why: '2 + 4 + 6 = 12.' },
        ],
        visual(el) {
          let items, lines, busy = false;
          const row = h('div', { class: 'stage' });
          const chain = h('pre', { class: 'code mini' });
          const o = out();
          const paint = () => {
            chain.innerHTML = hl(lines.join('\n'));
            o.innerHTML = hl(Array.isArray(items) ? `[${items.map(c => c.v).join(', ')}]` : String(items));
          };
          const reset = () => {
            items = [1, 2, 3, 4, 5, 6, 7, 8].map(v => ({ v, el: h('span', { class: 'chip' }, String(v)) }));
            row.replaceChildren(...items.map(c => c.el));
            lines = ['listOf(1, 2, 3, 4, 5, 6, 7, 8)'];
            paint();
          };
          const drop = async keep => {
            const gone = items.filter(c => !keep(c));
            gone.forEach(c => c.el.classList.add('leave'));
            await sleep(450);
            gone.forEach(c => c.el.remove());
            items = items.filter(keep);
          };
          const ops = [
            { src: '.filter { it % 2 == 0 }', run: () => drop(c => c.v % 2 === 0) },
            { src: '.filter { it > 3 }', run: () => drop(c => c.v > 3) },
            { src: '.map { it * it }', run: async () => {
              items.forEach((c, i) => setTimeout(() => {
                replay(c.el, 'flip');
                setTimeout(() => { c.el.textContent = String(c.v); }, 200);
              }, i * 90));
              items.forEach(c => { c.v = c.v * c.v; });
              await sleep(items.length * 90 + 450);
            } },
            { src: '.take(3)', run: () => { const keep = new Set(items.slice(0, 3)); return drop(c => keep.has(c)); } },
            { src: '.sum()', run: async () => {
              items.forEach(c => c.el.classList.add('leave'));
              await sleep(450);
              items = items.reduce((s, c) => s + c.v, 0);
              row.replaceChildren(h('span', { class: 'chip total drop-in' }, String(items)));
            } },
          ];
          reset();
          el.append(row,
            h('div', { class: 'controls' }, ops.map(op => cmd(op.src, async () => {
              if (busy) return;
              if (!Array.isArray(items)) { say(o, '<span class="bad">error:</span> sum() returned an Int. Press Reset to start a new chain.'); return; }
              busy = true; await op.run(); lines.push('    ' + op.src); paint(); busy = false;
            }))),
            chain, o);
        },
      },

      // 5 ─────────────────────────────────────────────
      {
        id: 'when',
        title: 'when expressions',
        tagline: 'Top to bottom, first match wins.',
        body: `
<p><code>when</code> checks its branches from top to bottom and runs the <em>first</em> one that matches. It is an expression, so it hands back a value you can store or return.</p>
<p>A branch can match an exact value, a range with <code>in 1..9</code>, or a type with <code>is</code>. After an <code>is String</code> match, Kotlin smart-casts, so you can use <code>x.length</code> right away. <code>else</code> catches whatever is left.</p>
<p>Pick a value and watch the scan. Notice that <code>0</code> never reaches <code>is Int</code>.</p>`,
        code: `fun describe(x: Any): String = when (x) {
    0         -> "zero"
    is Int    -> if (x > 0) "positive" else "negative"
    is String -> "text, \${x.length} chars"
    is Double -> "a Double"
    else      -> "something else"
}`,
        remember: 'when runs the first matching branch, top to bottom, and returns its value.',
        level: 'beginner',
        terms: [
          { term: 'when', def: 'An expression that checks its branches from top to bottom and returns the value of the first one that matches.' },
          { term: 'Smart cast', def: 'After a type or null check, the compiler treats the value as the checked type without an explicit cast.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Match the range and catch everything else.', code: 'val label = when (code) {\n    200 -> "OK"\n    [[in]] 500..599 -> "Server error"\n    [[else]] -> "Other"\n}', why: '<code>in</code> matches a range. <code>else</code> covers every value the other branches miss.' },
          { type: 'bug', prompt: 'A score of 95 returns "pass". Tap the line that can never match.', code: 'fun grade(score: Int): String = when {\n    score >= 50 -> "pass"\n    score >= 90 -> "excellent"\n    else -> "fail"\n}', bug: 2, fix: '    // move this above score >= 50: put the narrow check first', why: 'The first match wins. Every score of 90 or more already matched <code>score >= 50</code>, so the narrower branch has to come first.' },
        ],
        quiz: [
          { q: 'With the code above, what does <code>describe(0)</code> return?', options: ['<code>"zero"</code>', '<code>"negative"</code>', 'Both branches run'], a: 0, why: 'The <code>0</code> branch comes first and only the first match runs.' },
          { q: 'Inside <code>is String -> ...</code>, why can you write <code>x.length</code>?', options: ['x is smart-cast to String in that branch', 'Any has a length property', 'You can’t, it needs a cast'], a: 0, why: 'After an <code>is</code> check, Kotlin treats the value as that type inside the branch.' },
        ],
        visual(el) {
          const values = [
            { label: '0', type: 'Int', v: 0 }, { label: '42', type: 'Int', v: 42 }, { label: '-7', type: 'Int', v: -7 },
            { label: '"Kotlin"', type: 'String', v: 'Kotlin' }, { label: '3.14', type: 'Double', v: 3.14 }, { label: 'true', type: 'Boolean', v: true },
          ];
          const branches = [
            { line: '0         -> "zero"', test: x => x.type === 'Int' && x.v === 0, res: () => '"zero"' },
            { line: 'is Int    -> if (x > 0) "positive" else "negative"', test: x => x.type === 'Int', res: x => (x.v > 0 ? '"positive"' : '"negative"') },
            { line: 'is String -> "text, ${x.length} chars"', test: x => x.type === 'String', res: x => `"text, ${x.v.length} chars"` },
            { line: 'is Double -> "a Double"', test: x => x.type === 'Double', res: () => '"a Double"' },
            { line: 'else      -> "something else"', test: () => true, res: () => '"something else"' },
          ];
          let busy = false;
          const head = h('div', { class: 'branch head' });
          const rows = branches.map(b => h('div', { class: 'branch', html: '    ' + hl(b.line) }));
          const o = out('Pick a value for x.');
          async function check(x) {
            if (busy) return; busy = true;
            rows.forEach(r => { r.className = 'branch'; });
            head.innerHTML = hl(`when (${x.label}) {`);
            for (let i = 0; i < branches.length; i++) {
              rows[i].classList.add('scan'); await sleep(420); rows[i].classList.remove('scan');
              if (branches[i].test(x)) {
                rows[i].classList.add('hit');
                rows.slice(i + 1).forEach(r => r.classList.add('skip'));
                say(o, `${hl(`describe(${x.label})`)} <span class="muted">=</span> ${hl(branches[i].res(x))}`);
                break;
              }
              rows[i].classList.add('miss');
            }
            busy = false;
          }
          head.innerHTML = hl('when (x) {');
          el.append(
            h('div', { class: 'controls' }, values.map(x => cmd(`x = ${x.label}`, () => check(x)))),
            h('div', { class: 'when' }, head, rows, h('div', { class: 'branch head' }, '}')),
            o);
        },
      },

      // + classes ───────────────────────────────────
      {
        id: 'classes',
        title: 'Classes and constructors',
        tagline: 'Primary constructor, init blocks, default arguments.',
        body: `
<p>The parentheses after a class name are its <em>primary constructor</em>. Write <code>val</code> or <code>var</code> in front of a parameter and it becomes a property you can read later. Without it, the parameter only exists while the object is being built. There is no <code>new</code> keyword: <code>User("Ada", 36)</code> creates an object.</p>
<p>When an object is created, property initializers and <code>init</code> blocks run from top to bottom, in the order you wrote them. Use <code>init</code> for setup that needs the constructor values.</p>
<p>Give a parameter a default value and callers can skip it. Named arguments like <code>User(name = "Cy")</code> make calls readable. A secondary <code>constructor</code> must call the primary one through <code>this(...)</code>, and in Kotlin default arguments usually replace it.</p>`,
        code: `class User(val name: String, val age: Int = 18) {
    val isAdult = age >= 18

    init {
        println("Created $name, age $age")
    }

    constructor(name: String, born: Int, year: Int) :
        this(name, year - born) {
        println("from birth year")
    }

    fun greet() = "Hi, I'm $name"
}

val a = User("Ada", 36)
val b = User("Bo")                   // age = 18
val c = User(age = 20, name = "Cy")  // named arguments
val d = User("Dee", 1990, 2026)      // secondary: age = 36`,
        remember: 'val in the constructor makes a property. init runs at creation. Defaults beat extra constructors.',
        level: 'beginner',
        terms: [
          { term: 'Primary constructor', def: 'The parameter list in a class header; parameters marked val or var become properties.' },
          { term: 'init block', def: 'A block in a class body that runs when an object is created, in order with the property initializers.' },
          { term: 'Secondary constructor', def: 'An extra constructor declared with constructor that must delegate to the primary one with this(...).' },
          { term: 'Default argument', def: 'A value given to a parameter in its declaration, used when the caller leaves that argument out.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let callers skip the seconds, and log every new timer.', code: 'class Timer(val seconds: Int [[=]] 60) {\n    [[init]] {\n        println("Timer for $seconds s")\n    }\n}\nval t = Timer()', why: '<code>= 60</code> is a default argument, so <code>Timer()</code> compiles. The <code>init</code> block runs each time a Timer is created.' },
          { type: 'bug', prompt: '<code>describe()</code> won’t compile. Tap the line to fix.', code: 'class Account(owner: String) {\n    var balance = 0\n    fun describe() = "$owner has $balance"\n}', bug: 0, fix: 'class Account(val owner: String) {', why: 'Without <code>val</code>, <code>owner</code> is only a constructor parameter. Member functions can’t see it. <code>val</code> makes it a property.' },
        ],
        quiz: [
          { q: '<code>class P(name: String)</code>. Does <code>P("Ada").name</code> compile?', options: ['Yes', 'No, name is not a property'], a: 1, why: 'Only parameters marked <code>val</code> or <code>var</code> become properties.' },
          { q: 'With the code above, what is <code>User("Bo").age</code>?', options: ['<code>0</code>', '<code>18</code>', 'It doesn’t compile'], a: 1, why: 'The caller skipped <code>age</code>, so its default of 18 is used.' },
          { q: 'When does an <code>init</code> block run?', options: ['Each time an object is created', 'Once, when the class is loaded', 'Only if you call it'], a: 0, why: '<code>init</code> is part of construction, so it runs for every new object.' },
        ],
        visual(el) {
          const src = [
            'class User(val name: String, val age: Int = 18) {',
            '    val isAdult = age >= 18',
            '    init { println("Created $name, age $age") }',
            '    constructor(name: String, born: Int, year: Int) :',
            '        this(name, year - born) { println("from birth year") }',
            '}',
          ];
          const rows = src.map(s => h('div', { class: 'branch', html: hl(s) }));
          const stage = h('div', { class: 'stage' });
          const con = h('div', { class: 'out', 'aria-live': 'polite' });
          const o = out();
          const objs = [];
          let busy = false;
          const calls = [
            { src: 'User("Ada", 36)', name: 'Ada', age: 36, bind: 'name = "Ada", age = 36' },
            { src: 'User("Bo")', name: 'Bo', age: 18, bind: 'name = "Bo", age not passed: default 18' },
            { src: 'User(age = 20, name = "Cy")', name: 'Cy', age: 20, bind: 'named arguments: order doesn’t matter' },
            { src: 'User("Dee", 1990, 2026)', name: 'Dee', age: 36, secondary: true },
          ];
          const card = (u, anim) => h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, `User`),
            h('span', { class: 'field' }, `name = "${u.name}"`),
            h('span', { class: 'field' }, `age = ${u.age}`),
            h('span', { class: 'field changed' }, `isAdult = ${u.age >= 18}`));
          const addObj = (u, anim) => { const c = card(u, anim); stage.append(c); objs.push(c); if (objs.length > 3) objs.shift().remove(); };
          const log = text => con.append(h('div', { class: 'line drop-in' }, text));
          async function step(i, note) {
            rows.forEach(r => r.classList.remove('kt-on'));
            rows[i].classList.add('kt-on');
            say(o, note);
            await sleep(700);
            return rows[0].isConnected;
          }
          async function create(c) {
            if (busy) return; busy = true;
            con.replaceChildren();
            if (c.secondary) {
              if (!await step(3, '3 arguments: the secondary constructor matches')) return;
              if (!await step(4, `it delegates first: ${hl('this("Dee", 2026 - 1990)')}`)) return;
            }
            if (!await step(0, `primary constructor: ${c.secondary ? 'name = "Dee", age = 36' : c.bind}`)) return;
            if (!await step(1, `property initializer: isAdult = ${c.age >= 18}`)) return;
            if (!await step(2, 'init block runs')) return;
            log(`Created ${c.name}, age ${c.age}`);
            if (c.secondary) { if (!await step(4, 'then the secondary constructor’s own body')) return; log('from birth year'); }
            rows.forEach(r => r.classList.remove('kt-on'));
            addObj(c, true);
            say(o, `<span class="good">ok:</span> ${hl(`val u = ${c.src}`)}`);
            busy = false;
          }
          addObj(calls[0], false); log('Created Ada, age 36');
          say(o, 'Create a User and watch the order things run in.');
          el.append(
            h('div', { class: 'when' }, rows),
            h('div', { class: 'controls' }, calls.map(c => cmd(c.src, () => create(c)))),
            o, stage, con);
        },
      },

      // + inheritance ─────────────────────────────────
      {
        id: 'inheritance',
        title: 'Interfaces, abstract and open classes',
        tagline: 'Classes are final until you open them.',
        body: `
<p>In Kotlin, classes and their functions are <em>final</em> by default: nobody can extend or override them. Mark a class <code>open</code> to allow subclasses, and mark each function <code>open</code> that may be replaced. The subclass writes <code>override</code>.</p>
<p>A subclass header calls the parent’s constructor: <code>class Dog : Animal()</code>. An <code>abstract</code> class can’t be created on its own, and its <code>abstract</code> members have no body, so every subclass must provide one. An <code>interface</code> has no constructor and holds no state, but it can give functions a default body. A class extends at most one class and can implement many interfaces.</p>
<p>This lesson covers the syntax. When to use each one is in the OOP track. Switch the kind of <code>Animal</code> below and try the same three lines.</p>`,
        code: `interface Named {
    val name: String
    fun describe() = "I am $name"     // default body
}

abstract class Animal(override val name: String) : Named {
    abstract fun sound(): String      // no body: subclasses must override
    open fun move() = "walks"         // open: may be overridden
    fun breathe() = "breathes"        // final: can't be overridden
}

class Bird(name: String) : Animal(name) {
    override fun sound() = "Tweet"
    override fun move() = "flies"
}

val b = Bird("Robin")
b.describe()   // "I am Robin"
b.move()       // "flies"`,
        remember: 'Final by default. open allows it, override does it, abstract demands it. Interfaces: no constructor, many allowed.',
        level: 'beginner',
        terms: [
          { term: 'open', def: 'A modifier that allows a class to be subclassed or a member to be overridden, since both are final by default.' },
          { term: 'override', def: 'Marks a member that replaces an open or abstract member from a superclass or interface.' },
          { term: 'Abstract class', def: 'A class that can’t be instantiated and may declare abstract members that subclasses must implement.' },
          { term: 'Interface', def: 'A type that declares members a class promises to provide; it can have default bodies but no constructor or stored state.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Let <code>Button</code> extend <code>View</code> and replace <code>draw()</code>.', code: '[[open]] class View {\n    [[open]] fun draw() = println("view")\n}\nclass Button : View() {\n    [[override]] fun draw() = println("button")\n}', why: 'The class and the function both need <code>open</code>, and the subclass must say <code>override</code>.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'interface Clickable {\n    fun onClick()\n}\n\nclass SaveButton : Clickable() {\n    override fun onClick() = save()\n}', bug: 4, fix: 'class SaveButton : Clickable {', why: 'An interface has no constructor, so there is nothing to call. Drop the parentheses.' },
        ],
        quiz: [
          { q: '<code>class A</code> and <code>class B : A()</code>. Does it compile?', options: ['Yes', 'No, A is final'], a: 1, why: 'Classes are final unless marked <code>open</code> or <code>abstract</code>.' },
          { q: 'Can you write <code>Shape()</code> when <code>Shape</code> is abstract?', options: ['Yes', 'No'], a: 1, why: 'An abstract class can only be created through a concrete subclass.' },
          { q: 'How many classes can a Kotlin class extend, and how many interfaces can it implement?', options: ['One class, many interfaces', 'Many of both', 'One of each'], a: 0, why: 'Kotlin has single class inheritance, but a class can implement any number of interfaces.' },
        ],
        visual(el) {
          const dogOpen = 'class Dog : Animal() {\n    override fun sound() = "Woof"\n}';
          const modes = {
            final: { label: 'class Animal', tag: 'final', base: 'class Animal {\n    fun sound() = "..."\n}', dog: dogOpen, dogErr: 'This type is final, so it cannot be inherited from.' },
            open: { label: 'open class Animal', tag: 'open', base: 'open class Animal {\n    open fun sound() = "..."\n}', dog: dogOpen },
            abstract: { label: 'abstract class Animal', tag: 'abstract', base: 'abstract class Animal {\n    abstract fun sound(): String\n}', dog: dogOpen, makeErr: 'Cannot create an instance of an abstract class.' },
            iface: { label: 'interface Animal', tag: 'interface', base: 'interface Animal {\n    fun sound() = "..."  // default\n}', dog: 'class Dog : Animal {\n    override fun sound() = "Woof"\n}', makeErr: 'Interface Animal does not have constructors.' },
          };
          let mode = 'open', dogOk = false;
          const baseTag = h('span', { class: 'kt-tag' });
          const baseCode = h('div', { class: 'kt' });
          const base = h('div', { class: 'kt-card' }, baseTag, baseCode);
          const dogTag = h('span', { class: 'kt-tag' }, 'subclass');
          const dogCode = h('div', { class: 'kt' });
          const dog = h('div', { class: 'kt-card' }, dogTag, dogCode);
          const link = h('span', { class: 'kt-up' });
          const stage = h('div', { class: 'stage kt-tree' }, base);
          const o = out();
          const modeBtns = Object.keys(modes).map(k => cmd(modes[k].label, () => { mode = k; paint(); say(o, `Animal is now ${modes[k].tag}. Declare Dog again.`); }));
          function paint() {
            const m = modes[mode];
            modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(modes)[i] === mode));
            baseTag.textContent = m.tag; baseTag.className = 'kt-tag ' + m.tag;
            baseCode.innerHTML = hl(m.base); replay(base, 'pop-soft');
            dogOk = false; dog.remove(); link.remove();
          }
          function declare() {
            const m = modes[mode];
            dogCode.innerHTML = hl(m.dog);
            link.textContent = mode === 'iface' ? '▲ implements' : '▲ extends';
            stage.append(link, dog);
            if (m.dogErr) {
              dog.className = 'kt-card broken'; replay(dog, 'shake'); dogOk = false;
              say(o, `<span class="bad">compile error:</span> ${m.dogErr} Mark Animal open.`);
              return;
            }
            dog.className = 'kt-card drop-in'; dogOk = true;
            say(o, `<span class="good">ok:</span> Dog ${mode === 'iface' ? 'implements' : 'extends'} Animal and overrides sound()`);
          }
          function makeBase() {
            const m = modes[mode];
            if (m.makeErr) { replay(base, 'shake'); say(o, `<span class="bad">compile error:</span> ${m.makeErr}`); return; }
            replay(base, 'pop'); say(o, `${hl('Animal().sound()')} <span class="muted">returns</span> ${hl('"..."')}`);
          }
          function makeDog() {
            if (!dogOk) { replay(stage, 'shake'); say(o, '<span class="bad">error:</span> Unresolved reference: Dog. Declare it first.'); return; }
            replay(dog, 'pop'); say(o, `${hl('Dog().sound()')} <span class="muted">returns</span> ${hl('"Woof"')}`);
          }
          paint(); declare();
          el.append(
            h('div', { class: 'controls' }, modeBtns),
            stage,
            h('div', { class: 'controls' }, cmd('class Dog : Animal…', declare), cmd('Animal().sound()', makeBase), cmd('Dog().sound()', makeDog)),
            o);
        },
      },

      // + objects ─────────────────────────────────────
      {
        id: 'objects',
        title: 'object and companion object',
        tagline: 'One instance, made for you.',
        body: `
<p><code>object</code> declares a class and its only instance in one go. That is a singleton. Kotlin creates it the first time you use it, safely across threads, and every use refers to the same instance. You call it by name: <code>Analytics.log("open")</code>.</p>
<p>A <code>companion object</code> lives inside a class. You call its members on the class name, like <code>User.guest()</code>, which makes it the place for factory functions and constants. It plays the role of <code>static</code> in Java.</p>
<p>An <em>object expression</em>, <code>object : Comparator&lt;String&gt; { … }</code>, makes a one-off instance of an unnamed class right where you need it. On Android, avoid singletons that hold a <code>Context</code> or other state you can’t clean up.</p>`,
        code: `object Analytics {
    private var events = 0
    fun log(name: String) {
        events++
        println("$name (#$events)")
    }
}

class User private constructor(val name: String) {
    companion object {
        const val MAX_NAME = 20
        fun guest() = User("guest")
        fun from(raw: String) = User(raw.take(MAX_NAME))
    }
}

Analytics.log("open")      // open (#1)
Analytics.log("buy")       // buy (#2): the same object
val u = User.guest()       // called on the class name

val byLength = object : Comparator<String> {
    override fun compare(a: String, b: String) = a.length - b.length
}`,
        remember: 'object = a singleton. companion object = members on the class name. object : Type { } = a one-off instance.',
        level: 'beginner',
        terms: [
          { term: 'object declaration', def: 'Declares a class and its single instance together, created lazily on first use.' },
          { term: 'companion object', def: 'An object inside a class whose members are called on the class name, used for factories and constants.' },
          { term: 'Object expression', def: 'An expression like object : Comparator<String> { … } that creates an instance of an unnamed class on the spot.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add a factory you can call as <code>Note.empty()</code>.', code: 'class Note(val text: String) {\n    [[companion]] [[object]] {\n        fun empty() = Note("")\n    }\n}\nval n = Note.empty()', why: 'Members of a <code>companion object</code> are called on the class name.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'object Session {\n    var token: String? = null\n}\n\nfun login(t: String) {\n    Session().token = t\n}', bug: 5, fix: '    Session.token = t', why: 'An <code>object</code> already is its instance and has no constructor. Use it by name.' },
        ],
        quiz: [
          { q: 'How many instances of <code>object Analytics</code> exist in a running app?', options: ['One', 'One per call', 'One per thread'], a: 0, why: 'An object declaration is a singleton: every reference points at the same instance.' },
          { q: '<code>fun guest()</code> sits in <code>User</code>’s companion object. How do you call it?', options: ['<code>User.guest()</code>', '<code>User().guest()</code>', '<code>guest(User)</code>'], a: 0, why: 'Companion members are called on the class name, with no instance needed.' },
        ],
        visual(el) {
          let events = 0;
          const trackers = [];
          const count = h('span', { class: 'field changed' }, 'events = 0');
          const caller = h('span', { class: 'obj-addr' }, 'not used yet');
          const hub = h('div', { class: 'obj' }, h('span', { class: 'obj-name' }, 'object Analytics'), count, caller);
          const pile = h('div', { class: 'kt-pile' });
          const users = h('div', { class: 'kt-pile' });
          const zone = (title, ...kids) => h('div', { class: 'kt-zone' }, h('span', { class: 'kt-zone-title' }, title), ...kids);
          const o = out();
          function log(screen, name) {
            events++;
            count.textContent = `events = ${events}`; replay(count, 'pop');
            caller.textContent = `last call from ${screen}`;
            replay(hub, 'cmp');
            say(o, `${hl(`Analytics.log("${name}")`)} <span class="muted">from ${screen}:</span> ${name} (#${events})  <span class="muted">// one shared object</span>`);
          }
          function tracker() {
            const t = h('div', { class: 'obj drop-in' }, h('span', { class: 'obj-name' }, 'Tracker()'), h('span', { class: 'field' }, 'events = 1'));
            pile.append(t); trackers.push(t);
            if (trackers.length > 3) trackers.shift().remove();
            say(o, `${hl('Tracker().log()')} <span class="muted">// a new instance each time, so its count is always 1</span>`);
          }
          let guests = 0;
          function guest() {
            guests++;
            users.append(h('span', { class: 'chip drop-in' }, 'User("guest")'));
            if (users.children.length > 3) users.firstElementChild.remove();
            say(o, `${hl('User.guest()')} <span class="muted">// factory on the class name; User(...) itself is private</span>`);
          }
          el.append(
            h('div', { class: 'stage' },
              zone('object: one instance', hub),
              zone('class: new instance per call', pile),
              zone('companion object', h('div', { class: 'kt', html: hl('User.guest()') }), users)),
            h('div', { class: 'controls' },
              cmd('HomeScreen: Analytics.log("open")', () => log('HomeScreen', 'open')),
              cmd('CartScreen: Analytics.log("buy")', () => log('CartScreen', 'buy')),
              cmd('Tracker().log()', tracker),
              cmd('User.guest()', guest),
              cmd('Analytics === Analytics', () => { replay(hub, 'cmp'); say(o, `${hl('Analytics === Analytics')} <span class="muted">is</span> ${hl('true')}  <span class="muted">// the very same instance</span>`); })),
            o);
          log('HomeScreen', 'open');
        },
      },

      // + enums ───────────────────────────────────────
      {
        id: 'enums',
        title: 'Enum classes',
        tagline: 'A fixed list of named values.',
        body: `
<p>An <code>enum class</code> lists every value a type can have, like the colors of a traffic light. Each entry is a single object. Entries can take constructor values and the class can have functions, after a semicolon that ends the list.</p>
<p>Every entry knows its <code>name</code> and its <code>ordinal</code> (its position, from 0). <code>Light.entries</code> lists them all in order, and <code>Light.valueOf("RED")</code> looks one up by name, throwing if there is no match. A <code>when</code> that covers every entry needs no <code>else</code>.</p>
<p>Enum or sealed? Use an enum when every case has the same shape and there is exactly one of each. Use a sealed type when cases carry different data, like an error with its own message.</p>`,
        code: `enum class Light(val seconds: Int) {
    RED(30), YELLOW(5), GREEN(25);

    fun next(): Light = when (this) {
        RED -> GREEN
        GREEN -> YELLOW
        YELLOW -> RED
    }
}

Light.entries           // [RED, YELLOW, GREEN]
Light.RED.ordinal       // 0
Light.GREEN.seconds     // 25
Light.valueOf("GREEN")  // GREEN
Light.RED.next()        // GREEN`,
        remember: 'enum class = a fixed set of single values. entries lists them; when over all of them needs no else.',
        level: 'beginner',
        terms: [
          { term: 'enum class', def: 'A class with a fixed set of named instances, its entries, declared in its body.' },
          { term: 'entries', def: 'A list of all of an enum’s values in declaration order, the modern replacement for values().' },
          { term: 'ordinal', def: 'The zero-based position of an enum entry in its declaration.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Print every size by name.', code: 'enum class Size { S, M, L }\n\nfor (s in Size.[[entries]]) {\n    println(s.[[name]])\n}', why: '<code>entries</code> lists every value in order, and <code>name</code> is the entry’s name as a String.' },
          { type: 'bug', prompt: 'An old app version saved <code>"AUTO"</code>. One line crashes on it. Tap it.', code: 'enum class Theme { LIGHT, DARK, SYSTEM }\n\nfun load(prefs: SharedPreferences): Theme {\n    val saved = prefs.getString("theme", null) ?: return Theme.SYSTEM\n    return Theme.valueOf(saved)\n}', bug: 4, fix: '    return Theme.entries.firstOrNull { it.name == saved } ?: Theme.SYSTEM', why: '<code>valueOf</code> throws IllegalArgumentException for an unknown name. Stored text can be anything, so look it up safely.' },
        ],
        quiz: [
          { q: 'What is <code>Light.entries.size</code> for the code above?', options: ['2', '3', '0'], a: 1, why: 'There are three entries: RED, YELLOW and GREEN.' },
          { q: 'A <code>when (light)</code> covers RED, YELLOW and GREEN. Does it need <code>else</code>?', options: ['Yes, always', 'No, it is exhaustive'], a: 1, why: 'The compiler knows every entry, so covering them all is enough.' },
          { q: 'Each error case needs its own message and code. Enum or sealed?', options: ['Enum', 'Sealed'], a: 1, why: 'Sealed subtypes can carry different data per case. Enum entries all share one shape.' },
        ],
        visual(el) {
          const L = [{ name: 'RED', s: 30, c: 'r' }, { name: 'YELLOW', s: 5, c: 'y' }, { name: 'GREEN', s: 25, c: 'g' }];
          const order = [0, 2, 1]; // branch order in next(): RED, GREEN, YELLOW
          const nextOf = { 0: 2, 2: 1, 1: 0 };
          let cur = 0, busy = false;
          const lamps = L.map(l => h('span', { class: `kt-lamp ${l.c}` }));
          const light = h('div', { class: 'kt-light', role: 'img', 'aria-label': 'Traffic light' }, lamps);
          const rows = order.map(i => h('div', { class: 'branch', html: '    ' + hl(`${L[i].name.padEnd(6)} -> ${L[nextOf[i]].name}`) }));
          const chips = h('div', { class: 'kt-pile' });
          const o = out();
          const paint = () => { lamps.forEach((lp, i) => lp.classList.toggle('on', i === cur)); light.setAttribute('aria-label', `Traffic light: ${L[cur].name}`); };
          async function next(quiet) {
            rows.forEach(r => { r.className = 'branch'; });
            for (let k = 0; k < order.length; k++) {
              rows[k].classList.add('scan'); await sleep(260); rows[k].classList.remove('scan');
              if (!light.isConnected) return false;
              if (order[k] === cur) { rows[k].classList.add('hit'); rows.slice(k + 1).forEach(r => r.classList.add('skip')); break; }
              rows[k].classList.add('miss');
            }
            cur = nextOf[cur]; paint(); replay(lamps[cur], 'pop');
            if (!quiet) say(o, `light = ${hl(`Light.${L[cur].name}`)}  <span class="muted">// seconds = ${L[cur].s}, ordinal = ${cur}</span>`);
            return true;
          }
          async function run(f) { if (busy) return; busy = true; await f(); busy = false; }
          async function cycle() {
            for (let n = 0; n < 3; n++) {
              if (!await next(true)) return;
              say(o, `${hl(`Light.${L[cur].name}`)} <span class="muted">for ${L[cur].s} s (sped up)</span>`);
              await sleep(L[cur].s * 40);
              if (!light.isConnected) return;
            }
          }
          async function entries() {
            chips.replaceChildren();
            for (let i = 0; i < L.length; i++) { chips.append(h('span', { class: 'chip drop-in' }, `${L[i].name} · ${i}`)); await sleep(140); }
            say(o, `${hl('Light.entries')} = [RED, YELLOW, GREEN]  <span class="muted">// name · ordinal</span>`);
          }
          paint();
          el.append(
            h('div', { class: 'kt-enum-wrap' }, light,
              h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('fun next() = when (this) {') }), rows, h('div', { class: 'branch head' }, '}'))),
            h('div', { class: 'controls' },
              cmd('light = light.next()', () => run(() => next(false))),
              cmd('light.ordinal', () => { replay(lamps[cur], 'pop'); say(o, `${hl(`Light.${L[cur].name}.ordinal`)} = ${hl(String(cur))}`); }),
              cmd('Light.entries', () => run(entries)),
              cmd('Light.valueOf("BLUE")', () => { replay(light, 'shake'); say(o, '<span class="bad">crash:</span> IllegalArgumentException: No enum constant Light.BLUE'); }),
              h('button', { class: 'btn primary small', onclick: () => run(cycle) }, 'Run a cycle')),
            chips, o);
          say(o, `light = ${hl('Light.RED')}  <span class="muted">// seconds = 30, ordinal = 0</span>`);
        },
      },

      // 6 ─────────────────────────────────────────────
      {
        id: 'data',
        title: 'Data classes',
        tagline: 'Classes that compare by their values.',
        body: `
<p>Put <code>data</code> in front of a class whose job is to hold values, and Kotlin writes the boring parts for you: <code>equals()</code> compares the fields, <code>toString()</code> prints them, and <code>copy()</code> makes a new object with some fields changed.</p>
<p>A plain class compares by identity: two objects are equal only when they are the very same object in memory. Switch <code>data</code> off below to see the difference.</p>
<p>On Android you will use data classes for screen state and API responses. Because <code>copy()</code> makes a new object instead of editing the old one, Compose can tell that something changed.</p>`,
        code: `data class User(val name: String, val age: Int)

val a = User("Ada", 36)
val b = User("Ada", 36)
val c = a.copy(age = 37)    // User(name=Ada, age=37)

a == b      // true: same field values
a == c      // false
println(a)  // User(name=Ada, age=36)`,
        remember: 'data class: equals by fields, readable toString, copy() for changes.',
        level: 'beginner',
        terms: [
          { term: 'data class', def: 'A class whose equals, hashCode, toString and copy are generated from its constructor properties.' },
          { term: 'copy()', def: 'Creates a new data class instance with the same values, except for the ones you pass.' },
          { term: 'Structural equality', def: 'Comparing objects by their values with ==, as opposed to identity with ===.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Declare a value class for points and move one.', code: '[[data]] class Point(val x: Int, val y: Int)\nval p = Point(1, 2)\nval moved = p.[[copy]](x = 5)', why: '<code>data</code> generates <code>copy()</code>, which returns <code>Point(5, 2)</code> and leaves <code>p</code> alone.' },
          { type: 'bug', prompt: 'This data class won’t compile. Tap the wrong line.', code: 'data class Product(\n    val id: Int,\n    name: String,\n    val price: Double,\n)', bug: 2, fix: '    val name: String,', why: 'Every parameter in a data class’s primary constructor must be a property, so it needs <code>val</code> or <code>var</code>.' },
        ],
        quiz: [
          { q: 'For a plain (non-data) class, <code>User("Ada") == User("Ada")</code> is', options: ['<code>true</code>', '<code>false</code>'], a: 1, why: 'Without <code>data</code>, <code>==</code> checks whether both are the same object, and these are two separate objects.' },
          { q: 'What does <code>a.copy(age = 37)</code> do to <code>a</code>?', options: ['Sets its age to 37', 'Nothing. It returns a new object.'], a: 1, why: '<code>copy()</code> builds a new object. With <code>val</code> properties, <code>a</code> can’t change at all.' },
        ],
        visual(el) {
          let isData = true, addr = 0x1b6d3586, objs;
          const decl = h('div', { class: 'kt' });
          const stage = h('div', { class: 'stage' });
          const o = out();
          const toggle = h('input', { type: 'checkbox', id: 'data-toggle', checked: true });
          const card = (name, u, changed, anim) => (u.el = h('div', { class: 'obj' + (anim ? ' drop-in' : '') },
            h('span', { class: 'obj-name' }, `val ${name}`),
            h('span', { class: 'field' }, `name = "${u.name}"`),
            h('span', { class: changed ? 'field changed' : 'field' }, `age = ${u.age}`),
            h('span', { class: 'obj-addr' }, '@' + u.addr.toString(16))));
          const reset = () => {
            objs = { a: { name: 'Ada', age: 36, addr } };
            stage.replaceChildren(card('a', objs.a));
            decl.innerHTML = hl(`${isData ? 'data ' : ''}class User(val name: String, val age: Int)`);
            say(o, 'Create b and c, then compare them with a.');
          };
          const make = (k, u, src, changed) => {
            if (objs[k]) { replay(objs[k].el, 'shake'); return; }
            objs[k] = { name: u.name, age: u.age, addr: addr + (k === 'b' ? 0x2f0 : 0x5e0) };
            stage.append(card(k, objs[k], changed, true));
            say(o, hl(src));
          };
          const cmp = k => {
            const a = objs.a, x = objs[k];
            if (!x) { say(o, `<span class="bad">error:</span> Unresolved reference: ${k}. Create it first.`); return; }
            replay(a.el, 'cmp'); replay(x.el, 'cmp');
            const eq = isData ? a.name === x.name && a.age === x.age : a === x;
            const why = isData ? (eq ? 'every field matches' : 'age is different') : 'different objects in memory, and a plain class compares identity';
            say(o, `${hl(`a == ${k}`)} <span class="muted">is</span> ${hl(String(eq))}  <span class="muted">// ${why}</span>`);
          };
          toggle.addEventListener('change', () => { isData = toggle.checked; reset(); });
          reset();
          el.append(
            h('label', { class: 'switch', for: 'data-toggle' }, toggle, 'data keyword'), decl,
            stage,
            h('div', { class: 'controls' },
              cmd('val b = User("Ada", 36)', () => make('b', { name: 'Ada', age: 36 }, 'val b = User("Ada", 36)')),
              cmd('val c = a.copy(age = 37)', () => {
                if (!isData) { say(o, '<span class="bad">compile error:</span> Unresolved reference: copy. Only data classes get copy().'); return; }
                make('c', { name: objs.a.name, age: 37 }, 'val c = a.copy(age = 37)', true);
              }),
              cmd('a == b', () => cmp('b')),
              cmd('a == c', () => cmp('c')),
              cmd('println(a)', () => say(o, isData ? 'User(name=Ada, age=36)' : `User@${objs.a.addr.toString(16)}  <span class="muted">// class name + hash, not very useful</span>`))),
            o);
        },
      },

      // 7 ─────────────────────────────────────────────
      {
        id: 'extensions',
        title: 'Extension functions',
        tagline: 'Add functions to types you don’t own.',
        body: `
<p>An extension function adds a new function to an existing type, like <code>String</code> or an Android <code>View</code>, without editing it or subclassing it.</p>
<p>Write the type, a dot, then the name: <code>fun String.shout()</code>. Inside, <code>this</code> is the value it was called on (the <em>receiver</em>). The class itself does not change. Kotlin just lets you call your function with dot syntax.</p>
<p>Android KTX is mostly extensions. <code>view.isVisible = true</code> and <code>"https://…".toUri()</code> are both extensions written by Google.</p>`,
        code: `fun String.shout(): String = uppercase() + "!"
fun String.isPalindrome(): Boolean = this == reversed()
fun String.initials(): String =
    split(" ").map { it.first() }.joinToString("")

"hello".shout()             // "HELLO!"
"level".isPalindrome()      // true
"Ada Lovelace".initials()   // "AL"`,
        remember: 'fun Type.name() adds a function to Type from outside. Inside it, this is the receiver.',
        level: 'beginner',
        terms: [
          { term: 'Extension function', def: 'A function declared outside a type, like fun String.shout(), that you call with dot syntax on that type.' },
          { term: 'Receiver', def: 'The object an extension or a lambda with receiver is called on, available inside as this.' },
          { term: 'Android KTX', def: 'Jetpack libraries of Kotlin extensions that make Android APIs shorter, like view.isVisible.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Add an <code>isEven()</code> function to Int.', code: 'fun [[Int]].isEven(): Boolean = [[this]] % 2 == 0\n10.isEven()   // true', why: 'The receiver type goes before the dot, and <code>this</code> is the Int it was called on.' },
          { type: 'bug', prompt: 'One line won’t compile. Tap it.', code: 'class Wallet(private val cents: Long) {\n    fun total(): Long = cents\n}\n\nfun Wallet.display(): String =\n    "EUR " + cents / 100.0', bug: 5, fix: '    "EUR " + total() / 100.0', why: 'An extension is an ordinary function outside the class, so it can’t read <code>private</code> members. Use the public <code>total()</code>.' },
        ],
        quiz: [
          { q: 'Inside <code>fun Int.isOdd() = this % 2 == 1</code>, what is <code>this</code>?', options: ['The Int it was called on', 'The file it lives in', 'Nothing, extensions have no this'], a: 0, why: '<code>this</code> is the receiver: in <code>5.isOdd()</code> it is 5.' },
          { q: 'Can an extension function read a class’s <code>private</code> members?', options: ['Yes, it becomes part of the class', 'No, it is an ordinary function called with dot syntax'], a: 1, why: 'Extensions are compiled to regular functions that take the receiver as a parameter, so they only see public API.' },
        ],
        visual(el) {
          const exts = [
            { name: 'shout()', sig: 'fun String.shout() = uppercase() + "!"', f: s => JSON.stringify(s.toUpperCase() + '!') },
            { name: 'isPalindrome()', sig: 'fun String.isPalindrome() = this == reversed()', f: s => String(s === [...s].reverse().join('')) },
            { name: 'initials()', sig: 'fun String.initials() = split(" ").map { it.first() }.joinToString("")', f: s => JSON.stringify(s.split(' ').filter(Boolean).map(w => w[0]).join('')) },
          ];
          const input = h('input', { id: 'ext-receiver', value: 'level', spellcheck: 'false', autocomplete: 'off' });
          const members = h('div', { class: 'members' }, ['length', 'uppercase()', 'reversed()', 'split()', 'trim()'].map(m => h('span', { class: 'member' }, m)));
          const panel = h('div', { class: 'class-panel' },
            h('span', { class: 'class-title' }, 'String'),
            members,
            h('span', { class: 'tip' }, 'Dashed = your extension. The String class itself is untouched.'));
          const o = out('Pick an extension. The first tap declares it, then it runs.');
          const added = new Set();
          async function use(x) {
            if (!added.has(x.name)) {
              added.add(x.name);
              members.append(h('span', { class: 'member ext drop-in' }, x.name));
              say(o, hl(x.sig));
              await sleep(800);
            }
            say(o, `${hl(`${JSON.stringify(input.value)}.${x.name}`)} <span class="muted">→</span> ${hl(x.f(input.value))}`);
          }
          el.append(
            h('div', { class: 'stage' }, panel),
            h('label', { class: 'field-input', for: 'ext-receiver' }, 'Call it on', input),
            h('div', { class: 'controls' }, exts.map(x => cmd(x.name, () => use(x)))),
            o);
        },
      },

      // 8 ─────────────────────────────────────────────
      {
        id: 'scope',
        title: 'Scope functions',
        tagline: 'let, run, with, apply, also on one grid.',
        body: `
<p><code>let</code>, <code>run</code>, <code>with</code>, <code>apply</code> and <code>also</code> all do the same basic thing: run a block of code with an object in reach. They differ on just two questions.</p>
<p><b>How do you refer to the object inside the block?</b> As <code>it</code>, a lambda parameter, or as <code>this</code>, so you can call its members directly. <b>What comes back?</b> The block’s last expression, or the object itself.</p>
<p>Answer those two questions and you know which one you want. The grid below is the whole topic. Tap a function to see where it sits.</p>`,
        code: `val name = "Kotlin"
val len1 = name.let { it.length }         // 6
val len2 = name.run { length }            // 6
val len3 = with(name) { length }          // 6

val p = Person().apply { age = 30 }       // the Person
val q = p.also { println(it.age) }        // the same Person`,
        remember: 'let and also use it; run, with and apply use this. apply and also return the object; the rest return the block’s result.',
        level: 'intermediate',
        terms: [
          { term: 'Scope function', def: 'One of let, run, with, apply and also, which run a block with an object in reach.' },
          { term: 'apply', def: 'Runs a block with the object as this and returns the object, which suits configuring it.' },
          { term: 'let', def: 'Runs a block with the object as it and returns the block’s result, often after ?..' },
          { term: 'also', def: 'Runs a block with the object as it and returns the object, which suits side effects like logging.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Configure the Paint, then show the user only if there is one.', code: 'val paint = Paint().[[apply]] {\n    color = Color.RED\n    strokeWidth = 4f\n}\nuser?.[[let]] { show(it) }', why: '<code>apply</code> gives <code>this</code> and returns the Paint. <code>?.let</code> runs only when <code>user</code> is not null.' },
          { type: 'bug', prompt: 'One line has a type mismatch. Tap it.', code: 'val name = "Kotlin"\nval upper = name.let { it.uppercase() }\nval length: Int = name.also { it.length }\nprintln("$upper $length")', bug: 2, fix: 'val length: Int = name.let { it.length }', why: '<code>also</code> returns the object, a String, and ignores the block’s result. <code>let</code> returns the block’s result.' },
        ],
        quiz: [
          { q: 'Configure an object and keep it: <code>val tv = TextView(ctx).___ { text = "Hi" }</code>', options: ['<code>let</code>', '<code>apply</code>', '<code>run</code>'], a: 1, why: '<code>apply</code> gives you <code>this</code> (so <code>text = …</code> works) and returns the TextView.' },
          { q: 'Which returns the block’s result and calls the object <code>it</code>?', options: ['<code>also</code>', '<code>let</code>', '<code>with</code>'], a: 1, why: '<code>let</code>: <code>it</code> inside, last expression out.' },
          { q: '<code>val x = "abc".also { it.length }</code>. What is <code>x</code>?', options: ['<code>3</code>', '<code>"abc"</code>'], a: 1, why: '<code>also</code> always returns the object it was called on.' },
        ],
        visual(el) {
          const fns = {
            let: { cell: 'it-r', src: 'val r = name.let { it.length }', ret: '6', tip: 'Use it for null checks and transforms: <code>user?.let { show(it) }</code>' },
            run: { cell: 'this-r', src: 'val r = name.run { length }', ret: '6', tip: 'Use it to compute a value from an object’s own members.' },
            with: { cell: 'this-r', src: 'val r = with(name) { length }', ret: '6', tip: 'Same as run, but not an extension: the object goes in the parentheses.' },
            apply: { cell: 'this-o', src: 'val r = Person().apply { age = 30 }', ret: 'Person(age=30)', tip: 'Use it to configure a new object, builder style.' },
            also: { cell: 'it-o', src: 'val r = person.also { log(it) }', ret: 'Person(age=30)', tip: 'Use it for side effects like logging, without breaking a chain.' },
          };
          const cells = {}, chips = {};
          const cell = (id, names) => (cells[id] = h('div', { class: 'cell' }, names.map(n => (chips[n] = h('button', { class: 'fn', onclick: () => pick(n) }, n)))));
          const grid = h('div', { class: 'scope-grid' },
            h('span'), h('span', { class: 'colhead' }, 'returns block result'), h('span', { class: 'colhead' }, 'returns the object'),
            h('span', { class: 'rowhead' }, h('code', {}, 'it')), cell('it-r', ['let']), cell('it-o', ['also']),
            h('span', { class: 'rowhead' }, h('code', {}, 'this')), cell('this-r', ['run', 'with']), cell('this-o', ['apply']));
          const o = out(), tip = h('p', { class: 'tip' });
          let seq = 0;
          async function pick(n) {
            const f = fns[n], my = ++seq;
            Object.values(cells).forEach(c => c.classList.remove('on'));
            Object.values(chips).forEach(c => c.classList.remove('on'));
            cells[f.cell].classList.add('on'); chips[n].classList.add('on');
            o.innerHTML = hl(f.src); tip.innerHTML = f.tip;
            await sleep(500);
            if (my === seq) o.append(h('div', { class: 'line drop-in', html: hl(`// r = ${f.ret}`) }));
          }
          el.append(grid, tip, o);
          pick('let');
        },
      },

      // 9 ─────────────────────────────────────────────
      {
        id: 'sealed',
        title: 'Sealed classes',
        tagline: 'A closed set of cases the compiler can check.',
        body: `
<p>A <code>sealed</code> class or interface has a fixed list of subtypes, all declared in the same package and module. The compiler knows every possible case.</p>
<p>That pays off in <code>when</code>: cover every subtype and you need no <code>else</code>. Add a new subtype later and every <code>when</code> that forgot it stops compiling, so you can’t ship a screen that ignores the new state.</p>
<p>This is the standard way to model what an Android screen shows: loading, content, or an error. Tick the box below to forget a branch.</p>`,
        code: `sealed interface UiState {
    data object Loading : UiState
    data class Success(val items: List<String>) : UiState
    data class Error(val message: String) : UiState
}

fun render(state: UiState) = when (state) {
    UiState.Loading    -> showSpinner()
    is UiState.Success -> showList(state.items)
    is UiState.Error   -> showError(state.message)
}`,
        remember: 'sealed = a closed set of types. when can cover them all without else, and the compiler flags a missing case.',
        level: 'intermediate',
        terms: [
          { term: 'Sealed interface', def: 'An interface whose implementations are all known at compile time, declared in the same module and package.' },
          { term: 'Exhaustive when', def: 'A when that covers every possible case, so it needs no else and the compiler flags any missing one.' },
          { term: 'data object', def: 'A singleton with a readable generated toString, used for cases that carry no data.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make the result type closed and match on its subtypes.', code: '[[sealed]] interface Result {\n    data class Ok(val value: String) : Result\n    data class Fail(val error: Throwable) : Result\n}\n\nfun show(r: Result) = when (r) {\n    [[is]] Result.Ok -> r.value\n    is Result.Fail -> r.error.message\n}', why: '<code>sealed</code> lets the compiler see both cases, so the <code>when</code> needs no <code>else</code>. <code>is</code> matches by type.' },
          { type: 'bug', prompt: 'The <code>when</code> fails to compile with “must be exhaustive”. Tap the line to fix.', code: 'interface UiState\ndata object Loading : UiState\ndata class Ready(val items: List<String>) : UiState\n\nfun title(s: UiState) = when (s) {\n    Loading -> "Loading"\n    is Ready -> "${s.items.size} items"\n}', bug: 0, fix: 'sealed interface UiState', why: 'A plain interface can have implementations anywhere, so the compiler can’t know the list is complete. <code>sealed</code> closes it.' },
        ],
        quiz: [
          { q: 'You add <code>data object Empty : UiState</code>. What happens to a <code>when</code> with no <code>else</code> that doesn’t handle it?', options: ['It compiles and skips Empty', 'It stops compiling until you add the branch', 'It crashes at runtime'], a: 1, why: 'The compiler knows every subtype, so it reports the missing case.' },
          { q: 'Inside <code>is UiState.Error -> …</code>, can you read <code>state.message</code>?', options: ['Yes, state is smart-cast to Error', 'No, you must cast it yourself'], a: 0, why: 'The <code>is</code> check smart-casts <code>state</code> inside that branch.' },
        ],
        visual(el) {
          const states = [
            { name: 'Loading', emit: 'UiState.Loading', line: 'UiState.Loading    -> showSpinner()' },
            { name: 'Success', emit: 'UiState.Success(items)', line: 'is UiState.Success -> showList(state.items)' },
            { name: 'Error', emit: 'UiState.Error("No connection")', line: 'is UiState.Error   -> showError(state.message)' },
          ];
          const rows = states.map(s => h('div', { class: 'branch', html: '    ' + hl(s.line) }));
          const drop = h('input', { type: 'checkbox', id: 'sealed-drop' });
          const phone = h('div', { class: 'phone', role: 'img', 'aria-label': 'Screen preview' });
          const o = out();
          let retrying = false;
          const screens = {
            Loading: () => [h('div', { class: 'spinner' }), h('p', { class: 'phone-note' }, 'Loading…')],
            Success: () => ['Kotlin', 'Compose', 'Room'].map((x, i) => h('div', { class: 'item drop-in', style: `animation-delay:${i * 90}ms` }, x)),
            Error: () => [h('div', { class: 'err-icon' }, '!'), h('p', { class: 'phone-note' }, 'No connection'), h('button', { class: 'btn small', onclick: retry }, 'Retry')],
          };
          async function retry() {
            if (retrying) return; retrying = true;
            render(states[0]); await sleep(1300); render(states[1]);
            retrying = false;
          }
          function render(s) {
            rows.forEach((r, i) => r.classList.toggle('hit', !drop.checked && states[i] === s));
            if (drop.checked) {
              phone.replaceChildren(h('p', { class: 'build-fail' }, 'Build failed'));
              replay(phone, 'shake');
              say(o, `<span class="bad">compile error:</span> 'when' expression must be exhaustive. Add the 'is Error' branch or 'else'.`);
              return;
            }
            phone.replaceChildren(...screens[s.name]());
            say(o, hl(`render(${s.emit})`));
          }
          drop.addEventListener('change', () => { rows[2].classList.toggle('cut', drop.checked); render(states[1]); });
          el.append(
            h('div', { class: 'controls' }, states.map(s => cmd(s.emit, () => render(s)))),
            h('div', { class: 'sealed-wrap' },
              h('div', { class: 'when' }, h('div', { class: 'branch head', html: hl('when (state) {') }), rows, h('div', { class: 'branch head' }, '}')),
              phone),
            h('label', { class: 'switch', for: 'sealed-drop' }, drop, 'Forget the Error branch'),
            o);
          render(states[1]);
        },
      },

      // + exceptions ──────────────────────────────────
      {
        id: 'exceptions',
        title: 'Exceptions',
        tagline: 'throw, catch, and try as an expression.',
        body: `
<p><code>throw</code> stops the current function and travels up the call stack until a matching <code>catch</code> handles it. If nothing catches it, the app crashes. Catch the specific type you can handle, like <code>NumberFormatException</code>, not every <code>Exception</code>.</p>
<p><code>try</code> is an expression. Its value is the last line of the <code>try</code> block, or of the <code>catch</code> block when something was thrown. <code>finally</code> always runs, thrown or not, and doesn’t change the value. Kotlin has no checked exceptions: the compiler never forces you to catch anything.</p>
<p>Three standard helpers say what went wrong. <code>require(cond)</code> throws <code>IllegalArgumentException</code> for a bad argument. <code>check(cond)</code> throws <code>IllegalStateException</code> when the object is in the wrong state. <code>error("msg")</code> always throws <code>IllegalStateException</code>.</p>`,
        code: `fun parseAge(input: String): Int {
    val age = try {
        input.trim().toInt()
    } catch (e: NumberFormatException) {
        -1
    } finally {
        println("parsed '$input'")
    }
    require(age >= 0) { "Age must be a number, got '$input'" }
    return age
}

class Player {
    private var started = false
    fun start() { started = true }
    fun pause() {
        check(started) { "pause() called before start()" }
    }
}

fun fail(): Nothing = error("unreachable")   // IllegalStateException`,
        remember: 'try gives a value, finally always runs. require for bad arguments, check for bad state.',
        level: 'beginner',
        terms: [
          { term: 'try expression', def: 'A try/catch whose value is the last expression of the block that ran, so it can be assigned.' },
          { term: 'finally', def: 'A block after try/catch that always runs, whether or not an exception was thrown.' },
          { term: 'require', def: 'Throws IllegalArgumentException with your message when a condition about an argument is false.' },
          { term: 'check', def: 'Throws IllegalStateException with your message when a condition about the current state is false.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Parse the text, or use 0 when it is not a number.', code: 'val n = [[try]] {\n    text.toInt()\n} [[catch]] (e: NumberFormatException) {\n    0\n}', why: 'Because <code>try</code> is an expression, <code>n</code> gets the parsed number or the 0 from <code>catch</code>.' },
          { type: 'bug', prompt: 'A bad argument should throw IllegalArgumentException, but this throws IllegalStateException. Tap the line.', code: 'fun setVolume(level: Int) {\n    check(level in 0..100) { "level out of range: $level" }\n    player.volume = level\n}', bug: 1, fix: '    require(level in 0..100) { "level out of range: $level" }', why: '<code>check</code> is for the object’s state. A wrong value passed in by the caller is an argument problem, so use <code>require</code>.' },
        ],
        quiz: [
          { q: '<code>val x = try { "7".toInt() } catch (e: Exception) { 0 } finally { println("end") }</code>. What is <code>x</code>?', options: ['<code>7</code>', '<code>0</code>', '<code>Unit</code>'], a: 0, why: 'Nothing was thrown, so the value comes from the try block. finally runs but doesn’t change the value.' },
          { q: 'Does Kotlin force you to catch <code>IOException</code>?', options: ['Yes, like Java', 'No, Kotlin has no checked exceptions'], a: 1, why: 'Every exception is unchecked in Kotlin. You decide where to handle it.' },
          { q: 'What does <code>require(false)</code> throw?', options: ['<code>IllegalStateException</code>', '<code>IllegalArgumentException</code>', 'Nothing'], a: 1, why: '<code>require</code> is for arguments. <code>check</code> and <code>error</code> throw IllegalStateException.' },
        ],
        visual(el) {
          const src = [
            'val age = try {',
            '    input.trim().toInt()',
            '} catch (e: NumberFormatException) {',
            '    -1',
            '} finally {',
            '    println("parsed")',
            '}',
            'require(age >= 0) { "Age must be a number" }',
          ];
          const rows = src.map(s => h('div', { class: 'branch', html: hl(s) }));
          const well = h('div', { class: 'slot' });
          const con = h('div', { class: 'out', 'aria-live': 'polite' });
          const o = out();
          let busy = false;
          const inputs = ['"42"', '" 7 "', '"abc"', '"-3"'];
          const mark = async (i, cls = 'kt-on', ms = 420) => { rows[i].classList.add(cls); await sleep(ms); return rows[0].isConnected; };
          async function run(lit) {
            if (busy) return; busy = true;
            rows.forEach(r => { r.className = 'branch'; });
            well.replaceChildren(); con.replaceChildren();
            const text = JSON.parse(lit), t = text.trim();
            const ok = /^-?\d+$/.test(t);
            const value = ok ? parseInt(t, 10) : -1;
            say(o, hl(`val input = ${lit}`));
            if (!await mark(0)) return;
            if (!await mark(1)) return;
            if (ok) {
              rows[2].classList.add('kt-off'); rows[3].classList.add('kt-off');
              swap(well, String(value));
              say(o, `try block finished with ${hl(String(value))}, catch is skipped`);
              if (!await mark(1, 'kt-on', 500)) return;
            } else {
              rows[1].classList.add('kt-err'); replay(rows[1], 'shake');
              say(o, `<span class="bad">throws</span> NumberFormatException: For input string: ${lit}`);
              if (!await mark(1, 'kt-err', 700)) return;
              if (!await mark(2)) return;
              if (!await mark(3)) return;
              swap(well, '-1');
              say(o, `catch block gives ${hl('-1')}`);
            }
            if (!await mark(4)) return;
            if (!await mark(5)) return;
            con.append(h('div', { class: 'line drop-in' }, 'parsed'));
            if (!await mark(6)) return;
            if (value < 0) {
              rows[7].classList.add('kt-err'); replay(rows[7], 'shake');
              say(o, '<span class="bad">crash:</span> IllegalArgumentException: Age must be a number');
            } else {
              await mark(7);
              say(o, `<span class="good">ok:</span> age = ${value}  <span class="muted">// finally ran either way</span>`);
            }
            busy = false;
          }
          swap(well, '42');
          say(o, 'Pick an input and follow the path it takes.');
          el.append(
            h('div', { class: 'controls' }, inputs.map(lit => cmd(`input = ${lit}`, () => run(lit)))),
            h('div', { class: 'sealed-wrap' },
              h('div', { class: 'when' }, rows),
              h('div', { class: 'box val' }, h('span', { class: 'box-tag', html: hl('age') }), well)),
            o, con);
        },
      },

      // 10 ────────────────────────────────────────────
      {
        id: 'coroutines',
        title: 'Coroutines',
        tagline: 'Suspend the work, not the thread.',
        body: `
<p>A coroutine is a piece of work that can pause and pick up again later. When it reaches a <code>suspend</code> function like <code>delay()</code> or a network call, it steps aside and the thread runs other work in the meantime.</p>
<p><code>launch</code> starts a coroutine that runs alongside the code around it. <code>delay()</code> <em>suspends</em>: the coroutine waits, the thread stays free. <code>Thread.sleep()</code> <em>blocks</em>: the thread itself is stuck and nothing else can run on it.</p>
<p>On Android this matters because the main thread draws the UI. Block it and the app freezes. Suspend instead and the UI stays smooth. Play both versions below and compare the main thread lane.</p>`,
        code: `fun main() = runBlocking {
    launch {
        delay(800)          // A suspends, the thread is free
        println("A done")
    }
    launch {
        delay(400)
        println("B done")
    }
    println("Started")
}
// Started, B done, A done   (about 800 ms in total)`,
        remember: 'suspend pauses the coroutine, not the thread. delay() suspends; Thread.sleep() blocks.',
        level: 'intermediate',
        terms: [
          { term: 'Coroutine', def: 'A unit of work that can suspend and resume later without holding a thread while it waits.' },
          { term: 'suspend', def: 'Marks a function that can pause the calling coroutine. It can only be called from a coroutine or another suspend function.' },
          { term: 'launch', def: 'Starts a new coroutine in a scope and returns a Job, without waiting for a result.' },
          { term: 'delay', def: 'Suspends the coroutine for a time without blocking its thread, unlike Thread.sleep.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Make this function able to wait without blocking.', code: '[[suspend]] fun loadUser(id: Int): User {\n    [[delay]](300)   // simulated latency\n    return api.user(id)\n}', why: 'Only a <code>suspend</code> function can call <code>delay</code>, which pauses the coroutine and leaves the thread free.' },
          { type: 'bug', prompt: 'The UI freezes for two seconds. Tap the line that causes it.', code: 'viewModelScope.launch {\n    showSpinner()\n    Thread.sleep(2000)\n    hideSpinner()\n}', bug: 2, fix: '    delay(2000)', why: '<code>viewModelScope</code> runs on the main thread. <code>Thread.sleep</code> blocks it, so nothing can draw. <code>delay</code> suspends instead.' },
        ],
        quiz: [
          { q: 'What does the code above print, in order?', options: ['Started, A done, B done', 'Started, B done, A done', 'A done, B done, Started'], a: 1, why: '"Started" runs first. B’s 400 ms delay ends before A’s 800 ms.' },
          { q: 'Replace both <code>delay()</code> calls with <code>Thread.sleep()</code>. Total time is about', options: ['800 ms', '1200 ms', '400 ms'], a: 1, why: 'Sleep holds the only thread, so A and B run one after another: 800 + 400.' },
          { q: 'Inside a coroutine on Android’s main thread, which one keeps the UI responsive?', options: ['<code>delay(1000)</code>', '<code>Thread.sleep(1000)</code>'], a: 0, why: '<code>delay</code> suspends and frees the main thread to keep drawing.' },
        ],
        visual(el) {
          const modes = {
            delay: {
              label: 'delay()', total: 880,
              snippet: 'launch { delay(800); println("A done") }\nlaunch { delay(400); println("B done") }\nprintln("Started")',
              note: 'About 800 ms in total. While A and B were suspended, the main thread was free for other work.',
              bars: [['main', 'run', 0, 40], ['A', 'run', 20, 30], ['A', 'wait', 30, 800], ['B', 'run', 30, 40], ['B', 'wait', 40, 400], ['B', 'run', 400, 420], ['main', 'run', 400, 420], ['A', 'run', 800, 820], ['main', 'run', 800, 820]],
              prints: [[15, 'Started'], [415, 'B done'], [815, 'A done']],
            },
            sleep: {
              label: 'Thread.sleep()', total: 1280,
              snippet: 'launch { Thread.sleep(800); println("A done") }\nlaunch { Thread.sleep(400); println("B done") }\nprintln("Started")',
              note: 'About 1200 ms in total. Each sleep held the thread, so B couldn’t even start until A finished.',
              bars: [['main', 'run', 0, 20], ['A', 'run', 20, 30], ['A', 'block', 30, 820], ['main', 'block', 20, 820], ['B', 'queued', 20, 820], ['B', 'run', 820, 830], ['B', 'block', 830, 1220], ['main', 'block', 820, 1220]],
              prints: [[15, 'Started'], [825, 'A done'], [1225, 'B done']],
            },
          };
          const lanes = { main: 'main thread', A: 'coroutine A', B: 'coroutine B' };
          let mode = 'delay', busy = false, bars = [], cursors = [];
          const tl = h('div', { class: 'timeline' });
          const clock = h('span', { class: 'clock' }, '0 ms');
          const con = h('div', { class: 'out', 'aria-live': 'polite' });
          const note = h('p', { class: 'tip' });
          const snippet = h('div', { class: 'kt' });
          const buttons = Object.keys(modes).map(k => cmd(modes[k].label, () => { if (busy) return; mode = k; play(); }));
          function setup() {
            const m = modes[mode];
            buttons.forEach((b, i) => b.setAttribute('aria-pressed', Object.keys(modes)[i] === mode));
            snippet.innerHTML = hl(m.snippet);
            bars = []; cursors = [];
            tl.replaceChildren(...Object.entries(lanes).map(([id, name]) => {
              const track = h('div', { class: 'lane-track' });
              for (const [lane, kind, start, end] of m.bars) {
                if (lane !== id) continue;
                const b = h('span', { class: `bar ${kind}`, style: `left:${(start / m.total) * 100}%;width:0` });
                track.append(b); bars.push({ el: b, start, end });
              }
              const c = h('span', { class: 'cursor' });
              track.append(c); cursors.push(c);
              return h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, name), track);
            }));
            con.replaceChildren(); note.textContent = '';
          }
          function draw(t) {
            const m = modes[mode];
            for (const b of bars) b.el.style.width = (Math.max(0, Math.min(t, b.end) - b.start) / m.total) * 100 + '%';
            cursors.forEach(c => { c.style.left = (t / m.total) * 100 + '%'; });
            clock.textContent = Math.round(t) + ' ms';
          }
          function play() {
            if (busy) return; busy = true; setup();
            const m = modes[mode], t0 = performance.now();
            let p = 0;
            const tick = now => {
              const t = Math.min((now - t0) / 2.5, m.total); // 2.5x slow motion
              draw(t);
              while (p < m.prints.length && m.prints[p][0] <= t) con.append(h('div', { class: 'line drop-in' }, m.prints[p++][1]));
              if (t < m.total) requestAnimationFrame(tick);
              else { note.textContent = m.note; busy = false; }
            };
            requestAnimationFrame(tick);
          }
          // Open on a finished run so the page reads complete before anyone presses Play.
          setup(); draw(modes.delay.total);
          modes.delay.prints.forEach(([, text]) => con.append(h('div', { class: 'line' }, text)));
          note.textContent = modes.delay.note;
          const legend = h('div', { class: 'legend' },
            h('span', {}, h('i', { class: 'bar run' }), 'running'),
            h('span', {}, h('i', { class: 'bar wait' }), 'suspended (thread free)'),
            h('span', {}, h('i', { class: 'bar block' }), 'blocking the thread'),
            h('span', {}, h('i', { class: 'bar queued' }), 'waiting to start'));
          el.append(
            h('div', { class: 'controls' }, buttons, h('button', { class: 'btn primary small', onclick: play }, 'Play'), clock),
            snippet, tl, legend, note, con);
        },
      },
    ],
  });
})();
