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

  Lab.addTrack({
    id: 'kotlin',
    title: 'Kotlin',
    description: 'The language Android is written in. From val to coroutines.',
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
