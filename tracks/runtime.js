/* How code runs track. Same shape as tracks/kotlin.js.
   Computer science foundations: compilers, runtimes, memory management, then the Android form of each
   (kotlinc, D8/R8, ART, its garbage collector, startup). Every class is prefixed rt-.
   Timing numbers in the demos are illustrative and labelled as such; the facts in the prose follow
   source.android.com and developer.android.com. */
(() => {
  const { h, replay } = Lab;
  const label = text => h('span', { class: 'rt-label' }, text);
  function stats(names) {
    const vals = {};
    const root = h('div', { class: 'rt-stats' }, names.map(n => { const b = h('b', {}, '-'); vals[n] = b; return h('span', { class: 'rt-stat' }, `${n} `, b); }));
    root.set = (n, v) => { if (vals[n].textContent !== String(v)) { vals[n].textContent = String(v); replay(vals[n], 'pop-soft'); } };
    return root;
  }

  // Directed object graph as inline SVG. nodes: [{ id, x, y, text, label, root? }], edges: [[a, b, both?]]
  let svgN = 0;
  function graphSvg(nodes, edges, { w = 360, ht = 230, r = 16, name = 'object graph' } = {}) {
    const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
    const mid = `rt-arrow-${++svgN}`;
    const lines = edges.map(([a, b, both]) => {
      const A = pos[a], B = pos[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const s = r + (both ? 3 : 0), e = r + 3;
      return `<line class="rt-ed" data-e="${a}>${b}" x1="${(A.x + ux * s).toFixed(1)}" y1="${(A.y + uy * s).toFixed(1)}" x2="${(B.x - ux * e).toFixed(1)}" y2="${(B.y - uy * e).toFixed(1)}" marker-end="url(#${mid})"${both ? ` marker-start="url(#${mid})"` : ''}/>`;
    }).join('');
    const shapes = nodes.map(n => `<g class="rt-gn" data-n="${n.id}">${n.root
      ? `<rect x="${n.x - r - 6}" y="${n.y - r + 2}" width="${2 * r + 12}" height="${2 * r - 4}" rx="7"/>`
      : `<circle cx="${n.x}" cy="${n.y}" r="${r}"/>`}<text class="rt-gt" x="${n.x}" y="${n.y}">${n.text}</text>${n.label ? `<text class="rt-gl" x="${n.x}" y="${n.y + r + 11}">${n.label}</text>` : ''}</g>`).join('');
    const defs = `<defs><marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path class="rt-arrow" d="M0,0 L10,5 L0,10 z"/></marker></defs>`;
    const root = h('div', { class: 'rt-svgwrap', html: `<svg class="rt-svg" viewBox="0 0 ${w} ${ht}" role="img" aria-label="${name}">${defs}${lines}${shapes}</svg>` });
    const N = {}, E = {};
    root.querySelectorAll('.rt-gn').forEach(g => { N[g.dataset.n] = g; });
    root.querySelectorAll('.rt-ed').forEach(l => { E[l.dataset.e] = l; });
    return {
      root,
      node(id, cls) { N[id].setAttribute('class', `rt-gn ${cls || ''}`); },
      edge(a, b, cls) { const l = E[`${a}>${b}`]; if (l) l.setAttribute('class', `rt-ed ${cls || ''}`); },
    };
  }

  const css = `
.rt-stage { display: grid; gap: 12px; padding: 14px; background: var(--bg); border-radius: 14px; min-width: 0; }
.rt-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.rt-label { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.rt-note { font: 500 0.74rem/1.4 var(--mono); color: var(--muted); overflow-wrap: anywhere; }
.rt-stats { display: flex; flex-wrap: wrap; gap: 4px 16px; min-width: 0; }
.rt-stat { font: 600 0.8rem var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.rt-stat b { color: var(--ink); display: inline-block; }
.rt-pill { font: 600 0.76rem var(--mono); padding: 4px 9px; border-radius: 8px; background: var(--surface); border: 2px solid var(--line); color: var(--ink); max-width: 100%; overflow-wrap: anywhere; transition: border-color 0.2s, background 0.2s, opacity 0.2s, transform 0.2s; }
.rt-pill.rt-done { border-color: var(--ok); }
.rt-pill.rt-warm { border-color: var(--warm); background: var(--warm-soft); }

/* DEX meters */
.rt-bars { display: grid; gap: 6px; min-width: 0; }
.rt-dexfile { display: grid; gap: 4px; min-width: 0; }
.rt-meter { height: 18px; background: var(--sunk); border-radius: 6px; overflow: hidden; min-width: 0; position: relative; }
.rt-fill { height: 100%; width: 0; background: var(--accent); border-radius: 6px; transition: width 0.45s ease-out, background 0.3s; }
.rt-fill.rt-full { background: var(--err); }

/* charts */
.rt-svgwrap { min-width: 0; }
.rt-svg { display: block; width: 100%; max-width: 460px; height: auto; margin: 0 auto; overflow: visible; }
.rt-svg text { fill: var(--ink); font-family: var(--mono); }
.rt-svg .rt-axis { stroke: var(--line); stroke-width: 1.5; }
.rt-svg .rt-tick { fill: var(--muted); font-size: 10px; }
.rt-svg .rt-line { fill: none; stroke-width: 2.5; stroke-linejoin: round; }
.rt-svg .rt-l-int { stroke: var(--err); } .rt-svg .rt-l-jit { stroke: var(--warm); } .rt-svg .rt-l-aot { stroke: var(--ok); }
.rt-svg .rt-mark { fill: var(--accent); font-size: 10px; font-weight: 700; }
.rt-svg .rt-markline { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 4 3; }
.rt-key { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 600 0.74rem var(--mono); color: var(--ink); }
.rt-key i { display: inline-block; width: 14px; height: 4px; border-radius: 2px; vertical-align: middle; margin-right: 6px; }
.rt-k-int { background: var(--err); } .rt-k-jit { background: var(--warm); } .rt-k-aot { background: var(--ok); }

/* object graph */
.rt-svg .rt-ed { stroke: var(--line); stroke-width: 2.5; transition: stroke 0.25s; }
.rt-svg .rt-ed.rt-on { stroke: var(--ok); stroke-width: 3.5; }
.rt-svg .rt-ed.rt-dim { opacity: 0.2; }
.rt-svg .rt-arrow { fill: var(--muted); }
.rt-svg .rt-gn circle, .rt-svg .rt-gn rect { fill: var(--surface); stroke: var(--muted); stroke-width: 2.5; transition: fill 0.25s, stroke 0.25s, opacity 0.3s; }
.rt-svg .rt-gn.rt-root rect { stroke: var(--accent); fill: var(--accent-soft); }
.rt-svg .rt-gn.rt-on circle { fill: var(--ok-soft); stroke: var(--ok); }
.rt-svg .rt-gn.rt-hot circle { fill: var(--warm-soft); stroke: var(--warm); }
.rt-svg .rt-gn.rt-bad circle { fill: var(--err-soft); stroke: var(--err); }
.rt-svg .rt-gn.rt-dim { opacity: 0.18; }
.rt-svg .rt-gt { font-size: 12px; font-weight: 700; text-anchor: middle; dominant-baseline: central; }
.rt-svg .rt-gl { font-size: 10px; font-weight: 600; fill: var(--muted); text-anchor: middle; dominant-baseline: central; }
`;

  Lab.addTrack({
    id: 'runtime',
    title: 'How code runs',
    description: 'What happens between your Kotlin and the phone’s chip: compilers, bytecode, DEX files, the Android Runtime, memory clean-up and app start.',
    requires: ['android'],
    css,
    lessons: [
      {
        id: 'source-to-machine',
        title: 'From source to machine code',
        tagline: 'The phone’s chip doesn’t read Kotlin. Here is how your code gets translated.',
        goals: ['Explain what a compiler and an interpreter do', 'Say what bytecode is and why a VM runs it', 'Follow one line of Kotlin from your file to the chip'],
        level: 'beginner',
        introduces: [],
        body: `
<p>You press Run and your app appears on the phone. But the chip inside the phone, the <em>CPU</em>, has never heard of Kotlin. It understands only <em>machine code</em>: long lists of numbers, each one a tiny step like “add these two numbers”. Something has to translate your code.</p>
<p>There are two ways to translate. A <em>compiler</em> translates the whole program before it runs, and refuses if something doesn’t make sense: that is where compile errors come from. An <em>interpreter</em> reads the program while it runs and carries out each step as it gets to it, without translating it all first.</p>
<p>Kotlin on Android uses a bit of both. The Kotlin compiler turns your code into <em>bytecode</em>: simple steps written for a pretend computer, not for any real chip. On the phone, a <em>virtual machine</em> (VM), a program that acts like that pretend computer, runs the bytecode (on Android, the bytecode is first converted into Android’s own bytecode format). Any device with the VM can run the same bytecode, whatever chip it has. Android’s VM is called ART.</p>`,
        visual(el) {
          Lab.ui.flow(el, {
            nodes: [
              { id: 'src', label: 'Main.kt', sub: 'source code you write' },
              { id: 'kc', label: 'Compiler', sub: 'on your computer' },
              { id: 'bc', label: 'Bytecode', sub: 'steps for a VM' },
              { id: 'vm', label: 'VM', sub: 'on the phone' },
              { id: 'cpu', label: 'CPU', sub: 'machine code only' },
            ],
            predict: {
              q: 'Which of these can the phone’s CPU run directly?',
              options: ['The Kotlin source code', 'The bytecode', 'Machine code'],
              a: 2,
              why: 'The CPU understands only machine code. Source code and bytecode both have to be translated first.',
            },
            frames: [
              { say: 'Follow one line, <code>return n * 2</code>, from your file to the chip.' },
              { at: 'src', packet: 'n * 2', say: 'You write <code>n * 2</code>. To the computer, this is only text.' },
              { at: 'kc', packet: 'n * 2', mark: { kc: 'ok' }, say: 'The compiler reads the whole file, checks every name and type, and translates it. A typo would stop everything here, as a compile error.' },
              { at: 'bc', packet: 'iload_0 iconst_2 imul', say: 'Out comes bytecode: <code>iload_0</code> (take n), <code>iconst_2</code> (take 2), <code>imul</code> (multiply them). This is the real bytecode the Kotlin compiler writes for this line.' },
              { at: 'vm', packet: 'imul', mark: { vm: 'warm' }, say: 'On the phone, the VM reads the bytecode (in Android’s own format, called DEX). It can interpret it, one step at a time, or compile it into machine code for this phone’s chip.' },
              { at: 'cpu', packet: '0101 0011 0001 1111 …', mark: { cpu: 'ok' }, say: 'The CPU gets machine code: numbers written in binary, only 0s and 1s. This is the first half of one real instruction that tells an ARM chip to double a number. Only now does the multiplication happen.' },
            ],
          });
        },
        code: `// Main.kt: the source code you write
fun double(n: Int): Int {
    return n * 2
}

fun main() {
    println(double(5))   // 10
}

// In a terminal:
// kotlinc Main.kt    the compiler writes bytecode into MainKt.class
// kotlin MainKt      the Java VM on your computer runs that bytecode and prints 10`,
        remember: 'The CPU runs only machine code. A compiler translates before the program runs, an interpreter while it runs; bytecode is the in-between form a VM runs.',
        terms: [
          { term: 'compiler', def: 'A program that translates a whole program into another form, such as bytecode or machine code, before it runs.' },
          { term: 'interpreter', def: 'A program that reads code while it runs and carries out each step directly.' },
          { term: 'bytecode', def: 'Simple steps written for a virtual machine instead of a real chip. Kotlin compiles to bytecode.' },
          { term: 'virtual machine (VM)', def: 'A program that acts like a simple computer and runs bytecode. On Android it is ART.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the missing words.', code: `// A [[compiler]] translates the whole program before it runs.
// An [[interpreter]] reads the program and does each step as it goes.
// Kotlin compiles to [[bytecode]], which a VM runs.`, why: 'A compiler works ahead of time, an interpreter while running. Bytecode sits between the two: compiled from your code, then run by a VM.' },
          { type: 'bug', prompt: 'One step in this description is wrong. Tap it.', code: `// 1. You write source code in Main.kt.
// 2. The compiler turns it into bytecode.
// 3. The CPU reads the bytecode directly.`, bug: 2, fix: '// 3. A VM on the phone runs the bytecode.', why: 'Bytecode is written for a virtual machine, not for a real chip. The VM interprets it or compiles it into machine code for the CPU.' },
        ],
        quiz: [
          { q: 'What is the only thing a CPU understands?', options: ['Kotlin', 'Bytecode', 'Machine code'], a: 2, why: 'Everything else has to be translated into machine code before the chip can run it.' },
          { q: 'You misspell <code>println</code>. Who stops you before the program runs?', options: ['The compiler', 'The CPU', 'Nobody: it crashes later'], a: 0, why: 'The compiler checks the whole program before anything runs. That check is what a compile error is.' },
          { q: 'Why compile to bytecode instead of straight to machine code?', options: ['Bytecode is shorter to type', 'The same bytecode runs on any device that has the VM, whatever its chip', 'Bytecode never needs translating again'], a: 1, why: 'Phones use different chips. The VM on each phone turns the same bytecode into that phone’s machine code.' },
        ],
        docs: [['ART and Dalvik', 'https://source.android.com/docs/core/runtime'], ['Kotlin command-line compiler', 'https://kotlinlang.org/docs/command-line.html']],
      },

      {
        id: 'kotlin-compile',
        title: 'How Kotlin compiles',
        tagline: 'Look inside the files kotlinc writes, and see what a property really is.',
        goals: ['Compile a Kotlin file with <code>kotlinc</code> and find its <code>.class</code> file', 'Read what <code>javap</code> shows inside a class file', 'Explain what a <code>val</code>, a <code>var</code> and a custom getter compile to'],
        level: 'intermediate',
        introduces: ['kotlinc', 'javap'],
        body: `
<p>You wrote <code>class User(val name: String, var age: Int)</code> in one line. What is really there when the app runs? Looking inside the compiler’s output answers that, and it explains names you will meet in crash reports, like <code>getName</code>.</p>
<p>In a terminal, <code>kotlinc User.kt -d out</code> compiles the file and puts the results in a folder called <code>out</code> (<code>-d</code> means “destination”). Each class becomes one <em>class file</em>, <code>User.class</code>, full of bytecode. Functions outside any class go into a class named after the file plus <code>Kt</code>, like <code>MainKt</code>.</p>
<p>To look inside, use <code>javap</code>, a viewer that comes with Java. This bytecode format was first made for Java, and Kotlin uses it too. <code>javap -p</code> lists everything in a class, <code>private</code> parts too. It writes types the Java way: <code>java.lang.String</code> is <code>String</code>, and <code>final</code> means closed: a final class can’t be inherited from and a final function can’t be overridden (Kotlin’s default unless you write <code>open</code>).</p>
<p>The surprise: a property is a private box, called a <em>field</em>, plus small functions. A <code>val</code> gets a <em>getter</em>, <code>getName()</code>, that hands the value back. A <code>var</code> also gets a <em>setter</em>, <code>setAge()</code>. A property with its own <code>get()</code> and no stored value becomes only a getter.</p>`,
        visual(el) {
          const src = s => '<pre class="ui-out">' + s.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
          Lab.ui.terminal(el, {
            panelTitle: 'User.kt',
            predict: {
              q: 'Before looking: what does <code>val name</code> turn into inside <code>User.class</code>?',
              options: ['Only a stored value, nothing else', 'A private stored value plus a <code>getName()</code> function', 'A <code>getName()</code> and a <code>setName()</code> function'],
              a: 1,
              why: 'A <code>val</code> can be read but not changed, so it gets a private field and a getter, and no setter.',
            },
            frames: [
              { panel: src('class User(val name: String, var age: Int) {\n    val isAdult: Boolean\n        get() = age >= 18\n}'), say: '<code>User.kt</code> holds one class: a <code>val</code>, a <code>var</code>, and a property with its own getter. Compile it and look inside.' },
              { cmd: 'kotlinc User.kt -d out', say: 'No output means no errors. The results are in the folder <code>out</code>.' },
              { cmd: 'ls out', out: 'META-INF  User.class', say: '<code>User.class</code> holds the bytecode for the class. <code>META-INF</code> is a small folder of notes about the build; you can ignore it.' },
              { cmd: 'javap -p out/User.class', out: 'Compiled from "User.kt"\npublic final class User {\n  private final java.lang.String name;\n  private int age;\n  public User(java.lang.String, int);\n  public final java.lang.String getName();\n  public final int getAge();\n  public final void setAge(int);\n  public final boolean isAdult();\n}', say: '<code>name</code> became a private field plus <code>getName()</code>. <code>age</code> also got <code>setAge(int)</code>, because it is a <code>var</code>.' },
              { say: '<code>isAdult</code> has no field: its value is worked out each time from <code>age</code>, so only the getter exists. A property whose name starts with <code>is</code> keeps that name for its getter.' },
              { cmd: 'javap -c -p out/User.class', clear: true, out: 'Compiled from "User.kt"\npublic final class User {\n  public final java.lang.String getName();\n    Code:\n       0: aload_0\n       1: getfield      #21                 // Field name:Ljava/lang/String;\n       4: areturn', say: '<code>-c</code> adds the bytecode inside each function (cut here to the getter). <code>aload_0</code> takes this object, <code>getfield</code> reads its <code>name</code> field, <code>areturn</code> hands it back. That is a whole getter.' },
            ],
          });
        },
        code: `// Book.kt
class Book(val title: String, var pages: Int) {
    val isLong: Boolean
        get() = pages > 300
}

// $ kotlinc Book.kt -d out
// $ javap -p out/Book.class     (lines cut to the members)
//   private final java.lang.String title;      the val's field
//   private int pages;                         the var's field
//   public final java.lang.String getTitle();
//   public final int getPages();
//   public final void setPages(int);           only a var gets a setter
//   public final boolean isLong();             own getter, no field`,
        remember: 'kotlinc writes one .class file per class. A val is a private field plus a getter; a var adds a setter.',
        terms: [
          { term: 'kotlinc', def: 'The Kotlin compiler as a terminal command. It writes <code>.class</code> files full of bytecode.' },
          { term: 'javap', def: 'A viewer that comes with Java. <code>javap -p</code> lists what is inside a <code>.class</code> file.' },
          { term: 'field', def: 'The private box inside an object that stores a property’s value.' },
          { term: 'getter / setter', def: 'The small functions a property compiles to: <code>getName()</code> reads it, <code>setAge()</code> changes it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in what <code>javap -p</code> shows for <code>class Song(val title: String, var plays: Int)</code>.', code: `public final java.lang.String [[getTitle]]();
public final int getPlays();
public final void [[setPlays]](int);`, why: 'Each property gets a getter named <code>get</code> plus the property name. Only the <code>var</code> gets a setter.' },
          { type: 'bug', prompt: 'You want to look inside the compiled class, but <code>javap</code> says <code>Error: class not found: out/Song.kt</code>. Tap the wrong line.', code: `kotlinc Song.kt -d out
ls out
javap -p out/Song.kt`, bug: 2, fix: 'javap -p out/Song.class', why: '<code>javap</code> reads class files. <code>Song.kt</code> is your source code; the compiler wrote <code>Song.class</code> into <code>out</code>.' },
        ],
        quiz: [
          { q: 'What does <code>class Box(val size: Int)</code> compile to for <code>size</code>?', options: ['A private field and <code>getSize()</code>', 'A getter and a setter', 'Nothing: properties exist only in Kotlin'], a: 0, why: 'A <code>val</code> is read-only: a private field plus a getter. A <code>var</code> would add <code>setSize</code>.' },
          { q: 'Your file <code>Notes.kt</code> has a function outside any class. Which class file holds it?', options: ['<code>Notes.class</code>', '<code>NotesKt.class</code>', 'None: it stays in the .kt file'], a: 1, why: 'Bytecode keeps every function inside a class, so the compiler makes one named after the file plus <code>Kt</code>.' },
          { q: '<code>val isEmpty: Boolean get() = count == 0</code>. What appears in the class file for it?', options: ['A field and a getter', 'Only the method <code>isEmpty()</code>', 'A setter <code>setEmpty()</code>'], a: 1, why: 'Its value is computed each time, so nothing is stored. A name starting with <code>is</code> keeps that name for its getter.' },
        ],
        docs: [['Calling Kotlin from Java: properties', 'https://kotlinlang.org/docs/java-to-kotlin-interop.html'], ['Kotlin command-line compiler', 'https://kotlinlang.org/docs/command-line.html']],
      },

      {
        id: 'dex',
        title: 'DEX files',
        tagline: 'Android runs its own kind of bytecode, packed into classes.dex.',
        goals: ['Explain why an Android build converts <code>.class</code> files to DEX', 'Say what D8 does when you build', 'Know what happens when an app outgrows one DEX file'],
        level: 'intermediate',
        introduces: [],
        body: `
<p>Phones have less memory and battery than a computer, so Android doesn’t run the <code>.class</code> files that <code>kotlinc</code> writes. It runs its own bytecode format, <em>DEX</em> (Dalvik Executable, named after Android’s first VM), made to be compact on a phone.</p>
<p>Every time you build, a tool called <em>D8</em> converts all the <code>.class</code> files into DEX: yours, and those of every library your app uses. The result is a file called <code>classes.dex</code>, packed inside the APK, the file that gets installed on the phone. You never start D8 yourself: Android Studio runs it as part of the build. (In release builds with code shrinking on, a related tool, <em>R8</em>, does this job and also removes unused code.)</p>
<p>One DEX file can refer to at most 65,536 <em>methods</em> (bytecode’s name for functions), counting your code, your libraries and the Android functions you call. A bigger app needs more files: <code>classes2.dex</code>, <code>classes3.dex</code> and so on. This is called <em>multidex</em>. If your <code>minSdk</code>, the oldest Android version your app supports, is 21 or higher, it works by default with no extra setup.</p>`,
        visual(el) {
          const LIMIT = 65536;
          const fmt = n => n.toLocaleString('en-US');
          const ins = h('div', { class: 'rt-row' });
          const rows = ['classes.dex', 'classes2.dex'].map(name => {
            const fill = h('div', { class: 'rt-fill' });
            const num = h('b', {}, '');
            const row = h('div', { class: 'rt-dexfile' }, h('span', { class: 'rt-stat' }, name + ' ', num), h('div', { class: 'rt-meter' }, fill));
            return { fill, num, row };
          });
          const out = h('div', { class: 'rt-bars' }, rows.map(r => r.row));
          const BASE = ['MainActivity.class', 'Note.class', 'NoteList.class', 'library .class files'];
          const frames = [
            { ins: BASE, dex: [], say: 'After <code>kotlinc</code>: class files for your code, plus the class files inside every library. The phone can’t run any of these yet. All numbers here are illustrative.' },
            { ins: BASE, dex: [18000], say: '<b>D8</b> converts every one of them into one DEX file, <code>classes.dex</code>. The meter counts the methods it refers to: 18,000 of the 65,536 allowed.' },
            { ins: [...BASE, 'maps library'], dex: [48000], say: 'You add a big maps library. Its methods count too: the total is now 48,000.' },
            { ins: [...BASE, 'maps library', 'charts library'], dex: [64900, 8100], say: 'One more library and the methods no longer fit in one file. The build fills <code>classes.dex</code> and starts <code>classes2.dex</code>.' },
            { ins: [...BASE, 'maps library', 'charts library'], dex: [64900, 8100], say: 'Both files go into the APK. With <code>minSdk</code> 21 or higher you change nothing: the build makes as many DEX files as it needs.' },
            { ins: [...BASE, 'maps library', 'charts library'], dex: [64900, 8100], say: 'On the phone, ART finds every <code>classesN.dex</code> file in the APK and loads them all. To your app it is still one program.' },
          ];
          Lab.ui.player(el, {
            frames,
            stage: h('div', { class: 'ui-stage rt-stage' }, label('input: class files'), ins, label('output: DEX files'), out),
            predict: {
              q: 'The app needs 73,000 method references, more than one DEX file can hold. Its <code>minSdk</code> is 24. What happens?',
              options: ['The build fails with an error', 'The build writes a second file, <code>classes2.dex</code>', 'D8 deletes the methods that don’t fit'],
              a: 1,
              why: 'With <code>minSdk</code> 21 or higher, multidex is on by default: the build adds DEX files as needed.',
            },
            draw(f, i) {
              ins.replaceChildren(...f.ins.map(n => h('span', { class: `rt-pill ${n.endsWith('library') ? 'rt-warm' : ''} ${i > 0 ? 'rt-done' : ''}` }, n)));
              rows.forEach((r, k) => {
                const n = f.dex[k];
                r.row.hidden = n === undefined && k > 0;
                r.num.textContent = n === undefined ? 'not built yet' : `${fmt(n)} / ${fmt(LIMIT)}`;
                r.fill.style.width = `${((n || 0) / LIMIT) * 100}%`;
                r.fill.classList.toggle('rt-full', (n || 0) > 60000);
              });
            },
          });
        },
        code: `// app/build.gradle.kts
android {
    defaultConfig {
        minSdk = 24   // 21 or higher: several DEX files work with no extra setup
    }
}

// What ends up inside the APK of a big app:
// classes.dex     your code and libraries, converted by D8
// classes2.dex    the methods that didn't fit in the first file`,
        remember: 'D8 turns every .class file into DEX. One DEX file refers to at most 65,536 methods; past that, the build adds classes2.dex.',
        terms: [
          { term: 'DEX', def: 'Dalvik Executable: the bytecode format Android runs, stored in <code>classes.dex</code> files inside the APK.' },
          { term: 'D8', def: 'The build tool that converts <code>.class</code> files into DEX. Android Studio runs it for you.' },
          { term: 'method', def: 'Bytecode’s name for a function, including the getters and setters properties compile to.' },
          { term: 'multidex', def: 'Splitting an app’s code over several DEX files: <code>classes.dex</code>, <code>classes2.dex</code> and so on.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the missing words.', code: `// D8 converts every .class file into [[DEX|dex]] bytecode.
// The first file in the APK is called [[classes.dex]].
// One DEX file can refer to at most [[65,536|65536]] methods.`, why: 'D8 writes DEX. The first file is <code>classes.dex</code>, and each one holds up to 65,536 method references.' },
          { type: 'bug', prompt: 'An app with <code>minSdk = 24</code> needs more than 65,536 methods. One line of this explanation is wrong. Tap it.', code: `// 1. D8 fills classes.dex.
// 2. The rest goes into classes2.dex.
// 3. The phone loads only classes.dex, so the app crashes.`, bug: 2, fix: '// 3. ART loads every classesN.dex file, so the app runs normally.', why: 'ART, Android’s runtime since Android 5.0 (API 21), loads all the DEX files in the APK.' },
        ],
        quiz: [
          { q: 'Which files does Android run?', options: ['<code>.kt</code> files', '<code>.class</code> files', 'DEX files'], a: 2, why: 'kotlinc writes <code>.class</code> files, and D8 converts them to DEX, the format Android runs.' },
          { q: 'What does D8 do?', options: ['Converts <code>.class</code> files into DEX', 'Checks your Kotlin for typos', 'Installs the app on the phone'], a: 0, why: 'Typos are the Kotlin compiler’s job. D8 comes after it and turns its output into DEX.' },
          { q: 'Your app passes 65,536 method references and has <code>minSdk = 24</code>. What must you do?', options: ['Remove libraries until it fits', 'Nothing: the build writes <code>classes2.dex</code> and ART loads it', 'Turn the app into two apps'], a: 1, why: 'With <code>minSdk</code> 21 or higher, multidex is on by default.' },
        ],
        docs: [['d8', 'https://developer.android.com/tools/d8'], ['Enable multidex', 'https://developer.android.com/build/multidex']],
      },

      {
        id: 'art',
        title: 'Android Runtime',
        tagline: 'Interpreted, compiled while running, or compiled ahead: how ART runs your code.',
        goals: ['Name the three ways ART can run a method', 'Explain why a fresh install starts slower', 'Say what a profile and a Baseline Profile do'],
        level: 'intermediate',
        introduces: [],
        body: `
<p>Install a new app and open it: the first launch can feel slower than the tenth. That isn’t your imagination. It comes from how Android’s VM, <em>ART</em> (the Android Runtime), runs your code. ART can run each method in three ways.</p>
<p>The <em>interpreter</em> carries out DEX steps one by one: it starts at once but is slow. The <em>JIT</em> (just-in-time) compiler notices which methods run often (they are “hot”) and compiles them into machine code while the app runs, keeping that code in memory.</p>
<p><em>AOT</em> (ahead-of-time) compilation turns methods into machine code before the app starts and saves it. Doing that for every method would cost a lot of time and storage, mostly for code that rarely runs. So while you use the app, ART saves a <em>profile</em>: a list of the methods that matter. About once a day, when the phone is idle and charging, a tool on the phone called <code>dex2oat</code> compiles the methods in that profile. A fresh install has no profile yet, which is why its first launches are slower.</p>
<p>Apps can fix that with a <em>Baseline Profile</em>: a profile shipped inside the app, so ART can compile those methods when the app is installed from a store that supports it, or shortly after the first launch otherwise. Android’s documentation reports about 30% faster code from the first launch for the code it covers.</p>`,
        visual(el) {
          const CALLS = 40, HOT = 10, READY = 14;
          const cost = (m, c) => m === 'int' ? 100 : m === 'aot' ? 12 : c < READY ? 100 : 12;
          const W = 320, H = 170, L = 34, B = 24, T = 10;
          const x = c => L + (c / (CALLS - 1)) * (W - L - 8);
          const y = v => T + (1 - v / 110) * (H - T - B);
          const ticks = [0, 50, 100].map(v => `<text class="rt-tick" x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`).join('');
          const xt = [1, 10, 20, 30, 40].map(c => `<text class="rt-tick" x="${x(c - 1)}" y="${H - 8}" text-anchor="middle">${c}</text>`).join('');
          const chart = h('div', { class: 'rt-svgwrap' });
          const frames = [
            { lines: {}, say: 'One method in your app, called 40 times. The chart shows how long each call takes, in µs (millionths of a second). The numbers are illustrative.' },
            { lines: { int: CALLS }, say: '<b>Interpreter only:</b> every call costs about 100 µs. No waiting to start, but no speed-up either.' },
            { lines: { int: CALLS, jit: HOT + 1 }, mark: true, say: '<b>With the JIT:</b> the first calls run in the interpreter too. At call 10 ART decides the method is hot and starts compiling it in the background.' },
            { lines: { int: CALLS, jit: CALLS }, mark: true, say: 'Calls 11 to 14 still run in the interpreter while the compiling finishes. Then each call takes about 12 µs. That machine code lives in memory and is gone once the app is fully closed.' },
            { lines: { int: CALLS, jit: CALLS, aot: CALLS }, mark: true, say: '<b>AOT:</b> the method was in the profile, so <code>dex2oat</code> compiled it before the app started. About as fast as the JIT’s code, but from call 1.' },
            { lines: { int: CALLS, jit: CALLS, aot: CALLS }, mark: true, say: 'ART saved the profile while people used the app, and compiled from it while the phone was idle and charging. A Baseline Profile ships that list inside the app, so even launch 1 can get the AOT line.' },
          ];
          Lab.ui.player(el, {
            frames,
            stage: h('div', { class: 'ui-stage rt-stage' }, chart,
              h('div', { class: 'rt-key' }, h('span', {}, h('i', { class: 'rt-k-int' }), 'interpreter'), h('span', {}, h('i', { class: 'rt-k-jit' }), 'JIT'), h('span', {}, h('i', { class: 'rt-k-aot' }), 'AOT')),
              h('span', { class: 'rt-note' }, 'up: µs per call · across: call number')),
            predict: {
              q: 'With the JIT, the method counts as hot at call 10. When do its calls get fast?',
              options: ['At call 10 exactly', 'A few calls later, once the compiling is done', 'Only after the app restarts'],
              a: 1,
              why: 'The JIT compiles in the background. Until the machine code is ready, calls keep running in the interpreter.',
            },
            draw(f) {
              const lines = ['int', 'jit', 'aot'].filter(m => f.lines[m]).map(m => {
                const pts = Array.from({ length: f.lines[m] }, (_, c) => `${x(c).toFixed(1)},${y(cost(m, c)).toFixed(1)}`).join(' ');
                return `<polyline class="rt-line rt-l-${m}" points="${pts}"/>`;
              }).join('');
              const mark = f.mark ? `<line class="rt-markline" x1="${x(HOT - 1)}" y1="${T}" x2="${x(HOT - 1)}" y2="${H - B}"/><text class="rt-mark" x="${x(HOT - 1) + 4}" y="${T + 10}">hot</text>` : '';
              chart.innerHTML = `<svg class="rt-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="time per call by call number"><line class="rt-axis" x1="${L}" y1="${H - B}" x2="${W}" y2="${H - B}"/><line class="rt-axis" x1="${L}" y1="${T}" x2="${L}" y2="${H - B}"/>${ticks}${xt}${mark}${lines}</svg>`;
            },
          });
        },
        code: `# Make ART compile the app now, the way the idle-and-charging job does
adb shell pm compile -m speed-profile -f com.example.notes

# pm                 the package manager tool on the phone
# -m speed-profile   compile ahead of time only the methods in the profile
# -f                 do it even if ART thinks it is already done`,
        remember: 'Interpreter first, JIT for hot methods, AOT for what the profile lists. A Baseline Profile gives every user that list from launch 1.',
        terms: [
          { term: 'ART', def: 'The Android Runtime: Android’s VM. It runs DEX code with an interpreter, a JIT compiler and AOT-compiled code.' },
          { term: 'JIT compilation', def: 'Compiling hot methods into machine code while the app runs. The code is kept in memory.' },
          { term: 'AOT compilation', def: 'Compiling methods into machine code before the app runs, done on the phone by <code>dex2oat</code>.' },
          { term: 'profile', def: 'A list of the methods that matter, which ART compiles ahead of time. A <em>Baseline Profile</em> is one shipped inside the app.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Fill in the missing words.', code: `// First launches: the [[interpreter]] runs each step, and the [[JIT|jit]] compiles hot methods.
// Idle and charging: dex2oat compiles the methods in the [[profile]] ahead of time.`, why: 'The interpreter and the JIT work while the app runs. The profile tells <code>dex2oat</code> what to compile ahead of time.' },
          { type: 'bug', prompt: 'One line of this explanation is wrong. Tap it.', code: `// Why the first launch after an install is slower
// 1. There is no profile yet, so nothing was compiled ahead of time.
// 2. Methods start in the interpreter.
// 3. Hot methods get JIT-compiled while the app runs.
// 4. The JIT saves its machine code to a file for next time.
// 5. Idle and charging, dex2oat compiles the methods in the profile.`, bug: 4, fix: '// 4. ART saves a profile; the JIT’s machine code stays in memory.', why: 'JIT code is kept in memory while the app runs. What ART saves is the profile, which <code>dex2oat</code> uses later.' },
        ],
        quiz: [
          { q: 'A fresh install has no profile and no Baseline Profile. How do its first launches run?', options: ['Fully compiled ahead of time', 'In the interpreter, with hot methods JIT-compiled', 'Not at all until dex2oat finishes'], a: 1, why: 'Without a profile there is nothing to compile ahead of time, so ART starts with the interpreter and the JIT.' },
          { q: 'Why doesn’t ART compile every method of every app ahead of time?', options: ['It costs time and storage for code that rarely runs', 'AOT code is slower than the interpreter', 'Android doesn’t allow it'], a: 0, why: 'The profile points ART at the code that matters, so it compiles only that.' },
          { q: 'What does shipping a Baseline Profile change?', options: ['The app gets smaller', 'ART compiles the listed methods at or soon after installation, so the first launches are faster', 'The JIT is switched off'], a: 1, why: 'The profile is inside the app, so it is there from the first install instead of after the first idle-and-charging night.' },
        ],
        docs: [['ART JIT compiler', 'https://source.android.com/docs/core/runtime/jit-compiler'], ['Baseline Profiles overview', 'https://developer.android.com/topic/performance/baselineprofiles/overview']],
      },

      {
        id: 'gc',
        title: 'Garbage collection',
        tagline: 'Objects stay in memory while something can reach them. The rest is cleaned up for you.',
        goals: ['Explain what makes an object reachable', 'Follow one mark-and-sweep collection step by step', 'Predict which objects a collection frees'],
        level: 'beginner',
        introduces: [],
        body: `
<p>Every object your app creates, a <code>Note</code>, a list, a photo, takes up a little of the phone’s memory. An app that only ever created objects would run out and crash. You never write code to delete objects, so who cleans up?</p>
<p>ART does, with a <em>garbage collector</em> (GC). Every now and then it works out which objects the app can still reach. It starts from the <em>GC roots</em>: things that are surely in use, such as the local variables of functions running right now, and every Kotlin <code>object</code> and <code>companion object</code>, which live as long as the app. An object a root points at is <em>reachable</em>, and so is everything that object points at, and so on.</p>
<p>The classic way to do this is <em>mark and sweep</em>. Mark: follow every reference out of the roots and mark each object you reach. Sweep: free every object that wasn’t marked, so its memory can be used again. Pointing at a live object doesn’t save an object; only being pointed at by something reachable does. ART’s collector is a faster relative of this idea that does most of its work while your app keeps running.</p>`,
        visual(el) {
          const nodes = [
            { id: 'R1', x: 50, y: 30, text: 'local', root: true },
            { id: 'R2', x: 300, y: 30, text: 'object', root: true },
            { id: 'L', x: 50, y: 110, text: 'L', label: 'list' },
            { id: 'U', x: 130, y: 110, text: 'U', label: 'user' },
            { id: 'B', x: 130, y: 192, text: 'B', label: 'photo' },
            { id: 'C', x: 300, y: 110, text: 'C', label: 'settings' },
            { id: 'T1', x: 215, y: 258, text: 'T1', label: 'temp' },
            { id: 'T2', x: 215, y: 192, text: 'T2', label: 'temp' },
            { id: 'X', x: 290, y: 236, text: 'X', label: 'pair' },
            { id: 'Y', x: 345, y: 236, text: 'Y', label: 'pair' },
          ];
          const edges = [['R1', 'L'], ['L', 'U'], ['U', 'B'], ['R2', 'C'], ['C', 'U'], ['T1', 'T2'], ['T2', 'U'], ['X', 'Y', true]];
          const g = graphSvg(nodes, edges, { w: 360, ht: 290, name: 'objects in memory and the references between them' });
          const st = stats(['marked', 'freed']);
          const S1 = [['R1', 'L'], ['R2', 'C']], S2 = [...S1, ['L', 'U'], ['U', 'B']];
          const frames = [
            { phase: 'start', marked: [], seen: [], freed: [], say: 'Memory after some work. Boxes are GC roots: <code>local</code> is a variable in a running function, <code>object</code> is a Kotlin <code>object</code>. Circles are other objects; arrows are references.' },
            { phase: 'roots', marked: [], seen: [], freed: [], say: '<b>Mark</b> starts at the roots. Which circles can they reach?' },
            { phase: 'mark', marked: ['L', 'C'], cur: ['L', 'C'], seen: S1, freed: [], say: 'Follow the arrows out of the roots: <code>L</code> (a list) and <code>C</code> (settings) are reachable. Mark them.' },
            { phase: 'mark', marked: ['L', 'C', 'U', 'B'], cur: ['U', 'B'], seen: S2, freed: [], say: 'Keep following: <code>U</code> is reachable from <code>L</code> (and from <code>C</code>, but once is enough), and <code>B</code> from <code>U</code>.' },
            { phase: 'garbage', marked: ['L', 'C', 'U', 'B'], seen: S2, freed: [], say: '<b>Marking is done.</b> Red objects were never reached. <code>T2</code> points at <code>U</code>, but nothing reachable points at <code>T2</code>.' },
            { phase: 'sweep', marked: ['L', 'C', 'U', 'B'], seen: S2, freed: ['T1', 'T2'], say: '<b>Sweep:</b> <code>T1</code> and <code>T2</code> are freed. Their memory can hold new objects.' },
            { phase: 'sweep', marked: ['L', 'C', 'U', 'B'], seen: S2, freed: ['T1', 'T2', 'X', 'Y'], say: '<code>X</code> and <code>Y</code> point at each other, but nothing reachable points at either, so they are freed too. 4 objects kept, 4 freed.' },
          ];
          Lab.ui.player(el, {
            frames,
            stage: h('div', { class: 'ui-stage rt-stage' }, g.root, st),
            predict: {
              q: '<code>T2</code> points at <code>U</code>, which is in use. Nothing points at <code>T2</code>. Is <code>T2</code> kept?',
              options: ['Yes: it points at an object in use', 'No: nothing reachable points at it, so it is freed', 'Only if <code>U</code> is freed too'],
              a: 1,
              why: 'Marking follows arrows out of the roots. What an object points at doesn’t matter, only whether something reachable points at it.',
            },
            draw(f) {
              for (const n of nodes) {
                if (n.root) { g.node(n.id, f.phase === 'start' ? '' : 'rt-root'); continue; }
                const cls = f.freed.includes(n.id) ? 'rt-dim' : f.marked.includes(n.id) ? ((f.cur || []).includes(n.id) ? 'rt-hot' : 'rt-on') : (f.phase === 'garbage' || f.phase === 'sweep') ? 'rt-bad' : '';
                g.node(n.id, cls);
              }
              for (const [a, b] of edges) {
                const on = f.seen.some(([p, q]) => p === a && q === b);
                g.edge(a, b, on ? 'rt-on' : f.freed.includes(a) ? 'rt-dim' : '');
              }
              st.set('marked', f.marked.length); st.set('freed', f.freed.length);
            },
          });
        },
        code: `class Photo(val name: String)

object Gallery {
    val saved = mutableListOf<Photo>()   // Gallery lives as long as the app: a GC root
}

fun showAlbum() {
    val beach = Photo("beach")       // reachable: the local variable beach points at it
    Gallery.saved.add(beach)         // now Gallery points at it too
    val preview = Photo("preview")   // reachable while showAlbum runs
    println("Showing \${preview.name}")
}
// When showAlbum ends, its local variables are gone.
// "preview" can be freed. "beach" stays: Gallery still points at it.`,
        play: `class Photo(val name: String)

object Gallery {
    val saved = mutableListOf<Photo>()
}

fun showAlbum() {
    val beach = Photo("beach")
    Gallery.saved.add(beach)
    val preview = Photo("preview")
    println("Showing \${preview.name}")
}

fun main() {
    showAlbum()
    // preview can be freed now. beach is still reachable through Gallery:
    println(Gallery.saved[0].name)
}`,
        remember: 'Reachable from a GC root means kept. Everything else is freed, even objects that only point at each other.',
        terms: [
          { term: 'garbage collector (GC)', def: 'The part of ART that finds objects the app can no longer reach and frees their memory.' },
          { term: 'GC root', def: 'Something surely in use, such as a local variable of a running function or a Kotlin <code>object</code>.' },
          { term: 'reachable', def: 'An object you can get to by following references from a GC root. Reachable objects are kept.' },
          { term: 'mark and sweep', def: 'Mark every object reachable from the roots, then free (sweep) all the others.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Complete the steps of one collection.', code: `// 1. Start from the GC [[roots]].
// 2. [[mark]] every object reachable from them.
// 3. [[sweep]]: free everything not marked.`, why: 'This is mark and sweep: reachability from the roots decides what stays.' },
          { type: 'bug', prompt: 'One of these rules is false. Tap it.', code: `// Which objects stay in memory?
// 1. A local variable in a running function is a GC root.
// 2. A Kotlin object counts as a GC root.
// 3. An object that points at a reachable object is kept too.
// 4. Two objects that only point at each other can be freed.`, bug: 3, fix: '// 3. An object is kept only if something reachable points at it.', why: 'References point one way. Pointing at a live object doesn’t help; being pointed at from something reachable does. That is why <code>T2</code> was freed in the demo.' },
        ],
        quiz: [
          { q: '<code>A</code> and <code>B</code> point at each other, and nothing else points at either. What does the GC do?', options: ['Keeps both, because each has a reference', 'Frees both, because neither is reachable from a root', 'Frees one and keeps the other'], a: 1, why: 'The only question is “reachable from a root?”. A pair cut off from the roots is garbage.' },
          { q: 'A function ends. What happens to an object only its local variable pointed at?', options: ['It is freed that same moment', 'It becomes unreachable, and a later collection frees it', 'It stays forever'], a: 1, why: 'The local variable is gone when the function ends. The object waits until the GC runs and finds it unreachable.' },
          { q: 'You add an object to a list inside a Kotlin <code>object</code>. When can the GC free it?', options: ['When the function that made it ends', 'Not while it is in that list', 'At the next collection'], a: 1, why: 'The <code>object</code> is a GC root, and the list inside it points at your object, so it stays reachable.' },
        ],
        docs: [['Overview of memory management', 'https://developer.android.com/topic/performance/memory-overview']],
      },

      {
        id: 'references',
        title: 'Strong and weak references',
        tagline: 'A normal reference keeps an object alive. A WeakReference doesn’t.',
        goals: ['Explain how a reference can keep a closed screen in memory', 'Hold an object with <code>WeakReference</code> and read it with <code>get()</code>', 'Decide when a weak reference helps and when to let go instead'],
        level: 'intermediate',
        introduces: ['WeakReference'],
        body: `
<p>Rotate the phone and Android destroys the Activity and creates a new one. The GC should free the old one. But if a Kotlin <code>object</code> still has a reference to it, the old Activity stays reachable, so it stays in memory with everything on its screen. Memory the app no longer needs but can’t free is a <em>memory leak</em>; a few rotations and it adds up.</p>
<p>Every reference you have written so far is a <em>strong</em> reference: while it exists, the object stays. A <code>WeakReference</code> is a reference the GC ignores. <code>val ref = WeakReference(activity)</code> wraps the object; if only weak references point at it, the GC can free it. <code>ref.get()</code> gives the object back, or <code>null</code> once it has been freed, so read it with <code>?.</code>. It needs <code>import java.lang.ref.WeakReference</code> at the top of the file.</p>
<p>When does it help? When something long-lived, like an <code>object</code>, has to talk to something short-lived, like an Activity, and can’t know when that goes away. Often a simpler fix exists: don’t keep it at all. Pass <code>applicationContext</code> instead of the Activity, or remove the Activity from the list in <code>onDestroy</code>.</p>`,
        visual(el) {
          Lab.ui.graph(el, {
            height: 260,
            nodes: [
              { id: 'dl', label: 'Downloads<small>object: always reachable</small>', x: 28, y: 14, tone: 'muted' },
              { id: 'sys', label: 'Android<small>shows the screen</small>', x: 76, y: 14, tone: 'muted' },
              { id: 'a1', label: 'Activity #1', x: 17, y: 82 },
              { id: 'a2', label: 'Activity #2', x: 50, y: 82, hidden: true },
              { id: 'a3', label: 'Activity #3', x: 83, y: 82, hidden: true },
            ],
            predict: {
              q: 'Each Activity calls <code>Downloads.watch(this)</code>, which keeps it in a list with a normal reference. You rotate twice, then the GC runs. How many Activities are still in memory?',
              options: ['1: the one on screen', '3: the one on screen and both destroyed ones', '0: the GC frees them all'],
              a: 1,
              why: '<code>Downloads</code> is an <code>object</code>, a GC root, and its list points at every Activity. Reachable means kept.',
            },
            frames: [
              { add: [['sys', 'a1'], ['dl', 'a1', 'strong']], say: 'Activity #1 is on screen, so Android holds it. In <code>onCreate</code> it calls <code>Downloads.watch(this)</code>, and <code>Downloads</code> adds it to a list: a normal, strong reference.' },
              { show: ['a2'], remove: [['sys', 'a1']], add: [['sys', 'a2'], ['dl', 'a2', 'strong']], say: 'Rotate. Android destroys #1 and creates #2, which calls <code>watch(this)</code> too. Nobody took #1 out of the list.' },
              { hl: ['dl', 'a1'], add: [['dl', 'a1', 'strong', 'err']], say: 'The GC runs. <code>Downloads</code> → #1 is a path from a root, so #1 is reachable and stays, with its whole screen. That is a leak.' },
              { show: ['a3'], remove: [['sys', 'a2']], add: [['sys', 'a3'], ['dl', 'a3', 'strong'], ['dl', 'a2', 'strong', 'err']], say: 'Rotate again: two destroyed Activities are stuck in memory now. Every rotation adds one more.' },
              { add: [['dl', 'a1', 'weak', 'weak'], ['dl', 'a2', 'weak', 'weak'], ['dl', 'a3', 'weak', 'weak']], say: 'Now change <code>Downloads</code> to keep a <code>WeakReference</code> to each Activity (dashed). The GC ignores weak references.' },
              { remove: [['dl', 'a1'], ['dl', 'a2']], gone: ['a1', 'a2'], say: 'The next GC frees #1 and #2: nothing strong reaches them, and their <code>get()</code> now returns <code>null</code>. #3 stays, because Android holds it strongly.' },
            ],
          });
        },
        code: `import java.lang.ref.WeakReference

object Downloads {
    private val screens = mutableListOf<WeakReference<MainActivity>>()

    fun watch(screen: MainActivity) {
        screens.add(WeakReference(screen))   // doesn't keep the screen alive
    }

    fun finished() {
        for (ref in screens) {
            ref.get()?.showDone()            // get() is null if that screen was freed
        }
    }
}`,
        remember: 'A strong reference keeps an object alive; a WeakReference doesn’t, and its get() can return null. Never let something long-lived hold a screen strongly.',
        mistakes: [
          { title: 'Forgetting the import', bad: `object Downloads {
    private var screen: WeakReference<MainActivity>? = null
    // error: Unresolved reference 'WeakReference'.
}`, good: `import java.lang.ref.WeakReference

object Downloads {
    private var screen: WeakReference<MainActivity>? = null
}`, why: '<code>WeakReference</code> lives in <code>java.lang.ref</code>, which Kotlin doesn’t bring in by itself. Add the import at the top of the file.' },
        ],
        terms: [
          { term: 'strong reference', def: 'A normal reference. While it exists, the object it points at can’t be freed.' },
          { term: 'WeakReference', def: 'A reference the GC ignores. <code>get()</code> returns the object, or <code>null</code> after it has been freed.' },
          { term: 'memory leak', def: 'An object the app no longer needs that is still reachable, so the GC can never free it.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Keep the screen without keeping it alive, and handle the case where it is gone.', code: `private var screen: [[WeakReference]]<MainActivity>? = null

fun finished() {
    screen?.[[get]]()?.showDone()
}`, why: '<code>get()</code> returns the Activity while it is alive and <code>null</code> after it is freed, so the second <code>?.</code> is needed.' },
          { type: 'bug', prompt: '<code>ImageLoader</code> is an <code>object</code> that keeps the context it is given. After a few rotations, old <code>FeedActivity</code> objects are still in memory. Tap the line responsible.', code: `class FeedActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ImageLoader.init(this)
        setContent { Text("Feed") }
    }
}`, bug: 3, fix: '        ImageLoader.init(applicationContext)', why: 'An <code>object</code> lives as long as the app, so it holds the destroyed Activity strongly. The application context lives just as long as the <code>object</code>, so holding it leaks nothing.' },
        ],
        quiz: [
          { q: 'Only weak references point at an object. What can happen at the next GC?', options: ['Nothing: weak references keep it too', 'It is freed, and <code>get()</code> then returns <code>null</code>', 'It turns into a strong reference'], a: 1, why: 'The GC ignores weak references, so the object is unreachable.' },
          { q: 'Why is <code>ref.get()</code> read with <code>?.</code>?', options: ['It returns <code>null</code> once the object has been freed', 'Kotlin requires <code>?.</code> after every function call', 'It makes the reference strong'], a: 0, why: 'The object may already be gone. <code>?.</code> skips the call instead of crashing.' },
          { q: 'An Activity adds itself to a list in a Kotlin <code>object</code> in <code>onCreate</code>. What fixes the leak most directly?', options: ['Removing it from the list in <code>onDestroy</code>', 'Rotating the phone less', 'Making the list a <code>val</code>'], a: 0, why: 'If the Activity leaves the list when it is destroyed, no root reaches it and the GC can free it.' },
        ],
        docs: [['WeakReference', 'https://developer.android.com/reference/java/lang/ref/WeakReference']],
      },

      {
        id: 'startup',
        title: 'What happens at app start',
        tagline: 'From tapping the icon to the first frame: each step, and where the time goes.',
        goals: ['List the steps of a cold start in order', 'Explain why work in <code>Application.onCreate</code> delays every launch', 'Move heavy set-up out of the start with <code>by lazy</code>'],
        level: 'intermediate',
        introduces: ['Application'],
        body: `
<p>Someone taps your app’s icon. Until your first screen appears, they look at a blank window. Knowing what happens in that time tells you what you can make shorter.</p>
<p>A <em>cold start</em> is a start when your app isn’t running at all. First Android creates a <em>process</em> for it: a running program with its own memory. It doesn’t build one from nothing; it copies <em>Zygote</em>, a process started when the phone boots, with Android’s own code already loaded. Then Android loads your code and creates your <code>Application</code> object, one per process, and calls its <code>onCreate()</code>. Only then does your first Activity’s <code>onCreate</code> run, <code>setContent</code> builds the UI, and the first frame is drawn.</p>
<p>Once the process exists, all of your app’s steps run on its <em>main thread</em>, the one line of work that also draws the screen and answers taps, so each step waits for the one before. Your own class that extends <code>Application</code> is optional; you name it in the manifest with <code>android:name</code>. Whatever it does in <code>onCreate()</code>, or in its properties, delays every cold start. Create heavy things <code>by lazy</code> instead, the first time they are used.</p>
<p>The whole track meets here: the DEX files are loaded, methods run interpreted or compiled depending on the profile, and every object made is memory the GC will look after.</p>`,
        visual(el) {
          const names = ['process', 'load', 'App', 'Activity', 'frame'];
          const tones = ['muted', 'accent', 'err', 'accent', 'ok'];
          const run = (lane, ms) => { let t = 0; return ms.map((d, k) => ({ lane, from: t, to: (t += d), label: names[k], tone: tones[k] })); };
          const shipped = run(0, [60, 140, 420, 300, 110]);
          Lab.ui.timeline(el, {
            lanes: ['As shipped', 'by lazy', '+ Profile'],
            span: 1100, unit: 'ms',
            predict: {
              q: 'In this app’s cold start, which step takes longest before any fixes?',
              options: ['Creating the process from Zygote', '<code>Application.onCreate</code>, setting up libraries', 'Drawing the first frame'],
              a: 1,
              why: '<code>Application.onCreate</code> runs on the main thread before the first screen, on every cold start. Heavy set-up there is the usual cause of a slow start.',
            },
            frames: [
              { now: 0, say: 'One cold start, step by step. Everything after the process is created runs on the app’s main thread. The times are illustrative.' },
              { bars: shipped.slice(0, 1), say: 'Android copies Zygote into a new process for the app: about the same for every app.' },
              { bars: shipped.slice(1, 2), say: 'Your app’s code is loaded from its DEX files.' },
              { bars: shipped.slice(2, 3), say: '<code>Application.onCreate</code> sets up a search index and a charts library: 420 ms of work for things the first screen doesn’t even show.' },
              { bars: shipped.slice(3), marks: [{ at: 1030, label: '1030', tone: 'err' }], say: 'Then the Activity’s <code>onCreate</code>, <code>setContent</code>, and the first frame: 1030 ms in all.' },
              { bars: run(1, [60, 140, 60, 300, 110]), marks: [{ at: 670, label: '670', tone: 'warm' }], say: 'Create the search index and the charts <code>by lazy</code>, so each is made when first used. <code>onCreate</code> drops to 60 ms: 670 ms.' },
              { bars: run(2, [60, 98, 42, 210, 77]), marks: [{ at: 487, label: '487', tone: 'ok' }], say: 'Add a Baseline Profile and the start-up code is compiled ahead of time at or soon after install, so every step that runs your code gets faster. Creating the process doesn’t: that is Android’s work. 487 ms.' },
            ],
          });
        },
        code: `// NotesApp.kt
class NotesApp : Application() {
    val search by lazy { SearchIndex(this) }   // made the first time search is used

    override fun onCreate() {
        super.onCreate()
        // Runs on every cold start, before the first screen. Keep it short.
    }
}

// AndroidManifest.xml
// <application android:name=".NotesApp" ...>`,
        remember: 'Cold start: process, your code, Application.onCreate, the first Activity, the first frame, one after another on the main thread. Do less there, or do it later.',
        mistakes: [
          { title: 'Measuring a start that isn’t cold', bad: `// Press Home, then tap the icon again: 180 ms
// "Our app starts fast!"`, good: `// End the process first:
adb shell am force-stop com.example.notes
// then tap the icon: now it is a cold start`, why: 'If the process is still alive, Android skips creating it, loading your code and <code>Application.onCreate</code>. People who open your app after the system ended its process get a cold start, so measure that one.' },
        ],
        terms: [
          { term: 'cold start', def: 'A start when the app isn’t running at all, so every step from creating the process to the first frame happens.' },
          { term: 'process', def: 'A running program with its own memory. Android creates one for your app.' },
          { term: 'Zygote', def: 'A process started when the phone boots, with Android’s code loaded. Every app process is a copy of it.' },
          { term: 'main thread', def: 'The one line of work that runs your start-up code and also draws the screen and answers taps.' },
        ],
        challenges: [
          { type: 'blank', prompt: 'Put in the missing words of a cold start.', code: `// 1. Android creates a [[process]] by copying Zygote.
// 2. Android creates your [[Application]] and calls its onCreate().
// 3. Your first Activity’s [[onCreate]] runs and calls setContent.
// 4. The first frame is drawn.`, why: 'The process must exist before any of your code runs. The <code>Application</code> comes before any Activity.' },
          { type: 'bug', prompt: 'The cold start got 400 ms slower, though <code>onCreate</code> is empty. Tap the line to change.', code: `class NotesApp : Application() {
    val search = SearchIndex(this)   // reads every note: 400 ms

    override fun onCreate() {
        super.onCreate()
    }
}`, bug: 1, fix: '    val search by lazy { SearchIndex(this) }', why: 'A property’s value is made when the object is created, and Android creates your <code>Application</code> on every cold start. <code>by lazy</code> waits until <code>search</code> is first used.' },
        ],
        quiz: [
          { q: 'Which order is right for a cold start?', options: ['Activity.onCreate → Application.onCreate → process', 'Process → Application.onCreate → Activity.onCreate → first frame', 'First frame → process → Application.onCreate'], a: 1, why: 'The process comes first, the <code>Application</code> before any Activity, and drawing last.' },
          { q: 'Why does heavy work in <code>Application.onCreate</code> hurt so much?', options: ['It runs on the main thread before the first screen, on every cold start', 'It runs only once, at install', 'It makes the APK bigger'], a: 0, why: 'Every cold start waits for it, and the person sees only a blank window meanwhile.' },
          { q: 'A Baseline Profile speeds up which steps of a cold start?', options: ['Creating the process from Zygote', 'The steps that run your app’s code', 'None of them'], a: 1, why: 'The profile changes how your DEX code runs. Creating the process is Android’s own work.' },
        ],
        docs: [['App startup time', 'https://developer.android.com/topic/performance/vitals/launch-time'], ['The application element', 'https://developer.android.com/guide/topics/manifest/application-element']],
      },
    ],
  });
})();
